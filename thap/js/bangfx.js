// TURRET MERGE — HÌNH CHIÊU FREEZER (DEEP FREEZE): vòng sương dưới chân trùm → sóng sương bay tới từng ô → khối băng hình thành
// → lấp lánh khi bị đóng băng → nứt lúc sắp hết → vỡ khi hết / được giải. Mọi chế độ dùng chung (render.js veU + G.hu).
// Ảnh ChatGPT (QUY-TAC-HINH.md): raw_p14_ice_block / raw_p14_frost_wave / raw_p14_frost_cast (docs/demo-hop-tuong/thap-art/)
// cắt bằng tools/thap-cat-p14-bang.py → fx_p14_khoi (16 khung), fx_p14_song (8), fx_p14_vong (8). Code chỉ đặt vị trí / xoay / phóng / mờ / chọn khung.
// Nhẹ máy: mọi dải vẽ qua REN.coDai (thu nhỏ sẵn từng khung đúng cỡ màn, 1 lần / cỡ) → mỗi ô 1 drawImage mỗi khung hình. Không chữ trên bàn.
'use strict';
const BANGFX = {
  ANH: { vong: 'fx_p14_vong', song: 'fx_p14_song', khoi: 'fx_p14_khoi', no: 'fx_baotuyet_trung' },
  KHOI_K: 1.1472, // cạnh khung / cạnh thân khối băng (in ra bởi tools/thap-cat-p14-bang.py) → thân băng khít 1 ô
  CO_VONG: 130, CO_SONG: 90, // cỡ vẽ CSS (dải cắt sẵn 3× cỡ này)
  BAY: 0.32, // giây bay của sóng sương (game.js: tre = 0.32 + i·0.09)
  VAO: 0.24, NUT: 1.2, VO: 0.45, // giây: hình thành (khung 1-4) · nứt trước khi hết (9-12) · vỡ (13-16)
  napTruoc() { if (typeof REN === 'undefined') return; for (const k in this.ANH) REN.img(this.ANH[k]); },
  dai(R, ten, co) { return R.coDai ? R.coDai(ten, co) : null; },
  khung(ctx, R, ten, f, x, y, co, goc) { const d = this.dai(R, ten, co); return d ? R.khung(ctx, ten, f, x, y, co, goc, d) : false; },
  // trùm tung chiêu (sau 1,4 s báo trước): vòng sương bùng dưới chân
  tung(E) { G.hu.push({ k: 'bangPhep', t: 0, song: 0.6, x: E.x, y: E.y }); FX.lac(3); },
  // 1 sóng sương bay tới ô T của bàn B; tre = lúc chạm (s). Lúc chạm: khối băng bắt đầu hình thành (T.bangT0)
  ban(E, B, T, tre) {
    const c = B.o[T.o]; T.bangT0 = null; T._bangVe = 0;
    G.hu.push({ k: 'bangBay', t: 0, song: tre, bd: Math.max(0, tre - this.BAY), x0: E.x, y0: E.y - 10, x1: c.x, y1: c.y, ban: B.i, uid: T.uid });
  },
  // ô bị bọc: vẽ trong hệ toạ độ tâm ô (render.js veU) — S = cạnh ô
  ve(ctx, T, S, al, R, B, x, y) {
    if (T.bangT0 == null) { // sóng còn đang bay: chưa bọc; băng từ nguồn khác: bọc ngay (bỏ pha hình thành)
      if (!this.dangBay(T)) T.bangT0 = G.t - this.VAO;
      else return;
    }
    T._bangVe = 1; T._bangS = S;
    const tt = G.t - T.bangT0, con = T.st.bang;
    let f;
    if (tt < this.VAO) f = Math.min(3, Math.floor(tt / this.VAO * 4));                       // 1-4 hình thành
    else if (con < this.NUT) f = 8 + Math.min(3, Math.floor((1 - con / this.NUT) * 4));      // 9-12 nứt dần
    else f = 4 + (Math.floor(R.t * 7 + T.o * 1.3) & 3);                                      // 5-8 lấp lánh
    const run = con < 0.6 ? Math.sin(R.t * 70) * 1.1 * (1 - con / 0.6) : 0; // sắp vỡ: rung nhẹ
    ctx.globalAlpha = al;
    this.khung(ctx, R, this.ANH.khoi, f, run, 0, S * this.KHOI_K, 0);
    // hạt sương rơi nhẹ (toạ độ thế giới, thưa)
    if (x != null && R.dt && Math.random() < R.dt * 2.5) FX.hat1('lua', x + (Math.random() - 0.5) * S * 0.7, y + (Math.random() - 0.3) * S * 0.5, 0, 10 + Math.random() * 8, 0.55, 5, '#bff4ff');
  },
  dangBay(T) { for (const o of G.hu) if (o.k === 'bangBay' && o.uid === T.uid) return true; return false; },
  // hết băng / được giải (chỉ huy, Cleanser…): khối băng vỡ (khung 13-16) tại ô
  vo(T, B, x, y) {
    T._bangVe = 0; T.bangT0 = null;
    const S = T._bangS || Math.min(B.cw, B.ch);
    G.hu.push({ k: 'bangVo', t: 0, __t: 0, song: this.VO, x, y, co: S * this.KHOI_K }); // __t: đẩy vào GIỮA lúc vẽ (render.js noiSuy/traLai khôi phục o.t = o.__t) → thiếu __t thì t = undefined, không bao giờ hết
    for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283 + Math.random() * 0.6, v = 60 + Math.random() * 60; FX.hat1('lua', x, y, Math.cos(a) * v, Math.sin(a) * v - 20, 0.4, 7, '#d8f6ff'); }
    if (typeof SND !== 'undefined' && SND.bang) try { SND.bang(); } catch (e) { }
  },
};

