#!/usr/bin/env python3
"""Bớt màu ảnh vũ khí AI (game/art/custom/vk-*.sprite.json) theo Luật vẽ chung (docs/LUAT-VE-CHUNG.md):
tối đa 16 màu (không tính trong suốt), dồn về bảng màu lõi (docs/review/ra-soat-my-thuat/bang-mau.json) khi đủ gần.

Không nằm trong bản game: chỉ là công cụ chạy tay. Bản cũ của các tệp vẫn trong git để quay lại
(git checkout <commit> -- game/art/custom/vk-*.sprite.json).

Cách làm mỗi ảnh (không đổi kích thước ảnh, cam, mui, day hay bất cứ số nào khác trong tệp):
  1. Điểm ảnh: alpha >= 128 là đặc, còn lại trong suốt (ảnh vũ khí vốn đã không có nửa trong).
  2. Gom màu gần nhau trong không gian Lab (gộp dần cặp gần nhất, có trọng số theo số điểm ảnh) tới khi:
     số màu <= TRAN (16) và không còn cặp nào gần hơn GOP (ΔE76, mặc định 8). Màu tối nhất (viền) và sáng nhất (lòng mắt vũ khí sống,
     điểm sáng nhấn) được GIỮ NGUYÊN, không trôi khi gộp.
  3. Dồn về bảng màu lõi + màu hệ: màu nào cách màu bảng <= DON (ΔE76 ~12) thì đổi hẳn sang màu bảng, miễn là không có màu khác
     của ảnh đã chiếm màu bảng đó (tránh hai sắc của một khối bị nhập làm một -> bệt).
  4. Ảnh nào sau khi gom còn ít hơn SAN (8) màu thì gom nhẹ hơn (GOP nhỏ lại) cho đỡ bệt và ghi lại.

Chạy:  python3 tools/bot-mau-vu-khi.py [--thu] [--gop 6] [--don 12] [--tran 16]
  --thu: chỉ in số liệu, không ghi tệp.
"""
import os, sys, io, json, glob, base64, argparse
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CUSTOM = os.path.join(ROOT, 'game', 'art', 'custom')
BANG = os.path.join(ROOT, 'docs', 'review', 'ra-soat-my-thuat', 'bang-mau.json')


def hex2rgb(h):
    h = h.lstrip('#'); return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


def rgb2lab(rgb):
    a = np.asarray(rgb, dtype=np.float64) / 255.0
    a = np.where(a > 0.04045, ((a + 0.055) / 1.055) ** 2.4, a / 12.92)
    M = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]])
    xyz = a @ M.T / np.array([0.95047, 1.0, 1.08883])
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    L = 116 * f[..., 1] - 16; A = 500 * (f[..., 0] - f[..., 1]); B = 200 * (f[..., 1] - f[..., 2])
    return np.stack([L, A, B], -1)


def doc_bang():
    d = json.load(open(BANG))
    ds = [c['hex'] for c in d['core']]
    for v in d.get('he', {}).values(): ds += [c['hex'] for c in v]
    rgb = np.array([hex2rgb(h) for h in ds], dtype=np.float64)
    return rgb, rgb2lab(rgb)


def gom(cols, cnt, gop, tran):
    """cols: Nx3 rgb, cnt: N. Trả về (danh sách cụm: mỗi cụm là list chỉ số màu gốc, màu đại diện rgb)."""
    lab = rgb2lab(cols)
    L = lab[:, 0]
    giu = {int(np.argmin(L)), int(np.argmax(L))}  # viền tối nhất, điểm sáng nhất: giữ nguyên
    cum = [{'ix': [i], 'w': float(cnt[i]), 'lab': lab[i].copy(), 'rgb': cols[i].copy(), 'giu': i in giu} for i in range(len(cols))]
    while len(cum) > 1:
        best, bi, bj = 1e9, -1, -1
        for i in range(len(cum)):
            for j in range(i + 1, len(cum)):
                if cum[i]['giu'] and cum[j]['giu']: continue
                d = float(np.linalg.norm(cum[i]['lab'] - cum[j]['lab']))
                if d < best: best, bi, bj = d, i, j
        if bi < 0 or (best >= gop and len(cum) <= tran): break
        a, b = cum[bi], cum[bj]
        if a['giu'] or b['giu']:
            k = a if a['giu'] else b
            m = {'ix': a['ix'] + b['ix'], 'w': a['w'] + b['w'], 'lab': k['lab'], 'rgb': k['rgb'], 'giu': True}
        else:
            w = a['w'] + b['w']
            rgb = (a['rgb'] * a['w'] + b['rgb'] * b['w']) / w
            m = {'ix': a['ix'] + b['ix'], 'w': w, 'rgb': rgb, 'lab': rgb2lab(rgb[None])[0], 'giu': False}
        cum = [c for k, c in enumerate(cum) if k not in (bi, bj)] + [m]
    return cum


