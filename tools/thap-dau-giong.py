#!/usr/bin/env python3
"""TURRET MERGE — KIỂM ĐẦU ỤNG GIỐNG NHAU (người chơi nhầm trên bàn, vd. Copycat ≈ Twin Maker).
So mọi cặp đầu bàn chơi thap/assets/<id>_nong.png (85 ụ trong ROSTER_EMBED) ở 64 px:
  dáng   = 0.40·giao histogram HSV + 0.35·SSIM ảnh xám (nền xám trung tính) + 0.25·IoU bóng (alpha)
  nhấn   = cosin bản đồ MÀU NHẤN đã làm nhoè (điểm bão hoà KHÔNG thuộc màu viền độ hiếm, 6 dải màu) → bắt 2 ụ cùng
           viền vàng nhưng cùng "món" giống nhau (vd. 2 màn hình xanh lơ ở trước nòng: Copycat cũ ≈ Twin Maker)
  điểm   = 0.5·dáng + 0.5·nhấn   (0..1, càng cao càng giống)
Chạy:  python3 tools/thap-dau-giong.py            → in top 15 + ghi docs/demo-hop-tuong/tuvan/dau_giong/{cap_giong.png,DANH-SACH.md,diem.json}
       python3 tools/thap-dau-giong.py --kiem     → thoát mã 1 nếu 2 ụ CÙNG ĐỘ HIẾM vượt NGUONG (dùng trong thap-kt-hoiquy.js)
"""
import json, os, re, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage
from skimage.metrics import structural_similarity as ssim

GOC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
A = os.path.join(GOC, 'thap', 'assets'); JS = os.path.join(GOC, 'thap', 'js')
OUT = os.path.join(GOC, 'docs', 'demo-hop-tuong', 'tuvan', 'dau_giong')
NGUONG = 0.86          # cùng độ hiếm & điểm ≥ NGUONG → hỏng. Cao nhất hiện tại 0.844 (đã xem bằng mắt). Đo máy chỉ chặn đầu gần TRÙNG;
                       # cặp "cùng ý" (Copycat cũ ≈ Twin Maker = 0.789) vẫn phải xem cap_giong.png bằng mắt
MIEN = {}              # cặp đã xem & chấp nhận: {'a|b': 'lý do'} (a<b)
TEN_BAC = {'trang': 'Common (white)', 'xanh': 'Rare (blue)', 'tim': 'Epic (purple)', 'vang': 'Legendary (gold)', 'do': 'Mythic (red)'}
N = 64
DAI_BAC = {'vang': (0.08, 0.17), 'tim': (0.70, 0.86), 'xanh': (0.52, 0.66), 'do': (0.95, 0.04), 'trang': None}   # dải màu viền theo bậc (H 0..1)


def roster():
    t = open(os.path.join(JS, 'meta.js'), encoding='utf-8').read()
    R = json.loads(re.search(r'window.ROSTER_EMBED = (\[.*?\]);\n', t, re.S).group(1))
    tx = open(os.path.join(JS, 'text.js'), encoding='utf-8').read()
    en = {m.group(1): (m.group(2), m.group(3)) for m in re.finditer(r"^\s*([a-z0-9_]+):\s*\{\s*name:\s*'([^']+)',\s*skill:\s*'([^']*)'", tx, re.M)}
    for r in R: r['en'], r['sk'] = en.get(r['id'], (r['ten'], r['kyNang']))
    return R


def trong(H, r):
    if r is None: return np.zeros_like(H, bool)
    a, b = r
    return (H >= a) & (H <= b) if a < b else (H >= a) | (H <= b)


def dac(id_, bac):
    im = Image.open(os.path.join(A, id_ + '_nong.png')).convert('RGBA').convert('RGBa').resize((N, N), Image.LANCZOS).convert('RGBA')
    a = np.asarray(im).astype(np.float32) / 255
    al = a[..., 3]; rgb = a[..., :3]
    xam = rgb * al[..., None] + 0.5 * (1 - al[..., None])
    g = xam @ np.array([0.299, 0.587, 0.114])
    hsv = np.asarray(Image.fromarray((xam * 255).astype(np.uint8)).convert('HSV')).astype(np.float32) / 255
    w = al.ravel()
    h, _ = np.histogramdd(np.c_[hsv[..., 0].ravel(), hsv[..., 1].ravel(), hsv[..., 2].ravel()], bins=(12, 4, 4), range=((0, 1),) * 3, weights=w)
    Hh, Ss, Vv = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    acc = (Ss > 0.4) & (Vv > 0.4) & (al > 0.6) & ~trong(Hh, DAI_BAC.get(bac))
    v = np.stack([ndimage.gaussian_filter((((Hh * 6 + 0.5).astype(int) % 6 == b) & acc).astype(float), 3) for b in range(6)]).ravel()
    return {'g': g, 'm': al > 0.5, 'h': h.ravel() / max(h.sum(), 1e-6), 'n': v / max(np.linalg.norm(v), 1e-6)}