// vòng sương bùng dưới chân trùm lúc tung chiêu (vẽ dưới quái)
HU.bangPhep = {
  duoi: true,
  ve(ctx, o, R) {
    const u = Math.min(0.999, o.t / o.song);
    ctx.globalAlpha = 1; BANGFX.khung(ctx, R, BANGFX.ANH.vong, Math.floor(u * 8), o.x, o.y + 8, BANGFX.CO_VONG, 0);
  },
};
// sóng sương bay vòng cung từ trùm tới ô, mũi băng xoay theo hướng bay; dải 8 khung lặp
HU.bangBay = {
  ve(ctx, o, R) {
    if (o.t < o.bd) return;
    const u = Math.min(1, (o.t - o.bd) / Math.max(0.05, o.song - o.bd)), e = u * u * (3 - 2 * u), cao = Math.min(70, Math.hypot(o.x1 - o.x0, o.y1 - o.y0) * 0.25);
    const vt = (k) => [o.x0 + (o.x1 - o.x0) * k, o.y0 + (o.y1 - o.y0) * k - Math.sin(k * Math.PI) * cao];
    const [x, y] = vt(e), [xa, ya] = vt(Math.max(0, e - 0.04)), goc = Math.atan2(y - ya, x - xa);
    ctx.globalAlpha = Math.min(1, u * 5);
    BANGFX.khung(ctx, R, BANGFX.ANH.song, Math.floor(o.t * 20 + o.uid), x, y, BANGFX.CO_SONG, goc);
    ctx.globalAlpha = 1;
  },
  het(G, o) { // chạm ô: bông tuyết nhỏ + khối băng bắt đầu hình thành
    const B = G.ban[o.ban], T = B && B.t.find(X => X && X.uid === o.uid);
    if (T && T.st.bang > 0) T.bangT0 = G.t;
    G.hu.push({ k: 'bangCham', t: 0, song: 0.3, x: o.x1, y: o.y1 });
  },
};
HU.bangCham = {
  ve(ctx, o, R) {
    const u = o.t / o.song; ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = Math.max(0, 1 - u) * 0.8; R.anhGiua(ctx, BANGFX.ANH.no, o.x, o.y, 36 + 36 * (1 - Math.pow(1 - u, 2)), u * 0.8);
    ctx.restore(); ctx.globalAlpha = 1;
  },
};
// khối băng vỡ tung (khung 13-16)
HU.bangVo = {
  ve(ctx, o, R) {
    const u = Math.min(0.999, o.t / o.song);
    ctx.globalAlpha = 1; BANGFX.khung(ctx, R, BANGFX.ANH.khoi, 12 + Math.floor(u * 4), o.x, o.y, o.co, 0);
  },
};

// nạp trước ảnh khi trùm Freezer ra sân
(function () {
  if (typeof UI === 'undefined' || !UI.canhBaoTrum) return;
  const g = UI.canhBaoTrum;
  UI.canhBaoTrum = function (id) { if (id === 'freezer') BANGFX.napTruoc(); return g.apply(this, arguments); };
})();
