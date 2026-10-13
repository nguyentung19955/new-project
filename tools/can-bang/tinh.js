#!/usr/bin/env node
// SOÁT CÂN BẰNG BẰNG SỐ LIỆU (đợt 4, docs/review/ke-hoach-cai-thien/he-thong-moi/YEU-CAU-4-RESET-CAN-BANG.md).
// KHÔNG chạy game: chỉ nạp game/js/data.js (bảng hằng số) + đọc các hằng số đòn của game/js/moves.js, rồi tính kỳ vọng.
// Chạy: node tools/can-bang/tinh.js            (in các bảng ra màn hình; mục 6: ép đồ + ải ngày, đợt 6)
//       node tools/can-bang/tinh.js --json     (in số liệu thô dạng JSON)
// Mô hình người chơi: chơi lần lượt 15 ải; chưa đủ 90% Sức mạnh khuyên dùng (G.STAGE_REC) thì chơi lại ải cao nhất đã qua để cày.
// Mỗi lượt cộng phần thưởng KỲ VỌNG (tỉ lệ × giá trị). Tiêu: điểm kỹ năng, linh khí (vũ khí chính trước, rồi vũ khí phụ),
// vàng / quặng / nguyên liệu (nâng lò, mài vũ khí chính rồi phụ). Không tính kỹ năng tay người chơi, chỉ là thước đo so sánh.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const GOC = process.env.LK_GOC || path.join(__dirname, '..', '..', 'game', 'js'); // LK_GOC=thư mục js khác (so bản cũ)
const ctx = { window: {}, location: { search: '' }, console, Math };
ctx.window.G = undefined;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(GOC, 'data.js'), 'utf8'), ctx);
const G = ctx.window.G;
const JSON_OUT = process.argv.includes('--json');
// Thử số khác không sửa tệp: --dat LVL_HP=0.06 --dat 'STAGE_MULT=[1,1.2,1.45,1.75]' (đặt đè lên G sau khi nạp data.js)
process.argv.forEach((a, k, all) => { if (a === '--dat' && all[k + 1]) { const m = /^([A-Z_]+)=(.*)$/.exec(all[k + 1]); if (m) G[m[1]] = JSON.parse(m[2]); } });

// ---------- hằng số đòn (chép từ game/js/moves.js G.MOVES; script đọc thẳng tệp để không lệch) ----------
const mv = fs.readFileSync(path.join(GOC, 'moves.js'), 'utf8');
function chuoi(loai) { // dur, mult của chuỗi đòn thường
  const i = mv.indexOf('\n    ' + loai + ': {');
  const j = mv.indexOf('chain: [', i), k = mv.indexOf('],', j);
  const ds = [...mv.slice(j, k).matchAll(/dur: ([\d.]+), mult: ([\d.]+)/g)].map((m) => [+m[1], +m[2]]);
  return ds;
}
const DON = {
  sword: chuoi('sword'),
  spear: chuoi('spear'),
  hammer: [[0.8, 1]],
  bow: [[0.38, 1]],
};
const TAM = { sword: 'cận 32-40', spear: 'cận 60-62 (quét 44)', hammer: 'cận 32, choáng 0,4', bow: 'xa 180 (mạnh 250)' };
const CHEO = { sword: 1.0, spear: 1.6, hammer: 1.4, bow: 1.35 }; // hệ số đánh cụm ước lượng (quét vòng, nện rộng, tên xuyên 0,35)

// ---------- 1. ĐỒ / VŨ KHÍ ----------
function dpsGoc(t) { const d = DON[t]; const tg = d.reduce((a, x) => a + x[0], 0), m = d.reduce((a, x) => a + x[1], 0); return { moiGiay: m / tg, nhat: m / d.length }; }
function bang1() {
  const ds = [];
  for (const t of G.VK_MOI.loai) {
    const q = dpsGoc(t), dmg = G.WTYPES[t].dmg;
    const hang = { loai: G.WTYPES[t].name, dmg, tam: TAM[t], nhatTB: +(dmg * q.nhat).toFixed(1), dps: [] };
    for (let st = 0; st < 4; st++) hang.dps.push(+(dmg * q.moiGiay * G.STAGE_MULT[st]).toFixed(1));
    ds.push(hang);
  }
  const tb = ds.reduce((a, h) => a + h.dps[0], 0) / ds.length;
  for (const h of ds) h.lech = Math.round((h.dps[0] / tb - 1) * 100);
  return { ds, tb: +tb.toFixed(1) };
}

