"""Chụp ảnh TRƯỚC/SAU cho vùng báo trước đòn (docs/bao-truoc-muot/).
Mỗi cảnh dựng giống hệt nhau (cùng hạt giống ngẫu nhiên, cùng số khung), chụp phóng to quanh vùng báo.
Chạy:
  python3 tests/bao_truoc_shots.py chup <thư mục game> <thư mục ra>     chụp từng cảnh thành <tên>.png
  python3 tests/bao_truoc_shots.py ghep <thư mục ảnh trước> <thư mục ảnh sau>   ghép truoc-sau.png
  python3 tests/bao_truoc_shots.py gif <thư mục game cũ> <thư mục game mới>    GIF muot.gif (trước | sau)
Cần Playwright và Pillow."""
import io, os, sys
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright
from quai_lib import LIB

HERE = os.path.dirname(os.path.abspath(__file__))
DOCS = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'docs', 'bao-truoc-muot')
DPR = 2
OX = 16  # lề trái của khung game trong cửa sổ 992x540

PREP = r"""
(() => {
  T.keep = () => { const S = G.getRun(); const P = S.P; P.hp = P.maxhp; P.dead = false; S.W.over = null; P.inv = 0;
    if (P.mv) { P.mv.tips = { sword: 1, bow: 1, spear: 1, hammer: 1 }; P.mv.tipWait = null; } S.hint = null; if (S.W.banner) S.W.banner = null; };
  T.pin = (x, y) => { const P = G.getRun().P; P.x = x; P.y = y; P.hp = P.maxhp; };
  // chạy tới khi điều kiện đúng (tối đa n khung), giữ em bé đứng yên ở (x, y)
  T.until = (f, n, x, y) => { for (let k = 0; k < (n || 600); k++) { T.frame(1); T.keep(); if (x != null) T.pin(x, y); if (f()) return k; } return -1; };
  T.mob = (role, x, y) => { const e = G.spawnEnemy(role, x, y, { hpMult: 1e4 }); e.inside = true; e.spawnT = 0; return e; };
  T.zp = (pred) => G.getWorld().zones.find((z) => z.t > 0 && z.t0 && pred(z) && 1 - z.t / z.t0 > 0.55 && !(z.wait > 0));
})();
"""

