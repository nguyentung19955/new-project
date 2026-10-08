# Dựng các tờ phác thảo hero thành ảnh PNG.
#   python3 dung.py 1            -> tờ hướng 1
#   python3 dung.py 1 2 3 4      -> nhiều tờ
#   python3 dung.py so-sanh      -> tờ so sánh bốn hướng
#   python3 dung.py xem 1 [h0,atk,w1] [phóng] [file ra]  -> tờ xem thử để soát điểm ảnh
# Cần chạy lay_hien_tai.py trước một lần để có ảnh hero hiện tại và nền phòng lấy từ game.
import asyncio, base64, os, sys
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(os.path.join(HERE, '..'))
FILES = {1: 'huong-1-linh-thu', 2: 'huong-2-roi-nuoc', 3: 'huong-3-linh-khi-lam-chu', 4: 'huong-4-mat-na-hoi-lang'}

def rd(n):
    return open(os.path.join(HERE, n), encoding='utf-8').read()

def durl(n):
    return 'data:image/png;base64,' + base64.b64encode(open(os.path.join(HERE, n), 'rb').read()).decode()

def page_html():
    js = [rd('lib.js'), rd('sheet.js')]
    for i in (1, 2, 3, 4):
        p = 'huong%d.js' % i
        if os.path.exists(os.path.join(HERE, p)):
            js.append(rd(p))
    tags = ''.join('<script>%s</script>' % s for s in js)
    return ('<!doctype html><html lang="vi"><meta charset="utf-8"><body style="background:#111">'
            '<img id="bg" src="%s"><img id="cur" src="%s">%s</body></html>') % (durl('hien-tai-bg.png'), durl('hien-tai-hero.png'), tags)

async def main():
    args = sys.argv[1:] or ['1', '2', '3', '4', 'so-sanh']
    async with async_playwright() as p:
        br = await p.chromium.launch()
        pg = await br.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        await pg.set_content(page_html())
        await pg.wait_for_timeout(300)
        await pg.evaluate('document.fonts.load(\'700 40px "Inter"\')')
        await pg.evaluate('document.fonts.load(\'500 40px "Inter"\')')
        if errs:
            print('LỖI:', errs); sys.exit(1)
        jobs = []
        if args[0] == 'xem':
            n = int(args[1]); sel = args[2].split(',') if len(args) > 2 and args[2] != '-' else None
            s = int(args[3]) if len(args) > 3 else 10
            out = args[4] if len(args) > 4 else os.path.join(HERE, 'xem.png')
            jobs.append(('renderPreview(HUONGS.find(h=>h.id===%d), %s, %d)' % (n, 'null' if sel is None else str(sel), s), out))
        else:
            for a in args:
                if a == 'so-sanh':
                    jobs.append(('renderCompare(document.getElementById("cur"))', os.path.join(OUT, 'so-sanh-4-huong.png')))
                else:
                    n = int(a)
                    jobs.append(('renderSheet(HUONGS.find(h=>h.id===%d), document.getElementById("bg"))' % n, os.path.join(OUT, FILES[n] + '.png')))
        for expr, out in jobs:
            data = await pg.evaluate('(' + expr + ').toDataURL("image/png")')
            if errs:
                print('LỖI:', errs); sys.exit(1)
            open(out, 'wb').write(base64.b64decode(data.split(',')[1]))
            print('đã ghi', out)
        await br.close()

asyncio.run(main())