// ---------- số quái mỗi ải (chép luật buildWaves của game/js/stage.js, lấy trung bình 4000 lần) ----------
function soQuai(r, i) {
  const B = G.ROOM_WAVES, late = i >= 3;
  const roles = ['rusher', 'swarm', 'archer', 'kami'];
  if (i >= 1 || r > 0) roles.push('shield', 'spiky');
  if (i >= 2 || r > 0) roles.push('nimble', 'bomber');
  const cost = { rusher: 1, swarm: 1.3, archer: 1, shield: 1.5, nimble: 1.2, kami: 0.9, bomber: 1.2, spiky: 1.2 };
  let seed = 12345 + r * 7 + i;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const wave = (elite) => {
    let pts = (3 + Math.min(1.5, i * 0.4) + r * 0.5) * (late ? B.ptsLate : B.pts), n = 0;
    if (elite) pts -= 2.5;
    const list = [];
    for (let g = 0; g < 30 && pts > 0.9 && list.length < B.maxPerWave; g++) {
      const ro = roles[Math.floor(rnd() * roles.length)];
      if (cost[ro] > pts + 0.3 || ((ro === 'swarm' || ro === 'kami' || ro === 'bomber') && list.includes(ro))) continue;
      list.push(ro); pts -= cost[ro]; n++;
    }
    return n || 1;
  };
  let tong = 0; const N = 4000;
  for (let k = 0; k < N; k++) {
    const nStart = i >= 2 ? B.start[1] : B.start[0], nRoom = late ? B.late : B.early;
    for (let w = 0; w < nStart; w++) tong += wave(false);
    for (let w = 0; w < nRoom * 2; w++) tong += wave(false);
    for (let w = 0; w < nRoom; w++) tong += wave(w === nRoom - 1);
  }
  return tong / N;
}

// ---------- Sức mạnh (chép G.powerParts của game/js/combat.js, chỉ phần số) ----------
const SK_THU = ['atk', 'def', 'atk', 'atk', 'atk', 'atk', 'def', 'def', 'def', 'def', 'elem', 'elem', 'elem', 'elem', 'elem'];
function nguoi(p) {
  const sk = { atk: 0, def: 0, elem: 0 };
  for (let k = 0; k < Math.min(SK_THU.length, Math.floor(p.lvl / 3)); k++) sk[SK_THU[k]]++;
  let maxhp = 100 * (1 + G.LVL_HP * (p.lvl - 1)); if (sk.def >= 1) maxhp *= 1.1;
  const drNT = p.hoc.wrestler ? G.ZED_DAY.wrestler.dr : 0;
  const dmgMult = 1 + (sk.atk >= 1 ? 0.08 : 0) + (sk.atk >= 4 ? 0.08 : 0), crit = sk.atk >= 5 ? 0.1 : 0;
  const fav = ['sword', 'hammer'].concat(p.hoc.hunter ? ['bow'] : [], p.hoc.healer ? ['spear'] : []);
  const don = (t) => { const w = p.vk[t]; return G.WTYPES[t].dmg * G.STAGE_MULT[w.st] * (1 + 0.08 * w.sh) * (1 + G.LVL_DMG * (p.lvl - 1)) * dmgMult * (fav.includes(t) ? 1.1 : 1); };
  const offs = ['sword', 'bow'].map((t) => (don(t) / G.WTYPES[t].dmg) * 10).sort((a, b) => b - a);
  let off = offs[0] * 0.75 + offs[1] * 0.25;
  off *= 1 + crit; off *= 1 + 0.004 * Math.min(p.lvl, 28);
  const res = sk.def >= 4 ? 0.3 : 0, dr = (sk.def >= 5 ? 0.1 : 0) + drNT;
  const ehp = (Math.round(maxhp) / (1 - Math.min(0.75, dr - drNT / 2))) * (1 + 0.25 * res);
  return { power: Math.round(3 * Math.sqrt(off * ehp)), maxhp: Math.round(maxhp), dr, don, sk, crit };
}

