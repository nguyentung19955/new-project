// TURRET MERGE — dữ liệu luật chơi (theo Destiny Child: Defense War, đổi chủ đề sang ụ súng)
'use strict';

// Màn hình logic 430×860 (co giãn theo điện thoại)
const W = 430, H = 860;

// 5 BẬC như DCDW: Thường→TRẮNG, Hiếm→XANH, Sử thi→TÍM, Huyền thoại→VÀNG, Cổ đại→ĐỎ
// hs = hệ số sức mạnh (chỉ số tăng theo bậc), lv0 = cấp thẻ khởi đầu kiểu DCDW (chỉ để hiển thị)
const TIERS = {
  trang: { ten: TEXT.tier.trang, tenDai: TEXT.tier.trang, mau: '#e9eef4', mau2: '#9aa6b4', hs: 1.0, thuTu: 0 },
  xanh:  { ten: TEXT.tier.xanh, tenDai: TEXT.tier.xanh,  mau: '#4fb8ff', mau2: '#1f6fd1', hs: 1.3, thuTu: 1 },
  tim:   { ten: TEXT.tier.tim, tenDai: TEXT.tier.tim, mau: '#c77dff', mau2: '#7b2cd6', hs: 1.65, thuTu: 2 },
  vang:  { ten: TEXT.tier.vang, tenDai: TEXT.tier.vang, mau: '#ffd23f', mau2: '#d18b00', hs: 2.1, thuTu: 3 },
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
  giaNangCap: [100, 200, 400, 700], // nâng cấp theo loại trong trận (LV1→5)
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
  dahlia: { ten: TEXT.af.dahlia.name, anh: 'af_dahlia', icon: 'lua',       mau: '#ff6a3a', gia: 40, cd: 25, mo: TEXT.af.dahlia.desc },
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
  nang:  { tien: 'mana', icon: 'ui_nangcap', ten: 'POWER-UP',  mo: 'Spends MANA: +18% damage to every turret of this type, this match only (LV1→5).' },
};
// biểu tượng kỹ năng Ma vương: ảnh trong assets/, riêng RAGE = ngọn lửa vẽ bằng code (SVG)
const MV_LUA = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="a" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff2a10"/><stop offset=".6" stop-color="#ff8a1a"/><stop offset="1" stop-color="#ffd23a"/></linearGradient><linearGradient id="b" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffb21a"/><stop offset="1" stop-color="#fff6b0"/></linearGradient></defs><path d="M32 3c3 10 15 16 15 31a15 15 0 0 1-30 0c0-7 4-12 7-15 0 5 2 8 5 9-1-9 1-17 3-25z" fill="url(#a)" stroke="#5a0a00" stroke-width="2.5" stroke-linejoin="round"/><path d="M32 30c2 6 8 8 8 15a8 8 0 0 1-16 0c0-4 2-6 4-8 0 3 1 4 3 5 0-4 0-8 1-12z" fill="url(#b)"/></svg>');
function mvIcURL(id) { const d = MAVUONG[id]; return d.icon === 'lua' ? MV_LUA : 'assets/' + d.icon + '.png'; }
// ảnh chân dung Ma vương; nếu ảnh chưa có / lỗi → tự đổi sang biểu tượng (không bao giờ ô trống)
function mvArt(id) {
  const d = MAVUONG[id], ic = mvIcURL(id);
  return '<span class="mv-anh" style="--mm:' + d.mau + '"><img class="po" src="assets/' + d.anh + '.png" alt="" onerror="this.onerror=null;this.classList.add(\'fb\');this.src=\'' + ic + '\'"><img class="ki" src="' + ic + '" alt=""></span>';
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

function boCuc(che) {
  const tw = 372, th = Math.round(tw * KHAY_TL), tx = 52;
  const lx = 27; // tâm làn trái
  if (che === 'coop') {
    // bàn trên = ĐỒNG ĐỘI, bàn dưới = MÌNH; 2 cổng (trên/dưới) đi vào → gặp ở khe giữa → hành lang chung → lõi bên phải
    const y1 = 90, gy = y1 + th + 33, y2 = gy + 33;
    const cuoi = y2 + th + 34;
    return {
      ban: [
        { x: tx, y: y2, w: tw, h: th, ai: false, ten: TEXT.ui.you },
        { x: tx, y: y1, w: tw, h: th, ai: true, ten: TEXT.ui.ally },
      ],
      duong: [
        { pts: [[lx, cuoi], [lx, gy], [W - 26, gy]], ban: 0, nhap: 1 },  // nhánh dưới (của mình)
        { pts: [[lx, y1 - 10], [lx, gy], [W - 26, gy]], ban: 1, nhap: 1 }, // nhánh trên (đồng đội)
      ],
      chung: true,
    };
  }
  if (che === 'pvp') {
    // bàn trên = ĐỐI THỦ, bàn dưới = MÌNH; mỗi bàn một đường riêng
    const y1 = 100, y2 = 394;
    return {
      ban: [
        { x: tx, y: y2, w: tw, h: th, ai: false, ten: TEXT.ui.you },
        { x: tx, y: y1, w: tw, h: th, ai: true, ten: TEXT.ui.rival },
      ],
      duong: [
        { pts: [[lx, y2 - 22], [lx, y2 + th + 26], [W - 26, y2 + th + 26]], ban: 0 },
        { pts: [[lx, y1 - 22], [lx, y1 + th + 26], [W - 26, y1 + th + 26]], ban: 1 },
      ],
    };
  }
  // SOLO: một bàn giữa màn, đường hình chữ U ôm 3 cạnh bàn (trên → trái → dưới) như Random Dice
  const y = 262;
  return {
    ban: [{ x: tx, y, w: tw, h: th, ai: false, ten: TEXT.ui.you }],
    duong: [{ pts: [[W - 26, y - 34], [lx, y - 34], [lx, y + th + 32], [W - 26, y + th + 32]], ban: 0 }],
  };
}
