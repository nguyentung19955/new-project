#!/usr/bin/env python3
# Thống kê ảnh hiệu ứng theo chủ (ụ / trùm / chỉ huy / dùng chung) bằng quét tĩnh mã nguồn thap/js + danh sách thap/assets.
# Dùng: python3 tools/thap-thong-ke-hieu-ung.py <gốc repo> <thư mục ra>   (mặc định: . và docs/demo-hop-tuong/tuvan/webgl)
import re, os, sys, json, glob, subprocess, collections
goc = sys.argv[1] if len(sys.argv) > 1 else '.'
ra = sys.argv[2] if len(sys.argv) > 2 else os.path.join(goc, 'docs/demo-hop-tuong/tuvan/webgl')
ds_file = os.environ.get('ASSETS_TXT')
if ds_file: assets = [l.strip() for l in open(ds_file) if l.strip()]
else: assets = [os.path.relpath(p, os.path.join(goc, 'thap/assets')) for p in glob.glob(os.path.join(goc, 'thap/assets/**/*.*'), recursive=True)]
stems = {}
for a in assets:
    if not re.search(r'\.(png|webp|jpg)$', a): continue
    stems.setdefault(re.sub(r'\.[a-z0-9]+$', '', a), set()).add(a.rsplit('.', 1)[1])
js = {}
for p in sorted(glob.glob(os.path.join(goc, 'thap/js/**/*.js'), recursive=True)):
    js[os.path.relpath(p, os.path.join(goc, 'thap/js'))] = open(p, encoding='utf8', errors='replace').read()
allsrc = '\n'.join(js.values())
# --- id ụ / trùm / chỉ huy
ids = set(re.findall(r'\bSKILLS\.([a-z0-9]+)\s*=', allsrc)) | set(re.findall(r'"id":\s*"([a-z0-9]+)"', js.get('meta.js', '')))
ids = {i for i in ids if (i + '_nong') in stems or ('pilot_' + i) in stems}
trum = {'mad_crown','freezer','janus','joker_king','nightmare','octopus','hive','jammer','prism','twin_core','patcher','leech'}
TRUM_TEN = {'mad_crown':['madcrown','crown','mad'],'joker_king':['joker','jokerking'],'twin_core':['twincore','twin'],'janus':['janus'],'octopus':['octopus','octo']}
mv = set(re.findall(r"\b([a-z]+):\s*\{[^{}]*anh:\s*'cmd_", allsrc)) | set(re.findall(r"anh:\s*'cmd_([a-z0-9]+)'", allsrc))
NHOM_HIEU_UNG = ('fx', 'sig', 'p2', 'p3', 'cm', 'tv', 'ha', 'sup', 'cf', 'vfx', 'buff', 'tia', 'no', 'dan', 'trum', 'quai', 'ronglua', 'soi', 'hydra', 'mauhut', 'canon', 'bienmau', 'tienhoa', 'loi')
def chu_theo_ten(s):
    t = s.split('/')[-1]; best = None
    for i in ids:
        if re.match(r'(?:(?:fx|p2|p3|sig|dan|cm|sup|tv)_)?' + re.escape(i) + r'(?:_|$|toc_|vang_)', t) or re.match(r'fx_' + re.escape(i) + r'\d*$', t):
            if best is None or len(i) > len(best): best = i
    if t.startswith(('trum_', 'fx_trum_', 'sig_trum_')) or best is None:
        for b in trum:
            for v in [b, b.replace('_', '')] + TRUM_TEN.get(b, []):
                if re.search(r'(^|_)' + re.escape(v) + r'(_|$|\d)', t) and (t.startswith(('trum', 'fx_trum', 'sig', 'quai')) or t.startswith(v) or t.startswith('fx_' + v)): return ('trum', b)
    if best: return ('u', best)
    return None
# --- tham chiếu tĩnh: chuỗi trùng tên ảnh; chủ theo vị trí mã (khối SKILLS.<id> = hoặc khoá '<id>:' đầu dòng gần nhất phía trên, cùng file)
ref = collections.defaultdict(set); chu_ma = collections.defaultdict(set)
lit = re.compile(r"""['"`]([A-Za-z0-9_/]+)['"`]""")
for f, s in js.items():
    cur = None
    for ln in s.split('\n'):
        m = re.match(r'\s*SKILLS\.([a-z0-9]+)\s*=', ln) or re.match(r"\s{0,6}['\"]?([a-z0-9]+)['\"]?:\s*[\{\[\(]", ln)
        if m and m.group(1) in ids: cur = m.group(1)
        elif re.match(r'^(const|let|var|function|\}\)|\(\(\)|//\s*=====)', ln): cur = None
        for x in lit.findall(ln):
            if x in stems:
                ref[x].add(f)
                if cur: chu_ma[x].add(cur)
