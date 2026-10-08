# -*- coding: utf-8 -*-
"""Thư viện dùng chung để vẽ sơ đồ bố cục phòng của một ải (bản phác thảo, không phải mã game).

Mỗi ảnh được dựng thành một trang HTML có SVG, rồi chụp lại bằng Playwright.
"""
import os

THU_MUC = os.path.dirname(os.path.abspath(__file__))
THU_MUC_ANH = os.path.dirname(THU_MUC)

NEN = '#120d10'
NEN_KHUNG = '#1a1316'
VIEN_KHUNG = '#3b2c2b'
VANG = '#ffd27a'
KEM = '#f1ead9'
KEM_MO = '#b8a78c'
DO = '#d9453d'

# ---------- biểu tượng kiểu pixel ----------
BIEU_TUONG = {
    'bat_dau': """
..#######..
.#########.
###.....###
##.......##
##.......##
##.......##
##.....#.##
##.......##
##.......##
##.......##
##.......##""",
    'danh_quai': """
.....#.....
....###....
....###....
....###....
....###....
....###....
....###....
..#######..
....###....
....###....
....###....""",
    'tinh_anh': """
.#...#...#.
.##.###.##.
.#########.
###########
##..###..##
##..###..##
###########
###########
##.#.#.#.##
.#########.
..#######..""",
    'ruong': """
.#########.
###########
###########
###########
...........
###########
####...####
####.#.####
####...####
###########
###########""",
    'suoi': """
.....#.....
.....#.....
....###....
....###....
...#####...
..#######..
.#########.
.#########.
.#########.
..#######..
...#####...""",
    'thuong_nhan': """
...#.#.#...
...#####...
....###....
...#####...
..#######..
.#########.
.####.####.
.###...###.
.####.####.
.#########.
..#######..""",
    'thu_thach': """
.#########.
.#########.
..#.....#..
...#...#...
....#.#....
.....#.....
....#.#....
...#.#.#...
..#.###.#..
.#########.
.#########.""",
    'loi_nguyen': """
...........
...........
...#####...
.##.....##.
#...###...#
#..#####..#
#...###...#
.##.....##.
...#####...
...........
...........""",
    'trum': """
#.........#
##.......##
.#########.
.#########.
.##..#..##.
.##..#..##.
.#########.
..###.###..
..#######..
..#.#.#.#..
...........""",
    'khoa': """
...#####...
..##...##..
..#.....#..
..#.....#..
.#########.
.#########.
.####.####.
.####.####.
.#########.
.#########.
...........""",
    'chia': """
...........
...........
..###......
.#...#.....
.#...######
.#...#..#.#
..###...#.#
...........
...........
...........
...........""",
    'nguoi': """
...###...
..#####..
..#####..
...###...
.#######.
#.#####.#
#.#####.#
..#####..
..##.##..
..##.##..
.###.###.""",
    'quai': """
#.......#
##.....##
.#######.
#########
##.###.##
##.###.##
#########
#########
#.##.##.#
#.#...#.#""",
    'dau_tich': """
.........##
........##.
.......##..
......##...
##...##....
.##.##.....
..###......
...#.......""",
}
BIEU_TUONG = {k: [r for r in v.strip('\n').split('\n')] for k, v in BIEU_TUONG.items()}
for _k, _v in BIEU_TUONG.items():
    assert len(set(len(r) for r in _v)) == 1, _k

# loại phòng: (nhãn, màu)
LOAI = {
    'bat_dau': ('Bắt đầu', '#8fbf6a'),
    'danh_quai': ('Đánh quái', '#9a8878'),
    'tinh_anh': ('Tinh anh', '#e8853a'),
    'ruong': ('Rương báu', '#f2c230'),
    'suoi': ('Suối hồi', '#4aa8e0'),
    'thuong_nhan': ('Thương nhân', '#d4a878'),
    'thu_thach': ('Thử thách', '#3fc4a8'),
    'loi_nguyen': ('Lời nguyền', '#a874e8'),
    'trum': ('Trùm', '#e0463c'),
}
THU_TU_LOAI = ['bat_dau', 'danh_quai', 'tinh_anh', 'ruong', 'suoi', 'thuong_nhan', 'thu_thach', 'loi_nguyen', 'trum']


