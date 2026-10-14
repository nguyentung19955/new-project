#!/usr/bin/env python3
"""Ảnh soát tĩnh xem-chieu-moi.png: 10 ô, mỗi ô một sơ đồ nhìn từ trên xuống của một chiêu mới (js/chieu_trum.js) — vùng đánh,
đường đi, mốc thời gian. KHÔNG chạy game. Mọi con số đọc thẳng từ bảng SO và CU trong game/js/chieu_trum.js (JSON giữa
/*SO*/ ... /*HET-SO*/ và /*CU*/ ... /*HET-CU*/); cách tính vị trí / thời gian chép đúng theo code.

  python3 docs/review/ke-hoach-cai-thien/ky-nang-trum-rieng/ve_xem.py

Quy ước: sàn mẫu = sàn phòng trùm thật (js/room_art.js RA.geo(true).bounds: x 89–371, y 64–250, khung xám). Vùng tròn dẹt G.ZK = 0,85.
Đỏ = vùng đánh thật (báo trước rồi nổ). Cam viền = chỉ báo (đòn do thân gây). Xanh dương = vùng kéo. Xanh ngọc = tường chắn.
Xanh lá = vũng / khí độc để lại. Tím Q = trùm / tinh anh, xanh P = em bé. Mũi tên = đường nhảy / lao / lăn. Nét chấm = trục đối xứng.
Dòng chữ dưới mỗi ô: sát thương mỗi lần trúng (× b.dmg) cũ → mới, và lúc hết chiêu cũ → mới ở pha 1 / pha 3 (lệch %).
"""
import json, math, os, re
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
SRC = os.path.join(ROOT, 'game', 'js', 'chieu_trum.js')
OUT = os.path.join(HERE, 'xem-chieu-moi.png')
js = open(SRC, encoding='utf-8').read()
SO = json.loads(re.search(r'= /\*SO\*/(.*?)/\*HET-SO\*/', js, re.S).group(1))
CU = json.loads(re.search(r'= /\*CU\*/(.*?)/\*HET-CU\*/', js, re.S).group(1))
TEN = dict(re.findall(r"(\w+): '([^']+)'", re.search(r'const TEN = \{(.*?)\};', js, re.S).group(1)))
ZK = 0.85
X0, X1, Y0, Y1 = 89, 371, 64, 250
CX, CY = (X0 + X1) / 2, (Y0 + Y1) / 2
SC = 1.0
PW, PH = 560, 272   # một ô
TOP = 64
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FONTB = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
f9, f10, f11b, f16b = ImageFont.truetype(FONT, 9), ImageFont.truetype(FONT, 10), ImageFont.truetype(FONTB, 11), ImageFont.truetype(FONTB, 17)
RED = ((255, 50, 30, 70), (220, 40, 20, 255))
WARN = ((255, 160, 40, 45), (240, 130, 20, 255))
BLUE = ((70, 140, 255, 40), (40, 90, 220, 255))
CYAN = ((90, 200, 230, 160), (20, 120, 160, 255))
GREEN = ((120, 210, 60, 70), (70, 150, 30, 255))
SPD_TRUM = [1, 1.1, 1.2]
SPD_MINI = [1, 1.08, 1.16]


