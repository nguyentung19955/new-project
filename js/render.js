'use strict';

// ============================================================
//  VẼ: bản đồ (theo bản thiết kế), tướng (hình vector chia khớp
//  từ "Đền Anh Hùng" + đồ mặc vẽ chồng lên để đổi hình dạng),
//  quân Thủy Tinh và boss. Hình vector nằm trong js/art.js (ART).
// ============================================================

function shade(hex, pct) {
  const n = parseInt(hex.slice(1, 7), 16);
  const f = (c) => Math.max(0, Math.min(255, Math.round(c + (pct < 0 ? c : 255 - c) * pct)));
  const r = f(n >> 16), g = f((n >> 8) & 255), b = f(n & 255);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2);
  ctx.fill();
}

// Tự vẽ bo góc (ctx.roundRect không có trên iOS < 16)
function rrect(ctx, x, y, w, h, r, color) {
  r = Math.min(r, w / 2, h / 2);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}

function drawStar(ctx, x, y, r, color, stroke, lw) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  if (stroke) { ctx.save(); ctx.lineJoin = 'round'; ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1.5; ctx.stroke(); ctx.restore(); }
  ctx.fill();
  if (stroke) { ctx.save(); ctx.globalAlpha *= 0.55; ctx.fillStyle = '#FFF8D8'; ctx.beginPath(); ctx.arc(x - r * 0.2, y - r * 0.25, r * 0.22, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
}

// ------------------------------------------------------------
//  ẢNH TỪ SVG (ART) — chuyển chuỗi SVG thành ảnh, lưu đệm
// ------------------------------------------------------------
const HAS_ART = typeof ART !== 'undefined';
const svgCache = new Map();
function svgUrl(svg) {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
// Đặt lại kích thước điểm ảnh cho một chuỗi <svg ...> đầy đủ
function sizedSvg(svg, w, h) {
  return svg.replace(/<svg\b([^>]*)>/, (m, attrs) => {
    const a = attrs.replace(/\s(width|height)="[^"]*"/g, '');
    return `<svg${a} width="${Math.round(w)}" height="${Math.round(h)}" preserveAspectRatio="xMidYMid meet">`;
  });
}
function svgImage(key, svg) {
  let img = svgCache.get(key);
  if (!img) {
    img = new Image();
    img.decoding = 'async';
    img.src = svgUrl(svg);
    svgCache.set(key, img);
  }
  return img;
}
const ready = (img) => img && img.complete && img.naturalWidth > 0;

// ------------------------------------------------------------
//  ẢNH VẼ TAY (AI) TRONG THƯ MỤC assets/ — đặt đúng tên file theo
//  docs/ASSETS.md là game tự dùng; chưa có ảnh thì dùng hình vector.
//  Ảnh được thử tải khi cần lần đầu (không cần danh sách trước).
// ------------------------------------------------------------
const ASSET_ROOT = 'assets/';
const assetMap = new Map();      // đường dẫn -> { img, ok: null | true | false }
let assetVersion = 0;            // tăng mỗi khi có ảnh mới tải xong (để giao diện vẽ lại)
let useAssets = true;
function asset(path, force) {
  if (!useAssets && !force) return null;
  let a = assetMap.get(path);
  if (!a) {
    a = { img: new Image(), ok: null };
    a.img.onload = () => { a.draw = shrinkForCanvas(path, a.img); a.ok = true; assetVersion++; };
    a.img.onerror = () => { a.ok = false; };
    a.img.src = ASSET_ROOT + path;
    assetMap.set(path, a);
  }
  return a.ok ? a.draw || a.img : null;
}
// Ảnh vẽ tay to (Fooocus 512 px) mà trên bản đồ chỉ hiện vài chục px: thu nhỏ MỘT LẦN khi tải
// vào canvas riêng, để mỗi khung hình không phải co ảnh lớn (đỡ giật trên điện thoại).
// Ảnh nền / bản đồ / truyện giữ nguyên. Ảnh trong giao diện (thẻ <img>) vẫn dùng file gốc.
const SHRINK_SIDE = 320;
function shrinkForCanvas(path, img) {
  if (/^(nen_|truyen_|ban-do_nui|logo|icon-app|maps\/|scenes\/)/.test(path)) return null;
  const w = img.naturalWidth, h = img.naturalHeight;
  const k = SHRINK_SIDE / Math.min(w, h);
  if (k >= 0.9) return null;
  try {
    const c = document.createElement('canvas');
    c.width = Math.round(w * k); c.height = Math.round(h * k);
    const x = c.getContext('2d');
    x.imageSmoothingQuality = 'high';
    x.drawImage(img, 0, 0, c.width, c.height);
    // giữ tên thuộc tính như ảnh để code vẽ dùng chung
    c.naturalWidth = c.width; c.naturalHeight = c.height;
    return c;
  } catch (e) { return null; }
}
// nhận một đường dẫn hoặc danh sách (thử lần lượt, dùng ảnh đầu tiên đã có)
function assetAny(paths) {
  if (!Array.isArray(paths)) paths = [paths];
  for (const p of paths) { const img = asset(p); if (img) return { img, path: p }; }
  return null;
}
const assetUrl = (paths) => { const a = assetAny(paths); return a ? ASSET_ROOT + a.path : ''; };

// Tên file theo asset-manifest.json của bản giao v15 (ảnh cắt từ bảng S01–S37
// bằng tools/cat-anh.py, để phẳng trong assets/). Tên cũ (heroes/hero_h01_C.png…)
// vẫn dùng được làm dự phòng.
const slugify = (name) => name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[đĐ]/g, 'd')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const HERO_CODE = { lactuong: 'h01', lucsi: 'h02', xathu: 'h03', thosan: 'h04', thaymo: 'h05', thansuong: 'h06',
  giong: 'h07', llq: 'h08', kimquy: 'h09', thachsanh: 'h10', auco: 'h11', caolo: 'h12', antiem: 'h13',
  cdt: 'h14', tiendung: 'h15', langlieu: 'h16', lachau: 'h17', thansan: 'h18', adv: 'h19', mau: 'h20',
  thoren: 'h21', nguphu: 'h22', thogom: 'h23', thaylang: 'h24', trongdong: 'h25', caong: 'h26', ongtao: 'h27',
  matroi: 'h28', mauthoai: 'h29', trutroi: 'h30', ongho: 'h31',
  dotnuong: 'h32', denroi: 'h33', potaoapui: 'h34', baahoa: 'h35', kinhduong: 'h36', viemde: 'h37',
  chodo: 'h38', haisen: 'h39', lyngu: 'h40', truongchi: 'h41', halong: 'h42', longnu: 'h43',
  dapde: 'h44', chantrau: 'h45', ongdung: 'h46', thocong: 'h47', tanvien: 'h48', maudia: 'h49',
  giaodong: 'h50', chuongdong: 'h51', nghedong: 'h52', mychau: 'h53', kylan: 'h54', thienloi: 'h55',
  tre: 'h56', ongthoi: 'h57', sodua: 'h58', cuoi: 'h59', melua: 'h60' };
const ENEMY_CODE = { tom: 'E01', casau: 'E02', rua: 'E03', phuthuy: 'E04', chimbao: 'E05', echme: 'E06',
  nongnoc: 'E07', giaolong: 'E08', thuongluong: 'B01', haba: 'B02', thuytinh: 'B03' };
const slugCache = {};
const heroSlug = (type) => slugCache[type] || (slugCache[type] = slugify(HEROES[type].name));

// ---- Hình vector cho 4 tướng thần v27: phối lại màu từ tướng cùng dòng + thêm mũ / sừng / vương miện
(function deriveArt() {
  if (typeof ART === 'undefined' || !ART.hero) return;
  const recolor = (str, map) => Object.entries(map).reduce((a, [f, t]) => a.split(f).join(t), str || '');
  const derive = (to, from, map, add = {}) => {
    const src = ART.hero[from];
    if (!src || ART.hero[to]) return;
    const out = {};
    for (const k of Object.keys(src)) out[k] = recolor(src[k], map);
    for (const k in add) out[k] = add[k].pre ? add[k].pre + (out[k] || '') : (out[k] || '') + add[k];
    ART.hero[to] = out;
  };
  const feather = (x, rot) => `<path transform="rotate(${rot} ${x} 60)" d="M${x - 4} 62 Q${x - 8} 30 ${x} 14 Q${x + 8} 30 ${x + 4} 62 Z" fill="#F2EEE0" stroke="#2A1608" stroke-width="1.8"/><path transform="rotate(${rot} ${x} 60)" d="M${x} 58 V22" stroke="#B8853A" stroke-width="1.4"/>`;
  derive('lachau', 'lucsi', { '#6A5032': '#7A4A22', '#5E9A3A': '#D9A84E', '#2E5A1E': '#8A5A1E', '#7FC24A': '#FFE08A', '#6A4A2A': '#8A3A22',
    '#8A8070': '#B8853A', '#5A5040': '#6A4418', '#B8AE98': '#F2D27A' }, {
    head: feather(74, -38) + feather(126, 38) + feather(66, -58) + feather(134, 58)
      + '<path d="M70 70 Q100 58 130 70" stroke="#2A1608" stroke-width="7" fill="none"/><path d="M70 70 Q100 58 130 70" stroke="#D9A84E" stroke-width="4" fill="none"/><circle cx="100" cy="63" r="4" fill="#3EDCC0" stroke="#2A1608" stroke-width="1.4"/>',
  });
  const antler = (sx) => `<path d="M${100 + sx * 16} 58 Q${100 + sx * 24} 34 ${100 + sx * 20} 14 M${100 + sx * 22} 38 Q${100 + sx * 34} 32 ${100 + sx * 38} 20 M${100 + sx * 21} 26 Q${100 + sx * 12} 18 ${100 + sx * 10} 8" stroke="#2A1608" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M${100 + sx * 16} 58 Q${100 + sx * 24} 34 ${100 + sx * 20} 14 M${100 + sx * 22} 38 Q${100 + sx * 34} 32 ${100 + sx * 38} 20 M${100 + sx * 21} 26 Q${100 + sx * 12} 18 ${100 + sx * 10} 8" stroke="#C8A070" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  derive('thansan', 'thosan', { '#1E3A22': '#5A3A14', '#2E5A2E': '#B8782A', '#2E4A2A': '#3E6A22', '#4A3220': '#6A3A12', '#D0D8DC': '#F2E6B0' }, {
    head: antler(-1) + antler(1) + '<path d="M80 108 l6 -4 M120 108 l-6 -4 M84 74 l4 6 M116 74 l-4 6" stroke="#2A1608" stroke-width="2.2" stroke-linecap="round"/>',
    body: '<path d="M70 130 l14 6 M70 150 l14 4 M130 130 l-14 6 M130 150 l-14 4" stroke="#1A0C04" stroke-width="3" stroke-linecap="round"/>',
  });
  derive('adv', 'caolo', { '#7A5230': '#A8281E', '#5A3A1A': '#7A1410', '#5A4028': '#5A1A12', '#3A2A14': '#5A1410', '#6A4420': '#8A5A1A', '#9A7038': '#E0B030' }, {
    head: '<path d="M70 62 L74 34 L86 50 L100 26 L114 50 L126 34 L130 62 Q100 54 70 62 Z" fill="#F2C840" stroke="#2A1608" stroke-width="2.2"/><circle cx="100" cy="46" r="4.5" fill="#E2483A" stroke="#2A1608" stroke-width="1.4"/><circle cx="82" cy="54" r="3" fill="#3EDCC0" stroke="#2A1608"/><circle cx="118" cy="54" r="3" fill="#3EDCC0" stroke="#2A1608"/><path d="M84 112 Q100 128 116 112" stroke="#1A0C04" stroke-width="3" fill="none"/>',
  });
  // v52: Mẫu Thượng Ngàn vẽ lại cho khác Âu Cơ — dáng Tiên Dung (tóc búi), áo tứ thân xanh rừng viền vàng,
  // khăn vấn đỏ cài vòng lá + hoa rừng, tay cầm cành cây, ông Hổ nằm bên chân (không có cánh)
  derive('mau', 'tiendung', { '#C8302A': '#2E7A3A' }, {
    head: '<path d="M66 78 Q66 44 100 42 Q134 44 134 78 Q120 60 100 60 Q80 60 66 78 Z" fill="#C8302A" stroke="#2A1608" stroke-width="2"/>'
      + '<path d="M70 70 Q100 50 130 70" stroke="#F2D27A" stroke-width="2.4" fill="none"/>'
      + '<path d="M128 70 q12 -2 14 10 q-8 -2 -12 4 z" fill="#C8302A" stroke="#2A1608" stroke-width="1.6"/>'
      + [[-34, 62, -0.9], [-24, 50, -0.55], [-12, 43, -0.25], [0, 40, 0], [12, 43, 0.25], [24, 50, 0.55], [34, 62, 0.9]].map(([dx, y, r]) =>
        `<ellipse cx="${100 + dx}" cy="${y}" rx="5" ry="10" transform="rotate(${r * 57} ${100 + dx} ${y})" fill="${Math.abs(dx) % 24 ? '#5FB84A' : '#3E8A2E'}" stroke="#2A1608" stroke-width="1.4"/>`).join('')
      + '<circle cx="100" cy="36" r="5" fill="#F7F3FC" stroke="#2A1608" stroke-width="1.4"/><circle cx="100" cy="36" r="2" fill="#FFC44A"/>'
      + '<circle cx="80" cy="44" r="3.6" fill="#E85A8A" stroke="#2A1608"/><circle cx="120" cy="44" r="3.6" fill="#E85A8A" stroke="#2A1608"/>',
  });
  if (ART.hero.mau) {
    ART.hero.mau.weapon = '<path d="M138 168 Q150 110 162 34" stroke="#2A1608" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M138 168 Q150 110 162 34" stroke="#7A5232" stroke-width="5" fill="none" stroke-linecap="round"/>'
      + [[152, 120, -40], [146, 96, 40], [157, 78, -35], [152, 58, 35], [162, 40, -20], [168, 30, 30]].map(([x, y, r]) =>
        `<ellipse cx="${x}" cy="${y}" rx="6" ry="12" transform="rotate(${r} ${x} ${y})" fill="#5FB84A" stroke="#2A1608" stroke-width="1.6"/><path d="M${x} ${y - 9} V${y + 9}" transform="rotate(${r} ${x} ${y})" stroke="#2E5A1E" stroke-width="1"/>`).join('')
      + '<circle cx="158" cy="66" r="4" fill="#E8403A" stroke="#2A1608" stroke-width="1.2"/><circle cx="148" cy="108" r="4" fill="#E8403A" stroke="#2A1608" stroke-width="1.2"/>';
    // ông Hổ nằm bên chân trái (vẽ sau lưng nên chân / váy của Mẫu đè lên)
    const stripe = (x, y) => `<path d="M${x} ${y} q3 6 0 12" stroke="#1A0C04" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    ART.hero.mau.back = '<path d="M8 196 Q-16 176 -6 156" stroke="#2A1608" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M8 196 Q-16 176 -6 156" stroke="#E8843A" stroke-width="6" fill="none" stroke-linecap="round"/>'
      + '<ellipse cx="40" cy="200" rx="40" ry="20" fill="#E8843A" stroke="#2A1608" stroke-width="2.4"/>'
      + '<path d="M14 214 v8 M30 216 v8 M54 216 v8 M68 212 v10" stroke="#2A1608" stroke-width="8" stroke-linecap="round"/><path d="M14 214 v8 M30 216 v8 M54 216 v8 M68 212 v10" stroke="#E8843A" stroke-width="5" stroke-linecap="round"/>'
      + stripe(20, 186) + stripe(32, 182) + stripe(44, 182) + stripe(56, 186)
      + '<ellipse cx="40" cy="210" rx="26" ry="7" fill="#F7EEDC" opacity="0.9"/>'
      + '<circle cx="78" cy="180" r="18" fill="#E8843A" stroke="#2A1608" stroke-width="2.4"/>'
      + '<path d="M64 168 l-2 -10 l10 4 z M90 166 l4 -10 l-10 4 z" fill="#E8843A" stroke="#2A1608" stroke-width="1.8"/>'
      + '<ellipse cx="82" cy="188" rx="9" ry="6" fill="#F7EEDC" stroke="#2A1608" stroke-width="1.4"/>'
      + '<circle cx="72" cy="178" r="2.6" fill="#1A0C04"/><circle cx="86" cy="178" r="2.6" fill="#1A0C04"/><path d="M80 185 l3 2 l3 -2" fill="#1A0C04"/>'
      + stripe(70, 164) + stripe(80, 162);
  }
  // v94: hình tạm (vector phối màu) cho 11 tướng dân gian mới — thay bằng ảnh Gemini khi có
  const conical = (c) => `<path d="M58 66 L100 24 L142 66 Q100 74 58 66 Z" fill="${c}" stroke="#2A1608" stroke-width="2.4"/><path d="M72 58 L100 30 M128 58 L100 30" stroke="#8A6A3A" stroke-width="1.2"/>`;
  const band = (c) => `<path d="M70 70 Q100 58 130 70" stroke="#2A1608" stroke-width="7" fill="none"/><path d="M70 70 Q100 58 130 70" stroke="${c}" stroke-width="4" fill="none"/>`;
  const halo = (c, r) => `<circle cx="100" cy="80" r="${r}" fill="none" stroke="${c}" stroke-width="5" opacity="0.85"/>` + Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<path d="M${100 + Math.cos(a) * (r + 4)} ${80 + Math.sin(a) * (r + 4)} L${100 + Math.cos(a) * (r + 16)} ${80 + Math.sin(a) * (r + 16)}" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`; }).join('');
  const crown = (c) => `<path d="M70 62 L74 34 L86 50 L100 26 L114 50 L126 34 L130 62 Q100 54 70 62 Z" fill="${c}" stroke="#2A1608" stroke-width="2.2"/>`;
  derive('thoren', 'lucsi', { '#C89060': '#B8704A', '#7FC24A': '#FF7A3A', '#1E3A12': '#5A1A0A', '#6A5032': '#4A2A1A' }, { head: band('#FF7A3A') });
  derive('nguphu', 'thosan', { '#1E3A22': '#1E3A5A', '#2E4A2A': '#2A5A7A', '#2A3A22': '#22384A', '#4A3220': '#3A3A4A' }, { head: conical('#E8D8A8') });
  derive('thogom', 'antiem', { '#3E8A3A': '#A86A3A', '#8A6A3A': '#6A4A2A', '#A87040': '#C99A3C' }, { head: band('#C99A3C') });
  derive('thaylang', 'thansuong', { '#2A5A7A': '#2E6A2E', '#BFD8EC': '#C8E8B0', '#8AB0D0': '#7FC24A', '#6AA8D0': '#5FB84A', '#F4FAFF': '#EEF8E4' }, { head: band('#5FB84A') });
  derive('trongdong', 'lachau', { '#D9A84E': '#F2C840', '#7A4A22': '#8A6A1A', '#8A3A22': '#A87A1A' }, { head: crown('#F2C840') });
  derive('caong', 'kimquy', { '#7A9048': '#4A7A9A', '#A8C070': '#8AC0D8', '#C8302A': '#2A5A8A', '#E8B848': '#BFE8F8' }, {});
  derive('ongtao', 'thachsanh', { '#D9A274': '#C87A5A', '#C8302A': '#E0452C', '#F0C040': '#FFB04A' }, { head: conical('#3A2A1A') });
  derive('matroi', 'tiendung', { '#C8302A': '#E8842A', '#F2A0C0': '#FFD66B' }, { back: { pre: halo('#FFB04A', 46) }, head: crown('#FFD66B') });
  derive('mauthoai', 'tiendung', { '#C8302A': '#E8F4FF', '#F2A0C0': '#9EDDF2', '#F2D27A': '#BFE8F8' }, { head: crown('#E8F4FF') });
  derive('trutroi', 'lucsi', { '#C89060': '#9A8A78', '#7FC24A': '#C99A3C', '#1E3A12': '#4A4038', '#6A5032': '#5A5040' }, { head: band('#C99A3C') });
  // v96: hành Hỏa
  derive('dotnuong', 'thosan', { '#1E3A22': '#5A1A0A', '#2E4A2A': '#8A3A1A', '#2A3A22': '#4A1A0A', '#4A3220': '#5A2A14' }, { head: band('#E0452C') });
  derive('denroi', 'tiendung', { '#C8302A': '#E8842A', '#F2A0C0': '#FFE08A' }, { head: '<g transform="translate(140 40)"><rect x="-10" y="-14" width="20" height="26" rx="6" fill="#FFB04A" stroke="#2A1608" stroke-width="2"/><path d="M-6 -4 H6 M-6 4 H6" stroke="#E0452C" stroke-width="1.6"/><circle cx="0" cy="0" r="3" fill="#FFF1C4"/></g>' });
  derive('potaoapui', 'lachau', { '#D9A84E': '#E0452C', '#7A4A22': '#8A2A12', '#8A3A22': '#C8401E' }, { head: crown('#E0452C') });
  derive('baahoa', 'tiendung', { '#C8302A': '#7A1410', '#F2A0C0': '#E0452C', '#F2D27A': '#FF8A3A' }, { back: { pre: halo('#E0452C', 40) } });
  derive('kinhduong', 'lucsi', { '#C89060': '#C8804A', '#7FC24A': '#E0452C', '#1E3A12': '#7A1410', '#6A5032': '#8A2A12' }, { head: crown('#FFD66B') });
  derive('viemde', 'thaylang', { '#2E6A2E': '#8A4A1A', '#C8E8B0': '#FFE0A8', '#7FC24A': '#FFB04A', '#5FB84A': '#E8842A', '#EEF8E4': '#FFF4E0' }, { back: { pre: halo('#FFB04A', 42) }, head: crown('#FFB04A') });
  // v97: hành Thủy
  derive('chodo', 'thosan', { '#1E3A22': '#1E3A5A', '#2E4A2A': '#3A6A8A', '#2A3A22': '#22384A', '#4A3220': '#4A3A2A' }, { head: band('#5AB4D6') });
  derive('haisen', 'tiendung', { '#C8302A': '#E85A8A', '#F2A0C0': '#7FC24A', '#F2D27A': '#FFE0EC' }, { head: '<g transform="translate(100 36)"><path d="M0 -14 Q8 -4 0 6 Q-8 -4 0 -14Z M-12 -6 Q-2 -2 0 6 Q-12 4 -12 -6Z M12 -6 Q2 -2 0 6 Q12 4 12 -6Z" fill="#FF9EC4" stroke="#2A1608" stroke-width="1.6"/></g>' });
  derive('lyngu', 'lachau', { '#D9A84E': '#E8843A', '#7A4A22': '#A8501A', '#8A3A22': '#E0602A' }, { head: crown('#FFB04A') });
  derive('truongchi', 'xathu', { '#4E8A3A': '#2A5A8A', '#4E6A2E': '#2A4A6A', '#6A4A2A': '#4A3A2A' }, { head: conical('#E8D8A8') });
  derive('halong', 'llq', {}, { head: crown('#7FE8E0') });
  derive('longnu', 'tiendung', { '#C8302A': '#2A8A9A', '#F2A0C0': '#9EDDF2', '#F2D27A': '#BFF0E8' }, { head: crown('#9EDDF2') });
  // v100: hành Thổ
  derive('dapde', 'lucsi', { '#C89060': '#B8804A', '#7FC24A': '#C99A3C', '#1E3A12': '#4A3A1A' }, { head: conical('#D9C08A') });
  derive('chantrau', 'xathu', { '#4E8A3A': '#A8784A', '#4E6A2E': '#6A4A2A' }, { head: band('#C99A3C') });
  derive('ongdung', 'lucsi', { '#C89060': '#A8784A', '#7FC24A': '#8A6A3A', '#1E3A12': '#3A2A12', '#6A5032': '#5A4028' }, {});
  derive('thocong', 'thaylang', { '#2E6A2E': '#8A6A1A', '#C8E8B0': '#F2E0A8', '#7FC24A': '#D9A84E', '#5FB84A': '#C99A3C', '#EEF8E4': '#FFF4DC' }, { head: conical('#3A2A1A') });
  derive('tanvien', 'giong', {}, { head: crown('#7FC24A') });
  derive('maudia', 'tiendung', { '#C8302A': '#A8784A', '#F2A0C0': '#E8C27A', '#F2D27A': '#FFE8B0' }, { head: crown('#C99A3C') });
  // v101: hành Kim + Mộc
  derive('giaodong', 'lactuong', {}, { head: band('#D9DDE0') });
  derive('chuongdong', 'thaymo', {}, { head: band('#E0B030') });
  derive('nghedong', 'kimquy', {}, { head: crown('#E0B030') });
  derive('mychau', 'tiendung', { '#C8302A': '#F7F3FC', '#F2A0C0': '#E8E8F0', '#F2D27A': '#FFFFFF' }, { head: crown('#E8E8F0') });
  derive('kylan', 'kimquy', {}, { head: crown('#FFD66B') });
  derive('thienloi', 'thaymo', {}, { head: crown('#BFD8FF') });
  derive('tre', 'thosan', {}, { head: band('#D4DC70') });
  derive('ongthoi', 'xathu', {}, { head: band('#5FB84A') });
  derive('sodua', 'thosan', {}, { head: '<circle cx="100" cy="40" r="16" fill="#8A6A3A" stroke="#2A1608" stroke-width="2.2"/><circle cx="94" cy="36" r="2.4" fill="#2A1608"/><circle cx="106" cy="36" r="2.4" fill="#2A1608"/>' });
  derive('cuoi', 'thachsanh', {}, { head: crown('#7FE07A') });
  derive('melua', 'tiendung', { '#C8302A': '#C8A030', '#F2A0C0': '#E8E070' }, { head: crown('#F2D27A') });
  derive('ongho', 'thansan', { '#B8782A': '#E8843A', '#5A3A14': '#C8642A', '#3E6A22': '#8A4A1A' }, {});
  // icon kỹ năng: mượn icon chiêu cùng loại của tướng khác (đổi tiền tố id để không trùng)
  const ICON_SRC = {
    lachau: [['lactuong', 'E'], ['lucsi', 'W'], ['kimquy', 'E'], ['kimquy', 'R']],
    thansan: [['xathu', 'E'], ['thosan', 'E'], ['llq', 'Q'], ['thosan', 'R']],
    adv: [['caolo', 'Q'], ['caolo', 'W'], ['xathu', 'W'], ['caolo', 'R']],
    mau: [['langlieu', 'E'], ['thansuong', 'E'], ['langlieu', 'W'], ['auco', 'E']],
    thoren: [['lactuong', 'Q'], ['thaymo', 'W'], ['lucsi', 'E'], ['thaymo', 'R']],
    nguphu: [['thosan', 'Q'], ['thosan', 'W'], ['thansuong', 'E'], ['llq', 'R']],
    thogom: [['antiem', 'Q'], ['antiem', 'W'], ['lucsi', 'W'], ['lucsi', 'R']],
    thaylang: [['cdt', 'Q'], ['langlieu', 'W'], ['langlieu', 'W'], ['auco', 'R']],
    trongdong: [['lactuong', 'E'], ['lactuong', 'Q'], ['lactuong', 'W'], ['lactuong', 'R']],
    caong: [['llq', 'Q'], ['kimquy', 'Q'], ['kimquy', 'E'], ['llq', 'R']],
    ongtao: [['thaymo', 'Q'], ['thaymo', 'W'], ['thachsanh', 'Q'], ['giong', 'R']],
    matroi: [['thaymo', 'Q'], ['thaymo', 'W'], ['auco', 'W'], ['thaymo', 'R']],
    mauthoai: [['llq', 'Q'], ['cdt', 'W'], ['thansuong', 'R'], ['llq', 'E']],
    trutroi: [['lucsi', 'Q'], ['lucsi', 'R'], ['kimquy', 'E'], ['giong', 'E']],
    ongho: [['thosan', 'Q'], ['thansan', 'W'], ['thosan', 'W'], ['thansan', 'R']],
    dotnuong: [['lactuong', 'Q'], ['thaymo', 'W'], ['thosan', 'W'], ['thaymo', 'R']],
    denroi: [['thaymo', 'Q'], ['thaymo', 'W'], ['auco', 'W'], ['auco', 'R']],
    potaoapui: [['thachsanh', 'Q'], ['thaymo', 'W'], ['thaymo', 'R'], ['giong', 'R']],
    baahoa: [['thaymo', 'Q'], ['thaymo', 'W'], ['tiendung', 'W'], ['thaymo', 'R']],
    kinhduong: [['thachsanh', 'Q'], ['lucsi', 'E'], ['lactuong', 'E'], ['llq', 'R']],
    viemde: [['thaymo', 'Q'], ['langlieu', 'W'], ['thaymo', 'W'], ['thaymo', 'R']],
    chodo: [['lactuong', 'Q'], ['lactuong', 'W'], ['kimquy', 'E'], ['llq', 'R']],
    haisen: [['cdt', 'W'], ['thansuong', 'W'], ['langlieu', 'W'], ['thansuong', 'R']],
    lyngu: [['thachsanh', 'R'], ['thosan', 'W'], ['llq', 'Q'], ['llq', 'R']],
    truongchi: [['thachsanh', 'E'], ['cdt', 'Q'], ['thansuong', 'R'], ['llq', 'E']],
    halong: [['llq', 'Q'], ['kimquy', 'E'], ['lucsi', 'R'], ['llq', 'R']],
    longnu: [['cdt', 'Q'], ['cdt', 'W'], ['thansuong', 'R'], ['llq', 'E']],
    dapde: [['lactuong', 'Q'], ['lucsi', 'E'], ['kimquy', 'E'], ['lucsi', 'Q']],
    chantrau: [['xathu', 'Q'], ['xathu', 'W'], ['thosan', 'W'], ['caolo', 'R']],
    ongdung: [['lucsi', 'R'], ['lucsi', 'E'], ['lucsi', 'Q'], ['giong', 'E']],
    thocong: [['cdt', 'Q'], ['langlieu', 'W'], ['kimquy', 'E'], ['auco', 'R']],
    tanvien: [['lucsi', 'R'], ['kimquy', 'E'], ['giong', 'E'], ['auco', 'E']],
    maudia: [['lucsi', 'Q'], ['cdt', 'W'], ['mau', 'Q'], ['auco', 'E']],
    giaodong: [['lactuong', 'Q'], ['caolo', 'W'], ['thosan', 'W'], ['lactuong', 'W']],
    chuongdong: [['thachsanh', 'E'], ['thaymo', 'W'], ['cdt', 'W'], ['thachsanh', 'E']],
    nghedong: [['thansan', 'R'], ['kimquy', 'Q'], ['lactuong', 'W'], ['kimquy', 'R']],
    mychau: [['auco', 'W'], ['tiendung', 'W'], ['cdt', 'W'], ['kimquy', 'W']],
    kylan: [['llq', 'Q'], ['kimquy', 'E'], ['lactuong', 'E'], ['giong', 'R']],
    thienloi: [['lactuong', 'R'], ['thaymo', 'W'], ['lactuong', 'R'], ['thaymo', 'R']],
    tre: [['lactuong', 'Q'], ['thosan', 'W'], ['langlieu', 'W'], ['giong', 'W']],
    ongthoi: [['thansan', 'Q'], ['thosan', 'W'], ['thosan', 'E'], ['xathu', 'R']],
    sodua: [['antiem', 'Q'], ['tiendung', 'W'], ['auco', 'E'], ['antiem', 'R']],
    cuoi: [['thachsanh', 'Q'], ['mau', 'W'], ['mau', 'E'], ['mau', 'R']],
    melua: [['langlieu', 'E'], ['langlieu', 'Q'], ['mau', 'Q'], ['tiendung', 'R']],
  };
  for (const [to, list] of Object.entries(ICON_SRC)) {
    if (ART.skill[to]) continue;
    ART.skill[to] = {};
    list.forEach(([from, k], i) => {
      const svg = (ART.skill[from] || {})[k];
      if (svg) ART.skill[to]['QWER'[i]] = svg.split(`sk${from}${k}-`).join(`sk${to}${'QWER'[i]}-`);
    });
  }
})();
// bậc trang phục = độ hiếm trung bình của vũ khí, mũ, giáp (ô trống tính là Thường)
const GEAR_TIER_FILE = ['thuong', 'hiem', 'su-thi', 'huyen-thoai'];
function gearTier(h) {
  if (!h || !h.equip) return 0;
  const sum = GEAR_SLOTS.reduce((a, sl) => a + (h.equip[sl] ? RARITY_ORDER.indexOf(h.equip[sl].rarity) : 0), 0);
  // làm tròn LÊN: mặc món Hiếm đầu tiên là đã đổi sang ảnh bậc Hiếm (trước đây phải 2 món mới đổi)
  return Math.min(3, Math.ceil(sum / GEAR_SLOTS.length));
}
// v: 'B' chân dung, 'C' đứng, 'D' ra đòn (bảng 4 bậc đồ chỉ có dáng đứng)
function heroPng(type, v, h) {
  const slug = heroSlug(type), code = HERO_CODE[type];
  if (v === 'B') return (assetAny([`chan-dung_${slug}.png`, `heroes/hero_${code}_B.png`]) || {}).img || null;
  const tier = GEAR_TIER_FILE[gearTier(h)];
  // thiếu ảnh bậc này (ví dụ ảnh đang chờ vẽ lại) thì lấy bậc gần nhất có ảnh
  // v35: ảnh trên bản đồ theo SAO (không theo đồ mặc) để dễ nhận ra 2 tướng giống nhau mà ghép:
  // ★ → ảnh Thường, ★★ → Hiếm, ★★★ → Sử thi; tướng thần theo Thần tinh. Đồ mặc hiện bằng viền sáng màu độ hiếm.
  const ti = !h || !h.equip ? 0 : h.from ? Math.min(3, h.tier || 0) : Math.max(0, Math.min(2, (h.tier || 1) - 1));
  const near = [0, 1, 2, 3].sort((a, b) => Math.abs(a - ti) - Math.abs(b - ti) || a - b).map((k) => `${slug}_${GEAR_TIER_FILE[k]}.png`);
  const list = v === 'D' ? [`${slug}_ra-don.png`, `heroes/hero_${code}_D.png`] : [...near, `heroes/hero_${code}_C.png`];
  return (assetAny(list) || {}).img || null;
}
// v55: bộ ảnh vẽ tay riêng từng tướng (assets/packs/<tướng>/): idle · wind (lấy đà) · strike (chém) · cast (tung chiêu, tuỳ có) · front · head.
// Cắt từ ảnh ghép gen theo docs/PROMPT_GEMINI.md bằng tools/cat-sheet.py.
// Luôn dùng (không phụ thuộc tuỳ chọn "ảnh AI"); tắt bằng "Tướng vẽ nét".
const HERO_PACK = Object.fromEntries(['lactuong', 'lucsi', 'xathu', 'thosan', 'thaymo', 'thansuong', 'thachsanh', 'lachau', 'thansan',
  'auco', 'adv', 'kimquy', 'llq', 'antiem', 'mau', 'giong', 'cdt', 'caolo', 'tiendung',
  // v105: ảnh Gemini cho 14 tướng Thường mới
  'giaodong', 'chuongdong', 'tre', 'ongthoi', 'dapde', 'chantrau', 'chodo', 'haisen', 'denroi', 'thoren', 'dotnuong', 'nguphu', 'thaylang', 'thogom',
  // v106: ảnh Gemini đợt 2 (tím + vàng)
  'langlieu', 'nghedong', 'mychau', 'trongdong', 'caong', 'lyngu', 'truongchi', 'ongtao', 'potaoapui', 'baahoa', 'ongdung', 'thocong', 'kylan', 'viemde',
  // v107: ảnh Gemini đợt 3 (tướng Vàng)
  'kinhduong', 'longnu', 'halong', 'maudia', 'tanvien', 'melua', 'matroi', 'thienloi', 'cuoi', 'ongho',
].map((k) => [k, `packs/${k}/`]));
const packImg = (type, name) => (HERO_PACK[type] ? asset(HERO_PACK[type] + name + '.png', true) : null);
// v60: quái vẽ tay (assets/packs/<quái>/walk1 · walk2 · attack): bước đi luân phiên, ra đòn khi tấn công
const ENEMY_PACK = new Set(['thachtinh', 'doi', 'ran', 'giaolong', 'tom', 'casau', 'rua', 'phuthuy', 'chimbao', 'echme', 'nongnoc', 'cungan', 'kybinh', 'voichien', 'camap', 'muc', 'cua', 'cao',
  'thuongluong', 'haba', 'thuytinh', 'chantinh', 'daibang', 'anvuong', 'ngutinh', 'hotinh', 'trieuda',
  'tomlua', 'ranbang', 'doima', 'thachvang', 'thietky', 'camapden', 'mucdoc', 'cungtlua', 'tuongthuy', 'chanlua', 'hoden', 'dacon', 'yeutinh', 'linhan']);
const enemyPackRef = (type) => (ENEMY_PACK.has(type) ? asset(`packs/${type}/walk1.png`, true) : null);
// v84: dải 4 khung (tools/cat-strip.py) — mã → các động tác đã có <động tác>_1..4.png
const FRAME_ANIMS = {};
const FRAME_N = 4;
function animFrame(type, anim, k) {
  if (!(FRAME_ANIMS[type] || []).includes(anim)) return null;
  const img = asset(`packs/${type}/${anim}_${(k % FRAME_N) + 1}.png`, true);
  if (img) img.__grp = type + '/' + anim;
  return img;
}
function enemyPackImg(e, t) {
  const ref = enemyPackRef(e.type);
  if (!ref) return null;
  const fr = FRAME_ANIMS[e.type];
  if (fr) {
    const id0 = e.id || 0;
    if (e.atkT > 0 && fr.includes('attack')) { const a = animFrame(e.type, 'attack', Math.min(3, Math.floor((1 - e.atkT / 0.45) * 4))); if (a) return a; }
    if (fr.includes('walk')) { const w = animFrame(e.type, 'walk', Math.floor(t * (e.enraged ? 12 : 8) + id0 * 0.37)); if (w) return w; }
  }
  const id = e.id || 0;
  // ra đòn: khi vừa tấn công, hoặc thỉnh thoảng nhe nanh / vung tay (0,35 giây mỗi ~3 giây); hoá điên thì liên tục
  const flourish = ((t + id * 0.73) % 3) < 0.35;
  const atk = e.atkT > 0 || flourish || (e.enraged && Math.floor(t * 4 + id) % 2 === 0);
  const step = Math.floor(t * (e.enraged ? 8 : 5) + id * 0.37) % 2;
  // boss hoá điên: ảnh nổi giận (nếu có)
  if (e.enraged) { const r = asset(`packs/${e.type}/rage.png`, true); if (r && !e.atkT) return r; }
  return (atk && asset(`packs/${e.type}/attack.png`, true)) || (step && asset(`packs/${e.type}/walk2.png`, true)) || ref;
}
const vectorHeroesOn = () => typeof ui !== 'undefined' && !!(ui && ui.save && ui.save.settings.vectorHeroes);
// v85: chỉ tải sẵn ảnh chính (đứng / bước 1); các dáng khác tải khi cần — đỡ ~4 MB lúc mở game trên 4G
if (typeof Image !== 'undefined') for (const k of ENEMY_PACK) asset(`packs/${k}/walk1.png`, true);
function registerFrames(type, anims) {   // gọi khi thêm dải khung mới
  FRAME_ANIMS[type] = anims;
  for (const a of anims) for (let i = 1; i <= FRAME_N; i++) asset(`packs/${type}/${a}_${i}.png`, true);
}
for (const [k, v] of Object.entries(FRAME_ANIMS)) registerFrames(k, v);
if (typeof Image !== 'undefined') for (const k in HERO_PACK) for (const n of ['idle', 'head']) packImg(k, n);   // tải sẵn
const ENEMY_FILE = { tom: 'quai_tom-binh', casau: 'quai_ca-sau', rua: 'quai_rua-giap', phuthuy: 'quai_phu-thuy-nuoc',
  chimbao: 'quai_chim-bao', echme: 'quai_ech-me', nongnoc: 'quai_nong-noc',
  thuongluong: 'boss_thuong-luong', haba: 'boss_ha-ba', thuytinh: 'boss_thuy-tinh' };
// e (tuỳ chọn): chọn ảnh theo trạng thái (hóa điên, tinh anh, Hà Bá hóa Kim, Giao Long theo hành)
const enemyPng = (type, elite, e) => {
  const c = ENEMY_CODE[type];
  if (!c) return null;
  const f = ENEMY_FILE[type];
  const list = [];
  if (type === 'giaolong') list.push(`giao-long_${(e && e.el) || 'thuy'}.png`);
  if (e && e.enraged && (type === 'casau' || type === 'thuongluong')) list.push(`${f}-hoa-dien.png`);
  if (e && type === 'haba' && e.el === 'kim') list.push('boss_ha-ba-kim.png');
  if (elite && type === 'rua') list.push('quai_rua-giap-tinh-anh.png');
  if (f) list.push(`${f}.png`);
  const dir = c[0] === 'B' ? 'bosses' : 'enemies';
  if (elite) list.push(`${dir}/${c}_elite_B.png`);
  list.push(`${dir}/${c}.png`);
  return (assetAny(list) || {}).img || null;
};
// icon đồ: đồ trang phục theo loại + độ hiếm, đồ bộ theo bộ, phụ kiện / đồ ghép / sính lễ theo tên
const ITEM_FILE = { no_tre: 'no', gay_mo: 'gay-thay-mo', mu_long_chim: 'mulong-chim', song_riu: 'song-riu-cuong-no',
  ngua_hong_mao: 'ngua-chin-hong-mao' };
const RAR_FILE = { common: 'thuong', rare: 'hiem', epic: 'su-thi', legendary: 'huyen-thoai' };
const KIND_FILE = { blade: 'riu', bow: 'no', staff: 'gay', helmet: 'mu', armor: 'giap' };
function itemPngPath(id, rarity) {
  const it = ITEMS[id];
  const kind = KIND_FILE[it.slot === 'weapon' ? it.wclass : it.slot];
  const list = [];
  if (it.set) list.push(`bo-${slugify(SETS[it.set].name.replace('Bộ ', ''))}_${kind}.png`);
  else if (kind) list.push(`do_${kind}_${RAR_FILE[rarity || it.rarity]}.png`);
  else list.push(`${it.bossOnly ? 'sinh-le' : it.recipe ? 'do-ghep' : 'phu-kien'}_${slugify(it.name)}.png`);
  list.push(`items/${ITEM_FILE[id] || id.replace(/_/g, '-')}.png`);
  return list;
}
// v107: icon kỹ năng vẽ tay cắt bằng tools/cat-icons.py → assets/packs/<tướng>/sk-q.png … sk-r.png
const SKILL_PACK = new Set(['dapde', 'chantrau', 'giaodong', 'tre', 'chuongdong', 'ongthoi',
  'halong', 'viemde', 'kinhduong', 'trutroi', 'mauthoai', 'longnu']);
const skillPngPath = (type, i) => [...(SKILL_PACK.has(type) ? [`packs/${type}/sk-${SKILL_KEYS[i].toLowerCase()}.png`] : []), `ky-nang_${heroSlug(type)}_${SKILL_KEYS[i].toLowerCase()}.png`, `skills/${HERO_CODE[type]}_${SKILL_KEYS[i]}.png`];
const SCENE_FILE = { menu: ['nen_menu.png', 'key-art-menu.png'], story1: ['truyen_1.png', 'scenes/story-1.png'],
  story2: ['truyen_2.png', 'scenes/story-2.png'], story3: ['truyen_3.png', 'scenes/story-3.png'],
  win: ['nen_thang.png', 'scenes/victory-bg.png'], lose: ['nen_thua.png', 'scenes/defeat-bg.png'],
  kholua: 'ui_kho-lua.png', huvua: 'ui_hu-vua-hung.png',
  mountain1: ['ban-do_nui-1.png', 'scenes/mountain-1.png'], mountain2: ['ban-do_nui-2.png', 'scenes/mountain-2.png'],
  mountain3: ['ban-do_nui-3.png', 'scenes/mountain-3.png'], mountain4: ['ban-do_nui-4.png', 'scenes/mountain-4.png'],
  mountain5: ['ban-do_nui-5.png', 'scenes/mountain-5.png'],
  voi: ['sinh-le_voi-chin-nga.png', 'items/voi-chin-nga.png'], ga: ['sinh-le_ga-chin-cua.png', 'items/ga-chin-cua.png'],
  ngua: ['sinh-le_ngua-chin-hong-mao.png', 'items/ngua-chin-hong-mao.png'], hubau: ['ui_hu-bau.png', 'items/hu-bau.png'] };
// Hiệu ứng: dải khung hình nằm ngang, mỗi khung vuông (rộng = cao)
const VFX_FILE = { pillar: 'fire-pillar', explosion: 'fire-burst', nova: 'ice-ring', snow: 'freeze', wave: 'water-wave',
  bolt: 'lightning', xslash: 'slash-gold', slash: 'slash-gold', claw: 'slash-gold', heal: 'heal', dome: 'shield-gold',
  rockfall: 'rocks', cracks: 'rocks', drop: 'coins', notes: 'music-notes', summon: 'spawn-ring', die: 'dust',
  bash: 'hit-spark', floodrise: 'flood-rise', raise: 'mountain-rise' };
function vfxSheet(type) {
  const f = VFX_FILE[type];
  return f ? asset(`vfx/${f}.png`) : null;
}
// vẽ một khung của dải hiệu ứng theo tiến độ p (0..1), tâm (x, y), cạnh size
function drawVfx(ctx, img, p, x, y, size) {
  const n = Math.max(1, Math.round(img.naturalWidth / img.naturalHeight));
  const fr = Math.min(n - 1, Math.floor(p * n));
  const fw = img.naturalWidth / n;
  ctx.drawImage(img, fr * fw, 0, fw, img.naturalHeight, x - size / 2, y - size / 2, size, size);
}

// ------------------------------------------------------------
//  BẢN ĐỒ
// ------------------------------------------------------------
let mapImgKey = '';
function mapImage(pw, ph, level) {
  const png = asset(`maps/map-0${(level || 0) + 1}.png`);
  if (png) return png;
  if (!HAS_ART) return null;
  // v48: nền dựng theo bản đồ của ải (js/maps.js)
  const id = typeof MAP_ID !== 'undefined' && MAP_ID ? MAP_ID : 'song1';
  const key = `map|${id}|${pw}x${ph}`;
  mapImgKey = key;
  return svgCache.get(key) || svgImage(key, sizedSvg(typeof buildMapSvg === 'function' ? buildMapSvg(id) : ART.map, pw, ph));
}

// Vẽ nền dự phòng khi chưa có ảnh: cỏ + sông theo đường đi
function drawMapFallback(ctx) {
  ctx.fillStyle = '#3A5A28';
  ctx.fillRect(0, 0, CONFIG.W, CONFIG.H);
  strokePath(ctx, CONFIG.path, 104 * DK, 'rgba(44,106,134,0.5)');
  strokePath(ctx, CONFIG.path, 54 * DK, '#8A7650');
  strokePath(ctx, CONFIG.path, 42 * DK, '#1F5670');
}

function strokePath(ctx, pts, w, color, dash) {
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
  if (dash) ctx.setLineDash([]);
}

// Mực nước: dải nước tràn hai bờ rộng dần theo số bậc đã ngập
function drawWaterLevel(ctx, water, t) {
  if (water <= 0) return;
  const w = (104 + water * 70) * DK;
  ctx.save();
  ctx.globalAlpha = 0.28 + Math.sin(t * 1.5) * 0.03;
  strokePath(ctx, CONFIG.path, w, '#2C6A86');
  ctx.globalAlpha = 0.35;
  strokePath(ctx, CONFIG.path, w, 'rgba(158,221,242,0.5)', [6, 18]);
  ctx.restore();
}

// Ô đặt tướng theo bản thiết kế: ellipse 15×10 (tọa độ thiết kế)
// state: dry | flooded | raised | target | free | hint | soon
function drawSpot(ctx, x, y, o, t) {
  const rx = 15 * DK, ry = 10 * DK;
  const tk = o.flooded ? 'ngap' : o.raised || o.tier === 2 ? 'cao' : o.tier === 1 ? 'giua' : 'thap';
  const tile = (assetAny([`ban-do_o-${tk}.png`, `tiles/tile-${{ ngap: 'flooded', cao: 'high', giua: 'mid', thap: 'low' }[tk]}.png`]) || {}).img;
  if (tile) {
    // ô vẽ tay: ảnh vuông, vẽ phẳng theo phối cảnh ô (rộng 2.4 × bán kính)
    ctx.drawImage(tile, x - rx * 1.25, y - ry * 1.25, rx * 2.5, ry * 2.5);
    o = { ...o, tileArt: true };
  }
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  if (o.tileArt) {
    // đã có ảnh ô
  } else if (o.flooded) {
    ctx.fillStyle = 'rgba(44,106,134,0.85)';
    ctx.fill();
    ctx.setLineDash([3 * DK, 3 * DK]);
    ctx.strokeStyle = '#9EDDF2';
    ctx.lineWidth = 1.5 * DK;
    ctx.stroke();
    ctx.setLineDash([]);
  } else if (o.raised) {
    ctx.fillStyle = '#A07E48';
    ctx.fill();
    ctx.strokeStyle = '#F2D27A';
    ctx.lineWidth = 2 * DK;
    ctx.stroke();
    if (!o.hero) {
      ctx.strokeStyle = '#3A2A12';
      ctx.lineWidth = 1.5 * DK;
      ctx.beginPath();
      ctx.moveTo(x - 7 * DK, y + 1 * DK); ctx.lineTo(x, y - 5 * DK); ctx.lineTo(x + 7 * DK, y + 1 * DK);
      ctx.stroke();
    }
  } else if (o.tier === 2) {
    ctx.fillStyle = '#8C7A5A';
    ctx.fill();
    ctx.strokeStyle = '#C8B48A';
    ctx.lineWidth = 1.5 * DK;
    ctx.stroke();
  } else {
    ctx.fillStyle = o.tier === 0 ? '#4F7240' : '#5C7A3A';
    ctx.fill();
    ctx.strokeStyle = o.tier === 0 ? '#9CC6A8' : '#A9C27A';
    ctx.lineWidth = 1.5 * DK;
    ctx.stroke();
  }
  // sắp ngập: nhấp nháy xanh
  if (o.soon && !o.flooded && !o.raised) {
    ctx.globalAlpha = 0.45 + Math.sin(t * 7) * 0.4;
    ctx.fillStyle = 'rgba(90,180,214,0.6)';
    ctx.fill();
    ctx.strokeStyle = '#9EDDF2';
    ctx.lineWidth = 2.5 * DK;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  if (o.mode === 'target' || o.mode === 'raise') {
    const g = ctx.createRadialGradient(x, y, 2, x, y, rx * 2);
    g.addColorStop(0, 'rgba(255,214,107,0.55)');
    g.addColorStop(1, 'rgba(255,214,107,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, rx * 2, ry * 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFD66B';
    ctx.lineWidth = 2.5 * DK;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1.5 * DK;
    ctx.setLineDash([4 * DK, 4 * DK]);
    ctx.lineDashOffset = -t * 20;
    ctx.beginPath();
    ctx.ellipse(x, y, 22 * DK, 14 * DK, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  } else if (o.mode === 'free') {
    ctx.globalAlpha = 0.5 + Math.sin(t * 5) * 0.3;
    ctx.strokeStyle = '#FFF1C4';
    ctx.lineWidth = 2 * DK;
    ctx.stroke();
    ctx.globalAlpha = 1;
  } else if (o.mode === 'hint') {
    ctx.strokeStyle = '#FFD66B';
    ctx.lineWidth = 2 * DK;
    ctx.globalAlpha = 0.5 + Math.sin(t * 5) * 0.4;
    ctx.beginPath();
    ctx.ellipse(x, y, rx + 4 + Math.sin(t * 5) * 3, ry + 3 + Math.sin(t * 5) * 2, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  } else if (o.mode === 'sel') {
    ctx.strokeStyle = '#3EDC4E';
    ctx.lineWidth = 2.5 * DK;
    ctx.beginPath();
    ctx.ellipse(x, y, 21 * DK, 9 * DK, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

// ------------------------------------------------------------
//  NGOẠI HÌNH TƯỚNG: hình gốc + trang bị + bậc tiến hoá + bộ đồ
// ------------------------------------------------------------
//  NGOẠI HÌNH TƯỚNG (v15): đồ theo độ hiếm, tiến hoá 3 bậc, hào quang
// ------------------------------------------------------------
const RAR_COLOR = { common: '#8A8478', rare: '#4FA3D9', epic: '#A86CE0', legendary: '#F0A030' };
const RAR_RANK = { common: 0, rare: 1, epic: 2, legendary: 3 };
// Chất liệu theo độ hiếm: Thường gỗ/tre/vải gai · Hiếm đồng thau · Sử thi đồng khắc + ngọc
// · Huyền thoại vàng ròng · Bộ Lạc Long xanh ngọc + vàng (vảy rồng)
const MAT = {
  common:    { main: '#8C7A5E', dark: '#5A4A36', light: '#B8A27A', gem: '#8A8478' },
  rare:      { main: '#C8943A', dark: '#7A5418', light: '#F2D27A', gem: '#4FA3D9' },
  epic:      { main: '#B07A3A', dark: '#5E3A14', light: '#E8C070', gem: '#3EC08A' },
  legendary: { main: '#F2C040', dark: '#A86A10', light: '#FFF1C4', gem: '#E25A3A' },
  set:       { main: '#1F9A8A', dark: '#0E5A50', light: '#F2D27A', gem: '#F2D27A' },
};
// chất liệu riêng của từng bộ đồ; đồ thường đổi màu điểm nhấn (đá quý) theo hành
const MAT_SET = {
  laclong: MAT.set,
  sontinh: { main: '#8C7A5A', dark: '#4A3E2A', light: '#C8B48A', gem: '#5FB84A' },
  chimlac: { main: '#E8DDBF', dark: '#9A8A60', light: '#FFF8E0', gem: '#F2D27A' },
  drum:    { main: '#B07A3A', dark: '#5E3A14', light: '#F2D27A', gem: '#F2D27A' },
  nguasat: { main: '#3A3030', dark: '#1A1414', light: '#E0452C', gem: '#FF8A2E' },
};
const matOf = (g) => (g.set ? MAT_SET[g.set] || MAT.set
  : g.el && g.rarity !== 'common' ? { ...MAT[g.rarity], gem: ELEMENTS[g.el].color } : MAT[g.rarity]);
// loại vũ khí theo tướng cơ bản (bảng v15)
const WEAPON_KIND = { lactuong: 'axe', lucsi: 'axe', thosan: 'daggers', xathu: 'crossbow', thaymo: 'staff', thansuong: 'staff' };
// tướng huyền thoại giữ dáng vũ khí đặc trưng; mũ / giáp đổi kiểu riêng
const LEGEND_HELM = { giong: 'helm', llq: 'horncrown', kimquy: 'crownSmall', cdt: 'conical', antiem: 'conical', tiendung: 'flower', langlieu: 'turban',
  lachau: 'helm', adv: 'crownSmall', mau: 'flower', trongdong: 'crownSmall', caong: 'horncrown', ongtao: 'conical',
  matroi: 'flower', mauthoai: 'flower', trutroi: 'helm', ongho: 'horncrown',
  potaoapui: 'crownSmall', baahoa: 'flower', kinhduong: 'crownSmall', viemde: 'turban',
  lyngu: 'crownSmall', truongchi: 'conical', halong: 'horncrown', longnu: 'flower',
  thocong: 'conical', tanvien: 'crownSmall', maudia: 'flower',
  nghedong: 'horncrown', mychau: 'flower', kylan: 'horncrown', thienloi: 'helm', sodua: 'conical', cuoi: 'crownSmall', melua: 'flower' };
const LEGEND_ARMOR = { kimquy: 'shell', auco: 'wings' };
const ACC_AURA_KIND = { trong_dong: 'drum', giap_bat_diet: 'copper' };
const TIER_SCALE = [1, 1.10, 1.15, 1.20];

function computeLook(h) {
  const def = HEROES[h.type];
  const look = {
    helmet: null, armor: null, weapon: null, tier: h.from ? (h.baseTier ?? 3) : h.tier || 0, asc: h.from ? h.tier || 0 : 0, attrColor: ELEMENTS[def.el].color,
    legend: !!def.legend, bulk: (def.look.bulk || 1) * (1 + (h.grow || 0) * 0.025),
    accAura: null, wings: null, wingScale: 1, sparkWings: false,
  };
  for (const slot of GEAR_SLOTS) {
    const inst = h.equip[slot];
    if (!inst) continue;
    const it = ITEMS[inst.id];
    const g = { rarity: inst.rarity, plus: inst.plus, set: it.set || null, el: inst.el };
    if (slot === 'weapon') { g.kind = def.legend ? 'signature' : WEAPON_KIND[h.type] || 'axe'; g.ice = h.type === 'thansuong'; }
    if (slot === 'helmet') g.style = (def.legend && LEGEND_HELM[h.type]) || 'rarity';
    if (slot === 'armor') g.style = def.legend ? LEGEND_ARMOR[h.type] || 'tint' : 'rarity';
    look[slot] = g;
  }
  // hào quang phụ kiện: chỉ hiện 1 món mạnh nhất cho đỡ rối
  for (const slot of ACC_SLOTS) {
    const inst = h.equip[slot];
    const it = inst && ITEMS[inst.id];
    if (!it || !it.look || !it.look.aura) continue;
    if (!look.accAura || RAR_RANK[inst.rarity] > RAR_RANK[look.accAura.rarity]) {
      look.accAura = { color: it.look.aura, rarity: inst.rarity, kind: ACC_AURA_KIND[inst.id] || 'ring' };
    }
  }
  const full = activeSets(h.equip);
  if (full.includes('laclong')) {
    look.wings = SETS.laclong.look.wings;
    if (h.type === 'llq') { look.wingScale = 1.5; look.sparkWings = true; }
  }
  look.setFx = full.find((k) => k !== 'laclong') || null;    // hiệu ứng sau lưng khi đủ bộ
  return look;
}

// ------------------------------------------------------------
//  TƯỚNG: các phần SVG (sau lưng, chân, tay sau, thân, đầu, tay trước,
//  vũ khí) trong khung 200×230, chân tại (100, 222)
// ------------------------------------------------------------
const HERO_VB = [-60, -50, 320, 300];   // khung vẽ rộng hơn để chứa vũ khí, cánh
const HERO_PARTS = ['back', 'legs', 'armB', 'body', 'head', 'armF', 'weapon'];

function heroPartImage(type, part, q) {
  if (!HAS_ART || !ART.hero[type]) return null;
  const a = ART.hero[type];
  if (!a[part]) return null;
  const [vx, vy, vw, vh] = HERO_VB;
  const key = `h|${type}|${part}|${q}`;
  let img = svgCache.get(key);
  if (!img) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx} ${vy} ${vw} ${vh}" width="${Math.round(vw * q)}" height="${Math.round(vh * q)}">${a.defs || ''}${a[part]}</svg>`;
    img = svgImage(key, svg);
  }
  return img;
}
// chất lượng ảnh theo kích thước vẽ thực tế
// v47: luôn dựng ảnh ≥ kích thước hiện thật (không phóng to ảnh nhỏ → nhòe), làm tròn lên theo bậc 0,15
function heroQ(px) {
  // v49: dựng lớn hơn cỡ hiện 1,6 lần rồi thu nhỏ khi vẽ (thu nhỏ chất lượng cao → nét hơn phóng to / vừa khít)
  return Math.min(3.6, Math.max(0.45, Math.ceil(px * 1.6 / 0.15) * 0.15));
}

