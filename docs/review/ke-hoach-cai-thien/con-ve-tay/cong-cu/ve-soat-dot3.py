"""Ảnh soát tĩnh đợt 3 (không chạy game): ../xem-dot3.png.
Mỗi hàng một ảnh mới đọc đúng từ game/art/custom/hu-*.sprite.json, ở CỠ GAME (co như code gọi) ×3, đã nhuộm như js/fx_anh.js FA.nhuom:
  trái: đặt cạnh / lên khung đứng (idle khung 1) của quái dùng nó, đúng điểm đặt theo code (chân quái = gốc, dấu + đỏ); phải: dải mọi khung.
tam-giac-bua: vẽ bằng đúng phép affine của FA.veAffine lên một tam giác vùng va chạm mẫu (R 36, dẹt 0,75 như js/ky_nang_quai.js),
đường xanh = cạnh tam giác vùng thật → 3 đỉnh ảnh phải trùng 3 đỉnh xanh. tuong-song: hai đoạn tường chừa khe, vạch xanh = dải trúng |x − z.x| < 6.
    python3 ve-soat-dot3.py"""
import os, json, io, base64, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont

DAY = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../..'))
RA = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'xem-dot3.png'))
K = 3
NEN = (58, 54, 66, 255)
try:
    FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 14)
except Exception:
    FONT = ImageFont.load_default()


def doc(ma):
    t = json.load(open(os.path.join(DAY, 'game/art/custom', ma + '.sprite.json'), encoding='utf-8'))
    im = Image.open(io.BytesIO(base64.b64decode(t['tam'].split(',', 1)[1]))).convert('RGBA')
    return t, im


def khung_hu(ma, f, mau=None):  # ảnh khung f ở net (điểm ảnh = 1/net điểm game), đã nhuộm
    t, im = doc(ma); n, fw, fh = t.get('net', 1), t['khung_rong'], t['khung_cao']
    k = im.crop((f * fw * n, 0, (f + 1) * fw * n, fh * n))
    if mau:
        a = np.array(k).astype(np.float32); M = [int(mau[i:i + 2], 16) for i in (1, 3, 5)]
        for c in range(3): a[..., c] = np.minimum(255, a[..., c] * M[c] / 255 + a[..., c] * 0.25)
        k = Image.fromarray(a.astype(np.uint8))
    return t, k


def quai(ma):  # khung idle 1 của ảnh AI quái + neo (chân) theo điểm game
    t, im = doc(ma); n = t.get('net', 1); fw, fh = t['khung_rong'], t['khung_cao']
    return im.crop((0, 0, fw * n, fh * n)), t['goc'], n


class Canvas:
    def __init__(s, w, h):
        s.im = Image.new('RGBA', (w * K, h * K), NEN); s.d = ImageDraw.Draw(s.im)

    def dan(s, img, net, gx, gy, x, y, co=1.0, lat=False, goc=0.0, mo=1.0):
        """dán ảnh (ảnh có net điểm / điểm game, neo gx, gy điểm game) sao cho neo ở (x, y) điểm game, co, lật, xoay (rad)."""
        sc = co * K / net
        w, h = max(1, round(img.width * sc)), max(1, round(img.height * sc))
        b = img.resize((w, h), Image.NEAREST)
        ax, ay = gx * net * sc, gy * net * sc
        if lat: b = b.transpose(Image.FLIP_LEFT_RIGHT); ax = w - ax
        if mo < 1: b.putalpha(Image.fromarray((np.array(b.split()[3]) * mo).astype(np.uint8)))
        if goc:
            pad = int(math.hypot(w, h)) + 4; L = Image.new('RGBA', (2 * pad, 2 * pad)); L.alpha_composite(b, (int(pad - ax), int(pad - ay)))
            b = L.rotate(-math.degrees(goc), resample=Image.NEAREST, center=(pad, pad)); ax = ay = pad
        s.im.alpha_composite(b, (int(round(x * K - ax)), int(round(y * K - ay))))

    def cong(s, x, y, col=(255, 60, 60, 255)):
        X, Y = x * K, y * K; s.d.line((X - 4, Y, X + 4, Y), fill=col); s.d.line((X, Y - 4, X, Y + 4), fill=col)

    def chu(s, x, y, txt, col=(235, 230, 240, 255)):
        s.d.text((x * K, y * K), txt, fill=col, font=FONT)


def hu(ma):
    t, _ = doc(ma); return t


