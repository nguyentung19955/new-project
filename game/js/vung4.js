// BƯỚC 3 — VÙNG 4 SÔNG SÂU, PHIÊN 1 (docs/ke-hoach/buoc-3/KE-HOACH.md mục 5 hàng "1"): khung vùng 4 chạy được bằng HÌNH TẠM.
// Chỉ chạy khi G.VUNG4 (tắt: ?vung4=0 → tệp này không làm gì, game y hệt 3 vùng).
//  1. Trang 2 của bản đồ Chú Lái Đò (VS.MAP2 toạ độ 5 ải, VS.mapArt2 tranh vẽ bằng code) — js/village.js đọc. Phiên 2C: ảnh F1 chưa có nên giữ
//     tranh code; có tệp gd-ban-do-song thì tự dùng ảnh (Q7 = A).
//  2. Quái / trùm vùng 4 đang mượn hình Hang biển (G.MOB_ART, G.VUNG4_MUON trong js/data.js): lúc vẽ trận ở vùng 4 thì nhuộm hình quái xanh rêu
//     (ctx.filter; trình duyệt không hỗ trợ thì giữ màu gốc) và phủ một lớp nước đục lên nền phòng, để người chơi thấy đây là vùng khác.
//     Phiên 2A / 2B / 3A / 3B có ảnh thật thì đặt G.VUNG4_MUON = null (js/data.js) → hết nhuộm, hết phủ.
//  3. Chữ tiếng Anh của vài tên mới.
(function () {
  const G = window.G;
  if (!G || !G.VUNG4) return;
  const V4 = (G.vung4 = { LOC: 'hue-rotate(-62deg) saturate(0.8) brightness(0.93)', PHU: '#a8c8b4', dangVe: false });

  // ---------- 1. bản đồ trang 2: Sông sâu ----------
  function ganBanDo(VSx) {
    if (!VSx || VSx.MAP2) return;
    // Mảng theo chỉ số vùng (vùng 4 = chỉ số 3), cùng kiểu VS.MAP: nodes[r][i], from[r], names[r] = [x, y, màu chữ], bossLab[r]
    VSx.MAP2 = {
      nodes: [null, null, null, [[96, 200], [158, 158], [230, 186], [306, 144], [396, 104]]],
      from: [null, null, null, [44, 236]],
      names: [null, null, null, [252, 34, '#1f4a48']],
      bossLab: [null, null, null, [0, 31]],
      soon: [], soonDash: [],
      lang: [40, 252],
      doKho: [256, 7],
    };
    // Phiên 2C: ảnh bản đồ F1 chưa có → giữ tranh code. Khi có ảnh, cắt thành tệp gd-ban-do-song (kiểu "giao-dien", 480×270 như gd-ban-do-vung)
    // thì tự dán ảnh thay tranh code (vẫn kẻ viền, vẫn nhân màu đêm); toạ độ 5 ải ở MAP2 phải sửa theo ảnh mới.
    const cache = { g: null };
    const gdAnh = () => { const s = G.spriteCustom; return s && s.gdSan ? s.gdSan('gd-ban-do-song') : null; };
    VSx.mapArt2 = function (night) {
      const id = night ? 'n' : 'd', g = gdAnh();
      if (g !== cache.g) { cache.g = g; cache.n = cache.d = null; }
      if (cache[id]) return cache[id];
      const cv = document.createElement('canvas'); cv.width = 480; cv.height = 270;
      const c = cv.getContext('2d');
      if (g && g.img) {
        c.fillStyle = '#e6d8b0'; c.fillRect(0, 0, 480, 270);
        c.imageSmoothingEnabled = g.img.width > 480; c.drawImage(g.img, 0, 0, 480, 270); c.imageSmoothingEnabled = false;
        for (const k of [0, 1, 2]) { c.strokeStyle = ['#6a4a30', '#a88a58', '#6a4a30'][k]; c.lineWidth = 1; c.strokeRect(k * 2 + 0.5, k * 2 + 0.5, 479 - k * 4, 269 - k * 4); }
      } else tranhSong(c);
      if (night) { c.globalCompositeOperation = 'multiply'; c.fillStyle = '#8c88c4'; c.fillRect(0, 0, 480, 270); c.globalCompositeOperation = 'source-over'; }
      return (cache[id] = cv);
    };
  }
  // tranh giấy cũ: dòng sông uốn từ bến làng (góc dưới trái) ngược lên vực Thuồng Luồng (trên phải), lau sậy, nhà sàn, thác
  function tranhSong(c) {
    let s = 7;
    const rd = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    const p = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
    const ell = (x, y, rx, ry, col) => { c.fillStyle = col; c.beginPath(); c.ellipse(Math.round(x), Math.round(y), rx, ry, 0, 0, Math.PI * 2); c.fill(); };
    p(0, 0, 480, 270, '#e6d8b0');
    for (let i = 0; i < 900; i++) p(rd() * 480, rd() * 270, 1 + (rd() < 0.2 ? 1 : 0), 1, rd() < 0.5 ? '#d8c898' : '#f0e6c8');
    // dòng sông: dải rộng theo đường cong qua các ải
    const duong = [[20, 262], [60, 232], [96, 206], [128, 176], [160, 160], [196, 176], [232, 190], [270, 168], [306, 148], [350, 126], [396, 108], [440, 80], [470, 60]];
    const mau = [['#6a8a84', 15], ['#8aa8a0', 12], ['#b4cac0', 8]];
    for (const [col, w] of mau) {
      c.strokeStyle = col; c.lineWidth = w; c.lineJoin = 'round'; c.lineCap = 'round';
      c.beginPath(); c.moveTo(duong[0][0], duong[0][1]); for (const q of duong.slice(1)) c.lineTo(q[0], q[1]); c.stroke();
    }
    for (let i = 0; i < 40; i++) { const k = Math.floor(rd() * (duong.length - 1)), a = duong[k], b = duong[k + 1], u = rd(); p(a[0] + (b[0] - a[0]) * u - 3, a[1] + (b[1] - a[1]) * u, 6, 1, '#f4eee0'); }
    // lau sậy hai bên bờ
    for (let i = 0; i < 70; i++) {
      const k = Math.floor(rd() * (duong.length - 1)), a = duong[k], b = duong[k + 1], u = rd(), bo = rd() < 0.5 ? -1 : 1;
      const x = a[0] + (b[0] - a[0]) * u + bo * (4 + rd() * 6), y = a[1] + (b[1] - a[1]) * u + bo * (10 + rd() * 6);
      p(x, y - 7, 1, 7, '#7a8a50'); p(x - 1, y - 9, 3, 3, '#8a6a40'); if (rd() < 0.5) p(x + 2, y - 5, 1, 5, '#6a7a44');
    }
    // nhà sàn đổ (làng chài bỏ hoang) quanh ải 3
    for (const [hx, hy] of [[250, 214], [276, 208]]) { p(hx - 8, hy - 10, 16, 8, '#8a6a48'); for (let i = 0; i < 6; i++) p(hx - 10 + i, hy - 16 + i, 20 - i * 2, 1, '#6a5038'); for (const dx of [-7, -1, 6]) p(hx + dx, hy - 2, 1, 7, '#5a4030'); }
    // thác ngầm (ải 4) và vực đá (ải 5)
    for (let i = 0; i < 6; i++) p(318 + i * 3, 100, 2, 30, i % 2 ? '#d8e8e4' : '#b4cac0');
    for (const r of [[392, 74, 26, 12], [428, 92, 18, 10], [364, 88, 14, 8]]) { ell(r[0], r[1], r[2], r[3], '#6a7a7a'); ell(r[0] - 2, r[1] - 2, r[2] - 4, r[3] - 3, '#8a9a96'); }
    // bóng Thuồng Luồng uốn chữ S dưới nước gần vực (nét đậm, mắt xanh)
    c.strokeStyle = '#2a3a38'; c.lineWidth = 4; c.lineCap = 'round';
    c.beginPath(); c.moveTo(420, 132); c.bezierCurveTo(440, 116, 404, 112, 424, 96); c.bezierCurveTo(436, 88, 446, 92, 450, 84); c.stroke();
    p(447, 81, 2, 2, '#5ff0ff');
    // núi xa có sét (móc vùng 5)
    for (const m of [[430, 30, 22], [470, 22, 18]]) for (let i = 0; i < m[2]; i++) p(m[0] - i, m[1] + i, i * 2, 1, i < 3 ? '#b8a880' : '#d0c098');
    c.strokeStyle = '#c8a040'; c.lineWidth = 1; c.beginPath(); c.moveTo(452, 6); c.lineTo(446, 16); c.lineTo(452, 16); c.lineTo(445, 28); c.stroke();
    // bến đò làng
    p(10, 236, 22, 10, '#8a5a34'); for (let i = 0; i < 7; i++) p(8 + i, 229 + i, 26 - i, 1, '#c8402e'); ell(56, 246, 8, 2, '#5a4030'); p(51, 242, 10, 2, '#c9a24f');
    // la bàn, viền tranh
    const INK = '#4a3626';
    p(22, 14, 1, 18, INK); p(14, 22, 17, 1, INK); p(21, 12, 3, 3, '#c8402e');
    for (const k of [0, 1, 2]) { c.strokeStyle = ['#6a4a30', '#a88a58', '#6a4a30'][k]; c.lineWidth = 1; c.strokeRect(k * 2 + 0.5, k * 2 + 0.5, 479 - k * 4, 269 - k * 4); }
  }
  ganBanDo(G.villageScene); // js/village_scene.js (nạp trước tệp này); js/village.js đọc VS.MAP2 / VS.mapArt2 khi vẽ bản đồ

  // ---------- 2. nhuộm hình tạm khi vẽ trận vùng 4 ----------
  const muon = () => G.VUNG4_MUON != null;
  const dw = G.drawWorld;
  if (typeof dw === 'function') {
    G.drawWorld = function (reg) {
      V4.dangVe = reg === 3 && muon();
      try { return dw.apply(this, arguments); } finally { V4.dangVe = false; }
    };
  }
  const MA = G.monsterArt;
  if (MA && typeof MA.draw === 'function') {
    const d0 = MA.draw;
    MA.draw = function (c) {
      if (!V4.dangVe || !c || !('filter' in c)) return d0.apply(this, arguments);
      const f0 = c.filter;
      c.filter = f0 && f0 !== 'none' ? f0 + ' ' + V4.LOC : V4.LOC;
      try { return d0.apply(this, arguments); } finally { c.filter = f0; }
    };
  }
  const A = G.art;
  if (A && typeof A.bg === 'function') {
    const bg0 = A.bg;
    A.bg = function (c) {
      const kq = bg0.apply(this, arguments);
      if (V4.dangVe && c) {
        try {
          c.save();
          c.globalCompositeOperation = 'multiply'; c.fillStyle = V4.PHU; c.fillRect(-16, -16, G.W + 32, G.H + 32);
          c.globalCompositeOperation = 'source-over'; c.fillStyle = 'rgba(20,48,46,0.14)'; c.fillRect(-16, -16, G.W + 32, G.H + 32);
          c.restore();
        } catch (e) { /* chỉ là màu phủ */ }
      }
      return kq;
    };
  }

  // ---------- 3. chữ tiếng Anh ----------
  if (G.ngonNgu && G.ngonNgu.them) G.ngonNgu.them({
    'Sông sâu': 'Deep River', 'Thuồng Luồng': 'River Serpent', 'mảnh thuồng luồng': 'river serpent shard', 'sông sâu': 'deep river', 'nguyên liệu': 'materials', 'Cá Trê': 'Whisker Catfish', 'Nguyên liệu': 'Materials',
    '‹ Ba vùng đầu': '‹ First regions', '{0} ›': '{0} ›', 'Để dành (chưa có bộ trang phục vùng này)': 'Saved for later (no outfit for this region yet)',
  });
})();
