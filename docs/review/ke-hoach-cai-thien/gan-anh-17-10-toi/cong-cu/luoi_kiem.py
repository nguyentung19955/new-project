"""LƯỚI KIẾM VUÔNG THEO HỆ TRÊN TAY CU TÍ (17/10 tối). KHÔNG chơi thử: bot headless dựng phòng trống, đặt kiếm (hệ, cấp, cấp Luyện),
bấm J theo kịch bản cố định (như kiem-nang/quay.py) và vẽ Cu Tí bằng hàm vẽ thật G.art.hero (×3, nền trong):
  mỗi ô = 2 dáng: đứng cầm kiếm | nhát 3 chém ngang (★, u ≈ 0,5).
Hàng: Lửa / Độc / Băng × cột Mầm / Thành hình / Thức tỉnh; hàng cuối: kiếm "gân" (Trắng Luyện 2, Mầm Luyện 4, Thành hình Luyện 7) + Trắng.
Chạy (từ gốc repo, sau build):  python3 docs/review/ke-hoach-cai-thien/gan-anh-17-10-toi/cong-cu/luoi_kiem.py <ra.png> [cờ url]"""
import base64, io, os, sys
from PIL import Image, ImageDraw, ImageFont
FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 15)
from playwright.sync_api import sync_playwright

GOC = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', '..'))
RA = sys.argv[1]
CO = sys.argv[2] if len(sys.argv) > 2 else ''
DUNG = r'''
([el, cap, luyen]) => {
  if (!window.__Q) { window.__Q = 1; window.requestAnimationFrame = () => 0; }
  G.testSave({ lvl: 12 }); G.save.sound = false;
  G.startStage(0, 0, 0, { kind: 'A', seed: 7 });
  const S = G.getRun(), W = S.W, P = W.P;
  S.fade = 0; S.mode = 'play';
  if (W.ents) W.ents.length = 0; if (W.mobs) W.mobs.length = 0; if (W.projs) W.projs.length = 0;
  W.boss = null;
  for (const w of P.weapons) { w.marks = { fire: 0, poison: 0, ice: 0 }; w.branch = null; }
  P.cur = 0; P.weapons[0].type = 'sword';
  const w = P.weapons[0];
  if (luyen) { w.luyen = luyen; const ht = G.luyen.hinhThai(luyen); if (G.vkMoi && G.vkMoi.datCap) G.vkMoi.datCap(w, ht, ht > 0 ? 'fire' : null); }
  else if (cap > 0) { w.marks[el] = G.MARKS[cap - 1]; w.branch = el; }
  P.atkT = 0; P.cdT = 0; P.face = 1; P.inv = 0; P.hurtT = 0; P.dodgeT = 0; P.dashT = 0; P.specT = 0; P.castT = 0; P.dead = false;
  P.hp = P.maxhp; P.mana = 999; P.moving = false;
  if (P.mv) { P.mv.holding = false; P.mv.name = ''; P.mv.kind = ''; }
  P.x = (W.x0 + (W.px1 != null ? W.px1 : W.x1)) / 2; P.y = (W.y0 + W.y1) / 2 + 10;
  G.keys = {}; G.keyP = {}; G.pointers.clear();
  for (let i = 0; i < 40; i++) G.tick();
  return { st: G.wStage(w), gan: !!(G.vkGan && G.vkGan(w, G.wStage(w))), luyen: G.luyen && G.luyen.cap ? G.luyen.cap(w) : null };
}
'''
NHIP = r'''
([bam]) => {
  const S = G.getRun(), W = S.W, P = W.P;
  G.keys = {}; G.pointers.clear(); G.keyP = {};
  if (bam) { G.keys.KeyJ = true; G.keyP.KeyJ = true; }
  if (W.ents) W.ents.length = 0; if (W.mobs) W.mobs.length = 0;
  const keyP = G.keyP; G.tick(); G.keyP = keyP; G.keys = {};
  const a = G.heroArgs(P);
  const cv = window.__cv || (window.__cv = document.createElement('canvas'));
  const sc = 3; cv.width = 110 * sc; cv.height = 80 * sc;
  const c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
  c.setTransform(sc, 0, 0, sc, 0, 0); c.imageSmoothingEnabled = false;
  G.art.hero(c, Object.assign({}, a, { x: 40, y: 68, noShadow: true, alpha: null, flash: false, to: 1 }));
  return { u: a.atk, combo: P.comboI, atk: P.atkT > 0, png: cv.toDataURL('image/png') };
}
'''
KB = [(10, 0)] + [(1, 1), (23, 0)] * 2 + [(1, 1), (40, 0)]


