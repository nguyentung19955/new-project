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
    ngoisao(T, B) { const n = SKILLS.ngoisao.tong(B); return { m: [{ ic: 'ic_sao', s: n + '/50' }], sang: n >= 50 || (n > 0 && n % 10 === 0) }; },
    combo(T, B) { const n = B.combo || 0; return n > 0 ? { m: [{ ic: 'ic_dmg', s: '×' + n }], sang: n >= 20 } : null; },
    lienket(T, B) { const n = SKILLS.lienket.nhom(B, T); return n >= 2 ? { m: [{ ic: 'ic_dmg', s: '×' + n }] } : null; },
    dongbo(T, B) { const n = SKILLS.dongbo.dem(B, T); return n > 0 ? { m: [{ ic: 'ic_dmg', s: '×' + n }], sang: n >= 3 } : null; },
    luoicheo(T) { const n = SKILLS.luoicheo.dem(T); return n > 0 ? { m: [{ ic: 'ic_dmg', s: n + '/4' }], sang: n >= 4 } : null; },
    railgun(T, B) {
      const b = SKILLS.railgun.bingo(B, T), m = [];
      if (b.ngang >= 2) m.push({ ic: 'ic_dmg', s: b.ngang + '/5' });
      if (b.doc >= 2) m.push({ ic: 'ic_toc', s: b.doc + '/3' });
      return m.length ? { m, sang: b.ngang >= 5 || b.doc >= 3 } : null;
    },
    cuuvi(T) { const n = T.duoi || 0; return n > 0 ? { m: [{ ic: 'ic_chet', s: n + '/9' }], sang: n >= 8 } : null; },
    loren(T) { const n = T.lo || 0; return n > 0 ? { m: [{ ic: 'ic_dmg', s: n + '/' + SKILLS.loren.MAX }], sang: n >= SKILLS.loren.MAX } : null; },
    leviathan(T) { const n = T.vuc || 0; return n > 0 ? { m: [{ ic: 'ic_dmg', s: '' + n }], sang: n >= 100 } : null; },
    nangluong(T, B) { const k = Math.round(SKILLS.nangluong.k(B) * 100); return k > 0 ? { m: [{ ic: 'ic_mana', s: '+' + k + '%' }], sang: k >= 500 } : null; },
    soi(T) { const n = T.giet || 0; return n > 0 ? { m: [{ ic: 'ic_chet', s: '' + n }] } : null; },
    docton(T, B) { const n = SKILLS.docton.ke(B, T); return n === 0 ? { m: [{ ic: 'ic_toc', s: '+100%' }], sang: true } : n >= 3 ? { m: [{ ic: 'ic_toc', s: '−30%' }] } : null; },
  },
  ANH: ['h2_tag', 'h2_ic_chong', 'ic_sao', 'ic_dmg', 'ic_toc', 'ic_chet', 'ic_mana'],

  lay(T, B) { const f = this.DS[T.id]; if (!f || !B || T.st.da) return null; try { return f(T, B); } catch (e) { return null; } },

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
  ve(ctx, T, B, x, yDay, c, al) {
    const v = this.lay(T, B); if (!v) return;
    const h = Math.max(9, c * 0.2), f = h * 0.7, ic = h * 0.92, gap = h * 0.12, pad = h * 0.42;
    ctx.save();
    ctx.font = '900 ' + f.toFixed(2) + 'px ' + FONT.display; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    let w = pad * 2; for (let i = 0; i < v.m.length; i++) w += ic + gap + ctx.measureText(v.m[i].s).width + (i ? h * 0.3 : 0);
    const y = yDay - h - 1; let xx = x - w / 2;
    ctx.globalAlpha = al;
    if (!this.khung(ctx, xx, y, w, h)) { ctx.restore(); return; }
    xx += pad;
    for (let i = 0; i < v.m.length; i++) {
      const p = v.m[i]; if (i) xx += h * 0.3;
      const im = REN.img(p.ic); if (im) ctx.drawImage(REN.mip ? REN.mip(im, ic * REN.s * REN.dpr) : im, xx, y + (h - ic) / 2, ic, ic);
      xx += ic + gap;
      ctx.lineWidth = Math.max(1.5, f * 0.22); ctx.strokeStyle = '#000'; ctx.lineJoin = 'round';
      ctx.strokeText(p.s, xx, y + h / 2 + 0.5);
      ctx.fillStyle = v.sang ? '#ffe46b' : '#f2f6fa'; ctx.fillText(p.s, xx, y + h / 2 + 0.5);
      xx += ctx.measureText(p.s).width;
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
  if (typeof REN !== 'undefined') for (const t of DEMKN.ANH) { if (REN.CO_DINH) REN.CO_DINH.add(t); try { REN.img(t); } catch (e) { } }
  // lớp huy hiệu trên ụ: thêm tấm đếm ở đáy ô (vẽ sau đạn/hiệu ứng, như huy hiệu sao)
  if (typeof ND !== 'undefined') {
    const xep = ND.xep, veHH = ND.veHuyHieu;
    ND.xep = function (T, x, y, C, hs, al, B) { const h = xep.apply(this, arguments); const k = C / Math.min(B.cw, B.ch); h.B = B; h.cx = x; h.yDay = y + (B.ch * k) / 2 - 1.5; h.C = C; return h; };
    ND.veHuyHieu = function (ctx, h) { veHH.apply(this, arguments); if (h.B && h.hs > 0.5) { try { DEMKN.ve(ctx, h.T, h.B, h.cx, h.yDay, h.C, h.al); } catch (e) { } } };
  }
  if (typeof UI !== 'undefined') {
    const capGoc = UI.capNhat;
    UI.capNhat = function () { const r = capGoc.apply(this, arguments); try { DEMKN.capNhat(); } catch (e) { console.error('DEMKN', e); } return r; };
  }
})();
window.DEMKN = DEMKN;
