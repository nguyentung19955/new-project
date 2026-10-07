'use strict';

// ============================================================
//  NỀN BẢN ĐỒ TỰ VẼ THEO CHỦ ĐỀ (v48)
//  Dựng một SVG 932×430 cho mỗi bản đồ (MAPS trong data.js): nền cỏ / cát / đá theo chủ đề,
//  dải núi / biển / vách hang phía trên, đường đi (sông hoặc đường đất), đồ trang trí rải ngẫu nhiên
//  (theo hạt giống của tên bản đồ, tránh đường đi và ô đặt tướng), thành / cổng ở cuối đường.
// ============================================================

function seededRand(str) {
  let h = 2166136261;
  for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
}

const DECO = {
  tree: (x, y, r) => `<circle cx="${x}" cy="${y + 4}" r="${r}" fill="#1E3418"/><circle cx="${x - 3}" cy="${y}" r="${r * 0.8}" fill="#2D4E22"/><circle cx="${x + 3}" cy="${y - 3}" r="${r * 0.5}" fill="#3E6A2E"/>`,
  bush: (x, y, r) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.6}" fill="#2D4E22"/><ellipse cx="${x - 2}" cy="${y - 2}" rx="${r * 0.6}" ry="${r * 0.4}" fill="#4E7434"/>`,
  rock: (x, y, r) => `<ellipse cx="${x}" cy="${y}" rx="${r * 0.8}" ry="${r * 0.55}" fill="#77705F"/><ellipse cx="${x + r * 0.6}" cy="${y + 3}" rx="${r * 0.5}" ry="${r * 0.35}" fill="#5E584A"/><ellipse cx="${x - 2}" cy="${y - 2}" rx="${r * 0.35}" ry="${r * 0.2}" fill="#9A9280"/>`,
  reed: (x, y, r) => [0, 1, 2, 3].map((i) => `<path d="M${x + i * 3 - 4} ${y} q${(i - 1.5) * 2} -${r} ${(i - 1.5) * 4} -${r * 1.4}" stroke="#6E8A3A" stroke-width="1.6" fill="none"/>`).join('') + `<ellipse cx="${x}" cy="${y - r * 1.2}" rx="1.6" ry="4" fill="#7A5A2A"/>`,
  lotus: (x, y, r) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.45}" fill="#3E7A3A"/><circle cx="${x + 2}" cy="${y - 3}" r="${r * 0.4}" fill="#F2A0C4"/><circle cx="${x + 2}" cy="${y - 3}" r="${r * 0.18}" fill="#FFE08A"/>`,
  hut: (x, y, r) => `<rect x="${x - r}" y="${y - r * 0.4}" width="${r * 2}" height="${r}" fill="#8A6A42" stroke="#3A2A16"/><path d="M${x - r * 1.4} ${y - r * 0.3} L${x} ${y - r * 1.5} L${x + r * 1.4} ${y - r * 0.3} Z" fill="#B8984A" stroke="#5A4420"/><rect x="${x - r * 0.25}" y="${y}" width="${r * 0.5}" height="${r * 0.6}" fill="#2A1A0A"/>`,
  rice: (x, y, r) => `<rect x="${x - r * 1.6}" y="${y - r * 0.8}" width="${r * 3.2}" height="${r * 1.6}" fill="#6A8A2E" stroke="#4A6224" stroke-width="1.5"/>` + [0, 1, 2, 3].map((i) => `<path d="M${x - r * 1.4} ${y - r * 0.5 + i * r * 0.35} h${r * 2.8}" stroke="#9ABA4A" stroke-dasharray="2 3"/>`).join(''),
  buffalo: (x, y, r) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.55}" fill="#4A4038"/><circle cx="${x + r}" cy="${y - 2}" r="${r * 0.4}" fill="#4A4038"/><path d="M${x + r * 0.8} ${y - r * 0.5} q-4 -4 -2 -7 M${x + r * 1.2} ${y - r * 0.5} q4 -4 2 -7" stroke="#D8C8A8" stroke-width="1.6" fill="none"/>`,
  palm: (x, y, r) => `<path d="M${x} ${y} q3 -${r} 0 -${r * 2}" stroke="#7A5A30" stroke-width="3" fill="none"/>` + [-1.2, -0.4, 0.4, 1.2].map((a) => `<path d="M${x} ${y - r * 2} q${Math.cos(a) * r} ${-r * 0.4} ${Math.cos(a) * r * 1.4} ${Math.abs(a) * r * 0.5}" stroke="#3E7A2E" stroke-width="3" fill="none"/>`).join(''),
  shell: (x, y, r) => `<path d="M${x - r * 0.6} ${y} a${r * 0.6} ${r * 0.6} 0 0 1 ${r * 1.2} 0 z" fill="#F2D8C8" stroke="#B8987A"/>`,
  boat: (x, y, r) => `<path d="M${x - r * 1.5} ${y} q${r * 1.5} ${r * 0.8} ${r * 3} 0 z" fill="#7A5A30" stroke="#3A2A16"/><path d="M${x} ${y - 2} v-${r * 1.6} l${r} ${r * 1.2} z" fill="#E8DCC0"/>`,
  crystal: (x, y, r) => `<path d="M${x} ${y} l-${r * 0.4} -${r} l${r * 0.4} -${r * 0.5} l${r * 0.4} ${r * 0.5} z" fill="#7FD8F2" opacity="0.8"/><path d="M${x + r * 0.5} ${y} l-${r * 0.25} -${r * 0.6} l${r * 0.25} -${r * 0.3} l${r * 0.25} ${r * 0.3} z" fill="#BFF0FF" opacity="0.8"/>`,
  bones: (x, y, r) => `<path d="M${x - r} ${y} l${r * 2} -${r * 0.5}" stroke="#D8D0B8" stroke-width="2.5" stroke-linecap="round"/><circle cx="${x + r * 0.2}" cy="${y - r * 0.8}" r="${r * 0.45}" fill="#D8D0B8"/>`,
  stalag: (x, y, r) => `<path d="M${x - r * 0.5} ${y} L${x} ${y - r * 2} L${x + r * 0.5} ${y} Z" fill="#5A5040" stroke="#2E2820"/>`,
  banner: (x, y, r) => `<path d="M${x} ${y} v-${r * 2.4}" stroke="#3A2A16" stroke-width="2"/><path d="M${x} ${y - r * 2.4} h${r * 1.4} l-${r * 0.4} ${r * 0.5} l${r * 0.4} ${r * 0.5} h-${r * 1.4} z" fill="#C8401E"/>`,
};

