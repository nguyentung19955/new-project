"""Bước 4: ráp 13 mảnh ở dáng nghỉ (đúng thứ tự vẽ) và so với ảnh đã chốt.
Đo: IoU bóng (alpha > 0,5), sai lệch màu trung bình trong bóng. Ảnh kiểm ../kiem/:
  rap-so-sanh.png  – ảnh chốt | ráp từ mảnh | chồng (đỏ = chỉ ảnh chốt có, xanh = chỉ bản ráp có) | khác màu ×4
  rap-tach-lop.png – từng mảnh tô màu riêng + 13 mảnh rời (phần khuất đã lấp)
"""
import os
import numpy as np
from PIL import Image, ImageDraw
from chung import SRC_CHOT, MANH, KIEM, load_rgb, background, unmix_white, doc_json, luu_json, font

MAU = {'mu': (200, 60, 60), 'chop': (230, 140, 40), 'than': (60, 160, 60), 'ao-vai': (40, 190, 210), 'vat-truoc': (210, 60, 210),
       'vat-sau': (120, 60, 210), 'chuong': (230, 210, 30), 'gang-gan': (40, 100, 230), 'dao': (240, 240, 240), 'mat': (40, 240, 130),
       'gang-xa': (140, 230, 40), 'ung-gan': (240, 110, 150), 'ung-xa': (150, 110, 240)}


def rap(meta, chi_mau=False):
    out = np.zeros((1254, 1254, 4), np.float32)
    for ten in meta['_thu_tu_ve']:
        m = meta[ten]
        im = np.asarray(Image.open(os.path.join(MANH, ten + '.png'))).astype(np.float32) / 255
        x0, y0 = m['goc_tren_trai']
        h, w = im.shape[:2]
        src = im.copy()
        if chi_mau:
            src[..., :3] = np.array(MAU[ten]) / 255 * 0.75 + src[..., :3] * 0.25
        src[..., :3] *= src[..., 3:4]
        dst = out[y0:y0 + h, x0:x0 + w]
        out[y0:y0 + h, x0:x0 + w] = src + dst * (1 - src[..., 3:4])
    return out


def main():
    meta = doc_json(os.path.join(MANH, 'manh.json'))
    a = load_rgb(SRC_CHOT)
    FG = ~background(a)
    chot = unmix_white(a, FG).astype(np.float32) / 255
    r = rap(meta)
    A1, A2 = chot[..., 3] > 0.5, r[..., 3] > 0.5
    iou = (A1 & A2).sum() / (A1 | A2).sum()
    # màu: so trên nền trắng
    def tren_trang(x):
        return x[..., :3] * (x[..., 3:4] if x is chot else 1) + (1 - x[..., 3:4])
    c1 = chot[..., :3] * chot[..., 3:4] + (1 - chot[..., 3:4])
    c2 = r[..., :3] + (1 - r[..., 3:4])
    diff = np.abs(c1 - c2).mean(-1) * 255
    sel = A1 | A2
    so = {'iou_bong': round(float(iou), 5), 'px_chi_anh_chot': int((A1 & ~A2).sum()), 'px_chi_ban_rap': int((A2 & ~A1).sum()),
          'lech_mau_tb_trong_bong_0_255': round(float(diff[sel].mean()), 3),
          'ty_le_px_lech_mau_tren_8': round(float((diff[sel] > 8).mean()), 5)}
    print(so)
    luu_json(os.path.join(KIEM, 'rap-so-do.json'), so)
    # ảnh so sánh
    x0, y0, x1, y1 = 270, 60, 980, 1200
    def crop(arr):
        return Image.fromarray((arr[y0:y1, x0:x1] * 255).clip(0, 255).astype(np.uint8))
    ov = np.ones((1254, 1254, 3), np.float32)
    ov[A1 & A2] = 0.78
    ov[A1 & ~A2] = (1, 0, 0)
    ov[A2 & ~A1] = (0, 0.4, 1)
    d4 = 1 - np.clip(diff / 255 * 4, 0, 1)
    tiles = [crop(c1), crop(c2), crop(ov), crop(np.dstack([d4] * 3))]
    tw, th = tiles[0].size
    can = Image.new('RGB', (tw * 4 + 30, th + 60), 'white')
    d = ImageDraw.Draw(can)
    nhan = ['ảnh đã chốt', 'ráp từ 13 mảnh', f'chồng bóng: IoU {iou:.4f}', 'khác màu ×4 (trắng = trùng)']
    for i, t in enumerate(tiles):
        can.paste(t, (i * (tw + 10), 50))
        d.text((i * (tw + 10) + 10, 10), nhan[i], fill='black', font=font(26))
    can.save(os.path.join(KIEM, 'rap-so-sanh.png'))
    # tách lớp
    rm = rap(meta, chi_mau=True)
    t1 = crop(rm[..., :3] + (1 - rm[..., 3:4]))
    names = meta['_thu_tu_ve']
    cols = 5
    cw, ch = 300, 330
    rows = (len(names) + cols - 1) // cols
    can = Image.new('RGB', (tw + 20 + cols * cw, max(th, rows * ch) + 50), 'white')
    can.paste(t1, (0, 50))
    d = ImageDraw.Draw(can)
    d.text((10, 10), 'mỗi màu = một mảnh (dáng nghỉ)', fill='black', font=font(24))
    for i, ten in enumerate(names):
        im = Image.open(os.path.join(MANH, ten + '.png'))
        im.thumbnail((cw - 20, ch - 50))
        bgc = Image.new('RGBA', im.size, (235, 225, 235, 255))
        bgc.alpha_composite(im)
        px, py = tw + 20 + (i % cols) * cw, 50 + (i // cols) * ch
        can.paste(bgc.convert('RGB'), (px, py + 30))
        d.text((px, py + 4), f'{i + 1}. {meta[ten]["ten_viet"]}', fill='black', font=font(20))
    can.save(os.path.join(KIEM, 'rap-tach-lop.png'))


if __name__ == '__main__':
    main()
