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
  canon: [0, 30.2, 52], xucxac: [30.1, 54.2, 31.9], lien: [0, 30.2, 49.9], phun: [2, 30, 45], sungluc: [0, 28.2, 50.1], bang: [0, 30.3, 55.3],
  doc: [4, 29, 45], mana: [0, 30.2, 39.4], tia: [2.9, 27, 44.7], set: [0.8, 28.1, 44.7], maychem: [0.8, 29.1, 44.7], phagiap: [0, 28.2, 52.2],
  bua: [0, 32.4, 44.8], nam: [0.9, 33.4, 55.2], bomhen: [0, 33.3, 52.2], nhanmana: [0, 32.3, 55.3], kiembang: [0, 35.5, 58.3], mimic: [0, 35.5, 52.2],
  chimang: [11.9, 28.6, 19.5], dichchuyen: [0, 32, 52], radar: [0, 30.3, 60.6], drone: [0.9, 28.2, 62.5], tron: [0, 28.1, 44.7],
  nangluong: [0, 32.3, 58.5], laser: [0, 30.2, 49.9], lanhgia: [0, 28.2, 62.7], mortar: [0, 24, 44.8], khuech: [0, 22.8, 55.3],
  vungdoc: [28, 49.5, 23.5], loa: [0, 30.3, 55.2], hutmana: [0, 28.1, 41.5], min: [0, 30.3, 58.3], cuongno: [10.3, 30.9, 30],
  baotuyet: [0, 32.3, 62.7], nhanban: [0, 31, 55], lienket: [0, 28.2, 62.7], kepha: [0, 32.4, 44.7], taylo: [0, 30.3, 55.2], khien: [0, 28.2, 44.8],
  hopbi: [0, 32.3, 50.1], nangsao: [0, 32.3, 39.4], tuthan: [30, 47.6, 23.7], xaotron: [0, 34.4, 39.6], epxung: [0, 27.1, 65.8], no5: [0, 27, 60.4],
  bao: [0, 35.5, 52], anhsang: [0, 30.3, 62.7], aten: [0, 30.3, 55.2], dongbo: [0, 30.3, 73.2], railgun: [0, 27.1, 55.2], vughep: [26.9, 50.3, 32],
  sinhdoi: [0, 25, 60.6], hasao: [0, 28.1, 44.7], saochep: [0, 30.2, 58.5], ngoisao: [8.5, 27.6, 43.8], soi: [0, 28.2, 52], tienhoa: [0, 27, 50.1],
  cauvong: [10.3, 29.5, 28.5], wallgen: [30, 49.5, 29], orbital: [14.7, 35.3, 33.9], blackhole: [0, 30.2, 60.4], overlord: [8, 30, 60],
  lophanung: [0, 27.1, 44.8], haoquang: [0, 28.1, 60.6], nayda: [0, 32.3, 41.7], combo: [0, 30.3, 58.3], khoathoigian: [0, 27, 49.9],
  hydra: [0, 27.1, 39.6], cuuvi: [5, 30, 45], pandora: [6, 28, 45], luoicheo: [0, 28.1, 44.8], ngaithoigian: [8.6, 28.5, 39.5], nemesis: [0, 27, 55.2],
  docton: [3, 22, 52], thaukinh: [0, 27, 50.1], nhieusong: [1, 26, 62], santhuong: [0, 30.2, 55.2], nhatthuc: [9.1, 31.2, 43.2],
  loren: [0, 32.4, 44.7], guongcong: [0, 32.4, 65.7], marionette: [0, 28.1, 37.5], chuato: [3, 28, 52], leviathan: [0, 26, 52.2],
  khoisinh: [0, 27.1, 41.5], ronglua: [0, 24.9, 39.6], af_hero: [4, 36, 50], af_dahlia: [4, 35, 55], af_eve: [4, 35, 55],
};
// mốc của 1 ảnh: PO_NEO, hoặc suy từ FACE_BOX (khung đầu tóc→cằm: mắt ≈ giữa khung đầu)
function poNeo(id) {
  if (PO_NEO[id]) return PO_NEO[id];
  const f = typeof FACE_BOX !== 'undefined' && FACE_BOX[id]; if (!f) return null;
  const top = f[1] - f[2] / 2; return [top, top + f[2] * 0.5, f[0]];
}
(() => {
  if (typeof MAT === 'undefined') return;
  const so = (cs, k, d) => { const v = parseFloat(cs.getPropertyValue(k)); return isFinite(v) ? v : d; };
  MAT.fit = function (img) {
    const id = this.id(img), a = id && poNeo(id);
    if (!a) { if (img._mat) this.xoa(img); return; }
    const W = img.clientWidth, H = img.clientHeight, nw = img.naturalWidth || 256, nh = img.naturalHeight || 256;
    if (!W || !H) return;
    const cs = getComputedStyle(img);
    if (cs.objectFit !== 'cover') { if (img._mat) this.xoa(img); return; }
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
    const ho = Math.max(0, -T) * k, Tv = Math.max(0, T);                 // px trống phía trên
    img._po = { mat: (eY - T) * k / H, toc: (hT - T) * k / H, x: (fX - L) * k / W, k: k / c, ho: ho / H };
    const s = img.style; img._mat = 1;
    s.translate = ho > 0.05 ? '0 ' + ho.toFixed(2) + 'px' : '';
    if (k <= c * 1.001) {
      s.objectPosition = (nw - vw > 0.5 ? L / (nw - vw) * 100 : 50).toFixed(2) + '% ' + (nh - vh > 0.5 ? Tv / (nh - vh) * 100 : 50).toFixed(2) + '%';
      s.scale = ''; s.transformOrigin = ''; s.clipPath = ho > 0.05 ? 'inset(0 0 ' + ho.toFixed(2) + 'px 0)' : '';
      return;
    }
    // phóng: ảnh cover ở tỉ lệ c, phóng z quanh gốc o → vùng [L, Tv, vw, vh] lấp đúng ô; clip-path giữ ảnh trong ô (trừ phần trống trên)
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
  };
  const xoaGoc = MAT.xoa; MAT.xoa = function (img) { img.style.translate = ''; img._po = null; return xoaGoc.call(this, img); };
  // ảnh đã cắt trước khi file này nạp → cắt lại theo mốc mới
  document.querySelectorAll('img[src*="pilot_"],img[src*="af_"]').forEach(im => MAT.fit(im));
})();
