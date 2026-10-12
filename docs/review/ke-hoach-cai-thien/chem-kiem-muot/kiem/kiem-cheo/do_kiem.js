// Đo kiếm từng khung hình 60 fps (nạp vào trang game đã chạy). window.DK.
//  DK.kichBan(ten, key, face) -> mảng đối tượng o (tham số G.art.hero) theo từng 1/60 giây cho một kịch bản.
//  DK.do(o) -> số đo của khung đó: khung thân AI, khung code, góc gốc (khung xương code), góc vẽ, trước/sau thân, bàn tay, mũi kiếm, chạm mặt.
(function () {
  const SC = G.spriteCustom, TL = G.tinhLinh, FPS = 60;
  const OUT = { hat: null, robe: null, back: null, hand: null, mask: null, wing: null };
  const DUR = [0.3, 0.3, 0.46]; // js/moves.js C.sword.chain[i].dur
  function goc(o) { return Object.assign({ x: 0, y: 0, face: 1, key: 'smith', t: 1, weapon: { type: 'sword', family: 0, rarity: 0 }, atk: -1, dodge: -1, outfit: OUT }, o); }
  function p0(extra) { return Object.assign({ comboI: 0, mv: {}, st: {}, hurtT: 0, specT: 0, castT: 0, dashT: 0 }, extra || {}); }
  // một nhát: các khung trong lúc đánh (u = k / (dur*60))
  function nhat(ds, key, face, c, t0, move) {
    const n = Math.round(DUR[c] * FPS);
    for (let k = 0; k < n; k++) ds.push(goc({ key, face, atk: k / n, move: !!move, t: t0 + k / FPS, tc: t0 + k / FPS, p: p0({ comboI: c, lastAtk: t0 }), _pha: 'nhat' + (c + 1), _u: k / n }));
    return t0 + n / FPS;
  }
  function dung(ds, key, face, t0, n, move) { for (let k = 0; k < n; k++) ds.push(goc({ key, face, move: !!move, t: t0 + k / FPS, tc: t0 + k / FPS, p: p0({ comboI: -1 }), _pha: move ? 'chay' : 'dung' })); return t0 + n / FPS; }
  const KB = {
    // từng nhát đứng yên (6 khung đứng trước, 12 khung đứng sau)
    nhat1: (key, f) => { const d = []; let t = dung(d, key, f, 1, 6); t = nhat(d, key, f, 0, t); dung(d, key, f, t, 12); return d; },
    nhat2: (key, f) => { const d = []; let t = dung(d, key, f, 1, 6); t = nhat(d, key, f, 1, t); dung(d, key, f, t, 12); return d; },
    nhat3: (key, f) => { const d = []; let t = dung(d, key, f, 1, 6); t = nhat(d, key, f, 2, t); dung(d, key, f, t, 12); return d; },
    // chém liên tục cả chuỗi 3 nhát rồi về đứng
    lien: (key, f) => { const d = []; let t = dung(d, key, f, 1, 6); for (let c = 0; c < 3; c++) t = nhat(d, key, f, c, t); dung(d, key, f, t, 18); return d; },
    // vừa chạy vừa chém (chuỗi 3 nhát)
    chay: (key, f) => { const d = []; let t = dung(d, key, f, 1, 6, true); for (let c = 0; c < 3; c++) t = nhat(d, key, f, c, t, true); dung(d, key, f, t, 12, true); return d; },
    // chiêu đặc biệt (Trảm Nguyệt, specT 0,35 giây)
    chieu: (key, f) => {
      const d = []; let t = dung(d, key, f, 1, 6);
      for (let k = 0; k < 21; k++) d.push(goc({ key, face: f, t: t + k / FPS, p: p0({ specT: 0.35 - k / FPS }), _pha: 'chieu', _u: k / 21 }));
      dung(d, key, f, t + 21 / FPS, 12); return d;
    },
    // giữ lấy đà (0,6 giây đầy) rồi thả ra nhát 1
    giu: (key, f) => {
      const d = []; let t = dung(d, key, f, 1, 6);
      for (let k = 0; k < 48; k++) d.push(goc({ key, face: f, t: t + k / FPS, p: p0({ comboI: -1, mv: { holding: true, charge: Math.min(1, k / 36) } }), _pha: 'giu' }));
      t = nhat(d, key, f, 0, t + 48 / FPS); dung(d, key, f, t, 12); return d;
    },
    // né (0,27 giây) rồi lướt chém (0,12 giây)
    luot: (key, f) => {
      const d = []; let t = dung(d, key, f, 1, 6);
      for (let k = 0; k < 16; k++) d.push(goc({ key, face: f, t: t + k / FPS, dodge: k / 16, p: p0({ comboI: -1, ddx: f, ddy: 0 }), _pha: 'ne' }));
      t += 16 / FPS;
      for (let k = 0; k < 7; k++) d.push(goc({ key, face: f, t: t + k / FPS, atk: k / 7, p: p0({ comboI: 0, dashT: 0.12 - k / FPS }), _pha: 'luot' }));
      t += 7 / FPS; dung(d, key, f, t, 12); return d;
    },
  };
  const ra = (a) => (a * Math.PI) / 180;
  function doKhung(o) {
    const fr = TL.frame(o, 1), vg = TL.vkGhep(o), gv = SC.khungVk(o), wp = vg.wp;
    const r = { pha: o._pha, u: o._u != null ? +o._u.toFixed(3) : null, than: gv ? gv.ten + ':' + gv.i : null, code: fr.anim + ':' + fr.f, ang0: fr.weapon ? fr.weapon.ang : null };
    if (!wp) return r;
    r.ang = wp.ang; r.truoc = !!wp.front; r.tay = vg.P ? vg.P.map((v) => +v.toFixed(1)) : null;
    // chuôi: chỗ "nắm" trên ảnh rơi vào đâu (điểm cầm + lh dọc thân)
    const lh = wp.lh != null ? wp.lh : -5;
    r.chuoi = [+(wp.x + Math.cos(ra(wp.ang)) * lh).toFixed(1), +(wp.y + Math.sin(ra(wp.ang)) * lh).toFixed(1)];
    if (r.tay) r.lechChuoi = +Math.hypot(r.chuoi[0] - r.tay[0], r.chuoi[1] - r.tay[1]).toFixed(2);
    const q = TL.tip(o);
    if (q) { const f = o.face < 0 ? -1 : 1, L = q.L * Math.hypot(q.dx, q.dy); r.mui = [+(((q.gx + q.dx * q.L) - (o.x + (f < 0 ? 1 : 0))) * f).toFixed(1), +((q.gy + q.dy * q.L) - o.y).toFixed(1)]; r.L = +L.toFixed(1); r.tipU = +q.u.toFixed(3); }
    // lưỡi (từ tay ra mũi) có đi qua vùng mặt của khung không, khi đang vẽ trước thân
    const m = gv && gv.mat;
    if (m && r.tay && r.L) {
      const dx = Math.cos(ra(wp.ang)), dy = Math.sin(ra(wp.ang)), x0 = r.tay[0] + dx * 2.5, y0 = r.tay[1] + dy * 2.5, L = r.L + lh;
      const t = Math.max(0, Math.min(L, (m.x - x0) * dx + (m.y - y0) * dy));
      r.kcMat = +(Math.hypot(x0 + dx * t - m.x, y0 + dy * t - m.y) - m.r).toFixed(1);
      r.quaMat = r.truoc && r.kcMat < 1.5;
    }
    return r;
  }
  // Người chơi giả dùng chung suốt kịch bản (trạng thái kiếm nhớ trên người chơi, như trong game); mỗi khung VẼ trước rồi mới đo.
  function chay(ten, key, face) {
    const ds = KB[ten](key, face || 1), out = [];
    const P = {}, cv = document.createElement('canvas'); cv.width = 128; cv.height = 112; const c = cv.getContext('2d');
    for (const o of ds) {
      const q = o.p; for (const k of Object.keys(P)) delete P[k]; Object.assign(P, q); o.p = P;
      o.x = 64; o.y = 90; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, 128, 112);
      try { G.art.hero(c, o); } catch (e) { /* bỏ qua */ }
      o.x = 0; o.y = 0;
      out.push(doKhung(o));
    }
    return out;
  }
  // vẽ một kịch bản thành dải ảnh (để làm GIF): mỗi khung một ô cw x ch, phóng k
  function ve(ten, key, face, k, nen) {
    const ds = KB[ten](key, face || 1), cw = 76, ch = 80, K = k || 4, P = {};
    const cv = document.createElement('canvas'); cv.width = cw * K; cv.height = ch * K * ds.length; const c = cv.getContext('2d');
    c.imageSmoothingEnabled = false;
    ds.forEach((o, i) => {
      c.save(); c.translate(0, i * ch * K); c.fillStyle = nen || '#4f6e57'; c.fillRect(0, 0, cw * K, ch * K);
      c.scale(K, K); o.x = 36; o.y = 64;
      const q = o.p; for (const kk of Object.keys(P)) delete P[kk]; Object.assign(P, q); o.p = P;
      try { G.art.hero(c, o); } catch (e) { /* bỏ qua */ }
      c.restore();
    });
    return { url: cv.toDataURL(), n: ds.length, w: cw * K, h: ch * K, pha: ds.map((o) => o._pha) };
  }
  // Cung vệt chém ảnh AI (js/fx.js cungVk) của từng nhát trong chuỗi liên tục: vẽ các khung tới lúc đòn chạm (0,45) như trong game,
  // rồi lấy mẫu tip() 41 lần như cungVk. Trả về góc đầu / cuối / giữa cung (độ, so với hướng mặt) và góc kiếm đang vẽ lúc chạm.
  function vet(key) {
    const ds = KB.lien(key, 1), P = {}, out = [], cv = document.createElement('canvas'); cv.width = 128; cv.height = 112; const c = cv.getContext('2d');
    const WIN = [0.2, 0.66];
    for (let i = 0; i < ds.length; i++) {
      const o = ds[i], q0 = o.p; for (const k of Object.keys(P)) delete P[k]; Object.assign(P, q0); o.p = P;
      o.x = 64; o.y = 90; c.setTransform(1, 0, 0, 1, 0, 0); try { G.art.hero(c, o); } catch (e) { /* bỏ qua */ }
      const nx = ds[i + 1];
      if (o._u != null && o._u < 0.45 && (!nx || nx._pha !== o._pha || nx._u >= 0.45)) {
        const oo = Object.assign({}, nx || o, { p: P, x: 0, y: 0 }), r = { nhat: o._pha, a: [] };
        let a0 = null, a1 = null, ap = 0;
        for (let j = 0; j <= 40; j++) {
          oo.atk = j / 40; const q = TL.tip(oo);
          if (!q || q.anim !== 'atk' || q.u < WIN[0] || q.u > WIN[1]) continue;
          if (G.KIEM_KHOP && q.dx < -0.25 * Math.hypot(q.dx, q.dy)) continue;
          let a = Math.atan2(q.dy, q.dx); if (a0 == null) { a0 = a; ap = a; } else { while (a - ap > Math.PI) a -= 2 * Math.PI; while (a - ap < -Math.PI) a += 2 * Math.PI; ap = a; }
          a1 = a; r.a.push(Math.round((a * 180) / Math.PI));
        }
        const d = (x) => (x == null ? null : Math.round((x * 180) / Math.PI));
        r.dau = d(a0); r.cuoi = d(a1); r.giua = a0 == null ? null : d((a0 + a1) / 2);
        oo.atk = nx ? nx._u : 0.45; r.gocCham = TL.vkGhep(oo).wp.ang;
        out.push(r);
      }
    }
    return out;
  }
  window.DK = { KB, chay, ve, doKhung, goc, p0, vet };
})();
