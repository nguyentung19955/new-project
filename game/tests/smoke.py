import sys, json
from playwright.sync_api import sync_playwright
OUT = sys.argv[1]
errs = []
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 844, 'height': 390})
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
    pg.goto('file:///home/claude/new-project/game/index.html')
    pg.wait_for_timeout(1800)
    pg.screenshot(path=OUT + '/01-title.png')
    pg.mouse.click(400, 200); pg.wait_for_timeout(400)
    pg.screenshot(path=OUT + '/02-village.png')
    pg.evaluate("G.startStage(0,0,0)"); pg.wait_for_timeout(600)
    pg.keyboard.down('KeyD'); pg.wait_for_timeout(900); pg.keyboard.up('KeyD')
    pg.keyboard.down('KeyJ'); pg.wait_for_timeout(1500)
    pg.screenshot(path=OUT + '/03-fight.png')
    pg.keyboard.up('KeyJ')
    print('errors:', errs[:10])
    b.close()
