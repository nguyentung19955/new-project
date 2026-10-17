"""(chép từ do-net/cong-cu/do_tran.py cho net-cao: thêm biến LK_URL = trang cần đo, vd bản web http://…/linh-khi-nhe.html)
ĐO NÉT TRONG TRẬN (headless, KHÔNG chơi thử bằng tay: dựng cảnh bằng lệnh, bấm phím giả theo kịch bản cố định).
Mỗi hình (Cu Tí đứng / chạy / chém × 4 bộ trang phục × 4 vũ khí, mọi quái, tinh anh, trùm các pha, em bé khác, người làng):
  1. Xoá canvas thế giới thành MÀU NỀN THUẦN (#ff00ff), vẽ đúng một hình bằng CHÍNH hàm vẽ của game (G.art.hero có o.p = trong trận,
     G.monsterArt.draw), rồi lấy:
       - canvas thế giới (điểm ảnh thật, 2 điểm / điểm ảnh game)          → <ra>/the/<tên>.png  (+ ×2 = "×4 điểm ảnh game")
       - ảnh chụp màn 844×390 (dpr 3, như iPhone ngang) và 1280×720 (dpr 1) → <ra>/m844/<tên>.png, <ra>/m1280/<tên>.png
  2. Ghi MỌI lệnh drawImage trong lúc vẽ hình đó: ảnh nguồn (tấm nào / canvas phụ), tỉ lệ phóng thật trên canvas đích
     (cỡ đích × phép biến hình ÷ cỡ nguồn), góc xoay, imageSmoothingEnabled, toạ độ góc trên-trái trên điểm ảnh thật (có lẻ không).
  3. Tính chỉ số nét (chi_so.py) trên cả ba ảnh.
Chạy từ đâu cũng được (sau khi build): python3 do_tran.py <thư mục ra> [cờ url, vd '&netcu=1'] [lọc tên, phẩy]
Ra: <ra>/so-lieu.json"""
import base64, io, json, os, sys
from playwright.sync_api import sync_playwright
from PIL import Image
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.normpath(os.path.join(HERE, '..', '..', 'do-net', 'cong-cu')))
from chi_so import do
GAME = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', '..', 'game'))
OUT = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.join(HERE, 'truoc')
CO = sys.argv[2] if len(sys.argv) > 2 else ''
LOC = set(sys.argv[3].split(',')) if len(sys.argv) > 3 and sys.argv[3] else None
URL = os.environ.get('LK_URL', 'file://' + GAME + '/dist/linh-khi.html') + '?cloud=0' + CO
NEN = (255, 0, 255)

GHI = r'''
() => {
  if (window.__GHI) return;
  const P0 = CanvasRenderingContext2D.prototype.drawImage;
  window.__GHI = { bat: false, ds: [] };
  let nCv = 0;
  CanvasRenderingContext2D.prototype.drawImage = function (img) {
    const R = window.__GHI;
    if (R.bat && img && typeof img === 'object' && img.width) {
      try {
        const a = arguments, T = this.getTransform();
        let sx = 0, sy = 0, sw = img.width, sh = img.height, dx, dy, dw, dh;
        if (a.length === 3) { dx = a[1]; dy = a[2]; dw = sw; dh = sh; }
        else if (a.length === 5) { dx = a[1]; dy = a[2]; dw = a[3]; dh = a[4]; }
        else { sx = a[1]; sy = a[2]; sw = a[3]; sh = a[4]; dx = a[5]; dy = a[6]; dw = a[7]; dh = a[8]; }
        if (!img.__ten) img.__ten = (img.tagName === 'CANVAS' ? 'canvas#' + (++nCv) + ' ' + img.width + 'x' + img.height : 'anh ' + img.width + 'x' + img.height);
        const kx = Math.hypot(T.a, T.b), ky = Math.hypot(T.c, T.d);
        const X = T.a * dx + T.c * dy + T.e, Y = T.b * dx + T.d * dy + T.f;
        const dich = this.canvas === document.getElementById('world') ? 'world' : (this.canvas.__ten || (this.canvas.__ten = 'canvas#' + (++nCv) + ' ' + this.canvas.width + 'x' + this.canvas.height));
        R.ds.push({ nguon: img.__ma || img.__ten, dich, px: +(dw * kx / (sw || 1)).toFixed(4), py: +(dh * ky / (sh || 1)).toFixed(4),
          xoay: +(Math.atan2(T.b, T.a) * 180 / Math.PI).toFixed(2), lat: T.a * T.d - T.b * T.c < 0, muot: this.imageSmoothingEnabled,
          X: +X.toFixed(3), Y: +Y.toFixed(3), sx: +(+sx).toFixed(3), sy: +(+sy).toFixed(3) });
      } catch (e) { /* bỏ */ }
    }
    return P0.apply(this, arguments);
  };
}
'''

