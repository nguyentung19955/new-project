#!/usr/bin/env python3
"""Gộp tools/ngon-ngu/tu-dien/*.json thành game/js/ngon_ngu_en.js (từ điển tiếng Anh game nạp).
Cùng một khoá mà hai tệp dịch khác nhau thì in cảnh báo và lấy bản ở tệp đứng trước theo tên (00-chung.json đứng đầu).

  python3 tools/ngon-ngu/gop.py
"""
import glob, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'game', 'js', 'ngon_ngu_en.js')


def main():
    d, src, lech = {}, {}, 0
    for p in sorted(glob.glob(os.path.join(HERE, 'tu-dien', '*.json'))):
        if p.endswith('.boqua.json'): continue
        name = os.path.basename(p)
        with open(p, encoding='utf-8') as f: part = json.load(f)
        for k, v in part.items():
            if k in d:
                if d[k] != v: lech += 1; print('LỆCH: %r\n   %s: %r\n   %s: %r' % (k, src[k], d[k], name, v))
                continue
            d[k] = v; src[k] = name
    lines = ['// Từ điển tiếng Anh. Tệp này do tools/ngon-ngu/gop.py tạo từ tools/ngon-ngu/tu-dien/*.json — đừng sửa tay,',
             '// hãy sửa tệp .json rồi chạy: python3 tools/ngon-ngu/gop.py',
             '(function () { if (window.G && G.ngonNgu) G.ngonNgu.them({']
    keys = sorted(d)
    for i, k in enumerate(keys):
        lines.append(json.dumps(k, ensure_ascii=False) + ': ' + json.dumps(d[k], ensure_ascii=False) + (',' if i < len(keys) - 1 else ''))
    lines.append('}); })();')
    with open(OUT, 'w', encoding='utf-8', newline='\n') as f: f.write('\n'.join(lines) + '\n')
    print('Đã ghi %s: %d mục, %d chỗ lệch' % (os.path.relpath(OUT), len(d), lech))


if __name__ == '__main__':
    main()
