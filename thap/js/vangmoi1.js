// TURRET MERGE — 4 Ụ VÀNG MỚI ĐỢT 1 (docs/demo-hop-tuong/tuvan/tuong_vang/CHATGPT-PLAN.txt §3, người dùng duyệt 06/11):
//   P1 Ember Relay (lualien, Kalaratri) · P2 Quantum Choir (hopca, Cosmem) · P4 Fusion Archive (luutru, Aurora) · P5 Hero Foundry (xuonganh, Kintia)
// Cấp thẻ bắt đầu LV9 (bậc vàng). % kỹ năng theo cấp thẻ: VM1.lv(T) = 9 + số cấp đã lên (B.capThe). Nạp SAU skills5.js, TRƯỚC hotro.js.
// Online co-op: mọi ngẫu nhiên lấy từ rngHat (hạt giống phòng + ô + số lần); cờ cộng dồn gửi kèm ảnh chụp ô (dongbo.js oTT/datO).
// Ảnh: đầu/chân dung/hiệu ứng là ảnh ChatGPT (CAN-VE-1.json); chưa có ảnh → mượn ảnh ụ khác (VM1.TAM) và ụ không vào bộ bài NGẪU NHIÊN.
'use strict';

const VM1 = {
  IDS: ['lualien', 'hopca', 'luutru', 'xuonganh'],
  // ảnh tạm (chưa có ảnh ChatGPT riêng): id → ụ cho mượn đầu/chân dung. Lắp ảnh xong thì xoá dòng đó.
  TAM: {}, // (đã lắp đầu + chân dung ChatGPT riêng cho cả 4 — 06/11)
  // dải hiệu ứng 16 khung (assets/fx_<id>_sk.png, 1 hàng) — có ảnh thì chơi, chưa có thì dùng ảnh v2 sẵn có
  FXN: 16,
  FXCO: new Set(['lualien', 'hopca', 'luutru', 'xuonganh']), // id đã có dải assets/fx_<id>_sk.png (thêm khi lắp ảnh)
  lv(T) { const B = G.ban[T.ban]; return THE.lvDau.vang + ((B && B.capThe && B.capThe[T.id]) || 0); },
  k(T) { return this.lv(T) - THE.lvDau.vang; },
  coAnh(id) { return !this.TAM[id]; },
  rng(B, a, b) { // ngẫu nhiên tất định (2 máy online ra như nhau): hạt giống trận + ô + số lần kích hoạt trên bàn
    B._vmN = (B._vmN || 0) + 1;
    const hat = (typeof ONS !== 'undefined' && ONS.on ? ONS.seed : G.hat) || 1;
    return rngHat(hat * 7841 + B.i * 131 + (a | 0) * 977 + (b | 0) * 61 + B._vmN * 7919);
  },
  // vẽ khung f của dải hiệu ứng ụ (nếu ảnh đã có); trả false nếu chưa có ảnh
  fx(ctx, id, f, x, y, w, al) {
    if (!this.FXCO.has(id)) return false;
    const im = REN.img('fx_' + id + '_sk'); if (!im || !(im.complete && im.naturalWidth) && !im._cv) return false;
    const n = this.FXN, i = Math.max(0, Math.min(n - 1, Math.floor(f))), fw = (im.naturalWidth || im.width) / n, fh = im.naturalHeight || im.height;
    ctx.globalAlpha = al == null ? 1 : al;
    ctx.drawImage(im, i * fw, 0, fw, fh, x - w / 2, y - w * fh / fw / 2, w, w * fh / fw);
    ctx.globalAlpha = 1; return true;
  },
  pct: (v) => Math.round(v * 1000) / 10,
  // % kỹ năng theo cấp thẻ: bảng chung KY_NANG_CAP (data.js) — giá trị /100 ở cấp hiện tại và cấp kế
  kn(T, id) { return knGt(KY_NANG_CAP[id], this.k(T)) / 100; },
  knSau(T, id) { return knGt(KY_NANG_CAP[id], this.k(T) + 1) / 100; },
  chuLv(T, id, f) { const lv = this.lv(T); return 'LV' + lv + (lv < THE.lvMax ? ' → LV' + (lv + 1) + ': ' + f(this.knSau(T, id)) : ''); },
};
// mục % kỹ năng theo cấp (LV9 → LV15) cho bảng chung — dmg: vẫn +% sát thương mỗi cấp như ụ tấn công
Object.assign(KY_NANG_CAP, {
  lualien: { ten: 'Per flame', base: 10, buoc: 0.834, max: 15, dv: '%', tien: '+', dmg: true }, // Lửa Thập Tự: 10% LV9 → 15% LV15
  hopca: { ten: 'Per match', base: 18, buoc: 2, max: 30, dv: '%', tien: '+', dmg: true },
  luutru: { ten: 'Per charge', base: 2.5, buoc: 0.25, max: 4, dv: '%', tien: '+', dmg: true },
  xuonganh: { ten: 'Hero rate', base: 20, buoc: 2, max: 32, dv: '%', tien: '+', dmg: true },
});
// hiệu ứng 1 lần (dải 16 khung) tại (x,y) — chưa có ảnh: vòng mảnh PNG màu ụ
HU.vm1Fx = {
  cap(G, o, dt) { o.t += dt; return o.t >= o.song; },
  ve(ctx, o, R) {
    const p = o.t / o.song;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    if (!VM1.fx(ctx, o.id, p * VM1.FXN, o.x, o.y, o.w, 1 - Math.max(0, p - 0.8) * 5)) PX.vong(ctx, o.x, o.y, o.w * (0.2 + 0.3 * p), 3, o.mau, 1 - p);
    ctx.restore(); ctx.globalAlpha = 1;
  },
};
function vm1Fx(id, x, y, w, song, mau) { G.hu.push({ k: 'vm1Fx', t: 0, song: song || 0.8, id, x, y, w, mau }); }

