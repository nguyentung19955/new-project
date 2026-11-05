// TURRET MERGE — KHUNG THẺ + TẤM NHỎ từ ảnh ChatGPT (S8, S9; cắt bằng tools/thap-cat-s89.py):
//  · the_khung_<bậc>.png: khung thẻ theo độ hiếm (trang/xanh/tim/vang/do) đặt TRÊN chân dung; the_khung_mv.png: thẻ chỉ huy.
//    Mọi khung đã chuẩn hoá: ô cửa sổ nằm cùng 1 chỗ (x 15.6–84.4 %, y 18.9–83.8 %) → 1 bộ CSS cho cả 6.
//  · ui_trieu_ic (vòng nút Summon) · ui_khay_doi (khay 6 ô dải đồng đội) · ui_lv (tấm LV/×N) · ui_gia (tấm giá)
//    · ui_den_xanh (đèn đủ mana) · ui_grow (ruy-băng GROW-UP).
//  Mỗi ảnh chỉ bật khi TẢI ĐƯỢC (lớp html.co-…) → thiếu ảnh thì giữ nguyên bản CSS cũ.
'use strict';
// PILOT_FIT {id:[x%,y%,scale]} — vị trí chân dung phi công trong ô cửa sổ khung (object-position x y + phóng).
//  Ảnh assets/pilot_<id>.png đã được thêm khoảng trống trên đầu (tools/thap-pilot-fit.py, gốc ở thap-art/redo/pilot_<id>_v2/v3.png)
//  → đầu + tóc nằm trọn trong ô cửa sổ; x canh mặt vào giữa khi ô hẹp, y thấp giữ đầu khi ô rộng (dải đồng đội, trang ụ).
const PILOT_FIT = {canon:[43,8,1],xucxac:[20,8,1],lien:[22,8,1],phun:[20,8,1],sungluc:[39,8,1],bang:[50,8,1],doc:[31,8,1],mana:[20,8,1],tia:[20,8,1],set:[20,8,1],maychem:[20,8,1],phagiap:[69,8,1],bua:[55,8,1],nam:[80,8,1],bomhen:[54,8,1],nhanmana:[80,8,1],kiembang:[80,8,1],mimic:[61,8,1],chimang:[20,8,1],dichchuyen:[55,8,1],radar:[80,8,1],drone:[80,8,1],tron:[28,8,1],nangluong:[65,8,1],laser:[20,8,1],lanhgia:[80,8,1],mortar:[20,8,1],khuech:[20,8,1],vungdoc:[20,8,1],loa:[20,8,1],hutmana:[31,8,1],min:[80,8,1],cuongno:[26,8,1],baotuyet:[76,8,1],nhanban:[52,8,1],lienket:[50,8,1],kepha:[35,8,1],taylo:[80,8,1],khien:[20,8,1],hopbi:[65,8,1],nangsao:[20,8,1],tuthan:[21,8,1],xaotron:[70,8,1],epxung:[80,8,1],no5:[70,8,1],bao:[20,8,1],anhsang:[54,8,1],aten:[20,8,1],dongbo:[80,8,1],railgun:[63,8,1],vughep:[20,8,1],sinhdoi:[50,8,1],hasao:[80,8,1],saochep:[26,8,1],ngoisao:[80,8,1],soi:[20,8,1],tienhoa:[39,8,1],cauvong:[35,8,1],wallgen:[20,8,1],orbital:[20,8,1],blackhole:[72,8,1],overlord:[24,8,1],lophanung:[20,8,1],haoquang:[80,8,1],nayda:[46,8,1],combo:[80,8,1],khoathoigian:[45,8,1],hydra:[20,8,1],cuuvi:[58,8,1],pandora:[80,8,1],luoicheo:[20,8,1],ngaithoigian:[74,8,1],nemesis:[30,8,1],docton:[20,8,1],thaukinh:[20,8,1],nhieusong:[80,8,1],santhuong:[30,8,1],nhatthuc:[59,8,1],loren:[22,8,1],guongcong:[80,8,1],marionette:[20,8,1],chuato:[20,8,1],leviathan:[20,8,1],khoisinh:[26,8,1],ronglua:[20,8,1]};
function pilotFit(img) {
  const m = /pilot_(\w+)\.png/.exec(img.getAttribute('src') || ''); if (!m) return;
  const f = PILOT_FIT[m[1]]; if (!f) return;
  img.style.objectPosition = f[0] + '% ' + f[1] + '%';
  if (f[2] !== 1) { img.style.transform = 'scale(' + f[2] + ')'; img.style.transformOrigin = f[0] + '% ' + f[1] + '%'; }
}
(() => {
  const quet = (n) => { if (n.nodeType !== 1) return; if (n.tagName === 'IMG') pilotFit(n); else n.querySelectorAll('img[src*="pilot_"]').forEach(pilotFit); };
  const bat = () => { quet(document.body); new MutationObserver(ms => { for (const m of ms) { if (m.type === 'attributes') pilotFit(m.target); else m.addedNodes.forEach(quet); } })
    .observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] }); };
  if (document.body) bat(); else document.addEventListener('DOMContentLoaded', bat);
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
