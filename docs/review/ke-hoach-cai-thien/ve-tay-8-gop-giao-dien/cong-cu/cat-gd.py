#!/usr/bin/env python3
"""CẮT ẢNH GỘP VẼ TAY 8 (g1-giao-dien-nho, g6-o-lap hàng 1–3) + ICON PHÚC LÀNH (p1, p2) → game/art/custom/*.sprite.json

Phiên ve-tay-8-gop-giao-dien (16/10). Ảnh gốc: docs/anh-goc/ve-tay-8-gop/. Bảng hàng → mã: gen-gop/GEN-GOP.md; cỡ đích: con-ve-tay-8/KIEM-KE.md.
- Tách nền xanh #00FF00: vùng xanh NỐI với mép ảnh (không ăn vào màu xanh trong hình như cây tre, áo lá), điểm viền còn ám xanh thì khử ám.
- Hàng / mảnh: dò theo khe nền (hàng cách > 6 điểm ảnh, mảnh trong hàng cách > 6 điểm ảnh) — thứ tự trên → dưới, trái → phải như prompt.
- Thu nhỏ: NEAREST (lấy điểm giữa ô) về đúng cỡ đích (rong × cao điểm ảnh ảnh), "net" chọn sao cho cỡ game khớp hình code đang vẽ.
- Icon phúc lành: vừa khung vuông 90×90 (net 3 → 30×30 điểm game, đúng ô biểu tượng của thẻ), giữ tỉ lệ, NEAREST.
Chạy:  python3 docs/review/ke-hoach-cai-thien/ve-tay-8-gop-giao-dien/cong-cu/cat-gd.py   (ghi tệp + ảnh xem cong-cu/ra/)
"""
import base64, io, json, os
import numpy as np
from PIL import Image
from scipy import ndimage as nd

DAY = os.path.dirname(os.path.abspath(__file__))
GOC = os.path.abspath(os.path.join(DAY, '..', '..', '..', '..', '..'))
ANH = os.path.join(GOC, 'docs', 'anh-goc', 've-tay-8-gop')
RA_GAME = os.path.join(GOC, 'game', 'art', 'custom')
RA_XEM = os.path.join(DAY, 'ra')


def doc(ten):
    return np.array(Image.open(os.path.join(ANH, ten + '.png')).convert('RGB')).astype(int)


def nen_xanh(a):
    """Mặt nạ nền: điểm xanh lục nối với mép ảnh."""
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    xanh = (g > 150) & (g - np.maximum(r, b) > 90)
    lab, n = nd.label(xanh)
    mep = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    nen = np.isin(lab, list(mep))
    # lỗ nền kín trong hình (lòng nỏ, giữa sóng, bụng rồng...): mảng xanh THUẦN (#00FF00 ± nhiễu) đủ lớn — màu xanh của hình (tre, áo lá,
    # rắn) tối / ngả vàng hơn nhiều nên không dính
    thuan = (g > 200) & (r < 110) & (b < 110)
    lt, m = nd.label(thuan)
    if m:
        co = nd.sum(thuan, lt, range(1, m + 1))
        nen |= np.isin(lt, [i + 1 for i in range(m) if co[i] >= 40])
    return nen


def rgba(a, nen):
    """Ảnh RGBA: nền trong suốt; điểm sát nền còn ám xanh (g lớn hơn hẳn r, b) → khử ám (g kẹp về max(r, b)) hoặc bỏ nếu gần như xanh thuần."""
    out = np.zeros(a.shape[:2] + (4,), np.uint8)
    out[..., :3] = a
    out[..., 3] = np.where(nen, 0, 255)
    sat = nd.binary_dilation(nen, iterations=3) & ~nen
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    am = sat & (g - np.maximum(r, b) > 30)
    out[..., 1] = np.where(am, np.maximum(r, b), g)
    out[..., 3] = np.where(sat & (g > 140) & (g - np.maximum(r, b) > 70), 0, out[..., 3])
    return out


def dai(mask, truc, khe=6):
    idx = np.nonzero(mask.any(1 - truc))[0]
    ra, s, p = [], idx[0], idx[0]
    for v in idx[1:]:
        if v - p > khe:
            ra.append((s, p)); s = v
        p = v
    ra.append((s, p))
    return [q for q in ra if q[1] - q[0] > 3]


