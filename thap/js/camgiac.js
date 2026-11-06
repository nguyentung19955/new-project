// TURRET MERGE — CẢM GIÁC CHẠM P1 (docs/demo-hop-tuong/tuvan/vfx/REVIEW-VFX-93.txt §II.A/B/D/F/G/I, §VI A–I, §VII, §VIII, §X P1)
//  Báo cáo + ảnh kiểm: docs/demo-hop-tuong/tuvan/vfx/p1/BAO-CAO.md
//  1) CÀI ĐẶT (sảnh → SETTINGS, localStorage tm_camgiac): EFFECTS Full / Balanced / Minimal (chỉ bớt hạt, dải nổ, khói — KHÔNG đổi
//     sát thương / mục tiêu / nhịp / vùng; đạn lõi, cảnh báo trùm, trạng thái, vòng skill, kết quả ghép vẫn giữ) · REDUCE FLASH
//     (chớp màn ×0,3, rung màn ×0,4, chớp ô ×0,4) · HAPTICS bật/tắt (mọi navigator.vibrate của game đi qua công tắc này).
//  2) THỨ BẬC SỨC NẶNG + TRẦN SÁNG: nhiều dải nổ cùng khung → giảm độ sáng cộng chung; ≥ 2 dải nổ lớn (T4, đường kính ≥ 140)
//     cùng lúc → chỉ dải MỚI NHẤT sáng đủ, các dải khác ×0,55 (render.js gọi CG.kA). Đòn chí mạng có hình riêng (tia sắc nhỏ, T2).
//  3) MỐC SAO 3/5/7: 3★ = 3 tia · 5★ = vòng vàng 5 cung · 7★ = vương miện mảnh + 7 mảnh sao bắn ra lần lượt (ảnh p1_* — chưa có thì
//     dùng ảnh cũ thay tạm: h2_glint / cf_vong_ren / h2_sao_sang).
//  4) POWER-UP: 4 vạch nạp trên thẻ (vạch mới đầy dần theo màu khoá bộ bài) ~0,9 s rồi tắt — không thêm nhãn thường trực (QUY-TAC 7).
//  5) THUA: bàn chơi giảm bão hoà nhẹ trong 0,9 s trước màn kết quả (không nổ dài). Rung tay: ghép (có sẵn), 5★/7★, triệu hồi vàng/đỏ, trùm ra.
//  Chỉ TRÌNH BÀY — không đổi luật, không Math.random (online lockstep), không cấp phát mỗi khung.
'use strict';

