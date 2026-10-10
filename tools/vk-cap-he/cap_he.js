// MẪU (chưa đưa vào game): ngoại hình vũ khí ảnh AI theo CẤP HỆ (giai đoạn 1 Nhiễm, 2 Cường hoá, 3 Thức tỉnh).
// Ý chính: KHÔNG phủ màu đều cả lưỡi. Tự tìm vùng lưỡi / mũi / mặt búa / thân cung trên ảnh, rồi thêm từng lớp theo cấp:
//   cấp 1: chấm màu hệ ở rãnh giữa, đầu mũi, vài điểm sáng
//   cấp 2: dải màu hệ dọc mép lưỡi (có chọn lọc) + vân năng lượng chạy dọc rãnh + lõi sáng
//   cấp 3: họa tiết riêng của hệ (Lửa: ngọn lửa bám mép; Băng: mấu tinh thể; Độc: vân rễ + giọt nọc) + thân ửng màu hệ
// Mọi thứ tính theo điểm ảnh THẬT của ảnh (net 2), màu phẳng, không mờ, không chuyển màu mịn.
// Đầu ra là một "sprite dẫn xuất" cùng dạng sprite vũ khí của js/sprite_custom.js (px, pw, ph, net, vk.cam/mui/day đã dời theo lề),
// nên vẽ bằng chính SC.veVuKhi / SC.xoayVk (giữ nguyên điểm cầm, góc, nhớ đệm theo góc). Không tạo canvas mỗi khung.
// Phiên sau: chép khối này vào sprite_custom.js, SC.timVuKhi trả sprite dẫn xuất khi món có hệ (thay cho pxHe nhuộm đều).
(function () {
  'use strict';
  const G = (typeof window !== 'undefined') ? (window.G = window.G || {}) : (globalThis.G = globalThis.G || {});
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const fr = (v) => v - Math.floor(v);
  const hash = (n) => fr(Math.sin(n * 12.9898 + 4.1) * 43758.5453);
  const rgb = (col) => { const n = parseInt(col.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const hex = (r, g, b) => '#' + ((1 << 24) | (clamp(Math.round(r), 0, 255) << 16) | (clamp(Math.round(g), 0, 255) << 8) | clamp(Math.round(b), 0, 255)).toString(16).slice(1);
  const lum = (c) => { const o = rgb(c); return (0.3 * o[0] + 0.59 * o[1] + 0.11 * o[2]) / 255; };
  const mix = (a, b, t) => { const A = rgb(a), B = rgb(b); return hex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); };

  // ---------- DỮ LIỆU ----------
  // Bảng màu theo hệ (đối chiếu G.weaponArt.ELP: toi = B[0], co = B[1], nhan = B[2], vien = ol, loi = hot).
  //   co: màu cơ bản; nhan: màu nhấn; loi: lõi sáng; vien: viền họa tiết; phu: màu phụ (Độc pha tím).
  const PAL = {
    fire: { toi: '#8a1c12', co: '#e8492a', nhan: '#ffb347', loi: '#fff0b0', sang: '#ffc64c', vien: '#4a1010', hat: ['#fff0b0', '#ffb347', '#ff8a3a'] },
    ice: { toi: '#2f62ad', co: '#7fc4f2', nhan: '#bfe9ff', loi: '#ffffff', sang: '#eafcff', vien: '#1c3a70', hat: ['#ffffff', '#bfe9ff', '#9fd0f5'] },
    poison: { toi: '#1d5a2a', co: '#49a83c', nhan: '#b5ea6a', loi: '#e6f58a', sang: '#b5ea6a', vien: '#12331a', phu: '#6b3a8f', phuToi: '#3d1d55', phuSang: '#a56fd0', hat: ['#b5ea6a', '#a56fd0', '#8fd070'] },
  };
  // Theo CẤP (1..3): mức phủ, cường độ, hạt. bang: bề rộng dải màu hệ ở mép (điểm ảnh thật); than: độ ửng màu hệ của thân lưỡi (0..1).
  const CAP = {
    1: { ten: 'Nhiễm', bang: 0, than: 0, van: 'cham', diemSang: 3, hoaTiet: false, hat: 2 },
    2: { ten: 'Cường hoá', bang: 2, than: 0, van: 'lien', diemSang: 4, hoaTiet: false, hat: 3 },
    3: { ten: 'Thức tỉnh', bang: 3, than: 0.35, van: 'song', diemSang: 5, hoaTiet: true, hat: 5 },
  };
  // Theo LOẠI: vùng nhận màu hệ và chỗ ưu tiên.
  //  t0, t1: đoạn dọc thân (0 = điểm cầm, 1 = mũi) được coi là lưỡi / đầu; vanT0: vân năng lượng bắt đầu từ đâu;
  //  canh: mép đặt họa tiết (-1 mép trên ảnh, 1 mép dưới, 0 cả hai); doc: 'ngang' = cắt lát theo thân cung (cung dựng đứng);
  //  muiT: từ đâu coi là đầu mũi / đầu cung / mặt búa.
  const LOAI = {
    sword: { t0: 0.34, t1: 1, vanT0: 0.42, vanT1: 0.9, canh: -1, muiT: 0.9 },
    spear: { t0: 0.66, t1: 1, vanT0: 0.18, vanT1: 0.95, canh: 0, muiT: 0.86, vanThan: true },
    hammer: { t0: 0.55, t1: 1, vanT0: 0.6, vanT1: 0.97, canh: 0, muiT: 0.86 },
    bow: { t0: 0.22, t1: 1, vanT0: 0.25, vanT1: 0.92, canh: 1, muiT: 0.82, doc: 'ngang' },
  };
  const LE = 3; // lề quanh ảnh (điểm ảnh game) để họa tiết nhô ra ngoài thân

  // ---------- ĐO THÂN (một lần mỗi ảnh) ----------
  function doThan(sp) {
    if (sp._cap) return sp._cap;
    const V = sp.vk, N = sp.net || 1, pw = sp.pw, ph = sp.ph, px = sp.px, L = LOAI[V.loai];
    const th = Math.atan2(V.mui[1] - V.cam[1], V.mui[0] - V.cam[0]), ct = Math.cos(th), st = Math.sin(th);
    const ngang = L.doc === 'ngang';
    // trục cắt lát (A) và pháp tuyến (Nm), theo toạ độ game
    const A = ngang ? [-st, ct] : [ct, st], Nm = ngang ? [ct, st] : [-st, ct];
    const n = pw * ph, S = new Float32Array(n), Q = new Float32Array(n), a = new Float32Array(n), L0 = new Float32Array(n);
    let mx = 1e-6, mn = 1e-6;
    for (let j = 0; j < ph; j++) for (let i = 0; i < pw; i++) {
      const k = j * pw + i; if (!px[k]) continue;
      const u = (i + 0.5) / N - V.cam[0], v = (j + 0.5) / N - V.cam[1];
      S[k] = u * A[0] + v * A[1]; Q[k] = u * Nm[0] + v * Nm[1]; L0[k] = lum(px[k]);
      if (S[k] > mx) mx = S[k]; if (S[k] < mn) mn = S[k];
    }
    for (let k = 0; k < n; k++) if (px[k]) a[k] = ngang ? Math.abs(S[k]) / Math.max(mx, -mn) : S[k] / mx;
    const rong = (i, j) => i < 0 || j < 0 || i >= pw || j >= ph || !px[j * pw + i];
    const vung = new Uint8Array(n), toi = new Uint8Array(n), bien = new Uint8Array(n);
    // lát theo trục (mỗi lát = 1 điểm ảnh thật): mép trên / dưới, giữa
    const lat = new Map(), bk = new Int32Array(n);
    const lums = [];
    for (let j = 0; j < ph; j++) for (let i = 0; i < pw; i++) {
      const k = j * pw + i; if (!px[k]) continue;
      if (rong(i - 1, j) || rong(i + 1, j) || rong(i, j - 1) || rong(i, j + 1)) bien[k] = 1;
      toi[k] = L0[k] < 0.2 ? 1 : 0;
      if (a[k] < L.t0 || a[k] > L.t1 + 0.01) continue;
      vung[k] = 1;
      const b = Math.round(S[k] * N); bk[k] = b;
      let o = lat.get(b); if (!o) lat.set(b, (o = { qmin: 1e9, qmax: -1e9 }));
      if (Q[k] < o.qmin) o.qmin = Q[k]; if (Q[k] > o.qmax) o.qmax = Q[k];
      if (!toi[k]) lums.push(L0[k]);
    }
    lums.sort((x, y) => x - y);
    const lo = lums.length ? lums[Math.floor(lums.length * 0.1)] : 0.3, hi = lums.length ? lums[Math.floor(lums.length * 0.9)] : 0.8;
    // trên trục: điểm ảnh rãnh giữa, khoảng cách tới mép trên / dưới (điểm ảnh thật)
    const dT = new Float32Array(n), dD = new Float32Array(n), giua = new Float32Array(n);
    for (let k = 0; k < n; k++) if (vung[k]) {
      const o = lat.get(bk[k]), m = (o.qmin + o.qmax) / 2;
      dT[k] = (Q[k] - o.qmin) * N; dD[k] = (o.qmax - Q[k]) * N; giua[k] = (Q[k] - m) * N;
    }
    // các điểm mép (trên, dưới) theo lát, để đặt họa tiết và hạt
    const mepT = [], mepD = [];
    for (const [b, o] of lat) { mepT.push([b, o.qmin]); mepD.push([b, o.qmax]); }
    mepT.sort((x, y) => x[0] - y[0]); mepD.sort((x, y) => x[0] - y[0]);
    return (sp._cap = { N, A, Nm, S, Q, a, vung, toi, bien, dT, dD, giua, bk, lat, lo, hi, mepT, mepD, mx, mn, ngang });
  }

  // ---------- TẠO SPRITE DẪN XUẤT ----------
  // khung: 0/1 (họa tiết động 2 khung ở cấp 3: lửa lay, giọt nọc dài ngắn). Nhớ trên sp._capSp.
  function taoSprite(sp, el, cap, khung) {
    cap = clamp(cap | 0, 1, 3); khung = cap >= 3 ? (khung | 0) & 1 : 0;
    const key = el + cap + '|' + khung; sp._capSp = sp._capSp || {};
    if (sp._capSp[key]) return sp._capSp[key];
    const H = doThan(sp), V = sp.vk, N = H.N, pw = sp.pw, ph = sp.ph, P = LE * N, W = pw + 2 * P, Hh = ph + 2 * P;
    const E = PAL[el], C = CAP[cap], L = LOAI[V.loai], src = sp.px, out = new Array(W * Hh).fill(null);
    for (let j = 0; j < ph; j++) for (let i = 0; i < pw; i++) out[(j + P) * W + i + P] = src[j * pw + i];
    const dat = (i, j, col, de) => { // de: được ghi đè lên thân
      i += P; j += P; if (i < 0 || j < 0 || i >= W || j >= Hh) return;
      const k = j * W + i; if (!de && out[k]) return; out[k] = col;
    };
    const ramp = (k) => { // độ sáng tương đối trong lưỡi -> 3 tông phẳng của hệ (giữ khối sáng tối)
      const l = clamp((lum(src[k]) - H.lo) / (H.hi - H.lo + 1e-6), 0, 1);
      return l < 0.3 ? E.toi : l < 0.7 ? E.co : E.nhan;
    };
    const keep = (k) => H.toi[k] || src[k] === '#1b1118'; // nét tối, viền, mắt: giữ nguyên
    const inVan = (k) => H.a[k] >= L.vanT0 && H.a[k] <= L.vanT1;
    const canhOK = (side) => L.canh === 0 || L.canh === side;
    for (let j = 0; j < ph; j++) for (let i = 0; i < pw; i++) {
      const k = j * pw + i; if (!src[k]) continue;
      const vanThan = L.vanThan && !H.vung[k] && H.a[k] >= L.vanT0 && H.a[k] < L.t0; // giáo: vân dọc cán
      if (!H.vung[k] && !vanThan) continue;
      if (keep(k)) continue;
      const b = Math.round(H.S[k] * N);
      let col = null;
      if (H.vung[k]) {
        // thân lưỡi ửng màu hệ (cấp 3), pha theo tông phẳng
        if (C.than > 0) col = mix(src[k], ramp(k), C.than);
        // dải màu hệ dọc mép
        const dm = Math.min(canhOK(-1) ? H.dT[k] : 99, canhOK(1) ? H.dD[k] : 99);
        if (C.bang && dm <= C.bang + 0.5 && dm >= 0.5) col = ramp(k);
        // đầu mũi / mặt búa / đầu cung
        if (H.a[k] >= L.muiT) col = cap === 1 ? (H.a[k] >= L.muiT + (1 - L.muiT) * 0.5 ? E.nhan : col) : ramp(k);
      }
      // vân năng lượng dọc rãnh giữa
      if (inVan(k) || vanThan) {
        const g = H.ngang && !H.vung[k] ? 99 : (H.vung[k] ? H.giua[k] : giuaThan(H, k, N));
        if (C.van === 'cham') { if (Math.abs(g) < 0.6 && (b >> 1) % 3 === 0) col = E.co; }
        else if (C.van === 'lien') {
          if (Math.abs(g) < 0.6) col = (b % 4 === 0) ? E.co : E.loi;
          else if (Math.abs(g) < 1.6 && (b >> 1) % 2 === 0 && !vanThan) col = E.co;
        } else {
          const z = Math.round(Math.sin(b * 0.55) * 1.4); // vân sóng (từng bậc điểm ảnh)
          if (Math.abs(g) < 0.6) col = E.loi;
          else if (Math.abs(g - z) < 0.6 && !vanThan) col = E.nhan;
          else if (Math.abs(g) < 1.6) col = E.co;
        }
      }
      if (col) out[(j + P) * W + i + P] = col;
    }
    // điểm sáng (cố định) trên mép lưỡi
    const mep = (L.canh >= 0 ? H.mepD : H.mepT);
    if (mep.length) for (let s = 0; s < C.diemSang; s++) {
      const m = mep[Math.floor((0.25 + 0.7 * hash(s + V.dong * 3)) * (mep.length - 1))];
      const p = diemTu(H, V, m[0] / N, m[1] + (L.canh >= 0 ? -1.5 : 1.5) / N);
      const i = Math.floor(p[0] * N), j = Math.floor(p[1] * N);
      if (i >= 0 && j >= 0 && i < pw && j < ph && src[j * pw + i] && !keep(j * pw + i)) dat(i, j, E.loi, true);
    }
    if (C.hoaTiet) hoaTiet(el, H, V, L, E, dat, src, pw, ph, khung, keep);
    const dv = (p) => (p ? [p[0] + LE, p[1] + LE] : p);
    const sp2 = {
      ma: sp.ma + '|cap|' + key, ten: sp.ten, doi: 'vu-khi', net: N, rong: Math.round(W / N), cao: Math.round(Hh / N), pw: W, ph: Hh, px: out, ready: true, xoay: new Map(), mau: {},
      vk: Object.assign({}, V, { bienThe: true, cam: dv(V.cam), mui: dv(V.mui), day: V.day ? [dv(V.day[0]), dv(V.day[1])] : null }), goc: sp, he: { el, cap },
    };
    return (sp._capSp[key] = sp2);
  }
  // giáo: rãnh giữa của cán (ngoài vùng lưỡi) – lấy theo đường điểm cầm -> mũi
  function giuaThan(H, k, N) { return H.Q[k] * N; }
  // toạ độ game trên ảnh gốc từ (s dọc trục, q pháp tuyến)
  function diemTu(H, V, s, q) { return [V.cam[0] + H.A[0] * s + H.Nm[0] * q, V.cam[1] + H.A[1] * s + H.Nm[1] * q]; }

  // ---------- HỌA TIẾT CẤP 3 ----------
  function hoaTiet(el, H, V, L, E, dat, src, pw, ph, khung, keep) {
    const N = H.N, sides = el === 'poison' ? [1] : L.canh === 0 ? [-1, 1] : [L.canh]; // độc: giọt luôn treo ở mép dưới ảnh
    const put = (s, q, col, de) => { const p = diemTu(H, V, s, q); dat(Math.floor(p[0] * N), Math.floor(p[1] * N), col, de); };
    for (const sd of sides) {
      const mep = sd < 0 ? H.mepT : H.mepD; if (!mep.length) continue;
      const b0 = mep[0][0], b1 = mep[mep.length - 1][0], span = b1 - b0;
      for (let idx = 0; idx < mep.length; idx++) {
        const [b, q] = mep[idx], f = (b - b0) / (span || 1), s = b / N;
        if (H.ngang ? false : f < 0.08) continue;
        if (el === 'fire') {
          // ngọn lửa bám mép: chân 3 điểm ảnh, cao 3-6, nghiêng về mũi, 2 khung lay
          const per = 5; if ((b - b0) % per !== 2 || f > 0.96) continue;
          const id = Math.floor((b - b0) / per), h = 4 + Math.round(3 * hash(id * 7 + khung * 13 + V.dong)) - (f < 0.25 ? 2 : 0);
          for (let y = 0; y < h; y++) {
            const w = y < h * 0.5 ? 1 : 0, lean = Math.round(y * 0.4) + (khung && y > 2 ? 1 : 0);
            for (let x = -w; x <= w; x++) {
              const col = y === h - 1 ? E.co : (x === 0 && y < h * 0.5) ? E.loi : (x === 0 || y < h * 0.5) ? E.nhan : E.co;
              put(s + (x + lean) / N, q + (sd * (y + 1)) / N, Math.abs(x) === 1 && y >= h * 0.35 ? E.co : col);
            }
            put(s + (lean - w - 1) / N, q + (sd * (y + 1)) / N, E.toi); // viền đỏ sẫm hai bên cho khối rõ
            put(s + (lean + w + 1) / N, q + (sd * (y + 1)) / N, E.toi);
          }
          put(s + Math.round(h * 0.4) / N, q + (sd * (h + 1)) / N, E.toi);
        } else if (el === 'ice') {
          // mấu tinh thể nhô trên mép: nhọn, nghiêng về mũi, viền xanh đậm, mặt sáng/tối
          const per = 6; if ((b - b0) % per !== 3 || f > 0.95) continue;
          const id = Math.floor((b - b0) / per), h = 3 + Math.round(2 * hash(id * 5 + V.dong + sd));
          for (let y = 0; y < h; y++) {
            const w = y < h - 2 ? 1 : 0, lean = Math.round(y * 0.5);
            for (let x = -w - 1; x <= w + 1; x++) {
              const ox = x + lean, col = Math.abs(x) === w + 1 ? E.vien : x < 0 ? E.loi : x === 0 ? E.nhan : E.co;
              if (Math.abs(x) === w + 1 && y < h - 1 && w === 0 && x > 0) continue;
              put(s + ox / N, q + (sd * (y + 1)) / N, col);
            }
          }
          put(s + Math.round(h * 0.5) / N, q + (sd * (h + 1)) / N, E.vien);
        } else {
          // độc: giọt nọc treo ở mép dưới (dài ngắn theo khung)
          if (sd < 0) continue;
          const per = 8; if ((b - b0) % per !== 4 || f > 0.92 || f < 0.15) continue;
          const id = Math.floor((b - b0) / per), h = 2 + Math.round(2 * hash(id * 3 + V.dong)) + (khung ^ (id & 1));
          for (let y = 0; y <= h; y++) { if (y) { put(s - 1 / N, q + y / N, E.vien); put(s + 1 / N, q + y / N, E.vien); } put(s, q + y / N, y === h ? E.nhan : E.co, y === 0); }
          put(s, q + (h + 1) / N, E.vien); put(s, q + (h - 1) / N, E.loi, true);
        }
      }
    }
    if (el === 'poison') { // vân rễ tím từ rãnh giữa toả ra hai mép, nghiêng về mũi
      for (const [b, o] of H.lat) {
        const s = b / N, a = (s) / H.mx; if (a < L.vanT0 || a > L.vanT1) continue;
        const per = 9; if (((b % per) + per) % per !== 0) continue;
        const m = (o.qmin + o.qmax) / 2, wq = (o.qmax - o.qmin) * N;
        for (const sd of [-1, 1]) for (let r = 1; r < wq / 2 - 1.5; r++) {
          const ss = s + (r * 0.8) / N, qq = m + (sd * r) / N, p = diemTu(H, V, ss, qq), i = Math.floor(p[0] * N), j = Math.floor(p[1] * N);
          if (i < 0 || j < 0 || i >= pw || j >= ph || !src[j * pw + i] || keep(j * pw + i)) continue;
          dat(i, j, r === 1 ? E.phuSang : E.phu, true);
        }
      }
    }
    if (el === 'ice') { // sương giá: điểm trắng cách quãng trên mép thân
      for (const sd of [-1, 1]) for (const [b, q] of (sd < 0 ? H.mepT : H.mepD)) {
        if (((b % 3) + 3) % 3) continue;
        const p = diemTu(H, V, b / N, q - (sd * 1.5) / N), i = Math.floor(p[0] * N), j = Math.floor(p[1] * N);
        if (i >= 0 && j >= 0 && i < pw && j < ph && src[j * pw + i] && !keep(j * pw + i)) dat(i, j, E.loi, true);
      }
    }
  }

  // ---------- HẠT (vẽ mỗi khung, không tạo canvas) ----------
  // T: hàm đổi toạ độ ảnh gốc (game) -> màn hình (như trong SC.veVuKhi). 1 hạt = 1 điểm ảnh thật (1/N điểm game).
  function hat(c, sp, el, cap, T, t) {
    const H = doThan(sp), V = sp.vk, N = H.N, E = PAL[el], n = CAP[cap].hat, L = LOAI[V.loai];
    const mep = L.canh >= 0 ? H.mepD : H.mepT; if (!mep.length) return;
    const a0 = c.globalAlpha, d = 1 / N;
    const dot = (x, y, col, al) => { c.globalAlpha = a0 * clamp(al, 0, 1); c.fillStyle = col; c.fillRect(Math.round(x * N) / N, Math.round(y * N) / N, d, d); };
    for (let i = 0; i < n; i++) {
      const h = hash(i * 3.7 + V.dong), m = mep[Math.floor((0.2 + 0.8 * h) * (mep.length - 1))], p = T(diemTu(H, V, m[0] / N, m[1]));
      const ph = fr(t * (0.7 + h * 0.5) + h * 7);
      if (el === 'fire') { if (fr(t * 7 + i * 0.37) < 0.2) continue; dot(p[0] + Math.sin(ph * 6 + i) * 0.8, p[1] - ph * (3 + cap * 1.5), ph < 0.4 ? E.hat[0] : E.hat[2], 1 - ph); }
      else if (el === 'poison') { if (i % 2) dot(p[0] + (h - 0.5) * 2, p[1] - ph * 3, E.phuSang, 0.9 - ph * 0.6); else dot(p[0], p[1] + ph * ph * 4, E.nhan, 1 - ph); }
      else { if (ph < 0.25) { dot(p[0], p[1], '#ffffff', 1); if (ph < 0.12) for (const q of [[d, 0], [-d, 0], [0, d], [0, -d]]) dot(p[0] + q[0], p[1] + q[1], E.nhan, 0.85); } else dot(p[0], p[1] + ph * 3, E.nhan, (1 - ph) * 0.5); }
    }
    c.globalAlpha = a0;
  }

  // ---------- VẼ (cùng cách gọi SC.veVuKhi) ----------
  // Dùng sprite dẫn xuất + hạt riêng. opts: { rarity, t } ; he: { el, cap }.
  function ve(c, sp, he, opts, x0, y0, ang, pull) {
    const SC = G.spriteCustom, t = (opts && opts.t != null ? +opts.t : G.time) || 0;
    const sp2 = taoSprite(sp, he.el, he.cap, Math.floor(t * 6) & 1);
    SC.veVuKhi(c, sp2, { rarity: opts && opts.rarity, t }, x0, y0, ang, pull);
    const rar = clamp((opts && opts.rarity) | 0, 0, 3), R = SC.xoayVk(sp2, ang || 0, rar, null), X = Math.round(x0), Y = Math.round(y0), V = sp.vk;
    const T = (p) => { const u = p[0] - V.cam[0], v = p[1] - V.cam[1]; return [X + (u * R.c - v * R.s), Y + (u * R.s + v * R.c)]; };
    hat(c, sp, he.el, he.cap, T, t);
  }

  G.vkCapHe = { PAL, CAP, LOAI, LE, doThan, taoSprite, hat, ve };
})();
