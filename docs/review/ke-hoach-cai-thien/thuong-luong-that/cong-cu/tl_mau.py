"""Đổi màu khung Thuồng Luồng giữa các pha (Độc ↔ Băng ↔ Lửa) — dùng cho hàng CHƯA CÓ ẢNH của một pha (chỉ là chỗ tạm):
  - pha 1 báo đòn / đánh (chờ gop-p1-a.png): lấy hàng pha 2 đổi về màu Độc;
  - pha 2 / pha 3 lặn (die): lấy hàng lặn pha 1 đổi sang màu Băng / Lửa.
Cách làm (không vẽ thêm gì, chỉ đổi màu điểm ảnh có sẵn): ba pha là CÙNG một con, cùng dáng → đặt khung đứng của pha nguồn chồng lên khung
đứng của pha đích (dò độ dời cho mặt nạ trùng nhất, cùng chiều cao), lấy các cặp màu (nguồn, đích) ở chỗ cả hai cùng có hình. Gom màu nguồn thành
K nhóm (k-means trong Lab); mỗi nhóm → trung vị màu đích của các cặp. Đổi màu: điểm ảnh nguồn lấy màu đích của nhóm gần nhất, cộng thêm phần
lệch sáng / tối của chính nó so với tâm nhóm (giữ chi tiết vảy, nét). Mắt lam sáng (#5FF0FF): điểm ảnh nguồn rất sáng ngả lam ở vùng đầu
giữ nguyên màu (cả ba pha mắt đều lam).
"""
import numpy as np
import cv2

K = 40


def lab(rgb):
    return cv2.cvtColor(np.ascontiguousarray(rgb.reshape(-1, 1, 3).astype(np.uint8)), cv2.COLOR_RGB2LAB).reshape(-1, 3).astype(np.float32)


def rgb_cua(L):
    return cv2.cvtColor(np.clip(L, 0, 255).astype(np.uint8).reshape(-1, 1, 3), cv2.COLOR_LAB2RGB).reshape(-1, 3)


def chong(S, D):
    """S, D: RGBA (cỡ gốc). Đưa S về chiều cao của D rồi dò độ dời (dx, dy) cho mặt nạ trùng nhất. Trả các cặp màu (n×3, n×3)."""
    h = D.shape[0]; z = h / S.shape[0]
    S2 = cv2.resize(S, (max(1, round(S.shape[1] * z)), h), interpolation=cv2.INTER_NEAREST)
    ms, md = (S2[..., 3] > 128).astype(np.float32), (D[..., 3] > 128).astype(np.float32)
    H = max(ms.shape[0], md.shape[0]) + 80; W = max(ms.shape[1], md.shape[1]) + 160
    A = np.zeros((H, W), np.float32); B = np.zeros((H, W), np.float32)
    A[40:40 + ms.shape[0], 80:80 + ms.shape[1]] = ms; B[40:40 + md.shape[0], 80:80 + md.shape[1]] = md
    def trung(dx, dy):  # độ trùng mặt nạ với độ dời (dx, dy): điểm D(y, x) ↔ S(y + dy, x + dx) (A, B có lề 40 / 80 nên |dx| ≤ 80, |dy| ≤ 40)
        M = A[max(0, dy):H + min(0, dy), max(0, dx):W + min(0, dx)]
        N = B[max(0, -dy):H - max(0, dy), max(0, -dx):W - max(0, dx)]
        return float((M * N).sum())
    dx, dy = max(((i, j) for i in range(-60, 61, 4) for j in range(-36, 37, 4)), key=lambda d: trung(*d))
    dx, dy = max(((dx + i, dy + j) for i in range(-4, 5) for j in range(-4, 5)), key=lambda d: trung(*d))
    cs, cd = [], []
    for y in range(md.shape[0]):
        ys = y + dy
        if ys < 0 or ys >= ms.shape[0]: continue
        xs = np.arange(md.shape[1]) + dx
        ok = (xs >= 0) & (xs < ms.shape[1])
        xd = np.nonzero(ok)[0]; xs = xs[ok]
        both = (md[y, xd] > 0) & (ms[ys, xs] > 0)
        cs.append(S2[ys, xs[both], :3]); cd.append(D[y, xd[both], :3])
    return np.concatenate(cs), np.concatenate(cd)


