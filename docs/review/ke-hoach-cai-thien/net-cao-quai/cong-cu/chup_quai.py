"""CHỤP QUÁI / TRÙM / NGƯỜI LÀNG ở nét 2 | 3 | 4 (headless, KHÔNG chơi thử: vẽ từng hình bằng CHÍNH hàm vẽ của game lên nền thuần).
Mỗi nét mở trang <url>?cloud=0[&netcao=N] ở màn 844×390 dpr 3 (iPhone ngang). Hình vẽ ở giữa canvas thế giới; nét cao: vẽ một lần để game
tải lười ảnh "tam_n<N>", chờ về, vẽ lại. Ra (<ra>/):
  the-n<N>/<tên>.png   canvas thế giới thật (đã cắt quanh hình)
  m844-n<N>/<tên>.png  ảnh chụp màn (vùng quanh hình)
  so-lieu.json         lỗi JS từng trang, ảnh nét cao đã về chưa, lệnh vẽ dùng ảnh nào
  python3 chup_quai.py <url trang (không có ?)> <ra> [nét, vd 2,3,4] [lọc tên, phẩy]"""
import base64, io, json, os, sys
import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', '..', 'game'))
URL = sys.argv[1]
OUT = os.path.abspath(sys.argv[2]); os.makedirs(OUT, exist_ok=True)
NETS = [int(x) for x in (sys.argv[3] if len(sys.argv) > 3 else '2,3,4').split(',')]
LOC = set(sys.argv[4].split(',')) if len(sys.argv) > 4 and sys.argv[4] else None

GHI = r'''() => {
  const P0 = CanvasRenderingContext2D.prototype.drawImage;
  window.__GHI = { bat: false, ds: [] };
  CanvasRenderingContext2D.prototype.drawImage = function (img) {
    const R = window.__GHI;
    if (R.bat && img && img.width) R.ds.push([img.width, img.height, (img.src || '').slice(-40)]);
    return P0.apply(this, arguments);
  };
}'''

VE = r'''([kieu, ma, o]) => {
  if (!window.__Q) { window.__Q = 1; window.requestAnimationFrame = () => 0; } // dừng vòng lặp game: chỉ vẽ bằng lệnh
  G.setNet(G.netMuon());
  const wv = document.getElementById('world'), w = G.wx;
  const cv = window.__cv2 || (window.__cv2 = document.createElement('canvas'));
  cv.width = wv.width; cv.height = wv.height;
  const c = cv.getContext('2d');
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
  G.wxDat(c, 0, 0, 1); c.imageSmoothingEnabled = false;
  const ui = document.getElementById('ui'); if (ui) ui.style.visibility = 'hidden';
  const SC = G.spriteCustom, R = window.__GHI; R.ds = []; R.bat = true;
  let ok = true;
  try {
    if (kieu === 'quai') G.monsterArt.draw(c, ma, 240, 200, Object.assign({ anim: 'idle', t: 0.35, face: -1, bao: false, khongBong: true }, o || {}));
    else if (kieu === 'trum') {
      const s = (o && o.s) || 1;
      c.save(); c.translate(240, 200); c.scale(s, s); G.monsterArt.draw(c, ma, 0, 0, Object.assign({ anim: 'idle', t: 0.35, face: -1, bao: false, khongBong: true }, o)); c.restore();
    } else if (kieu === 'lang') { const sp = SC.get(ma); if (sp) SC.veNguoiLang(c, sp, 240, 200, { anim: 'idle', t: 0.3, face: 1 }); else ok = 'chưa có ảnh'; }
    else if (kieu === 'em') { const sp = SC.ds[ma]; if (sp && sp.ready) { c.save(); c.translate(240, 200); SC.veKhung(c, sp, 'idle', 0, 1, {}); c.restore(); } else ok = 'chưa có ảnh'; }
  } catch (e) { ok = String(e && e.stack || e); }
  R.bat = false;
  w.setTransform(1, 0, 0, 1, 0, 0); w.globalAlpha = 1; w.globalCompositeOperation = 'source-over';
  w.fillStyle = '#3a3e4a'; w.fillRect(0, 0, wv.width, wv.height); w.drawImage(cv, 0, 0);
  const sp = SC.ds[o && o.sp || ma], hi = sp && sp['_n' + G.NET];
  return { ok, net: G.NET, hi: hi ? (hi.ready ? 've' : hi.hong ? 'hong' : 'dang-tai') : 'khong', ds: R.ds.slice(0, 6), png: cv.toDataURL('image/png') };
}'''

