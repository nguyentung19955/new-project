"""(Bản chép từ ../../cu-ti-to-muot/quay.py cho vẽ tay 8 đợt 1: thêm chạy cầm thương / búa / phi tiêu.)
Quay GIF headless mọi động tác Cu Tí trong trận (KHÔNG chơi thử bằng tay: bấm phím giả theo kịch bản cố định, nhịp logic 60/giây).
Chạy từ thư mục game sau khi build:
  python3 ../docs/review/ke-hoach-cai-thien/cu-ti-to-muot/quay.py <thư mục ra> [cờ url, vd '&cotiTo=0&muot2=0'] [tên động tác,...]
Ra (mỗi động tác <ten>):
  <ten>.gif        cỡ thật: cắt quanh Cu Tí trên canvas thế giới (2 điểm ảnh canvas / điểm ảnh game, đúng như trên điện thoại cỡ ~1x)
  <ten>-x3.gif     cùng cảnh phóng ×3 (điểm ảnh game → 3 điểm ảnh, NEAREST)
  <ten>-dai.png    dải từng NHỊP (1/60 s) vẽ riêng Cu Tí trên nền trong (×2) — để soát khung giật / lệch tâm / vũ khí nhảy góc
  so-lieu.json     mỗi nhịp: hàng ảnh + khung (G.zedMoi.chon), tâm thân, chân, x thật, góc vũ khí (khoaVe) — để đo chân trượt / bật
  dien-thoai-<ten>.gif  cả màn 480×270 phóng 844×475 (cỡ màn điện thoại ngang) cho vài động tác chính
"""
import base64, io, json, os, sys
from playwright.sync_api import sync_playwright
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', '..', 'game'))
OUT = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.join(HERE, 'gif')
CO = sys.argv[2] if len(sys.argv) > 2 else ''
CHI = set(sys.argv[3].split(',')) if len(sys.argv) > 3 and sys.argv[3] else None
URL = 'file://' + GAME + '/dist/linh-khi.html?cloud=0' + CO

# Kịch bản: (tên, loại vũ khí, [(số nhịp, phím giữ, phím bấm, js thêm)]) — phím: R=phải, L=trái, J=đánh, K=lộn, Lc=đặc biệt, I=chưởng, Q=đổi, W=đi chậm (cần nửa)
KB = [
    ('dung', 'sword', [(96, '', '', '')]),
    ('di', 'sword', [(80, 'W', '', '')]),
    ('chay', 'sword', [(80, 'R', '', '')]),
    ('chay-thuong', 'spear', [(80, 'R', '', '')]),
    ('chay-bua', 'hammer', [(80, 'R', '', '')]),
    ('chay-phitieu', 'bow', [(80, 'R', '', '')]),
    ('lon', 'sword', [(6, '', '', ''), (1, '', 'K', ''), (30, '', '', '')]),
    ('trung-don', 'sword', [(6, '', '', ''), (1, '', '', 'dau'), (30, '', '', '')]),
    ('chuong', 'sword', [(6, '', '', ''), (1, '', '', 'cast'), (40, '', '', '')]),
    ('kiem-1-3', 'sword', [(6, '', '', ''), (6, 'J', 'J', ''), (24, '', '', ''), (6, 'J', 'J', ''), (24, '', '', ''), (6, 'J', 'J', ''), (60, '', '', '')]),
    ('thuong', 'spear', [(6, '', '', ''), (6, 'J', 'J', ''), (30, '', '', ''), (6, 'J', 'J', ''), (30, '', '', ''), (6, 'J', 'J', ''), (30, '', '', ''), (6, 'J', 'J', ''), (60, '', '', '')]),
    ('thuong-giu', 'spear', [(6, '', '', ''), (50, 'J', 'J', ''), (50, '', '', '')]),
    ('bua', 'hammer', [(6, '', '', ''), (6, 'J', 'J', ''), (70, '', '', '')]),
    ('bua-giu', 'hammer', [(6, '', '', ''), (60, 'J', 'J', ''), (60, '', '', '')]),
    ('phi-tieu', 'bow', [(6, '', '', ''), (6, 'J', 'J', ''), (30, '', '', ''), (6, 'J', 'J', ''), (40, '', '', '')]),
    ('phi-tieu-ngam', 'bow', [(6, '', '', ''), (55, 'J', 'J', ''), (50, '', '', '')]),
    ('chay-chem', 'sword', [(20, 'R', '', ''), (6, 'R,J', 'J', ''), (24, 'R', '', ''), (6, 'R,J', 'J', ''), (24, 'R', '', ''), (30, 'R', '', ''), (30, '', '', '')]),
    ('chay-nguoc-chem', 'sword', [(20, 'L', '', 'matPhai'), (6, 'L,J', 'J', 'matPhai'), (40, 'L', '', ''), (20, '', '', '')]),
    ('db-kiem', 'sword', [(6, '', '', ''), (1, '', 'Lc', 'mana'), (50, '', '', '')]),
    ('db-thuong', 'spear', [(6, '', '', ''), (1, '', 'Lc', 'mana'), (60, '', '', '')]),
    ('db-bua', 'hammer', [(6, '', '', ''), (1, '', 'Lc', 'mana'), (50, '', '', '')]),
    ('db-phitieu', 'bow', [(6, '', '', ''), (1, '', 'Lc', 'mana'), (50, '', '', '')]),
    ('doi-vk', 'sword', [(10, '', '', ''), (1, '', 'Q', ''), (30, '', '', ''), (1, '', 'Q', ''), (30, '', '', '')]),
    ('chuyen', 'sword', [(20, 'R', '', ''), (40, '', '', ''), (6, 'J', 'J', ''), (30, '', '', ''), (20, 'R', '', ''), (1, 'R', 'K', ''), (20, '', '', ''), (30, 'L', '', ''), (40, '', '', '')]),
    ('chet', 'sword', [(4, '', '', ''), (1, '', '', 'chet'), (60, '', '', '')]),
]
DIEN_THOAI = {'dung', 'chay', 'kiem-1-3', 'lon', 'chay-chem', 'bua'}

