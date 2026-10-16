// 16/10/2026 (docs/review/ke-hoach-cai-thien/vu-khi-chatgpt/bao-cao-A.md): chủ game chọn bậc ép đồ CHỈ hiện ở khung ô đồ → cả tệp này (viền,
//   hào quang, đốm, lửa chạy, ánh lướt theo cấp mài) mặc định TẮT (G.VIEN_VK = false). Bật lại bản cũ: ?vienvk=1. Khung ô: js/ep_do.js.
//   Cuối tệp: G.vkHeAnh — nạp ảnh vũ khí theo hệ (bộ zed-vk-he) khi đã có ảnh.
// VIỀN + HÀO QUANG VŨ KHÍ THEO BẬC ÉP ĐỒ, ÁNH LƯỚT THEO CẤP MÀI (15/10/2026) — docs/review/ke-hoach-cai-thien/vien-vk-bac/YEU-CAU.md
//   Bậc ép đồ (G.EP_DO.mau, js/ep_do.js E.bac): Trắng không viền · Xanh lam, Xanh lục: viền 1 điểm ảnh màu bậc · Tím, Vàng: viền + hào quang
//   mờ mềm nhấp nháy nhẹ · Đỏ: thêm vài đốm sáng bay quanh lưỡi · Rực lửa: như Đỏ + đốm lửa vàng/cam chạy dọc vũ khí (kiểu lửa E.vien).
//   Cấp mài (w.sharpen, tối đa G.MAX_SHARPEN = 15): +1..+2 không ánh · +3..+5 một vệt trắng lướt mỗi 2,5 s · +6..+8 mỗi 1,6 s · +9..+15 hai vệt mỗi 1 s.
//   Dùng ở: vũ khí trên tay Zed (js/zed_moi.js veVk — đứng, đi, chạy, chém, phi tiêu đang cầm) và hình vũ khí trong ô (js/vk_moi.js VM.icon:
//   ô trong trận, Hành trang, bảng ép đồ, Ông Thợ Rèn, bảng Linh khí…).
//   Cách vẽ: MẶT NẠ dựng một lần cho mỗi (ô ảnh loại+cấp, cỡ điểm ảnh game) — lưới làm việc ≈ 1 điểm ảnh game (đúng nét pixel), giãn alpha
//   1 điểm ảnh → viền, làm mờ phần giãn → hào quang; nhuộm màu mỗi bậc một canvas (nhớ lại). Ánh mài: 12 pha dựng sẵn. Mỗi khung chỉ còn
//   1–3 lệnh drawImage + vài ô vuông đốm sáng; vẽ trong cùng hệ toạ độ của ảnh vũ khí nên lật / xoay theo vũ khí như ảnh gốc.
//   Vũ khí trên tay: mặt nạ cả 4 loại × 4 cấp dựng sẵn khi ảnh zed-vk + tấm thân đã nạp (chia nhỏ, lúc rảnh). Ô: dựng lần đầu cần.
//   Cờ tắt: ?vienvk=0 (G.VIEN_VK = false, js/data.js) → không vẽ gì thêm, y như trước. Ép đồ tắt (?epdo=0): bậc tính là Trắng (ánh mài vẫn có).
(function () {
  'use strict';
  const G = window.G;
  if (!G) return;
  const VV = (G.vienVk = {});
  const kep = (v, a, b) => (v < a ? a : v > b ? b : v);
  VV.bat = () => G.VIEN_VK !== false && typeof document !== 'undefined';
  VV.bac = (w) => { try { return w && G.epDo && G.epDo.bat() ? G.epDo.bac(w) | 0 : 0; } catch (e) { return 0; } };
  VV.mai = (w) => (w ? Math.max(0, w.sharpen | 0) : 0);
  // Mốc mài: tu = từ cấp, chu = chu kỳ (giây), so = số vệt mỗi chu kỳ. Cấp mài tối đa 15 (G.MAX_SHARPEN) → nhóm cuối +9..+15.
  VV.MOC_MAI = [{ tu: 9, chu: 1, so: 2 }, { tu: 6, chu: 1.6, so: 1 }, { tu: 3, chu: 2.5, so: 1 }];
  VV.mocMai = (n) => { for (const m of VV.MOC_MAI) if (n >= m.tu) return m; return null; };
  const LUOT = 0.38; // một vệt lướt hết chiều dài vũ khí trong bấy nhiêu giây
  const PHA = 12; // số pha dựng sẵn của vệt
  // Có gì để vẽ không (bỏ qua nhanh cho vũ khí Trắng chưa mài)
  VV.co = (w) => !!w && VV.bat() && (VV.bac(w) > 0 || VV.mai(w) >= 3);
  const mauBac = (b) => (G.EP_DO && G.EP_DO.mau ? G.EP_DO.mau[kep(b, 0, G.EP_DO.mau.length - 1)] : '#ffffff');
  const rgb = (h) => { const n = parseInt(String(h).slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };

  // ---------- mặt nạ ----------
  const NA = new Map(); // khoá → { q, pad, W, H, vien: Uint8Array, hao: Float32Array, pts, cot, mau: {}, anh: [] }
  VV.soMatNa = () => NA.size;
  function cv(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, w); c.height = Math.max(1, h); return c; }
  // gp: số đơn vị ảnh nguồn trên 1 điểm ảnh game (nghịch đảo tỉ lệ vẽ). q: cỡ ô lưới làm việc (đơn vị nguồn) ≈ 1 điểm ảnh game.
  const qCua = (gp) => Math.max(1, Math.round(gp));
  function dung(img, sx, sy, sw, sh, q) {
    const R = 1, GR = 3, pad = R + GR + 2; // viền 1 ô, hào quang lan 3 ô
    const w = Math.ceil(sw / q), h = Math.ceil(sh / q), W = w + 2 * pad, H = h + 2 * pad;
    const c = cv(W, H), x = c.getContext('2d');
    x.imageSmoothingEnabled = q > 1; // thu nhỏ về lưới điểm ảnh game: lấy trung bình rồi cắt ngưỡng
    x.drawImage(img, sx, sy, sw, sh, pad, pad, sw / q, sh / q);
    const d = x.getImageData(0, 0, W, H).data, N = W * H;
    const b = new Uint8Array(N);
    for (let i = 0; i < N; i++) b[i] = d[i * 4 + 3] > 90 ? 1 : 0;
    // giãn 1 ô (8 hướng) → viền = giãn − gốc
    const gian = new Uint8Array(N), vien = new Uint8Array(N);
    for (let y = 1; y < H - 1; y++) for (let xx = 1; xx < W - 1; xx++) {
      const i = y * W + xx;
      if (b[i] || b[i - 1] || b[i + 1] || b[i - W] || b[i + W] || b[i - W - 1] || b[i - W + 1] || b[i + W - 1] || b[i + W + 1]) gian[i] = 1;
      if (gian[i] && !b[i]) vien[i] = 1;
    }
    // hào quang: làm mờ phần giãn (3 lượt hộp bán kính 1 ≈ gauss), chỉ giữ phần ngoài hình gốc
    let a = new Float32Array(N), t = new Float32Array(N);
    for (let i = 0; i < N; i++) a[i] = gian[i];
    for (let k = 0; k < GR; k++) {
      for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) { let s = 0, n = 0; for (let e = -1; e <= 1; e++) { const X = xx + e; if (X >= 0 && X < W) { s += a[y * W + X]; n++; } } t[y * W + xx] = s / n; }
      for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) { let s = 0, n = 0; for (let e = -1; e <= 1; e++) { const Y = y + e; if (Y >= 0 && Y < H) { s += t[Y * W + xx]; n++; } } a[y * W + xx] = (s / n) * 1.6; }
    }
    for (let i = 0; i < N; i++) { if (b[i]) a[i] = 0; else a[i] = Math.min(1, a[i]); }
    // điểm viền (đốm sáng Đỏ bay ra từ đây) + mép trên/dưới từng cột (lửa Rực lửa chạy dọc)
    const pts = [], cot = [];
    for (let i = 0; i < N; i++) if (vien[i]) pts.push(i);
    const buoc = Math.max(1, Math.floor(pts.length / 48)), pt = [];
    for (let i = 0; i < pts.length; i += buoc) pt.push([pts[i] % W, Math.floor(pts[i] / W)]);
    for (let xx = 0; xx < W; xx++) { let y0 = -1, y1 = -1; for (let y = 0; y < H; y++) if (b[y * W + xx]) { if (y0 < 0) y0 = y; y1 = y; } if (y0 >= 0) cot.push([xx, y0, y1]); }
    return { q, pad, W, H, b, vien, hao: a, pts: pt, cot, mau: {}, anh: [] };
  }
  function lay(key, img, sx, sy, sw, sh, gp) {
    const q = qCua(gp), k = key + '|' + q;
    let m = NA.get(k);
    if (!m) { m = dung(img, sx, sy, sw, sh, q); NA.set(k, m); }
    return m;
  }
  VV.dungMatNa = lay;
  // Canvas viền + hào quang màu bậc b (nhớ trong mặt nạ)
  function mau(m, b) {
    let o = m.mau[b];
    if (o) return o;
    const [r, g, bl] = rgb(mauBac(b)), N = m.W * m.H;
    const cV = cv(m.W, m.H), cH = cv(m.W, m.H);
    const xV = cV.getContext('2d'), xH = cH.getContext('2d');
    const iV = xV.createImageData(m.W, m.H), iH = xH.createImageData(m.W, m.H);
    for (let i = 0; i < N; i++) {
      if (m.vien[i]) { iV.data[i * 4] = r; iV.data[i * 4 + 1] = g; iV.data[i * 4 + 2] = bl; iV.data[i * 4 + 3] = 255; }
      const h = m.hao[i];
      if (h > 0.01) { iH.data[i * 4] = r; iH.data[i * 4 + 1] = g; iH.data[i * 4 + 2] = bl; iH.data[i * 4 + 3] = Math.round(h * 200); }
    }
    xV.putImageData(iV, 0, 0); xH.putImageData(iH, 0, 0);
    o = m.mau[b] = { vien: cV, hao: cH };
    return o;
  }
  // Vệt ánh mài pha p (0..PHA−1): dải trắng xiên, chỉ trên phần thân vũ khí
  function anh(m, p) {
    let c = m.anh[p];
    if (c) return c;
    c = cv(m.W, m.H);
    const x = c.getContext('2d'), im = x.createImageData(m.W, m.H);
    const bw = Math.max(2, m.W * 0.12), cx = -bw + ((p + 0.5) / PHA) * (m.W + 2 * bw);
    for (let y = 0; y < m.H; y++) for (let xx = 0; xx < m.W; xx++) {
      const i = y * m.W + xx;
      if (!m.b[i]) continue;
      const k = 1 - Math.abs(xx - cx - (y - m.H / 2) * 0.55) / bw;
      if (k > 0) { im.data[i * 4] = 255; im.data[i * 4 + 1] = 255; im.data[i * 4 + 2] = 255; im.data[i * 4 + 3] = Math.round(Math.min(1, k * 1.4) * 230); }
    }
    x.putImageData(im, 0, 0);
    m.anh[p] = c;
    return c;
  }
  VV.dungAnh = anh;

  // ---------- vẽ ----------
  // Tham số chung: c = bút đang ở hệ toạ độ của ảnh vũ khí (đơn vị = điểm ảnh nguồn); (dx, dy) = góc trên trái nơi ảnh vũ khí được vẽ;
  // img/sx/sy/sw/sh = ô ảnh GỐC (chưa nhuộm hệ — mặt nạ chỉ cần alpha); key = mã ô (loại + cấp); gp = đơn vị nguồn / điểm ảnh game.
  const tg = (t) => (t != null ? t : G.time || 0);
  function veMask(c, m, can, dx, dy, a) {
    if (a <= 0) return;
    const ga = c.globalAlpha, sm = c.imageSmoothingEnabled;
    c.globalAlpha = ga * a; c.imageSmoothingEnabled = false;
    c.drawImage(can, dx - m.pad * m.q, dy - m.pad * m.q, m.W * m.q, m.H * m.q);
    c.globalAlpha = ga; c.imageSmoothingEnabled = sm;
  }
  // TRƯỚC ảnh vũ khí: hào quang (Tím trở lên) + viền (Xanh lam trở lên)
  VV.truoc = function (c, w, img, sx, sy, sw, sh, key, dx, dy, gp, t) {
    if (!VV.bat() || !w) return;
    const b = VV.bac(w);
    if (b <= 0) return;
    const m = lay(key, img, sx, sy, sw, sh, gp), o = mau(m, b);
    if (b >= 3) veMask(c, m, o.hao, dx, dy, 0.62 + 0.22 * Math.sin(tg(t) * 3.4)); // nhấp nháy nhẹ
    veMask(c, m, o.vien, dx, dy, 1);
  };
  const bam = (n) => { n = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b); n ^= n >>> 13; n = Math.imul(n, 0xc2b2ae35); return (n ^ (n >>> 16)) >>> 0; };
  // SAU ảnh vũ khí: ánh mài, đốm sáng (Đỏ trở lên), lửa chạy dọc (Rực lửa)
  VV.sau = function (c, w, img, sx, sy, sw, sh, key, dx, dy, gp, t) {
    if (!VV.bat() || !w) return;
    const b = VV.bac(w), n = VV.mai(w), M = VV.mocMai(n);
    if (b < 5 && !M) return;
    t = tg(t);
    const m = lay(key, img, sx, sy, sw, sh, gp), q = m.q, X = (px) => dx + (px - m.pad) * q, Y = (py) => dy + (py - m.pad) * q;
    const ga = c.globalAlpha;
    if (M) { // vệt trắng lướt
      for (let k = 0; k < M.so; k++) {
        const u = (((t - k * (LUOT * 0.55)) % M.chu) + M.chu) % M.chu;
        if (u < LUOT) veMask(c, m, anh(m, Math.min(PHA - 1, Math.floor((u / LUOT) * PHA))), dx, dy, n >= 12 ? 0.95 : 0.75);
      }
    }
    if (b >= 5 && m.pts.length) { // đốm sáng bay quanh lưỡi
      const s = Math.max(1, q * 0.9), so = b >= 6 ? 6 : 5, CH = 1.3;
      for (let k = 0; k < so; k++) {
        const v = t / CH + k / so, ph = v - Math.floor(v), p = m.pts[bam(Math.floor(v) * 31 + k * 7 + (key.length << 4)) % m.pts.length];
        c.globalAlpha = ga * Math.sin(Math.PI * ph) * 0.95;
        c.fillStyle = k % 2 ? '#ffffff' : '#ffd0b8';
        c.fillRect(X(p[0]) - s / 2, Y(p[1]) - s / 2 - ph * 2.5 * q, s, s);
      }
    }
    if (b >= 6 && m.cot.length > 1) { // lửa vàng/cam chạy dọc vũ khí (như E.vien bậc tối đa)
      const s = Math.max(1, q * 1.2), so = 10;
      for (let k = 0; k < so; k++) {
        const v = (k / so + t * 0.35) % 1, C = m.cot[Math.min(m.cot.length - 1, Math.floor(v * m.cot.length))];
        const tren = k % 2 === 0, py = tren ? C[1] - 0.5 : C[2] + 0.5;
        c.globalAlpha = ga * (0.75 + 0.25 * Math.sin(t * 9 + k));
        c.fillStyle = k % 3 === 1 ? '#ffd23f' : '#ff5a1a';
        c.fillRect(X(C[0]) - s / 2, Y(py) - s / 2 - (tren ? 1 : 0) * (0.6 + Math.sin(t * 9 + k) * 0.6) * q, s, s);
      }
    }
    c.globalAlpha = ga;
  };

  // ---------- dựng sẵn mặt nạ vũ khí trên tay (lúc nạp, chia nhỏ để không giật) ----------
  const VK_LOAI = { kiem: 1, thuong: 1, bua: 1, phitieu: 1 };
  let daDung = false;
  function viecDungSan() {
    const SC = G.spriteCustom, V = SC && SC.zed && SC.zed['zed-vk'], T = SC && SC.zed && SC.zed['zed-moi'];
    if (!V || !V.ready || !V.img || !T || !T.ready || !T.tep) return null;
    const tl = {}; // loại → các tỉ lệ vẽ trên tay (vk_tl) của tấm thân
    for (const k in T.tep.dong_tac) { const a = T.tep.dong_tac[k]; if (a && a.vk && VK_LOAI[a.vk] && a.vk_tl) (tl[a.vk] = tl[a.vk] || {})[a.vk_tl] = 1; }
    const viec = [];
    for (const loai in tl) for (const f in tl[loai]) for (let cap = 0; cap < 4; cap++) {
      const r = V.tep.vk[loai] && V.tep.vk[loai][cap];
      if (r) viec.push(() => lay('zed-vk:' + loai + cap, V.img, r[0], r[1], r[2], r[3], 1 / Number(f)));
    }
    return viec;
  }
  function dungSan() {
    if (daDung || !VV.bat()) return;
    let viec = null;
    try { viec = viecDungSan(); } catch (e) { viec = null; }
    if (!viec) { setTimeout(dungSan, 800); return; }
    daDung = true;
    const buoc = () => { const f = viec.shift(); if (!f) return; try { f(); } catch (e) { /* bỏ qua */ } setTimeout(buoc, 16); };
    buoc();
  }
  if (typeof setTimeout === 'function' && typeof document !== 'undefined') setTimeout(dungSan, 1500);
  VV.dungSan = dungSan;

  // ---------- ẢNH VŨ KHÍ THEO HỆ (16/10, bao-cao-A mục 3) ----------
  // Bộ zed-vk-he (doi_tuong "zed", tải sau; dựng bằng docs/review/ke-hoach-cai-thien/vu-khi-chatgpt/dung_zed_vk_he.py):
  //   vk[loại][hệ] = [null, [x, y, rộng, cao] Mầm, … Thành hình, … Thức tỉnh]; hệ: fire | poison | ice.
  // Mỗi ô PHẢI cùng rộng × cao với ô cấp đó của zed-vk (điểm cầm B.cam / nắm tay tính theo ô zed-vk) — lệch cỡ thì bỏ qua ô đó.
  // Có ảnh: dùng thẳng (không nhuộm). Chưa có / chưa tải xong / ?vkhe=0: null → nơi gọi dùng ảnh cấp nhuộm 30% màu hệ như cũ.
  // Dùng ở js/zed_moi.js anhVk (trên tay) và js/vk_moi.js anhVk (ô đồ, Phi Thương, nút).
  G.VK_HE_ANH = true;
  try { if (typeof location !== 'undefined' && /[?&]vkhe=0(&|$)/.test(location.search || '')) G.VK_HE_ANH = false; } catch (e) { /* giữ mặc định */ }
  G.vkHeAnh = function (loai, cap, he, r) {
    if (G.VK_HE_ANH === false || !he || !(cap > 0) || !r) return null;
    const SC = G.spriteCustom, z = SC && SC.zed && SC.zed['zed-vk-he'];
    if (!z) return null;
    if (!z.ready || !z.img) { if (SC.canAnh) SC.canAnh('zed-vk-he'); return null; }
    const h = z.tep && z.tep.vk && z.tep.vk[loai] && z.tep.vk[loai][he], q = h && h[cap];
    if (!q || q[2] !== r[2] || q[3] !== r[3]) return null;
    return { img: z.img, x: q[0], y: q[1], w: q[2], h: q[3] };
  };
})();
