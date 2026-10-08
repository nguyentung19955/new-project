# Dựng các tờ phác thảo "em bé tinh linh" thành ảnh PNG.
#   python3 dung.py                 -> dựng mọi tờ
#   python3 dung.py mac-do          -> chỉ một tờ
#   python3 dung.py xem "biểu thức" file.png  -> ảnh xem thử lúc làm
# Hình em bé lấy thẳng từ game/js/hero_tinhlinh.js nên tờ duyệt và game là một.
import asyncio, base64, os, sys
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(os.path.join(HERE, '..'))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
SHEETS = ['bon-be-tinh-linh', 'mac-do', 'truoc-va-sau', 'moi-be-bon-vu-khi', 'dong-tac', 'co-that-phong-vuong']

def rd(p):
    return open(p, encoding='utf-8').read()

def durl(n):
    p = os.path.join(HERE, n)
    if not os.path.exists(p):
        return ''
    return 'data:image/png;base64,' + base64.b64encode(open(p, 'rb').read()).decode()

def page_html():
    old = os.path.join(ROOT, 'docs', 'phac-thao', 'hero', 'ban-2', 'nguon')
    # mã bản cũ (để vẽ lại cột "bản cũ" trong tờ trước và sau): lib.js và huong3.js, bọc lại cho khỏi đụng tên
    cu = '(function(){const HUONGS=[];' + rd(os.path.join(old, 'lib.js')).replace("'use strict';", '') + rd(os.path.join(old, 'huong3.js')).replace("'use strict';", '') + ';window.CU={h:HUONGS[0],sprite:sprite};})();'
    js = ['window.G={};', rd(os.path.join(ROOT, 'game', 'js', 'data.js')), rd(os.path.join(ROOT, 'game', 'js', 'hero_tinhlinh.js')), cu, rd(os.path.join(HERE, 'to.js'))]
    tags = ''.join('<script>%s</script>' % s for s in js)
    imgs = ''.join('<img id="%s" src="%s">' % (i, durl(n)) for i, n in (('bg', 'hien-tai-bg.png'), ('phong', 'phong-vuong.png'), ('quai', 'quai.png')))
    return '<!doctype html><html lang="vi"><meta charset="utf-8"><body style="background:#111">%s%s</body></html>' % (imgs, tags)

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
        jobs = []
        if args and args[0] == 'xem':
            jobs.append((args[1], args[2] if len(args) > 2 else os.path.join(HERE, 'xem.png')))
        else:
            for n in (args or SHEETS):
                jobs.append(('TO[%r]()' % n, os.path.join(OUT, n + '.png')))
        for expr, out in jobs:
            data = await pg.evaluate('(' + expr + ').toDataURL("image/png")')
            if errs:
                print('LỖI:', errs); sys.exit(1)
            open(out, 'wb').write(base64.b64decode(data.split(',')[1]))
            print('đã ghi', out)
        await br.close()

asyncio.run(main())