DUNG = r'''
([loai]) => {
  if (!window.__Q) {
    window.__Q = { raf: window.requestAnimationFrame };
    window.requestAnimationFrame = () => 0; // dừng vòng lặp thật: mỗi nhịp do kịch bản gọi G.tick()
  }
  G.testSave({ lvl: 12 }); G.save.sound = false;
  G.startStage(0, 0, 0, { kind: 'A', seed: 7 }); // mỗi động tác một ải mới (động tác chết không làm hỏng cảnh sau)
  const S = G.getRun(), W = S.W, P = W.P;
  S.fade = 0; S.mode = 'play';
  if (W.ents) W.ents.length = 0; if (W.mobs) W.mobs.length = 0; if (W.projs) W.projs.length = 0;
  W.boss = null;
  for (const w of P.weapons) { w.marks = { fire: 0, poison: 0, ice: 0 }; w.branch = null; }
  // vũ khí 1 = món cần quay, vũ khí 2 = món khác (đổi vũ khí)
  P.cur = 0; P.weapons[0].type = loai; if (P.weapons[1]) P.weapons[1].type = loai === 'sword' ? 'spear' : 'sword';
  P.atkT = 0; P.cdT = 0; P.face = 1; P.inv = 0; P.hurtT = 0; P.dodgeT = 0; P.dashT = 0; P.specT = 0; P.castT = 0; P.dead = false; P.deadT = 0;
  P.hp = P.maxhp; P.mana = P.maxMana || 100; P.specCd = 0; P.dodgeCd = 0; P.swapCd = 0; P.moving = false;
  if (P.mv) { P.mv.holding = false; P.mv.name = ''; P.mv.kind = ''; }
  P.x = (W.x0 + (W.px1 != null ? W.px1 : W.x1)) / 2 - 40; P.y = (W.y0 + W.y1) / 2 + 10;
  W.cam = Math.max(0, P.x - 200);
  G.keys = {}; G.keyP = {}; G.pointers.clear();
  for (let i = 0; i < 30; i++) G.tick();
  return [P.x, P.y];
}
'''

