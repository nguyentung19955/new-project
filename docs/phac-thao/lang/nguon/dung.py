# Dựng các tờ phác thảo "làng có người" thành ảnh PNG.
#   python3 dung.py            -> dựng mọi tờ
#   python3 dung.py ten-to     -> chỉ một tờ
# Em bé hero lấy thẳng từ game/js/hero_tinhlinh.js. Làng và người làng vẽ trong lang.js, các tờ xếp trong to.js.
import asyncio, base64, os, sys
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(os.path.join(HERE, '..'))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
SHEETS = ['lang-toan-canh', 'nguoi-trong-lang', 'tuong-tac', 'hai-bo-cuc', 'ban-do-vung', 'tren-man-hinh-that']

def rd(p):
    return open(p, encoding='utf-8').read()

def page_html():
    js = ['window.G={};', rd(os.path.join(ROOT, 'game', 'js', 'data.js')), rd(os.path.join(ROOT, 'game', 'js', 'hero_tinhlinh.js')), rd(os.path.join(HERE, 'lang.js'))]
    for n in ('to.js',):
        if os.path.exists(os.path.join(HERE, n)):
            js.append(rd(os.path.join(HERE, n)))
    tags = ''.join('<script>%s</script>' % s for s in js)
    return '<!doctype html><html lang="vi"><meta charset="utf-8"><body style="background:#111">%s</body></html>' % tags

async def main():
    args = sys.argv[1:]
    async with async_playwright() as p:
        br = await p.chromium.launch()
        pg = await br.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type in ('error', 'warning') else None)
        await pg.set_content(page_html())
        await pg.wait_for_timeout(300)
        for w in ('700', '500'):
            await pg.evaluate('document.fonts.load(\'%s 40px "Inter"\')' % w)
        for n in (args or SHEETS):
            has = await pg.evaluate('typeof TO[%r]' % n)
            if has != 'function':
                print('chưa có tờ', n); continue
            data = await pg.evaluate('TO[%r]().toDataURL("image/png")' % n)
            if errs:
                print('LỖI:', errs); sys.exit(1)
            out = os.path.join(OUT, n + '.png')
            open(out, 'wb').write(base64.b64decode(data.split(',')[1]))
            print('đã ghi', out)
        await br.close()

asyncio.run(main())
