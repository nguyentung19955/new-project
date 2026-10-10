#!/usr/bin/env python3
"""Kiểm một nhóm từ điển: in các chuỗi có dấu tiếng Việt trong các tệp JS của nhóm mà chưa có trong
tools/ngon-ngu/tu-dien/<nhóm>.json lẫn <nhóm>.boqua.json (và chưa có ở nhóm nào khác).

  python3 tools/ngon-ngu/kiem.py <nhóm> tệp1.js tệp2.js …
"""
import json, os, sys, glob
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import trich

D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tu-dien')


def doc(p, d):
    if not os.path.exists(p): return d
    with open(p, encoding='utf-8') as f: return json.load(f)


def main():
    nhom, teps = sys.argv[1], sys.argv[2:]
    co = set(doc(os.path.join(D, nhom + '.json'), {}).keys()) | set(doc(os.path.join(D, nhom + '.boqua.json'), []))
    khac = set()
    for p in glob.glob(os.path.join(D, '*.json')):
        if p.endswith('.boqua.json') or os.path.basename(p) == nhom + '.json': continue
        khac |= set(doc(p, {}).keys())
    n = 0
    for t in teps:
        with open(os.path.join(trich.JS, os.path.basename(t)), encoding='utf-8') as f: src = f.read()
        seen = set()
        for ln, s, k in trich.strings(src):
            if s in co or s.strip() in co or s in seen: continue
            seen.add(s)
            if s in khac or s.strip() in khac: continue
            n += 1; print('%s:%d\t%s' % (os.path.basename(t), ln, json.dumps(s, ensure_ascii=False)))
    # bản dịch còn dấu tiếng Việt (ngoài tên riêng cho phép)?
    import re
    for k, v in doc(os.path.join(D, nhom + '.json'), {}).items():
        if not isinstance(v, str): print('GIÁ TRỊ KHÔNG PHẢI CHUỖI\t' + k); n += 1; continue
        if trich.VI.search(re.sub('Cu Tí|Cu Tèo|Cái Bống|Cu Lì|Linh Khí|LINH KHÍ', '', v)):
            print('BẢN ANH CÒN DẤU VIỆT\t%s => %s' % (k, v)); n += 1
        a, b = sorted(set(re.findall(r'\{\d\}', k))), sorted(set(re.findall(r'\{\d\}', v)))
        if a != b: print('LỆCH CHỖ TRỐNG\t%s => %s' % (k, v)); n += 1
    print('Còn %d mục cần xem' % n)


if __name__ == '__main__':
    main()
