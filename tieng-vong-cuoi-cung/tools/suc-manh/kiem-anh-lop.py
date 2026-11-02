#!/usr/bin/env python3
"""Kiểm ảnh lớp trang bị (phiên sucmanh / cặp gen ảnh) TRƯỚC khi ghi XONG.
Chạy: python3 tools/suc-manh/kiem-anh-lop.py <id lớp> [thư mục ảnh xem NGOÀI repo]
Đọc art/kiem-khach-lop/<id>/<clip>/fNN.png, so với art/kiem-khach/<clip>/fNN.png:
  - đủ khung, cùng cỡ 256×256, RGBA, có điểm ảnh;
  - lớp có màu trùng màu thân gốc ở cùng chỗ?  (lớp không được là bản chép thân – chỉ phần THÊM)
  - lớp nhảy giữa các khung? (tâm khối lớp lệch so với tâm khối thân > 6 điểm ảnh giữa 2 khung liền nhau)
  - ghép thử lớp lên thân trên nền tối → <xem>/<id>-<clip>.png (phóng ×3) để tự nhìn.
Không sửa ảnh nào. Mã thoát 1 nếu có LỖI.
"""
import sys, os
from PIL import Image

GOC = os.path.join(os.path.dirname(__file__), '..', '..')
lop = sys.argv[1] if len(sys.argv) > 1 else sys.exit(__doc__)
xem = sys.argv[2] if len(sys.argv) > 2 else '/tmp/suc-manh-xem'
os.makedirs(xem, exist_ok=True)
dl = os.path.join(GOC, 'art/kiem-khach-lop', lop)
if not os.path.isdir(dl): sys.exit('Không có thư mục ' + dl)
loi = 0

def tam(im):
    a = im.getchannel('A'); bb = a.getbbox()
    if not bb: return None
    px = a.load(); sx = sy = n = 0
    for y in range(bb[1], bb[3]):
        for x in range(bb[0], bb[2]):
            if px[x, y] > 40: sx += x; sy += y; n += 1
    return (sx / n, sy / n, n) if n else None

for clip in sorted(os.listdir(dl)):
    dc = os.path.join(dl, clip); db = os.path.join(GOC, 'art/kiem-khach', clip)
    if not os.path.isdir(dc): continue
    if not os.path.isdir(db): print('LỖI', clip, ': không có clip gốc cùng tên'); loi += 1; continue
    nb = sorted(f for f in os.listdir(db) if f.startswith('f') and f.endswith('.png'))
    nl = sorted(f for f in os.listdir(dc) if f.startswith('f') and f.endswith('.png'))
    if nl != nb: print('LỖI', clip, ': khung lớp', len(nl), '≠ khung gốc', len(nb)); loi += 1; continue
    tr = None; hang = []
    for f in nb:
        b = Image.open(os.path.join(db, f)).convert('RGBA'); l = Image.open(os.path.join(dc, f))
        if l.size != b.size or l.mode != 'RGBA': print('LỖI', clip, f, ': cỡ/chế độ', l.size, l.mode); loi += 1; continue
        tl, tb = tam(l), tam(b)
        if not tl: print('CẢNH BÁO', clip, f, ': lớp trống (ẩn ở khung này)'); hang.append((b, l)); continue
        # điểm ảnh lớp trùng y hệt màu thân → nghi chép thân
        lp, bp = l.load(), b.load(); trung = sum(1 for y in range(256) for x in range(256) if lp[x, y][3] > 200 and bp[x, y][3] > 200 and lp[x, y][:3] == bp[x, y][:3])
        if trung > 0.5 * tl[2]: print('LỖI', clip, f, ': %d/%d điểm ảnh lớp giống hệt thân gốc (lớp chỉ được chứa phần THÊM)' % (trung, tl[2])); loi += 1
        lech = (tl[0] - tb[0], tl[1] - tb[1])
        if tr and (abs(lech[0] - tr[0]) > 6 or abs(lech[1] - tr[1]) > 6): print('CẢNH BÁO', clip, f, ': lớp nhảy so với thân', tr, '→', tuple(round(v) for v in lech))
        tr = lech; hang.append((b, l))
    if hang:
        S = Image.new('RGBA', (256 * len(hang), 256), (14, 16, 26, 255))
        for i, (b, l) in enumerate(hang): S.alpha_composite(b, (256 * i, 0)); S.alpha_composite(l, (256 * i, 0))
        S = S.resize((S.width * 3, S.height * 3), Image.NEAREST); S.save(os.path.join(xem, lop + '-' + clip + '.png'))
        print('XONG', clip, len(hang), 'khung → xem', os.path.join(xem, lop + '-' + clip + '.png'))
print('CÓ %d LỖI' % loi if loi else 'TẤT CẢ ĐẠT'); sys.exit(1 if loi else 0)
