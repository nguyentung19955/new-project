// Đồ rơi dễ nhìn (góp ý của chủ dự án: "đồ rơi trên bản đồ hơi khó nhìn, hình dạng ấy").
// Chỉ có phần hình và phần hút về; thưởng vẫn cộng sẵn như cũ (js/stage.js), đồ rơi trên sàn chỉ để thấy và nhặt cho vui tay.
//  - Mỗi loại một hình rõ, to hơn, viền tối 1 điểm ảnh, bóng dưới chân: vũ khí là hình thu nhỏ của vũ khí sống nằm nghiêng,
//    trang phục là hình món đồ, vàng là đống xu lấp lánh, nguyên liệu dùng đúng biểu tượng tài nguyên ở dải trên cùng (G.theme.RES).
//  - Đồ có bậc: cột sáng mảnh màu bậc (Lam, Tím, Vàng); đồ Vàng có thêm tia sáng xoay và lấp lánh; đồ thường chỉ ánh nhẹ.
//  - Rơi ra thì nảy lên rồi nảy nhẹ một lần, sau đó nhấp nhô tại chỗ. Lại gần thì hiện tên ngắn màu theo bậc; rất gần thì tự hút về.
// Đồ rơi vẽ ở lớp sàn (trước quái và em bé, trước khi chụp nền cho vùng báo trước) nên không che quái, không che vùng báo trước.
(function () {
  const G = window.G;
  const D = (G.doRoi = {});
  const OL = '#120c08';
  const TAU = Math.PI * 2;
  const NHAN = { linhkhi: 1, gold: 1, ore: 1, stone: 1, mat0: 1, mat1: 1, mat2: 1, shard0: 1, shard1: 1, shard2: 1, xp: 1 }; // loại hút xa
  const MAU_TRUM = ['#8ac84a', '#5ab0f0', '#ff8a4a']; // màu mảnh trùm theo vùng (Mộc Tinh, Ngư Tinh, Hồ Tinh)
  const cache = new Map();

  function canvas(w, h) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; return cv; }
  // Thêm viền tối 1 điểm ảnh quanh hình (vẽ bóng hình tối lệch 4 hướng rồi vẽ hình lên trên).
  function vien(src, pad) {
    const w = src.width + pad * 2, h = src.height + pad * 2, sil = canvas(w, h), sc = sil.getContext('2d');
    sc.drawImage(src, pad, pad); sc.globalCompositeOperation = 'source-in'; sc.fillStyle = OL; sc.fillRect(0, 0, w, h);
    const out = canvas(w, h), c = out.getContext('2d'); c.imageSmoothingEnabled = false;
    for (const d of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1]]) c.drawImage(sil, d[0], d[1]);
    c.drawImage(src, pad, pad);
    return out;
  }
  // Hình (đã viền) của một món, lưu lại theo khoá. Tâm hình ở giữa canvas.
  function hinh(o) {
    const k = khoa(o); let cv = cache.get(k); if (cv) return cv;
    const S = 22, src = canvas(S, S), c = src.getContext('2d'); c.imageSmoothingEnabled = false;
    try {
      // Vật phẩm có hình tự vẽ (Xưởng Sprite, js/sprite_custom.js) thì dùng hình đó.
      const tv = G.spriteCustom && G.spriteCustom.vatPham ? G.spriteCustom.vatPham(o.kind === 'linhkhi' ? 'linhkhi-' + o.el : o.kind) : null;
      if (tv) G.spriteCustom.veVatPham(c, tv, S / 2, S / 2, 18);
      else if (o.kind === 'weapon' && o.w && G.weaponArt && G.weaponArt.icon) {
        const wo = G.weaponArt.fromWeapon(o.w, { mood: 'calm', t: 0 });
        if (o.w.coat && !wo.branch) { wo.branch = o.w.coat; wo.stage = 1; }
        G.weaponArt.icon(c, wo, S / 2, S / 2, 18);
      } else if (o.kind === 'weapon' && o.w && G.art.weaponIcon) G.art.weaponIcon(c, o.w, S / 2, S / 2, 16);
      else if (o.kind === 'outfit' && o.o && G.outfit && G.outfit.drawIcon) G.outfit.drawIcon(c, o.o, S / 2, S / 2, 16);
      else if (o.kind === 'gold') dongXu(c, S / 2, S / 2 + 3);
      else if (o.kind === 'potion') binhMau(c, S / 2, S / 2);
      else if (o.kind === 'linhkhi') vienLinhKhi(c, S / 2, S / 2, o.el);
      else {
        const d = G.theme && G.theme.RES && G.theme.RES[o.kind];
        if (d) for (let j = 0; j < 7; j++) for (let i = 0; i < 7; i++) { const ch = d.rows[j][i]; if (ch !== '.' && d.pal[ch]) { c.fillStyle = d.pal[ch]; c.fillRect(4 + i * 2, 4 + j * 2, 2, 2); } }
        if (/^shard/.test(o.kind)) { c.fillStyle = '#ffffff'; c.fillRect(11, 8, 1, 3); } // vệt sáng trên mảnh vỡ
      }
    } catch (e) { /* thiếu hình thì để trống */ }
    cv = vien(src, 1); cache.set(k, cv);
    if (cache.size > 200) cache.delete(cache.keys().next().value);
    return cv;
  }
  // Viên linh khí: hạt tròn sáng màu hệ, lõi trắng (quái thường rơi, nhặt thì vũ khí đang cầm nhận dấu ấn).
  function vienLinhKhi(c, x, y, el) {
    const E = (G.EL && G.EL[el]) || { col: '#ffffff', col2: '#ffffff', dark: '#888888' };
    const px = (cx, cy, w, h, col) => { c.fillStyle = col; c.fillRect(cx, cy, w, h); };
    px(x - 3, y - 5, 6, 10, E.dark); px(x - 5, y - 3, 10, 6, E.dark);
    px(x - 2, y - 4, 4, 8, E.col); px(x - 4, y - 2, 8, 4, E.col);
    px(x - 1, y - 2, 2, 4, E.col2); px(x - 2, y - 1, 4, 2, E.col2); px(x - 1, y - 1, 1, 1, '#ffffff');
  }
  function khoa(o) {
    if (o.kind === 'weapon' && o.w) return 'w|' + (o.w.id || '') + '|' + o.w.type + '|' + (o.w.family || 0) + '|' + bac(o) + '|' + (o.w.branch || '') + '|' + (G.wStage ? G.wStage(o.w) : 0);
    if (o.kind === 'outfit' && o.o) return 'o|' + o.o.k + '|' + o.o.r + '|' + (o.o.lv || 1);
    if (o.kind === 'linhkhi') return 'lk|' + o.el;
    return o.kind;
  }
  // Đống xu vàng: ba đồng xu chồng lên nhau, mặt có lỗ vuông như tiền đồng.
  function dongXu(c, x, y) {
    const xu = (cx, cy) => {
      c.fillStyle = '#7a4a10'; c.fillRect(cx - 3, cy - 1, 7, 3); c.fillRect(cx - 2, cy - 2, 5, 5);
      c.fillStyle = '#ffd23f'; c.fillRect(cx - 2, cy - 1, 5, 2); c.fillRect(cx - 1, cy - 2, 3, 1);
      c.fillStyle = '#e0a020'; c.fillRect(cx - 2, cy + 1, 5, 1);
      c.fillStyle = '#fff6c0'; c.fillRect(cx - 1, cy - 1, 1, 1);
      c.fillStyle = '#7a4a10'; c.fillRect(cx + 1, cy - 1, 1, 1);
    };
    xu(x - 3, y); xu(x + 3, y); xu(x, y - 3); xu(x - 1, y + 2); xu(x + 2, y - 6);
  }
  function binhMau(c, x, y) {
    c.fillStyle = '#5a3a1e'; c.fillRect(x - 1, y - 7, 3, 2);
    c.fillStyle = '#e8e0d0'; c.fillRect(x - 2, y - 5, 5, 2);
    c.fillStyle = '#c4202c'; c.fillRect(x - 4, y - 3, 9, 8); c.fillRect(x - 3, y + 5, 7, 1);
    c.fillStyle = '#ff5a5a'; c.fillRect(x - 3, y - 2, 3, 3);
    c.fillStyle = '#ffffff'; c.fillRect(x - 3, y - 2, 1, 1);
  }
  // Bậc của món: vũ khí, trang phục theo bậc; mảnh trùm coi như Tím; còn lại 0.
  function bac(o) {
    if (o.kind === 'weapon' && o.w) return G.wRar ? G.wRar(o.w) : (o.w.rarity || o.w.tier || 0);
    if (o.kind === 'outfit' && o.o) return o.o.r || 0;
    if (/^shard/.test(o.kind)) return 2;
    return 0;
  }
  D.bac = bac;
  D.xoaNho = () => cache.clear(); // xoá hình đã nhớ (khi vừa có hình tự vẽ)
  function mauBac(o) {
    if (/^shard/.test(o.kind)) return MAU_TRUM[+o.kind.slice(-1)] || '#c88cff';
    const r = bac(o); return (G.RARITY[r] || G.RARITY[0]).col;
  }
  D.ten = function (o) {
    let s = o.kind === 'weapon' && o.w ? G.wName(o.w) : o.kind === 'outfit' && o.o && G.outfit ? G.outfit.name(o.o) : (o.s || '');
    s = String(s).replace(/^Nhặt được /, '');
    return s.length > 18 ? s.slice(0, 17) + '…' : s;
  };
  const px = (c, x, y, col, w, h) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w || 1, h || 1); };

  // Độ cao nảy: rơi ra trong 0,55 giây theo đường vòng (cao 20), nảy nhẹ lần hai, rồi nhấp nhô.
  function nay(o, t) {
    const age = t - (o.born || 0);
    if (age < 0.55) { const q = age / 0.55; return { q, lift: Math.sin(q * Math.PI) * 20 }; }
    if (age < 0.8) { const q = (age - 0.55) / 0.25; return { q: 1, lift: Math.sin(q * Math.PI) * 4 }; }
    return { q: 1, lift: 1.5 + Math.sin(t * 3.2 + o.x * 0.7) * 1.5 };
  }

  // Vẽ một món đồ rơi tại toạ độ thế giới. c: bút vẽ của sàn.
  D.ve = function (c, o) {
    const t = G.time, age = t - (o.born || 0);
    if (age < 0) return;
    const N = nay(o, t);
    let x = o.x, y = o.y;
    if (N.q < 1 && o.sx != null) { x = o.sx + (o.x - o.sx) * N.q; y = o.sy + (o.y - o.sy) * N.q; }
    let a = 1, lift = N.lift;
    if (o.got) { const q = Math.min(1, (t - o.got) / 0.35); a = 1 - q; lift += q * 10; }
    if (a <= 0) return;
    const r = bac(o), col = mauBac(o), ga = c.globalAlpha;
    const ix = Math.round(x), iy = Math.round(y - 9 - lift);
    c.save(); c.globalAlpha = ga * a;
    // bóng dưới chân, nhỏ lại khi nảy cao
    const sw = Math.max(3, 7 - lift * 0.15);
    c.fillStyle = 'rgba(0,0,0,0.38)'; c.beginPath(); c.ellipse(ix, Math.round(y) + 1, sw, 2.2, 0, 0, TAU); c.fill();
    // ánh dưới chân theo màu bậc (đồ thường: ánh trắng nhẹ)
    const pulse = 0.5 + 0.5 * Math.sin(t * 4 + o.x);
    c.globalAlpha = ga * a * (r ? 0.32 + 0.18 * pulse : 0.16 + 0.08 * pulse);
    c.fillStyle = col; c.beginPath(); c.ellipse(ix, Math.round(y), 9, 3.2, 0, 0, TAU); c.fill();
    // cột sáng mảnh bốc lên từ đồ có bậc
    if (r >= 1) {
      const H = 18 + r * 8;
      for (let j = 0; j < H; j++) {
        const f = 1 - j / H;
        c.globalAlpha = ga * a * f * (0.45 + 0.25 * pulse);
        px(c, ix - 1, iy - j, col, 3, 1);
        c.globalAlpha = ga * a * f * 0.8; px(c, ix, iy - j, '#ffffff', 1, 1);
      }
      // hạt sáng bay lên trong cột
      for (let i = 0; i < r + 1; i++) { const q = (t * 0.8 + i / (r + 1) + o.x * 0.01) % 1; c.globalAlpha = ga * a * (1 - q); px(c, ix - 2 + ((i * 3) % 5), iy - q * H, col, 1, 1); }
    }
    // đồ Vàng: tia sáng xoay quanh
    if (r >= 3) {
      c.globalAlpha = ga * a * 0.45;
      for (let i = 0; i < 6; i++) {
        const an = t * 1.4 + i * TAU / 6;
        for (let k = 7; k < 15; k++) px(c, ix + Math.cos(an) * k, iy + Math.sin(an) * k * 0.8, k < 10 ? '#fff6c0' : col, 1, 1);
      }
    }
    c.globalAlpha = ga * a;
    // hình món đồ (đã viền tối), vũ khí nằm nghiêng sẵn trong hình thu nhỏ
    const cv = hinh(o);
    c.imageSmoothingEnabled = false;
    c.drawImage(cv, ix - (cv.width >> 1), iy - (cv.height >> 1));
    // lấp lánh: đồ Vàng, vàng, mảnh trùm thường xuyên hơn
    const nhieu = r >= 3 || o.kind === 'gold' || /^shard/.test(o.kind);
    const nhip = Math.floor(t * (nhieu ? 5 : 2.5) + o.x * 0.3) % (nhieu ? 3 : 5);
    if (nhip === 0) {
      const sx = ix + ((Math.floor(t * 2 + o.y) % 3) - 1) * 4, sy = iy - 5 + (Math.floor(t * 3) % 2) * 3;
      px(c, sx - 1, sy, '#ffffff', 3, 1); px(c, sx, sy - 1, '#ffffff', 1, 3);
    }
    c.restore(); c.globalAlpha = ga;
  };

  // Tên ngắn màu theo bậc khi em bé lại gần (vẽ ở lớp giao diện). Không hiện khi có vùng báo trước ở gần, để khỏi che.
  D.nhan = function (W, P) {
    if (!W || !P || !G.ui) return;
    const cam = (W && W.cam) || 0;
    // chỉ hai món gần nhất, để chữ không chồng lên nhau
    const gan = [];
    for (const o of W.props) {
      if (o.type !== 'loot' || o.got || G.time < (o.born || 0) + 0.6) continue;
      const d = Math.hypot(o.x - P.x, (o.y - P.y) * 1.3);
      if (d <= 46) gan.push([d, o]);
    }
    gan.sort((p, q) => p[0] - q[0]);
    let n = 0;
    for (const [, o] of gan.slice(0, 2)) {
      if (W.zones && W.zones.some((z) => !z.dead && Math.hypot((z.x || 0) - o.x, (z.y || 0) - o.y) < (z.r || 30) + 20)) continue;
      const s = D.ten(o); if (!s) continue;
      const col = /^shard/.test(o.kind) || bac(o) ? mauBac(o) : '#fff3da';
      G.ui.text(s, o.x - cam, o.y - 30 - n * 8, { size: 6.5, align: 'center', bold: true, color: col }); n++;
    }
  };

  // Hút đồ về em bé: lại rất gần thì đồ bay về; vàng và nguyên liệu hút xa hơn. Chạm tới thì nhặt (thưởng đã cộng sẵn).
  D.hut = function (W, P, dt) {
    let nhat = false;
    for (const o of W.props) {
      if (o.type !== 'loot' || o.got || G.time < (o.born || 0) + 0.8) continue;
      const dx = P.x - o.x, dy = P.y - 4 - o.y, d = Math.hypot(dx, dy * 1.3);
      const R = (NHAN[o.kind] ? 44 : 24) + (P.pickR || 0);
      if (d < 9) { o.got = G.time; nhat = true; if (o.onPick) { try { o.onPick(); } catch (e) { /* bỏ qua */ } o.onPick = null; } continue; }
      if (d < R) {
        const v = (60 + 220 * (1 - d / R)) * dt;
        o.x += (dx / (d || 1)) * Math.min(v, d); o.y += (dy / (d || 1)) * Math.min(v, d);
        o.sx = null;
      }
    }
    if (nhat) G.sfx('pick', 1.2);
    for (const o of W.props) if (o.type === 'loot' && o.got && G.time - o.got > 0.4) o.dead = true;
    if (W.props.some((p) => p.dead && p.type === 'loot')) W.props = W.props.filter((p) => !(p.dead && p.type === 'loot'));
  };

  // Thả một món đồ rơi trên sàn tại (x, y) (chỗ quái gục), nảy ra một khoảng ngẫu nhiên. Chỉ để nhìn và nhặt: thưởng đã cộng.
  D.tha = function (W, x, y, it) {
    if (!W || !W.props) return null;
    const a = Math.random() * TAU, rr = 10 + Math.random() * 12;
    const nx = G.clamp(x + Math.cos(a) * rr, W.x0 + 8, W.x1 - 8), ny = G.clamp(y + Math.sin(a) * rr * 0.6, W.y0 + 8, W.y1 - 4);
    const o = Object.assign({ type: 'loot', x: nx, y: ny, sx: x, sy: y - 6, born: G.time }, it);
    W.props.push(o);
    return o;
  };
})();