class DoiMau:
    def __init__(self, cap_khung):
        """cap_khung: [(khung nguồn RGBA, khung đích RGBA)] cùng dáng (khung đứng / bơi của hai pha)."""
        cs, cd = zip(*[chong(s, d) for s, d in cap_khung])
        cs, cd = np.concatenate(cs), np.concatenate(cd)
        Ls, Ld = lab(cs), lab(cd)
        crit = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 40, 0.5)
        _, nhan, tam = cv2.kmeans(Ls, K, None, crit, 3, cv2.KMEANS_PP_CENTERS)
        nhan = nhan.ravel()
        self.tam = tam
        self.dich = np.array([np.median(Ld[nhan == k], 0) if (nhan == k).sum() >= 8 else tam[k] for k in range(K)], np.float32)
        self.so_cap = len(cs)

    def doi(self, rgba, giu_mat=True):
        a = rgba.copy(); op = a[..., 3] > 0
        px = a[op][:, :3]; L = lab(px)
        d = ((L[:, None, :] - self.tam[None, :, :]) ** 2).sum(-1); k = d.argmin(1)
        moi = self.dich[k] + (L - self.tam[k]) * np.array([1.0, 0.5, 0.5], np.float32)
        out = rgb_cua(moi)
        if giu_mat:  # mắt lam sáng: giữ (chỉ nửa trên khung — dưới là bọt nước)
            r, g, b = px[:, 0].astype(int), px[:, 1].astype(int), px[:, 2].astype(int)
            ys = np.nonzero(op)[0]
            mat = (b > 200) & (g > 190) & (r < 150) & (ys < 0.45 * a.shape[0])
            out[mat] = px[mat]
        a[op, :3] = out
        return a


# ---------- cách 2 (đang dùng): đổi màu THEO LỚP ----------
# Mỗi pha chia điểm ảnh thân thành lớp: 'trong' (mảnh trống đồng: nâu cam), 'mat' (mắt lam sáng, nửa trên), 'nuoc' (bọt nước dưới chân),
# 'bung' (bụng / giác xúc tu: nhạt, ít màu), 'nhan' (màu nhấn: Độc = tím, Băng = lam sáng, Lửa = đỏ cam), 'nen' (vảy tối còn lại).
# Lớp 'trong', 'mat', 'nuoc' giữ nguyên (ba pha giống nhau). 'bung', 'nhan', 'nen': độ sáng ánh xạ theo phân vị (phân bố sáng của lớp đó ở
# pha nguồn → pha đích), sắc màu (a*, b*) lấy trung vị lớp đó ở pha đích + 30 % độ lệch của chính điểm ảnh (giữ vân vảy).
def lop(rgba, pha):
    op = rgba[..., 3] > 0
    px = rgba[op][:, :3]; L = lab(px)
    Lc, A, B = L[:, 0] * 100 / 255, L[:, 1] - 128, L[:, 2] - 128
    ys = np.nonzero(op)[0] / rgba.shape[0]
    r, g, b = px[:, 0].astype(int), px[:, 1].astype(int), px[:, 2].astype(int)
    sat = np.hypot(A, B)
    out = np.full(len(px), 'nen', dtype=object)
    nhan = {1: (A > 14) & (B < 2), 2: (Lc > 55) & (B < -9), 3: (A > 22) & (B > 12)}[pha]
    out[nhan] = 'nhan'
    out[((sat < 14) & (Lc > 55)) | ((Lc > 65) & (B >= -9) & (B < 8) & (A < 0))] = 'bung'   # bụng Băng ngả lục lam nhạt (B ≥ −9), vây lam đậm hơn
    out[(ys > 0.86) & (b > g - 30) & (b > 90)] = 'nuoc'
    if pha != 3: out[(A > 4) & (B > 18) & (ys < 0.5)] = 'trong'
    out[(b > 200) & (g > 190) & (r < 150) & (ys < 0.45)] = 'mat'
    return op, px, L, out


class DoiMauLop:
    LOP = ('bung', 'nhan', 'nen')

    def __init__(self, nguon, dich, pha_nguon, pha_dich):
        """nguon, dich: danh sách khung RGBA (đứng / bơi) của pha nguồn, pha đích."""
        self.pn, self.pd = pha_nguon, pha_dich
        def gom(ds, pha):
            c = {k: [] for k in self.LOP}
            for f in ds:
                _, _, L, o = lop(f, pha)
                for k in self.LOP: c[k].append(L[o == k])
            return {k: np.concatenate(v) for k, v in c.items()}
        self.S, self.D = gom(nguon, pha_nguon), gom(dich, pha_dich)
        self.q = np.linspace(0, 100, 101)
        self.bang = {k: (np.percentile(self.S[k][:, 0], self.q), np.percentile(self.D[k][:, 0], self.q),
                         np.median(self.S[k][:, 1:], 0), np.median(self.D[k][:, 1:], 0)) for k in self.LOP}

    def doi(self, rgba):
        a = rgba.copy()
        op, px, L, o = lop(a, self.pn)
        moi = L.copy()
        for k in self.LOP:
            m = o == k
            if not m.any(): continue
            qs, qd, ms, md = self.bang[k]
            moi[m, 0] = np.interp(L[m, 0], qs, qd)
            moi[m, 1:] = md + (L[m, 1:] - ms) * 0.3
        a[op, :3] = rgb_cua(moi)
        return a
