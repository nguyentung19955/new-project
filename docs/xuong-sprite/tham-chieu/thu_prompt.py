"""Thử thật: vẽ ảnh giả lập ĐÚNG như prompt mô tả (góc nhìn, tỉ lệ, tay chân tách thân, nền trắng, viền tối),
đưa qua Xưởng Sprite (tách nền -> thu nhỏ -> Tự đoán -> cử động) bằng Playwright và đo xem có khớp không.

Chạy: python3 docs/xuong-sprite/tham-chieu/thu_prompt.py
Ghi: docs/xuong-sprite/thu-prompt-<mã>.png (ảnh đưa vào, hình pixel, bộ phận Tự đoán, khung cử động)
     và in bảng kết quả (dán vào PROMPT-THU.md).
Mỗi mẫu có một bản "kiểu AI hay vẽ" (nhìn chính diện, tay dính thân...) để so.
"""
import base64
import io
import json
import os
import random
import tempfile
from collections import Counter, deque

from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
DOCS = os.path.join(REPO, 'docs', 'xuong-sprite')
TOOL = 'file://' + os.path.join(REPO, 'tools', 'xuong-sprite', 'index.html')
DO = {o['ma']: o for o in json.load(open(os.path.join(HERE, 'do-dac.json'), encoding='utf-8'))}
INK = (20, 24, 46)


