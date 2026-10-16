#!/usr/bin/env node
// MÔ HÌNH SỐ "LUYỆN VŨ KHÍ" 1–15 (16/10, docs/review/ke-hoach-cai-thien/luyen-vu-khi/THIET-KE.md). CHỈ THIẾT KẾ: không sửa game.
// Nạp tools/can-bang/tinh.js (bảng game/js/data.js + mô hình chiến dịch hiện hành) rồi chạy:
//   (a) chiến dịch HIỆN TẠI (tinh.js chienDich({ bo: true }), như mục 7 của tinh.js), và
//   (b) chiến dịch LUẬT MỚI: thu nhập y hệt (thuNhap của tinh.js), chỉ đổi ví + cách tiêu:
//       quặng + đá nâng bậc (×2) → NGUYÊN LIỆU RÈN (NLR); bùa giữ bậc bỏ (mỗi bùa → 6 NLR);
//       mài + lò + cấp hệ + ép đồ → MỘT bảng LUYEN (dưới đây); ải ngày Đá Bậc + Đá Mài → một "Ải Rèn" 6 ngày/tuần.
// Chạy: node docs/review/ke-hoach-cai-thien/luyen-vu-khi/mo_hinh.js [--json]
'use strict';
const path = require('path');
const T = require(path.join(__dirname, '..', '..', '..', '..', 'tools', 'can-bang', 'tinh.js'));
const G = T.G;

// ===== BẢNG ĐỀ XUẤT (khớp THIET-KE.md mục 1) =====
// M: tổng sức mạnh vũ khí so với Luyện 1 (thay cho STAGE_MULT × (1 + 0,08 × mài) × bậc ép).
// Giá để lên cấp L (từ L − 1): v vàng, lk linh khí, r nguyên liệu rèn, nl nguyên liệu vùng [vùng, số], m mảnh trùm [vùng, số].
const LUYEN = [
  null,
  { M: 1.00 },
  { M: 1.15, v: 100, lk: 10, r: 5 },
  { M: 1.35, v: 150, lk: 80, r: 10, nl: [0, 4] },               // 3: Mầm — chọn hệ
  { M: 1.55, v: 250, lk: 40, r: 15, nl: [0, 3] },
  { M: 1.75, v: 350, lk: 50, r: 20, nl: [0, 3] },               // trần trước Mộc Tinh
  { M: 2.05, v: 500, lk: 160, r: 28, nl: [0, 6], m: [0, 1] },   // 6: Thành hình — cần mảnh Mộc Tinh
  { M: 2.35, v: 600, lk: 60, r: 32, nl: [1, 4] },
  { M: 2.65, v: 700, lk: 70, r: 38, nl: [1, 4] },
  { M: 3.00, v: 850, lk: 100, r: 45, nl: [1, 8] },             // 9: Tinh luyện — mở phần phụ của loại; trần trước Ngư Tinh
  { M: 3.35, v: 950, lk: 80, r: 50, nl: [1, 4], m: [1, 1] },   // cần mảnh Ngư Tinh
  { M: 3.70, v: 1000, lk: 90, r: 55, nl: [2, 5] },
  { M: 4.50, v: 1350, lk: 290, r: 65, nl: [2, 10] },            // 12: Thức tỉnh; trần trước Hồ Tinh (phiên 1)
  { M: 4.90, v: 1300, lk: 100, r: 70, nl: [2, 6], m: [2, 1] },  // cần mảnh Hồ Tinh (phiên 1)
  { M: 5.30, v: 1450, lk: 120, r: 75, nl: [0, 6] },             // trần trước Thuồng Luồng (phiên 3: không cần mảnh); vùng 4 dùng Gỗ linh
  { M: 5.70, v: 1850, lk: 200, r: 90, nl: [1, 10], m: [3, 2] }, // 15: Viên mãn (Vảy cá)
];
// Thử nhanh không sửa tệp: KV=0.7 KR=1.5 KLK=1 (nhân giá vàng / NLR / LK), LECH=2 (phi tiêu theo sau tối đa bao nhiêu cấp)
for (const c of LUYEN) if (c) { c.v = Math.round((c.v || 0) * +(process.env.KV || 1) / 10) * 10; c.r = Math.round((c.r || 0) * +(process.env.KR || 1)); c.lk = Math.round((c.lk || 0) * +(process.env.KLK || 1) / 10) * 10; }
const TRAN = [5, 9, 12, 14, 15]; // khớp G.LUYEN.tran trong game (thiết kế 5/9/11/13/15; phiên 1 → 12 trước Hồ Tinh, phiên 3 → 14 trước Thuồng Luồng) // cấp tối đa theo số trùm vùng đã hạ (0..4)
const MANH_DAU = +(process.env.MDAU || 2); // hạ trùm vùng LẦN ĐẦU: thêm bấy nhiêu mảnh (3 → 5), thưởng bảo đảm
const PHU = 0.06;                 // từ cấp 9 phần phụ của loại (tốc đánh / tầm / choáng / xuyên) chiếm ~6% trong M (như ép đồ: sát thương = M / (1 + phần phụ))
const DA_NLR = 2, BUA_NLR = 6;    // quy đổi đá nâng bậc, bùa giữ bậc → nguyên liệu rèn
// Ải Rèn (thay Ải Đá Bậc + Ải Đá Mài): T2, T3, T4, T6, T7, CN; 3 lượt; thưởng NLR theo mức (Dễ/Vừa/Khó).
const AI_REN = { thu: [1, 2, 3, 5, 6, 0], nlr: [14, 19, 25] };

