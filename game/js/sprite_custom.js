// HÌNH TỰ VẼ (Xưởng Sprite, tools/xuong-sprite): quái hoặc em bé nào có tệp <mã>.sprite.json trong game/art/custom/
// thì vẽ bằng tấm sprite trong tệp đó, đủ các động tác (đứng thở, đi, chuẩn bị đánh, đánh, trúng đòn, chết), quay trái phải,
// chớp trắng khi trúng đòn. Quái và em bé không có tệp vẫn vẽ bằng code như cũ. Thư mục trống thì game y hệt trước.
// - game/build.py nhúng các tệp vào bản đóng gói thành G.customSpriteData (mảng), tệp này đọc rồi xoá đi.
// - Chỉ đổi HÌNH: luật chơi, thời gian ra đòn, vùng báo trước, hiệu ứng chém, đạn... vẫn của game.
// - Công cụ Xưởng Sprite cũng nạp chính tệp này để hình xem trong công cụ và trong game là một.
// Nạp SAU monster_art.js và hero_tinhlinh.js.
(function () {
  'use strict';
  const G = (typeof window !== 'undefined') ? (window.G = window.G || {}) : (globalThis.G = globalThis.G || {});
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const seg = (u, a, b) => clamp((u - a) / (b - a), 0, 1);
  const ANIMS = ['idle', 'move', 'tele', 'atk', 'hit', 'die', 'ne'];
  const LOOP = { idle: true, move: true };

  const SC = (G.spriteCustom = { ds: {}, ANIMS, LOOP, loi: [] });

  // ---------- nạp một tệp ----------
  // tep: nội dung tệp .sprite.json (đối tượng). Trả về sprite (đang nạp ảnh) hoặc null nếu tệp hỏng.
  SC.add = function (tep) {
    try {
      if (!tep || typeof tep !== 'object' || typeof tep.ma !== 'string' || !/^[A-Za-z0-9_-]{1,40}$/.test(tep.ma)) throw new Error('thiếu mã');
      if (typeof tep.tam !== 'string' || tep.tam.indexOf('data:image/png;base64,') !== 0) throw new Error('thiếu tấm sprite');
      const fw = tep.khung_rong | 0, fh = tep.khung_cao | 0, goc = tep.goc || [0, 0];
      if (fw < 1 || fh < 1 || fw > 1024 || fh > 1024) throw new Error('cỡ khung sai');
      const dt = {};
      for (const k of ANIMS) {
        const a = tep.dong_tac && tep.dong_tac[k];
        if (!a) continue;
        dt[k] = { hang: a.hang | 0, so: Math.max(1, a.so | 0), giay: +a.giay > 0 ? +a.giay : 0.6, lap: !!a.lap, mo: a.mo != null ? +a.mo : null };
      }
      if (!dt.idle) throw new Error('thiếu động tác đứng thở');
      const sp = {
        ma: tep.ma, ten: String(tep.ten || tep.ma), doi: tep.doi_tuong === 'em-be' ? 'em-be' : 'quai', fw, fh, ax: +goc[0] || 0, ay: +goc[1] || 0,
        rong: tep.rong | 0 || fw, cao: tep.cao | 0 || fh, bong: +tep.bong || Math.max(6, (tep.rong | 0) * 0.62), dt, img: null, ready: false, mau: {}, vung: tep.vung || 'moi',
      };
      if (typeof Image !== 'undefined') {
        const img = new Image();
        img.onload = () => { sp.img = img; sp.ready = true; };
        img.onerror = () => { SC.loi.push(sp.ma + ': ảnh hỏng'); };
        img.src = tep.tam;
      }
      SC.ds[sp.ma] = sp;
      // Chỉ nối vào game khi thật sự có hình tự vẽ: không có tệp nào thì game y hệt như chưa có tệp này.
      if (sp.doi === 'quai') { noiQuai(); themVaoDanhSach(sp); } else noiEmBe();
      return sp;
    } catch (e) {
      SC.loi.push((tep && tep.ma) + ': ' + e.message);
      if (typeof console !== 'undefined') console.warn('sprite_custom: bỏ qua tệp hỏng', tep && tep.ma, e.message);
      return null;
    }
  };
  SC.remove = function (ma) { delete SC.ds[ma]; };
  SC.clear = function () { for (const k of Object.keys(SC.ds)) delete SC.ds[k]; };
  SC.get = function (ma) { const s = SC.ds[ma]; return s && s.ready ? s : null; };
  SC.has = (ma) => !!SC.ds[ma];

  // ---------- chọn khung ----------
  // Động tác lặp: theo thời gian t (giây). Động tác một lần: theo tiến độ u (0..1).
  function khungLap(a, t) { return Math.floor(Math.max(0, t) / (a.giay / a.so) + 1e-6) % a.so; }
  function khungMot(a, u) { return Math.min(a.so - 1, Math.floor(clamp(u, 0, 1) * a.so)); }
  SC.khungLap = khungLap; SC.khungMot = khungMot;
  // Tấm ảnh một màu (chớp trắng, nhuộm băng, độc), nhớ theo màu.
  function nhuom(sp, col) {
    let cv = sp.mau[col];
    if (!cv) {
      cv = document.createElement('canvas'); cv.width = sp.img.width; cv.height = sp.img.height;
      const x = cv.getContext('2d'); x.drawImage(sp.img, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, cv.width, cv.height);
      sp.mau[col] = cv;
    }
    return cv;
  }
  SC.nhuom = nhuom;
  // Vẽ một khung tại gốc toạ độ hiện tại (gốc = điểm giữa chân). face < 0: lật sang trái (hình gốc quay sang phải).
  // o: { alpha, flash (0..1 chớp trắng), tint: [màu, độ đậm], dy }
  SC.veKhung = function (c, sp, ten, i, face, o) {
    o = o || {};
    const a = sp.dt[ten] || sp.dt.idle, sx = i * sp.fw, sy = a.hang * sp.fh, ga = c.globalAlpha;
    c.save();
    c.imageSmoothingEnabled = false;
    if (face < 0) c.scale(-1, 1);
    const dx = -sp.ax, dy = -sp.ay + (o.dy || 0);
    if (o.alpha != null) c.globalAlpha = ga * clamp(o.alpha, 0, 1);
    const a1 = c.globalAlpha;
    c.drawImage(sp.img, sx, sy, sp.fw, sp.fh, dx, dy, sp.fw, sp.fh);
    if (o.tint && o.tint[1] > 0) { c.globalAlpha = a1 * clamp(o.tint[1], 0, 1); c.drawImage(nhuom(sp, o.tint[0]), sx, sy, sp.fw, sp.fh, dx, dy, sp.fw, sp.fh); }
    if (o.flash > 0) { c.globalAlpha = a1 * clamp(o.flash, 0, 1); c.drawImage(nhuom(sp, '#ffffff'), sx, sy, sp.fw, sp.fh, dx, dy, sp.fw, sp.fh); }
    c.restore();
  };

  // ---------- QUÁI ----------
  // Đổi tên cử động của game sang động tác của tấm sprite. D: thời lượng cử động trong game (giây).
  SC.chonQuai = function (sp, n, t, D) {
    const dt = sp.dt, mot = (ten, u) => { const a = dt[ten] || dt.idle; return { ten: dt[ten] ? ten : 'idle', i: dt[ten] ? khungMot(a, u) : khungLap(a, t), u }; };
    const lap = (ten, tt) => { const a = dt[ten] || dt.idle; return { ten: dt[ten] ? ten : 'idle', i: khungLap(a, tt == null ? t : tt), u: 0 }; };
    D = D > 0 ? D : (dt[n] && dt[n].giay) || 0.6;
    const u = clamp(t / D, 0, 1);
    if (n === 'idle' || n === 'intro') return lap('idle');
    if (n === 'move') return lap('move');
    if (n === 'tele' || n === 'phase2' || n === 'phase3') return mot('tele', u);
    if (n === 'atk') return mot('atk', u);
    if (n === 'hit') return mot('hit', u);
    if (n === 'stun') { const r = mot('hit', 0.35 + 0.15 * Math.sin(t * 9)); r.u = 1; return r; }
    if (n === 'die') { const r = mot('die', u); r.alpha = 1 - seg(u, dt.die && dt.die.mo != null ? dt.die.mo : 0.6, 1); return r; }
    if (n === 'spawn') { const r = lap('idle'); const k = seg(u, 0.1, 0.75); r.alpha = k; r.dy = Math.round((1 - k) * 6); return r; }
    if (/^chieu|^c\d$/.test(n)) return u < 0.4 ? mot('tele', u / 0.4) : mot('atk', (u - 0.4) / 0.6);
    return lap('idle');
  };
  // Vẽ quái tự vẽ tại (x, y) với tuỳ chọn giống G.monsterArt.draw. bong: có vẽ bóng dưới chân không. D: thời lượng cử động trong game.
  SC.veQuai = function (c, sp, x, y, o, bong, D) {
    o = o || {};
    const n = o.anim || 'idle', t = Math.max(0, o.t || 0);
    let face = o.face || 0;
    if (!face) { const dir = o.dir == null ? Math.PI : o.dir; face = Math.cos(dir) > 0.01 ? 1 : -1; }
    const s = SC.chonQuai(sp, n, t, D);
    let flash = o.hit || 0;
    if (s.ten === 'hit' && n === 'hit' && s.u < 0.3) flash = Math.max(flash, 0.75); // chớp trắng đầu cú trúng đòn
    c.save();
    c.translate(Math.round(x), Math.round(y));
    if (bong) {
      const w = sp.bong * (n === 'die' ? 1 - 0.5 * (s.u || 0) : 1);
      c.save();
      c.globalAlpha *= 0.28 * (s.alpha == null ? 1 : s.alpha);
      if (G.art && G.art.ellipse) G.art.ellipse(c, 0, 0, w / 2, Math.max(1.5, w * 0.14), '#000000');
      else { c.fillStyle = '#000'; c.beginPath(); c.ellipse(0, 0, w / 2, Math.max(1.5, w * 0.14), 0, 0, Math.PI * 2); c.fill(); }
      c.restore();
    }
    SC.veKhung(c, sp, s.ten, s.i, face, { alpha: s.alpha, flash, dy: s.dy });
    c.restore();
    return s;
  };

  // Bút giả: chuyển mọi lệnh vẽ sang bút thật, riêng drawImage thì hỏi hàm thay.
  function butGia(c, thay) {
    const nho = new Map();
    return new Proxy(c, {
      get(o, k) {
        if (k === 'drawImage') return thay;
        const v = o[k];
        if (typeof v !== 'function') return v;
        let f = nho.get(k);
        if (!f) { f = v.bind(o); nho.set(k, f); }
        return f;
      },
      set(o, k, v) { o[k] = v; return true; },
    });
  }
  SC.butGia = butGia;

  let MA = null, draw0 = null, dur0 = null;
  function themVaoDanhSach(sp) {
    if (!MA || (MA._defs && MA._defs[sp.ma])) return;
    if (MA.list.some((m) => m.id === sp.ma)) return;
    MA.list.push({ id: sp.ma, ten: sp.ten, vung: sp.vung, loai: 'thuong', w: sp.rong, h: sp.cao, pha: 1, bay: false, tuVe: true,
      anims: Object.keys(sp.dt).map((k) => ({ id: k, ten: k, d: sp.dt[k].giay, lap: !!sp.dt[k].lap, moc: null })) });
  }
  function noiQuai() {
    MA = G.monsterArt;
    if (!MA || MA._spriteCustom) return;
    if (!SC.noi) return;
    MA._spriteCustom = true;
    draw0 = MA.draw; dur0 = MA.dur;
    MA.draw = function (c, id, x, y, o) {
      const sp = SC.ds[id];
      if (!sp || !sp.ready) return draw0.call(MA, c, id, x, y, o);
      o = o || {};
      const def = MA._defs && MA._defs[id];
      if (!def) { SC.veQuai(c, sp, x, y, o, true, 0); return; }
      // Quái có sẵn: để hình gốc vẽ bóng và hiệu ứng (vệt chém, tia lửa...), chỉ thay phần thân bằng hình tự vẽ.
      const T0 = c.getTransform(), a0 = c.globalAlpha, D = dur0.call(MA, id, o.anim) || 0;
      let xong = false;
      const gia = butGia(c, function () {
        if (xong) return;
        xong = true;
        c.save(); c.setTransform(T0); c.globalAlpha = a0;
        try { SC.veQuai(c, sp, x, y, o, false, D); } finally { c.restore(); }
      });
      draw0.call(MA, gia, id, x, y, o);
    };
    MA.dur = function (id, anim) {
      const d = dur0.call(MA, id, anim);
      if (d) return d;
      const sp = SC.ds[id];
      return sp && sp.dt[anim] ? sp.dt[anim].giay : 0;
    };
  }

  // ---------- EM BÉ ----------
  // Mã tệp: "em-be" cho cả bốn em bé, hoặc "em-be-smith", "em-be-hunter", "em-be-healer", "em-be-wrestler" cho từng bé.
  SC.cuaEmBe = (key) => SC.get('em-be-' + (key || 'smith')) || SC.get('em-be');
  SC.chonEmBe = function (sp, o) {
    const p = o.p, t = (o.t != null ? o.t : G.time) || 0, dt = sp.dt;
    const mot = (ten, u) => { const k = dt[ten] ? ten : 'idle'; return { ten: k, i: dt[ten] ? khungMot(dt[k], u) : khungLap(dt.idle, t), u }; };
    const lap = (ten, tt) => { const k = dt[ten] ? ten : 'idle'; return { ten: k, i: khungLap(dt[k], tt), u: 0 }; };
    if (p && p.dead) { const u = (p.deadT || 0) / ((dt.die && dt.die.giay) || 0.6); return mot('die', u); }
    if (o.dodge >= 0) return dt.ne ? mot('ne', o.dodge) : lap('move', t);
    if (p && p.dashT > 0) return lap('move', t * 2);
    if (p && p.specT > 0) return mot('atk', 1 - p.specT / 0.35);
    if (p && p.castT > 0) return mot('atk', 1 - p.castT / 0.4);
    if (p && p.mv && p.mv.holding && !(o.atk >= 0)) return mot('tele', 0.99);
    if (o.atk >= 0) return mot('atk', o.atk);
    if ((p && p.hurtT > 0) || (!p && o.flash)) return mot('hit', p ? 1 - p.hurtT / 0.2 : 0.3);
    if (o.move) return lap('move', t);
    return lap('idle', t);
  };
  function emBeTint(o) {
    const p = o.p, st = p && p.st;
    if (o.flash || (p && p.hurtT > 0)) return ['#ffffff', 0.6];
    if (st && st.ice > 0) return ['#9fd8ff', 0.45];
    if (st && st.poison > 0) return ['#7fd957', 0.4];
    return null;
  }
  SC.emBeTint = emBeTint;
  function noiEmBe() {
    const A = G.art;
    if (!A || !A.hero || A._spriteCustom || !SC.noi) return;
    A._spriteCustom = true;
    const hero0 = A.hero;
    A.hero = function (c, o) {
      const sp = SC.cuaEmBe(o && o.key);
      if (!sp || !G.tinhLinh) return hero0.call(A, c, o);
      let fr = null;
      try { fr = G.tinhLinh.frame(o); } catch (e) { fr = null; }
      if (!fr) return hero0.call(A, c, o);
      const s = SC.chonEmBe(sp, o), tint = emBeTint(o);
      // Em bé gốc vẫn vẽ bóng, vũ khí, hào quang trang phục; chỗ vẽ thân thì vẽ hình tự vẽ.
      const gia = butGia(c, function (img, x, y) {
        const than = img === fr.cv || (arguments.length === 3 && x === fr.ox && y === fr.oy && img && img.width === fr.cv.width && img.height === fr.cv.height);
        if (than) { SC.veKhung(c, sp, s.ten, s.i, 1, { tint }); return; }
        if (fr.sil) for (const col in fr.sil) if (fr.sil[col] === img) { // ánh viền màu bậc quanh em bé
          c.save(); c.translate(x - fr.ox, y - fr.oy); c.globalCompositeOperation = 'source-over';
          const a = sp.dt[s.ten] || sp.dt.idle;
          c.drawImage(nhuom(sp, col), s.i * sp.fw, a.hang * sp.fh, sp.fw, sp.fh, -sp.ax, -sp.ay, sp.fw, sp.fh);
          c.restore();
          return;
        }
        return c.drawImage.apply(c, arguments);
      });
      return hero0.call(A, gia, o);
    };
  }

  // Hàm vẽ bằng code (bỏ qua hình tự vẽ), cho công cụ so sánh.
  if (G.monsterArt && !G.monsterArt.drawCode) G.monsterArt.drawCode = G.monsterArt.draw;
  if (G.art && G.art.hero && !G.art.heroCode) G.art.heroCode = G.art.hero;
  SC.noi = true;
  // Tệp do game/build.py nhúng vào bản đóng gói.
  if (Array.isArray(G.customSpriteData)) { for (const t of G.customSpriteData) SC.add(t); delete G.customSpriteData; }
})();
