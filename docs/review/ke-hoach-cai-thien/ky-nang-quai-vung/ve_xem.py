#!/usr/bin/env python3
"""Ảnh soát tĩnh xem-ky-nang.png: 24 ô (8 vai × 3 vùng), mỗi ô một sơ đồ nhìn từ trên xuống của kỹ năng riêng một con quái.
KHÔNG chạy game. Mọi con số (độ dài, bán kính, góc, thời gian, hệ số sát thương) đọc thẳng từ bảng SO và CU trong
game/js/ky_nang_quai.js (khối JSON giữa /*SO*/ ... /*HET-SO*/ và /*CU*/ ... /*HET-CU*/), cách tính vị trí chép đúng theo code.

  python3 docs/review/ke-hoach-cai-thien/ky-nang-quai-vung/ve_xem.py

Quy ước: phòng mẫu 300 × 140 điểm ảnh game (khung xám = mép sàn). Vùng tròn dẹt theo G.ZK = 0,85 như trong game.
Đỏ = vùng đánh thật (báo trước rồi nổ). Cam viền đứt = vùng chỉ để báo (đòn do thân quái / vật bay gây). Xanh lá = vũng / mây độc,
xanh ngọc = vệt nhớt / vũng điện. Chấm tím Q = quái, chấm xanh P = em bé. Mũi tên đen = đường đi của quái / vật.
"""
import json, math, os, re
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
SRC = os.path.join(ROOT, 'game', 'js', 'ky_nang_quai.js')
OUT = os.path.join(HERE, 'xem-ky-nang.png')
js = open(SRC, encoding='utf-8').read()
SO = json.loads(re.search(r'= /\*SO\*/(.*?)/\*HET-SO\*/', js, re.S).group(1))
CU = json.loads(re.search(r'= /\*CU\*/(.*?)/\*HET-CU\*/', js, re.S).group(1))
ZK = 0.85
X0, X1, Y0, Y1 = -150, 150, -70, 70  # sàn mẫu
SC = 1.0
CW, CH = 330, 262
TOP = 70
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FONTB = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
f9, f10, f11b, f16b = ImageFont.truetype(FONT, 10), ImageFont.truetype(FONT, 11), ImageFont.truetype(FONTB, 12), ImageFont.truetype(FONTB, 17)

RED = ((255, 50, 30, 80), (230, 40, 20, 255))
WARN = ((255, 160, 40, 55), (240, 130, 20, 255))
GREEN = ((120, 210, 60, 90), (70, 150, 30, 255))
CYAN = ((90, 190, 210, 90), (40, 130, 160, 255))

ROLES = ['rusher', 'swarm', 'shield', 'archer', 'nimble', 'kami', 'bomber', 'spiky']
ROLE_VN = {'rusher': 'Lính xông', 'swarm': 'Bầy nhỏ', 'shield': 'Khiên', 'archer': 'Xạ thủ', 'nimble': 'Nhanh nhẹn', 'kami': 'Cảm tử', 'bomber': 'Đặt bom', 'spiky': 'Gai'}
ART = {'rusher': ['heoCon', 'cua', 'linhMa'], 'swarm': ['ongVo', 'caCon', 'doiThan'], 'shield': ['boHung', 'oc', 'tuongDa'], 'archer': ['hoaBaoTu', 'haiQuy', 'denLong'],
       'nimble': ['chonBong', 'caChuon', 'meoDen'], 'kami': ['namPhong', 'caNoc', 'huLua'], 'bomber': ['socNo', 'sua', 'tieuYeu'], 'spiky': ['nhimDoc', 'nhim', 'nhimThan']}
