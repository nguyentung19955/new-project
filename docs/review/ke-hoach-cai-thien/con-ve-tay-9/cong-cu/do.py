"""Còn vẽ tay 9: đo nhanh — chạy một đoạn JS (tệp hoặc chuỗi) trên bản một tệp có hook của vẽ tay 8, in khoá hình code ở lớp W/U.
    python3 do.py <tệp js cảnh> [lọc regex] [THEM=&vecode=1]"""
import os, sys, json, re, time
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '../../../../../game'))
K8 = os.path.join(HERE, '../../con-ve-tay-8/cong-cu')
sys.path.insert(0, os.path.join(ROOT, 'tests'))
from quai_lib import sync_playwright, LIB
sys.path.insert(0, K8)
src = open(os.path.join(K8, 'kiemke8.py'), encoding='utf-8').read()
RUN = re.search(r'RUN = r"""(.*?)"""', src, re.S).group(1)
URL = 'file://' + os.environ.get('DIST', ROOT + '/dist/linh-khi.html') + '?cloud=0' + os.environ.get('THEM', '')
HOOK = open(os.path.join(K8, 'hook.js'), encoding='utf-8').read()
canh = open(sys.argv[1], encoding='utf-8').read()
loc = re.compile(sys.argv[2]) if len(sys.argv) > 2 else None
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={'width': 992, 'height': 540})
    errs = []
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)[:300]))
    pg.on('console', lambda m: print(m.text, flush=True) if m.text.startswith(('CANH', 'DO ')) else None)
    if os.environ.get('HOOK', '1') == '1': pg.add_init_script(HOOK)
    pg.goto(URL); pg.wait_for_function('window.G && G.scene'); pg.wait_for_timeout(1500)
    pg.evaluate("window.requestAnimationFrame = () => 0")
    pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'bot.js')); pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
    pg.evaluate(LIB)
    if os.environ.get('HOOK', '1') == '1': pg.evaluate(RUN)
    pg.wait_for_timeout(300)
    t0 = time.time()
    out = pg.evaluate(canh)
    print('thời gian cảnh', round(time.time() - t0, 1), 's')
    if out is not None: print('KQ', json.dumps(out, ensure_ascii=False)[:3000])
    if os.environ.get('HOOK', '1') == '1':
        R = pg.evaluate("() => Object.entries(window.__kk.o).map(([k, o]) => [k + (window.__EX ? '  EX ' + o.ex : ''), o.n, o.f])")
        R.sort(key=lambda x: -x[2])
        for k, n, f in R:
            if loc is None or loc.search(k): print('%5d %6d  %s' % (f, n, k[:170]))
    print('lỗi', errs[:5], pg.evaluate('T.errs.slice(0,5)'))
    b.close()
