// TURRET MERGE — dữ liệu luật chơi (theo Destiny Child: Defense War, đổi chủ đề sang ụ súng)
'use strict';

// Màn hình logic 430×860 (co giãn theo điện thoại)
const W = 430, H = 860;
// MỘT VÒNG (06/11): quanh ụ chỉ còn 1 vòng = vòng xanh lá nạp chiêu; vòng dạng/chế độ/trạng thái khác tắt (js/motvong.js)
const MOT_VONG = true;

// 5 BẬC như DCDW: Thường→TRẮNG, Hiếm→XANH, Sử thi→TÍM, Huyền thoại→VÀNG, Cổ đại→ĐỎ
// hs = hệ số sức mạnh (chỉ số tăng theo bậc), lv0 = cấp thẻ khởi đầu kiểu DCDW (chỉ để hiển thị)
// 06/11 đo bậc (tools/thap-sim-tier.js, docs/demo-hop-tuong/tuvan/tier/BANG.md): Tím 1.65→2.0, Vàng 2.1→2.6 — trung vị Tấn công Tím/Vàng từng ngang Xanh
const TIERS = {
  trang: { ten: TEXT.tier.trang, tenDai: TEXT.tier.trang, mau: '#e9eef4', mau2: '#9aa6b4', hs: 1.0, thuTu: 0 },
  xanh:  { ten: TEXT.tier.xanh, tenDai: TEXT.tier.xanh,  mau: '#4fb8ff', mau2: '#1f6fd1', hs: 1.3, thuTu: 1 },
  tim:   { ten: TEXT.tier.tim, tenDai: TEXT.tier.tim, mau: '#c77dff', mau2: '#7b2cd6', hs: 2.0, thuTu: 2 },
  vang:  { ten: TEXT.tier.vang, tenDai: TEXT.tier.vang, mau: '#ffd23f', mau2: '#d18b00', hs: 2.6, thuTu: 3 },
  do:    { ten: TEXT.tier.do, tenDai: TEXT.tier.do, mau: '#ff4b3e', mau2: '#b3121c', hs: 2.7, thuTu: 4 },
};
const TIER_LIST = ['trang', 'xanh', 'tim', 'vang', 'do'];

// Luật nền DCDW
const LUAT = {
  manaDau: 100,          // mana khởi đầu
  giaTrieu: 10,          // triệu hồi lần đầu 10, mỗi lần sau +10
  giaTrieuTang: 10,
  saoMax: 7,             // tối đa 7 sao
  cot: 5, hang: 3,       // bàn 5×3 = 15 ô
  giaNangCap: [100, 200, 400, 700], // POWER-UP trong trận theo loại (kiểu DCDW: 4 bước +1/+2/+3/MAX, giá tăng dần, áp mọi bản cùng loại)
  nangPct: 0.25,         // +% sát thương GỐC mỗi bước power-up (cộng dồn tuyến tính như DCDW: gốc × (1 + k·bước))
  timSolo: 3, timPvp: 3, timCoop: 3, // CO-OP: 3 tim CHUNG (giữ ở bàn 0); quái to / trùm lọt mất 2 tim
  songTrum: 10,          // trùm mỗi 10 wave
  waveMax: 70,
  pvpDotTu: 30,          // PVP: từ wave 30 = ĐỘT TỬ — wave nào cũng có trùm, máu trùm tăng dần tới khi 1 bên vỡ
  thoiGianWave: 20,      // giây / wave thường
};

