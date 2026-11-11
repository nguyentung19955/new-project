// ASTRAL ARSENAL — KIỂM ĐỢT 12/11: QUESTS 3 thẻ con (nv-the.js) · TWIN ANVIL sát cạnh / song sinh / +★ (skills4.js) · STATIC JAMMER xích không tự hết (trum.js)
//  ✓ QUESTS: 3 thẻ REWARDS / DAILY / ACHIEVEMENTS; mỗi mục nằm đúng thẻ; mở màn vào thẻ đầu tiên có chấm đỏ; bấm thẻ đổi nhóm; nhận thưởng xong vẫn ở thẻ đó
//  ✓ ANVIL: chỉ rèn ụ sát cạnh (chéo / xa: không) · Anvil + Anvil cùng dạng ở xa vẫn được · cùng loại giữ cộng dồn lớn hơn · 2 loại bằng cộng dồn = TWIN-FORGED ×1,25
//    · lệch → loại lớn hơn thắng · +★ tại chỗ = +1 cộng dồn / ★ (trần 14), hạ sao không trừ · cờ ô online mang đủ 2 buff + cộng dồn, đọc được gói cũ
//  ✓ JAMMER: xích 2 ụ, 20 giây sau vẫn còn; ụ bị xích không kéo đi được, làm đích được; ghép vào 1 ụ → đứt cả hai; trùm chết → đứt; xoá debuff → đứt cả cặp;
//    ụ kia biến mất → đứt; máy (aiBan) tự ghép gỡ · tất định: 2 lần cùng hạt → cùng ụ bị xích
// Chạy: python3 -m http.server 8765 (gốc repo) · NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-b3.js [BASE]
'use strict';
const { chromium } = require('playwright');
const BASE = process.argv[2] || process.env.BASE || 'http://localhost:8765/thap/';
let loi = 0; const ok = (c, t) => { console.log((c ? '  ✓ ' : '  ✗ ') + t); if (!c) loi++; };
(async () => {
  const b = await chromium.launch({ args: ['--disable-gpu'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route(/\.(mp3|ogg|wav|m4a|mp4|webm)(\?.*)?$/i, r => r.abort());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 160)));
  await p.goto(BASE + 'index.html?notut=1&net=0', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.roster && G.roster.length && typeof NVT !== 'undefined' && typeof XICH !== 'undefined' && typeof HM !== 'undefined', null, { timeout: 30000 });
  await p.waitForTimeout(1200);
  // ---------- 1. QUESTS ----------
  const q = await p.evaluate(async () => {
    const o = {}, w = (ms) => new Promise(r => setTimeout(r, ms)); HD.moKhoa = () => true;
    TT.st().xp = TT.xpTong(9); TT.xetCap(); TT.st().bao = []; try { TTUI.dong(); } catch (e) { }
    KTUI.moTab('nv'); await w(300);
    const nhom = () => [...document.querySelectorAll('#kt-than .nvt-nhom')].map(g => g.dataset.nvt + (g.hidden ? '-' : '+') + ':' + [...g.querySelectorAll('.kt-muc > b')].map(x => x.textContent.trim().split(/\s{2,}/)[0]).join('|')).join(' ; ');
    o.the = [...document.querySelectorAll('#kt-than .nvt-thanh button')].map(x => x.textContent.trim() + (x.querySelector('.kt-cham') ? '*' : '') + (x.classList.contains('vang') ? '!' : '')).join(' ');
    o.nhom = nhom(); o.dau = NVT.the;
    document.querySelector('#kt-than [data-act="nvt-the"][data-id="tt"]').click(); await w(200); o.sauBam = NVT.the + ':' + [...document.querySelectorAll('#kt-than .nvt-nhom')].filter(g => !g.hidden).map(g => g.dataset.nvt).join();
    document.querySelector('#kt-than [data-act="nvt-the"][data-id="rw"]').click(); await w(200);
    const nut = document.querySelector('#kt-than .kt-dn-nut:not([disabled])'); o.coDn = !!nut; if (nut) { nut.click(); await w(600); try { KTUI.dongPhu(); } catch (e) { } await w(200); }
    o.sauNhan = NVT.the; KTUI.dong(); KTUI.moTab('nv'); await w(300); o.moLai = NVT.the; KTUI.dong();
    return o;
  });
  ok(/^REWARDS\*?!? DAILY\*?!? ACHIEVEMENTS\*?!?$/.test(q.the) && /REWARDS\*/.test(q.the), 'thanh 3 thẻ: ' + q.the + ' (* = chấm đỏ, ! = đang chọn)');
  ok(/rw[+-]:[^;]*DAILY LOGIN/.test(q.nhom) && /dn[+-]:[^;]*DAILY QUESTS[^;]*WEEKLY QUESTS/.test(q.nhom) && /tt[+-]:[^;]*ACHIEVEMENTS/.test(q.nhom) && /rw[+-]:[^;]*PILOT LEVEL/.test(q.nhom) && !/tt[+-]:[^;]*DAILY/.test(q.nhom), 'mục theo thẻ: ' + q.nhom);
  ok(q.dau === 'rw' && q.sauBam === 'tt:tt', 'mở màn vào thẻ đầu có chấm đỏ (' + q.dau + '); bấm ACHIEVEMENTS → ' + q.sauBam);
  ok(q.coDn && q.sauNhan === 'rw' && !!q.moLai, 'nhận Daily Login xong vẫn ở REWARDS; mở lại màn → thẻ ' + q.moLai);
  // ---------- 2. TWIN ANVIL ----------
  const a = await p.evaluate(() => {
    const o = {}, S = SKILLS.loren; UI.chon = ['loren', 'lien', 'tia', 'set', 'vughep']; G.debug.seed = 77; UI.che = 'solo'; batDau('solo', UI.chon, 'hero'); G.cho = 999;
    const B = G.ban[0], dat = (id, sao, o2, f) => { const T = sinhU(taoU(B, id, sao, o2)); if (f) f(T); B.t[o2] = T; return T; };
    B.t.fill(null);
    const X = dat('lien', 2, 7), A = dat('loren', 4, 6, T => { T.dang = 'dmg'; T.lo = 4; }), Cx = dat('loren', 4, 1, T => { T.dang = 'toc'; T.lo = 4; }), Xa = dat('loren', 3, 14, T => { T.dang = 'dmg'; T.lo = 3; }), A2 = dat('loren', 2, 0, T => { T.dang = 'dmg'; T.lo = 2; });
    o.ke = hopLeGhep(A, X); o.cheo = hopLeGhep(Cx, X); o.xa = hopLeGhep(Xa, X); o.anvilXa = hopLeGhep(A2, Xa); o.khacDang = hopLeGhep(Cx, A);
    const dl = () => { for (const T of B.t) if (T) T.buf = { toc: 0, dmg: 0, crit: 0, cham: 0, chet: 0 }; mocBuf(B); }; const do_ = () => { dl(); const co = [X.buf.dmg, X.buf.toc]; const g = X.anv; X.anv = null; dl(); X.anv = g; return [+(co[0] - X.buf.dmg).toFixed(4), +(co[1] - X.buf.toc).toFixed(4)]; }; // phần buff do Anvil thêm
    ghep(B, A, X); o.sau1 = JSON.stringify(X.anv); o.buf1 = do_();
    const T4 = dat('loren', 4, 2, T => { T.dang = 'toc'; T.lo = 4; }); o.t4 = hopLeGhep(T4, X); ghep(B, T4, X); o.song = JSON.stringify(X.anv);
    o.bufSong = do_();
    o.dem = JSON.stringify(DEMKN.lay(X, B) && DEMKN.lay(X, B).m.map(m => m.ic + m.s));
    o.co = JSON.stringify(ONS && typeof DB !== 'undefined' ? 0 : 0);
    const T9 = dat('loren', 5, 8, T => { T.dang = 'toc'; T.lo = 9; }); ghep(B, T9, X); o.lech = JSON.stringify(X.anv);
    const D3 = dat('loren', 3, 12, T => { T.dang = 'dmg'; T.lo = 3; }); ghep(B, D3, X); o.nho = JSON.stringify(X.anv); o.d3Mat = B.t[12] === null;
    // +★ tại chỗ
    const S1 = dat('loren', 2, 10, T => { T.dang = 'dmg'; }); o.lo0 = S1.lo; nangSao(B, S1, 2); capNhatU(B, S1, 1 / 60); o.lo2 = S1.lo; S1.sao = 1; capNhatU(B, S1, 1 / 60); o.loHa = S1.lo; S1.sao = 7; S1.lo = 12; S1._lrS = 1; capNhatU(B, S1, 1 / 60); o.loTran = S1.lo;
    return o;
  });
  ok(a.ke && !a.cheo && !a.xa && a.anvilXa && !a.khacDang, 'vị trí: sát cạnh ' + a.ke + ' · chéo ' + a.cheo + ' · xa ' + a.xa + ' · Anvil+Anvil cùng dạng ở xa ' + a.anvilXa + ' · khác dạng ' + a.khacDang);
  ok(/"k":"dmg"/.test(a.sau1) && /"lo":4/.test(a.sau1) && a.buf1[0] === 0.12 && a.buf1[1] === 0, 'rèn ST 4 cộng dồn: ' + a.sau1 + ' → buff ' + a.buf1);
  ok(/"x":\{"k":"toc"/.test(a.song) && a.bufSong[0] === 0.15 && a.bufSong[1] === 0.1, 'SONG SINH 4 + 4: ' + a.song + ' → ST +' + a.bufSong[0] + ', tốc +' + a.bufSong[1] + ' (×1,25) · huy hiệu ' + a.dem);
  ok(/"k":"toc"/.test(a.lech) && /"lo":9/.test(a.lech) && !/"x"/.test(a.lech), 'lệch (tốc 9 vs ST 4): chỉ giữ tốc ' + a.lech);
  ok(a.nho === a.lech && a.d3Mat, 'rèn ST 3 lên ụ đang có tốc 9: buff không đổi, Anvil vẫn mất');
  ok(a.lo0 === 2 && a.lo2 === 4 && a.loHa === 4 && a.loTran === 14, '+★ tại chỗ: 2★ lo ' + a.lo0 + ' → +2★ lo ' + a.lo2 + ' · hạ sao lo ' + a.loHa + ' · trần ' + a.loTran);
  const co = await p.evaluate(() => {
    const B = G.ban[0], X = B.t[7]; X.anv = { k: 'dmg', v: 0.12, lo: 4, x: { k: 'toc', v: 0.08 } };
    const DBo = typeof DONGBO !== 'undefined' ? DONGBO : typeof DB !== 'undefined' ? DB : typeof ONS !== 'undefined' ? ONS : null; if (!DBo || !DBo.oTT) return null;
    const f = DBo.oTT(X); B.t[7] = null; DBo.datO(B, 7, f); const m = B.t[7].anv; DBo.datO(B, 7, [f[0], f[1], 'b1x800;']); const cu = B.t[7].anv;
    return { f: f[2], moi: JSON.stringify(m), cu: JSON.stringify(cu) };
  });
  ok(co && /b0x1200;R4;T800;/.test(co.f) && /"lo":4/.test(co.moi) && /"x":\{"k":"toc","v":0.08\}/.test(co.moi) && /"k":"toc","v":0.08,"lo":4/.test(co.cu), 'cờ ô online: ' + JSON.stringify(co));
  // ---------- 3. STATIC JAMMER ----------
  const chay = () => p.evaluate(() => {
    const o = {}; UI.chon = ['lien', 'tia', 'set', 'radar', 'sungluc']; G.debug.seed = 4242; UI.che = 'solo'; batDau('solo', UI.chon, 'hero'); G.cho = 999; G.wave = 20;
    const B = G.ban[0], dat = (id, sao, o2) => { const T = sinhU(taoU(B, id, sao, o2)); B.t[o2] = T; return T; };
    B.t.fill(null); for (const [id, s, o2] of [['lien', 2, 0], ['lien', 2, 1], ['tia', 2, 2], ['tia', 2, 3], ['set', 3, 5], ['radar', 2, 6], ['radar', 2, 7], ['sungluc', 1, 8], ['set', 3, 9], ['lien', 2, 10], ['tia', 2, 11], ['radar', 2, 12], ['radar', 2, 13]]) dat(id, s, o2);
    const E = sinhTrum('jammer', 0, 50); const muc = TRUM_KN.jammer.chon(E, B, B.t.filter(Boolean)); TRUM_KN.jammer.lam(E, B, muc);
    o.muc = muc.map(T => T.id + T.o).join(); const [X, Y] = muc;
    for (let i = 0; i < 1200; i++) { XICH.buoc(B); for (const T of B.t) if (T && T.st.kep > 0) T.st.kep -= 1 / 60; } // 20 giây
    o.con20 = !!(X.xich && Y.xich && X.st.cam > 0 && X.st.kep > 0);
    const cung = B.t.find(T => T && T !== X && !T.xich && T.id === X.id && T.sao === X.sao);
    o.keoDi = hopLeGhep(X, cung); o.lamDich = hopLeGhep(cung, X); o.khacLoai = hopLeGhep(B.t.find(T => T && !T.xich && T.id !== X.id && T.id !== 'mimic' && T.sao === X.sao && T !== cung), X);
    const oX = X.o; ghep(B, cung, X); o.sauGhep = { moi: !!B.t[oX] && !B.t[oX].xich, y: !Y.xich && !(Y.st.cam > 0) && !(Y.st.kep > 0) };
    // trùm chết
    let m2 = TRUM_KN.jammer.chon(E, B, B.t.filter(Boolean)); TRUM_KN.jammer.lam(E, B, m2); o.lan2 = m2.length; E.chet = true; XICH.buoc(B); o.trumChet = m2.every(T => !T.xich && !(T.st.cam > 0));
    // xoá debuff 1 ụ → đứt cả cặp · ụ kia biến mất → đứt
    const E2 = sinhTrum('jammer', 0, 50); m2 = TRUM_KN.jammer.chon(E2, B, B.t.filter(Boolean)); TRUM_KN.jammer.lam(E2, B, m2); m2[0].st.kep = 0; XICH.buoc(B); o.xoa = m2.every(T => !T.xich);
    m2 = TRUM_KN.jammer.chon(E2, B, B.t.filter(Boolean)); TRUM_KN.jammer.lam(E2, B, m2); B.t[m2[0].o] = null; XICH.buoc(B); o.mat = !m2[1].xich;
    // máy tự gỡ
    m2 = TRUM_KN.jammer.chon(E2, B, B.t.filter(Boolean)); TRUM_KN.jammer.lam(E2, B, m2); const coCap = m2.some(b2 => B.t.some(a2 => a2 && a2 !== b2 && !a2.xich && hopLeGhep(a2, b2)));
    B.aiT = 0; aiBan(B, 1 / 60); o.ai = !coCap || m2.every(T => !T.xich || B.t[T.o] !== T); o.aiCoCap = coCap;
    return o;
  });
  const j = await chay(), j2 = await chay();
  ok(j.muc.split(',').length === 2 && /radar/.test(j.muc), 'JAM xích 2 ụ, ưu tiên hỗ trợ: ' + j.muc);
  ok(j.muc === j2.muc, 'tất định: cùng hạt → cùng ụ bị xích (' + j2.muc + ')');
  ok(j.con20, 'sau 20 giây xích vẫn còn (không tự hết)');
  ok(!j.keoDi && j.lamDich && !j.khacLoai, 'ụ bị xích: kéo đi ' + j.keoDi + ' · làm đích cho ụ cùng loại cùng sao ' + j.lamDich + ' · khác loại ' + j.khacLoai);
  ok(j.sauGhep.moi && j.sauGhep.y, 'ghép vào 1 ụ bị xích → đứt cả hai ' + JSON.stringify(j.sauGhep));
  ok(j.lan2 >= 1 && j.trumChet && j.xoa && j.mat, 'an toàn: trùm chết ' + j.trumChet + ' · xoá debuff 1 ụ → cả cặp ' + j.xoa + ' · ụ kia biến mất ' + j.mat);
  ok(j.ai, 'máy (aiBan) ưu tiên ghép gỡ xích (có cặp ghép được: ' + j.aiCoCap + ')');
  ok(!errs.length, 'không lỗi trang ' + errs.join(' | '));
  await b.close();
  console.log(loi ? '✗ đợt 12/11: ' + loi + ' lỗi' : '✓ QUESTS 3 thẻ / Twin Anvil / Static Jammer đạt');
  process.exit(loi ? 1 : 0);
})();