const CG = {
  KEY: 'tm_camgiac',
  TXT: { fx: 'EFFECTS', full: 'FULL', can: 'BALANCED', gon: 'MINIMAL', flash: 'REDUCE FLASH', rung: 'HAPTICS', on: 'ON', off: 'OFF' },
  PRESET: { full: { hat: 1, anim: 90, nhe: false }, can: { hat: 0.62, anim: 64, nhe: false }, gon: { hat: 0.3, anim: 40, nhe: true } },
  cfg: null,
  _acc: 0, _t4: null, _nT4: 0, _kTong: 1,
  doc() {
    if (this.cfg) return this.cfg;
    let c = {}; try { c = JSON.parse(localStorage.getItem(this.KEY) || '{}') || {}; } catch (e) { }
    this.cfg = { fx: this.PRESET[c.fx] ? c.fx : 'full', flash: !!c.flash, rung: c.rung !== false };
    return this.cfg;
  },
  luu() { try { localStorage.setItem(this.KEY, JSON.stringify(this.cfg)); } catch (e) { } },
  p() { return this.PRESET[this.doc().fx]; },
  gon() { return this.doc().fx === 'gon'; },
  kFlash() { return this.doc().flash ? 0.4 : 1; },
  apDung() {
    const P = this.p();
    if (typeof FX !== 'undefined') {
      const tk = typeof TKP !== 'undefined' && TKP.on();
      FX.MAX_HAT = Math.round((tk ? 160 : 320) * Math.max(P.hat, 0.35));
      FX.MAX_ANIM = Math.round(P.anim * (tk ? 0.8 : 1));
    }
    this.nhan();
  },
  dat(k, v) { this.doc()[k] = v; this.luu(); this.apDung(); },
  nhan() {
    const c = this.doc(), T = this.TXT;
    document.querySelectorAll('[data-act="cg-fx"]').forEach(e => { e.textContent = T.fx + ': ' + T[c.fx]; });
    document.querySelectorAll('[data-act="cg-flash"]').forEach(e => { e.textContent = T.flash + ': ' + (c.flash ? T.on : T.off); });
    document.querySelectorAll('[data-act="cg-rung"]').forEach(e => { e.textContent = T.rung + ': ' + (c.rung ? T.on : T.off); e.hidden = !CG._coRung; });
  },
  // rung tay ngắn (chỉ bàn của người chơi; máy không hỗ trợ → bỏ qua)
  rung(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) { } },

  // ---------- trần sáng / ưu tiên T4 (gọi 1 lần mỗi khung trước REN.veFx) ----------
  khungFx() {
    let t4 = null, n = 0; const A = FX.anim;
    for (let i = 0; i < A.length; i++) { const a = A[i]; if (!a.mot && a.co >= 140) { n++; if (!t4 || a.t < t4.t) t4 = a; } }
    this._t4 = t4; this._nT4 = n;
    const N = A.length;
    this._kTong = (N <= 24 ? 1 : Math.max(0.55, 1 - (N - 24) / 110)) * (this.doc().flash ? 0.85 : 1);
  },
  kA(a) { let k = this._kTong; if (this._nT4 > 1 && !a.mot && a.co >= 140 && a !== this._t4) k *= 0.55; return k; },

  // ---------- MỐC SAO 3/5/7 ----------
  ds: [], // { T, B, o, t0, n }
  ANH_SAO: ['h2_glint', 'cf_vong_ren', 'h2_sao_sang', 'fx_starup'],
  // ảnh ChatGPT P1 ĐÃ có trong assets/ (CAN-VE-p1.json) — chỉ gọi REN.img cho tên trong danh sách (ảnh thiếu → REN báo lỗi mạng)
  CO_ANH: new Set([]),
  img(t) { return this.CO_ANH.has(t) ? REN.img(t) : null; },
  saoLen(T, n) {
    const B = G.ban[T.ban]; if (!B || B.t[T.o] !== T) return;
    for (let i = this.ds.length - 1; i >= 0; i--) if (this.ds[i].T === T) this.ds.splice(i, 1);
    this.ds.push({ T, B, o: T.o, t0: VX.t, n, dai: n >= 7 ? 0.95 : n >= 5 ? 0.8 : 0.62 });
    const nguoi = B === G.ban[0] && !B.ai;
    try { SND.nang(n >= 7 ? 5 : n >= 5 ? 4 : 3); } catch (e) { }
    if (nguoi) this.rung(n >= 7 ? [16, 40, 16, 40, 24] : n >= 5 ? [14, 40, 14] : 10);
  },
  veSao(ctx) {
    if (!this.ds.length) return;
    const fl = this.kFlash();
    for (let i = this.ds.length - 1; i >= 0; i--) {
      const e = this.ds[i], tt = VX.t - e.t0;
      if (tt > e.dai || !G.ban.includes(e.B) || e.B.t[e.o] !== e.T) { this.ds.splice(i, 1); continue; }
      if (tt < 0) continue;
      const B = e.B, c = B.o[e.o], S = Math.min(B.cw, B.ch) * 0.98, u = tt / e.dai;
      const mo = u < 0.12 ? u / 0.12 : u > 0.7 ? (1 - u) / 0.3 : 1;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      // lõi chớp ngắn (phần sao của fx_starup) — nhỏ ở 3★, to dần
      if (tt < 0.22) { const a = REN.img('fx_starup'); if (a) { const an = VX.matNa('fx_starup', 0.6, 0.76); if (an) VX.khung(ctx, an, Math.min(5.99, tt / 0.22 * 6), c.x, c.y - S * 0.1, S * (0.8 + e.n * 0.06), 0, (1 - tt / 0.22) * 0.8 * fl); } }
      if (e.n >= 7) this.ve7(ctx, e, c, S, tt, u, mo, fl);
      else if (e.n >= 5) this.ve5(ctx, c, S, tt, u, mo, fl);
      else this.ve3(ctx, c, S, tt, u, mo, fl);
      ctx.restore(); ctx.globalAlpha = 1;
    }
  },
  // 3★: 3 tia cách 120°, bung nhanh rồi mảnh dần
  ve3(ctx, c, S, tt, u, mo, fl) {
    const a = CG.img('p1_sao3'), s = 0.5 + 0.7 * VX.eo(u / 0.45);
    if (a) { PX.ve(ctx, a, c.x, c.y, S * 1.5 * s, S * 1.5 * s * a.height / a.width, -0.35 + u * 0.4, mo * fl); return; }
    const g = REN.img('h2_glint'); if (!g) return; // thay tạm: 3 tia lấp lánh kéo dài
    for (let k = 0; k < 3; k++) {
      const ang = -Math.PI / 2 + k * Math.PI * 2 / 3 + u * 0.3, d = S * 0.3 * s;
      ctx.save(); ctx.translate(c.x + Math.cos(ang) * d, c.y + Math.sin(ang) * d); ctx.rotate(ang); ctx.scale(1.9, 0.5);
      PX.ve(ctx, g, 0, 0, S * 0.5, S * 0.5, 0, mo * fl * 0.95); ctx.restore();
    }
  },
  // 5★: vòng vàng 5 cung nở ra + quay chậm
  ve5(ctx, c, S, tt, u, mo, fl) {
    const s = 0.55 + 0.75 * VX.eo(u / 0.5), a = CG.img('p1_sao5');
    if (a) { PX.ve(ctx, a, c.x, c.y, S * 1.45 * s, S * 1.45 * s, u * 1.1, mo * fl); return; }
    const r = REN.img('cf_vong_ren'); if (!r) return;
    VX.khung(ctx, r, Math.min(5.99, u * 6), c.x, c.y, S * 1.5 * s, u * 1.1, mo * fl);
  },
  // 7★: vương miện mảnh + 7 mảnh sao bắn ra lần lượt (mỗi mảnh trễ 45 ms)
  ve7(ctx, e, c, S, tt, u, mo, fl) {
    const a = CG.img('p1_sao7'), s = 0.7 + 0.45 * VX.eo(u / 0.4);
    if (a) PX.ve(ctx, a, c.x, c.y, S * 1.5 * s, S * 1.5 * s, -u * 0.5, mo * fl);
    else { const r = REN.img('cf_vong_ren'); if (r) VX.khung(ctx, r, Math.min(5.99, u * 6), c.x, c.y, S * 1.55 * s, -u * 0.5, mo * fl * 0.9); }
    if (this.gon()) return; // tối giản: chỉ vương miện
    const m = CG.img('p1_manh_sao') || REN.img('h2_sao_sang'); if (!m) return;
    for (let k = 0; k < 7; k++) {
      const v = (tt - 0.08 - k * 0.045) / 0.42; if (v <= 0 || v >= 1) continue;
      const ang = -Math.PI / 2 + k * Math.PI * 2 / 7, d = S * (0.35 + 0.55 * VX.eo(v)), w = S * 0.26 * (1 - 0.35 * v);
      PX.ve(ctx, m, c.x + Math.cos(ang) * d, c.y + Math.sin(ang) * d, w, w, ang + Math.PI / 2, (v < 0.15 ? v / 0.15 : 1 - VX.ei((v - 0.15) / 0.85)) * fl);
    }
  },

  // ---------- POWER-UP: 4 vạch nạp trên thẻ ----------
  _vach: new Map(), // id → { el, cv, t0, lv, mau }
  vachPowerUp(B, id) {
    const d = document.querySelector('#bo-the .the[data-id="' + id + '"]'); if (!d) return;
    const a = CG.img('p1_vach_lv'); if (!a) return; // chưa có ảnh: chỉ còn bùng thẻ + vòng trên ụ (có sẵn)
    let v = this._vach.get(id);
    if (!v || !v.el.isConnected) {
      const cv = document.createElement('canvas'); cv.className = 'cg-vach';
      d.appendChild(cv); v = { el: cv, cv, t0: 0, lv: 1, mau: '#fff' }; this._vach.set(id, v);
    }
    v.t0 = performance.now(); v.lv = B.lv[id]; v.mau = (typeof ND !== 'undefined' && ND.mau) ? (ND.mau(B, id) || '#ffffff') : '#ffffff';
    v.el.classList.add('on');
    if (!this._vachChay) { this._vachChay = true; requestAnimationFrame(this._veVach); }
  },
  _veVach: null,
  veVach() {
    const a = CG.img('p1_vach_lv'); let con = false; const now = performance.now();
    for (const [id, v] of this._vach) {
      const t = now - v.t0; if (!v.el.classList.contains('on')) continue;
      if (t > 1000) { v.el.classList.remove('on'); continue; }
      con = true;
      const cv = v.cv, w = cv.clientWidth, h = cv.clientHeight; if (!w || !h || !a) continue;
      const dpr = Math.min(3, window.devicePixelRatio || 1), W2 = Math.round(w * dpr), H2 = Math.round(h * dpr);
      if (cv.width !== W2 || cv.height !== H2) { cv.width = W2; cv.height = H2; }
      const x = cv.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, W2, H2);
      const fw = a.width / 2, fh = a.height, pw = (W2 - 3 * W2 * 0.06) / 4, ph = Math.min(H2, pw * fh / fw), y0 = (H2 - ph) / 2;
      const day = (CG.CO_ANH.has('p1_vach_lv') && FXU.mau('p1_vach_lv', v.mau)) || a, n = v.lv - 1; // LV2..LV5 = 1..4 vạch
      const u = Math.min(1, Math.max(0, (t - 120) / 380));
      for (let k = 0; k < 4; k++) {
        const px = k * (pw + W2 * 0.06);
        x.globalAlpha = 1; x.drawImage(a, 0, 0, fw, fh, px, y0, pw, ph);
        const f = k < n - 1 ? 1 : k === n - 1 ? u : 0; if (f <= 0) continue;
        x.drawImage(day, fw, 0, fw * f, fh, px, y0, pw * f, ph);
      }
    }
    if (con) requestAnimationFrame(this._veVach); else this._vachChay = false;
  },

  // ---------- CHÍ MẠNG: hình riêng (tia sắc nhỏ T2), trần 1 lần / 0,15 s mỗi ụ ----------
  crit(T, E) {
    if (!E || !T || (T._cgCrit != null && G.t - T._cgCrit < 0.15)) return;
    T._cgCrit = G.t;
    FX.no('laser_trung', E.x, E.y, this.gon() ? 30 : 40, 0.2);
    if (!this.gon()) FX.tiaLua(E.x, E.y, 3, '#ffd080', 170, 8);
  },
};
window.CG = CG;