// ---------- 4 + 5. thu nhập mỗi lượt (kỳ vọng) ----------
function thuNhap(n, p, dau) {
  const r = Math.floor(n / 5), i = n % 5, big = i === 4, b = G.stageStats(r, i, 0), R = G.ROI_MOI;
  const kills = soQuai(r, i) - 1; // trừ tinh anh
  const rec = G.STAGE_REC[n], gm = G.grindMult(p.power, rec);
  const lkT = p.vk.sword.st > 0 ? 0.35 : 0.1; // phần quái thường gục khi đang dính hệ của vũ khí (ước lượng)
  const tut = n === 0 && dau ? 2 : 1;        // ải hướng dẫn 1-1 lần đầu: dấu ấn x2 (và Lửa x2)
  const mk = 1.2;                            // Zed nhận linh khí nhanh hơn 20%
  // quặng: 3 + sao (tính 2) + 2 × vùng; đá tôi cũ (15% ải thường, ba sao lần đầu ~30%) nay là G.DA_TOI_QUANG quặng
  const o = { xp: b.xp * gm, vang: (b.gold + kills * 2) * gm, quang: 3 + 2 + 2 * r + ((big ? 0 : 0.15) + (dau ? 0.3 : 0)) * (G.DA_TOI_QUANG || 0), nl: 5 + i, manh: big ? 3 : 0, lk: 0, nguon: {} };
  const them = (k, lk, vang) => { o.lk += lk; o.vang += vang || 0; o.nguon[k] = { lk: +(lk).toFixed(1), vang: Math.round(vang || 0) }; };
  them('tinh anh gục', 5 * mk * tut * (n === 0 && dau ? 2 : 1), 0);
  them('tinh anh thưởng 35%', G.DROP.elite * R.vk.lk[r], G.DROP.elite * R.vk.vang[r]);
  them(big ? 'trùm vùng gục' : 'trùm nhỏ gục', (big ? 20 : 10) * mk * tut * (n === 0 && dau ? 2 : 1), 0);
  if (big) them('thưởng trùm vùng', dau ? R.trum.lkDau : R.trum.lk, (dau ? R.trum.vangDau : R.trum.vang) + R.aoTrumVung);
  else them('thưởng qua ải 50%', G.DROP.stage * R.vk.lk[r], G.DROP.stage * R.vk.vang[r] + 0.35 * R.aoTrum.vang[r]);
  them('rương báu (chọn linh khí)', R.ruong.lk[r], 0);
  them('kết liễu quái dính hệ', kills * lkT * mk * tut, 0);
  them('quần áo cũ → vàng', 0, (0.012 * kills + 0.12) * R.ao.vang[r] + 0.25 * R.bua);
  them('phòng thử thách (1/3)', 0, 80 / 3); o.quang += 6 / 3;
  return o;
}