// QUÁI (ảnh quai_<id>.png: 4 khung nhìn XUỐNG)
// hp = bội số máu wave, v = tốc độ px/s, co = cỡ vẽ, tim = số tim mất khi lọt
const QUAI = {
  bo:       { ten: TEXT.mob.bo,      hp: 1.0, v: 34, co: 40, tim: 1, mana: 1 },
  bay:      { ten: TEXT.mob.bay,     hp: 0.6, v: 62, co: 40, tim: 1, bay: true, mana: 1 },
  bay_bang: { ten: TEXT.mob.bay_bang, hp: 0.85, v: 50, co: 42, tim: 1, bay: true, khangCham: true, mana: 1 },
  khong_lo: { ten: TEXT.mob.khong_lo,    hp: 4.5, v: 22, co: 60, tim: 2, to: true, mana: 2 },
  tach:     { ten: TEXT.mob.tach,    hp: 1.6, v: 30, co: 46, tim: 1, tach: { id: 'nho', n: 5 }, mana: 1 },
  que_tach: { ten: TEXT.mob.que_tach,    hp: 3.2, v: 26, co: 54, tim: 2, to: true, tach: { id: 'tach', n: 3, hs: 0.5 }, mana: 2 },
  nho:      { ten: TEXT.mob.nho,     hp: 0.22, v: 44, co: 26, tim: 1, anh: 'tach', mana: 0.3 },
};

// TRÙM (trum_<id>.png: khung 0–2 đi, khung 3 tung chiêu) — mỗi 10 wave, lọt mất 2 tim
const TRUM = {
  mad_crown:  { ten: TEXT.boss.mad_crown.name, kn: TEXT.boss.mad_crown.skill, mo: TEXT.boss.mad_crown.desc, mau: '#ff6ad5' },
  freezer:    { ten: TEXT.boss.freezer.name, kn: TEXT.boss.freezer.skill, mo: TEXT.boss.freezer.desc, mau: '#7fdcff' },
  janus:      { ten: TEXT.boss.janus.name, kn: TEXT.boss.janus.skill, mo: TEXT.boss.janus.desc, mau: '#e0c070' },
  joker_king: { ten: TEXT.boss.joker_king.name, kn: TEXT.boss.joker_king.skill, mo: TEXT.boss.joker_king.desc, mau: '#ffd23f' },
  nightmare:  { ten: TEXT.boss.nightmare.name, kn: TEXT.boss.nightmare.skill, mo: TEXT.boss.nightmare.desc, mau: '#ff3b3b' },
  octopus:    { ten: TEXT.boss.octopus.name, kn: TEXT.boss.octopus.skill, mo: TEXT.boss.octopus.desc, mau: '#ff8a2a' },
};
const TRUM_THU_TU = ['mad_crown', 'freezer', 'janus', 'joker_king', 'nightmare', 'octopus'];

// ỨNG VIÊN MA VƯƠNG (kỹ năng chủ động, mana NHÂN ĐÔI mỗi lần dùng, có hồi chiêu)
const MAVUONG = {
  hero:   { ten: TEXT.af.hero.name,   anh: 'af_hero',   icon: 'ui_thuong', mau: '#6fc8ff', gia: 30, cd: 15, mo: TEXT.af.hero.desc },
  dahlia: { ten: TEXT.af.dahlia.name, anh: 'af_dahlia', icon: 'fx_cuongno_hieu', mau: '#ff6a3a', gia: 40, cd: 25, mo: TEXT.af.dahlia.desc },
  eve:    { ten: TEXT.af.eve.name,    anh: 'af_eve',    icon: 'sup_khien', mau: '#ffe9a0', gia: 40, cd: 25, mo: TEXT.af.eve.desc },
};
// LUẬT CHỈ HUY (P0-09) — chihuy.js là máy trạng thái dùng bảng này (node: tools/test-chihuy.js)
//  hieuLuc = giây tác dụng (thanh RAGE 10 s / khiên lõi 8 s) · pham = 'ban': chỉ bàn của người dùng (CO-OP không lan sang đồng đội)
//  hetCho = đồng hồ tác dụng DỪNG khi đang nghỉ giữa wave và bàn không còn quái (không phí RAGE/khiên lúc chuyển wave)
//  hero: bàn đủ chỗ → 2 ụ 1★ miễn phí (không tăng giá Triệu hồi); thiếu ô → mỗi ụ thiếu = +1★ cho ụ yếu nhất; bàn đầy & mọi ụ đã 7★ → không dùng được, không trừ mana
Object.assign(MAVUONG.hero,   { pham: 'ban', so: 2, duPhong: 'nangYeu' });
Object.assign(MAVUONG.dahlia, { pham: 'ban', hieuLuc: 10, khoa: 'cuong' });
Object.assign(MAVUONG.eve,    { pham: 'ban', hieuLuc: 8, khoa: 'khien' });
const LUAT_MV = { heSoGia: 2, hetCho: true }; // giá ×2 mỗi lần dùng: 40 → 80 → 160

