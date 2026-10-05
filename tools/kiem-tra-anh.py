"""Đối chiếu ảnh đã gen với docs/PROMPT-FOOOCUS.txt: đã có bao nhiêu, còn thiếu ảnh nào.

Cách chạy:  python3 tools/kiem-tra-anh.py <thư mục hoặc file .zip> [thêm thư mục/zip ...]
Ví dụ:      python3 tools/kiem-tra-anh.py ~/Downloads/NuiCaoNuocDang_anh*

- Đọc mọi ảnh .png/.jpg/.webp trong thư mục (kể cả thư mục con) và trong các file .zip.
- So tên file với dòng "File:" của prompt (không phân biệt hoa thường, .jpg/.webp coi như .png).
- Ghi ra docs/ANH-CON-THIEU.txt: các mục còn thiếu kèm nguyên prompt, để gửi lại cho AI gen tiếp.
- Mục ghi "BỎ QUA" (game không dùng) và logo / icon-app (không bắt buộc) không tính là thiếu.
- In thêm các file có tên không khớp mục nào (thường do đặt sai tên) và gợi ý tên gần nhất.
"""
import difflib, os, re, sys, zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PROMPT = os.path.join(ROOT, 'docs', 'PROMPT-FOOOCUS.txt')
OUT = os.path.join(ROOT, 'docs', 'ANH-CON-THIEU.txt')
IMG = ('.png', '.jpg', '.jpeg', '.webp')


def read_prompt():
    text = open(PROMPT, encoding='utf-8').read()
    items = []
    # mỗi mục: "[123] File: ten.png   ·   ..." + dòng prompt ngay sau
    for m in re.finditer(r'^\[(\d{3})\] File: (\S+?\.png)([^\n]*)\n([^\n]*)', text, re.M):
        num, f, note, prompt = m.groups()
        skip = 'BỎ QUA' in note
        optional = 'không bắt buộc' in note
        items.append({'num': int(num), 'file': f, 'head': m.group(0).split('\n')[0], 'prompt': prompt,
                      'skip': skip, 'optional': optional})
    # tên nhóm (dòng "# ..." gần nhất phía trên) để báo cáo theo nhóm
    heads = [(m.start(), m.group(1).strip()) for m in re.finditer(r'^#\s+([^#\n][^\n]*)$', text, re.M)]
    pos = {m.group(2): m.start() for m in re.finditer(r'^\[(\d{3})\] File: (\S+?\.png)', text, re.M)}
    for it in items:
        g = [h for p, h in heads if p < pos[it['file']]]
        it['group'] = g[-1] if g else ''
    return items


def norm(name):
    base = os.path.basename(name).lower().strip()
    stem, ext = os.path.splitext(base)
    return stem + '.png' if ext in IMG else None


def collect(paths):
    found = {}
    for p in paths:
        p = os.path.expanduser(p)
        if os.path.isdir(p):
            for dp, _, fs in os.walk(p):
                for f in fs:
                    full = os.path.join(dp, f)
                    if f.lower().endswith('.zip'):
                        found.update(collect([full]))
                    elif norm(f):
                        found.setdefault(norm(f), full)
        elif p.lower().endswith('.zip') and os.path.isfile(p):
            with zipfile.ZipFile(p) as z:
                for n in z.namelist():
                    if not n.endswith('/') and norm(n) and '__MACOSX' not in n:
                        found.setdefault(norm(n), f'{p}!{n}')
        elif os.path.isfile(p) and norm(p):
            found.setdefault(norm(p), p)
        else:
            print('Không tìm thấy:', p)
    return found


def main(paths):
    items = read_prompt()
    found = collect(paths)
    need = [it for it in items if not it['skip'] and not it['optional']]
    have = [it for it in need if it['file'] in found]
    miss = [it for it in need if it['file'] not in found]
    known = {it['file'] for it in items}
    stray = sorted(f for f in found if f not in known)

    print(f'Ảnh tìm thấy: {len(found)} file')
    print(f'Cần vẽ: {len(need)} mục  ·  ĐÃ CÓ: {len(have)}  ·  CÒN THIẾU: {len(miss)}')
    groups = {}
    for it in need:
        g = groups.setdefault(it['group'], [0, 0])
        g[0] += 1
        g[1] += it['file'] in found
    for g, (n, h) in groups.items():
        print(f'  {h:>3}/{n:<3} {g[:90]}')
    if stray:
        print(f'\n{len(stray)} file không khớp tên mục nào (đổi tên cho đúng rồi chạy lại):')
        names = sorted(known)
        for f in stray:
            near = difflib.get_close_matches(f, names, n=1, cutoff=0.6)
            print(f'  {f}' + (f'   → có phải {near[0]}?' if near else ''))

    lines = ['NÚI CAO NƯỚC DÂNG · ẢNH CÒN THIẾU (gửi lại cho AI gen tiếp)',
             f'Đã có {len(have)}/{len(need)} ảnh · còn thiếu {len(miss)} ảnh. Cài đặt Fooocus như mục A trong PROMPT-FOOOCUS.txt.',
             'Mỗi mục: đặt tên file đúng dòng "File:".', '']
    cur = None
    for it in miss:
        if it['group'] != cur:
            cur = it['group']
            lines += ['', '### ' + cur, '']
        lines += [it['head'], it['prompt'], '']
    open(OUT, 'w', encoding='utf-8').write('\n'.join(lines))
    print(f'\nĐã ghi danh sách còn thiếu kèm prompt: {os.path.relpath(OUT, ROOT)}')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    main(sys.argv[1:])
