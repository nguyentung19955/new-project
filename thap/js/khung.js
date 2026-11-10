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
const FACE_BOX = {canon:[55,30,38],xucxac:[46,31.5,59],lien:[46,35.5,43],phun:[48,30,60],sungluc:[46,29.5,59],bang:[37,36,68],doc:[44,46.5,57],mana:[50,36.5,67],tia:[52,33.5,63],set:[44,34.5,61],maychem:[63,33,62],phagiap:[56,37,50],bua:[60,53.5,47],nam:[50,32,58],bomhen:[41,43.5,69],nhanmana:[65,49.5,53],kiembang:[56,34,54],mimic:[45,37.5,75],chimang:[70,35.5,57],dichchuyen:[33,18.5,37],radar:[57,35,60],drone:[36,43.5,75],tron:[46,31.5,63],nangluong:[53,37,48],laser:[53,41.5,77],lanhgia:[67,41.5,49],mortar:[62,25.5,41],khuech:[44,33.5,63],vungdoc:[63,57.5,47],loa:[47,30.5,59],hutmana:[52,37,62],min:[57,37.5,67],cuongno:[58,36,66],baotuyet:[70,51,62],nhanban:[49,34.5,69],lienket:[60,41.5,55],kepha:[50,34.5,67],taylo:[50,47,62],khien:[55,37,62],hopbi:[50,36.5,73],nangsao:[62,52,54],tuthan:[58,52,46],xaotron:[68,49.5,75],epxung:[60,34.5,69],no5:[44,31.5,59],bao:[52,36,64],anhsang:[45,30.5,59],aten:[65,39,48],dongbo:[55,34.5,69],railgun:[47,35,62],vughep:[52,34,64],sinhdoi:[38,43.5,57],hasao:[63,53,26],saochep:[55,33,66],ngoisao:[70,32,58],soi:[40,44.5,33],tienhoa:[46,38.5,67],cauvong:[45,33,58],wallgen:[43,34.5,61],orbital:[60,37,50],blackhole:[61,40.5,55],overlord:[48,34.5,53],lophanung:[55,40,48],haoquang:[57,53,34],nayda:[57,36.5,71],combo:[55,35,70],khoathoigian:[57,35,62],hydra:[50,19.2,38.5],cuuvi:[49,41.5,59],pandora:[50,29.5,54.2],luoicheo:[55,42,56],ngaithoigian:[37,32.5,65],nemesis:[53,39.5,71],docton:[56,38.5,53],thaukinh:[47,54.5,85],nhieusong:[58,38.5,53],santhuong:[38,34.5,69],nhatthuc:[52,28.5,45],loren:[42,38,64],guongcong:[47,33.5,61],marionette:[47,31.5,63],chuato:[50,31.6,62.2],leviathan:[63,50.5,37],khoisinh:[51,36.5,59],ronglua:[50,32,58],af_hero:[46.9,24.4,44.9],af_dahlia:[48.8,22.5,41],af_eve:[54.7,26.4,41],af_tech:[57,15,27],af_tide:[55,16,30],af_twin:[52,18,26],af_hawk:[55,17,30],af_weaver:[52,16,30],bienmau:[47,36.5,73],hopca:[55,39.5,47],lualien:[61,42.5,55],luutru:[58,35.5,65],mauhut:[54,51,62],nguyenrua:[47,34.5,61],thanhdia:[50,29.2,56.3],xuonganh:[47,29,54],cobac:[59,36.5,47],tudo:[50,34.5,67],thacmana:[44,34,60],congap:[51,30.9,58.3],bocap:[44.4,45.3,57.2]};
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
    { const te = $('#the-mv'), B = G.ban[0], bm = typeof mvBac === 'function' && B && B.mv ? mvBac(B.mv.id) : 'mv'; KHUNG.gan(te, bm); const k = te && te.querySelector(':scope > .kh'); if (k) k.src = KHUNG.url(bm); } // khung thẻ chỉ huy theo BẬC (08/11)
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