def diem(p, q):
    mau = float(np.minimum(p['h'], q['h']).sum())
    s = float(ssim(p['g'], q['g'], data_range=1.0))
    iou = float((p['m'] & q['m']).sum() / max((p['m'] | q['m']).sum(), 1))
    nhan = float(p['n'] @ q['n'])
    dang = 0.40 * mau + 0.35 * max(s, 0) + 0.25 * iou
    return 0.5 * dang + 0.5 * nhan, mau, s, iou, nhan


def tinh():
    R = [r for r in roster() if os.path.exists(os.path.join(A, r['id'] + '_nong.png'))]
    F = {r['id']: dac(r['id'], r['bac']) for r in R}
    cap = []
    for i in range(len(R)):
        for j in range(i + 1, len(R)):
            a, b = R[i], R[j]
            d, mau, s, iou, nhan = diem(F[a['id']], F[b['id']])
            cap.append({'a': a['id'], 'b': b['id'], 'diem': round(d, 4), 'mau': round(mau, 3), 'ssim': round(s, 3), 'iou': round(iou, 3), 'nhan': round(nhan, 3),
                        'cungBac': a['bac'] == b['bac'], 'bacA': a['bac'], 'bacB': b['bac'], 'tenA': a['en'], 'tenB': b['en'], 'skA': a['sk'], 'skB': b['sk']})
    cap.sort(key=lambda c: -c['diem'])
    return R, cap


def to_sheet(cap, path, k=15):
    o = 150; W = 2 * o + 30; H = 40 + k * (o + 34)
    sh = Image.new("RGB", (W + 600, H), (40, 44, 52)); d = ImageDraw.Draw(sh)
    try: f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 15); fb = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 17)
    except Exception: f = fb = ImageFont.load_default()
    d.text((10, 10), 'Top %d most similar board heads (score = ½ shape[colour/SSIM/IoU] + ½ accent-colour map)' % k, fill=(255, 255, 255), font=fb)
    be = Image.open(os.path.join(A, 'de_chung.png')).convert('RGBA') if os.path.exists(os.path.join(A, 'de_chung.png')) else None
    for n, c in enumerate(cap[:k]):
        y = 40 + n * (o + 34)
        for m, id_ in enumerate((c['a'], c['b'])):
            x = 10 + m * (o + 10)
            nen = Image.new('RGBA', (o, o), (70, 76, 88, 255))
            if be: nen.alpha_composite(be.resize((int(o * 0.7), int(o * 0.7)), Image.LANCZOS), (int(o * 0.15), int(o * 0.15)))
            im = Image.open(os.path.join(A, id_ + '_nong.png')).convert('RGBA').resize((int(o * 0.9), int(o * 0.9)), Image.LANCZOS)
            nen.alpha_composite(im, (int(o * 0.05), int(o * 0.05)))
            sh.paste(nen.convert('RGB'), (x, y))
        tx = 10 + 2 * (o + 10) + 10
        d.text((tx, y + 6), '#%d  score %.3f%s' % (n + 1, c['diem'], '   SAME RARITY' if c['cungBac'] else ''), fill=(255, 210, 63) if c['cungBac'] else (200, 200, 200), font=fb)
        d.text((tx, y + 32), '%s (%s) — %s' % (c['tenA'], c['a'], TEN_BAC[c['bacA']]), fill=(255, 255, 255), font=f)
        d.text((tx, y + 54), '%s (%s) — %s' % (c['tenB'], c['b'], TEN_BAC[c['bacB']]), fill=(255, 255, 255), font=f)
        d.text((tx, y + 80), 'colour %.2f · SSIM %.2f · IoU %.2f · accent %.2f' % (c['mau'], c['ssim'], c['iou'], c['nhan']), fill=(170, 170, 170), font=f)
    sh.save(path)


if __name__ == '__main__':
    R, cap = tinh()
    if '--kiem' in sys.argv:
        loi = [c for c in cap if c['cungBac'] and c['diem'] >= NGUONG and '%s|%s' % tuple(sorted((c['a'], c['b']))) not in MIEN]
        for c in cap[:5]: print('  %.3f %s/%s%s' % (c['diem'], c['a'], c['b'], ' (cùng bậc)' if c['cungBac'] else ''))
        if loi:
            for c in loi: print('✗ ĐẦU GIỐNG: %s ≈ %s (%s) điểm %.3f ≥ %.2f' % (c['tenA'], c['tenB'], c['bacA'], c['diem'], NGUONG))
            sys.exit(1)
        print('✓ không có 2 ụ cùng độ hiếm giống nhau (≥ %.2f)' % NGUONG); sys.exit(0)
    os.makedirs(OUT, exist_ok=True)
    tag = sys.argv[sys.argv.index('--ten') + 1] if '--ten' in sys.argv else ''
    to_sheet(cap, os.path.join(OUT, 'cap_giong%s.png' % tag))
    json.dump(cap[:60], open(os.path.join(OUT, 'diem%s.json' % tag), 'w'), ensure_ascii=False, indent=1)
    for n, c in enumerate(cap[:20]): print('%2d %.3f %-12s %-12s %s %s %s' % (n + 1, c['diem'], c['a'], c['b'], c['bacA'], c['bacB'], '*' if c['cungBac'] else ''))
