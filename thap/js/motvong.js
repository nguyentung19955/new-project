// TURRET MERGE — MỘT VÒNG (người dùng 06/11, iPhone: "2 vòng chạy này là sao, tôi không biết nó có tác dụng gì")
//  1) Quanh ụ chỉ còn 1 vòng = VÒNG XANH LÁ nạp chiêu (PX.vongHoi, fxu.js), đầy từ 12 giờ theo chiều kim đồng hồ.
//     Luật chung MV.coNap(T) cho MỌI ụ (render.js ụ thường + growfx.js ụ có dạng) → mọi chế độ / mọi bàn / Test range.
//     Đầy + chiêu chạm-để-dùng (bàn của mình) → icon CHẠM nhỏ góc trên-trái (nảy nhẹ). Chiêu tự kích → huy hiệu 'auto' có sẵn (thatso.js).
//  2) Dạng (HATCHLING → DEEP ONE → ABYSS LORD …) KHÔNG còn là cung quanh đầu: 3 viên ngọc PNG (ngoc_xanh / bản xám) ngay DƯỚI huy hiệu sao.
//     Ụ 2 dạng cố định (Werewolf) = 2 viên. Bộ đếm (ABYSS, COMBO ×N, chuỗi ×N…) giữ tấm nhỏ ở đáy ô (demkn.js).
//  3) Bảng chạm ụ: 1 dòng giải thích từng dấu của ụ đó (EN/VI). Trang ụ: mục "On-board icons".
//  Chỉ đặt ảnh PNG + chữ (QUY-TAC-HINH 3). Không đổi luật chơi / đồng bộ online.
'use strict';
const MV = {
  GON: true, // bàn gọn: không vẽ hàng 3 viên ngọc dạng (false = hình cũ)
  NAP_KHAC: { overlord: 1, wallgen: 1, blackhole: 1, mana: 1 }, // ụ nạp tự kích không có napMau (giữ đúng danh sách cũ của render.js)
  TAY: 'ui_tay', CO_TAY: false, // bàn tay chạm ChatGPT (HINH-VE-CODE-AUDIT S12) — chưa gen: tạm ic_phat (nút bấm PNG có sẵn)
  // ụ có chiêu nạp được (kể cả đang 0)
  laNap(id) { const sk = SKILLS[id]; if (!sk || sk.bomDem) return false; return !!(sk.chuDong || sk.napMau || this.NAP_KHAC[id]); },
  // vẽ vòng xanh lúc này?
  coNap(T) {
    const sk = SKILLS[T.id]; if (!sk || sk.bomDem || (T.st && T.st.da) || !(T.nap > 0.02)) return false;
    if (sk.chuDong) return T.sao >= 3 || !!sk.chuDongMoiSao; // Mạch Máu / Trứng cháy: chạm được ở mọi sao
    return !!(sk.napMau || this.NAP_KHAC[T.id]);
  },
  coNgoc(T) { if (!T || (typeof DOTPHA !== 'undefined' && DOTPHA.NGUONG[T.id])) return false; const d = this.dang(T); return !!d && (!this.GON || d.s >= 2); },
  tenChieu(id) { try { const m = mocCua(id).find(q => /active skill/i.test(q.mo || '')); return m ? m.ten : null; } catch (e) { return null; } },
  // dạng: { s: 1-based trong số n, n, ten }
  dang(T) {
    if (typeof laGrow !== 'function' || !laGrow(T.id) || !GROW[T.id]) return null;
    const g = GROW[T.id]; let s = T.gd; if (!s) { try { s = g.gd(T).s; } catch (e) { return null; } }
    if (g.dang) { const i = g.dang.indexOf(s); return { s: i < 0 ? 1 : i + 1, n: g.dang.length, ten: g.ten[s - 1] }; }
    return { s, n: 3, ten: g.ten[s - 1] };
  },

  // ---------- 3 viên ngọc dạng (dựng sẵn 1 ảnh mỗi (n, s, cỡ) → 1 lần vẽ) ----------
  hangNgoc(n, s, px) {
    const k = REN.s * REN.dpr, N = Math.max(4, Math.round(px * k)), key = 'mvng|' + n + '|' + s + '|' + N;
    let c = REN.cGet(key); if (c) return c;
    const sang = REN.img('ngoc_xanh'), xam = REN.banXam('ngoc_xanh'); if (!sang || !xam) return null;
    const gap = Math.round(N * 0.12);
    c = document.createElement('canvas'); c.width = n * N + (n - 1) * gap; c.height = N;
    const x = REN.c2d(c);
    for (let i = 0; i < n; i++) { x.globalAlpha = i < s ? 1 : 0.8; x.drawImage(REN.mip(i < s ? sang : xam, N), i * (N + gap), 0, N, N); }
    c._w = c.width / k; c._h = N / k;
    return REN.cSet(key, c);
  },
  veNgoc(ctx, h) {
    const T = h.T; if (typeof DOTPHA !== 'undefined' && DOTPHA.NGUONG[T.id]) return; // ụ cộng dồn: dạng = mốc của chính bộ đếm → tấm đếm màu bậc đã nói đủ, bỏ 3 viên ngọc (người dùng 07/11)
    const d = this.dang(T); if (!d || T.st.da) return;
    if (this.GON) { // BÀN GỌN (người dùng 07/11 15:48): bỏ hàng 3 viên ngọc cho MỌI ụ — dạng đã thấy ở hình ụ; chỉ còn 1 hạt ngọc nhỏ ở góc huy hiệu sao khi đã lên dạng (lam: dạng giữa · vàng: dạng cuối)
      if (d.s < 2) return;
      const im = REN.img(d.s >= d.n ? 'ngoc_vang' : 'ngoc_xanh'); if (!im) return;
      const B = T.vxB, u = B && B.len ? (VX.t - B.t0) / 0.35 : 9, sc = u >= 0 && u < 1 ? 1 + 0.5 * Math.sin(u * Math.PI) : 1; // vừa lên dạng: hạt nảy nhẹ
      const r = h.d * 0.36 * sc; ctx.globalAlpha = h.al; ctx.drawImage(REN.mip(im, r * REN.s * REN.dpr), h.sx + h.d * 0.36 - r / 2, h.sy + h.d * 0.36 - r / 2, r, r); ctx.globalAlpha = 1;
      return;
    }
    const px = h.d * 0.42, c = this.hangNgoc(d.n, d.s, px); if (!c) return;
    const B = T.vxB, u = B && B.len ? (VX.t - B.t0) / 0.35 : 9; // vừa lên dạng: hàng ngọc nảy nhẹ
    const sc = u >= 0 && u < 1 ? 1 + 0.35 * Math.sin(u * Math.PI) : 1;
    const w = c._w * sc, hh = c._h * sc, cx = h.sx, cy = h.sy + h.d * 0.6 + c._h * 0.5;
    ctx.globalAlpha = h.al; ctx.drawImage(c, cx - w / 2, cy - hh / 2, w, hh); ctx.globalAlpha = 1;
  },
  // ---------- icon CHẠM khi chiêu chủ động đầy (chỉ bàn mình chạm được) ----------
  veTay(ctx, h) {
    const T = h.T, sk = SKILLS[T.id], B = h.B || G.ban[T.ban];
    if (!sk || !sk.chuDong || (T.sao < 3 && !sk.chuDongMoiSao) || !(typeof chamSan === 'function' ? chamSan(T) : T.nap >= 1 && !T.st.da && !(T.st.bang > 0)) || !B || B.ai || B !== G.ban[0]) return;
    const im = (this.CO_TAY && REN.img(this.TAY)) || REN.img('ic_phat'); if (!im) return;
    const t = typeof REN.t === 'number' ? REN.t : G.t, nay = 1 + 0.08 * Math.sin(t * 6);
    REN.anhGiua(ctx, im, h.gx, h.gy + Math.sin(t * 6) * h.d * 0.05, h.d * 0.95 * nay, 0, h.al);
    ctx.globalAlpha = 1;
  },

  // ---------- 1 dòng chú thích cho bảng chạm ụ ----------
  TAG: {
    combo: ['COMBO count (merges in a row)', 'số COMBO (ghép liên tiếp)'],
    lienket: ['linked turrets in the chain', 'số ụ nối chuỗi'],
    dongbo: ['synced same-star Attack turrets', 'số ụ tấn công cùng sao đang đồng bộ'],
    luoicheo: ['diagonal turrets (4 = RESONANCE)', 'số ụ ở ô chéo (4 = CỘNG HƯỞNG)'],
    railgun: ['Salvos in its row / column', 'số Salvo cùng hàng / cột'],
    cuuvi: ['tails (max 9)', 'số đuôi (tối đa 9)'],
    loren: ['forge stacks', 'cộng dồn lò rèn'],
    leviathan: ['ABYSS points (+4% damage each)', 'điểm ABYSS (+4% sát thương mỗi điểm)'],
    ngoisao: ['stars on board / next milestone', 'tổng sao trên bàn / mốc kế'],
    nangluong: ['energy bonus', 'thưởng năng lượng'],
    docton: ['fire-rate bonus (alone = +100%)', 'thưởng tốc bắn (đứng một mình = +100%)'],
    lualien: ['flames carried (no limit)', 'số lửa đang mang (không giới hạn)'],
    hopca: ['Harmony: touching same-star turrets (x/4)', 'Hoà âm: số ụ cùng sao kề bên (x/4)'],
    luutru: ['archive stacks', 'cộng dồn lưu trữ'],
    xuonganh: ['HERO tiles active', 'số ô ANH HÙNG đang bật'],
  },
  dong(T, gon) {
    if (gon) return this.dongGon(T);
    const vi = typeof NN !== 'undefined' && NN.vi(), tr = (s) => (vi && typeof NN !== 'undefined' ? NN.t(s) : s);
    const sk = SKILLS[T.id] || {}, B = G.ban[T.ban], P = [];
    if (this.laNap(T.id)) {
      const ten = this.tenChieu(T.id), cd = typeof sk.cd === 'number' ? ' (' + sk.cd + ' s)' : '';
      if (sk.chuDong && T.sao < 3 && !sk.chuDongMoiSao) P.push(vi ? 'Vòng xanh lá: chiêu ' + (ten ? tr(ten) + ' ' : '') + 'mở ở 3★' : 'Green ring: ' + (ten || 'skill') + ' unlocks at 3★');
      else if (sk.chuDong) P.push(vi ? 'Vòng xanh lá: nạp chiêu ' + (ten ? tr(ten) : '') + cd + ' — đầy thì chạm ụ để dùng' : 'Green ring: ' + (ten || 'skill') + ' charging' + cd + ' — full: tap the turret to use');
      else P.push(vi ? 'Vòng xanh lá: đang nạp — đầy thì tự kích' : 'Green ring: charging — fires by itself when full');
    }
    const d = this.coNgoc(T) && this.dang(T); // rà phần đã bỏ: hàng 3 viên ngọc đã bỏ (bàn gọn 07/11) — chỉ nhắc khi có hạt ngọc ở huy hiệu sao
    if (d) P.push(vi ? 'Ngọc: dạng ' + d.s + '/' + d.n + ' ' + tr(d.ten) : 'Gems: form ' + d.s + '/' + d.n + ' ' + d.ten);
    if (typeof DEMKN !== 'undefined' && DEMKN.lay(T, B)) { const g = this.TAG[T.id] || ['skill counter', 'bộ đếm kỹ năng']; P.push(vi ? 'Số dưới ô: ' + g[1] : 'Bottom tag: ' + g[0]); }
    if (T.id === 'nhatthuc') P.push(vi ? 'Chế độ: ' + (T.dem ? 'ĐÊM' : 'NGÀY') : 'Mode: ' + (T.dem ? 'NIGHT' : 'DAY'));
    return P.join(' · ');
  },
  // bản ngắn cho dải xem nhanh (≤ 2 dòng): "Vòng xanh = nạp X (đầy thì chạm) · Ngọc = dạng 2/3 Y · Số dưới ô = Z"
  dongGon(T) {
    const vi = typeof NN !== 'undefined' && NN.vi(), tr = (s) => (vi ? NN.t(s) : s);
    const sk = SKILLS[T.id] || {}, B = G.ban[T.ban], P = [];
    if (this.laNap(T.id)) {
      const ten = this.tenChieu(T.id);
      if (sk.chuDong && T.sao < 3 && !sk.chuDongMoiSao) P.push(vi ? 'Vòng xanh lá: chiêu mở ở 3★' : 'Green ring: skill unlocks at 3★');
      else if (sk.chuDong) P.push(vi ? 'Vòng xanh lá = nạp ' + (ten ? tr(ten) : 'chiêu') + ' (đầy thì chạm ụ)' : 'Green ring = ' + (ten || 'skill') + ' charge (tap when full)');
      else P.push(vi ? 'Vòng xanh lá = nạp chiêu (đầy tự kích)' : 'Green ring = skill charge (fires itself)');
    }
    const d = this.coNgoc(T) && this.dang(T);
    if (d) P.push(vi ? 'Ngọc = dạng ' + d.s + '/' + d.n + ' ' + tr(d.ten) : 'Gems = form ' + d.s + '/' + d.n + ' ' + d.ten);
    if (typeof DEMKN !== 'undefined' && DEMKN.lay(T, B)) { const g = this.TAG[T.id] || ['skill counter', 'bộ đếm kỹ năng']; const ng = (x) => x.replace(/\s*\(.*\)$/, ''); P.push(vi ? 'Số dưới ô = ' + ng(g[1]) : 'Bottom number = ' + ng(g[0])); }
    return P.join(' · ');
  },
  // trang ụ (Turret File): chú thích chung
  chuGiai(id) {
    const vi = typeof NN !== 'undefined' && NN.vi(), P = [];
    const anhVong = (() => { try { const c = PX.anhHoi(PX.HOI_MAU); return c ? c.toDataURL() : ''; } catch (e) { return ''; } })();
    const hang = (img, b, s) => '<div class="mv-h">' + img + '<span><b>' + b + '</b> ' + s + '</span></div>';
    const sk = SKILLS[id] || {}, ten = this.tenChieu(id);
    if (this.laNap(id)) P.push(hang(anhVong ? '<img src="' + anhVong + '" alt="">' : '', vi ? 'Vòng xanh lá' : 'Green ring',
      sk.chuDong ? (vi ? '= nạp chiêu ' + (ten ? NN.t(ten) : '') + (sk.chuDongMoiSao ? '' : ' (từ 3★)') + '. Đầy thì vòng sáng nhịp + hiện nút chạm: chạm ụ để dùng.' : '= ' + (ten || 'active skill') + ' charging' + (sk.chuDongMoiSao ? '' : ' (from 3★)') + '. When full it pulses and shows a tap icon: tap the turret to use it.')
        : (vi ? '= chiêu đang nạp. Đầy thì tự kích.' : '= skill charging. Fires by itself when full.')));
    if (typeof laGrow === 'function' && laGrow(id) && GROW[id] && !(typeof DOTPHA !== 'undefined' && DOTPHA.NGUONG[id])) {
      const g = GROW[id], n = g.dang ? g.dang.length : 3, ds = (g.dang ? g.dang.map(k => g.ten[k - 1]) : g.ten).map(x => vi ? NN.t(x) : x).join(' → ');
      P.push(hang('<img src="assets/ngoc_xanh.png" alt=""><img src="assets/ngoc_vang.png" alt="">', vi ? 'Hạt ngọc' : 'Gem', (vi ? 'ở góc số sao: xanh = dạng giữa, vàng = dạng cuối (' + n + ' dạng: ' : 'on the star badge corner: blue = middle form, gold = final form (' + n + ' forms: ') + ds + ')')); // rà phần đã bỏ: hết hàng 3 viên ngọc dưới sao (bàn gọn 07/11)
    }
    if (typeof DEMKN !== 'undefined' && DEMKN.DS[id]) { const g = this.TAG[id] || ['skill counter', 'bộ đếm kỹ năng']; P.push(hang('<img src="assets/h2_tag.png" alt="" class="mv-tag">', vi ? 'Số dưới ô' : 'Bottom tag', '= ' + (vi ? g[1] : g[0]))); }
    if (!P.length) P.push('<p class="up-phu">' + (vi ? 'Ụ này không có vòng hay ngọc — chỉ số sao ở góc.' : 'No ring or gems on this turret — just the star badge.') + '</p>');
    return '<div class="mv-cg">' + P.join('') + '</div>';
  },
};
window.MV = MV;

