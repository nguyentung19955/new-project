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

  // HUY HIỆU VAI TRÒ = icon PNG ChatGPT h2_vai_<vai>.png (QUY-TAC-HINH: bỏ đĩa màu + hình vector vẽ code). d = đường kính logic
  VAI: { tc: 'h2_vai_tc', ht: 'h2_vai_ht', db: 'h2_vai_db', kc: 'h2_vai_kc', phu: 'h2_vai_phu' },
  anhVai(id) { const sk = SKILLS[id] || {}; return this.VAI[sk.vai] || 'h2_vai_tc'; },
  huy(id, mau, d, da) {
    const ten = this.anhVai(id), a = da ? REN.banXam(ten) : REN.img(ten); if (!a) return null;
    return REN.mip(a, d * 1.3 * REN.s * REN.dpr);
  },
  // ảnh cho DOM (thẻ, bảng thông tin, dải nhận diện): đường dẫn PNG có sẵn
  url(id) { return 'assets/' + this.anhVai(id) + '.png'; },
  doiAnhDOM() {},
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
    // (bỏ icon vai trò trên bàn — độ hiếm = vòng bậc PNG; vai trò chỉ ở bảng chạm ụ / thẻ bộ bài)
    REN.veHuyHieu(ctx, h.sx, h.sy, T.sao, d);
    ctx.globalAlpha = 1;
  },

  // kéo ghép: chỉ ảnh ChatGPT (khung_chon / sup_ring / h2_vong_do) — xem keoghep.js (P0-02)
  veKeo(ctx) { if (typeof KG !== 'undefined') KG.veDuoi(ctx); },
  veKeoTren(ctx) { if (typeof KG !== 'undefined') KG.veTren(ctx); },

  // ---------- chạm thẻ bộ bài: khoanh mọi ụ cùng loại ~0,8 s ----------
  soiThe(id) { if (G.ban.length) this.soi = { id, t0: performance.now() }; },
  veSoi(ctx) {
    const s = this.soi; if (!s) return;
    const u = (performance.now() - s.t0) / 800; if (u >= 1) { this.soi = null; return; }
    const B = G.ban[0], al = u < 0.75 ? 1 : (1 - u) / 0.25, vong = REN.img('sup_ring'); if (!vong) return;
    const nh = 0.5 + 0.5 * Math.sin(u * Math.PI * 6), C = Math.min(B.cw, B.ch);
    for (let i = 0; i < 15; i++) { // khoanh = vòng chọn sup_ring PNG nhịp nhẹ (không viền/ô tô màu vẽ code)
      const T = B.t[i]; if (!T || T.id !== s.id) continue;
      REN.anhGiua(ctx, vong, B.o[i].x, B.o[i].y, C * (1 + 0.06 * nh), 0, al);
    }
    ctx.globalAlpha = 1;
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
      d.style.setProperty('--k', mau); // (bỏ lớp nd-k: viền màu khoá vẽ CSS — QUY-TAC-HINH 1)
      // (không gắn huy hiệu nhận diện lên thẻ trong trận — dọn thanh bài; vai trò xem ở bảng chạm)
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
      o.style.setProperty('--k', ND.KEY[i]); // (bỏ lớp nd-k: viền màu vẽ CSS)
      const im = document.createElement('img'); im.className = 'gl'; im.alt = ''; im.src = ND.url(id, ND.KEY[i], 40); o.appendChild(im);
    });
    return r;
  };
  if (GLYPH.khiTai) GLYPH.khiTai((id) => ND.doiAnhDOM(id));
  ND.init();
})();
