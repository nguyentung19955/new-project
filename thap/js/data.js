// TURRET MERGE — dữ liệu luật chơi (theo Destiny Child: Defense War, đổi chủ đề sang ụ súng)
'use strict';

// Màn hình logic 430×860 (co giãn theo điện thoại)
const W = 430, H = 860;

// 5 BẬC như DCDW: Thường→TRẮNG, Hiếm→XANH, Sử thi→TÍM, Huyền thoại→VÀNG, Cổ đại→ĐỎ
// hs = hệ số sức mạnh (chỉ số tăng theo bậc), lv0 = cấp thẻ khởi đầu kiểu DCDW (chỉ để hiển thị)
const TIERS = {
  trang: { ten: 'TRẮNG', tenDai: 'Thường', mau: '#e9eef4', mau2: '#9aa6b4', hs: 1.0, thuTu: 0 },
  xanh:  { ten: 'XANH',  tenDai: 'Hiếm',  mau: '#4fb8ff', mau2: '#1f6fd1', hs: 1.3, thuTu: 1 },
  tim:   { ten: 'TÍM',   tenDai: 'Sử thi', mau: '#c77dff', mau2: '#7b2cd6', hs: 1.65, thuTu: 2 },
  vang:  { ten: 'VÀNG',  tenDai: 'Huyền thoại', mau: '#ffd23f', mau2: '#d18b00', hs: 2.1, thuTu: 3 },
  do:    { ten: 'ĐỎ',    tenDai: 'Cổ đại', mau: '#ff4b3e', mau2: '#b3121c', hs: 2.7, thuTu: 4 },
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
  timSolo: 3, timPvp: 3, // PVP 3 tim; quái to / trùm lọt mất 2 tim
  songTrum: 10,          // trùm mỗi 10 wave
  waveMax: 70,
  thoiGianWave: 20,      // giây / wave thường
};

// QUÁI (ảnh quai_<id>.png: 4 khung nhìn XUỐNG)
// hp = bội số máu wave, v = tốc độ px/s, co = cỡ vẽ, tim = số tim mất khi lọt
const QUAI = {
  bo:       { ten: 'Quỷ bò',      hp: 1.0, v: 34, co: 40, tim: 1, mana: 1 },
  bay:      { ten: 'Quỷ bay',     hp: 0.6, v: 62, co: 40, tim: 1, bay: true, mana: 1 },
  bay_bang: { ten: 'Quỷ bay xanh', hp: 0.85, v: 50, co: 42, tim: 1, bay: true, khangCham: true, mana: 1 },
  khong_lo: { ten: 'Khổng lồ',    hp: 4.5, v: 22, co: 60, tim: 2, to: true, mana: 2 },
  tach:     { ten: 'Quỷ tách',    hp: 1.6, v: 30, co: 46, tim: 1, tach: { id: 'nho', n: 5 }, mana: 1 },
  que_tach: { ten: 'Que tách',    hp: 3.2, v: 26, co: 54, tim: 2, to: true, tach: { id: 'tach', n: 3, hs: 0.5 }, mana: 2 },
  nho:      { ten: 'Quỷ con',     hp: 0.22, v: 44, co: 26, tim: 1, anh: 'tach', mana: 0.3 },
};

// TRÙM (trum_<id>.png: khung 0–2 đi, khung 3 tung chiêu) — mỗi 10 wave, lọt mất 2 tim
const TRUM = {
  mad_crown:  { ten: 'MAD CROWN',  kn: 'XÁO TRỘN', mo: 'Biến 3 ụ thành loại ngẫu nhiên', mau: '#ff6ad5' },
  freezer:    { ten: 'FREEZER',    kn: 'ĐÓNG BĂNG', mo: 'Đóng băng 1 ụ mạnh nhất', mau: '#7fdcff' },
  janus:      { ten: 'JANUS CUBE', kn: 'HOÁ ĐÁ', mo: 'Hoá đá 1 ụ (đá chỉ ghép với đá cùng sao)', mau: '#e0c070' },
  joker_king: { ten: 'JOKER KING', kn: 'ÉP GHÉP', mo: 'Ném Mimic vào 1 ụ, ép ghép với ụ cùng sao', mau: '#ffd23f' },
  nightmare:  { ten: 'NIGHTMARE',  kn: 'BẮN TỈA', mo: 'Bắn tỉa ụ sao cao nhất: −1 sao (1 sao thì nổ)', mau: '#ff3b3b' },
  octopus:    { ten: 'OCTOPUS EYES', kn: 'THIÊU ĐỐT', mo: 'Đốt 3 ụ: hết lửa −1 sao nếu chưa được giải', mau: '#ff8a2a' },
};
const TRUM_THU_TU = ['mad_crown', 'freezer', 'janus', 'joker_king', 'nightmare', 'octopus'];

// ỨNG VIÊN MA VƯƠNG (kỹ năng chủ động, mana NHÂN ĐÔI mỗi lần dùng, có hồi chiêu)
const MAVUONG = {
  hero:   { ten: 'GỌI VIỆN',  icon: 'ui_thuong', gia: 30, cd: 15, mo: 'Gọi ngay 2 ụ 1 sao (miễn phí)' },
  dahlia: { ten: 'CUỒNG LỰC', icon: 'ui_sao',    gia: 40, cd: 25, mo: '+100% sát thương toàn bàn 10 giây' },
  eve:    { ten: 'KHIÊN THÁNH', icon: 'ui_tim',  gia: 40, cd: 25, mo: 'Giải mọi hiệu ứng xấu + khiên chặn chiêu trùm 8 giây' },
};

// máu quái theo wave (tăng nhanh dần như DCDW)
function mauWave(w) { return Math.round(80 * Math.pow(1.15, w - 1) + 30 * w); }
// mana khi giết
function manaGiet(w) { return 10 + 3 * Math.floor((w - 1) / 2); }

// thành phần wave
function taoWave(w) {
  if (w % LUAT.songTrum === 0) {
    const id = TRUM_THU_TU[(w / LUAT.songTrum - 1) % TRUM_THU_TU.length];
    return { trum: id, ds: Array(4).fill('bo') };
  }
  const n = Math.min(32, 9 + Math.floor(w * 0.75));
  const ds = [];
  for (let i = 0; i < n; i++) {
    let id = 'bo';
    const r = Math.random();
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
        { x: tx, y: y2, w: tw, h: th, ai: false, ten: 'BẠN' },
        { x: tx, y: y1, w: tw, h: th, ai: true, ten: 'ĐỒNG ĐỘI' },
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
        { x: tx, y: y2, w: tw, h: th, ai: false, ten: 'BẠN' },
        { x: tx, y: y1, w: tw, h: th, ai: true, ten: 'ĐỐI THỦ' },
      ],
      duong: [
        { pts: [[lx, y2 - 22], [lx, y2 + th + 26], [W - 26, y2 + th + 26]], ban: 0 },
        { pts: [[lx, y1 - 22], [lx, y1 + th + 26], [W - 26, y1 + th + 26]], ban: 1 },
      ],
    };
  }
  // SOLO: một bàn giữa màn, đường hình chữ U ôm 3 cạnh bàn (trên → trái → dưới) như Random Dice
  const y = 236;
  return {
    ban: [{ x: tx, y, w: tw, h: th, ai: false, ten: 'BẠN' }],
    duong: [{ pts: [[W - 26, y - 34], [lx, y - 34], [lx, y + th + 32], [W - 26, y + th + 32]], ban: 0 }],
  };
}