# Mỗi cảnh: tên tệp, nhãn, mã JS dựng cảnh trả về tâm khung cắt (toạ độ game).
SCENES = [
    ('quat', 'Hình quạt (Cua Lính chém càng)', """() => { const { W, P } = T.room(1, 2, { seed: 11 }); T.pin(230, 170); const e = T.mob('rusher', 262, 150);
        T.until(() => T.zp((z) => z.shape === 'cone'), 900, 230, 170); return [246, 160]; }"""),
    ('chu-nhat', 'Chữ nhật (Heo Rừng Con lao húc)', """() => { const { W, P } = T.room(0, 2, { seed: 7 }); T.pin(200, 175); const e = T.mob('rusher', 268, 160);
        T.until(() => T.zp((z) => z.shape === 'line'), 900, 200, 175); return [234, 166]; }"""),
    ('tron', 'Hình tròn (Nấm Phồng sắp nổ)', """() => { const { W, P } = T.room(0, 2, { seed: 9 }); T.pin(220, 172); const e = T.mob('kami', 250, 160);
        T.until(() => T.zp((z) => z.shape === 'circle' && !z.bomb), 900, 220, 172); return [242, 160]; }"""),
    ('hang-dan', 'Hàng đạn và đường ngắm (Đèn Lồng Ma)', """() => { const { W, P } = T.room(2, 2, { seed: 4 }); T.pin(180, 180); const e = T.mob('archer', 300, 140);
        T.until(() => e.act && e.act.aim && e.wind > 0 && e.wind < 0.35, 1200, 180, 180); return [240, 160]; }"""),
    ('vong-bom', 'Vòng bom đếm ngược (Sóc ném quả nổ)', """() => { const { W, P } = T.room(0, 2, { seed: 5 }); T.pin(210, 175); const e = T.mob('bomber', 300, 150);
        T.until(() => G.getWorld().zones.some((z) => z.bomb && z.t > 0 && z.t < z.t0 * 0.45), 1500, 210, 175); const z = G.getWorld().zones.find((q) => q.bomb); return [z.x, z.y - 6]; }"""),
    ('moc-quai', 'Vòng báo chỗ quái sắp mọc', """() => { const { W, P } = T.room(1, 2, { seed: 6 }); T.pin(170, 170);
        W.spawns.push({ role: 'rusher', x: 250, y: 150, t: 1, t0: 1 }, { role: 'elite', x: 300, y: 185, t: 1.1, t0: 1, big: true });
        T.until(() => W.spawns[0] && W.spawns[0].t < 0.4, 200, 170, 170); return [262, 165]; }"""),
    ('gai', 'Quái gai dựng gai (Nhím Biển)', """() => { const { W, P } = T.room(1, 2, { seed: 3 }); T.pin(200, 175); const e = T.mob('spiky', 250, 160);
        T.until(() => e.spikeUp > 0.8, 1500, 200, 175); return [236, 160]; }"""),
    ('trum-nho', 'Trùm nhỏ: Hổ Lửa gầm phun lửa (quạt rộng)', """() => { const { W, P, b } = T.boss(2, false, { seed: 3 }); T.until(() => false, 30); b.x = 300; b.y = 160; T.pin(230, 170);
        for (let k = 0; k < 900; k++) { if (!(b.busy > 0) && !b.dbg) G.bossDebug('chieu2'); T.frame(1); T.keep(); T.pin(230, 170); if (T.zp((z) => z.shape === 'cone' && z.r > 70)) break; }
        return [b.x - 50, b.y]; }"""),
    ('trum-rung', 'Mộc Tinh: Rừng gai (ba vành có khe)', """() => { const { W, P, b } = T.boss(0, true, { seed: 3 }); T.until(() => false, Math.ceil(b.intro * 60) + 10);
        b.hp = b.maxhp * 0.3; T.until(() => false, Math.ceil(G.monsterArt.dur(b.art, 'phase3') / 1 * 60) + 30); b.hp = b.maxhp * 0.3;
        for (let k = 0; k < 1500; k++) { if (!(b.busy > 0) && !b.dbg) G.bossDebug('c5'); T.frame(1); T.keep(); T.pin(W.x0 + 60, W.y1 - 30); if (T.zp((z) => z.shape === 'donut')) break; }
        return [b.x, b.y + 10]; }"""),
    ('trum-bien', 'Ngư Tinh: Sóng thần (tường nước chừa khe)', """() => { const { W, P, b } = T.boss(1, true, { seed: 3 }); T.until(() => false, Math.ceil(b.intro * 60) + 10);
        for (let k = 0; k < 1500; k++) { if (!(b.busy > 0) && !b.dbg) G.bossDebug('c2'); T.frame(1); T.keep(); T.pin(W.x0 + 60, (W.y0 + W.y1) / 2); const z = W.zones.find((q) => q.wall); if (z && z.wait > 0 && z.wait < 0.45) break; }
        return [(W.x0 + 60 + b.x) / 2, (W.y0 + W.y1) / 2]; }"""),
    ('trum-lau-dai', 'Hồ Tinh: Vòng lửa ma (hai vòng cột lửa)', """() => { const { W, P, b } = T.boss(2, true, { seed: 3 }); T.until(() => false, Math.ceil(b.intro * 60) + 10);
        b.hp = b.maxhp * 0.6; T.until(() => false, Math.ceil(G.monsterArt.dur(b.art, 'phase2') * 60) + 30); b.hp = b.maxhp * 0.6;
        for (let k = 0; k < 1500; k++) { if (!(b.busy > 0) && !b.dbg) G.bossDebug('c4'); T.frame(1); T.keep(); T.pin(W.x0 + 70, W.y1 - 40); if (b.an && b.an.n === 'c4' && W.zones.filter((z) => z.t > 0 && z.src === b && z.t0 && 1 - z.t / z.t0 > 0.5).length > 4) break; }
        return [W.x0 + 70, W.y1 - 50]; }"""),
]
CROP = (240, 135)  # vùng cắt (điểm ảnh game) quanh tâm


def open_page(pw, root):
    b = pw.chromium.launch()
    pg = b.new_page(viewport={'width': 992, 'height': 540}, device_scale_factor=DPR)
    errs = []
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
    pg.goto('file://' + os.path.abspath(root) + '/index.html')
    pg.wait_for_function('window.G && G.scene')
    pg.wait_for_timeout(300)
    pg.evaluate("window.requestAnimationFrame = () => 0")
    pg.add_script_tag(path=os.path.join(root, 'tests', 'bot.js'))
    pg.add_script_tag(path=os.path.join(root, 'tests', 'setup.js'))
    pg.evaluate(LIB)
    pg.evaluate(PREP)
    return b, pg, errs


def shot(pg, c):
    cam = pg.evaluate("() => Math.round(G.getWorld().cam)")
    cx = min(max(c[0] - cam - CROP[0] / 2, 0), 480 - CROP[0])
    cy = min(max(c[1] - CROP[1] / 2, 0), 270 - CROP[1])
    pg.evaluate("() => { G.ui.begin(); G.scene.draw(); }")
    png = pg.screenshot(clip={'x': OX + cx * 2, 'y': cy * 2, 'width': CROP[0] * 2, 'height': CROP[1] * 2})
    return Image.open(io.BytesIO(png)).convert('RGB')