class O:
    """Một ô vẽ: đổi toạ độ game → điểm ảnh của ô."""
    def __init__(s, im, ox, oy):
        s.im, s.ox, s.oy = im, ox, oy
        s.d = ImageDraw.Draw(im, 'RGBA')

    def P(s, x, y):
        return (s.ox + 18 + (x - X0) * SC, s.oy + 30 + (y - Y0) * SC)

    def san(s):
        a, b = s.P(X0, Y0), s.P(X1, Y1)
        s.d.rectangle([a, b], fill=(236, 232, 222, 255), outline=(150, 150, 150, 255))
        for k in range(1, 4):  # lưới nhạt
            x = X0 + (X1 - X0) * k / 4; y = Y0 + (Y1 - Y0) * k / 4
            s.d.line([s.P(x, Y0), s.P(x, Y1)], fill=(220, 216, 206, 255)); s.d.line([s.P(X0, y), s.P(X1, y)], fill=(220, 216, 206, 255))

    def tron(s, x, y, r, col=RED, w=1):
        a, b = s.P(x - r, y - r * ZK), s.P(x + r, y + r * ZK)
        s.d.ellipse([a, b], fill=col[0], outline=col[1], width=w)

    def duong(s, x, y, ang, L, w, col=RED, wd=1):
        c, sn = math.cos(ang), math.sin(ang); nx, ny = -sn * w / 2, c * w / 2
        pts = [(x + nx, y + ny), (x + c * L + nx, y + sn * L + ny), (x + c * L - nx, y + sn * L - ny), (x - nx, y - ny)]
        s.d.polygon([s.P(*q) for q in pts], fill=col[0], outline=col[1])

    def ten(s, x, y, t, col=(40, 40, 40, 255), f=None):
        s.d.text(s.P(x, y), t, fill=col, font=f or f9)

    def cham(s, x, y, ch, col):
        a = s.P(x, y); s.d.ellipse([a[0] - 5, a[1] - 5, a[0] + 5, a[1] + 5], fill=col, outline=(20, 20, 20, 255))
        s.d.text((a[0] - 3, a[1] - 6), ch, fill=(255, 255, 255, 255), font=f9)

    def mui(s, x0, y0, x1, y1, col=(30, 30, 30, 255), w=2, cong=0):
        if cong:  # vòng cung (nhảy): vẽ cung nhô lên cong điểm ảnh
            pts = []
            for i in range(17):
                u = i / 16; pts.append((x0 + (x1 - x0) * u, y0 + (y1 - y0) * u - math.sin(u * math.pi) * cong))
            s.d.line([s.P(*q) for q in pts], fill=col, width=w)
            xa, ya = pts[-2]
        else:
            s.d.line([s.P(x0, y0), s.P(x1, y1)], fill=col, width=w); xa, ya = x0, y0
        a = math.atan2(y1 - ya, x1 - xa); e = s.P(x1, y1)
        for k in (-1, 1):
            g = a + math.pi + k * 0.45; s.d.line([e, (e[0] + math.cos(g) * 7, e[1] + math.sin(g) * 7)], fill=col, width=w)

    def truc(s, x0, y0, x1, y1):
        n = 24
        for i in range(0, n, 2):
            u0, u1 = i / n, (i + 1) / n
            s.d.line([s.P(x0 + (x1 - x0) * u0, y0 + (y1 - y0) * u0), s.P(x0 + (x1 - x0) * u1, y0 + (y1 - y0) * u1)], fill=(120, 60, 200, 200), width=1)

    def dong(s, i, t, f=None, col=(30, 30, 30, 255)):
        s.d.text((s.ox + 8, s.oy + 30 + (Y1 - Y0) * SC + 6 + i * 12), t, fill=col, font=f or f9)


def lech(cu, moi):
    return '%+.0f%%' % ((moi / cu - 1) * 100)


def boRiu(o):
    S, C = SO['nguBoRiu'], CU['nguBoRiu']
    bx, by, px, py = CX + 60, CY - 6, CX - 50, CY + 10
    a = math.atan2(py - by, px - bx)
    L = min(max(math.hypot(px - bx, py - by) + S['them'], S['dai'][0]), S['dai'][1])
    for f in S['manhDiem']:
        qx, qy = bx + math.cos(a) * L * f, by + math.sin(a) * L * f
        for sg in (-1, 1): o.duong(qx, qy, a + sg * math.pi / 2, S['manhDai'], S['manhRong'], RED)
    o.duong(bx, by, a, L, S['rong'], ((255, 30, 20, 110), (180, 20, 10, 255)))
    o.truc(bx - math.cos(a) * 10, by - math.sin(a) * 10, bx + math.cos(a) * (L + 10), by + math.sin(a) * (L + 10))
    o.cham(bx, by, 'Q', (130, 60, 200, 255)); o.cham(px, py, 'P', (40, 120, 230, 255))
    T, T2 = C['moc'][0] * C['dur'], C['moc'][1] * C['dur']
    o.ten(bx - L * 0.5, by - 40, 'nứt t=%.2f  mảnh t=%.2f' % (T, T2))
    o.dong(0, 'Vết nứt dài %d (kẹp %d–%d) rộng %d · mảnh %d×(%d×%d) tại %s L' % (L, S['dai'][0], S['dai'][1], S['rong'], 2 * len(S['manhDiem']), S['manhDai'], S['manhRong'], '/'.join(str(x) for x in S['manhDiem'])))
    o.dong(1, 'Sát thương / lần: cũ %.2f → nứt %.2f, mảnh %.2f' % (C['sat'][0], S['sat'], S['manhSat']))
    o.dong(2, 'Hết chiêu: cũ %.2f s → mới %.2f s (cùng cử động c1, %s)' % (C['het'], C['dur'], lech(C['het'], C['dur'])))


