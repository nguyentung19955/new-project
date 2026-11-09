// TURRET MERGE — HUD TRẬN ANIME "Royal Twilight" (B2, người dùng chốt 09/11 — docs/demo-hop-tuong/tuvan/huong-anime/TU-VAN-CHATGPT.md,
//  BANG-MAU.md). Bỏ phong cách máy móc (thép gỉ, đinh tán, sọc vàng đen) trong TRẬN: thanh trên 3 khoang · nền trời hoàng hôn +
//  mặt bàn sáng tách khỏi nền + đường đá sáng hơn bàn · băng báo chiêu trùm 1 dòng mảnh · đáy: ô mana teal, SUMMON tròn, nút 2×/tạm
//  dừng, khay 5 thẻ với KHUNG BẬC, thẻ chỉ huy có hồi chiêu.
//  · CHỈ ảnh ChatGPT đã cắt (tools/thap-cat-ui2.py → assets/ha_*.png) + chữ/số DOM + cắt/phóng/mờ ảnh (thap/QUY-TAC-HINH.md).
//  · Không đổi luật, không đổi toạ độ gameplay (bàn/ô/đường vẫn theo data.js boCuc/KHAY_COT/KHAY_HANG — ảnh mặt bàn kéo khớp ô thật).
//  · Bật bằng lớp html.ha2 khi MỌI ảnh DOM đã tải; thiếu ảnh / ?ha=0 → HUD cũ y nguyên (đường vẽ dự phòng). Nền canvas: ảnh mới
//    lỗi tải → REN.diu trả về ảnh cũ (san_tran / khay / duong_*).
//  · Số liệu đọc thẳng từ state (G, B, TRUM, MAVUONG) hoặc từ phần tử HUD cũ đã cập nhật (#tb-trum-chu, #mana…) — không số giả.
'use strict';
const HA = {
  DOM: ['ha_top', 'ha_canh', 'ha_trieu', 'ha_o_rong', 'ha_o_vuong', 'ha_mana', 'ha_ic_dung', 'ha_ic_toc', 'ha_mau_trum', 'ha_mau_xanh', 'ha_mau_ranh',
    'ha_khung_trang', 'ha_khung_xanh', 'ha_khung_tim', 'ha_khung_vang', 'ha_khung_do'],
  NEN: { san_tran: 'ha_nen', khay: 'ha_khay', duong_thang: 'ha_duong', duong_goc: 'ha_goc' }, // ảnh nền canvas cũ → mới
  MAU_MANA: '#4FEBD6', // số bay +mana (teal sáng trên nền tối; icon/viền mana #25D6C0)
  bat: false,
  a(n) { return typeof anhUrl === 'function' ? anhUrl(n) : 'assets/' + n + '.png'; },
  tai() {
    if (/[?&]ha=0\b/.test(location.search)) return;
    let n = 0, loi = 0;
    const xong = () => { if (++n < this.DOM.length) return; if (loi) { console.warn('HA: thiếu ảnh HUD anime → giữ HUD cũ'); return; } this.batLen(); };
    for (const s of this.DOM) { const im = new Image(); im.onload = xong; im.onerror = () => { loi++; xong(); }; im.src = this.a(s); }
  },
  batLen() {
    this.bat = true;
    document.documentElement.classList.add('ha2');
    this.dung();
    if (typeof G !== 'undefined' && G.ban && G.ban.length) { this.vao(); if (typeof REN !== 'undefined') REN.lamNen(); }
  },
  // khung cố định thêm 1 lần: cụm trùm giữa thanh trên + băng báo chiêu
  dung() {
    const g = $('#tb-giua');
    if (g && !$('#ha-thanh')) g.insertAdjacentHTML('beforeend', '<span id="ha-thanh" aria-hidden="true"><i class="f"></i></span><em id="ha-so"></em>');
    const w = $('#wrap');
    if (w && !$('#ha-cb')) {
      const d = document.createElement('div'); d.id = 'ha-cb'; d.hidden = true; d.setAttribute('role', 'status');
      d.innerHTML = '<b></b><em></em>'; w.appendChild(d);
    }
  },
  // sau UI.vaoTran: khung bậc cho 5 thẻ + khung chỉ huy (ảnh <img>, đè lên khung cũ đã ẩn bằng CSS)
  vao() {
    if (!this.bat) return;
    this.dung();
    document.querySelectorAll('#bo-the .the').forEach(d => {
      const r = G.rosterMap[d.dataset.id], bac = r && TIER_LIST.includes(r.bac) ? r.bac : 'trang';
      let k = d.querySelector('img.ha-kh');
      if (!k) { k = document.createElement('img'); k.className = 'ha-kh'; k.alt = ''; k.draggable = false; d.appendChild(k); }
      k.src = this.a('ha_khung_' + bac); d.dataset.hab = bac;
    });
    const te = $('#the-mv');
    if (te && !te.querySelector('img.ha-kh')) { const k = document.createElement('img'); k.className = 'ha-kh'; k.alt = ''; k.draggable = false; k.src = this.a('ha_o_vuong'); te.appendChild(k); }
    this._k = {}; this.capNhat();
  },
  dat(el, k, v) { if (!el) return; const c = el._ha || (el._ha = {}); if (c[k] === v) return; c[k] = v; if (k === 'text') el.textContent = v; else if (k === 'hidden') el.hidden = v; else if (k[0] === '.') el.classList.toggle(k.slice(1), v); else el.style.setProperty(k, v); },
  // mỗi lần UI.capNhat (~30/s): chỉ ghi DOM khi đổi
  capNhat() {
    if (!this.bat || !G.ban.length) return;
    const B = G.ban[0];
    // --- cụm trùm (giữa thanh trên): tên/“Trùm sau N” là #tb-trum-chu của HUD cũ; thanh = máu trùm (tím, 10 đoạn) hoặc tiến độ tới trùm (cyan)
    const trum = G.quai.find(e => e.trum && !e.chet && G.duong[e.p] && G.duong[e.p].ban === 0) || G.quai.find(e => e.trum && !e.chet);
    const th = $('#ha-thanh'), so = $('#ha-so');
    if (th) {
      let p, chu = '';
      if (trum) { p = Math.max(0, Math.min(1, trum.hp / trum.max)); chu = Math.max(trum.hp > 0 ? 1 : 0, Math.ceil(p * 100)) + '%'; }
      else {
        const ck = LUAT.songTrum, vt = ((Math.max(1, G.wave) - 1) % ck) + 1;
        p = vt / ck;
        if (typeof HT !== 'undefined' && HT.cbPha === 'bao' && HT._baoN > 0) chu = HT._baoN + 's'; // sắp có trùm: đếm ngược giây
      }
      this.dat(th, '.trum', !!trum);
      this.dat(th.querySelector('.f'), 'width', (Math.round(p * 400) / 4) + '%');
      this.dat(so, 'text', chu); this.dat(so, '.trum', !!trum);
    }
    // --- băng báo chiêu trùm (1 dòng: tên chiêu + đếm ngược tới lần tung chiêu kế) — chỉ trùm trên đường CỦA MÌNH
    const E = G.quai.find(e => e.trum && !e.chet && G.duong[e.p] && G.duong[e.p].ban === 0);
    const cb = $('#ha-cb');
    if (cb) {
      const T = E && TRUM[E.trum], hien = !!(T && !G.ketThuc);
      this.dat(cb, 'hidden', !hien);
      if (hien) {
        this.dat(cb.querySelector('b'), 'text', T.kn);
        const dang = !!E.bao, con = dang ? Math.max(0, E.bao.song - E.bao.t) : E.knT;
        this.dat(cb.querySelector('em'), 'text', con < 100 ? Math.max(0, Math.ceil(con)) + 's' : '');
        this.dat(cb, '.dang', dang);
        if (cb._b !== B.y + '|' + G.che) { cb._b = B.y + '|' + G.che; this.datCb(cb, B); }
      }
    }
    // --- nút tạm dừng / tốc độ: trạng thái bật rõ
    const nd = $('#nut-tocdo + .nut-nho') || document.querySelector('#duoi [data-act="dung"]');
    this.dat(nd, '.bat', !!G.dung);
    this.dat($('#nut-tocdo'), '.bat', (G.tocDo || 1) > 1);
  },
  // vị trí băng: khoảng trống giữa đáy đường của bàn mình và hàng nút đáy; không đủ chỗ (PVP/CO-OP) → ngay dưới thanh trên
  datCb(cb, B) {
    let day = B.y + B.h;
    for (const p of G.duong) if (p.ban === 0) for (const q of p.pts) day = Math.max(day, q[1] + DUONG_RONG / 2);
    const cao = 36, tren = 664; // hàng nút đáy bắt đầu ~664 (vòng SUMMON)
    const du = tren - day >= cao + 8;
    // đủ chỗ (SOLO): giữa khe đường–nút đáy, rộng 330. Không đủ (PVP/CO-OP: bàn mình to ở dưới): ngay dưới thanh trên,
    // thu hẹp sang trái để không chồng tấm tim đối thủ/“chung” (#ht-phu, góc phải) — chỉ đè mép làn bàn đối thủ/đồng đội.
    let y = 60, hep = !du;
    if (du) y = Math.round(day + (tren - day - cao) / 2);
    else if (G.che === 'pvp' && G.ban[1]) { const B1 = G.ban[1]; y = Math.round((B1.y + B1.h + 26 + B.y) / 2 + 4 - cao / 2); hep = false; } // PVP: chỗ chữ VS giữa 2 bàn (VS ẩn tạm)
    cb.style.top = y + 'px';
    cb.classList.toggle('hep', hep); cb.classList.toggle('vs', G.che === 'pvp' && !du);
  },
};