def manh(ten):
    """[[(x0, y0, x1, y1) mỗi mảnh] mỗi hàng] + ảnh RGBA."""
    a = doc(ten)
    nen = nen_xanh(a)
    fg = ~nen
    hang = []
    for y0, y1 in dai(fg, 0):
        hang.append([(x0, y0, x1 + 1, y1 + 1) for x0, x1 in dai(fg[y0:y1 + 1], 1)])
    return hang, rgba(a, nen)


def cat(img, box, chat=0):
    x0, y0, x1, y1 = box
    sub = img[y0:y1, x0:x1]
    al = sub[..., 3] > 0
    ys, xs = np.nonzero(al)
    sub = sub[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    if chat:
        sub = sub[chat:-chat, chat:-chat]
    return Image.fromarray(sub, 'RGBA')


def nn(im, w, h):
    """NEAREST lấy điểm giữa ô (PIL NEAREST lấy tâm ô), rồi làm alpha nhị phân (pixel art)."""
    o = np.array(im.resize((w, h), Image.NEAREST))
    o[..., 3] = np.where(o[..., 3] >= 128, 255, 0)
    return Image.fromarray(o, 'RGBA')


def vua_vuong(im, S):
    """Thu vừa ô vuông S×S, giữ tỉ lệ, đặt giữa."""
    k = S / max(im.width, im.height)
    w, h = max(1, round(im.width * k)), max(1, round(im.height * k))
    o = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    o.alpha_composite(nn(im, w, h), ((S - w) // 2, (S - h) // 2))
    return o


DA_GHI = []
LONG_THOAI = (252, 245, 231)  # #fcf5e7: lòng bong bóng thoại (game nhuộm lòng này khi nền vàng)


def phang(a):
    """Lòng bong bóng: gộp các điểm kem lệch nhiễu (±5) về một màu #fcf5e7 — lòng phẳng như prompt, để đo lòng
    (chu-lech-khung/do-long-khung.py) và nhuộm (SC.gdNhuom) ăn đều."""
    a = a.copy()
    d = np.abs(a[..., :3].astype(int) - LONG_THOAI).sum(-1)
    m = (a[..., 3] > 0) & (d < 40)
    a[m, :3] = LONG_THOAI
    return a


def ghi(ma, ten, im, net, vien=None, them=None):
    bio = io.BytesIO(); im.save(bio, 'PNG', optimize=True)
    d = {'loai': 'linh-khi-sprite', 'phien_ban': 1, 'ma': ma, 'ten': ten, 'doi_tuong': 'giao-dien',
         'rong': round(im.width / net), 'cao': round(im.height / net), 'net': net}
    if vien:
        d['vien'] = vien
    if them:
        d.update(them)
    d['anh'] = 'data:image/png;base64,' + base64.b64encode(bio.getvalue()).decode()
    with open(os.path.join(RA_GAME, ma + '.sprite.json'), 'w', encoding='utf-8') as f:
        json.dump(d, f, ensure_ascii=False, indent=1)
    DA_GHI.append((ma, im))
    print('%-28s %3d×%-3d net %d  %s' % (ma, im.width, im.height, net, ten))


def main():
    os.makedirs(RA_XEM, exist_ok=True)
    # ---------------- G1: 7 hàng ----------------
    h, img = manh('g1-giao-dien-nho')
    assert [len(r) for r in h] == [2, 3, 3, 3, 1, 1, 3], [len(r) for r in h]
    # 1 gd-cham-moi (2 khung; game dùng khung 1, chấm tĩnh như code) — 8×8, net 1 (chấm code đường kính 6 + viền)
    ghi('gd-cham-moi', 'Chấm đỏ báo có mới', nn(cat(img, h[0][0]), 8, 8), 1)
    # 2 gd-ban-do-cham: kem (đã mở) · vàng (chưa dùng) · xám (chưa mở) — 4×4, net 2 (chấm code 2×2)
    ghi('gd-ban-do-cham', 'Chấm đường bản đồ (đã mở)', nn(cat(img, h[1][0]), 4, 4), 2)
    ghi('gd-ban-do-cham-khoa', 'Chấm đường bản đồ (chưa mở)', nn(cat(img, h[1][2]), 4, 4), 2)
    # 3 gd-o-diem: vàng (đã học) · tối (chưa) · xám khoá (game không có trạng thái này) — 10×10, net 1 (ô code 9×8)
    ghi('gd-o-diem', 'Ô điểm kỹ năng (đã học)', nn(cat(img, h[2][0]), 10, 10), 1)
    ghi('gd-o-diem-trong', 'Ô điểm kỹ năng (chưa học)', nn(cat(img, h[2][1]), 10, 10), 1)
    # 4 gd-chuong-o: chấm bậc vàng / tối 8×6, vạch nối 2×6 — net 2 (code 4×3, 1×3)
    ghi('gd-chuong-o', 'Chấm bậc cây chưởng (đã học)', nn(cat(img, h[3][0]), 8, 6), 2)
    ghi('gd-chuong-o-trong', 'Chấm bậc cây chưởng (chưa học)', nn(cat(img, h[3][1]), 8, 6), 2)
    ghi('gd-chuong-o-noi', 'Vạch nối hàng cây chưởng', nn(cat(img, h[3][2]), 2, 6), 2)
    # 5 gd-bia-gach: gạch đồng, núm thoi ở đầu TRONG (ảnh: núm bên trái = gạch phải; gạch trái lật ngang) — 36×4, net 2 (code 18×1)
    # (lấy mẫu dọc theo hàng chọn: gạch chỉ dày ~1/5 ảnh, NEAREST đều 4 hàng rơi trúng viền đen trên / dưới → mất màu đồng. Chọn hàng
    # 0 = mũi trên núm thoi, 1–2 = giữa thân gạch đồng, 3 = mũi dưới núm; cột vẫn NEAREST đều)
    bg = np.array(cat(img, h[4][0])); Hb = bg.shape[0]
    ys = [round(Hb * 0.2), round(Hb * 0.47), round(Hb * 0.53), round(Hb * 0.8)]
    xs = [int((i + 0.5) * bg.shape[1] / 36) for i in range(36)]
    gg = bg[np.ix_(ys, xs)].copy(); gg[..., 3] = np.where(gg[..., 3] >= 128, 255, 0)
    ghi('gd-bia-gach', 'Gạch đồng bên chữ SPIRITBLADE', Image.fromarray(gg, 'RGBA'), 2)
    # 6 gd-bong-thoai: thân bo góc (9 mảnh) + đuôi nhọn riêng (game đặt đuôi đúng chỗ người nói, như code)
    bt = cat(img, h[5][0])
    a = np.array(bt)
    # đáy thân: hàng cuối mà bề rộng hình còn > 60% bề rộng ảnh
    rong = (a[..., 3] > 0).sum(1)
    y_than = int(np.nonzero(rong > 0.6 * bt.width)[0].max()) + 1
    k = 64 / bt.width
    than = nn(bt.crop((0, 0, bt.width, y_than)), 64, round(y_than * k))
    ta = np.array(than)
    # hàng đáy thân còn hở chỗ nối đuôi → tô kín bằng màu viền (đuôi vẽ riêng, đè lên chỗ này); nhớ chỗ hở để cắt đuôi
    day = ta[-1]
    ho = [x for x in range(ta.shape[1]) if day[x, 3] and day[x, :3].sum() > 300]
    vien = day[[x for x in range(ta.shape[1]) if day[x, 3] and day[x, :3].sum() <= 300][0]].copy()
    for x in ho:
        ta[-1, x] = vien
    ta = phang(ta)
    ghi('gd-bong-thoai', 'Bong bóng thoại (thân, 9 mảnh)', Image.fromarray(ta, 'RGBA'), 1, vien=[5, 5, 5, 5])
    # đuôi: hàng đáy thân (chỗ hở) + phần dưới; game đặt hàng đầu đè lên viền đáy thân
    duoi = nn(bt, 64, round(bt.height * k))
    da = np.array(duoi)[ta.shape[0] - 1:]
    x0, x1 = min(ho) - 1, max(ho) + 2
    ghi('gd-bong-thoai-duoi', 'Bong bóng thoại (đuôi)', Image.fromarray(phang(np.ascontiguousarray(da[:, x0:x1])), 'RGBA'), 1)
    # 7 gd-lang-thanh-duoi: dải tròn góc (9 mảnh, lòng 72% như code) + đĩa chân dung thường / chọn 22×22 — net 1
    bar = cat(img, h[6][0])
    kb = 34 / bar.height
    bi = np.array(nn(bar, round(bar.width * kb), 34))
    toi = (bi[..., 3] > 0) & (bi[..., :3].max(-1) < 60)
    lt, _ = nd.label(toi)
    long = lt == lt[bi.shape[0] // 2, bi.shape[1] // 2]  # lòng tối (#0a1616) nối với tâm (không gồm viền đen ngoài vành đồng) → 72% như code rgba(10,22,22,0.72)
    bi[..., 3] = np.where(long, 184, bi[..., 3])
    ghi('gd-lang-thanh-duoi', 'Dải chân dung NPC ở làng', Image.fromarray(bi, 'RGBA'), 1, vien=[15, 15, 15, 15])
    ghi('gd-lang-dia', 'Đĩa chân dung NPC', nn(cat(img, h[6][1]), 22, 22), 1)
    ghi('gd-lang-dia-chon', 'Đĩa chân dung NPC (đang chọn)', nn(cat(img, h[6][2]), 22, 22), 1)

    # ---------------- G6: hàng 1–3 ----------------
    h, img = manh('g6-o-lap')
    assert len(h) >= 3 and all(len(h[i]) == 1 for i in range(3)), [len(r) for r in h]
    # 1 gd-loi-mon-rung: ô lặp dọc 32×32, net 1 (nền phòng dựng ở cỡ game) — game lấy màu đất từ dải giữa ô (dai_dat)
    lm = nn(cat(img, h[0][0], chat=2), 32, 32)
    la = np.array(lm).astype(int)
    nau = (la[..., 0] - la[..., 1] > 15) & (la[..., 1] - la[..., 2] > 5) & (la[..., 0] > 90)  # đất nâu nhạt
    cot = nau.mean(0)
    xs = np.nonzero(cot > 0.75)[0]
    ghi('gd-loi-mon-rung', 'Lối mòn đất (rừng già)', lm, 1, them={'dai_dat': [int(xs.min()), int(xs.max()) + 1]})
    # 2 gd-tham-lau: thảm gen nằm ngang → xoay 90° (viền vàng hai bên), lặp dọc; rộng 44 net 2 = 22 điểm game như thảm code
    tl = cat(img, h[1][0], chat=2).transpose(Image.ROTATE_90)
    ghi('gd-tham-lau', 'Thảm đỏ viền vàng (lâu đài), lặp dọc', nn(tl, 44, round(tl.height * 44 / tl.width)), 2)
    # 3 gd-long-khung: lòng gỗ tối lặp hai chiều 32×32, net 2 (lót ô con)
    ghi('gd-long-khung', 'Lòng gỗ trong ô con', nn(cat(img, h[2][0], chat=2), 32, 32), 2)

    # ---------------- P1, P2: 14 icon phúc lành ----------------
    KHOA = ['guom', 'no', 'tre', 'riu', 'trong', 'ngua', 'nui', 'song', 'ca', 'ngan', 'than', 'hoa', 'noc', 'suong']
    TEN = ['Gươm Hồ Gươm', 'Nỏ thần Kim Quy', 'Gậy tre Thánh Gióng', 'Rìu Thạch Sanh', 'Trống đồng Đông Sơn', 'Ngựa sắt Thánh Gióng',
           'Sơn Tinh dời núi', 'Sóng Thủy Tinh', 'Cá chép Ông Táo', 'Áo lá Mẫu Thượng Ngàn', 'Than hồng Ông Táo',
           'Hỏa long Lạc Long Quân', 'Nọc Chằn tinh', 'Sương Mẫu Thoải']
    ds = []
    for t in ('p1-phuc-lanh', 'p2-phuc-lanh'):
        h, img = manh(t)
        assert len(h) == 1 and len(h[0]) == 7, (t, [len(r) for r in h])
        ds += [cat(img, b) for b in h[0]]
    for k, ten, im in zip(KHOA, TEN, ds):
        ghi('gd-phuc-lanh-' + k, 'Phúc lành: ' + ten, vua_vuong(im, 90), 3)

    # ảnh xem: mọi tệp, phóng ×4 trên nền tím
    W = sum(im.width * 4 + 12 for _, im in DA_GHI)
    cv = Image.new('RGBA', (min(W, 2400), 10), (0, 0, 0, 0))
    hang, x, y, hmax = [], 0, 0, 0
    for ma, im in DA_GHI:
        z = im.resize((im.width * 4, im.height * 4), Image.NEAREST)
        if x + z.width > 2400:
            x, y, hmax = 0, y + hmax + 12, 0
        hang.append((z, x, y)); x += z.width + 12; hmax = max(hmax, z.height)
    cv = Image.new('RGBA', (2400, y + hmax), (120, 40, 140, 255))
    for z, x, y in hang:
        cv.alpha_composite(z, (x, y))
    cv.save(os.path.join(RA_XEM, 'xem-tat-ca.png'))


if __name__ == '__main__':
    main()
