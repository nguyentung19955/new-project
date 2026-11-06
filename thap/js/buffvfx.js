// TURRET MERGE — BUFF = HIỆU ỨNG TRÊN ỤNG (thay ký hiệu 12 px + nhãn nổi "MAX 300%!", "DICE 241%", "OVERCLOCK +65%"…)
// Người chơi: "hiệu tăng dame khó nhìn quá, làm hiệu ứng được không" → mỗi loại buff = 1 hào quang ChatGPT lặp (3 khung ~8 fps)
// quanh/dưới đầu súng; độ mạnh buff → độ đậm + cỡ; vừa nhận (false→true) → bùng 1 lần (khung 4). Tối đa 2 hào quang/ụ
// (mạnh nhất), còn lại chỉ ở bảng chạm. Proc 1 lần (xúc xắc tối đa, phát thứ 5…) = bùng ngắn, không chữ.
// Ảnh: assets/fxb_<k>.png = dải 4 khung vuông (1-3 lặp, 4 bùng), cắt từ raw_fx_BUFF1/2.png (nền magenta, tâm trong suốt).
// QUY-TAC-HINH: code chỉ đặt vị trí/phóng/mờ/khung ảnh PNG — chưa có ảnh thì KHÔNG vẽ gì thay.
'use strict';

const BVX = {
  // k → ảnh + mức "đầy" (buff đạt mức này = đậm/cỡ tối đa) + ưu tiên khi bằng nhau
  LOAI: {
    max:   { anh: 'fxb_max',   day: 1,    uu: 9 }, // MAX POWER vàng: Rage chỉ huy (×2 sát thương)
    dmg:   { anh: 'fxb_dmg',   day: 0.4,  uu: 6 }, // DAMAGE UP lửa đỏ cam
    toc:   { anh: 'fxb_toc',   day: 0.45, uu: 5 }, // FIRE RATE UP vòng tốc vàng
    crit:  { anh: 'fxb_crit',  day: 0.3,  uu: 4 }, // CRIT UP vòng lấp lánh tím
    khien: { anh: 'fxb_khien', day: 1,    uu: 8 }, // SHIELD bong bóng lục giác vàng
    chet:  { anh: 'fxb_chet',  day: 0.04, uu: 7 }, // EXECUTE linh hồn xanh lục
    cham:  { anh: 'fxb_cham',  day: 0.5,  uu: 3 }, // SLOW TOUCH vòng băng
    mana:  { anh: 'fxb_mana',  day: 1,    uu: 2 }, // MANA GAIN tinh thể tím (chỉ bùng khi sinh mana)
  },
  ANH: ['fxb_max', 'fxb_dmg', 'fxb_toc', 'fxb_crit', 'fxb_khien', 'fxb_chet', 'fxb_cham', 'fxb_mana'],
  NGUONG: 0.05, CHU_KY: 0.2, // lấy mẫu buff 5 lần/giây (không tính mỗi khung)

  // độ mạnh từng loại trên ụ (đã trừ mốc sao chung +20% tốc — mọi ụ 3★ đều có, không phải buff)
  doManh(T, B, out) {
    const b = T.buf; out.max = out.dmg = out.toc = out.crit = out.khien = out.chet = out.cham = 0;
    if (!b) return out;
    const moc = typeof mocChung === 'function' && mocChung(T, 3) && loaiMoc(T.id) !== 'ht' ? 0.2 : 0;
    out.dmg = (b.dmg || 0) + (b.dkHien || 0) + (T.aurora > 0 ? knThe(G.ban[T.ban], 'mimic') / 100 : 0); // dkHien: sát thương có điều kiện từ hỗ trợ (hotro.js — lộ / chậm / cầu vồng / liên tiếp)
    out.toc = (b.toc || 0) - moc + (T.epxung || 0);
    out.crit = (b.crit || 0) + (b.cdmg || 0) * 0.3;
    out.cham = b.cham || 0; out.chet = b.chet || 0;
    if (B && B.cuong > 0 && SKILLS[T.id] && SKILLS[T.id].dmg) out.max = 1; // Rage ×2 sát thương: chỉ ụ có sát thương
    if (T.khien > 0 || (B && B.khien > 0)) out.khien = 1;
    else if (T.ht && T.ht.khang > 0) out.khien = 0.45; // Mirror Gate kề: kháng khống chế (bong bóng mờ hơn khiên thật)
    return out;
  },
  _m: {}, _tf: -1, _n: 0, _nTruoc: 0,
  capNhat(T, B) {
    const now = VX.t; let v = T._bv;
    if (!v) v = T._bv = { het: -1, ds: [], on: {}, tat: {}, s: {} };
    if (now < v.het) return v;
    v.het = now + this.CHU_KY;
    const m = this.doManh(T, B, this._m), ds = v.ds; ds.length = 0;
    for (const k in this.LOAI) {
      if (k === 'mana') continue;
      const s = m[k] || 0, L = this.LOAI[k];
      if (s > this.NGUONG * (k === 'chet' ? 0.1 : 1)) {
        const n = Math.min(1, s / L.day);
        if (!v.on[k]) { v.on[k] = now; if (now - (v.tat[k] || -9) > 0.6 && v.daCo) this.bung(T, B, k, n); }
        v.s[k] = n; ds.push(k);
      } else if (v.on[k]) { v.on[k] = 0; v.tat[k] = now; }
    }
    v.daCo = true; // lần lấy mẫu đầu (ụ vừa đặt / vào trận) không bùng
    ds.sort((a, b) => (v.s[b] + this.LOAI[b].uu * 0.01) - (v.s[a] + this.LOAI[a].uu * 0.01) + (this.LOAI[b].uu >= 8) - (this.LOAI[a].uu >= 8));
    if (ds.length > 2) ds.length = 2;
    return v;
  },
  // hào quang lặp DƯỚI đầu súng (ctx đã dời về tâm ụ)
  ve(ctx, T, S, al, R) {
    if (!T || T.st.da || !T.buf) return;
    const B = G.ban[T.ban], v = this.capNhat(T, B);
    if (!v.ds.length) return;
    if (VX.t !== this._tf) { this._tf = VX.t; this._nTruoc = this._n; this._n = 0; } // đếm ụ có hào quang ở khung trước
    this._n++;
    const lim = this._nTruoc > 8 ? 1 : 2; // bàn đông (>8 ụ có buff): mỗi ụ chỉ 1 hào quang mạnh nhất → gọn mắt + giữ fps
    const px = S * 1.4;
    ctx.save(); ctx.globalCompositeOperation = 'source-over';
    for (let i = Math.min(lim, v.ds.length) - 1; i >= 0; i--) { // hào quang thứ 2 to hơn, mờ hơn (vòng ngoài); mạnh nhất ở trong, rõ màu
      const k = v.ds[i], co = px * (i ? 1.12 : 1), dai = R.coDai(this.LOAI[k].anh, co); if (!dai) continue; // dải đã thu đúng cỡ vẽ → vẽ 1:1
      const n = v.s[k] || 0.5, vao = Math.min(1, (VX.t - v.on[k]) / 0.25);
      const f = ((VX.t * 8 + (T.pha || 0) * 3) | 0) % 3, fm = dai.fm, sx = f * (fm + dai.gap);
      const r = co / 2 * (vao < 1 ? 0.7 + 0.3 * vao : 1);
      ctx.globalAlpha = al * vao * (0.62 + 0.38 * n) * (i ? 0.7 : 1); // độ mạnh buff → độ đậm; màu thật của ảnh (không cộng sáng → không bạc trắng)
      ctx.drawImage(dai, sx, 0, fm, fm, -r, -r, r * 2, r * 2);
    }
    ctx.restore(); ctx.globalAlpha = al;
  },
  // bùng 1 lần (khung 4) trên ụ — proc / vừa nhận buff
  bung(T, B, k, n) {
    if (!T || !B || T.o == null) return;
    VX.ds.push({ k: 'bvx', B, T, o: T.o, a: k, t0: VX.t, dai: 0.5, n: n == null ? 1 : n });
  },
  bungO(x, y, k, co, B) { VX.ds.push({ k: 'bvx', x, y, a: k, t0: VX.t, dai: 0.45, n: 1, co, B }); }, // trên quái
  veBung(ctx, R, e, tt) {
    const L = this.LOAI[e.a]; if (!L) return false;
    let x = e.x, y = e.y, S;
    if (e.T) { const B = e.B; if (!B || !B.o[e.o]) return true; const c = B.o[e.o]; x = c.x; y = c.y; S = Math.min(B.cw, B.ch) * 0.98; }
    else S = e.co || 40;
    const dai = R.coDai(L.anh, S * 1.5); if (!dai) return false;
    const u = Math.min(1, tt / e.dai), fm = dai.fm, sx = 3 * (fm + dai.gap);
    const r = S * 0.75 * (0.75 + 0.55 * VX.eo(u)) * (0.85 + 0.15 * e.n);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = u < 0.2 ? u / 0.2 : 1 - (u - 0.2) / 0.8;
    ctx.drawImage(dai, sx, 0, fm, fm, x - r, y - r, r * 2, r * 2);
    ctx.restore(); ctx.globalAlpha = 1;
    return true;
  },
  co(k) { return !!REN.img(this.LOAI[k].anh); },
};