def chup(root, out):
    os.makedirs(out, exist_ok=True)
    with sync_playwright() as pw:
        b, pg, errs = open_page(pw, root)
        for name, label, js in SCENES:
            c = pg.evaluate(js)
            shot(pg, c).save(os.path.join(out, name + '.png'))
            print('chụp', name)
        b.close()
    if errs:
        print('LỖI', errs[:5])


def font(sz):
    for f in ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf']:
        if os.path.exists(f):
            return ImageFont.truetype(f, sz)
    return ImageFont.load_default()


def ghep(d0, d1):
    w, h = 480, 270
    pad, head = 8, 30
    out = Image.new('RGB', (w * 2 + pad * 3, 40 + len(SCENES) * (h + head + pad)), (18, 13, 16))
    dr = ImageDraw.Draw(out)
    dr.text((pad, 10), 'TRƯỚC (trái)  —  SAU (phải)', fill=(255, 220, 140), font=font(20))
    y = 40
    for name, label, js in SCENES:
        dr.text((pad, y + 4), label, fill=(241, 234, 217), font=font(17))
        for i, d in enumerate([d0, d1]):
            im = Image.open(os.path.join(d, name + '.png')).resize((w, h), Image.LANCZOS)
            out.paste(im, (pad + i * (w + pad), y + head))
        y += h + head + pad
    os.makedirs(DOCS, exist_ok=True)
    p = os.path.join(DOCS, 'truoc-sau.png')
    out.save(p, optimize=True)
    print('ảnh', p, out.size, os.path.getsize(p) // 1024, 'KB')


# GIF: cùng một đòn (Cua Lính quạt, Heo lao, bom, trùm nhỏ) chạy từ lúc hiện vùng tới lúc nổ, trước | sau
GIF_JS = [
    ("""() => { const { W, P } = T.room(1, 2, { seed: 11 }); T.pin(230, 170); const e = T.mob('rusher', 262, 150);
        T.until(() => G.getWorld().zones.some((z) => z.shape === 'cone' && z.t > 0), 900, 230, 170); return [246, 160]; }""", 18),
    ("""() => { const { W, P } = T.room(0, 2, { seed: 9 }); T.pin(220, 172); const e = T.mob('kami', 250, 160);
        T.until(() => G.getWorld().zones.some((z) => z.shape === 'circle' && z.t > 0), 900, 220, 172); return [242, 160]; }""", 20),
    ("""() => { const { W, P } = T.room(0, 2, { seed: 7 }); T.pin(200, 175); const e = T.mob('rusher', 268, 160);
        T.until(() => G.getWorld().zones.some((z) => z.shape === 'line' && z.t > 0), 900, 200, 175); return [234, 166]; }""", 16),
]


def gif(root0, root1):
    seqs = []
    with sync_playwright() as pw:
        for root in [root0, root1]:
            b, pg, errs = open_page(pw, root)
            fr = []
            for js, n in GIF_JS:
                c = pg.evaluate(js)
                for k in range(n):
                    fr.append(shot(pg, c))
                    pg.evaluate("() => { for (let k = 0; k < 3; k++) { T.frame(1); T.keep(); } }")
            seqs.append(fr)
            b.close()
    w, h = 400, 225
    frames = []
    for a, b2 in zip(*seqs):
        im = Image.new('RGB', (w * 2 + 6, h + 22), (18, 13, 16))
        im.paste(a.resize((w, h), Image.LANCZOS), (0, 22))
        im.paste(b2.resize((w, h), Image.LANCZOS), (w + 6, 22))
        dr = ImageDraw.Draw(im)
        dr.text((6, 3), 'TRƯỚC', fill=(255, 200, 160), font=font(15))
        dr.text((w + 12, 3), 'SAU', fill=(160, 255, 190), font=font(15))
        frames.append(im.quantize(colors=160, method=Image.MEDIANCUT, dither=Image.NONE))
    p = os.path.join(DOCS, 'muot.gif')
    frames[0].save(p, save_all=True, append_images=frames[1:], duration=50, loop=0, optimize=True, disposal=1)
    print('gif', p, len(frames), 'khung', os.path.getsize(p) // 1024, 'KB')


if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'chup':
        chup(sys.argv[2], sys.argv[3])
    elif cmd == 'ghep':
        ghep(sys.argv[2], sys.argv[3])
    else:
        gif(sys.argv[2], sys.argv[3])
