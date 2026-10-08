# Dựng tờ bản chốt quái thành ảnh PNG.
#   python3 dung.py [--js a.js,b.js] ten-to ...          -> ghi ../ten-to.png
#   python3 dung.py [--js a.js,b.js] xem "biểu thức" file.png
# Không có --js thì nạp hết: chung.js rung.js laudai.js trum.js hotinh.js bocuc.js
import asyncio, base64, os, sys
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(os.path.join(HERE, '..'))
PT = os.path.abspath(os.path.join(HERE, '..', '..'))
ROOT = os.path.abspath(os.path.join(PT, '..', '..'))
rd = lambda p: open(p, encoding='utf-8').read()
args = sys.argv[1:]
LOCAL = ['rung.js', 'laudai.js', 'trum.js', 'hotinh.js', 'bocuc.js']
if args and args[0] == '--js': LOCAL = args[1].split(','); args = args[2:]
def page_html():
    js = ['window.G={};', rd(os.path.join(ROOT, 'game/js/data.js')), rd(os.path.join(ROOT, 'game/js/hero_tinhlinh.js')),
          rd(os.path.join(PT, 'hero-tinh-linh/nguon/to.js'))]
    ps = [os.path.join(PT, 'quai-bien/nguon', n) for n in ['but.js', 'quai.js', 'tinhanh.js', 'ngutinh.js', 'chieu.js']]
    ps += [os.path.join(PT, 'quai-bien/ban-2/nguon', n) for n in ['quai2.js', 'sosanh.js', 'tinhanh2.js', 'ngutinh2.js']]
    ps += [os.path.join(HERE, n) for n in ['chung.js'] + LOCAL]
    for p in ps:
        if os.path.exists(p): js.append(rd(p))
    return '<!doctype html><html lang="vi"><meta charset="utf-8"><body style="background:#111">%s</body></html>' % ''.join('<script>%s</script>' % s for s in js)
async def main():
    async with async_playwright() as p:
        br = await p.chromium.launch(); pg = await br.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.set_content(page_html()); await pg.wait_for_timeout(300)
        for w in ('700', '500'): await pg.evaluate('document.fonts.load(\'%s 40px "Inter"\')' % w)
        if errs: print('LỖI KHI NẠP:', errs)
        jobs = [(args[1], args[2])] if args[0] == 'xem' else [('TO[%r]()' % n, os.path.join(OUT, n + '.png')) for n in args]
        for expr, out in jobs:
            data = await pg.evaluate('(' + expr + ').toDataURL("image/png")')
            open(out, 'wb').write(base64.b64decode(data.split(',')[1])); print('đã ghi', out)
        if errs: print('LỖI:', errs)
        await br.close()
asyncio.run(main())
