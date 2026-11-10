// TURRET MERGE — HỆ CHÂN DUNG §D (TU-VAN-TOAN-BO.txt): mốc MẶT riêng từng phi công, áp Y HỆT ở mọi chỗ hiện chân dung.
//  (10/11: chú thích lại tay CẢ 97 ảnh theo ảnh thật — mốc cũ suy từ công thức cắt (7,4 / 40 / 50 / 61,7) lệch nhiều ảnh; bảng soát: tools/thap-kt-chandung-sheet.py)
//  PO_NEO {id: [đỉnh tóc %, đường mắt %, tâm mặt x %]} — % cạnh ảnh gốc (assets/pilot_<id>.png, af_<chỉ huy>.png), chú thích tay
//  trên lưới 10 % (bảng soát: docs/demo-hop-tuong/tuvan/tvA/portrait_qa.png — tools/thap-kt-chandung.js).
//  Mỗi chỗ chứa đặt mục tiêu bằng biến CSS trên <img> (css/tvA.css):
//    --po-mat : đường mắt ở bao nhiêu phần chiều cao CỬA SỔ (vd .41 = 41 % từ mép trên)
//    --po-toc : đỉnh tóc cách mép trên tối thiểu (phần chiều cao cửa sổ)
//    --po-zoom: phóng tối đa so với "cover" (cửa sổ nhỏ → mặt to)
//    --po-ho  : được để TRỐNG tối đa bao nhiêu phần cửa sổ phía trên tóc khi ảnh gốc tóc sát mép (nền tối của ô; 0 = luôn phủ kín)
//    --po-zmin: phóng tối thiểu so với cover (để có chỗ dời mặt sang ngang)
//    --po-x   : tâm mặt ở bao nhiêu phần chiều rộng cửa sổ (mặc định .5; trang ụ .40 để huy hiệu ụ góc phải không đè mặt)
//  Thuật toán: phóng lớn nhất sao cho (mắt ở --po-mat VÀ tóc cách mép ≥ --po-toc), không nhỏ hơn cover, không quá --po-zoom;
//  canh tâm mặt theo x; kẹp để ảnh luôn phủ kín cửa sổ (không hở nền). Kết quả lưu img._po = {mat, toc, x} (phần cửa sổ) cho máy kiểm.
//  Khung độ hiếm (PNG, cửa sổ trong suốt) vẽ SAU ảnh; chip chỉ ở góc dành riêng — xem css/tvA.css.
'use strict';
const PO_NEO = {
  canon: [11, 27, 55, 49], xucxac: [2, 41, 46, 61], lien: [14, 36, 46, 57], phun: [0, 29, 48, 60], sungluc: [0, 38, 46, 59], bang: [11, 44.5, 53, 59],
  doc: [18, 53, 44, 75], mana: [3, 45, 50, 70], tia: [2, 39, 52, 65], set: [13, 30, 53, 58], maychem: [2, 42, 63, 64], phagiap: [12, 34, 56, 62],
  bua: [30, 46, 60, 77], nam: [3, 35, 50, 61], bomhen: [9, 54, 41, 78], nhanmana: [23, 49, 65, 76], kiembang: [7, 43, 56, 61], mimic: [0, 40, 45, 75],
  chimang: [6.3, 44.1, 53.2, 63.1], dichchuyen: [0, 17, 33, 37], radar: [5, 41, 57, 65], drone: [6, 56, 36, 81], tron: [0, 42, 46, 63],
  nangluong: [15.2, 39.5, 59, 61], laser: [9.1, 45.5, 50, 81.8], lanhgia: [17, 50, 67, 66], mortar: [5, 24, 62, 46], khuech: [8, 36.5, 50, 62],
  vungdoc: [34, 63, 63, 81], loa: [1, 39, 47, 60], hutmana: [6, 39, 52, 68], min: [4, 43, 57, 71], cuongno: [5.7, 39, 51.4, 78.1],
  baotuyet: [10.5, 39, 57.1, 68.6], nhanban: [5.5, 40, 50, 65.5], lienket: [3.7, 35.6, 50, 60.2], kepha: [1, 46, 50, 68], taylo: [16, 56, 50, 78], khien: [6, 39, 55, 68],
  hopbi: [0, 44, 50, 73], nangsao: [25, 56, 62, 79], tuthan: [29, 57, 58, 75], xaotron: [3.2, 40.5, 49.5, 61.1], epxung: [0, 44, 60, 69], no5: [2, 41, 44, 61],
  bao: [4, 41, 52, 68], anhsang: [1, 32, 45, 60], aten: [15, 44, 65, 63], dongbo: [0, 44, 55, 69], railgun: [4, 40, 47, 66], vughep: [2, 42, 52, 66],
  sinhdoi: [15, 47, 38, 72], hasao: [40, 51, 63, 66], saochep: [0, 45, 55, 66], ngoisao: [3, 33, 70, 61], soi: [28, 43, 40, 61], tienhoa: [5, 38, 46, 72],
  cauvong: [4, 40, 45, 62], wallgen: [4, 34, 43, 65], orbital: [12, 29, 60, 62], blackhole: [13, 44, 61, 68], overlord: [8, 40, 48, 61],
  lophanung: [3.2, 31.9, 54.2, 60.6], haoquang: [36, 54, 57, 70], nayda: [1, 47, 57, 72], combo: [0, 46, 55, 70], khoathoigian: [4, 44, 57, 66],
  hydra: [0, 21.2, 50, 38.5], cuuvi: [12, 51, 49, 71], pandora: [2.4, 41, 50, 56.6], luoicheo: [14, 40, 55, 70], ngaithoigian: [0, 43, 37, 65], nemesis: [4, 45, 53, 75],
  docton: [6, 38, 50, 59], thaukinh: [9.1, 38.6, 46.6, 61.4], nhieusong: [12, 39, 58, 65], santhuong: [0, 42, 38, 69], nhatthuc: [6, 32, 52, 51],
  loren: [6, 40, 42, 70], guongcong: [3, 39, 47, 64], marionette: [0, 41, 47, 63], chuato: [0.5, 40.5, 50, 62.7], leviathan: [32, 51, 63, 69],
  khoisinh: [7, 45, 51, 66], ronglua: [3, 35, 50, 61], af_hero: [4, 36, 50, 55], af_dahlia: [4, 35, 55, 55], af_eve: [4, 35, 55, 55], bienmau: [0, 43, 47, 73], hopca: [16, 40, 55, 63], lualien: [15, 50, 61, 70], luutru: [3, 41, 58, 68], mauhut: [20, 59, 54, 82], nguyenrua: [4, 38, 47, 65], thanhdia: [1.1, 34.2, 50, 57.4], xuonganh: [2, 29, 47, 56], cobac: [11.4, 34.8, 49.5, 61], tudo: [1, 40, 50, 68], thacmana: [4, 41, 44, 64], congap: [1.7, 35.7, 51, 60], bocap: [16.7, 55.6, 44.4, 73.9],};
