#!/usr/bin/env python3
"""Pass 5 — HƯỚNG NHÌN quái/trùm: cắt raw ChatGPT (1 hàng 8 khung, nền #FF00FF) thành dải 8 khung NGANG / SAU
khớp với dải TRƯỚC đã có (thap/assets/<loai>_<id>_8.png): cùng cỡ khung, cùng tâm thân, cùng cỡ thân → đổi hướng không nhảy, bóng dưới chân giữ chỗ.

  python3 tools/thap-huong-quai.py            # xử lý mọi docs/demo-hop-tuong/thap-art/raw_p5_<id>_<side|back>.png + raw_p12_<id>_<side|back|left>.png (đợt 12: tinh anh/trùm)
  python3 tools/thap-huong-quai.py --ra DIR   # thử: ghi ra DIR, không đụng assets / quaianim.js

Ra: thap/assets/<quai|trum>_<id>_<side|back>_8.png + cập nhật dòng `const HUONG8 = new Set([...])` trong thap/js/quaianim.js.
Khung: khoá magenta (tools/cat-sheet.py key_magenta: viền alpha mềm, khử ám hồng) → bỏ đốm → thu Lanczos nhân-trước-alpha
→ đặt tâm lõi thân trùng tâm lõi thân trung bình của dải trước, diện tích thân = trung vị dải trước (±25%)
→ đăng ký lại từng khung bằng thap-art/dangky_khung.py (thân đứng yên giữa các khung).
"""
import os, re, sys, glob, argparse, importlib.util, tempfile
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART = os.path.join(ROOT, 'docs/demo-hop-tuong/thap-art')
ASSETS = os.path.join(ROOT, 'thap/assets')
QA = os.path.join(ROOT, 'thap/js/quaianim.js')
TRUM = {'freezer', 'janus', 'joker_king', 'mad_crown', 'nightmare', 'octopus', 'hive', 'jammer', 'prism', 'twin_core', 'patcher', 'leech'}
# raw NGANG mà ChatGPT vẽ quay sang TRÁI (prompt xin PHẢI) → lật khi cắt; ghi tên file raw (kiểm bằng mắt khi ảnh về)
LAT_RAW = set()


def nap(ten, path):
    spec = importlib.util.spec_from_file_location(ten, path)
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m


cs = nap('cs', os.path.join(ROOT, 'tools/cat-sheet.py'))
dk = nap('dk', os.path.join(ART, 'dangky_khung.py'))