// =====================================================================================================
// P1 · LỬA THẬP TỰ / CROSS EMBER (lualien, Kalaratri "십자 방향") — Vàng TC (co-che-moi/DE-XUAT.md §3-B, người dùng chốt 07/11):
//      GHÉP có Ember Relay → +1 LỬA cho MỌI Ember Relay cùng HÀNG + cùng CỘT với ô ghép (xa mấy cũng được; gồm ụ ra nếu là Relay).
//      KHÔNG TRẦN số lửa (như Kalaratri DCDW). Mỗi lửa +10% sát thương (LV9) → +15% (LV15) và +2% chí mạng. Ụ vừa nhận lửa +15% tốc bắn 5 s.
//      LỬA GIỮ QUA GHÉP: ụ ra là Relay → giữ số lửa LỚN NHẤT của 2 nguyên liệu Relay (rồi +1 như mọi Relay trên chữ thập).
//      Duyệt bàn theo o tăng dần (online tất định). PVP / CO-OP: chỉ bàn của chính mình. Ô đá không nhận lửa.
// =====================================================================================================
SKILLS.lualien = {
  vai: 'tc', dmg: 17, toc: 1.0, nham: 'dau', napMau: null,
  CRIT: 0.02, // không trần lửa (người dùng 07/11: DCDW không áp trần Kalaratri)
  moiLua: (T) => VM1.kn(T, 'lualien'),
  mo(T) {
    const n = T.lc || 0, p = this.moiLua(T);
    return 'Flames ' + n + ' → +' + VM1.pct(n * p) + '% damage, +' + n * 2 + '% crit · each flame +' + VM1.pct(p) + '% (' + VM1.chuLv(T, 'lualien', (v) => '+' + VM1.pct(v) + '%') + ') · merging a Relay gives +1 flame to EVERY Relay in the same row and column · a Relay result keeps the higher flames';
  },
  sinh(G, T) { T.lc = T.lc || 0; },
  capNhat(G, B, T) { const n = T.lc || 0; if (n) { T.buf.dmg += n * this.moiLua(T); T.buf.crit += n * this.CRIT; } return false; },
  ban(G, B, T, E) {
    giat(T, 0.6); const [x, y] = chopNong(T, 22); SND.lien();
    const dmg = dmgU(T), n = T.lc || 0, nv = Math.min(8, n); // nv: chỉ cỡ hình
    banDan({ img: 'tia_lua', x, y, muc: E, px: E.x, py: E.y, sp: 600, co: 13 + nv * 0.7, B, T, trung: (G, d, M) => { if (M) trung(M, dmg, { B, mau: '#ff9a3a' }); FX.tiaLua(d.x, d.y, 2 + (nv >> 1), '#ff8a2a', 110, 6); } });
  },
  // ô cùng hàng + cùng cột với ô o (không gồm o), o tăng dần
  chuThap(o) { const c = o % 5, h = (o / 5) | 0, ds = []; for (let i = 0; i < 15; i++) if (i !== o && (i % 5 === c || ((i / 5) | 0) === h)) ds.push(i); return ds; },
  // ghép có Ember Relay (Relay+Relay hoặc Mimic+Relay): lửa theo CHỮ THẬP cả hàng + cả cột quanh ô ghép
  ghep(G, B, a, b, ra) {
    const o = b.o;
    if (ra && ra.id === 'lualien') { // lửa giữ qua ghép: max của 2 nguyên liệu Relay
      const giu = Math.max(a.id === 'lualien' ? a.lc || 0 : 0, b.id === 'lualien' ? b.lc || 0 : 0);
      ra.lc = Math.max(ra.lc || 0, giu);
    }
    const ds = [];
    for (const i of this.chuThap(o)) { const X = B.t[i]; if (X && X.id === 'lualien' && !X.st.da && X !== ra) ds.push(X); }
    if (ra && ra.id === 'lualien' && !ra.st.da) ds.unshift(ra);
    const tam = B.o[o];
    vm1Fx('lualien', tam.x, tam.y, B.cw * 2.6, 0.7, '#ff8a2a');
    for (const X of ds) {
      X.lc = (X.lc || 0) + 1;
      X.tocV = X.tocT > 0 ? Math.max(X.tocV || 0, 0.15) : 0.15; X.tocT = Math.max(X.tocT || 0, 5);
      X.sang = 1; if (typeof buffNo === 'function') buffNo(X, 'dmg', 0.5);
      const q = B.o[X.o]; if (X !== ra) G.hu.push({ k: 'vm1Tia', t: 0, song: 0.22 + 0.07 * (Math.abs(X.o % 5 - o % 5) + Math.abs(((X.o / 5) | 0) - ((o / 5) | 0))), x0: tam.x, y0: tam.y, x1: q.x, y1: q.y });
    }
    if (!B.ai || G.che === 'pvp') SND.combo(Math.min(20, ds.length * 3 + 2));
  },
  veThem(ctx, T, S, al) { // lửa đang mang: ngọn lửa PNG ở 4 nhánh chữ thập (+ lõi khi ≥ 5)
    const n = Math.min(8, T.lc || 0); if (!n) return; // hình bão hoà ở 8 (chỉ hình, không trần lửa)
    const im = REN.img('fx_cuuvi_dan'); if (!im) return;
    ctx.globalCompositeOperation = 'lighter';
    const pos = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    for (let i = 0; i < Math.min(4, n); i++) { const r = S * 0.36, w = S * 0.2; PX.ve(ctx, im, pos[i][0] * r, pos[i][1] * r, w, w, -Math.PI / 2, al * 0.85); }
    if (n >= 5) PX.ve(ctx, im, 0, 0, S * (0.24 + 0.02 * (n - 5)), S * (0.24 + 0.02 * (n - 5)), -Math.PI / 2, al * 0.6);
    ctx.globalCompositeOperation = 'source-over';
  },
};
HU.vm1Tia = { // lửa bay từ ô ghép sang ô kề: ngọn lửa PNG trượt theo đường thẳng
  cap(G, o, dt) { o.t += dt; return o.t >= o.song; },
  ve(ctx, o) { const p = Math.min(1, o.t / o.song), im = REN.img('fx_cuuvi_dan'); if (!im) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; PX.ve(ctx, im, o.x0 + (o.x1 - o.x0) * p, o.y0 + (o.y1 - o.y0) * p, 22, 22, Math.atan2(o.y1 - o.y0, o.x1 - o.x0), 1 - p * 0.3); ctx.restore(); ctx.globalAlpha = 1; },
};

