"""Mảng rễ trang trí (nguon-v2/rong-re.png) và tiền cảnh rễ treo (nguon-v2/tien-canh.png) – cả hai ảnh gen nền trắng.

MẢNG RỄ → gach/rong-re.png (256×256 = 128×128 logic, 2x), phủ lên mảng đất gỗ rộng (game tự đặt ở vài chỗ cố định):
  • tách nền trắng + khử viền trắng; thu về vừa khung 256 (cạnh dài);
  • làm tối 0,78 + giảm bão hoà cho chìm vào thân gỗ (rễ trong đất, không phải vật nổi phía trước);
  • nét ngoài: đổi nét gen (mảnh, sẽ mất khi thu nhỏ) thành nét nâu-sẫm ~1,5 px (2x) cùng tông tối nhất của thân → đọc như
    rễ nổi trên thân, không đen như viền cạnh lộ;
  • phần gốc rễ bị cắt phẳng ở mép trên-trái: mờ dần lên trên (16 px) → như rễ chui ra từ dưới mặt đất.

TIỀN CẢNH → nen/lang-tien-canh.png (3840×1080 = 1920×540 logic, giữ cỡ cũ → game không phải đổi):
  • tách 3 cụm rễ (thành phần liên thông) khỏi nền trắng;
  • thu sao cho đầu rễ thấp nhất ≤ 36 % chiều cao màn (≈ 195 logic; Lam đứng sàn có đỉnh đầu ≈ 336 logic → không bị che);
  • đặt 3 cụm thưa trên bề rộng 3840 (cụm giữa lật ngang cho đỡ giống), cụm sát mép trên (y = 0); không cụm nào chạm mép
    trái/phải ảnh → lặp ngang liền tự nhiên;
  • làm tối hợp lớp gần: tối 0,70, giảm bão hoà 0,55 (giữ chút viền sáng xanh lam), đầu rễ mờ nhẹ ở 15 % cuối."""
import numpy as np
import scipy.ndimage as nd

from chung import GACH, NEN, doc_rgb, doi_co, khu_vien_trang, luu_png, nen_trang

CO_RE = 256
MAU_NET = np.array([58, 37, 25.0])


def _tach(ten):
    a = doc_rgb(ten)
    bg = nen_trang(a)
    fg = ~bg
    lab, n = nd.label(fg)
    if n > 1:                                         # bỏ hạt bụi
        sz = nd.sum(fg, lab, range(1, n + 1))
        for i, s in enumerate(sz):
            if s < 200:
                fg[lab == i + 1] = False
    return khu_vien_trang(a, fg), fg


def _chinh(rgb, sang, bh):
    L = (rgb @ np.array([0.299, 0.587, 0.114]))[..., None]
    return np.clip((L + (rgb - L) * bh) * sang, 0, 255)


def rong_re():
    o, fg = _tach('rong-re.png')
    ys, xs = np.nonzero(fg)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    o = o[y0:y1, x0:x1].astype(np.float64)
    # gốc cắt phẳng (mép trên): mờ dần lên trên trong 70 px ảnh gen (≈ 15 px ở 2x)
    yy = np.arange(o.shape[0])[:, None]
    o[..., 3] *= np.clip((yy - 4) / 90, 0, 1) ** 1.5
    h, w = o.shape[:2]
    k = CO_RE / max(h, w)
    W, H = round(w * k), round(h * k)
    r = doi_co(o.round().astype(np.uint8), W, H).astype(np.float64)
    r[..., :3] = _chinh(r[..., :3], 0.78, 0.95)
    # nét ngoài nâu sẫm ~1,5 px (2x): vùng trong suốt sát rễ
    a = r[..., 3] / 255
    dac = a > 0.5
    d_ngoai = nd.distance_transform_edt(~dac)
    d_trong = nd.distance_transform_edt(dac)
    tren = (np.arange(H) < 22)[:, None]             # không vẽ nét ở chỗ gốc cắt (đang mờ dần)
    net = (d_trong <= 1.5) & dac & ~tren
    r[net, :3] = r[net, :3] * 0.35 + MAU_NET * 0.65
    vien = (~dac) & (d_ngoai <= 1.2) & ~tren
    giu_a = r[..., 3].copy()
    r[vien, :3] = MAU_NET
    r[vien, 3] = np.maximum(giu_a[vien], 255 * np.clip(1.6 - d_ngoai[vien], 0, 1))
    out = np.zeros((CO_RE, CO_RE, 4))
    out[:H, :W] = r
    out[out[..., 3] < 2] = 0
    out = np.round(out).astype(np.uint8)
    luu_png(out, f'{GACH}/rong-re.png')
    return out


def tien_canh(W2=3840, H2=1080, day_max=0.36):
    o, fg = _tach('tien-canh.png')
    lab, n = nd.label(o[..., 3] > 0)
    cum = []
    for i, s in enumerate(nd.find_objects(lab)):
        m = lab[s] == i + 1
        if m.sum() < 5000:
            continue
        c = o[s].astype(np.float64).copy()
        c[~nd.binary_dilation(m, iterations=2)] = 0
        cum.append((s[1].start, c))
    cum.sort(key=lambda t: t[0])
    cao_max = max(c.shape[0] for _, c in cum)
    k = day_max * H2 / cao_max
    out = np.zeros((H2, W2, 4))
    # vị trí (tâm x, px 2x) + lật: thưa, cụm to ở đầu, cụm lật ở giữa
    dat = [(430, False), (1720, True), (3060, False)]
    for (x_tam, lat), (_, c) in zip(dat, cum):
        h, w = c.shape[:2]
        r = doi_co(c.round().astype(np.uint8), round(w * k), round(h * k)).astype(np.float64)
        if lat:
            r = r[:, ::-1]
        r[..., :3] = _chinh(r[..., :3], 0.70, 0.55)
        yy = np.arange(r.shape[0])[:, None]
        r[..., 3] *= np.clip((r.shape[0] - yy) / (0.15 * r.shape[0]), 0.55, 1)
        x = int(x_tam - r.shape[1] / 2)
        v = out[:r.shape[0], x:x + r.shape[1]]
        al = r[..., 3:4] / 255
        v[..., :3] = r[..., :3] * al + v[..., :3] * (1 - al)
        v[..., 3] = np.maximum(v[..., 3], r[..., 3])
    out[out[..., 3] < 1] = 0
    out = np.round(out).astype(np.uint8)
    luu_png(out, f'{NEN}/lang-tien-canh.png')
    return out


def chay():
    r = rong_re()
    t = tien_canh()
    ys = np.nonzero(t[..., 3].any(1))[0]
    print('trang trí: rong-re', r.shape[1], '×', r.shape[0], '· tiền cảnh', t.shape[1], '×', t.shape[0],
          f'(rễ xuống tới {ys.max() / t.shape[0] * 100:.0f} % màn)')


if __name__ == '__main__':
    chay()
