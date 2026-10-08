# -*- coding: utf-8 -*-
"""Trang quy tắc cửa và bản đồ nhỏ, có hình minh họa. Chạy: python3 quy_tac.py"""
from thu_vien import *
from bo_cuc import A, B, A_BDN, B_BDN

SAN = '#2a2024'
TUONG = '#6b574d'
XANH = '#8fbf6a'
FONT = 'font-family="DejaVu Sans, sans-serif"'


def phong_mh(x, y, w, h, cua):
    """Một căn phòng nhìn từ trên xuống. cua = {'tren' | 'duoi' | 'trai' | 'phai': 'khoa' | 'mo'}."""
    o = ['<rect x="%d" y="%d" width="%d" height="%d" fill="%s" stroke="%s" stroke-width="12"/>' % (x, y, w, h, SAN, TUONG)]
    L, T = 60, 16
    for phia, kieu in cua.items():
        ngang = phia in ('tren', 'duoi')
        if ngang:
            cx, cy = x + w / 2, y if phia == 'tren' else y + h
            rx, ry, rw, rh = cx - L / 2, cy - T / 2, L, T
        else:
            cx, cy = x if phia == 'trai' else x + w, y + h / 2
            rx, ry, rw, rh = cx - T / 2, cy - L / 2, T, L
        if kieu == 'khoa':
            o.append('<rect x="%g" y="%g" width="%g" height="%g" fill="%s"/>' % (rx, ry, rw, rh, DO))
            for i in (1, 2, 3):
                if ngang:
                    o.append('<rect x="%g" y="%g" width="4" height="%g" fill="%s"/>' % (rx + i * L / 4 - 2, ry, rh, NEN))
                else:
                    o.append('<rect x="%g" y="%g" width="%g" height="4" fill="%s"/>' % (rx, ry + i * L / 4 - 2, rw, NEN))
        else:
            o.append('<rect x="%g" y="%g" width="%g" height="%g" fill="%s"/>' % (rx, ry, rw, rh, SAN))
            if ngang:
                for ex in (rx - 8, rx + rw):
                    o.append('<rect x="%g" y="%g" width="8" height="%g" fill="%s"/>' % (ex, ry - 2, rh + 4, VANG))
            else:
                for ey in (ry - 8, ry + rh):
                    o.append('<rect x="%g" y="%g" width="%g" height="8" fill="%s"/>' % (rx - 2, ey, rw + 4, VANG))
    return ''.join(o)


def chu(x, y, s, co=24, mau=KEM, neo='middle', dam=False):
    return '<text x="%g" y="%g" text-anchor="%s" font-size="%d" %s fill="%s" %s>%s</text>' % (x, y, neo, co, 'font-weight="bold"' if dam else '', mau, FONT, s)


def mui_ten(x, y, dai=70, mau=VANG):
    """Mũi tên khối chỉ sang phải, bắt đầu ở (x, y) là điểm giữa cạnh trái."""
    return ('<rect x="%g" y="%g" width="%g" height="14" fill="%s"/><polygon points="%g,%g %g,%g %g,%g" fill="%s"/>'
            % (x, y - 7, dai - 22, mau, x + dai - 24, y - 22, x + dai, y, x + dai - 24, y + 22, mau))


def svg(w, h, than):
    return '<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d">%s</svg>' % (w, h, w, h, than)


def hinh_1():
    o = [phong_mh(26, 30, 240, 210, {'tren': 'khoa', 'duoi': 'khoa', 'trai': 'khoa', 'phai': 'khoa'})]
    o.append(bieu_tuong('nguoi', 70, 130, 5, VANG))
    for (mx, my) in ((170, 70), (195, 150), (120, 60)):
        o.append(bieu_tuong('quai', mx, my, 4, '#c8553d'))
    o.append(mui_ten(295, 135))
    o.append(phong_mh(394, 30, 240, 210, {'tren': 'mo', 'duoi': 'mo', 'trai': 'mo', 'phai': 'mo'}))
    o.append(bieu_tuong('nguoi', 492, 108, 5, VANG))
    o.append(chu(146, 292, 'Còn quái: cửa khóa', dam=True, mau='#f08a7c'))
    o.append(chu(514, 292, 'Hết quái: cửa mở', dam=True, mau=VANG))
    return svg(660, 310, ''.join(o))