const tong = (from, to, k) => { let s = 0; for (let L = from + 1; L <= to; L++) s += LUYEN[L][k] || 0; return s; };

// Sức mạnh: chép nguoi() của tinh.js, chỉ thay phần vũ khí bằng M của cấp Luyện
function nguoiMoi(p) {
  const sk = { atk: 0, def: 0, elem: 0 };
  const SK_THU = ['atk', 'def', 'atk', 'atk', 'atk', 'atk', 'def', 'def', 'def', 'def', 'elem', 'elem', 'elem', 'elem', 'elem'];
  for (let k = 0; k < Math.min(SK_THU.length, Math.floor(p.lvl / 3)); k++) sk[SK_THU[k]]++;
  let maxhp = 100 * (1 + G.LVL_HP * (p.lvl - 1)); if (sk.def >= 1) maxhp *= 1.1;
  const drNT = p.hoc.wrestler ? G.ZED_DAY.wrestler.dr : 0;
  const dmgMult = 1 + (sk.atk >= 1 ? 0.08 : 0) + (sk.atk >= 4 ? 0.08 : 0), crit = sk.atk >= 5 ? 0.1 : 0;
  const fav = ['sword', 'hammer'].concat(p.hoc.hunter ? ['bow'] : [], p.hoc.healer ? ['spear'] : []);
  const mDmg = (L) => LUYEN[L].M / (L >= 9 ? 1 + PHU : 1); // như tinh.js: Sức mạnh chỉ tính phần sát thương
  const don = (t) => G.WTYPES[t].dmg * mDmg(p.vk[t].L) * (1 + G.LVL_DMG * (p.lvl - 1)) * dmgMult * (fav.includes(t) ? 1.1 : 1);
  const offs = ['sword', 'bow'].map((t) => (don(t) / G.WTYPES[t].dmg) * 10).sort((a, b) => b - a);
  let off = offs[0] * 0.75 + offs[1] * 0.25;
  off *= 1 + crit; off *= 1 + 0.004 * Math.min(p.lvl, 28);
  const res = sk.def >= 4 ? 0.3 : 0, dr = (sk.def >= 5 ? 0.1 : 0) + drNT;
  let ehp = (Math.round(maxhp) / (1 - Math.min(0.75, dr - drNT / 2))) * (1 + 0.25 * res);
  if (p.bo) {
    const ds = ['ninja', 'rung', 'bien', 'lau'].filter((k) => p.bo[k] != null); let mac = ds[0];
    for (const k of ds) if (p.bo[k] >= p.bo[mac]) mac = k;
    const q = G.boSk && G.boSk.quyDoi && G.boSkill ? G.boSk.quyDoi({ boSkill: G.boSkill(mac, p.bo[mac] | 0) }) : { off: 1, ehp: 1 };
    off *= q.off; ehp *= q.ehp;
  }
  return { power: Math.round(3 * Math.sqrt(off * ehp)), maxhp: Math.round(maxhp) };
}

