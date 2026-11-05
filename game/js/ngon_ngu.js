// Ngôn ngữ: tiếng Việt (mặc định) và tiếng Anh. Tệp này nạp TRƯỚC mọi tệp khác của game.
//
//   G.LANG                       'vi' | 'en'
//   G.t('Sức mạnh {0}', 12)      dịch một chuỗi, điền {0} {1}… bằng tham số. Tiếng Việt: trả đúng chuỗi gốc (đã điền số).
//   G.tc('rèn', 'Mài')           như G.t nhưng có ngữ cảnh, dùng khi một chữ Việt cần hai nghĩa Anh khác nhau
//                                (từ điển ghi khoá 'rèn::Mài'; không có thì dùng khoá 'Mài').
//   G.tv(chuỗi)                  dịch NẾU chuỗi có trong từ điển, không thì trả nguyên (dùng ở điểm vẽ chữ).
//   G.ngonNgu.dat('en')          đổi ngôn ngữ ngay, nhớ vào máy (localStorage) và vào bản lưu (trường lang).
//   G.ngonNgu.thieu              các chuỗi còn dấu tiếng Việt đã được vẽ ra khi đang ở tiếng Anh mà chưa có bản dịch (để kiểm).
//
// Cách hoạt động: từ điển (js/ngon_ngu_en.js) có khoá là CHUỖI TIẾNG VIỆT GỐC, giá trị là tiếng Anh.
// Khi ở tiếng Anh, mọi lệnh vẽ chữ và đo chữ của canvas (fillText, strokeText, measureText) tự tra từ điển, nên chữ viết
// thẳng trong code ("Túi đồ", tên quái, tên vũ khí…) không phải sửa gì. Chỉ chuỗi GHÉP (chữ + số, chữ + tên) mới phải viết
// G.t('… {0} …', x) ở chỗ ghép. Khi ở tiếng Việt, không lệnh vẽ nào bị đụng tới: game y hệt như trước.
(function () {
  'use strict';
  const G = (window.G = window.G || {});
  const KHOA = 'linhkhi_lang';
  const D = new Map();   // từ điển: chuỗi Việt -> chuỗi Anh
  const DL = new Map();  // như trên nhưng khoá viết thường (để nhận chữ IN HOA / viết thường)
  const nho = new Map(); // kết quả tra ở điểm vẽ (chuỗi -> chuỗi), xoá khi đổi ngôn ngữ
  const thieu = new Set();
  const nguyen = new Set(); // chuỗi giữ nguyên, không dịch (tên người chơi…): G.kd
  // Có dấu tiếng Việt?
  const VI = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ]/;
  // Tên riêng giữ nguyên ở bản tiếng Anh (không tính là "thiếu").
  const TEN_RIENG = /Cu Tí|Cu Tèo|Cái Bống|Cu Lì|Linh Khí|LINH KHÍ|CU TÍ|CU TÈO|CÁI BỐNG|CU LÌ/g;

  function dien(s, a) { // điền {0} {1}… bằng tham số
    return a && a.length ? String(s).replace(/\{(\d)\}/g, (m, i) => (a[+i] === undefined ? m : a[+i])) : s;
  }
  function docMay() { try { const v = window.localStorage.getItem(KHOA); return v === 'en' || v === 'vi' ? v : null; } catch (e) { return null; } }
  // Talesworn (05/11/2026): tiếng Anh là MẶC ĐỊNH cho người chơi mới. ?lang=en|vi chọn thẳng (và nhớ như khi bấm EN / VI);
  // chưa chọn bao giờ thì theo ngôn ngữ máy (máy tiếng Việt → tiếng Việt, còn lại → tiếng Anh).
  function docQS() { try { const m = /[?&]lang=(en|vi)(&|$)/i.exec(location.search || ''); return m ? m[1].toLowerCase() : null; } catch (e) { return null; } }
  function theoMay() {
    try { const ds = [].concat(navigator.languages || [], navigator.language || []); for (const l of ds) if (/^vi\b/i.test(String(l))) return 'vi'; } catch (e) { /* bỏ qua */ }
    return 'en';
  }
  // Bản lưu có tiến độ (đã qua ải, đã thắng, đã lên cấp) = người chơi cũ: trước đây mặc định là tiếng Việt, nên chưa từng chọn thì giữ tiếng Việt.
  function luuCu(sv) {
    if (!sv || typeof sv !== 'object') return false;
    if (sv.stars && typeof sv.stars === 'object' && Object.keys(sv.stars).length) return true;
    if ((sv.wins | 0) > 0) return true;
    try { for (const k in sv.heroes || {}) if ((sv.heroes[k].lvl | 0) > 1) return true; } catch (e) { /* bỏ qua */ }
    return !!(sv.truyen && sv.truyen.mo);
  }
  const QS_LANG = docQS();
  if (QS_LANG) { try { window.localStorage.setItem(KHOA, QS_LANG); } catch (e) { /* bỏ qua */ } }

  const N = (G.ngonNgu = {
    D, thieu,
    DS: [['vi', 'Tiếng Việt'], ['en', 'English']],
    // Nạp thêm bản dịch: { 'chuỗi Việt': 'chuỗi Anh', … }
    them(o) {
      for (const k in o) { D.set(k, o[k]); const l = k.toLowerCase(); if (!DL.has(l)) DL.set(l, o[k]); }
      nho.clear();
    },
    // Ghi nhận một chuỗi chưa dịch (chỉ khi còn dấu tiếng Việt sau khi bỏ các tên riêng cố ý giữ).
    ghiThieu(s) { if (thieu.size < 3000 && VI.test(s.replace(TEN_RIENG, ''))) thieu.add(s); },
    // Đổi ngôn ngữ. nho = false: chỉ áp dụng, không ghi vào máy / bản lưu (dùng lúc khởi động).
    dat(lang, luu) {
      lang = lang === 'en' ? 'en' : 'vi';
      G.LANG = lang;
      nho.clear();
      N.phien = (N.phien || 0) + 1; // nơi nào giữ sẵn hình có chữ thì so số này để vẽ lại
      try { document.documentElement.lang = lang; } catch (e) { /* bỏ qua */ }
      N.gan();
      if (luu !== false) {
        try { window.localStorage.setItem(KHOA, lang); } catch (e) { /* bỏ qua */ }
        if (G.save) { if (lang === 'en') G.save.lang = 'en'; else delete G.save.lang; if (G.persist) G.persist(); }
      }
      if (N.khiDoi) for (const f of N.khiDoi) { try { f(lang); } catch (e) { /* bỏ qua */ } }
    },
    khiDoi: [],
    doi() { N.dat(G.LANG === 'en' ? 'vi' : 'en'); },
    // Sau khi đọc bản lưu: máy chưa từng chọn ngôn ngữ thì theo bản lưu (trường lang). Bản lưu không ghi ngôn ngữ:
    // người chơi cũ (có tiến độ) giữ tiếng Việt như trước; người chơi mới theo ngôn ngữ máy (Talesworn 05/11: mặc định tiếng Anh).
    tuBanLuu() {
      const may = QS_LANG || docMay(), sv = G.save;
      const lang = may || (sv && (sv.lang === 'en' || sv.lang === 'vi') ? sv.lang : luuCu(sv) ? 'vi' : theoMay());
      if (lang !== G.LANG) N.dat(lang, false);
      // bản lưu trên máy này luôn ghi đúng ngôn ngữ đang dùng
      if (G.save) { if (G.LANG === 'en') G.save.lang = 'en'; else delete G.save.lang; }
    },
    theoMay,
    // Gắn / gỡ phần tự dịch ở các lệnh vẽ chữ của canvas. Tiếng Việt: gỡ hết, canvas chạy lệnh gốc.
    // Talesworn 05/11: lớp tên mới (TEN.lop) chạy ở cả hai thứ tiếng, nên tiếng Việt cũng gắn khi lớp tên đang bật.
    gan() {
      for (const c of [G.ux, G.wx]) {
        if (!c) continue;
        if (G.LANG === 'vi' && !TEN.bat()) { if (c._lkNN) { delete c.fillText; delete c.strokeText; delete c.measureText; c._lkNN = false; } continue; }
        if (c._lkNN) continue;
        const P = Object.getPrototypeOf(c), f = P.fillText, s = P.strokeText, m = P.measureText;
        c.fillText = function (t, x, y, w) { t = G.LANG === 'vi' ? lop(t) : lop(ve(t)); return w === undefined ? f.call(this, t, x, y) : f.call(this, t, x, y, w); };
        c.strokeText = function (t, x, y, w) { t = G.LANG === 'vi' ? lop(t) : lop(tra(t)); return w === undefined ? s.call(this, t, x, y) : s.call(this, t, x, y, w); };
        c.measureText = function (t) { return m.call(this, G.LANG === 'vi' ? lop(t) : lop(tra(t))); };
        c._lkNN = true;
      }
    },
  });

  // Tra từ điển, không ghi "thiếu". Thử lần lượt: đúng nguyên văn; bỏ khoảng trắng hai đầu; không phân biệt hoa thường.
  function tra(s) {
    if (typeof s !== 'string' || s.length < 2 || nguyen.has(s)) return s;
    let r = nho.get(s);
    if (r !== undefined) return r;
    r = D.get(s);
    if (r === undefined) {
      const t = s.trim();
      if (t !== s && D.has(t)) r = s.replace(t, () => D.get(t));
      else if (VI.test(s)) {
        const e = DL.get(t.toLowerCase());
        if (e !== undefined) { const up = t === t.toUpperCase() && t !== t.toLowerCase(); r = s.replace(t, () => (up ? e.toUpperCase() : e)); }
      }
    }
    if (r === undefined) r = s;
    if (nho.size > 6000) nho.clear();
    nho.set(s, r);
    return r;
  }
  // Như tra, dùng ở lệnh vẽ: chuỗi còn dấu tiếng Việt mà không có bản dịch thì ghi vào danh sách thiếu.
  function ve(s) {
    const r = tra(s);
    if (r === s && typeof s === 'string' && VI.test(s) && !D.has(s) && !nguyen.has(s)) N.ghiThieu(s);
    return r;
  }

  // ---------- LỚP TÊN MỚI (Talesworn, 05/11/2026) ----------
  // Đổi TÊN HIỂN THỊ (tên riêng, thuật ngữ) ở bước cuối cùng trước khi vẽ chữ, cho cả tiếng Việt lẫn tiếng Anh. Mã nội bộ, khoá
  // từ điển, bản lưu không đổi gì. Bảng quy tắc ở js/ten_moi.js (G.ten.them). Cờ ?ten=cu: tắt hẳn lớp này (chữ, tên cũ Việt Nam).
  //   quy tắc [cũ, mới, tuỳ chọn]  tuỳ chọn: cs = phân biệt hoa thường (chỉ khớp đúng 'cũ' hoặc 'CŨ' in hoa),
  //   hoa = danh từ chung (khớp chữ thường thì ra chữ thường, viết hoa đầu thì ra viết hoa đầu), truoc / sau = bỏ qua khi
  //   đứng ngay sau / ngay trước chữ này (để chạy hai lần vẫn y như một lần). Chữ IN HOA khớp thì ra chữ IN HOA.
  //   G.ten.thay(lang, { 'nguyên câu cũ': 'nguyên câu mới' }) thay cả câu (xét trước các quy tắc).
  let tenCu = false;
  try { tenCu = /[?&]ten=cu(&|$)/i.test(location.search || ''); } catch (e) { tenCu = false; }
  const LOP = { vi: { ds: [], cau: new Map(), re: false }, en: { ds: [], cau: new Map(), re: false } };
  const lopNho = new Map();
  const CHU = 'A-Za-z0-9\u00C0-\u1EF9';
  // Hai lượt: lượt 1 các quy tắc không phân biệt hoa thường (cờ i), lượt 2 các quy tắc cs (phân biệt hoa thường; khớp 'cũ' hoặc 'CŨ').
  function lopRe(L, cs) {
    const k = cs ? 're2' : 're1';
    if (L[k] !== undefined && L.re) return L[k];
    if (!L.re) { L.re = true; L.re1 = L.re2 = undefined; }
    const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '[ \\u00a0]');
    const ds = L.ds.filter((q) => !!(q[2] && q[2].cs) === cs);
    L[k + 'ds'] = ds;
    L[k] = ds.length ? new RegExp('(^|[^' + CHU + '])(?:' + ds.map((q) => '(' + esc(q[0]) + (cs && q[0].toUpperCase() !== q[0] ? '|' + esc(q[0].toUpperCase()) : '') + ')').join('|') + ')(?=[^' + CHU + ']|$)', cs ? 'g' : 'gi') : null;
    return L[k];
  }
  function apLuot(L, s, cs) {
    const re = lopRe(L, cs);
    if (!re) return s;
    const ds = L[(cs ? 're2' : 're1') + 'ds'], n = ds.length;
    re.lastIndex = 0;
    return s.replace(re, function () {
      const m = arguments[0], pre = arguments[1], off = arguments[n + 2], str = arguments[n + 3];
      let i = 0; while (i < n && arguments[i + 2] === undefined) i++;
      if (i >= n) return m;
      const q = ds[i], o = q[2] || {}, mt = arguments[i + 2], dau = off + pre.length, cuoi = dau + mt.length;
      const hoa = mt.length > 1 && mt === mt.toUpperCase() && mt !== mt.toLowerCase();
      if (o.truoc && str.slice(Math.max(0, dau - o.truoc.length), dau) === o.truoc) return m;
      if (o.sau && str.slice(cuoi, cuoi + o.sau.length) === o.sau) return m;
      let r = q[1];
      if (hoa && q[0] !== q[0].toUpperCase()) r = r.toUpperCase();
      else if (o.hoa && r) { const c0 = mt.charAt(0); r = (c0 === c0.toUpperCase() && c0 !== c0.toLowerCase() ? r.charAt(0).toUpperCase() : r.charAt(0).toLowerCase()) + r.slice(1); }
      return pre + r;
    });
  }
  function apQuyTac(L, s) { return apLuot(L, apLuot(L, s, false), true); }
  function lop(s) {
    if (tenCu || typeof s !== 'string' || s.length < 2 || nguyen.has(s)) return s;
    const L = LOP[G.LANG === 'en' ? 'en' : 'vi'];
    if (!L.ds.length && !L.cau.size) return s;
    const k = G.LANG + '\u0001' + s;
    let r = lopNho.get(k);
    if (r !== undefined) return r;
    r = L.cau.get(s);
    if (r === undefined) { const t = s.trim(); r = t !== s && L.cau.has(t) ? s.replace(t, () => L.cau.get(t)) : s; }
    if (L.ds.length) r = apQuyTac(L, r);
    if (lopNho.size > 8000) lopNho.clear();
    lopNho.set(k, r);
    return r;
  }
  const TEN = (G.ten = {
    cu: tenCu,
    bat: () => !tenCu && (LOP.vi.ds.length > 0 || LOP.vi.cau.size > 0),
    them(lang, ds) { const L = LOP[lang]; if (!L) return; for (const q of ds) L.ds.push(q); L.re = false; lopNho.clear(); nho.clear(); },
    thay(lang, o) { const L = LOP[lang]; if (!L) return; for (const k in o) L.cau.set(k, o[k]); lopNho.clear(); nho.clear(); },
    lop,
    LOP,
  });

  G.tv = function (s) { return G.LANG === 'vi' ? lop(s) : lop(tra(s)); };
  // Không dịch: tên người chơi, tên tài khoản… (kẻo tên trùng một chữ trong từ điển bị đổi). Trả lại đúng chuỗi đưa vào.
  G.kd = function (s) { if ((G.LANG !== 'vi' || TEN.bat()) && typeof s === 'string') { if (nguyen.size > 2000) nguyen.clear(); nguyen.add(s); } return s; };
  G.t = function (s) {
    const n = arguments.length;
    if (G.LANG === 'vi') {
      if (n < 2) return s;
      const a = new Array(n - 1); for (let i = 1; i < n; i++) a[i - 1] = arguments[i];
      return dien(s, a);
    }
    let r = D.get(s);
    if (r === undefined) { r = tra(s); if (r === s && VI.test(String(s))) N.ghiThieu(String(s)); }
    if (n < 2) return lop(r);
    const a = new Array(n - 1);
    for (let i = 1; i < n; i++) { const v = arguments[i]; a[i - 1] = typeof v === 'string' ? tra(v) : v; } // tham số là tên (quái, vũ khí…) cũng được dịch
    return lop(dien(r, a));
  };
  G.tc = function (nguCanh, s) {
    if (G.LANG === 'vi') return arguments.length > 2 ? dien(s, Array.prototype.slice.call(arguments, 2)) : s;
    const k = nguCanh + '::' + s, r = D.has(k) ? D.get(k) : G.t(s);
    return arguments.length > 2 ? dien(r, Array.prototype.slice.call(arguments, 2).map((v) => (typeof v === 'string' ? tra(v) : v))) : r;
  };

  // Đợt 1 (kế hoạch cải thiện, quyết định Q4): chữ tiếng Anh cho các chuỗi mới của màn chào "Chơi ngay", lời mời liên kết Google
  // (js/village.js) và các lỗi liên kết (js/cloud.js). Đặt ở đây vì js/ngon_ngu_en.js là tệp do công cụ tạo ra, không sửa tay.
  const LOI_GG = [
    ['Tài khoản Google này đã được dùng cho một tiến trình khác', 'This Google account is already used by another save', ['credential-already-in-use', 'email-already-in-use']],
    ['Tài khoản này đã liên kết Google rồi', 'This account is already linked to Google', ['provider-already-linked']],
    ['Thử quá nhiều lần, chờ một lát rồi thử lại', 'Too many attempts, wait a moment and try again', ['too-many-requests']],
    ['Đã huỷ đăng nhập', 'Sign-in was cancelled', ['user-cancelled']],
    ['Máy chủ đăng nhập báo lỗi, thử lại sau', 'Sign-in server error, try again later', ['internal-error']],
  ];
  const DOT1 = {
    'Chơi ngay ▶': 'Play now ▶',
    'Đã có tài khoản? Bấm Đăng nhập Google để chơi tiếp tiến trình cũ. {0}': 'Already have an account? Tap Sign in with Google to continue your old progress. {0}',
    'Giữ tiến trình': 'Keep your progress',
    'Liên kết Google để giữ tiến trình trên mọi máy': 'Link Google to keep your progress on every device',
    'Tiến trình đang chơi được giữ nguyên. Đổi máy hoặc xoá dữ liệu trình duyệt vẫn chơi tiếp được.': 'Your current progress is kept. You can keep playing after changing devices or clearing browser data.',
    'Liên kết Google': 'Link Google',
    'Để sau': 'Later',
    'Chưa liên kết được: {0}': 'Could not link: {0}',
    'Tiến trình của bạn vẫn còn nguyên. Có thể thử lại hoặc để sau.': 'Your progress is untouched. You can try again or do it later.',
    'Đã liên kết Google. Tiến trình được giữ nguyên.': 'Google linked. Your progress is kept.',
    'Lúc nào muốn liên kết, gặp Anh Mõ ở cổng làng.': 'To link later, see the Town Crier at the village gate.',
  };
  for (const [vi, en, ma] of LOI_GG) {
    DOT1[vi] = en;
    for (const m of ma) { DOT1[vi + ' [' + m + ']'] = en + ' [' + m + ']'; DOT1['Chưa đăng nhập được: ' + vi + ' [' + m + ']'] = 'Sign-in failed: ' + en + ' [' + m + ']'; }
  }
  N.them(DOT1);

  G.LANG = QS_LANG || docMay() || theoMay(); // trước khi đọc bản lưu (tuBanLuu chỉnh lại theo bản lưu)
  N.phien = 0;
  try { if (G.LANG !== 'vi') document.documentElement.lang = G.LANG; } catch (e) { /* bỏ qua */ }
})();