NHIP = r'''
([giu, bam, them, chup]) => {
  const S = G.getRun(), W = S.W, P = W.P;
  const K = { R: 'ArrowRight', L: 'ArrowLeft', J: 'KeyJ', K: 'KeyK', Lc: 'KeyL', I: 'KeyI', Q: 'KeyQ' };
  G.keys = {}; G.pointers.clear();
  for (const k of giu.split(',')) if (K[k]) G.keys[K[k]] = true;
  if (giu.split(',').includes('W')) G.pointers.set(999, { id: 999, role: 'joy', sx: 80, sy: 200, x: 80 + 24 * 0.45, y: 200, stale: false });
  G.keyP = {}; for (const k of bam.split(',')) if (K[k]) G.keyP[K[k]] = true;
  if (them === 'cast') P.castT = 0.3; // chưởng: chỉ đặt đồng hồ tung chưởng (hình), không cần mở khoá chưởng
  if (them === 'mana') { P.mana = 999; P.specCd = 0; }
  if (them === 'matPhai') P.face = 1;
  if (them === 'dau') { P.inv = 0; G.hurtPlayer(1, null, null, true); }
  if (them === 'chet') { P.inv = 0; P.hp = 1; P.revive = 0; if (S.revives != null) S.revives = 0; G.hurtPlayer(9999, null, null, true); }
  const keyP = G.keyP;
  if (W.ents) W.ents.length = 0; // không để quái sinh ra
  G.tick();
  G.keyP = keyP;
  // vẽ khung
  G.nsAlpha = 1; G.scene.draw();
  const D = G.spriteCustom.zed['zed-moi'];
  const a = G.heroArgs(P);
  let s = null; try { s = G.zedMoi.chon(Object.assign({}, a), D.tep); } catch (e) { s = null; }
  let kv = null; try { kv = G.zedMoi.khoaVe(Object.assign({}, a)); } catch (e) { kv = null; }
  const cam = G.camVe ? G.camVe(W) : W.cam;
  const out = { x: P.x, y: P.y, sx: P.x - cam, sy: P.y, face: P.face, ten: s && s.ten, i: s && s.i, eo: s && s.eo ? s.eo.i : null, theo: s && s.theo ? s.theo.ten + ':' + s.theo.i : null, kv, t: G.time, atk: a.atk, mv: P.mv ? P.mv.kind : '' };
  if (chup) {
    out.the = document.getElementById('world').toDataURL('image/png');
    // Cu Tí riêng trên nền trong (×2 = canvas thật), chân ở (60, 74) điểm ảnh game
    const cv = window.__cv || (window.__cv = document.createElement('canvas'));
    cv.width = 240; cv.height = 200;
    const q = cv.getContext('2d'); q.setTransform(1, 0, 0, 1, 0, 0); q.clearRect(0, 0, 240, 200); q.setTransform(2, 0, 0, 2, 0, 0); q.imageSmoothingEnabled = false;
    G.art.hero(q, Object.assign({}, a, { x: 60, y: 74, noShadow: true, alpha: null, flash: false }));
    out.rieng = cv.toDataURL('image/png');
  }
  return out;
}
'''


def anh(d):
    return Image.open(io.BytesIO(base64.b64decode(d.split(',')[1]))).convert('RGBA')


def do_rieng(im):
    """tâm thân (cột trung bình) + đáy chân + khung bao của phần đục"""
    a = im.getchannel('A')
    bb = a.getbbox()
    if not bb:
        return None
    w, h = im.size
    px = a.load()
    sx = n = 0
    for y in range(bb[1], bb[3]):
        for x in range(bb[0], bb[2]):
            if px[x, y] > 128:
                sx += x; n += 1
    # bàn chân chạm đất: các đoạn điểm đục liền nhau ở 3 hàng đáy (điểm ảnh game, gốc x = chân Cu Tí lúc vẽ riêng = 60)
    cot = sorted({x for y in range(max(0, bb[3] - 3), bb[3]) for x in range(bb[0], bb[2]) if px[x, y] > 128})
    doan, d0 = [], None
    for i, x in enumerate(cot):
        if d0 is None: d0 = x
        if i + 1 == len(cot) or cot[i + 1] > x + 2:
            doan.append([round(d0 / 2 - 60, 1), round(x / 2 - 60, 1)]); d0 = None
    return {'bb': bb, 'cx': round(sx / max(1, n) / 2, 2), 'day': bb[3] / 2, 'chan': doan}