function drawPart(ctx, img, glow, blur) {
  if (!ready(img)) return false;
  const [vx, vy, vw, vh] = HERO_VB;
  if (glow) { ctx.save(); ctx.shadowColor = glow; ctx.shadowBlur = blur || 8; }
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, vx, vy, vw, vh);
  if (glow) ctx.restore();
  return true;
}

// ánh theo độ hiếm (dùng cho shadow khi vẽ): Hiếm viền mảnh, Sử thi thở chậm, Huyền thoại rực
function rarityGlow(g, t) {
  if (!g) return null;
  if (g.set) return { color: g.set === 'laclong' ? '#3EDCC0' : SETS[g.set].glow, blur: 7 };
  if (g.rarity === 'rare') return { color: RAR_COLOR.rare, blur: 4 };
  if (g.rarity === 'epic') return { color: RAR_COLOR.epic, blur: 5 + Math.sin(t * 2) * 3 };
  if (g.rarity === 'legendary') return { color: RAR_COLOR.legendary, blur: 9 + Math.sin(t * 4) * 3 };
  return null;
}

// Vẽ tướng. o: { t, dir, scale, swing, castT, castUlt, hurt, bog, fall, summon, px, noShadow,
//   bounce (lên cấp 0.3 → 0), evo (tiến hoá 1.2 → 0), wingT (bung cánh 1.5 → 0) }
// o.px = số điểm ảnh màn hình trên 1 đơn vị khung 200×230 (chọn độ nét ảnh)
function drawHeroSprite(ctx, h, x, y, o = {}) {
  const def = HEROES[h.type];
  const look = o.look || computeLook(h);
  const t = o.t || 0;
  const dir = o.dir || 1;
  // tiến hoá: 60% đầu giữ kích thước cũ, rồi hạ xuống với kích thước mới
  let tierShown = look.tier, ascShown = look.asc || 0;
  let evoLift = 0;
  if (o.evo > 0) {
    const p = 1 - o.evo / 1.2;
    evoLift = -10 * Math.sin(Math.PI * Math.min(1, p / 0.8));
    if (p < 0.6) { if (ascShown > 0) ascShown--; else tierShown = Math.max(0, look.tier - 1); }
  }
  // Thần tinh: mỗi bậc to thêm 4%
  const s = (o.scale || 0.26) * TIER_SCALE[tierShown] * (1 + 0.04 * ascShown) * look.bulk;
  const q = heroQ((o.px || 1) * s);
  const seed = (h.id || 0) * 1.7;
  const breathe = Math.sin(t * 2.85 + seed) * 3;
  const headRot = Math.sin(t * 1.9 + seed) * 0.05;
  const backRot = Math.sin(t * 2.2 + seed) * 0.07;
  // vung đòn / bắn / phép: 3 pha lấy đà → ra đòn → thu về (u: 0 → 1)
  // v44: mỗi tướng có kiểu đứng + đòn đánh riêng (js/costume.js); chiêu (castT) dùng dáng tung chiêu chung
  const style = heroStyle(h.type);
  const idle = o.noIdle ? { dy: 0, rot: 0 } : idlePose(style, t, seed);
  const rawPose = styledAttackPose(style, o.swing || 0, o.castT || 0) || attackPose(def.attack, o.swing || 0, o.castT || 0, !!o.castUlt);
  const pose = o.smooth ? smoothPose(h, rawPose, t) : rawPose;
  const legendR = def.legend || null;
  const { armF, armB, lunge, lift, recoil, big, lean, sqx, sqy } = pose;
  let drop = 0, fallRot = 0, alpha = o.alpha ?? 1;
  drop = idle.dy;
  if (o.summon > 0) drop = -60 * (o.summon / 0.5) * (o.summon / 0.5);
  if (o.bounce > 0) drop -= (4 * DK / s) * Math.sin(Math.PI * (1 - o.bounce / 0.3));   // nảy 4px khi lên cấp
  if (o.fall !== undefined) { fallRot = (1 - o.fall / 0.6) * 1.45; alpha *= Math.max(0.15, o.fall / 0.6); }
  const sink = o.bog ? 10 : 0;
  const hurtX = o.hurt > 0 ? -6 * (o.hurt / 0.2) : 0;

  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  if (!o.noShadow) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 13 * DK * (s / 0.28), 4 * DK * (s / 0.28), 0, 0, Math.PI * 2);
    ctx.fill();
    // v50: bỏ các vòng tròn dưới chân (cấp sao, Thần tinh, phụ kiện); cấp sao / Thần tinh đã hiện ở trang phục,
    // hào quang sau lưng; phụ kiện chỉ còn quầng sáng (không vòng). Ô trống vẫn có vòng.
    if (look.accAura) drawAccAura(ctx, look.accAura, s, t, true);
  }
  ctx.translate(0, evoLift * DK * (o.scale || 0.26) / 0.26);
  // nghiêng người + co giãn (squash & stretch) quanh bàn chân
  const sway = Math.sin(t * 1.3 + seed) * 0.018 + idle.rot;
  ctx.scale(dir * s * big * sqx, s * big * sqy);
  const hurtRot = o.hurt > 0 ? -0.12 * (o.hurt / 0.2) : 0;
  // ghép đồ từng món (v35): có ảnh thân trần <tên>_than.png thì dùng nó + vẽ mũ / vũ khí / giáp đang mặc lên trên
  const dollBase = !o.vector && h.equip && asset(`${heroSlug(h.type)}_than.png`);
  const idleK = Math.floor((o.t || 0) * 3.2 + (h.id || 0) * 0.71);
  const pack = !o.vector && (animFrame(h.type, 'idle', idleK) || packImg(h.type, 'idle'));
  const pngC = dollBase || pack || (!o.vector && heroPng(h.type, 'C', h));
  // ảnh vẽ tay: chân đứng yên, thân uốn (lean thành độ cong) — không xoay cứng cả tấm
  ctx.rotate(pngC ? (lean + hurtRot) * 0.25 : lean + sway + hurtRot);
  ctx.translate(-100 + (lunge + recoil + hurtX), -222 + drop + sink);
  if (fallRot) { ctx.translate(100, 222); ctx.rotate(fallRot); ctx.translate(-100, -222); }

  // ảnh vẽ tay (assets/): ảnh phẳng không thay được từng món đồ,
  // nên đồ mặc hiện qua bậc trang phục (ảnh theo độ hiếm), hào quang, cánh rồng và sao tiến hoá.
  const png = pngC;
  if (png) {
    if (pack) drawPackBack(ctx, h, look, def, t, tierShown, ascShown);
    else if (look.legend ? ascShown >= 3 : tierShown >= 3) drawSunHalo(ctx, t);
    if (look.wings) withProc(ctx, () => drawWings(ctx, look, t, o.wingT));
    if (look.setFx) withProc(ctx, () => drawSetBack(ctx, look.setFx, t, o.wingT));
    const hgt = 236, w = hgt * png.naturalWidth / png.naturalHeight;
    ctx.translate(100, 222);
    // thở: phần trên phồng nhẹ; uốn: lean + đung đưa thành độ cong của thân (chân giữ nguyên)
    const breath = Math.sin(t * 2.85 + seed) * 0.016 - lift * 0.004;
    const bend = (lean + hurtRot) * 0.75 + sway * 1.4 + Math.sin(t * 1.7 + seed) * 0.012;
    const atkK = pose.phase === 'wind' ? 1 : pose.phase === 'strike' ? 2 : pose.phase === 'recover' ? 3 : 0;
    const pngD = (o.castT > 0 || o.swing > 0) && (pack ? (o.castT > 0 && (animFrame(h.type, 'cast', Math.floor(t * 9)) || packImg(h.type, 'cast')))
      || (o.swing > 0 && animFrame(h.type, 'attack', atkK)) || packImg(h.type, pose.phase === 'wind' ? 'wind' : 'strike') || packImg(h.type, 'strike') : heroPng(h.type, 'D', h));
    // đổi sang ảnh ra đòn mờ dần (không bật cái bụp)
    const mixD = pngD ? (o.smooth ? smoothVal(h, 'mixD', o.castT > 0 || o.swing > 0.35 ? 1 : 0, t, 30) : 1) : 0;
    const base = ctx.globalAlpha;
    // mặc / tháo đồ đổi bậc trang phục: ảnh cũ mờ dần sang ảnh mới (0,35 giây)
    const an = h._anim || (h._anim = {});
    if (o.smooth && an.png !== png && !(png.__grp && an.png && an.png.__grp === png.__grp)) { an.prevPng = an.png; an.png = png; an.swapT = t; }
    const sw = o.smooth && an.prevPng && an.swapT !== undefined ? Math.min(1, Math.max(0, (t - an.swapT) / 0.35)) : 1;
    if (sw < 1) {
      const wp = hgt * an.prevPng.naturalWidth / an.prevPng.naturalHeight;
      ctx.globalAlpha = base * (1 - sw);
      drawBent(ctx, an.prevPng, -wp / 2, -hgt, wp, hgt, bend, breath);
      ctx.globalAlpha = base * sw;
    }
    // tung chiêu: thân phát sáng viền theo màu chiêu
    const glowK = o.castT > 0 ? Math.min(1, o.castT / 0.25) : 0;
    const gt = !dollBase && h.equip ? gearTier(h) : 0;
    // ảnh thân trần giữ khung chuẩn: chân nằm ở 96,5% chiều cao, hạ ảnh xuống cho chạm đất
    if (dollBase) ctx.translate(0, hgt * 0.035);
    // viền sáng (tung chiêu / đồ hiếm): vẽ RIÊNG phần bóng một lần, không bôi lên từng lát ảnh
    // (trước đây 14 lát × shadowBlur → cả người loè thành khối màu và nặng máy)
    if (glowK > 0) drawGlowOnly(ctx, mixD > 0.5 ? pngD : png, -w / 2, -hgt, w, hgt, o.castColor || '#FFE08A', 12 * glowK * (o.castUlt ? 1.4 : 1), 0.8 * glowK);
    else if (gt > 0) drawGlowOnly(ctx, png, -w / 2, -hgt, w, hgt, RAR_COLOR[RARITY_ORDER[gt]], 4 + gt * 2, 0.55 + Math.sin(t * 3) * 0.1);
    // bộ ảnh riêng: ★★ trở lên viền sáng màu hệ (★★★ có thêm vầng mặt trời phía sau)
    else if (pack) packGlow(ctx, png, w, hgt, h, look, def, t, tierShown, ascShown);
    if (mixD < 1) drawBent(ctx, png, -w / 2, -hgt, w, hgt, bend, breath);
    ctx.globalAlpha = base;
    if (dollBase && mixD < 1) drawDollGear(ctx, h, -w / 2, -hgt, w, hgt, bend, t);
    if (mixD > 0) {
      const wd = hgt * pngD.naturalWidth / pngD.naturalHeight;
      ctx.globalAlpha = base * mixD;
      drawBent(ctx, pngD, -wd / 2, -hgt, wd, hgt, bend, breath);
      ctx.globalAlpha = base;
    }
    // vệt mờ khi chém (ghost lùi sau thân)
    if (pose.phase === 'strike' && def.attack === 'melee') {
      ctx.globalAlpha = base * 0.12 * (1 - pose.k);
      drawBent(ctx, mixD > 0.5 ? pngD : png, -w / 2 - 10, -hgt, w, hgt, bend * 0.5, breath);
      ctx.globalAlpha = base;
    }
    if (o.hurt > 0) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = base * (o.hurt / 0.2) * 0.22;
      drawBent(ctx, mixD > 0.5 ? pngD : png, -w / 2, -hgt, w, hgt, bend, breath);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = base;
    }
    if (pack) drawPackFront(ctx, h, def, t, hgt, ascShown);
    ctx.translate(-100, -222);
    drawAttackFx(ctx, def, pose, look, t);
    ctx.restore();
    if (o.bog) drawBogWater(ctx, x, y, s, t);
    return { top: y - 240 * s * big, s };
  }
  const P = (part) => heroPartImage(h.type, part, q);
  const hasArt = !!P('body');
  // sau lưng: vầng sao 12 cánh (★★★ / Thần tinh 3), cánh rồng, cánh lông vũ (Âu Cơ),
  // áo choàng ★★★, vòng sáng Thần tinh, ngọc bay (nửa vòng sau)
  if (look.legend ? ascShown >= 3 : tierShown >= 3) drawSunHalo(ctx, t);
  withProc(ctx, () => { drawCostumeBack(ctx, look, t, tierShown); drawAscBack(ctx, look, ascShown, legendR, t); drawAscOrbit(ctx, look, ascShown, legendR, t, false); });
  if (look.wings) withProc(ctx, () => drawWings(ctx, look, t, o.wingT));
  if (look.setFx) withProc(ctx, () => drawSetBack(ctx, look.setFx, t, o.wingT));
  if (look.armor && look.armor.style === 'wings') withProc(ctx, () => drawFeatherWings(ctx, look.armor, t));
  ctx.save();
  ctx.translate(100, 120); ctx.rotate(backRot); ctx.translate(-100, -120);
  const shellGlow = look.armor && look.armor.style === 'shell' ? rarityGlow(look.armor, t) || { color: '#C8B48A', blur: 3 } : null;
  drawPart(ctx, P('back'), shellGlow && shellGlow.color, shellGlow && shellGlow.blur);
  ctx.restore();
  // v51: tướng có thú cưỡi (Thánh Gióng · ngựa sắt): vẽ ngựa, người ngồi cao hơn, chân buông qua sườn ngựa
  const mounted = def.mount && !o.noMount && hasArt;
  if (mounted) {
    drawIronHorse(ctx, t, pose, !!(o.swing > 0 || o.castT > 0));
    ctx.translate(0, -MOUNT_RIDE);
  }
  if (!hasArt) {
    drawFallbackHero(ctx, def, look, t);
  } else {
    if (mounted) { ctx.save(); ctx.translate(0, MOUNT_RIDE); drawRiderLeg(ctx); ctx.restore(); }
    else drawPart(ctx, P('legs'));
    ctx.save();
    ctx.translate(0, breathe + lift);
    ctx.save(); ctx.translate(78, 124); ctx.rotate(armB); ctx.translate(-78, -124);
    drawPart(ctx, P('armB'));
    ctx.restore();
    // thân: tướng cơ bản mặc giáp theo độ hiếm; tướng huyền thoại giữ trang phục, chỉ đổi ánh
    const armorTint = look.armor && (look.armor.style === 'tint') ? rarityGlow(look.armor, t) || { color: '#C8B48A', blur: 3 } : null;
    drawPart(ctx, P('body'), armorTint && armorTint.color, armorTint && armorTint.blur);
    if (look.armor && look.armor.style === 'rarity') withProc(ctx, () => drawGearArmor(ctx, look.armor, t));
    withProc(ctx, () => drawCostumeBody(ctx, look, t, tierShown));
    // đầu
    ctx.save(); ctx.translate(100, 110); ctx.rotate(headRot); ctx.translate(-100, -110);
    drawPart(ctx, P('head'));
    if (look.legend ? ascShown >= 2 : tierShown >= 3) drawGlowEyes(ctx, look.attrColor, t);
    if (look.helmet) withProc(ctx, () => drawGearHelmet(ctx, look.helmet, t));
    withProc(ctx, () => drawCostumeHead(ctx, look, t, tierShown));
    ctx.restore();
    // tay trước + vũ khí
    ctx.save(); ctx.translate(122, 124); ctx.rotate(armF); ctx.translate(-122, -124);
    drawPart(ctx, P('armF'));
    const w = look.weapon;
    if (w && w.kind !== 'signature') withProc(ctx, () => drawGearWeapon(ctx, w, t));
    else {
      // vũ khí gốc: đồ của tướng huyền thoại đổi ánh theo độ hiếm; ★★ trở lên viền ánh màu hệ
      const gl = w ? rarityGlow(w, t) || { color: '#C8B48A', blur: 3 } : tierShown >= 2 ? { color: look.attrColor, blur: 6 + Math.sin(t * 3) * 2 } : null;
      drawPart(ctx, P('weapon'), gl && gl.color, gl && gl.blur);
      if (w && w.rarity === 'legendary') risingSparks(ctx, 150, 120, RAR_COLOR.legendary, t, 50);
    }
    ctx.restore();
    ctx.restore();
    if (style.atk && style.atk !== 'volley') { drawStyleFx(ctx, pose, look, t); drawTwirlFx(ctx, pose, look); }
    else drawAttackFx(ctx, def, pose, look, t);
  }
  withProc(ctx, () => drawAscOrbit(ctx, look, ascShown, legendR, t, true));
  ctx.restore();

  if (o.bog) drawBogWater(ctx, x, y, s, t);
  return { top: y - (240 + (def.mount && !o.noMount ? MOUNT_RIDE : 0)) * s * big, s };
}

