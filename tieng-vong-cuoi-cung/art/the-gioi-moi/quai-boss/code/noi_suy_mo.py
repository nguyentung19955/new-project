"""Nội suy theo thời gian cho clip KHÔNG lặp (đấm, trúng đòn, chết, đập, quét): Hermite bậc 3 qua mốc đặt tay.

Giống noi_suy.Kenh (rig-v2, cho clip lặp) nhưng hai đầu không nối vòng:
- Tiếp tuyến tự động kiểu Fritsch–Butland: mốc là cực trị → 0; đầu/cuối clip → 0 (vào/ra êm); còn lại trung bình
  điều hoà có trọng số → đơn điệu giữa hai mốc, KHÔNG vượt biên.
- Mốc có thể đặt tiếp tuyến bằng tay, MỘT PHÍA: (t, giá trị, (tiếp_tuyến_trái, tiếp_tuyến_phải)) – vd. rơi xuống
  đất: vận tốc lúc chạm = 2× vận tốc trung bình (như trọng lực) ở phía trái, phía phải = 0 (không xuyên đất).
  Tiếp tuyến ghi bằng giá trị / ms.
- Kênh 'bậc thang' (bat_thang=True): giữ giá trị mốc trước (dùng cho nháy trắng, bật/tắt mảnh).
kiem_vuot() kiểm bằng số rằng không đoạn nào vượt ra ngoài khoảng giá trị hai mốc của nó."""
import numpy as np


class KenhMo:
    def __init__(self, moc, ten='', bat_thang=False):
        moc = sorted([(float(m[0]), float(m[1]), (m[2] if len(m) > 2 else None)) for m in moc], key=lambda m: m[0])
        self.ten = ten
        self.bat_thang = bat_thang
        self.t = np.array([m[0] for m in moc])
        self.v = np.array([m[1] for m in moc])
        n = len(moc)
        mt, mp = np.zeros(n), np.zeros(n)
        for i in range(n):
            g = moc[i][2]
            if g is not None:
                if isinstance(g, (tuple, list)):
                    mt[i], mp[i] = g
                else:
                    mt[i] = mp[i] = g
                continue
            if i == 0 or i == n - 1:
                continue                                   # đầu/cuối: 0
            h0, h1 = self.t[i] - self.t[i - 1], self.t[i + 1] - self.t[i]
            d0, d1 = (self.v[i] - self.v[i - 1]) / h0, (self.v[i + 1] - self.v[i]) / h1
            if d0 * d1 <= 0:
                continue
            mt[i] = mp[i] = 3 * (h0 + h1) / ((2 * h1 + h0) / d0 + (h1 + 2 * h0) / d1)
        self.mt, self.mp = mt, mp

    def __call__(self, t):
        t = np.asarray(t, float)
        if len(self.t) == 1:
            return np.full_like(t, self.v[0])
        i = np.clip(np.searchsorted(self.t, t, side='right') - 1, 0, len(self.t) - 2)
        if self.bat_thang:
            j = np.searchsorted(self.t, t, side='right') - 1
            return np.where(j < 0, self.v[0], self.v[np.clip(j, 0, len(self.t) - 1)])
        j = i + 1
        h = self.t[j] - self.t[i]
        s = np.clip((t - self.t[i]) / h, 0, 1)
        h00 = 2 * s ** 3 - 3 * s ** 2 + 1
        h10 = s ** 3 - 2 * s ** 2 + s
        h01 = -2 * s ** 3 + 3 * s ** 2
        h11 = s ** 3 - s ** 2
        out = h00 * self.v[i] + h10 * h * self.mp[i] + h01 * self.v[j] + h11 * h * self.mt[j]
        out = np.where(t <= self.t[0], self.v[0], out)
        return np.where(t >= self.t[-1], self.v[-1], out)

    def kiem_vuot(self, mau=400, dung_sai=1e-6):
        if self.bat_thang:
            return 0.0
        worst = 0.0
        for i in range(len(self.t) - 1):
            ts = np.linspace(self.t[i], self.t[i + 1], mau)
            vs = self(ts)
            lo, hi = min(self.v[i], self.v[i + 1]), max(self.v[i], self.v[i + 1])
            worst = max(worst, float(np.max(vs - hi)), float(np.max(lo - vs)))
        return max(worst - dung_sai, 0.0)

    def mo_ta(self):
        return {'moc': [[round(float(a), 2), round(float(b), 4), round(float(c), 5), round(float(d), 5)]
                        for a, b, c, d in zip(self.t, self.v, self.mt, self.mp)],
                'bat_thang': self.bat_thang,
                'ghi_chu': '[t ms, giá trị, tiếp tuyến trái, tiếp tuyến phải (giá trị/ms)]'}
