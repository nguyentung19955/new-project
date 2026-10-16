"""THU NHỎ ẢNH AI KIỂU ĐIỂM ẢNH (do-net 17/10) — thay cho Image.BOX / LANCZOS (lấy trung bình → nhoè, viền alpha lửng).

thu(a, W, H): a = RGBA uint8 (ảnh AI to), ra W×H RGBA:
  - alpha: phủ ≥ 50% vùng gốc → đục 255, không thì 0 (không còn viền lửng).
  - màu: mỗi điểm mới lấy MỘT màu CÓ THẬT trong vùng gốc của nó (không pha): màu xuất hiện nhiều nhất (gộp màu gần nhau 5 bit/kênh,
    như chế độ "Sắc nét" của tools/tach-quai — cách đã cho heoCon nét); nếu trong vùng có nét TỐI rõ rệt (độ sáng thấp hơn ≥ 45 so với
    màu nhiều nhất) chiếm ≥ 30% vùng thì lấy nét tối đó → nét viền / tóc / mắt mỏng không bị mất.
  - viền 1 điểm ảnh: điểm đục giáp nền trong suốt lấy màu tối nhất trong vùng gốc nếu màu đó tối hơn ≥ 30 → mép hình sắc như heoCon.
giam_mau(a, n): giảm màu chung cả tấm (median cut, không chấm nhiễu), alpha giữ 0/255.
png_bang_mau(a): PNG bảng màu 8 bit nhỏ nhất (như dung-luong-16-10/cong-cu/nen.py)."""
import io
import numpy as np
from PIL import Image

DEN = 45      # nét tối: tối hơn màu nhiều nhất bao nhiêu (độ sáng 0..255)
DEN_TL = 0.30  # và chiếm ít nhất bao nhiêu vùng
CACH = 'gan_tb'  # 'nhieu' (màu nhiều nhất), 'gan_tb' (màu có thật gần trung bình), 'lai'
LECH = 60
VIEN = 30     # viền: màu tối nhất tối hơn màu đã chọn bao nhiêu thì lấy


def _cua_so(n_in, n_out):
    """mỗi điểm ra: chỉ số điểm gốc trong vùng [i*s, (i+1)*s) (theo tâm điểm), độ phủ; trả (idx n_out×K, w n_out×K)"""
    s = n_in / n_out
    K = int(np.ceil(s)) + 1
    i0 = np.floor(np.arange(n_out) * s).astype(int)
    idx = i0[:, None] + np.arange(K)[None, :]
    a = np.arange(n_out)[:, None] * s
    b = a + s
    w = np.clip(np.minimum(b, idx + 1) - np.maximum(a, idx), 0, 1)
    idx = np.clip(idx, 0, n_in - 1)
    return idx, w


def thu(a, W, H):
    a = np.asarray(a)
    if a.ndim != 3 or a.shape[2] != 4:
        a = np.asarray(Image.fromarray(a).convert('RGBA'))
    mx = int(a[..., 3].max())
    if 0 < mx < 230:  # khung đang mờ dần: đưa alpha về đủ đậm (như dung-quai-moi.thu)
        a = a.copy(); a[..., 3] = np.clip(a[..., 3].astype(np.float32) * (255.0 / mx), 0, 255).astype(np.uint8)
    hi, wi = a.shape[:2]
    iy, wy = _cua_so(hi, H)
    ix, wx = _cua_so(wi, W)
    out = np.zeros((H, W, 4), np.uint8)
    toi_v = np.zeros((H, W, 3), np.uint8); co_v = np.zeros((H, W), bool)  # màu tối nhất vùng gốc + có tối hơn rõ không (cho viền)
    # theo từng dải hàng để đỡ tốn bộ nhớ
    for y0 in range(0, H, 16):
        y1 = min(H, y0 + 16)
        P = a[iy[y0:y1][:, None, :, None], ix[None, :, None, :]]          # (h, W, Ky, Kx, 4)
        w = wy[y0:y1][:, None, :, None] * wx[None, :, None, :]            # (h, W, Ky, Kx)
        h_ = y1 - y0
        P = P.reshape(h_, W, -1, 4).astype(np.int32)
        w = np.broadcast_to(w, (h_, W) + w.shape[2:]).reshape(h_, W, -1)
        al = P[..., 3] / 255.0
        phu = (al * w).sum(-1) / np.maximum(w.sum(-1), 1e-6)
        dac = phu >= 0.5
        ok = (P[..., 3] >= 128) & (w > 0)
        wo = np.where(ok, w, 0.0)
        key = ((P[..., 0] >> 3) << 10) | ((P[..., 1] >> 3) << 5) | (P[..., 2] >> 3)
        key = np.where(ok, key, -1)
        # cân nặng mỗi màu (gộp 5 bit): so từng cặp trong vùng
        same = key[..., :, None] == key[..., None, :]
        dem = (same * wo[..., None, :]).sum(-1)                              # (h, W, K): tổng phủ của màu điểm k
        dem = np.where(ok, dem, -1)
        L = P[..., 0] * 0.299 + P[..., 1] * 0.587 + P[..., 2] * 0.114
        k_mode = dem.argmax(-1)
        Lm = np.take_along_axis(L, k_mode[..., None], -1)[..., 0]
        tong = np.maximum(wo.sum(-1), 1e-6)
        # nét tối chiếm đủ nhiều: điểm tối có cân nặng lớn nhất trong nhóm tối
        toi = ok & (L <= Lm[..., None] - DEN)
        dem_toi = (wo * toi).sum(-1) / tong
        dem2 = np.where(toi, dem, -1)
        k_toi = dem2.argmax(-1)
        k = np.where(dem_toi >= DEN_TL, k_toi, k_mode)
        if CACH == 'gan_tb':  # màu có thật gần màu trung bình nhất (giữ độ sáng chung như BOX, không pha màu)
            mtb = (P[..., :3] * wo[..., None]).sum(-2) / tong[..., None]
            d2 = ((P[..., :3] - mtb[..., None, :]) ** 2).sum(-1) + np.where(ok, 0, 1e9)
            k = d2.argmin(-1)
        elif CACH == 'lai':  # màu nhiều nhất, nhưng nếu nó lệch xa màu trung bình (> LECH) thì lấy màu có thật gần trung bình nhất
            mtb = (P[..., :3] * wo[..., None]).sum(-2) / tong[..., None]
            d2 = ((P[..., :3] - mtb[..., None, :]) ** 2).sum(-1) + np.where(ok, 0, 1e9)
            kg = d2.argmin(-1)
            dm = np.sqrt(np.take_along_axis(d2, k[..., None], -1)[..., 0])
            k = np.where(dm > LECH, kg, k)
        # viền: điểm đục giáp nền → màu tối nhất (nếu tối hơn rõ)
        Lt = np.where(ok, L, 1e9)
        k_dark = Lt.argmin(-1)
        Ld = np.take_along_axis(L, k_dark[..., None], -1)[..., 0]
        Lk = np.take_along_axis(L, k[..., None], -1)[..., 0]
        col = np.take_along_axis(P[..., :3], k[..., None, None].repeat(3, -1), -2)[..., 0, :]
        cold = np.take_along_axis(P[..., :3], k_dark[..., None, None].repeat(3, -1), -2)[..., 0, :]
        out[y0:y1, :, :3] = col
        out[y0:y1, :, 3] = np.where(dac & ok.any(-1), 255, 0)
        toi_v[y0:y1] = cold; co_v[y0:y1] = Lk - Ld >= VIEN
    A = out[..., 3] > 0
    pad = np.pad(A, 1)
    bien = A & ~(pad[:-2, 1:-1] & pad[2:, 1:-1] & pad[1:-1, :-2] & pad[1:-1, 2:])
    m = bien & co_v
    out[m, :3] = toi_v[m]
    out[~A] = 0
    return out


