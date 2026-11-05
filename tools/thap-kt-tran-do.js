// TURRET MERGE — hàm đo chạy TRONG trang (dùng bởi tools/thap-kt-tran.js).
// Trả { chu: [...], anh: [...], ngang: [...], thanh: [...], de: [...] } — mỗi mục là 1 chuỗi mô tả lỗi.
// chu   : chữ tràn khung (scrollWidth > clientWidth, hoặc dòng chữ vượt hộp của chính nó / của tấm cha bị cắt)
// anh   : ảnh bị méo (tỉ lệ hiển thị lệch > 3% so với ảnh gốc) — <img> (tính object-fit) và ảnh nền (background-size)
// ngang : trang/khung cuộn dọc có tràn NGANG; thanh cuộn hệ thống lộ ra
// de    : tiêu đề dính (sticky) bị thẻ đè lên (điểm giữa tiêu đề không thuộc tiêu đề)
module.exports = function doTrang(opt) {
  opt = opt || {};
  const out = { chu: [], anh: [], ngang: [], thanh: [], de: [] };
  const hien = (e) => {
    if (!e || !e.isConnected) return false;
    for (let x = e; x && x !== document.documentElement; x = x.parentElement) {
      if (x.hidden) return false;
      const s = getComputedStyle(x);
      if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < 0.05) return false;
    }
    const r = e.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    return true;
  };
  const ten = (e) => {
    let s = e.tagName.toLowerCase(); if (e.id) s += '#' + e.id;
    const c = (typeof e.className === 'string' ? e.className : '').trim().split(/\s+/).filter(Boolean).slice(0, 2);
    if (c.length) s += '.' + c.join('.');
    const p = e.parentElement; if (p && !e.id) { let q = p.id ? '#' + p.id : (typeof p.className === 'string' && p.className.trim() ? '.' + p.className.trim().split(/\s+/)[0] : p.tagName.toLowerCase()); s = q + ' > ' + s; }
    return s;
  };
  const chuRieng = (e) => { for (const n of e.childNodes) if (n.nodeType === 3 && n.textContent.trim()) return n.textContent.trim(); return ''; };
  const cuonDuoc = (s, k) => /auto|scroll/.test(s['overflow' + k]);
  const tatCa = [...document.querySelectorAll('body *')].filter(e => !/^(script|style|link|meta|canvas|svg|path|br|option)$/i.test(e.tagName));
  const hienDs = tatCa.filter(hien);
  const daBao = new Set();
  // ---------- 1) CHỮ TRÀN ----------
  for (const e of hienDs) {
    const t = chuRieng(e); if (!t) continue;
    const s = getComputedStyle(e);
    if (cuonDuoc(s, 'X')) continue; // khung cuộn ngang có chủ đích
    if (e.tagName === 'INPUT' || e.tagName === 'TEXTAREA') continue;
    const elip = s.textOverflow === 'ellipsis' && s.overflowX !== 'visible' && !/flex|grid/.test(s.display); // flex/grid: trình duyệt KHÔNG vẽ dấu … → chữ bị cụt
    const tranW = e.scrollWidth - e.clientWidth;
    if (!elip && tranW > 1 && e.clientWidth > 0) { out.chu.push(ten(e) + ' "' + t.slice(0, 24) + '" tràn ngang ' + tranW + 'px'); daBao.add(e); continue; }
    // chữ thật (range) vượt hộp của chính phần tử hoặc tấm cha đang cắt
    const rg = document.createRange(); rg.selectNodeContents(e);
    let R = null; for (const q of rg.getClientRects()) { if (!q.width) continue; R = R ? { l: Math.min(R.l, q.left), r: Math.max(R.r, q.right), t: Math.min(R.t, q.top), b: Math.max(R.b, q.bottom) } : { l: q.left, r: q.right, t: q.top, b: q.bottom }; }
    if (!R) continue;
    const b = e.getBoundingClientRect();
    // phần tử tự cắt chữ (overflow hidden / line-clamp) → chỉ phần nằm trong hộp của nó là thấy được
    const skx = b.width / (e.offsetWidth || b.width) || 1, px = (k) => parseFloat(s[k]) * skx;
    if (s.overflowX !== 'visible') { // có dấu … → chữ dừng ở mép NỘI DUNG; không có → bị cắt ở mép đệm
      const l = b.left + px('borderLeftWidth') + (elip ? px('paddingLeft') : 0), r = b.right - px('borderRightWidth') - (elip ? px('paddingRight') : 0);
      R.l = Math.max(R.l, l); R.r = Math.min(R.r, r);
    }
    if (s.overflowY !== 'visible') { R.t = Math.max(R.t, b.top); R.b = Math.min(R.b, b.bottom); }
    // hộp dòng của phông cao hơn nét chữ thật ~15% mỗi phía
    { const f = parseFloat(s.fontSize) * skx * 0.15; R.t += f; R.b -= f; }
    // chữ nằm trong hộp nhưng hộp bị tấm cha (overflow hidden) cắt mất?
    for (let x = e.parentElement, d = 0; x && d < 6 && x !== document.body; x = x.parentElement, d++) {
      const xs = getComputedStyle(x);
      if (xs.overflowX === 'visible' && xs.overflowY === 'visible') continue;
      if (cuonDuoc(xs, 'Y') || cuonDuoc(xs, 'X')) break; // vùng cuộn: chữ ra ngoài là do cuộn
      const xr = x.getBoundingClientRect(), sc = xr.width / (x.offsetWidth || xr.width) || 1;
      const m = 1.5 * sc;
      if (R.l < xr.left - m || R.r > xr.right + m) { out.chu.push(ten(e) + ' "' + t.slice(0, 24) + '" bị cắt ngang bởi ' + ten(x)); daBao.add(e); break; }
      if (R.t < xr.top - m * 2 || R.b > xr.bottom + m * 2) { out.chu.push(ten(e) + ' "' + t.slice(0, 24) + '" bị cắt dọc bởi ' + ten(x) + ' [' + [R.t, R.b, xr.top, xr.bottom].map(Math.round) + ']'); daBao.add(e); break; }
      break;
    }
    if (daBao.has(e)) continue;
    // chữ phải nằm trong TẤM ảnh (nền / border-image) gần nhất — tấm có thể là chính nó hoặc cha ≤ 3 bậc
    for (let x = e, d = 0; x && d < 4 && x !== document.body; x = x.parentElement, d++) {
      const xs = getComputedStyle(x);
      const coAnh = (xs.backgroundImage && /url\(/.test(xs.backgroundImage)) || (xs.borderImageSource && xs.borderImageSource !== 'none') || x.classList.contains('ot'); // ô tối giản (o-toigian): viền là <img.ov> PNG con, chữ LV/số nằm trên ảnh trong ô
      if (!coAnh) { if (d > 0 && (cuonDuoc(xs, 'Y') || cuonDuoc(xs, 'X'))) break; continue; }
      const xr = x.getBoundingClientRect(); if (xr.height > 220) break;
      const sc = xr.width / (x.offsetWidth || xr.width) || 1, m = 1.5 * sc;
      // tấm 9 lát (border-image): chữ không được đè lên viền khung — vùng trong = hộp trừ border-image-width
      if (xs.borderImageSource && xs.borderImageSource !== 'none') {
        const bw = xs.borderImageWidth.split(/\s+/).map(v => /px$/.test(v) ? parseFloat(v) : 0);
        const [bt, br, bb, bl] = [bw[0] || 0, bw[1] != null ? bw[1] : bw[0] || 0, bw[2] != null ? bw[2] : bw[0] || 0, bw[3] != null ? bw[3] : (bw[1] != null ? bw[1] : bw[0] || 0)];
        const tr = { l: xr.left + bl * sc * 0.6, r: xr.right - br * sc * 0.6, t: xr.top + bt * sc * 0.5, b: xr.bottom - bb * sc * 0.5 };
        if (R.l < tr.l - m || R.r > tr.r + m || R.t < tr.t - m || R.b > tr.b + m) { out.chu.push(ten(e) + ' "' + t.slice(0, 24) + '" đè viền khung ' + ten(x) + ' (' + Math.round(Math.max(tr.l - R.l, R.r - tr.r, tr.t - R.t, R.b - tr.b) / sc) + 'px)'); daBao.add(e); break; }
      }
      if (R.l < xr.left - m || R.r > xr.right + m || R.t < xr.top - m * 3 || R.b > xr.bottom + m * 3) { out.chu.push(ten(e) + ' "' + t.slice(0, 24) + '" ra ngoài tấm ' + ten(x) + ' (' + Math.round(Math.max(xr.left - R.l, R.r - xr.right, xr.top - R.t, R.b - xr.bottom) / sc) + 'px)'); daBao.add(e); }
      break;
    }
    if (daBao.has(e)) continue;
    if (s.overflowY !== 'visible' && !cuonDuoc(s, 'Y') && e.scrollHeight - e.clientHeight > 2 && !(+s.webkitLineClamp > 0)) { out.chu.push(ten(e) + ' "' + t.slice(0, 24) + '" tràn dọc ' + (e.scrollHeight - e.clientHeight) + 'px'); daBao.add(e); }
  }
  // ---------- 2) ẢNH MÉO ----------
  const lech = (a, b) => Math.abs(a / b - 1);
  for (const e of hienDs) {
    if (e.tagName === 'IMG') {
      if (!e.complete || !e.naturalWidth) continue;
      const s = getComputedStyle(e), nw = e.naturalWidth, nh = e.naturalHeight;
      const sc = (s.scale && s.scale !== 'none') ? s.scale.split(' ').map(Number) : [1]; // ảnh có lề hoạ tiết phóng bằng scale (css/khung-p9.css): xét tỉ lệ ĐÃ phóng
      const w = e.clientWidth * sc[0], h = e.clientHeight * (sc[1] || sc[0]); if (w < 3 || h < 3) continue;
      if (/contain|cover|scale-down|none/.test(s.objectFit)) continue;
      const d = lech(w / h, nw / nh); if (d > 0.03) out.anh.push(ten(e) + ' ' + (e.getAttribute('src') || '').split('/').pop() + ' ' + w + '×' + h + ' gốc ' + nw + '×' + nh + ' lệch ' + Math.round(d * 100) + '%');
      continue;
    }
    const s = getComputedStyle(e);
    if (!s.backgroundImage || s.backgroundImage === 'none' || !/url\(/.test(s.backgroundImage)) continue;
    if (s.borderImageSource && s.borderImageSource !== 'none') continue;
    const urls = [...s.backgroundImage.matchAll(/url\("?([^")]+)"?\)/g)].map(m => m[1]);
    const sizes = s.backgroundSize.split(',').map(x => x.trim());
    urls.forEach((u, i) => {
      const nat = (window.__KT_NAT || {})[u]; if (!nat) { (window.__KT_CAN = window.__KT_CAN || new Set()).add(u); return; }
      const bs = sizes[i] || sizes[0] || 'auto';
      if (/contain|cover/.test(bs) || bs === 'auto' || bs === 'auto auto') return;
      const p = bs.split(/\s+/); if (p.length < 2 || p[1] === 'auto' || p[0] === 'auto') return;
      const W = e.clientWidth || e.getBoundingClientRect().width, H = e.clientHeight || e.getBoundingClientRect().height;
      const v = (x, L) => /%$/.test(x) ? parseFloat(x) / 100 * L : parseFloat(x);
      const w = v(p[0], W), h = v(p[1], H); if (!(w > 2 && h > 2)) return;
      const d = lech(w / h, nat[0] / nat[1]);
      if (d > 0.03) out.anh.push(ten(e) + ' nền ' + u.split('/').pop() + ' ' + Math.round(w) + '×' + Math.round(h) + ' gốc ' + nat[0] + '×' + nat[1] + ' lệch ' + Math.round(d * 100) + '%');
    });
  }
  // ---------- 3) TRÀN NGANG + THANH CUỘN ----------
  const de = document.documentElement;
  if (de.scrollWidth > innerWidth + 1) out.ngang.push('trang rộng ' + de.scrollWidth + ' > ' + innerWidth);
  if (document.body.scrollWidth > innerWidth + 1) out.ngang.push('body rộng ' + document.body.scrollWidth + ' > ' + innerWidth);
  for (const e of hienDs) {
    const s = getComputedStyle(e);
    const cy = cuonDuoc(s, 'Y'), cx = cuonDuoc(s, 'X');
    if (!cy && !cx) continue;
    if (cy && cx && e.scrollWidth > e.clientWidth + 1 && e.scrollHeight > e.clientHeight + 1) out.ngang.push(ten(e) + ' cuộn dọc nhưng tràn ngang ' + (e.scrollWidth - e.clientWidth) + 'px');
    const bL = parseFloat(s.borderLeftWidth) + parseFloat(s.borderRightWidth), bT = parseFloat(s.borderTopWidth) + parseFloat(s.borderBottomWidth);
    const sbV = e.offsetWidth - e.clientWidth - bL, sbH = e.offsetHeight - e.clientHeight - bT;
    if (sbV > 0.5 || sbH > 0.5) out.thanh.push(ten(e) + ' lộ thanh cuộn ' + (sbV > 0.5 ? 'dọc ' : '') + (sbH > 0.5 ? 'ngang' : ''));
  }
  // ---------- 4) TIÊU ĐỀ DÍNH BỊ ĐÈ ----------
  for (const e of hienDs) {
    const s = getComputedStyle(e); if (s.position !== 'sticky') continue;
    const r = e.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) continue;
    for (const fx of [0.15, 0.5, 0.85]) {
      const x = r.left + r.width * fx, y = r.top + r.height / 2;
      if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue;
      const h = document.elementFromPoint(x, y);
      if (h && h !== e && !e.contains(h)) {
        // chỉ là lớp phủ toàn màn (bảng mở) thì bỏ qua
        if (h.contains(e)) continue;
        let sc = e.parentElement; while (sc && sc !== document.body && !cuonDuoc(getComputedStyle(sc), 'Y')) sc = sc.parentElement;
        if (sc && !sc.contains(h)) continue; // lớp khác (bảng mở) phủ lên — không phải thẻ trong danh sách
        out.de.push(ten(e) + ' bị ' + ten(h) + ' đè (' + Math.round(fx * 100) + '%)'); break;
      }
    }
  }
  return out;
};