def do_than(strip):
    """tâm lõi thân trung bình + diện tích alpha trung vị + bbox trung vị của dải N khung vuông."""
    H = strip.height; n = max(1, round(strip.width / H)); fw = strip.width // n
    cx, cy, ar = [], [], []
    for i in range(n):
        a = np.asarray(strip.crop((i * fw, 0, (i + 1) * fw, H)), dtype=np.float32)[..., 3] / 255.0
        inf = dk.loi_than(a, max(2, fw // 24))
        if inf: cx.append(inf[0]); cy.append(inf[1])
        ar.append(float((a > 0.35).sum()))
    return float(np.mean(cx)), float(np.mean(cy)), float(np.median(ar)), H


def khoa_magenta(src):
    """Khoá nền #FF00FF bằng LOANG TỪ MÉP (quái tím/hồng không bị khoét thân): nền = vùng gần magenta nối với mép ảnh,
    + lỗ kín magenta rất thuần (khe giữa chân); dải 2 px sát nền: alpha mềm theo độ lẫn magenta + khử ám hồng."""
    from scipy import ndimage
    a = np.asarray(src.convert('RGB')).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    d = np.sqrt((255 - r) ** 2 + g ** 2 + (255 - b) ** 2)
    gan = d < 110
    lab, _ = ndimage.label(gan)
    mep = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(mep)) | (d < 45)
    edge = ndimage.binary_dilation(bg, iterations=2) & ~bg
    m = np.clip(np.minimum(r, b) - g, 0, None)
    k = np.clip((m - 25) / 160.0, 0, 1)
    alpha = np.where(bg, 0.0, np.where(edge, 255 * (1 - k), 255.0))
    nr = np.where(edge, np.clip(r - m * k, 0, 255), r)
    nb = np.where(edge, np.clip(b - m * k, 0, 255), b)
    out = np.stack([nr, g, nb, alpha], -1).round().clip(0, 255).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')


def thu(im, s):
    w, h = max(1, round(im.width * s)), max(1, round(im.height * s))
    return im.convert('RGBa').resize((w, h), Image.LANCZOS).convert('RGBA')  # nhân-trước-alpha: không viền tối/hồng


def lam(raw, truoc, n=8):
    tx, ty, ar0, H = do_than(truoc)
    src = Image.open(raw).convert('RGB')
    if os.path.basename(raw) in LAT_RAW: src = src.transpose(Image.FLIP_LEFT_RIGHT)
    sheet = khoa_magenta(src)
    W, Hs = sheet.size
    xs = cs.cut_lines(sheet, n, W, axis=0)
    cells = []
    for i in range(n):
        c = cs.drop_specks(sheet.crop((xs[i] + 4, 4, xs[i + 1] - 4, Hs - 4)))
        bb = c.getbbox()
        if not bb: sys.exit('%s: ô %d trống' % (os.path.basename(raw), i))
        cells.append(c.crop(bb))
    # cỡ: diện tích thân (alpha) trung vị = dải trước; không vượt 94% khung
    ar = float(np.median([(np.asarray(c)[..., 3] > 90).sum() for c in cells]))
    s = np.sqrt(ar0 / max(1.0, ar))
    mx = max(max(c.width, c.height) for c in cells)
    s = min(s, 0.94 * H / mx)
    out = Image.new('RGBA', (n * H, H), (0, 0, 0, 0))
    for i, c in enumerate(cells):
        c = thu(c, s)
        a = np.asarray(c, dtype=np.float32)[..., 3] / 255.0
        inf = dk.loi_than(a, max(2, H // 24))
        cx, cy = (inf[0], inf[1]) if inf else (c.width / 2, c.height / 2)
        x, y = round(tx - cx), round(ty - cy)
        x = min(max(x, 0), H - c.width); y = min(max(y, 0), H - c.height)  # không cắt mép
        out.alpha_composite(c, (i * H + x, y))
    # đăng ký từng khung (thân đứng yên, không phình/xẹp) như dải trước
    tmp = os.path.join(tempfile.mkdtemp(), 'k.png'); out.save(tmp)
    out, _ = dk.xu_ly(tmp)
    return out, s


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--ra'); ap.add_argument('raws', nargs='*')
    a = ap.parse_args()
    raws = a.raws or sorted(f for p in ('p5', 'p12') for v in ('side', 'back', 'left') for f in glob.glob(os.path.join(ART, 'raw_%s_*_%s.png' % (p, v))))
    for r in raws:
        m = re.match(r'raw_p(?:5|12)_(.+)_(side|back|left)\.png$', os.path.basename(r))
        if not m: continue
        id_, v = m.groups(); loai = 'trum_' if id_ in TRUM else 'quai_'
        truoc = os.path.join(ASSETS, loai + id_ + '_8.png')
        if not os.path.exists(truoc): print('bỏ', r, '(không có dải trước)'); continue
        out, s = lam(r, Image.open(truoc).convert('RGBA'))
        dich = os.path.join(a.ra or ASSETS, '%s%s_%s_8.png' % (loai, id_, v))
        out.save(dich, optimize=True)
        print('%s → %s  (thu ×%.3f, %dx%d)' % (os.path.basename(r), os.path.relpath(dich, ROOT), s, *out.size))
    if a.ra: return
    co = sorted(os.path.basename(f)[:-6] for v in ('side', 'back', 'left') for f in glob.glob(os.path.join(ASSETS, '*_%s_8.png' % v)))
    js = open(QA, encoding='utf-8').read()
    js2 = re.sub(r"const HUONG8 = new Set\(\[[^\]]*\]\);", 'const HUONG8 = new Set([%s]);' % ', '.join("'%s'" % k for k in co), js, count=1)
    if js2 != js: open(QA, 'w', encoding='utf-8').write(js2)
    print('HUONG8:', co)


if __name__ == '__main__':
    main()
