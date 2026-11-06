// TURRET MERGE — KIỂM VỊ TRÍ NHÃN GIÁ KHAY TRẬN (người dùng iPhone 06/11: "100 năng lượng với 40 năng lượng ở chỉ huy cao lên 1 chút",
// tuvan/nhan-gia/). TRƯỢT nếu giá ◆ dưới thẻ (#bo-the .the > .gia) hoặc dưới chỉ huy (#the-mv > .mv-gia):
//   · đáy nhãn cách đáy ô < 3 px logic (dính mép dưới khung khay / ống viền),
//   · đáy nhãn nằm trong 11 px logic cuối của #duoi (khung khay), hoặc ra ngoài màn / vào vùng an toàn đáy,
//   · chồng nhãn LV / MAX / số ụ (đỉnh nhãn giá phải ở dưới đáy nhãn LV),
//   · tâm số giá thẻ và giá chỉ huy lệch nhau > 4 px logic (không thẳng hàng).
// SOLO / CO-OP / PVP × 360x640, 390x844, 430x932, iPad 820x1180, ngang 1280x800; ONLINE (nếu máy chủ giả 8787 đang chạy) ở 390x844.
// Chạy (gốc repo): python3 -m http.server 8765 &  [node tools/thap-online-mock-server.js 8787 &]
//   NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-nhangia.js [BASE]
'use strict';
const pw = require('playwright');
const BASE = process.argv[2] || process.env.BASE || 'http://localhost:8765/thap/';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const CO = [[360, 640], [390, 844], [430, 932], [820, 1180], [1280, 800]];

function KIEM() {
  const out = [], wrap = document.getElementById('wrap');
  const s = wrap ? wrap.getBoundingClientRect().width / (wrap.offsetWidth || 430) : 1; // px thật / px logic
  const R = (e) => e && e.getBoundingClientRect();
  const hien = (e) => { if (!e) return false; const c = getComputedStyle(e); return c.display !== 'none' && c.visibility !== 'hidden' && R(e).height > 0; };
  const duoi = R(document.getElementById('duoi'));
  const sb = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--kt-sab')) || 0;
  const tam = [];
  const kiem = (o, g, ten) => {
    if (!hien(g)) return;
    const ro = R(o), rg = R(g), b = g.querySelector('b'), rb = b ? R(b) : rg;
    if ((ro.bottom - rg.bottom) / s < 3) out.push(ten + ': nhãn giá dính đáy ô (' + ((ro.bottom - rg.bottom) / s).toFixed(1) + ' px)');
    if ((duoi.bottom - rb.bottom) / s < 11) out.push(ten + ': số giá sát mép dưới khay (' + ((duoi.bottom - rb.bottom) / s).toFixed(1) + ' px)');
    if (rb.bottom > innerHeight - sb) out.push(ten + ': số giá ra ngoài màn / vào vùng an toàn đáy');
    for (const q of ['.lv', '.so', '.ot-so']) { const l = o.querySelector(':scope > ' + q); if (hien(l) && R(l).bottom > rb.top + 1 && R(l).top < rb.bottom) out.push(ten + ': giá chồng ' + q); }
    tam.push([ten, (rb.top + rb.bottom) / 2]);
  };
  document.querySelectorAll('#bo-the .the').forEach((o, i) => kiem(o, o.querySelector(':scope > .gia'), 'thẻ ' + i));
  const mv = document.getElementById('the-mv'); if (mv) kiem(mv, mv.querySelector(':scope > .mv-gia'), 'chỉ huy');
  const tm = tam.find(t => t[0] === 'chỉ huy'), tt = tam.find(t => t[0] !== 'chỉ huy');
  if (tm && tt && Math.abs(tm[1] - tt[1]) / s > 4) out.push('giá chỉ huy lệch hàng giá thẻ ' + ((tm[1] - tt[1]) / s).toFixed(1) + ' px');
  if (!tam.length) out.push('không thấy nhãn giá nào');
  return { loi: out, n: tam.length };
}