TEN_ANH = r'''
() => {
  const SC = G.spriteCustom; let n = 0;
  for (const k in SC.ds) { const s = SC.ds[k]; if (s && s.img) { s.img.__ma = k; n++; } }
  for (const k in SC.zed) { const s = SC.zed[k]; if (s && s.img) { s.img.__ma = k; n++; } }
  return n;
}
'''

DUNG = r'''
([loai, bo]) => {
  if (!window.__Q) { window.__Q = { raf: window.requestAnimationFrame }; window.requestAnimationFrame = () => 0; }
  G.testSave({ lvl: 12 }); G.save.sound = false;
  G.ZED_BO_THU = bo && bo !== 'ninja' ? bo : null;
  G.startStage(0, 0, 0, { kind: 'A', seed: 7 });
  const S = G.getRun(), W = S.W, P = W.P;
  S.fade = 0; S.mode = 'play';
  if (W.ents) W.ents.length = 0; if (W.mobs) W.mobs.length = 0; if (W.projs) W.projs.length = 0; W.boss = null;
  P.cur = 0; P.weapons[0].type = loai;
  P.atkT = 0; P.cdT = 0; P.face = 1; P.inv = 999; P.hurtT = 0; P.dodgeT = 0; P.dashT = 0; P.specT = 0; P.castT = 0; P.dead = false;
  P.x = (W.x0 + W.x1) / 2 - 40; P.y = (W.y0 + W.y1) / 2 + 10;
  G.keys = {}; G.keyP = {}; G.pointers.clear();
  for (let i = 0; i < 30; i++) G.tick();
  return true;
}
'''

NHIP = r'''
([giu, bam, n]) => {
  const K = { R: 'ArrowRight', J: 'KeyJ' };
  const W = G.getRun().W;
  for (let i = 0; i < n; i++) {
    G.keys = {}; for (const k of giu.split(',')) if (K[k]) G.keys[K[k]] = true;
    G.keyP = {}; if (i === 0) for (const k of bam.split(',')) if (K[k]) G.keyP[K[k]] = true;
    if (W.ents) W.ents.length = 0;
    G.tick();
  }
  return true;
}
'''

# vẽ một hình lên canvas thế giới trên nền thuần; trả canvas thế giới + danh sách lệnh vẽ
VE = r'''
([kieu, ma, o]) => {
  const wv = document.getElementById('world'), w = G.wx;
  const cv = window.__cv2 || (window.__cv2 = document.createElement('canvas'));
  cv.width = wv.width; cv.height = wv.height; cv.__ten = 'world';
  const c = cv.getContext('2d');
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
  G.wxDat(c, 0, 0, 1); c.imageSmoothingEnabled = false;
  for (const id of ['ui']) { const e = document.getElementById(id); if (e) e.style.visibility = 'hidden'; }
  const R = window.__GHI; R.ds = []; R.bat = true;
  let ok = true;
  try {
    if (kieu === 'tí') {
      const P = G.getRun().W.P;
      const a = Object.assign({}, G.heroArgs(P), { x: 240, y: 170, noShadow: true, alpha: null, flash: false });
      ok = G.art.hero(c, a) !== false;
    } else if (kieu === 'quai') {
      G.monsterArt.draw(c, ma, 240, 170, Object.assign({ anim: 'idle', t: 0.35, face: -1, bao: false, khongBong: true }, o || {}));
    } else if (kieu === 'trum') {
      const s = o && o.s || 1;
      if (s !== 1) { c.save(); c.translate(240, 170); c.scale(s, s); G.monsterArt.draw(c, ma, 0, 0, Object.assign({ anim: 'idle', t: 0.35, face: -1, bao: false, khongBong: true }, o)); c.restore(); }
      else G.monsterArt.draw(c, ma, 240, 170, Object.assign({ anim: 'idle', t: 0.35, face: -1, bao: false, khongBong: true }, o || {}));
    } else if (kieu === 'lang') {
      const sp = G.spriteCustom.get(ma); if (sp) G.spriteCustom.veNguoiLang(c, sp, 240, 170, { anim: 'idle', t: 0.3, face: 1 }); else ok = false;
    }
  } catch (e) { ok = String(e); }
  R.bat = false;
  w.setTransform(1, 0, 0, 1, 0, 0); w.globalAlpha = 1; w.globalCompositeOperation = 'source-over';
  w.fillStyle = '#ff00ff'; w.fillRect(0, 0, wv.width, wv.height); w.drawImage(cv, 0, 0);
  return { ok, ds: R.ds, png: cv.toDataURL('image/png') };
}
'''


