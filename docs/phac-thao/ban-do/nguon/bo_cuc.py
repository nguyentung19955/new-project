# -*- coding: utf-8 -*-
"""Ba kiểu bố cục phòng của một ải và ba ảnh bố cục A, B, C.

Chạy: python3 bo_cuc.py [A] [B] [C]   (không ghi gì thì vẽ cả ba)
"""
import sys
from thu_vien import *

# ---------- Kiểu A: đường chính có nhánh phụ (lưới 4 x 3) ----------
A = BoCuc(
    phong={
        'bd': (0, 2, 'bat_dau'), 'q1': (0, 1, 'danh_quai'), 'q2': (1, 1, 'danh_quai'),
        'ta': (2, 1, 'tinh_anh'), 'su': (2, 0, 'suoi'), 'tr': (3, 0, 'trum'),
        'ru': (0, 0, 'ruong'), 'tn': (2, 2, 'thuong_nhan'),
    },
    cua=[('bd', 'q1', 'chinh'), ('q1', 'q2', 'chinh'), ('q2', 'ta', 'chinh'), ('ta', 'su', 'chinh'), ('su', 'tr', 'chinh'),
         ('q1', 'ru', 'phu'), ('ta', 'tn', 'phu')],
    so_cot=4, so_hang=3)
A_BDN = [
    {'bd': 'dang', 'q1': 'biet'},
    {'bd': 'qua', 'q1': 'qua', 'ru': 'qua', 'q2': 'qua', 'ta': 'dang', 'su': 'biet', 'tn': 'biet'},
    {k: 'qua' for k in A.phong} | {'tr': 'dang'},
]

# ---------- Kiểu B: mê cung nhỏ (lưới 3 x 3, 8 phòng) ----------
B = BoCuc(
    phong={
        'bd': (0, 2, 'bat_dau'), 'q1': (1, 2, 'danh_quai'), 'ru': (2, 2, 'ruong'),
        'q2': (0, 1, 'danh_quai'), 'ta': (1, 1, 'tinh_anh'), 'su': (2, 1, 'suoi'),
        'tt': (0, 0, 'thu_thach'), 'tr': (2, 0, 'trum'),
    },
    cua=[('bd', 'q1', 'thuong'), ('bd', 'q2', 'thuong'), ('q1', 'ta', 'thuong'), ('q2', 'ta', 'thuong'),
         ('q1', 'ru', 'thuong'), ('ru', 'su', 'thuong'), ('ta', 'su', 'thuong'), ('q2', 'tt', 'thuong'),
         ('su', 'tr', 'khoa')],
    so_cot=3, so_hang=3)
B_BDN = [
    {'bd': 'dang', 'q1': 'biet', 'q2': 'biet'},
    {'bd': 'qua', 'q1': 'qua', 'ru': 'qua', 'su': 'qua', 'ta': 'dang', 'q2': 'biet', 'tr': 'biet'},
    {k: 'qua' for k in B.phong} | {'tr': 'dang'},
]

# ---------- Kiểu C: sảnh trung tâm có ba cánh (lưới 5 x 4) ----------
C = BoCuc(
    phong={
        'bd': (2, 2, 'bat_dau'),
        'q1': (1, 2, 'danh_quai'), 'ru': (0, 2, 'ruong'),
        'q2': (3, 2, 'danh_quai'), 'tn': (4, 2, 'thuong_nhan'),
        'ta': (2, 3, 'tinh_anh'),
        'su': (2, 1, 'suoi'), 'tr': (2, 0, 'trum'),
    },
    cua=[('bd', 'q1', 'thuong'), ('q1', 'ru', 'thuong'), ('bd', 'q2', 'thuong'), ('q2', 'tn', 'thuong'),
         ('bd', 'ta', 'thuong'), ('bd', 'su', 'khoa'), ('su', 'tr', 'thuong')],
    so_cot=5, so_hang=4)
C_BDN = [
    {'bd': 'dang', 'q1': 'biet', 'q2': 'biet', 'ta': 'biet', 'su': 'biet'},
    {'bd': 'qua', 'q1': 'qua', 'ru': 'qua', 'q2': 'dang', 'tn': 'biet', 'ta': 'biet', 'su': 'biet'},
    {k: 'qua' for k in C.phong} | {'tr': 'dang'},
]

LUAT_B = 'Cửa Trùm nằm trong phòng Suối hồi và chỉ mở khi bạn đã dọn xong 3 phòng có quái (2 phòng Đánh quái và phòng Tinh anh).'
LUAT_C = 'Mỗi cánh có một phòng quái giữ một mảnh chìa; gom đủ 3 mảnh thì cửa phía trên sảnh mở, dẫn qua Suối hồi rồi tới Trùm.'


