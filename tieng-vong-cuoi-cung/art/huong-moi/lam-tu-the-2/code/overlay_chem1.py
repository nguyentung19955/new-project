#!/usr/bin/env python3
"""PH14 mục 3B / prompt C: ẢNH OVERLAY chém 1 để người dùng ĐÍNH KÈM khi gen lại chém 1.
4 tư thế chém 1 hiện tại (A lấy đà · B cắt · C kết thúc · D hồi, sheet lam-moi3-chem1-3x – đúng tỉ lệ + neo chân như trong game), mỗi ô một tư thế,
NỀN TRẮNG, cùng thang + cùng đường đất:
  - khung ĐỎ  = hộp đòn chém 1 THẬT (x 4…90, y −97…−49 so với chân, nhìn phải; bật ở atkT 7–14 = đúng lúc B / C hiện) – không đổi
  - dải CAM nét đứt = "đường cắt mong muốn": phần THẤP của hộp (y −50…−66, ngang ngực dưới) – B / C nên đưa lưỡi qua dải này
  - chấm XANH + đường nối = mũi dao (đo tay trên lưới) qua A → B → C → D; ô sau vẽ mờ đường của các ô trước
  - vạch xám = mặt đất (chân), trục thân
Ra: art/huong-moi/lam-tu-the-2/kiem/overlay-chem1-hop.png (+ số đo mũi dao in ra màn hình / ghi trong JSON cạnh ảnh).
Chạy: python3 art/huong-moi/lam-tu-the-2/code/overlay_chem1.py"""
import json, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__)); GOC = os.path.normpath(os.path.join(HERE, '..'))
SP = os.path.join(GOC, 'sprite'); KI = os.path.join(GOC, 'kiem')
HOP = [4, -97, 86, 48]              # hộp chém 1 thật (ATK lúc chạy) – x, y, w, h so với chân
DAI = (-66, -50)                    # dải cắt mong muốn (phần thấp của hộp)
K = 4                               # px ảnh / px logic
TEN = [('A', 'wind-up / lấy đà'), ('B', 'cut / cắt (hitbox on)'), ('C', 'follow-through / kết (hitbox on)'), ('D', 'guard / hồi')]
try:
    F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 20)
    FS = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 15)
except Exception:
    F = FS = ImageFont.load_default()


# mũi dao đo TAY trên lưới 1 px logic (kiem/thu3-do-dao.png + lưới 3x 29/10; lưỡi bạc cùng màu gấu áo nên không đo tự động được)
# PH15 bước 1 (29/10): sheet chém 1 SỬA 3 (thu7-chem1-sua3.png) – mũi dao đo bằng máy (dải thép dưới cằm, khớp đường thẳng; /tmp script trong GHI-CHU),
# tay đo trên lưới 1 px. Trước (sửa 2): A (5,−14) B (57,−48) C (47,−20) D (6,−14); tay B (10,−47) C (−2,−34)
MUI = {'A': [14, -18], 'B': [84, -51], 'C': [81, -32], 'D': [35, -17]}
TAY = {'B': [25, -53], 'C': [23, -43]}


