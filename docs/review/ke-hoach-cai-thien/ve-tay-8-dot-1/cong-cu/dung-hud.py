"""Vẽ tay 8 đợt 1 (16/10): cắt 5 ảnh HUD chủ game gen (docs/anh-goc/ve-tay-8-dot-1/, nền #00FF00) thành game/art/custom/<mã>.sprite.json.
    python3 dung-hud.py [--ghi]      (không --ghi: chỉ ghi vào cong-cu/ra/ để xem)
Cách thu nhỏ: NEAREST NEIGHBOR (mỗi điểm ảnh đích lấy đúng một điểm ảnh gốc ở GIỮA ô tương ứng) → cạnh pixel sắc, không trộn màu.
Khử nền: a = 1 − (lục − max(đỏ, lam)) / 245 (cách 'tach' của ../../con-ve-tay-6/cong-cu/dung-dot6.py), a < 0,5 → trong suốt, còn lại
tách màu nền ra rồi để đặc. Lượng tử màu + ghi PNG bằng png() của dung-dot6.py (kiểm khớp từng điểm). Cỡ đích = cỡ trong prompt
(KIEM-KE.md mục 3a, đã là cỡ net 2 = gấp đôi điểm game):
  gd-ruot-thanh   5 dải 64×8 (đỏ máu / lam mana / vàng tiến độ / xanh lá hồi máu / trắng chớp) xếp dọc → ảnh 64×40, game cắt theo hàng
  gd-mau-quai-nho 3 đoạn 32×4 (đỏ thường / cam tinh anh / vàng nhạt phần vừa mất) — ảnh gen là MỘT dải ba đoạn liền → chia 3 đều,
                  xếp dọc → ảnh 32×12
  hu-bao-vung-soc 4 khung sọc chéo 32×32 lặp liền. Ảnh gen 543×724 mỗi khung (không vuông) → lấy ô vuông bằng ĐÚNG MỘT CHU KỲ sọc
                  (đo bằng tự tương quan, ~216 điểm ảnh gốc, sọc 45°) thu về 16×16 rồi ghép 2×2 = 32×32 → lặp không lộ đường nối.
                  Khung 1–2 vàng nâu → nhuộm về màu đỏ khung 3 (giữ độ sáng tương đối từng khung: vẫn "sáng dần").
  hu-bao-vung-vong 6 khung vòng đỏ đầy dần, 64×40 (hộp chung của 6 khung)
  gd-icon-linh-khi 16×20 (ảnh gen ~19×34 khối: dẹt hơn đích, thu thẳng về 16×20)"""
import sys, os, json, io, base64
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
DAY = os.path.abspath(os.path.join(HERE, '../../../../..'))
GOC = os.path.join(DAY, 'docs/anh-goc/ve-tay-8-dot-1')
GHI = '--ghi' in sys.argv
RA = os.path.join(HERE, 'ra'); os.makedirs(RA, exist_ok=True)


