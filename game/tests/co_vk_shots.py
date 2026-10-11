"""Ảnh duyệt cỡ vũ khí AI cầm trên tay em bé AI (G.CO_VK, js/sprite_custom.js): trước (tắt cờ) / sau (bật cờ).
Chạy từ thư mục gốc repo:  python3 -m http.server 8782 &   rồi   python3 game/tests/co_vk_shots.py <thư mục ra>
Mỗi loại vũ khí một ảnh: 4 em bé x 4 tư thế (đứng, chạy, đánh, lộn), mỗi ô "trước | sau". Thêm ảnh làng có vũ khí bay theo."""
import os, sys, json, base64
from playwright.sync_api import sync_playwright

OUT = sys.argv[1] if len(sys.argv) > 1 else '.'
os.makedirs(OUT, exist_ok=True)
URL = 'http://localhost:8782/game/dist/linh-khi.html?cloud=0'

JS = r"""
async ([wt, fam, S]) => {
  const SC = G.spriteCustom, keys = ['smith', 'hunter', 'healer', 'wrestler'];
  const poses = [['đứng', { move: false }], ['chạy', { move: true }], ['đánh', { atk: 0.45 }], ['đánh 2', { atk: 0.8 }], ['lộn', { dodge: 0.45 }]];
  const CW = 80, CH = 66, cv = document.createElement('canvas');
  cv.width = (CW * 2 * poses.length + 30) * S; cv.height = (CH * keys.length + 14) * S;
  const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
  c.fillStyle = '#3d5a33'; c.fillRect(0, 0, cv.width, cv.height);
  const sm = document.createElement('canvas'); sm.width = CW; sm.height = CH; const s = sm.getContext('2d');
  const co0 = G.CO_VK;
  c.font = (7 * S) + 'px sans-serif'; c.fillStyle = '#fff';
  poses.forEach((p, j) => { c.fillText(p[0] + ': trước | sau', (30 + j * CW * 2 + 8) * S, 9 * S); });
  keys.forEach((k, i) => {
    c.fillStyle = '#fff'; c.fillText(k, 2 * S, (14 + i * CH + 34) * S);
    poses.forEach((p, j) => {
      for (let b = 0; b < 2; b++) {
        G.CO_VK = b ? co0 : null;
        s.setTransform(1, 0, 0, 1, 0, 0); s.clearRect(0, 0, CW, CH);
        s.fillStyle = b ? '#4a6b3c' : '#56704a'; s.fillRect(0, 0, CW, CH);
        // vạch cao thân 29
        s.fillStyle = 'rgba(255,255,255,0.35)'; s.fillRect(22, CH - 8 - 29, 1, 29);
        const o = Object.assign({ x: 30, y: CH - 8, face: 1, key: k, move: false, t: 0.3, atk: -1, dodge: -1, weapon: { type: wt, family: fam, tier: 0, rarity: 0, stage: 0 }, helm: null, armor: null, roundShadow: true }, p[1]);
        try { G.art.hero(s, o); } catch (e) { s.fillStyle = 'red'; s.fillRect(0, 0, 10, 10); }
        c.drawImage(sm, (30 + j * CW * 2 + b * CW) * S, (14 + i * CH) * S, CW * S, CH * S);
      }
    });
  });
  G.CO_VK = co0;
  return cv.toDataURL('image/png');
}
"""

def main():
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 960, 'height': 540})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(URL)
        pg.wait_for_function("window.G && G.scene && G.spriteCustom && G.spriteCustom.do && G.spriteCustom.do['vk-sword-3'] && G.spriteCustom.do['vk-sword-3'].ready && G.spriteCustom.ds && G.spriteCustom.ds['em-be-smith']", timeout=60000)
        pg.wait_for_timeout(800)
        fams = {'sword': 3, 'bow': 2, 'spear': 1, 'hammer': 3}
        for wt in ['sword', 'bow', 'spear', 'hammer']:
            d = pg.evaluate(JS, [wt, fams[wt], 3])
            open(os.path.join(OUT, 'b-tay-%s.png' % wt), 'wb').write(base64.b64decode(d.split(',')[1]))
        # tỉ lệ đo được (dài vũ khí / cao thân 29), đo trên ảnh đứng nghỉ
        r = pg.evaluate("""() => { const out = {}; for (const t of ['sword','bow','spear','hammer']) { const L = [], H = []; for (let f = 0; f < 10; f++) { const sp = G.spriteCustom.do['vk-' + t + '-' + f]; if (!sp) continue; const k = G.spriteCustom.coVk(t); L.push(Math.max(sp.rong, sp.cao) * k); } out[t] = [Math.min(...L) / 29, Math.max(...L) / 29, L.reduce((a, b) => a + b) / L.length / 29]; } return out; }""")
        print('tỉ lệ dài/thân (min, max, tb):', json.dumps(r))
        # làng có vũ khí bay theo
        pg.evaluate("""() => { G.resetSave(); const s = G.save; s.sound = false; s.tut.done = true; const a = G.weaponById(s.carry[0]); a.family = 3; const b = G.weaponById(s.carry[1]); b.family = 2; G.setScene(G.Village); }""")
        pg.wait_for_timeout(1500)
        for nm, on in (('c-lang-truoc', False), ('c-lang-sau', True)):
            pg.evaluate("(on) => { if (!window.__co) window.__co = G.CO_VK; G.CO_VK = on ? window.__co : null; }", on)
            pg.wait_for_timeout(400)
            pg.screenshot(path=os.path.join(OUT, nm + '.png'))
        b.close()
    print('pageerror:', errs[:5] if errs else 'không có')

main()
