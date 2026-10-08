# Sinh nguồn pixel bản đồ chọn ải chương 2–5 (canh/chuong-<id>, 320×180) — claude/sua-giao-dien-10
# Trước đây 4 chương chỉ có trời + 3 tam giác núi (nền tạm). Bản đồ vẽ theo kiểu chương 1 (nhìn từ trên, núi bóng 3 tông,
# cây tán tròn, đường đất, sông) + đặc trưng từng truyện. Chừa chỗ huy hiệu ải (toạ độ ui.js renderCampaign: 640×382 → ảnh cover).
# Chạy: python3 tools/pixel/sinh-ban-do-chuong.py && node tools/build-pixel.js canh/chuong-
import math, random, os

W, H = 320, 180
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'src', 'canh')

# huy hiệu ải (ui.js): x/640, y/382 trên khung; ảnh trải khít khung (css .cp-bgimg.fill) → toạ độ ảnh tỉ lệ thẳng
def node(x, y): return (x / 640 * W, y / 382 * H)
N3 = [node(110, 270), node(320, 150), node(530, 270)]
N2 = [node(110, 270), node(530, 150)]


class Canvas:
    def __init__(s, fill):
        s.p = [[fill] * W for _ in range(H)]
    def put(s, x, y, c):
        x, y = int(round(x)), int(round(y))
        if 0 <= x < W and 0 <= y < H and c: s.p[y][x] = c
    def get(s, x, y):
        x, y = int(x), int(y)
        return s.p[y][x] if 0 <= x < W and 0 <= y < H else None
    def rect(s, x0, y0, x1, y1, c):
        for y in range(int(y0), int(y1)):
            for x in range(int(x0), int(x1)): s.put(x, y, c)
    def disc(s, cx, cy, rx, ry, c, where=None):
        for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
            for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
                if ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1 and (where is None or where(s.get(x, y))): s.put(x, y, c)
    def poly(s, pts, c):
        ys = [p[1] for p in pts]
        for y in range(int(min(ys)), int(max(ys)) + 1):
            xs = []
            for i in range(len(pts)):
                (x0, y0), (x1, y1) = pts[i], pts[(i + 1) % len(pts)]
                if (y0 <= y + .5 < y1) or (y1 <= y + .5 < y0): xs.append(x0 + (y + .5 - y0) * (x1 - x0) / (y1 - y0))
            xs.sort()
            for a, b in zip(xs[::2], xs[1::2]):
                for x in range(int(round(a)), int(round(b))): s.put(x, y, c)
    def stroke(s, pts, w, c, where=None):
        # đường đi qua các điểm, bề rộng w (sông, đường đất)
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            n = int(max(abs(x1 - x0), abs(y1 - y0))) + 1
            for k in range(n + 1):
                t = k / n
                s.disc(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, w / 2, w / 2, c, where)


def smooth(pts, steps=8):
    # Catmull-Rom qua các điểm điều khiển → đường cong mượt
    out = []
    P = [pts[0]] + pts + [pts[-1]]
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        for k in range(steps):
            t = k / steps
            out.append(tuple(.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t * t + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t ** 3) for j in (0, 1)))
    out.append(pts[-1])
    return out


def texture(cv, rnd, base, tones, dens=.08, where=None):
    # rắc điểm tông khác lên nền (cỏ, cát, nước) — không phải khối phẳng
    for y in range(H):
        for x in range(W):
            if cv.p[y][x] == base and (where is None or where(x, y)) and rnd.random() < dens: cv.p[y][x] = rnd.choice(tones)


def tree(cv, x, y, r=4, dark='la-toi', mid='la', hi='la-ma', trunk='dat-toi'):
    cv.disc(x + 1, y + r * .7 + 1, r * .9, r * .45, 'toi')                      # bóng đổ
    cv.rect(x - .5, y + r * .4, x + 1.5, y + r + 1, trunk)
    cv.disc(x, y, r, r * .9, dark)
    cv.disc(x - .6, y - .6, r - 1, r * .9 - 1, mid)
    cv.disc(x - r * .35, y - r * .4, max(1, r * .4), max(1, r * .35), hi)


