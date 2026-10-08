# Dựng ảnh xem trước vũ khí sống thành PNG.
#   python3 dung.py xem-som
#   python3 dung.py kiem cung giao bua tien-hoa bon-bac bieu-cam co-that
#   python3 dung.py soi "<biểu thức JS trả về canvas>" ra.png   -> ảnh soát lỗi
import asyncio, base64, os, sys
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(os.path.join(HERE, '..'))
GAME = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', 'game', 'js'))
JOBS = {
    'xem-som': ('xemSom()', 'xem-som.png'),
    'kiem': ('bang100("sword")', 'kiem-100-hinh.png'),
    'cung': ('bang100("bow")', 'cung-100-hinh.png'),
    'giao': ('bang100("spear")', 'giao-100-hinh.png'),
    'bua': ('bang100("hammer")', 'bua-100-hinh.png'),
    'tien-hoa': ('tienHoa()', 'tien-hoa-mot-dong.png'),
    'bon-bac': ('bonBac()', 'bon-bac.png'),
    'bieu-cam': ('bieuCam()', 'bieu-cam.png'),
    'co-that': ('coThat(document.getElementById("bg"))', 'co-that.png'),
}

def rd(p):
    return open(p, encoding='utf-8').read()

def page_html():
    bg = os.path.join(HERE, 'nen-phong.png')
    img = ''
    if os.path.exists(bg):
        img = '<img id="bg" src="data:image/png;base64,%s">' % base64.b64encode(open(bg, 'rb').read()).decode()
    js = ['window.G = window.G || {};', rd(os.path.join(GAME, 'weapon_art.js')), rd(os.path.join(HERE, 'trang.js'))]
    return '<!doctype html><html lang="vi"><meta charset="utf-8"><body style="background:#111">%s%s</body></html>' % (img, ''.join('<script>%s</script>' % s for s in js))

async def main():
    args = sys.argv[1:] or list(JOBS)
    async with async_playwright() as p:
        br = await p.chromium.launch()
        pg = await br.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        await pg.set_content(page_html())
        await pg.wait_for_timeout(200)
        await pg.evaluate('document.fonts.load(\'700 40px "Inter"\')')
        await pg.evaluate('document.fonts.load(\'500 40px "Inter"\')')
        if errs:
            print('LỖI:', errs); sys.exit(1)
        jobs = []
        if args[0] == 'soi':
            jobs.append((args[1], args[2]))
        else:
            for a in args:
                jobs.append((JOBS[a][0], os.path.join(OUT, JOBS[a][1])))
        for expr, out in jobs:
            data = await pg.evaluate('(' + expr + ').toDataURL("image/png")')
            if errs:
                print('LỖI:', errs); sys.exit(1)
            open(out, 'wb').write(base64.b64decode(data.split(',')[1]))
            print('đã ghi', out)
        await br.close()

asyncio.run(main())
