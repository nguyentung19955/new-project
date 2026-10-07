// ------------------------------------------------------------
//  VAI TRÒ TƯỚNG (v182)
//  Mỗi tướng có 1 vai trò chính (+ tối đa 1 phụ) để xây đội hình, song song với ngũ hành.
//  Cộng hưởng: đủ 2 / 4 tướng KHÁC NHAU cùng vai trò CHÍNH trên sân → tướng mang vai trò đó
//  (chính hoặc phụ) nhận buff nhỏ; riêng Hỗ trợ buff toàn quân.
// ------------------------------------------------------------
const ROLES = {
  satthuong: { name: 'Sát thương', short: 'DPS', color: '#FF8A4C', desc: 'Sát thương vật lý đều tay, đánh nhanh',
    path: '<path d="M6 18 L16.5 7.5 M14 5 L19 10 M5 16 L8 19 M15 5 L19 5 L19 9" />' },
  danhlan: { name: 'Đánh lan', short: 'Lan', color: '#FFC14A', desc: 'Chém lan / nổ vùng, dọn bầy quái đông',
    path: '<circle cx="12" cy="12" r="2.6"/><path d="M12 4 V6.5 M12 17.5 V20 M4 12 H6.5 M17.5 12 H20 M6.3 6.3 L8 8 M16 16 L17.7 17.7 M17.7 6.3 L16 8 M8 16 L6.3 17.7"/>' },
  phapsu: { name: 'Pháp sư', short: 'Phép', color: '#B892FF', desc: 'Sát thương phép, xuyên giáp vật lý, mạnh kỹ năng',
    path: '<path d="M12 3.5 L13.8 10.2 L20.5 12 L13.8 13.8 L12 20.5 L10.2 13.8 L3.5 12 L10.2 10.2 Z"/>' },
  dietboss: { name: 'Diệt boss', short: 'Boss', color: '#FF5470', desc: 'Dồn sát thương lên một mục tiêu máu cao / boss',
    path: '<circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="1.6"/><path d="M12 3 V7 M12 17 V21 M3 12 H7 M17 12 H21"/>' },
  khongche: { name: 'Khống chế', short: 'Chặn', color: '#5CC8FF', desc: 'Choáng, trói, làm chậm, đẩy lùi quái',
    path: '<path d="M8.5 9.5 a3 3 0 0 1 0 -4.5 l1.5 -0.5 a3 3 0 0 1 4 4 M15.5 14.5 a3 3 0 0 1 0 4.5 l-1.5 0.5 a3 3 0 0 1 -4 -4 M9.5 14.5 L14.5 9.5"/>' },
  hotro: { name: 'Hỗ trợ', short: 'Buff', color: '#6EDC8C', desc: 'Hồi máu, khiên, tăng tốc / sát thương đồng đội',
    path: '<path d="M12 6 V18 M6 12 H18" stroke-width="2.6"/>' },
  dodon: { name: 'Đỡ đòn', short: 'Đỡ', color: '#D2AE72', desc: 'Máu trâu, giảm sát thương nhận, che chắn',
    path: '<path d="M12 3.8 L19 6.5 V11.5 C19 15.8 16 18.6 12 20.2 C8 18.6 5 15.8 5 11.5 V6.5 Z"/>' },
};
const ROLE_KEYS = Object.keys(ROLES);
// [vai trò chính, vai trò phụ] — xếp theo kỹ năng / chỉ số thật (bảng đầy đủ: GAMEPLAY.md v182)
const HERO_ROLE = {
  // Thường
  lactuong: ['danhlan', 'khongche'], lucsi: ['dodon', 'dietboss'], xathu: ['satthuong', 'danhlan'], thosan: ['dietboss', 'satthuong'],
  thaymo: ['phapsu', 'danhlan'], thansuong: ['khongche', 'phapsu'], thoren: ['satthuong', 'dodon'], nguphu: ['khongche', 'satthuong'],
  thogom: ['danhlan', 'khongche'], thaylang: ['hotro'], dotnuong: ['satthuong', 'danhlan'], denroi: ['phapsu', 'danhlan'],
  chodo: ['danhlan', 'dodon'], haisen: ['hotro', 'khongche'], dapde: ['dodon', 'khongche'], chantrau: ['khongche', 'hotro'],
  giaodong: ['dietboss', 'satthuong'], chuongdong: ['khongche', 'phapsu'], tre: ['satthuong', 'danhlan'], ongthoi: ['satthuong', 'dietboss'],
  // Sử thi
  thachsanh: ['dietboss', 'khongche'], lachau: ['dodon', 'hotro'], thansan: ['dietboss', 'satthuong'], caolo: ['dietboss', 'satthuong'],
  antiem: ['danhlan', 'khongche'], tiendung: ['hotro', 'khongche'], langlieu: ['hotro'], cdt: ['hotro', 'khongche'],
  trongdong: ['hotro', 'khongche'], caong: ['dodon', 'hotro'], ongtao: ['satthuong', 'dietboss'], potaoapui: ['dietboss', 'danhlan'],
  baahoa: ['phapsu', 'danhlan'], lyngu: ['dietboss', 'satthuong'], truongchi: ['khongche', 'phapsu'], ongdung: ['dodon', 'khongche'],
  thocong: ['hotro', 'dodon'], nghedong: ['dodon', 'danhlan'], mychau: ['phapsu', 'hotro'], sodua: ['phapsu', 'danhlan'],
  // Huyền thoại
  giong: ['danhlan', 'dodon'], llq: ['satthuong', 'khongche'], kimquy: ['dodon', 'hotro'], adv: ['satthuong', 'hotro'],
  auco: ['hotro', 'khongche'], mau: ['khongche', 'hotro'], matroi: ['phapsu', 'danhlan'], mauthoai: ['khongche', 'hotro'],
  trutroi: ['dodon', 'khongche'], ongho: ['satthuong', 'khongche'], kinhduong: ['hotro', 'satthuong'], viemde: ['phapsu', 'hotro'],
  halong: ['dodon', 'danhlan'], longnu: ['phapsu', 'khongche'], tanvien: ['khongche', 'dodon'], maudia: ['hotro', 'khongche'],
  kylan: ['satthuong', 'hotro'], thienloi: ['phapsu', 'dietboss'], cuoi: ['danhlan', 'hotro'], melua: ['hotro', 'khongche'],
};
const heroRole = (t) => (HERO_ROLE[t] || [])[0] || null;
const heroRoles = (t) => HERO_ROLE[t] || [];

