import sys, json
from playwright.sync_api import sync_playwright
with sync_playwright() as pw:
    b = pw.chromium.launch(); pg = b.new_page(); pg.goto(sys.argv[1])
    pg.wait_for_function("window.G && G.spriteCustom && G.spriteCustom.ds['em-be-smith'] && G.spriteCustom.ds['em-be-smith'].ready && G.spriteCustom.ds['em-be-smith'].donMa", timeout=120000)
    pg.wait_for_timeout(1500)
    print(pg.evaluate(sys.argv[2]))
    b.close()
