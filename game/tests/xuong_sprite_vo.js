// Đo vỡ hình trên trạng thái đang làm của Xưởng Sprite (bài kiểm tra xuong_sprite_vo.py và ảnh xuong_sprite_sua_vo_shots.py).
// Dựng 10 khung mỗi động tác; trả về lỗ kín mới, số mảnh rời mới (so với hình gốc), khe ở khớp (lớn nhất qua các khung) so với khung đứng yên.
(tuy) => {
  const S = XS_S, R = S.R, kh = S.kh, bb = XS.khungHinh(R);
  let damGoc = 0;
  const cfg = { mau: kh.mau, khop: kh.khop, bo: kh.bo, vien: S.tach.vien ? XS.hex('#1b1118') : 0, doi: S.muc.doi, dong_tac: {} };
  const tt = tuy === undefined ? { dung_yen: [], nhun: 100 } : tuy;
  // mảnh rời: số đám (8 hướng) nhiều hơn hình gốc (hình gốc có thể vẽ rời, ví dụ đuôi tách thân)
  const damCua = (px, W, H) => { const da = new Uint8Array(W * H); let d = 0; for (let s = 0; s < W * H; s++) { if (!px[s] || da[s]) continue; d++; const q = [s]; da[s] = 1; while (q.length) { const i = q.pop(), x = i % W, y = (i / W) | 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue; const j = yy * W + xx; if (px[j] && !da[j]) { da[j] = 1; q.push(j); } } } } return d; };
  const roiCua = (px, W, H) => Math.max(0, damCua(px, W, H) - damGoc);
  // khe ở khớp: điểm trống kẹp giữa (ngang hoặc dọc) một điểm của bộ phận con và một điểm của bộ phận chủ
  // Khe có sẵn trong hình vẽ (ví dụ giữa hai vây) không tính: chỗ đó, nhìn ngược về hình gốc theo bộ phận hai bên, vốn trống.
  const nghich = (m) => { const d = m[0] * m[3] - m[1] * m[2] || 1e-9; return [m[3] / d, -m[1] / d, -m[2] / d, m[0] / d, (m[2] * m[5] - m[3] * m[4]) / d, (m[1] * m[4] - m[0] * m[5]) / d]; };
  const kheCua = (f) => { const { px, nhan, chu, w: W, h: H } = f; let n = 0; if (!nhan || !chu) return 0;
    const ids = XS.MAU[kh.mau].bo.map((b) => b.id), inv = ids.map((id) => nghich(f.mt[id]));
    const trongGoc = (x, y, k) => { const m = inv[k], sx = Math.floor(m[0] * (x + 0.5) + m[2] * (y + 0.5) + m[4]), sy = Math.floor(m[1] * (x + 0.5) + m[3] * (y + 0.5) + m[5]); return sx >= 0 && sy >= 0 && sx < R.w && sy < R.h && !R.px[sy * R.w + sx]; };
    const lb = (x, y) => (x < 0 || y < 0 || x >= W || y >= H || !px[y * W + x] ? -1 : nhan[y * W + x]);
    const cap = (a, b) => a >= 0 && b >= 0 && a !== b && a < 250 && b < 250 && (chu[a] === b || chu[b] === a);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (px[y * W + x]) continue;
      let p = null; if (cap(lb(x - 1, y), lb(x + 1, y))) p = [lb(x - 1, y), lb(x + 1, y)]; else if (cap(lb(x, y - 1), lb(x, y + 1))) p = [lb(x, y - 1), lb(x, y + 1)];
      if (p && !trongGoc(x, y, p[0]) && !trongGoc(x, y, p[1])) n++; }
    return n; };
  damGoc = damCua(R.px, R.w, R.h);
  const nghi = XS.dungKhung(R, cfg, XS.tuThe(kh.mau, 'idle', 0, 0), { vien: cfg.vien, bb, nhan: true });
  const lo0 = XS.demLo(nghi.px, nghi.w, nghi.h).dem, roi0 = roiCua(nghi.px, nghi.w, nghi.h), khe0 = kheCua(nghi);
  const out = { _nghi: { lo: lo0, roi: roi0, khe: khe0 } };
  for (const ten of XS.dsDongTac(S.muc.doi)) {
    let lo = 0, roi = 0, khe = 0; const n = 10;
    for (let i = 0; i < n; i++) {
      const u = XS.DONG_TAC[ten].lap ? i / n : i / (n - 1);
      const f = XS.dungKhung(R, cfg, XS.tuThe(kh.mau, ten, u, 1, tt), { vien: cfg.vien, bb, nhan: true });
      lo = Math.max(lo, f.loMoi == null ? XS.demLo(f.px, f.w, f.h).dem - lo0 : f.loMoi); roi = Math.max(roi, roiCua(f.px, f.w, f.h)); khe = Math.max(khe, kheCua(f) - khe0);
    }
    out[ten] = { lo, roi, khe };
  }
  return out;
}