// PO_TO: phi công có ĐẦU nhỏ trong ảnh gốc (đỉnh tóc → cằm < 48 % cạnh ảnh) — ô nhỏ cần phóng vào mặt nên thumbOf() (js/text.js) lấy ảnh 427 px thay bản pn/ 256 px
const PO_TO = new Set(Object.keys(PO_NEO).filter(i => !i.startsWith('af_') && PO_NEO[i][3] - PO_NEO[i][0] < 48));
// ảnh LỚN trang ụ / chỉ huy (assets/hero/hero_<id>.jpg|webp 1170×1020 — tools/thap-hero.py, hiện 1:1, KHÔNG phóng): mốc riêng vì khung cắt khác pilot_<id>.png
const HERO_NEO = {
  canon: [15.5, 31, 54], xucxac: [19.1, 34.1, 48.6], lien: [10, 25, 40.8], phun: [0, 25.2, 53], sungluc: [27.5, 42.5, 40.2], bang: [11.9, 42.5, 52.6], doc: [12, 27, 53.9],
  mana: [6.3, 28.7, 47], tia: [17.2, 37.9, 48], set: [11.9, 27.4, 60.6], maychem: [9.8, 32.1, 48], phagiap: [12, 27, 46.1], bua: [11, 26, 48.7], nam: [4.6, 28.7, 50],
  bomhen: [10, 25, 50], nhanmana: [13, 28, 44.8], kiembang: [10.5, 25.5, 46.1], mimic: [19.5, 43.6, 56], chimang: [10.1, 48.5, 52.6], dichchuyen: [28, 43, 56.5],
  radar: [22.9, 47, 57], drone: [16.6, 31.6, 55.2], tron: [18.7, 33.7, 48.7], nangluong: [18.3, 41.6, 61.4], laser: [9.1, 45.7, 51], lanhgia: [7, 22, 40.8], mortar: [15, 30, 36.9],
  khuech: [7.3, 33.4, 51.8], vungdoc: [7, 22, 47.4], loa: [25.2, 49.3, 41], hutmana: [6.3, 28.7, 50], min: [7.5, 33.3, 48], cuongno: [5.5, 37.5, 59], baotuyet: [10.1, 37.5, 59.8],
  nhanban: [5.5, 40.3, 48.6], lienket: [3.7, 35.2, 57.4], kepha: [9.8, 35.6, 55], taylo: [9.3, 24.3, 46.1], khien: [3.4, 24.1, 51], hopbi: [18, 33, 39.5], nangsao: [32.5, 47.5, 46.1],
  tuthan: [17.5, 32.5, 45.4], xaotron: [2.7, 35.2, 51.8], epxung: [20, 35, 44.8], no5: [19.8, 34.8, 38], bao: [19.2, 34.2, 43.1], anhsang: [22, 37, 43.5], aten: [13, 28, 40.8],
  dongbo: [6.9, 34.4, 42], railgun: [6.9, 31, 45], vughep: [23, 38, 43.5], sinhdoi: [14, 29, 43.5], hasao: [21, 36, 44.1], saochep: [22.9, 37.9, 44.1], ngoisao: [21, 36, 34.3],
  soi: [7, 22, 56.5], tienhoa: [28.1, 50.5, 58], cauvong: [13.8, 41.3, 52], wallgen: [4.6, 32.1, 46], orbital: [22, 37, 46.1], blackhole: [23, 38, 50],
  overlord: [17, 32, 50], lophanung: [3.7, 36.6, 54.2], haoquang: [11.6, 26.6, 47.4], nayda: [10.9, 36.7, 55], combo: [22.8, 37.8, 45.3], khoathoigian: [16, 31, 46.1],
  hydra: [0, 19.4, 55], cuuvi: [16.6, 31.6, 51.3], pandora: [1.8, 31.1, 51], luoicheo: [23.5, 45.9, 55], ngaithoigian: [16.6, 39, 52], nemesis: [4.6, 28.7, 48],
  docton: [5.5, 34.8, 51], thaukinh: [12.8, 36.6, 48.6], nhieusong: [23, 38, 40.8], santhuong: [11.5, 35.6, 52], nhatthuc: [21, 36, 46.1], loren: [8, 32.1, 54],
  guongcong: [9.2, 33.3, 56], marionette: [18.1, 33.1, 39.8], chuato: [0.5, 40.7, 55.8], leviathan: [12, 27, 46.1], khoisinh: [11.5, 35.6, 58], ronglua: [4.6, 28.7, 56],
  af_hero: [0, 36, 50], af_dahlia: [0, 35, 55], af_eve: [5, 38, 55], af_tech: [1, 17.5, 57], af_tide: [0, 16, 55], af_twin: [7, 19.5, 52], af_hawk: [3.5, 17, 55], af_weaver: [0, 17, 52], bienmau: [20.1, 42.5, 53], hopca: [12.5, 27.5, 49.1], lualien: [14.3, 29.3, 46.1], luutru: [12, 34.4, 60], mauhut: [0.5, 15.5, 43.5], nguyenrua: [12.6, 36.7, 59], thanhdia: [0.9, 29.7, 52.6], xuonganh: [17.3, 32.3, 50], cobac: [11, 33.4, 49.4], tudo: [19.5, 43.6, 55], thacmana: [10, 35, 53], congap: [1.8, 37.5, 55], bocap: [13.7, 45.7, 51.8],};