# --- tên dựng động: 'tien_to_' + …  /  … + '_hau_to'
dong = collections.defaultdict(set)
for f, s in js.items():
    for m in re.finditer(r"'([a-z0-9]+_(?:[a-z0-9]+_)*)'\s*\+\s*[A-Za-z_\(\[]", s):
        p = m.group(1); tail = s[m.end():m.end() + 80]; m2 = re.search(r"\+\s*'(_[a-z0-9_]+)'", tail); suf = m2.group(1) if m2 else ''
        for x in stems:
            t = x.split('/')[-1]
            if t.startswith(p) and t.endswith(suf) and len(t) > len(p) + len(suf): dong[x].add(f + ' («' + p + '…' + suf + '»)')
    for m in re.finditer(r"[\w\)\]]\s*\+\s*'(_[a-z0-9_]+)'", s):
        suf = m.group(1)
        for x in stems:
            t = x.split('/')[-1]
            if t.endswith(suf) and t[:-len(suf)] in ids: dong[x].add(f + ' («id…' + suf + '»)')
# --- gom
NGOAI_TRAN = {'home.js','unitpage.js','kinhte-ui.js','thebai-ui.js','tien-ui.js','tuongmoi-ui.js','data.js','ngonngu-vi.js','ngonngu.js','text.js','meta.js','chandung.js','khung.js','dkdcdw.js','dkcham.js','bobai.js','sohuu.js','kinhte.js','thebai.js','manh.js','tientrinh.js','admin.js','huongdan.js','nv-the.js','khe.js','bopopup.js','ctdeck.js','chihuy-the.js','artscale.js'}
theo_chu = collections.defaultdict(lambda: collections.defaultdict(set)); chung = {}; mo_coi = []; ngoai = []
def la_hieu_ung(s): return s.split('/')[-1].split('_')[0] in NHOM_HIEU_UNG or s in ref or s in dong
for s in sorted(stems):
    t = s.split('/')[-1]
    if t.startswith(('pilot_', 'cmd_', 'nen_', 'ic_', 'shop_', 'ui_', 'tb_', 'h2_', 'hud_', 'o_', 'p7_', 'ua_')) or '/' in s and not s.startswith('nho/'): continue
    if s.startswith('nho/'): continue
    c = chu_theo_ten(s); nguon = sorted(ref.get(s, set())) + sorted(dong.get(s, set()))
    if c: theo_chu[c[0]][c[1]].add(s)
    elif chu_ma.get(s) and len(chu_ma[s]) <= 3:
        for i in chu_ma[s]: theo_chu['u'][i].add(s)
        if len(chu_ma[s]) > 1: chung[s] = nguon
    elif [n for n in nguon if n.split(' ')[0] not in NGOAI_TRAN]: chung[s] = [n for n in nguon if n.split(' ')[0] not in NGOAI_TRAN]
    elif nguon: ngoai.append(s)
    else: mo_coi.append(s)
kq = {'sinh_luc': subprocess.run(['date', '-u', '+%Y-%m-%dT%H:%MZ'], capture_output=True, text=True).stdout.strip(),
      'so_anh': len(stems), 'u': {i: sorted(v) for i, v in sorted(theo_chu['u'].items())}, 'trum': {i: sorted(v) for i, v in sorted(theo_chu['trum'].items())},
      'chihuy': {i: sorted(v) for i, v in sorted(theo_chu['chihuy'].items())}, 'dung_chung': {k: v[:4] for k, v in sorted(chung.items())}, 'chi_dung_ngoai_tran': sorted(ngoai), 'khong_thay_tham_chieu': mo_coi,
      'u_khong_co_anh_rieng': sorted(i for i in ids if i not in theo_chu['u'])}
