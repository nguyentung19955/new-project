# Cắt tấm 4x2 hiệu ứng buff/debuff (raw_fxa_*.png, nền magenta) thành 8 khung RGBA
# rồi ghép GIF xem thử trên nền ụ (thap/assets canon_de + canon_nong).
# Dùng: python3 cat_gif.py <thư mục raw> <thư mục ra> [ten ...]
import sys, os, json
import numpy as np
from PIL import Image
from scipy import ndimage

# hiệu ứng tông nóng: mọi ánh hồng-tím còn sót (khói/hào quang trộn nền magenta) đổi thành khói xám
NONG = {'dmg', 'toc', 'max', 'lua', 'saoxuong', 'saolen', 'khien', 'da'}
ONE_SHOT = {'saolen', 'saoxuong', 'sach', 'xao', 'dmgxuong', 'mana'}
NEN = (38, 40, 46)
CO = 280  # cỡ khung GIF


def la_magenta(a):
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    # gần #FF00FF: đỏ + lam cao, lục thấp, đỏ ~ lam
    return (r > 195) & (b > 195) & (g < 95) & (abs(r - b) < 45)


def cat_o(o, nong=False):
    a = np.asarray(o.convert('RGB')).astype(np.float32)
    h, w = a.shape[:2]
    cand = la_magenta(a)
    lab, n = ndimage.label(cand)
    vien = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    # vùng magenta kín (lỗ giữa vòng): loang thêm từ tâm ô + mọi vùng phẳng lớn > 1% ô
    vien.add(lab[h // 2, w // 2])
    if n:
        sz0 = ndimage.sum(np.ones((h, w)), lab, range(1, n + 1))
        vien |= set((np.where(sz0 > h * w * 0.01)[0] + 1).tolist())
    vien -= {0}
    nen = np.isin(lab, list(vien))
    # độ "magenta" để làm viền mềm: khoảng cách tới (255,0,255)
    M = np.array([255, 0, 255], np.float32)
    d = np.sqrt(((a - M) ** 2).sum(-1)) / 255.0
    alpha = np.ones((h, w), np.float32)
    alpha[nen] = 0
    # dải 2 px quanh nền: alpha theo khoảng cách màu, tách trộn màu nền
    gan = ndimage.binary_dilation(nen, iterations=2) & ~nen
    al = np.clip((d[gan] - 0.12) / 0.55, 0, 1)
    alpha[gan] = al
    rgb = a.copy()
    am = np.maximum(alpha[..., None], 1e-3)
    un = (a - (1 - alpha[..., None]) * M) / am
    rgb[gan] = np.clip(un[gan], 0, 255)
    # bỏ ánh hồng còn sót ở viền: kéo bớt lam/đỏ nếu pixel viền vẫn ánh magenta
    # bỏ đảo điểm ảnh rời quá nhỏ
    fg = alpha > 0.05
    lab2, n2 = ndimage.label(fg)
    if n2:
        sz = ndimage.sum(np.ones_like(alpha), lab2, range(1, n2 + 1))
        nho = np.where(sz < max(12, h * w * 0.00006))[0] + 1
        alpha[np.isin(lab2, nho)] = 0
    if nong:
        r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
        tim = (b > g + 35) & (b > 0.6 * r)
        xam = (0.3 * r + 0.59 * g + 0.11 * b) * 0.55
        for c in range(3):
            rgb[..., c][tim] = xam[tim]
    out = np.dstack([rgb, alpha * 255]).astype(np.uint8)
    return Image.fromarray(out, 'RGBA'), int(len(vien) > 0), int((np.isin(lab2, nho)).sum() if n2 else 0)


def cat_tam(p, nong=False):
    im = Image.open(p).convert('RGB')
    W, H = im.size
    cw, ch = W / 4, H / 2
    kh = []
    for j in range(2):
        for i in range(4):
            o = im.crop((round(i * cw), round(j * ch), round((i + 1) * cw), round((j + 1) * ch)))
            if o.width != o.height:  # ô không vuông: đệm magenta cho vuông (không cắt mất chi tiết)
                s = max(o.size)
                v = Image.new('RGB', (s, s), (255, 0, 255))
                v.paste(o, ((s - o.width) // 2, (s - o.height) // 2))
                o = v
            kh.append(cat_o(o, nong)[0])
    return kh


def thu(k, co):
    # Lanczos nhân-trước-alpha
    a = np.asarray(k).astype(np.float32) / 255
    pm = np.dstack([a[..., :3] * a[..., 3:], a[..., 3:]])
    ims = [Image.fromarray((pm[..., c] * 255).astype(np.uint8)).resize((co, co), Image.LANCZOS) for c in range(4)]
    b = np.dstack([np.asarray(x).astype(np.float32) / 255 for x in ims])
    rgb = b[..., :3] / np.maximum(b[..., 3:], 1e-4)
    return Image.fromarray(np.dstack([np.clip(rgb, 0, 1) * 255, b[..., 3:] * 255]).astype(np.uint8), 'RGBA')


def nen_u(assets):
    c = Image.new('RGBA', (CO, CO), NEN + (255,))
    du = int(CO * 0.66)
    de = Image.open(os.path.join(assets, 'canon_de.png')).convert('RGBA')
    no = Image.open(os.path.join(assets, 'canon_nong.png')).convert('RGBA').rotate(90, Image.BICUBIC)
    s = du / de.width
    de = de.resize((du, du), Image.LANCZOS)
    no = no.resize((round(no.width * s), round(no.height * s)), Image.LANCZOS)
    c.alpha_composite(de, ((CO - du) // 2, (CO - du) // 2))
    c.alpha_composite(no, ((CO - no.width) // 2, (CO - no.height) // 2))
    return c


def lam_gif(ten, kh, nen, ra):
    ks = [thu(k, CO) for k in kh]
    fr, du = [], []
    def them(i, ms):
        c = nen.copy()
        if i is not None:
            c.alpha_composite(ks[i])
        fr.append(c.convert('RGB'))
        du.append(ms)
    them(None, 500)
    for i in range(4):
        them(i, 100)
    if ten in ONE_SHOT:
        for i in range(4, 8):
            them(i, 110)
        them(None, 700)
    else:
        for _ in range(3):
            for i in range(4, 8):
                them(i, 125)
    # một bảng màu chung MEDIANCUT, không dither
    tong = Image.new('RGB', (CO, CO * len(fr)))
    for n, f in enumerate(fr):
        tong.paste(f, (0, n * CO))
    pal = tong.quantize(colors=255, method=Image.MEDIANCUT, dither=Image.NONE)
    q = [f.quantize(palette=pal, dither=Image.NONE) for f in fr]
    q[0].save(os.path.join(ra, f'fxa_{ten}.gif'), save_all=True, append_images=q[1:], duration=du, loop=0, disposal=1, optimize=False)
    return ks


if __name__ == '__main__':
    raw, ra = sys.argv[1], sys.argv[2]
    assets = os.path.join(os.path.dirname(__file__), '../../../../../thap/assets')
    os.makedirs(ra, exist_ok=True)
    ten = sys.argv[3:] or sorted(f[8:-4] for f in os.listdir(raw) if f.startswith('raw_fxa_'))
    nen = nen_u(assets)
    for t in ten:
        kh = cat_tam(os.path.join(raw, f'raw_fxa_{t}.png'), t in NONG)
        ks = lam_gif(t, kh, nen, ra)
        # dải 8 khung để xem/kiểm
        d = Image.new('RGBA', (CO * 8, CO), NEN + (255,))
        for i, k in enumerate(ks):
            c = nen.copy(); c.alpha_composite(k); d.paste(c, (i * CO, 0))
        d.convert('RGB').save(os.path.join(ra, f'_dai_{t}.png'))
        print(t, 'ok')