// TIỀN TỆ (P0-06): trong game chỉ có MỘT loại tiền — MANA trong trận (giết quái, ụ mana). Không có tiền sưu tầm/ngoài trận.
//  3 khoản chi đều trả bằng mana nhưng là 3 HÀNH ĐỘNG khác nhau → icon hành động riêng cho Nâng cấp (mũi tên xanh),
//  còn Triệu hồi + Chỉ huy dùng CHUNG ngọc mana.
const TIEN = {
  mana: { ten: 'MANA', glyph: 'h2_ngoc', glyphCu: 'ui_mana', pham: 'tran', mo: 'In-battle energy from kills. Resets every match.' },
};
const CHI = {
  trieu: { tien: 'mana', icon: 'h2_ngoc',    ten: 'SUMMON',    mo: 'Random 1★ turret from your deck. +10 each time. Fewer than 2 Attack turrets on board → always an Attack card.' },
  mv:    { tien: 'mana', icon: 'h2_ngoc',    ten: 'COMMANDER', mo: 'Commander skill. Cost ×2 after each cast.' },
  nang:  { tien: 'mana', icon: 'ui_nangcap', ten: 'POWER-UP',  mo: 'Spends MANA: +25% base damage to every turret of this type, this match only (+1 → +2 → +3 → MAX).' },
};
// biểu tượng kỹ năng Ma vương: ảnh trong assets/, riêng RAGE = ngọn lửa vẽ bằng code (SVG)
const MV_LUA = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="a" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff2a10"/><stop offset=".6" stop-color="#ff8a1a"/><stop offset="1" stop-color="#ffd23a"/></linearGradient><linearGradient id="b" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffb21a"/><stop offset="1" stop-color="#fff6b0"/></linearGradient></defs><path d="M32 3c3 10 15 16 15 31a15 15 0 0 1-30 0c0-7 4-12 7-15 0 5 2 8 5 9-1-9 1-17 3-25z" fill="url(#a)" stroke="#5a0a00" stroke-width="2.5" stroke-linejoin="round"/><path d="M32 30c2 6 8 8 8 15a8 8 0 0 1-16 0c0-4 2-6 4-8 0 3 1 4 3 5 0-4 0-8 1-12z" fill="url(#b)"/></svg>');
function mvIcURL(id) { const d = MAVUONG[id]; return d.icon === 'lua' ? MV_LUA : (typeof anhUrl === 'function' ? anhUrl(d.icon) : 'assets/' + d.icon + '.png'); }
// ảnh chân dung Ma vương; nếu ảnh chưa có / lỗi → tự đổi sang biểu tượng (không bao giờ ô trống)
function mvArt(id) {
  const d = MAVUONG[id], ic = mvIcURL(id);
  return '<span class="mv-anh" style="--mm:' + d.mau + '"><img class="po" ' + (typeof srcTai === 'function' && !(G.ban && G.ban.length) ? srcTai() : 'src') + '="' + (typeof anhUrl === 'function' ? anhUrl(d.anh) : 'assets/' + d.anh + '.png') + '" alt="" onerror="this.onerror=null;this.classList.add(\'fb\');this.src=\'' + ic + '\'"><img class="ki" src="' + ic + '" alt=""></span>';
}

// máu quái theo wave (tăng nhanh dần như DCDW)
function mauWave(w) { return Math.round(80 * Math.pow(1.15, w - 1) + 30 * w); }
// mana khi giết
function manaGiet(w) { return 10 + 2 * (w - 1); }