// ---------- mô phỏng chiến dịch ----------
function chienDich(o) {
  o = o || {};
  const p = { lvl: 1, xp: 0, vang: 0, quang: 0, nl: [0, 0, 0], manh: [0, 0, 0], lk: 0, lkTong: 0, lo: 1, hoc: {}, vk: { sword: { st: 0, sh: 0 }, bow: { st: 0, sh: 0 }, spear: { st: 0, sh: 0 }, hammer: { st: 0, sh: 0 } }, bo: { ninja: 0 }, power: 98, luot: 0, vangTong: 0 };
  const muaBo = (k, cap) => { // nâng bộ k từ cap lên cap + 1 nếu đủ (linh khí, vàng, mảnh trùm của vùng bộ)
    const g = G.BO_MOI.gia[cap], vm = (G.BO_MOI.vungManh || {})[k] | 0;
    if (!g || p.lk < g.lk || p.vang < g.vang || p.manh[vm] < (g.manh | 0)) return false;
    p.lk -= g.lk; p.vang -= g.vang; p.manh[vm] -= g.manh | 0; p.bo[k] = cap + 1;
    moc['bộ ' + k + ' cấp ' + (cap + 1)] = moc['bộ ' + k + ' cấp ' + (cap + 1)] || { luot: p.luot, ai: ds.length + 1 };
    return true;
  };
  const thuTuVk = o.motMon ? [['sword', 1], ['sword', 2], ['sword', 3], ['bow', 1], ['bow', 2], ['bow', 3]] : [['sword', 1], ['bow', 1], ['sword', 2], ['bow', 2], ['sword', 3], ['bow', 3]];
  const ds = [], moc = {};
  const tieu = () => {
    // linh khí: bộ cấp 1 khi vừa mở (nếu o.bo) rồi vũ khí
    if (o.bo) for (const k of ['rung', 'bien', 'lau']) if (p.bo[k] === 0) muaBo(k, 0);
    for (const [t, st] of thuTuVk) {
      const w = p.vk[t];
      if (w.st >= st) continue;
      const c = G.VK_MOI.gia[w.st];
      if (p.lk < c) break;
      p.lk -= c; w.st++;
      const ten = t + ' ' + G.STAGE_NAMES[w.st];
      if (!moc[ten]) moc[ten] = { luot: p.luot, ai: ds.length + 1, lkTong: Math.round(p.lkTong) };
    }
    // o.bo: sau vũ khí, nâng tiếp bộ đang mặc (bộ mới nhất đã mở) lên cấp 2, 3
    if (o.bo) { const k = ['lau', 'bien', 'rung', 'ninja'].find((x) => p.bo[x] != null); if (p.bo[k] >= 1) muaBo(k, p.bo[k]); }
    // lò + mài
    for (let g = 0; g < 50; g++) {
      const up = G.FORGE_UP[p.lo];
      const t = p.vk.sword.sh <= p.vk.bow.sh + 1 ? 'sword' : 'bow', w = p.vk[t];
      if (w.sh >= G.FORGE_CAP[p.lo]) {
        if (!up || p.vang < up.gold || p.quang < (up.ore || 0) || up.mat.some((m, i) => p.nl[i] < m)) break;
        p.vang -= up.gold; p.quang -= up.ore || 0; up.mat.forEach((m, i) => { p.nl[i] -= m; }); p.lo++;
        continue;
      }
      if (w.sh >= G.MAX_SHARPEN) break;
      const c = G.sharpenFull(w.sh);
      if (p.vang < c.gold || p.quang < c.ore || c.mat.some((m, i) => p.nl[i] < m)) break;
      p.vang -= c.gold; p.quang -= c.ore; c.mat.forEach((m, i) => { p.nl[i] -= m; }); w.sh++;
    }
  };
  const choi = (n, dau) => {
    const q = thuNhap(n, p, dau);
    p.luot++;
    p.xp += q.xp; while (p.lvl < G.MAX_LEVEL && p.xp >= G.xpNeed(p.lvl)) { p.xp -= G.xpNeed(p.lvl); p.lvl++; }
    p.vang += q.vang; p.vangTong += q.vang; p.quang += q.quang; p.nl[Math.floor(n / 5)] += q.nl; p.manh[Math.floor(n / 5)] += q.manh;
    p.lk += q.lk; p.lkTong += q.lk;
    if (dau && n % 5 === 4) { const k = G.REGIONS[Math.floor(n / 5)].rescue; p.hoc[k] = 1; p.bo[['rung', 'bien', 'lau'][Math.floor(n / 5)]] = 0; }
    tieu();
    p.power = nguoi(p).power;
    return q;
  };
  for (let n = 0; n < 15; n++) {
    const rec = G.STAGE_REC[n];
    let cay = 0;
    while (p.power < rec * (o.nguong || 0.9) && n > 0 && cay < 30) { choi(n - 1, false); cay++; }
    const vao = { ai: (Math.floor(n / 5) + 1) + '-' + (n % 5 + 1), rec, power: p.power, lvl: p.lvl, cay, sword: G.STAGE_NAMES[p.vk.sword.st] + ' +' + p.vk.sword.sh, bow: G.STAGE_NAMES[p.vk.bow.st] + ' +' + p.vk.bow.sh, lkTong: Math.round(p.lkTong), lo: p.lo };
    const q = choi(n, true);
    vao.lkLuot = Math.round(q.lk); vao.vangLuot = Math.round(q.vang);
    vao.sauLk = Math.round(p.lk); vao.sauVang = Math.round(p.vang); vao.nl = p.nl.map(Math.round); vao.manh = p.manh.slice();
    ds.push(vao);
  }
  return { ds, moc, p };
}