// =====================================================================================================
// P2 · QUANTUM CHOIR (hopca) — Vàng TC. Đếm ụ KHÁC trên bàn MÌNH có CÙNG SAO (mọi loại, KHÔNG trần — như Kalaratri DCDW; ô đá không tính):
//      +18% sát thương mỗi ụ khớp (LV9, +2 điểm/cấp → LV15 30%). 7★: thêm +12% tốc bắn. CO-OP: sao bàn đồng đội không tính.
// =====================================================================================================
SKILLS.hopca = {
  vai: 'tc', dmg: 15, toc: 1.0, nham: 'dau',
  moi: (T) => VM1.kn(T, 'hopca'),
  dem(B, T) { let n = 0; for (const X of B.t) if (X && X !== T && X.sao === T.sao && !X.st.da) n++; return n; },
  mo(T) {
    const B = G.ban[T.ban], n = B ? this.dem(B, T) : 0, p = this.moi(T);
    return n + ' other ' + T.sao + '★ turret(s) → +' + VM1.pct(n * p) + '% damage · +' + VM1.pct(p) + '% per same-star turret, no cap (' + VM1.chuLv(T, 'hopca', (v) => '+' + VM1.pct(v) + '%') + ')' + (T.sao >= 7 ? ' · 7★: +12% fire rate' : ' · 7★ adds +12% fire rate');
  },
  capNhat(G, B, T) { const n = this.dem(B, T); if (n > (T.hop || 0) && T.tuoi > 0.3) { const c = B.o[T.o]; vm1Fx('hopca', c.x, c.y, B.cw * 1.7, 0.8, '#d9b8ff'); } T.hop = n; T.buf.dmg += n * this.moi(T); if (T.sao >= 7) T.buf.toc += 0.12; return false; },
  ban(G, B, T, E) {
    giat(T, 0.5); const [x, y] = chopNong(T, 20); SND.tia();
    const dmg = dmgU(T), n = T.hop || 0;
    banDan({ img: 'dan_tia', x, y, muc: E, px: E.x, py: E.y, sp: 640, co: 14, B, T, trung: (G, d, M) => { if (M) trung(M, dmg, { B, mau: '#e6c8ff' }); FX.vong1(d.x, d.y, 3, 10 + n * 2, '#d9b8ff', 0.2, 2); } });
  },
};

