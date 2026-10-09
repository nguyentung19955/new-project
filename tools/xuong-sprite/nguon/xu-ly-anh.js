// XƯỞNG SPRITE: xử lý ảnh. Nạp ảnh, tách nền, cắt sát, thu về cỡ pixel của game, giảm màu, viền tối.
// Mọi màu lưu dạng số 32 bit theo thứ tự byte của ImageData (đọc bằng Uint32Array): 0 nghĩa là trống.
(function () {
  'use strict';
  const XS = (window.XS = window.XS || {});
  const MAX_NGUON = 600; // cạnh dài nhất của ảnh làm việc (đủ nét để thu về cỡ game)

  const rgba = (r, g, b, a) => ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;
  const R = (c) => c & 255, Gc = (c) => (c >>> 8) & 255, B = (c) => (c >>> 16) & 255, A = (c) => c >>> 24;
  XS.rgba = rgba; XS.R = R; XS.G = Gc; XS.B = B; XS.A = A;
  XS.hex = (h) => { const v = parseInt(h.slice(1), 16); return rgba((v >> 16) & 255, (v >> 8) & 255, v & 255, 255); };
  XS.chuHex = (c) => '#' + [R(c), Gc(c), B(c)].map((v) => v.toString(16).padStart(2, '0')).join('');
  XS.taoCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, w); c.height = Math.max(1, h); return c; };

  // ---------- nạp ảnh ----------
  XS.docTep = function (file) {
    return new Promise((ok, bad) => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => { try { ok(XS.tuAnh(img)); } catch (e) { bad(e); } URL.revokeObjectURL(url); };
      img.onerror = () => { URL.revokeObjectURL(url); bad(new Error('Không đọc được ảnh này')); };
      img.src = url;
    });
  };
  XS.tuDataUrl = function (src) {
    return new Promise((ok, bad) => { const img = new Image(); img.onload = () => ok(img); img.onerror = () => bad(new Error('Ảnh hỏng')); img.src = src; });
  };
  // Ảnh (img hoặc canvas) -> {w, h, px: Uint32Array}, thu nhỏ nếu quá lớn.
  XS.tuAnh = function (img, max) {
    max = max || MAX_NGUON;
    const w0 = img.naturalWidth || img.width, h0 = img.naturalHeight || img.height, k = Math.min(1, max / Math.max(w0, h0));
    const w = Math.max(1, Math.round(w0 * k)), h = Math.max(1, Math.round(h0 * k));
    const cv = XS.taoCanvas(w, h), x = cv.getContext('2d');
    x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
    x.drawImage(img, 0, 0, w, h);
    const d = x.getImageData(0, 0, w, h);
    return { w, h, px: new Uint32Array(d.data.buffer.slice(0)) };
  };
  XS.raCanvas = function (w, h, px) {
    const cv = XS.taoCanvas(w, h), x = cv.getContext('2d'), d = x.createImageData(w, h);
    new Uint32Array(d.data.buffer).set(px);
    x.putImageData(d, 0, 0);
    return cv;
  };

  // ---------- tách nền ----------
  // Màu nền: màu hay gặp nhất ở viền ảnh (gộp màu gần nhau).
  function mauNen(S) {
    const { w, h, px } = S, dem = new Map();
    let trong = 0, tong = 0;
    const them = (i) => {
      const c = px[i]; tong++;
      if (A(c) < 128) { trong++; return; }
      const k = (R(c) >> 4) | ((Gc(c) >> 4) << 4) | ((B(c) >> 4) << 8);
      const o = dem.get(k) || { n: 0, r: 0, g: 0, b: 0 }; o.n++; o.r += R(c); o.g += Gc(c); o.b += B(c); dem.set(k, o);
    };
    for (let x = 0; x < w; x++) { them(x); them((h - 1) * w + x); }
    for (let y = 1; y < h - 1; y++) { them(y * w); them(y * w + w - 1); }
    let best = null;
    for (const o of dem.values()) if (!best || o.n > best.n) best = o;
    const trongSuot = trong > tong * 0.3;
    if (!best) return { r: 255, g: 255, b: 255, trongSuot: true };
    return { r: best.r / best.n, g: best.g / best.n, b: best.b / best.n, trongSuot };
  }
  XS.mauNen = mauNen;
  const kc = (c, r, g, b) => { const dr = R(c) - r, dg = Gc(c) - g, db = B(c) - b; return Math.sqrt((dr * dr + dg * dg + db * db) / 3); };
  // Trả về mặt nạ Uint8Array: 1 = giữ (hình), 0 = nền.
  // o: { nguong, kieu: 'mep' | 'het', boDom, sua: Uint8Array (0 tự động, 1 giữ, 2 xoá) }
  XS.tachNen = function (S, o) {
    const { w, h, px } = S, n = w * h, nen = mauNen(S), T = o.nguong || 40, m = new Uint8Array(n);
    // điểm trong suốt luôn là nền
    if (o.kieu === 'het') {
      for (let i = 0; i < n; i++) { const c = px[i]; m[i] = A(c) >= 128 && kc(c, nen.r, nen.g, nen.b) > T ? 1 : 0; }
    } else {
      // loang từ mép vào: điểm gần màu nền, hoặc gần điểm nền bên cạnh (chịu được nền giấy loang sáng tối)
      m.fill(1);
      const q = new Int32Array(n); let qa = 0, qb = 0;
      const laNen = (i, j) => {
        const c = px[i];
        if (A(c) < 128) return true;
        const d = kc(c, nen.r, nen.g, nen.b);
        if (d <= T) return true;
        if (j >= 0 && d <= T * 2.2) { const p = px[j]; if (A(p) >= 128 && kc(c, R(p), Gc(p), B(p)) <= T * 0.1 + 2) return true; }
        return false;
      };
      const vao = (i, j) => { if (m[i] && laNen(i, j)) { m[i] = 0; q[qb++] = i; } };
      for (let x = 0; x < w; x++) { vao(x, -1); vao((h - 1) * w + x, -1); }
      for (let y = 0; y < h; y++) { vao(y * w, -1); vao(y * w + w - 1, -1); }
      while (qa < qb) {
        const i = q[qa++], x = i % w, y = (i / w) | 0;
        if (x > 0) vao(i - 1, i); if (x < w - 1) vao(i + 1, i); if (y > 0) vao(i - w, i); if (y < h - 1) vao(i + w, i);
      }
      for (let i = 0; i < n; i++) if (A(px[i]) < 128) m[i] = 0;
    }
    if (o.boDom !== false) boDomLe(m, w, h);
    if (o.sua) for (let i = 0; i < n; i++) { if (o.sua[i] === 1) m[i] = 1; else if (o.sua[i] === 2) m[i] = 0; }
    return m;
  };
  // Bỏ các đám nhỏ đứng riêng (vết bẩn, bóng giấy): giữ đám lớn nhất và đám nào đủ to so với nó.
  function boDomLe(m, w, h) {
    const n = w * h, nhan = new Int32Array(n).fill(-1), co = [], q = new Int32Array(n);
    let id = 0;
    for (let s = 0; s < n; s++) {
      if (!m[s] || nhan[s] >= 0) continue;
      let qa = 0, qb = 0; q[qb++] = s; nhan[s] = id; let dem = 0;
      while (qa < qb) {
        const i = q[qa++], x = i % w, y = (i / w) | 0; dem++;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
          const j = yy * w + xx; if (m[j] && nhan[j] < 0) { nhan[j] = id; q[qb++] = j; }
        }
      }
      co.push(dem); id++;
    }
    if (!co.length) return;
    const lon = Math.max.apply(null, co), nguong = Math.max(6, lon * 0.012);
    for (let i = 0; i < n; i++) if (m[i] && co[nhan[i]] < nguong) m[i] = 0;
  }
  XS.khung = function (m, w, h) { // hình chữ nhật bao sát phần giữ lại
    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (m[y * w + x]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    return x1 < 0 ? null : { x0, y0, x1, y1, w: x1 - x0 + 1, h: y1 - y0 + 1 };
  };

  // ---------- pixel hoá ----------
  // S: ảnh làm việc, m: mặt nạ. o: { cao (điểm ảnh), soMau, lat, kieuThu: 'net' (giữ nét, mặc định) | 'mem' (lấy trung bình như cũ) }.
  // Trả về { w, h, px } (px chỉ chứa thân, chưa có viền).
  const sang = (c) => R(c) * 0.3 + Gc(c) * 0.59 + B(c) * 0.11;
  const kc2c = (a, b) => (R(a) - R(b)) ** 2 + (Gc(a) - Gc(b)) ** 2 + (B(a) - B(b)) ** 2;
  XS.pixelHoa = function (S, m, o) {
    const bb = XS.khung(m, S.w, S.h);
    if (!bb) return null;
    const net = o.kieuThu !== 'mem';
    const H = Math.max(4, Math.round(o.cao)), W = Math.max(1, Math.round(bb.w * H / bb.h)), out = new Uint32Array(W * H);
    const kx = bb.w / W, ky = bb.h / H, phu = net ? [] : null, toiO = net ? [] : null; // toiO[ô] = [tỉ lệ nét tối, màu tối] // phu[ô] = màu thiểu số nổi bật trong ô (để cứu chi tiết nhỏ)
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const sx0 = bb.x0 + i * kx, sx1 = bb.x0 + (i + 1) * kx, sy0 = bb.y0 + j * ky, sy1 = bb.y0 + (j + 1) * ky;
      let tong = 0, giu = 0, r = 0, g = 0, b = 0, toi = 0, tr = 0, tg = 0, tb = 0;
      const nhom = net ? new Map() : null;
      for (let y = Math.floor(sy0); y < Math.ceil(sy1); y++) for (let x = Math.floor(sx0); x < Math.ceil(sx1); x++) {
        if (x < 0 || y < 0 || x >= S.w || y >= S.h) continue;
        tong++;
        const k = y * S.w + x; if (!m[k]) continue;
        const c = S.px[k]; giu++; r += R(c); g += Gc(c); b += B(c);
        const laToi = sang(c) < 72;
        if (laToi) { toi++; tr += R(c); tg += Gc(c); tb += B(c); }
        if (net) { // gom màu gần nhau thành nhóm (mỗi kênh 16 bậc)
          const key = (R(c) >> 4) | ((Gc(c) >> 4) << 4) | ((B(c) >> 4) << 8);
          let q = nhom.get(key); if (!q) nhom.set(key, (q = { n: 0, r: 0, g: 0, b: 0, toi: laToi }));
          q.n++; q.r += R(c); q.g += Gc(c); q.b += B(c);
        }
      }
      const o2 = j * W + (o.lat ? W - 1 - i : i);
      if (!tong || giu / tong < (net ? 0.4 : 0.42)) continue;
      if (!net) {
        // nét vẽ đậm mảnh dễ bị pha nhạt: ô nào có đủ nét tối thì giữ màu tối
        out[o2] = toi / giu >= 0.3 ? rgba(tr / toi, tg / toi, tb / toi, 255) : rgba(r / giu, g / giu, b / giu, 255);
        continue;
      }
      // GIỮ NÉT: không trộn màu. Ô có đủ nét tối thì lấy màu tối (viền liền mạch), không thì lấy nhóm màu chiếm nhiều nhất.
      const ds = [...nhom.values()].sort((a, b2) => b2.n - a.n), mau = (q) => rgba(q.r / q.n, q.g / q.n, q.b / q.n, 255);
      let chon = ds[0];
      if (toi) toiO[o2] = [toi / giu, rgba(tr / toi, tg / toi, tb / toi, 255)];
      if (toi / giu >= (o.nguongToi || 0.36)) { const t = ds.find((q) => q.toi); if (t) chon = t; }
      out[o2] = mau(chon);
      // màu thiểu số khác hẳn (mắt, chuông, hoa văn) để lượt sau cứu nếu xung quanh không có
      const c0 = out[o2];
      for (const q of ds) { if (q === chon || q.n < giu * 0.16) continue; const c = mau(q); if (kc2c(c, c0) > 85 * 85) { phu[o2] = { c, n: q.n / giu }; break; } }
    }
    if (net) { noiVien(out, W, H, toiO); cuuChiTiet(out, W, H, phu); }
    giamMau(out, o.soMau || 20, net);
    return { w: W, h: H, px: out };
  };
  // Nối viền: ô có chút nét tối nằm giữa hai ô viền đối diện (ngang, dọc, chéo) thì tô tối để đường viền không đứt.
  function noiVien(out, W, H, toiO) {
    const toi = (x, y) => x >= 0 && y >= 0 && x < W && y < H && out[y * W + x] && sang(out[y * W + x]) < 72;
    const them = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, t = toiO[i]; if (!out[i] || !t || t[0] < 0.12 || toi(x, y)) continue;
      if ((toi(x - 1, y) && toi(x + 1, y)) || (toi(x, y - 1) && toi(x, y + 1)) || (toi(x - 1, y - 1) && toi(x + 1, y + 1)) || (toi(x + 1, y - 1) && toi(x - 1, y + 1))) them.push([i, t[1]]);
    }
    for (const [i, c] of them) out[i] = c;
  }
  // Chi tiết nhỏ (mắt, chuông, nút áo) nhỏ hơn một ô thường bị màu nền của ô nuốt mất. Ô nào có màu thiểu số nổi bật mà
  // cả 8 ô quanh đó không có màu gần giống, và màu chính của ô vẫn còn ở ít nhất 3 ô bên cạnh (đổi cũng không mất mảng chính), thì lấy màu thiểu số.
  function cuuChiTiet(out, W, H, phu) {
    const goc = out.slice();
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, p = phu[i]; if (!p || !goc[i]) continue;
      if (sang(goc[i]) < 72 && p.n < 0.3) continue; // không phá viền tối
      let coRoi = false, giong = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue; const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
        const c = goc[yy * W + xx]; if (!c) continue;
        if (kc2c(c, p.c) < 45 * 45) coRoi = true;
        if (kc2c(c, goc[i]) < 30 * 30) giong++;
      }
      if (!coRoi && giong >= 3) out[i] = p.c;
    }
  }
  // Chi tiết sẽ mất ở cỡ hiện tại: so từng điểm ảnh gốc với điểm ảnh game phủ lên nó.
  // Trả về { mat: Uint8Array (1 = chỗ mất trên ảnh gốc), tiLe: phần trăm diện tích hình bị mất, cum: số mảng chi tiết mất đáng kể }.
  XS.chiTietMat = function (S, m, Rp, o) {
    const bb = XS.khung(m, S.w, S.h), mat = new Uint8Array(S.w * S.h);
    if (!bb || !Rp) return { mat, tiLe: 0, cum: 0 };
    const W = Rp.w, H = Rp.h, kx = bb.w / W, ky = bb.h / H;
    let giu = 0, mt = 0;
    for (let y = bb.y0; y <= bb.y1; y++) for (let x = bb.x0; x <= bb.x1; x++) {
      const k = y * S.w + x; if (!m[k]) continue; giu++;
      const i = Math.min(W - 1, Math.floor((x - bb.x0) / kx)), j = Math.min(H - 1, Math.floor((y - bb.y0) / ky));
      const c = Rp.px[j * W + (o && o.lat ? W - 1 - i : i)], s = S.px[k];
      if (sang(s) < 72) continue; // nét mực: viền do game vẽ lại, không tính là chi tiết
      if (!c || (kc2c(c, s) > 80 * 80)) { mat[k] = 1; mt++; }
    }
    // đếm mảng mất đáng kể (to bằng một ô trở lên)
    const nguong = Math.max(4, kx * ky), da = new Uint8Array(mat.length), q = new Int32Array(mat.length);
    let cum = 0;
    for (let s = 0; s < mat.length; s++) {
      if (!mat[s] || da[s]) continue;
      let qa = 0, qb = 0, n = 0; q[qb++] = s; da[s] = 1;
      while (qa < qb) { const i = q[qa++], x = i % S.w; n++; for (const j of [i - 1, i + 1, i - S.w, i + S.w]) { if (j < 0 || j >= mat.length || da[j] || !mat[j]) continue; if (Math.abs((j % S.w) - x) > 1) continue; da[j] = 1; q[qb++] = j; } }
      if (n >= nguong) cum++;
    }
    return { mat, tiLe: giu ? Math.round((mt / giu) * 100) : 0, cum };
  };
  // Giảm màu bằng k-means, khởi đầu từ các màu xa nhau nhất (kết quả cố định, không ngẫu nhiên).
  // giuGoc: mỗi màu đại diện lấy đúng một màu có thật trong hình (không tạo màu trung gian).
  function giamMau(px, k, giuGoc) {
    const dem = new Map();
    for (const c of px) if (c) dem.set(c, (dem.get(c) || 0) + 1);
    const mau = [...dem.keys()], so = mau.map((c) => dem.get(c));
    if (mau.length <= k) return;
    const P = mau.map((c) => [R(c), Gc(c), B(c)]);
    const kc2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
    let dau = 0; for (let i = 1; i < so.length; i++) if (so[i] > so[dau]) dau = i;
    const tam = [P[dau].slice()], gan = P.map((p) => kc2(p, tam[0]));
    while (tam.length < k) {
      let best = 0, bv = -1;
      for (let i = 0; i < P.length; i++) { const v = gan[i] * Math.sqrt(so[i]); if (v > bv) { bv = v; best = i; } }
      tam.push(P[best].slice());
      for (let i = 0; i < P.length; i++) gan[i] = Math.min(gan[i], kc2(P[i], tam[tam.length - 1]));
    }
    const gan2 = new Int32Array(P.length);
    for (let lan = 0; lan < 12; lan++) {
      const tong = tam.map(() => [0, 0, 0, 0]);
      for (let i = 0; i < P.length; i++) {
        let b = 0, bv = 1e18;
        for (let t = 0; t < tam.length; t++) { const v = kc2(P[i], tam[t]); if (v < bv) { bv = v; b = t; } }
        gan2[i] = b; const s = tong[b]; s[0] += P[i][0] * so[i]; s[1] += P[i][1] * so[i]; s[2] += P[i][2] * so[i]; s[3] += so[i];
      }
      for (let t = 0; t < tam.length; t++) if (tong[t][3]) tam[t] = [tong[t][0] / tong[t][3], tong[t][1] / tong[t][3], tong[t][2] / tong[t][3]];
    }
    if (giuGoc) for (let t = 0; t < tam.length; t++) { // kéo tâm về màu có thật gần nhất (ưu tiên màu nhiều điểm)
      let b = -1, bv = 1e18;
      for (let i = 0; i < P.length; i++) { if (gan2[i] !== t) continue; const v = kc2(P[i], tam[t]) / Math.sqrt(so[i]); if (v < bv) { bv = v; b = i; } }
      if (b >= 0) tam[t] = P[b].slice();
    }
    const doi = new Map();
    for (let i = 0; i < mau.length; i++) { const t = tam[gan2[i]]; doi.set(mau[i], rgba(Math.round(t[0]), Math.round(t[1]), Math.round(t[2]), 255)); }
    for (let i = 0; i < px.length; i++) if (px[i]) px[i] = doi.get(px[i]);
  }
  XS.giamMau = giamMau;

  // Thêm viền tối 1 điểm ảnh quanh hình (lên mảng mới rộng hơn 0 điểm: viền nằm trong khung đã chừa sẵn).
  // Chỉ viền MÉP NGOÀI: chỗ trống bị hình bao kín (lỗ nhỏ bên trong, khe giữa chi tiết) không bị tô viền đè lên.
  XS.themVien = function (px, w, h, mau, caLoTrong) {
    const out = px.slice(), ngoai = new Uint8Array(w * h);
    if (!caLoTrong) { // loang từ mép khung qua các điểm trống: điểm trống chạm được ra ngoài mới là "ngoài"
      const q = new Int32Array(w * h); let qa = 0, qb = 0;
      const vao = (i) => { if (!px[i] && !ngoai[i]) { ngoai[i] = 1; q[qb++] = i; } };
      for (let x = 0; x < w; x++) { vao(x); vao((h - 1) * w + x); }
      for (let y = 0; y < h; y++) { vao(y * w); vao(y * w + w - 1); }
      while (qa < qb) { const i = q[qa++], x = i % w, y = (i / w) | 0; if (x > 0) vao(i - 1); if (x < w - 1) vao(i + 1); if (y > 0) vao(i - w); if (y < h - 1) vao(i + w); }
    }
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x; if (px[i] || (!caLoTrong && !ngoai[i])) continue;
      if ((x > 0 && px[i - 1]) || (x < w - 1 && px[i + 1]) || (y > 0 && px[i - w]) || (y < h - 1 && px[i + w])) out[i] = mau;
    }
    return out;
  };
  // Nới khung thêm p điểm mỗi bên.
  XS.noi = function (px, w, h, p) {
    const W = w + 2 * p, H = h + 2 * p, out = new Uint32Array(W * H);
    for (let y = 0; y < h; y++) out.set(px.subarray(y * w, y * w + w), (y + p) * W + p);
    return { w: W, h: H, px: out };
  };
  // Đếm số màu khác nhau
  XS.soMau = (px) => { const s = new Set(); for (const c of px) if (c) s.add(c); return s.size; };

  // ---------- mã hoá gọn để lưu ----------
  XS.pngCua = (w, h, px) => XS.raCanvas(w, h, px).toDataURL('image/png');
  XS.docPng = async function (src) { const img = await XS.tuDataUrl(src); return XS.tuAnh(img, 100000); };
  // Mảng số nhỏ (0..255) -> chuỗi nén theo đoạn lặp "giá trị*số lần".
  XS.nenDoan = function (a) {
    const out = []; let i = 0;
    while (i < a.length) { let j = i; while (j < a.length && a[j] === a[i]) j++; out.push(a[i].toString(36) + (j - i > 1 ? '*' + (j - i).toString(36) : '')); i = j; }
    return out.join(',');
  };
  XS.moDoan = function (s, n) {
    const a = new Uint8Array(n); let k = 0;
    for (const p of String(s || '').split(',')) { if (!p) continue; const q = p.split('*'), v = parseInt(q[0], 36), c = q[1] ? parseInt(q[1], 36) : 1; for (let i = 0; i < c && k < n; i++) a[k++] = v; }
    return a;
  };
})();
