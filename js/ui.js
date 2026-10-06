'use strict';

// ============================================================
//  GIAO DIỆN: menu, mở đầu, chiến dịch, màn chơi (thanh trên, triệu
//  hồi, bảng điều khiển dưới), các màn hình trong trận (Cây kỹ năng,
//  Lò đúc đồng, Túi đồ, Đổi vàng, Tiến hoá, Núi Tản Viên, Bách khoa),
//  sính lễ, thắng/thua, cài đặt. Theo bản thiết kế v14.
// ============================================================

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = (n) => Math.round(n).toLocaleString('vi-VN');
const ICON = {
  close: '<svg viewBox="0 0 16 16"><path d="M3 3 L13 13 M13 3 L3 13" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  back: '<svg viewBox="0 0 16 16"><path d="M10 3 L5 8 L10 13" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>',
  check: '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M3 8.5 L6.5 12 L13 4.5" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>',
  lock: '<svg viewBox="0 0 16 16" width="12" height="12"><rect x="3" y="7" width="10" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5 7 V5 A3 3 0 0 1 11 5 V7" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
  up: '<svg viewBox="0 0 16 16" width="16" height="16"><path d="M8 14 V3 M3 8 L8 3 L13 8" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>',
  dup: '<svg viewBox="0 0 20 20" width="20" height="20"><path d="M4 11 L10 5 L16 11 M4 16 L10 10 L16 16" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>',
  swap: '<svg viewBox="0 0 20 20"><path d="M3 7 H16 M12 3 L16 7 L12 11 M17 13 H4 M8 9 L4 13 L8 17" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>',
  mount: '<svg viewBox="0 0 24 24"><path d="M2 19 L9 8 L13 14 L16 10 L22 19 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M17 3 V8 M14.5 5.5 H19.5" stroke="currentColor" stroke-width="2"/></svg>',
  bag: '<svg viewBox="0 0 20 20"><path d="M4 7 H16 L15 17 H5 Z M7 7 V5 A3 3 0 0 1 13 5 V7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
  star: '<svg viewBox="0 0 20 20"><path d="M10 2 L12.4 7.3 L18 7.8 L13.8 11.6 L15 17.3 L10 14.4 L5 17.3 L6.2 11.6 L2 7.8 L7.6 7.3 Z" fill="currentColor"/></svg>',
  stop: '<path d="M5 5 H15 V15 H5 Z" fill="currentColor"/>',
  play: '<path d="M6 4 L16 10 L6 16 Z" fill="currentColor"/>',
};
// ổ khóa vẽ tay (ui_khoa.png) nếu đã có
{ const lockSvg = ICON.lock; Object.defineProperty(ICON, 'lock', { get: () => uiIc('khoa', lockSvg) }); }

const svgI = (svg, cls = '') => `<span class="svgi ${cls}">${svg || ''}</span>`;
// v95: Ngân khố (tài khoản) dùng nén BẠC, khác hẳn đồng VÀNG trong trận
let KHO_MODE = false;       // đang mở Lò đúc đồng trước trận: giá hiện bằng bạc Ngân khố
const bac = (sm) => `<i class="bac${sm ? ' sm' : ''}"></i>`;
const coin = (sm) => KHO_MODE ? bac(sm) : (assetUrl('ui_dong-xu.png') ? `<img class="coin-img${sm ? ' sm' : ''}" src="${assetUrl('ui_dong-xu.png')}" alt="">` : `<i class="coin${sm ? ' sm' : ''}"></i>`);
// icon giao diện vẽ tay (ui_*.png) nếu đã có, không thì dùng ký hiệu dự phòng
const uiIc = (name, fallback = '') => (assetUrl(`ui_${name}.png`) ? `<img class="uiic" src="${assetUrl(`ui_${name}.png`)}" alt="">` : fallback);
const rarCls = (r) => ({ common: 'rt', rare: 'rh', epic: 'rs', legendary: 'rl' }[r]);
const ATTR_CLS = { str: 'a-str', agi: 'a-agi', int: 'a-int' };
const BOSS_LINES = {
  thuongluong: 'Ta là Thuồng Luồng sông Đà! Một cú quẫy đuôi là tướng của ngươi nằm rạp!',
  haba: 'Hà Bá ta sống dưới nước nghìn năm. Hạ ta một lần chưa phải là xong đâu!',
  thuytinh: 'Mị Nương phải là của ta! Mưa gió ơi, nhấn chìm Phong Châu!',
};
const RUN_CHIP = '<span class="chip run">Quái vẫn đang chạy</span>';

// v111: Ấn Phù vẽ tay (assets/runes/<mã ấn>.png, cắt bằng tools/cat-runes.py); thiếu ảnh thì hiện ký hiệu cũ
const runeIc = (r) => `<img class="rimg" src="${assetSrc(`runes/${r.id}.png`)}" alt="${r.ic}" onerror="this.replaceWith(this.alt)">`;

// Icon: ưu tiên ảnh vẽ tay trong assets/ (nếu đã có), không thì dùng hình vector
function skillIcon(type, i) {
  // v107: icon vẽ tay trong bộ ảnh tướng → luôn dùng (như ảnh tướng), trừ khi bật "Tướng vẽ nét"
  if (SKILL_PACK.has(type) && !vectorHeroesOn()) return `<img src="${assetSrc(`packs/${type}/sk-${SKILL_KEYS[i].toLowerCase()}.png`)}" alt="">`;
  const u = assetUrl(skillPngPath(type, i));
  if (u) return `<img src="${u}" alt="">`;
  return svgImg(HAS_ART && ART.skill[type] ? ART.skill[type][SKILL_KEYS[i]] : '');
}
// Icon vector nhiều chi tiết: đưa vào <img> (ảnh đệm sẵn) thay vì chèn thẳng thẻ <svg>,
// trình duyệt chỉ vẽ một lần — dựng lại bảng / túi đồ nhẹ hơn hẳn, bấm đỡ giật.
const svgImgCache = new Map();
function svgImg(svg) {
  if (!svg || svg.startsWith('<img')) return svg || '';
  let u = svgImgCache.get(svg);
  if (!u) {
    const full = svg.includes('xmlns=') ? svg : svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    u = svgUrl(full);
    svgImgCache.set(svg, u);
  }
  return `<img src="${u}" alt="" draggable="false">`;
}
// Icon vector cho 4 phụ kiện và 8 đồ ghép mới (v15), cùng nét với ART.item
const S24 = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><g stroke="#1A1208" stroke-width="1" stroke-linejoin="round">${body}</g></svg>`;
const NEW_ITEM_ART = {
  ngoc_minh_chau: S24('<circle cx="12" cy="12" r="10" fill="#1E4050"/><circle cx="12" cy="12" r="6.5" fill="#BFF0FF"/><circle cx="10" cy="10" r="2.2" fill="#FFF"/><path d="M12 1.5 v3 M12 19.5 v3 M1.5 12 h3 M19.5 12 h3" stroke="#9EDDF2" stroke-width="1.4"/>'),
  vuot_kim_quy: S24('<path d="M5 20 C7 12 11 6 18 3 C16 9 15 14 9 21 Z" fill="#F2C840"/><path d="M8 19 C10 13 13 9 17 5" stroke="#8C6A2E" fill="none"/><path d="M4 22 l4 -3" stroke="#3EDCC0" stroke-width="2.2" stroke-linecap="round"/>'),
  rui_than:   S24('<path d="M6 22 L15 6" stroke="#1A1208" stroke-width="3.4" stroke-linecap="round"/><path d="M6 22 L15 6" stroke="#B8853A" stroke-width="1.6" stroke-linecap="round"/><path d="M11.5 8.5 C12 3.5 17 1 22 2.5 C23 7.5 21 11.5 17 13.2 C16.2 10.6 14.2 9 11.5 8.5 Z" fill="#FFD66B" stroke="#7A5418"/><path d="M2 16 l3 -1 M3 12 l2.6 0.4" stroke="#FF9A3A" stroke-width="1.4"/>'),
  ao_long_vu: S24('<path d="M12 3 C7 5 4 9 4 15 C7 14 9 16 12 21 C15 16 17 14 20 15 C20 9 17 5 12 3 Z" fill="#F7EEF2" stroke="#C8A0C0"/><path d="M12 5 V19 M8 9 l4 3 l4 -3 M7 13 l5 3 l5 -3" stroke="#E8A0C0" fill="none" stroke-width="1.1"/>'),
  sung_te: S24('<path d="M4.5 20.5 C9 20 15 15.5 18.5 3.5 C20.5 10 18.5 17.5 12.5 21.5 Z" fill="#E2D2A8"/><path d="M7 19.6 C11 18.6 15 14 17.6 7" fill="none" stroke="#B8A27A"/><path d="M4 21.5 L12.8 21.5" stroke="#8C6A2E" stroke-width="2.2" stroke-linecap="round"/>'),
  long_chim_lac: S24('<path d="M5 21 C6.5 13 12 6 20.5 2.5 C20 10 14.5 16.5 5 21 Z" fill="#F2E6C8"/><path d="M5 21 L18.5 5" stroke="#C8943A" stroke-width="1.3"/><path d="M9 15.5 l-2.5 -1.5 M11.5 12.5 l-2.5 -1.5 M14 9.6 l-2.2 -1.4 M10.5 16.2 l2.2 0.8 M13 13.2 l2.2 0.8" stroke="#B8A27A" stroke-width="0.8"/>'),
  vay_ca: S24('<path d="M12 2.5 C17 4 20 5 20 11 C20 16.5 16 20 12 21.5 C8 20 4 16.5 4 11 C4 5 7 4 12 2.5 Z" fill="#4FA3D9"/><path d="M6 9 q3 3 6 0 q3 3 6 0 M6 13 q3 3 6 0 q3 3 6 0 M8 17 q2 2.4 4 0 q2 2.4 4 0" fill="none" stroke="#BFE8F5" stroke-width="1.1"/>'),
  hat_lua: S24('<path d="M12 22 C12 15 11 9 13.5 3" fill="none" stroke="#8C7A3A" stroke-width="1.4"/><ellipse cx="9.6" cy="7.5" rx="2" ry="3.2" transform="rotate(-25 9.6 7.5)" fill="#F2D27A"/><ellipse cx="15.6" cy="9" rx="2" ry="3.2" transform="rotate(30 15.6 9)" fill="#F2D27A"/><ellipse cx="9" cy="13" rx="2" ry="3.2" transform="rotate(-30 9 13)" fill="#E8C050"/><ellipse cx="15" cy="15" rx="2" ry="3.2" transform="rotate(30 15 15)" fill="#E8C050"/>'),
  mui_sung: S24('<circle cx="12" cy="12" r="10.2" fill="#3A3226"/><path d="M5.5 19 C10 18 15 13 18 4 C19.8 10 17.4 16.4 11.5 20 Z" fill="#E2D2A8"/><path d="M9.6 17.6 L13.4 14.4" stroke="#C8BFA8" stroke-width="2.2"/><path d="M16 6 l2.6 -2.6 M19 8.5 l2.4 -1" stroke="#FFD66B" stroke-width="1.2"/>'),
  riu_quet: S24('<path d="M5 21.5 L15 5" stroke="#1A1208" stroke-width="3" stroke-linecap="round"/><path d="M5 21.5 L15 5" stroke="#8C6A3A" stroke-width="1.5" stroke-linecap="round"/><path d="M12.6 7.6 C13.2 3.6 17 1.6 21 2.6 C22.2 6.4 21 10.4 17.6 12 C16.8 9.8 15 8.2 12.6 7.6 Z" fill="#C8BFA8"/><path d="M1.5 18 q2.5 -2 5 0 q2.5 2 5 0 M3 14.5 q2 -1.6 4 0" fill="none" stroke="#5AB4D6" stroke-width="1.4"/>'),
  cung_mat_chim: S24('<path d="M6 3 C14 7 14 17 6 21" fill="none" stroke="#1A1208" stroke-width="3"/><path d="M6 3 C14 7 14 17 6 21" fill="none" stroke="#C8943A" stroke-width="1.6"/><path d="M6 3 L6 21" stroke="#E8DDBF" stroke-width="0.8"/><path d="M12.5 12 C15 8.5 20 8.5 22 12 C20 15.5 15 15.5 12.5 12 Z" fill="#F2E6C8"/><circle cx="17.2" cy="12" r="2" fill="#2F6FB0"/><circle cx="17.2" cy="12" r="0.8" fill="#1A1208" stroke="none"/>'),
  bua_chim_lac: S24('<rect x="6" y="2.5" width="12" height="19" rx="1.2" fill="#E8C070"/><path d="M8.5 11 C10 8 13.5 7.5 15.8 9.2 C14 9.4 13 10 12.4 11.4 C14 11.2 15.4 11.8 16 13 C13.6 12.8 11.6 13.6 10.4 15.6 C10.4 13.6 9.6 12 8.5 11 Z" fill="#B8301E"/><path d="M8 5 h8 M8 19 h8" stroke="#B8301E" stroke-width="1"/>'),
  ao_vay_ca: S24('<path d="M8 3 L12 5 L16 3 L21 6.5 L19 11 L17.5 10 L17.5 21 L6.5 21 L6.5 10 L5 11 L3 6.5 Z" fill="#2F6FB0"/><path d="M8 12 q2 2 4 0 q2 2 4 0 M8 15.5 q2 2 4 0 q2 2 4 0 M8 19 q2 1.6 4 0 q2 1.6 4 0" fill="none" stroke="#9EE8F8" stroke-width="1"/>'),
  ngoc_tran_thuy: S24('<circle cx="12" cy="11" r="8.2" fill="#3EC08A"/><circle cx="9.5" cy="8.5" r="2.4" fill="#BFF5DA" stroke="none"/><path d="M6 13.5 q1.5 -1.6 3 0 q1.5 1.6 3 0 q1.5 -1.6 3 0 q1.5 1.6 3 0" fill="none" stroke="#1F5A52" stroke-width="1.2"/><path d="M7 20.5 h10 l-1.5 2 h-7 Z" fill="#C8943A"/>'),
  luoi_ca: S24('<circle cx="12" cy="12" r="9.5" fill="#5A4A36"/><path d="M5 7.5 L19 16.5 M5 16.5 L19 7.5 M3 12 H21 M12 2.5 V21.5 M7 4 L17 20 M17 4 L7 20" stroke="#D8C8A0" stroke-width="0.9"/><circle cx="12" cy="12" r="9.5" fill="none" stroke="#C8943A" stroke-width="1.6"/>'),
  bo_lua: S24('<path d="M4 9 H20 L18 21 H6 Z" fill="#B8853A"/><path d="M5 12.5 H19 M5.5 16.5 H18.5 M9 9 L8.5 21 M15 9 L15.5 21" stroke="#7A5418" stroke-width="0.8"/><ellipse cx="12" cy="8" rx="8" ry="3" fill="#F2D27A"/><path d="M8 7.5 l1 -1 M11 7 l1 -1 M14 7.5 l1 -1 M16.5 8.2 l1 -1" stroke="#B8852A" stroke-width="0.8"/>'),
};
// Đồ bộ mới: lấy icon Bộ Lạc Long cùng ô rồi đổi màu theo bộ
const SET_PAL = {
  sontinh: ['#8C7A5A', '#4A3E2A', '#C8B48A'], chimlac: ['#E8DDBF', '#9A8A60', '#FFF8E0'],
  drum: ['#B07A3A', '#5E3A14', '#E8C070'], nguasat: ['#3A3030', '#1A1414', '#E0452C'],
};
const LL_COLORS = { '#3E8A7A': 0, '#2E7A6E': 0, '#1F7A78': 0, '#1F5A52': 1, '#6ED0C0': 2, '#9EE8F8': 2, '#9EF2E0': 2, '#2A8AA8': 2 };
const setIconCache = {};
function setItemIcon(id) {
  if (setIconCache[id] !== undefined) return setIconCache[id];
  const it = ITEMS[id];
  const ll = SETS.laclong.ids[it.slot === 'weapon' ? it.wclass : it.slot];
  const src = HAS_ART && ART.item[ll];
  const pal = SET_PAL[it.set];
  return (setIconCache[id] = src && pal ? src.replace(/#[0-9A-Fa-f]{6}/g, (c) => (c.toUpperCase() in LL_COLORS ? pal[LL_COLORS[c.toUpperCase()]] : c)) : '');
}
function itemIcon(id) {
  const u = assetUrl(itemPngPath(id));
  if (u) return `<img src="${u}" alt="">`;
  if (HAS_ART && ART.item[id]) return svgImg(ART.item[id]);
  if (NEW_ITEM_ART[id]) return svgImg(NEW_ITEM_ART[id]);
  return ITEMS[id] && ITEMS[id].set ? svgImg(setItemIcon(id)) : '';
}
function sceneArt(k) {
  const u = SCENE_FILE[k] && assetUrl(SCENE_FILE[k]);
  if (u) return `<img src="${u}" alt="">`;
  if (k === 'huvua') return sceneArt('hubau');
  return HAS_ART && ART.scene[k] ? ART.scene[k] : '';
}
// Biểu tượng Ngũ hành trong khung tròn trống đồng
const EL_PATH = {
  kim: '<path d="M8 17 L14 7 M12.5 6 C14 3.5 17.5 3 19 4.5 C19.5 7.5 17.5 10 15 10.5 Z" stroke-width="1.6"/>',
  moc: '<path d="M12 19 V11 M12 12 C8 12 6.5 9 7 6 C10 6 12 8.5 12 12 M12 10.5 C12 7 14.5 5 17.5 5.5 C17.5 8.5 15.5 10.5 12 10.5"/>',
  thuy: '<path d="M4.5 10 q2.5 -3 5 0 t5 0 t5 0 M4.5 15 q2.5 -3 5 0 t5 0 t5 0" stroke-width="1.8"/>',
  hoa: '<path d="M12 4 C15 8 17.5 10.5 16.5 14.5 C15.8 17.5 13.5 19 12 19 C10.5 19 8.2 17.5 7.5 14.5 C7 11.5 9 10 9.5 7.5 C10.5 9 11 10 12 10.5 C12.6 8.5 12.8 6.5 12 4 Z"/>',
  tho: '<path d="M3.5 18.5 L9.5 8 L12.5 12.5 L15 9 L20.5 18.5 Z"/>',
};
function elIcon(el, size = 16) {
  const e = ELEMENTS[el];
  if (!e) return '';
  const png = assetUrl(`hanh_${el}.png`);
  if (png) return `<img class="eli" src="${png}" width="${size}" height="${size}" alt="Hành ${e.name}">`;
  return `<svg class="eli" viewBox="0 0 24 24" width="${size}" height="${size}" aria-label="Hành ${e.name}"><circle cx="12" cy="12" r="11" fill="#1A1208" stroke="${e.color}" stroke-width="1.6"/><circle cx="12" cy="12" r="8.6" fill="none" stroke="${e.color}" stroke-width="0.6" stroke-dasharray="1.2 1.4" opacity=".7"/><g fill="none" stroke="${e.color}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${EL_PATH[el]}</g></svg>`;
}
const elChip = (el) => (el ? `<span class="chip elc" style="border-color:${ELEMENTS[el].color};color:${ELEMENTS[el].color}">${elIcon(el, 14)} ${ELEMENTS[el].name}</span>` : '');
// tên ngắn của một hiệu ứng ẩn (để hiện trong thông báo / Bí truyền)
function secretTitle(key) {
  const d = SECRETS[key];
  if (d.hero) return HEROES[d.hero].name;
  if (d.el) return `Đồ hành ${ELEMENTS[d.el].name}`;
  if (d.item) return ITEMS[d.item].name;
  if (d.set) return SETS[d.set].name;
  if (d.enemy) return ENEMIES[d.enemy].name;
  return '';
}
// dòng hiệu ứng ẩn: đã khám phá thì hiện mô tả, chưa thì "???" + gợi ý
function secretLine(game, key) {
  const d = SECRETS[key];
  if (!d) return '';
  return game.known.has(key)
    ? `<div class="hid ok">${uiIc('da-kham-pha')}<b>✦ Hiệu ứng ẩn:</b> ${esc(d.desc)}</div>`
    : `<div class="hid">${uiIc('an')}<b>??? · Hiệu ứng ẩn</b> <i>“${esc(d.hint)}”</i></div>`;
}