// =====================================================================================================
// P4 · FUSION ARCHIVE (luutru) — Vàng TC. MỌI lần ghép thành công trên bàn mình → +1 ĐIỂM LƯU cho mọi Fusion Archive đang có (KHÔNG trần — như Kalaratri DCDW);
//      Archive mới xuất hiện nhận 50% tổng số lần ghép của trận (làm tròn xuống). Mỗi điểm +2.5% sát thương (LV9, +0.25 điểm/cấp → LV15 4%).
//      Ghép Archive + Archive: 3 xung nổ 160% sát thương vào chỗ quái đông nhất. Chỉ đếm ghép của chính mình (PVP/CO-OP).
// =====================================================================================================
SKILLS.luutru = {
  vai: 'tc', dmg: 15, toc: 1.0, nham: 'dau',
  moi: (T) => VM1.kn(T, 'luutru'),
  mo(T) {
    const n = T.kho || 0, p = this.moi(T);
    return 'Archive ' + n + ' → +' + VM1.pct(n * p) + '% damage · every merge you make +1 (+' + VM1.pct(p) + '% each, ' + VM1.chuLv(T, 'luutru', (v) => '+' + VM1.pct(v) + '%') + ') · new Archives start with 50% of your merges · Archive + Archive: 3 pulses × 160%';
  },
  sinh(G, T) { const B = G.ban[T.ban]; if (T.kho == null) T.kho = Math.floor(((B && B.ghepN) || 0) * 0.5); },
  capNhat(G, B, T) { if (T.kho) T.buf.dmg += T.kho * this.moi(T); return false; },
  ban(G, B, T, E) {
    giat(T, 0.5); const [x, y] = chopNong(T, 20); SND.tia();
    const dmg = dmgU(T);
    banDan({ img: 'dan_tia', x, y, muc: E, px: E.x, py: E.y, sp: 620, co: 14, B, T, trung: (G, d, M) => { if (M) trung(M, dmg, { B, mau: '#bfe4ff' }); FX.tiaLua(d.x, d.y, 3, '#bfe4ff', 100, 5); } });
  },
  ghep(G, B, a, b, ra) {
    if (a.id !== 'luutru' || b.id !== 'luutru') return; // chỉ Archive + Archive mới nổ xung
    const ds = dsMucTieu(B).filter(E => !E.chet), tam = B.o[b.o];
    let x = tam.x, y = tam.y;
    if (ds.length) { let best = -1; for (const E of ds) { const n = ds.reduce((s, Q) => s + (Math.hypot(Q.x - E.x, Q.y - E.y) < 50 ? 1 : 0), 0); if (n > best) { best = n; x = E.x; y = E.y; } } }
    const dmg = dmgU(b) * 1.6;
    G.hu.push({ k: 'vm1Xung', t: 0, song: 0.9, x, y, B, dmg, n: 0 });
  },
};
HU.vm1Xung = { // 3 xung nổ cách nhau 0.25 s, bán kính 45 px
  cap(G, o, dt) {
    o.t += dt;
    while (o.n < 3 && o.t >= o.n * 0.25) { o.n++; noLan(o.x, o.y, 45, o.dmg, o.B, { B: o.B, mau: '#bfe4ff' }); vm1Fx('luutru', o.x, o.y, 110, 0.55, '#bfe4ff'); FX.lac(2); SND.no(0.4); }
    return o.t >= o.song;
  },
  ve() { },
};
// đếm MỌI lần ghép thành công (thường + đặc biệt) của từng bàn → điểm lưu của Archive (bàn con rối online cũng chạy ghep → đếm như máy bạn)
{
  const _ghepVM1 = ghep;
  ghep = function (B, a, b, ep) {
    const B2 = b && G.ban[b.ban];
    // chỉ GHÉP THẬT mới đếm (luật Star Breaker, conghuong2): Teleporter / Copycat / Overclock / Scrap Forge không phải ghép — Teleporter qua lại từng nuôi Archive vô hạn (rà cộng hưởng 07/11)
    const db = !ep && a && b ? ghepDBHop(a, b) : null, khong = db && [SKILLS.dichchuyen, SKILLS.saochep, SKILLS.epxung, SKILLS.loren].includes(db.sk);
    const r = _ghepVM1.apply(this, arguments);
    if (r && B2 && !khong) {
      B2.ghepN = (B2.ghepN || 0) + 1;
      for (const X of B2.t) if (X && X.id === 'luutru' && X !== r) X.kho = (X.kho || 0) + 1;
    }
    return r;
  };
}

