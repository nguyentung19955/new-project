// TURRET MERGE — HUD v2 (docs/demo-hop-tuong/thap-art/TU-VAN-HUD.txt). Ảnh: thap/assets/h2_*.png + S10/S11 (tools/thap-cat-hud2.py).
// Chỉ bọc (wrap) hàm có sẵn — không sửa luật chơi. Ảnh DOM bật bằng lớp html.co-hud2 / html.co-s10 khi tải xong; thiếu ảnh → HUD cũ.
//  · 01 Summon 4 trạng thái: chờ / 1 nhịp sáng khi vừa đủ mana (false→true) / nhấn (≥110 ms) / tắt; chạm khi thiếu → lắc 100 ms + giá đỏ.
//  · 03 tấm LV, tấm đếm (icon chồng), ô giá có ngọc · 09 icon vai trò · 12 góc sáng 1 lần khi vừa đủ mana, tia vàng khi nâng cấp.
//  · 04 ray trên (WAVE · BOSS IN N · tim) · 05 LCD mana · 07 huy hiệu sao số to · 08 giá đồng đội · 10 phím tốc độ/tạm dừng
//  · 11 lõi 3 trạng thái + chớp đỏ khi trúng · 13 VFX cổng triệu hồi / tia ghép gắn đúng ô (giới hạn số lượng, tôn trọng reduced-motion)
//  · S11 3 tim = 3 khúc năng lượng trên vòng chân lõi (vẽ trong js/corehud.js, ảnh loi_vong_*).
'use strict';
const HUD2 = {
  ANH_DOM: ['h2_rail', 'h2_lcd', 'h2_ngoc', 'h2_trieu_cho', 'h2_trieu_san', 'h2_trieu_an', 'h2_trieu_tat', 'h2_phim_dung_cho', 'h2_phim_dung_an', 'h2_phim_toc_cho', 'h2_phim_toc_an',
    'h2_tag', 'h2_ic_chong', 'h2_chip', 'h2_chip_tat', 'h2_ic_tim', 'seg_sang', 'seg_trum', 'loi_khuc_day', 'h2_khay_doi', 'h2_den_doi', 'h2_thanh', 'h2_tam_mong'],
  ANH_S10: ['nut_lon_thep', 'nut_lon_vang', 'nut_lon_xanh', 'nut_nho', 'khung_chon', 'nut_cong', 'khung_tt', 'ic_lui', 'ic_phat', 'h2_phim_dung_cho'],
  ANH_CV: ['hh_sao1', 'hh_sao2', 'hh_sao3', 'hh_sao4', 'hh_sao5', 'hh_sao6', 'hh_sao7', 'h2_sao', 'h2_sao_sang', 'h2_loi_0', 'h2_loi_1', 'h2_loi_2', 'h2_loi_chop', 'loi_vong_trai_sang', 'loi_vong_giua_sang', 'loi_vong_phai_sang', 'loi_vong_trai_tat', 'loi_vong_giua_tat', 'loi_vong_phai_tat', 'loi_vong_no', 'nhan_kn'],
  VAI: { tc: 'h2_vai_tc', ht: 'h2_vai_ht', db: 'h2_vai_db' },
  bat: false, giam: false, _du: null, _theDu: {}, _tim: -1, _vfx: 0,

  tai(ds, lop) {
    let n = 0; const xong = () => { if (++n === ds.length) { document.documentElement.classList.add(lop); if (lop === 'co-hud2') { this.bat = true; if (typeof DP !== 'undefined' && DP.el && !DP.el.hidden) DP.ve(); } } };
    for (const s of ds) { const im = new Image(); im.onload = xong; im.src = (typeof anhUrl === 'function' ? anhUrl(s) : 'assets/' + s + '.png'); }
  },

  // ---------- sau khi vào trận: gắn phần tử phụ (tấm đếm, icon vai trò, phần đầy rãnh tiến độ) ----------
  vaoTran() {
    this._du = null; this._theDu = {}; this._tim = -1;
    document.querySelectorAll('#bo-the .the').forEach(d => {
      const sk = SKILLS[d.dataset.id], ic = d.querySelector('.ic');
      if (ic && sk && this.VAI[sk.vai]) { ic.src = (typeof anhUrl === 'function' ? anhUrl(this.VAI[sk.vai]) : 'assets/' + this.VAI[sk.vai] + '.png'); ic.classList.add('h2-vai'); ic.alt = (TEXT.ui.role && TEXT.ui.role[sk.vai]) || ''; }
    });
    const seg = $('#tb-seg'); if (seg && !seg.querySelector('.h2-day')) { const f = document.createElement('i'); f.className = 'h2-day'; seg.appendChild(f); }
    const nt = $('#nut-tocdo'); if (nt) nt.dataset.x = G.tocDo + '×';
  },

  // ---------- mỗi lần UI.capNhat (30/s): chỉ ghi DOM khi đổi ----------
  capNhat() {
    const B = G.ban[0]; if (!B) return;
    const nt = $('#nut-trieu'), du = nt.classList.contains('du');
    if (this._du === false && du) { nt.classList.add('h2-san'); clearTimeout(this._san); this._san = setTimeout(() => nt.classList.remove('h2-san'), 420); } // 1 nhịp, không lặp
    if (!du) nt.classList.remove('h2-san');
    this._du = du;
    document.querySelectorAll('#bo-the .the').forEach(d => {
      const id = d.dataset.id;
      // số ụ loại này trên bàn: js/demkn.js (.dem-u, icon chồng ụ PNG + số, không nhầm với sao)
      this.vuaThe(d);
      const duT = d.classList.contains('du');
      if (this._theDu[id] === false && duT) this.motLan(d, 'h2-glint', 900); // vừa đủ mana nâng cấp: góc sáng 1 lần
      this._theDu[id] = duT;
    });
    this.vuaSo();
    // ray trên: ≤3 wave tới trùm = hổ phách; wave trùm / trùm đang chạy = đỏ; phần đầy rãnh = tiến độ tới trùm
    const top = $('#top'), w = Math.max(1, G.wave), chuKy = LUAT.songTrum, vt = ((w - 1) % chuKy) + 1, con = chuKy - (w % chuKy);
    const trum = G.quai.some(e => e.trum && !e.chet);
    const k = (trum || con === chuKy ? 'trum' : con <= 3 ? 'gan' : '');
    if (top._k !== k) { top._k = k; top.classList.toggle('trum', k === 'trum'); top.classList.toggle('gan', k === 'gan'); }
    const f = top.querySelector('.h2-day'), pc = Math.round(vt / chuKy * 100) + '%';
    if (f && f._w !== pc) { f._w = pc; f.style.width = pc; }
    // phím tốc độ: nhãn chữ + phím sáng khi > 1×
    const tk = $('#nut-tocdo'); if (tk) { const x = G.tocDo + '×'; if (tk.dataset.x !== x) { tk.dataset.x = x; tk.classList.toggle('nhanh', G.tocDo > 1); } }
    // tim vừa mất: đèn đó nảy (cùng nhịp với lõi)
    if (B.tim < this._tim) { const ds = document.querySelectorAll('#tb-tim .den.mat'); const e = ds[0]; if (e) this.motLan2(e, 'vua-mat', 450); }
    this._tim = B.tim;
  },
  // ---------- CHỮ SỐ DÀI (LV 10/40/99, đếm 12/15, giá 1000/10000): mỗi nhãn 1 ô riêng trong ô cửa sổ khung, tự thu nhỏ chữ ----------
  // đo bằng canvas (chỉ khi chữ ĐỔI) → cỡ chữ = min(cỡ chuẩn, vừa bề rộng ô), không nhỏ hơn cỡ tối thiểu đọc được
  _do: null,
  vua(el, maxW, fMax, fMin) {
    if (!el) return;
    const t = el.textContent, k = t + '|' + maxW + '|' + fMax;
    if (el._vk === k) return; el._vk = k;
    if (!t) { el.style.fontSize = ''; return; }
    const cs = getComputedStyle(el), c = this._do || (this._do = document.createElement('canvas').getContext('2d'));
    c.font = cs.fontWeight + ' ' + fMax + 'px ' + cs.fontFamily;
    const w = c.measureText(t).width + (parseFloat(cs.letterSpacing) || 0) * t.length;
    const f = w > maxW ? Math.max(fMin, Math.floor(fMax * maxW / w * 4) / 4) : fMax;
    el.style.fontSize = f + 'px';
  },
  vuaThe(d) {
    const W = d.offsetWidth * 0.688 - 2; // bề rộng ô cửa sổ khung (x 15.6–84.4 %)
    this.vua(d._lv || (d._lv = d.querySelector('.lv')), W - 8, 8.5, 6.5);
    const g = d._g || (d._g = d.querySelector('.gia b'));
    if (g) this.vua(g, 50 * 0.56 - 1, 11, 7.5); // cửa số của ô giá: x 34–90 % (ảnh h2_chip)
  },
  vuaSo() {
    const m = $('#mana'); if (m) this.vua(m, Math.max(40, m.clientWidth - 13), 25, 14);
    this.vua($('#gia-trieu'), 33, 14, 9);
    const mv = document.querySelector('#the-mv .mv-gia b'); if (mv) this.vua(mv, 58 * 0.56 - 1, 12.5, 8);
  },
  vuaNhan() { document.querySelectorAll('#bo-the .the').forEach(d => this.vuaThe(d)); this.vuaSo(); },
  motLan(the, lop, ms) { const e = document.createElement('i'); e.className = lop; the.appendChild(e); setTimeout(() => e.remove(), ms); },
  motLan2(el, lop, ms) { el.classList.remove(lop); void el.offsetWidth; el.classList.add(lop); setTimeout(() => el.classList.remove(lop), ms); },

  // ---------- VFX gắn ô (DOM trong #wrap, cùng hệ toạ độ logic với canvas) ----------
  vfx(lop, x, y, w, h, ms, tre) {
    if (!this.bat || this._vfx >= 6 || document.hidden) return; // giới hạn 6 hiệu ứng cùng lúc, không chạy khi ẩn tab
    const di = () => {
      this._vfx++;
      const e = document.createElement('i'); e.className = 'h2-vfx ' + lop;
      e.style.left = Math.round(x - w / 2) + 'px'; e.style.top = Math.round(y - h / 2) + 'px';
      $('#wrap').appendChild(e);
      setTimeout(() => { e.remove(); this._vfx--; }, ms);
    };
    if (tre) setTimeout(di, tre); else di();
  },
  cong(B, T) { const c = B && T && B.o[T.o]; if (c) this.vfx('cong', c.x, c.y, 66, 64, 360); },
  ghep(B2, b) { const c = B2 && b && B2.o[b.o]; if (c) this.vfx('ghep', c.x, c.y, 70, 63, 260, Math.round(((typeof VX !== 'undefined' && VX.TRE_LO) || 0.35) * 1000 / Math.max(1, Math.sqrt(G.tocDo || 1)))); },
};