// thành / cổng cuối đường
function mapGate(kind, x, y) {
  switch (kind) {
    case 'hut':      // bản làng giữa rừng
      return `<g>${DECO.hut(x - 6, y + 6, 22)}<rect x="${x - 40}" y="${y + 18}" width="80" height="6" fill="#5A4024"/>${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${x - 40 + i * 15}" y="${y + 4}" width="5" height="24" fill="#7A5A30" stroke="#3A2A16"/>`).join('')}</g>`;
    case 'cave':     // miệng hang tối
      return `<g><ellipse cx="${x}" cy="${y + 4}" rx="46" ry="52" fill="#3A3228"/><ellipse cx="${x}" cy="${y + 12}" rx="30" ry="38" fill="#0A0806"/><path d="M${x - 30} ${y - 18} l6 12 l6 -12 l6 12 l6 -12 l6 12 l6 -12" fill="#D8D0B8"/><circle cx="${x - 10}" cy="${y + 4}" r="3" fill="#FF4A2A"/><circle cx="${x + 10}" cy="${y + 4}" r="3" fill="#FF4A2A"/></g>`;
    case 'village':  // cổng làng tre
      return `<g><rect x="${x - 34}" y="${y - 40}" width="10" height="70" fill="#9A8A4A" stroke="#4A3A16"/><rect x="${x + 24}" y="${y - 40}" width="10" height="70" fill="#9A8A4A" stroke="#4A3A16"/><path d="M${x - 44} ${y - 40} q${44} -22 ${88} 0 v8 q-${44} -20 -${88} 0 z" fill="#7A5A30" stroke="#3A2A16"/><rect x="${x - 18}" y="${y - 30}" width="36" height="12" fill="#C8401E" stroke="#5A1A0A"/><path d="M${x - 12} ${y - 24} h24" stroke="#FFD66B" stroke-width="2"/></g>`;
    case 'citadel':  // thành Cổ Loa: 3 vòng thành xoắn, tháp giữa
      return `<g>${[46, 32].map((r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#7E6440" stroke-width="7" stroke-dasharray="${r * 5.6} ${r * 0.7}"/>`).join('')}<rect x="${x - 18}" y="${y - 30}" width="36" height="34" fill="#6E5636" stroke="#2A1F12" stroke-width="2"/><path d="M${x - 24} ${y - 28} L${x} ${y - 46} L${x + 24} ${y - 28} Z" fill="#8C3A1E" stroke="#2A1F12"/><path d="M${x - 8} ${y + 4} v-14 a8 8 0 0 1 16 0 v14 z" fill="#1A120A" stroke="#D9B25A" stroke-width="1.5"/><path d="M${x} ${y - 46} v-12" stroke="#2A1F12" stroke-width="2"/><path d="M${x} ${y - 58} h12 l-3 3 3 3 h-12z" fill="#C8401E"/></g>`;
    default: {       // thành Phong Châu (như bản cũ), dịch theo vị trí cuối đường
      const dx = x - 899, dy = y - 156;
      return `<g transform="translate(${dx} ${dy})"><rect x="866" y="108" width="66" height="96" fill="#6E5636" stroke="#2A1F12" stroke-width="2"/><rect x="866" y="108" width="66" height="10" fill="#8C7046"/><rect x="860" y="96" width="18" height="30" fill="#7E6440" stroke="#2A1F12" stroke-width="2"/><rect x="860" y="174" width="18" height="34" fill="#7E6440" stroke="#2A1F12" stroke-width="2"/><path d="M869 96 V82" stroke="#2A1F12" stroke-width="2"/><path d="M869 82 h14 l-4 4 4 4 h-14z" fill="#C8401E"/><path d="M884 204 V174 A15 15 0 0 1 914 174 V204 Z" fill="#1A120A" stroke="#D9B25A" stroke-width="2"/><circle cx="899" cy="140" r="12" fill="#B8853A" stroke="#2A1F12" stroke-width="2"/><circle cx="899" cy="140" r="7" fill="none" stroke="#2A1F12"/></g>`;
    }
  }
}

// dải phía trên (dưới thanh trên của giao diện): núi, vách hang, biển
function mapTopBand(th) {
  if (th === 'hang') {
    return `<path d="M0 0 H932 V100 C860 120 800 80 720 104 C640 128 560 86 470 108 C380 128 300 84 210 106 C130 124 60 92 0 108 Z" fill="#2A241C"/>`
      + [80, 210, 340, 470, 600, 730, 860].map((x, i) => `<path d="M${x - 10} ${100 + (i % 2) * 6} L${x} ${132 + (i % 3) * 8} L${x + 10} ${100 + (i % 2) * 6} Z" fill="#3A3228"/>`).join('')
      + `<path d="M0 430 V380 C120 360 240 400 360 384 C480 368 620 404 740 386 C820 376 880 392 932 384 V430 Z" fill="#2A241C"/>`;
  }
  if (th === 'bien') {
    return `<path d="M0 0 H932 V96 C820 110 700 80 600 98 C480 120 360 86 240 100 C140 112 60 92 0 102 Z" fill="#2C7AA0"/>`
      + `<path d="M0 102 C60 92 140 112 240 100 C360 86 480 120 600 98 C700 80 820 110 932 96" fill="none" stroke="#E8F6FF" stroke-width="3" stroke-dasharray="14 10"/>`
      + [120, 360, 620, 820].map((x) => `<path d="M${x} 70 q8 -6 16 0 q8 6 16 0" stroke="#BFE8F5" stroke-width="2" fill="none"/>`).join('');
  }
  // núi (sông, đầm, rừng, đồng, thành)
  return `<path d="M0 44 H932 V96 C820 92 760 70 660 78 C540 88 430 64 320 70 C220 76 120 58 0 66 Z" fill="#6A5A42"/>`
    + `<path d="M0 66 C120 58 220 76 320 70 C430 64 540 88 660 78 C760 70 820 92 932 96" fill="none" stroke="#2A2116" stroke-width="3"/>`
    + `<polygon points="40,70 110,30 150,46 200,24 260,44 300,66" fill="#7A6748"/><polygon points="500,80 560,40 600,52 650,30 700,48 720,80" fill="#7A6748"/><polyline points="40,70 110,30 150,46 200,24 260,44 300,66" fill="none" stroke="#B9A274" stroke-width="2"/>`;
}

// đường đi: sông (nước) hoặc đường đất / đá
function mapPathSvg(d, t) {
  if (t.water) {
    return `<path d="${d}" fill="none" stroke="#2C6A86" stroke-opacity="0.5" stroke-width="104" stroke-linecap="round"/>`
      + `<path d="${d}" fill="none" stroke="${t.bank}" stroke-width="54" stroke-linecap="round"/>`
      + `<path d="${d}" fill="none" stroke="#1F5670" stroke-width="42" stroke-linecap="round"/>`
      + `<path d="${d}" fill="none" stroke="#3E89A8" stroke-width="20" stroke-linecap="round" stroke-opacity="0.6"/>`
      + `<path d="${d}" fill="none" stroke="#BFE8F5" stroke-opacity="0.5" stroke-width="1.5" stroke-dasharray="8 16"/>`;
  }
  return `<path d="${d}" fill="none" stroke="#000" stroke-opacity="0.18" stroke-width="66" stroke-linecap="round"/>`
    + `<path d="${d}" fill="none" stroke="${t.roadEdge}" stroke-width="50" stroke-linecap="round"/>`
    + `<path d="${d}" fill="none" stroke="${t.road}" stroke-width="40" stroke-linecap="round"/>`
    + `<path d="${d}" fill="none" stroke="${t.roadEdge}" stroke-opacity="0.55" stroke-width="2" stroke-dasharray="3 12"/>`;
}

const mapSvgCache = new Map();
function buildMapSvg(id) {
  if (mapSvgCache.has(id)) return mapSvgCache.get(id);
  const m = MAPS[id] || MAPS.song1;
  const t = MAP_THEMES[m.theme] || MAP_THEMES.song;
  const rnd = seededRand(id);
  const pts = sampleSvgPath(m.d, 18);
  const nearPath = (x, y, r) => distToPolyline(pts, x, y) < r;
  const slots = (CONFIG.slots || []).map(([x, y]) => [x / DK, y / DK]);
  const nearSlot = (x, y) => slots.some(([sx, sy]) => Math.hypot(sx - x, sy - y) < 34);
  const [ex, ey] = m.end;
  // đồ trang trí: 26 món rải, tránh đường đi, ô tướng, thành và dải trên / dưới
  let deco = '';
  let placed = 0;
  for (let tries = 0; tries < 400 && placed < 26; tries++) {
    const x = 20 + rnd() * 892, y = 112 + rnd() * 270;
    if (nearPath(x, y, t.water ? 62 : 44) || nearSlot(x, y) || Math.hypot(x - ex, y - ey) < 70) continue;
    const kind = t.deco[Math.floor(rnd() * t.deco.length)];
    const r = kind === 'rice' ? 9 + rnd() * 5 : kind === 'tree' ? 10 + rnd() * 6 : 6 + rnd() * 5;
    deco += DECO[kind](Math.round(x), Math.round(y), +r.toFixed(1));
    placed++;
  }
  // sen / lau sậy sát bờ sông (đầm, sông)
  if (t.water && !t.sea) {
    for (let i = 0; i < 8; i++) {
      const p = pts[Math.floor(rnd() * pts.length)];
      const side = rnd() < 0.5 ? -1 : 1;
      const x = p[0] + side * (40 + rnd() * 8), y = p[1] + side * (30 + rnd() * 6);
      if (y < 110 || nearSlot(x, y)) continue;
      deco += (m.theme === "dam" ? DECO.lotus : DECO.reed)(Math.round(x), Math.round(y), 6);
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 932 430" width="932" height="430"><defs><pattern id="mg-${id}" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="${t.ground}"/><path d="M3 6l1-3 1 3M14 15l1-3 1 3M20 5l1-2 1 2M8 20l1-3 1 3" stroke="${t.grass}" stroke-width="1" fill="none"/><circle cx="18" cy="19" r="1" fill="${t.dot}"/><circle cx="6" cy="13" r="1" fill="${t.dot}"/></pattern></defs>`
    + (MAP_BG.has(m.theme) ? `${mapGate(t.gate, ex, ey)}</svg>`   // v124: có nền vẽ tay → chỉ vẽ cổng thành; v156: đường đi vẽ bằng canvas (mapLayer)
      : `<rect width="932" height="430" fill="url(#mg-${id})"/>${mapTopBand(m.theme)}${mapPathSvg(m.d, t)}<g>${deco}</g>${mapGate(t.gate, ex, ey)}</svg>`);
  mapSvgCache.set(id, svg);
  return svg;
}

// ============================================================
//  ĐƯỜNG QUÁI ĐI THEO CHỦ ĐỀ (v156)
//  Bỏ dải xanh + vạch đứt trắng kiểu đường nhựa. Mỗi chủ đề một loại đường:
//  Sông/Đầm → dòng nước (bờ cỏ, bèo) · Rừng → đường đất mòn (rễ, lá) · Hang → đá lát
//  Đồng → bờ đê đất (cỏ hai mép) · Biển → bãi cát ướt (bọt sóng, vỏ sò) · Thành → gạch đá cổ (bó vỉa).
//  Kết cấu: ảnh lặp assets/tiles/duong-<loại>.jpg (512×512) nếu có, không thì vẽ bằng code.
//  Nền vẽ tay + đường + cổng thành dựng MỘT LẦN vào canvas tĩnh (mapLayer, theo bản đồ và kích thước);
//  mỗi khung chỉ vẽ phần động: gợn nước / mũi tên dòng chảy / dấu chân (drawPathFx).
// ============================================================
const PATH_KIND = { song: 'nuoc', dam: 'nuoc', rung: 'dat', hang: 'da', dong: 'de', bien: 'cat', thanh: 'gach' };
// bề rộng tính theo đơn vị thiết kế (932 × 430); w = lòng đường, edge = cả mép / bờ
const PATH_LOOK = {
  nuoc: { w: 44, edge: 58, soft: 'rgba(58,84,40,0.45)', softW: 76, rim: '#6B6A3A', base: '#2C6F8E', inner: 'rgba(10,40,60,0.35)', hi: 'rgba(190,232,245,0.10)' },
  dat:  { w: 40, edge: 50, soft: 'rgba(40,30,18,0.35)', softW: 62, rim: '#4A3826', base: '#80623E', inner: 'rgba(40,24,10,0.25)', hi: 'rgba(255,230,180,0.08)' },
  da:   { w: 42, edge: 54, soft: 'rgba(0,0,0,0.30)', softW: 64, rim: '#2E2922', base: '#5A5348', inner: 'rgba(0,0,0,0.25)', hi: 'rgba(255,255,255,0.05)', curb: '#4E473C' },
  de:   { w: 40, edge: 56, soft: 'rgba(60,80,30,0.40)', softW: 70, rim: '#5E7A2E', base: '#A58656', inner: 'rgba(70,50,20,0.25)', hi: 'rgba(255,240,200,0.10)' },
  cat:  { w: 46, edge: 60, soft: 'rgba(255,250,230,0.55)', softW: 76, rim: '#F2E6C0', base: '#9C7C4C', inner: 'rgba(70,50,24,0.35)', hi: 'rgba(255,255,255,0.10)' },
  gach: { w: 42, edge: 54, soft: 'rgba(0,0,0,0.28)', softW: 64, rim: '#5A4A36', base: '#9C8668', inner: 'rgba(40,28,16,0.30)', hi: 'rgba(255,240,210,0.06)', curb: '#6E5E48' },
};
const pathKind = (theme) => PATH_KIND[theme] || 'nuoc';

// kết cấu vẽ bằng code: ô vuông 128 px (= 64 đơn vị game), mọi chi tiết vẽ lặp ±1 ô để liền mạch
const pathTexCache = {};
function pathTexture(kind) {
  if (pathTexCache[kind]) return pathTexCache[kind];
  const S = 128, c = document.createElement('canvas');
  c.width = c.height = S;
  const x = c.getContext('2d');
  const L = PATH_LOOK[kind], rnd = seededRand('tex-' + kind);
  const wrap = (fn) => { for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) { x.save(); x.translate(ox, oy); fn(); x.restore(); } };
  x.fillStyle = L.base; x.fillRect(0, 0, S, S);
  const dots = (n, col, r0, r1) => { for (let i = 0; i < n; i++) { const px = rnd() * S, py = rnd() * S, r = r0 + rnd() * (r1 - r0); x.fillStyle = col; wrap(() => { x.beginPath(); x.ellipse(px, py, r, r * 0.7, 0, 0, 7); x.fill(); }); } };
  if (kind === 'nuoc') {
    dots(14, 'rgba(20,70,95,0.35)', 6, 16);
    dots(10, 'rgba(80,150,180,0.25)', 4, 12);
    x.lineWidth = 2; x.lineCap = 'round';
    for (let i = 0; i < 16; i++) {
      const px = rnd() * S, py = rnd() * S, w = 8 + rnd() * 10;
      x.strokeStyle = `rgba(190,232,245,${0.12 + rnd() * 0.15})`;
      wrap(() => { x.beginPath(); x.moveTo(px - w, py); x.quadraticCurveTo(px - w / 2, py - 3, px, py); x.quadraticCurveTo(px + w / 2, py + 3, px + w, py); x.stroke(); });
    }
  } else if (kind === 'da' || kind === 'gach') {
    // đá lát: ô đá không đều; gạch: hàng gạch so le
    x.fillStyle = kind === 'da' ? '#2E2922' : '#7A6448'; x.fillRect(0, 0, S, S);
    const stones = [];
    if (kind === 'gach') {
      for (let r = 0; r < 8; r++) for (let k = 0; k < 4; k++) stones.push([k * 32 + (r % 2) * 16, r * 16, 32, 16]);
    } else {
      for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) {
        const jx = (rnd() - 0.5) * 8, jy = (rnd() - 0.5) * 8;
        stones.push([k * 32 + jx + (r % 2) * 10, r * 32 + jy, 30 + rnd() * 6, 28 + rnd() * 6]);
      }
    }
    for (const [sx, sy, sw, sh] of stones) {
      const g = kind === 'da' ? 74 + rnd() * 22 : 0;
      const col = kind === 'da' ? `rgb(${g + 8},${g + 2},${g - 10})` : ['#A88C68', '#A08460', '#AE9270', '#9A7E5A'][Math.floor(rnd() * 4)];
      wrap(() => {
        x.fillStyle = col;
        x.beginPath(); (x.roundRect || x.rect).call(x, sx + 1.5, sy + 1.5, sw - 3, sh - 3, kind === 'da' ? 10 : 2); x.fill();
        x.fillStyle = 'rgba(255,255,255,0.06)'; x.fillRect(sx + 4, sy + 3, sw - 10, 2);
        x.fillStyle = 'rgba(0,0,0,0.12)'; x.fillRect(sx + 3, sy + sh - 5, sw - 6, 2);
      });
    }
    dots(10, 'rgba(60,80,40,0.35)', 1.5, 3);   // rêu nhỏ trong kẽ
  } else {
    // đất / đê / cát: hạt sỏi, vết lõm, cỏ / vỏ sò
    dots(kind === 'cat' ? 22 : 18, kind === 'cat' ? 'rgba(120,96,60,0.30)' : 'rgba(60,40,20,0.30)', 3, 9);
    dots(30, kind === 'cat' ? 'rgba(255,248,220,0.35)' : 'rgba(230,200,150,0.22)', 1, 2.5);
    dots(12, 'rgba(40,28,14,0.35)', 1, 2);
    if (kind === 'cat') dots(4, 'rgba(242,216,200,0.9)', 2, 3);
    if (kind === 'dat') { x.strokeStyle = 'rgba(50,34,18,0.35)'; x.lineWidth = 1.5; for (let i = 0; i < 6; i++) { const px = rnd() * S, py = rnd() * S; wrap(() => { x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + 8, py + 4, px + 16, py + 2); x.stroke(); }); } }
  }
  pathTexCache[kind] = c;
  return c;
}
function makePattern(ctx, src, unit) {
  const p = ctx.createPattern(src, 'repeat');
  try { p.setTransform(new DOMMatrix().scale(unit / src.width)); } catch (e) { /* trình duyệt cũ: kết cấu to hơn một chút */ }
  return p;
}

