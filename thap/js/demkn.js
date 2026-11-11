// TURRET MERGE — BỘ ĐẾM KỸ NĂNG kiểu DCDW (docs/demo-hop-tuong/DCDW-DEM-SAO.md)
//  1) THẺ BỘ BÀI (góc DƯỚI-PHẢI ô chân dung, cách xa tấm LV): icon chồng ụ PNG (h2_ic_chong) + số ụ LOẠI NÀY đang có trên BÀN CỦA MÌNH (G.ban[0]; co-op/pvp không tính bàn kia).
//     Dải thẻ nhỏ của đồng đội/đối thủ (#dp-dai) cũng có số ụ trên BÀN CỦA HỌ (G.ban[1]).
//  2) ỤNG CÓ KỸ NĂNG THEO SỐ ĐẾM (sao trên bàn, combo, đuôi, cộng dồn…): 1 tấm nhỏ ở ĐÁY Ô = khung PNG h2_tag (cắt 3 mảnh)
//     + icon PNG (ic_sao / ic_dmg / ic_toc / ic_chet / ic_mana) + số CHÍNH XÁC, đọc thẳng từ luật mỗi khung hình.
//     Vẽ trong lớp huy hiệu (cùng chỗ với huy hiệu sao) → mọi bàn: SOLO, CO-OP (cả bàn đồng đội), PVP (cả bàn đối thủ), ONLINE, Test range.
//  Code chỉ đặt ảnh PNG + chữ số (QUY-TAC-HINH 3). Không có số → không vẽ gì (QUY-TAC-HINH 7).
'use strict';
const DEMKN = {
  // mỗi mục: (T, B) → null (không hiện) hoặc [{ ic, s }] (1–2 cặp icon+số), sang = true khi đạt mốc (chữ vàng)
  DS: {
    ngoisao(T, B) { const n = SKILLS.ngoisao.tong(B), L = SKILLS.ngoisao.luat(n); return { m: [{ ic: L.loai === 'dmg' ? 'ic_dmg' : 'ic_toc', s: n + '/' + L.moc }], sang: L.dung }; }, // tiến tới MỐC KẾ: icon tốc (bội 10) / sát thương (bội 50)
    combo(T, B) { const n = B.combo || 0; return n > 0 ? { m: [{ ic: 'ic_dmg', s: '×' + n }], sang: n >= 20 } : null; },
    lienket(T, B) { const n = SKILLS.lienket.nhom(B, T); return n >= 2 ? { m: [{ ic: 'ic_dmg', s: '×' + n }] } : null; },
    dongbo(T, B) { const n = SKILLS.dongbo.dem(B, T); return n > 0 ? { m: [{ ic: 'ic_dmg', s: '×' + n }], sang: n >= 3 } : null; },
    luoicheo(T) { const n = SKILLS.luoicheo.dem(T); return n > 0 ? { m: [{ ic: 'ic_dmg', s: n + '/' + oCheo(T.o).length }], sang: SKILLS.luoicheo.du(T) } : null; }, // ô mép: 2/2 = cộng hưởng ×1.3
    // railgun (Salvo): BỎ nhãn ⚔ n/5 » n/3 dưới ụ (09/11) — thay bằng mũi tên đỏ/xanh chạy trong ô (hieuung.js VX.salvo.veMui)
    cuuvi(T) { const n = T.duoi || 0; return n > 0 ? { m: [{ ic: 'ic_chet', s: n + '/9' }], sang: n >= 8 } : null; },
    tienhoa(T) { const S = SKILLS.tienhoa; if (S.chay(T)) return { m: [{ ic: 'ic_mana', s: '+' + S.MANA }], sang: true }; return { m: [{ ic: 'trung_1', s: Math.ceil(S.con(T)) + 's' }] }; }, // trứng: giây tới lúc nở · trứng cháy: chạm = +20 mana
    mauhut(T) { return T.mh ? { m: [{ ic: 'mauhut_phu', s: Math.ceil(Math.max(0, T.mh.con)) + 's' }] } : null; }, // Mạch Máu: chỉ giây còn lại tới lúc nuốt (số Máu ở góc trên-phải — skills7.js MH_SO)
    bienmau(T) { const S = SKILLS.bienmau, f = S.n(T); if (f > 0) return { m: [{ ic: S.dauAnh(T), s: '×' + f }], sang: f >= 5 }; const n = T.pms || 0; return n > 0 ? { m: [{ ic: S.ANH[S.mau(T)], s: n + '' }], sang: n >= S.tran(T) } : null; }, // Prism: đơn = mặt nạ màu + cộng dồn · HỢP THỂ = mặt nạ 4 màu + số hợp thể (×n)
    loren(T) { const n = Math.min(14, T.lo || 0); return n > 0 ? { m: [{ ic: T.dang === 'toc' ? 'ic_toc' : 'ic_dmg', s: n + '/14' }], sang: n >= 14 } : null; }, // Twin Anvil: icon dạng (ST / tốc) + cộng dồn
    // VỰC SÂU (ABYSS): icon xoáy vực riêng (không dùng ic_dmg chung) + chữ xanh biển sâu; không trần → luôn hiện số (≥100 chữ sáng hơn)
    leviathan(T) { const n = T.vuc || 0; return n > 0 ? { m: [{ ic: DEMKN.icVuc(), s: '' + n }], mau: n >= 100 ? '#b8f6ff' : '#5fe3ff' } : null; },
    // Rồng Máy: NHIỆT lò (không trần) — ngọn lửa cam <100 · vàng ≥100 QUÁ NHIỆT · trắng ≥250 NÓNG CHẢY (chữ vàng = đang có thưởng mốc)
    ronglua(T) { const n = Math.floor(T.nhiet || 0); return n > 0 ? { m: [{ ic: n >= 250 ? 'lua_t1' : n >= 100 ? 'lua_t3' : 'fx_cuuvi_dan', s: '' + n }], sang: n >= 100 } : null; },
    // Genesis Core (10/11): số LƯỢT TẶNG còn lại (ngôi sao + số), luôn hiện; còn 1 lượt (tặng xong là vỡ) → chữ đỏ cam
    khoisinh(T) { const n = SKILLS.khoisinh.luotCon(T); return n > 0 ? { m: [{ ic: 'ic_sao', s: '×' + n }], mau: n <= 1 ? '#ff7a5c' : '#ffd0e0' } : null; },
    nangluong(T, B) { const k = Math.round(SKILLS.nangluong.k(B) * 100); return k > 0 ? { m: [{ ic: 'ic_mana', s: '+' + k + '%' }], sang: k >= 500 } : null; },
    // (Sói: bỏ bộ đếm mạng — Sói không còn lớn dần theo mạng; dạng thường / thức tỉnh quay lúc sinh)
    docton(T, B) { const n = SKILLS.docton.ke(B, T); return n === 0 ? { m: [{ ic: 'ic_toc', s: '+100%' }], sang: true } : n >= 3 ? { m: [{ ic: 'ic_toc', s: '−30%' }] } : null; },
  },
  ANH: ['h2_tag', 'h2_ic_chong', 'ic_sao', 'ic_dmg', 'ic_toc', 'ic_chet', 'ic_mana', 'fx_leviathan_hieu', 'lev_abyss', 'fx_cuuvi_dan', 'lua_t1', 'lua_t3'],
  // icon VỰC SÂU: ảnh ChatGPT lev_abyss (docs/demo-hop-tuong/tuvan/leviathan/CAN-VE.json) — chưa có thì xoáy nước fx_leviathan_hieu (ảnh ChatGPT sẵn có)
  IC_VUC: 'lev_abyss',
  icVuc() { return this.IC_VUC || 'fx_leviathan_hieu'; },

  // ĐỘT PHÁ (vangmoi1.js DOTPHA): bậc 1–4 → icon PNG lọc màu (vàng / lam / tím / trắng, ảnh dựng 1 lần) + chữ cùng màu
  // ụ đã được Twin Anvil rèn (mọi loại): số cộng dồn; SONG SINH = 2 cặp, chữ vàng
  anv(T) { const a = T.anv; return a && a.lo ? { m: a.x ? [{ ic: 'ic_dmg', s: a.lo + '' }, { ic: 'ic_toc', s: a.lo + '' }] : [{ ic: a.k === 'toc' ? 'ic_toc' : 'ic_dmg', s: a.lo + '' }], sang: !!a.x } : null; },
  lay(T, B) { const f = this.DS[T.id] || (T.anv && !T.anv.x ? this.anv : null); if (!f || !B || T.st.da) return null; try { const v = f(T, B); if (v && typeof DOTPHA !== 'undefined') { const b = DOTPHA.bacU(T); if (b) { v.bac = b; v.v4 = b === 4 ? DOTPHA.buoc4() : -1; v.mau = b === 4 ? ['#ffb0b0', '#fff0a0', '#b0ffb8', '#a8f4ff', '#b8c4ff', '#ffb8f4'][v.v4] : DOTPHA.MAU[b]; v.sang = false; if (T.id === 'lualien') v.giuMau = 1; } } return v; } catch (e) { return null; } }, // Ember (lualien): icon lửa lua_t1–4 đã tô màu theo mốc → giuMau, không phủ lọc màu bậc (sửa lỗi tester 08/11)

  // khung h2_tag (74×30, mép 14 px) cắt 3 mảnh: 2 đầu giữ tỉ lệ, phần giữa kéo dài
  khung(ctx, x, y, w, h) {
    const a = REN.img('h2_tag'); if (!a) return false;
    const sw = a.width, sh = a.height, m = Math.round(sw * 14 / 74), dm = m * h / sh;
    ctx.drawImage(a, 0, 0, m, sh, x, y, dm, h);
    ctx.drawImage(a, m, 0, sw - 2 * m, sh, x + dm, y, Math.max(0, w - 2 * dm), h);
    ctx.drawImage(a, sw - m, 0, m, sh, x + w - dm, y, dm, h);
    return true;
  },
  // tấm đếm ở đáy ô (x giữa ô, yDay = mép dưới trong của ô), c = cạnh ô
  // CHỐNG NÓNG MÁY: tấm đếm dựng sẵn thành ẢNH (đúng điểm ảnh thiết bị) theo nội dung — chỉ dựng lại khi số đổi
  // (trước: mỗi khung đo chữ + viền chữ + tô chữ cho từng ụ). Đặt ảnh đúng lưới điểm ảnh → chữ nét y hệt vẽ trực tiếp.
  ve(ctx, T, B, x, yDay, c, al) {
    // TWIN-FORGED (Twin Anvil song sinh): huy hiệu ảnh loren_songsinh ở góc dưới-phải ô (thay 2 con số nhỏ khó đọc) — không đè số sao (trên) / tấm đếm (giữa đáy)
    if (T.anv && T.anv.x && !T.st.da && typeof REN !== 'undefined' && REN.img('loren_songsinh')) { const g = ctx.globalAlpha; REN.anhGiua(ctx, 'loren_songsinh', x + c * 0.26, yDay - c * 0.19, c * 0.46, 0, al); /* 12/11: 0,34 → 0,46 ô (người dùng: quá nhỏ) */ ctx.globalAlpha = g; }
    const v = this.lay(T, B); if (!v) return;
    const h = Math.max(9, c * 0.2), m = ctx.getTransform(), k = m.a;
    if (!(k > 0) || Math.abs(m.b) > 1e-6 || Math.abs(m.c) > 1e-6 || Math.abs(m.d - k) > 1e-6 || typeof REN === 'undefined' || !REN.cGet) return this.ve0(ctx, v, x, yDay, h, al);
    const hp = Math.round(h * k * 4) / 4, key = 'dk|' + hp + '|' + (v.sang ? 1 : 0) + '|' + (v.mau || '') + '|' + (v.bac || 0) + (v.giuMau ? 'g' : '') + (v.v4 >= 0 ? 'h' + v.v4 : '') + '|' + v.m.map(p => p.ic + ':' + (p.xoay || 0) + ':' + p.s).join(',');
    if (ctx.laGL) { if (!REN.img('h2_tag')) return; if (this.veGL(ctx, T, v, key, x, yDay, hp, k, m, al)) return; return this.ve0(ctx, v, x, yDay, h, al); } // WebGL: ô ảnh rời, số đổi không tải gì lên GPU
    // tối ưu giật co-op (11/11): mỗi ụ giữ 1 canvas RIÊNG, số đổi thì vẽ lại vào chính canvas đó (chỉ lớn thêm, không tạo mới).
    //   Trước: mỗi giá trị mới = 1 canvas mới giữ trong bộ đệm REN (cuối trận số nhảy liên tục → ~1 canvas / khung, đẩy bộ đệm xoay vòng + dọn rác).
    const RG = this._rieng || (this._rieng = new WeakMap());
    let a = RG.get(T);
    if (!a || a.key !== key) {
      if (!REN.img('h2_tag')) return;
      if (v.m.some(q => !REN.img(q.ic))) return this.ve0(ctx, v, x, yDay, h, al); // icon chưa nạp: vẽ thẳng, chưa dựng ảnh đệm (tránh đệm thiếu icon mãi)
      const hl = hp / k, x0 = this.rong(v, hl), w = Math.ceil(x0 * k) + 2, hh = Math.ceil(hl * k) + 3;
      if (!a) { a = { cv: document.createElement('canvas'), key: '', w: 0, h: 0, _w: 0 }; a.cv.width = w + 12; a.cv.height = hh; a.q = REN.c2d(a.cv); RG.set(T, a); }
      else if (a.cv.width < w || a.cv.height < hh) { a.cv.width = Math.max(a.cv.width, w + 12); a.cv.height = Math.max(a.cv.height, hh); a.q = REN.c2d(a.cv); }
      const q = a.q; q.setTransform(1, 0, 0, 1, 0, 0); q.globalAlpha = 1; q.globalCompositeOperation = 'source-over'; q.clearRect(0, 0, a.cv.width, a.cv.height);
      q.setTransform(k, 0, 0, k, 1, 1); a.key = '';
      if (!this.ve0(q, v, x0 / 2, hl + 1, hl, 1)) return;
      a.key = key; a.w = w; a.h = hh; a._w = x0;
      if (typeof GLR !== 'undefined') GLR.ban(a.cv); // WebGL: tấm đếm vẽ lại tại chỗ → báo lớp GL tải lại texture
    }
    const dx = Math.round(m.a * (x - a._w / 2) + m.e) - 1, dy = Math.round(m.d * (yDay - hp / k - 1) + m.f) - 1;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = al; ctx.drawImage(a.cv, 0, 0, a.w, a.h, dx, dy, a.w, a.h); ctx.restore();
  },
  // ---------- WEBGL (11/11): tấm đếm = các Ô ẢNH RỜI đã nằm sẵn trong atlas — khung h2_tag 3 mảnh + icon + TỪNG KÝ TỰ (viền đen / ruột màu, dựng 1 lần theo cỡ + màu).
  //   Trước: cả tấm vẽ vào 1 canvas riêng của ụ rồi GLR.ban → mỗi lần số đổi = 1 lần tải canvas→texture (iPhone 3–50 ms / lần, "up1/50 76x23" trong khung chậm).
  //   Giờ: số đổi chỉ tính lại vị trí ký tự (đo chữ 1 lần / giá trị mới), KHÔNG tải gì. Hình khớp bản canvas: cùng gốc bám điểm ảnh, cùng phông / nét viền / thứ tự
  //   (mọi viền của 1 cặp rồi mọi ruột, như strokeText + fillText); mỗi ký tự bám điểm ảnh riêng (lệch ≤ 0,5 điểm ảnh so với chữ vẽ liền). Bản 2D giữ nguyên canvas.
  kyTu(ch, font, f, hl, k, mau) { // mau = null → viền đen
    const GM = this._kyTu || (this._kyTu = new Map()), key = ch + '|' + font + '|' + k + '|' + (mau || '');
    let c = GM.get(key); if (c) return c;
    const q = this._mx || (this._mx = document.createElement('canvas').getContext('2d')); q.font = font;
    const lw = Math.max(1.5, f * 0.22), le = Math.ceil((lw * 0.75 + 1) * k) + 1;
    c = document.createElement('canvas'); c.width = Math.ceil(q.measureText(ch).width * k) + 2 * le; c.height = Math.ceil(hl * k) + 3; // cao = canvas tấm cũ (chữ bị cắt đúng như cũ)
    const y = REN.c2d(c); y.setTransform(k, 0, 0, k, le, 1); y.font = font; y.textBaseline = 'middle'; y.textAlign = 'left';
    if (mau) { y.fillStyle = mau; y.fillText(ch, 0, hl / 2 + 0.5); } else { y.lineWidth = lw; y.strokeStyle = '#000'; y.lineJoin = 'round'; y.strokeText(ch, 0, hl / 2 + 0.5); }
    c._ox = le; if (GM.size > 900) GM.clear(); GM.set(key, c); return c;
  },
  veGL(ctx, T, v, key, x, yDay, hp, k, m, al) {
    const hl = hp / k, f = hl * 0.7, ic = hl * 0.92, gap = hl * 0.12, pad = hl * 0.42, font = '900 ' + f.toFixed(2) + 'px ' + FONT.display;
    const anh = []; for (let i = 0; i < v.m.length; i++) { const im = REN.img(v.bac && !v.giuMau && typeof DOTPHA !== 'undefined' ? DOTPHA.ten(v.m[i].ic, v.bac, v.v4) : v.m[i].ic); if (!im || !REN.img(v.m[i].ic)) return false; anh.push(im); }
    const RG = this._riengGL || (this._riengGL = new WeakMap());
    let a = RG.get(T);
    if (!a || a.key !== key) { // bố cục: x icon + x từng ký tự (đo theo tiền tố → đúng khoảng cách chữ vẽ liền)
      const q = this._mx || (this._mx = document.createElement('canvas').getContext('2d')); q.font = font;
      let xx = pad; const ds = [];
      for (let i = 0; i < v.m.length; i++) {
        const s = v.m[i].s; if (i) xx += hl * 0.3;
        const xi = xx, cs = []; xx += ic + gap;
        for (let j = 0; j < s.length; j++) cs.push(xx + (j ? q.measureText(s.slice(0, j)).width : 0));
        xx += q.measureText(s).width; ds.push({ xi, cs });
      }
      a = { key, w: xx + pad, ds }; RG.set(T, a);
    }
    const Ox = Math.round(m.a * (x - a.w / 2) + m.e), Oy = Math.round(m.d * (yDay - hl - 1) + m.f), mau = v.sang ? '#ffe46b' : v.mau || '#f2f6fa';
    ctx.save(); ctx.globalAlpha = al; ctx.setTransform(k, 0, 0, k, Ox, Oy);
    this.khung(ctx, 0, 0, a.w, hl);
    for (let i = 0; i < v.m.length; i++) {
      const p = v.m[i], xi = a.ds[i].xi, im2 = REN.mip ? REN.mip(anh[i], ic * REN.s * REN.dpr) : anh[i];
      if (p.xoay) { ctx.save(); ctx.translate(xi + ic / 2, hl / 2); ctx.rotate(p.xoay); ctx.drawImage(im2, -ic / 2, -ic / 2, ic, ic); ctx.restore(); }
      else ctx.drawImage(im2, xi, (hl - ic) / 2, ic, ic);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    for (let i = 0; i < v.m.length; i++) {
      const s = v.m[i].s, cs = a.ds[i].cs;
      for (let j = 0; j < s.length; j++) { const g = this.kyTu(s[j], font, f, hl, k, null); ctx.drawImage(g, Ox + Math.round(k * cs[j]) - g._ox, Oy - 1); }
      for (let j = 0; j < s.length; j++) { const g = this.kyTu(s[j], font, f, hl, k, mau); ctx.drawImage(g, Ox + Math.round(k * cs[j]) - g._ox, Oy - 1); }
    }
    ctx.restore(); return true;
  },
  rong(v, h) {
    const x = REN.ctxNong ? REN.ctxNong() : document.createElement('canvas').getContext('2d'), f = h * 0.7, ic = h * 0.92, gap = h * 0.12, pad = h * 0.42;
    x.font = '900 ' + f.toFixed(2) + 'px ' + FONT.display;
    let w = pad * 2; for (let i = 0; i < v.m.length; i++) w += ic + gap + x.measureText(v.m[i].s).width + (i ? h * 0.3 : 0);
    return w;
  },
  ve0(ctx, v, x, yDay, h, al) {
    const f = h * 0.7, ic = h * 0.92, gap = h * 0.12, pad = h * 0.42;
    ctx.save();
    ctx.font = '900 ' + f.toFixed(2) + 'px ' + FONT.display; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    let w = pad * 2; for (let i = 0; i < v.m.length; i++) w += ic + gap + ctx.measureText(v.m[i].s).width + (i ? h * 0.3 : 0);
    const y = yDay - h - 1; let xx = x - w / 2;
    ctx.globalAlpha = al;
    if (!this.khung(ctx, xx, y, w, h)) { ctx.restore(); return false; }
    xx += pad;
    for (let i = 0; i < v.m.length; i++) {
      const p = v.m[i]; if (i) xx += h * 0.3;
      const im = REN.img(v.bac && !v.giuMau && typeof DOTPHA !== 'undefined' ? DOTPHA.ten(p.ic, v.bac, v.v4) : p.ic), im2 = im && (REN.mip ? REN.mip(im, ic * REN.s * REN.dpr) : im);
      if (im2 && p.xoay) { ctx.save(); ctx.translate(xx + ic / 2, y + h / 2); ctx.rotate(p.xoay); ctx.drawImage(im2, -ic / 2, -ic / 2, ic, ic); ctx.restore(); } // mũi tên Pháo La Bàn: xoay ảnh PNG (QT3)
      else if (im2) ctx.drawImage(im2, xx, y + (h - ic) / 2, ic, ic);
      xx += ic + gap;
      ctx.lineWidth = Math.max(1.5, f * 0.22); ctx.strokeStyle = '#000'; ctx.lineJoin = 'round';
      ctx.strokeText(p.s, xx, y + h / 2 + 0.5);
      ctx.fillStyle = v.sang ? '#ffe46b' : v.mau || '#f2f6fa'; ctx.fillText(p.s, xx, y + h / 2 + 0.5);
      xx += ctx.measureText(p.s).width;
    }
    ctx.restore(); return true;
  },

  // ---------- GENESIS CORE (10/11 "chưa rõ ràng, chưa nhiều thông tin") — chỉ hiển thị, đọc đúng hàm luật (SKILLS.khoisinh) ----------
  //  · thanh đồng hồ nhỏ ngay trên tấm đếm: hồng = đang đếm tới lần tặng kế · hổ phách nhấp nháy = ĐANG CHỜ (không ụ kề nào nhận được)
  //  · ụ kề SẼ được +1★ (K.sapNhan = đúng K.dich của luật): khung hồng quanh ô + mũi tên từ lõi sang + chữ "+1★"; sáng dần khi sắp tặng
  //  Ảnh có sẵn tô màu (tai_day / khung_chon / duong_mui — QUY-TAC-HINH 3), chữ dựng sẵn 1 lần vào bộ đệm REN (không tạo canvas mỗi khung).
  KS_HONG: '#ff8ab0', KS_CHO: '#ffb43a',
  ANH_KS: ['tai_day', 'khung_chon', 'duong_mui'],
  chuKS(ctx, s, mau, f) { // ảnh chữ nhỏ có viền đen, dựng 1 lần theo cỡ điểm ảnh
    const m = ctx.getTransform(), k = m.a > 0 ? m.a : 1, key = 'ks|' + s + '|' + mau + '|' + Math.round(f * k * 2);
    let a = REN.cGet(key);
    if (!a) {
      const x0 = REN.ctxNong ? REN.ctxNong() : null; if (!x0) return null;
      x0.font = '900 ' + f.toFixed(2) + 'px ' + FONT.display; const w = x0.measureText(s).width + 4;
      a = document.createElement('canvas'); a.width = Math.ceil(w * k) + 2; a.height = Math.ceil((f + 4) * k) + 2;
      const q = REN.c2d(a); q.setTransform(k, 0, 0, k, 1, 1);
      q.font = '900 ' + f.toFixed(2) + 'px ' + FONT.display; q.textBaseline = 'middle'; q.textAlign = 'left'; q.lineJoin = 'round';
      q.lineWidth = Math.max(1.5, f * 0.24); q.strokeStyle = '#000'; q.strokeText(s, 2, (f + 4) / 2 + 0.5); q.fillStyle = mau; q.fillText(s, 2, (f + 4) / 2 + 0.5);
      a._w = a.width / k; a._h = a.height / k; REN.cSet(key, a);
    }
    return a;
  },
  veKhoiSinh(ctx, h) {
    const T = h.T, B = h.B, K = SKILLS.khoisinh; if (!K || !K.tienDo || T.st.da || typeof PX === 'undefined') return;
    const n = K.luotCon(T); if (n <= 0) return;
    const c = h.C, al = h.al, p = K.tienDo(T), cho = K.dangCho(B, T), t = typeof G !== 'undefined' ? G.t || 0 : 0;
    ctx.save();
    // 1) thanh đồng hồ (ngay trên tấm đếm ở đáy ô)
    const w = c * 0.5, hh = Math.max(2.5, c * 0.06), y = h.yDay - Math.max(9, c * 0.2) - hh - 3;
    PX.thanh(ctx, h.cx - w / 2, y, w, hh, cho ? 0.55 + 0.45 * Math.abs(Math.sin(t * 3)) : p, cho ? this.KS_CHO : this.KS_HONG);
    // 2) ụ kề sắp được +1★
    const N = !cho && K.sapNhan(B, T);
    if (N && B.o[N.o] && B.o[T.o]) {
      const a = B.o[T.o], b = B.o[N.o], g = Math.atan2(b.y - a.y, b.x - a.x), q = al * (0.45 + 0.55 * p) * (p > 0.85 ? 0.75 + 0.25 * Math.sin(t * 10) : 1);
      const fr = PX.mau('khung_chon', this.KS_HONG);
      if (fr && typeof KG !== 'undefined' && KG.khung9) { ctx.globalAlpha = q; KG.khung9(ctx, fr, b.x - B.cw / 2 + 2, b.y - B.ch / 2 + 2, B.cw - 4, B.ch - 4, 10); }
      const tr = (0.5 + 0.06 * Math.sin(t * 5)), mx = a.x + (b.x - a.x) * tr, my = a.y + (b.y - a.y) * tr, mw = Math.min(B.cw, B.ch) * 0.42;
      PX.ve(ctx, PX.mau('duong_mui', this.KS_HONG), mx, my, mw, mw * 32 / 48, g, Math.min(1, q + 0.4));
      const f = Math.max(7.5, Math.min(B.cw, B.ch) * 0.22), ch = this.chuKS(ctx, '+1', '#ffe0ea', f), sao = REN.img('ic_sao'); // "+1" + ngôi sao PNG (ký tự ★ không có trong phông hiển thị)
      if (ch) {
        const x0 = b.x - B.cw / 2 + 2.5, y0 = b.y - B.ch / 2 + B.ch * 0.15; /* dưới hàng huy hiệu sao (không đè sao) */ ctx.globalAlpha = Math.min(1, q + 0.4); ctx.drawImage(ch, x0, y0, ch._w, ch._h);
        if (sao) { const s = f * 1.05, im = REN.mip ? REN.mip(sao, s * REN.s * REN.dpr) : sao; ctx.drawImage(im, x0 + ch._w - 2.5, y0 + (ch._h - s) / 2, s, s); }
      }
    }
    // 3) 4★+: các ô kề đang được +15% sát thương → kiếm nhỏ (ic_dmg) góc trên-phải ô đó (đúng danh sách ô của luật: oHoTro; chỉ ụ có sát thương)
    if (T.sao >= 4 && !(T.st.bang > 0) && !(T.st.cam > 0) && typeof oHoTro === 'function') {
      const ic = REN.img('ic_dmg'), s = Math.max(8, Math.min(B.cw, B.ch) * 0.24);
      if (ic) { const im = REN.mip ? REN.mip(ic, s * REN.s * REN.dpr) : ic; ctx.globalAlpha = al * 0.95; for (const N of oHoTro(B, T)) { if (!N || N === T || N.st.da || N.st.bang > 0 || !(SKILLS[N.id] && SKILLS[N.id].dmg)) continue; const b = B.o[N.o]; if (b) ctx.drawImage(im, b.x + B.cw / 2 - s - 1.5, b.y - B.ch / 2 + 1.5, s, s); } }
    }
    ctx.restore();
  },

  // ---------- DOM: số ụ trên bàn ở thẻ bộ bài (mình) + dải thẻ bên kia ----------
  dem(B, id) { let n = 0; if (B) for (const X of B.t) if (X && X.id === id) n++; return n; },
  gan(d, lop) {
    let s = d.querySelector('.' + lop); if (s) return s;
    s = document.createElement('span'); s.className = lop; s.innerHTML = '<img src="assets/h2_ic_chong.png" alt=""><b></b>';
    d.appendChild(s); return s;
  },
  ghi(s, n) { if (s._n === n) return; s._n = n; s.dataset.n = n; s.querySelector('b').textContent = n; s.hidden = n <= 0; },
  capNhat() {
    const B = G.ban[0]; if (!B) return;
    document.querySelectorAll('#bo-the .the').forEach(d => this.ghi(d._demU || (d._demU = this.gan(d, 'dem-u')), this.dem(B, d.dataset.id)));
    const D = G.ban[1], dp = document.getElementById('dp-dai');
    if (D && dp && !dp.hidden) dp.querySelectorAll('.dp-the[data-dp="u"]').forEach(d => this.ghi(d._demU || (d._demU = this.gan(d, 'dem-u dp-dem')), this.dem(D, d.dataset.id)));
  },
};

(() => {
  if (typeof document === 'undefined') return;
  if (typeof REN !== 'undefined') for (const t of DEMKN.ANH.concat(DEMKN.ANH_KS)) { if (REN.CO_DINH) REN.CO_DINH.add(t); try { REN.img(t); } catch (e) { } }
  // lớp huy hiệu trên ụ: thêm tấm đếm ở đáy ô (vẽ sau đạn/hiệu ứng, như huy hiệu sao)
  if (typeof ND !== 'undefined') {
    const xep = ND.xep, veHH = ND.veHuyHieu;
    ND.xep = function (T, x, y, C, hs, al, B) { const h = xep.apply(this, arguments); const k = C / Math.min(B.cw, B.ch); h.B = B; h.cx = x; h.yDay = y + (B.ch * k) / 2 - 1.5; h.C = C; return h; };
    ND.veHuyHieu = function (ctx, h) { veHH.apply(this, arguments); if (h.B && h.hs > 0.5) { if (h.T.id === 'khoisinh') { try { DEMKN.veKhoiSinh(ctx, h); } catch (e) { } } try { DEMKN.ve(ctx, h.T, h.B, h.cx, h.yDay, h.C, h.al); } catch (e) { } } if (h.T && h.T.id === 'lualien' && typeof LUA_VET !== 'undefined' && LUA_VET._pop.size) LUA_VET.veHH(ctx, h); }; // Ember: loé lửa + "+N" trên tấm đếm (vangmoi1.js)
  }
  if (typeof UI !== 'undefined') {
    const capGoc = UI.capNhat;
    UI.capNhat = function () { const r = capGoc.apply(this, arguments); try { DEMKN.capNhat(); } catch (e) { console.error('DEMKN', e); } return r; };
  }
})();
window.DEMKN = DEMKN;