(() => {
  // khởi động nhanh: ảnh HUD trận + nút S10 tải SAU khi HOME hiện (TAI.sauHome) — không giành băng thông với HOME
  const lam = (f) => (typeof TAI !== 'undefined' && TAI.sauHome ? TAI.sauHome(f) : f());
  lam(() => { HUD2.tai(HUD2.ANH_DOM, 'co-hud2'); HUD2.tai(HUD2.ANH_S10, 'co-s10'); });
  if (typeof REN !== 'undefined') { for (const t of HUD2.ANH_CV) { REN.CO_DINH.add(t); try { REN.img(t); } catch (e) { } } }
  if (typeof UI === 'undefined') return;

  const vaoGoc = UI.vaoTran;
  UI.vaoTran = function () { const r = vaoGoc.apply(this, arguments); try { HUD2.vaoTran(); } catch (e) { console.error('HUD2', e); } return r; };
  const capGoc = UI.capNhat;
  UI.capNhat = function () { const r = capGoc.apply(this, arguments); try { HUD2.capNhat(); } catch (e) { console.error('HUD2', e); } return r; };

  // nhấn Summon: chỉ LÚN (ảnh h2_trieu_an, hoặc dí xuống 2–3 px khi thiếu mana/bàn đầy) ~90 ms — KHÔNG lắc/rung (yêu cầu người chơi)
  const nt = $('#nut-trieu');
  if (nt) {
    let t0 = 0;
    nt.addEventListener('pointerdown', () => { t0 = performance.now(); });
    nt.addEventListener('pointerup', () => { const con = 90 - (performance.now() - t0); if (con > 0) { nt.classList.add('an'); setTimeout(() => nt.classList.remove('an'), con); } });
  }
  // thẻ: chạm khi chưa đủ mana → chỉ lún (CSS :active), không lắc

  // luật chơi có sẵn → thêm hiệu ứng theo SỰ KIỆN THẬT
  if (typeof nangCap === 'function') {
    const g = nangCap;
    nangCap = function (B, id) {
      const ok = g.apply(this, arguments);
      if (ok && B === G.ban[0] && HUD2.bat) {
        const d = document.querySelector('#bo-the .the[data-id="' + id + '"]');
        if (d) { HUD2.motLan(d, 'h2-burst', 460); const lv = d.querySelector('.lv'); if (lv) HUD2.motLan2(lv, 'h2-pop', 160); }
      }
      return ok;
    };
  }
  if (typeof trieu === 'function') {
    const g = trieu;
    trieu = function (B) { const T = g.apply(this, arguments); if (T) HUD2.cong(B, T); return T; };
  }
  if (typeof ghep === 'function') {
    const g = ghep;
    ghep = function (B, a, b) { const r = g.apply(this, arguments); if (r) HUD2.ghep(G.ban[b.ban], b); return r; };
  }

  // 08 · giá đồng đội: đèn trạng thái + nhãn Ally/Rival trên tấm chữ; đặt sát trên bàn phía trên (dưới ray trạng thái)
  if (typeof DP !== 'undefined') {
    const veGoc = DP.ve;
    DP.ve = function () {
      const r = veGoc.apply(this, arguments);
      const el = this.el, B = G.ban[1];
      if (HUD2.bat && el && !el.hidden && B) {
        const pvp = G.che === 'pvp';
        el.insertAdjacentHTML('beforeend', '<i class="h2-den"></i>');
        el.style.top = Math.round(B.y - 44) + 'px';
      }
      return r;
    };
  }

  // 07 · huy hiệu cấp sao: tấm khiên thép (ảnh) + SỐ to (chữ canvas); 7★ dùng bản viền sáng
  if (typeof REN !== 'undefined') {
    const hhGoc = REN.huyHieu;
    REN.huyHieu = function (n, d) {
      // 08/11 (người dùng): huy hiệu = SỐ NGÔI SAO (hh_sao1…6: 1–4 một hàng, 5 = 3+2, 6 = 3+3) · 7★ = 1 sao đỏ to (hh_sao7). Chưa tải → khiên số cũ (dự phòng)
      const sa = this.img('hh_sao' + Math.max(1, Math.min(7, n | 0)));
      if (sa) {
        const E = 1.7, k = this.s * this.dpr, N = Math.max(8, Math.round(d * E * k)), key = 'hh5|' + n + '|' + N;
        let c = this.cGet(key); if (c) return c;
        c = document.createElement('canvas'); c.width = c.height = N;
        const x = this.c2d(c), q = N / (d * E), mw = d * 1.66 * q, mh = d * (n >= 7 ? 1.2 : n === 1 ? 0.95 : n <= 4 ? 0.62 : 1.0) * q;
        const sc = Math.min(mw / sa.width, mh / sa.height), w = sa.width * sc, h = sa.height * sc;
        this.veNho(x, sa, 0, 0, sa.width, sa.height, Math.round(N / 2 - w / 2), Math.round(N / 2 - h / 2), Math.round(w), Math.round(h));
        return this.cSet(key, c);
      }
      const anh = this.img(n >= 7 ? 'h2_sao_sang' : 'h2_sao');
      if (!anh) return hhGoc.apply(this, arguments);
      // P0-04: SAO TRÊN BÀN = khiên to cùng cỡ mọi cấp (7★ chỉ thêm viền sáng ngoài), số to; ô vẽ 1.7d (REN.veHuyHieu bên dưới)
      const E = 1.7, k = this.s * this.dpr, N = Math.max(8, Math.round(d * E * k)), key = 'hh4|' + n + '|' + N;
      let c = this.cGet(key); if (c) return c;
      c = document.createElement('canvas'); c.width = c.height = N;
      const x = this.c2d(c), q = N / (d * E);
      const w = d * (n >= 7 ? 1.6 : 1.35) * q, h = w * anh.height / anh.width;
      this.veNho(x, anh, 0, 0, anh.width, anh.height, Math.round(N / 2 - w / 2), Math.round(N / 2 - h / 2), Math.round(w), Math.round(h));
      x.scale(q, q); x.translate(d * E / 2, d * E / 2);
      let f = Math.round(d * 0.86 * 10) / 10;
      x.font = '800 ' + f + 'px ' + FONT.display;
      const tw = x.measureText(n).width, maxW = d * 0.8; // số 2–3 chữ số: thu nhỏ để nằm gọn trong tấm khiên
      if (tw > maxW) { f = Math.max(d * 0.45, Math.floor(f * maxW / tw * 10) / 10); x.font = '800 ' + f + 'px ' + FONT.display; }
      x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round';
      x.lineWidth = d * 0.15; x.strokeStyle = '#05070a'; x.strokeText(n, 0, d * 0.02);
      x.fillStyle = n >= 7 ? '#ffd25a' : '#ffffff'; x.fillText(n, 0, d * 0.02);
      return this.cSet(key, c);
    };
    const vhGoc = REN.veHuyHieu;
    REN.veHuyHieu = function (ctx, x, y, n, d) { if (!this.img('hh_sao' + Math.max(1, Math.min(7, n | 0))) && !this.img(n >= 7 ? 'h2_sao_sang' : 'h2_sao')) return vhGoc.apply(this, arguments); const c = this.huyHieu(n, d); if (c) ctx.drawImage(c, x - d * 0.85, y - d * 0.85, d * 1.7, d * 1.7); };
  }

  // 11 · lõi: 3 ảnh trạng thái (nguyên / mẻ / nguy) thay vết nứt vẽ code; chớp đỏ = ảnh viền đỏ
  // S11 · 3 tim nằm trên vòng chân lõi: js/corehud.js (CORE.veVong)
  if (typeof CORE !== 'undefined') {
    const nutGoc = CORE.loiNut, doGoc = CORE.loiDo;
    CORE.loiNut = function (ren, px, muc) { return ren.co('h2_loi_' + Math.min(2, muc), px, '') || nutGoc.apply(this, arguments); };
    CORE.loiDo = function (ren, px) { return ren.co('h2_loi_chop', px, '') || doGoc.apply(this, arguments); };
  }
})();
window.HUD2 = HUD2;
