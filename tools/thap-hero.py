#!/usr/bin/env python3
"""TURRET MERGE — ẢNH LỚN (HERO) phi công/chỉ huy cho trang ụ, trang chỉ huy, màn chính.
User: 'cái gì mà cứ mờ mờ… để ảnh thôi không cần ụ súng, làm nét ảnh lên'.
Trước: hero dùng pilot_<id>.png 256 px phóng lên ~330–510 css (×3 DPR = 4–6 lần) → mờ.
Nay:  cắt lại từ TẤM GỐC ChatGPT (docs/demo-hop-tuong/thap-art/raw_*.png; vị trí tìm bằng so khớp ảnh v2 với tấm — tools/thap-hero.json),
      phóng ×4 bằng Real-ESRGAN x4plus_anime_6B (BSD-3-Clause, github.com/xinntao/Real-ESRGAN, bản v0.2.2.4; chạy CPU, torch),
      thu Lanczos về đúng 3× cỡ hiển thị:
        thap/assets/hero/hero_<id>.jpg      1170×1020  (hero trang ụ 390×340 css)
        thap/assets/hero/hero_af_<id>.webp  1170×1020  (hero trang chỉ huy; tấm chỉ huy nền magenta → khoá màu, nền trong suốt)
        thap/assets/hero/home_af_<id>.webp  1260×1260  (ảnh chỉ huy màn chính 420×420 css, nền trong suốt)
      Không kéo dài/không làm mờ đỉnh đầu (khác tools/thap-pilot-fit.py): mép trên = mép trên của vùng cắt trong tấm gốc.
Chạy: python3 tools/thap-hero.py [id ...]   (cần: pip install torch; trọng số RealESRGAN_x4plus_anime_6B.pth ở $ESR_PTH)
Thẻ/thanh bài vẫn dùng pilot_<id>.png nhỏ (đủ 3× cho cỡ đó).
"""
import json, os, sys
import numpy as np
from PIL import Image
GOC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
ART = os.path.join(GOC, 'docs', 'demo-hop-tuong', 'thap-art')
OUT = os.path.join(GOC, 'thap', 'assets', 'hero'); os.makedirs(OUT, exist_ok=True)
CACHE = os.environ.get('ESR_CACHE', '/tmp/esr-cache'); os.makedirs(CACHE, exist_ok=True)
PTH = os.environ.get('ESR_PTH', '/tmp/claude-0/dl/anime6b.pth')
M = json.load(open(os.path.join(GOC, 'tools', 'thap-hero.json')))
HW, HH = 1170, 1020          # 3 × 390×340
TRIM = 0.035                 # bỏ viền khung ô lưới của tấm (vạch sáng mảnh)

_net = None
def up4(im):
    """Real-ESRGAN x4plus_anime_6B (RRDBNet 6 khối), xử lý theo ô 192 px có lề 12 px."""
    global _net
    import torch, torch.nn as nn, torch.nn.functional as F
    if _net is None:
        class RDB(nn.Module):
            def __init__(s, nf=64, gc=32):
                super().__init__()
                s.conv1 = nn.Conv2d(nf, gc, 3, 1, 1); s.conv2 = nn.Conv2d(nf + gc, gc, 3, 1, 1); s.conv3 = nn.Conv2d(nf + 2 * gc, gc, 3, 1, 1)
                s.conv4 = nn.Conv2d(nf + 3 * gc, gc, 3, 1, 1); s.conv5 = nn.Conv2d(nf + 4 * gc, nf, 3, 1, 1); s.l = nn.LeakyReLU(0.2, True)
            def forward(s, x):
                x1 = s.l(s.conv1(x)); x2 = s.l(s.conv2(torch.cat((x, x1), 1))); x3 = s.l(s.conv3(torch.cat((x, x1, x2), 1)))
                x4 = s.l(s.conv4(torch.cat((x, x1, x2, x3), 1))); return s.conv5(torch.cat((x, x1, x2, x3, x4), 1)) * 0.2 + x
        class RRDB(nn.Module):
            def __init__(s):
                super().__init__(); s.rdb1 = RDB(); s.rdb2 = RDB(); s.rdb3 = RDB()
            def forward(s, x): return s.rdb3(s.rdb2(s.rdb1(x))) * 0.2 + x
        class Net(nn.Module):
            def __init__(s, nf=64):
                super().__init__()
                s.conv_first = nn.Conv2d(3, nf, 3, 1, 1); s.body = nn.Sequential(*[RRDB() for _ in range(6)]); s.conv_body = nn.Conv2d(nf, nf, 3, 1, 1)
                s.conv_up1 = nn.Conv2d(nf, nf, 3, 1, 1); s.conv_up2 = nn.Conv2d(nf, nf, 3, 1, 1); s.conv_hr = nn.Conv2d(nf, nf, 3, 1, 1)
                s.conv_last = nn.Conv2d(nf, 3, 3, 1, 1); s.l = nn.LeakyReLU(0.2, True)
            def forward(s, x):
                f = s.conv_first(x); f = f + s.conv_body(s.body(f))
                f = s.l(s.conv_up1(F.interpolate(f, scale_factor=2, mode='nearest')))
                f = s.l(s.conv_up2(F.interpolate(f, scale_factor=2, mode='nearest')))
                return s.conv_last(s.l(s.conv_hr(f)))
        _net = Net(); sd = torch.load(PTH, map_location='cpu', weights_only=True)
        _net.load_state_dict(sd.get('params_ema', sd.get('params', sd))); _net.eval()
    a = np.asarray(im.convert('RGB')).astype(np.float32) / 255.
    x = torch.from_numpy(a).permute(2, 0, 1)[None]; _, _, H, W = x.shape
    out = torch.zeros(1, 3, H * 4, W * 4); T, P = 192, 12
    with torch.no_grad():
        for y0 in range(0, H, T):
            for x0 in range(0, W, T):
                y1, x1 = min(y0 + T, H), min(x0 + T, W)
                ya, xa, yb, xb = max(y0 - P, 0), max(x0 - P, 0), min(y1 + P, H), min(x1 + P, W)
                o = _net(x[:, :, ya:yb, xa:xb])
                out[:, :, y0 * 4:y1 * 4, x0 * 4:x1 * 4] = o[:, :, (y0 - ya) * 4:(y0 - ya) * 4 + (y1 - y0) * 4, (x0 - xa) * 4:(x0 - xa) * 4 + (x1 - x0) * 4]
    return Image.fromarray((out[0].clamp(0, 1).permute(1, 2, 0).numpy() * 255 + .5).astype(np.uint8))