// =====================================================================================================
// P5 · HERO FOUNDRY (xuonganh) — Vàng ĐB. Ghép Foundry + Foundry → 1 ô NGẪU NHIÊN của mình (ưu tiên ô có ụ) thành ô ANH HÙNG 12 s:
//      ụ đứng trên ô +20% tốc bắn (LV9, +2 điểm/cấp → LV15 32%) +4 điểm mỗi sao của Foundry ghép (7★ LV15 = 56%).
//      Không cộng dồn (ô đã là ô anh hùng → làm mới). Tối đa 2 ô / người, ô cũ nhất bị thay. Ô vẫn còn khi ụ trên đó bị ghép đi.
//      Không buff kỹ năng/chỉ huy (chỉ tốc bắn). PVP / CO-OP: chỉ bàn mình.
// =====================================================================================================
SKILLS.xuonganh = {
  vai: 'db', dmg: 7.5, toc: 1.3, nham: 'dau',
  SONG: 12, TOI_DA: 2,
  v: (T, sao) => VM1.kn(T, 'xuonganh') + 0.04 * ((sao || T.sao) - 1),
  mo(T) {
    const v = this.v(T), s4 = 0.04 * (T.sao - 1);
    return 'Merge 2 Foundries: a random own cell becomes a HERO tile for 12s → the turret on it +' + VM1.pct(v) + '% fire rate (' + VM1.chuLv(T, 'xuonganh', (x) => '+' + VM1.pct(x + s4) + '%') + ', +4% per ★) · max 2 tiles';
  },
  ban(G, B, T, E) { banNhe(B, T, E, { img: 'dan_tia', co: 15, sp: 600 }); },
  ghep(G, B, a, b, ra) {
    if (a.id !== 'xuonganh' || b.id !== 'xuonganh') return;
    const ep = G._hfEp; // online: đúng ô máy bạn kia đã chọn
    let o;
    if (ep != null) o = ep;
    else {
      const r = VM1.rng(B, a.o, b.o), co = [], tr = [];
      for (let i = 0; i < 15; i++) (B.t[i] || i === b.o ? co : tr).push(i);
      const ds = co.length ? co : tr; o = ds[Math.floor(r() * ds.length)];
    }
    B._hf = o;
    const v = this.v(b, b.sao), het = G.t + this.SONG;
    B.hero = (B.hero || []).filter(h => h.het > G.t);
    const cu = B.hero.find(h => h.o === o);
    if (cu) { cu.het = het; cu.v = Math.max(cu.v, v); cu.t0 = G.t; }
    else { if (B.hero.length >= this.TOI_DA) B.hero.shift(); B.hero.push({ o, het, v, t0: G.t }); }
    const c = B.o[o];
    vm1Fx('xuonganh', c.x, c.y, B.cw * 1.9, 0.7, '#ffd23f');
    if (!G.hu.some(h => h.k === 'vm1Hero' && h.B === B)) G.hu.push({ k: 'vm1Hero', t: 0, song: 1e12, B });
    if (!B.ai || G.che === 'pvp') SND.nang(3);
  },
};
HU.vm1Hero = { // ô anh hùng: vòng vàng PNG dưới ụ (dải hiệu ứng khi có ảnh), hết hạn thì tắt
  duoi: true,
  cap(G, o, dt) { const B = o.B; if (!B || G.ban.indexOf(B) < 0) return true; if (B.hero) B.hero = B.hero.filter(h => h.het > G.t); return !(B.hero && B.hero.length) && (o.t += dt) > 0.5; },
  ve(ctx, o, R) {
    const B = o.B; if (!B || !B.hero) return;
    const im = REN.img('tier_ring_vang');
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const h of B.hero) {
      const c = B.o[h.o], con = h.het - G.t, a = Math.min(1, con / 1.5) * (0.75 + 0.25 * Math.sin(G.t * 6 + h.o));
      const w = Math.min(B.cw, B.ch) * 1.05;
      if (im && G.t - h.t0 > 0.5) PX.ve(ctx, im, c.x, c.y, w, w, G.t * 0.6, a * 0.8); // dập xong (dải 16 khung lúc ghép) → vòng vàng tới hết 12 s
    }
    ctx.restore(); ctx.globalAlpha = 1;
  },
};
// áp tốc bắn ô anh hùng sau khi buff được đặt lại mỗi khung (cùng chỗ mốc sao chung)
{
  const _mocBufVM1 = mocBuf;
  mocBuf = function (B) {
    const r = _mocBufVM1.apply(this, arguments);
    if (B && B.hero && B.hero.length) for (const h of B.hero) { if (h.het <= G.t) continue; const T = B.t[h.o]; if (T && !biKhoa(T)) { T.buf.toc += h.v; T.heroO = 1; } }
    return r;
  };
}

