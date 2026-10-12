#!/usr/bin/env python3
"""Vẽ quái / trùm bằng chính SC.veQuai (có bóng dưới chân) ở mọi động tác, quay phải và trái. python3 quai.py <url> <ra.png> ma1,ma2,..."""
import sys, base64, io
from PIL import Image
from playwright.sync_api import sync_playwright
URL, OUT, MAS = sys.argv[1], sys.argv[2], sys.argv[3].split(',')
JS = r"""
([mas]) => {
  const SC = G.spriteCustom, rows = [];
  for (const ma of mas) { const sp = SC.get(ma); if (sp) rows.push(sp); }
  const cell = (sp) => [Math.max(48, sp.fw + 8), Math.max(40, sp.fh + 10)];
  const anims = [['idle', 0.1], ['idle', 0.6], ['move', 0.1], ['move', 0.35], ['tele', 0.2], ['atk', 0.3], ['atk', 0.7], ['hit', 0.1], ['die', 0.5], ['die', 0.95]];
  let W = 0, H = 0; for (const sp of rows) { const [w, h] = cell(sp); W = Math.max(W, w * anims.length * 2); H += h; }
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
  let y = 0;
  for (const sp of rows) {
    const [w, h] = cell(sp); let x = 0;
    for (const f of [1, -1]) for (const [n, u] of anims) {
      c.fillStyle = (x / w) % 2 ? '#4a6b3c' : '#56744a'; c.fillRect(x, y, w, h);
      const D = (sp.dt[n] && sp.dt[n].giay) || 0.6;
      try { SC.veQuai(c, sp, x + w / 2, y + h - 5, { anim: n, t: u * D, face: f }, true, D); } catch (e) { c.fillStyle = 'red'; c.fillRect(x, y, 5, 5); }
      c.fillStyle = 'rgba(255,0,0,0.6)'; c.fillRect(x + w / 2 - 6, y + h - 5, 12, 1);
      x += w;
    }
    y += h;
  }
  return cv.toDataURL();
}"""
with sync_playwright() as pw:
    b = pw.chromium.launch(); pg = b.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL); pg.wait_for_function("window.G && G.spriteCustom && G.spriteCustom.ds", timeout=120000)
    pg.evaluate("(m) => { for (const x of m) G.spriteCustom.canAnh(x); }", MAS)
    pg.wait_for_function("(m) => m.every(x => !G.spriteCustom.ds[x] || G.spriteCustom.ds[x].ready)", arg=MAS, timeout=120000)
    pg.wait_for_timeout(300)
    im = Image.open(io.BytesIO(base64.b64decode(pg.evaluate(JS, [MAS]).split(',')[1])))
    Z = int(sys.argv[4]) if len(sys.argv) > 4 else 3
    im.resize((im.width * Z, im.height * Z), Image.NEAREST).save(OUT); print('pageerror', errs)
