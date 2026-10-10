"""AUDIT kiến trúc code (phiên au-kien-truc-tiep-can). Chỉ đọc mã nguồn, không chạy game.
  cd game && python3 tests/au_kien_truc.py
Đo:
  - số dòng mỗi tệp js/, tệp nào định nghĩa G.<tên> nào, tệp nào dùng G.<tên> của tệp khác (sơ đồ phụ thuộc)
  - hàm dài nhất (đếm dòng từ 'function' hoặc '=> {' tới dấu } khớp, bỏ qua chuỗi và chú thích ở mức đơn giản)
  - try/catch: bao nhiêu chỗ, bao nhiêu chỗ nuốt lỗi (catch rỗng hoặc chỉ có chú thích)
  - thứ tự nạp trong index.html có tệp nào dùng G.x ở mức ngoài cùng trước khi tệp định nghĩa nó được nạp không
  - bài kiểm thử: mỗi tệp js được bao nhiêu bài trong tests/ nhắc tới (theo tên G.<tên> nó định nghĩa)
Ghi JSON: docs/review/anh/au_kien_truc.json"""
import os, re, json, glob, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(os.path.dirname(ROOT), 'docs', 'review', 'anh', 'au_kien_truc.json')


def strip(src):
    """Bỏ chú thích và nội dung chuỗi (giữ số dòng) để đếm ngoặc cho đúng hơn."""
    out, i, n = [], 0, len(src)
    while i < n:
        c = src[i]
        if src.startswith('//', i):
            j = src.find('\n', i); j = n if j < 0 else j
            i = j; continue
        if src.startswith('/*', i):
            j = src.find('*/', i + 2); j = n if j < 0 else j + 2
            out.append('\n' * src.count('\n', i, j)); i = j; continue
        if c in '\'"`':
            j = i + 1
            while j < n and src[j] != c:
                if src[j] == '\\':
                    j += 1
                if c != '`' and src[j] == '\n':
                    break
                j += 1
            out.append(c + '\n' * src.count('\n', i, j) + c); i = j + 1; continue
        out.append(c); i += 1
    return ''.join(out)


def functions(code):
    """Tìm các hàm: vị trí '{' mở thân hàm, trả về (dòng bắt đầu, số dòng, tên)."""
    res = []
    pat = re.compile(r"(?:function\s*([\w$]*)\s*\([^()]*\)\s*\{)|(?:([\w$.]+)\s*[:=]\s*(?:function\s*\w*\s*)?\([^()]*\)\s*(?:=>\s*)?\{)|(?:([\w$]+)\s*=>\s*\{)")
    for m in pat.finditer(code):
        start = m.end() - 1
        depth, j = 0, start
        while j < len(code):
            if code[j] == '{':
                depth += 1
            elif code[j] == '}':
                depth -= 1
                if depth == 0:
                    break
            j += 1
        l0 = code.count('\n', 0, start) + 1
        l1 = code.count('\n', 0, j) + 1
        name = m.group(1) or m.group(2) or m.group(3) or '(vô danh)'
        res.append((l0, l1 - l0 + 1, name))
    return res


