# -*- coding: utf-8 -*-
"""Ảnh so sánh ba kiểu bố cục đặt cạnh nhau. Chạy: python3 so_sanh.py"""
from thu_vien import *
from bo_cuc import A, B, C, thanh, o_khoa


def so_do_vua(bc, s=68, g=20, pad=8):
    """Sơ đồ cỡ vừa, không có nhãn chữ trong phòng."""
    W = bc.so_cot * s + (bc.so_cot - 1) * g + 2 * pad
    H = bc.so_hang * s + (bc.so_hang - 1) * g + 2 * pad
    vt = lambda c, r: (pad + c * (s + g), pad + r * (s + g))
    o = ['<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d">' % (W, H, W, H)]
    t = 12
    khoa = []
    for a, b, kieu in bc.cua:
        ca, ra, _ = bc.phong[a]
        cb, rb, _ = bc.phong[b]
        xa, ya = vt(ca, ra)
        xb, yb = vt(cb, rb)
        mau = {'chinh': VANG, 'phu': KEM_MO, 'thuong': KEM_MO, 'khoa': DO}[kieu]
        ngang = ra == rb
        if ngang:
            x0, y0, w, h = min(xa, xb) + s, ya + s / 2 - t / 2, g, t
        else:
            x0, y0, w, h = xa + s / 2 - t / 2, min(ya, yb) + s, t, g
        if kieu == 'phu':
            if ngang:
                o.append('<rect x="%g" y="%g" width="8" height="%g" fill="%s"/>' % (x0 + 6, y0, h, mau))
            else:
                o.append('<rect x="%g" y="%g" width="%g" height="8" fill="%s"/>' % (x0, y0 + 6, w, mau))
        else:
            o.append('<rect x="%g" y="%g" width="%g" height="%g" fill="%s"/>' % (x0, y0, w, h, mau))
        if kieu == 'khoa':
            mx, my = x0 + w / 2, y0 + h / 2
            khoa.append('<rect x="%g" y="%g" width="30" height="30" fill="%s" stroke="%s" stroke-width="3"/>' % (mx - 15, my - 15, NEN, DO))
            khoa.append(bieu_tuong_giua('khoa', mx, my + 1, 2, DO))
    for ma, (c, r, loai) in bc.phong.items():
        x, y = vt(c, r)
        mau = LOAI[loai][1]
        o.append('<rect x="%g" y="%g" width="%g" height="%g" fill="%s" stroke="%s" stroke-width="5"/>' % (x + 2.5, y + 2.5, s - 5, s - 5, tron(mau, NEN, 0.2), mau))
        o.append(bieu_tuong_giua(loai, x + s / 2, y + s / 2, 4, mau))
    o.extend(khoa)
    o.append('</svg>')
    return ''.join(o)


CSS_THEM = """
.ba-cot{display:flex;gap:26px;align-items:stretch}
.cot{flex:1;background:#1a1316;border:4px solid #3b2c2b;padding:22px 20px 24px;display:flex;flex-direction:column}
.cot.chon{border-color:#ffd27a;background:#211812}
.cot .hang-nhan{display:flex;align-items:center;gap:12px;min-height:50px}
.cot .nhan-kieu{font-size:26px;padding:5px 14px}
.cot .khuyen{font-size:23px;font-weight:bold;color:#ffd27a;border:3px solid #ffd27a;padding:4px 10px}
.cot h3{font-size:34px;line-height:1.2;color:#ffd27a;margin:14px 0 0;min-height:82px}
.cot .ve{height:356px;display:flex;align-items:center;justify-content:center;margin:8px 0 10px}
.cot .tom{font-size:27px;line-height:1.34;min-height:150px}
.cot .dong{border-top:3px solid #3b2c2b;padding:12px 0 10px}
.cot .dong .ten{font-size:23px;color:#ffd27a;font-weight:bold}
.cot .dong .gt{font-size:27px;line-height:1.3}
.khuyen-chon{margin-top:30px;border:5px solid #ffd27a;background:#241a14;padding:24px 30px;font-size:31px;line-height:1.4}
.khuyen-chon b{color:#ffd27a}
"""


def cot(kieu, ten, bc, tom, dong, chon=False):
    ten_dong = ['Một ải dài', 'Qua Suối hồi trước Trùm', 'Tự chọn đường đi', 'Phải đi lại phòng cũ']
    h = '<div class="cot%s">' % (' chon' if chon else '')
    h += '<div class="hang-nhan"><div class="nhan-kieu">%s</div>%s</div>' % (kieu, '<div class="khuyen">Khuyên chọn</div>' if chon else '')
    h += '<h3>%s</h3><div class="ve">%s</div><div class="tom">%s</div>' % (ten, so_do_vua(bc), tom)
    for i in range(4):
        h += '<div class="dong"><div class="ten">%s</div><div class="gt">%s</div></div>' % (ten_dong[i], dong[i])
    return h + '</div>'


def ve():
    than = '<div class="nhan-kieu">SO SÁNH</div><h1>Ba kiểu xếp phòng cho một ải</h1>'
    than += '<p class="phu-de">Cả ba đều là 8 phòng vuông trên lưới, cửa ở tối đa bốn phía, bản đồ mở dần khi đi.</p><div class="vach"></div>'
    than += '<div class="ba-cot">'
    than += cot('KIỂU A', 'Đường chính có nhánh phụ', A,
                'Một lối chính dễ theo, thêm vài phòng phụ muốn ghé thì ghé.',
                ['4 đến 6 phút, như hiện nay', 'Luôn luôn', 'Ít: ghé hay bỏ phòng phụ', 'Hầu như không'], chon=True)
    than += cot('KIỂU B', 'Mê cung nhỏ', B,
                'Nhiều lối, tự chọn dọn phòng nào trước. Cần luật khóa cửa Trùm.',
                ['5 đến 7 phút', 'Có, nhưng có thể ghé quá sớm', 'Nhiều nhất', 'Vừa phải, dễ đi lòng vòng'])
    than += cot('KIỂU C', 'Sảnh trung tâm có các cánh', C,
                'Sảnh ở giữa, đi ba cánh gom đủ chìa rồi mới tới Suối hồi và Trùm.',
                ['5 đến 7 phút', 'Luôn luôn', 'Vừa: chọn đi cánh nào trước', 'Nhiều: cánh nào cũng phải quay về sảnh'])
    than += '</div>'
    than += ('<div class="cach-doc">'
             '<div class="muc">%s<span>Lối chính</span></div>'
             '<div class="muc">%s<span>Lối rẽ vào phòng phụ</span></div>'
             '<div class="muc">%s<span>Cửa thường</span></div>'
             '<div class="muc">%s<span>Cửa Trùm có khóa</span></div>'
             '</div>') % (thanh(VANG), thanh(KEM_MO, 'roi'), thanh(KEM_MO), o_khoa())
    than += chu_giai()
    than += ('<div class="khuyen-chon"><b>Khuyên chọn Kiểu A.</b> Ải vẫn gọn trong 4 đến 6 phút, hợp chơi nhanh trên điện thoại; '
             'Suối hồi luôn nằm ngay trước Trùm mà không cần thêm luật nào; vẫn có cảm giác đi bốn hướng và bản đồ mở dần.</div>')
    chup('so-sanh.html', 'so-sanh-bo-cuc.png', trang_html(than, CSS_THEM))


if __name__ == '__main__':
    ve()