(async () => {
  const br = await pw.chromium.launch();
  const LOI = []; let n = 0;
  const mo = async (w, h, url) => {
    const ctx = await br.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: w > 700 ? 2 : 3, isMobile: w < 1000, hasTouch: true });
    const p = await ctx.newPage(); p.on('pageerror', e => LOI.push(w + 'x' + h + ': lỗi trang ' + e.message));
    await p.goto(url, { waitUntil: 'load', timeout: 90000 }); return { ctx, p };
  };
  for (const [w, h] of CO) for (const m of ['solo', 'coop', 'pvp']) {
    const { ctx, p } = await mo(w, h, BASE + '?mode=' + m + '&deck=canon,bang,tia,set,lien&deck2=drone,bao,kiembang,hydra,anhsang&mana=3000&notut=1&nointro=1');
    await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && document.querySelector('#bo-the .the .gia'), null, { timeout: 60000 });
    await sleep(3500);
    // thẻ 0 lên MAX (ẩn giá, chữ MAX) + thẻ 1 cấp giữa → giá còn lại vẫn phải đúng chỗ
    await p.evaluate(() => { const B = G.ban[0]; B.mana = 3000; if (B.lv) { B.lv[B.deck[0]] = 5; B.lv[B.deck[1]] = 3; } });
    await sleep(900);
    const k = await p.evaluate(KIEM); n += k.n;
    for (const x of k.loi) LOI.push(m + ' ' + w + 'x' + h + ': ' + x);
    console.log((k.loi.length ? '  ✗ ' : '  ✓ ') + m + ' ' + w + 'x' + h + ' (' + k.n + ' nhãn)');
    await ctx.close();
  }
  // ONLINE: cùng #bo-the/#the-mv — chỉ khi máy chủ giả đang chạy
  try {
    const ok = await fetch('http://localhost:8787/thap/').then(r => r.ok).catch(() => false);
    if (ok) {
      const URL = 'http://localhost:8787/thap/?net=mock&mockws=ws://localhost:8787&nointro=1&notut=1';
      const vao = async (d) => { const T = await mo(390, 844, URL); await T.p.waitForFunction(() => typeof UI !== 'undefined' && UI.chon && document.querySelector('#onl-nut') && NET.ok, null, { timeout: 30000 }); await T.p.evaluate((x) => { UI.chon = x; UI.veBoChon(); }, d); return T; };
      const bam = (p, sel) => p.evaluate((q) => document.querySelector(q).click(), sel);
      const A = await vao(['canon', 'bang', 'tia', 'set', 'lien']), Bp = await vao(['drone', 'bao', 'kiembang', 'hydra', 'anhsang']);
      await A.p.evaluate(() => ONL.moBang()); await bam(A.p, '[data-act="onl-tao"]');
      await A.p.waitForFunction(() => /^[A-Z]{4}$/.test((document.querySelector('#sanh-ma') || {}).textContent || ''), null, { timeout: 10000 });
      const code = await A.p.textContent('#sanh-ma');
      await Bp.p.evaluate(() => ONL.moBang()); await Bp.p.fill('#onl-ma', code); await bam(Bp.p, '[data-act="onl-vao"]');
      await A.p.waitForFunction(() => document.querySelectorAll('#sanh-ds .sanh-p:not(.trong)').length === 2, null, { timeout: 10000 });
      await bam(A.p, '#sanh-san'); await bam(Bp.p, '#sanh-san');
      await A.p.waitForFunction(() => ONS.on && G.ban.length === 2 && document.querySelector('#bo-the .the .gia'), null, { timeout: 20000 });
      await sleep(3000);
      const k = await A.p.evaluate(KIEM); n += k.n;
      for (const x of k.loi) LOI.push('online 390x844: ' + x);
      console.log((k.loi.length ? '  ✗ ' : '  ✓ ') + 'online 390x844 (' + k.n + ' nhãn)');
      await A.ctx.close(); await Bp.ctx.close();
    } else console.log('  · online: bỏ qua (máy chủ giả 8787 không chạy)');
  } catch (e) { LOI.push('online: ' + String(e).slice(0, 160)); }
  await br.close();
  if (LOI.length) { console.log(LOI.map(x => '  ✗ ' + x).join('\n')); console.log('TRƯỢT nhãn giá khay: ' + LOI.length); process.exit(1); }
  console.log('  ✓ nhãn giá khay trận (thẻ + chỉ huy) trong khay, thẳng hàng, không chồng LV/MAX: ' + n + ' nhãn');
})();