def hinh_2():
    o = ['<rect x="266" y="120" width="128" height="30" fill="%s"/>' % SAN,
         '<rect x="266" y="112" width="128" height="8" fill="%s"/><rect x="266" y="150" width="128" height="8" fill="%s"/>' % (TUONG, TUONG)]
    o.append(phong_mh(26, 30, 240, 210, {'phai': 'mo', 'tren': 'mo'}))
    o.append(phong_mh(394, 30, 240, 210, {'trai': 'mo', 'duoi': 'mo'}))
    o.append(bieu_tuong('dau_tich', 58, 62, 7, XANH))
    # con quái bị gạch chéo: không sinh quái mới
    o.append(bieu_tuong('quai', 160, 150, 5, '#6a4a44'))
    o.append('<line x1="150" y1="210" x2="215" y2="140" stroke="%s" stroke-width="9"/>' % DO)
    o.append(bieu_tuong('nguoi', 492, 108, 5, VANG))
    # mũi tên hai chiều phía trên lối đi
    o.append('<rect x="296" y="78" width="68" height="12" fill="%s"/>' % VANG)
    o.append('<polygon points="298,64 276,84 298,104" fill="%s"/><polygon points="362,64 384,84 362,104" fill="%s"/>' % (VANG, VANG))
    o.append(chu(146, 292, 'Đã dọn, hết quái', dam=True, mau=XANH))
    o.append(chu(514, 292, 'Đang ở đây', dam=True, mau=VANG))
    return svg(660, 310, ''.join(o))


def o_tt(kieu):
    mau = LOAI['danh_quai'][1]
    if kieu == 'dang':
        r = '<rect x="2" y="2" width="40" height="40" fill="none" stroke="%s" stroke-width="3"/><rect x="7.5" y="7.5" width="29" height="29" fill="%s" stroke="#fff" stroke-width="3"/>' % (VANG, mau)
    elif kieu == 'qua':
        r = '<rect x="6" y="6" width="32" height="32" fill="%s"/>' % tron(mau, NEN, 0.5)
    elif kieu == 'biet':
        r = '<rect x="7.5" y="7.5" width="29" height="29" fill="%s" stroke="%s" stroke-width="3"/>' % (NEN_KHUNG, mau)
    else:
        r = '<rect x="7.5" y="7.5" width="29" height="29" fill="none" stroke="#4a3a3a" stroke-width="3" stroke-dasharray="5 5"/>'
    return '<svg width="44" height="44" style="flex:0 0 44px">%s</svg>' % r


def hinh_3():
    bd = ban_do_nho(B, {'bd': 'qua', 'q1': 'qua', 'ta': 'dang', 'q2': 'biet', 'ru': 'biet', 'su': 'biet'}, s=76, g=26)
    ds = [('dang', 'Đang đứng: sáng, có viền'), ('qua', 'Đã qua: tô đặc, có biểu tượng'),
          ('biet', 'Phòng kề: chỉ có viền và biểu tượng'), ('an', 'Xa hơn: chưa hiện gì')]
    ben = ''.join('<div class="tt">%s<span>%s</span></div>' % (o_tt(k), t) for k, t in ds)
    return '<div class="hai"><div>%s</div><div class="ds-tt">%s</div></div>' % (bd, ben)


