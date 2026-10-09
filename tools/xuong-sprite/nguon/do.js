// XƯỞNG SPRITE: phần ĐỒ (vũ khí, trang phục, vật phẩm). giao-dien.js gọi XS.taoDo(U) rồi dùng các hàm trả về.
// Đồ là một hình đứng yên: công cụ đưa nó vào đúng đường vẽ của game (js/sprite_custom.js) nên hình xem ở đây và trong game là một.
(function () {
  'use strict';
  const XS = window.XS, G = window.G;
  const INK = '#1b1118';
  const LOAI_VK = ['sword', 'bow', 'spear', 'hammer'], TEN_VK = { sword: 'Kiếm', bow: 'Cung', spear: 'Giáo', hammer: 'Búa' };
  const O_TP = ['hats', 'robes', 'backs', 'hands', 'masks', 'wings'];
  const TEN_O = { hats: 'Mũ', robes: 'Áo', backs: 'Đồ đeo lưng', hands: 'Bùa và vật cầm tay', masks: 'Dấu mặt nạ', wings: 'Cánh' };
  const LOP = { hats: 'mu', robes: 'ao', backs: 'lung', hands: 'tay', masks: 'mat', wings: 'lung' };
  const HE = [[null, 'Cả dòng'], ['fire', 'Lửa'], ['poison', 'Độc'], ['ice', 'Băng']], GD = [[1, 'Mầm'], [2, 'Thành hình'], [3, 'Thức tỉnh']];
  const BAC = ['Thường', 'Lam', 'Tím', 'Vàng'];
  const BE = [['smith', 'Thợ Rèn'], ['hunter', 'Thợ Săn'], ['healer', 'Thầy Lang'], ['wrestler', 'Đô Vật']];
  const VP = [['gold', 'Vàng'], ['potion', 'Bình máu'], ['linhkhi-fire', 'Linh khí Lửa'], ['linhkhi-poison', 'Linh khí Độc'], ['linhkhi-ice', 'Linh khí Băng'],
    ['ore', 'Quặng'], ['stone', 'Đá tôi'], ['mat0', 'Gỗ linh'], ['mat1', 'Vảy cá'], ['mat2', 'Đá lửa'], ['shard0', 'Mảnh Mộc Tinh'], ['shard1', 'Mảnh Ngư Tinh'], ['shard2', 'Mảnh Hồ Tinh']];
  // Biểu tượng tài nguyên 7x7 của game (chép từ js/ui_theme.js để so trong công cụ).
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
  };
  const EL = { fire: ['#ff8a3a', '#ffd27a', '#7a1810'], poison: ['#6fcf3a', '#c2f58a', '#12331a'], ice: ['#7fd4ff', '#e9f9ff', '#1c3a70'] };
  function veVpCode(c, kind, x, y, s) { // hình gốc của vật phẩm (gần đúng như game), tâm (x, y), cỡ s
    const k = Math.max(1, Math.round(s / 9)), px = (cx, cy, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x + cx * k), Math.round(y + cy * k), w * k, h * k); };
    if (RES[kind]) { const d = RES[kind]; for (let j = 0; j < 7; j++) for (let i = 0; i < 7; i++) { const ch = d.rows[j][i]; if (ch !== '.' && d.pal[ch]) px(i - 3.5, j - 3.5, 1, 1, d.pal[ch]); } return; }
    if (kind === 'potion') { px(-1, -5, 2, 1, '#5a3a1e'); px(-1.5, -4, 3, 1, '#e8e0d0'); px(-3, -3, 6, 6, '#c4202c'); px(-2, -2, 2, 2, '#ff5a5a'); return; }
    const e = EL[kind.split('-')[1]] || EL.fire; px(-3, -4, 6, 8, e[2]); px(-2, -3, 4, 6, e[0]); px(-1, -2, 2, 2, e[1]);
  }

  XS.taoDo = function (U) {
    const S = U.S, $ = U.$, WA = G.weaponArt, L = G.heroLooks, SC = G.spriteCustom;
    const GOC = {}; for (const o of O_TP) GOC[o] = Object.keys(L[o] || {}); // danh sách hình gốc (trước khi có hình tự vẽ)
    const laDo = (m) => { m = m || S.muc; return !!m && (m.doi === 'vu-khi' || m.doi === 'trang-phuc' || m.doi === 'vat-pham'); };
    const dd = () => S.dd || (S.dd = {});

    // ---------- danh sách ----------
    function cacNhom() {
      const out = [];
      for (const t of LOAI_VK) out.push({ nhom: 'vu-khi', ten: TEN_VK[t] + ' (mỗi dòng một thẻ)', ds: WA.FAMILIES[t].map((F, f) => ({ ma: 'vk-' + t + '-' + f, ten: F.name, doi: 'vu-khi', vk: { loai: t, dong: f }, vung: 'rung', phu: 'dòng ' + (f + 1) })) });
      for (const o of O_TP) out.push({ nhom: 'trang-phuc', ten: TEN_O[o], ds: GOC[o].map((k) => ({ ma: 'tp-' + o + '-' + k, ten: (L[o][k].cuGoc || L[o][k]).name || k, doi: 'trang-phuc', tp: { o, look: k }, vung: 'rung', phu: k })) });
      out.push({ nhom: 'do', ten: 'Đồ rơi và biểu tượng tài nguyên (góc màn hình, Hành trang, giá bán, đồ rơi)', ds: VP.map((v) => ({ ma: 'vp-' + v[0], ten: v[1], doi: 'vat-pham', vp: v[0], vung: 'rung', phu: v[0] })) });
      return out;
    }
    function timMuc(ma) {
      const m = /^vk-(sword|bow|spear|hammer)-(\d)(?:-(fire|poison|ice)(?:-([123]))?)?$/.exec(ma);
      if (m) { const F = WA.FAMILIES[m[1]][+m[2]]; return { ma, ten: F.name, doi: 'vu-khi', vk: { loai: m[1], dong: +m[2] }, vung: 'rung', he: m[3] || null, gd: m[4] ? +m[4] : (m[3] ? 1 : null) }; }
      for (const n of cacNhom()) for (const x of n.ds) if (x.ma === ma) return x;
      return null;
    }
    // Lấy hình gốc (bỏ hình tự vẽ đang thử) để so
    function voiHinhGoc(fn) {
      const giu = [];
      for (const ma of Object.keys(SC.do)) { const sp = SC.do[ma]; if (sp.tp && L[sp.tp.o][sp.tp.look] && L[sp.tp.o][sp.tp.look].tuVe) { giu.push([sp.tp.o, sp.tp.look, L[sp.tp.o][sp.tp.look]]); const g = sp.tp.cu; if (g) L[sp.tp.o][sp.tp.look] = g; else delete L[sp.tp.o][sp.tp.look]; } }
      if (giu.length && G.tinhLinh.clearCache) G.tinhLinh.clearCache();
      try { return fn(); } finally { for (const q of giu) L[q[0]][q[1]] = q[2]; if (giu.length && G.tinhLinh.clearCache) G.tinhLinh.clearCache(); }
    }
    function mucMac(o, look, lv) { // trang phục của em bé chỉ thay đúng một ô
      const x = { hat: null, robe: null, back: null, hand: null, mask: null, wing: null };
      if (o === 'hats') x.hat = look; else if (o === 'robes') x.robe = look; else if (o === 'backs') x.back = look; else if (o === 'hands') x.hand = look; else if (o === 'masks') x.mask = look; else if (o === 'wings') x.wing = { kind: look, level: lv || 2 };
      return x;
    }
    function lopDo(o, look) { // hình riêng món đồ (một lớp của em bé đứng yên), dạng canvas
      const TL = G.tinhLinh, ps = TL.pose('smith', 'none', 'idle', 0, 0), x = mucMac(o, look);
      const of = Object.assign({ rar: {} }, x);
      return TL.kidSprite('smith', of, ps, '', LOP[o]).cv;
    }
    // Vẽ hình gốc (code) của món đồ vừa trong ô size, tâm (x, y)
    function veCode(c, m, x, y, size) {
      try {
        if (m.doi === 'vu-khi') (WA.iconCode || WA.icon).call(WA, c, { type: m.vk.loai, family: m.vk.dong, rarity: 0, mood: 'calm', branch: m.he || (S.dd && S.dd.he) || null, stage: m.gd || (S.dd && S.dd.gd) || 0 }, x, y, size);
        else if (m.doi === 'trang-phuc') { const cv = voiHinhGoc(() => lopDo(m.tp.o, m.tp.look)); veVua(c, cv, x, y, size); }
        else veVpCode(c, m.vp, x, y, size);
      } catch (e) { /* bỏ qua */ }
    }
    function veVua(c, cv, x, y, size) {
      let k = size / Math.max(cv.width, cv.height); if (k >= 1) k = Math.floor(k);
      c.imageSmoothingEnabled = false; c.drawImage(cv, Math.round(x - (cv.width * k) / 2), Math.round(y - (cv.height * k) / 2), Math.round(cv.width * k), Math.round(cv.height * k));
    }
    function caoGoc(m) { // chiều cao gợi ý (điểm ảnh) theo hình gốc
      try {
        if (m.doi === 'vu-khi') return Math.max(10, WA.size({ type: m.vk.loai, family: m.vk.dong }).h);
        if (m.doi === 'trang-phuc') return Math.max(5, voiHinhGoc(() => lopDo(m.tp.o, m.tp.look)).height - 2);
      } catch (e) { /* bỏ qua */ }
      return 14;
    }

    // ---------- hình món đồ (đã nới 1 điểm, có viền) ----------
    function anh() {
      const R = S.R; if (!R) return null;
      if (S._anhDo && S._anhDo.R === R && S._anhDo.vien === S.tach.vien) return S._anhDo;
      const P = XS.noi(R.px, R.w, R.h, 1), px = S.tach.vien ? XS.themVien(P.px, P.w, P.h, XS.hex(INK)) : P.px;
      return (S._anhDo = { R, vien: S.tach.vien, w: P.w, h: P.h, px, cv: XS.raCanvas(P.w, P.h, px) });
    }
    // Điểm mặc định
    function datMacDinh() {
      const A = anh(), m = S.muc, d = dd(); if (!A) return;
      if (m.doi === 'vu-khi') {
        const bb = XS.khungHinh({ w: A.w, h: A.h, px: A.px });
        if (m.vk.loai === 'bow') { d.cam = [bb.x0 + bb.w * 0.45, bb.y0 + bb.h * 0.5]; d.mui = [bb.x1 + 1, bb.y0 + bb.h * 0.5]; d.day = [[bb.x0 + bb.w * 0.2, bb.y0 + 1.5], [bb.x0 + bb.w * 0.2, bb.y1 - 0.5]]; d.coDay = true; }
        else if (bb.w > bb.h * 1.25) { d.cam = [bb.x0 + bb.w * 0.14, bb.y0 + bb.h / 2]; d.mui = [bb.x1 + 1, bb.y0 + bb.h / 2]; d.day = null; d.coDay = false; } // vẽ nằm ngang: chuôi trái, mũi phải
        else { d.cam = [bb.x0 + bb.w / 2, bb.y0 + bb.h * 0.86]; d.mui = [bb.x0 + bb.w / 2, bb.y0]; d.day = null; d.coDay = false; } // vẽ dựng đứng: mũi lên trên
        if (d.he === undefined) { d.he = m.he || null; d.gd = m.gd || null; }
        if (d.rar == null) d.rar = 0;
      } else if (m.doi === 'trang-phuc') {
        const w = A.w, h = A.h, o = m.tp.o, C = { hats: [0.5, -3.5], masks: [2.5, 0.5], robes: [0, -7], backs: [-5, -8], hands: [3, -2], wings: null }[o];
        d.lech = o === 'hats' ? [Math.round(0.5 - w / 2), Math.round(2 - h)] : C ? [Math.round(C[0] - w / 2), Math.round(C[1] - h / 2)] : [-w + 2, -h + 3];
        if (d.lop == null) d.lop = 'sau'; if (d.kieu == null) d.kieu = 'bua'; if (d.tayAo == null) d.tayAo = true; if (!d.be) d.be = 'smith'; if (d.rar == null) d.rar = 0;
      }
      d.w = A.w; d.h = A.h;
    }
    function doiCo() { // hình đổi cỡ: co giãn điểm theo
      const A = anh(), d = S.dd; if (!A || !d) return;
      if (!d.w) { datMacDinh(); return; }
      const kx = A.w / d.w, ky = A.h / d.h, k = (p) => (p ? [p[0] * kx, p[1] * ky] : p);
      if (S.muc.doi === 'vu-khi') { d.cam = k(d.cam); d.mui = k(d.mui); if (d.day) d.day = d.day.map(k); }
      else if (S.muc.doi === 'trang-phuc' && (kx !== 1 || ky !== 1)) { const o = S.muc.tp.o; if (o === 'wings') d.lech = [-A.w + 2, -A.h + 3]; else d.lech = [Math.round(d.lech[0] + (d.w - A.w) / 2), Math.round(d.lech[1] + (d.h - A.h) / 2)]; }
      d.w = A.w; d.h = A.h;
    }
    function maHienTai() {
      const m = S.muc, d = S.dd || {};
      if (m.doi !== 'vu-khi') return m.ma;
      return 'vk-' + m.vk.loai + '-' + m.vk.dong + (d.he ? '-' + d.he + '-' + (d.gd || 1) : '');
    }
    // Phần riêng của tệp
    function phanTep(dungCanvas) {
      const A = anh(), m = S.muc, d = S.dd || {}, t = { ma: maHienTai(), ten: m.ten, doi_tuong: m.doi, rong: A.w, cao: A.h };
      if (dungCanvas) t.anhCanvas = A.cv; else t.anh = A.cv.toDataURL('image/png');
      const r2 = (p) => [Math.round(p[0] * 100) / 100, Math.round(p[1] * 100) / 100];
      if (m.doi === 'vu-khi') t.vu_khi = { loai: m.vk.loai, dong: m.vk.dong, he: d.he || null, gd: d.he ? d.gd || 1 : null, cam: r2(d.cam), mui: r2(d.mui), day: d.coDay && d.day ? d.day.map(r2) : null };
      else if (m.doi === 'trang-phuc') t.trang_phuc = { o: m.tp.o, look: m.tp.look, lech: d.lech.slice(), lop: d.lop, kieu: d.kieu, tay_ao: !!d.tayAo };
      else t.vat_pham = m.vp;
      return t;
    }
    let maDangKy = null;
    function dangKy() { // đưa hình đang làm vào đường vẽ của game để xem
      if (!laDo() || !S.R) return;
      if (!S.dd || !S.dd.w) datMacDinh();
      const t = phanTep(true);
      if (maDangKy && maDangKy !== t.ma) SC.remove(maDangKy);
      SC.add(t); maDangKy = t.ma;
    }
    function boDangKy() { if (maDangKy) SC.remove(maDangKy); maDangKy = null; }

    // ---------- BƯỚC 3 ----------
    function dungBuoc3() {
      const m = S.muc, vk = m.doi === 'vu-khi', tp = m.doi === 'trang-phuc';
      $('bang3Vk').classList.toggle('an', !vk); $('bang3Tp').classList.toggle('an', !tp); $('bang3Quai').classList.toggle('an', vk || tp);
      if (!S.dd || !S.dd.w) datMacDinh();
      const d = S.dd;
      if (vk) {
        $('dongDay').classList.toggle('an', m.vk.loai !== 'bow'); $('ghiDay').classList.toggle('an', !d.coDay); $('coDay').checked = !!d.coDay;
        const he = $('dsHe'); he.innerHTML = '';
        for (const h of HE) { const b = document.createElement('button'); b.type = 'button'; b.className = 'chip' + ((d.he || null) === h[0] ? ' chon' : ''); b.textContent = h[1]; b.onclick = () => { d.he = h[0]; if (h[0] && !d.gd) d.gd = 1; doiMa(); dungBuoc3(); }; he.appendChild(b); }
        const gd = $('dsGd'); gd.innerHTML = ''; gd.classList.toggle('an', !d.he);
        for (const g of GD) { const b = document.createElement('button'); b.type = 'button'; b.className = 'chip' + (d.gd === g[0] ? ' chon' : ''); b.textContent = g[1]; b.onclick = () => { d.gd = g[0]; doiMa(); dungBuoc3(); }; gd.appendChild(b); }
      }
      if (tp) {
        const o = m.tp.o;
        $('dongLop').classList.toggle('an', o !== 'hats'); $('truocMat').checked = d.lop === 'truoc';
        $('dongKieu').classList.toggle('an', o !== 'hands'); for (const b of document.querySelectorAll('[data-kieu-tay]')) b.classList.toggle('chon', b.dataset.kieuTay === d.kieu);
        $('dongTayAo').classList.toggle('an', o !== 'robes'); $('tayAo').checked = !!d.tayAo;
        dungChonBe($('dsBe3'));
      }
      dangKy(); ve3();
    }
    function dungChonBe(box) {
      box.innerHTML = '';
      for (const b of BE) { const e = document.createElement('button'); e.type = 'button'; e.className = 'chip' + (S.dd.be === b[0] ? ' chon' : ''); e.textContent = b[1]; e.onclick = () => { S.dd.be = b[0]; for (const x of box.children) x.classList.toggle('chon', x === e); ve3(); }; box.appendChild(e); }
    }
    function doiMa() { // đổi hệ, giai đoạn: đổi mã tệp
      const cu = S.muc.ma, moi = maHienTai();
      if (cu !== moi) { S.muc = Object.assign({}, S.muc, { ma: moi, he: S.dd.he, gd: S.dd.gd }); U.capNhatDau(); }
      dangKy(); U.luuNhap();
    }
    $('coDay').onchange = (e) => { const d = S.dd; d.coDay = e.target.checked; if (d.coDay && !d.day) { const A = anh(); d.day = [[A.w * 0.2, 1.5], [A.w * 0.2, A.h - 1.5]]; } $('ghiDay').classList.toggle('an', !d.coDay); dangKy(); ve3(); U.luuNhap(); };
    $('truocMat').onchange = (e) => { S.dd.lop = e.target.checked ? 'truoc' : 'sau'; dangKy(); ve3(); U.luuNhap(); };
    $('tayAo').onchange = (e) => { S.dd.tayAo = e.target.checked; dangKy(); ve3(); U.luuNhap(); };
    for (const b of document.querySelectorAll('[data-kieu-tay]')) b.onclick = () => { S.dd.kieu = b.dataset.kieuTay; U.chonChip(b.parentNode, b); dangKy(); ve3(); U.luuNhap(); };
    for (const b of document.querySelectorAll('[data-nhich]')) b.onclick = () => { const q = b.dataset.nhich.split(',').map(Number); S.dd.lech[0] += q[0]; S.dd.lech[1] += q[1]; dangKy(); ve3(); U.luuNhap(); };
    $('nutDatLaiCho').onclick = () => { const d = S.dd; d.w = 0; datMacDinh(); dangKy(); ve3(); U.luuNhap(); };
    $('nutSang4b').onclick = () => U.denBuoc(4); $('nutSang4c').onclick = () => U.denBuoc(4);

    const cv3 = $('cv3'); let bo3 = null, keo = null, keoTu = null;
    function veEmBe(c, x, y, o) { (G.art.heroCode || G.art.hero).call(G.art, c, Object.assign({ x, y, face: 1, key: S.dd.be || 'smith', move: false, t: 0, atk: -1, dodge: -1 }, o || {})); }
    function oEmBe(look) { const m = S.muc, x = mucMac(m.tp.o, look); return { outfit: x, weapon: m.tp.o === 'hands' && S.dd.kieu === 'cam' ? undefined : { type: 'sword', family: 0, rarity: 0, marks: { fire: 0, poison: 0, ice: 0 }, sharpen: 0 } }; }
    function ve3() {
      if (!laDo() || S.buoc !== 3) return;
      const { c, w, h, d } = U.oCanvas(cv3);
      c.fillStyle = '#0d1c1d'; c.fillRect(0, 0, w, h);
      const A = anh(); if (!A) return;
      const m = S.muc, D = S.dd;
      if (m.doi === 'vu-khi') {
        const z = Math.max(1, Math.floor(Math.min((w - 40 * d) / A.w, (h - 40 * d) / A.h))), x0 = Math.round((w - A.w * z) / 2), y0 = Math.round((h - A.h * z) / 2);
        bo3 = { x0, y0, z };
        U.oCo(c, x0, y0, A.w * z, A.h * z, Math.max(4, z));
        c.drawImage(A.cv, x0, y0, A.w * z, A.h * z);
        const P = (p) => [x0 + p[0] * z, y0 + p[1] * z], cam = P(D.cam), mui = P(D.mui);
        c.strokeStyle = '#1a120a'; c.lineWidth = 5 * d; c.beginPath(); c.moveTo(cam[0], cam[1]); c.lineTo(mui[0], mui[1]); c.stroke();
        c.strokeStyle = '#f6dc92'; c.lineWidth = 2 * d; c.setLineDash([6 * d, 4 * d]); c.stroke(); c.setLineDash([]);
        const cham = (p, mau, hinh) => { const r = 7 * d; c.fillStyle = mau; c.strokeStyle = '#1a120a'; c.lineWidth = 2 * d; c.beginPath(); if (hinh) { c.moveTo(p[0], p[1] - r); c.lineTo(p[0] + r, p[1]); c.lineTo(p[0], p[1] + r); c.lineTo(p[0] - r, p[1]); c.closePath(); } else c.arc(p[0], p[1], r, 0, Math.PI * 2); c.fill(); c.stroke(); };
        if (D.coDay && D.day) { const a = P(D.day[0]), b = P(D.day[1]); c.strokeStyle = '#e8e2d0'; c.lineWidth = 1.5 * d; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); cham(a, '#6fc1d8'); cham(b, '#6fc1d8'); }
        cham(mui, '#ffd23c'); cham(cam, '#ff5a46', true);
        // xem nhanh trên tay em bé ở góc
        const bf = XS.taoCanvas(80, 70), bc = bf.getContext('2d'); bc.imageSmoothingEnabled = false;
        veEmBe(bc, 34, 60, { weapon: vuKhiThu() });
        const k = Math.max(1, Math.round(2 * d)); c.drawImage(bf, w - 80 * k - 8 * d, h - 70 * k - 8 * d, 80 * k, 70 * k);
        $('goiY3').textContent = 'Chạm vào chỗ chuôi để đặt hình thoi đỏ (chỗ tay cầm). Chấm vàng: mũi (hướng vũ khí chĩa ra).' + (D.coDay ? ' Chấm xanh: hai đầu dây.' : '') + ' Góc dưới: trên tay em bé.';
        return;
      }
      // trang phục: em bé mặc đồ gốc (trái) và đồ tự vẽ (phải)
      const W2 = 64, H2 = 64, bf = XS.taoCanvas(W2 * 2, H2), bc = bf.getContext('2d'); bc.imageSmoothingEnabled = false;
      voiHinhGoc(() => veEmBe(bc, 30, 54, oEmBe(m.tp.look)));
      veEmBe(bc, W2 + 30, 54, oEmBe(m.tp.look));
      const z = Math.max(1, Math.floor(Math.min((w - 20 * d) / (W2 * 2), (h - 30 * d) / H2))), x0 = Math.round((w - W2 * 2 * z) / 2), y0 = Math.round((h - H2 * z) / 2);
      bo3 = { x0: x0 + W2 * z, y0, z };
      c.drawImage(bf, x0, y0, W2 * 2 * z, H2 * z);
      c.strokeStyle = 'rgba(246,220,146,.35)'; c.lineWidth = 1; c.strokeRect(x0 + W2 * z + 0.5, y0 + 0.5, W2 * z - 1, H2 * z - 1);
      c.fillStyle = '#a9c2b4'; c.font = Math.round(12 * d) + 'px "Be Vietnam Pro", sans-serif'; c.textAlign = 'center';
      c.fillText('Đồ gốc', x0 + W2 * z / 2, y0 + H2 * z + 14 * d); c.fillText('Đồ của bạn (kéo để đặt)', x0 + W2 * z * 1.5, y0 + H2 * z + 14 * d);
      // ba dáng nhỏ ở góc trên bên phải: đứng, đi, đánh (xem ngay khi kéo)
      const bt = XS.taoCanvas(150, 52), btc = bt.getContext('2d'), tt = (performance.now() / 1000) % 1;
      btc.imageSmoothingEnabled = false; btc.fillStyle = 'rgba(0,0,0,.35)'; btc.fillRect(0, 0, 150, 52);
      const w0 = oEmBe(m.tp.look);
      [{ move: false }, { move: true, t: tt * 2 }, { atk: tt }].forEach((q, i) => veEmBe(btc, 25 + i * 50, 46, Object.assign({}, w0, q)));
      const kz = Math.max(1, Math.round(1.5 * d)); c.drawImage(bt, w - 150 * kz - 8 * d, 8 * d, 150 * kz, 52 * kz);
      c.fillStyle = '#f1e6c6'; c.fillText('Đứng · Đi · Đánh', w - 75 * kz - 8 * d, 8 * d + 52 * kz + 14 * d);
      if (!ve3.hen) ve3.hen = setInterval(() => { if (S.buoc === 3 && laDo() && S.muc.doi === 'trang-phuc' && !keo) ve3(); }, 120);
      $('goiY3').textContent = 'Lệch: ' + D.lech[0] + ', ' + D.lech[1] + ' điểm ảnh so với ' + (SC.MOC_TRANG_PHUC[m.tp.o] === 'H' ? 'giữa đầu' : SC.MOC_TRANG_PHUC[m.tp.o] === 'vai' ? 'vai em bé' : 'chân em bé') + '.';
    }
    function toaDo(e) { const r = cv3.getBoundingClientRect(), d = window.devicePixelRatio || 1; return [((e.clientX - r.left) * d - bo3.x0) / bo3.z, ((e.clientY - r.top) * d - bo3.y0) / bo3.z]; }
    function nhan3(e) { // trả về true nếu bước 3 của đồ đã nhận lần chạm
      if (!laDo() || !bo3 || S.muc.doi === 'vat-pham') return false;
      cv3.setPointerCapture(e.pointerId);
      const p = toaDo(e), D = S.dd;
      if (S.muc.doi === 'vu-khi') {
        const ds = [['cam', D.cam], ['mui', D.mui]]; if (D.coDay && D.day) { ds.push(['day0', D.day[0]]); ds.push(['day1', D.day[1]]); }
        let best = null, bv = 16 * (window.devicePixelRatio || 1) / bo3.z; for (const q of ds) { const dd2 = Math.hypot(q[1][0] - p[0], q[1][1] - p[1]); if (dd2 < bv) { bv = dd2; best = q[0]; } }
        if (!best && p[0] >= -1 && p[1] >= -1 && p[0] <= anh().w + 1 && p[1] <= anh().h + 1) { D.cam = [p[0], p[1]]; best = 'cam'; dangKy(); ve3(); } // chạm vào chuôi: đặt điểm cầm ngay
        keo = best;
      } else { keo = 'lech'; keoTu = [p[0], p[1], D.lech[0], D.lech[1]]; }
      return true;
    }
    function keo3(e) {
      if (!keo || !laDo()) return false;
      const p = toaDo(e), D = S.dd, A = anh();
      if (keo === 'lech') { D.lech = [keoTu[2] + Math.round(p[0] - keoTu[0]), keoTu[3] + Math.round(p[1] - keoTu[1])]; dangKy(); ve3(); return true; }
      const q = [Math.max(-1, Math.min(A.w + 1, p[0])), Math.max(-1, Math.min(A.h + 1, p[1]))];
      if (keo === 'cam') D.cam = q; else if (keo === 'mui') D.mui = q; else D.day[keo === 'day0' ? 0 : 1] = q;
      dangKy(); ve3(); return true;
    }
    function tha3() { if (keo) { keo = null; U.luuNhap(); return true; } return false; }

    // ---------- BƯỚC 4 ----------
    const DT = {
      'vu-khi': [['idle', 'Đứng'], ['run', 'Chạy'], ['atk', 'Đánh'], ['dodge', 'Né lăn'], ['hit', 'Trúng đòn'], ['tam', 'Tám hướng'], ['icon', 'Ô đồ và đồ rơi']],
      'trang-phuc': [['idle', 'Đứng'], ['run', 'Chạy'], ['atk', 'Đánh'], ['dodge', 'Né lăn'], ['hit', 'Trúng đòn'], ['ba', 'Đứng · Đi · Đánh'], ['icon', 'Ô đồ và đồ rơi']],
      'vat-pham': [['roi', 'Rơi trên sàn'], ['icon', 'Biểu tượng']],
    };
    function vuKhiThu() { const m = S.muc, d = S.dd || {}; if (m.doi !== 'vu-khi') return { type: 'sword', family: 0, rarity: 0, marks: { fire: 0, poison: 0, ice: 0 }, sharpen: 0 }; return { type: m.vk.loai, family: m.vk.dong, rarity: d.rar | 0, branch: d.he || null, stage: d.he ? d.gd || 1 : 0, marks: { fire: 0, poison: 0, ice: 0 }, sharpen: 0 }; }
    function dungBuoc4() {
      const box = $('dsDongTac'); box.innerHTML = '';
      const ds = DT[S.muc.doi]; if (!ds.some((q) => q[0] === S.xem.ten)) S.xem.ten = ds[0][0];
      for (const q of ds) { const b = document.createElement('button'); b.type = 'button'; b.className = 'chip' + (S.xem.ten === q[0] ? ' chon' : ''); b.dataset.dt = q[0]; b.textContent = S.muc.doi === 'vu-khi' && q[0] === 'atk' && S.muc.vk.loai === 'bow' ? 'Bắn' : q[1]; b.onclick = () => { S.xem.ten = q[0]; S.xem.t = 0; U.chonChip(box, b); }; box.appendChild(b); }
      $('khoiChinhDT').classList.add('an');
      $('coEmBe').parentNode.classList.add('an'); $('lapLai').parentNode.classList.add('an');
      $('coGoc').parentNode.classList.remove('an');
      const bac = $('khoiBac'); bac.classList.toggle('an', S.muc.doi === 'vat-pham');
      const bx = $('dsBac'); bx.innerHTML = '';
      BAC.forEach((t, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'chip' + ((S.dd.rar | 0) === i ? ' chon' : ''); b.textContent = t; b.onclick = () => { S.dd.rar = i; U.chonChip(bx, b); }; bx.appendChild(b); });
      $('khoiBe4').classList.toggle('an', S.muc.doi === 'vat-pham');
      if (S.muc.doi !== 'vat-pham') { if (!S.dd.be) S.dd.be = 'smith'; dungChonBe($('dsBe4')); }
      dangKy();
    }
    function ve4(c, t, phong) { // vẽ cảnh 480x270 của bước 4, trả về [tâm x, tâm y, chữ gợi ý]
      const m = S.muc, X = S.xem, ten = X.ten, D = S.dd || {};
      if (phong && X.nen) c.drawImage(phong, 0, 0); else { c.fillStyle = '#17363a'; c.fillRect(0, 0, 480, 270); c.fillStyle = '#12292a'; c.fillRect(0, 170, 480, 100); }
      if (ten === 'icon' || ten === 'roi') {
        const sp = SC.do[maDangKy];
        // ô đồ (như Hành trang): hai cỡ, cạnh hình gốc
        const o = (x, y, s, ve) => { c.fillStyle = '#1a120a'; c.fillRect(x - s / 2 - 3, y - s / 2 - 3, s + 6, s + 6); c.fillStyle = ['#34323a', '#1c2f52', '#33204f', '#4a3812'][D.rar | 0] || '#34323a'; c.fillRect(x - s / 2 - 2, y - s / 2 - 2, s + 4, s + 4); ve(x, y, s); };
        const tu = (x, y, s) => { if (!sp || !sp.ready) return; if (m.doi === 'vu-khi') SC.iconVuKhi(c, sp, { rarity: D.rar | 0 }, x, y, s); else if (m.doi === 'trang-phuc') veVua(c, lopDo(m.tp.o, m.tp.look), x, y, s); else SC.veVatPham(c, sp, x, y, s); };
        const goc = (x, y, s) => veCode(c, m, x, y, s);
        if (ten === 'icon' && m.doi !== 'vat-pham') {
          o(196, 120, 26, tu); o(240, 120, 22, tu); o(276, 120, 16, tu);
          if (X.soGoc) { o(196, 160, 26, goc); o(240, 160, 22, goc); o(276, 160, 16, goc); }
        }
        // đồ rơi nảy trên sàn
        const age = (t % 2.4), q = Math.min(1, age / 0.55), lift = age < 0.55 ? Math.sin(q * Math.PI) * 20 : age < 0.8 ? Math.sin(((age - 0.55) / 0.25) * Math.PI) * 4 : 1.5 + Math.sin(t * 3.2) * 1.5;
        const gx = ten === 'roi' ? 250 : 320, gy = ten === 'roi' ? 170 : 175;
        c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(gx - 6, gy, 12, 2);
        tu(gx, gy - 9 - lift, 18);
        if (X.soGoc) { c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(gx - 46, gy, 12, 2); goc(gx - 40, gy - 9 - lift, 18); }
        if (m.doi === 'vat-pham' && ten === 'icon') { // biểu tượng tài nguyên ở dải trên cùng: cỡ 7 và 10
          for (const q2 of [[190, 120, 7], [214, 120, 10], [244, 120, 14]]) { c.fillStyle = '#1a120a'; c.fillRect(q2[0] - q2[2] / 2 - 2, q2[1] - q2[2] / 2 - 2, q2[2] + 4, q2[2] + 4); tu(q2[0], q2[1], q2[2]); if (X.soGoc) { c.fillStyle = '#1a120a'; c.fillRect(q2[0] - q2[2] / 2 - 2, q2[1] + 26 - q2[2] / 2 - 2, q2[2] + 4, q2[2] + 4); goc(q2[0], q2[1] + 26, q2[2]); } }
        }
        return [250, 140, ten === 'icon' ? 'Ô đồ ba cỡ' + (X.soGoc ? ' (hàng dưới là hình gốc)' : '') + ' và đồ rơi nảy trên sàn.' : 'Đồ rơi nảy trên sàn' + (X.soGoc ? ' (bên trái là hình gốc).' : '.')];
      }
      if (ten === 'tam' && m.doi === 'vu-khi') { // tám hướng: game xoay vũ khí quanh điểm cầm (chấm đỏ)
        const o0 = vuKhiThu(), WA2 = G.weaponArt, R = 62;
        for (let i = 0; i < 8; i++) {
          const a = i * 45, x = 240 + Math.round(Math.cos(a * Math.PI / 180) * R * 1.7), y = 140 + Math.round(Math.sin(a * Math.PI / 180) * R);
          c.fillStyle = 'rgba(0,0,0,.28)'; c.fillRect(x - 13, y - 13, 26, 26);
          WA2.draw(c, o0, x, y, a, 0);
          c.fillStyle = '#ff3a2a'; c.fillRect(x - 1, y - 1, 2, 2);
        }
        return [240, 140, 'Tám hướng game xoay vũ khí (chấm đỏ là điểm cầm tay). Ánh hệ và vệt chém game vẫn tự thêm khi đánh.'];
      }
      if (ten === 'ba' && m.doi === 'trang-phuc') { // ba dáng cùng lúc: đứng, đi, đánh
        const be = D.be || 'smith', of = Object.assign(mucMac(m.tp.o, m.tp.look), { rar: { hat: D.rar, robe: D.rar, back: D.rar, hand: D.rar } }), w0 = vuKhiThu();
        [['Đứng', { move: false }], ['Đi', { move: true }], ['Đánh', { atk: (t % 0.5) / 0.5 }]].forEach((q, i) => {
          G.art.hero(c, Object.assign({ x: 190 + i * 50, y: 175, face: X.face, key: be, t, move: false, atk: -1, dodge: -1, weapon: w0, outfit: of }, q[1]));
          c.fillStyle = '#f1e6c6'; c.font = '7px sans-serif'; c.textAlign = 'center'; c.fillText(q[0], 190 + i * 50, 188);
        });
        return [240, 160, 'Món đồ bám theo đầu, thân em bé khi đứng, đi, đánh.'];
      }
      // em bé cầm vũ khí hoặc mặc đồ, làm động tác
      const be = D.be || 'smith', f = X.face, o = { x: 240, y: 175, face: f, key: be, t, move: ten === 'run', atk: ten === 'atk' ? (t % 0.5) / 0.5 : -1, dodge: ten === 'dodge' ? (t % 0.55) / 0.55 : -1, flash: ten === 'hit' && t % 0.6 < 0.2 };
      if (m.doi === 'vu-khi') o.weapon = vuKhiThu();
      else { o.weapon = m.tp.o === 'hands' && D.kieu === 'cam' && ten === 'idle' ? undefined : vuKhiThu(); o.outfit = Object.assign(mucMac(m.tp.o, m.tp.look), { rar: { hat: D.rar, robe: D.rar, back: D.rar, hand: D.rar } }); }
      if (X.soGoc) voiHinhGoc(() => { if (m.doi === 'vu-khi') { const sp = SC.do[maDangKy]; delete SC.do[maDangKy]; try { G.art.hero(c, Object.assign({}, o, { x: 200 })); } finally { if (sp) SC.do[maDangKy] = sp; } } else G.art.hero(c, Object.assign({}, o, { x: 200 })); });
      G.art.hero(c, Object.assign({}, o, X.soGoc ? { x: 262 } : {}));
      return [X.soGoc ? 231 : 240, 160, (X.soGoc ? 'Bên trái là hình gốc. ' : '') + 'Đúng cách game vẽ: ' + (m.doi === 'vu-khi' ? 'vũ khí xoay quanh điểm cầm theo đòn đánh.' : 'món đồ bám theo đầu, thân em bé.')];
    }

    // ---------- BƯỚC 5 và tệp ----------
    function ve5(c, w, h, d) {
      const A = anh(); if (!A) return '';
      const z = Math.max(1, Math.floor(Math.min((w * 0.5) / A.w, (h - 60 * d) / A.h))), x0 = Math.round(w * 0.3 - (A.w * z) / 2), y0 = Math.round((h - A.h * z) / 2);
      U.oCo(c, x0, y0, A.w * z, A.h * z, Math.max(4, 6 * d)); c.drawImage(A.cv, x0, y0, A.w * z, A.h * z);
      const s = 26 * Math.max(1, Math.round(2 * d)), bx = Math.round(w * 0.75);
      c.fillStyle = '#1a120a'; c.fillRect(bx - s / 2 - 6, h / 2 - s / 2 - 6, s + 12, s + 12);
      const sp = SC.do[maDangKy];
      if (sp && sp.ready) { if (S.muc.doi === 'vu-khi') SC.iconVuKhi(c, sp, { rarity: 0 }, bx, h / 2, s); else if (S.muc.doi === 'trang-phuc') veVua(c, lopDo(S.muc.tp.o, S.muc.tp.look), bx, h / 2, s); else SC.veVatPham(c, sp, bx, h / 2, s); }
      return 'Mã ' + maHienTai() + ' · hình ' + A.w + '×' + A.h + ' điểm ảnh.';
    }
    function phanSua() { const d = Object.assign({}, S.dd || {}); return d; }
    function khoiPhuc(tep, cc) {
      const m = timMuc(tep.ma); if (!m) throw new Error('Không nhận ra món đồ ' + tep.ma);
      S.muc = m;
      const d = (S.dd = Object.assign({}, cc.diem || {}));
      if (tep.vu_khi) { const v = tep.vu_khi; d.cam = v.cam; d.mui = v.mui; d.day = v.day || d.day || null; d.coDay = !!v.day; d.he = v.he || null; d.gd = v.gd || null; }
      if (tep.trang_phuc) { const v = tep.trang_phuc; d.lech = v.lech; d.lop = v.lop; d.kieu = v.kieu; d.tayAo = v.tay_ao !== false; }
      if (d.rar == null) d.rar = 0;
    }

    return { laDo, cacNhom, timMuc, veCode, caoGoc, anh, datMacDinh, doiCo, phanTep, phanSua, dangKy, boDangKy, dungBuoc3, ve3, nhan3, keo3, tha3, dungBuoc4, ve4, ve5, khoiPhuc, maHienTai, INK };
  };
})();
