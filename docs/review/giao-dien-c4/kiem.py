"""Phiên C4 (ảnh AI cho thân nút, ô vũ khí, cần điều khiển): MỘT lượt kiểm nhanh bằng Playwright.
Chạy từ thư mục gốc repo:
  python3 docs/review/giao-dien-c4/kiem.py <thư mục bản code CŨ để so>   (ví dụ một git worktree của commit trước phiên này)
Làm gì:
  1) tự dựng 2 ảnh lưới mẫu (Thân nút 4×3 nền hồng tím, Ô vũ khí 2×2 nền xanh lá) → đưa vào trang tools/tach-giao-dien → phải ĐẠT, tệp có "net": 2;
  2) game 844×390, một trận có đủ nút, cần điều khiển đang kéo: bản cũ / bản mới không tệp (phải khác 0 điểm ảnh) / bản mới nạp tạm tệp mẫu;
     ghi lại toạ độ mọi lần dán hình (drawImage) của một khung hình trước và sau khi nạp tệp: phải trùng hết;
  3) vẽ thẳng bộ nút ở 4 cỡ màn, bản cũ và bản mới không tệp: phải giống nhau từng điểm ảnh; có tệp: khung đặc của từng nút so với bản code;
  4) gỡ tệp, và tắt cờ G.THAN_NUT_ANH: phải về y như lúc chưa có tệp;
  5) ghép ảnh kiểm docs/review/giao-dien-c4/anh-kiem.png; có tham số --prompt thì ghi prompt của 2 lô ra prompt-than.txt, prompt-ovk.txt (để chép vào PROMPT.md).
Không ghi gì vào game/art/custom. Ảnh mẫu chỉ nằm trong thư mục tạm."""
import base64, functools, http.server, io, json, math, os, sys, tempfile, threading
from PIL import Image, ImageChops, ImageDraw
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
ARGS = [a for a in sys.argv[1:] if not a.startswith('--')]
OLD = os.path.abspath(ARGS[0]) if ARGS else None
TMP = tempfile.mkdtemp(prefix='c4-')
DT = dict(viewport={'width': 844, 'height': 390}, is_mobile=True, has_touch=True, device_scale_factor=2)
V = '#140e0c'


def serve(root):
    class Im(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    s = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Im, directory=root))
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return 'http://127.0.0.1:%d' % s.server_address[1]


# ---------- 1) ảnh lưới mẫu (hình máy tự vẽ, cố ý thô để nhìn là biết ảnh mẫu) ----------
def luoi(cot, hang, C, CH, nen):
    im = Image.new('RGB', (C * cot, CH * hang), nen)
    d = ImageDraw.Draw(im)
    for i in range(1, cot): d.line([(i * C, 0), (i * C, CH * hang)], fill='#201820', width=2)
    for j in range(1, hang): d.line([(0, j * CH), (C * cot, j * CH)], fill='#201820', width=2)
    return im, d


