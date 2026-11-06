// TURRET MERGE — KIỂM TRÙM FREEZER (DEEP FREEZE): luật nhiều ụ + chia CO-OP + Halo nửa thời gian + tất định online + dải hình chiêu.
// Chạy (gốc repo): python3 -m http.server 8765 &   NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-freezer.js [BASE]
// Ảnh: docs/demo-hop-tuong/tuvan/freezer/freezer_dai_<chế độ>.png (tung chiêu → mảnh băng bay → bọc băng → vỡ)
'use strict';
const { chromium } = require('playwright');
const BASE = process.argv[2] || process.env.BASE || 'http://localhost:8765/thap/';
const OUT = 'docs/demo-hop-tuong/tuvan/freezer/';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let sharp = null; try { sharp = require('sharp'); } catch (e) { }
const LOI = [], ok = (d, m) => { if (!d) LOI.push(m); console.log((d ? '  ✓ ' : '  ✗ ') + m); };

async function moTran(b, m) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); p._loi = [];
  p.on('pageerror', e => p._loi.push(e.message + ' @ ' + String(e.stack).split('\n').slice(1, 4).join(' ')));
  await p.goto(BASE + '?mode=' + m + '&deck=canon,bang,tia,set,lien&deck2=drone,bao,kiembang,hydra,anhsang&mana=0&notut=1&seed=12345', { waitUntil: 'load', timeout: 90000 });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && typeof BANGFX !== 'undefined', null, { timeout: 60000 });
  await sleep(4500);
  return { ctx, p };
}
// bàn đầy, sao khác nhau; ô 6 là 5★ (như ảnh người dùng)
const DAT = () => { for (const B of G.ban) { for (let i = 0; i < 15; i++) { B.t[i] = sinhU(taoU(B, B.deck[i % B.deck.length], 1 + (i * 7) % 3, i)); B.t[i].vxA = null; } B.t[6].sao = 5; B.t[2].sao = 4; B.khien = 0; B.halo = 0; } G.quai.length = 0; G.hang.length = 0; G.cho = 1e9; };
const TRUM = (w) => { G.wave = w; const E = sinhTrum('freezer', 0); E.s = 60; E.vao = 1; E.knT = 0.05; return E.uid; };

