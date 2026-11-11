// TURRET MERGE — MÔ PHỎNG 1 ụ Crimson Sting (bocap) 7★ SỐNG 10 PHÚT (11/11, lên bậc Đỏ): STING theo thời gian + ST/giây.
//   node tools/thap-do-bocap.js [T=600] [hat=4242,777,31337] [sao=7] [w=60] [lv=5] [cap=0]     (SUA='KY_NANG_CAP.bocap.base = 16;' vá thử)
// Cách đo như tools/thap-can-bang-so.js (nạp code game thật bằng vm, bước 1/30 s, RNG có hạt): wave w, power-up lv, cấp thẻ = cấp đầu bậc + cap;
//   1 Trùm thật luôn có mặt (chết → trùm mới, không tung chiêu) + quái thường máu ×4 (tối đa 10); quái tới cuối đường quay lại đầu.
//   Bọ cạp ở ô 7 (giữa bàn). 2 bàn: (a) KHÔNG hỗ trợ · (b) Crit Antenna (ô 6) + Hammer (ô 8) + Focus Lens (ô 2) kề, cùng sao.
//   KHÔNG giữ STING cố định: để ụ tự tích từ 0 (chí mạng thật bằng rngLuat). In STING ở 1/2/5/10 phút, ST/giây trung bình từng đoạn.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { taoMoiTruong: taoGoc, R } = require('./thap-sim-vaitro.js');
const a = process.argv.slice(2), lay = (k, d) => { const x = a.find(s => s.startsWith(k + '=')); return x ? x.slice(k.length + 1) : d; };
const TT = +lay('T', 600), HAT = lay('hat', '4242,777,31337').split(',').map(Number), SAO = +lay('sao', 7), W = +lay('w', 60), LV = +lay('lv', 5), CAP = +lay('cap', 0);
function chay(hat, ke) {
  const ctx = taoGoc(hat);
  vm.runInContext("if (typeof SUP === 'undefined') { var SUP = {}, SUP_LOAI = {}, SUP_GIA = {}; }", ctx);
  for (const f of ['vangmoi1', 'skills7', 'jackpot']) { const p = path.join(__dirname, '..', 'thap', 'js', f + '.js'); if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f + '.js' }); }
  if (process.env.SUA) R(ctx, process.env.SUA);
  return JSON.parse(R(ctx, `(function () {
    const _lot = lot; lot = function (E) { E.s = 0; };
    let tong = 0; const _tr = trung; trung = function (E, d, o) { const h = Math.max(0, E.hp), c = E.chet, T = o && o.T !== undefined ? o.T : G.dangBan; const r = _tr(E, d, o); if (!c && T && T.id === 'bocap') tong += Math.min(h, Math.max(0, h - Math.max(0, E.hp))); return r; };
    const deck = ['bocap'].concat(${JSON.stringify(ke.map(x => x[1]))}); for (const d of ['lien', 'set', 'tia', 'mana']) if (deck.length < 5) deck.push(d);
    G.debug = { auto: false }; batDau('solo', deck, 'hero'); G.cho = 1e9; G.wave = ${W};
    const B = G.ban[0]; B.tim = 1e9; B.mana = 0; B.capThe = {}; B.lv = B.lv || {};
    for (const id of deck) { B.lv[id] = SKILLS[id].khongNang ? 1 : ${LV}; B.capThe[id] = ${CAP}; }
    for (let o = 0; o < 15; o++) B.t[o] = null;
    const dat = (o, id) => { const T = taoU(B, id, ${SAO}, o); sinhU(T); B.t[o] = T; return T; };
    const S = dat(7, 'bocap'); for (const [o, id] of ${JSON.stringify(ke)}) dat(o, id);
    const ds = taoWave(${W} - 1, rngHat(7)).ds, rq = rngHat(${hat}), dt = 1 / 30, moc = [60, 120, 300, 600].filter(x => x <= ${TT}), ra = []; let i = 0, t0 = 0, d0 = 0;
    for (let t = 0; t < ${TT} + 1e-6; t += dt, i++) {
      if (i % 15 === 0) { let n = 0, tr = false; for (const E of G.quai) if (!E.chet) { if (E.trum) tr = true; else n++; }
        if (!tr) { const E = sinhTrum(TRUM_THU_TU[0], 0, 1); E.vao = 1; E.knT = 1e9; }
        if (n < 10) { const Q = sinhQuai(ds[Math.floor(rq() * ds.length)], 0, 0, 4); Q.vao = 1; }
        B.tim = 1e9; for (const T of B.t) if (T) { T.st.da = false; T.st.bang = 0; T.st.lua = 0; T.st.kep = 0; } }
      for (const E of G.quai) if (E.trum) E.knT = 1e9;
      capNhat(dt);
      if (window._cho.length) { const q = window._cho.splice(0); for (const f of q) { try { f(); } catch (e) { } } }
      if (moc.length && t + dt >= moc[0]) { const m = moc.shift(); ra.push({ t: m, sting: S.sting | 0, dps: Math.round((tong - d0) / (m - t0)), toc: +tocU(S).toFixed(2), dmg: Math.round(dmgU(S)), crit: +(critU ? critU(S) : 0).toFixed(3) }); t0 = m; d0 = tong; }
    }
    return JSON.stringify({ ra, tb: Math.round(tong / ${TT}), con: B.t[7] === S });
  })()`));
}
const BO = { 'không hỗ trợ': [], 'Crit Antenna + Hammer + Focus Lens kề': [[6, 'chimang'], [8, 'bua'], [2, 'thaukinh']] };
for (const ten in BO) {
  const kq = HAT.map(h => chay(h, BO[ten])), n = kq.length, tb = (f) => kq.reduce((s, k) => s + f(k), 0) / n;
  console.log('== ' + ten + ' (' + SAO + '★, wave ' + W + ', power-up ' + LV + ', cấp thẻ +' + CAP + ', ' + n + ' hạt)');
  kq[0].ra.forEach((_, j) => console.log('  ' + String(kq[0].ra[j].t / 60).padStart(4) + ' phút: STING ' + Math.round(tb(k => k.ra[j].sting)) + ' · ST/giây đoạn này ' + Math.round(tb(k => k.ra[j].dps)).toLocaleString('en') + ' · đòn ' + Math.round(tb(k => k.ra[j].dmg)).toLocaleString('en') + ' · tốc ' + tb(k => k.ra[j].toc).toFixed(2) + '/s · chí mạng ' + Math.round(tb(k => k.ra[j].crit) * 100) + '%'));
  console.log('  ST/giây trung bình cả ' + TT + ' s: ' + Math.round(tb(k => k.tb)).toLocaleString('en'));
}
