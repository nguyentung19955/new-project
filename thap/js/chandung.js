// TURRET MERGE — HỆ CHÂN DUNG §D (TU-VAN-TOAN-BO.txt): mốc MẶT riêng từng phi công, áp Y HỆT ở mọi chỗ hiện chân dung.
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
  canon: [13.5, 27, 54, 51], xucxac: [7.5, 40.1, 49.9, 61.8], lien: [7.3, 39.9, 50, 61.7], phun: [7.3, 40, 49.9, 61.7], sungluc: [7.5, 40.1, 50, 61.8], bang: [7.4, 40, 50.1, 61.7],
  doc: [7.4, 40, 49.9, 61.8], mana: [7.5, 40.1, 50, 61.8], tia: [7.3, 39.9, 50, 61.7], set: [7.5, 40.1, 50, 61.8], maychem: [7.4, 40, 49.9, 61.7], phagiap: [7.4, 40, 50.1, 61.8],
  bua: [7.4, 40, 50, 61.7], nam: [7.5, 40.1, 50.1, 61.8], bomhen: [7.3, 39.9, 50.1, 61.7], nhanmana: [7.5, 40.1, 50, 61.8], kiembang: [7.3, 39.9, 50.1, 61.7], mimic: [7.3, 40, 50, 61.7],
  chimang: [7.4, 40, 50, 61.8], dichchuyen: [7.4, 40, 50.1, 61.7], radar: [7.3, 40, 50, 61.7], drone: [7.4, 40, 50, 61.8], tron: [7.4, 40, 50, 61.8],
  nangluong: [7.3, 39.9, 49.9, 61.6], laser: [7.3, 39.9, 50.1, 61.7], lanhgia: [7.4, 40, 50, 61.7], mortar: [7.3, 40, 50, 61.7], khuech: [7.4, 40, 49.9, 61.8],
  vungdoc: [7.4, 40, 50, 61.7], loa: [7.5, 40.1, 50, 61.8], hutmana: [7.3, 39.9, 50.1, 61.6], min: [7.3, 39.9, 49.9, 61.7], cuongno: [7.4, 40, 49.9, 61.8],
  baotuyet: [7.5, 40.1, 50.1, 61.8], nhanban: [7.3, 39.9, 50.1, 61.7], lienket: [7.4, 40, 50.1, 61.8], kepha: [7.5, 40.1, 49.9, 61.8], taylo: [7.5, 40.1, 50.1, 61.8], khien: [7.3, 40, 50.1, 61.7],
  hopbi: [7.3, 39.9, 49.9, 61.6], nangsao: [7.4, 40, 50.1, 61.7], tuthan: [7.5, 40.1, 49.9, 61.8], xaotron: [7.3, 40, 49.9, 61.7], epxung: [7.4, 40, 50, 61.7], no5: [7.3, 39.9, 50.1, 61.7],
  bao: [7.5, 40.1, 50, 61.8], anhsang: [7.5, 40.1, 49.9, 61.8], aten: [7.5, 40.1, 50, 61.8], dongbo: [7.3, 39.9, 50.1, 61.7], railgun: [7.4, 40, 50, 61.8], vughep: [7.3, 39.9, 49.9, 61.7],
  sinhdoi: [7.3, 39.9, 49.9, 61.6], hasao: [7.4, 40.1, 50.1, 61.8], saochep: [7.3, 39.9, 50.1, 61.7], ngoisao: [7.4, 40.1, 50, 61.8], soi: [7.4, 40, 50.1, 61.7], tienhoa: [7.5, 40.1, 50, 61.8],
  cauvong: [7.4, 40, 50, 61.8], wallgen: [7.3, 39.9, 49.9, 61.7], orbital: [7.5, 40.1, 50.1, 61.8], blackhole: [7.3, 39.9, 50.1, 61.7], overlord: [7.4, 40.1, 50.1, 61.8],
  lophanung: [7.5, 40.1, 50.1, 61.8], haoquang: [7.4, 40, 50, 61.7], nayda: [7.4, 40, 50.1, 61.7], combo: [7.3, 40, 49.9, 61.7], khoathoigian: [7.4, 40, 50.1, 61.7],
  hydra: [7.5, 40.1, 49.9, 61.8], cuuvi: [7.4, 40, 50, 61.8], pandora: [7.3, 39.9, 50, 61.7], luoicheo: [7.3, 39.9, 50.1, 61.7], ngaithoigian: [7.4, 40, 50.1, 61.7], nemesis: [7.4, 40, 50.1, 61.7],
  docton: [7.3, 39.9, 50.1, 61.7], thaukinh: [7.3, 39.9, 49.9, 61.7], nhieusong: [7.3, 39.9, 50, 61.7], santhuong: [7.4, 40, 50.1, 61.7], nhatthuc: [7.4, 40.1, 50.1, 61.8],
  loren: [7.4, 40, 50, 61.7], guongcong: [7.4, 40, 50.1, 61.7], marionette: [7.5, 40.1, 50.1, 61.8], chuato: [7.3, 39.9, 50.1, 61.6], leviathan: [7.4, 40, 50.1, 61.8],
  khoisinh: [7.3, 39.9, 49.9, 61.7], ronglua: [7.4, 40, 50.1, 61.7], af_hero: [4, 36, 50, 55], af_dahlia: [4, 35, 55, 55], af_eve: [4, 35, 55, 55], bienmau: [7.3, 39.9, 50, 61.7], hopca: [7.4, 40, 50.1, 61.8], lualien: [7.3, 39.9, 50.1, 61.7], luutru: [7.4, 40, 50.1, 61.7], mauhut: [1.1, 33.7, 49.9, 55.4], nguyenrua: [7.4, 40, 50.1, 61.7], thanhdia: [7.3, 39.9, 50, 61.6], xuonganh: [7.5, 40.1, 50.1, 61.8], cobac: [7.4, 40, 50, 61.7],};
