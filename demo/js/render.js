// DEMO "Thủ thành ghép tướng" — ảnh + vẽ canvas (sân, đường, tướng, quái, đạn, hiệu ứng)
'use strict';
(function () {
  const C = CAU_HINH, G = GAME;
  // ---- ảnh: ưu tiên ảnh mới người dùng thả vào demo/assets/, không có thì dùng ảnh pixel tạm của game chính ----
  const ANH = {};
  function nap(key, moi, tam) {
    const a = { img: null, ok: false, moi: false, n: 1 };
    ANH[key] = a;
    const thu = (src, laMoi, sau) => {
      const im = new Image();
      im.onload = () => { a.img = im; a.ok = true; a.moi = laMoi; a.n = laMoi ? 1 : Math.max(1, Math.round(im.width / im.height)); if (/^(nen|o|thanh|hang)$/.test(key)) ve.batLai = true; };
      im.onerror = () => { if (sau) sau(); };
      im.src = src;
    };
    if (moi) thu(moi, true, tam ? () => thu(tam, false) : null); else if (tam) thu(tam, false);
    return a;
  }
  const TAM = '../assets/pixel-muot/';
  for (const id of TUONG_IDS) nap('t:' + id, `assets/tuong/${id}.png`, TAM + TUONG[id].anh);
  for (const k in QUAI) nap('q:' + k, `assets/quai/${k}.png`, TAM + QUAI[k].anh);
  for (const b of BOSS) nap('b:' + b.id, `assets/quai/boss-${b.id}.png`, TAM + b.anh);
  nap('nen', 'assets/nen/san.png', null);
  nap('o', 'assets/nen/o-dat.png', null);
  nap('thanh', 'assets/nen/thanh.png', null);
  nap('hang', 'assets/nen/hang-quai.png', null);

  // vẽ ảnh nhân vật vào hộp (x, y, w, h), chân chạm đáy hộp; khung f (ảnh tạm là dải khung)
  function veAnh(ctx, a, x, y, w, h, f = 0, lat = false) {
    if (!a || !a.ok) return false;
    const im = a.img;
    let sx = 0, sw = im.width, sh = im.height;
    if (!a.moi) { sw = im.height; sx = (f % a.n) * sw; }
    const k = Math.min(w / sw, h / sh), dw = sw * k, dh = sh * k;
    ctx.save();
    ctx.imageSmoothingEnabled = !!a.moi && sw > 200;
    if (lat) { ctx.translate(x + w / 2, 0); ctx.scale(-1, 1); ctx.translate(-(x + w / 2), 0); }
    ctx.drawImage(im, sx, 0, sw, sh, x + (w - dw) / 2, y + h - dh, dw, dh);
    ctx.restore();
    return true;
  }

  // ---- nền vẽ sẵn (cỏ, đường đất, bệ sân) ----
  let nenCv = null, nenK = 0;
  let seed = 7;
  const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  function veNen(k) {
    const cv = document.createElement('canvas');
    cv.width = Math.round(C.W * k); cv.height = Math.round(C.H * k);
    const c = cv.getContext('2d');
    c.scale(k, k);
    seed = 7;
    if (ANH.nen.ok) c.drawImage(ANH.nen.img, 0, 0, C.W, C.H);
    else {
      const g = c.createLinearGradient(0, 0, 0, C.H);
      g.addColorStop(0, '#1d2a1a'); g.addColorStop(1, '#14200f');
      c.fillStyle = g; c.fillRect(0, 0, C.W, C.H);
      const co = ['#25361f', '#2b3f22', '#1a2716', '#33482a'];
      for (let i = 0; i < 1400; i++) { c.fillStyle = co[(r() * 4) | 0]; c.fillRect((r() * C.W) | 0, (r() * C.H) | 0, 2, 2); }
      // bụi cây / đá trang trí hai bên
      for (let i = 0; i < 16; i++) {
        const x = r() < 0.5 ? 14 + r() * 180 : 650 + r() * 180, y = 70 + r() * 180;
        if (r() < 0.6) { c.fillStyle = '#1e3a18'; c.fillRect(x - 9, y - 6, 18, 10); c.fillStyle = '#2f5a24'; c.fillRect(x - 7, y - 9, 14, 8); c.fillStyle = '#41762f'; c.fillRect(x - 4, y - 10, 6, 3); }
        else { c.fillStyle = '#4a4538'; c.fillRect(x - 6, y - 4, 12, 7); c.fillStyle = '#6b6450'; c.fillRect(x - 5, y - 5, 7, 3); }
      }
    }
    {   // đường đất (luôn vẽ theo toạ độ đường quái, kể cả khi có ảnh nền mới)
      const P = G.DUONG;
      const dat = (w, mau) => { c.fillStyle = mau; for (let i = 1; i < P.length; i++) { const [x0, y0] = P[i - 1], [x1, y1] = P[i]; c.fillRect(Math.min(x0, x1) - w / 2, Math.min(y0, y1) - w / 2, Math.abs(x1 - x0) + w, Math.abs(y1 - y0) + w); } };
      dat(34, '#3a2a17'); dat(28, '#6e5232'); dat(20, '#7c5e3a');
      for (let i = 1; i < P.length; i++) {
        const [x0, y0] = P[i - 1], [x1, y1] = P[i], d = Math.hypot(x1 - x0, y1 - y0);
        for (let s = 0; s < d; s += 9) { const k2 = s / d; c.fillStyle = r() < 0.5 ? '#8d6c44' : '#5f4529'; c.fillRect(x0 + (x1 - x0) * k2 + (r() - 0.5) * 18, y0 + (y1 - y0) * k2 + (r() - 0.5) * 18, 2, 2); }
      }
    }
    // bệ sân đá
    const bx = G.OX - 8, by = G.OY - 8, bw = G.SW + 16, bh = G.SH + 16;
    c.fillStyle = '#17120c'; c.fillRect(bx - 2, by - 2, bw + 4, bh + 4);
    c.fillStyle = '#4a3f30'; c.fillRect(bx, by, bw, bh);
    c.fillStyle = '#5c4f3b'; c.fillRect(bx, by, bw, 3);
    c.fillStyle = '#2e271d'; c.fillRect(bx, by + bh - 3, bw, 3);
    // hoa văn răng cưa trống đồng quanh mép bệ
    c.fillStyle = '#6d5d43';
    for (let x = bx + 4; x < bx + bw - 4; x += 8) { c.fillRect(x, by + 3, 4, 2); c.fillRect(x + 2, by + bh - 6, 4, 2); }
    for (let i = 0; i < C.COT * C.HANG; i++) {
      const [x, y] = G.oXY(i);
      if (ANH.o.ok) c.drawImage(ANH.o.img, x, y, C.O, C.O);
      else {
        c.fillStyle = '#1c1711'; c.fillRect(x, y, C.O, C.O);
        c.fillStyle = '#2a231a'; c.fillRect(x + 2, y + 2, C.O - 4, C.O - 4);
        c.fillStyle = '#332a1f'; c.fillRect(x + 2, y + 2, C.O - 4, 2);
        c.fillStyle = '#3b3124'; c.fillRect(x + C.O / 2 - 6, y + C.O / 2 - 1, 12, 2); c.fillRect(x + C.O / 2 - 1, y + C.O / 2 - 6, 2, 12);
      }
    }
    // hang quái (trái) + Thành (phải)
    const yb = G.BOT;
    if (ANH.hang.ok) c.drawImage(ANH.hang.img, -6, yb - 52, 64, 64);
    else {
      c.fillStyle = '#2a2620'; c.fillRect(0, yb - 34, 34, 50);
      c.fillStyle = '#3f3a30'; c.fillRect(0, yb - 38, 30, 6); c.fillRect(26, yb - 34, 8, 46);
      c.fillStyle = '#07060a'; c.fillRect(0, yb - 24, 24, 38);
      c.fillStyle = '#5a1f1f'; c.fillRect(6, yb - 16, 3, 3); c.fillRect(14, yb - 16, 3, 3);
    }
    if (ANH.thanh.ok) c.drawImage(ANH.thanh.img, C.W - 74, yb - 74, 74, 90);
    else {
      const x = C.W - 60;
      c.fillStyle = '#3b2a1a'; c.fillRect(x - 2, yb - 58, 64, 76);
      c.fillStyle = '#8a6a48'; c.fillRect(x, yb - 52, 60, 68);
      c.fillStyle = '#a3825a'; for (let yy = yb - 50; yy < yb + 14; yy += 8) for (let xx = x + ((yy / 8) % 2 ? 0 : 6); xx < x + 58; xx += 12) c.fillRect(xx, yy, 10, 5);
      c.fillStyle = '#8a6a48'; for (let xx = x; xx < x + 60; xx += 12) c.fillRect(xx, yb - 60, 7, 8);
      c.fillStyle = '#5c1d14'; c.fillRect(x + 8, yb - 76, 44, 14); c.fillStyle = '#7a2a1c'; c.fillRect(x + 4, yb - 66, 52, 6);
      c.fillStyle = '#120c08'; c.fillRect(x + 18, yb - 22, 24, 38); c.fillRect(x + 21, yb - 26, 18, 4);
      c.fillStyle = '#c9a64a'; c.fillRect(x + 26, yb - 72, 8, 6);
    }
    return cv;
  }

  const SAO_MAU = ['#ffe27a', '#ffe27a', '#ffe27a', '#ffb347', '#ffb347', '#ff6b8b', '#d88bff'];
  function veSao(c, x, y, mau, r = 5) {   // sao 5 cánh tâm (x, y)
    c.beginPath();
    for (let k = 0; k < 10; k++) { const g = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.45 : r; c.lineTo(x + Math.cos(g) * rr, y + Math.sin(g) * rr); }
    c.closePath();
    c.lineWidth = 2; c.strokeStyle = '#1a0c02'; c.stroke();
    c.fillStyle = mau; c.fill();
  }
  function veTuong(c, v, x, y, now, tieuDiem) {
    const td = TUONG[v.id], h = HANH[td.hanh];
    const s = v.moi > 0 ? 1 + Math.sin((v.moi / 0.5) * Math.PI) * 0.18 : 1;
    // nền màu hành
    c.fillStyle = h.toi; c.fillRect(x + 2, y + 2, C.O - 4, C.O - 4);
    c.fillStyle = h.mau; c.globalAlpha = 0.22; c.fillRect(x + 4, y + 4, C.O - 8, C.O - 8); c.globalAlpha = 1;
    c.strokeStyle = tieuDiem ? '#fff3b0' : h.mau; c.lineWidth = tieuDiem ? 3 : 2;
    c.strokeRect(x + 2, y + 2, C.O - 4, C.O - 4);
    const a = ANH['t:' + v.id];
    let f = Math.floor(now * 1.6 + v.uid) % 2;
    if (v.danh > 0 && !v.da) f = 2 + Math.min(2, Math.floor((0.3 - v.danh) / 0.1));
    c.save();
    c.translate(x + C.O / 2, y + C.O - 6); c.scale(s, s); c.translate(-(x + C.O / 2), -(y + C.O - 6));
    if (!veAnh(c, a, x + 5, y + 2, C.O - 10, C.O - 12, f)) {
      c.fillStyle = h.mau; c.font = 'bold 22px "Alegreya SC", serif'; c.textAlign = 'center'; c.fillText(td.ten[0], x + C.O / 2, y + 38);
    }
    c.restore();
    if (v.da > 0) {   // hoá đá
      c.fillStyle = 'rgba(120,118,112,0.82)'; c.fillRect(x + 2, y + 2, C.O - 4, C.O - 4);
      c.strokeStyle = '#3d3b37'; c.lineWidth = 2; c.beginPath();
      c.moveTo(x + 14, y + 8); c.lineTo(x + 24, y + 26); c.lineTo(x + 18, y + 40); c.moveTo(x + 46, y + 12); c.lineTo(x + 38, y + 30); c.lineTo(x + 48, y + 44); c.stroke();
      c.fillStyle = '#e8e4da'; c.font = 'bold 11px "Alegreya Sans", sans-serif'; c.textAlign = 'center'; c.fillText(Math.ceil(v.da) + 's', x + C.O / 2, y + 22);
    }
    // sao: hàng sao to dưới chân tướng (≥ 5 sao xếp sát hơn)
    const n = v.sao, bu = n >= 5 ? 8 : 10, w = (n - 1) * bu;
    c.fillStyle = 'rgba(10,6,3,0.78)'; c.fillRect(x + C.O / 2 - w / 2 - 8, y + C.O - 15, w + 16, 13);
    for (let k = 0; k < n; k++) veSao(c, x + C.O / 2 - w / 2 + k * bu, y + C.O - 8.5, SAO_MAU[n - 1], 5.2);
    // hạt hành góc trên trái
    c.fillStyle = '#120c06'; c.fillRect(x + 4, y + 4, 9, 9); c.fillStyle = h.mau; c.fillRect(x + 5, y + 5, 7, 7);
  }
  function veQuai(c, q, now) {
    const a = q.boss ? ANH['b:' + q.boss.id] : ANH['q:' + q.kind];
    const w = q.co, x = q.x - w / 2, yChan = q.y + 9 - (a && a.moi ? Math.abs(Math.sin(q.khung * 0.9)) * 3 : 0);
    c.fillStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); c.ellipse(q.x, yChan - 1, w * 0.36, 4, 0, 0, Math.PI * 2); c.fill();
    const f = Math.floor(q.khung) % 4;
    if (!veAnh(c, a, x, yChan - w, w, w, f)) { c.fillStyle = q.boss ? '#a33' : '#c75'; c.fillRect(x + 6, yChan - w + 6, w - 12, w - 8); }
    if (q.cham > 0) { c.fillStyle = 'rgba(80,170,255,0.28)'; c.fillRect(x + 4, yChan - w * 0.8, w - 8, w * 0.8); }
    if (q.chayT > 0) { for (let k = 0; k < 3; k++) { const t = (now * 3 + k / 3) % 1; c.fillStyle = k % 2 ? '#ffb347' : '#ff5a2a'; c.fillRect(q.x - 8 + k * 7, yChan - w * 0.4 - t * 16, 3, 4); } }
    if (q.choang > 0) { for (let k = 0; k < 3; k++) { const g = now * 6 + k * 2.1; veSao(c, q.x + Math.cos(g) * 12, yChan - w - 2 + Math.sin(g) * 3, '#fff3a0', 3.5); } }
    if (!q.boss) {
      const bw = Math.max(22, w * 0.7), by = yChan - w - 5;
      c.fillStyle = '#120a06'; c.fillRect(q.x - bw / 2 - 1, by - 1, bw + 2, 5);
      c.fillStyle = q.hp / q.max > 0.4 ? '#6ee05a' : '#ff6a4a'; c.fillRect(q.x - bw / 2, by, bw * Math.max(0, q.hp / q.max), 3);
    }
  }
  function veDan(c, d, now) {
    c.save(); c.translate(d.x, d.y);
    if (d.id === 'mychau') { c.rotate(d.goc || 0); c.fillStyle = '#5a3a1a'; c.fillRect(-10, -1, 14, 2); c.fillStyle = '#ffe27a'; c.fillRect(4, -2, 4, 4); c.fillStyle = '#f4f0e0'; c.fillRect(-12, -2, 3, 4); }
    else if (d.id === 'thachsanh') { c.rotate(now * 18); c.fillStyle = '#7a5530'; c.fillRect(-1, -7, 2, 14); c.fillStyle = '#d8d8d8'; c.fillRect(1, -7, 6, 6); c.fillStyle = '#ffffff'; c.fillRect(5, -7, 2, 6); }
    else if (d.id === 'sontinh') { c.rotate(now * 8); c.fillStyle = '#3d2f20'; c.fillRect(-5, -5, 10, 10); c.fillStyle = '#9a7a52'; c.fillRect(-4, -4, 8, 8); c.fillStyle = '#c9a274'; c.fillRect(-3, -3, 3, 3); }
    else if (d.id === 'giong') { for (let k = 1; k <= 3; k++) { c.globalAlpha = 0.5 / k; c.fillStyle = '#ff7a2a'; c.fillRect(-Math.cos(d.goc || 0) * k * 6 - 3, -Math.sin(d.goc || 0) * k * 6 - 3, 6, 6); } c.globalAlpha = 1; c.fillStyle = '#ff5a1f'; c.fillRect(-5, -5, 10, 10); c.fillStyle = '#ffd36a'; c.fillRect(-3, -3, 6, 6); }
    else if (d.id === 'cdt') { c.fillStyle = '#7a5a10'; c.fillRect(-5, -5, 10, 10); c.fillStyle = '#ffd84a'; c.fillRect(-4, -4, 8, 8); c.fillStyle = '#7a5a10'; c.fillRect(-1, -2, 2, 4); }
    else if (d.id === 'auco') { c.rotate(d.goc || 0); c.fillStyle = '#e8f4d8'; c.fillRect(-7, -2, 12, 4); c.fillStyle = '#6cc24a'; c.fillRect(-7, -1, 12, 2); }
    else { c.fillStyle = '#1d4f7a'; c.beginPath(); c.arc(0, 0, 6, 0, 7); c.fill(); c.fillStyle = d.mau; c.beginPath(); c.arc(0, 0, 4.5, 0, 7); c.fill(); c.fillStyle = '#e8f8ff'; c.fillRect(-2, -3, 2, 2); }
    c.restore();
  }
  function veFx(c, f, now) {
    const k = f.t / f.T, o = f.i != null ? G.oTam(f.i) : [f.x, f.y];
    c.save();
    c.globalAlpha = Math.max(0, 1 - k);
    if (f.k === 'trieu') { c.fillStyle = '#fff3b0'; const w = 50 * (1 - k * 0.6); c.fillRect(o[0] - w / 2, o[1] - 40, w, 70); }
    else if (f.k === 'gop') {
      c.strokeStyle = '#ffe27a'; c.lineWidth = 4; c.beginPath(); c.arc(o[0], o[1], 10 + 40 * k, 0, 7); c.stroke();
      for (let n = 0; n < 8; n++) { const g = n * Math.PI / 4; c.fillStyle = n % 2 ? '#fff' : '#ffb347'; c.fillRect(o[0] + Math.cos(g) * 46 * k - 2, o[1] + Math.sin(g) * 46 * k - 2, 4, 4); }
      c.fillStyle = '#fff6c0'; c.font = 'bold 18px "Alegreya SC", serif'; c.textAlign = 'center'; c.strokeStyle = '#3a1a00'; c.lineWidth = 4;
      c.strokeText(f.sao + '★', o[0], o[1] - 30 - k * 12); c.fillText(f.sao + '★', o[0], o[1] - 30 - k * 12);
    }
    else if (f.k === 'bac') { for (let n = 0; n < 4; n++) { c.fillStyle = '#9fff7a'; c.fillRect(o[0] - 18 + n * 12, o[1] + 10 - k * 40 - (n % 2) * 8, 4, 8); } }
    else if (f.k === 'no') { for (let n = 0; n < 8; n++) { const g = n * 0.785 + 0.3; c.fillStyle = n % 2 ? '#ffd36a' : '#fff'; c.fillRect(o[0] + Math.cos(g) * f.r * k * 1.4 - 2, o[1] + Math.sin(g) * f.r * k * 1.4 - 2, 4, 4); } }
    else if (f.k === 'set') { c.strokeStyle = '#e8f8ff'; c.lineWidth = 3; c.beginPath(); f.pts.forEach((p, n) => { const j = n ? (Math.random() - 0.5) * 6 : 0; n ? c.lineTo(p[0] + j, p[1] + j) : c.moveTo(p[0], p[1]); }); c.stroke(); c.strokeStyle = f.mau; c.lineWidth = 1.5; c.stroke(); }
    else if (f.k === 'song') { c.strokeStyle = '#8fd4ff'; c.lineWidth = 3; c.beginPath(); c.ellipse(o[0], o[1], 46 * k + 6, (46 * k + 6) * 0.5, 0, 0, 7); c.stroke(); }
    else if (f.k === 'hoada') { c.fillStyle = '#d8d4c8'; for (let n = 0; n < 6; n++) c.fillRect(o[0] - 26 + n * 10, o[1] - 20 - k * 20 + (n % 2) * 10, 6, 6); }
    else if (f.k === 'xoay') { c.strokeStyle = '#6fc6ff'; c.lineWidth = 3; c.beginPath(); c.arc(o[0], o[1], 28, k * 9, k * 9 + 4); c.stroke(); }
    else if (f.k === 'hoi') { c.strokeStyle = '#7dff8a'; c.lineWidth = 3; c.beginPath(); c.arc(o[0], o[1], 20 + 140 * k, 0, 7); c.stroke(); }
    else if (f.k === 'thanh') { c.fillStyle = '#ff2a2a'; c.globalAlpha = 0.45 * (1 - k); c.fillRect(C.W - 70, G.BOT - 80, 70, 100); }
    c.restore();
  }
  function veSo(c, s) {
    const k = s.t / 0.9;
    c.save(); c.globalAlpha = Math.min(1, 2.2 * (1 - k));
    c.font = `bold ${s.to ? 15 : 12}px "Alegreya Sans", sans-serif`; c.textAlign = 'center';
    c.lineWidth = 3; c.strokeStyle = '#140a04';
    const y = s.y - k * 22;
    c.strokeText(s.v, s.x, y); c.fillStyle = s.mau || '#fff'; c.fillText(s.v, s.x, y);
    c.restore();
  }

  // vẽ cả khung; keo = { i, x, y } khi đang kéo tướng
  function ve(c, S, now, k, keo) {
    if (!nenCv || nenK !== k || ve.batLai) { nenCv = veNen(k); nenK = k; ve.batLai = false; }
    c.drawImage(nenCv, 0, 0, C.W, C.H);
    if (!S) return;
    const goi = keo ? S.o[keo.i] : null;
    for (let i = 0; i < S.o.length; i++) {
      const v = S.o[i], [x, y] = G.oXY(i);
      if (!v) continue;
      if (keo && keo.i === i) { c.globalAlpha = 0.3; veTuong(c, v, x, y, now); c.globalAlpha = 1; continue; }
      const hop = goi && G.gopDuoc(S, keo.i, i);
      veTuong(c, v, x, y, now, hop);
      if (goi && !hop) { c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(x + 2, y + 2, C.O - 4, C.O - 4); }
      if (hop) { c.strokeStyle = `rgba(255,243,176,${0.5 + 0.5 * Math.sin(now * 10)})`; c.lineWidth = 3; c.strokeRect(x - 1, y - 1, C.O + 2, C.O + 2); }
    }
    const qs = S.quai.slice().sort((a, b) => a.y - b.y);
    for (const q of qs) veQuai(c, q, now);
    for (const d of S.dan) veDan(c, d, now);
    for (const f of S.fx) veFx(c, f, now);
    if (goi) { c.save(); c.globalAlpha = 0.92; veTuong(c, goi, keo.x - C.O / 2, keo.y - C.O / 2 - 6, now, true); c.restore(); }
    for (const s of S.so) veSo(c, s);
    // thanh máu boss
    if (S.boss) {
      const b = S.boss, w = 260, x = C.W / 2 - w / 2, y = 6;
      c.fillStyle = '#120a06'; c.fillRect(x - 2, y - 2, w + 4, 12);
      c.fillStyle = '#5a1010'; c.fillRect(x, y, w, 8);
      c.fillStyle = '#e8402a'; c.fillRect(x, y, w * Math.max(0, b.hp / b.max), 8);
      c.fillStyle = '#ffb090'; c.fillRect(x, y, w * Math.max(0, b.hp / b.max), 2);
      c.font = 'bold 11px "Alegreya Sans", sans-serif'; c.textAlign = 'center'; c.lineWidth = 3; c.strokeStyle = '#120a06';
      const t = `${b.boss.ten} · ${b.boss.knTen} · ${Math.ceil(b.hp)}`;
      c.strokeText(t, C.W / 2, y + 20); c.fillStyle = '#ffd9c0'; c.fillText(t, C.W / 2, y + 20);
    }
    // băng rôn đầu đợt
    if (S.bao) {
      const b = S.bao, a = Math.min(1, b.t * 4, (b.T - b.t) * 3), cy = G.OY + G.SH / 2;
      c.save(); c.globalAlpha = Math.max(0, a);
      const h = b.phu ? 54 : 36;
      c.fillStyle = 'rgba(20,10,4,0.86)'; c.fillRect(G.OX - 30, cy - h / 2, G.SW + 60, h);
      c.fillStyle = '#c9a64a'; c.fillRect(G.OX - 30, cy - h / 2, G.SW + 60, 2); c.fillRect(G.OX - 30, cy + h / 2 - 2, G.SW + 60, 2);
      c.textAlign = 'center'; c.fillStyle = '#ffe27a'; c.font = 'bold 22px "Alegreya SC", serif';
      c.fillText(b.chu, C.W / 2, cy + (b.phu ? -2 : 8));
      if (b.phu) { c.fillStyle = '#f0d8c0'; c.font = '600 13px "Alegreya Sans", sans-serif'; c.fillText(b.phu, C.W / 2, cy + 18); }
      c.restore();
    }
  }
  window.RENDER = { ve, veAnh, ANH };
})();
