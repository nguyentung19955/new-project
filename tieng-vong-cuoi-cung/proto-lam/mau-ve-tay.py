#!/usr/bin/env python3
"""PHẦN C – 1 khung MẪU minh hoạ hướng "sprite từ mẫu gốc, dọn tay từng pixel" (tư thế đứng, vì mẫu gốc là tư thế đứng).
Cách làm (ghi thật): (1) mẫu gốc nguyen-con-v2-mat-sang.png thu về cao 46 px trong ô 64 bằng đa số màu + khoá 12 màu (out/danh-gia/goc-64.png),
(2) dọn bằng 3 quy tắc pixel-art (bỏ đốm đen lẻ trong lòng, bỏ mấu 1 px ở silhouette, viền ngoài đen liền 1 px),
(3) SỬA TAY bằng danh sách pixel ghi rõ toạ độ (khoen + dây chuông, vành chuông, mắt, trâm, vạch ủng, chắn kiếm) – không vẽ gì ngoài mẫu.
Xuất: out/danh-gia/mau-ve-tay-dung.png (64×64), mau-ve-tay-so-sanh-x8.png (gốc thu 64 | sau dọn | pipeline 3D idle F0 | run F0 mới)
Đây là minh hoạ quy trình, KHÔNG phải khung Run – khung Run vẽ tay cần hoạ sĩ/ChatGPT vẽ tư thế chân mới.
"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
DG = os.path.join(HERE, 'out', 'danh-gia'); RAW = os.path.join(DG, 'raw')
PAL = ['#0C0F14', '#1A212B', '#212835', '#2C3546', '#4A5A6E', '#21413A', '#32804F', '#83CC93', '#9C6B30', '#E1B85A', '#F3E6C8', '#CEF0D6']
RGB = {h: (int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16), 255) for h in PAL}
VIEN, AO0, AO1, AO2, XAM, X0, X1, X2, V0, V1, V2, SANG = [RGB[h] for h in PAL]
NEN = (42, 36, 51, 255)
N4 = ((0, 1), (0, -1), (1, 0), (-1, 0))


def op(a, y, x): return 0 <= y < 64 and 0 <= x < 64 and a[y, x, 3] > 0


def don(a, so):
    a = a.copy()
    # 1) đốm đen lẻ trong lòng: pixel #0C0F14 có ≥ 3 lân cận 4 là màu khác đen (không trong suốt) → lấy màu lân cận đa số (2 lượt)
    for _ in range(2):
        b = a.copy(); n = 0
        for y in range(64):
            for x in range(64):
                if a[y, x, 3] == 0 or tuple(a[y, x]) != VIEN: continue
                lk = [tuple(a[y + dy, x + dx]) for dy, dx in N4 if op(a, y + dy, x + dx) and tuple(a[y + dy, x + dx]) != VIEN]
                if len(lk) >= 3:
                    b[y, x] = max(set(lk), key=lk.count); n += 1
        a = b; so['domDenBo'] = so.get('domDenBo', 0) + n
    # 2) mấu 1 px ở silhouette: pixel có ≤ 1 lân cận 4 không trong suốt → bỏ
    b = a.copy(); n = 0
    for y in range(64):
        for x in range(64):
            if a[y, x, 3] and sum(op(a, y + dy, x + dx) for dy, dx in N4) <= 1: b[y, x] = 0; n += 1
    a = b; so['mauBo'] = n
    # 3) viền ngoài: pixel không trong suốt kề nền → #0C0F14 (viền 1 px liền như mẫu)
    b = a.copy(); n = 0
    for y in range(64):
        for x in range(64):
            if a[y, x, 3] and any(not op(a, y + dy, x + dx) for dy, dx in N4) and tuple(a[y, x]) != VIEN: b[y, x] = VIEN; n += 1
    so['vienNgoaiDoi'] = n
    return b


# Danh sách pixel SỬA TAY (y, x, màu) – đo trên lưới goc-64 (×16) so với mẫu gốc; chỉ chi tiết mẫu có mà bản thu nhỏ làm mất/mờ
SUA = []
def dat(y, x, c): SUA.append((y, x, c))
# khoen treo chuông (mẫu: vòng tròn vàng ở mép mũ, trên chuông) + dây ngắn
for y, x in ((30, 20), (30, 21), (31, 19), (31, 22), (32, 20), (32, 21)): dat(y, x, V1)
dat(31, 20, VIEN); dat(31, 21, VIEN)        # lỗ khoen
# chuông: thân vàng 7×6 (hàng 33–38, cột 17–23), vành dưới sẫm, chỏm sáng, quả lắc trắng ở đáy – theo mẫu
for y in range(33, 39):
    for x in range(17, 24): dat(y, x, V1)
for x in range(18, 23): dat(33, x, V2)                   # chỏm sáng
for x in range(17, 24): dat(38, x, V0)                   # vành dưới sẫm
for y in range(34, 38): dat(y, 23, V0)                   # bóng bên phải (phía thân)
dat(39, 20, V2); dat(39, 19, V0); dat(39, 21, V0)        # quả lắc + mép vành
for y in range(33, 40): dat(y, 16, VIEN)                 # viền trái chuông
for x in range(17, 24): dat(40, x, VIEN) if x in (19, 20, 21) else None
# mắt: 2 vệt vàng nhạt cao 2 px như mẫu
for y, x in ((31, 35), (32, 35), (31, 37), (32, 37)): dat(y, x, V2)
dat(31, 36, VIEN); dat(32, 36, VIEN)
# trâm tròn sáng trên ngực (1 px sáng + 1 px xanh nhạt) tại đai chéo
dat(39, 37, SANG); dat(40, 37, X2); dat(39, 36, X0); dat(40, 36, X0)
# chắn kiếm vàng dọc 4 px, chuôi 2 px (mẫu: chắn ngang rõ)
for y in range(45, 50): dat(y, 41, V1)
dat(44, 41, V0); dat(50, 41, V0)
dat(47, 40, V0); dat(47, 39, V0)                         # chuôi về phía tay
# vạch ủng xanh liền trên 2 ủng (cổ ủng)
for x in range(25, 30): dat(56, x, X1)
for x in range(34, 41): dat(56, x, X1)
# đai lưng tối liền ngang hông
for x in range(27, 38): dat(47, x, AO0)


def main():
    goc = np.array(Image.open(os.path.join(DG, 'goc-64.png')).convert('RGBA')); so = {}
    a = don(goc, so)
    for y, x, c in SUA:
        if c is not None: a[y, x] = c
    so['pixelSuaTay'] = len(SUA)
    # viền ngoài lại lần cuối cho các pixel mới thêm (khoen/dây)
    b = a.copy()
    for y in range(64):
        for x in range(64):
            if a[y, x, 3] == 0 and any(op(a, y + dy, x + dx) for dy, dx in N4): b[y, x] = VIEN
    out = Image.fromarray(b, 'RGBA'); out.save(os.path.join(DG, 'mau-ve-tay-dung.png'))
    # so sánh ×8
    idle = Image.open(os.path.join(RAW, 'idle-0-cuoi.png')).convert('RGBA')
    moi = Image.open(os.path.join(DG, 'run-0-moi.png')).convert('RGBA')
    cot = [(Image.fromarray(goc, 'RGBA'), 'Mẫu gốc thu về 64\n(đa số màu, chưa dọn)'), (out, 'Sau dọn 3 quy tắc + %d pixel sửa tay\n(mau-ve-tay-dung.png)' % len(SUA)),
           (idle, 'Pipeline 3D hiện tại – Idle F0'), (moi, 'Pipeline 3D + cleanup.py – Run F0')]
    S = 8; W = len(cot) * (64 * S + 12) + 12; H = 64 * S + 60
    im = Image.new('RGBA', (W, H), NEN); d = ImageDraw.Draw(im); f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 12)
    for k, (a_, nhan) in enumerate(cot):
        x = 12 + k * (64 * S + 12); im.alpha_composite(a_.resize((64 * S, 64 * S), Image.NEAREST), (x, 40))
        d.rectangle([x, 40, x + 64 * S - 1, 40 + 64 * S - 1], outline=(70, 80, 95, 255)); d.multiline_text((x, 6), nhan, font=f, fill=(230, 230, 230, 255))
    im.save(os.path.join(DG, 'mau-ve-tay-so-sanh-x8.png'))
    mau = set(map(tuple, b.reshape(-1, 4))); so['soMau'] = len([m for m in mau if m[3]]); so['ngoaiBang'] = [m for m in mau if m[3] and '#%02X%02X%02X' % m[:3] not in PAL]
    print(so)


if __name__ == '__main__': main()
