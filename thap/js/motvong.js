// TURRET MERGE — MỘT VÒNG (người dùng 06/11, iPhone: "2 vòng chạy này là sao, tôi không biết nó có tác dụng gì")
//  1) Quanh ụ chỉ còn 1 vòng = VÒNG XANH LÁ nạp chiêu (PX.vongHoi, fxu.js), đầy từ 12 giờ theo chiều kim đồng hồ.
//     Luật chung MV.coNap(T) cho MỌI ụ (render.js ụ thường + growfx.js ụ có dạng) → mọi chế độ / mọi bàn / Test range.
//     Đầy + chiêu chạm-để-dùng (bàn của mình) → icon CHẠM nhỏ góc trên-trái (nảy nhẹ). Chiêu tự kích → huy hiệu 'auto' có sẵn (thatso.js).
//  2) Dạng (HATCHLING → DEEP ONE → ABYSS LORD …) KHÔNG còn là cung quanh đầu: 3 viên ngọc PNG (ngoc_xanh / bản xám) ngay DƯỚI huy hiệu sao.
//     Ụ 2 dạng cố định (Werewolf) = 2 viên. Bộ đếm (ABYSS, COMBO ×N, chuỗi ×N…) giữ tấm nhỏ ở đáy ô (demkn.js).
//  3) Bảng chạm ụ: 1 dòng giải thích từng dấu của ụ đó (EN/VI). Trang ụ: mục "On-board icons".
//  Chỉ đặt ảnh PNG + chữ (QUY-TAC-HINH 3). Không đổi luật chơi / đồng bộ online.
//  09/11 (claude/demo-hop-tuong — chỉ 2 ụ bấm tay): BỎ vòng xanh nạp chiêu + icon chạm. Thay bằng TÍCH TỤ trên thân ụ (MV.tichTu):
//     lõi sáng dần theo màu ụ, hạt năng lượng bị hút vào tâm dày dần, đập nhịp khi ≥ 85%, đầy = "căng đầy" (hạt xoáy quanh),
//     lúc ra chiêu (nạp tụt) = XẢ ngắn (loé + sóng toả). Chỉ ảnh PNG (fx_cham_trang / fx_vong_mong tô màu), nhiễu theo id + thời gian.
//     Chiêu TỰ KÍCH (game.js TU_KICH) — chỉ Black Hole + Arcane Cascade còn chạm khi đầy; chữ mô tả đổi "TAP when full" → tự kích (MV.doiChu).
'use strict';
const MV = {
  GON: true, // bàn gọn: không vẽ hàng 3 viên ngọc dạng (false = hình cũ)
  NAP_KHAC: { overlord: 1, wallgen: 1, blackhole: 1, mana: 1 }, // ụ nạp tự kích không có napMau (giữ đúng danh sách cũ của render.js)
  CO_ICON_CHAM: false, // true = icon chạm cũ góc ô khi chiêu bấm tay đầy
  TAY: 'ui_tay', CO_TAY: false, // bàn tay chạm ChatGPT (HINH-VE-CODE-AUDIT S12) — chưa gen: tạm ic_phat (nút bấm PNG có sẵn)
  // ụ có chiêu nạp được (kể cả đang 0)
  laNap(id) { const sk = SKILLS[id]; if (!sk || sk.bomDem) return false; return !!(sk.chuDong || sk.napMau || this.NAP_KHAC[id]); },
  // vẽ vòng xanh lúc này?
  coNap(T) {
    const sk = SKILLS[T.id]; if (!sk || sk.bomDem || (T.st && T.st.da) || !(T.nap > 0.02)) return false;
    if (sk.chuDong) return T.sao >= 3 || !!sk.chuDongMoiSao; // Mạch Máu / Trứng cháy: chạm được ở mọi sao
    return !!(sk.napMau || this.NAP_KHAC[T.id]);
  },
  // ---------- TÍCH TỤ (09/11, thay vòng xanh nạp chiêu) ----------
  // ụ BẤM TAY (chạm khi đầy): có chuDong mà không tự kích (game.js TU_KICH) — còn lại Black Hole + Arcane Cascade
  bamTay(id) { const sk = SKILLS[id]; return !!(sk && sk.chuDong && !(typeof laTuKich === 'function' && laTuKich(id))); },
  // màu đặc trưng: napMau > màu dạng (GROW) > bảng riêng > màu bậc
  MAU: { blackhole: '#c070ff', thacmana: '#59a8ff', ngaithoigian: '#ff6a8a', haoquang: '#ffe27a', leviathan: '#3fd0ff', khoisinh: '#ff8ab0', ronglua: '#ff8a2a', lophanung: '#9fe6ff', overlord: '#ff5a5a', wallgen: '#9ad1ff', mana: '#7fdcff', hydra: '#2ee89a' },
  mauNap(id) {
    const sk = SKILLS[id] || {}; if (sk.napMau) return sk.napMau;
    if (this.MAU[id]) return this.MAU[id];
    if (typeof GROW !== 'undefined' && GROW[id] && typeof GROW[id].mau === 'string') return GROW[id].mau;
    try { return tierOf(id).mau; } catch (e) { return '#9fe6ff'; }
  },
  _tk: new WeakMap(), // trạng thái vẽ theo ụ: { p: nạp khung trước, xa: thời điểm xả }
  TK_HAT: 9, // tối đa hạt mỗi ụ
  // nhiễu cố định theo id ụ + chỉ số (thay Math.random — mọi khung, mọi máy như nhau)
  nhieu(u, i) { const x = Math.sin(u * 12.9898 + i * 78.233) * 43758.5453; return x - Math.floor(x); },
  // vẽ TÍCH TỤ quanh tâm ụ (ctx đã dời về tâm ụ, vẽ DƯỚI đầu súng). Gọi cho MỌI ụ laNap (kể cả nạp 0) để bắt khoảnh khắc xả.
  tichTu(ctx, T, S, al, t) {
    const sk = SKILLS[T.id]; if (!sk || sk.bomDem || !this.laNap(T.id) || !(al > 0.01)) return;
    const mo = !sk.chuDong || T.sao >= 3 || !!sk.chuDongMoiSao; // chiêu chưa mở (dưới 3★): không tích tụ
    let p = mo ? (T.nap > 1 ? 1 : T.nap > 0 ? T.nap : 0) : 0;
    if (T.st && T.st.da) p = 0;
    let s = this._tk.get(T); if (!s) { s = { p, xa: -9 }; this._tk.set(T, s); }
    if (s.p >= 0.9 && p < s.p - 0.4) s.xa = t; // nạp tụt mạnh = vừa ra chiêu → XẢ
    s.p = p;
    const e = (t - s.xa) / 0.45, dangXa = e >= 0 && e < 1;
    if (p <= 0.02 && !dangXa) return;
    const m = this.mauNap(T.id), op = ctx.globalCompositeOperation, bang = T.st && T.st.bang > 0;
    ctx.globalCompositeOperation = 'lighter';
    if (p > 0.02) {
      const day = p >= 0.999, gan = p >= 0.85;
      const nhip = day ? 0.5 + 0.5 * Math.sin(t * 5.2) : gan ? 0.5 + 0.5 * Math.sin(t * (8 + 10 * (p - 0.85))) : 0; // đập nhịp khi gần đầy · căng đầy: đập đều
      const k = bang ? 0.45 : 1; // bị băng: tích tụ mờ đi (chiêu không dùng được)
      // 1) lõi sáng dần (quầng PNG tô màu) — nhỏ hơn ô, alpha vừa phải → không che quái
      const r0 = S * (0.48 + 0.4 * p + (gan ? 0.06 * nhip : 0));
      PX.cham(ctx, 0, 0, r0 * 2, m, al * k * (0.12 + 0.4 * p * p + (gan ? 0.12 * nhip : 0)));
      PX.cham(ctx, 0, 0, r0 * 0.9, '#ffffff', al * k * (0.05 + 0.2 * p * p * p + (day ? 0.08 * nhip : 0))); // tâm trắng nóng
      // 2) hạt năng lượng bị hút vào tâm (đầy: xoáy quanh thân)
      const n = Math.min(this.TK_HAT, Math.round(2 + 7 * p)), u = T.uid || 1, co = S * 0.13;
      for (let i = 0; i < n; i++) {
        const h1 = this.nhieu(u, i), h2 = this.nhieu(u, i + 31);
        let x, y, a1;
        if (day) { // căng đầy: hạt xoáy đều quanh lõi
          const g = h1 * 6.283 + t * (1.6 + 0.6 * h2), rr = S * (0.42 + 0.08 * Math.sin(t * 3 + i));
          x = Math.cos(g) * rr; y = Math.sin(g) * rr * 0.92; a1 = 0.55 + 0.35 * Math.sin(t * 4 + i * 1.7);
        } else { // đang tích: hạt từ ngoài bay vào tâm, chu kỳ nhanh dần theo p
          const v = (t * (0.55 + 0.9 * p) * (0.75 + 0.5 * h2) + h1) % 1, g = h1 * 6.283 + h2 * 2 + v * 0.9;
          const rr = S * (0.16 + 0.6 * (1 - v));
          x = Math.cos(g) * rr; y = Math.sin(g) * rr; a1 = Math.sin(v * Math.PI) * (0.35 + 0.55 * p);
        }
        PX.cham(ctx, x, y, co * (0.7 + 0.5 * h2), i % 3 ? m : '#ffffff', al * k * a1);
      }
    }
    if (dangXa) { // 3) XẢ: loé + sóng toả ngắn rồi về
      PX.cham(ctx, 0, 0, S * (1 + 0.9 * e), '#ffffff', al * (1 - e) * 0.55);
      PX.vong(ctx, 0, 0, S * (0.3 + 0.75 * e), 3, m, al * (1 - e) * 0.9);
      PX.vong(ctx, 0, 0, S * (0.2 + 0.45 * e), 2, '#ffffff', al * (1 - e) * 0.5);
    }
    ctx.globalCompositeOperation = op; ctx.globalAlpha = al;
  },
  // ---------- chữ mô tả ụ TỰ KÍCH: "TAP when full" → tự kích (EN + bản Việt), dùng chung cho mô tả / mốc sao / demo ----------
  DOI_EN: [
    [/ \(tap when full; auto-fires if left full\)/g, ' (fires by itself when full)'],
    [/TAP when full/g, 'AUTO when full'], [/Tap when full/g, 'Auto when full'], [/tap when full/g, 'auto when full'],
    [/TAP THE HYDRA CARD/g, 'AUTO WHEN CROWDED'], [/Tap the Hydra card/g, 'Auto when crowded'], [/tap the Hydra card/g, 'auto when crowded'],
    [/tap the card for a machine gun/g, 'machine gun when crowded'], [/tap the card = /g, 'when crowded: '], [/tap the card/g, 'auto when crowded'],
    [/\(tap, /g, '(auto, '], [/\bTAP \(/g, 'AUTO ('], [/\bTAP:/g, 'AUTO:'], [/\bTap: /g, 'Auto: '], [/\btap:/g, 'auto:'], [/\btap \(/g, 'auto ('],
    [/tap to FREEZE/g, 'auto FREEZE'], [/tap to freeze/g, 'auto freeze'], [/Tap skill/g, 'Auto skill'], [/tap skill/g, 'auto skill'],
    [/tap it to recycle it/g, 'it recycles itself'], [/tap a burnt egg to recycle it/g, 'a burnt egg recycles itself'], [/tap it to recycle/g, 'recycles itself'],
    [/tap it for \+/g, 'recycles itself for +'], [/tap for \+/g, 'recycles itself for +'], [/Tap it: \+/g, 'Recycles itself: +'],
    [/ after (\d+|#) ?s full/g, ' when full'],
  ],
  DOI_VI: [
    [/ \(chạm khi đầy; tự kích nếu để đầy\)/g, ' (tự kích khi đầy)'],
    [/CHẠM khi đầy/g, 'TỰ KÍCH khi đầy'], [/Chạm khi đầy/g, 'Tự kích khi đầy'], [/chạm khi đầy/g, 'tự kích khi đầy'],
    [/CHẠM THẺ HYDRA/g, 'TỰ KÍCH KHI ĐÔNG QUÁI'], [/Chạm thẻ Hydra/g, 'Tự kích khi đông quái'], [/chạm thẻ Hydra/g, 'tự kích khi đông quái'],
    [/chạm thẻ để thành súng máy/g, 'súng máy khi đông quái'], [/chạm thẻ = /g, 'khi đông quái: '], [/chạm thẻ/g, 'tự kích khi đông quái'],
    [/\(chạm, /g, '(tự kích, '], [/CHẠM \(/g, 'TỰ KÍCH ('], [/CHẠM:/g, 'TỰ KÍCH:'], [/Chạm: /g, 'Tự kích: '], [/chạm:/g, 'tự kích:'], [/chạm \(/g, 'tự kích ('],
    [/chạm để ĐÓNG BĂNG/g, 'tự ĐÓNG BĂNG'], [/Kỹ năng chạm/g, 'Kỹ năng tự kích'], [/kỹ năng chạm/g, 'kỹ năng tự kích'],
    [/chạm để tái chế lấy/g, 'tự tái chế lấy'], [/chạm để lấy/g, 'tự tái chế lấy'], [/chạm lấy/g, 'tự tái chế lấy'],
    [/đầy thì chạm/g, 'đầy thì tự kích'], [/tự phát sau (\d+|#) ?s đầy/g, 'tự phát khi đầy'],
  ],
  doiEN(s) { if (typeof s !== 'string') return s; for (const [a, b] of this.DOI_EN) s = s.replace(a, b); return s; },
  doiVI(s) { if (typeof s !== 'string') return s; for (const [a, b] of this.DOI_VI) s = s.replace(a, b); return s; },
  doiChu(s) { return this.doiVI(this.doiEN(s)); },
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
    if (!this.CO_ICON_CHAM) return; // 09/11: bỏ bàn tay / nút chạm — ụ bấm tay tự lộ bằng trạng thái "căng đầy" (MV.tichTu)
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
      const bam = this.bamTay(T.id);
      if (sk.chuDong && T.sao < 3 && !sk.chuDongMoiSao) P.push(vi ? 'Lõi sáng: chiêu ' + (ten ? tr(ten) + ' ' : '') + 'mở ở 3★' : 'Core glow: ' + (ten || 'skill') + ' unlocks at 3★');
      else if (bam) P.push(vi ? 'Lõi sáng: tích tụ ' + (ten ? tr(ten) : 'chiêu') + cd + ' — căng đầy thì chạm ụ để dùng' : 'Core glow: ' + (ten || 'skill') + ' building up' + cd + ' — when it is brimming, tap the turret');
      else P.push(vi ? 'Lõi sáng: tích tụ ' + (ten ? tr(ten) : 'chiêu') + ' — đầy thì tự kích' : 'Core glow: ' + (ten || 'skill') + ' building up — fires by itself when full');
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
      if (sk.chuDong && T.sao < 3 && !sk.chuDongMoiSao) P.push(vi ? 'Lõi sáng: chiêu mở ở 3★' : 'Core glow: skill unlocks at 3★');
      else if (this.bamTay(T.id)) P.push(vi ? 'Lõi sáng = tích tụ ' + (ten ? tr(ten) : 'chiêu') + ' (căng đầy thì chạm ụ)' : 'Core glow = ' + (ten || 'skill') + ' build-up (tap when brimming)');
      else P.push(vi ? 'Lõi sáng = tích tụ chiêu (đầy tự kích)' : 'Core glow = skill build-up (fires itself)');
    }
    const d = this.coNgoc(T) && this.dang(T);
    if (d) P.push(vi ? 'Ngọc = dạng ' + d.s + '/' + d.n + ' ' + tr(d.ten) : 'Gems = form ' + d.s + '/' + d.n + ' ' + d.ten);
    if (typeof DEMKN !== 'undefined' && DEMKN.lay(T, B)) { const g = this.TAG[T.id] || ['skill counter', 'bộ đếm kỹ năng']; const ng = (x) => x.replace(/\s*\(.*\)$/, ''); P.push(vi ? 'Số dưới ô = ' + ng(g[1]) : 'Bottom number = ' + ng(g[0])); }
    return P.join(' · ');
  },
  // trang ụ (Turret File): chú thích chung
  chuGiai(id) {
    const vi = typeof NN !== 'undefined' && NN.vi(), P = [];
    const anhVong = (() => { try { const c = PX.mau('fx_cham_trang', MV.mauNap(id)); return c && c.toDataURL ? c.toDataURL() : ''; } catch (e) { return ''; } })(); // quầng lõi tích tụ (PNG tô màu)
    const hang = (img, b, s) => '<div class="mv-h">' + img + '<span><b>' + b + '</b> ' + s + '</span></div>';
    const sk = SKILLS[id] || {}, ten = this.tenChieu(id), bam = this.bamTay(id);
    if (this.laNap(id)) P.push(hang(anhVong ? '<img src="' + anhVong + '" alt="">' : '', vi ? 'Lõi sáng' : 'Core glow',
      bam ? (vi ? '= tích tụ chiêu ' + (ten ? NN.t(ten) : '') + (sk.chuDongMoiSao ? '' : ' (từ 3★)') + ': hạt năng lượng hút vào ụ, lõi sáng dần. Căng đầy (lõi đập đều, hạt xoáy quanh) thì chạm ụ để dùng.' : '= ' + (ten || 'active skill') + ' building up' + (sk.chuDongMoiSao ? '' : ' (from 3★)') + ': energy is drawn into the turret and its core brightens. When it is brimming (steady pulse, swirling sparks), tap the turret to use it.')
        : (vi ? '= chiêu đang tích tụ: hạt năng lượng hút vào ụ, lõi sáng dần. Đầy thì tự kích (loé + sóng toả).' : '= skill building up: energy is drawn into the turret and its core brightens. Fires by itself when full (flash + shockwave).')));
    if (typeof laGrow === 'function' && laGrow(id) && GROW[id] && !(typeof DOTPHA !== 'undefined' && DOTPHA.NGUONG[id])) {
      const g = GROW[id], n = g.dang ? g.dang.length : 3, ds = (g.dang ? g.dang.map(k => g.ten[k - 1]) : g.ten).map(x => vi ? NN.t(x) : x).join(' → ');
      P.push(hang('<img src="assets/ngoc_xanh.png" alt=""><img src="assets/ngoc_vang.png" alt="">', vi ? 'Hạt ngọc' : 'Gem', (vi ? 'ở góc số sao: xanh = dạng giữa, vàng = dạng cuối (' + n + ' dạng: ' : 'on the star badge corner: blue = middle form, gold = final form (' + n + ' forms: ') + ds + ')')); // rà phần đã bỏ: hết hàng 3 viên ngọc dưới sao (bàn gọn 07/11)
    }
    if (typeof DEMKN !== 'undefined' && DEMKN.DS[id]) { const g = this.TAG[id] || ['skill counter', 'bộ đếm kỹ năng']; P.push(hang('<img src="assets/h2_tag.png" alt="" class="mv-tag">', vi ? 'Số dưới ô' : 'Bottom tag', '= ' + (vi ? g[1] : g[0]))); }
    if (!P.length) P.push('<p class="up-phu">' + (vi ? 'Ụ này không có lõi tích tụ hay ngọc — chỉ số sao ở góc.' : 'No core glow or gems on this turret — just the star badge.') + '</p>');
    return '<div class="mv-cg">' + P.join('') + '</div>';
  },
};
window.MV = MV;

// chữ ụ TỰ KÍCH (09/11 — chỉ 2 ụ bấm tay): bản Việt sinh kèm từ khoá cũ (khoá EN đổi theo DOI_EN → giá trị đổi theo DOI_VI),
// rồi đổi mô tả gốc (SKILLS.mo, TEXT.turret, mốc sao MOC_RIENG, dạng GROW, ATK) của các ụ trong TU_KICH. Không đụng Black Hole / Arcane Cascade.
(() => {
  for (const d of [typeof VI_DICH !== 'undefined' ? VI_DICH : null, typeof VI_MAU !== 'undefined' ? VI_MAU : null]) if (d) {
    for (const k of Object.keys(d)) { const k2 = MV.doiEN(k); if (k2 !== k && !Object.prototype.hasOwnProperty.call(d, k2)) d[k2] = MV.doiVI(d[k]); }
  }
  if (typeof VI_DICH !== 'undefined') Object.assign(VI_DICH, {
    'Unlocks the auto skill': 'Mở khoá kỹ năng tự kích',
    'Unlocks the active skill (fires by itself when full)': 'Mở kỹ năng chủ động (tự kích khi đầy)',
    'Hatches in #s → +#★ turret · #★ burns: auto +# mana': 'Nở sau # s → ụ +#★ · #★ cháy: tự tái chế +# mana',
    'Max # Mythic per deck. Its active skill fires by itself when charged (some unlock it at #★).': 'Tối đa # Thần thoại mỗi bộ bài. Kỹ năng chủ động tự kích khi nạp đầy (vài ụ mở khoá ở #★).',
    'Max # Mythic per deck. Tap it on the board when charged to fire its active skill (only @ and @; others fire by themselves).': 'Tối đa # Thần thoại mỗi bộ bài. Chạm vào nó trên bàn khi nạp đầy để dùng kỹ năng chủ động (chỉ @ và @; ụ khác tự kích).', // @ = tên ụ (ngonngu.js mau)
  });
  if (typeof laTuKich !== 'function' || typeof SKILLS === 'undefined') return;
  const doi = (s) => MV.doiChu(s);
  for (const id of Object.keys(SKILLS)) {
    if (!laTuKich(id)) continue;
    const sk = SKILLS[id];
    if (typeof sk.mo === 'function') { const mo = sk.mo; sk.mo = function () { return doi(mo.apply(this, arguments)); }; }
    try { const u = TEXT.turret[id]; if (u && u.skill) u.skill = doi(u.skill); } catch (e) { }
    if (typeof MOC_RIENG !== 'undefined' && MOC_RIENG[id]) for (const n in MOC_RIENG[id]) { const m = MOC_RIENG[id][n]; if (Array.isArray(m)) m[1] = doi(m[1]); }
    if (typeof GROW !== 'undefined' && GROW[id] && typeof GROW[id].dk === 'string') GROW[id].dk = doi(GROW[id].dk);
    if (typeof ATK !== 'undefined' && Array.isArray(ATK[id])) ATK[id] = ATK[id].map(doi);
  }
})();

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