// Chiến dịch luật mới (cấu trúc chép chienDich của tinh.js với o.bo = true, o.buoc2 bật; chỉ đổi ví + phần tiêu vũ khí)
function chienDichMoi(o) {
  o = o || {};
  const NGAY_LUOT = 8, TL = 0.8, BQ = G.BAN_QUANG; // Bà Hàng Xén bán NLR như bán quặng hiện nay (40 vàng, 15/ngày)
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
    const L = w.L + 1, c = LUYEN[L];
    if (!c || L > TRAN[p.trum]) return null;
    const thieu = { v: Math.max(0, c.v - p.vang), r: Math.max(0, c.r - p.nlr) };
    if (p.lk < c.lk || (c.nl && p.nl[c.nl[0]] < c.nl[1]) || (c.m && p.manh[c.m[0]] < c.m[1])) return null;
    return { c, thieu };
  };
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
    // Luyện: món chính (kiếm) trước, món phụ (phi tiêu) theo sau tối đa o.lech cấp (mặc định 1, như mô hình hiện tại giữ mài / ép lệch 1)
    const lech = o.lech == null ? +(process.env.LECH || 2) : o.lech;
    for (let g = 0; g < 40; g++) {
      const c = p.vk.sword, f = p.vk.bow, uu = f.L + lech < c.L ? [f, c] : [c, f];
      let ww = null, q = null;
      for (const w of uu) {
        if (w === f && f.L >= c.L) continue; // phi tiêu không vượt kiếm
        const t = duoc(w); if (!t) continue;
        // thiếu NLR thì mua của Bà Hàng Xén (còn lượt hôm nay, đủ vàng)
        if (t.thieu.r > 0 && BQ && t.thieu.r <= BQ.moiNgay - p.muaHom && p.vang >= t.c.v + t.thieu.r * BQ.gia) {
          p.vang -= t.thieu.r * BQ.gia; p.nlr += t.thieu.r; p.muaHom += t.thieu.r; p.muaNlr += t.thieu.r; t.thieu.r = 0;
        }
        if (p.vang >= t.c.v && p.nlr >= t.c.r) { ww = w; q = t; break; }
      }
      if (!ww) break;
      p.vang -= q.c.v; p.lk -= q.c.lk; p.nlr -= q.c.r; if (q.c.nl) p.nl[q.c.nl[0]] -= q.c.nl[1]; if (q.c.m) p.manh[q.c.m[0]] -= q.c.m[1];
      p.chi.vang += q.c.v; p.chi.lk += q.c.lk; p.chi.nlr += q.c.r;
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
    epTim: () => p.vk.sword.L >= 9, mai10: () => p.vk.sword.L >= 10, cap20: () => p.lvl >= 20, so12: () => p.hoc.hunter, viec7: () => p.ruongNgay >= 7,
  };
  const kiemTT = () => { for (const a of G.THANH_TUU.DS) { const f = TT_DK[a.ma]; if (f && !p.ttXong[a.ma] && f()) { p.ttXong[a.ma] = 1; b2(a.th); } } };
  const choi = (n, dau) => {
    const pp = { power: p.power, vk: { sword: { st: p.vk.sword.L >= 3 ? 1 : 0 } } };
    const q = T.thuNhap(n, pp, dau);
    p.luot++; p.quai += q.kills + 2; p.tinhAnh += 1;
    p.xp += q.xp; while (p.lvl < G.MAX_LEVEL && p.xp >= G.xpNeed(p.lvl)) { p.xp -= G.xpNeed(p.lvl); p.lvl++; }
    cong('vang', q.vang); cong('nlr', q.quang + DA_NLR * (q.da || 0)); p.nl[G.matAi ? G.matAi(Math.floor(n / 5), n % 5) : Math.floor(n / 5)] += q.nl; p.manh[Math.floor(n / 5)] += q.manh + (dau && q.manh ? MANH_DAU : 0); cong('lk', q.lk);
    if (p.luot % NGAY_LUOT === 0) {
      const thu = (1 + p.ngay) % 7; p.ngay++; p.muaHom = 0;
      const k = Math.min(2, Math.floor((ds.length + (n % 5 === 4 && dau ? 1 : 0)) / 5) - 1);
      if (k >= 0) {
        const L = G.AI_NGAY.luot;
        if (AI_REN.thu.indexOf(thu) >= 0) cong('nlr', L * AI_REN.nlr[k]);
        if (G.AI_NGAY.ai.vang.thu.indexOf(thu) >= 0) cong('vang', L * G.AI_NGAY.ai.vang.thuong.vang[k]);
        const soAi = (AI_REN.thu.indexOf(thu) >= 0 ? 1 : 0) + (G.AI_NGAY.ai.vang.thu.indexOf(thu) >= 0 ? 1 : 0);
        p.xp += soAi * L * Math.round(G.stageStats(k, 4, 0).xp * (G.AI_NGAY.xp || 0));
      }
      if (ds.length >= 2) {
        const V = G.VIEC_NGAY, mu = Math.min(2, ['hunter', 'healer'].filter((x) => p.hoc[x]).length);
        for (let d = 0; d < 3; d++) b2({ vang: TL * V.thuong[d][mu].v, quang: TL * V.thuong[d][mu].q });
        b2({ da: TL * V.ruongNgay[mu].da, lk: TL * V.ruongNgay[mu].lk }); p.ruongNgay += TL;
        if (p.ngay % 7 === 0) { let pt = 0; for (let j = V.tuanCan; j <= 7; j++) { let c = 1; for (let x = 0; x < j; x++) c = (c * (7 - x)) / (x + 1); pt += c * Math.pow(TL, j) * Math.pow(1 - TL, 7 - j); } b2({ bua: pt * V.ruongTuan[mu].bua, da: pt * V.ruongTuan[mu].da }); }
      }
    }
    if (dau && n % 5 === 4) {
      const r = Math.floor(n / 5); p.hoc[G.REGIONS[r].rescue] = 1; p.ban[['rung', 'bien', 'lau'][r]] = 1; p.trum = Math.max(p.trum, r + 1);
      const Y = G.SO_YQ, t = { vang: 0, lk: 0, da: 0 };
      for (const tr of Y.trang) if (tr[1] === r) { t.vang += Y.vang[tr[2]][r]; t.lk += 0.7 * Y.lk[tr[2]]; if (tr[2] === 'tinhanh' || tr[2] === 'trumnho') t.da += Y.da[tr[2]]; }
      b2(t);
    }
    kiemTT(); tieu();
    p.power = nguoiMoi(p).power;
    return q;
  };
  const SO = o.vung4 && G.STAGE_REC.length >= 20 ? 20 : 15;
  for (let n = 0; n < SO; n++) {
    const rec = G.STAGE_REC[n]; let cay = 0;
    while (p.power < rec * 0.9 && n > 0 && cay < 30) { choi(n - 1, false); cay++; }
    const vao = { ai: (Math.floor(n / 5) + 1) + '-' + (n % 5 + 1), rec, power: p.power, lvl: p.lvl, cay, kiem: p.vk.sword.L, pt: p.vk.bow.L, Mk: LUYEN[p.vk.sword.L].M };
    choi(n, true);
    vao.du = { vang: Math.round(p.vang), lk: Math.round(p.lk), nlr: Math.round(p.nlr), nl: p.nl.map(Math.round), manh: p.manh.slice() };
    if (process.env.DEBUG) console.log(vao.ai, JSON.stringify(vao.du), p.vk.sword.L, p.vk.bow.L, p.trum);
    ds.push(vao);
  }
  return { ds, moc, p };
}

