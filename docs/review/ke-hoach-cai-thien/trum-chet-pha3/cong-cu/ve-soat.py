# Ảnh soát tĩnh (Pillow, KHÔNG chạy game) cho đợt trum-chet-pha3:
#  ../xem-vong-pha3.png     vị trí cột / đạn / vành của mỗi chiêu tròn pha 3 quanh tâm trùm, TRƯỚC và SAU khi sửa (thân pha 3 đặt theo điểm neo).
#  ../xem-khung-hieu-ung.png chồng khung các hàng của 9 tấm trùm trước / sau căn tâm, và dòng thời gian khung của các hiệu ứng trùm cũ / mới.
# Hình học lấy đúng như js/boss.js (G.ZK = 0.85, sàn y 150..236, phòng x 10..470); trùm đặt lệch lên gần mép trên (y = 166) để thấy chỗ bị cắt.
import math, os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image, ImageDraw, ImageFont
from anh_trum import doc, khung, tam_than, TRUM

RA = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
F = lambda s: ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', s)
FB = lambda s: ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', s)
ZK, X0, X1, Y0, Y1 = 0.85, 10, 470, 150, 236
BX, BY = 240, 166
TAU = math.pi * 2
S = 2  # phóng to
VW, VH = 330, 230  # vùng thế giới nhìn trong một ô (điểm ảnh game)
OX, OY = BX - VW / 2, BY - 130


def W2(x, y):
    return ((x - OX) * S, (y - OY) * S)


def nen(dr):
    dr.rectangle([0, 0, VW * S, VH * S], fill=(26, 24, 30))
    a = W2(X0, Y0); b = W2(X1, Y1)
    dr.rectangle([a[0], a[1], b[0], b[1]], fill=(52, 46, 44), outline=(120, 110, 100))


def elip(dr, x, y, r, ky, **k):
    a = W2(x - r, y - r * ky); b = W2(x + r, y + r * ky)
    dr.ellipse([a[0], a[1], b[0], b[1]], **k)