def dai(cv, ma, x, y, co, mau=None, lat=False):  # dải mọi khung, cách nhau theo bề rộng khung
    t = hu(ma); so = t['so']; fw = t['khung_rong'] * co
    for f in range(so):
        _, k = khung_hu(ma, f, mau)
        cv.dan(k, t['net'], t['goc'][0], t['goc'][1], x + f * (fw + 4) + t['goc'][0] * co, y, co, lat)
    return x + so * (fw + 4)


HANG = []  # (cao hàng điểm game, hàm vẽ)


def hang(cao):
    def d(fn): HANG.append((cao, fn)); return fn
    return d


def dat_quai(cv, ma, x, y):
    im, g, n = quai(ma); cv.dan(im, n, g[0], g[1], x, y); cv.cong(x, y)


@hang(60)
def _(cv, y0):  # bot-doc: vũng độc của quái (hu-vung-quai-doc) + bọt ở vài điểm trên vũng
    cv.chu(4, y0 + 2, 'hu-bot-doc · bọt độc trên vũng độc (co 1, lớp sàn)')
    t = hu('hu-vung-quai-doc'); _, k = khung_hu('hu-vung-quai-doc', 0)
    cx, cy = 70, y0 + 40; cv.dan(k, t['net'], t['goc'][0], t['goc'][1], cx, cy, 1.0)
    tb = hu('hu-bot-doc')
    for i, (dx, dy) in enumerate([(-14, -3), (6, 4), (16, -5)]):
        _, b = khung_hu('hu-bot-doc', [1, 3, 4][i]); cv.dan(b, tb['net'], tb['goc'][0], tb['goc'][1], cx + dx, cy + dy, 1.0); cv.cong(cx + dx, cy + dy)
    dai(cv, 'hu-bot-doc', 140, y0 + 40, 1.0)


@hang(120)
def _(cv, y0):  # cao-quai: Cua Lính (tam 26, màu mặc định #dff4ff) và Cua Đá (tam 44, NGOC[1])
    cv.chu(4, y0 + 2, 'hu-cao-quai · Cua Lính (tam 26) / Cua Đá (tam 44), nhuộm cols[1]')
    for (ma, tam, mau, x) in [('cua', 26, '#dff4ff', 40), ('cuaDa', 44, '#5ae8d8', 190)]:
        q = json.load(open(os.path.join(DAY, 'game/art/custom', ma + '.sprite.json'), encoding='utf-8'))
        y = y0 + 110; dat_quai(cv, ma, x, y)
        t = hu('hu-cao-quai'); _, k = khung_hu('hu-cao-quai', 2, mau); co = max(.55, tam / 48); r = 4 + tam / 2
        cv.dan(k, t['net'], t['goc'][0], t['goc'][1], x + r, y - q['cao'] * .3, co)
    dai(cv, 'hu-cao-quai', 300, y0 + 70, max(.55, 44 / 48), '#5ae8d8')


@hang(56)
def _(cv, y0):  # lao-bui: Heo Rừng Con (tam 46) lao sang phải
    cv.chu(4, y0 + 2, 'hu-lao-bui · Heo Rừng Con (tam 46) lao sang phải: bụi + vạch phía sau')
    tam = 46; co = min(1.6, max(.7, (tam * .9 + 10) / 31)); L = 31 * co - 4; x, y = 90, y0 + 46
    t = hu('hu-lao-bui'); _, k = khung_hu('hu-lao-bui', 2); cv.dan(k, t['net'], t['goc'][0], t['goc'][1], x - L, y, co)
    dat_quai(cv, 'heoCon', x, y)
    dai(cv, 'hu-lao-bui', 150, y, co)


@hang(100)
def _(cv, y0):  # gai-toa: Cá Nóc (tam 34, #fff8e0)
    cv.chu(4, y0 + 2, 'hu-gai-toa · Cá Nóc (tam 34): vòng gai khung 4 bán kính = tam, tâm giữa thân')
    q = json.load(open(os.path.join(DAY, 'game/art/custom/caNoc.sprite.json'), encoding='utf-8'))
    x, y = 50, y0 + 80; dat_quai(cv, 'caNoc', x, y)
    t = hu('hu-gai-toa'); _, k = khung_hu('hu-gai-toa', 3, '#fff8e0'); cv.dan(k, t['net'], t['goc'][0], t['goc'][1], x, y - q['cao'] * .4, 34 / 32)
    cv.d.ellipse(((x - 34) * K, (y - q['cao'] * .4 - 34) * K, (x + 34) * K, (y - q['cao'] * .4 + 34) * K), outline=(80, 220, 255, 255))
    dai(cv, 'hu-gai-toa', 110, y - 30, 0.5, '#9a48d4')


