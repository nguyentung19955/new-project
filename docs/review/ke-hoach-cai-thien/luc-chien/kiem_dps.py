"""So lực chiến với DPS đo bằng bot đánh bia (cùng cách au_dps.py). python3 lc_dps.py URL"""
import sys, os, json
sys.path.insert(0, '/home/claude/new-project/game/tests')
URL = sys.argv[1]; sys.argv = sys.argv[:1]
import au_dps
from playwright.sync_api import sync_playwright
ROOT = '/home/claude/new-project/game'

JS = au_dps.JS_DPS.replace("AU.room({ melee, lvl: 10, tier: 1, sharpen: 3 })", "AU.room(Object.assign({ melee }, window.__CFG))") \
     .replace("return { mode,", "return { lc: G.lucChien(), mode,")
CFGS = [('cấp 5 Thường +0', dict(lvl=5, tier=0, sharpen=0)), ('cấp 10 Lam +3', dict(lvl=10, tier=1, sharpen=3)),
        ('cấp 10 Lam +6', dict(lvl=10, tier=1, sharpen=6)), ('cấp 20 Tím +6', dict(lvl=20, tier=2, sharpen=6)),
        ('cấp 30 Vàng +10', dict(lvl=30, tier=3, sharpen=10))]
out = []
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL); pg.wait_for_function('window.G && G.scene')
    for f in ['bot.js', 'setup.js', 'au_lib.js']: pg.add_script_tag(path=os.path.join(ROOT, 'tests', f))
    for name, cfg in CFGS:
        pg.evaluate('(c) => { window.__CFG = c; }', cfg)
        r = pg.evaluate(JS, ['sword', 10, False, False])
        out.append((name, r['lc'], round(r['dps'], 1)))
    b.close()
for o in out: print('| %s | %d | %.1f |' % o)
ok = all(out[i][1] < out[i + 1][1] and out[i][2] < out[i + 1][2] for i in range(len(out) - 1))
print('CUNG_CHIEU', ok, 'ERR', errs)
