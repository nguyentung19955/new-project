#!/usr/bin/env node
// SOÁT CÂN BẰNG BẰNG SỐ LIỆU (đợt 4, docs/review/ke-hoach-cai-thien/he-thong-moi/YEU-CAU-4-RESET-CAN-BANG.md).
// KHÔNG chạy game: chỉ nạp game/js/data.js (bảng hằng số) + đọc các hằng số đòn của game/js/moves.js, rồi tính kỳ vọng.
// Chạy: node tools/can-bang/tinh.js            (in các bảng ra màn hình; mục 6: ép đồ + ải ngày, đợt 6)
//       14/10 (bước 1 làm chắc, mục 5): chiến dịch mặc định tính cả ép đồ (đá từ trùm), ải ngày (8 lượt = 1 ngày), mua quặng ở Bà Hàng Xén,
//       skill bộ trong Sức mạnh (js/bo_skill.js G.boSk.quyDoi); dòng "So luật cũ" in kết quả khi tắt ba thứ đầu.
//       node tools/can-bang/tinh.js --json     (in số liệu thô dạng JSON)
//       15/10 (Bước 2 Phiên E): mục 7 so chiến dịch có / không Việc hôm nay + Sổ yêu quái + Thành tựu; --khong-buoc2 tắt ba hệ ở mọi bảng,
//       --b2-goc dùng số thưởng gốc (?thuongb2=goc).
// Mô hình người chơi: chơi lần lượt 15 ải; chưa đủ 90% Sức mạnh khuyên dùng (G.STAGE_REC) thì chơi lại ải cao nhất đã qua để cày.
// Mỗi lượt cộng phần thưởng KỲ VỌNG (tỉ lệ × giá trị). Tiêu: điểm kỹ năng, linh khí (vũ khí chính trước, rồi vũ khí phụ),
// vàng / quặng / nguyên liệu (nâng lò, mài vũ khí chính rồi phụ). Không tính kỹ năng tay người chơi, chỉ là thước đo so sánh.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const GOC = process.env.LK_GOC || path.join(__dirname, '..', '..', 'game', 'js'); // LK_GOC=thư mục js khác (so bản cũ)
// 15/10 Bước 2 Phiên E: --b2-goc → nạp data.js với ?thuongb2=goc (số thưởng ba hệ gốc của Phiên A / B / C, trước khi Phiên E chỉnh)
// 16/10 Luyện vũ khí: data.js nạp với ?luyen=0&tutbac=1 → mọi bảng cũ (mục 1–7) giữ đúng luật cũ như trước (cấp hệ + mài + lò + ép có tụt bậc);
// chiến dịch luật Luyện (G.LUYEN, cùng tệp data.js): --luyen (mục 8).
const ctx = { window: {}, location: { search: (process.argv.includes('--b2-goc') ? '?thuongb2=goc&' : '?') + 'luyen=0&tutbac=1' }, console, Math };
ctx.window.G = undefined;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(GOC, 'data.js'), 'utf8'), ctx);
const G = ctx.window.G;
// 14/10 (bước 1 làm chắc, mục 5): nạp thêm js/bo_skill.js để dùng đúng bảng quy đổi skill bộ → Sức mạnh (G.boSk.quyDoi, mục 2)
try { vm.runInContext(fs.readFileSync(path.join(GOC, 'bo_skill.js'), 'utf8'), ctx); } catch (e) { /* bản cũ không có: bỏ qua phần skill bộ */ }
const quyBo = (bo, cap) => (G.boSk && G.boSk.quyDoi && G.boSkill ? G.boSk.quyDoi({ boSkill: G.boSkill(bo, cap) }) : { off: 1, ehp: 1 });
const JSON_OUT = process.argv.includes('--json');
const LUYEN_CD = process.argv.includes('--luyen'); // 16/10: chỉ in mục 8 (chiến dịch luật Luyện so luật cũ)
// 15/10 Bước 2 Phiên E (mục 7): --khong-buoc2 → mọi chiến dịch không tính Việc hôm nay / Sổ yêu quái / Thành tựu (như trước Bước 2)
const KHONG_B2 = process.argv.includes('--khong-buoc2');
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
  // 14/10: bậc ép đồ (w.ep, như js/ep_do.js E.satThuong: tổng sức mạnh bậc chia phần phụ của loại)
  const epK = (t, b) => { const E = G.EP_DO; if (!E || !b) return 1; const f = E.phu[t]; return E.tong[b] / (1 + (f ? f.giaTri * b : 0)); };
  const don = (t) => { const w = p.vk[t]; return G.WTYPES[t].dmg * G.STAGE_MULT[w.st] * (1 + 0.08 * w.sh) * (1 + G.LVL_DMG * (p.lvl - 1)) * dmgMult * (fav.includes(t) ? 1.1 : 1) * epK(t, w.ep | 0); };
  const offs = ['sword', 'bow'].map((t) => (don(t) / G.WTYPES[t].dmg) * 10).sort((a, b) => b - a);
  let off = offs[0] * 0.75 + offs[1] * 0.25;
  off *= 1 + crit; off *= 1 + 0.004 * Math.min(p.lvl, 28);
  const res = sk.def >= 4 ? 0.3 : 0, dr = (sk.def >= 5 ? 0.1 : 0) + drNT;
  let ehp = (Math.round(maxhp) / (1 - Math.min(0.75, dr - drNT / 2))) * (1 + 0.25 * res);
  // 14/10: skill bộ đang mặc (bộ cấp cao nhất, bằng nhau thì bộ mở sau) quy ra đòn / máu như G.powerParts
  if (p.bo) { const ds = ['ninja', 'rung', 'bien', 'lau'].filter((k) => p.bo[k] != null); let mac = ds[0]; for (const k of ds) if (p.bo[k] >= p.bo[mac]) mac = k; const q = quyBo(mac, p.bo[mac] | 0); off *= q.off; ehp *= q.ehp; }
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
  const o = { kills, xp: b.xp * gm, vang: (b.gold + kills * 2) * gm, quang: 3 + 2 + 2 * r + ((big ? 0 : 0.15) + (dau ? 0.3 : 0)) * (G.DA_TOI_QUANG || 0), nl: 5 + i, manh: big ? 3 : 0, lk: 0, nguon: {} };
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
  // 14/10: đá nâng bậc rơi từ trùm nhỏ / trùm vùng (G.EP_DO.roi; lần đầu nhiều hơn)
  const RO = G.EP_DO && G.EP_DO.roi;
  o.da = RO ? (big ? (dau ? RO.vungDau[r] : RO.vung[r]) : dau ? RO.miniDau[r] : RO.mini[r]) : 0;
  return o;
}

