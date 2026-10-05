"""Xoá nền xám cho ảnh ĐƠN tạo bằng Fooocus (PROMPT-FOOOCUS.txt), mỗi ảnh một vật.

Cách chạy:  python3 tools/xoa-nen.py <thư mục ảnh Fooocus> assets
Cần: pip install pillow numpy scipy
Nên cài thêm (tách nhân vật bằng AI, gỡ được đĩa tròn / vầng sáng sau lưng):
      pip install rembg onnxruntime   (lần chạy đầu tự tải mô hình isnet-anime ~176 MB)
  Không có rembg thì công cụ vẫn chạy bằng cách xoá nền xám như cũ.
- Ảnh phải đặt đúng tên như dòng "File:" trong prompt (ví dụ lac-tuong_thuong.png).
- Nhân vật, quái, đồ: xoá nền xám (vùng xám nối với mép ảnh), cắt sát, thu nhỏ còn tối đa 512 px;
  icon kỹ năng / giao diện / phụ kiện còn 256 px (hiện nhỏ, đỡ nặng máy).
- Ảnh nền (nen_*, truyen_*, logo, icon-app): giữ nguyên, chỉ thu nhỏ còn tối đa 1600 px.
Ảnh không có trong tools/asset-manifest.json sẽ được bỏ qua (in ra để sửa tên).
"""
import json, os, re, sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
M = json.load(open(os.path.join(HERE, 'asset-manifest.json'), encoding='utf-8'))
SHEET_FILES = {c['file'] for s in M['sheets'] for c in s['cells']}
SINGLE_FILES = {s['file'] for s in M['singles']}