// =====================================================================================================
// đăng ký: họ kỹ năng, mốc, grow-up (không ảnh dạng: vòng tiến độ), nhịp, ảnh tạm, bộ bài ngẫu nhiên, bộ đếm đáy ô
// =====================================================================================================
themHo('blast', 3, 'lualien', 'merges pass flames along the whole row and column: +damage & crit');
themHo('star', 3, 'hopca', 'stronger for every same-star turret on board');
themHo('summon', 3, 'luutru', 'every merge you make adds permanent damage');
themHo('amp', 3, 'xuonganh', 'merge stamps a HERO tile: big fire-rate boost');
Object.assign(GROW, {
  lualien: { mau: '#ff8a2a', khongAnh: true, ten: ['COLD RELAY', 'KINDLED', 'FULL BLAZE'], dk: 'Flames 0 / 1–7 / 8+ (no cap: every flame keeps adding damage & crit)',
    gd: (T) => { const n = T.lc || 0; return { s: n >= 8 ? 3 : n >= 1 ? 2 : 1, p: Math.min(1, n / 8), v: [0.125] }; } },
  luutru: { mau: '#bfe4ff', khongAnh: true, ten: ['EMPTY SHELVES', 'FILING', 'GRAND ARCHIVE'], dk: 'Archive 0–9 / 10–29 / 30+ (no cap: every merge keeps adding damage)',
    gd: (T) => { const n = T.kho || 0; return { s: n >= 30 ? 3 : n >= 10 ? 2 : 1, p: Math.min(1, n / 40), v: [0.25, 0.75] }; } },
});
// ảnh tạm: tới khi ảnh ChatGPT riêng về, assets/<id>_nong.png, pilot_, pn/, hero/, nho/, glyph/ là BẢN SAO ảnh của ụ cho mượn (VM1.TAM);
// cỡ đầu (HEAD_K) / mũi nòng (ART_META) mượn theo. Lắp ảnh thật (tools/thap-dau-u3.py …) thì xoá id khỏi VM1.TAM.
for (const id in VM1.TAM) {
  const m = VM1.TAM[id];
  if (window.HEAD_K && HEAD_K[m] && !HEAD_K[id]) HEAD_K[id] = HEAD_K[m];
  if (window.ART_META && ART_META[m] && !ART_META[id]) ART_META[id] = ART_META[m];
}
for (const id of VM1.IDS) PILOTS.add(id);
// ụ chưa có ảnh riêng: KHÔNG vào bộ bài ngẫu nhiên (người chơi vẫn tự chọn được)
{
  const _dnnVM1 = deckNgauNhien;
  deckNgauNhien = function (tru) { return _dnnVM1.call(this, (tru || []).concat(Object.keys(VM1.TAM))); };
}
if (typeof addEventListener === 'function') addEventListener('DOMContentLoaded', () => {
  if (typeof DEMKN !== 'undefined') Object.assign(DEMKN.DS, {
    lualien(T) { const n = T.lc || 0; return n > 0 ? { m: [{ ic: 'ic_dmg', s: n + '' }] } : null; }, // không trần: chỉ số (màu theo ĐỘT PHÁ)
    hopca(T, B) { const n = SKILLS.hopca.dem(B, T); return n > 0 ? { m: [{ ic: 'ic_dmg', s: '×' + n }] } : null; },
    luutru(T) { const n = T.kho || 0; return n > 0 ? { m: [{ ic: 'ic_dmg', s: n + '' }] } : null; },
    xuonganh(T, B) { const n = (B.hero || []).filter(h => h.het > G.t).length; return n > 0 ? { m: [{ ic: 'ic_toc', s: n + '/2' }], sang: n >= 2 } : null; },
  });
});
// tải trước dải hiệu ứng + ảnh phụ của ụ có trong bộ bài trận (khỏi hụt khung đầu)
{
  const _batDauVM1 = batDau;
  batDau = function (che, deck, mv) {
    const r = _batDauVM1.apply(this, arguments);
    if (typeof REN !== 'undefined' && REN.img) for (const B of G.ban) for (const id of B.deck || []) if (VM1.FXCO.has(id)) { REN.img('fx_' + id + '_sk'); if (id === 'lualien') REN.img('fx_cuuvi_dan'); if (id === 'xuonganh') REN.img('tier_ring_vang'); }
    return r;
  };
}

