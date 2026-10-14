"""Vòng báo trước = hoạt ảnh 8 khung (docs/anh-goc/bao-truoc) -> game/art/custom/gd-bt-{tron,vanh,quat,dai}.sprite.json
(ảnh giao diện: một hàng 8 khung đều nhau; js/bao_truoc.js cắt khung và đặt theo hình học BT_ANH in ra cuối).
python3 dung-bao-truoc.py [--ghi]
- Tách nền xanh có alpha (tach_xanh.unmix): lòng đỏ bán trong pha nền xanh trở lại đỏ trong suốt, không ám xanh.
- Các khung SÁT/CHẠM nhau: không cắt theo cột trần mà lấy theo tâm/đỉnh từng khung (bước đều 2172/8 = 271,5) rồi
  giữ điểm trong bán kính (tròn, vành), trong hình quạt (quạt), trong dải dọc ±85 quanh tâm dòng (dải thẳng) — bỏ phần lấn của khung bên cạnh.
"""
import sys, os, io, json, base64
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tach_xanh import unmix, thu_rgba
DAY = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../..'))
GOC = os.path.join(DAY, 'docs/anh-goc/bao-truoc')
GHI = '--ghi' in sys.argv
RA = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ra'); os.makedirs(RA, exist_ok=True)
BUOC = 2172 / 8

def doc(ten): return unmix(np.array(Image.open(os.path.join(GOC, ten)).convert('RGB')))

