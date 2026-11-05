// BẢO VỆ BẢN LƯU (F2, 05/11/2026 — docs/tu-van-toan-cau/chatgpt-05-11/on-dinh-chatgpt.txt mục 4). Mục tiêu: KHÔNG BAO GIỜ mất tiến trình.
// Nạp NGAY SAU js/engine.js (thay G.loadSave / G.persist gốc trước khi các tệp sau bọc thêm lớp: su_kien.js, cloud.js, luyen.js…).
//
//  1. Phiên bản bản lưu: schemaVersion, saveId, revision, updatedAt, gameBuild (giữ nguyên v = 1 và mọi trường cũ / trường lạ, để mã cũ
//     — ?luucu=1 hay bản web cũ còn trong bộ nhớ đệm — vẫn đọc được). Nâng cấp tuần tự LA.BUOC[1→2]…, hàm thuần (không sửa bản vào, không mạng).
//     Bản lưu có schemaVersion MỚI hơn mã → không ghi đè (cả máy lẫn mây), báo người chơi tải lại trang để cập nhật.
//  2. Ghi máy an toàn: kiểm tra → khoá tạm (_tam) → đọc lại xác minh → bản cũ sang _bk1 (bản cũ hơn 10 phút sang _bk2) → khoá chính → xoá _tam.
//     Mở game: chọn bản hợp lệ tốt nhất giữa chính / tạm / _bk1 / _bk2 / _phien (bản lúc mở phiên trước). Đầy bộ nhớ: không bao giờ xoá
//     khoá chính để lấy chỗ, chỉ bỏ _tam / _bk2 rồi thử lại.
//  3. Đọc lỗi: KHÔNG thay ngầm bằng bản trắng. Bản hỏng chép sang _hong, mở màn Khôi phục (bản sao trên máy → mây → bản sao trên mây →
//     Chơi mới khi người chơi chọn). Trong lúc chờ chọn: không ghi gì đè lên bản cũ.
//  4. Hai thẻ cùng mở: thẻ nào thấy thẻ khác vừa ghi thì thôi ghi (báo tải lại), không ghi đè tiến trình của thẻ kia.
//  5. Màn hỏi (xung đột mây / khôi phục / thông báo) vẽ trên canvas bằng khung + nút ảnh của game (G.theme.panel / inset / btn).
// Cờ quay lui: ?luucu=1 → không cài gì (G.luuAT.bat = false), đường lưu cũ y như trước (js/engine.js + js/cloud.js nhánh cũ).
(function () {
  'use strict';
  const G = (window.G = window.G || {});
  let tat = false;
  try { tat = /[?&]luucu=1(&|$)/.test(location.search || ''); } catch (e) { tat = false; }
  if (G.LUU_AT === false) tat = true;

  const KEY = 'linhkhi_save_v1';
  const K = { chinh: KEY, tam: KEY + '_tam', bk1: KEY + '_bk1', bk2: KEY + '_bk2', phien: KEY + '_phien', hong: KEY + '_hong',
    bkt: KEY + '_bkt', bkDong: KEY + '_bk_doi', xdMay: KEY + '_xd_thietbi', xdMayC: KEY + '_xd_may', mayHong: KEY + '_may_hong', dongBo: 'linhkhi_luu_dongbo' };
  const SCHEMA = 2;
  const BK2_CACH = 10 * 60 * 1000; // _bk2 chỉ thay khi đã cũ hơn 10 phút: hai bản sao cách nhau theo thời gian, không chỉ là hai lần lưu liền nhau
  // Trường "siêu dữ liệu" / cài đặt theo máy: không tính là nội dung chơi khi so hai bản (máy ↔ mây)
  const META = ['savedAt', 'owner', 'sound', 'net', 'lang', 'pin', 'nhac', 'tieng', 'revision', 'updatedAt', 'gameBuild', 'schemaVersion', 'saveId', 'tgChoi', '_saoLuuMay'];

  const LA = (G.luuAT = { bat: !tat, KEY, K, SCHEMA, META, khoa: '', cuoi: null, phucHoi: null, man: [], mo: null, loiDay: false });

  // ---------- hàm thuần ----------
  const obj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
  const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
  // FNV-1a 32 bit (đủ để so hai chuỗi có giống nhau không; không dùng cho bảo mật)
  LA.hash = function (str) {
    str = String(str);
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    return ('0000000' + (h >>> 0).toString(16)).slice(-8) + str.length.toString(36);
  };
  // JSON khoá xếp theo thứ tự chữ (hai bản cùng nội dung nhưng khác thứ tự khoá vẫn ra một chuỗi)
  function onDinh(v) {
    if (Array.isArray(v)) return '[' + v.map((x) => (x === undefined ? 'null' : onDinh(x))).join(',') + ']';
    if (obj(v)) return '{' + Object.keys(v).sort().filter((k) => v[k] !== undefined && typeof v[k] !== 'function').map((k) => JSON.stringify(k) + ':' + onDinh(v[k])).join(',') + '}';
    return JSON.stringify(v === undefined ? null : v);
  }
  LA.onDinh = onDinh;
  LA.noiDung = function (s) { if (!obj(s)) return String(s); const o = {}; for (const k of Object.keys(s)) if (META.indexOf(k) < 0) o[k] = s[k]; return onDinh(o); };
  LA.hashND = (s) => LA.hash(LA.noiDung(s));
  // Kiểm tra tối thiểu trước khi coi là bản lưu dùng được (phần chi tiết G.fixSave tự sửa)
  LA.hopLe = function (s) {
    if (!obj(s)) return { ok: false, ly: 'khong-phai-doi-tuong' };
    if (s.v !== 1) return { ok: false, ly: 'sai-v' };
    if (s.gold !== undefined && !(typeof s.gold === 'number' && isFinite(s.gold))) return { ok: false, ly: 'vang' };
    if (s.weapons !== undefined && !Array.isArray(s.weapons)) return { ok: false, ly: 'vu-khi' };
    if (s.heroes !== undefined && !obj(s.heroes)) return { ok: false, ly: 'em-be' };
    return { ok: true };
  };
  LA.phienBan = (s) => (obj(s) && Number.isInteger(s.schemaVersion) && s.schemaVersion > 0 ? s.schemaVersion : 1);
  LA.rev = (s) => (obj(s) ? Math.max(0, Math.floor(num(s.revision, 0))) : 0);

  // Các bước nâng cấp: BUOC[n] đưa bản phiên bản n lên n + 1. Thuần: nhận bản sao, trả bản sao (không mạng, không đồng hồ, không ngẫu nhiên).
  // Rollback mã ≠ rollback dữ liệu: các bước chỉ THÊM trường (v giữ 1, không xoá / đổi nghĩa trường cũ) để mã cũ vẫn đọc được.
  LA.BUOC = {
    // 1 → 2: thêm siêu dữ liệu. saveId lấy theo nội dung (cùng một bản lưu cũ ở máy và trên mây ra cùng một mã).
    1(s) {
      if (typeof s.saveId !== 'string' || !s.saveId) s.saveId = 'c' + LA.hashND(s);
      s.revision = LA.rev(s);
      s.updatedAt = Math.max(0, num(s.updatedAt, num(s.savedAt, 0)));
      if (typeof s.gameBuild !== 'string') s.gameBuild = '';
      s.schemaVersion = 2;
      return s;
    },
  };
  // → { s, tu, den, moi (phiên bản mới hơn mã), loi }
  LA.nangCap = function (vao) {
    if (!obj(vao)) return { s: vao, tu: 0, den: 0, loi: 'khong-phai-doi-tuong' };
    const tu = LA.phienBan(vao);
    let s;
    try { s = JSON.parse(JSON.stringify(vao)); } catch (e) { return { s: vao, tu, den: tu, loi: 'khong-chep-duoc' }; }
    if (tu > SCHEMA) return { s, tu, den: tu, moi: true };
    for (let n = tu; n < SCHEMA; n++) {
      const f = LA.BUOC[n];
      if (!f) return { s, tu, den: n, loi: 'thieu-buoc-' + n };
      s = f(s);
    }
    return { s, tu, den: SCHEMA };
  };
  // Có tiến trình thật chưa (bản trắng thì đổi lấy bản kia không mất gì)
  LA.coTienDo = function (s) {
    if (!obj(s)) return false;
    for (const m of [s.stars, s.stars2]) if (obj(m) && Object.keys(m).length) return true;
    if (num(s.gold, 0) > 0 || num(s.trangSach, 0) > 0 || num(s.linhKhi, 0) > 0) return true;
    if (obj(s.heroes)) for (const k in s.heroes) if (obj(s.heroes[k]) && num(s.heroes[k].lvl, 1) > 1) return true;
    return false;
  };
  // Tóm tắt để hiện ở màn chọn
  LA.tomTat = function (s, luc) {
    if (!obj(s)) return null;
    let sao = 0, xa = 0, cap = 1, luyen = 0;
    for (const m of [s.stars, s.stars2]) if (obj(m)) for (const k in m) sao += Math.max(0, Math.min(3, m[k] | 0));
    if (obj(s.stars)) for (const k in s.stars) { const p = k.split('-').map(Number); if (p[0] >= 0 && p[1] >= 0) xa = Math.max(xa, p[0] * 5 + p[1] + 1); }
    if (obj(s.heroes)) for (const k in s.heroes) if (obj(s.heroes[k])) cap = Math.max(cap, num(s.heroes[k].lvl, 1) | 0);
    if (Array.isArray(s.weapons)) for (const w of s.weapons) if (obj(w)) luyen = Math.max(luyen, num(w.luyen, 0) | 0);
    return { sao, xa, cap, luyen, vang: Math.floor(num(s.gold, 0)), tg: Math.floor(num(s.tgChoi, -1)), luc: num(luc, num(s.savedAt, num(s.updatedAt, 0))) };
  };

  // ---------- quyết định máy ↔ mây (bảng mục 4.4), thuần ----------
  // o: { local, mayS (bản mây đã nâng cấp, hoặc null), mayTrong, mayHong, mayMoi, mayToken, dongBo ({ token, hash } lần đồng bộ trước với tài khoản này, hoặc null) }
  // → 'cho-ghi-dau' | 'may-hong' | 'chan-moi' | 'giong' | 'tai' | 'day' | 'hoi'
  // Không bao giờ chọn theo đồng hồ máy; không cộng gộp hai bản.
  LA.quyetDinh = function (o) {
    if (o.mayTrong) return 'cho-ghi-dau'; // mây trống: chưa ghi gì lúc vừa đăng nhập, lần lưu thật đầu tiên mới đưa lên
    if (o.mayMoi) return 'chan-moi'; // bản mây do mã mới hơn tạo: không ghi đè
    if (o.mayHong) return 'may-hong'; // bản mây hỏng: dùng bản máy, cất bản mây hỏng lại
    const lh = LA.hashND(o.local), mh = LA.hashND(o.mayS);
    if (lh === mh) return 'giong';
    const lc = LA.coTienDo(o.local), mc = LA.coTienDo(o.mayS);
    if (!lc && mc) return 'tai';
    if (lc && !mc) return 'day';
    if (!lc && !mc) return 'tai';
    const d = o.dongBo;
    if (d && d.token && d.hash) {
      const mayDoi = o.mayToken !== d.token, mayCuDoi = lh !== d.hash;
      if (!mayDoi && mayCuDoi) return 'day'; // mây vẫn như lần đồng bộ trước, máy đã chơi thêm → máy kế thừa mây
      if (mayDoi && !mayCuDoi) return 'tai'; // máy không đổi từ lần đồng bộ trước, mây đã có bản mới hơn (máy khác) → mây kế thừa máy
      if (!mayDoi && !mayCuDoi) return 'giong';
    }
    return 'hoi'; // hai bản tiến triển độc lập (hoặc không rõ lịch sử): giữ cả hai, hỏi người chơi
  };

  // ---------- kho (localStorage) ----------
  LA.kho = function () { try { return window.localStorage || null; } catch (e) { return null; } };
  function doc(ls, k) { try { return ls.getItem(k); } catch (e) { return null; } }
  function docJ(ls, k, d) { try { const r = ls.getItem(k); const v = r ? JSON.parse(r) : null; return v == null ? d : v; } catch (e) { return d; } }
  function ghiThu(ls, k, v) { try { ls.setItem(k, v); return true; } catch (e) { return false; } }
  LA.laDay = (e) => !!e && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22 || e.code === 1014 || /quota/i.test(String(e.message || '')));
  // Một ô trong kho → { khoa, raw, s, ok, ly, moi }
  LA.docO = function (ls, khoa) {
    const raw = doc(ls, khoa);
    if (raw == null || raw === '') return { khoa, raw: null, ok: false, ly: 'trong' };
    let s;
    try { s = JSON.parse(raw); } catch (e) { return { khoa, raw, ok: false, ly: 'json-hong' }; }
    const kt = LA.hopLe(s);
    if (!kt.ok) return { khoa, raw, s, ok: false, ly: kt.ly };
    return { khoa, raw, s, ok: true, moi: LA.phienBan(s) > SCHEMA };
  };
  // Xếp các bản trên máy theo thứ tự nên dùng. Thuần theo kho đưa vào.
  LA.xepUngVien = function (ls) {
    const c = LA.docO(ls, K.chinh), t = LA.docO(ls, K.tam);
    const ds = [];
    // _tam hợp lệ, cùng saveId và revision cao hơn khoá chính = lần ghi trước bị ngắt giữa chừng (sau bước ghi tạm) → dùng _tam
    if (c.ok && t.ok && t.s.saveId && t.s.saveId === c.s.saveId && LA.rev(t.s) > LA.rev(c.s)) ds.push(t, c);
    else if (c.ok) ds.push(c);
    const phu = [K.bk1, K.bk2, K.phien, K.bkDong].map((k) => LA.docO(ls, k)).filter((x) => x.ok);
    if (!c.ok && t.ok) phu.unshift(t);
    // bản phụ: cùng saveId với khoá chính (nếu khoá chính đọc được saveId) trước, revision cao trước; trùng nội dung thì bỏ
    const sid = c.s && obj(c.s) ? c.s.saveId : null;
    phu.sort((a, b) => ((b.s.saveId === sid) - (a.s.saveId === sid)) || (LA.rev(b.s) - LA.rev(a.s)) || (num(b.s.updatedAt, num(b.s.savedAt, 0)) - num(a.s.updatedAt, num(a.s.savedAt, 0))));
    const thay = new Set(ds.map((x) => x.raw));
    for (const x of phu) if (!thay.has(x.raw)) { ds.push(x); thay.add(x.raw); }
    return { chinh: c, ds };
  };

  if (!LA.bat) return; // ?luucu=1: chỉ để lại các hàm thuần (cho bài kiểm tra), không cài gì

  // ---------- chữ tiếng Anh (G.t) ----------
  const EN = {
    'Bản lưu mây và máy khác nhau': 'Cloud and device saves differ',
    'Hai bản lưu đã chơi tiếp khác nhau. Chọn bản muốn giữ — cả hai đã được sao lưu.': 'Both saves progressed separately. Choose one to keep — both have been backed up.',
    'Trên mây': 'Cloud', 'Thiết bị này': 'This device',
    'Khu vực: {0}': 'Area: {0}', 'Cấp {0} · {1} sao': 'Level {0} · {1} stars', 'Vàng: {0} · Luyện cao nhất {1}': 'Gold: {0} · Best Refine {1}',
    'Thời gian chơi: {0}': 'Play time: {0}', 'Lưu lúc: {0}': 'Saved: {0}', 'chưa đo': 'not tracked', 'chưa qua ải nào': 'no stage cleared',
    'Dùng bản mây': 'Use Cloud', 'Giữ máy này': 'Keep This Device', 'Huỷ': 'Cancel', 'Dùng': 'Use',
    'Khôi phục bản lưu': 'Restore save',
    'Bản lưu chính trên máy bị hỏng. Chọn một bản sao để chơi tiếp (bản hỏng vẫn được cất giữ).': 'The main save on this device is damaged. Choose a backup to continue (the damaged copy is kept).',
    'Không đọc được bản lưu trên máy. Chọn một bản sao, hoặc chơi mới (bản hỏng vẫn được cất giữ).': 'The save on this device could not be read. Choose a backup, or start a new game (the damaged copy is kept).',
    'Đang tìm bản lưu trên mây…': 'Looking for cloud saves…', 'Không có bản sao nào khác.': 'No other backups.',
    'Chơi mới': 'New Game', 'Bấm lần nữa để chơi mới': 'Tap again to start over',
    'Máy: bản sao gần nhất': 'Device: latest backup', 'Máy: bản sao cũ hơn': 'Device: older backup', 'Máy: bản lúc mở phiên trước': 'Device: start of last session',
    'Máy: bản đang ghi dở': 'Device: unfinished write', 'Máy: bản trước khi đổi bản lưu': 'Device: save before switching', 'Mây: bản chính': 'Cloud: main save', 'Mây: bản sao {0}': 'Cloud: backup {0}',
    'Cần cập nhật game': 'Game update needed',
    'Bản lưu này do phiên bản Talesworn mới hơn tạo ra. Hãy tải lại trang để cập nhật. Game sẽ không ghi đè bản lưu này.': 'This save was made by a newer version of Talesworn. Reload the page to update. The game will not overwrite this save.',
    'Tải lại': 'Reload', 'Đóng': 'Close', 'Đã hiểu': 'OK',
    'Game đang mở ở thẻ khác': 'Game open in another tab',
    'Talesworn vừa được lưu từ một thẻ hoặc cửa sổ khác. Thẻ này đã dừng lưu để không ghi đè tiến trình. Tải lại để chơi tiếp.': 'Talesworn was just saved from another tab or window. This tab stopped saving so it will not overwrite that progress. Reload to continue.',
    'Bộ nhớ máy đầy': 'Device storage full',
    'Trình duyệt hết chỗ, lần lưu này chưa ghi được trên máy. Bản lưu cũ vẫn còn nguyên. Hãy giải phóng bộ nhớ trình duyệt.': 'The browser is out of space, so this save was not written on the device. The previous save is untouched. Please free up browser storage.',
    'Đã khôi phục bản lưu.': 'Save restored.',
    'Đang chờ chọn bản lưu để khôi phục': 'Waiting for you to pick a save to restore', 'Đang chờ chọn bản lưu (mây hay máy này)': 'Waiting for you to choose a save (cloud or this device)',
    'Bản trên mây do game mới hơn tạo: chưa lưu lên mây': 'Cloud save is from a newer game version: not uploading', 'Đã tạm dừng lưu mây trong lần chơi này': 'Cloud saving paused for this session',
  };
  try { if (G.ngonNgu && G.ngonNgu.them) G.ngonNgu.them(EN); } catch (e) { /* bỏ qua */ }
  const t = function () { return G.t ? G.t.apply(G, arguments) : String(arguments[0]).replace(/\{(\d)\}/g, (m, i) => arguments[+i + 1]); };

  // ---------- đóng dấu và ghi ----------
  let ndCuoi = null; // nội dung (không tính siêu dữ liệu) của lần ghi gần nhất: không đổi thì không tăng revision
  function idMoi() {
    let r = '';
    try { const a = new Uint32Array(2); (window.crypto || {}).getRandomValues(a); r = a[0].toString(36) + a[1].toString(36); } catch (e) { r = ''; }
    if (!r) r = Math.floor(Math.random() * 1e12).toString(36) + Date.now().toString(36);
    return 's' + r;
  }
  LA.dongDau = function (s) {
    if (!obj(s)) return s;
    if (typeof s.saveId !== 'string' || !s.saveId) s.saveId = idMoi();
    const nd = LA.noiDung(s);
    if (nd !== ndCuoi || !Number.isInteger(s.revision)) s.revision = LA.rev(s) + 1;
    ndCuoi = nd;
    s.schemaVersion = SCHEMA;
    s.updatedAt = Date.now();
    s.gameBuild = String(G.VERSION || '').slice(0, 40);
    return s;
  };
  function quayBanSao(ls, cu) {
    const bkt = docJ(ls, K.bkt, {});
    const now = Date.now();
    if (!bkt || typeof bkt !== 'object') return;
    if (!bkt.bk2 || now - bkt.bk2 > BK2_CACH || doc(ls, K.bk2) == null) {
      const b1 = doc(ls, K.bk1);
      if (b1 != null && ghiThu(ls, K.bk2, b1)) bkt.bk2 = bkt.bk1 || now;
    }
    if (ghiThu(ls, K.bk1, cu)) bkt.bk1 = now;
    ghiThu(ls, K.bkt, JSON.stringify(bkt));
  }
  // → { ok, ly }
  LA.ghi = function (s, o) {
    o = o || {};
    if (LA.khoa && !o.boKhoa) return { ok: false, ly: LA.khoa };
    const ls = LA.kho();
    if (!ls || !obj(s)) return { ok: false, ly: 'khong-co-kho' };
    const hienTai = doc(ls, K.chinh);
    // một thẻ khác vừa ghi (khoá chính khác với lần đọc / ghi cuối của thẻ này) → thôi ghi
    if (!o.boQuaThe && LA.cuoi != null && hienTai != null && hienTai !== LA.cuoi) { LA.khoaThe(); return { ok: false, ly: 'the-khac' }; }
    LA.dongDau(s);
    let str;
    try { str = JSON.stringify(s); } catch (e) { return { ok: false, ly: 'json' }; }
    let kt;
    try { kt = LA.hopLe(JSON.parse(str)); } catch (e) { kt = { ok: false, ly: 'json' }; }
    if (!kt.ok) { console.error('Talesworn: bản sắp ghi không hợp lệ (' + kt.ly + '), giữ bản cũ'); return { ok: false, ly: 'kiem-tra' }; }
    if (hienTai === str) { LA.cuoi = str; return { ok: true }; }
    const buoc = LA._buoc || null; // bài kiểm tra: dừng giữa chừng (giả lập đóng thẻ)
    try {
      ls.setItem(K.tam, str); if (buoc) buoc('tam');
      if (ls.getItem(K.tam) !== str) throw new Error('đọc lại khoá tạm không khớp');
      if (hienTai != null) {
        let cuOk = false;
        try { cuOk = LA.hopLe(JSON.parse(hienTai)).ok; } catch (e) { cuOk = false; }
        if (cuOk) {
          // đổi sang một bản lưu khác hẳn (Xoá hết, chọn bản khôi phục, nhận bản mây khác dòng): bản cuối của dòng cũ giữ riêng ở _bk_doi
          let sidCu = null; try { sidCu = JSON.parse(hienTai).saveId; } catch (e) { sidCu = null; }
          if (sidCu !== s.saveId) ghiThu(ls, K.bkDong, hienTai);
          quayBanSao(ls, hienTai);
        } else LA.catHong(hienTai);
        if (buoc) buoc('bk');
      }
      ls.setItem(K.chinh, str); if (buoc) buoc('chinh');
      if (ls.getItem(K.chinh) !== str) throw new Error('đọc lại khoá chính không khớp');
      ls.removeItem(K.tam);
      LA.cuoi = str;
      return { ok: true };
    } catch (e) {
      if (e && e.gia) throw e; // bài kiểm tra "đóng thẻ"
      if (!LA.laDay(e)) { console.error('Talesworn: lỗi khi lưu trên máy', e); }
      // Đầy bộ nhớ: bỏ khoá tạm và bản sao cũ nhất (KHÔNG bao giờ xoá khoá chính) rồi ghi thẳng một lần
      try { ls.removeItem(K.tam); } catch (e2) { /* bỏ qua */ }
      try { ls.removeItem(K.bk2); } catch (e2) { /* bỏ qua */ }
      try {
        ls.setItem(K.chinh, str);
        if (ls.getItem(K.chinh) === str) { LA.cuoi = str; return { ok: true, ly: 'ghi-thang' }; }
      } catch (e3) { /* vẫn đầy */ }
      if (!LA.loiDay) { LA.loiDay = true; LA.moMan({ loai: 'tb', trongAi: true, tieuDe: 'Bộ nhớ máy đầy', chu: 'Trình duyệt hết chỗ, lần lưu này chưa ghi được trên máy. Bản lưu cũ vẫn còn nguyên. Hãy giải phóng bộ nhớ trình duyệt.', nut: [['Đã hiểu', null]] }); }
      // khoá chính có thể đã bị ghi dở? setItem là nguyên tử: hoặc bản cũ, hoặc bản mới. Đọc lại để biết thẻ này đang giữ gì.
      LA.cuoi = doc(ls, K.chinh);
      return { ok: false, ly: 'day' };
    }
  };
  LA.khoaThe = function () {
    if (LA.khoa === 'the') return;
    LA.khoa = 'the';
    LA.moMan({ loai: 'tb', trongAi: true, tieuDe: 'Game đang mở ở thẻ khác', chu: 'Talesworn vừa được lưu từ một thẻ hoặc cửa sổ khác. Thẻ này đã dừng lưu để không ghi đè tiến trình. Tải lại để chơi tiếp.', nut: [['Tải lại', () => { try { location.reload(); } catch (e) { /* bỏ qua */ } }], ['Đóng', null]] });
  };
  try {
    window.addEventListener('storage', (e) => {
      if (!e || e.key !== K.chinh || e.newValue == null) return;
      if (e.newValue !== LA.cuoi) LA.khoaThe();
    });
  } catch (e) { /* bỏ qua */ }

  // ---------- đồng bộ: dấu lần đồng bộ cuối với từng tài khoản ----------
  LA.docDongBo = function (uid) { const ls = LA.kho(); const m = ls ? docJ(ls, K.dongBo, {}) : {}; return obj(m) && obj(m[uid]) ? m[uid] : null; };
  LA.ghiDongBo = function (uid, d) {
    const ls = LA.kho(); if (!ls || !uid) return;
    let m = docJ(ls, K.dongBo, {}); if (!obj(m)) m = {};
    m[uid] = Object.assign({}, d, { at: Date.now() });
    const ks = Object.keys(m).sort((a, b) => num(m[b].at, 0) - num(m[a].at, 0));
    for (const k of ks.slice(3)) delete m[k];
    ghiThu(ls, K.dongBo, JSON.stringify(m));
  };
  // Cất nguyên văn một bản (trước khi đổi bản máy ↔ mây)
  LA.cat = function (khoa, raw) { const ls = LA.kho(); if (ls && raw != null) ghiThu(ls, khoa, typeof raw === 'string' ? raw : JSON.stringify(raw)); };
  // Bản hỏng: giữ bản hỏng ĐẦU TIÊN ở _hong (như js/engine.js cũ), bản hỏng khác sau đó ở _hong2
  LA.catHong = function (raw) {
    const ls = LA.kho(); if (!ls || raw == null) return;
    const cu = doc(ls, K.hong);
    if (cu === null || cu === raw) ghiThu(ls, K.hong, raw); else if (doc(ls, K.hong + '2') !== raw) ghiThu(ls, K.hong + '2', raw);
  };

  // ---------- nạp ----------
  // Thử một bản: nâng cấp rồi G.fixSave. Trả về bản đã sửa, hoặc null khi G.fixSave phải bỏ cả bản (trả bản trắng khác đối tượng).
  LA.thuNap = function (s) {
    const m = LA.nangCap(s);
    if (m.loi && !m.moi) return null;
    const vao = m.s;
    let r;
    try { r = G.fixSave(vao); } catch (e) { console.error('Talesworn: G.fixSave lỗi', e); return null; }
    if (r !== vao) return null;
    return { s: r, moi: !!m.moi, tu: m.tu, loiPhan: (G.fixSaveLoi || []).slice() };
  };
  G.loadSave = function () {
    const ls = LA.kho();
    LA.khoa = ''; LA.phucHoi = null; LA.cuoi = null; ndCuoi = null;
    let chon = null, nap = null;
    const x = ls ? LA.xepUngVien(ls) : { chinh: { raw: null, ok: false }, ds: [] };
    for (const u of x.ds) {
      const r = LA.thuNap(u.s);
      if (r) { chon = u; nap = r; break; }
      console.error('Talesworn: bản lưu ' + u.khoa + ' không dùng được, thử bản khác');
    }
    const chinhRaw = x.chinh.raw;
    if (nap) {
      G.save = nap.s;
      if (nap.moi) {
        LA.khoa = 'moi';
        LA.moMan({ loai: 'tb', tieuDe: 'Cần cập nhật game', chu: 'Bản lưu này do phiên bản Talesworn mới hơn tạo ra. Hãy tải lại trang để cập nhật. Game sẽ không ghi đè bản lưu này.', nut: [['Tải lại', () => { try { location.reload(); } catch (e) { /* bỏ qua */ } }], ['Đóng', null]] });
      }
      if (nap.loiPhan.length && chon.raw) LA.catHong(chon.raw); // vài phần phải sửa lại: giữ bản gốc để còn cứu
      if (chon.khoa === K.chinh) {
        // khoá tạm còn sót: trùng khoá chính hoặc cũ hơn (cùng saveId) → bỏ; khác dòng thì để nguyên (màn Khôi phục vẫn thấy "bản đang ghi dở")
        const tm = LA.docO(ls, K.tam);
        if (tm.raw != null && (tm.raw === chon.raw || !tm.ok || (tm.s.saveId === chon.s.saveId && LA.rev(tm.s) <= LA.rev(chon.s)))) { try { ls.removeItem(K.tam); } catch (e) { /* bỏ qua */ } }
      }
      if (chon.khoa === K.tam) {
        // lần ghi trước dừng sau bước ghi tạm: hoàn tất (bản chính cũ sang _bk1)
        if (chinhRaw != null) quayBanSao(ls, chinhRaw);
        ghiThu(ls, K.chinh, chon.raw);
        try { ls.removeItem(K.tam); } catch (e) { /* bỏ qua */ }
      } else if (chon.khoa !== K.chinh) {
        // khoá chính hỏng / mất: dùng bản sao, nhưng KHÔNG ghi đè gì cho tới khi người chơi xác nhận ở màn Khôi phục
        if (chinhRaw != null) LA.catHong(chinhRaw);
        LA.khoa = LA.khoa || 'phucHoi';
        LA.phucHoi = { tu: chon.khoa, coChinh: chinhRaw != null };
        LA.moManPhucHoi();
      }
      if ((chon.khoa === K.chinh || chon.khoa === K.tam) && chon.raw && doc(ls, K.phien) !== chon.raw && !nap.moi) ghiThu(ls, K.phien, chon.raw); // bản lúc mở phiên
    } else {
      G.save = G.fixSave(null); // bản trắng chỉ để màn chào chạy được
      if (chinhRaw != null || x.ds.length) {
        if (chinhRaw != null) LA.catHong(chinhRaw);
        LA.khoa = 'phucHoi';
        LA.phucHoi = { tu: null, coChinh: true };
        LA.moManPhucHoi();
      }
    }
    if (obj(G.save) && G.save._saoLuuMay !== undefined) delete G.save._saoLuuMay; // bản sao mây chỉ nằm trên mây
    LA.cuoi = ls ? doc(ls, K.chinh) : null;
    ndCuoi = obj(G.save) ? LA.noiDung(G.save) : null;
    if (G.ngonNgu) G.ngonNgu.tuBanLuu(); // ngôn ngữ theo máy; máy chưa chọn thì theo bản lưu
  };
  G.persist = function () { LA.kq = LA.ghi(G.save); return LA.kq.ok; }; // (các lớp bọc ngoài không trả giá trị: xem G.luuAT.kq)

  // ---------- thời gian chơi (chỉ để hiện ở màn chọn bản) ----------
  try {
    setInterval(() => {
      try {
        if (document.hidden || !obj(G.save) || !G.scene) return;
        if (G.scene !== G.StageScene && G.scene !== G.Village) return;
        G.save.tgChoi = Math.max(0, Math.floor(num(G.save.tgChoi, 0))) + 5;
      } catch (e) { /* bỏ qua */ }
    }, 5000);
  } catch (e) { /* bỏ qua */ }

  // ---------- màn hỏi (canvas, khung + nút ảnh của game) ----------
  // m: { loai: 'tb' | 'xd' | 'ph', tieuDe, chu, nut: [[nhãn, hàm]], ... }. Hàng đợi: mỗi lúc một màn. Không mở trong ải (chờ về làng / màn chào).
  LA.moMan = function (m) { LA.man.push(m); LA.thuMo(); return m; };
  const proxy = { la: true, duoi: null, update() {}, enter() {}, draw() { veProxy(); } };
  LA.proxy = proxy;
  LA.thuMo = function () {
    if (LA.mo || !LA.man.length || !G.scene || G.scene === proxy) return false;
    if (G.scene === G.StageScene && !LA.man[0].trongAi) return false;
    LA.mo = LA.man.shift();
    LA.mo.xn = false;
    proxy.duoi = G.scene;
    G.scene = proxy;
    try { if (G.dropPointers) G.dropPointers(); } catch (e) { /* bỏ qua */ }
    return true;
  };
  LA.dong = function () {
    const m = LA.mo;
    LA.mo = null;
    if (G.scene === proxy) G.scene = proxy.duoi;
    proxy.duoi = null;
    try { if (G.dropPointers) G.dropPointers(); } catch (e) { /* bỏ qua */ }
    LA.thuMo();
    return m;
  };
  // Đổi cảnh trong lúc màn hỏi đang mở: cảnh mới nằm dưới màn hỏi; về làng / màn chào thì mở màn đang chờ.
  if (G.setScene && !G.setScene.luuBoc) {
    const goc = G.setScene;
    G.setScene = function (s) {
      const r = goc.apply(this, arguments);
      if (LA.mo && G.scene !== proxy) { proxy.duoi = G.scene; G.scene = proxy; }
      else LA.thuMo();
      return r;
    };
    G.setScene.luuBoc = true;
  }
  try { setInterval(() => { try { LA.thuMo(); } catch (e) { /* bỏ qua */ } }, 400); } catch (e) { /* bỏ qua */ }

  function veProxy() {
    const ck = G.click;
    G.click = null;
    try { if (proxy.duoi && proxy.duoi.draw) proxy.duoi.draw(); } catch (e) { /* cảnh dưới lỗi vẽ: vẫn vẽ màn hỏi */ }
    G.click = ck;
    try { LA.veMan(); } finally { G.click = null; }
  }
  const fmtTg = (s) => { if (!(s >= 0)) return t('chưa đo'); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return h ? h + 'h ' + String(m).padStart(2, '0') + 'm' : m + 'm'; };
  const fmtLuc = (ms) => { if (!(ms > 946684800000)) return '—'; /* không có / giờ hỏng (trước năm 2000): không hiện */ const d = new Date(ms); const p = (n) => String(n).padStart(2, '0'); return p(d.getHours()) + ':' + p(d.getMinutes()) + ' ' + p(d.getDate()) + '/' + p(d.getMonth() + 1) + '/' + d.getFullYear(); };
  function khuVuc(xa) {
    if (!xa) return t('chưa qua ải nào');
    const r = Math.floor((xa - 1) / 5), i = (xa - 1) % 5, R = G.REGIONS && G.REGIONS[r];
    return (R ? G.tv ? G.tv(R.name) : R.name : 'Vùng ' + (r + 1)) + ' ' + (i + 1);
  }
  LA.dongTomTat = function (tt) {
    if (!tt) return [];
    return [t('Khu vực: {0}', khuVuc(tt.xa)), t('Cấp {0} · {1} sao', tt.cap, tt.sao), t('Vàng: {0} · Luyện cao nhất {1}', tt.vang, tt.luyen || '—'), t('Thời gian chơi: {0}', fmtTg(tt.tg)), t('Lưu lúc: {0}', fmtLuc(tt.luc))];
  };
  // Bố cục (toạ độ giao diện 480×270); bài kiểm tra dùng để bấm đúng nút
  LA.BO_CUC = {
    tb: { bang: [80, 58, 320, 154], nut: (n, i) => (n === 1 ? [180, 166, 120, 32] : [100 + i * 150, 166, 130, 32]) },
    xd: { bang: [40, 12, 400, 246], the: [[52, 60, 182, 108], [246, 60, 182, 108]], nut: [[52, 174, 182, 32], [246, 174, 182, 32]], huy: [180, 214, 120, 32] },
    ph: { bang: [40, 12, 400, 246], hang: (i) => [52, 60 + i * 38, 376, 34], dung: (i) => [352, 62 + i * 38, 70, 30], moi: [170, 216, 140, 32] },
  };
  LA.veMan = function () {
    const m = LA.mo, T = G.theme, ui = G.ui;
    if (!m || !T || !ui) return;
    T.dim(0.72);
    const B = LA.BO_CUC[m.loai];
    const C = T.C || {};
    if (m.loai === 'tb') {
      const [x, y, w, h] = B.bang;
      T.panel(x, y, w, h, t(m.tieuDe));
      ui.para(t(m.chu), x + 12, y + 36, w - 24, { size: 8.5, color: C.text });
      const n = m.nut.length;
      m.nut.forEach((nb, i) => { const r = B.nut(n, i); if (T.btn(r[0], r[1], r[2], r[3], nb[0], { primary: i === 0 })) chonNut(nb[1]); });
      return;
    }
    if (m.loai === 'xd') {
      const [x, y, w, h] = B.bang;
      T.panel(x, y, w, h, t('Bản lưu mây và máy khác nhau'));
      ui.para(t('Hai bản lưu đã chơi tiếp khác nhau. Chọn bản muốn giữ — cả hai đã được sao lưu.'), x + 12, y + 34, w - 24, { size: 8, color: C.text });
      const the = [[t('Trên mây'), m.may], [t('Thiết bị này'), m.thietBi]];
      the.forEach((th, i) => {
        const r = B.the[i];
        T.inset(r[0], r[1], r[2], r[3], false);
        ui.text(th[0], r[0] + 8, r[1] + 14, { size: 9.5, bold: true, color: C.hi });
        LA.dongTomTat(th[1]).forEach((l, j) => ui.text(l, r[0] + 8, r[1] + 32 + j * 15, { size: 8, color: C.text }));
      });
      if (T.btn(B.nut[0][0], B.nut[0][1], B.nut[0][2], B.nut[0][3], 'Dùng bản mây', { primary: true })) chonXd('may');
      if (T.btn(B.nut[1][0], B.nut[1][1], B.nut[1][2], B.nut[1][3], 'Giữ máy này', { primary: true })) chonXd('thietBi');
      if (T.btn(B.huy[0], B.huy[1], B.huy[2], B.huy[3], 'Huỷ')) chonXd('huy');
      return;
    }
    if (m.loai === 'ph') {
      const [x, y, w, h] = B.bang;
      T.panel(x, y, w, h, t('Khôi phục bản lưu'));
      const ds = LA.dsPhucHoi();
      ui.para(t(LA.phucHoi && LA.phucHoi.tu ? 'Bản lưu chính trên máy bị hỏng. Chọn một bản sao để chơi tiếp (bản hỏng vẫn được cất giữ).' : 'Không đọc được bản lưu trên máy. Chọn một bản sao, hoặc chơi mới (bản hỏng vẫn được cất giữ).'), x + 12, y + 34, w - 24, { size: 8, color: C.text });
      ds.slice(0, 4).forEach((u, i) => {
        const r = B.hang(i), d = B.dung(i), tt = u.tt || {};
        T.inset(r[0], r[1], r[2], r[3], i === 0);
        ui.text(t(u.nhan[0], u.nhan[1]), r[0] + 8, r[1] + 13, { size: 8.5, bold: true, color: C.hi });
        ui.text(t('Khu vực: {0}', khuVuc(tt.xa)) + ' · ' + t('Cấp {0} · {1} sao', tt.cap, tt.sao) + ' · ' + fmtLuc(tt.luc), r[0] + 8, r[1] + 27, { size: 7.5, color: C.text });
        if (T.btn(d[0], d[1], d[2], d[3], 'Dùng', { primary: i === 0 })) LA.chonPhucHoi(u);
      });
      if (!ds.length) ui.text(t(G.cloud && G.cloud.enabled && !LA.mayDaXem ? 'Đang tìm bản lưu trên mây…' : 'Không có bản sao nào khác.'), 240, 110, { size: 9, align: 'center', color: C.sub });
      if (T.btn(B.moi[0], B.moi[1], B.moi[2], B.moi[3], m.xn ? 'Bấm lần nữa để chơi mới' : 'Chơi mới', { danger: true, size: m.xn ? 7.5 : undefined })) {
        if (!m.xn) m.xn = true; else LA.choiMoi();
      }
    }
  };
  function chonNut(f) { LA.dong(); if (typeof f === 'function') { try { f(); } catch (e) { console.error(e); } } }
  function chonXd(lua) { const m = LA.dong(); if (m && m.xong) { try { m.xong(lua); } catch (e) { console.error(e); } } }
  // Hàm bấm cho bài kiểm tra (không cần toạ độ)
  LA.bam = function (lua) {
    const m = LA.mo; if (!m) return false;
    if (m.loai === 'xd') { chonXd(lua); return true; }
    if (m.loai === 'tb') { const nb = m.nut[lua | 0]; if (!nb) return false; chonNut(nb[1]); return true; }
    if (m.loai === 'ph') { if (lua === 'moi') { LA.choiMoi(); return true; } const u = LA.dsPhucHoi()[lua | 0]; if (!u) return false; LA.chonPhucHoi(u); return true; }
    return false;
  };

  // ---------- màn Khôi phục ----------
  LA.mayUngVien = []; // bản mây / bản sao mây (js/cloud.js điền khi kết nối được)
  LA.moManPhucHoi = function () { if (!LA.man.some((m) => m.loai === 'ph') && !(LA.mo && LA.mo.loai === 'ph')) LA.moMan({ loai: 'ph' }); };
  const NHAN_MAY = { [K.bk1]: ['Máy: bản sao gần nhất'], [K.bk2]: ['Máy: bản sao cũ hơn'], [K.phien]: ['Máy: bản lúc mở phiên trước'], [K.tam]: ['Máy: bản đang ghi dở'], [K.bkDong]: ['Máy: bản trước khi đổi bản lưu'], [K.chinh]: ['Máy: bản sao gần nhất'] };
  LA.dsPhucHoi = function () {
    const ls = LA.kho(), out = [], thay = new Set();
    const x = ls ? LA.xepUngVien(ls) : { ds: [] };
    for (const u of x.ds) {
      if (u.khoa === K.chinh || thay.has(u.raw)) continue;
      thay.add(u.raw);
      out.push({ nguon: 'may', khoa: u.khoa, s: u.s, raw: u.raw, nhan: NHAN_MAY[u.khoa] || ['Máy: bản sao gần nhất'], tt: LA.tomTat(u.s) });
    }
    for (const u of LA.mayUngVien) {
      if (thay.has(u.raw)) continue;
      thay.add(u.raw);
      out.push(u);
    }
    return out;
  };
  LA.chonPhucHoi = function (u) {
    let s = u.s;
    if (typeof s === 'string') { try { s = JSON.parse(s); } catch (e) { return false; } }
    const r = LA.thuNap(s);
    if (!r) return false;
    if (LA.mo && LA.mo.loai === 'ph') LA.dong();
    if (obj(G.save) && G.save.sound !== undefined) r.s.sound = G.save.sound;
    delete r.s._saoLuuMay;
    G.save = r.s;
    LA.khoa = r.moi ? 'moi' : '';
    LA.phucHoi = null;
    const kq = LA.ghi(G.save, { boQuaThe: true });
    LA.daKhoiPhuc = { nguon: u.nguon, ok: kq.ok };
    try { if (G.cloud && G.cloud.sauKhoiPhuc) G.cloud.sauKhoiPhuc(u); } catch (e) { /* bỏ qua */ }
    try { if (G.villageScene && G.villageScene.say && G.scene === G.Village) G.villageScene.say(t('Đã khôi phục bản lưu.')); } catch (e) { /* bỏ qua */ }
    return true;
  };
  LA.choiMoi = function () {
    if (LA.mo && LA.mo.loai === 'ph') LA.dong();
    LA.khoa = ''; LA.phucHoi = null;
    G.resetSave(); // G.persist → bản trắng; bản hỏng đã nằm ở _hong, bản sao cũ vẫn ở _bk1/_bk2
    try { if (G.cloud && G.cloud.sauKhoiPhuc) G.cloud.sauKhoiPhuc({ nguon: 'moi' }); } catch (e) { /* bỏ qua */ }
  };
})();