// Ảnh tướng ghép đủ các phần (để làm nút triệu hồi, chân dung nhỏ)
const heroUrlCache = {};
function heroImgUrl(type, crop) {
  // v64: tướng có bộ ảnh vẽ tay → chân dung / dáng đứng từ assets/packs
  if (HERO_PACK[type] && !vectorHeroesOn()) return assetSrc(HERO_PACK[type] + (crop === 'head' ? 'head.png' : 'front.png'));
  const slug = heroSlug(type);
  const png = assetUrl(crop === 'head' ? [`chan-dung_${slug}.png`, `heroes/hero_${HERO_CODE[type]}_B.png`]
    : [`${slug}_thuong.png`, `heroes/hero_${HERO_CODE[type]}_C.png`]);
  if (png) return png;
  const key = type + (crop || '');
  if (heroUrlCache[key]) return heroUrlCache[key];
  if (!HAS_ART || !ART.hero[type]) return '';
  const a = ART.hero[type];
  const vb = crop === 'head' ? '24 12 152 150' : '-30 -30 260 270';
  const body = ['back', 'legs', 'armB', 'body', 'head', 'armF', 'weapon'].map((p) => a[p] || '').join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="260" height="270">${a.defs || ''}${body}</svg>`;
  return (heroUrlCache[key] = svgUrl(svg));
}

// ---------- lưu tiến trình (chỉ trên máy người chơi)
const SAVE_KEY = 'nuicao.v1';
function loadSave() {
  const def = { stars: LEVELS.map(() => 0), unlocked: 1, last: 0, best: {}, storySeen: false,
    lifeGold: 0, lifeKills: 0, lifeHerbs: 0, collected: [], kho: 0, loginChosen: false, owned: [], runes: {}, legacy: {}, heroRunes: {}, tuvi: {},
    settings: { dmgText: true, shake: true, skipStory: false, vectorHeroes: false, detail: false, aiArt: false } };
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
    const out = { ...def, ...s, settings: { ...def.settings, ...(s.settings || {}) } };
    // v48: thêm chương / ải mới → nới mảng sao cho bản lưu cũ
    while (out.stars.length < LEVELS.length) out.stars.push(0);
    out.chSeen = out.chSeen || {};
    // v95: Ấn Phù cũ (chung tài khoản, mua bằng Ngân khố) → hoàn lại Ngân khố; ấn giờ riêng từng tướng, khắc bằng điểm Tu Vi
    if (out.runes && Object.keys(out.runes).length) {
      let back = 0;
      for (const r of RUNES) for (let l = 1; l <= (out.runes[r.id] || 0); l++) back += runeCost(r, l);
      out.kho = (out.kho || 0) + back; out.runeRefund = (out.runeRefund || 0) + back; out.runes = {};
    }
    return out;
  } catch (e) { return def; }
}
function writeSave(s, fromCloud) {
  if (!fromCloud) s.savedAt = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch (e) { /* bỏ qua */ }
  if (!fromCloud && typeof CLOUD !== 'undefined') CLOUD.push(s);   // v65: lưu đám mây (nếu đã cấu hình Firebase)
}

class UI {
  constructor(game) {
    this.game = game;
    this.save = loadSave();
    // v43: mặc định dùng hình tự vẽ (vector); ảnh AI trong assets/ chỉ bật khi chọn trong Cài đặt
    useAssets = !!this.save.settings.aiArt;
    this.scale = 1;
    this.sel = -1;          // ô có tướng đang chọn
    this.spot = -1;         // ô trống đang chọn
    this.armed = null;      // loại tướng chờ đặt
    this.raising = false;   // đang chọn ô để Mọc Núi
    this.moving = -1;       // đang đổi chỗ tướng
    this.sellArmed = false;
    this.screen = null;     // { kind, ... }
    this.sig = {};
    this.refreshT = 0;
    this.coachSlot = -1;
    this.toastList = [];
    game.known = new Set(this.save.secrets || []);
    this.bind();
    this.buildSummon();
    $('#menu-art').innerHTML = svgI(sceneArt('menu'));
    $('#rotate-art').innerHTML = sceneArt('rotate');
    $('#loading').hidden = true;
    this.showMenu();
    // v73: bắt buộc đăng nhập — màn đăng nhập che game tới khi có tài khoản (phiên được nhớ, lần sau vào thẳng)
    if (typeof CLOUD !== 'undefined' && CLOUD.enabled) this.showLogin(false);
    // v65: lưu đám mây — bản trên mây mới hơn thì nạp lại
    if (typeof CLOUD !== 'undefined') {
      CLOUD.onChange(() => {
        if (!$('#settings').hidden) this.renderSettingsCloud();
        if (CLOUD.signedIn && !$('#login').hidden && !this.loginFromMenu) {
          $('#login').hidden = true;
          this.toast('Xin chào ' + (CLOUD.user.displayName || CLOUD.user.email || ''), '#6AE06A');
        } else if (CLOUD.authKnown && !CLOUD.signedIn && !this.offline) this.showLogin(false);
        else if (!$('#login').hidden) this.showLogin(this.loginFromMenu);
        if (!$('#menu').hidden) this.showMenu();
      });
      CLOUD.init(() => this.save, (cs, o) => this.applyCloudSave(cs, o));
    }
  }
  applyCloudSave(cs, owner) {
    const keep = this.save.settings;
    if (!cs) { cs = {}; this.game.started = false; }   // tài khoản mới trên máy đã có tài khoản khác: bắt đầu từ đầu
    cs.owner = owner || cs.owner;
    localStorage.setItem(SAVE_KEY, JSON.stringify(cs));
    this.save = loadSave();
    this.save.settings = { ...this.save.settings, ...keep };   // cài đặt máy này giữ nguyên
    writeSave(this.save, true);
    this.game.known = new Set(this.save.secrets || []);
    if (!this.game.started) this.showMenu();
    this.toast && this.toast('Đã tải tiến trình từ đám mây');
  }
  cloudRow() {
    if (typeof CLOUD === 'undefined') return '';
    const u = CLOUD.user;
    const btn = !CLOUD.enabled ? '' : !u ? '' : u.isAnonymous
      ? '<button class="btn btn-gold" style="height:34px;padding:0 12px;font-size:13px" data-act="cloud-google">Đăng nhập Google</button>'
      : '<button class="btn metal" style="height:34px;padding:0 10px;font-size:13px" data-act="cloud-sync">Đồng bộ ngay</button><button class="btn metal" style="height:34px;padding:0 10px;font-size:13px" data-act="cloud-out">Đăng xuất</button>';
    return `<div class="tg metal" id="cloud-row"><div><b>Lưu đám mây</b><small>${esc(CLOUD.label())}${CLOUD.enabled && u && u.isAnonymous ? ' · Đăng nhập Google để chơi tiếp trên máy khác' : ''}</small></div>
      <div style="margin-left:auto;display:flex;gap:4px">${btn}</div></div>`;
  }
  renderSettingsCloud() { const r = $('#cloud-row'); if (r) r.outerHTML = this.cloudRow(); }

  // ---------- gắn sự kiện
  bind() {
    const g = this.game;
    // Xuất Quân: đang có trận dở thì quay lại trận, không thì mở bản đồ chiến dịch
    $('#btn-continue').onclick = () => {
      const g = this.game;
      if (g.started && !g.over && (!g.won || g.endless)) return this.playLevel(g.level);
      if (this.save.run) return this.resumeRun();
      this.showModes();
    };
    $('#btn-newgame').onclick = () => this.showModes();
    $('#btn-heroes').onclick = () => this.showRoster();
    $('#btn-runes').onclick = () => this.showRunes(false);
    $('#btn-treasury').onclick = () => this.showTreasury();
    $('#btn-ranks').onclick = () => this.showRanks('endless');
    $('#btn-menu-codex').onclick = () => this.openScreen('codex', { top: true });
    $('#btn-settings').onclick = () => this.showSettings(false);
    $('#btn-menu').onclick = () => { $('#drawer').hidden = !$('#drawer').hidden; $('#more').hidden = true; $('#legends').hidden = true; };
    $('#quick-eq').onclick = () => {
      const q = this.quickEq;
      $('#quick-eq').hidden = true;
      if (!q || !g.heroes.includes(q.hero)) return;
      const inst = g.inventory.find((i) => i.uid === q.uid);
      if (!inst) return;
      const r = g.equip(q.hero, inst.uid, slotFor(q.hero, inst));
      if (r === true) this.toast(`${HEROES[q.hero.type].name} đã mặc ${ITEMS[inst.id].name}`, '#6AE06A');
      else this.toast(r, '#E25A3A');
    };
    $('#btn-moc').onclick = () => {
      this.raising = !this.raising;
      this.moving = -1;
      if (this.raising) this.toast('Chạm vào ô ngập hoặc ô đang nhấp nháy xanh để Mọc Núi', '#F2D27A');
    };
    $('#btn-run').onclick = () => {
      if (!g.started || g.over) return;
      if (g.won && !g.endless) return;
      g.running = !g.running;
      if (g.running && g.wave === 0 && !g.waveActive) {
        g.startWave();
        const op = chapterOf(g.level).opener || ['sontinh', 'Nước dâng bao nhiêu, núi cao bấy nhiêu! Các tướng Văn Lang, giữ lấy Phong Châu!'];
        this.say(op[0], op[1]);
      }
    };
    $('#btn-detail').onclick = () => {
      const st = this.save.settings;
      st.detail = !st.detail;
      writeSave(this.save);
      $('#btn-detail').classList.toggle('on', st.detail);
      this.toast(st.detail ? 'Hiện chỉ số chi tiết (tên, cấp, máu, số sát thương)' : 'Chế độ gọn', '#9dffc4');
    };
    $('#btn-detail').classList.toggle('on', !!this.save.settings.detail);
    $('#btn-speed').onclick = () => { g.speed = g.speed === 1 ? 2 : g.speed === 2 ? 3 : 1; };
    $('#nextwaves').onclick = () => {
      if (!$('#nextwaves').classList.contains('early')) return;
      const b = g.callEarly();
      g.running = true;
      if (b) this.toast(`Gọi sớm: +${b} vàng`, '#F2D27A');
    };
    // ủy quyền sự kiện cho các vùng dựng lại liên tục
    for (const id of ['#fuse-strip', '#auto-btns', '#screen', '#deck', '#drawer', '#more', '#reward', '#result', '#story', '#campaign', '#settings', '#legends', '#roster', '#runes', '#treasury', '#prep', '#login', '#ranks', '#modes']) {
      $(id).addEventListener('click', (ev) => {
        const el = ev.target.closest('[data-act]');
        if (el && !el.disabled) this.action(el.dataset, el);
      });
    }
    window.addEventListener('keydown', (ev) => {
      if (!g.started) return;
      const k = ev.key.toLowerCase();
      const h = g.heroes[this.sel];
      if (k === 'escape') return this.screen ? this.closeScreen() : this.clearSel();
      if (this.screen || !h) return;
      if (k === 'u') this.doLevelUp(h);
    });
  }

  // ảnh vẽ tay cho các icon cố định trên thanh trên (vàng, mạng, mực nước)
  applyUiArt() {
    const put = (sel, name) => {
      const u = assetUrl(`ui_${name}.png`), el = $(sel);
      if (!u || !el || el.dataset.art === u) return;
      el.dataset.art = u;
      el.outerHTML = `<img class="tb-ic" src="${u}" alt="" data-art="${u}">`;
    };
    put('#tb-gold > .coin, #tb-gold > .tb-ic', 'dong-vang');
    put('#tb-lives > svg, #tb-lives > .tb-ic', 'mang');
    put('#tb-water > svg, #tb-water > .tb-ic', 'muc-nuoc');
  }

  // ---------- luồng menu
  showMenu() {
    this.hideOverlays();
    $('#menu').hidden = false;
    const s = this.save;
    const total = s.stars.reduce((a, b) => a + b, 0);
    const lv = 1 + Math.floor(Math.sqrt(s.lifeKills / 25));
    const acc = typeof CLOUD !== 'undefined' && CLOUD.user && !CLOUD.user.isAnonymous ? CLOUD.user : null;
    $('#menu-player').innerHTML = `<span class="av">${acc && acc.photoURL ? `<img src="${esc(acc.photoURL)}" alt="" referrerpolicy="no-referrer">` : svgI(sceneArt('drum'))}</span><span><b>${esc(acc ? this.playerName() : 'Sơn Tinh')}</b><small>Cấp ${lv} · ★ ${total}/${LEVELS.length * 3} · ${acc ? 'Đã đăng nhập' : 'Khách'}</small></span>`;
    $('#menu-player').onclick = () => this.showLogin(true);
    if (s.runeRefund) { this.toast(`Ấn Phù giờ riêng từng tướng, khắc bằng điểm Tu Vi. Đã hoàn ${fmt(s.runeRefund)} Ngân khố đã tiêu cho ấn cũ.`, '#E4ECF4'); delete s.runeRefund; writeSave(s); }
    const short = (n) => (n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace('.', ',') + 'k' : n);
    $('#menu-res').innerHTML = `<span title="Ngân khố: bạc thưởng sau mỗi trận, dùng mua tướng Tím / Vàng, Thần Khí, đồ trước trận — không dùng được trong trận"><small class="pr-l">Ngân khố</small>${bac(1)} <b style="color:#E4ECF4">${fmt(s.kho || 0)}</b></span>`;
    if (0) $('#menu-res').innerHTML = `<span title="Tổng vàng đã kiếm qua mọi trận (vàng trong trận luôn bắt đầu từ ${CONFIG.startGold})"><small class="pr-l">Tổng vàng đã kiếm</small>${coin(1)} ${short(s.lifeGold)}</span><span title="Linh Chi đã hái">🌿 ${short(s.lifeHerbs)}</span><span title="Ngân khố: vàng thưởng sau mỗi trận thắng, dùng mua đồ / tướng trước trận"><small class="pr-l">Ngân khố</small>${coin(1)} <b style="color:#FFD66B">${fmt(s.kho || 0)}</b></span>`;
    $('#menu-art').innerHTML = svgI(sceneArt('menu'));
    const g0 = this.game, live = g0.started && !g0.over && (!g0.won || g0.endless);
    const run = !live && s.run;
    const lvN = live ? g0.level : run ? run.level : 0, wN = live ? g0.wave : run ? run.wave : 0, endl = live ? g0.endless : run && run.endless;
    $('#continue-label').textContent = live || run ? `Tiếp tục · Ải ${lvN + 1} · Đợt ${wN}${endl ? ' ♾' : ''}` : 'Xuất Quân';
    $('#btn-newgame').hidden = !(live || run);
    $('#roster-hint').onclick = () => { $('#roster-hint').hidden = true; };
    this.setInGame(false);
  }
  hideOverlays() {
    for (const id of ['#menu', '#story', '#campaign', '#settings', '#result', '#reward', '#roster', '#runes', '#treasury', '#prep', '#login', '#ranks', '#modes']) $(id).hidden = true;
    if (this.needLogin()) this.showLogin(false);   // v73: chưa đăng nhập thì luôn che game
  }
  setInGame(on) {
    document.querySelectorAll('.ingame').forEach((el) => { el.hidden = !on; });
    if (!on) for (const id of ['#legends', '#bossbar', '#coach', '#drawer', '#more', '#deck-hint', '#btn-moc', '#nextwaves', '#quick-eq']) $(id).hidden = true;
  }

  playLevel(i, endless) {
    const g = this.game;
    this.nextEndless = !!endless;    // v99: vào thẳng chế độ vô tận từ ngoài
    // đang chơi dở đúng ải này (cùng chế độ) thì quay lại trận
    if (g.started && !g.over && !g.won && g.level === i && !!g.endless === !!endless) {
      this.hideOverlays();
      this.setInGame(true);
      return;
    }
    const ch = chapterOf(i);
    const seen = ch.classic ? this.save.storySeen : this.save.chSeen && this.save.chSeen[ch.id];
    if (!seen && !this.save.settings.skipStory) return this.showStory(i);
    this.startLevel(i);
  }

  startLevel(i) {
    const g = this.game;
    if (g.started) this.bankStats();
    g.hard = !!this.save.settings.hard;
    g.reset(i);
    g.endless = !!this.nextEndless; this.nextEndless = false;
    g.owned = new Set(this.save.owned || []);
    setRunes(this.save.heroRunes || {});
    setLegacy(this.save.legacy || {});
    g.runId = Date.now();
    g.started = true;
    g.running = false;
    g.speed = 1;
    this.sel = -1; this.spot = -1; this.armed = null; this.raising = false; this.moving = -1;
    this.screen = null;
    $('#screen').hidden = true;
    this.save.last = i;
    writeSave(this.save);
    this.hideOverlays();
    this.setInGame(true);
    this.toast(g.endless ? `Vô tận · ${LEVELS[i].name}: giữ thành càng lâu càng tốt — boss mỗi 10 đợt` : `Ải ${i + 1} · ${LEVELS[i].name}: giữ thành Phong Châu qua ${LEVELS[i].waves} đợt`, '#F2D27A');
    this.prepBought = {}; this.prepShopRolled = false;
    this.saveRun();
    this.showPrep();   // v77: luôn hiện (có Lò đúc đồng trước trận)
  }

  // ---------- v66: Chuẩn bị xuất quân — tiêu Ngân khố mua đồ / vàng / tướng Tím, Vàng trước trận
  showPrep() {
    const s = this.save, g = this.game, b = this.prepBought || {};
    const kho = s.kho || 0;
    const card = (id, title, desc, cost, icon, done) => `<button class="prep-card metal ${done ? 'done' : ''}" data-act="prep-buy" data-id="${id}" ${done || kho < cost ? 'disabled' : ''}>
        <span class="ic">${icon}</span><b>${title}</b><small>${desc}</small><span class="cost">${done ? '✓ Đã mua' : `${bac()} ${fmt(cost)}`}</span></button>`;
    const heroCard = (t) => { const d = HEROES[t], cost = PREP.heroCost[d.legend]; const done = b.hero;
      return `<button class="prep-hero metal ${d.legend} ${b.hero === t ? 'on' : ''}" data-act="prep-hero" data-id="${t}" ${done || kho < cost || !g.freeSlots().length ? 'disabled' : ''}>
        <img src="${heroImgUrl(t, 'head')}" alt=""><b>${d.name}</b><span class="cost">${b.hero === t ? '✓' : `${bac()} ${fmt(cost)}`}</span></button>`; };
    const legends = Object.keys(HEROES).filter((t) => HEROES[t].legend === 'legendary');
    const epics = Object.keys(HEROES).filter((t) => HEROES[t].legend === 'epic');
    $('#prep').innerHTML = `<div class="screen" style="z-index:auto">
      <div class="scr-head metal"><h1 class="ttl">Chuẩn bị xuất quân</h1><span class="chip dark">Ải ${g.level + 1} · ${LEVELS[g.level].name}</span><div class="sp"></div>
        <span class="chip kho">Ngân khố ${bac(1)} ${fmt(kho)}</span>
        <button class="btn btn-gold title" style="height:40px;padding:0 18px;font-size:17px" data-act="prep-go">Vào trận ▶</button></div>
      <div class="prep-body">
        <div class="prep-col"><div class="h">Hậu cần</div>
          ${card('gold', 'Lương thảo', `+${PREP.goldAmount} vàng đầu trận`, PREP.goldCost, '🌾', b.gold)}
          ${card('jar', 'Hũ đồng', 'Mở ngay 2 món Hiếm trở lên vào túi', PREP.jarCost, '🏺', b.jar)}
          ${card('king', 'Hũ Vua Hùng', 'Mở ngay 2 món Sử thi trở lên (35% đồ bộ)', PREP.kingCost, '👑', b.king)}
          ${card('lives', 'Đắp thành', `+${PREP.livesAmount} mạng`, PREP.livesCost, '🧱', b.lives)}
          <button class="prep-card metal" data-act="prep-forge"><span class="ic">⚒</span><b>Lò đúc đồng</b><small>Mua và đúc đồ bằng Ngân khố. Đồ Huyền thoại hiếm và đắt</small><span class="cost">Mở ›</span></button></div>
        <div class="prep-col wide"><div class="h">Tướng đã sở hữu (hợp thể được trong trận)</div>
          <div class="prep-heroes">${LEGEND_HEROES.filter((t) => (this.save.owned || []).includes(t)).map((t) => `<span class="prep-hero metal ${HEROES[t].legend}"><img src="${heroImgUrl(t, 'head')}" alt=""><b>${HEROES[t].name}</b></span>`).join('')
            || '<div class="note">Chưa có tướng Tím / Vàng nào. Mua ở <b>Anh Hùng</b> (menu chính) bằng Ngân khố để hợp thể được trong trận.</div>'}</div></div>
        <div class="prep-col cp-side prep-counter">${this.counterHtml(g.level)}
          <div class="hint-h">QUÂN TRIỆU HỒI ẢI NÀY</div>
          <div class="ch-row">${summonPool(g.level).map((t) => `<span class="ch-av" style="--c:${ELEMENTS[HEROES[t].el].color}" title="${esc(HEROES[t].name)}"><img src="${heroImgUrl(t, 'head')}" alt="${esc(HEROES[t].name)}"><i>${elIcon(HEROES[t].el, 11)}</i></span>`).join('')}</div></div>
      </div>
</div>`;
    $('#prep').hidden = false;
  }
  prepBuy(id) {
    const s = this.save, g = this.game, b = this.prepBought || (this.prepBought = {});
    const cost = { gold: PREP.goldCost, jar: PREP.jarCost, king: PREP.kingCost, lives: PREP.livesCost }[id];
    if (b[id] || (s.kho || 0) < cost) return;
    s.kho -= cost; b[id] = true;
    if (id === 'gold') g.gold += PREP.goldAmount;
    if (id === 'lives') g.lives += PREP.livesAmount;
    if (id === 'jar' || id === 'king') for (let k = 0; k < 2; k++) g.addItem(makeItem(id === 'king' && Math.random() < 0.35 ? rollSetItem() : rollItem(id === 'king' ? 'epic' : 'rare')), true);
    writeSave(s); this.showPrep();
  }
  prepHero(t) {
    const s = this.save, g = this.game, b = this.prepBought || (this.prepBought = {});
    const cost = PREP.heroCost[HEROES[t].legend], slot = g.freeSlots()[0];
    if (b.hero || (s.kho || 0) < cost || slot === undefined) return;
    s.kho -= cost; b.hero = t;
    const h = g.spawnHero(slot, t, {});
    h.from = t; h.lineage = []; h.summonT = 0;
    writeSave(s); this.showPrep();
  }

  // ---------- v74: Tiếp tục / Chơi mới — lưu màn đang chơi vào bản lưu (đồng bộ đám mây)
  saveRun() {
    const g = this.game;
    if (!g.started || g.over || (g.won && !g.endless)) return;
    this.save.run = g.snapshot();
    writeSave(this.save);
  }
  // v77: dừng chơi — bỏ trận đang chơi (không lưu để tiếp tục), ghi điểm vô tận nếu có, về menu
  quitRun() {
    const g = this.game;
    if (g.started) {
      this.bankStats(); const tv = this.bankTuvi(TUVI_LOSE); if (tv.up.length) this.toast(tv.up.join('<br>'), '#FFD66B');
      // v103: dừng trận vẫn nhận Ngân khố như khi thua (4 mỗi đợt đã qua)
      const k = PREP.losePerWave * Math.max(0, g.wave - 1);
      if (k && !g.over) { this.save.kho = (this.save.kho || 0) + k; writeSave(this.save); this.toast(`Ngân khố ${bac(1)} +${fmt(k)} (dừng ở đợt ${g.wave})`, '#E4ECF4'); }
    }
    if (g.endless) { this.submitScores(false, 0); const sv = this.save; sv.bestEndless = sv.bestEndless || {}; sv.bestEndless[g.level] = Math.max(sv.bestEndless[g.level] || 0, g.wave); writeSave(sv); }
    g.running = false; g.over = true; g.started = false;
    this.clearRun();
    this.closeScreen && this.closeScreen();
    this.showMenu();
    this.toast('Đã dừng trận', '#C8BFA8');
  }
  clearRun() { if (this.save.run) { delete this.save.run; writeSave(this.save); } }
  resumeRun() {
    const r = this.save.run;
    if (!r || !LEVELS[r.level]) { this.clearRun(); return this.showCampaign(this.save.last); }
    try { this.game.restore(r); this.game.owned = new Set(this.save.owned || []); setRunes(this.save.heroRunes || {}); setLegacy(this.save.legacy || {}); } catch (e) { this.clearRun(); this.toast('Không nạp được màn đã lưu', '#E25A3A'); return this.showCampaign(this.save.last); }
    this.sel = -1; this.spot = -1; this.armed = null; this.raising = false; this.moving = -1; this.screen = null;
    $('#screen').hidden = true;
    this.hideOverlays(); this.setInGame(true);
    this.toast(`Tiếp tục Ải ${r.level + 1} · ${LEVELS[r.level].name} — từ đợt ${r.wave + 1}`, '#F2D27A');
  }

  // ---------- v72: Bảng xếp hạng (vô tận + từng ải)
  playerName() {
    const u = typeof CLOUD !== 'undefined' && CLOUD.user;
    if (this.save.nick) return this.save.nick;
    if (u && !u.isAnonymous && u.displayName) return u.displayName;
    if (u && !u.isAnonymous && u.email) return u.email.split('@')[0];
    return 'Khách ' + (u ? u.uid.slice(0, 4).toUpperCase() : '');
  }
  submitScores(win, stars) {
    if (typeof CLOUD === 'undefined' || !CLOUD.ready) return;
    const g = this.game, name = this.playerName();
    if (g.endless) {
      // vô tận: điểm = đợt đã vượt; hoà thì ai còn nhiều mạng hơn
      const wave = Math.max(0, g.wave - 1);
      CLOUD.submitScore('endless', wave * 100 + Math.max(0, g.lives), { name, detail: `Đợt ${wave} · Ải ${g.level + 1}${g.hard ? ' · Khó' : ''}` });
    } else if (win) {
      // từng ải: Khó > sao > mạng còn > nhanh hơn
      const sec = Math.round(g.time || 0);
      const score = (g.hard ? 1e7 : 0) + stars * 1e6 + Math.max(0, g.lives) * 1e4 + Math.max(0, 9999 - sec);
      CLOUD.submitScore('lv' + (g.level + 1), score, { name, detail: `${'★'.repeat(stars)} · ${g.lives} mạng · ${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}${g.hard ? ' · Khó' : ''}` });
    }
  }
  async showRanks(board) {
    this.ranksBoard = board;
    const opts = [['endless', '♾ Vô tận'], ...LEVELS.map((l, i) => ['lv' + (i + 1), `Ải ${i + 1} · ${l.name}`])];
    const head = `<div class="scr-head metal"><button class="xbtn metal" data-act="ro-back" aria-label="Quay lại">${ICON.back}</button><h1 class="ttl">Bảng xếp hạng</h1>
      <div class="cp-tabs">${opts.map(([k, n]) => `<button class="cp-tab ${k === board ? 'on' : ''}" data-act="rank-tab" data-k="${k}">${n}</button>`).join('')}</div><div class="sp"></div>
      <button class="btn metal" style="height:34px;padding:0 10px;font-size:13px;flex:none" data-act="rank-nick">✎ ${esc(this.playerName())}</button></div>`;
    const ok = typeof CLOUD !== 'undefined' && CLOUD.enabled;
    $('#ranks').innerHTML = `<div class="screen" style="z-index:auto">${head}<div class="rk-body"><div class="note" style="text-align:center;padding:20px">${ok ? 'Đang tải…' : 'Bảng xếp hạng cần kết nối mạng (lưu đám mây).'}</div></div></div>`;
    $('#ranks').hidden = false;
    if (!ok) return;
    for (let i = 0; i < 20 && !CLOUD.ready && CLOUD.status !== 'error'; i++) await new Promise((r) => setTimeout(r, 300));
    const rows = await CLOUD.topScores(board, 50);
    if (this.ranksBoard !== board || $('#ranks').hidden) return;
    const me = CLOUD.user && CLOUD.user.uid;
    const medal = (i) => (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1);
    const body = !rows ? `<div class="note" style="text-align:center;padding:20px">Không tải được bảng xếp hạng (${esc(CLOUD.error || 'mất mạng')}).</div>`
      : !rows.length ? `<div class="note" style="text-align:center;padding:20px">Chưa có ai ghi tên. ${board === 'endless' ? 'Thắng một ải rồi chọn <b>Chơi vô tận</b> để lên bảng!' : 'Thắng ải này để lên bảng!'}</div>`
      : `<div class="rk-list">${rows.map((r, i) => `<div class="rk-row inset ${r.uid === me ? 'me' : ''}"><span class="rk-n">${medal(i)}</span><b class="rk-name">${esc(r.name || 'Khách')}${r.google ? '' : ' <small>(khách)</small>'}</b><span class="rk-d">${esc(r.detail || '')}</span></div>`).join('')}</div>`;
    $('#ranks .rk-body').innerHTML = body;
  }

  // ---------- v66: Đăng nhập
  needLogin() { return typeof CLOUD !== 'undefined' && CLOUD.enabled && !CLOUD.signedIn && !this.offline; }
  showLogin(fromMenu) {
    this.loginFromMenu = !!fromMenu;
    const C = typeof CLOUD !== 'undefined' ? CLOUD : null;
    const u = C && C.user;
    const signed = C && C.signedIn;
    const mode = this.loginMode || 'in';
    const err = this.loginErr ? `<div class="login-err">${esc(this.loginErr)}</div>` : '';
    let inner;
    if (!C || !C.enabled) inner = '<div class="login-sub">Chưa cấu hình đăng nhập.</div><button class="btn btn-gold title login-btn" data-act="login-offline">Vào game</button>';
    else if (signed) inner = `<div class="login-who">${u.photoURL ? `<img src="${esc(u.photoURL)}" alt="" referrerpolicy="no-referrer">` : ''}<b>${esc(this.playerName())}</b><small>${esc(u.email || '')} · tiến trình lưu trên đám mây</small></div>
        <div class="login-rename"><input id="lg-nick" class="login-in" maxlength="20" placeholder="Tên hiển thị" value="${esc(this.playerName())}"><button class="btn metal" data-act="login-rename">Đổi tên</button></div>
        ${err}
        <button class="btn btn-gold title login-btn" data-act="login-close">Vào game</button>
        <button class="btn metal login-btn" data-act="cloud-out">Đăng xuất</button>`;
    else if (C.status === 'error' && !C.auth) inner = `<div class="login-sub">Không kết nối được máy chủ đăng nhập (${esc(C.error)}).</div>
        <button class="btn btn-gold title login-btn" data-act="login-retry">Thử lại</button>
        <button class="btn metal login-btn" data-act="login-offline">Chơi ngoại tuyến (không lưu xếp hạng)</button>`;
    else if (!C.authKnown) inner = '<div class="login-sub">Đang kiểm tra đăng nhập…</div>';
    else inner = `<div class="login-sub">${u && u.isAnonymous ? 'Đăng nhập để giữ tiến trình đang chơi và vào bảng xếp hạng' : 'Đăng nhập để chơi — tiến trình lưu trên đám mây, chơi tiếp trên máy khác'}</div>
        ${C.native ? '' : `<button class="btn login-btn login-g" data-act="cloud-google"><span class="g">G</span> Đăng nhập bằng Google</button><div class="login-or">hoặc dùng email</div>`}
        <div class="login-tabs"><button class="${mode === 'in' ? 'on' : ''}" data-act="login-mode" data-k="in">Đăng nhập</button><button class="${mode === 'up' ? 'on' : ''}" data-act="login-mode" data-k="up">Tạo tài khoản</button></div>
        ${mode === 'up' ? '<input id="lg-name" class="login-in" maxlength="20" placeholder="Tên hiển thị" autocomplete="nickname">' : ''}
        <input id="lg-email" class="login-in" type="email" placeholder="Email" autocomplete="email" value="${esc(this.loginEmail || '')}">
        <input id="lg-pass" class="login-in" type="password" placeholder="Mật khẩu (ít nhất 6 ký tự)" autocomplete="${mode === 'up' ? 'new-password' : 'current-password'}">
        ${err}
        <button class="btn btn-gold title login-btn" data-act="login-email" ${this.loginBusy ? 'disabled' : ''}>${this.loginBusy ? 'Đang xử lý…' : mode === 'up' ? 'Tạo tài khoản' : 'Đăng nhập'}</button>
        ${mode === 'in' ? '<button class="login-link" data-act="login-reset">Quên mật khẩu?</button>' : ''}`;
    $('#login').innerHTML = `<div class="bgart">${svgI(sceneArt('menu'))}</div><div class="login-box metal">
      <div class="login-logo">Núi Cao Nước Dâng</div>${inner}
      ${fromMenu && signed ? '<button class="xbtn metal login-x" data-act="login-close" aria-label="Đóng">' + ICON.close + '</button>' : ''}</div>`;
    $('#login').hidden = false;
  }


  // ---------- Mở đầu: Vua Hùng kén rể
  showStory(level) {
    this.storyStep = 0;
    this.storyLevel = level;
    this.hideOverlays();
    $('#story').hidden = false;
    this.renderStory();
  }
  renderStory() {
    const st = this.storyStep;
    const ch = chapterOf(this.storyLevel);
    if (!ch.classic) {
      const P = ch.panels;
      $('#story').innerHTML = `<div class="screen" style="z-index:auto">
        <div class="scr-head metal"><span class="ic">${svgI(sceneArt('drum'))}</span><h1 class="ttl">${ch.title}</h1>
          <span class="chip dark">${ch.chip}</span><div class="sp"></div></div>
        <div class="story-panels">${P.map((p, i) => `
          <div class="st-card ${i <= st ? 'on' : ''} ${i === st && i === P.length - 1 ? 'cur' : ''}">
            <div class="well">${svgI(storyScene(p))}<span class="num">${i + 1}</span></div>
            <div class="cap inset">${p.cap}</div>
          </div>`).join('')}</div>
        <div class="story-foot metal">
          <div class="dots">${P.map((_, i) => `<i class="${i === st ? 'on' : ''}"></i>`).join('')}</div>
          <span class="cnt">${st + 1}/${P.length}</span>
          <span class="lead">${P[st].lead}</span>
          <button class="btn metal title" style="height:44px;font-size:18px;padding:0 20px" data-act="story-skip">Bỏ qua</button>
          <button class="btn btn-gold" style="height:46px;font-family:var(--title);font-size:20px;padding:0 24px" data-act="story-next">${st < P.length - 1 ? 'Tiếp' : 'Vào trận'} ▸</button>
        </div></div>`;
      return;
    }
    const caps = [
      '<b>Vua Hùng thứ 18</b> có con gái là công chúa <b>Mị Nương</b>, muốn kén cho nàng một người chồng xứng đáng.',
      '<b>Sơn Tinh</b> và <span class="w">Thủy Tinh</span> cùng đến cầu hôn. Vua ra sính lễ: <b>voi chín ngà, gà chín cựa, ngựa chín hồng mao</b>.',
      'Sơn Tinh mang lễ đến trước, rước <b>Mị Nương</b> về núi. <span class="w">Thủy Tinh</span> đến sau, nổi giận <span class="w">dâng nước</span> đánh Sơn Tinh.',
    ];
    const leads = ['Ngày xưa, ở đất Phong Châu…', 'Ai mang đủ lễ vật đến trước thì được rước dâu.', 'Từ đó, năm nào Thủy Tinh cũng dâng nước đánh Sơn Tinh. Hãy giữ lấy thành Phong Châu!'];
    $('#story').innerHTML = `<div class="screen" style="z-index:auto">
      <div class="scr-head metal"><span class="ic">${svgI(sceneArt('drum'))}</span><h1 class="ttl">Vua Hùng kén rể</h1>
        <span class="chip dark">Truyền thuyết Sơn Tinh – Thủy Tinh</span><div class="sp"></div></div>
      <div class="story-panels">${[0, 1, 2].map((i) => `
        <div class="st-card ${i <= st ? 'on' : ''} ${i === st && i === 2 ? 'cur' : ''}">
          <div class="well">${svgI(sceneArt('story' + (i + 1)))}<span class="num">${i + 1}</span></div>
          <div class="cap inset">${caps[i]}</div>
        </div>`).join('')}</div>
      <div class="story-foot metal">
        <div class="dots">${[0, 1, 2].map((i) => `<i class="${i === st ? 'on' : ''}"></i>`).join('')}</div>
        <span class="cnt">${st + 1}/3</span>
        <span class="lead">${leads[st]}</span>
        <button class="btn metal title" style="height:44px;font-size:18px;padding:0 20px" data-act="story-skip">Bỏ qua</button>
        <button class="btn btn-gold" style="height:46px;font-family:var(--title);font-size:20px;padding:0 24px" data-act="story-next">${st < 2 ? 'Tiếp' : 'Vào trận'} ▸</button>
      </div></div>`;
  }

  // ---------- Bản đồ chiến dịch dọc sông Đà
  // v99: chọn chế độ từ ngoài — Phó bản (chiến dịch theo ải) hoặc Vô tận (chọn bản đồ, chơi mãi)
  showModes() {
    this.hideOverlays();
    this.setInGame(false);
    const s = this.save, total = s.stars.reduce((a, b) => a + b, 0);
    const best = Math.max(0, ...Object.values(s.bestEndless || {}));
    $('#modes').innerHTML = `<div class="screen" style="z-index:auto">
      <div class="scr-head metal"><button class="xbtn metal" data-act="mode-close" aria-label="Quay lại">${ICON.back}</button><h1 class="ttl">Chọn chế độ</h1><div class="sp"></div></div>
      <div class="md-body">
        <button class="md-card metal" data-act="mode-pick" data-k="camp"><span class="md-ic">⚔</span><b>Phó Bản</b>
          <small>Chiến dịch theo chương truyền thuyết. Mỗi ải số đợt cố định, có boss, đạt 1–3 sao, thắng nhận Ngân khố.</small>
          <span class="md-st">★ ${total} / ${LEVELS.length * 3} · đã mở ${s.unlocked}/${LEVELS.length} ải</span></button>
        <button class="md-card metal endl" data-act="mode-pick" data-k="endless"><span class="md-ic">♾</span><b>Vô Tận</b>
          <small>Chọn một bản đồ đã mở, giữ thành mãi mãi. Quái mạnh dần, boss mỗi 10 đợt, đổi bộ quái liên tục. Đua bảng xếp hạng.</small>
          <span class="md-st">Kỷ lục: đợt ${best}</span></button>
      </div></div>`;
    $('#modes').hidden = false;
  }
  showCampaign(sel) {
    this.cpSel = Math.min(sel ?? this.save.last, this.save.unlocked - 1);
    this.hideOverlays();
    this.setInGame(false);
    $('#campaign').hidden = false;
    this.renderCampaign();
  }
  renderCampaign() {
    const s = this.save;
    const i = this.cpSel;
    const lv = LEVELS[i];
    const ch = chapterOf(i);
    const n = ch.to - ch.from + 1;
    // chương Sơn Tinh dùng bản đồ sông Đà vẽ sẵn; chương khác: các ải rải chéo trên nền truyện
    const NODES = ch.classic ? [[60, 330], [140, 286], [225, 246], [292, 182], [367, 200], [432, 140], [506, 102], [608, 62]]
      : Array.from({ length: n }, (_, k) => [110 + k * (420 / Math.max(1, n - 1)), k % 2 ? 150 : 270]);
    const total = s.stars.reduce((a, b) => a + b, 0);
    const bosses = [...new Set(Object.values(lv.bosses))].map((b) => ENEMIES[b].name).join(', ');
    const starsOf = (n) => '★'.repeat(n) + `<i>${'★'.repeat(3 - n)}</i>`;
    const endl = this.cpMode === 'endless';
    $('#campaign').innerHTML = `<div class="screen" style="z-index:auto">
      <div class="scr-head metal"><button class="xbtn metal" data-act="cp-back" aria-label="Quay lại">${ICON.back}</button>
        <h1 class="ttl">${endl ? 'Vô Tận' : 'Phó Bản'}</h1>
        <div class="seg inset cp-mode"><button class="${endl ? '' : 'on'}" data-act="cp-mode" data-k="camp">⚔ Phó bản</button><button class="${endl ? 'on' : ''}" data-act="cp-mode" data-k="endless">♾ Vô tận</button></div>
        ${endl ? '' : `<span class="chip dark">★ ${total} / ${LEVELS.length * 3}</span>`}
        <div class="cp-tabs">${CHAPTERS.map((c, ci) => { const open = c.from < s.unlocked;
          return `<button class="cp-tab ${c === ch ? 'on' : ''} ${open ? '' : 'lock'}" data-act="cp-ch" data-i="${ci}" ${open ? '' : 'disabled'}>${open ? '' : ICON.lock}${ci + 1}. ${c.name}</button>`; }).join('')}</div>
        <div class="sp"></div></div>
      <div class="cp-body">
        <div class="cp-map"><div class="bgart">${ch.classic ? svgI(sceneArt('campaign')) : svgI(storyScene({ bg: ch.bg }))}</div>
          ${ch.classic ? '' : `<svg class="cp-trail" viewBox="0 0 640 382" preserveAspectRatio="none"><polyline points="${NODES.map(([x, y]) => `${x},${y}`).join(' ')}" fill="none" stroke="#F2D27A" stroke-width="4" stroke-dasharray="10 8" opacity="0.8"/></svg>`}
          ${NODES.map(([x, y], kk) => { const k = ch.from + kk;
            const lock = k >= s.unlocked;
            return `<button class="cp-node ${lock ? 'lock' : ''} ${k === i ? 'sel' : ''}" style="left:${x / 640 * 100}%;top:${y / 382 * 100}%" data-act="cp-sel" data-i="${k}" ${lock ? 'disabled' : ''}>
              <span class="stars">${lock ? '' : starsOf(s.stars[k])}</span>
              <span class="c">${lock ? ICON.lock : k + 1}</span>
              <span class="lb">${k + 1} · ${LEVELS[k].name}</span></button>`;
          }).join('')}
        </div>
        <div class="cp-side">
          <div class="hd"><span class="no">Ải ${i + 1}</span><span class="ttl">${lv.name}</span><span class="op">${s.stars[i] ? '★'.repeat(s.stars[i]) : 'Đang mở'}</span></div>
          ${endl ? `<div class="sub">Vô tận · quái mạnh dần mãi · boss mỗi 10 đợt</div>
          <div class="desc">Sau ${lv.waves} đợt, cứ 10 đợt đổi bộ quái mới. Hết mạng là thua; ghi điểm bảng xếp hạng.</div>
          <div class="cp-rec">♾ Kỷ lục bản đồ này: <b>đợt ${(s.bestEndless || {})[i] || 0}</b></div>`
          : `<div class="sub">${lv.waves} đợt · boss <b>${bosses}</b></div>
          <div class="desc">${lv.desc}</div>
          <div class="cond inset"><div class="h">ĐIỀU KIỆN SAO</div>
            ${STAR_RULES.map((r, k) => `<div class="${s.stars[i] > k ? 'got' : ''}"><span>${'★'.repeat(k + 1)}</span><span>${r}</span></div>`).join('')}</div>`}
          ${this.counterHtml(i)}
          <div class="cp-act"><div class="cp-diff"><button class="${this.save.settings.hard ? 'metal' : 'btn-gold'}" data-act="diff" data-k="0">Thường</button><button class="${this.save.settings.hard ? 'on' : 'metal'}" data-act="diff" data-k="1" title="Máu quái ×${HARD.hp(i).toFixed(2)}">🔥 Khó${(s.hardStars || [])[i] ? ` <small>${'★'.repeat(s.hardStars[i])}</small>` : ` <small>×${HARD.hp(i).toFixed(2).replace('.', ',')}</small>`}</button></div>
          <button class="go btn-gold" data-act="cp-go">${endl ? '♾ Vào vô tận' : '⚔ Vào trận'}</button></div>
        </div>
      </div></div>`;
  }

  // ---------- Cài đặt / tạm dừng
  showSettings(inGame) {
    const g = this.game;
    this.pauseWasRunning = inGame && g.running;
    if (inGame) g.running = false;
    $('#settings').hidden = false;
    this.settingsInGame = inGame;
    this.renderSettings();
  }
  renderSettings() {
    const st = this.save.settings;
    const inGame = this.settingsInGame;
    const tg = (k, name, desc) => `<div class="tg metal"><div><b>${name}</b><small>${desc}</small></div><button class="sw ${st[k] ? 'on' : ''}" style="margin-left:auto" data-act="set" data-k="${k}" aria-label="${name}"></button></div>`;
    $('#settings').innerHTML = `<div class="screen" style="z-index:auto">
      <div class="scr-head metal"><h1 class="ttl">${inGame ? 'Tạm dừng' : 'Cài đặt'}</h1>${inGame ? `<span class="chip dark">Ải ${this.game.level + 1} · ${LEVELS[this.game.level].name} · Đợt ${this.game.wave}</span>` : ''}<div class="sp"></div>
        <button class="xbtn metal" data-act="set-close" aria-label="Đóng">${ICON.close}</button></div>
      <div class="set-list">
        ${inGame ? `<div style="display:flex;gap:10px">
          <button class="btn btn-gold" style="flex:1.3;height:48px;font-family:var(--title);font-size:18px" data-act="set-close">▶ Tiếp tục</button>
          <button class="btn metal title" style="flex:1;height:48px;font-size:16px" data-act="restart">Chơi lại</button>
          <button class="btn metal title" style="flex:1;height:48px;font-size:16px" data-act="to-map">Bản đồ</button>
          <button class="btn metal title" style="flex:1;height:48px;font-size:16px" data-act="to-menu">Menu chính</button></div>` : ''}
        ${tg('dmgText', 'Hiện số sát thương', 'Số bay lên khi tướng đánh trúng quái')}
        ${tg('shake', 'Rung màn hình', 'Rung khi boss quẫy đuôi và khi tung chiêu tối thượng')}
        ${tg('skipStory', 'Bỏ qua cốt truyện', 'Không hiện màn Vua Hùng kén rể trước trận')}
        ${tg('aiArt', 'Dùng ảnh AI (thử nghiệm)', 'Tắt: toàn bộ hình do game tự vẽ. Bật: dùng ảnh tạo bằng AI trong thư mục assets/ (tải lại trang)')}
        ${tg('vectorHeroes', 'Tướng vẽ nét (thấy từng món đồ)', 'Tắt: dùng ảnh vẽ tay, đồ mặc đổi theo bậc trang phục. Bật: hình vẽ nét, mũ / giáp / vũ khí hiện riêng từng món')}
        <div class="tg metal"><div><b>Cỡ chữ & nút</b><small>Phóng to thanh trên, thanh tướng, nút và thông báo trong trận. Tự động: điện thoại to thêm 20%</small></div>
          <div style="margin-left:auto;display:flex;gap:4px">${[['auto', 'Tự động'], ['s', 'Vừa'], ['m', 'To'], ['l', 'Rất to']].map(([k, n]) => `<button class="btn ${(st.uiSize || 'auto') === k ? 'btn-gold' : 'metal'}" style="height:34px;padding:0 10px;font-size:13px" data-act="set-uisize" data-k="${k}">${n}</button>`).join('')}</div></div>
        <div class="tg metal"><div><b>Đồ hoạ</b><small>Tự động: game tự giảm độ nét và hiệu ứng khi máy bị giật${typeof GFX !== 'undefined' && GFX.mode() === 'auto' && GFX.lv ? ` (đang giảm ${GFX.lv} bậc)` : ''}</small></div>
          <div style="margin-left:auto;display:flex;gap:4px">${[['auto', 'Tự động'], ['high', 'Đẹp'], ['low', 'Tiết kiệm']].map(([k, n]) => `<button class="btn ${(st.gfx || 'auto') === k ? 'btn-gold' : 'metal'}" style="height:34px;padding:0 10px;font-size:13px" data-act="set-gfx" data-k="${k}">${n}</button>`).join('')}</div></div>
        ${this.cloudRow()}
        <div class="tg metal"><div><b>Xoá tiến trình</b><small>Xoá sao và các ải đã mở trên máy này</small></div>
          <button class="btn metal" style="margin-left:auto;color:#FFB08A;border-color:#C8401E" data-act="wipe">${this.wipeArmed ? 'Bấm lần nữa để xoá' : 'Xoá'}</button></div>
        <div class="note" style="text-align:center">Núi Cao Nước Dâng · Phiên bản 115 · ${typeof CLOUD !== 'undefined' && CLOUD.enabled ? 'Tiến trình lưu trên máy và đám mây' : 'Tiến trình lưu trên trình duyệt của bạn'}</div>
      </div></div>`;
  }

  // ---------- thông báo
  toast(msg, color = '#F2D27A') {
    const box = $('#toasts');
    const el = document.createElement('div');
    el.className = 'toast';
    el.style.borderLeftColor = color;
    el.innerHTML = msg;
    box.appendChild(el);
    while (box.children.length > 2) box.firstChild.remove();
    setTimeout(() => el.remove(), 2600);
  }

  // ---------- chạm bản đồ
  slotAt(x, y) {
    let best = -1, bd = Infinity;
    CONFIG.slots.forEach(([sx, sy], i) => {
      const h = this.game.heroes[i];
      const d = h ? Math.min(Math.hypot(sx - x, sy - 26 - y), Math.hypot(sx - x, sy - y)) : Math.hypot(sx - x, sy - y);
      if (d < 34 && d < bd) { bd = d; best = i; }
    });
    return best;
  }

  clearSel() {
    this.sel = -1; this.spot = -1; this.armed = null; this.raising = false; this.moving = -1; this.sellArmed = false;
  }

  tapMap(x, y) {
    const g = this.game;
    if (!g.started) return;
    this.bossSel = null;
    $('#legends').hidden = true;
    $('#drawer').hidden = true;
    $('#more').hidden = true;
    const slot = this.slotAt(x, y);
    if (this.raising) {
      if (slot >= 0 && g.canRaise(slot)) {
        const r = g.raiseSpot(slot);
        if (r !== true) this.toast(r, '#E25A3A');
        else this.toast('Mọc Núi! Ô này khô ráo vĩnh viễn', '#F2D27A');
      }
      this.raising = false;
      return;
    }
    if (this.moving >= 0) {
      if (slot >= 0 && slot !== this.moving && g.heroes[this.moving]) this.dropOn(this.moving, slot);
      this.moving = -1;
      return;
    }
    if (slot < 0) { this.sel = -1; this.spot = -1; this.armed = null; return; }
    if (g.heroes[slot]) {
      this.sel = slot;
      this.fuseFocus = null;
      this.spot = -1;
      this.armed = null;
      this.sellArmed = false;
      return;
    }
    if (this.armed) return this.place(this.armed, slot);
    this.spot = -1;
    this.sel = -1;
  }

  // ---------- v34: triệu hồi ngẫu nhiên · ghép · hợp thể
  summonRand() {
    const g = this.game;
    const r = g.summonRandom();
    if (typeof r === 'string') return this.toast(r, '#E25A3A');
    const h = g.heroes[r];
    this.toast(`Triệu hồi: ${HEROES[h.type].name} ★`, '#6AE06A');
    this.spot = -1;
    // gợi ý ghép khi có 2 tướng giống nhau
    const twin = g.heroes.find((o) => o && o !== h && g.canMerge(h, o) === true);
    if (twin && !g.flags.mergeTip) {
      g.flags.mergeTip = true;
      setTimeout(() => this.toast(`Có 2 ${HEROES[h.type].name} ★: kéo 1 con thả lên con kia để lên ★★`, '#FFD66B'), 700);
    }
  }
  // kéo tướng ở ô `from` thả lên ô `to`: ghép / hợp thể / đổi chỗ
  dropOn(from, to) {
    const g = this.game;
    const a = g.heroes[from], b = g.heroes[to];
    if (!a) return;
    if (b) {
      if (g.canMerge(a, b) === true) { g.merge(from, to); this.sel = to; return; }
      const f = fusionFor(a.type, b.type);
      if (f) {
        const ok = g.canFuse(a, b);
        if (typeof ok === 'string') return this.toast(`Hợp thể ${HEROES[f.to].name}: ${ok}`, '#E25A3A');
        g.fuse(from, to); this.sel = to; return;
      }
      if (a.type === b.type && !a.from) return this.toast(g.canMerge(a, b), '#E25A3A');
    }
    const name = HEROES[a.type].name;
    g.moveHero(from, to);
    this.sel = to;
    this.toast(b ? `${name} đổi chỗ với ${HEROES[b.type].name}` : `${name} chuyển sang ô mới`, '#9dffc4');
  }
  // nút "Ghép" trong menu tướng: tìm 1 tướng cùng loại cùng sao, gộp vào tướng đang chọn
  mergeAny() {
    const g = this.game;
    const h = g.heroes[this.sel];
    if (!h) return;
    const o = g.heroes.find((x) => x && x !== h && g.canMerge(x, h) === true);
    if (!o) return this.toast('Chưa có tướng cùng loại cùng sao để ghép', '#E25A3A');
    g.merge(o.slot, h.slot);
    $('#more').hidden = true;
  }
  fuseWith(slot) {
    const g = this.game;
    const h = g.heroes[this.sel];
    if (!h || !g.heroes[slot]) return;
    const r = g.fuse(slot, h.slot);
    if (r !== true) return this.toast(r, '#E25A3A');
    $('#more').hidden = true;
    if (this.screen) this.closeScreen();
  }

  pickSummon(type) {
    if (this.spot >= 0) return this.place(type, this.spot);
    this.armed = this.armed === type ? null : type;
    if (this.armed) this.toast(`Chạm vào ô trống để triệu hồi ${HEROES[type].name}`, '#F2D27A');
  }

  place(type, slot) {
    const g = this.game;
    const ok = g.canPlace(slot, type);
    if (ok !== true) return this.toast(ok, '#E25A3A');
    g.placeHero(slot, type);
    this.toast(`${HEROES[type].name} đã vào vị trí`, '#6AE06A');
    this.spot = -1;
    this.armed = null;
    this.sel = slot;
    $('#legends').hidden = true;
    if (g.heroes.filter(Boolean).length === 2 && !g.flags.dragTip) {
      g.flags.dragTip = true;
      setTimeout(() => this.toast('Mẹo: giữ và kéo tướng sang ô khác để đổi vị trí', '#9dffc4'), 900);
    }
  }

  doLevelUp(h) {
    const r = this.game.levelUp(h);
    if (r !== true) this.toast(r, '#E25A3A');
  }

  // ---------- bảng triệu hồi
  buildSummon() {
    // hàng thẻ dưới đáy dựng trong updateDeck; ở đây dựng bảng "Cây thăng thần"
    // công thức hợp thể: 2 tướng ★★★ → thần Sử thi; 2 thần tím Thần tinh ★★★ → Huyền thoại
    const card = (t, cls = '') => `<span class="asc-to ${HEROES[t].legend || 'base'} ${cls}"><img src="${heroImgUrl(t, 'head')}" alt=""><b>${HEROES[t].name}</b></span>`;
    const row = (f) => `<div class="asc-row fz">${card(f.a)}<span class="asc-plus">+</span>${card(f.b)}<span class="asc-arr ${HEROES[f.to].legend === 'legendary' ? 'leg' : ''}">➜<small>${COSTS.ascend[HEROES[f.to].legend]}</small></span>${card(f.to, 'res')}</div>`;
    $('#lg-grid').innerHTML = `<div class="fz-col"><div class="fz-h">Thường ★★★ + Thường ★★★ → <b style="color:${RARITY.epic.color}">Sử thi</b></div>${FUSION.filter((f) => HEROES[f.to].legend === 'epic').map(row).join('')}</div>
      <div class="fz-col"><div class="fz-h">Thần tinh ★★★ + Thần tinh ★★★ → <b style="color:${RARITY.legendary.color}">Huyền thoại</b></div>${FUSION.filter((f) => HEROES[f.to].legend === 'legendary').map(row).join('')}</div>`;
  }

  renderLegends() {
    const g = this.game;
    $('#lg-count').textContent = `Huyền thoại trên sân ${g.legendCount()}`;
    $('#lg-info').innerHTML = 'Triệu hồi ra tướng ★ ngẫu nhiên. <b>Kéo 2 tướng cùng loại cùng sao vào nhau</b> để lên ★★, ★★★. Hai tướng ★★★ đúng công thức, kỹ năng tối đa, <b>kéo vào nhau để hợp thể</b> (hoặc chạm tướng → Hợp thể). Thần mới giữ cấp, đồ và nội tại của cả hai.';
  }

  // ============================================================
  //  CẬP NHẬT MỖI KHUNG HÌNH
  // ============================================================
  tick(dt) {
    const g = this.game;
    this.handleEvents();
    this.abT = (this.abT || 0) - dt;
    if (this.abT <= 0 && g.started) { this.abT = 1; this.updateAutoBtns(); }
    if (this.assetSeen !== assetVersion) {
      // có ảnh vẽ tay mới tải xong: vẽ lại các phần dùng ảnh
      this.assetSeen = assetVersion;
      this.applyUiArt();
      this.sig = {};
      this.buildSummon();
      if (!$('#menu').hidden) this.showMenu();
    }
    this.collectT = (this.collectT || 0) - dt;
    if (g.started && this.collectT <= 0) {
      this.collectT = 2;
      const have = new Set(this.save.collected);
      const n0 = have.size;
      for (const i of g.inventory) have.add(i.id);
      for (const h of g.heroes) if (h) for (const sl of SLOTS) if (h.equip[sl]) have.add(h.equip[sl].id);
      if (have.size !== n0) { this.save.collected = [...have]; writeSave(this.save); }
    }
    if (!g.started) return;
    const inGame = $('#menu').hidden && $('#campaign').hidden && $('#story').hidden && $('#roster').hidden && $('#runes').hidden && $('#treasury').hidden && $('#modes').hidden;
    if (!inGame) return;
    this.updateTopbar();
    this.updateNextWaves();
    this.updateFuseStrip();
    this.updateBoss();
    this.checkRosterHint();
    this.updateDeck();
    this.updateCoach();
    if (!$('#legends').hidden) this.renderLegends();
    $('#paused-tag').hidden = g.running || g.wave === 0 || g.over || !!this.screen || !$('#settings').hidden;
    if (this.screen) {
      this.refreshT -= dt;
      if (this.refreshT <= 0) { this.refreshT = 0.25; this.renderScreen(false); }
      this.liveScreen();
    }
  }

  handleEvents() {
    const g = this.game;
    while (g.events.length) {
      const ev = g.events.shift();
      if (ev.type === 'newEnemy') {
        const d = ENEMIES[ev.enemy];
        this.toast(`<b>Quái mới: ${d.name}</b> · ${d.short || d.desc}`, d.boss ? '#E25A3A' : '#5AB4D6');
      } else if (ev.type === 'kho') {
        // v103: Ngân khố kiếm giữa trận (Vô tận) — cộng thẳng vào tài khoản
        this.save.kho = (this.save.kho || 0) + ev.n; g.khoRun = (g.khoRun || 0) + ev.n; writeSave(this.save);
        this.toast(`Ngân khố ${bac(1)} +${fmt(ev.n)} · ${esc(ev.why)}`, '#E4ECF4');
      } else if (ev.type === 'reward') {
        this.showReward(ev);
      } else if (ev.type === 'boss') {
        this.banner(ev.champion ? 'Quái khổng lồ' : 'Boss xuất hiện', ev.name);
        if (ev.enemy) this.say(ev.enemy, BOSS_LINES[ev.enemy]);
      } else if (ev.type === 'flood') {
        this.say('thuytinh', ev.level >= 2 ? 'Nước dâng cao nữa! Xem núi của ngươi cao được bao nhiêu!' : 'Sơn Tinh! Ta dâng nước nhấn chìm Phong Châu!');
      } else if (ev.type === 'secret') {
        this.save.secrets = [...g.known];
        writeSave(this.save);
        this.toast(`<b>Đã khám phá!</b> ${secretTitle(ev.key)}: ${esc(SECRETS[ev.key].desc)}`, '#FFD66B');
      } else if (ev.type === 'upgrade') {
        // đồ vừa rơi tốt hơn cho một tướng: hiện nút đeo nhanh vài giây
        const inst = g.inventory.find((i) => i.uid === ev.uid);
        if (inst && g.heroes.includes(ev.hero)) {
          this.quickEq = { uid: ev.uid, hero: ev.hero };
          const b = $('#quick-eq');
          b.innerHTML = `<span class="slot ${rarCls(inst.rarity)}">${svgI(itemIcon(inst.id))}</span><span><b>▲ Đeo cho ${HEROES[ev.hero.type].name}</b><small>${ITEMS[inst.id].name} · +${ev.gain} lực chiến</small></span>`;
          b.hidden = false;
          clearTimeout(this.quickT);
          this.quickT = setTimeout(() => { b.hidden = true; }, 9000);
        }
      } else if (ev.type === 'ascend') {
        this.banner('Thăng thần', `${ev.from} hóa thân ${ev.to}`);
        this.toast(`<b>${ev.to}</b>: ${esc(HEROES[ev.hero.type].trait.name)} · ${esc(HEROES[ev.hero.type].trait.desc)}`, '#F0A030');
        this.sig.deck = null;
      } else if (ev.type === 'setDone') {
        this.banner(`${HEROES[ev.hero.type].name} mặc đủ bộ`, ev.name);
      } else if (ev.type === 'checkpoint') {
        this.saveRun();
      } else if (ev.type === 'victory') {
        this.finishLevel(true);
      } else if (ev.type === 'defeat') {
        this.finishLevel(false);
      }
    }
  }

  // Hộp thoại có ảnh nhân vật (theo bản thiết kế mobile)
  say(who, text) {
    if (!text) return;
    const box = $('#dialogue');
    const foe = !!ENEMIES[who];
    const name = foe ? ENEMIES[who].name : who === 'sontinh' ? 'Sơn Tinh' : HEROES[who] ? HEROES[who].name : who;
    box.className = foe ? 'foe' : 'ally';
    const av = foe ? '<canvas width="108" height="124"></canvas>' : HEROES[who] ? `<img src="${heroImgUrl(who, 'head')}" alt="">` : svgI(sceneArt('drum'));
    box.innerHTML = `<div class="dav">${av}</div><div><h4>${esc(name)}</h4><p>“${esc(text)}”</p></div>`;
    if (foe) drawEnemyIcon(box.querySelector('canvas'), who, 0.04);
    box.hidden = false;
    clearTimeout(this.sayT);
    this.sayT = setTimeout(() => { box.hidden = true; }, 3000);
  }

  banner(sub, text) {
    $('#banner-sub').textContent = sub;
    $('#banner-text').textContent = text;
    const b = $('#banner');
    b.hidden = false;
    b.style.animation = 'none';
    void b.offsetWidth;
    b.style.animation = '';
    clearTimeout(this.bannerT);
    this.bannerT = setTimeout(() => { b.hidden = true; }, 2600);
  }

  setHTML(sel, key, html) {
    if (this.sig[sel] === key) return;
    this.sig[sel] = key;
    $(sel).innerHTML = html;
  }
  setText(sel, v) {
    const el = $(sel);
    if (el.textContent !== String(v)) el.textContent = v;
  }

  updateTopbar() {
    const g = this.game;
    const total = g.levelWaves;
    this.setText('#tb-wave', (g.endless ? `Đợt ${g.wave} · Vô tận` : `Đợt ${g.wave} / ${total}`) + (g.hard ? ' · 🔥 Khó' : ''));
    const prog = g.waveActive && g.waveTotal ? 1 - (g.spawnQueue.length + g.enemies.length * 0.5) / (g.waveTotal * 1.5) : 0;
    $('#tb-fill').style.width = `${Math.max(0, Math.min(1, ((g.wave - 1 + Math.max(0, prog)) / total))) * 100}%`;
    this.setText('#tb-gold b', fmt(g.gold));
    $('#tb-gold').classList.toggle('kho', !!this.prepForge);     // v95: đang tiêu Ngân khố (bạc), không phải vàng trận
    this.setText('#tb-lives b', g.lives);
    this.setText('#tb-water b', `${g.water}/3`);
    // thanh mực nước: tiến tới lần dâng nước kế (sau đợt boss tiếp theo)
    let prev = 0, next = 0;
    for (let n = 1; n <= Math.max(g.levelWaves, g.wave + 10); n++) {
      if (!bossAt(n, g.level)) continue;
      if (n <= g.wave && !(n === g.wave && g.waveActive)) prev = n; else { next = n; break; }
    }
    const fill = g.water >= 3 ? 1 : next ? Math.max(0, Math.min(1, (g.wave - prev) / (next - prev))) : 1;
    $('#tb-flood').style.width = `${fill * 100}%`;
    $('#btn-speed').textContent = 'x' + g.speed;
    $('#btn-speed').classList.toggle('on', g.speed > 1);
    const run = $('#btn-run');
    run.classList.toggle('go', !g.running);
    $('#run-icon').setAttribute('d', g.running ? 'M5 5 H15 V15 H5 Z' : 'M6 4 L16 10 L6 16 Z');
    run.setAttribute('aria-label', g.running ? 'Dừng' : 'Bắt đầu');
    // chấm xanh trên ≡ khi có việc nên làm (hái Linh Chi)
    $('#menu-dot').hidden = true;      // v92: bỏ Núi Tản Viên (không còn Linh Chi để hái)
    if (!$('#drawer').hidden) this.setText('#dw-bag', `${g.inventory.length}/${CONFIG.bagSize} ô`);
  }

  // Dải gợi ý hợp thể (trên cùng): ảnh thần mờ + % tiến độ; đủ 100% thì sáng, bấm để hợp thể
  updateFuseStrip() {
    const g = this.game;
    const el = $('#fuse-strip');
    if (!g.started || g.over) { el.innerHTML = ''; return; }
    if ((this.fsT = (this.fsT || 0) + 1) % 10) return;      // 6 lần / giây là đủ
    // v89: một luật chung: chỉ gợi ý tướng tài khoản đã mua và tiến độ ≥ 75%; tướng vàng còn cần có thần tím trong công thức trên bản đồ.
    const onMap = new Set(g.heroes.filter(Boolean).map((h) => h.type));
    const list = FUSION.map((f, i) => ({ f, i, ...g.fusionProgress(f) })).filter((x) => {
      if (!g.ownsHero(x.f.to) || x.p < 0.75) return false;
      return HEROES[x.f.to].legend !== 'legendary' || onMap.has(x.f.a) || onMap.has(x.f.b);
    }).sort((a, b) => b.p - a.p).slice(0, 6);
    const key = list.map((x) => x.i + ':' + Math.floor(x.p * 100) + (x.p >= 1 && typeof g.canFuse(x.a, x.b) !== 'string' ? '!' : '')).join(',') + '|' + assetVersion;
    if (this.sig.fuse === key) return;
    this.sig.fuse = key;
    el.innerHTML = list.map((x) => {
      const d = HEROES[x.f.to], pct = Math.floor(x.p * 100);
      const go = x.p >= 1 && typeof g.canFuse(x.a, x.b) !== 'string';
      return `<button class="fz-card ${d.legend} ${go ? 'go' : ''}" data-act="fuse-strip" data-i="${x.i}" title="${esc(HEROES[x.f.a].name + ' + ' + HEROES[x.f.b].name + ' → ' + d.name)}" style="--p:${pct}%">
        <img src="${heroImgUrl(x.f.to, 'head')}" alt=""><span class="pc">${go ? 'HỢP!' : pct + '%'}</span></button>`;
    }).join('');
  }

  // Một dải nhỏ dưới thanh trên: đợt kế (giữa hai đợt thì kèm nút Gọi sớm)
  updateNextWaves() {
    const g = this.game;
    const el = $('#nextwaves');
    const lim = g.endless ? Infinity : g.levelWaves;
    let html = '', early = false;
    const kindTxt = (n) => {
      const k = waveKind(n, g.level);
      if (k === 'boss') return `<span class="boss">Boss ${ENEMIES[bossAt(n, g.level)].name}</span>`;
      if (k === 'air') return 'Chim Bão <span class="air">(bay)</span>';
      if (k === 'champion') return 'Rùa khổng lồ';
      return '';
    };
    if (g.wave > 0 && g.wave + 1 <= lim) {
      if (!g.waveActive && g.running) {
        early = true;
        html = `<b>Đợt ${g.wave + 1}</b> sau ${Math.ceil(Math.max(0, g.nextWaveT))}s ${kindTxt(g.wave + 1)}<span class="go">${uiIc('goi-som')}Gọi sớm +${g.earlyBonus()}</span>`;
      } else {
        const t = kindTxt(g.wave + 1);
        if (t) html = `<b>Đợt ${g.wave + 1}:</b> ${t}`;
      }
    }
    if (g.floodSoon() >= 0) html += `${html ? ' · ' : ''}<span class="flood">💧 Nước sắp dâng: thêm ${FLOOD_PER_RISE} ô sát sông ngập</span>`;
    el.classList.toggle('early', early);
    this.setHTML('#nextwaves', html, html);
    el.hidden = !html;
  }

  // v91: bấm vào bất kỳ quái nào → bảng thông tin quái góc trái (boss dễ bấm hơn)
  tapBoss(x, y) {
    const g = this.game;
    let best = null, bd = 1e9;
    for (const e of g.enemies) {
      if (e.dead) continue;
      const big = e.def.boss || e.champion || e.def.general;
      const box = enemyBox(e), lift = e.def.flying ? 24 : 0;
      const cx = e.x, cy = e.y - lift - box.h * 0.45;
      const dd = Math.hypot(x - cx, y - cy) - (big ? 12 : 0);
      if (dd < Math.max(big ? 40 : 24, box.w * (big ? 0.6 : 0.5)) && dd < bd) { best = e; bd = dd; }
    }
    this.bossSel = best;
    this.sig.foe = '';
    return !!best;
  }
  updateBoss() {
    const b = this.bossSel && !this.bossSel.dead && this.game.enemies.includes(this.bossSel) ? this.bossSel : null;
    if (!b) this.bossSel = null;
    $('#bossbar').hidden = !b;
    $('#ui').classList.toggle('foe-on', !!b);
    if (!b) return;
    const d = b.def;
    const st = [b.poisonT > 0 && 'Thiêu đốt', b.stunT > 0 && (b.stunKind === 'ice' ? 'Đóng băng' : 'Choáng'), (b.slowT > 0 || b.zoneSlow > 0) && 'Chậm', b.silenceT > 0 && 'Câm lặng'].filter(Boolean);
    const key = b.id + '|' + (b.enraged ? 1 : 0) + (b.el || '') + Math.round(b.armor) + '|' + Math.round(b.mr) + st.join();
    if (this.sig.foe !== key) {
      this.sig.foe = key;
      const tag = d.boss ? 'Boss' : d.general ? 'Tướng địch' : b.champion ? 'Khổng lồ' : b.elite ? 'Tinh anh' : d.variant ? 'Biến thể' : d.flying ? 'Bay' : '';
      this.setText('#bb-name', b.champion ? `${d.name} khổng lồ` : d.name);
      $('#bb-tag').textContent = tag;
      $('#bossbar').className = d.boss || d.general || b.champion ? 'big' : b.elite || d.variant ? 'elite' : '';
      const el = b.el && ELEMENTS[b.el];
      const by = el ? EL_ORDER.find((k) => EL_KHAC[k] === b.el) : null;
      const chips = [
        `<span>🛡 Giáp <b>${Math.round(b.armor)}</b></span>`, `<span>🔮 Kháng phép <b>${Math.round(b.mr)}%</b></span>`,
        `<span>👣 Tốc <b>${Math.round(d.speed)}</b></span>`, `<span>🪙 <b>${d.gold}</b></span>`,
        el ? `<span style="color:${el.color}">Hành <b>${el.name}</b>${by ? ` · bị ${ELEMENTS[by].name} khắc` : ''}</span>` : '',
        b.enraged ? '<span style="color:#FF8A6A">Đang hóa điên</span>' : '',
        ...st.map((x) => `<span class="fst">${x}</span>`),
      ].filter(Boolean).join('');
      $('#bb-info').innerHTML = `<div class="fc">${chips}</div>${d.short ? `<div class="fs">${esc(d.short)}</div>` : ''}`;
    }
    this.setText('#bb-hp', `${fmt(Math.max(0, b.hp))} / ${fmt(b.maxHp)}${b.shield > 0 ? ` · khiên ${fmt(b.shield)}` : ''}${b.reviveT > 0 ? ' · đang lặn' : ''}`);
    $('#bb-fill').style.width = `${Math.max(0, b.hp / b.maxHp) * 100}%`;
  }

  // ---------- hàng thẻ dưới đáy: thẻ triệu hồi, hoặc thẻ tướng đang chọn
  updateDeck() {
    const g = this.game;
    const h = g.heroes[this.sel];
    if (!h) this.sel = -1;
    const deck = $('#deck');
    let key, html;
    if (!h) {
      const sc = g.summonCost(), can = g.canSummon() === true;
      key = `s|${sc}|${can}|${g.freeSlots().length}|${assetVersion}`;
      // 6 chân dung nhỏ: tướng có thể ra khi triệu hồi
      const pool = summonPool(g.level).map((t) => `<img src="${heroImgUrl(t, 'head')}" alt="" title="${HEROES[t].name}">`).join('');
      const pairs = g.heroes.filter((x) => x && g.heroes.some((y) => y && y !== x && g.canMerge(x, y) === true)).length;
      key += `|${pairs}`;
      html = `${pairs ? `<button class="dk-auto metal on" data-act="auto-merge" aria-label="Ghép tự động"><b>⇄</b>Ghép<br>tự động<i>${Math.floor(pairs / 2)}</i></button>` : ''}
        <button class="dk-summon ${can ? '' : 'poor'}" data-act="summon-rand" aria-label="Triệu hồi ngẫu nhiên, ${sc} vàng">
          <b>Triệu hồi</b><span class="cost">${coin(1)} ${sc}</span></button>
        <span class="dk-sep"></span><button class="dk-card legend" data-act="legend-open" aria-label="Cây hợp thể">${assetUrl('ui_thang-than.png') ? `<img class="asc-ic" src="${assetUrl('ui_thang-than.png')}" alt="">` : '<b>★</b>'}Hợp<br>thể</button>`;
    } else {
      const def = HEROES[h.type];
      const st = heroStats(h);
      const lc = g.levelCost(h);
      const skillKey = def.skills.map((sk, i) => {
        const lv = skillLevel(h, i);
        const cd = sk.active ? Math.ceil(Math.max(0, h.skillCd[sk.id] || 0)) : 0;
        return `${lv}.${cd > 0 ? 1 : 0}.${sk.active && h.mana < sk.active.mana ? 1 : 0}`;
      }).join();
      const fresh = h.unlockFx && g.time - h.unlockFx.at < 0.5 ? h.unlockFx.i : -1;
      const notice = !!(h.notice && (h.notice.skills || h.notice.evo));
      const up = this.upCount(h) > 0;
      // chỉ dựng lại khi đủ / thiếu vàng cho một nút (không phải mỗi lần vàng đổi) — đỡ giật khi đánh
      const afford = [lc, g.trainCost(h), ...def.skills.map((sk, i) => (skillLevel(h, i) ? (h.from ? COSTS.skillGold(i, skillLevel(h, i)) : 0) : unlockCost(h, i)))]
        .map((c) => (g.gold >= c ? 1 : 0)).join('');
      key = `h|${h.id}|${h.type}|${h.level}|${h.train || 0}|${h.tier}|${h.skillPts}|${skillKey}|${afford}|${h.dead}|${h.bogged}|${fresh}|${notice}|${up}|${assetVersion}`;
      const status = h.dead ? `Hồi sinh sau ${Math.ceil(h.respawnT)}s` : h.bogged ? 'Sa lầy · dùng Mọc Núi' : `Hành ${ELEMENTS[def.el].name} · ${ELEM_TRAIT[def.el].name}`;
      // 4 ô kỹ năng (v37): số trên ô = cấp kỹ năng; tag phía trên = giá nâng tiếp (+ điểm / + vàng / MAX).
      // Chạm ô = nâng (hoặc mở khóa) luôn, không còn màn Kỹ năng riêng.
      const skills = def.skills.map((sk, i) => {
        const lv = skillLevel(h, i);
        const max = SKILL_MAX[i];
        if (!lv) {
          const can = h.level >= COSTS.unlockReq[i];
          const c = unlockCost(h, i);
          return `<button class="dk-sk inset lock" data-act="cmd-skill" data-i="${i}" aria-label="${sk.name}, khóa">
            <span class="sk-tag ${can && g.gold >= c ? 'ok' : 'no'}">+${coin(1)}${c}</span>
            <span class="dim">${svgI(skillIcon(h.type, i))}</span>${ICON.lock}${can ? '' : `<b class="no">cấp ${COSTS.unlockReq[i]}</b>`}</button>`;
        }
        const cd = sk.active ? Math.max(0, h.skillCd[sk.id] || 0) : 0;
        const mx = sk.active ? sk.active.cooldown * (1 - st.cdr / 100) : 1;
        const lvOk = lv < max && h.level >= skillReqLevel(i, lv + 1);
        const pay = h.from ? g.gold >= COSTS.skillGold(i, lv) : h.skillPts > 0;
        const tag = lv >= max ? '<span class="sk-tag max">MAX</span>'
          : `<span class="sk-tag ${lvOk && pay ? 'ok' : 'no'}">+${h.from ? `${coin(1)}${COSTS.skillGold(i, lv)}` : '1đ'}</span>`;
        return `<button class="dk-sk metal ${sk.active && h.mana < sk.active.mana ? 'nomana' : ''} ${i === fresh ? 'fresh' : ''} ${lvOk && pay ? 'canup' : ''}" data-act="cmd-skill" data-i="${i}" aria-label="${sk.name} cấp ${lv}">
          ${tag}${svgI(skillIcon(h.type, i))}<span class="lvn">${lv}</span>${lvOk ? '' : lv < max ? `<span class="req">cấp ${skillReqLevel(i, lv + 1)}</span>` : ''}
          ${sk.active ? `<span class="cdov" style="height:${cd > 0.4 ? Math.min(100, cd / mx * 100) : 0}%"></span><span class="cdn">${cd > 0.4 ? Math.ceil(cd) : ''}</span>` : ''}</button>`;
      }).join('') + (h.from || !h.skillPts ? '' : `<button class="dk-sk metal stat ${h.skillPts ? 'canup' : 'off'}" data-act="sk-stat-deck" aria-label="Cộng điểm dư vào chỉ số">
          <span class="sk-tag ${h.skillPts ? 'ok' : 'no'}">+1đ</span><b style="color:${ELEMENTS[def.el].color}">+${COSTS.statPt}</b><small>${ATTRS[heroMain(def)].short}</small>${h.skillPts ? `<span class="badge">${h.skillPts}</span>` : ''}</button>`);
      const maxed = h.level >= CONFIG.maxLevel;
      const tc = g.trainCost(h);
      html = `<button class="dk-x metal" data-act="deck-close" aria-label="Bỏ chọn">${ICON.close}</button>
        <span class="dk-pt ${g.known.has('h.' + h.type) ? 'goldf' : ''}" ${assetUrl(`ui_khung-${h.from ? 'vang' : 'thuong'}.png`) ? `style="background-image:url('${assetUrl(`ui_khung-${h.from ? 'vang' : 'thuong'}.png`)}'),radial-gradient(circle at 50% 60%,#3A2416,#1A0F0A 75%);background-size:100% 100%,auto"` : ''}><canvas id="dk-portrait" width="108" height="116"></canvas><span class="lv">${h.level}${h.train ? `<i>✦${h.train}</i>` : ''}</span><span class="st" ${h.from ? 'style="color:#FF7A3A"' : ''}>${'★'.repeat(h.tier || 0)}</span></span>
        <span class="dk-info" data-act="hero-stats" role="button" aria-label="Xem chỉ số"><span class="nm">${elIcon(def.el, 15)}${def.name}</span><span class="sub ${h.bogged || h.dead ? 'warn' : ''}">${status}</span>
          <span class="bar hp"><i id="dk-hp"></i></span><span class="bar mp"><i id="dk-mp"></i></span></span>

        ${skills}
        ${maxed ? `<button class="dk-up btn-gold" data-act="train" ${g.gold < tc ? 'disabled' : ''} aria-label="Luyện thể"><b>${uiIc('luyen-the')}Luyện thể ✦${(h.train || 0) + 1}</b><span>${coin(1)}${tc}</span></button>`
          : `<button class="dk-up btn-gold" data-act="levelup" ${g.gold < lc ? 'disabled' : ''} aria-label="Nâng cấp tướng"><b>Lên cấp ${h.level + 1}</b><span>${coin(1)}${lc}</span></button>`}
`;
    }
    if (this.sig.deck !== key) {
      this.sig.deck = key;
      deck.innerHTML = html;
    }
    if (h) {
      drawHeroPortrait($('#dk-portrait'), h, performance.now() / 1000);
      const st = heroStats(h);
      $('#dk-hp').style.width = `${Math.max(0, h.hp / st.hpMax) * 100}%`;
      $('#dk-mp').style.width = `${Math.max(0, h.mana / st.maxMana) * 100}%`;
      // đếm ngược hồi chiêu cập nhật tại chỗ (không dựng lại cả thanh)
      deck.querySelectorAll('.dk-sk[data-i]').forEach((el) => {
        const i = +el.dataset.i, sk = HEROES[h.type].skills[i];
        const ov = el.querySelector('.cdov');
        if (!ov || !sk.active) return;
        const cd = Math.max(0, h.skillCd[sk.id] || 0), max = sk.active.cooldown * (1 - st.cdr / 100);
        const hgt = cd > 0.4 ? `${Math.min(100, cd / max * 100)}%` : '0%';
        if (ov.style.height !== hgt) ov.style.height = hgt;
        const txt = cd > 0.4 ? String(Math.ceil(cd)) : '';
        const cn = el.querySelector('.cdn');
        if (cn.textContent !== txt) cn.textContent = txt;
      });
      // bảng chỉ số tướng (nút 📊 trên thanh tướng)
      const sp = $('#hero-stats');
      if (this.statsOpen && !this.screen) {
        const sk2 = `${h.id}|${h.level}|${h.tier}|${h.train}|${h.statPts}|${Object.values(h.skillLv).join()}|${SLOTS.map((x) => h.equip[x] ? h.equip[x].uid : '').join()}|${Math.round(h.hp)}`;
        if (this.statsSig !== sk2 || sp.hidden) {
          this.statsSig = sk2;
          const S = heroStats(h);
          const row = (k, v) => `<div><span>${k}</span><b>${v}</b></div>`;
          sp.innerHTML = `<div class="hs-h">${HEROES[h.type].name} · cấp ${h.level} · ${'★'.repeat(h.tier || 0)} · lực chiến <b>${heroPower(h)}</b></div><div class="hs-g">`
            + row('Sát thương', Math.round(S.damage)) + row('Tốc đánh', `${(1 / S.cooldown).toFixed(2)}/giây`) + row('Tầm đánh', Math.round(S.range))
            + row('Máu', `${Math.round(h.hp)}/${Math.round(S.hpMax)}`) + row('Chí mạng', `${Math.round(S.crit)}% ×${S.critMult.toFixed(1)}`) + row('Giảm hồi chiêu', `${Math.round(S.cdr)}%`)
            + row('Giảm s.thương', `${Math.round(S.dr)}%`) + row('Năng lượng', Math.round(S.maxMana))
            + row(ATTRS.str.name, Math.round(S.str)) + row(ATTRS.agi.name, Math.round(S.agi)) + row(ATTRS.int.name, Math.round(S.int))
            + row('Điểm đã cộng', h.statPts || 0) + '</div>';
          sp.hidden = false;
        }
      } else if (!sp.hidden) sp.hidden = true;
      // thanh thao tác nổi trên tướng: tự hiện khi chọn tướng (ẩn khi mở màn khác / menu)
      const show = !h.dead && !this.screen && !this.statsOpen && $('#drawer').hidden && this.moving < 0;
      const mk = show ? this.moreKey(h) : '';
      if (show && (this.moreSig !== mk || $('#more').hidden)) { this.moreSig = mk; $('#more').hidden = false; this.renderMore(); }
      else if (show) this.placeMore(h);
      else if (!$('#more').hidden) $('#more').hidden = true;
    } else { $('#more').hidden = true; $('#hero-stats').hidden = true; }
    // gợi ý ngắn trên hàng thẻ
    const hint = this.moving >= 0 ? 'Chạm ô muốn chuyển tướng tới (tướng cùng loại cùng sao: ghép)' : '';
    $('#deck-hint').hidden = !hint;
    if (hint) this.setText('#deck-hint', hint);
    // Mọc Núi: chỉ hiện khi nước sắp dâng hoặc đã ngập
    const moc = $('#btn-moc');
    const need = false;     // v36: bỏ Mọc Núi
    moc.hidden = !need;
    if (need) {
      moc.classList.toggle('on', this.raising);
      this.setHTML('#btn-moc', `${g.moc}|${g.mocMax()}`, `${ICON.mount}Mọc Núi<span>${g.moc}/${g.mocMax()}</span>`);
    } else this.raising = false;
  }

  // số món trong túi làm tướng mạnh hơn (lưu tạm theo trạng thái túi + đồ đang mặc)
  upCount(h) {
    const g = this.game;
    const key = h.id + '|' + h.type + '|' + h.level + '|' + g.inventory.map((i) => i.uid + i.rarity + i.plus).join() + '|' + SLOTS.map((s) => h.equip[s] ? h.equip[s].uid + h.equip[s].rarity + h.equip[s].plus : '').join();
    if (this.upKey !== key) { this.upKey = key; this.upVal = g.inventory.filter((i) => upgradeGain(h, i) > 0).length; }
    return this.upVal;
  }

  // 2 nút góc dưới phải: chấm xanh khi có việc để làm (đồ tốt hơn trong túi / đủ vàng nâng đồ đang mặc)
  updateAutoBtns() {
    const g = this.game, el = $('#auto-btns');
    if (!el || el.hidden) return;
    const eq = g.inventory.some((i) => { const b = g.bestHeroFor(i); return b && b.gain > 0; });
    const reserve = COSTS.summon(g.summonN || 0);
    const up = g.heroes.some((h) => h && SLOTS.some((sl) => { const i = h.equip[sl]; return i && i.plus < 5 && g.gold - enhanceCost(i) >= reserve; }));
    const [bu, be] = el.querySelectorAll('.dot');
    if (bu.hidden === up) bu.hidden = !up;
    if (be.hidden === eq) be.hidden = !eq;
  }

  // thùng hủy tướng: hiện khi đang kéo một tướng; thả vào = hủy, hoàn vàng
  showTrash(slot) {
    const h = this.game.heroes[slot];
    if (!h) return;
    const el = $('#trash');
    el.innerHTML = `<b>🗑 Hủy tướng</b><small>thả vào đây · hoàn ${coin(1)} ${this.game.sellValue(h)}</small>`;
    el.classList.remove('hot');
    el.hidden = false;
  }
  overTrash(cx, cy) {
    const el = $('#trash');
    if (el.hidden || cx == null) return false;
    const r = el.getBoundingClientRect();
    return cx >= r.left - 8 && cx <= r.right + 8 && cy >= r.top - 8 && cy <= r.bottom + 8;
  }
  hoverTrash(cx, cy) { $('#trash').classList.toggle('hot', this.overTrash(cx, cy)); }
  hideTrash(cx, cy) {
    const hit = this.overTrash(cx, cy);
    $('#trash').hidden = true;
    return hit;
  }
  trashHero(slot) {
    const g = this.game, h = g.heroes[slot];
    if (!h) return;
    const v = g.sellValue(h);
    g.sellHero(slot);
    if (this.sel === slot) this.clearSel();
    $('#more').hidden = true;
    this.toast(`Đã hủy ${HEROES[h.type].name}: +${v} vàng`, '#F2D27A');
  }

  // Thanh thao tác nổi ngay trên tướng đang chọn (v37): chạm tướng là thấy, mỗi việc 1 chạm.
  // Ghép / hợp thể / mặc đồ làm luôn khi đủ điều kiện; đổi chỗ = giữ & kéo; hủy = chạm 2 lần hoặc kéo vào 🗑.
  moreKey(h) {
    const g = this.game;
    const twin = !h.from && g.heroes.some((o) => o && o !== h && g.canMerge(o, h) === true);
    const fz = (ASCEND[h.type] || []).map((to) => {
      const o = g.heroes.find((x) => x && x !== h && x.type === fusionPartner(h.type, to) && typeof g.canFuse(x, h) !== 'string');
      return o ? o.slot : -1;
    }).join();
    return [h.id, h.type, h.tier, h.skillPts, h.notice.skills, h.notice.evo, twin, fz, this.upCount(h), this.sellArmed, h.spent].join('|');
  }
  renderMore() {
    const g = this.game;
    const h = g.heroes[this.sel];
    if (!h) return;
    const t = h.tier || 0;
    const twin = !h.from && g.heroes.find((o) => o && o !== h && g.canMerge(o, h) === true);
    const readyF = (ASCEND[h.type] || []).map((to) => {
      const pt = fusionPartner(h.type, to);
      const o = g.heroes.filter((x) => x && x !== h && x.type === pt && typeof g.canFuse(x, h) !== 'string')[0];
      return o ? { to, pt, o } : null;
    }).filter(Boolean);
    const up = this.upCount(h);
    const b = (cls, act, ic, label, extra = '') => `<button class="ha ${cls}" data-act="${act}" ${extra}><span class="i">${ic}</span><span class="l">${label}</span></button>`;
    $('#more').innerHTML = [
      h.from ? b(h.notice.evo ? 'notice' : '', 'open-evo', '✦', t < 3 ? `Thần tinh ★${t + 1}` : 'Thần tinh')
        : twin ? b('go', 'merge-any', '⇄', `Ghép ${'★'.repeat(t + 1)}`)
        : b('dim', 'open-evo', '★', t >= 3 ? '★★★ tối đa' : 'Ghép sao'),
      up ? b('go', 'auto-eq', '▲', `Mặc ${up} món`) : b('', 'open-bag', '🛡', 'Trang bị'),
      ...readyF.map((f) => b('fuse', 'fuse-with', '✸', `→ ${HEROES[f.to].name}`, `data-slot="${f.o.slot}" style="color:${RARITY[HEROES[f.to].legend].color}"`)),
      b(`danger ${this.sellArmed ? 'armed' : ''}`, 'sell', '🗑', this.sellArmed ? `Chắc chắn? +${g.sellValue(h)}` : 'Hủy'),
    ].join('');
    this.placeMore(h);
  }
  // đặt thanh ngay trên đầu tướng, kẹp trong màn hình
  placeMore(h) {
    const el = $('#more');
    // toạ độ trong khung thiết kế 932×430 (đúng cả khi khung đang tự xoay ngang)
    const x = (h.x + MAPX) / DK, y = (h.y + MAPY) / DK, head = (h.y - 66 + MAPY) / DK;
    const bw = el.offsetWidth || 260, bh = el.offsetHeight || 50;
    // thanh được phóng --hz quanh mép dưới giữa (hoặc mép trên khi hiện dưới chân)
    const hz = typeof HZ !== 'undefined' ? HZ : 1;
    let top = head - bh - 4;
    if (head - bh * hz - 4 < 48 * hz) top = y + 10;              // sát mép trên thì hiện dưới chân
    const cx = Math.max(6 + bw * hz / 2, Math.min(UIW - 6 - bw * hz / 2, x));
    const left = cx - bw / 2;
    const L = `${left.toFixed(0)}px`, T = `${top.toFixed(0)}px`;
    if (el.style.left !== L) el.style.left = L;
    if (el.style.top !== T) el.style.top = T;
    el.classList.toggle('below', top > y);
    const A = `${Math.max(14, Math.min(bw - 14, bw / 2 + (x - cx) / hz)).toFixed(0)}px`;
    if (el.style.getPropertyValue('--ax') !== A) el.style.setProperty('--ax', A);
  }

  updateCoach() {
    const g = this.game;
    const coach = $('#coach');
    let pos = null, text = '';
    this.coachSlot = -1;
    if (!g.over && !this.screen && $('#reward').hidden && $('#settings').hidden && $('#legends').hidden) {
      const heroes = g.heroes.filter(Boolean);
      if (!heroes.length) {
        pos = [466, 330];
        text = 'Bấm Triệu hồi ↓ để gọi một tướng ngẫu nhiên';
      } else if (heroes.length === 1 && g.wave === 0 && g.gold >= g.summonCost()) {
        pos = [466, 330];
        text = 'Gọi thêm tướng: 2 tướng giống nhau kéo vào nhau sẽ lên sao';
      } else if (g.wave === 0 && !g.running) {
        pos = [800, 76];
        text = 'Bấm ▶ (góc trên phải) để quân Thủy Tinh tràn tới';
      } else if (false) {
        pos = [560, 250];
        text = 'Nước sắp dâng! Bấm Mọc Núi (góc dưới phải) rồi chạm ô nhấp nháy';
      }
      if (g.water > 0) g.flags.floodTip = true;
      if (g.wave >= 1 && !g.waveActive && !g.flags.gearTip && heroes.length) {
        g.flags.gearTip = true;
        this.toast('Mẹo: chạm vào tướng, bấm <b>Nâng cấp</b> bằng vàng để lên cấp và có điểm kỹ năng', '#9dffc4');
      } else if (g.wave >= 3 && !g.waveActive && !g.flags.shopTip && g.gold >= 100) {
        g.flags.shopTip = true;
        this.toast('Mẹo: mua và đúc đồ ở bảng Chuẩn bị xuất quân trước trận; mặc đồ là tướng đổi hình dạng', '#9dffc4');
      }
    }
    coach.hidden = !pos;
    if (!pos) return;
    if (coach.textContent !== text) coach.textContent = text;
    const w = coach.offsetWidth;
    coach.style.left = Math.max(4, Math.min(UIW - w - 4, pos[0] / UIZ - w / 2)) + 'px';
    coach.style.top = Math.max(48, pos[1] / UIZ - 30) + 'px';
  }

  // v98: chế độ vô tận — sắp sang bộ quái mới thì hiện gợi ý tướng khắc chế (ảnh đại diện)
  checkRosterHint() {
    const g = this.game;
    if (!g.started || g.over) return;
    const n = g.wave + 1;
    // ngoài vô tận: chỉ nhớ bộ quái đang đánh; vào vô tận rồi mới báo khi đợt kế đổi bộ
    if (!g.endless || this.rosterLevel !== g.level) {
      this.rosterKey = rosterKeyOf(rosterFor(Math.max(1, g.wave), g.level)); this.rosterLevel = g.level;
      if (!g.endless) return;
    }
    const key = rosterKeyOf(rosterFor(n, g.level));
    if (key === this.rosterKey) return;
    this.rosterKey = key;
    if (!g.endless || !key) return;
    const bosses = [];
    for (let w = n; w < n + 10; w++) { const b = bossAt(w, g.level); if (b) bosses.push(b); }
    const pool = [...summonPool(g.level), ...LEGEND_HEROES.filter((t) => (this.save.owned || []).includes(t))];
    const c = rosterCounters(ROSTERS[key], bosses, pool, []);
    const el = $('#roster-hint');
    el.innerHTML = `<div class="rh-h"><small>Đợt ${n} · bộ quái mới</small><b>${ROSTER_NAMES[key] || key}</b></div>
      ${c.main ? `<div class="ch-sum">Quái chủ yếu hành <b style="color:${ELEMENTS[c.main].color}">${ELEMENTS[c.main].name}</b> → dùng hành <b style="color:${ELEMENTS[c.ce].color}">${ELEMENTS[c.ce].name}</b></div>` : ''}
      <div class="rh-foes">${c.foes.slice(0, 7).map((k) => `<span title="${esc(ENEMIES[k].name)}">${esc(ENEMIES[k].name)}${ENEMIES[k].boss ? ' 👑' : ''}</span>`).join('')}</div>
      <div class="ch-row">${c.list.map((x) => `<span class="ch-av ${HEROES[x.t].legend || ''}" style="--c:${ELEMENTS[HEROES[x.t].el].color}"><img src="${heroImgUrl(x.t, 'head')}" alt="${esc(HEROES[x.t].name)}"><i>${elIcon(HEROES[x.t].el, 11)}</i><small>${x.why}</small></span>`).join('')}</div>
      <div class="rh-x">Chạm để đóng</div>`;
    el.hidden = false;
    clearTimeout(this.rosterHintT);
    this.rosterHintT = setTimeout(() => { el.hidden = true; }, 9000);
  }

  // v92: tướng nên có để khắc chế quái của ải — hiện ảnh đại diện
  counterHtml(i) {
    const c = levelCounters(i, new Set(this.save.owned || []));
    const head = c.main ? `Quái chủ yếu hành <b style="color:${ELEMENTS[c.main].color}">${ELEMENTS[c.main].name}</b> → dùng hành <b style="color:${ELEMENTS[c.ce].color}">${ELEMENTS[c.ce].name}</b>` : '';
    return `<div class="hint-h">TƯỚNG KHẮC CHẾ</div>${head ? `<div class="ch-sum">${head}</div>` : ''}
      <div class="ch-row">${c.list.map((x) => `<span class="ch-av ${HEROES[x.t].legend || ''}" style="--c:${ELEMENTS[HEROES[x.t].el].color}" title="${esc(HEROES[x.t].name + ' — ' + x.why)}">
        <img src="${heroImgUrl(x.t, 'head')}" alt="${esc(HEROES[x.t].name)}"><i>${elIcon(HEROES[x.t].el, 11)}</i><small>${x.why}</small></span>`).join('')}</div>`;
  }

  // ---------- v92: Thần Khí của tướng Vàng (3 hệ riêng, mỗi hệ 5 cấp) — hiện ngay trong màn Anh Hùng
  legacyPts(t) { const L = (this.save.legacy || {})[t] || {}; return LEGACY[t].reduce((a, x) => a + (L[x.id] || 0), 0); }
  renderLegacy() {
    const t = this.legacyHero, d = HEROES[t], L = (this.save.legacy || {})[t] || {}, kho = this.save.kho || 0;
    const elc = ELEMENTS[d.el].color;
    const col = (sys, si) => {
      const lv = L[sys.id] || 0, c = LEGACY_COST[lv];
      const pips = Array.from({ length: LEGACY_MAX }, (_, i) => `<i class="${i < lv ? 'on' : ''} ${sys.ms.some((m) => m.lv === i + 1) ? 'ms' : ''}"></i>`).join('');
      return `<div class="lg-sys">
        <div class="lg-h"><span class="lg-ic">${RELIC_PACK.has(t) ? `<img src="${assetSrc(`packs/${t}/tk-${si + 1}.png`)}" alt="">` : sys.ic}</span><div><b>${sys.name}</b><small>${esc(sys.desc)}</small></div></div>
        <div class="lg-pips">${pips}<span>${lv}/${LEGACY_MAX}</span></div>
        <div class="lg-now">${lv ? legacyPerText(sys, lv) : 'Chưa nâng'}${lv < LEGACY_MAX ? `<br><small>Cấp ${lv + 1}: ${legacyPerText(sys, lv + 1)}</small>` : ''}</div>
        ${sys.ms.map((m) => `<div class="lg-ms ${lv >= m.lv ? 'got' : ''}"><span>Cấp ${m.lv}</span>${esc(m.t)}</div>`).join('')}
        ${lv >= LEGACY_MAX ? '<div class="chip ok" style="text-align:center;margin-top:auto">Đã tối đa</div>'
          : `<button class="btn btn-gold lg-buy" data-act="lg-buy" data-k="${sys.id}" ${kho < c ? 'disabled' : ''}>Nâng cấp ${lv + 1} · ${bac()} ${fmt(c)}</button>`}
      </div>`;
    };
    $('#roster').innerHTML = `<div class="screen" style="z-index:auto;--elc:${elc}">
      <div class="scr-head metal"><button class="xbtn metal" data-act="lg-close" aria-label="Quay lại">${ICON.back}</button>
        <img class="lg-av" src="${heroImgUrl(t, 'head')}" alt=""><h1 class="ttl">Thần Khí · ${d.name}</h1>${elChip(d.el)}
        <span class="chip dark">${this.legacyPts(t)}/${LEGACY_MAX * 3} cấp</span><div class="sp"></div>
        <span class="chip kho">Ngân khố ${bac()} ${fmt(kho)}</span></div>
      <div class="scr-body lg-body">${LEGACY[t].map(col).join('')}</div></div>`;
  }

  // ---------- v95: Tu Vi — cộng Tu Vi trận này vào tài khoản; trả về dòng tóm tắt + các lần lên bậc
  bankTuvi(mult) {
    const g = this.game, sv = this.save, log = g.xpLog || {};
    sv.tuvi = sv.tuvi || {};
    const rows = [], up = [];
    for (const t of Object.keys(log).sort((a, b) => log[b] - log[a])) {
      const add = Math.round(log[t] * mult);
      if (!add || !HEROES[t]) continue;
      const before = tuviLevel(sv.tuvi[t] || 0);
      sv.tuvi[t] = (sv.tuvi[t] || 0) + add;
      const after = tuviLevel(sv.tuvi[t]);
      rows.push(`${HEROES[t].name} +${add}`);
      if (after > before) up.push(`☯ ${HEROES[t].name} lên ${TUVI_RANKS[after - 1]} (Tu Vi ${after}) · +${(after - before) * TUVI_PTS} điểm Ấn Phù`);
    }
    g.xpLog = {};
    writeSave(sv);
    return { rows: rows.slice(0, 6), up };
  }

  // ---------- v95: Bảng Ấn Phù RIÊNG TỪNG TƯỚNG — khắc bằng điểm Tu Vi
  runeHeroes() { return [...BASIC_HEROES, ...LEGEND_HEROES.filter((t) => (this.save.owned || []).includes(t))]; }
  showRunes(inGame, type) {
    this.runesInGame = !!inGame;
    const sel = this.game.heroes[this.sel];
    this.runeHero = type || (inGame && sel ? sel.type : null) || this.runeHero || 'lactuong';
    this.runeSel = this.runeSel || 'n_dmg';
    this.runeResetArm = false;
    if (inGame) { if (!this.runesFromRoster) { this.runesWasRunning = this.game.running; this.game.running = false; } }
    else if (!this.runesFromRoster) this.hideOverlays();
    $('#runes').hidden = false;
    this.renderRunes();
  }
  heroRuneLv(t) { const m = this.save.heroRunes || (this.save.heroRunes = {}); return m[t] || (m[t] = {}); }
  runeOpen(r) { return runeBranchPts(this.heroRuneLv(this.runeHero), r.br) >= RUNE_ROW_NEED[r.row]; }
  runePtsLeft(t) { const xp = (this.save.tuvi || {})[t] || 0; return tuviPoints(xp) - runeSpent(this.heroRuneLv(t)); }
  renderRunes() {
    const t = this.runeHero, d = HEROES[t], lvs = this.heroRuneLv(t);
    const xp = (this.save.tuvi || {})[t] || 0, tl = tuviLevel(xp), nx = tuviNext(xp), left = this.runePtsLeft(t);
    const r = RUNE_BY[this.runeSel], lv = lvs[r.id] || 0, br = RUNE_BRANCHES.find((b) => b.id === r.br);
    const open = this.runeOpen(r), cost = runePt(r);
    const node = (x) => {
      const l = lvs[x.id] || 0, op = this.runeOpen(x);
      return `<button class="rn-node ${x.skill ? 'sk' : ''} ${l ? 'has' : ''} ${l >= x.max ? 'full' : ''} ${op ? '' : 'lock'} ${x.id === r.id ? 'on' : ''}" data-act="rn-sel" data-k="${x.id}" title="${esc(x.name)}">
        <span class="ri">${runeIc(x)}</span><span class="rl">${l}/${x.max}</span></button>`;
    };
    const col = (b) => {
      const pts = runeBranchPts(lvs, b.id);
      return `<div class="rn-col" style="--rc:${b.color}"><div class="rn-bh"><b>${b.name}</b><small>${b.sub} · ${pts} cấp</small></div>
        ${[0, 1, 2, 3].map((row) => `<div class="rn-row ${row === 3 ? 'skrow' : ''}">${pts < RUNE_ROW_NEED[row] ? `<span class="rn-need">${RUNE_ROW_NEED[row]}</span>` : ''}${RUNES.filter((x) => x.br === b.id && x.row === row).map(node).join('')}</div>`).join('')}</div>`;
    };
    const lines = [];
    for (let l = 1; l <= r.max; l++) lines.push(`<div class="rn-lv ${l <= lv ? 'got' : l === lv + 1 ? 'next' : ''}"><span>Cấp ${l}</span>${esc(r.fmt(runeVal(r, l)))}</div>`);
    const picker = this.runeHeroes().map((h) => { const hx = (this.save.tuvi || {})[h] || 0, pl = this.runePtsLeft(h);
      return `<button class="rn-hero ${h === t ? 'on' : ''} ${HEROES[h].legend || ''}" data-act="rn-hero" data-k="${h}" title="${esc(HEROES[h].name)}" style="--c:${ELEMENTS[HEROES[h].el].color}">
        <img src="${heroImgUrl(h, 'head')}" alt=""><span class="tl">${tuviLevel(hx)}</span>${pl > 0 ? `<span class="pt">${pl}</span>` : ''}</button>`; }).join('');
    const bar = nx ? Math.max(0, Math.min(1, (xp - TUVI_XP[tl - 1]) / (nx - TUVI_XP[tl - 1]))) : 1;
    $('#runes').innerHTML = `<div class="screen" style="z-index:auto">
      <div class="scr-head metal"><button class="xbtn metal" data-act="rn-back" aria-label="Quay lại">${ICON.back}</button><h1 class="ttl">Ấn Phù</h1>
        <div class="rn-pick">${picker}</div></div>
      <div class="scr-body rn-body">
        <div class="rn-board">${RUNE_BRANCHES.map(col).join('')}</div>
        <div class="panel metal rn-det" style="--rc:${br.color}">
          <div class="rn-tv"><img src="${heroImgUrl(t, 'head')}" alt=""><div><b>${d.name}</b><small>☯ Tu Vi ${tl} · ${tuviRank(xp)}</small>
            <div class="rn-xp"><i style="width:${bar * 100}%"></i></div><small>${nx ? `${fmt(Math.floor(xp))} / ${fmt(nx)} — hạ quái bằng tướng này để lên bậc` : 'Đã đạt bậc cao nhất'}</small></div></div>
          <div class="rn-pts">Điểm Ấn còn <b>${left}</b> / ${tuviPoints(xp)} <button class="btn ${this.runeResetArm ? 'btn-gold' : 'metal'}" data-act="rn-reset" ${runeSpent(lvs) ? '' : 'disabled'}>${this.runeResetArm ? 'Bấm lần nữa' : 'Tẩy ấn'}</button></div>
          <div class="rn-dh"><span class="rn-big">${runeIc(r)}</span><div><b>${r.name}</b><small>${br.name} · ${r.skill ? 'Ấn kỹ năng · 3 điểm / cấp' : 'Ấn chỉ số · 1 điểm / cấp'} · cấp ${lv}/${r.max}</small></div></div>
          <div class="rn-lvs">${lines.join('')}</div>
          ${lv >= r.max ? '<div class="chip ok" style="text-align:center">Đã tối đa</div>'
            : !open ? `<div class="rn-lockmsg">🔒 Cần ${RUNE_ROW_NEED[r.row]} cấp trong ${br.name} (đang có ${runeBranchPts(lvs, r.br)})</div>`
            : `<button class="btn btn-gold rn-buy" data-act="rn-buy" data-k="${r.id}" ${left < cost ? 'disabled' : ''}>${lv ? 'Nâng' : 'Khắc'} cấp ${lv + 1} · ${cost} điểm Ấn</button>`}
        </div>
      </div></div>`;
  }

  // ---------- Anh Hùng (20): xem 20 tướng, kỹ năng, đặc trưng
  showRoster(sel, inGame) {
    this.rosterSel = sel || this.rosterSel || 'lactuong';
    this.legacyHero = null;
    // v90: mở từ menu ≡ trong trận → tạm dừng, đóng lại thì về trận
    this.rosterInGame = !!inGame;
    if (inGame) { this.rosterWasRunning = this.game.running; this.game.running = false; $('#roster').hidden = false; this.renderRoster(); return; }
    this.hideOverlays();
    $('#roster').hidden = false;
    this.renderRoster();
  }
  renderRoster() {
    const t = this.rosterSel;
    const d = HEROES[t];
    const all = [...BASIC_HEROES, ...LEGEND_HEROES];
    const splash = assetUrl([`anh-lon_${heroSlug(t)}.png`, `heroes/hero_${HERO_CODE[t]}_A.png`]);
    const n = skillN(1);
    $('#roster').innerHTML = `<div class="screen" style="z-index:auto">
      <div class="scr-head metal"><button class="xbtn metal" data-act="ro-back" aria-label="Quay lại">${ICON.back}</button><h1 class="ttl">Anh Hùng Văn Lang</h1>
        <span class="chip dark">${all.length} tướng · ${BASIC_HEROES.length} Thường · ${LEGEND_HEROES.filter((x) => HEROES[x].legend === 'epic').length} Sử thi · ${LEGEND_HEROES.filter((x) => HEROES[x].legend === 'legendary').length} Huyền thoại</span><div class="sp"></div>
        ${this.rosterInGame ? "" : `<button class="btn metal title" data-act="ro-temple">Đền Anh Hùng · xem hoạt ảnh</button>`}</div>
      <div class="scr-body">
        <div class="ro-grid">${all.map((k) => {
          const h = HEROES[k];
          const lock = h.legend && !(this.save.owned || []).includes(k);
          return `<button class="ro-card ${h.legend || ''} ${k === t ? 'on' : ''} ${lock ? 'lock' : ''} ${this.game.known.has('h.' + k) ? 'goldf' : ''}" data-act="ro-sel" data-type="${k}">${lock ? '<span class="ro-lock">🔒</span>' : ''}
            <span class="tag el" style="color:${ELEMENTS[h.el].color}">${elIcon(h.el, 11)}${ELEMENTS[h.el].name}</span>
            <img src="${heroImgUrl(k)}" alt=""><span class="nm">${h.name}</span></button>`;
        }).join('')}</div>
        <div class="panel metal ro-det">
          <div class="ro-top">
            <div class="ro-pic inset ${this.game.known.has('h.' + t) ? 'goldf' : ''}">${splash ? `<img src="${splash}" alt="">` : '<canvas id="ro-cv" width="300" height="300"></canvas>'}</div>
            <div style="display:flex;flex-direction:column;gap:5px;min-width:0">
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><span class="ttl" style="font-size:26px;line-height:1">${d.name}</span>
                ${!d.legend ? '<span class="chip ok">Có sẵn</span>' : (this.save.owned || []).includes(t) ? `<span class="chip ok">✓ Đã sở hữu</span>${LEGACY[t] ? `<button class="btn btn-gold" style="height:32px;padding:0 12px;font-size:14px" data-act="lg-open" data-type="${t}">⚜ Thần Khí · ${this.legacyPts(t)}/${LEGACY_MAX * 3}</button>` : ''}`
                  : `<button class="btn btn-gold" style="height:32px;padding:0 12px;font-size:14px" data-act="ro-buy" data-type="${t}" ${(this.save.kho || 0) < OWN_COST[d.legend] ? 'disabled' : ''}>Mua · ${bac()} ${fmt(OWN_COST[d.legend])}</button><span class="chip dark">Ngân khố ${fmt(this.save.kho || 0)}</span>`}</div>
              <div class="note" style="font-style:italic">${esc(d.title)}</div>
              ${!d.legend || (this.save.owned || []).includes(t) ? `<div class="ro-tv"><span>☯ Tu Vi ${tuviLevel((this.save.tuvi || {})[t] || 0)} · ${tuviRank((this.save.tuvi || {})[t] || 0)}</span>
                <button class="btn metal" data-act="ro-runes" data-type="${t}">🔯 Ấn Phù${this.runePtsLeft(t) > 0 ? ` <b class="rn-dot">${this.runePtsLeft(t)}</b>` : ''}</button></div>` : ''}
              <div class="bt-info" style="padding:0;background:none;border:0;box-shadow:none"><div class="tags">
                <span style="background:#1A1208;color:${ELEMENTS[d.el].color};display:inline-flex;align-items:center;gap:3px">${elIcon(d.el, 13)} Hành ${ELEMENTS[d.el].name} · ${ELEM_TRAIT[d.el].name}</span>
                <span style="background:#1A1208;color:#E8D8B0">${ELEM_TRAIT[d.el].fx}</span>
                <span style="background:#3A2410;color:${d.legend ? RARITY[d.legend].color : '#C8BFA8'}">${d.legend ? RARITY[d.legend].name : 'Cơ bản'}</span>
                <span style="background:#2A1810;color:#FFB08A">${d.dmgType === 'magic' ? 'Phép' : 'Vật lý'} · ${d.attack === 'melee' ? 'Cận chiến' : 'Đánh xa'}</span>
                <span style="background:#1A1610;color:#C8BFA8">${d.role}</span></div></div>
              <div class="kvt inset" style="font-size:12px">${d.legend
                ? `<div><span>Ghép từ</span><b style="text-align:right">${ascendSources(t).map((x) => HEROES[x].name).join(' + ')}</b></div>
                  <div><span>Cần</span><b style="color:#FFD66B">${d.legend === 'epic' ? '★★★' : `Thần tinh ${'★'.repeat(COSTS.ascendTier2)}`} · kỹ năng tối đa · ${COSTS.ascend[d.legend]} vàng</b></div>`
                : `<div><span>Có từ</span><b style="color:#FFD66B">Triệu hồi ngẫu nhiên ★</b></div>`}
                ${ASCEND[t] ? `<div><span>Hợp thể ra</span><b style="text-align:right;color:${RARITY[d.legend ? 'legendary' : 'epic'].color}">${ASCEND[t].map((x) => HEROES[x].name).join(' / ')}</b></div>` : ''}
                <div><span>Tầm · Tốc đánh</span><b>${d.base.range} · ${d.base.cooldown}s</b></div></div>
              ${d.trait ? `<div class="tipbox inset" style="font-size:12px">★ <b>${d.trait.name}:</b> ${esc(d.trait.desc)}</div>` : ''}
              ${secretLine(this.game, 'h.' + t)}
            </div></div>
          <div class="ro-sk">${d.skills.map((sk, i) => `<div class="inset">${svgI(skillIcon(t, i))}<b style="color:#F2D27A">${SKILL_KEYS[i]} · ${sk.name}</b><span style="color:#C8BFA8;font-weight:500">${esc(sk.info(n))}</span></div>`).join('')}</div>
        </div></div></div>`;
    // ảnh vector tải không đồng bộ: vẽ lại vài lần cho chắc
    const draw = () => {
      const cv = $('#ro-cv');
      if (cv && this.rosterSel === t) drawHeroPortrait(cv, { type: t, id: 1, level: 1, tier: 0, equip: {}, skillLv: {} }, 0, { full: true });
    };
    [0, 120, 400, 1000].forEach((ms) => setTimeout(draw, ms));
  }

  // ---------- Kho Báu: bộ sưu tập đồ đã từng có
  showTreasury() {
    this.hideOverlays();
    $('#treasury').hidden = false;
    const have = new Set(this.save.collected);
    const groups = [
      ['Sính lễ & bảo vật', (it) => it.bossOnly],
      ['Vũ khí', (it) => it.slot === 'weapon'], ['Mũ', (it) => it.slot === 'helmet'], ['Giáp', (it) => it.slot === 'armor'],
      ['Phụ kiện', (it) => it.slot === 'acc' && it.price], ['Đồ đúc', (it) => it.recipe],
    ];
    const ids = Object.keys(ITEMS);
    const got = ids.filter((id) => have.has(id)).length;
    $('#treasury').innerHTML = `<div class="screen" style="z-index:auto">
      <div class="scr-head metal"><button class="xbtn metal" data-act="ro-back" aria-label="Quay lại">${ICON.back}</button><h1 class="ttl">Kho Báu &amp; Sính Lễ</h1>
        <span class="chip ok">Đã sưu tầm ${got} / ${ids.length}</span><div class="sp"></div>
        <span class="chip dark">${coin(1)} Tổng vàng đã kiếm ${fmt(this.save.lifeGold)} · Quái đã hạ ${fmt(this.save.lifeKills)}</span></div>
      <div class="tr-body">${groups.map(([name, f]) => `<div class="tr-sec"><div class="h">${name}</div><div class="tr-row">${ids.filter((id) => f(ITEMS[id])).map((id) => {
        const it = ITEMS[id];
        return `<span class="slot ${rarCls(it.rarity)} ${have.has(id) ? '' : 'no'}" title="${it.name}${have.has(id) ? '' : ' (chưa có)'}">${svgI(itemIcon(id))}</span>`;
      }).join('')}</div></div>`).join('')}
      <div class="note">Đồ có được trong trận (rơi từ quái, Hũ báu, Lò đúc, sính lễ) được ghi vào Kho Báu. Đồ chưa có hiện màu tối.</div></div></div>`;
  }

  // ============================================================
  //  SÍNH LỄ, KẾT QUẢ
  // ============================================================
  showReward(ev) {
    this.rewardOpts = ev.options;
    this.rewardBoss = ev.boss;
    this.closeScreen();
    const g = this.game;
    const flood = false;      // v36: bỏ nước dâng ngập ô
    const gift = ev.options[0], jar = ev.options[1], misc = ev.options[2];
    const art = { voi_chin_nga: 'voi', ga_chin_cua: 'ga', ngua_hong_mao: 'ngua' }[gift.id];
    const it = ITEMS[gift.id];
    const jit = ITEMS[jar.id];
    $('#reward').innerHTML = `<div class="screen" style="z-index:auto">
      <div class="scr-head metal"><h1 class="ttl">Chọn sính lễ</h1><span class="chip dark">Đợt ${g.wave}</span>
        <span class="chip ok">✓ Đã hạ ${ENEMIES[ev.boss].name}</span><span class="chip goldc">Chọn 1 trong 3</span><div class="sp"></div>
        <div class="goldbox inset">${coin()}${fmt(g.gold)}</div></div>
      <div class="sl-title">Vua Hùng ban thưởng</div>
      <div class="sl-cards">
        <div class="sl-card gift"><div class="sl-well">${svgI(sceneArt(art))}<span class="sl-tag" style="left:6px;background:#0D0B08;border:1px solid #8C6A2E;color:#F2E6C8">SÍNH LỄ</span><span class="sl-tag" style="right:6px;background:#F0A030;color:#2A1A08">Huyền thoại</span></div>
          <div class="sl-name">${it.name}</div><div class="sl-desc">${esc(it.desc)}<br><b>${statLine(it.stats)}</b></div>
          <button class="sl-pick btn-gold" data-act="reward" data-i="0">Chọn</button></div>
        <div class="sl-card jar"><div class="sl-well">${svgI(sceneArt('huvua'))}<span class="sl-tag" style="left:6px;background:#0D0B08;border:1px solid #8C6A2E;color:#F2E6C8">HŨ BÁU</span><span class="sl-tag" style="right:6px;background:#A86CE0;color:#1A0A28">${(jar.ids || []).length} món</span></div>
          <div class="sl-name">Hũ Vua Hùng · ${(jar.ids || [jar.id]).length} món</div><div class="sl-desc jar-list">${(jar.ids || [jar.id]).map((id) => {
            const best = g.bestHeroFor(makeItem(id));
            return `<div><span class="c-${ITEMS[id].rarity}">${ITEMS[id].name}</span>${best ? `<small>▲${best.gain} ${HEROES[best.hero.type].name}</small>` : ''}</div>`;
          }).join('')}</div>
          <button class="sl-pick metal" style="color:#F2D27A" data-act="reward" data-i="1">Chọn</button></div>
        <div class="sl-card misc"><div class="sl-well">${svgI(sceneArt('kholua'))}<span class="sl-tag" style="left:6px;background:#0D0B08;border:1px solid #8C6A2E;color:#F2E6C8">${misc.kind === 'treasure' ? 'KHO LÚA' : 'HỘI LÀNG'}</span><span class="sl-tag" style="right:6px;background:#12301A;border:1px solid #3EDC4E;color:#6AE06A">Ngẫu nhiên</span></div>
          <div class="sl-name">${misc.title}</div>
          <div class="sl-desc">${misc.kind === 'treasure' ? `<span style="font-size:17px;font-weight:800;color:#FFD66B">${coin()} +${misc.gold} vàng</span> <span style="font-size:17px;font-weight:800;color:#FF8A6A">♥ +${misc.lives} mạng</span>`
            : '<span class="g">Mọi tướng trên sân +2 cấp</span> (kèm 2 điểm kỹ năng)'}<br>Lần khác: ${misc.kind === 'treasure' ? '<span class="g">mọi tướng +2 cấp</span>' : '<span class="g">vàng và +3 mạng</span>'}</div>
          <button class="sl-pick metal" style="color:#F2D27A" data-act="reward" data-i="2">Chọn</button></div>
      </div>
      ${flood ? `<div class="sl-warn"><span style="font-size:20px">💧</span><span style="flex:1"><b>Thủy Tinh dâng nước:</b> sau đợt này, các ô bậc <b>${TIER_NAMES[g.water]}</b> sẽ ngập và tướng đứng đó bị sa lầy. Dùng <span class="m">Mọc Núi</span> để cứu ô quan trọng.</span></div>` : ''}
    </div>`;
    $('#reward').hidden = false;
    this.guard('#reward');
  }

  pickReward(i) {
    const o = this.rewardOpts[i];
    this.game.claimReward(o);
    $('#reward').hidden = true;
    if (!this.game.waveActive) this.saveRun();
    if (o.kind === 'item' && o.ids) this.toast(`Nhận ${o.ids.length} món từ Hũ Vua Hùng · bấm ≡ → Mặc đồ cả đội`, '#C8A0F0');
    else if (o.kind === 'item') this.toast(`Nhận ${ITEMS[o.id].name}! Mở Túi đồ để đeo cho tướng`, RARITY[ITEMS[o.id].rarity].color);
    else if (o.kind === 'treasure') this.toast(`+${o.gold} vàng, +${o.lives} mạng`, '#F2D27A');
    else this.toast('Mọi tướng +2 cấp!', '#6AE06A');
  }

  // cộng thành tích trận vào hồ sơ người chơi (chỉ cộng phần mới)
  bankStats() {
    const g = this.game, s = this.save;
    const b = this.banked || { kills: 0, gold: 0, herbs: 0, id: null };
    if (b.id !== g.runId) { b.kills = 0; b.gold = 0; b.herbs = 0; b.id = g.runId; }
    s.lifeKills += g.stats.kills - b.kills;
    s.lifeGold += g.stats.goldEarned - b.gold;
    s.lifeHerbs += (g.stats.herbs || 0) - b.herbs;
    b.kills = g.stats.kills; b.gold = g.stats.goldEarned; b.herbs = g.stats.herbs || 0;
    this.banked = b;
    writeSave(s);
    if (g.endless && g.wave > g.levelWaves) this.submitScores(false, 0);   // rời trận vô tận giữa chừng vẫn ghi điểm
  }

  finishLevel(win) {
    const g = this.game;
    const s = this.save;
    const lv = g.level;
    let stars = 0;
    if (win) {
      stars = g.stars();
      s.stars[lv] = Math.max(s.stars[lv], stars);
      if (g.hard) { s.hardStars = s.hardStars || LEVELS.map(() => 0); s.hardStars[lv] = Math.max(s.hardStars[lv] || 0, stars); }
      s.unlocked = Math.max(s.unlocked, Math.min(LEVELS.length, lv + 2));
    }
    s.best[lv] = Math.max(s.best[lv] || 0, g.wave);
    if (g.endless) { s.bestEndless = s.bestEndless || {}; s.bestEndless[lv] = Math.max(s.bestEndless[lv] || 0, g.wave); }
    // v66: Ngân khố
    const khoGain = win ? Math.round((PREP.winBase + PREP.winPerLevel * (lv + 1) + PREP.winPerStar * stars) * (g.hard ? 1.5 : 1))
      : PREP.losePerWave * Math.max(0, g.wave - 1);
    // v103: thắng trận đầu tiên trong ngày (Phó bản) thưởng thêm
    const today = new Date().toISOString().slice(0, 10);
    const daily = win && s.dailyWin !== today ? PREP.dailyWin : 0;
    if (daily) s.dailyWin = today;
    s.kho = (s.kho || 0) + khoGain + daily;
    const tv = this.bankTuvi(win ? 1 : TUVI_LOSE);
    this.submitScores(win, stars);
    this.clearRun();
    this.bankStats();
    this.closeScreen();
    $('#reward').hidden = true;
    const rows = `<div><span>⚑ Đợt</span><b>${g.wave}/${g.levelWaves}</b></div>
      <div><span>♥ Mạng còn</span><b style="color:#FF8A6A">${g.lives}/${CONFIG.startLives}</b></div>
      <div><span>✕ Quái đã hạ</span><b>${fmt(g.stats.kills)}</b></div>
      <div><span>${coin()} Vàng kiếm trong trận</span><b style="color:#FFD66B">+${fmt(g.stats.goldEarned)}</b></div>
      <div><span>${coin()} Đầu trận ${fmt(CONFIG.startGold)} + kiếm ${fmt(g.stats.goldEarned)}${g.stats.goldRefund ? ` + hủy tướng ${fmt(g.stats.goldRefund)}` : ''} − đã tiêu ${fmt(Math.max(0, CONFIG.startGold + g.stats.goldEarned + (g.stats.goldRefund || 0) - g.gold))}</span><b style="color:#FFD66B">= ${fmt(g.gold)}</b></div>
      <div><span>Tướng trên sân</span><b>${g.heroes.filter(Boolean).length}</b></div>
      <div><span>🏦 Ngân khố nhận (mua đồ / tướng trước trận)</span><b style="color:#E4ECF4">${bac(1)} +${fmt(khoGain + daily)} → ${fmt(s.kho)}</b></div>
      ${daily ? `<div><span>☀ Thắng trận đầu trong ngày</span><b style="color:#FFE08A">${bac(1)} +${fmt(daily)}</b></div>` : ''}
      ${g.khoRun ? `<div><span>♾ Đã nhận giữa trận (mốc đợt / boss)</span><b style="color:#E4ECF4">${bac(1)} +${fmt(g.khoRun)}</b></div>` : ''}
      ${tv.rows.length ? `<div><span>☯ Tu Vi${win ? '' : ' (60%)'}</span><b style="color:#C8A0F0">${tv.rows.join(' · ')}</b></div>` : ''}
      ${tv.up.map((u) => `<div><span></span><b style="color:#FFD66B">${u}</b></div>`).join('')}`;
    const name = `Ải ${lv + 1} · ${LEVELS[lv].name}`;
    const html = win ? `<div class="screen" style="z-index:auto">
      <div class="scr-head metal"><h1 class="ttl">${name}</h1><span class="chip ok">✓ Đã giữ thành</span><div class="sp"></div></div>
      <div class="res-body">
        <div class="res-art">${svgI(sceneArt('win'))}<span class="tg2">NƯỚC RÚT</span></div>
        <div class="res-main">
          <div class="res-title win">Chiến thắng!</div>
          <div class="res-stars">${'★'.repeat(stars)}<i>${'★'.repeat(3 - stars)}</i></div>
          <div class="res-grid"><div class="res-table inset">${rows}</div>
            <div class="res-tips"><div class="h" style="color:#D9B25A">ĐIỀU KIỆN SAO</div>
              ${STAR_RULES.map((r, k) => `<div class="t"><i style="border-color:${stars > k ? '#3EDC4E' : '#5C4620'};color:${stars > k ? '#6AE06A' : '#7A705C'}">${k + 1}</i><span>${r}</span></div>`).join('')}</div></div>
          <div class="res-btns">
            ${lv + 1 < LEVELS.length ? '<button class="btn-gold" data-act="next-level">Ải tiếp theo ›</button>' : '<button class="btn-gold" data-act="endless">Năm nào cũng dâng nước ›</button>'}
            <button class="metal" style="color:#F2D27A" data-act="endless">Chơi vô tận</button>
            <button class="metal" style="color:#F2D27A" data-act="restart">↻ Chơi lại</button>
            <button class="metal" style="color:#F2D27A" data-act="to-map">Bản đồ</button></div>
        </div></div></div>`
      : `<div class="screen" style="z-index:auto">
      <div class="scr-head metal" style="border-color:#C8401E"><h1 class="ttl">${name}</h1><span class="chip run">Thành đã mất</span><div class="sp"></div></div>
      <div class="res-body">
        <div class="res-art" style="border-color:#2C6A86">${svgI(sceneArt('lose'))}<span class="tg2" style="border-color:#5AB4D6;color:#9EDDF2">NƯỚC NGẬP THÀNH</span></div>
        <div class="res-main">
          <div class="res-title lose">💧 Phong Châu thất thủ</div>
          <div style="display:flex;gap:12px;align-items:center"><div class="inset" style="padding:8px 16px;border-radius:6px;font-size:15px">Dừng ở đợt <b style="font-family:var(--title);font-size:34px;color:#9EDDF2">${g.wave}</b><span style="font-family:var(--title);font-size:20px;color:#9EDDF2">/${g.levelWaves}</span></div>
            <div style="flex:1"><div class="inset" style="height:12px;border-radius:4px;overflow:hidden"><i style="display:block;height:100%;width:${g.wave / g.levelWaves * 100}%;background:linear-gradient(90deg,#2C6A86,#5AB4D6)"></i></div>
            <div class="note" style="margin-top:4px">Kỷ lục ải này: đợt ${s.best[lv]}</div></div></div>
          <div class="res-tips"><div class="h">💡 MẸO LẦN SAU</div>
            <div class="t"><i>1</i><span><b>Ghép</b> 2 tướng cùng loại cùng sao và <b>hợp thể</b> đúng cặp để có tướng thần mạnh hơn hẳn.</span></div>
            <div class="t"><i>2</i><span>Đặt tướng <b>đánh xa</b> cho đợt <b style="color:#9EDDF2">Chim Bão</b> (quái bay).</span></div>
            <div class="t"><i>3</i><span>Nâng cấp tướng bằng <b>vàng</b> giữa các đợt; mở khóa W, E, R trong Cây kỹ năng.</span></div></div>
          <div class="res-btns">
            <button class="btn-gold" data-act="restart">↻ Chơi lại</button>
            <button class="metal" style="color:#F2D27A" data-act="to-map">Bản đồ</button>
            <button class="metal" style="color:#F2D27A" data-act="to-menu">Menu chính</button></div>
        </div></div></div>`;
    $('#result').innerHTML = html;
    $('#result').hidden = false;
    // v49: nút kết quả lên thanh trên (xa nút Lên cấp ở đáy) + khoá 1,2 giây chống bấm nhầm
    const rb = $('#result .res-btns'), hd = $('#result .scr-head');
    if (rb && hd) { hd.appendChild(rb); rb.classList.add('top'); }
    this.guard('#result');
  }

  // ============================================================
  //  HÀNH ĐỘNG (data-act)
  // ============================================================
  // khoá nút một lúc khi màn kết quả / sính lễ vừa hiện (đang bấm dở nút khác không bị bấm nhầm)
  guard(sel, ms = 1200) {
    this.guardUntil = performance.now() + ms;
    const el = $(sel);
    el.classList.add('guarded');
    clearTimeout(this.guardT);
    this.guardT = setTimeout(() => el.classList.remove('guarded'), ms);
  }
  action(d) {
    const g = this.game;
    if (['reward', 'next-level', 'endless', 'restart', 'to-map', 'to-menu'].includes(d.act)
      && (!$('#result').hidden || !$('#reward').hidden) && performance.now() < (this.guardUntil || 0)) return;
    const sc = this.screen;
    const h = g.heroes[this.sel];
    const fail = (r) => { if (r !== true && typeof r === 'string') this.toast(r, '#E25A3A'); return r === true; };
    switch (d.act) {
      // ----- menu, truyện, chiến dịch, cài đặt
      case 'story-next': {
        const ch = chapterOf(this.storyLevel);
        const n = ch.classic ? 3 : ch.panels.length;
        if (this.storyStep < n - 1) { this.storyStep++; this.renderStory(); break; }
      }
      // falls through: hết truyện → vào trận
      case 'story-skip': {
        const ch = chapterOf(this.storyLevel);
        if (ch.classic) this.save.storySeen = true; else { this.save.chSeen = this.save.chSeen || {}; this.save.chSeen[ch.id] = true; }
        writeSave(this.save); this.startLevel(this.storyLevel); break;
      }
      case 'cp-back': this.showMenu(); break;
      case 'cp-sel': this.cpSel = +d.i; this.renderCampaign(); break;
      case 'cp-ch': { const c = CHAPTERS[+d.i]; this.cpSel = Math.min(c.to, Math.max(c.from, this.save.unlocked - 1)); this.renderCampaign(); break; }
      case 'diff': this.save.settings.hard = d.k === '1'; writeSave(this.save); this.renderCampaign(); break;
      case 'cp-go': this.save.last = this.cpSel; this.playLevel(this.cpSel, this.cpMode === 'endless'); break;
      case 'cp-mode': this.cpMode = d.k; this.renderCampaign(); break;
      case 'mode-pick': $('#modes').hidden = true; this.cpMode = d.k; this.showCampaign(this.save.last); break;
      case 'mode-close': $('#modes').hidden = true; this.showMenu(); break;
      case 'set':
        this.save.settings[d.k] = !this.save.settings[d.k];
        writeSave(this.save);
        // đổi nguồn hình: tải lại trang cho mọi hình (cả thẻ <img> giao diện) đổi theo
        if (d.k === 'aiArt') { location.reload(); break; }
        this.renderSettings();
        break;
      case 'cloud-google': if (!CLOUD.enabled) break;
        this.loginErr = ''; CLOUD.google(() => this.save, (cs, o) => this.applyCloudSave(cs, o)).catch((e) => { this.loginErr = e.message; this.showLogin(this.loginFromMenu); }); break;
      case 'login-close': $('#login').hidden = true; this.loginFromMenu = false; this.showMenu(); break;
      case 'login-rename': {
        const v = (($('#lg-nick') || {}).value || '').trim().slice(0, 20);
        if (!v) { this.loginErr = 'Tên không được để trống'; this.showLogin(this.loginFromMenu); break; }
        this.save.nick = v; writeSave(this.save); this.loginErr = 'Đã đổi tên thành ' + v;
        if (CLOUD.user && CLOUD.user.updateProfile) CLOUD.user.updateProfile({ displayName: v }).catch(() => {});
        this.showLogin(this.loginFromMenu); this.showMenu(); $('#login').hidden = false;
        break;
      }
      case 'login-mode': this.loginMode = d.k; this.loginErr = ''; this.showLogin(this.loginFromMenu); break;
      case 'login-offline': this.offline = true; $('#login').hidden = true; break;
      case 'login-retry': location.reload(); break;
      case 'login-email': case 'login-reset': {
        const email = ($('#lg-email') || {}).value || '', pass = ($('#lg-pass') || {}).value || '', name = (($('#lg-name') || {}).value || '').trim();
        this.loginEmail = email.trim();
        const m = d.act === 'login-reset' ? 'reset' : this.loginMode || 'in';
        if (m === 'reset' && !this.loginEmail) { this.loginErr = 'Nhập email trước rồi bấm Quên mật khẩu'; this.showLogin(this.loginFromMenu); break; }
        this.loginBusy = true; this.loginErr = ''; this.showLogin(this.loginFromMenu);
        CLOUD.email(m, this.loginEmail, pass, name).then((msg) => { this.loginBusy = false; this.loginErr = msg; if (name) { this.save.nick = name; writeSave(this.save); }
          if (CLOUD.signedIn && !this.loginFromMenu) { $('#login').hidden = true; this.showMenu(); } else this.showLogin(this.loginFromMenu); })
          .catch((e) => { this.loginBusy = false; this.loginErr = e.message; this.showLogin(this.loginFromMenu); });
        break;
      }
      case 'prep-buy': this.prepBuy(d.id); break;
      case 'rank-tab': this.showRanks(d.k); break;
      case 'rank-nick': {
        const box = $('#ranks .rk-body');
        box.insertAdjacentHTML('afterbegin', `<div class="rk-nick inset"><span>Tên trên bảng xếp hạng:</span><input id="rk-nick-in" maxlength="20" value="${esc(this.playerName())}"><button class="btn btn-gold" data-act="rank-nick-ok" style="height:32px;padding:0 12px">Lưu</button></div>`);
        break;
      }
      case 'rank-nick-ok': {
        const v = ($('#rk-nick-in').value || '').trim().slice(0, 20);
        this.save.nick = v || null; writeSave(this.save); this.showRanks(this.ranksBoard); break;
      }
      case 'prep-hero': this.prepHero(d.id); break;
      case 'prep-go': $('#prep').hidden = true; this.saveRun(); break;
      case 'prep-forge': {
        // v78: Lò đúc trước trận trả bằng Ngân khố (đổi tạm vàng trong trận ↔ Ngân khố khi mở / đóng)
        $('#prep').hidden = true; this.prepForge = true; KHO_MODE = true;
        this.prepGold = g.gold; g.gold = this.save.kho || 0;
        if (!this.prepShopRolled) { g.rollShop(true); this.prepShopRolled = true; }
        this.openScreen('forge');
        break;
      }
      case 'cloud-sync': CLOUD.push(this.save, true); break;
      case 'cloud-out': this.loginFromMenu = false; CLOUD.signOut(); break;
      case 'set-close':
        $('#settings').hidden = true;
        if (this.settingsInGame && this.pauseWasRunning) g.running = true;
        this.wipeArmed = false;
        break;
      case 'wipe':
        if (!this.wipeArmed) { this.wipeArmed = true; this.renderSettings(); break; }
        this.save = loadSave();
        this.save.stars = LEVELS.map(() => 0); this.save.unlocked = 1; this.save.last = 0; this.save.best = {}; this.save.storySeen = false;
        writeSave(this.save);
        this.wipeArmed = false;
        this.toast('Đã xoá tiến trình', '#E25A3A');
        this.renderSettings();
        break;
      case 'restart': this.startLevel(g.level); break;
      case 'to-map': this.showCampaign(g.level); break;
      case 'to-menu': $('#settings').hidden = true; if (g.started) this.bankStats(); this.showMenu(); break;
      case 'ro-sel': this.rosterSel = d.type; this.renderRoster(); break;
      case 'ro-back':
        if (this.rosterInGame && $('#ranks').hidden && $('#treasury').hidden) { this.rosterInGame = false; $('#roster').hidden = true; if (this.rosterWasRunning) g.running = true; this.sig.fuse = ''; break; }
        this.showMenu(); break;
      case 'ro-buy': {
        const t = d.type, c = OWN_COST[HEROES[t].legend], s = this.save;
        s.owned = s.owned || [];
        if (s.owned.includes(t) || (s.kho || 0) < c) break;
        s.kho -= c; s.owned.push(t); writeSave(s);
        if (this.game.owned) this.game.owned.add(t);
        this.toast(`Đã mua ${HEROES[t].name}! Giờ có thể hợp thể ra trong trận`, '#6AE06A');
        this.renderRoster();
        break;
      }
      case 'lg-open': this.legacyHero = d.type; this.renderLegacy(); break;
      case 'lg-close': this.legacyHero = null; this.renderRoster(); break;
      case 'lg-buy': {
        const t = this.legacyHero, sys = LEGACY[t].find((x) => x.id === d.k), sv = this.save;
        const L = (sv.legacy = sv.legacy || {})[t] = (sv.legacy[t] || {});
        const lv = L[sys.id] || 0, c = LEGACY_COST[lv];
        if (lv >= LEGACY_MAX || (sv.kho || 0) < c || !(sv.owned || []).includes(t)) break;
        sv.kho -= c; L[sys.id] = lv + 1; writeSave(sv); setLegacy(sv.legacy);
        const m = sys.ms.find((x) => x.lv === lv + 1);
        this.toast(`${HEROES[t].name} · ${sys.name} cấp ${lv + 1}${m ? `: <b>${esc(m.t)}</b>` : ''}`, '#FFD66B');
        this.renderLegacy();
        break;
      }
      case 'rn-sel': this.runeSel = d.k; this.renderRunes(); break;
      case 'rn-hero': this.runeHero = d.k; this.runeResetArm = false; this.renderRunes(); break;
      case 'rn-buy': {
        const r = RUNE_BY[d.k], t = this.runeHero, lvs = this.heroRuneLv(t);
        const lv = lvs[r.id] || 0;
        if (lv >= r.max || this.runePtsLeft(t) < runePt(r) || !this.runeOpen(r)) break;
        lvs[r.id] = lv + 1; writeSave(this.save);
        setRunes(this.save.heroRunes);
        this.toast(`${HEROES[t].name} · ${r.name} cấp ${lv + 1}: ${esc(r.fmt(runeVal(r, lv + 1)))}`, RUNE_BRANCHES.find((b) => b.id === r.br).color);
        this.renderRunes();
        break;
      }
      case 'rn-reset': {
        if (!this.runeResetArm) { this.runeResetArm = true; this.renderRunes(); break; }
        this.save.heroRunes[this.runeHero] = {}; writeSave(this.save); setRunes(this.save.heroRunes);
        this.runeResetArm = false;
        this.toast(`Đã tẩy ấn ${HEROES[this.runeHero].name} — hoàn lại toàn bộ điểm`, '#F2D27A');
        this.renderRunes();
        break;
      }
      case 'rn-back':
        $('#runes').hidden = true; this.runeResetArm = false;
        if (this.runesFromRoster) { this.runesFromRoster = false; this.rosterSel = this.runeHero; this.renderRoster(); break; }
        if (this.runesInGame) { this.runesInGame = false; if (this.runesWasRunning) g.running = true; }
        else this.showMenu();
        break;
      case 'ro-runes': this.runesFromRoster = true; this.showRunes(this.rosterInGame, d.type); break;
      case 'ro-temple': location.href = 'den-anh-hung.html'; break;
      case 'next-level': this.save.last = Math.min(LEVELS.length - 1, g.level + 1); writeSave(this.save); this.showCampaign(this.save.last); break;
      case 'endless':
        g.endless = true;
        g.running = true;
        $('#result').hidden = true;
        this.saveRun();
        this.toast('Năm nào cũng dâng nước: quái mạnh dần, boss mỗi 10 đợt', '#5AB4D6');
        break;
      case 'reward': this.pickReward(+d.i); break;
      case 'summon': this.pickSummon(d.type); break;
      case 'summon-rand': this.summonRand(); break;
      case 'auto-merge': { const n = g.autoMerge(); this.toast(n ? `Đã ghép ${n} lần` : 'Không có cặp nào ghép được', n ? '#F2D27A' : '#E25A3A'); break; }
      case 'fuse-strip': {
        const f = FUSION[+d.i]; const pr = g.fusionProgress(f);
        // sáng 2 tướng thành phần trên sân vài giây
        this.fuseFocus = { i: +d.i, until: performance.now() + 6000 };
        this.sel = -1;
        if (pr.p < 1) {
          const why = [[f.a, pr.a], [f.b, pr.b]].map(([type, h]) => (h ? (g.fusionReady(h) === true ? `${HEROES[type].name} ✓` : g.fusionReady(h)) : `chưa có ${HEROES[type].name} trên sân`));
          this.toast(`<b>${HEROES[f.to].name} ${Math.floor(pr.p * 100)}%</b> · ${why.join(' · ')}`, RARITY[HEROES[f.to].legend].color); break; }
        const r = g.fuse(pr.a.slot, pr.b.slot); if (r !== true) this.toast(r, '#E25A3A'); else this.sel = pr.b.slot;
        break;
      }
      case 'merge-any': this.mergeAny(); break;
      case 'fuse-with': this.fuseWith(+d.slot); break;
      case 'legend-open': $('#legends').hidden = !$('#legends').hidden; $('#drawer').hidden = true; this.renderLegends(); break;
      case 'deck-close': this.clearSel(); $('#more').hidden = true; break;
      case 'quit-run':
        if (!this.quitArmed) { this.quitArmed = true; $('#quit-label').textContent = 'Bấm lần nữa để bỏ trận'; setTimeout(() => { this.quitArmed = false; const q = $('#quit-label'); if (q) q.textContent = 'Dừng chơi'; }, 3000); break; }
        this.quitArmed = false; $('#quit-label').textContent = 'Dừng chơi';
        $('#drawer').hidden = true;
        this.quitRun();
        break;
      case 'dw':
        $('#drawer').hidden = true;
        if (d.k === 'pause') this.showSettings(true);
        else if (d.k === 'heroes') this.showRoster(null, true);
        else if (d.k === 'runes') this.showRunes(true);
        else this.openScreen(d.k);
        break;
      // ----- bảng điều khiển dưới
      case 'cmd-skill': {
        if (!h) break;
        const i = +d.i;
        const sk = HEROES[h.type].skills[i];
        const r = skillLevel(h, i) ? g.upgradeSkill(h, i) : g.unlockSkill(h, i);
        if (r === true) this.toast(`<b>${sk.name}</b> cấp ${skillLevel(h, i)} · ${esc(sk.info(skillN(h.level)))}`, '#F2D27A');
        else this.toast(`<b>${sk.name}</b> (cấp ${skillLevel(h, i)}/${SKILL_MAX[i]}): ${r}<br><small>${esc(sk.info(skillN(h.level)))}</small>`, '#C8BFA8');
        this.sig.deck = null;
        break;
      }
      case 'hero-stats': this.statsOpen = !this.statsOpen; this.sig.deck = null; break;
      case 'sk-stat-deck': {
        if (!h) break;
        const r = g.spendStat(h);
        if (r !== true) this.toast(`Cộng chỉ số: ${r}. Lên cấp tướng để có điểm`, '#C8BFA8');
        this.sig.deck = null;
        break;
      }
      case 'moc':
        this.raising = !this.raising;
        this.moving = -1;
        if (this.raising) this.toast('Chạm vào ô ngập (hoặc sắp ngập) để Mọc Núi', '#F2D27A');
        break;
      case 'move':
        $('#more').hidden = true;
        this.moving = this.moving >= 0 ? -1 : this.sel;
        if (this.moving >= 0) this.toast('Chạm vào ô muốn chuyển tướng tới (ô có tướng thì đổi chỗ)', '#9dffc4');
        break;
      case 'sell':
        if (!h) break;
        if (!this.sellArmed) { this.sellArmed = true; this.renderMore(); break; }
        $('#more').hidden = true;
        this.toast(`Đã hủy ${HEROES[h.type].name}: +${g.sellValue(h)} vàng`, '#F2D27A');
        g.sellHero(this.sel);
        this.clearSel();
        break;
      case 'levelup': if (h) this.doLevelUp(h); break;
      case 'train': if (h) fail(g.trainHero(h)); break;
      case 'auto-eq-all': {
        const r = g.autoEquipAll();
        this.toast(r.items ? `Mặc ${r.items} món cho ${r.heroes} tướng (tướng mạnh chọn trước)` : 'Cả đội đã mặc đồ tốt nhất trong túi', r.items ? '#6AE06A' : '#C8BFA8');
        $('#more').hidden = true; $('#drawer').hidden = true;
        this.sig.deck = null;
        if (this.screen) this.renderScreen(true);
        break;
      }
      case 'set-uisize':
        this.save.settings.uiSize = d.k; writeSave(this.save);
        window.dispatchEvent(new Event('resize'));
        this.showSettings(!!this.game.started && !this.game.over);
        break;
      case 'set-gfx':
        this.save.settings.gfx = d.k; writeSave(this.save);
        if (typeof GFX !== 'undefined') { GFX.lv = 0; GFX.apply(); }
        this.showSettings(!!this.game.started && !this.game.over);
        break;
      case 'auto-up-gear': {
        const r = g.autoUpgradeGear();
        this.toast(r.n ? `Nâng ${r.n} lần đồ đang mặc · −${fmt(r.spent)} vàng (tướng mạnh trước, chừa vàng triệu hồi)` : 'Chưa nâng được: thiếu vàng hoặc chưa mặc đồ', r.n ? '#6AE06A' : '#C8BFA8');
        $('#more').hidden = true; $('#drawer').hidden = true;
        this.sig.deck = null;
        if (this.screen) this.renderScreen(true);
        break;
      }
      case 'auto-eq': {
        if (!h) { this.toast('Chọn một tướng trước', '#E25A3A'); break; }
        const n = g.autoEquip(h);
        this.toast(n ? `${HEROES[h.type].name} đã mặc ${n} món tốt hơn · lực chiến ${heroPower(h)}` : 'Đồ đang mặc đã là tốt nhất trong túi', n ? '#6AE06A' : '#C8BFA8');
        $('#more').hidden = true;
        this.sig.deck = null;
        if (this.screen) this.renderScreen(true);
        break;
      }
      case 'temper': if (fail(g.temper(+d.uid))) { this.toast('Tôi luyện thành công!', '#FFD66B'); this.renderScreen(true); } break;
      case 'reroll': if (fail(g.reroll(+d.uid))) { this.toast('Tẩy luyện: đã rút lại dòng phụ', '#A86CE0'); this.renderScreen(true); } break;
      case 'open-evo': $('#more').hidden = true; if (h) h.notice.evo = false; this.openScreen('evo'); break;
      case 'open-bag': $('#more').hidden = true; this.openScreen('bag', { slot: null }); break;
      case 'slot': this.openScreen('bag', { slot: d.slot }); break;

      // ----- màn hình chung
      case 'close': this.closeScreen(); break;
      case 'tab': sc.tab = d.tab; sc.pick = null; this.renderScreen(true); break;
      case 'hero-prev':
      case 'hero-next': {
        const list = g.heroes.map((x, i) => (x ? i : -1)).filter((i) => i >= 0);
        if (!list.length) break;
        const k = list.indexOf(this.sel);
        this.sel = list[(k + (d.act === 'hero-next' ? 1 : list.length - 1)) % list.length];
        this.renderScreen(true);
        break;
      }
      // Cây kỹ năng
      case 'sk-sel': sc.skill = +d.i; this.renderScreen(true); break;
      case 'sk-up': if (h && fail(g.upgradeSkill(h, +d.i))) this.renderScreen(true); break;
      case 'sk-stat': if (h && fail(g.spendStat(h))) this.renderScreen(true); break;
      case 'sk-unlock': if (h && fail(g.unlockSkill(h, +d.i))) { this.toast(`Mở khóa [${SKILL_KEYS[+d.i]}] ${HEROES[h.type].skills[+d.i].name}!`, '#A86CE0'); this.renderScreen(true); } break;
      case 'sk-level': if (h) { this.doLevelUp(h); this.renderScreen(true); } break;
      // Tiến hoá
      case 'evolve': if (h && fail(g.evolve(h))) this.renderScreen(true); break;
      case 'ascend': if (h && fail(g.ascend(h, d.to))) this.renderScreen(true); break;
      // Núi Tản Viên
      case 'soil': if (fail(g.soilMountain())) { this.toast('Bồi đất: núi cao thêm!', '#F2D27A'); this.renderScreen(true); } break;
      case 'harvest': {
        const n = g.harvestHerbs();
        if (n) this.toast(`Hái ${n} Linh Chi: +${n * MOUNTAIN.herbGold} vàng, tướng hồi máu`, '#6AE06A');
        this.renderScreen(true);
        break;
      }
      // Lò đúc
      case 'recipe': sc.recipe = d.id; this.renderScreen(true); break;
      case 'craft':
        if (g.craft(d.id)) { this.toast(`Đã đúc ${ITEMS[d.id].name}!`, RARITY[ITEMS[d.id].rarity].color); sc.justCrafted = d.id; }
        else this.toast(g.inventory.length >= CONFIG.bagSize ? 'Túi đầy' : 'Thiếu nguyên liệu hoặc vàng', '#E25A3A');
        this.renderScreen(true);
        break;
      case 'shop-sel': sc.shop = d.id; this.renderScreen(true); break;
      case 'sh-tab': sc.shopTab = d.k; this.renderScreen(true); break;
      case 'sh-sel': sc.si = +d.i; this.renderScreen(true); break;
      case 'sh-reroll': if (fail(g.rerollShop())) { sc.si = 0; this.renderScreen(true); } break;
      case 'sh-buy':
      case 'sh-buy-eq': {
        const o = g.shop[+d.i];
        const r = g.buyShop(+d.i);
        if (r && r.uid) {
          this.toast(`Đã mua ${ITEMS[r.id].name}`, RARITY[r.rarity].color);
          if (d.act === 'sh-buy-eq' && h && fail(g.equip(h, r.uid, slotFor(h, r)))) this.toast(`${HEROES[h.type].name} đã mặc ${ITEMS[o.inst.id].name}`, '#6AE06A');
        } else fail(r);
        this.renderScreen(true);
        break;
      }
      case 'quick-craft': {
        const r = g.quickCraft(d.id);
        if (r && r.uid) { this.toast(`Đã đúc ${ITEMS[d.id].name}!`, RARITY[ITEMS[d.id].rarity].color); sc.opened = r.uid; } else fail(r);
        this.renderScreen(true);
        break;
      }
      case 'buy': {
        const inst = g.buy(d.id);
        if (inst) { g.flags.shopOpened = true; this.toast(`Mua ${ITEMS[d.id].name}`, '#F2D27A'); }
        else this.toast(g.inventory.length >= CONFIG.bagSize ? 'Túi đầy' : `Cần ${ITEMS[d.id].price} vàng`, '#E25A3A');
        this.renderScreen(true);
        break;
      }
      case 'buy-craft': {
        const r = Object.keys(ITEMS).find((id) => ITEMS[id].recipe && ITEMS[id].recipe.parts.includes(d.id));
        if (g.buy(d.id) && r && !g.missingParts(r).length) {
          if (g.craft(r)) this.toast(`Đã đúc ${ITEMS[r].name}!`, RARITY[ITEMS[r].rarity].color);
        } else this.toast('Chưa đủ để ghép', '#E25A3A');
        this.renderScreen(true);
        break;
      }
      case 'chest': {
        const inst = g.buyChest(d.k);
        if (!inst) { this.toast(g.inventory.length >= CONFIG.bagSize ? 'Túi đầy' : 'Chưa đủ vàng', '#E25A3A'); break; }
        sc.opened = inst.uid;
        sc.shake = true;
        this.renderScreen(true);
        sc.shake = false;
        break;
      }
      case 'equip-new': {
        if (!h) { this.toast('Chọn một tướng trên bản đồ trước', '#E25A3A'); break; }
        if (fail(g.equip(h, +d.uid))) { this.toast(`${HEROES[h.type].name} đã đeo ${ITEMS[g.findItem(+d.uid).inst.id].name}`, '#6AE06A'); sc.opened = null; }
        this.renderScreen(true);
        break;
      }
      case 'stash': sc.opened = null; this.renderScreen(true); break;
      // Túi đồ
      case 'bag-pick': {
        // chạm lần hai vào món đang chọn: đeo luôn cho tướng
        const inst = g.inventory.find((i) => i.uid === +d.uid);
        if (sc.pick === +d.uid && h && inst && canEquip(h.type, inst.id)) {
          if (fail(g.equip(h, inst.uid, slotFor(h, inst)))) this.toast(`Đã đeo ${ITEMS[inst.id].name}`, '#6AE06A');
        } else sc.pick = +d.uid;
        this.renderScreen(true);
        break;
      }
      case 'bag-slot': {
        if (!h) break;
        const inst = h.equip[d.slot];
        sc.pick = inst ? inst.uid : null;
        sc.slot = d.slot;
        this.renderScreen(true);
        break;
      }
      case 'equip': if (h && fail(g.equip(h, +d.uid))) this.renderScreen(true); break;
      case 'unequip': if (h && fail(g.unequip(h, d.slot))) this.renderScreen(true); break;
      case 'enhance': if (fail(g.enhance(+d.uid))) { this.toast('Cường hóa thành công!', '#FFD66B'); this.renderScreen(true); } break;
      case 'promote': if (fail(g.promote(+d.uid))) { this.toast('Thăng phẩm!', '#A86CE0'); this.renderScreen(true); } break;
      case 'lock': g.toggleLock(+d.uid); this.renderScreen(true); break;
      case 'scrap': {
        const v = g.scrap(+d.uid);
        if (typeof v === 'number') { this.toast(`Đổi ra ${v} vàng`, '#F2D27A'); sc.pick = null; } else this.toast(v, '#E25A3A');
        this.renderScreen(true);
        break;
      }
      case 'sort': g.sortBag(); this.renderScreen(true); break;
      case 'flt': {
        const f = this.scrapFilter;
        f.rarities = f.rarities.includes(d.r) ? f.rarities.filter((x) => x !== d.r) : [...f.rarities, d.r];
        this.renderScreen(true);
        break;
      }
      case 'flt-up': this.scrapFilter.skipUpgraded = !this.scrapFilter.skipUpgraded; this.renderScreen(true); break;
      case 'open-scrap': sc.kind = 'scrap'; this.renderScreen(true); break;
      case 'back-bag': sc.kind = 'bag'; this.renderScreen(true); break;
      case 'scrap-go': {
        const r = g.scrapMany(this.scrapFilter);
        this.toast(`Đã đổi ${r.count} món: +${fmt(r.gold)} vàng`, '#F2D27A');
        sc.kind = 'bag';
        sc.pick = null;
        this.renderScreen(true);
        break;
      }
      // Bách khoa
      case 'bk-sel': sc.pick = d.id; this.renderScreen(true); break;
      case 'bk-ch': sc.ch = +d.i; sc.pick = null; this.renderScreen(true); break;
    }
  }

  // ============================================================
  //  MÀN HÌNH TRONG TRẬN
  // ============================================================
  openScreen(kind, o = {}) {
    const g = this.game;
    if (['skills', 'evo'].includes(kind) && !g.heroes[this.sel]) {
      const first = g.heroes.findIndex(Boolean);
      if (first < 0) return this.toast('Chưa có tướng nào trên sân', '#E25A3A');
      this.sel = first;
    }
    if (kind === 'bag' && !g.heroes[this.sel]) {
      const first = g.heroes.findIndex(Boolean);
      if (first >= 0) this.sel = first;
    }
    if (kind === 'forge') g.flags.shopOpened = true;
    this.scrapFilter = this.scrapFilter || { rarities: ['common', 'rare'], skipUpgraded: false };
    $('#legends').hidden = true;
    this.screen = { kind, tab: kind === 'forge' ? 'recipe' : kind === 'codex' ? 'enemy' : null, ...o };
    const el = $('#screen');
    el.style.zIndex = o.top ? 30 : '';
    el.hidden = false;
    this.sig.screen = null;
    this.renderScreen(true);
  }

  closeScreen() {
    this.screen = null;
    $('#screen').hidden = true;
    if (this.prepForge) {
      const g = this.game;
      this.prepForge = false; KHO_MODE = false; this.save.kho = g.gold; g.gold = this.prepGold; writeSave(this.save);
      this.showPrep();
    }   // đóng Lò đúc mở từ bảng chuẩn bị → quay lại bảng
  }

  head(title, chips, right, icon) {
    return `<div class="scr-head metal">${icon ? `<span class="ic">${icon}</span>` : ''}<h1 class="ttl">${title}</h1>${chips || ''}<div class="sp"></div>${right || ''}
      <div class="goldbox inset">${coin()}${fmt(this.game.gold)}</div>
      <button class="xbtn metal" data-act="close" aria-label="Đóng">${ICON.close}</button></div>`;
  }
  runChip() { return this.game.started && this.game.running && !this.screen?.top ? RUN_CHIP : ''; }

  renderScreen(force) {
    const sc = this.screen;
    if (!sc) return;
    const g = this.game;
    const h = g.heroes[this.sel];
    const heroKey = h ? `${h.id}|${h.type}|${h.level}|${h.skillPts}|${h.statPts || 0}|${h.tier}|${JSON.stringify(h.skillLv)}|${SLOTS.map((s) => h.equip[s] ? h.equip[s].uid + '.' + h.equip[s].plus + h.equip[s].rarity + h.equip[s].locked + (h.equip[s].temper || 0) + (h.equip[s].aff || []).join('') : '').join()}` : '';
    const invKey = g.inventory.map((i) => i.uid + '.' + i.plus + i.rarity + (i.locked ? 'L' : '') + (i.temper || 0) + (i.aff || []).join('')).join();
    const key = [assetVersion, sc.kind, sc.tab, sc.skill, sc.pick, sc.recipe, sc.shop, sc.opened, sc.slot, heroKey, invKey,
      g.mountain.growth, g.mountain.herbs, g.mountain.soiled, g.wave, g.running, JSON.stringify(this.scrapFilter), Object.keys(g.seen).length,
      g.known.size, h ? h.train || 0 : 0].join('|');
    // vàng đổi liên tục khi quái chết: chỉ dựng lại vì vàng tối đa 1 lần / 0,8 giây
    const now = performance.now();
    const goldOnly = this.sig.screen === key && this.sig.screenGold !== g.gold;
    if (!force && this.sig.screen === key && (!goldOnly || now - (this.sig.screenT || 0) < 800)) return;
    this.sig.screen = key;
    this.sig.screenGold = g.gold;
    this.sig.screenT = now;
    const el = $('#screen');
    // giữ vị trí cuộn của các vùng cuộn khi dựng lại
    const scrolls = [...el.querySelectorAll('*')].map((x, i) => [i, x.scrollTop, x.scrollLeft]).filter(([, t, l]) => t || l);
    el.innerHTML = this['render_' + sc.kind]();
    if (scrolls.length) { const all = el.querySelectorAll('*'); for (const [i, t, l] of scrolls) if (all[i]) { all[i].scrollTop = t; all[i].scrollLeft = l; } }
    if (sc.shake) { const j = el.querySelector('.jar-stage'); if (j) j.classList.add('shake'); }
    el.querySelectorAll('canvas[data-enemy]').forEach((cv) => drawEnemyIcon(cv, cv.dataset.enemy, +cv.dataset.pad || 0.1));
    this.liveScreen();
  }

  liveScreen() {
    const g = this.game;
    const h = g.heroes[this.sel];
    const t = performance.now() / 1000;
    document.querySelectorAll('#screen canvas[data-hero]').forEach((cv) => {
      if (!h) return;
      const tier = cv.dataset.tier !== undefined ? +cv.dataset.tier : h.tier;
      drawHeroPortrait(cv, { ...h, tier }, t, { full: true });
    });
  }

  // ---------- Cây kỹ năng
  render_skills() {
    const g = this.game;
    const h = g.heroes[this.sel];
    if (!h) return this.closeScreen() || '';
    const def = HEROES[h.type];
    const sc = this.screen;
    const si = sc.skill ?? 0;
    const cols = def.skills.map((sk, i) => {
      const lv = skillLevel(h, i);
      const max = SKILL_MAX[i];
      const type = i === 3 ? 'TỐI THƯỢNG' : sk.active ? 'CHỦ ĐỘNG' : 'NỘI TẠI';
      const nodes = [];
      for (let L = max; L >= 1; L--) {
        const req = skillReqLevel(i, L);
        const label = L === 1 ? 'Cấp 1' : `Cấp ${L} · +${(L - 1) * 25}%`;
        let cls, right;
        if (L <= lv) { cls = 'done'; right = ICON.check; }
        else if (L === lv + 1 && lv > 0) {
          const okLv = h.level >= req;
          cls = okLv && (h.from ? g.gold >= COSTS.skillGold(i, lv) : h.skillPts > 0) ? 'nxt metal' : 'fut';
          right = `<span class="req ${okLv ? 'ok' : ''}">${okLv ? ICON.check : ICON.lock}cấp ${req}</span>`;
        } else { cls = lv ? 'fut' : 'lck'; right = `<span class="req ${h.level >= req ? 'ok' : ''}">${h.level >= req ? ICON.check : ICON.lock}cấp ${req}</span>`; }
        nodes.push(`<div class="nd ${cls}"><span>${label}</span>${right}</div>`);
        if (L > 1) nodes.push(`<div class="ln ${L <= lv ? '' : 'off'}"></div>`);
      }
      let btn;
      if (!lv) {
        const can = h.level >= COSTS.unlockReq[i];
        btn = `<div class="reqline ${can ? 'ok' : ''}">${can ? ICON.check : ICON.lock}<span>Cần tướng cấp ${COSTS.unlockReq[i]}${can ? ' · đã đạt' : ''}</span></div>
          <button class="up unl ${can && g.gold >= unlockCost(h, i) ? 'btn-gold' : 'btn-ghost'}" data-act="sk-unlock" data-i="${i}" ${can && g.gold >= unlockCost(h, i) ? '' : 'disabled'}>
            <span style="font-family:var(--title);font-size:15px">Mở khóa</span><span style="display:flex;align-items:center;gap:4px">${coin(1)}${unlockCost(h, i)} vàng</span></button>`;
      } else if (lv >= max) {
        btn = `<button class="up metal" disabled style="color:#FFD66B">Đã tối đa</button>`;
      } else {
        const gc = COSTS.skillGold(i, lv);
        const ok = (h.from ? g.gold >= gc : h.skillPts > 0) && h.level >= skillReqLevel(i, lv + 1);
        btn = `<button class="up metal ${ok ? 'ok' : ''}" data-act="sk-up" data-i="${i}" ${ok ? '' : 'disabled'}>${ICON.up}Nâng · ${h.from ? coin(1) + gc : '1 điểm'}</button>`;
      }
      const status = !lv ? (i === 0 ? 'Có sẵn' : 'Chưa mở khóa') : i === 0 ? 'Có sẵn' : 'Đã mua';
      return `<div class="col metal ${si === i ? 'on' : ''} ${!lv ? 'lock' : ''}" data-act="sk-sel" data-i="${i}">
        <div class="hd"><div class="ico inset" style="${si === i ? 'border-color:#FFD66B' : ''}">${svgI(skillIcon(h.type, i))}</div>
          <div style="display:flex;flex-direction:column;flex:1;min-width:0"><span class="hk">${SKILL_KEYS[i]} · ${type}</span><span class="st ${lv && i ? 'ok' : ''}">${status}</span></div></div>
        <span class="nmx">${sk.name} <span>${lv}/${max}</span></span>
        ${nodes.join('')}
        ${btn}</div>`;
    }).join('');
    const sk = def.skills[si];
    const lv = skillLevel(h, si);
    const n = skillN(h.level);
    const nextOk = lv && lv < SKILL_MAX[si] && h.level >= skillReqLevel(si, lv + 1);
    const detail = `<div class="sk-detail panel metal">
      <div class="dh"><div class="ico inset">${svgI(skillIcon(h.type, si))}</div><div><div class="ttl">${sk.name}</div>
        <small>${SKILL_KEYS[si]} · ${sk.active ? 'Chủ động · tốn năng lượng' : 'Nội tại'}</small></div></div>
      <div class="desc">${esc(sk.info(n))}${sk.active ? '. Tướng tự dùng khi đủ năng lượng.' : '.'}</div>
      <div class="kvt inset">
        <div><span>Cấp kỹ năng</span><b>${lv} / ${SKILL_MAX[si]}</b></div>
        <div><span>Sức mạnh</span><b>${lv ? `+${(lv - 1) * 25}%` : '—'}${lv && lv < SKILL_MAX[si] ? ` → <span style="color:#6AE06A">+${lv * 25}%</span>` : ''}</b></div>
        ${sk.active ? `<div><span>Năng lượng · hồi chiêu</span><b>${sk.active.mana} · ${sk.active.cooldown}s</b></div>` : ''}
        ${lv && lv < SKILL_MAX[si] ? `<div><span>Cấp ${lv + 1} cần</span><b class="${nextOk ? 'ok' : 'no'}">Tướng cấp ${skillReqLevel(si, lv + 1)}</b></div>` : ''}
        ${!lv ? `<div><span>Mở khóa</span><b class="${h.level >= COSTS.unlockReq[si] ? 'ok' : 'no'}">${unlockCost(h, si)} vàng · cấp ${COSTS.unlockReq[si]}</b></div>` : ''}
        <div><span>Chi phí nâng</span><b>${h.from ? `${lv ? COSTS.skillGold(si, lv) : '—'} vàng (đã thăng thần)` : `1 điểm (còn ${h.skillPts})`}</b></div>
      </div>
      ${!lv ? `<button class="big-btn btn-gold" data-act="sk-unlock" data-i="${si}" ${h.level >= COSTS.unlockReq[si] && g.gold >= unlockCost(h, si) ? '' : 'disabled'}>Mở khóa · ${coin(1)} ${unlockCost(h, si)}</button>`
        : lv < SKILL_MAX[si] ? (h.from
          ? `<button class="big-btn btn-gold" data-act="sk-up" data-i="${si}" ${nextOk && g.gold >= COSTS.skillGold(si, lv) ? '' : 'disabled'}>${ICON.up} Nâng lên cấp ${lv + 1} · ${coin(1)} ${COSTS.skillGold(si, lv)}</button>`
          : `<button class="big-btn btn-gold" data-act="sk-up" data-i="${si}" ${nextOk && h.skillPts ? '' : 'disabled'}>${ICON.up} Nâng lên cấp ${lv + 1} · 1 điểm</button>`)
        : '<button class="big-btn metal" disabled style="color:#FFD66B">Đã tối đa</button>'}
      ${h.skillPts && !g.canSpendSkillPts(h) ? `<button class="btn btn-gold stat-btn" data-act="sk-stat">Nâng chỉ số: 1 điểm → +${COSTS.statPt} ${ATTRS[heroMain(def)].short}${h.statPts ? ` · đã +${h.statPts * COSTS.statPt}` : ''}</button>` : ''}
      ${!h.skillPts && h.level < CONFIG.maxLevel ? `<button class="btn metal" style="height:34px;color:#F2D27A" data-act="sk-level">Nâng cấp tướng · ${coin(1)} ${g.levelCost(h)} (+1 điểm)</button>` : ''}
    </div>`;
    const hk = 'h.' + h.type, hd = SECRETS[hk];
    const hidChip = `<span class="chip hidc ${g.known.has(hk) ? 'ok' : ''}" title="${esc(g.known.has(hk) ? hd.desc : hd.hint)}">${g.known.has(hk) ? '✦ ' + esc(hd.desc) : `??? “${esc(hd.hint)}”`}</span>`;
    const pst = heroStats(h);
    const penChip = `<span class="chip dark" title="Xuyên giáp / xuyên kháng phép (chiêu R xuyên thêm ${ULT_PEN}%)">⚔ ${Math.round(pst.pierce)}% · ✦ ${Math.round(pst.mpen)}%</span>`;
    return `${this.head('Cây kỹ năng', `<span class="chip dark">${def.name} · Cấp ${h.level}${h.train ? ` ✦${h.train}` : ''}</span>${penChip}${elChip(def.el)}${hidChip}
        ${h.skillPts ? `<span class="chip ok">Còn ${h.skillPts} điểm kỹ năng</span>` : ''}${this.runChip()}`)}
      <div class="scr-body" style="padding-bottom:4px"><div class="sk-cols">${cols}</div>${detail}</div>
      <div class="foot">${h.from ? `${coin(1)} <b>Đã thăng thần:</b> mở khóa <b>W ${COSTS.unlockAsc[1]} · E ${COSTS.unlockAsc[2]} · R ${COSTS.unlockAsc[3]}</b>, nâng kỹ năng bằng vàng · điểm kỹ năng đổi thành chỉ số` : `${coin(1)} Giá mở khóa: <b>W 60</b> · <b>E 150</b> (cấp 3) · <b>R 300</b> (cấp 6) vàng`} <span style="color:#5C4620">|</span> Mỗi cấp tướng +1 điểm · mỗi cấp kỹ năng +25% sức mạnh · kỹ năng mạnh dần theo cấp tướng</div>`;
  }

  // ---------- Lò đúc đồng
  render_forge() {
    const g = this.game;
    const sc = this.screen;
    const tabs = `<div class="tabs">
      <button class="tab ${sc.tab === 'recipe' ? 'on' : 'metal'}" data-act="tab" data-tab="recipe">📜 Công thức</button>
      <button class="tab ${sc.tab === 'shop' ? 'on' : 'metal'}" data-act="tab" data-tab="shop">🪙 Cửa hàng</button>
      <button class="tab ${sc.tab === 'chest' ? 'on' : 'metal'}" data-act="tab" data-tab="chest">🏺 Hũ báu</button><span class="zig"></span></div>`;
    let body = '';
    if (sc.tab === 'recipe') {
      const recipes = Object.keys(ITEMS).filter((id) => ITEMS[id].recipe);
      const cur = sc.recipe || recipes[0];
      const it = ITEMS[cur];
      const miss = g.missingParts(cur);
      const list = recipes.map((id) => {
        const m = g.missingParts(id).length;
        return `<button class="row ${id === cur ? 'on metal' : 'inset'}" data-act="recipe" data-id="${id}">
          <span class="slot ${rarCls(ITEMS[id].rarity)}">${svgI(itemIcon(id))}</span>
          <span style="min-width:0;flex:1"><span class="rn" style="display:block">${ITEMS[id].name}</span><span class="ri" style="display:block">${ITEMS[id].recipe.parts.map((p) => ITEMS[p].name).join(' + ')}</span></span>
          <span class="rm ${m ? (id === cur ? 'mis' : '') : 'okk'}">${m ? `Thiếu ${m}` : 'Đủ'}</span></button>`;
      }).join('');
      const firstMiss = miss[0];
      const parts = it.recipe.parts.map((p, k) => {
        const have = !miss.includes(p) || it.recipe.parts.slice(0, k).filter((x) => x === p).length < g.countOwned(p);
        const ok = g.countOwned(p) >= it.recipe.parts.filter((x) => x === p).length || !miss.includes(p);
        return `${k ? '<span class="craft-plus">+</span>' : ''}<div class="craft-part"><span class="slot ${ok ? rarCls(ITEMS[p].rarity) : 'miss'}">${svgI(itemIcon(p))}${ok ? '<span class="eq" style="color:#3EDC4E;font-size:14px;top:-6px;left:auto;right:-6px">●</span>' : ''}</span>
          <span>${ITEMS[p].name}</span><small style="color:${ok ? '#6AE06A' : '#FFD66B'}">${ok ? 'Đã có' : 'Chưa có'}</small></div>`;
      }).join('');
      body = `<div class="scr-body">
        <div class="panel metal" style="width:282px;flex:none"><div class="ph"><span class="ttl">Công thức đúc</span><small>${recipes.length} công thức</small></div><div class="rc-list">${list}</div></div>
        <div class="panel metal" style="flex:1">
          <div class="ph"><span><span class="ttl" style="font-size:24px">${it.name}</span> <small style="margin-left:8px">Công thức · ${it.recipe.parts.length} món · ${RARITY[it.rarity].name}</small></span>
            ${miss.length ? `<span class="chip goldc" style="border-color:#F2D27A">Thiếu ${miss.length} món</span>` : '<span class="chip ok">Đủ nguyên liệu</span>'}</div>
          <div class="craft-stage inset">${parts}<span class="craft-arrow">➜</span>
            <div class="craft-part"><span class="craft-out">${svgI(itemIcon(cur))}</span><span class="ttl" style="font-size:15px">${it.name}</span></div></div>
          <div class="aura-line inset">${it.hasteAura ? `<b>Hào quang:</b> ${esc(it.desc.replace('Hào quang: ', ''))}` : `<b>Chỉ số:</b> ${statLine(it.stats)}${it.desc ? ` · <b>Hiệu ứng:</b> ${esc(it.desc)}` : ''}`}
            ${it.counter ? `<br><b style="color:#FF8A6A">Khắc chế:</b> ${ENEMIES[it.counter].name}` : ''}</div>${secretLine(g, 'r.' + cur)}
          <div class="note" style="font-size:11px;line-height:1.25">Đeo ở <b>ô phụ kiện</b> (không chiếm chỗ vũ khí, mũ, giáp) · hiệu ứng riêng + ẩn + hào quang · cường hóa, thăng phẩm được</div>
          ${this.bestFor({ uid: -1, id: cur, rarity: it.rarity, plus: 0 })}
          <div style="display:flex;gap:10px;margin-top:auto">
            ${miss.length && g.quickCraftCost(cur) !== null ? `<button class="btn btn-gold" style="flex:1;height:46px;font-size:15px" data-act="quick-craft" data-id="${cur}" ${g.gold < g.quickCraftCost(cur) ? 'disabled' : ''}>Mua thiếu & ghép · ${coin()} ${g.quickCraftCost(cur)}</button>` : ''}
            <button class="btn ${miss.length ? 'btn-ghost' : 'btn-gold'}" style="flex:1;height:46px;font-size:15px" data-act="craft" data-id="${cur}" ${miss.length || g.gold < it.recipe.cost ? 'disabled' : ''}>
              ${miss.length ? `${ICON.lock} Ghép (thiếu ${miss.length} món)` : `Ghép · ${coin()} ${it.recipe.cost} vàng`}</button></div>
        </div></div>`;
    } else if (sc.tab === 'shop' && sc.shopTab !== 'parts') {
      // hàng mới mỗi đợt
      const h = g.heroes[this.sel];
      const shop = g.shop || [];
      const si = Math.min(shop.length - 1, sc.si ?? 0);
      const cur = shop[si];
      const cards = shop.map((o, i) => {
        const it = ITEMS[o.inst.id];
        const gain = h && !o.sold ? upgradeGain(h, o.inst) : 0;
        const best = !o.sold && !gain ? g.bestHeroFor(o.inst) : null;
        return `<button class="sh-card ${i === si ? 'on' : 'metal'} ${o.sold ? 'sold' : ''}" data-act="sh-sel" data-i="${i}">
          <span class="slot ${rarCls(o.inst.rarity)}">${svgI(itemIcon(o.inst.id))}${elDot(o.inst)}</span>
          <span class="nm">${it.name}</span><small class="c-${o.inst.rarity}">${RARITY[o.inst.rarity].name} · ${SLOT_NAMES[it.slot]}</small>
          <span class="gn">${o.sold ? 'Đã mua' : gain ? `▲ +${gain} ${HEROES[h.type].name}` : best ? `▲ hợp ${HEROES[best.hero.type].name}` : (o.inst.aff || []).length ? `${o.inst.aff.length} dòng phụ` : ''}</span>
          <span class="pr">${o.sold ? '—' : coin(1) + o.price}</span></button>`;
      }).join('');
      let det = '<div class="note">Chọn một món để xem.</div>';
      if (cur) {
        const it = ITEMS[cur.inst.id];
        const gain = h ? upgradeGain(h, cur.inst) : 0;
        det = `<div class="it-head"><span class="slot ${rarCls(cur.inst.rarity)}">${svgI(itemIcon(cur.inst.id))}</span><div><div class="ttl">${it.name}</div><small class="c-${cur.inst.rarity}">${RARITY[cur.inst.rarity].name} · ${SLOT_NAMES[it.slot]}${it.wclass ? ' ' + WCLASS_NAMES[it.wclass].toLowerCase() : ''}</small></div></div>
          <div class="stat-list">${statLine(itemStats(cur.inst, h && h.type), true)}</div>
          ${cur.inst.el ? `<div class="elrow">${elChip(cur.inst.el)}</div>` : ''}
          ${(cur.inst.aff || []).map((a) => `<div class="aff">◆ ${AFFIXES[a].label(affixVal(cur.inst, a))}</div>`).join('')}
          ${itemHiddens(cur.inst).map((k) => secretLine(g, k)).join('')}
          ${it.desc ? `<div class="note">${esc(it.desc)}</div>` : ''}
          ${this.bestFor(cur.inst)}
          <div style="display:flex;gap:6px;margin-top:auto">
            <button class="btn btn-gold" style="flex:1;height:42px" data-act="sh-buy" data-i="${si}" ${cur.sold || g.gold < cur.price ? 'disabled' : ''}>Mua · ${coin()} ${cur.price}</button>
            ${h && gain ? `<button class="btn metal" style="flex:1;height:42px;color:#6AE06A" data-act="sh-buy-eq" data-i="${si}" ${cur.sold || g.gold < cur.price ? 'disabled' : ''}>Mua & đeo</button>` : ''}</div>`;
      }
      const rc = SHOP.reroll(g.shopRerolls || 0);
      body = `<div class="scr-body">
        <div class="panel metal" style="flex:1"><div class="ph"><span class="ttl">Hàng mới</span><small>Nhập hàng mỗi đợt · đồ tốt dần theo đợt</small>
            <div class="seg inset" style="margin-left:auto"><button class="on">Đồ</button><button data-act="sh-tab" data-k="parts">Nguyên liệu</button></div></div>
          <div class="sh-grid">${cards}</div>
          <button class="btn metal" style="height:38px;color:#F2D27A" data-act="sh-reroll" ${g.gold < rc ? 'disabled' : ''}>⟳ Làm mới hàng · ${coin(1)} ${rc}</button></div>
        <div class="panel metal sh-det" style="width:260px;flex:none">${det}</div></div>`;
    } else if (sc.tab === 'shop') {
      const shop = Object.keys(ITEMS).filter((id) => ITEMS[id].price);
      const cur = sc.shop || shop[shop.length - 1];
      const it = ITEMS[cur];
      const rec = Object.keys(ITEMS).find((id) => ITEMS[id].recipe && ITEMS[id].recipe.parts.includes(cur));
      const other = rec && ITEMS[rec].recipe.parts.filter((p) => p !== cur);
      const canCraftAfter = rec && other.every((p) => g.countOwned(p) > 0);
      const h = g.heroes[this.sel];
      const freeAcc = h ? ACC_SLOTS.filter((s) => !h.equip[s]).length : 0;
      body = `<div class="scr-body">
        <div class="panel metal" style="flex:1"><div class="ph"><span class="ttl">Nguyên liệu ghép</span><small>Phụ kiện cơ bản, luôn có bán</small>
            <div class="seg inset" style="margin-left:auto"><button data-act="sh-tab" data-k="stock">Đồ</button><button class="on">Nguyên liệu</button></div></div>
          <div class="shop-grid inset">${shop.map((id) => {
            const own = g.countOwned(id);
            return `<button class="shop-it ${id === cur ? 'on' : 'metal'}" data-act="shop-sel" data-id="${id}">
              <span class="slot rt">${svgI(itemIcon(id))}${own ? '<span class="lv" style="color:#6AE06A">●</span>' : ''}</span><span class="nm">${ITEMS[id].name}</span>
              <span class="pr ${own && id !== cur ? 'own' : ''}">${own && id !== cur ? `Đã có ${own}` : coin(1) + ITEMS[id].price}</span></button>`;
          }).join('')}</div></div>
        <div class="panel metal" style="width:260px;flex:none">
          <div class="it-head"><span class="slot rt">${svgI(itemIcon(cur))}</span><div><div class="ttl">${it.name}</div><small>Phụ kiện · Thường</small></div></div>
          <div class="aura-line inset">${esc(it.desc || '')}${rec ? `${canCraftAfter ? ` Bạn đã có ${other.map((p) => ITEMS[p].name).join(', ')}.` : ''}` : ''}</div>
          <div class="stat-list">${statLine(it.stats, true)}</div>
          ${rec ? `<div class="inset" style="border-radius:4px;padding:6px 8px;display:flex;align-items:center;gap:8px">
            ${ITEMS[rec].recipe.parts.map((p, k) => `${k ? '<b style="color:#F2D27A">+</b>' : ''}<span class="slot ${p === cur || g.countOwned(p) ? 'rt' : ''}" style="width:34px;height:34px;${p === cur ? 'border-style:dashed;border-color:#FFD66B !important' : ''}">${svgI(itemIcon(p))}</span>`).join('')}
            <b style="color:#F2D27A">→</b><span class="slot ${rarCls(ITEMS[rec].rarity)}" style="width:34px;height:34px;border-radius:50%">${svgI(itemIcon(rec))}</span><span style="font-size:12px;font-weight:800;color:#F2D27A">${ITEMS[rec].name}</span></div>` : ''}
          <div class="note">${h ? `Đeo cho: <b style="color:#E8E0CC">${HEROES[h.type].name}</b> (còn ${freeAcc} ô phụ kiện)` : 'Mua xong mở Túi đồ để đeo cho tướng'}</div>
          <button class="big-btn btn-gold" data-act="buy" data-id="${cur}" ${g.gold < it.price ? 'disabled' : ''}>Mua · ${coin()} ${it.price} vàng</button>
          ${rec && canCraftAfter ? `<button class="btn metal" style="height:40px;color:#FFD66B;font-size:14px" data-act="buy-craft" data-id="${cur}" ${g.gold < it.price + ITEMS[rec].recipe.cost ? 'disabled' : ''}>Mua và ghép luôn (+${ITEMS[rec].recipe.cost})</button>` : ''}
        </div></div>`;
    } else {
      const op = sc.opened && g.findItem(sc.opened);
      const inst = op && op.inst;
      body = `<div class="scr-body">
        <div class="panel metal" style="flex:1">
          <div class="jar-stage inset"><div class="t"><div class="ttl">Hũ báu</div><div class="note">Mở để nhận một món ngẫu nhiên</div></div>${svgI(sceneArt('hubau'))}</div>
          <div style="display:flex;align-items:center;gap:10px"><div class="rar-chips" style="display:none"></div>
            </div>
          <div class="jars">${JARS.map((j) => `<button class="jar-btn ${j.id === 'small' ? 'metal' : j.id === 'big' ? 'metal rh' : 'metal rl'}" data-act="chest" data-k="${j.id}" ${g.gold < j.cost ? 'disabled' : ''}>
            ${uiIc(j.id === 'king' ? 'hu-vua-hung' : j.id === 'big' ? 'hu-dong' : 'hu-bau')}<b>${j.name}</b><small>${j.desc}</small><span>${coin(1)} ${j.cost}</span></button>`).join('')}</div>
          <div class="note" style="text-align:center">Mở thêm <b style="color:#C8A0F0">${Math.max(1, JAR_PITY - (g.jarCount || 0))}</b> hũ nữa: chắc chắn ra đồ Sử thi trở lên.</div>
        </div>
        <div class="panel metal" style="width:260px;flex:none"><div class="ttl" style="font-size:17px">Vừa mở được</div>
          ${inst ? `<div class="inset" style="border-radius:6px;padding:10px;border-color:${RARITY[inst.rarity].color}"><div class="it-head"><span class="slot ${rarCls(inst.rarity)}">${svgI(itemIcon(inst.id))}</span>
            <div><div class="ttl">${ITEMS[inst.id].name}</div><small class="c-${inst.rarity}">${RARITY[inst.rarity].name} · ${SLOT_NAMES[ITEMS[inst.id].slot]}</small></div></div>
            <div class="stat-list" style="margin-top:6px">${statLine(itemStats(inst), true)}</div>${this.bestFor(inst)}</div>
            ${!op.hero ? `<button class="big-btn btn-gold" style="margin-top:0" data-act="equip-new" data-uid="${inst.uid}">Đeo cho tướng</button>
            <button class="btn metal" style="height:44px;font-size:14px" data-act="stash">${ICON.bag} Cất vào túi</button>` : '<div class="chip ok" style="text-align:center">Đã đeo</div>'}`
            : '<div class="note">Chưa mở hũ nào.</div>'}
          <div class="note" style="margin-top:auto;font-size:11px">≈ Đồ còn rơi từ quái; quái tinh anh và boss rơi đồ xịn hơn.</div>
        </div></div>`;
    }
    return `${this.head('Lò đúc đồng', this.prepForge ? `<span class="chip kho">Trả bằng Ngân khố ${bac(1)} — không phải vàng trận</span>` : `<span class="chip dark">Đợt ${g.wave}</span>${this.runChip()}`, '', svgI(sceneArt('drum')))}${tabs}${body}`;
  }

  // ---------- Túi đồ
  render_bag() {
    const g = this.game;
    const sc = this.screen;
    const h = g.heroes[this.sel];
    const def = h && HEROES[h.type];
    const slotBtn = (s) => {
      const inst = h && h.equip[s];
      const lab = { weapon: 'Vũ khí', helmet: 'Mũ', armor: 'Giáp' }[s] || '';
      return `<button class="slot ${inst ? rarCls(inst.rarity) : ''} ${inst && sc.pick === inst.uid ? 'sel' : ''}" data-act="bag-slot" data-slot="${s}" ${h ? '' : 'disabled'} aria-label="${SLOT_NAMES[s]}">
        ${inst ? svgI(itemIcon(inst.id)) + (inst.plus ? `<span class="lv">+${inst.plus}${inst.temper ? '✦' : ''}</span>` : '') + elDot(inst) : `<span class="ph">${lab}</span>`}</button>`;
    };
    const left = `<div class="panel metal bag-hero">
      <div class="hsel"><button class="metal" data-act="hero-prev" aria-label="Tướng trước">‹</button><span class="ttl">${h ? def.name : 'Chưa có tướng'}</span><button class="metal" data-act="hero-next" aria-label="Tướng sau">›</button></div>
      <div style="text-align:center;font-size:12px;color:#C8BFA8">${h ? `Cấp ${h.level}${h.tier ? ' · ' + '★'.repeat(h.tier) : ''} · <b style="color:#FFD66B">Lực chiến ${heroPower(h)}</b><br>Xuyên giáp ${Math.round(heroStats(h).pierce)}% · xuyên kháng phép ${Math.round(heroStats(h).mpen)}%` : 'Triệu hồi tướng để mặc đồ'}</div>
      <div class="eqwrap"><div class="eqcol"><small>Trang phục</small>${GEAR_SLOTS.map(slotBtn).join('')}</div>
        <div class="fig inset">${h ? '<canvas data-hero width="172" height="300"></canvas>' : ''}</div>
        <div class="eqcol"><small>Phụ kiện</small>${ACC_SLOTS.map(slotBtn).join('')}</div></div>
      <div class="note" style="text-align:center">${h ? setNote(h) || `${elIcon(def.el, 14)} Hành ${ELEMENTS[def.el].name} · chạm đồ trong túi rồi bấm Đeo` : 'Chạm đồ trong túi rồi bấm Đeo'}</div></div>`;
    const cells = [];
    for (let i = 0; i < CONFIG.bagSize; i++) {
      const inst = g.inventory[i];
      if (!inst) { cells.push('<span class="slot"></span>'); continue; }
      const bad = h && !canEquip(h.type, inst.id);
      const gain = h && !bad ? upgradeGain(h, inst) : 0;
      cells.push(`<button class="slot ${rarCls(inst.rarity)} ${sc.pick === inst.uid ? 'sel' : ''} ${bad ? 'dim' : ''}" data-act="bag-pick" data-uid="${inst.uid}" aria-label="${ITEMS[inst.id].name}">
        ${svgI(itemIcon(inst.id))}${inst.plus ? `<span class="lv">+${inst.plus}${inst.temper ? '✦' : ''}</span>` : ''}${inst.locked ? `<span class="lk">${ICON.lock}</span>` : ''}${elDot(inst)}${gain ? '<span class="upa">▲</span>' : ''}</button>`);
    }
    const f = this.scrapFilter;
    const list = g.scrapList(f);
    const lockedN = g.inventory.filter((i) => f.rarities.includes(i.rarity) && i.locked).length;
    const mid = `<div class="bag-mid"><div class="bag-grid inset">${cells.join('')}</div>
      <div class="scrap-bar metal"><div class="ph"><span class="ttl">Đổi đồ ra vàng</span><small>Lọc theo chất lượng</small></div>
        <div class="rflt">${RARITY_ORDER.map((r) => `<button class="c-${r} ${f.rarities.includes(r) ? 'on' : ''}" data-act="flt" data-r="${r}">${f.rarities.includes(r) ? ICON.check : ''}${RARITY[r].name}</button>`).join('')}</div>
        <button class="scrap-go" data-act="open-scrap" ${list.length ? '' : 'disabled'}>Chọn ${list.length} món để đổi${lockedN ? ` (bỏ qua ${lockedN} món khóa)` : ''}</button></div></div>`;
    // thẻ chi tiết
    const f2 = sc.pick && g.findItem(sc.pick);
    let det;
    if (f2) {
      const inst = f2.inst;
      const it = ITEMS[inst.id];
      const nextR = RARITY_ORDER[RARITY_ORDER.indexOf(inst.rarity) + 1];
      const onHero = f2.hero;
      const canEq = h && canEquip(h.type, inst.id);
      const forHero = onHero || h;
      const rel = forHero && itemRelation(inst.el, HEROES[forHero.type].el);
      const relTxt = rel && { same: ['ok', 'Hợp mệnh', `+${ELEM.item.same}% chỉ số gốc`], sinh: ['ok', 'Tương sinh', `+${ELEM.item.sinh}% chỉ số gốc`],
        khac: ['no', 'Khắc mệnh', `${ELEM.item.khac}% chỉ số gốc`] }[rel];
      const setInfo = it.set ? `<div class="setl" style="border-color:${SETS[it.set].color}"><b style="color:${SETS[it.set].color}">${SETS[it.set].name}</b> · hợp ${SETS[it.set].fit}
        <br>2 món: ${SETS[it.set].p2}<br>3 món: ${SETS[it.set].p3}${SETS[it.set].el ? ` · cùng hành tướng (Thiên mệnh): mạnh thêm 50%` : ''}</div>${secretLine(g, 's.' + it.set)}` : '';
      const extra = `${inst.el || relTxt ? `<div class="elrow">${elChip(inst.el)}${relTxt ? `<span class="rel ${relTxt[0]}">${relTxt[1]} với ${HEROES[forHero.type].name}: ${relTxt[2]}</span>` : ''}</div>` : ''}
        ${(inst.aff || []).map((a) => `<div class="aff">◆ ${AFFIXES[a].label(affixVal(inst, a))}</div>`).join('')}
        ${itemHiddens(inst).map((k) => secretLine(g, k)).join('')}${setInfo}`;
      const temperC = COSTS.temper(inst.temper || 0), rerollC = COSTS.reroll(inst.rerolls || 0);
      let cmp = '';
      if (h && !onHero && canEquip(h.type, inst.id)) {
        const now = heroPower(h), after = powerWith(h, slotFor(h, inst), inst), dd = after - now;
        cmp = `<div class="cmp ${dd > 0 ? 'ok' : dd < 0 ? 'no' : ''}">Lực chiến ${def.name}: ${now} → <b>${after}</b> (${dd >= 0 ? '+' : ''}${dd})</div>`;
      }
      det = `<div class="panel metal bag-det">
        <div class="it-head"><span class="slot ${rarCls(inst.rarity)}">${svgI(itemIcon(inst.id))}${inst.plus ? `<span class="lv">+${inst.plus}</span>` : ''}</span>
          <div style="min-width:0"><div class="ttl" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${it.name}</div><small class="c-${inst.rarity}">${RARITY[inst.rarity].name} · ${it.slot === 'weapon' ? 'Vũ khí ' + WCLASS_NAMES[it.wclass].toLowerCase() : SLOT_NAMES[it.slot]}${onHero ? ' · đang đeo' : ''}</small></div></div>
        <div class="enh inset"><div class="row1"><span>Cường hóa</span>${inst.plus >= 5 ? `<span class="full">FULL +5${inst.temper ? ` ✦${inst.temper}` : ''}</span>` : `<span style="color:#FFD66B;font-weight:800">+${inst.plus}</span>`}</div>
          <div class="pips">${[1, 2, 3, 4, 5].map((k) => `<i class="${inst.plus >= k ? 'on' : ''}"></i>`).join('')}</div>
          ${cmp}<div class="stat-list">${statLine(itemStats(inst, forHero && forHero.type), true)}</div>
          ${it.desc ? `<div class="note">${esc(it.desc)}</div>` : ''}${extra}</div>
        ${inst.plus >= 5 && nextR ? `<div class="prom"><span class="c-${inst.rarity}">${RARITY[inst.rarity].name} +5</span> ⟶ <span class="c-${nextR}">${RARITY[nextR].name} +0</span></div>` : ''}
        <div class="det-btns">
          ${inst.plus < 5 ? `<button class="btn btn-gold" data-act="enhance" data-uid="${inst.uid}" ${g.gold < enhanceCost(inst) ? 'disabled' : ''}>Cường hóa +${inst.plus + 1} · ${coin()} ${enhanceCost(inst)}</button>`
            : nextR ? `<button class="btn btn-gold" data-act="promote" data-uid="${inst.uid}" ${g.gold < promoteCost(inst) ? 'disabled' : ''}>Thăng phẩm · ${promoteCost(inst)} vàng</button>`
            : `<button class="btn btn-gold" data-act="temper" data-uid="${inst.uid}" ${g.gold < temperC ? 'disabled' : ''}>${uiIc('toi-luyen')}Tôi luyện ✦${(inst.temper || 0) + 1} · ${temperC} vàng</button>`}
          ${onHero ? `<button class="btn metal" style="color:#F2D27A" data-act="unequip" data-slot="${f2.slot}">Tháo xuống túi</button>`
            : `<button class="btn metal" style="color:${canEq ? '#6AE06A' : '#7A705C'}" data-act="equip" data-uid="${inst.uid}" ${canEq ? '' : 'disabled'}>${h ? (canEq ? `Đeo cho ${def.name}` : `Không hợp ${def.name}`) : 'Chưa có tướng'}</button>`}
          <div class="r2"><button class="btn metal" data-act="lock" data-uid="${inst.uid}">${ICON.lock} ${inst.locked ? 'Mở khóa' : 'Khóa'}</button>
            ${inst.aff && inst.aff.length ? `<button class="btn metal" style="color:#C8A0F0" data-act="reroll" data-uid="${inst.uid}" ${inst.locked || g.gold < rerollC ? 'disabled' : ''}>${uiIc('tay-luyen')}Tẩy luyện · ${rerollC}</button>` : ''}
            ${onHero ? '' : `<button class="btn metal" style="color:#FFD66B" data-act="scrap" data-uid="${inst.uid}" ${inst.locked ? 'disabled' : ''}>Đổi ${scrapValue(inst)} vàng</button>`}</div>
        </div></div>`;
    } else {
      det = `<div class="panel metal bag-det"><div class="ttl" style="font-size:17px">Chi tiết món đồ</div>
        <div class="note">Chạm một món trong túi hoặc trên tướng để xem chỉ số, cường hóa (+1 đến +5, mỗi cấp +10% chỉ số gốc), thăng phẩm khi đủ +5, khóa hoặc đổi ra vàng.</div>
        <div class="kvt inset"><div><span>Cường hóa Thường</span><b>20 × cấp</b></div><div><span>Hiếm / Sử thi</span><b>40 / 80 × cấp</b></div><div><span>Huyền thoại</span><b>150 × cấp</b></div>
          <div><span>Thăng phẩm</span><b>120 / 300 / 600</b></div><div><span>Tôi luyện (Huyền thoại +5)</span><b>300 + 100 × lần</b></div></div>
        <div class="note">Đồ trang phục làm <b style="color:#FFD66B">tướng đổi hình dạng</b> và mang 1 <b>hành</b>: cùng hành với tướng +10% chỉ số gốc, khắc mệnh −10%. Đồ rơi có dòng phụ; đồ Sử thi trở lên có hiệu ứng ẩn.</div></div>`;
    }
    return `${this.head('Túi đồ', `<span class="chip dark">${g.inventory.length} / ${CONFIG.bagSize} ô</span>${this.runChip()}`,
      `${h ? '<button class="btn btn-gold" data-act="auto-eq">▲ Tự mặc đồ tốt nhất</button>' : ''}<button class="btn metal" style="color:#6AE06A" data-act="auto-eq-all">▲ Mặc cả đội</button><button class="btn metal" style="color:#FFD66B" data-act="auto-up-gear">⬆ Nâng đồ tự động</button><button class="btn metal" data-act="sort">Sắp xếp</button>`)}<div class="scr-body">${left}${mid}${det}</div>`;
  }

  // ---------- Đổi đồ ra vàng
  render_scrap() {
    const g = this.game;
    const f = this.scrapFilter;
    const list = g.scrapList(f);
    const by = (r) => g.inventory.filter((i) => i.rarity === r);
    const opts = RARITY_ORDER.map((r) => {
      const all = by(r), ok = all.filter((i) => list.includes(i));
      return `<button class="sc-opt c-${r} ${f.rarities.includes(r) ? 'on' : ''}" data-act="flt" data-r="${r}">
        <span class="ck">${f.rarities.includes(r) ? ICON.check : ''}</span><span class="n">${RARITY[r].name}</span>
        <span class="c">${ok.length < all.length && f.rarities.includes(r) ? `${ok.length} / ` : ''}${all.length} món</span><span class="p">${COSTS.scrap[r]} / món</span></button>`;
    }).join('');
    const lockedN = g.inventory.filter((i) => i.locked).length;
    const upN = g.inventory.filter((i) => i.spent > 0).length;
    const rows = RARITY_ORDER.map((r) => {
      const n = list.filter((i) => i.rarity === r).length;
      return n ? `<div><span class="c-${r}">${RARITY[r].name} × ${n}</span><b>${n * COSTS.scrap[r]}</b></div>` : '';
    }).join('');
    const upgraded = list.filter((i) => i.spent > 0);
    const refund = upgraded.reduce((a, i) => a + Math.floor(i.spent * 0.6), 0);
    const total = list.reduce((a, i) => a + scrapValue(i), 0);
    return `<div class="scr-head metal"><button class="xbtn metal" data-act="back-bag" aria-label="Quay lại">${ICON.back}</button><h1 class="ttl">Đổi đồ ra vàng</h1>
        <span class="chip dark">Túi: ${g.inventory.length} / ${CONFIG.bagSize} ô</span><div class="sp"></div><div class="goldbox inset">${coin()}${fmt(g.gold)}</div></div>
      <div class="scr-body">
        <div class="panel metal" style="flex:1"><div class="ttl" style="font-size:17px">Chọn chất lượng cần đổi</div>${opts}
          <div style="border-top:1px solid #3A3226;margin-top:2px"></div>
          <div class="tg"><span class="sw on" aria-hidden="true"></span><span>Bỏ qua đồ đã khóa</span><span class="n2">${lockedN} món</span></div>
          <div class="tg"><button class="sw ${f.skipUpgraded ? 'on' : ''}" data-act="flt-up" aria-label="Bỏ qua đồ đã nâng cấp"></button><span>Bỏ qua đồ đã nâng cấp</span><span class="n2">${upN} món</span></div></div>
        <div class="panel metal" style="flex:1.05"><div class="ph"><span class="ttl">Sẽ đổi ${list.length} món</span><small>Túi còn ${g.inventory.length - list.length} / ${CONFIG.bagSize} ô</small></div>
          <div class="inset" style="border-radius:6px;padding:6px;display:flex;gap:4px;flex-wrap:wrap;min-height:50px">${list.slice(0, 11).map((i) => `<span class="slot ${rarCls(i.rarity)}" style="width:36px;height:36px">${svgI(itemIcon(i.id))}${i.plus ? `<span class="lv">+${i.plus}</span>` : ''}</span>`).join('')}${list.length > 11 ? `<span class="slot" style="width:36px;height:36px;font-weight:800;color:#C8BFA8">+${list.length - 11}</span>` : ''}</div>
          <div class="sum inset">${rows || '<div><span>Chưa chọn món nào</span></div>'}${upgraded.length ? `<div><span>Hoàn 60% vàng đã nâng cấp (${upgraded.length} món)</span><b>${refund}</b></div>` : ''}
            <div class="tot"><span>Nhận được</span><b>${coin()} +${fmt(total)}</b></div></div>
          ${upgraded.length ? `<div class="warnbox">⚠ Có ${upgraded.length} món đã nâng cấp: ${upgraded.slice(0, 3).map((i) => `${ITEMS[i.id].name} +${i.plus}`).join(', ')}. Đổi rồi không lấy lại được.</div>` : ''}
          <div style="display:flex;gap:10px;margin-top:auto"><button class="btn metal" style="flex:1;height:46px;font-size:16px" data-act="back-bag">Hủy</button>
            <button class="btn btn-gold" style="flex:2;height:46px;font-size:16px" data-act="scrap-go" ${list.length ? '' : 'disabled'}>Đổi ${list.length} món · +${fmt(total)} vàng</button></div></div>
      </div>`;
  }

  // ---------- Tiến hoá
  render_evo() {
    const g = this.game;
    const h = g.heroes[this.sel];
    if (!h) return this.closeScreen() || '';
    const def = HEROES[h.type];
    const t = h.tier || 0;
    const cards = [0, 1, 2].map((k) => {
      const bought = t > k, cur = t === k;
      const needLv = evoReq(h, k);
      const cost = evoCost(h, k);
      // tướng vàng: Thần tinh mạnh hơn tướng tím (nhân ASC_EVO_MULT), hiện đúng số
      const mul = h.from ? ASC_EVO_MULT[def.legend] || 1 : 1;
      const bon = Object.fromEntries(Object.entries(EVO_BONUS[h.from ? 'asc' : 'base'][k + 1]).map(([key, v]) => [key, Math.round(v * mul)]));
      const lvOk = h.level >= needLv;
      let btn;
      if (!h.from) {
        // tướng Thường: lên sao bằng ghép 2 tướng cùng loại cùng sao (không mua bằng vàng)
        const twin = g.heroes.find((o) => o && o !== h && g.canMerge(o, h) === true);
        btn = bought ? `<button class="big-btn done" disabled>${ICON.check} ĐÃ ĐẠT</button>`
          : cur && twin ? `<button class="big-btn btn-gold" data-act="merge-any">Ghép 2 → ${'★'.repeat(k + 1)}</button>`
          : `<button class="big-btn btn-ghost" disabled>Ghép 2 tướng ${'★'.repeat(k)}</button>`;
      } else if (bought) btn = `<button class="big-btn done" disabled>${ICON.check} ĐÃ MUA</button>`;
      else if (cur && lvOk) btn = `<button class="big-btn btn-gold" data-act="evolve" ${g.gold < cost ? 'disabled' : ''}>${h.from ? 'Thần tinh' : 'Tiến hoá'} · ${coin()} ${cost}</button>`;
      else if (cur) btn = `<button class="big-btn metal" style="color:#F2D27A;border-color:#FFD66B;font-size:13px" data-act="sk-level" ${g.gold < g.levelCost(h) ? 'disabled' : ''}>${ICON.dup} Nâng cấp tướng · ${coin(1)} ${g.levelCost(h)}</button>`;
      else btn = `<button class="big-btn btn-ghost" disabled>${ICON.lock} Khóa · cần cấp ${needLv}</button>`;
      return `<div class="evo-card metal ${cur ? 'cur' : ''} ${!bought && !cur ? 'lockd' : ''}">
        <div class="stars ${bought || cur ? '' : 'off'}" ${h.from ? 'style="color:#FF7A3A"' : ''}>${'★'.repeat(k + 1)}</div>
        <div class="well inset">${svgI(sceneArt('evo'))}<canvas data-hero data-tier="${k + 1}" width="250" height="300" style="position:absolute;inset:0;width:100%;height:150px"></canvas>${!bought && !cur ? `<span class="lk">${ICON.lock}</span>` : ''}</div>
        <div class="pr">${h.from ? `${coin()} ${cost} vàng · <span class="req ${lvOk ? '' : 'no'}">${cur && !lvOk ? 'Cần' : 'cần'} cấp ${needLv}</span>` : `Ghép ${k === 0 ? 'triệu hồi ra là có' : `2 × ${'★'.repeat(k)}`}`}</div>
        <div class="ds">${h.from && cur && !lvOk ? `Đang cấp ${h.level} · còn ${needLv - h.level} cấp` : h.from ? (def.legend === 'legendary' ? ['Lửa thần vàng', 'Hào quang vàng rực', 'Thần tinh vàng tối đa'] : ['Vòng lửa thần', 'Lửa thần rực hơn', 'Thần tinh tối đa'])[k] : ['To hơn, hào quang trống đồng', 'Hào quang rực hơn', 'Bậc cao nhất'][k]}<br><b>${evoText(bon)}</b></div>
        ${btn}</div>`;
    }).join('');
    // bộ đồ đang mặc nhiều món nhất (chưa có thì giới thiệu Bộ Lạc Long)
    const sc0 = setCounts(h.equip);
    const setK = Object.keys(sc0).sort((a, b) => sc0[b] - sc0[a])[0] || 'laclong';
    const SD = SETS[setK];
    const pieces = [[SD.ids[def.wclass], 'Vũ khí', 'weapon'], [SD.ids.helmet, 'Mũ', 'helmet'], [SD.ids.armor, 'Giáp', 'armor']];
    const have = pieces.filter(([id, , s]) => h.equip[s] && h.equip[s].id === id).length;
    return `${this.head(h.from ? 'Thần tinh' : 'Tiến hoá', `<span class="chip dark">${def.name} · Cấp ${h.level}</span>${elChip(def.el)}${t ? `<span class="chip goldc">★ Bậc ${t}</span>` : ''}${this.runChip()}`)}
      <div class="scr-body">${cards}
        ${ASCEND[h.type] ? this.ascendPanel(h) : `<div class="panel metal set-panel"><div class="ph"><span class="ttl" style="font-size:20px">${SD.name}</span><small style="font-weight:800;color:#E8E0CC;font-size:14px">${have} / 3 món</small></div>
          ${pieces.map(([id, lab, s]) => `<div class="set-row inset ${h.equip[s] && h.equip[s].id === id ? 'have' : ''}"><span class="slot ${h.equip[s] && h.equip[s].id === id ? 'rl' : ''}">${svgI(itemIcon(id))}</span><span class="n">${ITEMS[id].name}</span><small>${lab}</small></div>`).join('')}
          <div class="inset" style="margin-top:auto;border-radius:6px;padding:8px 10px;font-size:12px;line-height:1.35">${elChip(SD.el)}
            <div><b style="color:#F2D27A">2 món:</b> ${SD.p2}</div><div><b style="color:#F2D27A">Đủ bộ:</b> ${SD.p3}</div>
            <div style="color:#C8BFA8">${SD.look3}${SD.el === def.el ? ' · <b style="color:#FFD66B">Thiên mệnh: cùng hành, mạnh thêm 50%</b>' : ''}</div></div></div>`}
      </div>`;
  }

  // dòng "hợp nhất cho tướng nào" của một món (lực chiến tăng bao nhiêu)
  bestFor(inst) {
    const g = this.game;
    const b = g.bestHeroFor(inst);
    if (!b) return g.heroes.some(Boolean) ? '<div class="bestf no">Chưa làm tướng nào trên sân mạnh hơn</div>' : '';
    return `<div class="bestf">▲ Hợp nhất: <b>${HEROES[b.hero.type].name}</b> +${b.gain} lực chiến</div>`;
  }

  // bảng Thăng thần trong màn Tiến hoá
  ascendPanel(h) {
    const g = this.game;
    const need = g.ascendNeed(h);
    const ready = g.fusionReady(h);
    const left = g.skillsLeft(h);
    const ck = (ok) => `<b style="color:${ok ? '#6AE06A' : '#E25A3A'}">${ok ? '✓' : '✗'}</b>`;
    return `<div class="panel metal set-panel asc-panel"><div class="ph"><span class="ttl" style="font-size:20px">Hợp thể</span><small>${ready === true ? 'tướng này đủ điều kiện' : 'chưa đủ điều kiện'}</small></div>
      <div class="asc-req inset">${ck((h.tier || 0) >= need)} ${h.from ? 'Thần tinh ' : ''}${'★'.repeat(need)}
        <span>${ck(!left.length)} Kỹ năng tối đa${left.length ? ` <small>(còn ${left.map(([k, lv, mx]) => `${k} ${lv}/${mx}`).join(' · ')})</small>` : ''}</span></div>
      ${(ASCEND[h.type] || []).map((t) => {
        const d = HEROES[t];
        const f = FUSION.find((x) => x.to === t);
        const pt = fusionPartner(h.type, t);
        const o = g.heroes.filter((x) => x && x !== h && x.type === pt).sort((x, y) => (y.tier || 0) - (x.tier || 0))[0];
        const ok = o ? g.canFuse(o, h) : `Cần thêm ${HEROES[pt].name} ${h.from ? 'Thần tinh ★★★' : '★★★'} trên sân`;
        return `<div class="asc-opt inset ${d.legend}"><img src="${heroImgUrl(t, 'head')}" alt="">
          <div class="tx"><b>${d.name}</b> ${elIcon(d.el, 13)}<small style="color:${RARITY[d.legend].color}">${RARITY[d.legend].name} · ${esc(d.trait.name)}</small>
            <em class="asc-pw">= ${HEROES[h.type].name} + <b>${HEROES[pt].name}</b>${o ? ` <small>(ô ${o.slot + 1}, ${'★'.repeat(o.tier || 0)})</small>` : ''}</em>
            ${o && typeof ok !== 'string' ? `<em class="asc-pw">Lực chiến → <b>${g.fusePreview(o, h)}</b></em>` : `<span style="color:#FFB08A">${esc(typeof ok === 'string' ? ok : '')}</span>`}
            <span title="${esc(f.why)}">${esc(f.why)}</span></div>
          <button class="btn ${typeof ok !== 'string' ? 'btn-gold' : 'btn-ghost'}" data-act="fuse-with" data-slot="${o ? o.slot : ''}" ${typeof ok !== 'string' ? '' : 'disabled'}>${coin(1)}${COSTS.ascend[d.legend]}</button></div>`;
      }).join('')}
      <div class="note">Cách khác: kéo tướng này thả lên tướng đối tác. Giữ cấp, đồ và <b>nội tại của cả hai</b>; thêm Thần lực (Sử thi ×${ASCEND_POWER.epic}, Huyền thoại ×${ASCEND_POWER.legendary}).</div></div>`;
  }


  // ---------- Núi Tản Viên
  render_mountain() {
    const g = this.game;
    const st = g.mountainStage();
    const m = g.mountain;
    const cards = MOUNTAIN.stages.map((name, i) => {
      const k = i + 1;
      const past = k < st, cur = k === st;
      return `<div class="mt-card metal ${cur ? 'cur' : ''} ${!past && !cur ? 'fut' : ''}">
        ${cur ? '<span class="tag">Hiện tại</span>' : ''}
        <div class="well inset">${svgI(sceneArt('mountain' + k))}${!past && !cur ? `<span class="lkb">${ICON.lock}</span>` : ''}</div>
        <div class="nm">${k} · ${name}</div>
        ${past ? `<div class="st ok">${ICON.check} Đã qua</div>` : cur ? (k < 5 ? `<div class="pbar inset"><i style="width:${g.mountainProgress() * 100}%"></i></div>` : '<div class="st gold">Đỉnh cao nhất</div>')
          : k === 4 ? '<div class="st gold">Mở: Linh Chi mọc 2 cây/đợt</div>' : k === 3 ? '<div class="st gold">Mở: mọc Linh Chi</div>' : k === 2 ? '<div class="st gold">Mở: +1 mạng mỗi 3 đợt</div>' : '<div class="st">Giai đoạn cuối</div>'}
      </div>`;
    }).join('');
    return `${this.head('Núi Tản Viên', `<i style="font-size:14px;color:#C8BFA8">Nước dâng bao nhiêu, núi cao bấy nhiêu</i>${this.runChip()}`, '', ICON.mount)}
      <div class="scr-body" style="flex-direction:column">
        <div class="mt-stages">${cards}</div>
        <div class="mt-tiles">
          <div class="nt-tile inset"><div class="nt-ico metal">${coin()}</div><div><div class="nt-lbl">VÀNG MỖI ĐỢT</div><div class="nt-val">+${st * MOUNTAIN.goldPerStage}</div><div class="nt-note">Giai đoạn ${st} × ${MOUNTAIN.goldPerStage}</div></div></div>
          <div class="nt-tile inset"><div class="nt-ico metal" style="color:#E25A3A">♥</div><div><div class="nt-lbl">MẠNG THÀNH</div><div class="nt-val">${st >= 2 ? '+1 mỗi 3 đợt' : 'Chưa mở'}</div><div class="nt-note">Mở từ giai đoạn 2</div></div></div>
          <button class="nt-tile metal act" data-act="harvest" ${m.herbs ? '' : 'disabled'}><div class="nt-ico inset">🍄</div><div><div class="nt-val" style="font-size:19px;color:#F2D27A">Hái ${m.herbs} Linh Chi</div><div class="nt-note">${coin(1)} <b>+${m.herbs * MOUNTAIN.herbGold} vàng</b> · <b style="color:#6AE06A">hồi máu</b></div></div></button>
          <div class="nt-tile inset"><div class="nt-ico metal">🍄</div><div><div class="nt-lbl">LINH CHI</div><div class="nt-val">${MOUNTAIN.herbGold} vàng / cây</div><div class="nt-note">${st >= 3 ? 'Mọc 1 cây mỗi đợt (tối đa 5)' : 'Mọc từ giai đoạn 3'} · hồi <b style="color:#6AE06A">máu tướng</b></div></div></div>
          <button class="nt-tile actg" data-act="soil" ${m.soiled || g.gold < MOUNTAIN.soilCost || st >= 5 ? 'disabled' : ''}><div class="nt-ico" style="background:#0D0B0833;border:1px solid #5A3608">⛰</div><div><div class="nt-val">Bồi đất · ${MOUNTAIN.soilCost} vàng</div><div class="nt-note">${m.soiled ? 'Đợt này đã bồi đất' : 'Núi cao nhanh hơn · 1 lần/đợt'}</div></div></button>
        </div></div>`;
  }

  // ---------- Bách khoa · Bí truyền: mọi hiệu ứng ẩn, lưu vĩnh viễn
  render_secrets(seg) {
    const g = this.game;
    const groups = [
      ['Tướng', (d) => d.hero], ['Đồ trang phục theo hành', (d) => d.el], ['Đồ ghép', (d) => d.item],
      ['Bộ đồ', (d) => d.set], ['Quái & boss', (d) => d.enemy],
    ];
    const n = SECRET_KEYS.filter((k) => g.known.has(k)).length;
    const cols = groups.map(([title, f]) => {
      const keys = SECRET_KEYS.filter((k) => f(SECRETS[k]));
      const got = keys.filter((k) => g.known.has(k)).length;
      return `<div class="bt-group"><div class="bt-h"><span class="ttl">${title}</span><small>${got} / ${keys.length}</small></div>${keys.map((k) => {
        const d = SECRETS[k], ok = g.known.has(k);
        const icon = d.hero ? `<img src="${heroImgUrl(d.hero, 'head')}" alt="" class="${ok ? 'gold' : ''}">` : d.el ? elIcon(d.el, 22)
          : d.item ? svgI(itemIcon(d.item)) : d.set ? svgI(itemIcon(SETS[d.set].ids.helmet)) : `<canvas data-enemy="${d.enemy}" data-pad="0.05" width="44" height="44"></canvas>`;
        return `<div class="bt-row ${ok ? 'ok' : ''}"><span class="bt-ic">${icon}</span><span class="bt-tx"><b>${secretTitle(k)}${d.hero ? ' ' + elIcon(HEROES[d.hero].el, 12) : ''}</b>
          <span>${ok ? esc(d.desc) : `??? · <i>“${esc(d.hint)}”</i>`}</span></span></div>`;
      }).join('')}</div>`;
    }).join('');
    return `${this.head('Bách khoa · Bí truyền', this.runChip(), seg, '<svg viewBox="0 0 24 24" width="26" height="26"><rect x="4" y="3" width="16" height="18" rx="2" fill="none" stroke="#F2D27A" stroke-width="1.8"/><circle cx="12" cy="10" r="3" fill="none" stroke="#F2D27A" stroke-width="1.6"/></svg>')}
      <div class="bt-top metal"><span class="ttl">Đã khám phá ${n} / ${SECRET_KEYS.length}</span><div class="pbar inset"><i style="width:${(n / SECRET_KEYS.length) * 100}%"></i></div>
        <span class="note">Hiệu ứng ẩn hiện ra lần đầu điều kiện xảy ra trong trận. Khám phá hiệu ứng ẩn của một tướng sẽ mở <b style="color:#FFD66B">khung chân dung vàng</b>.</span></div>
      <div class="scr-body bt-body">${cols}</div>`;
  }

  // ---------- Bách khoa thủy quái
  render_codex() {
    const g = this.game;
    const sc = this.screen;
    const isBoss = sc.tab === 'boss';
    const seg = `<div class="seg inset"><button class="${sc.tab === 'enemy' ? 'on' : ''}" data-act="tab" data-tab="enemy">Quái</button><button class="${isBoss ? 'on' : ''}" data-act="tab" data-tab="boss">Boss</button><button class="${sc.tab === 'secret' ? 'on' : ''}" data-act="tab" data-tab="secret">Bí truyền</button></div>`;
    let body;
    if (sc.tab === 'secret') return this.render_secrets(seg);
    // v53: chọn chương truyện → quái / boss của các ải trong chương đó
    const lvNow = g.started ? g.level : this.save.last;
    if (sc.ch == null) sc.ch = Math.max(0, CHAPTERS.findIndex((c) => lvNow >= c.from && lvNow <= c.to));
    const chap = CHAPTERS[sc.ch] || CHAPTERS[0];
    const chLv = [];
    for (let i = chap.from; i <= chap.to && i < LEVELS.length; i++) chLv.push(i);
    const chTabs = `<div class="cp-tabs bk-ch">${CHAPTERS.map((c, ci) => `<button class="cp-tab ${ci === sc.ch ? 'on' : ''}" data-act="bk-ch" data-i="${ci}">${ci + 1}. ${c.name}</button>`).join('')}</div>`;
    const where = (id) => {   // ải + đợt đầu tiên boss xuất hiện trong chương
      for (const i of chLv) { const w = Object.keys(LEVELS[i].bosses || {}).map(Number).sort((a, b) => a - b).find((n) => LEVELS[i].bosses[n] === id); if (w) return `Ải ${i + 1} · Đợt ${w}`; }
      return '';
    };
    if (!isBoss) {
      const list = [];
      for (const i of chLv) {
        const ro = ROSTERS[LEVELS[i].roster || 'thuy'];
        if (!ro) continue;
        for (const id of [ro.base, ...ro.list.map((x) => x[2]), ro.air, ro.champ]) if (id && ENEMIES[id] && !ENEMIES[id].minion && !list.includes(id)) list.push(id);
      }
      const cur = list.includes(sc.pick) ? sc.pick : list.includes('rua') ? 'rua' : list[0];
      const d = ENEMIES[cur];
      const cards = list.map((id) => `<button class="bk-card ${id === cur ? 'on' : ''} metal" data-act="bk-sel" data-id="${id}">
        <div class="well inset"><canvas data-enemy="${id}" data-pad="0.08" width="200" height="80"></canvas></div>
        <span class="nm">${ENEMIES[id].name}${ENEMIES[id].flying ? ' <span style="font-family:var(--body);font-size:12px;color:#9EDDF2">(bay)</span>' : ''}</span><span class="ds">${ENEMIES[id].short}</span></button>`).join('');
      const tags = [];
      if (d.armor >= 10) tags.push('<span class="bk-tag a">Giáp rất cao</span>');
      if (d.mr >= 30) tags.push('<span class="bk-tag m">Kháng phép cao</span>');
      if (d.stunResist) tags.push('<span class="bk-tag s">Kháng choáng</span>');
      if (d.flying) tags.push('<span class="bk-tag s">Bay</span>');
      if (d.enrage) tags.push('<span class="bk-tag d">Hóa điên</span>');
      if (d.heal) tags.push('<span class="bk-tag d">Hồi máu đồng đội</span>');
      if (d.split) tags.push('<span class="bk-tag d">Tách con</span>');
      if (d.ranged) tags.push('<span class="bk-tag d">Bắn tướng</span>');
      if (d.slam) tags.push('<span class="bk-tag d">Giẫm choáng tướng</span>');
      if (d.lives > 1) tags.push(`<span class="bk-tag d">Lọt thành −${d.lives} mạng</span>`);
      const extra = cur === 'rua' ? `<div class="tipbox inset" style="display:flex;gap:12px;align-items:center"><canvas data-enemy="rua" width="64" height="40" style="width:44px;height:28px"></canvas><span style="font-size:15px"><b>Bản khổng lồ (tinh anh):</b> đợt 5, 15, 25</span></div>`
        : cur === 'chimbao' ? '<div class="tipbox inset"><b>Đợt bay:</b> 7, 13, 17, 24, 27, 34, 37, 44, 47 · chỉ Xạ Thủ, Cao Lỗ, An Tiêm, tướng phép và Thạch Sanh (Cung Tên Vàng) bắn được</div>'
        : cur === 'thachtinh' ? `<div class="tipbox inset" style="display:flex;gap:12px;align-items:center"><canvas data-enemy="dacon" width="64" height="40" style="width:44px;height:28px"></canvas><span><b>Đá Con:</b> ${ENEMIES.dacon.hp} máu, giáp ${ENEMIES.dacon.armor}. Vỡ ra khi Thạch Tinh bị hạ.</span></div>`
        : cur === 'echme' ? `<div class="tipbox inset" style="display:flex;gap:12px;align-items:center"><canvas data-enemy="nongnoc" width="64" height="30" style="width:44px;height:20px"></canvas><span><b>Nòng Nọc:</b> ${ENEMIES.nongnoc.hp} máu, bơi rất nhanh. Dùng sát thương lan.</span></div>` : '';
      body = `${chTabs}<div class="bk-row"><div class="bk-cards">${cards}</div>
        <div class="panel metal bk-det"><div class="top"><div class="pic"><canvas data-enemy="${cur}" data-pad="0.1" width="280" height="212"></canvas></div>
          <div><div class="ttl">${d.name}</div><div class="bk-tags">${tags.join('')}</div>
          <div class="bk-stat"><span>Hành ${elIcon(d.el, 14)} <b>${ELEMENTS[d.el].name}</b></span><span>Máu gốc <b>${d.hp}</b></span><span>Giáp <b>${d.armor}</b></span><span>Kháng phép <b>${d.mr}%</b></span><span>Vàng <b>${d.gold}</b></span></div>
          <div class="note" style="font-size:11px">Mỗi ${ENEMY_GROW.every} đợt: +${ENEMY_GROW.armor} giáp${d.mr ? `, +${ENEMY_GROW.mr}% kháng phép (tối đa ${ENEMY_GROW.mrCap}%)` : ''}. Giáp ${d.armor} giảm ${Math.round(100 * 0.06 * d.armor / (1 + 0.06 * d.armor))}% sát thương vật lý · dùng đồ <b>xuyên giáp / xuyên kháng phép</b> để phá.</div></div></div>
          <div class="mech inset" style="color:#E8E0CC;font-size:14px">${d.desc}</div>${extra}</div></div>`;
    } else {
      const blist = [];
      for (const i of chLv) for (const n of Object.keys(LEVELS[i].bosses || {}).map(Number).sort((a, b) => a - b)) { const id = LEVELS[i].bosses[n]; if (ENEMIES[id] && !blist.includes(id)) blist.push(id); }
      const cur = blist.includes(sc.pick) ? sc.pick : blist.includes('haba') ? 'haba' : blist[0];
      const d = ENEMIES[cur];
      const cards = blist.map((id) => {
        const b = ENEMIES[id];
        return `<button class="boss-card metal ${id === cur ? 'on' : ''}" data-act="bk-sel" data-id="${id}">
          <div class="well inset"><canvas data-enemy="${id}" data-pad="0.06" width="220" height="300"></canvas><span class="wv">${where(id)}</span></div>
          <span class="nm">${b.name}</span><span class="ds">${b.short}</span>
          <span class="gift inset">${svgI(itemIcon(b.reward))}<span>Sính lễ<br><b>${ITEMS[b.reward].name}</b></span></span></button>`;
      }).join('');
      body = `${chTabs}<div class="bk-row"><div class="boss-cards">${cards}</div>
        <div class="panel metal bk-det"><div class="top"><div class="pic" style="height:110px"><canvas data-enemy="${cur}" data-pad="0.05" width="280" height="220" style="height:110px"></canvas></div>
          <div><div style="display:flex;align-items:center;gap:10px"><span class="ttl" style="font-size:30px">${d.name}</span><span class="chip run" style="font-size:13px">Boss · ${where(cur)}</span></div>
            <div class="bk-tags">${d.tags.map((t, k) => `<span class="bk-tag ${k % 2 ? 's' : 'd'}">${t}</span>`).join('')}</div>
            <div class="bk-stat"><span>Hành ${elIcon(d.el, 14)} <b>${ELEMENTS[d.el].name}${cur === 'haba' && g.known.has('e.haba') ? ' → Kim' : ''}</b></span><span>Máu <b>${d.hp}+</b></span><span>Giáp <b>${d.armor}</b></span><span>Kháng phép <b>${d.mr}%</b></span><span>Lọt thành <b>−${d.lives} mạng</b></span></div></div></div>
          <div class="mech inset">${esc(d.desc)}</div>
          <div class="tipbox inset">🎁 <b>Hạ được:</b> chọn sính lễ <b>${ITEMS[d.reward].name}</b></div>
          <div class="tipbox inset">💡 <b>Mẹo:</b> ${esc(d.tip)}</div></div></div>`;
    }
    // lịch 30 đợt
    const lv = g.started ? g.level : this.save.last;
    const N = LEVELS[lv].waves;
    const cells = [];
    for (let n = 1; n <= N; n++) {
      const k = waveKind(n, lv);
      cells.push(`<span class="cell ${k === 'boss' ? 'boss' : k === 'air' ? 'air' : k === 'champion' ? 'champ' : ''} ${g.started && n < g.wave + (g.waveActive ? 0 : 1) ? 'past' : ''} ${g.started && n === g.wave ? 'cur' : ''}">${n}${k === 'boss' && n < N ? '<i class="fl"></i>' : ''}</span>`);
    }
    return `${this.head('Bách khoa quái thú', this.runChip(), seg, '<svg viewBox="0 0 24 24" width="26" height="26"><rect x="4" y="3" width="16" height="18" rx="2" fill="none" stroke="#F2D27A" stroke-width="1.8"/><circle cx="12" cy="10" r="3" fill="none" stroke="#F2D27A" stroke-width="1.6"/></svg>')}
      <div class="scr-body bk-body" style="padding-bottom:6px">${body}</div>
      <div class="sched metal" style="margin:0 10px 10px"><div class="hd"><span class="ttl">Lịch ${N} đợt · Ải ${lv + 1}</span>
        <div class="lg"><span><i style="background:#8A2A12;border:1px solid #C8401E"></i>Boss</span><span><i style="background:#3A4A5A;border:1px solid #5A7088"></i>Bay</span><span><i style="background:#5A4E30;border:1px solid #8C7A5A"></i>Rùa khổng lồ</span><span><i style="background:#5AB4D6;width:4px"></i>Nước dâng</span><span><i style="border:2px solid #FFD66B"></i>Đợt hiện tại</span></div></div>
        <div class="cells">${cells.join('')}</div></div>`;
  }
}

// số hiệu phụ để dựng lại lưới lệnh khi hồi chiêu đổi
function def0(h) { return HEROES[h.type].skills.map((s) => Math.ceil(Math.max(0, h.skillCd[s.id] || 0))).join(''); }
function t2cd(h) { return h.tier || 0; }

// khắc / bị khắc của một hành (dòng chú thích ngắn)
function elRelText(el) {
  const by = EL_ORDER.find((x) => EL_KHAC[x] === el);
  const mom = EL_ORDER.find((x) => EL_SINH[x] === el);
  return `Khắc ${ELEMENTS[EL_KHAC[el]].name} (+${ELEM.khac}%) · sợ ${ELEMENTS[by].name} (${ELEM.biKhac}%) · đứng kề tướng ${ELEMENTS[mom].name} +${ELEM.sinh}%`;
}

// chấm hành ở góc trên trái ô đồ
const elDot = (inst) => (inst.el ? `<span class="eld" style="background:${ELEMENTS[inst.el].color}"></span>` : '');
// dòng bộ đồ đang mặc
function setNote(h) {
  const st = heroStats(h);
  const parts = Object.entries(st.sets).map(([k, n]) => `<b style="color:${SETS[k].color}">${SETS[k].name} ${n}/3${st.thienMenh === k ? ' · Thiên mệnh' : ''}</b>`);
  return parts.join(' · ');
}

// Dòng chỉ số món đồ
function statLine(stats, lines) {
  const parts = Object.entries(stats).filter(([, v]) => v).map(([k, v]) => {
    const val = k === 'cleave' ? Math.round(v * 100) + '%' : (v > 0 ? '+' : '') + (Math.round(v * 10) / 10);
    return lines ? `<div><b>${val}</b> ${STAT_NAMES[k] || k}</div>` : `${val} ${STAT_NAMES[k] || k}`;
  });
  return lines ? parts.join('') : parts.join(' · ');
}