// đường đi theo đơn vị game (CONFIG), độ dài tích lũy để đặt chi tiết dọc đường
function pathGeom(d) {
  const pts = sampleSvgPath(d, 26).map(([x, y]) => [x * DK, y * DK]);
  const acc = [0];
  for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  // điểm + hướng ở quãng đường s
  const at = (s) => {
    let lo = 1, hi = pts.length - 1;
    while (lo < hi) { const m = (lo + hi) >> 1; if (acc[m] < s) lo = m + 1; else hi = m; }
    const [ax, ay] = pts[lo - 1], [bx, by] = pts[lo];
    const seg = acc[lo] - acc[lo - 1] || 1, k = Math.max(0, Math.min(1, (s - acc[lo - 1]) / seg));
    const a = Math.atan2(by - ay, bx - ax);
    return [ax + (bx - ax) * k, ay + (by - ay) * k, a];
  };
  return { pts, len: acc[acc.length - 1], at };
}
const pathGeomCache = new Map();
const geomFor = (id) => { if (!pathGeomCache.has(id)) pathGeomCache.set(id, pathGeom((MAPS[id] || MAPS.song1).d)); return pathGeomCache.get(id); };

function strokePts(x, pts, w, style, dash) {
  x.strokeStyle = style; x.lineWidth = w; x.lineCap = 'round'; x.lineJoin = 'round';
  x.setLineDash(dash || []);
  x.beginPath(); pts.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.stroke();
  x.setLineDash([]);
}

