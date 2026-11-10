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
  NEN: { san_tran: 'ha_nen', khay: 'ha_khay', duong_thang: 'ha_duong', duong_goc: 'ha_goc', duong_nga3: 'ha_nga3' }, // ảnh nền canvas cũ → mới (ngã ba co-op: tools/thap-cat-ui4.py)
  // ảnh canvas thay ảnh thép cũ (REN.co): vành cổng sinh quái, lõi pha lê (lõi hư loi_hu1/2 thép cũ → bỏ, mức hư = chớp đỏ + 3 khúc tim)
  CO: { cong: 'ha_cong', loi: 'ha_loi', loi_hu1: null, loi_hu2: null, h2_loi_0: 'ha_loi', h2_loi_1: 'ha_loi', h2_loi_2: 'ha_loi', h2_loi_chop: null }, // null = bỏ ảnh thép (chớp đỏ dựng từ ha_loi — CORE.loiDo)
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
    if (typeof CORE !== 'undefined') { CORE._nut = {}; CORE._do = {}; } // lõi đã dựng bằng ảnh cũ → dựng lại
    if (typeof G !== 'undefined' && G.ban && G.ban.length) { this.vao(); if (typeof REN !== 'undefined') REN.lamNen(); }
  },
  // khung cố định thêm 1 lần: cụm trùm giữa thanh trên + băng báo chiêu
  dung() {
    const g = $('#tb-giua');
    if (g && !$('#ha-thanh')) g.insertAdjacentHTML('beforeend', '<span id="ha-thanh" aria-hidden="true"><i class="f"></i></span><em id="ha-so"></em>');
    const w = $('#wrap');
    if (w && !$('#ha-cb')) {
      const d = document.createElement('div'); d.id = 'ha-cb'; d.hidden = true; d.setAttribute('role', 'status');
      d.innerHTML = '<span class="cb-c"><b></b><small></small></span><em></em>'; w.appendChild(d); // dòng 1 tên chiêu · dòng 2 TÁC DỤNG (cbChu)
    }
  },
  // sau UI.vaoTran: khung bậc cho 5 thẻ + khung chỉ huy (ảnh <img>, đè lên khung cũ đã ẩn bằng CSS)
  vao() {
    if (!this.bat) return;
    this.dung();
    this.boCuc();
    // ảnh canvas mới (ngã ba, cổng, lõi): nạp ngay (không chờ hàng hoãn TAI.hoan của lúc khởi động)
    if (typeof REN !== 'undefined') for (const n of ['ha_nen', 'ha_khay', 'ha_duong', 'ha_goc', 'ha_nga3', 'ha_cong', 'ha_loi']) { const a = REN.anh[n] || REN.taiAnh(n); if (!a.src && !a._cv) a.src = this.a(n); }
    document.querySelectorAll('#bo-the .the').forEach(d => {
      const r = G.rosterMap[d.dataset.id], bac = r && TIER_LIST.includes(r.bac) ? r.bac : 'trang';
      let k = d.querySelector('img.ha-kh');
      if (!k) { k = document.createElement('img'); k.className = 'ha-kh'; k.alt = ''; k.draggable = false; d.appendChild(k); }
      k.src = this.a('ha_khung_' + bac); d.dataset.hab = bac;
    });
    // chỉ huy: khung theo BẬC chỉ huy (mvBac, như thẻ ụ nhưng to hơn) + vương miện o_mien (giữ của HUD cũ) ở vòng góc trên-phải
    const te = $('#the-mv'), B = G.ban[0];
    if (te && B && B.mv) {
      let k = te.querySelector('img.ha-kh');
      if (!k) { k = document.createElement('img'); k.className = 'ha-kh'; k.alt = ''; k.draggable = false; te.appendChild(k); }
      const bm = typeof mvBac === 'function' ? mvBac(B.mv.id) : 'vang';
      k.src = this.a('ha_khung_' + bm); te.dataset.hab = bm;
    }
    this._k = {}; this.capNhat();
  },
  // BỐ CỤC 2 BÀN gọn kiểu DCDW (người dùng 09/11 17:48: "gọn gàng … không bị hình nọ đè hình kia"):
  //  PVP: dải bộ bài đối thủ + tim đối thủ ở trên (cạnh lõi đối thủ) · thanh mảnh ĐỢT/TRÙM giữa 2 làn ngang · tim mình dưới bàn mình
  //  (cạnh lõi mình). CO-OP: thanh trên giữ nguyên (tim chung), dải bộ bài đồng đội dưới thanh. Bỏ mọi nhãn BẠN/ĐỐI THỦ/ĐỒNG ĐỘI/CHUNG/VS.
  //  Toạ độ lấy từ bố cục thật (data.js boCuc) → biến CSS trên #wrap (khung 430×860).
  boCuc() {
    const w = $('#wrap'); if (!w || !G.ban.length) return;
    for (const c of ['solo', 'coop', 'pvp']) w.classList.toggle('ha-' + c, G.che === c);
    const B0 = G.ban[0], B1 = G.ban[1], v = (k, n) => w.style.setProperty(k, Math.round(n) + 'px');
    if (G.che === 'pvp' && B1) {
      const yb = B1.y + B1.h + BC_PVP.g, yt = B0.y - BC_PVP.g;          // 2 làn ngang giữa
      v('--ha-thanh-y', (yb + yt) / 2 - 14);                              // thanh mảnh 28 px giữa 2 mép làn
      v('--ha-tim2-y', B1.y - 41);                                        // tim đối thủ: cuối dải bộ bài đối thủ (♥ mình nằm trong thanh giữa)
      v('--ha-doi-y', B1.y - 50);                                         // dải bộ bài đối thủ
    }
    // thẻ chỉ huy: nhãn chữ "SKILL" (vi: CHIÊU) — thẻ thứ 6 có vương miện là kỹ năng chỉ huy
    const te = $('#the-mv');
    if (te && !te.querySelector('.ha-cmd')) { const s = document.createElement('span'); s.className = 'ha-cmd'; s.textContent = 'SKILL'; te.appendChild(s); }
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
      this.dat($('#wrap'), '.ha-cb-on', hien && G.ban.length > 1);
      if (hien) {
        const c = this.cbChu(E, T, B);
        this.dat(cb.querySelector('b'), 'text', c[0]);
        this.dat(cb.querySelector('small'), 'text', c[1]);
        this.dat(cb.querySelector('em'), 'text', c[2] != null && c[2] < 100 ? Math.max(0, Math.ceil(c[2])) + 's' : '');
        this.dat(cb, '.dang', c[3]);
        this.dat(cb, '.td', !!c[1]);
        if (cb._b !== B.y + '|' + G.che) { cb._b = B.y + '|' + G.che; this.datCb(cb, B); }
      }
    }
    // --- vòng góc trên-phải khung thẻ: CẤP POWER-UP trong trận 1…4 (trước để trống ở cấp 1 → trông như huy hiệu rỗng); MAX vẫn đọc ở dải giá
    for (const d of document.querySelectorAll('#bo-the .the')) { const e = d._lv || d.querySelector('.lv'), lv = B.lv[d.dataset.id] || 1; if (e) { const t = lv >= 5 ? '' : String(lv); if (e.textContent !== t) e.textContent = t; } }
    // --- nút tạm dừng / tốc độ: trạng thái bật rõ
    const nd = $('#nut-tocdo + .nut-nho') || document.querySelector('#duoi [data-act="dung"]');
    this.dat(nd, '.bat', !!G.dung);
    this.dat($('#nut-tocdo'), '.bat', (G.tocDo || 1) > 1);
  },
  // nội dung băng chiêu trùm: [tên chiêu, TÁC DỤNG ngắn, giây đếm ngược (null = ẩn), đang báo?] — chữ gốc EN, NN dịch VI (ngonngu-vi.js)
  //  (người dùng 10/11: "KHIÊN LĂNG KÍNH 1s/2s" chỉ có tên, số nhảy 2→1→2 vô nghĩa vì Prism/Twin Core không có chiêu định kỳ — game.js thử lại mỗi 2 s)
  cbChu(E, T, B) {
    const dang = !!E.bao, con = dang ? Math.max(0, E.bao.song - E.bao.t) : E.knT, K = E.khien;
    const td = (typeof VT !== 'undefined' && VT.NGUY && VT.NGUY[E.trum]) || '';
    if (K && K.can) { // PRISM WARDEN: khiên −90% sát thương tới khi trúng đủ N LOẠI ụ khác nhau; vỡ → ~8 s sau dựng lại
      const pt = Math.round((1 - TRM.PRISM_GIAM) * 100);
      if (dang) return ['PRISM SHIELD: −' + pt + '% DMG', 'Shield coming back!', con, true];
      if (K.on) return ['PRISM SHIELD: −' + pt + '% DMG', 'Hit with ' + K.can + ' different turret types to break · ' + K.ds.size + '/' + K.can, null, false];
      return ['SHIELD BROKEN: FULL DMG', 'Shield returns in', Math.max(0, E.knT + 1.4 - 0.05), false];
    }
    if (E.trum === 'twin_core') return [T.kn, td, null, false]; // bị động (tách khi chết) — không có nhịp chiêu
    if (E.trum === 'leech' && !dang && B && !B.t.some(U => U && U.sao >= 2)) return [T.kn, td, null, false]; // chưa có ụ 2★ để cướp: không đếm
    return [T.kn, td, con, dang];
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
    // 2 bàn (09/11): băng THAY CHỖ thanh đợt/trùm trong lúc hiện (thanh ẩn — html .ha-cb-on) → không chồng bàn/đường/dải bộ bài
    else if (G.che === 'pvp' && G.ban[1]) { y = parseFloat($('#wrap').style.getPropertyValue('--ha-thanh-y')) - 4 || 300; hep = false; }
    else { y = 12; hep = false; }
    cb.style.top = y + 'px';
    cb.classList.toggle('hep', hep); cb.classList.toggle('vs', false);
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
  if (dsGoc) UI.dsTran = function () { const ds = dsGoc.apply(this, arguments); if (HA.bat) ds.push('ha_nen', 'ha_khay', 'ha_duong', 'ha_goc', 'ha_mana', 'ha_nga3', 'ha_cong', 'ha_loi'); return ds; };

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
    REN.taiAnh = function (ten) { const a = taiGoc.apply(this, arguments); if (/^ha_(nen|khay|duong|goc|nga3)$/.test(ten)) a.addEventListener('load', () => { if (this._choNen && G.ban.length) this.lamNen(); }); return a; };
    // cổng / lõi: REN.co('cong'|'loi') → ảnh Royal Twilight (đã tải); chưa tải / lỗi → ảnh cũ. Lõi hư thép cũ (loi_hu1/2) bỏ khi có lõi mới.
    for (const k in HA.CO) if (HA.CO[k]) REN.CO_DINH.add(HA.CO[k]);
    const coGoc = REN.co;
    REN.co = function (ten, px, bien) {
      if (HA.bat && ten in HA.CO) {
        const m = HA.CO[ten];
        if (this.img(m || 'ha_loi')) { if (!m) return null; return coGoc.call(this, m, px, bien); }
      }
      return coGoc.apply(this, arguments);
    };
    // CHIỀU SÂU 3D (người dùng 09/11 17:50 "hud này cho cảm giác 3D"): ánh sáng trên-trái → bóng đổ xuống-phải.
    //  Khay: mặt bên dày = chính ảnh khay tối lại, lệch xuống 5 px + bóng mềm (bóng của chính ảnh, mờ) — không vẽ hình code.
    //  Đường: cả lớp đường đổ bóng mềm xuống dưới 1 lần (lp đã ghép) → đường nổi khỏi nền, có thành.
    REN.bongKhay = function (x, kh, B) {
      if (!HA.bat) return;
      x.save();
      x.shadowColor = 'rgba(3,5,18,.7)'; x.shadowBlur = 14 * this.s * this.dpr; x.shadowOffsetY = 8 * this.s * this.dpr;
      x.filter = 'brightness(.38) saturate(.8)';
      try { x.drawImage(kh, B.x + 1, B.y + 5, B.w - 2, B.h); } catch (e) { }
      x.restore();
    };
    REN.bongDuong = function (x, lp, k) {
      if (!HA.bat) return;
      x.save(); x.shadowColor = 'rgba(3,5,18,.65)'; x.shadowBlur = 8 * k; x.shadowOffsetY = 4 * k; x.globalAlpha = 1;
      x.filter = 'brightness(.3)'; x.drawImage(lp, 0, 2 * k); x.restore();
    };
    // icon mana trên số bay +mana: tinh thể teal
    // nhãn bàn ĐỐI THỦ / ĐỒNG ĐỘI / BẠN (tvb.js, render.js veNhanBan — cắt 3 mảnh): tấm thép có đèn → tấm indigo viền vàng
    REN.CO_DINH.add('ha_o_rong');
    const imgGoc = REN.img;
    REN.img = function (ten) { if (ten === 'hud_ten_ban' && HA.bat) { const a = imgGoc.call(this, 'ha_o_rong'); if (a) return a; } return imgGoc.apply(this, arguments); };
    const agGoc = REN.anhGiua;
    REN.anhGiua = function (ctx, ten) { if (ten === 'ui_mana' && HA.bat && this.img('ha_mana')) { const a = [].slice.call(arguments); a[1] = 'ha_mana'; return agGoc.apply(this, a); } return agGoc.apply(this, arguments); };
  }
  // 3 khúc tim trên vòng chân lõi (loi_vong_* thép) — lõi pha lê mới không có vòng đó; tim đã có số ♥ N/3 ở HUD → bỏ khi HUD anime
  if (typeof CORE !== 'undefined' && CORE.veVong) { const vvGoc = CORE.veVong; CORE.veVong = function () { if (HA.bat && REN.img('ha_loi')) return; return vvGoc.apply(this, arguments); }; }
  // nhãn bàn BẠN / ĐỐI THỦ / ĐỒNG ĐỘI trên canvas (tvb.js) — người dùng 09/11: "không cần ô bạn đối thủ hay ally" → bỏ ở HUD anime
  if (typeof TVB !== 'undefined' && TVB.nhan) { const nhGoc = TVB.nhan; TVB.nhan = function () { if (HA.bat) return; return nhGoc.apply(this, arguments); }; }
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
