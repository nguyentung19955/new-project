// TURRET MERGE — HÌNH CHIÊU FREEZER (DEEP FREEZE): tung chiêu → sóng sương + mảnh băng bay tới từng ô → bọc băng → lấp lánh → vỡ.
// Chỉ ảnh PNG ChatGPT có sẵn (QUY-TAC-HINH.md): fx_bang_hieu (vòng băng dưới trùm), fx_lanhgia_dan (sóng sương), fx_bang_dan (mảnh băng),
// fx_baotuyet_trung (nổ bông tuyết lúc trúng), phu_bang (khối băng bọc ô), fx_st_dong (vành băng), fx_lanhgia_trung (lấp lánh),
// fx_bang_vo (dải 6 khung vỡ băng). Code chỉ đặt vị trí / xoay / phóng / mờ. Không chữ trên bàn.
// Ảnh mới (khi session điều phối gen xong — docs/demo-hop-tuong/tuvan/freezer/CAN-VE.json): BANGFX.ANH.khoi / .song đổi sang dải mới.
'use strict';
const BANGFX = {
  ANH: { vong: 'fx_bang_hieu', song: 'fx_lanhgia_dan', manh: 'fx_bang_dan', no: 'fx_baotuyet_trung', khoi: 'phu_bang', vanh: 'fx_st_dong', lap: 'fx_lanhgia_trung', vo: 'bang_vo' },
  BAY: 0.32, // giây bay của mảnh băng (game.js: tre = 0.32 + i·0.09)
  // nạp trước ảnh khi trùm Freezer xuất hiện (không chờ lúc tung chiêu mới tải)
  napTruoc() { if (typeof REN === 'undefined') return; for (const k in this.ANH) if (k !== 'vo') REN.img(this.ANH[k]); REN.img('fx_bang_vo'); },
  // trùm tung chiêu (sau 1,4 s báo trước): bùng vòng băng dưới chân
  tung(E) { G.hu.push({ k: 'bangPhep', t: 0, song: 0.55, x: E.x, y: E.y, xa: true }); FX.lac(3); },
  // 1 mảnh băng bay tới ô T của bàn B; tre = lúc chạm (s). Lúc chạm: bọc băng bắt đầu (T.bangT0)
  ban(E, B, T, tre) {
    const c = B.o[T.o]; T.bangT0 = null; T._bangVe = 0;
    G.hu.push({ k: 'bangBay', t: 0, song: tre, bd: Math.max(0, tre - this.BAY), x0: E.x, y0: E.y - 10, x1: c.x, y1: c.y, ban: B.i, uid: T.uid });
  },
  // ô bị bọc: vẽ trong hệ toạ độ tâm ô (render.js veU) — S = cạnh ô
  ve(ctx, T, S, al, R, B, x, y) {
    if (T.bangT0 == null) { // mảnh băng còn đang bay (hoặc băng từ nguồn khác): bọc ngay, không hoạt ảnh vào
      if (!this.dangBay(T)) T.bangT0 = G.t - 1;
      else return;
    }
    T._bangVe = 1;
    const u = Math.min(1, (G.t - T.bangT0) / 0.26), con = T.st.bang;
    const bk = u < 1 ? 0.55 + 0.45 * (1 + 2.70158 * Math.pow(u - 1, 3) + 1.70158 * Math.pow(u - 1, 2)) : 1; // easeOutBack
    const run = con < 0.7 ? Math.sin(R.t * 70) * 1.2 * (1 - con / 0.7) : 0; // sắp vỡ: rung nhẹ
    ctx.save(); ctx.translate(run, 0); ctx.scale(bk, bk);
    ctx.globalAlpha = al * 0.9 * Math.min(1, u * 1.6);
    R.ve1(ctx, this.ANH.khoi, S * 1.04);
    // ánh lạnh lướt qua mặt băng (cộng sáng, chính ảnh khối băng)
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * (0.1 + 0.08 * Math.sin(R.t * 3 + T.o));
    R.ve1(ctx, this.ANH.khoi, S * 1.04);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = al * Math.min(1, u * 1.6);
    R.ve1(ctx, this.ANH.vanh, S * 1.08, '', 0, S * 0.02);
    // lấp lánh sương (xoay chậm, mờ)
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * (0.28 + 0.18 * Math.sin(R.t * 4.3 + T.o * 1.7));
    ctx.rotate(Math.sin(R.t * 0.8 + T.o) * 0.3); R.ve1(ctx, this.ANH.lap, S * 0.7);
    ctx.restore(); ctx.globalAlpha = al; ctx.globalCompositeOperation = 'source-over';
    // hạt sương rơi nhẹ (toạ độ thế giới)
    if (x != null && R.dt && Math.random() < R.dt * 4) FX.hat1('lua', x + (Math.random() - 0.5) * S * 0.7, y + (Math.random() - 0.3) * S * 0.5, 0, 10 + Math.random() * 8, 0.55, 5, '#bff4ff');
  },
  dangBay(T) { for (const o of G.hu) if (o.k === 'bangBay' && o.uid === T.uid) return true; return false; },
  // hết băng / được giải (chỉ huy, Cleanser…): vỡ băng
  vo(T, B, x, y) {
    T._bangVe = 0; T.bangT0 = null;
    const S = Math.min(B.cw, B.ch);
    FX.no(this.ANH.vo, x, y, S * 1.45, 0.42);
    G.hu.push({ k: 'bangVo', t: 0, song: 0.4, x, y, s: S });
    for (let i = 0; i < 7; i++) { const a = i / 7 * 6.283 + Math.random() * 0.5, v = 60 + Math.random() * 60; FX.hat1('lua', x, y, Math.cos(a) * v, Math.sin(a) * v - 20, 0.4, 7, '#d8f6ff'); }
    if (typeof SND !== 'undefined' && SND.bang) try { SND.bang(); } catch (e) { }
  },
};

