// TURRET MERGE — KHUNG THẺ + TẤM NHỎ từ ảnh ChatGPT (S8, S9; cắt bằng tools/thap-cat-s89.py):
//  · the_khung_<bậc>.png: khung thẻ theo độ hiếm (trang/xanh/tim/vang/do) đặt TRÊN chân dung; the_khung_mv.png: thẻ chỉ huy.
//    Mọi khung đã chuẩn hoá: ô cửa sổ nằm cùng 1 chỗ (x 15.6–84.4 %, y 18.9–83.8 %) → 1 bộ CSS cho cả 6.
//  · ui_trieu_ic (vòng nút Summon) · ui_khay_doi (khay 6 ô dải đồng đội) · ui_lv (tấm LV/×N) · ui_gia (tấm giá)
//    · ui_den_xanh (đèn đủ mana) · ui_grow (ruy-băng GROW-UP).
//  Mỗi ảnh chỉ bật khi TẢI ĐƯỢC (lớp html.co-…) → thiếu ảnh thì giữ nguyên bản CSS cũ.
'use strict';
// FACE_BOX {id:[cx,cy,headH]} — khung ĐẦU (tóc → cằm) trong ảnh chân dung, % của cạnh ảnh 256 px (assets/pilot_<id>.png, af_<chỉ huy>.png).
//  Phần tử thứ 4 = 1: ảnh GỐC bị cắt mất đỉnh đầu (thap-art/redo/pilot_<id>_v2.png) → phần trên là dải mờ kéo dài (tools/thap-pilot-fit.py);
//  cửa sổ bắt đầu NGAY dưới dải mờ (mắt rõ, không bị mảng mờ che) — chờ ảnh vẽ lại đủ đầu (HINH-VE-CODE-AUDIT.md).
//  Chú thích tay trên lưới 32 px (tools: docs/demo-hop-tuong/tuvan/mat/hero_all.png · card_all.png để soát lại).
//  MỌI chỗ hiện chân dung (trang ụ, trang chỉ huy, thẻ chọn bộ, thanh bộ bài, dải đồng đội/đối thủ, vào trận, kết quả, hướng dẫn…)
//  đều cắt quanh MẶT bằng matFit(): cửa sổ nhỏ → phóng vào mặt; cửa sổ rộng/thấp → cắt quanh đầu, không cắt quanh ngực.
const FACE_BOX = {canon:[54.7,41,46.9],xucxac:[58.6,47.9,64.5],lien:[50.8,43,50.8],phun:[64.5,37.1,43],sungluc:[44.9,38.1,52.7],bang:[48.8,41,50.8],doc:[58.6,23.2,27.7,1],mana:[39.1,39.1,54.7],tia:[29.3,33.2,39.1],set:[41,34.2,44.9],maychem:[31.2,38.1,52.7],phagiap:[58.6,37.1,50.8],bua:[52.7,40.8,55.1],nam:[64.5,40,60.5],bomhen:[50.8,35.2,58.6],nhanmana:[56.6,38.1,56.6],kiembang:[62.5,41.4,57.8],mimic:[58.6,41.4,57.8],chimang:[31.2,27.7,36.7,1],dichchuyen:[52.7,24.2,29.7,1],radar:[54.7,38.1,52.7],drone:[74.2,34.2,44.9],tron:[39.1,34.2,44.9],nangluong:[54.7,37.1,50.8],laser:[46.9,37.1,50.8],lanhgia:[66.4,40,60.5],mortar:[46.9,40,56.6],khuech:[54.7,31.2,43],vungdoc:[39.1,41.4,57.8],loa:[54.7,41.4,57.8],hutmana:[48.8,39.1,46.9],min:[58.6,41.4,57.8],cuongno:[44.9,30.3,37.1],baotuyet:[54.7,38.1,52.7],nhanban:[54.7,29.1,39.5,1],lienket:[50.8,37.1,50.8],kepha:[46.9,40,56.6],taylo:[54.7,38.1,60.5],khien:[43,37.1,50.8],hopbi:[48.8,42,68.4],nangsao:[35.2,43.4,61.7],tuthan:[39.1,42.4,59.8],xaotron:[54.7,41.4,57.8],epxung:[68.4,44.3,63.7],no5:[54.7,38.1,52.7],bao:[54.7,38.1,52.7],anhsang:[54.7,39.1,50.8],aten:[46.9,41,58.6],dongbo:[70.3,40,56.6],railgun:[58.6,39.1,54.7],vughep:[52.7,41,66.4],sinhdoi:[54.7,38.1,52.7],hasao:[33.2,41.4,57.8],saochep:[50.8,43.4,61.7],ngoisao:[64.5,29.1,33.2],soi:[48.8,36.5,48],tienhoa:[43,41,58.6],cauvong:[46.9,34.2,44.9],wallgen:[54.7,41,58.6],orbital:[50.8,31.2,43],blackhole:[54.7,37.1,50.8],overlord:[58.6,22.7,26.6,1],lophanung:[46.9,39.1,54.7],haoquang:[58.6,39.1,50.8],nayda:[39.1,43.4,61.7],combo:[58.6,41.4,57.8],khoathoigian:[50.8,40.4,55.9],hydra:[35.2,40.4,55.9],cuuvi:[44.9,33.2,46.9],pandora:[43,34.2,44.9],luoicheo:[41,37.1,46.9],ngaithoigian:[56.6,34.2,44.9],nemesis:[48.8,35.2,46.9],docton:[52.7,22.7,26.6,1],thaukinh:[50.8,34.2,44.9],nhieusong:[60.5,24.2,29.7,1],santhuong:[46.9,41.4,57.8],nhatthuc:[62.5,31.2,43],loren:[50.8,40.4,55.9],guongcong:[70.3,43.4,61.7],marionette:[33.2,37.1,50.8],chuato:[50.8,30.1,41.4,1],leviathan:[44.9,35.2,46.9],khoisinh:[43,37.1,50.8],ronglua:[43,33.2,43],af_hero:[46.9,24.4,44.9],af_dahlia:[48.8,22.5,41],af_eve:[54.7,26.4,41]};
const MAT = {
  re: /(?:pilot_(\w+)|(af_\w+))\.png/,
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
    im.src = 'assets/' + src + '.png';
  },
  url(bac) { return 'assets/the_khung_' + bac + '.png'; },
  // thêm khung vào 1 thẻ (DOM): chỉ ảnh khung — KHÔNG thêm vạch màu khoá/độ hiếm bên trong (khung ảnh đã đủ; màu khoá chỉ còn ở huy hiệu glyph PNG)
  gan(el, bac) {
    if (!el || el.querySelector(':scope > .kh')) return;
    const im = document.createElement('img'); im.className = 'kh'; im.alt = ''; im.src = this.url(bac);
    el.append(im); el.classList.add('co-kh');
  },
};
(() => {
  // khung: cần đủ 6 ảnh mới bật (tránh thẻ có thẻ không)
  let n = 0; const xong = () => { if (++n === 6) document.documentElement.classList.add('co-khung'); };
  for (const b of ['trang', 'xanh', 'tim', 'vang', 'do', 'mv']) KHUNG.tai('the_khung_' + b, 'co-k-' + b, xong);
  KHUNG.tai('ui_khay_doi', 'co-khay', () => { if (typeof DP !== 'undefined' && DP.el && !DP.el.hidden) DP.ve(); });
  KHUNG.tai('ui_lv', 'co-lv'); KHUNG.tai('ui_gia', 'co-gia'); KHUNG.tai('ui_den_xanh', 'co-den');
  KHUNG.tai('ui_trieu_ic', 'co-trieu', () => { const im = document.querySelector('#nut-trieu .tr-cap > img'); if (im) { im.src = 'assets/ui_trieu_ic.png'; im.classList.add('ic-trieu'); } });
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
