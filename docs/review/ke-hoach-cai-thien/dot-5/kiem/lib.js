// Thư viện thử cho Đợt 3 (chỉ chạy trong trình duyệt thử, không vào game).
(() => {
  const K = (window.K = {}), O = G.outfit, SC = G.spriteCustom, TL = G.tinhLinh;
  // dừng vòng lặp thật
  K.realTick = K.realTick || G.tick; G.tick = () => {};
  // Chọn đúng khung muốn xem (như tools/tach-ghep làm), chỉ trong trang thử.
  const chon0 = SC.chonEmBe;
  K.chon0 = chon0;
  SC.chonEmBe = function (sp, o) { return o && o.__khung ? { ten: sp.dt[o.__khung.ten] ? o.__khung.ten : 'idle', i: sp.dt[o.__khung.ten] ? o.__khung.i : chon0.call(this, sp, o).i, u: o.__khung.u } : chon0.apply(this, arguments); };
  // Ghi lại lớp đồ game dựng cho khung vừa vẽ
  const lop0 = TL.lopDo;
  K.lop = null;
  TL.lopDo = function (fr, neo, khop, an) { const r = lop0.apply(this, arguments); K.lop = { r, khop, an: an ? an.slice() : null, of: fr.of }; return r; };
  K.wear = (list) => { for (const q of list) O.wear(G.save, O.add(G.save, q[0], q[1] == null ? 2 : q[1], { lv: q[2] || 1 })); };
  // Trạng thái vẽ của game cho hàng ten, khung i (n khung): giống G.heroArgs(P) lúc đó
  K.args = function (ten, i, n, sp, look, weapon, key) {
    const a = sp.dt[ten] || sp.dt.idle, u = (i + 0.5) / n;
    const o = { x: 0, y: 0, face: 1, key: key || 'smith', move: false, t: 0, atk: -1, dodge: -1, flash: false, weapon: weapon || null, outfit: look, noShadow: true, helm: null, armor: null };
    const p = { dead: false, deadT: 0, dashT: 0, specT: 0, castT: 0, hurtT: 0, st: {}, mv: null, outfit: look };
    if (ten === 'idle' || ten === 'noi') o.t = (i + 0.5) * a.giay / a.so;
    else if (ten === 'move') { o.move = true; o.t = (i + 0.5) * a.giay / a.so; }
    else if (ten === 'tele') { p.mv = { holding: true, charge: n > 1 ? i / (n - 1) : 1 }; }
    else if (ten === 'atk') o.atk = u;
    else if (ten === 'hit') { p.hurtT = 0.2 * (1 - u); }
    else if (ten === 'die') { p.dead = true; p.deadT = u * (a.giay || 0.6); }
    else if (ten === 'ne') o.dodge = u;
    o.p = p;
    return o;
  };
  const bbox = (cv) => {
    if (!cv || cv.width < 2) return null;
    const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) if (d[(y * cv.width + x) * 4 + 3] > 40) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    return x1 < 0 ? null : [x0, y0, x1, y1];
  };
  // Vẽ một ô: W×H điểm ảnh game, phóng Z lần (nét gấp đôi giữ nguyên). Trả về canvas.
  K.cell = function (o, W, H, FX, FY, Z, bg) {
    const cv = document.createElement('canvas'); cv.width = W * Z; cv.height = H * Z;
    const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
    if (bg) { c.fillStyle = bg; c.fillRect(0, 0, cv.width, cv.height); }
    c.save(); c.scale(Z, Z); c.translate(FX, FY);
    K.lop = null;
    G.art.hero(c, o);
    c.restore();
    return cv;
  };
  K.mask = function (cv) { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data, m = new Uint8Array(cv.width * cv.height); for (let i = 0; i < m.length; i++) m[i] = d[i * 4 + 3] > 40 ? 1 : 0; return m; };
  // Hộp bao của một lớp đồ theo toạ độ chân (điểm ảnh game)
  K.hopLop = function (l) { if (!l || l.trong) return null; const b = bbox(l.cv); if (!b) return null; const sx = l.w / l.cv.width, sy = l.h / l.cv.height; return [l.ox + b[0] * sx, l.oy + b[1] * sy, l.ox + (b[2] + 1) * sx, l.oy + (b[3] + 1) * sy]; };
  K.bbox = bbox;
  K.png = (cv) => cv.toDataURL('image/png');
  return true;
})()
