# gif.py <url> <tag>: GIF chạy ×3 cho 4 em bé: phải hết tốc, trái hết tốc, phải nửa cần, phải chạy mà đánh (giáo); vạch đất trôi đúng tốc độ đi.
import base64, io, json, sys
from PIL import Image
from playwright.sync_api import sync_playwright
url, tag = sys.argv[1], sys.argv[2]
JS = """([key, sp]) => { const SC = G.spriteCustom, K = 3, CW = 60, CH = 50, ROWS = 4, frames = [], dt = 1/30, N = 60;
  const cv = document.createElement('canvas'); cv.width = CW * K; cv.height = CH * ROWS * K; const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
  const t1 = document.createElement('canvas'); t1.width = CW * 2; t1.height = CH * 2; const x = t1.getContext('2d');
  const look = { hat: 'non_la', robe: null, back: 'ho_lo', hand: null, mask: null, wing: null };
  const cases = [ { f: 1, r: 1, atk: false, vk: 'spear' }, { f: -1, r: 1, atk: false, vk: 'sword' }, { f: 1, r: 0.5, atk: false, vk: 'spear' }, { f: 1, r: 0.4, atk: true, vk: 'spear' } ];
  const st = cases.map(() => ({ tc: 0, gx: 0 }));
  for (let n = 0; n < N; n++) { const t = n * dt + 0.001;
    c.fillStyle = '#4b6a52'; c.fillRect(0, 0, cv.width, cv.height);
    cases.forEach((cs, r) => { const s = st[r]; s.tc += dt * Math.max(0.55, Math.min(1.2, cs.r)); s.gx += cs.r * sp * dt;
      // vạch đất trôi ngược hướng chạy (đúng tốc độ đi)
      c.fillStyle = '#3a5541'; for (let g = -2; g < 8; g++) { const gx = ((g * 12 - cs.f * s.gx) % 12 + 12) % 12 + (g - 1) * 12; c.fillRect(Math.round(gx * K), (r * CH + 44) * K, 4 * K, K); }
      c.fillStyle = 'rgba(255,230,120,.35)'; c.fillRect(0, (r * CH + 43) * K, cv.width, 1);
      x.setTransform(1,0,0,1,0,0); x.clearRect(0,0,t1.width,t1.height); x.setTransform(2,0,0,2,0,0); x.imageSmoothingEnabled = false;
      const o = { x: 30, y: 43, face: cs.f, key, move: true, t, tc: s.tc, weapon: { type: cs.vk, family: 0, rarity: 0 }, outfit: look, atk: cs.atk ? (t % 0.45) / 0.45 : -1, dodge: -1, p: { comboI: Math.floor(t / 0.45) % 3, mv: {}, st: {}, outfit: look } };
      try { G.art.hero(x, o); } catch (e) { frames.err = String(e); }
      c.drawImage(t1, 0, r * CH * K, CW * K, CH * K); });
    frames.push(cv.toDataURL()); }
  return { frames, err: frames.err || null }; }"""
loi = []
SPD = {'smith': 72, 'hunter': 72 * 1.15, 'healer': 72, 'wrestler': 72 * 0.9}
with sync_playwright() as p:
    b = p.chromium.launch(); g = b.new_page()
    g.on('pageerror', lambda e: loi.append(str(e)))
    g.goto(url)
    g.wait_for_function("window.G && G.spriteCustom && ['smith','hunter','wrestler','healer'].every(k=>{const s=G.spriteCustom.cuaEmBe(k,{key:k});return s&&s.img})", timeout=180000)
    g.wait_for_timeout(2000)
    for k in ['smith', 'hunter', 'wrestler', 'healer']:
        r = g.evaluate(JS, [k, SPD[k]])
        ims = [Image.open(io.BytesIO(base64.b64decode(u.split(',')[1]))).convert('RGB') for u in r['frames']]
        ims[0].save(f'{k}-{tag}.gif', save_all=True, append_images=ims[1:], duration=33, loop=0)
        print(k, len(ims), r['err'])
    b.close()
print('pageerror:', loi or 'không có')
