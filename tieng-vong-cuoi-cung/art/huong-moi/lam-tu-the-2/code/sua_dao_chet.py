#!/usr/bin/env python3
"""Sửa ảnh chết 6 ô (thu8-chet-6o.png): máy gen vẽ lưỡi thành DAO THƯỜNG một lưỡi → thay bằng ẢNH ÂM ĐAO (game/thu-p0a/am-dao/am-dao-cap1.png).

    python3 sua_dao_chet.py      → art/huong-moi/nguon/lam-tu-the/thu8-chet-6o-am-dao.png (ảnh nguồn đã sửa, nền trắng – dung_thu3.py chet đọc file này)
                                   kiem/chet-sua-dao.png (trên: gốc · dưới: đã sửa; đỏ = vùng xoá, xanh = vùng giữ găng)
Cách làm (mỗi ô, toạ độ px ảnh gốc, đo tay trên ảnh gốc 1:1):
  1. XOÁ dao gen bằng mặt nạ: dải bao quanh đoạn chuôi → mũi (nửa rộng lưỡi), đĩa ở chắn tay; chỉ xoá điểm GIỐNG DAO (không phải vải áo xanh than)
     và KHÔNG xoá trong đĩa găng (găng giữ nguyên, vẽ đè lại sau).
  2. Lỗ do xoá nằm TRONG thân (lưỡi vắt qua áo) → vá màu áo (cv2.inpaint) ; ngoài thân → trắng.
  3. Dán Âm Đao: chắn tay Âm Đao đặt đúng chắn tay dao cũ, hướng theo đường chắn → mũi cũ,  (Âm Đao hai nhánh,
     MỘT cỡ cho cả 6 ô (TY_LE) để dao không co giãn giữa các hình).
  4. Vẽ găng (điểm gốc trong đĩa găng, màu nâu găng) đè lên chuôi → tay vẫn cầm dao.
"""
import os
import numpy as np, cv2
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
GOC = os.path.normpath(os.path.join(HERE, '..'))
NGUON = os.path.normpath(os.path.join(GOC, '..', 'nguon', 'lam-tu-the', 'thu8-chet-6o.png'))
RA = os.path.normpath(os.path.join(GOC, '..', 'nguon', 'lam-tu-the', 'thu8-chet-6o-am-dao.png'))
DAO = os.path.normpath(os.path.join(GOC, '..', '..', '..', 'game', 'thu-p0a', 'am-dao', 'am-dao-cap1.png'))
KIEM = os.path.join(GOC, 'kiem', 'chet-sua-dao.png')
# Âm Đao (483×158): tâm chắn tay (172, 77), mũi x 483 trên trục y 77
DAO_CHAN, DAO_MUI = (172.0, 77.0), 483.0

# mỗi ô: chuôi (đầu núm), chắn tay, mũi – của dao gen; găng = (tâm, bán kính) phần tay giữ nguyên vẽ đè
O = [
    dict(num=(170, 512), chan=(208, 528), mui=(354, 590), gang=((184, 512), 24)),   # D1 mất lực – dao chúc xuống trước
    dict(num=(540, 588), chan=(577, 605), mui=(722, 648), gang=((553, 593), 22)),   # D2 quỳ
    dict(num=(868, 642), chan=(928, 640), mui=(1056, 642), gang=((915, 618), 19), nam=True),  # D3 gục – dao nằm đất, tay đặt trên chuôi
    dict(num=(1218, 642), chan=(1278, 640), mui=(1433, 646), gang=((1265, 618), 19), nam=True),  # D4 áo tan
    dict(num=(1598, 642), chan=(1662, 640), mui=(1806, 646), gang=((1640, 618), 19), nam=True),  # D5 áo rỗng
    dict(num=(1902, 640), chan=(1964, 640), mui=(2126, 646), gang=None, nam=True),             # D6 vụn – chỉ còn dao
]
DAT = 650   # đường đất của ảnh gen (đáy ủng D1 648, gấu áo D5 655 → 650)
NUA_LUOI, R_CHAN, TY_LE, DAY = 13, 21, 0.46, 1.0   # TY_LE: MỘT cỡ Âm Đao cho cả 6 ô (cùng thang người)