def anh(d):
    return Image.open(io.BytesIO(base64.b64decode(d.split(',')[1]))).convert('RGBA')


def bo_nen(im):
    a = np.asarray(im.convert('RGBA')).copy()
    m = (a[..., 0] == NEN[0]) & (a[..., 1] == NEN[1]) & (a[..., 2] == NEN[2])
    a[m] = 0
    # điểm lai màu nền (màn hình phóng không nguyên có thể pha hồng) — coi là viền mờ: giữ nguyên, chi_so tự đếm pha trộn
    return Image.fromarray(a)


def cat(im, pad=4):
    bb = im.getbbox()
    if not bb:
        return im, None
    bb = (max(0, bb[0] - pad), max(0, bb[1] - pad), min(im.width, bb[2] + pad), min(im.height, bb[3] + pad))
    return im.crop(bb), bb


def tom(ds):
    """gộp lệnh vẽ theo nguồn → tỉ lệ phóng, xoay, làm mượt, lẻ toạ độ"""
    g = {}
    for d in ds:
        k = d['nguon'] + ' → ' + d['dich']
        r = g.setdefault(k, {'lan': 0, 'phong': set(), 'xoay': set(), 'muot': set(), 'le': 0})
        r['lan'] += 1
        r['phong'].add('%.3g×%.3g' % (d['px'], d['py']))
        if abs(d['xoay']) > 0.01 and abs(abs(d['xoay']) - 180) > 0.01:
            r['xoay'].add(round(d['xoay']))
        r['muot'].add(d['muot'])
        if abs(d['X'] - round(d['X'])) > 0.01 or abs(d['Y'] - round(d['Y'])) > 0.01:
            r['le'] += 1
    return {k: {'lan': v['lan'], 'phong': sorted(v['phong'])[:6], 'xoay': sorted(v['xoay'])[:6], 'muot': sorted(v['muot']), 'le': v['le']} for k, v in g.items()}


def danh_sach(pg):
    """mọi hình cần đo: (tên, kiểu, mã, tuỳ chọn, chuẩn bị Tí)"""
    q = pg.evaluate(r'''() => { const SC = G.spriteCustom, r = [];
      for (const k in SC.ds) { const s = SC.ds[k]; if (!s) continue; r.push([k, s.doi || s.doi_tuong || '', !!s.ready]); } return r; }''')
    ds = []
    for t in ('dung', 'chay', 'kiem'):
        for bo in ('ninja', 'rung', 'bien', 'lau'):
            ds.append(('ti-%s-%s' % (bo, t), 'tí', None, None, ('sword', bo, t)))
    for vk in ('spear', 'hammer', 'bow'):
        for t in ('dung', 'chem'):
            ds.append(('ti-ninja-%s-%s' % (vk, t), 'tí', None, None, (vk, 'ninja', t)))
    for k, doi, _ in q:
        if doi in ('quai',) or k.startswith('nl-'):
            if k.endswith('-muotcu'):
                continue
            if k.startswith('nl-'):
                ds.append(('lang-' + k, 'lang', k, None, None)); continue
            m = __import__('re').match(r'^(.*)-p([23])$', k)
            if m:
                ds.append(('trum-' + k, 'trum', m.group(1), {'phase': int(m.group(2)), 'anim': 'idle', 's': 0.72 if k == 'hoTinh-p3' else 1}, None))
            else:
                ds.append(('quai-' + k, 'quai', k, None, None))
    for k in ('em-be-healer', 'em-be-hunter', 'em-be-wrestler'):
        pass  # em bé khác: chỉ hiện ở làng / chọn nhân vật, không vào trận cùng Tí → đo trên tấm (do_tam.py)
    return ds