(() => {
  if (typeof document === 'undefined') return;
  if (typeof REN !== 'undefined' && REN.CO_DINH) for (const t of ['ngoc_xanh', 'ngoc_vang', 'ic_phat']) { REN.CO_DINH.add(t); try { REN.img(t); } catch (e) { } }
  // lớp huy hiệu (sau đạn/hiệu ứng): ngọc dạng dưới huy hiệu sao + icon chạm góc trên-trái
  if (typeof ND !== 'undefined' && ND.veHuyHieu) {
    const veHH = ND.veHuyHieu;
    ND.veHuyHieu = function (ctx, h) {
      veHH.apply(this, arguments);
      if (!h.T || h.hs <= 0.5) return;
      try { MV.veNgoc(ctx, h); MV.veTay(ctx, h); } catch (e) { }
    };
  }
  // bảng chạm ụ: thêm 1 dòng chú thích dấu hiệu ngay dưới dòng số
  if (typeof UI !== 'undefined' && UI.ttChiTiet) {
    const tc = UI.ttChiTiet;
    UI.ttChiTiet = function (id, T, sk, tier) {
      const r = tc.apply(this, arguments);
      if (!T || !sk) return r;
      let d = ''; try { d = MV.dong(T); } catch (e) { }
      if (!d) return r;
      const esc = String(d).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
      const i = r.indexOf('</div>'); const dv = '<div class="d-so g1 d-mv">' + esc + '</div>';
      return i < 0 ? dv + r : r.slice(0, i + 6) + dv + r.slice(i + 6);
    };
  }
  // dải xem nhanh (hudb.js, 60 px): thêm dòng 3 (≤ 2 dòng chữ nhỏ) giải thích vòng / ngọc / số của ụ đang chạm
  const ganDong = (T) => {
    const tt = document.getElementById('tt'); if (!tt) return;
    const than = tt.querySelector('.tt-than') || tt;
    let el = tt.querySelector('.tt-mv');
    let s = ''; if (T && G.ban.length) { try { s = MV.dong(T, true); } catch (e) { } }
    if (!s) { if (el) el.hidden = true; tt.classList.remove('co-mv'); return; }
    if (!el) { el = document.createElement('div'); el.className = 'tt-mv'; than.appendChild(el); }
    if (el.textContent !== s) el.textContent = s;
    el.hidden = false; tt.classList.add('co-mv');
  };
  if (typeof UI !== 'undefined' && UI.moTT) {
    const mo = UI.moTT;
    UI.moTT = function (id, T, giu) { const r = mo.apply(this, arguments); ganDong(T); return r; };
    const mv = UI.moTTMV;
    if (mv) UI.moTTMV = function () { const r = mv.apply(this, arguments); ganDong(null); return r; };
    // dạng / chiêu đổi trong lúc dải đang mở → cập nhật chữ (chỉ khi đổi; 4 lần/giây)
    setInterval(() => { const tt = document.getElementById('tt'); if (tt && !tt.hidden && UI.xemU && UI.xemU.T && tt.classList.contains('co-mv')) ganDong(UI.xemU.T); }, 250);
  }
  // Turret File: mục "On-board icons" ngay sau mục Skill
  if (typeof UP !== 'undefined' && UP.chiTiet) {
    const ct = UP.chiTiet;
    UP.chiTiet = function (id, r, tier, sk) {
      const s = ct.apply(this, arguments);
      if (!sk) return s;
      let m = ''; try { m = this.muc(0, (typeof NN !== 'undefined' && NN.vi()) ? 'Biểu tượng trên ụ' : 'On-board icons', MV.chuGiai(id)); } catch (e) { return s; }
      const i = s.indexOf('</section>');
      return i < 0 ? s + m : s.slice(0, i + 10) + m + s.slice(i + 10);
    };
  }
  // css nhỏ (chỉ bố cục chữ / ảnh PNG — không vẽ vật thể)
  const st = document.createElement('style');
  st.textContent = 'html body #wrap #tt.hb-qi.co-mv:not(.hb-rong){height:auto;min-height:60px;padding-top:2px;padding-bottom:2px}html body #wrap #tt.hb-qi.co-mv .tt-than{grid-template-rows:21px 17px auto}' +
    'html body #wrap.co-tvb #tt.hb-qi.co-mv:not(.hb-rong){min-height:70px}html body #wrap.co-tvb #tt.hb-qi.co-mv .tt-than{grid-template-rows:24px 19px auto}' +
    'html body #tt.hb-qi .tt-mv{grid-column:1/3;grid-row:3;margin:1px 0 0;font-size:11px;line-height:14px;font-weight:700;color:#bfe9c9;white-space:normal}' +
    '#tt .tt-mv[hidden],html body #tt.hb-qi.hb-rong .tt-mv{display:none}#tt:not(.hb-qi) .tt-mv{font-size:11px;color:#bfe9c9;margin-top:2px}' +
    '#tt .d-mv{font-size:11px;line-height:1.35;color:#bfe9c9;white-space:normal}' +
    '.mv-cg{display:grid;gap:8px}.mv-h{display:flex;align-items:center;gap:8px;font-size:13px;line-height:1.35}.mv-h img{width:22px;height:22px;object-fit:contain;flex:none}' +
    '.mv-h img.mv-xam{filter:grayscale(1);opacity:.5;margin-left:-6px}.mv-h img.mv-tag{width:30px;height:13px}.mv-h b{color:#e8f6ff}';
  document.head.appendChild(st);
})();
