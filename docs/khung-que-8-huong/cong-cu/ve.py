# -*- coding: utf-8 -*-
"""Tính khớp 2D cho từng khung/hướng và vẽ khung que (PIL)."""
import math
from PIL import Image, ImageDraw, ImageFont
import xuong as X
import dong_tac as DT

MAU = dict(
    nen=(0, 255, 0), dat=(0, 178, 0),
    tay_truoc=(255, 138, 0), tay_sau=(106, 44, 160),
    chan_truoc=(255, 210, 0), chan_sau=(31, 79, 160),
    than=(255, 255, 255), vien=(0, 0, 0), vk=(230, 0, 0), vk_can=(140, 0, 0), mat=(230, 0, 0), toc=(70, 70, 70),
)
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'

# đoạn xương: tên, khớp đầu, khớp cuối, nhóm màu
DOAN = [
    ('canh_tay_p', 'vai_p', 'khuyu_p', 'tay_truoc'), ('cang_tay_p', 'khuyu_p', 'co_tay_p', 'tay_truoc'),
    ('canh_tay_t', 'vai_t', 'khuyu_t', 'tay_sau'), ('cang_tay_t', 'khuyu_t', 'co_tay_t', 'tay_sau'),
    ('dui_p', 'hong_p', 'goi_p', 'chan_truoc'), ('cang_chan_p', 'goi_p', 'co_chan_p', 'chan_truoc'),
    ('ban_chan_p', 'co_chan_p', 'mui_chan_p', 'chan_truoc'),
    ('dui_t', 'hong_t', 'goi_t', 'chan_sau'), ('cang_chan_t', 'goi_t', 'co_chan_t', 'chan_sau'),
    ('ban_chan_t', 'co_chan_t', 'mui_chan_t', 'chan_sau'),
]
# ghi chú: màu cố định theo TAY/CHÂN (phải = cam/vàng, trái = tím/xanh đậm). Ở 3 hướng phải (SE/E/NE) bên phải
# luôn là bên GẦN camera nên cam/vàng = chi trước; ở S/N hai bên cách camera như nhau, thứ tự vẽ theo độ sâu thật.


def khung_2d(ma, i, huong):
    """Trả (khop2d: name->[x,y,sau], thu_tu: list doan theo thứ tự vẽ, P3d)."""
    d = next(x for x in DT.DS if x[0] == ma)
    poses = d[9]()
    vk = d[8]
    if vk and ma in DT.VK_KHUNG and i not in DT.VK_KHUNG[ma]:
        vk = None
    src = X.GUONG.get(huong, huong)
    P, R = X.dung_khung(poses[i], src, vk, ma in DT.CAN_GIUA)
    K = {}
    for k in X.KHOP:
        if k in P:
            sx, sy, dp = X.chieu(P[k])
            if huong in X.GUONG:
                sx = 96 - sx
            K[k] = [round(sx, 2), round(sy, 2), round(dp, 2)]
        else:
            K[k] = None
    # các điểm phụ để vẽ
    for k in ('got_p', 'got_t'):
        sx, sy, dp = X.chieu(P[k]); K[k] = [96 - sx if huong in X.GUONG else sx, sy, dp]
    # mắt: điểm trên mặt cầu đầu theo hướng mặt
    hm = P['_huong_mat']; Rh = P['_Rh']
    mats = []
    for lat in (-5.0, 5.0):
        q = P['dau'] + Rh @ X.np.array([X.DO['dau_r'] * 0.86, lat, -1.5])
        sx, sy, dp = X.chieu(q)
        if huong in X.GUONG:
            sx = 96 - sx
        dau_dp = -P['dau'][1]
        if dp > dau_dp + 2.0:  # chỉ hiện mắt quay về phía camera
            mats.append([round(sx, 2), round(sy, 2)])
    K['_mat'] = mats
    up = Rh @ X.np.array([0, 0, 1.0])
    tc = P['dau'] - hm * X.DO['dau_r'] * 0.55 + up * X.DO['dau_r'] * 0.35
    sx, sy, dp = X.chieu(tc)
    K['_toc'] = [96 - sx if huong in X.GUONG else sx, sy]
    K['_vk'] = vk
    # thân: tứ giác vai-hông
    items = []
    for ten, a, b, nhom in DOAN:
        items.append((ten, (K[a][2] + K[b][2]) / 2, nhom))
    than_dp = (K['vai_p'][2] + K['vai_t'][2] + K['hong_p'][2] + K['hong_t'][2]) / 4
    items.append(('than', than_dp, 'than'))
    items.append(('dau', K['dau'][2], 'than'))
    if K['vk_goc']:
        items.append(('vk', (K['vk_goc'][2] + K['vk_mui'][2]) / 2 + 0.6, 'vk'))
    # tay/chân phía phải được ưu tiên vẽ sau khi bằng độ sâu (cam/vàng nằm trên)
    def key(it):
        bonus = 0.05 if it[2] in ('tay_truoc', 'chan_truoc') else 0
        if it[0] == 'dau':
            bonus = -0.02
        return it[1] + bonus
    items.sort(key=key)
    thu_tu = [it[0] for it in items]
    return K, thu_tu, P


