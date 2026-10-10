// node chup.js <url> <outJson> [anhDir] [che-do: so|ghep]
const { chromium } = require('playwright');
const fs = require('fs');
const [url, outJson, anhDir, cheDo] = process.argv.slice(2);
const DO = JSON.parse(fs.readFileSync(__dirname + '/do-thu.json', 'utf8'));
(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage();
  const loi = [];
  pg.on('pageerror', (e) => loi.push(String(e)));
  await pg.goto(url, { waitUntil: 'load' });
  await pg.waitForFunction(() => window.G && G.tinhLinh && G.spriteCustom && G.art && G.art.hero, null, { timeout: 30000 });
  await pg.waitForTimeout(1500);
  const kq = await pg.evaluate(async ({ DO, cheDo }) => {
    const SC = G.spriteCustom, TL = G.tinhLinh;
    const cho = (f) => new Promise((r) => { const k = () => (f() ? r() : setTimeout(k, 20)); k(); });
    // --- đồ thử: chế độ "so" bỏ diem (phải y hệt bản cũ), chế độ "ghep" giữ diem
    for (const t of DO) { const t2 = JSON.parse(JSON.stringify(t)); if (cheDo !== 'ghep') delete t2.trang_phuc.diem; SC.add(t2); }
    await cho(() => DO.every((t) => SC.do[t.ma] && SC.do[t.ma].ready));
    // --- thân AI tạm: dựng tấm sprite từ chính em bé code (không đồ)
    const fw = 48, fh = 48, gx = 24, gy = 42;
    const DT = [['idle', 'idle', 4, 2], ['move', 'run', 4, 2], ['tele', 'idle', 2, 1], ['atk', 'cast', 4, 2], ['hit', 'hurt', 1, 1], ['die', 'die', 4, 2], ['ne', 'dodge', 4, 2]];
    const sheet = document.createElement('canvas'); sheet.width = fw * 4; sheet.height = fh * DT.length;
    const sg = sheet.getContext('2d'); sg.imageSmoothingEnabled = false;
    const dong = {};
    DT.forEach((d, r) => {
      dong[d[0]] = { hang: r, so: d[2], giay: 0.6, lap: d[0] === 'idle' || d[0] === 'move' };
      for (let i = 0; i < d[2]; i++) { sg.save(); sg.translate(i * fw + gx, r * fh + gy); G.art.hero(sg, { key: 'wrestler', x: 0, y: 0, face: 1, anim: d[1], f: i * d[3], v: 2, noShadow: true, outfit: { hat: null, robe: null, back: null, hand: null, mask: null } }); sg.restore(); }
    });
    const tamAI = sheet.toDataURL();
    G.tinhLinh.clearCache();
    // --- các cảnh
    const OUT = [
      { ten: 'macdinh', of: null },
      { ten: 'docanh', of: { wing: { kind: 'lua', level: 2 } } },
      { ten: 'dothu', of: { hat: 'non_la', robe: 'ao_vai', back: 'ong_ten', hand: 'bua_lua', mask: 'lua', wing: { kind: 'la', level: 2 } } },
    ];
    const W = [{ type: 'sword', family: 3 }, { type: 'bow', family: 2 }, { type: 'spear', family: 1 }, { type: 'hammer', family: 4 }, null];
    const ANIM = [['idle', 8, 1], ['run', 8, 1], ['atk', 10, 3], ['dodge', 8, 1], ['die', 8, 1], ['hurt', 1, 1], ['spec', 7, 1], ['cast', 8, 1], ['hold', 5, 1], ['sweep', 10, 1]];
    const cv = document.createElement('canvas'); cv.width = 128; cv.height = 112;
    const g = cv.getContext('2d');
    const hash = (sc) => { const d = g.getImageData(0, 0, cv.width, cv.height).data; let h = 2166136261 >>> 0; for (let i = 0; i < d.length; i += 4) { h = Math.imul(h ^ d[i] ^ (d[i + 1] << 8) ^ (d[i + 2] << 16) ^ (d[i + 3] << 24), 16777619) >>> 0; } return h.toString(16); };
    const ve = (o, sc) => { g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); g.setTransform(sc, 0, 0, sc, 0, 0); G.art.hero(g, Object.assign({ x: 64 / sc, y: 84 / sc, face: 1, t: 0.5, noShadow: false }, o)); return hash(sc); };
    const h = {};
    // A. thân code
    for (const key of ['smith', 'hunter']) for (const of of OUT) for (const w of W) for (const a of ANIM) for (let v = 0; v < a[2]; v++) for (let f = 0; f < a[1]; f += (a[1] > 4 ? 1 : 1)) for (const sc of [1, 2]) {
      if (!w && (a[0] === 'hold' || a[0] === 'sweep' || a[0] === 'spec')) continue;
      const o = { key, anim: a[0], f, v: a[0] === 'dodge' ? 2 : v, weapon: w, outfit: of || undefined };
      h[['A', key, of.ten, w ? w.type : 'none', a[0], v, f, sc].join('|')] = ve(o, sc);
    }
    // B. thân AI tạm
    SC.add({ loai: 'linh-khi-sprite', ma: 'em-be-smith', doi_tuong: 'em-be', tam: tamAI, khung_rong: fw, khung_cao: fh, goc: [gx, gy], dong_tac: dong, neo: { than: [0, 1] } });
    await cho(() => SC.get('em-be-smith'));
    const TT = [['idle', (t) => ({ t })], ['move', (t) => ({ t, move: true })], ['atk', (t) => ({ atk: t })], ['ne', (t) => ({ dodge: t })], ['die', (t) => ({ p: { dead: true, deadT: t * 0.6, st: {} } })], ['hit', (t) => ({ p: { hurtT: 0.1, st: {} } })]];
    for (const of of OUT) for (const w of [W[0], W[1], null]) for (const tt of TT) for (let k = 0; k < 6; k++) for (const sc of [1, 2]) {
      const u = k / 6 + 0.01, o = Object.assign({ key: 'smith', weapon: w, outfit: of || undefined, t: 0.5 }, tt[1](tt[0] === 'idle' || tt[0] === 'move' ? u * 0.6 : u));
      h[['B', of.ten, w ? w.type : 'none', tt[0], k, sc].join('|')] = ve(o, sc);
    }
    return { h, n: Object.keys(h).length, loi: SC.loi.slice(), tamAI };
  }, { DO, cheDo: cheDo || 'so' });
  kq.loiTrang = loi;
  fs.writeFileSync(outJson, JSON.stringify({ h: kq.h, n: kq.n, loi: kq.loi, loiTrang: loi }));
  console.log('cảnh:', kq.n, 'lỗi SC:', kq.loi.length, 'lỗi trang:', loi.length, loi.slice(0, 3));
  await b.close();
})();
