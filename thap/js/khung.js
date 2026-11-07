// TURRET MERGE — KHUNG THẺ + TẤM NHỎ từ ảnh ChatGPT (S8, S9; cắt bằng tools/thap-cat-s89.py):
//  · the_khung_<bậc>.png: khung thẻ theo độ hiếm (trang/xanh/tim/vang/do) đặt TRÊN chân dung; the_khung_mv.png: thẻ chỉ huy.
//    Mọi khung đã chuẩn hoá: ô cửa sổ nằm cùng 1 chỗ (x 15.6–84.4 %, y 18.9–83.8 %) → 1 bộ CSS cho cả 6.
//  · ui_trieu_ic (vòng nút Summon) · ui_khay_doi (khay 6 ô dải đồng đội) · ui_lv (tấm LV/×N) · ui_gia (tấm giá)
//    · ui_den_xanh (đèn đủ mana) · ui_grow (ruy-băng GROW-UP).
//  Mỗi ảnh chỉ bật khi TẢI ĐƯỢC (lớp html.co-…) → thiếu ảnh thì giữ nguyên bản CSS cũ.
'use strict';
// FACE_BOX {id:[cx,cy,headH]} — khung ĐẦU (tóc → cằm) trong ảnh chân dung, % của cạnh ảnh 256 px (assets/pilot_<id>.png, af_<chỉ huy>.png).
//  Ảnh pilot_<id>.png = cắt lại từ tấm raw ChatGPT ở độ phân giải gốc, ĐỦ ĐẦU, đặc 100 %, KHÔNG dải mờ phía trên (tools/thap-pilot-net.py).
//  (Phần tử thứ 4 = 1 cũ — "ảnh gốc mất đỉnh đầu" — đã bỏ: ô raw cao hơn bản v2 nên lấy lại được cả tóc.)
//  Chú thích tay trên lưới 32 px (tools: docs/demo-hop-tuong/tuvan/mat/hero_all.png · card_all.png để soát lại).
//  MỌI chỗ hiện chân dung (trang ụ, trang chỉ huy, thẻ chọn bộ, thanh bộ bài, dải đồng đội/đối thủ, vào trận, kết quả, hướng dẫn…)
//  đều cắt quanh MẶT bằng matFit(): cửa sổ nhỏ → phóng vào mặt; cửa sổ rộng/thấp → cắt quanh đầu, không cắt quanh ngực.
const FACE_BOX = {canon:[54,32.2,37.5],xucxac:[45,60,66],lien:[50.8,33.3,53.3],phun:[47,27,44],sungluc:[44.7,28.3,55.3],bang:[48.8,31.3,53.3],doc:[52,23,45],mana:[38.5,29.2,57.4],tia:[28.2,23,41],set:[40.5,24.1,47.1],maychem:[30.2,28.2,55.3],phagiap:[59.1,27.3,53.3],bua:[52.9,31.1,57.8],nam:[65.2,30.3,63.5],bomhen:[50.9,25.1,61.5],nhanmana:[57,28.2,59.4],kiembang:[63.1,31.8,60.7],mimic:[59.1,31.8,60.7],chimang:[45,22,42],dichchuyen:[52,25,46],radar:[55,28.3,55.3],drone:[75.3,24.2,47.1],tron:[38.5,24.1,47.1],nangluong:[55,27.1,53.3],laser:[46.7,27.1,53.3],lanhgia:[67.3,30.3,63.5],mortar:[46.8,30.3,59.4],khuech:[55,20.9,45.1],vungdoc:[45,58,75],loa:[54.9,31.8,60.7],hutmana:[48.7,29.2,49.2],min:[59,31.8,60.7],cuongno:[48,23,46],baotuyet:[55,28.2,55.3],nhanban:[62,18,36],lienket:[50.9,27.3,53.3],kepha:[46.7,30.3,59.4],taylo:[54.9,28.3,63.5],khien:[42.7,27.3,53.3],hopbi:[48.8,32.3,71.8],nangsao:[34.4,33.8,64.8],tuthan:[30,54,52],xaotron:[55,31.7,60.7],epxung:[69.4,34.8,66.9],no5:[54.9,28.2,55.3],bao:[54.9,28.3,55.3],anhsang:[55,29.4,53.3],aten:[46.7,31.3,61.5],dongbo:[71.4,30.3,59.4],railgun:[59,29.4,57.4],vughep:[45,58,80],sinhdoi:[55,28.3,55.3],hasao:[32.3,31.7,60.7],saochep:[50.9,33.8,64.8],ngoisao:[65,27,54],soi:[48.7,26.6,50.4],tienhoa:[42.7,31.2,61.5],cauvong:[63,25,48],wallgen:[35,62,72],orbital:[45,28,48],blackhole:[54.9,27.1,53.3],overlord:[58,25,46],lophanung:[46.8,29.4,57.4],haoquang:[59.1,29.2,53.3],nayda:[38.6,33.8,64.8],combo:[59,31.8,60.7],khoathoigian:[50.8,30.6,58.7],hydra:[34.5,30.7,58.7],cuuvi:[55,26,48],pandora:[45,23,43],luoicheo:[40.6,27.1,49.2],ngaithoigian:[52,20,40],nemesis:[48.7,25.1,49.2],docton:[52,22,41],thaukinh:[50.9,24.1,47.1],nhieusong:[60,23,44],santhuong:[46.7,31.7,60.7],nhatthuc:[37,25,48],loren:[50.8,30.7,58.7],guongcong:[71.3,33.9,64.8],marionette:[32.4,27.1,53.3],chuato:[50,27,50],leviathan:[44.7,25.1,49.2],khoisinh:[42.6,27.3,53.3],ronglua:[42.7,23,45.1],af_hero:[46.9,24.4,44.9],af_dahlia:[48.8,22.5,41],af_eve:[54.7,26.4,41]};
const MAT = {
  re: /(?:pilot_(\w+)|(af_\w+))\.(?:png|webp)/,
  id(img) { const m = this.re.exec(img.getAttribute('src') || ''); return m ? (m[1] || m[2]) : null; },
  // tính & gán cắt cho 1 ảnh: object-position (cover) + phóng thêm (scale + clip-path) khi cửa sổ nhỏ
  fit(img) {
    const id = this.id(img), f = id && FACE_BOX[id];
    if (!f) { if (img._mat) this.xoa(img); return; }
    const W = img.clientWidth, H = img.clientHeight, nw = img.naturalWidth || 256, nh = img.naturalHeight || 256;
    if (!W || !H) return;
    const cs = getComputedStyle(img);
    if (cs.objectFit !== 'cover') { if (img._mat) this.xoa(img); return; }
    const cx = f[0] / 100 * nw, cy = f[1] / 100 * nh, hh = f[2] / 100 * nh, top = cy - hh / 2;
    const c = Math.max(W / nw, H / nh);                     // tỉ lệ cover
    const can = hh * (f[3] ? 1.12 : 1.26);                                  // đầu + lề trên 14 % + lề dưới 12 %
    const nho = H < 96, muc = nho ? 0.78 : 0.5;              // đầu chiếm bao nhiêu chiều cao cửa sổ
    let k = Math.max(c, Math.min(muc * H / hh, H / can, c * (nho ? 2.2 : 1.7)));
    const vw = W / k, vh = H / k;
    const L = Math.max(0, Math.min(nw - vw, cx - vw / 2));
    const T = f[3] ? Math.max(0, Math.min(nh - vh, top)) : Math.max(0, Math.min(nh - vh, top - Math.max(hh * 0.14, (vh - hh) * 0.28)));
    const s = img.style; img._mat = 1;
    if (k <= c * 1.01) {
      const vw0 = W / c, vh0 = H / c;
      s.objectPosition = (nw - vw0 > 0.5 ? L / (nw - vw0) * 100 : 50).toFixed(1) + '% ' + (nh - vh0 > 0.5 ? T / (nh - vh0) * 100 : 50).toFixed(1) + '%';
      s.scale = ''; s.transformOrigin = ''; s.clipPath = '';
      return;
    }
    // phóng: ảnh cover ở tỉ lệ c, tâm cửa sổ mong muốn → scale z quanh gốc o, clip-path giữ ảnh trong ô
    const z = k / c, vw0 = W / c, vh0 = H / c, dx = L + vw / 2, dy = T + vh / 2;
    const L0 = Math.max(0, Math.min(nw - vw0, dx - vw0 / 2)), T0 = Math.max(0, Math.min(nh - vh0, dy - vh0 / 2));
    const px = (dx - L0) * c, py = (dy - T0) * c;
    const ox = (W / 2 - z * px) / (1 - z), oy = (H / 2 - z * py) / (1 - z);
    const a = ox * (1 - 1 / z), b = oy * (1 - 1 / z);
    s.objectPosition = (nw - vw0 > 0.5 ? L0 / (nw - vw0) * 100 : 50).toFixed(1) + '% ' + (nh - vh0 > 0.5 ? T0 / (nh - vh0) * 100 : 50).toFixed(1) + '%';
    s.transformOrigin = ox.toFixed(2) + 'px ' + oy.toFixed(2) + 'px';
    s.scale = z.toFixed(4);
    const r = parseFloat(cs.borderTopLeftRadius) || 0;
    s.clipPath = 'inset(' + b.toFixed(2) + 'px ' + (W - a - W / z).toFixed(2) + 'px ' + (H - b - H / z).toFixed(2) + 'px ' + a.toFixed(2) + 'px' + (r ? ' round ' + (r / z).toFixed(2) + 'px' : '') + ')';
  },
  xoa(img) { const s = img.style; s.objectPosition = ''; s.scale = ''; s.transformOrigin = ''; s.clipPath = ''; img._mat = 0; },
  gan(img) {
    if (!this.id(img) && !img._mat) return;
    if (!img._matNghe) {
      img._matNghe = 1;
      img.addEventListener('load', () => this.fit(img));
      if (this.ro) this.ro.observe(img);
    }
    if (img.complete) this.fit(img);
  },
};
function pilotFit(img) { MAT.gan(img); } // tên cũ (các file khác có thể gọi)
(() => {
  MAT.ro = 'ResizeObserver' in window ? new ResizeObserver((es) => { for (const e of es) MAT.fit(e.target); }) : null;
  const quet = (n) => { if (n.nodeType !== 1) return; if (n.tagName === 'IMG') MAT.gan(n); else n.querySelectorAll('img[src*="pilot_"],img[src*="af_"]').forEach(im => MAT.gan(im)); };
  const bat = () => { quet(document.body); new MutationObserver(ms => { for (const m of ms) { if (m.type === 'attributes') MAT.gan(m.target); else m.addedNodes.forEach(quet); } })
    .observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] }); };
  if (document.body) bat(); else document.addEventListener('DOMContentLoaded', bat);
  addEventListener('resize', () => document.querySelectorAll('img[src*="pilot_"],img[src*="af_"]').forEach(im => MAT.fit(im)));
})();
const KHUNG = {
  bat: {},
  tai(src, lop, cb) {
    const im = new Image();
    im.onload = () => { this.bat[lop] = true; document.documentElement.classList.add(lop); if (cb) cb(); };
    im.src = typeof anhUrl === 'function' ? anhUrl(src) : 'assets/' + src + '.png';
  },
  // ?v=băm (js/ver-anh.js lúc xuất bản): khung Pass 9 đổi cỡ ảnh (lề hoạ tiết) → điện thoại không được dùng ảnh cũ trong bộ đệm
  url(bac) { const t = 'the_khung_' + bac, v = (typeof ANH_V !== 'undefined' && ANH_V[t]) ? '?v=' + ANH_V[t] : ''; return typeof anhUrl === 'function' ? anhUrl(t) : 'assets/' + t + '.png' + v; },
  // thêm khung vào 1 thẻ (DOM): chỉ ảnh khung — KHÔNG thêm vạch màu khoá/độ hiếm bên trong (khung ảnh đã đủ; màu khoá chỉ còn ở huy hiệu glyph PNG)
  gan(el, bac) {
    if (!el || el.querySelector(':scope > .kh')) return;
    const im = document.createElement('img'); im.className = 'kh'; im.alt = ''; im.src = this.url(bac);
    el.append(im); el.classList.add('co-kh');
  },
};
(() => {
  // khung: cần đủ 6 ảnh mới bật (tránh thẻ có thẻ không)
  // khởi động nhanh: tải SAU khi HOME hiện (TAI.sauHome) — các lớp co-* chỉ dùng ở màn bộ bài / trận
  const lam = (f) => (typeof TAI !== 'undefined' && TAI.sauHome ? TAI.sauHome(f) : f());
  lam(() => {
  let n = 0; const xong = () => { if (++n === 6) document.documentElement.classList.add('co-khung'); };
  for (const b of ['trang', 'xanh', 'tim', 'vang', 'do', 'mv']) KHUNG.tai('the_khung_' + b, 'co-k-' + b, xong);
  KHUNG.tai('ui_khay_doi', 'co-khay', () => { if (typeof DP !== 'undefined' && DP.el && !DP.el.hidden) DP.ve(); });
  KHUNG.tai('ui_lv', 'co-lv'); KHUNG.tai('ui_gia', 'co-gia'); KHUNG.tai('ui_den_xanh', 'co-den');
  KHUNG.tai('ui_trieu_ic', 'co-trieu', () => { const im = document.querySelector('#nut-trieu .tr-cap > img'); if (im) { im.src = typeof anhUrl === 'function' ? anhUrl('ui_trieu_ic') : 'assets/ui_trieu_ic.png'; im.classList.add('ic-trieu'); } });
  });
  if (typeof UI === 'undefined') return;
  const bac = (id) => (G.rosterMap[id] && G.rosterMap[id].bac) || 'trang';
  const vaoGoc = UI.vaoTran;
  UI.vaoTran = function () {
    const r = vaoGoc.apply(this, arguments);
    document.querySelectorAll('#bo-the .the').forEach(d => KHUNG.gan(d, bac(d.dataset.id)));
    KHUNG.gan($('#the-mv'), 'mv');
    return r;
  };
  const theGoc = UI.theChon;
  UI.theChon = function (r) { const c = theGoc.apply(this, arguments); KHUNG.gan(c, r.bac); return c; };
  const boGoc = UI.veBoChon;
  UI.veBoChon = function () {
    const r = boGoc.apply(this, arguments);
    $('#chon-bo').querySelectorAll('.o-bo').forEach(o => { if (o.dataset.id) KHUNG.gan(o, bac(o.dataset.id)); });
    // đủ 5 ụ → ẩn dấu '+' (thêm) trên thẻ chưa chọn; chạm ô/thẻ đã chọn vẫn bỏ/đổi được
    $('#chon').classList.toggle('bo-du', UI.chon.length >= 5);
    return r;
  };
  // màn chọn đã vẽ trước khi file này nạp → vẽ lại 1 lần
  if (!$('#chon').hidden && UI.veChon && G.roster && G.roster.length) UI.veChon();
})();
