// TURRET MERGE — GIAO DIỆN NGOÀI TRẬN ANIME "Royal Twilight" (B3, 09/11 — docs/demo-hop-tuong/tuvan/huong-anime/: TU-VAN-CHATGPT.md mục
//  HOME + màn phụ, BANG-MAU.md). Đồng bộ với HUD trận (hud-anime.*): bỏ khung thép/đinh tán/bánh răng ở HOME, bộ bài, bộ sưu tập,
//  trang ụ, cửa hàng, vòng quay, nhiệm vụ, sự kiện, trùm, cài đặt, bảng trượt, hộp thoại.
//  · CHỈ ảnh ChatGPT đã cắt (tools/thap-cat-ui3.py → assets/ua_*.png|jpg; khung bậc dùng chung ha_khung_* của HUD trận) + chữ/số DOM
//    (thap/QUY-TAC-HINH.md). Component chung (css/ui-anime.css): nút chính cam đào ua_nut_chinh · nút phụ chàm ua_nut_phu · nút tròn
//    ua_nut_tron/ua_ic_* · pill ua_pill_bat/tat · tấm ua_tam · ô ua_o · nền ua_nen · icon tài nguyên ua_ts_*.
//  · Bật bằng lớp html.ua NGAY khi tệp chạy (trước khi màn tải đo ảnh HOME → ảnh mới tải cùng HOME, không chớp giao diện cũ);
//    một ảnh lỗi tải → gỡ lớp + trả icon cũ (giao diện cũ y nguyên). ?ua=0 → tắt hẳn.
//  · Không đổi luật/số liệu; PLAY khi bộ bài chưa đủ 5 → chữ "BUILD DECK" (bấm vẫn là HM.choi() → mở màn bộ bài như cũ).
'use strict';
const UA = {
  ANH: ['ua_nen', 'ua_nut_chinh', 'ua_nut_phu', 'ua_nut_tron', 'ua_pill_bat', 'ua_pill_tat', 'ua_tam', 'ua_o', 'ua_mien',
    'ua_ic_nv', 'ua_ic_shop', 'ua_ic_sk', 'ua_ic_vq', 'ua_ic_deck', 'ua_ic_bst', 'ua_ic_trum', 'ua_ic_cai',
    'ua_ic_lui', 'ua_ic_dong', 'ua_ic_loc', 'ua_ic_tim', 'ua_ic_tin', 'ua_ic_xong',
    'ua_ts_mana', 'ua_ts_vang', 'ua_ts_ngoc', 'ua_ts_do', 'ua_ts_sk', 'ua_ts_xp'],
  // ảnh cũ → ảnh mới (src <img> do JS/HTML đặt). Ngọc (tiền ngoài trận) = kim cương hồng; MANA (trong trận) = lục giác teal.
  DOI: {
    p7_ic_caidat: 'ua_ic_cai', p7_ic_lui: 'ua_ic_lui', p7_ic_dong: 'ua_ic_dong', p7_ic_loc: 'ua_ic_loc', p7_ic_tim: 'ua_ic_tim',
    p7_ic_tin: 'ua_ic_tin', p7_ic_xong: 'ua_ic_xong', p7_ic_bomau: 'ua_ic_deck', ic_lui: 'ua_ic_lui',
    shop_vang: 'ua_ts_vang', shop_ngoc: 'ua_ts_ngoc', h2_ngoc: 'ua_ts_mana', ui_mana: 'ua_ts_mana',
    shop_nut_nv: 'ua_ic_nv', shop_nut_shop: 'ua_ic_shop', shop_nut_sk: 'ua_ic_sk', shop_nut_vq: 'ua_ic_vq',
  },
  bat: false, _cu: null,
  a(n) { return n === 'ua_nen' ? 'assets/ua_nen.jpg' : (typeof anhUrl === 'function' ? anhUrl(n) : 'assets/' + n + '.png'); },
  tat() { return /[?&]ua=0\b/.test(location.search); },
  // ---- bật ngay (lạc quan) + kiểm ảnh; lỗi → gỡ ----
  batDau() {
    if (this.tat()) return;
    this.bat = true;
    document.documentElement.classList.add('ua');
    this.doiDuLieu(true);
    let n = 0, loi = 0;
    const xong = () => { if (++n < this.ANH.length) return; if (loi) this.go(); };
    for (const s of this.ANH) { const im = new Image(); im.onload = xong; im.onerror = () => { loi++; xong(); }; im.src = this.a(s); }
    this.theoDoi();
  },
  go() {
    console.warn('UA: thiếu ảnh giao diện anime → giữ giao diện cũ');
    this.bat = false; document.documentElement.classList.remove('ua'); this.doiDuLieu(false);
    document.querySelectorAll('img[data-ua-cu]').forEach(im => { im.src = im.dataset.uaCu; delete im.dataset.uaCu; });
    try { if (typeof HM !== 'undefined') HM.ve(); } catch (e) { }
  },
  // KTA (cửa hàng/nhiệm vụ…) + TIEN/CHI (ngọc mana) đọc lúc vẽ → đổi tên ảnh tại chỗ; gỡ thì trả lại
  doiDuLieu(bat) {
    if (bat) {
      if (this._cu) return;
      const c = this._cu = {};
      if (typeof KTA !== 'undefined') {
        c.kta = { vang: KTA.vang, ngoc: KTA.ngoc, xong: KTA.xong, tin: KTA.tin, lui: KTA.lui, nut: Object.assign({}, KTA.nut) };
        KTA.vang = 'ua_ts_vang'; KTA.ngoc = 'ua_ts_ngoc'; KTA.xong = 'ua_ic_xong'; KTA.tin = 'ua_ic_tin'; KTA.lui = 'ua_ic_lui';
        KTA.nut = { shop: 'ua_ic_shop', vq: 'ua_ic_vq', nv: 'ua_ic_nv', sk: 'ua_ic_sk' };
      }
      if (typeof TIEN !== 'undefined') { c.tien = TIEN.mana.glyph; TIEN.mana.glyph = 'ua_ts_mana'; }
      if (typeof CHI !== 'undefined') { c.chi = [CHI.trieu.icon, CHI.mv.icon]; CHI.trieu.icon = CHI.mv.icon = 'ua_ts_mana'; }
    } else if (this._cu) {
      const c = this._cu; this._cu = null;
      if (c.kta) Object.assign(KTA, c.kta);
      if (c.tien) TIEN.mana.glyph = c.tien;
      if (c.chi) { CHI.trieu.icon = c.chi[0]; CHI.mv.icon = c.chi[1]; }
    }
  },
  // <img> mang ảnh cũ trong vùng ngoài trận → ảnh mới (giữ src cũ ở data-ua-cu để gỡ)
  quet(goc) {
    if (!this.bat || !goc || !goc.querySelectorAll) return;
    const ds = goc.tagName === 'IMG' ? [goc] : goc.querySelectorAll('img');
    for (const im of ds) {
      const u = im.getAttribute('src') || im.getAttribute('data-tm-src'); if (!u) continue;
      const m = /assets\/([a-z0-9_]+)\.(?:png|webp)/.exec(u); if (!m || !this.DOI[m[1]]) continue;
      if (im.closest('#duoi, #top, #bo-the, #the-mv, #mana-hop')) continue; // HUD trận: phiên hud-anime lo
      const moi = this.a(this.DOI[m[1]]);
      if (!im.dataset.uaCu) im.dataset.uaCu = u;
      if (im.hasAttribute('src')) im.src = moi; else im.setAttribute('data-tm-src', moi);
    }
  },
  theoDoi() {
    const chay = () => {
      const w = document.getElementById('wrap'); if (!w) return;
      this.quet(document.body);
      new MutationObserver(ms => { if (!this.bat) return; for (const m of ms) { if (m.type === 'attributes') this.quet(m.target); else for (const n of m.addedNodes) if (n.nodeType === 1) this.quet(n); } })
        .observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'data-tm-src'] });
    };
    if (document.body) chay(); else addEventListener('DOMContentLoaded', chay);
  },
  // ---- HOME: PLAY ↔ BUILD DECK; thẻ cấp phi công (icon XP + thanh teal) ----
  veHome() {
    if (!this.bat) return;
    const nut = document.getElementById('hm-choi'); if (!nut) return;
    const b = nut.querySelector('b'), n = (typeof UI !== 'undefined' && UI.chon) ? UI.chon.length : 5;
    const chu = n === 5 ? 'PLAY' : 'BUILD DECK';
    if (b && b.dataset.ua !== chu) { b.dataset.ua = chu; b.textContent = chu; }
    nut.classList.toggle('ua-xay', n !== 5);
    nut.setAttribute('aria-label', n === 5 ? 'Play' : 'Build deck');
    const cap = document.getElementById('tt-cap');
    if (cap && !cap.querySelector('.ua-xp')) cap.insertAdjacentHTML('afterbegin', '<img class="ua-xp" src="' + this.a('ua_ts_xp') + '" alt="" draggable="false">');
  },
  boc() {
    if (typeof HM !== 'undefined' && !HM._ua) {
      HM._ua = true;
      const g = HM.veHome.bind(HM);
      HM.veHome = function () { const r = g(); UA.veHome(); return r; };
    }
    this.veHome();
  },
};
UA.batDau();
addEventListener('DOMContentLoaded', () => { try { UA.boc(); } catch (e) { console.warn('UA', e); } });
