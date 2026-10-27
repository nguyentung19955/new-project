"""Nội suy theo thời gian cho chu kỳ chạy: Hermite bậc 3 TUẦN HOÀN qua các mốc đặt tay.

- Tiếp tuyến tự động kiểu Fritsch–Butland: mốc là cực trị (hai đoạn kề ngược dấu) → tiếp tuyến 0; còn lại là
  trung bình điều hoà có trọng số → đường cong đơn điệu giữa hai mốc, KHÔNG vượt biên (không overshoot).
- Mốc có thể đặt tiếp tuyến bằng tay (vd. vận tốc ngang của ủng lúc chạm/rời đất = đúng tốc độ đất trôi);
  hàm kiem_vuot() kiểm lại bằng số rằng không đoạn nào vượt ra ngoài khoảng giá trị hai mốc của nó.
- Liên tục vị trí và vận tốc (C¹) ở mọi mốc, kể cả chỗ nối cuối → đầu chu kỳ."""
import numpy as np


class Kenh:
    def __init__(self, moc, chu_ky=1.0, ten=''):
        """moc = list (t, giá trị) hoặc (t, giá trị, tiếp tuyến|None); t trong [0, chu_ky)."""
        self.ten = ten
        self.T = float(chu_ky)
        moc = sorted([(float(m[0]) % self.T, float(m[1]), (m[2] if len(m) > 2 else None)) for m in moc])
        self.t = np.array([m[0] for m in moc])
        self.v = np.array([m[1] for m in moc])
        n = len(moc)
        m = np.zeros(n)
        for i in range(n):
            if moc[i][2] is not None:
                m[i] = moc[i][2]
                continue
            ip, inx = (i - 1) % n, (i + 1) % n
            h0 = (self.t[i] - self.t[ip]) % self.T or self.T
            h1 = (self.t[inx] - self.t[i]) % self.T or self.T
            d0 = (self.v[i] - self.v[ip]) / h0
            d1 = (self.v[inx] - self.v[i]) / h1
            if d0 * d1 <= 0:
                m[i] = 0.0
            else:
                m[i] = 3 * (h0 + h1) / ((2 * h1 + h0) / d0 + (h1 + 2 * h0) / d1)
        self.m = m

    def _seg(self, t):
        t = np.asarray(t, float) % self.T
        i = np.searchsorted(self.t, t, side='right') - 1          # -1 → đoạn cuối (nối vòng)
        i = np.where(i < 0, len(self.t) - 1, i)
        j = (i + 1) % len(self.t)
        t0 = self.t[i]
        h = (self.t[j] - t0) % self.T
        h = np.where(h == 0, self.T, h)
        s = ((t - t0) % self.T) / h
        return i, j, s, h

    def __call__(self, t):
        i, j, s, h = self._seg(t)
        h00 = 2 * s ** 3 - 3 * s ** 2 + 1
        h10 = s ** 3 - 2 * s ** 2 + s
        h01 = -2 * s ** 3 + 3 * s ** 2
        h11 = s ** 3 - s ** 2
        return h00 * self.v[i] + h10 * h * self.m[i] + h01 * self.v[j] + h11 * h * self.m[j]

    def dao_ham(self, t):
        i, j, s, h = self._seg(t)
        d00 = (6 * s ** 2 - 6 * s) / h
        d10 = 3 * s ** 2 - 4 * s + 1
        d01 = (-6 * s ** 2 + 6 * s) / h
        d11 = 3 * s ** 2 - 2 * s
        return d00 * self.v[i] + d10 * self.m[i] + d01 * self.v[j] + d11 * self.m[j]

    def kiem_vuot(self, mau=400, dung_sai=1e-6):
        """Trả độ vượt lớn nhất (≥0) ra ngoài [min, max] của hai mốc đầu-cuối mỗi đoạn."""
        worst = 0.0
        n = len(self.t)
        for i in range(n):
            j = (i + 1) % n
            h = (self.t[j] - self.t[i]) % self.T or self.T
            ts = self.t[i] + np.linspace(0, h, mau)
            vs = self(ts)
            lo, hi = min(self.v[i], self.v[j]), max(self.v[i], self.v[j])
            worst = max(worst, float(np.max(vs - hi)), float(np.max(lo - vs)))
        return max(worst - dung_sai, 0.0)

    def mo_ta(self):
        return {'moc': [[round(float(a), 4), round(float(b), 3), round(float(c), 3)]
                        for a, b, c in zip(self.t, self.v, self.m)],
                'chu_ky': self.T, 'ghi_chu': '[thời điểm (phần chu kỳ), giá trị, tiếp tuyến (giá trị / 1 chu kỳ)]'}
