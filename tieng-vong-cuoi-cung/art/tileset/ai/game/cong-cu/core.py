import numpy as np
from PIL import Image
R = '/home/claude/new-project/tieng-vong-cuoi-cung/art/tileset/ai/'
W = '/tmp/claude-0/-home-claude-new-project/61b1e687-1d72-54b0-838f-e897e6195def/scratchpad/w/'

def la_hong(a):
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    return ((np.minimum(r, b) - g) > 55) & (np.abs(r - b) < 90)

class Nguon:
    def __init__(self, ten, ncolor=32):
        self.a = np.array(Image.open(R + ten + '.png').convert('RGB'))
        self.hong = la_hong(self.a)
        px = self.a[~self.hong].reshape(-1, 1, 3)
        # palette by median cut on non-magenta pixels
        pim = Image.fromarray(px[::7].astype(np.uint8))
        q = pim.quantize(colors=ncolor, method=Image.Quantize.MEDIANCUT)
        pal = np.array(q.getpalette()[:ncolor * 3]).reshape(-1, 3)
        self.pal = pal
        # index every pixel
        flat = self.a.reshape(-1, 3).astype(int)
        d = ((flat[:, None, :] - pal[None, :, :]) ** 2).sum(2)
        self.idx = d.argmin(1).reshape(self.a.shape[:2])
        self.idx[self.hong] = -1

    def thu(self, x0, y0, x1, y1, w, h, loi=0.25):
        """Downsample box to w×h by majority palette index within inner block area. -1 = transparent."""
        out = np.full((h, w), -1, int)
        sx = (x1 - x0) / w; sy = (y1 - y0) / h
        for j in range(h):
            for i in range(w):
                bx0 = x0 + (i + loi) * sx; bx1 = x0 + (i + 1 - loi) * sx
                by0 = y0 + (j + loi) * sy; by1 = y0 + (j + 1 - loi) * sy
                blk = self.idx[int(round(by0)):max(int(round(by1)), int(round(by0)) + 1),
                               int(round(bx0)):max(int(round(bx1)), int(round(bx0)) + 1)]
                v = blk.ravel()
                if v.size == 0: continue
                vals, cnt = np.unique(v, return_counts=True)
                if (v == -1).mean() > 0.5: continue
                m = vals != -1
                out[j, i] = vals[m][cnt[m].argmax()]
        return out

    def thu_tb(self, x0, y0, x1, y1, w, h, loi=0.1):
        """trung bình màu trong khối (bỏ nền hồng) rồi lấy màu gần nhất trong bảng"""
        out = np.full((h, w), -1, int)
        sx = (x1 - x0) / w; sy = (y1 - y0) / h
        a = self.a.astype(float)
        for j in range(h):
            for i in range(w):
                ya, yb = int(round(y0 + (j + loi) * sy)), int(round(y0 + (j + 1 - loi) * sy))
                xa, xb = int(round(x0 + (i + loi) * sx)), int(round(x0 + (i + 1 - loi) * sx))
                m = ~self.hong[ya:yb, xa:xb]
                if m.size == 0 or m.mean() < 0.5: continue
                c = a[ya:yb, xa:xb][m].mean(0)
                out[j, i] = ((self.pal - c) ** 2).sum(1).argmin()
        return out

    def rgba(self, idx):
        h, w = idx.shape
        o = np.zeros((h, w, 4), np.uint8)
        m = idx >= 0
        o[m, :3] = self.pal[idx[m]]
        o[m, 3] = 255
        return o

def phong(rgba, k=8, nen=(40, 30, 24)):
    im = Image.fromarray(rgba, 'RGBA')
    bg = Image.new('RGBA', im.size, nen + (255,))
    bg.alpha_composite(im)
    return bg.resize((im.width * k, im.height * k), Image.NEAREST)