@hang(70)
def _(cv, y0):  # tia-mom: Hoa Phun Bào Tử (DOC[1]) và Đèn Lồng Ma (LUA[1])
    cv.chu(4, y0 + 2, 'hu-tia-mom · Hoa Bào Tử (#78b818) / Đèn Lồng Ma (#ffd23c), co 1 ở miệng')
    for ma, mau, x in [('hoaBaoTu', '#78b818', 40), ('denLong', '#ffd23c', 120)]:
        q = json.load(open(os.path.join(DAY, 'game/art/custom', ma + '.sprite.json'), encoding='utf-8'))
        y = y0 + 64; dat_quai(cv, ma, x, y)
        t = hu('hu-tia-mom'); _, k = khung_hu('hu-tia-mom', 4, mau); cv.dan(k, t['net'], t['goc'][0], t['goc'][1], x + q['rong'] * .25, y - q['cao'] * .7, 1)
    dai(cv, 'hu-tia-mom', 200, y0 + 45, 1, '#78b818')


@hang(170)
def _(cv, y0):  # vong-hoi-quai: Ốc Mượn Hồn hồi máu, co 2, vòng xanh = bán kính hồi 90 (dẹt 0,6 như vòng code)
    cv.chu(4, y0 + 2, 'hu-vong-hoi-quai · Ốc Mượn Hồn (co 2): khung 4 rộng 180 = bán kính hồi 90 (elip xanh)')
    x, y = 100, y0 + 110; t = hu('hu-vong-hoi-quai'); _, k = khung_hu('hu-vong-hoi-quai', 3)
    cv.dan(k, t['net'], t['goc'][0], t['goc'][1], x, y, 2, mo=.85); dat_quai(cv, 'oc', x, y)
    cv.d.ellipse(((x - 90) * K, (y - 54) * K, (x + 90) * K, (y + 54) * K), outline=(80, 220, 255, 255))
    dai(cv, 'hu-vong-hoi-quai', 200, y + 6, 0.55)


@hang(130)
def _(cv, y0):  # tuong-song: hai đoạn tường của sóng Ngư Tinh (js/fx.js wave), chừa khe
    cv.chu(4, y0 + 2, 'hu-tuong-song · tường sóng chạy sang trái (co 0,45, xếp cách 12), khe g0..g1; vạch xanh = dải trúng z.x ± 6')
    t = hu('hu-tuong-song'); co = .45; h = t['goc'][1] * co; zx = 60; Y0, Y1 = y0 + 22, y0 + 122; g0, g1 = y0 + 60, y0 + 86
    L = []; yb = g0; i = 0
    while yb - h > Y0 - 12: L.append((yb, i)); yb -= 12; i += 1
    yb = g1 + h; i = 50
    while yb - h < Y1: L.append((yb, i)); yb += 12; i += 1
    for yb, i in sorted(L):
        _, k = khung_hu('hu-tuong-song', i % 4); cv.dan(k, t['net'], t['goc'][0], t['goc'][1], zx - 6, yb, co, lat=True)
    for xx in (zx - 6, zx + 6): cv.d.line((xx * K, Y0 * K, xx * K, Y1 * K), fill=(80, 220, 255, 255))
    for gg in (g0, g1): cv.d.line(((zx - 8) * K, gg * K, (zx + 8) * K, gg * K), fill=(255, 255, 255, 255))
    im, g, n = quai('nguTinh'); cv.dan(im, n, g[0], g[1], 190, y0 + 124, 0.5)
    dai(cv, 'hu-tuong-song', 260, y0 + 80, .7, None, True)


@hang(110)
def _(cv, y0):  # khoi-doc-nho: Nấm Chúa idle khiDoc(c, 0, -2, 30) → co 2,5
    cv.chu(4, y0 + 2, 'hu-khoi-doc-nho · Nấm Chúa đứng (khiDoc r 30: 2 làn x ± 0,85 r, co 1,9, sau thân) / Nấm Phồng chết (r 22, co 1,4)')
    t = hu('hu-khoi-doc-nho')
    for (x, r, ma, f) in [(70, 30, 'namChua', 2), (200, 22, 'namPhong', 3)]:
        y = y0 + 104; co = r / 16
        for dx, ff, lat in [(-r * .85, f, False), (r * .85, (f + 3) % 6, True)]:
            _, k = khung_hu('hu-khoi-doc-nho', ff); cv.dan(k, t['net'], t['goc'][0], t['goc'][1], x + dx, y - 2, co, lat, mo=.85)
        dat_quai(cv, ma, x, y)
    dai(cv, 'hu-khoi-doc-nho', 240, y, 1.4)


