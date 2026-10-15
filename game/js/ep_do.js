// ÉP ĐỒ — đợt 6 (13/10/2026), docs/review/ke-hoach-cai-thien/he-thong-moi/YEU-CAU-6-EP-DO-AI-NGAY.md
//   - 4 vũ khí cố định có thêm trục "Bậc" (ép đồ) độc lập với trục "Cấp" hệ: Bậc Trắng → Xanh lam → Xanh lục → Tím → Vàng → Đỏ → Rực lửa.
//     Lưu trên từng vũ khí: w.ep = { b: 0..6, d: [{ m: mã dòng, q: 0,8..1,2 }], may: { '<bậc đích>': điểm may mắn } }.
//   - Ép tốn ĐÁ NÂNG BẬC (sv.daBac) + vàng (+ mảnh trùm ở Đỏ, Rực lửa); có tỉ lệ thất bại; từ Vàng trở lên thất bại tụt 1 bậc
//     (BÙA GIỮ BẬC sv.buaBac chặn). Điểm may mắn chống xui. Từ Tím mỗi bậc mở 1 dòng hiệu ứng ngẫu nhiên; đổi dòng (tẩy luyện) luôn thành công.
//   - Bảng số: G.EP_DO (js/data.js). Cờ tắt ?epdo=0 (G.EP_DO_BAT = false): bậc ×1, dòng không tác dụng, không rơi đá, ẩn thẻ Ép đồ.
//   - Móc trong trận: js/combat.js (G.wBase, playerHit, hurtPlayer, special), js/moves.js (nhịp đòn, tầm, xuyên), js/vk_moi.js (linh khí nhận).
//   - Bản lưu: bọc G.fixSave / G.newSave (nạp SAU js/vk_moi.js): sửa số hỏng, bản lưu cũ không có gì thì mọi vũ khí ở Bậc Trắng.
//   - Ảnh (docs/anh-goc/ep-do/cat_ep_do.py): gd-da-nang-bac, gd-bua-giu-bac, gd-o-ep-0..6, hu-ep-thanh-cong / that-bai / tut-bac.
//     Chưa có ảnh thì vẽ bằng code.
(function () {
  'use strict';
  const G = window.G, ui = G.ui;
  if (!G || !G.EP_DO) return;
  const E = (G.epDo = {});
  const CF = G.EP_DO, MAX = CF.ten.length - 1;
  const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
  const kep = (v, a, b) => (v < a ? a : v > b ? b : v);
  const DONG = {}; CF.dong.forEach((d) => { DONG[d.ma] = d; });
  const SOFT = '#a9c2b4', TXT = '#f1e6c6', GOLD = '#f6dc92', GOOD = '#9be07a', WARN = '#ff9a5a';
  if (G.ngonNgu && G.ngonNgu.them) G.ngonNgu.them({
    'Ép đồ': 'Refine', 'Bậc {0}': '{0} tier', 'Trắng': 'White', 'Xanh lam': 'Blue', 'Xanh lục': 'Green', 'Tím': 'Purple', 'Vàng': 'Gold', 'Đỏ': 'Red', 'Rực lửa': 'Blazing',
    'Đá nâng bậc': 'Tier stones', 'Bùa giữ bậc': 'Tier ward', '{0} đá nâng bậc': '{0} tier stones', '{0} bùa giữ bậc': '{0} tier wards',
    'Đá nâng bậc: {0} · Bùa giữ bậc: {1}': 'Tier stones: {0} · Tier wards: {1}',
    'Chí mạng': 'Crit chance', 'Sát thương chí mạng': 'Crit damage', 'Sát thương lên trùm, tinh anh': 'Damage vs bosses, elites', 'Hút máu': 'Life steal',
    'Tốc đánh': 'Attack speed', 'Giảm hồi chiêu đặc biệt': 'Special cooldown', 'Linh khí nhận': 'Spirit gain', 'Sát thương hệ': 'Element damage', 'Giảm sát thương nhận': 'Damage taken',
    'tốc đánh': 'attack speed', 'tầm đánh': 'reach', 'thời gian choáng': 'stun time', 'sát thương xuyên': 'pierce damage',
    'Ép lên {0}': 'Refine to {0}', 'Ép': 'Refine', 'Đổi': 'Reroll', 'Thôi': 'Cancel', 'Đã tối đa (Rực lửa)': 'Maxed (Blazing)',
    'Tỉ lệ: {0}%': 'Chance: {0}%', 'Tỉ lệ: {0}% (+{1}% may mắn)': 'Chance: {0}% (+{1}% luck)',
    'Thất bại: giữ bậc, mất đá và vàng': 'Fail: keep tier, lose stones and gold', 'Thất bại: tụt về Bậc {0}': 'Fail: drop to {0} tier',
    'Tốn: {0}': 'Cost: {0}', '{0} vàng': '{0} gold', '{0} mảnh {1}': '{0} {1} shards',
    'Thất bại sẽ tụt về Bậc {0} — dùng Bùa giữ bậc?': 'Failing drops it to {0} tier — use a Tier ward?',
    'Thất bại sẽ tụt về Bậc {0}. Không có Bùa giữ bậc. Vẫn ép?': 'Failing drops it to {0} tier. No Tier ward. Refine anyway?',
    'Dùng bùa': 'Use ward', 'Không dùng': 'No ward', 'Vẫn ép': 'Refine',
    'Thành công!': 'Success!', 'Thất bại…': 'Failed…', 'Tụt bậc!': 'Tier lost!',
    '{0} lên Bậc {1}!': '{0} reached {1} tier!', '{0} ép hỏng, giữ Bậc {1}.': '{0} failed, stays {1} tier.', '{0} tụt về Bậc {1}.': '{0} dropped to {1} tier.',
    'Bùa giữ bậc đã giữ {0} ở Bậc {1}.': 'The ward kept {0} at {1} tier.', 'Dòng mới: {0}': 'New line: {0}', 'Mất dòng: {0}': 'Lost line: {0}',
    'Đổi dòng · {0}': 'Reroll · {0}', 'Đã đổi dòng: {0}': 'Rerolled: {0}', 'Dòng hiệu ứng (khi đang cầm)': 'Lines (while held)',
    'Từ Bậc Tím mỗi bậc mở 1 dòng hiệu ứng.': 'From Purple tier, each tier opens 1 effect line.',
    'Sát thương ×{0} · {1} +{2}%': 'Damage ×{0} · {1} +{2}%', 'Sức mạnh vũ khí ×{0} → ×{1}': 'Weapon power ×{0} → ×{1}',
    'Thiếu đá nâng bậc': 'Need tier stones', 'Thiếu vàng': 'Need gold', 'Thiếu mảnh trùm': 'Need boss shards', 'Ép đồ đang tắt (?epdo=0)': 'Refining is off (?epdo=0)',
    'Đá nâng bậc rơi từ trùm và Ải Đá Bậc (ải ngày).': 'Tier stones drop from bosses and the Stone Trial (daily).',
    'Chọn một vũ khí để ép.': 'Pick a weapon to refine.', 'Bùa giữ bậc': 'Tier ward', 'Ép không tụt bậc': 'No tier loss',
    'Xuyên thêm 1 quái': '+1 pierce',
    'Ép vũ khí lên bậc (Ông Thợ Rèn, thẻ Ép đồ), đổi dòng hiệu ứng': 'Refine weapon tiers (Blacksmith, Refine tab), reroll lines',
    'Trùm nhỏ, trùm vùng (lần đầu nhiều hơn), Ải Đá Bậc (ải ngày)': 'Mini bosses, region bosses (more the first time), Stone Trial (daily)',
    'Ép từ Vàng trở lên mà hỏng thì không tụt bậc': 'Failing from Gold up does not drop a tier',
    'Trùm vùng, Ải Đá Bậc mức Khó, thương nhân trong ải': 'Region bosses, Hard Stone Trial, stage merchant',
    'Đủ đá rồi! Ép lên bậc cao thì có thể hỏng, từ Vàng trở lên hỏng là tụt bậc.': 'Enough stones! High tiers can fail; from Gold up a failure drops a tier.',
    'Đá nâng bậc rơi từ trùm và Ải Đá Bậc. Từ bậc Tím vũ khí có dòng hiệu ứng.': 'Tier stones drop from bosses and the Stone Trial. From Purple tier weapons gain effect lines.', '+{0} đá nâng bậc': '+{0} tier stones', '+{0} bùa giữ bậc': '+{0} tier ward',
  });
  E.bat = () => G.EP_DO_BAT !== false;
  E.MAX = MAX;
  E.tenBac = (b) => G.tv(CF.ten[kep(b | 0, 0, MAX)]);
  E.mauBac = (b) => CF.mau[kep(b | 0, 0, MAX)];
  const soDong = (b) => Math.max(0, (b | 0) - (CF.dongTu - 1));
  E.soDong = soDong;
  const pct = (v, d) => { const s = (v * 100).toFixed(d == null ? 1 : d).replace(/\.0$/, ''); return G.LANG === 'en' ? s : s.replace('.', ','); };
  const so2 = (v) => { const s = v.toFixed(2); return G.LANG === 'en' ? s : s.replace('.', ','); };

  // ---------- trạng thái của một vũ khí ----------
  function ep(w) { // luôn trả về đối tượng (tạo nếu thiếu)
    if (!w.ep || typeof w.ep !== 'object' || Array.isArray(w.ep)) w.ep = { b: 0, d: [], may: {} };
    if (!Array.isArray(w.ep.d)) w.ep.d = [];
    if (!w.ep.may || typeof w.ep.may !== 'object' || Array.isArray(w.ep.may)) w.ep.may = {};
    return w.ep;
  }
  E.bac = (w) => (w && w.ep ? kep(num(w.ep.b, 0) | 0, 0, MAX) : 0);
  // Sát thương: tổng sức mạnh bậc chia phần phụ của loại (G.wBase nhân số này)
  E.satThuong = function (w) {
    if (!E.bat() || !w) return 1;
    const b = E.bac(w);
    if (!b) return 1;
    const f = CF.phu[w.type];
    return CF.tong[b] / (1 + (f ? f.giaTri * b : 0));
  };
  E.phu = (w) => { if (!E.bat() || !w) return 0; const f = CF.phu[w.type]; return f ? f.moi * E.bac(w) : 0; };
  E.giaTriDong = function (w, d) { const D = DONG[d.m]; return D ? D.goc * CF.heSo[E.bac(w)] * kep(num(d.q, 1), 0.8, 1.2) : 0; };
  // Tổng giá trị dòng mã m trên vũ khí w (0 khi tắt)
  E.dong = function (w, m) {
    if (!E.bat() || !w || !w.ep || !Array.isArray(w.ep.d)) return 0;
    let v = 0;
    for (const d of w.ep.d) if (d && d.m === m) v += E.giaTriDong(w, d);
    return v;
  };
  E.dongP = (P, m) => (P && P.weapons ? E.dong(P.weapons[P.cur], m) : 0); // vũ khí đang cầm
  // ---------- móc trận đánh ----------
  E.nhip = (P, w) => 1 / (1 + (w && w.type === 'sword' ? E.phu(w) : 0) + E.dong(w, 'tocDanh')); // hệ số thời gian một nhát
  E.tam = (w) => 1 + (w && w.type === 'spear' ? E.phu(w) : 0);
  E.choang = (w) => 1 + (w && w.type === 'hammer' ? E.phu(w) : 0);
  E.xuyen = function (w, pierce, pierceMult) {
    if (!w || w.type !== 'bow' || !E.bat()) return [pierce, pierceMult];
    const b = E.bac(w);
    return [pierce + (b >= (CF.phu.bow.them1 || 99) ? 1 : 0), pierceMult == null ? pierceMult : Math.min(1, pierceMult * (1 + E.phu(w)))];
  };
  // Đòn của người chơi trúng quái: { cm (thêm tỉ lệ chí mạng), xcm (thêm hệ số chí mạng), k (hệ số sát thương ngoài chí mạng) }
  E.danh = function (P, w, e, el) {
    if (!E.bat() || !w) return null;
    let k = 1;
    if (e && (e.isBoss || e.role === 'elite')) k *= 1 + E.dong(w, 'trum');
    if (el) k *= 1 + E.dong(w, 'stHe');
    return { cm: E.dong(w, 'chiMang'), xcm: E.dong(w, 'stChiMang'), k };
  };
  E.hut = function (P, w, d) {
    const h = E.dong(w, 'hutMau');
    if (!(h > 0) || !P || P.dead || !(d > 0)) return;
    P.hp = Math.min(P.maxhp, P.hp + Math.min(d * h, P.maxhp * CF.hutToiDa));
  };
  E.nhan = (P) => 1 - Math.min(0.5, E.dongP(P, 'giamST'));
  E.hoiChieu = (P) => 1 - Math.min(0.5, E.dongP(P, 'hoiChieu'));
  E.linhKhi = (P) => 1 + E.dongP(P, 'linhKhi');
  // Sức mạnh (G.powerParts): phần dòng hiệu ứng tính gần đúng vào đòn
  E.sucManh = function (w) {
    if (!E.bat() || !w) return 1;
    const cm = E.dong(w, 'chiMang'), x = E.dong(w, 'stChiMang');
    return (1 + cm + 0.1 * x) * (1 + 0.5 * E.dong(w, 'trum')) * (1 + E.dong(w, 'tocDanh')) * (1 + 0.5 * E.dong(w, 'stHe')) * (1 + 0.5 * E.dong(w, 'hutMau') * 10);
  };

  // ---------- đá, bùa ----------
  E.da = (sv) => Math.max(0, num((sv || G.save || {}).daBac, 0) | 0);
  E.bua = (sv) => Math.max(0, num((sv || G.save || {}).buaBac, 0) | 0);
  E.themDa = (sv, n) => { sv = sv || G.save; if (sv && n > 0) sv.daBac = E.da(sv) + Math.round(n); };
  E.themBua = (sv, n) => { sv = sv || G.save; if (sv && n > 0) sv.buaBac = E.bua(sv) + Math.round(n); };
  // Thưởng đá khi hạ trùm (js/stage.js settle gọi lúc thắng). big: trùm vùng; dau: lần đầu qua ải đó (ở độ khó này). Trả về các dòng chữ.
  E.thuongTrum = function (sv, r, big, dau, diff) {
    if (!E.bat() || !sv) return [];
    const R = CF.roi, i = kep(r | 0, 0, 2);
    let n = big ? (dau ? R.vungDau[i] : R.vung[i]) : dau ? R.miniDau[i] : R.mini[i];
    if (diff) n = Math.round(n * R.kho2);
    const out = [];
    if (n > 0) { E.themDa(sv, n); out.push(['+{0} đá nâng bậc', n]); }
    if (big && Math.random() < CF.bua.trumVung) { E.themBua(sv, 1); out.push(['+{0} bùa giữ bậc', 1]); }
    return out;
  };

  // ---------- ép ----------
  E.gia = (bDich) => (bDich >= 1 && bDich <= MAX ? CF.gia[bDich] : null);
  E.tiLe = function (w) {
    const b = E.bac(w), t = b + 1;
    if (t > MAX) return null;
    const goc = CF.tiLe[t], may = Math.max(0, num(w.ep && w.ep.may ? w.ep.may[t] : 0, 0));
    return { goc, may, tong: Math.min(1, goc + may) };
  };
  E.tutVe = (w) => { const b = E.bac(w); return b + 1 >= CF.tutTu ? b - 1 : null; }; // thất bại thì tụt về bậc này (null: giữ bậc)
  const coTien = (sv, g) => {
    if (!g) return 'Đã tối đa (Rực lửa)';
    if (E.da(sv) < g.da) return 'Thiếu đá nâng bậc';
    if ((sv.gold | 0) < (g.vang | 0)) return 'Thiếu vàng';
    if (g.manh) for (let i = 0; i < 3; i++) if (num(sv.shards && sv.shards[i], 0) < (g.manh[i] | 0)) return 'Thiếu mảnh trùm';
    return '';
  };
  const tra = (sv, g) => {
    sv.daBac = E.da(sv) - g.da; sv.gold -= g.vang | 0;
    if (g.manh) for (let i = 0; i < 3; i++) sv.shards[i] -= g.manh[i] | 0;
  };
  E.duoc = function (sv, w) { if (!E.bat()) return 'Ép đồ đang tắt (?epdo=0)'; return coTien(sv, E.gia(E.bac(w) + 1)); };
  function dongMoi(w) { // một dòng ngẫu nhiên chưa có trên món
    const co = (w.ep.d || []).map((d) => d.m), ds = CF.dong.filter((d) => co.indexOf(d.ma) < 0);
    const D = ds.length ? ds[Math.floor(Math.random() * ds.length)] : CF.dong[Math.floor(Math.random() * CF.dong.length)];
    return { m: D.ma, q: Math.round((0.8 + Math.random() * 0.4) * 100) / 100 };
  }
  // Ép w lên bậc kế. dungBua: dùng bùa giữ bậc (chỉ tốn khi thất bại mà có nguy cơ tụt). Trả về kết quả hoặc null nếu không ép được.
  E.ep = function (sv, w, dungBua) {
    if (!sv || !w || E.duoc(sv, w) !== '') return null;
    const o = ep(w), b0 = E.bac(w), t = b0 + 1, g = E.gia(t), tl = E.tiLe(w);
    tra(sv, g);
    const kq = { b0, b1: b0, ok: false, tut: false, bua: false, them: null, mat: null, tiLe: tl.tong };
    if (Math.random() < tl.tong) {
      o.b = t; kq.ok = true; kq.b1 = t; o.may[t] = 0; delete o.may[t];
      while (o.d.length < soDong(t)) { const d = dongMoi(w); o.d.push(d); kq.them = d; }
    } else {
      o.may[t] = Math.round((num(o.may[t], 0) + CF.mayMan) * 100) / 100;
      if (t >= CF.tutTu) {
        if (dungBua && E.bua(sv) > 0) { sv.buaBac = E.bua(sv) - 1; kq.bua = true; }
        else {
          o.b = Math.max(0, b0 - 1); kq.tut = true; kq.b1 = o.b;
          while (o.d.length > soDong(o.b)) kq.mat = o.d.pop(); // mất dòng mới nhất
        }
      }
    }
    return kq;
  };
  E.giaDoi = (w) => CF.doiDong[E.bac(w)] || null;
  E.doiDong = function (sv, w, i) {
    if (!sv || !w || !E.bat()) return null;
    const g = E.giaDoi(w);
    if (!g || coTien(sv, g) !== '') return null;
    const o = ep(w);
    if (!o.d[i]) return null;
    tra(sv, g);
    const cu = o.d.splice(i, 1)[0];
    let d = dongMoi(w); // dòng chưa có trên món (dòng cũ đã gỡ ra nên có thể ra lại; thử vài lần để khác dòng cũ)
    for (let k = 0; k < 6 && d.m === cu.m; k++) d = dongMoi(w);
    o.d.splice(i, 0, d);
    return d;
  };
  E.chuDong = function (w, d) { // "Chí mạng +4,8%"
    const D = DONG[d.m];
    if (!D) return '?';
    return G.tv(D.ten) + ' +' + pct(E.giaTriDong(w, d)) + '%';
  };
  E.chuPhu = function (w, b) { // phần phụ của loại ở bậc b
    const f = CF.phu[w.type];
    if (!f || !b) return '';
    let s = G.tv(f.ten) + ' +' + pct(f.moi * b) + '%';
    if (w.type === 'bow' && b >= (f.them1 || 99)) s += ', ' + G.tv('Xuyên thêm 1 quái');
    return s;
  };
  E.coTheEp = (sv) => { sv = sv || G.save; return !!(E.bat() && sv && Array.isArray(sv.weapons) && sv.weapons.some((w) => E.duoc(sv, w) === '')); };

  // ---------- bản lưu ----------
  function sua(s) {
    if (!s || typeof s !== 'object') return s;
    s.daBac = Math.max(0, Math.floor(num(s.daBac, 0)));
    s.buaBac = Math.max(0, Math.floor(num(s.buaBac, 0)));
    for (const w of Array.isArray(s.weapons) ? s.weapons : []) {
      if (!w || typeof w !== 'object') continue;
      if (w.ep == null) continue;
      if (typeof w.ep !== 'object' || Array.isArray(w.ep)) { delete w.ep; continue; }
      const o = ep(w);
      o.b = kep(Math.floor(num(o.b, 0)), 0, MAX);
      const seen = {};
      o.d = o.d.filter((d) => d && typeof d === 'object' && DONG[d.m] && !seen[d.m] && (seen[d.m] = true)).map((d) => ({ m: d.m, q: Math.round(kep(num(d.q, 1), 0.8, 1.2) * 100) / 100 }));
      while (o.d.length > soDong(o.b)) o.d.pop();
      while (o.d.length < soDong(o.b)) o.d.push(dongMoi(w));
      const may = {};
      for (const k in o.may) { const t = k | 0, v = num(o.may[k], 0); if (t >= 1 && t <= MAX && v > 0) may[t] = Math.round(Math.min(1, v) * 100) / 100; }
      o.may = may;
      if (!o.b && !o.d.length && !Object.keys(may).length) delete w.ep;
    }
    return s;
  }
  E.sua = sua;
  if (G.fixSave && !G.fixSave.epDoBoc) {
    const goc = G.fixSave;
    G.fixSave = function () {
      const r = goc.apply(this, arguments);
      try { sua(r); } catch (e) { console.error('Linh Khí: lỗi khi sửa phần ép đồ của bản lưu (bỏ qua)', e); }
      return r;
    };
    G.fixSave.epDoBoc = true;
  }
  if (G.newSave && !G.newSave.epDoBoc) {
    const goc = G.newSave;
    G.newSave = function () { const s = goc.apply(this, arguments); if (s && typeof s === 'object') { s.daBac = 0; s.buaBac = 0; } return s; };
    G.newSave.epDoBoc = true;
  }
  // Chi phí đòn Đặc biệt theo vũ khí đang cầm (dòng "Giảm hồi chiêu đặc biệt"): P.specCost cập nhật mỗi khung từ P.specCostGoc
  if (G.buildPlayer && !G.buildPlayer.epDoBoc) {
    const goc = G.buildPlayer;
    G.buildPlayer = function () { const P = goc.apply(this, arguments); if (P) P.specCostGoc = P.specCost; return P; };
    G.buildPlayer.epDoBoc = true;
  }
  if (G.updatePlayer && !G.updatePlayer.epDoBoc) {
    const goc = G.updatePlayer;
    G.updatePlayer = function (P) {
      try { if (P && P.specCostGoc != null) P.specCost = Math.round(P.specCostGoc * E.hoiChieu(P)); } catch (e) { /* bỏ qua */ }
      return goc.apply(this, arguments);
    };
    G.updatePlayer.epDoBoc = true;
  }

  // ---------- vẽ ----------
  const SC = () => G.spriteCustom;
  const gd = (ma) => { const s = SC(); return s && s.gdSan ? s.gdSan(ma) : null; };
  // Ô vũ khí theo bậc: ảnh gd-o-ep-<bậc>; chưa có ảnh thì khung màu bằng code (Rực lửa: viền lửa chạy)
  E.o = function (x, y, s, b) {
    const g = gd('gd-o-ep-' + b), c = G.ux;
    if (g && SC().veGd(c, g, x, y, s, s)) return;
    ui.rect(x, y, s, s, '#141a22');
    E.vien(c, x, y, s, s, b, true);
  };
  // Viền màu bậc nhuộm bằng code (ô vũ khí trong trận, ô dự phòng khi thiếu ảnh). Rực lửa: lửa chạy quanh viền.
  // trang: vẽ cả viền bậc Trắng (ô vũ khí trong trận: khung ảnh không còn theo bậc màu cũ G.RARITY, viền luôn theo bậc ép đồ)
  E.vien = function (c, x, y, w, h, b, luonVe, trang) {
    if (!E.bat() || (!b && !luonVe && !trang)) return;
    c.save();
    c.strokeStyle = E.mauBac(b); c.lineWidth = 1.5; c.strokeRect(x + 1, y + 1, w - 2, h - 2);
    if (luonVe) { c.strokeStyle = 'rgba(0,0,0,0.6)'; c.lineWidth = 1; c.strokeRect(x + 3.5, y + 3.5, w - 7, h - 7); }
    if (b >= MAX) {
      const t = G.time || 0, per = 2 * (w + h);
      for (let k = 0; k < 12; k++) {
        let d = ((k / 12 + t * 0.35) % 1) * per;
        let px, py;
        if (d < w) { px = x + d; py = y; } else if ((d -= w) < h) { px = x + w; py = y + d; } else if ((d -= h) < w) { px = x + w - d; py = y + h; } else { d -= w; px = x; py = y + h - d; }
        c.fillStyle = k % 2 ? '#ffd23f' : '#ff5a1a'; c.fillRect(px - 1.5, py - 2.5 - Math.sin(t * 9 + k) * 1.2, 3, 3);
      }
    }
    c.restore();
  };
  // Vũ khí còn sót 14/10: màu chữ, tên bậc, ô hình của một vũ khí theo BẬC ÉP ĐỒ (thay bậc màu cũ G.RARITY Thường/Lam/Tím/Vàng).
  // Ép đồ tắt (?epdo=0): màu Trắng, ô thường bậc 0.
  G.bacMauVk = (w) => (E.bat() ? E.mauBac(E.bac(w)) : CF.mau[0]);
  G.bacTenVk = (w) => E.tenBac(E.bat() ? E.bac(w) : 0);
  // Ô: đã ép (bậc > 0) thì ô ép đồ gd-o-ep-<bậc>; bậc Trắng thì ô thường (như bảng Linh khí của js/vk_moi.js).
  G.oBacVk = function (x, y, s, w) { const b = E.bat() ? E.bac(w) : 0; if (b) E.o(x, y, s, b); else if (G.theme) G.theme.slot(x, y, s, 0); };
  E.iconDa = function (x, y, s) {
    const g = gd('gd-da-nang-bac');
    if (g && SC().veGd(G.ux, g, x - s / 2, y - s / 2, s, s)) return;
    const c = G.ux; c.fillStyle = '#3a1a5a'; c.beginPath(); c.moveTo(x, y - s / 2); c.lineTo(x + s * 0.35, y - s * 0.2); c.lineTo(x + s * 0.35, y + s * 0.2); c.lineTo(x, y + s / 2); c.lineTo(x - s * 0.35, y + s * 0.2); c.lineTo(x - s * 0.35, y - s * 0.2); c.closePath(); c.fill();
    c.fillStyle = '#b06aff'; c.fillRect(x - s * 0.2, y - s * 0.25, s * 0.4, s * 0.5); c.fillStyle = '#ffd23f'; c.fillRect(x - 0.5, y - s * 0.15, 1, s * 0.3);
  };
  E.iconBua = function (x, y, s) {
    const g = gd('gd-bua-giu-bac');
    if (g && SC().veGd(G.ux, g, x - s / 2, y - s / 2, s, s)) return;
    ui.rect(x - s * 0.22, y - s * 0.4, s * 0.44, s * 0.8, '#ffd24a', '#7a4a10'); ui.rect(x - 1, y - s * 0.25, 2, s * 0.5, '#d0302a');
  };
  E.ui = { sel: null, hoi: null, fx: null, doi: null };
  const FX_MA = { ok: 'hu-ep-thanh-cong', fail: 'hu-ep-that-bai', tut: 'hu-ep-tut-bac' };
  const FX_CHU = { ok: ['Thành công!', '#ffe46a'], fail: ['Thất bại…', '#c0c0c0'], tut: ['Tụt bậc!', '#ff6a5a'] };
  // Hiệu ứng ép trên ô vũ khí (cx, cy: giữa ô). Có ảnh thì phát ảnh, không thì vẽ code: chớp sáng / khói xám / vỡ vụn.
  function veFx(cx, cy, s) {
    const f = E.ui.fx;
    if (!f) return;
    const t = (G.time || 0) - f.t0;
    if (t > 1.6) { E.ui.fx = null; return; }
    const c = G.ux, FA = G.fxAnh, ma = FX_MA[f.k];
    let ve = false;
    if (FA && FA.co && FA.co(ma) && t < 0.95) ve = FA.ve(c, ma, cx, cy + s * 0.45, t, 0, 1.15);
    if (!ve && t < 0.9) {
      const k = t / 0.9;
      c.save();
      if (f.k === 'ok') { // chớp sáng
        c.globalAlpha = 1 - k; c.fillStyle = '#fff3a0'; c.fillRect(cx - s * (0.2 + k * 0.4), cy - s * 1.2, s * (0.4 + k * 0.8), s * 1.7);
        for (let i = 0; i < 8; i++) { const a = i * 0.785 + t * 3, r = s * (0.3 + k * 0.6); c.fillStyle = '#ffd23f'; c.fillRect(cx + Math.cos(a) * r - 1, cy + Math.sin(a) * r - 1, 2, 2); }
      } else if (f.k === 'fail') { // khói xám
        for (let i = 0; i < 5; i++) { c.globalAlpha = (1 - k) * 0.7; c.fillStyle = '#8a8a8a'; c.beginPath(); c.arc(cx + (i - 2) * 5, cy - k * s * 0.8 - i * 3, 4 + k * 6, 0, 7); c.fill(); }
      } else { // vỡ vụn + chớp đỏ
        c.globalAlpha = (1 - k) * 0.5; c.fillStyle = '#ff2a1a'; c.fillRect(cx - s / 2, cy - s / 2, s, s);
        c.globalAlpha = 1 - k;
        for (let i = 0; i < 9; i++) { const a = i * 0.7, r = k * s * 0.8; c.fillStyle = i % 2 ? '#ff5a44' : '#c02a20'; c.fillRect(cx + Math.cos(a) * r - 2, cy + Math.sin(a) * r + k * k * 12 - 2, 3, 3); }
      }
      c.restore();
    }
    const q = FX_CHU[f.k];
    ui.text(G.tv(q[0]), cx, cy - s * 0.65 - Math.min(1, t * 3) * 4, { size: 9, bold: true, align: 'center', color: q[1] });
  }
  const costText = (g) => {
    const a = [G.t('{0} đá nâng bậc', g.da)];
    if (g.vang) a.push(G.t('{0} vàng', g.vang));
    if (g.manh) g.manh.forEach((n, i) => { if (n) a.push(G.t('{0} mảnh {1}', n, G.REGIONS[i].bossName)); });
    return a.join(', ');
  };
  function cat(s, w, size, bold) {
    s = G.tv ? G.tv(String(s)) : String(s);
    ui.font(Math.max(6.5, size), bold);
    const c = G.ux;
    if (c.measureText(s).width <= w) return s;
    let lo = 0, hi = s.length;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (c.measureText(s.slice(0, m) + '…').width <= w) lo = m; else hi = m - 1; }
    return s.slice(0, lo).trimEnd() + '…';
  }
  const tx = (s, x, y, w, o) => ui.text(cat(s, w, o.size || 8, o.bold), x, y, o);

  // Bảng ép đồ (Ông Thợ Rèn thẻ "Ép đồ", Hành trang › Vũ khí). o: { ro (chỉ xem), say(s), h (chiều cao) }. Trả về y cuối.
  E.panel = function (x, y, wd, o) {
    o = o || {};
    const T = G.theme, sv = G.save, say = o.say || (() => {}), ro = !!o.ro, h = o.h || 168;
    if (!T || !sv || !Array.isArray(sv.weapons)) return y;
    const U = E.ui;
    // dải tài nguyên
    E.iconDa(x + 6, y + 6, 12); ui.text(String(E.da(sv)), x + 14, y + 9.5, { size: 8, bold: true, color: '#d9b0ff' });
    E.iconBua(x + 48, y + 6, 12); ui.text(String(E.bua(sv)), x + 56, y + 9.5, { size: 8, bold: true, color: GOLD });
    tx(E.bat() ? 'Đá nâng bậc rơi từ trùm và Ải Đá Bậc (ải ngày).' : 'Ép đồ đang tắt (?epdo=0)', x + 76, y + 9.5, wd - 78, { size: 6.5, color: E.bat() ? SOFT : WARN });
    y += 15;
    // cột trái: 4 vũ khí
    const lw = 100, rowH = Math.min(38, Math.floor((h - 16) / 4));
    if (U.sel == null || !sv.weapons.some((w) => w.id === U.sel)) U.sel = sv.weapons[0] && sv.weapons[0].id;
    sv.weapons.forEach((w, i) => {
      const yy = y + i * rowH, b = E.bac(w), sel = U.sel === w.id;
      T.inset(x, yy, lw, rowH - 2, sel);
      E.o(x + 2, yy + 2, rowH - 6, b);
      G.art.weaponIcon(G.ux, w, x + 2 + (rowH - 6) / 2, yy + 2 + (rowH - 6) / 2, rowH - 14);
      tx(G.tv(G.WTYPES[w.type].name), x + rowH, yy + 12, lw - rowH - 3, { size: 7.5, bold: true, color: E.mauBac(b) });
      tx(G.t('Bậc {0}', E.tenBac(b)), x + rowH, yy + 23, lw - rowH - 3, { size: 6.5, color: E.mauBac(b) });
      if (!ro && E.duoc(sv, w) === '') { const c = G.ux; c.fillStyle = GOOD; c.beginPath(); c.arc(x + lw - 5, yy + 5, 2.4, 0, 7); c.fill(); }
      if (G.click && G.inRect(G.click, x, yy, lw, rowH - 2)) { U.sel = w.id; U.hoi = null; U.doi = null; G.click = null; G.sfx('ui'); }
    });
    // cột phải: chi tiết
    const w = sv.weapons.find((q) => q.id === U.sel);
    const rx = x + lw + 6, rw = wd - lw - 6, l5 = T.chuMoi && T.chuMoi() ? 6 : 5; // chu-lech-khung: lòng ô ảnh từ 3,5 + 2 đệm
    T.inset(rx, y, rw, h - 16, false);
    if (!w) { ui.text(G.tv('Chọn một vũ khí để ép.'), rx + 6, y + 14, { size: 7.5, color: SOFT }); return y + h - 16; }
    const b = E.bac(w), t = b + 1, g = E.gia(t), tl = E.tiLe(w);
    let yy = y + 11;
    if (T.chuMoi && T.chuMoi()) T.chuO(G.wName(w) + ' · ' + G.t('Bậc {0}', E.tenBac(b)), rx, y, rw, h - 16, { align: 'left', vung: [rx, y, rw, 15], size: 8, min: 7, bold: true, color: E.mauBac(b) }); // chu-lech-khung: dòng đầu tránh núm góc ô
    else tx(G.wName(w) + ' · ' + G.t('Bậc {0}', E.tenBac(b)), rx + 5, yy, rw - 10, { size: 8, bold: true, color: E.mauBac(b) });
    yy += 10;
    const k0 = CF.tong[b], k1 = t <= MAX ? CF.tong[t] : null;
    tx(k1 ? G.t('Sức mạnh vũ khí ×{0} → ×{1}', so2(k0), so2(k1)) : G.t('Sức mạnh vũ khí ×{0} → ×{1}', so2(k0), so2(k0)), rx + l5, yy, rw - 10, { size: 6.8, color: TXT });
    yy += 9;
    const ph = E.chuPhu(w, t <= MAX ? t : b);
    if (ph) { tx((t <= MAX ? G.t('Ép lên {0}', E.tenBac(t)) + ': ' : '') + ph, rx + l5, yy, rw - 10, { size: 6.5, color: SOFT }); yy += 9; }
    // dòng hiệu ứng
    tx(soDong(b) ? 'Dòng hiệu ứng (khi đang cầm)' : 'Từ Bậc Tím mỗi bậc mở 1 dòng hiệu ứng.', rx + l5, yy, rw - 10, { size: 6.5, bold: !!soDong(b), color: soDong(b) ? GOLD : SOFT });
    yy += 3;
    const gd2 = E.giaDoi(w);
    (w.ep && w.ep.d ? w.ep.d : []).forEach((d, i) => {
      yy += 10;
      tx('• ' + E.chuDong(w, d), rx + 7, yy, rw - (ro ? 12 : 64), { size: 6.8, color: GOOD });
      if (!ro && gd2) {
        const ok = coTien(sv, gd2) === '' && E.bat();
        if (T.sbtn(rx + rw - 56, yy - 8, 52, 11, G.t('Đổi dòng · {0}', gd2.da), { size: 6, pad: 1, disabled: !ok })) { U.doi = i; U.hoi = null; }
      }
    });
    // ô vũ khí lớn bên phải + hiệu ứng
    // phần ép (dưới cùng) và ô vũ khí lớn ngay trên nút Ép, hiệu ứng ép phát trên ô này
    const yb = y + h - 16 - 34, bs = 30, bx = rx + rw - bs - 6, by = yb - bs - 3;
    E.o(bx, by, bs, b); G.art.weaponIcon(G.ux, w, bx + bs / 2, by + bs / 2, bs - 10); veFx(bx + bs / 2, by + bs / 2, bs);
    if (ro) return y + h - 16;
    if (U.doi != null && w.ep && w.ep.d && w.ep.d[U.doi]) { // xác nhận đổi dòng
      const d = w.ep.d[U.doi];
      tx(G.t('Đổi dòng · {0}', E.chuDong(w, d)) + ' — ' + G.t('Tốn: {0}', costText(gd2)), rx + l5, yb + 8, rw - 10, { size: 6.5, color: TXT });
      if (T.sbtn(rx + 5, yb + 14, 70, 15, 'Đổi', { size: 7, pad: 1, primary: true })) {
        const nd = E.doiDong(sv, w, U.doi);
        U.doi = null;
        if (nd) { G.persist(); G.sfx('evolve'); say(G.t('Đã đổi dòng: {0}', E.chuDong(w, nd))); U.fx = { k: 'ok', t0: G.time || 0 }; }
      }
      if (T.sbtn(rx + 80, yb + 14, 50, 15, 'Thôi', { size: 7, pad: 1 })) U.doi = null;
      return y + h - 16;
    }
    if (!g) { ui.text(G.tv('Đã tối đa (Rực lửa)'), rx + l5, yb + 18, { size: 8, bold: true, color: GOOD }); return y + h - 16; }
    const tu = E.tutVe(w);
    tx(G.t('Tốn: {0}', costText(g)), rx + l5, yb + 2, rw - 50, { size: 6.5, color: coTien(sv, g) ? WARN : TXT });
    tx(tl.may > 0 ? G.t('Tỉ lệ: {0}% (+{1}% may mắn)', Math.round(CF.tiLe[t] * 100), Math.round(tl.may * 100)) : G.t('Tỉ lệ: {0}%', Math.round(tl.tong * 100)), rx + l5, yb + 11, rw - 50, { size: 6.8, bold: true, color: tl.tong >= 0.75 ? GOOD : tl.tong >= 0.45 ? GOLD : WARN });
    tx(tu == null ? 'Thất bại: giữ bậc, mất đá và vàng' : G.t('Thất bại: tụt về Bậc {0}', E.tenBac(tu)), rx + l5, yb + 20, rw - 50, { size: 6.5, color: tu == null ? SOFT : WARN });
    const why = E.duoc(sv, w);
    const lam = (dungBua) => {
      const kq = E.ep(sv, w, dungBua);
      U.hoi = null;
      if (!kq) return;
      G.persist();
      const ten = G.tv(G.WTYPES[w.type].name);
      if (kq.ok) { G.sfx('evolve'); U.fx = { k: 'ok', t0: G.time || 0 }; say(G.t('{0} lên Bậc {1}!', ten, E.tenBac(kq.b1)) + (kq.them ? ' ' + G.t('Dòng mới: {0}', E.chuDong(w, kq.them)) : '')); }
      else if (kq.tut) { G.sfx('hurt'); U.fx = { k: 'tut', t0: G.time || 0 }; say(G.t('{0} tụt về Bậc {1}.', ten, E.tenBac(kq.b1)) + (kq.mat ? ' ' + G.t('Mất dòng: {0}', G.tv(DONG[kq.mat.m].ten)) : '')); }
      else { G.sfx('ui'); U.fx = { k: 'fail', t0: G.time || 0 }; say(kq.bua ? G.t('Bùa giữ bậc đã giữ {0} ở Bậc {1}.', ten, E.tenBac(kq.b1)) : G.t('{0} ép hỏng, giữ Bậc {1}.', ten, E.tenBac(kq.b1))); }
    };
    if (U.hoi === w.id && tu != null) { // hỏi xác nhận khi có nguy cơ tụt bậc
      const coBua = E.bua(sv) > 0, hoiChu = coBua ? G.t('Thất bại sẽ tụt về Bậc {0} — dùng Bùa giữ bậc?', E.tenBac(tu)) : G.t('Thất bại sẽ tụt về Bậc {0}. Không có Bùa giữ bậc. Vẫn ép?', E.tenBac(tu));
      let yq = yb + 16; const nh = T.chuMoi && T.chuMoi() ? 15 : 14;
      if (T.chuMoi && T.chuMoi()) { // chu-lech-khung: hộp cao 36 thì dòng hỏi nằm trên viền ảnh → hộp cao 40 (lên trên 4), lời hỏi trong lòng hộp, nút dưới
        const go = T.khungCanhBao && T.khungCanhBao(rx + 1, yb - 8, rw - 2, 40);
        if (!go) ui.rect(rx + 1, yb - 8, rw - 2, 40, 'rgba(20,10,10,0.94)', '#ff9a5a');
        T.chuTrongKhung(hoiChu, rx + 1, yb - 8, rw - 2, 40, { khung: go ? 'gd-khung-canh-bao' : null, vien: [2, 2, 2, 2], vung: [rx + 1, yb - 8, rw - 2, 20.5], align: 'left', dong: 2, gian: 1.5, size: 7, min: 6.5, bold: false, color: TXT });
        yq = yb + 12.5;
      } else {
      if (!(T.khungCanhBao && T.khungCanhBao(rx + 1, yb - 4, rw - 2, 36))) ui.rect(rx + 1, yb - 4, rw - 2, 36, 'rgba(20,10,10,0.94)', '#ff9a5a'); // 15/10: ảnh gd-khung-canh-bao
      ui.para(hoiChu, rx + 5, yb + 4, rw - 10, { size: 6.5, color: TXT });
      }
      if (coBua) {
        if (T.sbtn(rx + 5, yq, 60, nh, 'Dùng bùa', { size: 6.8, pad: 1, primary: true })) lam(true);
        if (T.sbtn(rx + 68, yq, 60, nh, 'Không dùng', { size: 6.8, pad: 1, danger: true })) lam(false);
      } else if (T.sbtn(rx + 5, yq, 60, nh, 'Vẫn ép', { size: 6.8, pad: 1, danger: true })) lam(false);
      if (T.sbtn(rx + rw - 46, yq, 40, nh, 'Thôi', { size: 6.8, pad: 1 })) U.hoi = null;
      return y + h - 16;
    }
    if (T.sbtn(rx + rw - 46, yb + 2, 42, 24, 'Ép', { size: 8.5, pad: 1, primary: !why, disabled: !!why })) {
      if (tu != null) U.hoi = w.id; else lam(false);
    }
    return y + h - 16;
  };
})();