def man_hinh(mo=False):
    """Màn hình điện thoại cầm ngang, vẽ theo đúng chỗ các nút hiện nay của game."""
    W, H = 640, 360
    o = ['<rect x="5" y="5" width="630" height="350" fill="#1f1719" stroke="#4a3a38" stroke-width="10"/>',
         '<rect x="10" y="160" width="620" height="190" fill="%s"/>' % SAN,
         '<rect x="10" y="154" width="620" height="6" fill="#3b2c2b"/>']
    o.append(bieu_tuong('nguoi', 235, 205, 5, VANG))
    o.append(bieu_tuong('quai', 345, 190, 5, '#c8553d'))
    o.append(bieu_tuong('quai', 400, 262, 5, '#c8553d'))
    # máu, mana, bình máu, nút dừng
    o.append('<rect x="18" y="16" width="146" height="11" fill="#d8453a"/><rect x="18" y="30" width="110" height="7" fill="#3f8be0"/>')
    o.append('<rect x="18" y="44" width="62" height="24" fill="#5a221c" stroke="#e2b36a" stroke-width="2"/><rect x="86" y="44" width="38" height="24" fill="#28241f" stroke="#e2b36a" stroke-width="2"/>')
    # hai ô vũ khí
    o.append('<rect x="484" y="14" width="68" height="44" fill="#5a3c1e" stroke="%s" stroke-width="3"/><rect x="558" y="14" width="68" height="44" fill="#1e1a16" stroke="#6a5a4a" stroke-width="3"/>' % VANG)
    o.append(bieu_tuong('danh_quai', 507, 19, 3, '#e8dcc0') + bieu_tuong('danh_quai', 581, 19, 3, '#8a7c6c'))
    # cần điều khiển và các nút
    o.append('<circle cx="92" cy="280" r="46" fill="none" stroke="#6a5a4a" stroke-width="4"/><circle cx="92" cy="280" r="18" fill="#6a5a4a"/>')
    for (cx, cy, r) in ((566, 296, 34), (500, 322, 22), (506, 258, 22), (572, 222, 22)):
        o.append('<circle cx="%d" cy="%d" r="%d" fill="#2a2420" stroke="#8a7458" stroke-width="3"/>' % (cx, cy, r))
    # bản đồ nhỏ: ngay dưới hai ô vũ khí
    bd = ban_do_nho(A, A_BDN[1], s=22, g=8, pad=8)
    o.append('<g transform="translate(488,70)">%s</g>' % bd)
    if not mo:
        o.append('<rect x="481" y="63" width="142" height="112" fill="none" stroke="%s" stroke-width="4" stroke-dasharray="12 6"/>' % VANG)
        o.append(chu(470, 128, 'Bản đồ nhỏ ▶', co=25, mau=VANG, neo='end', dam=True))
    else:
        o.append('<rect x="10" y="10" width="620" height="340" fill="#000" opacity="0.66"/>')
        o.append('<rect x="160" y="34" width="320" height="292" fill="%s" stroke="%s" stroke-width="5"/>' % (NEN, VANG))
        o.append(chu(320, 76, 'Bản đồ ải', co=26, mau=VANG, dam=True))
        o.append('<g transform="translate(180,96)">%s</g>' % ban_do_nho(A, A_BDN[1], s=50, g=18, pad=14, khung=False))
        # dấu chạm ngón tay trên bản đồ nhỏ
        o.append('<g transform="translate(488,70)">%s</g>' % bd)
        o.append('<circle cx="552" cy="119" r="30" fill="none" stroke="%s" stroke-width="5"/><circle cx="552" cy="119" r="10" fill="%s"/>' % (VANG, VANG))
    return svg(W, H, ''.join(o))


def hinh_5():
    khoa = ban_do_nho(B, B_BDN[1], s=60, g=24)
    mo = ban_do_nho(B, {'bd': 'qua', 'q1': 'qua', 'ru': 'qua', 'ta': 'qua', 'q2': 'qua', 'su': 'dang', 'tr': 'biet', 'tt': 'biet'}, s=60, g=24, khoa=False)
    return ('<div class="hai sat"><div class="mot">%s<div class="chu-duoi" style="color:#f08a7c">Còn khóa: lối đỏ, có ổ khóa</div></div>'
            '<div style="padding-bottom:70px">%s</div>'
            '<div class="mot">%s<div class="chu-duoi" style="color:#ffd27a">Đã mở: lối chuyển vàng</div></div></div>') % (khoa, svg(60, 50, mui_ten(0, 25, 58)), mo)


