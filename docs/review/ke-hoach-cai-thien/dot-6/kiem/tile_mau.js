// Đợt 6: BỘ TILE MẪU TỰ DỰNG để kiểm (không phải tranh thật, KHÔNG đưa vào game/art/custom).
// Vẽ pixel đơn giản theo bảng màu lõi (docs/vfx/BANG-MAU-LOI.md: cỏ cây, gỗ, đá, bóng), mọi mảng lặp đều vẽ "cuộn vòng" nên mép khớp tuyệt đối.
// Dùng trong trang (Playwright): window.taoTileMau() -> { 'gd-nen-rung-san0': canvas (nét gấp đôi), … };  window.taoTileDo() -> bộ một màu để dò khe hở.
(function () {
  const CO = { san0: [64, 64], san1: [64, 64], san2: [64, 64], 'san-nhan': [64, 64], 'tuong-sau': [64, 49], 'tuong-ben': [14, 64], 'tuong-truoc': [64, 12], ngoai: [64, 64], mep: [64, 12] };
  const rnd = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
  function buc(w, h, cuonX, cuonY) {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const c = cv.getContext('2d');
    const p = (x, y, col) => {
      x = Math.round(x); y = Math.round(y);
      if (cuonX) x = ((x % w) + w) % w; else if (x < 0 || x >= w) return;
      if (cuonY) y = ((y % h) + h) % h; else if (y < 0 || y >= h) return;
      c.fillStyle = col; c.fillRect(x, y, 1, 1);
    };
    const r = (x, y, ww, hh, col) => { for (let j = 0; j < hh; j++) for (let i = 0; i < ww; i++) p(x + i, y + j, col); };
    const e = (cx, cy, rx, ry, col) => { for (let j = -ry; j <= ry; j++) for (let i = -rx; i <= rx; i++) if ((i * i) / (rx * rx + 0.01) + (j * j) / (ry * ry + 0.01) <= 1) p(cx + i, cy + j, col); };
    return { cv, c, p, r, e };
  }
  const gap2 = (cv) => { const o = document.createElement('canvas'); o.width = cv.width * 2; o.height = cv.height * 2; const x = o.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(cv, 0, 0, o.width, o.height); return o; };
  // Màu sàn theo đặc tả (dac-ta-trang-thai-va-tile.md mục 5): #3b6d2a 55%, #2a4d1f 25%, #1c3316 10%, #4a7a33 5%, #5a4a30 5%. Không dùng ba màu hệ Độc.
  // Nền chung của mọi mảng sàn: mép các mảng giống nhau nên mảng nào đặt cạnh mảng nào cũng liền. reu: số đám rêu sẫm; dat: số vệt đất; soi: số sỏi.
  function san(seed, reu, dat, soi) {
    const B = buc(64, 64, 1, 1), rn = rnd(seed);
    B.r(0, 0, 64, 64, '#3b6d2a');
    for (let i = 0; i < reu; i++) { const x = 8 + rn() * 48, y = 8 + rn() * 48; B.e(x, y, 4 + rn() * 5, 2 + rn() * 3, '#2a4d1f'); }
    for (let i = 0; i < 46; i++) B.p(rn() * 64, rn() * 64, '#2a4d1f');
    for (let i = 0; i < dat; i++) { const x = 8 + rn() * 48, y = 8 + rn() * 48; B.e(x, y, 3 + rn() * 3, 1 + rn() * 2, '#5a4a30'); }
    for (let i = 0; i < soi; i++) { const x = Math.round(7 + rn() * 50), y = Math.round(7 + rn() * 50); B.r(x, y + 1, 3, 1, '#1c3316'); B.r(x, y, 2, 1, '#5a4a30'); B.p(x + 1, y, '#4a7a33'); }
    for (let i = 0; i < 5; i++) { const x = Math.round(8 + rn() * 48), y = Math.round(10 + rn() * 46); B.r(x - 1, y, 4, 1, '#1c3316'); B.r(x, y - 2, 1, 2, '#4a7a33'); B.r(x + 1, y - 3, 1, 3, '#4a7a33'); } // khóm cỏ ngắn
    return B;
  }
  window.taoTileMau = function () {
    const o = {};
    let B, rn;
    o.san0 = san(11, 12, 3, 3).cv; // nhiều rêu
    o.san1 = san(23, 6, 8, 3).cv;  // nhiều đất
    o.san2 = san(37, 6, 3, 10).cv; // nhiều sỏi
    // san-nhan: phiến đá phẳng phủ rêu và đoạn rễ nổi ở giữa (≤ 40 điểm ảnh), mép vẫn là nền chung
    B = san(51, 5, 2, 2);
    B.e(30, 32, 15, 9, '#1c3316'); B.e(30, 31, 14, 8, '#333c47'); B.e(28, 29, 10, 5, '#4a5560'); B.e(34, 34, 5, 2, '#2a4d1f');
    for (let k = 0; k < 26; k++) { const x = 16 + k, y = 46 + Math.round(Math.sin(k * 0.35) * 2); B.r(x, y + 1, 2, 1, '#14182e'); B.r(x, y, 2, 1, '#5a4a30'); }
    o['san-nhan'] = B.cv;
    // tuong-sau 64×49: 7 hàng trên là tán lá, dưới là hai thân cây và khe tối; lặp ngang
    B = buc(64, 49, 1, 0); rn = rnd(63);
    B.r(0, 0, 64, 49, '#07100b');
    const than = (x, w) => { B.r(x - 1, 5, w + 2, 44, '#120d11'); B.r(x, 5, w, 44, '#3b2d20'); B.r(x, 5, 3, 44, '#57432e'); B.r(x + w - 4, 5, 4, 44, '#261c14');
      for (let i = 0; i < 6; i++) B.r(x + 4 + Math.floor(rn() * (w - 9)), 8 + Math.floor(rn() * 30), 1, 5 + Math.floor(rn() * 6), rn() < 0.5 ? '#261c14' : '#57432e');
      B.r(x + 2, 20 + Math.floor(rn() * 12), 6, 2, '#3d6a2e'); B.r(x - 3, 46, w + 6, 3, '#261c14'); B.r(x - 2, 45, 4, 2, '#3b2d20'); B.r(x + w - 2, 45, 4, 2, '#3b2d20'); };
    than(3, 24); than(34, 26);
    B.r(0, 45, 64, 4, '#1c3316'); // dải tối chân tường (chỗ gặp sàn)
    for (let x = 0; x < 64; x += 7) { B.e(x + rn() * 4, 4 + rn() * 2, 6, 4, '#13291a'); B.e(x + rn() * 4, 3 + rn() * 2, 5, 3, '#1d3d25'); B.e(x + rn() * 4, 2, 3, 1, '#2f5f34'); }
    o['tuong-sau'] = B.cv;
    // tuong-ben 14×64: rào lá dày, dây gai chạy dọc; lặp dọc
    B = buc(14, 64, 0, 1); rn = rnd(71);
    B.r(0, 0, 14, 64, '#13291a');
    for (let y = 0; y < 64; y += 6) { B.e(7 + rn() * 3 - 1, y + 3, 6, 4, '#1d3d25'); B.e(6 + rn() * 2, y + 2, 4, 2, '#2f5f34'); }
    for (let y = 0; y < 64; y++) { const x = 6 + Math.round(Math.sin((y / 64) * Math.PI * 4) * 2); B.r(x, y, 2, 1, '#58371e'); B.p(x, y, '#79451d'); if (y % 8 === 3) B.p(x + 2, y, '#c98c34'); }
    B.r(12, 0, 2, 64, '#1c3316'); // vạch tối phía sàn
    o['tuong-ben'] = B.cv;
    // tuong-truoc 64×12: rào lá thấp; lặp ngang
    B = buc(64, 12, 1, 0); rn = rnd(83);
    B.r(0, 0, 64, 12, '#13291a');
    for (let x = 0; x < 64; x += 6) { B.e(x + rn() * 3, 6, 6, 5, '#1d3d25'); B.e(x + rn() * 3 - 1, 5, 4, 3, '#2f5f34'); B.p(x + 2, 3, '#557521'); }
    for (let x = 0; x < 64; x++) { const y = 7 + Math.round(Math.sin((x / 64) * Math.PI * 4) * 2); B.r(x, y, 1, 2, '#58371e'); B.p(x, y, '#79451d'); }
    o['tuong-truoc'] = B.cv;
    // ngoai 64×64: nền tối ngoài phòng; lặp cả hai chiều
    B = buc(64, 64, 1, 1); rn = rnd(97);
    B.r(0, 0, 64, 64, '#0f1a0c');
    for (let i = 0; i < 10; i++) B.e(rn() * 64, rn() * 64, 5 + rn() * 7, 3 + rn() * 3, '#14182e');
    o.ngoai = B.cv;
    // mep 64×12: cỏ cao mọc từ đáy lên, nền trong suốt; lặp ngang
    B = buc(64, 12, 1, 0); rn = rnd(109);
    B.r(0, 10, 64, 2, '#1d3d25'); // gốc cỏ dính liền thành một dải ở đáy
    for (let x = 0; x < 64; x += 2 + Math.floor(rn() * 3)) { const h = 3 + Math.floor(rn() * 7); B.r(x, 12 - h, 1, h, rn() < 0.5 ? '#2f5f34' : '#3d6a2e'); if (rn() < 0.4) B.p(x, 12 - h, '#557521'); }
    o.mep = B.cv;
    const kq = {};
    for (const k in o) kq['gd-nen-rung-' + k] = gap2(o[k]);
    return kq;
  };
  // Bộ MỘT MÀU để dò khe hở: mỗi loại mảng một màu chói riêng, không màu nào giống màu code của game.
  const DO = { san0: '#60ff60', san1: '#60ff60', san2: '#60ff60', 'san-nhan': '#60ff60', 'tuong-sau': '#ff4040', 'tuong-ben': '#ffff40', 'tuong-truoc': '#ff40ff', ngoai: '#4040ff' };
  window.taoTileDo = function () {
    const kq = {};
    for (const k in DO) { const cv = document.createElement('canvas'); cv.width = CO[k][0] * 2; cv.height = CO[k][1] * 2; const c = cv.getContext('2d'); c.fillStyle = DO[k]; c.fillRect(0, 0, cv.width, cv.height); kq['gd-nen-rung-' + k] = cv; }
    return kq;
  };
  // Tệp .sprite.json đúng như trang Tách Phòng xuất (để đo dung lượng và nạp qua đường nạp thật của game).
  window.tepTile = (bo) => Object.keys(bo).map((ma) => ({ loai: 'linh-khi-sprite', phien_ban: 1, ma, ten: ma, doi_tuong: 'giao-dien', rong: bo[ma].width / 2, cao: bo[ma].height / 2, net: 2, anh: bo[ma].toDataURL('image/png') }));
  // Tấm ảnh VUÔNG = 3 × 3 lần lặp của một mảng (giả ảnh ChatGPT cho lô "vẽ riêng một mảng sàn"); lech: dịch cả hoa văn đi vài điểm ảnh để thử phần dò lệch.
  window.anhLap3 = function (cv2, canh, lech) {
    canh = canh || 1024; const cv = document.createElement('canvas'); cv.width = cv.height = canh; const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
    const p = canh / 3; for (let j = -1; j < 4; j++) for (let i = -1; i < 4; i++) c.drawImage(cv2, Math.round(i * p + (lech || 0)), Math.round(j * p + (lech || 0)), Math.ceil(p), Math.ceil(p));
    return cv;
  };
  // Tấm ảnh lưới 3×3 "giả ChatGPT" (nền hồng tím, kẻ lưới tối) để thử trang Tách Phòng.
  window.anhLuoiTile = function (bo, W, H) {
    W = W || 1536; H = H || 1024;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
    c.fillStyle = '#ff00ff'; c.fillRect(0, 0, W, H); c.imageSmoothingEnabled = false;
    const ds = ['san0', 'san1', 'san2', 'san-nhan', 'ngoai', 'tuong-sau', 'tuong-truoc', 'mep', 'tuong-ben'], cw = W / 3, ch = H / 3;
    ds.forEach((k, i) => {
      const s = bo['gd-nen-rung-' + k], cx = (i % 3) * cw + cw / 2, cy = ((i / 3) | 0) * ch + ch / 2, z = Math.max(1, Math.floor(Math.min((cw * 0.8) / s.width, (ch * 0.8) / s.height)));
      c.drawImage(s, Math.round(cx - (s.width * z) / 2), Math.round(cy - (s.height * z) / 2), s.width * z, s.height * z);
    });
    c.fillStyle = '#1a1420';
    for (let i = 1; i < 3; i++) { c.fillRect(Math.round(i * cw) - 2, 0, 4, H); c.fillRect(0, Math.round(i * ch) - 2, W, 4); }
    return cv;
  };
})();