def tron(mau, nen, t):
    """Trộn màu: t = 1 là màu gốc, t = 0 là màu nền."""
    a = [int(mau[i:i + 2], 16) for i in (1, 3, 5)]
    b = [int(nen[i:i + 2], 16) for i in (1, 3, 5)]
    return '#%02x%02x%02x' % tuple(round(a[i] * t + b[i] * (1 - t)) for i in range(3))


def bieu_tuong(ten, x, y, px, mau, do_mo=1):
    """Vẽ biểu tượng pixel, góc trên trái ở (x, y), mỗi điểm rộng px."""
    out = []
    for r, hang in enumerate(BIEU_TUONG[ten]):
        c = 0
        while c < len(hang):
            if hang[c] == '#':
                d = c
                while d < len(hang) and hang[d] == '#':
                    d += 1
                out.append('<rect x="%g" y="%g" width="%g" height="%g"/>' % (x + c * px, y + r * px, (d - c) * px, px))
                c = d
            else:
                c += 1
    return '<g fill="%s" opacity="%g" shape-rendering="crispEdges">%s</g>' % (mau, do_mo, ''.join(out))


def bieu_tuong_giua(ten, cx, cy, px, mau, do_mo=1):
    b = BIEU_TUONG[ten]
    return bieu_tuong(ten, cx - len(b[0]) * px / 2, cy - len(b) * px / 2, px, mau, do_mo)


class BoCuc:
    """Một bố cục: phong = {mã: (cột, hàng, loại)}, cua = [(mã 1, mã 2, kiểu)].
    Kiểu cửa: 'chinh' (lối chính), 'phu' (lối rẽ phòng phụ), 'thuong', 'khoa' (cửa trùm có khóa)."""

    def __init__(self, phong, cua, so_cot, so_hang):
        self.phong, self.cua, self.so_cot, self.so_hang = phong, cua, so_cot, so_hang


