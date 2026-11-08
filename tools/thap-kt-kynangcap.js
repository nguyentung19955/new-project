// TURRET MERGE — kiểm KỸ NĂNG THEO CẤP THẺ (kiểu DCDW: cấp thẻ tăng chính giá trị kỹ năng) — docs/demo-hop-tuong/tuvan/kynang_cap/DCDW.md
//  · bảng KY_NANG_CAP (data.js): Copycat 50% → 92% (+7%/cấp, cấp 9 → 15), cấp đầu = y như trước
//  · trận: bản sao Copycat = dmgU(ụ gốc) × % (theo cấp thẻ COPYCAT của bàn đó); cấp thẻ của ụ gốc vẫn áp vào chỉ số ụ gốc
//  · hỗ trợ: Radar +19.5% → +27.3% (1★, 08/11 +8% bù jackpot PERFECT FREQUENCY), Overclock +90% → +112.5%, Merge King vàng 10% → 22% (số sau đo bậc 06/11)
//  · online: cấp đọc từ chuỗi bộ bài ('#…') → 2 máy cùng số · trang ụ: hàng CARD LV hiện 'Copy 70% → 74%'
// Chạy: python3 -m http.server 8765 (gốc repo) · NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-kynangcap.js  (SHOTS=thư mục: chụp trang ụ)
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const SHOTS = process.env.SHOTS && process.env.SHOTS !== '0' ? process.env.SHOTS : '';
const LOI = [];
const ok = (dk, ten, chi) => { if (dk) console.log('  ✓ ' + ten); else { console.log('  ✗ ' + ten + (chi ? ' — ' + chi : '')); LOI.push(ten); } };
const gan = (a, b) => Math.abs(a - b) < 1e-6;

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: SHOTS ? 3 : 1, hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror ' + e.message));
  await p.goto(BASE + '?mode=solo&deck=saochep,canon,radar,epxung,vughep&wave=1&mana=0&notut=1', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban.length && typeof TAI !== 'undefined' && !TAI.cho, null, { timeout: 45000 });
  await p.waitForFunction(() => typeof VT === 'undefined' || !VT.mo, null, { timeout: 20000 }); await p.waitForTimeout(800);

  // 1. bảng thuần
  let r = await p.evaluate(() => [0, 1, 2, 3, 4, 5, 6, 9].map(k => knGt(KY_NANG_CAP.saochep, k)));
  ok(JSON.stringify(r) === JSON.stringify([70, 74, 78, 82, 86, 90, 94, 94]), 'Copycat: % sao chép 70 → 74 → … → 94 (kẹp ở cấp 15; đo bậc 06/11: 50 → 70)', JSON.stringify(r));
  r = await p.evaluate(() => { const ds = []; for (const id in KY_NANG_CAP) { if (typeof THE_BO !== 'undefined' && THE_BO.includes(id)) continue; /* 08/11: thẻ đã bỏ (THE_BO, vd haoquang) không còn trong roster */ const e = KY_NANG_CAP[id], bac = G.rosterMap[id] && G.rosterMap[id].bac; if (!bac || !SKILLS[id]) { ds.push(id + ':thiếu'); continue; } const n = THE.lvMax - THE.lvDau[bac], n2 = (THE.maxLv ? THE.maxLv(bac) : THE.lvMax) - THE.lvDau[bac], tron = (m) => Math.abs(knGt(e, m) - e.max) < 1e-6 && Math.abs(knGt(e, m - 1) - e.max) > 1e-6; if (!tron(n) && !tron(n2)) ds.push(id); /* 08/11: thẻ Vàng/Đỏ lên LV17 — bảng chạm max ở LV15 (cũ) hoặc ở cấp tối đa mới */ } return ds; });
  ok(!r.length, 'mọi mục bảng: chạm max đúng ở cấp 15 hoặc cấp tối đa của bậc (không vượt)', r.join(','));

  // 2. bản sao trong trận theo cấp thẻ Copycat
  r = await p.evaluate(() => {
    const B = G.ban[0], out = [];
    for (const [kc, kg] of [[0, 0], [3, 0], [6, 0], [3, 4]]) {
      B.capThe = Object.assign({}, B.capThe, { saochep: kc, canon: kg });
      for (let i = 0; i < 15; i++) B.t[i] = null;
      const A = sinhU(taoU(B, 'saochep', 3, 0)), X = sinhU(taoU(B, 'canon', 3, 1)), Y = sinhU(taoU(B, 'canon', 3, 2));
      B.t[0] = A; B.t[1] = X; B.t[2] = Y;
      ghep(B, A, X);
      const C = B.t.find(T => T && T.banSao);
      out.push({ kc, kg, bs: !!C, ti: C ? dmgU(C) / dmgU(Y) : 0, the: hsThe(B, 'canon'), st: C ? statThuc(C).nguon.map(s => s.txt).find(t => /copy/.test(t)) : '' });
    }
    return out;
  });
  const mong = [0.7, 0.82, 0.94, 0.82];
  ok(r.every((x, i) => x.bs && Math.abs(x.ti - mong[i]) < 1e-6), 'bản sao = sát thương ụ gốc × % Copycat (cấp đầu 70% · +3 cấp 82% · max 94%)', JSON.stringify(r.map(x => [x.kc, +x.ti.toFixed(4)])));
  ok(r[3].the > 1.1, 'cấp thẻ của ụ GỐC vẫn áp (Cannon +4 cấp: bản sao = ụ gốc đã lên cấp × 82%)', String(r[3].the));
  ok(/82% power/.test(r[1].st || ''), 'bảng chỉ số thật trong trận: "copy (82% power)"', r[1].st);

  // 2b. ảnh trận: bản sao Copycat (cấp +3 = 82%, bậc mới 08/11 — trước 71%) cạnh Cannon thật — bảng thông tin ụ bản sao
  if (SHOTS) {
    const x = await p.evaluate(() => {
      const B = G.ban[0]; B.capThe = Object.assign({}, B.capThe, { saochep: 3, canon: 0 });
      for (let i = 0; i < 15; i++) B.t[i] = null;
      const A = sinhU(taoU(B, 'saochep', 3, 6)), X = sinhU(taoU(B, 'canon', 3, 7)), Y = sinhU(taoU(B, 'canon', 3, 8));
      B.t[6] = A; B.t[7] = X; B.t[8] = Y; ghep(B, A, X);
      const C = B.t.find(T => T && T.banSao); G.dung = true; UI.moTT(C.id, C);
      return { c: Math.round(dmgU(C)), g: Math.round(dmgU(Y)) };
    });
    await p.waitForTimeout(700); await p.screenshot({ path: SHOTS + 'tran_banSao_82.png' });
    ok(x.c === Math.round(x.g * 0.82) || Math.abs(x.c - x.g * 0.82) <= 1, 'ảnh trận: bản sao ' + x.c + ' = ' + x.g + ' × 82%', JSON.stringify(x));
    await p.evaluate(() => { try { UI.dongTT && UI.dongTT(); } catch (e) { } G.dung = false; });
  }
  // 3. hỗ trợ + kỹ năng đặc biệt
  r = await p.evaluate(() => {
    const B = G.ban[0], o = {};
    for (let i = 0; i < 15; i++) B.t[i] = null;
    const R = sinhU(taoU(B, 'radar', 1, 0)); B.t[0] = R;
    B.capThe.radar = 0; o.r0 = SKILLS.radar.them(R); B.capThe.radar = 6; o.r6 = SKILLS.radar.them(R); B.capThe.radar = 12; o.r12 = SKILLS.radar.them(R);
    B.capThe.epxung = 9; const E = sinhU(taoU(B, 'epxung', 2, 1)), L = sinhU(taoU(B, 'canon', 2, 2)); B.t[1] = E; B.t[2] = L; ghep(B, E, L); o.ep = L.epxung;
    B.capThe.vughep = 6; let v = 0; const r0 = Math.random; let s = 7; Math.random = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
    for (let i = 0; i < 4000; i++) if (sinhU(taoU(B, 'vughep', 1, 3)).vang) v++; Math.random = r0; o.vang = v / 4000;
    return o;
  });
  ok(gan(r.r0, 0.195) && gan(r.r6, 0.234) && gan(r.r12, 0.273), 'Radar 1★: +19.5% (cấp đầu, ×bậc Xanh 1.5) → +23.4% → +27.3% (cấp 15)', JSON.stringify(r));
  ok(gan(r.ep, 1.125), 'Overclock max: +112.5% tốc bắn', String(r.ep));
  ok(Math.abs(r.vang - 0.22) < 0.025, 'Merge King max: ~22% ra bản vàng', String(r.vang));

  // 4. online: cấp gửi trong chuỗi bộ bài → giải mã ra đúng mức → cùng % sao chép
  r = await p.evaluate(() => { const deck = ['saochep', 'canon', 'radar', 'epxung', 'vughep']; const m = THEBAI.giaiMa(['saochep', 'canon', '#' + [3, 0, 7, 2, 6].map(x => x.toString(36)).join('')], deck); return { m, pc: heSaoChep({ capThe: m }), rd: knThe({ capThe: m }, 'radar') }; });
  ok(r.m && r.m.saochep === 3 && gan(r.pc, 0.82) && gan(r.rd, 24.05), 'online: chuỗi bộ bài "#30726" → Copycat 82%, Radar +24.05% (2 máy cùng số)', JSON.stringify(r));

  // 5. trang ụ (từ màn chính, ngoài trận): hàng CARD LV
  const p2 = await ctx.newPage(); p2.on('pageerror', e => errs.push('pageerror ' + e.message));
  await p2.goto(BASE + '?notut=1', { waitUntil: 'load' });
  await p2.waitForFunction(() => typeof UP !== 'undefined' && typeof TAI !== 'undefined' && !TAI.cho && G.roster && G.roster.length, null, { timeout: 45000 });
  await p2.waitForTimeout(1200);
  const trang = async (id, lv, ten) => {
    const t = await p2.evaluate(([id, lv]) => {
      const d = THEBAI.doc(); d.c[id] = { lv, n: 0 }; THEBAI.luu();
      if (typeof UP !== 'undefined') { UP.mo(id); }
      const el = document.querySelector('.tb-cap-giua'); return el ? [...el.querySelectorAll('small:not(.tb-vi)')].map(x => x.textContent).join(' · ') : '';
    }, [id, lv]);
    if (SHOTS) { await p2.waitForTimeout(500); await p2.screenshot({ path: SHOTS + ten + '.png' }); }
    await p2.evaluate(() => { try { UP.dong && UP.dong(); } catch (e) { } }); await p2.waitForTimeout(400);
    return t;
  };
  const t1 = await trang('saochep', 9, 'saochep_lv9'), t2 = await trang('saochep', 12, 'saochep_lv12'), t3 = await trang('saochep', 17, 'saochep_lv17'); // 08/11: thẻ Vàng tối đa LV17
  ok(/Copy 70% → 74%/.test(t1), 'trang ụ Copycat LV9: "Copy 70% → 74%"', t1);
  ok(/Copy 82% → 86%/.test(t2), 'trang ụ Copycat LV12: "Copy 82% → 86%"', t2);
  ok(/Copy 94%/.test(t3) && /max/i.test(t3), 'trang ụ Copycat LV17 (tối đa): "Copy 94% · max"', t3);
  const t4 = await trang('radar', 3, 'radar_lv3'), t5 = await trang('radar', 9, 'radar_lv9'), t6 = await trang('radar', 15, 'radar_lv15');
  ok(/Rate buff \+19\.5% → \+20\.2%/.test(t4) && /\+23\.4% → \+24\.1%/.test(t5) && /\+27\.3%/.test(t6), 'trang ụ Radar: "Rate buff +19.5% → +20.2%" … "+27.3% max"', [t4, t5, t6].join(' | '));
  for (const [id, ds] of [['epxung', [6, 10, 15]], ['vughep', [9, 12, 15]], ['dongbo', [9, 12, 15]]]) for (const lv of ds) await trang(id, lv, id + '_lv' + lv);
  await p2.evaluate(() => { localStorage.removeItem('turret_the'); });
  ok(!errs.length, 'không lỗi trang', errs.slice(0, 3).join(' | '));
  await b.close();
  console.log(LOI.length ? '✗ ' + LOI.length + ' lỗi' : '✓ XANH');
  process.exit(LOI.length ? 1 : 0);
})();
