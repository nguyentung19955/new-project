# Ghép tệp game/js/monster_art.js từ: mã vẽ bản chốt (giữ nguyên nét) + máy hoạt hình + các tệp cử động từng vùng.
#   python3 ghep.py            -> ghi game/js/monster_art.js
#   python3 ghep.py --out X    -> ghi ra tệp X (để xem thử, không đụng tệp của game)
import os, sys, subprocess, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
PT = os.path.abspath(os.path.join(HERE, '..', '..'))
ROOT = os.path.abspath(os.path.join(PT, '..', '..'))
OUT = os.path.join(ROOT, 'game/js/monster_art.js')
if '--out' in sys.argv: OUT = sys.argv[sys.argv.index('--out') + 1]
# (tệp nguồn, dòng đầu, dòng cuối) : chỉ lấy phần vẽ hình, bỏ phần dàn trang tờ duyệt.
GOC = [
  ('quai-bien/nguon/but.js', 1, 999), ('quai-bien/nguon/quai.js', 2, 2), ('quai-bien/nguon/tinhanh.js', 2, 3),
  ('quai-bien/nguon/ngutinh.js', 2, 3), ('quai-bien/nguon/chieu.js', 3, 6),
  ('quai-bien/ban-2/nguon/quai2.js', 2, 125), ('quai-bien/ban-2/nguon/tinhanh2.js', 2, 76), ('quai-bien/ban-2/nguon/ngutinh2.js', 2, 66),
  ('quai-ban-chot/nguon/chung.js', 3, 4), ('quai-ban-chot/nguon/rung.js', 2, 220), ('quai-ban-chot/nguon/laudai.js', 2, 221),
  ('quai-ban-chot/nguon/trum.js', 2, 224), ('quai-ban-chot/nguon/hotinh.js', 2, 123),
]
CU_DONG = ['bien.js', 'rung.js', 'laudai.js', 'trumnho.js', 'ngutinh.js', 'moctinh.js', 'hotinh.js', 'chitiet.js']
rd = lambda p: open(p, encoding='utf-8').read()
def ok(src):
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f: f.write(src); n = f.name
    r = subprocess.run(['node', '--check', n], capture_output=True, text=True); os.unlink(n); return r.returncode == 0, r.stderr
out = ['// LINH KHÍ: hình và hoạt hình cử động của toàn bộ quái và trùm (36 con).',
       '// TỆP NÀY ĐƯỢC GHÉP TỰ ĐỘNG bằng docs/phac-thao/quai-hoat-hinh/nguon/ghep.py. Muốn sửa thì sửa tệp nguồn ở đó rồi ghép lại.',
       '// Cách dùng: G.monsterArt.draw(c, id, x, y, {anim, t, face, dir, phase, hit});  G.monsterArt.list = danh sách quái.',
       '(function () {', "'use strict';", "const G = (typeof window !== 'undefined') ? (window.G = window.G || {}) : (globalThis.G = globalThis.G || {});", 'const TO = {};',
       '// ================= PHẦN 1: mã vẽ hình gốc của bản chốt (giữ nguyên) =================']
for f, a, b in GOC:
    ls = rd(os.path.join(PT, f)).split('\n')[a - 1:b]
    s = '\n'.join(ls).replace("'use strict';", '')
    if f.endswith('quai2.js'): s = s.replace('function vien(g)', 'function vien0(g)')
    out.append('// ----- từ ' + f + ' -----'); out.append(s)
out.append('// ================= PHẦN 2: máy hoạt hình =================')
out.append(rd(os.path.join(HERE, 'may.js')))
out.append('// ================= PHẦN 3: cử động từng con =================')
for n in CU_DONG:
    p = os.path.join(HERE, n)
    if not os.path.exists(p): continue
    s = rd(p); good, err = ok('function __x(){\n' + s + '\n}')
    if not good: print('BỎ QUA (lỗi cú pháp):', n, err[:600]); continue
    out.append('// ----- ' + n + ' -----\ntry { (function () {\n' + s + "\n})(); } catch (e) { MA.loi.push('" + n + ": ' + (e && e.stack || e)); if (typeof console !== 'undefined') console.error('monster_art " + n + "', e); }")
out.append('MA._xong();\n})();\n')
open(OUT, 'w', encoding='utf-8').write('\n'.join(out))
good, err = ok('\n'.join(out)); print('đã ghi', OUT, len('\n'.join(out)) // 1024, 'KB', 'CÚ PHÁP ĐÚNG' if good else 'LỖI CÚ PHÁP: ' + err[:800])
