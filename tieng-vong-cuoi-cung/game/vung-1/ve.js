'use strict';
/* ve.js – Vùng 1: vẽ phòng bằng ô tạm (đá rễ tông tối), cảnh nền phòng demo, quái, trùm (hình tạm), vật phẩm, bóng tối + đèn, HUD, bản đồ nhỏ.
   Logic 960×540 px; cảnh 320×180 điểm (1 điểm = 3 px logic, 1 ô 48 px = 16 điểm). */
(() => {
  const V1 = window.V1, E = DongCoMN, pl = E.pl, G = V1.G, T = 48;
  const W = 960, H = 540, PX = 3, VW = 320, VH = 180, OD = 16;
  const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
  const pc = document.createElement('canvas'); pc.width = VW + 1; pc.height = VH + 1; const g = pc.getContext('2d');
  const NEN = document.createElement('canvas'), GIA = document.createElement('canvas');
  const LC = document.createElement('canvas'); LC.width = VW; LC.height = VH; const lg = LC.getContext('2d');
  let M = 1;
  const clampN = (v, a, b) => v < a ? a : v > b ? b : v;

  // (luồng F) khung game nằm TRONG vùng an toàn (tai thỏ / thanh home iPhone): đo --sal/--sar/--sat/--sab bằng 1 phần tử dò
  const DO = document.createElement('div'); DO.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;padding:var(--sat) var(--sar) var(--sab) var(--sal)';
  function vungAnToan(){ if (!DO.parentNode) document.body.appendChild(DO); const c = getComputedStyle(DO);
    return {l:parseFloat(c.paddingLeft) || 0, t:parseFloat(c.paddingTop) || 0, r:parseFloat(c.paddingRight) || 0, b:parseFloat(c.paddingBottom) || 0}; }
  function resize(){
    const DPR = Math.min(window.devicePixelRatio || 1, 3), sa = vungAnToan();
    // ngang: chừa đều 2 bên phần tai thỏ lớn hơn (canvas luôn ở giữa). Trên/dưới chỉ là thanh home → không thu nhỏ vì nó.
    const iw = Math.max(200, innerWidth - 2 * Math.max(sa.l, sa.r)), ih = innerHeight;
    const bw = iw * DPR, bh = ih * DPR;
    let css;
    if (DPR >= 2){   // (luồng F) màn nét cao (iPhone): lấp đầy khung cho to/dễ đọc (tỉ lệ lẻ không thấy răng cưa ở 2–3× DPR)
      css = Math.min(iw / W, ih / H); M = Math.max(1, Math.min(3, Math.ceil(css * DPR)));
    } else {         // màn thường: phóng số nguyên cho điểm ảnh đều
      M = Math.max(1, Math.floor(Math.min(bw / W, bh / H)));
      css = (bw < W || bh < H) ? Math.min(iw / W, ih / H) : M / DPR;
    }
    cv.width = W * M; cv.height = H * M;
    cv.style.width = (W * css) + 'px'; cv.style.height = (H * css) + 'px';
    if (V1.measure) requestAnimationFrame(V1.measure);
  }
  V1.resize = resize;
  addEventListener('resize', resize); addEventListener('orientationchange', () => setTimeout(resize, 200));

  /* ---------------- HÌNH CHATGPT (độ phân giải cao) → khớp lưới điểm ảnh ----------------
     Thu nhỏ mượt về đúng số điểm ảnh (mỗi điểm = k px logic: phòng k=3, quái/trùm k=2), làm cứng viền alpha,
     rồi phóng lại bằng nearest → hợp phong cách pixel của game. Có bản trắng để nhấp khi trúng đòn. */
  const LUOI = new Map();
  function anhLuoi(im, cao, k, trang){
    const key = cao + '|' + k + '|' + (trang ? 1 : 0); let m = LUOI.get(im); if (!m){ m = {}; LUOI.set(im, m); }
    if (m[key]) return m[key];
    const h = Math.max(1, Math.round(cao / k)), w = Math.max(1, Math.round(im.width * h / im.height));
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g2 = c.getContext('2d');
    g2.imageSmoothingEnabled = true; g2.imageSmoothingQuality = 'high'; g2.drawImage(im, 0, 0, w, h);
    try {
      const d = g2.getImageData(0, 0, w, h), a = d.data;
      for (let i = 0; i < a.length; i += 4){ a[i + 3] = a[i + 3] < 100 ? 0 : 255; if (trang){ a[i] = a[i + 1] = a[i + 2] = 255; } }
      g2.putImageData(d, 0, 0);
    } catch (e){ if (trang){ g2.globalCompositeOperation = 'source-in'; g2.fillStyle = '#fff'; g2.fillRect(0, 0, w, h); } }
    return (m[key] = c);
  }
  // vẽ hình im: điểm neo (ax, ay) tính theo tỉ lệ hình (0..1) đặt tại (x, y) px logic; lat = lật ngang quanh neo
  function veAnh(im, x, y, cao, k, ax, ay, lat, alpha, trang){
    const c = anhLuoi(im, cao, k, false), w = c.width * k, h = c.height * k;
    const X = Math.round(x - (lat ? 1 - ax : ax) * w), Y = Math.round(y - ay * h);
    ctx.save(); ctx.imageSmoothingEnabled = false; if (alpha !== undefined) ctx.globalAlpha = Math.max(0, alpha);
    if (lat){ ctx.translate(X + w, Y); ctx.scale(-1, 1); } else ctx.translate(X, Y);
    ctx.drawImage(c, 0, 0, w, h);
    if (trang){ ctx.globalAlpha = (alpha ?? 1) * trang; ctx.drawImage(anhLuoi(im, cao, k, true), 0, 0, w, h); }
    ctx.restore();
    return {x:X, y:Y, w, h};
  }
  V1.veAnh = veAnh;
  // cửa khoá có hình chưa (chỉ cửa của p.khoa)
  const coHinhCua = cua => { const p = G.phong, I = V1.IMG; return !!(p && p.khoa && I.cong_re && (!cua || cua.id === p.khoa.cua)); };

  /* ---------------- CAMERA ---------------- */
  const CAM = V1.CAM = {x:0, y:0};
  function camDich(){
    const RW = E.BD.COT * T, RH = E.BD.HANG * T;
    const mx = RW <= W ? (RW - W) / 2 : clampN(pl.x + pl.w / 2 - W / 2 + pl.face * 40, 0, RW - W);
    const my = RH <= H ? (RH - H) / 2 : clampN(pl.y + pl.h / 2 - H * 0.55, 0, RH - H);
    return [mx, my];
  }
  V1.camDat = () => { const [x, y] = camDich(); CAM.x = x; CAM.y = y; };
  V1.camBuoc = () => { const [x, y] = camDich(); CAM.x += (x - CAM.x) * 0.12; CAM.y += (y - CAM.y) * 0.1; };

  /* ---------------- Ô TẠM: đá + rễ (tông phòng demo) ---------------- */
  const PAL = {sau:'#120a0b', mat:'#3a2523', da:'#51302c', da2:'#6d483f', vien:'#947666', sang:'#bc9892', toi:'#0d0809', re:'#5c3c37', re2:'#7a463c', la:'#3e5a3a'};
  const hash = (a, b) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const laDac = ch => ch === '#' || ch === 'N' || ch === 'G';
  function oCuaKhoa(){   // ô cửa đang bị bịt (khoá / đánh trùm) → vẽ song rễ
    const s = new Map();
    const p = G.phong; if (!p) return s;
    for (const c of p.cua){
      const khoa = G.cuaKhoa.includes(c);
      if (khoa || G.dongCua) for (const [x, y] of V1.odCua(c)) s.set(x + ',' + y, khoa ? 'khoa' : 'dong');
    }
    return s;
  }
  // ẢNH NƯỚNG SẴN (tools/vung-1/ve-phong.py): đá liền mép méo, dây leo, bệ rễ, đồ trang trí.
  // Tường nứt N: ảnh cảnh vẽ trạng thái "còn tường"; ô vỡ → xoá vùng, dán mảnh "lộ hốc", ô còn lại dán lại từ ảnh gốc.
  // Tường giả G: ảnh cảnh đã là "lộ hốc"; lớp GIA = mảnh "còn tường" (mờ đi khi nhân vật đứng trong).
  function veNenAnh(A){
    const C = E.BD.COT, R = E.BD.HANG;
    NEN.width = C * OD; NEN.height = R * OD; GIA.width = C * OD; GIA.height = R * OD;
    const v = NEN.getContext('2d'), gv = GIA.getContext('2d');
    v.imageSmoothingEnabled = gv.imageSmoothingEnabled = false;
    v.clearRect(0, 0, NEN.width, NEN.height); gv.clearRect(0, 0, GIA.width, GIA.height);
    v.drawImage(A.canh, 0, 0);
    for (const m of A.meta.manh || []){
      if (!A.manh) break;
      if (m.loai === 'G'){ gv.drawImage(A.manh, 0, m.ay, m.w, m.h, m.x, m.y, m.w, m.h); continue; }
      const con = m.o.filter(([c, r]) => E.tile(c, r) === 'N');
      if (con.length < m.o.length){
        v.clearRect(m.x, m.y, m.w, m.h);
        v.drawImage(A.manh, 0, m.ay, m.w, m.h, m.x, m.y, m.w, m.h);
        for (const [c, r] of con) v.drawImage(A.canh, c * OD, r * OD, OD, OD, c * OD, r * OD, OD, OD);
      }
      for (const [c, r] of con){   // càng chém càng nứt: vệt nứt nhỏ toả ra + bụi sáng
        const n = (E.BD.nut[c + ',' + r] || {}).lan || 0, X = c * OD, Y = r * OD;
        for (let i = 0; i < n * 3; i++){
          let x = X + 8, y = Y + 2 + Math.floor(hash(c * 3 + i, r) * 12); const dx = hash(c, r * 7 + i) < .5 ? -1 : 1;
          for (let k = 0; k < 4 + (i % 3); k++){ v.fillStyle = '#0d0809'; v.fillRect(x, y, 1, 1); v.fillStyle = 'rgba(188,152,146,0.55)'; v.fillRect(x, y + 1, 1, 1); x += dx; if (hash(i, k + r) < .5) y++; }
        }
      }
    }
    // cửa bị bịt (khoá / đánh trùm): song rễ vẽ bằng dây leo thật
    const cuaK = oCuaKhoa(), nhom = {};
    for (const [k, t] of cuaK){ const [c, r] = k.split(',').map(Number); (nhom[t] || (nhom[t] = [])).push([c, r]); }
    for (const p of (G.phong ? G.phong.cua : [])){
      const o = V1.odCua(p).filter(([c, r]) => cuaK.has(c + ',' + r)); if (!o.length) continue;
      const loai = cuaK.get(o[0][0] + ',' + o[0][1]);
      if (loai === 'khoa' && coHinhCua(p)) continue;   // cửa khoá 3 Chuông Vỡ: vẽ hình cửa (veCuaKhoa) thay song dây
      veSongDay(v, o, p.huong === 'tren' || p.huong === 'duoi', loai);
    }
  }
  function veSongDay(v, o, ngang, k){
    const I = V1.IMG, xs = o.map(a => a[0]), ys = o.map(a => a[1]);
    const x0 = Math.min(...xs) * OD, y0 = Math.min(...ys) * OD, x1 = (Math.max(...xs) + 1) * OD, y1 = (Math.max(...ys) + 1) * OD;
    v.save();
    const vm = [I.vm1, I.vm2];
    if (vm[0]){
      if (!ngang){ for (let i = 0; i < 2; i++){ const cx = x0 + (x1 - x0) * (i ? .72 : .28); for (let y = y0 - 8, j = 0; y < y1; y += vm[0].height - 2, j++){ const im = vm[(i + j) & 1]; v.drawImage(im, 0, 0, im.width, Math.min(im.height, y1 - y + 4), Math.round(cx - im.width / 2), y, im.width, Math.min(im.height, y1 - y + 4)); } } }
      else { v.translate(x0, y0 + (y1 - y0) / 2); v.rotate(-Math.PI / 2);
        for (let i = 0; i < 2; i++){ const cx = (i ? 4 : -4); for (let y = -8, j = 0; y < x1 - x0; y += vm[0].height - 2, j++){ const im = vm[(i + j) & 1]; v.drawImage(im, Math.round(cx - im.width / 2), y); } } }
    }
    v.restore();
    if (k === 'khoa' && I.hud_chuong_khoa){ const im = I.hud_chuong_khoa, h = 11, w = Math.round(im.width * h / im.height);   // chuông khoá (ChatGPT vẽ)
      v.imageSmoothingEnabled = false; v.drawImage(im, Math.round((x0 + x1) / 2 - w / 2), Math.round((y0 + y1) / 2 - h / 2), w, h); }
    else if (k === 'khoa'){   // dấu khoá: quả chuông đồng nhỏ buộc giữa song rễ
      const cx = Math.round((x0 + x1) / 2), cy = Math.round((y0 + y1) / 2), ROW = [[-1, 1], [-2, 2], [-2, 2], [-3, 3], [-3, 3], [-4, 4]];
      v.fillStyle = '#0d0809'; ROW.forEach(([a, b], i) => v.fillRect(cx + a - 1, cy - 3 + i, b - a + 2, 1)); v.fillRect(cx - 5, cy + 3, 10, 2);
      v.fillStyle = '#c28a45'; ROW.forEach(([a, b], i) => v.fillRect(cx + a, cy - 3 + i, b - a, 1));
      v.fillStyle = '#ffe08a'; v.fillRect(cx - 1, cy - 2, 1, 3); v.fillStyle = '#5a4020'; v.fillRect(cx - 1, cy + 3, 2, 1);
    }
  }
  V1.veNenPhong = function(){
    const A = V1.CANH && V1.CANH[G.id];
    if (A && A.meta.cot === E.BD.COT && A.meta.hang === E.BD.HANG){ veNenAnh(A); return; }
    const C = E.BD.COT, R = E.BD.HANG, L = E.BD.L;
    NEN.width = C * OD; NEN.height = R * OD; GIA.width = C * OD; GIA.height = R * OD;
    const v = NEN.getContext('2d'), gv = GIA.getContext('2d');
    v.clearRect(0, 0, NEN.width, NEN.height); gv.clearRect(0, 0, GIA.width, GIA.height);
    const ch = (c, r) => (c < 0 || c >= C || r < 0 || r >= R) ? '#' : L[r][c];
    const cuaK = oCuaKhoa();
    const dac = (c, r) => laDac(ch(c, r)) && !cuaK.has(c + ',' + r);
    // độ sâu trong đá (khoảng cách tới ô trống, tối đa 3)
    const sau = [];
    for (let r = 0; r < R; r++){ sau.push([]); for (let c = 0; c < C; c++){
      let d = 9; if (!dac(c, r)) d = 0;
      else for (let k = 1; k <= 3 && d === 9; k++) for (let dy = -k; dy <= k && d === 9; dy++) for (let dx = -k; dx <= k; dx++){ const cc = c + dx, rr = r + dy; if (cc >= 0 && cc < C && rr >= 0 && rr < R && !dac(cc, rr)){ d = k; break; } }
      sau[r].push(d); } }
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++){
      const t = ch(c, r), X = c * OD, Y = r * OD, k = cuaK.get(c + ',' + r);
      if (k){ if (!(k === 'khoa' && coHinhCua())) veSongRe(v, X, Y, k, c, r); continue; }
      if (laDac(t)) veDa(t === 'G' ? gv : v, X, Y, c, r, sau[r][c], dac, t);
      else if (t === '=') veSanMong(v, X, Y, c, r, ch);
      else if (t === 'H') veDay(v, X, Y, c, r, ch);
    }
    // rễ rủ dưới trần (vẽ vào ô trống ngay dưới đá)
    for (let r = 0; r < R - 1; r++) for (let c = 0; c < C; c++){
      if (!dac(c, r) || dac(c, r + 1) || ch(c, r) === 'G') continue;
      const X = c * OD, Y = (r + 1) * OD;
      for (let i = 0; i < 3; i++){ const h0 = hash(c * 7 + i, r * 3); if (h0 < 0.45) continue; const x = X + 2 + Math.floor(hash(c, r + i * 11) * 12), len = 2 + Math.floor(h0 * 7);
        v.fillStyle = PAL.re; v.fillRect(x, Y, 1, len); v.fillStyle = PAL.toi; v.fillRect(x, Y + len, 1, 1); }
    }
  };
  function veDa(v, X, Y, c, r, d, dac, t){
    v.fillStyle = d >= 3 ? PAL.sau : d === 2 ? '#1e1213' : PAL.mat; v.fillRect(X, Y, OD, OD);
    if (d <= 2){   // đá cuội
      for (let i = 0; i < 3; i++){
        const h0 = hash(c * 13 + i, r * 17 + i), x = X + Math.floor(hash(c + i * 5, r) * 11), y = Y + Math.floor(h0 * 11), w = 3 + Math.floor(hash(c, r + i) * 3), h = 2 + Math.floor(h0 * 3);
        v.fillStyle = PAL.toi; v.fillRect(x - 1, y - 1, w + 2, h + 2);
        v.fillStyle = d === 1 ? PAL.da : '#3a2523'; v.fillRect(x, y, w, h);
        if (d === 1){ v.fillStyle = PAL.da2; v.fillRect(x, y, w, 1); }
      }
    }
    // viền
    if (!dac(c, r - 1)){ v.fillStyle = PAL.toi; v.fillRect(X, Y, OD, 1); v.fillStyle = PAL.vien; v.fillRect(X, Y + 1, OD, 2); v.fillStyle = PAL.da; v.fillRect(X, Y + 3, OD, 1);
      v.fillStyle = PAL.sang; for (let i = 0; i < 3; i++) v.fillRect(X + Math.floor(hash(c, r * 5 + i) * 15), Y + 1, 1 + (i & 1), 1); }
    if (!dac(c, r + 1)){ v.fillStyle = PAL.toi; v.fillRect(X, Y + OD - 2, OD, 2); v.fillStyle = PAL.re; v.fillRect(X, Y + OD - 3, OD, 1); }
    if (!dac(c - 1, r)){ v.fillStyle = PAL.toi; v.fillRect(X, Y, 1, OD); v.fillStyle = PAL.re; v.fillRect(X + 1, Y, 1, OD); }
    if (!dac(c + 1, r)){ v.fillStyle = PAL.toi; v.fillRect(X + OD - 1, Y, 1, OD); v.fillStyle = PAL.re; v.fillRect(X + OD - 2, Y, 1, OD); }
    if (t === 'N'){   // tường nứt: vết nứt (dấu hiệu bí mật) – càng chém càng nứt
      const n = (E.BD.nut[c + ',' + r] || {}).lan || 0;
      v.fillStyle = PAL.toi;
      const z = [[3, 1], [5, 3], [4, 5], [7, 7], [6, 9], [9, 11], [8, 13], [10, 15]];
      for (const [x, y] of z) v.fillRect(X + x, Y + y, 2, 2);
      v.fillStyle = '#8a6a5a'; for (const [x, y] of z) v.fillRect(X + x + 2, Y + y, 1, 1);
      if (n >= 1){ v.fillStyle = PAL.toi; for (const [x, y] of [[11, 2], [12, 4], [11, 6], [2, 10], [3, 12]]) v.fillRect(X + x, Y + y, 2, 2); }
      if (n >= 2){ v.fillStyle = '#000'; v.fillRect(X + 5, Y + 6, 5, 4); v.fillStyle = '#c28a45'; v.fillRect(X + 6, Y + 7, 1, 1); }
    }
  }
  function veSanMong(v, X, Y, c, r, ch){
    v.fillStyle = PAL.toi; v.fillRect(X, Y, OD, 6);
    v.fillStyle = PAL.da2; v.fillRect(X, Y + 1, OD, 3); v.fillStyle = PAL.vien; v.fillRect(X, Y + 1, OD, 1);
    v.fillStyle = PAL.re; v.fillRect(X, Y + 4, OD, 1);
    if (ch(c - 1, r) !== '=') { v.fillStyle = PAL.toi; v.fillRect(X, Y, 1, 6); }
    if (ch(c + 1, r) !== '=') { v.fillStyle = PAL.toi; v.fillRect(X + OD - 1, Y, 1, 6); }
    for (let i = 0; i < 2; i++){ const x = X + 3 + Math.floor(hash(c, r + i * 9) * 10), len = 2 + Math.floor(hash(c + i, r) * 5); v.fillStyle = PAL.re; v.fillRect(x, Y + 6, 1, len); }
  }
  function veDay(v, X, Y, c, r, ch){
    for (let y = 0; y < OD; y++){
      const k = (r * OD + y) / 5, a = Math.round(Math.sin(k) * 2), b = Math.round(Math.sin(k + 2.6) * 2);
      v.fillStyle = PAL.toi; v.fillRect(X + 6 + a, Y + y, 3, 1); v.fillRect(X + 8 + b, Y + y, 3, 1);
      v.fillStyle = PAL.re2; v.fillRect(X + 7 + a, Y + y, 1, 1); v.fillStyle = PAL.re; v.fillRect(X + 9 + b, Y + y, 1, 1);
    }
    if (hash(c, r) > 0.5){ v.fillStyle = PAL.la; v.fillRect(X + 3, Y + 5, 3, 2); v.fillRect(X + 11, Y + 11, 3, 2); }
    if (ch(c, r - 1) !== 'H'){ v.fillStyle = PAL.re2; v.fillRect(X + 5, Y, 6, 2); }
  }
  function veSongRe(v, X, Y, k, c, r){
    v.fillStyle = 'rgba(10,6,7,0.85)'; v.fillRect(X, Y, OD, OD);
    for (const x of [2, 7, 12]){ v.fillStyle = PAL.toi; v.fillRect(X + x - 1, Y, 4, OD); v.fillStyle = PAL.re2; v.fillRect(X + x, Y, 2, OD); v.fillStyle = PAL.vien; v.fillRect(X + x, Y + (r * 5 + x) % 12, 1, 3); }
    if (k === 'khoa'){ v.fillStyle = '#c28a45'; v.fillRect(X + 6, Y + 6, 4, 4); v.fillStyle = '#ffe08a'; v.fillRect(X + 7, Y + 7, 2, 2); }
  }

  /* ---------------- HIỆU ỨNG HẠT ---------------- */
  const TIA = [];
  V1.hieuUng = function(loai, x, y){
    if (loai === 'nhat') for (let i = 0; i < 12; i++){ const a = i / 12 * 6.283; TIA.push({x, y, vx:Math.cos(a) * 3, vy:Math.sin(a) * 3 - 1, t:18, m:i % 2 ? '#ffe08a' : '#78e6e6', g:0.05}); }
    if (loai === 'vo_mat_na') for (let i = 0; i < 8; i++) TIA.push({x, y:y - 6, vx:(Math.random() - .5) * 6, vy:-2 - Math.random() * 3, t:24, m:'#e9e2d0', g:0.3});
    if (loai === 'da') for (let i = 0; i < 14; i++) TIA.push({x, y, vx:(Math.random() - .5) * 7, vy:-1 - Math.random() * 4, t:26, m:i % 2 ? '#51302c' : '#947666', g:0.35});
  };
  V1.suKienVe = function(){
    for (const e of E.SUKIEN){
      if (e.k === 'trung'){ const ten = {ngang:'ngang', cung:'cung', cheo:'cheo', no:'no'}[e.tia] || 'ngang';
        if (V1.IMG['fx_c_' + ten]) CHEM.push({ten, x:e.x, y:e.y, f:e.face || 1, t:0}); else TIA.push(...E.tiaTrung(e)); }   // hiệu ứng trúng đòn ChatGPT vẽ (6 khung, hướng PHẢI)
      if (e.k === 'bi-danh') for (let i = 0; i < 10; i++){ const a = (i / 10) * Math.PI * 2;
        TIA.push({x:pl.x + pl.w / 2, y:pl.y + pl.h - 60, vx:Math.cos(a) * 3, vy:Math.sin(a) * 3, t:12, m:'#ffbe50', g:0.18}); }
      if (e.k === 'hoi-mau') HOI.t = 0;   // khung loé + vòng chuông khi cộng máu
      if (e.k === 'nut-trung' || e.k === 'vo-tuong'){ V1.hieuUng('da', (e.cot + 0.5) * T, (e.hang + 0.5) * T); if (e.k === 'nut-trung') V1.veNenPhong(); }
    }
  };
  const CHEM = [], CHEM_NHIP = 3;   // mỗi khung 3 bước
  function veChem(){
    for (const c of CHEM){ const im = V1.IMG['fx_c_' + c.ten], k = Math.floor(c.t / CHEM_NHIP); if (!im || k > 5) continue;
      const s = c.ten === 'no' ? 1.0 : 0.85, w = 128 * s;
      ctx.save(); ctx.imageSmoothingEnabled = false; ctx.translate(Math.round(c.x), Math.round(c.y)); if (c.f < 0) ctx.scale(-1, 1);
      ctx.drawImage(im, k * 128, 0, 128, 128, Math.round(-w / 2), Math.round(-w / 2), Math.round(w), Math.round(w)); ctx.restore(); }
  }
  // Hiệu ứng hồi máu (ChatGPT vẽ, 8 khung 136x172): khung 0-3 chạy theo clip 'hoimau' tới lúc cộng máu, khung 4-7 sau khi cộng
  const HOI = {t:-1}, HOI_NHIP = 7;
  function veHoi(){
    const im = V1.IMG.fx_hoi_mau; if (!im) return; let k = -1;
    if (HOI.t >= 0) k = 4 + Math.floor(HOI.t / HOI_NHIP);
    else if (pl.hoi >= 0 && !pl.hoiXong){ const C = clipNV('hoimau'), mH = C.buoc.slice(0, C.def.khung_hoi ?? 3).reduce((a, b) => a + b, 0) || 1; k = Math.min(3, Math.floor(pl.hoi / mH * 4)); }
    if (k < 0 || k > 7) return;
    ctx.save(); ctx.imageSmoothingEnabled = false;
    ctx.drawImage(im, k * 136, 0, 136, 172, Math.round(pl.x + pl.w / 2 - 68), Math.round(pl.y + pl.h / 2 - 86), 136, 172); ctx.restore();
  }
  V1.buocTia = function(){ if (HOI.t >= 0 && ++HOI.t >= HOI_NHIP * 4) HOI.t = -1; for (let i = CHEM.length - 1; i >= 0; i--) if (++CHEM[i].t >= CHEM_NHIP * 6) CHEM.splice(i, 1); for (let i = TIA.length - 1; i >= 0; i--){ const p = TIA[i]; p.x += p.vx; p.y += p.vy; p.vy += p.g; if (--p.t <= 0) TIA.splice(i, 1); } };

  /* ---------------- NHÂN VẬT + QUÁI (như phòng demo) ---------------- */
  function khoi(fx, fy, w, h, mau, face){
    fx = Math.round(fx); fy = Math.round(fy);
    ctx.fillStyle = '#0d0f1c'; ctx.fillRect(fx - w / 2 - 2, fy - h - 2, w + 4, h + 2);
    ctx.fillStyle = mau; ctx.fillRect(fx - w / 2, fy - h, w, h);
    ctx.fillStyle = '#ffe08a'; ctx.fillRect(fx + (face > 0 ? w / 4 : -w / 4 - 4), fy - h + 12, 4, 4);
  }
  const HA = V1.HA = {ten:'', t:0};
  const clipNV = ten => E.NV.capClip[ten] || E.NV.clip[ten];
  function veNV(){
    const st = E.trangThai(), C = clipNV(st.ten);
    if (pl.nhay > 0 && pl.hurtT <= 0 && pl.dash <= 0 && !pl.dead && (E.S.frame >> 2) % 2 === 0) return;
    const fx = pl.x + pl.w / 2, fy = pl.y + pl.h;
    const al = pl.dead && C ? Math.max(0, Math.min(1, 1 - (pl.deadT - C.tong - 10) / 40)) : undefined;
    if (C && C.ok){
      const n = C.hinh.length;
      const k = st.k ?? (st.tiLe !== undefined ? SpriteMN.khungTheoBuoc(C, clampN(st.tiLe, 0, 0.999) * C.tong) : SpriteMN.khungTheoBuoc(C, st.t ?? HA.t));
      const tr = E.trangNV();
      if (window.LopTrangBi) LopTrangBi.veSau(ctx, st.ten, k, fx, fy, pl.face < 0, E.TL * E.CO, al, tr);   // lớp trang bị sau lưng (chưa đeo/chưa có ảnh = không vẽ gì)
      SpriteMN.ve(ctx, C, k, fx, fy, pl.face < 0, E.TL * E.CO, al, tr);   // loé trắng 1–2 khung đầu khi trúng đòn
      if (window.LopTrangBi) LopTrangBi.veTruoc(ctx, st.ten, k, fx, fy, pl.face < 0, E.TL * E.CO, al, tr);
    } else khoi(fx, fy, 30, 78, '#d8dde3', pl.face);
  }
  function veQuai(q){
    if (q.dead) return;
    if (q.laTrum){ veTrum(q); return; }
    const d = q.def, Cs = d._clip || {}, A = q.anim;
    let C = A.ten === 'danh' && Cs.fx && Cs.fx.ok ? Cs.fx : Cs[A.ten];
    if (!(C && C.ok) && A.ten === 'di') C = Cs.dung;
    if (!(C && C.ok) && A.ten === 'danh') C = Cs.danh && Cs.danh.ok ? Cs.danh : Cs.dung;
    if (!(C && C.ok) && A.ten === 'trung') C = Cs.dung;
    const fx = q.x + q.w / 2 + VCQ.rung(q), fy = q.y + q.h, al = q.alpha < 1 ? q.alpha : undefined;
    if (C && C.ok && C.chan){
      const k = A.k ?? SpriteMN.khungTheoBuoc(C, A.t);
      SpriteMN.ve(ctx, C, k, fx, fy, q.face > 0, E.TL, al, q.flash > 2);
    } else { if (al !== undefined) ctx.globalAlpha = al; khoi(fx, fy, q.w, q.h, q.flash > 2 ? '#ffffff' : (d.mau_khoi || '#a07850'), q.face); ctx.globalAlpha = 1; }
    if (q.baoTruoc && (E.S.frame >> 2) % 2 === 0) veCham(fx, q.y - 26, q._gia);
  }
  // thanh máu quái (ChatGPT vẽ): khung đồng 2 chuông + ruột đỏ gạch cắt theo tỉ lệ máu; tâm-trên tại (x, y), phóng k
  function veThanhMau(x, y, tl, k){
    const K = V1.IMG.fx_khung_mau, R = V1.IMG.fx_ruot_mau; if (!K || !R) return false;
    const w = K.width * k, h = K.height * k, x0 = Math.round(x - w / 2), y0 = Math.round(y);
    ctx.save(); ctx.imageSmoothingEnabled = false;
    ctx.drawImage(K, x0, y0, Math.round(w), Math.round(h));   // khung trước (lòng khung tối, đặc) rồi ruột đỏ đè lên trong lòng
    const rw = Math.max(0, Math.round(64 * k * tl)); if (rw > 0) ctx.drawImage(R, 0, 0, Math.max(1, Math.round(R.width * tl)), R.height, x0 + Math.round(9 * k), y0 + Math.round(4 * k), rw, Math.max(2, Math.round(4 * k)));
    ctx.restore(); return true;
  }
  V1.veThanhMau = veThanhMau;
  function veCham(x, y, xam){ x = Math.round(x); y = Math.round(y);
    if (!xam && V1.IMG.dd_canh_bao){ veAnhDay(V1.IMG.dd_canh_bao, x, y + 26, 2.2, false); return; }
    ctx.fillStyle = '#0d0f1c'; ctx.fillRect(x - 5, y - 2, 10, 24); ctx.fillStyle = xam ? '#9aa3ad' : '#ffbe50'; ctx.fillRect(x - 3, y, 6, 12); ctx.fillRect(x - 3, y + 15, 6, 5); }

  /* ---------------- TRÙM: hình thật theo ID clip, chưa có → tượng tạm ---------------- */
  function veTrum(q){
    const C = (V1.TRUM_CLIP || {})[q.clip], fx = q.x + q.w / 2, fy = q.y + q.h, al = q.alpha < 1 ? q.alpha : undefined;
    if (C && C.ok){ SpriteMN.ve(ctx, C, SpriteMN.khungTheoBuoc(C, q.clipT), fx, fy, q.face > 0, (V1.TRUMJ && V1.TRUMJ.ti_le) || 2, al, q.flash > 2); }
    else if (V1.IMG.trum_nghi && V1.IMG.trum_gio && V1.IMG.trum_vo) veTrumAnh(q, fx, fy);
    else veTrumTam(q, fx, fy);
    if (q.baoTruoc && (E.S.frame >> 2) % 2 === 0) veCham(fx, q.y - 30);
  }
  /* Trùm bằng 3 hình ChatGPT (quay TRÁI, lật khi quay phải):
     nghi = đứng nghỉ / pha 1 · gio = giơ chuông (gầm + báo trước mọi đòn ở pha 1, lúc quét chuông) · vo = mặt nạ vỡ (pha 2).
     neo = điểm chân (tỉ lệ theo chiều ngang hình) đo từ khối rễ + thân, để đổi hình không bị giật ngang. */
  const TRUM_ANH = {nghi:{k:'trum_nghi', ax:0.517}, gio:{k:'trum_gio', ax:0.596}, vo:{k:'trum_vo', ax:0.507}};
  const TRUM_TL = 0.75;   // px logic / điểm ảnh gốc → cao ~216 px ≈ 2.8 lần nhân vật (78 px); chỉnh ở đây nếu cần
  function veTrumAnh(q, fx, fy){
    const t = q.t, pha2 = q.pha >= 2;
    let ten = pha2 ? 'vo' : 'nghi', ox = 0, sx = 1, sy = 1, sang = 0, ng = 0;
    if (q.st === 'gam'){ ten = 'gio'; ox = (t >> 1) % 2 ? 3 : -3; }   // gầm: RUNG VỎ (nứt đỏ vẽ ở veBaoTrum, sau lớp tối)
    else if (q.keoQuet > 0){ ten = pha2 ? 'vo' : 'gio'; ng = q.keoQuet; sang = (t >> 2) % 2 ? 0.35 : 0.15; }   // quét: KÉO NGƯỢC – ngả chuông ra sau
    else if (q.baoTruoc || q.st === 'quet' && q.dangQuet){ ten = pha2 ? 'vo' : 'gio'; if (pha2){ sy = 1.04; sx = 0.98; } sang = (t >> 2) % 2 ? 0.35 : 0.15; }
    else if (q.st === 'go' && t < 46 + 10){ ten = pha2 ? 'vo' : 'nghi'; const k = Math.max(0, 1 - Math.abs(t - 32) / 8); sx = 1 + 0.05 * k; sy = 1 - 0.05 * k; }
    else if (q.st === 'chuyen_pha'){ ten = t < 50 ? 'nghi' : 'vo'; ox = ((t >> 1) % 2 ? 3 : -3); if (t > 44 && t < 56) sang = 0.6; }
    else if (q.st === 'chet'){ ox = ((t >> 2) % 2 ? 2 : -2); }
    const A = TRUM_ANH[ten], im = V1.IMG[A.k], cao = Math.round(im.height * TRUM_TL), lat = q.face > 0;
    q._ve = {ox, ng, cao, ax:A.ax, w:Math.round(im.width * TRUM_TL)};   // cho veBaoTrum (nứt đỏ bám đúng hình đang rung)
    const trang = q.flash > 2 ? 0.85 : (q.st === 'chuyen_pha' ? sang : 0);
    if (sang && q.st !== 'chuyen_pha'){   // báo đòn: chuông rực ánh hổ phách nhấp nháy
      const X = fx + (lat ? 1 : -1) * 10, Y = fy - cao * 0.72, r = 90;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const gr = ctx.createRadialGradient(X, Y, 0, X, Y, r); gr.addColorStop(0, 'rgba(255,190,80,' + sang + ')'); gr.addColorStop(1, 'rgba(255,190,80,0)');
      ctx.fillStyle = gr; ctx.fillRect(X - r, Y - r, r * 2, r * 2); ctx.restore();
    }
    if (ng > 0){   // ngả ra sau quanh chân: đỉnh chuông lùi ngược hướng quét tới ~22 px
      ctx.save(); ctx.translate(Math.round(fx + ox), Math.round(fy)); ctx.transform(1, 0, q.face * 0.1 * Math.min(1, ng * 1.6), 1, 0, 0);
      veAnh(im, 0, 0, cao, 2, A.ax, 1, lat, q.alpha < 1 ? q.alpha : undefined, trang); ctx.restore();
    } else if (sx === 1 && sy === 1) veAnh(im, fx + ox, fy, cao, 2, A.ax, 1, lat, q.alpha < 1 ? q.alpha : undefined, trang);
    else {   // co giãn quanh chân (đập chuông / gồng)
      ctx.save(); ctx.translate(Math.round(fx + ox), Math.round(fy)); ctx.scale(sx, sy);
      veAnh(im, 0, 0, cao, 2, A.ax, 1, lat, q.alpha < 1 ? q.alpha : undefined, trang); ctx.restore();
    }
  }
  /* BÁO ĐÒN TRÙM (luồng F) – vẽ SAU lớp bóng tối nên luôn rõ trên điện thoại:
     • gầm / chuyển pha: NỨT ĐỎ phát sáng trên vỏ chuông (không sát thương);
     • Quét Chuông: VÙNG NGUY HIỂM đúng bằng tầm quét (đỏ, đậm dần trong 0,45 s kéo ngược) + mũi tên hướng quét;
     • Gõ Không Tiếng: vạch đỏ + mũi tên hai bên chân (sóng chạy dọc sàn → nhảy). */
  const NUT = [[[150, 70], [140, 95], [152, 120], [138, 150], [146, 176]], [[95, 108], [110, 130], [100, 150], [118, 172]],
    [[206, 98], [195, 124], [212, 146], [200, 170]], [[60, 160], [80, 172], [72, 192]], [[232, 150], [216, 166], [226, 186]], [[140, 95], [120, 88], [104, 96]]];
  // vẽ khung k của dải n khung ngang (ChatGPT vẽ) vào hình chữ nhật (x, y, w, h); lat = lật ngang quanh tâm
  function oKhung(im, n, k, x, y, w, h, lat, a){
    if (!im) return false; const cw = im.width / n; k = Math.max(0, Math.min(n - 1, k | 0));
    ctx.save(); if (a !== undefined) ctx.globalAlpha *= a; ctx.imageSmoothingEnabled = false;
    if (lat){ ctx.translate(Math.round(x + w / 2), 0); ctx.scale(-1, 1); x = -w / 2; }
    ctx.drawImage(im, k * cw, 0, cw, im.height, Math.round(x), Math.round(y), Math.round(w), Math.round(h)); ctx.restore(); return true;
  }
  V1.oKhung = oKhung;
  function veBaoTrum(q){
    const fx = q.x + q.w / 2, fy = q.y + q.h, f = (E.S.frame >> 2) % 2;
    // nứt đỏ
    let nut = 0;
    if (q.st === 'gam') nut = Math.min(1, q.t / 18) * (q.t > 60 ? (70 - q.t) / 10 : 1);
    else if (q.st === 'chuyen_pha') nut = Math.min(1, q.t / 20);
    else if (q.pha >= 2 && q.st !== 'chet') nut = 0.35;   // pha 2: vết nứt còn âm ỉ
    if (nut > 0 && q._ve && V1.IMG.trum_nghi){
      const im = V1.IMG.trum_nghi, k = TRUM_TL, lat = q.face > 0, ox = q._ve.ox, ax = 0.517 * im.width;
      const P = ([ix, iy]) => [fx + ox + (lat ? -1 : 1) * (ix - ax) * k, fy - (im.height - iy) * k];   // hình gốc quay TRÁI, quay phải thì lật
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      const nhap = 0.75 + 0.25 * Math.sin(E.S.frame / 3);
      for (const [w, mau] of [[9, 'rgba(255,30,20,' + 0.28 * nut * nhap + ')'], [3.5, 'rgba(255,70,40,' + 0.95 * nut + ')'], [1.5, 'rgba(255,200,150,' + 0.8 * nut + ')']]){
        ctx.lineWidth = w; ctx.strokeStyle = mau;
        for (const d of NUT){ ctx.beginPath(); d.forEach((p, i) => { const [X, Y] = P(p); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.stroke(); }
      }
      ctx.restore();
    }
    // Quét Chuông: vùng nguy hiểm
    if (q.keoQuet > 0 || q.dangQuet){
      const k = q.dangQuet ? 1 : q.keoQuet, dai = q.quetDai || 190, x0 = fx + q.face * 24, x1 = x0 + q.face * dai, xa = Math.min(x0, x1), H = 80;
      ctx.save();
      const IQ = V1.IMG.tr_bao_quet;
      if (IQ){   // vùng báo quét (ChatGPT vẽ): sáng dần theo k, mũi tên chỉ hướng quét
        oKhung(IQ, 4, q.dangQuet ? 3 : Math.min(3, k * 4), xa, fy - 92, dai, 96, q.face < 0, f ? 1 : 0.85);
        ctx.fillStyle = 'rgba(255,220,120,0.9)'; const L = dai * k; ctx.fillRect(Math.round(q.face > 0 ? x0 : x0 - L), fy - 98, Math.round(L), 4);
        ctx.restore();
      } else {
      ctx.fillStyle = 'rgba(210,40,30,' + (0.14 + 0.26 * k) * (f ? 1 : 0.8) + ')'; ctx.fillRect(Math.round(xa), fy - H, dai, H);
      ctx.fillStyle = 'rgba(255,70,40,0.95)'; ctx.fillRect(Math.round(xa), fy - 4, dai, 4);   // mép sàn của vùng
      ctx.strokeStyle = 'rgba(255,190,80,' + (0.55 + 0.45 * f) + ')'; ctx.lineWidth = 2; ctx.setLineDash([8, 6]);
      ctx.strokeRect(Math.round(xa) + 1, fy - H + 1, dai - 2, H - 2); ctx.setLineDash([]);
      // thanh thời gian: đầy dần từ phía trùm → khi đầy là quét
      ctx.fillStyle = 'rgba(255,220,120,0.9)'; const L = dai * k; ctx.fillRect(Math.round(q.face > 0 ? x0 : x0 - L), fy - H - 6, Math.round(L), 4);
      // mũi tên
      ctx.fillStyle = 'rgba(255,230,190,' + (0.5 + 0.5 * f) + ')';
      for (let i = 0; i < 3; i++){ const ax = x0 + q.face * (dai * (0.3 + i * 0.25)), ay = fy - H / 2;
        ctx.beginPath(); ctx.moveTo(ax + q.face * 10, ay); ctx.lineTo(ax - q.face * 6, ay - 12); ctx.lineTo(ax - q.face * 6, ay + 12); ctx.closePath(); ctx.fill(); }
      ctx.restore();
      }
    }
    // Gõ Không Tiếng: vạch đỏ hai bên chân lúc giơ chuông
    if (q.st === 'go' && q.baoTruoc && V1.IMG.tr_bao_quet){   // Gõ Không Tiếng: dải báo đỏ hai bên chân (ChatGPT vẽ)
      for (const d of [-1, 1]) oKhung(V1.IMG.tr_bao_quet, 4, f ? 3 : 2, d > 0 ? fx + 40 : fx - 40 - 200, fy - 64, 200, 68, d < 0);
    }
    else if (q.st === 'go' && q.baoTruoc){
      ctx.save();
      for (const d of [-1, 1]){
        const xs = fx + d * 40;
        ctx.fillStyle = 'rgba(255,70,40,' + (0.6 + 0.4 * f) + ')';
        for (let i = 0; i < 6; i++) ctx.fillRect(Math.round(xs + d * i * 30 - (d < 0 ? 18 : 0)), fy - 5, 18, 5);
        ctx.fillStyle = 'rgba(255,190,80,' + (0.5 + 0.5 * f) + ')'; const ax = xs + d * 190, ay = fy - 22;
        ctx.beginPath(); ctx.moveTo(ax + d * 12, ay); ctx.lineTo(ax - d * 6, ay - 12); ctx.lineTo(ax - d * 6, ay + 12); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }
    // Mưa Mặt Nạ: cột sáng mờ từ trên xuống + vòng đỏ-hổ phách ở chỗ sẽ rơi (đậm dần tới lúc rơi)
    for (const n of G.nguy){
      if (n.loai !== 'mat_na' || n.bao <= 0) continue;
      const k = clampN(1 - n.bao / 30, 0, 1), x = n.xDich, y = n.yDat, top = Math.max(n.yTren, (V1.CAM ? V1.CAM.y : 0));
      if (oKhung(V1.IMG.tr_dich_mat_na, 3, k * 3, x - 50, y - 40, 100, 42, false, f ? 1 : 0.8)) continue;   // vòng đích (ChatGPT vẽ)
      ctx.fillStyle = 'rgba(255,190,80,' + (0.06 + 0.12 * k) + ')'; ctx.fillRect(Math.round(x - 16), Math.round(top), 32, Math.round(y - top));
      ctx.strokeStyle = 'rgba(255,90,50,' + (0.55 + 0.45 * f) + ')'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(x, y - 3, 26 - 8 * k, 7 - 2 * k, 0, 0, 6.283); ctx.stroke();
      ctx.fillStyle = 'rgba(255,200,110,0.95)'; ctx.fillRect(Math.round(x - 3), Math.round(y - 30), 6, 14); ctx.fillRect(Math.round(x - 3), Math.round(y - 12), 6, 5);
    }
    if (V1.OPT && V1.OPT.hb){   // ?hitbox=1: xanh = thân chắn, vàng = vùng nhận đòn
      const B = V1.thanTrum(q); ctx.lineWidth = 2; ctx.strokeStyle = '#3f6'; ctx.strokeRect(B.x, B.y, B.w, B.h);
    }
  }
  function veTrumTam(q, fx, fy){
    const f = q.face, t = q.t, fl = q.flash > 2, pha2 = q.pha >= 2;
    let ox = 0; if (q.st === 'chuyen_pha') ox = ((t >> 1) % 2 ? 3 : -3);
    if (q.st === 'chet') ox = ((t >> 2) % 2 ? 2 : -2);
    ctx.save(); ctx.translate(Math.round(fx + ox), Math.round(fy));
    if (q.alpha < 1) ctx.globalAlpha = Math.max(0, q.alpha);
    const da = fl ? '#d8d2c8' : '#4a3d36', vien = '#1a1311', da2 = fl ? '#f0ebe0' : '#6f5a4a', dong = fl ? '#fff2c8' : '#8a6a3a';
    // chân rễ
    ctx.fillStyle = vien; for (let i = -3; i <= 3; i++) ctx.fillRect(i * 18 - 3, -18, 8, 18);
    ctx.fillStyle = PAL.re2; for (let i = -3; i <= 3; i++) ctx.fillRect(i * 18 - 1, -16, 4, 16 + (i & 1) * 2);
    // thân (áo đá hình thang)
    ctx.fillStyle = vien; ctx.beginPath(); ctx.moveTo(-64, -10); ctx.lineTo(64, -10); ctx.lineTo(38, -196); ctx.lineTo(-38, -196); ctx.closePath(); ctx.fill();
    ctx.fillStyle = da; ctx.beginPath(); ctx.moveTo(-58, -14); ctx.lineTo(58, -14); ctx.lineTo(34, -192); ctx.lineTo(-34, -192); ctx.closePath(); ctx.fill();
    ctx.fillStyle = da2; for (let i = 0; i < 5; i++) ctx.fillRect(-40 + i * 18, -60 - (i % 2) * 40, 4, 34);
    // tay rễ
    const tay = q.st === 'go' ? (t < 30 ? -1 : 1) : q.st === 'tha' ? 0 : q.st === 'gam' ? -1 : 2;
    for (const s of [-1, 1]){
      ctx.strokeStyle = vien; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(s * 34, -170);
      if (tay === -1){ ctx.quadraticCurveTo(s * 70, -230, s * 30, -262); }
      else if (tay === 1){ ctx.quadraticCurveTo(s * 80, -120, s * 70, -10); }
      else if (tay === 0){ ctx.quadraticCurveTo(s * 90, -190, s * 120, -210); }
      else { ctx.quadraticCurveTo(s * 66, -120, s * 56, -40 + Math.sin(t / 20 + s) * 4); }
      ctx.stroke(); ctx.strokeStyle = PAL.re2; ctx.lineWidth = 6; ctx.stroke();
    }
    // chuông ngực (thủng)
    const by = -128, glow = (q.st === 'go' || q.st === 'gam') && t < 30;
    ctx.fillStyle = vien; ctx.beginPath(); ctx.arc(0, by, 30, 0, 6.283); ctx.fill();
    ctx.fillStyle = dong; ctx.beginPath(); ctx.arc(0, by, 26, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#5a4020'; ctx.fillRect(-26, by + 4, 52, 4);
    ctx.fillStyle = glow && (t >> 2) % 2 ? '#ffbe50' : '#05030a'; ctx.beginPath(); ctx.arc(4, by - 2, 10, 0, 6.283); ctx.fill();
    // mặt nạ không mắt
    const my = -218;
    ctx.fillStyle = vien; ctx.beginPath(); ctx.ellipse(0, my, 22, 28, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = fl ? '#ffffff' : '#e9e2d0'; ctx.beginPath(); ctx.ellipse(0, my, 19, 25, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#b9b09c'; ctx.fillRect(-8, my + 12, 16, 2); for (let i = -6; i <= 6; i += 4) ctx.fillRect(i, my + 10, 1, 6);
    if (pha2 || (q.st === 'chuyen_pha' && t > 50)){
      ctx.fillStyle = '#05030a'; ctx.beginPath(); ctx.moveTo(4, my - 25); ctx.lineTo(19, my - 8); ctx.lineTo(10, my + 2); ctx.lineTo(2, my - 10); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#c0392b'; ctx.fillRect(-12, my - 4, 10, 2); ctx.fillRect(-4, my - 2, 2, 12); ctx.fillRect(-30, -100, 2, 40); ctx.fillRect(22, -150, 2, 50);
    }
    if (q.st === 'tha' && t < 30){ ctx.fillStyle = '#e9e2d0'; for (const s of [-1, 1]) for (let i = 0; i < 2; i++){ ctx.beginPath(); ctx.ellipse(s * (90 + i * 30), -230 - i * 16 + Math.sin(t / 5) * 3, 9, 11, 0, 0, 6.283); ctx.fill(); } }
    ctx.restore();
  }

  /* ---------------- VẬT PHẨM / CHUÔNG / TÚI / NGUY HIỂM ---------------- */
  function veIcon(loai, x, y, s){   // tâm (x, y), cỡ s (px logic ~ 1 = 24 px)
    const ICON = {manh_am:'fx_i_manh_am', chuong_vo:'fx_i_chuong_vo', tang_mau:'fx_i_mat_na', hat_vong:'hud_i_hat_vong', the_ten:'hud_i_the_ten', loi_vong_tan:'hud_i_loi_vong_tan'}[loai], IM = ICON && V1.IMG[ICON];
    if (IM){ const h = 24 * s * 1.1, w = IM.width * h / IM.height; ctx.save(); ctx.imageSmoothingEnabled = false; ctx.drawImage(IM, Math.round(x - w / 2), Math.round(y - h / 2), Math.round(w), Math.round(h)); ctx.restore(); return; }
    ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.scale(s, s);
    const o = (c, a, b, w, h) => { ctx.fillStyle = c; ctx.fillRect(a, b, w, h); };
    if (loai === 'manh_am'){ ctx.fillStyle = '#0d0f1c'; ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(9, 0); ctx.lineTo(0, 12); ctx.lineTo(-9, 0); ctx.fill();
      ctx.fillStyle = '#78e6e6'; ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(6, 0); ctx.lineTo(0, 9); ctx.lineTo(-6, 0); ctx.fill(); o('#e8ffff', -1, -6, 2, 5); }
    else if (loai === 'chuong_vo'){ o('#0d0f1c', -11, -12, 22, 24); o('#c28a45', -8, -8, 16, 14); o('#8a6a3a', -10, 4, 20, 4); o('#ffe08a', -6, -7, 3, 8); o('#3a2010', 1, -9, 2, 6); o('#3a2010', 3, -4, 2, 5); o('#c28a45', -2, -12, 4, 4); }
    else if (loai === 'hat_vong'){ ctx.fillStyle = '#0d0f1c'; ctx.beginPath(); ctx.arc(0, 0, 10, 0, 6.283); ctx.fill(); ctx.fillStyle = '#4fb8a8'; ctx.beginPath(); ctx.arc(0, 0, 7, 0, 6.283); ctx.fill(); o('#d8fff4', -3, -4, 3, 3); o('#3e5a3a', -1, -12, 2, 5); }
    else if (loai === 'tang_mau'){ ctx.fillStyle = '#0d0f1c'; ctx.beginPath(); ctx.ellipse(0, 0, 10, 12, 0, 0, 6.283); ctx.fill(); ctx.fillStyle = '#eef1f0'; ctx.beginPath(); ctx.ellipse(0, 0, 7, 9, 0, 0, 6.283); ctx.fill(); o('#0d0f1c', -4, -2, 3, 2); o('#0d0f1c', 1, -2, 3, 2); o('#c0392b', -1, 3, 2, 3); }
    else if (loai === 'the_ten'){ o('#0d0f1c', -10, -7, 20, 14); o('#b39161', -8, -5, 16, 10); o('#5a4020', -5, -2, 10, 1); o('#5a4020', -5, 1, 7, 1); }
    else if (loai === 'loi_vong_tan'){ ctx.fillStyle = '#0d0f1c'; ctx.beginPath(); ctx.arc(0, 0, 11, 0, 6.283); ctx.fill(); ctx.fillStyle = '#c0602b'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, 6.283); ctx.fill(); ctx.fillStyle = '#ffbe50'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, 6.283); ctx.fill(); }
    else { o('#0d0f1c', -8, -8, 16, 16); o('#ffe08a', -5, -5, 10, 10); }
    ctx.restore();
  }
  V1.veIcon = veIcon;
  function veTheGioi(){
    const p = G.phong, f = E.S.frame;
    // Chuông Lưu
    const c = p.chuong_luu;
    if (c){
      const x = c.cot * T + T / 2, y = V1.chanO(c.cot, c.hang), sang = G.luu.chuong && G.luu.chuong.phong === G.id;
      const im = sang ? V1.IMG.chuong_sang : V1.IMG.chuong_tat;
      if (im) veAnh(im, x, y + CHUONG.lun, CHUONG.cao, PX, 0.5, 1, false);   // hình ChatGPT: chân bệ đá trên mặt sàn
      else {
      ctx.fillStyle = '#0d0809'; ctx.fillRect(x - 30, y - 100, 60, 8); ctx.fillRect(x - 26, y - 100, 8, 100); ctx.fillRect(x + 18, y - 100, 8, 100);
      ctx.fillStyle = '#5c3c37'; ctx.fillRect(x - 28, y - 98, 56, 4); ctx.fillRect(x - 24, y - 94, 4, 94); ctx.fillRect(x + 20, y - 94, 4, 94);
      const lac = Math.sin(f / 30) * 2;
      ctx.save(); ctx.translate(x + lac, y - 90);
      ctx.fillStyle = '#0d0809'; ctx.beginPath(); ctx.moveTo(-15, 40); ctx.quadraticCurveTo(-15, 4, 0, 2); ctx.quadraticCurveTo(15, 4, 15, 40); ctx.closePath(); ctx.fill();
      ctx.fillStyle = sang ? '#e1b85a' : '#8a6a3a'; ctx.beginPath(); ctx.moveTo(-12, 38); ctx.quadraticCurveTo(-12, 6, 0, 5); ctx.quadraticCurveTo(12, 6, 12, 38); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#5a4020'; ctx.fillRect(-13, 32, 26, 4); ctx.fillStyle = '#ffe08a'; ctx.fillRect(-7, 10, 3, 18);
      ctx.restore();
      }
      if (G.ganChuong && !pl.dead){ chu('↑ Rest at the Rest Bell', x, y - CHUONG.cao - 14, 13, '#ffe08a'); }
    }
    veCuaKhoa();
    veDauHieu(); veBiaChiDuong();
    // vật phẩm
    for (const v of p.vat_pham){
      if (G.luu.daNhat.includes(v.id)) continue;
      const o = V1.viTriVP(v); veIcon(v.loai, o.x, o.y - 22 + Math.sin(f / 20 + v.cot) * 4, 1.2);
    }
    for (const v of G.vatRoi) veIcon(v.loai, v.x, v.y - 22 + Math.sin(f / 20) * 4, 1.3);
    // túi Mảnh Âm
    const tui = G.luu.tui;
    if (tui && tui.phong === G.id){
      const x = tui.x, y = tui.y;
      ctx.fillStyle = '#0d0f1c'; ctx.beginPath(); ctx.ellipse(x, y - 14, 18, 15, 0, 0, 6.283); ctx.fill();
      ctx.fillStyle = '#2a3a4a'; ctx.beginPath(); ctx.ellipse(x, y - 14, 15, 12, 0, 0, 6.283); ctx.fill();
      ctx.fillStyle = '#78e6e6'; ctx.fillRect(x - 3, y - 30, 6, 6); ctx.fillRect(x - 6, y - 16, 4, 4); ctx.fillRect(x + 3, y - 12, 4, 4);
      chu(tui.so + '', x, y - 38, 12, '#78e6e6');
    }
    // Mảnh Âm rơi
    for (const m of G.roi) veIcon('manh_am', m.x, m.y, 0.55);
  }
  /* (luồng G) DẪN HƯỚNG – 2 loại dấu, dùng NHẤT QUÁN mọi phòng (dữ liệu: "dau_hieu" trong phong/<ID>.json, dựng bởi dung-phong.py):
     • loi_chinh: cọc gỗ + CHUÔNG NHỎ HỔ PHÁCH đung đưa, ánh hổ phách nhịp chậm – đặt gần cửa đi tiếp của tuyến chính.
     • bi_mat:    VẾT NỨT đỏ sẫm âm ỉ + bụi rơi lác đác – đặt trên/cạnh tường nứt, tường giả, hốc ẩn. Không có ánh hổ phách.
     • bang_chi_duong (P05): bia đá 3 ổ chuông sáng theo số Chuông Vỡ đã có + "còn thiếu n" + mũi tên về Sảnh Chuông Vỡ / Đàn Chuông Câm. */
  // vẽ ảnh pixel (ChatGPT) neo ĐÁY-GIỮA tại (x, y) px logic, phóng k lần; lat = lật ngang
  function veAnhDay(im, x, y, k, lat, a){ if (!im) return false; const w = im.width * k, h = im.height * k;
    ctx.save(); ctx.imageSmoothingEnabled = false; if (a !== undefined) ctx.globalAlpha = Math.max(0, Math.min(1, a));
    ctx.translate(Math.round(x), Math.round(y)); if (lat) ctx.scale(-1, 1); ctx.drawImage(im, -Math.round(w / 2), -Math.round(h), Math.round(w), Math.round(h)); ctx.restore(); return true; }
  const VNUT = [[0, 0, 0, 10], [-1, 9, 4, 6], [3, 14, -3, 8], [-3, 21, 2, 7], [2, 27, -2, 9], [1, 16, 7, 4], [-2, 24, -8, 3]];   // đoạn nứt [x, y, dx, dy]
  function veDauHieu(){
    const p = G.phong, f = E.S.frame;
    for (const d of p.dau_hieu || []){
      const x = d.cot * T + T / 2;
      if (d.loai === 'loi_chinh'){
        const y = V1.chanO(d.cot, d.hang);
        if (veAnhDay(V1.IMG.dd_coc_chuong, x + 8, y + 2, 2.1, false)) continue;
        ctx.fillStyle = '#140c0b'; ctx.fillRect(x - 4, y - 66, 8, 66); ctx.fillRect(x - 4, y - 66, 26, 6);   // cọc + tay treo
        ctx.fillStyle = '#4a3026'; ctx.fillRect(x - 2, y - 64, 4, 62); ctx.fillRect(x - 2, y - 64, 22, 2);
        ctx.fillStyle = '#2a1a14'; ctx.fillRect(x - 8, y - 4, 16, 4);
        const lac = Math.round(Math.sin(f / 26 + d.cot) * 2.5);
        ctx.save(); ctx.translate(x + 16 + lac, y - 58);
        ctx.fillStyle = '#3a2618'; ctx.fillRect(-1, 0, 2, 8);
        ctx.fillStyle = '#120a08'; ctx.beginPath(); ctx.moveTo(-10, 26); ctx.quadraticCurveTo(-10, 6, 0, 6); ctx.quadraticCurveTo(10, 6, 10, 26); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#d99a3e'; ctx.beginPath(); ctx.moveTo(-8, 24); ctx.quadraticCurveTo(-8, 9, 0, 8); ctx.quadraticCurveTo(8, 9, 8, 24); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ffd98a'; ctx.fillRect(-5, 11, 2, 10); ctx.fillStyle = '#8a5a24'; ctx.fillRect(-9, 22, 18, 3);
        ctx.fillStyle = '#5a3a1a'; ctx.fillRect(-2, 25, 4, 4);
        ctx.restore();
      }
    }
  }
  function veNutBiMat(){   // vẽ SAU lớp tường giả (để dấu trên tường giả không bị che)
    const p = G.phong, f = E.S.frame;
    for (const d of p.dau_hieu || []){
      const x = d.cot * T + T / 2;
      if (d.loai === 'bi_mat'){
        const y = d.hang * T + T / 2, a = 0.7 + 0.3 * Math.sin(f / 40 + d.cot);
        if (V1.IMG.dd_nut_bi_mat){ veAnhDay(V1.IMG.dd_nut_bi_mat, x, y + 30, 2.2, d.cot % 2 === 1, a);
          for (let i = 0; i < 3; i++){ const k = ((f + i * 37 + d.cot * 11) % 90) / 90; ctx.fillStyle = 'rgba(176,163,153,' + (0.7 * (1 - k)) + ')'; ctx.fillRect(Math.round(x - 10 + i * 10), Math.round(y - 30 + k * 60), 3, 3); }
          continue; }
        ctx.save(); ctx.translate(Math.round(x), Math.round(y - 22)); ctx.scale(1.6, 1.6);
        for (const [x0, y0, dx, dy] of VNUT){
          ctx.strokeStyle = 'rgba(10,4,4,0.95)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + dx, y0 + dy); ctx.stroke();
          ctx.strokeStyle = 'rgba(176,64,44,' + a + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + dx, y0 + dy); ctx.stroke();
        }
        for (let i = 0; i < 3; i++){ const k = ((f + i * 37 + d.cot * 11) % 90) / 90; ctx.fillStyle = 'rgba(176,163,153,' + (0.7 * (1 - k)) + ')'; ctx.fillRect(-6 + i * 6, -8 + k * 40, 3, 3); }
        ctx.restore();
      }
    }
  }
  function veBiaChiDuong(){
    const p = G.phong;
    const b = p.bang_chi_duong;
    if (b){
      const x = b.cot * T + T / 2, y = V1.chanO(b.cot, b.hang), co = Math.min(3, G.luu.kho.chuong_vo || 0), thieu = 3 - co;
      const IB = V1.IMG.dd_bia, IC = V1.IMG.dd_chuong_nho;
      if (IB && IC){
        const k = 2.3, dir0 = b.huong === 'trai' ? -1 : 1, lat = dir0 > 0, w = IB.width * k, h = IB.height * k, x0 = x - w / 2, y0 = y + 4 - h;
        veAnhDay(IB, x, y + 4, k, lat);
        const HOC = [[17.8, 23.7], [32.5, 23.7], [46.6, 23.7]];   // tâm 3 ổ chuông trong ảnh bia (điểm ảnh gốc)
        for (let i = 0; i < 3; i++){ if (i >= co) continue; const [hx, hy] = HOC[lat ? 2 - i : i]; const cx = lat ? x0 + w - hx * k : x0 + hx * k;
          veAnhDay(IC, cx, y0 + hy * k + IC.height * k * 0.5, k * 0.95, false); }
        const d2 = thieu ? thieu + ' missing' + (dir0 < 0 ? ' · ← ' : ' · → ') + (b.ten || '') : (dir0 < 0 ? '← ' : '→ ') + 'All 3 · Mute Bell Choir gate';
        if (V1.IMG.khung_bang){ ctx.font = '700 14px ' + PHONG; const hK = Math.round(17 * 1.3) + Math.round(14 * 1.3) + (KB.dinh + KB.day) * 0.4 + 6;
          chuKhung([{s:'Broken Bells ' + co + '/3', co:17, mau:'#ffe08a'}, {s:d2, co:14, mau:thieu ? '#F3E6C8' : '#ffd98a'}], x + 10, y0 - hK + 4, 0.4, 400); }
        else { chu('Broken Bells ' + co + '/3', x + 10, y0 - 26, 17, '#ffe08a'); chu(d2, x + 10, y0 - 6, 14, thieu ? '#F3E6C8' : '#ffd98a'); }
        return;
      }
      const bia = (dx, top, w, mau) => { ctx.fillStyle = mau; ctx.beginPath(); ctx.moveTo(x - w, y - 6); ctx.lineTo(x - w, y - top + w * 0.55); ctx.quadraticCurveTo(x - w, y - top, x, y - top); ctx.quadraticCurveTo(x + w, y - top, x + w, y - top + w * 0.55); ctx.lineTo(x + w, y - 6); ctx.closePath(); ctx.fill(); };
      bia(0, 100, 35, '#0d0809'); bia(0, 97, 32, '#3d2c2a');
      ctx.fillStyle = '#54403a'; ctx.fillRect(x - 30, y - 82, 3, 72); ctx.fillStyle = '#2a1e1c'; ctx.fillRect(x + 26, y - 82, 3, 72);
      ctx.fillStyle = '#0d0809'; ctx.fillRect(x - 40, y - 8, 80, 8); ctx.fillStyle = '#2e2220'; ctx.fillRect(x - 37, y - 7, 74, 4);
      for (let i = 0; i < 3; i++){   // 3 ổ chuông
        const cx = x - 20 + i * 20, cy = y - 66, sang = i < co;
        ctx.fillStyle = '#120a09'; ctx.fillRect(cx - 8, cy - 10, 16, 22);
        ctx.fillStyle = sang ? '#e1b85a' : '#2a2020'; ctx.beginPath(); ctx.moveTo(cx - 6, cy + 9); ctx.quadraticCurveTo(cx - 6, cy - 7, cx, cy - 7); ctx.quadraticCurveTo(cx + 6, cy - 7, cx + 6, cy + 9); ctx.closePath(); ctx.fill();
        if (sang){ ctx.fillStyle = '#fff0b0'; ctx.fillRect(cx - 3, cy - 4, 2, 8); }
      }
      const dir = b.huong === 'trai' ? -1 : 1, ax = x + dir * 2, ay = y - 30;   // mũi tên khắc
      ctx.fillStyle = thieu ? '#c9b48a' : '#ffd98a'; ctx.fillRect(ax - 16, ay - 3, 32, 6);
      ctx.beginPath(); ctx.moveTo(ax + dir * 26, ay); ctx.lineTo(ax + dir * 12, ay - 11); ctx.lineTo(ax + dir * 12, ay + 11); ctx.closePath(); ctx.fill();
      chu('Broken Bells ' + co + '/3', x + 10, y - 128, 17, '#ffe08a');
      chu(thieu ? thieu + ' missing' + (dir < 0 ? ' · ← ' : ' · → ') + (b.ten || '') : (dir < 0 ? '← ' : '→ ') + 'All 3 · Mute Bell Choir gate', x + 10, y - 108, 14, thieu ? '#F3E6C8' : '#ffd98a');
    }
  }
  // Cỡ hình đạo cụ (px logic). Chỉnh ở đây nếu cần to/nhỏ hơn.
  const CHUONG = {cao:112, lun:6};            // Chuông Lưu: cao ~2.9 ô, lún 4 px vào mép sàn (mặt đá méo) để không lơ lửng
  const CUA = {cao:174, lun:3};               // cửa khoá: cao ~3.6 ô
  // Cửa khoá 3 Chuông Vỡ: hình đóng (song rễ, ổ chuông tối) / mở (3 ổ chuông sáng). Chân trên sàn ngay dưới lỗ cửa,
  // cửa sát mép phòng thì đẩy vào trong để cả khung cửa nằm trong phòng.
  // CỔNG RỄ (ChatGPT vẽ, 6 khung): rễ rủ từ nóc xuống chắn lối, giữa có hốc ngọc. 0 = hốc trống; khi đủ điều kiện và tới gần:
  // 1 lõi gắn vào sáng lên → 2 rễ rung, gân đỏ lan → 3–4 rễ co lên → 5 mở hẳn (còn tua rễ + lõi treo trên nóc).
  const CONG = {cao:214, lun:4};
  function khungCong(c){
    if ((G.luu.congMo || []).includes(c.id)) return 5;
    const m = G.moCong; if (!m || m.id !== c.id) return 0;
    const t = m.t, M = V1.MO_CONG_T || 160;
    return t < M * 0.22 ? 1 : t < M * 0.42 ? 2 : t < M * 0.62 ? 3 : t < M * 0.82 ? 4 : 5;
  }
  function veCuaKhoa(){
    const p = G.phong; if (!coHinhCua()) return;
    const c = p.cua.find(x => x.id === p.khoa.cua); if (!c) return;
    const im = V1.IMG.cong_re, n = c.cao || 3, RW = E.BD.COT * T, cw = im.width / 6;
    const h = CONG.cao, w = Math.round(h * cw / im.height);
    let x, y;
    if (c.huong === 'trai' || c.huong === 'phai'){ x = (c.cot + 0.5) * T + (c.huong === 'phai' ? -T * 0.6 : T * 0.6); y = (c.hang + n) * T; }
    else { x = (c.cot + n / 2) * T; y = c.huong === 'duoi' ? c.hang * T : (c.hang + 1) * T + h; }
    x = clampN(x, w / 2, RW - w / 2);
    const k = khungCong(c), m = G.moCong, rung = m && m.id === c.id && k >= 1 && k <= 3 ? Math.round(Math.sin(E.S.frame * 1.7) * (k === 2 ? 3 : 1.5)) : 0;
    ctx.save(); ctx.imageSmoothingEnabled = false;
    ctx.drawImage(im, k * cw, 0, cw, im.height, Math.round(x - w / 2 + rung), Math.round(y + CONG.lun - h), w, h);
    if (k >= 1){   // lõi rực: ánh đỏ cam toả quanh hốc ngọc
      const X = x, Y = y - h * (k >= 4 ? 0.86 : 0.62), r = 40 + Math.sin(E.S.frame / 9) * 4 + (k === 2 ? 14 : 0);
      ctx.globalCompositeOperation = 'lighter';
      const gr = ctx.createRadialGradient(X, Y, 0, X, Y, r); gr.addColorStop(0, 'rgba(255,120,50,0.32)'); gr.addColorStop(1, 'rgba(255,120,50,0)');
      ctx.fillStyle = gr; ctx.fillRect(X - r, Y - r, r * 2, r * 2);
    }
    ctx.restore();
  }
  /* (luồng G) RỄ MÓC MỘ – vẽ SAU lớp bóng tối (luôn đọc được). Màu: đen + đỏ gạch (KHÔNG cyan).
     Báo trước: vết nứt đỏ toác dần trên mặt sàn + sỏi bật + cột đỏ mờ cao đúng bằng rễ (biết phải nhảy qua). Rễ: khối điểm ảnh 6 px,
     thân cong nhẹ, móc quặp ở đỉnh, gân đỏ gạch. */
  const RE_NUT = [[-2, 0, -10, -3], [-10, -3, -18, -1], [-18, -1, -24, -4], [2, 0, 9, -2], [9, -2, 16, 1], [16, 1, 23, -3], [-6, -2, -9, -7], [12, -1, 14, -6]];
  function veRe(){
    const f = E.S.frame, R = V1.RE; if (!R) return;
    for (const n of G.nguy){
      if (n.loai !== 're') continue;
      const x = Math.round(n.x), y = n.y;
      if (V1.IMG.fx_re_troi && VCQ.veDai){   // rễ trồi (ChatGPT vẽ): báo trước = khung 0 nhỏ nhấp nháy; trồi = khung 1→3 theo chiều cao
        const s = R.RE_CAO / 80 * 1.15;
        if (n.bao > 0){ const k = 1 - n.bao / n.baoTong, nhap = (f >> 2) % 2 ? 1 : 0.6; VCQ.veDai('re_troi', 0, x, y + 4, n.x % 2 === 0, s * (0.6 + 0.4 * k), (0.45 + 0.55 * k) * nhap); continue; }
        if (n.h <= 0) continue;
        const kk = 1 + Math.min(2, Math.floor(n.h / R.RE_CAO * 3)); VCQ.veDai('re_troi', kk, x, y + 4, n.x % 2 === 0, s, 1); continue;
      }
      if (n.bao > 0){
        const k = 1 - n.bao / n.baoTong, nhap = (f >> 2) % 2 ? 1 : 0.65;
        ctx.fillStyle = 'rgba(176,40,24,' + (0.10 + 0.16 * k) + ')'; ctx.fillRect(x - R.RE_RONG / 2, y - R.RE_CAO, R.RE_RONG, R.RE_CAO);   // cột nguy hiểm mờ = chiều cao rễ
        ctx.save(); ctx.translate(x, y - 2); const L = 0.45 + 0.55 * k; ctx.scale(L * 1.4, 1.4); ctx.lineCap = 'round';
        for (const [x0, y0, x1, y1] of RE_NUT){
          ctx.strokeStyle = 'rgba(8,3,3,0.95)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
          ctx.strokeStyle = 'rgba(230,70,40,' + (0.6 + 0.4 * k) * nhap + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
        }
        ctx.restore();
        if (n.bao % 7 === 0 || n.bao % 7 === 3){ for (let i = 0; i < 3; i++){ const px = x - 14 + i * 12 + ((n.bao * 5 + i * 7) % 9), py = y - 4 - ((n.bao * 3 + i * 5) % 12);
          ctx.fillStyle = i % 2 ? '#3a2420' : '#6a3a2c'; ctx.fillRect(px, py, 4, 4); } }
        continue;
      }
      if (n.h <= 0) continue;
      const B = 6, nB = Math.ceil(n.h / B), lech = n.x % 2 ? 1 : -1;
      for (let i = 0; i < nB; i++){
        const yy = y - (i + 1) * B, t = i / Math.max(1, nB - 1), w = Math.round((5 - 2.6 * t)) * B, ox = Math.round(Math.sin(t * 3.2) * 4 * lech / 2) * 2;
        ctx.fillStyle = '#0a0505'; ctx.fillRect(x - w / 2 + ox - 3, yy - 1, w + 6, B + 2);
        ctx.fillStyle = '#1e0f0d'; ctx.fillRect(x - w / 2 + ox, yy, w, B);
        const v = (i + (n.x >> 3)) % 4;   // gân đỏ gạch xoắn quanh thân
        ctx.fillStyle = '#a8442e'; ctx.fillRect(x - w / 2 + ox + (v % 2 ? w - 2 * B : B), yy, B, B);
        if (v === 0){ ctx.fillStyle = '#5e2a20'; ctx.fillRect(x - w / 2 + ox + B * 2, yy, B, B); }
        if (i % 5 === 2 && i < nB - 3){ const sx = (i % 10 === 2 ? -1 : 1);   // gai nhánh ngang
          ctx.fillStyle = '#0a0505'; ctx.fillRect(x + ox + sx * (w / 2) - (sx < 0 ? 2 * B : 0) - 1, yy - 1, 2 * B + 2, B + 2);
          ctx.fillStyle = '#7a3224'; ctx.fillRect(x + ox + sx * (w / 2) - (sx < 0 ? 2 * B : 0), yy, 2 * B, B / 2 + 1); }
      }
      if (n.h > R.RE_CAO * 0.6){   // móc quặp ở đỉnh
        const yt = y - nB * B, ox = Math.round(Math.sin(3.2) * 4 * lech / 2) * 2;
        for (const [dx, dy] of [[0, 0], [0, -B], [lech * B, -2 * B], [lech * 2 * B, -3 * B], [lech * 3 * B, -3 * B], [lech * 4 * B, -2 * B], [lech * 4 * B, -B], [lech * 3 * B, 0]]){
          ctx.fillStyle = '#0a0505'; ctx.fillRect(x + ox + dx - B - 1, yt + dy - 1, 2 * B + 2, B + 2);
          ctx.fillStyle = dx === lech * 3 * B && dy === 0 ? '#c85a3a' : dx >= lech * 3 * B * lech ? '#a8442e' : '#2a1410'; ctx.fillRect(x + ox + dx - B, yt + dy, 2 * B, B);
        }
      }
      if (n.tr < 10){ for (let i = 0; i < 5; i++){ ctx.fillStyle = i % 2 ? '#4a2c24' : '#2a1a16'; ctx.fillRect(x - 20 + i * 10, y - 6 - (n.tr * (i % 3 + 1)), 5, 5); } }   // đất bắn
    }
  }
  function veNguy(){
    for (const n of G.nguy){
      if (n.loai === 'song' && V1.IMG.tr_cot_song){   // cột sóng âm (ChatGPT vẽ)
        const s = (n.h + 24) / 108, w = 137 * s; oKhung(V1.IMG.tr_cot_song, 4, n.t < 4 ? 0 : 1 + ((n.t >> 2) & 1), n.x - w / 2, n.y - 108 * s + 6, w, 108 * s);
      } else if (n.loai === 'song'){
        const x = n.x, y = n.y, h = n.h;
        ctx.fillStyle = 'rgba(207,216,230,0.25)'; ctx.fillRect(x - n.w / 2 - 6, y - h - 6, n.w + 12, h + 6);
        for (let i = 0; i < 5; i++){ const hh = h * (0.4 + 0.6 * Math.abs(Math.sin((n.t + i * 3) / 3))); ctx.fillStyle = i % 2 ? '#cfd8e6' : '#947666'; ctx.fillRect(Math.round(x - n.w / 2 + i * 6), Math.round(y - hh), 5, Math.round(hh)); }
      } else if (n.loai === 'quet' && V1.IMG.tr_vet_quet){   // vệt quét chuông (ChatGPT vẽ)
        const a = n.t <= 12 ? 1 : Math.max(0, 1 - (n.t - 12) / 14), L = n.dai * Math.min(1, n.t / 6), kk = n.t < 4 ? 0 : n.t < 10 ? 1 : n.t < 18 ? 2 : 3;
        oKhung(V1.IMG.tr_vet_quet, 4, kk, n.dir > 0 ? n.x : n.x - n.dai, n.y - n.h - 10, n.dai, n.h + 14, n.dir < 0, a);
      } else if (n.loai === 'quet'){   // vệt quét chuông: dải cung đồng-xám sát sàn, mờ dần
        const k = Math.min(1, n.t / 6), a = n.t <= 12 ? 0.9 : Math.max(0, 0.9 - (n.t - 12) / 14), L = n.dai * k;
        ctx.save(); ctx.translate(n.x, n.y); ctx.scale(n.dir, 1);
        ctx.fillStyle = 'rgba(207,216,230,' + a * 0.25 + ')'; ctx.fillRect(0, -n.h, L, n.h);
        ctx.strokeStyle = 'rgba(225,184,90,' + a + ')'; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(0, -8, L, n.h - 10, 0, -Math.PI / 2, 0); ctx.stroke();
        ctx.strokeStyle = 'rgba(207,216,230,' + a * 0.8 + ')'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, -8, L * 0.8, n.h - 26, 0, -Math.PI / 2, 0); ctx.stroke();
        for (let i = 0; i < 4; i++){ ctx.fillStyle = 'rgba(148,118,102,' + a + ')'; ctx.fillRect(Math.round(L * (0.3 + i * 0.18)), -6 - ((n.t + i * 5) % 8), 4, 4); }
        ctx.restore();
      } else if (n.loai === 'vong' && V1.IMG.tr_dich_mat_na){   // vòng âm lan trên sàn (ChatGPT vẽ); vòng giả mờ hơn
        const w = n.r * 2 * 1.35; oKhung(V1.IMG.tr_dich_mat_na, 3, 0, n.x - w / 2, n.y - w * 0.3 + n.r * 0.2, w, w * 0.4, false, (1 - n.t / 40) * (n.gia ? 0.45 : 0.9));
      } else if (n.loai === 'vong'){
        ctx.strokeStyle = n.gia ? 'rgba(154,163,173,' + (1 - n.t / 40) + ')' : 'rgba(207,216,230,' + (1 - n.t / 40) * 0.8 + ')';
        ctx.lineWidth = n.gia ? 2 : 4; ctx.setLineDash(n.gia ? [6, 6] : []); ctx.beginPath(); ctx.ellipse(n.x, n.y, n.r, n.r * 0.45, 0, 0, 6.283); ctx.stroke(); ctx.setLineDash([]);
      } else if (n.loai === 'mat_na'){
        if (n.bao > 0){   // dấu báo trên sàn + bóng đổ lớn dần
          const k = 1 - n.bao / 30, a = (E.S.frame >> 2) % 2 ? 0.9 : 0.5;
          if (!V1.IMG.tr_dich_mat_na){ ctx.fillStyle = 'rgba(255,190,80,' + a + ')'; ctx.fillRect(Math.round(n.xDich - 20), Math.round(n.yDat - 4), 40, 4); }
          ctx.fillStyle = 'rgba(0,0,0,' + (0.25 + 0.4 * clampN(k, 0, 1)) + ')'; ctx.beginPath(); ctx.ellipse(n.xDich, n.yDat - 2, 8 + 12 * clampN(k, 0, 1), 4, 0, 0, 6.283); ctx.fill();
          continue;
        }
        const MR = V1.IMG.tr_mat_na_roi;
        if (MR){ const w = 44, h = MR.height * w / MR.width; ctx.save(); ctx.imageSmoothingEnabled = false;   // mặt nạ rơi + vệt sáng (ChatGPT vẽ)
          ctx.drawImage(MR, Math.round(n.x + n.w / 2 - w / 2), Math.round(n.y + n.h / 2 - h * 0.78), Math.round(w), Math.round(h)); ctx.restore(); continue; }
        ctx.save(); ctx.translate(n.x + n.w / 2, n.y + n.h / 2); ctx.rotate(n.xoay);
        ctx.fillStyle = '#0d0f1c'; ctx.beginPath(); ctx.ellipse(0, 0, 15, 18, 0, 0, 6.283); ctx.fill();
        ctx.fillStyle = '#e9e2d0'; ctx.beginPath(); ctx.ellipse(0, 0, 12, 15, 0, 0, 6.283); ctx.fill();
        ctx.fillStyle = '#b9b09c'; ctx.fillRect(-6, 6, 12, 2);
        ctx.restore();
      }
    }
  }
  // Phông chữ (ChatGPT chọn 02/11): Alegreya Sans cho mọi chữ, Cormorant Garamond cho tiêu đề lớn (tên phòng, tên trùm)
  const PHONG = '"Alegreya Sans",system-ui,-apple-system,sans-serif', PHONG_TD = '"Cormorant Garamond","Alegreya Sans",serif';
  function chu(s, x, y, co, mau, canh, td){
    ctx.font = (td ? '700 ' + Math.round(co * 1.15) + 'px ' + PHONG_TD : '700 ' + co + 'px ' + PHONG); ctx.textAlign = canh || 'center';
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(8,6,10,0.85)'; ctx.strokeText(s, x, y); ctx.fillStyle = mau || '#F3E6C8'; ctx.fillText(s, x, y); ctx.textAlign = 'left';
  }
  V1.chu = chu;
  // Khung bảng (ChatGPT vẽ): 9 mảnh co giãn + mặt nạ nứt giữa cạnh trên. Số đo theo điểm ảnh của khung_bang.png
  const KB = {L:123, R:118, T:96, B:88, dinh:76, day:28, ben:62};
  function veKhung(x, y, w, h, k){
    const P = V1.IMG.khung_bang, M = V1.IMG.khung_mat; if (!P) return false;
    const sx = [0, KB.L, P.width - KB.R, P.width], sy = [0, KB.T, P.height - KB.B, P.height];
    const dx = [x, x + KB.L * k, x + w - KB.R * k, x + w], dy = [y, y + KB.T * k, y + h - KB.B * k, y + h];
    ctx.save(); ctx.imageSmoothingEnabled = true;
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++){ const ww = dx[i + 1] - dx[i], hh = dy[j + 1] - dy[j]; if (ww <= 0 || hh <= 0) continue;
      ctx.drawImage(P, sx[i], sy[j], sx[i + 1] - sx[i], sy[j + 1] - sy[j], Math.round(dx[i]), Math.round(dy[j]), Math.ceil(ww), Math.ceil(hh)); }
    if (M) ctx.drawImage(M, Math.round(x + w / 2 - M.width * k / 2), Math.round(y), Math.round(M.width * k), Math.round(M.height * k));
    ctx.restore(); return true;
  }
  // 9 mảnh co giãn tổng quát cho ảnh ChatGPT vẽ (L/R/T/B = lề theo điểm ảnh gốc, k = tỉ lệ vẽ lề)
  function ve9(P, L, R, T, B, x, y, w, h, k, mo){
    if (!P) return false;
    const sx = [0, L, P.width - R, P.width], sy = [0, T, P.height - B, P.height];
    const dx = [x, x + L * k, x + w - R * k, x + w], dy = [y, y + T * k, y + h - B * k, y + h];
    ctx.save(); ctx.imageSmoothingEnabled = true; if (mo != null) ctx.globalAlpha *= mo;
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++){ const ww = dx[i + 1] - dx[i], hh = dy[j + 1] - dy[j]; if (ww <= 0 || hh <= 0) continue;
      ctx.drawImage(P, sx[i], sy[j], sx[i + 1] - sx[i], sy[j + 1] - sy[j], Math.round(dx[i]), Math.round(dy[j]), Math.ceil(ww), Math.ceil(hh)); }
    ctx.restore(); return true;
  }
  // Khung HUD (ChatGPT vẽ): (x, y, w, h) = mặt gỗ; rễ + chuông nhỏ thò ra ngoài ở góc trên-trái và dưới-phải
  function veKhungHUD(x, y, w, h, k){ const P = V1.IMG.hud_khung_hud; if (!P) return false; k = k || 1;
    return ve9(P, 82, 60, 56, 52, x - 9 * k, y - 19 * k, w + 18 * k, h + 42 * k, k); }
  // Vạch ngăn (ChatGPT vẽ): đầu trái · dây · chuông giữa · dây · đầu phải
  function veVach(x, y, w, k){
    const P = V1.IMG.hud_vach; if (!P) return false;
    const h = P.height * k, c0 = 296, c1 = 586, cw = (c1 - c0) * k, a = 80 * k, b = (P.width - 782) * k, m = Math.max(0, (w - a - b - cw) / 2);
    ctx.save(); ctx.imageSmoothingEnabled = true;
    const d = (sx, sw, dx, dw) => { if (dw > 0) ctx.drawImage(P, sx, 0, sw, P.height, Math.round(dx), Math.round(y - h / 2), Math.ceil(dw), Math.round(h)); };
    d(0, 80, x, a); d(80, 216, x + a, m); d(c0, c1 - c0, x + a + m, cw); d(c1, 196, x + a + m + cw, m); d(782, P.width - 782, x + w - b, b);
    ctx.restore(); return true;
  }
  // Chữ dài trong khung: tự xuống dòng. dong = [{s, co, mau}], cx = tâm ngang, y = mép trên khung
  function chuKhung(dong, cx, y, k, rongMax){
    k = k || 0.5; rongMax = rongMax || 620;
    const ra = [];
    for (const d of dong){ ctx.font = '700 ' + d.co + 'px ' + PHONG; let hang = '';
      for (const t of String(d.s).split(' ')){ const thu = hang ? hang + ' ' + t : t; if (hang && ctx.measureText(thu).width > rongMax){ ra.push({s:hang, co:d.co, mau:d.mau}); hang = t; } else hang = thu; }
      if (hang) ra.push({s:hang, co:d.co, mau:d.mau}); }
    let rong = 0; for (const d of ra){ ctx.font = '700 ' + d.co + 'px ' + PHONG; rong = Math.max(rong, ctx.measureText(d.s).width); }
    const cao = ra.reduce((a, d) => a + Math.round(d.co * 1.3), 0);
    const w = Math.max((KB.L + KB.R + 60) * k, rong + 2 * KB.ben * k + 16), h = cao + (KB.dinh + KB.day) * k + 6;
    if (!veKhung(cx - w / 2, y, w, h, k)){ ctx.fillStyle = 'rgba(12,8,16,0.86)'; rr(cx - w / 2, y, w, h, 10); ctx.fill(); }
    let yy = y + KB.dinh * k + 3; for (const d of ra){ yy += Math.round(d.co * 1.3); chu(d.s, cx, yy - Math.round(d.co * 0.3), d.co, d.mau); }
    return h;
  }
  V1.chuKhung = chuKhung; V1.veKhung = veKhung;

  /* ---------------- BÓNG TỐI + ĐÈN ---------------- */
  const BUI = Array.from({length:18}, () => ({x:Math.random() * 640, y:20 + Math.random() * 150, vx:(Math.random() - .5) * .06, vy:.02 + Math.random() * .05, ph:Math.random() * 6.28}));
  const nhapNhay = (t, i) => 1 + 0.04 * Math.sin(t * 2.7 + i * 1.7) + 0.02 * Math.sin(t * 7.3 + i);
  function veAnhSang(cam, camY){
    const t = E.S.frame / 60, p = G.phong;
    lg.globalCompositeOperation = 'source-over'; lg.clearRect(0, 0, VW, VH);
    lg.fillStyle = 'rgba(6,5,10,0.66)'; lg.fillRect(0, 0, VW, VH);
    lg.globalCompositeOperation = 'destination-out';
    const lo = (x, y, r, k) => { x = (x - cam) / PX; y = (y - camY) / PX; const gr = lg.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(0,0,0,' + k + ')'); gr.addColorStop(1, 'rgba(0,0,0,0)'); lg.fillStyle = gr; lg.fillRect(x - r, y - r, r * 2, r * 2); };
    const A = ANH(), den = A && A.meta.den ? A.meta.den.map(([x, y]) => [x * PX, y * PX]) : p.den.map(d => [d.cot * T + T / 2, d.hang * T + T / 2]);
    den.forEach(([x, y], i) => lo(x, y, 58 * nhapNhay(t, i), 0.9));
    if (p.chuong_luu) lo(p.chuong_luu.cot * T + T / 2, V1.chanO(p.chuong_luu.cot, p.chuong_luu.hang) - 70, 50, 0.8);
    if (coHinhCua()){ const c = p.cua.find(x => x.id === p.khoa.cua); if (c){ const RW = E.BD.COT * T, w = CUA.cao * 0.88;   // cửa khoá: đủ sáng để nhìn rõ hình
      lo(clampN((c.cot + 0.5) * T, w / 2, RW - w / 2), (c.hang + (c.cao || 3)) * T - CUA.cao * 0.55, 44, G.cuaKhoa.includes(c) ? 0.55 : 0.75); } }
    if (p.bang_chi_duong){ const bb = p.bang_chi_duong; lo(bb.cot * T + T / 2 + 10, V1.chanO(bb.cot, bb.hang) - 170, 95, 0.85); }   // khung chữ trên bia luôn đọc rõ
    lo(pl.x + pl.w / 2, pl.y + pl.h * 0.45, 46, 0.62);
    for (const q of E.QUAI) if (!q.dead) lo(q.x + q.w / 2, q.y + q.h / 2, q.laTrum ? 70 : 22, q.laTrum ? 0.62 : 0.38);
    for (const v of p.vat_pham) if (!G.luu.daNhat.includes(v.id)){ const o = V1.viTriVP(v); lo(o.x, o.y - 22, 30, 0.7); }   // (luồng G) vật tương tác sáng cục bộ rõ hơn
    for (const d of p.dau_hieu || []){   // (luồng G) dấu dẫn hướng luôn đọc được trong bóng tối
      if (d.loai === 'loi_chinh') lo(d.cot * T + T / 2 + 16, V1.chanO(d.cot, d.hang) - 44, 40 + 4 * Math.sin(t * 2), 0.75);
      else lo(d.cot * T + T / 2, d.hang * T + T / 2, 30, 0.5);
    }
    if (p.bang_chi_duong){ const b = p.bang_chi_duong; lo(b.cot * T + T / 2, V1.chanO(b.cot, b.hang) - 70, 62, 0.8); }
    for (const n of G.nguy) if (n.loai === 'song') lo(n.x, n.y - 20, 18, 0.5); else if (n.loai === 'quet') lo(n.x + n.dir * n.dai / 2, n.y - 30, 40, 0.5);
      else if (n.loai === 're') lo(n.x, n.y - (n.bao > 0 ? 10 : 40), n.bao > 0 ? 34 : 46, 0.6);
      else if (n.loai === 'mat_na') lo(n.bao > 0 ? n.xDich : n.x + n.w / 2, n.bao > 0 ? n.yDat - 12 : n.y + n.h / 2, 26, 0.6);   // mặt nạ + dấu báo luôn thấy
    if (G.luu.tui && G.luu.tui.phong === G.id) lo(G.luu.tui.x, G.luu.tui.y - 14, 26, 0.6);
    ctx.drawImage(LC, 0, 0, VW, VH, 0, 0, W, H);
    // ánh hổ phách quanh đèn
    ctx.globalCompositeOperation = 'lighter';
    den.forEach(([x, y], i) => { const X = x - cam, Y = y - camY, r = 130 * nhapNhay(t, i);
      const gr = ctx.createRadialGradient(X, Y, 0, X, Y, r); gr.addColorStop(0, 'rgba(194,138,69,0.16)'); gr.addColorStop(1, 'rgba(194,138,69,0)'); ctx.fillStyle = gr; ctx.fillRect(X - r, Y - r, r * 2, r * 2);
      if (!A){ ctx.fillStyle = 'rgba(255,190,80,0.9)'; ctx.fillRect(Math.round(X) - 3, Math.round(Y) - 4, 6, 8); } });
    for (const d of p.dau_hieu || []) if (d.loai === 'loi_chinh'){   // chuông dẫn lối: ánh hổ phách nhịp chậm (cùng màu đèn)
      const X = d.cot * T + T / 2 + 16 - cam, Y = V1.chanO(d.cot, d.hang) - 44 - camY, r = 70 + 10 * Math.sin(t * 2 + d.cot);
      const gr = ctx.createRadialGradient(X, Y, 0, X, Y, r); gr.addColorStop(0, 'rgba(225,160,70,0.26)'); gr.addColorStop(1, 'rgba(225,160,70,0)'); ctx.fillStyle = gr; ctx.fillRect(X - r, Y - r, r * 2, r * 2); }
    if (p.chuong_luu && A){   // Chuông Lưu: ánh đồng ấm (sáng hơn khi đã nghỉ ở đây)
      const sang = G.luu.chuong && G.luu.chuong.phong === G.id, X = p.chuong_luu.cot * T + T / 2 - cam, Y = V1.chanO(p.chuong_luu.cot, p.chuong_luu.hang) - 70 - camY, r = sang ? 150 : 100;
      const gr = ctx.createRadialGradient(X, Y, 0, X, Y, r); gr.addColorStop(0, 'rgba(225,184,90,' + (sang ? 0.22 : 0.1) + ')'); gr.addColorStop(1, 'rgba(225,184,90,0)'); ctx.fillStyle = gr; ctx.fillRect(X - r, Y - r, r * 2, r * 2); }
    ctx.globalCompositeOperation = 'source-over';
    // tiền cảnh rễ treo (đã tối sẵn)
    if (A && A.truoc){ ctx.imageSmoothingEnabled = false; ctx.drawImage(A.truoc, -cam, -camY, A.truoc.width * PX, A.truoc.height * PX); }
    ctx.globalCompositeOperation = 'source-over';
    // bụi tro
    for (const b of BUI){ b.x += b.vx + Math.sin(E.S.frame / 90 + b.ph) * .03; b.y += b.vy; if (b.y > 170){ b.y = 18; b.x = Math.random() * 640; }
      const X = Math.round(((b.x - cam / PX * 1.05) % VW + VW) % VW), Y = Math.round(b.y);
      ctx.fillStyle = 'rgba(176,163,153,' + (0.25 + 0.2 * Math.sin(t * 1.3 + b.ph)) + ')'; ctx.fillRect(X * PX, Y * PX, PX, PX); }
    const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.62); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  }

  /* ---------------- HUD ---------------- */
  /* (luồng F) HUD to, tách 4 nhóm rõ ràng trên nền tối – đọc được ở iPhone ngang (canvas thu còn ~0,72–0,8 lần):
     hàng 1 MÁU (mặt nạ trắng) · hàng 2 LƯỢT HỒI (bình xanh) + số · hàng 3 MẢNH ÂM + số · hàng 4 3 CHUÔNG VỠ + "n/3".
     Thanh máu trùm/tinh anh: GIỮA, TRÊN CÙNG (xa vùng nút cảm ứng ở 2 góc dưới), có tên + vạch 50%. V1.HUD_KHUNG = các ô đã vẽ (để kiểm thử). */
  const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };
  function oMau(x, y, day, sang){   // 1 ô máu = mặt nạ trắng 24×28
    const IM = V1.IMG[day ? 'hud_mau_day' : 'hud_mau_rong'];
    if (IM){ const h = 30, w = Math.round(IM.width * h / IM.height); ctx.save(); ctx.imageSmoothingEnabled = false; if (sang) ctx.globalAlpha = 0.55;
      ctx.drawImage(IM, Math.round(x + 12 - w / 2), y - 1, w, h); ctx.restore(); return; }
    ctx.fillStyle = '#05060a'; rr(x - 3, y - 3, 30, 34, 9); ctx.fill();
    ctx.fillStyle = day ? (sang ? '#ffffff' : '#eef1f0') : '#1c2a40'; rr(x, y, 24, 28, 7); ctx.fill();
    if (day){ ctx.fillStyle = '#0d0f1c'; ctx.fillRect(x + 5, y + 10, 5, 4); ctx.fillRect(x + 14, y + 10, 5, 4); ctx.fillStyle = '#c9d0d8'; ctx.fillRect(x + 3, y + 22, 18, 3); }
    else { ctx.strokeStyle = '#4a5a6e'; ctx.lineWidth = 2; rr(x + 1, y + 1, 22, 26, 6); ctx.stroke(); }
  }
  function veHUD(){
    const L = G.luu; if (!L) return;
    const K = V1.HUD_KHUNG = {};
    const nMau = E.P.maxHp, X0 = 18, wMau = nMau * 32 + 6;
    const wPanel = Math.max(wMau, 200) + 16;
    if (!veKhungHUD(8, 8, wPanel, 142)){ ctx.fillStyle = 'rgba(5,6,10,0.62)'; rr(8, 8, wPanel, 142, 12); ctx.fill(); }   // khung HUD (ChatGPT vẽ)
    // 1) máu
    const nhay = pl.nhay > 0 && (E.S.frame >> 2) % 2;   // chỉ nhấp nháy khi vừa trúng đòn (pl.nhay), không nháy lúc lướt (lướt cũng có khung bất tử)
    for (let i = 0; i < nMau; i++) oMau(X0 + i * 32, 16, i < pl.hp, nhay);
    K.mau = {x:X0 - 3, y:13, w:nMau * 32, h:34};
    // vạch ngăn
    if (!veVach(16, 55, wPanel - 8, 0.32)){ ctx.fillStyle = 'rgba(74,90,110,0.5)'; ctx.fillRect(16, 54, wPanel - 16, 2); }   // vạch ngăn (ChatGPT vẽ)
    // 2) lượt hồi: bình xanh + số
    const nHoi = L.hoiMax, con = pl.luotHoi || 0;
    for (let i = 0; i < nHoi; i++){ const x = X0 + 11 + i * 28, y = 74, BI = V1.IMG[i < con ? 'hud_binh_day' : 'hud_binh_rong'];
      if (BI){ const h = 28, w = Math.round(BI.width * h / BI.height); ctx.save(); ctx.imageSmoothingEnabled = false; ctx.drawImage(BI, Math.round(x - w / 2), y - 16, w, h); ctx.restore(); continue; }   // bình hồi (ChatGPT vẽ)
      ctx.fillStyle = '#05060a'; ctx.beginPath(); ctx.arc(x, y, 12, 0, 6.283); ctx.fill(); ctx.fillRect(x - 4, y - 17, 8, 7);
      ctx.fillStyle = i < con ? '#78e6e6' : '#1a2b3d'; ctx.beginPath(); ctx.arc(x, y, 9, 0, 6.283); ctx.fill();
      if (i < con){ ctx.fillStyle = '#e8ffff'; ctx.fillRect(x - 4, y - 5, 3, 4); } }
    chu(con + '/' + nHoi, X0 + nHoi * 28 + 6, 81, 18, '#a8f0f0', 'left');
    K.hoi = {x:X0 - 2, y:58, w:nHoi * 28 + 50, h:30};
    // 3) Mảnh Âm
    veIcon('manh_am', X0 + 11, 106, 1.05);
    chu(String(V1.tongManh()), X0 + 28, 114, 22, '#78e6e6', 'left');
    const wSo = ctx.measureText(String(V1.tongManh())).width;
    if (L.manh > 0 && L.manhGui > 0) chu('(' + L.manh + ' unstored)', X0 + 34 + wSo, 113, 13, '#9fb6c2', 'left');
    K.manh = {x:X0 - 2, y:92, w:wSo + 40, h:28};
    // 4) 3 Chuông Vỡ + số
    const cv3 = L.kho.chuong_vo || 0;
    for (let i = 0; i < 3; i++){ ctx.globalAlpha = i < cv3 ? 1 : 0.28; veIcon('chuong_vo', X0 + 12 + i * 28, 136, 0.95); }
    ctx.globalAlpha = 1;
    chu(Math.min(3, cv3) + '/3', X0 + 12 + 3 * 28 - 2, 143, 18, cv3 >= 3 ? '#ffe08a' : '#e1b85a', 'left');
    if (L.kho.loi_vong_tan) veIcon('loi_vong_tan', X0 + 12 + 3 * 28 + 52, 136, 0.85);
    K.chuong = {x:X0 - 2, y:123, w:3 * 28 + 44, h:26};
    K.panel = {x:8, y:8, w:wPanel, h:142};
    // máu trùm / tinh anh – giữa, trên cùng
    const b = (G.trum && G.trum.st !== 'cho' && !G.trum.dead) ? G.trum : (G.tinhAnh && G.dongCua && !G.tinhAnh.dead ? G.tinhAnh : null);
    let yTB = 96, yBN = 58;
    if (b){
      const w = 420, x = (W - w) / 2, y = 40, m = b.def.mau || 100, hp = Math.max(0, b.hp);
      if (!veKhungHUD(x - 14, 8, w + 28, 54, 0.8)){ ctx.fillStyle = 'rgba(5,6,10,0.62)'; rr(x - 14, 8, w + 28, 54, 10); ctx.fill(); }
      chu(b.def.ten || '', W / 2, 31, 19, '#F3E6C8', null, true);
      if (!veThanhMau(W / 2, y - 2, hp / m, 3.5)){
        ctx.fillStyle = '#05060a'; ctx.fillRect(x - 3, y - 3, w + 6, 18); ctx.fillStyle = '#3a1418'; ctx.fillRect(x, y, w, 12);
        ctx.fillStyle = b.batTu ? '#9aa3ad' : '#d0402f'; ctx.fillRect(x, y, Math.round(w * hp / m), 12);
        ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(x, y, Math.round(w * hp / m), 3); }
      if (b.laTrum){   // vạch 50% = chỗ chuyển pha
        ctx.fillStyle = '#05060a'; ctx.fillRect(x + w / 2 - 3, y - 6, 6, 24); ctx.fillStyle = '#ffe08a'; ctx.fillRect(x + w / 2 - 1, y - 5, 2, 22);
        ctx.beginPath(); ctx.moveTo(x + w / 2 - 6, y - 8); ctx.lineTo(x + w / 2 + 6, y - 8); ctx.lineTo(x + w / 2, y - 2); ctx.closePath(); ctx.fill();
      }
      K.trum = {x:x - 14, y:8, w:w + 28, h:54};
      yTB = 92; yBN = 92;
    }
    // tên phòng
    if (G.bannerT > 0){ ctx.globalAlpha = Math.min(1, G.bannerT / 40); chu(G.banner, W / 2, b ? 98 : yBN, 22, '#F3E6C8', null, true); ctx.globalAlpha = 1; }
    // thông báo
    if (G.tbT > 0){ ctx.globalAlpha = Math.min(1, G.tbT / 30); const yT = b && G.bannerT > 0 ? 128 : (b ? 98 : yTB);
      if (String(G.tb).length > 22) chuKhung([{s:G.tb, co:17, mau:'#ffe08a'}], W / 2, yT - 34, 0.5, 600);   // hướng dẫn dài: đặt trong khung
      else chu(G.tb, W / 2, yT, 17, '#ffe08a');
      ctx.globalAlpha = 1; }
  }

  /* ---------------- BẢN ĐỒ NHỎ ---------------- */
  function veBanDo(){
    const I = V1.IMG;   // mọi thứ trên bản đồ là ảnh ChatGPT vẽ (art/giao-dien/ban-do)
    ctx.fillStyle = 'rgba(5,6,10,0.88)'; ctx.fillRect(0, 0, W, H);
    ve9(I.bd_nen, 150, 150, 115, 115, 6, 6, W - 12, H - 12, 0.62);
    chu('Map – Weeping Heartwood', W / 2, 52, 20, '#F3E6C8', null, true);
    const ds = G.bd.phong, cw = 76, chh = 40, gap = 14;
    const xs = ds.map(p => p.x), ys = ds.map(p => p.y);
    const x0 = Math.min(...xs), x1 = Math.max(...ds.map(p => p.x + (p.rong || 1) - 1)), y0 = Math.min(...ys), y1 = Math.max(...ds.map(p => p.y + (p.cao_bd || 1) - 1));
    const tw = (x1 - x0 + 1) * (cw + gap), th = (y1 - y0 + 1) * (chh + gap), k = Math.min(1, (W - 150) / tw, (H - 170) / th);
    const ox = (W - tw * k) / 2, oy = 80 + (H - 170 - th * k) / 2;
    const o = p => ({x:ox + (p.x - x0) * (cw + gap) * k, y:oy + (p.y - y0) * (chh + gap) * k, w:((p.rong || 1) * (cw + gap) - gap) * k, h:((p.cao_bd || 1) * (chh + gap) - gap) * k});
    const vao = G.luu.daVao, byId = {}; ds.forEach(p => byId[p.id] = p);
    // nối cửa
    const anh = (im, cx, cy, h, a) => { if (!im) return; const w = im.width * h / im.height; ctx.save(); ctx.imageSmoothingEnabled = true; if (a != null) ctx.globalAlpha *= a; ctx.drawImage(im, Math.round(cx - w / 2), Math.round(cy - h / 2), Math.round(w), Math.round(h)); ctx.restore(); };
    // nối cửa: dây rễ (ChatGPT vẽ) xoay theo hướng nối
    const NG = I.bd_noi_ngang, daNoi = {};
    for (const p of ds){ if (!vao.includes(p.id)) continue; const P = G.cache[p.id]; if (!P) continue;
      for (const c of P.cua){ const q = byId[c.toi]; if (!q || daNoi[q.id + '|' + p.id]) continue; daNoi[p.id + '|' + q.id] = 1;
        const a = o(p), b = o(q), x1 = a.x + a.w / 2, y1 = a.y + a.h / 2, x2 = b.x + b.w / 2, y2 = b.y + b.h / 2, L = Math.hypot(x2 - x1, y2 - y1);
        if (!NG || L < 1) continue; const hN = Math.max(8, 16 * k);
        ctx.save(); ctx.translate((x1 + x2) / 2, (y1 + y2) / 2); ctx.rotate(Math.atan2(y2 - y1, x2 - x1)); ctx.imageSmoothingEnabled = true;
        ctx.drawImage(NG, -L / 2, -hN / 2, L, hN); ctx.restore(); } }
    const ko = Math.max(0.12, 0.2 * k);   // tỉ lệ lề ô phòng
    for (const p of ds){
      const r = o(p), da = vao.includes(p.id), P = G.cache[p.id], s = Math.min(r.h, 40 * k + 6);
      if (!da){ // phòng kề phòng đã vào: chỉ hiện ô mờ (nét đứt mực – ChatGPT vẽ)
        const ke = vao.some(id => G.cache[id] && G.cache[id].cua.some(c => c.toi === p.id));
        if (!ke) continue;
        ve9(I.bd_o_chua, 30, 30, 30, 30, r.x, r.y, r.w, r.h, ko, 0.8); chu('?', r.x + r.w / 2, r.y + r.h / 2 + 5, 14, '#3a2a1c'); continue;
      }
      ve9(p.id === G.id ? I.bd_o_hien : I.bd_o_da, 34, 34, 34, 34, r.x, r.y, r.w, r.h, ko);
      chu(p.id, r.x + r.w / 2, r.y + 15, 11, p.id === G.id ? '#fff2cf' : '#d9c7a4');
      if (P && P.chuong_luu) anh(I.bd_chuong_luu, r.x + 12, r.y + r.h - 13, s * 0.45);
      if (P && P.khoa && G.luu.kho[P.khoa.can] < P.khoa.so) anh(I.hud_chuong_khoa, r.x + r.w - 12, r.y + r.h - 13, s * 0.42);
      if (P && P.trum && !G.luu.trumHa) anh(I.bd_trum, r.x + r.w - 14, r.y + 14, s * 0.5);
      if (G.luu.tui && G.luu.tui.phong === p.id) anh(I.fx_i_manh_am, r.x + r.w / 2 + 16, r.y + r.h - 11, s * 0.4);
      if (p.id === G.id && (E.S.frame >> 4) % 2 === 0){
        const fx = (pl.x + pl.w / 2) / (E.BD.COT * T), fy = (pl.y + pl.h / 2) / (E.BD.HANG * T);
        anh(I.bd_mat_na, r.x + fx * r.w, r.y + fy * r.h, Math.max(12, s * 0.5));   // vị trí người chơi: mặt nạ (ChatGPT vẽ)
      }
    }
    chu((G.bd.phong.find(p => p.id === G.id) || {}).ten || G.id, W / 2, H - 66, 15, '#E1B85A');
    chu('M / Map button: close', W / 2, H - 46, 12, '#d9c7a4');
  }

  /* ---------------- QUÁI NỔI TRÊN BÓNG TỐI + CHIÊU QUÁI (như phòng demo) ---------------- */
  function clipQuai(q){
    const d = q.def, Cs = d._clip || {}, A = q.anim;
    let C = A.ten === 'danh' && Cs.fx && Cs.fx.ok ? Cs.fx : Cs[A.ten];
    if (!(C && C.ok)) C = Cs.dung;
    return C && C.ok && C.chan ? C : null;
  }
  function veQuaiNoi(q){   // viền sáng theo màu riêng + vẽ lại thân, SAU lớp bóng tối
    if (q.dead || q.laTrum) return;
    const C = clipQuai(q); if (!C) return;
    const k = q.anim.k ?? SpriteMN.khungTheoBuoc(C, q.anim.t), fx = q.x + q.w / 2 + VCQ.rung(q), fy = q.y + q.h;
    const al = q.alpha < 1 ? q.alpha : 1;
    const vd = VCQ.vien(q);   // báo trước đập chuông: viền đỏ gạch đậm dần
    SpriteMN.veVien(ctx, C, k, fx, fy, q.face > 0, E.TL, vd ? vd.mau : q.def.mau_vien || q.def.mau_khoi || '#e5a13b', vd ? E.TL * 1.5 : E.TL, (vd ? vd.a : 0.5) * al);
    SpriteMN.ve(ctx, C, k, fx, fy, q.face > 0, E.TL, al, q.flash > 2);
    const d = q.def;   // thanh máu (ChatGPT vẽ) – vẽ sau lớp bóng tối để luôn đọc được
    if (q.hp < (d.mau || 30) && q.st !== 'chet' && !q.laTinhAnh) veThanhMau(Math.round(fx), Math.round(Math.min(q.y - 26, fy - C.chan[1] * E.TL + 10)), Math.max(0, q.hp) / (d.mau || 30), 1.0);
  }
  function veFx(ten, o, x, y, phai, k, a){   // art/hieu-ung/chieu-quai/<ten>.png – 6 ô 96×96, hướng TRÁI
    const im = V1.IMG['fx_' + ten]; if (!im) return;
    const S = 96, w = S * (k || 1); ctx.save(); ctx.globalAlpha = a ?? 1; ctx.translate(Math.round(x), Math.round(y)); if (phai) ctx.scale(-1, 1);
    ctx.imageSmoothingEnabled = false; ctx.drawImage(im, o * S, 0, S, S, -w / 2, -w / 2, w, w); ctx.restore();
  }
  function veBuiTuong(){   // khói bụi + tia lửa khi trượt bám tường
    const st = E.trangThai().ten;
    if ((st !== 'bamtuong' && st !== 'chemtuong') || !pl.wallDir) return;
    const o = (E.S.frame >> 2) % 6, k = 0.7, w = 96 * k, wd = pl.wallDir;
    const tuongX = wd < 0 ? pl.x : pl.x + pl.w, cx = tuongX - wd * (w / 2 - 14 * k), cy = pl.y + pl.h - w / 2 + 14;
    veFx('bui_tuong', o, cx, cy, wd > 0, k, 0.7);
  }
  function veChieu(){
    const f = E.S.frame;
    for (const q of E.QUAI){   // Màn Tang: 2 vệt vuốt khi vồ
      if (q.dead || q.laTrum || q.def.id !== 'tang' || q.st !== 'danh') continue;
      const k = q.kDanh ?? 0; if (k < 2) continue;
      veFx('tang', Math.min(5, k - 2), q.x + q.w / 2 + q.face * 34, q.y + q.h - 30, q.face > 0, 1.15);
    }
    VCQ.ve(0);   // tụ năng lượng, đạn, sóng âm, báo trước + sóng chấn động (ve-chieu-quai.js, dùng chung với phòng demo)
  }
  // đạn phân biệt từng quái + báo trước đập chuông Vọng Tàn (luồng H)
  const VCQ = VeChieuQuai({ctx:() => ctx, E, anh:n => V1.IMG['fx_' + n] || null, boQua:q => q.laTrum});

  /* ---------------- VẼ MỘT KHUNG ---------------- */
  const ANH = () => V1.CANH && V1.CANH[G.id];
  V1.ve = function(mo){
    const S = E.S;
    // camera mượt: thế giới (nhân vật/quái) theo 1 px logic; nền thấp 320×180 dời phần lẻ (0..2 px) thay vì nhảy bậc 3 px → hết rung giật khi chạy
    const camF = Math.round(CAM.x), camFy = Math.round(CAM.y), camPx = Math.floor(camF / PX), camPy = Math.floor(camFy / PX), cam = camF, camY = camFy, lePx = camF - camPx * PX, lePy = camFy - camPy * PX;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#05080d'; ctx.fillRect(0, 0, cv.width, cv.height);
    if (!G.phong){ return; }
    // 1) cảnh nền thấp 320×180
    g.imageSmoothingEnabled = false; g.fillStyle = '#08090d'; g.fillRect(0, 0, VW + 1, VH + 1);
    const I = V1.IMG;
    // nền xa/giữa: lặp cả NGANG lẫn DỌC (lật gương xen kẽ) để không lộ vạch ngang khi camera đi xuống
    const lapNen = (im, kx, ky, y0) => { const w = im.width, h = im.height;
      let y = y0 - Math.round(camPy * ky); y = ((y % (2 * h)) + 2 * h) % (2 * h) - 2 * h;
      for (let j = 0; y < VH + 1; y += h, j++){ let x = -(((Math.round(camPx * kx)) % w + w) % w);
        for (; x < VW + 1; x += w){ if ((((j % 2) + 2) % 2) === 0) g.drawImage(im, x, y); else { g.save(); g.translate(x, y + h); g.scale(1, -1); g.drawImage(im, 0, 0); g.restore(); } } } };
    if (I.bg) lapNen(I.bg, 0.12, 0.08, 0);
    if (I.mid) lapNen(I.mid, 0.35, 0.16, -4);
    if (!ANH()){ g.fillStyle = 'rgba(8,5,8,0.35)'; g.fillRect(0, 0, VW + 1, VH + 1); }
    g.drawImage(NEN, -camPx, -camPy);
    // ngoài phòng: đen
    g.fillStyle = '#05080d';
    if (camPx < 0) g.fillRect(0, 0, -camPx, VH + 1); const rw = E.BD.COT * OD - camPx; if (rw < VW + 1) g.fillRect(rw, 0, VW + 1 - rw, VH + 1);
    if (camPy < 0) g.fillRect(0, 0, VW + 1, -camPy); const rh = E.BD.HANG * OD - camPy; if (rh < VH + 1) g.fillRect(0, rh, VW + 1, VH + 1 - rh);
    let ox = 0, oy = 0;
    if (S.sht > 0){ const k = S.shm * S.sht / 8; ox = Math.round(S.shx * k * ((S.frame & 1) ? 1 : -1)); oy = Math.round(S.shy * k * ((S.frame & 1) ? -1 : 1)); }
    ctx.setTransform(M, 0, 0, M, ox * M, oy * M); ctx.imageSmoothingEnabled = false;
    ctx.drawImage(pc, 0, 0, VW + 1, VH + 1, -lePx, -lePy, W + PX, H + PX);
    // 2) thế giới
    ctx.save(); ctx.translate(-cam, -camY);
    veTheGioi();
    for (const q of E.QUAI) veQuai(q);
    veNguy();
    veNV(); veBuiTuong();
    for (const p of TIA){ ctx.fillStyle = p.m; ctx.fillRect(Math.round(p.x / 2) * 2, Math.round(p.y / 2) * 2, 4, 4); }
    veChem(); veHoi();
    ctx.restore();
    // 3) tường giả: mờ đi khi nhân vật ở trong / sát
    const cx = Math.floor((pl.x + pl.w / 2) / T), cy = Math.floor((pl.y + pl.h / 2) / T);
    let trong = false; for (let dy = -1; dy <= 1 && !trong; dy++) for (let dx = -1; dx <= 1; dx++) if (E.tile(cx + dx, cy + dy) === 'G'){ trong = true; break; }
    G.giaA = (G.giaA ?? 1) + ((trong ? 0.3 : 1) - (G.giaA ?? 1)) * 0.15;
    ctx.globalAlpha = G.giaA; ctx.drawImage(GIA, -cam, -camY, GIA.width * PX, GIA.height * PX); ctx.globalAlpha = 1;
    ctx.save(); ctx.translate(-cam, -camY); veNutBiMat(); ctx.restore();   // (luồng G) dấu bí mật nằm trên cả tường giả
    // 4) bóng tối + đèn
    veAnhSang(cam, camY);
    ctx.save(); ctx.translate(-cam, -camY); for (const q of E.QUAI) veQuaiNoi(q); veChieu(); if (G.trum && !G.trum.dead) veBaoTrum(G.trum); veRe(); ctx.restore();
    // 5) HUD
    ctx.setTransform(M, 0, 0, M, 0, 0);
    if (S.loe > 0){ ctx.globalAlpha = 0.22 * Math.min(1, S.loe / 4); ctx.fillStyle = S.loeMau; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }   // loé nhát kết
    veHUD();
    if (G.trang === 'ban_do') veBanDo();
    if (mo > 0){ ctx.fillStyle = 'rgba(0,0,0,' + clampN(mo, 0, 1) + ')'; ctx.fillRect(0, 0, W, H); }
    if (V1.OPT && V1.OPT.hb){
      ctx.lineWidth = 2; const r = (o, c) => { ctx.strokeStyle = c; ctx.strokeRect(o.x - cam, o.y - camY, o.w, o.h); };
      r(pl, '#4af'); const hb = E.hopNV(); if (hb) r(hb, '#f33'); for (const q of E.QUAI) if (!q.dead) r(q, '#fc4');
    }
  };
})();
