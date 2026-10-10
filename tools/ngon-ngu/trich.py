#!/usr/bin/env python3
"""Trích mọi chuỗi có dấu tiếng Việt trong game/js/*.js (bỏ qua chú thích).

Cách dùng:
  python3 tools/ngon-ngu/trich.py            in tổng số chuỗi theo tệp
  python3 tools/ngon-ngu/trich.py --json     in danh sách JSON [{tep, dong, chuoi, kieu}]
  python3 tools/ngon-ngu/trich.py --thieu    in các chuỗi CHƯA có trong từ điển game/js/ngon_ngu_en.js
                                             (chỉ là gợi ý: chuỗi ghép bằng + sẽ hiện từng mảnh)
Chỉ dùng thư viện chuẩn của Python 3.
"""
import glob
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
JS = os.path.join(ROOT, 'game', 'js')
VI = re.compile('[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ'
                'ÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ]')
BO_QUA = ('ngon_ngu.js', 'ngon_ngu_en.js', 'firebase-config.js')
ESC = {'n': '\n', 't': '\t', '\\': '\\', "'": "'", '"': '"', '`': '`', '0': '\0', 'r': '\r', '\n': ''}


def unesc(s):
    out, i = [], 0
    while i < len(s):
        ch = s[i]
        if ch == '\\' and i + 1 < len(s):
            n = s[i + 1]
            if n == 'u' and re.match(r'[0-9a-fA-F]{4}', s[i + 2:i + 6] or ''):
                out.append(chr(int(s[i + 2:i + 6], 16))); i += 6; continue
            if n == 'x' and re.match(r'[0-9a-fA-F]{2}', s[i + 2:i + 4] or ''):
                out.append(chr(int(s[i + 2:i + 4], 16))); i += 4; continue
            out.append(ESC.get(n, n)); i += 2; continue
        out.append(ch); i += 1
    return ''.join(out)


def strings(src):
    """Trả về [(dòng, chuỗi, kiểu)] với kiểu ' " hoặc ` (chuỗi mẫu: giữ nguyên ${…})."""
    out, i, n, line = [], 0, len(src), 1
    prev = ''  # ký tự có nghĩa gần nhất (để đoán / là phép chia hay biểu thức chính quy)
    while i < n:
        ch = src[i]
        if ch == '\n':
            line += 1; i += 1; continue
        if ch == '/' and src[i + 1:i + 2] == '/':
            j = src.find('\n', i); i = n if j < 0 else j; continue
        if ch == '/' and src[i + 1:i + 2] == '*':
            j = src.find('*/', i + 2); j = n if j < 0 else j + 2
            line += src.count('\n', i, j); i = j; continue
        if ch == '/' and (prev == '' or prev in '(,=:[!&|?{};+-*%<>~^' or prev == 'return'):
            j, cls = i + 1, False
            while j < n and src[j] != '\n':
                if src[j] == '\\': j += 2; continue
                if src[j] == '[': cls = True
                elif src[j] == ']': cls = False
                elif src[j] == '/' and not cls: break
                j += 1
            i = j + 1; prev = ')'; continue
        if ch in '\'"`':
            j, l0 = i + 1, line
            depth = 0
            while j < n:
                c = src[j]
                if c == '\\': j += 2; continue
                if ch == '`' and c == '$' and src[j + 1:j + 2] == '{': depth += 1; j += 2; continue
                if ch == '`' and depth and c == '}': depth -= 1; j += 1; continue
                if c == ch and not depth: break
                if c == '\n': line += 1
                j += 1
            s = unesc(src[i + 1:j])
            if VI.search(s): out.append((l0, s, ch))
            i = j + 1; prev = ')'; continue
        if not ch.isspace():
            if ch.isalpha() or ch == '_' or ch == '$':
                m = re.match(r'[\w$]+', src[i:]); w = m.group(0); i += len(w); prev = 'return' if w in ('return', 'typeof', 'case') else 'a'; continue
            prev = ch
        i += 1
    return out


def tat_ca():
    rows = []
    for path in sorted(glob.glob(os.path.join(JS, '*.js'))):
        name = os.path.basename(path)
        if name in BO_QUA: continue
        with open(path, encoding='utf-8') as f:
            for ln, s, k in strings(f.read()):
                rows.append({'tep': name, 'dong': ln, 'chuoi': s, 'kieu': k})
    return rows


def tu_dien():
    """Đọc khoá của từ điển trong game/js/ngon_ngu_en.js (mỗi dòng: 'khoá': 'giá trị',)."""
    p = os.path.join(JS, 'ngon_ngu_en.js')
    if not os.path.exists(p): return set()
    with open(p, encoding='utf-8') as f: src = f.read()
    keys = set()
    for m in re.finditer(r'^\s*("(?:[^"\\]|\\.)*")\s*:', src, re.M):
        keys.add(json.loads(m.group(1)))
    # chuỗi cố ý không dịch (console, khoá logic, chữ chỉ dùng trong công cụ): tools/ngon-ngu/tu-dien/*.boqua.json
    for q in glob.glob(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tu-dien', '*.boqua.json')):
        with open(q, encoding='utf-8') as f: keys |= set(json.load(f))
    return keys


def main():
    rows = tat_ca()
    if '--json' in sys.argv:
        json.dump(rows, sys.stdout, ensure_ascii=False, indent=0); return
    if '--thieu' in sys.argv:
        keys = tu_dien(); seen = set()
        for r in rows:
            s = r['chuoi']
            if s in keys or s.strip() in keys or s in seen: continue
            seen.add(s); print('%s:%d\t%s' % (r['tep'], r['dong'], json.dumps(s, ensure_ascii=False)))
        print('Chưa có trong từ điển: %d chuỗi (kể cả mảnh ghép)' % len(seen), file=sys.stderr); return
    by = {}
    for r in rows: by.setdefault(r['tep'], set()).add(r['chuoi'])
    for k in sorted(by, key=lambda k: -len(by[k])): print('%5d  %s' % (len(by[k]), k))
    print('%5d  chuỗi khác nhau, %d lượt' % (len({r['chuoi'] for r in rows}), len(rows)))


if __name__ == '__main__':
    main()