def khoa(im):
    """khoá nền magenta #FF00FF → alpha mềm + khử ám hồng ở viền (QUY-TAC-HINH §5)."""
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    d = np.sqrt(((a - [255, 0, 255]) ** 2).sum(2))
    al = np.clip((d - 60) / 110, 0, 1)
    k = (1 - al)[..., None]
    c = np.clip((a - k * [255, 0, 255]) / np.maximum(al[..., None], 1e-3), 0, 255)
    g = c[..., 1]; c[..., 0] = np.minimum(c[..., 0], np.maximum(g, c[..., 0] - 40 * (1 - al))); c[..., 2] = np.minimum(c[..., 2], np.maximum(g, c[..., 2] - 40 * (1 - al)))
    return Image.fromarray(np.dstack([c, al * 255]).astype(np.uint8), 'RGBA')

def luu(im, ten, kich):
    if ten.startswith('af_'):
        im = khoa(im).resize(kich, Image.LANCZOS)
        p = os.path.join(OUT, ten + '.webp'); im.save(p, quality=90, method=6)
    else:
        im = im.resize(kich, Image.LANCZOS); p = os.path.join(OUT, ten + '.jpg'); im.save(p, quality=90, optimize=True, progressive=True)

def luu_af(im, ten, kich):
    im = khoa(im).resize(kich, Image.LANCZOS); im.save(os.path.join(OUT, ten + '.webp'), quality=90, method=6)

def vung(id):
    m = M[id]; x0, y0, x1, y1 = m['o']; w = x1 - x0
    if m['kieu'] in ('o', 'vung'):
        t = round(w * TRIM); x0 += t; x1 -= t; y0 += t if m['kieu'] == 'o' else 0; y1 -= t
    return m['nguon'], (x0, y0, x1, y1)

def lam(id):
    nguon, (x0, y0, x1, y1) = vung(id)
    sheet = Image.open(os.path.join(ART, nguon)).convert('RGB')
    w = x1 - x0; h = min(y1 - y0, round(w * HH / HW))
    box = (x0, y0, x1, y0 + h)
    ten = 'af_' + id[3:] if id.startswith('af_') else id
    c = os.path.join(CACHE, ten + '_%d_%d_%d_%d.png' % box)
    if os.path.exists(c): big = Image.open(c)
    else:
        src = sheet.crop(box)
        big = up4(src) if w < HW * 0.98 else src
        big.save(c)
    if M[id]['kieu'] == 'o':  # ô lưới: viền khung bo tròn của tấm còn lộ ở góc → cắt thêm 2.5 % (trên ảnh đã phóng)
        e = round(big.width * 0.025); big = big.crop((e, e, big.width - e, e + round((big.width - 2 * e) * HH / HW)))
    luu(big, 'hero_' + ten, (HW, HH)) if not ten.startswith('af_') else luu_af(big, 'hero_' + ten, (HW, HH))
    info = '%s %s %s %dx%d → %dx%d' % (ten, nguon, box, w, h, HW, HH)
    if id.startswith('af_'):  # màn chính: vuông 1260 (3× 420 css)
        s = min(x1 - x0, y1 - y0); sb = (x0, y0, x0 + s, y0 + s)
        c2 = os.path.join(CACHE, ten + '_sq_%d_%d_%d_%d.png' % sb)
        if os.path.exists(c2): b2 = Image.open(c2)
        else: b2 = up4(sheet.crop(sb)); b2.save(c2)
        luu_af(b2, 'home_' + ten, (1260, 1260))
        info += ' · home %dpx → 1260' % s
    print(info, flush=True)

if __name__ == '__main__':
    ds = sys.argv[1:] or sorted(M)
    for id in ds: lam(id)