// vẽ đường đi (tĩnh) vào ngữ cảnh x đang ở hệ tọa độ game
function drawThemedPath(x, id) {
  const m = MAPS[id] || MAPS.song1, kind = pathKind(m.theme), L = PATH_LOOK[kind];
  const { pts, len, at } = geomFor(id);
  const rnd = seededRand('path-' + id);
  const W = (v) => v * DK;
  // bóng đổ mềm + viền hòa vào nền
  x.save();
  x.shadowColor = 'rgba(0,0,0,0.35)'; x.shadowBlur = W(10); x.shadowOffsetY = W(3);
  strokePts(x, pts, W(L.edge), L.rim);
  x.restore();
  strokePts(x, pts, W(L.softW), L.soft);
  strokePts(x, pts, W(L.edge), L.rim);
  // bó vỉa đá (hang, thành): mép đường chia khối
  if (L.curb) { strokePts(x, pts, W(L.edge), L.curb, [W(9), W(2.5)]); strokePts(x, pts, W(L.edge - 4), L.rim); }
  // lòng đường: kết cấu ảnh (nếu có) hoặc vẽ bằng code
  const img = typeof asset === 'function' && asset(`tiles/duong-${kind}.jpg`, true);
  strokePts(x, pts, W(L.w), L.inner);
  strokePts(x, pts, W(L.w - 5), makePattern(x, img || pathTexture(kind), img ? W(110) : W(64)));
  strokePts(x, pts, W(L.w * 0.45), L.hi);
  // chi tiết hai mép (rải theo quãng đường, cố định theo hạt giống bản đồ)
  const side = (s, off) => { const [px, py, a] = at(s); return [px - Math.sin(a) * off, py + Math.cos(a) * off, a]; };
  if (kind === 'nuoc') {
    for (let s = 20; s < len; s += 26 + rnd() * 30) {
      const sd = rnd() < 0.5 ? -1 : 1, [px, py] = side(s, sd * W(L.edge / 2 - 2));
      // cỏ bờ
      x.strokeStyle = rnd() < 0.5 ? '#5E8A34' : '#7AA444'; x.lineWidth = W(1.4);
      for (let k = -2; k <= 2; k++) { x.beginPath(); x.moveTo(px + k * W(2), py); x.lineTo(px + k * W(3), py - W(5 + rnd() * 4)); x.stroke(); }
      // bèo trên mặt nước sát bờ
      if (rnd() < 0.55) {
        const [bx, by] = side(s + 8, sd * W(L.w / 2 - 6 - rnd() * 6));
        x.fillStyle = m.theme === 'dam' ? '#4E8A3A' : '#5E9A44';
        for (let k = 0; k < 3; k++) { x.beginPath(); x.ellipse(bx + (rnd() - 0.5) * W(6), by + (rnd() - 0.5) * W(4), W(2.4), W(1.6), 0, 0, 7); x.fill(); }
        if (m.theme === 'dam' && rnd() < 0.4) { x.fillStyle = '#F2A0C4'; x.beginPath(); x.arc(bx, by - W(1), W(1.8), 0, 7); x.fill(); }
      }
    }
  } else if (kind === 'dat') {
    for (let s = 30; s < len; s += 40 + rnd() * 50) {
      const sd = rnd() < 0.5 ? -1 : 1, [px, py, a] = side(s, sd * W(L.w / 2 + 3));
      // rễ cây bò ngang mép đường
      x.strokeStyle = '#5A3E22'; x.lineWidth = W(2.2); x.lineCap = 'round';
      const ia = a + Math.PI / 2 * sd + (rnd() - 0.5) * 0.6, r = W(10 + rnd() * 8);
      x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px - Math.cos(ia) * r * 0.5 + W(4), py - Math.sin(ia) * r * 0.5, px - Math.cos(ia) * r, py - Math.sin(ia) * r); x.stroke();
      // lá rụng
      for (let k = 0; k < 2; k++) {
        const [lx, ly] = side(s + 14 + k * 9, (rnd() - 0.5) * W(L.w * 0.7));
        x.fillStyle = ['#8A6A2A', '#A8822E', '#6E7A2E'][Math.floor(rnd() * 3)];
        x.beginPath(); x.ellipse(lx, ly, W(2.6), W(1.3), rnd() * 3, 0, 7); x.fill();
      }
    }
  } else if (kind === 'de') {
    for (let s = 10; s < len; s += 14 + rnd() * 14) for (const sd of [-1, 1]) {
      const [px, py] = side(s + rnd() * 6, sd * W(L.w / 2 + 2));
      x.strokeStyle = rnd() < 0.5 ? '#7A9A3E' : '#94B04A'; x.lineWidth = W(1.3);
      for (let k = -1; k <= 1; k++) { x.beginPath(); x.moveTo(px + k * W(2), py); x.lineTo(px + k * W(3), py - W(4 + rnd() * 3)); x.stroke(); }
    }
  } else if (kind === 'cat') {
    // bọt sóng dọc một mép, vỏ sò rải rác
    x.save(); x.setLineDash([W(10), W(5)]);
    for (const sd of [-1]) { const off = pts.map((_, i) => side(len * i / (pts.length - 1), sd * W(L.w / 2 - 2))); strokePts(x, off, W(2), 'rgba(255,255,255,0.55)', [W(12), W(6)]); }
    x.restore();
    for (let s = 40; s < len; s += 60 + rnd() * 60) {
      const [px, py] = side(s, (rnd() - 0.5) * W(L.w * 0.8));
      x.fillStyle = '#F2D8C8'; x.strokeStyle = '#B8987A'; x.lineWidth = W(0.8);
      x.beginPath(); x.arc(px, py, W(2.6), Math.PI, 0); x.closePath(); x.fill(); x.stroke();
    }
  } else if (kind === 'da' || kind === 'gach') {
    for (let s = 40; s < len; s += 50 + rnd() * 60) {
      const sd = rnd() < 0.5 ? -1 : 1, [px, py] = side(s, sd * W(L.edge / 2 + 2));
      x.fillStyle = kind === 'da' ? '#4E7A3A' : '#5E8A34';
      x.beginPath(); x.ellipse(px, py, W(4), W(2), 0, 0, 7); x.fill();   // rêu / cỏ ở chân bó vỉa
    }
  }
}