def png(s):
    return Image.open(io.BytesIO(base64.b64decode(s.split(',')[1]))).convert('RGBA')


def hai_dang(pg, el, cap, luyen=0):
    info = pg.evaluate(DUNG, [el, cap, luyen])
    for _ in range(25):
        pg.evaluate(NHIP, [0]); pg.wait_for_timeout(25)
    dung = png(pg.evaluate(NHIP, [0])['png'])
    best, chem = 9, None
    so = 0
    for n, bam in KB:
        for j in range(n):
            r = pg.evaluate(NHIP, [bam if j == 0 else 0])
            if bam and j == 0: so += 1
            if so == 3 and r['atk'] and r['u'] is not None and abs(r['u'] - 0.5) < best:
                best = abs(r['u'] - 0.5); chem = png(r['png'])
    return info, dung, chem


def main():
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--allow-file-access-from-files'])
        pg = b.new_page(viewport={'width': 960, 'height': 540})
        pg.route('http*://**', lambda r: r.abort())
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + GOC + '/game/dist/linh-khi.html?cloud=0' + CO)
        pg.wait_for_timeout(800)
        pg.add_script_tag(path=os.path.join(GOC, 'game', 'tests', 'setup.js'))
        pg.wait_for_function("() => { const z = G.spriteCustom && G.spriteCustom.zed; if (!z) return false; for (const k of ['zed-moi','zed-vk','zed-vk-he','zed-vk-gan']) { const q = z[k]; if (q && !q.ready && G.spriteCustom.canAnh) G.spriteCustom.canAnh(k); if (!q || !q.ready) return false; } return true; }", timeout=90000)
        o = []
        for el in ('fire', 'poison', 'ice'):
            o.append([hai_dang(pg, el, c) for c in (1, 2, 3)])
        o.append([hai_dang(pg, None, 0, lv) for lv in (2, 4, 7)] + [hai_dang(pg, None, 0)])
        b.close()
    cw, ch = 330 * 2 + 10, 240 + 34
    T = Image.new('RGBA', (cw * 4 + 10, ch * 4 + 40), (36, 40, 48, 255))
    d = ImageDraw.Draw(T)
    d.text((10, 8), 'Kiếm vuông trên tay Cu Tí ×3 (game thật, headless) %s — mỗi ô: đứng | nhát 3 ★' % (CO or 'mặc định'), fill=(230, 230, 230), font=FONT)
    HANG = ['Lửa', 'Độc', 'Băng', 'Gân / Trắng']
    COT = [['Mầm', 'Thành hình', 'Thức tỉnh']] * 3 + [['gân Trắng (Luyện 2)', 'gân Mầm (Luyện 4)', 'gân Thành hình (Luyện 7)', 'Trắng (ảnh thường)']]
    for i, row in enumerate(o):
        for j, (info, dung, chem) in enumerate(row):
            x, y = 10 + j * cw, 40 + i * ch
            d.text((x, y), '%s · %s  (cấp hình %s%s)' % (HANG[i], COT[i][j], info['st'], ', gân' if info['gan'] else ''), fill=(240, 220, 140), font=FONT)
            T.alpha_composite(dung, (x, y + 18))
            if chem: T.alpha_composite(chem, (x + 335, y + 18))
    T.save(RA)
    print('ghi', RA, 'lỗi trang:', errs or 'không có')


main()
