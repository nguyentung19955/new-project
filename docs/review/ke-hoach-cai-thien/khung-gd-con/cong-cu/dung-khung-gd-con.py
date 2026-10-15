"""9 khung giao diện còn vẽ code -> ảnh (YEU-CAU khung-gd-con). Ảnh gốc nền #00FF00: docs/anh-goc/giao-dien/dot2/*.png
-> game/art/custom/gd-*.sprite.json (doi_tuong "giao-dien", net 2; js/sprite_custom.js SC.veGd cắt 9 mảnh / 3 mảnh theo "vien").
python3 dung-khung-gd-con.py [--ghi]      (không --ghi: chỉ ghi ra cong-cu/ra/ để xem)
Cách làm giống trum-moi/cong-cu/dung-khung-giao-dien.py (thu nhỏ trung bình theo alpha kiểu BOX, nét x2, giảm màu, alpha 0/255), thêm:
- KHỬ NỀN XANH ở ảnh gốc: điểm có G cao và G - max(R, B) lớn là nền; vành 4 điểm quanh nền: còn ám xanh mạnh thì bỏ, ám nhẹ thì
  ép G = max(R, B) (khử loang). Sau khi thu nhỏ, điểm sát mép trong suốt còn ám xanh thì ép tiếp (đếm và in ra: phải là 0 sau khi ép).
  Lòng xanh đậm của khung-nho KHÔNG bị đụng (không sát nền).
- "long" (lòng): gd-khung-nho và gd-o-con / -chon: lòng tối được ĐỤC RỖNG (loang từ tâm theo màu lòng) để game tự đổ màu lòng
  (đúng màu lòng của ảnh, in ra dưới đây và ghi trong js/ui_theme.js) — T.plate cần lòng bán trong suốt (o.a), T.inset cần o.fill.
  Các khung khác giữ lòng tối đục trong ảnh.
Ảnh xem (ra/*.png) là bản nét x2 của từng tệp."""
import sys, os, io, json, base64
import numpy as np
from PIL import Image, ImageFilter
DAY = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../..'))
GOC = os.path.join(DAY, 'docs/anh-goc/giao-dien/dot2')
GHI = '--ghi' in sys.argv
RA = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ra'); os.makedirs(RA, exist_ok=True)
N = 2
KQ = {}


def no_rong(m, r):
    return np.array(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(2 * r + 1))) > 0


