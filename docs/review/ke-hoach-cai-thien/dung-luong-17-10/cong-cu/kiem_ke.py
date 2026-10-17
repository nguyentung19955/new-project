#!/usr/bin/env python3
"""Kiểm kê dung lượng (dung-luong-17-10). Đọc bản đã đóng gói, KHÔNG sửa gì.

  python3 kiem_ke.py <thư mục dist> [tên.json]

- Bản một tệp (dist/linh-khi.html): từng hình nhúng (chuỗi JSON của hình trong trang), ảnh truyện, bìa, phần mã (JS + HTML).
- Bản web (dist/linh-khi-nhe.html + dist/anh/, có khi đóng gói --hai-tep): trang chính nén gzip -6, từng ảnh người chơi tải
  (WebP khi có, không thì PNG), bản to ×1,2 của Cu Tí; không tính ảnh chỉ tải khi bật cờ quay lui (muot_cua / net_cua / san_cua,
  nét cao ?netcao), như dòng "NGƯỜI CHƠI TẢI" của game/build.py.
In bảng theo nhóm + 40 mục lớn nhất (Markdown), ghi số liệu ra tệp JSON (nếu cho tên)."""
import gzip
import json
import os
import re
import sys

TRUM = ('mocTinh', 'nguTinh', 'hoTinh', 'thuongLuong', 'caTre')
VUNG = {'rung': 'Rừng già', 'bien': 'Hang biển', 'laudai': 'Lâu đài cổ', 'song': 'Sông sâu', None: 'không vùng'}
GD_VUNG = {'rung': 'rung', 'bien': 'bien', 'lau': 'laudai', 'song': 'song'}
CO = ('muot_cua', 'net_cua', 'san_cua')


def nhom(t):
    ma, d = t.get('ma', ''), t.get('doi_tuong')
    if d == 'zed':
        return 'Ảnh nhân vật: Cu Tí (thân, vũ khí)'
    if d in ('em-be', 'nguoi-lang'):
        return 'Ảnh nhân vật: em bé, người làng'
    if d == 'hieu-ung':
        return 'Hiệu ứng (hu-*)'
    if d == 'vat-pham':
        return 'Giao diện: vật phẩm (vp-*)'
    if d == 'giao-dien':
        m = re.match(r'^gd-(?:nen|cua|tt)-(rung|bien|lau|song)-', ma)
        if m:
            return 'Nền / sàn / cửa / trang trí: ' + VUNG[GD_VUNG[m.group(1)]]
        if ma.startswith('gd-lang') or ma.startswith('gd-nen'):
            return 'Nền: làng'
        return 'Giao diện (gd-* khác: bảng, nút, bản đồ, icon)'
    if ma.split('-')[0] in TRUM:
        return 'Trùm: ' + VUNG.get(t.get('vung'), str(t.get('vung')))
    return 'Quái thường / tinh anh: ' + VUNG.get(t.get('vung'), str(t.get('vung')))


def cat_json(text, khoa):
    a = text.find(khoa)
    if a < 0:
        return None, 0, 0
    b0 = a + len(khoa)
    b = text.find(';\n', b0)
    return json.loads(text[b0:b].replace('<\\!--', '<!--')), b0, b


def mot_tep(dist):
    p = os.path.join(dist, 'linh-khi.html')
    text = open(p, encoding='utf-8').read()
    tong = len(text.encode('utf-8'))
    ds, b0, b = cat_json(text, '.customSpriteData = ')
    muc = []
    for t in ds:
        muc.append((len(json.dumps(t, ensure_ascii=False, separators=(',', ':')).encode('utf-8')), t['ma'], nhom(t)))
    con = text[:b0] + text[b:]
    tr = sum(len(m) for m in re.findall(r'data:image/[a-z]+;base64,[A-Za-z0-9+/=]+', con[con.find('TRUYEN_ANH = '):con.find(';\n', con.find('TRUYEN_ANH = '))])) if 'TRUYEN_ANH = ' in con else 0
    bi = sum(len(m) for m in re.findall(r'data:image/[a-z]+;base64,[A-Za-z0-9+/=]+', con[con.find('BIA_ANH = '):con.find(';\n', con.find('BIA_ANH = '))])) if 'BIA_ANH = ' in con else 0
    mo = sum(len(m) for m in re.findall(r'data:image/[a-z]+;base64,[A-Za-z0-9+/=]+', con[:con.find('<script>')]))
    ma_rieng = sum(len(m) for m in re.findall(r'data:image/png;base64,[A-Za-z0-9+/=]+', con[con.find('<script>'):]))  # truyện / bìa là WebP / JPEG
    so_webp = sum(1 for t in ds for k in ('tam', 'anh', 'tam_to') if isinstance(t.get(k), str) and t[k].startswith('data:image/webp'))
    phan = {'Ảnh truyện (WebP, giải mã khi mở truyện)': tr, 'Bìa màn hình chính (2 bìa) + nền mờ màn tải': bi + mo,
            'Ảnh trong mã (thuong_cao_data…)': max(0, ma_rieng)}
    phan['Mã JS + HTML + CSS (không tính ảnh)'] = tong - sum(m[0] for m in muc) - sum(phan.values())
    phan['Âm thanh'] = 0  # âm thanh game tạo bằng mã (WebAudio), không có tệp âm thanh
    phan['Phông chữ'] = 0  # phông Google Fonts tải ngoài (thẻ link), không nằm trong gói
    return {'tong': tong, 'muc': muc, 'phan': phan, 'so_webp': so_webp, 'so_hinh': len(ds)}


