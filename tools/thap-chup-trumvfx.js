// TURRET MERGE — CHỤP BÁO CHIÊU 12 TRÙM + 3 CHỈ HUY (js/trumvfx.js) trên iPhone 13 (390×844, DPR 3).
// Chạy (gốc repo): python3 -m http.server 8765 &   NODE_PATH=/opt/npm-tools/node_modules node tools/thap-chup-trumvfx.js [BASE]
//  CHI=freezer,nightmare  → chỉ vài trùm · CHI=mv → chỉ chỉ huy
// Ra: docs/demo-hop-tuong/tuvan/vfx/boss/trum_<id>.png (dải: T-1.3 · T-0.8 · T-0.15 · trúng · +0.25 s) và
//     trum_<id>_chan.png (cùng chiêu khi ô có khiên → bị chặn), mv_<id>.png (chỉ huy), + kiểm không lỗi trang.
'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = process.argv[2] || process.env.BASE || 'http://localhost:8765/thap/';
const OUT = 'docs/demo-hop-tuong/tuvan/vfx/boss/';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let sharp = null; try { sharp = require('sharp'); } catch (e) { }
const LOI = [], ok = (d, m) => { if (!d) LOI.push(m); console.log((d ? '  ✓ ' : '  ✗ ') + m); };
const CHI = (process.env.CHI || '').split(',').filter(Boolean);
const TRUM12 = ['mad_crown', 'freezer', 'janus', 'joker_king', 'nightmare', 'octopus', 'hive', 'jammer', 'prism', 'twin_core', 'patcher', 'leech'];
fs.mkdirSync(OUT, { recursive: true });