def ghi_chu(vt, S, cot, hang, chu, rong=1, lech=(0, 0)):
    x, y = vt(cot, hang)
    return '<div class="ghi" style="left:%dpx;top:%dpx;width:%dpx;height:%dpx">%s</div>' % (x + lech[0], y + lech[1], S * rong, S, chu)


def thanh(mau, kieu='lien'):
    if kieu == 'roi':
        return '<svg width="90" height="24">%s</svg>' % ''.join('<rect x="%d" y="3" width="18" height="18" fill="%s"/>' % (i * 36, mau) for i in range(3))
    return '<svg width="90" height="24"><rect x="0" y="0" width="90" height="24" fill="%s"/></svg>' % mau


def o_khoa():
    return '<svg width="48" height="48"><rect x="2.5" y="2.5" width="43" height="43" fill="%s" stroke="%s" stroke-width="5"/>%s</svg>' % (NEN, DO, bieu_tuong_giua('khoa', 24, 25.5, 3, DO))


def o_chia():
    return '<svg width="54" height="46"><rect x="2" y="2" width="50" height="42" fill="%s" stroke="%s" stroke-width="4"/>%s</svg>' % (NEN, VANG, bieu_tuong('chia', 5, 1, 4, VANG))


def o_so():
    return '<svg width="46" height="46"><rect x="0" y="0" width="46" height="46" fill="%s"/><text x="23" y="33" text-anchor="middle" font-size="28" font-weight="bold" fill="%s" font-family="DejaVu Sans">1</text></svg>' % (VANG, NEN)


def trang_thai_bdn():
    def o(kieu):
        mau = LOAI['danh_quai'][1]
        if kieu == 'dang':
            r = '<rect x="2" y="2" width="40" height="40" fill="none" stroke="%s" stroke-width="3"/><rect x="7.5" y="7.5" width="29" height="29" fill="%s" stroke="#fff" stroke-width="3"/>' % (VANG, mau)
        elif kieu == 'qua':
            r = '<rect x="6" y="6" width="32" height="32" fill="%s"/>' % tron(mau, NEN, 0.5)
        else:
            r = '<rect x="7.5" y="7.5" width="29" height="29" fill="%s" stroke="%s" stroke-width="3"/>' % (NEN_KHUNG, mau)
        return '<svg width="44" height="44">%s</svg>' % r
    return ('<div class="trang-thai">'
            '<div class="muc">%s<span>Phòng đang đứng: sáng, có viền</span></div>'
            '<div class="muc">%s<span>Phòng đã qua: tô đặc</span></div>'
            '<div class="muc">%s<span>Phòng kề đã biết: chỉ có viền</span></div>'
            '<div class="muc"><span>Phòng chưa biết: không hiện</span></div>'
            '</div>') % (o('dang'), o('qua'), o('biet'))


def hang_bdn(bc, ds, mo_ta, s, g):
    ten = ['1. Lúc mới vào', '2. Giữa chừng', '3. Lúc cuối']
    khoa = [True, True, False]
    o = []
    for i in range(3):
        o.append('<div class="bdn"><div class="ten">%s</div><div class="cho-ve">%s</div><div class="mo-ta">%s</div></div>'
                 % (ten[i], ban_do_nho(bc, ds[i], s=s, g=g, khoa=khoa[i]), mo_ta[i]))
    return '<div class="hang-bdn">%s</div>' % ''.join(o)


def ba_y(y):
    dau = ['Cảm giác khi chơi', 'Một ải dài cỡ nào', 'Hai luật cốt lõi']
    return '<div class="y">%s</div>' % ''.join('<div class="dong"><div class="dau">%s</div><div class="noi">%s</div></div>' % (dau[i], y[i]) for i in range(3))


def dau_trang(kieu, ten, phu_de):
    return '<div class="nhan-kieu">%s</div><h1>%s</h1><p class="phu-de">%s</p><div class="vach"></div>' % (kieu, ten, phu_de)


