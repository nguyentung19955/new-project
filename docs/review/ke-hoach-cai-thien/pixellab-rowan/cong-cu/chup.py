#!/usr/bin/env python3
"""Chụp headless 844×390 (như iPhone xoay ngang) Rowan PixelLab trong ải 1-1 với từng vũ khí: đứng, đi, đánh, đặc biệt; cạnh bản cũ ?rowancu=1.
python3 chup.py <game/dist> <thư mục ra>    → <ra>/ai-1-1-<loai>.png (toàn màn), <ra>/so-sanh-<loai>.png (cắt quanh Rowan ×2), chup.json (lỗi trang)"""
import io, json, os, subprocess, sys, time
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, *['..'] * 5))
TESTS = os.path.join(ROOT, 'game', 'tests')
SRV = os.path.join(ROOT, 'docs', 'review', 'kiem-thu-12-10', 'srv.py')
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 11)
TAI = {}
LOAI = [x for x in [('kiem', 'sword'), ('thuong', 'spear'), ('bua', 'hammer'), ('phitieu', 'bow')] if x[0] in os.environ.get('LOAI', 'kiem,thuong,bua,phitieu')]
LIB = r'''(() => {
  const T = (window.T = {}); let inp = {};
  G.botInput = () => Object.assign({ mx: 0, my: 0 }, inp);
  const PRESS = ['atkP', 'dodgeP', 'specialP', 'skillP', 'swapP'];
  T.frame = (i) => { if (i) inp = Object.assign({}, i); G.tick(); G.ui.begin(); G.scene.draw(); G.click = null; for (const q of PRESS) delete inp[q]; };
  T.hold = (i, n) => { for (let k = 0; k < n; k++) { T.frame(i); if (T.P) { T.P.inv = 0; T.P.hp = T.P.maxhp; } } };
  T.errs = []; window.addEventListener('error', (e) => T.errs.push(String(e.message)));
})()'''
VAO = r'''([melee, bow, cap, he]) => {
  G.rnd = G.srand(5);
  G.testSave({ hero: 'smith', melee, lvl: 30, tier: 2, branch: he || null, marks: he ? 130 : 0 });
  G.MOVE_TIPS = {};
  G.startStage(0, 0, 0);
}'''
VAO2 = r'''([melee, bow, cap, he]) => {
  window.requestAnimationFrame = () => 0;
  const S = G.getRun(), W = G.getWorld(), P = S.P;
  W.waves = []; W.spawns = []; W.banner = null; S.hint = null;
  if (P.mv) { P.mv.tips = { sword: 1, bow: 1, spear: 1, hammer: 1 }; P.mv.tipWait = null; }
  for (const e of W.ents) e.dead = true; W.ents = [];
  for (let i = 0; i < 8; i++) T.frame({});
  if (bow) P.cur = 1;
  const w = G.curW(P); if (cap != null && G.vkMoi) G.vkMoi.datCap(w, cap, he);
  P.x = W.geo.cx - 30; P.y = W.geo.cy + 6; P.face = 1; P.mana = P.maxmana;
  for (let i = 0; i < 30; i++) T.frame({});
  T.W = W; T.P = P; return [w.type, G.wStage(w)];
}'''


def cat(pg):
    b = pg.evaluate("(() => { const c = document.querySelector('canvas'); const r = c.getBoundingClientRect(); const W = G.getWorld(); return [r.left, r.top, r.width / 480, W.cam, T.P.x, T.P.y]; })()")
    hw, hh = 50, 38
    clip = {'x': b[0] + (b[4] - b[3] - hw) * b[2], 'y': b[1] + (b[5] - 16 - hh) * b[2], 'width': 2 * hw * b[2], 'height': 2 * hh * b[2]}
    return Image.open(io.BytesIO(pg.screenshot(clip=clip))).convert('RGB')


def mo(b, port, co, errs):
    pg = b.new_page(viewport={'width': 844, 'height': 390}, device_scale_factor=1, is_mobile=True, has_touch=True)
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
    pg.on('request', lambda r: TAI.setdefault(co or 'mac-dinh', set()).add(r.url.split('/anh/')[1].split('.')[0]) if '/anh/zed-' in r.url else None)
    pg.goto('http://127.0.0.1:%d/linh-khi-nhe.html?cloud=0%s' % (port, co))
    pg.wait_for_function('window.G && G.scene', timeout=90000)
    pg.add_script_tag(path=os.path.join(TESTS, 'bot.js'))
    pg.add_script_tag(path=os.path.join(TESTS, 'setup.js'))
    pg.evaluate(LIB)
    return pg