// vòng băng bùng dưới chân trùm lúc tung chiêu
HU.bangPhep = {
  ve(ctx, o, R) {
    const u = o.t / o.song, e = 1 - Math.pow(1 - u, 3);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = Math.max(0, 1 - u) * 0.95; R.anhGiua(ctx, BANGFX.ANH.vong, o.x, o.y + 8, 56 + 44 * e);
    ctx.globalAlpha = Math.max(0, 1 - u * 1.6); R.anhGiua(ctx, BANGFX.ANH.no, o.x, o.y - 6, 50 + 40 * e, u * 1.2);
    ctx.restore(); ctx.globalAlpha = 1;
  },
};
// sóng sương + mảnh băng bay vòng cung từ trùm tới ô
HU.bangBay = {
  ve(ctx, o, R) {
    if (o.t < o.bd) return;
    const u = Math.min(1, (o.t - o.bd) / Math.max(0.05, o.song - o.bd)), e = u * u * (3 - 2 * u), cao = Math.min(70, Math.hypot(o.x1 - o.x0, o.y1 - o.y0) * 0.25);
    const vt = (k) => [o.x0 + (o.x1 - o.x0) * k, o.y0 + (o.y1 - o.y0) * k - Math.sin(k * Math.PI) * cao];
    const [x, y] = vt(e), [xa, ya] = vt(Math.max(0, e - 0.06)), goc = Math.atan2(y - ya, x - xa);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.75 * (1 - u * 0.4); R.anhGiua(ctx, BANGFX.ANH.song, xa, ya, 78, goc);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; R.anhGiua(ctx, BANGFX.ANH.manh, x, y, 58, goc);
    ctx.restore(); ctx.globalAlpha = 1;
    if (R.dt && Math.random() < R.dt * 30) FX.hat1('lua', x, y, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, 0.3, 6, '#bff4ff');
  },
  het(G, o) { // chạm ô: nổ bông tuyết + bắt đầu bọc băng
    const B = G.ban[o.ban], T = B && B.t.find(X => X && X.uid === o.uid);
    if (T && T.st.bang > 0) T.bangT0 = G.t;
    G.hu.push({ k: 'bangCham', t: 0, song: 0.34, x: o.x1, y: o.y1 });
  },
};
HU.bangCham = {
  ve(ctx, o, R) {
    const u = o.t / o.song; ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = Math.max(0, 1 - u); R.anhGiua(ctx, BANGFX.ANH.no, o.x, o.y, 40 + 46 * (1 - Math.pow(1 - u, 2)), u * 0.8);
    ctx.restore(); ctx.globalAlpha = 1;
  },
};
// mảnh vỡ: vành băng nở ra + mờ dần (đi kèm dải fx_bang_vo)
HU.bangVo = {
  ve(ctx, o, R) {
    const u = o.t / o.song; ctx.save(); ctx.globalAlpha = Math.max(0, 1 - u) * 0.9;
    R.anhGiua(ctx, BANGFX.ANH.vanh, o.x, o.y, o.s * (1.08 + 0.45 * u));
    ctx.restore(); ctx.globalAlpha = 1;
  },
};

// nạp trước ảnh khi trùm Freezer ra sân
(function () {
  if (typeof UI === 'undefined' || !UI.canhBaoTrum) return;
  const g = UI.canhBaoTrum;
  UI.canhBaoTrum = function (id) { if (id === 'freezer') BANGFX.napTruoc(); return g.apply(this, arguments); };
})();