// ---------- gắn vào UI / REN / FX (bọc hàm có sẵn, không sửa luật) ----------
(() => {
  if (typeof UI === 'undefined') return;
  const vaoGoc = UI.vaoTran;
  UI.vaoTran = function () { const r = vaoGoc.apply(this, arguments); try { HA.vao(); } catch (e) { console.error('HA', e); } return r; };
  const capGoc = UI.capNhat;
  UI.capNhat = function () { const r = capGoc.apply(this, arguments); try { HA.capNhat(); } catch (e) { console.error('HA', e); } return r; };
  // nạp trước ảnh nền canvas mới cùng màn tải trận
  const dsGoc = UI.dsTran;
  if (dsGoc) UI.dsTran = function () { const ds = dsGoc.apply(this, arguments); if (HA.bat) ds.push('ha_nen', 'ha_khay', 'ha_duong', 'ha_goc', 'ha_mana'); return ds; };

  if (typeof REN !== 'undefined') {
    for (const k in HA.NEN) REN.CO_DINH.add(HA.NEN[k]);
    REN.CO_DINH.add('ha_mana');
    // nền tĩnh: thay ảnh sàn/khay/đường bằng bản anime (không dịu màu gunmetal); ảnh mới lỗi → ảnh cũ
    const diuGoc = REN.diu;
    REN.diu = function (ten) {
      const m = HA.bat && HA.NEN[ten];
      if (m) { const a = this.anh[m]; if (!(a && a._loi)) return this.img(m); }
      return diuGoc.apply(this, arguments);
    };
    const nenGoc = REN.lamNen0;
    REN.lamNen0 = function () { const r = nenGoc.apply(this, arguments); if (HA.bat) { const k = this.anh.ha_khay; if (k && k._cv) this.thaMip(k._cv); } return r; };
    const taiGoc = REN.taiAnh;
    REN.taiAnh = function (ten) { const a = taiGoc.apply(this, arguments); if (/^ha_(nen|khay|duong|goc)$/.test(ten)) a.addEventListener('load', () => { if (this._choNen && G.ban.length) this.lamNen(); }); return a; };
    // icon mana trên số bay +mana: tinh thể teal
    // nhãn bàn ĐỐI THỦ / ĐỒNG ĐỘI / BẠN (tvb.js, render.js veNhanBan — cắt 3 mảnh): tấm thép có đèn → tấm indigo viền vàng
    REN.CO_DINH.add('ha_o_rong');
    const imgGoc = REN.img;
    REN.img = function (ten) { if (ten === 'hud_ten_ban' && HA.bat) { const a = imgGoc.call(this, 'ha_o_rong'); if (a) return a; } return imgGoc.apply(this, arguments); };
    const agGoc = REN.anhGiua;
    REN.anhGiua = function (ctx, ten) { if (ten === 'ui_mana' && HA.bat && this.img('ha_mana')) { const a = [].slice.call(arguments); a[1] = 'ha_mana'; return agGoc.apply(this, a); } return agGoc.apply(this, arguments); };
  }
  if (typeof FX !== 'undefined' && FX.chu1) {
    const chuGoc = FX.chu1;
    FX.chu1 = function (x, y, s, mau, co, kieu) {
      if (HA.bat && kieu === 'mana' && /^#(d9a8ff|58d9ad)$/i.test(mau)) { const a = [].slice.call(arguments); a[3] = HA.MAU_MANA; return chuGoc.apply(this, a); }
      return chuGoc.apply(this, arguments);
    };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => HA.tai()); else HA.tai();
})();
window.HA = HA;
