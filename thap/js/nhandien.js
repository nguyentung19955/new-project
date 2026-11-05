// TURRET MERGE — HỆ NHẬN DIỆN Ụ (TU-VAN-NHAN-DIEN mục 0, 4, 5B, 7A–7F, 10):
//  · MÀU KHOÁ bộ bài: 5 ô bộ bài = 5 màu rất khác nhau (an toàn mù màu) → vòng tròn quanh bệ + viền thẻ bộ bài + huy hiệu.
//  · BIỂU TƯỢNG (glyph.js) cố định cho từng ụ: huy hiệu tròn góc TRÊN-TRÁI ô (không xoay), cũng trên thẻ / bảng thông tin.
//  · HUY HIỆU SAO: 1 lục giác tối cố định góc TRÊN-PHẢI, số to màu ngà (thay ngôi sao vàng nhỏ khó đọc).
//  · KÉO GHÉP: hỏi luật thật (hopLeGhep) → viền bạc hà nhấp nháy + chấm tâm ở ô ghép được, làm mờ ô không ghép được,
//    rê lên ô hợp lệ = viền dày + cung nối từ ô gốc, rê lên ô sai = vòng gạch chéo trung tính.
//  · CHẠM Ụ = dải 1 dòng (biểu tượng + tên + vai trò + sao); CHẠM THẺ = khoanh mọi ụ cùng loại trên bàn ~0,8 s.
//  · VÀO TRẬN: giới thiệu nhanh 5 ụ trong bộ bài (1,5 s, chạm để bỏ qua).
'use strict';