def main():
    m = json.load(open(os.path.join(SP, 'lam-moi3-chem1-3x.json'), encoding='utf-8'))
    img = np.asarray(Image.open(os.path.join(SP, m['anh'])).convert('RGBA'))
    s = m['ty_le']['px_nguon_moi_px_logic']; ax, ay = m['diem_neo']['x'], m['diem_neo']['y']
    W, H = 150 * K, 170 * K; X0, Y0 = 52 * K, 150 * K   # chân trong ô
    o = Image.new('RGB', (4 * W + 5 * 12, H + 120), (255, 255, 255)); d = ImageDraw.Draw(o)
    mui = [MUI[n] for n in 'ABCD']
    for i, f in enumerate(m['frames']):
        cx = 12 + i * (W + 12); cy = 60
        c = Image.new('RGBA', (W, H), (255, 255, 255, 255)); dc = ImageDraw.Draw(c, 'RGBA')
        # đất + trục
        dc.line([(0, Y0), (W, Y0)], fill=(150, 150, 150), width=2); dc.line([(X0, 0), (X0, H)], fill=(205, 205, 205), width=1)
        # Lam
        cell = Image.fromarray(img[f['y']:f['y'] + f['h'], f['x']:f['x'] + f['w']])
        k = K / s; t = cell.resize((round(cell.width * k), round(cell.height * k)), Image.LANCZOS)
        c.alpha_composite(t, (int(round(X0 - ax * k)), int(round(Y0 - ay * k))))
        dc = ImageDraw.Draw(c, 'RGBA')
        # dải cắt mong muốn (cam nét đứt) + hộp đòn (đỏ)
        hx, hy, hw, hh = HOP
        for yy in DAI:
            for x in range(int(X0 + hx * K), int(X0 + (hx + hw) * K), 14): dc.line([(x, Y0 + yy * K), (x + 8, Y0 + yy * K)], fill=(240, 130, 20, 255), width=3)
        lp = Image.new('RGBA', c.size, (0, 0, 0, 0)); ImageDraw.Draw(lp).rectangle([X0 + hx * K, Y0 + DAI[0] * K, X0 + (hx + hw) * K, Y0 + DAI[1] * K], fill=(240, 150, 40, 60))
        c.alpha_composite(lp); dc = ImageDraw.Draw(c, 'RGBA')
        dc.rectangle([X0 + hx * K, Y0 + hy * K, X0 + (hx + hw) * K, Y0 + (hy + hh) * K], outline=(220, 30, 30, 255), width=4 if i in (1, 2) else 2)
        # đường mũi dao: các ô trước mờ, ô này đậm
        P = [(X0 + p[0] * K, Y0 + p[1] * K) if p else None for p in mui[:i + 1]]
        Q = [p for p in P if p]
        if len(Q) > 1: dc.line(Q, fill=(30, 110, 220, 120), width=3)
        for j, p in enumerate(P):
            if not p: continue
            rr = 9 if j == i else 6; dc.ellipse([p[0] - rr, p[1] - rr, p[0] + rr, p[1] + rr], fill=(30, 110, 220, 255 if j == i else 110), outline=(255, 255, 255, 255), width=2)
        o.paste(c.convert('RGB'), (cx, cy))
        d.rectangle([cx, cy, cx + W, cy + H], outline=(190, 190, 190), width=1)
        d.text((cx + 8, cy - 30), '%d  %s – %s' % (i + 1, TEN[i][0], TEN[i][1]), font=F, fill=(20, 20, 20))
    d.text((12, 10), 'Lam slash 1 – current poses (right-facing) + REAL hitbox. Placement guidance only, do not draw boxes/lines.', font=F, fill=(20, 20, 20))
    d.text((12, H + 70), 'RED = slash-1 hitbox (active during poses 2–3) · ORANGE dashed = desired cutting band (lower part of hitbox, lower-chest height) · '
           'BLUE dots = measured blade tip A→B→C→D', font=FS, fill=(40, 40, 40))
    d.text((12, H + 92), 'Đỏ = hộp đòn chém 1 · cam = dải cắt mong muốn (phần thấp của hộp) · xanh = mũi dao đo trên ảnh. Poses 2–3 should pass the blade through the orange band.',
           font=FS, fill=(40, 40, 40))
    o.save(os.path.join(KI, 'overlay-chem1-hop.png'))
    json.dump({'hop_chem1': HOP, 'dai_cat_mong_muon_y': DAI, 'mui_dao_logic': dict(zip('ABCD', mui)), 'nguon': 'sprite/' + m['anh'],
               'tay_logic': TAY, 'ghi_chu': 'px logic so với chân, nhìn phải. SỬA 3 (PH15): lưỡi B y −54,3…−52,7 nằm TRONG hộp (mép dưới −49), đường cắt ngang ngực dưới; C chúc 10° tới (81, −32) – xuống dưới hộp sau khi cắt (kết thúc khuỷu gập). Trước (sửa 2): lưỡi B −47…−48 dưới mép hộp 1–2 px'},
              open(os.path.join(KI, 'overlay-chem1-hop.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('mũi dao', mui, '→', os.path.join(KI, 'overlay-chem1-hop.png'), o.size)


if __name__ == '__main__':
    main()
