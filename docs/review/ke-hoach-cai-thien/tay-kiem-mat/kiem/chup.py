"""Chụp cận cảnh từng khung chém kiếm của 4 em bé. Chạy: python3 chup.py <url> <thư mục ra> [nhãn]
url ví dụ http://localhost:8765/game/dist/linh-khi.html?cloud=0  (thêm &donvk=0 để so)"""
import base64, json, os, sys
from playwright.sync_api import sync_playwright
URL, OUT = sys.argv[1], sys.argv[2]; NHAN = sys.argv[3] if len(sys.argv) > 3 else ''
DEBUG = os.environ.get('DEBUG') == '1'
os.makedirs(OUT, exist_ok=True)
loi = []
JS = """([dbg]) => {
  const SC = G.spriteCustom, TL = G.tinhLinh, out = { info: {} };
  const KEYS = ['smith','hunter','wrestler','healer'], US = [0.05, 0.2, 0.35, 0.45, 0.6, 0.8, 0.95];
  const K = 4, CW = 56, CH = 60;
  for (const k of KEYS) {
    const cv = document.createElement('canvas'); cv.width = CW * K * US.length; cv.height = CH * K * 5; const c = cv.getContext('2d');
    c.imageSmoothingEnabled = false;
    const t1 = document.createElement('canvas'); t1.width = CW * 2; t1.height = CH * 2; const x = t1.getContext('2d');
    out.info[k] = [];
    for (let cb = 0; cb < 5; cb++) US.forEach((u, j) => {
      c.fillStyle = (j + cb) % 2 ? '#5b7a62' : '#4f6e57'; c.fillRect(j * CW * K, cb * CH * K, CW * K, CH * K);
      const o = { x: 28, y: 50, face: 1, key: k, t: 1, weapon: { type: 'sword', family: 0, rarity: 0 }, atk: u, p: { comboI: cb, mv: {}, st: {} }, outfit: { hat: null, robe: null, back: null, hand: null, mask: null, wing: null } };
      if (cb === 3) { o.move = true; o.p.comboI = Math.floor(j / 3) % 3; o.atk = [0.1, 0.45, 0.8][j % 3]; o.t = 0.1 + j * 0.09; }
      if (cb === 4) { o.atk = -1; o.move = j >= 4; o.t = 0.15 + j * 0.17; }
      x.setTransform(1,0,0,1,0,0); x.clearRect(0,0,t1.width,t1.height); x.setTransform(2,0,0,2,0,0); x.imageSmoothingEnabled = false;
      try { G.art.hero(x, o); } catch (e) { out.err = String(e); }
      let inf = {};
      try {
        const sp = SC.cuaEmBe(k, o), s = sp ? SC.chonEmBe(sp, o) : null, fr = TL.frame(o, 2), gv = SC.khungVk(o);
        inf = { s: s && (s.ten + ':' + s.i), anim: fr.anim, f: fr.f, hands: fr.hands, w: fr.weapon && { x: fr.weapon.x, y: fr.weapon.y, ang: fr.weapon.ang, front: fr.weapon.front }, tay: gv && gv.diem && gv.diem.tay_truoc };
        if (dbg && inf.tay) { x.setTransform(2,0,0,2,0,0); x.fillStyle = '#ff2050'; x.fillRect(28 + inf.tay[0] - 0.5, 50 + inf.tay[1] - 0.5, 1, 1); }
        if (dbg && fr.hands) { x.fillStyle = '#20e0ff'; for (const h of fr.hands) x.fillRect(28 + h[0] - 0.5, 50 + h[1] - 0.5, 1, 1); }
      } catch (e) { inf.e = String(e); }
      out.info[k].push(inf);
      c.drawImage(t1, j * CW * K, cb * CH * K, CW * K, CH * K);
      c.fillStyle = '#fff'; c.font = '14px sans-serif'; c.fillText((cb < 3 ? 'nhát ' + (cb + 1) + ' u=' + u : cb === 3 ? 'chạy+chém u=' + o.atk : o.move ? 'chạy' : 'đứng') + ' ' + (inf.s || ''), j * CW * K + 4, cb * CH * K + 16);
    });
    out[k] = cv.toDataURL();
  }
  out.loi = SC.loi.slice();
  return out;
}"""
with sync_playwright() as p:
    b = p.chromium.launch(); g = b.new_page(viewport={'width': 900, 'height': 600})
    g.on('pageerror', lambda e: loi.append(str(e)))
    g.goto(URL)
    g.wait_for_function("window.G && G.spriteCustom && G.tinhLinh && ['smith','hunter','wrestler','healer'].every(k => { const s = G.spriteCustom.get('em-be-'+k); return s && s.img && (s.donMa || /donvk=0/.test(location.search)); })", timeout=180000)
    g.wait_for_timeout(2500)
    r = g.evaluate(JS, [DEBUG])
    for k in ('smith', 'hunter', 'wrestler', 'healer'):
        open(os.path.join(OUT, f'{NHAN}{k}.png'), 'wb').write(base64.b64decode(r.pop(k).split(',')[1]))
    json.dump(r, open(os.path.join(OUT, f'{NHAN}info.json'), 'w'), ensure_ascii=False, indent=0)
    b.close()
print('pageerror:', loi or 'không có')