// proc thay nhãn chữ: gọi từ kỹ năng (giữ trễ lúc đang ghép giống nhanU)
function buffNo(T, k, n) {
  if (G._treNhan && typeof VX !== 'undefined') { const d = G._treNhan; VX.hen(d, () => buffNo(T, k, n)); return; }
  if (!T || T.ban == null) return;
  BVX.bung(T, G.ban[T.ban], k, n);
}

// móc: hào quang dưới đầu súng (sau hào quang thức tỉnh của growfx)
(function () {
  const _dd = VX.duoiDau;
  VX.duoiDau = function (ctx, T, S, al, R) { _dd.call(this, ctx, T, S, al, R); BVX.ve(ctx, T, S, al, R); };
  const _vd = VX.veDs;
  VX.veDs = function (ctx, R) {
    _vd.call(this, ctx, R);
    for (const e of this.ds) { if (e.k !== 'bvx') continue; const tt = this.t - e.t0; if (tt >= 0 && tt < e.dai) BVX.veBung(ctx, R, e, tt); }
  };
  // proc cũ vẽ bằng ký hiệu code → bùng ảnh ChatGPT khi đã có ảnh
  const _chem = VX.chem, _ck = VX.chanKhien, _mn = VX.manaRa;
  VX.chem = function (E) { if (BVX.co('chet')) { if (E.daChem) return; E.daChem = true; BVX.bungO(E.x, E.y - (E.d.co || 40) * 0.3, 'chet', (E.d.co || 40) * 1.1); return; } return _chem.call(this, E); };
  VX.chanKhien = function (B, T) { if (BVX.co('khien') && T) return BVX.bung(T, B, 'khien', 1); return _ck.call(this, B, T); };
  VX.manaRa = function (B, T) { if (BVX.co('mana') && T) return BVX.bung(T, B, 'mana', 0.7); return _mn.call(this, B, T); };
})();