// cổng vào: hai cột mốc đá có dải vải đỏ, đặt nơi đường bắt đầu lộ ra trong màn hình
function drawEntry(x, id) {
  const { len, at } = geomFor(id);
  let s = 0;
  for (; s < len; s += 4) { const [px, py] = at(s); if (px > 18 && py > 16 && px < CONFIG.W - 18) break; }
  const [px, py, a] = at(s + 10);
  const kind = pathKind((MAPS[id] || MAPS.song1).theme), r = PATH_LOOK[kind].edge / 2 * DK + 6;
  for (const sd of [-1, 1]) {
    const cx = px - Math.sin(a) * r * sd, cy = py + Math.cos(a) * r * sd;
    x.fillStyle = 'rgba(0,0,0,0.3)'; x.beginPath(); x.ellipse(cx + 2, cy + 3, 9, 4, 0, 0, 7); x.fill();
    x.fillStyle = '#7A7060'; x.strokeStyle = '#2A1F12'; x.lineWidth = 2;
    x.beginPath(); x.moveTo(cx - 6, cy + 2); x.lineTo(cx - 5, cy - 22); x.quadraticCurveTo(cx, cy - 28, cx + 5, cy - 22); x.lineTo(cx + 6, cy + 2); x.closePath(); x.fill(); x.stroke();
    x.strokeStyle = '#C9963A'; x.lineWidth = 1.5;   // vòng khắc trống đồng
    x.beginPath(); x.arc(cx, cy - 14, 3.2, 0, 7); x.stroke();
    x.fillStyle = '#C8401E';                          // dải vải đỏ
    x.beginPath(); x.moveTo(cx - 5, cy - 8); x.lineTo(cx + 5, cy - 8); x.lineTo(cx + 9, cy - 1); x.lineTo(cx + 3, cy - 3); x.closePath(); x.fill();
  }
}

