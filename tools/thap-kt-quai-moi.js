// TURRET MERGE — kiểm 4 QUÁI MỚI (12/11): Shield Beetle / Healer / Exploder / Wisp.
//  1) luật: khiên cần ≥ don đòn + thân không mất máu khi còn khiên · hồi 5% cho quái thường quanh nấm (không hồi mình / trùm / ngoài tầm)
//     · nổ sau 0,5 s làm choáng ≤ 2 ụ gần nhất mỗi bàn, ụ choáng không bắn, hết sau 1,5 s · Wisp tàng hình thì không nhắm được, đoạn cuối luôn hiện
//  2) online: danh sách wave 1–150 (loại quái, làn, thời điểm) qua wavMoi đã bọc của dongbo.js — host và khách giống hệt (làn đổi chỗ), chạy lại giống hệt
// Chạy (gốc repo): python3 -m http.server 8765 &   NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-quai-moi.js
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--disable-gpu'] }); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route(/\.(png|jpg|jpeg|webp|mp3|ogg|wav|m4a|mp4|webm)(\?.*)?$/i, r => r.abort());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 200)));
  await p.goto('http://localhost:' + (process.env.PORT || 8765) + '/thap/index.html?notut=1&net=0', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.roster && G.roster.length && typeof ONS !== 'undefined' && typeof UI !== 'undefined', null, { timeout: 30000 });
  await p.waitForTimeout(300);
  await p.evaluate(() => { REN.ve = () => { }; UI.capNhat = () => { }; UI.bangWave = () => { }; UI.canhBaoTrum = () => { }; for (const k in SND) if (typeof SND[k] === 'function') SND[k] = () => { }; ketThuc = () => { }; });
  const luat = await p.evaluate(() => {
    const kq = [], ok = (ten, dk, ct) => kq.push((dk ? '✓ ' : '✗ ') + ten + (ct !== undefined ? ' — ' + ct : ''));
    UI.chon = ['tia', 'lien', 'sungluc', 'bang', 'set']; G.debug.deck2 = UI.chon.slice(); G.debug.seed = 5; G.debug.fill = 1; UI.che = 'coop'; batDau('coop', UI.chon, 'hero'); delete G.debug.fill;
    G.cho = 1e9; G.wave = 30; const don = () => { G.quai.length = 0; G.dan.length = 0; G.hu.length = 0; G.boNo.length = 0; for (const B of G.ban) { B._ds = null; for (const T of B.t) if (T) { T.st.choang = 0; T.st.bang = 0; } } };
    const dung = (on) => { for (const B of G.ban) for (const T of B.t) if (T) T.st.bang = on ? 1e9 : 0; };
    // khiên
    don(); dung(1); let E = sinhQuai('bo_khien', 0, 300); E.vao = 1; const D = QUAI.bo_khien.khien, m0 = E.max;
    ok('khiên = hs × máu thân', E.khMax === Math.round(m0 * D.hs), E.khMax + ' / ' + m0);
    for (let i = 1; i < D.don; i++) trung(E, 1e15, { crit: false, B: G.ban[0], T: null });
    ok('sau ' + (D.don - 1) + ' đòn cực lớn: còn khiên, thân nguyên máu', E.kh > 0 && E.hp === m0 && !E.chet, 'khiên ' + E.kh + ' máu ' + E.hp);
    trung(E, 1e15, { crit: false, B: G.ban[0], T: null }); ok('đòn thứ ' + D.don + ': khiên vỡ, thân vẫn nguyên máu', E.kh === 0 && E.hp === m0 && !E.chet);
    trung(E, 1e15, { crit: false, B: G.ban[0], T: null }); ok('đòn kế: chết', E.chet);
    E = sinhQuai('bo_khien', 0, 300); E.vao = 1; let n = 0; while (E.kh > 0 && n < 1e4) { trung(E, E.khMax / 10, { crit: false, B: G.ban[0], T: null }); n++; }
    ok('đòn nhỏ (1/10 khiên): vỡ sau đúng 10 đòn', n === 10 && E.hp === E.max, n);
    // hồi máu
    don(); const H = sinhQuai('nam_hoi', 0, 300); H.vao = 1; H.hp = H.max * 0.5; const hh = QUAI.nam_hoi.hoi;
    const A = sinhQuai('bo', 0, 260), X = sinhQuai('bo', 0, 300 + hh.r + 60), T2 = sinhTrum('freezer', 0); T2.s = 300; [T2.x, T2.y] = viTri(G.duong[0], 300);
    for (const Q of [A, X, T2]) { Q.vao = 1; Q.hp = Math.round(Q.max * 0.5); } const a0 = A.hp, x0 = X.hp, t0 = T2.hp, h0 = H.hp;
    let b = 0; while (A.hp === a0 && b < 600) { capNhatQuai(1 / 60); b++; }
    ok('nhịp hồi đầu sau ~' + hh.cd + ' s', Math.abs(b / 60 - hh.cd) < 0.05, (b / 60).toFixed(2) + ' s');
    ok('quái thường trong tầm +' + hh.pct * 100 + '% máu tối đa', A.hp - a0 === Math.round(A.max * hh.pct), '+' + (A.hp - a0));
    ok('không hồi: chính nấm, quái ngoài tầm, trùm', H.hp === h0 && X.hp === x0 && T2.hp === t0);
    H.chan = 99; const a1 = A.hp; for (let i = 0; i < 400; i++) capNhatQuai(1 / 60); ok('nấm bị choáng / đóng băng: không hồi', A.hp === a1);
    // nổ
    don(); dung(0); const P = G.duong[0], sG = P.sNhap ? P.sNhap + 120 : P.len * 0.5; E = sinhQuai('ca_no', 0, sG); E.vao = 1; chet(E, G.ban[0]);
    ok('chết → 1 quả nổ chờ, chưa ụ nào choáng', G.boNo.length === 1 && !G.ban.some(B => B.t.some(T => T && T.st.choang > 0)));
    const N = QUAI.ca_no.no; for (let i = 0; i < Math.round(N.tre * 60) + 1; i++) capNhatBoNo(1 / 60);
    const ch = G.ban.map(B => B.t.filter(T => T && T.st.choang > 0));
    ok('nổ: mỗi bàn 1–' + N.so + ' ụ gần nhất trong bán kính choáng ' + N.giay + ' s', ch.every(c => c.length >= 1 && c.length <= N.so) && ch.flat().every(T => T.st.choang === N.giay), ch.map(c => c.map(T => 'ô' + T.o).join('+')).join(' | '));
    const xa = ch.flat().every(T => { const c = G.ban[T.ban].o[T.o]; return Math.hypot(c.x - E.x, c.y - E.y) <= N.r; }); ok('ụ choáng đều trong bán kính ' + N.r, xa);
    const T1 = ch[0][0], cd0 = T1.cd, nap0 = T1.nap; G.cho = 1e9; for (let i = 0; i < 60; i++) capNhatBan(G.ban[0], 1 / 60);
    ok('ụ choáng: không bắn / không nạp trong 1 s', T1.cd === cd0 && T1.nap === nap0 && Math.abs(T1.st.choang - (N.giay - 1)) < 0.02, T1.st.choang.toFixed(2));
    for (let i = 0; i < 40; i++) capNhatBan(G.ban[0], 1 / 60); ok('hết choáng sau ' + N.giay + ' s', T1.st.choang === 0);
    don(); E = sinhQuai('ca_no', 0, sG); E.vao = 1; lot(E); ok('lọt cổng: không nổ', G.boNo.length === 0);
    for (const B of G.ban) B.tim = 3; G.ketThuc = null;
    don(); G.ban[0].khien = 5; E = sinhQuai('ca_no', 0, sG); E.vao = 1; chet(E, G.ban[0]); for (let i = 0; i < 40; i++) capNhatBoNo(1 / 60);
    ok('khiên chỉ huy toàn bàn chặn choáng (bàn kia vẫn choáng)', !G.ban[0].t.some(T => T && T.st.choang > 0) && G.ban[1].t.some(T => T && T.st.choang > 0)); G.ban[0].khien = 0;
    // tàng hình
    don(); const an = QUAI.ma_troi.an, L = P.len, mk = (u) => { const W = sinhQuai('ma_troi', 0, u * L); W.vao = 1; return W; };
    const w1 = mk((an[0][0] + an[0][1]) / 2), w2 = mk(an[0][1] + 0.02), w3 = mk((an[1][0] + an[1][1]) / 2), w4 = mk(0.8); capNhatQuai(1e-6);
    ok('trong đoạn tàng hình: không nhắm được', w1.an && w3.an && !banDuocQuai(G.ban[0], w1) && !banDuocQuai(G.ban[1], w3));
    ok('ngoài đoạn + đoạn cuối: nhắm được', !w2.an && !w4.an && banDuocQuai(G.ban[0], w4));
    G.ban[0]._ds = null; ok('dsMucTieu bỏ Wisp đang tàng hình', !dsMucTieu(G.ban[0]).includes(w1) && dsMucTieu(G.ban[0]).includes(w4));
    ok('đoạn tàng hình cuối kết thúc trước 60% đường', an[an.length - 1][1] <= 0.6);
    const h1 = w1.hp; trung(w1, 5, { crit: false, B: G.ban[0], T: null }); ok('đạn đang bay vẫn gây sát thương lên Wisp tàng hình', w1.hp === h1 - 5);
    // mana không đổi so với quái bị thay
    ok('hệ số mana = quái bị thay', QUAI.bo_khien.mana === QUAI.khong_lo.mana && QUAI.nam_hoi.mana === QUAI.bo.mana && QUAI.ca_no.mana === 2 * QUAI.bay_dan.mana && QUAI.ma_troi.mana === QUAI.toc_hanh.mana);
    let lechN = 0; for (let w = 1; w <= 150; w++) { if (w % 10 === 0) continue; const r = rngHat(w * 31), ds = dsQuaiChuDe(w, r, null); let mn = 0; for (const id of ds) mn += QUAI[id].mana;
      const cu = { bo_khien: 'khong_lo', nam_hoi: 'bo', ma_troi: 'toc_hanh' }; let mc = 0, nc = 0; for (const id of ds) { if (id === 'ca_no') { mc += 2 * QUAI.bay_dan.mana; nc += 2; } else { mc += QUAI[cu[id] || id].mana; nc++; } }
      if (Math.abs(mn - mc) > 1e-9 || ds.length > nc) lechN++; }
    ok('wave 1–150: tổng hệ số mana không đổi, số quái không tăng', lechN === 0, lechN + ' wave lệch');
    G.ban.length = 0; return kq;
  });
  for (const l of luat) console.log(l);
  const kq = await p.evaluate(() => {
    REN.ve = () => { }; UI.capNhat = () => { }; UI.bangWave = () => { }; UI.canhBaoTrum = () => { }; for (const k in SND) if (typeof SND[k] === 'function') SND[k] = () => { };
    const r0 = Math.random;
    const chay = (host, seed) => {
      Math.random = r0;
      UI.chon = ['tia', 'lien', 'sungluc', 'bang', 'set']; G.debug.deck2 = UI.chon.slice(); G.debug.seed = seed; UI.che = 'coop'; batDau('coop', UI.chon, 'hero');
      ONS.on = true; ONS.host = host; ONS.seed = seed; ONS.hostWave = 1e9; ONS.banVao = true; ONS.thay = null; ONS.gui = () => { }; ONS.ghiState = () => { }; ONS.t0 = 0;
      const ra = [], moi = {};
      for (let w = 1; w <= 150; w++) { G.hang.length = 0; G.t = w * 100; Math.random = () => { throw new Error('Math.random ngoài RNG hạt'); };
        wavMoi();
        const ds = G.hang.map(h => [host ? h.p : 1 - h.p, h.id || 'trum:' + h.trum, +(h.t - G.t).toFixed(6)]).sort((a, b) => a[0] - b[0] || a[2] - b[2]);
        for (const h of ds) if (['bo_khien', 'nam_hoi', 'ca_no', 'ma_troi'].includes(h[1]) && !moi[h[1]]) moi[h[1]] = w;
        ra.push(JSON.stringify(ds)); }
      ONS.on = false; return { ra, moi };
    };
    const out = [];
    try { for (const seed of [1, 777, 123456789]) { const a = chay(true, seed), b2 = chay(false, seed), a2 = chay(true, seed);
      let lech = 0, lap = 0; for (let i = 0; i < 150; i++) { if (a.ra[i] !== b2.ra[i]) lech++; if (a.ra[i] !== a2.ra[i]) lap++; }
      out.push({ seed, lechHostKhach: lech, lechChayLai: lap, waveDauQuaiMoi: a.moi, w27: JSON.parse(a.ra[26]).filter(h => h[0] === 0).map(h => h[1]).join(',') }); } }
    finally { Math.random = r0; }
    return out;
  });
  for (const k of kq) console.log((k.lechHostKhach || k.lechChayLai ? '✗' : '✓') + ' online hạt ' + k.seed + ': host ↔ khách lệch ' + k.lechHostKhach + ' / 150 wave · chạy lại lệch ' + k.lechChayLai + ' · wave đầu ' + JSON.stringify(k.waveDauQuaiMoi));
  console.log('wave 27 (làn 0):', kq[0].w27); console.log('lỗi trang:', errs.length ? errs : 'không');
  const hong = luat.filter(l => l.startsWith('✗')).length + kq.filter(k => k.lechHostKhach || k.lechChayLai).length + errs.length; console.log(hong ? 'TRƯỢT ' + hong : 'ĐẠT'); process.exitCode = hong ? 1 : 0;
  await b.close();
})();
