// TURRET MERGE — HIỂN THỊ HỖ TRỢ khi chạm / giữ ụ hỗ trợ (tư vấn mục F):
// bình thường KHÔNG có quầng/dây liên tục; chạm ụ hỗ trợ → vòng năng lượng quét ra, dây năng lượng chảy tới từng ô kề,
// ô được buff có khung góc + biểu tượng riêng bật ra (nảy quá đà), nhãn tiếng Anh "+30% FIRE RATE" màu đặc trưng.
'use strict';

const pct = (v) => Math.round(v * 100);
// icon: ảnh biểu tượng · mau: màu đặc trưng · link: ảnh dây · ke: tác dụng lên 4 ô kề · den: đích đặc biệt · chu(T): nhãn
const SUP = {
  radar:    { icon: 'sup_radar',   mau: '#ffb43a', link: 'sup_link_vang', ke: true, chu: (T) => '+' + pct(SKILLS.radar.them(T)) + '% FIRE RATE' },
  chimang:  { icon: 'sup_chimang', mau: '#ff5a64', link: 'sup_link_vang', ke: true, chu: (T) => '+' + pct(SKILLS.chimang.them(T)) + '% CRIT' },
  lanhgia:  { icon: 'sup_lanhgia', mau: '#6fe0ff', link: 'sup_link',      ke: true, chu: (T) => '+' + pct(SKILLS.lanhgia.cham(T)) + '% SLOW' },
  khuech:   { icon: 'sup_khuech',  mau: '#ff9a3a', link: 'sup_link_vang', ke: true, chu: (T) => '+' + pct(SKILLS.khuech.them(T)) + '% DAMAGE' },
  tuthan:   { icon: 'sup_tuthan',  mau: '#c77dff', link: 'sup_link',      ke: true, chu: (T) => (SKILLS.tuthan.tile(T) * 100).toFixed(1) + '% INSTANT KILL' },
  mana:     { icon: 'sup_mana',    mau: '#c890ff', link: 'sup_link', den: 'mana', chu: (T) => '+' + SKILLS.mana.luong(T) + ' MANA / 7s' },
  nhanmana: { icon: 'sup_mana',    mau: '#c890ff', link: 'sup_link', den: 'mana', chu: (T) => 'MERGE: +' + SKILLS.nhanmana.luong(T.sao, G.ban[T.ban]) + ' MANA' },
  hutmana:  { icon: 'sup_mana',    mau: '#c890ff', link: 'sup_link', den: 'mana', chu: (T) => '+' + SKILLS.hutmana.luong(T).toFixed(1) + ' MANA / HIT' },
  khien:    { icon: 'sup_khien',   mau: '#5fb8ff', link: 'sup_link', den: 'khien', chu: (T) => 'MERGE: SHIELD ×' + (1 + T.sao) },
  taylo:    { icon: 'sup_taylo',   mau: '#4bffb0', link: 'sup_link', den: 'taylo', chu: (T) => 'MERGE: CLEANSE ×' + (1 + T.sao) },
};
const laHoTro = (T) => !!(T && SUP[T.id] && SKILLS[T.id]);

