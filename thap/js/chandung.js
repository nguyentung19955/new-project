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
  canon: [0, 30.2, 52, 48], xucxac: [30.1, 54.2, 31.9, 78], lien: [0, 30.2, 49.9, 47], phun: [2, 30, 45, 50], sungluc: [0, 28.2, 50.1, 50], bang: [0, 30.3, 55.3, 52],
  doc: [4, 29, 45, 42], mana: [0, 30.2, 39.4, 50], tia: [2.9, 27, 44.7, 52], set: [0.8, 28.1, 44.7, 47], maychem: [0.8, 29.1, 44.7, 52], phagiap: [0, 28.2, 52.2, 47],
  bua: [0, 32.4, 44.8, 55], nam: [0.9, 33.4, 55.2, 52], bomhen: [0, 33.3, 52.2, 52], nhanmana: [0, 32.3, 55.3, 50], kiembang: [0, 35.5, 58.3, 55], mimic: [0, 35.5, 52.2, 55],
  chimang: [2, 33, 45, 47], dichchuyen: [1, 35, 52, 50], radar: [0, 30.3, 60.6, 55], drone: [0.9, 28.2, 62.5, 47], tron: [0, 28.1, 44.7, 48],
  nangluong: [0, 32.3, 58.5, 50], laser: [0, 30.2, 49.9, 50], lanhgia: [0, 28.2, 62.7, 47], mortar: [0, 24, 44.8, 40], khuech: [0, 22.8, 55.3, 42],
  vungdoc: [20, 49.5, 23.5, 80], loa: [0, 30.3, 55.2, 50], hutmana: [0, 28.1, 41.5, 47], min: [0, 30.3, 58.3, 50], cuongno: [10.3, 30.9, 30, 50],
  baotuyet: [0, 32.3, 62.7, 50], nhanban: [1, 22, 62, 38], lienket: [0, 28.2, 62.7, 47], kepha: [0, 32.4, 44.7, 52], taylo: [0, 30.3, 55.2, 50], khien: [0, 28.2, 44.8, 48],
  hopbi: [0, 32.3, 50.1, 53], nangsao: [0, 32.3, 39.4, 50], tuthan: [36, 47.6, 23.7, 68], xaotron: [0, 34.4, 39.6, 52], epxung: [0, 27.1, 65.8, 48], no5: [0, 27, 60.4, 50],
  bao: [0, 35.5, 52, 55], anhsang: [0, 30.3, 62.7, 52], aten: [0, 30.3, 55.2, 50], dongbo: [0, 30.3, 73.2, 48], railgun: [0, 27.1, 55.2, 45], vughep: [26.9, 50.3, 32, 75],
  sinhdoi: [0, 25, 60.6, 45], hasao: [0, 28.1, 44.7, 47], saochep: [0, 30.2, 58.5, 50], ngoisao: [8.5, 27.6, 43.8, 47], soi: [0, 28.2, 52, 50], tienhoa: [0, 27, 50.1, 47],
  cauvong: [3, 29.5, 28.5, 50], wallgen: [27, 49.5, 29, 78], orbital: [2, 35.3, 33.9, 55], blackhole: [0, 30.2, 60.4, 50], overlord: [8, 30, 60, 45],
  lophanung: [0, 27.1, 44.8, 52], haoquang: [0, 28.1, 60.6, 47], nayda: [0, 32.3, 41.7, 50], combo: [0, 30.3, 58.3, 50], khoathoigian: [0, 27, 49.9, 47],
  hydra: [3, 27.1, 39.6, 50], cuuvi: [5, 30, 45, 52], pandora: [6, 28, 45, 48], luoicheo: [0, 28.1, 44.8, 50], ngaithoigian: [8.6, 28.5, 39.5, 50], nemesis: [0, 27, 55.2, 45],
  docton: [3, 22, 52, 38], thaukinh: [0, 27, 50.1, 45], nhieusong: [1, 26, 62, 42], santhuong: [0, 30.2, 55.2, 50], nhatthuc: [3, 31.2, 43.2, 52],
  loren: [0, 32.4, 44.7, 52], guongcong: [0, 32.4, 65.7, 52], marionette: [0, 28.1, 37.5, 50], chuato: [3, 28, 52, 47], leviathan: [0, 26, 52.2, 45],
  khoisinh: [0, 27.1, 41.5, 45], ronglua: [0, 24.9, 39.6, 45], af_hero: [4, 36, 50, 55], af_dahlia: [4, 35, 55, 55], af_eve: [4, 35, 55, 55],
};
// ảnh LỚN trang ụ / chỉ huy (assets/hero/hero_<id>.jpg|webp 1170×1020 — tools/thap-hero.py, hiện 1:1, KHÔNG phóng): mốc riêng vì khung cắt khác pilot_<id>.png
const HERO_NEO = {
  canon: [0, 30, 55], xucxac: [0, 45, 55], lien: [0, 22, 55], phun: [0, 28, 60], sungluc: [0, 25, 60], bang: [0, 25, 60], doc: [6, 28, 40],
  mana: [3, 33, 45], tia: [3, 25, 45], set: [0, 22, 40], maychem: [0, 28, 45], phagiap: [0, 28, 45], bua: [0, 32, 45], nam: [3, 30, 48],
  bomhen: [0, 33, 50], nhanmana: [0, 35, 55], kiembang: [0, 40, 55], mimic: [0, 37, 55], chimang: [0, 40, 45], dichchuyen: [0, 40, 50],
  radar: [0, 30, 60], drone: [0, 32, 62], tron: [0, 20, 40], nangluong: [0, 33, 58], laser: [0, 40, 50], lanhgia: [0, 30, 60], mortar: [0, 20, 40],
  khuech: [0, 25, 55], vungdoc: [0, 40, 45], loa: [0, 40, 55], hutmana: [0, 28, 45], min: [0, 32, 50], cuongno: [0, 35, 45], baotuyet: [0, 32, 55],
  nhanban: [5, 40, 58], lienket: [0, 30, 55], kepha: [0, 45, 30], taylo: [0, 30, 50], khien: [0, 30, 50], hopbi: [0, 40, 45], nangsao: [0, 35, 45],
  tuthan: [0, 28, 45], xaotron: [0, 35, 30], epxung: [0, 30, 55], no5: [0, 30, 40], bao: [0, 40, 50], anhsang: [0, 33, 55], aten: [0, 30, 55],
  dongbo: [0, 25, 75], railgun: [0, 35, 55], vughep: [0, 52, 55], sinhdoi: [0, 22, 60], hasao: [0, 28, 50], saochep: [0, 30, 60], ngoisao: [0, 35, 65],
  soi: [0, 30, 50], tienhoa: [0, 35, 50], cauvong: [0, 35, 45], wallgen: [10, 45, 45], orbital: [0, 30, 52], blackhole: [0, 30, 60],
  overlord: [5, 40, 60], lophanung: [0, 25, 40], haoquang: [0, 35, 62], nayda: [0, 35, 45], combo: [0, 35, 58], khoathoigian: [0, 15, 50],
  hydra: [3, 30, 40], cuuvi: [0, 30, 45], pandora: [3, 25, 45], luoicheo: [0, 32, 45], ngaithoigian: [0, 30, 62], nemesis: [0, 28, 55],
  docton: [5, 28, 50], thaukinh: [0, 25, 50], nhieusong: [0, 35, 65], santhuong: [0, 28, 50], nhatthuc: [0, 30, 60], loren: [0, 33, 40],
  guongcong: [0, 30, 62], marionette: [0, 25, 45], chuato: [3, 40, 50], leviathan: [0, 30, 55], khoisinh: [0, 25, 40], ronglua: [0, 30, 30],
  af_hero: [0, 36, 50], af_dahlia: [0, 35, 55], af_eve: [5, 38, 55],
};
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
