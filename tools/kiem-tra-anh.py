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
REDO = os.path.join(HERE, 'anh-lam-lai.txt')    # ảnh đã có nhưng cần vẽ lại (tên | lý do)
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
    redo, soft = {}, {}
    if os.path.exists(REDO):
        for l in open(REDO, encoding='utf-8'):
            if '|' in l and not l.startswith('#'):
                f, why = l.split('|', 1)
                if f.startswith('~'):
                    soft[f[1:].strip()] = why.strip()
                else:
                    redo[f.strip()] = why.strip()
    need = [it for it in items if not it['skip'] and not it['optional']]
    have = [it for it in need if it['file'] in found and it['file'] not in redo]
    bad = [it for it in need if it['file'] in found and it['file'] in redo]
    miss = [it for it in need if it['file'] not in found]
    # icon kỹ năng: tuỳ chọn (game đã có bản vector) — để cuối danh sách
    opt = [it for it in miss if it['file'].startswith('ky-nang_')]
    miss = [it for it in miss if not it['file'].startswith('ky-nang_')]
    known = {it['file'] for it in items}
    stray = sorted(f for f in found if f not in known)

    print(f'Ảnh tìm thấy: {len(found)} file')
    print(f'Cần vẽ: {len(need)} mục  ·  DÙNG ĐƯỢC: {len(have)} (trong đó {sum(it["file"] in soft for it in have)} nên làm lại khi rảnh)  ·  CẦN LÀM LẠI: {len(bad)}  ·  CHƯA CÓ (bắt buộc): {len(miss)}  ·  icon kỹ năng tuỳ chọn chưa có: {len(opt)}')
    groups = {}
    for it in need:
        g = groups.setdefault(it['group'], [0, 0])
        g[0] += 1
        g[1] += it['file'] in found and it['file'] not in redo
    for g, (n, h) in groups.items():
        print(f'  {h:>3}/{n:<3} {g[:90]}')
    if stray:
        print(f'\n{len(stray)} file không khớp tên mục nào (đổi tên cho đúng rồi chạy lại):')
        names = sorted(known)
        for f in stray:
            near = difflib.get_close_matches(f, names, n=1, cutoff=0.6)
            print(f'  {f}' + (f'   → có phải {near[0]}?' if near else ''))

    lines = ['NÚI CAO NƯỚC DÂNG · ẢNH CẦN VẼ TIẾP (gửi lại cho AI gen)',
             f'Dùng được {len(have)}/{len(need)} ảnh · cần làm lại {len(bad)} · chưa có {len(miss)} · tổng cần vẽ {len(bad) + len(miss)}'
             + (f' (+ {len(opt)} icon kỹ năng tuỳ chọn ở PHẦN 4)' if opt else '') + '.',
             'Cài đặt Fooocus như mục A trong PROMPT-FOOOCUS.txt (nhớ dán thêm NEGATIVE THÊM cho đồ / quái).',
             'Mỗi mục: đặt tên file đúng dòng "File:". Prompt đã sửa để không ra đĩa trống tròn / quái hình người.', '']
    if bad:
        lines += ['', '=' * 78, f'PHẦN 1 · CẦN LÀM LẠI ({len(bad)} ảnh đã gen nhưng sai)', '=' * 78]
    cur = None
    for it in bad:
        if it['group'] != cur:
            cur = it['group']
            lines += ['', '### ' + cur, '']
        lines += [it['head'] + '   ·   ⟲ LÀM LẠI: ' + redo[it['file']], it['prompt'], '']
    lines += ['', '=' * 78, f'PHẦN 2 · CHƯA CÓ ({len(miss)} ảnh)', '=' * 78]
    cur = None
    for it in miss:
        if it['group'] != cur:
            cur = it['group']
            lines += ['', '### ' + cur, '']
        lines += [it['head'], it['prompt'], '']
    nice = [it for it in have if it['file'] in soft]
    if nice:
        lines += ['', '=' * 78, f'PHẦN 3 · NÊN LÀM LẠI KHI RẢNH ({len(nice)} ảnh dùng tạm được, game đã dùng)', '=' * 78, '']
        for it in nice:
            lines += [it['head'] + '   ·   ~ NÊN LÀM LẠI: ' + soft[it['file']], it['prompt'], '']
    if opt:
        lines += ['', '=' * 78, f'PHẦN 4 · TUỲ CHỌN: icon kỹ năng ({len(opt)} ảnh, game đã có bản vector — vẽ sau cùng)', '=' * 78, '']
        for it in opt:
            lines += [it['head'], it['prompt'], '']
    open(OUT, 'w', encoding='utf-8').write('\n'.join(lines))
    print(f'\nĐã ghi danh sách còn thiếu kèm prompt: {os.path.relpath(OUT, ROOT)}')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    main(sys.argv[1:])
