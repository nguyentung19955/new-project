# Chụp nền một phòng từ game (cỡ thật 480x270) để làm nền cho ảnh co-that.png.
#   python3 lay_nen.py
import asyncio, base64, os
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', 'game', 'index.html'))
JS = """() => { const b = document.createElement('canvas'); b.width = 480; b.height = 270; const c = b.getContext('2d');
  c.imageSmoothingEnabled = false; G.time = 1; G.art.bg(c, 0, 7, 0, 480); return b.toDataURL(); }"""
async def main():
    async with async_playwright() as p:
        br = await p.chromium.launch()
        pg = await br.new_page(viewport={'width': 960, 'height': 540})
        await pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
        await pg.goto('file://' + GAME)
        await pg.wait_for_timeout(800)
        v = await pg.evaluate(JS)
        open(os.path.join(HERE, 'nen-phong.png'), 'wb').write(base64.b64decode(v.split(',')[1]))
        await br.close()
asyncio.run(main())
