// TURRET MERGE — kiểm P0-04/P0-05 (js/hudtop.js): thanh trên SOLO/CO-OP/PVP (đầu wave, cảnh báo trùm, còn 1 tim), 15 ụ đủ huy hiệu.
// Chạy: python3 -m http.server 8765 (gốc repo) rồi OUT=thu-muc/ node tools/thap-kt-hudtop.js
const { chromium } = require('playwright');
const OUT = process.env.OUT || 'shots/';
const SIZES = [[360, 780], [390, 844], [430, 860]];
const DECK = 'canon,bang,tia,set,lien';
(async () => {
  const b = await chromium.launch(); const bao = []; const errs = [];
  for (const [W, H] of SIZES) {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
    for (const m of ['solo', 'coop', 'pvp']) {
      const p = await ctx.newPage();
      p.on('pageerror', e => errs.push(W + m + ' :: ' + e.message));
      p.on('console', x => { if (x.type() === 'error') errs.push(W + m + ' :: console ' + x.text()); });
      p.on('response', r => { if (r.status() >= 400) errs.push(W + m + ' :: HTTP ' + r.status() + ' ' + r.url()); });
      await p.goto(`http://localhost:8765/thap/?mode=${m}&deck=${DECK}&wave=7&fill=15&mana=260&nointro=1&notut=1`, { waitUntil: 'load' });
      await p.waitForTimeout(2600);
      await p.evaluate(() => { G.dung = true; for (const B of G.ban) B.t.forEach((T, i) => { if (T) T.sao = (i % 7) + 1; }); document.querySelector('#bang-wave').hidden = true; });
      const chup = (t) => p.screenshot({ path: `${OUT}${W}_${m}_${t}.png` });
      // đo chồng lấn: khoang thanh trên + tấm treo + giá đồng đội; chữ không tràn khoang
      const kt = () => p.evaluate(() => {
        const r = s => { const e = document.querySelector(s); if (!e || e.hidden || !e.offsetParent) return null; const q = e.getBoundingClientRect(); return q.width ? q : null; };
        const ds = ['#tb-wave', '#tb-giua', '#tb-tim', '#ht-phu', '#dp-dai'].map(s => [s, r(s)]).filter(x => x[1]);
        const loi = [];
        for (let i = 0; i < ds.length; i++) for (let j = i + 1; j < ds.length; j++) { const a = ds[i][1], c = ds[j][1]; if (a.left < c.right - 0.5 && c.left < a.right - 0.5 && a.top < c.bottom - 0.5 && c.top < a.bottom - 0.5) loi.push('chồng ' + ds[i][0] + '×' + ds[j][0]); }
        for (const s of ['#tb-wave', '#tb-trum', '#tb-tim']) { const e = document.querySelector(s); let L = 1e9, R = -1e9; for (const c of e.children) { if (!c.offsetParent) continue; const q = c.getBoundingClientRect(); if (!q.width) continue; L = Math.min(L, q.left); R = Math.max(R, q.right); } const k = (s === '#tb-trum' ? e.parentNode : e).getBoundingClientRect(); if (L < k.left - 1 || R > k.right + 1) loi.push('tràn ' + s + ' ' + Math.round(L - k.left) + '/' + Math.round(k.right - R)); }
        // huy hiệu trên bàn: nhận diện vs sao trong ô; sao không lấn ô bên cạnh
        let nB = 0;
        for (const B of G.ban) B.t.forEach((T, i) => {
          if (!T) return; nB++;
          const c = B.o[i], C = Math.min(B.cw, B.ch), h = ND.xep(T, c.x, c.y, C, 1, 1, B), d = h.d;
          const g = [h.gx - d * 0.65, h.gy - d * 0.65, h.gx + d * 0.65, h.gy + d * 0.65], sw = d * 0.675, st = [h.sx - sw, h.sy - sw * 1.02, h.sx + sw, h.sy + sw * 1.02];
          if (g[2] > st[0] && st[2] > g[0]) loi.push('huy hiệu chồng ô ' + i);
          if (st[2] > c.x + B.cw / 2 + 3 || st[1] < c.y - B.ch / 2 - 3) loi.push('sao lấn ô ' + i + ' ' + (st[2] - c.x - B.cw / 2).toFixed(1));
        });
        return { loi, nB, tim: document.querySelector('#tb-tim').textContent, phu: (r('#ht-phu') && document.querySelector('#ht-phu').textContent) || '', trum: document.querySelector('#tb-trum').textContent, wave: document.querySelector('#tb-wave').textContent };
      });
      // 1) đầu wave: băng hiện → 0,75 s đã ẩn
      await p.evaluate(() => { G.wave = 8; UI.bangWave(8, false); }); await p.waitForTimeout(250); await chup('1a_wave_bang');
      await p.waitForTimeout(500); const anBang = await p.evaluate(() => document.querySelector('#bang-wave').hidden); await chup('1b_wave_sau07');
      let k1 = await kt();
      // 2) cảnh báo trùm (wave trùm)
      await p.evaluate(() => { G.wave = 10; UI.capNhat(); UI.canhBaoTrum(TRUM_THU_TU[0]); }); await p.waitForTimeout(300); await chup('2a_trum_bang');
      await p.waitForTimeout(500); const anCB = await p.evaluate(() => document.querySelector('#canh-bao').hidden); await chup('2b_trum_dap');
      const dap = await p.evaluate(() => document.querySelector('#tb-giua').classList.contains('ht-canh') && !document.querySelector('#top').className.includes('ht'));
      // 3) còn 1 tim (PVP: cả đối thủ 2)
      await p.evaluate(() => { G.wave = 9; G.ban[0].tim = 1; if (G.ban[1]) G.ban[1].tim = 2; }); await p.waitForTimeout(900); await chup('3_1tim');
      const k3 = await kt();
      bao.push({ W, m, bangAn07: anBang, trumAn07: anCB, chiKhoangBossDap: dap, k1, k3 });
      await p.close();
    }
    await ctx.close();
  }
  console.log(JSON.stringify(bao, null, 1)); console.log('ERRS', JSON.stringify(errs));
  await b.close();
})();