def cho(pg, l, cu):
    ma = ['zed-rowan', 'zed-vk'] if cu else ['zed-rowan', 'zed-rowan-pl-' + l, 'zed-rowan-pl-hao']
    pg.wait_for_function("(ds) => { const SC = G.spriteCustom, z = SC && SC.zed; for (const m of ds) { const q = z && z[m]; if (q && !q.ready && SC.canAnh) SC.canAnh(m); if (!(q && q.ready)) return false; } return true; }", arg=ma, timeout=180000)


def main():
    dist, ra = sys.argv[1], sys.argv[2]
    os.makedirs(ra, exist_ok=True)
    s1 = subprocess.Popen([sys.executable, SRV, dist, '8851'], stderr=subprocess.DEVNULL)
    time.sleep(1)
    errs, anh, kq = [], {}, {}
    try:
        with sync_playwright() as p:
            b = p.chromium.launch()
            for cu, co in ((0, ''), (1, '&rowancu=1')):
                for l, melee in LOAI:
                    for cap, he in ((0, None), (3, 'fire')):
                        pg = mo(b, 8851, co, errs)
                        arg = [melee if melee != 'bow' else 'sword', melee == 'bow', cap, he]
                        pg.evaluate(VAO, arg)
                        pg.wait_for_function('() => !!G.getRun()', timeout=180000)
                        pg.wait_for_timeout(2500)
                        pg.evaluate(VAO2, arg)
                        cho(pg, l, cu)
                        pg.evaluate("T.hold({}, 20)")
                        tag = (cu, l, cap)
                        if cap == 0 and not cu:
                            pg.screenshot(path=os.path.join(ra, 'ai-1-1-%s.png' % l))
                        anh[tag + ('dung',)] = cat(pg)
                        pg.evaluate("T.hold({mx: 1}, 14)"); anh[tag + ('chay',)] = cat(pg)
                        pg.evaluate("T.hold({}, 25); T.hold({atkP: true, atk: true}, 1); T.hold({}, %d)" % (9 if melee == 'hammer' else 5))
                        anh[tag + ('danh',)] = cat(pg)
                        pg.evaluate("T.hold({}, 40); T.P.mana = T.P.maxmana; T.P.specCd = 0; T.hold({specialP: true}, 1); T.hold({}, 8)")
                        anh[tag + ('dacbiet',)] = cat(pg)
                        pg.evaluate("T.hold({}, 40); T.P.face = -1; T.hold({mx: -1}, 3); T.hold({}, 20)")
                        anh[tag + ('trai',)] = cat(pg)
                        errs += pg.evaluate('T.errs')
                        pg.close()
            b.close()
    finally:
        s1.kill()
    cot = ['dung', 'chay', 'danh', 'dacbiet', 'trai']
    for l, _ in LOAI:
        w, h = anh[(0, l, 0, 'dung')].size
        W2, H2 = w * 2, h * 2
        g = Image.new('RGB', (len(cot) * (W2 + 4) + 4, 4 * (H2 + 18) + 4), (20, 16, 18)); d = ImageDraw.Draw(g)
        for r, (cu, cap, ten) in enumerate([(0, 0, 'PixelLab · Trắng'), (0, 3, 'PixelLab · Thức tỉnh Lửa'), (1, 0, 'Cũ ?rowancu=1 · Trắng'), (1, 3, 'Cũ · Thức tỉnh Lửa')]):
            for i, c in enumerate(cot):
                x, y = 4 + i * (W2 + 4), 4 + r * (H2 + 18)
                g.paste(anh[(cu, l, cap, c)].resize((W2, H2), Image.NEAREST), (x, y))
                d.text((x + 3, y + H2 + 2), '%s · %s' % (ten, c), font=F, fill=(255, 210, 122))
        g.save(os.path.join(ra, 'so-sanh-%s.png' % l))
    kq = {'loi_trang': errs, 'anh_zed_da_tai': {k: sorted(v) for k, v in TAI.items()}}
    json.dump(kq, open(os.path.join(ra, 'chup.json'), 'w'), ensure_ascii=False, indent=1)
    print(json.dumps(kq, ensure_ascii=False))
    return 1 if errs else 0


if __name__ == '__main__':
    sys.exit(main())
