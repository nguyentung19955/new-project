"""Chụp ảnh hiệu ứng KỸ NĂNG (Phase 3 VFX) để tự xem bằng mắt: chưởng, tích lực, bắn tên, trúng độc, vũng độc,
vùng báo trước đòn quái. Mỗi cảnh là một dải khung hình theo thời gian (đủ cả lớp điểm ảnh và lớp giao diện).
Chạy (từ thư mục game):  python3 tests/vfx_ky_nang_shots.py [thư mục ra] [thư mục game khác, để chụp bản cũ]
Mặc định lưu vào docs/vfx/anh-ky-nang/. In ra lỗi JS nếu có (thoát mã 1). Cần Playwright và Pillow."""
import io, os, sys
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(HERE), 'docs', 'vfx', 'anh-ky-nang')
ROOT = sys.argv[2] if len(sys.argv) > 2 else HERE
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

# Mỗi cảnh: tên, tiêu đề, mã dựng cảnh (trả về tâm khung [x, y]), danh sách bước [mã JS chạy trước khi chụp, nhãn]
SCENES = [
    ('chuong-hoa', 'Hỏa chưởng: bắn, bay, nổ, vệt cháy',
     "() => T.room({ cay: 'hoa', n: { luc: 3, no: 3, vet: 3 }, dum: [[70, 0], [84, 14]] })",
     [("T.run({ skillP: true }, 3)", 'ra tay'), ("T.run({}, 6)", 'đang bay'), ("T.run({}, 5)", 'nổ'), ("T.run({}, 6)", 'đỉnh'), ("T.run({}, 14)", 'tan'), ("T.run({}, 30)", 'vệt cháy')]),
    ('chuong-tich', 'Hỏa chưởng tích lực (chưởng mạnh nhất)',
     "() => T.room({ cay: 'hoa', n: { luc: 5, no: 5, vet: 5, dai: 3, tich: 3 }, dum: [[80, 0], [92, 14], [96, -12]] })",
     [("T.hold({ skillP: true, skill: true }, 1); T.hold({ skill: true }, 20)", 'tích 1/3'), ("T.hold({ skill: true }, 40)", 'tích đầy'), ("T.run({}, 4)", 'thả'), ("T.run({}, 6)", 'nổ'), ("T.run({}, 6)", 'đỉnh'), ("T.run({}, 16)", 'tan')]),
    ('chuong-doc', 'Độc chưởng: luồng độc, mây độc, nhịp độc',
     "() => T.room({ cay: 'doc', n: { luc: 3, may: 3, tach: 3 }, dum: [[70, 0], [84, 14]] })",
     [("T.run({ skillP: true }, 4)", 'ra tay'), ("T.run({}, 6)", 'đang bay'), ("T.run({}, 5)", 'trúng'), ("T.run({}, 14)", 'mây'), ("T.run({}, 30)", 'nhịp độc'), ("T.run({}, 70)", 'tan dần')]),
    ('chuong-bang', 'Băng chưởng: mũi băng xuyên, vòng băng',
     "() => T.room({ cay: 'bang', n: { luc: 3, xuyen: 3, phong: 2 }, dum: [[50, 0], [76, 0], [102, 0]] })",
     [("T.run({ skillP: true }, 3)", 'ra tay'), ("T.run({}, 4)", 'đang bay'), ("T.run({}, 4)", 'xuyên'), ("T.run({}, 6)", 'vòng băng'), ("T.run({}, 8)", 'đỉnh'), ("T.run({}, 20)", 'tan')]),
    ('ban-ten', 'Bắn tên: chạm nhanh (tên thường)',
     "() => T.room({ hero: 'hunter', bow: true, dum: [[110, 0]], shift: 55 })",
     [("T.hold({ atk: true, atkP: true }, 1); T.hold({ atk: true }, 4)", 'giương'), ("T.run({}, 3)", 'buông'), ("T.run({}, 3)", 'đang bay'), ("T.run({}, 3)", 'gần'), ("T.run({}, 3)", 'trúng'), ("T.run({}, 5)", 'tan')]),
    ('ban-ten-to', 'Bắn tên: giữ lâu (tên lớn)',
     "() => T.room({ hero: 'hunter', bow: true, dum: [[110, 0]], shift: 55 })",
     [("T.hold({ atk: true, atkP: true }, 1); T.hold({ atk: true }, 30)", 'giương'), ("T.run({}, 2)", 'buông'), ("T.run({}, 3)", 'đang bay'), ("T.run({}, 3)", 'gần'), ("T.run({}, 3)", 'trúng'), ("T.run({}, 6)", 'tan')]),
    ('ban-ten-doc', 'Bắn tên hệ Độc',
     "() => T.room({ hero: 'hunter', bow: true, el: 'poison', dum: [[110, 0]], shift: 55 })",
     [("T.hold({ atk: true, atkP: true }, 1); T.hold({ atk: true }, 30)", 'giương'), ("T.run({}, 2)", 'buông'), ("T.run({}, 3)", 'đang bay'), ("T.run({}, 3)", 'gần'), ("T.run({}, 3)", 'trúng'), ("T.run({}, 6)", 'tan')]),
    ('trung-doc', 'Trúng độc: lúc dính, hào quang, nhịp sát thương, 5 tầng',
     "() => T.room({ dum: [[60, 0], [100, 0, 'elite']], shift: 80 })",
     [("G.applyStatus(T.dum[0], 'poison', 50, 1); T.run({}, 2)", 'vừa dính'), ("T.run({}, 14)", '1 tầng'), ("G.applyStatus(T.dum[1], 'poison', 50, 5); T.run({}, 20)", '5 tầng'), ("T.run({}, 12)", 'trôi chậm'), ("for (const e of T.dum) e.st.tick = 0.001; T.run({}, 2)", 'nhịp độc'), ("T.run({}, 10)", 'sau nhịp')]),
    ('vung-doc', 'Vũng độc của quái (trái) và vũng hồi máu (phải) để so màu',
     "() => { const r = T.room({ shift: 70 }); const W = T.W, P = T.P; P.x -= 30; G.zoneCircle(P.x + 70, P.y, 26, 0.02, 1, 'poison', { then: 6 }); W.zones.push({ shape: 'circle', x: P.x + 140, y: P.y, r: 24, t: 0, pool: true, heal: true, team: 'player', life: 6, tick: 1 }); return [P.x + 105, P.y - 6]; }",
     [("T.run({}, 4)", 'nổ'), ("T.run({}, 10)", 'loang'), ("T.run({}, 30)", 'sống'), ("T.run({}, 30)", 'sống 2'), ("T.run({}, 30)", 'sống 3'), ("T.run({}, 220)", 'sắp tắt')]),
    ('nguoi-doc', 'Em bé trúng độc: nhịp mất máu',
     "() => { const r = T.room({ shift: 0 }); T.P.st.poison = 4; T.P.dot = 3; return [T.P.x, T.P.y - 10]; }",
     [("T.run({}, 10)", ''), ("T.run({}, 10)", ''), ("T.P.dotT = 0.001; T.run({}, 2)", 'nhịp'), ("T.run({}, 6)", ''), ("T.run({}, 10)", ''), ("T.run({}, 10)", '')]),
    ('dia-chan', 'Địa Chấn (búa, chiêu đặc biệt) và Nổ lan (vòng phép lửa)',
     "() => T.room({ melee: 'hammer', el: 'fire', dum: [[40, 0], [56, 12], [60, -10]], shift: 30 })",
     [("T.run({ specialP: true }, 8)", 'nện'), ("T.run({}, 6)", 'đỉnh'), ("T.run({}, 10)", 'lan'), ("T.run({}, 14)", 'tan'), ("for (const e of T.dum) G.applyStatus(e, 'fire', 50, 1); T.dum[0].hp = 1; G.damage(T.dum[0], 99, { el: 'fire' }); T.run({}, 4)", 'nổ lan'), ("T.run({}, 10)", 'tan')]),
    ('bao-truoc', 'Báo trước đòn quái: lấp dần, sáng lên trước khi ra đòn, mũi chỉ hướng, chớp, huỷ thì mờ dần',
     "() => { T.room({ shift: 60 }); const P = T.P; T.mk = (dy) => { const z = { shape: 'cone', x: P.x + 20, y: P.y + dy, ang: 0, r: 80, span: 0.9, t: 1.2, t0: 1.2, dmg: 0, life: 0.12, el: null }; const l = { shape: 'line', x: P.x + 20, y: P.y + 26 + dy, ang: 0, len: 90, w: 14, t: 1.2, t0: 1.2, dmg: 0, life: 0.12, el: 'fire' }; T.W.zones.push(z, l); return [z, l]; }; T.zz = T.mk(-6); P.y += 40; return [P.x - 40 + 60, P.y - 40 - 6 + 4]; }",
     [("T.run({}, 20)", 'u = 0,28'), ("T.run({}, 30)", 'u = 0,7'), ("T.run({}, 16)", 'u = 0,92 sáng lên'), ("T.run({}, 7)", 'ra đòn: chớp'), ("T.run({}, 14)", 'đã tắt'), ("T.zz = T.mk(-6); T.run({}, 30); for (const z of T.zz) { z.src = { dead: true }; z.cancel = true; } T.run({}, 3)", 'quái chết: huỷ, mờ dần')]),
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
        js_errs = pg.evaluate('T.errs') + (pg.evaluate('G.fx.errs ? [G.fx.lastErr] : []'))
        b.close()
    errs += js_errs
    if errs:
        print('LỖI JS:', *errs[:10], sep='\n  ')
        sys.exit(1)
    print('không có lỗi JS')


if __name__ == '__main__':
    main()
