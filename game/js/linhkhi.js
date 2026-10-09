// Hiển thị LINH KHÍ (dấu ấn hệ của vũ khí) cho rõ ràng. Chỉ đọc w.marks, w.branch và G.MARKS; không đổi luật dấu ấn.
//   - Trong trận: ba vạch Lửa/Độc/Băng cạnh hai ô vũ khí, hạt sáng bay vào vạch, chữ "+1 Lửa", vạch hệ chính nổi bật,
//     sắp đạt mốc thì nhấp nháy; biểu tượng hệ nhỏ trên đầu quái đang dính hiệu ứng (kết liễu nó sẽ được dấu ấn hệ đó).
//   - Màn kết quả: mỗi vũ khí một dòng (nhận bao nhiêu dấu ấn từng hệ, tổng/mốc kế, còn bao nhiêu, mốc kế mở gì).
//   - Xem vũ khí: bảng linh khí ba hệ có mốc 30/120/300, hệ chính, đặc trưng đã mở và sắp mở, gợi ý cách cày.
//   - Trang "Linh khí" trong hướng dẫn của Cụ Đồ.
(function () {
  const G = window.G, ui = G.ui;
  const LK = (G.lk = {});
  const ELS = ['fire', 'poison', 'ice'];
  const VERB = { fire: 'đang cháy', poison: 'đang trúng độc', ice: 'đang bị lạnh hoặc đóng băng' };
  LK.hint = (el) => 'Đánh quái ' + VERB[el] + ' rồi kết liễu để nhận dấu ấn ' + G.EL[el].name;

  // ---------- tính tiến độ ----------
  // Mốc kế của một số dấu ấn (null khi đã qua 300), mốc vừa qua (0 nếu chưa qua mốc nào).
  LK.next = (m) => { for (const v of G.MARKS) if (m < v) return v; return null; };
  LK.prev = (m) => { let p = 0; for (const v of G.MARKS) if (m >= v) p = v; return p; };
  // Thông tin một hệ của một vũ khí.
  LK.info = function (w, el) {
    const m = Math.floor(w.marks[el] || 0), nx = LK.next(m), pv = LK.prev(m);
    const main = w.branch === el, free = !w.branch;
    const cap = G.RARITY[G.wRar(w)].maxStage;
    const st = main ? G.wStage(w) : 0;
    const idx = nx == null ? 3 : G.MARKS.indexOf(nx) + 1; // mốc kế là mốc thứ mấy (1: Mầm, 2: Thành hình, 3: Thức tỉnh)
    const capped = main && (st >= cap);
    let unlock = null;
    if (nx != null && (main || free)) {
      unlock = idx === 1 ? 'Mầm: vũ khí theo hệ ' + G.EL[el].name : idx === 2 ? 'Thành hình: mở ' + G.HE_FEATURES[el][0].name : 'Thức tỉnh: mở ' + G.HE_FEATURES[el][1].name;
      if (idx > cap) unlock += ' (cần nâng bậc)';
    }
    return {
      el, m, next: nx, prev: pv, left: nx == null ? 0 : nx - m, main, free, active: main || free, capped,
      frac: nx == null ? 1 : (m - pv) / (nx - pv), unlock, idx,
      near: nx != null && (main || free) && nx - m <= Math.max(3, Math.round((nx - pv) * 0.12)),
    };
  };
  // Hệ mà quái này sẽ cho dấu ấn nếu bị kết liễu bây giờ (giống luật trong G.kill), hoặc null.
  LK.markEl = function (e) {
    if (!e || !e.st || e.illusion || e.marks === 0 || !G.hasStatus(e)) return null;
    const s = e.st, on = { fire: s.fire > 0, poison: s.poisonN > 0, ice: s.iceN > 0 || s.frozen > 0 };
    return s.last && on[s.last] ? s.last : on.fire ? 'fire' : on.poison ? 'poison' : 'ice';
  };

  // ---------- sổ ghi dấu ấn nhận trong lượt chơi (để màn kết quả ghi đúng số) ----------
  LK.log = function (w, el, n) {
    const S = G.getRun && G.getRun();
    if (!S || !w || !(n > 0)) return;
    const L = (S.lkGain = S.lkGain || {}), g = (L[w.id] = L[w.id] || { fire: 0, poison: 0, ice: 0 });
    g[el] += n;
  };

  // ---------- biểu tượng hệ (vẽ sẵn vào canvas nhỏ, nét điểm ảnh) ----------
  const BM = {
    fire: ['...a....', '..ab..a.', '..abb.a.', '.abbbaba', 'abbcbbba', 'abccbcba', 'abcccbba', '.abbbba.'],
    poison: ['...aa...', '..abba..', '.abbbba.', '.abbbba.', 'abbcbbba', 'abccbbba', 'abbbbbba', '.aaaaaa.'],
    ice: ['...ab...', '.a.ab.a.', '..abba..', 'aabccbaa', 'aabccbaa', '..abba..', '.a.ab.a.', '...ab...'],
  };
  const PAL = {
    fire: { a: '#7a1e0a', b: '#ff7a2a', c: '#ffe27a' },
    poison: { a: '#1f4a12', b: '#6fcf3a', c: '#e6ffc0' },
    ice: { a: '#2b6ea3', b: '#9fe0ff', c: '#ffffff' },
    dim: { a: '#2a3432', b: '#5a6a66', c: '#8a9a94' },
  };
  const IC = new Map();
  function iconCv(el, dim, s) {
    const key = el + (dim ? 'd' : '') + s;
    let cv = IC.get(key);
    if (cv) return cv;
    const rows = BM[el], pal = dim ? PAL.dim : PAL[el];
    cv = document.createElement('canvas'); cv.width = 8 * s; cv.height = 8 * s;
    const g = cv.getContext('2d');
    rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const k = r[i]; if (pal[k]) { g.fillStyle = pal[k]; g.fillRect(i * s, j * s, s, s); } } });
    IC.set(key, cv);
    return cv;
  }
  // Vẽ biểu tượng hệ, tâm (cx, cy), cỡ 8*s đơn vị.
  LK.icon = function (el, cx, cy, s, dim, alpha) {
    s = s || 1;
    const c = G.ux, sm = c.imageSmoothingEnabled, ga = c.globalAlpha;
    c.imageSmoothingEnabled = false;
    if (alpha != null) c.globalAlpha = ga * alpha;
    c.drawImage(iconCv(el, dim, 1), Math.round(cx - 4 * s), Math.round(cy - 4 * s), 8 * s, 8 * s);
    c.imageSmoothingEnabled = sm; c.globalAlpha = ga;
  };
  const blink = (hz) => ((G.time * (hz || 6)) | 0) % 2 === 1;

  // ---------- ba vạch linh khí trong trận ----------
  // Một tấm ngay dưới hai ô vũ khí (x 368..478, y 39..55), trên mặt tường sau, không che sàn; bản đồ nhỏ nằm dưới tấm này.
  // Mỗi hệ một ô: biểu tượng, vạch tiến độ tới mốc kế, số "87/120" bên dưới.
  const HUD = { x: 368, y: 39, w: 110, h: 17, cell: 36.5 };
  LK.HUD = HUD;
  const cellX = (i) => HUD.x + 1.5 + i * HUD.cell;
  // Chỗ hạt sáng bay vào (toạ độ màn hình).
  LK.barPos = function (el) {
    const i = ELS.indexOf(el);
    if (i < 0) return null;
    return { x: cellX(i) + 22, y: HUD.y + 6 };
  };
  LK.textPos = { x: 352, y: 50 }; // chỗ chữ "+1 Lửa" hiện ra, ngay bên trái tấm vạch
  const pulse = { fire: 0, poison: 0, ice: 0 };
  let pulseT = 0;
  LK.pulse = function (el) { pulse[el] = 0.4; };
  LK.state = { last: null }; // cho bài kiểm tra: số liệu vạch vẽ ở khung gần nhất
  LK.hud = function (P, W) {
    const w = G.curW(P);
    if (!w || !w.marks) return;
    const dt = Math.max(0, Math.min(0.1, G.time - pulseT)); pulseT = G.time;
    const T = G.theme;
    if (T && T.plate) T.plate(HUD.x, HUD.y, HUD.w, HUD.h); else ui.rect(HUD.x, HUD.y, HUD.w, HUD.h, 'rgba(14,10,10,0.88)', '#7a5a3a');
    const rows = [];
    ELS.forEach((el, i) => {
      const I = LK.info(w, el), x = cellX(i), E = G.EL[el], y = HUD.y;
      if (pulse[el] > 0) pulse[el] = Math.max(0, pulse[el] - dt);
      const dim = !I.active;
      // hệ chính: nền màu hệ sẫm, viền sáng
      if (I.main) ui.rect(x + 0.5, y + 2, HUD.cell - 2, HUD.h - 4, E.dark, E.col2);
      LK.icon(el, x + 5.5, y + 6.5, 0.9, dim, dim ? 0.75 : 1);
      const bx = x + 11, bw = HUD.cell - 15, by = y + 4.5, bh = 4;
      ui.rect(bx - 0.5, by - 0.5, bw + 1, bh + 1, '#0b0a0a');
      ui.rect(bx, by, bw, bh, dim ? '#1c2222' : '#13201e');
      const fw = Math.round(bw * G.clamp(I.frac, 0, 1) * 2) / 2;
      const fl = I.near && blink(7) ? '#ffffff' : dim ? '#4f5f5a' : E.col;
      if (fw > 0) { ui.rect(bx, by, fw, bh, fl); ui.rect(bx, by, fw, 1, dim ? '#6a7a74' : E.col2); }
      if (I.near && blink(5)) ui.rect(bx - 1.5, by - 1.5, bw + 3, bh + 3, null, E.col2); // sắp đạt mốc: khung nhấp nháy
      if (pulse[el] > 0) {
        const k = pulse[el] / 0.4;
        G.ux.globalAlpha = k;
        ui.rect(bx - 1.5, by - 1.5, bw + 3, bh + 3, null, '#ffffff');
        ui.rect(bx, by, Math.max(2, fw), bh, 'rgba(255,255,255,0.6)');
        G.ux.globalAlpha = 1;
      }
      const num = I.next == null || I.capped ? I.m + ' ★' : I.m + '/' + I.next;
      ui.text(num, bx + bw / 2, y + 14.6, { size: 6.5, align: 'center', bold: I.main, color: dim ? '#8a9a94' : I.main ? '#fff3da' : E.col2 });
      rows.push({ el, m: I.m, next: I.next, frac: I.frac, main: I.main, dim, near: I.near, fill: fw, text: num });
    });
    LK.state.last = { wid: w.id, rows };
    // biểu tượng hệ nhỏ trên đầu quái đang dính hiệu ứng
    if (W) badges(W);
  };

  // ---------- biểu tượng hệ trên đầu quái ----------
  function badge(e, x, top) {
    const el = LK.markEl(e);
    if (!el) return;
    const y = top - 3 + (blink(3) ? -0.5 : 0);
    ui.rect(x - 4.5, y - 4.5, 9, 9, 'rgba(12,10,10,0.82)', G.EL[el].col);
    LK.icon(el, x, y, 0.85);
  }
  LK.badgeList = [];
  function badges(W) {
    const cam = Math.round(W.cam || 0);
    LK.badgeList.length = 0;
    const list = W.ents.slice();
    if (W.boss && !W.boss.dead) list.push(W.boss);
    for (const e of list) {
      if (e.dead || e.hidden || e.dying != null || e.illusion) continue;
      const el = LK.markEl(e);
      if (!el) continue;
      const hh = e.isBoss ? (e.h || 40) + 16 : (e.h || 24) * (e.art ? 1 : e.scale || 1) + 10; // ngay trên các dấu hiệu trạng thái
      badge(e, Math.round(e.x - cam), Math.round(e.y - hh));
      LK.badgeList.push({ e, el });
    }
  }

  // ---------- màn kết quả: mỗi vũ khí một dòng ----------
  // Trả về các dòng chữ (để bài kiểm tra đọc) cho từng vũ khí đang mang.
  LK.resultRows = function (S) {
    const out = [];
    const L = (S && S.lkGain) || {};
    for (const w of (S && S.P && S.P.weapons) || []) {
      const g = L[w.id] || { fire: 0, poison: 0, ice: 0 };
      const got = ELS.filter((el) => g[el] >= 0.5).map((el) => ({ el, n: Math.round(g[el]) }));
      // hệ để nói tiến độ: hệ chính; chưa khoá thì hệ nhiều dấu ấn nhất
      const el = w.branch || ELS.slice().sort((a, b) => w.marks[b] - w.marks[a])[0];
      const I = LK.info(w, el);
      let prog;
      if (!w.branch && I.m <= 0) prog = 'Chưa có dấu ấn. ' + 'Kết liễu quái đang dính hiệu ứng để nhận.';
      else if (I.next == null) prog = G.EL[el].name + ' ' + I.m + ' · đã Thức tỉnh (tối đa)';
      else if (I.capped) prog = G.EL[el].name + ' ' + I.m + '/' + I.next + ' · tối đa bậc ' + G.RARITY[G.wRar(w)].name + ', nâng bậc để lên tiếp';
      else prog = G.EL[el].name + ' ' + I.m + '/' + I.next + ' · còn ' + I.left + ' nữa → ' + I.unlock;
      out.push({ w, got, el, prog, info: I });
    }
    return out;
  };
  // Vẽ khối linh khí của màn kết quả trong khung (x, y, rộng wd). Trả về y cuối.
  LK.resultBlock = function (S, x, y, wd) {
    const rows = LK.resultRows(S);
    const T = G.theme;
    if (T && T.head) T.head('Linh khí của vũ khí', x, y + 7, { size: 7.5 }); else ui.text('Linh khí của vũ khí', x, y + 7, { size: 7.5, bold: true });
    y += 11;
    for (const r of rows) {
      const w = r.w, rar = G.RARITY[G.wRar(w)];
      ui.rect(x, y, wd, 19, 'rgba(10,22,20,0.55)', 'rgba(255,220,160,0.14)');
      G.art.weaponIcon(G.ux, w, x + 9, y + 9.5, 13);
      let cx = x + 19;
      const nm = G.wName(w);
      ui.font(7, true);
      const nmW = Math.min(110, G.ux.measureText(nm).width);
      ui.text(nm.length > 26 ? nm.slice(0, 25) + '…' : nm, cx, y + 8, { size: 7, bold: true, color: rar.col });
      cx += nmW + 6;
      if (!r.got.length) ui.text('không nhận dấu ấn', cx, y + 8, { size: 6.5, color: '#9fb0aa' });
      for (const q of r.got) {
        LK.icon(q.el, cx + 3, y + 5.5, 0.8);
        const s = '+' + q.n + ' ' + G.EL[q.el].name;
        ui.text(s, cx + 8, y + 8, { size: 7, bold: true, color: G.EL[q.el].col });
        ui.font(7, true);
        cx += 12 + G.ux.measureText(s).width;
      }
      // dòng tiến độ + vạch nhỏ
      const I = r.info, E = G.EL[r.el];
      ui.bar(x + 19, y + 12, 34, 3, I.frac, I.active ? E.col : '#5a6a66');
      ui.text(r.prog, x + 57, y + 16, { size: 6.5, color: I.active ? '#e8dfcc' : '#9fb0aa' });
      y += 21;
    }
    return y;
  };

  // ---------- bảng linh khí trong màn Xem vũ khí ----------
  // Ba hàng (Lửa, Độc, Băng), mỗi hàng một vạch chia ba đoạn bằng nhau: 0-30, 30-120, 120-300.
  LK.panel = function (w, x, y, wd) {
    const T = G.theme;
    if (T && T.head) T.head('Linh khí (dấu ấn hệ)', x, y); else ui.text('Linh khí (dấu ấn hệ)', x, y, { size: 8.5, bold: true });
    ui.text('mốc 30 · 120 · 300', x + wd, y, { size: 6.5, align: 'right', color: '#9fb0aa' });
    y += 5;
    const bx = x + 40, bw = wd - 66, seg = bw / 3;
    ELS.forEach((el) => {
      const I = LK.info(w, el), E = G.EL[el], dim = !I.active;
      if (I.main) ui.rect(x - 2, y, wd + 4, 12, 'rgba(255,220,140,0.08)', E.col);
      LK.icon(el, x + 5, y + 6, 1, dim);
      ui.text(E.name, x + 11, y + 8.8, { size: 7.5, bold: I.main, color: dim ? '#7f8f8a' : E.col });
      // vạch ba đoạn
      ui.rect(bx - 0.5, y + 3.5, bw + 1, 5, '#0b0a0a');
      ui.rect(bx, y + 4, bw, 4, '#13201e');
      const mk = [0].concat(G.MARKS);
      let fw = 0;
      for (let k = 0; k < 3; k++) { const a = mk[k], b = mk[k + 1]; fw += seg * G.clamp((I.m - a) / (b - a), 0, 1); }
      if (fw > 0) { ui.rect(bx, y + 4, fw, 4, dim ? '#4f5f5a' : I.near && blink(5) ? '#ffffff' : E.col); ui.rect(bx, y + 4, fw, 1, dim ? '#6a7a74' : E.col2); }
      for (let k = 1; k <= 3; k++) ui.rect(bx + seg * k - 0.5, y + 2.5, 1, 7, I.m >= G.MARKS[k - 1] ? '#ffd23f' : '#5a6a66');
      ui.text(String(I.m) + (I.next != null ? '/' + I.next : ''), x + wd, y + 8.8, { size: 7, align: 'right', bold: I.main, color: dim ? '#7f8f8a' : '#f1ead9' });
      y += 13;
    });
    // hệ chính, đã mở, sắp mở, gợi ý
    const el = w.branch, rar = G.RARITY[G.wRar(w)];
    y += 4;
    if (el) {
      const st = G.wStage(w), I = LK.info(w, el), E = G.EL[el];
      ui.text('Hệ chính: ' + E.name + ' · ' + G.STAGE_NAMES[st] + (st >= rar.maxStage ? ' (tối đa bậc ' + rar.name + ')' : ''), x, y + 3, { size: 7.5, bold: true, color: E.col });
      y += 10;
      const open = G.HE_FEATURES[el].slice(0, G.heFeatures(st)).map((f) => f.name);
      ui.text('Đã mở: ' + (open.length ? open.join(', ') : 'chưa có đặc trưng (mốc Mầm chỉ tăng chỉ số)'), x, y + 3, { size: 6.5, color: '#cfe8c8' });
      y += 9;
      if (I.next != null && I.unlock) { ui.text('Sắp mở: ' + I.unlock + ' (còn ' + I.left + ' dấu ấn)', x, y + 3, { size: 6.5, color: '#ffd27a' }); y += 9; }
      y = ui.para('Cách cày: ' + LK.hint(el) + '.', x, y + 3, wd, { size: 6.5, color: '#d9cdb8' }) - 1;
    } else {
      ui.text('Chưa có hệ chính: hệ nào đủ ' + G.MARKS[0] + ' dấu ấn trước thì vũ khí theo hệ đó.', x, y + 3, { size: 6.5, bold: true, color: '#ffd27a' });
      y += 9;
      y = ui.para('Cách cày: đánh quái đang cháy, trúng độc hoặc bị lạnh rồi kết liễu nó. Vật nổ trong phòng (chậu than, nấm, tinh thể băng) giúp gây hệ khi vũ khí còn trắng.', x, y + 3, wd, { size: 6.5, color: '#d9cdb8' }) - 1;
    }
    return y;
  };

  // ---------- trang hướng dẫn của Cụ Đồ ----------
  // Một trang riêng, vẽ bằng hình: quái dính hệ -> kết liễu -> hạt sáng bay vào vạch; ba mốc; ba hệ.
  function mob(x, y, el) {
    // một con quái tròn nhỏ đang dính hiệu ứng
    ui.rect(x - 7, y - 6, 14, 11, '#3a2a3a'); ui.rect(x - 6, y - 7, 12, 13, '#3a2a3a');
    ui.rect(x - 6, y - 5, 12, 9, '#6a4a6a'); ui.rect(x - 5, y - 6, 10, 11, '#6a4a6a');
    ui.rect(x - 3, y - 3, 2, 2, '#ffffff'); ui.rect(x + 2, y - 3, 2, 2, '#ffffff');
    ui.rect(x - 2, y + 2, 5, 1, '#2a1a2a');
    LK.icon(el, x, y - 13, 0.9);
  }
  LK.guide = {
    h: 128,
    draw(x, y, wd) {
      const T = G.theme, head = (s, xx, yy) => (T && T.head ? T.head(s, xx, yy) : ui.text(s, xx, yy, { size: 8.5, bold: true }));
      head('Linh khí: dấu ấn hệ của vũ khí', x, y);
      ui.text('Mỗi vũ khí tích dấu ấn ba hệ. Xem ở ba vạch dưới ô vũ khí khi đánh, và ở màn Xem vũ khí.', x, y + 10, { size: 6.5, color: '#e8dfcc' });
      // sơ đồ cách nhận: quái đang cháy -> kết liễu -> hạt sáng "+1 Lửa" -> vạch Lửa
      const y1 = y + 36;
      mob(x + 22, y1, 'fire');
      ui.text('quái đang cháy', x + 22, y1 + 15, { size: 6.5, align: 'center', color: '#ffb07a' });
      ui.text('kết liễu', x + 60, y1 - 2, { size: 7, align: 'center', bold: true, color: '#ffd27a' });
      ui.text('→', x + 60, y1 + 8, { size: 9, align: 'center', color: '#ffd27a' });
      for (let i = 0; i < 3; i++) { ui.rect(x + 80 + i * 7, y1 - 3 - (i % 2) * 3, 3, 3, G.EL.fire.col2); ui.rect(x + 81 + i * 7, y1 - 2 - (i % 2) * 3, 1, 1, '#ffffff'); }
      ui.text('+1 Lửa', x + 88, y1 + 9, { size: 7, align: 'center', bold: true, color: G.EL.fire.col });
      ui.text('→', x + 112, y1 + 4, { size: 9, align: 'center', color: '#ffd27a' });
      // tấm vạch mẫu như trong trận
      const px = x + 122;
      ui.rect(px, y1 - 9, 60, 17, '#24484a', '#c9a86a');
      ELS.forEach((el, i) => {
        const cy = y1 - 6 + i * 5;
        LK.icon(el, px + 5, cy + 1.5, 0.5, i > 0);
        ui.rect(px + 9, cy, 46, 3, '#13201e');
        ui.rect(px + 9, cy, 46 * [0.7, 0.25, 0.15][i], 3, i ? '#4f5f5a' : G.EL[el].col);
      });
      ui.para('Hệ nào đủ 30 trước thì vũ khí khoá theo hệ đó (hệ chính, vạch sáng); hai hệ kia mờ đi.', x + 190, y1 - 9, wd - 190, { size: 6.5, color: '#d9cdb8' });
      // ba mốc
      const y2 = y1 + 24, bw = wd - 4, seg = bw / 3;
      ui.rect(x + 2, y2, bw, 5, '#13201e', '#0b0a0a');
      ui.rect(x + 2, y2, seg * 1.6, 5, G.EL.fire.col);
      const names = ['30 · Mầm', '120 · Thành hình', '300 · Thức tỉnh'], what = ['khoá hệ, tăng chỉ số', 'mở đặc trưng 1', 'mở đặc trưng 2'];
      for (let k = 0; k < 3; k++) {
        const mx = x + 2 + seg * (k + 1);
        ui.rect(mx - 1, y2 - 2, 2, 9, '#ffd23f');
        ui.text(names[k], mx - 3, y2 + 14, { size: 7, align: 'right', bold: true, color: '#ffd27a' });
        ui.text(what[k], mx - 3, y2 + 22, { size: 6.5, align: 'right', color: '#cfe8c8' });
      }
      // ba hệ, mỗi hệ một dòng
      let y3 = y2 + 34;
      ELS.forEach((el) => {
        const E = G.EL[el], F = G.HE_FEATURES[el];
        LK.icon(el, x + 4, y3 - 2.5, 0.9);
        ui.text(E.name + ': kết liễu quái ' + VERB[el], x + 11, y3, { size: 6.5, bold: true, color: E.col });
        ui.text('120: ' + F[0].name + ' · 300: ' + F[1].name, x + wd, y3, { size: 6.5, align: 'right', color: '#e8dfcc' });
        y3 += 9;
      });
      ui.text('Kết hợp hai hệ: sắp có', x, y3 + 3, { size: 7, bold: true, color: '#9fb0aa' });
    },
  };
})();
