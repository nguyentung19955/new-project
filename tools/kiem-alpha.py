#!/usr/bin/env python3
"""Kiểm TĨNH kênh alpha của mọi ảnh game (không chạy game, không trình duyệt). Lỗi "nền đen" 14/10.

Chạy:
  python3 tools/kiem-alpha.py                      # so ảnh đang có trong game/art/custom với bản ở HEAD (trước khi commit đợt nén ảnh)
  python3 tools/kiem-alpha.py --goc a0da2ca~1      # so với một mốc git bất kỳ (vd. trước đợt nén ảnh a0da2ca)
  python3 tools/kiem-alpha.py --dist game/dist/anh # thêm: kiểm ảnh rời PNG + WebP do build.py --hai-tep ghi ra
  python3 tools/kiem-alpha.py --json ra.json       # ghi danh sách chi tiết

Mỗi ảnh (data:image/png trong *.sprite.json, "tam" hoặc "anh"):
  1. Giải mã HAI cách độc lập: Pillow, và một bộ giải mã PNG viết tay ngay dưới đây (zlib + bỏ lọc, đọc PLTE/tRNS/bKGD theo đúng
     chuẩn PNG như trình duyệt: mục bảng màu ngoài độ dài tRNS là đục hẳn). Hai cách lệch nhau một điểm nào => LỖI.
  2. Cấu trúc: CRC từng khối, tRNS dài hơn PLTE, ảnh bảng màu thiếu PLTE, chỉ số vượt bảng màu, khối lạ => LỖI.
  3. So với mốc --goc (cùng mã hình): đổi cỡ thì bỏ qua (ảnh vẽ lại), cùng cỡ mà alpha khác (đặc biệt điểm trong suốt thành đục) => LỖI.
     Đợt nén ảnh hợp lệ (nen-anh.py) giữ alpha y hệt nên không bao giờ vướng điều này.
  4. Cảnh báo (không làm hỏng lần chạy): ảnh không có điểm trong suốt nào mà viền là màu tối gần đen (có thể là nền đen
     dính vào), trừ các nhóm ảnh vốn đục (nền phòng, bản đồ, khung…) đã liệt kê ở DUC_HOP_LE.
Với --dist: mỗi <mã>.<băm>.png phải trùng byte với ảnh trong sprite.json; mỗi .webp giải mã (Pillow/libwebp) phải trùng RGBA y hệt
  PNG cùng mã (ở chỗ alpha > 0; chỗ alpha = 0 chỉ so alpha), cờ alpha trong đầu tệp WebP (VP8X / VP8L alpha_is_used) phải bật khi
  ảnh có điểm không đục — trình duyệt nào tin cờ này sẽ vẽ nền đục nếu cờ tắt.
Thoát mã 1 khi có LỖI. Cần: Pillow, numpy (tools/requirements.txt).
"""
import argparse
import base64
import glob
import io
import json
import os
import struct
import subprocess
import sys
import zlib

import numpy as np
from PIL import Image

DAY = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
CUSTOM = 'game/art/custom'
# Ảnh vốn đục hẳn (không cần trong suốt): nền phòng/bản đồ/khung… — chỉ dùng cho phần CẢNH BÁO viền tối.
DUC_HOP_LE = ('gd-ban-do', 'gd-nen', 'gd-khung', 'gd-the-', 'gd-man-', 'gd-phong-', 'gd-o-', 'nen-', 'phong-', 'san-', 'tuong-', 'lang-', 'bg-')


# ---------- bộ giải mã PNG viết tay (độc lập với Pillow) ----------
def doc_khoi(b):
    if b[:8] != b'\x89PNG\r\n\x1a\n':
        raise ValueError('không phải PNG')
    i, ds = 8, []
    while i < len(b):
        n, = struct.unpack('>I', b[i:i + 4]); t = b[i + 4:i + 8]; d = b[i + 8:i + 8 + n]; crc, = struct.unpack('>I', b[i + 8 + n:i + 12 + n])
        if zlib.crc32(t + d) & 0xffffffff != crc:
            raise ValueError('sai CRC khối ' + t.decode('latin1'))
        ds.append((t, d)); i += 12 + n
        if t == b'IEND':
            break
    return ds


def paeth(a, b, c):
    p = a + b - c; pa = abs(p - a); pb = abs(p - b); pc = abs(p - c)
    return a if pa <= pb and pa <= pc else b if pb <= pc else c