def remove_bg(img):
    a = np.asarray(img.convert('RGB')).astype(int)
    h, w = a.shape[:2]
    sat = a.max(2) - a.min(2)
    # bỏ qua viền khung mảnh sát mép (một số ảnh có đường viền 1–3 px)
    m = max(2, int(min(h, w) * 0.012))
    sides = [a[m, m:w - m], a[h - 1 - m, m:w - m], a[m:h - m, m], a[m:h - m, w - 1 - m]]
    # nền có thể chuyển màu (tối ở trên, sáng ở dưới…): mỗi cạnh một màu nền riêng, gộp lại
    cand = np.zeros((h, w), bool)
    for edge in sides + [np.concatenate(sides)]:
        bg = np.median(edge, axis=0)
        d = np.sqrt(((a - bg) ** 2).sum(2))
        tol = min(70, max(22, float(np.percentile(np.sqrt(((edge - bg) ** 2).sum(1)), 90)) + 8))
        bg_sat = float(np.median(edge.max(1) - edge.min(1)))
        cand |= (d < tol) & (np.abs(sat - bg_sat) < 26)
    cand[:m, :] = cand[-m:, :] = True
    cand[:, :m] = cand[:, -m:] = True
    lab, _ = ndimage.label(cand)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    fg = ~np.isin(lab, list(border))
    fg = ndimage.binary_opening(fg, iterations=1)
    fg = ndimage.binary_fill_holes(fg)
    l2, n2 = ndimage.label(fg)
    if n2:
        sizes = ndimage.sum(fg, l2, range(1, n2 + 1))
        fg = np.isin(l2, [i + 1 for i, v in enumerate(sizes) if v > max(60, sizes.max() * 0.01)])
    alpha = Image.fromarray((fg * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(0.8))
    out = img.convert('RGB').copy()
    out.putalpha(alpha)
    bb = out.getbbox()
    return out.crop(bb) if bb else out


# tách nhân vật bằng AI (rembg, mô hình isnet-anime) cho tướng / quái / boss nếu đã cài
try:
    from rembg import remove as _rembg_remove, new_session as _rembg_session
    _RB = None
except Exception:
    _rembg_remove = None


def ai_cut(img):
    global _RB
    if _rembg_remove is None:
        return None
    if _RB is None:
        _RB = _rembg_session('isnet-anime')
    out = _rembg_remove(img.convert('RGB'), session=_RB)
    a = np.asarray(out)[:, :, 3]
    if (a > 128).mean() < 0.02:          # tách hỏng (gần như trống): bỏ
        return None
    bb = out.getbbox()
    return out.crop(bb) if bb else out


CHAR_RE = re.compile(r'^([a-z-]+_(thuong|hiem|su-thi|huyen-thoai|ra-don)|quai_[a-z-]+|boss_[a-z-]+|giao-long_[a-z]+|trieu-hoi_[a-z-]+)\.png$')
ICON_PREFIX = ('ky-nang_', 'ui_', 'hanh_', 'phu-kien_', 'do-ghep_', 'sinh-le_')


def remove_bg_nocrop(img):
    """Xoá nền xám nhưng giữ nguyên khung ảnh."""
    cut = remove_bg(img)
    a = np.asarray(img.convert('RGB')).astype(int)
    # tìm lại vị trí phần đã cắt: dựng mặt nạ cùng cỡ ảnh gốc
    full = Image.new('RGBA', img.size, (0, 0, 0, 0))
    bb = Image.fromarray(np.uint8(255 * (np.abs(a - np.median(np.concatenate([a[0], a[-1]]), axis=0)).sum(2) > 40))).getbbox()
    if bb:
        full.paste(cut, (bb[0], bb[1]))
    return full


def strip_backdrop(img, passes=3):
    """Gỡ đĩa tròn / vầng sáng / ô nền mà AI vẽ sau lưng nhân vật (lớp ngoài cùng còn sót sau
    khi xoá nền xám). Lấy màu ở viền ngoài phần còn lại, bỏ vùng cùng màu nối với viền; chỉ nhận
    kết quả nếu còn giữ được phần lớn nhân vật."""
    out = img
    for _ in range(passes):
        a = np.asarray(out.convert('RGBA')).astype(int)
        alpha = a[:, :, 3] > 40
        if alpha.sum() < 500:
            break
        outside = ~alpha
        ring = alpha & ndimage.binary_dilation(outside, iterations=3)
        cols = a[:, :, :3][ring]
        if len(cols) < 50:
            break
        bg = np.median(cols, axis=0)
        dist = np.sqrt(((cols - bg) ** 2).sum(1))
        if np.percentile(dist, 60) > 40:      # viền không đồng màu: không có đĩa nền rõ ràng
            break
        tol = min(55, max(20, float(np.percentile(dist, 80)) + 6))
        d = np.sqrt(((a[:, :, :3] - bg) ** 2).sum(2))
        cand = alpha & (d < tol)
        lab, _ = ndimage.label(cand)
        touch = set(np.unique(lab[ring & cand])) - {0}
        rm = np.isin(lab, list(touch))
        keep = alpha & ~rm
        keep = ndimage.binary_opening(keep, iterations=1)
        l2, n2 = ndimage.label(keep)
        if n2:
            sizes = ndimage.sum(keep, l2, range(1, n2 + 1))
            keep = np.isin(l2, [i + 1 for i, v in enumerate(sizes) if v > max(80, sizes.max() * 0.03)])
        frac = keep.sum() / alpha.sum()
        if frac > 0.95 or frac < 0.3:         # gần như không đổi, hoặc ăn mất nhân vật: dừng
            break
        al = Image.fromarray((keep * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(0.8))
        rgb = out.convert('RGB')
        rgb.putalpha(Image.fromarray(np.minimum(np.asarray(al), a[:, :, 3]).astype('uint8')))
        bb = rgb.getbbox()
        out = rgb.crop(bb) if bb else rgb
    return out


def shrink(img, maxside):
    w, h = img.size
    k = maxside / max(w, h)
    return img.resize((round(w * k), round(h * k)), Image.LANCZOS) if k < 1 else img


def main(src, dst):
    os.makedirs(dst, exist_ok=True)
    for f in sorted(os.listdir(src)):
        if not f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
            continue
        name = os.path.splitext(f)[0] + '.png'
        img = Image.open(os.path.join(src, f))
        if name in SINGLE_FILES:
            side = 1024 if name.startswith('anh-lon_') else 1600
            shrink(img.convert('RGB'), side).save(os.path.join(dst, name), optimize=True); print('ảnh nền ', name)
        elif name in SHEET_FILES:
            # icon / giao diện chỉ hiện nhỏ: 256 px là đủ, nhẹ hơn 4 lần
            side = 256 if name.startswith(ICON_PREFIX) else 512
            out = None
            if name.endswith('_than.png'):
                # ảnh thân trần để ghép đồ: giữ nguyên khung (không cắt sát) cho điểm neo khớp dáng chuẩn
                cut = ai_cut(img) if _rembg_remove else None
                full = Image.new('RGBA', img.size, (0, 0, 0, 0))
                if cut is not None:
                    a = np.asarray(_rembg_remove(img.convert('RGB'), session=_RB))
                    full = Image.fromarray(a)
                else:
                    full = remove_bg_nocrop(img)
                full.thumbnail((side * img.size[0] // max(img.size), side * img.size[1] // max(img.size)))
                full.quantize(colors=256, method=Image.Quantize.FASTOCTREE).save(os.path.join(dst, name), optimize=True)
                print('thân trần', name)
                continue
            if CHAR_RE.match(name) and not name.startswith(('do_', 'bo-', 'ban-do_')):
                # tướng / quái: tách nhân vật bằng AI (bỏ cả đĩa tròn, vầng sáng sau lưng)
                out = ai_cut(img)
                if out is None:
                    out = strip_backdrop(remove_bg(img))
            if out is None:
                out = remove_bg(img)
            out = shrink(out, side)
            # nén bảng 256 màu (giữ trong suốt): nhẹ hơn ~5 lần, nhìn gần như không khác
            out = out.quantize(colors=256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.FLOYDSTEINBERG)
            out.save(os.path.join(dst, name), optimize=True); print('xoá nền ', name)
        else:
            print('bỏ qua (tên không có trong manifest):', f)


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'fooocus', sys.argv[2] if len(sys.argv) > 2 else 'assets')
