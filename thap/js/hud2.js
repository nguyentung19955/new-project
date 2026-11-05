// TURRET MERGE — HUD v2 (docs/demo-hop-tuong/thap-art/TU-VAN-HUD.txt). Ảnh: thap/assets/h2_*.png + S10/S11 (tools/thap-cat-hud2.py).
// Chỉ bọc (wrap) hàm có sẵn — không sửa luật chơi. Ảnh DOM bật bằng lớp html.co-hud2 / html.co-s10 khi tải xong; thiếu ảnh → HUD cũ.
//  · 01 Summon 4 trạng thái: chờ / 1 nhịp sáng khi vừa đủ mana (false→true) / nhấn (≥110 ms) / tắt; chạm khi thiếu → lắc 100 ms + giá đỏ.
//  · 03 tấm LV, tấm đếm (icon chồng), ô giá có ngọc · 09 icon vai trò · 12 góc sáng 1 lần khi vừa đủ mana, tia vàng khi nâng cấp.
//  · 04 ray trên (WAVE · BOSS IN N · tim) · 05 LCD mana · 07 huy hiệu sao số to · 08 giá đồng đội · 10 phím tốc độ/tạm dừng
//  · 11 lõi 3 trạng thái + chớp đỏ khi trúng · 13 VFX cổng triệu hồi / tia ghép gắn đúng ô (giới hạn số lượng, tôn trọng reduced-motion)
//  · S11 thanh 3 khúc trên lõi (khung + khúc đầy/rỗng).
'use strict';
const HUD2 = {
  ANH_DOM: ['h2_rail', 'h2_lcd', 'h2_ngoc', 'h2_trieu_cho', 'h2_trieu_san', 'h2_trieu_an', 'h2_trieu_tat', 'h2_phim_dung_cho', 'h2_phim_dung_an', 'h2_phim_toc_cho', 'h2_phim_toc_an',
    'h2_tag', 'h2_ic_chong', 'h2_chip', 'h2_chip_tat', 'h2_ic_tim', 'seg_sang', 'seg_trum', 'loi_khuc_day', 'h2_khay_doi', 'h2_den_doi', 'h2_thanh', 'h2_tam_mong'],
  ANH_S10: ['nut_lon_thep', 'nut_lon_vang', 'nut_lon_xanh', 'nut_nho', 'khung_chon', 'nut_cong', 'khung_tt', 'ic_lui', 'ic_phat', 'h2_phim_dung_cho'],
  ANH_CV: ['h2_sao', 'h2_sao_sang', 'h2_loi_0', 'h2_loi_1', 'h2_loi_2', 'h2_loi_chop', 'loi_thanh_khung', 'loi_khuc_day', 'loi_khuc_rong', 'nhan_kn'],
  VAI: { tc: 'h2_vai_tc', ht: 'h2_vai_ht', db: 'h2_vai_db' },
  bat: false, giam: false, _du: null, _theDu: {}, _tim: -1, _vfx: 0,

  tai(ds, lop) {
    let n = 0; const xong = () => { if (++n === ds.length) { document.documentElement.classList.add(lop); if (lop === 'co-hud2') { this.bat = true; if (typeof DP !== 'undefined' && DP.el && !DP.el.hidden) DP.ve(); } } };
    for (const s of ds) { const im = new Image(); im.onload = xong; im.src = 'assets/' + s + '.png'; }
  },

  // ---------- sau khi vào trận: gắn phần tử phụ (tấm đếm, icon vai trò, phần đầy rãnh tiến độ) ----------
  vaoTran() {
    this._du = null; this._theDu = {}; this._tim = -1;
    document.querySelectorAll('#bo-the .the').forEach(d => {
      if (!d.querySelector('.h2-so')) { const s = document.createElement('span'); s.className = 'h2-so'; d.appendChild(s); }
      const sk = SKILLS[d.dataset.id], ic = d.querySelector('.ic');
      if (ic && sk && this.VAI[sk.vai]) { ic.src = 'assets/' + this.VAI[sk.vai] + '.png'; ic.classList.add('h2-vai'); ic.alt = (TEXT.ui.role && TEXT.ui.role[sk.vai]) || ''; }
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
      let n = 0; for (const T of B.t) if (T && T.id === id) n++;
      const s = d._h2so || (d._h2so = d.querySelector('.h2-so'));
      if (s && s._n !== n) { s._n = n; s.dataset.n = n; s.textContent = n ? n : ''; }
      const duT = d.classList.contains('du');
      if (this._theDu[id] === false && duT) this.motLan(d, 'h2-glint', 900); // vừa đủ mana nâng cấp: góc sáng 1 lần
      this._theDu[id] = duT;
    });
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
  HUD2.tai(HUD2.ANH_DOM, 'co-hud2');
  HUD2.tai(HUD2.ANH_S10, 'co-s10');
  if (typeof REN !== 'undefined') { for (const t of HUD2.ANH_CV) { REN.CO_DINH.add(t); try { REN.img(t); } catch (e) { } } }
  if (typeof UI === 'undefined') return;

  const vaoGoc = UI.vaoTran;
  UI.vaoTran = function () { const r = vaoGoc.apply(this, arguments); try { HUD2.vaoTran(); } catch (e) { console.error('HUD2', e); } return r; };
  const capGoc = UI.capNhat;
  UI.capNhat = function () { const r = capGoc.apply(this, arguments); try { HUD2.capNhat(); } catch (e) { console.error('HUD2', e); } return r; };

  // nhấn Summon: giữ ảnh "nhấn" ít nhất 110 ms (chạm nhanh vẫn thấy lún); chạm khi thiếu mana → lắc 100 ms + giá đỏ
  const nt = $('#nut-trieu');
  if (nt) {
    let t0 = 0;
    nt.addEventListener('pointerdown', () => { t0 = performance.now(); });
    nt.addEventListener('pointerup', () => { const con = 110 - (performance.now() - t0); if (con > 0) { nt.classList.add('an'); setTimeout(() => nt.classList.remove('an'), con); } });
    nt.addEventListener('click', () => { if (nt.classList.contains('thieu')) HUD2.motLan2(nt, 'h2-lac', 110); });
  }
  // thẻ: chạm khi chưa đủ mana → lắc nhẹ
  document.addEventListener('click', (e) => { const d = e.target.closest && e.target.closest('#bo-the .the.thieu'); if (d) HUD2.motLan2(d, 'h2-lac', 110); });

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
      const anh = this.img(n >= 7 ? 'h2_sao_sang' : 'h2_sao');
      if (!anh) return hhGoc.apply(this, arguments);
      const k = this.s * this.dpr, N = Math.max(8, Math.round(d * 1.5 * k)), key = 'hh3|' + n + '|' + N;
      let c = this.cGet(key); if (c) return c;
      c = document.createElement('canvas'); c.width = c.height = N;
      const x = this.c2d(c), q = N / (d * 1.5);
      const w = d * (n >= 7 ? 1.42 : 1.2) * q, h = w * anh.height / anh.width;
      this.veNho(x, anh, 0, 0, anh.width, anh.height, Math.round(N / 2 - w / 2), Math.round(N / 2 - h / 2), Math.round(w), Math.round(h));
      x.scale(q, q); x.translate(d * 0.75, d * 0.75);
      const f = Math.round(d * 0.74 * 10) / 10;
      x.font = '800 ' + f + 'px ' + FONT.display; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round';
      x.lineWidth = d * 0.13; x.strokeStyle = '#05070a'; x.strokeText(n, 0, d * 0.02);
      x.fillStyle = n >= 7 ? '#ffd25a' : '#fff6df'; x.fillText(n, 0, d * 0.02);
      return this.cSet(key, c);
    };
  }

  // 11 · lõi: 3 ảnh trạng thái (nguyên / mẻ / nguy) thay vết nứt vẽ code; chớp đỏ = ảnh viền đỏ
  // S11 · thanh 3 khúc trên lõi: khung 3 ô + khúc đầy / rỗng (ảnh); khúc vừa mất nhấp nháy rồi rỗng
  if (typeof CORE !== 'undefined') {
    const nutGoc = CORE.loiNut, doGoc = CORE.loiDo, hudGoc = CORE.veHud;
    CORE.loiNut = function (ren, px, muc) { return ren.co('h2_loi_' + Math.min(2, muc), px, '') || nutGoc.apply(this, arguments); };
    CORE.loiDo = function (ren, px) { return ren.co('h2_loi_chop', px, '') || doGoc.apply(this, arguments); };
    CORE.veHud = function (ctx, ren) {
      const fr = ren.img('loi_thanh_khung'), fd = ren.img('loi_khuc_day'), fo = ren.img('loi_khuc_rong');
      if (!fr || !fd || !fo || this.timMax() !== 3 || !G.duong || !G.duong.length) return hudGoc.apply(this, arguments);
      const dt = ren.dt || 0, t = ren.t, xong = new Set();
      for (const p of G.duong) {
        const e = p.pts[p.pts.length - 1], key = e + '';
        if (xong.has(key)) continue; xong.add(key);
        const s = this.lay(key); this.capNhat(s, dt);
        s.xa = Math.max(0, (s.xa || 0) - dt * 1.5);
        if (G.che === 'coop') continue;
        const con = s.hien, cu = Math.max(s.cu, con), sap = con === 1 && !G.ketThuc;
        const bw = 64, bh = 28;
        const rx = s.rung > 0 ? Math.sin(t * 70) * 2.2 * s.rung : 0;
        const cx = Math.max(bw / 2 + 3, Math.min(W - bw / 2 - 3, e[0])) + rx, cy = Math.max(bh / 2 + 3, Math.min(H - bh / 2 - 3, e[1] - 43));
        const x0 = cx - bw / 2, y0 = cy - bh / 2;
        ctx.drawImage(fr, x0, y0, bw, bh);
        const O = [[0.133, 0.359], [0.391, 0.617], [0.641, 0.875]], sy = y0 + bh * 0.179, sh = bh * 0.571;
        for (let i = 0; i < 3; i++) {
          const sx = x0 + bw * O[i][0], sw = bw * (O[i][1] - O[i][0]);
          if (i < con) { ctx.globalAlpha = sap ? 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(t * 6)) : 1; ctx.drawImage(fd, sx, sy, sw, sh); }
          else { ctx.globalAlpha = 1; ctx.drawImage(fo, sx, sy, sw, sh); if (i < cu && s.xa > 0) { ctx.globalAlpha = s.xa * (0.5 + 0.5 * Math.sin(t * 40)); ctx.drawImage(fd, sx, sy, sw, sh); } }
        }
        ctx.globalAlpha = 1;
      }
    };
  }
})();
window.HUD2 = HUD2;
