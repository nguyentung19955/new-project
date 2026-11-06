// TURRET MERGE — dải khung EVOLVER bom hẹn giờ (iPhone 13 390×844 DPR 3) → docs/demo-hop-tuong/tuvan/evolver/
//  dem_nguoc.png (8→0 rồi biến đổi) · xit_7sao.png (lên 7★ → nổ hụt → xác bom) · ha_sao.png (7★ xịt bị giảm sao → đếm lại)
//  coop.png / pvp.png (bàn đồng đội / đối thủ cũng có bom) · trang_u.png (Turret File demo 1★ đếm → biến đổi, 7★ xịt)
// Chạy: python3 -m http.server 8765 (gốc repo) · NODE_PATH=/opt/npm-tools/node_modules node tools/thap-chup-evolver.js
const { chromium, devices } = require('playwright');
const fs = require('fs');
const sharp = require('sharp');
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const OUT = process.env.OUT || 'docs/demo-hop-tuong/tuvan/evolver/';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });
const LOI = [];
const ganLoi = (p) => { p.errs = []; p.on('pageerror', e => p.errs.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/WebSocket|ERR_CONNECTION_REFUSED|favicon/.test(m.text())) p.errs.push('console ' + m.text().slice(0, 200)); }); };
async function moTran(b, mode, deck) {
  const ctx = await b.newContext({ ...devices['iPhone 13'] });
  const p = await ctx.newPage(); ganLoi(p);
  await p.goto(BASE + '?mode=' + mode + '&deck=' + deck + '&deck2=canon,lien,set,bang,tia&wave=3&mana=0&notut=1', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban.length && typeof TAI !== 'undefined' && !TAI.cho, null, { timeout: 45000 });
  await p.waitForFunction(() => typeof VT === 'undefined' || !VT.mo, null, { timeout: 20000 }); await sleep(900);
  await p.evaluate(() => {
    window.__xoa = () => { G.dan.length = 0; G.hu.length = 0; G.quai = []; for (const B of G.ban) { for (let i = 0; i < 15; i++) B.t[i] = null; } UI.keo = null; UI.chonGhep = null; };
    window.__dat = (B, o, id, s) => { const T = sinhU(taoU(B, id, s, o)); T.vxA = null; T.goc = -Math.PI / 2; B.t[o] = T; return T; };
    G.cho = 999; G.tocDo = 1;
  });
  return { ctx, p };
}
const chup = async (p, anh, ten, clip) => { anh.push({ buf: await sharp(await p.screenshot(clip ? { clip } : {})).resize({ width: clip ? 420 : 390 }).png().toBuffer(), ten }); };
async function dai(anh, file) {
  const m = await Promise.all(anh.map(x => sharp(x.buf).metadata())), w = Math.max(...m.map(x => x.width)), h = Math.max(...m.map(x => x.height)), gap = 12, cot = Math.min(anh.length, 6), hang = Math.ceil(anh.length / cot);
  await sharp({ create: { width: cot * w + (cot - 1) * gap, height: hang * h + (hang - 1) * gap, channels: 3, background: '#101418' } })
    .composite(anh.map((x, i) => ({ input: x.buf, left: (i % cot) * (w + gap), top: Math.floor(i / cot) * (h + gap) }))).png().toFile(OUT + file);
  console.log('  ' + OUT + file + ' — ' + anh.map(x => x.ten).join(' → '));
}
const vung = (p, bi, o) => p.evaluate(([bi, o]) => { const B = G.ban[bi], c = B.o[o], k = REN.s, r = document.querySelector('canvas').getBoundingClientRect(); const w = B.cw * 1.7; return { x: Math.max(0, r.left + (c.x - w / 2) * k), y: Math.max(0, r.top + (c.y - w / 2) * k), width: w * k, height: w * k }; }, [bi, o]);