def anh_mau_than(path):
    C = 260
    im, d = luoi(4, 3, C, C, '#FF00FF')

    def tam(i, lx=0, ly=0): return ((i % 4) * C + C // 2 + lx, (i // 4) * C + C // 2 + ly)

    def dia(x, y, r, mau): d.ellipse([x - r, y - r, x + r, y + r], fill=mau)

    def vong(x, y, R, vanh, mat, dinh=True, day=12):
        dia(x, y, R, V); dia(x, y, R - 5, vanh[1])
        d.pieslice([x - R + 5, y - R + 5, x + R - 5, y + R - 5], 180, 290, fill=vanh[0]); d.pieslice([x - R + 5, y - R + 5, x + R - 5, y + R - 5], 0, 110, fill=vanh[2])
        dia(x, y, R - 5 - day, V); dia(x, y, R - 9 - day, mat[1])
        d.chord([x - R + 9 + day, y - R + 9 + day, x + R - 9 - day, y + R - 9 - day], 180, 360, fill=mat[0])
        # dấu của ảnh mẫu: 8 vạch sáng trên vành, một vòng chấm trên mặt nút
        for k in range(8):
            a = k * math.pi / 4 + 0.39; px, py = x + math.cos(a) * (R - 5 - day / 2), y + math.sin(a) * (R - 5 - day / 2)
            d.rectangle([px - 3, py - 3, px + 3, py + 3], fill='#ffffff')
        if dinh:
            for sx, sy in ((-1, -1), (1, -1), (-1, 1), (1, 1)):
                px, py = x + sx * (R - 5 - day / 2) * 0.707, y + sy * (R - 5 - day / 2) * 0.707
                d.rectangle([px - 5, py - 5, px + 5, py + 5], fill=V); d.rectangle([px - 3, py - 3, px + 1, py + 1], fill='#fff0c4')

    DONG, MATV = ('#f6d48a', '#c88a3a', '#7a4a1e'), ('#c98c34', '#a8752f')
    R = 74
    x, y = tam(0); vong(x, y, R, DONG, MATV)
    # Lửa: ngọn lửa trên đỉnh (hình cố ý lệch tâm ô: game phải tự tìm tâm nút)
    x, y = tam(1, 6, 14); LUA = ('#ffc90e', '#fe7d04', '#a03409')
    for a, h in ((-40, 22), (-18, 30), (4, 38), (26, 28), (46, 20)):
        r = math.radians(a); bx, by = x + math.sin(r) * (R - 4), y - math.cos(r) * (R - 4)
        d.polygon([(bx - 13, by + 8), (bx + 13, by + 8), (bx + math.sin(r) * h, by - h)], fill=V)
        d.polygon([(bx - 9, by + 8), (bx + 9, by + 8), (bx + math.sin(r) * (h - 8), by - h + 8)], fill=LUA[1])
    vong(x, y, R, LUA, MATV)
    # Độc: giọt nhỏ xuống
    x, y = tam(2, -5, -12); DOC = ('#c8f90b', '#5aca02', '#277600')
    for a, h in ((-34, 18), (-8, 34), (22, 24), (44, 14)):
        r = math.radians(a); bx, by = x + math.sin(r) * (R - 6), y + math.cos(r) * (R - 6)
        d.rectangle([bx - 8, by, bx + 8, by + h], fill=V); d.ellipse([bx - 11, by + h - 12, bx + 11, by + h + 10], fill=V)
        d.rectangle([bx - 4, by, bx + 4, by + h], fill=DOC[1]); d.ellipse([bx - 7, by + h - 8, bx + 7, by + h + 6], fill=DOC[1])
    vong(x, y, R, DOC, MATV)
    # Băng: bốn gai chéo
    x, y = tam(3); BANG = ('#9cfefa', '#32b0e9', '#217bc3')
    for a in (45, 135, 225, 315):
        r = math.radians(a); ux, uy = math.sin(r), -math.cos(r)
        b0 = (x + ux * (R - 8), y + uy * (R - 8)); t = (x + ux * (R + 22), y + uy * (R + 22))
        d.polygon([(b0[0] + uy * 16, b0[1] - ux * 16), t, (b0[0] - uy * 16, b0[1] + ux * 16)], fill=V)
        d.polygon([(b0[0] + uy * 10, b0[1] - ux * 10), (x + ux * (R + 14), y + uy * (R + 14)), (b0[0] - uy * 10, b0[1] + ux * 10)], fill=BANG[0])
    vong(x, y, R, BANG, MATV, dinh=False)
    x, y = tam(4); vong(x, y, 86, ('#bfe3ff', '#3f8be0', '#1d4a8a'), ('#553c2c', '#402c20'), dinh=False, day=14)
    x, y = tam(5); vong(x, y, 86, ('#cecdda', '#928c82', '#5c5b73'), ('#4a5266', '#343a4a'), dinh=False, day=14)
    # nút vuông vát góc
    x, y = tam(6); R2, cut = 84, 28

    def bat(r, c): return [(x - r + c, y - r), (x + r - c, y - r), (x + r, y - r + c), (x + r, y + r - c), (x + r - c, y + r), (x - r + c, y + r), (x - r, y + r - c), (x - r, y - r + c)]
    d.polygon(bat(R2, cut), fill=V); d.polygon(bat(R2 - 5, cut - 2), fill='#79451d')
    d.polygon([(x - R2 + 5, y - R2 + cut), (x - R2 + cut, y - R2 + 5), (x + R2 - cut, y - R2 + 5), (x + R2 - cut - 12, y - R2 + 17), (x - R2 + 17, y - R2 + cut + 4), (x - R2 + 17, y + R2 - cut - 12), (x - R2 + 5, y + R2 - cut)], fill='#c98c34')
    d.polygon(bat(R2 - 19, cut - 8), fill=V); d.polygon(bat(R2 - 23, cut - 10), fill='#342c26')
    d.rectangle([x - R2 + 26, y - R2 + 23, x + R2 - 26, y - 6], fill='#4a4038')
    for k in range(-2, 3): d.rectangle([x + k * 24 - 3, y - R2 + 9, x + k * 24 + 3, y - R2 + 15], fill='#ffffff')
    # đế cần
    x, y = tam(7); R3 = 88
    dia(x, y, R3, V); dia(x, y, R3 - 5, '#79451d'); d.pieslice([x - R3 + 5, y - R3 + 5, x + R3 - 5, y + R3 - 5], 180, 290, fill='#c98c34')
    dia(x, y, R3 - 15, V); dia(x, y, R3 - 19, '#1c1614')
    for ux, uy in ((0, -1), (1, 0), (0, 1), (-1, 0)):
        tx, ty = x + ux * (R3 - 26), y + uy * (R3 - 26)
        d.polygon([(tx, ty), (tx - ux * 16 + uy * 12, ty - uy * 16 + ux * 12), (tx - ux * 16 - uy * 12, ty - uy * 16 - ux * 12)], fill='#e8d8b0')
    for k in range(8):
        a = k * math.pi / 4 + 0.39; px, py = x + math.cos(a) * (R3 - 10), y + math.sin(a) * (R3 - 10); d.rectangle([px - 3, py - 3, px + 3, py + 3], fill='#ffffff')
    # núm
    x, y = tam(8); R4 = 80
    dia(x, y, R4, V); dia(x, y, R4 - 5, '#c88a3a'); d.pieslice([x - R4 + 5, y - R4 + 5, x + R4 - 5, y + R4 - 5], 180, 290, fill='#f6d48a'); d.pieslice([x - R4 + 5, y - R4 + 5, x + R4 - 5, y + R4 - 5], 0, 110, fill='#7a4a1e')
    dia(x, y, R4 - 24, V); dia(x, y, R4 - 28, '#3fb0a0'); dia(x - 16, y - 16, 12, '#b8f0e0')
    for k in range(4):
        a = k * math.pi / 2; px, py = x + math.cos(a) * (R4 - 14), y + math.sin(a) * (R4 - 14); d.rectangle([px - 4, py - 4, px + 4, py + 4], fill='#ffffff')
    im.save(path)


def anh_mau_ovk(path):
    C, CH = 420, 300
    im, d = luoi(2, 2, C, CH, '#00FF00')
    BAC = [('#c8ccd4', '#8a8f98', '#555a64', '#45454c', '#37363d'), ('#8ec8ff', '#3f8be0', '#1d4a8a', '#274369', '#223551'),
           ('#d0a8ff', '#9a5ae0', '#5a2a9a', '#4b2f69', '#3c2751'), ('#fff0a8', '#f0b840', '#8a5a14', '#6e5529', '#544125')]
    for i, (l, m, t, fl, fm) in enumerate(BAC):
        x0, y0 = (i % 2) * C + 62, (i // 2) * CH + 54; w, h = 296, 192
        d.rectangle([x0, y0, x0 + w, y0 + h], fill=V)
        d.rectangle([x0 + 5, y0 + 5, x0 + w - 5, y0 + h - 5], fill=m)
        d.polygon([(x0 + 5, y0 + h - 5), (x0 + 5, y0 + 5), (x0 + w - 5, y0 + 5), (x0 + w - 17, y0 + 17), (x0 + 17, y0 + 17), (x0 + 17, y0 + h - 17)], fill=l)
        d.polygon([(x0 + 5, y0 + h - 5), (x0 + w - 5, y0 + h - 5), (x0 + w - 5, y0 + 5), (x0 + w - 17, y0 + 17), (x0 + w - 17, y0 + h - 17), (x0 + 17, y0 + h - 17)], fill=t)
        d.rectangle([x0 + 17, y0 + 17, x0 + w - 17, y0 + h - 17], fill=V)
        d.rectangle([x0 + 22, y0 + 22, x0 + w - 22, y0 + h - 22], fill=fm); d.rectangle([x0 + 22, y0 + 22, x0 + w - 22, y0 + 86], fill=fl)
        for cx, cy in ((x0 + 11, y0 + 11), (x0 + w - 11, y0 + 11), (x0 + 11, y0 + h - 11), (x0 + w - 11, y0 + h - 11)):
            d.rectangle([cx - 6, cy - 6, cx + 6, cy + 6], fill='#c88a3a'); d.rectangle([cx - 6, cy - 6, cx - 1, cy - 1], fill='#f6d48a')
        for k in range(1, 8): d.rectangle([x0 + k * 37 - 4, y0 + 7, x0 + k * 37 + 4, y0 + 15], fill='#ffffff')  # dấu của ảnh mẫu
    im.save(path)


# ---------- game ----------
HELP = r"""
window.T = {
  sc: null,
  freeze() { if (!T.sc) { const sc = G.scene; T.sc = sc; G.scene = { update() {}, draw() { sc.draw(); }, hide() {} }; } G.tick = function () {}; },
  rng(seed) { const r = G.srand(seed); Math.random = r; G.rnd = r; },
  // một trận phòng thường: kiếm hệ Lửa bậc Tím + cung bậc Vàng, cần điều khiển đang kéo
  tran() {
    G.time = 100; T.rng(44); G.testSave({ lvl: 7, sharpen: 2, tier: 2, branch: 'fire', marks: 30 }); G.save.potions = 2;
    G.startStage(0, 2, 0, { kind: 'A', seed: 3 }); const S = G.getRun(); S.fade = 0;
    G.gotoRoom(S.map.rooms.find(o => o.type === 'fight').id); const W = G.getRun().W;
    for (let k = 0; k < 400 && W.ents.length < 3; k++) G.sim(1); G.sim(30);
    const P = G.getRun().P; P.weapons[1].rarity = 3;
    T.freeze();
    G.pointers.set('kiem-c4', { role: 'joy', sx: 70, sy: 205, x: 84, y: 194 });
  },
  // toạ độ mọi lần dán hình 5 tham số (kiểu của blit trong btn_art.js) trong một khung hình
  dan() {
    const P = CanvasRenderingContext2D.prototype, goc = P.drawImage, ds = [];
    P.drawImage = function (...a) { if (a.length === 5) ds.push(a.slice(1).join(',')); return goc.apply(this, a); };
    try { T.sc.draw(); } finally { P.drawImage = goc; }
    return ds;
  },
  ve(c, t) {
    const B = G.btnArt, VK = ['sword', 'bow', 'spear', 'hammer'], HE = [null, 'fire', 'poison', 'ice']; let n = 0;
    const id = () => 'kiem-' + (n++);
    HE.forEach((e, j) => B.draw(c, 'atk', 34 + j * 64, 36, 29, { weapon: { type: VK[j], branch: e, stage: 2 }, t, id: id(), ready: -9 }));
    HE.forEach((e, j) => B.draw(c, 'atk', 290 + j * 50, 30, 19 + j, { weapon: { type: 'sword', branch: e, stage: 1 + (j % 3) }, pressed: j === 1, disabled: j === 3, t, id: id(), ready: -9 }));
    VK.forEach((k, i) => B.draw(c, 'special', 24 + i * 44, 100, 19, { weapon: { type: k, branch: HE[i] }, cost: 20, disabled: i === 3, cd: i === 2 ? 0.5 : 0, cdSec: i === 2 ? 3 : 0, pressed: i === 1, t, id: id(), ready: -9 }));
    ['fire', 'poison', 'ice'].forEach((e, i) => B.draw(c, 'chuong', 204 + i * 44, 100, 19, { el: e, cost: 30, t, id: id(), ready: -9 }));
    ['smith', 'hunter'].forEach((h, i) => B.draw(c, 'skill', 340 + i * 44, 100, 19, { hero: h, cost: 30, t, id: id(), ready: -9 }));
    for (let i = 0; i < 6; i++) B.draw(c, 'dodge', 24 + i * 44, 152, 19, { dir: (i / 6) * Math.PI * 2, pressed: i === 4, cd: i === 5 ? 0.4 : 0, t, id: id(), ready: -9 });
    B.draw(c, 'potion', 296, 150, 12, { count: 2, t, id: id(), ready: -9 }); B.draw(c, 'potion', 328, 150, 12, { count: 0, disabled: true, t, id: id(), ready: -9 });
    B.draw(c, 'pause', 360, 150, 11, { t, id: id(), ready: -9 }); B.draw(c, 'pause', 390, 150, 11, { pressed: true, t, id: id(), ready: -9 });
    VK.forEach((k, i) => B.slot(c, 10 + i * 60, 190, 54, 35, { weapon: { type: k, branch: HE[i], stage: 2, rarity: i }, active: true, t, id: id(), ready: -9, flash: false }));
    VK.forEach((k, i) => B.slot(c, 10 + i * 60, 234, 54, 35, { weapon: { type: k, branch: HE[i], stage: 2, rarity: i }, active: false, swap: true, pressed: i === 2, disabled: i === 3, t, id: id(), ready: -9, flash: false }));
    B.stick(c, 300, 236, 24, 0, 0, false); B.stick(c, 370, 236, 24, 10, -8, true); B.stick(c, 440, 236, 24, -24, 0, true);
  },
  // vẽ thẳng bộ nút ở tỉ lệ a (điểm thật trên một đơn vị giao diện) → chuỗi ảnh PNG. nen = false: nền trong suốt
  sheet(a, nen) {
    const cv = document.createElement('canvas'); cv.width = Math.round(480 * a); cv.height = Math.round(280 * a);
    const c = cv.getContext('2d'); c.setTransform(a, 0, 0, a, 0, 0);
    if (nen !== false) { c.fillStyle = '#2c4a36'; c.fillRect(0, 0, 480, 280); c.fillStyle = '#5a6a4a'; for (let x = 0; x < 480; x += 16) c.fillRect(x, 0, 8, 280); }
    T.ve(c, 3.21);
    return cv.toDataURL('image/png');
  },
  // khung bao phần ĐẶC (alpha ≥ 250: thân, bề dày, viền; không tính bóng mờ) của từng nút vẽ riêng trên nền trong suốt
  hop(a) {
    const B = G.btnArt, kq = {};
    const mot = (ten, f) => {
      const cv = document.createElement('canvas'); cv.width = Math.round(120 * a); cv.height = Math.round(120 * a);
      const c = cv.getContext('2d'); c.setTransform(a, 0, 0, a, 0, 0); f(c);
      const d = c.getImageData(0, 0, cv.width, cv.height).data; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
      for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) if (d[(y * cv.width + x) * 4 + 3] >= 250) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      kq[ten] = [x0, y0, x1, y1];
    };
    const o = { t: 3.21, ready: -9 };
    mot('Đánh chưa hệ', (c) => B.draw(c, 'atk', 60, 60, 29, Object.assign({ id: 'h1' }, o)));
    mot('Chiêu', (c) => B.draw(c, 'special', 60, 60, 19, Object.assign({ id: 'h2' }, o)));
    mot('Né', (c) => B.draw(c, 'dodge', 60, 60, 19, Object.assign({ id: 'h3' }, o)));
    mot('Né đang bấm', (c) => B.draw(c, 'dodge', 60, 60, 19, Object.assign({ id: 'h3b', pressed: true }, o)));
    mot('Bình máu', (c) => B.draw(c, 'potion', 60, 60, 12, Object.assign({ id: 'h4' }, o)));
    mot('Tạm dừng', (c) => B.draw(c, 'pause', 60, 60, 11, Object.assign({ id: 'h5' }, o)));
    mot('Ô vũ khí bậc Tím', (c) => B.slot(c, 30, 40, 54, 35, { weapon: { type: 'sword', rarity: 2 }, active: false, icon: false, gem: false, id: 'h6', ready: -9, flash: false, t: 3.21 }));
    mot('Ô vũ khí bậc Vàng đang cầm', (c) => B.slot(c, 30, 40, 54, 35, { weapon: { type: 'sword', rarity: 3 }, active: true, icon: false, gem: false, id: 'h7', ready: -9, flash: false, t: 3.21 }));
    mot('Cần điều khiển', (c) => B.stick(c, 60, 60, 24, 0, 0, true));
    return kq;
  },
};
"""


def mo_game(b, base, errs, ten):
    pg = b.new_page(**DT)
    pg.on('pageerror', lambda e: errs.append('%s: %s' % (ten, e)))
    pg.on('console', lambda m: errs.append('%s console: %s' % (ten, m.text)) if m.type == 'error' and 'Failed to load resource' not in m.text and 'bad HTTP response' not in m.text else None)
    pg.goto(base + '/game/index.html?cloud=0')
    pg.wait_for_function('window.G && G.scene')
    pg.wait_for_timeout(600)
    pg.add_script_tag(url=base + '/game/tests/bot.js')
    pg.add_script_tag(url=base + '/game/tests/setup.js')
    pg.evaluate(HELP)
    return pg


def chup(pg):
    pg.wait_for_timeout(350)
    return Image.open(io.BytesIO(pg.screenshot())).convert('RGB')


def khac(a, b):
    if a.size != b.size: return -1, None
    d = ImageChops.difference(a, b).convert('L').point(lambda v: 255 if v else 0)
    return d.histogram()[255], d.getbbox()


def tu_url(u, mode='RGB'):
    return Image.open(io.BytesIO(base64.b64decode(u.split(',', 1)[1]))).convert(mode)


def main():
    kq = {'loi': []}
    moi = serve(REPO)
    cu = serve(OLD) if OLD else None
    m1, m2 = os.path.join(TMP, 'luoi-mau-than-nut.png'), os.path.join(TMP, 'luoi-mau-o-vu-khi.png')
    anh_mau_than(m1); anh_mau_ovk(m2)
    anh, teps, prompt = {}, [], {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        # ----- 1) trang công cụ -----
        errs = []
        pg = b.new_page(viewport={'width': 900, 'height': 1400}, device_scale_factor=1)
        pg.on('pageerror', lambda e: errs.append('cong-cu: %s' % e))
        pg.on('console', lambda m: errs.append('cong-cu console: %s' % m.text) if m.type == 'error' and 'Failed to load resource' not in m.text and 'bad HTTP response' not in m.text else None)
        pg.goto(moi + '/tools/tach-giao-dien/index.html')
        kq['thu_tu_lo'] = pg.evaluate('LO.map((l) => l.id)')
        for lo, mau in (('than', m1), ('ovk', m2)):
            pg.select_option('#chonLo', str(pg.evaluate("(id) => LO.findIndex((l) => l.id === id)", lo)))
            prompt[lo] = pg.input_value('#oPrompt')
            pg.set_input_files('#chonAnh', mau)
            pg.wait_for_function("document.getElementById('theKq') && /ĐẠT|CÓ LỖI/.test(document.getElementById('theKq').textContent)", timeout=30000)
            kq['cong_cu_' + lo] = pg.inner_text('#theKq')
            kq['cong_cu_kiem_' + lo] = pg.eval_on_selector_all('#dsKiem li', 'els => els.map(e => (e.className ? "[" + e.className + "] " : "") + e.textContent)')
            ts = pg.evaluate('L.ds.map((m, i) => (KQ[i] ? jsonMon(i) : null))')
            ds = [json.loads(t) for t in ts if t]
            kq['tep_' + lo] = ['%s %dx%d net=%s' % (t['ma'], *tu_url(t['anh']).size, t.get('net')) for t in ds]
            kq['byte_' + lo] = sum(len(t) for t in ts if t)
            teps += [t for t in ts if t]
            pg.wait_for_function("!document.getElementById('vungXem').hidden && !document.getElementById('xemNut').hidden", timeout=30000)
            pg.wait_for_timeout(900)
        anh['xem'] = tu_url(pg.evaluate("document.getElementById('cvNut').toDataURL('image/png')"))
        pg.click('#nutDoiMau'); pg.wait_for_timeout(500)
        anh['xem_lua'] = tu_url(pg.evaluate("document.getElementById('cvNut').toDataURL('image/png')"))
        pg.click('#nutSoCode'); pg.wait_for_timeout(500)
        anh['xem_code'] = tu_url(pg.evaluate("document.getElementById('cvNut').toDataURL('image/png')"))
        kq['xem_thu_khac_code'] = khac(anh['xem_lua'], anh['xem_code'])[0]
        pg.screenshot(path=os.path.join(TMP, 'cong-cu.png'), full_page=True)
        pg.close()
        kq['loi'] += errs
        ma = [json.loads(t)['ma'] for t in teps]
        kq['ma'] = ma

        # ----- 2) 3) 4) game -----
        errs = []
        pm = mo_game(b, moi, errs, 'moi')
        pc = mo_game(b, cu, errs, 'cu') if cu else None
        kq['ma_game_can'] = pm.evaluate('G.btnArt.MA_THAN')
        if pc:
            for a in (1.444, 1.758, 2.667, 3.516, 4.333):  # bộ nút vẽ thẳng, không tệp: cũ = mới
                kq['bo_nut_cu_so_moi_a%s' % a] = khac(tu_url(pc.evaluate('(a) => T.sheet(a)', a)), tu_url(pm.evaluate('(a) => T.sheet(a)', a)))[0]
        pm.evaluate('T.tran()')
        k0 = chup(pm); k0b = chup(pm)
        kq['tran: hai lần chụp cùng trang'] = khac(k0, k0b)[0]
        if pc:
            pc.evaluate('T.tran()')
            kc = chup(pc)
            kq['tran: CŨ so MỚI không tệp (điểm ảnh khác)'] = khac(kc, k0)[0]
        pm.evaluate('T.dan()'); dan0 = pm.evaluate('T.dan()')
        hop0 = pm.evaluate('T.hop(2)'); hop0b = pm.evaluate('T.hop(1.758)')
        s0 = tu_url(pm.evaluate('T.sheet(3.516)'))
        # nạp tạm tệp mẫu
        pm.evaluate('(ds) => { for (const t of ds) G.spriteCustom.add(JSON.parse(t)); }', teps)
        pm.wait_for_function('(ms) => ms.every((m) => G.spriteCustom.gdSan(m))', arg=ma)
        k1 = chup(pm)
        n, box = khac(k0, k1)
        kq['tran: có tệp so không tệp'] = {'diem_khac': n, 'vung': box, 'man': k1.size}
        pm.evaluate('T.dan()'); dan1 = pm.evaluate('T.dan()')
        kq['toa_do_dan_hinh'] = {'so_lan': len(dan0), 'trung': dan0 == dan1, 'khac': [(x, y) for x, y in zip(dan0, dan1) if x != y][:5]}
        hop1 = pm.evaluate('T.hop(2)'); hop1b = pm.evaluate('T.hop(1.758)')
        kq['khung_dac (code → ảnh), tỉ lệ 2'] = {k: (hop0[k], hop1[k], 'TRÙNG' if hop0[k] == hop1[k] else 'lệch') for k in hop0}
        kq['khung_dac lệch ở tỉ lệ 1.758'] = {k: (hop0b[k], hop1b[k]) for k in hop0b if hop0b[k] != hop1b[k]}
        s1 = tu_url(pm.evaluate('T.sheet(3.516)'))
        anh['tran_khong'], anh['tran_co'], anh['bo_khong'], anh['bo_co'] = k0, k1, s0, s1
        # cờ tắt
        pm.evaluate('G.THAN_NUT_ANH = false')
        kq['tran: có tệp + cờ tắt so không tệp'] = khac(k0, chup(pm))[0]
        pm.evaluate('delete G.THAN_NUT_ANH')
        kq['tran: bật lại cờ so có tệp'] = khac(k1, chup(pm))[0]
        # chỉ còn một phần tệp: nút thiếu tệp vẽ code
        pm.evaluate("G.spriteCustom.remove('gd-vong-fire'); G.spriteCustom.remove('gd-o-vk-3'); G.spriteCustom.remove('gd-can-num')")
        anh['tran_thieu'] = chup(pm)
        # gỡ hết: phải về y như lúc chưa có
        pm.evaluate('(ms) => { for (const m of ms) G.spriteCustom.remove(m); }', ma)
        kq['tran: gỡ tệp so lúc đầu'] = khac(k0, chup(pm))[0]
        kq['bo_nut: gỡ tệp so lúc đầu'] = khac(s0, tu_url(pm.evaluate('T.sheet(3.516)')))[0]
        pm.close()
        if pc: pc.close()
        kq['loi'] += errs
        # bản gói: mở không lỗi, có phần mới
        errs = []
        pg = b.new_page(viewport={'width': 844, 'height': 390})
        pg.on('pageerror', lambda e: errs.append('dist: %s' % e))
        pg.goto(moi + '/game/dist/linh-khi.html?cloud=0'); pg.wait_for_function('window.G && G.scene'); pg.wait_for_timeout(1200)
        kq['dist_maThan'] = pg.evaluate("[G.btnArt.maThan('atk', 'fire'), G.btnArt.maThan('special'), G.btnArt.maThan('dodge'), G.btnArt.maThan('pause')]")
        pg.close(); kq['loi'] += errs
        b.close()

    if '--prompt' in sys.argv:
        with open(os.path.join(HERE, 'prompt-than.txt'), 'w', encoding='utf-8') as f: f.write(prompt['than'])
        with open(os.path.join(HERE, 'prompt-ovk.txt'), 'w', encoding='utf-8') as f: f.write(prompt['ovk'])

    # ----- 5) ảnh kiểm: mỗi hàng = trái KHÔNG có tệp (hình vẽ code), phải CÓ tệp mẫu -----
    W, w = 1400, 696
    hang = []

    def doi(a, c, loc=Image.LANCZOS):
        k = w / a.width
        r = Image.new('RGB', (W, round(a.height * k)), '#101010')
        r.paste(a.resize((w, r.height), loc), (0, 0)); r.paste(c.resize((w, r.height), loc), (W - w, 0))
        hang.append(r)

    def mot(a):
        k = min(1, W / a.width)
        r = Image.new('RGB', (W, round(a.height * k)), '#101010'); r.paste(a.resize((round(a.width * k), r.height), Image.LANCZOS), (0, 0)); hang.append(r)
    doi(anh['tran_khong'], anh['tran_co'])
    for o in ((0.0, 0.42, 0.26, 1.0), (0.70, 0.36, 1.0, 1.0), (0.70, 0.0, 1.0, 0.2)):  # phóng to: cần điều khiển, cụm nút, ô vũ khí
        a, c = anh['tran_khong'], anh['tran_co']
        bx = (int(a.width * o[0]), int(a.height * o[1]), int(a.width * o[2]), int(a.height * o[3]))
        doi(a.crop(bx), c.crop(bx), Image.NEAREST)
    doi(anh['bo_khong'], anh['bo_co'], Image.NEAREST)
    doi(anh['tran_co'], anh['tran_thieu'])
    doi(anh['xem_code'], anh['xem_lua'])
    luoi_ = Image.new('RGB', (W, 330), '#101010')
    a1, a2 = Image.open(m1), Image.open(m2)
    a1 = a1.resize((round(a1.width * 330 / a1.height), 330), Image.LANCZOS); a2 = a2.resize((round(a2.width * 330 / a2.height), 330), Image.LANCZOS)
    luoi_.paste(a1, (0, 0)); luoi_.paste(a2, (a1.width + 12, 0)); hang.append(luoi_)
    H = sum(h.height for h in hang) + 8 * (len(hang) - 1)
    out = Image.new('RGB', (W, H), '#101010'); y = 0
    for h in hang: out.paste(h, (0, y)); y += h.height + 8
    out = out.quantize(colors=200, method=Image.MEDIANCUT, dither=Image.NONE)
    out.save(os.path.join(HERE, 'anh-kiem.png'), optimize=True)
    for k, v in anh.items(): v.save(os.path.join(TMP, k + '.png'))
    print(json.dumps(kq, ensure_ascii=False, indent=1))
    print('ảnh tạm:', TMP)


main()