// ---------- 2. CHỈ SỐ: số đòn ----------
function bang2(cd) {
  const ra = [];
  for (const v of cd.ds) {
    const n = cd.ds.indexOf(v), r = Math.floor(n / 5), i = n % 5, b = G.stageStats(r, i, 0);
    const p = { lvl: v.lvl, hoc: {}, vk: { sword: { st: G.STAGE_NAMES.indexOf(v.sword.split(' +')[0]), sh: +v.sword.split(' +')[1] }, bow: { st: G.STAGE_NAMES.indexOf(v.bow.split(' +')[0]), sh: +v.bow.split(' +')[1] }, spear: { st: 0, sh: 0 }, hammer: { st: 0, sh: 0 } } };
    for (let k = 0; k < r; k++) p.hoc[G.REGIONS[k].rescue] = 1;
    const ng = nguoi(p), d = ng.don('sword') * (1 + ng.crit);
    const big = i === 4, bossHp = b.hp * (big ? G.BOSS_HP_OF[G.REGIONS[r].boss] : G.MINI_HP) * b.bossHp;
    const nhan = (x) => x * (1 - Math.min(0.75, ng.dr));
    ra.push({ ai: v.ai, lvl: v.lvl, mau: ng.maxhp, don: +d.toFixed(1), quaiMau: Math.round(b.hp), danhQuai: Math.ceil(b.hp / d), danhTinhAnh: Math.ceil(b.hp * 5 / d), danhTrum: Math.ceil(bossHp / d), trumMau: Math.round(bossHp),
      quaiDanh: Math.ceil(ng.maxhp / nhan(b.dmg)), tinhAnhDanh: Math.ceil(ng.maxhp / nhan(b.dmg * 1.3)), trumDanh: Math.ceil(ng.maxhp / nhan(b.dmg * b.bossDmg)), trumDon: Math.round(b.dmg * b.bossDmg) });
  }
  return ra;
}