def so_do_lon(bc, S=220, G=70, P=30, thu_tu=None, chia=(), nhan_rieng=None, co_chu=23, o_trong=True):
    """Sơ đồ lớn. Trả về (svg, rộng, cao, hàm vị trí ô)."""
    W = bc.so_cot * S + (bc.so_cot - 1) * G + 2 * P
    H = bc.so_hang * S + (bc.so_hang - 1) * G + 2 * P
    vt = lambda c, r: (P + c * (S + G), P + r * (S + G))
    o = ['<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d" font-family="DejaVu Sans, sans-serif">' % (W, H, W, H)]
    da_dung = {(c, r) for c, r, _ in bc.phong.values()}
    if o_trong:
        for c in range(bc.so_cot):
            for r in range(bc.so_hang):
                if (c, r) not in da_dung:
                    x, y = vt(c, r)
                    o.append('<rect x="%d" y="%d" width="%d" height="%d" fill="none" stroke="#2c2124" stroke-width="3" stroke-dasharray="10 10"/>' % (x + 2, y + 2, S - 4, S - 4))
    T = 28
    # cửa nối
    for a, b, kieu in bc.cua:
        ca, ra, _ = bc.phong[a]
        cb, rb, _ = bc.phong[b]
        xa, ya = vt(ca, ra)
        xb, yb = vt(cb, rb)
        ngang = ra == rb
        mau = {'chinh': VANG, 'phu': KEM_MO, 'thuong': KEM_MO, 'khoa': DO}[kieu]
        if ngang:
            x0 = min(xa, xb) + S
            cy = ya + S / 2
            hcn = (x0, cy - T / 2, G, T)
        else:
            y0 = min(ya, yb) + S
            cx = xa + S / 2
            hcn = (cx - T / 2, y0, T, G)
        mx, my = hcn[0] + hcn[2] / 2, hcn[1] + hcn[3] / 2
        if kieu == 'phu':
            # ba khối rời: lối rẽ không bắt buộc
            n = 3
            for i in range(n):
                if ngang:
                    w = G / (2 * n - 1)
                    o.append('<rect x="%g" y="%g" width="%g" height="%g" fill="%s"/>' % (hcn[0] + i * 2 * w, hcn[1] + 4, w, T - 8, mau))
                else:
                    h = G / (2 * n - 1)
                    o.append('<rect x="%g" y="%g" width="%g" height="%g" fill="%s"/>' % (hcn[0] + 4, hcn[1] + i * 2 * h, T - 8, h, mau))
        else:
            o.append('<rect x="%g" y="%g" width="%g" height="%g" fill="%s"/>' % (hcn + (mau,)))
        if kieu == 'chinh':
            # mũi tên chỉ hướng đi
            dx = (1 if xb > xa else -1) if ngang else 0
            dy = 0 if ngang else (1 if yb > ya else -1)
            k = 9
            if ngang:
                pts = [(mx - dx * k, my - k), (mx + dx * k, my), (mx - dx * k, my + k)]
            else:
                pts = [(mx - k, my - dy * k), (mx, my + dy * k), (mx + k, my - dy * k)]
            o.append('<polygon points="%s" fill="%s"/>' % (' '.join('%g,%g' % p for p in pts), NEN))
        if kieu == 'khoa':
            o.append('<rect x="%g" y="%g" width="60" height="60" fill="%s" stroke="%s" stroke-width="5"/>' % (mx - 30, my - 30, NEN, DO))
            o.append(bieu_tuong_giua('khoa', mx, my + 2, 4, DO))
    # phòng
    for ma, (c, r, loai) in bc.phong.items():
        x, y = vt(c, r)
        nhan, mau = LOAI[loai]
        if nhan_rieng and ma in nhan_rieng:
            nhan = nhan_rieng[ma]
        o.append('<rect x="%d" y="%d" width="%d" height="%d" fill="%s" stroke="%s" stroke-width="8"/>' % (x + 4, y + 4, S - 8, S - 8, tron(mau, NEN, 0.2), mau))
        o.append('<rect x="%d" y="%d" width="%d" height="%d" fill="none" stroke="%s" stroke-width="3"/>' % (x + 16, y + 16, S - 32, S - 32, tron(mau, NEN, 0.42)))
        px = 8 if S >= 200 else 7
        o.append(bieu_tuong_giua(loai, x + S / 2, y + S * 0.40, px, mau))
        o.append('<text x="%g" y="%g" text-anchor="middle" font-size="%d" font-weight="bold" fill="%s">%s</text>' % (x + S / 2, y + S - 34, co_chu, KEM, nhan))
    # cửa đè lên viền phòng: vẽ lại bậc cửa cho rõ
    for a, b, kieu in bc.cua:
        ca, ra, _ = bc.phong[a]
        cb, rb, _ = bc.phong[b]
        xa, ya = vt(ca, ra)
        xb, yb = vt(cb, rb)
        mau = {'chinh': VANG, 'phu': KEM_MO, 'thuong': KEM_MO, 'khoa': DO}[kieu]
        if ra == rb:
            for ex in (min(xa, xb) + S - 8, max(xa, xb) - 8):
                o.append('<rect x="%g" y="%g" width="16" height="64" fill="%s"/>' % (ex, ya + S / 2 - 32, mau))
        else:
            for ey in (min(ya, yb) + S - 8, max(ya, yb) - 8):
                o.append('<rect x="%g" y="%g" width="64" height="16" fill="%s"/>' % (xa + S / 2 - 32, ey, mau))
    # số thứ tự trên lối chính
    if thu_tu:
        for i, ma in enumerate(thu_tu):
            c, r, _ = bc.phong[ma]
            x, y = vt(c, r)
            o.append('<rect x="%d" y="%d" width="46" height="46" fill="%s" stroke="%s" stroke-width="4"/>' % (x - 8, y - 8, VANG, NEN))
            o.append('<text x="%d" y="%d" text-anchor="middle" font-size="28" font-weight="bold" fill="%s">%d</text>' % (x + 15, y + 26, NEN, i + 1))
    # mảnh chìa ở góc phòng
    for ma in chia:
        c, r, _ = bc.phong[ma]
        x, y = vt(c, r)
        o.append('<rect x="%d" y="%d" width="54" height="46" fill="%s" stroke="%s" stroke-width="4"/>' % (x + S - 46, y - 8, NEN, VANG))
        o.append(bieu_tuong('chia', x + S - 41, y - 7, 4, VANG))
    o.append('</svg>')
    return ''.join(o), W, H, vt