def web(dist):
    p = os.path.join(dist, 'linh-khi-nhe.html')
    if not os.path.isfile(p):
        return None
    text = open(p, encoding='utf-8').read()
    z = len(gzip.compress(text.encode('utf-8'), 6))
    ds, _, _ = cat_json(text, "['customSpriteData'] = ")
    co = lambda r: os.path.getsize(os.path.join(dist, r)) if isinstance(r, str) and os.path.isfile(os.path.join(dist, r)) else 0  # noqa: E731
    muc, cu, loi = [], [], 0
    for t in ds:
        src = t.get('tam') if isinstance(t.get('tam'), str) else t.get('anh')
        n = co(t.get('webp')) or co(src)
        n_to = co(t.get('tam_to_webp')) or co(t.get('tam_to'))
        (cu if any(t.get(k) for k in CO) else muc).append((n, t['ma'], nhom(t)))
        if not any(t.get(k) for k in CO) and not (isinstance(t.get('_u'), list) and len(t['_u']) > 4 and t['_u'][4]):
            loi += n  # ảnh lõi (không riêng vùng nào): tải ngay sau màn chào
        if n_to and not t.get('net_cua'):
            muc.append((n_to, t['ma'] + ' (bản to ×1,2)', nhom(t)))
    bia = re.search(r'data-bia="([^"]*)"', text)
    bia_n = 0
    if bia:
        for r in bia.group(1).split('|'):
            if r.startswith('anh/') and r.endswith('.webp'):
                bia_n = co(r)
                break
    ma_rieng = sum(co(r) for r in re.findall(r'"(anh/ma-rieng\.[0-9a-f]+\.png)"', text))
    phan = {'Trang chính (mã + thông số hình), nén gzip': z, 'Bìa (1 bìa WebP, tải sớm)': bia_n, 'Ảnh trong mã (ma-rieng)': ma_rieng}
    return {'tong': z + sum(m[0] for m in muc) + bia_n + ma_rieng, 'muc': muc, 'phan': phan, 'cu': sum(m[0] for m in cu), 'so_cu': len(cu),
            'tai_dau': loi + z + bia_n, 'trang_tho': len(text.encode('utf-8'))}


def bang(r, tieu_de):
    MB = 1048576
    out = ['### ' + tieu_de, '', 'Tổng: **%.2f MB**' % (r['tong'] / MB), '', '| Nhóm | Số mục | MB | % |', '|---|---:|---:|---:|']
    g = {}
    for n, ma, nh in r['muc']:
        g.setdefault(nh, [0, 0]); g[nh][0] += 1; g[nh][1] += n
    for k, v in r['phan'].items():
        g[k] = ['—', v]
    for k, v in sorted(g.items(), key=lambda x: -x[1][1]):
        out.append('| %s | %s | %.2f | %.1f |' % (k, v[0], v[1] / MB, 100 * v[1] / r['tong'] if r['tong'] else 0))
    out += ['', '40 mục lớn nhất:', '', '| # | Hình | Nhóm | KB |', '|---:|---|---|---:|']
    for i, (n, ma, nh) in enumerate(sorted(r['muc'], reverse=True)[:40], 1):
        out.append('| %d | %s | %s | %d |' % (i, ma, nh, n // 1024))
    return '\n'.join(out) + '\n'


def main():
    dist = sys.argv[1] if len(sys.argv) > 1 else 'game/dist'
    a = mot_tep(dist)
    b = web(dist)
    print(bang(a, 'Bản một tệp (linh-khi.html)'))
    if b:
        print(bang(b, 'Bản web — người chơi tải (đi hết 4 vùng)'))
        print('Bản web tải đầu (trang + bìa + ảnh lõi, trước khi chọn vùng): %.2f MB; trang chính chưa nén %.2f MB; ảnh cờ quay lui trên máy chủ (không tính): %d tấm %.2f MB'
              % (b['tai_dau'] / 1048576, b['trang_tho'] / 1048576, b['so_cu'], b['cu'] / 1048576))
    if len(sys.argv) > 2:
        json.dump({'mot_tep': a, 'web': b}, open(sys.argv[2], 'w', encoding='utf-8'), ensure_ascii=False, indent=0)


if __name__ == '__main__':
    main()
