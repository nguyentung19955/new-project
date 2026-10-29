#!/usr/bin/env python3
"""Tạo game/thu-p0c-lam-moi/index.html – BẢN TÍCH HỢP RIÊNG (PH14 "Gửi Claude"): P0-C đầy đủ (tinh anh Chuông Gỗ Gác Lớn, né, chết / hồi sinh,
Ấn Rèn I, đe rèn, Âm Đao cấp 3 / Dư Âm) nhưng dùng LAM MỚI (máy hình + sheet + vệt gen của game/thu-lam-moi-2).

Nguồn (CHỈ ĐỌC – không sửa P0-C gốc, không sửa trang Lam mới 2):
  - game/thu-p0c/index.html                         P0-C ĐÃ SINH (bằng game/thu-p0c/cong-cu/tao-p0c.py) – nền của trang, Lam CŨ
  - game/thu-lam-moi-2/cong-cu/khoi-lam-moi-2.js     khối Lam mới (máy hình, sheet, vệt gen, móc tường, chết tạm, nút ⚙)
Chỗ thay = đúng các móc Lam mới mà tao-thu-lam-moi-2.py dùng (drawLam, chậm ×N, nạp sheet) + đường dẫn ảnh P0-C (p0c/ → ../thu-p0c/p0c/).
P0-C và P0-B GIỮ Lam cũ để so. Cờ ?lam=cu (hoặc ⚙ → Lam: cũ) = Lam cũ ngay trong trang này.
Mỗi chỗ thay phải khớp ĐÚNG số lần – lệch thì dừng và báo.
Chạy (sau khi P0-C đã sinh):  python3 game/thu-p0c/cong-cu/tao-p0c.py && python3 game/thu-p0c-lam-moi/cong-cu/tao-p0c-lam-moi.py"""
import datetime, hashlib, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
THU = os.path.normpath(os.path.join(HERE, '..'))
GAME = os.path.normpath(os.path.join(THU, '..'))
NGUON = {'p0c': os.path.join(GAME, 'thu-p0c', 'index.html'), 'lm2': os.path.join(GAME, 'thu-lam-moi-2', 'cong-cu', 'khoi-lam-moi-2.js')}
src = open(NGUON['p0c'], encoding='utf-8').read()
KHOI = open(NGUON['lm2'], encoding='utf-8').read()
h = hashlib.sha1()
for k in sorted(NGUON): h.update(open(NGUON[k], 'rb').read())
h.update(open(os.path.abspath(__file__), 'rb').read())
PHIEN = 'p0cLM-' + datetime.date.today().strftime('%d%m') + '-' + h.hexdigest()[:8]
loi = []


def doi(text, ds, ten):
    for mo_ta, cu, moi, lan in ds:
        n = text.count(cu)
        if n != lan:
            loi.append('%s – %s: khớp %d lần (cần %d)' % (ten, mo_ta, n, lan)); continue
        text = text.replace(cu, moi)
    return text


m = re.findall(r"p0c-\d{4}-[0-9a-f]{8}", src)
if len(set(m)) != 1: loi.append('không thấy đúng 1 mã phiên P0-C trong thu-p0c/index.html (thấy %s)' % sorted(set(m)))
R = [
    ('tiêu đề', '<title>Tiếng Vọng – Thử P0-C (tinh anh · Ấn Rèn · đe rèn)</title>',
     '<title>Tiếng Vọng – Thử P0-C · LAM MỚI (tinh anh · Ấn Rèn · đe rèn)</title>', 1),
    ('màn bắt đầu', '<p class="big">Thử P0-C · tinh anh Chuông Gỗ Gác Lớn → Ấn Rèn I → đe rèn → Âm Đao cấp 3 (Dư Âm)</p>',
     '<p class="big">Thử P0-C · LAM MỚI (bản tích hợp riêng – P0-C / P0-B gốc vẫn Lam cũ) · tinh anh Chuông Gỗ Gác Lớn → Ấn Rèn I → đe rèn → '
     'Âm Đao cấp 3 (Dư Âm). ?lam=cu hoặc ⚙ = Lam cũ để so</p>', 1),
    ('ảnh Ấn Rèn ở thư mục thu-p0c', "'p0c/", "'../thu-p0c/p0c/", 2),
    ('drawLam: Lam mới', "function drawLam(bo,s,x,y){\n  if(!LAM || !s.a2) return;\n",
     "function drawLam(bo,s,x,y){\n  if(LM2.ve(bo,s,x,y)) return;   // Lam mới (thu-lam-moi-2/cong-cu/khoi-lam-moi-2.js)\n  if(!LAM || !s.a2) return;\n", 1),
    ('vòng lặp: chậm ×N', "accT+=dt*(DBG.on?DBG.speed:1); let n=0;", "accT+=dt*(DBG.on?DBG.speed:1)/LM2.ST.cham; let n=0;", 1),
    ('nạp Lam mới trước nền mới', "    await PBK.chuanBi();    // DHM",
     "    await LM2.nap();        // Lam mới: sheet + vệt gen\n    await PBK.chuanBi();    // DHM", 1),
]
if m: R.append(('mã phiên riêng', m[0], PHIEN, src.count(m[0])))
out = doi(src, R, 'thu-p0c/index.html')
TAIL = "\nboot();\n</script>"
if out.count(TAIL) != 1: loi.append('khởi động: khớp %d lần (cần 1)' % out.count(TAIL))
else: out = out.replace(TAIL, "\n" + KHOI + TAIL)
if loi: sys.exit('LỖI – nguồn đã đổi, sửa script:\n  ' + '\n  '.join(loi))
dst = os.path.join(THU, 'index.html')
open(dst, 'w', encoding='utf-8').write(out)
print('ghi', dst, len(out.encode('utf-8')), 'byte · phiên', PHIEN, '(P0-C gốc:', m[0] + ')')
