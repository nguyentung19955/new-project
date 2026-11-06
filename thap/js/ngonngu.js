// TURRET MERGE — NGÔN NGỮ (English / Tiếng Việt). Cài đặt → LANGUAGE. Mặc định English; lưu localStorage 'tm_lang'.
// Cách làm: chữ gốc tiếng Anh giữ nguyên trong code (TEXT ở text.js + chuỗi mô tả trong skills*.js…). Khi chọn Tiếng Việt:
//   1) TEXT được phủ bản TEXT_VI (dựng tự động từ từ điển VI_DICH — ngonngu-vi.js) → mọi chỗ đọc TEXT ra chữ Việt;
//   2) mọi chữ vẽ lên canvas (fillText/strokeText/measureText) và mọi chữ trong DOM (MutationObserver) đi qua NN.t():
//      tra nguyên câu → tra MẪU (số thay bằng #, tên ụ thay bằng @) → tách theo dấu ngăn ( · , — , ; , xuống dòng) rồi tra từng đoạn.
//   Chuỗi chưa có bản dịch → giữ tiếng Anh (khoá mới của session khác tự rơi về English) và được ghi vào NN.thieu (tools/thap-kt-vi.js).
// Tên ụ giữ tên riêng tiếng Anh (thẻ, bàn chơi); trang ụ hiện thêm tên Việt bên dưới (roster.json ten_vi).
'use strict';