// ------------------------------------------------------------
//  GHÉP ĐỒ TỪNG MÓN LÊN ẢNH VẼ TAY (v35, đang thử)
//  Ảnh thân trần <tên>_than.png (dáng chuẩn docs/dang-chuan.png) + ảnh món đồ đang mặc
//  (do_mu_*, do_riu_*, bộ đồ…) đặt theo điểm neo của từng tướng. Tọa độ neo tính theo
//  khung ảnh (0..1): head = [x giữa, y đỉnh mũ, rộng], hand = [x, y, dài vũ khí, góc], chest = [x, y, rộng].
// ------------------------------------------------------------
const DOLL_ANCHOR = {
  // theo docs/dang-chuan.png (khung 896×1152 giữ nguyên, chân ở 96,5% chiều cao)
  _default: { head: [0.5, 0.035, 0.55], hand: [0.815, 0.6, 0.6, -0.55], chest: [0.5, 0.625, 0.42] },
  'lac-tuong': {},
};
function gearImg(inst) {
  if (!inst) return null;
  const a = assetAny(itemPngPath(inst.id, inst.rarity));
  if (a) return a.img;
  const svg = (HAS_ART && ART.item[inst.id]) || '';
  return svg ? svgImage('gi|' + inst.id, svg.includes('xmlns') ? svg : svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')) : null;
}
function drawDollGear(ctx, h, x, y, w, hh, bend, t) {
  const A = { ...DOLL_ANCHOR._default, ...(DOLL_ANCHOR[heroSlug(h.type)] || {}) };
  const off = (fy) => bend * hh * Math.pow(1 - fy, 2);     // đồ uốn theo thân như drawBent
  const put = (img, cx, cy, ww, rot = 0, glow = null) => {
    if (!img || !(img.naturalWidth || img.width)) return;
    const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    const hw = ww * ih / iw;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    if (glow) { ctx.shadowColor = glow.color; ctx.shadowBlur = glow.blur; }
    ctx.drawImage(img, -ww / 2, -hw / 2, ww, hw);
    ctx.restore();
  };
  const glowOf = (inst) => inst && rarityGlow(inst, t);
  const ar = h.equip.armor, he = h.equip.helmet, wp = h.equip.weapon;
  if (ar) { const [fx, fy, fw] = A.chest; put(gearImg(ar), x + w * fx + off(fy), y + hh * fy, w * fw, 0, glowOf(ar)); }
  if (he) { const [fx, fy, fw] = A.head; const im = gearImg(he); const ww = w * fw;
    const ih = im && (im.naturalHeight || im.height), iw = im && (im.naturalWidth || im.width);
    put(im, x + w * fx + off(fy), y + hh * fy + (ih ? ww * ih / iw / 2 : 0), ww, 0, glowOf(he)); }
  if (wp) { const [fx, fy, fl, rot] = A.hand; put(gearImg(wp), x + w * fx + off(fy), y + hh * fy, w * fl, rot + Math.sin(t * 1.7) * 0.03, glowOf(wp)); }
}

// ------------------------------------------------------------
//  LÀM MƯỢT (v33): tư thế đuổi theo đích bằng lò xo theo thời gian thực, nên đòn sau
//  bắt đầu từ chỗ đòn trước đang dừng (không giật), đổi ảnh / đổi tư thế đều liền mạch.
// ------------------------------------------------------------
const POSE_KEYS = ['armF', 'armB', 'lunge', 'lift', 'recoil', 'big', 'lean', 'sqx', 'sqy'];
function smoothVal(h, key, target, t, rate = 22) {
  const st = h._anim || (h._anim = {});
  const last = st['t_' + key];
  st['t_' + key] = t;
  if (last === undefined || st[key] === undefined || t - last > 0.5 || t < last) return (st[key] = target);
  const a = 1 - Math.exp(-(t - last) * rate);
  return (st[key] += (target - st[key]) * a);
}
function smoothPose(h, P, t) {
  const st = h._anim || (h._anim = {});
  const last = st.tPose;
  st.tPose = t;
  if (!st.pose || last === undefined || t - last > 0.5 || t < last) { st.pose = { ...P }; return P; }
  const dt = t - last;
  // ra đòn cần nhanh (đuổi gắt), lấy đà / thu về mềm hơn
  const rate = P.phase === 'strike' ? 45 : P.phase === 'cast' ? 26 : 18;
  const a = 1 - Math.exp(-dt * rate);
  const out = { ...P };
  for (const k of POSE_KEYS) out[k] = st.pose[k] += (P[k] - st.pose[k]) * a;
  return out;
}
// Vẽ ảnh theo lát ngang: chân (đáy ảnh) đứng yên, càng lên cao càng lệch theo `bend`
// (thân uốn như cây tre), `breath` phồng nhẹ phần ngực / đầu. Mượt hơn xoay cứng cả tấm.
const BENT_SLICES = 14;
// chỉ vẽ quầng sáng bao quanh ảnh (không vẽ ảnh): vẽ ảnh ra ngoài màn hình, dịch bóng về đúng chỗ
// v85: quầng sáng dựng sẵn — mỗi (ảnh, màu, độ nhoè) chỉ làm mờ MỘT lần vào canvas riêng, sau đó chỉ drawImage
// (trước đây đổ bóng nhoè mỗi khung hình cho mỗi tướng: rất nặng trên điện thoại)
const glowCache = new Map();
function glowSprite(img, color, blurPx) {
  const key = color + '|' + blurPx;
  let m = img.__glow || (img.__glow = new Map());
  let c = m.get(key);
  if (c) return c;
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  const pad = Math.ceil(blurPx * 2.2);
  c = document.createElement('canvas'); c.width = iw + pad * 2; c.height = ih + pad * 2;
  const x = c.getContext('2d');
  x.shadowColor = color; x.shadowBlur = blurPx; x.shadowOffsetX = c.width + 50;
  x.drawImage(img, pad - c.width - 50, pad, iw, ih);
  c.__pad = pad;
  if (m.size > 12) m.clear();
  m.set(key, c);
  return c;
}
function drawGlowOnly(ctx, img, x, y, w, h, color, blur, alpha) {
  if (!img || blur <= 0.5 || GFX_LEVEL() >= 2) return;
  const tr = ctx.getTransform();
  const dev = Math.hypot(tr.a, tr.b) * w / (img.naturalWidth || img.width || 1);   // điểm ảnh màn hình / điểm ảnh gốc
  const bpx = Math.max(2, Math.min(48, Math.round(blur / Math.max(0.05, dev) / 3) * 3));   // làm tròn để ít bản sao
  const g = glowSprite(img, color, bpx);
  const k = w / (img.naturalWidth || img.width);
  ctx.save();
  ctx.globalAlpha *= Math.max(0, Math.min(1, alpha));
  ctx.drawImage(g, x - g.__pad * k, y - g.__pad * k, g.width * k, g.height * k);
  ctx.restore();
}
const GFX_LEVEL = () => (typeof GFX !== 'undefined' ? GFX.level() : 0);
function drawBent(ctx, img, x, y, w, h, bend, breath) {
  if (!img) return;
  const iw = img.naturalWidth, ih = img.naturalHeight;
  if (Math.abs(bend) < 0.002 && Math.abs(breath) < 0.002) { ctx.drawImage(img, x, y, w, h); return; }
  // v85: số lát theo cỡ trên màn hình và bậc đồ hoạ (tướng nhỏ trên bản đồ không cần 14 lát)
  const tr = ctx.getTransform(), scr = Math.hypot(tr.c, tr.d) * h;
  const lv = GFX_LEVEL();
  if (lv >= 2 || scr < 40) { const sw = w * (1 + breath * 0.6); ctx.drawImage(img, x + (w - sw) / 2 + bend * h * 0.25, y, sw, h); return; }
  const n = Math.max(4, Math.min(BENT_SLICES, Math.round(scr / (lv === 1 ? 18 : 10))));
  for (let i = 0; i < n; i++) {
    const v0 = i / n, v1 = (i + 1) / n;               // 0 = đỉnh, 1 = chân
    const up = 1 - (v0 + v1) / 2;                      // độ cao giữa lát (0 ở chân)
    const dx = bend * h * up * up;                     // cong dần lên trên
    const sx = 1 + breath * Math.sin(Math.PI * Math.min(1, up * 1.4));
    const sw = w * sx;
    ctx.drawImage(img, 0, v0 * ih, iw, (v1 - v0) * ih + 1, x + (w - sw) / 2 + dx, y + v0 * h, sw, (v1 - v0) * h + 1);
  }
}

// ------------------------------------------------------------
//  HOẠT ẢNH ĐÁNH (v20): lấy đà → ra đòn → thu về, có co giãn và nghiêng người.
//  swing chạy 1 → 0 trong ATTACK_TIME giây; sát thương rơi đúng lúc ra đòn (game.js).
// ------------------------------------------------------------
const easeOut = (k) => 1 - (1 - k) * (1 - k);
const easeInOut = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
function attackPose(attack, swing, castT, ult) {
  const P = { armF: 0, armB: 0, lunge: 0, lift: 0, recoil: 0, big: 1, lean: 0, sqx: 1, sqy: 1, phase: '', k: 0 };
  if (castT > 0) {
    // tung chiêu: giơ vũ khí lên cao, người vươn, rồi hạ
    const k = Math.min(1, castT / 0.3);
    P.armF = 0.3 * easeOut(k); P.armB = 1.8 * k; P.lift = -10 * k; P.lean = -0.06 * k;
    P.sqx = 1 - 0.05 * k; P.sqy = 1 + 0.07 * k; P.phase = 'cast'; P.k = k;
    if (ult) P.big = 1 + 0.14 * Math.min(1, castT / 0.4);
    return P;
  }
  if (!(swing > 0)) return P;
  const u = 1 - swing;
  if (attack === 'melee') {
    if (u < 0.25) {            // lấy đà: vũ khí vòng ra sau, người ngả về sau, hơi nén
      const k = easeOut(u / 0.25);
      P.armF = -1.1 * k; P.lunge = -5 * k; P.lean = -0.07 * k; P.sqx = 1 - 0.04 * k; P.sqy = 1 + 0.05 * k; P.phase = 'wind'; P.k = k;
    } else if (u < 0.45) {     // chém: nhanh, lao tới, dãn ngang
      const k = easeOut((u - 0.25) / 0.2);
      P.armF = -1.1 + 2.8 * k; P.lunge = -5 + 26 * k; P.lean = -0.07 + 0.2 * k; P.sqx = 1 + 0.09 * k; P.sqy = 1 - 0.07 * k; P.phase = 'strike'; P.k = k;
    } else {                   // thu về
      const k = easeInOut((u - 0.45) / 0.55);
      P.armF = 1.7 * (1 - k); P.lunge = 21 * (1 - k); P.lean = 0.13 * (1 - k); P.sqx = 1 + 0.09 * (1 - k); P.sqy = 1 - 0.07 * (1 - k); P.phase = 'recover'; P.k = k;
    }
  } else if (attack === 'arrow') {
    if (u < 0.3) {             // kéo dây: lùi nhẹ, nâng nỏ
      const k = easeOut(u / 0.3);
      P.recoil = -4 * k; P.armF = -0.25 * k; P.lean = -0.04 * k; P.phase = 'wind'; P.k = k;
    } else if (u < 0.42) {     // nhả: giật mạnh về sau
      const k = (u - 0.3) / 0.12;
      P.recoil = -4 - 9 * k; P.armF = -0.25 + 0.15 * k; P.sqx = 1 - 0.05 * k; P.sqy = 1 + 0.04 * k; P.phase = 'strike'; P.k = k;
    } else {
      const k = easeInOut((u - 0.42) / 0.58);
      P.recoil = -13 * (1 - k); P.armF = -0.1 * (1 - k); P.sqx = 1 - 0.05 * (1 - k); P.sqy = 1 + 0.04 * (1 - k); P.phase = 'recover'; P.k = k;
    }
  } else {                     // phép: giơ gậy, tụ sáng, phóng
    if (u < 0.35) {
      const k = easeOut(u / 0.35);
      P.armF = -0.25 * k; P.lift = -6 * k; P.lean = -0.05 * k; P.sqy = 1 + 0.05 * k; P.phase = 'wind'; P.k = k;
    } else if (u < 0.5) {
      const k = (u - 0.35) / 0.15;
      P.armF = -0.25 + 1.15 * k; P.lift = -6 + 4 * k; P.lean = -0.05 + 0.1 * k; P.sqx = 1 + 0.05 * k; P.sqy = 1 + 0.05 - 0.09 * k; P.phase = 'strike'; P.k = k;
    } else {
      const k = easeInOut((u - 0.5) / 0.5);
      P.armF = 0.9 * (1 - k); P.lift = -2 * (1 - k); P.lean = 0.05 * (1 - k); P.sqx = 1 + 0.05 * (1 - k); P.sqy = 1 - 0.04 * (1 - k); P.phase = 'recover'; P.k = k;
    }
  }
  return P;
}
// vệt chém, tia lửa đầu nỏ, quả cầu sáng đầu gậy (khung 200×230, đã lật theo hướng)
function drawAttackFx(ctx, def, P, look, t) {
  if (!P.phase || P.phase === 'cast') return;
  const col = look.weapon ? (look.weapon.set ? '#9EF2E0' : RAR_COLOR[look.weapon.rarity]) : '#FFF1C4';
  ctx.save();
  if (def.attack === 'melee' && (P.phase === 'strike' || (P.phase === 'recover' && P.k < 0.5))) {
    // vệt chém hình lưỡi liềm quanh vai
    const a0 = -2.3, a1 = P.phase === 'strike' ? -2.3 + 2.9 * P.k : 0.6;
    const fade = P.phase === 'strike' ? 1 : 1 - P.k * 2;
    ctx.globalAlpha = 0.85 * fade;
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = i === 0 ? '#FFFFFF' : col;
      ctx.lineWidth = [5, 14, 26][i];
      ctx.globalAlpha = 0.85 * fade * [0.9, 0.45, 0.18][i];
      ctx.beginPath(); ctx.arc(122, 124, 92, Math.max(a0, a1 - 1.6), a1); ctx.stroke();
    }
  } else {
    // nỏ / gậy xoay theo tay trước
    ctx.translate(122, 124); ctx.rotate(P.armF); ctx.translate(-122, -124);
  }
  if (def.attack === 'arrow' && P.phase === 'strike') {
    // chớp sáng đầu nỏ + vòng dây bật
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 1 - P.k;
    if (typeof fxImage === 'function') fxImage(ctx, 'muzzle_02', col, 196, 118, 30, Math.PI / 2, 1, 1);
    const g = ctx.createRadialGradient(178, 118, 0, 178, 118, 34);
    g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.4, col); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(178, 118, 34, 0, Math.PI * 2); ctx.fill();
  } else if (def.attack !== 'arrow' && def.attack !== 'melee') {
    // quả cầu sáng tụ ở đầu gậy rồi bung ra
    const r = P.phase === 'wind' ? 10 + 16 * P.k : P.phase === 'strike' ? 26 + 40 * P.k : 0;
    if (r > 0) {
      const ac = def.attack === 'frost' ? '#BDEBFA' : '#FFB04A';
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = P.phase === 'strike' ? 1 - P.k : 0.9;
      const g = ctx.createRadialGradient(150, 40, 0, 150, 40, r);
      g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.35, ac); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(150, 40, r, 0, Math.PI * 2); ctx.fill();
      if (P.phase === 'strike') { ctx.strokeStyle = ac; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(150, 40, r * 1.2, 0, Math.PI * 2); ctx.stroke(); }
    }
  }
  ctx.restore();
}

