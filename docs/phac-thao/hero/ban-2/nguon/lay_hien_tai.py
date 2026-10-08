# Dựng hero hiện tại và nền phòng từ game, lưu thành ảnh PNG nhỏ (cỡ thật) để các tờ phác thảo dùng lại.
import asyncio, base64, os, sys
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', '..', 'game', 'index.html'))
JS = r"""
() => {
  const out = {};
  const keys = ['smith','hunter','healer','wrestler'];
  const wp = {smith:'sword', hunter:'bow', healer:'spear', wrestler:'hammer'};
  const cv = document.createElement('canvas'); cv.width = 96*4; cv.height = 80;
  const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
  keys.forEach((k,i) => {
    G.art.hero(c, {x: 40+96*i, y: 70, face: 1, key: k, move: false, t: 0.3, atk: -1, dodge: -1,
      weapon: {type: wp[k], tier: 0, marks:{fire:0,poison:0,ice:0}, branch: null, sharpen: 0}});
  });
  out.hero = cv.toDataURL();
  const b = document.createElement('canvas'); b.width = 480; b.height = 270;
  const bc = b.getContext('2d'); bc.imageSmoothingEnabled = false;
  G.time = 1;
  G.art.bg(bc, 0, 7, 0, 480);
  out.bg = b.toDataURL();
  return out;
}
"""
async def main():
    async with async_playwright() as p:
        br = await p.chromium.launch()
        pg = await br.new_page(viewport={'width': 960, 'height': 540})
        await pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
        await pg.goto('file://' + GAME)
        await pg.wait_for_timeout(800)
        res = await pg.evaluate(JS)
        for k, v in res.items():
            open(os.path.join(HERE, 'hien-tai-' + k + '.png'), 'wb').write(base64.b64decode(v.split(',')[1]))
        await br.close()
asyncio.run(main())