def don(cum, prgb, plab, nguong):
    """Dồn mỗi cụm về màu bảng gần nhất nếu ΔE <= nguong, mỗi màu bảng chỉ cho một cụm (cụm gần nhất)."""
    ung = []
    for ci, c in enumerate(cum):
        d = np.linalg.norm(plab - c['lab'], axis=1)
        j = int(np.argmin(d))
        if d[j] <= nguong: ung.append((float(d[j]), ci, j))
    ung.sort()
    da, so = set(), 0
    for d, ci, j in ung:
        if j in da: continue
        c = cum[ci]
        if c['giu'] and c['lab'][0] == min(x['lab'][0] for x in cum) and d > 6: continue  # viền: chỉ dồn nếu rất gần
        da.add(j); c['rgb'] = prgb[j].copy(); so += 1
    return so


def xu_ly(path, prgb, plab, gop, dn, tran, san):
    d = json.load(open(path))
    raw = base64.b64decode(d['anh'].split(',', 1)[1])
    im = Image.open(io.BytesIO(raw)).convert('RGBA')
    a = np.asarray(im).copy()
    dac = a[..., 3] >= 128
    px = a[..., :3][dac].astype(np.int64)
    key = (px[:, 0] << 16) | (px[:, 1] << 8) | px[:, 2]
    uq, inv, cnt = np.unique(key, return_inverse=True, return_counts=True)
    cols = np.stack([(uq >> 16) & 255, (uq >> 8) & 255, uq & 255], -1).astype(np.float64)
    g = gop
    cum = gom(cols, cnt, g, tran)
    ghi = ''
    while len(cum) < san and g > 2 and len(uq) >= san:
        g -= 1.5; cum = gom(cols, cnt, g, tran); ghi = 'gom nhẹ (ΔE %.1f) cho đỡ bệt' % g
    so_don = don(cum, prgb, plab, dn)
    ra = np.zeros((len(uq), 3), dtype=np.uint8)
    for c in cum:
        v = np.clip(np.round(c['rgb']), 0, 255).astype(np.uint8)
        for i in c['ix']: ra[i] = v
    out = np.zeros_like(a)
    out[..., :3][dac] = ra[inv]
    out[..., 3] = np.where(dac, 255, 0)
    # lệch màu trung bình (ΔE) theo điểm ảnh, để biết ảnh có bị đổi nhiều không
    lech = float(np.mean(np.linalg.norm(rgb2lab(ra[inv].astype(np.float64)) - rgb2lab(px.astype(np.float64)), axis=1))) if len(px) else 0
    img = Image.fromarray(out, 'RGBA')
    nmau = len(np.unique(ra, axis=0))
    # lưu dạng bảng màu (P) + 1 màu trong suốt: nhẹ hơn RGBA
    buf = io.BytesIO(); img.save(buf, 'PNG', optimize=True)
    rgba_bytes = buf.getvalue()
    try:
        p = Image.new('P', img.size)
        cl = [tuple(int(x) for x in v) for v in np.unique(ra, axis=0)]
        idx = {c: i + 1 for i, c in enumerate(cl)}
        flat = [0, 0, 0] + [x for c in cl for x in c]
        p.putpalette(flat + [0] * (768 - len(flat)))
        arr = np.zeros(a.shape[:2], dtype=np.uint8)
        sol = out[..., :3][dac]
        arr[dac] = np.array([idx[tuple(int(x) for x in v)] for v in sol], dtype=np.uint8)
        p = Image.fromarray(arr, 'P'); p.putpalette(flat + [0] * (768 - len(flat)))
        b2 = io.BytesIO(); p.save(b2, 'PNG', optimize=True, transparency=0)
        # kiểm lại: giải ra phải y hệt
        chk = np.asarray(Image.open(io.BytesIO(b2.getvalue())).convert('RGBA'))
        if np.array_equal(chk[..., 3] >= 128, dac) and np.array_equal(chk[..., :3][dac], out[..., :3][dac]) and len(b2.getvalue()) < len(rgba_bytes):
            rgba_bytes = b2.getvalue()
    except Exception:
        pass
    assert img.size == im.size
    d['anh'] = 'data:image/png;base64,' + base64.b64encode(rgba_bytes).decode()
    return d, {'tep': os.path.basename(path), 'truoc': int(len(uq)), 'sau': int(nmau), 'don': so_don, 'lech': round(lech, 2), 'byte_truoc': len(raw), 'byte_sau': len(rgba_bytes), 'ghi': ghi}, im, Image.open(io.BytesIO(rgba_bytes)).convert('RGBA')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--thu', action='store_true')
    ap.add_argument('--gop', type=float, default=8.0)
    ap.add_argument('--don', type=float, default=12.0)
    ap.add_argument('--tran', type=int, default=16)
    ap.add_argument('--san', type=int, default=8)
    ap.add_argument('--anh', default='', help='thư mục ghi ảnh trước/sau (tuỳ chọn)')
    o = ap.parse_args()
    prgb, plab = doc_bang()
    tk = []
    anh = {}
    for f in sorted(glob.glob(os.path.join(CUSTOM, 'vk-*.sprite.json'))):
        d, s, a, b = xu_ly(f, prgb, plab, o.gop, o.don, o.tran, o.san)
        tk.append(s); anh[s['tep']] = (a, b)
        if not o.thu:
            txt = json.dumps(d, ensure_ascii=False, separators=(',', ':'))
            src = open(f).read()
            if src.startswith('{\n'): txt = json.dumps(d, ensure_ascii=False, indent=1)
            open(f, 'w').write(txt + ('\n' if src.endswith('\n') else ''))
    n = len(tk)
    print('Số ảnh: %d' % n)
    print('Màu trung bình: trước %.1f, sau %.1f (ít nhất %d, nhiều nhất %d)' % (sum(t['truoc'] for t in tk) / n, sum(t['sau'] for t in tk) / n, min(t['sau'] for t in tk), max(t['sau'] for t in tk)))
    print('Màu đã dồn về bảng lõi, trung bình mỗi ảnh: %.1f' % (sum(t['don'] for t in tk) / n))
    print('Lệch màu trung bình theo điểm ảnh ΔE: %.2f (lớn nhất %.2f)' % (sum(t['lech'] for t in tk) / n, max(t['lech'] for t in tk)))
    print('Dung lượng ảnh: trước %d KB, sau %d KB' % (sum(t['byte_truoc'] for t in tk) // 1024, sum(t['byte_sau'] for t in tk) // 1024))
    for t in tk:
        if t['ghi']: print('  ', t['tep'], t['ghi'], t['sau'], 'màu')
    if o.anh:
        os.makedirs(o.anh, exist_ok=True)
        json.dump(tk, open(os.path.join(o.anh, 'bot-mau-so-lieu.json'), 'w'), ensure_ascii=False, indent=1)
        chon = ['vk-%s-%d' % (t, f) for t in ('sword', 'bow', 'spear', 'hammer') for f in (0, 3, 6)] + ['vk-sword-0-fire', 'vk-bow-2-ice', 'vk-spear-1-poison', 'vk-hammer-5-fire']
        Z, ow, oh = 4, 62, 50
        S = Image.new('RGBA', ((ow * 2 + 6) * Z * 4 + 8, (oh + 12) * Z * 4 + 8), (58, 72, 58, 255))
        from PIL import ImageDraw
        dr = ImageDraw.Draw(S)
        for k, ma in enumerate(chon):
            a, b = anh[ma + '.sprite.json']
            cx, cy = (k % 4) * (ow * 2 + 6) * Z + 4, (k // 4) * (oh + 12) * Z + 4
            st = next(t for t in tk if t['tep'] == ma + '.sprite.json')
            dr.text((cx + 4, cy + 2), '%s   truoc %d mau  |  sau %d mau' % (ma, st['truoc'], st['sau']), fill=(255, 255, 255, 255))
            for q, im in enumerate((a, b)):
                sc = min(ow * Z / im.width, oh * Z / im.height)
                sc = max(1, int(sc)) if sc >= 1 else sc
                r = im.resize((max(1, int(im.width * sc)), max(1, int(im.height * sc))), Image.NEAREST)
                bx = cx + q * ow * Z
                dr.rectangle((bx + 2, cy + 14, bx + ow * Z - 2, cy + 14 + oh * Z), fill=(70, 88, 70, 255) if q == 0 else (64, 96, 64, 255))
                S.alpha_composite(r, (bx + (ow * Z - r.width) // 2, cy + 14 + (oh * Z - r.height) // 2))
        S.save(os.path.join(o.anh, 'a-bot-mau-truoc-sau.png'))
        print('Ảnh:', os.path.join(o.anh, 'a-bot-mau-truoc-sau.png'))


if __name__ == '__main__':
    main()
