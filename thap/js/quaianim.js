// TURRET MERGE — vẽ QUÁI/TRÙM mượt (ghi đè REN.veQuai).
// Khung ảnh đã "đăng ký" theo thân (docs/demo-hop-tuong/thap-art/dangky_khung.py) → thân đứng yên giữa các khung.
// Lớp code phủ thêm (theo THỜI GIAN THỰC, không theo bước mô phỏng → 2×/3× vẫn êm, không chớp nháy):
//  · nhịp khung theo tốc độ đi, có trần nhịp ở 2×/3×; hoà (cross-fade) 2 khung liền nhau
//  · nhún/nén nhẹ theo bước chân (≤3%), lắc lư nhẹ khi rẽ, cánh rung có vệt mờ cho quái bay
//  · trúng đòn: chớp trắng + giật lùi nhỏ có dịu; chết: nổ "pop" (phóng to + trắng + mờ dần) độc lập thời gian thực
//  · bóng mềm dưới mỗi quái (quái bay: bóng nhỏ/nhạt theo độ cao)
'use strict';

// quái có dải 8 khung mới (quai_<id>_8.png / trum_<id>_8.png) — thêm id khi ảnh có trong assets/
const QUAI8 = new Set(['bo', 'bay', 'bay_bang', 'khong_lo', 'tach', 'que_tach']);
// hệ số cỡ vẽ để thân bản 8 khung to bằng bản 4 khung cũ (đo: trung bình nhân tỉ lệ lõi thân & khung bao)
const K8 = { bo: 0.755, bay: 0.82, bay_bang: 0.92, khong_lo: 1.46, tach: 0.85, que_tach: 1.16,
  freezer: 1.06, janus: 1.02, joker_king: 1.07, mad_crown: 1.03, nightmare: 1.02, octopus: 1.09 }; // trùm: id = E.id
const TRUM8 = new Set(['freezer', 'mad_crown', 'nightmare', 'octopus', 'janus', 'joker_king']);
// HƯỚNG NHÌN (Pass 5): dải 8 khung NGANG (đi sang phải; trái = lật) / SAU (đi lên) đã có trong assets/ — tools/thap-huong-quai.py tự cập nhật dòng dưới
const HUONG8 = new Set(['quai_bay_side', 'quai_bo_back', 'quai_bo_side']); // vd 'quai_bo_side', 'trum_octopus_back'
const HUONG_NGHIENG = 0.139; // dải chưa có: dùng dải TRƯỚC nghiêng ≤ 8° về phía đi
const HUONG_HOA = 0.12;      // hoà 120 ms khi đổi hướng nhìn ở khúc rẽ

