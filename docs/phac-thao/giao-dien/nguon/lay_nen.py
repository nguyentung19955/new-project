"""Lấy cảnh game thật (không có giao diện) làm nền cho tờ phác thảo."""
import os, base64
from playwright.sync_api import sync_playwright
here = os.path.dirname(os.path.abspath(__file__))
url = 'file://' + os.path.abspath(os.path.join(here, '../../../../game/index.html'))
VAO = """() => { G.resetSave(); const sv = G.save; sv.sound = false; sv.tut.done = true;
  for (const k of G.HKEYS) { sv.heroes[k].unlocked = true; sv.heroes[k].lvl = 12; }
  sv.hero = 'smith';
  const w = G.weaponById(sv.carry[0]); w.marks.fire = 140; w.branch = 'fire'; w.tier = 2; w.sharpen = 4;
  const b = G.weaponById(sv.carry[1]); b.marks.ice = 40; b.branch = 'ice'; b.tier = 1; b.sharpen = 2;
  G.rnd = G.srand(11); G.startStage(0, 2, 0); G.gotoRoom(1); G.sim(150); }"""
def save(pg, js, name):
    d = pg.evaluate(js)
    open(os.path.join(here, 'anh', name), 'wb').write(base64.b64decode(d.split(',')[1]))
with sync_playwright() as p:
    br = p.chromium.launch()
    pg = br.new_page(viewport={'width': 960, 'height': 540})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(url); pg.wait_for_function('window.G && G.scene'); pg.wait_for_timeout(400)
    W = "document.getElementById('world').toDataURL()"
    try:
        pg.evaluate("() => { G.resetSave(); G.save.tut.done = true; G.save.sound=false; G.setScene(G.Village); }"); pg.wait_for_timeout(500)
        save(pg, W, 'nen-lang.png')
    except Exception as e: print('làng lỗi', e)
    pg.evaluate(VAO); pg.wait_for_timeout(300)
    save(pg, W, 'nen-tran.png')
    # hình vũ khí sống
    n = pg.evaluate("""() => { const out = []; const ws = G.save.weapons.slice(0, 8);
      for (const w of ws) { const c = document.createElement('canvas'); c.width = 66; c.height = 66; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.scale(3, 3);
        try { G.art.weaponIcon(x, w, 11, 11, 19, 'idle'); out.push([c.toDataURL(), G.wName(w), G.wRar(w)]); } catch (e) { out.push(['', String(e), 0]); } }
      return out; }""")
    for i, (d, name, rar) in enumerate(n):
        print(i, name, rar, len(d))
        if d: open(os.path.join(here, 'anh', 'vk-%d.png' % i), 'wb').write(base64.b64decode(d.split(',')[1]))
    print('lỗi:', errs[:4]); br.close()