// M của bản hiện tại cho một vũ khí (cấp hệ st, mài sh, bậc ép b) — tổng sức mạnh, tính cả phần phụ
const Mcu = (st, sh, b) => G.STAGE_MULT[st] * (1 + 0.08 * sh) * (G.EP_DO.tong[b] || 1);
// đọc chuỗi "Thành hình +9 Tím" của tinh.js
const docCu = (s) => { const m = /^(\S+(?: hình| tỉnh)?) \+(\d+)(?: (.+))?$/.exec(s); const ten = { 'X.lam': 'Xanh lam', 'X.lục': 'Xanh lục' }; const b = m[3] ? G.EP_DO.ten.indexOf(ten[m[3]] || m[3]) : 0; return { st: G.STAGE_NAMES.indexOf(m[1]), sh: +m[2], b: Math.max(0, b) }; };
// cấp Luyện khi chuyển bản lưu (THIET-KE.md mục 4):
//  1. M cũ tính thêm 2,5% cho mỗi dòng ép (bậc Tím 1 dòng … Rực lửa 4 dòng; dòng bị bỏ);
//  2. cấp có M gần nhất (so theo tỉ lệ); nếu vẫn thấp hơn quá 7% thì lên 1 cấp;
//  3. giữ hình thái đã có (Mầm → 3, Thành hình → 6, Thức tỉnh → 12) nhưng không nhảy quá 2 cấp so với bước 1–2; không giữ nổi thì
//     hạ hình thái và hoàn phần linh khí thừa (bảng hoàn tự tính);  4. tối đa 15.
const SAN_HINH_THAI = [1, 3, 6, 12];
const capTuongDuong = (M, st, b) => {
  M *= 1 + 0.025 * Math.max(0, (b | 0) - 2);
  let L = 1; for (let k = 2; k <= 15; k++) if (Math.abs(Math.log(LUYEN[k].M / M)) < Math.abs(Math.log(LUYEN[L].M / M))) L = k;
  if (LUYEN[L].M < 0.93 * M && L < 15) L++;
  L = Math.max(L, Math.min(SAN_HINH_THAI[st | 0], L + 2));
  return Math.min(15, L);
};
// phần đã tiêu theo luật cũ cho một vũ khí: mài, cấp hệ đúng giá; ép đồ lấy KỲ VỌNG (có tỉ lệ hỏng, tụt bậc; bản lưu không ghi số lần ép)
const EP_KV = T.epDo({ n: 4000 });
const daTieuCu = (st, sh, b) => {
  const o = { vang: 0, lk: [0, 100, 400, 1200][st], quang: 0, da: 0, nl: [0, 0, 0], manh: [0, 0, 0] };
  for (let n = 0; n < sh; n++) { const c = G.sharpenFull(n); o.vang += c.gold; o.quang += c.ore; c.mat.forEach((m, i) => { o.nl[i] += m; }); }
  if (b) { const e = EP_KV[b - 1]; o.vang += e.vang; o.da += e.da; }
  o.nlr = Math.round(o.quang + DA_NLR * o.da); return o;
};
const giaMoi = (L) => { const o = { vang: tong(1, L, 'v'), lk: tong(1, L, 'lk'), nlr: tong(1, L, 'r'), nl: [0, 0, 0, 0], manh: [0, 0, 0, 0] }; for (let k = 2; k <= L; k++) { const c = LUYEN[k]; if (c.nl) o.nl[c.nl[0]] += c.nl[1]; if (c.m) o.manh[c.m[0]] += c.m[1]; } return o; };
// hoàn = phần cũ đã tiêu vượt giá mới của cấp nhận được (chỉ hoàn phần dương, từng loại riêng)
const hoan = (st, sh, b) => { const M = Mcu(st, sh, b), L = capTuongDuong(M, st, b), a = daTieuCu(st, sh, b), n = giaMoi(L); return { M, L, vang: Math.max(0, a.vang - n.vang), lk: Math.max(0, a.lk - n.lk), nlr: Math.max(0, a.nlr - n.nlr), cu: a, moi: n }; };