def mountain(cv, x, y, w, h, dark='dat-toi', mid='dat', hi='dat-sang', snow=None):
    cv.poly([(x - w / 2, y), (x, y - h), (x + w / 2, y)], mid)
    cv.poly([(x, y - h), (x + w / 2, y), (x + w * .12, y)], dark)                # sườn khuất
    cv.poly([(x - w * .08, y - h * .8), (x, y - h), (x - w * .22, y - h * .45)], hi)
    if snow: cv.poly([(x - w * .1, y - h * .8), (x, y - h), (x + w * .1, y - h * .8)], snow)
    rnd = random.Random(int(x * 7 + y))                                           # vân đá / sườn núi
    for k in range(int(w * h / 10)):
        px, py = x + rnd.uniform(-w / 2, w / 2), y - rnd.uniform(0, h)
        if py > y - h * (1 - abs(px - x) / (w / 2)) + 2:
            for j in range(rnd.randint(2, 4)): cv.put(px + j, py + j * (1 if px > x else -1) * .5, dark if px > x + w * .12 else hi if rnd.random() < .3 else dark)
    for k in range(0, int(w / 2)):                                                # viền tối dưới chân
        cv.put(x - w / 2 + k * 2, y, 'toi')


def hut(cv, x, y, roof='cat', roof_d='dong', wall='dat-sang', w=9):
    cv.rect(x - w / 2 + 1, y - 3, x + w / 2 - 1, y + 2, wall)
    cv.rect(x - 1, y - 1, x + 1, y + 2, 'toi')
    cv.poly([(x - w / 2 - 1, y - 2), (x, y - 7), (x + w / 2 + 1, y - 2)], roof)
    cv.poly([(x, y - 7), (x + w / 2 + 1, y - 2), (x + 1, y - 2)], roof_d)
    cv.rect(x - w / 2, y + 2, x + w / 2 + 1, y + 3, 'toi')


def bamboo(cv, x, y, n=5, h=12):
    # khóm tre: thân đốt xanh đậm + tán lá nhọn
    x, y = int(x), int(y)
    cv.disc(x + n, y + 2, n + 2, 2, 'la-toi')
    for j in range(n):
        xx, top = x + j * 2, y - h + (j * 5) % 4
        cv.rect(xx, top, xx + 1, y + 2, 'la' if j % 2 else 'reu')
        for yy in range(top + 3, y, 4): cv.put(xx, yy, 'la-toi')
    cv.disc(x + n, y - h, n + 2, 3, 'la-toi'); cv.disc(x + n - 1, y - h - 1, n + 1, 2, 'la'); cv.put(x + n - 2, y - h - 2, 'la-sang')


def write(name, title, cv):
    cols = sorted({c for row in cv.p for c in row})
    keys = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    m = dict(zip(cols, keys))
    with open(os.path.join(OUT, f'chuong-{name}.txt'), 'w', encoding='utf-8') as f:
        f.write(f'# bản đồ chọn ải · {title} — sinh bằng tools/pixel/sinh-ban-do-chuong.py (claude/sua-giao-dien-10), không sửa tay.\n')
        f.write('# Nhìn từ trên như bản đồ chương 1: đường đất qua các ải, đặc trưng truyện, chừa chỗ huy hiệu ải.\n')
        f.write(f'name: bản đồ chọn ải · {title}\nsize: {W}x{H}\ncolors:\n')
        for c in cols: f.write(f'  {m[c]} = {c}\n')
        f.write('\npart k0\n')
        for row in cv.p: f.write(''.join(m[c] for c in row) + '\n')
        f.write('end\n\nanim main fps=1 once\nframe main\n  use k0\nend\n')


def scatter_trees(cv, rnd, n, box, avoid, r=(3, 5), **kw):
    x0, y0, x1, y1 = box
    for _ in range(n):
        x, y = rnd.uniform(x0, x1), rnd.uniform(y0, y1)
        if any(math.hypot(x - ax, y - ay) < ar for ax, ay, ar in avoid): continue
        tree(cv, x, y, rnd.randint(*r), **kw)


def road(cv, pts, w=5):
    P = smooth(pts)
    cv.stroke(P, w + 2, 'dat-toi')
    cv.stroke(P, w, 'dat')
    cv.stroke(P, max(1, w - 3), 'dat-sang')
    return P