// Cộng hưởng vai trò: [ngưỡng 2, ngưỡng 4]. all = buff toàn quân (Hỗ trợ).
// Giá trị nhỏ, đã mô phỏng trước/sau (GAMEPLAY.md v182).
const ROLE_SYN = {
  on: true,
  need: [2, 4],
  satthuong: { st: [{ haste: 8 }, { haste: 20 }], t: ['+8% tốc đánh', '+20% tốc đánh'] },
  danhlan: { st: [{ bonusDmgPct: 6 }, { bonusDmgPct: 15 }], t: ['+6% sát thương', '+15% sát thương'] },
  phapsu: { st: [{ skillPct: 8, mpen: 8 }, { skillPct: 18, mpen: 18 }], t: ['+8% sức mạnh kỹ năng, +8% xuyên kháng phép', '+18% sức mạnh kỹ năng, +18% xuyên kháng phép'] },
  dietboss: { st: [{ bossPct: 12 }, { bossPct: 30 }], t: ['+12% sát thương lên boss', '+30% sát thương lên boss'] },
  khongche: { st: [{ cdr: 6 }, { cdr: 15 }], t: ['−6% hồi chiêu', '−15% hồi chiêu'] },
  hotro: { all: true, st: [{ regen: 1.5 }, { regen: 3, bonusDmgPct: 5 }], t: ['Toàn quân +1,5 hồi máu/giây', 'Toàn quân +3 hồi máu/giây, +5% sát thương'] },
  dodon: { st: [{ dr: 8 }, { dr: 18 }], t: ['−8% sát thương nhận', '−18% sát thương nhận'] },
};
// đếm tướng khác loại theo vai trò chính trong danh sách tướng (còn sống)
function roleCounts(list) {
  const seen = {}, n = {};
  for (const h of list) {
    const r = heroRole(h.type);
    if (!r || (seen[r] || (seen[r] = new Set())).has(h.type)) continue;
    seen[r].add(h.type);
    n[r] = (n[r] || 0) + 1;
  }
  return n;
}
// bậc cộng hưởng đang bật: { vai trò: 1 | 2 }
function roleTiers(counts) {
  const out = {};
  if (!ROLE_SYN.on) return out;
  for (const r of ROLE_KEYS) { const c = counts[r] || 0; const k = c >= ROLE_SYN.need[1] ? 2 : c >= ROLE_SYN.need[0] ? 1 : 0; if (k) out[r] = k; }
  return out;
}
// chỉ số cộng thêm cho một tướng loại t khi các bậc cộng hưởng tiers đang bật
function roleSynStats(t, tiers) {
  const s = {}, mine = heroRoles(t);
  for (const r in tiers) {
    const d = ROLE_SYN[r];
    if (!d.all && !mine.includes(r)) continue;
    const add = d.st[tiers[r] - 1];
    for (const k in add) s[k] = (s[k] || 0) + add[k];
  }
  return s;
}
// icon vai trò (SVG nội tuyến, đổi màu theo vai trò)
function roleIcon(r, size = 14) {
  const d = ROLES[r];
  if (!d) return '';
  return `<svg class="rli" viewBox="0 0 24 24" width="${size}" height="${size}" style="width:${size}px;height:${size}px" aria-label="${d.name}"><circle cx="12" cy="12" r="11" fill="#140F0A" stroke="${d.color}" stroke-width="1.6"/><g fill="none" stroke="${d.color}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${d.path}</g></svg>`;
}
// nhãn vai trò: icon + tên (chính), phụ nhạt hơn
function roleChip(t, o = {}) {
  const [a, b] = heroRoles(t);
  if (!a) return '';
  const one = (r, sub) => `<span class="rl-chip${sub ? ' sub' : ''}" style="--rc:${ROLES[r].color}" title="${ROLES[r].name}${sub ? ' (phụ)' : ''}: ${ROLES[r].desc}">${roleIcon(r, o.size || 13)}${ROLES[r].name}</span>`;
  return one(a) + (b && !o.main ? one(b, true) : '');
}
