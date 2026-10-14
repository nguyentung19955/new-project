"""4 khung giao diện 9 mảnh (đợt trùm nhỏ 14/10): docs/anh-goc/giao-dien/*.png (đã tách nền) -> game/art/custom/gd-*.sprite.json
(doi_tuong "giao-dien", js/sprite_custom.js SC.veGd cắt 9 mảnh theo "vien"; js/ui_theme.js vẽ). python3 dung-khung-giao-dien.py [--ghi]
- Thu nhỏ (trung bình có trọng số alpha, kiểu BOX) về cỡ điểm ảnh game, nét x2 (net 2), giảm màu (bảng 64-96 màu), alpha 0/255.
- gd-khung-bang: khung bảng (T.panel), 4 góc trống đồng chim Lạc; "lap_canh": cạnh và lòng LẶP (hoa văn không bị kéo dãn).
- gd-nut-thuong / -chinh / -nguy / -chon: 4 nút cắt từ gd-nut-chu-4-mau.png (trái -> phải), cao 24 điểm game; nút thấp hơn game thu đều cả nút.
- gd-khung-thoai: hộp thoại NPC (T.dialog). BỎ ô chân dung bên trái (game chưa có chân dung; chữ vẫn bắt đầu ở x + 7 như cũ,
  ô chân dung sẽ đè lên chữ): ghép trục cuộn trái + lề giấy với phần giấy sau ô chân dung.
- gd-thanh-tren: thanh tài nguyên (T.topBar) = đầu mây trái + gỗ trơn + đầu mây phải (bỏ vạch ngăn: ô của game không cố định chỗ);
  gd-thanh-tren-vach: vạch ngăn ô cắt riêng, game đặt giữa các nhóm tài nguyên (4 ô: vàng + quặng · nguyên liệu · mảnh · tên em bé)."""
import sys, os, io, json, base64
import numpy as np
from PIL import Image
DAY = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../..'))
GOC = os.path.join(DAY, 'docs/anh-goc/giao-dien')
GHI = '--ghi' in sys.argv
RA = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ra'); os.makedirs(RA, exist_ok=True)
N = 2


def doc(ten): return np.array(Image.open(os.path.join(GOC, ten)).convert('RGBA'))


def thu(a, tw, th):
    """thu về tw x th điểm ảnh (đã nhân net), trung bình có trọng số alpha"""
    al = a[..., 3:4].astype(np.float32) / 255
    pre = np.concatenate([a[..., :3] * al, al * 255], 2).astype(np.float32)
    ch = [np.array(Image.fromarray(pre[..., k]).resize((tw, th), Image.BOX)) for k in range(4)]
    A = ch[3]; o = np.zeros((th, tw, 4), np.uint8)
    for k in range(3): o[..., k] = np.clip(np.where(A > 0, ch[k] / np.maximum(A, 1e-3) * 255, 0), 0, 255)
    o[..., 3] = (A >= 128) * 255
    return o