def main():
    os.makedirs(OUT, exist_ok=True)
    for d in ('the', 'the-x4', 'm844', 'm1280'):
        os.makedirs(os.path.join(OUT, d), exist_ok=True)
    errs, kq = [], {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        trang = {}
        for ten, vp, dpr in (('m844', (844, 390), 3), ('m1280', (1280, 720), 1)):
            ctx = b.new_context(viewport={'width': vp[0], 'height': vp[1]}, device_scale_factor=dpr)
            pg = ctx.new_page()
            pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.add_init_script('(' + GHI + ')()')
            pg.goto(URL)
            pg.wait_for_timeout(800)
            pg.add_script_tag(path=os.path.join(GAME, 'tests', 'setup.js'))
            pg.wait_for_function("() => window.G && G.spriteCustom && G.art && G.monsterArt", timeout=60000)
            trang[ten] = pg
        pg0 = trang['m1280']
        ds = danh_sach(pg0)
        if LOC:
            ds = [x for x in ds if any(l in x[0] for l in LOC)]
        # nạp hết ảnh (ảnh rời tải sau) trên cả hai trang
        for pg in trang.values():
            pg.evaluate("() => { const SC = G.spriteCustom; for (const k in SC.ds) SC.canAnh && SC.canAnh(k); for (const k of ['zed-moi','zed-vk','zed-rung','zed-bien','zed-lau']) SC.canAnh && SC.canAnh(k); }")
            pg.wait_for_function("() => { const SC = G.spriteCustom; for (const k in SC.ds) { const s = SC.ds[k]; if (s && (s.doi === 'quai' || /^nl-/.test(k)) && !s.ready) { SC.canAnh && SC.canAnh(k); return false; } } for (const k of ['zed-moi','zed-vk','zed-rung','zed-bien','zed-lau']) { const z = SC.zed[k]; if (!z || !z.ready) { SC.canAnh && SC.canAnh(k); return false; } } return true; }", timeout=120000)
            pg.evaluate(TEN_ANH)
            # bản web: vào ải lần đầu chờ ảnh vùng về (vòng lặp game còn chạy) — vào thử một lần trước khi dừng vòng lặp
            pg.evaluate("() => { G.testSave({ lvl: 12 }); G.save.sound = false; G.startStage(0, 0, 0, { kind: 'A', seed: 7 }); }")
            pg.wait_for_function("() => G.getRun && G.getRun() && G.getRun().W", timeout=60000)
            pg.wait_for_timeout(1500)
        for ten, kieu, ma, o, ti in ds:
            r0 = None
            for tp, pg in trang.items():
                if ti:
                    loai, bo, t = ti
                    pg.evaluate(DUNG, [loai, bo])
                    if t == 'chay':
                        pg.evaluate(NHIP, ['R', '', 14])
                    elif t in ('kiem', 'chem'):
                        # chém nhát 1: dừng ở khung ★ (lúc chạm) — bấm J rồi chạy tới nửa đòn
                        pg.evaluate(NHIP, ['J', 'J', 1]); pg.evaluate(NHIP, ['', '', 6 if loai != 'hammer' else 16])
                    else:
                        pg.evaluate(NHIP, ['', '', 10])
                if ti:  # lần vẽ đầu chỉ để ảnh bản to (tải lười) kịp nạp, như trong game (làng vẽ trước khi vào trận)
                    pg.evaluate(VE, [kieu, ma, o]); pg.wait_for_timeout(1500)
                r = pg.evaluate(VE, [kieu, ma, o])
                if r['ok'] is not True:
                    errs.append('%s %s: %s' % (ten, tp, r['ok']))
                if tp == 'm1280':
                    r0 = r
                    the = anh(r['png'])
                    c_, bb = cat(the)
                    c_.save(os.path.join(OUT, 'the', ten + '.png'))
                    c_.resize((c_.width * 2, c_.height * 2), Image.NEAREST).save(os.path.join(OUT, 'the-x4', ten + '.png'))
                # ảnh chụp màn: vùng canvas thế giới quanh hình
                el = pg.query_selector('#world').bounding_box()
                sc = el['width'] / 960.0
                x0, y0 = el['x'] + (240 * 2 - 140) * sc, el['y'] + (170 * 2 - 220) * sc
                png = pg.screenshot(clip={'x': x0, 'y': y0, 'width': 280 * sc, 'height': 260 * sc})
                m = bo_nen(Image.open(io.BytesIO(png)))
                c2, _ = cat(m)
                c2.save(os.path.join(OUT, tp, ten + '.png'))
                kq.setdefault(ten, {})[tp] = do(c2) if tp == 'm1280' else None
            kq[ten]['the'] = do(c_)
            kq[ten]['lenh'] = tom(r0['ds'])
            kq[ten]['kieu'] = kieu
            kq[ten]['co_the'] = [c_.width, c_.height]
            print('%-28s NHOE the %6.2f  m844 %6.2f  m1280 %6.2f' % (ten, kq[ten]['the']['NHOE'] if kq[ten]['the'] else -1,
                  -1, kq[ten]['m1280']['NHOE'] if kq[ten]['m1280'] else -1), flush=True)
        b.close()

    def fl(x):
        if isinstance(x, dict):
            return {k: fl(v) for k, v in x.items()}
        if isinstance(x, (list, tuple)):
            return [fl(v) for v in x]
        if isinstance(x, (np.floating, np.integer)):
            return float(x)
        return x
    json.dump({'url': URL, 'loi': errs, 'hinh': fl(kq)}, open(os.path.join(OUT, 'so-lieu.json'), 'w'), ensure_ascii=False, indent=1)
    print('lỗi:', errs[:10])


main()