(async () => {
  const b = await chromium.launch();
  // 1) SOLO: số ụ theo wave + dải hình
  {
    const { ctx, p } = await moTran(b, 'solo');
    for (const [w, n] of [[10, 3], [20, 4], [40, 5], [80, 5]]) {
      await p.evaluate(DAT); await p.evaluate(TRUM, w);
      await p.waitForFunction(() => G.quai.some(E => E.trum === 'freezer' && E.bao), null, { timeout: 8000 });
      const r = await p.evaluate(() => { const E = G.quai.find(E => E.trum === 'freezer'); return { muc: E.bao.muc.length, sao: G.ban[0].t.filter(T => E.bao.muc.includes(T.uid)).map(T => T.sao) }; });
      ok(r.muc === n, 'SOLO wave ' + w + ': nhắm ' + r.muc + ' ụ (cần ' + n + '), sao ' + JSON.stringify(r.sao));
      if (w === 10) ok(r.sao.slice().sort((a, b) => b - a).join() === '5,4,3', 'SOLO: sao cao trước (5★, 4★ đầu tiên)');
      await p.waitForFunction(() => G.ban[0].t.filter(T => T && T.st.bang > 0).length > 0, null, { timeout: 5000 });
      const bang = await p.evaluate(() => G.ban[0].t.filter(T => T && T.st.bang > 0).map(T => +T.st.bang.toFixed(2)));
      ok(bang.length === n && bang.every(x => x > 5.5 && x <= 6.8), 'SOLO wave ' + w + ': ' + bang.length + ' ụ đóng băng ~6 s ' + JSON.stringify(bang));
      await p.evaluate(() => { G.quai.length = 0; for (const B of G.ban) for (const T of B.t) if (T) T.st.bang = 0; });
      await sleep(300);
    }
    // Halo: mọi ụ vẫn bị nhắm nhưng nửa thời gian
    await p.evaluate(DAT); await p.evaluate(TRUM, 10);
    await p.waitForFunction(() => G.quai.some(E => E.trum === 'freezer' && E.bao), null, { timeout: 8000 });
    await p.evaluate(() => { const B = G.ban[0]; B.halo = 5; B.khien = 5; });
    await p.waitForFunction(() => G.ban[0].t.filter(T => T && T.st.bang > 0).length > 0, null, { timeout: 5000 });
    const h = await p.evaluate(() => G.ban[0].t.filter(T => T && T.st.bang > 0).map(T => +T.st.bang.toFixed(2)));
    ok(h.length === 3 && h.every(x => x > 2.5 && x <= 3.8), 'Halo: 3 ụ, nửa thời gian ' + JSON.stringify(h));
    await p.evaluate(() => { G.quai.length = 0; for (const B of G.ban) { B.halo = 0; B.khien = 0; for (const T of B.t) if (T) T.st.bang = 0; } });
    await sleep(400);
    // dải hình: chậm 0,25× để chụp
    await p.evaluate(DAT);
    await p.evaluate(() => { G.tocDo = 0.25; });
    await p.evaluate(TRUM, 10);
    const cv = await p.evaluate(() => { const r = document.getElementById('cv').getBoundingClientRect(), B = G.ban[0]; const o0 = B.o[0], o14 = B.o[14]; const k = r.width / W; return [r.left + (o0.x - B.cw) * k - 40, r.top + (o0.y - B.ch) * k - 130, (o14.x - o0.x + 2 * B.cw) * k + 80, (o14.y - o0.y + 2 * B.ch) * k + 150]; });
    const clip = { x: Math.max(0, cv[0]), y: Math.max(0, cv[1]), width: Math.min(390, cv[2]), height: cv[3] };
    const anh = [];
    const chup = async (ten) => { const f = OUT + 'fr_' + anh.length + '_' + ten + '.png'; await p.screenshot({ path: f, clip }); anh.push([f, ten]); };
    await p.waitForFunction(() => G.quai.some(E => E.trum === 'freezer' && E.bao && E.bao.t > 0.3), null, { timeout: 8000 }).catch(async (e) => { console.log(await p.evaluate(() => JSON.stringify({ d: G.dung, cho: TAI.cho, q: G.quai.map(E => [E.trum, E.knT, !!E.bao, E.bao && E.bao.t, E.chet]), toc: G.tocDo }))); throw e; }); await chup('bao');
    await p.waitForFunction(() => G.hu.some(o => o.k === 'bangPhep'), null, { timeout: 15000 }); await chup('tung');
    await p.waitForFunction(() => G.hu.some(o => o.k === 'bangBay' && o.t > o.bd + 0.15), null, { timeout: 8000 }); await chup('bay');
    await p.waitForFunction(() => G.hu.some(o => o.k === 'bangCham'), null, { timeout: 8000 }); await chup('cham');
    await p.evaluate(() => { G.tocDo = 1; }); await sleep(700); await chup('boc');
    await sleep(1200); await chup('dong');
    await p.evaluate(() => { for (const T of G.ban[0].t) if (T && T.st.bang > 0) T.st.bang = 0; G.tocDo = 1; });
    await p.waitForFunction(() => G.ban[0].t.every(T => !T || !(T.st.bang > 0)), null, { timeout: 8000 }).catch(async (e) => { console.log(await p.evaluate(() => JSON.stringify({ d: G.dung, b: G.ban[0].t.map(T => T && T.st.bang), q: G.quai.map(E => [E.trum, E.knT, !!E.bao]) }))); throw e; }); await sleep(60); await chup('vo');
    await sleep(250); await chup('vo2');
    if (sharp) {
      const ims = await Promise.all(anh.map(([f]) => sharp(f).resize({ width: 360 }).toBuffer({ resolveWithObject: true })));
      const h0 = Math.max(...ims.map(i => i.info.height));
      await sharp({ create: { width: 360 * ims.length, height: h0, channels: 3, background: '#111' } }).composite(ims.map((i, k) => ({ input: i.data, left: k * 360, top: 0 }))).png().toFile(OUT + 'freezer_dai_solo.png');
      for (const [f] of anh) require('fs').unlinkSync(f);
    }
    ok(!p._loi.length, 'SOLO không lỗi trang ' + p._loi.slice(0, 2).join(' | '));
    await ctx.close();
  }
  // 2) CO-OP: chia 2 bàn (wave 20 → 4 ụ: 2 + 2) ; wave 10 → 3: 2 + 1
  {
    const { ctx, p } = await moTran(b, 'coop');
    for (const [w, a, c] of [[10, 2, 1], [20, 2, 2], [40, 3, 2]]) {
      await p.evaluate(DAT); await p.evaluate(TRUM, w);
      await p.waitForFunction(() => G.ban.some(B => B.t.some(T => T && T.st.bang > 0)), null, { timeout: 8000 });
      await sleep(200);
      const r = await p.evaluate(() => G.ban.map(B => B.t.filter(T => T && T.st.bang > 0).length));
      ok(r[0] === a && r[1] === c, 'CO-OP wave ' + w + ': bàn trùm ' + r[0] + ' + bàn bạn ' + r[1] + ' (cần ' + a + '+' + c + ')');
      await p.evaluate(() => { G.quai.length = 0; for (const B of G.ban) for (const T of B.t) if (T) T.st.bang = 0; });
      await sleep(300);
    }
    await p.screenshot({ path: OUT + 'freezer_coop.png' });
    ok(!p._loi.length, 'CO-OP không lỗi trang ' + p._loi.slice(0, 2).join(' | '));
    await ctx.close();
  }
  // 3) PVP: chỉ bàn có trùm
  {
    const { ctx, p } = await moTran(b, 'pvp');
    await p.evaluate(DAT); await p.evaluate(TRUM, 10);
    await p.waitForFunction(() => G.ban[0].t.some(T => T && T.st.bang > 0), null, { timeout: 8000 }); await sleep(800);
    const r = await p.evaluate(() => G.ban.map(B => B.t.filter(T => T && T.st.bang > 0).length));
    ok(r[0] === 3 && r[1] === 0, 'PVP: 3 ụ bàn mình, 0 bàn đối thủ ' + JSON.stringify(r));
    await p.screenshot({ path: OUT + 'freezer_pvp.png' });
    ok(!p._loi.length, 'PVP không lỗi trang ' + p._loi.slice(0, 2).join(' | '));
    await ctx.close();
  }
  // 4) TẤT ĐỊNH (online lockstep): 2 trang cùng hạt, cùng bàn, Math.random bị phá khác nhau → cùng mục tiêu mọi trùm
  {
    const kq = [];
    for (let k = 0; k < 2; k++) {
      const { ctx, p } = await moTran(b, 'solo');
      kq.push(await p.evaluate((k) => {
        let s = k * 99991 + 7; Math.random = () => ((s = (s * 16807) % 2147483647) / 2147483647); // mỗi máy Math.random khác nhau
        G.hat = 424242; G.dung = true; const out = {};
        for (const id of ['freezer', 'mad_crown', 'octopus', 'janus', 'joker_king', 'nightmare', 'jammer', 'leech']) {
          for (const B of G.ban) { for (let i = 0; i < 15; i++) { B.t[i] = sinhU(taoU(B, B.deck[i % B.deck.length], 1 + (i * 7) % 3, i)); } B.t[6].sao = 5; }
          G.quai.length = 0; G.wave = 20; let E; try { E = sinhTrum(id, 0); } catch (e) { out[id] = 'x'; continue; }
          E.knT = 0; E.vao = 1; E.s = 50; try { capNhatTrum(E, 0.016); } catch (e) { out[id] = 'loi ' + e.message; continue; }
          out[id] = E.bao ? E.bao.muc.map(u => G.ban[0].t.find(T => T && T.uid === u).o).join(',') : '-';
        }
        G.quai.length = 0; return out;
      }, k));
      await ctx.close();
    }
    for (const id in kq[0]) ok(kq[0][id] === kq[1][id], 'tất định ' + id + ': máy A [' + kq[0][id] + '] = máy B [' + kq[1][id] + ']');
  }
  await b.close();
  console.log(LOI.length ? 'TRƯỢT Freezer: ' + LOI.length : 'XANH — Freezer');
  process.exit(LOI.length ? 1 : 0);
})();
