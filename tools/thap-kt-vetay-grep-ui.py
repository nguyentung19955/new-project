#!/usr/bin/env python3
# TURRET MERGE — báo cáo grep: dòng CÒN LẠI có lệnh vẽ / hình CSS trong các tệp vùng UI + lý do giữ (1 dòng mỗi mục).
# Chạy ở gốc repo: python3 tools/thap-kt-vetay-grep-ui.py > /tmp/grep.md
import re, glob
CSS = ['game', 'anhgen', 'pass2', 'unitpage', 'online', 'statthuc', 'huongdan', 'vaotran', 'taitai', 'tien', 'vetay-ui']
JS = ['ui', 'tuongmoi-ui', 'unitpage', 'khung', 'vaotran', 'ketqua', 'huongdan', 'tien-ui', 'taitai', 'taitai-anh', 'meta', 'phattrien'] + [p[8:-3] for p in glob.glob('thap/js/online/*.js') if 'vendor' not in p]
files = ['thap/css/%s.css' % f for f in CSS] + ['thap/js/%s.js' % f for f in JS] + ['thap/index.html']
PAT = re.compile(r'gradient|box-shadow|(?<![-\w])border(-top|-bottom|-left|-right)?\s*:|border-radius|clip-path|mask-image|drop-shadow|outline\s*:|\.(arc|fillRect|strokeRect|moveTo|lineTo|quadraticCurveTo|bezierCurveTo|stroke|roundRect|ellipse|setLineDash|putImageData)\(|create(Linear|Radial|Conic)Gradient|shadowBlur|Path2D|[★✓✗❚■□♥]')
def ly(l, f):
    if f.endswith('.js'):
        if re.search(r'[★✓✗❚■□♥]', l): return 'ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này' if '★' in l else 'xem dòng'
        if 'borderTopLeftRadius' in l or 'clipPath' in l or 'clip-path' in l: return 'khung.js MAT.fit: mặt nạ cắt chân dung PNG quanh mặt (rule 3: mặt nạ cắt)'
        if 'borderImageSource' in l: return 'gắn ảnh khung_bang (PNG 9 mảnh)'
        if 'border-image' in l: return 'nhãn nổi dùng ảnh h2_tam_do (PNG 9 mảnh)'
        if 'border-radius:50%' in l: return 'mặt nạ tròn cho chân dung PNG'
        if 'B.t.fill' in l: return 'Array.fill (không phải vẽ)'
        return 'kiểm tra tay'
    s = l
    if '.c.chon' in s: return 'trạng thái thẻ ĐANG CHỌN (.c.chon) — session khác đang thay'
    if 'clip-path: inset' in s and 'tai-day' in s: return 'mức đầy thanh tải = cắt ảnh tai_day.png (rule 3)'
    if 'clip-path: polygon' in s and 'up-po' in s: return 'cắt chéo chân dung hero (mặt nạ; phần cắt hero thuộc session chân dung)'
    if 'mask-image' in s: return 'mặt nạ mờ mép chân dung cut-in (mặt nạ cắt, không vẽ hình)'
    if re.search(r'gradient', s): return '!! CÒN GRADIENT'
    if 'drop-shadow' in s:
        cols = re.findall(r'drop-shadow\([^)]*#([0-9a-fA-F]{3,8})', s)
        def sang(h):
            h = h if len(h) >= 6 else ''.join(c * 2 for c in h[:3]); return sum(int(h[i:i+2], 16) for i in (0, 2, 4)) > 60
        if any(sang(c) for c in cols) and '.c.chon' not in s: return '!! QUẦNG MÀU'
        if '.c.chon' in s: return 'trạng thái thẻ ĐANG CHỌN (.c.chon) — session khác đang thay'
        return 'bóng đen dưới ảnh PNG (không phải quầng/hình)'
    if re.search(r'box-shadow\s*:\s*(?![\s]|none)', s) and '.c.chon' not in s: return '!! CÒN BOX-SHADOW'
    if 'border-image' in s or 'border-image-source' in s: return 'ảnh ChatGPT 9 mảnh (border-image)'
    if re.search(r'border-radius:\s*50%', s): return 'mặt nạ tròn (ảnh PNG tròn / vùng chạm) — nền none hoặc ảnh'
    if re.search(r'border(-\w+)?\s*:\s*(0|none)\b', s) or 'transparent' in s or 'border: 0' in s: return 'viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền'
    if 'outline: none' in s or 'box-shadow: none' in s: return 'tắt (none)'
    if 'border-radius: 0' in s: return 'bỏ bo góc (0)'
    if '.c.chon' in s: return 'trạng thái thẻ ĐANG CHỌN (.c.chon) — session khác đang thay'
    if re.search(r'[★✓✗❚■□]', s): return 'ký tự giả icon'
    return 'kiểm tra tay'
n = 0; bad = 0
print('| tệp:dòng | đoạn | lý do giữ |\n|---|---|---|')
for f in files:
    try: L = open(f, encoding='utf-8').read().split('\n')
    except FileNotFoundError: continue
    cmt = False
    for i, l0 in enumerate(L, 1):
        # bỏ chú thích /* … */ (kể cả nhiều dòng) và // cuối dòng
        l = ''; j = 0
        while j < len(l0):
            if cmt:
                k = l0.find('*/', j)
                if k < 0: j = len(l0); break
                cmt = False; j = k + 2
            else:
                k = l0.find('/*', j)
                if k < 0: l += l0[j:]; break
                l += l0[j:k]; cmt = True; j = k + 2
        if f.endswith('.js') and '://' not in l: l = re.sub(r'(^|\s)//.*$', '', l)
        t = l.strip()
        if not t: continue
        if not PAT.search(l): continue
        r = ly(l, f); n += 1; bad += r.startswith('!!') or r == 'kiểm tra tay'
        m = PAT.search(l); a = max(0, m.start() - 50)
        print('| %s:%d | `%s` | %s |' % (f[5:], i, l[a:a + 110].strip().replace('|', '\\|').replace('`', "'"), r))
print('\n%d dòng; %d dòng cần xem tay / còn vi phạm' % (n, bad))