def luu(sh, ma, ten, so_mau=96):
    im = Image.fromarray(sh, 'RGBA')
    q = im.quantize(colors=so_mau, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE)
    buf = io.BytesIO(); q.save(buf, 'PNG', optimize=True)
    back = np.array(Image.open(io.BytesIO(buf.getvalue())).convert('RGBA')).astype(int)
    err = np.abs(back - sh.astype(int)).mean()
    t = {'loai': 'linh-khi-sprite', 'phien_ban': 1, 'ma': ma, 'ten': ten, 'doi_tuong': 'giao-dien',
         'anh': 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode(), 'net': 1}
    Image.fromarray(back.astype(np.uint8)).save(os.path.join(RA, ma + '.png'))
    ra = os.path.join(DAY, 'game/art/custom', ma + '.sprite.json') if GHI else os.path.join(RA, ma + '.sprite.json')
    json.dump(t, open(ra, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print(ma, sh.shape[1::-1], 'byte', os.path.getsize(ra), 'sai so TB %.2f' % err)

hinh = {}
# ---- tròn và vành: tâm khung i ở ((i+0.5)·BUOC, CY); bán kính ảnh R (vòng viền khung 1), giới hạn giữ 140 (khung 8: 175, trừ phần trong đĩa khung 7)
for ten, ma, CY, R, R0 in [('tron.png', 'gd-bt-tron', 349.5, 122, 0), ('vanh-khuyen.png', 'gd-bt-vanh', 340, 122, 90)]:
    a = doc(ten); H, W = a.shape[:2]; LIM = 175; RO = 64  # RO: bán kính vòng (R) trên ảnh ra
    S = int(round(2 * LIM * RO / R)) // 2 * 2
    yy, xx = np.mgrid[0:H, 0:W]
    out = []
    for i in range(8):
        cx = (i + 0.5) * BUOC
        d = np.hypot(xx - cx, yy - CY)
        keep = d <= (175 if i == 7 else 140)
        if i == 7: keep &= np.hypot(xx - (i - 0.5) * BUOC, yy - CY) > 140
        b = a.copy(); b[~keep] = 0
        if i < 7:
            # hoa văn hai bên trái/phải chạm hoa văn khung bên cạnh: thay bằng hoa văn trên/dưới xoay 90° (vòng đối xứng 4 phía)
            dx, dy = xx - cx, yy - CY; vung = (np.abs(dx) > 112) & (np.abs(dy) < 30) & keep
            sx = np.clip(np.round(cx - dy[vung]).astype(int), 0, W - 1); sy = np.clip(np.round(CY + dx[vung]).astype(int), 0, H - 1)
            b[vung] = a[sy, sx]
        x0, y0 = int(round(cx - LIM)), int(round(CY - LIM))
        pad = np.zeros((2 * LIM, 2 * LIM, 4), np.uint8)
        sx0, sy0 = max(0, x0), max(0, y0); sx1, sy1 = min(W, x0 + 2 * LIM), min(H, y0 + 2 * LIM)
        pad[sy0 - y0:sy1 - y0, sx0 - x0:sx1 - x0] = b[sy0:sy1, sx0:sx1]
        out.append(thu_rgba(pad, S, S))
    sh = np.concatenate(out, 1)
    luu(sh, ma, 'Vòng báo trước · ' + ('tròn' if R0 == 0 else 'vành khuyên'))
    hinh[ma] = {'o': S, 'R': round(RO, 2), 'r0': round(R0 * RO / R, 2)}

# ---- quạt: đỉnh khung i ở (i·BUOC + 14, 342), quay sang phải; bán kính R 255, nửa góc 44°
a = doc('hinh-quat.png'); H, W = a.shape[:2]; AX, AY, R, NUA = 14, 342, 255, 44
yy, xx = np.mgrid[0:H, 0:W]
L, T = 8, int(R * np.sin(np.radians(62))) + 4; RO = 64
w_src, h_src = R + 14 + L, 2 * T
SW, SH = int(round(w_src * RO / R)), int(round(h_src * RO / R)) // 2 * 2
out = []
for i in range(8):
    ax = i * BUOC + AX
    d = np.hypot(xx - ax, yy - AY); an = np.degrees(np.arctan2(yy - AY, xx - ax))
    keep = (d <= R + 12) & ((np.abs(an) <= 62) | (d < 10))
    b = a.copy(); b[~keep] = 0
    x0, y0 = int(round(ax - L)), AY - T
    pad = np.zeros((h_src, w_src, 4), np.uint8)
    sx0, sx1 = max(0, x0), min(W, x0 + w_src)
    pad[:, sx0 - x0:sx1 - x0] = b[y0:y0 + h_src, sx0:sx1]
    out.append(thu_rgba(pad, SW, SH))
sh = np.concatenate(out, 1)
luu(sh, 'gd-bt-quat', 'Vòng báo trước · hình quạt')
hinh['gd-bt-quat'] = {'o': [SW, SH], 'dinh': [round(L * RO / R, 2), SH / 2], 'R': RO, 'nua': NUA}

# ---- dải thẳng: 8 dòng xếp dọc; tâm dòng k; thân dải x 29..995, y ±41.5 (mũi tên chỉ sang phải)
a = doc('dai-thang-doc.png'); H, W = a.shape[:2]
TAM = [108.5, 273, 446, 616.5, 788, 963.5, 1137.5, 1305.5]; X0, X1, NUA_DAY = 29, 995, 41.5
LEN_O = 160; k = LEN_O / (X1 - X0)
SW, SH = int(round(W * k)), int(round(170 * k)) // 2 * 2
out = []
for i, c in enumerate(TAM):
    y0 = int(round(c - 85)); pad = np.zeros((170, W, 4), np.uint8)
    hi = 85 if i < 7 else 85
    pad[:, :] = a[y0:y0 + 170]
    out.append(thu_rgba(pad, SW, SH))
sh = np.concatenate(out, 1)
luu(sh, 'gd-bt-dai', 'Vòng báo trước · dải thẳng')
hinh['gd-bt-dai'] = {'o': [SW, SH], 'x0': round(X0 * k, 2), 'x1': round(X1 * k, 2), 'nua': round(NUA_DAY * k, 2)}
print('BT_ANH =', json.dumps(hinh))
json.dump(hinh, open(os.path.join(RA, 'hinh-bao-truoc.json'), 'w'), indent=1)