// ảnh cổng thành vẽ tay (tùy chọn) theo kiểu cổng của chủ đề
const GATE_FILE = { castle: 'cong-phong-chau', hut: 'cong-ban-rung', cave: 'cong-hang', village: 'cong-lang-tre', citadel: 'cong-co-loa' };
const gateArt = (theme) => typeof asset === 'function' && asset(`tiles/${GATE_FILE[(MAP_THEMES[theme] || MAP_THEMES.song).gate]}.png`, true);

// Canvas tĩnh: nền vẽ tay + đường + cổng vào + cổng thành; dựng lại khi đổi bản đồ / cỡ màn hình / có thêm ảnh
let mapLayerCache = { key: '', c: null };
function mapLayer(id, bgImg, svgImg, pw, ph) {
  // T1: cửa sổ thu về gần 0 (thu nhỏ app, chia đôi màn, xoay máy) → không dựng canvas cỡ 0 (drawImage sẽ ném lỗi)
  if (!(pw >= 1 && ph >= 1)) return null;
  const m = MAPS[id] || MAPS.song1, kind = pathKind(m.theme);
  const tex = asset(`tiles/duong-${kind}.jpg`, true), gate = gateArt(m.theme);
  const svgOk = svgImg && svgImg.complete && svgImg.naturalWidth > 0;
  const key = `${id}|${pw}x${ph}|${!!bgImg}|${!!tex}|${!!gate}|${svgOk}`;
  if (mapLayerCache.key === key) return mapLayerCache.c;
  const c = mapLayerCache.c && mapLayerCache.c.width === pw && mapLayerCache.c.height === ph ? mapLayerCache.c : document.createElement('canvas');
  c.width = pw; c.height = ph;
  const x = c.getContext('2d');
  x.setTransform(pw / CONFIG.W, 0, 0, ph / CONFIG.H, 0, 0);
  if (bgImg) x.drawImage(bgImg, 0, 0, CONFIG.W, CONFIG.H);
  else { x.fillStyle = (MAP_THEMES[m.theme] || MAP_THEMES.song).ground; x.fillRect(0, 0, CONFIG.W, CONFIG.H); }
  drawThemedPath(x, id);
  drawEntry(x, id);
  if (gate) {
    const [ex, ey] = m.end, s = 124 * DK;
    x.drawImage(gate, ex * DK - s / 2, ey * DK - s * 0.62, s, s);
  } else if (svgOk) x.drawImage(svgImg, 0, 0, CONFIG.W, CONFIG.H);
  mapLayerCache = { key, c };
  return c;
}

