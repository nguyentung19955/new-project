"""Giai đoạn 1: nạp hai tệp mới (ui_theme.js, village_scene.js) lên game đang có rồi chụp ảnh để duyệt.
   python3 tests/lang_gd1.py            -> chụp mọi ảnh vào docs/giao-dien-va-lang/
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright
from ui_lib import Game, ROOT

OUT = os.path.join(os.path.dirname(ROOT), 'docs', 'giao-dien-va-lang')
os.makedirs(OUT, exist_ok=True)

def load(g):
    for n in ('ui_theme.js', 'village_scene.js'):
        pth = os.path.join(ROOT, 'js', n)
        if os.path.exists(pth) and not g.ev("!!document.querySelector('script[data-n=\"%s\"]')" % n):
            g.pg.add_script_tag(path=pth)
    g.wait(100)

def main():
    with sync_playwright() as p:
        g = Game(p, 'phone')
        load(g)
        g.ev("""(() => { const s = G.save; s.gold = 3200; s.heroes.smith.lvl = 14; for (const k of G.HKEYS) s.heroes[k].unlocked = k !== 'wrestler'; s.ore = 46; s.stones = 5; s.mats = [24, 18, 9]; s.tut.lang = { hint: 1, lai: 99, xen: 99, may: 99, tu: 99, mo: 1 };
            s.heroes.smith.sk = { atk: 1, def: 0, elem: 0 }; G.setScene(G.VillageDemo); })()""")
        g.wait(1800)
        g.pg.screenshot(path=os.path.join(OUT, 'lang-trong-game.png'))
        # đầu bên trái của làng
        g.ev("(() => { const S = G.villageScene.state; S.path = null; S.x = 150; S.y = 158; S.cam = 0; S.face = -1; })()")
        g.wait(500)
        g.pg.screenshot(path=os.path.join(OUT, 'lang-dau-trai.png'))
        if g.errs: print('LỖI:', g.errs); sys.exit(1)
        print('đã chụp')
        g.browser.close()

main()
