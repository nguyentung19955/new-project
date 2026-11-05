// TURRET MERGE — TƯ VẤN TOÀN BỘ phần B: TRẬN ĐẤU DỄ ĐỌC (docs/demo-hop-tuong/thap-art/TU-VAN-TOAN-BO.txt §B7–B12, §C, fix 05/08/11/12).
//  Khung logic 430×860 (màn 390 px = ×0,907 → "12 px ở 390" = 13,2 px logic; mọi chữ trận ≥ 13,5 logic trừ nhãn phụ).
//  · B7  Bàn đầy: nút Triệu hồi dùng ảnh tắt + chữ "BOARD FULL" 2 dòng; chạm → "MERGE TO FREE A SLOT" (không còn chữ FULL mơ hồ).
//  · C   BOSS IN N: hổ phách khi đếm ngược, đỏ khi wave sau là trùm / trùm đang ở sân.
//  · B8  Dải xem nhanh 64 px@390 ngay trên khay (SOLO) / dưới thanh trên (2 bàn): chân dung 44, tên 14, 1 dòng mục tiêu 12, DMG + RATE 2 cột, nút mở 44.
//  · B9  Tấm mở rộng: tấm đáy ≤ 470 px@390, chân dung 64, 4 ô số 2×2, kỹ năng 2–3 dòng, mốc sao, nút đóng 44 (icon p7_ic_dong).
//        SOLO: trận tạm dừng khi tấm mở (chạm ngoài tấm = đóng + chạy tiếp). CO-OP/PVP/ONLINE: trận chạy tiếp, cảnh báo trùm nằm trên tấm.
//  · B12/fix 11  Cảnh báo trùm gọn ≤ 96 px@390: chân dung 56 · tên 18 · mối đe doạ 13 · đếm ngược 16 ("SKILL IN 8s").
//        SOLO: đặt ở khoảng trống dưới làn đường dưới (không che ô, không che làn). 2 bàn: đáy băng = mép trên bàn mình (che bàn gọn
//        phía trên, không bao giờ che hàng ô nào của bàn mình). Hiện ~2,4 s rồi thu lên khoang Boss trên ray.
//  · B10/B11  Nhãn bàn ALLY / RIVAL / YOU 12 px@390 cố định ở góc bàn; PVP: "VS" giữa khe 2 bàn; tim 2 bên tách rõ trên ray.
//  Chỉ chữ/số + vị trí/phóng/mờ ảnh PNG ChatGPT có sẵn (thap/QUY-TAC-HINH.md).
'use strict';
const TVB = {
  CB_H: 98,           // chiều cao băng trùm (logic) = 89 px@390
  DEN_MS: 2400,
  CHU: { full1: 'BOARD', full2: 'FULL', fullLy: 'BOARD FULL · MERGE TO FREE A SLOT', skill: 'SKILL IN', vs: 'VS', you: 'YOU', ally: 'ALLY', rival: 'RIVAL' },
  _dungBoi: false,

  // ---------- B7 · bàn đầy ----------
  full() {
    const nt = $('#nut-trieu'); if (!nt) return;
    const f = nt.querySelector('.tn-full'); if (!f || f._tvb) return;
    f._tvb = 1; f.innerHTML = '<b>' + this.CHU.full1 + '</b><b>' + this.CHU.full2 + '</b>';
  },

  // ---------- C · BOSS IN N: hổ phách → đỏ ----------
  dem() {
    const top = $('#top'); if (!top || !G.ban.length) return;
    const chuKy = LUAT.songTrum, w = Math.max(1, G.wave);
    const trum = G.quai.some(e => e.trum && !e.chet);
    const con = chuKy - (w % chuKy);
    const k = trum || con === chuKy || con <= 1 ? 'do' : 'cam';
    if (top._tvb !== k) { top._tvb = k; top.classList.toggle('tvb-do', k === 'do'); top.classList.toggle('tvb-cam', k === 'cam'); }
  },

  // ---------- B9 · tấm mở rộng: SOLO tạm dừng ----------
  solo() { return G.che === 'solo' && !(typeof ONS !== 'undefined' && ONS.on); },
  moRong() { this.chay(); }, // xem ụ KHÔNG BAO GIỜ tạm dừng trận (mọi chế độ) — người dùng: inspect_dung_game.png
  chay() {
    const tt = $('#tt'); if (tt && tt.classList.contains('tvb-dung')) tt.classList.remove('tvb-dung'); const c = $('#tvb-dungchu'); if (c && !c.hidden) c.hidden = true;
    if (this._dungBoi) { this._dungBoi = false; if ($('#dung').hidden) G.dung = false; }
  },

  // ---------- B12 · băng trùm gọn ----------
  cbDat(b) {
    const B0 = G.ban[0]; if (!B0 || typeof HB === 'undefined') return;
    const o = HB.oBan(B0), h = this.CB_H;
    let top;
    if (G.ban.length > 1) top = Math.round(o.tren - 8 - h); // đáy băng = mép trên vùng ô của bàn mình
    else { // SOLO: khoảng trống dưới làn đường dưới, trên khay
      const p = G.duong[0], yl = p ? Math.max(...p.pts.map(q => q[1])) : o.duoi + 40;
      top = Math.round(Math.min(yl + 24, 674 - 4 - h));
    }
    b.style.top = Math.max(48, top) + 'px';
    b.style.height = h + 'px';
  },
  cbDung(b) {
    if (b._tvb) return; b._tvb = 1;
    const d = document.createElement('div'); d.className = 'tvb-dem'; d.innerHTML = '<small></small><b></b>'; b.appendChild(d);
  },
  cbDem() {
    const b = $('#canh-bao'); if (!b || b.hidden || !HT.cbPha) return;
    const d = b.querySelector('.tvb-dem'); if (!d) return;
    let lb = '', s = '';
    if (HT.cbPha === 'den' || HT.cbPha === 'ra') {
      const E = G.quai.find(e => e.trum && !e.chet && G.duong[e.p] && G.duong[e.p].ban === 0) || G.quai.find(e => e.trum && !e.chet);
      if (E && E.knT != null) { lb = this.CHU.skill; s = Math.max(0, Math.ceil(E.bao ? 0 : E.knT)) + 's'; }
    } else if (HT.cbPha === 'bao') { lb = 'BOSS IN'; s = (HT._baoN > 0 ? HT._baoN : '') + 's'; }
    if (d._s !== lb + s) { d._s = lb + s; d.querySelector('small').textContent = lb; d.querySelector('b').textContent = s; d.hidden = !s || s === 's'; }
  },

  // ---------- B10/B11 · nhãn bàn + VS ----------
  nhan(ctx) {
    if (G.ban.length < 2) return;
    const pvp = G.che === 'pvp', R = REN;
    ctx.save();
    ctx.font = FONT.u(14, 800); ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    for (const B of G.ban) {
      if (B.i === 0 && !pvp) continue; // CO-OP: bàn mình to ở dưới — không cần "YOU"
      const s = (B.i === 0 ? this.CHU.you : pvp ? this.CHU.rival : this.CHU.ally) + (B.aiThay ? ' · AI' : ''); // online: bạn rời → AI lái bàn này
      const tam = R.img('hud_ten_ban'); if (!tam) continue;
      const th = 22, sc = th / tam.height, dau = Math.round(tam.height * 1.05), cuoi = Math.round(tam.height * 0.45);
      const tw = Math.ceil(ctx.measureText(s).width + dau * sc + cuoi * sc + 6);
      // góc trên-phải của khay bàn (cố định, không trôi theo ụ)
      const x0 = R.px(Math.min(B.x + B.w - tw - 8, W - tw - 6)), y0 = R.px(B.y - th / 2 + 2);
      const xa = R.px(x0 + dau * sc), xb = R.px(x0 + tw - cuoi * sc);
      ctx.drawImage(tam, 0, 0, dau, tam.height, x0, y0, xa - x0, th);
      ctx.drawImage(tam, dau, 0, tam.width - dau - cuoi, tam.height, xa, y0, xb - xa, th);
      ctx.drawImage(tam, tam.width - cuoi, 0, cuoi, tam.height, xb, y0, x0 + tw - xb, th);
      const mau = B.i === 0 ? '#9fd2ff' : pvp ? '#ffb1a8' : '#a6f2c2';
      ctx.fillStyle = '#0b0d10'; ctx.fillText(s, xa + 2, y0 + th / 2 + 1.2);
      ctx.fillStyle = mau; ctx.fillText(s, xa + 2, y0 + th / 2 + 0.2);
    }
    ctx.restore();
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  },
  vs() {
    let v = $('#tvb-vs');
    const co = G.che === 'pvp' && G.ban.length > 1 && !$('#top').hidden;
    if (!v && co) { v = document.createElement('div'); v.id = 'tvb-vs'; v.textContent = this.CHU.vs; $('#wrap').appendChild(v); }
    if (!v) return;
    if (v.hidden !== !co) v.hidden = !co;
    if (co) { // giữa khe: dưới làn của bàn đối thủ, trên mép bàn mình
      const B0 = G.ban[0], B1 = G.ban[1], y = Math.round((B1.y + B1.h + 26 + B0.y) / 2 + 4);
      if (v._y !== y) { v._y = y; v.style.top = (y - 13) + 'px'; }
    }
  },
};