def ban_do_nho(bc, trang_thai, s=64, g=22, pad=18, khoa=True, khung=True, nen='#0c090b'):
    """Bản đồ nhỏ như người chơi thấy. trang_thai = {mã: 'dang' | 'qua' | 'biet'}; phòng không có trong đó thì ẩn."""
    W = bc.so_cot * s + (bc.so_cot - 1) * g + 2 * pad
    H = bc.so_hang * s + (bc.so_hang - 1) * g + 2 * pad
    vt = lambda c, r: (pad + c * (s + g), pad + r * (s + g))
    o = ['<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d">' % (W, H, W, H)]
    if khung:
        o.append('<rect x="2" y="2" width="%d" height="%d" fill="%s" stroke="%s" stroke-width="4"/>' % (W - 4, H - 4, nen, tron(VANG, NEN, 0.55)))
    t = max(4, round(s * 0.2))
    khoa_ve = []
    for a, b, kieu in bc.cua:
        ta, tb = trang_thai.get(a), trang_thai.get(b)
        if not (ta in ('dang', 'qua') or tb in ('dang', 'qua')):
            continue
        ca, ra, _ = bc.phong[a]
        cb, rb, _ = bc.phong[b]
        xa, ya = vt(ca, ra)
        xb, yb = vt(cb, rb)
        bi_khoa = kieu == 'khoa' and khoa
        mau = DO if bi_khoa else (VANG if kieu == 'khoa' else KEM_MO)
        if ra == rb:
            x0 = min(xa, xb) + s
            o.append('<rect x="%g" y="%g" width="%g" height="%g" fill="%s"/>' % (x0, ya + s / 2 - t / 2, g, t, mau))
            mx, my = x0 + g / 2, ya + s / 2
        else:
            y0 = min(ya, yb) + s
            o.append('<rect x="%g" y="%g" width="%g" height="%g" fill="%s"/>' % (xa + s / 2 - t / 2, y0, t, g, mau))
            mx, my = xa + s / 2, y0 + g / 2
        if bi_khoa:
            kp = max(1, round(s / 30))
            kb = 11 * kp + 6
            khoa_ve.append('<rect x="%g" y="%g" width="%g" height="%g" fill="%s" stroke="%s" stroke-width="%g"/>' % (mx - kb / 2, my - kb / 2, kb, kb, NEN, DO, max(1.5, kp)))
            if s >= 30:
                khoa_ve.append(bieu_tuong_giua('khoa', mx, my + kp / 2, kp, DO))
    ip = int(s * 0.62 / 11)
    for ma, (c, r, loai) in bc.phong.items():
        tt = trang_thai.get(ma)
        if not tt:
            continue
        x, y = vt(c, r)
        mau = LOAI[loai][1]
        if tt == 'dang':
            v = max(2, round(s / 16))
            o.append('<rect x="%g" y="%g" width="%g" height="%g" fill="none" stroke="%s" stroke-width="%g"/>' % (x - v * 1.5, y - v * 1.5, s + 3 * v, s + 3 * v, VANG, v))
            o.append('<rect x="%g" y="%g" width="%g" height="%g" fill="%s" stroke="%s" stroke-width="%g"/>' % (x + v / 2, y + v / 2, s - v, s - v, mau, '#ffffff', v))
            if ip:
                o.append(bieu_tuong_giua(loai, x + s / 2, y + s / 2, ip, NEN))
        elif tt == 'qua':
            o.append('<rect x="%g" y="%g" width="%g" height="%g" fill="%s"/>' % (x, y, s, s, tron(mau, NEN, 0.5)))
            if ip:
                o.append(bieu_tuong_giua(loai, x + s / 2, y + s / 2, ip, NEN))
        else:
            v = max(2, round(s / 20))
            o.append('<rect x="%g" y="%g" width="%g" height="%g" fill="%s" stroke="%s" stroke-width="%g"/>' % (x + v / 2, y + v / 2, s - v, s - v, NEN_KHUNG, mau, v))
            if ip:
                o.append(bieu_tuong_giua(loai, x + s / 2, y + s / 2, ip, mau, 0.85))
    o.extend(khoa_ve)
    o.append('</svg>')
    return ''.join(o)


def o_chu_giai(loai, co=52):
    nhan, mau = LOAI[loai]
    svg = ('<svg width="%d" height="%d" viewBox="0 0 %d %d"><rect x="3" y="3" width="%d" height="%d" fill="%s" stroke="%s" stroke-width="5"/>%s</svg>'
           % (co, co, co, co, co - 6, co - 6, tron(mau, NEN, 0.2), mau, bieu_tuong_giua(loai, co / 2, co / 2, 3, mau)))
    return '<div class="cg">%s<span>%s</span></div>' % (svg, nhan)


