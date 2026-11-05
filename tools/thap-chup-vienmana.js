// TURRET MERGE — ảnh trước/sau: BỎ VIỀN "ĐỦ MANA" trên thẻ chỉ huy + thẻ thanh bài (nâng cấp) + nút triệu hồi.
// Khay trận SOLO/CO-OP/PVP/ONLINE(mock-less: chỉ khay), mana THIẾU (0) và ĐỦ (9999). 390x844 DPR3.
// Chạy (gốc repo): python3 -m http.server 8765 &  ;  TEN=truoc node tools/thap-chup-vienmana.js
const { chromium } = require('playwright');
const fs = require('fs');
const TEN = process.env.TEN || 'sau';
const OUT = process.env.OUT || 'docs/demo-hop-tuong/tuvan/vien_mana/';
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });
const DECK = 'canon,bang,tia,set,blackhole';
const TRAN = (m) => `${BASE}?mode=${m}&deck=${DECK}&deck2=drone,bao,kiembang,hydra,anhsang&wave=3&fill=2&mana=0&notut=1&nointro=1`;
(async () => {
  const b = await chromium.launch(); const errs = []; let vien = 0;
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
  await ctx.addInitScript(() => { try { localStorage.setItem('turret_hd', JSON.stringify({ xong: true, boQua: true, buoc: {} })); } catch (e) { } });
  for (const m of ['solo', 'coop', 'pvp']) {
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(m + ' :: ' + e.message));
    p.on('console', x => { if (x.type() === 'error' && !/WebSocket|ERR_CONNECTION_REFUSED|favicon/.test(x.text())) errs.push(m + ' console :: ' + x.text()); });
    await p.goto(TRAN(m), { waitUntil: 'load' });
    await p.waitForFunction(() => typeof UI !== 'undefined' && G.ban && G.ban[0] && document.querySelector('#bo-the .the'), null, { timeout: 30000 }).catch(() => errs.push(m + ' :: không vào trận'));
    await p.waitForFunction(() => document.querySelector('#the-mv .cht-glow'), null, { timeout: 15000 }).catch(() => errs.push(m + ' :: chưa có thẻ chỉ huy CHT')); await sleep(800);
    for (const [k, mana] of [['thieu', 0], ['du', 9999]]) {
      await p.evaluate((mana) => { clearInterval(window._gm); window._gm = setInterval(() => { G.ban[0].mana = mana; if (G.ban[0].mv) G.ban[0].mv.cd = 0; }, 30); const bw = document.querySelector('#bang-wave'); if (bw) bw.hidden = true; G.ban[0].mana = mana; if (G.ban[0].mv) G.ban[0].mv.cd = 0; UI.capNhat(); }, mana);
      await sleep(2300); // > 1 nhịp thở 2 s + quá độ
      await p.evaluate(() => UI.capNhat());
      await sleep(300);
      // đo viền: ::after có nội dung trên thẻ thanh bài, quầng chỉ huy hiện, nút triệu hồi ảnh "sáng"
      const r = await p.evaluate(() => {
        const out = [];
        document.querySelectorAll('#bo-the .the').forEach(d => { const s = getComputedStyle(d, '::after'); if (s.content !== 'none' && s.content !== 'normal' && s.display !== 'none' && +s.opacity > 0.05 && s.borderImageSource !== 'none') out.push('the ' + d.dataset.id + ' ::after ' + s.borderImageSource.slice(-24)); });
        const g = document.querySelector('#the-mv .cht-glow'); if (g) { const s = getComputedStyle(g); if (s.display !== 'none' && +s.opacity > 0.05) out.push('cht-glow opacity ' + s.opacity); }
        const te = document.querySelector('#the-mv'); const gs = te && getComputedStyle(te.querySelector('.mv-gia') || te);
        const t0 = document.querySelector('#bo-the .the'), g0 = t0 && t0.querySelector('.gia');
        return { out, mv: te && te.className, mvOp: te && getComputedStyle(te).opacity, mvGia: gs && gs.color, the: t0 && t0.className, theOp: t0 && getComputedStyle(t0).opacity, theGia: g0 && getComputedStyle(g0).color };
      });
      console.log(m, k, JSON.stringify(r));
      vien += r.out.length;
      const duoi = await p.$('#duoi') || await p.$('#bo-the');
      const bb = await duoi.boundingBox();
      const mv = await p.$('#the-mv'); const bm = mv && await mv.boundingBox();
      const y0 = Math.min(bb.y, bm ? bm.y : bb.y) - 14, y1 = Math.max(bb.y + bb.height, bm ? bm.y + bm.height : 0) + 6;
      await p.screenshot({ path: `${OUT}${TEN}_${m}_${k}.png`, clip: { x: 0, y: Math.max(0, y0), width: 390, height: Math.min(844, y1) - Math.max(0, y0) } });
    }
    await p.close();
  }
  await b.close();
  console.log('VIỀN ĐỦ MANA CÒN:', vien, '· LỖI TRANG:', errs.length); errs.forEach(e => console.log(' ', e));
})();