def main():
    html = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
    order = [s.split('/')[-1] for s in re.findall(r'<script src="([^"]+)"', html)]
    files = {}
    defs = collections.defaultdict(set)
    for f in sorted(glob.glob(os.path.join(ROOT, 'js', '*.js'))):
        name = os.path.basename(f)
        src = open(f, encoding='utf-8').read()
        code = strip(src)
        d = set(re.findall(r"\bG\.([A-Za-z_$][\w$]*)\s*=(?!=)", code))
        d |= set(re.findall(r"\bG\.([A-Za-z_$][\w$]*)\s*\|\|=", code))
        # const X = (G.foo = {}) / G.foo = G.foo || {}
        for k in d:
            defs[k].add(name)
        uses = set(re.findall(r"\bG\.([A-Za-z_$][\w$]*)", code)) - d
        catches = re.findall(r"catch\s*(?:\([^)]*\))?\s*\{([^{}]*)\}", src)
        empty = sum(1 for c in catches if not re.sub(r"/\*.*?\*/|//[^\n]*", '', c, flags=re.S).strip())
        fns = functions(code)
        files[name] = {'dong': src.count('\n') + 1, 'dinh_nghia': sorted(d), 'dung': sorted(uses), 'try': len(re.findall(r"\btry\s*\{", code)),
                       'catch_nuot_loi': empty, 'catch': len(catches), 'ham_dai_nhat': sorted(fns, key=lambda t: -t[1])[:3],
                       'G_dung_rieng': len(uses)}
    owner = {k: sorted(v) for k, v in defs.items()}
    graph = {}
    for name, info in files.items():
        dep = collections.Counter()
        for u in info['dung']:
            for o in defs.get(u, ()):
                if o != name:
                    dep[o] += 1
        graph[name] = dict(dep.most_common())
    # G.x được nhiều tệp ghi đè (định nghĩa ở >1 tệp): trạng thái dùng chung dễ vỡ
    multi = {k: v for k, v in owner.items() if len(v) > 1}
    # tệp nào được nhiều tệp khác phụ thuộc
    fan_in = collections.Counter()
    for a, deps in graph.items():
        for bname in deps:
            fan_in[bname] += 1
    # bài kiểm thử nhắc tới tệp (theo tên G.* định nghĩa hoặc tên tệp)
    tests = {}
    tsrc = {os.path.basename(t): open(t, encoding='utf-8', errors='ignore').read() for t in glob.glob(os.path.join(ROOT, 'tests', '*')) if t.endswith(('.py', '.js', '.sh'))}
    for name, info in files.items():
        keys = [k for k in info['dinh_nghia'] if len(k) > 3]
        hit = []
        for t, s in tsrc.items():
            if name in s or name[:-3] + '.js' in s or any(re.search(r"\bG\." + re.escape(k) + r"\b", s) for k in keys[:40]):
                hit.append(t)
        tests[name] = sorted(hit)
    long_fns = []
    for name, info in files.items():
        for l0, n, fn in info['ham_dai_nhat']:
            long_fns.append((n, name, l0, fn))
    long_fns.sort(reverse=True)
    res = {'thu_tu_nap': order, 'tep': files, 'phu_thuoc': graph, 'duoc_dung_boi_bao_nhieu_tep': dict(fan_in.most_common()),
           'G_dinh_nghia_o_nhieu_tep': multi, 'ham_dai': long_fns[:20], 'bai_kiem_thu_nhac_toi': {k: len(v) for k, v in tests.items()},
           'bai_kiem_thu_chi_tiet': tests, 'tong_dong': sum(f['dong'] for f in files.values()), 'so_bai_kiem_thu': len(tsrc)}
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(res, f, ensure_ascii=False, indent=1)
    print('tổng dòng js:', res['tong_dong'], 'tệp:', len(files), 'bài kiểm thử:', res['so_bai_kiem_thu'])
    print('hàm dài nhất:'); [print('  ', n, 'dòng', f + ':' + str(l), fn) for n, f, l, fn in long_fns[:15]]
    print('G.* định nghĩa ở nhiều tệp:', len(multi)); [print('  ', k, v) for k, v in list(multi.items())[:30]]
    print('try:', sum(f['try'] for f in files.values()), 'catch:', sum(f['catch'] for f in files.values()), 'catch rỗng (nuốt lỗi):', sum(f['catch_nuot_loi'] for f in files.values()))
    print('được phụ thuộc nhiều nhất:', list(fan_in.most_common(8)))
    print('ít bài kiểm thử nhắc tới:', sorted(res['bai_kiem_thu_nhac_toi'].items(), key=lambda t: t[1])[:12])


if __name__ == '__main__':
    main()