def hx(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def toi(c, k=0.68):
    return tuple(int(v * k) for v in c)


def sang(c, k=0.45):
    return tuple(int(v + (255 - v) * k) for v in c)


# ---------- vẽ ----------
# Mỗi bộ phận: (nhãn, [hình]), hình = ('ell', box) | ('poly', pts) | ('line', pts, rộng). Vẽ theo thứ tự (sau đè trước).
class Ve:
    def __init__(self, W, H, t):
        self.W, self.H, self.t = W, H, t
        self.S = 2  # vẽ to gấp đôi rồi thu nhỏ cho mép mềm như ảnh AI
        self.im = Image.new('RGB', (W * self.S, H * self.S), (255, 255, 255))
        self.lb = Image.new('L', (W, H), 0)
        self.d = ImageDraw.Draw(self.im)
        self.dl = ImageDraw.Draw(self.lb)

    def _hinh(self, d, h, fill, grow, k):
        t = grow
        if h[0] == 'ell':
            x0, y0, x1, y1 = (v * k for v in h[1])
            d.ellipse([x0 - t, y0 - t, x1 + t, y1 + t], fill=fill)
        elif h[0] == 'poly':
            pts = [(x * k, y * k) for x, y in h[1]]
            d.polygon(pts, fill=fill)
            if t:
                d.line(pts + [pts[0]], fill=fill, width=int(2 * t), joint='curve')
                for p in pts:
                    d.ellipse([p[0] - t, p[1] - t, p[0] + t, p[1] + t], fill=fill)
        else:
            pts = [(x * k, y * k) for x, y in h[1]]
            w = h[2] * k / 2 + t
            for a, b in zip(pts, pts[1:]):
                d.line([a, b], fill=fill, width=int(2 * w))
            for p in pts:
                d.ellipse([p[0] - w, p[1] - w, p[0] + w, p[1] + w], fill=fill)

    def bo(self, nhan, hinh, mau, sangO=None):
        """mau: màu nền của bộ phận; sangO: hình phần sáng (tô màu sáng hơn)."""
        k, t = self.S, self.t * self.S
        for h in hinh:
            self._hinh(self.d, h, INK, t, k)
        for h in hinh:
            self._hinh(self.d, h, mau, 0, k)
            # mảng tối phía dưới (bộ ba sắc độ)
            if h[0] == 'ell':
                x0, y0, x1, y1 = h[1]
                self._hinh(self.d, ('ell', (x0 + (x1 - x0) * .08, y0 + (y1 - y0) * .55, x1 - (x1 - x0) * .08, y1)), toi(mau), 0, k)
                self._hinh(self.d, ('ell', (x0 + (x1 - x0) * .1, y0 + (y1 - y0) * .25, x1 - (x1 - x0) * .1, y1 - (y1 - y0) * .2)), mau, 0, k)
        for h in sangO or []:
            self._hinh(self.d, h, sang(mau), 0, k)
        for h in hinh:
            self._hinh(self.dl, h, nhan, self.t, 1)

    def tron(self, box, mau):  # chi tiết tô đè (mắt, nanh...), thuộc bộ phận bên dưới
        self._hinh(self.d, ('ell', box), mau, 0, self.S)

    def da_giac(self, pts, mau):
        self._hinh(self.d, ('poly', pts), mau, 0, self.S)

    def xong(self, path, nhieu=True):
        im = self.im.resize((self.W, self.H), Image.LANCZOS)
        if nhieu:  # nền "trắng" của AI hiếm khi trắng tuyệt đối
            rnd = random.Random(5)
            px = im.load()
            for y in range(0, self.H):
                for x in range(0, self.W):
                    p = px[x, y]
                    if p[0] > 245 and p[1] > 245 and p[2] > 245:
                        n = rnd.randint(-4, 0)
                        px[x, y] = (p[0] + n, p[1] + n, p[2] + n)
        im.save(path)
        return path


def mat_du(v, cx, cy, r, huong=1):
    """Mắt giận: lòng trắng vàng, con ngươi, lông mày xếch."""
    v.tron((cx - r, cy - r, cx + r, cy + r), (255, 214, 64))
    v.tron((cx - r * .45 + huong * r * .3, cy - r * .3, cx + r * .45 + huong * r * .3, cy + r * .6), INK)
    v.da_giac([(cx - r * 1.3, cy - r * 1.6), (cx + r * 1.3, cy - r * .6), (cx + r * 1.3, cy - r * .1), (cx - r * 1.3, cy - r * 1.0)], INK)


# ---------- các mẫu ----------
def em_be(path, dung=True):
    """Thợ Rèn: chéo 3/4 quay phải, đầu cả mũ trùm ~1/2 chiều cao, tay tách thân, chân dang (dung=True).
    dung=False: kiểu AI hay vẽ: nhìn chính diện, tay ép sát thân, chân khép."""
    o = DO['em-be-smith']
    W, H = 640, 800
    top, bot = 60, 760
    hh = bot - top
    v = Ve(W, H, hh / o['cao'])
    RED, DRED, SKIN, BELL = hx('#d2362e'), hx('#8c1c1f'), hx('#f6f0e2'), (214, 160, 60)
    cx = W / 2
    yc = top + hh * (0.42 if dung else 0.5)  # cằm: đúng prompt thì đầu ~2/5, kiểu AI thì đầu 1/2 như game
    if dung:
        hip = bot - hh * 0.33  # áo choàng ngắn, hai chân lộ rõ ở một phần ba dưới
        v.bo(5, [('line', [(cx - 50, yc + 40), (cx - 160, yc + 170)], 54)], DRED)             # tay sau (trái), tách thân
        v.bo(6, [('line', [(cx - 40, hip - 10), (cx - 80, bot - 25)], 62)], toi(DRED, .8))   # chân sau
        v.bo(4, [('line', [(cx + 44, hip - 10), (cx + 84, bot - 25)], 62)], DRED)             # chân trước
        v.bo(2, [('poly', [(cx - 78, yc - 10), (cx + 80, yc - 10), (cx + 98, hip), (cx - 96, hip)])], RED)  # thân, áo choàng
        v.bo(3, [('line', [(cx + 60, yc + 40), (cx + 170, yc + 170)], 54)], RED)              # tay trước (phải)
    else:
        v.bo(6, [('line', [(cx - 26, bot - 150), (cx - 26, bot - 25)], 60)], toi(DRED, .8))
        v.bo(4, [('line', [(cx + 26, bot - 150), (cx + 26, bot - 25)], 60)], DRED)
        v.bo(2, [('poly', [(cx - 80, yc - 10), (cx + 80, yc - 10), (cx + 96, bot - 120), (cx - 96, bot - 120)])], RED)
        v.bo(5, [('line', [(cx - 74, yc + 30), (cx - 84, yc + 170)], 48)], DRED)   # tay ép sát hai bên thân
        v.bo(3, [('line', [(cx + 74, yc + 30), (cx + 84, yc + 170)], 48)], RED)
    # đầu: mũ trùm có hai tai nhọn, mặt nạ trắng lệch phải (chéo 3/4)
    lx = 18 if dung else 0
    v.bo(1, [('ell', (cx - 170, top + 40, cx + 170, yc + 20)), ('poly', [(cx - 150, top + 120), (cx - 120, top), (cx - 70, top + 70)]), ('poly', [(cx + 70, top + 70), (cx + 120, top), (cx + 150, top + 120)])], RED,
         [('ell', (cx + 20, top + 70, cx + 120, top + 130))])
    v.tron((cx - 105 + lx * 2, top + (yc - top) * .33, cx + 115 + lx * 2, yc - 10), SKIN)
    v.tron((cx - 40 + lx * 2, (top + yc) / 2 + 10, cx - 10 + lx * 2, (top + yc) / 2 + 20), INK)  # mắt nhắm
    v.tron((cx + 40 + lx * 2, (top + yc) / 2 + 10, cx + 70 + lx * 2, (top + yc) / 2 + 20), INK)
    # nét lạ: mặt nạ giấy Trung thu to lệch trên mũ, chuông đồng
    v.tron((cx - 175, top + 70, cx - 85, top + 175), (250, 230, 120))
    v.tron((cx - 150, top + 110, cx - 135, top + 125), INK)
    v.bo(2, [('ell', (cx - 30, yc + 90, cx + 30, yc + 145))], BELL)
    return v.xong(path), v.lb


def heo_con(path, dung=True):
    """Heo Rừng Con: nhìn ngang quay phải, đầu bên phải, đuôi chĩa lên trái, bốn chân thẳng xuống có khe.
    dung=False: kiểu AI hay vẽ: chéo gần chính diện, bốn chân dính thành khối dưới bụng, đuôi dính lưng."""
    o = DO['heoCon']
    W, H = 900, 600
    top, bot, L, R = 40, 560, 40, 860
    v = Ve(W, H, (bot - top) / o['cao'])
    BR, DBR, TAN, ROOF = hx('#80542c'), hx('#4e3018'), hx('#c89460'), (205, 170, 80)
    hh, ww = bot - top, R - L
    X = lambda f: L + f * ww
    Y = lambda f: top + f * hh
    if dung:
        for nh, xf, m in ((7, 0.24, DBR), (5, 0.63, DBR)):  # chân xa
            v.bo(nh, [('line', [(X(xf), Y(0.6)), (X(xf - 0.01), Y(0.95))], 58)], m)
        v.bo(8, [('line', [(X(0.17), Y(0.45)), (X(0.07), Y(0.33)), (X(0.03), Y(0.2))], 34)], TAN)  # đuôi lò xo
        v.bo(1, [('ell', (X(0.12), Y(0.2), X(0.78), Y(0.72)))], BR, [('ell', (X(0.3), Y(0.26), X(0.6), Y(0.38)))])  # thân
        v.bo(1, [('poly', [(X(0.2), Y(0.3)), (X(0.45), Y(0.02)), (X(0.7), Y(0.3))])], ROOF)  # nét lạ: lưng mái tranh
        v.bo(1, [('poly', [(X(0.52), Y(0.12)), (X(0.58), Y(0.12)), (X(0.58), Y(0.0)), (X(0.52), Y(0.0))])], (150, 70, 40))  # ống khói
        for nh, xf, m in ((6, 0.32, BR), (4, 0.71, BR)):  # chân gần
            v.bo(nh, [('line', [(X(xf), Y(0.6)), (X(xf + 0.01), Y(0.95))], 64)], m)
        v.bo(2, [('ell', (X(0.66), Y(0.18), X(0.95), Y(0.62)))], BR)  # đầu
        v.bo(2, [('ell', (X(0.9), Y(0.32), X(1.0), Y(0.52)))], TAN)  # mõm
        v.tron((X(0.86), Y(0.5), X(0.9), Y(0.64)), (250, 245, 230))  # nanh
        mat_du(v, X(0.82), Y(0.33), 22)
    else:
        v.bo(1, [('ell', (X(0.1), Y(0.15), X(0.9), Y(0.85)))], BR)
        v.bo(3, [('poly', [(X(0.2), Y(0.7)), (X(0.8), Y(0.7)), (X(0.78), Y(0.98)), (X(0.22), Y(0.98))])], DBR)  # chân dính khối
        v.bo(1, [('poly', [(X(0.25), Y(0.25)), (X(0.5), Y(0.0)), (X(0.75), Y(0.25))])], ROOF)
        v.bo(2, [('ell', (X(0.3), Y(0.2), X(0.7), Y(0.7)))], BR)  # đầu nhìn thẳng giữa thân
        v.bo(2, [('ell', (X(0.42), Y(0.45), X(0.58), Y(0.62)))], TAN)
        mat_du(v, X(0.42), Y(0.36), 20)
        mat_du(v, X(0.58), Y(0.36), 20, -1)
    return v.xong(path), v.lb


def ca_chuon(path, dung=True):
    """Cá Chuồn: nhìn ngang quay phải, đầu phải, đuôi trái cùng độ cao, hai vây cánh (quạt nan) giơ lên trên lưng có khe.
    dung=False: kiểu AI hay vẽ: vây cánh dang ngang dính sát thân hai bên."""
    o = DO['caChuon']
    W, H = 900, 640
    top, bot, L, R = 40, 600, 40, 860
    v = Ve(W, H, (bot - top) / o['cao'])
    BL, LBL, FAN, TAIL = hx('#3f8fd0'), hx('#9fd8f5'), (226, 196, 120), hx('#1f5f9c')
    hh, ww = bot - top, R - L
    X = lambda f: L + f * ww
    Y = lambda f: top + f * hh
    if dung:
        v.bo(4, [('poly', [(X(0.56), Y(0.42)), (X(0.62), Y(0.02)), (X(0.8), Y(0.08)), (X(0.62), Y(0.44))])], toi(FAN, .8))  # cánh xa
        v.bo(5, [('poly', [(X(0.3), Y(0.56)), (X(0.0), Y(0.32)), (X(0.06), Y(0.56)), (X(0.0), Y(0.78))])], TAIL)  # đuôi
        v.bo(1, [('ell', (X(0.22), Y(0.4), X(0.8), Y(0.72)))], BL, [('ell', (X(0.35), Y(0.43), X(0.65), Y(0.5)))])
        v.bo(2, [('poly', [(X(0.74), Y(0.4)), (X(1.0), Y(0.53)), (X(0.74), Y(0.72))])], BL)
        mat_du(v, X(0.82), Y(0.5), 18)
        v.bo(3, [('poly', [(X(0.48), Y(0.44)), (X(0.3), Y(0.0)), (X(0.52), Y(0.0)), (X(0.56), Y(0.44))])], FAN)  # cánh gần: quạt nan
        for k in range(4):
            v.da_giac([(X(0.52), Y(0.42)), (X(0.31 + k * 0.06), Y(0.02)), (X(0.32 + k * 0.06), Y(0.02))], toi(FAN))
    else:
        v.bo(1, [('ell', (X(0.15), Y(0.38), X(0.85), Y(0.72)))], BL)
        v.bo(3, [('poly', [(X(0.4), Y(0.45)), (X(0.0), Y(0.3)), (X(0.0), Y(0.8)), (X(0.4), Y(0.65))])], FAN)  # vây dang ngang đè thân
        v.bo(4, [('poly', [(X(0.6), Y(0.45)), (X(1.0), Y(0.3)), (X(1.0), Y(0.8)), (X(0.6), Y(0.65))])], FAN)
        mat_du(v, X(0.5), Y(0.5), 18)
    return v.xong(path), v.lb


def kiem(path, dung=True):
    """Kiếm Rèn: nằm ngang, chuôi trái quấn dây, chắn tay móng ngựa, mũi phải, đôi mắt trên lưỡi.
    dung=False: kiểu AI hay vẽ: dựng chéo 45 độ, chuôi dưới trái."""
    o = DO['vk-sword-0']
    W, H = 1000, 460
    v = Ve(W, H, 420 / o['cao'] * 0.95)
    STEEL, ROPE, GOLD = hx('#b4c0d4'), (190, 150, 90), hx('#e2b64e')
    if dung:
        v.bo(1, [('line', [(60, 230), (250, 230)], 70)], ROPE)  # chuôi quấn dây
        v.bo(2, [('poly', [(250, 180), (930, 200), (980, 230), (930, 260), (250, 280)])], STEEL, [('poly', [(270, 190), (900, 205), (900, 215), (270, 212)])])
        v.bo(1, [('ell', (220, 70, 300, 390))], GOLD)  # chắn tay móng ngựa
        v.tron((470, 200, 520, 255), (255, 255, 255))
        v.tron((490, 215, 512, 245), INK)
    else:
        v.bo(1, [('line', [(120, 400), (220, 300)], 70)], ROPE)
        v.bo(2, [('poly', [(200, 280), (760, 40), (800, 20), (780, 60), (240, 320)])], STEEL)
        v.bo(1, [('ell', (170, 230, 280, 350))], GOLD)
    return v.xong(path), v.lb


MAU = [
    ('em-be-smith', 'Em bé Thợ Rèn', em_be, {1: 'dau', 2: 'than', 3: 'tayT', 5: 'tayS', 4: 'chanT', 6: 'chanS'}),
    ('heoCon', 'Heo Rừng Con (bốn chân)', heo_con, {1: 'than', 2: 'dau', 4: 'chanTN', 5: 'chanTX', 6: 'chanSN', 7: 'chanSX', 8: 'duoi'}),
    ('caChuon', 'Cá Chuồn (bay)', ca_chuon, {1: 'than', 2: 'dau', 3: 'canhN', 4: 'canhX', 5: 'duoi'}),
    ('vk-sword-0', 'Kiếm Rèn (vũ khí)', kiem, {1: 'chuoi', 2: 'luoi'}),
]

JS_DO = r"""() => {
  const S = XS_S, R = S.R, A = S.nguon, bb = XS.khung(S.mat, A.w, A.h);
  const o = { ma: S.muc.ma, nguon: [A.w, A.h], bb, w: R.w, h: R.h, cao: S.tach.cao, px: Array.from(R.px, (c) => (c ? 1 : 0)), pixel: XS.pngCua(R.w, R.h, R.px) };
  if (S.kh) { const M = XS.MAU[S.kh.mau]; o.mau = S.kh.mau; o.ids = M.bo.map((b) => b.id); o.bo = Array.from(S.kh.bo); o.khop = S.kh.khop; }
  if (S.dd) { o.cam = S.dd.cam; o.mui = S.dd.mui; o.dd_w = S.dd.w; o.dd_h = S.dd.h; o.anhDo = XS_S._anhDo ? XS_S._anhDo.cv.toDataURL() : null; }
  return o; }"""
JS_TAM = r"""() => { const T = XS_UI.lamTam(true); if (!T) return null; return { w: T.w, h: T.h, fw: T.fw, fh: T.fh, dt: T.dong_tac, png: XS.pngCua(T.w, T.h, T.px) }; }"""


def png(s):
    return Image.open(io.BytesIO(base64.b64decode(s.split(',')[1]))).convert('RGBA')


def manh(im, x0, y0, w, h):
    """Số mảng rời (8 hướng, bỏ mảng 1-2 điểm) trong một khung."""
    px = im.load()
    seen = set()
    n = 0
    for y in range(y0, y0 + h):
        for x in range(x0, x0 + w):
            if (x, y) in seen or px[x, y][3] < 128:
                continue
            q = deque([(x, y)])
            seen.add((x, y))
            c = 0
            while q:
                a, b = q.popleft()
                c += 1
                for dx in (-1, 0, 1):
                    for dy in (-1, 0, 1):
                        p = (a + dx, b + dy)
                        if x0 <= p[0] < x0 + w and y0 <= p[1] < y0 + h and p not in seen and px[p][3] >= 128:
                            seen.add(p)
                            q.append(p)
            if c > 2:
                n += 1
    return n


def cham(o, lb, W0, H0, map_):
    """Tỉ lệ điểm ảnh của từng bộ phận được Tự đoán gán đúng."""
    bb, (nw, nh) = o['bb'], o['nguon']
    kx, ky = bb['w'] / o['w'], bb['h'] / o['h']
    sx, sy = W0 / nw, H0 / nh
    lp = lb.load()
    dung, tong = Counter(), Counter()
    for j in range(o['h']):
        for i in range(o['w']):
            k = j * o['w'] + i
            if not o['px'][k]:
                continue
            x = (bb['x0'] + (i + .5) * kx) * sx
            y = (bb['y0'] + (j + .5) * ky) * sy
            nhan = lp[min(W0 - 1, int(x)), min(H0 - 1, int(y))]
            if nhan not in map_:
                continue
            ten = map_[nhan]
            tong[ten] += 1
            b = o['bo'][k]
            if b != 255 and o['ids'][b] == ten:
                dung[ten] += 1
    return {t: round(dung[t] * 100 / tong[t]) for t in tong}


def chay():
    tmp = tempfile.mkdtemp()
    kq = []
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        pg = b.new_page(viewport={'width': 1280, 'height': 760})
        loi = []
        pg.on('pageerror', lambda e: loi.append(str(e)))
        pg.goto(TOOL)
        pg.wait_for_function('window.XS_UI && window.XS_S')
        for ma, ten, ve, map_ in MAU:
            for dung in (True, False):
                path = os.path.join(tmp, '%s-%d.png' % (ma, dung))
                _, lb = ve(path, dung)
                W0, H0 = Image.open(path).size
                pg.evaluate('ma => { try { localStorage.clear(); } catch (e) {} if (XS_S.buoc !== 1) XS_UI.denBuoc(1); XS_UI.moNhom(XS_UI.nhomCuaMa(ma)); }', ma)
                pg.click('.the[data-ma="%s"]' % ma)
                pg.set_input_files('#chonAnh', path)
                pg.wait_for_function('XS_S.R && XS_S.muc.ma === "%s" && XS_S.nguon' % ma)
                pg.wait_for_timeout(150)
                pg.evaluate('XS_UI.denBuoc(3)')
                pg.wait_for_timeout(250)
                o = pg.evaluate(JS_DO)
                g = DO[ma]
                r = {'ma': ma, 'ten': ten, 'dung': dung, 'game': [g['rong'], g['cao']], 'ra': [o['w'], o['h']]}
                r['ti_le_game'] = round(g['rong'] / g['cao'], 2)
                r['ti_le_ra'] = round(o['w'] / o['h'], 2)
                if ma.startswith('vk-'):
                    # điểm cầm phải rơi vào chuôi (phần trái), mũi ở mép phải
                    r['cam'] = [round(v, 1) for v in o['cam']]
                    r['mui'] = [round(v, 1) for v in o['mui']]
                    r['nam_ngang'] = o['w'] > o['h'] * 1.25
                    bb, (nw, nh) = o['bb'], o['nguon']
                    sx = (bb['x0'] + (o['cam'][0] - 1) * bb['w'] / o['w']) * W0 / nw
                    sy = (bb['y0'] + (o['cam'][1] - 1) * bb['h'] / o['h']) * H0 / nh
                    r['cam_o_chuoi'] = lb.getpixel((min(W0 - 1, int(sx)), min(H0 - 1, int(sy)))) == 1
                    r['mui_ben_phai'] = o['mui'][0] >= o['dd_w'] - 2
                    tam = None
                else:
                    r['mau'] = o['mau']
                    r['dung_bo'] = cham(o, lb, W0, H0, map_)
                    pg.evaluate('XS_UI.denBuoc(4)')
                    pg.wait_for_timeout(200)
                    tam = pg.evaluate(JS_TAM)
                    T = png(tam['png'])
                    vo = {}
                    for ten_dt, d in tam['dt'].items():
                        vo[ten_dt] = max(manh(T, i * tam['fw'], d['hang'] * tam['fh'], tam['fw'], tam['fh']) for i in range(d['so']))
                    r['manh_roi'] = vo
                kq.append(r)
                if dung or True:
                    luu_anh(ma, dung, path, o, tam)
        b.close()
    if loi:
        print('LỖI TRANG', loi[:3])
    return kq


def luu_anh(ma, dung, path, o, tam):
    """Ảnh cho tài liệu: ảnh đưa vào | hình pixel (bộ phận tô màu) | các khung Đi (hoặc vũ khí thu nhỏ)."""
    vao = Image.open(path).convert('RGB')
    vao.thumbnail((300, 300))
    k = max(3, 260 // max(o['w'], o['h']))
    pix = png(o['pixel']).resize((o['w'] * k, o['h'] * k), Image.NEAREST)
    o_bo = None
    if o.get('bo'):
        MB = [(255, 90, 70), (255, 210, 60), (63, 208, 160), (74, 163, 255), (200, 107, 255), (255, 154, 60), (155, 224, 90), (255, 111, 176)]
        o_bo = Image.new('RGBA', (o['w'], o['h']), (0, 0, 0, 0))
        p = o_bo.load()
        for j in range(o['h']):
            for i in range(o['w']):
                v = o['bo'][j * o['w'] + i]
                if o['px'][j * o['w'] + i] and v != 255:
                    p[i, j] = MB[v % 8] + (255,)
        o_bo = o_bo.resize((o['w'] * k, o['h'] * k), Image.NEAREST)
    khung = []
    if tam:
        T = png(tam['png'])
        for ten in ('move', 'atk'):
            d = tam['dt'][ten]
            for i in range(0, d['so'], max(1, d['so'] // 4)):
                f = T.crop((i * tam['fw'], d['hang'] * tam['fh'], (i + 1) * tam['fw'], (d['hang'] + 1) * tam['fh']))
                khung.append(f.resize((tam['fw'] * 3, tam['fh'] * 3), Image.NEAREST))
    W = vao.width + pix.width * (2 if o_bo else 1) + sum(f.width for f in khung[:8]) + 20 * (3 + len(khung[:8]))
    H = max([vao.height, pix.height] + [f.height for f in khung]) + 20
    S = Image.new('RGB', (W, H), (255, 255, 255) if dung else (255, 238, 236))
    x = 10
    S.paste(vao, (x, 10)); x += vao.width + 20
    nen = Image.new('RGBA', pix.size, (230, 236, 240, 255)); nen.alpha_composite(pix); S.paste(nen.convert('RGB'), (x, 10)); x += pix.width + 20
    if o_bo:
        nen = Image.new('RGBA', o_bo.size, (40, 40, 48, 255)); nen.alpha_composite(o_bo); S.paste(nen.convert('RGB'), (x, 10)); x += o_bo.width + 20
    for f in khung[:8]:
        nen = Image.new('RGBA', f.size, (230, 236, 240, 255)); nen.alpha_composite(f); S.paste(nen.convert('RGB'), (x, 10)); x += f.width + 10
    S.save(os.path.join(DOCS, 'thu-prompt-%s%s.png' % (ma, '' if dung else '-kieu-ai')), optimize=True)


if __name__ == '__main__':
    kq = chay()
    print(json.dumps(kq, ensure_ascii=False, indent=1))
    with open(os.path.join(HERE, 'thu-ket-qua.json'), 'w', encoding='utf-8') as f:
        json.dump(kq, f, ensure_ascii=False, indent=1)