def cotNuoc(o):
    S, C = SO['nguCotNuoc'], CU['nguCotNuoc']
    # em bé chạy sang trái 60 điểm ảnh/giây: vết chân từng lúc lấy mẫu
    D, T = C['dur'], C['moc'][0] * C['dur']; bat = max(0, T - S['bao'])
    px0, py0 = CX + 40, CY + 20
    for k in range(S['so']):
        tk = bat + k * S['cach']; x = px0 - 60 * tk; y = py0 - 12 * tk
        o.tron(x, y, S['r'], RED); o.ten(x - 10, y + 16, '%.2f' % (tk + S['bao']))
    o.mui(px0, py0, px0 - 60 * (bat + S['so'] * S['cach'] + S['bao']), py0 - 12 * (bat + S['so'] * S['cach'] + S['bao']), (40, 120, 230, 255))
    o.cham(CX + 100, CY - 50, 'Q', (130, 60, 200, 255)); o.cham(px0, py0, 'P', (40, 120, 230, 255))
    o.ten(X0 + 4, Y0 + 4, 'em bé chạy 60/s; số = lúc cột phun (s)')
    o.dong(0, '%d cột r %d, mỗi cột báo %.2f s, cột sau trễ %.2f s (pha 2,3: ÷ tốc pha)' % (S['so'], S['r'], S['bao'], S['cach']))
    o.dong(1, 'Sát thương / lần: cũ %.2f → mới %.2f' % (C['sat'][0], S['sat']))
    s = []
    for ph in (0, 2):
        k = SPD_TRUM[ph]; D = C['dur'] / k; T = C['moc'][0] * D; bat = max(0, T - S['bao']); last = bat + (S['so'] - 1) * S['cach'] / k + S['bao']; het = max(D, last + 0.05)
        s.append('pha %d: %.2f → %.2f (%s)' % (ph + 1, D, het, lech(D, het)))
    o.dong(2, 'Hết chiêu ' + ' · '.join(s))


def xoayHut(o):
    S, C = SO['nguXoayHut'], CU['nguXoayHut']
    bx, by = CX, CY
    o.tron(bx, by, S['R'], BLUE); o.tron(bx, by, S['r'], RED, 2)
    o.truc(bx - S['R'] - 8, by, bx + S['R'] + 8, by); o.truc(bx, by - S['R'] * ZK - 8, bx, by + S['R'] * ZK + 8)
    px, py = bx - 80, by + 30
    o.mui(px, py, px + (bx - px) * 0.3, py + (by - py) * 0.3 * 0.75, (40, 90, 220, 255))
    o.cham(bx, by, 'Q', (130, 60, 200, 255)); o.cham(px, py, 'P', (40, 120, 230, 255))
    t0, t1 = S['dau'], S['dau'] + S['giay']; tn = t1 + S['nghi']
    o.ten(bx + 20, by - S['R'] * ZK + 2, 'kéo %d/s (bé chạy 72/s), R %d' % (S['keo'], S['R']))
    o.ten(bx - 30, by + S['r'] * ZK + 4, 'nổ r %d t=%.2f' % (S['r'], tn))
    o.dong(0, 'Kéo %.2f–%.2f s (%.1f s), nghỉ %.2f s rồi nổ; không kéo lúc lộn / vào vùng sắp nổ' % (t0, t1, S['giay'], S['nghi']))
    o.dong(1, 'Sát thương / lần: cũ %.2f (vòng) + %.2f (vành) → mới %.2f (nổ tâm)' % (C['sat'][0], C['sat'][1], S['sat']))
    s = []
    for ph in (0, 2):
        k = SPD_TRUM[ph]; D = C['dur'] / k; tn = (S['dau'] + S['giay'] + S['nghi']) / k; het = max(D, tn + 0.05)
        s.append('pha %d: %.2f → %.2f (%s)' % (ph + 1, D, het, lech(D, het)))
    o.dong(2, 'Hết chiêu ' + ' · '.join(s))


