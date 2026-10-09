// Sửa góp ý 2: cổng dịch chuyển mọc lên trong phòng trùm sau khi thắng, và đồ rơi nằm trên sàn để nhặt.
// Chỉ có phần hình vẽ; luật (khi nào cổng mọc, vào cổng thì hiện bảng kết quả) nằm ở js/stage.js.
// Màu lấy theo bộ giao diện trống đồng (G.theme.C): vành đồng, hoa văn vàng, xoáy xanh ngọc.
(function () {
  const G = window.G, A = G.art;
  const old = A.prop;
  const C = () => (G.theme && G.theme.C) || { br: '#a8752f', brD: '#5a3d1a', gold: '#d9a441', hi: '#f6dc92', pat: '#3f8f7f', patL: '#6fc1a8', patD: '#1f4f4a', dk: '#1a120a' };
  let c = null;
  const px = (x, y, col, w, h) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w || 1, h || 1); };
  const RY = 0.55; // cổng nằm trên sàn nhìn từ trên xuống: hình bầu dục dẹt
  function ring(cx, cy, r, col, step, w) {
    const n = Math.max(12, Math.round(r * 6.3 / (step || 1)));
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; px(cx + Math.cos(a) * r, cy + Math.sin(a) * r * RY, col, w || 1, w || 1); }
  }
  function hash(i) { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }

  function portal(o) {
    const K = C(), t = G.time, age = Math.max(0, t - (o.born || 0));
    const k = Math.min(1, age / 0.9), e = 1 - Math.pow(1 - k, 3); // mọc lên trong 0,9 giây
    const x = Math.round(o.x), y = Math.round(o.y), R = 24 * e;
    if (R < 1) return;
    // bóng và nền tối của lòng cổng
    c.fillStyle = 'rgba(8,24,24,0.55)';
    c.beginPath(); c.ellipse(x, y, R + 2, (R + 2) * RY, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = K.patD;
    if (R > 2) { c.beginPath(); c.ellipse(x, y, R - 2, (R - 2) * RY, 0, 0, Math.PI * 2); c.fill(); } // lúc cổng vừa nhú (bán kính dưới 2) thì bỏ qua lòng cổng
    // xoáy xanh ngọc: ba cánh xoắn quay quanh tâm
    for (let arm = 0; arm < 3; arm++) {
      for (let j = 0; j < 16; j++) {
        const u = j / 16, a = t * 2.6 + arm * 2.094 + u * 4.2, r = (R - 3) * (1 - u * 0.85);
        px(x + Math.cos(a) * r, y + Math.sin(a) * r * RY, u < 0.4 ? K.pat : u < 0.8 ? K.patL : '#d8fff2', u > 0.6 ? 2 : 1, 1);
      }
    }
    // tâm sáng nhấp nháy
    const pulse = 0.6 + 0.4 * Math.sin(t * 5);
    c.fillStyle = 'rgba(216,255,242,' + (0.5 * pulse).toFixed(2) + ')';
    c.beginPath(); c.ellipse(x, y, 5 * e, 3 * e, 0, 0, Math.PI * 2); c.fill();
    px(x - 1, y - 1, '#ffffff', 2, 2);
    // vành đồng hai lớp, hoa văn vàng (như vành mặt trống) quay chậm
    ring(x, y, R + 1, K.dk, 1, 1);
    ring(x, y, R, K.br, 1, 2);
    ring(x, y, R - 1, K.gold, 2, 1);
    for (let i = 0; i < 10; i++) { const a = t * 0.6 + (i / 10) * Math.PI * 2; px(x + Math.cos(a) * (R + 0.5) - 1, y + Math.sin(a) * (R + 0.5) * RY - 1, K.hi, 2, 2); }
    // cột sáng mờ và đốm sáng bay lên
    if (e > 0.5) {
      c.fillStyle = 'rgba(111,193,168,0.10)'; c.fillRect(x - Math.round(R * 0.6), y - 34, Math.round(R * 1.2), 34);
      for (let i = 0; i < 9; i++) {
        const ph = (t * 0.55 + hash(i)) % 1, a = hash(i + 7) * Math.PI * 2, rr = (R - 4) * hash(i + 3);
        px(x + Math.cos(a) * rr, y + Math.sin(a) * rr * RY - ph * 36, ph < 0.5 ? K.patL : ph < 0.8 ? K.hi : 'rgba(246,220,146,0.5)', ph < 0.3 ? 2 : 1, ph < 0.3 ? 2 : 1);
      }
    }
    // hiệu ứng xuất hiện: vòng sáng toả ra và tia sáng
    if (age < 1.1) {
      const q = age / 1.1;
      c.globalAlpha = 1 - q;
      ring(x, y, 8 + 44 * q, '#ffffff', 1, 2);
      ring(x, y, 4 + 30 * q, K.patL, 1, 1);
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2, r = 10 + 40 * q; px(x + Math.cos(a) * r, y + Math.sin(a) * r * RY - 20 * q, i % 2 ? K.hi : '#ffffff', 2, 2); }
      c.globalAlpha = 1;
    }
  }

  // đồ rơi: biểu tượng tài nguyên (bộ hình của G.theme.RES) hoặc hình vũ khí, nảy nhẹ trên sàn
  function loot(o) {
    const t = G.time, age = t - (o.born || 0);
    if (age < 0) return;
    let x = o.x, y = o.y, lift = 0;
    if (age < 0.5) { const q = age / 0.5; x = o.sx + (o.x - o.sx) * q; y = o.sy + (o.y - o.sy) * q; lift = Math.sin(q * Math.PI) * 18; }
    else lift = 2 + Math.sin(t * 4 + o.x) * 1.5;
    if (o.got) { const q = Math.min(1, (t - o.got) / 0.9); lift += q * 22; c.globalAlpha = 1 - q; }
    c.fillStyle = 'rgba(0,0,0,0.3)'; c.beginPath(); c.ellipse(Math.round(x), Math.round(y), 5, 2, 0, 0, Math.PI * 2); c.fill();
    const iy = Math.round(y - 8 - lift), ix = Math.round(x);
    if (o.kind === 'outfit' && o.o && G.outfit && G.outfit.drawIcon) {
      const col = G.RARITY[o.o.r].col;
      c.fillStyle = col; c.globalAlpha *= 0.35 + 0.15 * Math.sin(t * 6); c.fillRect(ix - 7, iy - 7, 14, 14); c.globalAlpha = o.got ? 1 - Math.min(1, (t - o.got) / 0.9) : 1;
      G.outfit.drawIcon(c, o.o, ix, iy, 14);
    } else if (o.kind === 'weapon' && o.w && A.weaponIcon) {
      c.fillStyle = 'rgba(255,240,180,' + (0.25 + 0.15 * Math.sin(t * 6)).toFixed(2) + ')'; c.fillRect(ix - 7, iy - 7, 14, 14);
      A.weaponIcon(c, o.w, ix, iy, 13);
    } else {
      const d = G.theme && G.theme.RES && G.theme.RES[o.kind];
      if (d) {
        px(ix - 5, iy - 5, 'rgba(26,18,10,0.6)', 11, 11);
        for (let j = 0; j < 7; j++) for (let i = 0; i < 7; i++) { const ch = d.rows[j][i]; if (ch !== '.' && d.pal[ch]) px(ix - 3.5 + i, iy - 3.5 + j, d.pal[ch]); }
        if (Math.floor(t * 3 + o.x) % 4 === 0) px(ix + 2, iy - 4, '#ffffff');
      }
    }
    if (o.got && o.s && G.ui) {
      const W = G.getWorld();
      G.ui.text(o.s, x - ((W && W.cam) || 0), iy - 8, { size: 7, align: 'center', bold: true, color: '#fff3b0' });
    }
    c.globalAlpha = 1;
  }

  A.prop = function (cx, o) {
    if (o && (o.type === 'portal' || o.type === 'loot')) {
      const pv = c; c = cx;
      try { if (o.type === 'portal') portal(o); else loot(o); } catch (e) { if (!A.portalErr) { A.portalErr = e; if (window.console) console.warn('portal', e); } }
      finally { c = pv; cx.globalAlpha = 1; }
      return;
    }
    return old.apply(this, arguments);
  };
})();
