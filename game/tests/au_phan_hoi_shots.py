"""AUDIT (phiên au-vu-khi-he): chụp PHẢN HỒI ĐÒN của em bé để so bằng mắt: đánh hụt, trúng thường, chí mạng,
đánh vào mặt khiên (giáp chặn) và vỡ giáp, kết liễu; thêm trúng bằng búa và bằng cung. Chỉ chụp, không sửa game.
Chạy (từ thư mục game):  python3 tests/au_phan_hoi_shots.py   -> docs/review/anh/vu-khi-he/phan-hoi-*.png
Mỗi ảnh là một dải khung hình theo thời gian (cả lớp điểm ảnh và lớp giao diện: số sát thương)."""
import io, os, sys
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(HERE), 'docs', 'review', 'anh', 'vu-khi-he')
ROOT = HERE
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'

LIB = r"""
(() => {
  const T = (window.T = {});
  let inp = {};
  G.botInput = () => Object.assign({ mx: 0, my: 0 }, inp);
  const PRESS = ['atkP', 'dodgeP', 'specialP', 'skillP', 'swapP'];
  T.frame = (i) => { if (i) inp = Object.assign({}, i); G.tick(); G.ui.begin(); G.scene.draw(); G.click = null; for (const q of PRESS) delete inp[q]; };
  T.run = (i, n) => { for (let k = 0; k < n; k++) { T.frame(k === 0 ? i : null); if (T.P) { T.P.inv = 0; T.P.hp = T.P.maxhp; } } };
  T.hold = (i, n) => { for (let k = 0; k < n; k++) { T.frame(i); if (T.P) { T.P.inv = 0; T.P.hp = T.P.maxhp; } } };
  T.room = function (o) {
    o = o || {};
    G.rnd = G.srand(o.seed || 5);
    G.testSave({ hero: o.hero || 'smith', melee: o.melee, lvl: 30, tier: 2, branch: o.el || null, marks: o.el ? 130 : 0 });
    const hs = G.save.heroes[o.hero || 'smith'];
    if (o.cay) hs.ch = { cay: o.cay, n: Object.assign({}, o.n || {}) };
    G.MOVE_TIPS = {};
    G.startStage(o.region == null ? 0 : o.region, 2, 0);
    const S = G.getRun(), W = G.getWorld(), P = S.P;
    W.waves = []; W.spawns = []; W.props = W.props.filter((p) => p.type === 'roomFore'); W.banner = null; S.hint = null;
    if (P.mv) { P.mv.tips = { sword: 1, bow: 1, spear: 1, hammer: 1 }; P.mv.tipWait = null; }
    for (const e of W.ents) e.dead = true;
    W.ents = [];
    inp = {};
    for (let i = 0; i < 8; i++) T.frame({});
    W.banner = null;
    if (o.bow) P.cur = 1;
    P.x = W.geo.cx - (o.left || 50); P.y = W.geo.cy + 6; P.face = 1; P.inv = 0; P.mana = P.maxmana; P.hp = P.maxhp; P.ldx = null; P.ldy = null;
    T.dum = [];
    for (const d of o.dum || []) { const e = G.spawnEnemy(d[2] || 'rusher', P.x + d[0], P.y + d[1], { hpMult: 1e5 }); e.st.root = 1e9; e.inside = true; e.face = d[0] > 0 ? -1 : 1; e.speed = 0; e.cd = 1e9; T.dum.push(e); }
    for (let i = 0; i < 60; i++) T.frame({});
    W.zones = W.zones.filter((z) => z.team === 'player'); W.projs = []; P.mana = P.maxmana; P.cdT = 0; P.specCd = 0; P.skillCd = 0;
    T.W = W; T.P = P;
    return [P.x + (o.shift || 45), P.y - 14];
  };
  T.errs = [];
  window.addEventListener('error', (e) => T.errs.push(String(e.message)));
})();
"""

