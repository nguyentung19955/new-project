'use strict';
/* ve.js – Vùng 1: vẽ phòng bằng ô tạm (đá rễ tông tối), cảnh nền phòng demo, quái, trùm (hình tạm), vật phẩm, bóng tối + đèn, HUD, bản đồ nhỏ.
   Logic 960×540 px; cảnh 320×180 điểm (1 điểm = 3 px logic, 1 ô 48 px = 16 điểm). */
(() => {
  const V1 = window.V1, E = DongCoMN, pl = E.pl, G = V1.G, T = 48;
  const W = 960, H = 540, PX = 3, VW = 320, VH = 180, OD = 16;
  const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
  const pc = document.createElement('canvas'); pc.width = VW; pc.height = VH; const g = pc.getContext('2d');
  const NEN = document.createElement('canvas'), GIA = document.createElement('canvas');
  const LC = document.createElement('canvas'); LC.width = VW; LC.height = VH; const lg = LC.getContext('2d');
  let M = 1;
  const clampN = (v, a, b) => v < a ? a : v > b ? b : v;

  function resize(){
    const DPR = Math.min(window.devicePixelRatio || 1, 3);
    const bw = innerWidth * DPR, bh = innerHeight * DPR;
    M = Math.max(1, Math.floor(Math.min(bw / W, bh / H))); cv.width = W * M; cv.height = H * M;
    const nho = bw < W || bh < H, css = nho ? Math.min(innerWidth / W, innerHeight / H) : M / DPR;
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
  const coHinhCua = cua => { const p = G.phong, I = V1.IMG; return !!(p && p.khoa && I.cua_dong && I.cua_mo && (!cua || cua.id === p.khoa.cua)); };

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
    if (k === 'khoa'){   // dấu khoá: quả chuông đồng nhỏ buộc giữa song rễ
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
      if (e.k === 'trung') for (let i = 0; i < 8; i++){ const a = (i / 8) * Math.PI * 2 + 0.3, v = 2 + (i % 2) * 2;
        TIA.push({x:e.x, y:e.y, vx:Math.cos(a) * v, vy:Math.sin(a) * v - 0.6, t:10 + (i % 3) * 2, m:i % 2 ? '#78e6e6' : '#ffffff', g:0.18}); }
      if (e.k === 'bi-danh') for (let i = 0; i < 10; i++){ const a = (i / 10) * Math.PI * 2;
        TIA.push({x:pl.x + pl.w / 2, y:pl.y + pl.h - 60, vx:Math.cos(a) * 3, vy:Math.sin(a) * 3, t:12, m:'#ffbe50', g:0.18}); }
      if (e.k === 'nut-trung' || e.k === 'vo-tuong'){ V1.hieuUng('da', (e.cot + 0.5) * T, (e.hang + 0.5) * T); if (e.k === 'nut-trung') V1.veNenPhong(); }
    }
  };
  V1.buocTia = function(){ for (let i = TIA.length - 1; i >= 0; i--){ const p = TIA[i]; p.x += p.vx; p.y += p.vy; p.vy += p.g; if (--p.t <= 0) TIA.splice(i, 1); } };

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
      const k = st.k ?? (st.tiLe !== undefined ? Math.floor(clampN(st.tiLe, 0, 0.999) * n) : SpriteMN.khungTheoBuoc(C, st.t ?? HA.t));
      SpriteMN.ve(ctx, C, k, fx, fy, pl.face < 0, E.TL * E.CO, al, pl.hurtT > E.P.hurtT - 5);
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
    const fx = q.x + q.w / 2, fy = q.y + q.h, al = q.alpha < 1 ? q.alpha : undefined;
    if (C && C.ok && C.chan){
      const k = A.k ?? SpriteMN.khungTheoBuoc(C, A.t);
      SpriteMN.ve(ctx, C, k, fx, fy, q.face > 0, E.TL, al, q.flash > 2);
    } else { if (al !== undefined) ctx.globalAlpha = al; khoi(fx, fy, q.w, q.h, q.flash > 2 ? '#ffffff' : (d.mau_khoi || '#a07850'), q.face); ctx.globalAlpha = 1; }
    if (q.baoTruoc && (E.S.frame >> 2) % 2 === 0) veCham(fx, q.y - 26, q._gia);
    if (q.hp < (d.mau || 30) && q.st !== 'chet' && !q.laTinhAnh){ const x = Math.round(fx), y = Math.round(q.y) - 12;
      ctx.fillStyle = '#0d0f1c'; ctx.fillRect(x - 26, y, 52, 7); ctx.fillStyle = '#ffbe50'; ctx.fillRect(x - 24, y + 2, Math.round(48 * Math.max(0, q.hp) / (d.mau || 30) / 2) * 2, 3); }
  }
  function veCham(x, y, xam){ x = Math.round(x); y = Math.round(y);
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
    let ten = pha2 ? 'vo' : 'nghi', ox = 0, sx = 1, sy = 1, sang = 0;
    if (q.st === 'gam') ten = 'gio';
    else if (q.baoTruoc || q.st === 'quet' && q.dangQuet){ ten = pha2 ? 'vo' : 'gio'; if (pha2){ sy = 1.04; sx = 0.98; } sang = (t >> 2) % 2 ? 0.35 : 0.15; }
    else if (q.st === 'go' && t < 46 + 10){ ten = pha2 ? 'vo' : 'nghi'; const k = Math.max(0, 1 - Math.abs(t - 32) / 8); sx = 1 + 0.05 * k; sy = 1 - 0.05 * k; }
    else if (q.st === 'chuyen_pha'){ ten = t < 50 ? 'nghi' : 'vo'; ox = ((t >> 1) % 2 ? 3 : -3); if (t > 44 && t < 56) sang = 0.6; }
    else if (q.st === 'chet'){ ox = ((t >> 2) % 2 ? 2 : -2); }
    const A = TRUM_ANH[ten], im = V1.IMG[A.k], cao = Math.round(im.height * TRUM_TL), lat = q.face > 0;
    const trang = q.flash > 2 ? 0.85 : (q.st === 'chuyen_pha' ? sang : 0);
    if (sang && q.st !== 'chuyen_pha'){   // báo đòn: chuông rực ánh hổ phách nhấp nháy
      const X = fx + (lat ? 1 : -1) * 10, Y = fy - cao * 0.72, r = 90;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const gr = ctx.createRadialGradient(X, Y, 0, X, Y, r); gr.addColorStop(0, 'rgba(255,190,80,' + sang + ')'); gr.addColorStop(1, 'rgba(255,190,80,0)');
      ctx.fillStyle = gr; ctx.fillRect(X - r, Y - r, r * 2, r * 2); ctx.restore();
    }
    if (sx === 1 && sy === 1) veAnh(im, fx + ox, fy, cao, 2, A.ax, 1, lat, q.alpha < 1 ? q.alpha : undefined, trang);
    else {   // co giãn quanh chân (đập chuông / gồng)
      ctx.save(); ctx.translate(Math.round(fx + ox), Math.round(fy)); ctx.scale(sx, sy);
      veAnh(im, 0, 0, cao, 2, A.ax, 1, lat, q.alpha < 1 ? q.alpha : undefined, trang); ctx.restore();
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
      if (G.ganChuong && !pl.dead){ chu('↑ Nghỉ ở Chuông Lưu', x, y - CHUONG.cao - 14, 13, '#ffe08a'); }
    }
    veCuaKhoa();
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
  // Cỡ hình đạo cụ (px logic). Chỉnh ở đây nếu cần to/nhỏ hơn.
  const CHUONG = {cao:138, lun:6};            // Chuông Lưu: cao ~2.9 ô, lún 4 px vào mép sàn (mặt đá méo) để không lơ lửng
  const CUA = {cao:174, lun:3};               // cửa khoá: cao ~3.6 ô
  // Cửa khoá 3 Chuông Vỡ: hình đóng (song rễ, ổ chuông tối) / mở (3 ổ chuông sáng). Chân trên sàn ngay dưới lỗ cửa,
  // cửa sát mép phòng thì đẩy vào trong để cả khung cửa nằm trong phòng.
  function veCuaKhoa(){
    const p = G.phong; if (!coHinhCua()) return;
    const c = p.cua.find(x => x.id === p.khoa.cua); if (!c) return;
    const khoa = G.cuaKhoa.includes(c), im = khoa ? V1.IMG.cua_dong : V1.IMG.cua_mo, n = c.cao || 3, RW = E.BD.COT * T;
    const w = Math.round(CUA.cao / PX * im.width / im.height) * PX;
    let x, y;
    if (c.huong === 'trai' || c.huong === 'phai'){ x = (c.cot + 0.5) * T; y = (c.hang + n) * T; }
    else { x = (c.cot + n / 2) * T; y = c.huong === 'duoi' ? c.hang * T : (c.hang + 1) * T + CUA.cao; }
    x = clampN(x, w / 2, RW - w / 2);
    veAnh(im, x, y + CUA.lun, CUA.cao, PX, 0.5, 1, false);
    if (!khoa){   // 3 ổ chuông sáng: ánh ấm nhẹ trên vòm
      const X = x, Y = y - CUA.cao * 0.86, r = 46 + Math.sin(E.S.frame / 25) * 3;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const gr = ctx.createRadialGradient(X, Y, 0, X, Y, r); gr.addColorStop(0, 'rgba(255,190,80,0.28)'); gr.addColorStop(1, 'rgba(255,190,80,0)');
      ctx.fillStyle = gr; ctx.fillRect(X - r, Y - r, r * 2, r * 2); ctx.restore();
    }
  }
  function veNguy(){
    for (const n of G.nguy){
      if (n.loai === 'song'){
        const x = n.x, y = n.y, h = n.h;
        ctx.fillStyle = 'rgba(207,216,230,0.25)'; ctx.fillRect(x - n.w / 2 - 6, y - h - 6, n.w + 12, h + 6);
        for (let i = 0; i < 5; i++){ const hh = h * (0.4 + 0.6 * Math.abs(Math.sin((n.t + i * 3) / 3))); ctx.fillStyle = i % 2 ? '#cfd8e6' : '#947666'; ctx.fillRect(Math.round(x - n.w / 2 + i * 6), Math.round(y - hh), 5, Math.round(hh)); }
      } else if (n.loai === 'quet'){   // vệt quét chuông: dải cung đồng-xám sát sàn, mờ dần
        const k = Math.min(1, n.t / 6), a = n.t <= 12 ? 0.9 : Math.max(0, 0.9 - (n.t - 12) / 14), L = n.dai * k;
        ctx.save(); ctx.translate(n.x, n.y); ctx.scale(n.dir, 1);
        ctx.fillStyle = 'rgba(207,216,230,' + a * 0.25 + ')'; ctx.fillRect(0, -n.h, L, n.h);
        ctx.strokeStyle = 'rgba(225,184,90,' + a + ')'; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(0, -8, L, n.h - 10, 0, -Math.PI / 2, 0); ctx.stroke();
        ctx.strokeStyle = 'rgba(207,216,230,' + a * 0.8 + ')'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, -8, L * 0.8, n.h - 26, 0, -Math.PI / 2, 0); ctx.stroke();
        for (let i = 0; i < 4; i++){ ctx.fillStyle = 'rgba(148,118,102,' + a + ')'; ctx.fillRect(Math.round(L * (0.3 + i * 0.18)), -6 - ((n.t + i * 5) % 8), 4, 4); }
        ctx.restore();
      } else if (n.loai === 'vong'){
        ctx.strokeStyle = n.gia ? 'rgba(154,163,173,' + (1 - n.t / 40) + ')' : 'rgba(207,216,230,' + (1 - n.t / 40) * 0.8 + ')';
        ctx.lineWidth = n.gia ? 2 : 4; ctx.setLineDash(n.gia ? [6, 6] : []); ctx.beginPath(); ctx.ellipse(n.x, n.y, n.r, n.r * 0.45, 0, 0, 6.283); ctx.stroke(); ctx.setLineDash([]);
      } else if (n.loai === 'mat_na'){
        if (n.bao > 0){   // dấu báo trên sàn + bóng đổ lớn dần
          const k = 1 - n.bao / 30, a = (E.S.frame >> 2) % 2 ? 0.9 : 0.5;
          ctx.fillStyle = 'rgba(255,190,80,' + a + ')'; ctx.fillRect(Math.round(n.xDich - 20), Math.round(n.yDat - 4), 40, 4);
          ctx.fillStyle = 'rgba(0,0,0,' + (0.25 + 0.4 * clampN(k, 0, 1)) + ')'; ctx.beginPath(); ctx.ellipse(n.xDich, n.yDat - 2, 8 + 12 * clampN(k, 0, 1), 4, 0, 0, 6.283); ctx.fill();
          continue;
        }
        ctx.save(); ctx.translate(n.x + n.w / 2, n.y + n.h / 2); ctx.rotate(n.xoay);
        ctx.fillStyle = '#0d0f1c'; ctx.beginPath(); ctx.ellipse(0, 0, 15, 18, 0, 0, 6.283); ctx.fill();
        ctx.fillStyle = '#e9e2d0'; ctx.beginPath(); ctx.ellipse(0, 0, 12, 15, 0, 0, 6.283); ctx.fill();
        ctx.fillStyle = '#b9b09c'; ctx.fillRect(-6, 6, 12, 2);
        ctx.restore();
      }
    }
  }
  function chu(s, x, y, co, mau, canh){
    ctx.font = '700 ' + co + 'px system-ui,-apple-system,sans-serif'; ctx.textAlign = canh || 'center';
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(8,6,10,0.85)'; ctx.strokeText(s, x, y); ctx.fillStyle = mau || '#F3E6C8'; ctx.fillText(s, x, y); ctx.textAlign = 'left';
  }
  V1.chu = chu;

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
    lo(pl.x + pl.w / 2, pl.y + pl.h * 0.45, 46, 0.62);
    for (const q of E.QUAI) if (!q.dead) lo(q.x + q.w / 2, q.y + q.h / 2, q.laTrum ? 70 : 22, q.laTrum ? 0.62 : 0.38);
    for (const v of p.vat_pham) if (!G.luu.daNhat.includes(v.id)){ const o = V1.viTriVP(v); lo(o.x, o.y - 22, 22, 0.55); }
    for (const n of G.nguy) if (n.loai === 'song') lo(n.x, n.y - 20, 18, 0.5); else if (n.loai === 'quet') lo(n.x + n.dir * n.dai / 2, n.y - 30, 40, 0.5);
    if (G.luu.tui && G.luu.tui.phong === G.id) lo(G.luu.tui.x, G.luu.tui.y - 14, 26, 0.6);
    ctx.drawImage(LC, 0, 0, VW, VH, 0, 0, W, H);
    // ánh hổ phách quanh đèn
    ctx.globalCompositeOperation = 'lighter';
    den.forEach(([x, y], i) => { const X = x - cam, Y = y - camY, r = 130 * nhapNhay(t, i);
      const gr = ctx.createRadialGradient(X, Y, 0, X, Y, r); gr.addColorStop(0, 'rgba(194,138,69,0.16)'); gr.addColorStop(1, 'rgba(194,138,69,0)'); ctx.fillStyle = gr; ctx.fillRect(X - r, Y - r, r * 2, r * 2);
      if (!A){ ctx.fillStyle = 'rgba(255,190,80,0.9)'; ctx.fillRect(Math.round(X) - 3, Math.round(Y) - 4, 6, 8); } });
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
  function veHUD(){
    const L = G.luu; if (!L) return;
    // máu
    for (let i = 0; i < E.P.maxHp; i++){ ctx.fillStyle = '#0d0f1c'; ctx.fillRect(15 + i * 24, 15, 18, 18); ctx.fillStyle = i < pl.hp ? '#eef1f0' : '#304a73'; ctx.fillRect(18 + i * 24, 18, 12, 12); }
    // lượt hồi (bình xanh)
    for (let i = 0; i < L.hoiMax; i++){ const x = 24 + i * 22, y = 48;
      ctx.fillStyle = '#0d0f1c'; ctx.beginPath(); ctx.arc(x, y, 9, 0, 6.283); ctx.fill();
      ctx.fillStyle = i < (pl.luotHoi || 0) ? '#78e6e6' : '#1a2b3d'; ctx.beginPath(); ctx.arc(x, y, 6, 0, 6.283); ctx.fill(); }
    // Mảnh Âm
    veIcon('manh_am', 24, 76, 0.85);
    chu(String(V1.tongManh()), 38, 82, 16, '#78e6e6', 'left');
    if (L.manh > 0 && L.manhGui > 0) chu('(' + L.manh + ' chưa gửi)', 38 + ctx.measureText(String(V1.tongManh())).width + 22, 82, 11, '#7f9aa8', 'left');
    // nhiệm vụ: 3 Chuông Vỡ + lõi
    for (let i = 0; i < 3; i++){ ctx.globalAlpha = i < L.kho.chuong_vo ? 1 : 0.25; veIcon('chuong_vo', 26 + i * 26, 106, 0.85); }
    ctx.globalAlpha = 1;
    if (L.kho.loi_vong_tan) veIcon('loi_vong_tan', 26 + 3 * 26 + 6, 106, 0.8);
    // tên phòng
    if (G.bannerT > 0){ ctx.globalAlpha = Math.min(1, G.bannerT / 40); chu(G.banner, W / 2, 58, 22, '#F3E6C8'); ctx.globalAlpha = 1; }
    // thông báo
    if (G.tbT > 0){ ctx.globalAlpha = Math.min(1, G.tbT / 30); chu(G.tb, W / 2, 96, 16, '#ffe08a'); ctx.globalAlpha = 1; }
    // máu trùm / tinh anh
    const b = (G.trum && G.trum.st !== 'cho' && !G.trum.dead) ? G.trum : (G.tinhAnh && G.dongCua && !G.tinhAnh.dead ? G.tinhAnh : null);
    if (b){ const w = 520, x = (W - w) / 2, y = H - 44, m = b.def.mau || 100;
      chu(b.def.ten || '', W / 2, y - 6, 14, '#F3E6C8');
      ctx.fillStyle = '#0d0f1c'; ctx.fillRect(x - 3, y, w + 6, 12); ctx.fillStyle = '#3a1418'; ctx.fillRect(x, y + 3, w, 6);
      ctx.fillStyle = b.batTu ? '#9aa3ad' : '#c0392b'; ctx.fillRect(x, y + 3, Math.round(w * Math.max(0, b.hp) / m), 6);
      if (b.laTrum){ ctx.fillStyle = '#ffe08a'; ctx.fillRect(x + w / 2 - 1, y, 2, 12); } }
  }

  /* ---------------- BẢN ĐỒ NHỎ ---------------- */
  function veBanDo(){
    ctx.fillStyle = 'rgba(5,6,10,0.88)'; ctx.fillRect(0, 0, W, H);
    chu('Bản đồ – Ruột Cây Than Khóc', W / 2, 44, 20, '#F3E6C8');
    const ds = G.bd.phong, cw = 76, chh = 40, gap = 14;
    const xs = ds.map(p => p.x), ys = ds.map(p => p.y);
    const x0 = Math.min(...xs), x1 = Math.max(...ds.map(p => p.x + (p.rong || 1) - 1)), y0 = Math.min(...ys), y1 = Math.max(...ds.map(p => p.y + (p.cao_bd || 1) - 1));
    const tw = (x1 - x0 + 1) * (cw + gap), th = (y1 - y0 + 1) * (chh + gap), k = Math.min(1, (W - 60) / tw, (H - 150) / th);
    const ox = (W - tw * k) / 2, oy = 80 + (H - 150 - th * k) / 2;
    const o = p => ({x:ox + (p.x - x0) * (cw + gap) * k, y:oy + (p.y - y0) * (chh + gap) * k, w:((p.rong || 1) * (cw + gap) - gap) * k, h:((p.cao_bd || 1) * (chh + gap) - gap) * k});
    const vao = G.luu.daVao, byId = {}; ds.forEach(p => byId[p.id] = p);
    // nối cửa
    ctx.strokeStyle = '#4A5A6E'; ctx.lineWidth = 3;
    for (const p of ds){ if (!vao.includes(p.id)) continue; const P = G.cache[p.id]; if (!P) continue;
      for (const c of P.cua){ const q = byId[c.toi]; if (!q) continue; const a = o(p), b = o(q); ctx.beginPath(); ctx.moveTo(a.x + a.w / 2, a.y + a.h / 2); ctx.lineTo(b.x + b.w / 2, b.y + b.h / 2); ctx.stroke(); } }
    for (const p of ds){
      const r = o(p), da = vao.includes(p.id), P = G.cache[p.id];
      if (!da){ // phòng kề phòng đã vào: chỉ hiện khung mờ
        const ke = vao.some(id => G.cache[id] && G.cache[id].cua.some(c => c.toi === p.id));
        if (!ke) continue;
        ctx.strokeStyle = 'rgba(120,130,150,0.5)'; ctx.setLineDash([4, 4]); ctx.strokeRect(r.x, r.y, r.w, r.h); ctx.setLineDash([]); chu('?', r.x + r.w / 2, r.y + r.h / 2 + 5, 14, '#7f8a99'); continue;
      }
      ctx.fillStyle = p.id === G.id ? '#3a3020' : '#1c2430'; ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeStyle = p.id === G.id ? '#E1B85A' : '#4A5A6E'; ctx.lineWidth = 2; ctx.strokeRect(r.x, r.y, r.w, r.h);
      chu(p.id, r.x + r.w / 2, r.y + 15, 11, '#a9b3bf');
      if (P && P.chuong_luu) veIcon('chuong_vo', r.x + 12, r.y + r.h - 12, 0.5);
      if (P && P.khoa && G.luu.kho[P.khoa.can] < P.khoa.so){ ctx.fillStyle = '#c28a45'; ctx.fillRect(r.x + r.w - 14, r.y + r.h - 16, 8, 8); }
      if (P && P.trum && !G.luu.trumHa) chu('☠', r.x + r.w - 12, r.y + 15, 12, '#c0392b');
      if (G.luu.tui && G.luu.tui.phong === p.id) chu('◆', r.x + r.w / 2 + 16, r.y + r.h - 6, 12, '#78e6e6');
      if (p.id === G.id && (E.S.frame >> 4) % 2 === 0){
        const fx = (pl.x + pl.w / 2) / (E.BD.COT * T), fy = (pl.y + pl.h / 2) / (E.BD.HANG * T);
        ctx.fillStyle = '#F3E6C8'; ctx.fillRect(r.x + fx * r.w - 3, r.y + fy * r.h - 3, 6, 6);
      }
    }
    chu((G.bd.phong.find(p => p.id === G.id) || {}).ten || G.id, W / 2, H - 46, 15, '#E1B85A');
    chu('M / nút Bản đồ: đóng', W / 2, H - 22, 12, '#a9b3bf');
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
    const k = q.anim.k ?? SpriteMN.khungTheoBuoc(C, q.anim.t), fx = q.x + q.w / 2, fy = q.y + q.h;
    const al = q.alpha < 1 ? q.alpha : 1;
    SpriteMN.veVien(ctx, C, k, fx, fy, q.face > 0, E.TL, q.def.mau_vien || q.def.mau_khoi || '#e5a13b', E.TL, 0.5 * al);
    SpriteMN.ve(ctx, C, k, fx, fy, q.face > 0, E.TL, al, q.flash > 2);
  }
  const FX_CUA = {dan:'ken', nang_luong:'cau', song:'vai', chan:'tan'};
  function veFx(ten, o, x, y, phai, k, a){   // art/hieu-ung/chieu-quai/<ten>.png – 6 ô 96×96, hướng TRÁI
    const im = V1.IMG['fx_' + ten]; if (!im) return;
    const S = 96, w = S * (k || 1); ctx.save(); ctx.globalAlpha = a ?? 1; ctx.translate(Math.round(x), Math.round(y)); if (phai) ctx.scale(-1, 1);
    ctx.imageSmoothingEnabled = false; ctx.drawImage(im, o * S, 0, S, S, -w / 2, -w / 2, w, w); ctx.restore();
  }
  function nongQuai(q){ const n = q.def.chieu.nong || [0, -40], fx = q.x + q.w / 2, fy = q.y + q.h; return [fx + n[0] * E.TL * -q.face, fy + n[1] * E.TL]; }
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
    for (const q of E.QUAI){   // tụ / lóe ở miệng trước khi bắn
      const ch = q.def && q.def.chieu; if (q.dead || q.laTrum || !ch || q.st !== 'danh' || !ch.khung_ban || (q.kDanh ?? 0) >= ch.khung_ban) continue;
      const [x, y] = nongQuai(q), ten = FX_CUA[ch.ve] || 'ken', p = Math.min(1, q.t / 40);
      if (ten === 'vai') veFx('vai', 0, x, y, q.face > 0, 0.6 + p * 0.4, 0.5 + p * 0.5);
      else veFx(ten, (f >> 3) & 1, x, y, q.face > 0, ten === 'cau' ? 0.7 + p * 0.6 : 0.9, 0.6 + p * 0.4);
    }
    for (const b of E.DAN){
      const ten = FX_CUA[b.ch.ve] || 'ken', phai = b.vx > 0;
      if (ten === 'vai') veFx('vai', Math.min(3, (b.t / 10) | 0), b.x, b.y, phai, 1.3);
      else veFx(ten, 2 + ((f >> 2) & 1), b.x, b.y, phai, ten === 'cau' ? 1.25 : 1.0);
    }
    for (const n of E.NO){
      const ch = n.ch || {}, ten = FX_CUA[ch.ve] || 'ken';
      if (n.dat && ch.toc_song){   // sóng chấn động chạy 2 phía mặt đất
        const r = n.t * ch.toc_song, o = Math.min(5, (n.t / 8) | 0), a = Math.max(0, 1 - n.t / 46);
        veFx('tan', o, n.x - r, n.y - 34, false, 1.4, a); veFx('tan', o, n.x + r, n.y - 34, true, 1.4, a);
      } else veFx(ten, 4 + Math.min(1, (n.t / 12) | 0), n.x, n.y, false, ten === 'cau' ? 1.2 : 1.0, Math.max(0, 1 - n.t / 26));
    }
  }

  /* ---------------- VẼ MỘT KHUNG ---------------- */
  const ANH = () => V1.CANH && V1.CANH[G.id];
  V1.ve = function(mo){
    const S = E.S;
    const camPx = Math.round(CAM.x / PX), cam = camPx * PX, camPy = Math.round(CAM.y / PX), camY = camPy * PX;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#05080d'; ctx.fillRect(0, 0, cv.width, cv.height);
    if (!G.phong){ return; }
    // 1) cảnh nền thấp 320×180
    g.imageSmoothingEnabled = false; g.fillStyle = '#08090d'; g.fillRect(0, 0, VW, VH);
    const I = V1.IMG;
    // nền xa/giữa: lặp cả NGANG lẫn DỌC (lật gương xen kẽ) để không lộ vạch ngang khi camera đi xuống
    const lapNen = (im, kx, ky, y0) => { const w = im.width, h = im.height;
      let y = y0 - Math.round(camPy * ky); y = ((y % (2 * h)) + 2 * h) % (2 * h) - 2 * h;
      for (let j = 0; y < VH; y += h, j++){ let x = -(((Math.round(camPx * kx)) % w + w) % w);
        for (; x < VW; x += w){ if ((((j % 2) + 2) % 2) === 0) g.drawImage(im, x, y); else { g.save(); g.translate(x, y + h); g.scale(1, -1); g.drawImage(im, 0, 0); g.restore(); } } } };
    if (I.bg) lapNen(I.bg, 0.12, 0.08, 0);
    if (I.mid) lapNen(I.mid, 0.35, 0.16, -4);
    if (!ANH()){ g.fillStyle = 'rgba(8,5,8,0.35)'; g.fillRect(0, 0, VW, VH); }
    g.drawImage(NEN, -camPx, -camPy);
    // ngoài phòng: đen
    g.fillStyle = '#05080d';
    if (camPx < 0) g.fillRect(0, 0, -camPx, VH); const rw = E.BD.COT * OD - camPx; if (rw < VW) g.fillRect(rw, 0, VW - rw, VH);
    if (camPy < 0) g.fillRect(0, 0, VW, -camPy); const rh = E.BD.HANG * OD - camPy; if (rh < VH) g.fillRect(0, rh, VW, VH - rh);
    let ox = 0, oy = 0;
    if (S.sht > 0){ const k = S.shm * S.sht / 8; ox = Math.round(S.shx * k * ((S.frame & 1) ? 1 : -1)); oy = Math.round(S.shy * k * ((S.frame & 1) ? -1 : 1)); }
    ctx.setTransform(M, 0, 0, M, ox * M, oy * M); ctx.imageSmoothingEnabled = false;
    ctx.drawImage(pc, 0, 0, VW, VH, 0, 0, W, H);
    // 2) thế giới
    ctx.save(); ctx.translate(-cam, -camY);
    veTheGioi();
    for (const q of E.QUAI) veQuai(q);
    veNguy();
    veNV(); veBuiTuong();
    for (const p of TIA){ ctx.fillStyle = p.m; ctx.fillRect(Math.round(p.x / 2) * 2, Math.round(p.y / 2) * 2, 4, 4); }
    ctx.restore();
    // 3) tường giả: mờ đi khi nhân vật ở trong / sát
    const cx = Math.floor((pl.x + pl.w / 2) / T), cy = Math.floor((pl.y + pl.h / 2) / T);
    let trong = false; for (let dy = -1; dy <= 1 && !trong; dy++) for (let dx = -1; dx <= 1; dx++) if (E.tile(cx + dx, cy + dy) === 'G'){ trong = true; break; }
    G.giaA = (G.giaA ?? 1) + ((trong ? 0.3 : 1) - (G.giaA ?? 1)) * 0.15;
    ctx.globalAlpha = G.giaA; ctx.drawImage(GIA, -cam, -camY, GIA.width * PX, GIA.height * PX); ctx.globalAlpha = 1;
    // 4) bóng tối + đèn
    veAnhSang(cam, camY);
    ctx.save(); ctx.translate(-cam, -camY); for (const q of E.QUAI) veQuaiNoi(q); veChieu(); ctx.restore();
    // 5) HUD
    ctx.setTransform(M, 0, 0, M, 0, 0);
    veHUD();
    if (G.trang === 'ban_do') veBanDo();
    if (mo > 0){ ctx.fillStyle = 'rgba(0,0,0,' + clampN(mo, 0, 1) + ')'; ctx.fillRect(0, 0, W, H); }
    if (V1.OPT && V1.OPT.hb){
      ctx.lineWidth = 2; const r = (o, c) => { ctx.strokeStyle = c; ctx.strokeRect(o.x - cam, o.y - camY, o.w, o.h); };
      r(pl, '#4af'); const hb = E.hopNV(); if (hb) r(hb, '#f33'); for (const q of E.QUAI) if (!q.dead) r(q, '#fc4');
    }
  };
})();
