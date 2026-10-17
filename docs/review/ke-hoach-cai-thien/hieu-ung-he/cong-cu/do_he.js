// Đo hiệu ứng hệ (phiên hieu-ung-he 17/10). Nạp sau tests/bot.js, setup.js, au_lib.js. CHỈ ĐỌC: không đổi luật chơi.
// HE.chay(o) dựng phòng trống, cầm vũ khí o.wt hệ o.el ở hình thái o.st (0 Trắng, 1 Mầm, 2 Thành hình, 3 Thức tỉnh), đặt quái theo o.bia,
// bấm nút theo kịch bản o.don, chạy o.n khung. Mỗi khung ghi:
//   - hình hiệu ứng CỦA CU TÍ (G.fx.state().E, o.pl) mới sinh: loại / tên ảnh / đời (ms) / cỡ / nhuộm / độ mờ đặt sẵn
//   - số hình của Cu Tí đang sống cùng lúc, số hạt đang sống
//   - (o.mat) mặt nạ điểm ảnh hiệu ứng thấy được: vẽ thế giới 2 lần (có / giấu hình + hạt của Cu Tí), hiệu = điểm ảnh hiệu ứng
//   - đòn trúng (playerHit), sát thương theo nguồn (đòn / nhịp / phản ứng / vùng), áp trạng thái, số sát thương hiện ra
//   - (o.chup) ảnh cắt quanh Cu Tí (thế giới + lớp chữ) để làm GIF
(function () {
  const HE = (window.HE = {});
  const S = () => G.fx.state();
  const KHUNG_MOT = (wt) => ({ sword: 22, spear: 38, hammer: 24, bow: 80 })[wt];
  // Kịch bản nút bấm theo khung i. Trả về object nút cho khung đó.
  const DON = {
    cham3: (i) => ({ atkP: i % 20 === 0 && i < 60, atk: i % 20 < 3 && i < 60 }), // 3 lần chạm cách 20 khung (combo 3 nhát kiếm/giáo/phi tiêu)
    cham4: (i) => ({ atkP: i % 22 === 0 && i < 88, atk: i % 22 < 3 && i < 88 }), // giáo: 3 đâm + quét
    cham1: (i) => ({ atkP: i === 0, atk: i < 3 }),
    giu: (n) => (i) => ({ atkP: i === 0, atk: i < n }), // giữ n khung rồi thả
    nelot: (i) => ({ dodgeP: i === 0, atkP: i === 14, atk: i >= 14 && i < 17 }), // né rồi đánh: nhát lướt (kiếm)
    dacbiet: (i) => ({ specialP: i === 0 }),
    chuong: (i) => ({ skillP: i === 0, skill: i < 3 }),
    chuongGiu: (i) => ({ skillP: i === 0, skill: i < 60 }),
  };
  HE.DON = DON;
  HE.layDon = (d) => (typeof d === 'function' ? d : /^giu\d+$/.test(d || '') ? DON.giu(+d.slice(3)) : DON[d] || DON.cham1);
  const CAY = { fire: 'hoa', poison: 'doc', ice: 'bang' };
  HE.cay = (el) => CAY[el];
  HE.dayCay = (cay) => { const n = {}; for (const q of G.CHUONG.trees[cay].nodes) n[q.id] = q.max; return n; };
  // vị trí quái (dx, dy so với Cu Tí). bia: 'mot' | 'ba' | 'truot' | 'khong' | mảng [[dx,dy],..]
  function viTri(o) {
    const d = o.kc || KHUNG_MOT(o.wt);
    if (Array.isArray(o.bia)) return o.bia;
    if (o.bia === 'mot') return [[d, 0]];
    if (o.bia === 'ba') return o.wt === 'bow' ? [[d, 0], [d + 22, -6], [d + 44, 6]] : [[d, 0], [d + 6, -10], [d + 4, 10]];
    if (o.bia === 'truot') return o.wt === 'bow' ? [[d, 62]] : [[-150, 0]]; // trượt: quái ở xa sau lưng (cận chiến) / lệch hàng (phi tiêu)
    return [];
  }
  HE.dung = function (o) {
    const wt = o.wt;
    const r = AU.room({ hero: 'smith', melee: wt === 'bow' ? 'sword' : wt, lvl: 20, region: o.vung || 0, stage: o.trum ? 4 : 0, big: !!o.trum, keepBoss: !!o.trum });
    const { W, P } = r;
    AU.want(P, wt);
    const w = G.curW(P);
    if (o.st > 0 && o.el) { if (G.vkMoi && G.vkMoi.datCap) G.vkMoi.datCap(w, o.st, o.el); else { w.branch = o.el; w.marks[o.el] = G.MARKS[o.st - 1]; } }
    else if (G.vkMoi && G.vkMoi.datCap) G.vkMoi.datCap(w, 0, null);
    if (o.luyen != null) { // cấp Luyện 1–15: hình thái theo G.luyen.hinhThai (3 Mầm, 6 Thành hình, 12 Thức tỉnh) như js/luyen.js
      w.luyen = o.luyen;
      if (G.luyen && G.vkMoi && G.vkMoi.datCap) { const ht = G.luyen.hinhThai(o.luyen); G.vkMoi.datCap(w, ht, ht > 0 ? o.el || 'fire' : null); }
    }
    if (o.chuong) { const hs = G.save.heroes.smith; hs.ch = { cay: o.chuong, n: o.chuongN || {} }; }
    P.mana = P.maxmana; P.face = 1; P.specCd = 0; P.skillCd = 0;
    G.noRender = false; G.fx.reset();
    AU.run(2, true);
    const bia = [];
    for (const [dx, dy] of viTri(o)) {
      const e = G.spawnEnemy(o.vai || 'rusher', P.x + dx, P.y + dy, {});
      e.speed = 0; e.cd = 1e9; e.inside = true; e.spawnT = 0; e.maxhp = e.hp = 1e8; e.dummy = true;
      if (o.giuMau === false) { e.maxhp = e.hp = o.mau || 50; }
      bia.push({ e, x: P.x + dx, y: P.y + dy });
    }
    if (o.trum && W.boss) { const b = W.boss; b.x = P.x + (o.kc || 60); b.y = P.y; b.cd = 1e9; b.speed = 0; b.maxhp = b.hp = 1e8; b.intro = 0; b.invuln = 0; bia.push({ e: b, x: b.x, y: b.y, trum: true }); }
    if (o.truocSt) for (const q of bia) Object.assign(q.e.st, o.truocSt); // trạng thái có sẵn trên quái (đo phản ứng hệ)
    return { W, P, w, bia };
  };
  // hình của Cu Tí: tên gọn
  const ten = (q) => (q.ty === 'anh' ? q.ma : q.ty === 'he' ? 'he:' + ((q.draw && q.draw.name) || '?') : q.ty);
  HE.chay = function (o) {
    const { W, P, w, bia } = HE.dung(o);
    const st = S(), N = o.n || 90;
    const sinh = new Set(st.E), sinhN = new Set(st.N);
    const out = { st: G.wStage(w), el: G.activeEl(P, w), luyen: w.luyen, hinh: [], song: [], hat: [], trung: [], sat: [], trangThai: [], so: [], phanUng: [], khung: [], mat: null, matN: 0, anh: [] };
    const idx = (e) => bia.findIndex((q) => q.e === e);
    let khung = 0;
    // bọc tạm để đếm
    const ph0 = G.cb.playerHit, dm0 = G.damage, as0 = G.applyStatus, fxc0 = G.fx.combo, fxf0 = G.fx.freeze;
    G.cb.playerHit = function (e, m, oo) { out.trung.push({ k: khung, b: idx(e) }); return ph0.apply(this, arguments); };
    G.damage = function (t, amt, oo) { const h = t.hp, r = dm0.apply(this, arguments); if (idx(t) >= 0) out.sat.push({ k: khung, b: idx(t), d: Math.round((h - t.hp) * 10) / 10, src: (oo && oo.src) || '?', el: (oo && oo.el) || null }); return r; };
    G.applyStatus = function (t, el) { const r = as0.apply(this, arguments); if (idx(t) >= 0) out.trangThai.push({ k: khung, b: idx(t), el, fire: +t.st.fire.toFixed(2), doc: t.st.poisonN, bang: t.st.iceN, dong: +Math.max(0, t.st.frozen).toFixed(2) }); return r; };
    G.fx.combo = function (kind, t) { out.phanUng.push({ k: khung, kind, b: idx(t) }); return fxc0.apply(this, arguments); };
    G.fx.freeze = function (t) { out.phanUng.push({ k: khung, kind: 'freeze', b: idx(t) }); return fxf0.apply(this, arguments); };
    // mặt nạ: lưới điểm game quanh Cu Tí [-MX..MX] x [-MY0..MY1]
    const MX = 200, MY0 = 120, MY1 = 80, MW = MX * 2, MH = MY0 + MY1;
    const CUA = o.cua || [[0, N]];
    const mats = o.mat ? CUA.map(() => new Uint16Array(MW * MH)) : null;
    let mat = null;
    const cv = G.wx.canvas, sc = cv.width / G.W, ctx = cv.getContext('2d', { willReadFrequently: true });
    const ve = () => { G.drawWorld(G.getRun().r); };
    const x0 = P.x, y0 = P.y;
    function doMat() {
      const s = S(); s.sx = 0; s.sy = 0; s.kx = 0; s.ky = 0; s.trauma = 0;
      const cam = Math.round(W.cam);
      const gx0 = Math.max(0, Math.floor((x0 - MX - cam) * sc)), gy0 = Math.max(0, Math.floor((y0 - MY0) * sc));
      const gw = Math.min(cv.width - gx0, Math.ceil(MW * sc)), gh = Math.min(cv.height - gy0, Math.ceil(MH * sc));
      if (gw <= 0 || gh <= 0) return 0;
      ve();
      const a = ctx.getImageData(gx0, gy0, gw, gh).data;
      const an = [];
      for (const q of s.E) if (q.pl) { an.push([q, q.d]); q.d = 1e3; }
      const np = s.np, trN = s.trN; s.np = 0; s.trN = 0;
      try { ve(); } finally { for (const [q, d] of an) q.d = d; s.np = np; s.trN = trN; }
      const b = ctx.getImageData(gx0, gy0, gw, gh).data;
      let n = 0;
      for (let i = 0; i < a.length; i += 4) {
        if (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) <= 40) continue;
        const j = i >> 2, px = gx0 + (j % gw), py = gy0 + Math.floor(j / gw);
        const wx = Math.floor(px / sc + cam - x0 + MX), wy = Math.floor(py / sc - y0 + MY0);
        if (wx >= 0 && wx < MW && wy >= 0 && wy < MH) { if (mat[wy * MW + wx] < 65535) mat[wy * MW + wx]++; }
        n++;
      }
      return n / (sc * sc);
    }
    // Tách lớp (o.tachLop): mỗi khung, giấu RIÊNG từng loại hình của Cu Tí (theo tên), đếm điểm ảnh mất đi = điểm ảnh loại đó thấy được.
    out.lopPx = {}; out.lopKhung = {};
    function tachLop() {
      const s = S(); s.sx = 0; s.sy = 0;
      const cam = Math.round(W.cam);
      const gx0 = Math.max(0, Math.floor((x0 - MX - cam) * sc)), gy0 = Math.max(0, Math.floor((y0 - MY0) * sc));
      const gw = Math.min(cv.width - gx0, Math.ceil(MW * sc)), gh = Math.min(cv.height - gy0, Math.ceil(MH * sc));
      if (gw <= 0 || gh <= 0) return;
      ve(); const a = ctx.getImageData(gx0, gy0, gw, gh).data;
      const loai = new Set(); for (const q of s.E) if (q.pl && q.t > 0 && !(q.d > 0)) loai.add(ten(q));
      if (s.np) loai.add('#hat-code');
      for (const L of loai) {
        const an = [];
        let np = s.np;
        if (L === '#hat-code') s.np = 0; else for (const q of s.E) if (q.pl && ten(q) === L) { an.push([q, q.d]); q.d = 1e3; }
        try { ve(); } finally { for (const [q, d] of an) q.d = d; s.np = np; }
        const b = ctx.getImageData(gx0, gy0, gw, gh).data; let n = 0;
        for (let i = 0; i < a.length; i += 4) if (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) > 40) n++;
        const px = n / (sc * sc);
        out.lopPx[L] = (out.lopPx[L] || 0) + px; if (px >= 4) out.lopKhung[L] = (out.lopKhung[L] || 0) + 1;
      }
    }
    function chup() {
      const s = S(); const cam = Math.round(W.cam);
      if (o.khongRung !== false) { s.sx = 0; s.sy = 0; } // ảnh GIF: bỏ rung màn (nền đứng yên → GIF nhỏ, dễ nhìn hiệu ứng)
      const CW = o.chupW || 200, CH = o.chupH || 110, K = o.chupK || 2;
      G.ux.clearRect(0, 0, G.ux.canvas.width, G.ux.canvas.height);
      ve();
      const c = document.createElement('canvas'); c.width = CW * K; c.height = CH * K; const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
      const cxw = (o.chupX != null ? o.chupX : x0 + 40) - CW / 2, cyw = y0 - CH + 30;
      x.drawImage(cv, (cxw - cam) * sc, cyw * sc, CW * sc, CH * sc, 0, 0, CW * K, CH * K);
      const uc = G.ux.canvas, su = uc.width / G.W;
      x.drawImage(uc, (cxw - cam) * su, cyw * su, CW * su, CH * su, 0, 0, CW * K, CH * K);
      out.anh.push(c.toDataURL('image/png'));
    }
    const don = HE.layDon(o.don);
    try {
      AU.run(N, true, (i) => {
        khung = i;
        AU.press(Object.assign({ atkP: false, atk: false, mx: 0, my: 0 }, don(i)));
        AU.pin(bia);
        for (const q of bia) if (q.trum) { q.e.intro = 0; q.e.invuln = 0; q.e.busy = 0; }
        if (!i) return;
        const s = S();
        let song = 0, ds = {};
        for (const q of s.E) {
          if (!q.pl) continue;
          if (!sinh.has(q)) {
            sinh.add(q);
            const A = q.ty === 'anh' && G.fxAnh.ds[q.ma];
            out.hinh.push({ k: i, ten: ten(q), ms: Math.round((q.t0 || q.t) * 1000), giu: q.hold ? Math.round(q.hold * 1000) : 0, tre: Math.round((q.d || 0) * 1000), sc: q.sc != null ? +(+q.sc).toFixed(2) : null,
              rong: A ? Math.round(A.fw * A.co * (q.sc || 1)) : null, cao: A ? Math.round(A.fh * A.co * (q.sc || 1)) : null, khung: A ? A.so : null, mau: q.mau || null, mo: q.mo3 != null ? q.mo3 : null,
              dx: Math.round(q.x - x0), dy: Math.round(q.y - y0), gian: !!q.gian, lap: !!(A && A.lap), an: !!q.hmAn, cham: q.cham || 1, vien: q.vien || 0, tam: q.hmTam || null });
          }
          if (q.t > 0 && !(q.d > 0) && !q.hmAn) { song++; const k = ten(q); ds[k] = (ds[k] || 0) + 1; }
        }
        let hat = 0; for (let j = 0; j < s.np; j++) { const p = G.fx.parts()[j]; if (p.t > 0 && p.pl) hat++; }
        out.song.push(song); out.hat.push(hat); out.khung.push(ds);
        for (const q of s.N) if (!sinhN.has(q)) { sinhN.add(q); const b = idx(q.chu); if (b >= 0 || q.loai === 'dmg') out.so.push({ k: i, b, s: q.s, dot: !!q.dot, mau: q.col, co: q.size }); }
        if (mats) { const ci = CUA.findIndex((c) => i >= c[0] && i < c[1]); if (ci >= 0) { mat = mats[ci]; out.matN += doMat(); } }
        if (o.tachLop) tachLop();
        if (o.chup && (i % (o.chupMoi || 2) === 0)) chup();
      });
    } finally {
      G.cb.playerHit = ph0; G.damage = dm0; G.applyStatus = as0; G.fx.combo = fxc0; G.fx.freeze = fxf0; AU.inp.atk = false; AU.inp.skill = false;
    }
    // biểu hiện trên quái lúc cuối
    out.quai = bia.map((q) => ({ fire: +Math.max(0, q.e.st.fire).toFixed(2), doc: q.e.st.poisonN, bang: q.e.st.iceN, dong: +Math.max(0, q.e.st.frozen).toFixed(2), mau: Math.round(q.e.maxhp - q.e.hp) }));
    if (mats) out.mat = mats.map((mat) => {
      // khung bao + mật độ: ô có điểm ảnh hiệu ứng ít nhất 1 khung
      let a = 1e9, b = -1e9, c = 1e9, d = -1e9, n = 0; const ds = [];
      for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) { const v = mat[y * MW + x]; if (!v) continue; n++; a = Math.min(a, x - MX); b = Math.max(b, x - MX); c = Math.min(c, y - MY0); d = Math.max(d, y - MY0); ds.push(x - MX, y - MY0, v); }
      return n ? { x0: a, x1: b, y0: c, y1: d, o: n, ds } : { o: 0, ds: [] };
    });
    out.P = { x: x0, y: y0, face: P.face };
    return out;
  };
  // Vùng trúng thật: đặt lưới quái (bia đứng yên, máu rất dày) quanh Cu Tí, ra đòn một lần, ghi quái nào bị trúng (đòn / vùng / nhịp).
  // Không vẽ (G.sim) — luật y như lúc có vẽ.
  HE.vungTrung = function (o) {
    const pts = [];
    for (let dy = -42; dy <= 42; dy += 6) { for (let dx = 6; dx <= 162; dx += 6) pts.push([dx, dy]); for (let dx = -16; dx >= -70; dx -= 6) pts.push([dx, dy]); } // con gần nhất là (6, 0) phía trước: Cu Tí quay phải, ngắm thẳng
    const { W, P, w, bia } = HE.dung(Object.assign({}, o, { bia: pts }));
    const res = bia.map(() => ({ hit: -1, ks: [], src: {} }));
    const idx = new Map(bia.map((q, i) => [q.e, i]));
    const ph0 = G.cb.playerHit, dm0 = G.damage;
    let khung = 0;
    
    G.damage = function (t, amt, oo) { const i = idx.get(t); if (i != null) { const k = (oo && oo.src) || '?'; if (res[i].src[k] == null) res[i].src[k] = khung; if (k === 'hit') { if (res[i].hit < 0) res[i].hit = khung; if (!res[i].ks.includes(khung)) res[i].ks.push(khung); } } return dm0.apply(this, arguments); }; // đòn trúng = sát thương nguồn 'hit' (cả lướt / xốc tới gọi playerHit nội bộ)
    const don = HE.layDon(o.don);
    try {
      AU.run(o.n || 90, !!o.coVe, (i) => { khung = i; AU.press(Object.assign({ atkP: false, atk: false, mx: 0, my: 0 }, don(i))); AU.pin(bia); });
    } finally { G.cb.playerHit = ph0; G.damage = dm0; AU.inp.atk = false; AU.inp.skill = false; }
    return { pts, res, r: bia[0] ? bia[0].e.r : 8, h: bia[0] ? bia[0].e.h : 24, face: P.face, zones: W.zones.filter((z) => z.team === 'player').map((z) => ({ shape: z.shape, x: Math.round(z.x - P.x), y: Math.round(z.y - P.y), r: z.r, el: z.el })) };
  };
})();