def ve_A():
    S = 220
    svg, W, H, vt = so_do_lon(A, S=S, G=70, thu_tu=['bd', 'q1', 'q2', 'ta', 'su', 'tr'])
    ghi = ''.join([
        ghi_chu(vt, S, 1, 0, '<span>◀ <b>Phòng phụ</b><br>bỏ qua được</span>'),
        ghi_chu(vt, S, 1, 2, '<span>◀ Vào ải<br>ở đây</span>'),
        ghi_chu(vt, S, 3, 2, '<span>◀ <b>Phòng phụ</b><br>bỏ qua được. Mỗi lần chơi đổi: Thương nhân, Thử thách hoặc Lời nguyền</span>'),
        ghi_chu(vt, S, 3, 1, '<span>Suối hồi luôn nằm <b>ngay trước Trùm</b></span>'),
    ])
    than = dau_trang('KIỂU A', 'Đường chính có nhánh phụ',
                     'Một lối chính ngoằn ngoèo 6 phòng dẫn tới Trùm, kèm 2 phòng phụ muốn ghé thì ghé. Tổng cộng 8 phòng.')
    than += '<div class="khung so-do" style="width:%dpx;height:%dpx">%s%s</div>' % (W + 8, H + 8, svg, ghi)
    than += ('<div class="cach-doc">'
             '<div class="muc">%s<span>Lối chính, phải đi</span></div>'
             '<div class="muc">%s<span>Lối rẽ vào phòng phụ, không bắt buộc</span></div>'
             '<div class="muc">%s<span>Thứ tự trên lối chính</span></div>'
             '</div>') % (thanh(VANG), thanh(KEM_MO, 'roi'), o_so())
    than += chu_giai()
    than += '<h2>Bản đồ nhỏ ở góc màn hình: người chơi sẽ thấy gì</h2>'
    than += hang_bdn(A, A_BDN, [
        'Chỉ thấy phòng đầu và viền của phòng kề.',
        'Đã ghé Rương báu, đang ở phòng Tinh anh. Thấy trước Suối hồi và lối rẽ sang Thương nhân.',
        'Đã qua hết, đang đứng trong phòng Trùm.',
    ], s=64, g=22)
    than += trang_thai_bdn()
    than += '<h2>Kiểu này chơi ra sao</h2>'
    than += ba_y([
        'Đi theo một lối chính nên không sợ lạc. Thỉnh thoảng thấy một cửa rẽ ngang và tự hỏi: ghé lấy thưởng hay đi tiếp?',
        'Đi thẳng lối chính khoảng 4 phút, ghé cả hai phòng phụ khoảng 6 phút. Gần như bằng ải hiện nay (4 đến 6 phút).',
        'Giữ trọn cả hai. Suối hồi nằm trên lối chính, ngay trước Trùm, nên ai cũng đi qua. Trùm luôn thấy đủ các trận trên lối chính để học, giống hiện nay.',
    ])
    chup('bo-cuc-A.html', 'bo-cuc-A-duong-chinh-co-nhanh.png', trang_html(than, cao_bdn=280))


def ve_B():
    S = 220
    svg, W, H, vt = so_do_lon(B, S=S, G=70)
    ghi = ghi_chu(vt, S, 1, 0, '<span>Ô trống.<br>Mỗi lần chơi trống một chỗ khác</span>')
    than = dau_trang('KIỂU B', 'Mê cung nhỏ',
                     'Một cụm 8 phòng xếp sát nhau trong ô 3 x 3, có đường vòng. Vào ở một góc, Trùm ở góc xa, đi lối nào tùy bạn.')
    ben = ('<div style="flex:1;display:flex;flex-direction:column;gap:22px">'
           '<div class="luat" style="margin-top:0"><b>Luật mở cửa Trùm (đề xuất)</b><br>%s</div>'
           '<div class="cach-doc" style="flex-direction:column;align-items:flex-start;margin-top:0;gap:18px">'
           '<div class="muc">%s<span>Cửa thường: dọn xong phòng là mở</span></div>'
           '<div class="muc">%s<span>Cửa Trùm đang khóa</span></div>'
           '</div>'
           '<div style="font-size:27px;color:#e3d7bf">Có 2 đường vòng: từ phòng Bắt đầu đi lối trên hay lối dưới đều tới được Tinh anh và Suối hồi.</div>'
           '<div style="font-size:27px;color:#e3d7bf">Phòng Thử thách và Rương báu không bắt buộc.</div>'
           '</div>') % (LUAT_B, thanh(KEM_MO), o_khoa())
    than += '<div style="display:flex;gap:36px;align-items:flex-start"><div class="khung so-do" style="margin:0;flex:0 0 %dpx;width:%dpx;height:%dpx">%s%s</div>%s</div>' % (W + 8, W + 8, H + 8, svg, ghi, ben)
    than += chu_giai()
    than += '<h2>Bản đồ nhỏ ở góc màn hình: người chơi sẽ thấy gì</h2>'
    than += hang_bdn(B, B_BDN, [
        'Chỉ thấy phòng đầu và viền của hai phòng kề: có hai lối để chọn.',
        'Đã qua Suối hồi nên thấy phòng Trùm, nhưng cửa còn khóa đỏ vì chưa dọn đủ phòng có quái.',
        'Đã qua hết, cửa Trùm đã mở, đang đứng trong phòng Trùm.',
    ], s=72, g=26)
    than += trang_thai_bdn()
    than += '<h2>Kiểu này chơi ra sao</h2>'
    than += ba_y([
        'Tự do nhất: ngã nào cũng có hai lối, tự quyết dọn phòng nào trước. Đổi lại dễ đi lòng vòng và phải nhìn bản đồ nhiều trên màn hình nhỏ.',
        'Khoảng 5 đến 7 phút, dài hơn hiện nay chừng 1 phút vì hay phải quay lại phòng cũ để tìm lối.',
        'Phải nhờ luật khóa cửa mới giữ được. Trùm vẫn thấy đủ 3 phòng có quái. Nhưng người chơi có thể ghé Suối hồi quá sớm, đánh tiếp rồi mới quay lại: lúc đó điều suối báo về Trùm đã cũ.',
    ])
    chup('bo-cuc-B.html', 'bo-cuc-B-me-cung-nho.png', trang_html(than, cao_bdn=320))