// =====================================================================================================
// ĐỘT PHÁ (07/11, người dùng chốt): kỹ năng cộng dồn KHÔNG trần + khi số cộng dồn vượt ngưỡng → thêm thưởng bậc (cộng dồn theo bậc):
//   Bậc I +15% tốc bắn · II +30% ST chí mạng · III +25% sát thương · IV +10% tỉ lệ chí mạng & +50% ST chí mạng (tỉ lệ chí mạng vẫn ≤ 100%, critU).
//   Ngưỡng theo tốc độ cộng dồn của từng ụ (NGUONG). Scrap Forge: thưởng vào ụ NHẬN (ụ Tấn công mạnh nhất). Tất định (chỉ đọc trạng thái).
//   Hình: icon tấm đếm + lửa Ember đổi màu theo bậc = bản sao PNG lọc màu (ctx.filter) DỰNG 1 LẦN rồi giữ (DOTPHA.ten) · lên bậc: nổ PNG + chữ.
// =====================================================================================================
const DOTPHA = {
  NGUONG: { lualien: [5, 10, 20, 40], hopca: [3, 5, 8, 12], luutru: [10, 25, 50, 100], loren: [6, 15, 30, 60], leviathan: [25, 50, 100, 200],
    lienket: [3, 5, 8, 12], combo: [5, 10, 20, 40], cuuvi: [1, 3, 6, 10] },
  SO: { lualien: (T) => T.lc || 0, hopca: (T) => T.hop || 0, luutru: (T) => T.kho || 0, loren: (T) => T.lo || 0, leviathan: (T) => T.vuc || 0,
    lienket: (T) => T.chuoi || 1, combo: (T) => { const B = G.ban && G.ban[T.ban]; return (B && B.combo) || 0; }, cuuvi: (T) => T.xaN || 0 },
  LA: ['', 'I', 'II', 'III', 'IV'],
  MAU: ['', '#ffd84a', '#7fc8ff', '#d9a0ff', '#ffffff'],
  // lọc màu PNG theo bậc: chuẩn hoá về cam (sepia) rồi xoay màu → vàng / xanh lam / tím / trắng sáng
  LOC: ['', 'sepia(1) saturate(4) hue-rotate(5deg) brightness(1.25)', 'sepia(1) saturate(4) hue-rotate(170deg) brightness(1.15)', 'sepia(1) saturate(4) hue-rotate(230deg) brightness(1.15)', 'sepia(1) saturate(0.3) brightness(1.9)'],
  bac(n, nguong) { let b = 0; if (nguong) for (const x of nguong) if (n >= x) b++; return b; },
  bacU(T) { const f = T && this.SO[T.id]; return f ? this.bac(f(T), this.NGUONG[T.id]) : 0; },
  thuong(b) { return { toc: b >= 1 ? 0.15 : 0, cdmg: (b >= 2 ? 0.3 : 0) + (b >= 4 ? 0.5 : 0), dmg: b >= 3 ? 0.25 : 0, crit: b >= 4 ? 0.1 : 0 }; },
  chu(id, T) {
    const ng = this.NGUONG[id], n = this.SO[id](T), b = this.bac(n, ng), t = this.thuong(b), ds = [];
    if (t.toc) ds.push('+' + Math.round(t.toc * 100) + '% fire rate'); if (t.cdmg) ds.push('+' + Math.round(t.cdmg * 100) + '% crit dmg');
    if (t.dmg) ds.push('+' + Math.round(t.dmg * 100) + '% damage'); if (t.crit) ds.push('+' + Math.round(t.crit * 100) + '% crit');
    return (b ? 'BREAKTHROUGH ' + this.LA[b] + ': ' + ds.join(', ') : 'Breakthroughs at ' + ng.join('/')) + (b > 0 && b < 4 ? ' · next breakthrough at ' + ng[b] : '');
  },
  // bậc IV: cầu vồng chậm = chọn 1 trong 6 bản sao đã lọc sẵn theo thời gian (không lọc mỗi khung)
  LOC4: [0, 60, 120, 180, 240, 300].map(h => 'sepia(1) saturate(2.6) hue-rotate(' + h + 'deg) brightness(1.55)'),
  buoc4() { return ((typeof VX !== 'undefined' ? VX.t : 0) * 1.5 | 0) % 6; },
  // bậc để VẼ: chính ụ cộng dồn, hoặc ụ NHẬN của Scrap Forge (hào quang buff trên ụ nhận cũng đổi màu)
  bacVe(T) { if (!T) return 0; const b = this.bacU(T); return b || (T.dpNhanT != null && typeof G !== 'undefined' && G.t - T.dpNhanT < 0.3 ? T.dpNhan || 0 : 0); },
  // VÒNG BẬC dưới ụ (thay hào quang lửa to — người dùng 07/11 'ưu tiên đơn giản'): fx_vong_mong (vòng sáng mảnh PNG) lọc màu: cam (có cộng dồn, chưa đột phá) → vàng → lam → tím → cầu vồng
  coVong(T) { return !!T && (!!this.NGUONG[T.id] || this.bacVe(T) > 0); },
  // vòng PNG trắng → tô màu bậc 1 lần (source-atop, giữ lõi sáng) → giữ trong REN.anh
  MAU_VONG: ['#ff7a1a', '#ffd23f', '#3f9dff', '#b45cff'],
  MAU_VONG4: ['#ff5a5a', '#ffffff', '#5cff7a', '#3fe0ff', '#5c7aff', '#ff5ce0'],
  tenVong(T) {
    const b = this.bacVe(T), f = this.SO[T.id];
    if (!b && !(f && f(T) > 0)) return null;
    if (typeof document === 'undefined' || typeof REN === 'undefined' || !REN.anh) return null;
    const v = b === 4 ? this.buoc4() : -1, mau = b === 4 ? this.MAU_VONG4[v] : this.MAU_VONG[b], k = 'fx_vong_mong~v' + b + (v >= 0 ? 'h' + v : '');
    if (REN.anh[k]) return k;
    const a = REN.img('fx_vong_mong'); if (!a || !a.width) return null;
    const c = document.createElement('canvas'); c.width = a.width; c.height = a.height; const x = c.getContext('2d'); if (!x) return null;
    x.drawImage(a, 0, 0); x.globalCompositeOperation = 'source-atop'; x.globalAlpha = 0.82; x.fillStyle = mau; x.fillRect(0, 0, c.width, c.height);
    REN.anh[k] = { _cv: c, complete: true, naturalWidth: c.width, naturalHeight: c.height }; if (REN.CO_DINH) REN.CO_DINH.add(k); return k;
  },
  tenT(goc, T) { const b = this.bacVe(T); return this.ten(goc, b, b === 4 ? this.buoc4() : -1); },
  // tên ảnh đã lọc màu bậc b (dựng 1 lần, giữ trong REN.anh như ảnh thường; tờ P2 mượn cỡ khung) · v = bước cầu vồng bậc IV (−1: trắng)
  ten(goc, b, v) {
    if (!b || typeof document === 'undefined' || typeof REN === 'undefined' || !REN.anh) return goc;
    const cv = b === 4 && v >= 0, k = goc + '~dp' + b + (cv ? 'h' + v : ''); if (REN.anh[k]) return k;
    const a = REN.img(goc); if (!a || !a.width) return goc;
    const c = document.createElement('canvas'); c.width = a.width; c.height = a.height;
    const x = c.getContext('2d'); if (!x || !('filter' in x)) return goc;
    x.filter = cv ? this.LOC4[v] : this.LOC[b]; x.drawImage(a, 0, 0); x.filter = 'none';
    REN.anh[k] = { _cv: c, complete: true, naturalWidth: c.width, naturalHeight: c.height };
    if (REN.CO_DINH) REN.CO_DINH.add(k);
    if (typeof P2 !== 'undefined' && P2.M && P2.M[goc]) P2.M[k] = P2.M[goc];
    return k;
  },
};
for (const id in DOTPHA.NGUONG) {
  const sk = SKILLS[id]; if (!sk) continue;
  if (sk.capNhat) { const cn = sk.capNhat; sk.capNhat = function (G, B, T) {
    const r = cn.apply(this, arguments);
    const b = DOTPHA.bacU(T), X = id === 'loren' ? T.forgeX : T;
    if (b && X && X !== T) { X.dpNhan = X.dpNhanT === G.t ? Math.max(X.dpNhan || 0, b) : b; X.dpNhanT = G.t; }
    if (b && X) { const t = DOTPHA.thuong(b); X.buf.toc += t.toc; X.buf.cdmg = (X.buf.cdmg || 0) + t.cdmg; X.buf.dmg += t.dmg; X.buf.crit += t.crit; }
    if (b > (T.dpB || 0) && T.tuoi > 0.3 && B && B.o && B.o[T.o]) { // lên bậc: nổ PNG + chữ (chỉ trình bày)
      const c = B.o[T.o]; try { FX.no('no_phao', c.x, c.y, 50 + 12 * b, 0.4); nhanU(T, 'BREAKTHROUGH ' + DOTPHA.LA[b], DOTPHA.MAU[b], b >= 3); } catch (e) { }
    }
    T.dpB = b;
    return r;
  }; }
  if (sk.mo) { const mo = sk.mo; sk.mo = function (T) { const s = mo.apply(this, arguments); try { return T ? s + ' · ' + DOTPHA.chu(id, T) : s; } catch (e) { return s; } }; }
}
if (SKILLS.cuuvi && SKILLS.cuuvi.xa) { const xa = SKILLS.cuuvi.xa; SKILLS.cuuvi.xa = function (T) { if (G.ban[T.ban] && conTren(T)) T.xaN = (T.xaN || 0) + 1; return xa.apply(this, arguments); };
  const gh = SKILLS.cuuvi.ghep; SKILLS.cuuvi.ghep = function (G, B, a, b, ra) { const r = gh ? gh.apply(this, arguments) : undefined; if (ra && ra.id === 'cuuvi') ra.xaN = Math.max(a.id === 'cuuvi' ? a.xaN || 0 : 0, b.id === 'cuuvi' ? b.xaN || 0 : 0); return r; }; } // Nine-tail: đếm số lần xả cầu lửa (đuôi về 0 mỗi vòng)