def doc(ten):
    """ảnh gốc RGB nền xanh -> RGBA đã khử nền + khử loang"""
    a = np.array(Image.open(os.path.join(GOC, ten)).convert('RGB')).astype(np.int32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx = np.maximum(r, b); lech = g - mx
    nen = (g > 120) & (lech > 60)
    ven = no_rong(nen, 4) & ~nen
    bo = ven & (lech > 45)               # điểm pha nhiều xanh ở mép: bỏ
    nen = nen | bo
    ep = no_rong(nen, 4) & ~nen & (lech > 6)  # ám xanh nhẹ ở mép: ép G về max(R, B)
    g = np.where(ep, mx, g)
    o = np.zeros(a.shape[:2] + (4,), np.uint8)
    o[..., 0], o[..., 1], o[..., 2] = r, g, b
    o[..., 3] = np.where(nen, 0, 255)
    return o


def hop(a):
    ys, xs = np.nonzero(a[..., 3] > 0)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


def cat(a, box=None):
    if box is None: box = hop(a)
    x0, y0, x1, y1 = box
    b = a[y0:y1, x0:x1]
    x0, y0, x1, y1 = hop(b)
    return b[y0:y1, x0:x1]


def thu(a, tw, th):
    al = a[..., 3:4].astype(np.float32) / 255
    pre = np.concatenate([a[..., :3] * al, al * 255], 2).astype(np.float32)
    ch = [np.array(Image.fromarray(pre[..., k]).resize((tw, th), Image.BOX)) for k in range(4)]
    A = ch[3]; o = np.zeros((th, tw, 4), np.uint8)
    for k in range(3): o[..., k] = np.clip(np.where(A > 0, ch[k] / np.maximum(A, 1e-3) * 255, 0), 0, 255)
    o[..., 3] = (A >= 128) * 255
    return o


def khu_xanh_sau(sh):
    """điểm đục sát điểm trong suốt còn ám xanh (G > max(R, B) + 10): ép G. Trả về số điểm đã ép."""
    op = sh[..., 3] > 0
    sat = no_rong(~op, 1) & op
    r, g, b = sh[..., 0].astype(int), sh[..., 1].astype(int), sh[..., 2].astype(int)
    m = sat & (g > np.maximum(r, b) + 10)
    sh[..., 1] = np.where(m, np.maximum(r, b), g).astype(np.uint8)
    return int(m.sum())


def duc_long(sh, sai=40):
    """đục rỗng lòng: loang từ tâm qua các điểm gần màu lòng. Trả về màu lòng (hex)."""
    h, w = sh.shape[:2]
    lo = sh[h // 2 - 1:h // 2 + 2, w // 2 - 2:w // 2 + 3, :3].reshape(-1, 3).astype(int)
    mau = np.median(lo, 0)
    gan = (np.abs(sh[..., :3].astype(int) - mau).sum(2) < sai) & (sh[..., 3] > 0)
    from scipy import ndimage
    nh, _ = ndimage.label(gan)
    k = nh[h // 2, w // 2]
    if k: sh[nh == k] = 0
    # điểm lòng sót sát lỗ (bóng lòng hơi khác màu): tối gần màu lòng và chạm lỗ thì bỏ, lặp 2 lượt
    lo_l = mau @ np.array([.299, .587, .114])
    for _ in range(2):
        lo = (sh[..., 3] == 0)
        if k: lo = lo & (nh == k)
        cham = no_rong(lo, 1) & (sh[..., 3] > 0)
        lum = sh[..., :3].astype(float) @ np.array([.299, .587, .114])
        bo = cham & (lum < lo_l + 22) & (np.abs(sh[..., :3].astype(int) - mau).sum(2) < 75)
        sh[bo] = 0
        nh = np.where(bo, k, nh)
    return '#%02x%02x%02x' % tuple(int(v) for v in mau)


def giu_khoi_lon(sh):
    """chỉ giữ khối điểm đục lớn nhất (nối 8 hướng): bỏ điểm quầng / bụi lẻ ngoài khung và điểm lòng còn sót. Trả về số điểm bỏ."""
    from scipy import ndimage
    nh, n = ndimage.label(sh[..., 3] > 0, np.ones((3, 3)))
    if n <= 1: return 0
    co = ndimage.sum(np.ones(nh.shape), nh, range(1, n + 1)); k = int(np.argmax(co)) + 1
    bo = (nh > 0) & (nh != k); sh[bo] = 0
    # gai lẻ: điểm đục chỉ có <= 1 láng giềng đục (4 hướng) -> bỏ (vụn quầng)
    op = sh[..., 3] > 0; p = np.pad(op, 1)
    lg = p[:-2, 1:-1].astype(int) + p[2:, 1:-1] + p[1:-1, :-2] + p[1:-1, 2:]
    gai = op & (lg <= 1); sh[gai] = 0
    return int(bo.sum() + gai.sum())


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


def ghi(ma, ten, a, rong, cao, vien, so_mau=64, them=None, long=False, sh=None, bui=False):
    if sh is None: sh = thu(a, rong * N, cao * N)
    ep = khu_xanh_sau(sh)
    ml = duc_long(sh) if long else None
    bot = giu_khoi_lon(sh)
    if bui:  # vụn quầng: điểm đục có <= 2 láng giềng đục (8 hướng), lặp 2 lượt
        for _ in range(2):
            op = sh[..., 3] > 0; p = np.pad(op, 1).astype(int)
            lg = sum(p[1 + dy:p.shape[0] - 1 + dy, 1 + dx:p.shape[1] - 1 + dx] for dy in (-1, 0, 1) for dx in (-1, 0, 1) if dy or dx)
            v = op & (lg <= 2); sh[v] = 0; bot += int(v.sum())
    data, sh = png(sh, so_mau)
    assert khu_xanh_sau(sh.copy()) == 0
    t = {'loai': 'linh-khi-sprite', 'phien_ban': 1, 'ma': ma, 'ten': ten, 'doi_tuong': 'giao-dien', 'rong': rong, 'cao': cao, 'net': N}
    if vien: t['vien'] = vien
    if them: t.update(them)
    t['anh'] = 'data:image/png;base64,' + base64.b64encode(data).decode()
    Image.fromarray(sh).save(os.path.join(RA, ma + '.png'))
    ra = os.path.join(DAY, 'game/art/custom', ma + '.sprite.json') if GHI else os.path.join(RA, ma + '.sprite.json')
    json.dump(t, open(ra, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    KQ[ma] = os.path.getsize(ra)
    print('%-22s %3dx%-3d vien=%-16s %6d byte  ép xanh sau thu: %d  bỏ điểm lẻ: %d%s' % (ma, rong, cao, vien, os.path.getsize(ra), ep, bot, ('  lòng ' + ml) if ml else ''))
    return sh


# 1) khung-nho -> gd-khung-nho (T.plate): khung 1161 x 354, thu 0,055 -> 64 x 19; góc (núm + móc) ~95 điểm gốc -> 5
a = cat(doc('khung-nho.png')); s = 0.055
ghi('gd-khung-nho', 'Khung nhỏ HUD (núm đồng, móc góc)', a, round(a.shape[1] * s), round(a.shape[0] * s), [5, 5, 5, 5], 48, long=True)

# 2) dai-thong-bao -> gd-dai-thong-bao (T.toast): cao 18 (như dải code); 2 đầu nhọn ~215 điểm gốc -> 11; giữa lặp (hoa văn không dãn)
a = cat(doc('dai-thong-bao.png')); s = 18 / a.shape[0]
ghi('gd-dai-thong-bao', 'Dải thông báo (2 đầu nhọn)', a, round(a.shape[1] * s), 18, [0, 11, 0, 11], 64, {'lap_canh': True})

# 3) o-con-2-trang-thai -> gd-o-con (trái) + gd-o-con-chon (phải, có quầng vàng; cùng tỉ lệ thu nên to hơn: game đặt tràn ra quầng)
a = doc('o-con-2-trang-thai.png'); W = a.shape[1]
t0 = cat(a, (0, 0, W // 2, a.shape[0])); t1 = cat(a, (W // 2, 0, W, a.shape[0]))
s = 34 / t0.shape[1]
ghi('gd-o-con', 'Ô con trong bảng (thường)', t0, 34, round(t0.shape[0] * s), [5, 5, 5, 5], 48, long=True)
rc, cc = round(t1.shape[1] * s), round(t1.shape[0] * s)
ghi('gd-o-con-chon', 'Ô con trong bảng (đang chọn, quầng vàng)', t1, rc, cc, [6, 6, 6, 6], 48, long=True, bui=True)
print('   quầng ô chọn tràn ra ngoài ô thường: %.2f x %.2f điểm game mỗi bên' % ((rc - 34) / 2, (cc - round(t0.shape[0] * s)) / 2))

# 4) the-nho -> gd-the-nho (chip kháng / yếu): cao 10 như chip code; đầu bo ~48 điểm gốc -> 3; màu trắng, game nhuộm theo màu chip
a = cat(doc('the-nho.png')); s = 10 / a.shape[0]
ghi('gd-the-nho', 'Thẻ nhỏ trắng (game nhuộm màu)', a, round(a.shape[1] * s), 10, [0, 3, 0, 3], 32)

# 5) khung-vach-lk -> gd-khung-vach-lk (vỏ vạch linh khí) + gd-khung-vach-lk-moc (một vạch mốc)
#    Vỏ = đầu trái + đoạn TRƠN giữa hai vạch + đầu phải (bỏ 3 vạch: game đặt vạch theo mốc thật). Lòng vạch 4 điểm game <-> rãnh ~115 điểm gốc.
a = cat(doc('khung-vach-lk.png')); Hh, Ww = a.shape[:2]
cot = (a[..., 3] > 0).sum(0)            # cột có vạch cao hơn thân
than = int(np.median(cot)); vach = np.nonzero(cot > than + 4)[0]
nhom = np.split(vach, np.nonzero(np.diff(vach) > 3)[0] + 1)
print('   vạch mốc ở cột', [(int(v[0]), int(v[-1])) for v in nhom], 'thân cao', than, 'cả cao', Hh)
v0 = nhom[0]; x0, x1 = int(v0[0]) - 6, int(v0[-1]) + 7
dau = 200
tron = a[:, nhom[0][-1] + 20: nhom[1][0] - 20]
b = np.concatenate([a[:, :dau], tron, a[:, Ww - dau:]], 1)
s = 6.5 / Hh
ghi('gd-khung-vach-lk', 'Vỏ vạch linh khí (không vạch mốc)', b, round(b.shape[1] * s), 7, [0, 4, 0, 4], 48, {'lap_canh': True})
m = a[:, x0:x1].copy()
lum = m[..., :3].astype(int) @ np.array([299, 587, 114]) // 1000
m[(lum < 70) & (np.arange(m.shape[0])[:, None] > m.shape[0] * 0.25)] = 0  # rãnh tối dưới đầu vạch: trong suốt
ghi('gd-khung-vach-lk-moc', 'Vạch mốc linh khí', m, 2, 7, None, 16)

# 6) thanh-cuon -> gd-thanh-cuon (rãnh, 3 mảnh dọc) + gd-thanh-cuon-num (nút, 3 mảnh dọc); rộng 3 điểm game như thanh code
a = doc('thanh-cuon.png'); W = a.shape[1]
xs = np.nonzero((a[..., 3] > 0).any(0))[0]; doan = np.split(xs, np.nonzero(np.diff(xs) > 3)[0] + 1)
r0 = cat(a, (int(doan[0][0]), 0, int(doan[0][-1]) + 1, a.shape[0])); r1 = cat(a, (int(doan[1][0]), 0, int(doan[1][-1]) + 1, a.shape[0]))
s = 4 / r0.shape[1]
ghi('gd-thanh-cuon', 'Rãnh thanh cuộn', r0, 4, round(r0.shape[0] * s), [3, 0, 3, 0], 32)
ghi('gd-thanh-cuon-num', 'Nút thanh cuộn', r1, 3, round(r1.shape[0] * 3 / r1.shape[1]), [2, 0, 2, 0], 24)

# 7) khung-canh-bao -> gd-khung-canh-bao (hộp cảnh báo đỏ ép đồ, cao 36): góc mặt trời ~120 điểm gốc -> 5 (chữ trong hộp bắt đầu cách mép 4); cạnh lặp
a = cat(doc('khung-canh-bao.png')); s = 0.042
ghi('gd-khung-canh-bao', 'Khung cảnh báo đỏ (mặt trời góc)', a, round(a.shape[1] * s), round(a.shape[0] * s), [5, 5, 5, 5], 64, {'lap_canh': True})

# 8) the-sap-co-b (gọn, hợp ô 32 x 10 trên bản đồ) -> gd-the-sap-co: chỉ lấy TẤM GỖ (bỏ vòng treo: vòng đè lên tên vùng ngay trên)
a = cat(doc('the-sap-co-b.png'))
hang = (a[..., 3] > 0).sum(1); rong_tam = hang.max()
y0 = int(np.nonzero(hang > rong_tam * 0.8)[0][0])
tam = cat(a, (0, max(0, y0 - 4), a.shape[1], a.shape[0]))
ghi('gd-the-sap-co', 'Thẻ "Sắp có" (tấm gỗ)', tam, 32, 10, [0, 4, 0, 4], 48)

# 9) khung-mau-quai -> gd-khung-mau-quai (thanh máu nhỏ quái): rãnh 2 điểm game, đầu mút đơn giản hoá (núm 2 điểm)
a = cat(doc('khung-mau-quai.png')); Hh, Ww = a.shape[:2]
cot = (a[..., 3] > 0).sum(0); than = int(np.median(cot))
to = np.nonzero(cot[:Ww // 2] > than + 4)[0]; dau = int(to[np.nonzero(np.diff(to) > 3)[0][0]] if (np.diff(to) > 3).any() else to[-1]) + 1  # hết núm trái
print('   máu quái: thân cao', than, 'núm rộng', dau, 'cả cao', Hh)
# rút gọn: núm co về đúng chiều cao thân (đầu mút đơn giản), thân giữ
nl = np.array(Image.fromarray(a[:, :dau]).resize((max(1, round(dau * than / Hh)), than), Image.BOX))
nr = np.array(Image.fromarray(a[:, Ww - dau:]).resize((nl.shape[1], than), Image.BOX))
ys = np.nonzero((a[:, Ww // 2, 3] > 0))[0]; th = a[ys[0]:ys[-1] + 1, dau:Ww - dau]
b = np.concatenate([nl, np.array(Image.fromarray(th).resize((th.shape[1], than), Image.BOX)), nr], 1)
s = 4 / b.shape[0]
ghi('gd-khung-mau-quai', 'Thanh máu nhỏ quái (đầu mút gọn)', b, round(b.shape[1] * s), 4, [0, 2, 0, 2], 32)

print('Tổng', sum(KQ.values()), 'byte')
