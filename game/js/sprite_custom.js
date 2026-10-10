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
      if (tep.doi_tuong === 'ghep') return themGhep(tep); // hồ sơ ghép trang bị của một nhân vật (ghep-<key>), không có ảnh
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
  SC.remove = function (ma) { if (SC.do[ma]) boDo(ma); delete SC.ds[ma]; for (const k in SC.ghep) if (SC.ghep[k].ma === ma) boGhep(k); };
  SC.clear = function () { for (const k of Object.keys(SC.ds)) delete SC.ds[k]; for (const k of Object.keys(SC.do)) boDo(k); for (const k of Object.keys(SC.ghep)) boGhep(k); };
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
  // ---------- ĐỒ BÁM THÂN AI ----------
  // Đo xem thân AI ở khung (ten, i) dời / xoay bao nhiêu so với khung đứng thở đầu tiên (khung dùng để đặt neo), để đồ khoác lên
  // đi theo đúng thân AI (không theo khung xương code). Đo trên hình bóng (điểm ảnh có màu) ở cỡ điểm ảnh game, một lần mỗi khung.
  //  - Động tác đứng (đứng thở, chạy, lấy đà, đánh, trúng đòn): dò chỗ khớp nhất của vùng đầu và vùng thân (dời tối đa 8 điểm ảnh)
  //    -> { dau: [dx, dy], than: [dx, dy] }.
  //  - Lộn (ne) và chết (die): thân xoay cả người -> dò góc xoay (mỗi 15 độ) và chỗ đặt khớp nhất -> { rot, x, y }: đồ ghép lên thân
  //    rồi xoay, dời cả khối như thân. Lộn ưu tiên góc lăn tới đều (360 độ chia đều các khung).
  function matNa(sp) { // hình bóng từng khung theo điểm ảnh game: sp.mn[hang][i] = Uint8Array(fw*fh)
    if (sp.mn) return sp.mn;
    const N = sp.net || 1, W = sp.img.width, H = sp.img.height, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const x = cv.getContext('2d', { willReadFrequently: true }); x.drawImage(sp.img, 0, 0);
    const d = x.getImageData(0, 0, W, H).data, fw = sp.fw, fh = sp.fh, h = Math.floor(N / 2);
    sp.mn = (ten, i) => {
      const a = sp.dt[ten] || sp.dt.idle, k = a.hang + ':' + i;
      sp.mn.c = sp.mn.c || {};
      let m = sp.mn.c[k]; if (m) return m;
      m = new Uint8Array(fw * fh);
      for (let y = 0; y < fh; y++) for (let q = 0; q < fw; q++) {
        const X = (i * fw + q) * N + h, Y = (a.hang * fh + y) * N + h;
        if (X < W && Y < H && d[(Y * W + X) * 4 + 3] > 127) m[y * fw + q] = 1;
      }
      return (sp.mn.c[k] = m);
    };
    return sp.mn;
  }
  function tamMat(m, fw, fh) { let n = 0, sx = 0, sy = 0, y0 = -1; for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) if (m[y * fw + x]) { n++; sx += x; sy += y; if (y0 < 0) y0 = y; } return n ? { n, x: sx / n, y: sy / n, y0 } : null; }
  // Dò dời (dx, dy) để vùng hàng [r0, r1) của khung gốc A khớp nhất với khung B (đếm điểm giống nhau, kể cả chỗ trống).
  function doDoi(A, B, fw, fh, r0, r1) {
    let best = -1, bx = 0, by = 0;
    r0 = Math.max(0, Math.floor(r0)); r1 = Math.min(fh, Math.ceil(r1));
    for (let dy = -8; dy <= 8; dy++) for (let dx = -8; dx <= 8; dx++) {
      let s = 0;
      for (let y = r0; y < r1; y++) {
        const yy = y + dy, inY = yy >= 0 && yy < fh;
        for (let x = 0; x < fw; x++) { const xx = x + dx, b = inY && xx >= 0 && xx < fw ? B[yy * fw + xx] : 0; if (A[y * fw + x] === b) s++; }
      }
      s -= (Math.abs(dx) + Math.abs(dy)) * 0.01; // hoà thì chọn dời ít
      if (s > best) { best = s; bx = dx; by = dy; }
    }
    return [bx, by];
  }
  SC.khopEmBe = function (sp, ten, i) {
    if (!sp || !sp.img || !sp.dt[ten]) return null;
    sp.khop = sp.khop || {};
    const k = ten + ':' + i;
    if (k in sp.khop) return sp.khop[k];
    let r = null;
    try {
      const mn = matNa(sp), fw = sp.fw, fh = sp.fh, A = mn('idle', 0), B = mn(ten, i), a = tamMat(A, fw, fh), b = tamMat(B, fw, fh), lat = sp.lat ? -1 : 1;
      if (a && b) {
        if (ten === 'ne' || ten === 'die') {
          const pts = []; for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) if (A[y * fw + x]) pts.push(x - a.x, y - a.y);
          const n = sp.dt[ten].so, goi = ten === 'ne' ? (360 * i) / n : 0;
          let best = -1e9, bt = 0, bdx = 0, bdy = 0;
          for (let t = ten === 'ne' ? 0 : -120; t <= (ten === 'ne' ? 345 : 120); t += 15) {
            const c = Math.cos((t * Math.PI) / 180), s = Math.sin((t * Math.PI) / 180), q = new Int16Array(pts.length);
            for (let j = 0; j < pts.length; j += 2) { q[j] = Math.round(pts[j] * c - pts[j + 1] * s + b.x); q[j + 1] = Math.round(pts[j] * s + pts[j + 1] * c + b.y); }
            for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
              let hit = 0;
              for (let j = 0; j < q.length; j += 2) { const X = q[j] + dx, Y = q[j + 1] + dy; if (X >= 0 && Y >= 0 && X < fw && Y < fh && B[Y * fw + X]) hit++; }
              const lech = Math.abs((((t - goi) % 360) + 540) % 360 - 180);
              const sc = hit / (a.n + b.n - hit) - (ten === 'ne' ? 0.0015 * lech : 0.0004 * Math.abs(t)) - (Math.abs(dx) + Math.abs(dy)) * 0.002;
              if (sc > best) { best = sc; bt = t; bdx = dx; bdy = dy; }
            }
          }
          // thân gốc: điểm p (toạ độ chân) -> R(p - c0) + c1  =>  đồ dựng ở tư thế đứng, xoay rot quanh chân rồi dời (x, y) = c1 - R c0
          const c0 = [a.x + 0.5 - sp.ax, a.y + 0.5 - sp.ay], c1 = [b.x + bdx + 0.5 - sp.ax, b.y + bdy + 0.5 - sp.ay], c = Math.cos((bt * Math.PI) / 180), s = Math.sin((bt * Math.PI) / 180);
          const X = c1[0] - (c0[0] * c - c0[1] * s), Y = c1[1] - (c0[0] * s + c0[1] * c);
          r = { rot: bt * lat, x: Math.round(X * lat), y: Math.round(Y) };
        } else if (!(ten === 'idle' && i === 0)) {
          const h = sp.ay - a.y0 + 1;
          const dau = doDoi(A, B, fw, fh, a.y0 - 2, a.y0 + 0.44 * h), than = doDoi(A, B, fw, fh, a.y0 + 0.5 * h, a.y0 + 0.85 * h);
          r = { dau: [dau[0] * lat, dau[1]], than: [than[0] * lat, than[1]] };
        }
      }
    } catch (e) { r = null; }
    return (sp.khop[k] = r);
  };
  function noiEmBe() {
    const A = G.art;
    if (!A || !A.hero || A._spriteCustom || !SC.noi) return;
    A._spriteCustom = true;
    const hero0 = A.hero;
    A.hero = function (c, o) {
      const sp = SC.cuaEmBe(o && o.key);
      if (!sp || !G.tinhLinh) return hero0.call(A, c, o);
      let fr = null; // cùng độ nét ghép với em bé gốc (hero0 tính y như vậy) để nhận ra đúng chỗ vẽ thân
      try { fr = G.tinhLinh.frame(o, G.tinhLinh.netCua ? G.tinhLinh.netCua(c, o) : 1); } catch (e) { fr = null; }
      if (!fr) return hero0.call(A, c, o);
      const s = SC.chonEmBe(sp, o), tint = emBeTint(o);
      let lop = null; // đồ đang mặc khoác lên thân AI: lớp sau thân và lớp trước thân, bám theo chính thân AI khung này
      const neo = SC.neoCua(sp, s.ten);
      if (sp.khoacDo && G.tinhLinh.lopDo) {
        try { const kh = SC.khopEmBe(sp, s.ten, s.i); lop = G.tinhLinh.lopDo(fr, neoGhep(fr.key, s, neo, kh), kh); } catch (e) { lop = null; }
      }
      // Vũ khí và nắm tay dời theo "neo.tay" cho khớp bàn tay của thân AI.
      if (neo && neo.tay && (neo.tay[0] || neo.tay[1])) o = Object.assign({}, o, { neoTay: neo.tay });
      // Em bé gốc vẫn vẽ bóng, vũ khí, hào quang trang phục; chỗ vẽ thân thì vẽ hình tự vẽ.
      const gia = butGia(c, function (img, x, y) {
        const than = img === fr.cv || (arguments.length === 3 && x === fr.ox && y === fr.oy && img && img.width === fr.cv.width && img.height === fr.cv.height);
        if (than) {
          if (lop && !lop.sau.trong) c.drawImage(lop.sau.cv, lop.sau.ox, lop.sau.oy, lop.sau.w, lop.sau.h);
          SC.veKhung(c, sp, s.ten, s.i, 1, { tint });
          if (lop && !lop.truoc.trong) c.drawImage(lop.truoc.cv, lop.truoc.ox, lop.truoc.oy, lop.truoc.w, lop.truoc.h);
          return;
        }
        if (fr.sil) for (const col in fr.sil) if (fr.sil[col] === img) { // ánh viền màu bậc quanh em bé
          c.save(); c.translate(x - fr.ox, y - fr.oy); c.globalCompositeOperation = 'source-over';
          const a = sp.dt[s.ten] || sp.dt.idle, n = sp.net || 1;
          c.drawImage(nhuom(sp, col), s.i * sp.fw * n, a.hang * sp.fh * n, sp.fw * n, sp.fh * n, -sp.ax, -sp.ay, sp.fw, sp.fh);
          if (lop) for (const l of [lop.sau, lop.truoc]) if (!l.trong) c.drawImage(bongMau(l, col), l.ox, l.oy, l.w, l.h);
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
        bienThe: /^vk-[a-z]+-\d+-(fire|poison|ice)(-\d)?$/.test(tep.ma), cam: P2(v.cam) || [0, 0], mui: P2(v.mui) || [0, -1], day: Array.isArray(v.day) && P2(v.day[0]) && P2(v.day[1]) ? [P2(v.day[0]), P2(v.day[1])] : null };
    } else if (doi === 'trang-phuc') {
      const t = tep.trang_phuc || {};
      if (!/^(hats|robes|backs|hands|masks|wings)$/.test(t.o) || typeof t.look !== 'string') throw new Error('ô trang phục sai');
      sp.tp = { o: t.o, look: t.look, lech: P2(t.lech) || [0, 0], lop: t.lop === 'truoc' ? 'truoc' : 'sau', kieu: t.kieu === 'cam' ? 'cam' : 'bua', tayAo: t.tay_ao !== false };
      // Ghép (tuỳ chọn): điểm neo trên ảnh món đồ (cùng tên điểm thân) và cỡ đã đo khi xuất. Không có thì như cũ.
      sp.tp.diem = docBoDiem(t.diem, 400); sp.tp.coChuan = P2(t.co_chuan);
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
  // ----- BIẾN ĐỔI THEO HỆ (Lửa, Độc, Băng) cho vũ khí ảnh AI -----
  // Bản vẽ code đổi hình theo nhánh và giai đoạn (js/weapon_art.js). Ảnh AI chỉ có một hình, nên game tự biến đổi:
  //  - Giai đoạn 1 (Mầm): giữ màu gốc, thêm hạt hiệu ứng nhẹ dọc thân (Lửa: tàn lửa bay lên; Độc: giọt nọc rơi, bọt; Băng: lấp lánh, hơi sương).
  //  - Giai đoạn 2 (Thành hình): nhuộm lưỡi/thân theo bảng màu hệ (giữ sáng tối ảnh gốc, pha 45%, cán gần tay cầm không nhuộm), viền ngoài đổi màu hệ.
  //  - Giai đoạn 3 (Thức tỉnh): nhuộm 70%, quầng sáng hệ, hạt dày; Lửa có ngọn lửa liếm dọc lưỡi.
  // Có ảnh biến thể riêng (vk-<loại>-<dòng>-<nhánh>[-<gđ>]) thì không nhuộm, chỉ thêm hạt và quầng sáng.
  const ELP_DU = { // bản dự phòng khi chưa có G.weaponArt.ELP (cùng màu weapon_art.js)
    fire: { B: ['#8a1c12', '#e8492a', '#ffb347'], ol: '#4a1010', glow: '#ffc64c', hot: '#fff0b0', fx: ['#ffb347', '#ffd27a', '#ff8a3a'] },
    poison: { B: ['#1d5a2a', '#49a83c', '#b5ea6a'], B2: ['#3d1d55', '#6b3a8f', '#a56fd0'], ol: '#12331a', glow: '#b5ea6a', hot: '#e6f58a', fx: ['#b5ea6a', '#a56fd0', '#8fd070'] },
    ice: { B: ['#2f62ad', '#7fc4f2', '#eafcff'], ol: '#1c3a70', glow: '#bfe9ff', hot: '#ffffff', fx: ['#ffffff', '#bfe9ff', '#9fd0f5'] },
  };
  const elp = (el) => (G.weaponArt && G.weaponArt.ELP && G.weaponArt.ELP[el]) || ELP_DU[el];
  const HE_T0 = { sword: 0.2, spear: 0.55, hammer: 0.45, bow: 0.16 }; // từ đâu (tỉ lệ dọc thân tính từ tay cầm) thì bắt đầu nhuộm
  const HE_PHA = [0, 0, 0.45, 0.7], HE_K = [1, 1, 1.05, 1.1];
  const rgb = (col) => { const n = parseInt(col.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  // Hệ đang hiện của món (null: bản thường). nhuom: có nhuộm ảnh không (ảnh thường, giai đoạn >= 2).
  function heCua(sp, o) {
    const el = o && /^(fire|poison|ice)$/.test(o.branch) ? o.branch : null, st = el ? clamp(o.stage | 0, 0, 3) : 0;
    if (!el || !st) return null;
    return { el, st, nhuom: !sp.vk.bienThe && st >= 2 };
  }
  SC.heCua = heCua;
  // Đo thân vũ khí một lần: độ nhuộm từng điểm ảnh thật (0 ở cán, 1 ở lưỡi), điểm viền ngoài, các điểm dọc lưỡi để rải hạt.
  function hinhVk(sp) {
    if (sp.hh) return sp.hh;
    const V = sp.vk, N = sp.net || 1, pw = sp.pw, ph = sp.ph, px = sp.px, bow = V.loai === 'bow';
    const th = Math.atan2(V.mui[1] - V.cam[1], V.mui[0] - V.cam[0]), ct = Math.cos(th), st = Math.sin(th);
    const T = new Float32Array(pw * ph);
    let mx = 1e-6;
    for (let j = 0; j < ph; j++) for (let i = 0; i < pw; i++) {
      if (!px[j * pw + i]) continue;
      const u = (i + 0.5) / N - V.cam[0], v = (j + 0.5) / N - V.cam[1], a = bow ? Math.abs(-u * st + v * ct) : u * ct + v * st;
      T[j * pw + i] = a; if (a > mx) mx = a;
    }
    const t0 = HE_T0[V.loai] || 0.2, w = new Float32Array(pw * ph), bien = new Uint8Array(pw * ph), ngan = [];
    const rong = (i, j) => i < 0 || j < 0 || i >= pw || j >= ph || !px[j * pw + i];
    const NB = 18, xo = new Array(NB).fill(null);
    for (let j = 0; j < ph; j++) for (let i = 0; i < pw; i++) {
      const k = j * pw + i; if (!px[k]) continue;
      const a = T[k] / mx, q = clamp((a - t0) / 0.15, 0, 1);
      w[k] = q * q * (3 - 2 * q);
      if (rong(i - 1, j) || rong(i + 1, j) || rong(i, j - 1) || rong(i, j + 1)) {
        bien[k] = 1;
        if (w[k] > 0.5) { // điểm viền trên lưỡi: chia theo dọc thân, mỗi khúc giữ một điểm (xen kẽ hai mép)
          const b = Math.min(NB - 1, Math.floor(((a - t0) / (1 - t0 + 1e-6)) * NB)), sc = ((i * 7 + j * 13) % 17) / 17;
          if (b >= 0 && (!xo[b] || sc > xo[b][2])) xo[b] = [(i + 0.5) / N, (j + 0.5) / N, sc];
        }
      }
    }
    for (const p of xo) if (p) ngan.push([p[0], p[1]]);
    if (!ngan.length) ngan.push([V.mui[0], V.mui[1]]);
    return (sp.hh = { w, bien, pts: ngan });
  }
  // Màu từng điểm ảnh thật sau khi nhuộm theo hệ el, giai đoạn st (nhớ trên sp.mau).
  function pxHe(sp, el, st) {
    const key = 'he|' + el + st; if (sp.mau[key]) return sp.mau[key];
    const H = hinhVk(sp), E = elp(el), B = E.B.map(rgb), OL = rgb(E.ol), pha = HE_PHA[st], src = sp.px, out = new Array(src.length);
    for (let k = 0; k < src.length; k++) {
      const col = src[k]; if (!col) { out[k] = null; continue; }
      const a = pha * H.w[k]; if (a <= 0.01) { out[k] = col; continue; }
      const o = rgb(col), L = (0.3 * o[0] + 0.59 * o[1] + 0.11 * o[2]) / 255;
      let m;
      if (H.bien[k] && L < 0.3) m = OL; // viền ngoài: màu viền của hệ
      else {
        const l = clamp((L - 0.08) / 0.8, 0, 1), A = l < 0.5 ? B[0] : B[1], C = l < 0.5 ? B[1] : B[2], f = l < 0.5 ? l * 2 : (l - 0.5) * 2;
        m = [A[0] + (C[0] - A[0]) * f, A[1] + (C[1] - A[1]) * f, A[2] + (C[2] - A[2]) * f];
      }
      const b = H.bien[k] && L < 0.3 ? Math.min(1, H.w[k]) : a;
      out[k] = hex2(Math.round(o[0] + (m[0] - o[0]) * b), Math.round(o[1] + (m[1] - o[1]) * b), Math.round(o[2] + (m[2] - o[2]) * b));
    }
    return (sp.mau[key] = out);
  }
  // Hình vũ khí xoay góc a (độ, 0 chĩa về trước, -90 chĩa lên): điểm cầm ở gốc. Nhớ theo góc (bước 5 độ), bậc, hệ và giai đoạn.
  // Trả về { cv, dx, dy, w, h, c, s, k, glow }: dx, dy, w, h theo điểm ảnh GAME; cv có số điểm ảnh gấp net lần (vẽ bằng drawImage có cỡ đích).
  // k: hệ số phóng (giai đoạn cao to hơn chút, như bản code); glow: quầng sáng hệ (giai đoạn 3).
  function xoayVk(sp, a, rar, he) {
    a = Math.round(a / 5) * 5;
    const k = a + '|' + rar + (he ? '|' + he.el + he.st : ''); let r = sp.xoay.get(k); if (r) return r;
    const V = sp.vk, N = sp.net || 1, w = sp.rong, h = sp.cao, pw = sp.pw || w, ph = sp.ph || h, th = Math.atan2(V.mui[1] - V.cam[1], V.mui[0] - V.cam[0]), q = a * D2R - th, c = Math.cos(q), s = Math.sin(q);
    const nh = he && he.nhuom, K = nh ? HE_K[he.st] : 1, src = nh ? pxHe(sp, he.el, he.st) : sp.px;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const p of [[0, 0], [w, 0], [0, h], [w, h]]) { const u = p[0] - V.cam[0], v = p[1] - V.cam[1], X = (u * c - v * s) * K, Y = (u * s + v * c) * K; x0 = Math.min(x0, X); y0 = Math.min(y0, Y); x1 = Math.max(x1, X); y1 = Math.max(y1, Y); }
    x0 = Math.floor(x0) - 1; y0 = Math.floor(y0) - 1; x1 = Math.ceil(x1) + 1; y1 = Math.ceil(y1) + 1;
    const W = x1 - x0, H = y1 - y0, CW = Math.max(1, W * N), CH = Math.max(1, H * N), cv = document.createElement('canvas'); cv.width = CW; cv.height = CH;
    const g = cv.getContext('2d'), vien = RAR_VIEN[rar] || null, id = g.createImageData(CW, CH), d = id.data;
    for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) {
      // tâm điểm ảnh thật (x, y) theo toạ độ game -> điểm trên ảnh gốc (toạ độ game) -> điểm ảnh thật của ảnh gốc
      const X = (x0 + (x + 0.5) / N) / K, Y = (y0 + (y + 0.5) / N) / K, u = X * c + Y * s + V.cam[0], v = -X * s + Y * c + V.cam[1], i = Math.floor(u * N), j = Math.floor(v * N);
      if (i < 0 || j < 0 || i >= pw || j >= ph) continue;
      let col = src[j * pw + i]; if (!col) continue;
      if (vien && sp.px[j * pw + i] === INK) col = vien; // viền bậc Lam/Tím/Vàng luôn ở viền ngoài cùng
      const n = parseInt(col.slice(1), 16), o = (y * CW + x) * 4;
      d[o] = (n >> 16) & 255; d[o + 1] = (n >> 8) & 255; d[o + 2] = n & 255; d[o + 3] = 255;
    }
    g.putImageData(id, 0, 0);
    r = { cv, dx: x0, dy: y0, w: W, h: H, c, s, k: K, glow: null };
    if (he && he.st >= 3) { // quầng sáng: hình bóng tô màu hệ, loang 1-2 điểm ảnh quanh thân
      const P = 2, gv = document.createElement('canvas'); gv.width = CW + 2 * P * N; gv.height = CH + 2 * P * N;
      const bo = document.createElement('canvas'); bo.width = CW; bo.height = CH;
      const bx = bo.getContext('2d'); bx.drawImage(cv, 0, 0); bx.globalCompositeOperation = 'source-in'; bx.fillStyle = elp(he.el).glow; bx.fillRect(0, 0, CW, CH);
      const gx = gv.getContext('2d');
      for (const o of [[-2, 0, 0.35], [2, 0, 0.35], [0, -2, 0.35], [0, 2, 0.35], [-1, -1, 0.6], [1, -1, 0.6], [-1, 1, 0.6], [1, 1, 0.6]]) { gx.globalAlpha = o[2]; gx.drawImage(bo, (P + o[0]) * N, (P + o[1]) * N); }
      r.glow = { cv: gv, dx: x0 - P, dy: y0 - P, w: W + 2 * P, h: H + 2 * P };
    }
    if (sp.xoay.size > 400) sp.xoay.clear();
    sp.xoay.set(k, r);
    return r;
  }
  SC.xoayVk = xoayVk;
  // Hạt hiệu ứng của hệ, vẽ mỗi khung (không tạo canvas): toạ độ theo điểm ảnh game, 1 điểm ảnh mỗi hạt.
  const fr = (v) => v - Math.floor(v);
  function hatHe(c, sp, R, he, T, t) {
    const E = elp(he.el), pts = hinhVk(sp).pts, st = he.st, n = [0, 4, 7, 12][st], seed = (sp.vk.dong * 7 + sp.vk.loai.length * 3) * 0.37;
    const a0 = c.globalAlpha, dot = (x, y, col, al, ww, hh) => { c.globalAlpha = a0 * clamp(al, 0, 1); c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), ww || 1, hh || 1); };
    if (he.el === 'fire' && st >= 3) { // ngọn lửa liếm dọc lưỡi
      for (let j = 0; j < pts.length; j += 2) {
        const p = T(pts[j]), hgt = 2 + Math.round(3 * (0.5 + 0.5 * Math.sin(t * 11 + j * 1.7 + seed)));
        for (let y = 0; y <= hgt; y++) {
          const f = y / hgt, x = p[0] + Math.sin(t * 9 + j + y * 0.9) * f * 1.2, col = f < 0.34 ? E.B[1] : f < 0.7 ? E.glow : E.hot;
          dot(x - (y === 0 ? 1 : 0), p[1] - y, col, 0.9 - f * 0.35, y === 0 ? 3 : 1, 1);
        }
      }
    }
    for (let i = 0; i < n; i++) {
      const h = fr(Math.sin(i * 12.9898 + seed) * 43758.5453), p = T(pts[Math.floor(h * pts.length) % pts.length]);
      if (he.el === 'fire') { // tàn lửa bay lên, lập loè
        const ph = fr(t * (0.9 + h * 0.6) + h * 7);
        if (fr(t * 9 + i * 0.37) < 0.15) continue;
        dot(p[0] + Math.sin(ph * 6 + i) * 1.2, p[1] - ph * (5 + 3 * st), ph < 0.3 ? E.hot : ph < 0.6 ? E.fx[0] : E.fx[2], 1 - ph);
      } else if (he.el === 'poison') {
        const ph = fr(t * (0.6 + h * 0.5) + h * 5);
        if (i % 3 === 2) { // bọt: phồng lên rồi vỡ
          const x = p[0] + (h - 0.5) * 2, y = p[1] - ph * 3;
          if (ph < 0.8) dot(x, y, E.fx[1], 0.85);
          else { const k = 1; dot(x - k, y, E.fx[1], 0.6); dot(x + k, y, E.fx[1], 0.6); dot(x, y - k, E.fx[1], 0.6); dot(x, y + k, E.fx[1], 0.6); }
        } else dot(p[0], p[1] + ph * ph * (6 + 2 * st), ph < 0.15 ? E.hot : E.fx[0], 1 - ph * 0.7, 1, ph > 0.2 && ph < 0.7 ? 2 : 1); // giọt nọc rơi
      } else { // băng: lấp lánh hình chữ thập và hơi sương trôi
        const ph = fr(t * (0.5 + h * 0.4) + h * 9);
        if (i % 2 === 0) {
          if (ph < 0.3) { const k = ph < 0.15 ? 1 : 2; dot(p[0], p[1], '#ffffff', 1); for (const q of [[k, 0], [-k, 0], [0, k], [0, -k]]) dot(p[0] + q[0], p[1] + q[1], E.fx[1], 0.9 - ph * 2); }
        } else dot(p[0] + (h - 0.5) * 4 * ph, p[1] + ph * 4, E.fx[1], (1 - ph) * 0.55, 2, 1);
      }
    }
    c.globalAlpha = a0;
  }
  SC.hatHe = hatHe;
  function chamDay(c, x0, y0, x1, y1, col) { c.fillStyle = col; const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); for (let i = 0; i <= n; i++) c.fillRect(Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), 1, 1); }
  // Vẽ vũ khí tự vẽ (cùng cách gọi với G.weaponArt.draw).
  SC.veVuKhi = function (c, sp, opts, x0, y0, ang, pull) {
    const rar = Math.max(0, Math.min(3, (opts && opts.rarity) | 0)), he = heCua(sp, opts), R = xoayVk(sp, ang || 0, rar, he), X = Math.round(x0), Y = Math.round(y0);
    const t = (opts && opts.t != null ? +opts.t : G.time) || 0;
    const sm = c.imageSmoothingEnabled; c.imageSmoothingEnabled = false;
    if (R.glow) {
      const op = c.globalCompositeOperation, a0 = c.globalAlpha;
      c.globalCompositeOperation = 'lighter'; c.globalAlpha = a0 * (0.3 + 0.12 * Math.sin(t * 5));
      c.drawImage(R.glow.cv, X + R.glow.dx, Y + R.glow.dy, R.glow.w, R.glow.h);
      c.globalCompositeOperation = op; c.globalAlpha = a0;
    }
    c.drawImage(R.cv, X + R.dx, Y + R.dy, R.w, R.h);
    c.imageSmoothingEnabled = sm;
    const V = sp.vk, K = R.k || 1;
    const T = (p) => { const u = p[0] - V.cam[0], v = p[1] - V.cam[1]; return [X + (u * R.c - v * R.s) * K, Y + (u * R.s + v * R.c) * K]; };
    if (V.day) {
      // dây cung: hai đầu dây (chấm trong công cụ) nối qua điểm kéo; giương cung thì có mũi tên
      const A = T(V.day[0]), B = T(V.day[1]), a = Math.round((ang || 0) / 5) * 5 * D2R, fx = Math.cos(a), fy = Math.sin(a);
      const span = Math.hypot(B[0] - A[0], B[1] - A[1]), k = Math.max(0, Math.min(1, pull || 0)), M = [(A[0] + B[0]) / 2 - fx * k * span * 0.35, (A[1] + B[1]) / 2 - fy * k * span * 0.35];
      if (k <= 0.02) chamDay(c, A[0], A[1], B[0], B[1], '#e8e2d0');
      else {
        chamDay(c, A[0], A[1], M[0], M[1], '#e8e2d0'); chamDay(c, M[0], M[1], B[0], B[1], '#e8e2d0');
        const L = span * 0.55; chamDay(c, M[0], M[1], M[0] + fx * L, M[1] + fy * L, '#b78350');
        c.fillStyle = '#f4f8ff'; c.fillRect(Math.round(M[0] + fx * (L + 1)), Math.round(M[1] + fy * (L + 1)), 1, 1);
        c.fillStyle = '#d2362e'; c.fillRect(Math.round(M[0] + fx * 2 - fy), Math.round(M[1] + fy * 2 + fx), 1, 1);
      }
    }
    if (he) hatHe(c, sp, R, he, T, t);
  };
  // Ô đồ: vũ khí nằm chéo (cung đứng), vừa trong ô sz, tâm (x, y). Có hệ thì nhuộm theo hệ (không có hạt).
  SC.iconVuKhi = function (c, sp, opts, x, y, sz) {
    const he = heCua(sp, opts), ang = sp.vk.loai === 'bow' ? 0 : -45, R = xoayVk(sp, ang, Math.max(0, Math.min(3, (opts && opts.rarity) | 0)), he && he.nhuom ? he : null);
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
  // Khung em bé ghép theo điểm ảnh game: điểm nào có ảnh vẫn do điểm ảnh thật ở giữa ô net x net quyết định (hình bóng như bản thường).
  // Khung ghép nét cao (F.S.N >= 2) và ảnh có net >= 2: mỗi điểm còn mang N x N điểm con lấy đúng chỗ trên ảnh gốc (đủ chi tiết gốc).
  function diemGame(sp, i, j) {
    const N = sp.net || 1;
    if (N === 1) return sp.px[j * sp.rong + i];
    const pw = sp.pw, x = Math.min(pw - 1, Math.floor((i + 0.5) * N)), y = Math.min(sp.ph - 1, Math.floor((j + 0.5) * N));
    return sp.px[y * pw + x];
  }
  // Điểm ảnh thật của ảnh gốc tại toạ độ (u, v) theo điểm ảnh game của ảnh (null: trong suốt / ngoài ảnh).
  function diemThat(sp, u, v) {
    const N = sp.net || 1, x = Math.floor(u * N), y = Math.floor(v * N);
    return x < 0 || y < 0 || x >= sp.pw || y >= sp.ph ? null : sp.px[y * sp.pw + x];
  }
  // kx, ky (ghép, tuỳ chọn): co giãn ảnh quanh góc trên-trái (lx, ly). Không ghi (1) thì y hệt trước.
  function veVaoKhung(F, sp, lx, ly, doi, kx, ky) {
    kx = kx > 0 ? kx : 1; ky = ky > 0 ? ky : 1;
    const S = F.S, w = sp.rong, h = sp.cao, M = S.N > 1 && (sp.net || 1) > 1 ? S.N : 1, MM = M * M, k1 = kx === 1 && ky === 1;
    const con = (f) => { const o = new Array(MM); for (let k = 0; k < MM; k++) { const q = f(((k % M) + 0.5) / M, (((k / M) | 0) + 0.5) / M); o[k] = q && doi ? doi(q) : q; } return o; };
    if (F.z && k1) {
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
        const col = diemGame(sp, i, j); if (!col) continue;
        S.p(F.ox + lx + i, F.oy + ly + j, doi ? doi(col) : col, M > 1 ? con((a, b) => diemThat(sp, i + a, j + b)) : null);
      }
      return;
    }
    const cs = F.cs, sn = F.sn;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const p of [[lx, ly], [lx + w * kx, ly], [lx, ly + h * ky], [lx + w * kx, ly + h * ky]]) { const q = F.pt(p[0], p[1]); x0 = Math.min(x0, q[0]); y0 = Math.min(y0, q[1]); x1 = Math.max(x1, q[0]); y1 = Math.max(y1, q[1]); }
    for (let y = Math.floor(y0) - 1; y <= Math.ceil(y1) + 1; y++) for (let x = Math.floor(x0) - 1; x <= Math.ceil(x1) + 1; x++) {
      const dx = x - F.ox, dy = y - F.oy, u = dx * cs + dy * sn, v = -dx * sn + dy * cs;
      const i = k1 ? Math.round(u - lx) : Math.floor((u - lx + 0.5) / kx), j = k1 ? Math.round(v - ly) : Math.floor((v - ly + 0.5) / ky);
      if (i < 0 || j < 0 || i >= w || j >= h) continue;
      const col = diemGame(sp, i, j); if (!col) continue;
      // điểm con (a, b) của điểm (x, y): xoay ngược về ảnh; điểm (x, y) phủ ảnh từ u - lx - 0,5 tới u - lx + 0,5
      S.p(x, y, doi ? doi(col) : col, M > 1 ? con((a, b) => { const X = dx + a - 0.5, Y = dy + b - 0.5; return diemThat(sp, (X * cs + Y * sn - lx + 0.5) / kx, (-X * sn + Y * cs - ly + 0.5) / ky); }) : null);
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
  // Lớp vốn có của món đồ (để biết cap.lop có dời lớp hay không).
  const lopGoc = (t) => (t.o === 'hats' ? (t.lop === 'truoc' ? 'truoc' : 'than') : t.o === 'backs' || t.o === 'wings' ? 'sau' : t.o === 'masks' ? 'truoc' : t.o === 'hands' ? (t.kieu === 'cam' ? 'truoc' : 'than') : 'than');
  function dinhNghia(sp) {
    const t = sp.tp, L = t.lech, ve = (F, P, dx, dy, doi) => P(PHANG, () => veVaoKhung(F, sp, L[0] + (dx || 0), L[1] + (dy || 0), doi));
    const o = { id: t.look, name: sp.ten, tuVe: true, net: sp.net || 1, ma: sp.ma, lopGoc: lopGoc(t) }; // net: game ghép em bé nét cao khi mặc món này
    // GHÉP (docs/review/ghep-trang-bi/DINH-DANG-GHEP.md mục 4): món có "diem" hoặc nhân vật có "cap" cho món này thì đặt theo
    // tinhDatMon; còn lại đi ĐÚNG đường cũ (dòng "ve(...)" bên dưới) nên game y hệt trước. Trả về true nếu đã vẽ (hoặc ẩn).
    const moi = (cx, P, hx, hy) => {
      if (!cx || !cx.fit || !(t.diem || coCap(cx.key, sp.ma))) return false;
      const r = SC.tinhDatMon(cx, sp, { hx, hy });
      if (r.an) return true;
      const f = () => { for (const d of r.ds) veDat(cx, r.sp, d); };
      if (P) P(PHANG, f); else f();
      return true;
    };
    o.lopCap = (cx) => { const c = cx && cx.fit ? SC.capTheo(cx.key, sp.ma, cx.dong) : null; return (c && c.lop) || null; };
    if (t.o === 'hats') {
      const veMu = (cx, P) => { if (!moi(cx, P)) ve(cx.H, P); };
      o.draw = (cx, P) => { if (t.lop !== 'truoc') veMu(cx, P); }; if (t.lop === 'truoc') o.front = veMu;
      o.veLop = veMu;
    } else if (t.o === 'robes') { o.draw = (cx, P) => { if (!moi(cx, P)) ve(cx.B, P); }; o.veLop = o.draw; if (t.tayAo) o.sleeve = () => mauTayAo(sp); }
    else if (t.o === 'backs') { o.draw = (cx, P) => { if (!moi(cx, P)) ve(cx.B, P); }; o.veLop = o.draw; }
    else if (t.o === 'hands') {
      if (t.kieu === 'cam') {
        o.prop = (cx, P, hx, hy) => { if (!moi(cx, P, hx, hy)) ve(cx.B, P, hx, hy); };
        o.veLop = (cx, P) => { if (cx.ps && cx.ps.free) o.prop(cx, P, Math.round(cx.hf[0]), Math.round(cx.hf[1])); };
      } else { o.belt = (cx, P) => { if (!moi(cx, P)) ve(cx.B, P, Math.round((-(cx.tr || 0) + (cx.sw || 0)) * 0.7), 0); }; o.veLop = o.belt; }
    } else if (t.o === 'masks') {
      o.draw = (H, cx) => { if (!moi(cx, null)) veVaoKhung(H, sp, L[0], L[1]); };
      o.veLop = (cx, P) => P(PHANG, (s) => { const c0 = s.clip; s.clip = false; o.draw(cx.H, cx); s.clip = c0; });
    } else if (t.o === 'wings') {
      o.levels = 3;
      o.draw = (cx, P) => {
        if (moi(cx, P)) return;
        const lv = Math.max(1, Math.min(3, cx.lv | 0)), flap = [-14, 0, 18, 0][(cx.f | 0) % 4] * (lv === 1 ? 0.6 : 1) * (cx.ps && cx.ps.anim === 'dodge' ? 1.5 : 1);
        ve(cx.B.sub(-3, -11, flap * 0.7 + 16), P, 0, 0, toiDi); // cánh xa: tối hơn
        ve(cx.B.sub(-4, -10, flap), P);
      };
      o.veLop = o.draw;
    }
    return o;
  }
  // Vẽ một phần đã tính chỗ (d.cu: y hệt đường cũ; còn lại: gốc ảnh O, xoay a độ, co giãn sx, sy).
  function veDat(cx, sp, d) {
    if (d.cu) veVaoKhung(d.F, sp, d.lx, d.ly, d.doi);
    else veVaoKhung(cx.S.fr(d.O[0], d.O[1], d.a), sp, 0, 0, d.doi, d.sx, d.sy);
  }

  // ======================= GHÉP TRANG BỊ =======================
  // Định dạng: docs/review/ghep-trang-bi/DINH-DANG-GHEP.md. Hồ sơ hình thể nhân vật: tệp ghep-<key>.sprite.json
  //   { "doi_tuong": "ghep", "ma": "ghep-smith", "nhan_vat": "smith", "diem": {...}, "diem_theo": {...}, "cap": {...} }
  // Toạ độ trên nhân vật tính từ chân (x về trước mặt, y âm là lên), trên ảnh món đồ tính từ góc trên-trái; đơn vị điểm ảnh game,
  // đếm như vị trí điểm ảnh (điểm ảnh thứ i nằm ở i). Thân vẽ code tự tính điểm từ khung xương từng khung (js/hero_tinhlinh.js).
  const TEN_DIEM = ['dinh_dau', 'tam_dau', 'gay', 'mat', 'co', 'vai_sau', 'vai_truoc', 'nguc', 'eo', 'hong', 'khuyu_sau', 'khuyu_truoc', 'tay_sau', 'tay_truoc',
    'goi_sau', 'goi_truoc', 'chan_sau', 'chan_truoc', 'cam', 'lung', 'goc_canh'];
  const DIEM_DAU = { dinh_dau: 1, tam_dau: 1, gay: 1, mat: 1 }; // điểm thuộc đầu: thân AI dời theo phần đầu tự đo
  const LOP_CAP = { sau: 1, than: 1, truoc: 1, truoc_tay: 1 };
  SC.TEN_DIEM = TEN_DIEM;
  SC.ghep = {};
  SC.ghepVer = 0;
  function docBoDiem(d, lim) {
    if (!d || typeof d !== 'object') return null;
    const o = {}; let n = 0;
    for (const k of TEN_DIEM) { const p = P2(d[k]); if (p && Math.abs(p[0]) <= lim && Math.abs(p[1]) <= lim) { o[k] = p; n++; } }
    return n ? o : null;
  }
  SC.docBoDiem = docBoDiem;
  const soKep = (v, a, b) => (v == null || v === '' || !isFinite(+v) ? undefined : clamp(+v, a, b));
  // Một mục chỉnh (cap hoặc một mục trong cap.theo): chỉ giữ trường có ghi.
  function docChinh(c) {
    const o = {};
    if (!c || typeof c !== 'object') return o;
    const gan = (k, v) => { if (v !== undefined) o[k] = v; };
    gan('dx', soKep(c.dx, -60, 60)); gan('dy', soKep(c.dy, -60, 60)); gan('sx', soKep(c.sx, 0.8, 1.25)); gan('sy', soKep(c.sy, 0.8, 1.25)); gan('xoay', soKep(c.xoay, -180, 180));
    if (LOP_CAP[c.lop]) o.lop = c.lop;
    if (typeof c.an === 'boolean') o.an = c.an;
    return o;
  }
  function docCap(c) {
    if (!c || typeof c !== 'object') return null;
    const goc = Object.assign({ dx: 0, dy: 0, sx: 1, sy: 1, xoay: 0, an: false }, docChinh(c));
    goc.bien_the = typeof c.bien_the === 'string' && /^[A-Za-z0-9_-]{1,40}$/.test(c.bien_the) ? c.bien_the : null;
    goc.da_chinh = c.da_chinh === true;
    const theo = {};
    if (c.theo && typeof c.theo === 'object') for (const k in c.theo) if (/^[a-z]{2,8}(:\d{1,2})?$/.test(k)) theo[k] = docChinh(c.theo[k]);
    return { goc, theo };
  }
  function themGhep(tep) {
    const m = /^ghep-(smith|hunter|healer|wrestler)$/.exec(tep.ma), key = /^(smith|hunter|healer|wrestler)$/.test(tep.nhan_vat) ? tep.nhan_vat : m && m[1];
    if (!key) throw new Error('tệp ghép thiếu nhân vật (smith, hunter, healer, wrestler)');
    const g = { ma: tep.ma, key, diem: docBoDiem(tep.diem, 200) || {}, theo: {}, cap: {}, coVk: false };
    if (tep.diem_theo && typeof tep.diem_theo === 'object') for (const k in tep.diem_theo) if (/^[a-z]{2,8}(:\d{1,2})?$/.test(k)) { const d = docBoDiem(tep.diem_theo[k], 200); if (d) g.theo[k] = d; }
    if (tep.cap && typeof tep.cap === 'object') for (const k in tep.cap) if (/^[A-Za-z0-9_-]{1,40}$/.test(k)) { const c = docCap(tep.cap[k]); if (c) { g.cap[k] = c; if (k.indexOf('vk-') === 0) g.coVk = true; } }
    SC.ghep[key] = g; SC.ghepVer++;
    xoaNhoDo();
    return g;
  }
  function boGhep(key) { delete SC.ghep[key]; SC.ghepVer++; xoaNhoDo(); }
  SC.khoaGhep = (key) => (SC.ghep[key] ? '|g' + SC.ghepVer : '');
  const coCap = (key, ma) => !!(SC.ghep[key] && SC.ghep[key].cap[ma]);
  // Tên động tác: thân code (run, dodge, hurt, hold, ...) và thân AI (move, ne, hit, tele, ...) gọi khác nhau; khoá "theo" ghi tên nào cũng được.
  const CHUAN = { run: 'move', dash: 'move', dodge: 'ne', hurt: 'hit', hold: 'tele', spec: 'atk', cast: 'atk', sweep: 'atk', gong: 'idle' };
  const DOI_CODE = { move: 'run', ne: 'dodge', hit: 'hurt', tele: 'hold' };
  SC.TEN_AI = CHUAN; SC.TEN_CODE = DOI_CODE;
  // Các khoá "theo" áp cho (ten, i), ưu tiên tăng dần: động tác (tên khác, tên chuẩn, đúng tên) rồi khung.
  function khoaTheo(ten, i) {
    const c = CHUAN[ten] || ten, ds = [];
    for (const n of [DOI_CODE[c], c, ten]) if (n && ds.indexOf(n) < 0) ds.push(n);
    return ds.concat(ds.map((n) => n + ':' + (i | 0)));
  }
  SC.khoaTheo = khoaTheo;
  // Chỉnh theo cặp (nhân vật key + món ma) đã gộp "theo" của động tác / khung dong = { ten, i }. null: không có.
  SC.capTheo = function (key, ma, dong) {
    const g = SC.ghep[key], c = g && g.cap[ma];
    if (!c) return null;
    const r = Object.assign({}, c.goc);
    if (dong) for (const k of khoaTheo(dong.ten, dong.i)) if (c.theo[k]) Object.assign(r, c.theo[k]);
    return r;
  };
  // Thân AI: điểm neo khung (ten, i), toạ độ tính từ chân. Lấy diem_theo (khung thắng động tác), thiếu thì lấy "diem" (khung đứng
  // đầu tiên) rồi dời theo phần game tự đo (SC.khopEmBe): đầu dời theo dau, còn lại theo than; lăn/ngã: xoay, dời cả khối.
  // null: chưa có tệp ghép cho nhân vật này (game ước lượng từ khung xương như cũ).
  SC.diemAI = function (key, ten, i, khop) {
    const g = SC.ghep[key];
    if (!g) return null;
    const th = {};
    for (const k of khoaTheo(ten, i)) if (g.theo[k]) Object.assign(th, g.theo[k]);
    const quay = !!(khop && khop.rot != null), d = {}, ng = {};
    const c = quay ? Math.cos(khop.rot * D2R) : 1, s = quay ? Math.sin(khop.rot * D2R) : 0;
    for (const n of TEN_DIEM) {
      if (th[n]) { d[n] = th[n].slice(); ng[n] = 'tep'; continue; }
      const p = g.diem[n];
      if (!p) continue;
      if (ten === 'idle' && (i | 0) === 0) { d[n] = p.slice(); ng[n] = 'tep'; continue; }
      if (quay) d[n] = [khop.x + p[0] * c - p[1] * s, khop.y + p[0] * s + p[1] * c];
      else { const q = khop ? (DIEM_DAU[n] ? khop.dau : khop.than) : null; d[n] = [p[0] + ((q && q[0]) || 0), p[1] + ((q && q[1]) || 0)]; }
      ng[n] = 'uoc-luong';
    }
    return { diem: d, nguon: ng };
  };
  // neo truyền cho lopDo: có tệp ghép thì thêm khung đang vẽ, điểm của khung và khoá bộ nhớ đệm. Không có: trả lại neo cũ (y hệt trước).
  function neoGhep(key, s, neo, kh) {
    if (!SC.ghep[key]) return neo;
    const da = SC.diemAI(key, s.ten, s.i, kh), n = Object.assign({}, neo || {});
    n.khung = { ten: s.ten, i: s.i }; n.diem = da ? da.diem : null; n.nguon = da ? da.nguon : null;
    n.khoa = '|g' + SC.ghepVer + ':' + s.ten + ':' + s.i;
    return n;
  }
  const xoay2 = (x, y, a) => { const r = a * D2R, c = Math.cos(r), s = Math.sin(r); return [x * c - y * s, x * s + y * c]; };
  // Khớp các điểm P (trên ảnh món đồ) vào các điểm Q (trên thân, toạ độ tấm ghép): 1 điểm: trùng điểm, giữ góc goc; từ 2 điểm: dời theo
  // trung bình, co đều (kẹp 0,85..1,15) và xoay (kẹp goc ± 20 độ) cho khớp nhất. Không kéo méo.
  function khopDiem(P, Q, goc) {
    const n = P.length;
    if (n === 1) return { T: Q[0].slice(), Pm: P[0].slice(), a: goc, k: 1 };
    let px = 0, py = 0, qx = 0, qy = 0;
    for (let i = 0; i < n; i++) { px += P[i][0]; py += P[i][1]; qx += Q[i][0]; qy += Q[i][1]; }
    px /= n; py /= n; qx /= n; qy /= n;
    let A = 0, Bq = 0, pp = 0;
    for (let i = 0; i < n; i++) { const ux = P[i][0] - px, uy = P[i][1] - py, vx = Q[i][0] - qx, vy = Q[i][1] - qy; A += ux * vx + uy * vy; Bq += ux * vy - uy * vx; pp += ux * ux + uy * uy; }
    let a = goc, k = 1;
    if (pp > 0.25 && (A || Bq)) { a = Math.atan2(Bq, A) / D2R; k = Math.hypot(A, Bq) / pp; }
    const dl = clamp((((a - goc) % 360) + 540) % 360 - 180, -20, 20);
    return { T: [qx, qy], Pm: [px, py], a: goc + dl, k: clamp(k, 0.85, 1.15) };
  }
  SC.khopDiem = khopDiem;
  const capDoi = (c) => !!(c && (c.dx || c.dy || c.xoay || c.sx !== 1 || c.sy !== 1));
  // CHỖ ĐẶT một món đồ trên khung đang vẽ (game và API datDo dùng chung). cx: bối cảnh vẽ (js/hero_tinhlinh.js taoCx).
  // Trả về { sp (ảnh dùng: món hoặc biến thể), c (cap đã gộp), an, ds: [phần], chung: [tên điểm chung], uoc, chuaChinh }.
  // Mỗi phần: { cu: true, F, lx, ly, doi } (y hệt đường cũ) hoặc { O: [x, y], a, sx, sy, doi } toạ độ tấm ghép.
  // Cánh có 2 phần: lá xa (tối hơn) rồi lá gần.
  SC.tinhDatMon = function (cx, sp0, x) {
    const c = cx.fit ? SC.capTheo(cx.key, sp0.ma, cx.dong) : null;
    const bt = c && c.bien_the ? doSan(c.bien_the) : null, sp = bt && bt.tp && bt.tp.o === sp0.tp.o ? bt : sp0, t = sp.tp, L = t.lech;
    const kq = { sp, c, an: !!(c && c.an), ds: [], chung: [], uoc: false, chuaChinh: false };
    if (kq.an) return kq;
    const B = cx.B, H = cx.H;
    let ds;
    if (t.o === 'hats' || t.o === 'masks') ds = [{ F: H, lx: L[0], ly: L[1] }];
    else if (t.o === 'hands' && t.kieu === 'cam') {
      const hx = x && x.hx != null ? x.hx : Math.round(cx.hf[0]), hy = x && x.hy != null ? x.hy : Math.round(cx.hf[1]), p = B.pt(hx, hy);
      ds = [{ F: B, lx: L[0] + hx, ly: L[1] + hy, thay: { tay_truoc: p, tay_sau: p } }]; // đồ cầm: khớp vào bàn tay đang cầm đồ (tay xa, tay rảnh)
    } else if (t.o === 'hands') { const d = Math.round((-(cx.tr || 0) + (cx.sw || 0)) * 0.7); ds = [{ F: B, lx: L[0] + d, ly: L[1], cong: [d, 0] }]; } // bùa lắc theo bước
    else if (t.o === 'wings') {
      const lv = Math.max(1, Math.min(3, cx.lv | 0)), flap = [-14, 0, 18, 0][(cx.f | 0) % 4] * (lv === 1 ? 0.6 : 1) * (cx.ps && cx.ps.anim === 'dodge' ? 1.5 : 1);
      const xa = B.sub(-3, -11, flap * 0.7 + 16), gan = B.sub(-4, -10, flap);
      ds = [{ F: xa, lx: L[0], ly: L[1], doi: toiDi, chi: 'goc_canh', them: [xa.ox - gan.ox, xa.oy - gan.oy] }, { F: gan, lx: L[0], ly: L[1], chi: 'goc_canh' }];
    } else ds = [{ F: B, lx: L[0], ly: L[1] }];
    const dm = t.diem && cx.diemCua ? cx.diemCua() : null, cc = c || {};
    for (const d of ds) {
      d.doi = d.doi || null;
      let fit = null;
      if (dm) {
        const P = [], Q = [];
        for (const n in t.diem) {
          if (d.chi && n !== d.chi) continue;
          let q = d.thay && d.thay[n] ? d.thay[n] : dm.d[n];
          if (!q) continue;
          if (d.cong) { const r = xoay2(d.cong[0], d.cong[1], d.F.deg); q = [q[0] + r[0], q[1] + r[1]]; }
          if (d.them) q = [q[0] + d.them[0], q[1] + d.them[1]];
          P.push(t.diem[n]); Q.push(q);
          if (kq.chung.indexOf(n) < 0) kq.chung.push(n);
          if (!(d.thay && d.thay[n]) && dm.ng[n] === 'uoc-luong') kq.uoc = true;
        }
        if (P.length) fit = khopDiem(P, Q, d.F.deg);
      }
      if (!fit) {
        kq.chuaChinh = true; kq.uoc = true;
        if (!capDoi(c)) { d.cu = true; continue; } // không có điểm chung, không chỉnh: y hệt đường cũ
        const w = sp.rong, h = sp.cao; // chỉ có chỉnh theo cặp: lấy tâm ảnh ở chỗ cũ làm điểm neo
        fit = { T: d.F.pt(d.lx + w / 2, d.ly + h / 2), Pm: [w / 2, h / 2], a: d.F.deg, k: 1 };
      }
      const dd = xoay2(cc.dx || 0, cc.dy || 0, d.F.deg);
      d.a = fit.a + (cc.xoay || 0); d.sx = fit.k * (cc.sx || 1); d.sy = fit.k * (cc.sy || 1);
      const r = xoay2(d.sx * fit.Pm[0], d.sy * fit.Pm[1], d.a);
      d.O = [fit.T[0] + dd[0] - r[0], fit.T[1] + dd[1] - r[1]];
    }
    kq.ds = ds;
    return kq;
  };

  // ---------- API cho công cụ (tools/tach-ghep, tach-do...): xem thử y hệt game ----------
  const r2 = (v) => Math.round(v * 100) / 100;
  // Bối cảnh của một khung. a: đối tượng vẽ em bé của game (o: key, move, atk, dodge, p, weapon, outfit...) hoặc
  // { key, dong_tac, khung, vu_khi ('sword'|'bow'|'spear'|'hammer'|null), v, outfit }.
  function ngCanh(a) {
    const TL = G.tinhLinh;
    if (!a || !TL || !TL.cxGia) return null;
    const key = TL.HERO[a.key] ? a.key : 'smith', of = TL.outfitOf(key, a), sp = SC.cuaEmBe(key);
    if (sp) { // thân AI
      let s;
      if (a.dong_tac != null) { const ten0 = String(a.dong_tac), ten = sp.dt[ten0] ? ten0 : SC.TEN_AI[ten0] || ten0, k = sp.dt[ten] ? ten : 'idle'; s = { ten: k, i: clamp(a.khung | 0, 0, sp.dt[k].so - 1) }; }
      else s = SC.chonEmBe(sp, a);
      const kh = SC.khopEmBe(sp, s.ten, s.i), neo = neoGhep(key, s, SC.neoCua(sp, s.ten), kh);
      // nhịp đung đưa: trong game theo động tác của thân code cùng lúc; ở đây suy từ động tác AI (move = chạy)
      const fr = a.dong_tac != null ? { key, of, anim: s.ten === 'move' ? 'run' : s.ten === 'idle' ? 'idle' : s.ten, f: s.i } : TL.frame(a, 1);
      return { ai: true, cx: TL.cxLopDo({ key, of, anim: fr.anim, f: fr.f }, neo, kh), ten: s.ten, i: s.i, key, of };
    }
    let ps;
    if (a.dong_tac != null) {
      const ten = SC.TEN_CODE[a.dong_tac] || String(a.dong_tac), vk = a.vu_khi === undefined ? 'sword' : a.vu_khi && a.vu_khi.type ? a.vu_khi.type : a.vu_khi || 'none';
      ps = TL.poseRs(key, vk, ten, clamp(a.khung | 0, 0, 13), a.v | 0, a.rs == null ? 6 : a.rs);
    } else ps = TL.frame(a, 1).ps;
    return { ai: false, cx: TL.cxGia(key, of, ps, null), ten: ps.anim, i: ps.f | 0, key, of };
  }
  SC.ngCanh = ngCanh;
  // Điểm neo nhân vật ở một khung. Gọi: diemNhanVat(o) hoặc diemNhanVat({ key, dong_tac, khung, vu_khi }) hoặc diemNhanVat(key, dong_tac, khung).
  // Trả về { diem: { tên: [x, y] tính từ chân }, nguon: { tên: 'xuong' | 'tep' | 'uoc-luong' }, than: 'code' | 'ai', dong_tac, khung, goc: { than, dau } }.
  SC.diemNhanVat = function (a, dong_tac, khung) {
    const ctx = ngCanh(typeof a === 'string' ? { key: a, dong_tac: dong_tac == null ? 'idle' : dong_tac, khung } : a);
    if (!ctx) return null;
    const dm = ctx.cx.diemCua(), ps = ctx.cx.ps, diem = {};
    for (const n in dm.d) diem[n] = [r2(dm.d[n][0] + (ps.x || 0)), r2(dm.d[n][1] + (ps.y || 0))];
    return { diem, nguon: Object.assign({}, dm.ng), than: ctx.ai ? 'ai' : 'code', dong_tac: ctx.ten, khung: ctx.i, goc: { than: r2(ctx.cx.B.deg), dau: r2(ctx.cx.H.deg) } };
  };
  // Một phần đã tính -> phép đặt ảnh tính từ chân: ảnh món đồ (rong x cao điểm ảnh game) vẽ bằng
  //   translate(x, y); rotate(xoay độ); scale(sx, sy); drawImage(ảnh, 0, 0, rong, cao)   (rồi lật theo hướng mặt như em bé).
  // Khi xoay = 0 game làm tròn x, y; khi xoay khác 0 game dựng từng điểm ảnh (như vũ khí), canvas xoay có thể lệch nhau 1 điểm ảnh.
  function doiRaChan(d, ps) {
    let x, y, sx = 1, sy = 1, a;
    if (d.cu) { const q = d.F.pt(d.lx, d.ly); x = q[0]; y = q[1]; a = d.F.deg; } else { x = d.O[0]; y = d.O[1]; sx = d.sx; sy = d.sy; a = d.a; }
    x += ps.x || 0; y += ps.y || 0;
    if (Math.abs(a) < 0.01) { x = Math.round(x); y = Math.round(y); a = 0; }
    return { x: r2(x), y: r2(y), sx: r2(sx), sy: r2(sy), xoay: r2(a) };
  }
  // Chỗ đặt một món đồ: datDo(key, maDo, dong_tac, khung, tuyChon) hoặc datDo(o, maDo) (o: đối tượng vẽ em bé của game).
  // Trả về { x, y, sx, sy, xoay, lop, da_chinh, uoc_luong, chua_chinh, an, hien, diem_chung, bien_the, ma, o, rong, cao, than, dong_tac, khung, xa }
  // (xa: lá cánh xa, vẽ tối hơn). null: không có món hoặc chưa nạp xong.
  SC.datDo = function (a, maDo, dong_tac, khung, tuy) {
    const ctx = ngCanh(typeof a === 'string' ? Object.assign({ key: a, dong_tac: dong_tac == null ? 'idle' : dong_tac, khung }, tuy || {}) : a);
    const sp0 = doSan(maDo);
    if (!ctx || !sp0 || !sp0.tp) return null;
    const cx = ctx.cx, t0 = sp0.tp, ps = cx.ps;
    const r = SC.tinhDatMon(cx, sp0, null), c = r.c || {};
    const out = { ma: sp0.ma, o: t0.o, than: ctx.ai ? 'ai' : 'code', dong_tac: ctx.ten, khung: ctx.i, lop: c.lop || lopGoc(r.sp.tp), da_chinh: c.da_chinh === true,
      an: r.an, hien: !r.an && !(t0.o === 'hands' && t0.kieu === 'cam' && !ps.free), uoc_luong: r.an ? false : r.uoc, chua_chinh: r.an ? false : r.chuaChinh,
      diem_chung: r.chung.slice(), bien_the: r.sp !== sp0 ? r.sp.ma : null, rong: r.sp.rong, cao: r.sp.cao, net: r.sp.net || 1 };
    if (r.an || !r.ds.length) return Object.assign(out, { x: null, y: null, sx: 1, sy: 1, xoay: 0 });
    Object.assign(out, doiRaChan(r.ds[r.ds.length - 1], ps));
    if (r.ds.length > 1) out.xa = Object.assign(doiRaChan(r.ds[0], ps), { toi: true });
    return out;
  };
  // Các món ĐANG MẶC (ảnh AI) chưa hiệu chỉnh cho nhân vật key: chưa có điểm, không có điểm chung với thân, chưa duyệt (da_chinh).
  // o: (tuỳ chọn) đối tượng có outfit như khi vẽ em bé. Trả về [{ ma, o, look, ly_do: [...] }]. Game không hiện gì; công cụ dùng để cảnh báo.
  SC.chuaChinh = function (key, o) {
    const TL = G.tinhLinh, L = G.heroLooks;
    if (!TL || !L) return [];
    key = TL.HERO[key] ? key : 'smith';
    const of = TL.outfitOf(key, o || {}), ds = [];
    for (const m of [['hats', of.hat], ['robes', of.robe], ['backs', of.back], ['hands', of.hand], ['masks', of.mask], ['wings', of.wing && of.wing.kind]]) {
      const it = m[1] && L[m[0]] && L[m[0]][m[1]];
      if (!it || !it.tuVe || !it.ma || !doSan(it.ma)) continue;
      const r = SC.datDo(key, it.ma, 'idle', 0, { outfit: (o && (o.outfit || (o.p && o.p.outfit))) || undefined }), ly = [];
      if (!r) continue;
      if (!doSan(it.ma).tp.diem) ly.push('mon-chua-co-diem'); else if (r.chua_chinh) ly.push('khong-co-diem-chung');
      if (r.uoc_luong) ly.push('uoc-luong');
      if (!r.da_chinh) ly.push('chua-duyet');
      if (ly.length) ds.push({ ma: it.ma, o: m[0], look: m[1], ly_do: ly });
    }
    return ds;
  };
  // Vũ khí: chỉnh theo cặp nhân vật + vũ khí (khoá: mã tệp vũ khí, "vk-<loại>-<dòng>", "vk-<loại>"; cụ thể nhất thắng), gộp "theo".
  // Trả về { dx, dy, xoay } hoặc null. Chỉ dời / xoay hình vũ khí quanh điểm cầm, không đổi đòn đánh.
  SC.capVuKhi = function (key, w, type, anim, f) {
    const g = SC.ghep[key];
    if (!g || !g.coVk || !type) return null;
    let wo = null, ma = null;
    try { wo = G.weaponArt && G.weaponArt.fromWeapon ? G.weaponArt.fromWeapon(w) : null; const s = wo && SC.timVuKhi(wo); ma = s && s.ma; } catch (e) { wo = null; }
    const ks = [ma, wo ? 'vk-' + type + '-' + (wo.family | 0) : null, 'vk-' + type];
    let k = null; for (const q of ks) if (q && g.cap[q]) { k = q; break; }
    if (!k) return null;
    const c = SC.capTheo(key, k, { ten: anim, i: f });
    if (!c || (!c.dx && !c.dy && !c.xoay)) return null;
    return { dx: c.dx || 0, dy: c.dy || 0, xoay: c.xoay || 0 };
  };
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