// mốc của 1 ảnh: PO_NEO, hoặc suy từ FACE_BOX (khung đầu tóc→cằm: mắt ≈ giữa khung đầu)
function poNeo(id) {
  if (id && id.startsWith('hero:')) return HERO_NEO[id.slice(5)] || null;
  if (PO_NEO[id]) return PO_NEO[id];
  const f = typeof FACE_BOX !== 'undefined' && FACE_BOX[id]; if (!f) return null;
  const top = f[1] - f[2] / 2; return [top, top + f[2] * 0.5, f[0], top + f[2]];
}
(() => {
  if (typeof MAT === 'undefined') return;
  const reHero = /hero\/hero_(\w+)\.(?:jpg|webp)/, idGoc = MAT.id;
  MAT.id = function (img) { const m = reHero.exec(img.getAttribute('src') || ''); return m ? 'hero:' + m[1] : idGoc.call(this, img); };
  const so = (cs, k, d) => { const v = parseFloat(cs.getPropertyValue(k)); return isFinite(v) ? v : d; };
  // ── Ô NHỎ (≤ DAU.hMax px CSS: thẻ kho, ô bộ bài, khay trận, bộ mẫu, ô chỉ huy, kết quả, sảnh, bảng chạm…) — MỘT luật cho mọi phi công:
  //    phóng sao cho CẢ ĐẦU (đỉnh tóc → cằm, mốc PO_NEO[3]) ≈ DAU.muc chiều cao cửa sổ (≤ DAU.max), không nhỏ hơn cover, không quá 1.0 px nguồn / px máy ở DPR 3;
  //    mắt ~DAU.mat; tóc cách mép trên ≥ DAU.toc nếu ảnh gốc có chỗ (tóc gốc sát mép → cửa sổ bắt đầu đúng mép ảnh, KHÔNG cắt thêm); cằm + chút cổ trong cửa sổ.
  //    Không nhận --po-zoom / --po-mat / --po-ho của từng chỗ chứa (hết "chỗ này phóng 2.4×"). Tắt: --po-dau: 0. (máy kiểm: tools/thap-kt-vach.js KT_KHUNGMAT)
  const DAU = { hMax: 140, muc: 0.52, max: 0.60, mat: 0.40, toc: 0.05, co: 0.08, dpr: 3 };
  window.PO_DAU = DAU;
  function datDau(img, a, W, H, nw, nh, cs) {
    const hT = a[0] / 100 * nh, eY = a[1] / 100 * nh, fX = a[2] / 100 * nw, cY = a[3] / 100 * nh, dau = Math.max(1, cY - hT);
    const xT = so(cs, '--po-x', 0.5), c = Math.max(W / nw, H / nh);
    // phần cửa sổ bị viền PNG đè (mỗi cạnh): ô tối giản .ot = .081 (đo trên o_vien_*, css/otoigian.css --po-mep) — mọi mục tiêu tính theo VÙNG THẤY;
    // ảnh chỉ cần phủ kín vùng thấy (phần dưới viền không ai thấy) → được lùi xa hơn "cover" của cả cửa sổ
    const m = Math.max(0, Math.min(.3, so(cs, '--po-mep', 0))), Vt = m * H, Vh = (1 - 2 * m) * H, Vl = m * W, Vw = (1 - 2 * m) * W;
    const cv = Math.max(Vw / nw, Vh / nh);
    const k = Math.max(cv, Math.min(DAU.muc * Vh / dau, 1 / DAU.dpr));
    const sw = Vw / k, sh = Vh / k;                                      // vùng nguồn hiện trong vùng thấy
    const L = Math.max(0, Math.min(nw - sw, fX - xT * sw));
    let T = Math.min(eY - DAU.mat * sh, hT - DAU.toc * sh);              // mắt ~40 %, tóc cách mép ≥ 4 % (ưu tiên tóc)
    T = Math.max(T, cY + DAU.co * sh - sh);                              // cằm + chút cổ trong vùng thấy
    T = Math.min(T, nh - sh);
    T = Math.max(T, Math.min(0, hT - DAU.toc * sh));                     // ảnh gốc tóc sát mép: chừa trống trên tóc đúng 4 %, không hơn
    const ve = (y) => (y - T) / sh;
    img._po = { mat: ve(eY), toc: ve(hT), x: (fX - L) / sw, k: k / c, ho: Math.max(0, -T) * k / H, cam: ve(cY), dau: ve(cY) - Math.max(0, ve(hT)), bien: T <= 0.5, mep: m, nguon: k * DAU.dpr, che: 'dau' };
    // vẽ: ảnh "cover" (tỉ lệ c) với object-position chọn vùng chứa [L, T]; rồi scale z = k/c gốc 0 0 + translate → điểm nguồn (L, T) rơi đúng (Vl, Vt)
    const z = k / c, vw0 = W / c, vh0 = H / c;
    const L0 = Math.max(0, Math.min(nw - vw0, L + sw / 2 - vw0 / 2)), T0 = Math.max(0, Math.min(nh - vh0, T + sh / 2 - vh0 / 2));
    const tx = Vl - z * (L - L0) * c, ty = Vt - z * (T - T0) * c;
    const s = img.style; img._mat = 1;
    s.objectPosition = (nw - vw0 > 0.5 ? L0 / (nw - vw0) * 100 : 50).toFixed(2) + '% ' + (nh - vh0 > 0.5 ? T0 / (nh - vh0) * 100 : 50).toFixed(2) + '%';
    s.transformOrigin = '0 0'; s.scale = Math.abs(z - 1) < 1e-4 ? '' : z.toFixed(4);
    s.translate = Math.abs(tx) < 0.01 && Math.abs(ty) < 0.01 ? '' : tx.toFixed(2) + 'px ' + ty.toFixed(2) + 'px';
    // giữ ảnh trong cửa sổ (toạ độ trước biến đổi): cửa sổ [0,W]×[0,H] ↔ ((X − tx)/z, (Y − ty)/z)
    const r = parseFloat(cs.borderTopLeftRadius) || 0, cl = (v) => Math.max(0, v).toFixed(2) + 'px';
    s.clipPath = 'inset(' + cl(-ty / z) + ' ' + cl(W - (W - tx) / z) + ' ' + cl(H - (H - ty) / z) + ' ' + cl(-tx / z) + (r ? ' round ' + (r / z).toFixed(2) + 'px' : '') + ')';
  }
  // gán object-position / scale / clip-path cho vùng nguồn [L, T, W/k, H/k] (ho = px trống phía trên)
  function veCat(img, cs, W, H, nw, nh, k, c, L, T, ho) {
    const vw = W / k, vh = H / k, Tv = Math.max(0, T), s = img.style; img._mat = 1;
    s.translate = ho > 0.05 ? '0 ' + ho.toFixed(2) + 'px' : '';
    if (k <= c * 1.001) {
      s.objectPosition = (nw - vw > 0.5 ? L / (nw - vw) * 100 : 50).toFixed(2) + '% ' + (nh - vh > 0.5 ? Tv / (nh - vh) * 100 : 50).toFixed(2) + '%';
      s.scale = ''; s.transformOrigin = ''; s.clipPath = ho > 0.05 ? 'inset(0 0 ' + ho.toFixed(2) + 'px 0)' : '';
      return;
    }
    const z = k / c, vw0 = W / c, vh0 = H / c, dx = L + vw / 2, dy = Tv + vh / 2;
    const L0 = Math.max(0, Math.min(nw - vw0, dx - vw0 / 2)), T0 = Math.max(0, Math.min(nh - vh0, dy - vh0 / 2));
    const px = (dx - L0) * c, py = (dy - T0) * c;
    const ox = (W / 2 - z * px) / (1 - z), oy = (H / 2 - z * py) / (1 - z);
    const ca = ox * (1 - 1 / z), cb = oy * (1 - 1 / z);
    s.objectPosition = (nw - vw0 > 0.5 ? L0 / (nw - vw0) * 100 : 50).toFixed(2) + '% ' + (nh - vh0 > 0.5 ? T0 / (nh - vh0) * 100 : 50).toFixed(2) + '%';
    s.transformOrigin = ox.toFixed(2) + 'px ' + oy.toFixed(2) + 'px';
    s.scale = z.toFixed(4);
    const r = parseFloat(cs.borderTopLeftRadius) || 0;
    s.clipPath = 'inset(' + cb.toFixed(2) + 'px ' + (W - ca - W / z).toFixed(2) + 'px ' + (H - cb - H / z + ho / z).toFixed(2) + 'px ' + ca.toFixed(2) + 'px' + (r ? ' round ' + (r / z).toFixed(2) + 'px' : '') + ')';
  }
  MAT.fit = function (img) {
    const id = this.id(img), a = id && poNeo(id);
    if (!a) { if (img._mat) this.xoa(img); return; }
    const W = img.clientWidth, H = img.clientHeight, nw = img.naturalWidth || 256, nh = img.naturalHeight || 256;
    if (!W || !H) return;
    const cs = getComputedStyle(img);
    if (cs.objectFit !== 'cover') { if (img._mat) this.xoa(img); return; }
    if (!id.startsWith('hero:') && a[3] && (H <= DAU.hMax ? so(cs, '--po-dau', 1) : so(cs, '--po-dau', 0)) > 0) return datDau(img, a, W, H, nw, nh, cs);
    const e = so(cs, '--po-mat', H < 96 ? 0.43 : 0.40), m = so(cs, '--po-toc', 0.08), zMax = so(cs, '--po-zoom', H < 96 ? 2.2 : 1.6), xT = so(cs, '--po-x', 0.5);
    const g = so(cs, '--po-ho', 0);                                       // được để trống tối đa g (phần H) TRÊN tóc khi ảnh gốc thiếu khoảng trống
    const hT = a[0] / 100 * nh, eY = a[1] / 100 * nh, fX = a[2] / 100 * nw;
    const c = Math.max(W / nw, H / nh);                                   // tỉ lệ cover
    const kH = (e - m) * H / Math.max(1, eY - hT);                        // phóng lớn nhất còn giữ tóc cách mép ≥ m khi mắt ở e
    // ảnh gốc không đủ khoảng trống trên tóc: để trống ≤ g phía trên (nền tối của ô — "contain" theo §D), mắt vẫn ở e
    const hoH = Math.max(0, e * H / kH - eY) * kH / H;
    const kT = hoH <= g ? kH : (e - g) * H / eY;
    const k = Math.max(c * so(cs, '--po-zmin', 1), Math.min(kT, c * zMax));
    const vw = W / k, vh = H / k;
    const L = Math.max(0, Math.min(nw - vw, fX - xT * vw));
    // mắt ở e; TÓC ưu tiên (đỉnh tóc không ra ngoài mép trên, cách ≥ m nếu được); ảnh phủ kín cửa sổ, trừ phần trống ≤ g phía trên
    const T = Math.max(-g * vh, Math.min(nh - vh, eY - e * vh, hT - m * vh));
    const ho = Math.max(0, -T) * k;                                      // px trống phía trên
    img._po = { mat: (eY - T) * k / H, toc: (hT - T) * k / H, x: (fX - L) * k / W, k: k / c, ho: ho / H, cam: a[3] ? (a[3] / 100 * nh - T) * k / H : null, nguon: k * 3, che: 'cu' };
    veCat(img, cs, W, H, nw, nh, k, c, L, T, ho);
  };
  const xoaGoc = MAT.xoa; MAT.xoa = function (img) { img.style.translate = ''; img._po = null; return xoaGoc.call(this, img); };
  // ảnh hero (không chứa 'pilot_') — khung.js không tự bắt: tự theo dõi
  const quetHero = (n) => { if (n.nodeType !== 1) return; if (n.tagName === 'IMG') { if (reHero.test(n.getAttribute('src') || '')) MAT.gan(n); } else n.querySelectorAll('img[src*="hero/hero_"]').forEach(im => MAT.gan(im)); };
  const batHero = () => new MutationObserver(ms => { for (const m of ms) { if (m.type === 'attributes') quetHero(m.target); else m.addedNodes.forEach(quetHero); } })
    .observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
  if (document.body) batHero(); else document.addEventListener('DOMContentLoaded', batHero);
  // ảnh đã cắt trước khi file này nạp → cắt lại theo mốc mới
  document.querySelectorAll('img[src*="pilot_"],img[src*="af_"]').forEach(im => MAT.fit(im));
})();
