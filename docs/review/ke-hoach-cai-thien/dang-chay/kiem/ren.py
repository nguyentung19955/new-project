import base64, json, sys
from playwright.sync_api import sync_playwright
tag = sys.argv[1]
loi = []
JS = """(tag) => {
  const SC = G.spriteCustom, out = {};
  const K = 3, CW = 56, CH = 60, cv = document.createElement('canvas'); cv.width = CW * 10 * K; cv.height = CH * 12 * K; const c = cv.getContext('2d');
  c.fillStyle = '#4b6a52'; c.fillRect(0, 0, cv.width, cv.height); c.imageSmoothingEnabled = false;
  const t1 = document.createElement('canvas'); t1.width = CW * 2; t1.height = CH * 2; const x = t1.getContext('2d');
  const ve = (o, col, row) => { x.setTransform(1,0,0,1,0,0); x.clearRect(0,0,t1.width,t1.height); x.setTransform(2,0,0,2,0,0); x.imageSmoothingEnabled = false; try { G.art.hero(x, o); } catch (e) { out.err = String(e); } c.drawImage(t1, col * CW * K, row * CH * K, CW * K, CH * K);
     c.fillStyle='rgba(255,255,0,.5)'; c.fillRect(col*CW*K, row*CH*K + 53*K, CW*K, 1); };
  const look = { hat: 'non_la', robe: 'ao_vai', back: 'ho_lo', hand: null, mask: null, wing: null };
  out.info = {};
  ['smith','hunter','wrestler','healer'].forEach((k, r) => { const s = SC.cuaEmBe(k, {key:k}); const n = s.dt.move.so, g = s.dt.move.giay;
    out.info[k] = { so: n, giay: g, nhun: s.nhunBuoc, diem: [...Array(n).keys()].map(i => { const d = SC.diemKhung(s, k, 'move', i, SC.khopEmBe(s,'move',i)); return d ? d.diem.dinh_dau : null; }) };
    for (let i = 0; i < n; i++) {
      ve({ x: 28, y: 53, face: 1, key: k, move: true, t: (i + 0.5) * g / n, weapon: { type: 'spear', family: 0, rarity: 0 }, outfit: look }, i, r*3);
      ve({ x: 28, y: 53, face: -1, key: k, move: true, t: (i + 0.5) * g / n, weapon: { type: 'sword', family: 0, rarity: 0 }, outfit: look }, i, r*3+1);
      ve({ x: 28, y: 53, face: 1, key: k, move: true, t: (i + 0.5) * g / n, weapon: null, outfit: null }, i, r*3+2);
    } });
  out.png = cv.toDataURL(); out.loi = SC.loi.slice(); return out; }"""
with sync_playwright() as p:
    b = p.chromium.launch(); g = b.new_page(viewport={'width': 900, 'height': 600})
    g.on('pageerror', lambda e: loi.append(str(e)))
    g.goto('http://localhost:8771/linh-khi-nhe.html?cloud=0')
    g.wait_for_function("window.G && G.spriteCustom && ['smith','hunter','wrestler','healer'].every(k=>{const s=G.spriteCustom.cuaEmBe(k,{key:k});return s&&s.img})", timeout=120000)
    g.wait_for_timeout(1500)
    r = g.evaluate(JS, tag)
    open(f'run-{tag}.png', 'wb').write(base64.b64decode(r.pop('png').split(',')[1]))
    print(json.dumps(r, ensure_ascii=False))
    b.close()
print('pageerror:', loi or 'không có')