# ---------------- Thạch Sanh: rừng sâu, miếu Chằn Tinh, gốc đa cổ thụ, hang Đại Bàng
def thachsanh():
    rnd = random.Random(8)
    cv = Canvas('la')
    texture(cv, rnd, 'la', ['la-toi', 'reu', 'reu-toi'], .18)
    (a, b, c) = N3
    # núi đá + vách hang góc phải trên
    for mx, my, mw, mh in [(250, 70, 90, 60), (300, 74, 70, 52), (205, 62, 60, 40)]:
        mountain(cv, mx, my, mw, mh, 'sat-toi', 'sat', 'sat-sang')
    cv.rect(0, 0, W, 6, 'la-toi')
    # suối chảy chéo
    river = smooth([(-5, 40), (40, 52), (95, 44), (130, 70), (120, 110), (150, 150), (140, 185)])
    cv.stroke(river, 8, 'cham'); cv.stroke(river, 6, 'nuoc'); cv.stroke(river, 2, 'nuoc-sang')
    road(cv, [(-4, 150), (a[0], a[1] + 6), (110, 110), (b[0], b[1] + 8), (215, 100), (c[0], c[1] + 6), (330, 140)])
    # cầu gỗ chỗ đường qua suối
    for (x, y) in [(118, 102), (151, 70)]: cv.rect(x - 5, y - 2, x + 5, y + 3, 'dat-sang'); cv.rect(x - 5, y + 3, x + 5, y + 4, 'dat-toi')
    avoid = [(p[0], p[1] + 4, 16) for p in N3]
    # miếu Chằn Tinh (mái ngói son, tường vàng đất) cạnh ải 1
    mx, my = a[0] + 22, a[1] - 14
    cv.rect(mx - 9, my - 2, mx + 9, my + 7, 'cat'); cv.rect(mx - 2, my + 2, mx + 2, my + 7, 'toi')
    cv.poly([(mx - 12, my - 1), (mx - 7, my - 8), (mx + 7, my - 8), (mx + 12, my - 1)], 'son')
    cv.rect(mx - 12, my - 2, mx + 12, my - 1, 'son-toi'); cv.rect(mx - 7, my - 9, mx + 7, my - 8, 'son-sang')
    cv.put(mx - 12, my - 2, 'son-sang'); cv.put(mx + 12, my - 2, 'son-sang')
    for k in (-7, 6): cv.rect(mx + k, my + 9, mx + k + 2, my + 12, 'lua')            # đèn lồng
    # gốc đa cổ thụ ở ải 2: tán rất to, rễ phụ thả xuống
    gx, gy = b[0] - 2, b[1] - 24
    cv.disc(gx + 4, gy + 15, 20, 4, 'la-toi')
    for k in range(-16, 18, 3): cv.rect(gx + k, gy + 2, gx + k + 1, gy + 10 + (k * 7) % 6, 'dat-toi' if k % 2 else 'dat')
    cv.rect(gx - 3, gy, gx + 4, gy + 16, 'dat'); cv.rect(gx + 2, gy, gx + 4, gy + 16, 'dat-toi')
    cv.disc(gx, gy - 3, 24, 13, 'la-toi')
    for (dx, dy, r) in [(-12, -4, 10), (10, -3, 11), (0, -9, 11), (-4, 2, 9), (14, 3, 7), (-17, 2, 6)]:
        cv.disc(gx + dx, gy + dy, r, r * .7, 'la'); cv.disc(gx + dx - r * .3, gy + dy - r * .3, r * .45, r * .3, 'la-ma')
    texture(cv, rnd, 'la', ['la-toi', 'reu'], .25, where=lambda x, y: math.hypot((x - gx) / 22, (y - gy + 4) / 11) < 1)
    # hang Đại Bàng: miệng hang tối trong vách đá
    hx, hy = c[0] + 4, c[1] - 26
    cv.disc(hx, hy, 12, 9, 'sat-toi'); cv.disc(hx, hy + 1, 8, 6, 'khoi'); cv.disc(hx, hy + 2, 5, 4, 'vien')
    for k in range(-10, 11, 3): cv.put(hx + k, hy + 9 + (k % 2), 'sat-sang')
    # đại bàng bay trên vách
    ex, ey = 282, 22
    for k in range(9): cv.put(ex - k, ey + k // 2, 'vien'); cv.put(ex + k, ey + k // 2, 'vien')
    cv.rect(ex - 1, ey, ex + 2, ey + 4, 'dat-toi')
    # rừng dày quanh viền
    scatter_trees(cv, rnd, 140, (0, 0, W, H), avoid + [(gx, gy, 28), (mx, my, 15), (hx, hy, 16), (250, 45, 40), (295, 50, 30)], (3, 6))
    for x in range(0, W, 7): tree(cv, x + rnd.randint(-2, 2), H - 3 + rnd.randint(-2, 1), rnd.randint(4, 6))
    # đom đóm / nấm đỏ
    for _ in range(40): cv.put(rnd.randrange(W), rnd.randrange(30, H), rnd.choice(['vang-sang', 'son-sang']))
    write('thachsanh', 'Thạch Sanh', cv)


# ---------------- Thánh Gióng: làng Phù Đổng, ruộng lúa, đồng trâu, khóm tre, núi Sóc
def giong():
    rnd = random.Random(11)
    cv = Canvas('la-ma')
    texture(cv, rnd, 'la-ma', ['la', 'reu-sang'], .15)
    a, b = N2
    # núi Sóc góc phải trên
    mountain(cv, 268, 52, 110, 52, 'reu-toi', 'reu', 'reu-sang'); mountain(cv, 315, 58, 70, 40, 'la-toi', 'la', 'reu-sang')
    mountain(cv, 215, 50, 60, 30, 'reu-toi', 'reu', 'reu-sang')
    # ruộng lúa bậc ô vuông có bờ
    for row in range(5):
        for col in range(8):
            x, y = 104 + col * 25 + (row % 2) * 6, 70 + row * 21
            if math.hypot(x + 10 - b[0], y + 8 - b[1]) < 22 or math.hypot(x + 10 - a[0], y + 8 - a[1]) < 30: continue
            if x > W - 4: continue
            ripe = rnd.random() < .45
            cv.rect(x, y, x + 22, y + 17, 'dat')
            cv.rect(x + 1, y + 1, x + 21, y + 16, 'cat' if ripe else ('la-sang' if rnd.random() < .5 else 'nuoc-sang'))
            texture(cv, rnd, 'cat' if ripe else 'la-sang', ['vang-sang', 'dong-sang'] if ripe else ['la-ma'], .3,
                    where=lambda xx, yy, x=x, y=y: x < xx < x + 22 and y < yy < y + 17)
            if not ripe: texture(cv, rnd, 'nuoc-sang', ['troi', 'la-ma'], .25, where=lambda xx, yy, x=x, y=y: x < xx < x + 22 and y < yy < y + 17)
    road(cv, [(-4, 160), (a[0], a[1] + 6), (130, 115), (185, 92), (b[0], b[1] + 6), (330, 60)], 6)
    # làng Phù Đổng: nhà tranh + luỹ tre bao quanh ải 1
    for (dx, dy) in [(-30, -26), (-14, -32), (6, -30), (24, -22), (30, -4), (-36, -6)]:
        hut(cv, a[0] + dx, a[1] + dy)
    for k in range(0, 360, 14):
        t = math.radians(k)
        x, y = a[0] + 46 * math.cos(t), a[1] - 10 + 30 * math.sin(t)
        if 0 < x < W and abs(t - math.radians(20)) > .3: bamboo(cv, x, y, 3, 7)
    # trâu trên đồng (ải 2)
    for (x, y) in [(b[0] - 26, b[1] + 8), (b[0] + 24, b[1] + 14), (b[0] - 8, b[1] + 26)]:
        cv.disc(x, y, 4, 2.5, 'khoi'); cv.rect(x + 3, y - 3, x + 6, y, 'khoi'); cv.put(x + 6, y - 4, 'trang'); cv.put(x + 3, y - 4, 'trang')
    # khóm tre lớn hai bên + ngựa sắt cháy lửa (dấu chân Gióng) trên đường
    for (x, y) in [(20, 30), (60, 18), (180, 160), (300, 120), (240, 165), (95, 160), (14, 120), (60, 172), (130, 30), (300, 168)]:
        bamboo(cv, x, y)
    for k, (x, y) in enumerate([(150, 104), (162, 98), (174, 94)]): cv.disc(x, y, 1.5, 1, 'lua' if k % 2 else 'son-sang')
    scatter_trees(cv, rnd, 60, (0, 0, W, H), [(a[0], a[1] - 8, 52), (b[0], b[1], 30), (215, 115, 115), (270, 40, 55)], (3, 5))
    write('giong', 'Thánh Gióng', cv)


# ---------------- Lạc Long Quân: bờ biển Đông, thuyền, Ngư Tinh dưới nước, đầm Xác Cáo (Hồ Tây) lau sậy
def llq():
    rnd = random.Random(13)
    cv = Canvas('la')
    texture(cv, rnd, 'la', ['la-ma', 'reu'], .14)
    a, b = N2
    # biển phía trái-dưới: bờ cong
    coast = lambda x: 70 + 0.55 * x + 8 * math.sin(x / 14)
    for x in range(W):
        cy = coast(x)
        for y in range(H):
            if y > cy + 8: cv.put(x, y, 'nuoc' if y < cy + 30 else 'cham-sang' if y < cy + 60 else 'cham')
            elif y > cy: cv.put(x, y, 'cat')
            elif y > cy - 3: cv.put(x, y, 'trang-xam')
    texture(cv, rnd, 'cat', ['vang-sang', 'trang-xam'], .15)
    for c in ('nuoc', 'cham-sang', 'cham'): texture(cv, rnd, c, ['nuoc-sang'] if c == 'nuoc' else ['nuoc'], .06)
    for _ in range(70):                                                              # sóng bạc đầu
        x, y = rnd.randrange(W), rnd.randrange(H)
        if cv.get(x, y) in ('nuoc', 'cham-sang', 'cham'):
            for k in range(4): cv.put(x + k, y - (1 if k in (1, 2) else 0), 'troi')
    # ải 1 Biển Đông nằm trên bãi cát → kéo bãi ra thành mũi đất
    cv.disc(a[0] + 4, a[1] + 4, 34, 20, 'cat', where=lambda c: c in ('nuoc', 'cham-sang', 'cham', 'trang-xam'))
    texture(cv, rnd, 'cat', ['vang-sang'], .05)
    # đầm Xác Cáo góc phải trên: nước đầm xanh ngọc, lau sậy, sen
    cv.disc(b[0] + 6, b[1] - 6, 48, 30, 'reu-toi'); cv.disc(b[0] + 6, b[1] - 7, 45, 27, 'ngoc')
    texture(cv, rnd, 'ngoc', ['ngoc-sang', 'reu'], .1)
    for _ in range(60):
        t = rnd.uniform(0, 2 * math.pi); x, y = b[0] + 6 + 46 * math.cos(t), b[1] - 7 + 28 * math.sin(t)
        cv.rect(x, y - 5, x + 1, y + 1, 'reu-sang'); cv.put(x, y - 6, 'cat')
    for _ in range(12):
        x, y = b[0] + rnd.uniform(-34, 40), b[1] + rnd.uniform(-28, 14)
        if cv.get(x, y) == 'ngoc' and math.hypot(x - b[0], y - b[1]) > 14: cv.disc(x, y, 2.5, 1.5, 'la'); cv.put(x, y - 1, 'hong')
    # bóng Hồ Tinh chín đuôi mờ trong đầm
    for k in range(9): cv.put(b[0] + 28 + k, b[1] - 24 + int(2 * math.sin(k)), 'tim')
    road(cv, [(a[0] + 4, a[1] + 6), (110, 105), (170, 95), (b[0] - 40, b[1] + 10), (b[0], b[1] + 6)], 5)
    # thuyền + Ngư Tinh (bóng cá khổng lồ) ngoài khơi
    for (x, y) in [(40, 168), (150, 172), (200, 176)]:
        cv.poly([(x - 7, y), (x + 7, y), (x + 4, y + 3), (x - 4, y + 3)], 'dat'); cv.rect(x, y - 8, x + 1, y, 'dat-toi')
        cv.poly([(x + 1, y - 8), (x + 6, y - 2), (x + 1, y - 2)], 'trang')
    fx, fy = 95, 166
    cv.disc(fx, fy, 16, 5, 'cham-toi'); cv.poly([(fx + 14, fy), (fx + 22, fy - 5), (fx + 22, fy + 5)], 'cham-toi'); cv.put(fx - 10, fy - 1, 'son-sang')
    # dừa / cây ven biển, rừng phía trên
    for (x, y) in [(20, 74), (100, 104), (36, 92), (128, 118)]:
        cv.rect(x, y - 8, x + 1, y + 2, 'dat-toi')
        for dx in (-5, -3, 3, 5): cv.put(x + dx, y - 9 + abs(dx) // 2, 'la'); cv.put(x + dx // 2, y - 9, 'la-ma')
    scatter_trees(cv, rnd, 60, (0, 0, 230, 70), [(b[0], b[1], 55)], (3, 5))
    write('llq', 'Lạc Long Quân', cv)


# ---------------- An Dương Vương: thành Cổ Loa xoắn ốc (vòng luỹ + hào), đồng, biển Mộ Dạ, Rùa Vàng
def adv():
    rnd = random.Random(15)
    cv = Canvas('la-ma')
    texture(cv, rnd, 'la-ma', ['la', 'reu-sang'], .15)
    a, b = N2
    # biển Mộ Dạ góc phải trên
    for x in range(W):
        for y in range(H):
            d = (x - 330) ** 2 / 120 ** 2 + (y + 10) ** 2 / 90 ** 2
            if d < 1: cv.put(x, y, 'cham' if d < .5 else 'nuoc' if d < .85 else 'cat')
    texture(cv, rnd, 'nuoc', ['nuoc-sang'], .08); texture(cv, rnd, 'cham', ['cham-sang'], .08)
    # Rùa Vàng rẽ nước
    tx, ty = 292, 22
    cv.disc(tx, ty, 9, 6, 'dong-toi'); cv.disc(tx, ty, 7, 4.5, 'vang-nghe'); cv.disc(tx - 2, ty - 1, 3, 2, 'vang-sang')
    cv.disc(tx - 10, ty + 1, 2.5, 2, 'reu'); cv.stroke([(tx + 9, ty + 3), (tx + 26, ty + 8)], 2, 'troi')
    # thành Cổ Loa: 3 vòng luỹ đất + hào nước, hở cổng theo đường xoắn
    cx, cy = a[0] + 6, a[1] - 18
    for r, gap in [(58, 0.4), (40, 2.2), (24, 4.0)]:
        for k in range(720):
            t = k / 720 * 2 * math.pi
            if abs((t - gap + math.pi) % (2 * math.pi) - math.pi) < .22: continue
            x, y = cx + r * math.cos(t), cy + r * .62 * math.sin(t)
            cv.disc(x, y + 3, 3, 2, 'nuoc')                                              # hào ngoài luỹ
            cv.disc(x, y, 2.5, 2, 'dat'); cv.put(x, y - 1, 'dat-sang')
        for k in range(0, 360, 30):
            t = math.radians(k)
            if abs((t - gap + math.pi) % (2 * math.pi) - math.pi) > .3: cv.rect(cx + r * math.cos(t) - 1, cy + r * .62 * math.sin(t) - 4, cx + r * math.cos(t) + 1, cy + r * .62 * math.sin(t), 'dat-toi')
    # điện trong cùng (Loa Thành) + cờ
    ex, ey = cx, cy - 2
    cv.rect(ex - 9, ey - 2, ex + 9, ey + 5, 'son'); cv.rect(ex - 2, ey + 1, ex + 2, ey + 5, 'toi')
    cv.poly([(ex - 12, ey - 1), (ex - 7, ey - 7), (ex + 7, ey - 7), (ex + 12, ey - 1)], 'khoi'); cv.rect(ex - 7, ey - 8, ex + 7, ey - 7, 'sat')
    cv.rect(ex + 10, ey - 16, ex + 11, ey - 2, 'dat-toi'); cv.rect(ex + 11, ey - 16, ex + 16, ey - 12, 'vang-nghe')
    # nỏ thần trên mặt thành
    cv.stroke([(cx - 30, cy - 22), (cx - 20, cy - 26)], 1.5, 'dat-toi'); cv.stroke([(cx - 26, cy - 28), (cx - 24, cy - 20)], 1, 'vang-nghe')
    road(cv, [(a[0] + 2, a[1] + 6), (cx + 40, cy + 30), (150, 110), (200, 92), (b[0], b[1] + 6), (b[0] + 20, b[1] - 10)], 5)
    # ruộng + doanh trại giặc Triệu (lều đỏ) ở xa
    for row in range(3):
        for col in range(4):
            x, y = 150 + col * 26, 125 + row * 18
            cv.rect(x, y, x + 22, y + 14, 'dat'); cv.rect(x + 1, y + 1, x + 21, y + 13, 'la-sang' if (row + col) % 2 else 'cat')
    for (x, y) in [(215, 150), (232, 158), (250, 150), (268, 160)]:
        cv.poly([(x - 6, y + 3), (x, y - 5), (x + 6, y + 3)], 'son-toi'); cv.poly([(x - 6, y + 3), (x, y - 5), (x, y + 3)], 'son')
    scatter_trees(cv, rnd, 50, (0, 0, W, H), [(cx, cy, 70), (b[0], b[1], 20), (200, 140, 60), (300, 20, 90)], (3, 5))
    write('adv', 'An Dương Vương', cv)


if __name__ == '__main__':
    thachsanh(); giong(); llq(); adv()
    print('đã sinh tools/pixel/src/canh/chuong-{thachsanh,giong,llq,adv}.txt')
