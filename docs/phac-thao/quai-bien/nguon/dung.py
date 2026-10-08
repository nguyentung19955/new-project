# Dựng tờ phác thảo quái biển thành ảnh PNG.  python3 dung.py quai-bien   |   python3 dung.py xem "biểu thức" file.png
import asyncio, base64, os, sys, glob
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(os.path.join(HERE, '..'))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
rd = lambda p: open(p, encoding='utf-8').read()
def page_html():
    js = ['window.G={};', rd(os.path.join(ROOT, 'game/js/data.js')), rd(os.path.join(ROOT, 'game/js/hero_tinhlinh.js')),
          rd(os.path.join(ROOT, 'docs/phac-thao/hero-tinh-linh/nguon/to.js'))]
    for n in ['but.js', 'quai.js', 'tinhanh.js', 'ngutinh.js', 'chieu.js']:
        p = os.path.join(HERE, n)
        if os.path.exists(p): js.append(rd(p))
    return '<!doctype html><html lang="vi"><meta charset="utf-8"><body style="background:#111"><img id="bg">%s</body></html>' % ''.join('<script>%s</script>' % s for s in js)
async def main():
    args = sys.argv[1:]
    async with async_playwright() as p:
        br = await p.chromium.launch(); pg = await br.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.set_content(page_html()); await pg.wait_for_timeout(300)
        for w in ('700', '500'): await pg.evaluate('document.fonts.load(\'%s 40px "Inter"\')' % w)
        jobs = [(args[1], args[2])] if args[0] == 'xem' else [('TO[%r]()' % n, os.path.join(OUT, n + '.png')) for n in args]
        for expr, out in jobs:
            data = await pg.evaluate('(' + expr + ').toDataURL("image/png")')
            if errs: print('LỖI:', errs); sys.exit(1)
            open(out, 'wb').write(base64.b64decode(data.split(',')[1])); print('đã ghi', out)
        if errs: print('LỖI:', errs)
        await br.close()
asyncio.run(main())
