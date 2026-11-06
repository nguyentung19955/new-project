// TURRET MERGE — hồi quy tuvan/giat-ghep (docs/demo-hop-tuong/tuvan/giat-ghep/BAO-CAO.md)
//  1) Tấm tên ụ sau ghép (KG.lo, keoghep.js) KHÔNG BAO GIỜ đè nhau: ghép 2 ô cạnh nhau liên tiếp ở 3× (cách nhau vài chục ms) — SOLO / CO-OP / PVP,
//     iPhone 13; kiểm khung bao từng khung vẽ trong 1,2 s + tấm mới thay tấm cũ (không mất tấm mới nhất).
//  2) Không giật (iPhone 13 + CPU ×4, tools/thap-do-giat-ghep.js KT=1): sau khởi động không bước luật nào > 120 ms ở SOLO / CO-OP / PVP với bộ nặng
//     ghép đặc biệt; ra chiêu LẦN ĐẦU từng ụ chủ động / chỉ huy / ghép đặc biệt / trùm không vượt 120 ms. NHANH=1: bỏ phần 2.
// Chạy: python3 -m http.server 8765 & ; NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-giat-ghep.js
'use strict';
const { chromium, devices } = require('playwright');
const path = require('path'), { execFileSync } = require('child_process');
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const hong = [];
const kt = (dk, s) => { if (!dk) hong.push(s); console.log((dk ? '✓ ' : '✗ ') + s); };

