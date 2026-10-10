"""Chụp ảnh NHÂN VẬT, QUÁI, TRÙM và hiệu ứng chiến đấu (Giai đoạn 3, phiên dt-nhan-vat) để tự xem bằng mắt:
em bé + quái từng vùng, lấy đà / ra đòn / trúng đòn / chết, nhịp độc và cháy, khựng hình, vùng nguy hiểm (sắp nổ và đang
gây sát thương), trùm từng vùng, Trảm Nguyệt, thanh máu trên đầu quái to. Mỗi cảnh là một dải khung theo thời gian.
Chạy (từ thư mục game):  python3 tests/nhan_vat_shots.py [thư mục ra] [thư mục game khác, để chụp bản cũ]
Mặc định lưu vào docs/vfx/anh-nhan-vat/. Chọn cảnh: CANH=quai-rung,vung python3 tests/nhan_vat_shots.py
In ra lỗi JS nếu có (thoát mã 1). Cần Playwright và Pillow."""
import io, os, sys
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(HERE), 'docs', 'vfx', 'anh-nhan-vat')
ROOT = sys.argv[2] if len(sys.argv) > 2 else HERE
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'

LIB = r"""
(() => {
  const T = (window.T = {});
  T.inp = {};
  G.botInput = () => Object.assign({ mx: 0, my: 0 }, T.inp);
  const PRESS = ['atkP', 'dodgeP', 'specialP', 'skillP', 'swapP'];
  T.keep = () => { const S = G.getRun(); if (!S) return; const P = S.P; P.hp = P.maxhp; P.dead = false; S.W.over = null; };
  T.frame = (i) => { if (i) T.inp = Object.assign({}, i); G.tick(); G.ui.begin(); G.scene.draw(); G.click = null; for (const q of PRESS) delete T.inp[q]; T.keep(); };
  T.run = (n, i) => { for (let k = 0; k < n; k++) T.frame(k === 0 ? i : null); T.inp = {}; };
  T.hold = (n, i) => { for (let k = 0; k < n; k++) T.frame(i); T.inp = {}; };
  // Đứng yên cho dễ so viền và vành sáng: em bé + 5 quái của vùng r đứng thành hàng, không cử động
  T.hang = function (r) { const c = T.vao(r, { seed: 13 }); const roles = ['rusher', 'shield', 'archer', 'spiky', 'bomber', 'nimble']; roles.forEach((ro, i) => { const e = T.coc(ro, -66 + i * 24 + (i > 2 ? 24 : 0), i % 2 ? 24 : -2); }); T.run(3); return c; };
  T.clean = () => { const S = G.getRun(), W = G.getWorld(), P = S.P; if (P.mv) { P.mv.tips = { sword: 1, bow: 1, spear: 1, hammer: 1 }; P.mv.tipWait = null; } W.banner = null; S.hint = null; };
  // Một phòng trống của vùng r; em bé đứng giữa phòng. o.melee: vũ khí cận chiến
  T.vao = function (r, o) {
    o = o || {};
    G.pointers.clear();
    G.testSave({ hero: o.hero || 'smith', melee: o.melee, lvl: 14, tier: 2 });
    G.rnd = G.srand(o.seed || 7);
    G.startStage(r, 2, 0);
    const S = G.getRun(), W = G.getWorld(), P = S.P;
    W.waves = []; W.spawns = []; W.props = W.props.filter((p) => p.type === 'roomFore'); W.banner = null; S.hint = null;
    for (const e of W.ents) e.dead = true;
    W.ents = [];
    T.clean();
    for (let i = 0; i < 8; i++) T.frame({});
    P.x = W.geo ? W.geo.cx : 240; P.y = W.geo ? W.geo.cy + 10 : 170; P.face = 1; P.inv = 0;
    for (let i = 0; i < 30; i++) T.frame({});
    W.zones = W.zones.filter((z) => z.team === 'player'); W.projs = [];
    T.W = W; T.P = P; T.clean();
    return [P.x, P.y - 12];
  };
  T.quai = function (role, dx, dy, o) {
    const P = T.P, e = G.spawnEnemy(role, P.x + dx, P.y + dy, Object.assign({ hpMult: 60 }, o || {}));
    e.inside = true; e.spawnT = 0; if (e.an && e.an.n === 'spawn') e.an = { n: 'idle', t: 0, spd: 1 };
    return e;
  };
  T.coc = function (role, dx, dy, o) { const e = T.quai(role, dx, dy, o); e.speed = 0; e.cd = 1e9; e.skCd = 1e9; e.spikeCd = 1e9; e.diveCd = 1e9; e.healCd = 1e9; e.sumCd = 1e9; e.face = dx > 0 ? -1 : 1; return e; };
  T.errs = [];
  window.addEventListener('error', (e) => T.errs.push(String(e.message)));
})();
"""