def truoc_sau(K, thu_tu):
    """Chi nào nằm TRƯỚC thân (vẽ sau thân) / SAU thân."""
    it = thu_tu.index('than')
    r = {}
    for ten in thu_tu:
        if ten in ('than', 'dau'):
            continue
        r[ten] = 'truoc' if thu_tu.index(ten) > it else 'sau'
    return r


def ve_khung(K, thu_tu, S=4, nhan=None, sao=False, mau_nen=True, im=None, ox=0, oy=0, ghi_so=True):
    if im is None:
        im = Image.new('RGB', (96 * S, 96 * S), MAU['nen'])
    dr = ImageDraw.Draw(im)
    f = lambda p: (ox + p[0] * S, oy + p[1] * S)
    # đường đất
    dr.line([f((4, 90)), f((92, 90))], fill=MAU['dat'], width=max(1, S // 2))
    W = 4.2 * S; V = 1.3 * S
    def doan(a, b, mau, w=W):
        A, B = f(K[a]), f(K[b])
        dr.line([A, B], fill=MAU['vien'], width=int(w + 2 * V))
        for P_ in (A, B):
            r = (w + 2 * V) / 2
            dr.ellipse([P_[0] - r, P_[1] - r, P_[0] + r, P_[1] + r], fill=MAU['vien'])
        dr.line([A, B], fill=mau, width=int(w))
        for P_ in (A, B):
            r = w / 2
            dr.ellipse([P_[0] - r, P_[1] - r, P_[0] + r, P_[1] + r], fill=mau)
    for ten in thu_tu:
        if ten == 'than':
            vm = [(K['vai_p'][0] + K['vai_t'][0]) / 2, (K['vai_p'][1] + K['vai_t'][1]) / 2]
            hm = [(K['hong_p'][0] + K['hong_t'][0]) / 2, (K['hong_p'][1] + K['hong_t'][1]) / 2]
            poly = [f(K['vai_p']), f(K['vai_t']), f(K['hong_t']), f(K['hong_p'])]
            Wt = 9 * S
            A, B = f(vm), f(hm)
            # viền đen: thân dày (con nhộng) + tứ giác vai-hông
            dr.line([A, B], fill=MAU['vien'], width=int(Wt + 2 * V))
            for P_ in (A, B):
                r = (Wt + 2 * V) / 2; dr.ellipse([P_[0] - r, P_[1] - r, P_[0] + r, P_[1] + r], fill=MAU['vien'])
            dr.polygon(poly, fill=MAU['vien'])
            dr.line(poly + [poly[0]], fill=MAU['vien'], width=int(2 * V + 2 * S))
            # ruột trắng
            dr.line([A, B], fill=MAU['than'], width=int(Wt))
            for P_ in (A, B):
                r = Wt / 2; dr.ellipse([P_[0] - r, P_[1] - r, P_[0] + r, P_[1] + r], fill=MAU['than'])
            dr.polygon(poly, fill=MAU['than'])
            dr.line(poly + [poly[0]], fill=MAU['than'], width=int(2 * S))
            # đai lưng: vạch đen ngang hông
            dr.line([f(K['hong_p']), f(K['hong_t'])], fill=MAU['vien'], width=int(1.2 * S))
        elif ten == 'dau':
            c = f(K['dau']); r = X.DO['dau_r'] * S
            dr.ellipse([c[0] - r, c[1] - r, c[0] + r, c[1] + r], fill=MAU['vien'])
            ri = r - V
            dr.ellipse([c[0] - ri, c[1] - ri, c[0] + ri, c[1] + ri], fill=MAU['than'])
            # tóc (xám đậm) = cho biết đầu quay về đâu: thấy mặt (S) tóc ở đỉnh, quay lưng (N) tóc phủ gần hết
            t = f(K['_toc']); rt = r * 0.98
            lop = Image.new('RGB', im.size, MAU['toc']); mk = Image.new('L', im.size, 0)
            ImageDraw.Draw(mk).ellipse([c[0] - ri, c[1] - ri, c[0] + ri, c[1] + ri], fill=255)
            mk2 = Image.new('L', im.size, 0); ImageDraw.Draw(mk2).ellipse([t[0] - rt, t[1] - rt, t[0] + rt, t[1] + rt], fill=255)
            from PIL import ImageChops
            im.paste(lop, (0, 0), ImageChops.multiply(mk, mk2))
            dr = ImageDraw.Draw(im)
            for m in K['_mat']:
                mm = f(m); rr = 1.9 * S
                dr.ellipse([mm[0] - rr, mm[1] - rr, mm[0] + rr, mm[1] + rr], fill=MAU['mat'], outline=MAU['vien'], width=max(1, S // 3))
        elif ten == 'vk' and K.get('_vk') == 'phitieu':
            B = f(K['vk_mui']); r = 3.2 * S; r2 = 1.1 * S
            pts = []
            for k in range(8):
                ang = math.radians(45 * k + 22.5); rr = r if k % 2 == 0 else r2
                pts.append((B[0] + rr * math.cos(ang), B[1] + rr * math.sin(ang)))
            dr.polygon(pts, fill=MAU['vk'], outline=MAU['vien'])
        elif ten == 'vk':
            A, B, H = f(K['vk_goc']), f(K['vk_mui']), f(K['co_tay_p'])
            dr.line([A, B], fill=MAU['vien'], width=int(3.4 * S))
            dr.line([A, H], fill=MAU['vk_can'], width=int(2 * S))
            dr.line([H, B], fill=MAU['vk'], width=int(2 * S))
            r = 1.6 * S
            dr.ellipse([B[0] - r, B[1] - r, B[0] + r, B[1] + r], fill=MAU['vk'], outline=MAU['vien'])
        else:
            d = next(x for x in DOAN if x[0] == ten)
            doan(d[1], d[2], MAU[d[3]])
            if ten.startswith('cang_tay'):
                h = f(K[d[2]]); r = 2.6 * S
                dr.ellipse([h[0] - r, h[1] - r, h[0] + r, h[1] + r], fill=MAU[d[3]], outline=MAU['vien'], width=int(V * 0.8))
    if ghi_so and nhan is not None:
        fn = ImageFont.truetype(FONT, int(7 * S))
        dr.text((ox + 3 * S, oy + 2 * S), str(nhan), fill=(0, 0, 0), font=fn)
        if sao:
            dr.text((ox + 16 * S, oy + 2 * S), '★', fill=(200, 0, 0), font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', int(9 * S)))
    return im