(async () => {
  const b = await chromium.launch();
  for (const che of ['solo', 'coop', 'pvp']) {
    const ctx = await b.newContext(devices['iPhone 13']); const p = await ctx.newPage(), err = [];
    p.on('pageerror', e => err.push(e.message));
    await p.goto(BASE + '?nointro=1&notut=1&mode=' + che + '&deck=canon,bang,tia,set,lien&mana=99999', { waitUntil: 'load' });
    await p.waitForFunction(() => typeof G !== 'undefined' && G.ban.length && !TAI.cho && typeof KG !== 'undefined', null, { timeout: 40000 });
    await p.waitForTimeout(1500);
    const r = await p.evaluate(async () => {
      G.tocDo = 3;
      if (!KG.khungLo) { // bản cũ (trước sửa): cùng công thức khung bao để đo "trước"
        KG.khungTam = function (s, x, y, px, sc, sao) { const im = REN.chuAnh(s, '#ffffff', px), hh = px * 2.1 * sc, bw = sao ? hh * 0.95 : 0, w = Math.min(W - 8, (im.tw + px * 1.6) * sc + bw), cx = clamp(x, w / 2 + 4, W - w / 2 - 4); return [cx - w / 2 - (sao ? hh * 0.2 : 0), y - hh * 0.72, Math.max(cx + w / 2, cx - w / 2 + hh * 1.15), y + hh * 0.63]; };
        KG.khungLo = function (l) { const c = l.B.o[l.o], C = Math.min(l.B.cw, l.B.ch), r = G.rosterMap[l.T.id]; return this.khungTam(r ? r.ten : l.T.id, c.x, c.y + C * 0.36, 12, 1.25, l.T.sao); };
      }
      const B = G.ban[0], kq = { chong: 0, khung: 0, toiDa: 0, conMoi: true };
      const kiem = () => {
        const L = KG.lo.map(l => KG.khungLo(l));
        kq.toiDa = Math.max(kq.toiDa, L.length);
        for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) { const a = L[i], c = L[j]; if (a[0] < c[2] && c[0] < a[2] && a[1] < c[3] && c[1] < a[3]) kq.chong++; }
      };
      // 6 lượt: mỗi lượt ghép 2 cặp ở 2 ô CẠNH NHAU (ngang và dọc), cách nhau 40 ms; tên dài (ụ thật có tên dài nhất trong bộ)
      const cap = [[[0, 5], [1, 6]], [[2, 7], [3, 8]], [[5, 10], [6, 11]], [[1, 2], [6, 7]], [[3, 4], [8, 9]], [[10, 11], [12, 13]]];
      for (const [[a1, b1], [a2, b2]] of cap) {
        for (let o = 0; o < 15; o++) B.t[o] = null;
        const ids = ['canon', 'bang', 'tia', 'set', 'lien'];
        B.t[a1] = sinhU(taoU(B, ids[a1 % 5], 2, a1)); B.t[b1] = sinhU(taoU(B, ids[a1 % 5], 2, b1));
        B.t[a2] = sinhU(taoU(B, ids[a2 % 5], 2, a2)); B.t[b2] = sinhU(taoU(B, ids[a2 % 5], 2, b2));
        KG.lo.length = 0;
        ghep(B, B.t[a1], B.t[b1]);
        const t0 = performance.now(); let lan2 = false;
        while (performance.now() - t0 < 1200) {
          await new Promise(r => requestAnimationFrame(r));
          if (!lan2 && performance.now() - t0 > 40) { lan2 = true; ghep(B, B.t[a2], B.t[b2]); }
          if (KG.lo.length) { kq.khung++; kiem(); }
          if (lan2 && performance.now() - t0 > 700 && KG.lo.length && !KG.lo.some(l => l.o === b2)) kq.conMoi = false; // tấm mới nhất phải còn (đến khi tự tắt ~1 s)
        }
      }
      // gọi trực tiếp: 4 tấm liền nhau trên 1 hàng → không cặp nào đè
      for (let o = 0; o < 15; o++) B.t[o] = null;
      for (const o of [5, 6, 7, 8]) B.t[o] = sinhU(taoU(B, 'lien', 3, o));
      const c0 = kq.chong; KG.lo.length = 0; for (const o of [5, 6, 7, 8]) KG.hien(B, o); kiem(); kq.chong4 = kq.chong - c0; kq.chong -= kq.chong4;
      kq.lienHang = KG.lo.length;
      return kq;
    });
    kt(r.chong === 0 && r.khung > 20, `${che}: tấm tên ghép 2 ô cạnh nhau liên tiếp (3×) — ${r.khung} khung, ${r.chong} lần đè, tối đa ${r.toiDa} tấm cùng lúc`);
    kt(r.conMoi, `${che}: tấm tên của lần ghép mới nhất vẫn hiện (tấm mới thay tấm cũ, không mất)`);
    kt(r.lienHang >= 1 && r.chong4 === 0, `${che}: 4 tấm liền hàng → còn ${r.lienHang} tấm, ${r.chong4} lần đè`);
    kt(!err.length, `${che}: không lỗi trang` + (err.length ? ' — ' + err.slice(0, 2).join(' | ') : ''));
    await ctx.close();
  }
  await b.close();
  if (!process.env.NHANH) {
    try {
      const o = execFileSync('node', [path.join(__dirname, 'thap-do-giat-ghep.js')], { stdio: 'pipe', env: Object.assign({}, process.env, { BASE, KT: '1', BUOC: process.env.GG_BUOC || '2400', PROF: '0', NHAN: 'hoiquy', OUT: process.env.GG_OUT || '/tmp/giat-ghep-hoiquy/' }), timeout: 1500000 });
      const L = String(o).trim().split('\n'); for (const l of L.filter(l => /^\S/.test(l))) console.log('  ' + l);
      kt(true, 'không giật: SOLO/CO-OP/PVP + ra chiêu lần đầu ≤ 120 ms (iPhone 13, CPU ×4)');
    } catch (e) {
      const L = String(e.stdout || e.message || '').split('\n');
      for (const l of L.filter(l => /^\S/.test(l))) console.log('  ' + l);
      kt(false, 'giật > 120 ms (tools/thap-do-giat-ghep.js KT=1): ' + L.filter(l => /vượt|> 120|LỖI/.test(l)).join(' | ').slice(0, 400));
    }
  }
  console.log(hong.length ? '✗ ' + hong.length + ' lỗi' : '✓ giật-ghép: tấm tên không đè + không giật');
  process.exit(hong.length ? 1 : 0);
})();