def chu_giai():
    return '<div class="chu-giai"><div class="cg-ten">Chú giải</div>%s</div>' % ''.join(o_chu_giai(l) for l in THU_TU_LOAI)


CSS = """
*{box-sizing:border-box}
html,body{margin:0;background:#120d10}
body{width:1600px;color:#f1ead9;font-family:'DejaVu Sans',sans-serif;font-size:28px;line-height:1.38}
.trang{padding:54px 60px 60px}
.nhan-kieu{display:inline-block;background:#ffd27a;color:#120d10;font-weight:bold;font-size:30px;padding:6px 18px;letter-spacing:2px}
h1{font-size:62px;line-height:1.15;color:#ffd27a;margin:14px 0 0}
.phu-de{font-size:31px;margin:14px 0 0;color:#f1ead9}
.vach{height:8px;margin:26px 0 30px;background:repeating-linear-gradient(90deg,#ffd27a 0 24px,transparent 24px 36px);opacity:.75}
h2{font-size:40px;color:#ffd27a;margin:46px 0 20px}
.khung{background:#1a1316;border:4px solid #3b2c2b}
.so-do{position:relative;margin:0 auto}
.ghi{position:absolute;display:flex;align-items:center;justify-content:center;text-align:center;font-size:24px;line-height:1.3;color:#e3d7bf;padding:10px}
.ghi b{color:#ffd27a}
.cach-doc{display:flex;flex-wrap:wrap;gap:16px 44px;align-items:center;margin-top:24px;font-size:27px}
.cach-doc .muc{display:flex;align-items:center;gap:14px}
.luat{margin-top:24px;border:4px solid #ffd27a;background:#241a14;padding:20px 26px;font-size:30px}
.luat b{color:#ffd27a}
.chu-giai{display:flex;flex-wrap:wrap;gap:14px 30px;align-items:center;margin-top:24px;padding:18px 24px;background:#1a1316;border:4px solid #3b2c2b}
.cg-ten{font-weight:bold;color:#ffd27a;font-size:27px;width:100%}
.cg{display:flex;align-items:center;gap:12px;font-size:26px}
.hang-bdn{display:flex;gap:30px}
.bdn{flex:1;background:#1a1316;border:4px solid #3b2c2b;padding:20px 20px 22px;text-align:center}
.bdn .ten{font-weight:bold;font-size:31px;color:#ffd27a;margin-bottom:16px}
.bdn .mo-ta{font-size:25px;margin-top:14px;color:#e3d7bf;line-height:1.32}
.bdn .cho-ve{height:VAR_CAOpx;display:flex;align-items:center;justify-content:center}
.trang-thai{display:flex;flex-wrap:wrap;gap:12px 28px;margin-top:20px;font-size:24px;align-items:center}
.trang-thai .muc{display:flex;align-items:center;gap:12px}
.y{display:flex;flex-direction:column;gap:18px;margin-top:10px}
.y .dong{display:flex;gap:20px;background:#1a1316;border-left:10px solid #ffd27a;padding:18px 24px}
.y .dau{flex:0 0 300px;font-weight:bold;color:#ffd27a;font-size:29px}
.y .noi{flex:1;font-size:28px}
"""


def trang_html(than, css_them='', cao_bdn=300):
    return ('<!doctype html><html lang="vi"><head><meta charset="utf-8"><style>%s%s</style></head><body><div class="trang">%s</div></body></html>'
            % (CSS.replace('VAR_CAO', str(cao_bdn)), css_them, than))


def chup(ten_html, ten_png, html):
    """Ghi trang HTML vào thư mục nguồn rồi chụp thành ảnh PNG rộng 1600."""
    from playwright.sync_api import sync_playwright
    duong_html = os.path.join(THU_MUC, ten_html)
    with open(duong_html, 'w', encoding='utf-8') as f:
        f.write(html)
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 1600, 'height': 900})
        pg.goto('file://' + duong_html)
        pg.screenshot(path=os.path.join(THU_MUC_ANH, ten_png), full_page=True)
        b.close()
    print('Đã vẽ', ten_png)
