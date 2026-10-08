// LÀM MƯỢT MỨC 7 (claude/ve-lai-pixel, người dùng chọn 08/10) — dùng chung cho tools/build-pixel.js (sinh sẵn ảnh mượt khi build).
// Ảnh RGBA (Buffer w×h×4) → ảnh mượt RGBA cỡ (w×k)×(h×k):
//   1. sel-out: điểm viền tối kề nền trong suốt → màu mảng kề hạ còn 45% (viền "tan" vào hình)
//   2. Scale2x / EPX lặp n lần (×2^n, bo tròn bậc chéo, không pha màu)
//   3. thu nhỏ có trung bình (alpha nhân trước) về ×k → mép pha màu thật (khử răng cưa)
// Mặc định n = 3 (×8) rồi thu về k = 2 → mỗi điểm gốc thành 2×2 điểm đã làm mượt (nhẹ, game vẽ có làm mịn).
function lamMuot(rgba, w, h, opt = {}) {
  const n = opt.n || 3, k = opt.k || 2;
  let W = w, H = h, a = new Uint32Array(w * h);
  for (let i = 0; i < w * h; i++) a[i] = rgba[i * 4 + 3] < 128 ? 0 : ((rgba[i * 4] << 16) | (rgba[i * 4 + 1] << 8) | rgba[i * 4 + 2]) + 1;   // 0 = trong suốt
  const R = (v) => ((v - 1) >> 16) & 255, G = (v) => ((v - 1) >> 8) & 255, B = (v) => (v - 1) & 255;
  const toi = (v) => v && R(v) + G(v) + B(v) < 110;
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : a[y * W + x]);
  const b = a.slice();
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const v = a[y * W + x];
    if (!toi(v) || (at(x + 1, y) && at(x - 1, y) && at(x, y + 1) && at(x, y - 1))) continue;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]) {
      const q = at(x + dx, y + dy);
      if (q && !toi(q)) { b[y * W + x] = ((Math.round(R(q) * 0.45) << 16) | (Math.round(G(q) * 0.45) << 8) | Math.round(B(q) * 0.45)) + 1; break; }
    }
  }
  a = b;
  for (let s = 0; s < n; s++) {
    const o = new Uint32Array(W * H * 4), W2 = W * 2, g = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : a[y * W + x]);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const P = a[y * W + x], A = g(x, y - 1), Bv = g(x + 1, y), C = g(x - 1, y), D = g(x, y + 1);
      let e0 = P, e1 = P, e2 = P, e3 = P;
      if (A !== D && C !== Bv) { if (C === A) e0 = A; if (A === Bv) e1 = Bv; if (C === D) e2 = C; if (D === Bv) e3 = Bv; }
      const i = y * 2 * W2 + x * 2; o[i] = e0; o[i + 1] = e1; o[i + W2] = e2; o[i + W2 + 1] = e3;
    }
    a = o; W *= 2; H *= 2;
  }
  const f = W / (w * k), ow = w * k, oh = h * k, out = Buffer.alloc(ow * oh * 4);
  for (let y = 0; y < oh; y++) for (let x = 0; x < ow; x++) {
    let r = 0, gg = 0, bb = 0, al = 0;
    for (let dy = 0; dy < f; dy++) for (let dx = 0; dx < f; dx++) { const v = a[(y * f + dy) * W + x * f + dx]; if (v) { r += R(v); gg += G(v); bb += B(v); al++; } }
    const j = (y * ow + x) * 4;
    if (al) { out[j] = Math.round(r / al); out[j + 1] = Math.round(gg / al); out[j + 2] = Math.round(bb / al); out[j + 3] = Math.round((al / (f * f)) * 255); }
  }
  return { rgba: out, w: ow, h: oh };
}
// dải nhiều khung nằm ngang: làm mượt từng khung riêng (không lem sang khung bên)
function lamMuotDai(rgba, fw, fh, n, opt = {}) {
  const k = opt.k || 2, out = Buffer.alloc(fw * k * n * fh * k * 4), W = fw * n;
  for (let i = 0; i < n; i++) {
    const f = Buffer.alloc(fw * fh * 4);
    for (let y = 0; y < fh; y++) rgba.copy(f, y * fw * 4, (y * W + i * fw) * 4, (y * W + i * fw + fw) * 4);
    const m = lamMuot(f, fw, fh, opt);
    for (let y = 0; y < m.h; y++) m.rgba.copy(out, (y * W * k + i * m.w) * 4, y * m.w * 4, (y + 1) * m.w * 4);
  }
  return { rgba: out, w: W * k, h: fh * k };
}
module.exports = { lamMuot, lamMuotDai };