TEN = {'heoCon': ('Heo Rừng Con', 'Húc thẳng'), 'ongVo': ('Ong Vò Vẽ', 'Vòng vây chích'), 'boHung': ('Bọ Hung', 'Lăn cầu đất'), 'hoaBaoTu': ('Hoa Bào Tử', 'Mưa bào tử'),
       'chonBong': ('Chồn Bóng', 'Lẩn bóng'), 'namPhong': ('Nấm Phồng', 'Nổ bào tử'), 'socNo': ('Sóc Nổ', 'Ném hạt dẻ'), 'nhimDoc': ('Nhím Độc', 'Cuộn lăn'),
       'cua': ('Cua', 'Lướt ngang kẹp'), 'caCon': ('Cá Con', 'Đàn sóng'), 'oc': ('Ốc', 'Rút vỏ'), 'haiQuy': ('Hải Quỳ', 'Quạt tia nước'),
       'caChuon': ('Cá Chuồn', 'Vọt đáp'), 'caNoc': ('Cá Nóc', 'Hút rồi nổ gai'), 'sua': ('Sứa', 'Vũng điện'), 'nhim': ('Nhím biển', 'Gai xoắn ốc'),
       'linhMa': ('Linh Ma', 'Chớp chém'), 'doiThan': ('Dơi Thần', 'Bổ nhào chữ V'), 'tuongDa': ('Tượng Đá', 'Đập đất'), 'denLong': ('Đèn Lồng', 'Lửa ma đuổi'),
       'meoDen': ('Mèo Đen', 'Phân thân'), 'huLua': ('Hũ Lửa', 'Lăn vệt lửa'), 'tieuYeu': ('Tiểu Yêu', 'Bùa tam giác'), 'nhimThan': ('Nhím Thần', 'Gai trồi')}
VUNG = ['Rừng già', 'Hang biển', 'Lâu đài cổ']
TAM_DON = {'oc': 26, 'namPhong': 34}  # don.tam trong js/monster_art.js (đòn đập của Ốc: quạt r = tam + 6)
XOE_DON = {'oc': 1.6}


def so(v):
    return ('%.2f' % v).rstrip('0').rstrip('.').replace('.', ',')


class O:
    """Một ô: vẽ lên lớp RGBA riêng rồi dán."""

    def __init__(self, img, ox, oy):
        self.img, self.ox, self.oy = img, ox, oy
        self.cx, self.cy = ox + CW / 2, oy + TOP + (Y1 - Y0) * SC / 2 + 6

    def P(self, x, y):
        return (self.cx + x * SC, self.cy + y * SC)

    def layer(self, fn):
        L = Image.new('RGBA', self.img.size, (0, 0, 0, 0))
        fn(ImageDraw.Draw(L))
        self.img.alpha_composite(L)

    def poly(self, pts, col, dash=False):
        q = [self.P(x, y) for x, y in pts]
        self.layer(lambda d: d.polygon(q, fill=col[0]))
        d = ImageDraw.Draw(self.img)
        for i in range(len(q)):
            a, b = q[i], q[(i + 1) % len(q)]
            if dash: self.dash(d, a, b, col[1])
            else: d.line([a, b], fill=col[1], width=1)

    def dash(self, d, a, b, col):
        L = math.hypot(b[0] - a[0], b[1] - a[1]); n = max(1, int(L / 4))
        for i in range(0, n, 2):
            u0, u1 = i / n, min(1, (i + 1) / n)
            d.line([(a[0] + (b[0] - a[0]) * u0, a[1] + (b[1] - a[1]) * u0), (a[0] + (b[0] - a[0]) * u1, a[1] + (b[1] - a[1]) * u1)], fill=col)

    def line(self, x, y, ang, L, w, col, dash=False):
        c, s, h = math.cos(ang), math.sin(ang), w / 2
        at = lambda a, b: (x + a * c - b * s, y + a * s + b * c)
        self.poly([at(0, -h), at(L, -h), at(L, h), at(0, h)], col, dash)

    def ellipse_pts(self, x, y, r, ky, a0=0, a1=math.tau, n=48):
        return [(x + math.cos(a0 + (a1 - a0) * i / n) * r, y + math.sin(a0 + (a1 - a0) * i / n) * r * ky) for i in range(n + 1)]

    def circle(self, x, y, r, col, dash=False, ky=ZK):
        self.poly(self.ellipse_pts(x, y, r, ky)[:-1], col, dash)

    def cone(self, x, y, ang, r, span, col):
        pts = [(x, y)] + [(x + math.cos(ang - span / 2 + span * i / 24) * r, y + math.sin(ang - span / 2 + span * i / 24) * r) for i in range(25)]
        self.poly(pts, col)

    def donut(self, x, y, r0, r1, col):
        out, inn = self.ellipse_pts(x, y, r1, ZK), self.ellipse_pts(x, y, r0, ZK)[::-1]
        self.poly(out + inn, col)

    def arrow(self, pts, col=(20, 24, 46, 255), w=2):
        q = [self.P(x, y) for x, y in pts]
        d = ImageDraw.Draw(self.img)
        d.line(q, fill=col, width=w)
        (ax, ay), (bx, by) = q[-2], q[-1]
        a = math.atan2(by - ay, bx - ax)
        d.polygon([(bx, by), (bx - 7 * math.cos(a - 0.45), by - 7 * math.sin(a - 0.45)), (bx - 7 * math.cos(a + 0.45), by - 7 * math.sin(a + 0.45))], fill=col)

    def dot(self, x, y, kind, label=None):
        d = ImageDraw.Draw(self.img)
        px, py = self.P(x, y)
        col = (110, 50, 170, 255) if kind == 'Q' else (40, 120, 230, 255) if kind == 'P' else (150, 110, 200, 160)
        d.ellipse([px - 5, py - 5, px + 5, py + 5], fill=col, outline=(20, 24, 46, 255))
        d.text((px + 6, py - 13), label or kind, fill=(20, 24, 46, 255), font=f9)

    def text(self, x, y, s, col=(60, 60, 70, 255), font=None):
        px, py = self.P(x, y)
        ImageDraw.Draw(self.img).text((px, py), s, fill=col, font=font or f9)