(async () => {
  const b = await chromium.launch();
  const { ctx, p } = await moTran(b, 'solo', 'tienhoa,canon,lien,set,bang');
  let anh = [];
  // 1) đếm ngược 8 → 0 → biến đổi
  await p.evaluate(() => { __xoa(); const B = G.ban[0]; B.deck = ['tienhoa', 'canon', 'lien', 'set', 'bang']; __dat(B, 6, 'canon', 2); __dat(B, 8, 'lien', 2); const T = __dat(B, 7, 'tienhoa', 2); T.tuoi = SKILLS.tienhoa.can(T) - 8.5; window.__T = T; });
  const cl = await vung(p, 0, 7);
  await sleep(450);
  for (let i = 8; i >= 1; i--) { await chup(p, anh, String(i), cl); await sleep(1000); }
  await sleep(150); await chup(p, anh, '0: biến đổi', cl); await sleep(400); await chup(p, anh, '+0.4s', cl); await sleep(700); await chup(p, anh, '+1.1s', cl);
  const bien = await p.evaluate(() => { const T = G.ban[0].t[7]; return T && [T.id, T.sao]; });
  if (!bien || bien[0] === 'tienhoa' || bien[1] !== 3) LOI.push('không biến đổi: ' + JSON.stringify(bien));
  await dai(anh, 'dem_nguoc.png');
  // 2) 7★: ghép 2 Evolver 6★ → 7★ → nổ hụt → xác bom
  anh = [];
  await p.evaluate(() => { __xoa(); const B = G.ban[0]; __dat(B, 6, 'canon', 6); __dat(B, 7, 'tienhoa', 6); __dat(B, 8, 'canon', 7); });
  await sleep(500); await chup(p, anh, 'trước: Evolver 6★', cl);
  await p.evaluate(() => { const B = G.ban[0], T = B.t[7]; T.sao = 7; T.sang = 1; if (VX.saoLen) VX.saoLen(T, 1); });
  for (const [ms, ten] of [[250, '0.25s'], [450, '0.45s nổ hụt'], [700, '0.7s'], [1000, '1.0s'], [1500, '1.5s xác bom'], [4000, '4s (vẫn 7★, không tác dụng)']]) { await sleep(ms - [0, 250, 450, 700, 1000, 1500][anh.length - 1]); await chup(p, anh, ten, cl); }
  const x7 = await p.evaluate(() => { const T = G.ban[0].t[7]; return T && [T.id, T.sao, !!T.xit]; });
  if (!x7 || x7[0] !== 'tienhoa' || x7[1] !== 7 || !x7[2]) LOI.push('7★ không xịt: ' + JSON.stringify(x7));
  // 3) bị giảm sao → đếm lại
  await p.evaluate(() => { const B = G.ban[0]; haSao(B, B.t[7], 'test'); });
  await sleep(700); await chup(p, anh, 'giảm sao → 6★ đếm lại', cl);
  await dai(anh, 'xit_7sao.png');
  await p.evaluate(() => { G.dung = true; }); await sleep(200);
  anh = []; await chup(p, anh, 'SOLO cả màn'); await dai(anh, 'solo.png');
  if (p.errs.length) LOI.push('solo: ' + p.errs.slice(0, 3).join(' | '));
  await ctx.close();
  // 4) CO-OP / PVP: bàn mình + bàn bạn/đối thủ đều có bom
  for (const mode of ['coop', 'pvp']) {
    const t = await moTran(b, mode, 'tienhoa,canon,lien,set,bang'); anh = [];
    await t.p.evaluate(() => { __xoa(); for (const B of G.ban) { const T = __dat(B, 4, 'tienhoa', 1); T.tuoi = SKILLS.tienhoa.can(T) - 5.5; __dat(B, 10, 'tienhoa', 7); __dat(B, 0, 'canon', 3); } });
    await sleep(1600); await t.p.evaluate(() => { G.dung = true; }); await sleep(150); await chup(t.p, anh, mode);
    await dai(anh, mode + '.png'); if (t.p.errs.length) LOI.push(mode + ': ' + t.p.errs.slice(0, 3).join(' | '));
    await t.ctx.close();
  }
  // 5) Turret File demo (iframe ?preview=tienhoa): 1★ đếm → biến đổi · 7★ xịt
  for (const s of [1, 7]) {
    const c2 = await b.newContext({ ...devices['iPhone 13'] }); const q = await c2.newPage(); ganLoi(q); anh = [];
    await q.goto(BASE + '?preview=tienhoa&star=' + s + '&notut=1', { waitUntil: 'load' });
    await q.waitForFunction(() => typeof SD !== 'undefined' && SD.T, null, { timeout: 45000 }).catch(() => LOI.push('demo ' + s + '★ không chạy'));
    for (const ms of [300, 1300, 2300, 3300, 4600, 6000]) { await sleep(ms - ([0, 300, 1300, 2300, 3300, 4600][anh.length])); await chup(q, anh, s + '★ ' + (ms / 1000) + 's'); }
    await dai(anh, 'trang_u_' + s + 'sao.png'); if (q.errs.length) LOI.push('demo: ' + q.errs.slice(0, 3).join(' | '));
    await c2.close();
  }
  await b.close();
  console.log(LOI.length ? '✗ ' + LOI.join('\n✗ ') : '✓ XANH');
  process.exit(LOI.length ? 1 : 0);
})();
