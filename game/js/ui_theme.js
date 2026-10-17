// Bộ giao diện chủ đề TRỐNG ĐỒNG ĐÔNG SƠN: đồng vàng, xanh ngọc đậm, đinh tán tròn, băng răng cưa, chim Lạc, vòng tròn đồng tâm.
// Tệp này chỉ thêm G.theme. Mọi hàm nhận toạ độ giao diện của game (480x270) và vẽ lên canvas giao diện (G.ux).
// Phần hình là pixel vẽ sẵn vào canvas đệm (vẽ một lần, dùng lại), phần chữ vẽ nét bằng G.ui.text nên dễ đọc trên điện thoại.
//   btn, sbtn, tab, round            nút to (thường / đang bấm / mờ), nút nhỏ, thẻ chuyển mục, nút tròn mặt trống
//   panel, inset, dim                khung bảng có tiêu đề, ô con trong bảng, màn tối phía sau bảng
//   bar                              thanh máu, mana, kinh nghiệm, máu trùm (có vạch khắc)
//   slot                             ô đồ viền theo bốn bậc Thường / Lam / Tím / Vàng
//   stageCard                        thẻ ải mặt trống: đã qua kèm sao / đang chọn / chưa mở
//   toast, topBar, dialog, card      dải thông báo, dải tài nguyên trên cùng, khung thoại người làng, khung thẻ màn kết quả
(function () {
  'use strict';
  const G = (window.G = window.G || {});
  const ui = G.ui;
  const T = (G.theme = {});
  const C = (T.C = {
    dk: '#1a120a', brD: '#5a3d1a', br: '#a8752f', gold: '#d9a441', hi: '#f6dc92', pat: '#3f8f7f', patL: '#6fc1a8', patD: '#1f4f4a',
    bg: '#12292a', bg2: '#17363a', cop: '#8a2f22', copL: '#b8452f', ink: '#fff0c4', sub: '#a9c2b4', text: '#f1e6c6',
  });
  const RAR = (T.RAR = ['#b9b1a2', '#4aa3ff', '#b36bff', '#ffc83d']); // viền sáng bốn bậc
  const RARD = (T.RARD = ['#6b655c', '#1f5fae', '#6a2fb0', '#a8741a']); // nền tối bốn bậc
  T.RAR_TEXT = ['#d6d2c8', '#6fb2ff', '#c88cff', '#ffd24a']; // màu chữ tên theo bậc

  // ---------- đồ vẽ pixel vào canvas đệm ----------
  let g = null;
  const cache = new Map();
  function layer(key, w, h, fn) {
    let cv = cache.get(key);
    if (cv && G.VE_NHE !== false) { cache.delete(key); cache.set(key, cv); } // soát mượt phiên 3 mục 22: dùng gần nhất xếp cuối (LRU)
    if (!cv) {
      if (cache.size > 700) {
        if (G.VE_NHE !== false) { let n = 0; for (const k of cache.keys()) { cache.delete(k); if (++n >= 80) break; } } // xoá dần 80 tấm lâu không dùng, không xoá sạch (khựng)
        else cache.clear();
      }
      cv = document.createElement('canvas'); cv.width = Math.max(1, Math.round(w)); cv.height = Math.max(1, Math.round(h));
      g = cv.getContext('2d'); fn(); cache.set(key, cv);
    }
    return cv;
  }
  function put(cv, x, y, alpha) {
    const c = G.ux, sm = c.imageSmoothingEnabled, ga = c.globalAlpha;
    c.imageSmoothingEnabled = false; if (alpha != null) c.globalAlpha = ga * alpha;
    c.drawImage(cv, Math.round(x), Math.round(y), cv.width, cv.height);
    c.imageSmoothingEnabled = sm; c.globalAlpha = ga;
  }
  T.clearCache = () => cache.clear();
  // ---------- ảnh AI cho hình lớn (phiên C3; trang tools/tach-giao-dien, lô "Hình lớn") ----------
  // Mã tệp: gd-nut-noi-chuyen, -sang, -bam (64×64) · gd-the-ai, -chon, -khoa (35×34, 14/10: bia đá, vẽ theo cỡ ảnh + neo mặt đồng) · gd-the-trum, -chon, -khoa (40×41) · gd-trong-dong (42×42).
  // Có tệp thì vẽ ảnh; không có thì vẽ code y như cũ (không đổi một điểm ảnh). Thiếu tệp trạng thái (-sang, -bam, -chon, -khoa) mà có tệp thường
  // thì game tự làm sáng / làm tối từ tệp thường. Ảnh KHÔNG đi qua bộ nhớ đệm `cache` ở trên: mỗi lần vẽ đều hỏi SC.gdSan,
  // nên ảnh nạp xong lúc nào hiện lúc đó, gỡ tệp ra thì về hình code ngay.
  const gdCo = (ma) => { const SC = G.spriteCustom; return SC && SC.gdSan && SC.veGd ? SC.gdSan(ma) : null; };
  const GD_BIEN = typeof WeakMap !== 'undefined' ? new WeakMap() : null; // ảnh thường -> { sang, toi } (bản game tự làm, nhớ theo từng ảnh)
  function gdBien(g0, kieu) {
    if (!g0 || !GD_BIEN) return null;
    let b = GD_BIEN.get(g0); if (!b) { b = {}; GD_BIEN.set(g0, b); }
    if (b[kieu] !== undefined) return b[kieu];
    let kq = null;
    try {
      const cv = document.createElement('canvas'); cv.width = g0.pw; cv.height = g0.ph;
      const x = cv.getContext('2d', { willReadFrequently: true }); x.drawImage(g0.img, 0, 0);
      const d = x.getImageData(0, 0, cv.width, cv.height), q = d.data;
      for (let i = 0; i < q.length; i += 4) {
        if (!q[i + 3]) continue;
        if (kieu === 'toi') { const l = (q[i] * 0.299 + q[i + 1] * 0.587 + q[i + 2] * 0.114) / 255; q[i] = 28 + 48 * l; q[i + 1] = 44 + 66 * l; q[i + 2] = 42 + 60 * l; } // xám xanh như thẻ "chưa mở" vẽ code (#1c2c2a → #4c6e66)
        else { q[i] += (255 - q[i]) * 0.28; q[i + 1] += (240 - q[i + 1]) * 0.28; q[i + 2] += (196 - q[i + 2]) * 0.28; } // sáng lên, ngả vàng nhạt (#fff0c4)
      }
      x.putImageData(d, 0, 0);
      kq = Object.assign({}, g0, { img: cv, ghep9: new Map() });
    } catch (e) { kq = null; }
    b[kieu] = kq;
    return kq;
  }
  function gdVe(ga, x, y, w, h, alpha) {
    const c = G.ux, a0 = c.globalAlpha;
    if (alpha != null) c.globalAlpha = a0 * alpha;
    G.spriteCustom.veGd(c, ga, x, y, w, h);
    c.globalAlpha = a0;
  }
  T.gdHinhLon = { co: gdCo, bien: gdBien }; // cho công cụ và bài kiểm tra
  const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const P = (x, y, c) => R(x, y, 1, 1, c);
  function hash(x, y) { let n = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; }
  function frame(x, y, w, h, c, t) { t = t || 1; R(x, y, w, t, c); R(x, y + h - t, w, t, c); R(x, y, t, h, c); R(x + w - t, y, t, h, c); }
  function rr(x, y, w, h, c, cut) { cut = cut == null ? 1 : cut; for (let i = 0; i < h; i++) { const d = Math.max(0, cut - i, cut - (h - 1 - i)); R(x + d, y + i, w - 2 * d, 1, c); } }
  function ell(cx, cy, rx, ry, c) { for (let dy = -Math.ceil(ry); dy <= Math.ceil(ry); dy++) { const k = 1 - (dy * dy) / (ry * ry + ry * 0.6); if (k < 0) continue; const hw = Math.round(rx * Math.sqrt(k)); R(cx - hw, cy + dy, hw * 2 + 1, 1, c); } }
  const disc = (cx, cy, r, c) => ell(cx, cy, r, r, c);
  function ring(cx, cy, r, th, c) { for (let dy = -r - 1; dy <= r + 1; dy++) for (let dx = -r - 1; dx <= r + 1; dx++) { const d = Math.sqrt(dx * dx + dy * dy); if (d <= r + 0.4 && d > r - th + 0.4) P(cx + dx, cy + dy, c); } }
  function bmp(x, y, rows, pal, flip, s) { s = s || 1; for (let j = 0; j < rows.length; j++) for (let i = 0; i < rows[j].length; i++) { const ch = rows[j][i]; if (ch === '.' || !pal[ch]) continue; R(x + (flip ? rows[j].length - 1 - i : i) * s, y + j * s, s, s, pal[ch]); } }
  function star(cx, cy, r, n, c, inner) { // ngôi sao nhiều cánh giữa mặt trống
    inner = inner || 0.45;
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const d = Math.sqrt(dx * dx + dy * dy); if (d > r) continue;
      let a = (Math.atan2(dy, dx) + Math.PI / 2) / (2 * Math.PI) * n; a = Math.abs((a % 1 + 1) % 1 - 0.5) * 2;
      if (d <= r * (inner + (1 - inner) * (1 - a))) P(cx + dx, cy + dy, c);
    }
  }
  const BM = {
    sword: ['.........ss.', '........sds.', '.......sds..', '......sds...', '.....swks...', '....sds.....', '.h.sds......', '.hhds.......', '..hhh.......', '.hh.hh......', 'hh..........'],
    lock: ['.aaa.', 'a...a', 'a...a', 'aaaaa', 'aa.aa', 'aa.aa', 'aaaaa'],
    lac: ['.....aa........', '....aaa....a...', 'a..aaaa...aaa..', 'aaaaaaaaaaaaaaa', '.aaaaaaaa......', '...aa.aa.......', '...a...a.......'], // chim Lạc
    coc: ['..aa.aa..', '.ahaaaha.', 'aaaaaaaaa', 'aadaaadaa', '.aa...aa.', 'aa.....aa'], // cóc ngồi góc bảng
    thuyen: ['....a...a...a...a.....', '...aaa.aaa.aaa.aaa..aa', 'a...a...a...a...a..aa.', 'aa.aaa.aaa.aaa.aaa.aa.', '.aaaaaaaaaaaaaaaaaaa..', '..aaaaaaaaaaaaaaaaa...'],
    slash: ['......aaa.', '....aaaaaa', '..aaa...aa', '.aa......a', 'aa........', 'a.........', 'aa........', '.aaa......'],
    flame: ['....a....', '...aa....', '...aaa.a.', '.a.aaaaa.', '.aaabaaa.', 'aaabbbaaa', 'aabbbbbaa', 'aabbcbbaa', '.aabbbaa.', '..aaaaa..'],
    dash: ['...a.....', '....aa...', 'aaaaaaa..', 'aaaaaaaa.', 'aaaaaaa..', '....aa...', '...a.....'],
    talk: ['.aaaaaaaaaa.', 'aaaaaaaaaaaa', 'aakkaakkaaka', 'aaaaaaaaaaaa', 'aakkkkkkaaaa', 'aaaaaaaaaaaa', '.aaaaaaaaaa.', '...aaa......', '..aa........', '.a..........'],
    star: ['...a...', '...a...', 'aaaaaaa', '.aaaaa.', '.aaaaa.', '.aa.aa.', 'a.....a'],
    boat: ['......a.....', '.....aa.....', '....aaa.....', '...aaaa.....', '..aaaaa.....', '......a.....', 'bbbbbbbbbbbb', '.bbbbbbbbbb.', '..bbbbbbbb..'],
  };
  function icon(name, cx, cy, pal, s) { const b = BM[name]; s = s || 1; bmp(Math.round(cx - (b[0].length * s) / 2), Math.round(cy - (b.length * s) / 2), b, pal, false, s); }
  function saw(x, y, w, col, up) { // băng răng cưa
    for (let i = 0; i + 4 <= w; i += 4) { if (up) { R(x + i, y + 2, 4, 1, col); R(x + i + 1, y + 1, 2, 1, col); P(x + i + 1, y, col); } else { R(x + i, y, 4, 1, col); R(x + i + 1, y + 1, 2, 1, col); P(x + i + 2, y + 2, col); } }
  }
  function circles(x, y, w, col, dot) { // vòng tròn có chấm giữa nối tiếp nhau
    for (let i = 0; i + 6 <= w; i += 6) { R(x + i + 1, y, 3, 1, col); R(x + i + 1, y + 4, 3, 1, col); R(x + i, y + 1, 1, 3, col); R(x + i + 4, y + 1, 1, 3, col); P(x + i + 2, y + 2, dot || col); P(x + i + 5, y + 4, col); P(x + i + 5, y, col); }
  }
  function drum(cx, cy, r, o) { // mặt trống: sao nhiều cánh và các vành đồng tâm
    o = o || {};
    const a = o.dull ? '#35524c' : C.br, b = o.dull ? '#4c6e66' : C.gold, d = o.dull ? '#1c2c2a' : C.dk, m = o.dull ? '#26403c' : (o.mid || C.patD);
    disc(cx, cy, r, d); disc(cx, cy, r - 1, a); ring(cx, cy, r - 1, 1, o.lit ? C.hi : b);
    disc(cx, cy, r - 3, d); disc(cx, cy, r - 4, m);
    if (r >= 14) { for (let k = 0; k < 16; k++) { const an = (k * Math.PI) / 8; P(cx + Math.round(Math.cos(an) * (r - 5)), cy + Math.round(Math.sin(an) * (r - 5)), b); } ring(cx, cy, r - 7, 1, a); }
    star(cx, cy, Math.round(r * 0.62), o.n || 12, o.lit ? C.hi : b, 0.5);
    disc(cx, cy, Math.round(r * 0.3), o.core || d);
  }

  // Mặt trống lớn làm hình trang trí (màn tiêu đề). alpha: độ đậm.
  T.drum = function (cx, cy, r, alpha) {
    const ga = gdCo('gd-trong-dong'); // phiên C3: có ảnh thì vẽ ảnh vào đúng ô của hình code (42×42 khi r = 20)
    if (ga) { gdVe(ga, Math.round(cx - r - 1), Math.round(cy - r - 1), r * 2 + 2, r * 2 + 2, alpha); return; }
    put(layer('drum|' + r, r * 2 + 2, r * 2 + 2, () => { drum(r + 1, r + 1, r, { n: 14 }); ring(r + 1, r + 1, Math.round(r * 0.8), 1, C.br); for (let k = 0; k < 24; k++) { const an = (k * Math.PI) / 12; disc(r + 1 + Math.round(Math.cos(an) * r * 0.72), r + 1 + Math.round(Math.sin(an) * r * 0.72), 1, C.gold); } }), cx - r - 1, cy - r - 1, alpha); 
  };

  // ---------- chạm ----------
  function lighten(col, k) { const n = parseInt(String(col).slice(1), 16); if (isNaN(n)) return col; const f = (v) => ('0' + Math.round(v + (255 - v) * k).toString(16)).slice(-2); return '#' + f((n >> 16) & 255) + f((n >> 8) & 255) + f(n & 255); }
  const heldIn = (x, y, w, h) => (G.coTro ? G.coTro((q) => !q.role && !q.stale && G.inRect(q, x, y, w, h)) : [...G.pointers.values()].some((q) => !q.role && !q.stale && G.inRect(q, x, y, w, h)));
  // Phiên giao diện 12/10 — VÙNG CHẠM TỐI THIỂU 44 pt: nút nào có vùng chạm nhỏ hơn T.CHAM_MIN (31 đơn vị ≈ 44 pt trên iPhone cầm ngang,
  // 1 đơn vị ≈ 1,44 pt) thì được nới VÔ HÌNH ra cho đủ (hình nút giữ nguyên). Không chồng nhau: chạm trúng hình thật của một nút thì chỉ
  // nút đó nhận; chạm vào phần nới thì nút có hình gần ngón tay nhất nhận (so với mọi nút đã vẽ ở khung trước).
  // Cờ tắt: G.CHAM44 = false hoặc ?cham44=0 (vùng chạm như cũ).
  let tat44 = false;
  try { tat44 = /[?&]cham44=0\b/i.test(String(window.location && window.location.search)); } catch (e) { tat44 = false; }
  if (G.CHAM44 == null) G.CHAM44 = !tat44;
  T.CHAM_MIN = 31;
  // Rà soát C (12/10): 31 đơn vị chỉ đủ 44 pt khi 1 đơn vị ≥ 1,42 pt. Trên iPhone thật có vùng an toàn (tai thỏ 47 pt mỗi bên, thanh Home 21 pt)
  // hoặc iPhone SE thì khung game nhỏ lại (1 đơn vị ≈ 1,32–1,37 pt) nên 31 đơn vị chỉ còn 41–42 pt. Nay vùng chạm tối thiểu tính theo cỡ
  // khung thật: đủ 44 pt ở mọi máy (không dưới 31, không quá 40 đơn vị). Hình nút giữ nguyên. Tắt cùng cờ G.CHAM44.
  T.chamMin = () => { const s = G.scale || 0; return G.RSC !== false && s > 0 ? G.clamp(Math.ceil((44 / s) * 2) / 2, T.CHAM_MIN, 40) : T.CHAM_MIN; };
  // Cờ CHỮ RÕ (phiên 12/10): chữ tràn / nhỏ / thuật ngữ khó hiểu (số linh khí vừa ô, "chọn em bé", "trận này chưa nhận linh khí",
  // dòng thưởng có tên, xưng "cháu" ở màn thua, dấu phẩy thập phân, máu không âm, ẩn thẻ "Rèn đồ" cũ, dấu báo ở làng chỉ khi làm được...).
  // Tắt: G.CHU_RO = false hoặc ?churo=0 (về chữ cũ).
  let tatChu = false;
  try { tatChu = /[?&]churo=0\b/i.test(String(window.location && window.location.search)); } catch (e) { tatChu = false; }
  if (G.CHU_RO == null) G.CHU_RO = !tatChu;
  // Cờ RÀ SOÁT C (phiên Rà soát toàn bộ, phần C — giao diện điện thoại + bản đồ, 12/10): vùng chạm 44 pt theo cỡ khung thật,
  // chữ tiếng Việt trên nút tự thu cho vừa nút, cặp chữ hai dòng trên nút cao canh giữa, các thẻ Bà Hàng Xén rộng theo chữ,
  // ô mẹo đáy phòng mờ đi khi có người/quái/vùng báo đòn bên dưới, bóng mờ em bé khi đứng sau vật che ở làng.
  // Tắt: G.RSC = false hoặc ?rsc=0 (về như trước phiên).
  let tatRsc = false;
  try { tatRsc = /[?&]rsc=0\b/i.test(String(window.location && window.location.search)); } catch (e) { tatRsc = false; }
  if (G.RSC == null) G.RSC = !tatRsc;
  let NUT = [], NUT0 = [];
  const no = (r) => { const m = T.chamMin(), dw = Math.max(0, m - r[2]) / 2, dh = Math.max(0, m - r[3]) / 2; return [r[0] - dw, r[1] - dh, r[2] + dw * 2, r[3] + dh * 2]; };
  const xa = (p, r) => Math.hypot(Math.max(r[0] - p.x, 0, p.x - r[0] - r[2]), Math.max(r[1] - p.y, 0, p.y - r[1] - r[3]));
  const cung = (a, b) => Math.abs(a[0] - b[0]) < 0.5 && Math.abs(a[1] - b[1]) < 0.5 && Math.abs(a[2] - b[2]) < 0.5 && Math.abs(a[3] - b[3]) < 0.5;
  // r: vùng chạm cũ (đã gồm lề pad), v: hình thật của nút. Mỗi mục trong NUT0: [hình thật, vùng chạm đã nới].
  function trungNoi(p, r, v) {
    const e = no(r);
    if (!G.inRect(p, e[0], e[1], e[2], e[3])) return false;
    const d0 = xa(p, v);
    for (const q of NUT0) {
      if (cung(q[0], v)) continue;
      if (G.inRect(p, q[0][0], q[0][1], q[0][2], q[0][3])) return false; // chạm trúng hình thật của nút khác
      const eq = q[1];
      if (G.inRect(p, eq[0], eq[1], eq[2], eq[3]) && xa(p, q[0]) < d0) return false; // nút khác gần ngón tay hơn
    }
    return true;
  }
  T.vungCham = (x, y, w, h) => (G.CHAM44 ? no([x, y, w, h]) : [x, y, w, h]); // cho bài kiểm tra
  T.nutKhungTruoc = () => NUT0.slice();
  function ghiNut(x, y, w, h, v) { if (G.CHAM44 && NUT.length < 300) NUT.push([v || [x, y, w, h], no([x, y, w, h])]); }
  // v (tuỳ chọn): hình thật của nút khi (x, y, w, h) đã gồm lề pad.
  function clicked(x, y, w, h, v) {
    if (!G.CHAM44) {
      if (G.click && G.inRect(G.click, x, y, w, h)) { G.click = null; if (G.sfx) G.sfx('ui'); return true; }
      return false;
    }
    v = v || [x, y, w, h];
    const r = [x, y, w, h];
    if (NUT.length < 300) NUT.push([v, no(r)]);
    if (!G.click) return false;
    const p = G.click;
    let ok;
    if (G.inRect(p, v[0], v[1], v[2], v[3])) ok = true; // trúng hình thật
    else ok = trungNoi(p, r, v); // trúng lề pad cũ hoặc phần nới: chỉ nhận khi không trúng hình nút khác và là nút gần nhất
    if (ok) { G.click = null; if (G.sfx) G.sfx('ui'); return true; }
    return false;
  }
  T.hit = clicked;
  // Phản hồi chạm chung cho mọi nút (VFX Phase 5): đang giữ thì nút lún xuống (như cũ), thả tay thì nút nảy lên 1 điểm
  // trong chốc lát rồi về chỗ. key: vị trí và cỡ nút. Theo G.VFX.giaoDien (0 = không nảy).
  const PF = new Map();
  function pressFx(key, held) {
    const gd = G.VFX ? +G.VFX.giaoDien : 1;
    if (!(gd > 0)) return 0;
    const now = (window.performance && performance.now ? performance.now() : Date.now()) / 1000;
    let s = PF.get(key);
    if (!s) { if (PF.size > 300) PF.clear(); s = { h: held, up: -9 }; PF.set(key, s); }
    if (s.h && !held) s.up = now;
    s.h = held;
    const q = (now - s.up) / 0.16;
    return q >= 0 && q < 1 ? -1 : 0;
  }
  T.pressFx = pressFx;
  const txt = (s, x, y, o) => ui.text(s, x, y, o);
  // Chữ trên nút khi KHÔNG phải tiếng Việt: bản dịch dài hơn bề rộng nút thì thu cỡ chữ dần (không dưới 6,5), vẫn tràn thì cắt "…".
  // Tiếng Việt không đi qua đây (nút y hệt như cũ). Trả về [chữ, cỡ].
  function vua(label, w, size, bold) {
    let s = G.tv(String(label)); const c = G.ux;
    for (;;) {
      ui.font(size, bold, true);
      if (c.measureText(s).width <= w || size <= 6.5) break;
      size = Math.max(6.5, size - 0.5);
    }
    if (c.measureText(s).width > w) { while (s.length > 2 && c.measureText(s + '…').width > w) s = s.slice(0, -1); s = s.trimEnd() + '…'; }
    return [s, size];
  }
  T.vua = vua;
  // Vẽ chữ nút: tiếng Việt vẽ thẳng, ngôn ngữ khác thì qua vua() để không tràn nút.
  function nhan(label, cx, y, w, o) {
    if (G.LANG === 'vi' || !G.tv) {
      // Rà soát C: tiếng Việt cũng thu chữ khi chữ dài hơn nút (máy thật dùng phông Be Vietnam Pro rộng hơn phông dự phòng,
      // nên chữ vừa khít trên máy thử có thể lòi ra ngoài nút trên iPhone). Vừa thì vẽ y như cũ. Bỏ qua chữ có số (có thể là
      // "số + tài nguyên" được vẽ thành biểu tượng, đo bằng chữ sẽ dài hơn thật).
      if (G.RSC !== false && w > 0 && !/\d/.test(String(label))) {
        ui.font(o.size, o.bold, o.tiny);
        if (G.ux.measureText(String(label)).width > w + 0.5) {
          let size = o.size || 9;
          for (;;) { ui.font(size, o.bold, true); if (G.ux.measureText(String(label)).width <= w || size <= 6.5) break; size = Math.max(6.5, size - 0.5); }
          return txt(label, cx, y + (size - (o.size || 9)) * 0.36, Object.assign({}, o, { size, tiny: true }));
        }
      }
      return txt(label, cx, y, o);
    }
    const q = vua(label, w, o.size, o.bold);
    txt(q[0], cx, y + (q[1] - o.size) * 0.36, Object.assign({}, o, { size: q[1], tiny: true }));
  }

  // ---------- nút to ----------
  // o: { primary: nút chính (đỏ đồng), sel: đang được chọn, danger: việc nguy hiểm, disabled, size, sub, subSize, pad: nới vùng chạm, color }
  // Cao từ 22 trở lên thì có hai băng răng cưa; thấp hơn thì là nút nhỏ viền chấm. Trả về true khi vừa được bấm.
  T.btn = function (x, y, w, h, label, o) {
    o = o || {};
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    const pad = o.pad || 0, dis = !!o.disabled, st = dis ? 2 : heldIn(x - pad, y - pad, w + pad * 2, h + pad * 2) ? 1 : 0;
    const tone = o.primary ? 'p' : o.danger ? 'd' : o.sel ? 's' : o.gold ? 'g' : o.purple ? 'v' : o.fill ? 'c' : 'n';
    const gn = nutAnh(tone, dis, st); // 14/10: nút ảnh AI (gd-nut-*), không có thì vẽ code như cũ
    const cv = gn ? null : layer('b|' + w + '|' + h + '|' + st + '|' + tone + (o.fill || ''), w, h + 3, () => {
      const yo = st === 1 ? 1 : 0, y0 = yo;
      if (st !== 1) rr(0, 2, w, h, 'rgba(0,0,0,0.5)', 2);
      rr(0, y0, w, h, dis ? '#232c2a' : C.dk, 2);
      rr(1, y0 + 1, w - 2, h - 2, dis ? '#4a5c57' : tone === 's' ? C.gold : C.br, 2);
      if (!dis && st !== 1) R(3, y0 + 1, w - 6, 1, C.hi);
      R(2, y0 + 2, w - 4, h - 4, dis ? '#2b3634' : C.dk);
      const base = { p: [C.cop, C.copL], d: ['#5a1f1a', '#7a2a22'], s: ['#2f6a60', C.pat], g: ['#6a4a12', '#8a6420'], v: ['#4a2a6a', '#6a3a9a'], c: [o.fill, lighten(o.fill || '#000000', 0.25)], n: [C.patD, C.pat] }[tone];
      const cc = dis ? '#333f3c' : base[st === 1 ? 1 : 0], tooth = dis ? '#56706a' : C.gold;
      if (h >= 22) { saw(3, y0 + 2, w - 6, tooth, false); saw(3, y0 + h - 5, w - 6, tooth, true); R(2, y0 + 5, w - 4, h - 10, cc); }
      else { R(2, y0 + 3, w - 4, h - 6, cc); for (let i = 3; i < w - 3; i += 2) { P(i, y0 + 2, tooth); P(i, y0 + h - 3, tooth); } }
      if (st === 1) R(2, y0 + (h >= 22 ? 5 : 3), w - 4, 1, 'rgba(0,0,0,0.45)');
      if (w >= 70 && h >= 16) for (const ex of [4, w - 9]) ring(ex + 2, y0 + (h >> 1), 2, 1, tooth); // đinh tán tròn hai đầu
    });
    const dy = pressFx('b' + x + '|' + y + '|' + w + '|' + h, st === 1);
    if (gn) khungDat(lopNut(gn, w, h, st), x, y + dy, w, h + 3); else put(cv, x, y + dy);
    const toi = !!gn && tone === 's' && !dis; // nút ảnh "đang chọn" màu vàng: chữ nâu sẫm cho rõ
    const y0 = y + dy + (st === 1 ? 1 : 0) - (o.sub && h >= 28 && G.RSC !== false ? 1 : 0), size = o.size || (h >= 26 ? 10 : 9), col = dis ? '#8fa49e' : toi ? '#3a1a08' : C.ink; // Rà soát C: nút cao có hai dòng chữ: nâng 1 để dòng dưới không chạm răng cưa
    if (label || o.sub) { // chu-lech-khung: chữ (và dòng phụ) trong lòng nút
      const subCol = dis ? '#8fa49e' : toi ? '#5a3010' : '#e8d9a8';
      const vc = h >= 22 ? [5, w >= 70 && h >= 16 ? 10 : 2, 5, w >= 70 && h >= 16 ? 10 : 2] : [3, w >= 70 && h >= 16 ? 10 : 2, 3, w >= 70 && h >= 16 ? 10 : 2];
      const kh = { khung: gn ? MA_NUT[tone] : null, vien: vc, size, bold: true, color: col, shadow: toi ? false : undefined, dy: dy + (st === 1 ? 1 : 0), trongVien: !!o.trongVien }; // trongVien: nút lớn ở làng, chữ trong viền ảnh
      if (label) T.chuTrongKhung(label, x, y, w, h, Object.assign(kh, o.sub ? { phu: { s: o.sub, size: o.subSize || 7, bold: false, color: subCol, shadow: toi ? false : undefined } } : { dong: h >= 26 ? 2 : 1 }));
      else T.chuTrongKhung(o.sub, x, y, w, h, Object.assign(kh, { size: o.subSize || 7, bold: false, color: subCol }));
    }
    if (o.dot) { // 16/10 (ve-tay-8-gop-giao-dien): chấm "có mới" ảnh gd-cham-moi; ?vecode=1 / chưa có ảnh: code
      const c = G.ux, dm = G.spriteCustom && G.spriteCustom.gdThay ? G.spriteCustom.gdThay('gd-cham-moi') : null;
      if (dm) G.spriteCustom.veGd(c, dm, x + w - 6.5, y - 0.5, 7, 7);
      else { c.beginPath(); c.arc(x + w - 3, y + 3, 3, 0, 7); c.fillStyle = '#ff5a3a'; c.fill(); c.lineWidth = 0.8; c.strokeStyle = C.dk; c.stroke(); }
    }
    if (dis) { ghiNut(x - pad, y - pad, w + pad * 2, h + pad * 2, [x, y, w, h]); return false; } // nút mờ vẫn giữ chỗ (không để nút bên cạnh nhận chạm trúng nó)
    return clicked(x - pad, y - pad, w + pad * 2, h + pad * 2, [x, y, w, h]);
  };
  // ---------- nút nhỏ (Xem, Đổi, Học...) ----------
  T.sbtn = function (x, y, w, h, label, o) {
    o = o || {};
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    const pad = o.pad == null ? 3 : o.pad, dis = !!o.disabled, st = dis ? 2 : heldIn(x - pad, y - pad, w + pad * 2, h + pad * 2) ? 1 : 0;
    const tone = o.primary ? 'p' : o.danger ? 'd' : o.sel ? 's' : 'n';
    const gn = nutAnh(tone, dis, st); // 14/10: nút ảnh AI (gd-nut-*), không có thì vẽ code như cũ
    const cv = gn ? null : layer('s|' + w + '|' + h + '|' + st + '|' + tone, w, h + 2, () => {
      const y0 = st === 1 ? 1 : 0;
      if (st !== 1) rr(0, 1, w, h, 'rgba(0,0,0,0.5)', 2);
      rr(0, y0, w, h, C.dk, 2); rr(1, y0 + 1, w - 2, h - 2, dis ? '#4a5c57' : st === 1 || tone === 's' ? C.gold : C.br, 2);
      if (!dis) R(3, y0 + 1, w - 6, 1, C.hi);
      const base = { p: [C.cop, C.copL], d: ['#5a1f1a', '#7a2a22'], s: ['#2f6a60', C.pat], n: [C.patD, C.pat] }[tone];
      R(2, y0 + 3, w - 4, h - 6, dis ? '#333f3c' : base[st === 1 ? 1 : 0]);
      R(2, y0 + 3, 1, h - 6, dis ? '#56706a' : C.gold); R(w - 3, y0 + 3, 1, h - 6, dis ? '#56706a' : C.gold);
    });
    const dy = pressFx('s' + x + '|' + y + '|' + w + '|' + h, st === 1);
    if (gn) khungDat(lopNut(gn, w, h, st), x, y + dy, w, h + 3); else put(cv, x, y + dy);
    const size = o.size || 8, toi = !!gn && tone === 's' && !dis;
    if (label) T.chuTrongKhung(label, x, y, w, h, { khung: gn ? MA_NUT[tone] : null, vien: [3, 3, 3, 3], dong: h >= 26 ? 2 : 1, size, bold: true, color: dis ? '#8fa49e' : toi ? '#3a1a08' : C.ink, shadow: toi ? false : undefined, dy: dy + (st === 1 ? 1 : 0) }); // chu-lech-khung
    if (o.dot) { const c = G.ux; c.beginPath(); c.arc(x + w - 2, y + 2, 2.6, 0, 7); c.fillStyle = '#ff5a3a'; c.fill(); c.lineWidth = 0.7; c.strokeStyle = C.dk; c.stroke(); }
    if (dis) { ghiNut(x - pad, y - pad, w + pad * 2, h + pad * 2, [x, y, w, h]); return false; } // nút mờ vẫn giữ chỗ (không để nút bên cạnh nhận chạm trúng nó)
    return clicked(x - pad, y - pad, w + pad * 2, h + pad * 2, [x, y, w, h]);
  };
  // Thẻ chuyển mục trong bảng (Mài / Nâng bậc / ...): thẻ đang mở màu đỏ đồng
  T.tab = function (x, y, w, h, label, active, o) { return T.btn(x, y, w, h, label, Object.assign({ primary: !!active, size: 8 }, o || {})); };

  // ---------- nút tròn mặt trống ----------
  // kind: 'talk' | 'atk' | 'skill' | 'sp' | 'dodge' | 'boat'. o: { lit, pressed, dim, label }
  T.round = function (cx, cy, r, kind, o) {
    o = o || {}; r = Math.round(r);
    const st = o.pressed ? 1 : 0, lit = !!o.lit, dull = !!o.dim && !lit;
    const sz = r * 2 + 8;
    // Phiên C3: nút "Nói chuyện" / "Vào cổng" bằng ảnh. Tệp thường = nút lúc nghỉ; -sang = có người ở gần; -bam = đang bấm.
    // Thiếu -bam thì dùng ảnh sáng; thiếu -sang thì game tự làm sáng tệp thường. Game tự dịch nút xuống 1 điểm khi bấm và tự viết chữ.
    const tenGd = 'gd-nut-noi-chuyen';
    const ga = kind !== 'talk' ? null : dull || !(lit || st) ? gdCo(tenGd) : (st ? gdCo(tenGd + '-bam') : null) || gdCo(tenGd + '-sang') || gdBien(gdCo(tenGd), 'sang');
    const cv = ga ? null : layer('r|' + r + '|' + kind + '|' + st + '|' + (lit ? 1 : 0) + (dull ? 1 : 0), sz, sz, () => {
      const c0 = r + 3, cyy = r + 3 + st;
      if (!st) disc(c0 + 1, cyy + 2, r, 'rgba(0,0,0,0.5)');
      const mid = kind === 'atk' || kind === 'talk' || kind === 'boat' ? C.cop : kind === 'skill' ? '#7a5a14' : kind === 'sp' ? '#1f4f7a' : C.patD;
      if (lit) for (let k = 0; k < 32; k++) { const an = (k * Math.PI) / 16; P(c0 + Math.round(Math.cos(an) * (r + 2)), cyy + Math.round(Math.sin(an) * (r + 2)), C.hi); }
      drum(c0, cyy, r, { mid, lit: lit || st === 1, n: kind === 'atk' || kind === 'talk' ? 14 : 10, core: mid, dull });
      const ir = Math.round(r * 0.52);
      disc(c0, cyy, ir, dull ? '#1c2c2a' : C.dk); disc(c0, cyy, ir - 1, dull ? '#26403c' : lit ? C.copL : mid);
      const s = r >= 22 ? 2 : 1, hasLab = !!o.label;
      icon(kind === 'atk' ? 'sword' : kind === 'skill' ? 'flame' : kind === 'sp' ? 'slash' : kind === 'talk' ? 'talk' : kind === 'boat' ? 'boat' : 'dash', c0, cyy - (hasLab ? 3 : 0), { a: dull ? '#7f948e' : '#fff0c4', b: dull ? '#7f948e' : '#ffb347', c: '#fff', s: '#fff6dc', d: '#c9b383', h: C.gold, w: '#fff', k: dull ? '#26403c' : '#3a1a12' }, hasLab ? 1 : s);
    });
    const dy = pressFx('r' + Math.round(cx) + '|' + Math.round(cy) + '|' + r, st === 1);
    if (ga) gdVe(ga, Math.round(cx - r - 3), Math.round(cy - r - 3 + dy) + st, sz, sz, dull ? 0.5 : 1);
    else put(cv, cx - r - 3, cy - r - 3 + dy, dull ? 0.5 : 1);
    if (o.label) {
      const c = G.ux; ui.font(8, true); c.textAlign = 'center'; c.lineWidth = 2.2; c.lineJoin = 'round'; c.strokeStyle = 'rgba(20,10,6,0.9)'; c.strokeText(o.label, cx, cy + dy + st + 10.5);
      txt(o.label, cx, cy + dy + st + 10.5, { size: 8, bold: true, align: 'center', color: '#fff6dc', shadow: false });
    }
  };

  // ---------- khung bảng ----------
  // o: { rightPad: chừa chỗ cho nút đóng ở góc phải, plain: bảng nhỏ không có cóc và chim Lạc, noBand: không có băng vòng tròn phía dưới }
  T.panel = function (x, y, w, h, title, o) {
    o = o || {};
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    let twd = 0;
    if (title) { ui.font(11, true); twd = Math.ceil(G.ux.measureText(title).width); }
    // 14/10: khung bảng ảnh AI (gd-khung-bang): viền ảnh phủ từ x - 3 tới x + w + 3 (như viền code), lòng nâu; tiêu đề có vạch đồng bên dưới
    const gp = khungCo('gd-khung-bang');
    if (gp) {
      const kp = T.kBang(w, h);
      khungDat(khungLop(gp, 'bang|' + w + '|' + h + '|' + (title ? 1 : 0) + '|' + kp, w + 6, h + 7, () => {
        const gb = G.gop8Bat && G.gop8Bat() ? khungCo('gd-bong-khung') : null; // vẽ tay 8 gộp: bóng đổ 9 mảnh (?gop8=0: mảng tối phẳng)
        if (gb) khungVe(gb, 2, 3, w + 4, h + 4); else R(2, 3, w + 4, h + 4, 'rgba(0,0,0,0.45)');
        khungVeK(gp, 0, 0, w + 6, h + 6, kp);
        if (title) R(3 + 12, 3 + 19, w - 24, 1, C.br);
      }), x - 3, y - 3, w + 6, h + 7);
      if (title) tieuDe(title, x, y, w, h, o, true);
      return;
    }
    const cv = layer('p|' + w + '|' + h + '|' + twd + '|' + (o.rightPad || 0) + (o.plain ? 'p' : '') + (o.noBand ? 'n' : ''), w + 6, h + 7, () => {
      const X = 3, Y = 3;
      R(X + 2, Y + 3, w, h, 'rgba(0,0,0,0.45)');
      R(X, Y, w, h, C.dk); R(X + 1, Y + 1, w - 2, h - 2, C.br); R(X + 1, Y + 1, w - 2, 1, C.hi); R(X + 1, Y + 1, 1, h - 2, C.gold);
      R(X + 3, Y + 3, w - 6, h - 6, C.dk); R(X + 4, Y + 4, w - 8, h - 8, C.bg);
      for (let j = 4; j < h - 4; j += 2) for (let i = 4 + (j % 4); i < w - 4; i += 4) if (hash(i, j) < 0.18) P(X + i, Y + j, C.bg2);
      const th = title ? 19 : 9;
      if (title || !o.plain) { R(X + 4, Y + th, w - 8, 1, C.br); saw(X + 6, Y + th + 1, w - 12, C.brD, false); }
      if (!o.noBand && h > 60) { circles(X + 7, Y + h - 10, w - 14, C.br, C.gold); R(X + 4, Y + h - 12, w - 8, 1, C.brD); }
      if (title && !o.plain) { // chim Lạc bay và thuyền người chèo trên băng tiêu đề
        let bx = X + 16 + twd; const end = X + w - (o.rightPad || 10);
        for (let n = 0; bx + 24 < end; n++) { if (n % 3 === 2) { bmp(bx, Y + 9, BM.thuyen, { a: C.brD }); bx += 28; } else { bmp(bx, Y + 8, BM.lac, { a: C.brD }); bx += 21; } }
      }
      // đinh tán tròn bốn góc; bảng lớn có thêm cóc ngồi
      const cp = { a: C.gold, h: C.hi, d: C.brD };
      if (!o.plain && w > 150) { bmp(X - 2, Y - 3, BM.coc, cp); bmp(X + w - 7, Y - 3, BM.coc, cp, true); bmp(X - 2, Y + h - 4, BM.coc, cp); bmp(X + w - 7, Y + h - 4, BM.coc, cp, true); }
      else for (const q of [[X + 1, Y + 1], [X + w - 4, Y + 1], [X + 1, Y + h - 4], [X + w - 4, Y + h - 4]]) { R(q[0], q[1], 3, 3, C.dk); P(q[0] + 1, q[1] + 1, C.hi); }
    });
    put(cv, x - 3, y - 3);
    if (title) tieuDe(title, x, y, w, h, o, false);
  };
  // Tiêu đề bảng: chữ trái từ x + 9 như cũ, nằm trong dải tiêu đề (từ lòng khung tới vạch đồng dưới tiêu đề ở y + 19), không vượt lòng phải
  // (trừ o.rightPad: chỗ nút đóng). Dài thì thu cỡ (11 → 8), vẫn dài thì cắt "…".
  function tieuDe(title, x, y, w, h, o, anh) {
    const r = x + w - (o.rightPad || 0);
    // khung ảnh phủ từ (x - 3, y - 3) cỡ (w + 6, h + 6); khung code viền 4
    if (anh) T.chuTrongKhung(title, x - 3, y - 3, w + 6, h + 6, { khung: 'gd-khung-bang', kKhung: T.kBang(w, h), vung: [x + 7, y, r - x - 7, 19.5], align: 'left', size: 11, min: 8, bold: true, color: C.hi });
    else T.chuTrongKhung(title, x, y, w, h, { vien: [4, 4, 4, 4], vung: [x + 7, y, r - x - 7, 19.5], align: 'left', size: 11, min: 8, bold: true, color: C.hi });
  }
  // Ô con trong bảng. sel: đang chọn (viền vàng sáng). o: { col: màu viền riêng, fill }
  T.inset = function (x, y, w, h, sel, o) {
    o = o || {};
    const c = G.ux;
    if (oConAnh(x, y, w, h, sel, o)) return; // 15/10 (khung-gd-con): ô con bằng ảnh gd-o-con / gd-o-con-chon
    c.fillStyle = o.fill || (sel ? '#2f6a60' : '#1b3a3b'); c.fillRect(x, y, w, h);
    c.fillStyle = o.col || (sel ? C.hi : C.brD);
    c.fillRect(x, y, w, 1); c.fillRect(x, y + h - 1, w, 1); c.fillRect(x, y, 1, h); c.fillRect(x + w - 1, y, 1, h);
    if (sel) { c.fillStyle = C.gold; c.fillRect(x + 1, y + 1, w - 2, 1); c.fillRect(x + 1, y + h - 2, w - 2, 1); c.fillRect(x + 1, y + 1, 1, h - 2); c.fillRect(x + w - 2, y + 1, 1, h - 2); }
  };
  T.dim = function (a) { ui.rect(-(G.mx || 0) - 2, -(G.my || 0) - 2, 484 + (G.mx || 0) * 2, 274 + (G.my || 0) * 2, 'rgba(6,14,14,' + (a == null ? 0.6 : a) + ')'); };
  // Tấm nền nhỏ cho chữ nổi trên cảnh (tên phòng, thử thách, bản đồ nhỏ, vạch linh khí, lời chỉ dẫn...).
  // Giai đoạn 4 (yêu cầu 2): mọi khung nhỏ của HUD dùng chung một kiểu — viền mảnh 1 điểm (đồng, mép trên sáng hơn),
  // lòng gỗ sẫm hơi trong để thấy cảnh phía sau, đinh vàng nhạt ở bốn góc. o: { a: độ đậm lòng (0..1), edge: màu viền riêng }
  T.plate = function (x, y, w, h, o) {
    o = o || {};
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    const a = o.a == null ? 0.84 : o.a, edge = o.edge || C.br;
    if (khungNhoAnh(x, y, w, h, a)) return; // 15/10 (khung-gd-con): khung nhỏ bằng ảnh gd-khung-nho
    put(layer('pl2|' + w + '|' + h + '|' + a + '|' + edge, w, h, () => {
      rr(0, 0, w, h, C.dk, 1);
      rr(1, 1, w - 2, h - 2, edge, 1);
      R(2, 1, w - 4, 1, lighten(edge, 0.35)); // mép trên sáng: như ánh đèn rọi xuống
      R(2, 2, w - 4, h - 4, 'rgba(22,15,10,' + a + ')');
      R(2, 2, w - 4, 1, 'rgba(0,0,0,0.35)');
      if (w >= 24 && h >= 12) for (const q of [[2, 2], [w - 3, 2], [2, h - 3], [w - 3, h - 3]]) P(q[0], q[1], C.gold);
    }), x, y);
  };
  T.UI = { wood: '#16100b', woodL: '#2a1d14', ink: C.ink, gold: C.gold, hi: C.hi, br: C.br, dk: C.dk, sub: '#cbbd9e' }; // màu HUD (docs/vfx/BANG-MAU.md mục 5)

  // ---------- Làn C5: khung co giãn 9 mảnh bằng ảnh AI (trang tools/tach-giao-dien, lô "Khung 9 mảnh") ----------
  // Mã tệp: gd-o-do-0..3 và gd-o-do-0..3-chon (ô đồ theo bậc) · gd-khung-mau, gd-khung-mana, gd-khung-xp (vỏ thanh) ·
  // gd-khung-trum, gd-khung-trum-nho, gd-khung-tinh-anh (tấm khung tên + máu của trùm vùng, trùm nhỏ, tinh anh) · gd-the-thuong (thẻ).
  // Mỗi tệp có "vien" [trên, phải, dưới, trái] (điểm ảnh game): SC.veGd cắt 9 mảnh, bốn góc giữ nguyên cỡ, cạnh và ruột co giãn theo cỡ đích.
  // Ảnh chỉ là VIỀN KHUNG, giữa để trống. Game vẫn tự vẽ: bóng đổ, màu lót trong lòng khung, lòng thanh (phần đổ màu, vạch khắc, phần tụt dần),
  // chữ, hình món đồ. Không có tệp, hoặc G.KHUNG_ANH === false (cờ tắt): vẽ code y như cũ, không đổi một điểm ảnh.
  // Lớp ghép (bóng + lót + ảnh) nhớ THEO TỪNG ẢNH (WeakMap): ảnh nạp xong, đổi hay gỡ thì lớp cũ tự bỏ theo, không cần xoá bộ nhớ đệm bằng tay.
  const KHUNG_LOP = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  const khungCo = (ma) => (G.KHUNG_ANH === false || !KHUNG_LOP ? null : gdCo(ma));
  // 14/10 (vũ khí cũ còn sót, mục 9): bỏ ô đồ theo bậc màu cũ gd-o-do-1..3 (+ -chon) — ô vũ khí nay theo bậc ép đồ (js/ep_do.js), chỉ còn ô thường bậc 0.
  T.MA_KHUNG = ['gd-o-do-0', 'gd-o-do-0-chon',
    'gd-khung-mau', 'gd-khung-mana', 'gd-khung-xp', 'gd-khung-trum', 'gd-khung-trum-nho', 'gd-khung-tinh-anh', 'gd-the-thuong',
    // 15/10 (khung-gd-con): 9 khung còn vẽ code -> ảnh
    'gd-khung-nho', 'gd-dai-thong-bao', 'gd-o-con', 'gd-o-con-chon', 'gd-the-nho', 'gd-khung-vach-lk', 'gd-khung-vach-lk-moc',
    'gd-thanh-cuon', 'gd-thanh-cuon-num', 'gd-khung-canh-bao', 'gd-the-sap-co', 'gd-khung-mau-quai']; // cho công cụ và bài kiểm tra
  // Dựng một lớp w × h (điểm ảnh game) ở đúng độ nét của ảnh ga; ve() vẽ bằng R, rr, frame (toạ độ game) và khungVe.
  function khungLop(ga, key, w, h, ve) {
    let m = KHUNG_LOP.get(ga); if (!m) { m = new Map(); KHUNG_LOP.set(ga, m); }
    let cv = m.get(key);
    if (!cv) {
      if (m.size > 48) m.clear(); // 15/10: 24 -> 48 (T.plate ảnh có nhiều cỡ trong một khung hình)
      const N = ga.net || 1;
      cv = document.createElement('canvas'); cv.width = Math.max(1, Math.round(w * N)); cv.height = Math.max(1, Math.round(h * N));
      g = cv.getContext('2d'); g.imageSmoothingEnabled = false; g.setTransform(N, 0, 0, N, 0, 0);
      ve(); m.set(key, cv);
    }
    return cv;
  }
  const khungVe = (ga, x, y, w, h) => G.spriteCustom.veGd(g, ga, x, y, w, h); // dán ảnh 9 mảnh vào lớp đang dựng
  function khungDat(cv, x, y, w, h, alpha) {
    const c = G.ux, sm = c.imageSmoothingEnabled, a0 = c.globalAlpha;
    c.imageSmoothingEnabled = w * (G.uiScale || 1) < cv.width - 0.5; // như SC.veGd: phóng to giữ điểm ảnh sắc cạnh, thu nhỏ thì làm mịn
    if (alpha != null && alpha !== 1) c.globalAlpha = a0 * alpha;
    c.drawImage(cv, x, y, w, h);
    c.imageSmoothingEnabled = sm; c.globalAlpha = a0;
  }
  // ---------- 14/10 (YEU-CAU-TRUM-NHO-HIEU-UNG-GIAO-DIEN mục 3): 4 khung giao diện ảnh AI 9 mảnh ----------
  // gd-khung-bang (T.panel) · gd-nut-thuong / -chinh / -nguy / -chon (T.btn, T.sbtn, T.tab theo tông thường / chính / nguy / chọn) ·
  // gd-khung-thoai (T.dialog) · gd-thanh-tren + gd-thanh-tren-vach (T.topBar). Dựng: docs/review/ke-hoach-cai-thien/trum-moi/cong-cu/dung-khung-giao-dien.py.
  // Chỉ thay KHUNG: chữ, biểu tượng, vùng chạm, toạ độ giữ như cũ. Thiếu tệp hoặc cờ tắt thì vẽ code y như cũ.
  // Cờ tắt: ?khunganh=0 (G.KHUNG_ANH = false; cờ này tắt luôn các khung 9 mảnh Làn C5 ở trên).
  if (G.KHUNG_ANH === undefined) { let tat = false; try { tat = /[?&]khunganh=0(&|$)/.test(String(window.location && window.location.search)); } catch (e) { tat = false; } if (tat) G.KHUNG_ANH = false; }
  // Dán ảnh 9 mảnh vào lớp đang dựng. Ô nhỏ hơn tổng hai góc thì thu ĐỀU cả hình (góc không bị bẹp một chiều).
  function khungVeDeu(ga, x, y, w, h) {
    const v = ga.vien || [0, 0, 0, 0], k = Math.min(1, h / (v[0] + v[2] + 2), w / (v[1] + v[3] + 2));
    if (k >= 1) return khungVe(ga, x, y, w, h);
    g.save(); g.translate(x, y); g.scale(k, k);
    try { khungVe(ga, 0, 0, w / k, h / k); } finally { g.restore(); }
  }
  // thu đều cả ảnh khung k lần (viền mỏng đi, ô giữ nguyên cỡ)
  function khungVeK(ga, x, y, w, h, k) {
    if (!(k < 1)) return khungVeDeu(ga, x, y, w, h);
    g.save(); g.translate(x, y); g.scale(k, k);
    try { khungVeDeu(ga, 0, 0, w / k, h / k); } finally { g.restore(); }
  }
  // chu-lech-khung: bảng THẤP / HẸP (thẻ thông tin ải 226×60, hộp hỏi...) có viền ảnh dày 10 điểm → nửa (5 điểm) để chữ đặt như cũ vẫn trong lòng.
  T.kBang = (w, h) => (Math.min(w, h) < 90 ? 0.5 : 1);
  const MA_NUT = { n: 'gd-nut-thuong', p: 'gd-nut-chinh', d: 'gd-nut-nguy', s: 'gd-nut-chon' };
  // ảnh nút theo tông (nút mờ: bản tối xám xanh; đang bấm: bản sáng do game tự làm). Tông khác (vàng kim, tím, màu riêng): null → vẽ code.
  function nutAnh(tone, dis, st) {
    const g0 = MA_NUT[tone] ? khungCo(MA_NUT[tone]) : null;
    if (!g0) return null;
    return dis ? gdBien(g0, 'toi') || g0 : st === 1 ? gdBien(g0, 'sang') || g0 : g0;
  }
  // lớp nút ảnh: bóng đổ như nút code, ảnh 9 mảnh (đang bấm thì thấp xuống 1 điểm)
  const lopNut = (ga, w, h, st) => khungLop(ga, 'nut|' + w + '|' + h + '|' + st, w, h + 3, () => { if (st !== 1) rr(0, 2, w, h, 'rgba(0,0,0,0.5)', 2); khungVeDeu(ga, 0, st === 1 ? 1 : 0, w, h); });

  // ---------- 15/10 (docs/review/ke-hoach-cai-thien/chu-lech-khung): CHỮ NẰM TRONG LÒNG KHUNG ----------
  // `vien` của ảnh là ô cắt 9 mảnh (gồm núm / hoa văn góc), không phải độ dày viền. LÒNG THẬT của từng ảnh khung đo sẵn bằng
  // chu-lech-khung/cong-cu/do-long-khung.py: mỗi hàng ảnh (điểm ảnh ẢNH, từ hàng y0) một đoạn lòng [trái, phải). T.longKhung đổi bảng đó
  // theo đúng cách game cắt 9 mảnh + thu đều (khungVeDeu) ra đoạn lòng ở từng hàng của khung đã co giãn. T.chuTrongKhung đặt chữ:
  // trong lòng trừ 2 điểm đệm, căn giữa ngang và dọc theo hộp chữ thật của phông (khối chữ hoa căn giữa, rồi đẩy cho dấu / chân chữ
  // không chạm viền), chữ dài: thu cỡ tới tối thiểu → xuống dòng (nơi đủ cao) → cuối cùng mới cắt "…".
  // 15/10 don-tep B: bỏ cờ quay lui ?chucu=1 (G.CHU_CU) — luôn đặt chữ trong lòng khung. T.chuMoi giữ lại (luôn true) cho mã nơi khác còn gọi.
  const chuMoi = () => true;
  // 16/10 (docs/review/ke-hoach-cai-thien/can-chu-khung): chữ nằm GIỮA khung — sửa công thức căn dọc (khối chữ hoa bị đẩy xuống nửa cao chữ hoa),
  // các dòng căn trái / phải của một khối dùng chung một lề, và vài nơi gọi tự đặt chữ. Cờ quay lui ?canchucu=1 (G.CAN_CHU_CU = true): như trước.
  if (G.CAN_CHU_CU === undefined) { let cu = false; try { cu = /[?&]canchucu=1(&|$)/.test(String(window.location && window.location.search)); } catch (e) { cu = false; } G.CAN_CHU_CU = cu; }
  const canMoi = () => G.CAN_CHU_CU !== true;
  T.canMoi = canMoi;
  // ma: [net, rộng ảnh, cao ảnh, hàng đầu y0, "trái,phải ..." mỗi hàng ảnh] — do do-long-khung.py --ghi tự ghi, không sửa tay
  const LONG_BANG = {
    // <LONG>
    'gd-nut-thuong': [2, 126, 48, 10, '21,105 21,105 21,105 25,105 28,103 20,108 19,108 14,111 14,112 14,112 13,112 13,113 13,114 13,114 13,114 13,113 14,113 14,112 15,111 15,110 17,108 20,106 23,105 28,98 28,97 28,105 26,105 26,105 26,105'],
    'gd-nut-chinh': [2, 126, 48, 9, '26,100 26,104 26,104 26,104 26,104 28,98 20,106 19,107 17,108 15,110 15,111 14,111 14,112 13,113 13,113 13,113 13,112 14,112 15,110 15,110 16,110 19,107 20,105 28,97 29,97 29,97 29,97 29,97 30,97'],
    'gd-nut-nguy': [2, 126, 48, 9, '26,100 22,100 22,100 22,100 22,100 28,99 20,106 19,108 17,109 16,111 15,111 14,111 14,112 13,113 13,113 13,113 14,113 14,112 15,112 16,111 16,110 18,107 21,105 27,97 27,97 29,97 29,97 29,97 29,96'],
    'gd-nut-chon': [2, 126, 48, 8, '29,97 29,97 26,104 26,104 26,104 26,104 28,98 20,106 19,107 18,108 15,110 15,111 14,111 14,112 14,112 14,112 14,112 14,112 14,111 15,110 16,110 16,109 19,107 20,105 28,97 29,97 29,97 29,97 29,97 30,97'],
    'gd-khung-bang': [2, 352, 104, 20, '38,323 32,324 32,325 31,325 31,326 31,327 24,328 22,330 20,331 20,331 20,331 20,329 20,333 20,333 19,333 19,333 19,333 19,333 19,333 19,333 20,333 20,333 20,332 20,332 20,332 19,332 19,332 19,332 19,332 19,332 19,332 19,332 19,332 19,332 19,332 19,333 19,333 19,333 19,332 19,332 19,332 19,332 19,332 19,332 19,332 19,332 19,332 19,332 19,332 19,332 19,332 19,332 19,332 19,332 20,332 21,331 21,330 23,326 24,326 25,326 25,326 26,325 27,324 35,317 65,304'],
    'gd-khung-thoai': [2, 274, 80, 17, '33,210 33,214 27,247 27,248 23,252 23,252 23,252 23,251 20,253 20,253 19,253 19,256 19,256 19,256 19,256 19,256 19,256 19,256 19,256 19,256 19,256 19,256 19,254 19,255 19,256 19,256 19,256 19,256 19,255 19,254 19,256 19,256 19,256 19,256 19,256 19,253 20,253 20,252 22,252 23,252 23,252 26,249 26,249 27,242 27,241 29,215'],
    'gd-khung-nho': [2, 128, 38, 3, '10,118 10,118 10,118 7,121 6,121 6,121 6,122 3,125 3,125 3,125 3,125 3,125 3,125 3,125 3,125 3,125 3,125 3,125 3,125 3,125 3,125 3,125 3,125 3,125 3,125 6,122 6,122 7,121 7,121 10,118 10,118 10,118'],
    'gd-dai-thong-bao': [2, 218, 36, 8, '29,191 26,191 26,193 23,195 23,195 23,195 23,195 23,195 23,195 23,195 23,195 23,195 26,195 24,195 23,195 23,195 23,195 24,195 24,195 24,195'],
    'gd-the-thuong': [2, 64, 64, 9, '13,50 13,50 13,50 13,50 13,51 12,52 8,56 8,56 8,56 8,56 8,56 8,56 8,56 8,56 8,56 8,56 8,56 8,56 8,56 8,56 8,56 8,56 8,56 8,56 8,56 8,56 8,56 8,56 8,56 8,56 8,56 8,56 8,56 8,56 8,56 8,56 8,56 8,56 8,56 8,56 12,51 13,50 13,50 13,50 13,50 13,50'],
    'gd-the-nho': [2, 78, 20, 5, '8,72 5,72 4,74 4,74 4,75 5,75 5,75 5,74 7,73 10,68'],
    'gd-the-sap-co': [2, 64, 20, 2, '7,56 7,56 5,56 5,56 5,56 12,53 9,54 9,54 9,54 9,54 15,54 9,56 9,56 9,56 9,56 13,56 13,56'],
    'gd-thanh-tren': [2, 122, 32, 6, '31,88 29,92 28,93 28,93 28,93 28,94 28,94 27,94 27,95 26,95 26,95 26,95 27,95 28,93 28,93 29,92 29,92 29,92 30,92 31,91'],
    'gd-khung-canh-bao': [2, 168, 38, 8, '12,156 12,156 10,158 10,158 10,158 10,158 10,158 10,158 10,158 10,158 10,158 10,157 10,157 10,157 10,158 10,158 10,158 10,158 10,158 10,157 12,157 13,156'],
    'gd-o-con': [2, 68, 66, 7, '11,57 11,57 11,57 11,57 10,59 7,61 7,61 7,61 7,61 7,61 7,61 7,61 7,61 7,61 7,61 7,61 7,61 7,61 7,61 7,61 7,61 7,61 7,61 7,61 7,61 7,61 7,61 7,61 7,61 7,61 7,61 7,61 7,61 7,61 7,61 7,61 7,61 7,61 7,61 7,61 7,61 7,61 7,61 7,61 7,61 7,61 7,61 7,61 10,58 11,57 11,57'],
    'gd-o-con-chon': [2, 70, 68, 8, '12,57 12,57 12,58 11,58 8,61 8,61 8,62 8,62 8,62 8,62 8,62 8,62 8,62 8,62 8,62 8,62 8,62 8,62 8,62 8,62 8,62 8,62 8,62 8,62 8,62 8,62 8,62 8,62 8,62 8,62 8,62 8,62 8,62 8,62 8,62 8,62 8,62 8,62 8,62 8,62 8,62 8,62 8,62 8,62 8,62 8,62 8,61 11,60 12,58 12,57 12,57'],
    'gd-khung-trum': [2, 120, 60, 7, '24,96 24,96 24,96 24,96 24,97 22,98 22,98 21,99 20,100 18,102 15,104 10,110 10,110 10,110 10,110 10,110 10,110 10,110 10,110 10,110 10,110 10,110 10,110 10,110 10,110 10,110 10,110 10,110 10,110 10,110 10,110 10,110 10,110 10,110 10,110 15,105 18,102 20,101 21,99 22,98 23,98 23,97 24,96 24,96 24,96 24,96'],
    'gd-khung-trum-nho': [2, 104, 52, 7, '17,87 17,87 16,88 16,88 14,90 13,91 11,93 8,96 8,96 8,96 8,96 8,96 8,96 8,96 8,96 8,96 8,96 8,96 8,96 8,96 8,96 8,96 8,96 8,96 8,96 8,96 8,96 8,96 8,96 8,96 8,96 11,93 14,90 15,89 16,88 16,88 17,87 17,87'],
    'gd-khung-tinh-anh': [2, 88, 44, 6, '11,77 11,77 10,78 9,79 6,82 5,83 5,83 5,83 5,83 5,83 5,83 5,83 5,83 5,83 5,83 5,83 5,83 5,83 5,83 5,83 5,83 5,83 5,83 5,83 5,83 5,83 5,83 9,79 10,78 11,77 11,77 11,77'],
    'gd-o-do-0': [2, 64, 64, 12, '14,50 13,51 12,52 12,52 12,52 12,52 12,52 12,52 12,52 12,52 12,52 12,52 12,52 12,52 12,52 12,52 12,52 12,52 12,52 12,52 12,52 12,52 12,52 12,52 12,52 12,52 12,52 12,52 12,52 12,52 12,52 12,52 12,52 12,52 12,52 12,52 12,52 12,52 13,51 14,50'],
    'gd-khung-ban-do': [2, 760, 484, 60, '62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 62,698 63,697'],
    'gd-bong-thoai': [1, 64, 28, 1, '6,59 4,61 4,61 2,62 1,63 1,63 1,63 1,63 1,63 1,63 1,63 1,63 1,63 1,63 1,63 1,63 1,63 1,63 1,63 1,63 1,63 2,62 2,62 4,61 4,61 6,59'],
    // </LONG>
  };
  const LONG_DOC = {};
  T.coLong = (ma) => !!LONG_BANG[ma]; // cho công cụ soát (can-chu-khung): khung có bảng lòng đo sẵn
  function longBang(ma, ga) {
    let b = LONG_DOC[ma];
    if (b === undefined) {
      const q = LONG_BANG[ma];
      b = q ? { net: q[0], pw: q[1], ph: q[2], y0: q[3], r: q[4].split(' ').map((s) => s.split(',').map(Number)) } : null;
      LONG_DOC[ma] = b;
    }
    if (b && ga && (b.pw !== ga.pw || b.ph !== ga.ph)) return null; // ảnh đã đổi mà chưa đo lại: dùng vien
    return b;
  }
  // Đoạn lòng của khung ảnh ma vẽ ở cỡ w × h (toạ độ trong khung, điểm game). Trả về { top, bot, span(a, b) → [trái, phải] | null } hoặc null (không có ảnh).
  const LONG_NHO_MAP = new Map();
  T.longKhung = function (ma, w, h, kEp, vEp) {
    const ga0 = ma ? khungCo(ma) : null;
    if (!ga0 || !(w > 0) || !(h > 0)) return null;
    const ga = vEp ? gaVien(ga0, vEp) : ga0; // vEp: nơi vẽ dùng ô cắt 9 mảnh khác tệp (viền giữ cỡ, không giãn theo chiều cao)
    const key = ma + '|' + w + '|' + h + '|' + (kEp || '') + '|' + (vEp || '');
    let L = LONG_NHO_MAP.get(key);
    if (L && L.ga === ga) return L;
    const v = ga.vien || [0, 0, 0, 0], N = ga.net || 1, pw = ga.pw, ph = ga.ph;
    const k = Math.min(1, kEp || 1, h / (v[0] + v[2] + 2), w / (v[1] + v[3] + 2)), W = w / k, H = h / k; // kEp: nơi vẽ thu đều ảnh (ô con nhỏ)
    const b = longBang(ma, ga0);
    const hangAnh = (sy) => { // đoạn lòng ở hàng ảnh sy (ảnh gốc)
      if (b) { const r = b.r[Math.floor(sy) - b.y0]; return r || null; }
      return sy >= v[0] * N && sy < ph - v[2] * N ? [v[3] * N, pw - v[1] * N] : null; // không có bảng: lòng = trong vien
    };
    const giuaW = pw - (v[1] + v[3]) * N, dW = W - v[1] - v[3];
    const doiX = (px, phai) => { // điểm ảnh ẢNH -> điểm game trong khung ảo W × H
      if (!phai && px <= v[3] * N) return px / N;
      if (phai && px >= pw - v[1] * N) return W - (pw - px) / N;
      return v[3] + (giuaW > 0 ? ((px - v[3] * N) / giuaW) * dW : dW / 2);
    };
    const hangGame = (ty) => { // ty: hàng trong khung ảo
      // góc trên / dưới giữ cỡ; hàng giữa co giãn (hoặc lặp) theo tỉ lệ
      const giuaH = ph - (v[0] + v[2]) * N, dH = H - v[0] - v[2];
      const sy = ty < v[0] ? ty * N : ty >= H - v[2] ? ph - (H - ty) * N : v[0] * N + (dH > 0 ? ((ty - v[0]) / dH) * giuaH : giuaH / 2);
      const q = sy >= 0 && sy < ph ? hangAnh(sy) : null;
      return q ? [doiX(q[0], false), doiX(q[1], true)] : null;
    };
    let top = null, bot = null;
    for (let t = 0; t < H; t += 0.5) if (hangGame(t + 0.25)) { if (top == null) top = t; bot = t + 0.5; }
    L = {
      ga, k, top: top == null ? h / 2 : top * k, bot: bot == null ? h / 2 : bot * k,
      span(a, bb) { // phần chung đoạn lòng các hàng từ a tới bb (toạ độ trong khung thật)
        let l = -1e9, r = 1e9;
        for (let t = Math.max(0, a); t <= Math.min(h, bb) + 1e-6; t += 0.5) {
          const q = hangGame(Math.min(H - 0.01, (t + (t >= bb ? -0.01 : 0)) / k));
          if (!q) return null;
          l = Math.max(l, q[0] * k); r = Math.min(r, q[1] * k);
        }
        return r > l ? [l, r] : null;
      },
      // "lòng giữa": như span nhưng mọi hàng lấy theo dải hàng giữa (bỏ qua đinh / góc vuông nhỏ trong lòng ở hàng góc).
      // Chỉ dùng cho khung quá nhỏ, trước khi phải cắt "…" (vẫn không chạm mây / viền hai đầu và viền trên / dưới).
      spanGiua(a, bb) {
        if (a < (top == null ? 0 : top * k) - 1e-6 || bb > (bot == null ? h : bot * k) + 1e-6) return null;
        const m0 = Math.min(h / 2, v[0] * k), m1 = Math.max(h / 2, h - v[2] * k);
        return this.span(Math.max(Math.min(a, m1), m0), Math.min(Math.max(bb, m0), m1));
      },
    };
    if (LONG_NHO_MAP.size > 400) LONG_NHO_MAP.clear();
    LONG_NHO_MAP.set(key, L);
    return L;
  };
  // Lòng của khung vẽ code (không có ảnh / ?khunganh=0): hình chữ nhật trong viền [trên, phải, dưới, trái].
  const longCode = (w, h, vc) => ({ top: vc[0], bot: h - vc[2], span: (a, b) => (a < vc[0] - 1e-6 || b > h - vc[2] + 1e-6 ? null : [vc[3], w - vc[1]]) });
  T.longCode = longCode;
  // Lòng trong viền "vien" của ảnh khung (9 mảnh: góc giữ cỡ, thu đều khi khung nhỏ hơn hai viền như T.longKhung). null nếu lòng quá nhỏ.
  function longVien(ga, w, h) {
    const v = ga.vien, k = Math.min(1, h / (v[0] + v[2] + 2), w / (v[1] + v[3] + 2)), vc = v.map((q) => q * k);
    return h - vc[0] - vc[2] >= 9 && w - vc[1] - vc[3] >= 18 ? longCode(w, h, vc) : null;
  }
  // ---------- 17/10 (docs/review/ke-hoach-cai-thien/chu-giua-font-that): HỘP MỰC THẬT, ĐO CHẮC Ở MỌI TRÌNH DUYỆT ----------
  // Ảnh iPhone của chủ game: chữ trên nút / thẻ / tiêu đề ô bị nhỏ đi và lệch lên. Gốc: (1) cách đặt cũ ép cả dấu / chân chữ (ặ, ọ, y, g)
  // cách viền 2 điểm, phông thật có dấu và chân chữ cao hơn phông thử → chữ bị thu nhỏ và đẩy lên; (2) số đo hộp mực
  // (measureText().actualBoundingBox*) ở cỡ chữ nhỏ (6,5–10) không đáng tin giữa các trình duyệt (Safari làm tròn lên số nguyên, phông chưa
  // về thì đo bằng phông dự phòng). Cách mới (cờ quay lui ?chufont=0 → G.CHU_FONT = false: như trước phiên):
  //   - đo MỘT LẦN mỗi chuỗi ở cỡ lớn (REF px) rồi chia tỉ lệ → làm tròn của trình duyệt chỉ còn ~1/REF;
  //   - mỗi đời phông tự kiểm số đo của trình duyệt bằng cách QUÉT ĐIỂM ẢNH chữ mẫu; lệch > 3 % cỡ chữ thì mọi chuỗi đo bằng quét điểm ảnh;
  //   - phông đổi (về muộn, nạp xong, đổi trạng thái) → "đời phông" mới: xoá mọi số đo / chỗ đặt chữ đã nhớ, khung sau đặt lại;
  //   - căn DỌC theo THÂN CHỮ thật của đúng chuỗi (hộp mực của chuỗi đã bỏ dấu: đỉnh thân chữ → đường cơ sở), dấu và chân chữ được tràn vào
  //     phần đệm (chỉ cần nằm trong lòng khung, cách viền ≥ 0,5); căn NGANG theo hộp mực thật (không theo bề rộng bước chữ).
  if (G.CHU_FONT === undefined) { let t = true; try { t = !/[?&]chufont=0(&|$)/.test(String(window.location && window.location.search)); } catch (e) { t = true; } G.CHU_FONT = t; }
  const chuFont = () => G.CHU_FONT !== false && canMoi();
  T.chuFont = chuFont;
  const REF = 64, MUC = new Map();
  let docCv = null, docG = null, cheDo = null, doiPhong = 0;
  const famPhong = () => (ui.FONT || '"Be Vietnam Pro", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif');
  function butDo() {
    if (!docG) { docCv = document.createElement('canvas'); docCv.width = 16; docCv.height = 16; docG = docCv.getContext('2d', { willReadFrequently: true }); }
    return docG;
  }
  const boDau = (s) => { try { return s.normalize('NFD').replace(/[̀-ͯ]/g, ''); } catch (e) { return s; } };
  // đo bằng trình duyệt ở cỡ REF (đơn vị: em)
  function doTD(s, bold) {
    const g = butDo(); g.font = (bold ? '700 ' : '500 ') + REF + 'px ' + famPhong(); g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    const m = g.measureText(s);
    if (m.actualBoundingBoxAscent == null) return null;
    return { w: m.width / REF, l: m.actualBoundingBoxLeft / REF, r: m.actualBoundingBoxRight / REF, a: m.actualBoundingBoxAscent / REF, d: m.actualBoundingBoxDescent / REF };
  }
  // đo bằng quét điểm ảnh (không tin số đo của trình duyệt)
  function doQuet(s, bold) {
    const g = butDo(), f = (bold ? '700 ' : '500 ') + REF + 'px ' + famPhong();
    g.font = f; const W = g.measureText(s).width;
    const pad = REF, cw = Math.ceil(W + pad * 2), ch = Math.ceil(REF * 2.8), base = Math.round(REF * 1.7);
    if (docCv.width < cw || docCv.height < ch) { docCv.width = Math.max(docCv.width, cw); docCv.height = Math.max(docCv.height, ch); }
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, docCv.width, docCv.height);
    g.font = f; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillStyle = '#000'; g.fillText(s, pad, base);
    const d = g.getImageData(0, 0, cw, ch).data;
    let x0 = cw, x1 = -1, y0 = ch, y1 = -1;
    for (let y = 0; y < ch; y++) { const o = y * cw * 4; for (let x = 0; x < cw; x++) if (d[o + x * 4 + 3] > 24) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; y1 = y; } }
    if (x1 < 0) return { w: W / REF, l: 0, r: 0, a: 0, d: 0 };
    return { w: W / REF, l: (pad - x0) / REF, r: (x1 + 1 - pad) / REF, a: (base - y0) / REF, d: (y1 + 1 - base) / REF };
  }
  // tự kiểm một lần mỗi đời phông: số đo trình duyệt khớp quét điểm ảnh không
  function chonCheDo() {
    if (cheDo) return cheDo;
    cheDo = 'td';
    try {
      for (const bold of [true, false]) for (const mau of ['Hxgậ', 'ỹọ']) {
        const a = doTD(mau, bold), b = doQuet(mau, bold);
        if (!a || ['a', 'd', 'l', 'r'].some((k) => !isFinite(a[k]) || Math.abs(a[k] - b[k]) > 0.03)) { cheDo = 'quet'; break; }
      }
    } catch (e) { cheDo = 'quet'; }
    T.chuDo.cheDo = cheDo;
    return cheDo;
  }
  // Hộp mực của chuỗi s (đã dịch nếu không phải tiếng Việt) theo em: w (bước chữ), l / r (mực trái / phải của điểm neo trái), a / d (mực trên /
  // dưới đường cơ sở), ab (đỉnh THÂN chữ: mực trên của chuỗi đã bỏ dấu).
  T.hopMuc = function (s, bold) {
    s = String(s);
    const k = (bold ? 1 : 0) + '|' + s;
    let q = MUC.get(k);
    if (q) return q;
    const qd = chonCheDo() === 'quet' ? doQuet : (t, b) => doTD(t, b) || doQuet(t, b);
    q = qd(s, bold);
    const t = boDau(s);
    q.ab = t === s ? q.a : t.trim() ? qd(t, bold).a : q.a;
    if (MUC.size > 1500) MUC.clear();
    MUC.set(k, q);
    return q;
  };
  // Đổi phông (về muộn / nạp xong / trạng thái phông đổi): bỏ hết số đo và chỗ đặt chữ đã nhớ.
  function phongDoi() { doiPhong++; cheDo = null; MUC.clear(); DAT_NHO.clear(); CAP.clear(); T.chuDo.doiPhong = doiPhong; }
  T.phongDoi = phongDoi;
  let kyPhong = '';
  function soPhong() { // dấu vân trạng thái các phông của trang (không cần sự kiện: Safari có khi không báo loadingdone)
    try {
      const f = document.fonts; if (!f) return;
      let k = f.status + '|';
      if (f.forEach) f.forEach((x) => { k += x.family + x.weight + x.status + ';'; });
      if (k !== kyPhong) { const dau = kyPhong === ''; kyPhong = k; if (!dau) phongDoi(); }
    } catch (e) { /* bỏ qua */ }
  }
  try {
    if (typeof document !== 'undefined' && document.fonts && G.CHU_FONT !== false) {
      soPhong();
      if (document.fonts.ready && document.fonts.ready.then) document.fonts.ready.then(() => { soPhong(); phongDoi(); });
      let n = 0; const tick = () => { soPhong(); n++; setTimeout(tick, n < 50 ? 400 : 3000); }; setTimeout(tick, 400);
    }
  } catch (e) { /* bỏ qua */ }
  // Đo chữ ở cỡ s (đã qua sàn tiny 6,5): bề rộng, hộp chữ thật trên / dưới đường cơ sở. Tiếng Anh: canvas tự dịch khi đo (js/ngon_ngu.js).
  function doChu(s, size, bold) {
    ui.font(size, bold, true);
    if (chuFont()) { // 17/10: hộp mực đo chắc (T.hopMuc), chia theo cỡ
      const fs = ui.fs(size, true);
      let giau = false;
      if (DIGIT.test(s) && s.length >= 3) giau = HAS.test(mark(s));
      if (!giau) {
        const q = T.hopMuc(G.LANG !== 'vi' && G.tv ? G.tv(s) : s, bold);
        return { w: Math.max(q.w, q.l + q.r) * fs, a: q.a * fs, d: q.d * fs, l: q.l * fs, r: q.r * fs, adv: q.w * fs, ab: q.ab * fs, muc: true };
      }
    }
    let m = G.ux.measureText(s);
    let w = Math.max(m.width, (m.actualBoundingBoxLeft || 0) + (m.actualBoundingBoxRight || 0));
    if (DIGIT.test(s) && s.length >= 3) { // "số + tài nguyên" vẽ thành biểu tượng (richText): đo như lúc vẽ
      const t = mark(s);
      if (HAS.test(t)) {
        const ih = Math.round(Math.max(6.5, size) * 1.05 * 2) / 2; let tw = 0, cur = '';
        for (const ch of t) { const k = ch.charCodeAt(0) - PUA; if (k >= 0 && k < KINDS.length) { tw += ih + 1; } else cur += ch; }
        m = G.ux.measureText(cur.replace(/[-]/g, '')); w = tw + m.width;
        if (chuFont()) { // chữ kèm biểu tượng: mực dọc theo phần chữ, ngang theo bước (biểu tượng nằm trong dòng)
          const q = T.hopMuc(cur.replace(/[-]/g, ''), bold), fs = ui.fs(size, true), ihc = Math.max(6.5, size) * 1.05;
          return { w, a: Math.max(q.a * fs, ihc - 1), d: Math.max(q.d * fs, 0), ab: Math.max(q.ab * fs, ihc - 1), giau: true };
        }
      }
    }
    return { w, a: m.actualBoundingBoxAscent != null ? m.actualBoundingBoxAscent : size * 0.95, d: m.actualBoundingBoxDescent != null ? m.actualBoundingBoxDescent : size * 0.25 };
  }
  const CAP = new Map();
  function capCao(size, bold) { const k = size + '|' + (bold ? 1 : 0) + '|' + G.ux.font.replace(/^[^"]*/, ''); let v = CAP.get(k); if (v == null) { v = chuFont() ? T.hopMuc('H', bold).a * ui.fs(size, true) : doChu('H', size, bold).a || size * 0.72; CAP.set(k, v); } return v; }
  // xuống dòng theo bề rộng (chữ đã dịch nếu không phải tiếng Việt)
  function chiaDong(s, maxW, size, bold) {
    const words = String(s).split(' '), lines = []; let cur = '';
    for (const wd of words) { const t = cur ? cur + ' ' + wd : wd; if (cur && doChu(t, size, bold).w > maxW) { lines.push(cur); cur = wd; } else cur = t; }
    if (cur) lines.push(cur);
    return lines;
  }
  function catBa(s, maxW, size, bold) { // cắt "…" cho vừa
    if (doChu(s, size, bold).w <= maxW) return s;
    while (s.length > 1 && doChu(s + '…', size, bold).w > maxW) s = s.slice(0, -1);
    return s.trimEnd() + '…';
  }
  const DAT_NHO = new Map();
  // can-chu-khung (16/10): phông Be Vietnam Pro về SAU khi game đã vẽ (mạng chậm, quá 1,2 giây chờ) → bỏ chỗ đặt chữ đã nhớ theo phông dự phòng
  // (phông thật rộng / cao khác: chữ đặt theo số đo cũ sẽ lệch tâm hoặc tràn khung cho tới khi bộ nhớ đầy)
  try { if (typeof document !== 'undefined' && document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', () => { if (chuFont()) phongDoi(); else if (canMoi()) { DAT_NHO.clear(); CAP.clear(); } }); } catch (e) { /* bỏ qua */ }
  T.chuDo = { lan: 0, thap: 0, cat: 0, hep: 0, giua: 0 }; // đếm cho công cụ soát
  // Tính chỗ đặt (không vẽ). Trả về { size, lines: [{ s, x, b, size, bold, color }], cat, thap } — toạ độ tuyệt đối.
  // (x, y, w, h): khung. o: { khung: mã ảnh khung | null, vien: [t, r, b, l] viền khi khung vẽ code, dem (2), size, min (6,5), bold,
  //   dong: số dòng tối đa (mặc định 1), giãn: khoảng giữa hai dòng (2,5), align 'center' | 'left' | 'right', vung: [x, y, w, h] chỉ được đặt trong vùng này
  //   (ví dụ phần bên phải biểu tượng), phu: { s, size, bold } dòng phụ nhỏ bên dưới (nút có hai dòng), dy: dời cả khối (nút đang bấm) }
  T.datChu = function (s, x, y, w, h, o) {
    o = o || {};
    s = String(s == null ? '' : s);
    const src = G.LANG === 'vi' || !G.tv ? s : G.tv(s);
    const ps = o.phu && o.phu.s ? (G.LANG === 'vi' || !G.tv ? String(o.phu.s) : G.tv(String(o.phu.s))) : '';
    const ga = o.khung ? khungCo(o.khung) : null;
    const vg = o.vung;
    const key = [src, ps, G.LANG, x, y, w, h, ga ? o.khung + '|' + ga.pw + '|' + (o.kKhung || '') + '|' + (o.vienAnh || '') + (o.trongVien ? '|tv' : '') : 'c' + (o.vien || ''), o.size, o.min, o.bold ? 1 : 0, o.dong, o.align, o.dem, o.gian, vg ? vg.join(',') : '', o.phu ? o.phu.size + '|' + (o.phu.bold ? 1 : 0) : '', o.tamX, G.ux.font.replace(/^[^"]*/, ''), chuFont() ? 'm' + doiPhong : ''].join('|');
    const nho = DAT_NHO.get(key);
    if (nho) return nho;
    T.chuDo.lan++;
    // 15/10 sua-lang-npc: o.trongVien (nút lớn ở làng: Lên đò, Nâng lò, nút việc ở lò rèn) — chữ chỉ đặt trong phần ở giữa, trừ viền "vien" của ảnh
    // gd-* (góc / hoa văn hai đầu), không lấn vào đoạn đỏ chạy dưới hoa văn. Lòng trong viền quá nhỏ thì đặt như cũ.
    const vT = o.trongVien && ga && ga.vien ? longVien(ga, w, h) : null;
    const L = vT || (ga && T.longKhung(o.khung, w, h, o.kKhung, o.vienAnh)) || longCode(w, h, o.vien || [2, 2, 2, 2]);
    const dem = o.dem == null ? 2 : o.dem, size0 = o.size || 9, min = Math.min(size0, o.min || 6.5), bold = o.bold !== false, align = o.align || 'center';
    const maxDong = Math.max(1, o.dong || 1), gian = o.gian == null ? 2.5 : o.gian;
    // vùng được phép, toạ độ trong khung
    const vx0 = vg ? vg[0] - x : -1e9, vx1 = vg ? vg[0] + vg[2] - x : 1e9, vy0 = vg ? vg[1] - y : -1e9, vy1 = vg ? vg[1] + vg[3] - y : 1e9;
    const top = Math.max(L.top, vy0), bot = Math.min(L.bot, vy1);
    let giuaOn = false;
    const spanVung = (a, b) => { const q = giuaOn && L.spanGiua ? L.spanGiua(a, b) : L.span(a, b); if (!q) return null; const l = Math.max(q[0], vx0), r = Math.min(q[1], vx1); return r > l ? [l, r] : null; };
    const giuaSpan = spanVung((top + bot) / 2 - 0.5, (top + bot) / 2 + 0.5) || [0, w];
    // thử một cách xếp: dòng (mảng chữ + cỡ), trả về kết quả nếu vừa. dm: đệm ngang. chat: không vừa thì cắt "…" (bước cuối).
    function thu(dongs, dm, chat) {
      const ms = dongs.map((q) => doChu(q.s, q.size, q.bold));
      const cap0 = capCao(dongs[0].size, dongs[0].bold);
      const rel = [0]; for (let i = 1; i < dongs.length; i++) rel.push(rel[i - 1] + dongs[i].size + gian - (dongs[i].size < dongs[i - 1].size ? (dongs[i - 1].size - dongs[i].size) * 0.3 : 0));
      const last = rel.length - 1;
      if (chuFont()) return thuMuc(dongs, ms, rel, dm, chat);
      // khối chữ hoa (đỉnh "H" dòng đầu → đường cơ sở dòng cuối) căn giữa dải lòng. can-chu-khung: trước đây cộng thừa nửa cao chữ hoa
      // (chữ nằm thấp hơn tâm ~3 điểm ở nút cao; nút thấp thì bị kẹp lại nên không thấy)
      let b0 = (top + bot) / 2 - (rel[last] - cap0) / 2 + (canMoi() ? 0 : cap0 / 2);
      const hi = Math.min(...ms.map((m, i) => rel[i] - m.a)), lo = Math.max(...ms.map((m, i) => rel[i] + m.d));
      const cao = lo - hi, room = bot - top;
      if (cao > room + 1e-6 && !chat) return null; // khung thấp hơn chữ
      const dv = Math.max(0, Math.min(dem, (room - cao) / 2)); // đệm dọc: 2 điểm khi đủ chỗ
      // can-chu-khung: chữ sát viền trên / dưới (đệm dọc < 0,5) thì thử thu thêm tối đa 1 cỡ trước khi chịu sát
      if (canMoi() && !chat && dem > 0 && dv < 0.5 && dongs[0].size > Math.max(min, size0 - 1) + 1e-6) return null;
      if (b0 + hi < top + dv) b0 = top + dv - hi;
      if (b0 + lo > bot - dv) b0 = bot - dv - lo;
      if (b0 + hi < top - 1e-6 && cao <= room) b0 = top - hi;
      const out = [], sps = [];
      for (let i = 0; i < dongs.length; i++) {
        const bl = b0 + rel[i];
        const sp = spanVung(bl - ms[i].a, bl + ms[i].d) || (chat ? giuaSpan : null);
        if (!sp) return null;
        sps.push(sp);
      }
      // can-chu-khung: khối nhiều dòng căn trái / phải dùng chung một lề (lòng hẹp nhất), không dòng thụt dòng lồi theo đường cong viền
      if (canMoi() && align !== 'center' && sps.length > 1) {
        const l0 = Math.max(...sps.map((q) => q[0])), r0 = Math.min(...sps.map((q) => q[1]));
        if (r0 > l0) for (let i = 0; i < sps.length; i++) sps[i] = [l0, r0];
      }
      for (let i = 0; i < dongs.length; i++) {
        const bl = b0 + rel[i], sp = sps[i];
        const l = sp[0] + dm, r = sp[1] - dm;
        let t = dongs[i].s, mw = ms[i].w;
        if (mw > r - l + 1e-6) { if (!chat) return null; t = catBa(t, Math.max(4, r - l), dongs[i].size, dongs[i].bold); }
        const xx = align === 'left' ? l : align === 'right' ? r : (l + r) / 2;
        out.push({ s: t, x: x + xx, b: y + bl, size: dongs[i].size, bold: dongs[i].bold, cat: t !== dongs[i].s });
      }
      return { lines: out, thap: cao > room + 1e-6, dem: dm };
    }
    // 17/10 chu-giua-font-that: THÂN chữ (đỉnh thân dòng đầu → đường cơ sở dòng cuối) đúng tâm lòng; mực thật (kể cả dấu, chân chữ) chỉ cần
    // nằm trong lòng, cách viền ≥ 0,5 (không còn ép cách 2 điểm → chữ không bị thu nhỏ / đẩy lên vì dấu ặ ọ, chân y g). Không vừa khi đặt giữa:
    // thử nhỏ tối đa 1 cỡ, rồi mới dịch tối thiểu cho mực vào trong lòng. Ngang: tâm hộp mực thật vào tâm lòng.
    // tâm lòng trung bình theo từng hàng (0,5 điểm) từ a tới b — không nhảy cóc khi một hàng chạm núm / hoa văn của viền
    function tamHang(spf, a, b) {
      let n = 0, sum = 0, l0 = -1e9, r0 = 1e9;
      for (let t = a; t <= b + 1e-6; t += 0.5) { const q = spf(Math.min(t, b) - 0.25, Math.min(t, b) + 0.25); if (q) { sum += (q[0] + q[1]) / 2; n++; l0 = Math.max(l0, q[0]); r0 = Math.min(r0, q[1]); } }
      return n ? [sum / n - 0.5 * (r0 - l0), sum / n + 0.5 * (r0 - l0)] : null;
    }
    function thuMuc(dongs, ms, rel, dm, chat) {
      const last = rel.length - 1;
      const than = ms[0].ab != null ? ms[0].ab : capCao(dongs[0].size, dongs[0].bold);
      let b0 = (top + bot) / 2 - (rel[last] - than) / 2;
      const hi = Math.min(...ms.map((m, i) => rel[i] - m.a)), lo = Math.max(...ms.map((m, i) => rel[i] + m.d));
      const cao = lo - hi, room = bot - top;
      if (cao > room + 1e-6 && !chat) return null; // khung thấp hơn chữ
      // dịch tối thiểu để mực cách mép lòng ≥ m (0 nếu vừa)
      const canDich = (m) => { const mm = Math.max(0, Math.min(m, (room - cao) / 2)); return b0 + hi < top + mm ? top + mm - (b0 + hi) : b0 + lo > bot - mm ? bot - mm - (b0 + lo) : 0; };
      let dich = false, dd = canDich(0.35);
      if (Math.abs(dd) > 0.4) {
        if (!chat && dem > 0 && dongs[0].size > Math.max(min, size0 - 1) + 1e-6) return null; // thử nhỏ 1 cỡ trước khi lệch tâm
        dd = canDich(0); // cỡ cuối: mực được sát mép lòng (không ra ngoài) để thân chữ giữ giữa
        if (Math.abs(dd) > 0.4 && !chat && dongs[0].size > min + 1e-6) return null; // vẫn lệch quá ngưỡng: nhỏ thêm (tới cỡ tối thiểu)
        dich = Math.abs(dd) > 0.4;
      }
      b0 += dd;
      if (b0 + hi < top - 1e-6 && cao <= room) b0 = top - hi;
      const out = [], sps = [];
      for (let i = 0; i < dongs.length; i++) {
        const bl = b0 + rel[i];
        const sp = spanVung(bl - ms[i].a, bl + ms[i].d) || (chat ? giuaSpan : null);
        if (!sp) return null;
        sps.push(sp);
      }
      if (align !== 'center' && sps.length > 1) {
        const l0 = Math.max(...sps.map((q) => q[0])), r0 = Math.min(...sps.map((q) => q[1]));
        if (r0 > l0) for (let i = 0; i < sps.length; i++) sps[i] = [l0, r0];
      }
      for (let i = 0; i < dongs.length; i++) {
        const bl = b0 + rel[i], sp = sps[i];
        const l = sp[0] + dm, r = sp[1] - dm;
        let t = dongs[i].s, m = ms[i];
        if (m.w > r - l + 1e-6) { if (!chat) return null; t = catBa(t, Math.max(4, r - l), dongs[i].size, dongs[i].bold); m = doChu(t, dongs[i].size, dongs[i].bold); }
        let xx;
        // tâm ngang: tâm lòng ở các hàng THÂN chữ (không theo hàng dấu / chân chữ chạm hoa văn góc)
        // o.tamX: nơi gọi chỉ định tâm (cụm biểu tượng + chữ); không thì tâm lòng ở hàng thân chữ
        const spT = align === 'center' ? tamHang(spanVung, bl - (m.ab != null ? m.ab : m.a), bl) : null; // tâm lòng trung bình các hàng thân chữ
        const tam = o.tamX != null ? o.tamX - x : spT ? (spT[0] + spT[1]) / 2 : (l + r) / 2;
        const cg = align === 'center' ? Math.min(r - m.w / 2, Math.max(l + m.w / 2, tam)) : (l + r) / 2;
        if (Math.abs(cg - tam) > 0.4 && !chat && (dongs[i].size > min + 1e-6 || dm > 0)) return null; // …rồi đệm ngang hẹp dần // chữ chạm hoa văn hai đầu: thử nhỏ 1 cỡ trước khi lệch tâm
        if (m.muc) xx = align === 'left' ? l + m.l : align === 'right' ? r - m.r + m.adv : cg + m.adv / 2 - (m.r - m.l) / 2;
        else xx = align === 'left' ? l : align === 'right' ? r : cg;
        out.push({ s: t, x: x + xx, b: y + bl, size: dongs[i].size, bold: dongs[i].bold, cat: t !== dongs[i].s });
      }
      return { lines: out, thap: cao > room + 1e-6, dem: dm, dich };
    }
    const ph = o.phu ? Math.max(6.5, o.phu.size || 7) : 0, phB = o.phu ? !!o.phu.bold : false;
    // dòng phụ thu cỡ riêng (không kéo dòng chính nhỏ theo)
    const phuCo = (dm) => { let z = ph; while (z > 6.5 && doChu(ps, z, phB).w > giuaSpan[1] - giuaSpan[0] - dm * 2) z = Math.max(6.5, z - 0.5); return z; };
    const buoc = (sz) => Math.round((sz - 0.5) * 2) / 2;
    // Thứ tự: (1) đệm 2: thu cỡ → xuống dòng; (2) khung quá nhỏ: đệm hẹp dần 1 → 0,5 → 0 (chữ vẫn trong lòng, không chạm viền); (3) cắt "…".
    let kq = null;
    const dems = [dem].concat(dem > 1 ? [1] : [], dem > 0.5 ? [0.5] : [], dem > 0 ? [0] : []);
    for (const dm of dems) {
      const them = ps ? [{ s: ps, size: phuCo(dm), bold: phB }] : [];
      for (let sz = size0; !kq && sz >= min - 1e-6; sz = buoc(sz)) { kq = thu([{ s: src, size: sz, bold }].concat(them), dm); if (kq) kq.size = sz; }
      if (!kq && maxDong > 1 && src.indexOf(' ') > 0) { // xuống dòng
        const hepSpan = spanVung(top + 0.25, bot - 0.25) || giuaSpan; // bề rộng hẹp nhất của lòng (hàng góc có đinh): chia dòng theo nó trước
        for (let sz = size0; !kq && sz >= min - 1e-6; sz = buoc(sz)) {
          for (const sp of [hepSpan, giuaSpan]) {
            const dl = chiaDong(src, sp[1] - sp[0] - dm * 2, sz, bold);
            if (dl.length < 2 || dl.length > maxDong) continue;
            kq = thu(dl.map((t) => ({ s: t, size: sz, bold })).concat(them), dm);
            if (kq) { kq.size = sz; break; }
          }
        }
      }
      if (kq) break;
    }
    if (!kq && L.spanGiua) { // khung quá nhỏ: lòng giữa (bỏ qua đinh góc trong lòng), thu cỡ, đệm hẹp dần — trước khi cắt "…"
      giuaOn = true;
      for (const dm of dems) {
        const them = ps ? [{ s: ps, size: phuCo(dm), bold: phB }] : [];
        for (let sz = size0; !kq && sz >= min - 1e-6; sz = buoc(sz)) { kq = thu([{ s: src, size: sz, bold }].concat(them), dm); if (kq) { kq.size = sz; kq.giua = true; } }
        if (kq) break;
      }
      if (!kq) giuaOn = false;
    }
    if (!kq) { // cuối cùng: cỡ tối thiểu, (nhiều dòng thì dòng cuối) cắt "…"
      let dl = [src];
      const dm = Math.min(dem, 1);
      if (maxDong > 1 && src.indexOf(' ') > 0) { dl = chiaDong(src, giuaSpan[1] - giuaSpan[0] - dm * 2, min, bold); if (dl.length > maxDong) dl = dl.slice(0, maxDong - 1).concat([dl.slice(maxDong - 1).join(' ')]); }
      const them = ps ? [{ s: ps, size: 6.5, bold: phB }] : [];
      kq = thu(dl.map((t) => ({ s: t, size: min, bold })).concat(them), dm, true) || { lines: [{ s: src, x: x + w / 2, b: y + h / 2 + min * 0.36, size: min, bold }], thap: true, dem: 0 };
      kq.size = min;
    }
    kq.cat = kq.lines.some((q) => q.cat);
    kq.align = align;
    if (kq.cat) T.chuDo.cat++;
    if (kq.thap) T.chuDo.thap++;
    if (kq.dem < dem) T.chuDo.hep++; // khung quá nhỏ: đệm ngang < 2
    if (kq.giua) T.chuDo.giua++;
    if (DAT_NHO.size > 800) DAT_NHO.clear();
    DAT_NHO.set(key, kq);
    return kq;
  };
  // Đặt và vẽ chữ trong lòng khung. o như T.datChu, thêm color, shadow, phu.color. Trả về kết quả của T.datChu.
  T.chuTrongKhung = function (s, x, y, w, h, o) {
    o = o || {};
    if (s == null || s === '') return null;
    const kq = T.datChu(s, x, y, w, h, o), dy = o.dy || 0;
    kq.lines.forEach((q, i) => {
      const phu = o.phu && i === kq.lines.length - 1 && o.phu.s;
      oldTextCo(q.s, q.x, q.b + dy, { size: q.size, bold: q.bold, tiny: true, align: kq.align, color: phu ? o.phu.color || o.color : o.color, shadow: phu && o.phu.shadow !== undefined ? o.phu.shadow : o.shadow });
    });
    return kq;
  };
  // Lối tắt cho chữ nơi gọi tự vẽ trong ô con (T.inset) / tấm nhỏ (T.plate): khung, viền code, độ thu ảnh ô con tự điền.
  T.chuO = function (s, x, y, w, h, o) {
    o = o || {};
    return T.chuTrongKhung(s, x, y, w, h, Object.assign({ khung: o.sel ? 'gd-o-con-chon' : 'gd-o-con', kKhung: T.kOCon(w, h), vien: [1, 1, 1, 1] }, o));
  };
  T.chuTam = function (s, x, y, w, h, o) {
    o = o || {};
    return T.chuTrongKhung(s, x, y, w, h, Object.assign({ khung: 'gd-khung-nho', vien: [2, 2, 2, 2] }, o));
  };
  T.chuMoi = chuMoi;
  // vẽ một dòng đã đặt: qua ui.text (biểu tượng tài nguyên, chữ dịch). Chữ đã dịch thì vẽ thẳng (tránh dịch hai lần).
  function oldTextCo(s, x, y, o) { return ui.text(s, x, y, o); }

  // ---------- 15/10 (docs/review/ke-hoach-cai-thien/khung-gd-con): 9 khung còn vẽ code -> ảnh AI ----------
  // Dựng: khung-gd-con/cong-cu/dung-khung-gd-con.py (ảnh gốc docs/anh-goc/giao-dien/dot2/). Chỉ thay KHUNG: chữ, màu lòng thanh (máu, linh khí),
  // vùng chạm, toạ độ giữ như cũ. Thiếu tệp (ảnh chưa tải) hoặc ?khunganh=0 (G.KHUNG_ANH = false): các hàm dưới trả false -> nơi gọi vẽ code như cũ.
  //   gd-khung-nho (T.plate) · gd-dai-thong-bao (T.toast / toastFit, popup luc_chien) · gd-o-con, gd-o-con-chon (T.inset) ·
  //   gd-the-nho (T.theNho: chip kháng / yếu dưới thanh trùm, nhuộm màu chip) · gd-khung-vach-lk + -moc (T.vachLk, T.vachLkMoc: js/linhkhi.js) ·
  //   gd-thanh-cuon + -num (T.thanhCuon: js/hanh_trang.js) · gd-khung-canh-bao (T.khungCanhBao: js/ep_do.js) ·
  //   gd-the-sap-co (T.theSapCo: js/village.js bản đồ vùng) · gd-khung-mau-quai (T.mauQuai: js/stage.js mobBars).
  // Màu lòng của ảnh (lòng đã đục rỗng trong tệp để game đổ màu, cho lòng bán trong suốt / o.fill như code cũ):
  const LONG_NHO = [24, 49, 23], LONG_O = '#241611'; // gd-khung-nho #183117 · gd-o-con / -chon #241611 (in ra bởi dung-khung-gd-con.py)
  function khungNhoAnh(x, y, w, h, a) {
    const gk = khungCo('gd-khung-nho');
    if (!gk || w < 4 || h < 4) return false;
    khungDat(khungLop(gk, 'nho|' + w + '|' + h + '|' + a, w, h, () => {
      R(1, 1, w - 2, h - 2, 'rgba(' + LONG_NHO.join(',') + ',' + a + ')');
      khungVeDeu(gk, 0, 0, w, h);
    }), x, y, w, h);
    return true;
  }
  // ô con: lòng màu ảnh (+ o.fill phủ lên như màu lót code), khung ảnh; ô chọn có quầng vàng tràn 0,5 điểm mỗi bên (ảnh 35×34 so với 34×33).
  // o.col (màu viền báo trạng thái: hệ, đủ điều kiện, tối đa...) vẽ thành một nét 1 điểm ngay trong viền ảnh để không mất nghĩa.
  // 16/10 (ve-tay-8-gop-giao-dien): lòng ô con lát ảnh gỗ gd-long-khung (lặp hai chiều, đúng độ nét ảnh) thay màu phẳng LONG_O.
  // Không có ảnh / ?khunganh=0 / ?vecode=1: null → màu phẳng như cũ. Màu o.fill vẫn phủ lên trên như code.
  let longMau = null;
  function longGo() {
    const ga = G.VE_CODE === true ? null : khungCo('gd-long-khung');
    if (!ga) return null;
    if (longMau && longMau.img === ga.img) return longMau.p;
    let p = null;
    try {
      p = G.ux.createPattern(ga.img, 'repeat');
      if (p && p.setTransform && typeof DOMMatrix !== 'undefined') p.setTransform(new DOMMatrix([1 / (ga.net || 1), 0, 0, 1 / (ga.net || 1), 0, 0]));
    } catch (e) { p = null; }
    longMau = { img: ga.img, p };
    return p;
  }
  function oConAnh(x, y, w, h, sel, o) {
    const go = khungCo(sel ? 'gd-o-con-chon' : 'gd-o-con');
    if (!go || w < 6 || h < 6) return false;
    const c = G.ux;
    c.fillStyle = longGo() || LONG_O; c.fillRect(x + 1, y + 1, w - 2, h - 2);
    if (o.fill) { c.fillStyle = o.fill; c.fillRect(x + 1, y + 1, w - 2, h - 2); }
    const m = sel ? 0.5 : 0, W = w + m * 2, H = h + m * 2;
    const k = T.kOCon(w, h);
    khungDat(khungLop(go, 'o|' + W + '|' + H + '|' + k, W, H, () => { if (k < 1) { g.save(); g.scale(k, k); try { khungVeDeu(go, 0, 0, W / k, H / k); } finally { g.restore(); } } else khungVeDeu(go, 0, 0, W, H); }), x - m, y - m, W, H);
    if (sel && k < 1 && !o.col) { c.fillStyle = C.hi; c.fillRect(x + 1, y + 1, w - 2, 1); c.fillRect(x + 1, y + h - 2, w - 2, 1); c.fillRect(x + 1, y + 2, 1, h - 4); c.fillRect(x + w - 2, y + 2, 1, h - 4); } // ô chọn thu nhỏ: thêm nét vàng sáng trong viền cho dễ thấy
    if (o.col && o.col !== C.brD && w > 8 && h > 8) {
      const e = k < 1 ? 1 : 2;
      c.fillStyle = o.col;
      c.fillRect(x + e, y + e, w - e * 2, 1); c.fillRect(x + e, y + h - e - 1, w - e * 2, 1); c.fillRect(x + e, y + e + 1, 1, h - e * 2 - 2); c.fillRect(x + w - e - 1, y + e + 1, 1, h - e * 2 - 2);
    }
    return true;
  }
  // chu-lech-khung: ô con ảnh có viền dày ~4 điểm (ô code cũ chỉ 1 điểm) nên ô THẤP / HẸP (cạnh ngắn < 40: dòng chỉ số, nút cây kỹ năng, hàng danh sách)
  // vẽ ảnh thu đều một nửa (viền ~2 điểm) để chữ đặt như cũ vẫn nằm trong lòng. Không đổi cỡ / vị trí ô.
  T.kOCon = (w, h) => (Math.min(w, h) < 40 ? 0.5 : 1);
  // ảnh nhuộm: kieu 'nhan' (nhân màu: ảnh trắng -> màu chip, giữ sáng tối) hoặc 'phu' (phủ màu k phần: viền máu quái theo hệ)
  function veNhuom(ga, w, h, col, kieu, k) {
    khungVeDeu(ga, 0, 0, w, h);
    if (!col) return;
    g.save();
    if (kieu === 'nhan') { g.globalCompositeOperation = 'multiply'; g.fillStyle = col; g.fillRect(0, 0, w, h); g.globalCompositeOperation = 'destination-in'; khungVeDeu(ga, 0, 0, w, h); }
    else { g.globalCompositeOperation = 'source-atop'; g.globalAlpha = k; g.fillStyle = col; g.fillRect(0, 0, w, h); }
    g.restore();
  }
  // bản sao ảnh với ô cắt 9 mảnh khác (nhớ theo ảnh): dùng khi muốn viền trên / dưới giữ cỡ thay vì giãn theo chiều cao
  const VIEN_EP = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  function gaVien(ga, v) {
    if (!VIEN_EP) return ga;
    let m = VIEN_EP.get(ga); if (!m) { m = new Map(); VIEN_EP.set(ga, m); }
    const k = v.join(',');
    let b = m.get(k); if (!b) { b = Object.assign({}, ga, { vien: v.slice(), ghep9: new Map() }); m.set(k, b); }
    return b;
  }
  T.VIEN_THE_NHO = [2.5, 3, 2.5, 3]; // chu-lech-khung: thẻ kháng / yếu cao hơn 10 thì vành trắng trên / dưới giữ 2,5 điểm (tệp: [0,3,0,3], giãn theo chiều cao)
  T.theNho = function (x, y, w, h, col) { // chip kháng / yếu: thẻ trắng nhuộm màu chip
    let ga = khungCo('gd-the-nho');
    if (!ga || w < 4) return false;
    if (h > 10) ga = gaVien(ga, T.VIEN_THE_NHO);
    khungDat(khungLop(ga, 'tn|' + w + '|' + h + '|' + col, w, h, () => veNhuom(ga, w, h, col, 'nhan')), x, y, w, h);
    return true;
  };
  // thanh máu nhỏ trên đầu quái: (x, y, bw) là lòng thanh 2 điểm như code; khung ảnh cao 4 (y - 1 .. y + 3), hai núm đầu nằm ngoài lòng 2 điểm.
  // he: màu hệ của dấu Linh Khí (viền theo hệ như code cũ): khung phủ màu hệ 70%.
  T.mauQuai = function (x, y, bw, he) {
    const ga = khungCo('gd-khung-mau-quai');
    if (!ga) return false;
    const w = bw + 4;
    khungDat(khungLop(ga, 'mq|' + w + '|' + (he || ''), w, 4, () => veNhuom(ga, w, 4, he, 'phu', 0.7)), x - 2, y - 1, w, 4);
    return true;
  };
  // vỏ vạch linh khí quanh lòng (x, y, w, h): ảnh cao h + 3, hai đầu (móc) nằm ngoài lòng 3 điểm mỗi bên (theo tỉ lệ khi h khác 4).
  T.vachLk = function (x, y, w, h) {
    const ga = khungCo('gd-khung-vach-lk');
    if (!ga) return false;
    const H = h + 3, d = Math.round(3 * H / 7 * 2) / 2, W = w + d * 2;
    khungDat(khungLop(ga, 'lk|' + W + '|' + H, W, H, () => khungVeDeu(ga, 0, 0, W, H)), x - d, y - 1.5, W, H);
    return true;
  };
  // một vạch mốc ở px trên vạch có lòng cao h (từ y): đã đạt thì ảnh như gốc, chưa đạt thì bản tối (như vạch xám code cũ)
  T.vachLkMoc = function (px, y, h, dat) {
    const g0 = khungCo('gd-khung-vach-lk-moc');
    if (!g0) return false;
    gdVe(dat ? g0 : gdBien(g0, 'toi') || g0, px - 1, y - 1.5, 2, h + 3);
    return true;
  };
  // thanh cuộn dọc: rãnh (x, y, 4, h), nút (x + 0.5, ty, 3, th)
  T.thanhCuon = function (x, y, h, ty, th) {
    const gr = khungCo('gd-thanh-cuon'), gn = khungCo('gd-thanh-cuon-num');
    if (!gr || !gn) return false;
    gdVe(gr, x, y, 4, h); gdVe(gn, x + 0.5, ty, 3, th);
    return true;
  };
  T.khungCanhBao = function (x, y, w, h) { // hộp cảnh báo đỏ (ép đồ: hỏi trước khi ép có nguy cơ tụt bậc)
    const ga = khungCo('gd-khung-canh-bao');
    if (!ga) return false;
    w = Math.round(w); h = Math.round(h);
    khungDat(khungLop(ga, 'cb|' + w + '|' + h, w, h, () => khungVeDeu(ga, 0, 0, w, h)), Math.round(x), Math.round(y), w, h);
    return true;
  };
  T.theSapCo = function (x, y, w, h) { // thẻ "Sắp có" trên bản đồ vùng (tấm gỗ; chữ vẽ đè bằng code)
    const ga = khungCo('gd-the-sap-co');
    if (!ga) return false;
    gdVe(ga, x, y, w, h);
    return true;
  };

  // ---------- thanh máu trùm / tinh anh ----------
  // Phân cấp: trùm vùng (big) khung to có hoa văn, tên chữ to; trùm nhỏ khung vừa; tinh anh khung nhỏ.
  // o: { tier: 'big' | 'mini' | 'elite', name, frac, lag (khoá tụt dần), marks: [0.3, 0.6] vạch pha, sub: chữ nhỏ cạnh tên }
  // Trả về đáy khung (y) để nơi gọi xếp chữ khác bên dưới.
  T.bossBar = function (cx, y, o) {
    const tier = o.tier || 'big', big = tier === 'big', elite = tier === 'elite';
    const name = o.name || '';
    const ns = big ? 9 : elite ? 7.5 : 8;
    ui.font(6.5, true);
    const sw = o.sub ? G.ux.measureText(o.sub).width + 12 : 0;
    ui.font(ns, true);
    const tw = G.ux.measureText(name).width;
    // khung tinh anh rộng theo chữ (tên loài + dấu hiệu), trùm cố định
    const w = big ? 226 : elite ? Math.round(G.clamp(tw + sw + 18, 150, 224)) : 196, bh = big ? 11 : elite ? 7 : 9, ph = big ? 30 : elite ? 22 : 26;
    const x = Math.round(cx - w / 2);
    // Làn C5: có ảnh thì tấm khung là ảnh 9 mảnh co theo bề ngang (lòng khung vẫn lót gỗ sẫm hơi trong như T.plate); tên, vạch pha, thanh máu vẽ như cũ
    const gkt = khungCo(big ? 'gd-khung-trum' : elite ? 'gd-khung-tinh-anh' : 'gd-khung-trum-nho');
    if (gkt) khungDat(khungLop(gkt, 'bb|' + w + '|' + ph, w, ph, () => { R(2, 2, w - 4, ph - 4, 'rgba(22,15,10,0.8)'); khungVe(gkt, 0, 0, w, ph); }), x, y, w, ph);
    else T.plate(x, y, w, ph, { a: 0.8, edge: big ? C.gold : C.br });
    const ny = y + (big ? 11 : elite ? 9 : 10);
    // hoa văn hai bên tên trùm vùng: gạch đồng + chấm vàng (pixel, không chữ)
    if (big) {
      const c = G.ux, l = Math.round(cx - tw / 2 - 8), r = Math.round(cx + tw / 2 + 8);
      const vt = G.gop8Bat && G.gop8Bat() ? gdCo('gd-trum-vach-ten') : null; // vẽ tay 8 gộp: vạch đồng có núm ngọc, núm quay vào tên (?gop8=0: code)
      if (vt && vt.img) {
        const vh = vt.ph / vt.net, sm = c.imageSmoothingEnabled; c.imageSmoothingEnabled = false;
        c.drawImage(vt.img, x + 8, ny - 4 - vh / 2 + 0.5, l + 1 - x - 8, vh);
        c.save(); c.translate(x + w - 8, 0); c.scale(-1, 1); c.drawImage(vt.img, 0, ny - 4 - vh / 2 + 0.5, x + w - 8 - r + 1, vh); c.restore();
        c.imageSmoothingEnabled = sm;
      } else {
      c.fillStyle = C.br; c.fillRect(x + 8, ny - 4, l - x - 10, 1); c.fillRect(r + 2, ny - 4, x + w - 10 - r, 1);
      c.fillStyle = C.hi; c.fillRect(l - 2, ny - 5, 3, 3); c.fillRect(r - 1, ny - 5, 3, 3);
      c.fillStyle = C.dk; c.fillRect(l - 1, ny - 4, 1, 1); c.fillRect(r, ny - 4, 1, 1);
      }
    }
    const by = y + ph - bh - (big ? 5 : 4), bw = w - (big ? 12 : 10);
    { // chu-lech-khung: tên (và dấu hiệu) trong lòng tấm khung, phía trên thanh máu
      const ma = gkt ? (big ? 'gd-khung-trum' : elite ? 'gd-khung-tinh-anh' : 'gd-khung-trum-nho') : 'gd-khung-nho', vc = [2, 2, 2, 2], tren = [x, y, w, by - y - 0.5];
      let phai = x + w;
      if (o.sub) { const k2 = T.chuTrongKhung(o.sub, x, y, w, ph, { khung: ma, vien: vc, vung: tren, align: 'right', size: 6.5, bold: true, color: '#ffb48a' }); if (k2 && k2.lines[0]) phai = k2.lines[0].x - doChu(k2.lines[0].s, k2.size, true).w - 3; }
      T.chuTrongKhung(name, x, y, w, ph, { khung: ma, vien: vc, vung: [x, y, phai - x, by - y - 0.5], align: o.sub ? 'left' : 'center', size: ns, min: 6.5, bold: true, color: big ? '#ffe2c8' : elite ? '#ffd0a8' : '#ffd9c8' });
    }
    T.bar(x + (big ? 6 : 5), by, bw, elite ? 'hp' : 'boss', o.frac, null, { h: bh, marks: 1, lag: o.lag, col: elite ? '#ff8a3a' : null, hi: elite ? '#ffc890' : null });
    // vạch pha (trùm đổi pha ở 60% và 30% máu)
    const cap = bh >= 7 ? 7 : 2, inner = bw - cap * 2;
    for (const m of o.marks || []) { const px = Math.round(x + (big ? 6 : 5) + cap + inner * m); ui.rect(px, by + 1, 1, bh - 2, '#fff0c4'); ui.rect(px + 1, by + 2, 1, bh - 4, 'rgba(0,0,0,0.5)'); }
    if (big && o.frac != null) txt(Math.max(0, Math.ceil(o.frac * 100)) + '%', x + w / 2, by + bh / 2 + 2.6, { size: 6.5, bold: true, align: 'center', color: '#fff' });
    return y + ph;
  };

  // ---------- thanh máu, mana, kinh nghiệm, máu trùm ----------
  // kind: 'hp' | 'mana' | 'xp' | 'boss' (hoặc o.col, o.hi để tự chọn màu). label: chữ giữa thanh. o: { h, col, hi, marks: số vạch khắc }
  const BARC = { hp: ['#d0482f', '#f08a5a'], mana: ['#3f8fe0', '#8fc6ff'], xp: ['#d9a441', '#f6dc92'], boss: ['#b8452f', '#ff9a6a'] };
  // VẼ TAY 8 ĐỢT 1 (16/10, docs/review/ke-hoach-cai-thien/ve-tay-8-dot-1/bao-cao.md): RUỘT thanh là ẢNH dải lặp ngang thay mảng màu
  // code. gd-ruot-thanh: 5 hàng (đỏ máu, lam mana, vàng tiến độ, xanh lá hồi máu, trắng chớp), mỗi hàng 32×4 điểm game;
  // gd-mau-quai-nho: 3 hàng (đỏ quái thường, cam tinh anh, vàng nhạt phần vừa mất), mỗi hàng 16×2. Ảnh co dọc theo bề dày thanh, lặp
  // theo bề ngang, cạnh điểm ảnh sắc. Thanh trùm ('boss') và thanh tự chọn màu (o.col) vẫn tô code. ?vecode=1 hoặc chưa có ảnh: như cũ.
  const RUOT = { hp: 0, mana: 1, xp: 2 };
  function daiAnh(ma, so, hang, x, y, w, h, c) {
    if (G.VE_CODE === true || !(w > 0) || !(h > 0)) return false;
    const g = gdCo(ma); if (!g || !g.img) return false;
    c = c || G.ux;
    const N = g.net, sh = g.ph / so, tw = g.pw / N, sm = c.imageSmoothingEnabled;
    c.imageSmoothingEnabled = false;
    for (let xx = 0; xx < w; xx += tw) { const ww = Math.min(tw, w - xx); c.drawImage(g.img, 0, hang * sh, ww * N, sh, x + xx, y, ww, h); }
    c.imageSmoothingEnabled = sm;
    return true;
  }
  T.daiAnh = daiAnh; // js/stage.js (thanh máu quái nhỏ) dùng chung
  // Thanh máu tụt dần (VFX Phase 5): mất máu thì phần vừa mất còn hiện màu sáng một chút rồi rút theo sau;
  // hồi máu thì phần được thêm hiện màu xanh lá rồi phần đỏ lấp dần vào, cả thanh sáng nhẹ lên.
  // o.lag: khoá riêng của thanh (tên, hoặc chính đối tượng em bé / trùm / quái) để nhớ trạng thái giữa các khung hình. Cường độ theo G.VFX.giaoDien.
  const LAG = new Map();
  const nowS = () => (window.performance && performance.now ? performance.now() : Date.now()) / 1000;
  function lagOf(id, frac) {
    const now = nowS();
    let st = LAG.get(id);
    if (!st && LAG.size > 160) for (const [k, v] of LAG) if (now - v.last > 5) LAG.delete(k); // dọn thanh của quái đã chết
    if (!st || now - st.last > 0.6) { st = { shown: frac, lag: frac, hold: 0, hit: 0, heal: 0, last: now }; LAG.set(id, st); return st; } // lâu không vẽ (thanh mới): không diễn
    const dt = Math.min(0.1, Math.max(0, now - st.last)); st.last = now;
    if (frac < st.shown - 1e-4) { st.lag = Math.max(st.lag, st.shown); st.shown = frac; st.hold = 0.42; st.hit = 0.14; }
    else if (frac > st.shown + 1e-4) { st.heal = 0.7; st.shown = Math.min(frac, st.shown + Math.max(0.12 * dt, (frac - st.shown) * Math.min(1, dt * 4))); }
    if (st.hold > 0) st.hold -= dt;
    else if (st.lag > st.shown) st.lag = Math.max(st.shown, st.lag - Math.max(0.3 * dt, (st.lag - st.shown) * 2.6 * dt));
    if (st.lag < st.shown) st.lag = st.shown;
    if (st.hit > 0) st.hit -= dt;
    if (st.heal > 0) st.heal -= dt;
    return st;
  }
  // Mục 15 (soát mượt phiên 3, ?uimuot=0 tắt): thanh kinh nghiệm nhớ số đang hiện theo chỗ vẽ (x, y, w); số mới lớn hơn thì chạy tới
  // trong 0,4 giây (ease-out). Số nhỏ đi (lên cấp, đổi em bé) thì hiện ngay số mới. Chỉ là hình: số kinh nghiệm thật không đổi.
  const XP_CHAY = new Map();
  function xpChay(x, y, w, frac) {
    frac = G.clamp(+frac || 0, 0, 1);
    const k = x + '|' + y + '|' + w, now = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
    let m = XP_CHAY.get(k);
    if (!m) { if (XP_CHAY.size > 40) XP_CHAY.clear(); XP_CHAY.set(k, (m = { tu: frac, den: frac, at: now })); return frac; }
    const u = G.clamp((now - m.at) / 0.4, 0, 1), dang = m.tu + (m.den - m.tu) * (1 - (1 - u) * (1 - u) * (1 - u));
    if (Math.abs(frac - m.den) > 1e-6) {
      if (frac < dang - 1e-6) { m.tu = m.den = frac; m.at = now; return frac; }
      m.tu = dang; m.den = frac; m.at = now; return dang;
    }
    return dang;
  }
  T.bar = function (x, y, w, kind, frac, label, o) {
    o = o || {};
    x = Math.round(x); y = Math.round(y); w = Math.round(w);
    const h = o.h || 9, cap = h >= 7 ? 7 : 2, inner = w - cap * 2;
    const gd = G.VFX ? +G.VFX.giaoDien : 1, ls = o.lag && gd > 0 && h >= 6 ? lagOf(o.lag, G.clamp(frac || 0, 0, 1)) : null;
    if (kind === 'xp' && G.UI_MUOT !== false) frac = xpChay(x, y, w, frac); // soát mượt phiên 3 mục 15: thanh kinh nghiệm chạy tới đích 0,4 giây
    const trueFrac = frac;
    if (ls) frac = ls.shown;
    const fw = Math.round(inner * G.clamp(frac || 0, 0, 1)), cols = o.col ? [o.col, o.hi || lighten(o.col, 0.35)] : BARC[kind] || BARC.hp;
    // Soát mượt phiên 3 mục 22 (?venhe=0: như cũ): tấm nhớ chỉ là KHUNG thanh (không có độ dài máu trong khoá) + một tấm vạch khắc;
    // phần đổ màu tô thẳng bằng fillRect. Hình y hệt (cùng thứ tự lớp), nhưng máu đổi không còn sinh tấm mới mỗi lần.
    const nhe = G.VE_NHE !== false, U = G.ux;
    const kR = o.col ? null : RUOT[kind]; // vẽ tay 8 đợt 1: ruột thanh bằng ảnh gd-ruot-thanh (máu / mana / tiến độ)
    const kT = !o.col && kind === 'boss' && G.gop8Bat && G.gop8Bat(); // vẽ tay 8 gộp: ruột thanh máu trùm bằng ảnh gd-ruot-thanh-trum (?gop8=0 tắt)
    const doMau = (px, py, pw, ph, hi) => { if (pw <= 0 || ph <= 0) return; if (kR != null && daiAnh('gd-ruot-thanh', 5, kR, px, py, pw, ph, U)) return; if (kT && daiAnh('gd-ruot-thanh-trum', 1, 0, px, py, pw, ph, U)) return; U.fillStyle = cols[0]; U.fillRect(px, py, pw, ph); if (hi) { U.fillStyle = cols[1]; U.fillRect(px, py, pw, 1); } };
    const vach = (n) => layer('barM|' + inner + '|' + h + '|' + n, inner, h - 4, () => { for (let k = 1; k < n; k++) { const px = Math.round((inner * k) / n); P(px, 0, C.dk); P(px, h - 5, C.dk); if (k * 2 === n) R(px, 0, 1, h - 4, 'rgba(0,0,0,0.5)'); } });
    if (h < 6 && nhe) {
      const iw = Math.round((w - 2) * G.clamp(frac || 0, 0, 1));
      put(layer('barS0|' + w + '|' + h, w, h, () => { R(0, 0, w, h, C.dk); R(1, 1, w - 2, h - 2, '#0d1716'); R(0, 0, 1, h, C.br); R(w - 1, 0, 1, h, C.br); }), x, y);
      doMau(x + 1, y + 1, iw, h - 2, h >= 4);
      return;
    }
    if (h < 6) { // thanh mỏng (dấu ấn, kinh nghiệm nhỏ): viền tối, hai đầu đồng
      const iw = Math.round((w - 2) * G.clamp(frac || 0, 0, 1));
      put(layer('barS|' + w + '|' + h + '|' + cols[0] + '|' + iw, w, h, () => { R(0, 0, w, h, C.dk); R(1, 1, w - 2, h - 2, '#0d1716'); R(1, 1, iw, h - 2, cols[0]); if (h >= 4) R(1, 1, iw, 1, cols[1]); R(0, 0, 1, h, C.br); R(w - 1, 0, 1, h, C.br); }), x, y);
      return;
    }
    // Làn C5: có ảnh thì VỎ thanh (viền, hai đầu, đinh tán) là ảnh 9 mảnh co theo bề ngang; LÒNG thanh (nền tối, phần đổ màu, vạch khắc)
    // vẫn do code vẽ đè lên đúng chỗ cũ, nên máu / mana hiện y như trước. Thanh máu trùm và tinh anh dùng chung vỏ gd-khung-mau.
    const gkh = khungCo(kind === 'mana' ? 'gd-khung-mana' : kind === 'xp' ? 'gd-khung-xp' : 'gd-khung-mau');
    if (gkh) {
      khungDat(khungLop(gkh, 'bar|' + w + '|' + h, w, h + 1, () => { rr(0, 1, w, h, 'rgba(0,0,0,0.5)', 1); khungVe(gkh, 0, 0, w, h); }), x, y, w, h + 1);
      if (nhe) { put(layer('barL0|' + inner + '|' + h, inner, h - 4, () => R(0, 0, inner, h - 4, '#0d1716')), x + cap, y + 2); doMau(x + cap, y + 2, fw, h - 4, true); put(vach(o.marks || 10), x + cap, y + 2); }
      else put(layer('barL|' + w + '|' + h + '|' + cols[0] + '|' + fw + '|' + (o.marks || 10), inner, h - 4, () => {
        R(0, 0, inner, h - 4, '#0d1716');
        R(0, 0, fw, h - 4, cols[0]); R(0, 0, fw, 1, cols[1]);
        const n = o.marks || 10;
        for (let k = 1; k < n; k++) { const px = Math.round((inner * k) / n); P(px, 0, C.dk); P(px, h - 5, C.dk); if (k * 2 === n) R(px, 0, 1, h - 4, 'rgba(0,0,0,0.5)'); }
      }), x + cap, y + 2);
    } else if (nhe) {
      put(layer('bar0|' + w + '|' + h, w, h + 1, () => {
        rr(0, 1, w, h, 'rgba(0,0,0,0.5)', 1);
        rr(0, 0, w, h, C.dk, 1); rr(1, 1, w - 2, h - 2, C.br, 1); R(2, 1, w - 4, 1, C.hi);
        R(cap, 2, inner, h - 4, '#0d1716');
        if (cap >= 7) for (const ex of [2, w - 6]) { R(ex, (h >> 1) - 1, 4, 3, C.dk); P(ex + 1, h >> 1, C.gold); P(ex + 2, h >> 1, C.gold); } // đinh tán hai đầu
      }), x, y);
      doMau(x + cap, y + 2, fw, h - 4, true);
      put(vach(o.marks || 10), x + cap, y + 2);
    } else {
    const cv = layer('bar|' + w + '|' + h + '|' + cols[0] + '|' + fw + '|' + (o.marks || 10), w, h + 1, () => {
      rr(0, 1, w, h, 'rgba(0,0,0,0.5)', 1);
      rr(0, 0, w, h, C.dk, 1); rr(1, 1, w - 2, h - 2, C.br, 1); R(2, 1, w - 4, 1, C.hi);
      R(cap, 2, inner, h - 4, '#0d1716');
      R(cap, 2, fw, h - 4, cols[0]); R(cap, 2, fw, 1, cols[1]);
      const n = o.marks || 10; // vạch khắc từng phần mười
      if (h >= 6) for (let k = 1; k < n; k++) { const px = cap + Math.round((inner * k) / n); P(px, 2, C.dk); P(px, h - 3, C.dk); if (k * 2 === n) R(px, 2, 1, h - 4, 'rgba(0,0,0,0.5)'); }
      if (cap >= 7) for (const ex of [2, w - 6]) { R(ex, (h >> 1) - 1, 4, 3, C.dk); P(ex + 1, h >> 1, C.gold); P(ex + 2, h >> 1, C.gold); } // đinh tán hai đầu
    });
    put(cv, x, y);
    }
    if (ls) {
      const c = G.ux, ga = c.globalAlpha, lw = Math.round(inner * G.clamp(ls.lag, 0, 1)), tw = Math.round(inner * G.clamp(trueFrac || 0, 0, 1));
      if (lw > fw) { // phần vừa mất: chớp trắng rồi vàng nhạt, rút dần về
        c.globalAlpha = ga * Math.min(1, 0.9 * gd);
        if (!(kR != null && (ls.hit > 0 ? daiAnh('gd-ruot-thanh', 5, 4, x + cap + fw, y + 2, lw - fw, h - 4, c) : daiAnh('gd-mau-quai-nho', 3, 2, x + cap + fw, y + 2, lw - fw, h - 4, c)))) {
          c.fillStyle = ls.hit > 0 ? '#fff6e0' : '#ffd98a'; c.fillRect(x + cap + fw, y + 2, lw - fw, h - 4);
          c.fillStyle = '#ffffff'; c.globalAlpha = ga * 0.5 * Math.min(1, gd); c.fillRect(x + cap + fw, y + 2, lw - fw, 1);
        }
      }
      if (tw > fw) { // phần đang hồi: xanh lá, lấp dần
        c.globalAlpha = ga * Math.min(1, 0.85 * gd);
        if (!(kR != null && daiAnh('gd-ruot-thanh', 5, 3, x + cap + fw, y + 2, tw - fw, h - 4, c))) {
          c.fillStyle = '#7fe060'; c.fillRect(x + cap + fw, y + 2, tw - fw, h - 4);
          c.fillStyle = '#d8ffc0'; c.globalAlpha = ga * Math.min(1, gd); c.fillRect(x + cap + fw, y + 2, tw - fw, 1);
        }
      }
      if (ls.heal > 0 && fw > 0) { c.fillStyle = '#c8ffb0'; c.globalAlpha = ga * 0.3 * Math.min(1, gd) * Math.sin((ls.heal / 0.7) * Math.PI); c.fillRect(x + cap, y + 2, fw, h - 4); }
      if (ls.hit > 0 && fw > 0) { c.globalAlpha = ga * 0.35 * Math.min(1, gd) * (ls.hit / 0.14); if (!(kR != null && daiAnh('gd-ruot-thanh', 5, 4, x + cap, y + 2, fw, h - 4, c))) { c.fillStyle = '#ffffff'; c.fillRect(x + cap, y + 2, fw, h - 4); } }
      c.globalAlpha = ga;
    }
    if (label) {
      const lb = String(label);
      if (chuFont() && !(DIGIT.test(lb) && lb.length >= 3 && HAS.test(mark(lb)))) { // chu-giua-font-that: số trên thanh giữa thanh theo thân chữ thật (trước: đường cơ sở cố định +2,6)
        const f = ui.fs(o.size || 6.5), m = T.hopMuc(G.LANG !== 'vi' && G.tv ? G.tv(lb) : lb, true);
        txt(label, x + w / 2 + (m.w / 2 - (m.r - m.l) / 2) * f, y + h / 2 + (m.ab * f) / 2, { size: o.size || 6.5, bold: true, align: 'center', color: '#fff' });
      } else txt(label, x + w / 2, y + h / 2 + 2.6, { size: o.size || 6.5, bold: true, align: 'center', color: '#fff' });
    }
  };
  T.lagOf = lagOf; // thanh máu nhỏ trên đầu quái (js/stage.js) dùng chung cách tụt dần

  // ---------- ô đồ bốn bậc ----------
  // rar: 0 Thường, 1 Lam, 2 Tím, 3 Vàng. o: { sel, dim }. Hình món đồ do nơi gọi vẽ lên sau, tâm tại (x + s/2, y + s/2).
  T.slot = function (x, y, s, rar, o) {
    o = o || {};
    x = Math.round(x); y = Math.round(y); s = Math.round(s); rar = 0; // 14/10: không còn bậc màu cũ (15/10 don-tep B: bỏ cờ ?vkcu=1)
    // Làn C5: có ảnh thì khung ô là ảnh 9 mảnh co theo cỡ ô (20 đến 70). Ô đang chọn dùng tệp -chon, phủ rộng hơn 1 điểm mỗi bên như vòng sáng của hình code;
    // thiếu tệp -chon thì dùng tệp thường và game tự vẽ vòng sáng. Bóng và màu lót lòng ô (xanh ngọc tối, đặc như hình code) do game vẽ dưới ảnh.
    const gkc = o.sel ? khungCo('gd-o-do-' + rar + '-chon') : null, gko = gkc || khungCo('gd-o-do-' + rar);
    if (gko) {
      const vong = !gkc && !!o.sel;
      khungDat(khungLop(gko, 'sl|' + s + '|' + (vong ? 1 : 0), s + 2, s + 3, () => {
        const X = 1, Y = 1;
        rr(X, Y + 1, s, s, 'rgba(0,0,0,0.5)', 2);
        R(X + 2, Y + 2, s - 4, s - 4, C.bg);
        if (vong) frame(X - 1, Y - 1, s + 2, s + 2, C.hi);
        if (gkc) khungVe(gko, 0, 0, s + 2, s + 2); else khungVe(gko, X, Y, s, s);
      }), x - 1, y - 1, s + 2, s + 3, o.dim ? 0.5 : 1);
      return;
    }
    const cv = layer('sl|' + s + '|' + rar + '|' + (o.sel ? 1 : 0), s + 2, s + 3, () => {
      const X = 1, Y = 1;
      rr(X, Y + 1, s, s, 'rgba(0,0,0,0.5)', 2);
      rr(X, Y, s, s, C.dk, 2); rr(X + 1, Y + 1, s - 2, s - 2, C.br, 2); R(X + 3, Y + 1, s - 6, 1, C.hi);
      R(X + 3, Y + 3, s - 6, s - 6, RARD[rar]); frame(X + 3, Y + 3, s - 6, s - 6, RAR[rar]); R(X + 5, Y + 5, s - 10, s - 10, C.bg);
      for (const q of [[X + 2, Y + 2], [X + s - 4, Y + 2], [X + 2, Y + s - 4], [X + s - 4, Y + s - 4]]) R(q[0], q[1], 2, 2, RAR[rar]); // bốn đinh tán màu bậc
      if (rar === 3 && s >= 20) saw(X + 5, Y + 5, s - 10, C.gold, false);
      if (o.sel) frame(X - 1, Y - 1, s + 2, s + 2, C.hi);
    });
    put(cv, x - 1, y - 1, o.dim ? 0.5 : 1);
  };

  // ---------- sao ----------
  T.stars = function (cx, y, n, of, o) {
    o = o || {}; of = of || 3;
    const size = o.size || 8;
    txt('★'.repeat(n) + '☆'.repeat(Math.max(0, of - n)), cx, y, { size, align: 'center', color: o.color || '#ffd23f' });
  };

  // ---------- thẻ ải mặt trống ----------
  // st: 'done' đã qua (kèm sao) | 'open' đã mở, chưa qua | 'sel' đang chọn | 'lock' chưa mở. o: { boss: ải trùm (trống to hơn), r, noClick }
  // (x, y, w, h) là vùng chạm; mặt trống nằm giữa phía trên, sao nằm dưới. Trả về true khi được bấm (kể cả ải chưa mở thì không).
  // Điểm neo thẻ ải ảnh (tỉ lệ rộng, cao của ảnh) — dựng bằng docs/review/ke-hoach-cai-thien/npc-ban-do-bao-truoc/cong-cu/dung-the-ai.py
  const THE_NEO = { 'gd-the-ai': [0.514, 0.4], 'gd-the-trum': [0.578, 0.679] }; // thẻ thường: giữa mặt bia; thẻ trùm: mặt đồng
  // Khoảng từ điểm ải (chỗ viết số) xuống đáy thẻ ảnh (điểm game), để nơi gọi viết sao / sức mạnh ngay dưới thẻ. null: thẻ vẽ code.
  T.theDuoi = function (boss) { const ten = boss ? 'gd-the-trum' : 'gd-the-ai', ga = gdCo(ten); return ga && THE_NEO[ten] ? (1 - THE_NEO[ten][1]) * ga.cao : null; };
  T.stageCard = function (x, y, w, h, label, st, stars, o) {
    o = o || {};
    x = Math.round(x); y = Math.round(y);
    const r = o.r || (o.boss ? 17 : 15), sel = st === 'sel', lock = st === 'lock';
    const cw = r * 2 + 18, chh = r * 2 + 10;
    // Phiên C3: thẻ ải bằng ảnh. Tệp thường = ải đã mở / đã qua; -chon = đang chọn; -khoa = chưa mở.
    // Thiếu -chon / -khoa thì game tự làm sáng / làm tối tệp thường (thẻ khoá tự làm có thêm ổ khoá nhỏ vẽ code). Số ải và sao vẫn do game viết.
    const tenGd = o.boss ? 'gd-the-trum' : 'gd-the-ai';
    let khoaCode = false;
    const ga = lock ? gdCo(tenGd + '-khoa') || ((khoaCode = true) && gdBien(gdCo(tenGd), 'toi')) : sel ? gdCo(tenGd + '-chon') || gdBien(gdCo(tenGd), 'sang') : gdCo(tenGd);
    const cv = ga ? null : layer('sc|' + r + '|' + st + '|' + (o.boss ? 1 : 0), cw, chh, () => {
      const cx = cw >> 1, cy = r + 4;
      disc(cx + 1, cy + 2, r, 'rgba(0,0,0,0.5)');
      if (sel) { for (let k = 0; k < 24; k++) { const an = (k * Math.PI) / 12; P(cx + Math.round(Math.cos(an) * (r + 3)), cy + Math.round(Math.sin(an) * (r + 3)), C.hi); } ring(cx, cy, r + 1, 1, C.hi); }
      for (const sx of [cx - r - 5, cx + r]) { R(sx, cy - 4, 6, 9, lock ? '#1c2c2a' : C.dk); R(sx + 1, cy - 3, 4, 7, lock ? '#35524c' : C.br); R(sx + 2, cy - 2, 2, 5, lock ? '#26403c' : C.patD); } // quai trống
      drum(cx, cy, r, { dull: lock, lit: sel, mid: sel || o.boss ? C.cop : C.patD, n: o.boss ? 14 : 12 });
      disc(cx, cy, Math.min(7, Math.round(r * 0.5)), lock ? '#1c2c2a' : C.dk);
      if (lock) bmp(cx - 2, cy - 3, BM.lock, { a: '#7f948e' });
    });
    const cx = x + w / 2, top = y + (o.top || 0);
    const cy = top + r + 4;
    const neo = ga && THE_NEO[tenGd];
    if (ga && neo) { // 14/10: thẻ bia đá (docs/anh-goc/giao-dien/the-o-ai-6.png): vẽ đúng cỡ ảnh, điểm neo trùng chỗ game viết số ải
      gdVe(ga, Math.round(cx - neo[0] * ga.rong), Math.round(cy - neo[1] * ga.cao), ga.rong, ga.cao);
      if (lock && khoaCode) put(layer('sc|khoa', 5, 7, () => bmp(0, 0, BM.lock, { a: '#7f948e' })), Math.round(cx) - 2, cy - 3);
    } else if (ga) { // ảnh đặt sao cho tâm ảnh trùng tâm mặt trống của hình code (chỗ game viết số ải)
      gdVe(ga, Math.round(cx - cw / 2), top - 1, cw, chh);
      if (lock && khoaCode) put(layer('sc|khoa', 5, 7, () => bmp(0, 0, BM.lock, { a: '#7f948e' })), Math.round(cx - cw / 2) + (cw >> 1) - 2, cy - 3);
    } else put(cv, Math.round(cx - cw / 2), top);
    if (!lock) {
      const big = r >= 14, ls = big ? (String(label).length > 1 ? 9 : 11) : 8;
      txt(String(label), cx, cy + ls * 0.35, { size: ls, bold: true, align: 'center', color: C.ink });
      if (o.noStars) { /* nơi gọi tự vẽ sao */ }
      else if (st !== 'open' || stars > 0) T.stars(cx, top + r * 2 + (big ? 14 : 12), stars || 0, 3, { size: big ? 8 : 6.5 });
      else if (st === 'open') txt('mới', cx, top + r * 2 + (big ? 14 : 12), { size: big ? 7 : 6.5, bold: true, align: 'center', color: '#9be07a' });
    } else if (r >= 14) txt('chưa mở', cx, top + r * 2 + 14, { size: 6.5, align: 'center', color: '#8fa49e' });
    return !o.noClick && !lock && clicked(x, y, w, h);
  };

  // ---------- dải thông báo ----------
  // o: { size, center: chữ ở giữa, col: màu chữ }
  // o.age, o.left (giây đã hiện, giây còn lại): dải nảy xuống một nhịp khi hiện, mờ dần khi sắp tắt (theo G.VFX.giaoDien).
  T.toast = function (x, y, w, text, o) {
    o = o || {};
    x = Math.round(x); y = Math.round(y); w = Math.round(w);
    const gd = G.VFX ? +G.VFX.giaoDien : 1, c0 = G.ux, ga0 = c0.globalAlpha;
    if (o.age != null && gd > 0) {
      const a = o.age;
      y += a < 0.14 ? -Math.round(5 * (1 - a / 0.14)) : a < 0.26 ? 1 : 0;
      c0.globalAlpha = ga0 * Math.min(a < 0.12 ? 0.3 + (a / 0.12) * 0.7 : 1, o.left != null && o.left < 0.3 ? Math.max(0, o.left / 0.3) : 1);
    }
    try { toastBody(x, y, w, text, o); } finally { c0.globalAlpha = ga0; }
  };
  function toastBody(x, y, w, text, o) {
    const h = 18;
    const gt = khungCo('gd-dai-thong-bao'); // 15/10 (khung-gd-con): dải thông báo bằng ảnh (2 đầu nhọn giữ nguyên, giữa lặp hoa văn)
    if (gt) khungDat(khungLop(gt, 'toast|' + w, w, h + 2, () => { R(3, 2, w - 6, h, 'rgba(0,0,0,0.35)'); khungVeDeu(gt, 0, 0, w, h); }), x, y, w, h + 2);
    const cv = gt ? null : layer('t|' + w, w, h + 2, () => {
      for (let j = 0; j < h; j++) { const d = Math.abs(j - (h - 1) / 2) | 0, ins = Math.max(0, d - 2); R(ins, j + 2, w - ins * 2, 1, 'rgba(0,0,0,0.4)'); }
      for (let j = 0; j < h; j++) { const d = Math.abs(j - (h - 1) / 2) | 0, ins = Math.max(0, d - 2); R(ins, j, w - ins * 2, 1, C.dk); R(ins + 1, j, w - ins * 2 - 2, 1, j === 0 || j === h - 1 ? C.dk : C.br); }
      R(8, 1, w - 16, 1, C.hi);
      R(12, 3, w - 24, h - 6, C.patD); frame(12, 3, w - 24, h - 6, C.dk);
      ring(6, 9, 2, 1, C.hi); ring(w - 7, 9, 2, 1, C.hi);
    });
    if (cv) put(cv, x, y);
    const size = o.size || 8.5;
    T.chuTrongKhung(text, x, y, w, h, { khung: 'gd-dai-thong-bao', vien: [3, 12, 3, 12], size, bold: true, color: o.col || C.ink }); // chu-lech-khung
  }
  // Rộng vừa đủ chữ, đặt giữa quanh cx
  T.toastFit = function (cx, y, text, o) {
    o = o || {};
    ui.font(o.size || 8.5, true);
    const w = Math.min(470, Math.ceil(G.ux.measureText(text).width) + 40);
    T.toast(G.clamp(cx - w / 2, 2, 478 - w), y, w, text, o);
  };

  // ---------- dải tài nguyên trên cùng ----------
  // parts: [[chữ, màu], ...] xếp từ trái; right: chữ bên phải (tên hero, cấp)
  T.topBar = function (items, right) {
    const mx = Math.ceil(G.mx || 0), w = 480 + mx * 2;
    // 14/10: thanh ảnh AI (gd-thanh-tren): đầu mây hai bên thò ra ngoài màn 10 điểm; 8 tài nguyên chia 4 ô bằng vạch (gd-thanh-tren-vach):
    // vàng + quặng · 3 nguyên liệu · 3 mảnh · chữ bên phải. Vị trí chữ và vùng chạm giữ như cũ (tính lại cùng cách T.resRow).
    const gb = khungCo('gd-thanh-tren');
    if (gb) {
      khungDat(khungLop(gb, 'tren|' + w, w + 20, 17, () => { R(0, 15, w + 20, 1, 'rgba(0,0,0,0.35)'); khungVe(gb, 0, 0, w + 20, 16); }), -mx - 10, 0, w + 20, 17);
      const gv = khungCo('gd-thanh-tren-vach');
      if (gv && items && items.length >= 8) { // vùng 4: ô mảnh thứ 4 (9 tài nguyên) vẫn chia như cũ
        const size = 7.5, ih = Math.round(size * 1.05 * 2) / 2, gap = 8, vach = [];
        let x = 6; ui.font(size, true);
        items.forEach((q, i) => { const e = x + ih + 1.5 + G.ux.measureText(String(q[1])).width; if (i === 1 || i === 4) vach.push(e + gap / 2); x = e + gap; });
        if (right) { ui.font(7.5, true); const px = 474 - G.ux.measureText(String(right)).width - 6; if (px > x + 2) vach.push(px); }
        for (const px of vach) gdVe(gv, Math.round(px - gv.rong / 2), 0, gv.rong, 16);
      }
      T.resRow(items, 6, 10.5, { size: 7.5, gap: 8 });
      if (right) oldText(right, 474, 10.5, { size: 7.5, bold: true, align: 'right', color: C.hi });
      return;
    }
    put(layer('top|' + w, w, 17, () => {
      R(0, 0, w, 14, 'rgba(13,26,26,0.93)'); R(0, 14, w, 1, C.br); R(0, 15, w, 1, C.dk);
      for (let i = 2; i < w - 4; i += 8) { P(i, 13, C.brD); P(i + 1, 12, C.brD); P(i + 2, 13, C.brD); } // răng cưa nhỏ sát mép
    }), -mx, 0);
    T.resRow(items, 6, 10.5, { size: 7.5, gap: 8 });
    if (right) oldText(right, 474, 10.5, { size: 7.5, bold: true, align: 'right', color: C.hi });
  };

  // ---------- khung thoại của người làng ----------
  // Khung chữ có thẻ tên bằng đồng ở góc trên trái. Trả về chiều cao khung. o: { size, face(ctx, cx, cy): hàm vẽ khuôn mặt }
  T.dialog = function (x, y, w, name, text, o) {
    o = o || {};
    const size = o.size || 8, lines = ui.wrap(text, w - 14, size, true), h = Math.max(24, lines.length * (size + 3) + 15);
    x = Math.round(x); y = Math.round(y); w = Math.round(w);
    ui.font(7.5, true);
    const nw = name ? Math.ceil(G.ux.measureText(name).width) + 12 : 0;
    const th = 14; // chu-lech-khung: thẻ tên cao 12 chỉ có lòng 8 điểm, chữ có dấu (Ông, Thợ) cao ~9 → thẻ cao 14 (lòng 10)
    // 14/10: hộp thoại ảnh AI (gd-khung-thoai, cuộn giấy hai trục): thẻ tên, đuôi, chữ vẽ như cũ; chữ nâu sẫm trên giấy kem
    const gt = khungCo('gd-khung-thoai');
    if (gt) {
      const tx = o.tail == null ? 18 : o.tail;
      // hai trục cuộn thò ra ngoài hộp 6 điểm mỗi bên, để chữ (bắt đầu ở x + 7 như cũ) nằm trên giấy, không đè lên trục
      const L = 6;
      khungDat(khungLop(gt, 'thoai|' + w + '|' + h + '|' + nw + '|' + tx + '|' + th, w + 2 + L * 2, h + 10, () => {
        const Y = 7;
        rr(L + 1, Y + 2, w, h, 'rgba(0,0,0,0.45)', 2);
        khungVeDeu(gt, 0, Y - 2, w + L * 2, h + 4);
        if (nw) { rr(L + 6, 0, nw, th, C.dk, 2); rr(L + 7, 1, nw - 2, th - 2, C.br, 1); R(L + 8, 2, nw - 4, th - 4, C.patD); R(L + 9, 1, nw - 6, 1, C.hi); }
        if (tx >= 0) for (let i = 0; i < 5; i++) { R(L + tx + i, Y + h - 1 + i, 9 - i * 2 > 0 ? 9 - i * 2 : 1, 1, i === 0 ? '#f3e8c8' : C.dk); if (9 - i * 2 > 2) R(L + tx + i + 1, Y + h - 1 + i, 7 - i * 2, 1, '#f3e8c8'); }
      }), x - L, y - 7, w + 2 + L * 2, h + 10);
      // chu-lech-khung: thẻ tên + lời thoại trong lòng cuộn giấy
      if (name) T.chuTrongKhung(name, x + 6, y - 7, nw, th, { vien: [2, 2, 2, 2], size: 7.5, bold: true, color: C.hi });
      T.chuTrongKhung(text, x - L, y - 2, w + L * 2, h + 4, { khung: 'gd-khung-thoai', vien: [7, 11, 6, 11], align: 'left', dong: lines.length + 1, gian: 3, size, min: Math.min(size, 7), bold: true, color: '#2a1a14', shadow: false });
      return h;
    }
    put(layer('dlg|' + w + '|' + h + '|' + nw + '|' + th, w + 2, h + 10, () => {
      const Y = 7;
      rr(1, Y + 2, w, h, 'rgba(0,0,0,0.45)', 2);
      rr(0, Y, w, h, C.dk, 2); rr(1, Y + 1, w - 2, h - 2, C.br, 2); R(3, Y + 1, w - 6, 1, C.hi);
      R(2, Y + 2, w - 4, h - 4, '#f3e8c8'); frame(3, Y + 3, w - 6, h - 6, '#d9c89a');
      for (const q of [[3, Y + 3], [w - 5, Y + 3], [3, Y + h - 5], [w - 5, Y + h - 5]]) R(q[0], q[1], 2, 2, C.br);
      if (nw) { rr(6, 0, nw, th, C.dk, 2); rr(7, 1, nw - 2, th - 2, C.br, 1); R(8, 2, nw - 4, th - 4, C.patD); R(9, 1, nw - 6, 1, C.hi); }
      // đuôi chỉ xuống người đang nói
      const tx = o.tail == null ? 18 : o.tail; if (tx >= 0) for (let i = 0; i < 5; i++) { R(tx + i, Y + h - 1 + i, 9 - i * 2 > 0 ? 9 - i * 2 : 1, 1, i === 0 ? '#f3e8c8' : C.dk); if (9 - i * 2 > 2) R(tx + i + 1, Y + h - 1 + i, 7 - i * 2, 1, '#f3e8c8'); }
    }), x, y - 7);
    if (name) T.chuTrongKhung(name, x + 6, y - 7, nw, th, { vien: [2, 2, 2, 2], size: 7.5, bold: true, color: C.hi });
    T.chuTrongKhung(text, x, y, w, h, { vien: [3, 5, 3, 5], align: 'left', dong: lines.length + 1, gian: 3, size, min: Math.min(size, 7), bold: true, color: '#2a1a14', shadow: false });
    return h;
  };

  // ---------- khung thẻ ở màn kết quả, thẻ phần thưởng ----------
  // o: { rar: viền theo bậc 0..3, sel, title: chữ nhỏ trên đầu thẻ }
  T.card = function (x, y, w, h, o) {
    o = o || {};
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    const rar = o.rar == null ? -1 : G.clamp(o.rar | 0, 0, 3), st = o.sel ? 1 : 0;
    // Làn C5: có ảnh thì viền thẻ là ảnh 9 mảnh co cả hai chiều. Thẻ đang bấm / đang chọn: game tự làm sáng ảnh và lót lòng sáng hơn (như hình code).
    // Thẻ theo bậc (màn kết quả): game kẻ thêm một đường chỉ màu bậc đè lên vành ảnh, sát trong viền ngoài. Bóng và màu lót lòng thẻ do game vẽ.
    const gk0 = khungCo('gd-the-thuong'), gkd = gk0 && st ? gdBien(gk0, 'sang') || gk0 : gk0;
    if (gkd) {
      khungDat(khungLop(gkd, 'cd|' + w + '|' + h + '|' + rar + '|' + st, w + 2, h + 3, () => {
        const X = 1, Y = 1;
        rr(X, Y + 2, w, h, 'rgba(0,0,0,0.5)', 2);
        R(X + 2, Y + 2, w - 4, h - 4, C.dk); R(X + 3, Y + 3, w - 6, h - 6, st ? '#2f6a60' : rar >= 0 ? C.bg2 : '#1b3a3b');
        khungVe(gkd, X, Y, w, h);
        if (rar >= 0) { const e = RAR[rar]; R(X + 3, Y + 1, w - 6, 1, e); R(X + 3, Y + h - 2, w - 6, 1, e); R(X + 1, Y + 3, 1, h - 6, e); R(X + w - 2, Y + 3, 1, h - 6, e); } // đường chỉ màu bậc, đúng chỗ vành màu bậc của hình code (không lấn vào chữ)
      }), x - 1, y - 1, w + 2, h + 3);
      if (o.title) tieuDeThe(o.title, x, y, w, h, true);
      return;
    }
    put(layer('cd|' + w + '|' + h + '|' + rar + '|' + st, w + 2, h + 3, () => {
      const X = 1, Y = 1, edge = rar >= 0 ? RAR[rar] : st ? C.hi : C.br;
      rr(X, Y + 2, w, h, 'rgba(0,0,0,0.5)', 2);
      rr(X, Y, w, h, C.dk, 2); rr(X + 1, Y + 1, w - 2, h - 2, edge, 2); if (rar < 0) R(X + 3, Y + 1, w - 6, 1, C.hi);
      R(X + 2, Y + 2, w - 4, h - 4, C.dk); R(X + 3, Y + 3, w - 6, h - 6, st ? '#2f6a60' : rar >= 0 ? C.bg2 : '#1b3a3b');
      if (h >= 30) { saw(X + 4, Y + 3, w - 8, rar >= 0 ? RARD[rar] : C.brD, false); saw(X + 4, Y + h - 6, w - 8, rar >= 0 ? RARD[rar] : C.brD, true); }
      for (const q of [[X + 3, Y + 3], [X + w - 5, Y + 3], [X + 3, Y + h - 5], [X + w - 5, Y + h - 5]]) R(q[0], q[1], 2, 2, edge);
    }), x - 1, y - 1);
    if (o.title) tieuDeThe(o.title, x, y, w, h, false);
  };

  function tieuDeThe(title, x, y, w, h, anh) { // chữ nhỏ đầu thẻ: trái, trong lòng thẻ (chu-lech-khung)
    T.chuTrongKhung(title, x, y, w, h, { khung: anh ? 'gd-the-thuong' : null, vien: h >= 30 ? [5, 4, 5, 4] : [3, 4, 3, 4], vung: [x + 5, y, w - 5, 15], align: 'left', size: 6.5, bold: false, color: C.sub });
  }
  // ---------- tài nguyên hiện bằng biểu tượng, không dùng chữ ----------
  // Mỗi tài nguyên một hình pixel 7x7. Chạm vào biểu tượng thì hiện tên trong chốc lát.
  const RES = {
    gold: { rows: ['..ooo..', '.oyyyo.', 'oywyyyo', 'oyyyyyo', 'oyyyydo', '.oyddo.', '..ooo..'], pal: { o: '#7a4a10', y: '#ffd23f', w: '#fff6c0', d: '#e0a020' } },
    ore: { rows: ['...kk..', '..kggk.', '.kgwggk', 'kggggdk', 'kgggddk', '.kdddk.', '..kkk..'], pal: { g: '#c9ccd2', w: '#ffffff', d: '#8a8f98', k: '#2a2e36' } },
    stone: { rows: ['...k...', '..kpk..', '.kpwpk.', 'kpppppk', '.kpdpk.', '..kdk..', '...k...'], pal: { p: '#d48af5', w: '#ffffff', d: '#8a4ab0', k: '#34143f' } },
    mat0: { rows: ['.....gg', '...kgg.', 'kkkkkk.', 'kbbbbok', 'kbdbbok', 'kkkkkk.', '.......'], pal: { b: '#a06a3a', d: '#6a4424', o: '#f0d090', g: '#9bd14a', k: '#2e1c10' } },
    mat1: { rows: ['...k...', '..kbk..', '.kbwbk.', 'kbbbbbk', 'kbdbdbk', 'kbbbbbk', '.kkkkk.'], pal: { b: '#7fd4ff', w: '#ffffff', d: '#3f8be0', k: '#143a6a' } },
    mat2: { rows: ['...r...', '..ry...', '.kryrk.', 'krryork', 'kroyork', '.krrrk.', '..kkk..'], pal: { r: '#ff7a2a', y: '#ffe07a', o: '#ffb040', k: '#4a1408' } },
    shard0: { rows: ['....k..', '...kak.', '..kaak.', '.kawak.', '.kaaak.', 'kaaadk.', 'kkkkkk.'], pal: { a: '#8ac84a', w: '#eaffc0', d: '#4a8a2a', k: '#1e3a12' } },
    shard1: { rows: ['....k..', '...kak.', '..kaak.', '.kawak.', '.kaaak.', 'kaaadk.', 'kkkkkk.'], pal: { a: '#5ab0f0', w: '#e0f4ff', d: '#2a6ab0', k: '#12284a' } },
    shard2: { rows: ['....k..', '...kak.', '..kaak.', '.kawak.', '.kaaak.', 'kaaadk.', 'kkkkkk.'], pal: { a: '#ff8a4a', w: '#fff0d0', d: '#c04a1a', k: '#4a1a08' } },
    shard3: { rows: ['....k..', '...kak.', '..kaak.', '.kawak.', '.kaaak.', 'kaaadk.', 'kkkkkk.'], pal: { a: '#4ac0a0', w: '#d8fff0', d: '#1e7a6a', k: '#0a3a30' } }, // vùng 4 Sông sâu (mảnh Thuồng Luồng)
    xp: { rows: ['...c...', '...c...', '..cwc..', 'ccwwwcc', '..cwc..', '...c...', '...c...'], pal: { c: '#8fd0ff', w: '#ffffff' } },
  };
  T.RES = RES;
  T.resName = function (kind) {
    const R = G.REGIONS || [];
    if (kind === 'gold') return 'Vàng'; if (kind === 'ore') return G.luyen && G.luyen.bat() ? 'Nguyên liệu rèn' : 'Quặng'; /* 17/10: Luyện bật thì ô quặng là nguyên liệu rèn */ if (kind === 'stone') return 'Đá tôi'; if (kind === 'xp') return 'Kinh nghiệm';
    const i = +kind.slice(-1);
    if (kind.indexOf('mat') === 0) return R[i] ? R[i].mat : 'Nguyên liệu';
    return R[i] ? G.t('Mảnh trùm {0}', R[i].bossName) : 'Mảnh trùm';
  };
  // Vẽ biểu tượng tài nguyên, cao h (đơn vị giao diện), góc trên trái tại (x, y).
  T.resIcon = function (kind, x, y, h) {
    const d = RES[kind]; if (!d) return;
    const cv = layer('res|' + kind, 7, 7, () => bmp(0, 0, d.rows, d.pal));
    const c = G.ux, sm = c.imageSmoothingEnabled; h = h || 7;
    c.imageSmoothingEnabled = false; c.drawImage(cv, x, y, h, h); c.imageSmoothingEnabled = sm;
  };
  // Vùng chạm của các biểu tượng đã vẽ trong khung hình này, và tên đang hiện
  let zones = [], tip = null;
  function zone(kind, x, y, w, h) { if (zones.length < 200) zones.push([kind, x, y, w, h]); }
  // Gọi sau khi một cảnh vẽ xong: lần chạm nào chưa bị nút nào nhận mà trúng một biểu tượng thì hiện tên của nó.
  T.endFrame = function () {
    NUT0 = NUT; NUT = []; // vùng chạm 44 pt: các nút của khung này dùng để so ở khung sau
    if (G.click) for (const z of zones) if (G.inRect(G.click, z[1] - 3, z[2] - 6, z[3] + 6, z[4] + 12)) { tip = { s: T.resName(z[0]), x: z[1] + z[3] / 2, y: z[2], t: G.time + 1.8 }; G.click = null; break; }
    zones = [];
    if (tip && G.time < tip.t) {
      ui.font(7.5, true);
      const w = Math.ceil(G.ux.measureText(tip.s).width) + 12, x = G.clamp(tip.x - w / 2, 2, 478 - w), y = tip.y < 20 ? tip.y + 11 : tip.y - 16;
      T.plate(x, y, w, 14);
      T.chuTrongKhung(tip.s, x, y, w, 14, { khung: 'gd-khung-nho', vien: [2, 2, 2, 2], size: 7.5, bold: true, color: C.hi }); // chu-lech-khung
    } else tip = null;
  };
  T.tipNow = () => (tip && G.time < tip.t ? tip.s : null);
  // Chữ có số lượng tài nguyên ("400 vàng", "+5 quặng", "2 mảnh Mộc Tinh"): thay tên tài nguyên bằng biểu tượng đứng sau con số.
  let RES_RE = null, RES_MAP = null, RES_LANG = null;
  function resRe() {
    if (RES_RE && RES_LANG === G.LANG) return RES_RE;
    RES_LANG = G.LANG; marked.clear();
    RES_MAP = { 'vàng': 'gold', 'quặng': 'ore', 'đá tôi': 'stone', 'kinh nghiệm': 'xp' };
    (G.REGIONS || []).forEach((r, i) => { if (!r.matChung) RES_MAP[r.mat.toLowerCase()] = 'mat' + i; RES_MAP['mảnh ' + r.bossName.toLowerCase()] = 'shard' + i; }); // matChung: vùng 4 không có nguyên liệu riêng
    if (G.LANG !== 'vi') {
      // Ngôn ngữ khác: tên tài nguyên lấy từ từ điển (js/ngon_ngu.js), nhận cả dạng số nhiều có "s" ("3 whetstones").
      const vi = RES_MAP; RES_MAP = {};
      for (const k in vi) { const w = String(G.t(k)).toLowerCase(); RES_MAP[w] = vi[k]; RES_MAP[w + 's'] = vi[k]; }
    }
    const words = Object.keys(RES_MAP).sort((a, b) => b.length - a.length).map((w) => w.replace(/ /g, '[ \\u00a0]'));
    RES_RE = new RegExp('([+~]?\\d[\\d.,]*)[ \\u00a0](' + words.join('|') + ')(?![\\wÀ-ỹ])', 'gi');
    return RES_RE;
  }
  const oldText = ui.text, oldWrap = ui.wrap;
  // Đổi "số + tên tài nguyên" thành "số + một ký tự riêng" (mỗi loại tài nguyên một ký tự); lúc vẽ ký tự đó hiện thành biểu tượng.
  const KINDS = Object.keys(RES), PUA = 0xe000;
  const DIGIT = /\d/, marked = new Map();
  if (G.ngonNgu) G.ngonNgu.khiDoi.push(() => { marked.clear(); RES_RE = null; }); // đổi ngôn ngữ: tên tài nguyên đổi theo
  function mark(str) {
    if (G.LANG !== 'vi') { str = G.tv(str); if (RES_LANG !== G.LANG) resRe(); }
    if (!DIGIT.test(str)) return str; // không có số thì chắc chắn không có "số + tên tài nguyên"
    let out = marked.get(str);
    if (out === undefined) {
      const re = resRe(); re.lastIndex = 0;
      out = str.replace(re, (m, num, word) => num + String.fromCharCode(PUA + KINDS.indexOf(RES_MAP[word.toLowerCase().replace(/\u00a0/g, ' ')])));
      if (marked.size > 400) marked.clear();
      marked.set(str, out);
    }
    return out;
  }
  const HAS = /[\ue000-\ue00f]/;
  function richText(str, x, y, o) {
    if (typeof str !== 'string' || str.length < 3) return oldText(str, x, y, o);
    const t = mark(str);
    if (!HAS.test(t)) return oldText(str, x, y, o);
    o = o || {};
    const size = Math.max(6.5, o.size || 9), ih = Math.round(size * 1.05 * 2) / 2, c = G.ux;
    const parts = []; let cur = '';
    for (const ch of t) { const k = ch.charCodeAt(0) - PUA; if (k >= 0 && k < KINDS.length) { if (cur) parts.push([cur, null]); cur = ''; parts.push([null, KINDS[k]]); } else cur += ch; }
    if (cur) parts.push([cur, null]);
    ui.font(size, o.bold);
    let total = 0;
    // o.ten (phiên 12/10): sau biểu tượng ghi thêm tên tài nguyên ("+128 [hình] kinh nghiệm") cho dòng thưởng dễ hiểu
    for (const q of parts) { if (q[0] == null && o.ten) q[3] = ' ' + (G.tv ? G.tv(T.resName(q[1])) : T.resName(q[1])); q[2] = q[0] != null ? c.measureText(q[0]).width : ih + 1 + (q[3] ? c.measureText(q[3]).width : 0); total += q[2]; }
    let cx = o.align === 'center' ? x - total / 2 : o.align === 'right' ? x - total : x;
    const oo = Object.assign({}, o, { align: 'left' });
    for (let i = 0; i < parts.length; i++) {
      const q = parts[i];
      if (q[0] != null) oldText(q[0], cx, y, oo);
      else { T.resIcon(q[1], cx + 1, y - ih + 1, ih); if (q[3]) oldText(q[3], cx + ih + 1, y, Object.assign({}, oo, { color: o.tenCol || oo.color })); const pw = i ? Math.min(parts[i - 1][2], 26) : 0; zone(q[1], cx - pw, y - ih + 1, pw + ih + 1, ih); }
      cx += q[2];
    }
  }
  // Một dãy tài nguyên: items = [[loại, số, màu chữ], ...]. Trả về toạ độ x sau món cuối. o: { size, gap, lack: [loại đang thiếu] }
  T.resRow = function (items, x, y, o) {
    o = o || {};
    const size = o.size || 7.5, ih = Math.round(size * 1.05 * 2) / 2;
    for (const q of items) {
      T.resIcon(q[0], x, y - ih + 1, ih);
      const s = String(q[1]); ui.font(size, true);
      const w = G.ux.measureText(s).width;
      oldText(s, x + ih + 1.5, y, { size, bold: true, color: q[2] || C.text });
      zone(q[0], x, y - ih + 1, ih + 1.5 + w, ih);
      x += ih + 1.5 + w + (o.gap == null ? 7 : o.gap);
    }
    return x;
  };

  // ---------- đổi cách vẽ chung của game sang chủ đề này ----------
  // Mọi chỗ trong game đang gọi G.ui.btn, G.ui.panel, G.ui.bar sẽ ra hình trống đồng mà không phải sửa từng chỗ.
  // Màu nút cũ (o.color) được đổi sang tông tương ứng: đỏ là nút chính, nâu sáng là đang chọn, đỏ sẫm là việc nguy hiểm...
  const TONES = { '#a8452a': 'primary', '#b5672f': 'sel', '#7a5a2a': 'sel', '#6a2a22': 'danger', '#8a1f1a': 'danger', '#7a2a22': 'danger', '#6a2a8a': 'purple', '#7a5a12': 'gold', '#5a4030': null, '#3a322c': null, '#8a4b25': null };
  T.install = function () {
    if (!ui || T.installed) return;
    T.installed = true;
    T.old = { btn: ui.btn, panel: ui.panel, bar: ui.bar, text: oldText, wrap: oldWrap };
    ui.text = richText;
    // giữ "số + tên tài nguyên" trên cùng một dòng để lúc vẽ đổi được thành biểu tượng
    ui.wrap = function (str, maxW, size, bold) { return oldWrap(mark(String(str)), maxW, size, bold); };
    ui.btn = function (x, y, w, h, label, o) {
      o = o || {};
      const q = { disabled: o.disabled, size: o.size, sub: o.sub, subSize: o.subSize };
      if (o.color) { const t = TONES[o.color]; if (t) q[t] = true; else if (t === undefined) q.fill = o.color; }
      for (const k of ['primary', 'sel', 'danger', 'gold', 'purple', 'dot', 'pad']) if (o[k]) q[k] = o[k];
      if (h >= 40) { // nút to dạng thẻ (ô phần thưởng, món hàng)
        const held = !o.disabled && heldIn(x, y, w, h);
        const dy = pressFx('c' + Math.round(x) + '|' + Math.round(y) + '|' + w + '|' + h, held);
        const c = G.ux, ga = c.globalAlpha; if (o.disabled) c.globalAlpha = ga * 0.55;
        T.card(x, y + dy + (held ? 1 : 0), w, h, { sel: held || q.sel });
        c.globalAlpha = ga;
        const size = o.size || 9, col = o.disabled ? '#8fa49e' : C.ink;
        { // chu-lech-khung: chữ trong lòng thẻ (gd-the-thuong / thẻ code)
          const kh = { khung: 'gd-the-thuong', vien: h >= 30 ? [6, 4, 6, 4] : [3, 4, 3, 4], size, bold: true, color: col, dy: dy + (held ? 1 : 0), dong: 2 };
          if (label) T.chuTrongKhung(label, x, y, w, h, Object.assign(kh, o.sub ? { dong: 1, phu: { s: o.sub, size: o.subSize || 7, bold: false, color: o.disabled ? '#8fa49e' : '#e8d9a8' } } : {}));
          else if (o.sub) T.chuTrongKhung(o.sub, x, y, w, h, Object.assign(kh, { size: o.subSize || 7, bold: false, color: o.disabled ? '#8fa49e' : '#e8d9a8' }));
        }
        return !o.disabled && clicked(x, y, w, h);
      }
      return T.btn(x, y, w, h, label, q);
    };
    ui.panel = function (x, y, w, h, title) { T.panel(x, y, w, h, title, { plain: w < 200 || h < 110, noBand: true }); };
    ui.bar = function (x, y, w, h, frac, col) { T.bar(x, y, w, null, frac, null, { h: Math.round(h), col: col || '#d0482f' }); };
  };
  T.install();
  // Dòng tiêu đề nhỏ trong bảng
  T.head = function (s, x, y, o) { txt(s, x, y, Object.assign({ size: 8.5, bold: true, color: C.hi }, o || {})); };

  // ---------- Đợt 8: độ đọc trận đấu trên điện thoại ----------
  // CỜ TẮT: G.DO_DOC_TRAN = false thì mọi thứ dưới đây về đúng cách vẽ cũ (js/stage.js, js/fx.js, js/btn_art.js đều hỏi cờ này lúc vẽ).
  // Muốn so trên máy thật: mở game với ?doctran=0 ở cuối địa chỉ.
  let tat = false;
  try { tat = /[?&]doctran=0\b/i.test(String(window.location && window.location.search)); } catch (e) { tat = false; }
  if (G.DO_DOC_TRAN == null) G.DO_DOC_TRAN = !tat;
  let tat2 = false;
  try { tat2 = /[?&]doctran2=0\b/i.test(String(window.location && window.location.search)); } catch (e) { tat2 = false; }
  if (G.DOC_TRAN2 == null) G.DOC_TRAN2 = !tat2;
  // Có bật độ đọc trận đợt 12/10 không (cần cả cờ Đợt 8). Các tệp js/fx*.js, js/combat.js hỏi hàm này lúc vẽ.
  G.docTran2 = () => G.DOC_TRAN2 === true && G.DO_DOC_TRAN === true && !!(G.theme && G.theme.DOC);
  T.DOC = {
    // THỨ BẬC HÌNH ẢNH CỐ ĐỊNH của một trận (bac 1 = quan trọng nhất). Lớp có bậc lớn hơn (kém quan trọng hơn) KHÔNG được vẽ đè lên
    // lớp có bậc nhỏ hơn: trong một khung hình, lớp kém quan trọng vẽ trước, lớp quan trọng vẽ sau (cột "ve" = thứ tự vẽ, 1 là vẽ đầu tiên).
    thuBac: [
      { bac: 1, lop: 'baoDon', ten: 'Vùng báo đòn', ve: 7, noi: 'js/bao_truoc.js — G.baoTruoc.dat (ảnh, lớp đất, 14/10) / G.baoTruoc.draw (dự phòng, cuối G.drawWorld)' },
      { bac: 2, lop: 'nhanVat', ten: 'Nhân vật và quái', ve: 1, noi: 'lớp #world; chữ và khung không được đặt lên giữa sàn; vùng báo đòn tự khoét chỗ thân nhân vật' },
      { bac: 3, lop: 'mauTrum', ten: 'Thanh máu trùm / tinh anh, trạng thái trên thân', ve: 6, noi: 'js/stage.js drawHud("tren"): thanh máu quái, khung trùm, thẻ kháng/yếu, biểu tượng hệ' },
      { bac: 4, lop: 'soSatThuong', ten: 'Số sát thương', ve: 5, noi: 'js/fx.js drawNums' },
      { bac: 5, lop: 'thongBao', ten: 'Thông báo chiến đấu (tối đa 2 dòng)', ve: 4, noi: 'js/stage.js veThongBao: dải trên mặt tường sau, dưới thanh máu trùm' },
      { bac: 6, lop: 'chuPhu', ten: 'Chữ phụ: tên phòng, sức mạnh, lời chỉ dẫn, mẹo, tên vật, đồ vừa nhặt', ve: 3, noi: 'js/stage.js drawHud("duoi")' },
      // Viền màn hình (thanh máu em bé, ô vũ khí, bản đồ nhỏ, nút bấm) nằm ngoài sàn nên không tranh chỗ với các lớp trên; vẽ sau cùng.
    ],
    soToiDa: 6, // số sát thương cùng lúc trên màn; đủ rồi thì số cũ nhất tắt sớm
    chuToiDa: 3, // chữ nổi khác (tên đòn, "Xa quá!", "+3 Lửa")
    gop: 0.25, // giây: cùng một quái trúng thêm đòn trong khoảng này thì cộng dồn vào số đang hiện
    soLe: 6, // điểm ảnh lệch ngang so le giữa các số nối nhau của cùng một quái
    dongToiDa: 2, // dòng thông báo chiến đấu cùng lúc
    coChu: 7, // cỡ chữ nhỏ nhất của số và chữ phải đọc trong trận (chữ giao diện đã có sàn 7,5 ở ui.fs)
    nen: 0.7, // độ đậm tấm nền tối sau chữ phải đọc
    // MÀU. Đỏ chỉ dành cho nguy hiểm (vùng báo đòn, máu em bé mất, trùm nổi giận, hết giờ). Nút bấm không dùng đỏ.
    nutDanh: { l: '#c98c34', m: '#a8752f', d: '#79451d' }, // mặt nút Đánh: đồng vàng (bảng màu lõi: gỗ nắng #c98c34, gỗ sáng #79451d; đồng #a8752f của bộ giao diện)
    matLua: { l: '#8a4a16', m: '#643410', d: '#3e1e08' }, // mặt nút Chiêu / Chưởng khi mang hệ Lửa: nâu than hồng thay cho đỏ sẫm #8a2a16
    thieuMana: '#b8c4d2', // số mana trên thẻ giá khi chưa đủ (trước là đỏ #ff6a5a)
    // Phiên Độ đọc trận 12/10 (cờ tắt G.DOC_TRAN2 = false hoặc ?doctran2=0): hiệu ứng ĐÒN CỦA EM BÉ nhạt đi, viền sáng quanh em bé,
    // mỗi mục tiêu tối đa soMoiChu số, số độc/cháy nhỏ và mờ hơn, mây độc của bé thu hình (không đổi vùng trúng).
    lopPhu: false, // true: hiệu ứng của em bé vẽ qua lớp phụ rồi dán nhạt một lần (đều màu hơn, tốn hơn ~15% khung hình khi máy yếu); false: nhạt từng hình
    fxBe: 0.62, // độ đậm hiệu ứng của em bé (lửa nổ, mây độc, tia sáng, hạt) — hiệu ứng của QUÁI và vùng báo đòn giữ nguyên
    vienBe: '#fff4c0', vienA: 0.8, vienToi: '#1a0e08', vienToiA: 0.6, // viền sáng ấm 1 điểm ảnh (+ viền tối mảnh bên ngoài cho nổi trên lửa) // viền sáng ấm 1 điểm ảnh quanh em bé, vẽ trên mọi hiệu ứng
    bongBe: 0.32, // bóng mờ của em bé vẽ thêm trên hiệu ứng (để thấy thân ngay cả khi lửa phủ kín)
    soMoiChu: 3, // mỗi mục tiêu tối đa 3 số cùng lúc
    soDotCo: 6, soDotA: 0.7, // số nhịp độc/cháy: nhỏ hơn và mờ hơn
    mayDocR: 24, // bán kính HÌNH mây độc của bé (điểm ảnh thế giới); vùng gây sát thương giữ z.r như cũ
    soMat: '#ff6a5a', // số máu EM BÉ mất: đỏ (nguy hiểm), có dấu trừ. Số gây ra cho quái: trắng / màu hệ / vàng chí mạng, không bao giờ đỏ.
  };
})();