def tuong2(x, y, a, mx):
    c, s = math.cos(a), math.sin(a)
    t, m = mx, None
    for v, k in ([((X1 - 2 - x) / c, 'x')] if c > 1e-6 else [((X0 + 2 - x) / c, 'x')] if c < -1e-6 else []) + \
                ([((Y1 - 1 - y) / s, 'y')] if s > 1e-6 else [((Y0 + 1 - y) / s, 'y')] if s < -1e-6 else []):
        if v < t: t, m = v, k
    return max(0, t), m


def ve(o, art):
    S = SO[art]
    if art == 'heoCon':
        M, Pp = (-40, 10), (30, 10)
        g, _ = tuong2(M[0], M[1], 0, S['dai'])
        o.line(M[0], M[1], 0, g, S['rong'], WARN, True); o.arrow([M, (M[0] + g, M[1])]); o.dot(*M, 'Q'); o.dot(*Pp, 'P')
        o.text(-140, -62, 'húc %s, tốc %s; đâm tường: choáng %s s' % (so(g), so(S['toc']), so(S['choang'])))
    elif art == 'ongVo':
        Pp = (10, 0); R = S['banKinh']
        o.poly(o.ellipse_pts(Pp[0], Pp[1], R, 0.7)[:-1], ((0, 0, 0, 0), (120, 120, 140, 255)), True)
        for i, g in enumerate([math.pi * 0.9, math.pi * 0.25, -math.pi * 0.55]):
            sx, sy = Pp[0] + math.cos(g) * R, Pp[1] + math.sin(g) * R * 0.7
            b = math.atan2(Pp[1] - sy, Pp[0] - sx); L = math.hypot(Pp[0] - sx, Pp[1] - sy) + S['qua']
            o.line(sx, sy, b, L, S['rong'], RED); o.text(sx - 10, sy - 12, str(i + 1))
        o.dot(Pp[0] - R, Pp[1], 'Q'); o.dot(*Pp, 'P')
        o.text(-140, -62, 'vòng %s s r=%s, %d nhát cách %s s' % (so(S['vong']), so(R), S['nhat'], so(S['cach'])))
    elif art == 'boHung':
        M, Pp = (-90, 0), (20, 0)
        g, _ = tuong2(M[0], M[1], 0, S['dai'])
        o.line(M[0], M[1], 0, g, S['rong'], WARN, True); o.circle(M[0] + 20, 0, S['r'], ((150, 110, 60, 200), (80, 60, 30, 255)), ky=1)
        o.arrow([(M[0] + 30, 0), (M[0] + g, 0)]); o.dot(*M, 'Q'); o.dot(*Pp, 'P')
        d = ImageDraw.Draw(o.img); px, py = o.P(M[0] + 13, 0); d.arc([px - 14, py - 14, px + 14, py + 14], -50, 50, fill=(230, 180, 40, 255), width=3)
        o.text(-140, -62, 'cầu đất r=%s, tốc %s, dài %s; giáp trước' % (so(S['r']), so(S['toc']), so(g)))
    elif art == 'hoaBaoTu':
        M, Pp = (-110, 0), (30, 0)
        for s in (0, -1, 1):
            x, y = Pp[0] + 8 * abs(s), Pp[1] + S['lech'] * s * 0.7
            o.circle(x, y, S['vungR'], GREEN); o.circle(x, y, S['r'], RED)
            o.arrow([M, ((M[0] + x) / 2, (M[1] + y) / 2 - 30), (x, y)], (60, 120, 40, 255), 1)
        o.dot(*M, 'Q'); o.dot(*Pp, 'P')
        o.text(-140, -62, '3 hạt r=%s bay %s s; vũng r=%s %s s' % (so(S['r']), so(S['bay']), so(S['vungR']), so(S['vungGiay'])))
    elif art == 'chonBong':
        M, Pp = (-100, 0), (0, 0)
        h = (Pp[0] - S['sau'], 0)
        o.circle(h[0], h[1], S['dau'], WARN, True); o.cone(h[0], h[1], 0, S['r'], S['xoe'], RED)
        o.dot(*M, 'Q', 'Q (mờ %s s)' % so(S['mo'])); o.dot(*h, 'h', 'hiện'); o.dot(*Pp, 'P', 'P →'); o.arrow([M, (h[0] - 8, -4)], (120, 120, 140, 255), 1)
        o.text(-140, -62, 'ẩn %s s, hiện sau lưng %s, cào quạt r=%s' % (so(S['an']), so(S['sau']), so(S['r'])))
    elif art == 'namPhong':
        M, Pp = (0, 0), (28, 0)
        o.circle(0, 0, S['may'], GREEN); o.circle(0, 0, S['r'], RED); o.dot(*M, 'Q'); o.dot(*Pp, 'P')
        o.text(-140, -62, 'nổ r=%s ×%s; mây r=%s %s s' % (so(S['r']), so(S['sat']), so(S['may']), so(S['mayGiay'])))
    elif art == 'socNo':
        M, Pp = (-95, 0), (20, 0); L2 = (Pp[0] + S['nay'], 0)
        o.circle(*L2, S['r'], RED); o.arrow([M, (-40, -34), Pp], (120, 80, 30, 255), 1); o.arrow([Pp, (Pp[0] + S['nay'] / 2, -10), L2], (120, 80, 30, 255), 1)
        o.dot(*M, 'Q'); o.dot(*Pp, 'P')
        o.text(-140, -62, 'bay %s + nảy %s (%s s) + ngòi %s s, r=%s' % (so(S['bay']), so(S['nay']), so(S['nayGiay']), so(S['ngoi']), so(S['r'])))
    elif art in ('nhimDoc',):
        M, Pp = (60, -20), (-40, 30)
        o.circle(*M, 7 + 7, WARN, True)
        a = math.atan2(Pp[1] - M[1], Pp[0] - M[0]); g, m = tuong2(M[0], M[1], a, S['dai']); L1 = max(16, g)
        o.line(M[0], M[1], a, L1, S['rong'], WARN, True); B = (M[0] + math.cos(a) * L1, M[1] + math.sin(a) * L1)
        pts = [M, B]
        if g < S['dai'] - 1 and m:
            a2 = math.pi - a if m == 'x' else -a; L2 = min(S['dai'] - L1, tuong2(B[0], B[1], a2, S['dai'] - L1)[0])
            if L2 > 8: o.line(B[0], B[1], a2, L2, S['rong'], WARN, True); pts.append((B[0] + math.cos(a2) * L2, B[1] + math.sin(a2) * L2))
        o.arrow(pts); o.dot(*M, 'Q'); o.dot(*Pp, 'P')
        o.text(-140, -62, 'cuộn %s + vạch %s s, lăn %s, dài %s' % (so(S['cuon']), so(S['bao']), so(S['toc']), so(S['dai'])))
    elif art == 'cua':
        M, Pp = (-90, 4), (10, 4); xe = Pp[0] - S['cach']
        o.line(M[0], M[1], 0, xe - M[0], S['rong'], WARN, True); o.cone(xe, M[1], 0, S['r'], S['xoe'], RED)
        o.arrow([(M[0], -40), (M[0], M[1] - 8)], (120, 120, 140, 255), 1); o.arrow([M, (xe, M[1])]); o.dot(*M, 'Q'); o.dot(*Pp, 'P')
        o.text(-140, -62, 'căn hàng ±%s, lướt X tốc %s, kẹp quạt r=%s' % (so(S['lechY']), so(S['toc']), so(S['r'])))
    elif art == 'caCon':
        M, Pp = (-110, -10), (0, 10)
        a = math.atan2(Pp[1] - M[1], Pp[0] - M[0]); d = math.hypot(Pp[0] - M[0], Pp[1] - M[1]); L = max(30, tuong2(M[0], M[1], a, d + S['qua'])[0])
        c0, s0 = math.cos(a), math.sin(a)
        at = lambda s: (M[0] + c0 * s - s0 * S['bienDo'] * math.sin(math.tau * s / S['buoc']), M[1] + s0 * s + c0 * S['bienDo'] * math.sin(math.tau * s / S['buoc']) * 0.8)
        s = 0
        while s < L:
            q0, q1 = at(s), at(min(L, s + 20)); o.line(q0[0], q0[1], math.atan2(q1[1] - q0[1], q1[0] - q0[0]), math.hypot(q1[0] - q0[0], q1[1] - q0[1]) + 1, S['rong'], WARN, True); s += 20
        o.arrow([at(i) for i in range(0, int(L) + 1, 5)]); o.dot(*M, 'Q'); o.dot(*Pp, 'P')
        o.text(-140, -62, 'sin biên %s bước %s, tốc %s, qua rồi về' % (so(S['bienDo']), so(S['buoc']), so(S['toc'])))
    elif art == 'oc':
        M, Pp = (0, 0), (24, 0)
        for i in range(5): o.circle(-20 - i * S['nhotCach'], 4, S['nhotR'], CYAN)
        o.cone(0, 0, 0, TAM_DON['oc'] + 6, min(2.2, XOE_DON['oc']), RED); o.arrow([(-10, 4), (-62, 4)], (120, 120, 140, 255), 1)
        o.dot(*M, 'Q', 'Q (vỏ %s s)' % so(S['vo'])); o.dot(*Pp, 'P')
        o.text(-140, -62, 'rút vỏ %s s, hồi %s s; nhớt r=%s chậm %d%%' % (so(S['vo']), so(S['voHoi']), so(S['nhotR']), round(S['cham'] * 100)))
    elif art == 'haiQuy':
        M, Pp = (-80, 0), (30, 0)
        for g in (-S['goc'], 0, S['goc']): o.line(M[0], M[1], g, S['dai'], S['rong'], WARN, True)
        o.circle(*M, S['r'], RED, True); o.dot(*M, 'Q'); o.dot(*Pp, 'P')
        o.text(-140, -62, '3 tia ±%s rad dài %s; sát < %s: quét r=%s' % (so(S['goc']), so(S['dai']), so(S['gan']), so(S['r'])))
    elif art == 'caChuon':
        M, Pp = (-90, 0), (20, 0)
        o.circle(*Pp, S['r'], RED); o.arrow([(M[0] + (Pp[0] - M[0]) * u / 10, -math.sin(u / 10 * math.pi) * S['cao']) for u in range(11)])
        o.dot(*M, 'Q'); o.dot(*Pp, 'P')
        o.text(-140, -62, 'nhún %s s, bay %s s cao %s, đáp r=%s' % (so(S['bao']), so(S['bay']), so(S['cao']), so(S['r'])))
    elif art == 'caNoc':
        M, Pp = (0, 0), (46, 10)
        for i in range(S['gai']): o.line(0, 0, 0.2 + i / S['gai'] * math.tau, S['dai'], S['rong'], WARN, True)
        o.arrow([Pp, (Pp[0] - 22, Pp[1] - 5)], (40, 120, 230, 255), 1); o.dot(*M, 'Q'); o.dot(*Pp, 'P')
        o.text(-140, -62, 'hút %s/s trong %s s, %d gai ×%s dài %s' % (so(S['hut']), so(S['bao']), S['gai'], so(S['sat']), so(S['dai'])))
    elif art == 'sua':
        M, Pp = (0, 0), (60, 0)
        o.circle(0, 0, S['r'], CYAN); o.circle(0, 0, S['r'], RED); o.dot(*M, 'Q'); o.dot(*Pp, 'P')
        t, ls = 0, []
        for v in S['nhip']: t += v; ls.append(so(t))
        o.text(-140, -62, 'vũng r=%s, sáng lúc %s s, tê %s s' % (so(S['r']), ' · '.join(ls), so(S['te'])))
    elif art == 'nhim':
        M, Pp = (0, 0), (60, 20)
        g0 = math.atan2(Pp[1], Pp[0])
        for j in range(S['nhanh']): o.line(0, 0, g0 + j * math.tau / S['nhanh'], S['dai'], S['rong'], WARN, True)
        T = S['lan'] * S['cach'] + 0.2
        d = ImageDraw.Draw(o.img)
        for n in range(S['lan']):
            for j in range(S['nhanh']):
                g = g0 + j * math.tau / S['nhanh'] + n * S['xoay']; r = S['toc'] * (T - n * S['cach'])
                if r * 1 > 0:
                    x, y = math.cos(g) * r, math.sin(g) * r
                    if X0 < x < X1 and Y0 < y < Y1: px, py = o.P(x, y); d.ellipse([px - 2, py - 2, px + 2, py + 2], fill=(200, 40, 20, 255))
        o.dot(*M, 'Q'); o.dot(*Pp, 'P')
        o.text(-140, -62, '%d cánh × %d lượt, xoay %s rad/lượt, tốc %s' % (S['nhanh'], S['lan'], so(S['xoay']), so(S['toc'])))
    elif art == 'linhMa':
        M, Pp = (-90, 0), (0, 0); Q = (Pp[0] + S['sau'], 0)
        o.circle(*Q, S['dau'], WARN, True); o.line(Q[0], Q[1], math.pi, S['dai'], S['rong'], RED)
        o.arrow([M, (Q[0] - 4, -20), Q], (120, 120, 140, 255), 1); o.dot(*M, 'Q'); o.dot(*Q, 'h', 'hiện'); o.dot(*Pp, 'P')
        o.text(-140, -62, 'dấu sau lưng %s, chém dài %s sau %s s' % (so(S['sau']), so(S['dai']), so(S['bao'] + S['hien'])))
    elif art == 'doiThan':
        M, Pp = (-80, 0), (0, 0); v = (Pp[0] + S['qua'], 0)
        for s in (-1, 1):
            sx, sy = M[0], M[1] + S['canh'] * s * 0.8
            o.line(sx, sy, math.atan2(v[1] - sy, v[0] - sx), math.hypot(v[0] - sx, v[1] - sy), S['rong'], RED)
        o.arrow([M, v]); o.dot(*M, 'Q'); o.dot(*Pp, 'P')
        o.text(-140, -62, 'chữ V cánh %s, qua %s; trúng: dơi hồi %d%%' % (so(S['canh']), so(S['qua']), round(S['hut'] * 100)))
    elif art == 'tuongDa':
        M, Pp = (0, 0), (50, 0)
        for g in S['song'][::-1]:
            if g[0]: o.donut(0, 0, g[0], g[1], RED)
            else: o.circle(0, 0, g[1], RED)
        o.dot(*M, 'Q'); o.dot(*Pp, 'P')
        o.text(-140, -62, 'gần < %s: 3 sóng %s s, cách %s s' % (so(S['gan']), ' / '.join('%s-%s' % (g[0], g[1]) for g in S['song']), so(S['cach'])))
    elif art == 'denLong':
        M, Pp = (-100, 0), (40, 20)
        o.line(M[0], M[1], 0, S['dai'], S['rong'], WARN, True)
        o.arrow([M, (-40, 0), (0, 10), (30, 30), (55, 28)], (230, 110, 20, 255), 2); o.dot(*M, 'Q'); o.dot(*Pp, 'P')
        o.text(-140, -62, 'lửa ma tốc %s đuổi %s s, chém là tan' % (so(S['toc']), so(S['giay'])))
    elif art == 'meoDen':
        M, Pp = (-60, 0), (30, 0)
        for s in (-1, 1):
            c = (M[0], M[1] + S['lech'] * s * 0.7); b = math.atan2(Pp[1] - c[1], Pp[0] - c[0]); L = math.hypot(Pp[0] - c[0], Pp[1] - c[1]) + 12
            o.dot(*c, 'b', 'bóng'); o.line(c[0], c[1], b, L, S['rongBong'], RED)
        o.dot(*M, 'Q'); o.dot(*Pp, 'P')
        o.text(-140, -62, '%d bóng %s s, lao ×%s; thật cào ×%s' % (S['bong'], so(S['giay']), so(S['satBong']), so(S['sat'])))
    elif art == 'huLua':
        M, Pp = (-80, 0), (10, 0); L = math.hypot(Pp[0] - M[0], 0) + S['qua']
        s = S['vet'] * 0.5
        while s <= L: o.circle(M[0] + s, 0, S['vetR'], ((255, 140, 30, 80), (220, 100, 20, 255))); s += S['vet']
        o.line(M[0], M[1], 0, L, S['rong'], WARN, True); o.circle(M[0] + L, 0, S['r'], RED); o.arrow([M, (M[0] + L, 0)]); o.dot(*M, 'Q'); o.dot(*Pp, 'P')
        o.text(-140, -62, 'lăn %s, vỡ r=%s ×%s, vệt lửa %s s' % (so(S['toc']), so(S['r']), so(S['sat']), so(S['vetGiay'])))
    elif art == 'tieuYeu':
        M, Pp = (-100, 0), (20, 0)
        V = [(Pp[0] + math.cos(-math.pi / 2 + i * math.tau / 3) * S['R'], Pp[1] + math.sin(-math.pi / 2 + i * math.tau / 3) * S['R'] * 0.75) for i in range(3)]
        o.poly(V, RED)
        for i in range(3):
            A, B = V[i], V[(i + 1) % 3]; o.line(A[0], A[1], math.atan2(B[1] - A[1], B[0] - A[0]), math.hypot(B[0] - A[0], B[1] - A[1]), S['rong'], WARN, True)
        o.dot(*M, 'Q'); o.dot(*Pp, 'P')
        o.text(-140, -62, 'tam giác R=%s, bay %s + chờ %s s, ×%s' % (so(S['R']), so(S['bay']), so(S['cho']), so(S['sat'])))
    elif art == 'nhimThan':
        M, Pp = (-90, 0), (10, 0)
        o.circle(*M, 14, WARN, True)
        for i in range(S['so']):
            x = M[0] + S['dau'] + i * S['cach']
            if x > X1: break
            o.circle(x, 0, S['r'], RED); o.text(x - 6, 12 + (i % 2) * 10, so(S['cuon'] + S['bao'] + i * S['nhip']))
        o.dot(*M, 'Q'); o.dot(*Pp, 'P', 'P')
        o.text(-140, -62, '%d gai r=%s cách %s, nhịp %s s' % (S['so'], so(S['r']), so(S['cach']), so(S['nhip'])))


