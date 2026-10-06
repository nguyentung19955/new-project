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
    + (MAP_BG.has(m.theme) ? `${mapPathSvg(m.d, t)}${mapGate(t.gate, ex, ey)}</svg>`   // v124: có nền vẽ tay → chỉ vẽ đường + cổng thành lên trên
      : `<rect width="932" height="430" fill="url(#mg-${id})"/>${mapTopBand(m.theme)}${mapPathSvg(m.d, t)}<g>${deco}</g>${mapGate(t.gate, ex, ey)}</svg>`);
  mapSvgCache.set(id, svg);
  return svg;
}