CSS_THEM = """
.luoi{display:grid;grid-template-columns:1fr 1fr;gap:30px}
.the{background:#1a1316;border:4px solid #3b2c2b;padding:24px 24px 26px;display:flex;flex-direction:column}
.the .dau{display:flex;gap:16px;align-items:flex-start;min-height:96px}
.the .so{flex:0 0 56px;height:56px;background:#ffd27a;color:#120d10;font-weight:bold;font-size:36px;display:flex;align-items:center;justify-content:center}
.the h3{margin:0;font-size:33px;line-height:1.25;color:#ffd27a}
.the .hinh{height:380px;display:flex;align-items:center;justify-content:center;margin:14px 0 16px;background:#150f12;border:3px solid #2c2124}
.the p{margin:0;font-size:27px;line-height:1.4}
.hai{display:flex;gap:28px;align-items:center}
.hai.sat{gap:14px}
.ds-tt{display:flex;flex-direction:column;gap:20px;width:292px}
.tt{display:flex;gap:12px;align-items:center;font-size:24px;line-height:1.25}
.mot{text-align:center;width:268px}
.chu-duoi{font-size:23px;font-weight:bold;margin-top:10px;line-height:1.25;height:60px}
"""


def the(so, ten, hinh, loi):
    return '<div class="the"><div class="dau"><div class="so">%d</div><h3>%s</h3></div><div class="hinh">%s</div><p>%s</p></div>' % (so, ten, hinh, loi)


def ve():
    than = '<div class="nhan-kieu">QUY TẮC</div><h1>Cửa và bản đồ nhỏ</h1>'
    than += '<p class="phu-de">Sáu quy tắc dùng chung. Chọn kiểu xếp phòng nào cũng áp dụng được.</p><div class="vach"></div>'
    than += '<div class="luoi">'
    than += the(1, 'Còn quái thì cửa khóa, dọn xong thì cửa mở', hinh_1(),
                'Vào phòng có quái, mọi cửa đóng lại. Hạ hết quái thì các cửa của phòng mở ra cùng lúc. Phòng không có quái (rương, suối, thương nhân) thì cửa luôn mở.')
    than += the(2, 'Phòng đã dọn: đi lại tự do, không có quái mới', hinh_2(),
                'Phòng đã dọn xong thì ra vào thoải mái, không sinh thêm quái. Quay lại phòng cũ chỉ mất vài giây đi bộ.')
    than += the(3, 'Bản đồ nhỏ chỉ hiện phòng đã thấy', hinh_3(),
                'Chỉ phòng đã qua và phòng nằm kề phòng đã qua mới hiện biểu tượng loại phòng. Phòng xa hơn thì chưa hiện, đi tới đâu bản đồ mở tới đó.')
    than += the(4, 'Bản đồ nhỏ nằm ở góc trên bên phải', man_hinh(),
                'Ngay dưới hai ô vũ khí, thay cho hàng chấm phòng hiện nay. Chỗ này không che trận đấu và không vướng các nút bấm.')
    than += the(5, 'Cửa Trùm đang khóa: lối vào màu đỏ, có ổ khóa', hinh_5(),
                'Thấy phòng Trùm từ sớm nhưng lối vào màu đỏ, có hình ổ khóa. Đủ điều kiện thì ổ khóa biến mất, lối vào chuyển vàng và nháy sáng.')
    than += the(6, 'Chạm vào bản đồ nhỏ để xem cả ải', man_hinh(mo=True),
                'Chạm vào bản đồ nhỏ thì trò chơi tạm dừng và hiện bản đồ to. Chạm lần nữa để chơi tiếp.')
    than += '</div>'
    than += chu_giai()
    chup('quy-tac.html', 'quy-tac-cua-va-ban-do.png', trang_html(than, CSS_THEM))


if __name__ == '__main__':
    ve()