A = "T.run({ atkP: true, atk: true }, 1); T.run({}, 6)"
SCENES = [
    ('phan-hoi-hut', 'Kiếm đánh HỤT (không quái trong tầm)',
     "() => T.room({ dum: [[120, 0]], shift: 40 })",
     [(A, 'lúc chạm'), ("T.run({}, 3)", '+3 khung'), ("T.run({}, 6)", '+9 khung')]),
    ('phan-hoi-thuong', 'Kiếm trúng THƯỜNG',
     "() => T.room({ dum: [[24, 0]], shift: 20 })",
     [(A, 'lúc chạm'), ("T.run({}, 3)", '+3 khung'), ("T.run({}, 6)", '+9 khung')]),
    ('phan-hoi-chimang', 'Kiếm CHÍ MẠNG',
     "() => { const r = T.room({ dum: [[24, 0]], shift: 20 }); T.P.crit = 1; return r; }",
     [(A, 'lúc chạm'), ("T.run({}, 3)", '+3 khung'), ("T.run({}, 6)", '+9 khung')]),
    ('phan-hoi-giap', 'Kiếm đánh vào MẶT KHIÊN (giáp chặn 45%), rồi VỠ GIÁP',
     "() => T.room({ region: 2, dum: [[24, 0, 'shield']], shift: 20 })",
     [(A, 'trúng giáp'), ("T.run({}, 6)", '+6 khung'), ("T.dum[0].armorHp = 1; T.run({ atkP: true, atk: true }, 1); T.run({}, 12)", 'vỡ giáp'), ("T.run({}, 10)", 'sau vỡ')]),
    ('phan-hoi-ketlieu', 'Kiếm KẾT LIỄU quái',
     "() => { const r = T.room({ dum: [[24, 0]], shift: 20 }); T.dum[0].hp = 1; return r; }",
     [(A, 'lúc chạm'), ("T.run({}, 4)", '+4 khung'), ("T.run({}, 10)", '+14 khung')]),
    ('phan-hoi-bua', 'Búa trúng (nện)',
     "() => T.room({ melee: 'hammer', dum: [[24, 0]], shift: 20 })",
     [("T.run({ atkP: true, atk: true }, 1); T.run({}, 21)", 'lúc chạm'), ("T.run({}, 3)", '+3 khung'), ("T.run({}, 6)", '+9 khung')]),
    ('phan-hoi-cung', 'Cung trúng (bắn thường)',
     "() => T.room({ bow: true, dum: [[70, 0]], shift: 50 })",
     [("T.run({ atkP: true, atk: true }, 1); T.run({}, 16)", 'lúc chạm'), ("T.run({}, 3)", '+3 khung'), ("T.run({}, 6)", '+9 khung')]),
]


def main():
    os.makedirs(OUT, exist_ok=True)
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 960, 'height': 540})
        pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type in ('error', 'warning') and 'ERR_' not in m.text and 'fonts' not in m.text and 'Firebase' not in m.text and 'willReadFrequently' not in m.text else None)
        pg.goto('file://' + ROOT + '/index.html')
        pg.wait_for_function('window.G && G.scene')
        pg.wait_for_timeout(300)
        pg.evaluate("window.requestAnimationFrame = () => 0")
        pg.add_script_tag(path=os.path.join(HERE, 'tests', 'bot.js'))
        pg.add_script_tag(path=os.path.join(HERE, 'tests', 'setup.js'))
        pg.evaluate(LIB)
        F = ImageFont.truetype(FONT, 16)
        only = os.environ.get('CANH')
        for name, title, setup, steps in SCENES:
            if only and name not in only.split(','):
                continue
            cx, cy = pg.evaluate(setup)
            ims = []
            for js, cap in steps:
                pg.evaluate('() => { ' + js + ' }')
                box = pg.evaluate("(() => { const c = document.querySelector('canvas'); const r = c.getBoundingClientRect(); return [r.left, r.top, r.width / 480, G.getWorld().cam]; })()")
                hw, hh = 70, 42
                clip = {'x': box[0] + (cx - box[3] - hw) * box[2], 'y': box[1] + (cy - hh) * box[2], 'width': 2 * hw * box[2], 'height': 2 * hh * box[2]}
                im = Image.open(io.BytesIO(pg.screenshot(clip=clip))).convert('RGB')
                ims.append((im.resize((im.size[0] * 3 // 2, im.size[1] * 3 // 2), Image.NEAREST), cap))
            w, h = ims[0][0].size
            cols = 3
            rows = (len(ims) + cols - 1) // cols
            out = Image.new('RGB', (cols * (w + 8) + 8, 40 + rows * (h + 28)), '#140f10')
            d = ImageDraw.Draw(out)
            d.text((10, 10), title, font=F, fill='#ffd27a')
            for i, (im, cap) in enumerate(ims):
                x, y = 8 + (i % cols) * (w + 8), 36 + (i // cols) * (h + 28)
                out.paste(im, (x, y))
                d.text((x + 4, y + h + 4), str(i + 1) + '. ' + cap, font=F, fill='#f1ead9')
            path = os.path.join(OUT, name + '.png')
            out.save(path)
            print('đã lưu', path)
        js_errs = pg.evaluate('T.errs')
        b.close()
    errs += js_errs
    if errs:
        print('LỖI JS:', *errs[:10], sep='\n  ')
        sys.exit(1)
    print('không có lỗi JS')



if __name__ == '__main__':
    main()