Object.assign(REN, {
  // ảnh tô màu theo màu đặc trưng (giữ độ sáng + alpha gốc) — dựng 1 lần
  toMau(ten, mau) {
    const key = 'tm|' + ten + '|' + mau; if (this.xam[key]) return this.xam[key];
    const a = this.img(ten); if (!a) return null;
    const c = document.createElement('canvas'); c.width = a.width; c.height = a.height;
    const x = c.getContext('2d'); x.drawImage(a, 0, 0);
    x.globalCompositeOperation = 'color'; x.fillStyle = mau; x.fillRect(0, 0, c.width, c.height);
    x.globalCompositeOperation = 'destination-in'; x.drawImage(a, 0, 0);
    return (this.xam[key] = c);
  },
  // ô kề trực giao (có kiểm biên) → [{o, T}]
  oKe(B, o) {
    const c = o % 5, h = (o / 5) | 0, ds = [];
    if (c > 0) ds.push(o - 1); if (c < 4) ds.push(o + 1); if (h > 0) ds.push(o - 5); if (h < 2) ds.push(o + 5);
    return ds.map(i => ({ o: i, T: B.t[i] }));
  },
  khungGoc(ctx, x, y, w, h, mau, al, sc) {
    const k = this.toMau('sup_khung', mau);
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
    ctx.globalAlpha = al * 0.16; ctx.fillStyle = mau; // nền ô (alpha 0.12–0.18)
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4, 7) : ctx.rect(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4); ctx.fill();
    ctx.globalAlpha = al;
    if (k) ctx.drawImage(k, -w / 2, -h / 2, w, h);
    else { ctx.strokeStyle = mau; ctx.lineWidth = 2; ctx.strokeRect(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4); }
    ctx.restore();
  },
  // dây năng lượng chảy từ (x0,y0) tới (x1,y1); p = tiến độ dựng (0..1); t = thời gian (cuộn vân)
  dayNL(ctx, ten, x0, y0, x1, y1, p, t, rong, al) {
    if (p <= 0) return;
    const xe = x0 + (x1 - x0) * p, ye = y0 + (y1 - y0) * p;
    ctx.globalAlpha = al * 0.85;
    this.tia(ctx, ten, x0, y0, xe, ye, rong, -t * 140);
    ctx.globalAlpha = al * 0.9;
    this.anhGiua(ctx, this.cham1('#ffffff'), xe, ye, rong * (p < 1 ? 2.4 : 1.4)); // đầu dây sáng
  },
  veHoTro(ctx) {
    const X = UI.xemHT; if (!X) return;
    const B = G.ban[X.T.ban], T = X.T;
    if (!B || B.t[T.o] !== T) { UI.xemHT = null; return; }
    const now = performance.now(), e = (now - X.t0) / 1000;
    let tat = 1; // mờ dần khi hết giờ
    if (!X.giu && X.het) { const r = (now - X.het) / 260; if (r >= 1) { UI.xemHT = null; return; } if (r > 0) tat = 1 - r; }
    const S = SUP[T.id], mau = S.mau, c = B.o[T.o], cw = B.cw, ch = B.ch, C = Math.min(cw, ch);
    const backOut = (u) => { u = clamp(u, 0, 1); const s = 1.9; return 1 + (s + 1) * Math.pow(u - 1, 3) + s * Math.pow(u - 1, 2); };
    const easeOut = (u) => { u = clamp(u, 0, 1); return 1 - (1 - u) * (1 - u) * (1 - u); };
    // đích tác dụng
    let dich = [];
    if (S.ke) dich = this.oKe(B, T.o).map(d => ({ x: B.o[d.o].x, y: B.o[d.o].y, T: d.T, o: true }));
    else if (S.den === 'mana') dich = [{ x: 62, y: 706, T: null, mana: true }];
    else if (S.den === 'khien') dich = B.t.filter(X2 => X2 && X2 !== T && X2.khien > 0).map(X2 => ({ x: B.o[X2.o].x, y: B.o[X2.o].y, T: X2, o: true }));
    else if (S.den === 'taylo') dich = B.t.filter(X2 => X2 && X2 !== T && (X2.st.bang > 0 || X2.st.da || X2.st.lua > 0 || X2.st.kep > 0)).map(X2 => ({ x: B.o[X2.o].x, y: B.o[X2.o].y, T: X2, o: true }));
    const laDich = new Set(dich.filter(d => d.T).map(d => d.T.o));
    // 1) làm tối các ô không liên quan (đưa mắt vào vùng tác dụng)
    const toi = easeOut(e / 0.18) * tat;
    ctx.fillStyle = '#05070a';
    for (let i = 0; i < 15; i++) {
      if (i === T.o || (S.ke && dich.some(d => B.o[i].x === d.x && B.o[i].y === d.y)) || laDich.has(i)) continue;
      ctx.globalAlpha = 0.5 * toi; const o = B.o[i];
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(o.x - cw / 2 + 1, o.y - ch / 2 + 1, cw - 2, ch - 2, 6) : ctx.rect(o.x - cw / 2 + 1, o.y - ch / 2 + 1, cw - 2, ch - 2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'lighter';
    // 2) vòng quét năng lượng (2 nhịp) + vòng mảnh quay quanh ụ hỗ trợ khi đang chọn
    const vr = this.toMau('sup_ring', mau);
    for (const [tre, max] of [[0, 2.5], [0.12, 1.7]]) {
      const u = (e - tre) / 0.45; if (u < 0 || u > 1 || !vr) continue;
      const r = C * (0.45 + (max - 0.45) * easeOut(u));
      ctx.globalAlpha = (1 - u) * (1 - u) * 0.95 * tat;
      ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(u * 1.2); ctx.drawImage(vr, -r, -r, r * 2, r * 2); ctx.restore();
    }
    if (vr) {
      const r = C * 0.56 * backOut(e / 0.3);
      ctx.globalAlpha = 0.55 * tat * clamp(e / 0.15, 0, 1);
      ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(this.t * 0.8); ctx.drawImage(vr, -r, -r, r * 2, r * 2); ctx.restore();
    }
    // 3) dây năng lượng tới từng đích (dựng trong ~200 ms, so le) + gói năng lượng chạy theo nhịp
    const day = this.toMau(S.link, mau) || this.img(S.link);
    dich.forEach((d, i) => {
      const dx = d.x - c.x, dy = d.y - c.y, L = Math.hypot(dx, dy) || 1, r0 = C * 0.34, r1 = d.mana ? 26 : C * 0.36;
      const x0 = c.x + dx / L * r0, y0 = c.y + dy / L * r0, x1 = d.x - dx / L * r1, y1 = d.y - dy / L * r1;
      const p = easeOut((e - 0.06 - i * 0.03) / 0.2);
      const rong = d.T || d.mana ? 9 : 6, al = (d.T || d.mana ? 1 : 0.45) * tat;
      if (day) this.dayNL(ctx, day, x0, y0, x1, y1, p, this.t, rong, al);
      if (p >= 1 && (d.T || d.mana)) { // gói năng lượng
        const q = ((e - 0.3 - i * 0.07) / 0.55) % 1;
        if (q > 0) { ctx.globalAlpha = 0.9 * tat * Math.sin(q * Math.PI); this.anhGiua(ctx, this.cham1(mau), x0 + (x1 - x0) * q, y0 + (y1 - y0) * q, 14); }
      }
    });
    ctx.globalCompositeOperation = 'source-over';
    // 4) khung góc ô ụ hỗ trợ + ô đích, biểu tượng bật ra
    ctx.globalAlpha = 1;
    this.khungGoc(ctx, c.x, c.y, cw, ch, '#ffffff', 0.55 * tat, 1.12 - 0.12 * backOut(e / 0.2));
    dich.forEach((d, i) => {
      const t0 = 0.2 + i * 0.04;
      if (d.mana) { // đích = hộp mana
        const u = (e - t0) / 0.26; if (u <= 0) return;
        const s = backOut(u) * (1 + 0.05 * Math.sin(this.t * 5));
        ctx.globalAlpha = tat; this.ve1(ctx, S.icon, 30 * s, '', d.x + 30, d.y - 30);
        return;
      }
      const u = (e - t0) / 0.18; if (u <= 0) return;
      this.khungGoc(ctx, d.x, d.y, cw, ch, mau, (d.T ? 0.95 : 0.4) * tat, 1.3 - 0.3 * backOut(u));
      if (d.T) { // biểu tượng: nảy 0 → 1.25 → 1 rồi nhấp nhô nhẹ
        const v = (e - t0 - 0.05) / 0.26; if (v <= 0) return;
        const s = backOut(v), bob = Math.sin(this.t * 4 + i) * 1.2, ic = C * 0.42;
        ctx.globalAlpha = tat * clamp(v * 3, 0, 1);
        ctx.save(); ctx.translate(d.x - cw * 0.3, d.y - ch * 0.26 + bob); ctx.scale(s, s);
        this.ve1(ctx, S.icon, ic); ctx.restore();
      }
    });
    // 5) biểu tượng của chính ụ hỗ trợ (to, trên đầu) + nhãn tiếng Anh màu đặc trưng
    const u = (e - 0.08) / 0.24;
    if (u > 0) {
      ctx.globalAlpha = tat * clamp(u * 3, 0, 1);
      const s = backOut(u), ic = C * 0.56;
      const cy = c.y - ch * 0.5 - 22 + (1 - easeOut(u)) * 8;
      const txt = S.chu(T);
      ctx.font = '900 12px "Be Vietnam Pro",system-ui,sans-serif'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      const tw = Math.ceil(ctx.measureText(txt).width), w = tw + ic * 0.62 + 18, h = 22;
      const bx = clamp(c.x - w / 2, 4, W - w - 4);
      ctx.save(); ctx.translate(bx + w / 2, cy); ctx.scale(0.85 + 0.15 * s, 0.85 + 0.15 * s); ctx.translate(-(bx + w / 2), -cy);
      ctx.fillStyle = 'rgba(10,12,16,.92)'; ctx.strokeStyle = mau; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx, cy - h / 2, w, h, 11) : ctx.rect(bx, cy - h / 2, w, h); ctx.fill(); ctx.stroke();
      // mũi nhọn chỉ xuống ụ
      const ax = clamp(c.x, bx + 12, bx + w - 12);
      ctx.beginPath(); ctx.moveTo(ax - 5, cy + h / 2 - 0.5); ctx.lineTo(ax, cy + h / 2 + 5); ctx.lineTo(ax + 5, cy + h / 2 - 0.5); ctx.closePath(); ctx.fillStyle = mau; ctx.fill();
      this.ve1(ctx, S.icon, ic * 0.95, '', bx + ic * 0.38, cy);
      ctx.fillStyle = mau; ctx.fillText(txt, bx + ic * 0.62 + 8, cy + 0.5);
      ctx.restore();
      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    }
    ctx.globalAlpha = 1;
  },
});
