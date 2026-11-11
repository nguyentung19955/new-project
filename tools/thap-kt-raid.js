// ASTRAL ARSENAL — KIỂM ĐỘT KÍCH (RAID) — thap/js/chedo-rd.js (12/11)
//  ✓ khoá cấp phi công 6 · mục RAID trong GAME MODE · token: thắng PVP +5, trần 100; vào tốn 20, thiếu token không vào được
//  ✓ trận: bàn co-op, trùm đứng yên ở cổng (không đi), máu theo bậc, gọi quái theo lịch tất định; % máu (Nemesis…) tính trên máu chuẩn của chặng (E.maxPct)
//  ✓ hạ trùm = thắng: thưởng lần đầu 1 lần, mở bậc kế; thắng lại = thưởng lặp · hết giờ = thua, không thưởng · không ghi kỷ lục wave · chedo-rd.js không gọi Math.random
//  ✓ tất định: 2 lượt cùng hạt → cùng kết quả
// Chạy: python3 -m http.server 8765 (gốc repo) · NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-raid.js [BASE]
'use strict';
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const BASE = process.argv[2] || process.env.BASE || 'http://localhost:8765/thap/';
let loi = 0; const ok = (c, t) => { console.log((c ? '  ✓ ' : '  ✗ ') + t); if (!c) loi++; };
(async () => {
  ok(!/Math\.random/.test(fs.readFileSync(path.join(__dirname, '../thap/js/chedo-rd.js'), 'utf8').split('\n').filter(l => !/^\s*\/\//.test(l)).join('\n')), 'chedo-rd.js không gọi Math.random');
  const b = await chromium.launch({ args: ['--disable-gpu'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route(/\.(mp3|ogg|wav|m4a|mp4|webm)(\?.*)?$/i, r => r.abort());
  const chay = async () => {
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 160)));
    await p.goto(BASE + 'index.html?notut=1&net=0', { waitUntil: 'load' });
    await p.waitForFunction(() => typeof G !== 'undefined' && G.roster && G.roster.length && typeof RD !== 'undefined' && typeof HM !== 'undefined', null, { timeout: 30000 });
    await p.waitForTimeout(1200);
    const r = await p.evaluate(() => {
      const o = {}; HD.moKhoa = () => true; UI.chon = ['cuongno', 'baotuyet', 'no5', 'lienket', 'sungluc'];
      o.khoa = !TT.tnMo('rd'); TT.st().xp = TT.xpTong(6); TT.xetCap(); TT.st().bao = []; o.mo = TT.tnMo('rd');
      HM.moChe(); o.che = [...document.querySelectorAll('#hm-tam .hm-chec')].map(x => x.dataset.che).join(); HM.dong(true);
      o.thieu = RD.vao(1); o.cong = RD.congVe(5); for (let i = 0; i < 30; i++) RD.congVe(5); o.tran = RD.st().token; RD.st().token = 45; o.bac2 = RD.vao(2);
      const mb = (a) => function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
      G.debug.seed = 991; REN.ve = () => { }; const r0 = Math.random; Math.random = mb(5); const best0 = localStorage.getItem('turret_best');
      try {
        o.vao = RD.vao(1); G.cho = 0.5; o.token = RD.st().token;
        let n = 0; while (!G.rd.E && n++ < 200) capNhat(1 / 60);
        const E = G.rd.E; o.dau = { che: G.che, ban: G.ban.length, max: E.max, v: E.d.v, s: Math.round(E.s) };
        for (let i = 0; i < 1800; i++) capNhat(1 / 60); o.s30 = Math.round(E.s); o.pct = E.maxPct > 0 && E.maxPct !== E.max; o.goi = G.rd.n; o.hpSau30 = Math.round(E.hp);
        E.hp = 1; for (const B of G.ban) B.mana = 5000; G.debug.auto = true; n = 0; while (!G.ketThuc && n++ < 20000) capNhat(1 / 60);
      } finally { Math.random = r0; }
      const k = G.ketThuc; o.kq = k && { thang: k.thang, rd: !!k.rd }; const v0 = KT.vang; UI.ketQua(k); o.vang1 = KT.vang - v0; o.st = JSON.stringify(RD.st()); o.best = localStorage.getItem('turret_best') === best0;
      o.chu = document.getElementById('kq-phu').textContent + ' | ' + document.querySelector('#ketqua [data-act="choilai"]').textContent;
      const v1 = KT.vang; const x = RD.ket(RD.cauHinh(1), true); o.lai = { moi: x.moi, vang: KT.vang - v1 }; o.thua = RD.ket(RD.cauHinh(2), false).ra.vang; o.bacMo = RD.bacMo();
      return o;
    });
    r.e = errs; await p.close(); return r;
  };
  const r = await chay(), r2 = await chay();
  ok(r.khoa && r.mo && /(^|,)rd(,|$)/.test(r.che), 'khoá tới cấp phi công 6; GAME MODE = ' + r.che);
  ok(r.thieu === false && r.cong === 5 && r.tran === 100 && r.bac2 === false, 'token: thiếu → không vào; +5; trần ' + r.tran + '; bậc 2 chưa mở');
  ok(r.vao && r.token === 25 && r.dau.che === 'coop' && r.dau.ban === 2 && r.dau.max === 5000 && r.dau.v === 0, 'vào bậc 1: trừ 20 token (45 → 25) · ' + JSON.stringify(r.dau));
  ok(r.s30 === r.dau.s && r.pct && r.goi >= 2, 'sau 30 s trùm vẫn đứng ở cổng (s ' + r.s30 + '), đã gọi ' + r.goi + ' đợt quái, có máu chuẩn cho sát thương %');
  ok(r.kq && r.kq.thang && r.kq.rd && r.vang1 === 1000 && /"da":\{"1":1\}/.test(r.st) && /"max":1/.test(r.st) && r.bacMo === 2 && r.best, 'hạ trùm = thắng: thưởng lần đầu (1 000 vàng + rương), mở bậc 2, không ghi kỷ lục wave · ' + r.st);
  ok(r.lai.moi === false && r.lai.vang === 150 && r.thua === 0, 'thắng lại: thưởng lặp 150 vàng (không phát lại lần đầu); thua: không thưởng');
  ok(/RAID · TIER 1/.test(r.chu), 'màn kết quả: ' + r.chu);
  ok(JSON.stringify([r.kq, r.hpSau30, r.goi]) === JSON.stringify([r2.kq, r2.hpSau30, r2.goi]), 'tất định: lượt 2 cùng hạt → máu trùm sau 30 s = ' + r2.hpSau30 + ' (như lượt 1)');
  ok(!r.e.length && !r2.e.length, 'không lỗi trang ' + r.e.concat(r2.e).join(' | '));
  await b.close();
  console.log(loi ? '✗ Đột Kích: ' + loi + ' lỗi' : '✓ Đột Kích đạt');
  process.exit(loi ? 1 : 0);
})();