def ve_C():
    S = 204
    svg, W, H, vt = so_do_lon(C, S=S, G=64, chia=['q1', 'q2', 'ta'], nhan_rieng={'bd': 'Bắt đầu'}, co_chu=23)
    ghi = ''.join([
        ghi_chu(vt, S, 3, 1, '<span>◀ Cửa này <b>khóa</b> cho tới khi gom đủ 3 mảnh chìa</span>', lech=(0, 40)),
        ghi_chu(vt, S, 0, 1, '<span><b>Cánh trái</b><br>cuối cánh là Rương báu ▼</span>', lech=(0, 30)),
        ghi_chu(vt, S, 4, 1, '<span><b>Cánh phải</b><br>cuối cánh là Thương nhân ▼</span>', lech=(0, 30)),
        ghi_chu(vt, S, 3, 3, '<span>◀ <b>Cánh dưới</b><br>ngắn nhưng khó: quái Tinh anh</span>'),
        ghi_chu(vt, S, 1, 3, '<span>Sảnh giữa cũng là nơi vào ải ▲</span>', lech=(30, -20)),
        ghi_chu(vt, S, 3, 0, '<span>◀ Suối hồi rồi mới tới Trùm</span>', lech=(0, 30)),
    ])
    than = dau_trang('KIỂU C', 'Sảnh trung tâm có các cánh',
                     'Một sảnh ở giữa, ba cánh tỏa ra ba phía. Xong ba cánh thì cửa thứ tư mở, dẫn tới Suối hồi và Trùm. Tổng cộng 8 phòng.')
    than += '<div class="khung so-do" style="width:%dpx;height:%dpx">%s%s</div>' % (W + 8, H + 8, svg, ghi)
    than += '<div class="luat"><b>Luật mở cửa Trùm (đề xuất):</b> %s</div>' % LUAT_C
    than += ('<div class="cach-doc">'
             '<div class="muc">%s<span>Phòng giữ một mảnh chìa: hạ hết quái là nhận</span></div>'
             '<div class="muc">%s<span>Cửa đang khóa</span></div>'
             '<div class="muc">%s<span>Cửa thường: dọn xong phòng là mở</span></div>'
             '</div>') % (o_chia(), o_khoa(), thanh(KEM_MO))
    than += chu_giai()
    than += '<h2>Bản đồ nhỏ ở góc màn hình: người chơi sẽ thấy gì</h2>'
    than += hang_bdn(C, C_BDN, [
        'Từ sảnh thấy ngay bốn phía: ba cánh và cửa khóa đỏ ở phía trên.',
        'Xong cánh trái, đang đánh ở cánh phải. Cửa phía trên vẫn khóa.',
        'Đã xong ba cánh, cửa mở, qua Suối hồi và đang đứng trong phòng Trùm.',
    ], s=56, g=20)
    than += trang_thai_bdn()
    than += '<h2>Kiểu này chơi ra sao</h2>'
    than += ba_y([
        'Có một "nhà" ở giữa để quay về và luôn biết mình còn thiếu gì. Mỗi cánh là một chuyến đi ngắn. Đổi lại phải đi ngược qua phòng cũ nhiều lần.',
        'Khoảng 5 đến 7 phút: mỗi cánh phải đi ra rồi quay về sảnh, tốn thêm chừng 1 phút đi bộ so với hiện nay.',
        'Giữ trọn cả hai. Suối hồi đứng chắn giữa sảnh và Trùm nên ai cũng đi qua, đúng lúc cuối. Trùm thấy đủ cả ba cánh vì phải xong hết mới mở cửa.',
    ])
    chup('bo-cuc-C.html', 'bo-cuc-C-sanh-trung-tam.png', trang_html(than, cao_bdn=330))


if __name__ == '__main__':
    chon = [a.upper() for a in sys.argv[1:]] or ['A', 'B', 'C']
    for k in chon:
        {'A': ve_A, 'B': ve_B, 'C': ve_C}[k]()