// ---------- 6. ÉP ĐỒ + ẢI NGÀY (đợt 6, YEU-CAU-6-EP-DO-AI-NGAY.md; bảng G.EP_DO, G.AI_NGAY) ----------
// Mô phỏng Monte Carlo (hạt giống cố định) đúng luật js/ep_do.js: mỗi lần ép mất đá + vàng (+ mảnh); tỉ lệ G.EP_DO.tiLe + điểm may mắn
// (mỗi lần hỏng +mayMan cho lần ép lên đúng bậc đó, thành công về 0); ép lên bậc >= tutTu hỏng thì tụt 1 bậc (trừ khi dùng bùa).
function epDo(o) {
  o = o || {};
  const E = G.EP_DO, N = o.n || 20000;
  let sd = 12345;
  const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  const ra = [];
  for (let dich = 1; dich <= 6; dich++) {
    let da = 0, vang = 0, manh = 0, lan = 0, bua = 0;
    for (let k = 0; k < N; k++) {
      let b = 0; const may = {};
      while (b < dich) {
        const t = b + 1, g = E.gia[t];
        da += g.da; vang += g.vang; manh += g.manh ? g.manh.reduce((a, x) => a + x, 0) : 0; lan++;
        if (rnd() < Math.min(1, E.tiLe[t] + (may[t] || 0))) { b = t; may[t] = 0; }
        else { may[t] = (may[t] || 0) + E.mayMan; if (t >= E.tutTu) { if (o.bua) bua++; else b--; } }
      }
    }
    ra.push({ bac: E.ten[dich], da: +(da / N).toFixed(1), vang: Math.round(vang / N), manh: +(manh / N).toFixed(1), lan: +(lan / N).toFixed(1), bua: +(bua / N).toFixed(1) });
  }
  return ra;
}
// Đá mỗi tuần và vàng / quặng của ải ngày so với một lượt ải thường cùng vùng (thuNhap, chơi lại, không tính lần đầu)
function aiNgay(o) {
  o = o || {};
  const A = G.AI_NGAY, R = G.EP_DO.roi, luotThuong = o.luotThuong || 20; // lượt ải thường mỗi tuần (cày lại, 1/5 là ải trùm vùng)
  const ngay = (loai) => A.ai[loai].thu.length * A.luot;               // lượt / tuần của một ải
  const muc = [0, 1, 2].map((k) => {
    const tn = [0, 1, 2, 3, 4].map((i) => thuNhap(k * 5 + i, { power: G.STAGE_REC[k * 5 + i], vk: { sword: { st: 2 } } }, false));
    const vangTB = tn.reduce((a, q) => a + q.vang, 0) / 5, quangTB = tn.reduce((a, q) => a + q.quang, 0) / 5;
    const daTrum = luotThuong * (0.8 * R.mini[k] + 0.2 * R.vung[k]);
    const daAi = ngay('da') * A.ai.da.thuong.da[k];
    return {
      muc: A.muc[k], vung: G.REGIONS[k].name,
      vangAi: A.ai.vang.thuong.vang[k], vangThuong: Math.round(vangTB), vangTiLe: +(A.ai.vang.thuong.vang[k] / vangTB).toFixed(2),
      quangAi: A.ai.mai.thuong.quang[k], quangThuong: +quangTB.toFixed(1), quangTiLe: +(A.ai.mai.thuong.quang[k] / quangTB).toFixed(2),
      daAiTuan: daAi, daTrumTuan: Math.round(daTrum), daTuan: Math.round(daAi + daTrum),
      buaTuan: +(ngay('da') * (A.ai.da.thuong.bua[k] || 0) + luotThuong * 0.2 * G.EP_DO.bua.trumVung).toFixed(1),
    };
  });
  return { muc, luotNgay: { da: ngay('da'), mai: ngay('mai'), vang: ngay('vang') }, luotThuong };
}