DS = r'''() => { const SC = G.spriteCustom, r = []; for (const k in SC.ds) { const s = SC.ds[k]; if (s) r.push([k, s.doi || '']); } return r; }'''


def danh_sach(q):
    import re
    out = []
    for k, doi in q:
        if k.endswith('-muotcu') or k.endswith('-netcu'):
            continue
        if doi == 'nguoi-lang':
            out.append(('lang-' + k, 'lang', k, None))
        elif doi == 'em-be':
            out.append(('em-' + k, 'em', k, None))
        elif doi == 'quai':
            m = re.match(r'^(.*)-p([23])$', k)
            if m:
                out.append(('trum-' + k, 'trum', m.group(1), {'phase': int(m.group(2)), 's': 0.72 if k == 'hoTinh-p3' else 1, 'sp': k}))
            else:
                out.append(('quai-' + k, 'quai', k, {'sp': k}))
    return sorted(out)


def anh(d):
    return Image.open(io.BytesIO(base64.b64decode(d.split(',')[1]))).convert('RGBA')


def main():
    loi, kq = {}, {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        for N in NETS:
            ctx = b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=3)
            pg = ctx.new_page()
            e = loi.setdefault('n%d' % N, [])
            pg.on('pageerror', lambda x, e=e: e.append(str(x)))
            pg.on('console', lambda m, e=e: e.append('console: ' + m.text) if m.type == 'error' else None)
            pg.add_init_script('(' + GHI + ')()')
            pg.goto(URL + '?cloud=0' + ('&netcao=%d' % N if N != 2 else ''))
            pg.wait_for_timeout(800)
            pg.add_script_tag(path=os.path.join(GAME, 'tests', 'setup.js'))
            pg.wait_for_function("() => window.G && G.spriteCustom && G.monsterArt", timeout=60000)
            pg.evaluate("() => { const SC = G.spriteCustom; for (const k in SC.ds) SC.canAnh && SC.canAnh(k); }")
            pg.wait_for_function("() => { const SC = G.spriteCustom; for (const k in SC.ds) { const s = SC.ds[k]; if (s && !/-(muotcu|netcu)$/.test(k) && !s.ready) { SC.canAnh && SC.canAnh(k); return false; } } return true; }", timeout=180000)
            pg.evaluate("() => { G.testSave({ lvl: 12 }); G.save.sound = false; G.startStage(0, 0, 0, { kind: 'A', seed: 7 }); }")
            pg.wait_for_timeout(1500)
            pg.evaluate("() => { window.__Q = 1; window.requestAnimationFrame = () => 0; }"); pg.wait_for_timeout(300)  # dừng vòng lặp game trước lần vẽ đầu
            ds = danh_sach(pg.evaluate(DS))
            if LOC:
                ds = [x for x in ds if any(l in x[0] for l in LOC)]
            os.makedirs(os.path.join(OUT, 'the-n%d' % N), exist_ok=True); os.makedirs(os.path.join(OUT, 'm844-n%d' % N), exist_ok=True)
            for ten, kieu, ma, o in ds:
                r = pg.evaluate(VE, [kieu, ma, o])
                if N > 2:
                    for _ in range(60):
                        if r['hi'] != 'dang-tai':
                            break
                        pg.wait_for_timeout(250); r = pg.evaluate(VE, [kieu, ma, o])
                if r['ok'] is not True:
                    e.append('%s: %s' % (ten, r['ok']))
                the = anh(r['png'])
                # cắt quanh điểm chân (240, 200) theo điểm GAME: rộng 200, cao 190 → cùng vùng ở mọi nét
                box = [int(v * N) for v in (140, 15, 340, 205)]
                the.crop(box).save(os.path.join(OUT, 'the-n%d' % N, ten + '.png'))
                el = pg.query_selector('#world').bounding_box(); sc = el['width'] / 480.0
                png = pg.screenshot(clip={'x': el['x'] + 140 * sc, 'y': el['y'] + 15 * sc, 'width': 200 * sc, 'height': 190 * sc})
                Image.open(io.BytesIO(png)).save(os.path.join(OUT, 'm844-n%d' % N, ten + '.png'))
                kq.setdefault(ten, {})['n%d' % N] = {'hi': r['hi'], 'net': r['net'], 'ds': r['ds']}
                print('n%d %-26s %s %s' % (N, ten, r['hi'], '' if r['ok'] is True else r['ok']), flush=True)
            ctx.close()
        b.close()
    json.dump({'url': URL, 'loi': loi, 'hinh': kq}, open(os.path.join(OUT, 'so-lieu.json'), 'w'), ensure_ascii=False, indent=1)
    print('lỗi:', {k: v[:5] for k, v in loi.items()})


main()