def giai_png(b):
    """Trả về (RGBA HxWx4 uint8, thông tin, danh sách lỗi cấu trúc)."""
    loi = []
    ds = doc_khoi(b)
    ihdr = ds[0][1] if ds and ds[0][0] == b'IHDR' else None
    if ihdr is None:
        raise ValueError('thiếu IHDR đầu tệp')
    W, H, bd, ct, _, _, il = struct.unpack('>IIBBBBB', ihdr)
    plte = trns = None; idat = b''
    for t, d in ds:
        if t == b'PLTE': plte = d
        elif t == b'tRNS': trns = d
        elif t == b'IDAT': idat += d
    kenh = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}[ct]
    if ct == 3 and plte is None: loi.append('ảnh bảng màu thiếu PLTE')
    if ct == 3 and trns is not None and plte is not None and len(trns) > len(plte) // 3: loi.append('tRNS dài hơn bảng màu')
    if ct in (4, 6) and trns is not None: loi.append('tRNS trong ảnh đã có alpha')
    raw = zlib.decompress(idat)
    bpp = max(1, kenh * bd // 8)

    def mot_luot(raw, i0, w, h):
        stride = (w * kenh * bd + 7) // 8
        out = bytearray(stride * h); prev = bytearray(stride); i = i0
        for y in range(h):
            f = raw[i]; row = bytearray(raw[i + 1:i + 1 + stride]); i += 1 + stride
            if f == 1:
                for x in range(bpp, stride): row[x] = (row[x] + row[x - bpp]) & 255
            elif f == 2:
                for x in range(stride): row[x] = (row[x] + prev[x]) & 255
            elif f == 3:
                for x in range(stride): row[x] = (row[x] + (((row[x - bpp] if x >= bpp else 0) + prev[x]) >> 1)) & 255
            elif f == 4:
                for x in range(stride): row[x] = (row[x] + paeth(row[x - bpp] if x >= bpp else 0, prev[x], prev[x - bpp] if x >= bpp else 0)) & 255
            elif f != 0:
                raise ValueError('bộ lọc dòng lạ %d' % f)
            out[y * stride:(y + 1) * stride] = row; prev = row
        a = np.frombuffer(bytes(out), np.uint8).reshape(h, stride)
        if bd < 8:
            a = np.unpackbits(a, axis=1).reshape(h, -1, bd)
            a = (a * (1 << np.arange(bd - 1, -1, -1))).sum(2).astype(np.uint16)[:, :w * kenh]
        elif bd == 16:
            a = a.view('>u2').astype(np.uint16)[:, :w * kenh]
        return a.reshape(h, w, kenh), i

    if il == 0:
        s, _ = mot_luot(raw, 0, W, H)
    else:  # Adam7
        s = np.zeros((H, W, kenh), np.uint16); i = 0
        for x0, y0, dx, dy in ((0, 0, 8, 8), (4, 0, 8, 8), (0, 4, 4, 8), (2, 0, 4, 4), (0, 2, 2, 4), (1, 0, 2, 2), (0, 1, 1, 2)):
            w = (W - x0 + dx - 1) // dx; h = (H - y0 + dy - 1) // dy
            if w <= 0 or h <= 0: continue
            p, i = mot_luot(raw, i, w, h); s[y0::dy, x0::dx] = p
    mx = (1 << bd) - 1
    to8 = (lambda v: (v.astype(np.uint32) * 255 // mx).astype(np.uint8)) if bd != 8 else (lambda v: v.astype(np.uint8))
    out = np.zeros((H, W, 4), np.uint8)
    if ct == 3:
        pal = np.frombuffer(plte or b'', np.uint8).reshape(-1, 3); n = len(pal)
        al = np.full(256, 255, np.uint8)
        if trns: al[:len(trns)] = np.frombuffer(trns[:256], np.uint8)
        idx = s[..., 0].astype(np.int64)
        if n == 0 or idx.max() >= n:
            loi.append('chỉ số điểm ảnh vượt bảng màu (%d mục)' % n)
            pal = np.concatenate([pal, np.zeros((256 - n, 3), np.uint8)])
        out[..., :3] = pal[idx]; out[..., 3] = al[idx]
    elif ct == 0:
        g = s[..., 0]; out[..., 0] = out[..., 1] = out[..., 2] = to8(g); out[..., 3] = 255
        if trns: out[..., 3][g == struct.unpack('>H', trns[:2])[0]] = 0
    elif ct == 2:
        out[..., :3] = to8(s); out[..., 3] = 255
        if trns:
            k = struct.unpack('>HHH', trns[:6]); out[..., 3][(s[..., 0] == k[0]) & (s[..., 1] == k[1]) & (s[..., 2] == k[2])] = 0
    elif ct == 4:
        out[..., 0] = out[..., 1] = out[..., 2] = to8(s[..., 0]); out[..., 3] = to8(s[..., 1])
    else:
        out[...] = to8(s)
    return out, {'mode': {0: 'L', 2: 'RGB', 3: 'P', 4: 'LA', 6: 'RGBA'}[ct], 'bd': bd, 'trns': len(trns) if trns else 0, 'plte': len(plte) // 3 if plte else 0}, loi


# ---------- WebP: cờ alpha trong đầu tệp ----------
def webp_co_alpha(b):
    if b[:4] != b'RIFF' or b[8:12] != b'WEBP':
        raise ValueError('không phải WebP')
    t = b[12:16]
    if t == b'VP8X':
        return bool(b[20] & 0x10), 'VP8X'
    if t == b'VP8L':
        # 0x2f, rồi 14 bit rộng-1, 14 bit cao-1, 1 bit alpha_is_used, 3 bit phiên bản
        v, = struct.unpack('<I', b[21:25])
        return bool((v >> 28) & 1), 'VP8L'
    return False, t.decode('latin1')  # VP8 (lossy) không có alpha


def anh_tep(d):
    k = 'tam' if isinstance(d.get('tam'), str) else 'anh' if isinstance(d.get('anh'), str) else None
    if not k or not d[k].startswith('data:image/png;base64,'):
        return None
    return base64.b64decode(d[k].split(',', 1)[1])


def rgba_pil(b):
    return np.array(Image.open(io.BytesIO(b)).convert('RGBA'))


def doc_goc(rev):
    """{mã: png bytes} của game/art/custom ở mốc git rev."""
    try:
        ten = subprocess.check_output(['git', '-C', DAY, 'ls-tree', '--name-only', rev, CUSTOM + '/'], text=True).split()
    except subprocess.CalledProcessError:
        sys.exit('không đọc được mốc git ' + rev)
    kq = {}
    for t in ten:
        if not t.endswith('.sprite.json'): continue
        try:
            d = json.loads(subprocess.check_output(['git', '-C', DAY, 'show', rev + ':' + t]))
        except Exception:
            continue
        b = anh_tep(d) if isinstance(d, dict) else None
        if b and isinstance(d.get('ma'), str): kq[d['ma']] = b
    return kq


def vien(a, n=1):
    return np.concatenate([a[:n].reshape(-1, 4), a[-n:].reshape(-1, 4), a[:, :n].reshape(-1, 4), a[:, -n:].reshape(-1, 4)])


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--goc', default='HEAD', help='mốc git để so alpha (mặc định HEAD; "-" để bỏ qua)')
    ap.add_argument('--dist', default=None, help='thư mục ảnh rời (game/dist/anh) để kiểm PNG + WebP')
    ap.add_argument('--json', default=None, help='ghi kết quả chi tiết')
    ap.add_argument('--tep', nargs='*', default=None, help='chỉ kiểm các mã này')
    ap.add_argument('--lech-ban-trong', type=int, default=0, help='so với mốc: cho phép alpha của điểm BÁN TRONG (0<α<255) lệch tối đa N '
                    '(nén có mất có chủ đích). Điểm trong suốt hẳn / đục hẳn đổi loại thì luôn là LỖI. Mặc định 0 = phải y hệt.')
    o = ap.parse_args()

    loi, canh, tom = [], [], {'tam': 0, 'P': 0, 'RGBA': 0, 'khac': 0, 'so_goc': 0, 'doi_co': 0}
    goc = doc_goc(o.goc) if o.goc != '-' else {}
    hien = {}
    for f in sorted(glob.glob(os.path.join(DAY, CUSTOM, '*.sprite.json'))):
        d = json.load(open(f, encoding='utf-8'))
        ma = d.get('ma'); b = anh_tep(d)
        if not b or (o.tep and ma not in o.tep): continue
        hien[ma] = b; tom['tam'] += 1
        try:
            a_tay, tt, l_ct = giai_png(b)
        except Exception as e:
            loi.append({'ma': ma, 'loi': 'giải mã viết tay hỏng: %s' % e}); continue
        tom[tt['mode'] if tt['mode'] in ('P', 'RGBA') else 'khac'] += 1
        for x in l_ct: loi.append({'ma': ma, 'loi': x, **tt})
        a = rgba_pil(b)
        if a.shape != a_tay.shape or (a[..., 3] != a_tay[..., 3]).any() or (a[..., :3][a[..., 3] > 0] != a_tay[..., :3][a[..., 3] > 0]).any():
            loi.append({'ma': ma, 'loi': 'Pillow và bộ giải mã viết tay lệch nhau', **tt})
        # so với mốc gốc
        if ma in goc and goc[ma] != b:
            g = rgba_pil(goc[ma]); tom['so_goc'] += 1
            if g.shape != a.shape:
                tom['doi_co'] += 1
            else:
                ga, aa = g[..., 3].astype(int), a[..., 3].astype(int)
                trong_thanh_duc = int(((ga < 255) & (aa == 255)).sum())
                doi_loai = int(((ga == 0) != (aa == 0)).sum() + ((ga == 255) != (aa == 255)).sum())
                ban = (ga > 0) & (ga < 255) & (aa > 0) & (aa < 255)
                lech_ban = int(np.abs(ga - aa)[ban].max()) if ban.any() else 0
                lech = int((ga != aa).sum())
                if doi_loai or lech_ban > o.lech_ban_trong:
                    loi.append({'ma': ma, 'loi': 'alpha khác mốc %s: %d điểm; %d điểm đổi loại trong suốt/đục (%d điểm thành ĐỤC); bán trong lệch tối đa %d'
                                % (o.goc, lech, doi_loai, trong_thanh_duc, lech_ban), **tt})
                elif lech:
                    canh.append({'ma': ma, 'canh': 'nén có mất: %d điểm bán trong lệch alpha tối đa %d (trong ngưỡng %d)' % (lech, lech_ban, o.lech_ban_trong), **tt})
        # cảnh báo nền tối
        if not ma.startswith(DUC_HOP_LE) and (a[..., 3] == 255).all():
            v = vien(a)
            if (v[:, :3].astype(int).sum(1) < 60).mean() > 0.9:
                canh.append({'ma': ma, 'canh': 'đục hẳn, viền gần đen (có thể dính nền đen)', **tt})

    # ảnh rời dist/anh
    if o.dist:
        thu = o.dist if os.path.isabs(o.dist) else os.path.join(DAY, o.dist)
        theo_ma = {}
        for p in sorted(glob.glob(os.path.join(thu, '*.png')) + glob.glob(os.path.join(thu, '*.webp'))):
            ten = os.path.basename(p); ma = ten.rsplit('.', 2)[0]
            theo_ma.setdefault(ma, []).append(p)
        tom['dist_png'] = tom['dist_webp'] = 0
        for ma, ps in sorted(theo_ma.items()):
            if o.tep and ma not in o.tep: continue
            src = hien.get(ma)
            if src is None:
                canh.append({'ma': ma, 'canh': 'ảnh rời không còn sprite.json tương ứng (bản build cũ?)'}); continue
            a = rgba_pil(src)
            for p in ps:
                b = open(p, 'rb').read()
                if p.endswith('.png'):
                    tom['dist_png'] += 1
                    if b != src: loi.append({'ma': ma, 'loi': 'dist PNG khác ảnh trong sprite.json: ' + os.path.basename(p)})
                    continue
                tom['dist_webp'] += 1
                co, kieu = webp_co_alpha(b)
                w = rgba_pil(b)
                if w.shape != a.shape:
                    loi.append({'ma': ma, 'loi': 'WebP khác cỡ: ' + os.path.basename(p)}); continue
                if (w[..., 3] != a[..., 3]).any():
                    loi.append({'ma': ma, 'loi': 'WebP mất/đổi alpha (%d điểm): %s' % (int((w[..., 3] != a[..., 3]).sum()), os.path.basename(p))})
                elif (w[..., :3][a[..., 3] > 0] != a[..., :3][a[..., 3] > 0]).any():
                    loi.append({'ma': ma, 'loi': 'WebP đổi màu: ' + os.path.basename(p)})
                if (a[..., 3] < 255).any() and not co:
                    loi.append({'ma': ma, 'loi': 'WebP %s tắt cờ alpha dù ảnh có điểm trong suốt: %s' % (kieu, os.path.basename(p))})

    print('Ảnh: %(tam)d tấm (bảng màu P %(P)d, RGBA %(RGBA)d, khác %(khac)d); khác mốc gốc: %(so_goc)d (đổi cỡ, bỏ qua: %(doi_co)d)' % tom)
    if o.dist: print('Ảnh rời: %d PNG, %d WebP' % (tom['dist_png'], tom['dist_webp']))
    for c in canh: print('  cảnh báo', c)
    for x in loi: print('  LỖI', x)
    print('KẾT QUẢ: %s (%d lỗi, %d cảnh báo)' % ('ĐẠT' if not loi else 'HỎNG', len(loi), len(canh)))
    if o.json:
        json.dump({'tom_tat': tom, 'loi': loi, 'canh_bao': canh}, open(o.json, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    return 1 if loi else 0


if __name__ == '__main__':
    sys.exit(main())