if (require.main === module) {
  const b1 = bang1(), cd = chienDich(), cd1 = chienDich({ motMon: true }), cdBo = chienDich({ bo: true }), b2 = bang2(cd);
  if (JSON_OUT) { console.log(JSON.stringify({ b1, cd, cd1, cdBo, b2 }, null, 1)); process.exit(0); }
  const pad = (s, n) => String(s).padEnd(n);
  console.log('== 1. VŨ KHÍ: sát thương mỗi giây chuỗi đòn thường (đơn mục tiêu), cấp hero 1, mài +0 ==');
  console.log(pad('Loại', 10), pad('đòn gốc', 8), pad('nhát TB', 8), pad('Trắng', 7), pad('Mầm', 7), pad('T.hình', 7), pad('T.tỉnh', 7), pad('lệch TB', 8), 'tầm');
  for (const h of b1.ds) console.log(pad(h.loai, 10), pad(h.dmg, 8), pad(h.nhatTB, 8), ...h.dps.map((x) => pad(x, 7)), pad((h.lech > 0 ? '+' : '') + h.lech + '%', 8), h.tam);
  console.log('Trung bình Trắng:', b1.tb, '| hệ số cụm ước lượng:', JSON.stringify(CHEO));
  console.log('\n== 2+4. CHIẾN DỊCH (vũ khí chính kiếm, phụ phi tiêu; nâng xen kẽ) ==');
  console.log(pad('ải', 5), pad('cày', 4), pad('cấp', 4), pad('SM', 5), pad('KD', 5), pad('kiếm', 16), pad('phi tiêu', 16), pad('lò', 3), pad('LK tổng', 8), pad('LK/lượt', 8), pad('vàng/lượt', 9), 'vàng dư, LK dư, NL, mảnh');
  for (const v of cd.ds) console.log(pad(v.ai, 5), pad(v.cay, 4), pad(v.lvl, 4), pad(v.power, 5), pad(v.rec, 5), pad(v.sword, 16), pad(v.bow, 16), pad(v.lo, 3), pad(v.lkTong, 8), pad(v.lkLuot, 8), pad(v.vangLuot, 9), v.sauVang, v.sauLk, v.nl.join('/'), v.manh.join('/'));
  console.log('Mốc (xen kẽ):', JSON.stringify(cd.moc));
  console.log('Mốc (dồn 1 món):', JSON.stringify(cd1.moc));
  console.log('Mốc (mua bộ cấp 1 trước):', JSON.stringify(cdBo.moc));
  console.log('Tổng lượt:', cd.p.luot, '| vàng tổng', Math.round(cd.p.vangTong));
  console.log('\n== 2. SỐ ĐÒN (đòn kiếm thường của Zed lúc vào ải; quái đánh = đòn gốc, chưa tính kỹ năng/né) ==');
  console.log(pad('ải', 5), pad('cấp', 4), pad('máu', 5), pad('đòn', 6), pad('quái', 5), pad('tinh anh', 9), pad('trùm', 6), '| quái hạ Zed / tinh anh / trùm (đòn trùm)');
  for (const v of b2) console.log(pad(v.ai, 5), pad(v.lvl, 4), pad(v.mau, 5), pad(v.don, 6), pad(v.danhQuai, 5), pad(v.danhTinhAnh, 9), pad(v.danhTrum, 6), '|', v.quaiDanh, '/', v.tinhAnhDanh, '/', v.trumDanh, '(' + v.trumDon + ')');
  const tn = thuNhap(4, { power: 200, vk: { sword: { st: 1 } } }, true);
  console.log('\n== 5. NGUỒN mỗi lượt (ải 1-5 lần đầu) ==');
  console.log(JSON.stringify(tn.nguon));
  // 6. ép đồ + ải ngày
  const ep = epDo(), epB = epDo({ bua: true }), an = aiNgay();
  console.log('\n== 6. ÉP ĐỒ: kỳ vọng để đưa MỘT vũ khí từ Bậc Trắng lên bậc (cộng dồn, có điểm may mắn; không bùa | luôn dùng bùa) ==');
  console.log(pad('bậc', 10), pad('đá', 7), pad('vàng', 7), pad('mảnh', 6), pad('lần ép', 7), '| có bùa: đá, vàng, lần ép, bùa tốn');
  ep.forEach((v, k) => console.log(pad(v.bac, 10), pad(v.da, 7), pad(v.vang, 7), pad(v.manh, 6), pad(v.lan, 7), '|', epB[k].da, epB[k].vang, epB[k].lan, epB[k].bua));
  console.log('\n== 6. ẢI NGÀY: lượt/tuần', JSON.stringify(an.luotNgay), '| giả định', an.luotThuong, 'lượt ải thường/tuần (cày lại, 1/5 ải trùm vùng) ==');
  console.log(pad('mức', 5), pad('vùng', 11), pad('vàng ải', 8), pad('vàng thường', 12), pad('×', 5), pad('quặng ải', 9), pad('quặng thường', 13), pad('×', 5), pad('đá ải/t', 8), pad('đá trùm/t', 10), pad('đá/tuần', 8), pad('bùa/t', 6), 'tuần lên Tím | Rực lửa (1 món)');
  const tim = ep[3].da, ruc = ep[5].da;
  for (const v of an.muc) console.log(pad(v.muc, 5), pad(v.vung, 11), pad(v.vangAi, 8), pad(v.vangThuong, 12), pad(v.vangTiLe, 5), pad(v.quangAi, 9), pad(v.quangThuong, 13), pad(v.quangTiLe, 5), pad(v.daAiTuan, 8), pad(v.daTrumTuan, 10), pad(v.daTuan, 8), pad(v.buaTuan, 6), (tim / v.daTuan).toFixed(2), '|', (ruc / v.daTuan).toFixed(1), '(4 món:', (4 * ruc / v.daTuan).toFixed(1) + ')');
}
module.exports = { G, bang1, chienDich, bang2, thuNhap, soQuai, nguoi, epDo, aiNgay };
