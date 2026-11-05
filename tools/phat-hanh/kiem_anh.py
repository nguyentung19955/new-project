#!/usr/bin/env python3
"""Cổng kiểm trước khi đăng — KIỂM ẢNH (phiên F1, docs/review/ke-hoach-cai-thien/on-dinh-f1-phat-hanh/bao-cao.md).

Chỉ ĐỌC, không sửa tệp nào. Lỗi thì in "LỖI: ..." và thoát mã 1 (workflow dừng, bản đang chạy trên web giữ nguyên).

  python3 tools/phat-hanh/kiem_anh.py              kiểm ảnh nguồn game/art/custom/*.sprite.json
  python3 tools/phat-hanh/kiem_anh.py --dist DIR   kiểm thêm thư mục site đã gói (mọi đường dẫn anh/... trong trang có tệp thật)

Kiểm:
  1. mọi tệp .sprite.json đọc được (JSON hợp lệ), có "ma", "loai" = linh-khi-sprite
  2. mã ảnh ("ma") không trùng giữa các tệp
  3. ảnh base64 (tam / anh / tam_to / tam_n3 / tam_n4 / anh_n3 / anh_n4) giải mã được thành PNG
  4. ô khung nằm trong ảnh: tấm có khung_rong/khung_cao → rộng ≥ số khung × khung_rong × net, cao ≥ số hàng × khung_cao × net;
     o_n3 / o_n4 (chỗ từng khung trong trang ảnh nét cao) nằm trong trang ảnh
  5. (--dist) tham chiếu ảnh tồn tại: mọi "anh/<tên>" trong index.html / linh-khi.html của site có tệp trong site/anh/
"""
import base64
import glob
import io
import json
import os
import re
import struct
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CUSTOM = os.path.join(ROOT, 'game', 'art', 'custom')
KHOA_ANH = ('tam', 'anh', 'tam_to', 'tam_n3', 'tam_n4', 'anh_n3', 'anh_n4', 'to_n3', 'to_n4')


def co_png(b):
    """(rộng, cao) đọc thẳng từ đầu tệp PNG (không cần Pillow)."""
    if len(b) < 24 or b[:8] != b'\x89PNG\r\n\x1a\n' or b[12:16] != b'IHDR':
        return None
    return struct.unpack('>II', b[16:24])