def png(sh, so_mau=64):  # như dung-dot6.png (không nạp cả tệp đó: nó chạy luôn khi import)
    op = sh[..., 3] > 0; px = sh[op][:, :3]
    if len(px) and len(set(map(tuple, px.tolist()))) > so_mau:
        q = Image.fromarray(px.reshape(1, -1, 3)).quantize(colors=so_mau, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
        pal = np.array(q.getpalette()[:3 * so_mau]).reshape(-1, 3); sh[op, :3] = pal[np.array(q).ravel()]
    sh[~op] = 0
    b = io.BytesIO(); Image.fromarray(sh, 'RGBA').save(b, 'PNG', optimize=True)
    assert (np.array(Image.open(io.BytesIO(b.getvalue())).convert('RGBA')) == sh).all()
    return b.getvalue()


def doc(ten):
    return np.array(Image.open(os.path.join(GOC, ten + '.png')).convert('RGB')).astype(np.float32)


def tach(rgb, nguong=0.5):
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    a = np.clip(1 - (g - np.maximum(r, b)) / 245.0, 0, 1)
    nen = np.array([3, 248, 3], np.float32)
    c = np.where(a[..., None] > 0, (rgb - (1 - a[..., None]) * nen) / np.maximum(a, 1e-3)[..., None], 0)
    o = np.zeros(rgb.shape[:2] + (4,), np.uint8)
    o[..., :3] = np.clip(c, 0, 255); o[..., 3] = (a >= nguong) * 255
    return o


def sach(o, rgb, do=False):
    """Điểm đặc ở mép (trộn nền xanh lục) sau khi tách màu thường ra ô liu: đưa về màu SẠCH gần nhất của chính ảnh
    (bảng ≤ 32 màu lấy từ các điểm gốc không ngả lục: lục ≤ max(đỏ, lam) − 10, xa màu nền)."""
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    ok = (g <= np.maximum(r, b) - 10)
    if do: ok = (r > 120) & (g < 0.8 * r)  # vùng báo: chỉ màu đỏ / cam / hồng nhạt (bỏ màu ô liu của mép trộn nền)
    px = rgb[ok].astype(np.uint8)
    if len(px) > 200000: px = px[np.random.RandomState(1).choice(len(px), 200000, replace=False)]
    q = Image.fromarray(px.reshape(1, -1, 3)).quantize(colors=32, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    pal = np.array(q.getpalette()[:96], float).reshape(-1, 3)
    op = o[..., 3] > 0; c = o[op][:, :3].astype(float)
    o[op, :3] = pal[np.argmin(((c[:, None] - pal[None]) ** 2).sum(2), 1)].astype(np.uint8)
    return o


def gan(o, x0, y0, x1, y1, W, H):
    """NEAREST: ô (x0..x1, y0..y1) ảnh gốc → W×H, mỗi điểm đích = điểm gốc ở giữa ô."""
    xs = (x0 + (np.arange(W) + 0.5) * (x1 - x0) / W).astype(int)
    ys = (y0 + (np.arange(H) + 0.5) * (y1 - y0) / H).astype(int)
    return o[ys][:, xs].copy()


def nen_mask(rgb):
    return (rgb[..., 1] - np.maximum(rgb[..., 0], rgb[..., 2])) > 150


def dai_hang(rgb):
    """Các dải ngang (hàng không phải nền) → [(y0, y1)]."""
    nen = nen_mask(rgb).mean(1) > 0.5
    ds, s = [], None
    for y, v in enumerate(nen):
        if not v and s is None: s = y
        if v and s is not None: ds.append((s, y)); s = None
    if s is not None: ds.append((s, len(nen)))
    return [d for d in ds if d[1] - d[0] > 10]


def chu_ky(m):
    """Chu kỳ sọc (điểm ảnh gốc): đỉnh tự tương quan đầu tiên sau điểm âm, trung bình nhiều hàng và cột."""
    def p(v):
        v = v.astype(float) - v.mean(); ac = np.correlate(v, v, 'full')[len(v) - 1:]
        i = int(np.argmax(ac < 0)); return i + int(np.argmax(ac[i:]))
    ps = [p(m[y]) for y in range(40, m.shape[0] - 40, 60)] + [p(m[:, x]) for x in range(40, m.shape[1] - 40, 60)]
    return float(np.median(ps))


so_do = {}
ket = {}

# ---------- gd-ruot-thanh: 5 dải 64×8 ----------
rgb = doc('gd-ruot-thanh'); o = np.dstack([rgb, np.full(rgb.shape[:2], 255.0)]).astype(np.uint8); ds = dai_hang(rgb)  # dải đặc: lấy màu gốc (dải xanh lá không bị tách nền)
assert len(ds) == 5, ds
hang = [gan(o, 0, y0, rgb.shape[1], y1, 64, 8) for y0, y1 in ds]
sh = np.concatenate(hang, 0); sh[..., 3] = 255
ket['gd-ruot-thanh'] = (sh, {'so': 5, 'khung_cao': 4, 'dai': ['do', 'lam', 'vang', 'xanh', 'trang'],
                              'ten': 'Ruột thanh máu / mana / tiến độ / hồi máu / chớp trắng (mỗi hàng một dải 32×4 điểm game, lặp ngang)'})
so_do['gd-ruot-thanh'] = {'dai_goc': ds}

# ---------- gd-mau-quai-nho: 3 đoạn 32×4 ----------
rgb = doc('gd-mau-quai-nho'); o = np.dstack([rgb, np.full(rgb.shape[:2], 255.0)]).astype(np.uint8); ys, xs = np.nonzero(~nen_mask(rgb))
x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
w3 = (x1 - x0) / 3
hang = [gan(o, x0 + i * w3, y0, x0 + (i + 1) * w3, y1, 32, 4) for i in range(3)]
sh = np.concatenate(hang, 0); sh[..., 3] = 255
ket['gd-mau-quai-nho'] = (sh, {'so': 3, 'khung_cao': 2, 'dai': ['thuong', 'tinh_anh', 'vua_mat'],
                                'ten': 'Ruột thanh máu quái nhỏ: đỏ thường / cam tinh anh / vàng nhạt phần vừa mất (mỗi hàng 16×2 điểm game)'})
so_do['gd-mau-quai-nho'] = {'hop': [int(x0), int(y0), int(x1), int(y1)]}

# ---------- hu-bao-vung-soc: 4 khung 32×32 lặp ----------
rgb = doc('hu-bao-vung-soc'); o = tach(rgb, 0.8); W4 = rgb.shape[1] / 4
kh, P = [], []
for i in range(4):
    sub = rgb[:, int(i * W4) + 6:int((i + 1) * W4) - 6]
    P.append(chu_ky(~nen_mask(sub)))
Pm = float(np.median(P))
for i in range(4):
    x0 = int(i * W4) + 40; y0 = 40
    t = gan(o, x0, y0, x0 + Pm, y0 + Pm, 16, 16)
    kh.append(np.tile(t, (2, 2, 1)))
# nhuộm khung 1–2 về đỏ của khung 3: mỗi điểm đặc lấy màu khung 3 cùng hạng sáng (sọc đậm / sọc nhạt), nhân tỉ lệ độ sáng khung
ref = kh[2]; op3 = ref[..., 3] > 0; L3 = ref[op3][:, :3].astype(float).sum(1)
c3 = ref[op3][:, :3].astype(float); thu = np.argsort(L3)
for i in (0, 1):
    f = kh[i].astype(float); op = f[..., 3] > 0; L = f[op][:, :3].sum(1)
    rk = np.argsort(np.argsort(L)) / max(1, len(L) - 1)
    mau = c3[thu[(rk * (len(thu) - 1)).astype(int)]]
    k = L.mean() / L3.mean()  # khung tối hơn → giữ tối hơn (nhịp sáng dần)
    f[op, :3] = np.clip(mau * min(1.0, k), 0, 255); kh[i] = f.astype(np.uint8)
sh = sach(np.concatenate(kh, 1), rgb[:, int(2 * W4):], True)  # bảng màu từ khung 3–4 (đỏ)
ket['hu-bao-vung-soc'] = (sh, {'hu': 1, 'khung_rong': 16, 'khung_cao': 16, 'so': 4, 'giay': 0.5, 'lap': True,
                                'ten': 'Sọc chéo vùng báo nguy hiểm (lặp liền 16×16 điểm game, 4 khung sáng dần; js/bao_truoc.js lát lên lòng vùng)'})
so_do['hu-bao-vung-soc'] = {'chu_ky_goc': P, 'chon': Pm}

# ---------- hu-bao-vung-vong: 6 khung 64×40 ----------
rgb = doc('hu-bao-vung-vong'); o = tach(rgb, 0.8); W6 = rgb.shape[1] / 6; bb = []  # mép trộn nền (a < 0,8) bỏ hẳn
for i in range(6):
    m = ~nen_mask(rgb[:, int(i * W6):int((i + 1) * W6)]); ys, xs = np.nonzero(m)
    bb.append((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
w = max(b[2] - b[0] for b in bb); h = max(b[3] - b[1] for b in bb)
kh = []
for i, b in enumerate(bb):
    cx = int(i * W6) + (b[0] + b[2]) / 2; cy = (b[1] + b[3]) / 2
    kh.append(gan(o, cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2, 64, 40))
sh = sach(np.concatenate(kh, 1), rgb, True)
ket['hu-bao-vung-vong'] = (sh, {'hu': 1, 'khung_rong': 32, 'khung_cao': 20, 'so': 6, 'giay': 1.0, 'lap': False,
                                 'ten': 'Vòng đỏ vùng báo tròn, lòng đầy dần 6 khung (js/bao_truoc.js chọn khung theo tiến độ báo trước)'})
so_do['hu-bao-vung-vong'] = {'hop_goc': [int(w), int(h)]}

# ---------- gd-icon-linh-khi: 16×20 ----------
rgb = doc('gd-icon-linh-khi'); o = tach(rgb); ys, xs = np.nonzero(~nen_mask(rgb))
sh = sach(gan(o, xs.min(), ys.min(), xs.max() + 1, ys.max() + 1, 16, 20), rgb)
ket['gd-icon-linh-khi'] = (sh, {'ten': 'Viên linh khí (HUD, Lò rèn, kết quả; 8×10 điểm game)'})
so_do['gd-icon-linh-khi'] = {'hop_goc': [int(xs.min()), int(ys.min()), int(xs.max() + 1), int(ys.max() + 1)]}

for ma, (sh, meta) in ket.items():
    data = png(np.ascontiguousarray(sh))
    if meta.pop('hu', 0):
        t = {'loai': 'linh-khi-sprite', 'phien_ban': 1, 'doi_tuong': 'hieu-ung', 'ma': ma, 'ten': meta.pop('ten'), 'net': 2,
             'goc': [meta['khung_rong'] / 2, meta['khung_cao'] / 2], 'xoay': False, 'co': 1, 'tron': 'thuong',
             'tam': 'data:image/png;base64,' + base64.b64encode(data).decode(), **meta}
    else:
        t = {'loai': 'linh-khi-sprite', 'phien_ban': 1, 'ma': ma, 'ten': meta.pop('ten'), 'doi_tuong': 'giao-dien',
             'rong': sh.shape[1] // 2, 'cao': sh.shape[0] // 2, 'net': 2, **meta, 'anh': 'data:image/png;base64,' + base64.b64encode(data).decode()}
    Image.fromarray(sh).save(os.path.join(RA, ma + '.png'))
    ra = os.path.join(DAY, 'game/art/custom', ma + '.sprite.json') if GHI else os.path.join(RA, ma + '.sprite.json')
    json.dump(t, open(ra, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    so_do.setdefault(ma, {}).update({'co': [sh.shape[1], sh.shape[0]], 'png': len(data), 'byte': os.path.getsize(ra)})
    print(ma, so_do[ma])
json.dump(so_do, open(os.path.join(RA, 'so-do.json'), 'w'), ensure_ascii=False, indent=1, default=float)