if (require.main === module) {
  const cu = T.chienDich({ bo: true }), moi = chienDichMoi(), moi2 = chienDichMoi({ lech: 1 });
  if (process.argv.includes('--json')) { console.log(JSON.stringify({ LUYEN, cu: cu.ds, moi: moi.ds, mocMoi: moi.moc }, null, 1)); process.exit(0); }
  const pad = (s, n) => String(s).padEnd(n);
  console.log('== A. Bảng Luyện: giá từng cấp và cộng dồn (một vũ khí) ==');
  console.log(pad('L', 3), pad('M', 5), pad('vàng', 6), pad('LK', 5), pad('NLR', 5), pad('vùng', 10), pad('mảnh', 8), '| cộng dồn vàng / LK / NLR');
  for (let L = 1; L <= 15; L++) { const c = LUYEN[L]; console.log(pad(L, 3), pad(c.M.toFixed(2), 5), pad(c.v || 0, 6), pad(c.lk || 0, 5), pad(c.r || 0, 5), pad(c.nl ? c.nl[1] + '×v' + (c.nl[0] + 1) : '', 10), pad(c.m ? c.m[1] + '×v' + (c.m[0] + 1) : '', 8), '|', tong(0, L, 'v'), '/', tong(0, L, 'lk'), '/', tong(0, L, 'r')); }
  console.log('\n== B. Chiến dịch 15 ải: hiện tại (tinh.js, có mua bộ) | luật mới (phi tiêu theo sau ≤2 cấp) ==');
  console.log(pad('ải', 5), pad('KD', 4), pad('cày cũ/mới', 11), pad('SM cũ/mới', 10), pad('cấp cũ/mới', 11), pad('kiếm cũ (M)', 26), pad('kiếm mới', 9), pad('p.tiêu cũ', 22), 'p.tiêu mới | dư mới vàng/LK/NLR');
  let sCu = 0, sMoi = 0;
  cu.ds.forEach((v, k) => {
    const w = moi.ds[k], a = docCu(v.sword); sCu += v.cay; sMoi += w.cay;
    console.log(pad(v.ai, 5), pad(v.rec, 4), pad(v.cay + '/' + w.cay, 11), pad(v.power + '/' + w.power, 10), pad(v.lvl + '/' + w.lvl, 11), pad(v.sword + ' (' + Mcu(a.st, a.sh, a.b).toFixed(2) + ')', 26), pad('L' + w.kiem + ' (' + w.Mk.toFixed(2) + ')', 9), pad(v.bow, 22), 'L' + w.pt, '|', w.du.vang + '/' + w.du.lk + '/' + w.du.nlr);
  });
  console.log('Tổng lượt cũ / mới / mới nếu phi tiêu bám sát kiếm (lệch 1):', cu.p.luot, '/', moi.p.luot, '/', moi2.p.luot, '| lượt cày thêm:', sCu, '/', sMoi);
  console.log('Mốc luật mới:', JSON.stringify(moi.moc));
  console.log('Luật mới thu cả chiến dịch: vàng', Math.round(moi.p.thu.vang), '· LK', Math.round(moi.p.thu.lk), '· NLR', Math.round(moi.p.thu.nlr), '(mua', moi.p.muaNlr + ') | chi cho Luyện: vàng', moi.p.chi.vang, '· LK', moi.p.chi.lk, '· NLR', moi.p.chi.nlr, '| mua bộ', moi.p.muaBoVang);
  console.log('Hiện tại thu cả chiến dịch: vàng', Math.round(cu.p.vangTong), '· LK', Math.round(cu.p.lkTong), '· đá', Math.round(cu.p.daTong), '| quặng mua', Math.round(cu.p.muaQuang));
  const v4 = chienDichMoi({ vung4: true });
  if (v4.ds.length > 15) console.log('Vùng 4 (chỉ luật mới — tinh.js chưa mô hình vùng 4; số khuyên dùng vùng 4 là số xuất phát):', v4.ds.slice(15).map((v) => v.ai + ' cày ' + v.cay + ' SM ' + v.power + '/' + v.rec + ' L' + v.kiem + '/' + v.pt).join(' · '), '| tổng 20 ải', v4.p.luot, 'lượt');
  // F. thu nhập MỖI LƯỢT theo vùng, quy ra 3 tiền tệ (kỳ vọng, chơi lại, vũ khí Mầm; chưa tính việc ngày / sổ / thành tựu / ải ngày)
  console.log('\n== F. Thu nhập mỗi lượt (chơi lại; lần đầu trong ngoặc) — vàng / LK / NLR (= quặng + 2 × đá) / nguyên liệu vùng / mảnh ==');
  for (let r = 0; r < (G.STAGE_REC.length >= 20 ? 4 : 3); r++) {
    const tb = (dau) => { const a = { v: 0, lk: 0, r: 0, nl: 0 }; for (let i = 0; i < 4; i++) { const q = T.thuNhap(r * 5 + i, { power: G.STAGE_REC[r * 5 + i], vk: { sword: { st: 1 } } }, dau); a.v += q.vang / 4; a.lk += q.lk / 4; a.r += (q.quang + DA_NLR * q.da) / 4; a.nl += q.nl / 4; } return a; };
    const t0 = tb(false), t1 = tb(true), b0 = T.thuNhap(r * 5 + 4, { power: G.STAGE_REC[r * 5 + 4], vk: { sword: { st: 1 } } }, false), b1 = T.thuNhap(r * 5 + 4, { power: G.STAGE_REC[r * 5 + 4], vk: { sword: { st: 1 } } }, true);
    const f = (x) => Math.round(x);
    console.log(pad(G.REGIONS[r].name, 11), 'ải thường:', f(t0.v) + ' (' + f(t1.v) + ') / ' + f(t0.lk) + ' (' + f(t1.lk) + ') / ' + f(t0.r) + ' (' + f(t1.r) + ') / ' + f(t0.nl) + ' / 0',
      '| trùm vùng:', f(b0.vang) + ' (' + f(b1.vang) + ') / ' + f(b0.lk) + ' (' + f(b1.lk) + ') / ' + f(b0.quang + DA_NLR * b0.da) + ' (' + f(b1.quang + DA_NLR * b1.da) + ') / ' + b0.nl + ' / ' + b0.manh + ' (' + (b1.manh + MANH_DAU) + ')');
  }
  console.log('Ải ngày (mỗi lượt, mức Dễ/Vừa/Khó): Ải Rèn', AI_REN.nlr.join('/'), 'NLR (6 ngày/tuần) thay Ải Đá Bậc', G.AI_NGAY.ai.da.thuong.da.map((x) => x * DA_NLR).join('/'), 'NLR + Ải Đá Mài', G.AI_NGAY.ai.mai.thuong.quang.join('/'), 'NLR (mỗi ải 4 ngày/tuần) · Ải Vàng giữ', G.AI_NGAY.ai.vang.thuong.vang.join('/'));
  const tuanCu = [0, 1, 2].map((k) => 12 * G.AI_NGAY.ai.da.thuong.da[k] * DA_NLR + 12 * G.AI_NGAY.ai.mai.thuong.quang[k]), tuanMoi = [0, 1, 2].map((k) => AI_REN.thu.length * G.AI_NGAY.luot * AI_REN.nlr[k]);
  console.log('NLR mỗi tuần từ ải ngày: cũ', tuanCu.join('/'), '| mới', tuanMoi.join('/'));
  console.log('\n== C. Trần sức mạnh một vũ khí ==');
  const capHT = Mcu(3, 15, 6), dong = 1.2;
  console.log('Hiện tại: Thức tỉnh ×' + G.STAGE_MULT[3] + ' · mài +15 ×' + (1 + 0.08 * 15).toFixed(2) + ' · Rực lửa ×' + G.EP_DO.tong[6] + ' = ×' + capHT.toFixed(2) + ' (thêm 4 dòng hiệu ứng ≈ ×' + dong + ' → ≈ ×' + (capHT * dong).toFixed(1) + ')');
  console.log('Thường đạt cuối vùng 3 (Thức tỉnh +15 Vàng) ×' + Mcu(3, 15, 4).toFixed(2) + ' · Đỏ ×' + Mcu(3, 15, 5).toFixed(2) + ' | Luyện 15: ×' + LUYEN[15].M + ' | ChatGPT tính ×' + (G.STAGE_MULT[3] * G.EP_DO.tong[6]).toFixed(2) + ' (chưa có mài)');
  console.log('\n== D. Quy đổi bản lưu: (cấp hệ, mài, bậc) → M cũ → cấp Luyện, chênh sức mạnh, hoàn (vàng / LK / NLR) ==');
  for (const [st, sh, b] of [[0, 0, 0], [0, 3, 1], [1, 2, 1], [1, 5, 1], [1, 6, 2], [2, 3, 1], [2, 6, 3], [2, 9, 3], [2, 10, 4], [2, 12, 4], [3, 10, 4], [3, 15, 4], [3, 15, 5], [3, 15, 6], [3, 0, 0], [0, 15, 6]]) {
    const h = hoan(st, sh, b);
    console.log(pad(G.STAGE_NAMES[st] + ' +' + sh + ' ' + G.EP_DO.ten[b], 26), pad('×' + h.M.toFixed(2), 6), '→ L' + pad(h.L, 3), pad('×' + LUYEN[h.L].M.toFixed(2) + ' (' + ((LUYEN[h.L].M / h.M - 1) * 100 > 0 ? '+' : '') + ((LUYEN[h.L].M / h.M - 1) * 100).toFixed(0) + '%)', 14),
      '| cũ đã tiêu vàng', h.cu.vang, 'LK', h.cu.lk, 'NLR', h.cu.nlr, '| giá mới vàng', h.moi.vang, 'LK', h.moi.lk, 'NLR', h.moi.nlr, '| hoàn', h.vang, '/', h.lk, '/', h.nlr);
  }
  // E. bản lưu ở từng chỗ của chiến dịch hiện tại → chuyển → Sức mạnh mới / cũ (cùng cấp nhân vật, chưa tính bộ)
  const e = cu.ds.map((v) => {
    const a = docCu(v.sword), b = docCu(v.bow), n = cu.ds.indexOf(v), hoc = {};
    for (let k = 0; k < Math.floor(n / 5); k++) hoc[G.REGIONS[k].rescue] = 1;
    const vkCu = { sword: { st: a.st, sh: a.sh, ep: a.b }, bow: { st: b.st, sh: b.sh, ep: b.b }, spear: { st: 0, sh: 0, ep: 0 }, hammer: { st: 0, sh: 0, ep: 0 } };
    const La = capTuongDuong(Mcu(a.st, a.sh, a.b), a.st, a.b), Lb = capTuongDuong(Mcu(b.st, b.sh, b.b), b.st, b.b);
    const pc = T.nguoi({ lvl: v.lvl, hoc, vk: vkCu }).power, pm = nguoiMoi({ lvl: v.lvl, hoc, vk: { sword: { L: La }, bow: { L: Lb }, spear: { L: 1 }, hammer: { L: 1 } } }).power;
    return v.ai + ' L' + La + '/' + Lb + ' ' + ((pm / pc - 1) * 100 >= 0 ? '+' : '') + ((pm / pc - 1) * 100).toFixed(0) + '%';
  });
  console.log('E. Chuyển bản lưu ở từng ải của chiến dịch hiện tại (kiếm/phi tiêu → cấp Luyện, Sức mạnh mới so cũ):', e.join(' · '));
  const lo = G.FORGE_UP.slice(1).reduce((a, u) => ({ vang: a.vang + u.gold, quang: a.quang + (u.ore || 0), nl: a.nl.map((x, i) => x + u.mat[i]) }), { vang: 0, quang: 0, nl: [0, 0, 0] });
  console.log('Lò cấp 4 (bỏ lò): hoàn', lo.vang, 'vàng,', lo.quang, 'NLR,', lo.nl.join('/'), 'nguyên liệu vùng 1/2/3 (lò cấp k: hoàn đúng phần đã nâng)');
}
module.exports = { LUYEN, TRAN, chienDichMoi, nguoiMoi, Mcu, capTuongDuong, hoan };
