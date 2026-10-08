// Ghép các ảnh tổng hợp: ba chủ đề, ba trạng thái cửa, bảng so sánh ba kiểu.
(function () {
  const G = window.G, M = window.Mock, U = M.util, mk = U.mk;
  const FONT = '"DejaVu Sans", "Noto Sans", sans-serif';
  const BG = '#161012', FG = '#f1ead9', ACC = '#ffd27a';
  function text(c, s, x, y, size, o) {
    o = o || {};
    c.font = (o.bold ? '700 ' : '400 ') + size + 'px ' + FONT;
    c.textAlign = o.align || 'left'; c.textBaseline = 'alphabetic';
    c.fillStyle = o.color || FG;
    c.fillText(s, x, y);
  }
  function wrap(c, s, maxW, size, bold) {
    c.font = (bold ? '700 ' : '400 ') + size + 'px ' + FONT;
    const out = []; let cur = '';
    for (const w of s.split(' ')) { const t = cur ? cur + ' ' + w : w; if (c.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t; }
    if (cur) out.push(cur);
    return out;
  }
  function frame(c, x, y, w, h) { c.fillStyle = '#7a5a3a'; c.fillRect(x - 3, y - 3, w + 6, h + 6); }

  // ---------- Kiểu A ở ba chủ đề ----------
  M.baChuDe = function () {
    const items = [
      ['castle', 'Lâu đài cổ', 'Tường gạch đá, đuốc, cờ. Cửa khóa bằng song sắt.'],
      ['cave', 'Hang động', 'Vách đá, nhũ đá, tinh thể. Cửa bị tinh thể chắn.'],
      ['forest', 'Rừng già', 'Tường là thân cây khổng lồ và hàng rào gai. Cửa bị dây gai chắn.'],
    ];
    const cw = 252, sc = 2, pw = cw * sc, ph = 270 * sc, gap = 30, top = 110;
    const W = gap + items.length * (pw + gap), H = top + ph + 150;
    const c = mk(W, H);
    c.fillStyle = BG; c.fillRect(0, 0, W, H);
    text(c, 'Kiểu A ở ba chủ đề', W / 2, 70, 50, { bold: true, align: 'center', color: ACC });
    items.forEach((it, i) => {
      const cv = M.plainA(it[0], {}, 960);
      const x = gap + i * (pw + gap);
      frame(c, x, top, pw, ph);
      c.imageSmoothingEnabled = false;
      c.drawImage(cv, 114 * sc, 0, pw, ph, x, top, pw, ph);
      text(c, it[1], x + pw / 2, top + ph + 52, 38, { bold: true, align: 'center' });
      c.imageSmoothingEnabled = true;
      wrap(c, it[2], pw - 10, 25).forEach((l, j) => text(c, l, x + pw / 2, top + ph + 90 + j * 32, 25, { align: 'center', color: '#d9cdb8' }));
    });
    return c.canvas.toDataURL('image/png');
  };

  // ---------- Ba trạng thái cửa của Kiểu A ----------
  M.trangThaiCua = function () {
    const open = { top: 'open', bottom: 'open', left: 'open', right: 'open' };
    const MAP2 = {
      cells: [[0, 1, 'seen'], [1, 1, 'seen'], [1, 2, 'seen', 'chest'], [2, 1, 'seen'], [3, 1, 'cur'], [2, 0, 'next'], [2, 2, 'next'], [3, 0, 'next']],
      links: [[0, 1, 1, 1], [1, 1, 1, 2], [1, 1, 2, 1], [2, 1, 3, 1], [2, 1, 2, 0], [2, 1, 2, 2], [3, 1, 3, 0]],
    };
    const panels = [
      {
        title: '1. Đang đánh: cửa khóa', note: 'Còn quái thì song sắt chắn mọi cửa, có ổ khóa đỏ.',
        o: {
          scene: {
            hero: { x: 258, y: 132, face: 1 },
            ents: [{ role: 'rusher', x: 286, y: 133, hp: 0.6, cd: 9 }, { role: 'swarm', x: 306, y: 96, cd: 9 }, { role: 'shield', x: 316, y: 166, cd: 9 }, { role: 'archer', x: 222, y: 92, face: 1, cd: 9 }],
            props: [{ type: 'brazier', x: 322, y: 80 }], zones: [{ x: 232, y: 164, r: 20, t: 3, t0: 4.2, life: 0.12 }],
          },
        },
      },
      {
        title: '2. Dọn xong: cửa mở', note: 'Hết quái thì song sắt hạ xuống, ánh sáng tràn vào, mũi tên vàng chỉ lối đi.',
        o: {
          states: open,
          scene: { cleared: true, hero: { x: 248, y: 142, face: 1 }, ents: [], props: [{ type: 'brazier', x: 322, y: 80 }], zones: [] },
          play: { hits: 0, warm: 2, move: {}, hp: 0.9 },
          after: () => { G.ui.text('Sạch bóng quái!', 290, 110, { size: 11, bold: true, align: 'center', color: '#ffd23f' }); },
        },
      },
      {
        title: '3. Qua cửa: sang phòng kế', note: 'Màn hình tối nhanh rồi hiện phòng mới. Bản đồ sáng thêm một ô.',
        o: {
          states: open, bounds: { x1: 360 },
          scene: { cleared: true, hero: { x: 336, y: 157, face: 1 }, ents: [], props: [{ type: 'brazier', x: 322, y: 80 }], zones: [] },
          play: { hits: 0, warm: 9, move: { mx: 1 }, hp: 0.9 },
          after: (R) => {
            // màn hình khép tối quanh hero
            const P = G.getRun().P, wc = R.wc, cx = Math.round(P.x) + 2, cy = Math.round(P.y) - 14;
            for (const [rad, a] of [[58, 0.45], [46, 0.45], [36, 0.5]]) {
              wc.fillStyle = 'rgba(6,3,4,' + a + ')';
              for (let y = 0; y < 270; y++) {
                const dy = y - cy, hw = Math.abs(dy) < rad ? Math.round(Math.sqrt(rad * rad - dy * dy)) : 0;
                if (!hw) { wc.fillRect(0, y, 480, 1); continue; }
                wc.fillRect(0, y, cx - hw, 1); wc.fillRect(cx + hw, y, 480 - cx - hw, 1);
              }
            }
            M.minimap(210, 96, { map: MAP2, sub: 'Phòng 5/8' });
          },
        },
      },
    ];
    const cx0 = 204, cw = 170, chh = 184, sc = 3, pw = cw * sc, ph = chh * sc, gap = 30, top = 110;
    const W = gap + panels.length * (pw + gap), H = top + ph + 190;
    const c = mk(W, H);
    c.fillStyle = BG; c.fillRect(0, 0, W, H);
    text(c, 'Kiểu A: ba trạng thái của cửa (cùng một góc phòng)', W / 2, 70, 46, { bold: true, align: 'center', color: ACC });
    panels.forEach((p, i) => {
      const cv = M.plainA('castle', p.o);
      const x = gap + i * (pw + gap);
      frame(c, x, top, pw, ph);
      c.imageSmoothingEnabled = false;
      c.drawImage(cv, cx0 * sc, 0, pw, ph, x, top, pw, ph);
      c.imageSmoothingEnabled = true;
      text(c, p.title, x + pw / 2, top + ph + 54, 32, { bold: true, align: 'center' });
      wrap(c, p.note, pw - 10, 26).forEach((l, j) => text(c, l, x + pw / 2, top + ph + 96 + j * 34, 26, { align: 'center', color: '#d9cdb8' }));
    });
    return c.canvas.toDataURL('image/png');
  };

  // ---------- Bảng so sánh ba kiểu ----------
  M.soSanh = function () {
    const items = [
      [M.cvA, 'Kiểu A', 'Phòng vuông, nhìn từ trên xuống', [
        ['Được', 'Thấy cả phòng và bốn cửa trong một màn hình, đi tám hướng thoải mái.'],
        ['Được', 'Bản đồ, thanh máu, nút bấm nằm gọn hai bên lề, không che trận đánh.'],
        ['Mất', 'Phòng không lấp đầy màn hình, hai bên là lề tối.'],
      ]],
      [M.cvB, 'Kiểu B', 'Giữ phòng nhìn ngang như bây giờ', [
        ['Được', 'Giữ nguyên cảnh đẹp đang có, chỉ thêm cửa bốn phía. Làm nhanh nhất.'],
        ['Mất', 'Phòng dài và dẹt chứ không vuông, đi lên đi xuống chỉ được một đoạn ngắn.'],
        ['Mất', 'Lối xuống nằm sát mép dưới, khó thấy. Nút bấm và bản đồ đè lên trận đánh.'],
      ]],
      [M.cvC, 'Kiểu C', 'Phòng rộng hơn màn hình', [
        ['Được', 'Nhân vật to gấp rưỡi, phòng rộng, màn hình chạy theo nhân vật.'],
        ['Mất', 'Không thấy hết phòng: quái và cửa có thể nằm ngoài màn hình.'],
        ['Mất', 'Nút bấm và bản đồ đè lên trận đánh. Tốn công làm nhất.'],
      ]],
    ];
    const W = 1500, pad = 30, iw = 1440, ih = 810, fs = 42, lh = 56;
    const tmp = mk(10, 10);
    // tính chiều cao trước
    const blocks = items.map((it) => {
      const lines = it[3].map((b) => wrap(tmp, b[1], iw - 190, fs));
      return { it, lines, h: 120 + ih + 30 + lines.reduce((a, l) => a + l.length * lh + 14, 0) + 50 };
    });
    const H = 130 + blocks.reduce((a, b) => a + b.h, 0);
    const c = mk(W, H);
    c.fillStyle = BG; c.fillRect(0, 0, W, H);
    text(c, 'Ba kiểu phòng để chọn', W / 2, 88, 64, { bold: true, align: 'center', color: ACC });
    let y = 130;
    for (const b of blocks) {
      const it = b.it;
      c.fillStyle = '#2a1e1c'; c.fillRect(0, y, W, 104);
      c.fillStyle = ACC; c.fillRect(0, y, 14, 104);
      text(c, it[1], pad + 10, y + 74, 68, { bold: true, color: ACC });
      c.font = '700 68px ' + FONT;
      const lw = c.measureText(it[1]).width;
      text(c, it[2], pad + 10 + lw + 28, y + 70, 40, { bold: true });
      y += 120;
      frame(c, pad, y, iw, ih);
      c.imageSmoothingEnabled = false;
      c.drawImage(it[0](), pad, y);
      c.imageSmoothingEnabled = true;
      y += ih + 30 + fs;
      b.lines.forEach((ls, i) => {
        const good = it[3][i][0] === 'Được';
        c.fillStyle = good ? '#3f8a3a' : '#a8382e';
        c.fillRect(pad, y - fs + 4, 138, fs + 10);
        text(c, it[3][i][0], pad + 69, y, fs - 4, { bold: true, align: 'center', color: '#fff' });
        ls.forEach((l, j) => text(c, l, pad + 160, y + j * lh, fs));
        y += ls.length * lh + 14;
      });
      y += 50 - fs;
    }
    return c.canvas.toDataURL('image/png');
  };
})();
