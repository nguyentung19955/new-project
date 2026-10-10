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
  const ANIMS = ['idle', 'move', 'tele', 'atk', 'hit', 'die', 'ne', 'noi'];
  const LOOP = { idle: true, move: true, noi: true };

  const SC = (G.spriteCustom = { ds: {}, ANIMS, LOOP, loi: [] });
  // "net" (số nguyên 1..4, mặc định 1): ảnh trong tệp ("tam" hoặc "anh") có số điểm ảnh gấp net lần, còn MỌI số khác trong tệp
  // (khung_rong, khung_cao, goc, rong, cao, neo, vu_khi.cam/mui/day, trang_phuc.lech...) vẫn tính theo điểm ảnh GAME.
  // Game cắt vùng ảnh gấp net lần rồi vẽ ra đúng cỡ game: trên canvas thế giới nét gấp đôi (G.NET = 2) hiện đủ chi tiết.
  const docNet = (v) => (v == null || !isFinite(+v) ? 1 : clamp(Math.round(+v), 1, 4));
  SC.docNet = docNet;

  // ---------- nạp một tệp ----------
  // tep: nội dung tệp .sprite.json (đối tượng). Trả về sprite (đang nạp ảnh) hoặc null nếu tệp hỏng.
  SC.add = function (tep) {
    if (tep && tep.doi_tuong === 'hieu-ung') return G.fxAnh ? G.fxAnh.add(tep) : null; // hiệu ứng ảnh AI (js/fx_anh.js)
    try {
      if (!tep || typeof tep !== 'object' || typeof tep.ma !== 'string' || !/^[A-Za-z0-9_-]{1,40}$/.test(tep.ma)) throw new Error('thiếu mã');
      if (DO_LOAI[tep.doi_tuong]) return themDo(tep); // vũ khí, trang phục, vật phẩm
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
        ma: tep.ma, ten: String(tep.ten || tep.ma), doi: tep.doi_tuong === 'em-be' ? 'em-be' : tep.doi_tuong === 'nguoi-lang' ? 'nguoi-lang' : 'quai', fw, fh, ax: +goc[0] || 0, ay: +goc[1] || 0,
        lat: /^(trai|trái|left)$/i.test(String(tep.huong || tep.quay || '')), // ảnh vẽ quay TRÁI thì ghi "huong":"trai" — game tự lật lại để đầu luôn hướng về phía đi
        net: docNet(tep.net), rong: tep.rong | 0 || fw, cao: tep.cao | 0 || fh, bong: +tep.bong || Math.max(6, (tep.rong | 0) * 0.62), dt, img: null, ready: false, mau: {}, vung: tep.vung || 'moi',
      };
      // Bộ phận "Đứng yên" và độ nhún cả người chọn trong công cụ. Tấm sprite đã dựng sẵn theo lựa chọn này, nên game chỉ
      // phát đúng từng khung, không tự thêm nhún, lắc hay xoay nào lên hình tự vẽ (bộ phận đứng yên giữ nguyên trong game).
      // Tệp cũ không có hai mục này: null, phát như trước.
      sp.dungYen = Array.isArray(tep.dung_yen) ? tep.dung_yen.filter((x) => typeof x === 'string' && /^[A-Za-z0-9_]{1,20}$/.test(x)).slice(0, 20) : null;
      sp.nhun = tep.nhun == null || !isFinite(+tep.nhun) ? null : clamp(+tep.nhun, 0, 200);
      // Em bé thân AI: đồ đang mặc (mũ, áo, đồ lưng, bùa, dấu mặt nạ, cánh) vẫn khoác lên thân AI, trừ khi tệp ghi "khoac_do": false.
      // "neo": { "dau": [dx, dy], "than": [dx, dy], "tay": [dx, dy], "<động tác>": { "dau": [..], "than": [..], "tay": [..] } } dời chỗ đặt đồ
      // (đầu, thân) và vũ khí + nắm tay (tay) theo điểm ảnh cho khớp hình AI.
      if (sp.doi === 'em-be') { sp.khoacDo = tep.khoac_do !== false; sp.neo = docNeo(tep.neo); }
      if (typeof Image !== 'undefined') {
        const img = new Image();
        img.onload = () => { sp.img = img; sp.ready = true; };
        img.onerror = () => { SC.loi.push(sp.ma + ': ảnh hỏng'); };
        img.src = tep.tam;
      }
      SC.ds[sp.ma] = sp;
      // Chỉ nối vào game khi thật sự có hình tự vẽ: không có tệp nào thì game y hệt như chưa có tệp này.
      if (sp.doi === 'quai') { noiQuai(); themVaoDanhSach(sp); } else if (sp.doi === 'nguoi-lang') noiNguoiLang(); else noiEmBe();
      return sp;
    } catch (e) {
      SC.loi.push((tep && tep.ma) + ': ' + e.message);
      if (typeof console !== 'undefined') console.warn('sprite_custom: bỏ qua tệp hỏng', tep && tep.ma, e.message);
      return null;
    }
  };
  SC.remove = function (ma) { if (SC.do[ma]) boDo(ma); delete SC.ds[ma]; };
  SC.clear = function () { for (const k of Object.keys(SC.ds)) delete SC.ds[k]; for (const k of Object.keys(SC.do)) boDo(k); };
  SC.get = function (ma) { const s = SC.ds[ma]; return s && s.ready ? s : null; };
  SC.has = (ma) => !!SC.ds[ma];
  SC.dungYen = (ma, bo) => { const s = SC.ds[ma]; return !!(s && s.dungYen && s.dungYen.indexOf(bo) >= 0); };

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
    const a = sp.dt[ten] || sp.dt.idle, n = sp.net || 1, sx = i * sp.fw * n, sy = a.hang * sp.fh * n, sw = sp.fw * n, sh = sp.fh * n, ga = c.globalAlpha;
    c.save();
    c.imageSmoothingEnabled = false;
    if ((face < 0) !== !!sp.lat) c.scale(-1, 1);
    const dx = -sp.ax, dy = -sp.ay + (o.dy || 0);
    if (o.alpha != null) c.globalAlpha = ga * clamp(o.alpha, 0, 1);
    const a1 = c.globalAlpha;
    c.drawImage(sp.img, sx, sy, sw, sh, dx, dy, sp.fw, sp.fh);
    if (o.tint && o.tint[1] > 0) { c.globalAlpha = a1 * clamp(o.tint[1], 0, 1); c.drawImage(nhuom(sp, o.tint[0]), sx, sy, sw, sh, dx, dy, sp.fw, sp.fh); }
    if (o.flash > 0) { c.globalAlpha = a1 * clamp(o.flash, 0, 1); c.drawImage(nhuom(sp, '#ffffff'), sx, sy, sw, sh, dx, dy, sp.fw, sp.fh); }
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
  const so2 = (a) => (Array.isArray(a) && a.length === 2 && isFinite(a[0]) && isFinite(a[1]) ? [clamp(Math.round(+a[0]), -30, 30), clamp(Math.round(+a[1]), -30, 30)] : null);
  function docNeo(n) {
    const goc = { dau: (n && so2(n.dau)) || [0, 0], than: (n && so2(n.than)) || [0, 0], tay: (n && so2(n.tay)) || [0, 0] }, kq = { goc, theo: {} };
    if (n && typeof n === 'object') for (const k of ANIMS) {
      const m = n[k]; if (!m || typeof m !== 'object') continue;
      kq.theo[k] = { dau: so2(m.dau) || goc.dau, than: so2(m.than) || goc.than, tay: so2(m.tay) || goc.tay };
    }
    return kq;
  }
  SC.docNeo = docNeo;
  // Điểm neo của động tác ten (động tác không ghi riêng thì dùng neo chung).
  SC.neoCua = (sp, ten) => (sp.neo ? sp.neo.theo[ten] || sp.neo.goc : null);
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
  // Hình một màu của một lớp đồ (ánh viền bậc), nhớ trên chính lớp đó.
  function bongMau(l, col) {
    l.mau = l.mau || {};
    let cv = l.mau[col];
    if (!cv) {
      cv = document.createElement('canvas'); cv.width = l.cv.width; cv.height = l.cv.height;
      const x = cv.getContext('2d'); x.drawImage(l.cv, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, cv.width, cv.height);
      l.mau[col] = cv;
    }
    return cv;
  }
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
      let lop = null; // đồ đang mặc khoác lên thân AI: lớp sau thân và lớp trước thân, vẽ theo khung xương của em bé gốc
      const neo = SC.neoCua(sp, s.ten);
      if (sp.khoacDo && G.tinhLinh.lopDo) { try { lop = G.tinhLinh.lopDo(fr, neo); } catch (e) { lop = null; } }
      // Vũ khí và nắm tay dời theo "neo.tay" cho khớp bàn tay của thân AI.
      if (neo && neo.tay && (neo.tay[0] || neo.tay[1])) o = Object.assign({}, o, { neoTay: neo.tay });
      // Em bé gốc vẫn vẽ bóng, vũ khí, hào quang trang phục; chỗ vẽ thân thì vẽ hình tự vẽ.
      const gia = butGia(c, function (img, x, y) {
        const than = img === fr.cv || (arguments.length === 3 && x === fr.ox && y === fr.oy && img && img.width === fr.cv.width && img.height === fr.cv.height);
        if (than) {
          if (lop && !lop.sau.trong) c.drawImage(lop.sau.cv, lop.sau.ox, lop.sau.oy);
          SC.veKhung(c, sp, s.ten, s.i, 1, { tint });
          if (lop && !lop.truoc.trong) c.drawImage(lop.truoc.cv, lop.truoc.ox, lop.truoc.oy);
          return;
        }
        if (fr.sil) for (const col in fr.sil) if (fr.sil[col] === img) { // ánh viền màu bậc quanh em bé
          c.save(); c.translate(x - fr.ox, y - fr.oy); c.globalCompositeOperation = 'source-over';
          const a = sp.dt[s.ten] || sp.dt.idle, n = sp.net || 1;
          c.drawImage(nhuom(sp, col), s.i * sp.fw * n, a.hang * sp.fh * n, sp.fw * n, sp.fh * n, -sp.ax, -sp.ay, sp.fw, sp.fh);
          if (lop) for (const l of [lop.sau, lop.truoc]) if (!l.trong) c.drawImage(bongMau(l, col), l.ox, l.oy);
          c.restore();
          return;
        }
        return c.drawImage.apply(c, arguments);
      });
      return hero0.call(A, gia, o);
    };
  }

  // ---------- NGƯỜI LÀNG ----------
  // Mã tệp: nl-<mã người> (nl-lai Chú Lái Đò, nl-ren Ông Thợ Rèn, nl-xen Bà Hàng Xén, nl-may Cô Thợ May, nl-do Cụ Đồ, nl-tu Ông Từ, nl-mo Anh Mõ).
  // Hai động tác: idle (đứng thở) và noi (nói chuyện, vẫy tay: khi em bé tới gần, khi mở bảng). Thay hình trong làng, ở dải khuôn mặt và khung nói chuyện.
  SC.cuaNguoiLang = (k) => SC.get('nl-' + k);
  // Vẽ người làng tự vẽ, chân tại (x, y). o: { anim: 'idle' | 'noi', t (giây), face, s (số lần phóng) }
  SC.veNguoiLang = function (c, sp, x, y, o) {
    o = o || {};
    const ten = o.anim === 'noi' && sp.dt.noi ? 'noi' : 'idle', a = sp.dt[ten], s = o.s || 1;
    c.save(); c.translate(Math.round(x), Math.round(y)); if (s !== 1) c.scale(s, s);
    SC.veKhung(c, sp, ten, khungLap(a, Math.max(0, o.t || 0)), o.face < 0 ? -1 : 1, {});
    c.restore();
  };
  // Vùng khuôn mặt (phần đầu) của khung đứng thở đầu tiên: [x, y, rộng, cao] theo điểm ảnh THẬT của tấm sprite (gấp net lần).
  function vungMat(sp) {
    if (sp.mat) return sp.mat;
    const N = sp.net || 1, fw = sp.fw * N, fh = sp.fh * N;
    const a = sp.dt.idle, cv = document.createElement('canvas'); cv.width = fw; cv.height = fh;
    const x = cv.getContext('2d'); x.drawImage(sp.img, 0, a.hang * fh, fw, fh, 0, 0, fw, fh);
    const d = x.getImageData(0, 0, fw, fh).data;
    let y0 = -1, y1 = -1; for (let y = 0; y < fh && y0 < 0; y++) for (let i = 0; i < fw; i++) if (d[(y * fw + i) * 4 + 3] > 127) { y0 = y; break; }
    for (let y = fh - 1; y >= 0 && y1 < 0; y--) for (let i = 0; i < fw; i++) if (d[(y * fw + i) * 4 + 3] > 127) { y1 = y; break; }
    if (y0 < 0) return (sp.mat = [0, a.hang * fh, fw, fh]);
    const hh = Math.max(6 * N, Math.round((y1 - y0 + 1) * 0.42)), ww = Math.round(hh * 1.15);
    let n = 0, sx = 0; for (let y = y0; y < y0 + hh; y++) for (let i = 0; i < fw; i++) if (d[(y * fw + i) * 4 + 3] > 127) { n++; sx += i; }
    const cx = n ? sx / n : sp.ax * N;
    return (sp.mat = [Math.round(cx - ww / 2), a.hang * fh + y0, ww, hh]);
  }
  SC.vungMat = vungMat;
  let lanNL = 0;
  function noiNguoiLang() {
    const VS = G.villageScene;
    if (!VS || !VS.NPCS) { if (lanNL++ < 50 && typeof setTimeout !== 'undefined') setTimeout(noiNguoiLang, 50); return; }
    if (VS._spriteCustom) return;
    VS._spriteCustom = true;
    VS.tuVe = function (c, kind, x, y, s, o) {
      const sp = SC.cuaNguoiLang(kind); if (!sp) return false;
      const look = (o && o.look) || 0;
      SC.veNguoiLang(c, sp, x, y, { anim: look ? 'noi' : 'idle', t: o && o.t != null ? o.t : G.time || 0, face: look < 0 ? -1 : 1, s: s || 1 });
      return true;
    };
    VS.tuVeMat = function (ctx, k, cx, cy, s) {
      const sp = SC.cuaNguoiLang(k); if (!sp) return false;
      const m = vungMat(sp), k2 = Math.min((23 * s) / m[2], (20 * s) / m[3]), w = m[2] * k2, h = m[3] * k2, sm = ctx.imageSmoothingEnabled;
      ctx.imageSmoothingEnabled = false; ctx.drawImage(sp.img, m[0], m[1], m[2], m[3], cx - w / 2, cy - h / 2, w, h); ctx.imageSmoothingEnabled = sm;
      return true;
    };
  }

  // ======================= ĐỒ: VŨ KHÍ, TRANG PHỤC, VẬT PHẨM =======================
  // Mã tệp:  vk-<loại>-<dòng>[-<hệ>[-<giai đoạn>]]  ví dụ vk-sword-3, vk-bow-0-fire-2   (loại: sword, bow, spear, hammer; dòng 0..9)
  //          tp-<ô>-<hình>                          ví dụ tp-hats-non_la, tp-wings-lua      (ô: hats, robes, backs, hands, masks, wings)
  //          vp-<loại>                              ví dụ vp-gold, vp-potion, vp-linhkhi-fire, vp-ore, vp-mat0, vp-shard2
  // Ảnh đồ là một hình đứng yên (đã có viền); game xoay, đặt nó theo tay, đầu, thân em bé.
  const DO_LOAI = { 'vu-khi': 1, 'trang-phuc': 1, 'vat-pham': 1 };
  const D2R = Math.PI / 180, INK = '#1b1118';
  const RAR_VIEN = [null, '#1f4fa8', '#5a2499', '#a86a08']; // viền đồ theo bậc Lam, Tím, Vàng
  SC.do = {};
  const hex2 = (r, g, b) => '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  function docDiem(src) { // ảnh -> mảng màu '#rrggbb' (null là trống)
    const w = src.width, h = src.height, cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const x = cv.getContext('2d'); x.drawImage(src, 0, 0);
    const d = x.getImageData(0, 0, w, h).data, px = new Array(w * h).fill(null);
    for (let i = 0; i < w * h; i++) if (d[i * 4 + 3] > 127) px[i] = hex2(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]);
    return px;
  }
  const P2 = (a) => (Array.isArray(a) && a.length === 2 && isFinite(a[0]) && isFinite(a[1]) ? [+a[0], +a[1]] : null);
  function themDo(tep) {
    // rong, cao: cỡ theo điểm ảnh GAME; pw, ph: cỡ ảnh thật (gấp net lần); px: màu từng điểm ảnh THẬT (pw x ph).
    const doi = tep.doi_tuong, sp = { ma: tep.ma, ten: String(tep.ten || tep.ma), doi, net: docNet(tep.net), rong: 0, cao: 0, pw: 0, ph: 0, img: null, px: null, ready: false, xoay: new Map(), mau: {} };
    if (doi === 'vu-khi') {
      const v = tep.vu_khi || {};
      if (!/^(sword|bow|spear|hammer)$/.test(v.loai)) throw new Error('loại vũ khí sai');
      sp.vk = { loai: v.loai, dong: Math.max(0, Math.min(9, v.dong | 0)), he: /^(fire|poison|ice)$/.test(v.he) ? v.he : null, gd: v.gd ? Math.max(1, Math.min(3, v.gd | 0)) : null,
        cam: P2(v.cam) || [0, 0], mui: P2(v.mui) || [0, -1], day: Array.isArray(v.day) && P2(v.day[0]) && P2(v.day[1]) ? [P2(v.day[0]), P2(v.day[1])] : null };
    } else if (doi === 'trang-phuc') {
      const t = tep.trang_phuc || {};
      if (!/^(hats|robes|backs|hands|masks|wings)$/.test(t.o) || typeof t.look !== 'string') throw new Error('ô trang phục sai');
      sp.tp = { o: t.o, look: t.look, lech: P2(t.lech) || [0, 0], lop: t.lop === 'truoc' ? 'truoc' : 'sau', kieu: t.kieu === 'cam' ? 'cam' : 'bua', tayAo: t.tay_ao !== false };
    } else {
      if (typeof tep.vat_pham !== 'string' || !/^[a-z0-9-]{2,20}$/.test(tep.vat_pham)) throw new Error('loại vật phẩm sai');
      sp.vp = tep.vat_pham;
    }
    const xong = (src) => {
      sp.img = src; sp.pw = src.width; sp.ph = src.height; sp.rong = Math.max(1, Math.round(src.width / sp.net)); sp.cao = Math.max(1, Math.round(src.height / sp.net));
      sp.px = docDiem(src); sp.ready = true; sp.xoay.clear(); sp.mau = {};
      if (SC.do[sp.ma] !== sp) return;
      if (sp.vk) noiVuKhi(); else if (sp.tp) noiTrangPhuc(sp); else noiVatPham();
      xoaNhoDo();
    };
    if (boDo.cu && SC.do[sp.ma]) boDo(sp.ma);
    SC.do[sp.ma] = sp;
    if (tep.anhCanvas && tep.anhCanvas.getContext) xong(tep.anhCanvas); // công cụ đưa thẳng canvas (vẽ ngay, không chờ)
    else {
      if (typeof tep.anh !== 'string' || tep.anh.indexOf('data:image/png;base64,') !== 0) throw new Error('thiếu ảnh');
      if (typeof Image !== 'undefined') { const img = new Image(); img.onload = () => xong(img); img.onerror = () => SC.loi.push(sp.ma + ': ảnh hỏng'); img.src = tep.anh; }
    }
    return sp;
  }
  function xoaNhoDo() {
    try { if (G.tinhLinh && G.tinhLinh.clearCache) G.tinhLinh.clearCache(); } catch (e) { /* bỏ qua */ }
    try { if (G.doRoi && G.doRoi.xoaNho) G.doRoi.xoaNho(); } catch (e) { /* bỏ qua */ }
  }
  function boDo(ma) {
    const sp = SC.do[ma]; if (!sp) return;
    delete SC.do[ma];
    if (sp.tp) { const L = G.heroLooks, o = L && L[sp.tp.o]; if (o && sp.tp.cu !== undefined) { if (sp.tp.cu) o[sp.tp.look] = sp.tp.cu; else delete o[sp.tp.look]; } }
    xoaNhoDo();
  }
  boDo.cu = true;
  const doSan = (ma) => { const s = SC.do[ma]; return s && s.ready ? s : null; };

  // ---------- VŨ KHÍ ----------
  SC.timVuKhi = function (o) {
    if (!o) return null;
    const b = 'vk-' + o.type + '-' + (o.family | 0), st = o.stage | 0;
    return (o.branch && st && doSan(b + '-' + o.branch + '-' + st)) || (o.branch && st && doSan(b + '-' + o.branch)) || doSan(b);
  };
  // Hình vũ khí xoay góc a (độ, 0 chĩa về trước, -90 chĩa lên): điểm cầm ở gốc. Nhớ theo góc (bước 5 độ) và bậc.
  // Trả về { cv, dx, dy, w, h, c, s }: dx, dy, w, h theo điểm ảnh GAME; cv có số điểm ảnh gấp net lần (vẽ bằng drawImage có cỡ đích).
  function xoayVk(sp, a, rar) {
    a = Math.round(a / 5) * 5;
    const k = a + '|' + rar; let r = sp.xoay.get(k); if (r) return r;
    const V = sp.vk, N = sp.net || 1, w = sp.rong, h = sp.cao, pw = sp.pw || w, ph = sp.ph || h, th = Math.atan2(V.mui[1] - V.cam[1], V.mui[0] - V.cam[0]), q = a * D2R - th, c = Math.cos(q), s = Math.sin(q);
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const p of [[0, 0], [w, 0], [0, h], [w, h]]) { const u = p[0] - V.cam[0], v = p[1] - V.cam[1], X = u * c - v * s, Y = u * s + v * c; x0 = Math.min(x0, X); y0 = Math.min(y0, Y); x1 = Math.max(x1, X); y1 = Math.max(y1, Y); }
    x0 = Math.floor(x0) - 1; y0 = Math.floor(y0) - 1; x1 = Math.ceil(x1) + 1; y1 = Math.ceil(y1) + 1;
    const W = x1 - x0, H = y1 - y0, CW = Math.max(1, W * N), CH = Math.max(1, H * N), cv = document.createElement('canvas'); cv.width = CW; cv.height = CH;
    const g = cv.getContext('2d'), vien = RAR_VIEN[rar] || null, id = g.createImageData(CW, CH), d = id.data;
    for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) {
      // tâm điểm ảnh thật (x, y) theo toạ độ game -> điểm trên ảnh gốc (toạ độ game) -> điểm ảnh thật của ảnh gốc
      const X = x0 + (x + 0.5) / N, Y = y0 + (y + 0.5) / N, u = X * c + Y * s + V.cam[0], v = -X * s + Y * c + V.cam[1], i = Math.floor(u * N), j = Math.floor(v * N);
      if (i < 0 || j < 0 || i >= pw || j >= ph) continue;
      let col = sp.px[j * pw + i]; if (!col) continue;
      if (vien && col === INK) col = vien;
      const n = parseInt(col.slice(1), 16), o = (y * CW + x) * 4;
      d[o] = (n >> 16) & 255; d[o + 1] = (n >> 8) & 255; d[o + 2] = n & 255; d[o + 3] = 255;
    }
    g.putImageData(id, 0, 0);
    r = { cv, dx: x0, dy: y0, w: W, h: H, c, s };
    if (sp.xoay.size > 400) sp.xoay.clear();
    sp.xoay.set(k, r);
    return r;
  }
  SC.xoayVk = xoayVk;
  function chamDay(c, x0, y0, x1, y1, col) { c.fillStyle = col; const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); for (let i = 0; i <= n; i++) c.fillRect(Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), 1, 1); }
  // Vẽ vũ khí tự vẽ (cùng cách gọi với G.weaponArt.draw).
  SC.veVuKhi = function (c, sp, opts, x0, y0, ang, pull) {
    const rar = Math.max(0, Math.min(3, (opts && opts.rarity) | 0)), R = xoayVk(sp, ang || 0, rar), X = Math.round(x0), Y = Math.round(y0);
    const sm = c.imageSmoothingEnabled; c.imageSmoothingEnabled = false;
    c.drawImage(R.cv, X + R.dx, Y + R.dy, R.w, R.h);
    c.imageSmoothingEnabled = sm;
    const V = sp.vk; if (!V.day) return;
    // dây cung: hai đầu dây (chấm trong công cụ) nối qua điểm kéo; giương cung thì có mũi tên
    const T = (p) => { const u = p[0] - V.cam[0], v = p[1] - V.cam[1]; return [X + u * R.c - v * R.s, Y + u * R.s + v * R.c]; };
    const A = T(V.day[0]), B = T(V.day[1]), a = Math.round((ang || 0) / 5) * 5 * D2R, fx = Math.cos(a), fy = Math.sin(a);
    const span = Math.hypot(B[0] - A[0], B[1] - A[1]), k = Math.max(0, Math.min(1, pull || 0)), M = [(A[0] + B[0]) / 2 - fx * k * span * 0.35, (A[1] + B[1]) / 2 - fy * k * span * 0.35];
    if (k <= 0.02) chamDay(c, A[0], A[1], B[0], B[1], '#e8e2d0');
    else {
      chamDay(c, A[0], A[1], M[0], M[1], '#e8e2d0'); chamDay(c, M[0], M[1], B[0], B[1], '#e8e2d0');
      const L = span * 0.55; chamDay(c, M[0], M[1], M[0] + fx * L, M[1] + fy * L, '#b78350');
      c.fillStyle = '#f4f8ff'; c.fillRect(Math.round(M[0] + fx * (L + 1)), Math.round(M[1] + fy * (L + 1)), 1, 1);
      c.fillStyle = '#d2362e'; c.fillRect(Math.round(M[0] + fx * 2 - fy), Math.round(M[1] + fy * 2 + fx), 1, 1);
    }
  };
  // Ô đồ: vũ khí nằm chéo (cung đứng), vừa trong ô sz, tâm (x, y).
  SC.iconVuKhi = function (c, sp, opts, x, y, sz) {
    const ang = sp.vk.loai === 'bow' ? 0 : -45, R = xoayVk(sp, ang, Math.max(0, Math.min(3, (opts && opts.rarity) | 0)));
    sz = sz || 24; const m = Math.max(R.w, R.h); let k = sz / m; if (k >= 1) k = Math.max(1, Math.floor(k));
    const sm = c.imageSmoothingEnabled; c.imageSmoothingEnabled = false;
    c.drawImage(R.cv, Math.round(x - (R.w * k) / 2), Math.round(y - (R.h * k) / 2), Math.round(R.w * k), Math.round(R.h * k));
    c.imageSmoothingEnabled = sm;
  };
  function noiVuKhi() {
    const WA = G.weaponArt;
    if (!WA || WA._spriteCustom) return;
    WA._spriteCustom = true;
    const draw0 = WA.draw, icon0 = WA.icon;
    WA.drawCode = draw0; WA.iconCode = icon0;
    WA.draw = function (c, opts, x0, y0, ang, pull) { const sp = SC.timVuKhi(opts); if (!sp) return draw0.apply(this, arguments); SC.veVuKhi(c, sp, opts, x0, y0, ang, pull); };
    WA.icon = function (c, opts, x, y, sz) { const sp = SC.timVuKhi(opts); if (!sp) return icon0.apply(this, arguments); SC.iconVuKhi(c, sp, opts, x, y, sz); };
  }

  // ---------- TRANG PHỤC ----------
  // Đặt ảnh vào hệ toạ độ F của em bé (F.ox, F.oy, góc xoay): điểm ảnh (i, j) nằm ở (lx + i, ly + j) trong hệ F.
  // Khung em bé là hình 1 điểm ảnh game: ảnh có net > 1 thì lấy điểm ảnh thật ở giữa mỗi ô net x net (thu về đúng cỡ game).
  function diemGame(sp, i, j) {
    const N = sp.net || 1;
    if (N === 1) return sp.px[j * sp.rong + i];
    const pw = sp.pw, x = Math.min(pw - 1, Math.floor((i + 0.5) * N)), y = Math.min(sp.ph - 1, Math.floor((j + 0.5) * N));
    return sp.px[y * pw + x];
  }
  function veVaoKhung(F, sp, lx, ly, doi) {
    const S = F.S, w = sp.rong, h = sp.cao;
    if (F.z) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const col = diemGame(sp, i, j); if (col) S.p(F.ox + lx + i, F.oy + ly + j, doi ? doi(col) : col); } return; }
    const cs = F.cs, sn = F.sn;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const p of [[lx, ly], [lx + w, ly], [lx, ly + h], [lx + w, ly + h]]) { const q = F.pt(p[0], p[1]); x0 = Math.min(x0, q[0]); y0 = Math.min(y0, q[1]); x1 = Math.max(x1, q[0]); y1 = Math.max(y1, q[1]); }
    for (let y = Math.floor(y0) - 1; y <= Math.ceil(y1) + 1; y++) for (let x = Math.floor(x0) - 1; x <= Math.ceil(x1) + 1; x++) {
      const dx = x - F.ox, dy = y - F.oy, u = dx * cs + dy * sn, v = -dx * sn + dy * cs, i = Math.round(u - lx), j = Math.round(v - ly);
      if (i < 0 || j < 0 || i >= w || j >= h) continue;
      const col = diemGame(sp, i, j); if (col) S.p(x, y, doi ? doi(col) : col);
    }
  }
  SC.veVaoKhung = veVaoKhung;
  const toiDi = (col) => { const v = parseInt(col.slice(1), 16); return hex2(Math.round(((v >> 16) & 255) * 0.72), Math.round(((v >> 8) & 255) * 0.72), Math.round((v & 255) * 0.78)); };
  // Màu tay áo: màu nhiều nhất của áo (bỏ viền), kèm bản tối và sáng.
  function mauTayAo(sp) {
    if (sp.mau.tay) return sp.mau.tay;
    const dem = {}; for (const c of sp.px) if (c && c !== INK && c !== '#14182e') dem[c] = (dem[c] || 0) + 1;
    let best = '#a89872', n = 0; for (const c in dem) if (dem[c] > n) { n = dem[c]; best = c; }
    const v = parseInt(best.slice(1), 16), r = (v >> 16) & 255, g = (v >> 8) & 255, b = v & 255, m = (k) => hex2(Math.min(255, Math.round(r * k)), Math.min(255, Math.round(g * k)), Math.min(255, Math.round(b * k)));
    return (sp.mau.tay = [m(0.65), best, hex2(Math.min(255, r + 50), Math.min(255, g + 50), Math.min(255, b + 50))]);
  }
  const PHANG = { ol: false, bevel: false };
  function dinhNghia(sp) {
    const t = sp.tp, L = t.lech, ve = (F, P, dx, dy, doi) => P(PHANG, () => veVaoKhung(F, sp, L[0] + (dx || 0), L[1] + (dy || 0), doi));
    const o = { id: t.look, name: sp.ten, tuVe: true };
    if (t.o === 'hats') { o.draw = (cx, P) => { if (t.lop !== 'truoc') ve(cx.H, P); }; if (t.lop === 'truoc') o.front = (cx, P) => ve(cx.H, P); }
    else if (t.o === 'robes') { o.draw = (cx, P) => ve(cx.B, P); if (t.tayAo) o.sleeve = () => mauTayAo(sp); }
    else if (t.o === 'backs') o.draw = (cx, P) => ve(cx.B, P);
    else if (t.o === 'hands') {
      if (t.kieu === 'cam') o.prop = (cx, P, hx, hy) => ve(cx.B, P, hx, hy);
      else o.belt = (cx, P) => ve(cx.B, P, Math.round((-(cx.tr || 0) + (cx.sw || 0)) * 0.7), 0);
    } else if (t.o === 'masks') o.draw = (H) => veVaoKhung(H, sp, L[0], L[1]);
    else if (t.o === 'wings') {
      o.levels = 3;
      o.draw = (cx, P) => {
        const lv = Math.max(1, Math.min(3, cx.lv | 0)), flap = [-14, 0, 18, 0][(cx.f | 0) % 4] * (lv === 1 ? 0.6 : 1) * (cx.ps && cx.ps.anim === 'dodge' ? 1.5 : 1);
        ve(cx.B.sub(-3, -11, flap * 0.7 + 16), P, 0, 0, toiDi); // cánh xa: tối hơn
        ve(cx.B.sub(-4, -10, flap), P);
      };
    }
    return o;
  }
  SC.MOC_TRANG_PHUC = { hats: 'H', masks: 'H', robes: 'B', backs: 'B', hands: 'B', wings: 'vai' };
  function noiTrangPhuc(sp) {
    const L = G.heroLooks, t = sp.tp; if (!L || !L[t.o]) return;
    const cu = L[t.o][t.look];
    if (t.cu === undefined) t.cu = cu && cu.tuVe ? cu.cuGoc || null : cu || null;
    const o = dinhNghia(sp); o.cuGoc = t.cu;
    L[t.o][t.look] = o;
  }

  // ---------- VẬT PHẨM ----------
  SC.vatPham = (kind) => (kind ? doSan('vp-' + kind) : null);
  // Vẽ vật phẩm vừa trong ô vuông size, tâm (cx, cy).
  SC.veVatPham = function (c, sp, cx, cy, size) {
    const w = sp.rong, h = sp.cao; let k = size / Math.max(w, h); if (k >= 1) k = Math.floor(k);
    const sm = c.imageSmoothingEnabled; c.imageSmoothingEnabled = false;
    c.drawImage(sp.img, Math.round(cx - (w * k) / 2), Math.round(cy - (h * k) / 2), Math.round(w * k), Math.round(h * k));
    c.imageSmoothingEnabled = sm;
  };
  let lanNoi = 0;
  function noiVatPham() {
    const T = G.theme;
    if (!T || !T.resIcon) { if (lanNoi++ < 50 && typeof setTimeout !== 'undefined') setTimeout(noiVatPham, 50); return; }
    if (T._spriteCustom) return;
    T._spriteCustom = true;
    const res0 = T.resIcon;
    T.resIconCode = res0;
    T.resIcon = function (kind, x, y, h) {
      const sp = SC.vatPham(kind); if (!sp) return res0.apply(this, arguments);
      h = h || 7; SC.veVatPham(G.ux, sp, x + h / 2, y + h / 2, h);
    };
  }

  // Hàm vẽ bằng code (bỏ qua hình tự vẽ), cho công cụ so sánh.
  if (G.monsterArt && !G.monsterArt.drawCode) G.monsterArt.drawCode = G.monsterArt.draw;
  if (G.art && G.art.hero && !G.art.heroCode) G.art.heroCode = G.art.hero;
  SC.noi = true;
  // Tệp do game/build.py nhúng vào bản đóng gói.
  if (Array.isArray(G.customSpriteData)) { for (const t of G.customSpriteData) SC.add(t); delete G.customSpriteData; }
})();