@hang(120)
def _(cv, y0):  # hao-quang-gian: Cua Đá nổi giận (rx ≈ 30)
    cv.chu(4, y0 + 2, 'hu-hao-quang-gian · Cua Đá nổi giận (rx 30 → co 1,65, dưới chân); thân nhuộm đỏ giữ như cũ')
    x, y = 80, y0 + 108; t = hu('hu-hao-quang-gian'); _, k = khung_hu('hu-hao-quang-gian', 2)
    cv.dan(k, t['net'], t['goc'][0], t['goc'][1], x, y, 2 * 30 * 1.1 / 40, mo=.95); dat_quai(cv, 'cuaDa', x, y)
    dai(cv, 'hu-hao-quang-gian', 200, y, 1.0)


@hang(120)
def _(cv, y0):  # tam-giac-bua: affine 3 đỉnh ảnh → 3 đỉnh vùng thật (như FA.veAffine)
    cv.chu(4, y0 + 2, 'hu-tam-giac-bua · Tiểu Yêu: 3 đỉnh ảnh (affine) trùng 3 đỉnh vùng va chạm (xanh), R 36, góc ngẫu nhiên')
    t, im = doc('hu-tam-giac-bua'); n = t['net']; fw, fh = t['khung_rong'], t['khung_cao']; ax, ay = t['goc']
    S = [(0, -28.01), (25.58, 14), (-25.58, 14)]
    for j, (px, g0, f) in enumerate([(70, -math.pi / 2, 3), (190, -0.4, 2), (310, 0.9, 4)]):
        py = y0 + 70; D = []
        for i in range(3):
            g = g0 + i * 2 * math.pi / 3; D.append((px + math.cos(g) * 36, py + math.sin(g) * 36 * .75))
        sx1, sy1, sx2, sy2 = S[1][0] - S[0][0], S[1][1] - S[0][1], S[2][0] - S[0][0], S[2][1] - S[0][1]
        det = sx1 * sy2 - sx2 * sy1
        ux1, uy1, ux2, uy2 = D[1][0] - D[0][0], D[1][1] - D[0][1], D[2][0] - D[0][0], D[2][1] - D[0][1]
        m11 = (ux1 * sy2 - ux2 * sy1) / det; m12 = (ux2 * sx1 - ux1 * sx2) / det; m21 = (uy1 * sy2 - uy2 * sy1) / det; m22 = (uy2 * sx1 - uy1 * sx2) / det
        tx = D[0][0] - (m11 * S[0][0] + m12 * S[0][1]); ty = D[0][1] - (m21 * S[0][0] + m22 * S[0][1])
        # ảnh (điểm ảnh net) → màn hình (điểm game ×K): p_game_img = p_px / n − (ax, ay); màn = M·p + t
        A = np.array([[m11, m12], [m21, m22]]) * K / n; T = (np.array([tx, ty]) - np.array([[m11, m12], [m21, m22]]) @ np.array([ax, ay])) * K
        Ai = np.linalg.inv(A); off = -Ai @ T
        k = im.crop((f * fw * n, 0, (f + 1) * fw * n, fh * n))
        out = k.transform(cv.im.size, Image.AFFINE, (Ai[0, 0], Ai[0, 1], off[0], Ai[1, 0], Ai[1, 1], off[1]), resample=Image.NEAREST)
        cv.im.alpha_composite(out)
        cv.d.polygon([(x * K, y * K) for x, y in D], outline=(80, 220, 255, 255))
        if j == 0:
            qm, g, nn = quai('tieuYeu'); cv.dan(qm, nn, g[0], g[1], px - 52, py + 30, 1)
    cv.chu(360, y0 + 20, 'khung 4 / 3 / 5')


W = 560
H = sum(c for c, _ in HANG) + 10
cv = Canvas(W, H); y = 4
for c, fn in HANG:
    fn(cv, y); cv.d.line((0, (y + c - 2) * K, W * K, (y + c - 2) * K), fill=(90, 86, 100, 255)); y += c
cv.im.save(RA, optimize=True)
print(RA, cv.im.size)