# Cảnh: tên, tiêu đề, mã dựng (trả về tâm [x, y]), [mã JS trước mỗi lần chụp, nhãn], (nửa rộng, nửa cao) khung chụp
def quai_vung(r, ten):
    return ('quai-' + ['rung', 'bien', 'laudai'][r], 'Em bé và quái ' + ten + ': đứng, đi, lấy đà, ra đòn, trúng đòn',
            "() => { const c = T.vao(%d, { seed: 11 }); T.quai('rusher', 70, -10); T.quai('shield', -70, 6); T.quai('archer', 40, -50); T.quai('spiky', -40, 40); T.quai('swarm', 90, 30); return c; }" % r,
            [("T.run(20)", 'đứng / đi tới'), ("T.run(16)", ''), ("T.run(14, { atkP: true, atk: true })", 'em bé đánh'), ("T.run(10)", ''), ("T.run(14, { atkP: true, atk: true })", 'trúng đòn'), ("T.run(16)", '')], (115, 64))


SCENES = [
    ('vien', 'Viền tối và vành sáng mép trên: em bé và quái ba vùng đứng yên (Rừng già, Hang biển, Lâu đài cổ)',
     "() => T.hang(0)",
     [("", 'Rừng già'), ("T.hang(1)", 'Hang biển'), ("T.hang(2)", 'Lâu đài cổ')], (75, 40)),
    quai_vung(0, 'Rừng già'), quai_vung(1, 'Hang biển'), quai_vung(2, 'Lâu đài cổ'),
    ('lay-da', 'Quái lấy đà rồi ra đòn (tinh anh, giáp, xông tới): lấy đà kéo dài, ra đòn nhanh, giữ, thu chậm',
     "() => { const c = T.vao(0, { seed: 3 }); T.e1 = T.quai('elite', 46, -6, { art: 'heoNanh' }); T.e2 = T.quai('shield', -44, 4); T.e3 = T.quai('rusher', 30, 34); return c; }",
     [("T.run(26)", ''), ("T.run(8)", ''), ("T.run(8)", ''), ("T.run(8)", ''), ("T.run(8)", ''), ("T.run(8)", '')], (100, 56)),
    ('chet', 'Quái chết (ba vùng): ngã, tan, bụi chạm đất',
     "() => { const c = T.vao(1, { seed: 5 }); T.ds = [T.coc('rusher', 40, -8), T.coc('shield', -40, 0), T.coc('bomber', 10, 36), T.coc('kami', 60, 26)]; T.run(6); return c; }",
     [("for (const e of T.ds) { e.hp = 1; G.damage(e, 50, { el: null }); } T.run(1)", 'vừa chết'), ("T.run(5)", ''), ("T.run(8)", ''), ("T.run(10)", ''), ("T.run(14)", ''), ("T.run(20)", 'đã tan')], (90, 50)),
    ('doc-chay', 'Nhịp sát thương độc (trái) và cháy (phải): không chớp trắng cả người, nhuộm màu hệ',
     "() => { const c = T.vao(0, { seed: 9 }); T.a = T.coc('rusher', -30, 0); T.b = T.coc('shield', 40, 0); G.applyStatus(T.a, 'poison', 50, 4); G.applyStatus(T.b, 'fire', 50, 1); T.run(10); return [c[0] + 5, c[1]]; }",
     [("T.run(6)", 'giữa hai nhịp'), ("T.a.st.tick = 0.001; T.b.st.tick = 0.001; T.run(1)", 'nhịp: khung 1'), ("T.run(1)", 'khung 2'), ("T.run(2)", 'khung 4'), ("T.run(4)", 'khung 8'), ("T.run(10)", 'sau nhịp')], (70, 40)),
    ('khung-hinh', 'Khựng hình khi trúng đòn (búa): chỉ chớp trắng khung đầu, sau đó nhạt',
     "() => { const c = T.vao(2, { seed: 4, melee: 'hammer' }); T.d = T.coc('rusher', 22, 0); T.d2 = T.coc('elite', 34, 22, { art: 'tuongMa' }); T.run(4); return [c[0] + 20, c[1] + 4]; }",
     [("T.hold(1, { atkP: true, atk: true }); for (let k = 0; k < 40 && !(T.d.flash > 0); k++) T.frame({})", 'trúng'), ("T.run(1)", 'khựng 1'), ("T.run(1)", 'khựng 2'), ("T.run(2)", 'khựng 4'), ("T.run(3)", 'hết khựng'), ("T.run(8)", 'hồi')], (66, 44)),
    ('vung', 'Vùng nguy hiểm: báo trước (đỏ mịn, đầy dần) khác vùng đang gây sát thương (vũng có viền nóng đập theo nhịp)',
     "() => { const c = T.vao(0, { seed: 2 }); const P = T.P; G.zoneCircle(P.x + 50, P.y - 10, 24, 0.5, 1, 'poison', { then: 4 }); G.zoneCircle(P.x - 50, P.y + 8, 22, 0.5, 1, 'fire', { then: 4 }); T.z3 = G.zoneCircle(P.x + 5, P.y + 40, 20, 1.4, 1, null, {}); return [c[0], c[1] + 10]; }",
     [("T.run(14)", 'báo trước'), ("T.run(17)", 'nổ: chớp'), ("T.run(8)", 'vũng hiện ra'), ("T.run(20)", 'đang gây sát thương'), ("T.run(15)", 'nhịp đập'), ("T.run(170)", 'sắp tắt')], (100, 58)),
    ('tram-nguyet', 'Trảm Nguyệt (kiếm, chiêu đặc biệt): vệt chém bay xuyên quái',
     "() => { const c = T.vao(0, { seed: 6, melee: 'sword' }); T.coc('rusher', 60, 0); T.coc('swarm', 100, 6); return [c[0] + 45, c[1]]; }",
     [("T.run(3, { specialP: true })", 'ra chiêu'), ("T.run(3)", ''), ("T.run(3)", ''), ("T.run(4)", ''), ("T.run(5)", ''), ("T.run(8)", '')], (100, 50)),
    ('mau-quai-to', 'Thanh máu mảnh trên đầu quái to (hoa bào tử, tinh anh, quái giáp): không chạm hình',
     "() => { const c = T.vao(0, { seed: 8 }); T.ds = [T.coc('archer', -50, 0), T.coc('elite', 10, -4, { art: 'namPhongChua' }), T.coc('shield', 64, 6)]; T.run(4); for (const e of T.ds) G.damage(e, e.maxhp * 0.3, {}); T.run(2); return [c[0] + 5, c[1] - 10]; }",
     [("T.run(10)", ''), ("T.run(30)", ''), ("const W = T.W; G.startStage; T.run(1)", '')], (100, 52)),
]
for r, ten in enumerate(['Rừng già', 'Hang biển', 'Lâu đài cổ']):
    SCENES.append(('trum-' + ['rung', 'bien', 'laudai'][r], 'Trùm ' + ten + ': ra chiêu, trúng đòn, vùng nguy hiểm',
                   """() => { G.pointers.clear(); G.testSave({ lvl: 16 }); G.rnd = G.srand(3); G.startStage(%d, 4, 0); const S = G.getRun(); G.gotoRoom(S.map.rooms.findIndex((x) => x.type === 'boss'));
                     const W = G.getWorld(), P = S.P, b = W.boss; T.W = W; T.P = P; T.b = b; T.clean(); for (let k = 0; k < Math.ceil(b.intro * 60) + 20; k++) T.frame({}); T.clean();
                     P.x = W.x0 + 70; P.y = W.y1 - 40; b.x = (W.x0 + W.x1) / 2 + 20; b.y = (W.y0 + W.y1) / 2; return [(W.x0 + W.x1) / 2, (W.y0 + W.y1) / 2 + 4]; }""" % r,
                   [("T.run(30)", ''), ("T.run(30)", ''), ("T.P.x = T.b.x - 26; T.P.y = T.b.y + 4; T.P.face = 1; T.run(4, { atkP: true, atk: true })", 'trúng đòn'), ("T.run(40)", ''), ("T.run(40)", ''), ("T.run(40)", '')], (150, 84)))


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
        for name, title, setup, steps, (hw, hh) in SCENES:
            if only and name not in only.split(','):
                continue
            cx, cy = pg.evaluate(setup)
            ims = []
            for js, cap in steps:
                pg.evaluate('() => { ' + js + ' }')
                box = pg.evaluate("(() => { const c = document.querySelector('canvas'); const r = c.getBoundingClientRect(); return [r.left, r.top, r.width / 480, G.getWorld().cam || 0]; })()")
                x0 = max(0, cx - box[3] - hw)
                clip = {'x': box[0] + x0 * box[2], 'y': box[1] + max(0, cy - hh) * box[2], 'width': 2 * hw * box[2], 'height': 2 * hh * box[2]}
                im = Image.open(io.BytesIO(pg.screenshot(clip=clip))).convert('RGB')
                k = 3 if hw <= 75 else 2 if hw <= 100 else 1.5
                ims.append((im.resize((int(im.size[0] * k / 2), int(im.size[1] * k / 2)), Image.NEAREST), cap))
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
        js_errs = pg.evaluate('T.errs') + (pg.evaluate('G.fx && G.fx.errs ? [G.fx.lastErr] : []'))
        b.close()
    errs += js_errs
    if errs:
        print('LỖI JS:', *errs[:10], sep='\n  ')
        sys.exit(1)
    print('không có lỗi JS')


if __name__ == '__main__':
    main()