// ---------- mô phỏng chiến dịch ----------
function chienDich(o) {
  o = o || {};
  // 14/10 (bước 1, mục 5): luật mới mặc định BẬT — o.ep (ép đồ bằng đá rơi từ trùm, giá kỳ vọng theo bảng mục 6), o.aiNgay (mỗi o.ngay
  // lượt ải thường = 1 ngày, chơi đủ 3 lượt mọi ải ngày mở hôm đó ở mức cao nhất đã mở), o.banQuang (thiếu quặng để mài thì mua của
  // Bà Hàng Xén, tối đa G.BAN_QUANG.moiNgay mỗi ngày). Đặt false để so với luật cũ.
  const EP = o.ep !== false && G.EP_DO, AN = o.aiNgay !== false && G.AI_NGAY, BQ = o.banQuang !== false && G.BAN_QUANG, NGAY_LUOT = o.ngay || 8;
  // 15/10 Bước 2 Phiên E (mục 7): o.buoc2 (mặc định BẬT, --khong-buoc2 / o.buoc2 = false: tắt) — Việc hôm nay, Sổ yêu quái, Thành tựu, bé bấm Nhận hết.
  const B2 = o.buoc2 !== false && !KHONG_B2 && G.VIEC_NGAY && G.SO_YQ && G.THANH_TUU, TL = o.tlViec == null ? 0.8 : o.tlViec;
  const p = { lvl: 1, xp: 0, vang: 0, quang: 0, nl: [0, 0, 0], manh: [0, 0, 0], lk: 0, lkTong: 0, lo: 1, hoc: {}, vk: { sword: { st: 0, sh: 0, ep: 0 }, bow: { st: 0, sh: 0, ep: 0 }, spear: { st: 0, sh: 0, ep: 0 }, hammer: { st: 0, sh: 0, ep: 0 } }, bo: { ninja: 0 }, ban: {}, muaBoVang: 0, power: 98, luot: 0, vangTong: 0, da: 0, daTong: 0, ngay: 0, muaQuang: 0, muaHom: 0, anLuot: 0, quai: 0, tinhAnh: 0, ruongNgay: 0, b2: { vang: 0, quang: 0, lk: 0, da: 0, bua: 0, viec: 0, so: 0, tt: 0 }, ttXong: {} };
  // giá kỳ vọng mỗi bậc ép (chênh lệch cộng dồn của bảng mục 6, không bùa)
  const giaEp = EP ? (() => { const t = epDo({ n: 4000 }); return t.map((v, k) => ({ da: v.da - (k ? t[k - 1].da : 0), vang: v.vang - (k ? t[k - 1].vang : 0), manh: v.manh - (k ? t[k - 1].manh : 0) })); })() : [];
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
    // 15/10 (bo-do-mua): bộ vùng mở bán khi hạ trùm vùng, đủ vàng thì MUA ngay (G.BO_MUA, trước mọi việc tiêu vàng khác) — o.muaBo === false: tặng như cũ
    if (o.bo) for (const k of ['rung', 'bien', 'lau']) {
      if (!p.ban[k] || p.bo[k] != null) continue;
      const gia = (G.BO_MUA && G.BO_MUA.gia[k]) | 0;
      if (p.vang < gia) continue;
      p.vang -= gia; p.bo[k] = 0; p.muaBoVang += gia;
      moc['mua bộ ' + k] = moc['mua bộ ' + k] || { luot: p.luot, ai: ds.length + 1 };
    }
    // còn bộ đang bán chưa đủ vàng: để dành (ép, mài, nâng lò chỉ tiêu phần vượt giá bộ rẻ nhất; o.deDanh === false: tiêu hết)
    const banCho = o.bo && o.deDanh !== false ? ['rung', 'bien', 'lau'].filter((k) => p.ban[k] && p.bo[k] == null) : [];
    const deDanh = banCho.length ? Math.min(p.vang, Math.min(...banCho.map((k) => (G.BO_MUA.gia[k] | 0)))) : 0;
    p.vang -= deDanh;
    // linh khí: bộ cấp 1 khi vừa có (nếu o.bo) rồi vũ khí
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
    // 14/10: ép đồ (trước mài, như bot tests/bot_nang.js): món chính trước, món phụ thấp hơn 1 bậc
    for (let g = 0; EP && g < 12; g++) {
      const c = p.vk.sword, f = p.vk.bow, w = f.ep + 1 < c.ep ? f : c;
      if (w.ep >= 6) break;
      const q = giaEp[w.ep]; // bậc w.ep → w.ep + 1
      if (p.da < q.da || p.vang < q.vang || (q.manh > 0 && p.manh[w.ep >= 5 ? 2 : 1] < q.manh)) break;
      p.da -= q.da; p.vang -= q.vang; if (q.manh > 0) p.manh[w.ep >= 5 ? 2 : 1] -= q.manh; w.ep++;
      const ten = (w === c ? 'sword' : 'bow') + ' bậc ' + G.EP_DO.ten[w.ep];
      if (!moc[ten]) moc[ten] = { luot: p.luot, ai: ds.length + 1 };
    }
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
      // 14/10: chỉ thiếu quặng thì mua của Bà Hàng Xén (còn lượt hôm nay, đủ vàng cho cả phần mài)
      if (BQ && p.quang < c.ore && p.vang >= c.gold + (c.ore - p.quang) * BQ.gia && !c.mat.some((m, i) => p.nl[i] < m) && c.ore - p.quang <= BQ.moiNgay - p.muaHom) {
        const n = c.ore - p.quang; p.vang -= n * BQ.gia; p.quang += n; p.muaHom += n; p.muaQuang += n;
      }
      if (p.vang < c.gold || p.quang < c.ore || c.mat.some((m, i) => p.nl[i] < m)) break;
      p.vang -= c.gold; p.quang -= c.ore; c.mat.forEach((m, i) => { p.nl[i] -= m; }); w.sh++;
    }
    p.vang += deDanh;
  };
  // Bước 2: cộng thưởng (k = 'viec' | 'so' | 'tt' để tách vàng theo nguồn); bùa chỉ đếm (mô hình ép không dùng bùa)
  const b2 = (t, k) => {
    const v = t.vang || 0, qg = t.quang || 0, lk = t.lk || 0, da = t.da || 0, bua = t.bua || 0;
    p.vang += v; p.vangTong += v; p.quang += qg; p.lk += lk; p.lkTong += lk; if (EP) { p.da += da; p.daTong += da; }
    const B = p.b2; B.vang += v; B.quang += qg; B.lk += lk; B.da += da; B.bua += bua; B[k] += v;
  };
  // thành tựu: điều kiện ước theo trạng thái mô hình (mã khớp G.THANH_TUU.DS; thành tựu cuối game / độ khó 2 / đủ 45 sao không tới trong 15 ải)
  const TT_DK = {
    buocDau: () => ds.length >= 1, cuuTeo: () => p.hoc.hunter, cuuBong: () => p.hoc.healer, cuuLi: () => p.hoc.wrestler,
    quai100: () => p.quai >= 100, quai1000: () => p.quai >= 1000, tinhAnh50: () => p.tinhAnh >= 50, sao15: () => ds.length * 2.4 >= 15,
    khongBinh: () => p.luot >= 20, khacChe: () => p.luot >= 30, mam: () => p.vk.sword.st >= 1, thucTinh1: () => p.vk.sword.st >= 3,
    epTim: () => p.vk.sword.ep >= 3, mai10: () => p.vk.sword.sh >= 10, cap20: () => p.lvl >= 20, so12: () => p.hoc.hunter, viec7: () => p.ruongNgay >= 7,
  };
  const kiemTT = () => { if (!B2) return; for (const a of G.THANH_TUU.DS) { const f = TT_DK[a.ma]; if (f && !p.ttXong[a.ma] && f()) { p.ttXong[a.ma] = 1; b2(a.th, 'tt'); } } };
  const choi = (n, dau) => {
    const q = thuNhap(n, p, dau);
    p.luot++; p.quai += q.kills + 2; p.tinhAnh += 1;
    p.xp += q.xp; while (p.lvl < G.MAX_LEVEL && p.xp >= G.xpNeed(p.lvl)) { p.xp -= G.xpNeed(p.lvl); p.lvl++; }
    p.vang += q.vang; p.vangTong += q.vang; p.quang += q.quang; p.nl[Math.floor(n / 5)] += q.nl; p.manh[Math.floor(n / 5)] += q.manh;
    p.lk += q.lk; p.lkTong += q.lk;
    if (EP) { p.da += q.da || 0; p.daTong += q.da || 0; }
    // 14/10: hết một ngày giả (NGAY_LUOT lượt) → ải ngày đang mở hôm đó (thứ xoay vòng từ Thứ 2), mức cao nhất đã hạ trùm, thắng đủ lượt
    if (p.luot % NGAY_LUOT === 0) {
      const thu = (1 + p.ngay) % 7;
      p.ngay++; p.muaHom = 0;
      const k = Math.min(2, Math.floor((ds.length + (n % 5 === 4 && dau ? 1 : 0)) / 5) - 1);
      if (AN && k >= 0) for (const loai of G.AI_NGAY.thuTu) {
        const A = G.AI_NGAY.ai[loai];
        if (A.thu.indexOf(thu) < 0) continue;
        const T = A.thuong, L = G.AI_NGAY.luot;
        p.anLuot += L;
        if (T.da) { p.da += L * T.da[k]; p.daTong += L * T.da[k]; }
        if (T.quang) p.quang += L * T.quang[k];
        if (T.vang) { p.vang += L * T.vang[k]; p.vangTong += L * T.vang[k]; }
        p.xp += L * Math.round(G.stageStats(k, 4, 0).xp * (G.AI_NGAY.xp || 0));
      }
      // Bước 2: Việc hôm nay (mở sau 0-1) — 3 việc Dễ / Vừa / Khó + rương ngày, xong 3/3 ở TL số ngày; rương tuần mỗi 7 ngày nếu đủ 5/7 ngày
      if (B2 && ds.length >= 2) {
        const V = G.VIEC_NGAY, mu = Math.min(2, ['hunter', 'healer'].filter((x) => p.hoc[x]).length);
        for (let d = 0; d < 3; d++) b2({ vang: TL * V.thuong[d][mu].v, quang: TL * V.thuong[d][mu].q }, 'viec');
        b2({ da: TL * V.ruongNgay[mu].da, lk: TL * V.ruongNgay[mu].lk }, 'viec'); p.ruongNgay += TL;
        if (p.ngay % 7 === 0) { let pt = 0; for (let j = V.tuanCan; j <= 7; j++) { let c = 1; for (let x = 0; x < j; x++) c = (c * (7 - x)) / (x + 1); pt += c * Math.pow(TL, j) * Math.pow(1 - TL, 7 - j); } b2({ bua: pt * V.ruongTuan[mu].bua, da: pt * V.ruongTuan[mu].da }, 'viec'); }
      }
    }
    if (dau && n % 5 === 4) {
      const k = G.REGIONS[Math.floor(n / 5)].rescue, bo = ['rung', 'bien', 'lau'][Math.floor(n / 5)];
      p.hoc[k] = 1;
      if (o.muaBo === false || !G.BO_MUA) p.bo[bo] = 0; else p.ban[bo] = 1; // 15/10: hạ trùm chỉ mở bán (mua trong tieu)
    }
    // Bước 2: Sổ yêu quái — hạ trùm vùng lần đầu thì tính cả vùng: ★ mọi trang (vàng), ★★ ở 70% trang (linh khí, chưa đủ cả vùng nên
    // không có đá thưởng vùng), ★★★ ở tinh anh + trùm nhỏ (đá) — khớp bot thật (bao-cao-phien-A.md: 2.240–2.640 V, 98–137 LK, 14 Đ).
    if (B2 && dau && n % 5 === 4) {
      const Y = G.SO_YQ, r = Math.floor(n / 5), t = { vang: 0, lk: 0, da: 0 };
      for (const tr of Y.trang) if (tr[1] === r) { t.vang += Y.vang[tr[2]][r]; t.lk += 0.7 * Y.lk[tr[2]]; if (tr[2] === 'tinhanh' || tr[2] === 'trumnho') t.da += Y.da[tr[2]]; }
      b2(t, 'so');
    }
    kiemTT();
    tieu();
    p.power = nguoi(p).power;
    return q;
  };
  for (let n = 0; n < 15; n++) {
    const rec = G.STAGE_REC[n];
    let cay = 0;
    while (p.power < rec * (o.nguong || 0.9) && n > 0 && cay < 30) { choi(n - 1, false); cay++; }
    const epT = (w) => (w.ep ? ' ' + G.EP_DO.ten[w.ep].replace('Xanh ', 'X.') : '');
    const vao = { ai: (Math.floor(n / 5) + 1) + '-' + (n % 5 + 1), rec, power: p.power, lvl: p.lvl, cay, sword: G.STAGE_NAMES[p.vk.sword.st] + ' +' + p.vk.sword.sh + epT(p.vk.sword), bow: G.STAGE_NAMES[p.vk.bow.st] + ' +' + p.vk.bow.sh + epT(p.vk.bow), lkTong: Math.round(p.lkTong), lo: p.lo, da: Math.round(p.da) };
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

if (require.main === module && !LUYEN_CD) {
  const b1 = bang1(), cd = chienDich(), cd1 = chienDich({ motMon: true }), cdBo = chienDich({ bo: true }), b2 = bang2(cd);
  const cdBoCu = chienDich({ bo: true, muaBo: false }); // 15/10 bo-do-mua: bộ tặng khi hạ trùm như cũ (?bocu=1)
  const cdCu = chienDich({ ep: false, aiNgay: false, banQuang: false }); // luật trước bước 1 (không ép, không ải ngày, không mua quặng)
  if (JSON_OUT) { console.log(JSON.stringify({ b1, cd, cd1, cdBo, cdBoCu, cdCu, b2 }, null, 1)); process.exit(0); }
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
  console.log('Tổng lượt:', cd.p.luot, '| vàng tổng', Math.round(cd.p.vangTong), '| ngày giả', cd.p.ngay, '(lượt ải ngày ' + cd.p.anLuot + ') | đá nâng bậc tổng', Math.round(cd.p.daTong), '| quặng mua', Math.round(cd.p.muaQuang));
  console.log('So luật cũ (không ép đồ, không ải ngày, không mua quặng): tổng lượt', cdCu.p.luot, '| Sức mạnh qua từng ải mới/cũ:', cd.ds.map((v, k) => v.power + '/' + cdCu.ds[k].power).join(' '));
  console.log('Có mua bộ (skill bộ tính vào Sức mạnh): tổng lượt', cdBo.p.luot, '| vàng mua bộ', cdBo.p.muaBoVang, '| Sức mạnh:', cdBo.ds.map((v) => v.power).join(' '));
  console.log('Bộ tặng khi hạ trùm như cũ (?bocu=1): tổng lượt', cdBoCu.p.luot, '| Sức mạnh:', cdBoCu.ds.map((v) => v.power).join(' '));
  console.log('Mốc mua bộ (lượt, ải đang tới):', JSON.stringify(Object.fromEntries(Object.entries(cdBo.moc).filter(([k]) => /bộ/.test(k)))), '| như cũ:', JSON.stringify(Object.fromEntries(Object.entries(cdBoCu.moc).filter(([k]) => /bộ/.test(k)))));
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
// ---------- 7. VIỆC HÔM NAY + SỔ YÊU QUÁI + THÀNH TỰU (Bước 2, docs/ke-hoach/buoc-2/KE-HOACH.md mục 5) ----------
// So chiến dịch có mua bộ (như game hiện hành) có / không ba hệ: lượt cày từng ải, Sức mạnh lúc tới ải, thu nhập mỗi ngày giả (8 lượt).
function buoc2(o) {
  o = o || {};
  const co = chienDich(Object.assign({ bo: true }, o)), khong = chienDich(Object.assign({ bo: true }, o, { buoc2: false }));
  const ngay = (cd) => Math.max(1, cd.p.luot / 8);
  const moiNgay = (cd) => ({ luot: cd.p.luot, ngay: +ngay(cd).toFixed(1), vang: Math.round(cd.p.vangTong / ngay(cd)), lk: Math.round(cd.p.lkTong / ngay(cd)), da: +(cd.p.daTong / ngay(cd)).toFixed(1) });
  return { co, khong, a: moiNgay(co), b: moiNgay(khong), b2: co.p.b2 };
}
if (require.main === module && !JSON_OUT && !LUYEN_CD) {
  const pad = (s, n) => String(s).padEnd(n);
  const r = buoc2(), B = r.b2;
  console.log('\n== 7. BƯỚC 2: Việc hôm nay + Sổ yêu quái + Thành tựu (có mua bộ; việc xong 3/3 ở 80% số ngày, bé bấm Nhận hết)' + (KHONG_B2 ? ' — ĐANG TẮT (--khong-buoc2)' : '') + ' ==');
  console.log(pad('ải', 5), pad('cày có/không', 13), pad('SM lúc tới có/không', 20), 'KD');
  r.co.ds.forEach((v, k) => { const w = r.khong.ds[k]; console.log(pad(v.ai, 5), pad(v.cay + '/' + w.cay, 13), pad(v.power + '/' + w.power, 20), v.rec); });
  const lech = ((r.a.luot - r.b.luot) / r.b.luot * 100).toFixed(0);
  console.log('Tổng lượt có/không:', r.a.luot + '/' + r.b.luot, '(' + (lech > 0 ? '+' : '') + lech + '%) | ngày giả', r.a.ngay + '/' + r.b.ngay,
    '| mỗi ngày: vàng', r.a.vang + '/' + r.b.vang, '· linh khí', r.a.lk + '/' + r.b.lk, '· đá nâng bậc', r.a.da + '/' + r.b.da);
  console.log('Ba hệ cộng cả chiến dịch:', Math.round(B.vang), 'vàng (việc', Math.round(B.viec) + ', sổ', Math.round(B.so) + ', thành tựu', Math.round(B.tt) + '),', Math.round(B.quang), 'quặng,', Math.round(B.lk), 'linh khí,', B.da.toFixed(1), 'đá,', B.bua.toFixed(2), 'bùa',
    '| phần vàng ba hệ / vàng cả chiến dịch:', (B.vang / r.co.p.vangTong * 100).toFixed(0) + '%', '| đá:', (B.da / Math.max(1, r.co.p.daTong) * 100).toFixed(0) + '%', '| vàng mua bộ', r.co.p.muaBoVang + '/' + r.khong.p.muaBoVang);
}

// ---------- 8. LUYỆN VŨ KHÍ 1–15 (16/10, docs/review/ke-hoach-cai-thien/luyen-vu-khi/THIET-KE.md; lấy từ mo_hinh.js của bản thiết kế) ----------
// Bảng đọc thẳng G.LUYEN (game/js/data.js). Thu nhập y hệt chienDich (thuNhap), chỉ đổi ví + cách tiêu: quặng + đá (×2) + bùa (×6) → NLR;
// mài + lò + cấp hệ + ép đồ → một bảng Luyện; ải ngày Đá Bậc + Đá Mài → Ải Rèn (G.AI_NGAY.ai.ren). Món chính kiếm, phi tiêu theo sau ≤ o.lech cấp.
// Chạy: node tools/can-bang/tinh.js --luyen [--json]
function chienDichLuyen(o) {
  o = o || {};
  const LY = G.LUYEN, CAP = LY.cap, TRAN = LY.tran, MANH_DAU = LY.manhDau | 0, PHU = LY.phuSt, DA_NLR = G.QUY_DOI.da, BUA_NLR = G.QUY_DOI.bua;
  const AI_REN = G.AI_NGAY.ai.ren, NGAY_LUOT = 8, TL = 0.8, BQ = G.BAN_QUANG;
  const nguoiL = (p) => {
    const sk = { atk: 0, def: 0, elem: 0 };
    for (let k = 0; k < Math.min(SK_THU.length, Math.floor(p.lvl / 3)); k++) sk[SK_THU[k]]++;
    let maxhp = 100 * (1 + G.LVL_HP * (p.lvl - 1)); if (sk.def >= 1) maxhp *= 1.1;
    const drNT = p.hoc.wrestler ? G.ZED_DAY.wrestler.dr : 0;
    const dmgMult = 1 + (sk.atk >= 1 ? 0.08 : 0) + (sk.atk >= 4 ? 0.08 : 0), crit = sk.atk >= 5 ? 0.1 : 0;
    const fav = ['sword', 'hammer'].concat(p.hoc.hunter ? ['bow'] : [], p.hoc.healer ? ['spear'] : []);
    const mDmg = (L) => CAP[L].M / (L >= LY.phuTu ? 1 + PHU : 1);
    const don = (t) => G.WTYPES[t].dmg * mDmg(p.vk[t].L) * (1 + G.LVL_DMG * (p.lvl - 1)) * dmgMult * (fav.includes(t) ? 1.1 : 1);
    const offs = ['sword', 'bow'].map((t) => (don(t) / G.WTYPES[t].dmg) * 10).sort((a, b) => b - a);
    let off = offs[0] * 0.75 + offs[1] * 0.25;
    off *= 1 + crit; off *= 1 + 0.004 * Math.min(p.lvl, 28);
    const res = sk.def >= 4 ? 0.3 : 0, dr = (sk.def >= 5 ? 0.1 : 0) + drNT;
    let ehp = (Math.round(maxhp) / (1 - Math.min(0.75, dr - drNT / 2))) * (1 + 0.25 * res);
    if (p.bo) {
      const ds = ['ninja', 'rung', 'bien', 'lau'].filter((k) => p.bo[k] != null); let mac = ds[0];
      for (const k of ds) if (p.bo[k] >= p.bo[mac]) mac = k;
      const q = quyBo(mac, p.bo[mac] | 0); off *= q.off; ehp *= q.ehp;
    }
    return Math.round(3 * Math.sqrt(off * ehp));
  };
  const p = { lvl: 1, xp: 0, vang: 0, nlr: 0, nl: [0, 0, 0, 0], manh: [0, 0, 0, 0], lk: 0, hoc: {}, vk: { sword: { L: 1 }, bow: { L: 1 }, spear: { L: 1 }, hammer: { L: 1 } },
    bo: { ninja: 0 }, ban: {}, muaBoVang: 0, power: 98, luot: 0, ngay: 0, muaHom: 0, muaNlr: 0, trum: 0, quai: 0, tinhAnh: 0, ruongNgay: 0, ttXong: {},
    thu: { vang: 0, lk: 0, nlr: 0 }, chi: { vang: 0, lk: 0, nlr: 0 } };
  const ds = [], moc = {};
  const cong = (k, n) => { p[k] += n; if (p.thu[k] != null) p.thu[k] += n; };
  const muaBo = (k, cap) => {
    const g = G.BO_MOI.gia[cap], vm = (G.BO_MOI.vungManh || {})[k] | 0;
    if (!g || p.lk < g.lk || p.vang < g.vang || p.manh[vm] < (g.manh | 0)) return false;
    p.lk -= g.lk; p.vang -= g.vang; p.manh[vm] -= g.manh | 0; p.bo[k] = cap + 1; return true;
  };
  const duoc = (w) => {
    const L = w.L + 1, c = CAP[L];
    if (!c || L > TRAN[p.trum]) return null;
    if (p.lk < (c.lk | 0) || (c.nl && p.nl[c.nl[0]] < c.nl[1]) || (c.m && p.manh[c.m[0]] < c.m[1])) return null;
    return { c, thieu: { r: Math.max(0, (c.r | 0) - p.nlr) } };
  };
  const lech = o.lech == null ? 2 : o.lech;
  const tieu = () => {
    for (const k of ['rung', 'bien', 'lau']) {
      if (!p.ban[k] || p.bo[k] != null) continue;
      const gia = G.zedBoGia ? G.zedBoGia(k) : 0;
      if (p.vang < gia) continue;
      p.vang -= gia; p.bo[k] = 0; p.muaBoVang += gia;
    }
    const banCho = ['rung', 'bien', 'lau'].filter((k) => p.ban[k] && p.bo[k] == null);
    const deDanh = banCho.length ? Math.min(p.vang, Math.min(...banCho.map((k) => G.zedBoGia(k)))) : 0;
    p.vang -= deDanh;
    for (const k of ['rung', 'bien', 'lau']) if (p.bo[k] === 0) muaBo(k, 0);
    for (let g = 0; g < 40; g++) {
      const c = p.vk.sword, f = p.vk.bow, uu = f.L + lech < c.L ? [f, c] : [c, f];
      let ww = null, q = null;
      for (const w of uu) {
        if (w === f && f.L >= c.L) continue;
        const t = duoc(w); if (!t) continue;
        if (t.thieu.r > 0 && BQ && t.thieu.r <= BQ.moiNgay - p.muaHom && p.vang >= (t.c.v | 0) + t.thieu.r * BQ.gia) {
          p.vang -= t.thieu.r * BQ.gia; p.nlr += t.thieu.r; p.muaHom += t.thieu.r; p.muaNlr += t.thieu.r; t.thieu.r = 0;
        }
        if (p.vang >= (t.c.v | 0) && p.nlr >= (t.c.r | 0)) { ww = w; q = t; break; }
      }
      if (!ww) break;
      p.vang -= q.c.v | 0; p.lk -= q.c.lk | 0; p.nlr -= q.c.r | 0; if (q.c.nl) p.nl[q.c.nl[0]] -= q.c.nl[1]; if (q.c.m) p.manh[q.c.m[0]] -= q.c.m[1];
      p.chi.vang += q.c.v | 0; p.chi.lk += q.c.lk | 0; p.chi.nlr += q.c.r | 0;
      ww.L++;
      const ten = (ww === c ? 'kiếm' : 'phi tiêu') + ' L' + ww.L;
      if (!moc[ten]) moc[ten] = { luot: p.luot, ai: ds.length + 1 };
    }
    { const k = ['lau', 'bien', 'rung', 'ninja'].find((x) => p.bo[x] != null); if (p.bo[k] >= 1) muaBo(k, p.bo[k]); }
    p.vang += deDanh;
  };
  const b2 = (t) => { cong('vang', t.vang || 0); cong('nlr', (t.quang || 0) + DA_NLR * (t.da || 0) + BUA_NLR * (t.bua || 0)); cong('lk', t.lk || 0); };
  const TT_DK = {
    buocDau: () => ds.length >= 1, cuuTeo: () => p.hoc.hunter, cuuBong: () => p.hoc.healer, cuuLi: () => p.hoc.wrestler,
    quai100: () => p.quai >= 100, quai1000: () => p.quai >= 1000, tinhAnh50: () => p.tinhAnh >= 50, sao15: () => ds.length * 2.4 >= 15,
    khongBinh: () => p.luot >= 20, khacChe: () => p.luot >= 30, mam: () => p.vk.sword.L >= 3, thucTinh1: () => p.vk.sword.L >= 12,
    epTim: () => p.vk.sword.L >= 9, mai10: () => ['sword', 'bow', 'spear', 'hammer'].every((t) => p.vk[t].L >= 6), cap20: () => p.lvl >= 20, so12: () => p.hoc.hunter, viec7: () => p.ruongNgay >= 7,
  };
  const kiemTT = () => { for (const a of G.THANH_TUU.DS) { const f = TT_DK[a.ma]; if (f && !p.ttXong[a.ma] && f()) { p.ttXong[a.ma] = 1; b2(a.th); } } };
  const choi = (n, dau) => {
    const q = thuNhap(n, { power: p.power, vk: { sword: { st: p.vk.sword.L >= 3 ? 1 : 0 } } }, dau);
    p.luot++; p.quai += q.kills + 2; p.tinhAnh += 1;
    p.xp += q.xp; while (p.lvl < G.MAX_LEVEL && p.xp >= G.xpNeed(p.lvl)) { p.xp -= G.xpNeed(p.lvl); p.lvl++; }
    cong('vang', q.vang); cong('nlr', q.quang + DA_NLR * (q.da || 0)); p.nl[G.matAi ? G.matAi(Math.floor(n / 5), n % 5) : Math.floor(n / 5)] += q.nl;
    p.manh[Math.floor(n / 5)] += q.manh + (dau && q.manh ? MANH_DAU : 0); cong('lk', q.lk);
    if (p.luot % NGAY_LUOT === 0) {
      const thu = (1 + p.ngay) % 7; p.ngay++; p.muaHom = 0;
      const k = Math.min(2, Math.floor((ds.length + (n % 5 === 4 && dau ? 1 : 0)) / 5) - 1);
      if (k >= 0) {
        const L = G.AI_NGAY.luot;
        if (AI_REN.thu.indexOf(thu) >= 0) cong('nlr', L * AI_REN.thuong.nlr[k]);
        if (G.AI_NGAY.ai.vang.thu.indexOf(thu) >= 0) cong('vang', L * G.AI_NGAY.ai.vang.thuong.vang[k]);
        const soAi = (AI_REN.thu.indexOf(thu) >= 0 ? 1 : 0) + (G.AI_NGAY.ai.vang.thu.indexOf(thu) >= 0 ? 1 : 0);
        p.xp += soAi * L * Math.round(G.stageStats(k, 4, 0).xp * (G.AI_NGAY.xp || 0));
      }
      if (ds.length >= 2 && !KHONG_B2) {
        const V = G.VIEC_NGAY, mu = Math.min(2, ['hunter', 'healer'].filter((x) => p.hoc[x]).length);
        for (let d = 0; d < 3; d++) b2({ vang: TL * V.thuong[d][mu].v, quang: TL * V.thuong[d][mu].q });
        b2({ da: TL * V.ruongNgay[mu].da, lk: TL * V.ruongNgay[mu].lk }); p.ruongNgay += TL;
        if (p.ngay % 7 === 0) { let pt = 0; for (let j = V.tuanCan; j <= 7; j++) { let c = 1; for (let x = 0; x < j; x++) c = (c * (7 - x)) / (x + 1); pt += c * Math.pow(TL, j) * Math.pow(1 - TL, 7 - j); } b2({ bua: pt * V.ruongTuan[mu].bua, da: pt * V.ruongTuan[mu].da }); }
      }
    }
    if (dau && n % 5 === 4) {
      const r = Math.floor(n / 5); p.hoc[G.REGIONS[r].rescue] = 1; p.ban[['rung', 'bien', 'lau'][r]] = 1; p.trum = Math.max(p.trum, r + 1);
      if (!KHONG_B2) {
        const Y = G.SO_YQ, t = { vang: 0, lk: 0, da: 0 };
        for (const tr of Y.trang) if (tr[1] === r) { t.vang += Y.vang[tr[2]][r]; t.lk += 0.7 * Y.lk[tr[2]]; if (tr[2] === 'tinhanh' || tr[2] === 'trumnho') t.da += Y.da[tr[2]]; }
        b2(t);
      }
    }
    if (!KHONG_B2) kiemTT();
    tieu();
    p.power = nguoiL(p);
  };
  const SO = o.vung4 && G.STAGE_REC.length >= 20 ? 20 : 15;
  for (let n = 0; n < SO; n++) {
    const rec = G.STAGE_REC[n]; let cay = 0;
    while (p.power < rec * 0.9 && n > 0 && cay < 30) { choi(n - 1, false); cay++; }
    const vao = { ai: (Math.floor(n / 5) + 1) + '-' + (n % 5 + 1), rec, power: p.power, lvl: p.lvl, cay, kiem: p.vk.sword.L, pt: p.vk.bow.L, Mk: CAP[p.vk.sword.L].M };
    choi(n, true);
    vao.du = { vang: Math.round(p.vang), lk: Math.round(p.lk), nlr: Math.round(p.nlr) };
    ds.push(vao);
  }
  return { ds, moc, p };
}
if (require.main === module && LUYEN_CD) {
  const cu = chienDich({ bo: true }), moi = chienDichLuyen(), moi1 = chienDichLuyen({ lech: 1 }), v4 = chienDichLuyen({ vung4: true });
  if (JSON_OUT) { console.log(JSON.stringify({ cu: cu.ds, moi: moi.ds, mocMoi: moi.moc, v4: v4.ds }, null, 1)); process.exit(0); }
  const pad = (s, n) => String(s).padEnd(n);
  console.log('== 8. LUYỆN VŨ KHÍ: chiến dịch 15 ải — luật cũ (có mua bộ) | luật Luyện (G.LUYEN; phi tiêu theo sau ≤ 2 cấp) ==');
  console.log(pad('ải', 5), pad('KD', 4), pad('cày cũ/mới', 11), pad('SM cũ/mới', 10), pad('cấp cũ/mới', 11), pad('kiếm cũ', 24), pad('kiếm mới', 10), pad('p.tiêu mới', 10), 'dư mới vàng/LK/NLR');
  let sCu = 0, sMoi = 0;
  cu.ds.forEach((v, k) => { const w = moi.ds[k]; sCu += v.cay; sMoi += w.cay;
    console.log(pad(v.ai, 5), pad(v.rec, 4), pad(v.cay + '/' + w.cay, 11), pad(v.power + '/' + w.power, 10), pad(v.lvl + '/' + w.lvl, 11), pad(v.sword, 24), pad('L' + w.kiem + ' ×' + w.Mk.toFixed(2), 10), pad('L' + w.pt, 10), w.du.vang + '/' + w.du.lk + '/' + w.du.nlr); });
  console.log('Tổng lượt cũ / Luyện / Luyện (phi tiêu bám sát ≤ 1 cấp):', cu.p.luot, '/', moi.p.luot, '/', moi1.p.luot, '| lượt cày thêm:', sCu, '/', sMoi);
  console.log('Luyện thu cả chiến dịch: vàng', Math.round(moi.p.thu.vang), '· LK', Math.round(moi.p.thu.lk), '· NLR', Math.round(moi.p.thu.nlr), '| chi cho Luyện: vàng', moi.p.chi.vang, '· LK', moi.p.chi.lk, '· NLR', moi.p.chi.nlr);
  if (v4.ds.length > 15) console.log('Vùng 4 (luật Luyện):', v4.ds.slice(15).map((v) => v.ai + ' cày ' + v.cay + ' SM ' + v.power + '/' + v.rec + ' L' + v.kiem + '/' + v.pt).join(' · '), '| tổng 20 ải', v4.p.luot, 'lượt');
}
module.exports = { G, bang1, chienDich, bang2, thuNhap, soQuai, nguoi, epDo, aiNgay, buoc2, chienDichLuyen };