async function moTran(b, af) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); p._loi = [];
  p.on('pageerror', e => p._loi.push(e.message + ' @ ' + String(e.stack).split('\n').slice(1, 3).join(' ')));
  await p.goto(BASE + '?mode=solo&deck=canon,bang,tia,set,khien&mana=0&notut=1&seed=12345&af=' + (af || 'hero'), { waitUntil: 'load', timeout: 90000 });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && typeof TVF !== 'undefined', null, { timeout: 60000 });
  await sleep(4500);
  await p.waitForFunction(() => !G.dung, null, { timeout: 20000 }).catch(() => {}); await sleep(2500); // qua băng giới thiệu trùm/wave
  return { ctx, p };
}
const DAT = (khien) => {
  for (const B of G.ban) {
    for (let i = 0; i < 15; i++) { B.t[i] = sinhU(taoU(B, B.deck[i % 4], 1 + (i * 7) % 3, i)); B.t[i].vxA = null; }
    B.t[6].sao = 5; B.t[2].sao = 4; B.khien = 0; B.halo = 0; B.cuong = 0;
    if (khien) for (const T of B.t) if (T) T.khien = 1;
  }
  G.quai.length = 0; G.hang.length = 0; G.cho = 1e9; G.tocDo = 0.3;
};
const SINH = (id) => {
  G.wave = 20; const E = sinhTrum(id, 0); E.s = 70; E.vao = 1; E.knT = 0.05;
  if (id === 'twin_core') E.hp = E.max * 0.25;     // nứt: sắp tách
  if (id === 'prism') { E.khien.on = false; E.khien.be = 0; } // để trùm niệm SHIELD UP
  return E.uid;
};
async function clipCua(p) {
  return p.evaluate(() => {
    const r = document.getElementById('cv').getBoundingClientRect(), k = r.width / W, B = G.ban[0], E = G.quai.find(q => q.trum);
    let x0 = B.o[0].x - B.cw, y0 = B.o[0].y - B.ch, x1 = B.o[14].x + B.cw, y1 = B.o[14].y + B.ch;
    if (E) { x0 = Math.min(x0, E.x - 70); y0 = Math.min(y0, E.y - 80); x1 = Math.max(x1, E.x + 70); y1 = Math.max(y1, E.y + 60); }
    const c = { x: r.left + x0 * k, y: r.top + y0 * k, width: (x1 - x0) * k, height: (y1 - y0) * k };
    c.x = Math.max(0, c.x); c.y = Math.max(0, c.y); c.width = Math.min(390 - c.x, c.width); c.height = Math.min(844 - c.y, c.height);
    return c;
  });
}
async function ghep(anh, ra, nhan) {
  if (!sharp) return;
  const W1 = 300;
  const ims = await Promise.all(anh.map(f => sharp(f).resize({ width: W1 }).toBuffer({ resolveWithObject: true })));
  const h0 = Math.max(...ims.map(i => i.info.height));
  const chu = (s, x) => ({ input: Buffer.from('<svg width="' + W1 + '" height="26"><rect width="100%" height="100%" fill="#000" opacity=".6"/><text x="8" y="18" font-family="sans-serif" font-size="15" fill="#fff">' + s.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</text></svg>'), left: x, top: 0 });
  await sharp({ create: { width: W1 * ims.length, height: h0, channels: 3, background: '#111' } })
    .composite(ims.map((i, k) => ({ input: i.data, left: k * W1, top: 0 })).concat(nhan.map((s, k) => chu(s, k * W1)))).png().toFile(ra);
  for (const f of anh) fs.unlinkSync(f);
}
// chờ tới mốc t (giây) của báo chiêu đang chạy; t > 1.4 = sau khi nổ (giây)
async function cho(p, id, t) {
  if (t <= 1.4) return p.waitForFunction(([id, t]) => G.quai.some(E => E.trum === id && E.bao && E.bao.t >= t), [id, t], { timeout: 15000 });
  await p.waitForFunction((id) => { const E = G.quai.find(E => E.trum === id && !E.con); return !E || !E.bao; }, id, { timeout: 15000 });
  return sleep((t - 1.4) * 1000 / 0.3);
}
async function chupTrum(p, id, khien) {
  await p.evaluate(DAT, khien); await sleep(200);
  await p.evaluate(SINH, id); await sleep(150);
  if (id === 'twin_core') { // không có chiêu báo trước: chụp nứt (máu < 30%) → tách
    const clip = await clipCua(p), anh = [];
    for (let i = 0; i < 2; i++) { const f = OUT + '_' + i + '.png'; await sleep(400); await p.screenshot({ path: f, clip }); anh.push(f); }
    await p.evaluate(() => { const E = G.quai.find(E => E.trum === 'twin_core'); chet(E, G.ban[0]); });
    for (let i = 2; i < 5; i++) { const f = OUT + '_' + i + '.png'; await sleep(i === 2 ? 60 : 350); await p.screenshot({ path: f, clip }); anh.push(f); }
    const n = await p.evaluate(() => G.quai.filter(E => E.trum === 'twin_core' && E.con && !E.chet).length);
    ok(n === 2, id + ': tách 2 lõi, mỗi lõi thanh máu riêng');
    await ghep(anh, OUT + 'trum_' + id + '.png', ['nứt <30%', 'nứt', 'SPLIT', '2 lõi', '2 lõi chạy']);
    return;
  }
  await cho(p, id, 0.05);
  const clip = await clipCua(p), anh = [], nhan = ['T-1.3 rơi vào', 'T-0.8 giữ', 'T-0.15 nén', khien ? 'BỊ CHẶN' : 'TRÚNG', '+0.25 s'];
  const moc = [0.1, 0.6, 1.25, 1.41, 1.6];
  for (let i = 0; i < moc.length; i++) {
    await cho(p, id, moc[i]);
    const pop = i === 3 ? await p.evaluate(() => TVF.pop.map(q => q.k)) : null;
    const f = OUT + '_' + i + '.png'; await p.screenshot({ path: f, clip }); anh.push(f);
    if (i === 0) {
      const r = await p.evaluate((id) => ({ dau: TVF.ds.length, ten: TVF.ds.map(d => d.ten), vong: !!TVF.VONG[id] }), id);
      ok(r.dau > 0 || r.vong, id + ': có dấu báo chiêu ' + JSON.stringify(r.ten));
    }
    if (i === 3) {
      const r = pop;
      ok(r.length > 0, id + (khien ? ' (khiên)' : '') + ': có hiệu ứng lúc nổ ' + JSON.stringify(r));
      if (khien && TVF_DAU[id]) ok(r.includes('chan'), id + ': trạng thái BỊ CHẶN');
    }
  }
  await ghep(anh, OUT + 'trum_' + id + (khien ? '_chan' : '') + '.png', nhan);
}
const TVF_DAU = { mad_crown: 1, freezer: 1, janus: 1, joker_king: 1, nightmare: 1, octopus: 1, jammer: 1, leech: 1 };

(async () => {
  const b = await chromium.launch();
  const ds = CHI.length ? TRUM12.filter(id => CHI.includes(id)) : TRUM12;
  if (ds.length) {
    const { ctx, p } = await moTran(b, 'hero');
    for (const id of ds) {
      try { await chupTrum(p, id, false); if (TVF_DAU[id]) await chupTrum(p, id, true); }
      catch (e) { ok(false, id + ': ' + e.message.split('\n')[0]); }
      await p.evaluate(() => { G.quai.length = 0; });
    }
    ok(!p._loi.length, 'trùm: không lỗi trang ' + p._loi.slice(0, 2).join(' | '));
    await ctx.close();
  }
  // chỉ huy
  if (!CHI.length || CHI.includes('mv')) for (const af of ['hero', 'dahlia', 'eve']) {
    const { ctx, p } = await moTran(b, af);
    await p.evaluate(DAT, false);
    if (af === 'hero') await p.evaluate(() => { const B = G.ban[0]; B.t[3] = null; B.t[11] = null; }); // 2 ô trống → 2 khoang rơi
    await p.evaluate(() => { const B = G.ban[0]; B.mana = 9999; B.mv.cd = 0; });
    const clip = await clipCua(p), anh = [];
    const f0 = OUT + '_0.png'; await p.screenshot({ path: f0, clip }); anh.push(f0);
    const okd = await p.evaluate(() => { G.dung = false; const tt = CH.trangThai(G.ban[0]); return dungMV(G.ban[0]) ? 'ok' : tt + ' ' + JSON.stringify(G.ban[0].mv) + ' ' + G.ban[0].mana; });
    ok(okd === 'ok', 'chỉ huy ' + af + ': dùng được ' + okd);
    for (const [i, ms] of [[1, 90], [2, 250], [3, 500], [4, 900]]) { await sleep(ms - (i > 1 ? [0, 90, 250, 500][i - 1] : 0)); const f = OUT + '_' + i + '.png'; await p.screenshot({ path: f, clip }); anh.push(f); }
    if (af !== 'hero') { await p.evaluate((af) => { const B = G.ban[0]; if (af === 'dahlia') B.cuong = 1.5; else B.khien = 1.5; }, af); await sleep(300); const f = OUT + '_5.png'; await p.screenshot({ path: f, clip }); anh.push(f); }
    const nhan = af === 'hero' ? ['trước', '0.03 s rơi', '0.08 s', '0.15 s mở', '0.3 s'] : ['trước', 'bật', 'lan', 'lan hết', 'giữ', '< 2 s: nhịp báo hết'];
    await ghep(anh, OUT + 'mv_' + af + '.png', nhan);
    ok(!p._loi.length, af + ': không lỗi trang ' + p._loi.slice(0, 2).join(' | '));
    await ctx.close();
  }
  // bàn đầy: REINFORCE → tia +1★
  if (!CHI.length || CHI.includes('mv')) {
    const { ctx, p } = await moTran(b, 'hero');
    await p.evaluate(DAT, false); await p.evaluate(() => { const B = G.ban[0]; B.mana = 9999; B.mv.cd = 0; G.tocDo = 1; });
    const clip = await clipCua(p), anh = [];
    await p.evaluate(() => { G.dung = false; return dungMV(G.ban[0]); });
    for (let i = 0; i < 3; i++) { await sleep(i ? 130 : 40); const f = OUT + '_' + i + '.png'; await p.screenshot({ path: f, clip }); anh.push(f); }
    await ghep(anh, OUT + 'mv_hero_day.png', ['bàn đầy: tia +1★', '0.17 s', '0.3 s']);
    ok(!p._loi.length, 'hero bàn đầy: không lỗi trang');
    await ctx.close();
  }
  await b.close();
  console.log(LOI.length ? 'ĐỎ: ' + LOI.length + ' lỗi' : 'XANH');
  process.exit(LOI.length ? 1 : 0);
})();