(() => {
  if (typeof UI === 'undefined') return;
  const wrap = $('#wrap'); if (wrap) wrap.classList.add('co-tvb');
  const vaoGoc = UI.vaoTran;
  UI.vaoTran = function () {
    TVB.chay();
    const r = vaoGoc.apply(this, arguments);
    try { if (typeof REN !== 'undefined') for (const n of ['tv_hang1', 'tv_hang2', 'tv_hang3', 'tv_hang4', 'tv_dich1', 'tv_dich2', 'tv_dich3', 'tv_dich4', 'tv_khong', 'tv_keo_bong', 'tv_lui1', 'tv_lui2', 'tv_lui3', 'tv_lui4', 'tv_ghep1', 'tv_ghep2', 'tv_ghep3', 'tv_ghep4', 'tv_ghep5', 'tv_ghep6', 'tv_ghep7', 'tv_ghep8']) REN.img(n); } catch (e) { } // nạp sẵn (giải mã trước khi kéo/ghép)
    try { TVB.full(); const top = $('#top'); if (top) top._tvb = null; TVB.vs(); } catch (e) { console.error('TVB', e); }
    return r;
  };
  const capGoc = UI.capNhat;
  UI.capNhat = function () { const r = capGoc.apply(this, arguments); try { TVB.full(); TVB.dem(); TVB.cbDem(); TVB.vs(); } catch (e) { console.error('TVB', e); } return r; };

  // B8/B9: tấm mở rộng (SOLO tạm dừng) + đóng khi #tt ẩn
  if (typeof HB !== 'undefined') {
    const mrGoc = HB.moRong;
    HB.moRong = function (rong) { const r = mrGoc.apply(this, arguments); TVB.moRong(!!rong && !$('#tt').hidden); return r; };
    const dGoc = HB.dung;
    HB.dung = function (tt) {
      const moi = !tt._hb; const r = dGoc.apply(this, arguments);
      if (moi) {
        const d = tt.querySelector('.hb-dong'); if (d) { d.innerHTML = '<img src="assets/p7_ic_dong.png" alt="">'; }
        new MutationObserver(() => { if ((tt.hidden || !tt.classList.contains('hb-rong')) && (TVB._dungBoi || tt.classList.contains('tvb-dung'))) TVB.chay(); }).observe(tt, { attributes: true, attributeFilter: ['hidden', 'class'] });
      }
      return r;
    };
    // cấp sao (merge rank) ở dải / tấm: tấm E23 (tv_hang1–4 theo bậc 1–2 · 3–4 · 5–6 · 7+) + số trong ô trống — cùng 1 chỗ cạnh tên
    const moGoc2 = HB.mo;
    HB.mo = function (tt, id, T) {
      const r = moGoc2.apply(this, arguments);
      const sao = tt.querySelector('.hb-sao');
      if (sao && T && REN.img('tv_hang1')) { const n = T.sao, h = n >= 7 ? 4 : n >= 5 ? 3 : n >= 3 ? 2 : 1; sao.className = 'hb-sao tvb-hang'; sao.style.setProperty('--hang', 'url(../assets/tv_hang' + h + '.png)' /* var dùng trong css/tvb.css → đường dẫn tính từ css/ */); sao.innerHTML = '<span>' + n + '</span>'; sao.setAttribute('aria-label', n + ' star'); }
      return r;
    };
    // tấm mở rộng: dải 64 px@390 cao 70 logic, đặt sát trên khay (SOLO)
    const datGoc = HB.dat;
    HB.dat = function (tt, rong) {
      const r = datGoc.apply(this, arguments);
      if (!rong && !this.hai()) tt.style.top = (674 - 6 - 70) + 'px';
      if (this.hai() && !rong) { tt.style.top = '680px'; return r; } // 2 bàn: dải gọn đè hàng mana/triệu hồi của khay (không che ô bàn nào; chạm xuyên qua dải)
      if (this.hai()) { tt.style.top = '68px'; if (rong) tt.style.maxHeight = Math.max(200, Math.round(this.oBan(G.ban[0]).tren - 8) - 68) + 'px'; } // dưới tấm treo RIVAL / SHARED của ray
      if (rong && !this.hai()) { tt.style.top = 'auto'; tt.style.bottom = '8px'; tt.style.maxHeight = '518px'; }
      return r;
    };
  }
  // dải xem ụ: chạm bất kỳ chỗ nào ngoài dải = đóng (không chặn cú chạm — bàn vẫn chạm/kéo/ghép bình thường)
  document.addEventListener('pointerdown', (e) => {
    const tt = $('#tt'); if (!tt || tt.hidden || !tt.classList.contains('hb-qi') || tt.contains(e.target)) return;
    if (e.target && e.target.id === 'cv') return; // trên bàn: ui.js tự xử lý (chạm ụ khác = đổi, chạm lại chính nó / ô trống = đóng, kéo = đóng)
    HB.dongHet();
  }, { capture: true });

  // B12: băng trùm gọn — đặt vị trí theo chế độ trước mỗi lần hiện; giữ ngắn hơn
  if (typeof HT !== 'undefined') {
    HT.TRUM.DEN_MS = TVB.DEN_MS;
    const dbGoc = HT.demBao; // báo trước: đếm ngược ở cột phải → dòng dưới chỉ còn "WAVE N"
    HT.demBao = function () { const r = dbGoc.apply(this, arguments); if (this.cbPha === 'bao') { const sp = $('#canh-bao span'), s = 'WAVE ' + this._baoW; if (sp && sp.textContent !== s) sp.textContent = s; } return r; };
    const hGoc = HT.cbHien;
    HT.cbHien = function (b, pha) { TVB.cbDung(b); TVB.cbDat(b); const r = hGoc.apply(this, arguments); b.classList.add('tvb-cb'); const fb = b.querySelector('b'); if (typeof fitText === 'function' && fb) fitText(fb, 20, 14); TVB.cbDem(); return r; };
  }
  // Triệu hồi khi bàn đầy: lý do rõ ràng
  document.addEventListener('click', (e) => {
    const nt = e.target.closest && e.target.closest('#nut-trieu'); if (!nt || !nt.classList.contains('tn-day')) return;
    if (typeof TIENUI !== 'undefined' && !document.querySelector('.tvb-ly')) { TIENUI.bay(TVB.CHU.fullLy, 'tn-bay tn-do tvb-ly'); }
  }, true);
  // B10/B11: nhãn bàn
  if (typeof REN !== 'undefined') { REN.veNhanBan = function (ctx) { TVB.nhan(ctx); }; }
  // §C · ô ghép HỢP LỆ: khung vuông cyan nhịp 4 khung E18 (tv_dich1–4) thay vòng nam châm ở ô CHƯA rê (đúng luật hopLeGhep —
  //       ghepfx.js quyết ô nào); ô đang rê giữ vòng nam châm hút. Chỉ đổi ẢNH vẽ, không đụng logic kéo/ghép của ghepfx.js.
  if (typeof GF !== 'undefined' && GF.khung) {
    const khGoc = GF.khung;
    GF.khung = function (ctx, ten, f, x, y, co, goc, al) {
      if (ten === 'cf_vong_hop' && f < 2) {
        const a = REN.img('tv_dich' + (1 + (Math.floor(performance.now() / 125) % 4)));
        if (a) { const S = co / 1.22 * 0.98; ctx.globalAlpha = Math.min(1, (al || 1) * 1.15); ctx.drawImage(a, x - S / 2, y - S / 2, S, S); ctx.globalAlpha = 1; return; }
      }
      // ghép thành công: vòng rèn cf_vong_ren (6 khung) → chớp nạp cyan-vàng 8 khung E20 (tv_ghep1–8) cùng nhịp 255–470 ms
      if (ten === 'cf_vong_ren') {
        const i = 1 + Math.min(7, Math.floor(f / 5 * 7.99)), a = REN.img('tv_ghep' + i);
        if (a) { ctx.globalAlpha = Math.min(1, al == null ? 1 : al); ctx.drawImage(a, x - co / 2, y - co / 2, co, co); ctx.globalAlpha = 1; return true; }
      }
      return khGoc.apply(this, arguments);
    };
  }
  // §C · ô KHÔNG ghép được (có ụ, khác loại/sao): tấm gạch chéo graphite mờ E19 (tv_khong) — không đỏ (chỉ đỏ khi thả vào ô cấm)
  if (typeof KG !== 'undefined' && KG.veDuoi) {
    const dGoc = KG.veDuoi;
    KG.veDuoi = function (ctx) {
      const r = dGoc.apply(this, arguments);
      const a = REN.img('tv_khong'), src = this.nguon(); if (!a || !src) return r;
      const B = G.ban[src.ban]; if (!B || B.t[src.o] !== src) return r;
      const S = Math.min(B.cw, B.ch) * 0.9;
      ctx.globalAlpha = 0.42;
      for (let i = 0; i < 15; i++) { const N = B.t[i]; if (!N || N === src || hopLeGhep(src, N)) continue; const c = B.o[i]; ctx.drawImage(a, c.x - S / 2, c.y - S / 2, S, S); }
      ctx.globalAlpha = 1;
      return r;
    };
  }
  // §C · thả sai / huỷ: ụ bật về ô cũ → khi chạm ô, chớp thép-xanh nhẹ 4 khung E21 (tv_lui1–4) ở ô gốc (không nổ)
  if (typeof GF !== 'undefined' && GF.veCam) {
    const vcGoc = GF.veCam;
    GF.veCam = function (ctx) {
      const r0 = vcGoc.apply(this, arguments);
      if (!this.ve || !this.ve.length || !REN.img('tv_lui1')) return r0;
      const now = this.now();
      for (const r of this.ve) {
        const dai = this.giam() ? 0.2 : 0.34, u = (now - r.t0) / 1000 / dai; if (u < 0.55 || u >= 1) continue;
        const v = (u - 0.55) / 0.45, a = REN.img('tv_lui' + (1 + Math.min(3, Math.floor(v * 4)))); if (!a) continue;
        const o = r.B.o[r.o], S = this.tile(r.B) * 0.98;
        ctx.globalAlpha = 0.75 * (1 - v * 0.6); ctx.drawImage(a, o.x - S / 2, o.y - S / 2, S, S); ctx.globalAlpha = 1;
      }
      return r0;
    };
  }
  // §C · nhấc ụ khi kéo: bóng nhấc E17 (tv_keo_bong — bóng mềm + 4 góc cyan) thay bóng de_chung nhuộm tối trong lớp cầm (ghepfx.js veCam)
  if (typeof REN !== 'undefined' && REN.veKeo && REN.co) {
    const kGoc = REN.veKeo, coGoc = REN.co;
    REN.veKeo = function (ctx) {
      const a = this.img('tv_keo_bong'); if (!a) return kGoc.apply(this, arguments);
      this.co = function (ten, px, kieu) { return ten === 'de_chung' && kieu === 'den' ? a : coGoc.apply(this, arguments); };
      try { return kGoc.apply(this, arguments); } finally { this.co = coGoc; }
    };
  }
})();
window.TVB = TVB;