def voNhay(o):
    S, C = SO['hoVoNhay'], CU['hoVoNhay']
    bx, by, px, py = CX + 90, CY - 30, CX - 40, CY + 20
    o.tron(px, py, S['r'], RED, 2); o.mui(bx, by, px, py, cong=S['cao'])
    p2x, p2y = px - 70, py - 40
    o.tron(p2x, p2y, S['r'], RED); o.mui(px, py, p2x, p2y, (120, 120, 120, 255), cong=S['cao'])
    o.truc(px - S['r'] - 6, py, px + S['r'] + 6, py)
    o.cham(bx, by, 'Q', (130, 60, 200, 255)); o.cham(px, py, 'P', (40, 120, 230, 255))
    D0 = C['dur']; T0 = C['moc'][0] * D0; T = max(T0, C['tele']); D = D0 + T - T0
    o.ten(px - 20, py + S['r'] * ZK + 2, 'đáp 1 t=%.2f' % T); o.ten(p2x - 20, p2y - S['r'] * ZK - 12, 'đáp 2 (pha 2+) t=%.2f' % (T + S['lan2'] + S['bao2']))
    o.dong(0, 'Bay %.2f s cao %d; vòng lửa r %d; báo trước lần 1 %.2f s, lần 2 %.2f s' % (S['bay'], S['cao'], S['r'], T, S['bao2']))
    o.dong(1, 'Sát thương / lần: cũ %.2f → mới %.2f (pha 1 nhảy 1 lần, pha 2+ 2 lần)' % (C['sat'][0], S['sat']))
    o.dong(2, 'Hết chiêu: cũ %.2f s → mới %.2f s (cùng cử động c2 + kéo dài báo trước, 0%%)' % (D, D))


def phanThan(o):
    S, C = SO['hoPhanThan'], CU['hoPhanThan']
    hx, hy = (X1 - X0) / 2 - S['le'][0], (Y1 - Y0) / 2 - S['le'][1]
    Cn = [(CX - hx, CY - hy), (CX + hx, CY - hy), (CX + hx, CY + hy), (CX - hx, CY + hy)]
    L = 2 * math.hypot(hx, hy); D = C['dur']
    r = 0; s0 = 2; thu = [(s0 + k) % 4 for k in range(4)]  # ví dụ: thật ở góc 0, lao thứ 3
    for k, i in enumerate(thu):
        j = (i + 2) % 4; g = math.atan2(Cn[j][1] - Cn[i][1], Cn[j][0] - Cn[i][0])
        o.duong(Cn[i][0], Cn[i][1], g, L, S['rong'], RED)
    for k, i in enumerate(thu):
        o.cham(Cn[i][0], Cn[i][1], 'T' if i == r else str(k + 1), (130, 60, 200, 255) if i == r else (170, 140, 210, 255))
        o.ten(Cn[i][0] + (6 if Cn[i][0] < CX else -60), Cn[i][1] + (-14 if Cn[i][1] < CY else 6), 'lao %d t=%.2f' % (k + 1, (S['dau'] + k * S['buoc']) * D))
    o.truc(CX, Y0, CX, Y1); o.truc(X0, CY, X1, CY)
    o.cham(CX - 6, Y0 + 14, 'P', (40, 120, 230, 255))
    o.dong(0, '4 góc lùi mép %d/%d, đường rộng %d, mỗi đường báo %.2f s, lao %.2f s; T = bóng thật' % (S['le'][0], S['le'][1], S['rong'], S['bao'] * D, S['lao']))
    o.dong(1, 'Sát thương / lần: cũ %.2f (cột lửa) → mới %.2f; trúng thân thật trước khi lao → choáng %.1f s' % (C['sat'][0], S['sat'], S['ngat']))
    o.dong(2, 'Lần trúng cuối: cũ %.2f s → mới %.2f s · hết chiêu %.2f → %.2f (0%%)' % ((0.5 + 11 * 0.015) * D, (S['dau'] + 3 * S['buoc']) * D, D, D))


