// Các bảng ghép: so sánh ba kiểu, Kiểu A ở ba chủ đề, ba trạng thái cửa.
(function () {
  const G = window.G, PT = window.PT;
  const BG = '#15110f', FG = '#f1ead9', GOLD = '#ffd27a';
  function font(c, px, bold) { c.font = (bold ? '700 ' : '500 ') + px + 'px ' + PT.FONT; c.textBaseline = 'alphabetic'; }
  function wrap(c, s, maxW) {
    const out = []; let line = '';
    for (const w of s.split(' ')) { const t = line ? line + ' ' + w : w; if (c.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; }
    if (line) out.push(line);
    return out;
  }
  function frame(c, img, x, y, w, h) {
    c.fillStyle = '#000'; c.fillRect(x - 4, y - 4, w + 8, h + 8);
    c.imageSmoothingEnabled = false; c.drawImage(img, x, y, w, h);
    c.strokeStyle = '#7a5a3a'; c.lineWidth = 4; c.strokeRect(x - 2, y - 2, w + 4, h + 4);
  }
  // Nhãn chú thích dán lên ảnh
  function tag(c, s, x, y, px) {
    font(c, px || 34, true);
    const w = c.measureText(s).width + 28, h = (px || 34) + 22;
    c.fillStyle = 'rgba(14,11,10,0.9)'; c.fillRect(x, y, w, h); c.strokeStyle = GOLD; c.lineWidth = 3; c.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
    c.fillStyle = GOLD; c.textAlign = 'left'; c.fillText(s, x + 14, y + h - 16);
  }

  // ---------- So sánh ba kiểu: xếp dọc cho dễ đọc trên điện thoại ----------
  PT.soSanh = function () {
    const items = [
      { key: 'Kiểu A', name: 'Phòng vuông nhìn từ trên xuống', img: PT.kieuA(), pts: [
        ['+', 'Đi đủ bốn hướng. Nhìn một cái thấy cả phòng và cả bốn cửa.'],
        ['+', 'Nút bấm và bản đồ nằm ở hai bên lề, không che trận đánh.'],
        ['-', 'Nhân vật và quái nhỏ hơn bây giờ một chút.'] ] },
      { key: 'Kiểu B', name: 'Giữ phòng nhìn ngang như bây giờ, thêm cửa lên và cửa xuống', img: PT.kieuB(), pts: [
        ['+', 'Hình to, đẹp y như game bây giờ, ít phải làm lại nhất.'],
        ['-', 'Chỗ đi lên đi xuống rất hẹp, vẫn giống đi ngang chứ chưa ra phòng vuông.'],
        ['-', 'Cửa lên và lối xuống dễ bị quái, nút bấm che mất; lối xuống trông hơi gượng.'] ],
        tags: [['◀ Cửa đi lên', 818, 300], ['◀ Lối đi xuống', 830, 742], ['Cửa trái ▶', 110, 420], ['◀ Cửa phải', 1150, 388]] },
      { key: 'Kiểu C', name: 'Phòng vuông rộng, màn hình chạy theo nhân vật', img: PT.kieuC(), pts: [
        ['+', 'Nhân vật to, rõ. Phòng rộng, có cảm giác đi khám phá.'],
        ['-', 'Không thấy hết phòng: quái và cửa hay nằm ngoài màn hình, phải nhìn bản đồ nhỏ.'],
        ['-', 'Nút bấm và bản đồ che một phần phòng. Tốn công làm nhất.'] ] },
    ];
    const M = 48, IW = 1440, IH = 810, W = IW + M * 2, PX = 44, LH = 60;
    const tmp = PT.mk(10, 10); font(tmp, PX, false);
    let H = 150;
    for (const it of items) { it.lines = it.pts.map((q) => wrap(tmp, q[1], IW - 170)); font(tmp, 46, true); it.nameLines = wrap(tmp, it.name, IW - 300); font(tmp, PX, false); it.h = 40 + it.nameLines.length * 58 + 34 + IH + 40 + it.lines.reduce((a, l) => a + l.length * LH + 16, 0) + 60; H += it.h; }
    const c = PT.mk(W, H); c.imageSmoothingEnabled = true;
    c.fillStyle = BG; c.fillRect(0, 0, W, H);
    font(c, 60, true); c.fillStyle = FG; c.textAlign = 'left'; c.fillText('Ba kiểu phòng để chọn', M, 96);
    c.fillStyle = '#7a5a3a'; c.fillRect(M, 124, IW, 4);
    let y = 150;
    for (const it of items) {
      y += 40;
      // nhãn đậm
      font(c, 60, true); const kw = c.measureText(it.key).width + 44;
      c.fillStyle = GOLD; c.fillRect(M, y, kw, 86); c.fillStyle = '#2a1a0c'; c.fillText(it.key, M + 22, y + 64);
      font(c, 46, true); c.fillStyle = FG;
      it.nameLines.forEach((l, i) => c.fillText(l, M + kw + 28, y + (it.nameLines.length > 1 ? 40 : 62) + i * 58));
      y += Math.max(86, it.nameLines.length * 58) + 34;
      frame(c, it.img, M, y, IW, IH);
      for (const t of it.tags || []) tag(c, t[0], M + t[1], y + t[2]);
      y += IH + 40;
      it.pts.forEach((q, i) => {
        const good = q[0] === '+';
        font(c, 34, true); c.fillStyle = good ? '#3f8a3a' : '#b0402e'; c.fillRect(M, y + 6, 132, 50);
        c.fillStyle = '#fff'; c.textAlign = 'center'; c.fillText(good ? 'Được' : 'Mất', M + 66, y + 44); c.textAlign = 'left';
        font(c, PX, false); c.fillStyle = FG;
        it.lines[i].forEach((l, k) => c.fillText(l, M + 156, y + 46 + k * LH));
        y += it.lines[i].length * LH + 16;
      });
      y += 60;
      c.fillStyle = '#3a2a22'; c.fillRect(M, y - 30, IW, 2);
    }
    return c.canvas;
  };

  // ---------- Kiểu A ở ba chủ đề ----------
  PT.baChuDe = function () {
    const names = ['Rừng già', 'Hang biển', 'Lâu đài cổ'], notes = ['Tường là thân cây, rễ cây và hàng rào gai', 'Tường là vách đá, nhũ đá và tinh thể', 'Tường gạch đá, đuốc và cờ'];
    const order = [2, 1, 0], K = 2, S = 270 * K, M = 40, GAP = 30;
    const W = M * 2 + S * 3 + GAP * 2, H = 150 + S + 150;
    const c = PT.mk(W, H); c.imageSmoothingEnabled = true; c.fillStyle = BG; c.fillRect(0, 0, W, H);
    font(c, 52, true); c.fillStyle = FG; c.textAlign = 'left'; c.fillText('Kiểu A ở ba chủ đề', M, 84);
    c.fillStyle = '#7a5a3a'; c.fillRect(M, 108, W - M * 2, 4);
    order.forEach((reg, i) => {
      const world = PT.sceneA(reg), img = PT.compose(world, K, null, { x: 105, y: 0, w: 270, h: 270 });
      const x = M + i * (S + GAP), y = 150;
      frame(c, img, x, y, S, S);
      font(c, 46, true); c.fillStyle = GOLD; c.textAlign = 'center'; c.fillText(names[reg], x + S / 2, y + S + 66);
      font(c, 27, false); c.fillStyle = FG; c.fillText(notes[reg], x + S / 2, y + S + 112);
    });
    return c.canvas;
  };

  // ---------- Ba trạng thái cửa của Kiểu A ----------
  const CROP = { x: 199, y: 0, w: 180, h: 180 };
  function doorFight() {
    return PT.sceneA(2, {
      hero: { x: 278, y: 122, face: 1 }, frames: 26,
      mobs: [{ role: 'rusher', x: 312, y: 120 }, { role: 'swarm', x: 250, y: 84, speed: 0.2 }, { role: 'shield', x: 318, y: 164, speed: 0.25 }, { role: 'archer', x: 226, y: 160, cd: 3, speed: 0.1 }],
      props: [{ type: 'brazier', env: true, x: 338, y: 86 }], zones: [{ x: 262, y: 160, r: 16 }],
    });
  }
  function doorOpen() {
    return PT.sceneA(2, { fight: false, state: 'open', hero: { x: 286, y: 128, face: 1 }, props: [{ type: 'brazier', env: true, x: 338, y: 86 }, { type: 'chest', x: 226, y: 112, act: 'chest', used: true }] });
  }
  // Hero bước qua cửa phải: màn hình đang trượt nửa chừng sang phòng bên
  function doorPass() {
    const g1 = PT.geom({ x: 15, y: 0, w: 270, h: 270, theme: 'castle', seed: 13, state: 'open' });
    const g2 = PT.geom({ x: 285, y: 0, w: 270, h: 270, theme: 'castle', seed: 31, open: { w: true }, noRug: false });
    PT.scene({
      reg: 2, seed: 3, hp: 0.82, bounds: { x0: 30, x1: 540, y0: 140, y1: 168 },
      hero: { x: 266, y: 158, face: 1 },
      mobs: [{ role: 'rusher', x: 352, y: 118, speed: 0.001, cd: 9 }, { role: 'swarm', x: 340, y: 84, speed: 0.001, cd: 9 }, { role: 'shield', x: 362, y: 172, speed: 0.001, cd: 9 }],
      props: [{ type: 'brazier', env: true, x: 248, y: 86 }, { type: 'brazier', env: true, x: 322, y: 92 }],
      frames: 22, input: { mx: 1 },
    });
    const T = PT.themes.castle;
    g1.noArrows = true; g2.noArrows = true;
    return PT.shot((c) => { T.bgOutside(c, PT.rng(42)); PT.room(c, g1); PT.room(c, g2); }, (c) => { PT.roomOver(c, g1); PT.roomOver(c, g2); });
  }
  PT.trangThaiCua = function () {
    const K = 3, S = CROP.w * K, M = 40, GAP = 30;
    const W = M * 2 + S * 3 + GAP * 2, H = 150 + S + 250;
    const c = PT.mk(W, H); c.imageSmoothingEnabled = true; c.fillStyle = BG; c.fillRect(0, 0, W, H);
    font(c, 52, true); c.fillStyle = FG; c.textAlign = 'left'; c.fillText('Kiểu A: cửa phòng đóng mở thế nào', M, 84);
    c.fillStyle = '#7a5a3a'; c.fillRect(M, 108, W - M * 2, 4);
    const map2 = { rooms: [{ x: 0, y: 1, s: 'seen', icon: 'start' }, { x: 1, y: 1, s: 'seen' }, { x: 1, y: 2, s: 'seen', icon: 'chest' }, { x: 2, y: 1, s: 'seen' }, { x: 2, y: 0, s: 'near' }, { x: 3, y: 1, s: 'cur' }, { x: 2, y: 2, s: 'near' }, { x: 3, y: 0, s: 'near' }], links: [[0, 1], [1, 2], [1, 3], [3, 4], [3, 5], [3, 6], [5, 7]] };
    const panels = [
      { t: '1. Đang đánh: cửa khóa', d: 'Còn quái thì chông sắt chặn hết các cửa, có ổ khóa đỏ.', w: doorFight },
      { t: '2. Dọn xong: cửa mở', d: 'Chông hạ xuống, ánh sáng tràn vào, mũi tên chỉ lối đi.', w: doorOpen },
      { t: '3. Bước qua cửa', d: 'Màn hình trượt sang phòng bên. Bản đồ nhỏ sáng thêm một ô.', w: doorPass, map: map2 },
    ];
    panels.forEach((pn, i) => {
      const world = pn.w();
      const img = PT.compose(world, K, pn.map ? (cc) => PT.minimap(cc, 3, 3, 76, 54, pn.map) : null, CROP);
      const x = M + i * (S + GAP), y = 150;
      frame(c, img, x, y, S, S);
      font(c, 40, true); c.fillStyle = GOLD; c.textAlign = 'left'; c.fillText(pn.t, x, y + S + 64);
      font(c, 30, false); c.fillStyle = FG;
      wrap(c, pn.d, S).forEach((l, k) => c.fillText(l, x, y + S + 112 + k * 42));
    });
    return c.canvas;
  };
})();
