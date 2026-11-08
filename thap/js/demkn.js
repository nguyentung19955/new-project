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
    railgun(T, B) {
      const b = SKILLS.railgun.bingo(B, T), m = [];
      if (b.ngang >= 2) m.push({ ic: 'ic_dmg', s: b.ngang + '/5' }); // tiến độ tới hàng ĐẦY Railgun (chỉ hàng đầy mới có thưởng)
      if (b.doc >= 2) m.push({ ic: 'ic_toc', s: b.doc + '/3' });
      return m.length ? { m, sang: b.ngang >= 5 || b.doc >= 3 } : null;
    },
    cuuvi(T) { const n = T.duoi || 0; return n > 0 ? { m: [{ ic: 'ic_chet', s: n + '/9' }], sang: n >= 8 } : null; },
    tienhoa(T) { const S = SKILLS.tienhoa; if (S.chay(T)) return { m: [{ ic: 'ic_mana', s: '+' + S.MANA }], sang: true }; return { m: [{ ic: 'trung_1', s: Math.ceil(S.con(T)) + 's' }] }; }, // trứng: giây tới lúc nở · trứng cháy: chạm = +20 mana
    mauhut(T) { const m = []; if (T.mh) m.push({ ic: 'mauhut_phu', s: Math.ceil(Math.max(0, T.mh.con)) + 's' }); if (T.mau) m.push({ ic: 'ic_dmg', s: T.mau + '' }); return m.length ? { m, sang: (T.mau || 0) >= 10 } : null; }, // Mạch Máu: giây còn tới lúc nuốt + Máu
    bienmau(T) { const S = SKILLS.bienmau, f = S.n(T); if (f > 0) return { m: [{ ic: S.dauAnh(T), s: '×' + f }], sang: f >= 5 }; const n = T.pms || 0; return n > 0 ? { m: [{ ic: S.ANH[S.mau(T)], s: n + '' }], sang: n >= S.tran(T) } : null; }, // Prism: đơn = mặt nạ màu + cộng dồn · HỢP THỂ = mặt nạ 4 màu + số hợp thể (×n)
    loren(T) { const n = Math.min(14, T.lo || 0); return n > 0 ? { m: [{ ic: T.dang === 'toc' ? 'ic_toc' : 'ic_dmg', s: n + '/14' }], sang: n >= 14 } : null; }, // Twin Anvil: icon dạng (ST / tốc) + cộng dồn
    // VỰC SÂU (ABYSS): icon xoáy vực riêng (không dùng ic_dmg chung) + chữ xanh biển sâu; không trần → luôn hiện số (≥100 chữ sáng hơn)
    leviathan(T) { const n = T.vuc || 0; return n > 0 ? { m: [{ ic: DEMKN.icVuc(), s: '' + n }], mau: n >= 100 ? '#b8f6ff' : '#5fe3ff' } : null; },
    // Rồng Máy: NHIỆT lò (không trần) — ngọn lửa cam <100 · vàng ≥100 QUÁ NHIỆT · trắng ≥250 NÓNG CHẢY (chữ vàng = đang có thưởng mốc)
    ronglua(T) { const n = Math.floor(T.nhiet || 0); return n > 0 ? { m: [{ ic: n >= 250 ? 'lua_t1' : n >= 100 ? 'lua_t3' : 'fx_cuuvi_dan', s: '' + n }], sang: n >= 100 } : null; },
    nangluong(T, B) { const k = Math.round(SKILLS.nangluong.k(B) * 100); return k > 0 ? { m: [{ ic: 'ic_mana', s: '+' + k + '%' }], sang: k >= 500 } : null; },
    // (Sói: bỏ bộ đếm mạng — Sói không còn lớn dần theo mạng; dạng thường / thức tỉnh quay lúc sinh)
    docton(T, B) { const n = SKILLS.docton.ke(B, T); return n === 0 ? { m: [{ ic: 'ic_toc', s: '+100%' }], sang: true } : n >= 3 ? { m: [{ ic: 'ic_toc', s: '−30%' }] } : null; },
  },
  ANH: ['h2_tag', 'h2_ic_chong', 'ic_sao', 'ic_dmg', 'ic_toc', 'ic_chet', 'ic_mana', 'fx_leviathan_hieu', 'lev_abyss', 'fx_cuuvi_dan', 'lua_t1', 'lua_t3'],
  // icon VỰC SÂU: ảnh ChatGPT lev_abyss (docs/demo-hop-tuong/tuvan/leviathan/CAN-VE.json) — chưa có thì xoáy nước fx_leviathan_hieu (ảnh ChatGPT sẵn có)
  IC_VUC: 'lev_abyss',
  icVuc() { return this.IC_VUC || 'fx_leviathan_hieu'; },

  // ĐỘT PHÁ (vangmoi1.js DOTPHA): bậc 1–4 → icon PNG lọc màu (vàng / lam / tím / trắng, ảnh dựng 1 lần) + chữ cùng màu
  lay(T, B) { const f = this.DS[T.id]; if (!f || !B || T.st.da) return null; try { const v = f(T, B); if (v && typeof DOTPHA !== 'undefined') { const b = DOTPHA.bacU(T); if (b) { v.bac = b; v.v4 = b === 4 ? DOTPHA.buoc4() : -1; v.mau = b === 4 ? ['#ffb0b0', '#fff0a0', '#b0ffb8', '#a8f4ff', '#b8c4ff', '#ffb8f4'][v.v4] : DOTPHA.MAU[b]; v.sang = false; if (T.id === 'lualien') v.giuMau = 1; } } return v; } catch (e) { return null; } }, // Ember (lualien): icon lửa lua_t1–4 đã tô màu theo mốc → giuMau, không phủ lọc màu bậc (sửa lỗi tester 08/11)

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
    const v = this.lay(T, B); if (!v) return;
    const h = Math.max(9, c * 0.2), m = ctx.getTransform(), k = m.a;
    if (!(k > 0) || Math.abs(m.b) > 1e-6 || Math.abs(m.c) > 1e-6 || Math.abs(m.d - k) > 1e-6 || typeof REN === 'undefined' || !REN.cGet) return this.ve0(ctx, v, x, yDay, h, al);
    const hp = Math.round(h * k * 4) / 4, key = 'dk|' + hp + '|' + (v.sang ? 1 : 0) + '|' + (v.mau || '') + '|' + (v.bac || 0) + (v.giuMau ? 'g' : '') + (v.v4 >= 0 ? 'h' + v.v4 : '') + '|' + v.m.map(p => p.ic + ':' + (p.xoay || 0) + ':' + p.s).join(',');
    let a = REN.cGet(key);
    if (!a) {
      if (!REN.img('h2_tag')) return;
      if (v.m.some(q => !REN.img(q.ic))) return this.ve0(ctx, v, x, yDay, h, al); // icon chưa nạp: vẽ thẳng, chưa dựng ảnh đệm (tránh đệm thiếu icon mãi)
      const hl = hp / k, x0 = this.rong(v, hl);
      a = document.createElement('canvas'); a.width = Math.ceil(x0 * k) + 2; a.height = Math.ceil(hl * k) + 3;
      const q = REN.c2d(a); q.setTransform(k, 0, 0, k, 1, 1);
      if (!this.ve0(q, v, x0 / 2, hl + 1, hl, 1)) return;
      a._w = x0; REN.cSet(key, a);
    }
    const dx = Math.round(m.a * (x - a._w / 2) + m.e) - 1, dy = Math.round(m.d * (yDay - hp / k - 1) + m.f) - 1;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = al; ctx.drawImage(a, dx, dy); ctx.restore();
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
  if (typeof REN !== 'undefined') for (const t of DEMKN.ANH) { if (REN.CO_DINH) REN.CO_DINH.add(t); try { REN.img(t); } catch (e) { } }
  // lớp huy hiệu trên ụ: thêm tấm đếm ở đáy ô (vẽ sau đạn/hiệu ứng, như huy hiệu sao)
  if (typeof ND !== 'undefined') {
    const xep = ND.xep, veHH = ND.veHuyHieu;
    ND.xep = function (T, x, y, C, hs, al, B) { const h = xep.apply(this, arguments); const k = C / Math.min(B.cw, B.ch); h.B = B; h.cx = x; h.yDay = y + (B.ch * k) / 2 - 1.5; h.C = C; return h; };
    ND.veHuyHieu = function (ctx, h) { veHH.apply(this, arguments); if (h.B && h.hs > 0.5) { try { DEMKN.ve(ctx, h.T, h.B, h.cx, h.yDay, h.C, h.al); } catch (e) { } } if (h.T && h.T.id === 'lualien' && typeof LUA_VET !== 'undefined' && LUA_VET._pop.size) LUA_VET.veHH(ctx, h); }; // Ember: loé lửa + "+N" trên tấm đếm (vangmoi1.js)
  }
  if (typeof UI !== 'undefined') {
    const capGoc = UI.capNhat;
    UI.capNhat = function () { const r = capGoc.apply(this, arguments); try { DEMKN.capNhat(); } catch (e) { console.error('DEMKN', e); } return r; };
  }
})();
window.DEMKN = DEMKN;