(() => {
  CG.doc();
  CG._veVach = () => CG.veVach();
  CG._coRung = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
  // HAPTICS: mọi lệnh rung của game qua công tắc (dkkeo / dkcham / ghepfx gọi navigator.vibrate trực tiếp)
  if (CG._coRung) {
    const goc = navigator.vibrate.bind(navigator);
    try { Object.defineProperty(navigator, 'vibrate', { configurable: true, value: (p) => (CG.doc().rung ? goc(p) : false) }); } catch (e) { }
  }
  // EFFECTS: tỉa hạt theo bộ đếm tất định (không Math.random) — chỉ hạt trang trí
  if (typeof FX !== 'undefined') {
    const h1 = FX.hat1;
    FX.hat1 = function () {
      const k = CG.p().hat;
      if (k < 1) { CG._acc += k; if (CG._acc < 1) return null; CG._acc -= 1; }
      return h1.apply(this, arguments);
    };
    // REDUCE FLASH: chớp màn + rung màn nhỏ lại
    const sg = FX.sang; FX.sang = function (m, mau) { return sg.call(this, CG.doc().flash ? m * 0.3 : m, mau); };
    const lc = FX.lac; FX.lac = function (m) { return lc.call(this, CG.doc().flash ? m * 0.4 : m); };
  }
  // tiết kiệm pin đặt lại trần hạt → áp lại hệ số preset sau nó
  if (typeof TKP !== 'undefined') { const g = TKP.apDung; TKP.apDung = function () { const r = g.apply(this, arguments); CG.apDung(); return r; }; }
  CG.apDung();
  // EFFECTS Minimal: hiệu ứng triệu hồi / ghép bản rút gọn (bỏ khói, mảnh tia) — kết quả ghép vẫn hiện đủ
  if (typeof VX !== 'undefined') {
    const nh = VX.nhe; VX.nhe = function () { return CG.p().nhe || nh.apply(this, arguments); };
    // mốc sao 3/5/7: hình riêng (thay bùng sao chung) — vẫn đợi con dấu sao của phát lại ghép (ghepfx: ≥ 0,82 s)
    VX.saoLen = function (T, n, ten, tre) {
      const d = T && T._gf ? Math.max(tre || 0, 0.82) : (tre || 0);
      this.hen(d, () => CG.saoLen(T, n));
    };
    const vd = VX.veDs; VX.veDs = function (ctx, R) { const r = vd.apply(this, arguments); try { CG.veSao(ctx); } catch (e) { } return r; };
    const rs = VX.reset; VX.reset = function () { CG.ds.length = 0; return rs.apply(this, arguments); };
  }
  if (typeof REN !== 'undefined') {
    REN.napTruoc(CG.ANH_SAO.concat([...CG.CO_ANH]));
    for (const t of CG.ANH_SAO.concat([...CG.CO_ANH])) REN.CO_DINH && REN.CO_DINH.add(t);
    const vf = REN.veFx; REN.veFx = function (ctx) { CG.khungFx(); return vf.apply(this, arguments); };
  }
  // chí mạng: thêm hình (không đổi sát thương) — TVX.trung chỉ gọi khi đòn của ụ thật trúng
  if (typeof TVX !== 'undefined') { const tr = TVX.trung; TVX.trung = function (T, E, crit) { if (crit) CG.crit(T, E); return tr.apply(this, arguments); }; }
  // POWER-UP
  if (typeof nangCap === 'function') {
    const g = nangCap;
    nangCap = function (B, id) { const ok = g.apply(this, arguments); if (ok && B === G.ban[0] && !B.ai) { try { CG.vachPowerUp(B, id); } catch (e) { } } return ok; };
  }
  // TRÙM RA: rung tay 1 lần
  if (typeof sinhTrum === 'function') {
    const g = sinhTrum;
    sinhTrum = function () { const E = g.apply(this, arguments); try { if (E && G.ban[0] && !G.ban[0].ai && !(typeof SD !== 'undefined' && SD.dang)) CG.rung([30, 70, 30]); } catch (e) { } return E; };
  }
  // THUA: giảm bão hoà nhẹ bàn chơi (0,5 s) trong 0,9 s chờ màn kết quả — không nổ dài; vào trận mới thì trả lại
  if (typeof ketThuc === 'function') {
    const g = ketThuc;
    ketThuc = function (thang) { const da = !!G.ketThuc; const r = g.apply(this, arguments); if (!da) document.documentElement.classList.toggle('cg-thua', !thang); return r; };
  }
  if (typeof UI !== 'undefined' && UI.vaoTran) { const g = UI.vaoTran; UI.vaoTran = function () { document.documentElement.classList.remove('cg-thua'); CG.ds.length = 0; return g.apply(this, arguments); }; }
  // CÀI ĐẶT (sảnh)
  if (typeof HM !== 'undefined' && HM.moCai) {
    const g = HM.moCai;
    HM.moCai = function () {
      const r = g.apply(this, arguments);
      const h = document.querySelector('#hm-tam .hm-cai2');
      if (h && !h.querySelector('[data-act="cg-fx"]')) h.insertAdjacentHTML('beforeend', '<button class="hm-nut2" data-act="cg-fx"></button><button class="hm-nut2" data-act="cg-flash"></button><button class="hm-nut2" data-act="cg-rung"></button>');
      CG.nhan(); return r;
    };
  }
  document.addEventListener('click', (e) => {
    const el = e.target.closest && e.target.closest('[data-act^="cg-"]'); if (!el) return;
    const k = el.dataset.act; if (k !== 'cg-fx' && k !== 'cg-flash' && k !== 'cg-rung') return;
    e.stopImmediatePropagation();
    const c = CG.doc();
    if (k === 'cg-fx') CG.dat('fx', c.fx === 'full' ? 'can' : c.fx === 'can' ? 'gon' : 'full');
    else if (k === 'cg-flash') CG.dat('flash', !c.flash);
    else { CG.dat('rung', !c.rung); if (CG.doc().rung) CG.rung(12); }
    try { SND.nut(); } catch (er) { }
  }, true);
})();