const ND = {
  // 5 màu khoá (đã thử mô phỏng mù màu đỏ/lục/lam: khoảng cách OKLab nhỏ nhất ≈ 0.14) — xanh dương · đỏ · vàng chanh · ngọc · tím
  KEY: ['#3B7BFF', '#FF3B3B', '#B9F23A', '#33D6A6', '#C88BFF'],
  TRUNG: '#d9dee6', // ụ ngoài bộ bài (hiếm): huy hiệu trung tính
  MINT: '#75F0B9',
  soi: null, // chạm thẻ bộ bài: { id, t0 }
  _url: {},

  // màu khoá của 1 loại ụ trên 1 bàn (cố định cả trận: theo thứ tự ô bộ bài lúc vào trận)
  mau(B, id) {
    if (!B) return null;
    if (!B.khoa) { B.khoa = {}; (B.deck || []).forEach((d, i) => { B.khoa[d] = ND.KEY[i % 5]; }); }
    return B.khoa[id] || null;
  },
  mauU(T) { return T ? this.mau(G.ban[T.ban], T.id) : null; },

  // huy hiệu biểu tượng: đĩa tròn màu khoá + hình tối (mau = null → đĩa tối + hình trắng). d = đường kính logic
  huy(id, mau, d, da) {
    const k = REN.s * REN.dpr, N = Math.max(10, Math.round(d * 1.3 * k)), key = 'ndh|' + id + '|' + (mau || '-') + '|' + N + (da ? '|x' : '') + '|' + this.glAnh(id, N);
    let c = REN.cache[key]; if (c) return c;
    c = document.createElement('canvas'); c.width = c.height = N;
    this.veHuy(c.getContext('2d'), id, mau, N, da);
    return (REN.cache[key] = c);
  },
  // 1 = hình nhận diện đang là ảnh PNG (glyph/<id>.png) ở cỡ đĩa N → khoá bộ đệm đổi khi ảnh tải xong
  glAnh(id, N) { return GLYPH.coAnh ? GLYPH.coAnh(id, Math.round(N / 1.3 * 0.74)) : 0; },
  veHuy(x, id, mau, N, da) {
    const r = N / 1.3 / 2, cx = N / 2, cy = N / 2;
    x.fillStyle = 'rgba(0,0,0,.5)'; x.beginPath(); x.arc(cx, cy + r * 0.12, r * 1.04, 0, Math.PI * 2); x.fill(); // bóng
    x.fillStyle = '#0b0e13'; x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill(); // viền tối
    const nen = da ? '#8a8f96' : (mau || '#1a1f27');
    x.fillStyle = nen; x.beginPath(); x.arc(cx, cy, r - Math.max(1, r * 0.13), 0, Math.PI * 2); x.fill();
    if (!mau) { x.strokeStyle = this.TRUNG; x.lineWidth = Math.max(1, r * 0.12); x.beginPath(); x.arc(cx, cy, r - r * 0.2, 0, Math.PI * 2); x.stroke(); }
    const g = Math.round(r * 2 * 0.74), m = GLYPH.mask(id, g);
    const t = document.createElement('canvas'); t.width = t.height = g;
    const tx = t.getContext('2d'); tx.drawImage(m, 0, 0); tx.globalCompositeOperation = 'source-in'; tx.fillStyle = mau || da ? '#0d1117' : '#ffffff'; tx.fillRect(0, 0, g, g);
    x.drawImage(t, Math.round(cx - g / 2), Math.round(cy - g / 2));
  },
  // ảnh dataURL cho DOM (thẻ, bảng thông tin, dải nhận diện)
  url(id, mau, px) {
    px = px || 64; const N = Math.round(px * 1.3), key = id + '|' + (mau || '-') + '|' + px + '|' + this.glAnh(id, N); if (this._url[key]) return this._url[key];
    const c = document.createElement('canvas'); c.width = c.height = N;
    this.veHuy(c.getContext('2d'), id, mau, N);
    return (this._url[key] = c.toDataURL());
  },
  // ảnh glyph PNG vừa tải xong → thay mọi <img> DOM đang hiện bản vector của ụ đó
  doiAnhDOM(id) {
    const cu = {};
    for (const k in this._url) if (k.startsWith(id + '|') && k.endsWith('|0')) { const [, m, px] = k.split('|'); cu[this._url[k]] = [m === '-' ? null : m, +px]; }
    if (!Object.keys(cu).length) return;
    for (const im of document.querySelectorAll('img')) { const v = cu[im.getAttribute('src')]; if (v) im.src = this.url(id, v[0], v[1]); }
  },
  // vòng màu khoá quanh bệ (vẽ vào ảnh thân dựng sẵn — dưới đầu súng). R = bán kính, tròn tuyệt đối
  veVong(x, R, mau, da) {
    if (!mau) return;
    x.lineWidth = 5.2; x.strokeStyle = 'rgba(6,8,11,.9)'; x.beginPath(); x.arc(0, 0, R, 0, Math.PI * 2); x.stroke();
    x.lineWidth = 3; x.strokeStyle = da ? '#8a8f96' : mau; x.beginPath(); x.arc(0, 0, R, 0, Math.PI * 2); x.stroke();
  },

  // ---------- lớp huy hiệu (vẽ SAU hiệu ứng → không bao giờ bị đạn/tia che) ----------
  // gọi từ REN.veU: xếp hàng; REN.veHangHuy vẽ cả loạt
  xep(T, x, y, C, hs, al, B) {
    const d = C * 0.34, k = C / (Math.min(B.cw, B.ch));
    const dx = (B.cw * k) / 2 - d / 2 - 1.5, dy = (B.ch * k) / 2 - d / 2 - 1.5;
    return { T, gx: x - dx, gy: y - dy, sx: x + dx, sy: y - dy, d, hs, al };
  },
  veHuyHieu(ctx, h) {
    const T = h.T, d = h.d * h.hs; if (d < 1) return;
    ctx.globalAlpha = h.al;
    const c = this.huy(T.id, this.mauU(T), h.d, T.st && T.st.da);
    ctx.drawImage(c, h.gx - d * 0.65, h.gy - d * 0.65, d * 1.3, d * 1.3);
    REN.veHuyHieu(ctx, h.sx, h.sy, T.sao, d);
    ctx.globalAlpha = 1;
  },

  // ---------- kéo ghép: viền ô hợp lệ / mờ ô sai / cung nối / gạch chéo ----------
  oVien(ctx, B, o, w, mau, al, pad) {
    const c = B.o[o], cw = B.cw - pad * 2, ch = B.ch - pad * 2;
    ctx.globalAlpha = al; ctx.lineWidth = w; ctx.strokeStyle = mau;
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(c.x - cw / 2, c.y - ch / 2, cw, ch, 8) : ctx.rect(c.x - cw / 2, c.y - ch / 2, cw, ch); ctx.stroke();
  },
  veKeo(ctx) {
    const k = UI.keo; if (!k || !k.dang) return;
    const src = k.T, B = G.ban[src.ban]; if (!B || B.t[src.o] !== src) return;
    const t = REN.t, nh = 0.5 + 0.5 * Math.sin(t * 7);
    const D = UI.uTai(k.x, k.y), hover = D && D !== src ? D : null;
    ctx.save();
    for (let i = 0; i < 15; i++) {
      const N = B.t[i]; if (!N || N === src || !hopLeGhep(src, N)) continue;
      const c = B.o[i], on = hover === N;
      // viền tối lót + viền bạc hà nhấp nháy (rê lên: dày 4.5)
      this.oVien(ctx, B, i, on ? 7.5 : 5.5, 'rgba(4,8,6,.75)', 1, 3);
      this.oVien(ctx, B, i, on ? 4.5 : 3, this.MINT, on ? 1 : 0.6 + 0.4 * nh, 3);
      ctx.globalAlpha = 1; ctx.fillStyle = '#0b0e13'; ctx.beginPath(); ctx.arc(c.x, c.y, on ? 4.6 : 3.6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(c.x, c.y, on ? 3 : 2.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore(); ctx.globalAlpha = 1;
  },
  // phần rê (cung nối / gạch chéo): vẽ TRÊN ụ đang kéo để ngón tay không che mất
  veKeoTren(ctx) {
    const k = UI.keo; if (!k || !k.dang) return;
    const src = k.T, B = G.ban[src.ban]; if (!B || B.t[src.o] !== src) return;
    const t = REN.t, D = UI.uTai(k.x, k.y), hover = D && D !== src ? D : null;
    ctx.save();
    if (hover) {
      const c0 = B.o[src.o], c1 = B.o[hover.o];
      if (hopLeGhep(src, hover)) { // cung nối ngắn từ ô gốc → ô đích
        const mx = (c0.x + c1.x) / 2, my = (c0.y + c1.y) / 2 - Math.max(18, Math.hypot(c1.x - c0.x, c1.y - c0.y) * 0.25);
        ctx.globalAlpha = 0.9; ctx.lineCap = 'round';
        ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(4,8,6,.7)'; ctx.beginPath(); ctx.moveTo(c0.x, c0.y); ctx.quadraticCurveTo(mx, my, c1.x, c1.y); ctx.stroke();
        ctx.lineWidth = 2.6; ctx.strokeStyle = this.MINT; ctx.setLineDash([7, 5]); ctx.lineDashOffset = -t * 40;
        ctx.beginPath(); ctx.moveTo(c0.x, c0.y); ctx.quadraticCurveTo(mx, my, c1.x, c1.y); ctx.stroke(); ctx.setLineDash([]);
      } else { // ô KHÔNG ghép được: vòng gạch chéo trung tính (không đỏ, không gợi ý hợp lệ)
        const r = Math.min(B.cw, B.ch) * 0.24;
        ctx.globalAlpha = 0.95; ctx.lineCap = 'round';
        for (const [w, m] of [[6, 'rgba(6,8,11,.85)'], [3, '#e6e9ee']]) {
          ctx.lineWidth = w; ctx.strokeStyle = m;
          ctx.beginPath(); ctx.arc(c1.x, c1.y, r, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(c1.x - r * 0.7, c1.y + r * 0.7); ctx.lineTo(c1.x + r * 0.7, c1.y - r * 0.7); ctx.stroke();
        }
      }
    }
    ctx.restore(); ctx.globalAlpha = 1;
  },

  // ---------- chạm thẻ bộ bài: khoanh mọi ụ cùng loại ~0,8 s ----------
  soiThe(id) { if (G.ban.length) this.soi = { id, t0: performance.now() }; },
  veSoi(ctx) {
    const s = this.soi; if (!s) return;
    const u = (performance.now() - s.t0) / 800; if (u >= 1) { this.soi = null; return; }
    const B = G.ban[0], mau = this.mau(B, s.id) || this.TRUNG, al = u < 0.75 ? 1 : (1 - u) / 0.25;
    const nh = 0.5 + 0.5 * Math.sin(u * Math.PI * 6);
    ctx.save();
    for (let i = 0; i < 15; i++) {
      const T = B.t[i]; if (!T || T.id !== s.id) continue;
      const c = B.o[i], cw = B.cw - 4, ch = B.ch - 4;
      ctx.globalAlpha = al * 0.18; ctx.fillStyle = mau;
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(c.x - cw / 2, c.y - ch / 2, cw, ch, 9) : ctx.rect(c.x - cw / 2, c.y - ch / 2, cw, ch); ctx.fill();
      this.oVien(ctx, B, i, 6, 'rgba(6,8,11,.8)', al, 2);
      this.oVien(ctx, B, i, 3 + nh, mau, al, 2);
    }
    ctx.restore(); ctx.globalAlpha = 1;
  },

  // ---------- dải nhận diện 1 dòng khi chạm ụ ----------
  dai(T) {
    const el = $('#nd-dai'), B = G.ban[T.ban], r = G.rosterMap[T.id], sk = SKILLS[T.id] || {}, mau = this.mau(B, T.id);
    el.querySelector('img').src = this.url(T.id, mau, 44);
    const ten = el.querySelector('b'); ten.textContent = r.ten; ten.style.color = mau || '#fff';
    el.querySelector('.nd-vai').textContent = TEXT.ui.role[sk.vai] || '';
    el.querySelector('.nd-sao').textContent = T.sao + '★';
    el.style.setProperty('--k', mau || this.TRUNG);
    const B0 = G.ban[0];
    el.style.top = Math.round(Math.max(56, B0.y - 31)) + 'px';
    el.hidden = false; el.classList.remove('ra'); void el.offsetWidth; el.classList.add('vao');
    clearTimeout(this._dai); this._dai = setTimeout(() => this.anDai(), 2600);
  },
  anDai() { const el = $('#nd-dai'); if (el && !el.hidden) { el.hidden = true; el.classList.remove('vao'); } },

  // ---------- giới thiệu 5 ụ khi vào trận (1,5 s, chạm để bỏ qua) ----------
  gioiThieu(B) {
    const el = $('#nd-gt'); if (!el || G.debug.nointro) return;
    const hang = el.querySelector('.gt-hang'); hang.innerHTML = '';
    B.deck.forEach((id) => {
      const r = G.rosterMap[id], mau = this.mau(B, id), sk = SKILLS[id] || {};
      const d = document.createElement('div'); d.className = 'gt-o'; d.style.setProperty('--k', mau);
      d.innerHTML = '<img class="gt-gl" src="' + this.url(id, mau, 40) + '" alt=""><img class="gt-u" src="' + iconOf(id) + '" alt=""><b>' + r.ten + '</b><span>' + (TEXT.ui.role[sk.vai] || '') + '</span>';
      hang.appendChild(d);
    });
    el.hidden = false; el.classList.remove('ra'); void el.offsetWidth; el.classList.add('vao');
    requestAnimationFrame(() => el.querySelectorAll('.gt-o b').forEach(b => fitText(b, 11, 7.5)));
    const tat = () => { clearTimeout(this._gt); el.classList.add('ra'); this._gt2 = setTimeout(() => { el.hidden = true; el.classList.remove('vao', 'ra'); }, 220); };
    clearTimeout(this._gt); clearTimeout(this._gt2); this._gt = setTimeout(tat, 1500);
    el.onpointerdown = (e) => { e.stopPropagation(); e.preventDefault(); tat(); };
  },

  // ---------- trang trí DOM: thẻ bộ bài trong trận, bảng thông tin, màn chọn ----------
  theTran() {
    const B = G.ban[0]; if (!B) return;
    document.querySelectorAll('#bo-the .the').forEach((d) => {
      const id = d.dataset.id, mau = this.mau(B, id);
      d.style.setProperty('--k', mau); d.classList.add('nd-k');
      const im = document.createElement('img'); im.className = 'gl'; im.alt = ''; im.src = this.url(id, mau, 40);
      d.appendChild(im);
    });
  },
  theTT(id, T) {
    const tt = $('#tt'), dau = tt.querySelector('.tt-dau');
    let im = dau.querySelector('.tt-gl');
    if (!im) { im = document.createElement('img'); im.className = 'tt-gl'; im.alt = ''; dau.insertBefore(im, dau.firstChild); }
    const tran = G.ban.length && !$('#top').hidden;
    const mau = T ? this.mauU(T) : (tran ? this.mau(G.ban[0], id) : null);
    im.src = this.url(id, mau, 40); im.hidden = false;
  },

  init() {
    // khung DOM: dải nhận diện + bảng giới thiệu
    const wrap = $('#wrap');
    const dai = document.createElement('div'); dai.id = 'nd-dai'; dai.hidden = true;
    dai.innerHTML = '<img alt=""><b></b><i>·</i><span class="nd-vai"></span><i>·</i><span class="nd-sao"></span>';
    wrap.appendChild(dai);
    const gt = document.createElement('div'); gt.id = 'nd-gt'; gt.hidden = true;
    gt.innerHTML = '<div class="gt-bang"><div class="gt-ten">' + (TEXT.ui.yourTurrets || 'YOUR 5 TURRETS') + '</div><div class="gt-hang"></div><div class="gt-phu">' + (TEXT.ui.tapSkip || 'Same symbol + color = same turret · tap to skip') + '</div></div>';
    wrap.appendChild(gt);
    // chạm (nhấn xuống) thẻ bộ bài → khoanh mọi ụ cùng loại (chạm nhanh vẫn nâng cấp như cũ)
    $('#cv').addEventListener('pointerdown', () => this.anDai()); // chạm bàn: tắt dải (chạm ụ sẽ mở lại khi nhấc tay)
    $('#bo-the').addEventListener('pointerdown', (e) => { const d = e.target.closest('.the'); if (d) this.soiThe(d.dataset.id); });
  },
};

// ---------- móc vào giao diện có sẵn ----------
(() => {
  const vaoTranGoc = UI.vaoTran;
  UI.vaoTran = function () { const r = vaoTranGoc.apply(this, arguments); ND.anDai(); ND.theTran(); ND.gioiThieu(G.ban[0]); return r; };
  const moTTGoc = UI.moTT;
  UI.moTT = function (id, T, giu) {
    const r = moTTGoc.apply(this, arguments);
    ND.theTT(id, T);
    if (T && G.ban.length && !$('#top').hidden) ND.dai(T);
    return r;
  };
  const moTTMVGoc = UI.moTTMV;
  UI.moTTMV = function () { const r = moTTMVGoc.apply(this, arguments); const im = $('#tt .tt-gl'); if (im) im.hidden = true; return r; };
  // màn chọn: huy hiệu trung tính trên mọi thẻ; 5 ô bộ bài đã chọn = 5 màu khoá (đúng màu sẽ thấy trong trận)
  const theChonGoc = UI.theChon;
  UI.theChon = function (r) { const c = theChonGoc.apply(this, arguments); const im = document.createElement('img'); im.className = 'gl'; im.alt = ''; im.src = ND.url(r.id, null, 40); c.appendChild(im); return c; };
  const veBoChonGoc = UI.veBoChon;
  UI.veBoChon = function () {
    const r = veBoChonGoc.apply(this, arguments);
    $('#chon-bo').querySelectorAll('.o-bo').forEach((o, i) => {
      const id = o.dataset.id; if (!id) return;
      o.style.setProperty('--k', ND.KEY[i]); o.classList.add('nd-k');
      const im = document.createElement('img'); im.className = 'gl'; im.alt = ''; im.src = ND.url(id, ND.KEY[i], 40); o.appendChild(im);
    });
    return r;
  };
  if (GLYPH.khiTai) GLYPH.khiTai((id) => ND.doiAnhDOM(id));
  ND.init();
})();