def bao_truoc(art):
    S = SO[art]
    if art == 'chonBong': return S['mo'] + S['an']  # vòng đỏ chỗ hiện (sau khi mờ) + quạt cào S['bao'] sau đó
    if art in ('nhimDoc', 'nhim', 'nhimThan'): return S['cuon'] + S['bao']
    if art == 'linhMa': return S['bao'] + S['hien']
    if art == 'caChuon': return S['bao'] + S['bay']
    if art == 'socNo': return S['bao'] + S['bay'] + S['nayGiay'] + S['ngoi']
    if art == 'tieuYeu': return S['bao'] + S['bay'] + S['cho']
    if art == 'sua': return S['bao'] + S['nhip'][0]
    if art == 'hoaBaoTu': return S['bao'] + S['bay']
    if art == 'cua': return S['bao'] + S['kep']
    if art == 'ongVo': return S['bao']
    return S.get('bao', 0)


def main():
    W, Hh = CW * 8 + 20, 56 + CH * 3 + 64
    img = Image.new('RGBA', (W, Hh), (247, 244, 236, 255))
    d = ImageDraw.Draw(img)
    d.text((12, 10), 'Kỹ năng riêng 24 quái con (sơ đồ nhìn từ trên, số đọc thẳng từ game/js/ky_nang_quai.js — không chạy game)', fill=(20, 24, 46, 255), font=f16b)
    d.text((12, 34), 'Đỏ: vùng đánh thật · Cam viền đứt: vùng chỉ báo trước (thân quái / vật bay gây đòn) · Xanh lá: vũng, mây độc · Xanh ngọc: nhớt, vũng điện · Q quái, P em bé · ST = hệ số × e.dmg', fill=(60, 60, 70, 255), font=f10)
    for c, role in enumerate(ROLES):
        for r in range(3):
            art = ART[role][r]
            ox, oy = 10 + c * CW, 56 + r * CH
            o = O(img, ox, oy)
            d.rectangle([ox + 2, oy + 2, ox + CW - 4, oy + CH - 4], outline=(190, 180, 160, 255), fill=(255, 253, 248, 255))
            x0, y0 = o.P(X0, Y0); x1, y1 = o.P(X1, Y1)
            d.rectangle([x0, y0, x1, y1], outline=(150, 150, 150, 255), fill=(236, 232, 222, 255))
            ten, kn = TEN[art]
            d.text((ox + 8, oy + 6), '%s · %s' % (ten, kn), fill=(20, 24, 46, 255), font=f11b)
            d.text((ox + 8, oy + 22), '%s · %s · %s' % (VUNG[r], ROLE_VN[role], art), fill=(110, 110, 120, 255), font=f9)
            cu = CU[role]; S = SO[art]; sat = S.get('sat', 0)
            d.text((ox + 8, oy + 38), 'báo trước %s s (vai cũ %s) · ST ×%s (cũ ×%s)' % (so(bao_truoc(art)), so(cu['bao']), so(sat), so(cu['sat'])), fill=(160, 40, 30, 255), font=f9)
            ve(o, art)
    d.text((12, Hh - 56), 'Báo trước tính từ lúc vùng đỏ / tư thế báo đầu tiên hiện tới lúc đòn trúng. Vai cũ: thời gian lấy đà của đòn chung trước phiên này (đặt bom, gai: gồm cả vòng bom / dựng gai).', fill=(60, 60, 70, 255), font=f10)
    d.text((12, Hh - 38), 'Ong Vò: ×0,34 mỗi nhát nhỏ, đủ 3 nhát = ×1,02. Mèo Đen: bóng ×0,35 là đòn phụ. Vũng, mây, vệt lửa: mỗi nhịp 0,5 s mất 0,3 × hệ số vũng (như vũng nổ cũ).', fill=(60, 60, 70, 255), font=f10)
    img.convert('RGB').save(OUT, optimize=True)
    print('Đã ghi', OUT, img.size)


if __name__ == '__main__':
    main()
