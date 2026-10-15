"""Thư viện vẽ: bảng khung có đường chân / tâm, GIF mô phỏng nhịp."""
import os, json
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from phan_tich import nap, cat, ROOT

FONT_P = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
if not os.path.exists(FONT_P):
    import glob
    c = glob.glob('/usr/share/fonts/**/DejaVuSans.ttf', recursive=True) + glob.glob('/usr/share/fonts/**/*.ttf', recursive=True)
    FONT_P = c[0] if c else None


def font(s):
    return ImageFont.truetype(FONT_P, s) if FONT_P else ImageFont.load_default()


NEN = (38, 40, 48, 255)
NEN2 = (52, 55, 66, 255)


def khung_im(a):
    return Image.fromarray(a, 'RGBA')


def len_nen(im, mau=NEN):
    n = Image.new('RGBA', im.size, mau)
    n.alpha_composite(im)
    return n


def bang_hang(ma, ten, sc=2, chan=True, nhan=True):
    """Một dải khung của 1 động tác, có vạch đáy (chân) khung đầu để thấy lệch neo."""
    d, im = nap(ma)
    dt = d['dong_tac'][ten]
    ks = cat(d, im, dt['hang'], dt['so'])
    w, h = ks[0].shape[1], ks[0].shape[0]
    W = int(w * sc / d.get('net', 1)) if False else int(w * sc / 2)
    H = int(h * sc / 2)
    out = Image.new('RGBA', (W * len(ks) + 4 * (len(ks) - 1), H + (16 if nhan else 0)), (0, 0, 0, 0))
    dr = ImageDraw.Draw(out)
    day0 = None
    for i, k in enumerate(ks):
        fr = len_nen(khung_im(k), NEN if i % 2 == 0 else NEN2).resize((W, H), Image.NEAREST)
        x = i * (W + 4)
        out.paste(fr, (x, 0))
        al = k[..., 3] > 40
        if al.any():
            ys = np.nonzero(al)[0]
            y1 = int(ys.max() * H / h)
            if day0 is None:
                day0 = y1
            if chan:
                dr.line([(x, day0), (x + W - 1, day0)], fill=(80, 220, 255, 255), width=1)
                if abs(y1 - day0) > 2:
                    dr.line([(x, y1), (x + W - 1, y1)], fill=(255, 80, 80, 255), width=1)
        if nhan:
            dr.text((x + 2, H + 1), str(i + 1), fill=(230, 230, 230, 255), font=font(11))
    return out


def chu(im, xy, s, size=14, mau=(240, 240, 240, 255)):
    ImageDraw.Draw(im).text(xy, s, fill=mau, font=font(size))


def frames_to_gif(frames, path, ms):
    """frames: list RGBA same size; ms: thời lượng mỗi khung (ms) hoặc list."""
    pal = [f.convert('RGB').quantize(colors=255, method=Image.MEDIANCUT, dither=Image.NONE) for f in frames]
    pal[0].save(path, save_all=True, append_images=pal[1:], duration=ms, loop=0, disposal=2, optimize=False)
