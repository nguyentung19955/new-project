// XƯỞNG SPRITE: Tự đoán bộ phận theo hình dáng và màu (thay cách cũ "điểm nào gần xương nào").
// Cách làm:
//  1. Lõi thân: bỏ các phần mảnh nhô ra khỏi hình (phép "mở" theo độ dày: điểm cách viền đủ xa mới là lõi).
//  2. Phần nhô ra: đám điểm ngoài lõi. Theo vị trí so với lõi: nhánh hai bên là tay, nhánh dưới là chân,
//     nhánh dài phía sau là đuôi, nhánh trên là cánh hoặc sừng...
//  3. Cổ: hàng (hoặc cột) hẹp nhất của lõi giữa đầu và thân. Không rõ chỗ thắt thì không tách đầu.
//  4. Màu: tay chân lan thêm vào các điểm cùng màu (găng, giày, quần) dính liền, khác màu áo chính.
//  5. Không chắc thì không tách (để dính thân, không cử động) và ghi tên bộ phận vào danh sách "Tô thêm cho đúng".
// Trả về { bo, khop, thieu: [mã bộ phận chưa đoán được], chac: {mã: 0..1}, cach: 'hinh' | 'xuong' }.
(function () {
  'use strict';
  const XS = (window.XS = window.XS || {});
  const MAU = XS.MAU;
  const SANG = (c) => (c & 255) * 0.3 + ((c >>> 8) & 255) * 0.59 + ((c >>> 16) & 255) * 0.11;
  const KC = (a, b) => Math.hypot((a & 255) - (b & 255), ((a >>> 8) & 255) - ((b >>> 8) & 255), ((a >>> 16) & 255) - ((b >>> 16) & 255));

  // khoảng cách (xấp xỉ Euclid, 3-4) từ mỗi điểm hình tới điểm trống gần nhất
  function khoangCach(m, w, h) {
    const d = new Float32Array(w * h), INF = 1e9;
    for (let i = 0; i < w * h; i++) d[i] = m[i] ? INF : 0;
    const v = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : d[y * w + x]);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (!d[i]) continue; d[i] = Math.min(d[i], v(x - 1, y) + 1, v(x, y - 1) + 1, v(x - 1, y - 1) + 1.414, v(x + 1, y - 1) + 1.414); }
    for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) { const i = y * w + x; if (!d[i]) continue; d[i] = Math.min(d[i], v(x + 1, y) + 1, v(x, y + 1) + 1, v(x + 1, y + 1) + 1.414, v(x - 1, y + 1) + 1.414); }
    return d;
  }
  // đám liền nhau (8 hướng) trong tập s; trả về danh sách mảng chỉ số
  function cacDam(s, w, h) {
    const da = new Uint8Array(w * h), ds = [], q = [];
    for (let i0 = 0; i0 < w * h; i0++) {
      if (!s[i0] || da[i0]) continue;
      const c = []; da[i0] = 1; q.length = 0; q.push(i0);
      while (q.length) { const i = q.pop(), x = i % w, y = (i / w) | 0; c.push(i); for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue; const j = yy * w + xx; if (s[j] && !da[j]) { da[j] = 1; q.push(j); } } }
      ds.push(c);
    }
    return ds;
  }
  const tam = (c, w) => { let sx = 0, sy = 0; for (const i of c) { sx += i % w + 0.5; sy += ((i / w) | 0) + 0.5; } return [sx / c.length, sy / c.length]; };
  const bao = (c, w) => { let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1; for (const i of c) { const x = i % w, y = (i / w) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } return { x0, y0, x1, y1, w: x1 - x0 + 1, h: y1 - y0 + 1 }; };
  // màu chính (không tính nét viền tối) của một tập điểm
  function mauChinh(R, ds, toi) {
    const dem = new Map();
    for (const i of ds) { const c = R.px[i]; if (!c || SANG(c) < (toi || 72)) continue; const k = ((c & 255) >> 5) | ((((c >>> 8) & 255) >> 5) << 3) | ((((c >>> 16) & 255) >> 5) << 6); const o = dem.get(k) || { n: 0, c }; o.n++; dem.set(k, o); }
    return [...dem.values()].sort((a, b) => b.n - a.n).map((o) => o.c);
  }

  // Phân tích chung: lõi, phần nhô, độ dày.
  function phanTich(R) {
    const w = R.w, h = R.h, n = w * h, m = new Uint8Array(n);
    let dt = 0; for (let i = 0; i < n; i++) if (R.px[i]) { m[i] = 1; dt++; }
    const d = khoangCach(m, w, h);
    let dMax = 0; for (let i = 0; i < n; i++) if (d[i] > dMax) dMax = d[i];
    // bán kính mở: phần nào mảnh hơn khoảng một nửa bề dày thân thì coi là nhô ra
    const r = Math.max(1, Math.min(8, Math.round(dMax * 0.5)));
    const loi = new Uint8Array(n);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (d[y * w + x] < r + 0.5) continue;
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { if (dx * dx + dy * dy > r * r + 0.5) continue; const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < w && yy < h && m[yy * w + xx]) loi[yy * w + xx] = 1; }
    }
    // lõi chỉ giữ đám lớn nhất (các đám lõi nhỏ là phần nhô dày như găng to)
    const dl = cacDam(loi, w, h).sort((a, b) => b.length - a.length);
    loi.fill(0); if (dl.length) for (const i of dl[0]) loi[i] = 1;
    const ngoai = new Uint8Array(n); for (let i = 0; i < n; i++) if (m[i] && !loi[i]) ngoai[i] = 1;
    const toiThieu = Math.max(3, Math.round(dt * 0.012));
    const nho = [];
    for (const c of cacDam(ngoai, w, h)) {
      if (c.length < toiThieu) { for (const i of c) loi[i] = 1; continue; }
      // điểm bám vào lõi
      const bam = c.filter((i) => { const x = i % w; return (x > 0 && loi[i - 1]) || (x < w - 1 && loi[i + 1]) || (i >= w && loi[i - w]) || (i < n - w && loi[i + w]); });
      let a;
      if (bam.length) a = tam(bam, w);
      else { // mảnh rời hẳn (đuôi vẽ tách thân): bám vào điểm lõi gần nhất
        let bv = 1e9; a = null;
        for (let j = 0; j < n; j++) { if (!loi[j]) continue; const xj = j % w + 0.5, yj = ((j / w) | 0) + 0.5; for (const i of c) { const dd = Math.hypot(i % w + 0.5 - xj, ((i / w) | 0) + 0.5 - yj); if (dd < bv) { bv = dd; a = [xj, yj]; } } }
        if (!a || bv > Math.max(4, Math.max(w, h) * 0.15)) continue; // xa quá: không phải bộ phận (vẫn đi theo thân như điểm chưa gán)
      } let xa = c[0], dxa = -1;
      for (const i of c) { const dd = Math.hypot(i % w + 0.5 - a[0], ((i / w) | 0) + 0.5 - a[1]); if (dd > dxa) { dxa = dd; xa = i; } }
      nho.push({ ds: c, bam: a, dinh: [xa % w + 0.5, ((xa / w) | 0) + 0.5], tam: tam(c, w), bao: bao(c, w), dai: dxa, n: c.length });
    }
    const bl = bao(dl.length ? dl[0] : [0], w);
    let cLoi = [0, 0], nl = 0; for (let i = 0; i < n; i++) if (loi[i]) { cLoi[0] += i % w + 0.5; cLoi[1] += ((i / w) | 0) + 0.5; nl++; }
    cLoi = nl ? [cLoi[0] / nl, cLoi[1] / nl] : [w / 2, h / 2];
    return { w, h, n, m, loi, d, dMax, r, nho, bl, cLoi, bb: XS.khungHinh(R), dt };
  }
  // Chỗ thắt (cổ): trong khoảng [a, b] của trục (hàng hoặc cột), nơi lõi hẹp nhất so với hai bên. Trả về vị trí hoặc null.
  function choThat(A, doc, a, b, phiaDau) {
    const { w, h, loi } = A, L = doc ? h : w, rong = new Float32Array(L);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (loi[y * w + x]) rong[doc ? y : x]++;
    const mm = (i) => (rong[Math.max(0, i - 1)] + rong[i] * 2 + rong[Math.min(L - 1, i + 1)]) / 4;
    a = Math.max(1, Math.round(a)); b = Math.min(L - 2, Math.round(b));
    let best = -1, bv = 1e9;
    for (let i = a; i <= b; i++) { const v = mm(i); if (v < bv - 0.01) { bv = v; best = i; } }
    if (best < 0) return null;
    // hai bên phải rộng hơn rõ rệt
    let dau = 0, than = 0;
    for (let i = 0; i < L; i++) { if (phiaDau(i, best)) dau = Math.max(dau, rong[i]); else than = Math.max(than, rong[i]); }
    if (bv > 0.82 * dau || bv > 0.92 * than) return null;
    return { vi: best, rong: bv };
  }
  // Cổ dự phòng khi lõi không thắt (mũ trùm liền áo, nhìn chính diện), theo thứ tự:
  //  1) hàng hẹp nhất của cả hình (không chỉ lõi) so với phần trên và phần dưới;
  //  2) mảng màu mặt (mảng sáng không phải màu áo chính, nằm ở nửa trên): cổ ngay dưới mặt, nhích thêm vành mũ;
  //  3) đầu chibi chiếm khoảng 42% chiều cao.
  function coDuPhong(R, A, rong, gau) {
    const { w, h, bb } = A, top = bb.y0, H = bb.h;
    let best = -1, bv = 1;
    for (let y = Math.round(top + H * 0.25); y <= Math.min(gau - 2, Math.round(top + H * 0.68)); y++) {
      let tren = 0, duoi = 0;
      for (let yy = top; yy < y; yy++) tren = Math.max(tren, rong[yy]);
      for (let yy = y + 1; yy <= Math.min(bb.y1, y + Math.round(H * 0.3)); yy++) duoi = Math.max(duoi, rong[yy]);
      const k = (rong[y - 1] + rong[y] * 2 + rong[y + 1]) / 4 / Math.max(1, Math.min(tren, duoi));
      if (k < bv - 0.01) { bv = k; best = y; }
    }
    if (best > 0 && bv < 0.86) return { y: best, chac: 0.6 };
    // mảng mặt
    const chinh = A.mauLoi || [], da = new Uint8Array(w * h); let mat = null;
    for (let s = 0; s < w * h; s++) {
      const c0 = R.px[s]; if (!c0 || da[s] || SANG(c0) < 110 || chinh.some((c) => KC(c, c0) < 55)) continue;
      const ds = [s]; da[s] = 1;
      for (let a = 0; a < ds.length; a++) { const i = ds[a], x = i % w; for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w]) if (j >= 0 && j < w * h && !da[j] && R.px[j] && SANG(R.px[j]) >= 110 && KC(R.px[j], c0) < 60) { da[j] = 1; ds.push(j); } }
      const b = bao(ds, w), t = tam(ds, w);
      if (ds.length < A.dt * 0.04 || t[1] > top + H * 0.5 || b.w < bb.w * 0.25) continue;
      if (!mat || ds.length > mat.n) mat = { n: ds.length, y1: b.y1 };
    }
    if (mat) return { y: Math.min(Math.round(top + H * 0.62), mat.y1 + 1 + Math.max(1, Math.round(H * 0.03))), chac: 0.6 };
    return { y: Math.round(top + H * 0.42), chac: 0.5 };
  }
  // Lan bộ phận k vào các điểm lõi cùng màu (găng, giày) dính liền, nếu màu đó khác màu chính của lõi.
  function lanMau(R, A, bo, k, ds, gioiHan) {
    const { w, h } = A, chinh = A.mauLoi;
    // màu của bộ phận: lấy cả các điểm sát bên (phần nhô nhỏ thường chỉ toàn nét viền), bỏ màu giống áo chính
    const quanh = new Set(ds);
    for (const i of ds) { const x = i % w, y = (i / w) | 0; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < w && yy < h && R.px[yy * w + xx]) quanh.add(yy * w + xx); } }
    const mauBo = mauChinh(R, [...quanh], 45).slice(0, 3).filter((c) => !chinh.some((c2) => KC(c, c2) < 55));
    if (!mauBo.length) return 0;
    const q = ds.slice(), da = new Uint8Array(w * h); for (const i of ds) da[i] = 1;
    let them = 0;
    const tm = tam(ds, w);
    while (q.length) {
      const i = q.shift(), x = i % w;
      for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w]) {
        if (j < 0 || j >= w * h || da[j] || !R.px[j]) continue; da[j] = 1;
        if (bo[j] !== A.boLoi) continue;
        const c = R.px[j], toi = SANG(c) < 45;
        if (!toi && !mauBo.some((c2) => KC(c, c2) < 40)) continue;
        if (Math.hypot(j % w + 0.5 - tm[0], ((j / w) | 0) + 0.5 - tm[1]) > gioiHan) continue;
        if (toi) { // nét viền: chỉ lấy nếu nằm sát điểm cùng màu bộ phận (viền của găng), không lan dọc viền áo
          let ke = 0; const xj = j % w; for (const t of [xj > 0 ? j - 1 : -1, xj < w - 1 ? j + 1 : -1, j - w, j + w]) if (t >= 0 && t < w * h && bo[t] === k) ke++;
          if (ke < 2) continue;
          bo[j] = k; them++; continue; // không lan tiếp từ nét viền
        }
        bo[j] = k; them++; q.push(j);
      }
    }
    return them;
  }
  const g = (p) => [p[0], p[1]];
  // Vùng màu khép kín bởi nét viền (ảnh AI, tranh nét đậm): đầu thường là một vùng riêng có viền bao quanh.
  // huong: 'phai' (đầu ở phía trước) hoặc 'tren'. Trả về danh sách điểm của đầu (vùng đó và các vùng nhỏ nằm trong khung của nó) hoặc null.
  function dauTheoVien(R, A, huong) {
    const { w, h, n } = A, s = new Uint8Array(n);
    for (let i = 0; i < n; i++) if (R.px[i] && SANG(R.px[i]) >= 60) s[i] = 1;
    const vung = [], da = new Uint8Array(n);
    for (let i0 = 0; i0 < n; i0++) { if (!s[i0] || da[i0]) continue; const c = [], q = [i0]; da[i0] = 1;
      while (q.length) { const i = q.pop(), x = i % w; c.push(i); for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w]) if (j >= 0 && j < n && s[j] && !da[j]) { da[j] = 1; q.push(j); } }
      vung.push({ ds: c, tam: tam(c, w), bao: bao(c, w) }); }
    const cx = A.cLoi[0], cy = A.cLoi[1];
    let best = null;
    for (const v of vung) {
      if (v.ds.length < A.dt * 0.08 || v.ds.length > A.dt * 0.55) continue;
      const lech = huong === 'phai' ? v.tam[0] - cx : cy - v.tam[1];
      if (lech < (huong === 'phai' ? A.bl.w : A.bl.h) * 0.12) continue;
      if (!best || lech > best.lech) best = Object.assign({ lech }, v);
    }
    if (!best) return null;
    const b = best.bao, out = best.ds.slice();
    for (const v of vung) if (v !== best && v.ds.length < best.ds.length && v.tam[0] >= b.x0 && v.tam[0] <= b.x1 + 1 && v.tam[1] >= b.y0 && v.tam[1] <= b.y1 + 1) out.push(...v.ds);
    // nét viền tối bên trong khung của đầu, sát điểm đầu
    const la = new Uint8Array(n); for (const i of out) la[i] = 1;
    for (let y = b.y0; y <= b.y1; y++) for (let x = b.x0; x <= b.x1; x++) { const i = y * w + x; if (!R.px[i] || la[i]) continue; if ((x > 0 && la[i - 1]) || (x < w - 1 && la[i + 1]) || (i >= w && la[i - w]) || (i < n - w && la[i + w])) out.push(i); }
    return out;
  }

  // ---------- từng mẫu ----------
  const DOAN = {};
  DOAN.nguoi = function (R, A, bo, id, khop, chac) {
    const { w, h, bb, loi } = A, top = bb.y0, H = bb.h, cx = A.cLoi[0];
    // chân: các hàng dưới cùng hẹp hẳn so với thân
    const rongM = new Float32Array(h), trai = new Float32Array(h).fill(1e9), phai = new Float32Array(h).fill(-1);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (R.px[y * w + x]) { rongM[y]++; trai[y] = Math.min(trai[y], x); phai[y] = Math.max(phai[y], x); }
    let thanMax = 0; for (let y = top + Math.round(H * 0.3); y <= bb.y1 - Math.round(H * 0.15); y++) { let rl = 0; for (let x = 0; x < w; x++) if (loi[y * w + x]) rl++; thanMax = Math.max(thanMax, rl); }
    let gau = bb.y1 + 1; // hàng đầu tiên của phần chân
    for (let y = bb.y1; y >= top + H * 0.55; y--) { if (rongM[y] <= Math.max(2, thanMax * 0.66)) gau = y; else break; }
    const caoChan = bb.y1 + 1 - gau;
    // cổ: chỗ thắt của lõi ở khoảng 20%..65% chiều cao
    const co = choThat(A, true, top + H * 0.2, Math.min(gau - 2, top + H * 0.68), (i, b) => i < b);
    const yCo = co ? co.vi : null;
    // tay: phần nhô ở hai bên, giữa cổ và gấu áo
    const yTren = yCo != null ? yCo : top + H * 0.3;
    const tay = { tayT: null, tayS: null };
    for (const p of A.nho) {
      if (p.tam[1] < yTren || p.tam[1] > gau + 0.5) continue;
      const ben = p.tam[0] >= cx ? 'tayT' : 'tayS';
      if (Math.abs(p.tam[0] - cx) < A.bl.w * 0.22) continue; // ngay giữa: không phải tay
      if (!tay[ben] || p.n > tay[ben].n) tay[ben] = p;
    }
    // nhánh dưới: gộp vào chân; còn lại (tai mũ, sừng...) đi theo chỗ chúng bám
    // 1) chân
    if (caoChan >= 2 && caoChan <= H * 0.45) {
      const ds = []; for (let y = gau; y <= bb.y1; y++) for (let x = 0; x < w; x++) if (R.px[y * w + x]) ds.push(y * w + x);
      // tách trái phải: cột trống ở giữa, nếu không có thì chia đôi tại giữa
      const cot = new Float32Array(w); for (const i of ds) cot[i % w]++;
      const bc = bao(ds, w); let chia = (bc.x0 + bc.x1 + 1) / 2, it = 1e9;
      for (let x = bc.x0 + 1; x < bc.x1; x++) { const v = cot[x] + Math.abs(x + 0.5 - chia) * 0.2; if (v < it) { it = v; chia = x + 0.5; } }
      const S = ds.filter((i) => i % w + 0.5 < chia), T = ds.filter((i) => i % w + 0.5 >= chia);
      const datChan = (ten, dd, hk, bk) => {
        if (dd.length < 2) return;
        for (const i of dd) bo[i] = id[ten];
        const b = bao(dd, w);
        khop[hk] = [(b.x0 + b.x1 + 1) / 2, gau - 0.5]; khop[bk] = [(b.x0 + b.x1 + 1) / 2, b.y1 + 1];
        chac[ten] = bc.w >= 3 ? 0.85 : 0.55;
      };
      if (S.length >= 2 && T.length >= 2) { datChan('chanS', S, 'hongS', 'banS'); datChan('chanT', T, 'hongT', 'banT'); }
      else { datChan('chanT', ds, 'hongT', 'banT'); }
    }
    // 2) đầu
    if (yCo != null) {
      for (let y = top; y < yCo; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (R.px[i] && bo[i] === id.than) bo[i] = id.dau; }
      // hàng cổ: điểm lõi thuộc thân; phần nhô phía trên cổ (tai mũ) theo đầu
      for (const p of A.nho) if (p.tam[1] < yCo) for (const i of p.ds) if (bo[i] === id.than) bo[i] = id.dau;
      khop.co = [cx, yCo]; khop.dinh = [cx, top]; chac.dau = 0.85;
    } else {
      const dd = dauTheoVien(R, A, 'tren');
      if (dd) { let y1 = 0; for (const i of dd) if (bo[i] === id.than) { bo[i] = id.dau; y1 = Math.max(y1, (i / w) | 0); } khop.co = [cx, y1 + 1]; khop.dinh = [cx, top]; chac.dau = 0.65; }
      else { // mũ trùm liền áo, nhìn chính diện: không có cổ thắt rõ
        const c2 = coDuPhong(R, A, rongM, gau);
        for (let y = top; y < c2.y; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (R.px[i] && bo[i] === id.than) bo[i] = id.dau; }
        khop.co = [cx, c2.y]; khop.dinh = [cx, top]; chac.dau = c2.chac;
      }
    }
    // 3) tay
    for (const ben of ['tayT', 'tayS']) {
      const p = tay[ben]; if (!p) continue;
      for (const i of p.ds) bo[i] = id[ben];
      lanMau(R, A, bo, id[ben], p.ds, Math.max(3, p.dai * 1.6));
      const ds = []; for (let i = 0; i < bo.length; i++) if (bo[i] === id[ben]) ds.push(i);
      const b = bao(ds, w);
      // khớp vai: hàng trên cùng của tay, lệch vào phía thân
      let sx = 0, sn = 0; for (const i of ds) if (((i / w) | 0) === b.y0) { sx += i % w + 0.5; sn++; }
      const vai = [sx / sn + (ben === 'tayT' ? -0.5 : 0.5), b.y0 + 0.2];
      let xa = vai, dxa = -1; for (const i of ds) { const q = [i % w + 0.5, ((i / w) | 0) + 0.5], dd = Math.hypot(q[0] - vai[0], q[1] - vai[1]); if (dd > dxa) { dxa = dd; xa = q; } }
      khop[ben === 'tayT' ? 'vaiT' : 'vaiS'] = vai; khop[ben] = xa;
      chac[ben] = p.n >= 6 ? 0.8 : 0.6;
    }
    khop.hong = [cx, Math.min(gau, bb.y1) - 0.5]; khop.chan = [(bb.x0 + bb.x1 + 1) / 2, bb.y1 + 1];
    chac.than = 1;
  };
  DOAN.bonChan = function (R, A, bo, id, khop, chac) {
    const { w, bb } = A, cx = A.cLoi[0], cy = A.cLoi[1];
    const chan = [], khac = [];
    for (const p of A.nho) {
      if (p.bao.y1 >= bb.y1 - 1 && p.tam[1] > cy && p.bao.h >= 2) chan.push(p); else khac.push(p);
    }
    // tách đám chân quá rộng (hai chân dính nhau): theo khe giữa hai chân ở nửa dưới, không có khe thì chia đôi nếu đám bè ngang
    const ds = [];
    for (const p of chan) {
      const b = p.bao, la = new Uint8Array(A.n); for (const i of p.ds) la[i] = 1;
      let gx = null;
      for (let y = b.y1; y >= b.y0 + b.h * 0.4 && gx == null; y--) {
        let x = b.x0; while (x <= b.x1 && !la[y * w + x]) x++;
        while (x <= b.x1 && la[y * w + x]) x++;
        const k0 = x; while (x <= b.x1 && !la[y * w + x]) x++;
        if (x <= b.x1 && x > k0) gx = (k0 + x) / 2;
      }
      if (gx == null && b.w >= 5 && b.w >= b.h * 0.75) gx = (b.x0 + b.x1 + 1) / 2;
      if (gx != null) { const a1 = p.ds.filter((i) => i % w + 0.5 < gx), a2 = p.ds.filter((i) => i % w + 0.5 >= gx); for (const a of [a1, a2]) if (a.length >= 2) ds.push({ ds: a, tam: tam(a, w), bao: bao(a, w) }); }
      else ds.push({ ds: p.ds, tam: p.tam, bao: p.bao });
    }
    // chân còn dính đôi (rộng gấp đôi chân đã tách được): chia đôi
    const hep = ds.filter((p) => p.bao.w >= 2).map((p) => p.bao.w), rongChan = hep.length ? Math.min(...hep) : 0;
    for (let k = ds.length - 1; k >= 0 && ds.length < 4; k--) {
      const p = ds[k], b = p.bao; if (!rongChan || b.w < rongChan * 1.7 || b.w < 4) continue;
      const gx = (b.x0 + b.x1 + 1) / 2, a1 = p.ds.filter((i) => i % w + 0.5 < gx), a2 = p.ds.filter((i) => i % w + 0.5 >= gx);
      if (a1.length >= 2 && a2.length >= 2) ds.splice(k, 1, { ds: a1, tam: tam(a1, w), bao: bao(a1, w) }, { ds: a2, tam: tam(a2, w), bao: bao(a2, w) });
    }
    ds.sort((a, b) => a.tam[0] - b.tam[0]);
    // kéo chân lên trong lõi: các hàng phía trên còn hẹp cỡ chân thì vẫn là chân (tới chỗ bụng rộng ra)
    for (const p of ds) {
      const b = p.bao, rong = b.w, tran = Math.max(0, Math.round(b.y0 - b.h * 1.2));
      for (let y = b.y0 - 1; y >= tran; y--) {
        // đoạn liền trong hàng y chứa cột giữa chân
        const xm = Math.floor((b.x0 + b.x1 + 1) / 2); if (!R.px[y * w + xm]) break;
        let a = xm, e = xm; while (a > 0 && R.px[y * w + a - 1]) a--; while (e < w - 1 && R.px[y * w + e + 1]) e++;
        if (e - a + 1 > rong * 1.6 + 2) break;
        for (let x = Math.max(a, b.x0); x <= Math.min(e, b.x1); x++) { const i = y * w + x; if (bo[i] === A.boLoi) { p.ds.push(i); } }
        b.y0 = y;
      }
    }
    ds.sort((a, b) => a.tam[0] - b.tam[0]);
    const truoc = ds.filter((p) => p.tam[0] >= cx), sau = ds.filter((p) => p.tam[0] < cx);
    const dat = (nhom, gan, xa, kg, kbg, kx, kbx) => {
      const ten = nhom.length >= 2 ? [[xa, kx, kbx, nhom[0]], [gan, kg, kbg, nhom[nhom.length - 1]]] : nhom.length ? [[gan, kg, kbg, nhom[0]]] : [];
      for (const [t, ka, kb, p] of ten) { for (const i of p.ds) bo[i] = id[t]; khop[ka] = [(p.bao.x0 + p.bao.x1 + 1) / 2, p.bao.y0]; khop[kb] = [(p.bao.x0 + p.bao.x1 + 1) / 2, p.bao.y1 + 1]; chac[t] = 0.85; }
    };
    dat(truoc.slice(-2), 'chanTN', 'chanTX', 'vaiN', 'banTN', 'vaiX', 'banTX');
    dat(sau.slice(0, 2), 'chanSN', 'chanSX', 'hongN', 'banSN', 'hongX', 'banSX');
    // đuôi: phần nhô phía sau (bên trái lõi), không phải chân
    let duoi = null;
    for (const p of khac) if (p.tam[0] < A.bl.x0 + A.bl.w * 0.25 && (!duoi || p.n > duoi.n)) duoi = p;
    if (duoi) { for (const p of khac) if (p.tam[0] < A.bl.x0 + A.bl.w * 0.25) for (const i of p.ds) bo[i] = id.duoi; khop.goc = g(duoi.bam); khop.duoi = g(duoi.dinh); chac.duoi = 0.85; }
    // đầu: chỗ thắt theo cột ở nửa trước
    const co = choThat(A, false, cx, A.bl.x1 - 2, (i, b) => i > b);
    if (co) {
      for (let i = 0; i < bo.length; i++) if (R.px[i] && bo[i] === id.than && i % w > co.vi) bo[i] = id.dau;
      for (const p of khac) if (p !== duoi && p.bam[0] > co.vi) for (const i of p.ds) bo[i] = id.dau;
      khop.co = [co.vi + 0.5, cy]; khop.mui = [bb.x1 + 1, cy - A.bl.h * 0.1]; chac.dau = 0.8;
    } else {
      const dd = dauTheoVien(R, A, 'phai');
      if (dd) { let x0 = 1e9; for (const i of dd) if (bo[i] === id.than) { bo[i] = id.dau; x0 = Math.min(x0, i % w); }
        for (const p of khac) if (p !== duoi && bo[p.ds[0]] === id.than && p.bam[0] > x0 + 1) for (const i of p.ds) bo[i] = id.dau;
        khop.co = [x0, cy]; khop.mui = [bb.x1 + 1, cy - A.bl.h * 0.1]; chac.dau = 0.65; }
    }
    khop.hong = [A.bl.x0 + A.bl.w * 0.25, cy]; khop.vai = [A.bl.x0 + A.bl.w * 0.75, cy];
    khop.chan = [(bb.x0 + bb.x1 + 1) / 2, bb.y1 + 1]; chac.than = 1;
  };
  DOAN.bay = function (R, A, bo, id, khop, chac) {
    const { w, bb } = A, cx = A.cLoi[0], cy = A.cLoi[1];
    const tren = A.nho.filter((p) => p.bam[1] <= cy && p.tam[1] < A.bl.y0 + A.bl.h * 0.35).sort((a, b) => b.n - a.n);
    const sau = A.nho.filter((p) => !tren.includes(p) && p.tam[0] < A.bl.x0 + A.bl.w * 0.2).sort((a, b) => b.n - a.n);
    if (tren[0]) { const p = tren[0]; for (const i of p.ds) bo[i] = id.canhN; khop.vaiN = g(p.bam); khop.canhN = g(p.dinh); chac.canhN = 0.85; }
    if (tren[1]) { const p = tren[1]; for (const i of p.ds) bo[i] = id.canhX; khop.vaiX = g(p.bam); khop.canhX = g(p.dinh); chac.canhX = 0.75; }
    if (sau[0]) { const p = sau[0]; for (const q of sau) for (const i of q.ds) bo[i] = id.duoi; khop.goc = g(p.bam); khop.duoi = g(p.dinh); chac.duoi = 0.85; }
    const co = choThat(A, false, cx, A.bl.x1 - 2, (i, b) => i > b);
    if (co) { for (let i = 0; i < bo.length; i++) if (R.px[i] && bo[i] === id.than && i % w > co.vi) bo[i] = id.dau; khop.nguc = [co.vi + 0.5, cy]; khop.mui = [bb.x1 + 1, cy]; chac.dau = 0.8; }
    else { const dd = dauTheoVien(R, A, 'phai'); if (dd) { let x0 = 1e9; for (const i of dd) if (bo[i] === id.than) { bo[i] = id.dau; x0 = Math.min(x0, i % w); } khop.nguc = [x0, cy]; khop.mui = [bb.x1 + 1, cy]; chac.dau = 0.65; } }
    khop.lung = [A.bl.x0 + A.bl.w * 0.3, cy]; if (!chac.dau) khop.nguc = [A.bl.x0 + A.bl.w * 0.72, cy];
    khop.chan = [(bb.x0 + bb.x1 + 1) / 2, bb.y1 + 1]; chac.than = 1;
  };
  DOAN.mem = function (R, A, bo, id, khop, chac) {
    const { w, bb } = A, cx = A.cLoi[0];
    const yGiua = A.bl.y0 + A.bl.h * 0.5;
    for (const ben of ['tuaT', 'tuaS']) {
      let best = null;
      for (const p of A.nho) { if (p.tam[1] < yGiua - A.bl.h * 0.1) continue; if ((ben === 'tuaT') !== (p.tam[0] > cx)) continue; if (Math.abs(p.tam[0] - cx) < A.bl.w * 0.3) continue; if (!best || p.n > best.n) best = p; }
      if (best) { for (const i of best.ds) bo[i] = id[ben]; khop[ben === 'tuaT' ? 'vaiT' : 'vaiS'] = g(best.bam); khop[ben] = g(best.dinh); chac[ben] = 0.8; }
    }
    // phần trên: lõi phía trên giữa (độ cong nhún), cùng các thứ nhô lên trên (sừng)
    for (let i = 0; i < bo.length; i++) if (R.px[i] && bo[i] === id.than && ((i / w) | 0) < yGiua) bo[i] = id.dinh;
    for (const p of A.nho) if (p.tam[1] < yGiua && bo[p.ds[0]] !== id.tuaT && bo[p.ds[0]] !== id.tuaS) for (const i of p.ds) bo[i] = id.dinh;
    khop.giua = [cx, yGiua]; khop.dinh = [cx, bb.y0]; khop.day = [cx, bb.y1 + 1]; khop.chan = [(bb.x0 + bb.x1 + 1) / 2, bb.y1 + 1];
    chac.dinh = 0.7; chac.than = 1;
  };
  DOAN.cua = function (R, A, bo, id, khop, chac) {
    const { bb } = A, cx = A.cLoi[0], cy = A.cLoi[1];
    const duoi = A.nho.filter((p) => p.tam[1] > cy && p.bao.y1 >= bb.y1 - 1), tren = A.nho.filter((p) => !duoi.includes(p) && p.tam[1] <= cy + A.bl.h * 0.15);
    for (const [ten, phai, k0, k1] of [['chanA', true, 'chanA0', 'chanA1'], ['chanB', false, 'chanB0', 'chanB1']]) {
      const ds = duoi.filter((p) => (p.tam[0] >= cx) === phai); if (!ds.length) continue;
      for (const p of ds) for (const i of p.ds) bo[i] = id[ten];
      const p = ds.sort((a, b) => b.n - a.n)[0]; khop[k0] = g(p.bam); khop[k1] = g(p.dinh); chac[ten] = 0.8;
    }
    for (const [ten, phai, k0, k1] of [['cangT', true, 'gocT', 'cangT'], ['cangS', false, 'gocS', 'cangS']]) {
      const p = tren.filter((q) => (q.tam[0] >= cx) === phai).sort((a, b) => b.n - a.n)[0]; if (!p) continue;
      for (const i of p.ds) bo[i] = id[ten]; khop[k0] = g(p.bam); khop[k1] = g(p.dinh); chac[ten] = 0.8;
    }
    khop.tamS = [A.bl.x0 + A.bl.w * 0.3, cy]; khop.tamT = [A.bl.x0 + A.bl.w * 0.7, cy]; khop.chan = [(bb.x0 + bb.x1 + 1) / 2, bb.y1 + 1]; chac.than = 1;
  };

  XS._phanTich = (R) => phanTich(R);
  XS.tuDoanHinh = function (R, mau) {
    const M = MAU[mau], khopMau = XS.datKhop(R, mau);
    const idx = {}; M.bo.forEach((b, k) => { idx[b.id] = k; });
    const goc = idx[XS.boGoc(mau)];
    const ketQua = (bo, khop, chac, cach) => {
      const thieu = M.bo.filter((b) => !(chac[b.id] > 0)).map((b) => b.id);
      return { bo, khop, chac, thieu, cach };
    };
    const A = R && R.w >= 6 && R.h >= 6 ? phanTich(R) : null;
    if (!A || !DOAN[mau] || !A.bb) { // mẫu rắn, cây: chia theo xương như cũ (hình dài, ít nhánh rõ)
      const bo = XS.tuDoan(R, mau, khopMau), chac = {}; for (const b of M.bo) chac[b.id] = 0.6; chac[M.bo[goc].id] = 1;
      return ketQua(bo, khopMau, chac, 'xuong');
    }
    const bo = new Uint8Array(R.w * R.h).fill(255);
    for (let i = 0; i < bo.length; i++) if (R.px[i]) bo[i] = goc;
    A.boLoi = goc;
    const lo = []; for (let i = 0; i < bo.length; i++) if (A.loi[i]) lo.push(i);
    A.mauLoi = mauChinh(R, lo).slice(0, 2);
    const khop = {}; for (const k in khopMau) khop[k] = khopMau[k].slice();
    const chac = {};
    DOAN[mau](R, A, bo, idx, khop, chac);
    // dọn: điểm thân bị kẹp giữa một bộ phận (3 trong 4 điểm quanh nó thuộc bộ phận đó) thì theo bộ phận đó
    for (let lan = 0; lan < 2; lan++) for (let i = 0; i < bo.length; i++) {
      if (bo[i] !== goc) continue; const x = i % R.w, dem = {};
      for (const j of [x > 0 ? i - 1 : -1, x < R.w - 1 ? i + 1 : -1, i - R.w, i + R.w]) { if (j < 0 || j >= bo.length || bo[j] === 255 || bo[j] === goc) continue; dem[bo[j]] = (dem[bo[j]] || 0) + 1; }
      for (const k in dem) if (dem[k] >= 3) bo[i] = +k;
    }
    // bộ phận quá nhỏ (dưới 2 điểm) thì bỏ, trả về thân
    for (const b of M.bo) {
      const k = idx[b.id]; if (k === goc) continue;
      let dem = 0; for (let i = 0; i < bo.length; i++) if (bo[i] === k) dem++;
      if (dem && dem < 2) { for (let i = 0; i < bo.length; i++) if (bo[i] === k) bo[i] = goc; delete chac[b.id]; }
      if (!dem) delete chac[b.id];
    }
    // bộ phận có cha không phải thân gốc (ví dụ rắn) không có ở đây; bộ phận cha bị thiếu thì con theo thân (ổn: con vẫn cử động theo khớp)
    return ketQua(bo, khop, chac, 'hinh');
  };
})();