// chuyển sang hệ tọa độ vẽ đồ (đầu tại (0,-34) bán kính 8) trong khung 200×230
function withProc(ctx, fn) {
  ctx.save();
  ctx.translate(100, 211.5);
  ctx.scale(3.75, 3.75);
  fn();
  ctx.restore();
}

// hạt sáng bay lên (khung 200×230)
function risingSparks(ctx, cx, cy, color, t, spread) {
  ctx.save();
  ctx.fillStyle = color;
  for (let i = 0; i < 6; i++) {
    const p = (t * 0.6 + i / 6) % 1;
    ctx.globalAlpha = (1 - p) * 0.9;
    ctx.beginPath();
    ctx.arc(cx + Math.sin(i * 2.3 + t) * spread * 0.5, cy - p * 110, 3.2 * (1 - p) + 1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// Hào quang tiến hoá dưới chân: ★ 1 vòng đồng xoay chậm · ★★ 2 vòng, vòng trong màu hệ ·
// ★★★ 3 vòng + hạt sáng màu hệ (vẽ ở drawHeroSprite)
// Thần tinh (sao sau Thăng thần): vòng lửa thần cam đỏ, mỗi bậc thêm một vòng và nhiều tia hơn
function drawAscAura(ctx, asc, s, t) {
  const k = s / 0.28;
  const rx = 30 * DK * k, ry = 10 * DK * k;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < asc; i++) {
    const r = 1 + i * 0.22;
    ctx.strokeStyle = `rgba(255,${120 - i * 25},60,${0.55 - i * 0.1})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 6]);
    ctx.lineDashOffset = (i % 2 ? 1 : -1) * t * 30;
    ctx.beginPath(); ctx.ellipse(0, 0, rx * r, ry * r, 0, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.setLineDash([]);
  // tia lửa thần bốc lên (v44: ít và nhỏ hơn, chỉ quanh chân)
  for (let i = 0; i < 2 + asc; i++) {
    const a = i * 2.4 + t * 0.7;
    const q = (t * 0.7 + i * 0.37) % 1;
    const x = Math.cos(a) * rx * 0.8, y = Math.sin(a) * ry * 0.8 - q * 34 * k;
    ctx.globalAlpha = (1 - q) * 0.6;
    circle(ctx, x, y, 1.1 * k + 0.4, i % 2 ? '#FFB04A' : '#FF6A3A');
  }
  ctx.restore();
}

function drawEvoAura(ctx, tier, attrColor, s, t) {
  const k = s / 0.28;
  const rx = 24 * DK * k, ry = 8 * DK * k;
  // ảnh vẽ tay vòng hào quang (tien-hoa_1..3): vẽ dẹt theo phối cảnh, xoay chậm
  const img = tier > 0 && asset(`tien-hoa_${tier}.png`);
  if (img) {
    ctx.save();
    ctx.scale(1, ry / rx);
    ctx.rotate(t * 0.3);
    ctx.globalAlpha *= 0.9;
    ctx.drawImage(img, -rx * 1.15, -rx * 1.15, rx * 2.3, rx * 2.3);
    ctx.restore();
    return;
  }
  ctx.save();
  for (let i = 0; i < tier; i++) {
    const f = 1 - i * 0.24;
    const col = i === 1 ? attrColor : '#C8853A';
    ctx.globalAlpha = 0.75;
    ctx.strokeStyle = col;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * f, ry * f, 0, 0, Math.PI * 2);
    ctx.stroke();
    // hoa văn: chấm và răng cưa xoay chậm, mỗi vòng ngược chiều
    ctx.fillStyle = col;
    const n = 12 - i * 2;
    for (let j = 0; j < n; j++) {
      const a = (j / n) * Math.PI * 2 + t * (i % 2 ? -0.5 : 0.4);
      ctx.beginPath();
      ctx.arc(Math.cos(a) * rx * f * 0.9, Math.sin(a) * ry * f * 0.9, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// Hào quang phụ kiện (1 món mạnh nhất): Trống Đồng có sóng âm lan ra, Giáp Đồng Bất Diệt đồng đỏ
function drawAccAura(ctx, a, s, t, glowOnly) {
  const k = s / 0.28;
  const rx = 30 * DK * k, ry = 10 * DK * k;
  const color = a.kind === 'copper' ? '#C8603A' : a.color;
  ctx.save();
  if (glowOnly) {
    const g0 = ctx.createRadialGradient(0, -30 * k, 2, 0, -30 * k, 40 * k);
    g0.addColorStop(0, hexA(color, '00')); g0.addColorStop(0.7, hexA(color, '2a')); g0.addColorStop(1, hexA(color, '00'));
    ctx.fillStyle = g0; ctx.beginPath(); ctx.arc(0, -30 * k, 40 * k, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    return;
  }
  ctx.globalAlpha = 0.6 + Math.sin(t * 3) * 0.15;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  if (a.kind === 'drum') {
    for (let i = 0; i < 2; i++) {
      const p = (t * 0.7 + i * 0.5) % 1;
      ctx.globalAlpha = (1 - p) * 0.7;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx * (1 + p * 0.6), ry * (1 + p * 0.6), 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  const g = ctx.createRadialGradient(0, -30 * k, 2, 0, -30 * k, 40 * k);
  g.addColorStop(0, hexA(color, '00'));
  g.addColorStop(0.7, hexA(color, '2a'));
  g.addColorStop(1, hexA(color, '00'));
  ctx.globalAlpha = 1;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, -30 * k, 40 * k, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ★★★: vầng ngôi sao 12 cánh trống đồng sau lưng (khung 200×230)
// ------------------------------------------------------------
//  v78: hào quang rõ theo bậc cho tướng vẽ tay
//  Thường: ★★ viền màu hệ, ★★★ vầng mặt trời · Tím (Sử thi): viền tím + quầng tím + bụi tím bay lên
//  Vàng (Huyền thoại): viền vàng + vầng mặt trời + tia sáng + lửa vàng · Thần tinh: thêm ngôi sao bay quanh (1–3)
//  Mặc đồ Huyền thoại: thêm lửa vàng + viền vàng đậm
// ------------------------------------------------------------
const AURA_C = { epic: '#C77DFF', legendary: '#FFD23A' };
const hasLegendGear = (h) => !!(h && h.equip && Object.values(h.equip).some((it) => it && it.rarity === 'legendary'));
function drawPackBack(ctx, h, look, def, t, tier, asc) {
  // v79: khói / sương màu bốc lên sau lưng thay cho vầng mặt trời
  const L = def.legend;
  if (L === 'legendary') drawSmokeAura(ctx, t, [255, 200, 60], 1.5 + asc * 0.3, h);
  else if (L === 'epic') drawSmokeAura(ctx, t, [190, 110, 255], 1.1 + asc * 0.3, h);
  else if (tier >= 3) drawSmokeAura(ctx, t, hexRgb(look.attrColor), 0.55, h);
  if (asc > 0) drawAscStars(ctx, t, asc, L, false);
}
const hexRgb = (c) => { const m = /^#?([0-9a-f]{6})/i.exec(c || ''); const n = m ? parseInt(m[1], 16) : 0xF2D27A; return [n >> 16, (n >> 8) & 255, n & 255]; };
// các cụm khói tròn mềm bốc lên từ dưới chân, phình ra và mờ dần, đung đưa qua lại
const dotCache = new Map();
function softDot(rgb) {
  const key = rgb.join(',');
  let c = dotCache.get(key);
  if (c) return c;
  c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, `rgba(${key},1)`); g.addColorStop(1, `rgba(${key},0)`);
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  dotCache.set(key, c);
  return c;
}
function drawSmokeAura(ctx, t, rgb, k, h) {
  const seed = ((h && h.id) || 0) * 1.37;
  const lv = GFX_LEVEL();
  const n = Math.round((9 + 5 * k) * (lv >= 2 ? 0.4 : lv === 1 ? 0.65 : 1));
  const dot = softDot(rgb);
  ctx.save();
  for (let i = 0; i < n; i++) {
    const p = (t * 0.32 + i / n + seed) % 1;
    const x = 100 + Math.sin(i * 2.1 + t * 0.9 + seed) * (26 + p * 40);
    const y = 215 - p * (170 + 30 * k);
    const r = (16 + p * 34) * (0.8 + 0.25 * k);
    ctx.globalAlpha = Math.sin(p * Math.PI) * 0.3 * Math.min(1.7, k);
    ctx.drawImage(dot, x - r, y - r, r * 2, r * 2);
  }
  ctx.restore();
}
function packGlow(ctx, png, w, hgt, h, look, def, t, tier, asc) {
  const L = def.legend, pulse = Math.sin(t * 3) * 0.12;
  if (L) drawGlowOnly(ctx, png, -w / 2, -hgt, w, hgt, AURA_C[L], 10 + asc * 4 + (L === 'legendary' ? 4 : 0), 0.85 + pulse);
  else if (tier >= 2) drawGlowOnly(ctx, png, -w / 2, -hgt, w, hgt, look.attrColor, 5 + tier * 2, 0.55 + pulse);
  if (hasLegendGear(h)) drawGlowOnly(ctx, png, -w / 2, -hgt, w, hgt, '#FFB01E', 14, 0.6 + pulse);
}
function drawPackFront(ctx, h, def, t, hgt, asc) {
  const L = def.legend;
  if (L) {
    // bụi sáng bay lên quanh người (Vàng nhiều hơn Tím, Thần tinh càng nhiều)
    ctx.save();
    const n = (L === 'legendary' ? 10 : 7) + asc * 3, col = AURA_C[L];
    ctx.fillStyle = col;
    for (let i = 0; i < n; i++) {
      const p = (t * 0.45 + i / n) % 1;
      ctx.globalAlpha = Math.sin(p * Math.PI) * 0.9;
      ctx.beginPath(); ctx.arc(Math.sin(i * 2.7 + t * 0.8) * 70, -p * hgt * 1.05, 4 * (1 - p) + 1.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
  if (hasLegendGear(h)) {
    // lửa vàng của đồ Huyền thoại bốc quanh chân
    ctx.save();
    for (let i = 0; i < 9; i++) {
      const p = (t * 1.1 + i / 9) % 1, x = (i - 4) * 16 + Math.sin(t * 5 + i) * 4;
      ctx.globalAlpha = (1 - p) * 0.85;
      ctx.fillStyle = p < 0.4 ? '#FFF1A8' : '#FF9A1E';
      ctx.beginPath(); ctx.ellipse(x, -8 - p * 60, 6 * (1 - p) + 2, 11 * (1 - p) + 3, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
  if (asc > 0) { ctx.save(); ctx.translate(-100, -222); drawAscStars(ctx, t, asc, L, true); ctx.restore(); }
}
// ngôi sao Thần tinh bay vòng quanh người (nửa sau vẽ trước, nửa trước vẽ sau)
function drawAscStars(ctx, t, asc, L, front) {
  const col = L === 'epic' ? '#E6B8FF' : '#FFF1A8';
  for (let i = 0; i < asc; i++) {
    const a = t * 1.6 + i * (Math.PI * 2 / asc);
    const z = Math.sin(a);
    if ((z > 0) !== front) continue;
    const x = 100 + Math.cos(a) * 78, y = 130 + z * 18;
    ctx.save(); ctx.translate(x, y); ctx.rotate(t * 2 + i);
    const r = 10 + z * 3;
    ctx.globalAlpha = 0.95;
    ctx.shadowColor = col; ctx.shadowBlur = 12;
    ctx.fillStyle = col; ctx.strokeStyle = '#7A5418'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let k = 0; k < 10; k++) { const rr = k % 2 ? r * 0.45 : r; const aa = k * Math.PI / 5 - Math.PI / 2; ctx.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
}

function drawSunHalo(ctx, t) {
  ctx.save();
  ctx.translate(100, 112);
  ctx.rotate(t * 0.15);
  ctx.globalAlpha = 0.85;
  const g = ctx.createRadialGradient(0, 0, 10, 0, 0, 84);
  g.addColorStop(0, 'rgba(255,214,107,0.55)');
  g.addColorStop(1, 'rgba(255,214,107,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, 84, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#E8B04A';
  ctx.strokeStyle = '#7A5418';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const r = i % 2 ? 46 : 74;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.globalAlpha = 0.5;
  ctx.fill();
  ctx.globalAlpha = 0.8;
  ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 40, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

// ★★: mắt phát sáng màu hệ (khung 200×230)
function drawGlowEyes(ctx, color, t) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.75 + Math.sin(t * 4) * 0.2;
  for (const ex of [89, 111]) { ctx.beginPath(); ctx.arc(ex, 88.5, 3.4, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}

function drawBogWater(ctx, x, y, s, t) {
  const k = s / 0.28;
  ctx.save();
  ctx.fillStyle = 'rgba(44,106,134,0.75)';
  ctx.beginPath();
  ctx.ellipse(x, y - 2, 17 * DK * k, 7 * DK * k, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#9EDDF2';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 2; i++) {
    const p = (t * 0.8 + i * 0.5) % 1;
    ctx.globalAlpha = 1 - p;
    ctx.beginPath();
    ctx.ellipse(x, y - 2, (12 + p * 14) * DK * k, (5 + p * 5) * DK * k, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

// Hình dự phòng khi chưa có ảnh vector
function drawFallbackHero(ctx, def, look, t) {
  const c = def.color || '#C8A040';
  ctx.fillStyle = '#2A1608';
  ctx.fillRect(84, 178, 13, 42); ctx.fillRect(103, 178, 13, 42);
  rrect(ctx, 70, 116, 60, 70, 14, c);
  circle(ctx, 100, 84, 30, '#E8B98C');
  if (look.helmet) withProc(ctx, () => drawGearHelmet(ctx, look.helmet, t || 0));
  if (look.weapon && look.weapon.kind !== 'signature') withProc(ctx, () => drawGearWeapon(ctx, look.weapon, t || 0));
}

// ------------------------------------------------------------
//  ĐỒ MẶC THEO ĐỘ HIẾM (tọa độ: chân tại (0,0), đầu (0,-34) r=8)
// ------------------------------------------------------------
function outline(ctx, w) {
  ctx.strokeStyle = '#2A1608';
  ctx.lineWidth = w || 0.6;
  ctx.stroke();
}
// bật ánh theo độ hiếm cho các nét vẽ tiếp theo
function applyGlow(ctx, g, t) {
  const gl = rarityGlow(g, t);
  if (gl) { ctx.shadowColor = gl.color; ctx.shadowBlur = gl.blur; }
}
// đồ +5: tia lấp lánh chạy dọc món đồ mỗi 3 giây
function plusGlint(ctx, g, t, x1, y1, x2, y2) {
  if (!g || g.plus < 5) return;
  const p = (t % 3) / 0.5;
  if (p > 1) return;
  const x = x1 + (x2 - x1) * p, y = y1 + (y2 - y1) * p;
  ctx.save();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#FFFFFF';
  ctx.globalAlpha = Math.sin(p * Math.PI);
  ctx.beginPath();
  ctx.moveTo(x, y - 2.4); ctx.lineTo(x + 0.6, y - 0.6); ctx.lineTo(x + 2.4, y); ctx.lineTo(x + 0.6, y + 0.6);
  ctx.lineTo(x, y + 2.4); ctx.lineTo(x - 0.6, y + 0.6); ctx.lineTo(x - 2.4, y); ctx.lineTo(x - 0.6, y - 0.6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
function legendSparks(ctx, g, t, x, y) {
  if (!g || g.rarity !== 'legendary' || g.set) return;
  ctx.save();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#FFE08A';
  for (let i = 0; i < 4; i++) {
    const p = (t * 0.8 + i / 4) % 1;
    ctx.globalAlpha = 1 - p;
    ctx.beginPath();
    ctx.arc(x + Math.sin(i * 2.1 + t * 2) * 4, y - p * 14, 0.9 * (1 - p) + 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// Cánh rồng Bộ Lạc Long (Lạc Long Quân: to gấp rưỡi, có ánh sét). wingT: bung cánh khi vừa đủ bộ
function drawWings(ctx, look, t, wingT) {
  const color = look.wings;
  const open = wingT > 0 ? 1 - wingT / 1.5 : 1;
  if (look.wingScale <= 1 && drawSetBackPng(ctx, 'laclong', t, open)) return;
  const flap = Math.sin(t * 2) * 0.18;
  ctx.save();
  ctx.translate(-4, -24);
  ctx.scale(look.wingScale * (0.3 + 0.7 * Math.min(1, open * 1.4)), look.wingScale * (0.3 + 0.7 * Math.min(1, open * 1.4)));
  // [lệch góc, màu, lật] — cánh xa ló bên kia thân, cánh gần to phía sau
  for (const [off, col, far] of [[0.1, shade(color, -0.45), true], [0.35, shade(color, -0.3)], [0, color]]) {
    ctx.save();
    if (far) { ctx.translate(6, 0); ctx.scale(-0.55, 0.8); }
    ctx.rotate(-0.2 - flap - off);
    ctx.fillStyle = col;
    ctx.strokeStyle = '#F2D27A';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-10, -22);
    ctx.lineTo(-30, -26);
    ctx.quadraticCurveTo(-24, -16, -30, -10);
    ctx.quadraticCurveTo(-22, -6, -24, 2);
    ctx.quadraticCurveTo(-14, 0, -6, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // vảy rồng
    ctx.strokeStyle = shade(color, 0.35);
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-12 - i * 5, -12 + i * 3, 3, 0.5, 2.6); ctx.stroke(); }
    ctx.restore();
  }
  if (look.sparkWings && Math.random() < 0.5) {
    ctx.strokeStyle = '#BFF0FF';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    let x = -8, y = -20;
    ctx.moveTo(x, y);
    for (let i = 0; i < 4; i++) { x -= 5; y += (Math.random() - 0.5) * 8; ctx.lineTo(x, y); }
    ctx.stroke();
  }
  ctx.restore();
}

function drawSetBackPng(ctx, set, t, open) {
  const img = asset(`bo-${slugify(SETS[set].name.replace('Bộ ', ''))}_sau-lung.png`);
  if (!img) return false;
  ctx.save();
  ctx.translate(0, -30 + Math.sin(t * 1.6) * 0.8);
  const sc = (0.4 + 0.6 * open) * (1 + Math.sin(t * 2) * 0.02);
  ctx.scale(sc, sc);
  const w = 46, hh = w * img.naturalHeight / img.naturalWidth;
  ctx.globalAlpha *= 0.3 + 0.7 * open;
  ctx.drawImage(img, -w / 2, -hh / 2, w, hh);
  ctx.restore();
  return true;
}

// Hiệu ứng sau lưng khi đủ bộ (v15): Sơn Tinh khối núi đá lơ lửng, Chim Lạc cánh lông
// trắng vàng, Trống Đồng mặt trống xoay, Ngựa Sắt bờm lửa. wingT: vừa đủ bộ thì bung ra
function drawSetBack(ctx, set, t, wingT) {
  const open = wingT > 0 ? Math.min(1, (1 - wingT / 1.5) * 1.4) : 1;
  // ảnh vẽ tay hiệu ứng sau lưng (bo-<bộ>_sau-lung.png)
  if (drawSetBackPng(ctx, set, t, open)) return;
  ctx.save();
  ctx.globalAlpha *= 0.3 + 0.7 * open;
  if (set === 'sontinh') {
    const y = -46 + Math.sin(t * 1.6) * 1.6;
    ctx.translate(-9, y);
    ctx.scale(open, open);
    ctx.fillStyle = '#8C7A5A';
    ctx.beginPath(); ctx.moveTo(-8, 4); ctx.lineTo(-5, -4); ctx.lineTo(-1, -9); ctx.lineTo(3, -3); ctx.lineTo(6, -6); ctx.lineTo(9, 4); ctx.closePath();
    ctx.fill(); outline(ctx);
    ctx.fillStyle = '#5FB84A';
    ctx.beginPath(); ctx.moveTo(-5, -4); ctx.lineTo(-1, -9); ctx.lineTo(1, -6); ctx.lineTo(-3, -3); ctx.fill();
    ctx.fillStyle = '#C8B48A';
    for (let i = 0; i < 3; i++) circle(ctx, -6 + i * 6, 7 + Math.sin(t * 3 + i) * 1.2, 0.9, '#C8B48A');
  } else if (set === 'chimlac') {
    ctx.scale(0.6 + 0.4 * open, 0.6 + 0.4 * open);
    drawFeatherWings(ctx, { rarity: 'legendary', set: 'chimlac' }, t);
  } else if (set === 'drum') {
    ctx.translate(0, -28);
    ctx.scale(open, open);
    ctx.rotate(t * 0.6);
    ctx.fillStyle = '#B07A3A';
    ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fill(); outline(ctx);
    ctx.strokeStyle = '#F2D27A'; ctx.lineWidth = 0.6;
    for (const r of [11.5, 8]) { ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke(); }
    ctx.beginPath();
    for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2, r = i % 2 ? 2.4 : 6; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    ctx.closePath(); ctx.fillStyle = '#F2D27A'; ctx.fill();
    for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2 + 0.4; circle(ctx, Math.cos(a) * 13.3, Math.sin(a) * 13.3, 0.9, '#FFF1C4'); }
  } else if (set === 'nguasat') {
    ctx.translate(-2, -40);
    for (let i = 0; i < 5; i++) {
      const k = Math.sin(t * 9 + i * 1.7) * 1.4;
      const x = -9 + i * 3.2, h = (7 + (i % 2) * 3 + k) * open;
      ctx.fillStyle = i % 2 ? '#FF8A2E' : '#E0452C';
      ctx.beginPath(); ctx.moveTo(x - 2, 2); ctx.quadraticCurveTo(x - 3, -h * 0.6, x + 1, -h); ctx.quadraticCurveTo(x + 2, -h * 0.4, x + 2.5, 2); ctx.fill();
    }
  }
  ctx.restore();
}

// Âu Cơ: ô giáp hiện thành cánh lông vũ, màu theo độ hiếm
function drawFeatherWings(ctx, g, t) {
  const m = matOf(g);
  const flap = Math.sin(t * 2.4) * 0.12;
  ctx.save();
  applyGlow(ctx, g, t);
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(side * 3, -24);
    ctx.scale(side, 1);
    ctx.rotate(-0.25 - flap);
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = i % 2 ? '#FFF4F8' : m.light;
      ctx.beginPath();
      ctx.ellipse(-8 - i * 3, -8 + i * 3.5, 2.6, 9 - i, -0.9, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  ctx.restore();
}

function drawGearArmor(ctx, g, t) {
  const m = matOf(g);
  // v44: giáp hẹp lại (78%) để vẫn thấy áo gốc của tướng hai bên; độ hiếm hiện ở giáp vai
  if (g.rarity !== 'common' || g.set) {
    ctx.save();
    for (const sx of [-1, 1]) {
      ctx.fillStyle = m.main;
      ctx.beginPath(); ctx.ellipse(sx * 8.6, -25.2, 4.4, 2.8, sx * 0.3, Math.PI, 0); ctx.closePath(); ctx.fill(); outline(ctx, 0.5);
      circle(ctx, sx * 8.6, -26, 0.7, m.gem || m.light);
    }
    ctx.restore();
  }
  ctx.save();
  ctx.scale(0.78, 1);
  applyGlow(ctx, g, t);
  if (g.set) {
    // giáp vảy rồng xanh ngọc + vàng
    ctx.fillStyle = m.main;
    ctx.beginPath();
    ctx.moveTo(-9, -26); ctx.quadraticCurveTo(0, -29, 9, -26); ctx.lineTo(10, -9); ctx.quadraticCurveTo(0, -6, -10, -9);
    ctx.closePath(); ctx.fill(); outline(ctx);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = m.light; ctx.lineWidth = 0.5;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { ctx.beginPath(); ctx.arc(-6 + c * 4 + (r % 2) * 2, -22 + r * 3.6, 1.8, 0.2, Math.PI - 0.2); ctx.stroke(); }
  } else if (g.rarity === 'common') {
    // áo vải gai
    ctx.fillStyle = m.main;
    ctx.beginPath();
    ctx.moveTo(-8, -25); ctx.lineTo(8, -25); ctx.lineTo(9, -9); ctx.lineTo(-9, -9);
    ctx.closePath(); ctx.fill(); outline(ctx);
    ctx.strokeStyle = m.dark; ctx.lineWidth = 0.4;
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-8, -22 + i * 3); ctx.lineTo(8, -22 + i * 3); ctx.stroke(); }
    ctx.fillStyle = '#5A3A1A'; ctx.fillRect(-9, -12.5, 18, 2);
  } else if (g.rarity === 'rare') {
    // giáp da có tấm đồng
    ctx.fillStyle = '#7A5232';
    ctx.beginPath();
    ctx.moveTo(-8.5, -25.5); ctx.lineTo(8.5, -25.5); ctx.lineTo(9.5, -9); ctx.lineTo(-9.5, -9);
    ctx.closePath(); ctx.fill(); outline(ctx);
    ctx.fillStyle = m.main;
    ctx.beginPath(); ctx.arc(0, -19, 4.6, 0, Math.PI * 2); ctx.fill(); outline(ctx, 0.5);
    ctx.strokeStyle = m.light; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.arc(0, -19, 2.6, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#3E2A16'; ctx.fillRect(-9.5, -12.5, 19, 2.4);
  } else if (g.rarity === 'epic') {
    // giáp đồng khắc hoa văn trống đồng
    ctx.fillStyle = m.main;
    ctx.beginPath();
    ctx.moveTo(-9, -26); ctx.quadraticCurveTo(0, -29, 9, -26); ctx.lineTo(10, -9); ctx.quadraticCurveTo(0, -6, -10, -9);
    ctx.closePath(); ctx.fill(); outline(ctx);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = m.light; ctx.lineWidth = 0.6;
    for (const r of [5, 3.4, 1.6]) { ctx.beginPath(); ctx.arc(0, -18, r, 0, Math.PI * 2); ctx.stroke(); }
    ctx.beginPath();
    for (let i = 0; i < 7; i++) ctx.lineTo(-8 + i * 2.7, -11 + (i % 2) * 1.6);
    ctx.stroke();
    circle(ctx, 0, -18, 0.9, m.gem);
  } else {
    // giáp vàng khảm ngọc, vai hình đầu chim Lạc
    ctx.fillStyle = m.main;
    ctx.beginPath();
    ctx.moveTo(-9.5, -26.5); ctx.quadraticCurveTo(0, -30, 9.5, -26.5); ctx.lineTo(10.5, -9); ctx.quadraticCurveTo(0, -5.5, -10.5, -9);
    ctx.closePath(); ctx.fill(); outline(ctx);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = m.dark; ctx.lineWidth = 0.6;
    for (const r of [5.2, 3.2]) { ctx.beginPath(); ctx.arc(0, -18, r, 0, Math.PI * 2); ctx.stroke(); }
    circle(ctx, 0, -18, 1.6, m.gem);
    for (const sx of [-1, 1]) {
      ctx.fillStyle = m.main;
      ctx.beginPath();
      ctx.moveTo(sx * 6, -27); ctx.quadraticCurveTo(sx * 13, -31, sx * 15, -27); ctx.lineTo(sx * 11, -24); ctx.closePath();
      ctx.fill(); outline(ctx, 0.5);
      circle(ctx, sx * 12.5, -28, 0.6, '#2A1608');
    }
  }
  ctx.restore();
  plusGlint(ctx, g, t, -8, -24, 8, -11);
  legendSparks(ctx, g, t, 0, -20);
}

function drawGearHelmet(ctx, g, t) {
  const m = matOf(g);
  const st = g.style;
  ctx.save();
  applyGlow(ctx, g, t);
  if (st === 'rarity' && g.set) {
    // mũ Lạc Long: vương miện xanh ngọc, sừng rồng vàng
    ctx.fillStyle = m.main;
    ctx.fillRect(-8.5, -44, 17, 5); outline(ctx);
    ctx.fillStyle = m.light;
    for (const sx of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(sx * 4, -44); ctx.quadraticCurveTo(sx * 10, -50, sx * 8, -57); ctx.quadraticCurveTo(sx * 6, -50, sx * 1.5, -44); ctx.fill();
    }
    circle(ctx, 0, -41.5, 1.4, m.gem);
  } else if (st === 'rarity' && g.rarity === 'common') {
    // khăn vải quấn đầu
    ctx.fillStyle = m.main;
    ctx.beginPath(); ctx.ellipse(0, -39.5, 9.2, 3.2, 0, 0, Math.PI * 2); ctx.fill(); outline(ctx);
    ctx.strokeStyle = m.dark; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(-8, -40); ctx.lineTo(8, -39); ctx.stroke();
    ctx.fillStyle = m.main;
    ctx.beginPath(); ctx.moveTo(-8, -39); ctx.lineTo(-13, -35); ctx.lineTo(-10, -38); ctx.fill();
  } else if (st === 'rarity' && g.rarity === 'rare') {
    // mũ lông chim
    ctx.fillStyle = '#B8402A';
    ctx.fillRect(-8.6, -40.5, 17.2, 3.2); outline(ctx, 0.5);
    for (let i = 0; i < 5; i++) {
      ctx.save();
      ctx.translate(-4 + i * 2, -40);
      ctx.rotate(-0.5 + i * 0.25);
      ctx.fillStyle = i % 2 ? '#F2E6C8' : RAR_COLOR.rare;
      ctx.beginPath(); ctx.ellipse(0, -6, 1.6, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  } else if (st === 'rarity' && g.rarity === 'epic') {
    // v44: vành đồng có sừng nhỏ (không trùm kín đầu, vẫn thấy tóc / lông chim của tướng)
    ctx.fillStyle = m.main;
    ctx.beginPath(); ctx.moveTo(-9, -38.4); ctx.lineTo(9, -38.4); ctx.lineTo(8.4, -41.6); ctx.lineTo(-8.4, -41.6); ctx.closePath();
    ctx.fill(); outline(ctx, 0.5);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = m.light; ctx.lineWidth = 0.4;
    ctx.beginPath(); for (let i = 0; i < 9; i++) ctx.lineTo(-8 + i * 2, -39.3 - (i % 2) * 1.2); ctx.stroke();
    circle(ctx, 0, -40, 1.1, m.gem);
    ctx.fillStyle = '#F2E6C8';
    for (const sx of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(sx * 6.5, -41); ctx.quadraticCurveTo(sx * 12.5, -43, sx * 12, -50); ctx.quadraticCurveTo(sx * 9.5, -44, sx * 4.5, -41.6);
      ctx.fill(); outline(ctx, 0.45);
    }
  } else if (st === 'rarity') {
    // mũ lông chim Lạc vàng cao
    ctx.fillStyle = m.main;
    ctx.fillRect(-9, -42, 18, 4.4); outline(ctx);
    circle(ctx, 0, -40, 1.3, m.gem);
    for (let i = 0; i < 7; i++) {
      ctx.save();
      ctx.translate(-6 + i * 2, -42);
      ctx.rotate(-0.45 + i * 0.15);
      ctx.fillStyle = i % 2 ? '#FFF1C4' : m.main;
      ctx.beginPath(); ctx.ellipse(0, -9, 1.6, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  } else if (st === 'helm') {
    // Thánh Gióng: mũ sắt, chùm lông theo độ hiếm
    ctx.fillStyle = '#5A6470';
    ctx.beginPath(); ctx.arc(0, -36, 9.4, Math.PI, 0); ctx.closePath(); ctx.fill(); outline(ctx);
    ctx.fillStyle = g.rarity === 'common' ? '#B8301E' : RAR_COLOR[g.rarity];
    ctx.beginPath(); ctx.ellipse(2, -47, 3, 6, 0.5, 0, Math.PI * 2); ctx.fill();
  } else if (st === 'horncrown') {
    // Lạc Long Quân: vương miện sừng rồng
    ctx.fillStyle = m.main;
    ctx.fillRect(-7, -43, 14, 3.6); outline(ctx, 0.5);
    ctx.strokeStyle = m.light; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
    for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * 4, -43); ctx.lineTo(sx * 8, -51); ctx.lineTo(sx * 10, -49); ctx.stroke(); }
  } else if (st === 'crownSmall') {
    // Thần Kim Quy: vương miện nhỏ
    ctx.fillStyle = m.main;
    ctx.beginPath();
    ctx.moveTo(-5, -40); ctx.lineTo(-5, -44); ctx.lineTo(-2.5, -42); ctx.lineTo(0, -46); ctx.lineTo(2.5, -42); ctx.lineTo(5, -44); ctx.lineTo(5, -40);
    ctx.closePath(); ctx.fill(); outline(ctx, 0.5);
    circle(ctx, 0, -41.5, 0.9, m.gem);
  } else if (st === 'conical') {
    // nón lá / nón thần
    ctx.fillStyle = g.rarity === 'common' ? '#D8C890' : m.light;
    ctx.beginPath(); ctx.moveTo(-13, -38); ctx.lineTo(0, -50); ctx.lineTo(13, -38); ctx.closePath(); ctx.fill(); outline(ctx);
    ctx.strokeStyle = m.dark; ctx.lineWidth = 0.4;
    for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-13 + i * 3.2, -38 - i * 0.2); ctx.lineTo(0, -50); ctx.stroke(); }
  } else if (st === 'flower') {
    // Tiên Dung: trâm cài, hoa
    ctx.strokeStyle = m.main; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-8, -44); ctx.lineTo(4, -40); ctx.stroke();
    ctx.fillStyle = g.rarity === 'common' ? '#FF9EC4' : RAR_COLOR[g.rarity];
    for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; ctx.beginPath(); ctx.arc(-7 + Math.cos(a) * 2, -44 + Math.sin(a) * 2, 1.5, 0, Math.PI * 2); ctx.fill(); }
    circle(ctx, -7, -44, 1, '#FFE08A');
  } else if (st === 'turban') {
    // Lang Liêu: khăn xếp
    ctx.fillStyle = g.rarity === 'common' ? '#3A3226' : m.main;
    ctx.beginPath(); ctx.ellipse(0, -40, 9.4, 4, 0, 0, Math.PI * 2); ctx.fill(); outline(ctx);
    ctx.strokeStyle = m.light; ctx.lineWidth = 0.5;
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(0, -40, 9 - i * 0.4, 1.6 + i, 0, Math.PI, Math.PI * 2); ctx.stroke(); }
  }
  ctx.restore();
  plusGlint(ctx, g, t, -8, -42, 8, -38);
  legendSparks(ctx, g, t, 0, -46);
}

function drawGearWeapon(ctx, g, t) {
  const m = matOf(g);
  const kind = g.kind;
  ctx.save();
  ctx.translate(9.5, -13);
  applyGlow(ctx, g, t);
  let tipX = 0, tipY = -28;
  if (kind === 'axe') {
    ctx.rotate(-0.4);
    ctx.fillStyle = g.rarity === 'common' ? '#6A4A2A' : '#5D4037';
    ctx.fillRect(-1.2, -26, 2.4, 31);
    ctx.fillStyle = g.rarity === 'common' ? '#8A8A80' : m.main;
    ctx.beginPath();
    if (g.rarity === 'common') { ctx.moveTo(1, -27); ctx.lineTo(10, -28); ctx.lineTo(12, -19); ctx.lineTo(1, -18); }
    else { ctx.moveTo(1, -27); ctx.quadraticCurveTo(15, -29, 13, -15); ctx.quadraticCurveTo(8, -19, 1, -17); }
    ctx.closePath(); ctx.fill(); outline(ctx);
    ctx.shadowBlur = 0;
    if (g.rarity === 'epic' || g.set) { ctx.strokeStyle = m.light; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.arc(7, -22, 2.4, 0, Math.PI * 2); ctx.stroke(); }
    if (g.rarity === 'legendary' && !g.set && Math.sin(t * 9) > 0.2) {
      // rìu sấm: tia sét trên lưỡi
      ctx.strokeStyle = '#E8F8FF'; ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.moveTo(12, -27); ctx.lineTo(9, -23); ctx.lineTo(12, -21); ctx.lineTo(9, -17); ctx.stroke();
    }
    tipX = 12; tipY = -27;
  } else if (kind === 'daggers') {
    for (const [ox, oy, rot] of [[-15, 3, 0.4], [0, 0, -0.4]]) {
      ctx.save();
      ctx.translate(ox, oy);
      ctx.rotate(rot);
      ctx.fillStyle = g.rarity === 'common' ? '#C8B070' : g.rarity === 'legendary' && !g.set ? '#9AE07A' : m.main;
      ctx.beginPath();
      if (g.rarity === 'legendary' && !g.set) { ctx.moveTo(0, -2); ctx.quadraticCurveTo(-4, -10, 0, -19); ctx.quadraticCurveTo(4, -10, 0, -2); }
      else { ctx.moveTo(-1.5, -2); ctx.lineTo(-1.5, -14); ctx.lineTo(0, -18); ctx.lineTo(1.5, -14); ctx.lineTo(1.5, -2); }
      ctx.fill(); outline(ctx, 0.5);
      ctx.fillStyle = g.rarity === 'epic' ? m.gem : m.dark;
      ctx.fillRect(-3.5, -3, 7, 2);
      ctx.restore();
    }
    tipX = 0; tipY = -18;
  } else if (kind === 'crossbow') {
    ctx.rotate(-0.2);
    ctx.fillStyle = g.rarity === 'common' ? '#8A6A40' : m.main;
    ctx.fillRect(-4, -2.5, 18, 3.4); outline(ctx, 0.5);
    ctx.strokeStyle = g.rarity === 'common' ? '#5A3A1A' : m.dark;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(11, -1, 8, -1.3, 1.3); ctx.stroke();
    if (g.rarity === 'legendary' || g.set) {
      // nỏ cánh chim Lạc
      ctx.fillStyle = m.light;
      for (const sy of [-1, 1]) { ctx.beginPath(); ctx.ellipse(13, -1 + sy * 7, 2, 4.5, sy * 0.6, 0, Math.PI * 2); ctx.fill(); }
    }
    if (g.rarity === 'epic') { ctx.shadowBlur = 0; ctx.strokeStyle = m.light; ctx.lineWidth = 0.4; ctx.beginPath(); ctx.moveTo(0, -1); ctx.lineTo(2, -2); ctx.lineTo(4, -1); ctx.stroke(); }
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#F2E6C8';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(11 + Math.cos(-1.3) * 8, -1 + Math.sin(-1.3) * 8); ctx.lineTo(3, -1); ctx.lineTo(11 + Math.cos(1.3) * 8, -1 + Math.sin(1.3) * 8);
    ctx.stroke();
    tipX = 14; tipY = -1;
  } else {
    // gậy
    ctx.rotate(-0.15);
    ctx.strokeStyle = g.rarity === 'common' ? '#7A5A3A' : m.main;
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (g.rarity === 'common') { ctx.moveTo(0, 8); ctx.quadraticCurveTo(-3, -12, 0, -30); }
    else { ctx.moveTo(0, 8); ctx.lineTo(0, -30); }
    ctx.stroke();
    if (g.rarity === 'rare') circle(ctx, 0, -32, 3.6, m.main);
    else if (g.rarity === 'epic' || g.set) {
      circle(ctx, 0, -33, 4.6, m.main);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = m.light; ctx.lineWidth = 0.5;
      for (const r of [3.2, 1.8]) { ctx.beginPath(); ctx.arc(0, -33, r, 0, Math.PI * 2); ctx.stroke(); }
    } else if (g.rarity === 'legendary') {
      circle(ctx, 0, -32, 2.6, m.main);
      if (g.ice) {
        ctx.fillStyle = '#E8F8FF';
        ctx.beginPath(); ctx.moveTo(0, -44); ctx.lineTo(3, -36); ctx.lineTo(0, -33); ctx.lineTo(-3, -36); ctx.closePath(); ctx.fill();
      } else {
        const f = Math.sin(t * 14) * 1;
        ctx.fillStyle = '#FF8A2E';
        ctx.beginPath(); ctx.moveTo(-3, -34); ctx.quadraticCurveTo(-2, -40 - f, 0, -44 - f); ctx.quadraticCurveTo(2, -40, 3, -34); ctx.fill();
        circle(ctx, 0, -36, 1.4, '#FFE08A');
      }
    }
    tipX = 0; tipY = -34;
  }
  ctx.restore();
  ctx.save();
  ctx.translate(9.5, -13);
  plusGlint(ctx, g, t, 0, 4, tipX, tipY);
  legendSparks(ctx, g, t, tipX * 0.7, tipY * 0.7);
  ctx.restore();
}

// ------------------------------------------------------------
//  QUÂN THỦY TINH — ảnh vector + chuyển động, trạng thái
// ------------------------------------------------------------
// chiều rộng vẽ (đơn vị logic) cho từng loại
const ENEMY_W = {
  tom: 40, casau: 74, rua: 62, phuthuy: 44, chimbao: 58, echme: 54, nongnoc: 30, giaolong: 56,   // v61: theo hình vẽ tay
  thuongluong: 140, haba: 92, thuytinh: 84,   // v80: theo ảnh vẽ tay
};
if (typeof ENEMY_W_EXTRA !== 'undefined') Object.assign(ENEMY_W, ENEMY_W_EXTRA);
function enemyArt(type) {
  if (!HAS_ART) return null;
  return ART.enemy[type] || ART.boss[type] || null;
}
function enemyImage(type, px) {
  const a = enemyArt(type);
  if (!a) return null;
  const w = ENEMY_W[type] || 40;
  const q = Math.min(4, Math.max(1, Math.ceil(px * 1.1 / 0.25) * 0.25));
  const pw = w * q, ph = (w * a.h / a.w) * q;
  return svgImage(`e|${type}|${q}`, sizedSvg(a.svg, pw, ph));
}

// Kích thước vẽ của một con quái (để đặt thanh máu, chọn hiệu ứng)
function enemyBox(e) {
  const a = enemyArt(e.type);
  const k = (e.champion ? 1.5 : 1) * (e.elite ? 1.15 : 1);
  const w = (ENEMY_W[e.type] || 40) * k;
  const h = a ? w * a.h / a.w : w * 0.8;
  const ay = a ? (a.ay / a.h) * h : h;
  return { w, h, ay, k };
}

function drawEnemy(ctx, e, t, o = {}) {
  const d = e.def;
  const box = enemyBox(e);
  const a = enemyArt(e.type);
  const lift = d.flying && !o.icon ? 24 + Math.sin(t * 5 + e.id) * 3 : 0;
  const bob = Math.sin(t * 9 + e.id) * 1.5;
  const wig = Math.sin(t * 7 + e.id) * 0.04;
  ctx.save();
  ctx.translate(e.x, e.y);
  if (!o.icon) {
    ctx.fillStyle = 'rgba(0,0,0,0.32)';
    ctx.beginPath();
    ctx.ellipse(0, 2, box.w * 0.36, box.w * 0.1 + 2, 0, 0, Math.PI * 2);
    ctx.fill();
    // gợn nước quanh quái bơi (chỉ bản đồ có sông / biển)
    const wet = typeof MAP_ID === 'undefined' || !MAPS[MAP_ID] || (MAP_THEMES[MAPS[MAP_ID].theme] || {}).water;
    if (!d.flying && wet) {
      ctx.strokeStyle = 'rgba(191,232,245,0.45)';
      ctx.lineWidth = 1.2;
      const p = (t * 1.2 + e.id * 0.3) % 1;
      ctx.globalAlpha = 1 - p;
      ctx.beginPath();
      ctx.ellipse(0, 2, box.w * (0.3 + p * 0.25), box.w * (0.08 + p * 0.06), 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    if (e.elite) {
      ctx.strokeStyle = ELITE_MODS[e.elite].color;
      ctx.lineWidth = 2.2;
      ctx.globalAlpha = 0.6 + Math.sin(t * 6) * 0.3;
      ctx.beginPath();
      ctx.ellipse(0, 2, box.w * 0.55, box.w * 0.18, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    if (d.burnAura && d.burnAura.kind) {
      // v48: hào quang khác mưa — trống trận (sóng âm vàng đồng) / lửa ma (đốm lửa tím bay lên)
      const R = d.burnAura.radius, c = d.burnAura.color;
      ctx.fillStyle = hexA(c, '22');
      ctx.beginPath(); ctx.ellipse(0, 0, R, R * 0.45, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = c; ctx.lineWidth = 2;
      if (d.burnAura.kind === 'drum') {
        for (let i = 0; i < 3; i++) {
          const q = (t * 0.9 + i / 3) % 1;
          ctx.globalAlpha = (1 - q) * 0.7;
          ctx.beginPath(); ctx.ellipse(0, 0, R * q, R * q * 0.45, 0, 0, Math.PI * 2); ctx.stroke();
        }
      } else {
        ctx.fillStyle = c;
        for (let i = 0; i < 10; i++) {
          const q = (t * 0.6 + i / 10) % 1, a = i * 2.4;
          ctx.globalAlpha = (1 - q) * 0.8;
          ctx.beginPath(); ctx.arc(Math.cos(a) * R * 0.7, Math.sin(a) * R * 0.3 - q * 50, 3 * (1 - q) + 1, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    } else if (d.burnAura) {
      // Thủy Tinh: mưa gió quanh mình
      ctx.fillStyle = `rgba(90,180,214,${0.12 + Math.sin(t * 4) * 0.04})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, d.burnAura.radius, d.burnAura.radius * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(191,232,245,0.5)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 14; i++) {
        const rx = ((i * 53 + t * 40) % (d.burnAura.radius * 2)) - d.burnAura.radius;
        const ry = (((i * 31) % 60) - 30) + ((t * 260 + i * 40) % 80) - 60;
        ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 4, ry + 12); ctx.stroke();
      }
    }
  }
  // Hà Bá lặn xuống
  let sinkK = 0;
  if (e.reviveT > 0) {
    const dl = d.reincarnate.delay;
    const p = 1 - e.reviveT / dl;
    sinkK = p < 0.5 ? p * 2 : (1 - p) * 2;
    for (let i = 0; i < 3; i++) {
      const q = (t * 1.5 + i / 3) % 1;
      ctx.strokeStyle = `rgba(158,221,242,${1 - q})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, box.w * (0.3 + q * 0.6), box.w * (0.1 + q * 0.2), 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.translate(0, -lift + bob * (d.flying ? 1.5 : 0.6) + sinkK * box.h * 0.8);
  if (sinkK > 0) {
    ctx.beginPath();
    ctx.rect(-box.w, -box.h * 2, box.w * 2, box.h * 2 - sinkK * box.h * 0.8 + 4);
    ctx.clip();
  }
  // trúng đòn: giật lùi + nén lại; bơi: co giãn theo nhịp
  const kb = e.kbT > 0 ? e.kbT / 0.14 : 0;
  if (kb) ctx.translate((e.kbDir || 1) * 7 * Math.sin(kb * Math.PI), 0);
  ctx.rotate(wig * (d.flying ? 2 : 1) + (kb ? (e.kbDir || 1) * 0.12 * kb : 0));
  const flip = e.dir < 0 ? -1 : 1;
  const flapY = d.flying ? 1 + Math.sin(t * 16 + e.id) * 0.12 : 1;
  const swim = d.flying || e.stunT > 0 ? 0 : Math.sin(t * 9 + e.id) * 0.035;
  ctx.scale(flip * (1 + swim + kb * 0.1), flapY * (1 - swim - kb * 0.1));
  if (e.enraged) {
    ctx.shadowColor = '#ff2d2d';
    ctx.shadowBlur = 14;
  }
  const packRef = !vectorHeroesOn() && enemyPackRef(e.type);
  const png = (packRef && enemyPackImg(e, t)) || enemyPng(e.type, e.elite || e.champion, e);
  if (png) {
    // ảnh vẽ tay: chân ở giữa đáy ảnh, rộng theo ENEMY_W (bộ ảnh quái: cao theo ảnh bước 1 để đổi khung không đổi cỡ)
    const h2 = packRef ? box.w * packRef.naturalHeight / packRef.naturalWidth : box.w * png.naturalHeight / png.naturalWidth;
    const w2 = packRef ? h2 * png.naturalWidth / png.naturalHeight : box.w;
    const fxc = d.fx && ENEMY_FX[d.fx];
    if (fxc) drawEnemyFxBack(ctx, d.fx, fxc, w2, h2, t, e.id || 0, d.flying);
    if (fxc) { drawGlowOnly(ctx, png, -w2 / 2, -h2 + (d.flying ? h2 * 0.5 : 0), w2, h2, fxc.glow, fxc.blur, 0.9); ctx.save(); if (d.fx === 'ghost') ctx.globalAlpha *= 0.72 + Math.sin(t * 3 + (e.id || 0)) * 0.12; }
    ctx.drawImage(png, -w2 / 2, -h2 + (d.flying ? h2 * 0.5 : 0), w2, h2);
    if (fxc) ctx.restore();
    if (e.hitT > 0) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = e.hitT / 0.12 * 0.55;
      ctx.drawImage(png, -w2 / 2, -h2 + (d.flying ? h2 * 0.5 : 0), w2, h2);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }
  }
  const img = !png && a && enemyImage(e.type, o.px || 1);
  if (png) { /* đã vẽ */ } else if (ready(img)) {
    const x0 = -(a.ax / a.w) * box.w, y0 = -box.ay;
    ctx.drawImage(img, x0, y0, box.w, box.h);
    // chớp sáng khi trúng đòn
    if (e.hitT > 0) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = e.hitT / 0.12 * 0.55;
      ctx.drawImage(img, x0, y0, box.w, box.h);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }
  } else {
    circle(ctx, 0, -box.h * 0.4, box.w * 0.3, d.color);
  }
  ctx.shadowBlur = 0;
  ctx.restore();

  const top = e.y - lift - box.ay - 4;
  if (!o.icon) drawEnemyStatus(ctx, e, box, lift, t);
  ctx.save();
  ctx.translate(e.x, 0);
  // bị làm chậm: phủ sương xanh
  if (e.slowT > 0 || e.zoneSlow > 0) {
    ctx.fillStyle = 'rgba(158,221,242,0.28)';
    ctx.beginPath();
    ctx.ellipse(0, e.y - lift - box.h * 0.35, box.w * 0.45, box.h * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (e.shield > 0) {
    ctx.strokeStyle = 'rgba(90,180,214,0.9)';
    ctx.fillStyle = 'rgba(90,180,214,0.18)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, e.y - lift - box.h * 0.4, box.w * 0.55, box.h * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  if (e.stunT > 0) {
    if (e.stunKind === 'ice') {
      ctx.fillStyle = 'rgba(189,235,250,0.45)';
      ctx.strokeStyle = '#E8FBFF';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.rect(-box.w * 0.5, e.y - lift - box.h, box.w, box.h + 2);
      ctx.fill();
      ctx.stroke();
    } else if (e.stunKind === 'root') {
      // dây rừng trói chân
      ctx.strokeStyle = '#3E9A4A'; ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        const x0 = (i - 1) * box.w * 0.25;
        ctx.beginPath(); ctx.moveTo(x0, e.y - lift + 2);
        ctx.quadraticCurveTo(x0 + 8 * Math.sin(t * 4 + i), e.y - lift - box.h * 0.3, x0 - 4, e.y - lift - box.h * 0.55); ctx.stroke();
        circle(ctx, x0 - 4, e.y - lift - box.h * 0.55, 3, '#5FD06A');
      }
    } else if (e.stunKind === 'music') {
      ctx.fillStyle = '#FFE08A';
      ctx.font = 'bold 13px serif';
      ctx.textAlign = 'center';
      for (let i = 0; i < 2; i++) {
        const a2 = t * 3 + i * Math.PI;
        ctx.fillText('♪', Math.cos(a2) * box.w * 0.3, top - 6 + Math.sin(a2 * 2) * 4);
      }
    } else {
      for (let i = 0; i < 3; i++) {
        const a2 = t * 6 + (i * Math.PI * 2) / 3;
        drawStar(ctx, Math.cos(a2) * box.w * 0.3, top - 6 + Math.sin(a2) * 3, 3.5, '#F2D27A');
      }
    }
  }
  if (e.huntT > 0) {
    // dấu săn của Thần Săn Ba Vì
    ctx.strokeStyle = 'rgba(226,90,58,0.9)'; ctx.lineWidth = 1.6;
    const ry = top - 14;
    ctx.beginPath(); ctx.arc(0, ry, 6, 0, Math.PI * 2); ctx.moveTo(-9, ry); ctx.lineTo(9, ry); ctx.moveTo(0, ry - 9); ctx.lineTo(0, ry + 9); ctx.stroke();
  }
  if (e.poisonT > 0 && Math.random() < 0.3) {
    circle(ctx, (Math.random() - 0.5) * box.w * 0.5, top + box.h * 0.3, 2, e.dotColor);
  }
  // v93: câm lặng — mây xám trên đầu, không dùng được kỹ năng
  if (e.silenceT > 0) {
    const sy = top - 12;
    ctx.fillStyle = 'rgba(60,60,72,0.85)';
    ctx.beginPath(); ctx.ellipse(-4, sy, 7, 5, 0, 0, Math.PI * 2); ctx.ellipse(4, sy - 1, 7, 5.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#D8D8E8'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-4, sy - 3); ctx.lineTo(4, sy + 3); ctx.moveTo(4, sy - 3); ctx.lineTo(-4, sy + 3); ctx.stroke();
  }
  ctx.restore();

  if (o.icon) return;
  // thanh máu (+ khiên). Chế độ Gọn: boss xem ở góc dưới trái; quái thường chỉ hiện khi đã bị đánh
  const detail = typeof showDetail === 'function' ? showDetail() : true;
  if (!detail && (e.def.boss || e.hp >= e.maxHp * 0.999)) return;
  const w = Math.max(24, Math.min(60, box.w * 0.6));
  const by = top - 3;
  ctx.fillStyle = 'rgba(10,10,10,0.85)';
  ctx.fillRect(e.x - w / 2 - 1, by - 1, w + 2, 5);
  const r = e.hp / e.maxHp;
  ctx.fillStyle = r > 0.5 ? '#3EBE3E' : r > 0.25 ? '#E0B030' : '#D84A2A';
  ctx.fillRect(e.x - w / 2, by, w * Math.max(0, r), 3);
  // chấm hành bên trái thanh máu (quái tinh anh có thể có hành phụ)
  if (detail) [e.el, e.el2].filter(Boolean).forEach((el, k) => {
    circle(ctx, e.x - w / 2 - 5 - k * 7, by + 1.5, 3.4, '#0D0B08');
    circle(ctx, e.x - w / 2 - 5 - k * 7, by + 1.5, 2.6, ELEMENTS[el].color);
  });
  if (e.shield > 0) {
    ctx.fillStyle = '#5AB4D6';
    ctx.fillRect(e.x - w / 2, by - 3, w * Math.min(1, e.shield / e.maxHp), 2);
  }
}

// Dấu trạng thái trên quái do kỹ năng / đồ gây ra: đóng băng, mắc lưới,
// nứt giáp (Mũi Sừng Phá Giáp), cấm hồi máu (Ngọc Trấn Thủy), bị đánh rơi xuống đất
// v81: hiệu ứng riêng của quân biến thể (lửa, băng, ma, vàng, sắt, bóng tối, độc, nước)
const ENEMY_FX = {
  fire: { glow: '#FF7A1E', blur: 14, p: '#FFB04A' }, frost: { glow: '#9EDDF2', blur: 12, p: '#E8F8FF' },
  ghost: { glow: '#C8B8FF', blur: 16, p: '#E6DCFF' }, gold: { glow: '#FFD23A', blur: 14, p: '#FFF1A8' },
  steel: { glow: '#C8D4E8', blur: 8, p: null }, shadow: { glow: '#5A2A8A', blur: 16, p: '#2A1440' },
  poison: { glow: '#5FD06A', blur: 12, p: '#8BF07A' }, water: { glow: '#3EDCC0', blur: 12, p: '#BFF0FF' },
};
function drawEnemyFxBack(ctx, kind, c, w, h, t, id, fly) {
  if (!c.p) return;
  const base = fly ? h * 0.5 : 0;
  ctx.save();
  ctx.fillStyle = c.p;
  const n = 7;
  for (let i = 0; i < n; i++) {
    const p = (t * (kind === 'fire' ? 1.1 : 0.6) + i / n + id * 0.13) % 1;
    const x = Math.sin(i * 2.3 + t + id) * w * 0.35;
    const y = base - p * h * (kind === 'shadow' ? 0.8 : 1.1);
    ctx.globalAlpha = Math.sin(p * Math.PI) * (kind === 'shadow' ? 0.5 : 0.8);
    const r = kind === 'shadow' || kind === 'ghost' ? (6 + p * 10) : (2.5 * (1 - p) + 1.2);
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawEnemyStatus(ctx, e, box, lift, t) {
  const cx = e.x, cy = e.y - lift - box.h * 0.4;
  ctx.save();
  if (e.stunT > 0 && e.stunKind === 'ice') {
    ctx.fillStyle = 'rgba(190,235,250,0.38)';
    ctx.strokeStyle = 'rgba(232,248,255,0.9)';
    ctx.lineWidth = 1.4;
    const w = box.w * 0.5, hh = box.h * 0.55;
    ctx.beginPath();
    ctx.moveTo(cx - w, cy + hh); ctx.lineTo(cx - w * 0.9, cy - hh * 0.7); ctx.lineTo(cx - w * 0.2, cy - hh);
    ctx.lineTo(cx + w * 0.8, cy - hh * 0.8); ctx.lineTo(cx + w, cy + hh); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - w * 0.5, cy - hh * 0.5); ctx.lineTo(cx - w * 0.2, cy); ctx.stroke();
  }
  if (e.stunT > 0 && e.stunKind === 'net') {
    ctx.strokeStyle = 'rgba(216,200,160,0.9)';
    ctx.lineWidth = 1;
    const r = box.w * 0.5;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath(); ctx.moveTo(cx - r, cy + i * r * 0.35 - r * 0.3); ctx.lineTo(cx + r, cy + i * r * 0.35 + r * 0.3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - r, cy + i * r * 0.35 + r * 0.3); ctx.lineTo(cx + r, cy + i * r * 0.35 - r * 0.3); ctx.stroke();
    }
  }
  if (e.shredN > 0) {
    // vết nứt giáp: càng nhiều tầng càng nhiều vết
    ctx.strokeStyle = '#E8D8B0';
    ctx.lineWidth = 1.3;
    for (let i = 0; i < e.shredN; i++) {
      const x0 = cx - box.w * 0.18 + i * box.w * 0.16, y0 = cy - box.h * 0.1;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + 3, y0 + 5); ctx.lineTo(x0 - 1, y0 + 9); ctx.lineTo(x0 + 2, y0 + 13); ctx.stroke();
    }
  }
  if (e.noHealT > 0) {
    // dấu ấn ngọc: vòng xanh có gạch chéo
    const y0 = cy - box.h * 0.55;
    ctx.globalAlpha = 0.85;
    ctx.strokeStyle = '#3EC08A'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx + box.w * 0.32, y0, 4.5, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + box.w * 0.32 - 3, y0 - 3); ctx.lineTo(cx + box.w * 0.32 + 3, y0 + 3); ctx.stroke();
  }
  if (e.groundT > 0 && e.def.flying) {
    ctx.fillStyle = 'rgba(255,224,138,0.6)';
    for (let i = 0; i < 3; i++) {
      const a = t * 8 + i * 2.1;
      circle(ctx, cx + Math.cos(a) * box.w * 0.4, cy - box.h * 0.4 + Math.sin(a) * 3, 1.6, '#FFE08A');
    }
  }
  ctx.restore();
}

// Vẽ quái làm biểu tượng (bảng đợt, bách khoa) vào một canvas
function drawEnemyIcon(cv, type, pad = 0.12) {
  const c = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  c.clearRect(0, 0, W, H);
  const png = (!vectorHeroesOn() && enemyPackRef(type)) || enemyPng(type);
  if (png) {
    const k2 = Math.min((W * (1 - pad * 2)) / png.naturalWidth, (H * (1 - pad * 2)) / png.naturalHeight);
    c.drawImage(png, (W - png.naturalWidth * k2) / 2, (H - png.naturalHeight * k2) / 2, png.naturalWidth * k2, png.naturalHeight * k2);
    return;
  }
  const a = enemyArt(type);
  if (!a) { circle(c, W / 2, H / 2, Math.min(W, H) * 0.3, ENEMIES[type].color); return; }
  const k = Math.min((W * (1 - pad * 2)) / a.w, (H * (1 - pad * 2)) / a.h);
  const img = svgImage(`icon|${type}|${W}x${H}`, sizedSvg(a.svg, a.w * k, a.h * k));
  const draw = () => {
    c.clearRect(0, 0, W, H);
    c.drawImage(img, (W - a.w * k) / 2, (H - a.h * k) / 2, a.w * k, a.h * k);
  };
  if (ready(img)) draw(); else img.addEventListener('load', draw, { once: true });
}

// Vẽ chân dung tướng vào canvas (thân trên, phóng to)
function drawHeroPortrait(cv, h, t, o = {}) {
  const c = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  c.clearRect(0, 0, W, H);
  const front = o.full && !vectorHeroesOn() && packImg(h.type, 'front');
  if (front) {
    const k = Math.min(W / front.naturalWidth, H * 0.94 / front.naturalHeight);
    c.drawImage(front, (W - front.naturalWidth * k) / 2, H * 0.97 - front.naturalHeight * k, front.naturalWidth * k, front.naturalHeight * k);
    return;
  }
  const head = !o.full && !vectorHeroesOn() && packImg(h.type, 'head');
  if (head) {   // đầu vẽ tay: vừa khung, sát đáy
    const k = Math.min(W / head.naturalWidth, H / head.naturalHeight) * 1.08;
    c.drawImage(head, (W - head.naturalWidth * k) / 2, H - head.naturalHeight * k, head.naturalWidth * k, head.naturalHeight * k);
    return;
  }
  const png = !o.full && heroPng(h.type, 'B');
  if (png) {
    const k = Math.max(W / png.naturalWidth, H / png.naturalHeight);
    c.drawImage(png, (W - png.naturalWidth * k) / 2, 0, png.naturalWidth * k, png.naturalHeight * k);
    return;
  }
  const s = o.full ? H / (HEROES[h.type].mount ? 360 : 290) : H / 175;
  const look = computeLook({ ...h, grow: 0 });
  look.accAura = null;
  drawHeroSprite(c, { ...h, grow: 0 }, W / 2, o.full ? H * 0.9 : H * 1.32, {
    t, dir: 1, scale: s, px: 1.2 / s * s, noShadow: !o.full, noMount: !o.full, look: { ...look, tier: 0, bulk: 1 },
  });
}
