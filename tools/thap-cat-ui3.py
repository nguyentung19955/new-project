# -*- coding: utf-8 -*-
"""TURRET MERGE — HUD TRẬN ANIME "Royal Twilight" phần 2 (09/11): các mảnh trong trận còn kiểu thép cũ.
  thap/assets/ha_duong.png (đã cắt bởi thap-cat-ui2.py)   → ha_nga3 (ô NGÃ BA co-op: kín trái, mở lên/xuống/phải — uốn chính đoạn đường
                                                            đá: ray ngoài thẳng bên trái, 2 góc ray trong bo tròn ở góc trên-phải / dưới-phải)
  docs/demo-hop-tuong/thap-art/raw_ui2_nut.png  → ha_cong (vành CỔNG SINH QUÁI: nút tròn indigo viền vàng 4 ngọc cyan; lõi xoáy tím
                                                  của cổng cũ quay trên tâm — render.js diaCong)
  docs/demo-hop-tuong/thap-art/raw_ui2_ban.png  → ha_loi (LÕI THỦ: pha lê cyan trên bệ tròn vàng–indigo, góc dưới-phải tấm bàn —
                                                  cắt bằng mặt nạ elip bệ + đa giác pha lê, viền mềm 1 px)
Khoá magenta / mặt nạ → thu Lanczos nhân-trước-alpha về 3× cỡ CSS lớn nhất (thap/QUY-TAC-HINH.md mục 5).
Chạy: python3 tools/thap-cat-ui3.py
"""
import os
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NGUON = os.path.join(GOC, 'docs/demo-hop-tuong/thap-art')
DICH = os.path.join(GOC, 'thap/assets')
_src = open(os.path.join(GOC, 'tools/thap-cat-hinh.py'), encoding='utf-8').read().split('\n')
exec('\n'.join(_src[17:58]))  # def tach_nen(im, mau)
_u2 = open(os.path.join(GOC, 'tools/thap-cat-ui2.py'), encoding='utf-8').read()
exec(_u2[_u2.index('def xen('):_u2.index('def luu(')])  # xen, thu


def luu(im, ten, ghi=''):
    p = os.path.join(DICH, ten)
    im.save(p, optimize=True)
    print('%-14s %4dx%-4d %6.0f KB  %s' % (ten, im.size[0], im.size[1], os.path.getsize(p) / 1024, ghi))


# ---------- 1. ô ngã ba ----------
th = np.asarray(Image.open(os.path.join(DICH, 'ha_duong.png')).convert('RGBA')).astype(np.float32)  # (dài 152, ngang 104): x = ngang (0 = ray ngoài)
L, S = th.shape[0], th.shape[1]
yy, xx = np.mgrid[0:S, 0:S].astype(np.float32) + 0.5
d = np.minimum(np.hypot(S - xx, yy), np.hypot(S - xx, S - yy))  # khoảng cách tới góc trên-phải / dưới-phải
M = S * 0.5                        # giữa mặt đường
u = np.minimum(xx, np.maximum(S - d, M))  # mép trên/dưới khớp đúng đoạn dọc (u = x); ray ngoài thẳng bên trái; ray trong chỉ còn 2 cung ở góc phải
v = yy % L
n3 = np.zeros((S, S, 4), np.float32)
for k in range(4):
    n3[..., k] = nd.map_coordinates(th[..., k], [v, np.clip(u, 0, S - 1)], order=1, mode='nearest')
luu(Image.fromarray(np.clip(n3, 0, 255).astype(np.uint8), 'RGBA'), 'ha_nga3.png', 'ngã ba co-op (vẽ 46×46 = DUONG_RONG)')

# ---------- 2. vành cổng ----------
nut = Image.open(os.path.join(NGUON, 'raw_ui2_nut.png')).convert('RGB')
cong = xen(tach_nen(nut.crop((40, 850, 340, 1150)), 'tim'))
luu(thu(cong, 168), 'ha_cong.png', 'vành cổng Ø56 css')

# ---------- 3. lõi thủ ----------
ban = Image.open(os.path.join(NGUON, 'raw_ui2_ban.png')).convert('RGB')
X0, Y0 = 760, 940                   # khung cắt (raw); toạ độ mặt nạ đo ở khung xem ×2 → /2
c = ban.crop((X0, Y0, 1010, 1230))
w, h = c.size
K = 4                                # vẽ mặt nạ ở ×4 rồi thu (khử răng cưa)
m = Image.new('L', (w * K, h * K), 0)
dr = ImageDraw.Draw(m)
cx, cy, rx, ry = 277 / 2, 410 / 2, 202 / 2, 146 / 2
dr.ellipse([(cx - rx) * K, (cy - ry) * K, (cx + rx) * K, (cy + ry) * K], fill=255)
dr.polygon([(x / 2 * K, y / 2 * K) for x, y in [(218, 184), (248, 112), (300, 100), (349, 178), (351, 330), (217, 330)]], fill=255)
m = m.resize((w, h), Image.LANCZOS)
a = np.dstack([np.asarray(c), np.asarray(m)])
loi = xen(Image.fromarray(a.astype(np.uint8), 'RGBA'))
luu(thu(loi, 180), 'ha_loi.png', 'lõi pha lê (vẽ 60 css)')

# ---------- 4. nút / tấm (raw_ui2_nut.png) — bảng tạm dừng, màn kết quả, vào trận ----------
NUT = {'ha_nut_cam': ((30, 64, 1224, 474), 720, 'nút chính cam (RESUME / RETRY) ~240 css'),
       'ha_nut_xanh': ((72, 503, 1200, 805), 720, 'nút phụ indigo viền cyan (MUSIC / QUIT…) ~240 css'),
       'ha_vien_xanh': ((360, 898, 786, 1110), 180, 'viên cyan (ký hiệu tạm dừng: 2 viên dựng đứng)')}
for ten, (hop, w, ghi) in NUT.items():
    luu(thu(xen(tach_nen(nut.crop(hop), 'tim')), w), ten + '.png', ghi)
# ký hiệu TẠM DỪNG: 2 viên cyan dựng đứng (ảnh ChatGPT xoay 90°), khe = 0,5 bề ngang viên — không vẽ code
v = Image.open(os.path.join(DICH, 'ha_vien_xanh.png')).rotate(90, expand=True)
v = thu(v, 30)
cw = v.size[0] * 2 + v.size[0] // 2
ic = Image.new('RGBA', (cw, v.size[1]), (0, 0, 0, 0))
ic.alpha_composite(v, (0, 0)); ic.alpha_composite(v, (cw - v.size[0], 0))
luu(ic, 'ha_ic_dung2.png', 'tạm dừng (2 viên cyan)')
# ký hiệu TỐC ĐỘ: dùng thẳng mũi tên ››› cyan có vệt gió của đường (assets/duong_mui.png, ChatGPT S4) — CSS hud-anime.css
