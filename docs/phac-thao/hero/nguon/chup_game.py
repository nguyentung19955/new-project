# Chụp hero hiện tại và nền phòng từ game (để so sánh và làm nền dải "cỡ thật").
# Chạy: python3 chup_game.py   (cần Python Playwright; trình duyệt ở /opt/pw-browsers)
import base64, os, pathlib
from playwright.sync_api import sync_playwright
HERE = pathlib.Path(__file__).resolve().parent
GAME = HERE.parents[3] / 'game' / 'index.html'
JS = r"""
() => {
  const out = {};
  const A = G.art;
  const wp = { smith: {type:'sword',tier:0,marks:{fire:0,poison:0,ice:0},sharpen:0},
               hunter:{type:'bow',tier:0,marks:{fire:0,poison:0,ice:0},sharpen:0},
               healer:{type:'spear',tier:0,marks:{fire:0,poison:0,ice:0},sharpen:0},
               wrestler:{type:'hammer',tier:0,marks:{fire:0,poison:0,ice:0},sharpen:0} };
  for (const k of G.HKEYS) {
    const cv = document.createElement('canvas'); cv.width = 96; cv.height = 72;
    const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
    A.hero(c, { x: 40, y: 66, face: 1, key: k, move: false, t: 0.5, atk: -1, dodge: -1, weapon: wp[k] });
    out['hien-tai-' + k] = cv.toDataURL();
  }
  const cv = document.createElement('canvas'); cv.width = 480; cv.height = 270;
  const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
  A.bg(c, 0, 12345, 0, 480);
  out['phong'] = cv.toDataURL();
  return out;
}
"""
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page()
    pg.goto(GAME.as_uri(), wait_until='domcontentloaded')
    pg.wait_for_timeout(1500)
    res = pg.evaluate(JS)
    (HERE / 'tu-game').mkdir(exist_ok=True)
    for k, v in res.items():
        (HERE / 'tu-game' / (k + '.png')).write_bytes(base64.b64decode(v.split(',')[1]))
        print('đã lưu', k)
    b.close()