const NN = (function () {
  let lang = 'en';
  try { const q = /[?&]lang=(en|vi)\b/.exec(location.search); lang = q ? q[1] : (localStorage.getItem('tm_lang') || 'en'); } catch (e) { }
  if (lang !== 'vi') lang = 'en';
  const D = typeof VI_DICH !== 'undefined' ? VI_DICH : {};       // nguyên câu EN → VI
  const M = typeof VI_MAU !== 'undefined' ? VI_MAU : {};         // mẫu EN (# = số, @ = tên ụ) → VI
  const GIU = new Set(typeof VI_GIU !== 'undefined' ? VI_GIU : []); // chữ giữ nguyên (tên riêng, đơn vị)
  const cache = new Map(), thieu = new Set();
  let VAL = null; // mọi bản Việt trong từ điển: chuỗi đã là tiếng Việt không dấu ('Tay nhanh') thì không dịch lại
  const laVi = (s) => { if (!VAL) { VAL = new Set(); for (const k in M) VAL.add(M[k].trim()); for (const k in D) VAL.add(D[k].trim()); }
    return VAL.has(s.trim()) || VAL.has(s.replace(/^[\s·—:;.,]+|[\s·—:;.,]+$/g, '')); };
  let ten = null, tenRe = null;
  function dungTen() {
    if (ten) return;
    ten = [];
    try { for (const k in TEXT.turret) ten.push(TEXT.turret[k].name); } catch (e) { }
    try { for (const k in (TEXT.boss || {})) ten.push(TEXT.boss[k].name); } catch (e) { }
    ten = ten.filter(Boolean).sort((a, b) => b.length - a.length);
    for (const n of ten) GIU.add(n);
    tenRe = new RegExp('(^|[^A-Za-z])(' + ten.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')(?![A-Za-z])', 'g');
  }
  const coChu = (s) => /[A-Za-z]{2,}/.test(s);
  const VIET = /[À-ÃÈ-ÊÌÍÒ-ÕÙÚÝà-ãè-êìíò-õùúýĂăĐđĨĩŨũƠơƯưẠ-ỹ]/;
  const SO = /\d+(?:[.,]\d+)*/g;
  // mẫu: thay số → #, tên ụ → @ ; trả về [khoá, số[], tên[]]
  function mau(s) {
    dungTen();
    const so = [], tn = [];
    let k = s.replace(SO, (m) => { so.push(m); return '#'; });
    if (tenRe) k = k.replace(tenRe, (m, a, n) => { tn.push(n); return a + '@'; });
    return [k, so, tn];
  }
  function dien(v, so, tn) {
    let i = 0, j = 0;
    return v.replace(/\{(\d)\}|#|@/g, (m, n) => (n ? (so[+n - 1] != null ? so[+n - 1] : '') : m === '#' ? (so[i++] != null ? so[i - 1] : '') : (tn[j++] != null ? tn[j - 1] : '')));
  }
  function traMot(s) {
    if (!coChu(s)) return s;
    if (Object.prototype.hasOwnProperty.call(D, s)) return D[s];
    if (Object.prototype.hasOwnProperty.call(M, s)) return M[s];
    if (GIU.has(s)) return s;
    const [k, so, tn] = mau(s);
    if (GIU.has(k)) return s;
    if (Object.prototype.hasOwnProperty.call(M, k)) return dien(M[k], so, tn);
    if (Object.prototype.hasOwnProperty.call(D, k)) return dien(D[k], so, tn);
    if (/^[@#\s★×+\-−→/·.,:%()]*$/.test(k)) return s; // chỉ tên ụ + số
    // chữ HOA ↔ thường: thử bản viết thường rồi viết hoa lại
    if (s === s.toUpperCase()) {
      const l = s.charAt(0) + s.slice(1).toLowerCase();
      if (Object.prototype.hasOwnProperty.call(D, l)) return D[l].toUpperCase();
      const [k2, so2, tn2] = mau(l);
      if (Object.prototype.hasOwnProperty.call(M, k2)) return dien(M[k2], so2, tn2).toUpperCase();
    }
    return null;
  }
  const NGAN = [/(\n)/, /(\. (?=[A-Z0-9+−(]))/, /( · | • )/, /( — | – )/, /(; )/, /( \| )/, /(: )/, /( → )/, /(, )/];
  // ghi chú trần chèn giữa câu (thatso.js: '41% (cap · LV raises it)') — dịch phần còn lại rồi chèn lại sau đúng con số đó
  const GHI_TRAN = ' (cap · LV raises it)', GHI_TRAN_VI = ' (trần · LV nâng được)';
  function tra(s) {
    const gi = s.indexOf(GHI_TRAN);
    if (gi >= 0) {
      const so = /(\d+(?:\.\d+)?%)$/.exec(s.slice(0, gi)), r0 = tra(s.slice(0, gi) + s.slice(gi + GHI_TRAN.length)); if (r0 == null) return null;
      const j = so ? r0.indexOf(so[1]) : -1; return j >= 0 ? r0.slice(0, j + so[1].length) + GHI_TRAN_VI + r0.slice(j + so[1].length) : r0 + GHI_TRAN_VI;
    }
    const r = traMot(s); if (r != null) return r;
    // tiền tố "3★  …" (bảng sao) / "LV9 · …"
    const tt = /^(\d+★\s+|LV\s?\d+\s·\s)([\s\S]+)$/.exec(s);
    if (tt) { const r3 = tra(tt[2]); if (r3 != null) return tt[1] + r3; }
    // "Nhãn +6% → +6.5%" (dòng cấp thẻ): dịch phần nhãn, giữ phần số
    const nh = /^([A-Za-z][A-Za-z ★+]*?) ([+−]?\d[\s\S]*)$/.exec(s);
    if (nh && !coChu(nh[2])) { const r4 = traMot(nh[1]); if (r4 != null) return r4 + ' ' + nh[2]; }
    // giữ khoảng trắng / dấu câu đầu-cuối
    const m = /^([\s(\[«"'“]*)([\s\S]*?)([\s.,!?:;)\]»"'”…]*)$/.exec(s);
    if (m && (m[1] || m[3]) && m[2]) { const r2 = traMot(m[2]); if (r2 != null) return m[1] + r2 + m[3]; }
    if (m && m[2] && !/[.!?]$/.test(m[2])) { const r5 = traMot(m[2] + '.'); if (r5 != null) return m[1] + r5.replace(/\.$/, '') + m[3]; } // đoạn câu mất dấu chấm khi tách
    // tách dần theo từng cấp dấu ngăn (câu → · → — → ; → : → xuống dòng → →): mọi đoạn đều dịch được thì ghép lại
    for (const re of NGAN) {
      if (!re.test(s)) continue;
      const p = s.split(re); if (p.length < 3) continue; let ok = true;
      const o = p.map((x, i) => { if (i % 2 || !ok) return x; if (!coChu(x) || VIET.test(x)) return x; const y = tra(x); if (y == null) { ok = false; return x; } return y; });
      if (ok) return o.join('');
    }
    return null;
  }
  function t(s) {
    if (lang !== 'vi' || s == null) return s;
    if (typeof s !== 'string') { if (typeof s === 'number') return s; s = String(s); }
    if (!coChu(s) || VIET.test(s) || laVi(s)) return s; // đã là tiếng Việt (chuỗi TEXT đã phủ, hoặc đã dịch trong DOM)
    let r = cache.get(s); if (r !== undefined) return r;
    r = tra(s);
    if (r == null) { r = s; if (thieu.size < 5000) thieu.add(s); }
    if (cache.size > 8000) cache.clear();
    cache.set(s, r); return r;
  }

  // ---------- TEXT_VI: bản sao cấu trúc TEXT, chữ đã dịch (hàm → bọc NN.t) ----------
  function dungVi(o) {
    if (typeof o === 'string') return t(o);
    if (typeof o === 'function') { const f = o; return function () { return t(f.apply(this, arguments)); }; }
    if (o && typeof o === 'object') { const r = Array.isArray(o) ? [] : {}; for (const k in o) r[k] = (k === 'name' || k === 'portrait') ? o[k] : dungVi(o[k]); return r; }
    return o;
  }
  function phu(dich, nguon) { for (const k in nguon) { const v = nguon[k]; if (v && typeof v === 'object' && !Array.isArray(v) && dich[k] && typeof dich[k] === 'object') phu(dich[k], v); else dich[k] = v; } }

  // ---------- canvas ----------
  function mocCanvas() {
    const P = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype; if (!P || P.__nn) return; P.__nn = 1;
    const f = P.fillText, sx = P.strokeText, me = P.measureText;
    P.fillText = function (s, x, y, w) { return w === undefined ? f.call(this, t(s), x, y) : f.call(this, t(s), x, y, w); };
    P.strokeText = function (s, x, y, w) { return w === undefined ? sx.call(this, t(s), x, y) : sx.call(this, t(s), x, y, w); };
    P.measureText = function (s) { return me.call(this, t(s)); };
    if (window.OffscreenCanvasRenderingContext2D) { const Q = OffscreenCanvasRenderingContext2D.prototype, f2 = Q.fillText, m2 = Q.measureText;
      Q.fillText = function (s, x, y, w) { return w === undefined ? f2.call(this, t(s), x, y) : f2.call(this, t(s), x, y, w); }; Q.measureText = function (s) { return m2.call(this, t(s)); }; }
  }
  // ---------- DOM ----------
  const BO = { SCRIPT: 1, STYLE: 1, TEMPLATE: 1, TEXTAREA: 1, INPUT: 1 };
  function dichNut(n) {
    if (n.nodeType === 3) {
      const p = n.parentNode; if (!p || BO[p.nodeName] || (p.closest && p.closest('[data-nn-giu]'))) return;
      const v = n.nodeValue; if (!coChu(v)) return;
      const r = t(v); if (r !== v) n.nodeValue = r;
    } else if (n.nodeType === 1) {
      if (n.hasAttribute && n.hasAttribute('placeholder')) { const v = n.getAttribute('placeholder'), r = t(v); if (r !== v) n.setAttribute('placeholder', r); }
      if (BO[n.nodeName]) return;
      if (n.querySelectorAll && n.firstElementChild) n.querySelectorAll('[placeholder]').forEach((x) => { const v = x.getAttribute('placeholder'), r = t(v); if (r !== v) x.setAttribute('placeholder', r); });
      if (n.hasAttribute && n.hasAttribute('data-nn-giu')) return;
      for (let c = n.firstChild; c; c = c.nextSibling) dichNut(c);
    }
  }
  function mocDom() {
    const goc = document.documentElement;
    const ob = new MutationObserver((ds) => {
      for (const d of ds) {
        if (d.type === 'characterData') dichNut(d.target);
        else if (d.type === 'attributes') { if (d.attributeName === 'placeholder') dichNut(d.target); }
        else for (const n of d.addedNodes) dichNut(n);
      }
    });
    ob.observe(goc, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['placeholder'] });
    if (document.body) dichNut(document.body);
    document.title = 'TURRET MERGE';
  }
  // ---------- phông Việt cho TM Display (Oxanium không có dấu Việt): Chakra Petch 700 — cùng chất sci-fi góc cạnh ----------
  function mocPhong() {
    const u = (f) => 'url(assets/fonts/chakra-petch/chakra-petch-' + f + '-700-normal.woff2) format("woff2")';
    const st = document.createElement('style'); st.id = 'nn-phong';
    st.textContent =
      "@font-face{font-family:'TM Display';font-style:normal;font-weight:100 900;font-display:swap;src:" + u('latin') + ";unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}" +
      "@font-face{font-family:'TM Display';font-style:normal;font-weight:100 900;font-display:swap;src:" + u('latin-ext') + ";unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}" +
      "@font-face{font-family:'TM Display';font-style:normal;font-weight:100 900;font-display:swap;src:" + u('vietnamese') + ";unicode-range:U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB}" +
      ".hm-am2 .hm-bat::after{content:'BẬT'}.hm-am2 .hm-bat[data-t$=\"Off\"]::after{content:'TẮT'}";
    (document.head || document.documentElement).appendChild(st);
    // tải sẵn để canvas vẽ đúng phông ngay khung đầu
    try { if (document.fonts && document.fonts.load) { document.fonts.load('700 20px "TM Display"', 'Đợt Trùm'); } } catch (e) { }
  }

  const api = {
    get lang() { return lang; }, t, thieu, dungVi, giu: (x) => { dungTen(); const k = mau(x)[0]; return GIU.has(x) || GIU.has(k) || laVi(x) || /^[@#\s★×+\-−→/·.,:%()]*$/.test(k); },
    vi: () => lang === 'vi',
    // đổi ngôn ngữ: lưu rồi tải lại nhẹ (bộ bài, cấp thẻ, cài đặt… đều nằm trong localStorage nên giữ nguyên)
    dat(l) {
      l = l === 'vi' ? 'vi' : 'en'; if (l === lang) return;
      try { localStorage.setItem('tm_lang', l); } catch (e) { }
      try { sessionStorage.setItem('tm_lang_mo', '1'); } catch (e) { }
      const u = location.href.replace(/([?&])lang=(en|vi)&?/, '$1').replace(/[?&]$/, '');
      location.replace(u);
    },
    // tên Việt của ụ (roster.json ten_vi) — trang ụ hiện dưới tên Anh
    tenVi(id) { const r = typeof G !== 'undefined' && G.rosterMap && G.rosterMap[id]; return (r && r.ten_vi) || ''; },
  };
  if (lang === 'vi') {
    document.documentElement.lang = 'vi';
    mocPhong();
    mocCanvas();
    if (typeof TEXT !== 'undefined') {
      const sao = (o) => (o && typeof o === 'object' ? Object.keys(o).reduce((r, k) => { r[k] = sao(o[k]); return r; }, Array.isArray(o) ? [] : {}) : o);
      api.goc = sao(TEXT); // bản tiếng Anh gốc (tools/thap-kt-vi.js so khoá)
      const v = dungVi(TEXT); window.TEXT_VI = v; phu(TEXT, v);
    }
    if (document.readyState === 'loading' && document.body) mocDom(); else mocDom();
  }
  return api;
})();
window.NN = NN;

// ---------- Cài đặt (sảnh): hàng LANGUAGE — ENGLISH / TIẾNG VIỆT (cùng kiểu nút BATTLE HINTS) ----------
document.addEventListener('DOMContentLoaded', function () {
  if (typeof HM === 'undefined' || !HM.moCai || HM.__nn) return; HM.__nn = 1;
  const g = HM.moCai;
  HM.moCai = function () {
    const r = g.apply(this, arguments);
    const h = document.querySelector('#hm-tam .hm-cai2'), tam = document.querySelector('#hm-tam');
    if (h && tam && !tam.querySelector('.nn-hang')) {
      const vi = NN.lang === 'vi';
      // hàng riêng ở CUỐI bảng (các tệp khác chèn nút vào .hm-cai2 ĐẦU TIÊN — đừng chen trước nó)
      tam.insertAdjacentHTML('beforeend', '<div class="hm-cai2 nn-hang" data-nn-giu="1"><button class="hm-nut2' + (vi ? '' : ' vang') + '" data-act="nn-dat" data-l="en" aria-pressed="' + !vi + '">ENGLISH</button>' +
        '<button class="hm-nut2' + (vi ? ' vang' : '') + '" data-act="nn-dat" data-l="vi" aria-pressed="' + vi + '">TIẾNG VIỆT</button></div>');
    }
    return r;
  };
  document.addEventListener('click', function (e) {
    const el = e.target.closest && e.target.closest('[data-act="nn-dat"]'); if (!el) return;
    e.stopImmediatePropagation(); try { SND.nut(); } catch (er) { }
    NN.dat(el.dataset.l);
  }, true);
  // vừa đổi ngôn ngữ → mở lại bảng Cài đặt cho người chơi thấy kết quả
  try { if (sessionStorage.getItem('tm_lang_mo')) { sessionStorage.removeItem('tm_lang_mo'); const mo = () => { if (document.querySelector('#chon.xem-hm') && !document.querySelector('#tai:not([hidden])')) HM.moCai(); else setTimeout(mo, 300); }; setTimeout(mo, 600); } } catch (e) { }
});