// Phần động mỗi khung: nước có gợn trôi + mũi tên dòng chảy; đường bộ có dấu chân hiện dần theo hướng quái đi
function drawPathFx(ctx, id, t) {
  const m = MAPS[id] || MAPS.song1, kind = pathKind(m.theme), L = PATH_LOOK[kind];
  const { len, at } = geomFor(id);
  ctx.save();
  if (kind === 'nuoc') {
    const rnd = seededRand('fx-' + id);
    ctx.lineCap = 'round';
    // gợn nước: các vệt cong nhỏ trôi xuôi dòng, mờ dần ở hai đầu chu kỳ
    for (let i = 0; i < 34; i++) {
      const s0 = rnd() * len, lat = (rnd() - 0.5) * L.w * DK * 0.75, sp = 14 + rnd() * 10, ph = rnd();
      const s = (s0 + t * sp) % len, life = ((t * 0.35 + ph) % 1);
      const [px, py, a] = at(s), ox = px - Math.sin(a) * lat, oy = py + Math.cos(a) * lat;
      ctx.globalAlpha = Math.sin(life * Math.PI) * 0.45;
      ctx.strokeStyle = '#D6F1FA'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.ellipse(ox, oy, 7, 2.2, a, Math.PI * 0.1, Math.PI * 0.9); ctx.stroke();
    }
    // mũi tên dòng chảy (rất mờ) trôi chậm theo hướng quái đi
    ctx.strokeStyle = '#E8F8FF'; ctx.lineWidth = 2.2; ctx.lineJoin = 'round';
    for (let s = (t * 16) % 120; s < len; s += 120) {
      const [px, py, a] = at(s);
      ctx.globalAlpha = 0.22 * Math.min(1, s / 60, (len - s) / 60);
      ctx.save(); ctx.translate(px, py); ctx.rotate(a);
      ctx.beginPath(); ctx.moveTo(-4, -6); ctx.lineTo(3, 0); ctx.lineTo(-4, 6); ctx.stroke();
      ctx.restore();
    }
  } else {
    // dấu chân: in sẵn từng cặp so le, một "bước sóng" chạy dọc đường làm dấu hiện rồi mờ đi
    const step = 13, period = 260, head = (t * 40) % period;
    ctx.fillStyle = kind === 'da' || kind === 'gach' ? '#1A140C' : '#3A2410';
    for (let s = step, i = 0; s < len; s += step, i++) {
      const age = (head - (s % period) + period) % period;   // bao lâu kể từ lúc "bước qua"
      if (age > 120) continue;
      const a0 = (1 - age / 120) * 0.42;
      const [px, py, a] = at(s), sd = i % 2 ? 1 : -1;
      const fx = px - Math.sin(a) * sd * 4, fy = py + Math.cos(a) * sd * 4;
      ctx.globalAlpha = a0;
      ctx.save(); ctx.translate(fx, fy); ctx.rotate(a);
      ctx.beginPath(); ctx.ellipse(0, 0, 4.4, 2.4, 0, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(5.6, 0, 1.9, 1.9, 0, 0, 7); ctx.fill();
      ctx.restore();
    }
  }
  ctx.restore();
}