Object.assign(REN, {
  _xac: [],
  // bóng mềm = ảnh fx_cham_trang tô đen (PNG, không còn gradient vẽ code); chưa nạp → không vẽ bóng
  bong1() { return PX.mau('fx_cham_trang', '#000000'); },
  // tên dải ảnh dùng cho quái: ưu tiên bản 8 khung nếu đã nạp được
  tenQuai(E) {
    const goc = E.trum ? 'trum_' + E.trum : 'quai_' + (E.d.anh || E.id);
    const co8 = E.trum ? TRUM8.has(E.trum) : QUAI8.has(E.d.anh || E.id);
    if (co8) { const a = this.img(goc + '_8'); if (a) return goc + '_8'; }
    return goc;
  },
  // ảnh hướng nhìn cần nạp trước (ui.js chuẩn bị trận)
  dsHuong() { const ds = []; for (const k of HUONG8) ds.push(k + '_8'); return ds; },
  // chọn hướng nhìn từ hướng đi trên đoạn đường: 'f' trước (xuống) · 's' ngang (lat ±1) · 'b' sau (lên)
  // trễ (hysteresis): chỉ đổi khi một trục trội rõ (×1.25) và đã giữ hướng cũ ≥ 150 ms → không chớp ở góc
  huongQuai(E, t) {
    const dx = Math.cos(E.goc), dy = Math.sin(E.goc), ax = Math.abs(dx), ay = Math.abs(dy);
    let v = E._hv || 'f', l = E._hl || 1;
    if (ax > ay * 1.25) { v = 's'; l = dx < 0 ? -1 : 1; } else if (ay > ax * 1.25) v = dy > 0 ? 'f' : 'b';
    if (E.trum) { if (E._t0 == null) E._t0 = t; if (t - E._t0 < 0.9 || E.bao) v = 'f'; } // trùm: vừa vào / tung chiêu → nhìn ra màn hình
    if (!E._hv) { E._hv = v; E._hl = l; E._hvT = -9; return; }
    if ((v !== E._hv || (v === 's' && l !== E._hl)) && t - E._hvT > 0.15) {
      E._hvCu = E._hv; E._hlCu = E._hl; E._hvT = t; E._hv = v; E._hl = l;
    }
  },
  // dải của hướng v cho quái (ten = dải trước): có ảnh hướng đó → tên dải đó, không → null (dùng dải trước + nghiêng)
  tenHuong(ten, v) {
    if (v === 'f' || !HUONG8.size || !ten.endsWith('_8')) return null;
    const g = ten.slice(0, -2) + (v === 's' ? '_side' : '_back');
    return HUONG8.has(g) && this.img(g + '_8') ? g + '_8' : null;
  },
  // vẽ thân 1 hướng nhìn tại gốc toạ độ hiện tại: cánh mờ (quái bay), khung + hoà khung kế, chớp trắng; al = độ mờ chung
  veThan(ctx, daiV, wTen, fV, f1, fr, C, bay, dong, fl, al, chiDai) {
    if (bay && !dong) { ctx.globalAlpha = 0.22 * al; this.khung0(ctx, daiV, fV + 1, C * 1.035); }
    ctx.globalAlpha = al; this.khung0(ctx, daiV, fV, C);
    if (chiDai && f1 >= 0 && fr > 0.01) { ctx.globalAlpha = fr * al; this.khung0(ctx, daiV, f1, C); }
    if (chiDai && fl > 0.02) { const w = this.coDai(wTen.ten, wTen.px, 'trang'); if (w) { ctx.globalAlpha = fl * al; this.khung0(ctx, w, fr > 0.5 && f1 >= 0 ? f1 : fV, C); } }
  },
  // vẽ khung f của dải (đã thu nhỏ sẵn) tại gốc toạ độ hiện tại, cỡ co
  khung0(ctx, dai, f, co) {
    const n = dai.nf, fw = dai.fm, st = dai.fm + dai.gap;
    f = ((f % n) + n) % n;
    ctx.drawImage(dai, f * st, 0, fw, dai.height, -co / 2, -co / 2, co, co);
  },

  // trạng thái trên quái bằng ảnh tờ ST (fx_st_*): danh sách cần vẽ cho quái E
  stV2(E, lanh) {
    const c = (k) => typeof FXU !== 'undefined' && FXU.co('fx_st_' + k) && this.img('fx_st_' + k);
    const s = { n: 0 };
    if (E.chan > 0) { if (lanh && c('dong')) s.dong = 1; else if (c('choang')) s.choang = 1; }
    if (lanh && !s.dong && c('cham')) s.cham = 1;
    if (E.docT > 0 && c('doc')) s.doc = 1;
    if (E.chayT > 0 && c('chay')) s.chay = 1;
    if (E.cvT > 0 && c('cauvong')) s.yeu = 'cauvong'; else if (E.giapT > 0 && c('khienvang')) s.yeu = 'khienvang'; else if (E.yeu > 0 && c('yeu')) s.yeu = 'yeu';
    s.n = (s.dong || 0) + (s.choang || 0) + (s.cham || 0) + (s.doc || 0) + (s.chay || 0) + (s.yeu ? 1 : 0);
    return s;
  },
  // vẽ: cỡ = co × 1.1, alpha 0.85, thở ±6% 2 Hz; choáng xoay 120°/s trên đầu; đóng băng phủ lên thân
  veStV2(ctx, E, s, x, y, co, t) {
    const tho = 1 + 0.06 * Math.sin(t * 12.6 + E.uid), C = co * 1.02 * tho;
    if (s.cham) this.anhGiua(ctx, 'fx_st_cham', x, y, C, t * 0.4, 0.85);
    if (s.doc) this.anhGiua(ctx, 'fx_st_doc', x, y, C, 0, 0.85);
    if (s.chay) this.anhGiua(ctx, 'fx_st_chay', x, y - co * 0.05, C, 0, 0.85);
    if (s.yeu) this.anhGiua(ctx, 'fx_st_' + s.yeu, x, y, C * 1.05, s.yeu === 'cauvong' ? t * 1.2 : 0, s.yeu === 'khienvang' ? 0.55 : 0.6);
    if (s.dong) this.anhGiua(ctx, 'fx_st_dong', x, y, co * 1.05, 0, 0.8);
    if (s.choang) this.anhGiua(ctx, 'fx_st_choang', x, y - co * 0.42, co * 0.75, 0.12 * Math.sin(t * 6), 0.95);
    ctx.globalAlpha = 1;
  },
  veQuai(ctx) {
    const dt = this.dt || 0, k = G.tocDo || 1, t = this.t;
    // xác đang nổ (thời gian thực) — vẽ dưới quái sống
    for (let i = this._xac.length - 1; i >= 0; i--) {
      const X = this._xac[i]; X.t += dt;
      if (X.t >= 0.3) { this._xac.splice(i, 1); continue; }
      const u = X.t / 0.3, e = 1 - (1 - u) * (1 - u) * (1 - u);
      const sc = 1 + 0.32 * e, al = (1 - u) * (1 - u);
      ctx.save(); ctx.translate(X.x, X.y); if (X.goc) ctx.rotate(X.goc); if (X.lat < 0) ctx.scale(-1, 1);
      ctx.globalAlpha = al; this.khung0(ctx, X.dai, X.f, X.co * sc);
      if (X.w) { ctx.globalAlpha = al * (0.9 - 0.6 * u); this.khung0(ctx, X.w, X.f, X.co * sc); }
      ctx.restore();
      if (X.t - dt <= 0) FX.vong1(X.x, X.y, X.co * 0.2, X.co * 0.9, '#ffffff', 0.25, 3);
    }
    ctx.globalAlpha = 1;
    const bong = this.bong1(), dong = G.quai.length > 30, M = ctx.getTransform();
    for (const E of G.quai) {
      const co = E.d.co, bay = E.d.bay, ten = this.tenQuai(E);
      const kc = ten.endsWith('_8') ? K8[E.d.anh || E.id] || 1 : 1; // bản 8 khung: chỉnh cỡ cho bằng bản cũ
      const dai = this.coDai(ten, co * kc);
      // ---- chết: chuyển thành "xác nổ" chạy theo thời gian thực (lọt cổng thì biến mất luôn) ----
      if (E.chet) {
        if (!E._pop && E.tChet < 0.25 && dai) {
          E._pop = 1;
          const tX = E._tHv || ten, dX = this.coDai(tX, co * kc) || dai; // nổ đúng hướng nhìn đang vẽ
          this._xac.push({ x: E.x, y: E.y + (E._oy || 0), goc: E._gv || 0, lat: E._lat || 1, co: co * kc * (E._sc || 1), f: E._f || 0, t: 0, dai: dX, w: this.coDai(tX, co * kc, 'trang') });
        }
        continue;
      }
      // ---- nhịp khung (thời gian thực): theo tốc độ đi, có trần ở 2×/3× ----
      const n = dai ? dai.nf : 4;
      let v = E.d.v * (1 - (E.d.khangCham ? 0 : E.cham)); if (E.chan > 0) v = E.trum ? v * 0.5 : 0;
      const nhip = (2 + v / 10) / 4; // vòng/giây ở 1× (như cũ: 4 khung)
      const tran = bay ? 3.2 : 2.4;  // trần vòng/giây ở tốc độ cao → không chớp nháy
      if (E._ph == null) E._ph = Math.random();
      E._ph += dt * Math.min(nhip * k, Math.max(nhip, tran));
      // ---- trúng đòn: phát hiện cú đánh mới (flash vừa được đặt lại) ----
      if (E.flash > (E._fl || 0) + 1e-4) E._hitT = t;
      E._fl = E.flash;
      const hk = E._hitT != null ? Math.max(0, 1 - (t - E._hitT) / 0.16) : 0, he = hk * hk;
      // ---- hướng & vị trí ----
      // hướng nhìn theo hướng đi trên đường (DCDW): trước/ngang/sau — KHÔNG xoay cả hình nữa; dải hướng chưa có → dải trước nghiêng ≤ 8°
      this.huongQuai(E, t);
      const ngD = E._hv === 's' ? E._hl * (HUONG8.size && this.tenHuong(ten, 's') ? 0.035 : HUONG_NGHIENG) : 0;
      E._ng = E._ng == null ? ngD : E._ng + (ngD - E._ng) * Math.min(1, dt * 12);
      const gv = E._ng;
      // độ rẽ (để lắc lư nhẹ vào khúc cua)
      const r = E.trum ? 0 : clamp(gocLech(E.gv != null ? E.gv : E.goc, E.goc), -0.8, 0.8);
      const buoc = Math.sin(E._ph * Math.PI * 2 * 2); // 2 bước / vòng khung
      const hover = bay ? -6 + Math.sin(t * 3.1 + E.uid) * 2.2 : 0;
      const kb = he * Math.min(3, co * 0.06); // giật lùi
      const hx = Math.cos(E.goc), hy = Math.sin(E.goc);
      let x = E.x - (E.trum ? 0 : hx * kb), y = E.y + hover - (E.trum ? kb * 0.4 : hy * kb);
      let sc = 0.6 + 0.4 * (E.vao * E.vao * (3 - 2 * E.vao)); // xuất hiện êm
      sc *= 1 - 0.035 * he; // nén nhẹ khi trúng đòn
      // ---- bóng ----
      const bco = co * (bay ? 0.62 : 0.78) * sc * (bay ? 1 - (hover + 6) * 0.02 : 1);
      ctx.globalAlpha = bay ? 0.32 : 0.5;
      if (bong) ctx.drawImage(REN.mip(bong, bco * REN.s * REN.dpr), E.x + 2 - bco / 2, E.y + 4 + (bay ? 8 : 0) - bco * 0.42, bco, bco * 0.84);
      ctx.globalAlpha = 1;
      // ---- quầng báo chiêu của trùm ----
      if (E.bao) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        PX.cham(ctx, x, y, co * 1.8, TRUM[E.trum].mau, 0.6 + 0.4 * Math.sin(t * 20)); ctx.restore(); // quầng = fx_cham_trang tô màu trùm
        ctx.globalAlpha = 1;
      }
      const lanh = E.cham > 0 && !E.d.khangCham;
      const st = this.stV2(E, lanh); // trạng thái v2 (ảnh ChatGPT tờ ST) → vẽ sau thân, bỏ quầng/hạt code
      if (lanh) {
        if (!E._lanhT) { E._lanhT = t; FX.no('bang_vo', x, y, co * 0.8, 0.19); }
        if (!st.cham) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.2;
          this.anhGiua(ctx, this.cham1('#78D9F5'), x, y, co * 0.75); ctx.restore(); ctx.globalAlpha = 1; }
      } else E._lanhT = 0;
      if ((E.yeu > 0 || E.cvT > 0 || E.giapT > 0) && !st.yeu) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.28;
        const mm = E.cvT > 0 ? ['#ff4b8a', '#ffd23f', '#4bff9a', '#4fb8ff', '#c77dff'][Math.floor(t * 6 + E.uid) % 5] : E.giapT > 0 ? '#ffd23f' : '#c77dff';
        this.anhGiua(ctx, this.cham1(mm), x, y, co * 1.15); ctx.restore(); ctx.globalAlpha = 1;
      }
      // ---- thân ----
      let f0, f1 = -1, fr = 0;
      if (E.trum && n === 4) { // trùm 4 khung: đi 0-1-2-1 (khung 3 = tung chiêu)
        if (E.bao) f0 = 3;
        else {
          const seq = [0, 1, 2, 1], p = E._ph * 4, i = Math.floor(p), q = p - i;
          f0 = seq[i % 4]; f1 = seq[(i + 1) % 4]; fr = q;
        }
      } else {
        const p = E._ph * n, i = Math.floor(p); f0 = i % n; f1 = (i + 1) % n; fr = p - i;
        if (E.trum && E.bao && n !== 4) { const a4 = this.coDai('trum_' + E.trum, co); if (a4) { E._daiBao = a4; } }
      }
      // hoà: 4 khung hoà ở 55% cuối, 8 khung hoà ở 45% cuối (đỡ bóng ma), smoothstep
      const nguong = dong ? 0.65 : n >= 8 ? 0.55 : 0.45;
      fr = fr <= nguong ? 0 : (fr - nguong) / (1 - nguong); fr = fr * fr * (3 - 2 * fr);
      E._f = fr > 0.5 && f1 >= 0 ? f1 : f0; E._gv = gv; E._oy = hover; E._sc = sc;
      if (!dai) { /* ảnh quái chưa nạp: không vẽ chấm thay thế */ }
      else {
        // nhún/nén theo bước (≤3%): dọc hướng đi giãn thì ngang co, gần như giữ diện tích
        const am = E.trum ? 0.018 : (E.d.tach || E.id === 'nho' ? 0.03 : bay ? 0.012 : 0.022);
        const sy = 1 + am * buoc, sx = 1 - am * 0.6 * buoc;
        const lac = E.trum ? Math.sin(E._ph * Math.PI * 2) * 0.025 : r * 0.12 + buoc * 0.015; // lắc lư nhẹ
        const C = co * sc * kc, fl = he * he * (E.trum ? 0.4 : 0.7); // chớp trắng ngắn — trùm bị bắn liên tục không trắng xoá
        const bao4 = E.bao && E._daiBao && n !== 4; // trùm tung chiêu: khung 3 dải 4 khung cũ (nhìn ra màn hình), cỡ gốc
        const rot = clamp(gv + lac, -HUONG_NGHIENG, HUONG_NGHIENG);
        const lop = (v, l, al) => { // 1 lớp hướng nhìn v (lật ngang khi đi sang trái)
          const tS = this.tenHuong(ten, v), d = tS ? this.coDai(tS, co * kc) : dai; if (!d) return;
          ctx.setTransform(M); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(tS && v === 's' && l < 0 ? -sx : sx, sy);
          if (bao4) this.veThan(ctx, E._daiBao, null, 3, -1, 0, C / kc, bay, dong, 0, al, false);
          else this.veThan(ctx, d, { ten: tS || ten, px: co * kc }, f0, f1, fr, C, bay, dong, fl, al, true);
          E._tHv = tS || ten; E._lat = tS && v === 's' && l < 0 ? -1 : 1;
        };
        const u = (t - E._hvT) / HUONG_HOA;
        lop(E._hv, E._hl, 1);
        if (u < 1 && E._hvCu && !bao4) { const tN = E._tHv, lN = E._lat; lop(E._hvCu, E._hlCu, 1 - u * u * (3 - 2 * u)); E._tHv = tN; E._lat = lN; } // hướng cũ mờ dần 120 ms
        E._gv = rot;
        ctx.setTransform(M); ctx.globalAlpha = 1;
      }
      if (st.n) this.veStV2(ctx, E, st, x, y, co, t);
      if (E.docT > 0 && !st.doc && Math.random() < 0.06) FX.hat1('lua', x + rnd(-8, 8), y, 0, -20, 0.5, 6, '#9dff5a');
      // ---- thanh máu (không lắc theo nhún để dễ đọc) ----
      const yb = E.y + hover;
      if (E.hp < E.max && !E.trum) {
        const w = Math.max(18, co * 0.55), yy = yb - co * 0.42;
        PX.thanh(ctx, E.x - w / 2, yy, w, 3, E.hp / E.max, E.docT > 0 ? '#7cff4a' : (lanh ? '#6fd8ff' : '#ff4a4a'));
      }
      if (lanh) { ctx.globalAlpha = 0.85; const kh = this.kyHieu('cham', 8); ctx.drawImage(kh, E.x - Math.max(18, co * 0.55) / 2 - 10, yb - co * 0.42 - 3, 8, 8); ctx.globalAlpha = 1; }
      if (E.trum) {
        const w = 70, yy = yb - co * 0.55;
        PX.thanh(ctx, E.x - w / 2, yy, w, 4, E.hp / E.max, TRUM[E.trum].mau);
        if (E.bao) { // dây báo chiêu tới ụ bị nhắm: tia PNG tô màu trùm, lặp + trượt (thay nét đứt vẽ code)
          const B = G.ban[E.ban];
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          for (const T of B.t) if (T && E.bao.muc.includes(T.uid)) { const c = B.o[T.o]; PX.tia(ctx, x, y, c.x, c.y, 2, TRUM[E.trum].mau, 0.7, t * 60); }
          ctx.restore(); ctx.globalAlpha = 1;
        }
      }
    }
  },
});