def namMe(o):
    S, C = SO['namMe'], CU['namMe']
    bx, by = CX + 30, CY; a = math.pi  # em bé bên trái
    D = C['dur']; T = 0.5 * D
    for k in range(S['so']):
        g = a + k / S['so'] * 2 * math.pi; x, y = bx + math.cos(g) * S['R'], by + math.sin(g) * S['R'] * ZK
        o.tron(x, y, S['r'], RED); o.cham(x, y, 'n', (150, 70, 200, 255))
    a0, b0 = o.P(bx - S['R'], by - S['R'] * ZK), o.P(bx + S['R'], by + S['R'] * ZK); o.d.ellipse([a0, b0], outline=(150, 150, 150, 255))
    o.cham(bx, by, 'Q', (130, 60, 200, 255)); o.cham(bx - 100, by, 'P', (40, 120, 230, 255))
    o.truc(bx - S['R'] - 30, by, bx + S['R'] + 20, by)
    o.ten(bx - 40, by + S['R'] * ZK + 6, 'mọc t=%.2f · nổ t=%.2f nếu chưa chém' % (T, T + S['giay']))
    o.dong(0, '%d nấm con chia đều 120° trên vòng R %d (dẹt ZK), nổ r %d sau %.1f s, để vũng %d s' % (S['so'], S['R'], S['r'], S['giay'], S['may']))
    o.dong(1, 'Sát thương / lần: cũ %.2f (bào tử) → mới %.2f (nổ khí độc)' % (C['sat'][0], S['sat']))
    o.dong(2, 'Hết cử động: cũ %.2f s → mới %.2f s (0%%); mối nguy cũ tới %.2f s, mới tới %.2f s' % (D, D, T + 0.4 + 2.2, T + S['giay']))


