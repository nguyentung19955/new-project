#!/usr/bin/env python3
"""Cổng kiểm trước khi đăng — TRẦN DUNG LƯỢNG (phiên F1).

  python3 tools/phat-hanh/kiem_dung_luong.py <thư-mục-site>

  - bản một tệp (linh-khi.html) và MỌI tệp trong site: ≤ 30 MB
  - web tải đầu (người chơi tải = trang chính nén + ảnh lõi + bìa, game/build.py tính, ghi trong build-manifest.json): ≤ 20 MB
Vượt trần → in "LỖI" và thoát mã 1 (không đăng).
"""
import json
import os
import sys

MB = 1024 * 1024
TRAN_TEP = 30 * MB
TRAN_TAI_DAU = 20 * MB


def main():
    site = sys.argv[1]
    loi = []
    to_nhat = (0, '')
    for g, _, ds in os.walk(site):
        for x in ds:
            p = os.path.join(g, x)
            n = os.path.getsize(p)
            if n > to_nhat[0]:
                to_nhat = (n, os.path.relpath(p, site))
            if n > TRAN_TEP:
                loi.append('%s nặng %.2f MB > trần một tệp 30 MB' % (os.path.relpath(p, site), n / MB))
    mot = os.path.join(site, 'linh-khi.html')
    if os.path.isfile(mot):
        print('Bản một tệp linh-khi.html: %.2f MB / trần 30 MB' % (os.path.getsize(mot) / MB))
    print('Tệp nặng nhất: %s %.2f MB' % (to_nhat[1], to_nhat[0] / MB))
    mf = os.path.join(site, 'build-manifest.json')
    if not os.path.isfile(mf):
        loi.append('thiếu build-manifest.json (game/build.py phải ghi dist/build-manifest.json)')
    else:
        with open(mf, encoding='utf-8') as f:
            m = json.load(f)
        k = m.get('kich_thuoc') or {}
        if 'nguoi_tai' in k:
            print('Web tải đầu (người chơi tải): %.2f MB / trần 20 MB' % (k['nguoi_tai'] / MB))
            if k['nguoi_tai'] > TRAN_TAI_DAU:
                loi.append('web tải đầu %.2f MB > trần 20 MB' % (k['nguoi_tai'] / MB))
        else:
            # bản không phải ảnh rời: trang chính là cả gói
            n = os.path.getsize(os.path.join(site, 'index.html'))
            print('Web tải đầu (trang chính, không nén): %.2f MB / trần 20 MB' % (n / MB))
        if not m.get('buildId'):
            loi.append('build-manifest.json không có buildId')
        else:
            print('buildId: %s' % m['buildId'])
    if loi:
        for x in loi:
            print('LỖI: ' + x)
        sys.exit(1)
    print('Trần dung lượng: ĐẠT')


if __name__ == '__main__':
    main()
