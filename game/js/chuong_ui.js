// Bảng CÂY CHƯỞNG (luật ở js/chuong.js): ba cây cạnh nhau (Hỏa, Độc, Băng), cây đang dùng sáng lên, nút "Dùng cây này",
// mỗi nút có tên, bậc; chạm một nút để xem mô tả, chạm lần nữa (hoặc nút Học) để học; điểm chưởng còn lại ở trên.
// Dùng ở hai chỗ: Cụ Đồ (thẻ Cây chưởng, js/village.js) và Hành trang (thẻ Kỹ năng, js/hanh_trang.js; trong ải chỉ xem).
// Chỉ đọc ngón tay qua G.click. Ghi bản lưu bằng G.chuong.learn / G.chuong.use rồi G.persist().
(function () {
  const G = window.G, ui = G.ui, T = G.theme, CH = G.chuong;
  if (!T || !CH) return;
  const C = G.CHUONG;
  const SOFT = '#a9c2b4', TXT = '#f1e6c6', GOLD = '#f6dc92', GOOD = '#9be07a', WARN = '#ff9a5a', LOCK = '#5f7a74';
  const U = (G.chuongUI = { sel: null, ask: null, boxes: {}, texts: [] });

  // Cắt chữ cho vừa bề rộng (thêm "…"), ghi lại để bài kiểm tra xem có chữ nào tràn không
  function fit(s, w, size, bold) {
    ui.font(Math.max(6.5, size), bold);
    const c = G.ux;
    if (c.measureText(s).width > w) {
      let lo = 0, hi = s.length;
      while (lo < hi) { const m = (lo + hi + 1) >> 1; if (c.measureText(s.slice(0, m) + '…').width <= w) lo = m; else hi = m - 1; }
      s = s.slice(0, lo).trimEnd() + '…';
    }
    return s;
  }
  function tx(s, x, y, w, o) {
    const t = fit(String(s), w, o.size || 8, o.bold);
    ui.font(Math.max(6.5, o.size || 8), o.bold);
    const mw = G.ux.measureText(t).width;
    U.texts.push({ s: t, w: mw, max: w });
    ui.text(t, x, y, o);
    return mw;
  }
  // Đoạn chữ nhiều dòng, tối đa n dòng (dòng cuối bị cắt thì thêm "…")
  function para(s, x, y, w, n, o) {
    const size = Math.max(6.5, o.size || 7), lines = ui.wrap(s, w, size, o.bold);
    if (lines.length > n) { lines.length = n; lines[n - 1] = lines[n - 1] + ' …'; }
    lines.forEach((l, i) => tx(l, x, y + i * (size + 2.5), w, o));
    return y + lines.length * (size + 2.5);
  }
  // Viên ngọc màu hệ nhỏ cạnh tên cây
  function orb(x, y, el, on) {
    const E = G.EL[el], c = G.ux;
    c.fillStyle = '#140d0e'; c.fillRect(x - 3, y - 4, 7, 8); c.fillRect(x - 4, y - 3, 9, 6);
    c.fillStyle = on ? E.col : '#55625e'; c.fillRect(x - 3, y - 3, 7, 6); c.fillRect(x - 2, y - 4, 5, 8);
    c.fillStyle = on ? E.col2 : '#7f8f8a'; c.fillRect(x - 2, y - 3, 2, 2);
  }

  // Vẽ bảng cây chưởng trong khung (X, Y, Wd, H). o.ro: chỉ xem (trong ải). Trả về câu ngắn cho người nói bên trái.
  U.tree = function (X, Y, Wd, H, o) {
    o = o || {};
    const sv = G.save, key = sv.hero, hs = sv.heroes[key], st = CH.state(hs, key), pt = CH.pts(hs, key);
    U.texts = []; U.boxes = {};
    if (!U.sel || U.sel.cay !== st.cay && !C.trees[U.sel.cay]) U.sel = null;
    // ---- dòng trên: điểm
    tx('Điểm chưởng: còn ' + pt.left, X + 2, Y + 8, 120, { size: 8.5, bold: true, color: pt.left > 0 ? GOOD : SOFT });
    tx('Cấp ' + hs.lvl + ': mỗi cấp +1 điểm · đã học ' + pt.spent + (o.ro ? ' · về làng để học' : ' · đổi cây miễn phí'), X + 112, Y + 8, Wd - 114, { size: 6.5, color: o.ro ? WARN : SOFT });
    // ---- ba cột cây
    const detailH = 31, top = Y + 13, colH = H - 13 - detailH - 2, cw = (Wd - 8) / 3;
    const titleH = 14, btnH = 15, rowH = Math.max(17, Math.floor((colH - titleH - btnH - 6) / 4));
    C.order.forEach((cay, i) => {
      const Tr = C.trees[cay], on = st.cay === cay, x = Math.round(X + i * (cw + 4)), w = Math.floor(cw), E = G.EL[Tr.el];
      T.inset(x, top, w, colH, on, on ? { col: E.col } : { fill: '#16302f' });
      if (on) { const c = G.ux; c.fillStyle = E.col; c.globalAlpha = 0.12; c.fillRect(x + 2, top + 2, w - 4, colH - 4); c.globalAlpha = 1; }
      orb(x + 8, top + 8, Tr.el, on);
      tx(Tr.name, x + 15, top + 11, w - 18, { size: 8, bold: true, color: on ? E.col2 : SOFT });
      const spentHere = on ? pt.spent : 0;
      CH.LAYOUT.forEach((row, ri) => {
        const ry = top + titleH + 2 + ri * rowH, bw = row.length === 2 ? Math.floor((w - 9) / 2) : w - 6;
        // đường nối giữa các hàng
        if (ri > 0) { const c = G.ux; c.fillStyle = on && spentHere >= Tr.nodes[row[0]].need ? E.col : '#2f4644'; c.fillRect(x + (w >> 1), ry - 3, 1, 3); }
        row.forEach((ni, k) => {
          const nd = Tr.nodes[ni], bx = x + 3 + k * (bw + 3), bh = rowH - 3, r = on ? st.n[nd.id] | 0 : 0;
          const open = on && spentHere >= nd.need, sel = U.sel && U.sel.cay === cay && U.sel.id === nd.id;
          const can = on && !o.ro && !CH.why(hs, nd.id, key);
          T.inset(bx, ry, bw, bh, sel, { fill: r > 0 ? '#3a3014' : open ? '#1f3f3e' : '#152524', col: sel ? null : r >= nd.max ? '#ffd23f' : can ? GOOD : open ? '#3f6a64' : '#22302f' });
          // hàng cao thì chấm bậc nằm dưới tên; hàng thấp (Hành trang) thì chấm bậc nằm bên phải tên
          const low = bh < 18, pw = nd.max * 5, px0 = low ? bx + bw - pw - 3 : bx + 3, py = low ? ry + Math.round(bh / 2) - 1 : ry + bh - 5;
          tx(nd.name, bx + 3, low ? ry + bh / 2 + 2.5 : ry + 8.5, low ? (open ? bw - pw - (can ? 16 : 8) : bw - 34) : bw - 6, { size: 6.5, bold: true, color: r > 0 ? GOLD : open ? TXT : LOCK });
          if (open) for (let j = 0; j < nd.max; j++) { const c = G.ux; c.fillStyle = j < r ? '#ffd23f' : open ? '#0d1716' : '#1a2423'; c.fillRect(px0 + j * 5, py, 4, 3); }
          if (!open && (on || nd.need > 0)) tx('cần ' + nd.need, bx + bw - 3, low ? ry + bh / 2 + 2.5 : ry + bh - 2, 26, { size: 6.5, align: 'right', color: LOCK });
          else if (can) tx('+', low ? px0 - 7 : bx + bw - 6, low ? ry + bh / 2 + 3 : ry + bh - 2, 8, { size: 8, bold: true, color: GOOD });
          U.boxes[cay + '/' + nd.id] = [bx, ry, bw, bh];
          if (G.click && G.inRect(G.click, bx - 1, ry - 1, bw + 2, bh + 2)) {
            G.click = null; G.sfx && G.sfx('ui');
            if (sel && can) learn(hs, nd, key);
            else { U.sel = { cay, id: nd.id }; U.ask = null; }
          }
        });
      });
      // nút dùng cây
      const by = top + colH - btnH - 3;
      if (on) { T.inset(x + 4, by, w - 8, btnH, false, { fill: '#2a2410', col: E.col }); tx('✓ Đang dùng', x + w / 2, by + 10.5, w - 12, { size: 7, bold: true, align: 'center', color: E.col2 }); }
      else if (o.ro) { tx('Về làng để đổi', x + w / 2, by + 10.5, w - 12, { size: 6.5, align: 'center', color: LOCK }); }
      else {
        const asking = U.ask === cay;
        const lab = asking ? 'Trả ' + pt.spent + ' điểm, đổi?' : 'Dùng cây này';
        U.boxes['use/' + cay] = [x + 4, by, w - 8, btnH];
        if (T.sbtn(x + 4, by, w - 8, btnH, fit(lab, w - 14, 7, true), { size: 7, pad: 1, primary: asking })) {
          if (pt.spent > 0 && !asking) U.ask = cay;
          else {
            CH.use(hs, cay, key); U.ask = null; U.sel = null; G.persist(); G.sfx && G.sfx('evolve');
            if (G.villageApi && G.villageApi.say) G.villageApi.say('Đổi sang ' + Tr.name + '. Điểm đã trả lại hết, con học lại nhé.');
            if (G.villageScene) G.villageScene.checkNews();
          }
        }
      }
    });
    // ---- dòng mô tả nút đang chọn (không chọn thì nút kế tiếp nên học của cây đang dùng)
    let sel = U.sel;
    if (!sel) { const nx = C.trees[st.cay].nodes.find((n) => !CH.why(hs, n.id, key)) || C.trees[st.cay].nodes[0]; sel = { cay: st.cay, id: nx.id }; }
    const Tr = C.trees[sel.cay], nd = CH.node(sel.cay, sel.id), on = sel.cay === st.cay, r = on ? st.n[nd.id] | 0 : 0;
    const dy = Y + H - detailH;
    T.inset(X, dy, Wd, detailH, false, { fill: '#10201f' });
    const can = on && !o.ro && !CH.why(hs, nd.id, key), bw = 54;
    tx(nd.name + ' ' + r + '/' + nd.max + ' · ' + Tr.name, X + 4, dy + 9, Wd - bw - 12, { size: 7.5, bold: true, color: G.EL[Tr.el].col2 });
    const why = !on ? 'Dùng ' + Tr.name + ' trước mới học được' : CH.why(hs, nd.id, key);
    const line = (r >= nd.max ? 'Đã đủ bậc: ' + nd.desc(r) : r > 0 ? 'Bậc ' + (r + 1) + ': ' + nd.desc(r + 1) : nd.d1) + (why && why !== 'Đã đủ bậc' ? ' (' + why + ')' : '');
    para(line, X + 4, dy + 18, Wd - bw - 12, 2, { size: 6.5, color: why && why !== 'Đã đủ bậc' ? SOFT : TXT });
    if (!o.ro) {
      U.boxes.learn = [X + Wd - bw - 4, dy + 4, bw, 18];
      if (T.sbtn(X + Wd - bw - 4, dy + 4, bw, 18, 'Học', { size: 8, pad: 2, primary: can, disabled: !can })) learn(hs, nd, key);
    }
    return pt.left > 0 ? 'Con còn ' + pt.left + ' điểm chưởng. Chạm một nút để xem, chạm lần nữa để học.' : 'Chưởng là linh khí trong lòng bàn tay. Lên cấp, lão dạy thêm.';
  };
  function learn(hs, nd, key) {
    if (!CH.learn(hs, nd.id, key)) return;
    G.persist(); G.sfx && G.sfx('evolve');
    U.sel = { cay: hs.ch.cay, id: nd.id };
    if (G.villageScene) G.villageScene.checkNews();
  }
  // Toạ độ giữa của một nút trên bảng vừa vẽ (cho bài kiểm tra chạm thật)
  U.nodeXY = function (cay, id) { const b = U.boxes[cay + '/' + id]; return b ? [b[0] + b[2] / 2, b[1] + b[3] / 2] : null; };
  U.boxXY = function (k) { const b = U.boxes[k]; return b ? [b[0] + b[2] / 2, b[1] + b[3] / 2] : null; };
})();
