# Ghép riêng tệp chitiet.js vào game/js/monster_art.js (thay khối cũ nếu đã có), không cần các tệp bản chốt.
#   python3 ghep_chitiet.py
import os, subprocess, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
OUT = os.path.join(ROOT, 'game/js/monster_art.js')
src = open(OUT, encoding='utf-8').read()
A, B = '// ----- chitiet.js -----\n', "// ----- hết chitiet.js -----\n"
if A in src: src = src[:src.index(A)] + src[src.index(B) + len(B):]
s = open(os.path.join(HERE, 'chitiet.js'), encoding='utf-8').read()
blk = A + 'try { (function () {\n' + s + "\n})(); } catch (e) { MA.loi.push('chitiet.js: ' + (e && e.stack || e)); if (typeof console !== 'undefined') console.error('monster_art chitiet.js', e); }\n" + B
k = src.rindex('MA._xong();')
src = src[:k] + blk + src[k:]
open(OUT, 'w', encoding='utf-8').write(src)
with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False) as f: f.write(src); n = f.name
r = subprocess.run(['node', '--check', n], capture_output=True, text=True); os.unlink(n)
print('đã ghép chitiet.js vào', OUT, 'CÚ PHÁP ĐÚNG' if r.returncode == 0 else 'LỖI: ' + r.stderr[:500])