_da = np.asarray(Image.open(DAO).convert('RGBA'))[..., 3] > 128
_yy, _xx = np.nonzero(_da); DAO_DIEM = np.stack([_xx, _yy], 1).astype(float)
_gb = DAO_DIEM[np.argmax(np.where(DAO_DIEM[:, 0] < 230, DAO_DIEM[:, 1], -1))]          # đáy chắn tay
_ph = DAO_DIEM[DAO_DIEM[:, 0] > 300]; _sl = (_ph[:, 1] - _gb[1]) / (_ph[:, 0] - _gb[0])
GOC_NAM = float(-np.arctan(_sl.max()))   # xoay để đường tựa (đáy chắn → mép dưới lưỡi phía mũi) nằm ngang


def doan(H, W, p, q, r):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32); p = np.array(p, np.float32); q = np.array(q, np.float32)
    d = q - p; t = np.clip(((xx - p[0]) * d[0] + (yy - p[1]) * d[1]) / (d @ d), 0, 1)
    return (xx - p[0] - t * d[0]) ** 2 + (yy - p[1] - t * d[1]) ** 2 <= r * r


def dia(H, W, c, r):
    yy, xx = np.mgrid[0:H, 0:W]; return (xx - c[0]) ** 2 + (yy - c[1]) ** 2 <= r * r


