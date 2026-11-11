// ASTRAL ARSENAL — KIỂM ĐẨY TRÙM (PUSH) — thap/js/chedo-pu.js (12/11)
//  ✓ khoá cấp phi công 4 · mục PUSH trong GAME MODE · trận: bàn PVP, mỗi làn 1 trùm không chết (máu luôn đầy), không quái thường, mana theo giây
//  ✓ sát thương đẩy lùi trùm (lùi = ST / K, K tăng theo chặng) · hết giờ: xa lõi hơn thắng · trùm chạm lõi = thua ngay
//  ✓ kết quả đi đường PVP: cúp +30 / −20, không ghi kỷ lục wave PVP · tất định: 2 lượt cùng hạt → cùng kết quả · chedo-pu.js không gọi Math.random
// Chạy: python3 -m http.server 8765 (gốc repo) · NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-push.js [BASE]
'use strict';
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const BASE = process.argv[2] || process.env.BASE || 'http://localhost:8765/thap/';
let loi = 0; const ok = (c, t) => { console.log((c ? '  ✓ ' : '  ✗ ') + t); if (!c) loi++; };
(async () => {
  ok(!/Math\.random/.test(fs.readFileSync(path.join(__dirname, '../thap/js/chedo-pu.js'), 'utf8').split('\n').filter(l => !/^\s*\/\//.test(l)).join('\n')), 'chedo-pu.js không gọi Math.random');
  const b = await chromium.launch({ args: ['--disable-gpu'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route(/\.(mp3|ogg|wav|m4a|mp4|webm)(\?.*)?$/i, r => r.abort());
  const chay = async () => {
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 160)));
    await p.goto(BASE + 'index.html?notut=1&net=0', { waitUntil: 'load' });
    await p.waitForFunction(() => typeof G !== 'undefined' && G.roster && G.roster.length && typeof PU !== 'undefined' && typeof HM !== 'undefined', null, { timeout: 30000 });
    await p.waitForTimeout(1200);
    const r = await p.evaluate(() => {
      const o = {}; HD.moKhoa = () => true; UI.chon = ['tia', 'lien', 'sungluc', 'laser', 'set'];
      o.khoa = !TT.tnMo('pu'); TT.st().xp = TT.xpTong(4); TT.xetCap(); TT.st().bao = []; o.mo = TT.tnMo('pu');
      HM.moChe(); o.che = [...document.querySelectorAll('#hm-tam .hm-chec')].map(x => x.dataset.che).join(); HM.dong(true);
      const mb = (a) => function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
      G.debug.seed = 313; G.debug.auto = true; REN.ve = () => { }; const r0 = Math.random; Math.random = mb(9); const best0 = localStorage.getItem('turret_best');
      try {
        o.vao = PU.vao(); G.cho = 0.5; let n = 0; while (!G.pu.E.length && n++ < 200) capNhat(1 / 60);
        const E = G.pu.E[0]; o.dau = { che: G.che, trum: G.pu.E.length, cung: G.pu.E[0].trum === G.pu.E[1].trum, hp: E.max, doi: G.ban[1].deck.every(id => ['trang', 'xanh'].includes(G.rosterMap[id].bac)) };
        E.s = 300; const m0 = G.ban[0].mana; trung(E, 2400, { B: G.ban[0] }); capNhat(1 / 60); o.lui = Math.round(300 - E.s); o.hpDay = E.hp === PUC.H;
        for (let i = 0; i < 120; i++) capNhat(1 / 60); o.mana = G.ban[0].manaNay > 0; o.quai = G.quai.filter(x => !x.trum).length;
        n = 0; while (!G.ketThuc && n++ < 12000) capNhat(1 / 60);
      } finally { Math.random = r0; }
      const k = G.ketThuc; o.kq = k && { thang: k.thang, pu: k.pu, wave: k.wave }; const c0 = CUP.st().c; UI.ketQua(k); o.cup = CUP.st().c - c0; o.best = localStorage.getItem('turret_best') === best0;
      o.chu = document.getElementById('kq-so').textContent + ' | ' + document.querySelector('#ketqua [data-act="choilai"]').textContent;
      return o;
    });
    r.e = errs; await p.close(); return r;
  };
  const r = await chay(), r2 = await chay();
  ok(r.khoa && r.mo && /(^|,)pu(,|$)/.test(r.che), 'khoá tới cấp phi công 4; GAME MODE = ' + r.che);
  ok(r.vao && r.dau.che === 'pvp' && r.dau.trum === 2 && r.dau.cung && r.dau.hp === 1e9 && r.dau.doi, 'trận: bàn PVP, 2 trùm cùng loại không chết, đối thủ 0 cúp Trắng / Xanh ' + JSON.stringify(r.dau));
  ok(r.lui === 100 && r.hpDay && r.mana && r.quai === 0, '2 400 ST ở chặng 1 đẩy lùi ' + r.lui + ' px (K = 24), máu trùm hồi đầy, có mana theo giây, không quái thường');
  ok(r.kq && r.kq.pu && r.kq.wave === 10 && (r.kq.thang ? r.cup === 30 : r.cup === 0 || r.cup === -20) && r.best, 'kết thúc: ' + JSON.stringify(r.kq) + ' · cúp ' + (r.cup >= 0 ? '+' : '') + r.cup + ' · không ghi kỷ lục wave');
  ok(r.kq.pu.t < 180 ? (r.kq.pu.a === 0 || r.kq.pu.b === 0) : r.kq.thang === (r.kq.pu.a > r.kq.pu.b || r.kq.pu.a === r.kq.pu.b), 'luật thắng thua khớp quãng đường (bạn ' + r.kq.pu.a + '% · địch ' + r.kq.pu.b + '% · ' + r.kq.pu.t + ' s)');
  ok(/YOU · RIVAL/.test(r.chu) && /PUSH AGAIN/.test(r.chu), 'màn kết quả: ' + r.chu);
  ok(JSON.stringify(r.kq) === JSON.stringify(r2.kq), 'tất định: lượt 2 cùng hạt → ' + JSON.stringify(r2.kq));
  ok(!r.e.length && !r2.e.length, 'không lỗi trang ' + r.e.concat(r2.e).join(' | '));
  await b.close();
  console.log(loi ? '✗ Đẩy Trùm: ' + loi + ' lỗi' : '✓ Đẩy Trùm đạt');
  process.exit(loi ? 1 : 0);
})();
