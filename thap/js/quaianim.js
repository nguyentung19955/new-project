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

Object.assign(REN, {
  _xac: [],
  // bóng mềm (đĩa đen mép mờ) dựng 1 lần
  bong1() {
    if (this._bong) return this._bong;
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(0,0,0,.75)'); g.addColorStop(0.55, 'rgba(0,0,0,.45)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    return (this._bong = c);
  },
  // tên dải ảnh dùng cho quái: ưu tiên bản 8 khung nếu đã nạp được
  tenQuai(E) {
    const goc = E.trum ? 'trum_' + E.trum : 'quai_' + (E.d.anh || E.id);
    const co8 = E.trum ? TRUM8.has(E.trum) : QUAI8.has(E.d.anh || E.id);
    if (co8) { const a = this.img(goc + '_8'); if (a) return goc + '_8'; }
    return goc;
  },
  // vẽ khung f của dải (đã thu nhỏ sẵn) tại gốc toạ độ hiện tại, cỡ co
  khung0(ctx, dai, f, co) {
    const n = dai.nf, fw = dai.fm, st = dai.fm + dai.gap;
    f = ((f % n) + n) % n;
    ctx.drawImage(dai, f * st, 0, fw, dai.height, -co / 2, -co / 2, co, co);
  },

  veQuai(ctx) {
    const dt = this.dt || 0, k = G.tocDo || 1, t = this.t;
    // xác đang nổ (thời gian thực) — vẽ dưới quái sống
    for (let i = this._xac.length - 1; i >= 0; i--) {
      const X = this._xac[i]; X.t += dt;
      if (X.t >= 0.3) { this._xac.splice(i, 1); continue; }
      const u = X.t / 0.3, e = 1 - (1 - u) * (1 - u) * (1 - u);
      const sc = 1 + 0.32 * e, al = (1 - u) * (1 - u);
      ctx.save(); ctx.translate(X.x, X.y); if (X.goc) ctx.rotate(X.goc);
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
          this._xac.push({ x: E.x, y: E.y + (E._oy || 0), goc: E._gv || 0, co: co * kc * (E._sc || 1), f: E._f || 0, t: 0, dai, w: this.coDai(ten, co * kc, 'trang') });
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
      const gv = E.trum ? 0 : (E.gv != null ? E.gv : E.goc) - Math.PI / 2;
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
      ctx.drawImage(bong, E.x + 2 - bco / 2, E.y + 4 + (bay ? 8 : 0) - bco * 0.42, bco, bco * 0.84);
      ctx.globalAlpha = 1;
      // ---- quầng báo chiêu của trùm ----
      if (E.bao) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const gg = ctx.createRadialGradient(x, y, 4, x, y, co * 0.9); const m = TRUM[E.trum].mau;
        gg.addColorStop(0, m + 'aa'); gg.addColorStop(1, m + '00');
        ctx.globalAlpha = 0.6 + 0.4 * Math.sin(t * 20); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(x, y, co * 0.9, 0, 7); ctx.fill(); ctx.restore();
        ctx.globalAlpha = 1;
      }
      const lanh = E.cham > 0 && !E.d.khangCham;
      if (lanh) {
        if (!E._lanhT) { E._lanhT = t; FX.no('bang_vo', x, y, co * 0.8, 0.19); }
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.2;
        this.anhGiua(ctx, this.cham1('#78D9F5'), x, y, co * 0.75); ctx.restore(); ctx.globalAlpha = 1;
      } else E._lanhT = 0;
      if (E.yeu > 0 || E.cvT > 0 || E.giapT > 0) {
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
      if (!dai) { ctx.fillStyle = '#a040ff'; ctx.beginPath(); ctx.arc(x, y, co * 0.3, 0, 7); ctx.fill(); }
      else {
        // nhún/nén theo bước (≤3%): dọc hướng đi giãn thì ngang co, gần như giữ diện tích
        const am = E.trum ? 0.018 : (E.d.tach || E.id === 'nho' ? 0.03 : bay ? 0.012 : 0.022);
        const sy = 1 + am * buoc, sx = 1 - am * 0.6 * buoc;
        const lac = E.trum ? Math.sin(E._ph * Math.PI * 2) * 0.025 : r * 0.12 + buoc * 0.015; // lắc lư nhẹ
        ctx.translate(x, y); ctx.rotate(gv + lac); ctx.scale(sx, sy);
        const C = co * sc * kc;
        const daiV = E.bao && E._daiBao && n !== 4 ? E._daiBao : dai, fV = daiV === dai ? f0 : 3;
        if (bay && !dong) { // cánh rung: vệt mờ của khung kế tiếp, hơi lớn hơn (bỏ khi màn quá đông quái)
          ctx.globalAlpha = 0.22; this.khung0(ctx, daiV, fV + 1, C * 1.035);
        }
        ctx.globalAlpha = 1; this.khung0(ctx, daiV, fV, daiV === dai ? C : C / kc); // khung tung chiêu (dải 4 khung cũ): cỡ gốc
        if (f1 >= 0 && fr > 0.01 && daiV === dai) { ctx.globalAlpha = fr; this.khung0(ctx, dai, f1, C); }
        // chớp trắng ngắn (tắt nhanh theo bình phương) — trùm bị bắn liên tục không bị trắng xoá
        const fl = he * he * (E.trum ? 0.4 : 0.7);
        if (fl > 0.02) { const w = this.coDai(ten, co * kc, 'trang'); if (w && daiV === dai) { ctx.globalAlpha = fl; this.khung0(ctx, w, fr > 0.5 && f1 >= 0 ? f1 : f0, C); } }
        ctx.setTransform(M); ctx.globalAlpha = 1;
      }
      if (E.docT > 0 && Math.random() < 0.06) FX.hat1('lua', x + rnd(-8, 8), y, 0, -20, 0.5, 6, '#9dff5a');
      // ---- thanh máu (không lắc theo nhún để dễ đọc) ----
      const yb = E.y + hover;
      if (E.hp < E.max && !E.trum) {
        const w = Math.max(18, co * 0.55), yy = yb - co * 0.42;
        ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.fillRect(E.x - w / 2 - 1, yy - 1, w + 2, 5);
        ctx.fillStyle = E.docT > 0 ? '#7cff4a' : (lanh ? '#6fd8ff' : '#ff4a4a');
        ctx.fillRect(E.x - w / 2, yy, w * clamp(E.hp / E.max, 0, 1), 3);
      }
      if (lanh) { ctx.globalAlpha = 0.85; const kh = this.kyHieu('cham', 8); ctx.drawImage(kh, E.x - Math.max(18, co * 0.55) / 2 - 10, yb - co * 0.42 - 3, 8, 8); ctx.globalAlpha = 1; }
      if (E.trum) {
        const w = 70, yy = yb - co * 0.55;
        ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.fillRect(E.x - w / 2 - 2, yy - 2, w + 4, 8);
        ctx.fillStyle = TRUM[E.trum].mau; ctx.fillRect(E.x - w / 2, yy, w * clamp(E.hp / E.max, 0, 1), 4);
        if (E.bao) {
          const B = G.ban[E.ban];
          ctx.save(); ctx.strokeStyle = TRUM[E.trum].mau; ctx.globalAlpha = 0.7; ctx.lineWidth = 2; ctx.setLineDash([5, 6]); ctx.lineDashOffset = -t * 60;
          for (const T of B.t) if (T && E.bao.muc.includes(T.uid)) { const c = B.o[T.o]; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(c.x, c.y); ctx.stroke(); }
          ctx.restore();
        }
      }
    }
  },
});