def main():
    im = np.asarray(Image.open(NGUON).convert('RGB')).copy(); H, W = im.shape[:2]
    dao = np.asarray(Image.open(DAO).convert('RGBA')).astype(np.float32) / 255
    f = im.astype(int); mx, mn = f.max(-1), f.min(-1)
    trang = (mn > 228) & (mx - mn < 22)
    vai = (f[..., 2] > f[..., 0] + 6) & (mx < 150)          # vải áo xanh than / tối – không phải dao
    nau = (f[..., 0] > f[..., 2] + 8) & (mx < 170)           # nâu găng
    out = im.astype(np.float32); xoa_all = np.zeros((H, W), bool); giu_all = np.zeros((H, W), bool); ghi = []
    for i, o in enumerate(O):
        mu = np.array(o['mui'], float); mu_x = mu + 10 * (mu - o['chan']) / np.hypot(*(mu - o['chan']))   # quá mũi 10 px: xoá sạch đầu mũi
        band = doan(H, W, o['num'], mu_x, NUA_LUOI) | dia(H, W, o['chan'], R_CHAN)
        giu = np.zeros((H, W), bool)
        if o['gang']: giu = dia(H, W, *o['gang']) & nau & ~trang & ~doan(H, W, o['num'], o['mui'], 9) & ~dia(H, W, o['chan'], R_CHAN)   # không lấy chuôi / chắn cũ
        xoa = band & ~trang & ~vai & ~giu
        xoa = ndi.binary_dilation(xoa, iterations=2) & band & ~giu & ~vai | xoa
        # vá: chỗ xoá nằm trong thân (thân = điểm không trắng còn lại, đóng 9 px)
        than = ~trang & ~xoa
        dong = ndi.binary_closing(than, iterations=9) & ~ndi.binary_dilation(trang & ~band, iterations=0)
        if o.get('nam'):   # dao nằm đất trước gấu áo: chỗ xoá TRÊN đất nằm giữa hai mép áo cùng hàng → là gấu áo bị dao che → vá
            yy, xx = np.mgrid[0:H, 0:W]; ao = ~trang & ~band; nhip = np.zeros((H, W), bool)
            x0c, x1c = int(min(o['num'][0], o['chan'][0]) - 40), int(o['mui'][0] + 20)
            ytren = int(min(o['num'][1], o['chan'][1], o['mui'][1])) - NUA_LUOI - 4   # hàng ngay trên dao: mép phải của áo
            xs = np.nonzero(ao[ytren - 3: ytren + 1, x0c:x1c].any(0))[0]
            if len(xs):
                xr = x0c + xs.max()
                for y in range(ytren, DAT):   # gấu áo bị dao che: từ mép trái áo hàng đó tới mép phải áo ngay trên dao
                    xl = np.nonzero(ao[y, x0c:xr])[0]
                    x_l = x0c + xl.min() if len(xl) else x0c + xs.min()
                    nhip[y, x_l: xr + 1] = True
            dong = dong | nhip
        va = xoa & dong
        nen = xoa & ~dong
        out[nen] = 255
        if va.any():
            u8 = out.clip(0, 255).astype(np.uint8)
            out = cv2.inpaint(u8, va.astype(np.uint8), 5, cv2.INPAINT_TELEA).astype(np.float32)
        # dán Âm Đao: affine chắn tay → chắn tay cũ, trục → hướng mũi cũ
        c = np.array(o['chan'], float); m = np.array(o['mui'], float); d = m - c; u = d / np.hypot(*d); n = np.array([-u[1], u[0]])
        s = TY_LE
        if o.get('nam'):   # dao NẰM đất: tựa trên mép dưới chắn tay + mép dưới mũi (đường tựa), đáy chạm DAT – không lún dưới đất (neo 'day' của sheet)
            phi = GOC_NAM; u = np.array([np.cos(phi), np.sin(phi)]); n = np.array([-u[1], u[0]])
            A0 = np.array([[u[0] * s, n[0] * s * DAY], [u[1] * s, n[1] * s * DAY]])
            yb = max((A0 @ (q - np.array(DAO_CHAN)))[1] for q in DAO_DIEM)
            c = np.array([c[0], DAT - yb])
        A = np.array([[u[0] * s, n[0] * s * DAY], [u[1] * s, n[1] * s * DAY]]); t = c - A @ np.array(DAO_CHAN)
        M = np.hstack([A, t[:, None]]).astype(np.float32)
        pm = dao.copy(); pm[..., :3] *= pm[..., 3:4]
        w = cv2.warpAffine(pm, M, (W, H), flags=cv2.INTER_AREA if s < 1 else cv2.INTER_LINEAR, borderValue=0)
        a = w[..., 3:4]; out = out * (1 - a) + w[..., :3] * 255
        # găng đè lại lên chuôi
        if giu.any(): out[giu] = im[giu]
        xoa_all |= xoa; giu_all |= giu
        ghi.append({'o': i + 1, 'ty_le_dao': s, 'dai_dao_cu_chan_mui': round(float(np.hypot(*d)), 1), 'dai_am_dao_chan_mui': round((DAO_MUI - DAO_CHAN[0]) * s, 1), 'goc_do': round(float(np.degrees(np.arctan2(u[1], u[0]))), 1), 'xoa_px': int(xoa.sum()), 'va_px': int(va.sum())})
    o8 = out.clip(0, 255).round().astype(np.uint8)
    Image.fromarray(o8).save(RA, optimize=True)
    # ảnh kiểm
    g = im.copy(); g[xoa_all] = (g[xoa_all] * 0.4 + np.array([230, 40, 40]) * 0.6).astype(np.uint8); g[giu_all] = (g[giu_all] * 0.5 + np.array([40, 160, 230]) * 0.5).astype(np.uint8)
    top = Image.fromarray(g).crop((0, 120, W, H)); bot = Image.fromarray(o8).crop((0, 120, W, H))
    k = Image.new('RGB', (W, top.height * 2 + 10), (40, 44, 52)); k.paste(top, (0, 0)); k.paste(bot, (0, top.height + 10))
    k = k.resize((W // 2, k.height // 2), Image.LANCZOS); k.save(KIEM)
    for r in ghi: print(r)
    print('->', RA, KIEM)


if __name__ == '__main__':
    main()
