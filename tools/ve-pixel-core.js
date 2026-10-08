// LÕI tool vẽ pixel (claude/tool-pixel) — dùng chung cho tools/ve-pixel.html (trình duyệt) và tools/ve-pixel.js (Node CLI).
// Sinh sprite theo docs/pixel/QUY-CHUAN.md từ mô tả / bộ phận / mẫu vẽ tay (thư viện tools/pixel/thu-vien.js), kiểm tra quy chuẩn,
// PNG + zip goi-pixel.zip, nguồn .txt cho tools/build-pixel.js. Không phụ thuộc DOM.
//   trình duyệt: <script src="ve-pixel-core.js"> → const K = VePixelCore(window.VE_PIXEL_DS, window.VE_PIXEL_TV)
//   Node:        const K = require('./ve-pixel-core.js')(DS, TV)
(function (root) {
'use strict';
function VePixelCore(DS, TV) {
  // ═════════════ dữ liệu ═════════════
  DS = DS || { palette: [['vien', '#140C06', 1]], sizes: {}, req: {}, ma: [] };
  const PAL = DS.palette.map(([name, hex, edge]) => ({ name, hex, edge: !!edge, rgb: [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) }));
  const PI = Object.fromEntries(PAL.map((p, i) => [p.name, i + 1]));          // tên màu → chỉ số (0 = trong suốt)
  const C = (n) => PI[n] || PI.vien;
  const ANIM_RANGE = { idle: [1, 6], walk: [1, 6], attack: [1, 6], cast: [1, 6], hurt: [1, 2], die: [1, 6], rage: [1, 4], portrait: [1, 1], main: [1, 8], win: [1, 4] };
  const NHOM_TEN = { tuong: 'Tướng', quai: 'Quái', boss: 'Boss', nen: 'Nền', icon: 'Icon', do: 'Đồ', 'an-phu': 'Ấn phù', 'ky-nang': 'Kỹ năng', 'than-khi': 'Thần khí', 'giao-dien': 'Giao diện', canh: 'Cảnh', 'ban-do': 'Bản đồ' };
  const NHAN_VAT = (g) => g === 'tuong' || g === 'quai' || g === 'boss';
  const VERSION_GOI = 1;

  // dải màu 3 tông (tối · gốc · sáng)
  const RAMP = {
    son: ['son-toi', 'son', 'son-sang'], lua: ['son', 'lua', 'lua-sang'], vang: ['dong-sang', 'vang-nghe', 'vang-sang'], dong: ['dong-toi', 'dong', 'dong-sang'],
    sat: ['sat-toi', 'sat', 'sat-sang'], bac: ['sat', 'sat-sang', 'bac'], trang: ['trang-xam', 'trang', 'sang'], den: ['vien', 'khoi', 'sat-toi'],
    dat: ['dat-toi', 'dat', 'dat-sang'], cat: ['dat-sang', 'cat', 'vang-sang'], la: ['la-toi', 'la', 'la-ma'], lama: ['la', 'la-ma', 'la-sang'],
    reu: ['reu-toi', 'reu', 'reu-sang'], cham: ['cham-toi', 'cham', 'cham-sang'], nuoc: ['cham', 'nuoc', 'nuoc-sang'], tim: ['tim-toi', 'tim', 'tim-sang'],
    ngoc: ['la-toi', 'ngoc', 'ngoc-sang'], hong: ['son', 'hong', 'da-sang'], da: ['da-toi', 'da', 'da-sang'], troi: ['nuoc', 'nuoc-sang', 'troi'],
  };
  const MAU_TEN = { son: 'đỏ son', lua: 'cam lửa', vang: 'vàng', dong: 'đồng', sat: 'sắt', bac: 'bạc', trang: 'trắng', den: 'đen', dat: 'nâu đất', cat: 'rơm / cát',
    la: 'xanh lá', lama: 'lá mạ', reu: 'rêu', cham: 'chàm', nuoc: 'nước', tim: 'tím', ngoc: 'ngọc', hong: 'hồng', da: 'da', troi: 'trời' };
  const HANH = { kim: { ten: 'Kim', ramp: 'bac' }, moc: { ten: 'Mộc', ramp: 'lama' }, thuy: { ten: 'Thủy', ramp: 'nuoc' }, hoa: { ten: 'Hỏa', ramp: 'lua' }, tho: { ten: 'Thổ', ramp: 'vang' } };

  // ═════════════ thư viện hình vật (icon / đồ / thần khí / vật trang trí nền) — claude/xuat-goi-pixel ═════════════
  // mỗi hình: [nhãn, [từ khoá trong tên / mô tả], vẽ(A, c, cy, s)] — A(dải, k => k.…, chế độ) thêm một lớp; dải 'H' = màu hình,
  // 'P' = màu phụ (cán gỗ, dây, lông), 'N' = ngọc điểm (bỏ qua khi "không"), hoặc tên dải ('trang', 'den', 'vien'…).
  const HINH_THEM = {
    mu: ['mũ đồng', ['mũ', 'helmet', 'nón trụ'], (A, c, y, s) => { A('H', (k) => k.ell(c, y + s * 0.2, s * 0.72, s * 0.78).cut(new Mask(k.w, k.h).rect(0, Math.round(y + s * 0.3), k.w, k.h))); A('H', (k) => k.rect(c - s * 0.92, y + s * 0.25, s * 1.84 + 1, s * 0.3)); A('P', (k) => k.line(c, y - s * 0.55, c + s * 0.2, y - s, 1)); A('N', (k) => k.ell(c, y - s * 0.1, s * 0.16, s * 0.16), 'base'); }],
    mulong: ['mũ lông chim', ['mũ lông', 'lông chim', 'lông vũ', 'feather'], (A, c, y, s) => { for (let i = -2; i <= 2; i++) A('P', (k) => k.line(c + i * s * 0.22, y + s * 0.25, c + i * s * 0.5, y - s * 0.95, 2)); A('H', (k) => k.rect(c - s * 0.75, y + s * 0.2, s * 1.5 + 1, s * 0.45)); A('N', (k) => k.ell(c, y + s * 0.42, s * 0.15, s * 0.15), 'base'); }],
    ao: ['áo', ['áo', 'robe', 'long bào', 'bào', 'yếm'], (A, c, y, s) => { A('H', (k) => k.poly([[c - s * 0.35, y - s * 0.85], [c + s * 0.35, y - s * 0.85], [c + s, y - s * 0.35], [c + s * 0.72, y - s * 0.05], [c + s * 0.5, y - s * 0.25], [c + s * 0.6, y + s], [c - s * 0.6, y + s], [c - s * 0.5, y - s * 0.25], [c - s * 0.72, y - s * 0.05], [c - s, y - s * 0.35]])); A('P', (k) => k.rect(c - s * 0.52, y + s * 0.15, s * 1.04 + 1, s * 0.2), 'base'); A('den', (k) => k.line(c - s * 0.3, y - s * 0.85, c, y - s * 0.4, 1).line(c + s * 0.3, y - s * 0.85, c, y - s * 0.4, 1), 'dk'); A('N', (k) => k.px(c, y + s * 0.25), 'base'); }],
    giap: ['áo giáp', ['giáp', 'armor', 'áo giáp'], (A, c, y, s) => { A('H', (k) => k.poly([[c - s * 0.55, y - s * 0.9], [c - s * 0.18, y - s * 0.9], [c, y - s * 0.55], [c + s * 0.18, y - s * 0.9], [c + s * 0.55, y - s * 0.9], [c + s * 0.78, y - s * 0.35], [c + s * 0.62, y + s], [c - s * 0.62, y + s], [c - s * 0.78, y - s * 0.35]])); for (const t of [-0.1, 0.3, 0.68]) A('H', (k) => k.line(c - s * 0.55, y + s * t, c + s * 0.55, y + s * t, 1), 'dk'); A('N', (k) => k.ell(c, y - s * 0.25, s * 0.15, s * 0.15), 'base'); }],
    no: ['nỏ', ['nỏ', 'crossbow', 'lẫy nỏ'], (A, c, y, s) => { A('P', (k) => k.line(c, y - s * 0.6, c, y + s, 2)); A('trang', (k) => k.line(c - s * 0.85, y - s * 0.3, c, y + s * 0.15, 1).line(c + s * 0.85, y - s * 0.3, c, y + s * 0.15, 1), 'dk'); A('H', (k) => { for (let x = -s; x <= s; x += 0.5) k.px(c + x, y - s * 0.55 + (x / s) ** 2 * s * 0.35); k.rect(c - s, y - s * 0.4, 2, 2).rect(c + s - 1, y - s * 0.4, 2, 2); }); A('N', (k) => k.rect(c - 0.5, y + s * 0.35, 2, 2), 'base'); }],
    cung: ['cung', ['cung', 'bow'], (A, c, y, s) => { A('H', (k) => { for (let t = -s; t <= s; t += 0.5) k.rect(c - s * 0.2 - (1 - (t / s) ** 2) * s * 0.55, y + t, 2, 1); }); A('trang', (k) => k.line(c + s * 0.15, y - s, c + s * 0.15, y + s, 1), 'dk'); A('P', (k) => k.line(c - s * 0.9, y, c + s * 0.9, y, 1), 'base'); A('H', (k) => k.poly([[c + s, y], [c + s * 0.6, y - s * 0.25], [c + s * 0.6, y + s * 0.25]])); }],
    gay: ['gậy / trượng', ['gậy', 'trượng', 'staff', 'cây gậy', 'roi'], (A, c, y, s) => { A('P', (k) => k.line(c - s * 0.85, y + s * 0.9, c + s * 0.35, y - s * 0.3, 2)); A('H', (k) => k.ell(c + s * 0.5, y - s * 0.5, s * 0.42, s * 0.42)); A('N', (k) => k.ell(c + s * 0.5, y - s * 0.5, s * 0.2, s * 0.2), 'base'); }],
    trong: ['trống đồng', ['trống', 'drum'], (A, c, y, s) => { A('H', (k) => k.rect(c - s * 0.85, y - s * 0.25, s * 1.7 + 1, s * 1.05)); A('H', (k) => k.ell(c, y - s * 0.3, s * 0.88, s * 0.38), 'lt'); A('H', (k) => k.line(c - s * 0.85, y + s * 0.3, c + s * 0.85, y + s * 0.3, 1), 'dk'); A('N', (k) => k.ell(c, y - s * 0.3, s * 0.22, s * 0.14), 'base'); A('vien', (k) => k.px(c - s * 0.5, y - s * 0.3).px(c + s * 0.5, y - s * 0.3), 'base'); }],
    gang: ['găng tay', ['găng', 'glove', 'bao tay'], (A, c, y, s) => { A('H', (k) => k.ell(c + s * 0.1, y - s * 0.1, s * 0.55, s * 0.7).ell(c - s * 0.55, y + s * 0.05, s * 0.22, s * 0.38)); A('P', (k) => k.rect(c - s * 0.45, y + s * 0.5, s * 1.1, s * 0.45)); A('H', (k) => k.line(c - s * 0.05, y - s * 0.75, c - s * 0.05, y - s * 0.2, 1).line(c + s * 0.3, y - s * 0.75, c + s * 0.3, y - s * 0.2, 1), 'dk'); }],
    dep: ['dép / giày', ['dép', 'giày', 'guốc', 'boot', 'hài'], (A, c, y, s) => { A('H', (k) => k.poly([[c - s * 0.45, y - s * 0.9], [c + s * 0.15, y - s * 0.9], [c + s * 0.15, y + s * 0.25], [c + s, y + s * 0.45], [c + s, y + s * 0.8], [c - s * 0.45, y + s * 0.8]])); A('P', (k) => k.rect(c - s * 0.5, y + s * 0.75, s * 1.55, s * 0.25)); A('N', (k) => k.px(c - s * 0.15, y - s * 0.4), 'base'); }],
    khan: ['khăn', ['khăn', 'turban', 'headband'], (A, c, y, s) => { A('H', (k) => k.ell(c, y - s * 0.05, s * 0.85, s * 0.5).cut(new Mask(k.w, k.h).ell(c, y - s * 0.12, s * 0.55, s * 0.24))); A('H', (k) => k.poly([[c + s * 0.6, y + s * 0.2], [c + s * 0.95, y + s * 0.95], [c + s * 0.55, y + s * 0.75]]).poly([[c + s * 0.45, y + s * 0.3], [c + s * 0.3, y + s], [c + s * 0.1, y + s * 0.5]])); A('N', (k) => k.ell(c, y + s * 0.3, s * 0.15, s * 0.15), 'base'); }],
    'bua-deo': ['bùa / dây đeo', ['bùa', 'amulet', 'mặt dây', 'vòng cổ', 'chuỗi'], (A, c, y, s) => { A('P', (k) => k.line(c - s * 0.7, y - s, c, y + s * 0.05, 1).line(c + s * 0.7, y - s, c, y + s * 0.05, 1), 'base'); A('H', (k) => k.ell(c, y + s * 0.45, s * 0.5, s * 0.52)); A('N', (k) => k.ell(c, y + s * 0.45, s * 0.22, s * 0.22), 'base'); }],
    long: ['lông vũ', ['lông', 'plume'], (A, c, y, s) => { A('H', (k) => k.poly([[c - s * 0.85, y + s * 0.95], [c - s * 0.3, y - s * 0.1], [c + s * 0.9, y - s * 0.95], [c + s * 0.25, y + s * 0.35]])); A('P', (k) => k.line(c - s * 0.95, y + s, c + s * 0.6, y - s * 0.65, 1), 'base'); }],
    vay: ['vảy', ['vảy', 'scale'], (A, c, y, s) => { A('H', (k) => k.ell(c, y, s * 0.8, s * 0.9)); for (let r = -1; r <= 1; r++) for (let q = -1; q <= 1; q++) { const x = c + q * s * 0.45 + (r % 2 ? s * 0.22 : 0), yy = y + r * s * 0.5; A('H', (k) => k.line(x - s * 0.22, yy, x, yy + s * 0.22, 1).line(x, yy + s * 0.22, x + s * 0.22, yy, 1), 'dk'); } A('N', (k) => k.px(c - s * 0.3, y - s * 0.4), 'base'); }],
    ngua: ['ngựa', ['ngựa', 'horse'], (A, c, y, s) => { A('H', (k) => k.poly([[c - s * 0.2, y - s], [c + s * 0.25, y - s * 0.65], [c + s, y + s * 0.05], [c + s * 0.85, y + s * 0.45], [c + s * 0.3, y + s * 0.25], [c + s * 0.15, y + s], [c - s * 0.75, y + s], [c - s * 0.55, y - s * 0.2]])); A('P', (k) => k.line(c - s * 0.2, y - s, c - s * 0.75, y + s * 0.6, 2)); A('vien', (k) => k.px(c + s * 0.25, y - s * 0.35), 'base'); }],
    mat: ['mắt', ['mắt', 'eye'], (A, c, y, s) => { A('trang', (k) => k.poly([[c - s, y], [c, y - s * 0.6], [c + s, y], [c, y + s * 0.6]])); A('H', (k) => k.ell(c, y, s * 0.38, s * 0.38), 'base'); A('vien', (k) => k.ell(c, y, s * 0.14, s * 0.14), 'base'); }],
    hat: ['bông lúa / hạt', ['lúa', 'hạt', 'thóc', 'gạo', 'rice', 'grain', 'bông lúa'], (A, c, y, s) => { A('P', (k) => k.line(c - s * 0.3, y + s, c - s * 0.1, y - s * 0.2, 1).line(c - s * 0.1, y - s * 0.2, c + s * 0.4, y - s * 0.9, 1)); for (let i = 0; i < 5; i++) { const t = i / 4, x = c - s * 0.15 + t * s * 0.55, yy = y - s * 0.1 - t * s * 0.75; A('H', (k) => k.ell(x - s * 0.22, yy, s * 0.14, s * 0.18).ell(x + s * 0.2, yy + s * 0.05, s * 0.14, s * 0.18)); } }],
    cay: ['cây', ['cây', 'tree', 'rừng'], (A, c, y, s) => { A('P', (k) => k.rect(c - s * 0.15, y + s * 0.1, s * 0.3 + 1, s * 0.9)); A('H', (k) => k.ell(c, y - s * 0.3, s * 0.85, s * 0.65).ell(c - s * 0.45, y + s * 0.05, s * 0.4, s * 0.3).ell(c + s * 0.45, y + s * 0.05, s * 0.4, s * 0.3)); A('N', (k) => k.px(c - s * 0.3, y - s * 0.4).px(c + s * 0.35, y - s * 0.2), 'base'); }],
    may: ['mây', ['mây', 'cloud', 'khói'], (A, c, y, s) => { A('H', (k) => k.ell(c - s * 0.45, y + s * 0.15, s * 0.45, s * 0.38).ell(c + s * 0.1, y - s * 0.15, s * 0.5, s * 0.48).ell(c + s * 0.55, y + s * 0.2, s * 0.4, s * 0.33).rect(c - s * 0.8, y + s * 0.15, s * 1.7, s * 0.38)); }],
    trang: ['trăng khuyết', ['trăng', 'moon'], (A, c, y, s) => { A('H', (k) => k.ell(c, y, s * 0.85, s * 0.85).cut(new Mask(k.w, k.h).ell(c + s * 0.4, y - s * 0.25, s * 0.7, s * 0.7))); }],
    noi: ['nồi', ['nồi', 'niêu', 'pot', 'bát', 'chén'], (A, c, y, s) => { A('H', (k) => k.ell(c, y + s * 0.25, s * 0.85, s * 0.62)); A('H', (k) => k.rect(c - s * 0.75, y - s * 0.4, s * 1.5 + 1, s * 0.22), 'lt'); A('P', (k) => k.ell(c, y - s * 0.55, s * 0.18, s * 0.14)); A('trang', (k) => k.line(c - s * 0.3, y - s * 0.75, c - s * 0.4, y - s, 1).line(c + s * 0.3, y - s * 0.75, c + s * 0.2, y - s, 1), 'lt'); }],
    chuong: ['chuông', ['chuông', 'chiêng', 'bell'], (A, c, y, s) => { A('H', (k) => k.poly([[c - s * 0.3, y - s * 0.7], [c + s * 0.3, y - s * 0.7], [c + s * 0.55, y + s * 0.2], [c + s * 0.9, y + s * 0.65], [c - s * 0.9, y + s * 0.65], [c - s * 0.55, y + s * 0.2]])); A('H', (k) => k.ell(c, y - s * 0.85, s * 0.2, s * 0.16)); A('P', (k) => k.ell(c, y + s * 0.85, s * 0.2, s * 0.16)); }],
    vuot: ['vuốt', ['vuốt', 'móng', 'claw'], (A, c, y, s) => { for (let i = -1; i <= 1; i++) A('H', (k) => { for (let t = 0; t <= 1; t += 0.03) k.rect(c + i * s * 0.55 + Math.sin(t * 2.2) * s * 0.35 - 0.5, y + s * 0.9 - t * s * 1.8, t < 0.8 ? 2 : 1, 2); }); }],
    hoa: ['hoa sen', ['sen', 'hoa', 'lotus', 'flower'], (A, c, y, s) => { A('P', (k) => k.ell(c, y + s * 0.65, s * 0.9, s * 0.3)); A('H', (k) => k.poly([[c, y - s], [c + s * 0.3, y - s * 0.1], [c, y + s * 0.5], [c - s * 0.3, y - s * 0.1]]).poly([[c - s * 0.85, y - s * 0.35], [c - s * 0.1, y + s * 0.1], [c - s * 0.15, y + s * 0.5], [c - s * 0.65, y + s * 0.3]]).poly([[c + s * 0.85, y - s * 0.35], [c + s * 0.1, y + s * 0.1], [c + s * 0.15, y + s * 0.5], [c + s * 0.65, y + s * 0.3]])); A('N', (k) => k.px(c, y), 'base'); }],
    tui: ['túi', ['túi', 'bag', 'bao', 'bị'], (A, c, y, s) => { A('H', (k) => k.ell(c, y + s * 0.3, s * 0.8, s * 0.68).poly([[c - s * 0.3, y - s * 0.55], [c + s * 0.3, y - s * 0.55], [c + s * 0.45, y - s * 0.1], [c - s * 0.45, y - s * 0.1]])); A('P', (k) => k.rect(c - s * 0.4, y - s * 0.4, s * 0.8 + 1, s * 0.2), 'base'); A('H', (k) => k.ell(c, y - s * 0.75, s * 0.4, s * 0.22)); A('N', (k) => k.ell(c, y + s * 0.35, s * 0.2, s * 0.2), 'base'); }],
    sung: ['sừng', ['sừng', 'horn', 'ngà'], (A, c, y, s) => { for (let t = 0; t <= 1; t += 0.05) { const a = -0.3 + t * 2.2, r = s * (0.38 - t * 0.3); A('H', (k) => k.ell(c - s * 0.2 + Math.cos(a) * s * 0.6 - s * 0.1, y + s * 0.6 - t * s * 1.5, r, r)); } }],
    luoi: ['lưới', ['lưới', 'net', 'vó'], (A, c, y, s) => { A('P', (k) => { k.ell(c, y, s * 0.9, s * 0.9).cut(new Mask(k.w, k.h).ell(c, y, s * 0.9 - 1.3, s * 0.9 - 1.3)); }); A('H', (k) => { for (let i = -2; i <= 2; i++) { k.line(c + i * s * 0.35, y - s * 0.8, c + i * s * 0.35, y + s * 0.8, 1); k.line(c - s * 0.8, y + i * s * 0.35, c + s * 0.8, y + i * s * 0.35, 1); } k.cut(new Mask(k.w, k.h).rect(0, 0, k.w, k.h).cut(new Mask(k.w, k.h).ell(c, y, s * 0.8, s * 0.8))); }, 'base'); }],
    liem: ['liềm / lưỡi hái', ['liềm', 'hái', 'sickle'], (A, c, y, s) => { A('H', (k) => k.ell(c + s * 0.1, y - s * 0.1, s * 0.85, s * 0.8).cut(new Mask(k.w, k.h).ell(c - s * 0.15, y + s * 0.15, s * 0.8, s * 0.75))); A('P', (k) => k.line(c - s * 0.75, y + s * 0.3, c - s * 0.3, y + s, 2)); }],
    chim: ['chim', ['chim', 'gà', 'bird', 'cò', 'sếu', 'đại bàng', 'quạ'], (A, c, y, s) => { A('H', (k) => k.ell(c - s * 0.05, y + s * 0.15, s * 0.6, s * 0.42).ell(c + s * 0.55, y - s * 0.4, s * 0.28, s * 0.28).poly([[c - s * 0.55, y + s * 0.1], [c - s, y - s * 0.2], [c - s * 0.95, y + s * 0.45]])); A('P', (k) => k.poly([[c - s * 0.4, y], [c + s * 0.3, y - s * 0.05], [c - s * 0.1, y - s * 0.75]])); A('N', (k) => k.poly([[c + s * 0.8, y - s * 0.45], [c + s, y - s * 0.3], [c + s * 0.8, y - s * 0.3]]), 'base'); A('vien', (k) => k.px(c + s * 0.6, y - s * 0.45), 'base'); A('P', (k) => k.line(c, y + s * 0.55, c - s * 0.1, y + s, 1).line(c + s * 0.25, y + s * 0.5, c + s * 0.25, y + s, 1), 'dk'); }],
    thu: ['thú 4 chân', ['trâu', 'bò', 'thú', 'hổ', 'lợn', 'buffalo'], (A, c, y, s) => { A('H', (k) => k.ell(c - s * 0.1, y, s * 0.7, s * 0.42).ell(c + s * 0.65, y - s * 0.25, s * 0.3, s * 0.28).rect(c - s * 0.7, y + s * 0.2, s * 0.25, s * 0.7).rect(c + s * 0.25, y + s * 0.2, s * 0.25, s * 0.7)); A('P', (k) => k.line(c + s * 0.55, y - s * 0.5, c + s * 0.35, y - s * 0.85, 1).line(c + s * 0.8, y - s * 0.5, c + s, y - s * 0.85, 1), 'lt'); A('vien', (k) => k.px(c + s * 0.7, y - s * 0.3), 'base'); }],
    voi: ['voi', ['voi', 'elephant'], (A, c, y, s) => { A('H', (k) => k.ell(c - s * 0.15, y - s * 0.05, s * 0.72, s * 0.5).ell(c + s * 0.55, y - s * 0.3, s * 0.32, s * 0.36).line(c + s * 0.8, y - s * 0.2, c + s * 0.85, y + s * 0.75, 2).rect(c - s * 0.75, y + s * 0.25, s * 0.28, s * 0.7).rect(c + s * 0.15, y + s * 0.25, s * 0.28, s * 0.7)); A('trang', (k) => k.line(c + s * 0.6, y + s * 0.05, c + s * 0.4, y + s * 0.35, 1), 'base'); A('vien', (k) => k.px(c + s * 0.6, y - s * 0.4), 'base'); }],
    ca: ['cá', ['cá', 'fish', 'cá chép'], (A, c, y, s) => { A('H', (k) => k.ell(c + s * 0.1, y, s * 0.68, s * 0.42).poly([[c - s * 0.5, y], [c - s, y - s * 0.5], [c - s, y + s * 0.5]])); A('P', (k) => k.poly([[c, y - s * 0.35], [c + s * 0.35, y - s * 0.7], [c + s * 0.3, y - s * 0.3]])); A('vien', (k) => k.px(c + s * 0.5, y - s * 0.1), 'base'); }],
    rua: ['rùa', ['rùa', 'turtle', 'kim quy', 'mai rùa'], (A, c, y, s) => { A('P', (k) => k.ell(c + s * 0.8, y, s * 0.22, s * 0.2).ell(c - s * 0.5, y + s * 0.5, s * 0.2, s * 0.18).ell(c + s * 0.5, y + s * 0.5, s * 0.2, s * 0.18).ell(c - s * 0.5, y - s * 0.5, s * 0.2, s * 0.18).ell(c + s * 0.5, y - s * 0.5, s * 0.2, s * 0.18)); A('H', (k) => k.ell(c, y, s * 0.68, s * 0.58)); A('H', (k) => k.line(c - s * 0.3, y - s * 0.3, c + s * 0.3, y + s * 0.3, 1).line(c - s * 0.3, y + s * 0.3, c + s * 0.3, y - s * 0.3, 1), 'dk'); A('N', (k) => k.px(c, y), 'base'); }],
    ran: ['rồng / rắn', ['rồng', 'rắn', 'dragon', 'giao long', 'thuồng luồng'], (A, c, y, s) => { A('H', (k) => { for (let t = 0; t <= 1; t += 0.03) k.ell(c - s * 0.85 + t * s * 1.5, y + Math.sin(t * 6) * s * 0.4, s * (0.12 + t * 0.14), s * (0.12 + t * 0.14)); k.ell(c + s * 0.72, y - s * 0.15, s * 0.3, s * 0.25); }); A('P', (k) => k.line(c + s * 0.6, y - s * 0.4, c + s * 0.4, y - s * 0.8, 1).line(c + s * 0.85, y - s * 0.38, c + s * 0.9, y - s * 0.8, 1), 'lt'); A('vien', (k) => k.px(c + s * 0.8, y - s * 0.2), 'base'); }],
    riudong: ['rìu lưỡi xoè', [], (A, c, y, s) => { A('P', (k) => k.line(c - s * 0.8, y + s * 0.95, c + s * 0.35, y - s * 0.75, 2)); A('H', (k) => k.poly([[c - s * 0.05, y - s * 0.55], [c + s * 0.35, y - s], [c + s * 0.8, y - s * 0.85], [c + s, y - s * 0.3], [c + s * 0.85, y + s * 0.2], [c + s * 0.45, y + s * 0.15], [c + s * 0.3, y - s * 0.15]])); A('H', (k) => k.line(c + s * 0.75, y - s * 0.75, c + s * 0.9, y + s * 0.05, 1), 'lt'); A('N', (k) => k.px(c + s * 0.35, y - s * 0.4), 'base'); }],
    bua: ['búa', ['búa', 'hammer', 'chày', 'vồ'], (A, c, y, s) => { A('P', (k) => k.line(c - s * 0.75, y + s * 0.9, c + s * 0.2, y - s * 0.1, 2)); A('H', (k) => k.poly([[c - s * 0.15, y - s * 0.55], [c + s * 0.45, y - s], [c + s, y - s * 0.4], [c + s * 0.4, y + s * 0.1]])); A('N', (k) => k.px(c + s * 0.42, y - s * 0.45), 'base'); }],
    cot: ['cột', ['cột', 'trụ', 'pillar', 'cột mốc'], (A, c, y, s) => { A('H', (k) => k.rect(c - s * 0.35, y - s * 0.7, s * 0.7 + 1, s * 1.6)); A('H', (k) => k.rect(c - s * 0.5, y - s * 0.9, s + 1, s * 0.25).rect(c - s * 0.5, y + s * 0.8, s + 1, s * 0.2), 'lt'); A('P', (k) => k.rect(c - s * 0.35, y - s * 0.1, s * 0.7 + 1, s * 0.2), 'base'); A('N', (k) => k.ell(c, y - s * 0.45, s * 0.18, s * 0.18), 'base'); }],
    co: ['cờ', ['cờ', 'flag', 'banner', 'phướn'], (A, c, y, s) => { A('P', (k) => k.line(c - s * 0.6, y - s, c - s * 0.6, y + s, 1)); A('H', (k) => k.poly([[c - s * 0.5, y - s * 0.9], [c + s * 0.95, y - s * 0.7], [c + s * 0.45, y - s * 0.4], [c + s * 0.95, y - s * 0.1], [c - s * 0.5, y + s * 0.05]])); A('N', (k) => k.px(c, y - s * 0.45), 'base'); }],
    thuyen: ['thuyền', ['thuyền', 'boat', 'đò', 'ghe', 'bè'], (A, c, y, s) => { A('P', (k) => k.poly([[c - s, y + s * 0.3], [c + s, y + s * 0.3], [c + s * 0.65, y + s * 0.8], [c - s * 0.65, y + s * 0.8]])); A('H', (k) => k.poly([[c - s * 0.05, y - s], [c + s * 0.7, y + s * 0.15], [c - s * 0.05, y + s * 0.15]])); A('P', (k) => k.line(c - s * 0.1, y - s, c - s * 0.1, y + s * 0.3, 1), 'dk'); }],
    nha: ['nhà sàn', ['nhà', 'hut', 'lều', 'đình'], (A, c, y, s) => { A('P', (k) => k.rect(c - s * 0.7, y + s * 0.3, 1, s * 0.7).rect(c + s * 0.6, y + s * 0.3, 1, s * 0.7).rect(c - s * 0.05, y + s * 0.3, 1, s * 0.7)); A('P', (k) => k.rect(c - s * 0.7, y - s * 0.15, s * 1.4 + 1, s * 0.5)); A('H', (k) => k.poly([[c - s, y - s * 0.1], [c - s * 0.35, y - s * 0.95], [c + s * 0.35, y - s * 0.95], [c + s, y - s * 0.1]])); A('den', (k) => k.rect(c - s * 0.15, y - s * 0.05, s * 0.3 + 1, s * 0.35), 'dk'); }],
    cong: ['cổng', ['cổng', 'gate'], (A, c, y, s) => { A('P', (k) => k.rect(c - s * 0.8, y - s * 0.5, s * 0.3, s * 1.5).rect(c + s * 0.5, y - s * 0.5, s * 0.3, s * 1.5)); A('H', (k) => k.poly([[c - s, y - s * 0.45], [c - s * 0.75, y - s], [c + s * 0.75, y - s], [c + s, y - s * 0.45]])); A('H', (k) => k.rect(c - s * 0.55, y - s * 0.3, s * 1.1, s * 0.15), 'dk'); }],
    thanh: ['thành lũy', ['thành', 'citadel', 'castle', 'lũy'], (A, c, y, s) => { A('H', (k) => { k.rect(c - s, y - s * 0.2, s * 2 + 1, s * 1.2); for (let i = 0; i < 5; i++) k.rect(c - s + i * s * 0.5, y - s * 0.4, s * 0.25 + 1, s * 0.25); k.rect(c - s * 0.3, y - s, s * 0.6 + 1, s * 0.8); }); A('den', (k) => k.ell(c, y + s * 0.6, s * 0.25, s * 0.4).rect(c - s * 0.25, y + s * 0.6, s * 0.5 + 1, s * 0.4), 'dk'); A('N', (k) => k.rect(c - s * 0.05, y - s * 0.75, 1, 2), 'base'); }],
    hang: ['miệng hang', ['hang', 'cave', 'động'], (A, c, y, s) => { A('H', (k) => k.ell(c, y + s * 0.3, s, s * 1.1).cut(new Mask(k.w, k.h).rect(0, Math.round(y + s + 1), k.w, k.h))); A('den', (k) => k.ell(c, y + s * 0.5, s * 0.55, s * 0.7).cut(new Mask(k.w, k.h).rect(0, Math.round(y + s + 1), k.w, k.h)), 'base'); A('H', (k) => k.poly([[c - s * 0.4, y - s * 0.15], [c - s * 0.25, y - s * 0.15], [c - s * 0.32, y + s * 0.15]]).poly([[c + s * 0.15, y - s * 0.2], [c + s * 0.35, y - s * 0.2], [c + s * 0.25, y + s * 0.1]]), 'lt'); }],
    da: ['tảng đá', ['đá', 'rock', 'stone', 'tảng'], (A, c, y, s) => { A('H', (k) => k.poly([[c - s * 0.9, y + s * 0.85], [c - s * 0.75, y - s * 0.05], [c - s * 0.25, y - s * 0.6], [c + s * 0.4, y - s * 0.5], [c + s * 0.9, y + s * 0.1], [c + s * 0.95, y + s * 0.85]])); A('H', (k) => k.line(c - s * 0.15, y - s * 0.3, c + s * 0.1, y + s * 0.3, 1), 'dk'); A('N', (k) => k.px(c - s * 0.4, y - s * 0.1), 'base'); }],
    bui: ['bụi cây', ['bụi', 'bush', 'cỏ', 'khóm'], (A, c, y, s) => { A('H', (k) => k.ell(c - s * 0.45, y + s * 0.3, s * 0.5, s * 0.5).ell(c + s * 0.45, y + s * 0.3, s * 0.5, s * 0.5).ell(c, y - s * 0.1, s * 0.55, s * 0.55).rect(c - s * 0.9, y + s * 0.4, s * 1.8, s * 0.55)); A('N', (k) => k.px(c - s * 0.4, y + s * 0.1).px(c + s * 0.3, y - s * 0.2), 'base'); }],
    lau: ['lau sậy', ['lau', 'sậy', 'reed', 'cói'], (A, c, y, s) => { for (const [dx, h] of [[-0.6, 0.6], [-0.2, 0.95], [0.2, 0.75], [0.6, 0.5]]) { A('H', (k) => k.line(c + dx * s, y + s, c + dx * s + s * 0.1, y + s - h * s * 1.8, 1)); A('P', (k) => k.ell(c + dx * s + s * 0.1, y + s - h * s * 1.8, s * 0.1, s * 0.22)); } }],
    so: ['vỏ sò', ['sò', 'shell', 'ốc', 'hến', 'trai'], (A, c, y, s) => { A('H', (k) => k.ell(c, y + s * 0.1, s * 0.85, s * 0.75).cut(new Mask(k.w, k.h).rect(0, Math.round(y + s * 0.45), k.w, k.h)).poly([[c - s * 0.3, y + s * 0.4], [c + s * 0.3, y + s * 0.4], [c + s * 0.15, y + s * 0.8], [c - s * 0.15, y + s * 0.8]])); for (let i = -2; i <= 2; i++) A('H', (k) => k.line(c, y + s * 0.6, c + i * s * 0.35, y - s * 0.45, 1), 'dk'); }],
    xuong: ['xương', ['xương', 'bones', 'sọ'], (A, c, y, s) => { A('H', (k) => k.line(c - s * 0.75, y - s * 0.55, c + s * 0.75, y + s * 0.55, 2).line(c - s * 0.75, y + s * 0.55, c + s * 0.75, y - s * 0.55, 2)); for (const [a, b] of [[-1, -1], [1, 1], [-1, 1], [1, -1]]) A('H', (k) => k.ell(c + a * s * 0.8, y + b * s * 0.6, s * 0.2, s * 0.2)); }],
    tinhthe: ['tinh thể', ['tinh thể', 'crystal', 'pha lê', 'kim cương'], (A, c, y, s) => { A('H', (k) => k.poly([[c, y - s], [c + s * 0.35, y - s * 0.5], [c + s * 0.3, y + s], [c - s * 0.3, y + s], [c - s * 0.35, y - s * 0.5]]).poly([[c - s * 0.6, y - s * 0.2], [c - s * 0.35, y + s * 0.1], [c - s * 0.4, y + s], [c - s * 0.85, y + s], [c - s * 0.85, y + s * 0.1]]).poly([[c + s * 0.65, y - s * 0.35], [c + s * 0.9, y + s * 0.05], [c + s * 0.85, y + s], [c + s * 0.4, y + s], [c + s * 0.4, y]])); A('trang', (k) => k.line(c - s * 0.1, y - s * 0.5, c - s * 0.1, y + s * 0.5, 1), 'lt'); }],
    mangda: ['măng đá', ['măng đá', 'nhũ đá', 'stalag'], (A, c, y, s) => { A('H', (k) => k.poly([[c - s * 0.1, y - s], [c + s * 0.35, y + s], [c - s * 0.55, y + s]]).poly([[c + s * 0.55, y - s * 0.3], [c + s * 0.85, y + s], [c + s * 0.25, y + s]]).poly([[c - s * 0.7, y - s * 0.1], [c - s * 0.45, y + s], [c - s * 0.95, y + s]])); }],
    dua: ['cây dừa', ['dừa', 'palm', 'cau'], (A, c, y, s) => { A('P', (k) => { for (let t = 0; t <= 1; t += 0.05) k.rect(c - s * 0.2 + Math.sin(t * 2) * s * 0.3, y + s - t * s * 1.5, 2, 1); }); for (const [ex, ey] of [[-1, -0.1], [-0.6, -0.95], [0.5, -1], [1, -0.15], [0.05, -0.2]]) A('H', (k) => k.line(c + s * 0.1, y - s * 0.55, c + ex * s, y + ey * s * 0.6 - s * 0.3, 2)); A('N', (k) => k.ell(c + s * 0.05, y - s * 0.4, s * 0.15, s * 0.15), 'base'); }],
    ruong: ['ô ruộng lúa', ['ruộng', 'paddy'], (A, c, y, s) => { A('P', (k) => k.rect(c - s, y - s * 0.7, s * 2 + 1, s * 1.5)); for (let r = 0; r < 3; r++) for (let q = 0; q < 4; q++) A('H', (k) => k.line(c - s * 0.75 + q * s * 0.5, y - s * 0.35 + r * s * 0.45, c - s * 0.75 + q * s * 0.5, y - s * 0.6 + r * s * 0.45, 1), 'lt'); }],
    de: ['đế elip', ['đế', 'platform', 'bệ'], (A, c, y, s) => { A('H', (k) => k.ell(c, y + s * 0.25, s * 0.95, s * 0.55), 'dk'); A('H', (k) => k.ell(c, y + s * 0.05, s * 0.95, s * 0.5)); A('N', (k) => { k.ell(c, y + s * 0.05, s * 0.55, s * 0.28).cut(new Mask(k.w, k.h).ell(c, y + s * 0.05, s * 0.55 - 1.2, s * 0.28 - 1)); }, 'base'); }],
    khoa: ['ổ khoá', ['khoá', 'khóa', 'lock'], (A, c, y, s) => { A('P', (k) => { k.ell(c, y - s * 0.3, s * 0.45, s * 0.55).cut(new Mask(k.w, k.h).ell(c, y - s * 0.3, s * 0.45 - 1.4, s * 0.55 - 1.4)); }); A('H', (k) => k.rect(c - s * 0.7, y - s * 0.1, s * 1.4 + 1, s * 1.05)); A('vien', (k) => k.rect(c - 0.5, y + s * 0.2, 1, s * 0.4), 'base'); }],
    khoamo: ['khoá mở', ['mở khoá', 'mở khóa', 'unlock'], (A, c, y, s) => { A('P', (k) => { k.ell(c + s * 0.4, y - s * 0.45, s * 0.45, s * 0.5).cut(new Mask(k.w, k.h).ell(c + s * 0.4, y - s * 0.45, s * 0.45 - 1.4, s * 0.5 - 1.4)).cut(new Mask(k.w, k.h).rect(0, Math.round(y - s * 0.3), Math.round(c + s * 0.3), k.h)); }); A('H', (k) => k.rect(c - s * 0.75, y - s * 0.1, s * 1.4 + 1, s * 1.05)); A('vien', (k) => k.rect(c - s * 0.05, y + s * 0.2, 1, s * 0.4), 'base'); }],
    dau: ['dấu tích', ['tích', 'check', 'xong', 'đã nhận', 'hoàn thành'], (A, c, y, s) => { A('H', (k) => k.line(c - s * 0.8, y, c - s * 0.25, y + s * 0.6, 3).line(c - s * 0.25, y + s * 0.6, c + s * 0.8, y - s * 0.65, 3)); }],
    x: ['dấu X', ['đóng', 'close', 'huỷ', 'hủy', 'thoát'], (A, c, y, s) => { A('H', (k) => k.line(c - s * 0.7, y - s * 0.7, c + s * 0.7, y + s * 0.7, 3).line(c - s * 0.7, y + s * 0.7, c + s * 0.7, y - s * 0.7, 3)); }],
    play: ['tam giác chơi', ['chơi', 'play', 'bắt đầu', 'xuất trận'], (A, c, y, s) => { A('H', (k) => k.poly([[c - s * 0.55, y - s * 0.8], [c + s * 0.8, y], [c - s * 0.55, y + s * 0.8]])); }],
    dung: ['ô dừng', ['dừng', 'stop', 'tạm dừng'], (A, c, y, s) => { A('H', (k) => k.rect(c - s * 0.6, y - s * 0.6, s * 1.2 + 1, s * 1.2 + 1)); }],
    doi: ['mũi tên đổi', ['đổi', 'swap', 'hoán', 'đổi chỗ'], (A, c, y, s) => { A('H', (k) => k.line(c - s * 0.8, y - s * 0.35, c + s * 0.5, y - s * 0.35, 2).poly([[c + s * 0.9, y - s * 0.35], [c + s * 0.4, y - s * 0.8], [c + s * 0.4, y + s * 0.1]]).line(c + s * 0.8, y + s * 0.45, c - s * 0.5, y + s * 0.45, 2).poly([[c - s * 0.9, y + s * 0.45], [c - s * 0.4, y], [c - s * 0.4, y + s * 0.9]])); }],
    len: ['mũi tên lên', ['nâng', 'lên', 'up', 'tăng'], (A, c, y, s) => { A('H', (k) => k.poly([[c, y - s * 0.9], [c + s * 0.8, y], [c + s * 0.3, y], [c + s * 0.3, y + s * 0.85], [c - s * 0.3, y + s * 0.85], [c - s * 0.3, y], [c - s * 0.8, y]])); }],
    phai: ['mũi tên phải', ['phải', 'tiếp', 'right', 'next'], (A, c, y, s) => { A('H', (k) => k.poly([[c + s * 0.9, y], [c, y - s * 0.8], [c, y - s * 0.3], [c - s * 0.85, y - s * 0.3], [c - s * 0.85, y + s * 0.3], [c, y + s * 0.3], [c, y + s * 0.8]])); }],
    tua1: ['tốc độ ×1', ['x1', '×1'], (A, c, y, s) => { A('H', (k) => k.poly([[c - s * 0.4, y - s * 0.7], [c + s * 0.5, y], [c - s * 0.4, y + s * 0.7]])); }],
    tua2: ['tốc độ ×2', ['x2', '×2'], (A, c, y, s) => { for (const dx of [-0.45, 0.35]) A('H', (k) => k.poly([[c + (dx - 0.4) * s, y - s * 0.65], [c + (dx + 0.4) * s, y], [c + (dx - 0.4) * s, y + s * 0.65]])); }],
    tua3: ['tốc độ ×3', ['x3', '×3'], (A, c, y, s) => { for (const dx of [-0.6, 0, 0.6]) A('H', (k) => k.poly([[c + (dx - 0.3) * s, y - s * 0.6], [c + (dx + 0.3) * s, y], [c + (dx - 0.3) * s, y + s * 0.6]])); }],
    them: ['dấu cộng', ['cộng', 'thêm', 'plus'], (A, c, y, s) => { A('H', (k) => k.rect(c - s * 0.25, y - s * 0.8, s * 0.5 + 1, s * 1.6 + 1).rect(c - s * 0.8, y - s * 0.25, s * 1.6 + 1, s * 0.5 + 1)); }],
    cuon: ['cuộn thư', ['cuộn', 'scroll', 'sắc', 'nhiệm vụ', 'chiếu'], (A, c, y, s) => { A('trang', (k) => k.rect(c - s * 0.6, y - s * 0.75, s * 1.2 + 1, s * 1.5)); A('H', (k) => k.ell(c, y - s * 0.8, s * 0.85, s * 0.2).ell(c, y + s * 0.8, s * 0.85, s * 0.2)); A('den', (k) => k.line(c - s * 0.35, y - s * 0.3, c + s * 0.35, y - s * 0.3, 1).line(c - s * 0.35, y + s * 0.05, c + s * 0.35, y + s * 0.05, 1).line(c - s * 0.35, y + s * 0.4, c + s * 0.15, y + s * 0.4, 1), 'dk'); }],
    sach: ['sách', ['sách', 'book', 'sổ', 'cẩm nang'], (A, c, y, s) => { A('H', (k) => k.rect(c - s * 0.75, y - s * 0.85, s * 1.5 + 1, s * 1.7)); A('trang', (k) => k.rect(c - s * 0.55, y + s * 0.6, s * 1.3, s * 0.2), 'base'); A('P', (k) => k.rect(c - s * 0.75, y - s * 0.85, s * 0.25, s * 1.7), 'dk'); A('N', (k) => k.ell(c + s * 0.1, y - s * 0.2, s * 0.25, s * 0.25), 'base'); }],
    phongbi: ['phong thư', ['thư', 'hộp thư', 'mail', 'góp ý'], (A, c, y, s) => { A('trang', (k) => k.rect(c - s * 0.9, y - s * 0.6, s * 1.8 + 1, s * 1.2 + 1)); A('H', (k) => k.line(c - s * 0.9, y - s * 0.6, c, y + s * 0.1, 1).line(c + s * 0.9, y - s * 0.6, c, y + s * 0.1, 1), 'dk'); A('N', (k) => k.ell(c, y + s * 0.1, s * 0.18, s * 0.18), 'base'); }],
    but: ['bút lông', ['bút', 'brush', 'đổi tên', 'viết'], (A, c, y, s) => { A('P', (k) => k.line(c + s * 0.85, y - s * 0.85, c - s * 0.2, y + s * 0.2, 2)); A('H', (k) => k.poly([[c - s * 0.1, y + s * 0.05], [c - s * 0.45, y + s * 0.1], [c - s * 0.9, y + s * 0.9], [c - s * 0.15, y + s * 0.45]])); }],
    chat: ['bóng thoại', ['chat', 'trò chuyện', 'nói', 'tin nhắn'], (A, c, y, s) => { A('H', (k) => k.ell(c, y - s * 0.15, s * 0.9, s * 0.62).poly([[c - s * 0.5, y + s * 0.2], [c - s * 0.7, y + s * 0.95], [c, y + s * 0.35]])); A('vien', (k) => k.px(c - s * 0.45, y - s * 0.15).px(c, y - s * 0.15).px(c + s * 0.45, y - s * 0.15), 'base'); }],
    canhbao: ['cảnh báo', ['cảnh báo', 'warning', 'chú ý', 'nguy'], (A, c, y, s) => { A('H', (k) => k.poly([[c, y - s * 0.95], [c + s, y + s * 0.8], [c - s, y + s * 0.8]])); A('vien', (k) => k.rect(c - 0.5, y - s * 0.35, 2, s * 0.65).rect(c - 0.5, y + s * 0.45, 2, 2), 'base'); }],
    hoi: ['dấu hỏi', ['hỏi', 'trợ giúp', 'help', 'hướng dẫn', 'gợi ý', 'chưa khám phá', 'bí ẩn'], (A, c, y, s) => { A('H', (k) => { k.ell(c, y - s * 0.4, s * 0.6, s * 0.5).cut(new Mask(k.w, k.h).ell(c, y - s * 0.4, s * 0.6 - 2, s * 0.5 - 2)).cut(new Mask(k.w, k.h).rect(0, Math.round(y - s * 0.4), Math.round(c), k.h)); k.rect(c - 1, y, 2, s * 0.35).rect(c - 1, y + s * 0.6, 2, 2); }); }],
    dongho: ['đồng hồ cát', ['đồng hồ', 'thời gian', 'hồi chiêu', 'chờ', 'hourglass', 'sớm'], (A, c, y, s) => { A('P', (k) => k.rect(c - s * 0.7, y - s * 0.95, s * 1.4 + 1, s * 0.2).rect(c - s * 0.7, y + s * 0.75, s * 1.4 + 1, s * 0.2)); A('trang', (k) => k.poly([[c - s * 0.55, y - s * 0.75], [c + s * 0.55, y - s * 0.75], [c, y], [c + s * 0.55, y + s * 0.75], [c - s * 0.55, y + s * 0.75], [c, y]])); A('H', (k) => k.poly([[c - s * 0.4, y + s * 0.75], [c + s * 0.4, y + s * 0.75], [c, y + s * 0.3]]).poly([[c - s * 0.25, y - s * 0.4], [c + s * 0.25, y - s * 0.4], [c, y - s * 0.1]]), 'base'); }],
    cup: ['cúp', ['cúp', 'trophy', 'thắng'], (A, c, y, s) => { A('H', (k) => k.poly([[c - s * 0.7, y - s * 0.85], [c + s * 0.7, y - s * 0.85], [c + s * 0.5, y - s * 0.1], [c, y + s * 0.15], [c - s * 0.5, y - s * 0.1]]).rect(c - s * 0.15, y + s * 0.1, s * 0.3 + 1, s * 0.5).rect(c - s * 0.55, y + s * 0.6, s * 1.1 + 1, s * 0.3)); A('H', (k) => { k.ell(c - s * 0.75, y - s * 0.5, s * 0.25, s * 0.3).cut(new Mask(k.w, k.h).ell(c - s * 0.75, y - s * 0.5, s * 0.25 - 1, s * 0.3 - 1)); k.ell(c + s * 0.75, y - s * 0.5, s * 0.25, s * 0.3).cut(new Mask(k.w, k.h).ell(c + s * 0.75, y - s * 0.5, s * 0.25 - 1, s * 0.3 - 1)); }, 'dk'); A('N', (k) => k.ell(c, y - s * 0.45, s * 0.18, s * 0.18), 'base'); }],
    huychuong: ['huy chương', ['huy chương', 'medal', 'huân chương'], (A, c, y, s) => { A('P', (k) => k.poly([[c - s * 0.6, y - s], [c - s * 0.2, y - s], [c + s * 0.15, y - s * 0.1], [c - s * 0.25, y - s * 0.1]]).poly([[c + s * 0.6, y - s], [c + s * 0.2, y - s], [c - s * 0.15, y - s * 0.1], [c + s * 0.25, y - s * 0.1]])); A('H', (k) => k.ell(c, y + s * 0.4, s * 0.55, s * 0.55)); A('N', (k) => k.ell(c, y + s * 0.4, s * 0.25, s * 0.25), 'base'); }],
    mien: ['vương miện', ['vương miện', 'miện', 'crown', 'vua', 'tinh anh'], (A, c, y, s) => { A('H', (k) => k.poly([[c - s * 0.9, y + s * 0.6], [c - s * 0.9, y - s * 0.5], [c - s * 0.45, y], [c, y - s * 0.75], [c + s * 0.45, y], [c + s * 0.9, y - s * 0.5], [c + s * 0.9, y + s * 0.6]])); A('N', (k) => k.px(c, y + s * 0.2).px(c - s * 0.5, y + s * 0.3).px(c + s * 0.5, y + s * 0.3), 'base'); }],
    bia: ['bia ngắm', ['bia', 'target', 'ngắm', 'mục tiêu', 'tầm'], (A, c, y, s) => { A('H', (k) => k.ell(c, y, s * 0.9, s * 0.9)); A('trang', (k) => k.ell(c, y, s * 0.6, s * 0.6)); A('H', (k) => k.ell(c, y, s * 0.32, s * 0.32), 'base'); }],
    quyen: ['nắm đấm', ['đấm', 'quyền', 'sức mạnh', 'lực', 'fist'], (A, c, y, s) => { A('H', (k) => k.rect(c - s * 0.65, y - s * 0.55, s * 1.3 + 1, s * 0.95).ell(c - s * 0.65, y + s * 0.05, s * 0.3, s * 0.35).rect(c - s * 0.4, y + s * 0.35, s * 0.9, s * 0.6)); A('H', (k) => k.line(c - s * 0.2, y - s * 0.55, c - s * 0.2, y - s * 0.1, 1).line(c + s * 0.2, y - s * 0.55, c + s * 0.2, y - s * 0.1, 1), 'dk'); }],
    daulau: ['đầu lâu', ['đầu lâu', 'skull', 'chết', 'tử'], (A, c, y, s) => { A('trang', (k) => k.ell(c, y - s * 0.2, s * 0.8, s * 0.7).rect(c - s * 0.45, y + s * 0.3, s * 0.9 + 1, s * 0.55)); A('vien', (k) => k.ell(c - s * 0.35, y - s * 0.15, s * 0.2, s * 0.2).ell(c + s * 0.35, y - s * 0.15, s * 0.2, s * 0.2).px(c, y + s * 0.25).rect(c - s * 0.2, y + s * 0.65, 1, s * 0.25).rect(c + s * 0.15, y + s * 0.65, 1, s * 0.25), 'base'); }],
    bang: ['bông tuyết / băng', ['băng', 'tuyết', 'đóng băng', 'ice', 'frost', 'lạnh'], (A, c, y, s) => { A('H', (k) => { for (let a = 0; a < 3; a++) { const t = a * Math.PI / 3; k.line(c - Math.cos(t) * s * 0.9, y - Math.sin(t) * s * 0.9, c + Math.cos(t) * s * 0.9, y + Math.sin(t) * s * 0.9, 2); } }); A('N', (k) => k.px(c, y), 'base'); }],
    xoay: ['xoáy', ['xoáy', 'choáng', 'stun', 'lốc', 'gió'], (A, c, y, s) => { A('H', (k) => { for (let t = 0; t < 1; t += 0.01) { const a = t * Math.PI * 3.5, r = s * (0.15 + t * 0.8); const w = s < 6 ? 1 : 2; k.rect(c + Math.cos(a) * r, y + Math.sin(a) * r * 0.8, w, w); } }); }],
    nam: ['nấm linh chi', ['nấm', 'linh chi', 'mushroom'], (A, c, y, s) => { A('P', (k) => k.rect(c - s * 0.2, y, s * 0.4 + 1, s * 0.95)); A('H', (k) => k.ell(c, y - s * 0.1, s * 0.9, s * 0.6).cut(new Mask(k.w, k.h).rect(0, Math.round(y + s * 0.15), k.w, k.h))); A('N', (k) => k.px(c - s * 0.4, y - s * 0.35).px(c + s * 0.3, y - s * 0.45), 'base'); }],
    binh: ['bình thuốc', ['bình', 'thuốc', 'potion', 'lọ', 'rượu'], (A, c, y, s) => { A('P', (k) => k.rect(c - s * 0.2, y - s * 0.95, s * 0.4 + 1, s * 0.3)); A('trang', (k) => k.rect(c - s * 0.15, y - s * 0.7, s * 0.3 + 1, s * 0.3)); A('H', (k) => k.ell(c, y + s * 0.3, s * 0.7, s * 0.65)); A('N', (k) => k.px(c - s * 0.25, y + s * 0.1), 'base'); }],
    nguoi: ['người', ['người', 'vai trò', 'nhân vật', 'hero'], (A, c, y, s) => { A('H', (k) => k.ell(c, y - s * 0.45, s * 0.38, s * 0.4).ell(c, y + s * 0.75, s * 0.8, s * 0.6).cut(new Mask(k.w, k.h).rect(0, Math.round(y + s + 1), k.w, k.h))); }],
    nhom: ['nhóm người', ['nhóm', 'bạn', 'đồng đội', 'group'], (A, c, y, s) => { for (const dx of [-0.5, 0.5]) A('P', (k) => k.ell(c + dx * s, y - s * 0.35, s * 0.25, s * 0.27).ell(c + dx * s, y + s * 0.55, s * 0.45, s * 0.42)); A('H', (k) => k.ell(c, y - s * 0.25, s * 0.3, s * 0.32).ell(c, y + s * 0.75, s * 0.55, s * 0.5).cut(new Mask(k.w, k.h).rect(0, Math.round(y + s + 1), k.w, k.h))); }],
    ruongbau: ['rương báu', ['rương', 'hòm', 'kho', 'chest', 'báu'], (A, c, y, s) => { A('P', (k) => k.rect(c - s * 0.85, y - s * 0.2, s * 1.7 + 1, s * 1.05)); A('P', (k) => k.ell(c, y - s * 0.25, s * 0.85, s * 0.5).cut(new Mask(k.w, k.h).rect(0, Math.round(y - s * 0.2), k.w, k.h)), 'lt'); A('H', (k) => k.rect(c - s * 0.85, y - s * 0.2, s * 1.7 + 1, s * 0.18).rect(c - s * 0.2, y - s * 0.3, s * 0.4 + 1, s * 0.5)); A('N', (k) => k.px(c, y - s * 0.1), 'base'); }],
    giot: ['giọt độc', ['độc', 'poison', 'nọc'], (A, c, y, s) => { A('H', (k) => k.ell(c, y + s * 0.3, s * 0.6, s * 0.6).poly([[c, y - s * 0.95], [c + s * 0.55, y + s * 0.15], [c - s * 0.55, y + s * 0.15]])); A('vien', (k) => k.px(c - s * 0.2, y + s * 0.2).px(c + s * 0.2, y + s * 0.2), 'base'); }],
  };
  // từ khoá → hình thêm (khớp nguyên từ; cụm dài trước); dùng chung cho icon / đồ / thần khí / ấn phù / kỹ năng
  const HINH_TU = Object.entries(HINH_THEM).map(([k, v]) => [k, v[1]]);

  // bộ phận chọn được (theo loại hình)
  const OPT_NV = {
    dang: ['Dáng', { nguoi: 'người', thu: 'thú 4 chân', ran: 'rắn / cá / rồng' }],
    than: ['Chất liệu thân', { nguoi: 'người (da)', xuong: 'bộ xương', da: 'đá', ma: 'hồn ma', giay: 'giấy vàng mã', go: 'gỗ / rối', dong: 'đồng', cay: 'cây rêu' }],
    dau: ['Tóc', { ngan: 'tóc ngắn', bui: 'búi tó', dung: 'tóc dựng', dai: 'tóc dài', troc: 'đầu trọc' }],
    mauToc: ['Màu tóc / lông', null],
    mu: ['Mũ / khăn', { khong: 'không', khan: 'khăn vấn', non: 'nón lá', long: 'mũ lông chim', mien: 'vương miện núi', mudong: 'mũ đồng', trum: 'mũ trùm', sung: 'sừng' }],
    mauMu: ['Màu mũ / khăn', null],
    ao: ['Áo', { ao: 'áo vải', giaolinh: 'áo giao lĩnh', giap: 'giáp', tran: 'cởi trần' }],
    mauAo: ['Màu áo', null],
    quan: ['Quần', { quan: 'quần', kho: 'khố', vay: 'váy' }],
    mauQuan: ['Màu quần', null],
    choang: ['Áo choàng', null],
    vk: ['Vũ khí', { khong: 'tay không', gay: 'gậy', giao: 'giáo', riu: 'rìu', kiem: 'kiếm / đao', cung: 'cung', cheo: 'mái chèo', chuong: 'gậy chuông' }],
    mauVk: ['Màu vũ khí', null],
    canh: ['Cánh', { khong: 'không', co: 'có cánh' }],
    hanh: ['Hành (chiêu)', null],
    dien: ['Hoá điên (boss)', { khong: 'không', co: 'có (rage)' }],
  };
  const OPT_ICON = {
    khung: ['Khung', { tron: 'đĩa trống đồng', khien: 'khiên', vuong: 'ô khung đồng', khong: 'không khung' }],
    mauKhung: ['Màu khung', null],
    hinh: ['Biểu tượng', { lua: 'lửa', nuoc: 'giọt nước', la: 'lá', nui: 'núi', kiem: 'kiếm', riu: 'rìu', khien: 'khiên', muiten: 'mũi tên', set: 'sấm sét', mattroi: 'mặt trời trống đồng', tim: 'tim', xu: 'đồng xu', sao: 'sao', ngoc: 'ngọc',
      ...Object.fromEntries(Object.entries(HINH_THEM).map(([k, v]) => [k, v[0]])) }],
    mauHinh: ['Màu biểu tượng', null],
    mauPhu: ['Màu phụ (cán gỗ, dây, lông…)', null],
    mauNgoc: ['Ngọc điểm', null],
  };
  const OPT_NEN = {
    nen: ['Loại ô', { co: 'cỏ', dat: 'đất', da: 'đá', nuoc: 'nước (gợn)', cat: 'cát', gach: 'gạch', tron: 'trơn', vat: 'vật trang trí (nền trong suốt)' }],
    mauNen: ['Màu', null],
    hinh: ['Vật (khi Loại ô = vật)', OPT_ICON.hinh[1]],
    mauHinh: ['Màu vật', null],
    mauPhu: ['Màu phụ', null],
    mauNgoc: ['Điểm nhấn', null],
  };
  // giao diện: khung / nút / thanh / ô / thẻ / huy hiệu / dải / núi — sinh theo cỡ bất kỳ (DANH-SACH ghi cỡ)
  const OPT_UI = {
    loai: ['Loại', { khung: 'khung bảng', nut: 'nút chữ nhật', nuttron: 'nút tròn', thanh: 'khung thanh (lòng trống)', o: 'ô đồ', the: 'thẻ (cửa sổ giữa trống)', huy: 'huy hiệu tròn', dai: 'dải lụa đuôi nheo', nui: 'núi bậc' }],
    mauKhung: ['Màu viền', null],
    mauNen: ['Màu lòng', null],
    vien: ['Kiểu viền', { tron: 'trơn', rang: 'răng cưa', cham: 'dải chấm tròn', dut: 'nét đứt', sao: 'đinh sao 2 đầu' }],
    trang: ['Trạng thái', { thuong: 'thường', nhan: 'nhấn (lún 1px)', khoa: 'khoá (xám xỉn)', chon: 'đang chọn (sáng)' }],
  };
  // cảnh 160×90 / 320×180: trời + núi xa + đất / nước + vật theo chủ đề
  const OPT_CANH = {
    canh: ['Chủ đề', { nui: 'núi', song: 'sông', bien: 'biển', rung: 'rừng', hang: 'hang', dam: 'đầm', thanh: 'thành', dong: 'đồng lúa', menu: 'menu (núi sông mặt trời)' }],
    gio: ['Giờ', { ngay: 'ngày', chieu: 'hoàng hôn', dem: 'đêm', u: 'u ám (thua)' }],
    mauTroi: ['Màu trời', null],
    mauDat: ['Màu đất / cỏ', null],
  };
  // bản đồ 320×148: nền sân đấu (đường + ô đặt tướng lấy từ spec "duong" / "o_dat")
  const OPT_BANDO = {
    chu_de: ['Chủ đề vùng', { song: 'sông', dam: 'đầm', rung: 'rừng', hang: 'hang', dong: 'đồng lúa', bien: 'biển', thanh: 'thành' }],
    duong_loai: ['Loại đường', { nuoc: 'sông nước', dat: 'đất', da: 'đá', de: 'đê', cat: 'cát', gach: 'gạch' }],
  };
  const OPT_TRONG = { trong: ['Khung', { trong: 'trống — tự vẽ tay' }] };
  const optSet = (g) => (NHAN_VAT(g) ? OPT_NV : g === 'nen' ? OPT_NEN : ['icon', 'do', 'an-phu', 'ky-nang', 'than-khi'].includes(g) ? OPT_ICON : g === 'giao-dien' ? OPT_UI : g === 'canh' ? OPT_CANH : g === 'ban-do' ? OPT_BANDO : OPT_TRONG);
  const MAU_KEYS = Object.keys(MAU_TEN);
  const HANH_KEYS = { '': '—', ...Object.fromEntries(Object.entries(HANH).map(([k, v]) => [k, v.ten])) };
  function optValues(key) {
    if (/^mau|^choang$/.test(key)) return key === 'choang' || key === 'mauNgoc' ? { khong: 'không', ...MAU_TEN } : MAU_TEN;
    if (key === 'hanh') return HANH_KEYS;
    return null;
  }
  function defOpts(g, code) {
    if (NHAN_VAT(g)) return { dang: 'nguoi', than: 'nguoi', dau: 'ngan', mauToc: 'den', mu: 'khong', mauMu: 'son', ao: 'ao', mauAo: g === 'tuong' ? 'cham' : 'reu', quan: 'quan', mauQuan: 'dat',
      choang: 'khong', vk: 'gay', mauVk: 'dat', canh: 'khong', hanh: '', dien: 'khong' };
    if (g === 'nen') return { nen: 'co', mauNen: 'la', hinh: 'da', mauHinh: 'sat', mauPhu: 'dat', mauNgoc: 'khong' };
    if (optSet(g) === OPT_ICON) return { khung: g === 'icon' ? 'tron' : 'vuong', mauKhung: 'dong', hinh: 'sao', mauHinh: 'vang', mauPhu: 'dat', mauNgoc: 'khong' };
    if (g === 'giao-dien') return { loai: 'khung', mauKhung: 'dong', mauNen: 'den', vien: 'tron', trang: 'thuong' };
    if (g === 'canh') return { canh: 'nui', gio: 'ngay', mauTroi: 'troi', mauDat: 'la' };
    if (g === 'ban-do') return { chu_de: 'song' };
    return { trong: 'trong' };
  }

  // ═════════════ đọc mô tả (tiếng Việt / Anh) → bộ phận ═════════════
  const lc = (s) => (s || '').toLowerCase();
  const MAU_TU = [  // thứ tự: cụm dài trước
    ['xanh lá mạ', 'lama'], ['lá mạ', 'lama'], ['xanh lá', 'lama'], ['xanh tre', 'lama'], ['xanh rêu', 'reu'], ['xanh núi', 'reu'], ['ô-liu', 'reu'], ['xanh dương', 'cham'], ['xanh lam', 'cham'],
    ['xanh biển', 'nuoc'], ['mòng két', 'ngoc'], ['gỉ đồng', 'ngoc'], ['xanh ngọc', 'ngoc'], ['vàng nghệ', 'vang'], ['vàng đất', 'cat'], ['trắng ngà', 'trang'], ['nâu đỏ', 'dat'],
    ['đỏ', 'son'], ['son', 'son'], ['cam', 'lua'], ['lửa', 'lua'], ['vàng', 'vang'], ['gold', 'vang'], ['đồng', 'dong'], ['bronze', 'dong'], ['sắt', 'sat'], ['iron', 'sat'], ['xám', 'sat'], ['thiếc', 'sat'],
    ['bạc', 'bac'], ['silver', 'bac'], ['trắng', 'trang'], ['white', 'trang'], ['ngà', 'trang'], ['đen', 'den'], ['black', 'den'], ['nâu', 'dat'], ['gỗ', 'dat'], ['wood', 'dat'], ['kem', 'cat'], ['rơm', 'cat'], ['cát', 'cat'],
    ['rêu', 'reu'], ['lá', 'la'], ['green', 'lama'], ['chàm', 'cham'], ['blue', 'nuoc'], ['nước', 'nuoc'], ['water', 'nuoc'], ['tím', 'tim'], ['mận', 'tim'], ['purple', 'tim'], ['ngọc', 'ngoc'], ['hồng', 'hong'], ['red', 'son'], ['xanh', 'reu'],
  ];
  // khớp nguyên từ (không khớp "rắn" trong "trắng")
  const RE_TU = new Map();
  const tu = (s, w) => { let r = RE_TU.get(w); if (!r) RE_TU.set(w, r = new RegExp(`(?<![\\p{L}\\p{M}])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}\\p{M}])`, 'u')); return r.test(s); };
  const mauTrong = (s) => { for (const [w, m] of MAU_TU) if (tu(s, w)) return m; return null; };
  const coTu = (s, ...ws) => ws.some((w) => tu(s, w));
  // từ khoá xuất hiện sớm nhất trong chuỗi: [[giá trị, [từ…]]…] → giá trị
  const som = (s, list) => { let best = null, bi = 1e9; for (const [k, ws] of list) for (const w of ws) { if (!tu(s, w)) continue; const i = s.indexOf(w); if (i < bi) { bi = i; best = k; } } return best; };
  function hieuMoTa(text, g, base) {
    const o = { ...base }, nhan = [];
    const s = lc(text);
    const set = (k, v, why) => { if (o[k] !== v) { o[k] = v; nhan.push(why); } };
    const h = s.match(/hành (kim|mộc|thủy|thuỷ|hỏa|hoả|thổ)|\b(kim|mộc|thủy|hỏa|thổ) #/);
    if (h) { const t = (h[1] || h[2]).replace('thuỷ', 'thủy').replace('hoả', 'hỏa'); set('hanh', { kim: 'kim', mộc: 'moc', thủy: 'thuy', hỏa: 'hoa', thổ: 'tho' }[t], 'hành ' + t); }
    if (NHAN_VAT(g)) {
      const loai = (lc(base.__ten || '') + ' , ' + s).split(/[,·+;/\n—(]/).filter((p) => !coTu(p, 'cưỡi', 'triệu hồi', 'hiệu ứng', 'chiêu')).join(' , ');
      if (coTu(loai, 'rắn', 'rồng', 'giao long', 'thuồng luồng', 'cá', 'lươn', 'serpent', 'dragon', 'snake')) set('dang', 'ran', 'dáng rắn/cá');
      else if (coTu(loai, 'hổ', 'báo', 'nghê', 'lân', 'trâu', 'lợn', 'chó', 'cáo', 'sói', 'ngựa', 'rùa', 'cóc', 'tiger', 'beast', 'thú')) set('dang', 'thu', 'dáng thú');
      if (coTu(s.replace(/lông chim|chim lạc/g, ''), 'cánh', 'dơi', 'chim', 'đại bàng', 'wing')) set('canh', 'co', 'có cánh');
      if (coTu(s, 'xương', 'skeleton')) set('than', 'xuong', 'thân xương');
      else if (coTu(s, 'người đá', 'thân đá', 'đá nứt', 'stone')) set('than', 'da', 'thân đá');
      else if (coTu(s, 'hồn', 'ma', 'bóng người', 'sương', 'ghost')) set('than', 'ma', 'hồn ma');
      else if (coTu(s, 'giấy', 'vàng mã', 'hình nhân')) set('than', 'giay', 'thân giấy');
      else if (coTu(s, 'con rối', 'rối gỗ', 'múa rối', 'gỗ sơn', 'tre đan', 'nan tre', 'đất sét', 'đất nung')) set('than', 'go', 'thân gỗ/đất');
      else if (coTu(s, 'giáp đồng rỗng', 'thân đồng', 'tượng đồng')) set('than', 'dong', 'thân đồng');
      else if (coTu(s, 'ma cây', 'thân gỗ mục', 'cây rêu')) set('than', 'cay', 'thân cây');
      // từng cụm (ngăn bằng , · + ; /)
      const mauLe = [];   // cụm chỉ có màu ("tím mận + cam") → màu áo rồi màu quần nếu chưa ghi rõ
      let roAo = false, roQuan = false;
      for (const raw of s.split(/[,·+;/\n]| và /)) {
        const p = raw.trim(); if (!p) continue;
        const m = mauTrong(p);
        if (coTu(p, 'áo choàng', 'choàng', 'cape', 'cloak')) { set('choang', m || 'son', 'áo choàng'); continue; }
        if (coTu(p, 'nón')) { set('mu', 'non', 'nón lá'); set('mauMu', m || 'cat', ''); continue; }
        if (coTu(p, 'vương miện', 'mũ miện', 'crown')) { set('mu', 'mien', 'vương miện'); set('mauMu', m || 'vang', ''); continue; }
        if (coTu(p, 'lông chim', 'mũ lông', 'quạt lông', 'vòng lông', 'feather')) { set('mu', 'long', 'mũ lông chim'); set('mauMu', m || 'trang', ''); continue; }
        if (coTu(p, 'mũ trùm', 'trùm', 'hood')) { set('mu', 'trum', 'mũ trùm'); set('mauMu', m || 'reu', ''); continue; }
        if (coTu(p, 'sừng', 'horn')) { set('mu', 'sung', 'sừng'); if (m) set('mauMu', m, ''); continue; }
        if (coTu(p, 'khăn', 'turban', 'headband')) { set('mu', 'khan', 'khăn'); set('mauMu', m || 'son', ''); continue; }
        if (coTu(p, 'mũ', 'helmet')) { set('mu', 'mudong', 'mũ'); set('mauMu', m || 'dong', ''); continue; }
        if (coTu(p, 'tóc', 'hair', 'búi', 'đầu cạo', 'hói', 'trọc')) {
          if (coTu(p, 'búi')) set('dau', 'bui', 'búi tó'); else if (coTu(p, 'dựng', 'rối', 'ngược')) set('dau', 'dung', 'tóc dựng');
          else if (coTu(p, 'dài', 'long')) set('dau', 'dai', 'tóc dài'); else if (coTu(p, 'hói', 'trọc', 'cạo')) set('dau', 'troc', 'đầu trọc');
          if (m) set('mauToc', m, 'màu tóc'); continue;
        }
        if (coTu(p, 'khố')) { set('quan', 'kho', 'khố'); if (m) { set('mauQuan', m, ''); roQuan = true; } continue; }
        if (coTu(p, 'váy')) { set('quan', 'vay', 'váy'); if (m) { set('mauQuan', m, ''); roQuan = true; } continue; }
        if (coTu(p, 'quần', 'xà cạp')) { set('quan', 'quan', 'quần'); if (m) { set('mauQuan', m, ''); roQuan = true; } continue; }
        const vk = coTu(p, 'mái chèo', 'chèo', 'paddle') ? 'cheo' : coTu(p, 'chuông', 'chiêng', 'bell') ? 'chuong' : coTu(p, 'giáo', 'thương', 'kích', 'mác', 'spear') ? 'giao'
          : coTu(p, 'rìu', 'búa', 'axe') ? 'riu' : coTu(p, 'kiếm', 'đao', 'gươm', 'dao', 'sword', 'blade') ? 'kiem' : coTu(p, 'cung', 'nỏ', 'bow', 'ống thổi') ? 'cung'
          : coTu(p, 'gậy', 'trượng', 'sào', 'đòn gánh', 'staff') ? 'gay' : coTu(p, 'tay không', 'tảng đá', 'tinh thể') ? 'khong' : null;
        if (vk) { set('vk', vk, 'vũ khí ' + OPT_NV.vk[1][vk]); set('mauVk', m || (coTu(p, 'tre') ? 'lama' : vk === 'gay' || vk === 'cheo' || vk === 'cung' ? 'dat' : 'sat'), ''); continue; }
        if (coTu(p, 'giáp', 'armor', 'vảy')) { set('ao', 'giap', 'giáp'); set('mauAo', m || 'sat', ''); roAo = true; continue; }
        if (coTu(p, 'giao lĩnh')) { set('ao', 'giaolinh', 'áo giao lĩnh'); if (m) { set('mauAo', m, ''); roAo = true; } continue; }
        if (coTu(p, 'cởi trần', 'ngực trần')) { set('ao', 'tran', 'cởi trần'); continue; }
        if (coTu(p, 'áo', 'thân', 'robe', 'shirt')) { if (m) { set('mauAo', m, 'màu áo'); roAo = true; } continue; }
        if (coTu(p, 'lông', 'fur', 'da') && m && o.dang !== 'nguoi') { set('mauToc', m, 'màu lông'); continue; }
        if (m && !coTu(p, 'mắt', 'eye', 'hành', 'kim', 'mộc', 'thủy', 'hỏa', 'thổ')) mauLe.push(m);
      }
      if (mauLe[0] && !roAo) set('mauAo', mauLe[0], 'màu áo ' + MAU_TEN[mauLe[0]]);
      if (mauLe[1] && !roQuan && o.quan !== 'kho') set('mauQuan', mauLe[1], 'màu quần ' + MAU_TEN[mauLe[1]]);
    } else if (optSet(g) === OPT_ICON) {
      const H = [...HINH_TU, ['lua', ['lửa', 'fire', 'flame', 'burn', 'hỏa']], ['set', ['sấm', 'sét', 'lightning', 'thunder', 'bolt']], ['nuoc', ['nước', 'water', 'drop', 'wave', 'giọt', 'sóng', 'thủy']],
        ['la', ['lá', 'leaf', 'tree', 'cây', 'lúa', 'mộc']], ['nui', ['núi', 'mountain', 'rock', 'đá', 'thổ']], ['riu', ['rìu', 'axe']], ['kiem', ['kiếm', 'sword', 'blade', 'đao']],
        ['muiten', ['mũi tên', 'arrow', 'bow', 'cung', 'nỏ']], ['khien', ['khiên', 'shield', 'giáp', 'armor']], ['mattroi', ['mặt trời', 'sun', 'trống', 'drum']], ['tim', ['tim', 'heart', 'máu', 'mạng']],
        ['xu', ['xu', 'coin', 'tiền', 'vàng']], ['ngoc', ['ngọc', 'gem', 'jewel', 'pearl', 'ấn']], ['sao', ['sao', 'star']]];
      const hk = som(s, H); if (hk) set('hinh', hk, 'biểu tượng ' + OPT_ICON.hinh[1][hk]);
      const m = mauTrong(s) || (o.hanh && HANH[o.hanh].ramp);
      if (m) set('mauHinh', m, 'màu ' + MAU_TEN[m]);
      if (coTu(s, 'khiên', 'shield')) set('khung', 'khien', 'khung khiên');
    } else if (g === 'nen') {
      const K = [['nuoc', ['nước', 'water', 'sông', 'đầm']], ['gach', ['gạch', 'thành', 'brick']], ['cat', ['cát', 'sand', 'biển']], ['da', ['đá', 'hang', 'stone']], ['dat', ['đất', 'đường', 'dirt', 'đê']], ['co', ['cỏ', 'grass', 'rừng']]];
      const nk = som(s, K); if (nk) set('nen', nk, 'ô ' + OPT_NEN.nen[1][nk]);
      const m = mauTrong(s); if (m) set('mauNen', m, 'màu ' + MAU_TEN[m]);
      else set('mauNen', { co: 'la', dat: 'dat', da: 'sat', nuoc: 'nuoc', cat: 'cat', gach: 'son', tron: o.mauNen }[o.nen], '');
    } else if (g === 'giao-dien') {
      const L = som(s, [['nuttron', ['nút tròn']], ['nut', ['nút', 'button']], ['thanh', ['thanh', 'bar']], ['o', ['ô đồ', 'slot']], ['the', ['thẻ', 'card']], ['huy', ['huy hiệu', 'đĩa']], ['dai', ['dải', 'ribbon']], ['nui', ['núi']], ['khung', ['khung', 'bảng', 'popup']]]);
      if (L) set('loai', L, OPT_UI.loai[1][L]);
      const T = som(s, [['nhan', ['nhấn', 'nhan']], ['khoa', ['khoá', 'khóa', 'khoa', 'thiếu']], ['chon', ['đang chọn', 'chọn', 'ghép']]]); if (T) set('trang', T, OPT_UI.trang[1][T]);
      const V = som(s, [['rang', ['răng cưa']], ['cham', ['chấm tròn', 'chấm']], ['dut', ['nét đứt', 'viền đứt']], ['sao', ['sao', 'đinh']]]); if (V) set('vien', V, OPT_UI.vien[1][V]);
      const m = mauTrong(s); if (m) set('mauKhung', m, 'viền ' + MAU_TEN[m]);
    } else if (g === 'canh') {
      const K = som(s, [['bien', ['biển', 'bien']], ['song', ['sông', 'song']], ['rung', ['rừng', 'rung']], ['hang', ['hang']], ['dam', ['đầm', 'dam']], ['thanh', ['thành', 'thanh']], ['dong', ['đồng', 'dong', 'lúa']], ['nui', ['núi', 'nui', 'sơn tinh']], ['menu', ['menu']]]);
      if (K) set('canh', K, OPT_CANH.canh[1][K]);
      if (coTu(s, 'đêm', 'dem', 'night')) set('gio', 'dem', 'đêm'); else if (coTu(s, 'thua', 'thất bại')) set('gio', 'u', 'u ám'); else if (coTu(s, 'hoàng hôn', 'chiều')) set('gio', 'chieu', 'hoàng hôn');
    }
    delete o.__ten;
    return { o, nhan: nhan.filter(Boolean) };
  }

  // ═════════════ lưới + vẽ ═════════════
  class Grid {
    constructor(w, h, d) { this.w = w; this.h = h; this.d = d ? Uint8Array.from(d) : new Uint8Array(w * h); }
    in(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
    get(x, y) { return this.in(x, y) ? this.d[y * this.w + x] : 0; }
    set(x, y, c) { if (this.in(x, y)) this.d[y * this.w + x] = c; }
    clone() { return new Grid(this.w, this.h, this.d); }
    empty() { return !this.d.some((v) => v); }
  }
  // mặt nạ (vùng) để tô 3 tông tự động: sáng mép trên-trái, tối mép dưới-phải
  class Mask {
    constructor(w, h) { this.w = w; this.h = h; this.d = new Uint8Array(w * h); }
    has(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h && this.d[y * this.w + x] === 1; }
    px(x, y) { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.d[y * this.w + x] = 1; return this; }
    rect(x, y, w, h) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(x + i, y + j); return this; }
    ell(cx, cy, rx, ry) { for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) if (((x - cx) / (rx + 0.35)) ** 2 + ((y - cy) / (ry + 0.35)) ** 2 <= 1) this.px(x, y); return this; }
    line(x0, y0, x1, y1, t = 1) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n; this.rect(Math.round(x - (t - 1) / 2), Math.round(y - (t - 1) / 2), t, t); } return this; }
    poly(pts) { const ys = pts.map((p) => p[1]); for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) { const xs = []; for (let i = 0; i < pts.length; i++) { const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length]; if ((ay <= y + 0.5 && by > y + 0.5) || (by <= y + 0.5 && ay > y + 0.5)) xs.push(ax + (y + 0.5 - ay) * (bx - ax) / (by - ay)); } xs.sort((a, b) => a - b); for (let i = 0; i + 1 < xs.length; i += 2) for (let x = Math.ceil(xs[i] - 0.5); x <= Math.floor(xs[i + 1] - 0.5); x++) this.px(x, y); } return this; }
    cut(o) { for (let i = 0; i < this.d.length; i++) if (o.d[i]) this.d[i] = 0; return this; }
  }
  const rampOf = (k) => (RAMP[k] || RAMP.dat).map(C);
  function paint(g, m, ramp, mode = 'auto') {
    const [dk, base, lt] = Array.isArray(ramp) ? ramp : rampOf(ramp);
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      if (!m.has(x, y)) continue;
      let c = base;
      if (mode === 'auto') {
        const L = !m.has(x - 1, y), R = !m.has(x + 1, y), U = !m.has(x, y - 1), D = !m.has(x, y + 1);
        if ((R && !L) || (D && !U)) c = dk; else if ((L && !R) || (U && !D)) c = lt;
      } else if (mode === 'dk') c = dk; else if (mode === 'lt') c = lt;
      g.set(x, y, c);
    }
  }
  function outline(g, col = C('vien')) {
    const add = [];
    for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) if (!g.get(x, y) && (g.get(x - 1, y) || g.get(x + 1, y) || g.get(x, y - 1) || g.get(x, y + 1))) add.push([x, y]);
    for (const [x, y] of add) g.set(x, y, col);
    return g;
  }
  function blit(dst, src, dx = 0, dy = 0) { for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) { const v = src.d[y * src.w + x]; if (v) dst.set(x + dx, y + dy, v); } return dst; }
  function shift(g, dx, dy) { const o = new Grid(g.w, g.h); return blit(o, g, dx, dy); }
  function flipX(g) { const o = new Grid(g.w, g.h); for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) o.set(g.w - 1 - x, y, g.get(x, y)); return o; }
  function rot90(g) { const o = new Grid(g.h, g.w); for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) o.set(g.h - 1 - y, x, g.get(x, y)); return o; }
  function swapC(g, map) { const o = g.clone(); for (let i = 0; i < o.d.length; i++) { const n = map[o.d[i]]; if (n) o.d[i] = n; } return o; }
  function bbox(g) { let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1; for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) if (g.get(x, y)) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } return x1 < 0 ? [0, 0, 0, 0] : [x0, y0, x1 - x0 + 1, y1 - y0 + 1]; }
  function scaleGrid(g, k, w, h) {   // phóng nearest (k có thể 1,5) vào khung w×h, neo đáy-giữa
    const o = new Grid(w, h), sw = Math.round(g.w * k), sh = Math.round(g.h * k), ox = Math.floor((w - sw) / 2), oy = h - sh;
    for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) o.set(ox + x, oy + y, g.get(Math.floor(x / k), Math.floor(y / k)));
    return o;
  }
  let SEED = 1;
  const rnd = () => { SEED = (SEED * 1103515245 + 12345) & 0x7fffffff; return SEED / 0x7fffffff; };
  const seedOf = (s) => { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) & 0x7fffffff; return h || 1; };

  // vũ khí: vẽ dựng đứng (mũi lên) trong lưới riêng rồi xoay quanh chỗ cầm
  function weaponGrid(kind, ramp) {
    const W = new Grid(11, 26), gx = 5, gy = 17;   // chỗ cầm (gx, gy)
    const cham = rampOf(ramp), go = rampOf(ramp === 'sat' || ramp === 'bac' || ramp === 'dong' || ramp === 'vang' ? 'dat' : ramp), kl = rampOf(ramp === 'dat' || ramp === 'lama' || ramp === 'cat' ? 'sat' : ramp);
    const m = (f) => { const k = new Mask(11, 26); f(k); return k; };
    if (kind === 'gay') paint(W, m((k) => k.rect(gx, 2, 2, 23)), cham);
    else if (kind === 'giao') { paint(W, m((k) => k.rect(gx, 6, 1, 19)), go); paint(W, m((k) => k.poly([[gx + 0.5, 0], [gx + 2.2, 4], [gx + 0.5, 7], [gx - 1.2, 4]])), kl); W.set(gx - 1, 7, C('son')); W.set(gx + 1, 7, C('son')); }
    else if (kind === 'riu') { paint(W, m((k) => k.rect(gx, 5, 1, 17)), go); paint(W, m((k) => k.poly([[gx, 4], [gx + 4.5, 2], [gx + 5, 8.5], [gx, 8]])), kl); }
    else if (kind === 'kiem') { paint(W, m((k) => k.rect(gx, 6, 2, 10)), kl); paint(W, m((k) => k.rect(gx, 5, 2, 1).px(gx, 4)), kl, 'lt'); paint(W, m((k) => k.rect(gx - 2, 16, 6, 1)), 'dong'); paint(W, m((k) => k.rect(gx, 17, 2, 3)), 'dat'); }
    else if (kind === 'cheo') { paint(W, m((k) => k.rect(gx, 0, 1, 18)), go); paint(W, m((k) => k.ell(gx + 0.5, 21.5, 1.6, 4)), go); }
    else if (kind === 'chuong') { paint(W, m((k) => k.rect(gx, 6, 1, 19)), 'dat'); paint(W, m((k) => k.poly([[gx - 1.5, 1], [gx + 2.5, 1], [gx + 3.5, 6], [gx - 2.5, 6]])), 'dong'); W.set(gx, 7, C('son')); W.set(gx + 1, 7, C('son')); }
    else if (kind === 'cung') { const k = m((q) => { for (let y = 4; y <= 23; y++) { const t = (y - 13.5) / 9.5; q.px(gx + 2 - Math.round(3 * t * t), y); } }); paint(W, k, go, 'base'); for (let y = 5; y <= 22; y++) W.set(gx - 1, y, C('trang-xam')); }
    return { g: W, gx, gy };
  }
  function stampWeapon(dst, wp, hx, hy, deg) {
    const a = -deg * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
    for (let y = -26; y < 27; y++) for (let x = -26; x < 27; x++) {
      const sx = Math.round(ca * x - sa * y) + wp.gx, sy = Math.round(sa * x + ca * y) + wp.gy;
      const v = wp.g.get(sx, sy);
      if (v) dst.set(hx + x, hy + y, v);
    }
  }
  // tia phép theo hành (khung cast)
  function burst(g, x, y, r, hanh) {
    const rm = rampOf((HANH[hanh] || HANH.kim).ramp);
    const k = new Mask(g.w, g.h);
    if (hanh === 'hoa') k.poly([[x, y - r - 1], [x + r * 0.8, y + r * 0.6], [x, y + r * 0.9], [x - r * 0.8, y + r * 0.6]]);
    else if (hanh === 'thuy') k.ell(x, y + r * 0.2, r * 0.7, r * 0.8).poly([[x, y - r - 1], [x + r * 0.6, y], [x - r * 0.6, y]]);
    else if (hanh === 'moc') k.poly([[x - r, y + r * 0.6], [x, y - r], [x + r, y - r * 0.4], [x, y + r * 0.6]]);
    else if (hanh === 'tho') k.rect(x - r * 0.7, y - r * 0.5, r * 1.4, r * 1.2);
    else k.poly([[x, y - r - 1], [x + 1, y - 1], [x + r + 1, y], [x + 1, y + 1], [x, y + r + 1], [x - 1, y + 1], [x - r - 1, y], [x - 1, y - 1]]);
    paint(g, k, rm);
    g.set(Math.round(x), Math.round(y), C('sang'));
  }

  // ---- nhân vật dáng NGƯỜI (khung 32×32, neo chân 15,30, quay phải)
  const SKIN = { nguoi: 'da', xuong: 'trang', da: 'sat', ma: 'troi', giay: 'cat', go: 'dat', dong: 'dong', cay: 'reu' };
  function veNguoi(o, p) {
    const g = new Grid(32, 32), M = () => new Mask(32, 32);
    const dy = p.dy || 0, dx = p.dx || 0, skin = SKIN[o.than] || 'da', ma = o.than === 'ma';
    const ao = o.ao === 'tran' ? skin : o.mauAo, Y = (v) => v + dy, X = (v) => v + dx;
    // cánh sau lưng
    if (o.canh === 'co') { const up = p.canh ? -3 : 0; paint(g, M().poly([[X(10), Y(15)], [X(1), Y(7 + up)], [X(3), Y(13 + up)], [X(2), Y(18)], [X(10), Y(19)]]), o.mauToc === 'den' ? 'dat' : o.mauToc); }
    // áo choàng
    if (o.choang !== 'khong') paint(g, M().poly([[X(10), Y(13)], [X(13), Y(13)], [X(12), Y(25)], [X(6), Y(26)], [X(7), Y(18)]]), o.choang);
    // tay sau
    paint(g, M().rect(X(9), Y(14), 2, 6), ao === skin ? skin : ao, 'dk');
    paint(g, M().rect(X(9), Y(20), 2, 1), skin, 'dk');
    // chân
    const lg = p.leg || 0, kneel = p.kneel ? 3 : 0;
    if (ma) paint(g, M().poly([[11, Y(21)], [20, Y(21)], [17, 27], [14, 29], [12, 26]]), o.mauAo);
    else {
      const legC = o.quan === 'kho' ? skin : o.mauQuan;
      const L1 = M().rect(12 - lg, 22 + kneel, 2, 7 - kneel), L2 = M().rect(16 + lg, 22 + kneel, 2, 7 - kneel);
      paint(g, L1, legC, 'dk'); paint(g, L2, legC);
      paint(g, M().rect(11 - lg, 28, 3, 2), o.than === 'nguoi' ? 'dat' : skin, 'dk'); paint(g, M().rect(16 + lg, 28, 4, 2), o.than === 'nguoi' ? 'dat' : skin);
      if (o.quan === 'kho') paint(g, M().rect(X(11), Y(20), 9, 4).px(X(14), Y(24)).px(X(15), Y(24)), o.mauQuan);
      if (o.quan === 'vay') paint(g, M().poly([[X(11), Y(20)], [X(20), Y(20)], [X(21), Y(26)], [X(10), Y(26)]]), o.mauQuan);
    }
    // thân
    const T = M().rect(X(11), Y(13), 9, 8).rect(X(10), Y(14), 11, 3);
    paint(g, T, ao);
    if (o.than === 'xuong') for (let r = 15; r <= 19; r += 2) for (let x = 12; x <= 18; x++) g.set(X(x), Y(r), C('khoi'));
    if (o.ao === 'giap') { for (let x = 11; x <= 19; x++) g.set(X(x), Y(16), rampOf(ao)[2]); for (let r = 13; r <= 19; r += 3) g.set(X(15), Y(r), rampOf(ao)[0]); }
    if (o.ao === 'giaolinh') { const tr = rampOf(o.mauAo === 'trang' ? 'cham' : 'trang'); for (let i = 0; i < 4; i++) { g.set(X(13 + i), Y(13 + i), tr[1]); g.set(X(18 - i), Y(13 + i), tr[2]); } }
    if (o.ao !== 'tran' && o.quan !== 'kho') paint(g, M().rect(X(11), Y(20), 9, 1), 'dong', 'base');
    // đầu
    const hy = p.kneel ? 3 : 0, H = M().ell(X(15.5), Y(8.5 + hy), 4, 4);
    paint(g, M().rect(X(14), Y(12 + hy), 3, 1), skin, 'dk');
    paint(g, H, skin);
    // tóc
    const toc = rampOf(o.mauToc), coToc = o.than === 'nguoi' || o.than === 'giay' || o.than === 'go';
    if (coToc && o.dau !== 'troc' && o.mu !== 'non' && o.mu !== 'trum') {
      const k = M().ell(X(15), Y(5.5 + hy), 4.5, 2).rect(X(11), Y(5 + hy), 3, 4 + (o.dau === 'dai' ? 9 : 0));
      if (o.dau === 'bui') k.ell(X(13.5), Y(2.5 + hy), 1.6, 1.4);
      if (o.dau === 'dung') for (const sx of [12, 14, 16, 18]) k.px(X(sx), Y(2 + hy)).px(X(sx), Y(3 + hy));
      paint(g, k.cut(M().rect(X(15), Y(7 + hy), 6, 6)), toc);
    }
    // mặt (quay phải): mắt nhỏ trắng + đen, lông mày; xương/ma: hốc mắt + đốm sáng theo hành
    const ey = Y(8 + hy), glow = rampOf((HANH[o.hanh] || HANH.thuy).ramp)[2];
    if (o.than === 'xuong' || o.than === 'ma' || o.than === 'dong' || o.than === 'cay') {
      g.set(X(16), ey, C('vien')); g.set(X(17), ey, p.mat === 'nham' ? C('vien') : glow); g.set(X(19), ey, p.mat === 'nham' ? C('vien') : glow);
      if (o.than === 'xuong') { g.set(X(17), Y(11 + hy), C('khoi')); g.set(X(19), Y(11 + hy), C('khoi')); }
    } else {
      if (p.mat === 'nham') { g.set(X(17), ey, C('toi')); g.set(X(18), ey, C('toi')); g.set(X(19), ey, C('toi')); }
      else { g.set(X(17), ey, C('trang')); g.set(X(18), ey, C('vien')); g.set(X(19), ey, C('vien')); }
      g.set(X(17), ey - 1, C('khoi')); g.set(X(18), ey - 1, C('khoi')); g.set(X(19), ey - 1, C('khoi'));
      g.set(X(18), Y(11 + hy), rampOf(skin)[0]); g.set(X(19), Y(11 + hy), rampOf(skin)[0]);
      g.set(X(13), Y(9 + hy), rampOf(skin)[0]);
    }
    // mũ / khăn
    const mm = o.mauMu, Hy = (v) => Y(v + hy);
    if (o.mu === 'khan') { paint(g, M().rect(X(11), Hy(4), 10, 2), mm); paint(g, M().rect(X(9), Hy(5), 2, 3), mm, 'dk'); }
    if (o.mu === 'non') paint(g, M().poly([[X(15.5), Hy(-0.5)], [X(23.5), Hy(5.5)], [X(7.5), Hy(5.5)]]), mm);
    if (o.mu === 'long') { const r = rampOf(mm); [[9, 2], [11, 1], [13, 1], [15, 1], [17, 1], [19, 2]].forEach(([fx, fy], i) => { const k = M().line(X(15), Hy(4), X(fx), Hy(fy), 1).line(X(15), Hy(4), X(fx + 1), Hy(fy), 1); paint(g, k, [r[i % 2 ? 0 : 1], r[i % 2 ? 0 : 1], r[i % 2 ? 1 : 2]], 'base'); }); paint(g, M().rect(X(11), Hy(4), 10, 2), 'dong'); }
    if (o.mu === 'mien') { paint(g, M().rect(X(11), Hy(4), 10, 2), mm); paint(g, M().poly([[X(11), Hy(4)], [X(12.5), Hy(0.6)], [X(14), Hy(4)]]).poly([[X(14), Hy(4)], [X(15.5), Hy(0)], [X(17), Hy(4)]]).poly([[X(17), Hy(4)], [X(18.5), Hy(0.6)], [X(20), Hy(4)]]), mm); }
    if (o.mu === 'mudong') paint(g, M().ell(X(15.5), Hy(5), 5, 3).cut(M().rect(0, Hy(6), 32, 26)), mm);
    if (o.mu === 'trum') paint(g, M().ell(X(15), Hy(7.5), 5.5, 5.5).cut(M().rect(X(16), Hy(7), 6, 5)), mm);
    if (o.mu === 'sung') { paint(g, M().line(X(13), Hy(4), X(11), Hy(0), 2), mm); paint(g, M().line(X(18), Hy(4), X(20), Hy(0), 2), mm); }
    // vũ khí + tay trước
    const arm = p.arm || 'ha';
    const hand = arm === 'len' ? [X(21), Y(10 + hy)] : arm === 'truoc' ? [X(24), Y(15 + hy)] : [X(21), Y(19 + hy)];
    const armM = arm === 'len' ? M().rect(X(19), Y(11 + hy), 2, 4).rect(X(20), Y(10 + hy), 2, 2) : arm === 'truoc' ? M().rect(X(19), Y(14 + hy), 5, 2) : M().rect(X(19), Y(14 + hy), 2, 5);
    if (o.vk !== 'khong' && p.vk !== false) stampWeapon(g, weaponGrid(o.vk, o.mauVk), hand[0], hand[1], o.vk === 'cung' ? 0 : p.goc || 0);
    paint(g, armM, ao === skin ? skin : ao);
    paint(g, M().rect(hand[0] - 1, hand[1] - 1, 2, 2), skin);
    if (o.vk === 'cung' && p.ten) for (let x = hand[0] - 4; x <= hand[0] + 3; x++) g.set(x, hand[1], C(x === hand[0] + 3 ? 'sat-sang' : 'dat-sang'));
    if (p.phep) burst(g, hand[0] + 1, Math.max(4, hand[1] - (o.vk === 'khong' || o.vk === 'cung' ? 3 : 9)), p.phep, o.hanh || 'kim');
    return g;
  }
  // ---- dáng THÚ 4 chân
  function veThu(o, p) {
    const g = new Grid(32, 32), M = () => new Mask(32, 32), dy = p.dy || 0, dx = p.dx || 0, lg = p.leg || 0;
    const fur = o.than === 'nguoi' ? o.mauToc === 'den' ? 'dat' : o.mauToc : SKIN[o.than];
    if (o.canh === 'co') { const up = p.canh ? -3 : 0; paint(g, M().poly([[13, 16 + dy], [4, 7 + up + dy], [6, 13 + dy], [5, 18 + dy], [14, 19 + dy]]), fur === 'dat' ? 'dong' : fur); }
    paint(g, M().line(7, 17 + dy, 3, 12 + dy + (p.duoi || 0), 2), fur, 'dk');                       // đuôi
    for (const [x, ph] of [[9, -lg], [13, lg], [19, -lg], [23, lg]]) paint(g, M().rect(x + ph, 22 + dy, 2, 7 - dy - (p.kneel ? 3 : 0)), fur, x === 13 || x === 23 ? 'auto' : 'dk');
    paint(g, M().ell(16 + dx, 19 + dy, 9, 4.6), fur);                                               // thân
    paint(g, M().ell(16 + dx, 22 + dy, 6, 1.2), o.mauAo === 'reu' ? 'cat' : o.mauAo, 'lt');           // bụng
    const hx = 25 + dx + (p.lao || 0), hy = 13 + dy;
    paint(g, M().ell(hx, hy, 4.5, 4).rect(hx + 2, hy, 4, 3), fur);                                   // đầu + mõm
    paint(g, M().poly([[hx - 3, hy - 3], [hx - 2, hy - 7], [hx, hy - 3]]), fur, 'dk');               // tai
    if (o.mu === 'sung' || o.mu === 'mien') paint(g, M().line(hx, hy - 3, hx - 2, hy - 8, 1).line(hx + 2, hy - 3, hx + 2, hy - 8, 1), o.mauMu);
    g.set(hx + 1, hy - 1, p.mat === 'nham' ? C('vien') : C('trang')); g.set(hx + 2, hy - 1, C('vien'));
    g.set(hx + 5, hy, C('vien'));
    if (p.ha) { g.set(hx + 3, hy + 3, C('trang')); g.set(hx + 5, hy + 3, C('trang')); for (let x = hx + 2; x <= hx + 6; x++) g.set(x, hy + 2, C('son-toi')); }
    if (o.choang !== 'khong') paint(g, M().rect(13 + dx, 15 + dy, 6, 3), o.choang);                  // yên / áo
    if (p.phep) burst(g, hx + 2, hy - 8, p.phep, o.hanh || 'kim');
    return g;
  }
  // ---- dáng RẮN / CÁ / RỒNG (thân lượn sóng)
  function veRan(o, p) {
    const g = new Grid(32, 32), M = () => new Mask(32, 32), ph = p.song || 0, dy = p.dy || 0;
    const vay = o.than === 'nguoi' ? o.mauAo : SKIN[o.than];
    const k = M();
    for (let x = 2; x <= 22; x++) { const yy = 24 + Math.sin((x + ph * 3) / 3.2) * 2.2 + dy; const t = 1.2 + (x - 2) / 20 * 2.4; k.ell(x, yy, 0.6, t); }
    paint(g, k, vay);
    for (let x = 4; x <= 21; x += 3) g.set(x, Math.round(24 + Math.sin((x + ph * 3) / 3.2) * 2.2 + dy) - 1, rampOf(vay)[2]);
    const hx = 24 + (p.lao || 0), hy = 15 + dy;
    paint(g, M().line(21, 22 + dy, hx - 1, hy + 2, 3), vay);                                         // cổ
    paint(g, M().ell(hx, hy, 3.5, 3).rect(hx + 1, hy, 5, 2), vay);                                   // đầu
    if (o.mu === 'sung' || o.mu === 'mien' || o.canh === 'co') paint(g, M().line(hx - 2, hy - 2, hx - 4, hy - 6, 1).line(hx, hy - 3, hx + 1, hy - 7, 1), o.mauMu);
    paint(g, M().poly([[hx - 4, hy - 1], [hx - 7, hy - 4], [hx - 3, hy - 3]]), o.mauToc === 'den' ? 'son' : o.mauToc, 'base');   // vây / bờm
    g.set(hx + 1, hy - 1, p.mat === 'nham' ? C('vien') : C('vang-sang')); g.set(hx + 2, hy - 1, C('vien'));
    if (p.ha) { g.set(hx + 4, hy + 2, C('trang')); for (let x = hx + 1; x <= hx + 5; x++) g.set(x, hy + 3, C('son-toi')); }
    if (p.phep) burst(g, hx + 3, hy - 8, p.phep, o.hanh || 'thuy');
    return g;
  }
  function ve(o, p) { return o.dang === 'thu' ? veThu(o, p) : o.dang === 'ran' ? veRan(o, p) : veNguoi(o, p); }
  // nằm (chết): xoay khung quỳ 90° rồi đặt sát đất, giữa khung
  function nam(g) {
    let r = rot90(g); const [bx, by, bw, bh] = bbox(r);
    return shift(r, Math.round((r.w - bw) / 2) - bx, r.h - 2 - (by + bh - 1));
  }
  const toi = (g) => swapC(g, Object.fromEntries(Object.entries(RAMP).flatMap(([, [a, b, c]]) => [[C(c), C(b)], [C(b), C(a)]])));
  const sang = (g) => swapC(g, Object.fromEntries(Object.values(RAMP).flatMap(([a, b, c]) => [[C(b), C(c)], [C(a), C(b)]])));
  const rage = (g) => swapC(g, { [C('trang')]: C('son-sang'), [C('vang-sang')]: C('lua-sang') });

  function sinhNhanVat(it) {
    const o = it.opt, g = it.g, boss = g === 'boss';
    const clip = (x) => { for (let y = 0; y < x.h; y++) for (let i = 0; i < x.w; i++) if (i === 0 || y === 0 || i === x.w - 1 || y === x.h - 1) x.set(i, y, 0); return x; };   // chừa mép 1px cho viền
    const fin = (fr) => { let x = clip(fr); if (boss) x = clip(scaleGrid(x, it.w / 32, it.w, it.h)); return outline(x); };
    const A = [];
    const add = (name, fps, loop, frames) => A.push({ name, fps, loop, frames: frames.map(fin) });
    const cast = (p) => ({ arm: o.vk === 'cung' ? 'truoc' : 'len', goc: 0, ...p });
    if (g === 'tuong') {
      add('idle', 3, true, [ve(o, {}), ve(o, { dy: 1, canh: 1 }), ve(o, { mat: 'nham' })]);
      const atk = o.dang !== 'nguoi' ? [ve(o, { lao: -1, dy: 1 }), ve(o, { lao: 1, ha: 1 }), ve(o, { lao: 3, ha: 1, dx: 1 }), ve(o, {})]
        : o.vk === 'cung' ? [ve(o, { arm: 'truoc' }), ve(o, { arm: 'truoc', ten: 1 }), ve(o, { arm: 'truoc', dx: -1 }), ve(o, {})]
          : [ve(o, { arm: 'len', goc: -45 }), ve(o, { arm: 'len', goc: 0 }), ve(o, { arm: 'truoc', goc: 90, dx: 1 }), ve(o, { goc: 135 })];
      add('attack', 10, false, atk);
      add('cast', 8, true, [ve(o, cast({ phep: 1 })), ve(o, cast({ phep: 2, canh: 1 })), ve(o, cast({ phep: 3, dy: 1 }))]);
      add('hurt', 8, false, [sang(shift(ve(o, { mat: 'nham' }), -1, 0))]);
      const quy = ve(o, { kneel: 1, mat: 'nham', dy: 3, goc: 120 });
      add('die', 5, false, [quy, nam(quy), toi(nam(quy))]);
    } else {
      const walk = [ve(o, { leg: 0, song: 0 }), ve(o, { leg: 1, dy: 1, song: 1, canh: 1, duoi: -1 }), ve(o, { leg: 0, song: 2 }), ve(o, { leg: -1, dy: 1, song: 3, canh: 1, duoi: 1 })];
      add('walk', 6, true, walk);
      const atk = o.dang === 'nguoi' ? [ve(o, { arm: 'len', goc: -45 }), ve(o, { arm: 'truoc', goc: 90, dx: 1 }), ve(o, { goc: 135 })]
        : [ve(o, { lao: -1 }), ve(o, { lao: 2, ha: 1 }), ve(o, { lao: 1, ha: 1 })];
      add('attack', 10, false, atk);
      add('hurt', 8, false, [sang(shift(ve(o, { mat: 'nham' }), -1, 0))]);
      const quy = ve(o, { kneel: 1, mat: 'nham', dy: o.dang === 'nguoi' ? 3 : 1, goc: 120 });
      add('die', 5, false, [quy, nam(quy), toi(nam(quy))]);
      if (boss && o.dien === 'co') add('rage', 8, true, [rage(walk[0]), rage(walk[1])]);
    }
    return A;
  }
  // ---- icon / đồ / kỹ năng
  function sinhIcon(it) {
    const o = it.opt, N = it.w, g = new Grid(N, it.h), M = () => new Mask(N, it.h), c = (N - 1) / 2, r = N / 2 - 1.5;
    if (o.khung === 'tron') { paint(g, M().ell(c, c, r, r), o.mauKhung); paint(g, M().ell(c, c, r - 1.5, r - 1.5), 'den', 'base'); for (let a = 0; a < 12; a++) { const t = a * Math.PI / 6; g.set(Math.round(c + Math.cos(t) * (r - 0.6)), Math.round(c + Math.sin(t) * (r - 0.6)), rampOf(o.mauKhung)[2]); } }
    if (o.khung === 'khien') paint(g, M().poly([[1, 1], [N - 1, 1], [N - 1, N * 0.55], [N / 2, N - 1], [1, N * 0.55]]), o.mauKhung);
    if (o.khung === 'vuong') { paint(g, M().rect(1, 1, N - 2, N - 2), o.mauKhung); paint(g, M().rect(3, 3, N - 6, N - 6), 'den', 'base'); }
    const s = o.khung === 'khong' ? N / 2 - 2 : o.khung === 'tron' ? r - 2.5 : N / 2 - 3.5, k = M(), x0 = c - s, x1 = c + s, y0 = c - s, y1 = c + s;
    switch (o.hinh) {
      case 'lua': k.poly([[c, y0], [x1, c + s * 0.3], [c + s * 0.5, y1], [c - s * 0.5, y1], [x0, c + s * 0.3], [c - s * 0.3, c - s * 0.2]]); break;
      case 'nuoc': k.ell(c, c + s * 0.35, s * 0.62, s * 0.62).poly([[c, y0], [c + s * 0.6, c + s * 0.3], [c - s * 0.6, c + s * 0.3]]); break;
      case 'la': k.poly([[x0, y1], [c - s * 0.4, c - s * 0.2], [x1, y0], [c + s * 0.2, c + s * 0.5]]); break;
      case 'nui': k.poly([[x0, y1], [c - s * 0.3, y0 + s * 0.5], [c, c], [c + s * 0.4, y0], [x1, y1]]); break;
      case 'kiem': k.line(x0 + 1, y1 - 1, x1, y0, 2).line(c - s * 0.6, c + s * 0.1, c - s * 0.1, c + s * 0.6, 1); break;
      case 'riu': veHinhThem(g, { ...o, hinh: 'riudong', mauPhu: o.mauPhu || 'dat' }, c, c, s); break;
      case 'khien': k.poly([[x0, y0], [x1, y0], [x1, c + s * 0.1], [c, y1], [x0, c + s * 0.1]]); break;
      case 'muiten': k.line(x0, y1, x1 - 1, y0 + 1, 1).poly([[x1, y0], [x1 - s * 0.8, y0 + 0.5], [x1 - 0.5, y0 + s * 0.8]]); break;
      case 'set': k.poly([[c + s * 0.3, y0], [x0 + 1, c + s * 0.15], [c, c + s * 0.15], [c - s * 0.3, y1], [x1 - 1, c - s * 0.15], [c, c - s * 0.15]]); break;
      case 'mattroi': k.ell(c, c, s * 0.5, s * 0.5); for (let a = 0; a < 8; a++) { const t = a * Math.PI / 4; k.line(c + Math.cos(t) * s * 0.6, c + Math.sin(t) * s * 0.6, c + Math.cos(t) * s, c + Math.sin(t) * s, 1); } break;
      case 'tim': k.ell(c - s * 0.42, c - s * 0.25, s * 0.48, s * 0.45).ell(c + s * 0.42, c - s * 0.25, s * 0.48, s * 0.45).poly([[x0 + 0.2, c - s * 0.1], [x1 - 0.2, c - s * 0.1], [c, y1]]); break;
      case 'xu': k.ell(c, c, s * 0.85, s * 0.85); break;
      case 'ngoc': k.poly([[c, y0], [x1, c - s * 0.2], [c, y1], [x0, c - s * 0.2]]); break;
      default: if (HINH_THEM[o.hinh]) { veHinhThem(g, o, c, c, s); break; }
        k.poly([[c, y0], [c + s * 0.25, c - s * 0.25], [x1, c], [c + s * 0.25, c + s * 0.25], [c, y1], [c - s * 0.25, c + s * 0.25], [x0, c], [c - s * 0.25, c - s * 0.25]]);
    }
    paint(g, k, o.mauHinh);
    if (o.hinh === 'xu') g.set(Math.round(c), Math.round(c), C('vien'));
    outline(g);
    return [{ name: 'main', fps: 1, loop: false, frames: [g] }];
  }
  // hình thêm (HINH_THEM): các lớp tô lần lượt theo dải H / P / N / tên dải
  function veHinhThem(g, o, c, cy, s) {
    const R = (r) => (r === 'H' ? o.mauHinh : r === 'P' ? (o.mauPhu || 'dat') : r === 'N' ? o.mauNgoc : r);
    HINH_THEM[o.hinh][2]((r, f, mode = 'auto') => {
      const ramp = R(r); if (!ramp || ramp === 'khong') return;
      const k = new Mask(g.w, g.h); f(k);
      paint(g, k, ramp === 'vien' ? [C('vien'), C('vien'), C('vien')] : ramp, mode);
    }, c, cy, s);
  }
  // ---- ô nền lát liền (nhiễu theo hạt ngẫu nhiên — mọi điểm độc lập nên tự liền mép)
  function sinhNen(it) {
    const o = it.opt, W = it.w, H = it.h, [dk, base, lt] = rampOf(o.mauNen);
    SEED = seedOf(it.k);
    const one = (ph) => {
      const g = new Grid(W, H);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) g.set(x, y, base);
      if (o.nen === 'gach') {
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const row = Math.floor(y / 4), off = row % 2 ? 4 : 0; if (y % 4 === 3 || (x + off) % 8 === 7) g.set(x, y, dk); else if (y % 4 === 0) g.set(x, y, lt); }
      } else if (o.nen === 'nuoc') {
        for (let y = 0; y < H; y += 4) for (let i = 0; i < 3; i++) { const x = (Math.floor(rnd() * W) + ph * 2) % W; g.set(x, y + (i % 2), lt); g.set((x + 1) % W, y + (i % 2), lt); }
        for (let i = 0; i < W; i++) { const x = Math.floor(rnd() * W), y = Math.floor(rnd() * H); g.set(x, y, dk); }
      } else if (o.nen !== 'tron') {
        const n = o.nen === 'co' ? 0.22 : o.nen === 'da' ? 0.12 : 0.16;
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const v = rnd(); if (v < n) g.set(x, y, dk); else if (v > 1 - n) g.set(x, y, lt); }
        if (o.nen === 'co') for (let i = 0; i < W / 3; i++) { const x = Math.floor(rnd() * W), y = Math.floor(rnd() * H); g.set(x, y, lt); g.set(x, (y + 1) % H, dk); }
        if (o.nen === 'da') for (let i = 0; i < 3; i++) { const x = Math.floor(rnd() * W), y = Math.floor(rnd() * H); for (let j = 0; j < 3; j++) { g.set((x + j) % W, y, lt); g.set((x + j) % W, (y + 1) % H, dk); } }
      }
      return g;
    };
    if (o.nen === 'nuoc') { const s = SEED; const fr = [0, 1, 2].map((ph) => { SEED = s; return one(ph); }); return [{ name: 'main', fps: 3, loop: true, frames: fr }]; }
    return [{ name: 'main', fps: 1, loop: false, frames: [one(0)] }];
  }
  // ---- giao diện (claude/xuat-goi-pixel): khung / nút / thanh / ô / thẻ / huy hiệu / dải / núi bậc — vẽ theo cỡ bất kỳ, chừa 1 điểm viền đen
  function sinhUI(it) {
    const o = it.opt, W = it.w, H = it.h, g = new Grid(W, H), M = () => new Mask(W, H);
    let rk = o.mauKhung, rn = o.mauNen;
    if (o.trang === 'khoa') { rk = 'dat'; rn = rn === 'den' ? 'den' : 'sat'; }
    const nhan = o.trang === 'nhan', dy = nhan ? 1 : 0;
    const rr = (k, x, y, w, h, r) => { k.rect(x, y, w, h); for (let i = 0; i < r; i++) for (let j = 0; j < r - i; j++) { k.d[(y + i) * W + x + j] = 0; k.d[(y + i) * W + x + w - 1 - j] = 0; k.d[(y + h - 1 - i) * W + x + j] = 0; k.d[(y + h - 1 - i) * W + x + w - 1 - j] = 0; } return k; };
    const [kd, kb, kl] = rampOf(rk);
    const deco = (x0, y0, x1, y1) => {   // hoa văn trên dải viền (x0..x1 × y0..y1 là mép ngoài của viền)
      if (o.vien === 'rang') for (let x = x0 + 2; x <= x1 - 2; x += 2) { g.set(x, y0, 0); g.set(x, y1, 0); }
      if (o.vien === 'cham') for (let x = x0 + 3; x <= x1 - 3; x += 3) { g.set(x, y0 + 1, kl); g.set(x, y1 - 1, kl); }
      if (o.vien === 'dut') for (let x = x0; x <= x1; x++) if (x % 4 === 3) { g.set(x, y0, 0); g.set(x, y1, 0); }
      if (o.vien === 'dut') for (let y = y0; y <= y1; y++) if (y % 4 === 3) { g.set(x0, y, 0); g.set(x1, y, 0); }
      if (o.vien === 'sao' || o.trang === 'chon') for (const x of [x0 + 2, x1 - 2]) { const y = Math.round((y0 + y1) / 2); g.set(x, y, C('sang')); g.set(x - 1, y, kl); g.set(x + 1, y, kl); if (y1 - y0 > 6) { g.set(x, y - 1, kl); g.set(x, y + 1, kl); } }
    };
    const b = Math.min(W, H) >= 24 ? 3 : Math.min(W, H) >= 10 ? 2 : 1;
    switch (o.loai) {
      case 'nut': {
        const r = H >= 12 ? 2 : 1;
        paint(g, rr(M(), 1, 1 + dy, W - 2, H - 2 - (nhan ? 1 : 0), r), nhan ? [kd, kd, kb] : rk);
        paint(g, rr(M(), 2, 2 + dy, W - 4, H - 4 - (nhan ? 1 : 0), Math.max(0, r - 1)), nhan ? [kd, kd, kd] : [kb, kb, kb], 'base');
        if (!nhan) for (let x = 3; x < W - 3; x++) g.set(x, 2, kl);
        deco(1, 1 + dy, W - 2, H - 2);
        break;
      }
      case 'nuttron': {
        const c = (W - 1) / 2, cy = (H - 1) / 2 + dy * 0.5, r = Math.min(W, H) / 2 - 1.5;
        paint(g, M().ell(c, cy, r, r), nhan ? [kd, kd, kb] : rk);
        paint(g, M().ell(c, cy, r - 1.5, r - 1.5), rn === 'den' ? [kd, kd, kd] : rn, 'base');
        if (o.vien === 'cham' || o.vien === 'rang') for (let a = 0; a < 12; a++) { const t = a * Math.PI / 6; g.set(Math.round(c + Math.cos(t) * (r - 0.6)), Math.round(cy + Math.sin(t) * (r - 0.6)), kl); }
        break;
      }
      case 'thanh': {
        const t = H <= 6 ? 1 : 2, x0 = H <= 6 ? 1 : 2;
        paint(g, M().rect(x0, 1, W - 2 * x0, H - 2).cut(M().rect(x0 + t, 1 + t, W - 2 * x0 - 2 * t, H - 2 - 2 * t)), rk);
        if (o.vien === 'sao') for (const x of [0, W - 1]) for (let y = 1; y < H - 1; y++) g.set(x, y, kl);
        if (o.vien === 'rang') for (const x of [0, W - 1]) { g.set(x, 0, kb); g.set(x, H - 1, kb); }
        if (H > 6) deco(x0, 1, W - 1 - x0, H - 2);
        break;
      }
      case 'o': {
        paint(g, M().rect(1, 1, W - 2, H - 2), rk);
        paint(g, M().rect(1 + Math.max(1, b - 1), 1 + Math.max(1, b - 1), W - 2 - 2 * Math.max(1, b - 1), H - 2 - 2 * Math.max(1, b - 1)), rn, 'base');
        if (o.vien === 'dut') deco(1, 1, W - 2, H - 2);
        if (o.vien === 'sao') for (const [x, y] of [[2, 2], [W - 3, 2], [2, H - 3], [W - 3, H - 3]]) g.set(x, y, C('sang'));
        break;
      }
      case 'the': {
        paint(g, rr(M(), 1, 1, W - 2, H - 2, 2).cut(M().rect(1 + b, 1 + b, W - 2 - 2 * b, H - 2 - 2 * b - (H >= 40 ? 6 : 0))), rk);
        if (o.trang === 'khoa') for (let i = 0; i < 4; i++) g.set(3 + i, H - 3 - i * 2, kd);
        deco(1, 1, W - 2, H - 2);
        break;
      }
      case 'huy': {
        const c = (W - 1) / 2, r = Math.min(W, H) / 2 - 1.5;
        paint(g, M().ell(c, c, r, r), rk);
        paint(g, M().ell(c, c, r - 2, r - 2), rn, 'base');
        for (let a = 0; a < 12; a++) { const t = a * Math.PI / 6; g.set(Math.round(c + Math.cos(t) * (r - 0.8)), Math.round(c + Math.sin(t) * (r - 0.8)), a % 2 ? kl : C('sang')); }
        if (o.trang === 'khoa') { g.set(Math.round(c) - 2, Math.round(c) - 3, kd); g.set(Math.round(c) - 1, Math.round(c) - 2, kd); g.set(Math.round(c), Math.round(c) - 1, kd); g.set(Math.round(c), Math.round(c), kd); g.set(Math.round(c) + 1, Math.round(c) + 1, kd); }
        break;
      }
      case 'dai': {
        const n = Math.min(8, Math.floor(H / 2));
        paint(g, M().poly([[1, 2], [W - 1, 2], [W - 1 - n, H / 2], [W - 1, H - 2], [1, H - 2], [1 + n, H / 2]]), rn);
        paint(g, M().rect(n + 2, 2, W - 2 * n - 4, 2).rect(n + 2, H - 4, W - 2 * n - 4, 2), rk, 'base');
        deco(n + 2, 2, W - n - 3, H - 3);
        break;
      }
      case 'nui': {
        const lv = Math.max(1, Math.min(5, +(it.code.match(/(\d)$/) || [0, 3])[1])), hh = H * (0.3 + 0.12 * lv), c = W / 2;
        paint(g, M().poly([[1, H - 2], [c - W * 0.12, H - 2 - hh], [c + W * 0.05, H - 2 - hh * 0.92], [c + W * 0.15, H - 2 - hh * 0.75], [W - 2, H - 2]]), rn);
        if (lv >= 3) paint(g, M().poly([[c - W * 0.2, H - 2 - hh * 0.8], [c - W * 0.12, H - 2 - hh], [c + W * 0.05, H - 2 - hh * 0.92], [c + W * 0.08, H - 2 - hh * 0.8]]), 'trang', 'base');
        paint(g, M().rect(1, H - 4, W - 2, 2), rk);
        break;
      }
      default: {   // khung bảng
        paint(g, rr(M(), 1, 1, W - 2, H - 2, 2), rk);
        paint(g, M().rect(1 + b, 1 + b, W - 2 - 2 * b, H - 2 - 2 * b), rn, 'base');
        deco(1, 1, W - 2, H - 2);
        for (const [x, y] of [[1 + b, 1 + b], [W - 2 - b, 1 + b], [1 + b, H - 2 - b], [W - 2 - b, H - 2 - b]]) g.set(x, y, kl);
      }
    }
    if (o.trang === 'chon') { const k = M(); for (let i = 0; i < g.d.length; i++) if (g.d[i]) k.d[i] = 1; outline(g, kl); }
    outline(g);
    return [{ name: 'main', fps: 1, loop: false, frames: [g] }];
  }
  // ---- cảnh 160×90 / 320×180 (claude/xuat-goi-pixel): trời dải 3 tông + núi xa + đất / nước + vật theo chủ đề — phác thảo nền
  function sinhCanh(it) {
    const o = it.opt, W = it.w, H = it.h, g = new Grid(W, H), M = () => new Mask(W, H), k = W / 320;
    SEED = seedOf(it.k);
    const troi = o.gio === 'dem' ? ['cham-toi', 'cham', 'tim'] : o.gio === 'chieu' ? ['son', 'lua', 'lua-sang'] : o.gio === 'u' ? ['khoi', 'sat-toi', 'sat'] : RAMP[o.mauTroi] || RAMP.troi;
    const sky = (o.gio === 'ngay' ? [RAMP.troi[0], RAMP.troi[1], RAMP.troi[2]] : troi).map(C);
    const hz = Math.round(H * (o.canh === 'bien' ? 0.45 : o.canh === 'dong' ? 0.42 : 0.55));
    // trời: 3 dải, ranh giới hoà bằng chấm bàn cờ
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const t = y / hz, b0 = t < 0.4 ? 0 : t < 0.75 ? 1 : 2, edge = (t > 0.36 && t < 0.4) || (t > 0.71 && t < 0.75);
      g.set(x, y, sky[edge && (x + y) % 2 ? Math.min(2, b0 + 1) : b0]);
    }
    if (o.canh === 'hang') for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) g.set(x, y, C(y < H * 0.3 ? 'vien' : y < H * 0.6 ? 'khoi' : 'toi'));
    // mặt trời / trăng / sao
    const sx = Math.round(W * 0.78), sy = Math.round(hz * (o.gio === 'chieu' ? 0.8 : 0.35)), sr = Math.max(4, H * 0.07);
    if (o.canh !== 'hang' && o.gio !== 'u') {
      if (o.gio === 'dem') { paint(g, M().ell(sx, sy, sr, sr), 'trang'); for (let i = 0; i < 40 * k * k + 10; i++) g.set(Math.floor(rnd() * W), Math.floor(rnd() * hz * 0.8), C('sang')); }
      else {
        paint(g, M().ell(sx, sy, sr * (o.gio === 'chieu' ? 1.6 : 1), sr * (o.gio === 'chieu' ? 1.6 : 1)), o.gio === 'chieu' ? 'lua' : 'vang', 'base');
        if (o.canh === 'menu') for (let a = 0; a < 16; a++) { const t = a * Math.PI / 8; for (let r = sr * 1.4; r < sr * 2.2; r++) g.set(Math.round(sx + Math.cos(t) * r), Math.round(sy + Math.sin(t) * r), C('vang-sang')); }
      }
      if (o.gio === 'ngay') for (let i = 0; i < 3; i++) { const cx = W * (0.12 + i * 0.25 + rnd() * 0.08), cy = hz * (0.15 + rnd() * 0.3); paint(g, M().ell(cx, cy, 14 * k + 3, 3 * k + 2).ell(cx + 6 * k, cy - 3 * k, 8 * k + 2, 3 * k + 2), 'trang', 'base'); }
    }
    // núi: dải xa (nhạt) rồi dải gần (màu đất)
    const ridge = (base, amp, f, ph) => { const a = []; for (let x = 0; x < W; x++) a.push(base - amp * (0.55 * Math.sin(x / W * f * 6.28 + ph) + 0.3 * Math.sin(x / W * f * 13 + ph * 2) + 0.15 * Math.sin(x / W * f * 29 + ph * 3))); return a; };
    const fill = (r, ramp, mode = 'base', y1 = H) => { const m = M(); for (let x = 0; x < W; x++) for (let y = Math.max(0, Math.round(r[x])); y < y1; y++) m.px(x, y); paint(g, m, Array.isArray(ramp) ? ramp.map((v) => (typeof v === 'string' ? C(v) : v)) : ramp, mode); };
    const p1 = rnd() * 6, p2 = rnd() * 6;
    if (o.canh !== 'hang') {
      fill(ridge(hz - H * 0.05, H * (o.canh === 'nui' || o.canh === 'menu' ? 0.22 : 0.1), 1.2, p1), o.gio === 'dem' ? ['cham-toi', 'cham-toi', 'cham'] : ['cham', 'cham-sang', 'cham-sang'], 'base');
      fill(ridge(hz, H * (o.canh === 'nui' ? 0.16 : 0.06), 2, p2), o.gio === 'dem' ? ['la-toi', 'la-toi', 'la-toi'] : [C('reu-toi'), C('reu'), C('reu')], 'base');
    }
    const dat = o.canh === 'bien' ? 'cat' : o.canh === 'hang' ? 'da' : o.canh === 'thanh' ? 'reu' : o.canh === 'dam' ? 'reu' : o.mauDat;
    const datR = dat === 'da' ? ['toi', 'khoi', 'sat-toi'].map(C) : dat;
    // đất
    const gy = Math.round(hz + H * 0.04);
    { const m = M().rect(0, gy, W, H - gy); paint(g, m, datR, 'base'); const [dk, , lt] = (Array.isArray(datR) ? datR : rampOf(datR)); for (let i = 0; i < W * (H - gy) * 0.06; i++) { const x = Math.floor(rnd() * W), y = gy + Math.floor(rnd() * (H - gy)); g.set(x, y, rnd() < 0.5 ? dk : lt); } }
    const nuoc = (y0, y1) => { const m = M(); for (let x = 0; x < W; x++) { const w = Math.round(Math.sin(x / 9 + p1) * 1.5); for (let y = y0 + w; y < y1 - w; y++) m.px(x, y); } paint(g, m, 'nuoc', 'base'); for (let i = 0; i < W * (y1 - y0) * 0.03; i++) { const x = Math.floor(rnd() * (W - 4)), y = y0 + 2 + Math.floor(rnd() * Math.max(1, y1 - y0 - 4)); g.set(x, y, C('nuoc-sang')); g.set(x + 1, y, C('nuoc-sang')); g.set(x + 2, y, C('troi')); } };
    const cay = (x, y, r) => { paint(g, M().rect(x - 1, y, 3, r * 1.2), 'dat'); paint(g, M().ell(x, y - r * 0.4, r, r * 0.9).ell(x - r * 0.6, y, r * 0.6, r * 0.5).ell(x + r * 0.6, y, r * 0.6, r * 0.5), o.gio === 'dem' ? 'la' : 'la'); };
    switch (o.canh) {
      case 'song': case 'menu': nuoc(Math.round(H * 0.72), Math.round(H * 0.86)); break;
      case 'bien': nuoc(hz, Math.round(H * 0.78)); break;
      case 'dam': for (let i = 0; i < 5; i++) { const cx = W * (0.1 + i * 0.2 + rnd() * 0.05), cy = H * (0.72 + rnd() * 0.15); paint(g, M().ell(cx, cy, 22 * k + 4, 5 * k + 2), 'nuoc', 'base'); } for (let i = 0; i < 40 * k + 8; i++) { const x = Math.floor(rnd() * W), y = gy + 4 + Math.floor(rnd() * (H - gy - 6)); for (let j = 0; j < 5 * k + 3; j++) g.set(x + (j % 3 === 2 ? 1 : 0), y - j, C('la-ma')); } break;
      case 'rung': for (let i = 0; i < 26 * k + 6; i++) cay(Math.floor(rnd() * W), Math.round(gy + rnd() * (H - gy) * 0.7), 6 * k + 3 + rnd() * 6 * k); break;
      case 'dong': for (let y = gy + 2; y < H; y += Math.max(2, Math.round((y - gy) / 8) + 2)) for (let x = 0; x < W; x++) if ((x + y) % 3) g.set(x, y, C('la-ma')); break;
      case 'thanh': { const wy = gy - Math.round(H * 0.12); paint(g, M().rect(0, wy, W, Math.round(H * 0.14)), 'dat'); for (let x = 0; x < W; x += Math.round(10 * k + 3)) paint(g, M().rect(x, wy - Math.round(4 * k + 2), Math.round(5 * k + 2), Math.round(4 * k + 2)), 'dat'); paint(g, M().ell(W / 2, gy + 1, 10 * k + 3, 12 * k + 3).cut(M().rect(0, gy + 2, W, H)), 'den', 'base'); break; }
      case 'hang': for (let i = 0; i < 18 * k + 5; i++) { const x = rnd() * W, h = H * (0.08 + rnd() * 0.18); paint(g, M().poly([[x - 4 * k - 2, 0], [x + 4 * k + 2, 0], [x, h]]), ['toi', 'khoi', 'sat-toi'].map(C)); } for (let i = 0; i < 10 * k + 3; i++) { const x = rnd() * W, y = H * (0.75 + rnd() * 0.2); paint(g, M().poly([[x, y - 6 * k - 3], [x + 2 * k + 1, y], [x - 2 * k - 1, y]]), 'ngoc'); } break;
      case 'nui': for (let i = 0; i < 8 * k + 3; i++) cay(Math.floor(rnd() * W), Math.round(gy + 4 + rnd() * (H - gy) * 0.6), 4 * k + 2); break;
      default: break;
    }
    return [{ name: 'main', fps: 1, loop: false, frames: [g] }];
  }
  // ---- bản đồ 320×148 (claude/xuat-goi-pixel): nền sân đấu 1280×590 theo từng bản đồ của game
  //   spec: "duong" (chuỗi path SVG hoặc mảng — nhiều nhánh), "o_dat" [[x, y]…] ô đặt tướng, toạ độ thiết kế 932×430
  //   (tools/build-ban-do-spec.js đọc js/data.js). Ô SÁT đường (ô đặt tướng) cùng một kiểu bệ đá viền đậm; vùng xa đường
  //   chỉ là nền trang trí theo chủ đề (cỏ / đá / cây / nước…), không viền ô. Đường cắt nhau → cầu tre.
  function duongSvg(d, steps = 26) {   // M L H V C S Q T Z (hoa / thường) → điểm
    const tok = String(d).match(/[MLHVCSQTZmlhvcsqtz]|-?\d*\.?\d+(?:e-?\d+)?/g) || [];
    const pts = []; let i = 0, cx = 0, cy = 0, sx = 0, sy = 0, lc = null, lq = null, cmd = '';
    const num = () => parseFloat(tok[i++]);
    const cub = (x1, y1, x2, y2, x, y) => { for (let k = 1; k <= steps; k++) { const t = k / steps, u = 1 - t; pts.push([u * u * u * cx + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x, u * u * u * cy + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y]); } lc = [x2, y2]; lq = null; cx = x; cy = y; };
    const qua = (x1, y1, x, y) => { for (let k = 1; k <= steps; k++) { const t = k / steps, u = 1 - t; pts.push([u * u * cx + 2 * u * t * x1 + t * t * x, u * u * cy + 2 * u * t * y1 + t * t * y]); } lq = [x1, y1]; lc = null; cx = x; cy = y; };
    const lin = (x, y) => { pts.push([x, y]); cx = x; cy = y; lc = lq = null; };
    while (i < tok.length) {
      if (/[a-z]/i.test(tok[i])) cmd = tok[i++];
      const r = cmd === cmd.toLowerCase(), ox = r ? cx : 0, oy = r ? cy : 0, C0 = cmd.toUpperCase();
      if (C0 === 'M') { cx = num() + ox; cy = num() + oy; sx = cx; sy = cy; pts.push([cx, cy]); lc = lq = null; cmd = r ? 'l' : 'L'; }
      else if (C0 === 'L') lin(num() + ox, num() + oy);
      else if (C0 === 'H') lin(num() + ox, cy);
      else if (C0 === 'V') lin(cx, num() + oy);
      else if (C0 === 'C') cub(num() + ox, num() + oy, num() + ox, num() + oy, num() + ox, num() + oy);
      else if (C0 === 'S') { const [x1, y1] = lc ? [2 * cx - lc[0], 2 * cy - lc[1]] : [cx, cy]; cub(x1, y1, num() + ox, num() + oy, num() + ox, num() + oy); }
      else if (C0 === 'Q') qua(num() + ox, num() + oy, num() + ox, num() + oy);
      else if (C0 === 'T') { const [x1, y1] = lq ? [2 * cx - lq[0], 2 * cy - lq[1]] : [cx, cy]; qua(x1, y1, num() + ox, num() + oy); }
      else if (C0 === 'Z') { lin(sx, sy); }
      else i++;
    }
    return pts;
  }
  const BD_DAT = { song: 'la', dam: 'reu', rung: 'la', hang: 'den', dong: 'lama', bien: 'cat', thanh: 'reu' };
  const BD_VAT = { song: ['cay', 'cay', 'da', 'lau', 'nha'], dam: ['lau', 'lau', 'hoa', 'cay', 'da'], rung: ['cay', 'cay', 'cay', 'bui', 'da'], hang: ['da', 'da', 'tinhthe', 'xuong', 'mangda'],
    dong: ['ruong', 'ruong', 'cay', 'thu', 'lau'], bien: ['dua', 'so', 'da', 'thuyen', 'bui'], thanh: ['cay', 'da', 'bui', 'co', 'cot'] };
  const BD_MAU = { cay: ['la', 'dat'], da: ['sat', 'dat'], lau: ['lama', 'cat'], nha: ['cat', 'dat'], hoa: ['hong', 'la'], bui: ['la', 'dat'], tinhthe: ['troi', 'dat'], xuong: ['trang', 'dat'],
    mangda: ['dat', 'dat'], ruong: ['lama', 'reu'], thu: ['sat', 'trang'], dua: ['la', 'dat'], so: ['hong', 'dat'], thuyen: ['trang', 'dat'], co: ['son', 'dat'], cot: ['sat', 'son'] };
  function sinhBanDo(it) {
    const o = it.opt, W = it.w, H = it.h, g = new Grid(W, H), k = W / 932;   // toạ độ thiết kế → điểm ảnh
    SEED = seedOf(it.k);
    const paths = (Array.isArray(o.duong) ? o.duong : o.duong ? [o.duong] : []).map((d) => duongSvg(d).map(([x, y]) => [x * k, y * k]));
    const slots = (o.o_dat || []).map(([x, y]) => [x * k, y * k]);
    const segs = []; paths.forEach((p, pi) => { for (let i = 1; i < p.length; i++) segs.push({ pi, i, a: p[i - 1], b: p[i] }); });
    const dSeg = (x, y, s) => { const [ax, ay] = s.a, dx = s.b[0] - ax, dy = s.b[1] - ay, t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1))); return Math.hypot(ax + dx * t - x, ay + dy * t - y); };
    const dist = new Float32Array(W * H).fill(1e9);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let m = 1e9; for (const s of segs) { const v = dSeg(x + 0.5, y + 0.5, s); if (v < m) m = v; } dist[y * W + x] = m; }
    const theme = o.chu_de || 'song', loai = o.duong_loai || (theme === 'hang' ? 'da' : theme === 'thanh' ? 'gach' : theme === 'bien' ? 'cat' : theme === 'dong' ? 'de' : theme === 'rung' ? 'dat' : 'nuoc');
    const rongD = (loai === 'cat' ? 46 : loai === 'nuoc' ? 44 : 42) * k / 2, vienD = rongD + 2;
    // 1. nền: một màu chủ đề + hạt sáng / tối rải ngẫu nhiên + khóm cỏ — KHÔNG kẻ ô
    const [gd, gb, gl] = rampOf(BD_DAT[theme] || 'la');
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const v = rnd(); g.set(x, y, v < 0.07 ? gd : v > 0.95 ? gl : gb); }
    for (let i = 0; i < W * H / 60; i++) { const x = Math.floor(rnd() * W), y = Math.floor(rnd() * H); g.set(x, y, gl); g.set(x, y + 1, gd); }
    if (theme === 'dam') for (let i = 0; i < 7; i++) { const x = rnd() * W, y = rnd() * H, m = new Mask(W, H).ell(x, y, 6 + rnd() * 6, 3 + rnd() * 2); let ok = true; for (let j = 0; j < m.d.length; j++) if (m.d[j] && dist[j] < vienD + 10) ok = false; if (ok) paint(g, m, 'nuoc', 'base'); }
    // 2. vật trang trí ở vùng xa đường (cách đường > dải ô đặt, không đè ô đặt)
    const xa = 98 * k + 4, vats = BD_VAT[theme] || BD_VAT.song;
    for (let gy = 6; gy < H - 4; gy += 13) for (let gx = 4 + (gy % 2) * 6; gx < W - 4; gx += 15) {
      const x = Math.round(gx + (rnd() - 0.5) * 8), y = Math.round(gy + (rnd() - 0.5) * 6);
      if (x < 0 || y < 0 || x >= W || y >= H || dist[y * W + x] < xa || slots.some(([sx, sy]) => Math.hypot(sx - x, sy - y) < 12) || rnd() < 0.45) continue;
      const h = vats[Math.floor(rnd() * vats.length)], N = h === 'nha' || h === 'cay' || h === 'dua' ? 14 : 10, t = new Grid(N, N), [mh, mp] = BD_MAU[h] || ['la', 'dat'];
      veHinhThem(t, { hinh: h, mauHinh: mh, mauPhu: mp, mauNgoc: 'khong' }, (N - 1) / 2, (N - 1) / 2, N / 2 - 1.5); outline(t);
      blit(g, t, x - Math.floor(N / 2), y - N + 2);
    }
    // 3. đường: viền tối + lòng đường theo loại (nước gợn sáng, đất / đá / cát có hạt, gạch xếp hàng)
    const RD = { nuoc: 'nuoc', dat: 'dat', da: 'sat', de: 'cat', cat: ['dat', 'dat-sang', 'cat'].map(C), gach: 'dat' }[loai] || 'dat', [rd, rb, rl] = Array.isArray(RD) ? RD : rampOf(RD);
    const vien = C(loai === 'nuoc' ? 'cham-toi' : 'dat-toi'), bo = C(loai === 'nuoc' ? 'dat-sang' : 'toi');
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const d = dist[y * W + x];
      if (d < rongD) { let c = rb; const v = rnd(); if (loai === 'nuoc') { if ((x + Math.floor(y / 3) * 5) % 11 === 0 && v < 0.7) c = rl; else if (d > rongD - 1.2) c = rd; } else if (loai === 'gach') { if (y % 4 === 3 || (x + (Math.floor(y / 4) % 2) * 4) % 8 === 7) c = rd; else if (y % 4 === 0) c = rl; } else if (v < 0.1) c = rd; else if (v > 0.92) c = rl; g.set(x, y, c); }
      else if (d < vienD - 0.8) g.set(x, y, vien);
      else if (d < vienD + 0.4 && loai === 'nuoc') g.set(x, y, bo);
    }
    // 4. cầu tre chỗ hai đoạn đường cắt nhau (khác nhánh, hoặc cùng nhánh nhưng xa nhau trên đường)
    const cat = (p, q) => { const d1 = [p.b[0] - p.a[0], p.b[1] - p.a[1]], d2 = [q.b[0] - q.a[0], q.b[1] - q.a[1]], den = d1[0] * d2[1] - d1[1] * d2[0]; if (Math.abs(den) < 1e-9) return null; const t = ((q.a[0] - p.a[0]) * d2[1] - (q.a[1] - p.a[1]) * d2[0]) / den, u = ((q.a[0] - p.a[0]) * d1[1] - (q.a[1] - p.a[1]) * d1[0]) / den; return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? [p.a[0] + d1[0] * t, p.a[1] + d1[1] * t, d2] : null; };
    const cau = [];
    for (let a = 0; a < segs.length; a++) for (let b = a + 1; b < segs.length; b++) { if (segs[a].pi === segs[b].pi && Math.abs(segs[a].i - segs[b].i) < 6) continue; const r = cat(segs[a], segs[b]); if (r && cau.every(([x, y]) => Math.hypot(x - r[0], y - r[1]) > 8)) cau.push(r); }
    for (const [cx, cy, dir] of cau) {
      const L = Math.hypot(dir[0], dir[1]) || 1, ux = dir[0] / L, uy = dir[1] / L, nx = -uy, ny = ux, half = rongD + 3;
      for (let t = -half; t <= half; t += 0.5) for (let s = -rongD + 1; s <= rongD - 1; s += 0.5) { const x = Math.round(cx + ux * t + nx * s), y = Math.round(cy + uy * t + ny * s); g.set(x, y, Math.round(t * 2) % 4 === 0 ? C('dat-toi') : Math.abs(s) > rongD - 2 ? C('dong') : C('cat')); }
    }
    // 5. ô đặt tướng: CÙNG MỘT kiểu bệ đá elip viền đậm, mặt sáng — nhận ra ngay chỗ đặt được
    for (const [sx, sy] of slots) {
      const m = new Mask(W, H).ell(sx, sy + 1, 7, 4.2), m2 = new Mask(W, H).ell(sx, sy, 6, 3.4);
      for (let j = 0; j < m.d.length; j++) if (m.d[j]) g.d[j] = C('vien');
      paint(g, m2, ['trang-xam', 'trang', 'sang'].map(C));
      paint(g, new Mask(W, H).ell(sx, sy + 0.5, 3.6, 1.6), ['trang-xam', 'trang-xam', 'trang-xam'].map(C), 'base');
    }
    return [{ name: 'main', fps: 1, loop: false, frames: [g] }];
  }
  function sinh(it) {
    // mẫu vẽ tay trong thư viện (tools/pixel/thu-vien.js): dựng từ công thức khung + thay bộ phận + đổi màu
    if (it.opt && it.opt.mau && TV[it.opt.mau]) return dungMau(it.opt.mau, { thay: it.opt.thay, doiMau: it.opt.doiMau }).anims;
    SEED = seedOf(it.k);
    if (NHAN_VAT(it.g)) return sinhNhanVat(it);
    if (it.g === 'nen') return it.opt.nen === 'vat' ? sinhIcon({ ...it, opt: { ...it.opt, khung: 'khong' } }) : sinhNen(it);
    if (optSet(it.g) === OPT_ICON) return sinhIcon(it);
    if (it.g === 'giao-dien') return sinhUI(it);
    if (it.g === 'canh') return sinhCanh(it);
    if (it.g === 'ban-do') return sinhBanDo(it);
    return [{ name: 'main', fps: 1, loop: false, frames: [new Grid(it.w, it.h)] }];
  }

  // ═════════════ mã (item) ═════════════
  const coMacDinh = (g, co) => { const s = DS.sizes[g]; if (co && (!s || s.includes(co))) return co; return s ? s[0] : co || '32x32'; };
  function taoItem(k, ten, mo, co, hanh, o = {}) {
    const [g, code] = k.split('/');
    const [w, h] = coMacDinh(g, co).split('x').map(Number);
    const it = { k, g, code, ten: ten || code, mo: mo || '', w, h, ax: NHAN_VAT(g) ? Math.floor(w / 2) - 1 : Math.floor(w / 2), ay: NHAN_VAT(g) ? h - 2 : h - 1, opt: defOpts(g, code), anims: [] };
    if (hanh) it.mo = (it.mo ? it.mo + ' · ' : '') + 'hành ' + hanh;
    it.opt = hieuMoTa((NHAN_VAT(g) ? '' : it.ten + ' · ') + it.mo, g, { ...it.opt, __ten: it.ten }).o;
    if (g === 'boss') it.opt.dien = 'co';
    // mã đã có bản vẽ tay trong thư viện → mặc định dựng từ bản đó (giữ đúng tạo hình, chỉnh / thay bộ phận tiếp)
    const tv = TV && TV[k] && TV[k].src.match(/^size:\s*(\d+)x(\d+)/m);
    if (tv && +tv[1] === w && +tv[2] === h && !o.khongMau) { it.opt = { mau: k, thay: {}, doiMau: {} }; const r = dungMau(k); it.ax = r.ax; it.ay = r.ay; }
    it.anims = sinh(it);
    return it;
  }

  // ═════════════ kiểm tra theo quy chuẩn ═════════════
  function kiemTra(it) {
    const E = [], W = [];
    if (!/^[a-z0-9][a-z0-9_-]*$/.test(it.code)) E.push('mã chỉ dùng chữ thường không dấu, số, - và _');
    const s = DS.sizes[it.g];
    if (s && !s.includes(`${it.w}x${it.h}`)) E.push(`cỡ ${it.w}x${it.h} sai (nhóm ${it.g}: ${s.join(' / ')})`);
    if (!s && (it.w < 8 || it.h < 8 || it.w > 320 || it.h > 320)) E.push(`cỡ ${it.w}x${it.h} sai — nhóm ${it.g} chỉ cho phép mỗi chiều 8..320 (như tools/build-pixel.js)`);
    const req = DS.req[it.g] || {};
    for (const [a, [lo, hi]] of Object.entries(req)) { const an = it.anims.find((x) => x.name === a); const n = an ? an.frames.length : 0; if (n < lo || n > hi) E.push(`động tác "${a}" cần ${lo}–${hi} khung (có ${n})`); }
    for (const an of it.anims) {
      const rg = ANIM_RANGE[an.name]; if (rg && (an.frames.length < rg[0] || an.frames.length > rg[1])) E.push(`"${an.name}" ${an.frames.length} khung (cho phép ${rg[0]}–${rg[1]})`);
      an.frames.forEach((f, i) => { if (f.empty()) E.push(`khung ${an.name}.${i} trống`); });
    }
    let le = 0;
    // như tools/build-pixel.js: chỉ nhân vật / đồ; khung chiêu (cast) và chết (die) được tự do
    const VIEN_NHOM = ['tuong', 'quai', 'boss', 'do', 'an-phu', 'than-khi'].includes(it.g);
    for (const an of it.anims) for (const f of an.frames) for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) {
      const v = f.get(x, y); if (!v || PAL[v - 1].edge || !VIEN_NHOM || an.name === 'cast' || an.name === 'die') continue;
      if ((!f.get(x - 1, y) || !f.get(x + 1, y) || !f.get(x, y - 1) || !f.get(x, y + 1) || x === 0 || y === 0 || x === f.w - 1 || y === f.h - 1)) le++;
    }
    if (le) W.push(`${le} điểm chạm nền không phải màu viền (bấm ▢ Viền)`);
    return { E, W };
  }

  // ═════════════ PNG + zip ═════════════
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(buf) { let c = 0xffffffff; for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
  function zlibStore(raw) {   // zlib "stored" (không nén) — đủ cho ảnh pixel nhỏ, không phụ thuộc trình duyệt
    const blocks = Math.ceil(raw.length / 65535) || 1, out = new Uint8Array(2 + raw.length + blocks * 5 + 4); let o = 0;
    out[o++] = 0x78; out[o++] = 0x01;
    for (let b = 0; b < blocks; b++) { const s = b * 65535, n = Math.min(65535, raw.length - s); out[o++] = b === blocks - 1 ? 1 : 0; out[o++] = n & 255; out[o++] = n >> 8; out[o++] = ~n & 255; out[o++] = (~n >> 8) & 255; out.set(raw.subarray(s, s + n), o); o += n; }
    let a = 1, b2 = 0; for (let i = 0; i < raw.length; i++) { a = (a + raw[i]) % 65521; b2 = (b2 + a) % 65521; }
    const ad = ((b2 << 16) | a) >>> 0; out[o++] = ad >>> 24; out[o++] = (ad >>> 16) & 255; out[o++] = (ad >>> 8) & 255; out[o++] = ad & 255;
    return out;
  }
  async function zlib(raw) {
    try { if (typeof CompressionStream !== 'undefined') return new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate'))).arrayBuffer()); } catch (e) { /* dùng bản không nén */ }
    return zlibStore(raw);
  }
  function chunk(type, data) {
    const o = new Uint8Array(12 + data.length), v = new DataView(o.buffer);
    v.setUint32(0, data.length); for (let i = 0; i < 4; i++) o[4 + i] = type.charCodeAt(i);
    o.set(data, 8); v.setUint32(8 + data.length, crc32(o.subarray(4, 8 + data.length)));
    return o;
  }
  async function encodePNG(grids, w, h) {   // dải khung nằm ngang, RGBA
    const n = grids.length, W = w * n, raw = new Uint8Array((W * 4 + 1) * h);
    grids.forEach((g, i) => { for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const v = g.get(x, y); if (!v) continue; const p = PAL[v - 1].rgb, o = y * (W * 4 + 1) + 1 + (i * w + x) * 4; raw[o] = p[0]; raw[o + 1] = p[1]; raw[o + 2] = p[2]; raw[o + 3] = 255; } });
    const head = new Uint8Array(13), hv = new DataView(head.buffer); hv.setUint32(0, W); hv.setUint32(4, h); head[8] = 8; head[9] = 6;
    const parts = [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', head), chunk('IDAT', await zlib(raw)), chunk('IEND', new Uint8Array(0))];
    const out = new Uint8Array(parts.reduce((s, p) => s + p.length, 0)); let o = 0; for (const p of parts) { out.set(p, o); o += p.length; }
    return out;
  }
  function makeZip(entries) {   // [{name, data}] → zip không nén, tên UTF-8
    const enc = new TextEncoder(), local = [], central = []; let off = 0;
    for (const e of entries) {
      const nm = enc.encode(e.name), crc = crc32(e.data);
      const lh = new Uint8Array(30 + nm.length), lv = new DataView(lh.buffer);
      lv.setUint32(0, 0x04034b50, true); lv.setUint16(4, 20, true); lv.setUint16(6, 0x0800, true); lv.setUint32(14, crc, true);
      lv.setUint32(18, e.data.length, true); lv.setUint32(22, e.data.length, true); lv.setUint16(26, nm.length, true); lh.set(nm, 30);
      const ch = new Uint8Array(46 + nm.length), cv = new DataView(ch.buffer);
      cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint16(8, 0x0800, true); cv.setUint32(16, crc, true);
      cv.setUint32(20, e.data.length, true); cv.setUint32(24, e.data.length, true); cv.setUint16(28, nm.length, true); cv.setUint32(42, off, true); ch.set(nm, 46);
      local.push(lh, e.data); central.push(ch); off += lh.length + e.data.length;
    }
    const cs = central.reduce((s, c) => s + c.length, 0), end = new Uint8Array(22), ev = new DataView(end.buffer);
    ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, entries.length, true); ev.setUint16(10, entries.length, true); ev.setUint32(12, cs, true); ev.setUint32(16, off, true);
    const all = [...local, ...central, end], out = new Uint8Array(all.reduce((s, p) => s + p.length, 0)); let o = 0; for (const p of all) { out.set(p, o); o += p.length; }
    return out;
  }
  async function readZip(buf) {   // → Map tên → Uint8Array (không nén / deflate)
    const b = new Uint8Array(buf), v = new DataView(b.buffer, b.byteOffset, b.byteLength), out = new Map(), dec = new TextDecoder();
    let e = b.length - 22; while (e >= 0 && v.getUint32(e, true) !== 0x06054b50) e--;
    if (e < 0) throw new Error('không phải file zip');
    let p = v.getUint32(e + 16, true); const n = v.getUint16(e + 10, true);
    for (let i = 0; i < n; i++) {
      if (v.getUint32(p, true) !== 0x02014b50) throw new Error('zip hỏng');
      const meth = v.getUint16(p + 10, true), csz = v.getUint32(p + 20, true), nl = v.getUint16(p + 28, true), xl = v.getUint16(p + 30, true), cl = v.getUint16(p + 32, true), lo = v.getUint32(p + 42, true);
      const name = dec.decode(b.subarray(p + 46, p + 46 + nl)); p += 46 + nl + xl + cl;
      if (name.endsWith('/')) continue;
      const ds = lo + 30 + v.getUint16(lo + 26, true) + v.getUint16(lo + 28, true), data = b.subarray(ds, ds + csz);
      if (meth === 0) out.set(name, data);
      else if (meth === 8) out.set(name, new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer()));
    }
    return out;
  }
  // chân dung: cắt vuông phần đầu khung đứng đầu (như tools/build-pixel.js portraitGrid)
  function chanDung(it) {
    const an = it.anims.find((a) => a.name === 'portrait'); if (an) return an.frames[0];
    const g = (it.anims.find((a) => a.name === 'idle' || a.name === 'walk') || it.anims[0]).frames[0];
    const [bx, by, bw] = bbox(g), side = Math.max(8, Math.min(it.w, it.h, Math.round(Math.min(bw, it.h * 0.72))));
    let sx = 0, n = 0; for (let y = by; y < by + Math.max(4, Math.round(side * 0.5)); y++) for (let x = 0; x < g.w; x++) if (g.get(x, y)) { sx += x; n++; }
    const cx = n ? Math.round(sx / n) : bx + (bw >> 1), x0 = Math.max(0, Math.min(it.w - side, cx - (side >> 1))), y0 = Math.max(0, by - 1);
    const o = new Grid(side, side); for (let y = 0; y < side; y++) for (let x = 0; x < side; x++) o.set(x, y, g.get(x0 + x, y0 + y)); return o;
  }
  // nguồn dạng tools/pixel/src/<nhóm>/<mã>.txt (để Claude đưa vào repo + build-pixel)
  const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  function nguonTxt(it) {
    const used = [...new Set(it.anims.flatMap((a) => a.frames.flatMap((f) => [...f.d].filter(Boolean))))].sort((a, b) => a - b);
    const ch = Object.fromEntries(used.map((v, i) => [v, CHARS[i]]));
    const clean = (s) => String(s).replace(/#/g, '').replace(/\s+/g, ' ').trim();
    const L = [`# ${clean(it.ten)} — sinh bằng tools/ve-pixel.html (${new Date().toISOString().slice(0, 10)}), chỉnh tay trong tool.`, `# Mô tả: ${clean(it.mo) || '—'}`,
      `name: ${clean(it.ten) || it.code}`, `size: ${it.w}x${it.h}`];
    if (NHAN_VAT(it.g)) L.push(`anchor: ${it.ax},${it.ay}`);
    L.push('colors:', ...used.map((v) => `  ${ch[v]} = ${PAL[v - 1].name}`), '');
    let k = 0;
    for (const an of it.anims) for (const f of an.frames) { L.push(`part k${k++}`); for (let y = 0; y < f.h; y++) { let r = ''; for (let x = 0; x < f.w; x++) { const v = f.get(x, y); r += v ? ch[v] : '.'; } L.push(r); } L.push('end', ''); }
    k = 0;
    for (const an of it.anims) { L.push(`anim ${an.name} fps=${an.fps} ${an.loop ? 'loop' : 'once'}`); for (let i = 0; i < an.frames.length; i++) L.push(`frame ${an.name}`, `  use k${k++}`, 'end'); L.push(''); }
    return L.join('\n');
  }
  async function goiZip(ITEMS) {   // danh sách mã → { data, errors, n }
    const enc = new TextEncoder(), E = [], entries = [], ma = [];
    for (const it of ITEMS) {
      const r = kiemTra(it); if (r.E.length) { E.push(`${it.k}: ${r.E[0]}`); continue; }
      const grids = [], anims = {};
      for (const an of it.anims) { anims[an.name] = { start: grids.length, n: an.frames.length, fps: an.fps, loop: !!an.loop }; grids.push(...an.frames); }
      const first = (it.anims.find((a) => a.name === 'idle' || a.name === 'walk' || a.name === 'main') || it.anims[0]).frames[0];
      const entry = { name: it.ten, w: it.w, h: it.h, ax: it.ax, ay: it.ay, bbox: bbox(first), n: grids.length, anims };
      if (NHAN_VAT(it.g)) entry.cd = 1;
      const dir = `assets/pixel/${it.g}/`;
      entries.push({ name: dir + it.code + '.png', data: await encodePNG(grids, it.w, it.h) });
      entries.push({ name: dir + it.code + '.json', data: enc.encode(JSON.stringify({ code: it.code, group: it.g, ...entry, sheet: it.code + '.png' }, null, 1) + '\n') });
      if (entry.cd) { const cd = chanDung(it); entries.push({ name: dir + it.code + '-chan-dung.png', data: await encodePNG([cd], cd.w, cd.h) }); }
      entries.push({ name: `tools/pixel/src/${it.g}/${it.code}.txt`, data: enc.encode(nguonTxt(it) + '\n') });
      ma.push({ k: it.k, ten: it.ten, n: grids.length });
    }
    if (!ma.length) return { data: null, errors: E.length ? E : ['chưa có mã nào hợp lệ'] };
    const head = { loai: 'goi-pixel-ttv', phienBan: VERSION_GOI, tao: new Date().toISOString(), congCu: 'tools/ve-pixel.html', ma };
    entries.unshift({ name: 'goi-pixel.json', data: enc.encode(JSON.stringify(head, null, 1) + '\n') });
    return { data: makeZip(entries), errors: E, n: ma.length };
  }

  // ═════════════ THƯ VIỆN MẪU VẼ TAY (tools/pixel/thu-vien.js): đọc nguồn build-pixel, chạy công thức khung ═════════════
  TV = TV || {};
  // đọc nguồn tools/pixel/src/<nhóm>/<mã>.txt (cùng cú pháp tools/build-pixel.js; lỗi cú pháp → throw)
  function docNguon(text, file = 'nguồn') {
    const s = { name: '', size: null, anchor: null, colors: {}, parts: {}, anims: {}, order: [], frames: [] };
    let mode = null, cur = null;
    text.split(/\r?\n/).forEach((raw, i) => {
      const ln = raw.replace(/\s+#.*$/, '').replace(/^#.*$/, '').trimEnd(), t = ln.trim();
      const err = (m) => { throw new Error(`${file}:${i + 1}: ${m}`); };
      if (mode === 'part') { if (t === 'end') { s.parts[cur.name] = cur.rows; mode = null; } else if (t) { if (cur.rows.length && t.length !== cur.rows[0].length) err(`part ${cur.name}: dòng lệch độ dài`); cur.rows.push(t); } return; }
      if (mode === 'frame') { if (t === 'end') { s.frames.push(cur); mode = null; } else if (t) cur.cmds.push(t.split(/\s+/)); return; }
      if (mode === 'colors') { const m = ln.match(/^\s+(\S)\s*=\s*([a-z][a-z0-9-]*)\s*$/); if (m) { s.colors[m[1]] = m[2]; return; } if (!t) return; mode = null; }
      if (!t) return;
      let m;
      if ((m = t.match(/^name:\s*(.+)$/))) s.name = m[1].trim();
      else if ((m = t.match(/^size:\s*(\d+)x(\d+)$/))) s.size = [+m[1], +m[2]];
      else if ((m = t.match(/^anchor:\s*(-?\d+)\s*,\s*(-?\d+)$/))) s.anchor = [+m[1], +m[2]];
      else if (t === 'colors:') mode = 'colors';
      else if ((m = t.match(/^part\s+([A-Za-z0-9_-]+)$/))) { mode = 'part'; cur = { name: m[1], rows: [] }; }
      else if ((m = t.match(/^anim\s+([a-z]+)((?:\s+\S+)*)$/))) { const a = { fps: 6, loop: true }; for (const tok of m[2].trim().split(/\s+/).filter(Boolean)) { const f = tok.match(/^fps=(\d+(?:\.\d+)?)$/); if (f) a.fps = +f[1]; else if (tok === 'once') a.loop = false; } s.anims[m[1]] = a; s.order.push(m[1]); }
      else if ((m = t.match(/^frame\s+([a-z]+)$/))) { mode = 'frame'; cur = { anim: m[1], cmds: [] }; }
      else err(`không hiểu dòng: ${t}`);
    });
    if (!s.size) throw new Error(`${file}: thiếu size`);
    return s;
  }
  // nhóm bộ phận theo tên part (để chọn thay thế cùng loại)
  const LOAI_PART = [['dau', /^(dau|mat|toc|mu|khan|non|mien|vuong|portrait|chan_dung)/], ['than', /^(than|tren|ao|giap|vay|bung|lung|nguc|vo)/], ['chan', /^(chan|duoi)/],
    ['tay', /^tay/], ['vk', /^(gay|giao|riu|kiem|dao|cung|no(_|$)|cheo|bua|kich|chuy|sao|ong|vk|guom|mac|xeng|cuoc|liem|ten|chuong|chieng|quat|bat|luoi|ria)/],
    ['phep', /^(lua|tia|sang|phep|set|nuoc|bot|hao|khoi|hoa|da_|soc|vong|sao_)/], ['canh', /^(canh|vay_ca|vi)/]];
  const loaiPart = (n) => (LOAI_PART.find(([, re]) => re.test(n)) || ['khac'])[0];
  const _tvCache = new Map();
  function mauTV(key) { if (!TV[key]) return null; let s = _tvCache.get(key); if (!s) { s = docNguon(TV[key].src, key); _tvCache.set(key, s); } return s; }
  // danh sách bộ phận trong thư viện: [{ ref: 'nhóm/mã:part', loai, w, h }]
  function boPhanTV(loai) {
    const out = [];
    for (const k of Object.keys(TV)) { let s; try { s = mauTV(k); } catch (e) { continue; } for (const [n, rows] of Object.entries(s.parts)) { const l = loaiPart(n); if (!loai || l === loai) out.push({ ref: k + ':' + n, loai: l, w: rows[0].length, h: rows.length }); } }
    return out;
  }
  // dựng mọi khung từ nguồn mẫu: tuỳ chọn thay bộ phận ({ part: 'nhóm/mã:part' }) + đổi màu ({ 'son': 'cham' } theo dải hoặc tên màu)
  // → { w, h, ax, ay, anims: [{ name, fps, loop, frames: [Grid] }], loi: [] }
  function dungMau(key, opt = {}) {
    const s = typeof key === 'string' ? mauTV(key) : key;
    if (!s) throw new Error(`không có mẫu "${key}" trong thư viện`);
    const [w, h] = s.size, loi = [];
    // bảng màu ô: mã ô = nguồn * 1000 + mã ký tự; nguồn 0 = mẫu chính, 1.. = mẫu của bộ phận thay
    const nguon = [s.colors], ma = (si, ch) => si * 1000 + ch.charCodeAt(0);
    const parts = {};
    for (const [n, rows] of Object.entries(s.parts)) parts[n] = { rows, si: 0 };
    // "gay*": "tuong/tanvien:gay*" → thay cả bộ gay, gay_ngang, gay_cheo… bằng part cùng hậu tố của mẫu kia
    const thay = {};
    for (const [n, ref] of Object.entries(opt.thay || {})) {
      if (!n.endsWith('*')) { thay[n] = ref; continue; }
      const pre = n.slice(0, -1), [k2, p2] = String(ref).split(':'), pre2 = (p2 || '').replace(/\*$/, ''), s2 = mauTV(k2);
      const ds = Object.keys(s.parts).filter((x) => x.startsWith(pre));
      if (!ds.length) loi.push(`thay: mẫu không có bộ phận nào bắt đầu "${pre}"`);
      for (const x of ds) { const y = pre2 + x.slice(pre.length); if (s2 && s2.parts[y]) thay[x] = k2 + ':' + y; }
    }
    for (const [n, ref] of Object.entries(thay)) {
      const [k2, p2] = String(ref).split(':'), s2 = mauTV(k2);
      if (!s.parts[n]) { loi.push(`thay: mẫu không có bộ phận "${n}" (có: ${Object.keys(s.parts).join(', ')})`); continue; }
      if (!s2 || !s2.parts[p2]) { loi.push(`thay ${n}: không có "${ref}" trong thư viện`); continue; }
      nguon.push(s2.colors); parts[n] = { rows: s2.parts[p2], si: nguon.length - 1 };
    }
    const blank = () => new Int32Array(w * h), built = {}, anims = [];
    const vienCh = Object.keys(s.colors).find((c) => s.colors[c] === 'vien');
    for (const fr of s.frames) {
      let g = blank();
      for (const [op, ...a] of fr.cmds) {
        if (op === 'use') {
          const rm = (a[0] || '').match(/^@([a-z]+)\.(\d+)$/), ox = +(a[1] || 0), oy = +(a[2] || 0);
          if (rm) { const src = built[rm[1]] && built[rm[1]][+rm[2]]; if (!src) { loi.push(`use ${a[0]}: chưa có khung`); continue; } for (let i = 0; i < src.length; i++) if (src[i]) { const x = i % w + ox, y = Math.floor(i / w) + oy; if (x >= 0 && y >= 0 && x < w && y < h) g[y * w + x] = src[i]; } continue; }
          const p = parts[a[0]]; if (!p) { loi.push(`use: không có part "${a[0]}"`); continue; }
          p.rows.forEach((row, y) => { for (let x = 0; x < row.length; x++) { const c = row[x]; if (c === '.') continue; const X = x + ox, Y = y + oy; if (X < 0 || Y < 0 || X >= w || Y >= h) continue; g[Y * w + X] = c === '_' ? 0 : ma(p.si, c); } });
        } else if (op === 'shift' || op === 'wrap') {
          const dx = +a[0] || 0, dy = +a[1] || 0, n = blank();
          for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const v = g[y * w + x]; if (!v) continue; let X = x + dx, Y = y + dy; if (op === 'wrap') { X = ((X % w) + w) % w; Y = ((Y % h) + h) % h; } if (X >= 0 && Y >= 0 && X < w && Y < h) n[Y * w + X] = v; }
          g = n;
        } else if (op === 'swap') { const f = ma(0, a[0]), t = a[1] === '.' ? 0 : ma(0, a[1]); for (let i = 0; i < g.length; i++) if (g[i] === f) g[i] = t; }
        else if (op === 'set') { const x = +a[0], y = +a[1]; if (x >= 0 && y >= 0 && x < w && y < h) g[y * w + x] = a[2] === '.' || a[2] === '_' ? 0 : ma(0, a[2]); }
        else if (op === 'flipx') { const n = blank(); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) n[y * w + (w - 1 - x)] = g[y * w + x]; g = n; }
        else if (op === 'rot') { const k = (((+a[0] / 90) % 4) + 4) % 4; for (let r = 0; r < k; r++) { const n = blank(); if (w === h) for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) n[x * w + (w - 1 - y)] = g[y * w + x]; else if (k === 2) for (let i = 0; i < g.length; i++) n[g.length - 1 - i] = g[i]; g = n; if (w !== h) break; } }
        else if (op === 'outline') {
          const c = a[0] ? ma(0, a[0]) : vienCh ? ma(0, vienCh) : -1, n = Int32Array.from(g);
          for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!g[y * w + x] && ((x > 0 && g[y * w + x - 1]) || (x < w - 1 && g[y * w + x + 1]) || (y > 0 && g[(y - 1) * w + x]) || (y < h - 1 && g[(y + 1) * w + x]))) n[y * w + x] = c;
          g = n;
        } else loi.push(`lệnh lạ "${op}"`);
      }
      (built[fr.anim] || (built[fr.anim] = [])).push(g);
    }
    // mã ô → chỉ số bảng màu (+ đổi màu)
    const doi = {};
    for (const [a, b] of Object.entries(opt.doiMau || {})) {
      if (RAMP[a] && RAMP[b]) RAMP[a].forEach((n, i) => { doi[n] = RAMP[b][i]; });
      else if (PI[a] && PI[b]) doi[a] = b;
      else loi.push(`đổi màu "${a}" → "${b}": không phải dải màu (${Object.keys(RAMP).join(', ')}) hay tên màu trong bảng`);
    }
    const toIdx = (v) => { if (v === -1) return C('vien'); const name = nguon[Math.floor(v / 1000)][String.fromCharCode(v % 1000)]; if (!name || !PI[name]) return 0; return PI[doi[name] || name]; };
    for (const an of s.order) {
      const fr = (built[an] || []).map((g) => { const o = new Grid(w, h); for (let i = 0; i < g.length; i++) if (g[i]) o.d[i] = toIdx(g[i]); return o; });
      if (fr.length) anims.push({ name: an, fps: s.anims[an].fps, loop: s.anims[an].loop, frames: fr });
    }
    const anc = s.anchor || [w >> 1, h - 1];
    return { w, h, ax: anc[0], ay: anc[1], ten: s.name, anims, loi };
  }

  // ═════════════ SPEC (JSON) → mã — dùng cho CLI tools/ve-pixel.js; định dạng: docs/pixel/SPEC.md ═════════════
  const SPEC_KEYS = new Set(['ma', 'ten', 'mo', 'co', 'bo_phan', 'hanh', 'dong_tac', 'mau', 'thay', 'doi_mau', 've_tay', 'ghi_chu', 'so_sanh', 'nguong', 'duong', 'o_dat']);
  const HANH_TU = { kim: 'kim', moc: 'moc', 'mộc': 'moc', thuy: 'thuy', 'thủy': 'thuy', 'thuỷ': 'thuy', hoa: 'hoa', 'hỏa': 'hoa', 'hoả': 'hoa', tho: 'tho', 'thổ': 'tho' };
  // → { it, loi: [{ ma: 'E_…', msg }] }
  function tuSpec(sp, i = 0) {
    const loi = [], L = (ma, msg) => loi.push({ ma, msg: `mã #${i + 1}${sp && sp.ma ? ` (${sp.ma})` : ''}: ${msg}` });
    if (!sp || typeof sp !== 'object' || Array.isArray(sp)) { L('E_SPEC', 'mỗi mã phải là một object { "ma": "nhóm/mã", … }'); return { loi }; }
    for (const k of Object.keys(sp)) if (!SPEC_KEYS.has(k)) L('E_KHOA', `khoá lạ "${k}" (dùng: ${[...SPEC_KEYS].join(', ')})`);
    const m = String(sp.ma || '').match(/^([a-z-]+)\/([a-z0-9]+(?:[-_][a-z0-9]+)*)$/);
    if (!m) { L('E_MA', `"ma" phải dạng "nhóm/mã" chữ thường không dấu (vd "tuong/giong"), đang là ${JSON.stringify(sp.ma)}`); return { loi }; }
    const [, g, code] = m;
    if (!(g in DS.sizes)) { L('E_NHOM', `nhóm "${g}" không có (dùng: ${Object.keys(DS.sizes).join(', ')})`); return { loi }; }
    const d = DS.ma.find((x) => x.k === sp.ma) || {};
    if (sp.co !== undefined && !/^\d+x\d+$/.test(sp.co)) L('E_CO', `"co" dạng "32x32", đang là ${JSON.stringify(sp.co)}`);
    if (sp.co && DS.sizes[g] && !DS.sizes[g].includes(sp.co)) L('E_CO', `cỡ ${sp.co} sai cho nhóm ${g} (${DS.sizes[g].join(' / ')})`);
    let hanh = '';
    if (sp.hanh !== undefined) { hanh = HANH_TU[lc(sp.hanh)] || ''; if (!hanh) L('E_HANH', `"hanh" phải là kim / moc / thuy / hoa / tho, đang là ${JSON.stringify(sp.hanh)}`); }
    if (loi.length) return { loi };
    let it;
    if (sp.mau) {
      if (!TV[sp.mau]) { L('E_MAU_TV', `"mau": không có "${sp.mau}" trong thư viện vẽ tay (tools/pixel/thu-vien.js)`); return { loi }; }
      if (sp.mau.split('/')[0] !== g && !(NHAN_VAT(g) && NHAN_VAT(sp.mau.split('/')[0]))) L('E_MAU_TV', `"mau" ${sp.mau} khác nhóm ${g}`);
      let r;
      try { r = dungMau(sp.mau, { thay: sp.thay || {}, doiMau: sp.doi_mau || {} }); } catch (e) { L('E_MAU_TV', e.message); return { loi }; }
      r.loi.forEach((x) => L(/^thay/.test(x) ? 'E_THAY' : /^đổi màu/.test(x) ? 'E_DOI_MAU' : 'E_MAU_TV', x));
      it = { k: sp.ma, g, code, ten: sp.ten || d.ten || r.ten || code, mo: sp.mo || d.mo || '', w: r.w, h: r.h, ax: r.ax, ay: r.ay, opt: { mau: sp.mau, thay: sp.thay || {}, doiMau: sp.doi_mau || {} }, anims: r.anims };
    } else {
      if (sp.thay || sp.doi_mau) L('E_THAY', '"thay" / "doi_mau" chỉ dùng cùng "mau" (mẫu vẽ tay)');
      it = taoItem(sp.ma, sp.ten || d.ten, sp.mo !== undefined ? sp.mo : d.mo, sp.co || d.co, '', { khongMau: true });
      if (hanh) it.opt.hanh = hanh;
      const set = optSet(g);
      for (const [k, v] of Object.entries(sp.bo_phan || {})) {
        if (!(k in set)) { L('E_BO_PHAN', `bộ phận "${k}" không có cho nhóm ${g} (dùng: ${Object.keys(set).join(', ')})`); continue; }
        const vals = set[k][1] || optValues(k);
        if (!(v in vals)) { L('E_GIA_TRI', `bộ phận ${k} = "${v}" không hợp lệ (chọn: ${Object.keys(vals).join(', ')})`); continue; }
        it.opt[k] = v;
      }
      if (g === 'ban-do') {   // đường + ô đặt tướng (toạ độ thiết kế 932×430)
        const dd = Array.isArray(sp.duong) ? sp.duong : [sp.duong];
        if (!sp.duong || dd.some((d) => typeof d !== 'string' || !/^\s*[Mm]/.test(d))) L('E_BAN_DO', '"duong": chuỗi path SVG bắt đầu bằng M (hoặc mảng nhiều nhánh)');
        if (sp.o_dat !== undefined && (!Array.isArray(sp.o_dat) || sp.o_dat.some((q) => !Array.isArray(q) || q.length !== 2 || !q.every(Number.isFinite)))) L('E_BAN_DO', '"o_dat": mảng [[x, y], …] toạ độ thiết kế 932×430');
        it.opt.duong = sp.duong; it.opt.o_dat = sp.o_dat || [];
      }
      if (sp.bo_phan || hanh || g === 'ban-do') it.anims = sinh(it);
    }
    // động tác: chỉnh fps / lặp
    for (const [an, o] of Object.entries(sp.dong_tac || {})) {
      const a = it.anims.find((x) => x.name === an);
      if (!a) { L('E_DONG_TAC', `động tác "${an}" không có (có: ${it.anims.map((x) => x.name).join(', ')})`); continue; }
      if (o.fps !== undefined) { if (!(o.fps >= 1 && o.fps <= 30)) L('E_DONG_TAC', `${an}.fps phải 1..30`); else a.fps = o.fps; }
      if (o.lap !== undefined) a.loop = !!o.lap;
    }
    // vẽ tay: { "mau": { "a": "son" }, "khung": { "idle.0": ["....", …] } } — '.' giữ nguyên, '_' xoá, ký tự khác = màu
    if (sp.ve_tay) {
      const vt = sp.ve_tay, cm = vt.mau || {};
      for (const [ch, name] of Object.entries(cm)) if (ch.length !== 1 || ch === '.' || ch === '_' || !PI[name]) L('E_VE_TAY', `ve_tay.mau "${ch}" = "${name}": ký tự đơn (không . _) và tên màu trong palette.txt`);
      for (const [ref, rows] of Object.entries(vt.khung || {})) {
        const rm = ref.match(/^([a-z]+)\.(\d+)$/), a = rm && it.anims.find((x) => x.name === rm[1]);
        if (!a) { L('E_VE_TAY', `ve_tay.khung "${ref}": dạng "<động tác>.<số khung>" với động tác có sẵn`); continue; }
        const k = +rm[2];
        if (k > a.frames.length) { L('E_VE_TAY', `ve_tay.khung "${ref}": khung ${k} vượt quá (có ${a.frames.length}; dùng số kế tiếp để thêm khung)`); continue; }
        if (!Array.isArray(rows) || rows.length !== it.h || rows.some((r) => typeof r !== 'string' || r.length !== it.w)) { L('E_VE_TAY', `ve_tay.khung "${ref}": cần ${it.h} dòng, mỗi dòng ${it.w} ký tự`); continue; }
        const f = k < a.frames.length ? a.frames[k] : (a.frames.push(a.frames[k - 1].clone()), a.frames[k]);
        rows.forEach((r, y) => [...r].forEach((c, x) => { if (c === '.') return; if (c === '_') f.set(x, y, 0); else if (cm[c] && PI[cm[c]]) f.set(x, y, PI[cm[c]]); else L('E_VE_TAY', `ve_tay.khung "${ref}" dòng ${y}: ký tự '${c}' chưa khai báo trong ve_tay.mau`); }));
      }
    }
    if (!loi.length) { const r = kiemTra(it); r.E.forEach((e) => L('E_QUY_CHUAN', e)); }
    return { it, loi };
  }
  // đọc cả tệp spec: object { "ma": [...] } · mảng [...] · một mã { "ma": "nhóm/mã" }
  function docSpec(json) {
    const list = Array.isArray(json) ? json : json && Array.isArray(json.ma) ? json.ma : json && typeof json.ma === 'string' ? [json] : null;
    if (!list) return { items: [], loi: [{ ma: 'E_SPEC', msg: 'spec phải là { "ma": [ … ] }, một mảng mã, hoặc một mã { "ma": "nhóm/mã", … }' }] };
    const items = [], loi = [], seen = new Set();
    list.forEach((sp, i) => {
      if (sp && seen.has(sp.ma)) { loi.push({ ma: 'E_TRUNG', msg: `mã #${i + 1}: "${sp.ma}" khai báo hai lần` }); return; }
      if (sp) seen.add(sp.ma);
      const r = tuSpec(sp, i); loi.push(...r.loi); if (r.it && !r.loi.length) items.push(r.it);
    });
    return { items, loi };
  }
  // so 2 bộ khung: tỉ lệ điểm ảnh khác nhau (0..1) trên toàn dải
  function soSanh(a, b) {
    if (a.w !== b.w || a.h !== b.h) return 1;
    let khac = 0, tong = 0;
    const fa = a.anims.flatMap((x) => x.frames), fb = b.anims.flatMap((x) => x.frames);
    const n = Math.max(fa.length, fb.length);
    for (let i = 0; i < n; i++) { const A = fa[i], B = fb[i]; const w = (A || B).w, h = (A || B).h; for (let p = 0; p < w * h; p++) { const va = A ? A.d[p] : 0, vb = B ? B.d[p] : 0; if (va || vb) { tong++; if (va !== vb) khac++; } } }
    return tong ? khac / tong : 0;
  }

  return { PAL, PI, C, ANIM_RANGE, NHOM_TEN, NHAN_VAT, VERSION_GOI, RAMP, MAU_TEN, HANH, OPT_NV, OPT_ICON, OPT_NEN, OPT_UI, OPT_CANH, OPT_BANDO, HINH_THEM, OPT_TRONG, optSet, MAU_KEYS, HANH_KEYS, optValues, defOpts, lc, MAU_TU, RE_TU, tu, mauTrong, coTu, som, hieuMoTa, Grid, Mask, rampOf, paint, outline, blit, shift, flipX, rot90, swapC, bbox, scaleGrid, SEED, rnd, seedOf, weaponGrid, stampWeapon, burst, SKIN, veNguoi, veThu, veRan, ve, nam, toi, sang, rage, sinhNhanVat, sinhIcon, sinhNen, sinhUI, sinhCanh, sinhBanDo, duongSvg, veHinhThem, sinh, coMacDinh, taoItem, kiemTra, CRC, crc32, zlibStore, zlib, chunk, encodePNG, makeZip, readZip, chanDung, CHARS, nguonTxt, goiZip, TV, docNguon, LOAI_PART, loaiPart, mauTV, boPhanTV, dungMau, tuSpec, docSpec, soSanh
  };
}
if (typeof module !== 'undefined' && module.exports) module.exports = VePixelCore;
else root.VePixelCore = VePixelCore;
})(typeof window !== 'undefined' ? window : globalThis);