def png(sh, so_mau):
    op = sh[..., 3] > 0; px = sh[op][:, :3]
    q = Image.fromarray(px.reshape(1, -1, 3)).quantize(colors=so_mau, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    pal = np.array(q.getpalette()[:3 * so_mau]).reshape(-1, 3); sh = sh.copy(); sh[op, :3] = pal[np.array(q).ravel()]; sh[~op] = 0
    mau = sorted(set(map(tuple, sh.reshape(-1, 4).tolist()))); flat = sh.reshape(-1, 4).astype(np.int64)
    key = ((flat[:, 0] * 256 + flat[:, 1]) * 256 + flat[:, 2]) * 256 + flat[:, 3]
    km = np.array([((c[0] * 256 + c[1]) * 256 + c[2]) * 256 + c[3] for c in mau], np.int64)
    im = Image.fromarray(np.searchsorted(km, key).astype(np.uint8).reshape(sh.shape[:2]), 'P'); im.putpalette([v for c in mau for v in c[:3]])
    buf = io.BytesIO(); im.save(buf, 'PNG', optimize=True, transparency=bytes(c[3] for c in mau))
    assert (np.array(Image.open(io.BytesIO(buf.getvalue())).convert('RGBA')) == sh).all()
    return buf.getvalue(), sh


def ghi(ma, ten, a, rong, cao, vien, so_mau=96, them=None):
    sh = thu(a, rong * N, cao * N); data, sh = png(sh, so_mau)
    t = {'loai': 'linh-khi-sprite', 'phien_ban': 1, 'ma': ma, 'ten': ten, 'doi_tuong': 'giao-dien', 'rong': rong, 'cao': cao, 'net': N}
    if vien: t['vien'] = vien
    if them: t.update(them)
    t['anh'] = 'data:image/png;base64,' + base64.b64encode(data).decode()
    Image.fromarray(sh).save(os.path.join(RA, ma + '.png'))
    ra = os.path.join(DAY, 'game/art/custom', ma + '.sprite.json') if GHI else os.path.join(RA, ma + '.sprite.json')
    json.dump(t, open(ra, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print(ma, rong, cao, vien, os.path.getsize(ra), 'byte')


# 1) khung bảng: 2073 x 606, thu 0,085 -> 176 x 52; góc (trống đồng + ô chữ triện) ~210 điểm gốc -> 18
a = doc('gd-khung-bang.png'); s = 0.085
ghi('gd-khung-bang', 'Khung bảng (trống đồng chim Lạc)', a, round(a.shape[1] * s), round(a.shape[0] * s), [18, 18, 18, 18], 96, {'lap_canh': True})

# 2) bốn nút: cột có điểm ảnh liền nhau (0-491, 534-1024, 1077-1567, 1612-2104), cao 186 -> 24 điểm game
a = doc('gd-nut-chu-4-mau.png'); m = a[..., 3] > 100; c = m.any(0); chay = []; s0 = None
for x, v in enumerate(c):
    if v and s0 is None: s0 = x
    if not v and s0 is not None: chay.append((s0, x)); s0 = None
if s0 is not None: chay.append((s0, len(c)))
assert len(chay) == 4, chay
for (x0, x1), (ma, ten) in zip(chay, [('gd-nut-thuong', 'Nút thường (nâu gỗ)'), ('gd-nut-chinh', 'Nút chính (đỏ son)'), ('gd-nut-nguy', 'Nút nguy (đỏ sẫm)'), ('gd-nut-chon', 'Nút đang chọn (vàng)')]):
    b = a[:, x0:x1]; ys = np.nonzero((b[..., 3] > 100).any(1))[0]; b = b[ys[0]:ys[-1] + 1]
    s = 24 / b.shape[0]
    ghi(ma, ten, b, round(b.shape[1] * s), 24, [9, 13, 9, 13], 64)

# 3) hộp thoại: bỏ ô chân dung (cột 118..445 của ảnh gốc), cao 518 -> 40
a = doc('gd-khung-thoai.png'); b = np.concatenate([a[:, :118], a[:, 445:]], 1); s = 40 / b.shape[0]
ghi('gd-khung-thoai', 'Hộp thoại NPC (cuộn giấy, không ô chân dung)', b, round(b.shape[1] * s), 40, [11, 14, 11, 14], 96)

# 4) thanh trên: đầu mây trái (0..230) + gỗ trơn (240..560) + đầu mây phải (đối xứng), cao 203 -> 16; vạch ngăn (560..650)
a = doc('gd-thanh-tren.png'); W = a.shape[1]
b = np.concatenate([a[:, :230], a[:, 240:560], a[:, W - 230:]], 1); s = 16 / b.shape[0]
ghi('gd-thanh-tren', 'Thanh tài nguyên trên cùng', b, round(b.shape[1] * s), 16, [0, 18, 0, 18], 64)
v = a[:, 560:650]; m = (v[..., 3] > 100); xs = np.nonzero(m.any(0))[0]
# vạch: cột có cả viền trên lẫn viền dưới và thanh dọc giữa (ô vuông chữ triện trên/dưới)
v = v[:, xs[0]:xs[-1] + 1]
ghi('gd-thanh-tren-vach', 'Vạch ngăn ô thanh tài nguyên', v, max(3, round(v.shape[1] * s)), 16, None, 32)
