"""Phiên linh-khi-theo-thay: chụp chữ bay "+N <hệ>" khi kết liễu quái đang cháy bằng vũ khí Độc.
Chạy: python3 tests/lk_thay_shots.py <url> <thư mục ảnh>   (url bản hai tệp, vd http://127.0.0.1:8765/linh-khi-nhe.html?cloud=0)
"""
import os, sys
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)

SETUP = r"""
([thay, buoc]) => {
  G.LK_THEO_THAY = thay;
  G.testSave({ hero: 'smith', melee: 'sword', lvl: 10, tier: 1, branch: 'poison', marks: 40 });
  G.startStage(0, 2, 0, { kind: 'A', seed: 3 });
  const S = G.getRun(), W = G.getWorld(), P = S.P;
  W.waves = []; W.spawns = []; W.zones = []; W.banner = null;
  for (const x of W.ents) x.dead = true;
  const e = G.spawnEnemy('rusher', P.x + 26, P.y, {}); e.inside = true; e.spawnT = 0; e.st.comboCd = 99;
  for (const b of buoc) G.applyStatus(e, b, 20, b === 'poison' ? 3 : 1);
  window.__e = e;
}
"""
KILL = r"""() => { const e = window.__e, P = G.getRun().P; G.damage(e, e.hp + 9999, { el: 'poison', src: 'hit', w: G.curW(P) }); }"""


def main():
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 844, 'height': 390}, device_scale_factor=2)
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(URL)
        pg.wait_for_function('!!(window.G && G.scene && G.startStage)', timeout=60000)
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
        for ten, thay, buoc in [('1-chay-va-doc-moi', True, ['poison', 'fire', 'poison']), ('2-chay-va-doc-cu', False, ['poison', 'fire', 'poison']), ('3-chi-doc-moi', True, ['poison'])]:
            pg.evaluate(SETUP, [thay, buoc])
            pg.wait_for_timeout(500)
            pg.screenshot(path=os.path.join(OUT, ten + '-a-truoc.png'))
            pg.evaluate(KILL)
            pg.wait_for_timeout(1250)
            pg.screenshot(path=os.path.join(OUT, ten + '-b-sau.png'))
        b.close()
    print('pageerror:', errs[:5] if errs else 0)
    sys.exit(1 if errs else 0)


main()
