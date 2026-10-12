import base64, json
from playwright.sync_api import sync_playwright
loi = []
with sync_playwright() as p:
    b = p.chromium.launch(); g = b.new_page(viewport={'width': 900, 'height': 600})
    g.on('pageerror', lambda e: loi.append(str(e)))
    g.goto('http://localhost:8765/game/dist/linh-khi.html?cloud=0')
    g.wait_for_function("window.G && G.spriteCustom && G.spriteCustom.get('em-be-wrestler') && G.spriteCustom.get('em-be-wrestler').donMa && G.spriteCustom.get('hoTinh')", timeout=120000)
    g.wait_for_timeout(1500)
    r = g.evaluate("""() => {
      const SC = G.spriteCustom, out = {};
      const w = SC.get('em-be-wrestler'); out.don = w.donMa; out.dt = Object.fromEntries(Object.entries(w.dt).map(([k,v]) => [k, v.hang + '/' + v.so]));
      for (const k of ['smith','hunter','wrestler']) { const s = SC.get('em-be-'+k); out[k] = { move: s.dt.move.so, giay: s.dt.move.giay, nhun: s.nhunBuoc,
        khop: [...Array(s.dt.move.so).keys()].map(i => JSON.stringify(SC.khopEmBe(s, 'move', i))) }; }
      // chọn hàng: Cu Lì đứng đánh với từng vũ khí
      out.chon = {};
      for (const vk of ['sword','bow','spear','hammer']) { const o = { key: 'wrestler', weapon: { type: vk }, atk: 0.5, p: { comboI: 1, mv: {}, st: {} }, t: 1 }; out.chon[vk] = SC.chonEmBe(w, o); }
      out.chon.cast = SC.chonEmBe(w, { key: 'wrestler', weapon: { type: 'sword' }, p: { castT: 0.2, st: {} }, t: 1 });
      out.nhunSmith = SC.nhunBuoc({ key: 'smith', move: true, t: 0.1, dodge: -1 });
      // tay cầm vũ khí đo được trên hàng đòn
      out.tay = {}; for (const k of ['atk_sword','atk_bow','atk_spear','atk_hammer','cast']) out.tay[k] = [...Array(w.dt[k].so).keys()].map(i => JSON.stringify(SC.tayAI ? SC.tayAI(w, k, i) : null));
      // vẽ: lưới Cu Lì đánh (5 hàng × 6 khung) và chạy 3 em bé có mặc đồ
      const K = 3, cv = document.createElement('canvas'); cv.width = 56 * 8 * K; cv.height = 60 * 8 * K; const c = cv.getContext('2d');
      c.fillStyle = '#4b6a52'; c.fillRect(0, 0, cv.width, cv.height); c.imageSmoothingEnabled = false;
      const t1 = document.createElement('canvas'); t1.width = 56 * 2; t1.height = 60 * 2; const x = t1.getContext('2d');
      const ve = (o, col, row) => { x.setTransform(1,0,0,1,0,0); x.clearRect(0,0,t1.width,t1.height); x.setTransform(2,0,0,2,0,0); x.imageSmoothingEnabled = false; try { G.art.hero(x, o); } catch (e) { out.err = String(e); } c.drawImage(t1, col * 56 * K, row * 60 * K, 56 * K, 60 * K); };
      const look = { hat: 'non_la', robe: 'ao_vai', back: 'ho_lo', hand: 'bua_lua', mask: null, wing: null };
      const VK = ['sword','bow','spear','hammer'];
      VK.forEach((vk, r) => { for (let i = 0; i < 6; i++) ve({ x: 28, y: 53, face: 1, key: 'wrestler', t: 1, weapon: { type: vk, family: 0, rarity: 0 }, atk: vk === 'sword' ? 0.5 + 0.0 : i / 6 + 0.01, p: { comboI: vk === 'sword' ? (i >> 1) : 0, mv: {}, st: {} }, outfit: look }, i, r); });
      for (let i = 0; i < 6; i++) ve({ x: 28, y: 53, face: 1, key: 'wrestler', t: 1, weapon: { type: 'sword', family: 0, rarity: 0 }, p: { castT: 0.4 * (1 - i / 6) + 0.001, st: {} }, outfit: look }, i, 4);
      ['smith','hunter','wrestler'].forEach((k, r) => { const s = SC.get('em-be-'+k); for (let i = 0; i < 8; i++) ve({ x: 28, y: 53, face: 1, key: k, move: true, t: (i + 0.5) * s.dt.move.giay / s.dt.move.so, weapon: { type: 'spear', family: 0, rarity: 0 }, outfit: look }, i, 5 + r); });
      out.png = cv.toDataURL();
      // Hồ Tinh: các động tác
      const hs = SC.get('hoTinh'), cv2 = document.createElement('canvas'); cv2.width = 420 * 3; cv2.height = 140 * 2; const h = cv2.getContext('2d');
      h.fillStyle = '#3a3440'; h.fillRect(0, 0, cv2.width, cv2.height); h.imageSmoothingEnabled = false;
      ['idle','move','tele','atk','hit','die'].forEach((an, j) => { h.save(); h.translate((j % 3) * 420 + 210, Math.floor(j / 3) * 140 + 130); try { SC.veQuai(h, hs, 0, 0, { anim: an, t: an === 'die' ? 0.5 : 0.3, face: 1 }); } catch (e) { out.errQ = String(e); } h.restore(); h.fillStyle = '#fff'; h.font = '14px sans-serif'; h.fillText(an, (j % 3) * 420 + 8, Math.floor(j / 3) * 140 + 18); });
      out.png2 = cv2.toDataURL();
      out.loiSC = SC.loi.slice();
      return out; }""")
    for k in ('png', 'png2'):
        open(f's/game-{k}.png', 'wb').write(base64.b64decode(r.pop(k).split(',')[1]))
    print(json.dumps(r, ensure_ascii=False, indent=0)[:4000])
    b.close()
print('pageerror:', loi or 'không có')