// thành phần wave
function taoWave(w, rng) { // rng: RNG có hạt giống (PVP: 2 bên cùng wave)
  rng = rng || Math.random;
  if (w % LUAT.songTrum === 0) {
    const id = typeof trumCuaWave === 'function' ? trumCuaWave(w, 0) : TRUM_THU_TU[(w / LUAT.songTrum - 1) % TRUM_THU_TU.length]; // lịch trùm: game.js
    return { trum: id, ds: Array(4).fill('bo') };
  }
  const n = Math.min(32, 9 + Math.floor(w * 0.75));
  const ds = [];
  for (let i = 0; i < n; i++) {
    let id = 'bo';
    const r = rng();
    if (w >= 2 && r < 0.2) id = 'bay';
    else if (w >= 8 && r < 0.33) id = 'bay_bang';
    else if (w >= 6 && r < 0.46) id = 'tach';
    if (w >= 4 && i % 7 === 6) id = 'khong_lo';
    if (w >= 30 && i % 9 === 4) id = 'que_tach';
    ds.push(id);
  }
  return { ds };
}

// Bố cục bàn theo chế độ. Khay 5×3 (khay.png 900×532): tâm ô theo tỉ lệ đo trên ảnh
const KHAY_COT = [0.166, 0.338, 0.504, 0.672, 0.843];
const KHAY_HANG = [0.249, 0.499, 0.749];
const KHAY_TL = 532 / 900;
const DUONG_RONG = 46; // bề rộng đường đi

// HUD mượt B (TU-VAN-HUD-MUOT §3D): bàn CỦA MÌNH to hơn và dùng khoảng trống dọc (ô ~70×60 thay 64×55);
// khung khay rộng 408 (mép trang trí trái nằm dưới làn đường trái, mép phải sát mép khung 430),
// không giãn dọc (giãn làm ảnh đầu ụ vượt ngưỡng mip → tốn khung hình). Bàn đồng đội (CO-OP) / đối thủ (PVP) thu gọn 300 px ở trên, vẫn đọc được.
// Vùng an toàn: thanh trên ≤ 48, khay dưới ≥ 674; dải xem nhanh SOLO 610–668 (không chồng ô nào).
const BC_TO = { tw: 408, tx: 22, kv: 1 }, BC_GON = { tw: 300, tx: 92 };
function boCuc(che) {
  const tw = BC_TO.tw, tx = BC_TO.tx;
  const lx = 27; // tâm làn trái
  const toH = (k) => Math.round(tw * KHAY_TL * k);
  const gw = BC_GON.tw, gx = BC_GON.tx, gh = Math.round(gw * KHAY_TL);
  if (che === 'coop') {
    // bàn trên = ĐỒNG ĐỘI (gọn), bàn dưới = MÌNH (to); 2 cổng (trên/dưới) đi vào → gặp ở khe giữa → hành lang chung → lõi bên phải
    const th = toH(1), y1 = 98, gy = y1 + gh + 33, y2 = gy + 33;
    const cuoi = y2 + th + 34;
    return {
      ban: [
        { x: tx, y: y2, w: tw, h: th, ai: false, ten: TEXT.ui.you },
        { x: gx, y: y1, w: gw, h: gh, ai: true, ten: TEXT.ui.ally, gon: true },
      ],
      duong: [
        { pts: [[lx, cuoi], [lx, gy], [W - 26, gy]], ban: 0, nhap: 1 },  // nhánh dưới (của mình)
        { pts: [[lx, y1 - 10], [lx, gy], [W - 26, gy]], ban: 1, nhap: 1 }, // nhánh trên (đồng đội)
      ],
      chung: true,
    };
  }
  if (che === 'pvp') {
    // bàn trên = ĐỐI THỦ (gọn), bàn dưới = MÌNH (to); mỗi bàn một đường riêng
    const th = toH(1), y1 = 104, y2 = y1 + gh + 72;
    return {
      ban: [
        { x: tx, y: y2, w: tw, h: th, ai: false, ten: TEXT.ui.you },
        { x: gx, y: y1, w: gw, h: gh, ai: true, ten: TEXT.ui.rival, gon: true },
      ],
      duong: [
        { pts: [[lx, y2 - 22], [lx, y2 + th + 26], [W - 26, y2 + th + 26]], ban: 0 },
        { pts: [[lx, y1 - 22], [lx, y1 + gh + 26], [W - 26, y1 + gh + 26]], ban: 1 },
      ],
    };
  }
  // SOLO: một bàn giữa vùng chơi (48–604), đường hình chữ U ôm 3 cạnh bàn (trên → trái → dưới) như Random Dice
  const th = toH(BC_TO.kv), y = Math.round((48 + 604) / 2 - (th + 112) / 2 + 57);
  return {
    ban: [{ x: tx, y, w: tw, h: th, ai: false, ten: TEXT.ui.you }],
    duong: [{ pts: [[W - 26, y - 34], [lx, y - 34], [lx, y + th + 32], [W - 26, y + th + 32]], ban: 0 }],
  };
}