def kiem_nguon(loi):
    tep = sorted(glob.glob(os.path.join(CUSTOM, '*.sprite.json')))
    if not tep:
        loi.append('không thấy tệp ảnh nào trong game/art/custom')
        return 0
    ma_cua = {}
    for f in tep:
        ten = os.path.relpath(f, ROOT)
        try:
            with open(f, encoding='utf-8') as fh:
                d = json.load(fh)
        except Exception as e:  # noqa: BLE001
            loi.append('%s: JSON hỏng (%s)' % (ten, e))
            continue
        if not isinstance(d, dict) or d.get('loai') != 'linh-khi-sprite' or not isinstance(d.get('ma'), str) or not d['ma']:
            loi.append('%s: thiếu "ma" hoặc "loai" khác linh-khi-sprite' % ten)
            continue
        ma = d['ma']
        if ma in ma_cua:
            loi.append('mã ảnh "%s" trùng: %s và %s' % (ma, ma_cua[ma], ten))
        ma_cua[ma] = ten
        co = {}
        for k in KHOA_ANH:
            v = d.get(k)
            ds = v if isinstance(v, list) else [v] if isinstance(v, str) else []
            for i, s in enumerate(ds):
                if not isinstance(s, str) or not s.startswith('data:image/'):
                    continue
                try:
                    b = base64.b64decode(s.split(',', 1)[1], validate=False)
                except Exception:  # noqa: BLE001
                    loi.append('%s: "%s" không giải mã được base64' % (ten, k))
                    continue
                kc = co_png(b) if s.startswith('data:image/png') else (1 << 30, 1 << 30)  # ảnh không phải PNG: chỉ kiểm giải mã
                if not kc:
                    loi.append('%s: "%s" không phải ảnh PNG đọc được' % (ten, k))
                    continue
                co.setdefault(k, []).append(kc)
        # ô khung nằm trong ảnh
        kr, kh, net = d.get('khung_rong'), d.get('khung_cao'), d.get('net') or 1
        if isinstance(kr, (int, float)) and isinstance(kh, (int, float)) and co.get('tam') and isinstance(d.get('tam'), str):
            W, H = co['tam'][0]
            dt = d.get('dong_tac')
            if isinstance(dt, dict) and dt:
                vs = [v for v in dt.values() if isinstance(v, dict)]
                so = max([int(v.get('so', 1)) for v in vs] or [1])
                hang = max([int(v.get('hang', 0)) for v in vs] or [0]) + 1
            else:
                so, hang = int(d.get('so', 1) or 1), 1
            if W + 0.5 < so * kr * net or H + 0.5 < hang * kh * net:
                loi.append('%s: khung nằm ngoài ảnh (ảnh %dx%d, cần ≥ %gx%g = %d khung × %g, %d hàng × %g, nét %g)'
                           % (ten, W, H, so * kr * net, hang * kh * net, so, kr, hang, kh, net))
        for n in ('3', '4'):
            o = d.get('o_n' + n)
            trang = co.get('tam_n' + n)
            if not isinstance(o, dict) or not trang:
                continue
            for j, e in enumerate(o.get('o') or []):
                if e == 0 or e is None:
                    continue  # khung trống (game bỏ qua: e ? ... : null trong js/sprite_custom.js)
                if not isinstance(e, list) or len(e) < 5:
                    loi.append('%s: o_n%s[%d] sai dạng' % (ten, n, j))
                    continue
                p, x, y, w, h = e[:5]
                if not (0 <= p < len(trang)):
                    loi.append('%s: o_n%s[%d] trỏ trang ảnh %s không có' % (ten, n, j, p))
                    continue
                W, H = trang[p]
                if x < 0 or y < 0 or x + w > W or y + h > H:
                    loi.append('%s: o_n%s[%d] ô (%d,%d,%d,%d) nằm ngoài trang ảnh %dx%d' % (ten, n, j, x, y, w, h, W, H))
    return len(tep)


def kiem_dist(site, loi):
    anh = os.path.join(site, 'anh')
    co = set(os.listdir(anh)) if os.path.isdir(anh) else set()
    so = 0
    for trang in ('index.html', 'linh-khi.html'):
        p = os.path.join(site, trang)
        if not os.path.isfile(p):
            continue
        with open(p, encoding='utf-8') as fh:
            t = fh.read()
        ten = set(re.findall(r'''["'(]anh/([A-Za-z0-9_.\-]+\.(?:png|webp|jpg|jpeg))''', t))
        thieu = sorted(x for x in ten if x not in co)
        so += len(ten)
        for x in thieu[:20]:
            loi.append('%s trỏ tới anh/%s nhưng site không có tệp đó' % (trang, x))
        if len(thieu) > 20:
            loi.append('... và %d ảnh thiếu khác' % (len(thieu) - 20))
    if not os.path.isfile(os.path.join(site, 'index.html')):
        loi.append('site không có index.html')
    return so


def main():
    loi = []
    n = kiem_nguon(loi)
    print('Kiểm ảnh nguồn: %d tệp .sprite.json' % n)
    if '--dist' in sys.argv:
        site = sys.argv[sys.argv.index('--dist') + 1]
        m = kiem_dist(site, loi)
        print('Kiểm tham chiếu ảnh trong site %s: %d đường dẫn anh/...' % (site, m))
    if loi:
        for x in loi[:60]:
            print('LỖI: ' + x)
        if len(loi) > 60:
            print('... và %d lỗi khác' % (len(loi) - 60))
        sys.exit(1)
    print('Kiểm ảnh: ĐẠT')


if __name__ == '__main__':
    main()