def cuaTuong(o):
    S, C = SO['cuaTuong'], CU['cuaTuong']
    nua = (Y1 - Y0) * S['nua']; L = min(S['manhDai'], (X1 - X0) * 0.34); n = int(nua // S['hang'])
    TU = [CX - S['cach'], CX + S['cach']]
    for x in TU:
        for j in range(-n, n + 1):
            y = CY + j * S['hang']
            for g in (0, math.pi): o.duong(x, y, g, min(L, (x - X0) if g else (X1 - x)), S['manhRong'], RED)
    for x in TU:
        a, b = o.P(x - S['day'] / 2, CY - nua), o.P(x + S['day'] / 2, CY + nua)
        o.d.rectangle([a, b], fill=CYAN[0], outline=CYAN[1], width=2)
    o.truc(CX, Y0, CX, Y1); o.truc(X0, CY, X1, CY)
    o.cham(CX + 110, CY - 70, 'Q', (130, 60, 200, 255)); o.cham(CX, CY - nua - 12, 'P', (40, 120, 230, 255))
    D = C['dur']; T = 0.5 * D
    o.ten(X0 + 4, Y0 + 4, 'tường dựng t=%.2f, vỡ t=%.2f (báo %.1f s)' % (T, T + S['giu'], S['bao']))
    o.dong(0, '2 tường dọc x = tâm ± %d, dài %d (%.0f%% sàn), chắn đường + đạn; %d hàng mảnh cách %d, dài %d' % (S['cach'], 2 * nua, S['nua'] * 200, 2 * n + 1, S['hang'], L))
    o.dong(1, 'Sát thương / lần: cũ %.2f → dựng tường %.2f, mảnh %.2f' % (C['sat'][0], S['satDung'], S['sat']))
    o.dong(2, 'Hết cử động: cũ %.2f s → mới %.2f s (0%%); tường giữ %.1f s rồi vỡ' % (D, D, S['giu']))


def namPhongNhay(o):
    S, C = SO['namPhongNhay'], CU['namPhongNhay']
    ex, ey, px, py = CX + 100, CY - 20, CX - 60, CY + 30
    lx, ly = ex, ey; T = C['T']
    for k in range(S['lan']):
        land = T + S['dau'] + k * S['cach']
        dx, dy = px - lx, py - ly; d = math.hypot(dx, dy) or 1; s = min(1, S['xa'] / d)
        x, y = lx + dx * s, ly + dy * s
        o.tron(x, y, S['r'], RED); o.mui(lx, ly, x, y, cong=S['cao'])
        o.ten(x - 12, y + S['r'] * ZK + 2, 't=%.2f' % land)
        lx, ly = x, y
    o.cham(ex, ey, 'Q', (130, 60, 200, 255)); o.cham(px, py, 'P', (40, 120, 230, 255))
    o.ten(X0 + 4, Y0 + 4, 'em bé đứng yên (ví dụ)')
    o.dong(0, '%d lần nhảy, mỗi lần xa ≤ %d, bay %.2f s cao %d; bóng tròn r %d báo %.2f s; vũng độc %d s' % (S['lan'], S['xa'], S['bay'], S['cao'], S['r'], S['bao'], S['may']))
    o.dong(1, 'Sát thương / lần: cũ %.2f → mới %.2f' % (C['sat'][0], S['sat']))
    het = max(C['dur'], T + S['dau'] + (S['lan'] - 1) * S['cach'] + 0.15)
    o.dong(2, 'Hết chiêu: cũ %.2f s → mới %.2f s (%s); lần trúng cuối cũ %.2f → mới %.2f' % (C['het'], het, lech(C['het'], het), T + 0.6, T + S['dau'] + (S['lan'] - 1) * S['cach']))


def duongNay(x, y, a, n, le):
    bx0, bx1, by0, by1 = X0 + le, X1 - le, Y0 + le * 0.5, Y1 - le * 0.5
    x = min(max(x, bx0), bx1); y = min(max(y, by0), by1)
    dx, dy, lan, out = math.cos(a), math.sin(a), 0, []
    k = 0
    while len(out) < n and k < n + 4:
        tx = (bx1 - x) / dx if dx > 1e-6 else (bx0 - x) / dx if dx < -1e-6 else 1e9
        ty = (by1 - y) / dy if dy > 1e-6 else (by0 - y) / dy if dy < -1e-6 else 1e9
        t = max(0, min(tx, ty)); x1, y1 = x + dx * t, y + dy * t
        if t >= 8 or lan >= n: out.append((x, y, x1, y1, t, math.atan2(dy, dx)))
        lan += 1
        if tx <= ty + 1e-6: dx = -dx
        if ty <= tx + 1e-6: dy = -dy
        x, y = x1, y1; k += 1
    return out


def caNocLan(o):
    S, C = SO['caNocLan'], CU['caNocLan']
    ex, ey, px, py = CX + 60, CY + 10, CX - 70, CY - 40
    a = math.atan2(py - ey, px - ex)
    du = duongNay(ex, ey, a, S['nay'], S['le'])
    tong = sum(d[4] for d in du); v = min(max(tong / S['giay'], S['tocMin']), S['tocMax']); T = C['T']
    s = 0
    for k, d in enumerate(du):
        o.duong(d[0], d[1], d[5], d[4], S['r'] * 2, WARN)
        o.mui(d[0], d[1], d[2], d[3], (30, 30, 30, 255), 1)
        t0 = T + s / v; s += d[4]
        o.ten((d[0] + d[2]) / 2 - 10, (d[1] + d[3]) / 2 - 12, '%d: %.2f' % (k + 1, t0))
    o.cham(ex, ey, 'Q', (130, 60, 200, 255)); o.cham(px, py, 'P', (40, 120, 230, 255))
    het = T + tong / v + 0.25
    o.dong(0, 'Phồng %.2f s (×%.2f), lăn %d đoạn phản xạ mép (lùi %d), tổng %d → tốc %d/s (kẹp %d–%d)' % (T, S['phong'], len(du), S['le'], tong, v, S['tocMin'], S['tocMax']))
    o.dong(1, 'Sát thương / lần: cũ %.2f (gai) → mới %.2f (thân lăn, 1 lần mỗi đoạn); số = lúc lăn vào đoạn' % (C['sat'][0], S['sat']))
    o.dong(2, 'Hết: cũ cử động %.2f / đạn bay hết %.2f s → mới %.2f s (%s so với đạn)' % (C['het'], C['dan'], het, lech(C['dan'], het)))


def huDau(o):
    S, C = SO['huDau'], CU['huDau']
    px, py = CX - 20, CY + 10
    tx, ty = S['tay'], S['tay'] * ZK
    o.duong(px - tx, py, 0, 2 * tx, S['rong'], RED); o.duong(px, py - ty, math.pi / 2, 2 * ty, S['rong'], RED)
    o.truc(px - tx - 8, py, px + tx + 8, py); o.truc(px, py - ty - 8, px, py + ty + 8)
    o.cham(CX + 110, CY - 50, 'Q', (130, 60, 200, 255)); o.cham(px, py, 'P', (40, 120, 230, 255))
    T = C['T']
    o.ten(px + 8, py + ty + 4, 'rót t=%.2f · châm t=%.2f · tắt t=%.2f' % (T, T + S['cho'], T + S['cho'] + S['chay']))
    o.dong(0, 'Chữ thập căn đúng chỗ em bé: tay ngang ±%d, tay dọc ±%.1f (× ZK), rộng %d' % (S['tay'], ty, S['rong']))
    o.dong(1, 'Sát thương / lần: cũ %.2f (cầu lửa) → châm %.2f; cháy %.1f s: %.2f mỗi %.1f s' % (C['sat'][0], S['sat'], S['chay'], S['sat'] * S['satChay'], S['nhip']))
    o.dong(2, 'Hết cử động: cũ %.2f s → mới %.2f s (0%%); lần trúng lớn cuối cũ ~%.2f → mới %.2f' % (C['het'], C['dur'], T + 0.4, T + S['cho']))


O_DS = [
    ('nguBoRiu', 'Ngư Tinh c1', boRiu), ('nguCotNuoc', 'Ngư Tinh c4', cotNuoc), ('nguXoayHut', 'Ngư Tinh c5', xoayHut),
    ('hoVoNhay', 'Hồ Tinh c2', voNhay), ('hoPhanThan', 'Hồ Tinh c4', phanThan), ('namMe', 'Nấm Chúa chiêu 2', namMe),
    ('cuaTuong', 'Cua Đá chiêu 2', cuaTuong), ('namPhongNhay', 'Nấm Phồng Chúa', namPhongNhay), ('caNocLan', 'Cá Nóc Chúa', caNocLan),
    ('huDau', 'Hũ Chúa', huDau),
]


def main():
    cot = 2
    hang = (len(O_DS) + cot - 1) // cot
    im = Image.new('RGBA', (cot * PW + 20, TOP + hang * PH + 10), (250, 248, 242, 255))
    d = ImageDraw.Draw(im)
    d.text((12, 8), 'Chiêu mới thay 10 chiêu lặp kiểu (js/chieu_trum.js) — sơ đồ từ đúng số trong code', fill=(20, 20, 20), font=f16b)
    d.text((12, 32), 'Đỏ: vùng đánh (báo trước rồi nổ) · cam: chỉ báo đường lăn · xanh dương: vùng kéo · xanh ngọc: tường chắn · nét chấm tím: trục đối xứng · Q trùm, P em bé', fill=(60, 60, 60), font=f10)
    d.text((12, 46), 'Sàn mẫu = sàn phòng trùm thật x 89–371, y 64–250; vùng tròn dẹt ZK 0,85. Thời gian pha 1 (tinh anh không "nhanh"). Cờ ?chieucu=1 dùng lại chiêu cũ.', fill=(60, 60, 60), font=f10)
    for i, (k, con, f) in enumerate(O_DS):
        ox, oy = 10 + (i % cot) * PW, TOP + (i // cot) * PH
        o = O(im, ox, oy)
        o.d.rectangle([ox, oy, ox + PW - 6, oy + PH - 6], outline=(200, 196, 186, 255))
        o.d.text((ox + 8, oy + 6), '%s · %s → %s' % (con, CU[k]['ten'], TEN[k]), fill=(20, 20, 20, 255), font=f11b)
        o.san()
        f(o)
    im.convert('RGB').save(OUT, optimize=True)
    print('Đã ghi', OUT)


if __name__ == '__main__':
    main()