def main():
    os.makedirs(OUT, exist_ok=True)
    errs = []
    so = {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 960, 'height': 540})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'ERR_' not in m.text and 'fonts.g' not in m.text else None)
        pg.goto(URL)
        pg.wait_for_timeout(800)
        pg.add_script_tag(path=os.path.join(GAME, 'tests', 'setup.js'))
        pg.wait_for_function("() => { const z = G.spriteCustom && G.spriteCustom.zed; if (!z) return false; for (const k of ['zed-moi','zed-vk']) { const q = z[k]; if (q && !q.ready && G.spriteCustom.canAnh) G.spriteCustom.canAnh(k); if (!q || !q.ready) return false; } return true; }", timeout=60000)
        pg.evaluate(DUNG, ['sword'])
        pg.wait_for_timeout(1500)
        for ten, loai, ds in KB:
            if CHI and ten not in CHI:
                continue
            pg.evaluate(DUNG, [loai])
            khung, dt, rieng, sl = [], [], [], []
            k = 0
            for nhip, giu, bam, them in ds:
                for j in range(nhip):
                    r = pg.evaluate(NHIP, [giu, bam if j == 0 else '', them if j == 0 or them in ('matPhai',) else '', True])
                    the = anh(r.pop('the'))
                    ri = anh(r.pop('rieng'))
                    m = do_rieng(ri)
                    r['do'] = m
                    sl.append(r)
                    rieng.append(ri)
                    # cắt quanh Cu Tí, theo vị trí màn hình (điểm ảnh canvas = 2 × game)
                    cx, cy = int(round(r['sx'] * 2)), int(round(r['sy'] * 2))
                    cr = the.crop((cx - 120, cy - 150, cx + 120, cy + 40))
                    if k % 2 == 0:
                        khung.append(cr)
                        if ten in DIEN_THOAI:
                            dt.append(the.resize((844, 475), Image.NEAREST))
                    k += 1
            so[ten] = sl
            khung[0].save(os.path.join(OUT, ten + '.gif'), save_all=True, append_images=khung[1:], duration=33, loop=0, disposal=2)
            x3 = [im.resize((im.width * 3 // 2, im.height * 3 // 2), Image.NEAREST) for im in khung]
            x3[0].save(os.path.join(OUT, ten + '-x3.gif'), save_all=True, append_images=x3[1:], duration=33, loop=0, disposal=2)
            if dt:
                dt[0].save(os.path.join(OUT, 'dien-thoai-' + ten + '.gif'), save_all=True, append_images=dt[1:], duration=33, loop=0)
            # dải từng nhịp: 10 cột, mỗi ô = vùng quanh Cu Tí ở cỡ canvas thật (2 điểm ảnh / điểm ảnh game), số nhịp + hàng ảnh ghi ở góc
            cot, W, H = 10, 160, 140
            hang = (len(rieng) + cot - 1) // cot
            dai = Image.new('RGBA', (cot * W, hang * H), (40, 44, 52, 255))
            from PIL import ImageDraw
            for i, im in enumerate(rieng):
                bg = Image.new('RGBA', (W, H), (46 + (i % 2) * 12, 50, 60, 255))
                bg.alpha_composite(im.crop((40, 18, 40 + W, 18 + H)))
                ImageDraw.Draw(bg).text((2, 1), '%d %s%s' % (i, (sl[i]['ten'] or '')[:9], '' if sl[i]['i'] is None else sl[i]['i']), fill=(255, 230, 140, 255))
                dai.paste(bg, ((i % cot) * W, (i // cot) * H))
            dai.save(os.path.join(OUT, ten + '-dai.png'))
            print(ten, len(sl), 'nhịp', flush=True)
        print('lỗi zedMoi:', pg.evaluate('() => G.zedMoi.loi'))
        b.close()
    with open(os.path.join(OUT, 'so-lieu.json'), 'w') as f:
        json.dump(so, f, ensure_ascii=False)
    print('LỖI JS:', errs[:10] if errs else 'không')


if __name__ == '__main__':
    main()