// ảnh LỚN trang ụ / chỉ huy (assets/hero/hero_<id>.jpg|webp 1170×1020 — tools/thap-hero.py, hiện 1:1, KHÔNG phóng): mốc riêng vì khung cắt khác pilot_<id>.png
const HERO_NEO = {
  canon: [15.5, 31, 54], xucxac: [17.3, 32.3, 57.9], lien: [10, 25, 40.8], phun: [15, 30, 39.5], sungluc: [22, 37, 52.6], bang: [16, 31, 50], doc: [12, 27, 53.9],
  mana: [17.5, 32.5, 47.4], tia: [10, 25, 52.6], set: [13, 28, 48.7], maychem: [11.3, 26.3, 43.5], phagiap: [12, 27, 46.1], bua: [11, 26, 48.7], nam: [9.3, 24.3, 50],
  bomhen: [10, 25, 50], nhanmana: [13, 28, 44.8], kiembang: [10.5, 25.5, 46.1], mimic: [15, 30, 40.8], chimang: [25, 40, 40.8], dichchuyen: [28, 43, 56.5],
  radar: [15, 30, 40.8], drone: [16.6, 31.6, 55.2], tron: [12.3, 27.3, 59.2], nangluong: [14, 29, 43.5], laser: [10, 25, 50], lanhgia: [7, 22, 40.8], mortar: [15, 30, 36.9],
  khuech: [12, 27, 53.9], vungdoc: [7, 22, 47.4], loa: [9, 24, 40.8], hutmana: [5.5, 20.5, 50], min: [14.3, 29.3, 39.5], cuongno: [12, 27, 53.9], baotuyet: [22, 37, 46.1],
  nhanban: [14.3, 29.3, 46.1], lienket: [12.3, 27.3, 50], kepha: [5, 20, 43.5], taylo: [9.3, 24.3, 46.1], khien: [10.7, 25.7, 50], hopbi: [18, 33, 39.5], nangsao: [32.5, 47.5, 46.1],
  tuthan: [17.5, 32.5, 45.4], xaotron: [15, 30, 35.6], epxung: [20, 35, 44.8], no5: [14.3, 29.3, 50], bao: [22, 37, 33], anhsang: [22, 37, 43.5], aten: [13, 28, 40.8],
  dongbo: [14.3, 29.3, 46.1], railgun: [12.3, 27.3, 48.7], vughep: [23, 38, 43.5], sinhdoi: [14, 29, 43.5], hasao: [21, 36, 44.1], saochep: [27, 42, 33.6], ngoisao: [21, 36, 34.3],
  soi: [7, 22, 56.5], tienhoa: [9.3, 24.3, 47.4], cauvong: [12.3, 27.3, 52.6], wallgen: [10.3, 25.3, 53.9], orbital: [22, 37, 46.1], blackhole: [23, 38, 50],
  overlord: [17, 32, 50], lophanung: [13.7, 28.7, 50], haoquang: [11.6, 26.6, 47.4], nayda: [11.3, 26.3, 50], combo: [15, 30, 35.6], khoathoigian: [16, 31, 46.1],
  hydra: [13.4, 28.4, 39.5], cuuvi: [16.6, 31.6, 51.3], pandora: [10, 25, 61.1], luoicheo: [14.3, 29.3, 50], ngaithoigian: [24, 39, 50], nemesis: [15.1, 30.1, 50],
  docton: [10, 25, 46.1], thaukinh: [6, 21, 43.5], nhieusong: [23, 38, 40.8], santhuong: [19.6, 34.6, 60.5], nhatthuc: [21, 36, 46.1], loren: [11.3, 26.3, 47.4],
  guongcong: [15.6, 30.6, 46.1], marionette: [13, 28, 27.8], chuato: [13.9, 28.9, 50], leviathan: [12, 27, 46.1], khoisinh: [10, 25, 39.5], ronglua: [11.3, 26.3, 46.1],
  af_hero: [0, 36, 50], af_dahlia: [0, 35, 55], af_eve: [5, 38, 55], bienmau: [14.3, 29.3, 47.4], hopca: [12, 27, 38.2], lualien: [14.3, 29.3, 46.1], luutru: [7.3, 22.3, 46.1], mauhut: [0.5, 15.5, 43.5], nguyenrua: [7, 22, 50], thanhdia: [5.5, 20.5, 47.4], xuonganh: [17.3, 32.3, 50], cobac: [27.7, 42.7, 49.3],};
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
