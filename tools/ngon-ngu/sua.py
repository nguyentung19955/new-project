#!/usr/bin/env python3
"""Sửa nhanh một mục từ điển:  python3 tools/ngon-ngu/sua.py <nhóm> "chuỗi Việt" "English"  (nhiều cặp cũng được). Xong chạy gop.py."""
import json, os, sys
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tu-dien')


def ghi(p, d):
    with open(p, 'w', encoding='utf-8', newline='\n') as f:
        f.write('{\n' + ',\n'.join(json.dumps(a, ensure_ascii=False) + ': ' + json.dumps(b, ensure_ascii=False) for a, b in d.items()) + '\n}\n')


def main():
    p = os.path.join(D, sys.argv[1] + '.json')
    d = json.load(open(p, encoding='utf-8')) if os.path.exists(p) else {}
    a = sys.argv[2:]
    for i in range(0, len(a) - 1, 2): d[a[i]] = a[i + 1]
    ghi(p, d)


if __name__ == '__main__':
    main()
