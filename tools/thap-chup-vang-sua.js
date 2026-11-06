// TURRET MERGE — dải khung minh hoạ SỬA ỤN VÀNG THEO DCDW (390×844 DPR 3) → docs/demo-hop-tuong/tuvan/tuong_vang/sua/
//  soi_thuctinh.png (Sói thường + Sói THỨC TỈNH vừa gọi ra) · orbital_thuctinh.png (ghép Vệ Tinh → mọi Vệ Tinh thức tỉnh, loạt bom)
//  railgun_bingo.png (hàng đầy Railgun = bingo · hàng có ụ khác = không) · tuong_vang.png (ghép Máy Dựng Tường → TƯỜNG VÀNG → nổ)
//  vughep_vang.png (Merge King vàng theo xác suất ~10% → kéo +2★) · cauvong_pvp.png / cauvong_coop.png · dongbo_caban.png
// Chạy: python3 -m http.server 8765 (gốc repo) · NODE_PATH=/opt/npm-tools/node_modules node tools/thap-chup-vang-sua.js
const { chromium } = require('playwright');
const fs = require('fs');
const sharp = require('sharp');
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const OUT = process.env.OUT || 'docs/demo-hop-tuong/tuvan/tuong_vang/sua/';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });
const LOI = [];

async function moTran(b, mode, deck) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true });
  const p = await ctx.newPage(); p.errs = [];
  p.on('pageerror', e => p.errs.push('pageerror ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/WebSocket|ERR_CONNECTION_REFUSED|favicon/.test(m.text())) p.errs.push('console ' + m.text().slice(0, 200)); });
  await p.goto(BASE + '?mode=' + mode + '&deck=' + deck + '&deck2=canon,lien,set,bang,tia&wave=4&mana=0&notut=1', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban.length && typeof TAI !== 'undefined' && !TAI.cho, null, { timeout: 45000 });
  await p.waitForFunction(() => typeof VT === 'undefined' || !VT.mo, null, { timeout: 20000 }); await sleep(900);
  await p.evaluate(() => {
    window.__seed = (s) => { let x = s >>> 0; Math.random = () => { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; };
    window.__xoa = () => { G.dan.length = 0; G.hu.length = 0; for (const B of G.ban) { for (let i = 0; i < 15; i++) B.t[i] = null; B.phao = 0; } UI.keo = null; UI.chonGhep = null; };
    window.__dat = (B, o, id, s) => { const T = sinhU(taoU(B, id, s, o)); T.vxA = null; T.goc = -Math.PI / 2; B.t[o] = T; return T; };
    window.__quai = (n, bi) => { G.quai = []; const pi = G.duong.findIndex(q => q.ban === (bi || 0)); for (let i = 0; i < n; i++) { const E = { uid: 8e6 + i, id: 'bo', d: QUAI.bo, hp: 4e3, max: 4e3, p: pi, s: 40 + i * 34, x: 0, y: 0, goc: 0, cham: 0, chamT: 0, doc: 0, docT: 0, chan: 0, flash: 0, chet: false, khung: 0, tim: 1, vao: 1, bob: 0, keo: 0, yeu: 0, ban: bi || 0 }; [E.x, E.y, E.goc] = viTri(G.duong[pi], E.s); G.quai.push(E); } };
    G.cho = 999; G.dung = false; G.tocDo = 1;
  });
  return { ctx, p };
}
const chup = async (p, anh, ten) => { anh.push({ buf: await sharp(await p.screenshot()).resize({ width: 585 }).png().toBuffer(), ten }); };
async function dai(anh, file) {
  const m = await Promise.all(anh.map(x => sharp(x.buf).metadata())), w = m[0].width, h = m[0].height, gap = 16;
  await sharp({ create: { width: anh.length * w + (anh.length - 1) * gap, height: h, channels: 3, background: '#101418' } })
    .composite(anh.map((x, i) => ({ input: x.buf, left: i * (w + gap), top: 0 }))).png().toFile(OUT + file);
  console.log('  ' + OUT + file + ' — ' + anh.map(x => x.ten).join(' → '));
}

(async () => {
  const b = await chromium.launch();
  // ---------- SOLO ----------
  const { ctx, p } = await moTran(b, 'solo', 'soi,orbital,railgun,wallgen,vughep');
  let anh;

  // 1 Werewolf: gọi ra (trieu) tới khi có 1 THƯỜNG và 1 THỨC TỈNH
  anh = [];
  const ww = await p.evaluate(() => {
    __xoa(); __quai(7); const B = G.ban[0]; B.deck = ['soi']; __seed(31); const kq = [];
    let thg = null, tt = null;
    for (let i = 0; i < 40 && !(thg && tt); i++) { const T = trieu(B, true, 'soi'); if (!T) break; if (T.thuc && !tt) tt = T; else if (!T.thuc && !thg) thg = T; else B.t[T.o] = null; }
    return { thg: thg && thg.o, tt: tt && tt.o, tiLe: SKILLS.soi.tiLe(B) };
  });
  for (const [ms, ten] of [[150, '0.15s gọi ra'], [500, '0.5s'], [1100, '1.1s'], [2000, '2s cận chiến'], [3200, '3.2s (đỏ = thức tỉnh, luôn chí mạng)']]) { await sleep(ms - (anh.length ? [150, 500, 1100, 2000, 3200][anh.length - 1] : 0)); await chup(p, anh, ten); }
  await dai(anh, 'soi_thuctinh.png');
  if (ww.thg == null || ww.tt == null) LOI.push('Sói: không ra đủ 2 dạng');

  // 2 Orbital: 4 Vệ Tinh, ghép 2 → 2 còn lại thức tỉnh, loạt bom
  anh = [];
  await p.evaluate(() => { __xoa(); __quai(8); const B = G.ban[0]; B.deck = ['canon']; __dat(B, 6, 'orbital', 3); __dat(B, 7, 'orbital', 3); __dat(B, 2, 'orbital', 3); __dat(B, 12, 'orbital', 5); });
  await sleep(300); await chup(p, anh, 'trước: 4 Vệ Tinh');
  const orb = await p.evaluate(() => { const B = G.ban[0]; ghep(B, B.t[6], B.t[7]); return [B.t[2].thucT, B.t[12].thucT]; });
  for (const [ms, ten] of [[400, '0.4s thức tỉnh cả bàn'], [1500, '1.5s loạt bom'], [3000, '3s'], [5000, '5s']]) { await sleep(ms - [0, 400, 1500, 3000][anh.length - 1]); await chup(p, anh, ten); }
  await dai(anh, 'orbital_thuctinh.png');
  if (!(orb[0] > 20 && orb[1] > 20)) LOI.push('Orbital: không thức tỉnh cả bàn ' + JSON.stringify(orb));

  // 3 Railgun: hàng giữa đầy Railgun (bingo) · hàng trên 4 Railgun + 1 Cannon (không) → bảng thông tin
  anh = [];
  await p.evaluate(() => { __xoa(); __quai(6); const B = G.ban[0]; for (const o of [5, 6, 7, 8, 9]) __dat(B, o, 'railgun', 2); for (const o of [0, 1, 2, 3]) __dat(B, o, 'railgun', 2); __dat(B, 4, 'canon', 2); });
  await sleep(700); await chup(p, anh, 'hàng giữa đầy Railgun · hàng trên có Cannon');
  await p.evaluate(() => { G.dung = true; UI.moTT('railgun', G.ban[0].t[7]); }); await sleep(600); await chup(p, anh, 'Railgun hàng đầy: BINGO');
  await p.evaluate(() => { try { document.querySelector('#tt').hidden = true; UI.ttHet = 0; UI.xemU = null; } catch (e) { } UI.moTT('railgun', G.ban[0].t[1]); }); await sleep(600); await chup(p, anh, 'Railgun hàng có Cannon: không');
  const rb = await p.evaluate(() => { try { document.querySelector('#tt').hidden = true; UI.ttHet = 0; UI.xemU = null; } catch (e) { } G.dung = false; return [G.ban[0].t[7].bingo, G.ban[0].t[1].bingo]; });
  await dai(anh, 'railgun_bingo.png');
  if (!(rb[0] && !rb[1])) LOI.push('Railgun bingo sai ' + JSON.stringify(rb));

  // 4 Tường Vàng: ghép 2 Máy Dựng Tường
  anh = [];
  await p.evaluate(() => { __xoa(); __quai(8); const B = G.ban[0]; B.deck = ['canon']; __dat(B, 6, 'wallgen', 3); __dat(B, 7, 'wallgen', 3); });
  await sleep(200);
  await p.evaluate(() => { const B = G.ban[0]; ghep(B, B.t[6], B.t[7]); });
  for (const [ms, ten] of [[300, '0.3s TƯỜNG VÀNG'], [1500, '1.5s chặn quái'], [3500, '3.5s'], [5600, '5.6s sắp nổ'], [6150, '6.1s NỔ lớn']]) { await sleep(ms - (anh.length ? [300, 1500, 3500, 5600][anh.length - 1] : 0)); await chup(p, anh, ten); }
  await dai(anh, 'tuong_vang.png');

  // 5 Merge King vàng theo xác suất: 14 lần gọi → đếm bản vàng; kéo bản vàng lên Cannon → +2★
  anh = [];
  const mk = await p.evaluate(() => { __xoa(); G.quai = []; const B = G.ban[0]; B.deck = ['vughep']; let ds = []; for (let sd = 2024; sd < 2100; sd++) { for (let i = 0; i < 15; i++) B.t[i] = null; __seed(sd); for (let i = 0; i < 14; i++) trieu(B, true, 'vughep'); ds = B.t.filter(Boolean); const v = ds.filter(T => T.vang).length; if (v >= 1 && v <= 2) break; } /* hạt có 1–2 bản vàng / 14 (≈10%) */ return { vang: ds.filter(T => T.vang).length, n: ds.length, o: (ds.find(T => T.vang) || {}).o }; });
  await sleep(1200); await chup(p, anh, mk.vang + '/' + mk.n + ' Merge King ra VÀNG (~10%)');
  if (mk.o != null) {
    await p.evaluate((o) => { G.dung = true; UI.moTT('vughep', G.ban[0].t[o]); }, mk.o); await sleep(600); await chup(p, anh, 'bảng: Merge King VÀNG');
    await p.evaluate((o) => { try { document.querySelector('#tt').hidden = true; UI.ttHet = 0; UI.xemU = null; } catch (e) { } G.dung = false; const B = G.ban[0]; const c = o === 14 ? 13 : 14; B.t[c] = null; __dat(B, c, 'canon', 1); const K = B.t[o]; K.sao = 1; ghep(B, K, B.t[c]); }, mk.o);
    await sleep(900); await chup(p, anh, 'kéo lên Cannon 1★ → 3★');
  }
  await dai(anh, 'vughep_vang.png');
  if (!(mk.vang >= 0 && mk.vang <= 4)) LOI.push('Merge King: tỉ lệ vàng lạ ' + JSON.stringify(mk));

  // 6 Sync Cannon cả bàn: chạm xem vùng tác dụng
  anh = [];
  await p.evaluate(() => { __xoa(); __quai(4); const B = G.ban[0]; __dat(B, 7, 'dongbo', 3); __dat(B, 0, 'canon', 3); __dat(B, 14, 'lien', 3); __dat(B, 4, 'set', 2); __dat(B, 10, 'tia', 3); });
  await sleep(700); await chup(p, anh, 'Sync Cannon 3★ + 3 ụ 3★ rải khắp bàn');
  await p.evaluate(() => { G.dung = true; UI.moTT('dongbo', G.ban[0].t[7]); }); await sleep(700); await chup(p, anh, 'bảng: cả bàn cùng sao');
  await p.evaluate(() => { try { document.querySelector('#tt').hidden = true; UI.ttHet = 0; UI.xemU = null; } catch (e) { } G.dung = false; });
  await dai(anh, 'dongbo_caban.png');
  if (p.errs.length) LOI.push('solo: ' + p.errs.slice(0, 3).join(' | '));
  await ctx.close();

  // ---------- PVP / CO-OP: Rainbow ----------
  for (const mode of ['pvp', 'coop']) {
    const t = await moTran(b, mode, 'cauvong,canon,lien,set,tia');
    anh = [];
    await t.p.evaluate((mode) => { __xoa(); __quai(6, mode === 'pvp' ? 1 : 0); const B = G.ban[0]; const C = __dat(B, 7, 'cauvong', 5); C.nap = 0.97; __dat(B, 6, 'canon', 3); __dat(B, 8, 'lien', 3); }, mode);
    for (const [ms, ten] of [[600, '0.6s vẽ vệt'], [1500, '1.5s'], [3000, mode === 'pvp' ? '3s quái ĐỐI THỦ trên vệt: trâu hơn' : '3s quái trên vệt: nhận thêm sát thương']]) { await sleep(ms - (anh.length ? [600, 1500][anh.length - 1] : 0)); await chup(t.p, anh, ten); }
    const vt = await t.p.evaluate(() => { const o = G.hu.find(h => h.k === 'cauvong'); return o ? { pvp: o.pvp, ban: o.p.ban } : null; });
    await dai(anh, 'cauvong_' + mode + '.png');
    if (!vt || (mode === 'pvp' ? !(vt.pvp && vt.ban === 1) : vt.pvp)) LOI.push('Rainbow ' + mode + ' sai ' + JSON.stringify(vt));
    if (t.p.errs.length) LOI.push(mode + ': ' + t.p.errs.slice(0, 3).join(' | '));
    await t.ctx.close();
  }
  await b.close();
  console.log(LOI.length ? '✗ ' + LOI.join(' · ') : '✓ chụp xong, không lỗi');
  process.exit(LOI.length ? 1 : 0);
})();