// HỆ SỐ SỨC MẠNH theo cấp: POWER-UP trong trận (B.lv 1..5) × CẤP THẺ ngoài trận (B.capThe[id] = số cấp đã lên trên cấp đầu của bậc)
// — mọi công thức sát thương (dmgU, hsU, phaoDmg, statThuc) dùng chung hàm này → số hiển thị không lệch số đánh thật.
// CẤP THẺ VÀNG / ĐỎ theo VAI TRÒ (08/11, người dùng duyệt — CHATGPT-SPEC A0): mỗi cấp trên cấp đầu Tấn công +5% ST & +2% tốc bắn,
//   Hỗ trợ +4% giá trị cơ chế, Đặc biệt / Khống chế +3% (ST của đòn phụ nếu có). Cộng vào cùng nhóm, không nhân kép. Bậc khác: như cũ (THE.pct).
const CAP_VD = { tc: { dmg: 0.05, toc: 0.02 }, ht: { dmg: 0.04, toc: 0, ht: 0.04 }, db: { dmg: 0.03, toc: 0, db: 0.03 } };
function capVD(id) {
  const r = typeof G !== 'undefined' && G.rosterMap && G.rosterMap[id];
  if (!r || (r.bac !== 'vang' && r.bac !== 'do')) return null;
  const sk = typeof SKILLS !== 'undefined' && SKILLS[id];
  return CAP_VD[(sk && sk.vai) || 'tc'] || CAP_VD.db;
}
function hsThe(B, id) {
  const c = B && B.capThe && B.capThe[id]; if (!c) return 1;
  const v = capVD(id); if (v) return 1 + c * v.dmg;
  const r = typeof G !== 'undefined' && G.rosterMap && G.rosterMap[id];
  return 1 + c * ((typeof THE !== 'undefined' && r && THE.pct[r.bac]) || 0.05);
}
// tốc bắn theo cấp thẻ (chỉ ụ Tấn công VÀNG / ĐỎ: +2% mỗi cấp) — tocU() nhân vào
function tocThe(B, id) { const c = B && B.capThe && B.capThe[id]; if (!c) return 1; const v = capVD(id); return v && v.toc ? 1 + c * v.toc : 1; }
// hệ số cơ chế Đặc biệt / Khống chế VÀNG / ĐỎ theo cấp thẻ: 1 + 0.03 × số cấp trên cấp đầu (vd. buff Blood Rite, ô anh hùng, Anvil)
function heDB(B, id) { const c = (B && B.capThe && B.capThe[id]) | 0; return 1 + 0.03 * c; }
// KỸ NĂNG THEO CẤP THẺ (kiểu DCDW: lên cấp làm mạnh CHÍNH kỹ năng của Child, không chỉ sát thương gốc) — docs/demo-hop-tuong/tuvan/kynang_cap/DCDW.md
//  giá trị = base + buoc × (số cấp đã lên trên cấp đầu), kẹp ở max (buoc âm = giảm, max là sàn). base = giá trị ở CẤP ĐẦU (= y như trước bản này).
//  06/11 đo bậc (tools/thap-sim-tier.js): base/buoc/max cập nhật theo số mới (hỗ trợ: giá trị 1★ THẬT gồm hệ số bậc HOTRO.BAC; Copycat 70%, Overclock 90%, Mana Doubler 44, Horn 4+2★, Box 58 s)
//  ten: nhãn trang ụ ('Copy 50% → 57%') · dv: '%' | 's' | '' · tien: tiền tố ('+', '−') · ht: ụ hỗ trợ (giá trị này THAY cho "độ mạnh hỗ trợ ×½ % cấp")
//  dmg: true = vẫn giữ thêm +% sát thương mỗi cấp (THE.pct) · không có mục ở đây = ụ tấn công thuần: chỉ +% sát thương như cũ
//  pu: bước POWER-UP TRONG TRẬN (B.lv +1…MAX = 4 bước) cho ụ KHÔNG gây sát thương (KIEM.md mục IX 'Đã quyết' #1, kiểu DCDW):
//      giá trị = giá trị cấp thẻ + pu × số bước — cộng SAU kẹp max của cấp thẻ (power-up luôn có tác dụng), online tất định (B.lv đi theo lệnh nâng)
const KY_NANG_CAP = {
  canon: { ten: 'Per stack', base: 50, buoc: 2.5, max: 70, dv: '%', tien: '+', dmg: true }, // Pháo La Bàn (08/11 tổ hợp hướng): +% sát thương mỗi STACK (NSWE + NSWE) — 50% → 70% rải 8 cấp thẻ Vàng LV9→17 // (cũ: 'Per number' 15 → 21%) (LV8, phí 7 cấp)
  saochep: { ten: 'Copy', base: 70, buoc: 4, max: 94, dv: '%', dmg: true },          // bản sao = chỉ số ụ gốc × % này
  mimic: { ten: 'Merge buff', base: 50, buoc: 2, max: 74, dv: '%', tien: '+', dmg: true },
  vughep: { ten: 'Gold +2★', base: 10, buoc: 2, max: 22, dv: '%', dmg: true },      // xác suất ra Merge King vàng
  epxung: { ten: 'Overclock', base: 90, buoc: 2.5, max: 112.5, dv: '%', tien: '+', dmg: true },
  ngoisao: { ten: 'Milestones', base: 100, buoc: 5, max: 130, dv: '%', dmg: true },  // mọi mốc ★ (tốc/sát thương) × giá trị/100
  soi: { ten: 'Awaken', base: 30, buoc: 1.5, max: 39, dv: '%', dmg: true },        // xác suất ra Sói THỨC TỈNH (DCDW Werewolf: 30% LV9 → +1.5%/cấp → 39% LV15, trần 50%)
  orbital: { ten: 'Awaken', base: 23, buoc: 1, max: 29, dv: 's', dmg: true },       // ghép Vệ Tinh → MỌI Vệ Tinh trên bàn thức tỉnh N giây (DCDW Mafdet 23 s)
  sinhdoi: { ten: '+1★ twin', base: 10, buoc: 1, max: 16, dv: '%', dmg: true },     // Twin Maker: xác suất ụ sinh đôi cao hơn 1★ (DCDW Berit)
  nhanmana: { ten: 'Merge mana', base: 44, buoc: 2.75, max: 77, dv: '', tien: '+', dmg: true },
  loa: { ten: 'Cooldown', base: 6, buoc: 0.33, max: 9.96, dv: 's', tien: '−', dmg: true },
  maychem: { ten: 'Execute', base: 3.75, buoc: 0.15, max: 5.85, dv: '%', dmg: true },
  mana: { ten: 'Mana', base: 100, buoc: 4, max: 156, dv: '%' },                       // lượng mana sinh ra × giá trị/100
  bang: { ten: 'Freeze', base: 2, buoc: 0.07, max: 2.98, dv: 's', pu: 0.15 },
  doc: { ten: 'Mark', base: 12, buoc: 0.4, max: 17.6, dv: '%', tien: '+', pu: 0.75 },
  khien: { ten: 'Recharge', base: 18, buoc: -0.4, max: 14.4, dv: 's', pu: -0.5 },
  hopbi: { ten: 'Opens in', base: 58, buoc: -1, max: 49, dv: 's', pu: -2 },
  // ụ KHÔNG gây sát thương (VFX P0 — REVIEW-VFX-93 IX): cấp thẻ nâng CHÍNH con số kỹ năng thay cho dòng '+damage' vô tác dụng
  bomhen: { ten: 'Weaken', base: 10, buoc: 0.25, max: 13.5, dv: '%', tien: '+', pu: 0.75 },     // quái quanh vụ nổ nhận thêm % sát thương (vào trần suy yếu 25%)
  tienhoa: { ten: 'Hatch time', base: 100, buoc: -2.43, max: 80.6, dv: '%', pu: -3 },          // Trứng (08/11): thời gian nở ÷ (1 + 3%/cấp thẻ) (LV17 80.6%) · power-up −3%/bước
  haoquang: { ten: 'Barrier', base: 3, buoc: 0.125, max: 3.5, dv: 's', pu: 0.15 },             // thời gian rào bất tử (trước mốc sao)
  loren: { ten: 'Forge buff', base: 3, buoc: 0.09, max: 3.72, dv: '%', tien: '+', pu: 0.3 },      // Twin Anvil (08/11): buff rèn ST +3%/cộng dồn × (1 + 3%/cấp thẻ) (rèn tốc ×2/3) · power-up +0.3 điểm %/cộng dồn mỗi bước
  cobac: { ten: 'Fruit power', base: 100, buoc: 5, max: 130, dv: '%', dmg: true },       // Lucky Slot (08/11, jackpot.js CB): mọi số/điểm ngăn quả × giá trị/100 — thẻ Đỏ LV11 100% → LV17 130%
  khoisinh: { ten: 'Raise time', base: 94.3, buoc: -2.2834, max: 80.6, dv: '%', pu: -3 },          // Lõi Khởi Sinh (08/11, skills5.js g): 12 s ÷ (1 + 3% × (LV − 9)) — thẻ Đỏ bắt đầu LV11 = 94.3% → LV17 80.6% · power-up −3%/bước
  // hỗ trợ: giá trị buff chính ở 1★ (đường cong sao HOTRO.K nhân lên như cũ) — ≈ +40% ở cấp 15 · 07/11: hạ 1★ của ụ chạm trần sớm (BAO-CAO gioi-han §4 mục 2)
  radar: { ten: 'Rate buff', base: 19.5, buoc: 0.65, max: 27.3, dv: '%', tien: '+', ht: 1 }, // 08/11 +8% (18/0.6/25.2) bù jackpot PERFECT FREQUENCY đã bỏ
  phagiap: { ten: 'Exposed', base: 13, buoc: 0.355, max: 17.964, dv: '%', tien: '+', ht: 1 },
  bua: { ten: 'Crit dmg', base: 18, buoc: 0.54, max: 25.56, dv: '%', tien: '+', ht: 1 },
  chimang: { ten: 'Crit buff', base: 6.75, buoc: 0.225, max: 9.45, dv: '%', tien: '+', ht: 1 },
  tron: { ten: 'Rate buff', base: 9, buoc: 0.3, max: 12.6, dv: '%', tien: '+', ht: 1 },
  lanhgia: { ten: 'Slow', base: 12, buoc: 0.375, max: 16.5, dv: '%', ht: 1 },
  khuech: { ten: 'Per hit', base: 6.75, buoc: 0.225, max: 9.45, dv: '%', tien: '+', ht: 1 },
  taylo: { ten: 'Dmg buff', base: 18, buoc: 0.9, max: 26.1, dv: '%', tien: '+', ht: 1 },
  nangsao: { ten: 'Rate buff', base: 10, buoc: 0.5, max: 14.5, dv: '%', tien: '+', ht: 1 },
  tuthan: { ten: 'Execute', base: 12, buoc: 0.6, max: 17.4, dv: '%', ht: 1 },
  thaukinh: { ten: 'Crit dmg', base: 36, buoc: 1.548, max: 49.932, dv: '%', tien: '+', ht: 1 },
  // Hỗ trợ VÀNG (08/11, cấp thẻ theo vai trò): +4% giá trị mỗi cấp (LV17 ×1.32)
  dongbo: { ten: 'Dmg buff', base: 17.25, buoc: 0.69, max: 22.77, dv: '%', tien: '+', ht: 1 },
  hasao: { ten: 'Dmg buff', base: 23, buoc: 0.92, max: 30.36, dv: '%', tien: '+', ht: 1 },
  cauvong: { ten: 'Trail dmg', base: 29.9, buoc: 1.196, max: 39.468, dv: '%', tien: '+', ht: 1 },
  luoicheo: { ten: 'Dmg buff', base: 16.1, buoc: 0.644, max: 21.252, dv: '%', tien: '+', ht: 1 },
  guongcong: { ten: 'Resist', base: 18.4, buoc: 0.736, max: 24.288, dv: '%', ht: 1 },
  lophanung: { ten: 'Slowed dmg', base: 33.6, buoc: 3.36, max: 47.04, dv: '%', tien: '+', ht: 1 },
};
// FX = VÙNG TRÚNG (REVIEW-VFX-93 X · PHASE P0): phần ảnh THẤY ĐƯỢC chiếm bao nhiêu nửa khung (đo bằng tools/thap-kt-vfx-p0.js trên ảnh thật,
//  điểm sáng ≥ 60, phân vị 97 tính từ tâm khung) → cỡ vẽ = vùng trúng / tỉ lệ này. Đổi ảnh → kiểm báo lệch → cập nhật số ở đây.
const VUNG_ANH = { vungdoc: 0.97, p2_blackhole: 0.885, p2_cryo: 0.9, wyrmX: 0.965, wyrmY: 0.63 };
// giá trị kỹ năng ở k cấp trên cấp đầu (thuần)
function knGt(e, k) { const v = e.base + e.buoc * Math.max(0, k | 0); return Math.round((e.buoc < 0 ? Math.max(e.max, v) : Math.min(e.max, v)) * 1000) / 1000; }
// số cấp đã lên của thẻ id trên bàn B (trận: B.capThe — online = mức đã gửi trong chuỗi bộ bài; máy = trung bình); ngoài trận (B rỗng): bộ sưu tập
function knCap(B, id) { if (B) return (B.capThe && B.capThe[id]) | 0; return typeof THEBAI !== 'undefined' ? THEBAI.the(id).k : 0; }
// số bước POWER-UP trong trận của loại id trên bàn B (0 ngoài trận / chưa nâng; MAX = 4)
function knPU(B, id) { return Math.max(0, (((B && B.lv && B.lv[id]) || 1) | 0) - 1); }
// giá trị kỹ năng của thẻ id trên bàn B: cấp thẻ + bước power-up trong trận (mục có pu) — null nếu thẻ không có mục kỹ năng theo cấp
function knThe(B, id) { const e = KY_NANG_CAP[id]; if (!e) return null; const v = knGt(e, knCap(B, id)); return e.pu && B ? Math.round((v + e.pu * knPU(B, id)) * 1000) / 1000 : v; }
// hệ số so với cấp đầu (1 ở cấp đầu)
function knHe(B, id) { const e = KY_NANG_CAP[id]; return e ? knGt(e, knCap(B, id)) / e.base : 1; }
// bản sao Copycat: tỉ lệ sức mạnh (0.7 ở cấp đầu → 0.94 thẻ max) — dùng cấp thẻ COPYCAT của bàn đó
function heSaoChep(B) { return (knThe(B, 'saochep') || 70) / 100; } // fallback = base 70 (KY_NANG_CAP.saochep)
function hsLv(B, id) { return (1 + LUAT.nangPct * (((B && B.lv && B.lv[id]) || 1) - 1)) * hsThe(B, id); }