os.makedirs(ra, exist_ok=True)
json.dump(kq, open(os.path.join(ra, 'THONG-KE-HIEU-UNG.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=0)
def loai(s):
    t = s.split('/')[-1]
    for k, v in (('_nong', 'đầu'), ('_de', 'bệ'), ('_vien', 'bệ'), ('_phu', 'bệ'), ('_dan', 'đạn'), ('_trung', 'trúng'), ('_no', 'nổ'), ('_hieu', 'hiệu'), ('_tia', 'tia')):
        if k in t: return v
    return 'khác'
L = ['# THỐNG KÊ ẢNH HIỆU ỨNG THEO CHỦ — để NẠP TRƯỚC lúc vào trận (WebGL)', '',
     f"Sinh tự động bằng `tools/thap-thong-ke-hieu-ung.py` lúc {kq['sinh_luc']} từ `thap/js` + `thap/assets` ({kq['so_anh']} ảnh). Bản máy đọc: `THONG-KE-HIEU-UNG.json` (cùng thư mục).", '',
     '**Cách dùng:** vào trận, với mỗi id trong bộ bài của CẢ HAI bàn nạp `u[id]`; với trùm sắp ra nạp `trum[id]`; chỉ huy nạp `chihuy[id]`; `dung_chung` nạp theo tình huống (xem cột nguồn).',
     '**Giới hạn (quét tĩnh):** chủ xác định theo TÊN ảnh, rồi theo vị trí chuỗi trong mã (khối `SKILLS.<id>` / khoá `<id>:` gần nhất phía trên). Tên dựng lúc chạy chỉ bắt được dạng `\'tiền_tố_\' + …` và `id + \'_hậu_tố\'`. Chưa đối chiếu bằng trận thật — nên chạy 1 lượt ghi `REN.img(tên)` trong trận bot để bắt phần sót.', '',
     f"Tổng: {len(kq['u'])} ụ có ảnh riêng ({sum(len(v) for v in kq['u'].values())} ảnh) · {len(kq['trum'])} trùm ({sum(len(v) for v in kq['trum'].values())}) · {len(kq['chihuy'])} chỉ huy ({sum(len(v) for v in kq['chihuy'].values())}) · dùng chung {len(kq['dung_chung'])} · không thấy tham chiếu {len(mo_coi)}.", '',
     '## 1. Theo ụ', '', '| id | số ảnh | ảnh (ngoài đầu/bệ) |', '|---|---|---|']
for i, v in kq['u'].items():
    hx = [s for s in v if loai(s) not in ('đầu', 'bệ')]
    L.append(f"| `{i}` | {len(v)} | {', '.join('`' + s + '`' for s in hx) or '—'} |")
L += ['', '## 2. Theo trùm', '', '| id | số ảnh | ảnh |', '|---|---|---|'] + [f"| `{i}` | {len(v)} | {', '.join('`' + s + '`' for s in v)} |" for i, v in kq['trum'].items()]
L += ['', '## 3. Theo chỉ huy', '', '| id | ảnh |', '|---|---|'] + [f"| `{i}` | {', '.join('`' + s + '`' for s in v)} |" for i, v in kq['chihuy'].items()]
L += ['', '## 4. Dùng chung / theo tình huống (không gắn với 1 ụ)', '', '| ảnh | nơi dùng |', '|---|---|'] + [f"| `{k}` | {', '.join(v)} |" for k, v in kq['dung_chung'].items()]
L += ['', '## 5. Có trong assets nhưng KHÔNG thấy tham chiếu tĩnh (có thể là tên dựng lúc chạy, hoặc ảnh thừa)', '', ', '.join('`' + s + '`' for s in mo_coi) or '—', '',
      '## 6. Ụ không có ảnh hiệu ứng riêng', '', ', '.join('`' + s + '`' for s in kq['u_khong_co_anh_rieng']) or '—', '']
open(os.path.join(ra, 'THONG-KE-HIEU-UNG.md'), 'w', encoding='utf8').write('\n'.join(L))
print('ụ', len(kq['u']), 'ảnh ụ', sum(len(v) for v in kq['u'].values()), '| trùm', len(kq['trum']), sum(len(v) for v in kq['trum'].values()), '| chỉ huy', len(kq['chihuy']), '| chung', len(kq['dung_chung']), '| mồ côi', len(mo_coi), '| ids', len(ids), '| trum ids', sorted(trum)[:14])
