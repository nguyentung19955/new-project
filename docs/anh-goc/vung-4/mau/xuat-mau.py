#!/usr/bin/env python3
"""Bước 3 · Phiên 0: xuất ẢNH MẪU từ game (ảnh nằm trong game/art/custom/*.sprite.json, ChatGPT không đọc được)
để gửi kèm prompt vùng 4 Sông sâu. Không chữ trên ảnh (ChatGPT hay chép chữ); thứ tự từng ô ghi trong THU-TU.md.
Chạy từ gốc repo:  python3 docs/anh-goc/vung-4/mau/xuat-mau.py
  cua-bien.png   6 cửa Hang biển một hàng (tren, tren-khoa, duoi, duoi-khoa, ben, ben-khoa), nền hồng #FF00FF, phóng ×4
  icon-manh.png  vp-shard0..2 rồi vp-mat0..2 một hàng, nền xanh #00FF00, phóng ×6
  hieu-ung.png   mỗi hiệu ứng một hàng đủ khung: hu-vung-quai-bang, hu-cot-nuoc, hu-manh-san-ho, nền xanh #00FF00, phóng ×2..×8 (cao ~220)
Ảnh trong game là net 2 (gấp đôi cỡ hiện); phóng thêm bằng lân cận gần nhất nên giữ nguyên nét."""
import base64, io, json, os, sys
from PIL import Image

GOC = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
CUSTOM = os.path.join(GOC, 'game', 'art', 'custom')
RA = os.path.dirname(os.path.abspath(__file__))
HONG, XANH = (255, 0, 255), (0, 255, 0)


def doc(ma):
    with open(os.path.join(CUSTOM, ma + '.sprite.json'), encoding='utf-8') as f:
        t = json.load(f)
    s = t.get('anh') or t.get('tam')
    im = Image.open(io.BytesIO(base64.b64decode(s.split(',', 1)[1]))).convert('RGBA')
    return t, im


def phong(im, k):
    return im.resize((im.width * k, im.height * k), Image.NEAREST)


def tren_nen(im, nen):
    o = Image.new('RGBA', im.size, nen + (255,))
    o.alpha_composite(im)
    return o.convert('RGB')


def mot_hang(ds, nen, k, cach=24, le=24, deu_day=True):
    ds = [phong(i, k) for i in ds]
    W = le * 2 + sum(i.width for i in ds) + cach * (len(ds) - 1)
    H = le * 2 + max(i.height for i in ds)
    o = Image.new('RGBA', (W, H), nen + (255,))
    x = le
    for i in ds:
        y = (H - le - i.height) if deu_day else (H - i.height) // 2
        o.alpha_composite(i, (x, y))
        x += i.width + cach
    return o.convert('RGB')


def khung(t, im):
    """Cắt tấm hiệu ứng thành từng khung (khung_rong × khung_cao nhân net, xếp một hàng)."""
    net = t.get('net', 1)
    fw, fh = t['khung_rong'] * net, t['khung_cao'] * net
    ds = [im.crop((i * fw, 0, (i + 1) * fw, fh)) for i in range(t.get('so', im.width // fw))]
    hop = None  # cắt mọi khung theo cùng một khung bao (giữ chuyển động tương đối giữa các khung)
    for k in ds:
        b = k.getchannel('A').getbbox()
        if b: hop = b if hop is None else (min(hop[0], b[0]), min(hop[1], b[1]), max(hop[2], b[2]), max(hop[3], b[3]))
    return [k.crop(hop) for k in ds] if hop else ds


def main():
    ghi = []
    cua = ['gd-cua-bien-tren', 'gd-cua-bien-tren-khoa', 'gd-cua-bien-duoi', 'gd-cua-bien-duoi-khoa', 'gd-cua-bien-ben', 'gd-cua-bien-ben-khoa']
    mot_hang([doc(m)[1] for m in cua], HONG, 4).save(os.path.join(RA, 'cua-bien.png'))
    ghi.append(('cua-bien.png', 'nền hồng #FF00FF, phóng ×4, chân cửa thẳng một đường đáy', cua))
    manh = ['vp-shard0', 'vp-shard1', 'vp-shard2', 'vp-mat0', 'vp-mat1', 'vp-mat2']
    mot_hang([doc(m)[1] for m in manh], XANH, 6, deu_day=False).save(os.path.join(RA, 'icon-manh.png'))
    ghi.append(('icon-manh.png', 'nền xanh #00FF00, phóng ×6, căn giữa theo chiều cao', manh))
    hu = ['hu-vung-quai-bang', 'hu-cot-nuoc', 'hu-manh-san-ho']
    hang = []
    for m in hu:
        t, im = doc(m)
        ks = khung(t, im)
        k = max(2, min(8, 220 // max(i.height for i in ks), 260 // max(i.width for i in ks)))  # hiệu ứng nhỏ (mảnh san hô) phóng to hơn
        hang.append(mot_hang(ks, XANH, k, cach=24, le=20, deu_day=False))
    W = max(h.width for h in hang); H = sum(h.height for h in hang)
    o = Image.new('RGB', (W, H), XANH); y = 0
    for h in hang:
        o.paste(h, (0, y)); y += h.height
    o.save(os.path.join(RA, 'hieu-ung.png'))
    ghi.append(('hieu-ung.png', 'nền xanh #00FF00, mỗi hiệu ứng một hàng (phóng ×2..×8 cho cao chừng 220), đủ khung từ trái sang', hu))
    with open(os.path.join(RA, 'THU-TU.md'), 'w', encoding='utf-8') as f:
        f.write('# Ảnh mẫu từ game cho vùng 4 (tạo bởi xuat-mau.py, đừng sửa tay)\n\n')
        for ten, mo, ds in ghi:
            f.write('- `%s` — %s. Thứ tự từ trái (hoặc từ trên) xuống: %s\n' % (ten, mo, ', '.join('`%s`' % m for m in ds)))
    for ten, _, _ in ghi:
        im = Image.open(os.path.join(RA, ten)); print('Đã ghi', ten, im.size)


if __name__ == '__main__':
    sys.exit(main())