def giam_mau(a, n=96):
    """giảm màu cả tấm (chỉ điểm đục), không chấm nhiễu; trả RGBA (alpha 0/255)."""
    a = np.asarray(a).copy()
    op = a[..., 3] > 0
    px = a[op][:, :3]
    u = np.unique(px.view(np.dtype((np.void, 3))))
    if len(u) > n:
        q = Image.fromarray(px.reshape(1, -1, 3)).quantize(colors=n, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
        pal = np.array(q.getpalette()[:3 * n]).reshape(-1, 3)
        a[op, :3] = pal[np.array(q).ravel()]
    a[op, 3] = 255
    a[~op] = 0
    return a


def png_bang_mau(a):
    import struct, zlib
    a = np.asarray(a)
    H, W = a.shape[:2]
    flat = a.reshape(-1, 4)
    u, inv = np.unique(flat.view(np.uint32).ravel(), return_inverse=True)
    assert len(u) <= 256, len(u)
    cols = u.view(np.uint8).reshape(-1, 4)
    order = np.array(sorted(range(len(u)), key=lambda i: (cols[i, 3] == 255, cols[i, 0] * 0.3 + cols[i, 1] * 0.59 + cols[i, 2] * 0.11)))
    rank = np.empty(len(u), np.int64); rank[order] = np.arange(len(u))
    idx = rank[inv].reshape(H, W).astype(np.uint8)
    pal = cols[order]

    def chunk(ty, data):
        return struct.pack('>I', len(data)) + ty + data + struct.pack('>I', zlib.crc32(ty + data) & 0xffffffff)
    best = None
    for filt in (0, 1, 2, 4):
        rows = []
        prev = np.zeros(W, np.int16)
        for y in range(H):
            r = idx[y].astype(np.int16)
            if filt == 0: f = r
            elif filt == 1: f = (r - np.concatenate([[0], r[:-1]])) % 256
            elif filt == 2: f = (r - prev) % 256
            else:
                # Paeth
                aa = np.concatenate([[0], r[:-1]]); bb = prev; cc = np.concatenate([[0], prev[:-1]])
                p = aa + bb - cc; pa, pb, pc = abs(p - aa), abs(p - bb), abs(p - cc)
                pr = np.where((pa <= pb) & (pa <= pc), aa, np.where(pb <= pc, bb, cc))
                # Paeth cần giá trị đã giải mã của các điểm trước — với bộ lọc trên chỉ số gốc thì aa/bb/cc là gốc: đúng
                f = (r - pr) % 256
            rows.append(bytes([filt]) + f.astype(np.uint8).tobytes())
            prev = r
        z = zlib.compress(b''.join(rows), 9)
        if best is None or len(z) < len(best):
            best = z
    al = [int(v) for v in pal[:, 3]]
    while al and al[-1] == 255:
        al.pop()
    out = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', W, H, 8, 3, 0, 0, 0)) + chunk(b'PLTE', bytes(pal[:, :3].astype(np.uint8).ravel().tolist()))
    if al:
        out += chunk(b'tRNS', bytes(al))
    out += chunk(b'IDAT', best) + chunk(b'IEND', b'')
    chk = np.array(Image.open(io.BytesIO(out)).convert('RGBA'))
    chk[chk[..., 3] == 0] = 0
    b = a.copy(); b[b[..., 3] == 0] = 0
    assert (chk == b).all(), 'PNG bảng màu không khớp'
    return out
