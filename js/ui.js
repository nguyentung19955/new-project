'use strict';

// ============================================================
//  GIAO DIỆN: menu, mở đầu, chiến dịch, màn chơi (thanh trên, triệu
//  hồi, bảng điều khiển dưới), các màn hình trong trận (Cây kỹ năng,
//  Lò đúc đồng, Túi đồ, Đổi vàng, Tiến hoá, Núi Tản Viên, Bách khoa),
//  sính lễ, thắng/thua, cài đặt. Theo bản thiết kế v14.
// ============================================================

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// v146: co cỡ chữ (bước 0,5px, không nhỏ hơn min) tới khi vừa chiều ngang ô; vẫn tràn thì CSS cắt bằng dấu …
function fitText(el, min) {
  el.style.fontSize = '';
  let fs = parseFloat(getComputedStyle(el).fontSize);
  while (el.scrollWidth > el.clientWidth + 0.5 && fs > min) el.style.fontSize = (fs -= 0.5) + 'px';
}
// vo-tan-su-kien: số rất lớn (máu quái đợt xa) viết gọn — trước đây "112.000.000.000.000…" tràn thanh boss
const fmt = (n) => {
  const a = Math.abs(n);
  if (!(a < 1e9)) {
    if (!isFinite(n)) return '∞';
    if (a < 1e12) return (n / 1e9).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' tỷ';
    if (a < 1e15) return (n / 1e12).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' nghìn tỷ';
    return n.toExponential(2).replace('.', ',').replace('e+', 'e');
  }
  return Math.round(n).toLocaleString('vi-VN');
};
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
// dùng ảnh có sẵn: mũi tên nâng cấp (ic-nang-cap), núi (ui-tran-3-3); thiếu ảnh thì SVG như cũ
for (const [k, f] of [['up', 'ic-nang-cap'], ['mount', 'ui-tran-3-3']]) {
  const svg = ICON[k]; Object.defineProperty(ICON, k, { get: () => (hasAsset(`ui/${f}.png`) ? `<img class="icart ic-${k}" src="${assetSrc(`ui/${f}.png`)}" alt="">` : svg) });
}
// claude/xuat-goi-pixel: ICON SVG → icon pixel khi bật pixel (giữ SVG làm dự phòng)
for (const [k, code] of [['close', 'svg-close'], ['back', 'ui-tran-3-4'], ['check', 'svg-check'], ['bag', 'svg-bag'], ['up', 'nang-cap'], ['mount', 'ui-tran-3-3']]) {
  const d = Object.getOwnPropertyDescriptor(ICON, k), cu = () => (d.get ? d.get() : d.value);
  Object.defineProperty(ICON, k, { get: () => (pxIc(code) ? `<img class="icart ic-${k}" src="${pxIc(code)}" alt="">` : cu()) });
}
// ổ khóa vẽ tay (ui_khoa.png) nếu đã có
{ const lockSvg = ICON.lock; Object.defineProperty(ICON, 'lock', { get: () => uiIc('khoa', lockSvg) }); }

const svgI = (svg, cls = '') => `<span class="svgi ${cls}">${svg || ''}</span>`;
// v163: khung / nút / thanh vẽ tay (prompt nhóm 21 · tools/cat-khung.py). Có file thì gắn biến CSS --sk-<tên> + lớp sk-<lớp>
// lên <html> để style.css dùng ảnh; chưa có file thì giữ nguyên hình vẽ bằng CSS / canvas như cũ.
const UI_SKIN = [['khung-bang', 'khung-bang'], ['nut-vang-thuong', 'nut-vang'], ['nut-vang-nhan'], ['nut-vang-khoa'],
  ['nut-dong-thuong', 'nut-dong'], ['nut-dong-nhan'], ['nut-dong-khoa'], ['nut-tron-thuong', 'nut-tron'], ['nut-tron-nhan'], ['nut-tron-khoa'],
  ['thanh-mau-boss', 'thanh-mau-boss'], ['khung-thanh-day', 'thanh-day'], ['the-cho-thuong', 'the-cho'], ['the-cho-ghep'], ['the-cho-thieu'],
  ['nut-doi-cho', 'nut-doi-cho'], ['ai-mo', 'huy-hieu'], ['ai-chon'], ['ai-khoa']];
function loadUiSkins() {
  const root = document.documentElement;
  const one = (src, name, cls) => {
    const im = new Image();
    // URL tuyệt đối: url() tương đối trong biến CSS bị phân giải theo css/style.css (→ css/assets/… 404, huy hiệu ải biến mất)
    im.onload = () => { root.style.setProperty('--sk-' + name, `url("${new URL(src, document.baseURI).href}")`); if (cls) root.classList.add('sk-' + cls); };
    im.src = src;
  };
  // claude/xuat-goi-pixel: khung / nút / thanh pixel (nhóm "giao-dien") khi bật pixel — trước ảnh vẽ tay
  // nút tròn (đóng) và nút đổi chợ giữ hình cũ: bản pixel mất nhận diện (ô vuông X trắng, đồng xu xoay) — góp ý tester
  const PX_GIU = /^nut-tron-|^nut-doi-cho$/;
  for (const [name, cls] of UI_SKIN) { const px = !PX_GIU.test(name) && typeof pxUrl === 'function' && pxUrl('giao-dien', name); if (px) one(px, name, cls); else if (hasAsset(`ui/${name}.png`)) one(assetSrc(`ui/${name}.png`), name, cls); }
  if (hasAsset('scenes/nen-man-phu.png')) one(assetSrc('scenes/nen-man-phu.png'), 'nen-man-phu', 'nen-man-phu');
}
if (typeof document !== 'undefined' && document.documentElement) loadUiSkins();
// v95: Ngân khố (tài khoản) dùng nén BẠC, khác hẳn đồng VÀNG trong trận
let KHO_MODE = false;       // đang mở Lò đúc đồng trước trận: giá hiện bằng bạc Ngân khố
// dùng ảnh có sẵn: ảnh tài nguyên (đồng xu lỗ vuông, nén bạc) luôn dùng khi có file, không phụ thuộc "Dùng ảnh AI"; thiếu thì vẽ CSS như cũ
const pxUrl2 = (g, code) => (typeof pxUrl === 'function' && pxUrl(g, code)) || '';
const pxIc = (code) => (typeof pxUrl === 'function' && pxUrl('icon', code)) || '';
const uiSrcOf = (paths) => { const p = paths.find((x) => hasAsset(x)); return p ? assetSrc(p) : ''; };
const COIN_SRC = ['ui/ui-tai-nguyen-1.png'], BAC_SRC = ['ui/ui-tai-nguyen-3.png'];
const bac = (sm) => { const u = pxIc('bac') || uiSrcOf(BAC_SRC); return u ? `<img class="bac-img${sm ? ' sm' : ''}" src="${u}" alt="">` : `<i class="bac${sm ? ' sm' : ''}"></i>`; };
// cho-6-the: chân dung trên thẻ Chợ tướng (và ảnh nạp sẵn) lấy qua 1 hàm — khi có chân dung pixel chỉ cần đổi ở đây
const marketPortrait = (t) => heroImgUrl(t, 'head');
const coin = (sm) => { if (KHO_MODE) return bac(sm); const u = pxIc('vang') || uiSrcOf(COIN_SRC) || assetUrl('ui_dong-xu.png'); return u ? `<img class="coin-img${sm ? ' sm' : ''}" src="${u}" alt="">` : `<i class="coin${sm ? ' sm' : ''}"></i>`; };
// icon giao diện vẽ tay (ui_*.png) nếu đã có, không thì dùng ký hiệu dự phòng
// v155: nút vẽ tay thay ký hiệu (ui-tran-4/5, huy chương); thiếu ảnh thì quay về ký hiệu cũ
// claude/xuat-goi-pixel: icon pixel (js/pixel.js, nhóm "icon") nếu đang bật pixel và có mã — không thì đường vẽ cũ
const uiE = (f, emo, cls = 'uie') => pxIc(f) ? `<img class="${cls}" src="${pxIc(f)}" alt="${emo}">` : !hasAsset(`ui/${f}.png`) ? emo : `<img class="${cls}" src="${assetSrc(`ui/${f}.png`)}" alt="${emo}" onerror="this.replaceWith(this.alt)">`;
// v186: ổ khoá chợ tướng — [mở, đóng]
const MK_LOCK = ['<svg viewBox="0 0 24 24" width="20" height="20"><path d="M7 11V7a5 5 0 0 1 9.6-1.9" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><rect x="4" y="11" width="16" height="11" rx="2.5" fill="currentColor"/><circle cx="12" cy="16.5" r="1.8" fill="#1A120A"/></svg>',
  '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M7 11V7a5 5 0 0 1 10 0v4" fill="none" stroke="currentColor" stroke-width="2.6"/><rect x="4" y="11" width="16" height="11" rx="2.5" fill="currentColor"/><circle cx="12" cy="16.5" r="1.8" fill="#5A3A08"/></svg>'];
const UIE = { star: () => uiE('ui-tran-4-1', '★'), equip: () => uiE('ui-tran-4-2', '▲'), lock: () => uiE('ui-tran-4-3', '🔒'), redo: () => uiE('ui-tran-4-4', '↻'),
  tip: () => uiE('ui-tran-5-1', '💡'), endless: () => uiE('ui-tran-5-2', '♾'), battle: () => uiE('ui-tran-5-3', '⚔'), done: () => uiE('ui-tran-5-4', '✓'),
  medal: (i) => uiE(`ui-huy-chuong-${i + 1}`, ['🥇', '🥈', '🥉', '👑'][i]) };
// dùng ảnh có sẵn: ký hiệu emoji → icon vẽ tay đã có trong assets/ui (thiếu ảnh / ký hiệu chưa có ảnh thì giữ ký hiệu)
const EMO_ART = { '🔥': 'ic-hanh-hoa', '🌊': 'ic-hanh-thuy', '⛰': 'ui-tran-3-3', '⚔': 'ui-tran-5-3', '♾': 'ui-tran-5-2', '↻': 'ui-tran-4-4',
  '⚒': 'ui-tran-2-2', '🎒': 'ui-menu-2-4', '🔯': 'ui-menu-1-4', '📖': 'ui-menu-2-2', '📜': 'ui-menu-2-2', '⏸': 'ui-tran-1-2', '🎁': 'ui-menu-1-3', '🏆': 'ui-menu-2-3' };
const CODEX_SVG = '<svg viewBox="0 0 24 24" width="26" height="26"><rect x="4" y="3" width="16" height="18" rx="2" fill="none" stroke="#F2D27A" stroke-width="1.8"/><circle cx="12" cy="10" r="3" fill="none" stroke="#F2D27A" stroke-width="1.6"/></svg>';
const artOr = (f, fallback) => (pxIc(f) ? `<img class="icart" src="${pxIc(f)}" alt="">` : hasAsset(`ui/${f}.png`) ? `<img class="icart" src="${assetSrc(`ui/${f}.png`)}" alt="">` : fallback);
const codexIc = () => artOr('ui-menu-2-2', CODEX_SVG);
// thua chương Sơn Tinh: cổng thành Phong Châu (tiles/cong-phong-chau) chìm trong sóng (ic-hanh-thuy); thiếu ảnh thì icon nước dâng cũ
const floodIc = () => (hasAsset('tiles/cong-phong-chau.png') && hasAsset('ui/ic-hanh-thuy.png')
  ? `<span class="res-flood"><img src="${assetSrc('tiles/cong-phong-chau.png')}" alt=""><img class="wv" src="${assetSrc('ui/ic-hanh-thuy.png')}" alt=""><img class="wv w2" src="${assetSrc('ui/ic-hanh-thuy.png')}" alt=""></span> `
  : ic('nuoc-dang'));
const emoArt = (emo, cls = 'uie') => (EMO_ART[emo] ? uiE(EMO_ART[emo], emo, cls) : emo);
// v181: ổ khoá / tia kỹ năng vẽ SVG (ảnh ui-tran-4-3 thu nhỏ chỉ còn chấm xám)
const SVG_LOCK = '<svg class="svlk" viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="7" width="10" height="8" rx="1.6" fill="currentColor"/><path d="M5.2 7V5.2a2.8 2.8 0 0 1 5.6 0V7" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
const SVG_SK = '<svg class="svsk" viewBox="0 0 16 16" aria-hidden="true"><path d="M9.5 1 3 9.2h4.2L6.3 15 13 6.6H8.7z" fill="currentColor"/></svg>';
const uiIc = (name, fallback = '') => (pxIc('ui-' + name) ? `<img class="uiic" src="${pxIc('ui-' + name)}" alt="">` : assetUrl(`ui_${name}.png`) ? `<img class="uiic" src="${assetUrl(`ui_${name}.png`)}" alt="">` : fallback);
// v163: icon nhỏ (chỉ số, trạng thái, tiền tệ…) — ảnh assets/ui/ic-<tên>.png (cắt bằng tools/cat-items.py ic-…),
// chưa có ảnh thì vẽ SVG nội tuyến (KHÔNG dùng emoji: điện thoại thiếu font sẽ hiện ô vuông). Bảng kê: docs/ICON-NHO.md
// v189 (L17): "mạng" dùng trái tim đỏ trước (giống thanh trên); khiên đồng ui_mang.png trông như đồng xu, dễ nhầm với vàng
const IC_ALT = { vang: ['ui/ui-tai-nguyen-1.png', 'ui_dong-xu.png'], mang: ['ui/ui-tai-nguyen-2.png', 'ui_mang.png'], bac: ['ui/ui-tai-nguyen-3.png'],
  'tu-vi': ['ui/ui-tai-nguyen-4.png'], 'hu-bau': ['ui_hu-bau.png'], 'nuoc-dang': ['ui_muc-nuoc.png'] };
const IC_O = 'stroke="#2A1608" stroke-width="1.5" stroke-linejoin="round"';
const IC_SVG = {
  giap: `<path d="M12 2.5 L20 5.5 V11 C20 16 16.5 19.5 12 21.5 C7.5 19.5 4 16 4 11 V5.5 Z" fill="#C9963A" ${IC_O}/><path d="M12 5.5 V18.5 M7 9.5 H17" stroke="#7A5418" stroke-width="1.6"/>`,
  'khang-phep': `<circle cx="12" cy="12" r="8.5" fill="#8A5CD0" ${IC_O}/><circle cx="12" cy="12" r="4.5" fill="none" stroke="#E4D2FF" stroke-width="1.6"/><circle cx="9.5" cy="8.5" r="1.6" fill="#fff"/>`,
  'toc-chay': `<ellipse cx="8.5" cy="9" rx="3.2" ry="5" fill="#B8C86A" ${IC_O}/><ellipse cx="15.5" cy="15" rx="3.2" ry="5" fill="#B8C86A" ${IC_O}/>`,
  'toc-danh': `<path d="M13.5 2 L5 13.5 H11 L9.5 22 L19 9.5 H13 Z" fill="#FFD23A" ${IC_O}/>`,
  'sat-thuong': `<path d="M19.5 3 L21 4.5 L10 15.5 L8.5 14 Z" fill="#E8E2D0" ${IC_O}/><path d="M6 12 L12 18 M5 19 L8.5 15.5" stroke="#2A1608" stroke-width="2.6" stroke-linecap="round"/><path d="M6 12 L12 18" stroke="#C9963A" stroke-width="1.4" stroke-linecap="round"/>`,
  mau: `<path d="M12 2.5 C15 7 18.5 10.5 18.5 14.5 A6.5 6.5 0 0 1 5.5 14.5 C5.5 10.5 9 7 12 2.5 Z" fill="#E0402A" ${IC_O}/><path d="M9 14 A3 3 0 0 0 11 17" stroke="#FFB0A0" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
  'chi-mang': `<path d="M12 1.5 L14.2 8.2 L21 6.5 L16.2 11.8 L21.5 16.5 L14.5 16 L12 22.5 L9.5 16 L2.5 16.5 L7.8 11.8 L3 6.5 L9.8 8.2 Z" fill="#FF6A3A" ${IC_O}/><circle cx="12" cy="12" r="2.6" fill="#FFE07A"/>`,
  'tam-danh': `<circle cx="12" cy="12" r="9" fill="#F2E6C8" ${IC_O}/><circle cx="12" cy="12" r="5.5" fill="#E0402A" stroke="#2A1608" stroke-width="1.2"/><circle cx="12" cy="12" r="2.2" fill="#F2E6C8"/>`,
  'hoi-chieu': `<path d="M6 2.5 H18 M6 21.5 H18" stroke="#2A1608" stroke-width="2.4" stroke-linecap="round"/><path d="M7 3.5 H17 C17 8 13.5 10 12 12 C13.5 14 17 16 17 20.5 H7 C7 16 10.5 14 12 12 C10.5 10 7 8 7 3.5 Z" fill="#9ED8F2" ${IC_O}/><path d="M9 19.5 L12 16.5 L15 19.5 Z" fill="#E8C25A"/>`,
  'nang-luong': `<path d="M12 2.5 C15 7 18.5 10.5 18.5 14.5 A6.5 6.5 0 0 1 5.5 14.5 C5.5 10.5 9 7 12 2.5 Z" fill="#3A8CE8" ${IC_O}/><path d="M9 14 A3 3 0 0 0 11 17" stroke="#BFE0FF" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
  'suc-manh': `<rect x="5" y="7" width="14" height="12" rx="4" fill="#E88A4A" ${IC_O}/><path d="M9 7.5 V11 M12.5 7.5 V11 M16 7.5 V11 M5.5 13 H11" stroke="#2A1608" stroke-width="1.3"/>`,
  'nhanh-nhen': `<path d="M19 3 C10 4 5 11 5 20 C12 19 18 13 19 3 Z" fill="#6AD06A" ${IC_O}/><path d="M5 20 L15 8" stroke="#2A1608" stroke-width="1.3"/>`,
  'tri-tue': `<path d="M2.5 6 C6 4.5 9.5 4.5 12 6.5 C14.5 4.5 18 4.5 21.5 6 V19 C18 17.5 14.5 17.5 12 19.5 C9.5 17.5 6 17.5 2.5 19 Z" fill="#7AB4F0" ${IC_O}/><path d="M12 6.5 V19.5" stroke="#2A1608" stroke-width="1.3"/>`,
  'giam-sat-thuong': `<path d="M12 2.5 L20 5.5 V11 C20 16 16.5 19.5 12 21.5 C7.5 19.5 4 16 4 11 V5.5 Z" fill="#6A9AA8" ${IC_O}/><path d="M12 7 V16 M8.5 12.5 L12 16 L15.5 12.5" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  'xuyen-giap': `<path d="M3 21 L13 11" stroke="#8A5A2A" stroke-width="2.8" stroke-linecap="round"/><path d="M12 7 L21 3 L17 12 Z" fill="#C9963A" ${IC_O}/><path d="M3 21 L13 11" stroke="#2A1608" stroke-width="1" stroke-linecap="round" opacity=".5"/>`,
  'xuyen-phep': `<path d="M3 21 L13 11" stroke="#6A4AA0" stroke-width="2.8" stroke-linecap="round"/><path d="M12 7 L21 3 L17 12 Z" fill="#B48AF0" ${IC_O}/>`,
  cham: `<path d="M3 18 H18 C20.5 18 21.5 16.5 21 15" fill="none" ${IC_O} stroke-width="2"/><circle cx="11" cy="12" r="6" fill="#C89A5A" ${IC_O}/><path d="M11 12 m-1.5 0 a1.5 1.5 0 1 1 1.5 1.5 a3.5 3.5 0 1 1 3.5 -3.5" fill="none" stroke="#2A1608" stroke-width="1.3"/>`,
  choang: `<ellipse cx="12" cy="13" rx="9" ry="4" fill="none" stroke="#FFD23A" stroke-width="1.8"/><path d="M6 6 L7 8.5 L9.5 8.8 L7.6 10.3 L8.2 12.8 L6 11.4 L3.8 12.8 L4.4 10.3 L2.5 8.8 L5 8.5 Z M18 4 L19 6.5 L21.5 6.8 L19.6 8.3 L20.2 10.8 L18 9.4 L15.8 10.8 L16.4 8.3 L14.5 6.8 L17 6.5 Z" fill="#FFD23A" stroke="#2A1608" stroke-width="1"/>`,
  dot: `<path d="M12 2 C15.5 6.5 19 9.5 18 15 C17.2 19 14.5 21.5 12 21.5 C9.5 21.5 6.8 19 6 15 C5.5 11.5 8 9.5 8.8 6.5 C10 8.5 10.8 9.8 12 10.5 C12.8 8 13 5 12 2 Z" fill="#FF7A2A" ${IC_O}/><path d="M12 13 C13.5 15 14.5 16 14 18 C13.5 19.5 10.5 19.5 10 18 C9.6 16.5 11 15 12 13 Z" fill="#FFD23A"/>`,
  doc: `<path d="M12 2.5 C15 7 18.5 10.5 18.5 14.5 A6.5 6.5 0 0 1 5.5 14.5 C5.5 10.5 9 7 12 2.5 Z" fill="#6AC83A" ${IC_O}/><circle cx="10" cy="14" r="1.6" fill="#2A1608"/><circle cx="14" cy="14" r="1.6" fill="#2A1608"/><path d="M10 17.5 H14" stroke="#2A1608" stroke-width="1.4"/>`,
  'dong-bang': `<path d="M12 2 V22 M3.3 7 L20.7 17 M3.3 17 L20.7 7" stroke="#2A1608" stroke-width="3.6" stroke-linecap="round"/><path d="M12 2 V22 M3.3 7 L20.7 17 M3.3 17 L20.7 7" stroke="#9EE6FF" stroke-width="1.8" stroke-linecap="round"/>`,
  'sa-lay': `<path d="M2.5 15 C5 12 8 12 12 13.5 C16 12 19 12 21.5 15 V20 H2.5 Z" fill="#8A6A3A" ${IC_O}/><circle cx="8" cy="9" r="2" fill="#B8925A" stroke="#2A1608" stroke-width="1.2"/><circle cx="15" cy="6.5" r="1.5" fill="#B8925A" stroke="#2A1608" stroke-width="1.2"/>`,
  khien: `<circle cx="12" cy="12" r="9" fill="#5AD0F0" fill-opacity=".45" ${IC_O}/><path d="M7 8.5 A6.5 6.5 0 0 1 12 5.5" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  'hoi-mau': `<path d="M9 3 H15 V9 H21 V15 H15 V21 H9 V15 H3 V9 H9 Z" fill="#4AD05A" ${IC_O}/>`,
  'noi-gian': `<path d="M4 9 C7 9 9 7 9 4 M15 4 C15 7 17 9 20 9 M20 15 C17 15 15 17 15 20 M9 20 C9 17 7 15 4 15" stroke="#2A1608" stroke-width="4.4" fill="none" stroke-linecap="round"/><path d="M4 9 C7 9 9 7 9 4 M15 4 C15 7 17 9 20 9 M20 15 C17 15 15 17 15 20 M9 20 C9 17 7 15 4 15" stroke="#FF4A2A" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
  bay: `<path d="M3 15 C6 7 13 4 21 4 C19 7 18 9 15 10 C17 10.5 18 11.5 18 12.5 C15.5 12.5 14 13 12.5 14.5 C13.5 15 14 16 14 17 C10 17 6 16.5 3 15 Z" fill="#F2F0E8" ${IC_O}/>`,
  boss: `<path d="M3 18 L4 7 L8.5 11 L12 4 L15.5 11 L20 7 L21 18 Z" fill="#E0402A" ${IC_O}/><rect x="3" y="18" width="18" height="3" fill="#C9963A" ${IC_O}/><circle cx="12" cy="14" r="1.8" fill="#FFD23A"/>`,
  'cam-lang': `<path d="M4 5 H20 V15 H11 L6 19.5 V15 H4 Z" fill="#E8E2D0" ${IC_O}/><path d="M5 20 L20 4" stroke="#E0402A" stroke-width="2.4" stroke-linecap="round"/>`,
  // vo-tan-su-kien: vẽ tạm bằng code (chưa có ảnh ui/ic-suong-mu.png, ui/ic-phan-than.png — đã ghi vào docs/PROMPT-CAN-GEN.txt)
  'suong-mu': `<path d="M5 10 C5 7 8 5.5 10.5 7 C11.5 4.5 16 4.5 17 7.5 C19.5 7.5 20.5 10 19 11.5 H5.5 C5 11 5 10.5 5 10 Z" fill="#D8E2E6" ${IC_O}/><path d="M3 14.5 H18 M6 18 H21" stroke="#B8C6CC" stroke-width="2.2" stroke-linecap="round"/>`,
  'phan-than': `<path d="M4 20 V11 C4 6.5 7 4 10 4 C13 4 16 6.5 16 11 V20 L13.5 18 L11 20 L8.5 18 L6 20 Z" fill="#C08CF0" opacity=".55" ${IC_O}/><path d="M8 21 V12 C8 7.5 11 5 14 5 C17 5 20 7.5 20 12 V21 L17.5 19 L15 21 L12.5 19 L10 21 Z" fill="#C08CF0" ${IC_O}/><circle cx="12.5" cy="11" r="1.3" fill="#2A1608"/><circle cx="16.5" cy="11" r="1.3" fill="#2A1608"/>`,
  'tinh-anh': `<path d="M12 2.5 L20 9.5 L12 21.5 L4 9.5 Z" fill="#A86CE0" ${IC_O}/><path d="M4 9.5 H20 M9 9.5 L12 21.5 L15 9.5 M8 5.5 L9 9.5 M16 5.5 L15 9.5" stroke="#2A1608" stroke-width="1"/>`,
  lan: `<path d="M3 11 q3 -3 6 0 t6 0 t6 0 M3 16 q3 -3 6 0 t6 0 t6 0" stroke="#2A1608" stroke-width="3.6" fill="none" stroke-linecap="round"/><path d="M3 11 q3 -3 6 0 t6 0 t6 0 M3 16 q3 -3 6 0 t6 0 t6 0" stroke="#5AB4F0" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
  vang: `<circle cx="12" cy="12" r="9" fill="#F2C23A" ${IC_O}/><circle cx="12" cy="12" r="6.2" fill="none" stroke="#B8861A" stroke-width="1.2"/><rect x="10" y="10" width="4" height="4" fill="#7A5418"/>`,
  mang: `<path d="M12 20.5 C3.5 14 2 9.5 4.5 6 C7 3 10.5 4 12 7 C13.5 4 17 3 19.5 6 C22 9.5 20.5 14 12 20.5 Z" fill="#E25A3A" ${IC_O}/>`,
  bac: `<path d="M3 11 C6 13 18 13 21 11 L18.5 18 H5.5 Z" fill="#D8DEE6" ${IC_O}/><ellipse cx="12" cy="11" rx="5" ry="3" fill="#F2F4F8" ${IC_O}/>`,
  'tu-vi': `<circle cx="12" cy="12" r="9" fill="#F2F0E8" ${IC_O}/><path d="M12 3 A9 9 0 0 1 12 21 A4.5 4.5 0 0 1 12 12 A4.5 4.5 0 0 0 12 3 Z" fill="#2A1608"/><circle cx="12" cy="7.5" r="1.4" fill="#2A1608"/><circle cx="12" cy="16.5" r="1.4" fill="#F2F0E8"/>`,
  'tui-vang': `<path d="M8 6 C6 9 4 12 4 15.5 C4 19 7 21 12 21 C17 21 20 19 20 15.5 C20 12 18 9 16 6 Z" fill="#C89A5A" ${IC_O}/><path d="M8 6 H16 L14.5 3 H9.5 Z" fill="#A87A3A" ${IC_O}/><circle cx="12" cy="14.5" r="3.4" fill="#F2C23A" stroke="#2A1608" stroke-width="1.2"/>`,
  'diem-ky-nang': `<circle cx="12" cy="12" r="9.5" fill="#2F6B5E" ${IC_O}/><path d="M12 5 L13.8 9.6 L18.6 9.8 L14.8 12.8 L16.2 17.5 L12 14.8 L7.8 17.5 L9.2 12.8 L5.4 9.8 L10.2 9.6 Z" fill="#FFD23A" stroke="#2A1608" stroke-width="1"/>`,
  'diem-an-phu': `<rect x="4" y="4" width="16" height="16" rx="4" fill="#9A8A7A" ${IC_O}/><circle cx="12" cy="12" r="4" fill="none" stroke="#FFD66B" stroke-width="1.8"/><path d="M12 5.5 V8 M12 16 V18.5 M5.5 12 H8 M16 12 H18.5" stroke="#FFD66B" stroke-width="1.8"/>`,
  'luc-chien': `<path d="M4 4 L15 15 M20 4 L9 15" stroke="#2A1608" stroke-width="4" stroke-linecap="round"/><path d="M4 4 L15 15 M20 4 L9 15" stroke="#E8E2D0" stroke-width="2" stroke-linecap="round"/><path d="M13 17 L17 13 L20 16 L16 20 Z M11 17 L7 13 L4 16 L8 20 Z" fill="#C9963A" stroke="#2A1608" stroke-width="1.2"/>`,
  'cap-do': `<path d="M4 12 L12 4 L20 12 M4 20 L12 12 L20 20" stroke="#2A1608" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 12 L12 4 L20 12 M4 20 L12 12 L20 20" stroke="#6AE06A" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  kho: `<path d="M12 3 C17 3 20 6.5 20 11 C20 13.5 18.8 15 17.5 15.8 V19.5 H6.5 V15.8 C5.2 15 4 13.5 4 11 C4 6.5 7 3 12 3 Z" fill="#E8E2D0" ${IC_O}/><circle cx="9" cy="11" r="2.2" fill="#C8401E"/><circle cx="15" cy="11" r="2.2" fill="#C8401E"/><path d="M10 19.5 V16.5 M14 19.5 V16.5" stroke="#2A1608" stroke-width="1.2"/>`,
  'nuoc-dang': `<path d="M2.5 15 q2.4 -3 4.8 0 t4.8 0 t4.8 0 t4.8 0 V21 H2.5 Z" fill="#3A8CE8" ${IC_O}/><path d="M12 11 V3 M8.5 6.5 L12 3 L15.5 6.5" stroke="#2A1608" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M12 11 V3 M8.5 6.5 L12 3 L15.5 6.5" stroke="#9ED8F2" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  'khac-che': `<path d="M3 12 H16 M12 6 L18 12 L12 18" stroke="#2A1608" stroke-width="4.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 12 H16 M12 6 L18 12 L12 18" stroke="#FF8A4A" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="20" cy="12" r="2" fill="#FFD23A" stroke="#2A1608" stroke-width="1"/>`,
  'nang-cap': `<path d="M12 3 L20 12 H15.5 V21 H8.5 V12 H4 Z" fill="#4AD05A" ${IC_O}/>`,
  'hu-bau': `<path d="M8 4 H16 V7 C19 9 20 12 19.5 15 C19 19 16 21 12 21 C8 21 5 19 4.5 15 C4 12 5 9 8 7 Z" fill="#B87A3A" ${IC_O}/><path d="M5.5 13 H18.5" stroke="#F2C23A" stroke-width="1.8"/>`,
};
// danh sách tên có ảnh riêng (để tải trước một lần khi vào game)
const IC_NAMES = Object.keys(IC_SVG);
const icPaths = (name) => [`ui/ic-${name}.png`, ...(IC_ALT[name] || [])];
// như nút giao diện (ui-tran-…): luôn dùng ảnh khi có, không phụ thuộc cài đặt "ảnh AI"
const icUrl = (name) => { const p = icPaths(name).find((x) => asset(x, true)); return p ? assetSrc(p) : ''; };
function ic(name, alt = '', cls = '') {
  const u = pxIc(name) || icUrl(name);
  if (u) return `<img class="icn ${cls}" src="${u}" alt="${alt}">`;
  return `<svg class="icn ${cls}" viewBox="0 0 24 24"${alt ? ` aria-label="${alt}"` : ' aria-hidden="true"'}>${IC_SVG[name] || ''}</svg>`;
}
const icPreload = () => { IC_NAMES.forEach(icUrl); Object.keys(ELEMENTS).forEach((e) => asset(`ui/ic-hanh-${e}.png`, true)); };
const rarCls = (r) => ({ common: 'rt', rare: 'rh', epic: 'rs', legendary: 'rl' }[r]);
const ATTR_CLS = { str: 'a-str', agi: 'a-agi', int: 'a-int' };
const BOSS_LINES = {
  thuongluong: 'Ta là Thuồng Luồng sông Đà! Một cú quẫy đuôi là tướng của ngươi nằm rạp!',
  haba: 'Hà Bá ta sống dưới nước nghìn năm. Hạ ta một lần chưa phải là xong đâu!',
  thuytinh: 'Mị Nương phải là của ta! Mưa gió ơi, nhấn chìm Phong Châu!',
};
const RUN_CHIP = '<span class="chip run">Quái vẫn đang chạy</span>';

// v111: Ấn Phù vẽ tay (assets/runes/<mã ấn>.png, cắt bằng tools/cat-runes.py); thiếu ảnh thì hiện ký hiệu cũ
const runeIc = (r) => pxUrl2('an-phu', r.id) ? `<img class="rimg" src="${pxUrl2('an-phu', r.id)}" alt="${r.ic}">` : !hasAsset(`runes/${r.id}.png`) ? r.ic : `<img class="rimg" src="${assetSrc(`runes/${r.id}.png`)}" alt="${r.ic}" onerror="this.replaceWith(this.alt)">`;

// Icon: ưu tiên ảnh vẽ tay trong assets/ (nếu đã có), không thì dùng hình vector
// v182: ô có mô tả khi rê chuột / giữ tay (data-skt = kỹ năng thứ i của tướng đang chọn, data-skr = "loại:i" ở màn Anh Hùng)
const TIP_SEL = '[data-tip], [data-skt], [data-skr]';
function skillIcon(type, i) {
  const px = pxUrl2('ky-nang', `${type}_${SKILL_KEYS[i].toLowerCase()}`);   // claude/xuat-goi-pixel: icon kỹ năng pixel 24×24 khi bật pixel
  if (px) return `<img src="${px}" alt="">`;
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
function itemIcon(id, rarity) {
  const pc = typeof pxItemCode === 'function' && pxItemCode(id, rarity), pu = pc && pxUrl('do', pc);   // pixel art 24×24 (js/pixel.js)
  if (pu) return `<img src="${pu}" alt="">`;
  // v155: bộ icon đồ vẽ tay mới (file đầu danh sách, tools/cat-items.py) luôn dùng như ảnh quái; ảnh AI cũ vẫn theo Cài đặt
  const p = itemPngPath(id)[0];
  if (asset(p, true)) return `<img src="${assetSrc(p)}" alt="">`;
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
  // v163: bộ 5 icon ngũ hành mới (ui/ic-hanh-*.png, tấm ic-ngu-hanh) luôn dùng khi có; ảnh hanh_*.png cũ chỉ khi bật ảnh AI
  const png = (typeof pxUrl === 'function' && pxUrl('icon', 'hanh-' + el)) || (asset(`ui/ic-hanh-${el}.png`, true) && assetSrc(`ui/ic-hanh-${el}.png`)) || assetUrl(`hanh_${el}.png`);
  if (png) return `<img class="eli" src="${png}" width="${size}" height="${size}" style="width:${size}px;height:${size}px" alt="Hành ${e.name}">`;
  return `<svg class="eli" viewBox="0 0 24 24" width="${size}" height="${size}" aria-label="Hành ${e.name}"><circle cx="12" cy="12" r="11" fill="#1A1208" stroke="${e.color}" stroke-width="1.6"/><circle cx="12" cy="12" r="8.6" fill="none" stroke="${e.color}" stroke-width="0.6" stroke-dasharray="1.2 1.4" opacity=".7"/><g fill="none" stroke="${e.color}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${EL_PATH[el]}</g></svg>`;
}
// v182: tên ngắn dưới chân dung ở Bách khoa · Vai trò (tránh hai tướng cùng hiện "Dương Vương")
const VT_SHORT = { adv: 'An Dương', kinhduong: 'Kinh Dương', lyngu: 'Lý Ngư', mau: 'Thượng Ngàn', trongdong: 'Trống Đồng', potaoapui: 'Pơtao Apui' };
const vtShort = (k) => VT_SHORT[k] || CARD_NAME[k] || HEROES[k].name.split(' ').slice(-2).join(' ');
// v182: hàng nút lọc vai trò (Tất cả + 7 vai)
const roleFilter = (cur, act) => `<button class="rl-f ${cur ? '' : 'on'}" data-act="${act}" data-r="">Tất cả</button>${ROLE_KEYS.map((r) => `<button class="rl-f ${cur === r ? 'on' : ''}" data-act="${act}" data-r="${r}" style="--rc:${ROLES[r].color}" title="${ROLES[r].name}: ${ROLES[r].desc}" aria-label="Lọc ${ROLES[r].name}" data-tip="${esc(`<b>${ROLES[r].name}</b><p>${ROLES[r].desc}</p><small>Cộng hưởng 2: ${ROLE_SYN[r].t[0]} · 4: ${ROLE_SYN[r].t[1]}</small>`)}">${roleIcon(r, 15)}<span>${ROLES[r].name}</span></button>`).join('')}`;
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
// v143: tên ngắn trên thẻ chợ tướng (thẻ hẹp, tên đầy đủ quá dài)
const CARD_NAME = { lactuong: 'Lạc Tướng', lucsi: 'Lực Sĩ', xathu: 'Xạ Thủ', thosan: 'Thợ Săn', thaymo: 'Thầy Mo', thansuong: 'Thần Sương',
  thoren: 'Thợ Rèn', nguphu: 'Ngư Phủ', thogom: 'Thợ Gốm', thaylang: 'Thầy Lang', dotnuong: 'Đốt Nương', denroi: 'Đèn Trời', chodo: 'Chèo Đò',
  haisen: 'Hái Sen', dapde: 'Đắp Đê', chantrau: 'Chăn Trâu', giaodong: 'Giáo Đồng', chuongdong: 'Chuông Đồng', tre: 'Tre Làng', ongthoi: 'Ống Thổi' };
function heroImgUrl(type, crop) {
  const px = typeof pxUrl === 'function' && pxUrl('tuong', type, true);   // pixel art: chân dung 32×32 (js/pixel.js)
  if (px) return px;
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
// v149: góp ý — giới hạn gửi + hàng đợi khi chưa có mạng (lưu riêng, không lẫn vào bản lưu đồng bộ đám mây)
const FB_KEY = 'nuicao.feedback';
const FB_KINDS = [['bug', '🐞 Lỗi'], ['idea', '💡 Ý tưởng'], ['balance', '⚖ Cân bằng'], ['other', '💬 Khác']];
const CAMP_STAR_KHO = 40;    // v166: quy đổi sao Phó bản cũ → Ngân khố (một lần)
// v163: màn "Góp ý nhận được" (chỉ tài khoản quản trị): màu từng loại, trạng thái, số mục mỗi trang
const FBA_KIND = { bug: ['Lỗi', '#FF7A5C'], idea: ['Ý tưởng', '#7FD0FF'], balance: ['Cân bằng', '#F2D27A'], other: ['Khác', '#B9B0A0'] };
const FBA_ST = [['new', 'Mới'], ['seen', 'Đã xem'], ['done', 'Đã xử lý']];
const FBA_PAGE = 20;
const FB_GAP = 60000, FB_DAY = 10, FB_QUEUE = 5, FB_MIN = 10, FB_MAX = 1000, FB_SHOT = 150000;
function loadSave() {
  // stars / unlocked / best: tiến trình Phó bản cũ (v166 bỏ Phó bản) — vẫn giữ trong bản lưu, chỉ dùng để quy đổi một lần
  const def = { stars: LEVELS.map(() => 0), unlocked: 1, last: 0, best: {}, bestEndless: {},
    lifeGold: 0, lifeKills: 0, lifeHerbs: 0, collected: [], kho: 0, loginChosen: false, owned: [], runes: {}, legacy: {}, heroRunes: {}, tuvi: {},
    settings: { dmgText: true, shake: true, vectorHeroes: false, detail: false, aiArt: false } };
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
    const out = { ...def, ...s, settings: { ...def.settings, ...(s.settings || {}) } };
    // v48: thêm chương / ải mới → nới mảng sao cho bản lưu cũ
    while (out.stars.length < LEVELS.length) out.stars.push(0);
    // v166: bỏ Phó bản, chỉ còn Vô tận — quy đổi MỘT LẦN tiến trình chiến dịch cũ (sao / ải đã mở vẫn giữ trong bản lưu, không xoá):
    // mỗi sao +CAMP_STAR_KHO Ngân khố; đợt xa nhất từng giữ ở mỗi ải tính vào kỷ lục vô tận của bản đồ đó
    if (!out.campConv) {
      const stars = out.stars.reduce((a, b) => a + (b || 0), 0);
      out.bestEndless = out.bestEndless || {};
      for (const k of Object.keys(out.best || {})) out.bestEndless[k] = Math.max(out.bestEndless[k] || 0, out.best[k] || 0);
      if (stars) { out.kho = (out.kho || 0) + stars * CAMP_STAR_KHO; out.campGift = stars * CAMP_STAR_KHO; }
      out.campConv = 1;
    }
    // v182: Ngân khố mở khoá mọi tướng — bản lưu đã có từ trước v182 giữ đủ 20 tướng Thường (không mất tiến trình);
    // người chơi mới (chưa có bản lưu) có sẵn STARTER_HEROES. owned = mọi tướng đã mở (Thường + Tím + Vàng).
    if (!out.heroOpenV) {
      out.owned = [...new Set([...(out.owned || []), ...(Object.keys(s).some((k) => k !== 'owner') ? BASIC_HEROES : STARTER_HEROES)])];
      out.heroOpenV = 1;
    }
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
    icPreload();
    this.scale = 1;
    this.sel = -1;          // ô có tướng đang chọn
    this.spot = -1;         // ô trống đang chọn
    this.armed = null;      // loại tướng chờ đặt
    this.raising = false;   // đang chọn ô để Mọc Núi
    this.moving = -1;       // đang đổi chỗ tướng
    this.screen = null;     // { kind, ... }
    this.sig = {};
    this.refreshT = 0;
    this.coachSlot = -1;
    this.toastList = [];
    game.known = new Set(this.save.secrets || []);
    this.bind();
    this.watchToasts();
    this.buildSummon();
    $('#menu-art').innerHTML = `<img class="keyart" src="${assetSrc('ui/nen-menu.jpg')}" alt="" onerror="this.outerHTML=''">` + svgI(sceneArt('menu'));
    // v145: logo tựa "Thần Thoại Việt" — có ảnh assets/ui/logo-tua.png thì hiện ảnh, không thì giữ chữ HTML
    if (hasAsset('ui/logo-tua.png')) $('#menu-logo').insertAdjacentHTML('afterbegin', `<img class="logo-img" src="${assetSrc('ui/logo-tua.png')}" alt="Thần Thoại Việt" hidden onload="this.hidden=false;this.parentNode.classList.add('has-img')" onerror="this.remove()">`);
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
  }
  cloudRow() {
    if (typeof CLOUD === 'undefined') return '';
    const u = CLOUD.user;
    const btn = !CLOUD.enabled ? '' : !u ? '' : u.isAnonymous
      ? '<button class="btn btn-gold" style="height:34px;padding:0 12px;font-size:13px" data-act="cloud-google">Đăng nhập Google</button>'
      : this.outArm ? this.outConfirm()
      : '<button class="btn metal" style="height:34px;padding:0 10px;font-size:13px" data-act="cloud-sync">Đồng bộ ngay</button><button class="btn metal" style="height:34px;padding:0 10px;font-size:13px" data-act="cloud-out">Đăng xuất</button>';
    return `<div class="tg metal" id="cloud-row"><div><b>Tài khoản</b><small>${esc(CLOUD.label())}</small></div>
      <div style="margin-left:auto;display:flex;gap:4px">${btn}</div></div>`;
  }
  // v165: đăng xuất có bước xác nhận ngay trong giao diện (Cài đặt, bảng tài khoản ở khung người chơi, màn đăng nhập)
  outConfirm() {
    return '<span class="out-ask">Đăng xuất? Tiến trình trên máy vẫn giữ.</span><button class="btn btn-gold" style="height:34px;padding:0 10px;font-size:13px" data-act="cloud-out-ok">Đăng xuất</button><button class="btn metal" style="height:34px;padding:0 10px;font-size:13px" data-act="cloud-out-no">Huỷ</button>';
  }
  // v165: chạm khung người chơi ở menu → bảng nhỏ: tên, đổi biệt danh, Đăng xuất (đã đăng nhập) / Đăng nhập (khách)
  renderPlPop() {
    const pop = $('#pl-pop');
    if (!this.plPop) { pop.hidden = true; return; }
    const C = typeof CLOUD !== 'undefined' ? CLOUD : null, u = C && C.user, signed = !!(C && C.enabled && C.signedIn);
    const nick = this.nickName();
    const acc = !C || !C.enabled ? 'Chơi ngoại tuyến'
      : signed ? esc(u.email || u.displayName || 'Tài khoản') : 'Khách · chưa đăng nhập';
    pop.innerHTML = `<div class="pp-who"><b>${nick ? esc(nick) : 'Khách'}</b><small>${acc}</small></div>
      <div class="pp-nick"><input id="pl-nick" maxlength="20" placeholder="Đặt biệt danh" value="${esc(nick)}"><button class="btn metal" data-act="pl-rename">Đổi tên</button></div>
      ${this.plMsg ? `<div class="pp-msg">${esc(this.plMsg)}</div>` : ''}
      <div class="pp-act">${signed ? (this.outArm ? this.outConfirm() : '<button class="btn metal" data-act="cloud-out">Đăng xuất</button>')
        : C && C.enabled ? '<button class="btn btn-gold" data-act="pl-login">Đăng nhập</button>' : ''}</div>`;
    pop.hidden = false;
  }
  renderSettingsCloud() { const r = $('#cloud-row'); if (r) r.outerHTML = this.cloudRow(); }

  // ---------- gắn sự kiện
  bind() {
    const g = this.game;
    // Xuất Quân: đang có trận dở thì quay lại trận, không thì chọn chế độ (Vô tận / Cùng Giữ Thành)
    $('#btn-continue').onclick = () => {
      const g = this.game;
      // v131: trận vô tận đang dở phải truyền đúng chế độ, không thì playLevel tưởng là trận mới và chơi lại từ đầu
      if (g.started && !g.over && (!g.won || g.endless)) return this.playLevel(g.level);
      if (this.save.run) return this.resumeRun();
      this.showModes();
    };
    $('#btn-newgame').onclick = () => this.showModes();
    $('#btn-heroes').onclick = () => this.showRoster();
    $('#btn-runes').onclick = () => this.showRunes(false);
    // v124–126: icon nút vẽ tay phong cách trống đồng (assets/ui/); thiếu ảnh thì giữ ký hiệu cũ
    const uiImg = (f, alt, cls = 'uimg') => !hasAsset(`ui/${f}.png`) ? alt : `<img class="${cls}" src="${assetSrc(`ui/${f}.png`)}" alt="${alt}" onerror="this.replaceWith(this.alt)">`;
    this.uiImg = uiImg;
    { const dw = document.querySelector('[data-act=dw][data-k=heroes] .ic'); if (dw) dw.innerHTML = UIE.medal(3); }
    for (const el of document.querySelectorAll('#drawer .dw-btn .ic')) if (EMO_ART[el.textContent.trim()]) el.innerHTML = emoArt(el.textContent.trim());
    for (const [q, f] of [['#auto-btns [data-act=open-bag] .i', 'ui-menu-2-4'], ['[data-act=auto-up-gear] .i', 'ui-tran-2-2'], ['[data-act=auto-eq-all] .i', 'ui-tran-2-3']]) {
      const el = document.querySelector(q);
      if (el) el.innerHTML = uiImg(f, el.textContent);
    }
    // nút trên thanh trận: mắt (chỉ số), menu ≡ giữ nguyên hình vẽ; Bắt đầu / Dừng dùng mặt trống
    $('#btn-detail').innerHTML = uiImg('ui-tran-1-4', '👁', 'uimg tb');
    $('#btn-run').insertAdjacentHTML('beforeend', uiImg('ui-tran-1-1', '', 'uimg tb run-play') + uiImg('ui-tran-1-2', '', 'uimg tb run-pause'));
    // menu chính: thay hình vẽ nét bằng icon vẽ tay
    for (const [id, f] of [['#btn-continue', 'ui-menu-1-1'], ['#btn-heroes', 'ui-menu-1-2'], ['#btn-treasury', 'ui-menu-1-3'], ['#btn-settings', 'ui-menu-2-1'], ['#btn-runes', 'ui-menu-1-4']]) {
      const b = $(id); if (!b) continue;
      const old = b.querySelector('svg, .mc-ic'); if (old) old.outerHTML = uiImg(f, '', 'uimg mc');
    }
    for (const [id, f] of [['#btn-menu-codex', 'ui-menu-2-2'], ['#btn-ranks', 'ui-menu-2-3']]) {
      const b = $(id); if (b) b.innerHTML = uiImg(f, '', 'uimg sub') + b.textContent.replace(/^\S+\s*/, '');
    }
    $('#btn-treasury').onclick = () => this.showTreasury();
    $('#btn-ranks').onclick = () => this.showRanks('endless');
    $('#btn-menu-codex').onclick = () => this.openScreen('codex', { top: true });
    $('#btn-settings').onclick = () => this.showSettings(false);
    $('#btn-feedback').onclick = () => this.showFeedback('menu');
    // góp ý còn trong hàng đợi: gửi lại khi có mạng / khi vừa kết nối được Firebase
    window.addEventListener('online', () => this.fbFlush());
    // v166: bộ lọc dạng drop-down ở màn Góp ý nhận được
    $('#fbadmin').addEventListener('change', (ev) => { const t = ev.target; if (t.id === 'fba-kind' || t.id === 'fba-stf') this.fbaAct({ act: t.id, k: t.value }); });
    if (typeof CLOUD !== 'undefined') CLOUD.onChange(() => { if (CLOUD.ready) this.fbFlush(); this.fbaCheck(); });
    // v153: trò chuyện trong trận nhóm (💬 trên thanh trên; Enter để gửi)
    $('#btn-chat').onclick = () => this.chatToggle();
    $('#chat').addEventListener('keydown', (ev) => { if (ev.key === 'Enter' && ev.target.id === 'chat-in') { ev.preventDefault(); this.chatAct({ act: 'chat-send' }); } });
    $('#btn-menu').onclick = () => { $('#drawer').hidden = !$('#drawer').hidden; $('#more').hidden = true; $('#legends').hidden = true; };
    $('#btn-moc').onclick = () => {
      this.raising = !this.raising;
      this.moving = -1;
      if (this.raising) this.toast('Chạm vào ô ngập hoặc ô đang nhấp nháy xanh để Mọc Núi', '#F2D27A');
    };
    $('#btn-run').onclick = () => {
      if (!g.started || g.over) return;
      // v141: chơi nhóm không tạm dừng; nút chỉ để bắt đầu đợt 1 (cả hai đều bấm được)
      if (COOP.on) { if (g.co && !g.co.started) COOP.issue('start'); else this.toast('Chơi nhóm không tạm dừng được', '#C8BFA8'); return; }
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
    // v180: ẩn hết nút trên màn hình, chỉ còn bản đồ + tướng + quái; nút nhỏ ở góc (hoặc phím H) để hiện lại
    $('#btn-hideui').onclick = () => this.setUiHidden(true);
    $('#btn-showui').onclick = () => this.setUiHidden(false);
    $('#btn-speed').onclick = () => {
      const v = g.speed === 1 ? 2 : g.speed === 2 ? 3 : 1;
      if (COOP.on) { COOP.issue('speed', [v]); this.toast(`Tốc độ x${v} (đổi cho cả hai người)`, '#C8BFA8'); return; }
      g.speed = v;
    };
    $('#nextwaves').onclick = () => {
      if (!$('#nextwaves').classList.contains('early')) return;
      if (COOP.on && g.co && !g.co.started) return COOP.issue('start');
      this.cmd('callEarly', [], (b) => {
        if (!COOP.on) g.running = true;
        if (b) this.toast(`Gọi sớm: +${b} vàng`, '#F2D27A');
      });
    };
    // ủy quyền sự kiện cho các vùng dựng lại liên tục
    for (const id of ['#fuse-strip', '#auto-btns', '#screen', '#deck', '#drawer', '#more', '#reward', '#result', '#campaign', '#settings', '#legends', '#roster', '#runes', '#treasury', '#prep', '#login', '#ranks', '#modes', '#feedback', '#coop', '#coop-bar', '#chat', '#fbadmin', '#pl-pop']) {
      $(id).addEventListener('click', (ev) => {
        const el = ev.target.closest('[data-act]');
        if (this.tipShown) { this.tipShown = false; ev.preventDefault(); return; }   // vừa giữ tay xem mô tả: không nâng kỹ năng
        if (el && !el.disabled) this.action(el.dataset, el);
      });
    }
    // v165: chạm ra ngoài bảng tài khoản thì đóng
    $('#menu').addEventListener('pointerdown', (ev) => {
      if (this.plPop && !ev.target.closest('#pl-pop, #menu-player')) { this.plPop = false; this.outArm = false; this.renderPlPop(); }
    });
    // v154: giữ tay ~0,35 giây lên chân dung ở thanh đáy → hiện bảng chỉ số tướng; thả tay là ẩn.
    // Chạm nhanh không mở bảng (lần đầu nhắc "Giữ ảnh để xem chỉ số").
    let stT = 0, stP = null;
    const stEnd = (ev) => {
      if (!stP || (ev && ev.pointerId !== undefined && ev.pointerId !== stP.id)) return;
      clearTimeout(stT);
      if (!this.statsOpen && ev && ev.type === 'pointerup' && !this.statsHinted) { this.statsHinted = true; this.toast('Giữ ảnh để xem chỉ số'); }
      stP = null;
      if (this.statsOpen) { this.statsOpen = false; $('#hero-stats').hidden = true; }
    };
    $('#deck').addEventListener('pointerdown', (ev) => {
      if (!ev.target.closest('.dk-pt') || (ev.pointerType === 'mouse' && ev.button !== 0)) return;
      stEnd(); stP = { id: ev.pointerId, x: ev.clientX, y: ev.clientY };
      stT = setTimeout(() => { if (stP && this.game.heroes[this.sel]) { this.statsOpen = true; this.statsSig = null; } }, 350);
    });
    window.addEventListener('pointermove', (ev) => { if (stP && !this.statsOpen && ev.pointerId === stP.id && Math.hypot(ev.clientX - stP.x, ev.clientY - stP.y) > 12) { clearTimeout(stT); stP = null; } });
    for (const e of ['pointerup', 'pointercancel']) window.addEventListener(e, stEnd, true);
    window.addEventListener('blur', () => { stP = stP || { id: undefined }; stEnd(); });
    $('#deck').addEventListener('contextmenu', (ev) => { if (ev.target.closest('.dk-pt')) ev.preventDefault(); });
    // v182: mô tả khi RÊ CHUỘT (máy tính) hoặc GIỮ TAY ~0,35 giây (điện thoại) lên ô kỹ năng / ô có data-tip
    // (thanh tướng trong trận, Cây kỹ năng, Anh Hùng, Ấn Phù, Thần Khí, thẻ tướng…). Chạm / bấm nhanh giữ hành vi cũ.
    let hovEl = null, hovT = 0, prT = 0, pr = null;
    document.addEventListener('pointerover', (ev) => {
      if (ev.pointerType !== 'mouse') return;
      const el = ev.target.closest && ev.target.closest(TIP_SEL);
      if (el === hovEl) return;
      hovEl = el; clearTimeout(hovT);
      if (!el) return this.hideTip();
      hovT = setTimeout(() => { if (hovEl === el && el.isConnected) this.openTip(el, 'hover'); }, 150);
    });
    document.addEventListener('pointerout', (ev) => { if (ev.pointerType === 'mouse' && !ev.relatedTarget) { hovEl = null; clearTimeout(hovT); this.hideTip(); } });
    $('#ui').addEventListener('pointerdown', (ev) => {
      this.tipShown = false;
      clearTimeout(prT); pr = null;
      if (ev.pointerType === 'mouse') return;   // chuột: rê là thấy, bấm vẫn nâng như cũ
      this.hideTip();
      const el = ev.target.closest(TIP_SEL);
      if (!el) return;
      pr = { id: ev.pointerId, x: ev.clientX, y: ev.clientY };
      prT = setTimeout(() => { if (pr && el.isConnected) { this.tipShown = true; this.openTip(el, 'press'); } }, 350);
    }, true);
    window.addEventListener('pointermove', (ev) => { if (pr && ev.pointerId === pr.id && !this.tipShown && Math.hypot(ev.clientX - pr.x, ev.clientY - pr.y) > 12) { clearTimeout(prT); pr = null; } });
    const prEnd = (ev) => {
      if (!pr || ev.pointerId !== pr.id) return;
      clearTimeout(prT); pr = null;
      if (this.tipShown) setTimeout(() => this.hideTip(), 0);
    };
    for (const e of ['pointerup', 'pointercancel']) window.addEventListener(e, prEnd, true);
    $('#ui').addEventListener('scroll', () => { if (this.tip) this.hideTip(); }, true);
    $('#ui').addEventListener('contextmenu', (ev) => { if (ev.target.closest(TIP_SEL)) ev.preventDefault(); });
    for (const id of ['#roster', '#runes', '#prep']) $(id).addEventListener('click', (ev) => { if (this.tipShown) { this.tipShown = false; ev.stopPropagation(); ev.preventDefault(); } }, true);
    // ô đang chỉ bị dựng lại (hồi chiêu đếm, vừa nâng cấp…): tìm ô mới cùng chỗ để cập nhật nội dung, mất hẳn thì ẩn
    setInterval(() => {
      const tp = this.tip; if (!tp) return;
      if (tp.el.isConnected && tp.el.offsetParent) { if (tp.el.dataset.skt !== undefined) this.openTip(tp.el, tp.mode); return; }
      const nx = document.elementFromPoint(tp.cx, tp.cy), el = nx && nx.closest(TIP_SEL);
      if (el && (tp.mode === 'press' || hovEl)) { if (tp.mode === 'hover') hovEl = el; this.openTip(el, tp.mode); } else this.hideTip();
    }, 250);
    window.addEventListener('keydown', (ev) => {
      if (ev.target && /^(INPUT|TEXTAREA)$/.test(ev.target.tagName)) return;   // đang gõ chữ (góp ý, đổi tên): không bắt phím tắt
      if (ev.key === 'Escape' && !$('#feedback').hidden) return this.fbClose();
      if (ev.key === 'Escape' && !$('#fbadmin').hidden) return this.fbaKey();
      if (ev.key === 'Escape' && this.escBack()) return;   // đóng màn phụ trên cùng (Thần Khí, Anh Hùng, Ấn Phù, bảng trong trận…)
      if (!g.started) return;
      const k = ev.key.toLowerCase();
      const h = g.heroes[this.sel];
      if (k === 'h' && !this.screen && !g.over && !ev.ctrlKey && !ev.metaKey && !ev.altKey) return this.setUiHidden(!this.uiHidden);
      if (k === 'escape' && this.uiHidden && !this.screen) return this.setUiHidden(false);
      if (k === 'escape') return this.screen ? this.closeScreen() : this.clearSel();
      if (this.screen || !h) return;
      if (k === 'u') this.doLevelUp(h);
    });
    this.bindHistoryBack();
  }

  // claude/sua-thoat-than-khi: Esc / nút Quay lại của trình duyệt (vuốt back trên điện thoại) → đóng màn phụ trên cùng,
  // đúng như bấm nút quay lại / ✕ của màn đó (Thần Khí → Anh Hùng → trận/menu). Không có gì để đóng thì trả về null.
  backTarget() {
    if (this.tip) return () => this.hideTip();
    for (const id of ['#ranks', '#treasury', '#runes', '#roster', '#settings', '#coop', '#modes', '#campaign']) {
      const el = $(id);
      if (el.hidden) continue;
      const b = el.querySelector('.scr-head [data-act$="close"], .scr-head [data-act$="back"]') || el.querySelector('[data-act$="-close"], [data-act$="-back"]');
      if (b) return () => b.click();
    }
    if (!$('#screen').hidden) return () => this.closeScreen();
    if (!$('#legends').hidden) return () => this.openLegends(false);
    if (!$('#more').hidden) return () => this.action({ act: 'deck-close' });
    if (!$('#drawer').hidden) return () => { $('#drawer').hidden = true; };
    return null;
  }
  escBack() { const f = this.backTarget(); if (f) f(); return !!f; }
  // nút Quay lại của trình duyệt: khi đang mở màn phụ thì gài một mục lịch sử; bấm back → đóng màn đó thay vì rời trang
  bindHistoryBack() {
    let trap = false;
    const arm = () => {
      if (trap || !this.backTarget() || this.tip) return;
      try { history.pushState({ tt: 1 }, ''); trap = true; } catch (e) { /* trình duyệt chặn: bỏ qua */ }
    };
    // gài khi một màn phụ vừa hiện (bấm nút, phím tắt, hay mở bằng mã) — chỉ theo dõi thuộc tính hidden
    new MutationObserver(() => { if (!trap) arm(); }).observe($('#wrap'), { subtree: true, attributes: true, attributeFilter: ['hidden'] });
    window.addEventListener('popstate', () => { trap = false; if (this.escBack()) setTimeout(arm, 0); });
  }

  // ảnh vẽ tay cho các icon cố định trên thanh trên (vàng, mạng, mực nước)
  applyUiArt() {
    // dùng ảnh có sẵn: đồng xu / trái tim / nước dâng trong assets/ui luôn dùng khi có file; ảnh ui_* cũ chỉ khi bật "Dùng ảnh AI"
    const TB_ART = { 'dong-vang': COIN_SRC, mang: ['ui/ui-tai-nguyen-2.png'], 'muc-nuoc': ['ui/ic-nuoc-dang.png'] };
    const put = (sel, name) => {
      const u = uiSrcOf(TB_ART[name] || []) || assetUrl(`ui_${name}.png`), el = $(sel);
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
    const best = Math.max(0, ...Object.values(s.bestEndless || {}));
    const lv = 1 + Math.floor(Math.sqrt(s.lifeKills / 25));
    const acc = typeof CLOUD !== 'undefined' && CLOUD.user && !CLOUD.user.isAnonymous ? CLOUD.user : null;
    // v146: khung ảnh đã có huy hiệu mặt trời — chỉ đặt ảnh Google (nếu có) vào lòng huy hiệu, không chèn SVG.
    // Chưa đặt biệt danh thì hiện "Khách" + gợi ý chạm để đặt tên (không lấy phần đầu email).
    const nick = this.nickName();
    $('#menu-player').innerHTML = `${acc && acc.photoURL ? `<span class="av"><img src="${esc(acc.photoURL)}" alt="" referrerpolicy="no-referrer" onerror="this.parentNode.remove()"></span>` : ''}<span class="pl-txt"><b>${nick ? esc(nick) : 'Khách <i class="pl-hint">✎ đặt tên</i>'}</b><small>Cấp ${lv} · ♾ đợt ${best}</small></span>`;
    $('#menu-player').title = nick ? 'Tài khoản & đổi tên' : 'Chạm để đặt biệt danh';
    for (const el of $('#menu-player').querySelectorAll('b, small')) fitText(el, el.tagName === 'B' ? 10 : 8);
    $('#menu-player').onclick = () => { this.plPop = !this.plPop; this.outArm = false; this.plMsg = ''; this.renderPlPop(); };
    this.renderPlPop();
    if (s.campGift) { this.toast(`Phó bản đã gộp vào <b>Vô tận</b>: mọi bản đồ đều mở. Sao cũ đổi thành ${bac(1)} ${fmt(s.campGift)} Ngân khố.`, '#F2D27A'); delete s.campGift; writeSave(s); }
    if (s.runeRefund) { this.toast(`Ấn Phù giờ riêng từng tướng, khắc bằng điểm Tu Vi. Đã hoàn ${fmt(s.runeRefund)} Ngân khố đã tiêu cho ấn cũ.`, '#E4ECF4'); delete s.runeRefund; writeSave(s); }
    const short = (n) => (n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace('.', ',') + 'k' : n);
    $('#menu-res').innerHTML = `<span title="Ngân khố: bạc thưởng sau mỗi trận, dùng mua tướng Tím / Vàng, Thần Khí, đồ trước trận — không dùng được trong trận"><small class="pr-l">Ngân khố</small>${bac(1)} <b style="color:#E4ECF4">${fmt(s.kho || 0)}</b></span>`;
    if (0) $('#menu-res').innerHTML = `<span title="Tổng vàng đã kiếm qua mọi trận (vàng trong trận luôn bắt đầu từ ${CONFIG.startGold})"><small class="pr-l">Tổng vàng đã kiếm</small>${coin(1)} ${short(s.lifeGold)}</span><span title="Linh Chi đã hái">🌿 ${short(s.lifeHerbs)}</span><span title="Ngân khố: vàng thưởng sau mỗi trận thắng, dùng mua đồ / tướng trước trận"><small class="pr-l">Ngân khố</small>${coin(1)} <b style="color:#FFD66B">${fmt(s.kho || 0)}</b></span>`;
    $('#menu-art').innerHTML = `<img class="keyart" src="${assetSrc('ui/nen-menu.jpg')}" alt="" onerror="this.outerHTML=''">` + svgI(sceneArt('menu'));
    const g0 = this.game, live = g0.started && !g0.over && (!g0.won || g0.endless);
    const run = !live && s.run;
    const lvN = live ? (g0.stage ? g0.stage.lv : g0.level) : run ? endlessStageAt(run.wave || 0, run.level || 0).lv : 0, wN = live ? g0.wave : run ? run.wave : 0;   // vô tận theo màn: tên vùng đất đang chơi (màn là hàm của số đợt — khớp màn khi Tiếp tục, cả bản lưu cũ)
    $('#continue-label').textContent = live || run ? `Tiếp tục · ${(LEVELS[lvN] || LEVELS[0]).name} · Đợt ${wN} ♾` : 'Xuất Quân';
    $('#btn-newgame').hidden = !(live || run);
    $('#roster-hint').onclick = () => { $('#roster-hint').hidden = true; };
    this.setInGame(false);
  }
  hideOverlays() {
    this.plPop = false; this.outArm = false; $('#pl-pop').hidden = true;
    for (const id of ['#menu', '#campaign', '#settings', '#result', '#reward', '#roster', '#runes', '#treasury', '#prep', '#login', '#ranks', '#modes', '#coop', '#fbadmin']) $(id).hidden = true;
    if (this.needLogin()) this.showLogin(false);   // v73: chưa đăng nhập thì luôn che game
  }
  setUiHidden(on) {
    on = !!on;
    if (on) { this.clearSel(); $('#drawer').hidden = true; $('#legends').hidden = true; }
    this.uiHidden = on;
    $('#wrap').classList.toggle('ui-off', on);
    $('#btn-showui').hidden = !on;
  }
  setInGame(on) {
    if (!on && this.uiHidden) this.setUiHidden(false);
    document.querySelectorAll('.ingame').forEach((el) => { el.hidden = !on; });
    if (!on) for (const id of ['#legends', '#bossbar', '#coach', '#drawer', '#more', '#deck-hint', '#btn-moc', '#nextwaves', '#coop-bar']) $(id).hidden = true;
    if (on) $('#coop-bar').hidden = !COOP.on;
  }

  // v166: chỉ còn chế độ Vô tận — i là bản đồ (chỉ số trong LEVELS); tham số thứ hai giữ cho chỗ gọi cũ, bỏ qua
  playLevel(i) {
    const g = this.game;
    // đang chơi dở đúng bản đồ này thì quay lại trận
    if (g.started && !g.over && g.endless && g.level === i) {
      this.hideOverlays();
      this.setInGame(true);
      return;
    }
    this.startLevel(i);
  }

  startLevel(i) {
    const g = this.game;
    if (COOP.on) return this.toast('Đang chơi nhóm: thoát trận nhóm trước (≡ → Dừng chơi)', '#E25A3A');
    if (g.started) this.bankStats();
    g.hard = !!this.save.settings.hard;
    g.reset(i);
    g.endless = true;
    g.owned = new Set(this.save.owned || []);
    setRunes(this.save.heroRunes || {});
    setLegacy(this.save.legacy || {});
    g.runId = Date.now();
    g.started = true;
    g.running = false;
    g.speed = 1;
    this.sel = -1; this.spot = -1; this.armed = null; this.raising = false; this.moving = -1;
    this.hideTrash();     // sua-trieu-hoi: không mang thùng 🗑 / lớp dragging-hero (ẩn chợ) sót từ trận trước sang
    this.screen = null;
    $('#screen').hidden = true;
    this.save.last = i;
    writeSave(this.save);
    this.hideOverlays();
    this.setInGame(true);
    this.prepBought = {}; this.prepShopRolled = false;
    { const id = themeOf(i).id; resultImg(id, true); resultImg(id, false); }   // v163: tải sẵn tranh thắng / thua của chương (nếu có ảnh)
    this.saveRun();
    this.showPrep();   // v77: luôn hiện (có Lò đúc đồng trước trận)
  }

  // ---------- v182: mở khoá tướng bằng Ngân khố + nhiệm vụ ngày
  heroOpen(t) { return (this.save.owned || []).includes(t); }
  openCount() { const all = [...BASIC_HEROES, ...LEGEND_HEROES]; return { n: all.filter((t) => this.heroOpen(t)).length, all: all.length }; }
  // nhiệm vụ ngày (QUESTS): s.quest = { d: ngày, boss, waves, got: { id: true } } — sang ngày mới thì đặt lại
  questDay() {
    const s = this.save, today = new Date().toISOString().slice(0, 10);
    if (!s.quest || s.quest.d !== today) s.quest = { d: today, boss: 0, waves: 0, got: {} };
    if (s.dailyWin === today) s.quest.got.first = true;     // thưởng trận đầu ngày (v103) tính là nhiệm vụ 'first'
    return s.quest;
  }
  questProg(q, id) { return id === 'first' ? (q.got.first ? 1 : 0) : Math.min(QUESTS.find((x) => x.id === id).need, q[id] || 0); }
  // cộng tiến độ một trận (đợt đã qua, boss đã hạ) → trả về [{ q, kho }] nhiệm vụ vừa xong (đã cộng Ngân khố)
  questAdd(waves, boss) {
    const q = this.questDay(), done = [];
    q.waves += Math.max(0, waves); q.boss += Math.max(0, boss);
    for (const x of QUESTS) if (x.id !== 'first' && !q.got[x.id] && q[x.id] >= x.need) { q.got[x.id] = true; this.save.kho = (this.save.kho || 0) + x.kho; done.push(x); }
    return done;
  }
  // màn kết quả: tướng rẻ nhất chưa mở — đủ tiền thì mời mở ngay, chưa đủ thì báo còn thiếu bao nhiêu
  unlockHint() {
    // cho-6-the: chưa mở tướng Tím nào thì nhắc — hợp thể trong trận cần tướng đích đã mở khoá
    const noEpic = !LEGEND_HEROES.some((t) => HEROES[t].legend === 'epic' && this.heroOpen(t));
    return (noEpic ? `<div class="res-unl res-tim"><span>Hợp thể</span><b>Mở khoá 1 tướng Tím ở Anh Hùng · ${bac(1)}${fmt(OWN_COST.epic)} để hợp thể được trong trận</b></div>` : '') + this.unlockHint0();
  }
  unlockHint0() {
    const left = [...BASIC_HEROES, ...LEGEND_HEROES].filter((t) => !this.heroOpen(t));
    if (!left.length) return `<div class="res-unl"><span>Anh Hùng</span><b style="color:#6AE06A">${UIE.done()} Đã mở đủ ${this.openCount().all} tướng</b></div>`;
    const t = left.sort((a, b) => OWN_COST[heroTier(a)] - OWN_COST[heroTier(b)])[0], c = OWN_COST[heroTier(t)], kho = this.save.kho || 0, oc = this.openCount();
    return `<div class="res-unl"><span>Anh Hùng · đã mở ${oc.n}/${oc.all}</span><b>${kho >= c ? `<button class="btn btn-gold" data-act="res-heroes" data-type="${t}">${UIE.lock()} Mở ${esc(HEROES[t].name)} · ${bac(1)}${fmt(c)}</button>` : `Mở ${esc(HEROES[t].name)}: còn thiếu ${bac(1)} ${fmt(c - kho)}`}</b></div>`;
  }
  questLine() {
    const q = this.questDay();
    return QUESTS.map((x) => `<span class="qd ${q.got[x.id] ? 'ok' : ''}">${q.got[x.id] ? UIE.done() : '◻'} ${esc(x.name)}${x.need > 1 && !q.got[x.id] ? ` ${this.questProg(q, x.id)}/${x.need}` : ''} · ${bac(1)}${fmt(x.kho)}</span>`).join('');
  }

  // ---------- v66: Chuẩn bị xuất quân — tiêu Ngân khố mua đồ / vàng / tướng Tím, Vàng trước trận
  // (claude/bo-chon-doi: bỏ bảng chọn đội ưu tiên — chợ tướng rút từ mọi tướng Thường đã mở)
  showPrep() {
    const s = this.save, g = this.game, b = this.prepBought || {};
    const kho = s.kho || 0;
    const card = (id, title, desc, cost, icon, done) => `<button class="prep-card metal ${done ? 'done' : ''}" data-act="prep-buy" data-id="${id}" ${done || kho < cost ? 'disabled' : ''}>
        <span class="ic">${icon}</span><b>${title}</b><small>${desc}</small><span class="cost">${done ? UIE.done() + ' Đã mua' : `${bac()} ${fmt(cost)}`}</span></button>`;
    const heroCard = (t) => { const d = HEROES[t], cost = PREP.heroCost[d.legend]; const done = b.hero;
      return `<button class="prep-hero metal ${d.legend} ${b.hero === t ? 'on' : ''}" data-act="prep-hero" data-id="${t}" ${done || kho < cost || !g.freeSlots().length ? 'disabled' : ''}>
        <img src="${heroImgUrl(t, 'head')}" alt=""><b>${d.name}</b><span class="cost">${b.hero === t ? UIE.done() : `${bac()} ${fmt(cost)}`}</span></button>`; };
    const legends = Object.keys(HEROES).filter((t) => HEROES[t].legend === 'legendary');
    const epics = Object.keys(HEROES).filter((t) => HEROES[t].legend === 'epic');
    $('#prep').innerHTML = `<div class="screen" style="z-index:auto">
      <div class="scr-head metal"><h1 class="ttl">Chuẩn bị xuất quân</h1><span class="chip dark">${UIE.endless()} Vô tận · ${g.placeName()}</span><button class="chip ${this.save.settings.hard ? 'on' : ''}" data-act="prep-diff" title="Máu quái ×${HARD.hp(g.level).toFixed(2)} · Ngân khố ×1,5">🔥 Khó: ${this.save.settings.hard ? 'Bật' : 'Tắt'}</button><div class="sp"></div>
        <span class="chip kho">Ngân khố ${bac(1)} ${fmt(kho)}</span>
        <button class="btn btn-gold title" style="height:40px;padding:0 18px;font-size:17px" data-act="prep-go">Vào trận ▶</button></div>
      <div class="prep-body">
        <div class="prep-col"><div class="h">Hậu cần</div>
          ${card('gold', 'Lương thảo', `+${PREP.goldAmount} vàng đầu trận`, PREP.goldCost, ic('tui-vang'), b.gold)}
          ${card('jar', 'Hũ đồng', 'Mở ngay 2 món Hiếm trở lên vào túi', PREP.jarCost, ic('hu-bau'), b.jar)}
          ${card('king', 'Hũ Vua Hùng', 'Mở ngay 2 món Sử thi trở lên (35% đồ bộ)', PREP.kingCost, UIE.medal(3), b.king)}
          ${card('lives', 'Đắp thành', `+${PREP.livesAmount} mạng (${g.maxLives - (b.lives ? PREP.livesAmount : 0)} → ${g.maxLives + (b.lives ? 0 : PREP.livesAmount)})`, PREP.livesCost, ic('mang'), b.lives)}
          <button class="prep-card metal" data-act="prep-forge"><span class="ic">${emoArt('⚒')}</span><b>Lò đúc đồng</b><small>Mua và đúc đồ bằng Ngân khố</small><span class="cost">Mở ›</span></button></div>
        <div class="prep-col wide"><div class="h">Tướng đã sở hữu (hợp thể được trong trận)</div>
          <div class="prep-heroes">${LEGEND_HEROES.filter((t) => (this.save.owned || []).includes(t)).map((t) => `<span class="prep-hero metal ${HEROES[t].legend}"><img src="${heroImgUrl(t, 'head')}" alt=""><b>${HEROES[t].name}</b></span>`).join('')
            || '<div class="note">Chưa có tướng Tím / Vàng nào.</div>'}</div></div>
        <div class="prep-col cp-side prep-counter">${this.counterHtml(g.level)}</div>
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
    if (id === 'lives') g.gainLives(PREP.livesAmount);
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
    if (COOP.on || g.co) return;     // v141: trận nhóm không lưu để tiếp tục một mình
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
      if (k && !g.over) {
        const qd = this.questAdd(g.wave - 1, g.bossesKilled || 0);      // v182: dừng trận vẫn tính nhiệm vụ ngày
        this.save.kho = (this.save.kho || 0) + k; writeSave(this.save);
        this.toast(`Ngân khố ${bac(1)} +${fmt(k)} (dừng ở đợt ${g.wave})${qd.map((x) => `<br>☀ ${esc(x.name)} +${fmt(x.kho)}`).join('')}`, '#E4ECF4');
      }
    }
    if (g.endless) { this.submitScores(); const sv = this.save; sv.bestEndless = sv.bestEndless || {}; sv.bestEndless[g.level] = Math.max(sv.bestEndless[g.level] || 0, g.wave); writeSave(sv); }
    g.running = false; g.over = true; g.started = false;
    if (COOP.on || g.co) { COOP.end(true); this.lobby = null; }
    else this.clearRun();
    this.closeScreen && this.closeScreen();
    this.showMenu();
    this.toast('Đã dừng trận', '#C8BFA8');
  }
  clearRun() { if (this.save.run) { delete this.save.run; writeSave(this.save); } }
  resumeRun() {
    const r = this.save.run;
    if (!r || !LEVELS[r.level]) { this.clearRun(); return this.showCampaign(this.save.last); }
    // v166: trận Phó bản dở (bản lưu cũ) chơi tiếp thành vô tận
    try { this.game.restore(r); this.game.endless = true; this.game.won = false; this.game.owned = new Set(this.save.owned || []); setRunes(this.save.heroRunes || {}); setLegacy(this.save.legacy || {}); } catch (e) { this.clearRun(); this.toast('Không nạp được màn đã lưu', '#E25A3A'); return this.showCampaign(this.save.last); }
    this.sel = -1; this.spot = -1; this.armed = null; this.raising = false; this.moving = -1; this.screen = null;
    $('#screen').hidden = true;
    this.hideOverlays(); this.setInGame(true);
    this.toast(`Tiếp tục vô tận · ${this.game.placeName()} — từ đợt ${r.wave + 1}`, '#F2D27A');
  }

  // ---------- v72: Bảng xếp hạng (vô tận + từng ải)
  // v146: biệt danh người chơi tự đặt (hoặc tên tài khoản Google) — rỗng nếu chưa có; không bao giờ lấy từ email
  nickName() {
    const u = typeof CLOUD !== 'undefined' && CLOUD.user;
    return this.save.nick || (u && !u.isAnonymous && u.displayName) || '';
  }
  playerName() {
    const u = typeof CLOUD !== 'undefined' && CLOUD.user;
    if (this.save.nick) return this.save.nick;
    if (u && !u.isAnonymous && u.displayName) return u.displayName;
    return 'Khách ' + (u ? u.uid.slice(0, 4).toUpperCase() : '');
  }
  submitScores() {
    if (typeof CLOUD === 'undefined' || !CLOUD.ready) return;
    const g = this.game, name = this.playerName();
    if (!g.endless || g.co) return;
    // vô tận: điểm = đợt đã vượt; hoà thì ai còn nhiều mạng hơn
    const wave = Math.max(0, g.wave - 1);
    CLOUD.submitScore('endless', wave * 100 + Math.max(0, g.lives), { name, detail: `Đợt ${wave} · ${g.placeName()}${g.hard ? ' · Khó' : ''}` });
  }
  // v189 (L12): không có mạng → hình minh hoạ + nút Thử lại + kỷ lục của chính mình lưu trên máy (thay cho một dòng chữ trên nền đen)
  rankEmpty(msg, retry) {
    const best = this.save.bestEndless || {};
    const mine = LEVELS.map((lv, i) => [lv.name, best[i] || 0]).filter((x) => x[1] > 0).sort((a, b) => b[1] - a[1]);
    return `<div class="rk-empty"><div class="rk-ill">${UIE.medal(3)}</div><b>${msg}</b>
      <small>Kỷ lục bên dưới lưu ngay trên máy này, có mạng sẽ tự lên bảng chung.</small>
      ${retry ? `<button class="btn btn-gold" data-act="rank-tab" data-k="${this.ranksBoard}">${UIE.redo()} Thử lại</button>` : ''}
      <div class="rk-list rk-mine"><div class="rk-mh">Kỷ lục của bạn</div>${mine.length ? mine.map(([n, w]) => `<div class="rk-row inset me"><span class="rk-n">${UIE.endless()}</span><b class="rk-name">${esc(n)}</b><span class="rk-d">Đợt ${w}</span></div>`).join('')
        : '<div class="note" style="text-align:center">Chưa có kỷ lục. Chơi <b>Vô tận</b> ở bản đồ bất kỳ!</div>'}</div></div>`;
  }
  async showRanks(board) {
    this.ranksBoard = board;
    const opts = [['endless', '♾ Vô tận']];
    const head = `<div class="scr-head metal"><button class="xbtn metal" data-act="ro-back" aria-label="Quay lại">${ICON.back}</button><h1 class="ttl">Bảng xếp hạng</h1>
      <div class="cp-tabs">${opts.map(([k, n]) => `<button class="cp-tab ${k === board ? 'on' : ''}" data-act="rank-tab" data-k="${k}">${n}</button>`).join('')}</div><div class="sp"></div>
      <button class="btn metal" style="height:34px;padding:0 10px;font-size:13px;flex:none" data-act="rank-nick">✎ ${esc(this.playerName())}</button></div>`;
    const ok = typeof CLOUD !== 'undefined' && CLOUD.enabled;
    $('#ranks').innerHTML = `<div class="screen" style="z-index:auto">${head}<div class="rk-body">${ok ? '<div class="note" style="text-align:center;padding:20px">Đang tải…</div>' : this.rankEmpty('Bảng xếp hạng cần kết nối mạng.', false)}</div></div>`;
    $('#ranks').hidden = false;
    if (!ok) return;
    for (let i = 0; i < 20 && !CLOUD.ready && CLOUD.status !== 'error'; i++) await new Promise((r) => setTimeout(r, 300));
    const rows = await CLOUD.topScores(board, 50);
    if (this.ranksBoard !== board || $('#ranks').hidden) return;
    const me = CLOUD.user && CLOUD.user.uid;
    const medal = (i) => (i < 3 ? UIE.medal(i) : i + 1);
    const body = !rows ? this.rankEmpty(`Không tải được bảng xếp hạng (${esc(CLOUD.error || 'mất mạng')}).`, true)
      : !rows.length ? `<div class="note" style="text-align:center;padding:20px">Chưa có ai ghi tên. Chơi <b>Vô tận</b> ở bản đồ bất kỳ để lên bảng!</div>`
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
    else if (signed) inner = `<div class="login-who">${u.photoURL ? `<img src="${esc(u.photoURL)}" alt="" referrerpolicy="no-referrer">` : ''}<b>${esc(this.playerName())}</b><small>${esc(u.email || '')}</small></div>
        <div class="login-rename"><input id="lg-nick" class="login-in" maxlength="20" placeholder="Đặt biệt danh" value="${esc(this.nickName())}"><button class="btn metal" data-act="login-rename">Đổi tên</button></div>
        ${err}
        <button class="btn btn-gold title login-btn" data-act="login-close">Vào game</button>
        ${this.outArm ? `<div class="login-out">${this.outConfirm()}</div>` : '<button class="btn metal login-btn" data-act="cloud-out">Đăng xuất</button>'}`;
    else if (C.status === 'error' && !C.auth) inner = `<div class="login-sub">Không kết nối được máy chủ đăng nhập (${esc(C.error)}).</div>
        <button class="btn btn-gold title login-btn" data-act="login-retry">Thử lại</button>
        <button class="btn metal login-btn" data-act="login-offline">Chơi ngoại tuyến (không lưu xếp hạng)</button>`;
    else if (!C.authKnown) {
      // v189 (L11): bắt buộc đăng nhập (như v73) nhưng không để kẹt: kiểm tra quá 12 giây thì báo lỗi + Thử lại
      inner = this.loginSlow ? '<div class="login-err">Kết nối máy chủ đăng nhập quá lâu. Kiểm tra mạng rồi thử lại.</div><button class="btn btn-gold title login-btn" data-act="login-retry">' + UIE.redo() + ' Thử lại</button>'
        : '<div class="login-sub">Đang kiểm tra đăng nhập…</div>';
      if (!this.loginSlowT) this.loginSlowT = setTimeout(() => { this.loginSlowT = 0; if (!C.authKnown && !$('#login').hidden) { this.loginSlow = true; this.showLogin(this.loginFromMenu); } }, 12000);
    }
    else inner = `<div class="login-sub">${u && u.isAnonymous ? 'Đăng nhập để giữ tiến trình đang chơi và vào bảng xếp hạng' : 'Đăng nhập để chơi'}</div>
        ${C.native ? '' : `<button class="btn login-btn login-g" data-act="cloud-google"><span class="g">G</span> Đăng nhập bằng Google</button><div class="login-or">hoặc dùng email</div>`}
        <div class="login-tabs"><button class="${mode === 'in' ? 'on' : ''}" data-act="login-mode" data-k="in">Đăng nhập</button><button class="${mode === 'up' ? 'on' : ''}" data-act="login-mode" data-k="up">Tạo tài khoản</button></div>
        ${mode === 'up' ? '<input id="lg-name" class="login-in" maxlength="20" placeholder="Tên hiển thị" autocomplete="nickname">' : ''}
        <input id="lg-email" class="login-in" type="email" placeholder="Email" autocomplete="email" value="${esc(this.loginEmail || '')}">
        <input id="lg-pass" class="login-in" type="password" placeholder="Mật khẩu (ít nhất 6 ký tự)" autocomplete="${mode === 'up' ? 'new-password' : 'current-password'}">
        ${err}
        <button class="btn btn-gold title login-btn" data-act="login-email" ${this.loginBusy ? 'disabled' : ''}>${this.loginBusy ? 'Đang xử lý…' : mode === 'up' ? 'Tạo tài khoản' : 'Đăng nhập'}</button>
        ${mode === 'in' ? '<button class="login-link" data-act="login-reset">Quên mật khẩu?</button>' : ''}`;
    $('#login').innerHTML = `<div class="bgart"><img src="${assetSrc('ui/nen-menu.jpg')}" alt="" style="object-fit:cover" onerror="this.outerHTML=''"></div><div class="login-box metal">
      <div class="login-logo">Thần Thoại Việt</div>${inner}
      ${fromMenu && signed ? '<button class="xbtn metal login-x" data-act="login-close" aria-label="Đóng">' + ICON.close + '</button>' : ''}</div>`;
    $('#login').hidden = false;
  }


  // v99: chọn chế độ từ ngoài. v166: bỏ Phó bản — còn Vô tận (chơi đơn; claude/duong-di-moi: không chọn bản đồ, đổi màn sau mỗi boss) và Cùng Giữ Thành (chơi nhóm, cũng vô tận)
  showModes() {
    this.hideOverlays();
    this.setInGame(false);
    const s = this.save;
    const best = Math.max(0, ...Object.values(s.bestEndless || {}));
    $('#modes').innerHTML = `<div class="screen" style="z-index:auto">
      <div class="scr-head metal"><button class="xbtn metal" data-act="mode-close" aria-label="Quay lại">${ICON.back}</button><h1 class="ttl">Chọn chế độ</h1><div class="sp"></div></div>
      <div class="md-body">
        <button class="md-card metal endl" data-act="mode-pick" data-k="endless" style="background-image:linear-gradient(90deg,#0A1A24f0 35%,#0A1A2455),url('${assetSrc('maps/nen-bien.jpg')}')"><span class="md-ic"><img src="${assetSrc('ui/ui-tran-1-3.png')}" alt="♾"></span><b>Vô Tận</b>
          <small>Giữ thành mãi mãi qua ${LEVELS.length} vùng đất truyền thuyết: sau mỗi boss sang vùng đất mới (bản đồ, đường đi, quân giặc khác). Quái mạnh dần, mỗi mốc đợt và mỗi boss hạ được nhận Ngân khố. Đua bảng xếp hạng.</small>
          <span class="md-st">Kỷ lục: đợt ${best}</span></button>
        <button class="md-card metal coop ${COOP.visible ? '' : 'soon'}" ${COOP.visible ? 'data-act="mode-pick" data-k="coop"' : 'disabled aria-disabled="true"'} style="background-image:linear-gradient(90deg,#14240Ef0 35%,#14240E55),url('${assetSrc('maps/nen-thanh.jpg')}')"><span class="md-ic">🤝</span><b>Cùng Giữ Thành</b>
          <small>Vô tận cho 2 người: chung bản đồ, chung mạng, mỗi người giữ một nửa số ô và ví vàng riêng. Tạo phòng lấy mã 6 ký tự, bạn bè nhập mã để vào.</small>
          ${COOP.visible ? `<span class="md-st">${COOP.saved() ? `Đang có phòng ${COOP.saved()}` : 'Cần đăng nhập'}</span>` : '<span class="md-soon">Sắp ra mắt</span>'}</button>
      </div></div>`;
    $('#modes').hidden = false;
  }
  // ============================================================
  //  v141: CHƠI NHÓM "CÙNG GIỮ THÀNH" — phòng chờ, vào trận, thanh đồng đội
  // ============================================================
  // thao tác lên trận: chơi đơn gọi thẳng; chơi nhóm gửi lệnh (then chạy khi lệnh thực thi ở bước hẹn)
  cmd(name, args = [], then) {
    if (COOP.on) return COOP.issue(name, args, then);
    const r = this.game[name](...args);
    if (then) then(r);
    return r;
  }
  coopMember() {
    const s = this.save;
    return { name: this.playerName(), meta: { owned: [...(s.owned || [])], runes: s.heroRunes || {}, legacy: s.legacy || {} } };
  }
  showCoop() {
    this.hideOverlays();
    this.setInGame(false);
    $('#coop').hidden = false;
    this.renderCoop();
  }
  coopLobbyWatch(code) {
    if (this.lobby && this.lobby.unsub) this.lobby.unsub();
    this.lobby = { code, room: null, unsub: null };
    this.lobby.unsub = COOP.watchLobby(code, (r) => {
      if (!this.lobby || this.lobby.code !== code) return;
      if (!r) { this.lobbyClose(); this.toast('Phòng đã đóng', '#E25A3A'); if (!$('#coop').hidden) this.renderCoop(); return; }
      this.lobby.room = { ...r, code };
      if (r.state === 'play' && !COOP.on && r.members.length === 2) return this.coopBegin(this.lobby.room);
      if (!$('#coop').hidden) this.renderCoop();
    });
  }
  lobbyClose() { if (this.lobby && this.lobby.unsub) this.lobby.unsub(); this.lobby = null; }
  renderCoop() {
    const L = this.lobby, r = L && L.room, me = COOP.getNet() && COOP.net.uid;
    const head = `<div class="scr-head metal"><button class="xbtn metal" data-act="coop-back" aria-label="Quay lại">${ICON.back}</button><h1 class="ttl">Cùng Giữ Thành</h1><span class="chip dark">Chơi nhóm 2 người</span><div class="sp"></div></div>`;
    let body;
    if (!COOP.available()) {
      body = `<div class="co-box metal"><b>Cần đăng nhập để chơi nhóm</b><p>Chơi nhóm truyền tin qua máy chủ (Firebase). Hãy đăng nhập (Google, email hoặc tài khoản khách) rồi quay lại.</p>
        <button class="btn btn-gold" data-act="coop-login">Đăng nhập</button></div>`;
    } else if (this.coopBusy) {
      body = `<div class="co-box metal"><b>${esc(this.coopBusy)}</b><p>Đợi một chút…</p></div>`;
    } else if (!L) {
      const saved = COOP.saved();
      body = `<div class="co-box metal">
        <div class="co-how"><b>Cách chơi</b><p>Chung bản đồ, chung <b>mạng thành</b>, chung đợt quái. Mỗi người giữ <b>một nửa số ô</b> (ô viền <span class="co-mate">xanh</span> là của đồng đội) và có <b>ví vàng riêng</b>: vàng hạ quái, xong đợt, sính lễ chia đôi; bán đồ / gọi sớm thì về người bấm. Gửi vàng cho đồng đội ở thanh trên. Không tạm dừng được.</p></div>
        <div class="co-row"><button class="btn btn-gold title" data-act="coop-create">＋ Tạo phòng</button></div>
        <div class="co-row"><input id="co-code" class="login-in co-code" maxlength="6" placeholder="Mã phòng" autocapitalize="characters" autocomplete="off" value="${esc(this.coopCode || '')}"><button class="btn metal title" data-act="coop-join">Vào phòng</button></div>
        ${saved ? `<div class="co-row"><button class="btn metal" data-act="coop-rejoin">${UIE.redo()} Vào lại phòng ${esc(saved)}</button></div>` : ''}
        ${this.coopErr ? `<div class="login-err">${esc(this.coopErr)}${this.coopRetry ? ` <button class="btn metal co-retry" data-act="coop-retry">${UIE.redo()} Thử lại</button>` : ''}</div>` : ''}</div>`;
    } else {
      const host = r && r.host === me, members = r ? r.members : [];
      const lv = r ? r.level || 0 : 0;
      const pl = [0, 1].map((k) => { const u = members[k];
        return `<div class="co-pl metal ${u ? '' : 'empty'}"><span class="co-dot" style="background:${k ? '#5AB4D6' : '#F2D27A'}"></span><b>${u ? esc((r.names || {})[u] || 'Người chơi') : 'Đang chờ…'}</b><small>${!u ? 'Gửi mã phòng cho bạn' : u === r.host ? 'Chủ phòng' : 'Khách'}${u === me ? ' · bạn' : ''}</small></div>`; }).join('');
      const lvList = host ? `<div class="co-lv">${CHAPTERS.map((c) => LEVELS.slice(c.from, c.to + 1).map((l, k) => { const i = c.from + k;
          return `<button class="${i === lv ? 'btn-gold' : 'metal'}" data-act="coop-lv" data-i="${i}" title="${esc(c.name)}">${esc(l.name)}</button>`; }).join('')).join('')}</div>`
        : `<div class="note">Chủ phòng chọn bản đồ: <b>${esc(LEVELS[lv].name)}</b> · ${esc(chapterOf(lv).name)}</div>`;
      body = `<div class="co-box metal wide">
        <div class="co-code-big">Mã phòng <b>${esc(L.code)}</b></div>
        <div class="co-pls">${pl}</div>
        <div class="hint-h">BẢN ĐỒ VÔ TẬN (CHỦ PHÒNG CHỌN)</div>${lvList}
        <div class="co-row">${host ? `<button class="btn btn-gold title" data-act="coop-start" ${members.length === 2 ? '' : 'disabled'}>${UIE.battle()} Bắt đầu</button>` : '<span class="note">Chờ chủ phòng bấm Bắt đầu…</span>'}
          <button class="btn metal" data-act="coop-leave">Rời phòng</button></div>
        ${this.coopErr ? `<div class="login-err">${esc(this.coopErr)}${this.coopRetry ? ` <button class="btn metal co-retry" data-act="coop-retry">${UIE.redo()} Thử lại</button>` : ''}</div>` : ''}</div>`;
    }
    $('#coop').innerHTML = `<div class="screen" style="z-index:auto">${head}<div class="co-body">${body}</div></div>`;
  }
  async coopAct(d) {
    const g = this.game;
    this.coopErr = '';
    if (d.act === 'coop-retry') { const last = this.coopRetry; this.coopRetry = null; if (last) return this.coopAct(last); return; }
    const busy = async (msg, fn) => {
      this.coopBusy = msg; this.renderCoop();
      this.coopRetry = null;
      try { await fn(); } catch (e) { this.coopErr = e.message || String(e); this.coopRetry = { ...d }; } finally { this.coopBusy = ''; if (!$('#coop').hidden) this.renderCoop(); }
    };
    switch (d.act) {
      case 'coop-back': this.showMenu(); break;
      case 'coop-login': this.showLogin(true); break;
      case 'coop-create':
        await busy('Đang tạo phòng', async () => { const code = await COOP.createRoom(this.coopMember()); this.coopLobbyWatch(code); });
        break;
      case 'coop-join': {
        const code = (($('#co-code') || {}).value || '').trim().toUpperCase();
        this.coopCode = code;
        await busy('Đang vào phòng', async () => { const c = await COOP.joinRoom(code, this.coopMember()); this.coopLobbyWatch(c); });
        break;
      }
      case 'coop-rejoin': {
        const code = COOP.saved();
        await busy('Đang vào lại phòng', async () => {
          const net = COOP.getNet();
          const r = await net.getRoom(code).catch(() => null);
          if (!r) { COOP.forget(); throw new Error('Phòng không còn'); }
          if (r.state === 'lobby') return this.coopLobbyWatch(code);
          if (r.state !== 'play') { COOP.forget(); throw new Error('Trận nhóm đã kết thúc'); }
          if (COOP.on) return this.coopEnter(false);
          await COOP.rejoin(g, this, code);
          this.coopBusy = 'Đang tải trận từ đồng đội';
        });
        if (COOP.on && COOP.waitSnap) { this.coopBusy = 'Đang tải trận từ đồng đội (đồng đội cần đang chơi)'; this.renderCoop(); }
        break;
      }
      case 'coop-leave': {
        const L = this.lobby, host = L && L.room && L.room.host === COOP.net.uid;
        this.lobbyClose();
        await busy('Đang rời phòng', () => COOP.leaveRoom(L && L.code, host));
        break;
      }
      case 'coop-lv': if (this.lobby) COOP.net.updateRoom(this.lobby.code, { level: +d.i }).catch((e) => { this.coopErr = e.message; this.renderCoop(); }); break;
      case 'coop-start': {
        const L = this.lobby;
        if (!L || !L.room || L.room.members.length < 2) break;
        if (g.started && !g.over && !g.won && !COOP.on) { this.bankStats(); this.saveRun(); }   // trận đơn dở: lưu lại để Tiếp tục sau
        await busy('Đang bắt đầu', () => COOP.startRoom(L.code, L.room.level || 0));
        break;
      }
      case 'coop-gift': {
        const v = +d.v, co = g.co;
        if (!COOP.on || !co) break;
        if (co.alone >= 0) { this.toast('Đồng đội đã rời trận', '#E25A3A'); break; }
        if (g.gold < v) { this.toast(`Cần ${v} vàng`, '#E25A3A'); break; }
        COOP.issue('gift', [v], (r) => { if (r !== true) this.toast(r, '#E25A3A'); });
        break;
      }
    }
  }
  coopBegin(room) {
    this.lobbyClose();
    if (this.game.started && !this.game.over && !this.game.won && !this.game.co) { this.bankStats(); this.saveRun(); }
    COOP.begin(this.game, this, room);
    this.coopEnter(false);
  }
  coopEnter(rejoin) {
    const g = this.game;
    this.coopBusy = '';
    this.clearSel();
    this.screen = null;
    $('#screen').hidden = true;
    this.hideOverlays();
    this.setInGame(true);
    this.sig = {};
    this.coopDone = false;
    const co = g.co, mate = co.names[1 - COOP.me];
    this.toast(rejoin ? `Đã vào lại trận cùng ${esc(mate)}` : `Cùng giữ thành với <b>${esc(mate)}</b> · Vô tận · ${LEVELS[g.level].name}. Ô viền xanh là của đồng đội.`, '#9dffc4');
  }
  // mỗi lệnh thực thi xong (cả hai máy): báo cho người chơi biết việc của đồng đội
  coopExec(c, r, mine) {
    const g = this.game, co = g.co;
    if (!co) return;
    const mate = esc(co.names[1 - COOP.me]);
    if (c.n === 'start' && r === true && !this.coopSaid) {
      this.coopSaid = true;
      const op = chapterOf(g.level).opener || ['sontinh', 'Nước dâng bao nhiêu, núi cao bấy nhiêu! Các tướng Văn Lang, giữ lấy Phong Châu!'];
      this.say(op[0], op[1]);
    } else if (c.n === 'gift' && r === true) {
      this.toast(mine ? `Đã gửi ${fmt(c.a[0])} vàng cho ${mate}` : `${mate} gửi bạn ${fmt(c.a[0])} vàng`, '#F2D27A');
    } else if (c.n === 'reward') {
      if (r === true) {
        $('#reward').hidden = true;
        const o = co.reward && co.reward.options[c.a[0]];
        if (!mine && o) this.toast(`${mate} đã chọn sính lễ: ${esc(o.title)}`, '#C8A0F0');
        if (mine && o) this.rewardToast(o);
      } else if (mine) this.toast(r, '#E25A3A');
    } else if (c.n === 'speed' && !mine) this.toast(`${mate} đổi tốc độ x${co.speed}`, '#C8BFA8');
    else if (c.n === 'back') this.toast('Hai người lại cùng giữ thành: vàng chia đôi lại', '#9dffc4');
  }
  // ---------- v153: TRÒ CHUYỆN trong trận nhóm (không đi qua lockstep, không tạm dừng trận)
  chatToggle(open) {
    this.chatOpen = open === undefined ? !this.chatOpen : !!open;
    const el = $('#chat');
    if (this.chatOpen && !el.firstChild) {
      el.innerHTML = `<div class="ch-head"><b>💬 Trò chuyện</b><small id="chat-mate"></small><button class="ch-x" data-act="chat-close" aria-label="Đóng">✕</button></div>
        <div class="ch-in"><input id="chat-in" maxlength="${COOP_CHAT.max}" placeholder="Nhắn đồng đội… (Enter để gửi)" autocomplete="off" enterkeyhint="send"><button class="btn btn-gold" data-act="chat-send">Gửi</button></div>
        <div class="ch-quick">${COOP_CHAT.quick.map((q, i) => `<button class="metal" data-act="chat-quick" data-i="${i}">${esc(q)}</button>`).join('')}</div>
        <div class="ch-list" id="chat-list"></div>`;
    }
    el.hidden = !this.chatOpen;
    if (this.chatOpen) { this.chatUnread = 0; $('#chat-bubbles').innerHTML = ''; this.chatRender(0); }
    else { const i = $('#chat-in'); if (i) i.blur(); }
    $('#chat-dot').hidden = !this.chatUnread;
  }
  chatRender(fresh) {
    if (!this.chatOpen) {
      this.chatUnread = (this.chatUnread || 0) + (fresh || 0);
      $('#chat-dot').hidden = !this.chatUnread;
      return;
    }
    const list = $('#chat-list');
    if (!list) return;
    const co = this.game.co, me = COOP.uid;
    const mate = $('#chat-mate'); if (mate && co) mate.textContent = 'với ' + co.names[1 - COOP.me];
    const t2 = (ms) => new Date(ms).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    list.innerHTML = COOP.chatList.map((m) => `<div class="ch-msg ${m.by === me ? 'me' : ''}"><small>${m.by === me ? 'Bạn' : esc(m.name || 'Đồng đội')} · ${t2(m.at)}</small><span>${esc(m.text)}</span></div>`).join('')
      || '<div class="note">Chưa có tin nào. Chạm câu nhanh ở trên hoặc gõ tin nhắn.</div>';
    list.scrollTop = list.scrollHeight;
  }
  // tin của đồng đội khi khung chat đóng: bong bóng nổi 4 giây ở góc + chấm chưa đọc
  chatIncoming(m) {
    if (this.chatOpen) return;
    const box = $('#chat-bubbles');
    const el = document.createElement('div');
    el.className = 'ch-bub';
    el.innerHTML = `<b>${esc(m.name || 'Đồng đội')}</b>${esc(m.text)}`;
    box.appendChild(el);
    while (box.children.length > 3) box.firstChild.remove();
    setTimeout(() => el.remove(), 4000);
  }
  async chatAct(d) {
    if (d.act === 'chat-close') return this.chatToggle(false);
    let text = '';
    if (d.act === 'chat-quick') text = COOP_CHAT.quick[+d.i] || '';
    else if (d.act === 'chat-send') { const i = $('#chat-in'); text = i ? i.value : ''; if (!text.trim()) return; }
    const r = await COOP.say(text, this.playerName());
    if (r !== true) return this.toast(r, '#E25A3A');
    if (d.act === 'chat-send') { const i = $('#chat-in'); if (i) i.value = ''; }
  }
  // thông báo chơi nhóm (đồng đội rời / vào lại, đồng bộ lại…): hiện toast và giữ 20 dòng gần nhất (xem lại / kiểm thử)
  coopNote(msg) {
    this.coopLog = (this.coopLog || []).concat([{ at: Date.now(), msg }]).slice(-20);
    this.toast(esc(msg), '#5AB4D6');
  }
  updateCoopBar() {
    const g = this.game, co = g.co, bar = $('#coop-bar');
    $('#btn-chat').hidden = !COOP.on;
    if (!COOP.on || !co) {
      bar.hidden = true;
      if (this.chatOpen) this.chatToggle(false);
      this.chatUnread = 0; $('#chat-dot').hidden = true;
      return;
    }
    bar.hidden = false;
    const mate = co.names[1 - COOP.me], mg = co.pl[1 - COOP.me].gold;
    const st = COOP.waitSnap ? 'đang đồng bộ…' : co.alone === COOP.me ? 'đã rời · bạn giữ cả hai nửa' : co.alone >= 0 ? 'đang giữ cả hai nửa' : COOP.isAuth() ? '' : COOP.bound - COOP.tick > 3 * COOP.delayTicks() ? 'mạng chậm' : '';
    const key = [mate, Math.floor(mg), st, co.alone].join('|');
    if (this.sig.coop === key) return;
    this.sig.coop = key;
    bar.innerHTML = `<span class="co-dot" style="background:#5AB4D6"></span><b>${esc(mate)}</b><span class="cg">${coin(1)} ${fmt(mg)}</span>${st ? `<small>${esc(st)}</small>` : ''}
      ${co.alone < 0 ? '<button class="metal" data-act="coop-gift" data-v="50">Gửi 50</button><button class="metal" data-act="coop-gift" data-v="200">Gửi 200</button>' : ''}`;
  }
  // v166: màn chọn bản đồ VÔ TẬN (thay bản đồ chiến dịch): đủ 17 bản đồ chia theo chương truyền thuyết, mở hết
  showCampaign(sel) {
    this.cpSel = Math.max(0, Math.min(LEVELS.length - 1, sel ?? this.save.last ?? 0));
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
    const rec = s.bestEndless || {};
    // chương Sơn Tinh dùng bản đồ sông Đà vẽ sẵn; chương khác: các bản đồ rải chéo trên nền truyện
    const NODES = ch.classic ? [[60, 330], [140, 286], [225, 246], [292, 182], [367, 200], [432, 140], [506, 102], [608, 62]]
      : Array.from({ length: n }, (_, k) => [110 + k * (420 / Math.max(1, n - 1)), k % 2 ? 150 : 270]);
    const bosses = [...new Set(Object.values(lv.bosses))].map((b) => ENEMIES[b].name).join(', ');
    const diff = ['Dễ', 'Vừa', 'Khó', 'Rất khó'][i < 3 ? 0 : i < 8 ? 1 : i < 13 ? 2 : 3];
    $('#campaign').innerHTML = `<div class="screen" style="z-index:auto">
      <div class="scr-head metal"><button class="xbtn metal" data-act="cp-back" aria-label="Quay lại">${ICON.back}</button>
        <h1 class="ttl">${UIE.endless()} Vô Tận</h1>
        <div class="cp-tabs">${CHAPTERS.map((c, ci) => `<button class="cp-tab ${c === ch ? 'on' : ''}" data-act="cp-ch" data-i="${ci}">${c.name}</button>`).join('')}</div>
        <div class="sp"></div></div>
      <div class="cp-body">
        <div class="cp-map"><div class="bgart">${ch.classic ? svgI(sceneArt('campaign')) : svgI(storyScene({ bg: ch.bg }))}${hasAsset(`scenes/chuong-${ch.id}.png`) ? `<img class="cp-bgimg" src="${assetSrc(`scenes/chuong-${ch.id}.png`)}" alt="" onerror="this.remove()">` : ''}</div>
          ${ch.classic ? '' : `<svg class="cp-trail" viewBox="0 0 640 382" preserveAspectRatio="none"><polyline points="${NODES.map(([x, y]) => `${x},${y}`).join(' ')}" fill="none" stroke="#F2D27A" stroke-width="4" stroke-dasharray="10 8" opacity="0.8"/></svg>`}
          ${NODES.map(([x, y], kk) => { const k = ch.from + kk;
            return `<button class="cp-node ${k === i ? 'sel' : ''} ${x > 560 ? 'edge-r' : x < 80 ? 'edge-l' : ''}" style="left:${x / 640 * 100}%;top:${y / 382 * 100}%" data-act="cp-sel" data-i="${k}">
              <span class="stars">${rec[k] ? `♾ ${rec[k]}` : ''}</span>
              <span class="c">${kk + 1}</span>
              <span class="lb">${LEVELS[k].name}</span></button>`;
          }).join('')}
        </div>
        <div class="cp-side">
          <div class="cp-scroll"><div class="hd"><span class="no">${UIE.endless()}</span><span class="ttl">${lv.name}</span><span class="op">${diff}</span></div>
          <div class="sub">${esc(ch.chip || ch.name)}</div>
          <div class="desc">${lv.desc}</div>
          <div class="sub">Quân <b>${esc(ROSTER_NAMES[lv.roster || 'thuy'] || '')}</b> · boss <b>${bosses}</b></div>
          <div class="desc">Quái mạnh dần mãi, boss mỗi 10 đợt. Sau đợt ${lv.waves}, cứ 10 đợt đổi sang quân truyền thuyết khác. Mỗi 10 đợt và mỗi boss hạ được nhận Ngân khố ngay. Hết mạng là kết thúc, ghi điểm bảng xếp hạng.</div>
          <div class="cp-rec">${UIE.endless()} Kỷ lục bản đồ này: <b>đợt ${rec[i] || 0}</b></div>
          ${this.counterHtml(i)}</div>
          <div class="cp-act"><div class="cp-diff"><button class="${this.save.settings.hard ? 'metal' : 'btn-gold'}" data-act="diff" data-k="0">Thường</button><button class="${this.save.settings.hard ? 'on' : 'metal'}" data-act="diff" data-k="1" title="Máu quái ×${HARD.hp(i).toFixed(2)} · Ngân khố ×1,5">🔥 Khó <small>×${HARD.hp(i).toFixed(2).replace('.', ',')}</small></button></div>
          <button class="go btn-gold" data-act="cp-go">${UIE.endless()} Vào vô tận</button></div>
        </div>
      </div></div>`;
  }

  // ---------- Cài đặt / tạm dừng
  showSettings(inGame) {
    const g = this.game;
    this.pauseWasRunning = inGame && g.running;
    if (inGame && !COOP.on) g.running = false;
    $('#settings').hidden = false;
    this.settingsInGame = inGame;
    this.renderSettings();
  }
  renderSettings() {
    const st = this.save.settings;
    const inGame = this.settingsInGame;
    const tg = (k, name, desc) => `<div class="tg metal"><div><b>${name}</b><small>${desc}</small></div><button class="sw ${st[k] ? 'on' : ''}" style="margin-left:auto" data-act="set" data-k="${k}" aria-label="${name}"></button></div>`;
    $('#settings').innerHTML = `<div class="screen" style="z-index:auto">
      <div class="scr-head metal"><h1 class="ttl">${inGame ? 'Tạm dừng' : 'Cài đặt'}</h1>${inGame ? `<span class="chip dark">${UIE.endless()} ${this.game.placeName()} · Đợt ${this.game.wave}</span>` : ''}<div class="sp"></div>
        <button class="xbtn metal" data-act="set-close" aria-label="Đóng">${ICON.close}</button></div>
      <div class="set-list">
        ${inGame ? `<div style="display:flex;gap:10px">
          <button class="btn btn-gold" style="flex:1.3;height:48px;font-family:var(--title);font-size:18px" data-act="set-close">▶ Tiếp tục</button>
          ${COOP.on ? '<span class="note" style="flex:2;align-self:center">Chơi nhóm: trận vẫn chạy khi mở bảng này</span>' : `<button class="btn metal title" style="flex:1;height:48px;font-size:16px" data-act="restart">Chơi lại</button>`}
          <button class="btn metal title" style="flex:1;height:48px;font-size:16px" data-act="to-menu">Menu chính</button></div>` : ''}
        ${tg('dmgText', 'Hiện số sát thương', 'Số bay lên khi tướng đánh trúng quái')}
        ${tg('shake', 'Rung màn hình', 'Rung khi boss quẫy đuôi và khi tung chiêu tối thượng')}
        ${tg('aiArt', 'Dùng ảnh AI (thử nghiệm)', 'Tải lại trang để áp dụng')}
        ${tg('vectorHeroes', 'Tướng vẽ nét (thấy từng món đồ)', 'Hiện riêng mũ / giáp / vũ khí')}
        <div class="tg metal"><div><b>Cỡ chữ & nút</b><small>Tự động: điện thoại to thêm 20%</small></div>
          <div style="margin-left:auto;display:flex;gap:4px">${[['auto', 'Tự động'], ['s', 'Vừa'], ['m', 'To'], ['l', 'Rất to']].map(([k, n]) => `<button class="btn ${(st.uiSize || 'auto') === k ? 'btn-gold' : 'metal'}" style="height:34px;padding:0 10px;font-size:13px" data-act="set-uisize" data-k="${k}">${n}</button>`).join('')}</div></div>
        <div class="tg metal"><div><b>Đồ hoạ</b><small>Tự động giảm hiệu ứng khi máy giật${typeof GFX !== 'undefined' && GFX.mode() === 'auto' && GFX.lv ? ` (đang giảm ${GFX.lv} bậc)` : ''}</small></div>
          <div style="margin-left:auto;display:flex;gap:4px">${[['auto', 'Tự động'], ['high', 'Đẹp'], ['low', 'Tiết kiệm']].map(([k, n]) => `<button class="btn ${(st.gfx || 'auto') === k ? 'btn-gold' : 'metal'}" style="height:34px;padding:0 10px;font-size:13px" data-act="set-gfx" data-k="${k}">${n}</button>`).join('')}</div></div>
        ${this.cloudRow()}
        ${inGame || typeof PXGOI === 'undefined' ? '' : this.pxGoiRow()}
        <div class="tg metal"><div><b>Góp ý</b></div>
          <div style="margin-left:auto;display:flex;gap:4px;flex:none">${this.fbaBtn()}<button class="btn metal" data-act="set-feedback">✉ Góp ý</button></div></div>
        <div class="tg metal"><div><b>Xoá kỷ lục</b><small>Xoá kỷ lục đợt vô tận của mọi bản đồ trên máy này</small></div>
          <button class="btn metal" style="margin-left:auto;color:#FFB08A;border-color:#C8401E" data-act="wipe">${this.wipeArmed ? 'Bấm lần nữa để xoá' : 'Xoá'}</button></div>
        <div class="note" style="text-align:center">Thần Thoại Việt · Phiên bản 224</div>
      </div></div>`;
  }

  // claude/tool-pixel: gói pixel tự vẽ (tools/ve-pixel.html → goi-pixel.zip) — gọn một dòng trong Cài đặt (ngoài trận)
  pxGoiRow() {
    const on = pixelOn(), has = !!PXGOI.goi, bt = 'style="height:34px;padding:0 10px;font-size:13px"';
    return `<div class="tg metal" id="pxgoi-row"><div><b>Gói pixel (thử)</b><small id="pxgoi-st">${PXGOI.status()}</small></div>
          <div style="margin-left:auto;display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end">
          <button class="btn ${on ? 'btn-gold' : 'metal'}" ${bt} data-act="pxg-bat" title="Tải lại trang để áp dụng">${on ? 'Pixel: Bật' : 'Pixel: Tắt'}</button>
          <button class="btn metal" ${bt} data-act="pxg-nap">Nạp gói (.zip)</button>
          ${has ? `<button class="btn metal" ${bt} data-act="pxg-go">Gỡ gói</button>` : ''}</div></div>`;
  }
  async pxGoiAct(act) {
    if (act === 'pxg-bat') { PXGOI.setPixel(!pixelOn()); location.reload(); return; }
    if (act === 'pxg-go') {
      try { await PXGOI.remove(); this.toast('Đã gỡ gói pixel — dùng lại hình sẵn có'); } catch (e) { this.toast('Không gỡ được: ' + e.message, '#FF8A6A'); }
      this.renderSettings(); return;
    }
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = '.zip,application/zip'; inp.id = 'pxgoi-file'; inp.hidden = true;
    document.body.appendChild(inp);
    inp.onchange = async () => {
      const f = inp.files[0]; inp.remove();
      if (!f) return;
      try {
        const r = await PXGOI.install(f);
        this.toast(`Đã nạp ${r.n} mã pixel${r.canhBao.length ? ` (bỏ ${r.canhBao.length} mã lỗi)` : ''}${pixelOn() ? '' : ' — bật Pixel để thấy'}`, '#8CE07A');
      } catch (e) { this.toast('Gói không hợp lệ: ' + e.message, '#FF8A6A'); }
      if (!$('#settings').hidden) this.renderSettings();
    };
    inp.click();
  }

  // ---------- thông báo
  toast(msg, color = '#F2D27A') {
    const box = $('#toasts');
    const el = document.createElement('div');
    el.className = 'toast';
    el.style.borderLeftColor = color;
    el.innerHTML = msg;
    el.born = performance.now();
    box.appendChild(el);
    // v189: trong lớp phủ / màn hình chỉ giữ thông báo mới nhất (không chồng 2 cái lên nội dung)
    const ovNow = !!this.toastView && !this.toastView.startsWith('|');
    while (box.children.length > (ovNow ? 1 : 2)) box.firstChild.remove();
    setTimeout(() => el.remove(), 2600);
    this.placeToasts();
  }
  // v189 (L05): thông báo không sống qua chuyển màn (đổi màn/lớp phủ thì xoá thông báo cũ, giữ cái vừa tạo cùng lúc mở màn),
  // không đè nội dung: đang mở lớp phủ / màn hình → hiện ở đáy giữa; trong trận → né thành (đích của quái) và bảng boss
  watchToasts() {
    const ids = ['#screen', '#legends', '#reward', '#menu', '#campaign', '#modes', '#coop', '#settings', '#roster', '#runes', '#treasury', '#prep', '#login', '#ranks', '#result', '#feedback', '#fbadmin'];
    const view = () => ids.filter((id) => !$(id).hidden).join() + '|' + (this.screen ? this.screen.kind : '');
    this.toastView = view();
    this.checkToasts = () => {
      const v = view();
      if (v === this.toastView) return;
      this.toastView = v;
      const now = performance.now();
      for (const t of [...$('#toasts').children]) if (now - (t.born || 0) > 250) t.remove();
      this.placeToasts();
    };
    // đổi lựa chọn trong lớp phủ (bấm tướng khác, tab khác…) thì thông báo của lựa chọn trước tắt luôn
    $('#ui').addEventListener('pointerdown', (ev) => {
      if (!this.toastView || this.toastView.startsWith('|') || ev.target.closest('#toasts')) return;
      const now = performance.now();
      for (const t of [...$('#toasts').children]) if (now - (t.born || 0) > 300) t.remove();
    }, true);
    const mo = new MutationObserver(this.checkToasts);
    for (const id of ids) mo.observe($(id), { attributes: true, attributeFilter: ['hidden'] });
  }
  placeToasts() {
    // lúc khởi động (main.js chưa chạy, chưa có UIW/UIH/PATH…) thì để vị trí mặc định
    try { this.placeToasts0(); } catch (e) { /* bỏ qua */ }
  }
  placeToasts0() {
    const box = $('#toasts');
    const ov = !!this.toastView && !this.toastView.startsWith('|');
    let right = '', top0 = '';
    if (!ov && this.game && this.game.started && typeof PATH !== 'undefined' && PATH.total && box.children.length) {
      // khung thiết kế UIW × UIH. Vật cản: thành (cuối đường quái), hội thoại boss, khung bộ quái mới, bảng boss, banner,
      // thanh chợ, cột nút phải. Thử vài chỗ đặt cột thông báo, chọn chỗ đè ít nhất (ưu tiên chỗ cũ: góc phải dưới thanh trên)
      const hz = typeof HZ !== 'undefined' ? HZ : 1, w = 250 * hz, h = Math.max(40 * hz, box.offsetHeight * hz), G = 56;
      const p = PATH.at(PATH.total), gx = (p.x + MAPX) / DK, gy = (p.y + MAPY) / DK;
      // cầm dọc cả game xoay 90° theo chiều kim đồng hồ (#wrap.rot): trục x giao diện → trục y màn hình, trục y → ngược trục x
      // (trước đây đổi toạ độ như màn ngang nên toast không né được banner / bảng, đè lên chữ)
      const rot = typeof ROT !== 'undefined' && ROT;
      const ur = $('#ui').getBoundingClientRect(), k = (rot ? ur.width : ur.height) / UIH || 1;
      const R = [[gx - G, gy - G, gx + G, gy + G]];
      for (const id of ['#dialogue', '#roster-hint', '#bossbar', '#banner', '#deck', '#auto-btns', '#topbar']) {
        const el = $(id);
        if (el.hidden || !el.offsetParent) continue;
        const d = el.getBoundingClientRect();
        if (!d.width) continue;
        R.push(rot ? [(d.top - ur.top) / k, (ur.right - d.right) / k, (d.bottom - ur.top) / k, (ur.right - d.left) / k]
          : [(d.left - ur.left) / k, (d.top - ur.top) / k, (d.right - ur.left) / k, (d.bottom - ur.top) / k]);
      }
      const area = (x0, y0) => R.reduce((s2, [l, t, r, b]) => s2 + Math.max(0, Math.min(r, x0 + w) - Math.max(l, x0)) * Math.max(0, Math.min(b, y0 + h) - Math.max(t, y0)), 0)
        + Math.max(0, y0 + h - UIH) * w;
      const tops = [104 * hz, ...R.map((r) => r[3] + 6).filter((y) => y > 104 * hz && y < UIH * 0.6)];
      const rights = [8, UIW - (gx - G) + 4].filter((r) => UIW - r - w >= 8);
      let best = null;
      for (const rr of rights) for (const tt of tops) {
        const sc = area(UIW - rr - w, tt) + (rr === 8 ? 0 : 1) + (tt - 104 * hz) * 0.5;   // hoà thì giữ chỗ quen
        if (!best || sc < best.sc) best = { sc, rr, tt };
      }
      if (best) {
        if (best.rr !== 8) right = `${Math.round(best.rr)}px`;
        if (best.tt !== 104 * hz) top0 = `${Math.round(best.tt)}px`;
      }
    }
    let left = '', width = '';
    if (ov && box.children.length) {
      // lớp phủ / màn hình: thử đáy giữa, dưới tiêu đề, đáy trái, đáy phải — chọn chỗ đè ít nút / ô nhập nhất
      const ur = $('#ui').getBoundingClientRect(), k = ur.height / UIH || 1;
      let w = Math.min(440, UIW - 24), h = Math.max(30, box.offsetHeight);
      const R = [];
      for (const e of $('#ui').querySelectorAll('button, input, textarea, select, .btn, [data-act], [data-tip], .chip, h1, .ttl')) {
        if (e.closest('[hidden]') || e.closest('#toasts')) continue;
        const d = e.getBoundingClientRect();
        if (d.width > 1 && d.height > 1) R.push([(d.left - ur.left) / k, (d.top - ur.top) / k, (d.right - ur.left) / k, (d.bottom - ur.top) / k]);
      }
      const area = (x0, y0) => R.reduce((a, [l, t, r, b]) => a + Math.max(0, Math.min(r, x0 + w) - Math.max(l, x0)) * Math.max(0, Math.min(b, y0 + h) - Math.max(t, y0)), 0);
      const C = [[(UIW - w) / 2, UIH - 10 - h], [(UIW - w) / 2, 52], [12, UIH - 10 - h], [UIW - 12 - w, UIH - 10 - h]];
      let best = null;
      C.forEach(([x0, y0], i) => { const sc = area(x0, y0) + i; if (!best || sc < best.sc) best = { sc, x0, y0, w }; });
      // ưu tiên chỗ trống trên thanh tiêu đề (giữa tên màn và các nút bên phải) nếu thông báo vừa 1–2 dòng
      const w0 = w, h0 = h;
      for (const ww of [380, 330, 290, 250]) {
        w = Math.min(ww, UIW - 24);
        box.style.width = `${w}px`; h = Math.max(24, box.offsetHeight); box.style.width = '';
        if (h <= 42) for (let x0 = 12; x0 + w <= UIW - 12; x0 += 10) { const sc = area(x0, 2) * 2 + Math.abs(x0 + w / 2 - UIW / 2) * 0.01 + (380 - ww) * 0.01; if (sc < best.sc) best = { sc, x0, y0: 2, w }; }
      }
      w = w0; h = h0;
      left = `${Math.round(best.x0)}px`; top0 = `${Math.round(best.y0)}px`; width = best.w === w ? '' : `${Math.round(best.w)}px`;
    }
    box.classList.toggle('ov', ov);
    if (box.style.right !== right) box.style.right = right;
    if (box.style.top !== top0) box.style.top = top0;
    if (box.style.left !== left) box.style.left = left;
    if (box.style.width !== width) box.style.width = width;
  }

  // ---------- v149: Góp ý — chọn loại, nội dung, ảnh chụp trận (tuỳ chọn), liên hệ (tuỳ chọn)
  // Gửi lên Firestore 'feedback' (CLOUD.sendFeedback); chưa có mạng / Firebase tắt / gửi lỗi → hàng đợi trong localStorage.
  fbStore() {
    let s; try { s = JSON.parse(localStorage.getItem(FB_KEY)); } catch (e) { s = null; }
    s = s && typeof s === 'object' ? s : {};
    if (!Array.isArray(s.queue)) s.queue = [];
    const day = new Date().toDateString();
    if (s.day !== day) { s.day = day; s.n = 0; }
    return s;
  }
  fbWrite(s) {
    // bộ nhớ trình duyệt đầy (ảnh chụp ~150KB mỗi cái) → bỏ ảnh của góp ý cũ trước, rồi mới bỏ góp ý cũ
    for (let i = 0; i <= s.queue.length + 1; i++) {
      try { localStorage.setItem(FB_KEY, JSON.stringify(s)); return true; } catch (e) {
        const w = s.queue.find((q) => q.shot);
        if (w) w.shot = ''; else s.queue.shift();
      }
    }
    return false;
  }
  fbVer() {
    const sc = document.querySelector('script[src*="js/ui.js"]');
    const m = sc && sc.getAttribute('src').match(/v=(\d+)/);
    return m ? 'v' + m[1] : '?';
  }
  fbUa() {
    const u = navigator.userAgent || '';
    const os = (u.match(/Android [\d.]+|iPhone OS [\d_]+|iPad; CPU OS [\d_]+|Windows NT [\d.]+|Mac OS X [\d_]+|CrOS|Linux/) || ['?'])[0].replace(/_/g, '.');
    const br = (u.match(/(Edg|OPR|SamsungBrowser|Firefox|CriOS|Chrome|Version)\/[\d]+/) || ['?'])[0].replace('Version', 'Safari');
    const app = typeof CLOUD !== 'undefined' && CLOUD.native ? ' · app' : / wv\)/.test(u) ? ' · webview' : '';
    return (os + ' · ' + br + app).slice(0, 160);
  }
  fbWhere(from) {
    const g = this.game;
    const name = { menu: 'Menu', 'cai-dat': 'Cài đặt', 'tam-dung': 'Tạm dừng', tran: 'Trong trận' }[from] || from;
    if (!this.fbInRun()) return name;
    const lv = LEVELS[g.level];
    return `${name} · ${g.co ? 'Chơi nhóm' : 'Vô tận'}${lv ? ' · ' + lv.name : ''} · Đợt ${g.wave}${g.over ? ' · đã kết thúc' : ''}`.slice(0, 120);
  }
  fbInRun() { return !!(this.game.started && $('#menu').hidden); }
  // chụp màn hình trận: thu nhỏ ≤ 640px rộng, JPEG ~0.6, hạ chất lượng tới khi ≤ 150KB
  fbShot() {
    try {
      const c = $('#game');
      if (!c || !c.width || !c.height) return '';
      const w = Math.min(640, c.width), h = Math.max(1, Math.round(c.height * w / c.width));
      const t = document.createElement('canvas'); t.width = w; t.height = h;
      t.getContext('2d').drawImage(c, 0, 0, w, h);
      for (let q = 0.6; q > 0.15; q -= 0.1) { const u = t.toDataURL('image/jpeg', q); if (u.startsWith('data:image/jpeg') && u.length <= FB_SHOT) return u; }
    } catch (e) { /* canvas bị khoá (ảnh khác nguồn) → không đính kèm */ }
    return '';
  }
  showFeedback(from) {
    const g = this.game;
    const shot = this.fbInRun() ? this.fbShot() : '';   // chụp trước khi bảng che màn hình
    this.fbResume = g.started && g.running;
    if (this.fbResume) g.running = false;               // dừng trận trong lúc gõ góp ý
    $('#drawer').hidden = true;
    this.fb = { from, kind: (this.fb && this.fb.kind) || 'bug', text: (this.fb && this.fb.text) || '', contact: (this.fb && this.fb.contact) || '',
      shot, useShot: !!shot, err: '', busy: false };
    $('#feedback').hidden = false;
    this.renderFeedback();
    this.fbFlush();
  }
  fbRead() {
    const t = $('#fb-text'), c = $('#fb-contact');
    if (t) this.fb.text = t.value.slice(0, FB_MAX);
    if (c) this.fb.contact = c.value.slice(0, 120);
  }
  renderFeedback() {
    const f = this.fb, st = this.fbStore();
    const off = typeof CLOUD === 'undefined' || !CLOUD.ready;
    $('#feedback').innerHTML = `<div class="fb-box metal" role="dialog" aria-label="Góp ý">
      <div class="fb-head"><b class="ttl">✉ Góp ý</b>
        <button class="xbtn metal" data-act="fb-close" aria-label="Đóng">${ICON.close}</button></div>
      <div class="fb-kinds">${FB_KINDS.map(([k, n]) => `<button class="btn ${f.kind === k ? 'btn-gold' : 'metal'}" data-act="fb-kind" data-k="${k}" aria-pressed="${f.kind === k}">${n}</button>`).join('')}</div>
      <div class="fb-tw"><textarea id="fb-text" maxlength="${FB_MAX}" placeholder="${f.kind === 'bug' ? 'Lỗi gì, xảy ra lúc nào, làm sao để gặp lại…' : f.kind === 'balance' ? 'Tướng / quái / ải nào quá mạnh hay quá yếu…' : 'Bạn muốn góp ý điều gì…'}">${esc(f.text)}</textarea><span id="fb-count"></span></div>
      <div class="fb-row">
        <input id="fb-contact" class="login-in" maxlength="120" placeholder="Liên hệ (không bắt buộc): Zalo, Facebook…" value="${esc(f.contact)}" autocomplete="off">
        ${f.shot ? `<button class="fb-shot ${f.useShot ? 'on' : ''}" data-act="fb-shot" aria-pressed="${f.useShot}"><img src="${f.shot}" alt="Ảnh chụp trận"><span class="sw ${f.useShot ? 'on' : ''}"></span><small>${f.useShot ? 'Kèm ảnh trận' : 'Không kèm ảnh'}</small></button>` : ''}
      </div>
      ${f.err ? `<div class="login-err" id="fb-err">${esc(f.err)}</div>` : ''}
      <div class="fb-foot"><small class="fb-note">Tự gửi kèm: phiên bản ${esc(this.fbVer())}, màn đang mở, cỡ màn hình, loại máy. Không gửi email tài khoản.${off ? ' <b>Đang ngoại tuyến: góp ý được lưu lại, tự gửi khi có mạng.</b>' : ''}${st.queue.length ? ` · ${st.queue.length} góp ý đang chờ gửi` : ''}</small>
        <button class="btn metal" data-act="fb-close">Huỷ</button>
        <button class="btn btn-gold title" data-act="fb-send" ${f.busy ? 'disabled' : ''}>${f.busy ? 'Đang gửi…' : 'Gửi'}</button></div>
    </div>`;
    const t = $('#fb-text');
    const count = () => { const n = t.value.trim().length; const el = $('#fb-count'); el.textContent = `${t.value.length}/${FB_MAX}`; el.classList.toggle('low', n < FB_MIN); };
    t.addEventListener('input', () => { this.fb.text = t.value; count(); });
    $('#fb-contact').addEventListener('input', (e) => { this.fb.contact = e.target.value; });
    count();
  }
  fbClose() {
    if (this.fb) this.fbRead();
    $('#feedback').hidden = true;
    if (this.fbResume && this.game.started && !this.game.over && $('#settings').hidden) this.game.running = true;
    this.fbResume = false;
  }
  fbErr(m) { this.fb.err = m; this.renderFeedback(); }
  async fbSend() {
    const f = this.fb;
    if (!f || f.busy) return;
    this.fbRead();
    const text = f.text.trim();
    if (text.length < FB_MIN) return this.fbErr(`Viết thêm chút nữa (ít nhất ${FB_MIN} ký tự)`);
    const st = this.fbStore(), now = Date.now();
    if (now - (st.last || 0) < FB_GAP) return this.fbErr(`Vừa gửi xong — đợi ${Math.ceil((FB_GAP - (now - st.last)) / 1000)} giây rồi gửi tiếp nhé`);
    if ((st.n || 0) >= FB_DAY) return this.fbErr(`Hôm nay đã gửi ${FB_DAY} góp ý, mai gửi tiếp nhé. Cảm ơn bạn!`);
    const item = { kind: f.kind, text: text.slice(0, FB_MAX), contact: f.contact.trim().slice(0, 120), shot: f.useShot && f.shot.length <= FB_SHOT ? f.shot : '',
      ver: this.fbVer(), where: this.fbWhere(f.from), scr: `${innerWidth}x${innerHeight}@${(devicePixelRatio || 1).toFixed(1)}${$('#wrap').classList.contains('rot') ? ' doc' : ''}`.slice(0, 40),
      ua: this.fbUa(), at: now };
    st.last = now; st.n = (st.n || 0) + 1;
    this.fbWrite(st);
    f.busy = true; f.err = ''; this.renderFeedback();
    const sent = await this.fbTry(item);
    if (!sent) { const s2 = this.fbStore(); s2.queue.push(item); while (s2.queue.length > FB_QUEUE) s2.queue.shift(); this.fbWrite(s2); }
    this.fb = null;
    this.fbThanks(sent);   // v164: bảng cảm ơn (trận vẫn tạm dừng tới khi bấm Đóng)
    if (sent) this.fbFlush();
  }
  // v164: bảng cảm ơn sau khi gửi — không tự đóng; Đóng / Esc → fbClose() (trận đang chạy thì chạy tiếp như trước)
  fbThanks(sent) {
    const drum = `<svg class="fb-ty-ic" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#5A3A14" stroke="#F2D27A" stroke-width="2"/>
      <circle cx="32" cy="32" r="22" fill="none" stroke="#D9B25A" stroke-width="1.5"/><circle cx="32" cy="32" r="15" fill="none" stroke="#B8852A" stroke-width="1.2" stroke-dasharray="2 2"/>
      <path d="${Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6, b = a + Math.PI / 12; return `M32 32L${(32 + 10 * Math.cos(a - Math.PI / 12)).toFixed(1)} ${(32 + 10 * Math.sin(a - Math.PI / 12)).toFixed(1)}L${(32 + 4 * Math.cos(b)).toFixed(1)} ${(32 + 4 * Math.sin(b)).toFixed(1)}Z`; }).join('')}" fill="#FFE29A"/>
      <circle cx="32" cy="32" r="3" fill="#FFF1C4"/></svg>`;
    $('#feedback').innerHTML = `<div class="fb-box fb-thanks metal" role="dialog" aria-label="Cảm ơn góp ý">
      ${hasAsset('ui/ui-tran-3-1.png') ? `<img class="fb-ty-ic" src="${assetSrc('ui/ui-tran-3-1.png')}" alt="">` : drum}<b class="ttl">Cảm ơn góp ý của bạn!</b>
      <p>Đội ngũ Thần Thoại Việt sẽ đọc và hoàn thiện game để mang lại trải nghiệm tốt hơn.</p>
      <small class="fb-ty-st ${sent ? 'ok' : 'off'}">${sent ? '✓ Góp ý đã được gửi tới đội làm game' : 'Đang không có mạng — góp ý đã được lưu và sẽ tự gửi khi có mạng'}</small>
      <button class="btn btn-gold title" data-act="fb-close">Đóng</button></div>`;
    $('#feedback').hidden = false;
    const b = $('#feedback [data-act=fb-close]'); if (b) b.focus();
  }
  // gửi 1 góp ý; quá 12 giây chưa xong thì coi như chưa gửi (nếu sau đó gửi được thì tự gỡ khỏi hàng đợi)
  fbTry(item) {
    if (typeof CLOUD === 'undefined' || !CLOUD.ready || !CLOUD.sendFeedback || navigator.onLine === false) return Promise.resolve(false);
    let p;
    try { p = CLOUD.sendFeedback(item); } catch (e) { return Promise.resolve(false); }
    p.then(() => this.fbDrop(item.at), () => {});
    return Promise.race([p.then(() => true, () => false), new Promise((r) => setTimeout(() => r(false), 12000))]);
  }
  fbDrop(at) { const s = this.fbStore(); const n = s.queue.length; s.queue = s.queue.filter((q) => q.at !== at); if (s.queue.length !== n) this.fbWrite(s); }
  async fbFlush() {
    if (this.fbFlushing) return;
    const q = this.fbStore().queue;
    if (!q.length || typeof CLOUD === 'undefined' || !CLOUD.ready) return;
    this.fbFlushing = true;
    let n = 0;
    try {
      for (const item of q) { if (await this.fbTry(item)) { this.fbDrop(item.at); n++; } else break; }
    } finally { this.fbFlushing = false; }
    if (n) this.toast(`Đã gửi ${n} góp ý đang chờ. Cảm ơn bạn! 💌`, '#6AE06A');
  }

  // ---------- v163: "Góp ý nhận được" — chỉ hiện với tài khoản quản trị (CLOUD.isAdmin(): đăng nhập, email trong ADMIN_EMAILS, đã xác minh).
  // Ẩn nút chỉ là giao diện; luật Firestore isAdmin() mới chặn thật. Lọc loại / trạng thái làm trên máy (không cần chỉ mục ghép).
  fbaIsAdmin() { return typeof CLOUD !== 'undefined' && !!CLOUD.isAdmin && CLOUD.isAdmin(); }
  fbaBtn() {
    if (typeof CLOUD !== 'undefined' && CLOUD.adminUnverified && CLOUD.adminUnverified())
      return '<button class="btn metal" data-act="fba-verify" title="Email quản trị chưa xác minh">📥 Xác minh email</button>';
    if (!this.fbaIsAdmin()) return '';
    const n = this.fbaNew || 0;
    return `<button class="btn metal fba-open" data-act="fba-open">📥 Góp ý nhận được${n ? `<span class="fba-dot">${n > 49 ? '50+' : n}</span>` : ''}</button>`;
  }
  // đổi tài khoản / vừa đăng nhập: đếm góp ý "Mới" (50 mục gần nhất) làm chấm báo trên nút Cài Đặt + nút trong Cài đặt
  fbaCheck() {
    const uid = this.fbaIsAdmin() && CLOUD.ready ? CLOUD.user.uid : '';
    if (uid === this.fbaUid) return;
    this.fbaUid = uid; this.fbaNew = 0; this.fbaDot();
    if (!uid) { this.fba = null; if (!$('#fbadmin').hidden) $('#fbadmin').hidden = true; return; }
    CLOUD.listFeedback({ limit: 50 }).then((r) => { if (this.fbaUid !== uid) return; this.fbaNew = r.items.filter((f) => (f.status || 'new') === 'new').length; this.fbaDot(); }, () => {});
  }
  fbaDot() {
    const b = $('#btn-settings');
    if (b) b.classList.toggle('fba-has', !!(this.fbaIsAdmin() && this.fbaNew));
    if (!$('#settings').hidden) this.renderSettings();
  }
  // ảnh do người chơi gửi: chỉ nhận đúng dạng JPEG base64 (chuỗi lạ có thể chèn thuộc tính HTML vào <img>)
  fbaShotOk(u) { return typeof u === 'string' && /^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(u); }
  fbaTime(at) {
    try { return new Date(at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }); } catch (e) { return String(at); }
  }
  async showFbAdmin() {
    if (!this.fbaIsAdmin()) return;
    this.fba = { items: [], cursor: null, more: true, kind: 'all', st: 'all', err: '', busy: false, big: '', note: '', del: '' };
    $('#fbadmin').hidden = false;
    this.renderFbAdmin();
    await this.fbaLoad();
  }
  async fbaLoad() {
    const a = this.fba;
    if (!a || a.busy || !a.more) return;
    a.busy = true; a.err = ''; this.renderFbAdmin();
    try {
      const r = await CLOUD.listFeedback({ limit: FBA_PAGE, after: a.cursor });
      if (this.fba !== a) return;
      const have = new Set(a.items.map((f) => f.id));
      a.items.push(...r.items.filter((f) => !have.has(f.id)));
      a.cursor = r.cursor || a.cursor; a.more = r.more;
    } catch (e) { if (this.fba === a) a.err = e.message; }
    a.busy = false;
    if (this.fba === a) { this.fbaCount(); this.renderFbAdmin(); }
  }
  // số góp ý "Mới" cho chấm báo: tải hết danh sách thì đếm chính xác, chưa hết thì không thấp hơn số đã đếm lúc đầu
  fbaCount(delta) {
    const a = this.fba;
    if (delta) this.fbaNew = Math.max(0, (this.fbaNew || 0) + delta);
    else if (a) { const k = a.items.filter((f) => (f.status || 'new') === 'new').length; this.fbaNew = a.more ? Math.max(this.fbaNew || 0, k) : k; }
    this.fbaDot();
  }
  renderFbAdmin() {
    const a = this.fba;
    if (!a) return;
    const box = $('#fbadmin .fba-list');
    const scroll = box ? box.scrollTop : 0;
    const stOf = (f) => f.status || 'new';
    const n = (fn) => a.items.filter(fn).length;
    const kinds = [['all', 'Tất cả'], ...Object.entries(FBA_KIND).map(([k, v]) => [k, v[0]])];
    const sts = [['all', 'Mọi trạng thái'], ...FBA_ST];
    const list = a.items.filter((f) => (a.kind === 'all' || f.kind === a.kind) && (a.st === 'all' || stOf(f) === a.st));
    const card = (f) => {
      const [kn, kc] = FBA_KIND[f.kind] || FBA_KIND.other;
      const st = stOf(f);
      const meta = [f.ver, f.where, f.scr, f.ua].filter(Boolean).map(esc).join(' · ');
      return `<div class="fba-item inset st-${st}" data-id="${esc(f.id)}">
        <div class="fba-top"><span class="fba-kind" style="--kc:${kc}">${kn}</span><span class="fba-time">${esc(this.fbaTime(f.at))}</span>
          <span class="fba-who">${f.guest ? 'Khách' : 'Đã đăng nhập'}</span>
          <div class="fba-st">${FBA_ST.map(([k, l]) => `<button class="${st === k ? 'on' : ''}" data-act="fba-st" data-id="${esc(f.id)}" data-k="${k}" aria-pressed="${st === k}">${l}</button>`).join('')}</div></div>
        <div class="fba-mid">
          <div class="fba-txt">${esc(f.text || '')}${f.contact ? `<div class="fba-contact">Liên hệ: <b>${esc(f.contact)}</b></div>` : ''}</div>
          ${this.fbaShotOk(f.shot) ? `<button class="fba-thumb" data-act="fba-big" data-id="${esc(f.id)}" aria-label="Xem ảnh to"><img src="${f.shot}" alt="Ảnh chụp" loading="lazy"></button>` : ''}
        </div>
        <div class="fba-meta">${meta}</div>
        ${a.note === f.id ? `<div class="fba-note-ed"><input id="fba-note-in" maxlength="300" placeholder="Ghi chú (chỉ quản trị thấy)" value="${esc(f.note || '')}" autocomplete="off"><button class="btn btn-gold" data-act="fba-note-ok" data-id="${esc(f.id)}">Lưu</button><button class="btn metal" data-act="fba-note-x">Huỷ</button></div>`
          : `<div class="fba-act">${f.note ? `<span class="fba-note">📝 ${esc(f.note)}</span>` : '<span class="fba-note"></span>'}
          <button class="btn metal" data-act="fba-note" data-id="${esc(f.id)}">✎ Ghi chú</button>
          ${a.del === f.id ? `<span class="fba-ask">Xoá hẳn góp ý này?</span><button class="btn metal fba-danger" data-act="fba-del-ok" data-id="${esc(f.id)}">Xoá</button><button class="btn metal" data-act="fba-del-x">Không</button>`
            : `<button class="btn metal fba-danger" data-act="fba-del" data-id="${esc(f.id)}">🗑 Xoá</button>`}</div>`}
      </div>`;
    };
    const big = a.big && a.items.find((f) => f.id === a.big && this.fbaShotOk(f.shot));
    const empty = a.busy && !a.items.length ? 'Đang tải…' : a.err && !a.items.length ? '' : !a.items.length ? 'Chưa có góp ý nào.' : !list.length ? `Không có góp ý khớp bộ lọc${a.more ? ' trong số đã tải — bấm Tải thêm' : ''}.` : '';
    $('#fbadmin').innerHTML = `<div class="screen" style="z-index:auto">
      <div class="scr-head metal"><button class="xbtn metal" data-act="fba-close" aria-label="Quay lại">${ICON.back}</button><h1 class="ttl">📥 Góp ý nhận được</h1>
        <span class="chip dark">${a.items.length}${a.more ? '+' : ''} góp ý · ${this.fbaNew || 0} mới</span><div class="sp"></div>
        <button class="btn metal" style="height:34px;padding:0 10px;font-size:13px;flex:none" data-act="fba-reload" ${a.busy ? 'disabled' : ''}>${UIE.redo()} Tải lại</button></div>
      <div class="fba-filters">
        <label class="fba-sel"><span>Loại</span>${a.kind === 'all' ? '' : `<i class="fba-sw" style="--kc:${FBA_KIND[a.kind][1]}"></i>`}<select id="fba-kind" aria-label="Lọc theo loại">${kinds.map(([k, l]) => `<option value="${k}" ${a.kind === k ? 'selected' : ''}>${k === 'all' ? '' : '● '}${l} (${k === 'all' ? a.items.length : n((f) => f.kind === k)})</option>`).join('')}</select></label>
        <label class="fba-sel"><span>Trạng thái</span><select id="fba-stf" aria-label="Lọc theo trạng thái">${sts.map(([k, l]) => `<option value="${k}" ${a.st === k ? 'selected' : ''}>${l} (${k === 'all' ? a.items.length : n((f) => stOf(f) === k)})</option>`).join('')}</select></label>
        ${a.kind !== 'all' || a.st !== 'all' ? `<button class="btn metal fba-clear" data-act="fba-clear">✕ Bỏ lọc</button>` : ''}
        <span class="fba-shown">Đang hiện ${list.length}/${a.items.length}${a.more ? '+' : ''}</span>
      </div>
      <div class="fba-list">
        ${a.err ? `<div class="login-err fba-err">${esc(a.err)}</div>` : ''}
        ${empty ? `<div class="note" style="text-align:center;padding:16px">${empty}</div>` : ''}
        ${list.map(card).join('')}
        ${a.more && a.items.length ? `<button class="btn metal fba-more" data-act="fba-more" ${a.busy ? 'disabled' : ''}>${a.busy ? 'Đang tải…' : 'Tải thêm'}</button>` : ''}
      </div>
      ${big ? `<div class="fba-big" data-act="fba-big-x"><img src="${big.shot}" alt="Ảnh chụp trận"><small>Chạm để đóng</small></div>` : ''}
    </div>`;
    const nb = $('#fbadmin .fba-list');
    if (nb) nb.scrollTop = scroll;
    const ni = $('#fba-note-in');
    if (ni) { ni.focus(); ni.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); this.fbaAct({ act: 'fba-note-ok', id: a.note }); } }); }
  }
  fbaKey() {
    const a = this.fba;
    if (a && (a.big || a.del || a.note)) { a.big = a.del = a.note = ''; this.renderFbAdmin(); return; }
    this.fbaAct({ act: 'fba-close' });
  }
  async fbaAct(d) {
    const a = this.fba;
    if (!a) return;
    const f = d.id && a.items.find((x) => x.id === d.id);
    switch (d.act) {
      case 'fba-close': $('#fbadmin').hidden = true; this.fba = null; if (!$('#settings').hidden) this.renderSettings(); break;
      case 'fba-reload': this.fba = null; this.showFbAdmin(); break;
      case 'fba-more': this.fbaLoad(); break;
      case 'fba-kind': a.kind = d.k; this.renderFbAdmin(); break;
      case 'fba-stf': a.st = d.k; this.renderFbAdmin(); break;
      case 'fba-clear': a.kind = a.st = 'all'; this.renderFbAdmin(); break;
      case 'fba-big': a.big = d.id; this.renderFbAdmin(); break;
      case 'fba-big-x': a.big = ''; this.renderFbAdmin(); break;
      case 'fba-note': a.note = d.id; a.del = ''; this.renderFbAdmin(); break;
      case 'fba-note-x': a.note = ''; this.renderFbAdmin(); break;
      case 'fba-del': a.del = d.id; a.note = ''; this.renderFbAdmin(); break;
      case 'fba-del-x': a.del = ''; this.renderFbAdmin(); break;
      case 'fba-st': case 'fba-note-ok': {
        if (!f) break;
        const status = d.act === 'fba-st' ? d.k : (f.status || 'new');
        const note = d.act === 'fba-note-ok' ? (($('#fba-note-in') || {}).value || '').trim().slice(0, 300) : undefined;
        const was = (f.status || 'new') === 'new';
        try {
          await CLOUD.setFeedbackStatus(f.id, status, note);
          f.status = status; if (note !== undefined) f.note = note;
          a.note = ''; a.err = '';
          this.fbaCount((status === 'new') - was);
        } catch (e) { a.err = e.message; this.toast(esc(e.message), '#FF7A5C'); }
        this.renderFbAdmin(); break;
      }
      case 'fba-del-ok': {
        if (!f) break;
        try {
          await CLOUD.deleteFeedback(f.id); a.items = a.items.filter((x) => x !== f); a.del = ''; a.err = ''; this.toast('Đã xoá góp ý', '#C8BFA8');
          if ((f.status || 'new') === 'new') this.fbaCount(-1);
        } catch (e) { a.err = e.message; this.toast(esc(e.message), '#FF7A5C'); }
        this.renderFbAdmin(); break;
      }
    }
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
    this.sel = -1; this.spot = -1; this.armed = null; this.raising = false; this.moving = -1;
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
        this.cmd('raiseSpot', [slot], (r) => {
          if (r !== true) this.toast(r, '#E25A3A');
          else this.toast('Mọc Núi! Ô này khô ráo vĩnh viễn', '#F2D27A');
        });
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
      return;
    }
    if (this.armed) return this.place(this.armed, slot);
    this.spot = -1;
    this.sel = -1;
  }

  // ---------- v34: triệu hồi ngẫu nhiên · ghép · hợp thể
  // v143: chợ tướng — mua thẻ i (slot: ô thả khi kéo thẻ; bỏ trống = tự chọn ô trống)
  buyCard(i, slot) {
    const g = this.game;
    if (!g.started || g.over) return;
    const t = g.market && g.market.types[i], nd = t && g.marketNeeds(), to = nd && nd.hopLock.get(t);
    this.cmd('buyCard', [i, slot == null ? -1 : slot], (r) => {
      this.boughtCard(r);
      // cho-6-the: mua nguyên liệu của công thức có tướng đích chưa mở khoá → nhắc đi mở khoá (mỗi trận 1 lần)
      if (typeof r !== 'string' && to && !g.flags.hopLockTip) { g.flags.hopLockTip = true; setTimeout(() => this.toast(`${UIE.lock()} Hợp thể <b>${esc(HEROES[to].name)}</b> chưa mở khoá — Mở ở <b>Anh Hùng</b> · ${bac(1)}${fmt(OWN_COST[heroTier(to)])} Ngân khố`, '#D8A8FF'), 700); }
    });
  }
  boughtCard(r) {
    const g = this.game;
    this.sig.deck = null;
    if (typeof r === 'string') return this.toast(r, '#E25A3A');
    const h = g.heroes[r];
    if (!h) return;
    this.toast(`Triệu hồi: ${HEROES[h.type].name} ${'★'.repeat(h.tier || 1)}`, '#6AE06A');
    this.spot = -1;
    if (!g.flags.marketTip && (this.save.unlocked || 1) <= 1) { g.flags.marketTip = true; setTimeout(() => this.toast('Mẹo: <b>kéo</b> thẻ tướng thả vào ô muốn đặt · ↻ đổi cả hàng · đầu mỗi đợt chợ tự làm mới', '#F2D27A'), 900); }
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
    const fail = (r) => { if (typeof r === 'string') this.toast(r, '#E25A3A'); };
    if (b) {
      if (g.canMerge(a, b) === true) { this.cmd('merge', [from, to], fail); this.sel = to; return; }
      const f = fusionFor(a.type, b.type);
      if (f) {
        const ok = g.canFuse(a, b);
        if (typeof ok === 'string') return this.toast(`Hợp thể ${HEROES[f.to].name}: ${ok}`, '#E25A3A');
        this.cmd('fuse', [from, to], fail); this.sel = to; return;
      }
      if (a.type === b.type && !a.from) return this.toast(g.canMerge(a, b), '#E25A3A');
    }
    const name = HEROES[a.type].name, bn = b && HEROES[b.type].name;
    this.cmd('moveHero', [from, to], (r) => {
      if (typeof r === 'string') return this.toast(r, '#E25A3A');
      this.toast(bn ? `${name} đổi chỗ với ${bn}` : `${name} chuyển sang ô mới`, '#9dffc4');
    });
    this.sel = to;
  }
  // nút "Ghép" trong menu tướng: tìm 1 tướng cùng loại cùng sao, gộp vào tướng đang chọn
  mergeAny() {
    const g = this.game;
    const h = g.heroes[this.sel];
    if (!h) return;
    const o = g.heroes.find((x) => x && x !== h && g.canMerge(x, h) === true);
    if (!o) return this.toast('Chưa có tướng cùng loại cùng sao để ghép', '#E25A3A');
    this.cmd('merge', [o.slot, h.slot], (r) => { if (typeof r === 'string') this.toast(r, '#E25A3A'); });
    $('#more').hidden = true;
  }
  fuseWith(slot) {
    const g = this.game;
    const h = g.heroes[this.sel];
    if (!h || !g.heroes[slot]) return;
    this.cmd('fuse', [slot, h.slot], (r) => { if (r !== true) this.toast(r, '#E25A3A'); });
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
    this.cmd('placeHero', [slot, type], (r) => { if (r) this.toast(`${HEROES[type].name} đã vào vị trí`, '#6AE06A'); });
    this.spot = -1;
    this.armed = null;
    this.sel = slot;
    $('#legends').hidden = true;
    if (g.heroes.filter(Boolean).length === 2 && !g.flags.dragTip && (this.save.unlocked || 1) <= 1) {
      g.flags.dragTip = true;
      setTimeout(() => this.toast('Mẹo: giữ và kéo tướng sang ô khác để đổi vị trí', '#9dffc4'), 900);
    }
  }

  doLevelUp(h) {
    this.cmd('levelUp', [h], (r) => { if (r !== true) this.toast(r, '#E25A3A'); });
  }

  // ---------- v170: bảng HỢP THỂ trong trận — nhóm theo tướng đích (thẻ), tab Tím / Vàng, lọc, cái gần xong lên đầu
  buildSummon() { this.sig.lg = null; if (!$('#legends').hidden) this.renderLegends(); }

  // trạng thái một công thức trên sân: từng nguyên liệu (tướng tốt nhất cùng loại) đủ điều kiện chưa
  fusionState(f) {
    const g = this.game;
    const mat = (type) => {
      const h = g.heroes.filter((x) => x && x.type === type).sort((x, y) => (y.tier || 0) - (x.tier || 0) || y.level - x.level)[0] || null;
      const need = h ? g.ascendNeed(h) : HEROES[type].legend ? COSTS.ascendTier2 : COSTS.ascendTier;
      const r = h ? g.fusionReady(h) : `chưa có ${HEROES[type].name} trên sân`;
      return { type, h, need, gap: h ? g.skillGap(h) : -1, ok: r === true, why: r === true ? '' : r };
    };
    const m = [mat(f.a), mat(f.b)], own = g.ownsHero(f.to), n = m.filter((x) => x.ok).length;
    const cost = COSTS.ascend[HEROES[f.to].legend];
    return { f, i: FUSION.indexOf(f), m, n, own, cost, ready: own && n === 2, p: g.fusionProgress(f).p, poor: g.gold < cost };
  }

  renderLegends() {
    const g = this.game, el = $('#legends');
    const lg = this.lg || (this.lg = { tab: null, help: false });
    const all = FUSION.map((f) => this.fusionState(f));
    const of = (tab) => all.filter((x) => HEROES[x.f.to].legend === tab);
    if (!lg.tab) lg.tab = !of('epic').some((x) => x.ready) && of('legendary').some((x) => x.ready) ? 'legendary' : 'epic';
    const inTab = of(lg.tab);
    const list = inTab.slice().sort((x, y) => y.own - x.own || y.n - x.n || y.p - x.p || x.i - y.i);
    const why = lg.why && FUSION[lg.why.i] && HEROES[FUSION[lg.why.i].to].legend === lg.tab ? lg.why : null;
    const key = [lg.tab, lg.help, why && why.txt, inTab.some((x) => x.own), assetVersion, ...list.map((x) => `${x.i}:${x.m.map((m) => (m.h ? (m.ok ? 2 : 1) + '.' + m.gap : 0)).join('')}${x.own ? '' : 'L'}${x.ready && x.poor ? 'P' : ''}`)].join('|');
    if (this.sig.lg === key && el.firstElementChild && el.firstElementChild.classList.contains('hx-hd')) return;
    this.sig.lg = key;
    const R = (t) => RARITY[HEROES[t].legend];
    const NEED = lg.tab === 'epic' ? `Tím = 2 tướng Thường ${'★'.repeat(COSTS.ascendTier)} đúng cặp · kỹ năng tối đa` : `Vàng = 2 tướng Tím Thần tinh ${'★'.repeat(COSTS.ascendTier2)} · kỹ năng tối đa`;
    const mat = (m) => `<span class="hx-m ${m.ok ? 'ok' : m.h ? 'part' : 'no'} ${HEROES[m.type].legend || 'common'}" title="${esc(HEROES[m.type].name + (m.ok ? ' ✓' : ' — ' + m.why))}">
        <img src="${heroImgUrl(m.type, 'head')}" alt=""><i>${m.ok ? '✓' : m.h ? `${m.h.tier || 0}/${m.need}★` : ''}</i>${m.h && !m.ok && m.gap ? `<b class="hx-sk" title="Còn thiếu ${m.gap} cấp kỹ năng">${SVG_SK}−${m.gap}</b>` : `<small>${m.ok ? '' : '★'.repeat(m.need)}</small>`}</span>`;
    const card = (x) => { const t = x.f.to, d = HEROES[t];
      const st = !x.own ? `<button class="hx-st lock hx-open" data-act="hx-open" data-t="${t}" title="Chưa mở khoá — mở ở Anh Hùng bằng Ngân khố">${UIE.lock()} Mở ở Anh Hùng · ${bac(1)}${fmt(OWN_COST[heroTier(t)])}</button>`
        : x.ready ? `<button class="hx-go" data-act="hx-fuse" data-i="${x.i}" ${x.poor ? `disabled title="Cần ${x.cost} vàng"` : ''}>Hợp thể · ${coin(1)}${x.cost}</button>`
        : x.m.every((m) => m.h) ? `<button class="hx-go off" data-act="hx-fuse" data-i="${x.i}" aria-disabled="true">${SVG_LOCK} Hợp thể</button>`
        : `<span class="hx-st">${x.n}/2</span>`;
      return `<div class="hx-card ${d.legend} ${x.ready ? 'ready' : ''} ${x.own ? '' : 'lock'} ${why && why.i === x.i ? 'why' : ''}" data-act="hx-card" data-i="${x.i}" role="button" style="--rc:${R(t).color}">
        <span class="hx-to ${d.legend}"><img src="${heroImgUrl(t, 'head')}" alt=""></span>
        <span class="hx-nm"><b>${esc(d.name)}</b><small>${R(t).name}</small></span>
        <span class="hx-mats">${mat(x.m[0])}<em>+</em>${mat(x.m[1])}</span>${st}</div>`; };
    const tab = (k, lab) => { const n = of(k).filter((x) => x.ready).length;
      return `<button class="hx-tab ${k} ${lg.tab === k ? 'on' : ''}" data-act="hx-tab" data-k="${k}" style="--rc:${RARITY[k].color}">${lab}${n ? `<i>${n}</i>` : ''}</button>`; };
    el.innerHTML = `<div class="hx-hd"><span class="ttl">Hợp thể</span>${tab('epic', 'Tím')}${tab('legendary', 'Vàng')}

        <button class="hx-q ${lg.help ? 'on' : ''}" data-act="hx-help" aria-label="Cách hợp thể">?</button><button class="hx-x" data-act="hx-close" aria-label="Đóng">✕</button></div>
      <div class="hx-sub ${why ? 'err' : ''}">${why ? `${SVG_LOCK} <b>${esc(HEROES[FUSION[why.i].to].name)}</b>: ${why.txt}` : !inTab.some((x) => x.own) ? `${SVG_LOCK} Mở khoá 1 tướng ${lg.tab === 'epic' ? 'Tím' : 'Vàng'} ở <b>Anh Hùng</b> (Ngân khố) để hợp thể được trong trận` : lg.help ? 'Kéo 2 tướng nguyên liệu vào nhau, hoặc bấm <b>Hợp thể</b>. Tướng mới giữ cấp, đồ và nội tại của cả hai.' : `${NEED} · chạm thẻ để đánh dấu tướng trên sân`}</div>
      <div class="hx-list">${list.map(card).join('')}</div>`;
  }
  openLegends(on) {
    const el = $('#legends');
    el.hidden = !on;
    if (!on) return;
    $('#drawer').hidden = true; $('#more').hidden = true;
    if (this.lg) { this.lg.tab = null; this.lg.why = null; }     // mở lại: chọn tab có công thức làm được
    this.sig.lg = null;
    this.renderLegends();
    const b = el.querySelector('.hx-list'); if (b) b.scrollTop = 0;
  }

  // ============================================================
  //  CẬP NHẬT MỖI KHUNG HÌNH
  // ============================================================
  tick(dt) {
    const g = this.game;
    this.handleEvents();
    if (this.uiHidden && (!g.started || g.over || this.screen)) this.setUiHidden(false);   // hết trận / mở màn khác: hiện lại giao diện
    this.abT = (this.abT || 0) - dt;
    if (this.abT <= 0 && g.started) { this.abT = 1; this.updateAutoBtns(); }
    if (this.assetSeen !== assetVersion) {
      // có ảnh vẽ tay mới tải xong: vẽ lại các phần dùng ảnh
      this.assetSeen = assetVersion;
      this.applyUiArt();
      this.sig = {};
      this.buildSummon();
      // claude/tool-pixel: đang mở Cài đặt trên menu (vd vừa nạp gói pixel) thì để lúc đóng mới vẽ lại menu — showMenu() đóng mọi lớp phủ
      if (!$('#menu').hidden) { if ($('#settings').hidden) this.showMenu(); else this.menuStale = true; }
      // v155: Kho Báu vẽ một lần — icon PNG tải xong sau thì vẽ lại (giữ chỗ cuộn), không thì kẹt hình vẽ code
      if (!$('#treasury').hidden) { const b = $('#treasury .tr-body'), y = b ? b.scrollTop : 0; this.showTreasury(); const b2 = $('#treasury .tr-body'); if (b2) b2.scrollTop = y; }
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
    const inGame = $('#menu').hidden && $('#campaign').hidden && $('#roster').hidden && $('#runes').hidden && $('#treasury').hidden && $('#modes').hidden;
    if (!inGame) return;
    this.updateTopbar();
    this.updateCoopBar();
    this.updateNextWaves();
    this.updateFuseStrip();
    this.updateBoss();
    this.checkRosterHint();
    this.updateDeck();
    this.updateCoach();
    if (!$('#legends').hidden && (this.lgT = (this.lgT || 0) + 1) % 10 === 0) this.renderLegends();   // v170: 6 lần / giây, chỉ dựng lại khi đổi
    // banner (boss / sự kiện đợt) nằm đúng chỗ nhãn "Đã dừng" → banner đang hiện thì nhường (banner chỉ 2,6 giây)
    $('#paused-tag').hidden = g.running || g.wave === 0 || g.over || !!this.screen || !$('#settings').hidden || !$('#banner').hidden;
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
        const msg = `<b>Quái mới: ${d.name}</b> · ${d.short || d.desc}`, col = d.boss ? '#E25A3A' : '#5AB4D6';
        // v189 (L07): boss — banner + hội thoại + thông báo từng chồng 3 lớp chữ; thông báo đợi banner tắt
        // (sự kiện quái mới đến trước sự kiện boss trong cùng khung hình, nên boss thì luôn chờ hết thời gian banner)
        const wait = d.boss ? 2650 : !$('#banner').hidden ? (this.bannerEnd || 0) - performance.now() + 50 : 0;
        if (wait > 0) setTimeout(() => this.toast(msg, col), wait); else this.toast(msg, col);
      } else if (ev.type === 'kho') {
        // v103: Ngân khố kiếm giữa trận (Vô tận) — cộng thẳng vào tài khoản
        this.save.kho = (this.save.kho || 0) + ev.n; g.khoRun = (g.khoRun || 0) + ev.n; writeSave(this.save);
        this.toast(`Ngân khố ${bac(1)} +${fmt(ev.n)} · ${esc(ev.why)}`, '#E4ECF4');
      } else if (ev.type === 'reward') {
        this.showReward(ev);
      } else if (ev.type === 'waveEvent') {
        this.waveEventMsg(ev);
      } else if (ev.type === 'boss') {
        this.banner(ev.champion ? 'Quái khổng lồ' : 'Boss xuất hiện', ev.name);
        if (ev.enemy) this.say(ev.enemy, BOSS_LINES[ev.enemy]);
      } else if (ev.type === 'flood') {
        this.say('thuytinh', ev.level >= 2 ? 'Nước dâng cao nữa! Xem núi của ngươi cao được bao nhiêu!' : 'Sơn Tinh! Ta dâng nước nhấn chìm Phong Châu!');
      } else if (ev.type === 'secret') {
        this.save.secrets = [...g.known];
        writeSave(this.save);
        this.toast(`<b>Đã khám phá!</b> ${secretTitle(ev.key)}: ${esc(SECRETS[ev.key].desc)}`, '#FFD66B');
      } else if (ev.type === 'ascend') {
        this.banner('Thăng thần', `${ev.from} hóa thân ${ev.to}`);
        this.toast(`<b>${ev.to}</b>: ${esc(HEROES[ev.hero.type].trait.name)} · ${esc(HEROES[ev.hero.type].trait.desc)}`, '#F0A030');
        this.sig.deck = null;
      } else if (ev.type === 'setDone') {
        this.banner(`${HEROES[ev.hero.type].name} mặc đủ bộ`, ev.name);
      } else if (ev.type === 'stage') {
        // vô tận sang màn mới (bản đồ cũ tự mờ dần sang bản đồ mới: main.js cachedBackdrop) — luôn sau khi đóng bảng Sính lễ
        this.stageBanner(ev);
      } else if (ev.type === 'checkpoint') {
        this.saveRun();
      } else if (ev.type === 'victory') {
        this.finishLevel();
      } else if (ev.type === 'defeat') {
        this.finishLevel();
      }
    }
  }

  // vo-tan-su-kien: sự kiện đợt — báo trước (đợt liền trước), mở màn, vượt qua (thưởng)
  waveEventMsg(m) {
    const e = m.ev, icon = ic(e.ic, '', 'ev-ic');
    if (m.phase === 'soon') {
      this.evBanner(e, `Đợt ${e.n} · sự kiện`, e.name, icon, e.color);
      this.toast(`<b>Đợt ${e.n}: ${esc(e.name)}</b> · ${esc(e.desc)} · vượt qua: +${fmt(e.gold)} vàng, +${fmt(e.kho)} Ngân khố`, e.color);
    } else if (m.phase === 'start') {
      this.evBanner(e, `Sự kiện · ${e.lore}`, e.name, icon, e.color);
      this.toast(`${icon}<b>${esc(e.name)}</b>: ${esc(e.desc)}`, e.color);
    } else {
      if (this.evQueued && this.evQueued.n <= e.n) this.evQueued = null;   // banner sự kiện còn hoãn mà đợt đã qua → bỏ (không báo muộn)
      this.toast(`<b>Vượt ${esc(e.name)}!</b> +${fmt(m.gold)} vàng`, '#F2D27A');
    }
  }

  // bảng "Bộ quái mới" đang mở (nằm giữa màn, che banner) → hoãn banner tới khi bảng đóng; bảng đã ghi sự kiện này thì bỏ
  evBanner(e, ...args) {
    if ($('#roster-hint').hidden) { this.evQueued = null; return this.queueBanner(args); }
    this.evQueued = this.rosterEvN === e.n ? null : { n: e.n, args };
  }
  // banner đổi màn + banner sự kiện cùng lúc (vd đợt 60) → hiện lần lượt, cái sau đợi cái trước tắt (một #banner, không đè mất)
  queueBanner(args, then, gen = this.bannerGen) {
    if (gen !== this.bannerGen) return;   // clearBanners() đã huỷ hàng đợi
    const wait = $('#banner').hidden ? 0 : (this.bannerEnd || 0) - performance.now();
    if (wait > 0) { setTimeout(() => this.queueBanner(args, then, gen), wait + 60); return; }
    this.banner(...args);
    if (then) then();
  }
  clearBanners() { this.bannerGen = (this.bannerGen || 0) + 1; this.evQueued = null; clearTimeout(this.bannerT); $('#banner').hidden = true; this.bannerEnd = 0; }
  flushEvBanner() {
    if (this.evQueued && $('#roster-hint').hidden && $('#banner').hidden) { const a = this.evQueued.args; this.evQueued = null; this.queueBanner(a); }
  }

  // Hộp thoại có ảnh nhân vật (theo bản thiết kế mobile)
  say(who, text) {
    if (!text) return;
    const box = $('#dialogue');
    // v189 (L07): banner "Boss xuất hiện" đang hiện thì chờ banner tắt rồi mới nói — trước đây hộp thoại đè lên banner
    clearTimeout(this.sayWait);
    const wait = !$('#banner').hidden ? (this.bannerEnd || 0) - performance.now() : 0;
    if (wait > 0) { this.sayWait = setTimeout(() => this.say(who, text), wait + 50); return; }
    const foe = !!ENEMIES[who];
    const name = foe ? ENEMIES[who].name : who === 'sontinh' ? 'Sơn Tinh' : HEROES[who] ? HEROES[who].name : who;
    box.className = foe ? 'foe' : 'ally';
    const av = foe ? '<canvas width="108" height="124"></canvas>' : HEROES[who] ? `<img src="${heroImgUrl(who, 'head')}" alt="">` : svgI(sceneArt('drum'));
    box.innerHTML = `<div class="dav">${av}</div><div><h4>${esc(name)}</h4><p>“${esc(text)}”</p></div>`;
    if (foe) drawEnemyIcon(box.querySelector('canvas'), who, 0.04);
    box.hidden = false;
    this.placeToasts();
    clearTimeout(this.sayT);
    this.sayT = setTimeout(() => { box.hidden = true; this.placeToasts(); }, 3000);
  }

  banner(sub, text, icon, color) {
    if (icon) $('#banner-sub').innerHTML = icon + esc(sub); else $('#banner-sub').textContent = sub;
    $('#banner-text').textContent = text;
    const b = $('#banner');
    b.classList.toggle('ev', !!color);
    b.style.setProperty('--bn-c', color || '');
    b.hidden = false;
    b.style.animation = 'none';
    void b.offsetWidth;
    b.style.animation = '';
    clearTimeout(this.bannerT);
    this.bannerEnd = performance.now() + 2600;
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
    // v189: số đợt nằm trong ô rộng cố định (3 chữ số) → chữ "Đợt" không nhích khi 9 → 10 → 100
    { const n = `<span class="wn">${g.wave}</span>`, wt = g.endless ? `Đợt ${n} · Vô tận` : `Đợt ${n} / ${total}`; this.setHTML('#tb-wave', wt + g.hard + assetVersion, wt + (g.hard ? ` · ${ic('kho')}Khó` : '')); }
    const prog = g.waveActive && g.waveTotal ? 1 - (g.spawnQueue.length + g.enemies.length * 0.5) / (g.waveTotal * 1.5) : 0;
    // vo-tan-su-kien: qua đợt cuối cũ của bản đồ thì thanh chạy theo chặng 10 đợt (trước đây đứng yên ở 100%)
    const past = g.endless && g.wave > total, done = past ? ((g.wave - 1) % 10 + Math.max(0, prog)) / 10 : (g.wave - 1 + Math.max(0, prog)) / total;
    $('#tb-fill').style.width = `${Math.max(0, Math.min(1, done)) * 100}%`;
    this.setText('#tb-gold b', fmt(g.gold));
    $('#tb-gold').classList.toggle('kho', !!this.prepForge);     // v95: đang tiêu Ngân khố (bạc), không phải vàng trận
    { const mx = Math.max(g.maxLives || CONFIG.startLives, g.lives), r = g.lives / mx;   // v169: mạng "còn/tối đa", đổi màu khi thấp
      this.setHTML('#tb-lives b', g.lives + '/' + mx, `${g.lives}<small>/${mx}</small>`);
      $('#tb-lives').className = r <= 0.25 ? 'lv-low' : r <= 0.5 ? 'lv-mid' : ''; }
    this.setText('#tb-water b', `${g.water}/3`);
    // thanh mực nước: tiến tới lần dâng nước kế (sau đợt boss tiếp theo)
    let prev = 0, next = 0;
    for (let n = Math.max(1, g.wave - 20); n <= Math.max(g.levelWaves, g.wave + 10); n++) {
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
    run.classList.toggle('playing', g.running);
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
    let kindTxt = (n) => {
      const k = waveKind(n, g.level, g.stLv());
      if (k === 'boss') return `<span class="boss">Boss ${ENEMIES[bossAt(n, g.level, g.stLv())].name}</span>`;
      if (k === 'air') return 'Chim Bão <span class="air">(bay)</span>';
      if (k === 'champion') return 'Rùa khổng lồ';
      return '';
    };
    // vo-tan-su-kien: đợt kế có sự kiện → biểu tượng + tên; đang đánh đợt sự kiện → nhắc thử thách
    const evTxt = (e) => `<span class="evt" style="--c:${e.color}">${ic(e.ic, '', 'ev-ic')}${esc(e.name)}</span>`;
    const nx = eventAt(g.wave + 1, g.level), cur = g.waveActive && g.waveEvent();
    if (nx) { const k0 = kindTxt; kindTxt = (n) => k0(n) + (n === nx.n ? evTxt(nx) : ''); }
    if (g.wave > 0 && g.wave + 1 <= lim) {
      if (!g.waveActive && g.running) {
        early = true;
        html = `<b>Đợt ${g.wave + 1}</b> sau ${Math.ceil(Math.max(0, g.nextWaveT))}s ${kindTxt(g.wave + 1)}<span class="go">${uiIc('goi-som')}Gọi sớm +${g.earlyBonus()}</span>`;
      } else {
        const t = kindTxt(g.wave + 1);
        if (t) html = `<b>Đợt ${g.wave + 1}:</b> ${t}`;
      }
    }
    if (cur && !early) html = `${evTxt(cur)}<span class="evd">${esc(cur.desc)}</span>${html ? ' · ' + html : ''}`;
    if (g.floodSoon() >= 0) html += `${html ? ' · ' : ''}<span class="flood">${ic('nuoc-dang')}Nước sắp dâng: thêm ${FLOOD_PER_RISE} ô sát sông ngập</span>`;
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
    if ($('#bossbar').hidden !== !b) { $('#bossbar').hidden = !b; this.placeToasts(); }
    $('#ui').classList.toggle('foe-on', !!b);
    if (!b) return;
    const d = b.def;
    const st = [b.poisonT > 0 && ['dot', 'Thiêu đốt'], b.stunT > 0 && (b.stunKind === 'ice' ? ['dong-bang', 'Đóng băng'] : ['choang', 'Choáng']), (b.slowT > 0 || b.zoneSlow > 0) && ['cham', 'Chậm'], b.silenceT > 0 && ['cam-lang', 'Câm lặng']].filter(Boolean);
    const key = b.id + '|' + (b.enraged ? 1 : 0) + (b.el || '') + Math.round(b.armor) + '|' + Math.round(b.mr) + st.map((x) => x[0]).join() + '|' + assetVersion;
    if (this.sig.foe !== key) {
      this.sig.foe = key;
      const tag = d.boss ? 'Boss' : d.general ? 'Tướng địch' : b.champion ? 'Khổng lồ' : b.elite ? 'Tinh anh' : d.variant ? 'Biến thể' : d.flying ? 'Bay' : '';
      this.setText('#bb-name', b.champion ? `${d.name} khổng lồ` : d.name);
      $('#bb-tag').innerHTML = tag ? (d.boss || d.general ? ic('boss') : b.elite ? ic('tinh-anh') : d.flying ? ic('bay') : '') + tag : '';
      $('#bossbar').className = d.boss || d.general || b.champion ? 'big' : b.elite || d.variant ? 'elite' : '';
      const el = b.el && ELEMENTS[b.el];
      const by = el ? EL_ORDER.find((k) => EL_KHAC[k] === b.el) : null;
      const chips = [
        `<span title="Giáp">${ic('giap', 'Giáp')}Giáp <b>${Math.round(b.armor)}</b></span>`, `<span title="Kháng phép">${ic('khang-phep', 'Kháng phép')}Kháng phép <b>${Math.round(b.mr)}%</b></span>`,
        `<span title="Tốc chạy">${ic('toc-chay', 'Tốc chạy')}Tốc <b>${Math.round(d.speed)}</b></span>`, `<span title="Vàng rơi khi hạ">${ic('tui-vang', 'Vàng rơi')}<b>${d.gold}</b></span>`,
        el ? `<span style="color:${el.color}">${elIcon(b.el, 13)} Hành <b>${el.name}</b>${by ? ` · ${ic('khac-che')}bị ${ELEMENTS[by].name} khắc` : ''}</span>` : '',
      ].filter(Boolean).join('');
      // v189 (L06): hiệu ứng đang dính (choáng, câm lặng…) nằm trên một dòng riêng luôn chừa sẵn → bảng không giật cao/thấp theo hiệu ứng
      const fx = [b.enraged ? `<span style="color:#FF8A6A">${ic('noi-gian')}Đang hóa điên</span>` : '', ...st.map(([n, x]) => `<span class="fst">${ic(n)}${x}</span>`)].join('');
      $('#bb-info').innerHTML = `<div class="fc">${chips}</div><div class="fx">${fx}</div>${d.short ? `<div class="fs">${esc(d.short)}</div>` : ''}`;
    }
    this.setText('#bb-hp', `${fmt(Math.max(0, b.hp))} / ${fmt(b.maxHp)}${b.shield > 0 ? ` · khiên ${fmt(b.shield)}` : ''}${b.reviveT > 0 ? ' · đang lặn' : ''}`);
    $('#bb-fill').style.width = `${Math.max(0, b.hp / b.maxHp) * 100}%`;
    this.placeBossbar(b);
  }
  // v189 (L06): bảng nằm góc trên trái — đúng chỗ quái đi vào và gần các ô tướng hàng trái. Bảng đầy đủ đè lên boss
  // hoặc tướng thì thu gọn còn 1 dòng (tên + thanh máu) ở mép trên; bản gọn vẫn đè thì mờ đi để thấy bên dưới.
  // (Bản trước dời bảng xuống góc dưới trái — lại che tướng ở ô hàng trái.)
  placeBossbar(b) {
    const bar = $('#bossbar'), hz = typeof HZ !== 'undefined' ? HZ : 1;
    const mini = bar.classList.contains('mini');
    if (!mini) this.bbFullH = bar.offsetHeight; else this.bbMiniH = bar.offsetHeight;
    const w = bar.offsetWidth * hz, top = 44 * hz, fullH = (this.bbFullH || 150) * hz, miniH = (this.bbMiniH || 44) * hz;
    // vật cản (khung thiết kế): boss đang xem + mọi tướng trên sân
    const R = [];
    const box = enemyBox(b), lift = b.def.flying ? 24 : 0;
    { const x = (b.x + MAPX) / DK, y = (b.y - lift - box.h * 0.45 + MAPY) / DK, rx = box.w * 0.4 / DK + 4, ry = box.h * 0.5 / DK + 4; R.push([x - rx, y - ry, x + rx, y + ry]); }
    for (const h of this.game.heroes) if (h && !h.dead) { const x = (h.x + MAPX) / DK, y = (h.y + MAPY) / DK; R.push([x - 24 / DK, y - 76 / DK, x + 24 / DK, y + 6 / DK]); }
    const hit = (hh) => R.some(([l, t, r, bt]) => r > 6 && l < 6 + w && bt > top && t < top + hh);
    const nextMini = hit(fullH);
    bar.classList.toggle('mini', nextMini);
    bar.classList.toggle('ghost', nextMini && hit(miniH));
  }

  // cho-6-the: nạp + giải mã sẵn ảnh mặt mọi tướng có thể ra ở chợ → thẻ mới hiện ngay, không khung trắng
  preloadMarket(pool) {
    for (const t of pool) { const u = marketPortrait(t); if (u) this.preImg(u); }
  }
  // mỗi ảnh giữ sẵn 3 bản đã tải (hàng chợ có thể ra vài thẻ trùng loại)
  preImg(u) {
    const P = this.mkPre || (this.mkPre = new Map());
    const abs = new URL(u, document.baseURI).href, L = P.get(abs) || [];
    P.set(abs, L);
    while (L.length < 3) { const im = new Image(); im.decoding = 'sync'; im.src = u; if (im.decode) im.decode().catch(() => {}); L.push(im); }
  }
  // lấy ảnh đã nạp xong (đưa thẳng vào thẻ, không tạo ảnh mới chưa tải) rồi nạp sẵn bản khác cho lần sau
  takeMarketImg(abs) {
    const L = this.mkPre && this.mkPre.get(abs), k = L ? L.findIndex((im) => im.complete && im.naturalWidth && !im.isConnected) : -1;
    if (k < 0) return null;
    const im = L.splice(k, 1)[0];
    this.preImg(abs);
    return im;
  }
  // ---------- hàng thẻ dưới đáy: thẻ triệu hồi, hoặc thẻ tướng đang chọn
  updateDeck() {
    const g = this.game;
    const h = g.heroes[this.sel];
    if (!h) this.sel = -1;
    const deck = $('#deck');
    let key, html;
    if (!h) {
      // v143: CHỢ TƯỚNG — MARKET_SIZE thẻ luôn mở (cho-6-the: 6) (chạm = mua, kéo = đặt đúng ô) + ↻ đổi hàng + Hợp thể
      const m = g.ensureMarket(), sc = g.summonCost(), rc = g.rerollCost(), free = g.freeSlots().length;
      const twins = m.types.map((t) => !!g.marketTwin(t));
      const nd = g.marketNeeds(), hints = m.types.map((t) => g.marketHint(t, nd)), hops = hints.map((x) => x === 'hop');
      const ok = m.types.map((t, i) => g.gold >= sc && (free > 0 || twins[i]));
      key = `m|${m.types.join(',')}|${sc}|${ok.join()}|${twins.join()}|${hints.join()}|${!!m.lock}|${g.gold >= rc}|${rc}|${assetVersion}`;
      this.preloadMarket(nd.pool);
      const short = (t) => CARD_NAME[t] || HEROES[t].name.split(' ').slice(-2).join(' ');
      // cho-6-the: bỏ nút "Ghép tự động" — mua thẻ ghép được thì tự ghép luôn (Game.buyCard). Nguyên liệu hợp thể của tướng
      // đích chưa mở khoá: ổ khoá nhỏ trên dải giá + lời nhắc "Mở ở Anh Hùng"
      const lockTo = (t) => nd.hopLock.get(t), lockTip = (t) => `Nguyên liệu hợp thể ${HEROES[lockTo(t)].name} — chưa mở khoá: Mở ở Anh Hùng · ${fmt(OWN_COST[heroTier(lockTo(t))])} Ngân khố`;
      html = `<div class="mk-row ${m.lock ? 'locked' : ''}">${m.types.map((t, i) => `<button class="mk-card ${ok[i] ? '' : 'poor'} ${twins[i] ? 'twin' : ''} ${hops[i] ? 'hop' : ''} ${hints[i] === 'hopLock' ? 'hoplk' : ''}" data-mk="${i}" style="--c:${ELEMENTS[HEROES[t].el].color}" aria-label="Mua ${esc(HEROES[t].name)}${heroRole(t) ? ` (${ROLES[heroRole(t)].name})` : ''}${twins[i] ? ' (mua là ghép luôn)' : ''}${hops[i] ? ' (nguyên liệu hợp thể)' : ''}${hints[i] === 'hopLock' ? ` (${esc(lockTip(t))})` : ''}, ${sc} vàng" title="${esc(HEROES[t].name)}${heroRole(t) ? ` · ${ROLES[heroRole(t)].name}` : ''}${hints[i] === 'hopLock' ? ` · ${esc(lockTip(t))}` : ''}">
          <img src="${marketPortrait(t)}" alt="" draggable="false" decoding="sync"><span class="el">${elIcon(HEROES[t].el, 11)}</span>${heroRole(t) ? `<span class="rl">${roleIcon(heroRole(t), 16, true)}</span>` : ''}
          <b class="nm">${esc(short(t))}</b><span class="cost">${twins[i] ? '<i class="tw">ghép</i>' : ''}${coin(1)}${sc}${hops[i] ? '<i class="hp">hợp</i>' : hints[i] === 'hopLock' ? `<i class="hl">${UIE.lock()}</i>` : ''}</span></button>`).join('')}
          <button class="mk-rr metal ${g.gold >= rc ? '' : 'poor'}" data-act="mk-reroll" aria-label="Đổi cả hàng, ${rc} vàng"><b>${UIE.redo()}</b><span>${coin(1)}${rc}</span></button>
          <button class="mk-lk metal ${m.lock ? 'on' : ''}" data-act="mk-lock" aria-pressed="${!!m.lock}" aria-label="${m.lock ? 'Bỏ khoá chợ' : 'Khoá chợ: giữ nguyên hàng thẻ sang đợt sau'}" title="${m.lock ? 'Đang khoá: đợt sau giữ nguyên hàng thẻ' : 'Khoá chợ: giữ nguyên hàng thẻ sang đợt sau'}">${MK_LOCK[m.lock ? 1 : 0]}<span>${m.lock ? 'Đã<br>khoá' : 'Khoá'}</span></button></div>
        <span class="dk-sep"></span><button class="dk-card legend" data-act="legend-open" aria-label="Cây hợp thể">${`<img class="asc-ic" src="${assetSrc('ui/ui-tran-3-2.png')}" alt="★">`}Hợp<br>thể</button>`;
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
      key = `h|${h.id}|${h.type}|${h.level}|${h.train || 0}|${h.tier}|${h.skillPts}|${skillKey}|${afford}|${h.dead}|${h.bogged}|${fresh}|${notice}|${up}|${this.moving < 0}|${assetVersion}`;
      const vt = heroRole(h.type);
      const status = h.dead ? `Hồi sinh sau ${Math.ceil(h.respawnT)}s` : h.bogged ? 'Sa lầy · dùng Mọc Núi' : `${vt ? `${roleIcon(vt, 12)}<b style="color:${ROLES[vt].color}">${ROLES[vt].name}</b> · ` : ''}Hành ${ELEMENTS[def.el].name}`;
      // 4 ô kỹ năng (v37): số trên ô = cấp kỹ năng; tag phía trên = giá nâng tiếp (+ điểm / + vàng / MAX).
      // Chạm ô = nâng (hoặc mở khóa) luôn, không còn màn Kỹ năng riêng.
      const skills = def.skills.map((sk, i) => {
        const lv = skillLevel(h, i);
        const max = SKILL_MAX[i];
        if (!lv) {
          const can = h.level >= COSTS.unlockReq[i];
          const c = unlockCost(h, i);
          return `<button class="dk-sk inset lock" data-act="cmd-skill" data-i="${i}" data-skt="${i}" aria-label="${sk.name}, khóa">
            <span class="sk-tag ${can && g.gold >= c ? 'ok' : 'no'}">+${coin(1)}${c}</span>
            <span class="dim">${svgI(skillIcon(h.type, i))}</span>${ICON.lock}${can ? '' : `<b class="no">cấp ${COSTS.unlockReq[i]}</b>`}</button>`;
        }
        const cd = sk.active ? Math.max(0, h.skillCd[sk.id] || 0) : 0;
        const mx = sk.active ? sk.active.cooldown * (1 - st.cdr / 100) : 1;
        const lvOk = lv < max && h.level >= skillReqLevel(i, lv + 1);
        const pay = h.from ? g.gold >= COSTS.skillGold(i, lv) : h.skillPts > 0;
        const tag = lv >= max ? '<span class="sk-tag max">MAX</span>'
          : `<span class="sk-tag ${lvOk && pay ? 'ok' : 'no'}">+${h.from ? `${coin(1)}${COSTS.skillGold(i, lv)}` : '1đ'}</span>`;
        return `<button class="dk-sk metal ${sk.active && h.mana < sk.active.mana ? 'nomana' : ''} ${i === fresh ? 'fresh' : ''} ${lvOk && pay ? 'canup' : ''}" data-act="cmd-skill" data-i="${i}" data-skt="${i}" aria-label="${sk.name} cấp ${lv}">
          ${tag}${svgI(skillIcon(h.type, i))}<span class="lvn">${lv}</span>${lvOk ? '' : lv < max ? `<span class="req">cấp ${skillReqLevel(i, lv + 1)}</span>` : ''}
          ${sk.active ? `<span class="cdov" style="height:${cd > 0.4 ? Math.min(100, cd / mx * 100) : 0}%"></span><span class="cdn">${cd > 0.4 ? Math.ceil(cd) : ''}</span>` : ''}</button>`;
      }).join('') + (h.from || !h.skillPts ? '' : `<button class="dk-sk metal stat ${h.skillPts ? 'canup' : 'off'}" data-act="sk-stat-deck" aria-label="Cộng điểm dư vào chỉ số">
          <span class="sk-tag ${h.skillPts ? 'ok' : 'no'}">+1đ</span><b style="color:${ELEMENTS[def.el].color}">+${COSTS.statPt}</b><small>${ATTRS[heroMain(def)].short}</small>${h.skillPts ? `<span class="badge">${h.skillPts}</span>` : ''}</button>`);
      const maxed = h.level >= CONFIG.maxLevel;
      const tc = g.trainCost(h);
      html = `<button class="dk-x metal" data-act="deck-close" aria-label="Bỏ chọn">${ICON.close}</button>
        <span class="dk-pt ${def.legend || 'common'}" ${assetUrl(`ui_khung-${def.legend === 'legendary' ? 'vang' : 'thuong'}.png`) ? `style="background-image:url('${assetUrl(`ui_khung-${def.legend === 'legendary' ? 'vang' : 'thuong'}.png`)}'),radial-gradient(circle at 50% 60%,#3A2416,#1A0F0A 75%);background-size:100% 100%,auto"` : ''}><canvas id="dk-portrait" width="108" height="116" title="Giữ để xem chỉ số"></canvas><span class="lv">${h.level}${h.train ? `<i>✦${h.train}</i>` : ''}</span><span class="st" ${h.from ? 'style="color:#FF7A3A"' : ''}>${'★'.repeat(h.tier || 0)}</span></span>
        <span class="dk-info"><span class="nm">${elIcon(def.el, 15)}${def.name}</span><span class="sub ${h.bogged || h.dead ? 'warn' : ''}">${status}</span>
          <span class="bar hp"><i id="dk-hp"></i></span><span class="bar mp"><i id="dk-mp"></i></span></span>

        ${skills}
        ${maxed ? `<button class="dk-up btn-gold" data-act="train" ${g.gold < tc ? 'disabled' : ''} aria-label="Luyện thể"><b>${uiIc('luyen-the')}Luyện thể ✦${(h.train || 0) + 1}</b><span>${coin(1)}${tc}</span></button>`
          : `<button class="dk-up btn-gold" data-act="levelup" ${g.gold < lc ? 'disabled' : ''} aria-label="Nâng cấp tướng"><b>${ic('cap-do')}Lên cấp ${h.level + 1}</b><span>${coin(1)}${lc}</span></button>`}
`;
    }
    if (this.sig.deck !== key) {
      this.sig.deck = key;
      deck.classList.toggle('mk-mode', !h);     // cho-6-the: thanh chợ thấp gọn hơn thanh tướng đang chọn
      // cho-6-the: giữ lại <img> đã tải/giải mã khi dựng lại thanh (đổi chợ, mua) — ảnh mới tạo lại hay trắng 1–2 khung → nháy
      const old = new Map();
      for (const im of deck.querySelectorAll('img')) { const k = im.getAttribute('src'); if (!old.has(k)) old.set(k, []); old.get(k).push(im); }
      deck.innerHTML = html;
      for (const im of deck.querySelectorAll('img')) {
        const o = old.get(im.getAttribute('src')), r = (o && o.shift()) || (im.closest('.mk-card') && this.takeMarketImg(im.src));
        if (r) { r.className = im.className; r.alt = ''; r.draggable = false; im.replaceWith(r); }
      }
      // v144: tên dài trên thẻ chợ tự thu nhỏ chữ cho vừa thẻ (thay vì bị cắt "…")
      for (const nm of deck.querySelectorAll('.mk-card .nm')) {
        for (let f = 9.5; nm.scrollWidth > nm.clientWidth + 1 && f > 7.5; f -= 0.5) nm.style.fontSize = f + 'px';
      }
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
      // bảng chỉ số tướng: chỉ hiện khi đang giữ tay lên chân dung (v154)
      const sp = $('#hero-stats');
      if (this.statsOpen && !this.screen) {
        const sk2 = `${h.id}|${h.level}|${h.tier}|${h.train}|${h.statPts}|${Object.values(h.skillLv).join()}|${SLOTS.map((x) => h.equip[x] ? h.equip[x].uid : '').join()}|${Math.round(h.hp)}|${Math.round(h.shield || 0)}|${h.bogged ? 1 : 0}|${JSON.stringify(g.vtTiers || {})}`;
        if (this.statsSig !== sk2 || sp.hidden) {
          this.statsSig = sk2;
          const S = heroStats(h);
          const row = (k, v, n) => `<div><span>${n ? ic(n) : ''}${k}</span><b>${v}</b></div>`;
          sp.innerHTML = `<div class="hs-h">${HEROES[h.type].name} · cấp ${h.level} · ${'★'.repeat(h.tier || 0)} · ${ic('luc-chien')}lực chiến <b>${heroPower(h)}</b>${h.shield > 0 ? ` · ${ic('khien')}khiên <b>${Math.round(h.shield)}</b>` : ''}${h.bogged ? ` · ${ic('sa-lay')}sa lầy` : ''}</div>${this.roleLine(h)}<div class="hs-g">`
            + row('Sát thương', Math.round(S.damage), 'sat-thuong') + row('Tốc đánh', `${(1 / S.cooldown).toFixed(2)}/giây`, 'toc-danh') + row('Tầm đánh', Math.round(S.range), 'tam-danh')
            + row('Máu', `${Math.round(h.hp)}/${Math.round(S.hpMax)}`, 'mau') + row('Chí mạng', `${Math.round(S.crit)}% ×${S.critMult.toFixed(1)}`, 'chi-mang') + row('Giảm hồi chiêu', `${Math.round(S.cdr)}%`, 'hoi-chieu')
            + row('Giảm s.thương', `${Math.round(S.dr)}%`, 'giam-sat-thuong') + row('Năng lượng', Math.round(S.maxMana), 'nang-luong')
            + row(ATTRS.str.name, Math.round(S.str), 'suc-manh') + row(ATTRS.agi.name, Math.round(S.agi), 'nhanh-nhen') + row(ATTRS.int.name, Math.round(S.int), 'tri-tue')
            + row('Hồi máu', `${S.regen.toFixed(1)}/giây`, 'hoi-mau') + row('Điểm đã cộng', h.statPts || 0, 'diem-ky-nang') + '</div>';
          sp.hidden = false;
        }
        this.placeStats(sp);
      } else if (!sp.hidden) sp.hidden = true;
      // thanh thao tác nổi trên tướng: tự hiện khi chọn tướng (ẩn khi mở màn khác / menu)
      const show = !h.dead && !this.screen && !this.statsOpen && $('#drawer').hidden && this.moving < 0;
      const mk = show ? this.moreKey(h) : '';
      if (show && this.moreSig !== mk) { this.moreSig = mk; this.renderMore(); }
      else if (show && this.moreHas) { if ($('#more').hidden) $('#more').hidden = false; this.placeMore(h); }
      else if (!$('#more').hidden) $('#more').hidden = true;
    } else { $('#more').hidden = true; $('#hero-stats').hidden = true; this.statsOpen = false; }
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
    // v157: nút Túi đồ chấm xanh khi có món mới chưa xem (so với lần mở túi gần nhất trong trận này)
    if (!this.bagSeen || this.bagSeen.run !== g.runId) this.bagSeen = { run: g.runId, uids: new Set(g.inventory.map((i) => i.uid)) };
    const nw = g.inventory.some((i) => !this.bagSeen.uids.has(i.uid));
    const [bb, bu, be] = el.querySelectorAll('.dot');
    if (bb.hidden === nw) bb.hidden = !nw;
    if (bu.hidden === up) bu.hidden = !up;
    if (be.hidden === eq) be.hidden = !eq;
  }

  // thùng hủy tướng: hiện khi đang kéo một tướng; thả vào = hủy, hoàn vàng
  showTrash(slot) {
    const h = this.game.heroes[slot];
    if (!h) return;
    const el = $('#trash');
    el.innerHTML = `<b>${this.uiImg('ui-tran-2-4', '🗑')} Hủy tướng</b><small>thả vào đây · hoàn ${coin(1)} ${this.game.sellValue(h)}</small>`;
    el.classList.remove('hot');
    el.hidden = false;
    // v143: trong lúc kéo tướng, ẩn chợ tướng / thanh đáy — thùng Hủy nằm đúng chỗ đó
    $('#wrap').classList.add('dragging-hero');
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
    $('#wrap').classList.remove('dragging-hero');
    return hit;
  }
  trashHero(slot) {
    const g = this.game, h = g.heroes[slot];
    if (!h) return;
    const v = g.sellValue(h);
    if (COOP.on && !g.co.canAct(COOP.me, slot)) return this.toast('Đây là tướng của đồng đội', '#E25A3A');
    this.cmd('sellHero', [slot]);
    if (this.sel === slot) this.clearSel();
    $('#more').hidden = true;
    this.toast(`Đã hủy ${HEROES[h.type].name}: +${v} vàng`, '#F2D27A');
  }

  // Thanh thao tác nổi ngay trên tướng đang chọn (v37): chạm tướng là thấy, mỗi việc 1 chạm.
  // Hợp thể làm luôn khi đủ điều kiện; ghép sao / đổi chỗ = giữ & kéo; hủy = kéo tướng thả vào thùng 🗑 ở dưới.
  // v180: bỏ nút Hủy trên bong bóng; không còn nút nào (không Thần tinh / Hợp thể) thì không hiện bong bóng.
  moreKey(h) {
    const g = this.game;
    const fz = (ASCEND[h.type] || []).map((to) => {
      const o = g.heroes.find((x) => x && x !== h && x.type === fusionPartner(h.type, to) && typeof g.canFuse(x, h) !== 'string');
      return o ? o.slot : -1;
    }).join();
    return [h.id, h.type, h.tier, h.skillPts, h.notice.skills, h.notice.evo, h.from, fz, h.spent].join('|');
  }
  renderMore() {
    const g = this.game;
    const h = g.heroes[this.sel];
    if (!h) return;
    const t = h.tier || 0;
    const readyF = (ASCEND[h.type] || []).map((to) => {
      const pt = fusionPartner(h.type, to);
      const o = g.heroes.filter((x) => x && x !== h && x.type === pt && typeof g.canFuse(x, h) !== 'string')[0];
      return o ? { to, pt, o } : null;
    }).filter(Boolean);
    const b = (cls, act, ic, label, extra = '') => `<button class="ha ${cls}" data-act="${act}" ${extra}><span class="i">${ic}</span><span class="l">${label}</span></button>`;
    $('#more').innerHTML = [
      // v171: bỏ nút Ghép sao / Trang bị — ghép = kéo tướng thả lên tướng cùng loại cùng sao (hoặc Ghép tự động), mặc đồ = Tự mặc đồ / Túi đồ
      h.from ? b(h.notice.evo ? 'notice' : '', 'open-evo', '✦', t < 3 ? `Thần tinh ★${t + 1}` : 'Thần tinh') : '',
      ...readyF.map((f) => b('fuse', 'fuse-with', '✸', `→ ${HEROES[f.to].name}`, `data-slot="${f.o.slot}" style="color:${RARITY[HEROES[f.to].legend].color}"`)),
    ].join('');
    this.moreHas = !!$('#more').innerHTML;
    $('#more').hidden = !this.moreHas;
    if (this.moreHas) this.placeMore(h);
  }
  // đặt thanh ngay trên đầu tướng, kẹp trong màn hình
  placeMore(h) {
    const el = $('#more');
    // toạ độ trong khung thiết kế 932×430 (đúng cả khi khung đang tự xoay ngang)
    // v189: đỉnh đầu theo hình tướng vẽ thật (main.js ghi HERO_TOP) + chỗ sao Thần tinh — tướng Tím / Vàng vẽ to hơn,
    // trước đây ước 66 nên bong bóng đè lên đầu tướng vừa hoá thân
    const x = (h.x + MAPX) / DK, y = (h.y + MAPY) / DK, dt = typeof HERO_TOP !== 'undefined' ? HERO_TOP.get(h) : undefined,
      head = ((dt != null ? Math.min(h.y - 66, dt - 22) : h.y - 66) + MAPY) / DK;
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
    if ((this.save.unlocked || 1) <= 1 && !g.over && !this.screen && $('#reward').hidden && $('#settings').hidden && $('#legends').hidden) {
      const heroes = g.heroes.filter(Boolean);
      if (!heroes.length) {
        pos = [466, 330];
        text = 'Chạm 1 thẻ tướng ↓ để triệu hồi (hoặc kéo thẻ vào ô)';
      } else if (heroes.length === 1 && g.wave === 0 && g.gold >= g.summonCost()) {
        pos = [466, 330];
        text = 'Mua thêm tướng: thẻ có nhãn “ghép” mua về là lên ★★';
      } else if (g.wave === 0 && !g.running) {
        pos = [800, 76];
        text = `Bấm ▶ (góc trên phải) để ${themeOf(g.level).foe} tràn tới`;
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
      this.rosterKey = rosterKeyOf(rosterFor(Math.max(1, g.wave), g.level, g.stLv())); this.rosterLevel = g.level;
      if (!g.endless) return;
    }
    this.flushEvBanner();
    const key = rosterKeyOf(rosterFor(n, g.level, g.stLv()));
    if (key === this.rosterKey) return;
    if (!$('#banner').hidden) return;     // banner (boss / sự kiện) đang hiện → đợi banner tắt rồi mới mở bảng (không che nhau)
    this.rosterKey = key;
    if (!g.endless || !key) return;
    // vo-tan-su-kien: đợt mới đổi bộ quái trùng mốc sự kiện → ghi luôn sự kiện vào bảng (1 dòng icon + tên + thử thách)
    const ev = eventAt(n, g.level) || (g.waveActive && g.waveEvent());
    this.rosterEvN = ev ? ev.n : 0;
    const bosses = [];
    for (let w = n; w < n + 10; w++) { const b = bossAt(w, g.level, g.stLv()); if (b) bosses.push(b); }
    const pool = [...g.marketPool(), ...LEGEND_HEROES.filter((t) => (this.save.owned || []).includes(t))];
    const c = rosterCounters(ROSTERS[key], bosses, pool, []);
    const el = $('#roster-hint');
    el.innerHTML = `<div class="rh-h"><small>Đợt ${n} · bộ quái mới</small><b>${ROSTER_NAMES[key] || key}</b></div>
      ${ev ? `<div class="rh-ev" style="--c:${ev.color}">${ic(ev.ic, '', 'ev-ic')}<b>Đợt ${ev.n} · ${esc(ev.name)}</b> · ${esc(ev.desc)}</div>` : ''}
      ${c.main ? `<div class="ch-sum">Quái chủ yếu hành <b style="color:${ELEMENTS[c.main].color}">${ELEMENTS[c.main].name}</b> → dùng hành <b style="color:${ELEMENTS[c.ce].color}">${ELEMENTS[c.ce].name}</b></div>` : ''}
      <div class="rh-foes">${c.foes.slice(0, 7).map((k) => `<span title="${esc(ENEMIES[k].name)}">${esc(ENEMIES[k].name)}${ENEMIES[k].boss ? ' ' + ic('boss', 'Boss') : ''}</span>`).join('')}</div>
      <div class="ch-row">${c.list.map((x) => `<span class="ch-av ${HEROES[x.t].legend || ''}" style="--c:${ELEMENTS[HEROES[x.t].el].color}"><img src="${heroImgUrl(x.t, 'head')}" alt="${esc(HEROES[x.t].name)}"><i>${elIcon(HEROES[x.t].el, 11)}</i><small>${x.why}</small></span>`).join('')}</div>
      <div class="rh-x">Chạm để đóng</div>`;
    el.hidden = false;
    this.placeToasts();
    clearTimeout(this.rosterHintT);
    this.rosterHintT = setTimeout(() => { el.hidden = true; this.placeToasts(); }, 9000);
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
        <div class="lg-h" data-tip-avoid=".lg-sys" data-tip="${esc(`<b>${esc(sys.name)}</b><small>Thần Khí · cấp ${lv}/${LEGACY_MAX}</small><div class='st-rows'><div class='st-r'><span>Tối đa (cấp ${LEGACY_MAX})</span><b><em>${legacyPerText(sys, LEGACY_MAX)}</em></b></div>${lv < LEGACY_MAX ? `<div class='st-r'><span>Còn cần</span><b>${fmt(LEGACY_COST.slice(lv).reduce((x, y) => x + y, 0))} Ngân khố (${LEGACY_MAX - lv} cấp)</b></div><div class='st-r ${kho >= c ? 'ok' : 'no'}'><span>Đang có</span><b>${fmt(kho)}${kho >= c ? ' · đủ nâng cấp kế ✓' : ` · thiếu ${fmt(c - kho)} cho cấp ${lv + 1}`}</b></div>` : '<small>Đã tối đa</small>'}</div>`)}"><span class="lg-ic">${typeof pxUrl === 'function' && pxUrl('than-khi', `${t}_${sys.id}`) ? `<img src="${pxUrl('than-khi', `${t}_${sys.id}`)}" alt="">` : RELIC_PACK.has(t) ? `<img src="${assetSrc(`packs/${t}/tk-${si + 1}.png`)}" alt="">` : emoArt(sys.ic)}</span><div><b>${sys.name}</b><small>${esc(sys.desc)}</small></div></div>
        <div class="lg-pips">${pips}<span>${lv}/${LEGACY_MAX}</span></div>
        <div class="lg-now">${lv ? legacyPerText(sys, lv) : 'Chưa nâng'}${lv < LEGACY_MAX ? `<br><small>Cấp ${lv + 1}: ${legacyPerText(sys, lv + 1)}</small>` : ''}</div>
        ${sys.ms.map((m) => `<div class="lg-ms ${lv >= m.lv ? 'got' : ''}"><span>Cấp ${m.lv}</span>${esc(m.t)}</div>`).join('')}
        ${lv >= LEGACY_MAX ? '<div class="chip ok" style="text-align:center;margin-top:auto">Đã tối đa</div>'
          : `<button class="btn btn-gold lg-buy" data-act="lg-buy" data-k="${sys.id}" ${kho < c ? 'disabled' : ''}>${ic('nang-cap')}Nâng cấp ${lv + 1} · ${bac()} ${fmt(c)}</button>`}
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
      if (after > before) up.push(`${ic('tu-vi')}${HEROES[t].name} lên ${TUVI_RANKS[after - 1]} (Tu Vi ${after}) · +${(after - before) * TUVI_PTS} điểm Ấn Phù`);
    }
    g.xpLog = {};
    writeSave(sv);
    return { rows: rows.slice(0, 6), up };
  }

  // ---------- v95: Bảng Ấn Phù RIÊNG TỪNG TƯỚNG — khắc bằng điểm Tu Vi
  // v123: Ấn Phù chỉ dành cho tướng Vàng (Huyền thoại) đã sở hữu
  runeHeroes() { return LEGEND_HEROES.filter((t) => HEROES[t].legend === 'legendary' && (this.save.owned || []).includes(t)); }
  showRunes(inGame, type) {
    this.runesInGame = !!inGame;
    const sel = this.game.heroes[this.sel];
    const list = this.runeHeroes();
    // v165: chưa có tướng Vàng vẫn mở màn Ấn Phù (trước chỉ hiện toast — bị lớp menu che nên bấm như không có gì xảy ra)
    if (!list.length) this.runesFromRoster = false;
    const pick = [type, inGame && sel ? sel.type : null, this.runeHero].find((x) => x && list.includes(x));
    this.runeHero = pick || list[0] || null;
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
    if (!this.runeHero) {
      $('#runes').innerHTML = `<div class="screen" style="z-index:auto">
        <div class="scr-head metal"><button class="xbtn metal" data-act="rn-back" aria-label="Quay lại">${ICON.back}</button><h1 class="ttl">Ấn Phù</h1></div>
        <div class="scr-body rn-empty"><div class="panel metal"><b class="rn-eh">Chưa có tướng Vàng</b>
          <p>Ấn Phù chỉ dành cho <b>tướng Vàng</b>. Mua tướng Vàng ở <b>Anh Hùng</b> (bằng Ngân khố), rồi hạ quái bằng tướng đó để tích Tu Vi và khắc ấn.</p>
          <button class="btn btn-gold" data-act="rn-roster">Đến Anh Hùng</button></div></div></div>`;
      return;
    }
    const t = this.runeHero, d = HEROES[t], lvs = this.heroRuneLv(t);
    const xp = (this.save.tuvi || {})[t] || 0, tl = tuviLevel(xp), nx = tuviNext(xp), left = this.runePtsLeft(t);
    const r = RUNE_BY[this.runeSel], lv = lvs[r.id] || 0, br = RUNE_BRANCHES.find((b) => b.id === r.br);
    const open = this.runeOpen(r), cost = runePt(r);
    const node = (x) => {
      const l = lvs[x.id] || 0, op = this.runeOpen(x);
      return `<button class="rn-node ${x.skill ? 'sk' : ''} ${l ? 'has' : ''} ${l >= x.max ? 'full' : ''} ${op ? '' : 'lock'} ${x.id === r.id ? 'on' : ''}" data-act="rn-sel" data-k="${x.id}" data-tip-avoid=".rn-board|.rn-col" aria-label="${esc(x.name)}" data-tip="${esc(`<b>${esc(x.name)}</b><small>${x.skill ? 'Ấn kỹ năng · 3 điểm / cấp' : 'Ấn chỉ số · 1 điểm / cấp'} · cấp ${l}/${x.max}</small><p>${l ? `Cấp ${l}: ${esc(x.fmt(runeVal(x, l)))}` : 'Chưa khắc'}</p>${l < x.max ? `<div class='st-rows'><div class='st-r'><span>Cấp ${l + 1}</span><b><em>${esc(x.fmt(runeVal(x, l + 1)))}</em></b></div><div class='st-r ${op ? 'ok' : 'no'}'><span>Điều kiện</span><b>${op ? 'Đã mở ✓' : `${RUNE_ROW_NEED[x.row]} cấp trong nhánh`}</b></div><div class='st-r'><span>Giá</span><b>${runePt(x)} điểm Ấn</b></div></div>` : '<small>Đã tối đa</small>'}`)}">
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
          <div class="rn-tv"><img src="${heroImgUrl(t, 'head')}" alt=""><div><b>${d.name}</b><small>${ic('tu-vi')}Tu Vi ${tl} · ${tuviRank(xp)}</small>
            <div class="rn-xp"><i style="width:${bar * 100}%"></i></div><small>${nx ? `${fmt(Math.floor(xp))} / ${fmt(nx)} — hạ quái bằng tướng này để lên bậc` : 'Đã đạt bậc cao nhất'}</small></div></div>
          <div class="rn-pts">${ic('diem-an-phu')}Điểm Ấn còn <b>${left}</b> / ${tuviPoints(xp)} <button class="btn ${this.runeResetArm ? 'btn-gold' : 'metal'}" data-act="rn-reset" ${runeSpent(lvs) ? '' : 'disabled'}>${this.runeResetArm ? 'Bấm lần nữa' : 'Tẩy ấn'}</button></div>
          <div class="rn-dh"><span class="rn-big">${runeIc(r)}</span><div><b>${r.name}</b><small>${br.name} · ${r.skill ? 'Ấn kỹ năng · 3 điểm / cấp' : 'Ấn chỉ số · 1 điểm / cấp'} · cấp ${lv}/${r.max}</small></div></div>
          <div class="rn-lvs">${lines.join('')}</div>
          ${lv >= r.max ? '<div class="chip ok" style="text-align:center">Đã tối đa</div>'
            : !open ? `<div class="rn-lockmsg">${UIE.lock()} Cần ${RUNE_ROW_NEED[r.row]} cấp trong ${br.name} (đang có ${runeBranchPts(lvs, r.br)})</div>`
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
  // v154: bảng chỉ số nổi ngay trên thanh đáy, mép trái căn theo chân dung, không tràn khỏi màn
  placeStats(sp) {
    const pt = $('#dk-portrait'), ui = $('#ui');
    if (!pt) return;
    // đổi toạ độ màn hình → toạ độ trong #ui (máy xoay dọc: #wrap.rot quay 90°)
    const u = ui.getBoundingClientRect(), rot = $('#wrap').classList.contains('rot');
    const sc = (rot ? u.height : u.width) / ui.offsetWidth || 1;
    const loc = (e) => { const r = e.getBoundingClientRect();
      return rot ? { left: (r.top - u.top) / sc, top: (u.right - r.right) / sc } : { left: (r.left - u.left) / sc, top: (r.top - u.top) / sc }; };
    const r = loc(pt), d = loc($('#deck'));
    const hz = parseFloat(getComputedStyle($('#wrap')).getPropertyValue('--hz')) || 1;
    const W = ui.offsetWidth, w = sp.offsetWidth * hz;
    const x = Math.max(6, Math.min(W - w - 6, r.left - 4));
    const bottom = ui.offsetHeight - d.top + 6;
    const L = x + 'px', B = bottom + 'px';
    if (sp.style.left !== L) sp.style.left = L;
    if (sp.style.bottom !== B) sp.style.bottom = B;
  }
  // v182: khung mô tả chung — đặt sát ô đang chỉ, KHÔNG che ô đó: ưu tiên phía trên, hết chỗ thì phía dưới,
  // rồi sang phải / trái; luôn nằm gọn trong màn (thu chiều rộng / cao nếu màn quá nhỏ).
  openTip(el, mode) {
    const d = el.dataset;
    let html = d.tip || '';
    if (d.skt !== undefined) html = this.skillTipHtml(null, +d.skt, this.game.heroes[this.sel], mode, !!el.closest('[data-act=cmd-skill]'));
    else if (d.skr) { const [ty, i] = d.skr.split(':'); html = this.skillTipHtml(ty, +i, null, mode); }
    if (!html) return this.hideTip();
    const r = el.getBoundingClientRect();
    this.tip = { el, mode, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
    this.showTip(html, el);
  }
  hideTip() { this.tip = null; const t = $('#sk-tip'); if (t) t.hidden = true; }
  showTip(html, el) {
    let t = $('#sk-tip');
    if (!t) { t = document.createElement('div'); t.id = 'sk-tip'; t.className = 'metal'; t.setAttribute('role', 'tooltip'); $('#ui').appendChild(t); }
    if (t.innerHTML !== html) t.innerHTML = html;
    t.hidden = false;
    t.style.width = '';
    const ui = $('#ui'), u = ui.getBoundingClientRect(), W = ui.offsetWidth, H = ui.offsetHeight, M = 6, G = 8;
    // v186: màn dọc xoay cả #wrap 90° (chiều kim đồng hồ) → đổi toạ độ màn hình về hệ toạ độ trong #ui
    const rot = $('#wrap').classList.contains('rot'), sc = (rot ? u.height : u.width) / W || 1;
    const local = (b) => rot
      ? { l: (b.top - u.top) / sc, r: (b.bottom - u.top) / sc, t: (u.right - b.right) / sc, b: (u.right - b.left) / sc }
      : { l: (b.left - u.left) / sc, r: (b.right - u.left) / sc, t: (b.top - u.top) / sc, b: (b.bottom - u.top) / sc };
    // khung bao cả phần lòi ra ngoài ô (nhãn giá +1đ / +60 phía trên ô kỹ năng)
    const box = (e) => local([e, ...e.children].map((x) => x.getBoundingClientRect()).filter((x) => x.width && x.height)
      .reduce((m, x) => ({ left: Math.min(m.left, x.left), top: Math.min(m.top, x.top), right: Math.max(m.right, x.right), bottom: Math.max(m.bottom, x.bottom) })));
    t.style.maxWidth = (W - 2 * M) + 'px'; t.style.maxHeight = (H - 2 * M) + 'px';
    const w0 = t.offsetWidth;
    // thử đặt khung tránh vùng r: trên → dưới → phải → trái; hai bên hẹp thì thu khung (≥ 180px)
    const fit = (r) => {
      let w = w0; t.style.width = ''; let ht = t.offsetHeight;
      const cx = (r.l + r.r) / 2, cy = (r.t + r.b) / 2;
      const clampX = (x) => Math.max(M, Math.min(W - w - M, x)), clampY = (y) => Math.max(M, Math.min(H - ht - M, y));
      if (r.t - G - ht >= M) return { side: 'top', y: r.t - G - ht, x: clampX(cx - w / 2) };
      if (r.b + G + ht <= H - M) return { side: 'bottom', y: r.b + G, x: clampX(cx - w / 2) };
      const rr = W - M - r.r - G, rl = r.l - G - M;
      for (const [side, room] of [['right', rr], ['left', rl]]) {
        if (room < Math.min(w0, 180)) continue;
        w = Math.min(w0, room); t.style.width = w + 'px'; ht = t.offsetHeight;
        if (ht <= H - 2 * M) return { side, x: side === 'right' ? r.r + G : r.l - G - w, y: clampY(cy - ht / 2) };
      }
      t.style.width = '';
      return null;
    };
    // data-tip-avoid="sel1|sel2": vùng nên tránh che (cả cột / thẻ chứa ô), thử lần lượt rồi mới đến chính ô
    const zones = [...(el.dataset.tipAvoid || '').split('|').filter(Boolean).map((q) => el.closest(q)).filter(Boolean), el];
    let p = null;
    for (const z of zones) if ((p = fit(box(z)))) break;
    if (!p) {   // màn quá chật: bên nào rộng hơn thì đặt, cho cuộn trong khung
      const r = box(el), ht = t.offsetHeight, side = r.t > H - r.b ? 'top' : 'bottom';
      const room = Math.max(40, (side === 'top' ? r.t : H - r.b) - G - M);
      t.style.maxHeight = room + 'px';
      p = { side, x: Math.max(M, Math.min(W - w0 - M, (r.l + r.r) / 2 - w0 / 2)), y: side === 'top' ? r.t - G - Math.min(ht, room) : r.b + G };
    }
    t.dataset.side = p.side;
    t.style.left = p.x + 'px'; t.style.top = p.y + 'px';
  }
  // v182: nội dung mô tả kỹ năng: tên, loại, mô tả có số liệu, hiệu lực cấp này → cấp sau, hồi chiêu, điều kiện mở, giá nâng.
  // h = tướng trên sân (thanh tướng, Cây kỹ năng); không có h (màn Anh Hùng) thì xem như tướng cấp 1, kỹ năng chưa học.
  skillTipHtml(type, i, h, mode, deck) {
    type = h ? h.type : type;
    const def = HEROES[type], sk = def && def.skills[i]; if (!sk) return '';
    const a = sk.active, max = SKILL_MAX[i], hl = h ? h.level : 1, lv = h ? skillLevel(h, i) : 0;
    const pct = (L) => `${Math.round(skillMult(L) * 100)}%`;
    const row = (k, v, c = '') => `<div class="st-r ${c}"><span>${k}</span><b>${v}</b></div>`;
    const rows = [];
    // hiệu lực: mỗi cấp kỹ năng +25%
    rows.push(row('Hiệu lực', lv >= max ? `cấp ${lv}: ${pct(lv)} · tối đa` : lv ? `cấp ${lv}: ${pct(lv)} <i>➜</i> cấp ${lv + 1}: <em>${pct(lv + 1)}</em>` : `cấp 1: ${pct(1)} <i>➜</i> cấp 2: <em>${pct(2)}</em>`));
    if (a) {
      let cd = a.cooldown;
      if (h) { try { cd = a.cooldown * (1 - (heroStats(h).cdr || 0) / 100); } catch (e) { /* bỏ qua */ } }
      const left = h ? Math.max(0, h.skillCd[sk.id] || 0) : 0;
      rows.push(row('Hồi chiêu', `${+cd.toFixed(1)} giây · ${a.mana} năng lượng${left > 0 ? ` · <span class="no">còn ${Math.ceil(left)}s</span>` : ''}`));
    }
    const needOpen = COSTS.unlockReq[i];
    if (!lv) rows.push(row('Mở khóa', `tướng cấp ${needOpen}${h ? (hl >= needOpen ? ' ✓' : ` (đang ${hl})`) : ''}`, h ? (hl >= needOpen ? 'ok' : 'no') : ''));
    else if (lv < max) { const rq = skillReqLevel(i, lv + 1); rows.push(row(`Lên cấp ${lv + 1}`, `tướng cấp ${rq}${hl >= rq ? ' ✓' : ` (đang ${hl})`}`, hl >= rq ? 'ok' : 'no')); }
    let cost;
    if (lv >= max) cost = 'Đã tối đa';
    else if (!lv) cost = h ? (unlockCost(h, i) ? `${unlockCost(h, i)} vàng` : 'Miễn phí') : (COSTS.unlock[i] ? `${COSTS.unlock[i]} vàng` : 'Có sẵn');
    else cost = h.from ? `${COSTS.skillGold(i, lv)} vàng` : `1 điểm kỹ năng (còn ${h.skillPts || 0})`;
    rows.push(row(lv ? 'Giá nâng' : 'Giá mở', cost));
    if (!h) rows.push(row('Các cấp', Array.from({ length: max }, (_, k) => `${k + 1}: cấp ${skillReqLevel(i, k + 1)}`).join(' · ')));
    const kind = i === 3 ? 'Tối thượng' : a ? 'Chủ động' : 'Nội tại (luôn có hiệu lực)';
    const hint = !deck ? '' : mode === 'press' ? 'Thả tay để đóng · chạm nhanh để nâng' : 'Bấm để nâng / mở khóa';
    return `<div class="st-h">${svgI(skillIcon(type, i))}<div><b>${SKILL_KEYS[i]} · ${esc(sk.name)}</b><small>${kind} · cấp ${lv}/${max}</small></div></div>
      <p>${esc(sk.info(skillN(hl)))}</p><small class="st-n">Số liệu ở cấp tướng ${hl}, hiệu lực 100% · mỗi cấp kỹ năng +25%</small>
      <div class="st-rows">${rows.join('')}</div>${hint ? `<small class="st-hint">${hint}</small>` : ''}`;
  }
  // v182: dòng vai trò + cộng hưởng đang bật trong bảng chỉ số tướng
  roleLine(h) {
    const rs = heroRoles(h.type), tiers = this.game.vtTiers || {}, cnt = roleCounts(this.game.heroes.filter((x) => x && !x.dead));
    if (!rs.length) return '';
    const syn = ROLE_KEYS.filter((r) => tiers[r] && (ROLE_SYN[r].all || rs.includes(r))).map((r) => `<span style="color:${ROLES[r].color}">${roleIcon(r, 11)}${ROLE_SYN[r].t[tiers[r] - 1]}</span>`).join(' ');
    return `<div class="hs-vt">${roleChip(h.type)}<small>${rs.map((r) => `${ROLES[r].name} ${cnt[r] || 0}/${(cnt[r] || 0) >= 2 ? 4 : 2}`).join(' · ')}</small>${syn ? `<div class="hs-syn">${syn}</div>` : ''}</div>`;
  }
  renderRoster() {
    const t = this.rosterSel;
    const d = HEROES[t];
    const all = [...BASIC_HEROES, ...LEGEND_HEROES];
    // v182: lọc theo vai trò (vai chính trước, vai phụ sau)
    const vf = ROLES[this.rosterRole] ? this.rosterRole : '';
    const shown = vf ? [...all.filter((k) => heroRole(k) === vf), ...all.filter((k) => heroRoles(k)[1] === vf)] : all;
    if (vf && !shown.includes(t)) return (this.rosterSel = shown[0], this.renderRoster());   // tướng đang xem không thuộc bộ lọc → tướng đầu danh sách
    // pixel art: tướng có sprite pixel → vẽ cả người lên canvas (drawHeroPortrait full) thay ảnh lớn
    const splash = !(typeof pxEntry === 'function' && pxEntry('tuong', t)) && assetUrl([`anh-lon_${heroSlug(t)}.png`, `heroes/hero_${HERO_CODE[t]}_A.png`]);
    const n = skillN(1);
    const oc = this.openCount(), own = this.heroOpen(t), oCost = OWN_COST[heroTier(t)], kho = this.save.kho || 0;
    // giữ vị trí cuộn danh sách tướng / bảng chi tiết khi chọn tướng khác (trước đây nhảy về đầu)
    const keep = ['.ro-grid', '.ro-det'].map((q) => [q, ($('#roster').querySelector(q) || {}).scrollTop || 0]);
    $('#roster').innerHTML = `<div class="screen" style="z-index:auto">
      <div class="scr-head metal"><button class="xbtn metal" data-act="ro-back" aria-label="Quay lại">${ICON.back}</button><h1 class="ttl">Anh Hùng Văn Lang</h1>
        <span class="chip dark ro-cnt" title="${BASIC_HEROES.length} Thường · ${LEGEND_HEROES.filter((x) => HEROES[x].legend === 'epic').length} Sử thi · ${LEGEND_HEROES.filter((x) => HEROES[x].legend === 'legendary').length} Huyền thoại">Đã mở <b>${oc.n}/${oc.all}</b></span><div class="sp"></div>
        <span class="chip kho ro-kho">Ngân khố ${bac()} ${fmt(this.save.kho || 0)}</span>${this.rosterInGame ? "" : `<button class="btn metal title" data-act="ro-temple">Đền Anh Hùng</button>`}</div>
      <div class="scr-body">
        <div class="ro-grid"><div class="rl-filter">${roleFilter(vf, 'ro-role')}</div>${shown.map((k) => {
          const h = HEROES[k];
          const rk = vf || heroRole(k);
          const lock = !this.heroOpen(k), c = OWN_COST[heroTier(k)];
          return `<button class="ro-card ${h.legend || 'common'} ${k === t ? 'on' : ''} ${lock ? 'lock' : ''} ${lock && kho >= c ? 'can' : ''}" data-act="ro-sel" data-type="${k}">${lock ? `<span class="ro-lock">${UIE.lock()}</span><span class="ro-price">${bac(1)}${fmt(c)}</span>` : ''}
            <span class="tag el" style="color:${ELEMENTS[h.el].color}">${elIcon(h.el, 11)}${ELEMENTS[h.el].name}</span>${rk ? `<span class="tag rl ${vf && heroRole(k) !== vf ? 'sub' : ''}" title="${ROLES[rk].name}${heroRole(k) !== rk ? ' (phụ)' : ''}">${roleIcon(rk, 14)}</span>` : ''}
            <img src="${heroImgUrl(k)}" alt=""><span class="nm">${h.name}</span></button>`;
        }).join('')}</div>
        <div class="panel metal ro-det">
          <div class="ro-top">
            <div class="ro-pic inset ${d.legend || 'common'}">${splash ? `<img src="${splash}" alt="">` : '<canvas id="ro-cv" width="300" height="300"></canvas>'}</div>
            <div style="display:flex;flex-direction:column;gap:5px;min-width:0">
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><span class="ttl" style="font-size:26px;line-height:1">${d.name}</span>
                ${own ? `<span class="chip ok">${UIE.done()} Đã mở</span>${d.legend && LEGACY[t] ? `<button class="btn btn-gold" style="height:32px;padding:0 12px;font-size:14px" data-act="lg-open" data-type="${t}">⚜ Thần Khí · ${this.legacyPts(t)}/${LEGACY_MAX * 3}</button>` : ''}`
                  : `<button class="btn btn-gold ro-open" style="height:32px;padding:0 12px;font-size:14px" data-act="ro-buy" data-type="${t}" ${kho < oCost ? 'disabled' : ''}>${UIE.lock()} Mở khoá · ${bac()} ${fmt(oCost)}</button>${kho < oCost ? `<small class="ro-need">còn thiếu ${bac(1)} ${fmt(oCost - kho)}</small>` : ''}`}</div>
              <div class="note" style="font-style:italic">${esc(d.title)}</div>
              ${own ? '' : `<div class="tipbox inset ro-earn"><b>${d.legend ? 'Mở khoá để hợp thể ra trong trận' : 'Mở khoá để ra trong chợ tướng khi chơi'}.</b> Kiếm Ngân khố ở <b>Vô tận</b>: ${PREP.endWave} mỗi đợt · mốc 10 đợt +${PREP.endlessMilestone} · boss +${PREP.endlessBoss} · kỷ lục mới +${PREP.recordWave}/đợt · Khó ×1,5
                <div class="ro-qd">Nhiệm vụ ngày: ${this.questLine()}</div></div>`}
              ${own ? `<div class="ro-tv"><span>${ic('tu-vi')}Tu Vi ${tuviLevel((this.save.tuvi || {})[t] || 0)} · ${tuviRank((this.save.tuvi || {})[t] || 0)}</span>
                ${d.legend === 'legendary' ? `<button class="btn metal" data-act="ro-runes" data-type="${t}">${emoArt('🔯')} Ấn Phù${this.runePtsLeft(t) > 0 ? ` <b class="rn-dot">${this.runePtsLeft(t)}</b>` : ''}</button>` : ''}</div>` : ''}
              <div class="bt-info" style="padding:0;background:none;border:0;box-shadow:none"><div class="tags">
                <span style="background:#1A1208;color:${ELEMENTS[d.el].color};display:inline-flex;align-items:center;gap:3px">${elIcon(d.el, 13)} Hành ${ELEMENTS[d.el].name} · ${ELEM_TRAIT[d.el].name}</span>
                <span style="background:#1A1208;color:#E8D8B0">${ELEM_TRAIT[d.el].fx}</span>
                <span style="background:#3A2410;color:${d.legend ? RARITY[d.legend].color : '#C8BFA8'}">${d.legend ? RARITY[d.legend].name : 'Cơ bản'}</span>
                <span style="background:#2A1810;color:#FFB08A">${d.dmgType === 'magic' ? 'Phép' : 'Vật lý'} · ${d.attack === 'melee' ? 'Cận chiến' : 'Đánh xa'}</span>
                ${ROLES[heroRole(t)] && ROLES[heroRole(t)].name === d.role ? '' : `<span style="background:#1A1610;color:#C8BFA8">${d.role}</span>`}</div>
                <div class="tags rl-tags">${roleChip(t)}</div></div>
              <div class="kvt inset" style="font-size:12px">${d.legend
                ? `<div><span>Ghép từ</span><b style="text-align:right">${ascendSources(t).map((x) => HEROES[x].name).join(' + ')}</b></div>
                  <div><span>Cần</span><b style="color:#FFD66B">${d.legend === 'epic' ? `2 tướng ${'★'.repeat(COSTS.ascendTier)} · kỹ năng tối đa` : `Thần tinh ${'★'.repeat(COSTS.ascendTier2)} · kỹ năng tối đa`} · ${COSTS.ascend[d.legend]} vàng</b></div>`
                : `<div><span>Có từ</span><b style="color:#FFD66B">Chợ tướng ★</b></div>`}
                <div><span>Tầm · Tốc đánh</span><b>${d.base.range} · ${d.base.cooldown}s</b></div></div>
              ${d.trait ? `<div class="tipbox inset" style="font-size:12px">★ <b>${d.trait.name}:</b> ${esc(d.trait.desc)}</div>` : ''}
              ${secretLine(this.game, 'h.' + t)}
            </div></div>
          <div class="ro-sk">${d.skills.map((sk, i) => `<div class="inset" data-skr="${t}:${i}">${svgI(skillIcon(t, i))}<b style="color:#F2D27A">${SKILL_KEYS[i]} · ${sk.name}</b><span style="color:#C8BFA8;font-weight:500">${esc(sk.info(n))}</span></div>`).join('')}</div>
          ${this.evolveTree(t)}
        </div></div></div>`;
    for (const [q, y] of keep) { const el = $('#roster').querySelector(q); if (el && q === '.ro-grid') el.scrollTop = y; }
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
      }).join('')}</div></div>`).join('')}</div></div>`;
  }

  // ============================================================
  //  SÍNH LỄ, KẾT QUẢ
  // ============================================================
  showReward(ev) {
    this.rewardOpts = ev.options;
    this.rewardId = ev.id;
    this.rewardBoss = ev.boss;
    this.closeScreen();
    const g = this.game;
    // chơi đơn: bảng mở thì dừng hẳn trận (đổi màn + nghỉ 10 giây bắt đầu sau khi đóng bảng — pickReward)
    if (!COOP.on && !g.co && $('#reward').hidden) { this.rewardWasRunning = g.running; g.running = false; }
    const flood = false;      // v36: bỏ nước dâng ngập ô
    const th = themeOf(g.level, g.endless && g.wave > g.levelWaves);   // v163: lời ban thưởng theo chương
    const gift = ev.options[0], jar = ev.options[1], misc = ev.options[2];
    const art = { voi_chin_nga: 'voi', ga_chin_cua: 'ga', ngua_hong_mao: 'ngua' }[gift.id];
    const it = ITEMS[gift.id];
    // v181: sính lễ ngẫu nhiên — hiện rõ ảnh + tên + độ hiếm sính lễ (và tỉ lệ ra ở mốc này)
    const sl = SINH_LE[gift.id], tier = SL_TIER[sl ? sl.tier : 'thuong'];
    const ws = sinhLeWeights({ big: gift.big }), pct = Math.round(100 * ws[gift.id] / Object.values(ws).reduce((a, b) => a + b, 0));
    const giftArt = (art && sceneArt(art)) || itemIcon(gift.id);
    const jit = ITEMS[jar.id];
    $('#reward').innerHTML = `<div class="screen" style="z-index:auto">
      <div class="scr-head metal"><h1 class="ttl">${th.rewardHead || 'Chọn phần thưởng'}</h1><span class="chip dark">Đợt ${g.wave}</span>
        <span class="chip ok">${UIE.done()} Đã hạ ${ENEMIES[ev.boss].name}</span><span class="chip goldc">Chọn 1 trong 3</span>${gift.big ? '<span class="chip sl-big">★ Mốc lớn: sính lễ hiếm dễ ra hơn</span>' : ''}<div class="sp"></div>
        <div class="goldbox inset">${coin()}${fmt(g.gold)}</div></div>
      <div class="sl-title">${th.reward || 'Phần thưởng hạ boss'}</div>
      <div class="sl-cards">
        <div class="sl-card gift sl-${sl ? sl.tier : 'thuong'}"><div class="sl-well${art ? '' : ' sl-icon'}">${svgI(giftArt)}<span class="sl-tag" style="left:6px;background:#0D0B08;border:1px solid #8C6A2E;color:#F2E6C8">SÍNH LỄ</span><span class="sl-tag sl-tier" style="right:6px;background:${tier.bg};border:1px solid ${tier.color};color:${tier.color}">${tier.name}</span></div>
          <div class="sl-name">${it.name}</div><div class="sl-rar"><span style="color:${tier.color}">● Sính lễ ${tier.name}</span> · <span class="c-legendary">Huyền thoại</span> · ngẫu nhiên ~${pct}%</div><div class="sl-desc">${esc(it.desc)}${statLine(it.stats) ? `<br><b>${statLine(it.stats)}</b>` : ''}</div>
          <button class="sl-pick btn-gold" data-act="reward" data-i="0">Chọn</button></div>
        <div class="sl-card jar"><div class="sl-well">${svgI(sceneArt('huvua'))}<span class="sl-tag" style="left:6px;background:#0D0B08;border:1px solid #8C6A2E;color:#F2E6C8">HŨ BÁU</span><span class="sl-tag" style="right:6px;background:#A86CE0;color:#1A0A28">${(jar.ids || []).length} món</span></div>
          <div class="sl-name">Hũ Vua Hùng · ${(jar.ids || [jar.id]).length} món</div><div class="sl-desc jar-list">${(jar.ids || [jar.id]).map((id) => {
            const best = g.bestHeroFor(makeItem(id));
            return `<div><span class="c-${ITEMS[id].rarity}">${ITEMS[id].name}</span>${best ? `<small>▲${best.gain} ${HEROES[best.hero.type].name}</small>` : ''}</div>`;
          }).join('')}</div>
          <button class="sl-pick metal" style="color:#F2D27A" data-act="reward" data-i="1">Chọn</button></div>
        <div class="sl-card misc"><div class="sl-well">${svgI(sceneArt('kholua'))}<span class="sl-tag" style="left:6px;background:#0D0B08;border:1px solid #8C6A2E;color:#F2E6C8">${misc.kind === 'treasure' ? 'KHO LÚA' : 'HỘI LÀNG'}</span><span class="sl-tag" style="right:6px;background:#12301A;border:1px solid #3EDC4E;color:#6AE06A">Ngẫu nhiên</span></div>
          <div class="sl-name">${misc.title}</div>
          <div class="sl-desc">${misc.kind === 'treasure' ? `<span style="font-size:17px;font-weight:800;color:#FFD66B">${coin()} +${misc.gold} vàng</span> <span style="font-size:17px;font-weight:800;color:#FF8A6A">${ic('mang')}+${misc.lives} mạng</span>`
            : '<span class="g">Mọi tướng trên sân +2 cấp</span> (kèm 2 điểm kỹ năng)'}<br>Lần khác: ${misc.kind === 'treasure' ? '<span class="g">mọi tướng +2 cấp</span>' : '<span class="g">vàng và +3 mạng</span>'}</div>
          <button class="sl-pick metal" style="color:#F2D27A" data-act="reward" data-i="2">Chọn</button></div>
      </div>
      ${flood ? `<div class="sl-warn"><span style="font-size:20px">${ic('nuoc-dang')}</span><span style="flex:1"><b>Thủy Tinh dâng nước:</b> sau đợt này, các ô bậc <b>${TIER_NAMES[g.water]}</b> sẽ ngập và tướng đứng đó bị sa lầy. Dùng <span class="m">Mọc Núi</span> để cứu ô quan trọng.</span></div>` : ''}
    </div>`;
    $('#reward').hidden = false;
    this.guard('#reward');
  }

  // vùng đất mới (vô tận theo màn): banner tên ải + dạng đường, mô tả đường, nhắc kéo đổi ô
  // gộp mọi tin đổi màn thành 1 banner + 1 thông báo (sau banner); ẩn bảng "bộ quái mới" (đã ghi quân trong thông báo)
  stageBanner(ev) {
    const g = this.game, sh = ev.stage.shape && PATH_SHAPES[ev.stage.shape];
    const key = rosterKeyOf(rosterFor(g.wave + 1, g.level, g.stLv()));
    this.rosterKey = key; this.rosterLevel = g.level;
    $('#roster-hint').hidden = true;
    const extra = ev.lost ? ` · ${ev.lost} tướng hết chỗ: hoàn ${fmt(ev.refund)} vàng` : ev.moved ? ` · ${ev.moved} tướng dời sang ô gần nhất (kéo để đổi ô)` : '';
    const msg = `<b>${esc(sh ? sh.name : 'Đường ' + LEVELS[ev.stage.lv].name)}</b>${sh ? ' · ' + esc(sh.desc) : ''}${key && ROSTER_NAMES[key] ? ` · Quân: <b>${esc(ROSTER_NAMES[key])}</b>` : ''}${extra}`;
    this.queueBanner([`Màn ${ev.stage.k + 1} · vùng đất mới`, LEVELS[ev.stage.lv].name], () => {
      const wait = Math.max(0, (this.bannerEnd || 0) - performance.now()) + 50;
      setTimeout(() => this.toast(msg, '#9EDDF2'), wait);
    });
  }

  pickReward(i) {
    const o = this.rewardOpts[i];
    if (COOP.on) {
      $('#reward').hidden = true;
      COOP.issue('reward', [i, this.rewardId]);
      return;
    }
    const g = this.game;
    g.claimReward(o);
    $('#reward').hidden = true;
    this.rewardToast(o);
    if (!g.over && this.rewardWasRunning != null) g.running = this.rewardWasRunning;
    this.rewardWasRunning = null;
    g.holdStage = false;
    g.stageTick();          // đợt boss đã xong khi bảng mở → sang màn mới ngay bây giờ (banner + nghỉ 10 giây)
    this.handleEvents();
    if (!g.waveActive) this.saveRun();
  }
  rewardToast(o) {
    if (o.kind === 'item' && o.ids) this.toast(`Nhận ${o.ids.length} món từ Hũ Vua Hùng · bấm ≡ → Mặc đồ cả đội`, '#C8A0F0');
    else if (o.kind === 'item' && o.sinhLe) this.toast(`Nhận sính lễ ${ITEMS[o.id].name} (${SL_TIER[SINH_LE[o.id].tier].name})! Mở Túi đồ để đeo cho tướng`, SL_TIER[SINH_LE[o.id].tier].color);
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
    if (g.endless && g.wave > g.levelWaves) this.submitScores();   // rời trận vô tận giữa chừng vẫn ghi điểm
  }

  // v166: chỉ còn Vô tận (đơn / nhóm) — trận kết thúc khi hết mạng (không còn thắng ải)
  finishLevel() {
    const g = this.game;
    const s = this.save;
    const lv = g.level;
    const coop = !!g.co;      // v141: chơi nhóm — nhận Ngân khố + Tu Vi như vô tận (không ghi kỷ lục / xếp hạng)
    s.bestEndless = s.bestEndless || {};
    const prevBest = s.bestEndless[lv] || 0;
    if (!coop) s.bestEndless[lv] = Math.max(prevBest, g.wave);
    const newBest = !coop && g.wave > prevBest;
    // Ngân khố cuối trận theo số đợt đã qua (mốc 10 đợt / boss đã cộng giữa trận — g.khoRun)
    const khoGain = Math.round(PREP.endWave * Math.max(0, g.wave - 1) * (g.hard ? 1.5 : 1));
    // v103 → v166: trận đầu tiên trong ngày giữ được từ đợt PREP.dailyWave trở lên thưởng thêm
    const today = new Date().toISOString().slice(0, 10);
    const daily = g.wave > PREP.dailyWave && s.dailyWin !== today ? PREP.dailyWin : 0;
    if (daily) s.dailyWin = today;
    // v182: kỷ lục mới của bản đồ: +recordWave mỗi đợt vượt kỷ lục cũ (tính theo đợt đã qua; chơi nhóm không tính)
    const recGain = newBest ? Math.round(PREP.recordWave * (g.wave - Math.max(prevBest, 1)) * (g.hard ? 1.5 : 1)) : 0;
    s.kho = (s.kho || 0) + khoGain + daily + recGain;
    const qDone = this.questAdd(g.wave - 1, g.bossesKilled || 0);      // v182: nhiệm vụ ngày (đã cộng Ngân khố)
    const khoAll = (g.khoRun || 0) + khoGain + daily + recGain + qDone.reduce((a, x) => a + x.kho, 0);
    // Tu Vi đủ 100% khi đã qua đợt boss đầu (dưới đó 60% như bỏ trận)
    const fullTv = g.wave > PREP.dailyWave;
    const tv = this.bankTuvi(fullTv ? 1 : TUVI_LOSE);
    if (!coop) { this.submitScores(); this.clearRun(); }
    this.bankStats();
    const mate = coop ? g.co.names[1 - COOP.me] : '';
    if (coop) { COOP.end(false); this.coopDone = true; this.coopSaid = false; }
    this.closeScreen();
    $('#reward').hidden = true;
    const rows = `<div><span>⚑ Đợt</span><b>${g.wave}</b></div>
      <div><span>${ic('mang')}Mạng còn</span><b style="color:#FF8A6A">${g.lives}/${Math.max(g.maxLives || CONFIG.startLives, g.lives)}</b></div>
      <div><span>✕ Quái đã hạ</span><b>${fmt(g.stats.kills)}</b></div>
      <div><span>${coin()} Vàng kiếm trong trận</span><b style="color:#FFD66B">+${fmt(g.stats.goldEarned)}</b></div>
      <div><span>Tướng trên sân</span><b>${g.heroes.filter(Boolean).length}</b></div>
      ${g.khoRun ? `<div><span>${UIE.endless()} Ngân khố giữa trận (mốc đợt / boss)</span><b style="color:#E4ECF4">${bac(1)} +${fmt(g.khoRun)}</b></div>` : ''}
      <div><span>${ic('bac')}Ngân khố cuối trận (${PREP.endWave} mỗi đợt${g.hard ? ' · Khó ×1,5' : ''})</span><b style="color:#E4ECF4">${bac(1)} +${fmt(khoGain)}</b></div>
      ${recGain ? `<div><span>★ Kỷ lục mới (+${PREP.recordWave} mỗi đợt vượt kỷ lục cũ)</span><b style="color:#FFE08A">${bac(1)} +${fmt(recGain)}</b></div>` : ''}
      ${daily ? `<div><span>☀ Nhiệm vụ ngày: trận đầu qua đợt ${PREP.dailyWave}</span><b style="color:#FFE08A">${bac(1)} +${fmt(daily)}</b></div>` : ''}
      ${qDone.map((x) => `<div><span>☀ Nhiệm vụ ngày: ${esc(x.name)}</span><b style="color:#FFE08A">${bac(1)} +${fmt(x.kho)}</b></div>`).join('')}
      <div class="res-qd"><span>Nhiệm vụ ngày</span><b>${this.questLine()}</b></div>
      ${this.unlockHint()}
      ${tv.rows.length ? `<div><span>${ic('tu-vi')}Tu Vi${fullTv ? '' : ' (60% · chưa qua đợt ' + PREP.dailyWave + ')'}</span><b style="color:#C8A0F0">${tv.rows.join(' · ')}</b></div>` : ''}
      ${tv.up.map((u) => `<div><span></span><b style="color:#FFD66B">${u}</b></div>`).join('')}`;
    const name = `${coop ? '🤝 Cùng giữ thành · ' : UIE.endless() + ' Vô tận · '}${LEVELS[lv].name}${coop ? ` · cùng ${esc(mate)}` : ''}`;
    // v163: chữ, tranh, màu theo chương (trước gắn cứng Sơn Tinh – Thủy Tinh). v166: mọi trận là vô tận → dùng chủ đề chương của bản đồ
    const th = themeOf(lv);
    const art = (w) => { const u = resultImg(th.id, w); return u ? `<img src="${u}" alt="">` : th.id === 'sontinh' ? sceneArt(w ? 'win' : 'lose') : resultScene(lv, w); };
    const R = rosterOfLevel(lv);
    const air = R && R.air && ENEMIES[R.air], champ = R && R.champ && ENEMIES[R.champ];
    const tip2 = air ? `Đặt tướng <b>đánh xa</b> cho đợt <b style="color:${th.hi}">${air.name}</b> (quái bay).`
      : champ ? `Dồn sát thương chặn <b style="color:${th.hi}">${champ.name}</b> ở các đợt quái khỏe (5, 15, 25…).`
        : 'Mỗi 10 đợt quân địch đổi sang chương khác: mang cả tướng <b>đánh xa</b> (quái bay) lẫn tướng <b>vật lý</b> (quái kháng phép).';
    const endBest = Math.max(g.wave, s.bestEndless[lv] || 0);
    const html = `<div class="screen" style="z-index:auto">
      <div class="scr-head metal" style="border-color:#C8401E"><h1 class="ttl">${name}</h1><span class="chip run">${th.lost}</span><div class="sp"></div></div>
      <div class="res-body" style="--ch-e:${th.edge};--ch-a:${th.bar[1]};--ch-t:${th.hi}">
        <div class="res-art" style="border-color:${th.edge}" data-ch="${th.id}">${svgI(art(false))}<span class="tg2" style="border-color:${th.bar[1]};color:${th.hi}">${th.loseTag.toUpperCase()}</span></div>
        <div class="res-main">
          <div class="res-title lose${th.loseTitle.length > 18 ? ' long' : ''}">${th.id === 'sontinh' ? floodIc() : `<span class="res-ic">${emoArt(th.ic)}</span> `}${th.loseTitle}</div>
          <div style="display:flex;gap:12px;align-items:center"><div class="inset" style="padding:8px 16px;border-radius:6px;font-size:15px;white-space:nowrap">Giữ được tới đợt <b style="font-family:var(--title);font-size:34px;color:${th.hi}">${g.wave}</b></div>
            <div style="flex:1">${newBest ? '<div class="chip ok" style="display:inline-block">★ Kỷ lục mới!</div>' : `<div class="inset" style="height:12px;border-radius:4px;overflow:hidden"><i style="display:block;height:100%;width:${Math.min(1, g.wave / (endBest || 1)) * 100}%;background:linear-gradient(90deg,${th.bar[0]},${th.bar[1]})"></i></div>`}
            <div class="note" style="margin-top:4px">${coop ? 'Chơi nhóm' : `Kỷ lục bản đồ này: đợt ${s.bestEndless[lv]}`}</div></div>
            <div class="res-khobox inset"><small>Ngân khố cả trận</small><b>${bac()} +${fmt(khoAll)}</b><small>còn ${fmt(s.kho)} · đã mở ${this.openCount().n}/${this.openCount().all} tướng</small></div></div>
          <div class="res-table inset">${rows}</div>
          <div class="res-tips"><div class="h">${UIE.tip()} MẸO LẦN SAU</div>
            <div class="t"><i>1</i><span><b>Ghép</b> 2 tướng cùng loại cùng sao và <b>hợp thể</b> đúng cặp để có tướng thần mạnh hơn hẳn.</span></div>
            <div class="t"><i>2</i><span>${tip2}</span></div>
            <div class="t"><i>3</i><span>Sau mỗi boss sang <b>vùng đất mới</b> với quân riêng: xem bảng <b>Bộ quái mới</b> để đổi tướng khắc chế.</span></div></div>
          <div class="res-btns">
            <button class="btn-gold" data-act="restart">${coop ? '🤝 Chơi nhóm tiếp' : UIE.redo() + ' Chơi lại'}</button>
            ${coop ? '<button class="metal" style="color:#F2D27A" data-act="to-map">Phòng</button>' : ''}
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
    if (['reward', 'restart', 'to-map', 'to-menu', 'res-heroes'].includes(d.act)
      && (!$('#result').hidden || !$('#reward').hidden) && performance.now() < (this.guardUntil || 0)) return;
    const sc = this.screen;
    const h = g.heroes[this.sel];
    const fail = (r) => { if (r !== true && typeof r === 'string') this.toast(r, '#E25A3A'); return r === true; };
    // v141: thao tác lên trận đi qua this.cmd (chơi nhóm: gửi lệnh, kết quả về sau độ trễ)
    const C = (name, args, then) => this.cmd(name, args, then);
    const rs = () => { if (this.screen) this.renderScreen(true); };
    if (d.act.startsWith('coop-')) { this.coopAct(d); return; }
    if (d.act.startsWith('chat-')) { this.chatAct(d); return; }
    switch (d.act) {
      // ----- menu, chọn bản đồ, cài đặt
      case 'cp-back': this.showMenu(); break;
      case 'cp-sel': this.cpSel = +d.i; this.renderCampaign(); break;
      case 'cp-ch': { const c = CHAPTERS[+d.i]; this.cpSel = c.from; this.renderCampaign(); break; }
      case 'diff': this.save.settings.hard = d.k === '1'; writeSave(this.save); this.renderCampaign(); break;
      case 'cp-go': this.save.last = this.cpSel; this.playLevel(this.cpSel); break;
      case 'mode-pick': $('#modes').hidden = true; if (d.k === 'coop') { this.showCoop(); break; } this.startLevel(0); break;   // claude/duong-di-moi: Vô tận không chọn bản đồ — vào màn đầu luôn
      case 'prep-diff': this.save.settings.hard = !this.save.settings.hard; writeSave(this.save); g.hard = this.save.settings.hard; this.showPrep(); break;
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
        // v189 (L11): máy chủ không trả lời → hết "Đang xử lý…" sau 20 giây, báo lỗi để bấm lại (không kẹt)
        clearTimeout(this.loginBusyT);
        this.loginBusyT = setTimeout(() => { if (!this.loginBusy) return; this.loginBusy = false; this.loginErr = 'Máy chủ không phản hồi — kiểm tra mạng rồi bấm lại'; if (!$('#login').hidden) this.showLogin(this.loginFromMenu); }, 20000);
        CLOUD.email(m, this.loginEmail, pass, name).then((msg) => { clearTimeout(this.loginBusyT); this.loginBusy = false; this.loginErr = msg; if (name) { this.save.nick = name; writeSave(this.save); }
          if (CLOUD.signedIn && !this.loginFromMenu) { $('#login').hidden = true; this.showMenu(); } else this.showLogin(this.loginFromMenu); })
          .catch((e) => { clearTimeout(this.loginBusyT); this.loginBusy = false; this.loginErr = e.message; this.showLogin(this.loginFromMenu); });
        break;
      }
      case 'prep-buy': this.prepBuy(d.id); break;
      case 'rank-tab': this.showRanks(d.k); break;
      case 'rank-nick': {
        const box = $('#ranks .rk-body');
        box.insertAdjacentHTML('afterbegin', `<div class="rk-nick inset"><span>Tên trên bảng xếp hạng:</span><input id="rk-nick-in" maxlength="20" placeholder="Đặt biệt danh" value="${esc(this.nickName())}"><button class="btn btn-gold" data-act="rank-nick-ok" style="height:32px;padding:0 12px">Lưu</button></div>`);
        break;
      }
      case 'rank-nick-ok': {
        const v = ($('#rk-nick-in').value || '').trim().slice(0, 20);
        this.save.nick = v || null; writeSave(this.save); this.showRanks(this.ranksBoard); break;
      }
      case 'prep-hero': this.prepHero(d.id); break;
      case 'prep-go': $('#prep').hidden = true; this.saveRun();
        // v189 (L05): mục tiêu bản đồ báo khi vào trận (trước đây hiện lúc mở màn Chuẩn bị, đè lên "Tướng khắc chế")
        this.toast(`Vô tận · ${this.game.placeName()}: ${themeOf(this.game.level).goal} càng lâu càng tốt — sau mỗi boss sang vùng đất mới`, '#F2D27A'); break;
      case 'prep-forge': {
        // v78: Lò đúc trước trận trả bằng Ngân khố (đổi tạm vàng trong trận ↔ Ngân khố khi mở / đóng)
        $('#prep').hidden = true; this.prepForge = true; KHO_MODE = true;
        this.prepGold = g.gold; g.gold = this.save.kho || 0;
        if (!this.prepShopRolled) { g.rollShop(true); this.prepShopRolled = true; }
        this.openScreen('forge');
        break;
      }
      case 'cloud-sync': CLOUD.push(this.save, true); break;
      case 'cloud-out': case 'cloud-out-no':   // v165: bấm Đăng xuất → hỏi lại ngay tại chỗ
        this.outArm = d.act === 'cloud-out';
        if (!$('#settings').hidden) this.renderSettingsCloud();
        if (!$('#login').hidden) this.showLogin(this.loginFromMenu);
        this.renderPlPop();
        break;
      case 'cloud-out-ok': {
        this.outArm = false; this.plPop = false; this.renderPlPop(); this.loginFromMenu = false;
        // tiến trình trên máy giữ nguyên; đăng nhập lại thì kéo bản trên mây về (CLOUD.pull)
        Promise.resolve(CLOUD.signOut()).catch(() => {}).then(() => { if (!CLOUD.signedIn) { $('#settings').hidden = true; this.showLogin(false); } });
        break;
      }
      case 'pl-login': this.plPop = false; this.renderPlPop(); this.showLogin(true); break;
      case 'pl-rename': {
        const v = (($('#pl-nick') || {}).value || '').trim().slice(0, 20);
        if (!v) { this.plMsg = 'Tên không được để trống'; this.renderPlPop(); break; }
        this.save.nick = v; writeSave(this.save);
        if (typeof CLOUD !== 'undefined' && CLOUD.user && !CLOUD.user.isAnonymous && CLOUD.user.updateProfile) CLOUD.user.updateProfile({ displayName: v }).catch(() => {});
        this.showMenu(); this.plPop = true; this.plMsg = 'Đã đổi tên thành ' + v; this.renderPlPop();
        break;
      }
      case 'fb-kind': this.fbRead(); this.fb.kind = d.k; this.fb.err = ''; this.renderFeedback(); break;
      case 'fb-shot': this.fbRead(); this.fb.useShot = !this.fb.useShot; this.renderFeedback(); break;
      case 'fb-close': this.fbClose(); break;
      case 'fb-send': this.fbSend(); break;
      case 'fba-open': this.showFbAdmin(); break;
      case 'fba-verify': {
        const u = CLOUD.user;
        CLOUD.verifyAdminEmail(this.fbaMailSent).then((v) => {
          if (this.fbaMailSent && !v) this.toast('Email chưa được xác minh — mở thư trong hộp thư rồi bấm lại', '#F2D27A');
          else if (!this.fbaMailSent) { this.fbaMailSent = true; this.toast('Đã gửi thư xác minh tới ' + esc(u.email) + '. Xác minh xong bấm lại nút này', '#6AE06A'); }
          this.renderSettings();
        }, (e) => this.toast(esc(e.message), '#FF7A5C'));
        break;
      }
      case 'fba-close': case 'fba-reload': case 'fba-more': case 'fba-kind': case 'fba-stf': case 'fba-clear': case 'fba-big': case 'fba-big-x':
      case 'fba-note': case 'fba-note-x': case 'fba-note-ok': case 'fba-del': case 'fba-del-x': case 'fba-del-ok': case 'fba-st':
        this.fbaAct(d); break;
      case 'set-feedback': this.showFeedback(this.settingsInGame ? 'tam-dung' : 'cai-dat'); break;
      case 'pxg-bat': case 'pxg-nap': case 'pxg-go': this.pxGoiAct(d.act); break;
      case 'set-close':
        $('#settings').hidden = true;
        if (this.menuStale) { this.menuStale = false; if (!$('#menu').hidden) this.showMenu(); }
        if (this.settingsInGame && this.pauseWasRunning) g.running = true;
        this.wipeArmed = false;
        break;
      case 'wipe':
        if (!this.wipeArmed) { this.wipeArmed = true; this.renderSettings(); break; }
        this.save = loadSave();
        this.save.last = 0; this.save.best = {}; this.save.bestEndless = {};
        writeSave(this.save);
        this.wipeArmed = false;
        this.toast('Đã xoá kỷ lục', '#E25A3A');
        this.renderSettings();
        break;
      case 'restart': if (this.coopDone) { this.coopDone = false; this.showCoop(); break; } this.startLevel(0); break;   // vô tận luôn bắt đầu ở màn đầu
      case 'to-map': if (this.coopDone) { this.coopDone = false; this.showCoop(); break; } this.showCampaign(g.level); break;
      case 'to-menu': $('#settings').hidden = true; if (g.started) this.bankStats(); this.showMenu(); break;
      case 'res-heroes': if (g.started) this.bankStats(); this.showMenu(); this.showRoster(d.type); break;     // v182: kết quả trận → mở khoá tướng
      case 'ro-role': this.rosterRole = this.rosterRole === d.r ? '' : d.r; this.renderRoster(); break;
      case 'vt-hero': this.toast(`${HEROES[d.type].name}: ${heroRoles(d.type).map((r) => ROLES[r].name).join(' · ')}`, ROLES[heroRole(d.type)].color); break;
      case 'vt-f': sc.role = sc.role === d.r ? '' : d.r; this.renderScreen(true); break;
      case 'ro-sel': {
        this.rosterSel = d.type; this.renderRoster();
        // v147: chạm chân dung trong cây phát triển → cuộn danh sách tới tướng đó
        if (d.ev) { const c = $('#roster').querySelector(`.ro-card[data-type="${d.type}"]`); if (c) c.scrollIntoView({ block: 'nearest' }); }
        break;
      }
      case 'ro-back':
        if (this.rosterInGame && $('#ranks').hidden && $('#treasury').hidden) { this.rosterInGame = false; $('#roster').hidden = true; if (this.rosterWasRunning) g.running = true; this.sig.fuse = ''; break; }
        this.showMenu(); break;
      case 'ro-buy': {
        const t = d.type, c = OWN_COST[heroTier(t)], s = this.save;
        s.owned = s.owned || [];
        if (s.owned.includes(t) || (s.kho || 0) < c) break;
        s.kho -= c; s.owned.push(t); writeSave(s);
        if (this.game.owned && !COOP.on) this.game.owned.add(t);   // chơi nhóm: dùng được từ trận sau
        const oc = this.openCount();
        this.toast(`Đã mở khoá ${HEROES[t].name} (${oc.n}/${oc.all})! ${HEROES[t].legend ? 'Giờ có thể hợp thể ra trong trận' : 'Giờ đã ra trong chợ tướng khi chơi'}`, '#6AE06A');
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
      case 'rn-roster': {
        $('#runes').hidden = true;
        const ig = this.runesInGame; this.runesInGame = false;
        if (ig && this.runesWasRunning) g.running = true;
        this.showRoster(null, ig);
        break;
      }
      case 'ro-runes': this.runesFromRoster = true; this.showRunes(this.rosterInGame, d.type); break;
      case 'ro-temple': location.href = 'den-anh-hung.html'; break;
      case 'reward': this.pickReward(+d.i); break;
      case 'summon': this.pickSummon(d.type); break;
      case 'mk-lock': C('toggleMarketLock', [], () => { this.sig.deck = null; if (this.game.market && this.game.market.lock) this.toast('🔒 Đã khoá chợ: đợt sau giữ nguyên hàng thẻ', '#F2D27A'); }); break;
      case 'mk-reroll': C('rerollMarket', [], (r) => { if (typeof r === 'string') this.toast(r, '#E25A3A'); this.sig.deck = null; }); break;
      case 'auto-merge': C('autoMerge', [], (n) => this.toast(n ? `Đã ghép ${n} lần` : 'Không có cặp nào ghép được', n ? '#F2D27A' : '#E25A3A')); break;
      case 'fuse-strip': {
        const f = FUSION[+d.i]; const pr = g.fusionProgress(f);
        // sáng 2 tướng thành phần trên sân vài giây
        this.fuseFocus = { i: +d.i, until: performance.now() + 6000 };
        this.sel = -1;
        if (pr.p < 1) {
          const why = [[f.a, pr.a], [f.b, pr.b]].map(([type, h]) => (h ? (g.fusionReady(h) === true ? `${HEROES[type].name} ✓` : g.fusionReady(h)) : `chưa có ${HEROES[type].name} trên sân`));
          this.toast(`<b>${HEROES[f.to].name} ${Math.floor(pr.p * 100)}%</b> · ${why.join(' · ')}`, RARITY[HEROES[f.to].legend].color); break; }
        const bs = pr.b.slot;
        C('fuse', [pr.a.slot, bs], (r) => { if (r !== true) this.toast(r, '#E25A3A'); else this.sel = bs; });
        break;
      }
      case 'merge-any': this.mergeAny(); break;
      case 'fuse-with': if (d.why) { if (this.screen) { this.screen.why = d.to; this.renderScreen(true); } else this.toast(d.why, '#E25A3A'); } else this.fuseWith(+d.slot); break;
      case 'legend-open': this.openLegends($('#legends').hidden); break;
      case 'hx-close': this.openLegends(false); break;
      case 'hx-tab': this.lg.tab = d.k; this.lg.why = null; this.renderLegends(); $('#legends .hx-list').scrollTop = 0; break;
      case 'hx-help': this.lg.help = !this.lg.help; this.renderLegends(); break;
      case 'hx-open': $('#legends').hidden = true; this.showRoster(d.t, true); break;     // cho-6-the: công thức chưa mở → tới Anh Hùng
      case 'hx-card': case 'hx-fuse': {
        // chạm thẻ: đánh dấu tướng nguyên liệu trên sân (có ít nhất 1 con thì đóng bảng cho thấy dấu); nút Hợp thể: hợp luôn
        const x = this.fusionState(FUSION[+d.i]);
        this.fuseFocus = { i: x.i, until: performance.now() + 6000 };
        this.sel = -1;
        if (d.act === 'hx-fuse' && x.ready) { this.openLegends(false); this.action({ act: 'fuse-strip', i: x.i }); break; }
        // v181: nút 🔒 → lý do hiện ngay dưới tiêu đề bảng, bảng vẫn mở (không toast đè thẻ / sót sang màn khác)
        if (d.act === 'hx-fuse') { this.fuseFocus = null; this.lg.why = { i: x.i, txt: x.m.filter((m) => !m.ok).map((m) => esc(m.why)).join(' · ') || (x.own ? '' : 'chưa sở hữu') }; this.renderLegends(); break; }
        if (x.m.some((m) => m.h)) this.openLegends(false);
        this.toast(`<b>${HEROES[x.f.to].name}</b> · ${!x.own ? 'chưa sở hữu — mua ở Anh Hùng' : x.m.map((m) => (m.ok ? `${HEROES[m.type].name} ✓` : m.why)).join(' · ')}`, RARITY[HEROES[x.f.to].legend].color);
        break;
      }
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
        else if (d.k === 'feedback') this.showFeedback('tran');
        else this.openScreen(d.k);
        break;
      // ----- bảng điều khiển dưới
      case 'cmd-skill': {
        if (!h) break;
        const i = +d.i;
        const sk = HEROES[h.type].skills[i];
        C(skillLevel(h, i) ? 'upgradeSkill' : 'unlockSkill', [h, i], (r) => {
          if (r === true) this.toast(`<b>${sk.name}</b> cấp ${skillLevel(h, i)} · ${esc(sk.info(skillN(h.level)))}`, '#F2D27A');
          else this.toast(`<b>${sk.name}</b> (cấp ${skillLevel(h, i)}/${SKILL_MAX[i]}): ${r}<br><small>${esc(sk.info(skillN(h.level)))}</small>`, '#C8BFA8');
          this.sig.deck = null;
        });
        break;
      }
      case 'sk-stat-deck': {
        if (!h) break;
        C('spendStat', [h], (r) => {
          if (r !== true) this.toast(`Cộng chỉ số: ${r}. Lên cấp tướng để có điểm`, '#C8BFA8');
          this.sig.deck = null;
        });
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
      case 'levelup': if (h) this.doLevelUp(h); break;
      case 'train': if (h) C('trainHero', [h], fail); break;
      case 'auto-eq-all': {
        C('autoEquipAll', [], (r) => {
          this.toast(r.items ? `Mặc ${r.items} món cho ${r.heroes} tướng (tướng mạnh chọn trước)` : 'Cả đội đã mặc đồ tốt nhất trong túi', r.items ? '#6AE06A' : '#C8BFA8');
          this.sig.deck = null; rs();
        });
        $('#more').hidden = true; $('#drawer').hidden = true;
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
        C('autoUpgradeGear', [], (r) => {
          this.toast(r.n ? `Nâng ${r.n} lần đồ đang mặc · −${fmt(r.spent)} vàng (tướng mạnh trước, chừa vàng triệu hồi)` : 'Chưa nâng được: thiếu vàng hoặc chưa mặc đồ', r.n ? '#6AE06A' : '#C8BFA8');
          this.sig.deck = null; rs();
        });
        $('#more').hidden = true; $('#drawer').hidden = true;
        break;
      }
      case 'temper': C('temper', [+d.uid], (r) => { if (fail(r)) { this.toast('Tôi luyện thành công!', '#FFD66B'); rs(); } }); break;
      case 'reroll': C('reroll', [+d.uid], (r) => { if (fail(r)) { this.toast('Tẩy luyện: đã rút lại dòng phụ', '#A86CE0'); rs(); } }); break;
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
      case 'sk-up': if (h) C('upgradeSkill', [h, +d.i], (r) => { if (fail(r)) rs(); }); break;
      case 'sk-stat': if (h) C('spendStat', [h], (r) => { if (fail(r)) rs(); }); break;
      case 'sk-unlock': if (h) { const i = +d.i, nm = HEROES[h.type].skills[i].name; C('unlockSkill', [h, i], (r) => { if (fail(r)) { this.toast(`Mở khóa [${SKILL_KEYS[i]}] ${nm}!`, '#A86CE0'); rs(); } }); } break;
      case 'sk-level': if (h) { this.doLevelUp(h); this.renderScreen(true); } break;
      // Tiến hoá
      case 'evo-help': this.toast(`Hợp thể: kéo tướng này thả lên tướng nguyên liệu, hoặc bấm <b>Hợp thể</b>. Tướng mới giữ cấp, đồ và <b>nội tại của cả hai</b>; thêm Thần lực (Sử thi ×${ASCEND_POWER.epic}, Huyền thoại ×${ASCEND_POWER.legendary}).`, '#F2D27A'); break;
      case 'evolve': if (h) C('evolve', [h], (r) => { if (fail(r)) rs(); }); break;
      case 'ascend': if (h) C('ascend', [h, d.to], (r) => { if (fail(r)) rs(); }); break;
      // Núi Tản Viên
      case 'soil': C('soilMountain', [], (r) => { if (fail(r)) { this.toast('Bồi đất: núi cao thêm!', '#F2D27A'); rs(); } }); break;
      case 'harvest': {
        C('harvestHerbs', [], (n) => {
          if (n) this.toast(`Hái ${n} Linh Chi: +${n * MOUNTAIN.herbGold} vàng, tướng hồi máu`, '#6AE06A');
          rs();
        });
        break;
      }
      // Lò đúc
      case 'recipe': sc.recipe = d.id; this.renderScreen(true); break;
      case 'craft':
        C('craft', [d.id], (r) => {
          if (r) { this.toast(`Đã đúc ${ITEMS[d.id].name}!`, RARITY[ITEMS[d.id].rarity].color); if (this.screen) this.screen.justCrafted = d.id; }
          else this.toast(g.inventory.length >= CONFIG.bagSize ? 'Túi đầy' : 'Thiếu nguyên liệu hoặc vàng', '#E25A3A');
          rs();
        });
        break;
      case 'shop-sel': sc.shop = d.id; this.renderScreen(true); break;
      case 'sh-tab': sc.shopTab = d.k; this.renderScreen(true); break;
      case 'sh-sel': sc.si = +d.i; this.renderScreen(true); break;
      case 'sh-reroll': C('rerollShop', [], (r) => { if (fail(r)) { if (this.screen) this.screen.si = 0; rs(); } }); break;
      case 'sh-buy':
      case 'sh-buy-eq': {
        const eq = d.act === 'sh-buy-eq' && h;
        C('buyShop', [+d.i], (r) => {
          if (r && r.uid) {
            this.toast(`Đã mua ${ITEMS[r.id].name}`, RARITY[r.rarity].color);
            if (eq) C('equip', [h, r.uid, slotFor(h, r)], (e) => { if (fail(e)) this.toast(`${HEROES[h.type].name} đã mặc ${ITEMS[r.id].name}`, '#6AE06A'); rs(); });
          } else fail(r);
          rs();
        });
        break;
      }
      case 'quick-craft': {
        C('quickCraft', [d.id], (r) => {
          if (r && r.uid) { this.toast(`Đã đúc ${ITEMS[d.id].name}!`, RARITY[ITEMS[d.id].rarity].color); if (this.screen) this.screen.opened = r.uid; } else fail(r);
          rs();
        });
        break;
      }
      case 'buy': {
        C('buy', [d.id], (inst) => {
          if (inst && inst !== true && typeof inst !== 'string') { g.flags.shopOpened = true; this.toast(`Mua ${ITEMS[d.id].name}`, '#F2D27A'); }
          else this.toast(typeof inst === 'string' ? inst : g.inventory.length >= CONFIG.bagSize ? 'Túi đầy' : `Cần ${ITEMS[d.id].price} vàng`, '#E25A3A');
          rs();
        });
        break;
      }
      case 'buy-craft': {
        const r = Object.keys(ITEMS).find((id) => ITEMS[id].recipe && ITEMS[id].recipe.parts.includes(d.id));
        C('buy', [d.id], (inst) => {
          if (inst && typeof inst === 'object' && r && !g.missingParts(r).length) {
            C('craft', [r], (ok) => { if (ok && typeof ok !== 'string') this.toast(`Đã đúc ${ITEMS[r].name}!`, RARITY[ITEMS[r].rarity].color); rs(); });
          } else this.toast('Chưa đủ để ghép', '#E25A3A');
          rs();
        });
        break;
      }
      case 'chest': {
        C('buyChest', [d.k], (inst) => {
          if (!inst || typeof inst !== 'object') { this.toast(typeof inst === 'string' ? inst : g.inventory.length >= CONFIG.bagSize ? 'Túi đầy' : 'Chưa đủ vàng', '#E25A3A'); return; }
          const s2 = this.screen;
          if (!s2) return;
          s2.opened = inst.uid;
          s2.shake = true;
          this.renderScreen(true);
          s2.shake = false;
        });
        break;
      }
      case 'equip-new': {
        if (!h) { this.toast('Chọn một tướng trên bản đồ trước', '#E25A3A'); break; }
        const it = g.findItem(+d.uid), nm = it && ITEMS[it.inst.id].name;
        C('equip', [h, +d.uid], (r) => { if (fail(r)) { this.toast(`${HEROES[h.type].name} đã đeo ${nm}`, '#6AE06A'); if (this.screen) this.screen.opened = null; } rs(); });
        break;
      }
      case 'stash': sc.opened = null; this.renderScreen(true); break;
      // Túi đồ
      case 'bag-pick': {
        // chạm lần hai vào món đang chọn: đeo luôn cho tướng
        const inst = g.inventory.find((i) => i.uid === +d.uid);
        if (sc.pick === +d.uid && h && inst && canEquip(h.type, inst.id)) {
          C('equip', [h, inst.uid, slotFor(h, inst)], (r) => { if (fail(r)) this.toast(`Đã đeo ${ITEMS[inst.id].name}`, '#6AE06A'); rs(); });
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
      case 'equip': if (h) C('equip', [h, +d.uid], (r) => { if (fail(r)) rs(); }); break;
      case 'unequip': if (h) C('unequip', [h, d.slot], (r) => { if (fail(r)) rs(); }); break;
      case 'enhance': C('enhance', [+d.uid], (r) => { if (fail(r)) { this.toast('Cường hóa thành công!', '#FFD66B'); rs(); } }); break;
      case 'promote': C('promote', [+d.uid], (r) => { if (fail(r)) { this.toast('Thăng phẩm!', '#A86CE0'); rs(); } }); break;
      case 'lock': C('toggleLock', [+d.uid], rs); break;
      case 'scrap': {
        C('scrap', [+d.uid], (v) => {
          if (typeof v === 'number') { this.toast(`Đổi ra ${v} vàng`, '#F2D27A'); if (this.screen) this.screen.pick = null; } else this.toast(v, '#E25A3A');
          rs();
        });
        break;
      }
      case 'sort': C('sortBag', [], rs); break;
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
        C('scrapMany', [{ ...this.scrapFilter }], (r) => { if (r && r.count !== undefined) this.toast(`Đã đổi ${r.count} món: +${fmt(r.gold)} vàng`, '#F2D27A'); rs(); });
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
    if (kind === 'bag') this.bagSeen = { run: g.runId, uids: new Set(g.inventory.map((i) => i.uid)) };
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
    if (this.checkToasts) this.checkToasts();   // v189: đổi từ màn này sang màn khác (#screen vẫn hiện)
    this.sig.screen = null;
    // dựng bảng lỗi thì đóng lại ngay — không để lại #screen trống không có nút ✕ chặn cả màn
    try { this.renderScreen(true); } catch (e) { this.closeScreen(); this.toast('Không mở được bảng này', '#E25A3A'); throw e; }
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
            <span style="font-family:var(--title);font-size:15px">Mở khóa</span><span style="display:flex;align-items:center;gap:4px">${unlockCost(h, i) ? `${coin(1)}${unlockCost(h, i)} vàng` : 'Miễn phí'}</span></button>`;
      } else if (lv >= max) {
        btn = `<button class="up metal" disabled style="color:#FFD66B">Đã tối đa</button>`;
      } else {
        const gc = COSTS.skillGold(i, lv);
        const ok = (h.from ? g.gold >= gc : h.skillPts > 0) && h.level >= skillReqLevel(i, lv + 1);
        btn = `<button class="up metal ${ok ? 'ok' : ''}" data-act="sk-up" data-i="${i}" ${ok ? '' : 'disabled'}>${ICON.up}Nâng · ${h.from ? coin(1) + gc : '1 điểm'}</button>`;
      }
      const status = !lv ? (i === 0 ? 'Có sẵn' : 'Chưa mở khóa') : i === 0 ? 'Có sẵn' : 'Đã mua';
      return `<div class="col metal ${si === i ? 'on' : ''} ${!lv ? 'lock' : ''}" data-act="sk-sel" data-i="${i}">
        <div class="hd" data-skt="${i}" data-tip-avoid=".col"><div class="ico inset" style="${si === i ? 'border-color:#FFD66B' : ''}">${svgI(skillIcon(h.type, i))}</div>
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
      <div class="dh"><div class="ico inset" data-skt="${si}">${svgI(skillIcon(h.type, si))}</div><div><div class="ttl">${sk.name}</div>
        <small>${SKILL_KEYS[si]} · ${sk.active ? 'Chủ động · tốn năng lượng' : 'Nội tại'}</small></div></div>
      <div class="desc">${esc(sk.info(n))}${sk.active ? '. Tướng tự dùng khi đủ năng lượng.' : '.'}</div>
      <div class="kvt inset">
        <div><span>Cấp kỹ năng</span><b>${lv} / ${SKILL_MAX[si]}</b></div>
        <div><span>Sức mạnh</span><b>${lv ? `+${(lv - 1) * 25}%` : '—'}${lv && lv < SKILL_MAX[si] ? ` → <span style="color:#6AE06A">+${lv * 25}%</span>` : ''}</b></div>
        ${sk.active ? `<div><span>Năng lượng · hồi chiêu</span><b>${sk.active.mana} · ${sk.active.cooldown}s</b></div>` : ''}
        ${lv && lv < SKILL_MAX[si] ? `<div><span>Cấp ${lv + 1} cần</span><b class="${nextOk ? 'ok' : 'no'}">Tướng cấp ${skillReqLevel(si, lv + 1)}</b></div>` : ''}
        ${!lv ? `<div><span>Mở khóa</span><b class="${h.level >= COSTS.unlockReq[si] ? 'ok' : 'no'}">${unlockCost(h, si) ? `${unlockCost(h, si)} vàng` : 'Miễn phí'} · cấp ${COSTS.unlockReq[si]}</b></div>` : ''}
        <div><span>Chi phí nâng</span><b>${h.from ? `${lv ? COSTS.skillGold(si, lv) : '—'} vàng (đã thăng thần)` : `1 điểm (còn ${h.skillPts})`}</b></div>
      </div>
      ${!lv ? `<button class="big-btn btn-gold" data-act="sk-unlock" data-i="${si}" ${h.level >= COSTS.unlockReq[si] && g.gold >= unlockCost(h, si) ? '' : 'disabled'}>Mở khóa · ${unlockCost(h, si) ? `${coin(1)} ${unlockCost(h, si)}` : 'Miễn phí'}</button>`
        : lv < SKILL_MAX[si] ? (h.from
          ? `<button class="big-btn btn-gold" data-act="sk-up" data-i="${si}" ${nextOk && g.gold >= COSTS.skillGold(si, lv) ? '' : 'disabled'}>${ICON.up} Nâng lên cấp ${lv + 1} · ${coin(1)} ${COSTS.skillGold(si, lv)}</button>`
          : `<button class="big-btn btn-gold" data-act="sk-up" data-i="${si}" ${nextOk && h.skillPts ? '' : 'disabled'}>${ICON.up} Nâng lên cấp ${lv + 1} · 1 điểm</button>`)
        : '<button class="big-btn metal" disabled style="color:#FFD66B">Đã tối đa</button>'}
      ${h.skillPts && !g.canSpendSkillPts(h) ? `<button class="btn btn-gold stat-btn" data-act="sk-stat">Nâng chỉ số: 1 điểm → +${COSTS.statPt} ${ATTRS[heroMain(def)].short}${h.statPts ? ` · đã +${h.statPts * COSTS.statPt}` : ''}</button>` : ''}
      ${!h.skillPts && h.level < CONFIG.maxLevel ? `<button class="btn metal" style="height:34px;color:#F2D27A" data-act="sk-level">Nâng cấp tướng · ${coin(1)} ${g.levelCost(h)} (+1 điểm)</button>` : ''}
    </div>`;
    const hk = 'h.' + h.type, hd = SECRETS[hk];
    // claude/sua-thoat-than-khi: 40 tướng chưa có bí ẩn riêng (SECRETS['h.…']) → trước đây mở Cây kỹ năng là lỗi JS, màn trống không có nút đóng
    const hidChip = !hd ? '' : `<span class="chip hidc ${g.known.has(hk) ? 'ok' : ''}" title="${esc(g.known.has(hk) ? hd.desc : hd.hint)}">${g.known.has(hk) ? '✦ ' + esc(hd.desc) : `??? “${esc(hd.hint)}”`}</span>`;
    const pst = heroStats(h);
    const penChip = `<span class="chip dark" title="Xuyên giáp / xuyên kháng phép (chiêu R xuyên thêm ${ULT_PEN}%)">${ic('xuyen-giap', 'Xuyên giáp')}${Math.round(pst.pierce)}% · ${ic('xuyen-phep', 'Xuyên kháng phép')}${Math.round(pst.mpen)}%</span>`;
    return `${this.head('Cây kỹ năng', `<span class="chip dark">${def.name} · Cấp ${h.level}${h.train ? ` ✦${h.train}` : ''}</span>${penChip}${elChip(def.el)}${hidChip}
        ${h.skillPts ? `<span class="chip ok">Còn ${h.skillPts} điểm kỹ năng</span>` : ''}${this.runChip()}`)}
      <div class="scr-body" style="padding-bottom:4px"><div class="sk-cols">${cols}</div>${detail}</div>
      <div class="foot">${h.from ? `${coin(1)} <b>Đã thăng thần:</b> mở khóa <b>W ${COSTS.unlockAsc[1]} · E ${COSTS.unlockAsc[2]} · R ${COSTS.unlockAsc[3]}</b>, nâng kỹ năng bằng vàng · điểm kỹ năng đổi thành chỉ số` : `${coin(1)} Giá mở khóa: <b>W ${unlockCost(h, 1) || 'miễn phí'}</b> · <b>E ${unlockCost(h, 2) || 'miễn phí'}</b> (cấp ${COSTS.unlockReq[2]}) · <b>R ${unlockCost(h, 3) || 'miễn phí'}</b> (cấp ${COSTS.unlockReq[3]})${unlockCost(h, 3) ? ' vàng' : ' (★★★)'}`} <span style="color:#5C4620">|</span> Mỗi cấp tướng +1 điểm · mỗi cấp kỹ năng +25% sức mạnh · kỹ năng mạnh dần theo cấp tướng</div>`;
  }

  // ---------- Lò đúc đồng
  render_forge() {
    const g = this.game;
    const sc = this.screen;
    const tabs = `<div class="tabs">
      <button class="tab ${sc.tab === 'recipe' ? 'on' : 'metal'}" data-act="tab" data-tab="recipe">${emoArt('📜')} Công thức</button>
      <button class="tab ${sc.tab === 'shop' ? 'on' : 'metal'}" data-act="tab" data-tab="shop">${ic('vang')}Cửa hàng</button>
      <button class="tab ${sc.tab === 'chest' ? 'on' : 'metal'}" data-act="tab" data-tab="chest">${ic('hu-bau')}Hũ báu</button><span class="zig"></span></div>`;
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
          <span class="slot ${rarCls(o.inst.rarity)}">${svgI(itemIcon(o.inst.id, o.inst.rarity))}${elDot(o.inst)}</span>
          <span class="nm">${it.name}</span><small class="c-${o.inst.rarity}">${RARITY[o.inst.rarity].name} · ${SLOT_NAMES[it.slot]}</small>
          <span class="gn">${o.sold ? 'Đã mua' : gain ? `▲ +${gain} ${HEROES[h.type].name}` : best ? `▲ hợp ${HEROES[best.hero.type].name}` : (o.inst.aff || []).length ? `${o.inst.aff.length} dòng phụ` : ''}</span>
          <span class="pr">${o.sold ? '—' : coin(1) + o.price}</span></button>`;
      }).join('');
      let det = '<div class="note">Chọn một món để xem.</div>';
      if (cur) {
        const it = ITEMS[cur.inst.id];
        const gain = h ? upgradeGain(h, cur.inst) : 0;
        det = `<div class="it-head"><span class="slot ${rarCls(cur.inst.rarity)}">${svgI(itemIcon(cur.inst.id, cur.inst.rarity))}</span><div><div class="ttl">${it.name}</div><small class="c-${cur.inst.rarity}">${RARITY[cur.inst.rarity].name} · ${SLOT_NAMES[it.slot]}${it.wclass ? ' ' + WCLASS_NAMES[it.wclass].toLowerCase() : ''}</small></div></div>
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
          <div class="jar-stage inset"><div class="t"><div class="ttl">Hũ báu</div></div>${svgI(sceneArt('hubau'))}</div>
          <div style="display:flex;align-items:center;gap:10px"><div class="rar-chips" style="display:none"></div>
            </div>
          <div class="jars">${JARS.map((j) => `<button class="jar-btn ${j.id === 'small' ? 'metal' : j.id === 'big' ? 'metal rh' : 'metal rl'}" data-act="chest" data-k="${j.id}" ${g.gold < j.cost ? 'disabled' : ''}>
            ${uiIc(j.id === 'king' ? 'hu-vua-hung' : j.id === 'big' ? 'hu-dong' : 'hu-bau')}<b>${j.name}</b><small>${j.desc}</small><span>${coin(1)} ${j.cost}</span></button>`).join('')}</div>
          <div class="note" style="text-align:center">Mở thêm <b style="color:#C8A0F0">${Math.max(1, JAR_PITY - (g.jarCount || 0))}</b> hũ nữa: chắc chắn ra đồ Sử thi trở lên.</div>
        </div>
        <div class="panel metal" style="width:260px;flex:none"><div class="ttl" style="font-size:17px">Vừa mở được</div>
          ${inst ? `<div class="inset" style="border-radius:6px;padding:10px;border-color:${RARITY[inst.rarity].color}"><div class="it-head"><span class="slot ${rarCls(inst.rarity)}">${svgI(itemIcon(inst.id, inst.rarity))}</span>
            <div><div class="ttl">${ITEMS[inst.id].name}</div><small class="c-${inst.rarity}">${RARITY[inst.rarity].name} · ${SLOT_NAMES[ITEMS[inst.id].slot]}</small></div></div>
            <div class="stat-list" style="margin-top:6px">${statLine(itemStats(inst), true)}</div>${this.bestFor(inst)}</div>
            ${!op.hero ? `<button class="big-btn btn-gold" style="margin-top:0" data-act="equip-new" data-uid="${inst.uid}">Đeo cho tướng</button>
            <button class="btn metal" style="height:44px;font-size:14px" data-act="stash">${ICON.bag} Cất vào túi</button>` : '<div class="chip ok" style="text-align:center">Đã đeo</div>'}`
            : '<div class="note">Chưa mở hũ nào.</div>'}
        </div></div>`;
    }
    return `${this.head('Lò đúc đồng', this.prepForge ? `<span class="chip kho">Trả bằng Ngân khố ${bac(1)} — không phải vàng trận</span>` : `<span class="chip dark">Đợt ${g.wave}</span>${this.runChip()}`, '', artOr('ui-tran-2-2', svgI(sceneArt('drum'))))}${tabs}${body}`;
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
        ${inst ? svgI(itemIcon(inst.id, inst.rarity)) + (inst.plus ? `<span class="lv">+${inst.plus}${inst.temper ? '✦' : ''}</span>` : '') + elDot(inst) : `<span class="ph">${lab}</span>`}</button>`;
    };
    const left = `<div class="panel metal bag-hero">
      <div class="hsel"><button class="metal" data-act="hero-prev" aria-label="Tướng trước">‹</button><span class="ttl">${h ? def.name : 'Chưa có tướng'}</span><button class="metal" data-act="hero-next" aria-label="Tướng sau">›</button></div>
      <div style="text-align:center;font-size:12px;color:#C8BFA8">${h ? `Cấp ${h.level}${h.tier ? ' · ' + '★'.repeat(h.tier) : ''} · <b style="color:#FFD66B">Lực chiến ${heroPower(h)}</b><br>Xuyên giáp ${Math.round(heroStats(h).pierce)}% · xuyên kháng phép ${Math.round(heroStats(h).mpen)}%` : 'Triệu hồi tướng để mặc đồ'}</div>
      <div class="eqwrap"><div class="eqcol"><small>Trang phục</small>${GEAR_SLOTS.map(slotBtn).join('')}</div>
        <div class="fig inset">${h ? '<canvas data-hero width="172" height="300"></canvas>' : ''}</div>
        <div class="eqcol"><small>Phụ kiện</small>${ACC_SLOTS.map(slotBtn).join('')}</div></div>
      <div class="note" style="text-align:center">${h ? setNote(h) || `${elIcon(def.el, 14)} Hành ${ELEMENTS[def.el].name}` : ''}</div></div>`;
    const cells = [];
    for (let i = 0; i < CONFIG.bagSize; i++) {
      const inst = g.inventory[i];
      if (!inst) { cells.push('<span class="slot"></span>'); continue; }
      const bad = h && !canEquip(h.type, inst.id);
      const gain = h && !bad ? upgradeGain(h, inst) : 0;
      cells.push(`<button class="slot ${rarCls(inst.rarity)} ${sc.pick === inst.uid ? 'sel' : ''} ${bad ? 'dim' : ''}" data-act="bag-pick" data-uid="${inst.uid}" aria-label="${ITEMS[inst.id].name}">
        ${svgI(itemIcon(inst.id, inst.rarity))}${inst.plus ? `<span class="lv">+${inst.plus}${inst.temper ? '✦' : ''}</span>` : ''}${inst.locked ? `<span class="lk">${ICON.lock}</span>` : ''}${elDot(inst)}${gain ? '<span class="upa">▲</span>' : ''}</button>`);
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
        <div class="it-head"><span class="slot ${rarCls(inst.rarity)}">${svgI(itemIcon(inst.id, inst.rarity))}${inst.plus ? `<span class="lv">+${inst.plus}</span>` : ''}</span>
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
        <div class="note">Chạm một món để xem chi tiết.</div>
        <div class="kvt inset"><div><span>Cường hóa Thường</span><b>20 × cấp</b></div><div><span>Hiếm / Sử thi</span><b>40 / 80 × cấp</b></div><div><span>Huyền thoại</span><b>150 × cấp</b></div>
          <div><span>Thăng phẩm</span><b>120 / 300 / 600</b></div><div><span>Tôi luyện (Huyền thoại +5)</span><b>300 + 100 × lần</b></div></div>
        <div class="note">Đồ trang phục làm <b style="color:#FFD66B">tướng đổi hình dạng</b> và mang 1 <b>hành</b>: cùng hành với tướng +10% chỉ số gốc, khắc mệnh −10%. Đồ rơi có dòng phụ; đồ Sử thi trở lên có hiệu ứng ẩn.</div></div>`;
    }
    return `${this.head('Túi đồ', `<span class="chip dark">${g.inventory.length} / ${CONFIG.bagSize} ô</span>${this.runChip()}`,
      `<button class="btn metal" data-act="sort">Sắp xếp</button>`)}<div class="scr-body">${left}${mid}${det}</div>`;
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
          <div class="inset" style="border-radius:6px;padding:6px;display:flex;gap:4px;flex-wrap:wrap;min-height:50px">${list.slice(0, 11).map((i) => `<span class="slot ${rarCls(i.rarity)}" style="width:36px;height:36px">${svgI(itemIcon(i.id, i.rarity))}${i.plus ? `<span class="lv">+${i.plus}</span>` : ''}</span>`).join('')}${list.length > 11 ? `<span class="slot" style="width:36px;height:36px;font-weight:800;color:#C8BFA8">+${list.length - 11}</span>` : ''}</div>
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
    // v170: ảnh tướng MỘT lần bên trái + dải 3 mốc sao gọn (chỉ số tăng, trạng thái, nút hành động)
    const R = def.legend ? RARITY[def.legend] : null;
    const steps = [0, 1, 2].map((k) => {
      const bought = t > k, cur = t === k;
      const needLv = evoReq(h, k), cost = evoCost(h, k), lvOk = h.level >= needLv;
      // tướng vàng: Thần tinh mạnh hơn tướng tím (nhân ASC_EVO_MULT), hiện đúng số
      const mul = h.from ? ASC_EVO_MULT[def.legend] || 1 : 1;
      const bon = Object.fromEntries(Object.entries(EVO_BONUS[h.from ? 'asc' : 'base'][k + 1]).map(([key, v]) => [key, Math.round(v * mul)]));
      const fx = h.from ? (def.legend === 'legendary' ? ['Lửa thần vàng', 'Hào quang vàng rực', 'Thần tinh vàng tối đa'] : ['Vòng lửa thần', 'Lửa thần rực hơn', 'Thần tinh tối đa'])[k] : ['To hơn, hào quang trống đồng', 'Hào quang rực hơn', 'Bậc cao nhất'][k];
      let req, btn;
      if (!h.from) {
        // tướng Thường: lên sao bằng ghép 2 tướng cùng loại cùng sao (không mua bằng vàng)
        const twin = cur && g.heroes.find((o) => o && o !== h && g.canMerge(o, h) === true);
        req = k === 0 ? 'Triệu hồi là có' : `Ghép 2 × ${'★'.repeat(k)}`;
        btn = bought ? `<span class="es-done">${UIE.done()} Đã đạt</span>`
          : twin ? `<button class="es-btn go" data-act="merge-any">Ghép 2 → ${'★'.repeat(k + 1)}</button>`
          : `<button class="es-btn" disabled>${cur ? `Thiếu 1 tướng ${'★'.repeat(k) || '★'}` : `Đạt ${'★'.repeat(k) || '★'} trước`}</button>`;
      } else {
        req = `Cấp ${needLv} · ${coin(1)}${fmt(cost)}`;
        btn = bought ? `<span class="es-done">${UIE.done()} Đã đạt</span>`
          : cur && lvOk ? `<button class="es-btn go" data-act="evolve" ${g.gold < cost ? 'disabled' : ''}>Thần tinh · ${coin(1)}${fmt(cost)}</button>`
          : cur ? `<button class="es-btn up" data-act="sk-level" title="Đang cấp ${h.level}, cần cấp ${needLv}" ${g.gold < g.levelCost(h) ? 'disabled' : ''}>Lên cấp · ${coin(1)}${g.levelCost(h)}</button>`
          : `<button class="es-btn" disabled>${UIE.lock()} Cần cấp ${needLv}</button>`;
      }
      return `${k ? '<span class="es-ar">➜</span>' : ''}<div class="es ${bought ? 'done' : cur ? 'cur' : 'lock'}">
        <div class="es-st" ${h.from ? 'style="color:#FF7A3A"' : ''}>${'★'.repeat(k + 1)}</div>
        <ul class="es-bon">${evoText(bon).split(' · ').map((x) => `<li>${x}</li>`).join('')}</ul>
        <div class="es-fx" title="${esc(fx)}">${fx}</div><div class="es-req ${!bought && cur && h.from && !lvOk ? 'no' : ''}">${!bought && cur && h.from && !lvOk ? `Cấp ${h.level}/${needLv} · ${coin(1)}${fmt(cost)}` : req}</div>${btn}</div>`;
    }).join('');
    const cards = `<div class="panel metal ev2-stars">
        <div class="ev2-hero inset ${def.legend || 'common'}"><canvas data-hero width="220" height="264"></canvas>
          <div class="ev2-nm"><b>${esc(def.name)}</b><small style="color:${R ? R.color : '#C8BFA8'}">${R ? R.name : 'Thường'} · Cấp ${h.level}</small></div></div>
        <div class="ev2-steps">${steps}</div></div>`;
    // bộ đồ đang mặc nhiều món nhất (chưa có thì giới thiệu Bộ Lạc Long)
    const sc0 = setCounts(h.equip);
    const setK = Object.keys(sc0).sort((a, b) => sc0[b] - sc0[a])[0] || 'laclong';
    const SD = SETS[setK];
    const pieces = [[SD.ids[def.wclass], 'Vũ khí', 'weapon'], [SD.ids.helmet, 'Mũ', 'helmet'], [SD.ids.armor, 'Giáp', 'armor']];
    const have = pieces.filter(([id, , s]) => h.equip[s] && h.equip[s].id === id).length;
    return `${this.head(h.from ? 'Thần tinh' : 'Tiến hoá', `<span class="chip dark">${def.name} · Cấp ${h.level}</span>${elChip(def.el)}${t ? `<span class="chip goldc">★ Bậc ${t}</span>` : ''}${this.runChip()}`)}
      <div class="scr-body ev2-body">${cards}
        ${ASCEND[h.type] ? this.ascendPanel(h) : `<div class="panel metal set-panel"><div class="ph"><span class="ttl" style="font-size:20px">${SD.name}</span><small style="font-weight:800;color:#E8E0CC;font-size:14px">${have} / 3 món</small></div>
          ${pieces.map(([id, lab, s]) => `<div class="set-row inset ${h.equip[s] && h.equip[s].id === id ? 'have' : ''}"><span class="slot ${h.equip[s] && h.equip[s].id === id ? 'rl' : ''}">${svgI(itemIcon(id))}</span><span class="n">${ITEMS[id].name}</span><small>${lab}</small></div>`).join('')}
          <div class="inset" style="margin-top:auto;border-radius:6px;padding:8px 10px;font-size:12px;line-height:1.35">${elChip(SD.el)}
            <div><b style="color:#F2D27A">2 món:</b> ${SD.p2}</div><div><b style="color:#F2D27A">Đủ bộ:</b> ${SD.p3}</div>
            <div style="color:#C8BFA8">${SD.look3}${SD.el === def.el ? ' · <b style="color:#FFD66B">Thiên mệnh: cùng hành, mạnh thêm 50%</b>' : ''}</div></div></div>`}
      </div>`;
  }

  // v147: CÂY PHÁT TRIỂN — tướng này ghép từ đâu / sẽ hợp thể thành tướng nào (dùng chung: Anh Hùng)
  evolveTree(t) {
    const owned = new Set(this.save.owned || []);
    const NEED = { epic: `2 tướng ${'★'.repeat(COSTS.ascendTier)} + kỹ năng tối đa`, legendary: `Thần tinh ${'★'.repeat(COSTS.ascendTier2)} + kỹ năng tối đa` };
    const pic = (x) => { const d = HEROES[x], lock = d.legend && !owned.has(x);
      return `<button class="ev-p ${d.legend || 'base'} ${x === t ? 'me' : ''} ${lock ? 'lock' : ''}" data-act="ro-sel" data-type="${x}" data-ev="1" title="${esc(d.name)}${lock ? ' (chưa có)' : ''}">
        <img src="${heroImgUrl(x, 'head')}" alt=""><b>${esc(d.name)}</b>${lock ? '<i>Chưa có</i>' : ''}</button>`; };
    // sub = dòng tầng 2: bỏ chân dung đầu (đã có ở dòng trên), nối bằng ↳
    const row = (f, sub) => `<div class="ev-row ${sub ? 'sub' : ''}">${sub ? '' : `${pic(f.a)}`}<span class="ev-op">+</span>${pic(f.b)}<span class="ev-op ar ${HEROES[f.to].legend}">➜</span>${pic(f.to)}</div>`;
    const lb = (txt, tier) => `<div class="ev-lb">${txt}${tier ? ` · <b style="color:${RARITY[tier].color}">${NEED[tier]}</b>` : ''}</div>`;
    // đặt tướng đang xem lên đầu công thức cho dễ đọc
    const mine = (f, x) => (f.b === x ? { ...f, a: f.b, b: f.a } : f);
    const into = (x) => FUSION.filter((f) => f.a === x || f.b === x).map((f) => mine(f, x));
    const from = FUSION.find((f) => f.to === t);
    const d = HEROES[t];
    let body = '', title = 'Phát triển thành';
    if (!d.legend) {
      const list = into(t);
      body = list.length ? lb('Lên Tím', 'epic') + list.map((f) => `<div class="ev-br">${row(f)}${into(f.to).length ? `<div class="ev-sl">rồi lên Vàng · ${NEED.legendary}</div>` : ''}${into(f.to).map((g2) => row(g2, true)).join('')}</div>`).join('') : '';
    } else if (d.legend === 'epic') {
      body = (from ? lb('Ghép từ', 'epic') + row(from) : '') + lb('Hợp thể thành', 'legendary') + into(t).map((f) => row(f)).join('');
    } else {
      title = 'Nguồn gốc';
      const subs = from ? [from.a, from.b].map((x) => FUSION.find((f) => f.to === x)).filter(Boolean) : [];
      body = (from ? lb('Ghép từ', 'legendary') + row(from) : '') + (subs.length ? lb('Hai tướng Tím ghép từ', 'epic') + subs.map((f) => row(f)).join('') : '')
        + `<div class="ev-top" style="color:${RARITY.legendary.color}">★ Bậc cao nhất</div>`;
    }
    if (!body) return '';
    return `<div class="ev-tree inset" style="--rc:${d.legend ? RARITY[d.legend].color : '#C8BFA8'}"><div class="ev-h">${title}</div>${body}</div>`;
  }
  // dòng "hợp nhất cho tướng nào" của một món (lực chiến tăng bao nhiêu)
  bestFor(inst) {
    const g = this.game;
    const b = g.bestHeroFor(inst);
    if (!b) return g.heroes.some(Boolean) ? '<div class="bestf no">Chưa làm tướng nào trên sân mạnh hơn</div>' : '';
    return `<div class="bestf">▲ Hợp nhất: <b>${HEROES[b.hero.type].name}</b> +${b.gain} lực chiến</div>`;
  }

  // bảng Hợp thể trong màn Tiến hoá (v170): mỗi hướng một thẻ ngang [tướng này + nguyên liệu ➜ tướng đích], 1 dòng điều kiện ✓/✗
  ascendPanel(h) {
    const g = this.game;
    const ck = (ok, txt) => `<span class="${ok ? 'y' : 'n'}">${ok ? '✓' : '✗'} ${txt}</span>`;
    const need = g.ascendNeed(h), left = g.skillsLeft(h);
    const stars = (n, from) => `${from ? 'Thần tinh ' : ''}${'★'.repeat(n)}`;
    const opts = (ASCEND[h.type] || []).map((t) => {
      const d = HEROES[t], f = FUSION.find((x) => x.to === t), pt = fusionPartner(h.type, t), R = RARITY[d.legend];
      const o = g.heroes.filter((x) => x && x !== h && x.type === pt).sort((x, y) => (y.tier || 0) - (x.tier || 0) || y.level - x.level)[0];
      const ok = o ? g.canFuse(o, h) : 'thiếu';
      const go = typeof ok !== 'string';
      const lockWhy = typeof ok === 'string' && ok !== 'thiếu' ? ok : `Cần ${HEROES[pt].name} trên sân`;
      const oReady = o && g.fusionReady(o) === true, own = g.ownsHero(t), cost = COSTS.ascend[d.legend];
      const gap = g.skillGap(h), og = o ? g.skillGap(o) : 0;
      const conds = [ck((h.tier || 0) >= need, `Tướng này ${stars(need, h.from)}`)];
      conds.push(ck(!left.length, `Kỹ năng tối đa${gap ? ` (còn ${gap})` : ''}`));
      conds.push(ck(o && (o.tier || 0) >= g.ascendNeed(o), `${HEROES[pt].name} ${stars(o ? g.ascendNeed(o) : need, h.from)}${o ? '' : ' trên sân'}`));
      if (o) conds.push(ck(!og, `${HEROES[pt].name} kỹ năng tối đa${og ? ` (còn ${og})` : ''}`));
      if (!own) conds.push(ck(false, `Chưa mở khoá — Mở ở Anh Hùng · ${fmt(OWN_COST[heroTier(t)])} Ngân khố`));
      else if (oReady && g.fusionReady(h) === true && g.gold < cost) conds.push(ck(false, `${cost} vàng`));
      const pic = (x, st, cls = '') => `<span class="hx-m ${st} ${HEROES[x].legend || 'common'} ${cls}" title="${esc(HEROES[x].name)}"><img src="${heroImgUrl(x, 'head')}" alt=""></span>`;
      return `<div class="ho ${d.legend} ${go ? 'ready' : ''}" style="--rc:${R.color}">
        <div class="ho-top">${pic(h.type, g.fusionReady(h) === true ? 'ok' : 'part')}<em>+</em>${pic(pt, oReady ? 'ok' : o ? 'part' : 'no')}<em class="ar">➜</em>
          <span class="hx-to ${d.legend}"><img src="${heroImgUrl(t, 'head')}" alt=""></span>
          <span class="ho-nm"><b>${esc(d.name)} ${elIcon(d.el, 13)}</b><small>${R.name} · ${esc(d.trait.name)}</small></span></div>
        <div class="ho-cond">${conds.join('')}</div>
        <div class="ho-ft">${!go && this.screen && this.screen.why === t ? `<span class="ho-why err">${SVG_LOCK} ${esc(lockWhy)}</span>` : `<span class="ho-why" title="${esc(f.why)}">${go ? `Lực chiến → <b>${g.fusePreview(o, h)}</b>` : esc(f.why)}</span>`}
          <button class="hx-go ${go ? '' : 'off'}" data-act="fuse-with" data-to="${t}" data-slot="${o ? o.slot : ''}" ${go ? '' : `aria-disabled="true" data-why="${esc(lockWhy)}"`}>${go ? '' : SVG_LOCK}Hợp thể · ${coin(1)}${cost}</button></div></div>`;
    }).join('');
    return `<div class="panel metal set-panel asc-panel ho-panel"><div class="ph"><span class="ttl" style="font-size:20px">Hợp thể</span>
        <button class="hx-q" data-act="evo-help" aria-label="Cách hợp thể">?</button></div>
      <div class="ho-list">${opts}</div>
      <div class="ho-hint">Hoặc kéo tướng này thả lên tướng nguyên liệu trên sân</div></div>`;
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
          <div class="nt-tile inset"><div class="nt-ico metal" style="color:#E25A3A">${ic('mang')}</div><div><div class="nt-lbl">MẠNG THÀNH</div><div class="nt-val">${st >= 2 ? '+1 mỗi 3 đợt' : 'Chưa mở'}</div><div class="nt-note">Mở từ giai đoạn 2</div></div></div>
          <button class="nt-tile metal act" data-act="harvest" ${m.herbs ? '' : 'disabled'}><div class="nt-ico inset">🍄</div><div><div class="nt-val" style="font-size:19px;color:#F2D27A">Hái ${m.herbs} Linh Chi</div><div class="nt-note">${coin(1)} <b>+${m.herbs * MOUNTAIN.herbGold} vàng</b> · <b style="color:#6AE06A">hồi máu</b></div></div></button>
          <div class="nt-tile inset"><div class="nt-ico metal">🍄</div><div><div class="nt-lbl">LINH CHI</div><div class="nt-val">${MOUNTAIN.herbGold} vàng / cây</div><div class="nt-note">${st >= 3 ? 'Mọc 1 cây mỗi đợt (tối đa 5)' : 'Mọc từ giai đoạn 3'} · hồi <b style="color:#6AE06A">máu tướng</b></div></div></div>
          <button class="nt-tile actg" data-act="soil" ${m.soiled || g.gold < MOUNTAIN.soilCost || st >= 5 ? 'disabled' : ''}><div class="nt-ico" style="background:#0D0B0833;border:1px solid #5A3608">${emoArt('⛰')}</div><div><div class="nt-val">Bồi đất · ${MOUNTAIN.soilCost} vàng</div><div class="nt-note">${m.soiled ? 'Đợt này đã bồi đất' : 'Núi cao nhanh hơn · 1 lần/đợt'}</div></div></button>
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
    return `${this.head('Bách khoa · Bí truyền', this.runChip(), seg, codexIc())}
      <div class="bt-top metal"><span class="ttl">Đã khám phá ${n} / ${SECRET_KEYS.length}</span><div class="pbar inset"><i style="width:${(n / SECRET_KEYS.length) * 100}%"></i></div>
        <span class="note">Hiệu ứng ẩn hiện ra lần đầu điều kiện xảy ra trong trận. Khám phá hiệu ứng ẩn của một tướng sẽ mở <b style="color:#FFD66B">khung chân dung vàng</b>.</span></div>
      <div class="scr-body bt-body">${cols}</div>`;
  }

  // ---------- Bách khoa · Vai trò tướng (v182): 7 vai trò, cộng hưởng 2/4, tướng theo vai
  render_roles(seg) {
    const sc = this.screen, vf = ROLES[sc.role] ? sc.role : '';
    const all = [...BASIC_HEROES, ...LEGEND_HEROES], owned = new Set(this.save.owned || []);
    const pic = (k, sub) => `<button class="vt-h ${HEROES[k].legend || 'common'} ${sub ? 'sub' : ''} ${HEROES[k].legend && !owned.has(k) ? 'lock' : ''}" data-act="vt-hero" data-type="${k}" title="${esc(HEROES[k].name)}${sub ? ' (vai phụ)' : ''}"><img src="${heroImgUrl(k, 'head')}" alt=""><span ${vtShort(k).length > 9 ? 'class="lg"' : ''}>${esc(vtShort(k))}</span></button>`;
    const cols = ROLE_KEYS.filter((r) => !vf || r === vf).map((r) => {
      const d = ROLES[r], syn = ROLE_SYN[r];
      const main = all.filter((k) => heroRole(k) === r), sub = all.filter((k) => heroRoles(k)[1] === r);
      return `<div class="vt-col inset" style="--rc:${d.color}"><div class="vt-hd">${roleIcon(r, 26)}<div><b>${d.name}</b><small>${esc(d.desc)}</small></div><i>${main.length}</i></div>
        <div class="vt-syn"><span><b>2</b> ${syn.t[0]}</span><span><b>4</b> ${syn.t[1]}</span></div>
        <div class="vt-list">${main.map((k) => pic(k)).join('')}${vf ? sub.map((k) => pic(k, true)).join('') : ''}</div></div>`;
    }).join('');
    return `${this.head('Bách khoa · Vai trò', this.runChip(), seg, codexIc())}
      <div class="bt-top metal vt-top"><div class="rl-filter">${roleFilter(vf, 'vt-f')}</div><span class="note">Cộng hưởng: đủ <b>2</b> / <b>4</b> tướng <b>khác loại</b> cùng vai trò chính trên sân → tướng mang vai trò đó (chính hoặc phụ) nhận buff; Hỗ trợ buff toàn quân.</span></div>
      <div class="scr-body vt-body ${vf ? 'one' : ''}">${cols}</div>`;
  }

  // ---------- Bách khoa thủy quái
  render_codex() {
    const g = this.game;
    const sc = this.screen;
    const isBoss = sc.tab === 'boss';
    const seg = `<div class="seg inset"><button class="${sc.tab === 'enemy' ? 'on' : ''}" data-act="tab" data-tab="enemy">Quái</button><button class="${isBoss ? 'on' : ''}" data-act="tab" data-tab="boss">Boss</button><button class="${sc.tab === 'secret' ? 'on' : ''}" data-act="tab" data-tab="secret">Bí truyền</button><button class="${sc.tab === 'role' ? 'on' : ''}" data-act="tab" data-tab="role">Vai trò</button></div>`;
    let body;
    if (sc.tab === 'secret') return this.render_secrets(seg);
    if (sc.tab === 'role') return this.render_roles(seg);
    // v53: chọn chương truyện → quái / boss của các bản đồ trong chương đó
    const lvNow = g.started ? g.level : this.save.last;
    if (sc.ch == null) sc.ch = Math.max(0, CHAPTERS.findIndex((c) => lvNow >= c.from && lvNow <= c.to));
    const chap = CHAPTERS[sc.ch] || CHAPTERS[0];
    const chLv = [];
    for (let i = chap.from; i <= chap.to && i < LEVELS.length; i++) chLv.push(i);
    const chTabs = `<div class="cp-tabs bk-ch">${CHAPTERS.map((c, ci) => `<button class="cp-tab ${ci === sc.ch ? 'on' : ''}" data-act="bk-ch" data-i="${ci}">${ci + 1}. ${c.name}</button>`).join('')}</div>`;
    const where = (id) => {   // bản đồ + đợt đầu tiên boss xuất hiện trong chương
      for (const i of chLv) { const w = Object.keys(LEVELS[i].bosses || {}).map(Number).sort((a, b) => a - b).find((n) => LEVELS[i].bosses[n] === id); if (w) return `${LEVELS[i].name} · Đợt ${w}`; }
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
          <div class="bk-stat"><span>Hành ${elIcon(d.el, 14)} <b>${ELEMENTS[d.el].name}</b></span><span>${ic('mau')}Máu gốc <b>${d.hp}</b></span><span>${ic('giap')}Giáp <b>${d.armor}</b></span><span>${ic('khang-phep')}Kháng phép <b>${d.mr}%</b></span><span>${ic('tui-vang')}Vàng <b>${d.gold}</b></span></div>
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
            <div class="bk-stat"><span>Hành ${elIcon(d.el, 14)} <b>${ELEMENTS[d.el].name}${cur === 'haba' && g.known.has('e.haba') ? ' → Kim' : ''}</b></span><span>${ic('mau')}Máu <b>${d.hp}+</b></span><span>${ic('giap')}Giáp <b>${d.armor}</b></span><span>${ic('khang-phep')}Kháng phép <b>${d.mr}%</b></span><span>${ic('mang')}Lọt thành <b>−${d.lives} mạng</b></span></div></div></div>
          <div class="mech inset">${esc(d.desc)}</div>
          <div class="tipbox inset">${emoArt('🎁')} <b>Hạ được:</b> chọn sính lễ <b>${ITEMS[d.reward].name}</b></div>
          <div class="tipbox inset">${UIE.tip()} <b>Mẹo:</b> ${esc(d.tip)}</div></div></div>`;
    }
    // lịch 30 đợt
    const lv = g.started ? g.level : this.save.last;
    const N = LEVELS[lv].waves;
    const cells = [];
    for (let n = 1; n <= N; n++) {
      const k = waveKind(n, lv);
      cells.push(`<span class="cell ${k === 'boss' ? 'boss' : k === 'air' ? 'air' : k === 'champion' ? 'champ' : ''} ${g.started && n < g.wave + (g.waveActive ? 0 : 1) ? 'past' : ''} ${g.started && n === g.wave ? 'cur' : ''}">${n}</span>`);   // v163: bỏ vạch "Nước dâng" (cơ chế bỏ từ v36)
    }
    return `${this.head('Bách khoa quái thú', this.runChip(), seg, codexIc())}
      <div class="scr-body bk-body" style="padding-bottom:6px">${body}</div>
      <div class="sched metal" style="margin:0 10px 10px"><div class="hd"><span class="ttl">Lịch ${N} đợt đầu · ${LEVELS[lv].name}</span>
        <div class="lg"><span><i style="background:#8A2A12;border:1px solid #C8401E"></i>Boss</span><span><i style="background:#3A4A5A;border:1px solid #5A7088"></i>Bay</span><span><i style="background:#5A4E30;border:1px solid #8C7A5A"></i>${(() => { const R = rosterOfLevel(lv); return R && ENEMIES[R.champ] ? ENEMIES[R.champ].name : 'Quái khỏe'; })()}</span><span><i style="border:2px solid #FFD66B"></i>Đợt hiện tại</span></div></div>
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