def than(img, ma, ten, i, x, y, face, dx, alpha=255):
    d, im = TH[ma]; k = khung(d, im, ten, i).copy()
    if alpha < 255:
        a = k.split()[3].point(lambda v: v * alpha // 255); k.putalpha(a)
    ax, ay = d['goc']; fw = d['khung_rong']
    if face < 0:
        k = k.transpose(Image.FLIP_LEFT_RIGHT); ox = x - (fw - ax) - dx
    else:
        ox = x - ax + dx
    k = k.resize((k.width * S, k.height * S), Image.NEAREST)
    p = W2(ox, y - ay)
    img.alpha_composite(k, (int(round(p[0])), int(round(p[1]))))


TH = {m: doc(m) for m in TRUM}
CT = {m: json.loads(json.dumps(TH[m][0].get('can_tam') or {})) for m in TRUM}
TAM = {m: tam_than(*TH[m]) for m in TRUM}


def tam_ve(dr, ma, ten, i, face, dx, mau):
    """vạch xanh: tâm thân trên sàn của khung đang vẽ (sau khi lật mặt / dời)"""
    d = TH[ma][0]; ax = d['goc'][0]; c = TAM[ma][ten][i]
    x = BX + ((c - ax) + dx) * (1 if face > 0 else -1)
    a = W2(x, BY - 40); b = W2(x, BY + 6)
    dr.line([a, b], fill=mau, width=3)
    return x


def tam_trum(dr):
    a = W2(BX, BY)
    dr.line([a[0] - 9, a[1], a[0] + 9, a[1]], fill=(255, 60, 60), width=2)
    dr.line([a[0], a[1] - 9, a[0], a[1] + 9], fill=(255, 60, 60), width=2)


def o_than(img, dr, ma, moi, ten='tele', i=2):
    """thân pha 3 hai hướng mặt: phải (đậm), trái (mờ); vạch xanh lá = tâm thân mặt phải, xanh dương = mặt trái"""
    ct = CT[ma].get(ten, [0] * 9) if moi else [0] * 9
    than(img, ma, ten, i, BX, BY, -1, ct[i], 90)
    than(img, ma, ten, i, BX, BY, 1, ct[i], 255)
    xr = tam_ve(dr, ma, ten, i, 1, ct[i], (80, 255, 120))
    xl = tam_ve(dr, ma, ten, i, -1, ct[i], (90, 170, 255))
    return xr, xl


def chu(dr, x, y, s, n=13, mau=(235, 235, 235), dam=False):
    dr.text((x, y), s, font=FB(n) if dam else F(n), fill=mau)


def o(ve, tieu, ghi):
    img = Image.new('RGBA', (VW * S, VH * S), (0, 0, 0, 255)); dr = ImageDraw.Draw(img)
    nen(dr); ve(img, dr); tam_trum(dr)
    chu(dr, 8, 6, tieu, 15, dam=True)
    dr.rectangle([0, VH * S - 20 * len(ghi) - 8, VW * S, VH * S], fill=(20, 20, 26))
    for j, g in enumerate(ghi):
        chu(dr, 8, VH * S - 20 * (len(ghi) - j) - 4, g, 12, (215, 215, 215))
    return img


# ---------- Hồ Tinh c4 Vòng lửa ma ----------
V4 = [[62, 8, 0, 0.3], [102, 12, math.pi / 12, 0.5]]
A0 = 0.35  # hướng em bé lúc ra chiêu


def ho_c4(moi):
    def ve(img, dr):
        o_than(img, dr, 'hoTinh-p3', moi)
        K = ZK if moi else 1; tol = 12 if moi else 8
        for R, n, lech, t0 in V4:
            for i in range(n):
                q = A0 + lech + i / n * TAU; x = BX + math.cos(q) * R; y = BY + math.sin(q) * R * K
                giu = not (x < X0 - tol or x > X1 + tol or y < Y0 - tol or y > Y1 + tol)
                if not moi:  # hình vẽ code cũ: đủ 20 cột theo vòng tròn, kể cả chỗ không có vùng
                    elip(dr, x, y, 7, 1, outline=(255, 170, 60), width=2)
                if giu:
                    elip(dr, x, y, 12, ZK, outline=(255, 70, 50), width=3)
                else:
                    elip(dr, x, y, 12, ZK, outline=(110, 110, 110), width=1)
    if moi:
        return o(ve, 'SAU · Hồ Tinh c4 Vòng lửa ma (pha 3)', ['vòng dẹt theo sàn G.ZK; cột chạm sàn giữ (đỏ), ngoài phòng bỏ (xám)', 'hình vẽ đúng các cột thật · thân pha 3 căn tâm: 2 hướng mặt trùng tâm'])
    return o(ve, 'TRƯỚC · Hồ Tinh c4 Vòng lửa ma (pha 3)', ['đỏ = vùng thật, xám = bị bỏ vì sát tường (±8), cam = hình vẽ code (đủ 20 cột)', 'thân pha 3: tâm thân lệch điểm neo, lật mặt → lệch sang phía kia'])


# ---------- Hồ Tinh c5 Bão hồ hoả ----------
def ho_c5(moi):
    def ve(img, dr):
        o_than(img, dr, 'hoTinh-p3', moi, 'atk', 3)
        L = 110
        if not moi:  # vòng đạn giả vẽ code bay từ giữa thân (cy ≈ chân − 31)
            elip(dr, BX, BY - 31, 60, 1, outline=(255, 210, 90), width=1)
        for j in range(3):
            mau = [(255, 90, 60), (255, 150, 60), (255, 210, 90)][j]
            for i in range(10):
                q = A0 + (i + j * 0.5) / 10 * TAU
                ox, oy = (BX + math.cos(q) * 14, BY + math.sin(q) * 14) if moi else (BX + math.cos(q) * 14, BY + math.sin(q) * 10)
                dr.line([W2(ox, oy), W2(ox + math.cos(q) * L, oy + math.sin(q) * L)], fill=mau, width=2 if j == 0 else 1)
                dr.ellipse([W2(ox, oy)[0] - 3, W2(ox, oy)[1] - 3, W2(ox, oy)[0] + 3, W2(ox, oy)[1] + 3], fill=mau)
        # tia báo trước (monster_art vongDan)
        n, dot = 10, 3
        for i in range(n * dot):
            q = (A0 + (i // dot + (i % dot) * 0.5) / n * TAU) if moi else (A0 + i / (n * dot) * TAU + (i % dot) * math.pi / n)
            a = W2(BX + math.cos(q) * 6, BY + math.sin(q) * 6); b = W2(BX + math.cos(q) * 104, BY + math.sin(q) * 104)
            for t in range(0, 20, 2):
                dr.line([(a[0] + (b[0] - a[0]) * t / 20, a[1] + (b[1] - a[1]) * t / 20), (a[0] + (b[0] - a[0]) * (t + 1) / 20, a[1] + (b[1] - a[1]) * (t + 1) / 20)], fill=(120, 230, 255), width=1)
    if moi:
        return o(ve, 'SAU · Hồ Tinh c5 Bão hồ hoả (pha 3)', ['đạn xuất phát trên vòng tròn r 14: mọi đường bay đi qua tâm trùm', 'tia báo trước (xanh) trùng đúng 3 đợt đạn thật · không còn vòng đạn giả'])
    return o(ve, 'TRƯỚC · Hồ Tinh c5 Bão hồ hoả (pha 3)', ['đạn xuất phát trên elip 14 × 10 (không qua tâm); tia báo trước đợt 2, 3 lệch 12°, 24°', 'vòng vàng = đạn giả vẽ code bay từ giữa thân (khác tâm vòng đạn thật)'])


# ---------- Mộc Tinh c5 Rừng gai ----------
def moc_c5(moi):
    def ve(img, dr):
        o_than(img, dr, 'mocTinh-p3', moi, 'tele', 4)
        o0 = 0.3
        for j, (r0, r1) in enumerate([[24, 58], [58, 92], [92, 126]]):
            gaps = [o0 + j * 0.7 + k * math.pi / 2 for k in range(4)]
            for st in range(0, 360, 3):
                a = math.radians(st)
                if any(abs(math.atan2(math.sin(a - g), math.cos(a - g))) < 0.3 for g in gaps):
                    continue
                for r in (r0, r1):
                    x = BX + math.cos(a) * r; y = BY + math.sin(a) * r * ZK
                    p = W2(x, y); dr.point(p, fill=(150, 230, 90)); dr.point((p[0] + 1, p[1]), fill=(150, 230, 90))
    if moi:
        return o(ve, 'SAU · Mộc Tinh c5 Rừng gai (pha 3)', ['vành khăn giữ nguyên (đã dẹt G.ZK, khe chia đều 90°)', 'thân pha 3 căn tâm: tâm thân trùng tâm vành ở cả hai hướng mặt'])
    return o(ve, 'TRƯỚC · Mộc Tinh c5 Rừng gai (pha 3)', ['vành khăn đúng tâm chân trùm', 'thân pha 3 lệch điểm neo ~6 điểm ảnh, lật mặt → lệch sang phía kia'])


# ---------- Ngư Tinh c5 Xoáy nước ----------
def ngu_c5(moi):
    def ve(img, dr):
        o_than(img, dr, 'nguTinh-p3', moi, 'atk', 0)
        elip(dr, BX, BY, 60, ZK, outline=(110, 200, 255), width=2)
        elip(dr, BX, BY, 112, ZK, outline=(110, 200, 255), width=2)
        elip(dr, BX, BY, 112 * 1.2 * 0.6, ZK if moi else 1, outline=(255, 255, 255), width=1)
    if moi:
        return o(ve, 'SAU · Ngư Tinh c5 Xoáy nước (pha 3)', ['vòng sóng bung (trắng) dẹt G.ZK như vành nước thật; xoáy mờ dần', 'thân pha 3 căn tâm'])
    return o(ve, 'TRƯỚC · Ngư Tinh c5 Xoáy nước (pha 3)', ['vòng sóng bung vẽ tròn (MA.det = 1) trong khi vành nước dẹt 0,85', 'thân pha 3 lệch điểm neo vài điểm ảnh theo từng khung'])


def ghep(o_list, cot, tieu):
    w, h = o_list[0].size; pad = 10
    out = Image.new('RGBA', (cot * w + (cot + 1) * pad, (len(o_list) // cot) * (h + pad) + pad + 40), (14, 14, 18, 255))
    ImageDraw.Draw(out).text((pad, 10), tieu, font=FB(18), fill=(255, 255, 255))
    for k, im in enumerate(o_list):
        out.alpha_composite(im, (pad + (k % cot) * (w + pad), 40 + (k // cot) * (h + pad)))
    return out


vong = ghep([ho_c4(False), ho_c4(True), ho_c5(False), ho_c5(True), moc_c5(False), moc_c5(True), ngu_c5(False), ngu_c5(True)], 2,
            'Chiêu tròn pha 3 quanh tâm trùm (chữ thập đỏ = tâm trùm trên sàn; vạch xanh lá / xanh dương = tâm thân khi quay phải / trái)')
vong.convert('RGB').save(os.path.join(RA, 'xem-vong-pha3.png'), optimize=True)

# ---------- xem-khung-hieu-ung.png ----------
def chong(ma, moi, hangs=('idle', 'tele', 'atk')):
    """chồng mọi khung của các hàng (mờ) lên cùng điểm neo; đường đỏ = điểm neo, xanh = tâm thân từng khung"""
    d, im = TH[ma]; fw, fh = d['khung_rong'], d['khung_cao']; ax, ay = d['goc']
    pad = 30; can = Image.new('RGBA', (fw + 2 * pad, fh), (30, 30, 38, 255)); dr = ImageDraw.Draw(can)
    xs = []
    for ten in hangs:
        if ten not in d['dong_tac']:
            continue
        for i in range(d['dong_tac'][ten]['so']):
            k = khung(d, im, ten, i).copy(); a = k.split()[3].point(lambda v: v * 50 // 255); k.putalpha(a)
            dx = CT[ma].get(ten, [0] * 40)[i] if moi else 0
            can.alpha_composite(k, (pad + dx, 0))
            c = TAM[ma][ten][i]
            if c is not None:
                xs.append(c + dx)
    for x in xs:
        dr.line([(pad + x, fh - 22), (pad + x, fh)], fill=(90, 255, 130), width=1)
    dr.line([(pad + ax, 0), (pad + ax, fh)], fill=(255, 60, 60), width=1)
    lech = max(xs) - min(xs)
    return can, lech


cols = []
for m in TRUM:
    a, la = chong(m, False); b, lb = chong(m, True)
    cols.append((m, a, la, b, lb))
cw = max(c[1].width for c in cols); chh = max(c[1].height for c in cols)
Z = 1
H1 = 60 + 2 * (chh + 34)
img = Image.new('RGBA', (len(cols) * (cw + 10) + 10, H1 + 420), (14, 14, 18, 255)); dr = ImageDraw.Draw(img)
dr.text((10, 10), 'Căn tâm từng khung (can_tam): chồng mọi khung đứng thở + báo trước + đánh lên cùng điểm neo (đỏ); vạch xanh = tâm thân từng khung', font=FB(15), fill=(255, 255, 255))
dr.text((10, 32), 'Hàng trên: TRƯỚC (thân nhảy ngang giữa khung / hàng, lệch neo). Hàng dưới: SAU (tâm thân dồn về neo). Số: độ dao động tâm thân (điểm ảnh).', font=F(13), fill=(220, 220, 220))
for k, (m, a, la, b, lb) in enumerate(cols):
    x = 10 + k * (cw + 10)
    img.alpha_composite(a, (x, 60)); dr.text((x, 60 + chh + 4), '%s trước: %d' % (m, round(la)), font=F(12), fill=(255, 190, 120))
    img.alpha_composite(b, (x, 60 + chh + 34)); dr.text((x, 60 + 2 * chh + 38), '%s sau: %d' % (m, round(lb)), font=F(12), fill=(140, 255, 160))

# dòng thời gian khung (mỗi ô = 1/60 giây, màu = số khung): cũ / mới
import colorsys
def mau(i):
    r, g, b = colorsys.hsv_to_rgb((i * 0.13) % 1, 0.65, 0.95); return (int(r * 255), int(g * 255), int(b * 255))

NH = 12
def qua_lai(so, tt, k, fps):
    n = min(k, so)
    if n < 2: return so - 1
    p = int(math.floor(max(0, tt) * fps)) % (2 * n - 2); j = p if p < n else 2 * n - 2 - p
    return so - n + j

def chieu_moi(D, m0, m1, nt, na, t):
    Tw, T1 = m0 * D, m1 * D
    if t < Tw:
        if Tw <= nt / NH * 1.35: return ('tele', min(nt - 1, int(t / Tw * nt)))
        dau = max(0, nt - 3); tD = dau / NH; tC = Tw - tD
        if t < tD: return ('tele', int(t * NH))
        v = max(0, round((tC * NH - 2.5) / 4)); fps = (2.5 + 4 * v) / max(0.05, tC)
        return ('tele', qua_lai(nt, t - tD, 3, fps))
    ta = t - Tw
    if ta < na / NH: return ('atk', min(na - 1, int(ta * NH)))
    if t < T1: return ('atk', qua_lai(na, ta - na / NH + 0.3, 3, 10))
    return ('idle', int(t / (1.4 / 6)) % 6)

def chieu_cu(D, nt, na, t):
    u = min(1, t / D)
    return ('tele', min(nt - 1, int(u / 0.4 * nt))) if u < 0.4 else ('atk', min(na - 1, int((u - 0.4) / 0.6 * na)))

def die_moi(D, nd, nh, t, mo=0.6):
    t0 = max(0, mo * D - nd / 10)
    if t < t0: return ('hit', qua_lai(nh, t, nh, 10))
    return ('die', min(nd - 1, int((t - t0) * 10)))

def die_cu(D, nd, t):
    return ('die', min(nd - 1, int(min(1, t / D) * nd)))

def doipha_cu(D, t):
    u = t / D
    return ('', min(2, int(u / 0.45 * 3)) if u < 0.45 else 3 if u < 0.58 else 4 + min(3, int((u - 0.58) / 0.42 * 4)))

def doipha_moi(D, t):
    t1, t2 = 0.45 * D, 0.58 * D; t3 = t2 + 0.4
    if t < t1: q = int(t * 10) % 4; return ('', q if q < 3 else 1)
    if t < t2: return ('', 3)
    if t < t3: return ('', 4 + min(3, int((t - t2) * 10)))
    return ('', 7 if t < t3 + 0.15 else -1)

DONG = [
    ('Hồ Tinh pha 3 · c4 (2,5 s, mốc .30/.92): hàng tele 7 + atk 5', lambda t: chieu_cu(2.5 / 1.2, 7, 5, t), lambda t: chieu_moi(2.5, .3, .92, 7, 5, t * 1.2), 2.5 / 1.2),
    ('Mộc Tinh pha 3 · c5 (2,6 s, mốc .35/.90): tele 8 + atk 4', lambda t: chieu_cu(2.6 / 1.2, 8, 4, t), lambda t: chieu_moi(2.6, .35, .9, 8, 4, t * 1.2), 2.6 / 1.2),
    ('Ngư Tinh · chuyển pha 3 (2,4 s): ảnh hu-doi-pha 8 khung', lambda t: doipha_cu(2.4, t), lambda t: doipha_moi(2.4, t), 2.4),
    ('Hồ Tinh · gục (3,4 s): hàng die 6 (pha 1)', lambda t: die_cu(3.4, 6, t), lambda t: die_moi(3.4, 6, 4, t), 3.4),
    ('Nổ nhỏ trên thân hu-no-nho (5 khung): 0,22 s → 0,42 s', lambda t: ('', min(4, int(t / 0.22 * 5))) if t < 0.22 else ('', -1), lambda t: ('', min(4, int(t / 0.42 * 5))) if t < 0.42 else ('', -1), 0.5),
    ('Quả độc rơi hu-qua-doc-roi (5 khung): 0,7 s → 0,45 s', lambda t: ('', min(4, int(t / 0.7 * 5))) if t < 0.7 else ('', -1), lambda t: ('', min(4, int(t / 0.45 * 5))) if t < 0.45 else ('', -1), 0.8),
]
y = H1 + 10
dr.text((10, y), 'Dòng thời gian khung (mỗi vạch = 1/60 giây, đổi màu = đổi khung; "|" trắng = đổi hàng). Trên: CŨ · dưới: MỚI. Số = nhịp đổi khung từ khung đầu tới lần đổi cuối (không tính đoạn giữ khung cuối lúc mờ).', font=FB(14), fill=(255, 255, 255)); y += 26
PX = 3
for ten, cu, moi, D in DONG:
    dr.text((10, y), ten, font=F(12), fill=(230, 230, 230)); y += 16
    for nhan, fn in (('cũ', cu), ('mới', moi)):
        n = int(D * 60); last = None; doi = 0; k0 = None; k1 = 0
        for k in range(n):
            h, i = fn(k / 60)
            if i < 0: continue
            if k0 is None: k0 = k
            if last is not None and (h, i) != last: doi += 1; k1 = k
            if last is not None and h != last[0]: dr.line([(60 + k * PX, y), (60 + k * PX, y + 12)], fill=(255, 255, 255), width=1)
            else: dr.rectangle([60 + k * PX, y, 60 + k * PX + PX - 1, y + 12], fill=mau(i))
            last = (h, i)
        dr.text((10, y), nhan, font=F(11), fill=(200, 200, 200))
        dr.text((66 + n * PX, y), '%.1f khung/giây lúc đang chạy' % (doi / max(1 / 60, (k1 - k0) / 60) if doi else 0), font=F(11), fill=(200, 200, 200))
        y += 16
    y += 6
img = img.crop((0, 0, img.width, y + 10))
img.convert('RGB').save(os.path.join(RA, 'xem-khung-hieu-ung.png'), optimize=True)
print('xong', vong.size, img.size)
