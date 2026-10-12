// HÌNH TỰ VẼ (Xưởng Sprite, tools/xuong-sprite): quái hoặc em bé nào có tệp <mã>.sprite.json trong game/art/custom/
// thì vẽ bằng tấm sprite trong tệp đó, đủ các động tác (đứng thở, đi, chuẩn bị đánh, đánh, trúng đòn, chết), quay trái phải,
// chớp trắng khi trúng đòn. Quái và em bé không có tệp vẫn vẽ bằng code như cũ. Thư mục trống thì game y hệt trước.
// - game/build.py nhúng các tệp vào bản đóng gói thành G.customSpriteData (mảng), tệp này đọc rồi xoá đi.
// - Chỉ đổi HÌNH: luật chơi, thời gian ra đòn, vùng báo trước, hiệu ứng chém, đạn... vẫn của game.
// - Công cụ Xưởng Sprite cũng nạp chính tệp này để hình xem trong công cụ và trong game là một.
// Nạp SAU monster_art.js và hero_tinhlinh.js.
(function () {
  'use strict';
  const G = (typeof window !== 'undefined') ? (window.G = window.G || {}) : (globalThis.G = globalThis.G || {});
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const seg = (u, a, b) => clamp((u - a) / (b - a), 0, 1);
  const ANIMS = ['idle', 'move', 'tele', 'atk', 'hit', 'die', 'ne', 'noi'];
  const LOOP = { idle: true, move: true, noi: true };
  // Phiên E2 — DÁNG PHA của 3 trùm vùng: tệp có mã <trùm>-p2 hoặc <trùm>-p3 (ví dụ nguTinh-p2), lưới rút gọn 4 hàng idle / tele / atk / hit (tools/tach-quai).
  // Trùm đang ở pha đó thì các hàng CÓ trong tệp pha lấy từ tệp pha; hàng không có (move, die với lưới 4 hàng) mượn tệp pha 1. Không có tệp pha: vẽ pha 1 như trước.
  // Để sẵn: nếu sau này tệp pha có thêm hàng move hoặc die thì game dùng luôn, không phải sửa code (trang công cụ hiện chỉ xuất 4 hàng).
  const PHA_MA = /^(nguTinh|mocTinh|hoTinh)-p([23])$/, PHA_HANG = { idle: 1, tele: 1, atk: 1, hit: 1, move: 1, die: 1 };

  // Phiên 3 — ĐÒN THEO VŨ KHÍ của thân em bé AI: các hàng TUỲ CHỌN, thường nằm ở tệp riêng em-be-<key>-don (hoặc em-be-<key>-<bộ>-don)
  // ghép vào thân gốc khi nạp; ghi thẳng trong tệp thân cũng được. Không có hàng nào: game dùng hàng "atk" như trước.
  // Tắt: G.DON_VK = false, hoặc mở game với ?donvk=0.
  const HANG_DON = ['atk_sword', 'atk_bow', 'atk_spear', 'atk_hammer', 'cast'], LA_DON = { atk_sword: 1, atk_bow: 1, atk_spear: 1, atk_hammer: 1, cast: 1 };
  if (G.DON_VK === undefined) {
    let tat = false;
    try { tat = typeof location !== 'undefined' && /[?&]donvk=0(&|$)/.test(location.search || ''); } catch (e) { tat = false; }
    G.DON_VK = !tat;
  }

  const SC = (G.spriteCustom = { ds: {}, ANIMS, LOOP, loi: [], HANG_DON, don: {} });
  SC.laHangDon = (ten) => !!LA_DON[ten];
  // Phiên hiệu năng (V3): nạp tệp ảnh tải sau nhẹ nhàng hơn — giải mã ảnh ngoài luồng chính (img.decode) trước khi dùng, mỗi khung
  // chỉ nhận vài hình, và chỉ xoá hình đã nhớ của em bé / đồ khi hình mới đang được dùng (thay cho xoá theo nhịp 400 ms).
  // Tắt: G.NAP_SAU_MOI = false hoặc ?napsau=0 (như cũ).
  if (G.NAP_SAU_MOI === undefined) {
    let tat = false;
    try { tat = typeof location !== 'undefined' && /[?&]napsau=0(&|$)/.test(location.search || ''); } catch (e) { tat = false; }
    G.NAP_SAU_MOI = !tat;
  }
  let napSauDangChay = false, trongNapSau = false;
  // Gắn ảnh nguồn src vào img (đã gắn sẵn onload / onerror). Ảnh của tệp tải sau: giải mã xong (ngoài luồng chính) mới gọi onload,
  // để lần vẽ đầu không phải giải mã PNG ngay trong khung hình. Trình duyệt không có img.decode: như cũ.
  SC.napAnh = function (img, src) {
    if (!G.NAP_SAU_MOI || !trongNapSau || typeof img.decode !== 'function') { img.src = src; return; }
    const xong = img.onload, hong = img.onerror;
    img.onload = null; img.onerror = null;
    img.src = src;
    img.decode().then(() => { if (xong) xong.call(img); }, () => { if (img.complete && img.naturalWidth) { if (xong) xong.call(img); } else if (hong) hong.call(img); });
  };
  // "net" (số nguyên 1..4, mặc định 1): ảnh trong tệp ("tam" hoặc "anh") có số điểm ảnh gấp net lần, còn MỌI số khác trong tệp
  // (khung_rong, khung_cao, goc, rong, cao, neo, vu_khi.cam/mui/day, trang_phuc.lech...) vẫn tính theo điểm ảnh GAME.
  // Game cắt vùng ảnh gấp net lần rồi vẽ ra đúng cỡ game: trên canvas thế giới nét gấp đôi (G.NET = 2) hiện đủ chi tiết.
  const docNet = (v) => (v == null || !isFinite(+v) ? 1 : clamp(Math.round(+v), 1, 4));
  SC.docNet = docNet;

  // ---------- nạp một tệp ----------
  // tep: nội dung tệp .sprite.json (đối tượng). Trả về sprite (đang nạp ảnh) hoặc null nếu tệp hỏng.
  SC.add = function (tep) {
    if (tep && tep.doi_tuong === 'hieu-ung') return G.fxAnh ? G.fxAnh.add(tep) : null; // hiệu ứng ảnh AI (js/fx_anh.js)
    try {
      if (!tep || typeof tep !== 'object' || typeof tep.ma !== 'string' || !/^[A-Za-z0-9_-]{1,40}$/.test(tep.ma)) throw new Error('thiếu mã');
      if (DO_LOAI[tep.doi_tuong]) return themDo(tep); // vũ khí, trang phục, vật phẩm
      if (tep.doi_tuong === 'em-be' && /-don$/.test(tep.ma)) return themDon(tep); // đòn theo vũ khí của một thân em bé (Phiên 3)
      if (tep.doi_tuong === 'ghep') return themGhep(tep); // hồ sơ ghép trang bị của một nhân vật (ghep-<key>), không có ảnh
      if (tep.doi_tuong === 'giao-dien') return themGd(tep); // ảnh giao diện (gd-<tên>): biểu tượng, ô phòng, khung bản đồ
      if (typeof tep.tam !== 'string' || tep.tam.indexOf('data:image/png;base64,') !== 0) throw new Error('thiếu tấm sprite');
      const fw = tep.khung_rong | 0, fh = tep.khung_cao | 0, goc = tep.goc || [0, 0];
      if (fw < 1 || fh < 1 || fw > 1024 || fh > 1024) throw new Error('cỡ khung sai');
      const dt = {};
      for (const k of tep.doi_tuong === 'em-be' ? ANIMS.concat(HANG_DON) : ANIMS) {
        const a = tep.dong_tac && tep.dong_tac[k];
        if (!a) continue;
        dt[k] = { hang: a.hang | 0, so: Math.max(1, a.so | 0), giay: +a.giay > 0 ? +a.giay : 0.6, lap: !!a.lap, mo: a.mo != null ? +a.mo : null };
      }
      if (!dt.idle) throw new Error('thiếu động tác đứng thở');
      const sp = {
        ma: tep.ma, ten: String(tep.ten || tep.ma), doi: tep.doi_tuong === 'em-be' ? 'em-be' : tep.doi_tuong === 'nguoi-lang' ? 'nguoi-lang' : 'quai', fw, fh, ax: +goc[0] || 0, ay: +goc[1] || 0,
        lat: /^(trai|trái|left)$/i.test(String(tep.huong || tep.quay || '')), // ảnh vẽ quay TRÁI thì ghi "huong":"trai" — game tự lật lại để đầu luôn hướng về phía đi
        net: docNet(tep.net), rong: tep.rong | 0 || fw, cao: tep.cao | 0 || fh, bong: +tep.bong || Math.max(6, (tep.rong | 0) * 0.62), dt, img: null, ready: false, mau: {}, vung: tep.vung || 'moi',
      };
      // Bộ phận "Đứng yên" và độ nhún cả người chọn trong công cụ. Tấm sprite đã dựng sẵn theo lựa chọn này, nên game chỉ
      // phát đúng từng khung, không tự thêm nhún, lắc hay xoay nào lên hình tự vẽ (bộ phận đứng yên giữ nguyên trong game).
      // Tệp cũ không có hai mục này: null, phát như trước.
      sp.dungYen = Array.isArray(tep.dung_yen) ? tep.dung_yen.filter((x) => typeof x === 'string' && /^[A-Za-z0-9_]{1,20}$/.test(x)).slice(0, 20) : null;
      sp.nhun = tep.nhun == null || !isFinite(+tep.nhun) ? null : clamp(+tep.nhun, 0, 200);
      // Em bé thân AI: đồ đang mặc (mũ, áo, đồ lưng, bùa, dấu mặt nạ, cánh) vẫn khoác lên thân AI, trừ khi tệp ghi "khoac_do": false.
      // "neo": { "dau": [dx, dy], "than": [dx, dy], "tay": [dx, dy], "<động tác>": { "dau": [..], "than": [..], "tay": [..] } } dời chỗ đặt đồ
      // (đầu, thân) và vũ khí + nắm tay (tay) theo điểm ảnh cho khớp hình AI.
      if (sp.doi === 'em-be') {
        sp.khoacDo = tep.khoac_do !== false; sp.neo = docNeo(tep.neo);
        // Thân theo BỘ TRANG PHỤC: mã em-be-<nhân vật>-<bộ> (bộ: rung, bien, lau). Thân đã vẽ sẵn mũ, áo, đồ lưng, bùa của bộ.
        const mb = /^em-be-(smith|hunter|healer|wrestler)-(rung|bien|lau)$/.exec(sp.ma); sp.bo = mb ? mb[2] : null;
      }
      if (typeof Image !== 'undefined') {
        const img = new Image();
        img.onload = () => { sp.img = img; sp.img0 = null; sp.donMa = null; sp.ready = true; if (sp.doi === 'em-be') { ghepDon(sp.ma); if (G.NAP_SAU_MOI && napSauDangChay) xoaNhoDoKhiCan(sp); } };
        img.onerror = () => { SC.loi.push(sp.ma + ': ảnh hỏng'); };
        SC.napAnh(img, tep.tam);
      }
      SC.ds[sp.ma] = sp;
      // Chỉ nối vào game khi thật sự có hình tự vẽ: không có tệp nào thì game y hệt như chưa có tệp này.
      // Phiên E2: tệp <trùm>-p2 / <trùm>-p3 là DÁNG PHA của trùm vùng (lưới rút gọn 4 hàng), không phải một con quái mới: không thêm vào danh sách quái.
      const mp = sp.doi === 'quai' ? PHA_MA.exec(sp.ma) : null;
      if (mp) { sp.phaCua = mp[1]; sp.pha = +mp[2]; noiQuai(); }
      else if (sp.doi === 'quai') { noiQuai(); themVaoDanhSach(sp); } else if (sp.doi === 'nguoi-lang') noiNguoiLang(); else noiEmBe();
      return sp;
    } catch (e) {
      SC.loi.push((tep && tep.ma) + ': ' + e.message);
      if (typeof console !== 'undefined') console.warn('sprite_custom: bỏ qua tệp hỏng', tep && tep.ma, e.message);
      return null;
    }
  };
  SC.remove = function (ma) { for (const k in SC.don) if (SC.don[k].ma === ma) boDon(k); if (SC.do[ma]) boDo(ma); delete SC.ds[ma]; if (SC.gd) delete SC.gd[ma]; for (const k in SC.ghep) if (SC.ghep[k].ma === ma) boGhep(k); };
  SC.clear = function () { for (const k of Object.keys(SC.don)) boDon(k); for (const k of Object.keys(SC.ds)) delete SC.ds[k]; for (const k of Object.keys(SC.do)) boDo(k); for (const k of Object.keys(SC.ghep)) boGhep(k); if (SC.gd) for (const k of Object.keys(SC.gd)) delete SC.gd[k]; };
  SC.get = function (ma) { const s = SC.ds[ma]; return s && s.ready ? s : null; };
  SC.has = (ma) => !!SC.ds[ma];
  SC.dungYen = (ma, bo) => { const s = SC.ds[ma]; return !!(s && s.dungYen && s.dungYen.indexOf(bo) >= 0); };

  // ---------- chọn khung ----------
  // Động tác lặp: theo thời gian t (giây). Động tác một lần: theo tiến độ u (0..1).
  function khungLap(a, t) { return Math.floor(Math.max(0, t) / (a.giay / a.so) + 1e-6) % a.so; }
  function khungMot(a, u) { return Math.min(a.so - 1, Math.floor(clamp(u, 0, 1) * a.so)); }
  SC.khungLap = khungLap; SC.khungMot = khungMot;
  // Phiên hiệu năng (V2): bộ nhớ đệm hình dùng chung một ngân sách điểm ảnh (js/bo_nho.js). Trang công cụ không nạp bo_nho.js:
  // dùng bản đơn giản (trần đếm số tấm, đầy thì xoá sạch như cũ).
  const taoNho = (G.boNho && G.boNho.tao) || ((ten, o) => { const m = new Map(), max = (o && o.max) || 2000; return { get: (k) => m.get(k), set: (k, v) => { if (m.size >= max) m.clear(); m.set(k, v); return v; }, cong() {}, del: (k) => m.delete(k), clear: () => m.clear(), get size() { return m.size; } }; });
  const boNhoBat = () => !!(G.boNho && G.BO_NHO);
  // Số hiệu của một tấm ảnh (khoá bộ nhớ đệm theo ẢNH chứ không theo tệp: ảnh đổi, ví dụ ghép hàng đòn, thì khoá đổi theo).
  const ID_ANH = new WeakMap(); let demAnh = 0;
  const idAnh = (img) => { let n = ID_ANH.get(img); if (!n) { n = ++demAnh; ID_ANH.set(img, n); } return n; };
  const NH_QUAI = taoNho('nhuom-quai', { max: 600, nhom: 'quai' }), NH_KHAC = taoNho('nhuom', { max: 600 });
  const THAN_NHO = taoNho('than-quai', { max: 800, nhom: 'quai' }), XOAY_NHO = taoNho('xoay-vk', { max: 1200 });
  // V5: tấm một màu CỠ MỘT KHUNG (sx, sy, sw, sh trên tấm sprite), thay cho nhuộm cả tờ (trùm lớn: 5 Mpx = 20 MB mỗi màu).
  // Trả về canvas sw×sh: vẽ bằng drawImage(cv, 0, 0, sw, sh, …) cho cùng điểm ảnh như cắt từ tờ đã nhuộm. Tắt bộ nhớ chung (?bonho=0): nhuộm cả tờ như cũ.
  function nhuomKhung(sp, col, sx, sy, sw, sh) {
    const C = sp.doi === 'quai' ? NH_QUAI : NH_KHAC, key = idAnh(sp.img) + '|' + col + '|' + sx + '|' + sy + '|' + sw + '|' + sh;
    let cv = C.get(key);
    if (cv) return cv;
    cv = document.createElement('canvas'); cv.width = sw; cv.height = sh;
    const x = cv.getContext('2d'); x.drawImage(sp.img, sx, sy, sw, sh, 0, 0, sw, sh); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, sw, sh);
    return C.set(key, cv);
  }
  // Dán phần (sx, sy, sw, sh) của tấm sprite đã nhuộm một màu lên bút c tại (dx, dy, dw, dh).
  function veNhuom(c, sp, col, sx, sy, sw, sh, dx, dy, dw, dh) {
    if (boNhoBat()) c.drawImage(nhuomKhung(sp, col, sx, sy, sw, sh), 0, 0, sw, sh, dx, dy, dw, dh);
    else c.drawImage(nhuom(sp, col), sx, sy, sw, sh, dx, dy, dw, dh);
  }
  SC.nhuomKhung = nhuomKhung;
  // Tấm ảnh một màu (chớp trắng, nhuộm băng, độc), nhớ theo màu. (Cả tờ: chỉ còn dùng khi tắt bộ nhớ chung, và cho công cụ.)
  function nhuom(sp, col) {
    let cv = sp.mau[col];
    if (!cv) {
      cv = document.createElement('canvas'); cv.width = sp.img.width; cv.height = sp.img.height;
      const x = cv.getContext('2d'); x.drawImage(sp.img, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, cv.width, cv.height);
      sp.mau[col] = cv;
    }
    return cv;
  }
  SC.nhuom = nhuom;
  // ---------- Đợt 7: nhuộm THÂN theo trạng thái (dính độc / cháy / đóng băng) ----------
  // Khác tấm một màu ở trên: giữ nguyên viền #14182e và các cụm sáng nhỏ (mắt, răng, nanh), chỉ hoà màu vào phần thân còn lại.
  // than: { mau: '#rrggbb', muc: 0..1 (mức hoà), suong: 0..1 (phủ trắng 1/3 trên thân, dùng cho băng) }.
  // Nhớ theo mã + khung + màu + mức hoà: mỗi khung chỉ tính một lần; lúc vẽ dán đúng một tấm, không thêm lệnh vẽ nào.
  // Ảnh không đọc được điểm ảnh (hiếm): trả null, người gọi vẽ thân thường như cũ.
  const VIEN = [0x14, 0x18, 0x2e], SANG = 0xc8; // SANG: mọi kênh màu ≥ mức này thì coi là "sáng" (mắt, răng, nanh của ảnh AI thường ngả kem chứ không trắng tinh)
  function naGiu(sp, d, w, h) { // 1 = giữ nguyên (viền, cụm sáng nhỏ), 0 = được nhuộm
    const giu = new Uint8Array(w * h), n = sp.net || 1, tran = Math.max(6, Math.round(0.015 * sp.rong * sp.cao)) * n * n, nhan = new Uint8Array(w * h), xep = [];
    for (let q = 0, j = 0; q < giu.length; q++, j += 4) {
      if (!d[j + 3]) continue;
      if (Math.abs(d[j] - VIEN[0]) <= 6 && Math.abs(d[j + 1] - VIEN[1]) <= 6 && Math.abs(d[j + 2] - VIEN[2]) <= 6) giu[q] = 1;
      else if (d[j] >= SANG && d[j + 1] >= SANG && d[j + 2] >= SANG) nhan[q] = 1; // sáng, chưa biết cụm to hay nhỏ
    }
    for (let q0 = 0; q0 < nhan.length; q0++) { // gom cụm sáng liền nhau; cụm nhỏ (mắt, răng) thì giữ, mảng sáng to (bụng trắng, thân băng) vẫn nhuộm
      if (nhan[q0] !== 1) continue;
      xep.length = 0; xep.push(q0); nhan[q0] = 2;
      for (let k = 0; k < xep.length; k++) {
        const q = xep[k], x = q % w;
        if (x > 0 && nhan[q - 1] === 1) { nhan[q - 1] = 2; xep.push(q - 1); }
        if (x < w - 1 && nhan[q + 1] === 1) { nhan[q + 1] = 2; xep.push(q + 1); }
        if (q >= w && nhan[q - w] === 1) { nhan[q - w] = 2; xep.push(q - w); }
        if (q + w < nhan.length && nhan[q + w] === 1) { nhan[q + w] = 2; xep.push(q + w); }
      }
      if (xep.length <= tran) for (let k = 0; k < xep.length; k++) giu[xep[k]] = 1;
    }
    return giu;
  }
  function khungThan(sp, hang, i, than) {
    if (sp.thanHong || !than || !(than.muc > 0)) return null;
    const muc = Math.round(clamp(than.muc, 0, 1) * 20), su = Math.round(clamp(than.suong || 0, 0, 1) * 20), key = hang + '|' + i + '|' + than.mau + '|' + muc + '|' + su, chung = boNhoBat(), kho = chung ? null : sp.than || (sp.than = {});
    const kc = chung ? idAnh(sp.img) + '|' + key : null; // V2: bộ nhớ chung (nhóm quái, xoá khi về làng), khoá theo ảnh
    let cv = chung ? THAN_NHO.get(kc) : kho[key];
    if (cv) return cv;
    try {
      const n = sp.net || 1, w = sp.fw * n, h = sp.fh * n, R = parseInt(than.mau.slice(1, 3), 16), Gm = parseInt(than.mau.slice(3, 5), 16), B = parseInt(than.mau.slice(5, 7), 16), k = muc / 20, ks = su / 20;
      cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      const x = cv.getContext('2d', { willReadFrequently: true }); x.drawImage(sp.img, i * w, hang * h, w, h, 0, 0, w, h);
      const im = x.getImageData(0, 0, w, h), d = im.data, kg = sp.giu || (sp.giu = {}), giu = kg[hang + '|' + i] || (kg[hang + '|' + i] = naGiu(sp, d, w, h));
      let y0 = h, y1 = -1; // hộp thân của khung này, để phủ sương 1/3 trên
      if (ks > 0) for (let y = 0; y < h; y++) for (let q = y * w * 4 + 3, e = q + w * 4; q < e; q += 4) if (d[q]) { if (y < y0) y0 = y; y1 = y; break; }
      const qs = ks > 0 && y1 >= y0 ? Math.round(y0 + (y1 - y0 + 1) / 3) * w : -1; // điểm ảnh trước mốc này thuộc 1/3 trên thân
      for (let q = 0, j = 0; q < giu.length; q++, j += 4) {
        if (!d[j + 3] || giu[q]) continue;
        let r = d[j] + (R - d[j]) * k, g = d[j + 1] + (Gm - d[j + 1]) * k, b = d[j + 2] + (B - d[j + 2]) * k;
        if (q < qs) { r += (255 - r) * ks; g += (255 - g) * ks; b += (255 - b) * ks; }
        d[j] = Math.round(r); d[j + 1] = Math.round(g); d[j + 2] = Math.round(b);
      }
      x.putImageData(im, 0, 0);
      if (chung) THAN_NHO.set(kc, cv); else kho[key] = cv;
      return cv;
    } catch (e) { sp.thanHong = true; return null; }
  }
  SC.khungThan = khungThan;
  // Dáng thân của quái (khung đứng thở đầu tiên), tính theo px game so với điểm neo chân, hình quay sang PHẢI (x âm = phía lưng):
  // { x0, x1, y0, y1 (hộp thân), w, h, tren[cột] (y điểm ảnh trên cùng của cột), sau[hàng] (x điểm ảnh ngoài cùng phía lưng), cx0 (cột 0 ứng với x nào), chan: [x trái, x phải] của phần chân }
  // Dùng để đặt hạt trạng thái bám đúng lưng, vai, chân. Không đọc được ảnh: null.
  SC.dangQuai = function (sp) {
    if (sp.dang !== undefined) return sp.dang;
    sp.dang = null;
    try {
      const n = sp.net || 1, w = sp.fw * n, h = sp.fh * n, a = sp.dt.idle, cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      const x = cv.getContext('2d', { willReadFrequently: true }); x.drawImage(sp.img, 0, a.hang * h, w, h, 0, 0, w, h);
      const d = x.getImageData(0, 0, w, h).data, fw = sp.fw, fh = sp.fh, ax = sp.lat ? fw - sp.ax : sp.ax, tren = new Int16Array(fw).fill(32767), sau = new Int16Array(fh).fill(32767), truoc = new Int16Array(fh).fill(-32767);
      let x0 = 32767, x1 = -32767, y0 = 32767, y1 = -32767;
      for (let Y = 0; Y < h; Y++) for (let X = 0; X < w; X++) {
        if (d[(Y * w + X) * 4 + 3] < 128) continue;
        const gy = Math.floor(Y / n), gx0 = Math.floor(X / n), gx = sp.lat ? fw - 1 - gx0 : gx0, rx = gx - ax, ry = gy - sp.ay;
        if (ry < tren[gx]) tren[gx] = ry;
        if (rx < sau[gy]) sau[gy] = rx;
        if (rx > truoc[gy]) truoc[gy] = rx;
        if (rx < x0) x0 = rx; if (rx > x1) x1 = rx; if (ry < y0) y0 = ry; if (ry > y1) y1 = ry;
      }
      if (x1 < x0) return null;
      const H = y1 - y0 + 1; let c0 = 32767, c1 = -32767;
      for (let gy = 0; gy < fh; gy++) { const ry = gy - sp.ay; if (ry >= y1 - Math.max(1, Math.round(H * 0.15)) && ry <= y1 && sau[gy] < 32767) { c0 = Math.min(c0, sau[gy]); c1 = Math.max(c1, truoc[gy]); } }
      sp.dang = { x0, x1: x1 + 1, y0, y1: y1 + 1, w: x1 - x0 + 1, h: H, tren, sau, cx0: -ax, cy0: -sp.ay, chan: [c0, c1 + 1] };
    } catch (e) { sp.dang = null; }
    return sp.dang;
  };
  // Vẽ một khung tại gốc toạ độ hiện tại (gốc = điểm giữa chân). face < 0: lật sang trái (hình gốc quay sang phải).
  // o: { alpha, flash (0..1 chớp trắng), tint: [màu, độ đậm], dy, than: { mau, muc, suong } (nhuộm thân theo trạng thái, Đợt 7) }
  SC.veKhung = function (c, sp, ten, i, face, o) {
    o = o || {};
    const a = sp.dt[ten] || sp.dt.idle, n = sp.net || 1, sx = i * sp.fw * n, sy = a.hang * sp.fh * n, sw = sp.fw * n, sh = sp.fh * n, ga = c.globalAlpha;
    c.save();
    c.imageSmoothingEnabled = false;
    if ((face < 0) !== !!sp.lat) c.scale(-1, 1);
    const dx = -sp.ax, dy = -sp.ay + (o.dy || 0);
    if (o.alpha != null) c.globalAlpha = ga * clamp(o.alpha, 0, 1);
    const a1 = c.globalAlpha;
    const th = o.than ? khungThan(sp, a.hang, i, o.than) : null; // Đợt 7: thân đã nhuộm theo trạng thái (giữ viền, mắt), không có thì vẽ thân thường
    if (th) c.drawImage(th, 0, 0, sw, sh, dx, dy, sp.fw, sp.fh);
    else c.drawImage(sp.img, sx, sy, sw, sh, dx, dy, sp.fw, sp.fh);
    if (o.tint && o.tint[1] > 0) { c.globalAlpha = a1 * clamp(o.tint[1], 0, 1); veNhuom(c, sp, o.tint[0], sx, sy, sw, sh, dx, dy, sp.fw, sp.fh); }
    if (o.flash > 0) { c.globalAlpha = a1 * clamp(o.flash, 0, 1); veNhuom(c, sp, '#ffffff', sx, sy, sw, sh, dx, dy, sp.fw, sp.fh); }
    c.restore();
  };

  // ---------- QUÁI ----------
  // Đổi tên cử động của game sang động tác của tấm sprite. D: thời lượng cử động trong game (giây).
  SC.chonQuai = function (sp, n, t, D) {
    const dt = sp.dt, mot = (ten, u) => { const a = dt[ten] || dt.idle; return { ten: dt[ten] ? ten : 'idle', i: dt[ten] ? khungMot(a, u) : khungLap(a, t), u }; };
    const lap = (ten, tt) => { const a = dt[ten] || dt.idle; return { ten: dt[ten] ? ten : 'idle', i: khungLap(a, tt == null ? t : tt), u: 0 }; };
    D = D > 0 ? D : (dt[n] && dt[n].giay) || 0.6;
    const u = clamp(t / D, 0, 1);
    if (n === 'idle' || n === 'intro') return lap('idle');
    if (n === 'move') return lap('move');
    if (n === 'tele' || n === 'phase2' || n === 'phase3') return mot('tele', u);
    if (n === 'atk') return mot('atk', u);
    if (n === 'hit') return mot('hit', u);
    if (n === 'stun') { const r = mot('hit', 0.35 + 0.15 * Math.sin(t * 9)); r.u = 1; return r; }
    if (n === 'die') { const r = mot('die', u); r.alpha = 1 - seg(u, dt.die && dt.die.mo != null ? dt.die.mo : 0.6, 1); return r; }
    if (n === 'spawn') { const r = lap('idle'); const k = seg(u, 0.1, 0.75); r.alpha = k; r.dy = Math.round((1 - k) * 6); return r; }
    if (/^chieu|^c\d$/.test(n)) return u < 0.4 ? mot('tele', u / 0.4) : mot('atk', (u - 0.4) / 0.6);
    return lap('idle');
  };
  // Phiên E2: tệp dáng pha của trùm vùng. sp: tệp pha 1; pha: 2 hoặc 3; ten: hàng sắp vẽ. Trả về tệp pha nếu đã nạp xong và có hàng đó, không thì null (vẽ pha 1).
  SC.phaTrum = function (sp, pha, ten) {
    if (!sp || pha < 2 || !PHA_HANG[ten]) return null;
    const p = SC.ds[sp.ma + '-p' + pha];
    return p && p.ready && p.dt[ten] ? p : null;
  };
  // Vẽ quái tự vẽ tại (x, y) với tuỳ chọn giống G.monsterArt.draw. bong: có vẽ bóng dưới chân không. D: thời lượng cử động trong game.
  SC.veQuai = function (c, sp, x, y, o, bong, D) {
    o = o || {};
    const n = o.anim || 'idle', t = Math.max(0, o.t || 0);
    let face = o.face || 0;
    if (!face) { const dir = o.dir == null ? Math.PI : o.dir; face = Math.cos(dir) > 0.01 ? 1 : -1; }
    let s = SC.chonQuai(sp, n, t, D);
    // Phiên E2: trùm vùng ở pha 2, 3 có tệp dáng pha thì các hàng có trong tệp đó (idle / tele / atk / hit) lấy từ tệp đó (xem SC.phaTrum). Cảnh chuyển pha: nửa đầu còn dáng cũ, như hình vẽ bằng code.
    let pha = o.phase | 0;
    if (pha >= 2 && (n === 'phase2' || n === 'phase3') && s.u < 0.5) pha--;
    const sp2 = pha >= 2 ? SC.phaTrum(sp, pha, s.ten) : null;
    let ve = sp; // tệp thật sự dùng để vẽ thân (bóng dưới chân vẫn theo tệp pha 1)
    if (sp2) { const s2 = SC.chonQuai(sp2, n, t, D); if (s2.ten === s.ten) { s = s2; ve = sp2; } }
    let flash = o.hit || 0;
    if (s.ten === 'hit' && n === 'hit' && s.u < 0.3) flash = Math.max(flash, 0.75); // chớp trắng đầu cú trúng đòn
    if (o.baoDon > 0) flash = Math.max(flash, o.baoDon); // Phiên E2: chớp trắng báo sắp ra đòn (js/boss.js truyền cho trùm vùng có ảnh AI); chỉ là hình
    c.save();
    c.translate(Math.round(x), Math.round(y));
    if (bong) {
      const w = sp.bong * (n === 'die' ? 1 - 0.5 * (s.u || 0) : 1);
      c.save();
      c.globalAlpha *= 0.28 * (s.alpha == null ? 1 : s.alpha);
      if (G.art && G.art.ellipse) G.art.ellipse(c, 0, 0, w / 2, Math.max(1.5, w * 0.14), '#000000');
      else { c.fillStyle = '#000'; c.beginPath(); c.ellipse(0, 0, w / 2, Math.max(1.5, w * 0.14), 0, 0, Math.PI * 2); c.fill(); }
      c.restore();
    }
    // o.than (Đợt 7): màu nhuộm thân khi quái dính độc / cháy / đóng băng, do js/mobs.js truyền khi cờ G.TRANG_THAI_TREN_THAN bật. Không có thì vẽ y cũ.
    SC.veKhung(c, ve, s.ten, s.i, face, { alpha: s.alpha, flash, dy: s.dy, than: o.than || null });
    c.restore();
    return s;
  };

  // Bút giả: chuyển mọi lệnh vẽ sang bút thật, riêng drawImage thì hỏi hàm thay.
  function butGia(c, thay) {
    const nho = new Map();
    return new Proxy(c, {
      get(o, k) {
        if (k === 'drawImage') return thay;
        const v = o[k];
        if (typeof v !== 'function') return v;
        let f = nho.get(k);
        if (!f) { f = v.bind(o); nho.set(k, f); }
        return f;
      },
      set(o, k, v) { o[k] = v; return true; },
    });
  }
  SC.butGia = butGia;
  // Phiên hiệu năng (V1): bút giả DÙNG LẠI — mỗi bút thật giữ sẵn vài bút giả (Proxy tạo một lần), mượn rồi trả sau mỗi lần vẽ,
  // thay cho tạo Proxy + Map mới mỗi khung. Mượn lồng nhau (vẽ trong lúc đang vẽ) thì lấy bút giả khác còn rảnh.
  const BUT = new WeakMap();
  function muonBut(c, thay) {
    let ds = BUT.get(c);
    if (!ds) { ds = []; BUT.set(c, ds); }
    for (const b of ds) if (!b.ban) { b.ban = true; b.thay = thay; return b; }
    const b = { ban: true, thay, p: null }, nho = new Map();
    b.p = new Proxy(c, {
      get(o, k) {
        if (k === 'drawImage') return b.thay;
        const v = o[k];
        if (typeof v !== 'function') return v;
        let f = nho.get(k);
        if (!f) { f = v.bind(o); nho.set(k, f); }
        return f;
      },
      set(o, k, v) { o[k] = v; return true; },
    });
    ds.push(b);
    return b;
  }
  function traBut(b) { b.ban = false; b.thay = null; }
  SC.muonBut = muonBut; SC.traBut = traBut;
  // Cờ tắt V1: G.BO_THAN = false hoặc ?bothan=0 → như cũ (dựng thân bằng code rồi bỏ đi, bút giả mới mỗi lần vẽ).
  if (G.BO_THAN === undefined) {
    let tat = false;
    try { tat = typeof location !== 'undefined' && /[?&]bothan=0(&|$)/.test(location.search || ''); } catch (e) { tat = false; }
    G.BO_THAN = !tat;
  }

  let MA = null, draw0 = null, dur0 = null;
  function themVaoDanhSach(sp) {
    if (!MA || (MA._defs && MA._defs[sp.ma])) return;
    if (MA.list.some((m) => m.id === sp.ma)) return;
    MA.list.push({ id: sp.ma, ten: sp.ten, vung: sp.vung, loai: 'thuong', w: sp.rong, h: sp.cao, pha: 1, bay: false, tuVe: true,
      anims: Object.keys(sp.dt).map((k) => ({ id: k, ten: k, d: sp.dt[k].giay, lap: !!sp.dt[k].lap, moc: null })) });
  }
  function noiQuai() {
    MA = G.monsterArt;
    if (!MA || MA._spriteCustom) return;
    if (!SC.noi) return;
    MA._spriteCustom = true;
    draw0 = MA.draw; dur0 = MA.dur;
    MA.draw = function (c, id, x, y, o) {
      const sp = SC.ds[id];
      if (!sp || !sp.ready) return draw0.call(MA, c, id, x, y, o);
      o = o || {};
      const def = MA._defs && MA._defs[id];
      if (!def) { SC.veQuai(c, sp, x, y, o, true, 0); return; }
      // Quái có sẵn: để hình gốc vẽ bóng và hiệu ứng (vệt chém, tia lửa...), chỉ thay phần thân bằng hình tự vẽ.
      const T0 = c.getTransform(), a0 = c.globalAlpha, D = dur0.call(MA, id, o.anim) || 0;
      let xong = false;
      const thay = function () {
        if (xong) return;
        xong = true;
        c.save(); c.setTransform(T0); c.globalAlpha = a0;
        try { SC.veQuai(c, sp, x, y, o, false, D); } finally { c.restore(); }
      };
      if (G.BO_THAN === false) { draw0.call(MA, butGia(c, thay), id, x, y, o); return; }
      const b = muonBut(c, thay);
      MA._boThan = true; // V1: monster_art.js bỏ bước dựng thân bằng code (không bao giờ hiện ra), chỉ chạy Pose, bóng, hiệu ứng
      try { draw0.call(MA, b.p, id, x, y, o); } finally { MA._boThan = false; traBut(b); }
    };
    MA.dur = function (id, anim) {
      const d = dur0.call(MA, id, anim);
      if (d) return d;
      const sp = SC.ds[id];
      return sp && sp.dt[anim] ? sp.dt[anim].giay : 0;
    };
  }

  // ---------- EM BÉ ----------
  const so2 = (a) => (Array.isArray(a) && a.length === 2 && isFinite(a[0]) && isFinite(a[1]) ? [clamp(Math.round(+a[0]), -30, 30), clamp(Math.round(+a[1]), -30, 30)] : null);
  function docNeo(n) {
    const goc = { dau: (n && so2(n.dau)) || [0, 0], than: (n && so2(n.than)) || [0, 0], tay: (n && so2(n.tay)) || [0, 0] }, kq = { goc, theo: {} };
    if (n && typeof n === 'object') for (const k of ANIMS) {
      const m = n[k]; if (!m || typeof m !== 'object') continue;
      kq.theo[k] = { dau: so2(m.dau) || goc.dau, than: so2(m.than) || goc.than, tay: so2(m.tay) || goc.tay };
    }
    return kq;
  }
  SC.docNeo = docNeo;
  // Điểm neo của động tác ten (động tác không ghi riêng thì dùng neo chung).
  SC.neoCua = (sp, ten) => (sp.neo ? sp.neo.theo[ten] || sp.neo.goc : null);
  // Mã tệp: "em-be" cho cả bốn em bé, hoặc "em-be-smith", "em-be-hunter", "em-be-healer", "em-be-wrestler" cho từng bé.
  // BỘ TRANG PHỤC vẽ liền cả cử động: "em-be-<nhân vật>-<bộ>" (bộ: rung Rừng Già, bien Hang Biển, lau Lâu Đài), cùng định dạng tệp em bé.
  // Khi đang mặc ÁO của một bộ (o.outfit.fx.bo_than do js/outfit.js O.look ghi: bộ của áo, không cần đủ 3 món; quyết định Q1) và có tệp
  // thân bộ của nhân vật đó thì dùng thân bộ thay thân thường; không có tệp thì về thân gốc như cũ. o: đối tượng vẽ em bé (có outfit
  // hoặc p.outfit); không đưa o thì chỉ tìm thân thường. Đồ tự dựng không có bo_than (trang công cụ cũ) thì đọc fx.bo như trước.
  const BO_TP = { rung: 1, bien: 1, lau: 1 };
  SC.BO_TP = ['rung', 'bien', 'lau'];
  const fxCua = (o) => { const x = o && (o.outfit || (o.p && o.p.outfit)); return (x && x.fx) || null; };
  SC.boCua = (o) => { const f = fxCua(o), b = f && (f.bo_than !== undefined ? f.bo_than : f.bo); return typeof b === 'string' && BO_TP[b] ? b : null; };
  SC.thanBo = (key, o) => { const b = SC.boCua(o); return b ? SC.get('em-be-' + (key || 'smith') + '-' + b) : null; };
  SC.cuaEmBe = (key, o) => (o && SC.thanBo(key, o)) || SC.get('em-be-' + (key || 'smith')) || SC.get('em-be');
  // ---------- ĐÒN THEO VŨ KHÍ (Phiên 3) ----------
  // Tệp em-be-<key>-don (hoặc em-be-<key>-<bộ>-don): "doi_tuong": "em-be", khung 48×48, nét ×2, cùng điểm chân với thân; "dong_tac" chỉ
  // gồm các hàng atk_sword, atk_bow, atk_spear, atk_hammer, cast (mỗi hàng 6 khung, thiếu hàng nào thì hàng đó dùng "atk" như cũ).
  // Khi cả hai ảnh đã nạp xong, game dán các hàng của tệp đòn xuống DƯỚI tấm thân (canh theo điểm chân) thành một tấm, rồi thêm hàng vào
  // sp.dt: mọi phần đo tự động (đồ bám thân khopEmBe, dấu ngực, nhuộm) chạy trên hàng mới như hàng cũ. Thân theo bộ chỉ nhận tệp đòn
  // của đúng bộ đó (em-be-<key>-<bộ>-don); không có thì thân bộ đánh bằng hàng "atk" như cũ, không mượn đòn của thân gốc.
  function themDon(tep) {
    const m = /^(em-be(?:-(?:smith|hunter|healer|wrestler)(?:-(?:rung|bien|lau))?)?)-don$/.exec(tep.ma);
    if (!m) throw new Error('mã tệp đòn phải là em-be-<nhân vật>-don hoặc em-be-<nhân vật>-<bộ>-don');
    if (typeof tep.tam !== 'string' || tep.tam.indexOf('data:image/png;base64,') !== 0) throw new Error('thiếu tấm sprite');
    const fw = tep.khung_rong | 0, fh = tep.khung_cao | 0, goc = tep.goc || [0, 0];
    if (fw < 1 || fh < 1 || fw > 1024 || fh > 1024) throw new Error('cỡ khung sai');
    const dt = {};
    for (const k of HANG_DON) {
      const a = tep.dong_tac && tep.dong_tac[k];
      if (a) dt[k] = { hang: a.hang | 0, so: clamp(a.so | 0, 1, 16), giay: +a.giay > 0 ? +a.giay : 0.4, lap: false, mo: null };
    }
    if (!Object.keys(dt).length) throw new Error('tệp đòn không có hàng nào (atk_sword, atk_bow, atk_spear, atk_hammer, cast)');
    const goc0 = m[1], d = { ma: tep.ma, goc: goc0, fw, fh, ax: +goc[0] || 0, ay: +goc[1] || 0, net: docNet(tep.net), dt, img: null };
    if (SC.don[goc0]) boDon(goc0);
    SC.don[goc0] = d;
    if (typeof Image !== 'undefined') {
      const img = new Image();
      img.onload = () => { if (SC.don[goc0] !== d) return; d.img = img; ghepDon(goc0); };
      img.onerror = () => { SC.loi.push(d.ma + ': ảnh hỏng'); };
      SC.napAnh(img, tep.tam);
    }
    return d;
  }
  function xoaDoDem(sp) { delete sp.mn; sp.khop = {}; sp.mau = {}; sp.than = {}; sp.giu = {}; sp.ngucC = {}; sp.tayC = {}; }
  function ghepDon(goc) {
    const sp = SC.ds[goc], d = SC.don[goc];
    if (!sp || !sp.ready || sp.doi !== 'em-be' || !d || !d.img || sp.donMa === d.ma || typeof document === 'undefined') return;
    try {
      const base = sp.img0 || sp.img, N = sp.net || 1, cw = sp.fw * N, ch = sp.fh * N, dn = d.net || 1;
      const r0 = Math.max(1, Math.round(base.height / ch));
      let nr = 0, so = 0; for (const k in d.dt) { nr = Math.max(nr, d.dt[k].hang + 1); so = Math.max(so, d.dt[k].so); }
      const cv = document.createElement('canvas'); cv.width = Math.max(base.width, so * cw); cv.height = (r0 + nr) * ch;
      const x = cv.getContext('2d'); x.imageSmoothingEnabled = false;
      x.drawImage(base, 0, 0);
      const ox = Math.round((sp.ax - d.ax) * N), oy = Math.round((sp.ay - d.ay) * N); // canh điểm chân của tệp đòn vào điểm chân của thân
      for (const k in d.dt) {
        const a = d.dt[k];
        for (let i = 0; i < a.so; i++) {
          x.save(); x.beginPath(); x.rect(i * cw, (r0 + a.hang) * ch, cw, ch); x.clip();
          x.drawImage(d.img, i * d.fw * dn, a.hang * d.fh * dn, d.fw * dn, d.fh * dn, i * cw + ox, (r0 + a.hang) * ch + oy, d.fw * N, d.fh * N);
          x.restore();
        }
      }
      for (const k of HANG_DON) if (sp.donHang && sp.donHang[k]) delete sp.dt[k];
      sp.donHang = {};
      for (const k in d.dt) { sp.dt[k] = Object.assign({}, d.dt[k], { hang: r0 + d.dt[k].hang }); sp.donHang[k] = 1; }
      sp.img0 = base; sp.img = cv; sp.donMa = d.ma;
      xoaDoDem(sp);
    } catch (e) { SC.loi.push(d.ma + ': không ghép được (' + e.message + ')'); }
  }
  function boDon(goc) {
    const d = SC.don[goc]; delete SC.don[goc];
    const sp = SC.ds[goc];
    if (!d || !sp || sp.donMa !== d.ma) return;
    if (sp.img0) sp.img = sp.img0;
    for (const k in sp.donHang || {}) delete sp.dt[k];
    sp.img0 = null; sp.donMa = null; sp.donHang = null;
    xoaDoDem(sp);
  }
  SC.ghepDon = ghepDon;
  // Khung của một hàng đòn: chọn trên nền 6 khung (như prompt) rồi đổi theo số khung thật của hàng.
  //  - Kiếm (6 khung = 3 nhát × 2: lấy đà, chém): nhát 1 chém ngang = khung 0 → 1, nhát 2 chém ngược = 2 → 3, nhát 3 bổ xuống = 4 → 5;
  //    khung lấy đà tới u = 0,4 (đòn chạm ở 0,45), sau đó khung chém giữ tới hết đòn.
  //  - Cung, giáo, búa, chưởng: mốc tiến độ của từng khung (MOC_DON), khung chạm (buông tên, đâm, nện) rơi đúng lúc đòn chạm 0,45.
  //  - Giữ nút lấy đà: cung kéo dây theo độ căng rồi dừng ở khung kéo căng (2); giáo, búa: khung lấy đà (0 rồi 1 khi đà đủ 40%); kiếm: khung giơ cao (4).
  const MOC_DON = { atk_bow: [0, 0.15, 0.3, 0.45, 0.62, 0.8], atk_spear: [0, 0.22, 0.45, 0.55, 0.7, 0.85], atk_hammer: [0, 0.2, 0.38, 0.45, 0.6, 0.8], cast: [0, 0.12, 0.25, 0.4, 0.6, 0.8] };
  function khungDon(a, ten, u, combo) {
    let i6 = 0;
    if (ten === 'atk_sword') i6 = 2 * (((combo | 0) % 3 + 3) % 3) + (u >= 0.4 ? 1 : 0);
    else { const m = MOC_DON[ten]; while (i6 < 5 && u >= m[i6 + 1]) i6++; }
    return doi6(a, i6);
  }
  const doi6 = (a, i6) => (a.so === 6 ? i6 : Math.min(a.so - 1, Math.round((i6 * (a.so - 1)) / 5)));
  SC.khungDon = khungDon;
  const giuDon = (ten, charge) => (ten === 'atk_bow' ? Math.min(2, Math.floor(clamp(charge || 0, 0, 1) * 3)) : ten === 'atk_sword' ? 4 : charge >= 0.4 ? 1 : 0);
  SC.chonEmBe = function (sp, o) {
    const p = o.p, t = (o.t != null ? o.t : G.time) || 0, dt = sp.dt;
    const mot = (ten, u) => { const k = dt[ten] ? ten : 'idle'; return { ten: k, i: dt[ten] ? khungMot(dt[k], u) : khungLap(dt.idle, t), u }; };
    const lap = (ten, tt) => { const k = dt[ten] ? ten : 'idle'; return { ten: k, i: khungLap(dt[k], tt), u: 0 }; };
    // hàng đòn theo vũ khí đang cầm (Phiên 3); null: không có hàng hoặc đang tắt cờ -> như cũ
    const don = (ten) => (G.DON_VK && dt[ten] ? ten : null), wt = o.weapon && o.weapon.type, hv = wt ? don('atk_' + wt) : null;
    const theoDon = (ten, u, combo) => ({ ten, i: khungDon(dt[ten], ten, clamp(u, 0, 1), combo), u });
    if (p && p.dead) { const u = (p.deadT || 0) / ((dt.die && dt.die.giay) || 0.6); return mot('die', u); }
    if (o.dodge >= 0) return dt.ne ? mot('ne', o.dodge) : lap('move', t);
    if (p && p.dashT > 0) return lap('move', t * 2);
    if (p && p.specT > 0) return don('cast') ? theoDon('cast', 1 - p.specT / 0.35) : mot('atk', 1 - p.specT / 0.35);
    if (p && p.castT > 0) return don('cast') ? theoDon('cast', 1 - p.castT / 0.4) : mot('atk', 1 - p.castT / 0.4);
    if (p && p.mv && p.mv.holding && !(o.atk >= 0)) return hv ? { ten: hv, i: doi6(dt[hv], giuDon(hv, p.mv.charge)), u: 0.99 } : mot('tele', 0.99);
    if (o.atk >= 0) return hv ? theoDon(hv, o.atk, p ? p.comboI : Math.floor(t / 1.6)) : mot('atk', o.atk);
    if ((p && p.hurtT > 0) || (!p && o.flash)) return mot('hit', p ? 1 - p.hurtT / 0.2 : 0.3);
    if (o.move) return lap('move', t);
    return lap('idle', t);
  };
  function emBeTint(o) {
    const p = o.p, st = p && p.st;
    if (o.flash || (p && p.hurtT > 0)) return ['#ffffff', 0.6];
    if (st && st.ice > 0) return ['#9fd8ff', 0.45];
    if (st && st.poison > 0) return ['#7fd957', 0.4];
    return null;
  }
  SC.emBeTint = emBeTint;
  // Hình một màu của một lớp đồ (ánh viền bậc), nhớ trên chính lớp đó.
  function bongMau(l, col) {
    l.mau = l.mau || {};
    let cv = l.mau[col];
    if (!cv) {
      cv = document.createElement('canvas'); cv.width = l.cv.width; cv.height = l.cv.height;
      const x = cv.getContext('2d'); x.drawImage(l.cv, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, cv.width, cv.height);
      l.mau[col] = cv;
    }
    return cv;
  }
  // ---------- ĐỒ BÁM THÂN AI ----------
  // Đo xem thân AI ở khung (ten, i) dời / xoay bao nhiêu so với khung đứng thở đầu tiên (khung dùng để đặt neo), để đồ khoác lên
  // đi theo đúng thân AI (không theo khung xương code). Đo trên hình bóng (điểm ảnh có màu) ở cỡ điểm ảnh game, một lần mỗi khung.
  //  - Động tác đứng (đứng thở, chạy, lấy đà, đánh, trúng đòn): dò chỗ khớp nhất của vùng đầu và vùng thân (dời tối đa 8 điểm ảnh)
  //    -> { dau: [dx, dy], than: [dx, dy] }.
  //  - Lộn (ne) và chết (die): thân xoay cả người -> dò góc xoay (mỗi 15 độ) và chỗ đặt khớp nhất -> { rot, x, y }: đồ ghép lên thân
  //    rồi xoay, dời cả khối như thân. Lộn ưu tiên góc lăn tới đều (360 độ chia đều các khung).
  function matNa(sp) { // hình bóng từng khung theo điểm ảnh game: sp.mn[hang][i] = Uint8Array(fw*fh)
    if (sp.mn) return sp.mn;
    const N = sp.net || 1, W = sp.img.width, H = sp.img.height, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const x = cv.getContext('2d', { willReadFrequently: true }); x.drawImage(sp.img, 0, 0);
    const d = x.getImageData(0, 0, W, H).data, fw = sp.fw, fh = sp.fh, h = Math.floor(N / 2);
    sp.mn = (ten, i) => {
      const a = sp.dt[ten] || sp.dt.idle, k = a.hang + ':' + i;
      sp.mn.c = sp.mn.c || {};
      let m = sp.mn.c[k]; if (m) return m;
      m = new Uint8Array(fw * fh);
      for (let y = 0; y < fh; y++) for (let q = 0; q < fw; q++) {
        const X = (i * fw + q) * N + h, Y = (a.hang * fh + y) * N + h;
        if (X < W && Y < H && d[(Y * W + X) * 4 + 3] > 127) m[y * fw + q] = 1;
      }
      return (sp.mn.c[k] = m);
    };
    return sp.mn;
  }
  function tamMat(m, fw, fh) { let n = 0, sx = 0, sy = 0, y0 = -1; for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) if (m[y * fw + x]) { n++; sx += x; sy += y; if (y0 < 0) y0 = y; } return n ? { n, x: sx / n, y: sy / n, y0 } : null; }
  // Dò dời (dx, dy) để vùng hàng [r0, r1) của khung gốc A khớp nhất với khung B (đếm điểm giống nhau, kể cả chỗ trống).
  function doDoi(A, B, fw, fh, r0, r1) {
    let best = -1, bx = 0, by = 0;
    r0 = Math.max(0, Math.floor(r0)); r1 = Math.min(fh, Math.ceil(r1));
    for (let dy = -8; dy <= 8; dy++) for (let dx = -8; dx <= 8; dx++) {
      let s = 0;
      for (let y = r0; y < r1; y++) {
        const yy = y + dy, inY = yy >= 0 && yy < fh;
        for (let x = 0; x < fw; x++) { const xx = x + dx, b = inY && xx >= 0 && xx < fw ? B[yy * fw + xx] : 0; if (A[y * fw + x] === b) s++; }
      }
      s -= (Math.abs(dx) + Math.abs(dy)) * 0.01; // hoà thì chọn dời ít
      if (s > best) { best = s; bx = dx; by = dy; }
    }
    return [bx, by];
  }
  SC.khopEmBe = function (sp, ten, i) {
    if (!sp || !sp.img || !sp.dt[ten]) return null;
    sp.khop = sp.khop || {};
    const k = ten + ':' + i;
    if (k in sp.khop) return sp.khop[k];
    let r = null;
    try {
      const mn = matNa(sp), fw = sp.fw, fh = sp.fh, A = mn('idle', 0), B = mn(ten, i), a = tamMat(A, fw, fh), b = tamMat(B, fw, fh), lat = sp.lat ? -1 : 1;
      if (a && b) {
        if (ten === 'ne' || ten === 'die') {
          const pts = []; for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) if (A[y * fw + x]) pts.push(x - a.x, y - a.y);
          const n = sp.dt[ten].so, goi = ten === 'ne' ? (360 * i) / n : 0;
          let best = -1e9, bt = 0, bdx = 0, bdy = 0;
          for (let t = ten === 'ne' ? 0 : -120; t <= (ten === 'ne' ? 345 : 120); t += 15) {
            const c = Math.cos((t * Math.PI) / 180), s = Math.sin((t * Math.PI) / 180), q = new Int16Array(pts.length);
            for (let j = 0; j < pts.length; j += 2) { q[j] = Math.round(pts[j] * c - pts[j + 1] * s + b.x); q[j + 1] = Math.round(pts[j] * s + pts[j + 1] * c + b.y); }
            for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
              let hit = 0;
              for (let j = 0; j < q.length; j += 2) { const X = q[j] + dx, Y = q[j + 1] + dy; if (X >= 0 && Y >= 0 && X < fw && Y < fh && B[Y * fw + X]) hit++; }
              const lech = Math.abs((((t - goi) % 360) + 540) % 360 - 180);
              const sc = hit / (a.n + b.n - hit) - (ten === 'ne' ? 0.0015 * lech : 0.0004 * Math.abs(t)) - (Math.abs(dx) + Math.abs(dy)) * 0.002;
              if (sc > best) { best = sc; bt = t; bdx = dx; bdy = dy; }
            }
          }
          // thân gốc: điểm p (toạ độ chân) -> R(p - c0) + c1  =>  đồ dựng ở tư thế đứng, xoay rot quanh chân rồi dời (x, y) = c1 - R c0
          const c0 = [a.x + 0.5 - sp.ax, a.y + 0.5 - sp.ay], c1 = [b.x + bdx + 0.5 - sp.ax, b.y + bdy + 0.5 - sp.ay], c = Math.cos((bt * Math.PI) / 180), s = Math.sin((bt * Math.PI) / 180);
          const X = c1[0] - (c0[0] * c - c0[1] * s), Y = c1[1] - (c0[0] * s + c0[1] * c);
          r = { rot: bt * lat, x: Math.round(X * lat), y: Math.round(Y) };
        } else if (!(ten === 'idle' && i === 0)) {
          const h = sp.ay - a.y0 + 1;
          const dau = doDoi(A, B, fw, fh, a.y0 - 2, a.y0 + 0.44 * h), than = doDoi(A, B, fw, fh, a.y0 + 0.5 * h, a.y0 + 0.85 * h);
          r = { dau: [dau[0] * lat, dau[1]], than: [than[0] * lat, than[1]] };
        }
      }
    } catch (e) { r = null; }
    return (sp.khop[k] = r);
  };
  // ---------- ÁO TRÊN THÂN AI: viền màu bậc + dấu ngực ----------
  // Áo (ô robes) không khoác rời lên thân AI (js/hero_tinhlinh.js lopDo bỏ áo). Bậc áo đang mặc hiện bằng:
  //  - viền màu bậc Lam / Tím / Vàng quanh thân, dày 1 điểm ảnh game, vẽ SAU thân nên không che mặt (áo bậc Thường: không viền);
  //  - một dấu nhỏ 3 × 3 điểm ảnh game trên ngực: bốn cánh màu bậc, giữa màu hệ của áo (Lửa, Độc, Băng; áo không hệ: trắng).
  // Dấu bám điểm neo 'nguc' (hoặc 'co') của tệp ghep-<nhân vật> nếu có; chưa có thì tự đo trên hình (dưới tâm đầu, khoảng 62% chiều cao)
  // rồi đi theo thân từng khung (SC.khopEmBe). Lúc lăn / ngã cuộn tròn (thân xoay quá 60 độ) thì ẩn dấu.
  const MAU_BAC = ['#d6d2c8', '#6fb2ff', '#c88cff', '#ffd24a'], MAU_HE = { fire: '#ff7a2a', poison: '#6fcf3a', ice: '#a8e4ff' };
  const mauBac = (r) => (G.RARITY && G.RARITY[r] && G.RARITY[r].col) || MAU_BAC[r] || MAU_BAC[0];
  const heAoNho = {};
  function heAo(look) {
    if (look in heAoNho) return heAoNho[look];
    let el = null; const I = G.outfit && G.outfit.ITEMS;
    if (!I) return null; // chưa nạp danh mục: hỏi lại lần sau
    for (const k in I) if (I[k].slot === 'robe' && I[k].look === look) { el = I[k].el || null; break; }
    return (heAoNho[look] = el);
  }
  // Áo đang mặc của khung fr (thân AI): { r: bậc 0..3, vien: màu viền hoặc null, he: hệ hoặc null }. null: không mặc áo.
  SC.aoAI = function (of) {
    if (!of || !of.robe) return null;
    const r = clamp((of.rar && of.rar.robe) | 0, 0, 3);
    return { r, mau: mauBac(r), vien: r >= 1 ? mauBac(r) : null, he: heAo(of.robe) };
  };
  // Điểm ngực của khung (ten, i), toạ độ tính từ chân (x về trước mặt). null: đang cuộn tròn / không đo được.
  SC.diemNguc = function (sp, key, ten, i, kh) {
    const quay = !!(kh && kh.rot != null);
    if (quay) { const rq = (((kh.rot | 0) % 360) + 360) % 360; if (rq >= 60 && rq <= 300) return null; }
    const da = SC.ghep[key] ? SC.diemAI(key, ten, i, kh) : null;
    if (da && (da.diem.nguc || da.diem.co)) { const p = da.diem.nguc || [da.diem.co[0] + 1, da.diem.co[1] + 3]; return [Math.round(p[0]), Math.round(p[1])]; }
    sp.ngucC = sp.ngucC || {};
    const k = ten + ':' + i;
    if (k in sp.ngucC) return sp.ngucC[k];
    let r = null;
    try { r = doNguc(sp, matNa(sp)(ten, i)); } catch (e) { r = null; }
    return (sp.ngucC[k] = r);
  };
  // Tự đo điểm ngực trên hình bóng MỘT khung (không cần tệp ghép): đầu là khối tròn dày nhất ở nửa trên (tâm vòng tròn nội tiếp lớn
  // nhất, bán kính R); thân nằm về phía trọng tâm phần còn lại (khối dày nặng hơn tay chân mảnh). Ngực = tâm đầu đi về phía thân một
  // đoạn R + 2,5..4 (ngay dưới cằm; em bé chibi đầu to, thân ngắn): luôn ở dưới cằm, không bao giờ nằm trên mặt, kể cả khi thân chúi tới lúc đánh.
  function doNguc(sp, M) {
    const fw = sp.fw, fh = sp.fh, D = new Float32Array(fw * fh), a = tamMat(M, fw, fh);
    if (!a || a.n < 30) return null;
    for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) { // khoảng cách tới chỗ trống gần nhất (hai lượt quét, bước 1 và 1,4)
      const j = y * fw + x; if (!M[j]) continue;
      let d = 99; if (x === 0 || y === 0) d = 1; else d = Math.min(D[j - 1] + 1, D[j - fw] + 1, D[j - fw - 1] + 1.4, x < fw - 1 ? D[j - fw + 1] + 1.4 : 1);
      D[j] = d;
    }
    let mx = 0, y1 = 0;
    for (let y = fh - 1; y >= 0; y--) for (let x = fw - 1; x >= 0; x--) {
      const j = y * fw + x; if (!M[j]) continue;
      if (y > y1) y1 = y;
      const d = x === fw - 1 || y === fh - 1 ? 1 : Math.min(D[j], D[j + 1] + 1, D[j + fw] + 1, D[j + fw + 1] + 1.4, x > 0 ? D[j + fw - 1] + 1.4 : 1);
      D[j] = d;
    }
    const yc = a.y0 + 0.6 * (y1 - a.y0 + 1);
    for (let y = a.y0; y < yc; y++) for (let x = 0; x < fw; x++) if (D[y * fw + x] > mx) mx = D[y * fw + x];
    if (mx < 2.5) return null;
    let n = 0, hx = 0, hy = 0;
    for (let y = a.y0; y < yc; y++) for (let x = 0; x < fw; x++) if (D[y * fw + x] >= mx - 0.5) { n++; hx += x + 0.5; hy += y + 0.5; }
    hx /= n; hy /= n;
    const R = mx; let w = 0, bx = 0, by = 0;
    for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) {
      const d = D[y * fw + x]; if (!d || Math.hypot(x + 0.5 - hx, y + 0.5 - hy) <= R + 1.5) continue;
      const q = d * d; w += q; bx += q * (x + 0.5); by += q * (y + 0.5);
    }
    if (!w) return null;
    let ux = bx / w - hx, uy = by / w - hy; const L = Math.hypot(ux, uy);
    if (L < 1) return null;
    ux /= L; uy /= L;
    for (let t = R + clamp(0.45 * R, 2.5, 4); t >= R + 1.5; t -= 0.5) { // lùi dần về phía đầu nếu rơi ra ngoài hình, nhưng không lên tới mặt
      const X = Math.floor(hx + ux * t), Y = Math.floor(hy + uy * t);
      if (X >= 1 && Y >= 1 && X < fw - 1 && Y < fh - 1 && M[Y * fw + X]) return [sp.lat ? Math.floor(sp.ax - X - 0.5) : Math.floor(X + 0.5 - sp.ax), Math.floor(Y + 0.5 - sp.ay)];
    }
    return null;
  }
  // ---------- BÀN TAY TRƯỚC TỰ ĐO (Phiên 3, hàng đòn theo vũ khí) ----------
  // Ảnh đòn không có vũ khí (game gắn), nên bàn tay nắm cán là đầu mút xa nhất của cánh tay. Đo trên hình bóng một khung:
  // đầu = khối tròn dày nhất nửa trên (như doNguc), thân = trọng tâm phần còn lại, vai = mép đầu về phía thân. Bàn tay = điểm mảnh
  // (không phải khối thân dày) xa vai nhất, ưu tiên phía trước mặt; bỏ vùng đầu và vùng chân (1/4 dưới; 1/4..2/5 dưới chỉ nhận khi
  // vươn hẳn ra trước). Lùi vào trong nắm tay 1 điểm ảnh. Trả về [x, y] tính từ chân (x về trước mặt), null: không đo được.
  function khoangCach(M, fw, fh) {
    const D = new Float32Array(fw * fh);
    for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) {
      const j = y * fw + x; if (!M[j]) continue;
      D[j] = x === 0 || y === 0 ? 1 : Math.min(D[j - 1] + 1, D[j - fw] + 1, D[j - fw - 1] + 1.4, x < fw - 1 ? D[j - fw + 1] + 1.4 : 1);
    }
    for (let y = fh - 1; y >= 0; y--) for (let x = fw - 1; x >= 0; x--) {
      const j = y * fw + x; if (!M[j]) continue;
      D[j] = x === fw - 1 || y === fh - 1 ? 1 : Math.min(D[j], D[j + 1] + 1, D[j + fw] + 1, D[j + fw + 1] + 1.4, x > 0 ? D[j + fw - 1] + 1.4 : 1);
    }
    return D;
  }
  function doTay(sp, M) {
    const fw = sp.fw, fh = sp.fh, a = tamMat(M, fw, fh), dir = sp.lat ? -1 : 1;
    if (!a || a.n < 30) return null;
    const D = khoangCach(M, fw, fh);
    let y1 = 0; for (let j = 0; j < M.length; j++) if (M[j]) y1 = Math.max(y1, (j / fw) | 0);
    const H = y1 - a.y0 + 1, yc = a.y0 + 0.6 * H;
    let R = 0; for (let y = a.y0; y < yc; y++) for (let x = 0; x < fw; x++) if (D[y * fw + x] > R) R = D[y * fw + x];
    if (R < 2.5) return null;
    let n = 0, hx = 0, hy = 0;
    for (let y = a.y0; y < yc; y++) for (let x = 0; x < fw; x++) if (D[y * fw + x] >= R - 0.5) { n++; hx += x + 0.5; hy += y + 0.5; }
    hx /= n; hy /= n;
    let w = 0, bx = 0, by = 0;
    for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) {
      const d = D[y * fw + x]; if (!d || Math.hypot(x + 0.5 - hx, y + 0.5 - hy) <= R + 1.5) continue;
      const q = d * d; w += q; bx += q * (x + 0.5); by += q * (y + 0.5);
    }
    if (!w) return null;
    bx /= w; by /= w;
    const L0 = Math.hypot(bx - hx, by - hy) || 1, sx = hx + ((bx - hx) / L0) * (R + 1), sy = hy + ((by - hy) / L0) * (R + 1);
    // Bỏ đĩa đầu rồi chỉ giữ phần còn LIỀN với thân (loang từ chỗ dày nhất của thân): tóc, sừng, tai mọc trên đầu bị tách rời nên
    // không bị nhận nhầm là bàn tay; cánh tay nối với thân qua vai nên vẫn còn.
    const RD = R + 2, lien = new Uint8Array(fw * fh), hang = [];
    let j0 = -1, dmax = 0;
    for (let j = 0; j < M.length; j++) if (M[j] && Math.hypot((j % fw) + 0.5 - hx, ((j / fw) | 0) + 0.5 - hy) > RD && D[j] > dmax) { dmax = D[j]; j0 = j; }
    if (j0 < 0) return null;
    lien[j0] = 1; hang.push(j0);
    for (let k = 0; k < hang.length; k++) {
      const j = hang[k], x = j % fw;
      for (const q of [x > 0 ? j - 1 : -1, x < fw - 1 ? j + 1 : -1, j - fw, j + fw]) {
        if (q < 0 || q >= M.length || lien[q] || !M[q] || Math.hypot((q % fw) + 0.5 - hx, ((q / fw) | 0) + 0.5 - hy) <= RD) continue;
        lien[q] = 1; hang.push(q);
      }
    }
    let best = -1e9, tx = -1, ty = -1;
    for (let y = a.y0; y <= y1; y++) for (let x = 0; x < fw; x++) {
      const j = y * fw + x; if (!M[j]) continue;
      const X = x + 0.5, Y = y + 0.5, truoc = (X - bx) * dir;
      // phần không liền thân (do cánh tay đi ngang qua đĩa đầu, ví dụ đấm ngang cằm) chỉ nhận khi ở phía trước, thấp hơn tâm đầu, ngoài đầu
      if (!lien[j] && !(truoc > 0 && Y >= hy + 1 && Math.hypot(X - hx, Y - hy) > R + 3)) continue;
      if (Y > y1 + 1 - 0.25 * H) continue; // bàn chân, ống chân
      if (Y > y1 + 1 - 0.4 * H && truoc < 4) continue; // đùi, hông (trừ khi tay vươn hẳn ra trước, ví dụ búa nện sát đất)
      const sc = Math.hypot(X - sx, Y - sy) + 0.35 * truoc - 0.8 * Math.max(0, D[j] - 1.5);
      if (sc > best) { best = sc; tx = X; ty = Y; }
    }
    if (tx < 0) return null;
    const L1 = Math.hypot(sx - tx, sy - ty) || 1, ux = (sx - tx) / L1, uy = (sy - ty) / L1; // lùi vào giữa nắm tay
    let px = tx, py = ty;
    for (let k = 1; k <= 2; k++) { const X = Math.floor(tx + ux * k), Y = Math.floor(ty + uy * k); if (X >= 0 && Y >= 0 && X < fw && Y < fh && M[Y * fw + X]) { px = X + 0.5; py = Y + 0.5; } else break; }
    const r = (v) => Math.round(v * 2) / 2;
    return [r(sp.lat ? sp.ax - px : px - sp.ax), r(py - sp.ay)];
  }
  SC.tayAI = function (sp, ten, i) {
    if (!sp || !sp.img || !sp.dt[ten]) return null;
    sp.tayC = sp.tayC || {};
    const k = ten + ':' + i;
    if (k in sp.tayC) return sp.tayC[k];
    let r = null;
    try { r = doTay(sp, matNa(sp)(ten, i)); } catch (e) { r = null; }
    return (sp.tayC[k] = r);
  };
  // Điểm neo của khung (ten, i) cho thân AI: diemAI (tệp ghép) và, ở hàng đòn theo vũ khí, bàn tay trước tự đo (trừ khi tệp ghép ghi
  // đúng khung đó). null: không có gì.
  SC.diemKhung = function (sp, key, ten, i, kh) {
    const da = SC.ghep[key] ? SC.diemAI(key, ten, i, kh) : null;
    if (!LA_DON[ten]) return da;
    const tay = SC.tayAI(sp, ten, i);
    if (!tay || (da && da.nguon.tay_truoc === 'tep')) return da;
    const kq = da ? { diem: Object.assign({}, da.diem), nguon: Object.assign({}, da.nguon) } : { diem: {}, nguon: {} };
    kq.diem.tay_truoc = tay; kq.nguon.tay_truoc = 'do-tu-dong';
    return kq;
  };
  // Vẽ dấu ngực 3 × 3 tại p (tâm), trong hệ đã dời về chân bé.
  SC.veDauNguc = function (c, p, ao) {
    const X = p[0], Y = p[1];
    c.fillStyle = INK; c.fillRect(X - 1, Y - 1, 3, 3);
    c.fillStyle = ao.mau; c.fillRect(X, Y - 1, 1, 3); c.fillRect(X - 1, Y, 3, 1);
    c.fillStyle = ao.he ? MAU_HE[ao.he] : '#ffffff'; c.fillRect(X, Y, 1, 1);
  };
  const AN_BO = ['hat', 'back', 'hand']; // thân theo bộ đã vẽ sẵn mũ, đồ lưng, bùa (áo thì thân AI nào cũng không khoác)
  // Các ô KHÔNG khoác rời khi đang vẽ thân bộ sp: chỉ những món CÙNG BỘ với áo (fx.an_bo của O.look); mũ, đồ lưng, bùa khác bộ và
  // cánh vẫn khoác rời theo điểm neo. Đồ tự dựng không ghi an_bo (kiểu cũ: đủ bộ) thì ẩn cả ba như trước. null: không ẩn gì.
  SC.anBo = function (o, sp) {
    if (!sp || !sp.bo) return null;
    const f = fxCua(o);
    const a = f && f.bo_than === sp.bo && Array.isArray(f.an_bo) ? AN_BO.filter((k) => f.an_bo.indexOf(k) >= 0) : AN_BO;
    return a.length ? a : null;
  };
  function noiEmBe() {
    const A = G.art;
    if (!A || !A.hero || A._spriteCustom || !SC.noi) return;
    A._spriteCustom = true;
    const hero0 = A.hero;
    A.hero = function (c, o) {
      const sp = SC.cuaEmBe(o && o.key, o);
      if (!sp || !G.tinhLinh) return hero0.call(A, c, o);
      let fr = null; // cùng độ nét ghép với em bé gốc (hero0 tính y như vậy) để nhận ra đúng chỗ vẽ thân
      try { fr = G.tinhLinh.frame(o, G.tinhLinh.netCua ? G.tinhLinh.netCua(c, o) : 1); } catch (e) { fr = null; }
      if (!fr) return hero0.call(A, c, o);
      const s = SC.chonEmBe(sp, o), tint = emBeTint(o);
      let lop = null; // đồ đang mặc khoác lên thân AI: lớp sau thân và lớp trước thân, bám theo chính thân AI khung này
      const neo = SC.neoCua(sp, s.ten);
      if (sp.khoacDo && G.tinhLinh.lopDo) {
        try { const kh = SC.khopEmBe(sp, s.ten, s.i); lop = G.tinhLinh.lopDo(fr, neoGhep(fr.key, s, neo, kh, sp), kh, SC.anBo(o, sp)); } catch (e) { lop = null; }
      }
      // Áo không khoác lên thân AI: viền màu bậc áo + dấu ngực.
      let ao = null, nguc = null, daVien = false;
      try { ao = sp.khoacDo ? SC.aoAI(fr.of) : null; if (ao) nguc = SC.diemNguc(sp, fr.key, s.ten, s.i, SC.khopEmBe(sp, s.ten, s.i)); } catch (e) { ao = null; }
      const veVien = (col) => { // hình bóng một màu của thân AI + đồ đang khoác, tại gốc hiện tại
        const a = sp.dt[s.ten] || sp.dt.idle, n = sp.net || 1;
        veNhuom(c, sp, col, s.i * sp.fw * n, a.hang * sp.fh * n, sp.fw * n, sp.fh * n, -sp.ax, -sp.ay, sp.fw, sp.fh);
        if (lop) for (const l of [lop.sau, lop.truoc]) if (!l.trong) c.drawImage(bongMau(l, col), l.ox, l.oy, l.w, l.h);
      };
      // Vũ khí và nắm tay dời theo "neo.tay" cho khớp bàn tay của thân AI.
      if (neo && neo.tay && (neo.tay[0] || neo.tay[1])) o = Object.assign({}, o, { neoTay: neo.tay });
      // Em bé gốc vẫn vẽ bóng, vũ khí, hào quang trang phục; chỗ vẽ thân thì vẽ hình tự vẽ.
      const thay = function (img, x, y) {
        const than = img === fr.cv || (arguments.length === 3 && x === fr.ox && y === fr.oy && img && img.width === fr.cv.width && img.height === fr.cv.height);
        if (than) {
          if (ao && ao.vien && !daVien && !fr.dead) { // viền bậc áo (bậc Lam game gốc không vẽ viền: vẽ ở đây, ngay sau thân)
            const ga = c.globalAlpha, t = (o.t != null ? o.t : G.time) || 0;
            c.globalAlpha = ga * (0.45 + 0.3 * Math.sin(t * 4));
            for (const q of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { c.save(); c.translate(q[0], q[1]); veVien(ao.vien); c.restore(); }
            c.globalAlpha = ga;
          }
          if (lop && !lop.sau.trong) c.drawImage(lop.sau.cv, lop.sau.ox, lop.sau.oy, lop.sau.w, lop.sau.h);
          SC.veKhung(c, sp, s.ten, s.i, 1, { tint });
          if (lop && !lop.truoc.trong) c.drawImage(lop.truoc.cv, lop.truoc.ox, lop.truoc.oy, lop.truoc.w, lop.truoc.h);
          if (ao && nguc) SC.veDauNguc(c, nguc, ao);
          return;
        }
        if (fr.sil) for (const col in fr.sil) if (fr.sil[col] === img) { // ánh viền màu bậc quanh em bé
          // đang mặc áo: viền theo đúng bậc ÁO (áo bậc Thường thì không viền); không mặc áo: như cũ (bậc cao nhất của đồ đang mặc)
          if (ao && !ao.vien) return;
          daVien = true;
          c.save(); c.translate(x - fr.ox, y - fr.oy); c.globalCompositeOperation = 'source-over';
          veVien(ao ? ao.vien : col);
          c.restore();
          return;
        }
        return c.drawImage.apply(c, arguments);
      };
      if (G.BO_THAN === false) return hero0.call(A, butGia(c, thay), o);
      const b = muonBut(c, thay); // V1: bút giả dùng lại, không tạo Proxy mỗi khung
      try { return hero0.call(A, b.p, o); } finally { traBut(b); }
    };
  }

  // ---------- NGƯỜI LÀNG ----------
  // Mã tệp: nl-<mã người> (nl-lai Chú Lái Đò, nl-ren Ông Thợ Rèn, nl-xen Bà Hàng Xén, nl-may Cô Thợ May, nl-do Cụ Đồ, nl-tu Ông Từ, nl-mo Anh Mõ).
  // Hai động tác: idle (đứng thở) và noi (nói chuyện, vẫy tay: khi em bé tới gần, khi mở bảng). Thay hình trong làng, ở dải khuôn mặt và khung nói chuyện.
  SC.cuaNguoiLang = (k) => SC.get('nl-' + k);
  // Vẽ người làng tự vẽ, chân tại (x, y). o: { anim: 'idle' | 'noi', t (giây), face, s (số lần phóng) }
  SC.veNguoiLang = function (c, sp, x, y, o) {
    o = o || {};
    const ten = o.anim === 'noi' && sp.dt.noi ? 'noi' : 'idle', a = sp.dt[ten], s = o.s || 1;
    c.save(); c.translate(Math.round(x), Math.round(y)); if (s !== 1) c.scale(s, s);
    SC.veKhung(c, sp, ten, khungLap(a, Math.max(0, o.t || 0)), o.face < 0 ? -1 : 1, {});
    c.restore();
  };
  // Vùng khuôn mặt (phần đầu) của khung đứng thở đầu tiên: [x, y, rộng, cao] theo điểm ảnh THẬT của tấm sprite (gấp net lần).
  function vungMat(sp) {
    if (sp.mat) return sp.mat;
    const N = sp.net || 1, fw = sp.fw * N, fh = sp.fh * N;
    const a = sp.dt.idle, cv = document.createElement('canvas'); cv.width = fw; cv.height = fh;
    const x = cv.getContext('2d', { willReadFrequently: true }); x.drawImage(sp.img, 0, a.hang * fh, fw, fh, 0, 0, fw, fh);
    const d = x.getImageData(0, 0, fw, fh).data;
    let y0 = -1, y1 = -1; for (let y = 0; y < fh && y0 < 0; y++) for (let i = 0; i < fw; i++) if (d[(y * fw + i) * 4 + 3] > 127) { y0 = y; break; }
    for (let y = fh - 1; y >= 0 && y1 < 0; y--) for (let i = 0; i < fw; i++) if (d[(y * fw + i) * 4 + 3] > 127) { y1 = y; break; }
    if (y0 < 0) return (sp.mat = [0, a.hang * fh, fw, fh]);
    const hh = Math.max(6 * N, Math.round((y1 - y0 + 1) * 0.42)), ww = Math.round(hh * 1.15);
    let n = 0, sx = 0; for (let y = y0; y < y0 + hh; y++) for (let i = 0; i < fw; i++) if (d[(y * fw + i) * 4 + 3] > 127) { n++; sx += i; }
    const cx = n ? sx / n : sp.ax * N;
    return (sp.mat = [Math.round(cx - ww / 2), a.hang * fh + y0, ww, hh]);
  }
  SC.vungMat = vungMat;
  let lanNL = 0;
  function noiNguoiLang() {
    const VS = G.villageScene;
    if (!VS || !VS.NPCS) { if (lanNL++ < 50 && typeof setTimeout !== 'undefined') setTimeout(noiNguoiLang, 50); return; }
    if (VS._spriteCustom) return;
    VS._spriteCustom = true;
    VS.tuVe = function (c, kind, x, y, s, o) {
      const sp = SC.cuaNguoiLang(kind); if (!sp) return false;
      const look = (o && o.look) || 0;
      SC.veNguoiLang(c, sp, x, y, { anim: look ? 'noi' : 'idle', t: o && o.t != null ? o.t : G.time || 0, face: look < 0 ? -1 : 1, s: s || 1 });
      return true;
    };
    VS.tuVeMat = function (ctx, k, cx, cy, s) {
      const sp = SC.cuaNguoiLang(k); if (!sp) return false;
      const m = vungMat(sp), k2 = Math.min((23 * s) / m[2], (20 * s) / m[3]), w = m[2] * k2, h = m[3] * k2, sm = ctx.imageSmoothingEnabled;
      ctx.imageSmoothingEnabled = false; ctx.drawImage(sp.img, m[0], m[1], m[2], m[3], cx - w / 2, cy - h / 2, w, h); ctx.imageSmoothingEnabled = sm;
      return true;
    };
  }

  // ======================= ĐỒ: VŨ KHÍ, TRANG PHỤC, VẬT PHẨM =======================
  // Mã tệp:  vk-<loại>-<dòng>[-<hệ>[-<giai đoạn>]]  ví dụ vk-sword-3, vk-bow-0-fire-2   (loại: sword, bow, spear, hammer; dòng 0..9)
  //          tp-<ô>-<hình>                          ví dụ tp-hats-non_la, tp-wings-lua      (ô: hats, robes, backs, hands, masks, wings)
  //          vp-<loại>                              ví dụ vp-gold, vp-potion, vp-linhkhi-fire, vp-ore, vp-mat0, vp-shard2
  // Ảnh đồ là một hình đứng yên (đã có viền); game xoay, đặt nó theo tay, đầu, thân em bé.
  const DO_LOAI = { 'vu-khi': 1, 'trang-phuc': 1, 'vat-pham': 1 };
  const D2R = Math.PI / 180, INK = '#1b1118';
  const RAR_VIEN = [null, '#1f4fa8', '#5a2499', '#a86a08']; // viền đồ theo bậc Lam, Tím, Vàng
  SC.do = {};
  const hex2 = (r, g, b) => '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  function docDiem(src) { // ảnh -> mảng màu '#rrggbb' (null là trống)
    const w = src.width, h = src.height, cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const x = cv.getContext('2d', { willReadFrequently: true }); x.drawImage(src, 0, 0);
    const d = x.getImageData(0, 0, w, h).data, px = new Array(w * h).fill(null);
    for (let i = 0; i < w * h; i++) if (d[i * 4 + 3] > 127) px[i] = hex2(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]);
    return px;
  }
  const P2 = (a) => (Array.isArray(a) && a.length === 2 && isFinite(a[0]) && isFinite(a[1]) ? [+a[0], +a[1]] : null);
  function themDo(tep) {
    // rong, cao: cỡ theo điểm ảnh GAME; pw, ph: cỡ ảnh thật (gấp net lần); px: màu từng điểm ảnh THẬT (pw x ph).
    const doi = tep.doi_tuong, sp = { ma: tep.ma, ten: String(tep.ten || tep.ma), doi, net: docNet(tep.net), rong: 0, cao: 0, pw: 0, ph: 0, img: null, px: null, ready: false, xoay: new Map(), mau: {} };
    if (doi === 'vu-khi') {
      const v = tep.vu_khi || {};
      if (!/^(sword|bow|spear|hammer)$/.test(v.loai)) throw new Error('loại vũ khí sai');
      sp.vk = { loai: v.loai, dong: Math.max(0, Math.min(9, v.dong | 0)), he: /^(fire|poison|ice)$/.test(v.he) ? v.he : null, gd: v.gd ? Math.max(1, Math.min(3, v.gd | 0)) : null,
        bienThe: /^vk-[a-z]+-\d+-(fire|poison|ice)(-\d)?$/.test(tep.ma), cam: P2(v.cam) || [0, 0], mui: P2(v.mui) || [0, -1], day: Array.isArray(v.day) && P2(v.day[0]) && P2(v.day[1]) ? [P2(v.day[0]), P2(v.day[1])] : null };
    } else if (doi === 'trang-phuc') {
      const t = tep.trang_phuc || {};
      if (!/^(hats|robes|backs|hands|masks|wings)$/.test(t.o) || typeof t.look !== 'string') throw new Error('ô trang phục sai');
      sp.tp = { o: t.o, look: t.look, lech: P2(t.lech) || [0, 0], lop: t.lop === 'truoc' ? 'truoc' : 'sau', kieu: t.kieu === 'cam' ? 'cam' : 'bua', tayAo: t.tay_ao !== false };
      // Ghép (tuỳ chọn): điểm neo trên ảnh món đồ (cùng tên điểm thân) và cỡ đã đo khi xuất. Không có thì như cũ.
      sp.tp.diem = docBoDiem(t.diem, 400); sp.tp.coChuan = P2(t.co_chuan);
    } else {
      if (typeof tep.vat_pham !== 'string' || !/^[a-z0-9-]{2,20}$/.test(tep.vat_pham)) throw new Error('loại vật phẩm sai');
      sp.vp = tep.vat_pham;
    }
    const xong = (src) => {
      sp.img = src; sp.pw = src.width; sp.ph = src.height; sp.rong = Math.max(1, Math.round(src.width / sp.net)); sp.cao = Math.max(1, Math.round(src.height / sp.net));
      if (G.NAP_SAU_MOI) { // V3: mảng màu từng điểm ảnh chỉ đọc khi cần lần đầu (đọc điểm ảnh 150 vũ khí lúc nạp làm giật)
        let px = null; const anh = src;
        Object.defineProperty(sp, 'px', { get() { if (!px) px = docDiem(anh); return px; }, set(v) { px = v; }, configurable: true, enumerable: true });
      } else sp.px = docDiem(src);
      sp.ready = true; sp.xoay.clear(); sp.mau = {};
      if (SC.do[sp.ma] !== sp) return;
      if (sp.vk) noiVuKhi(); else if (sp.tp) noiTrangPhuc(sp); else noiVatPham();
      xoaNhoDoKhiCan(sp);
    };
    if (boDo.cu && SC.do[sp.ma]) boDo(sp.ma);
    SC.do[sp.ma] = sp;
    if (tep.anhCanvas && tep.anhCanvas.getContext) xong(tep.anhCanvas); // công cụ đưa thẳng canvas (vẽ ngay, không chờ)
    else {
      if (typeof tep.anh !== 'string' || tep.anh.indexOf('data:image/png;base64,') !== 0) throw new Error('thiếu ảnh');
      if (typeof Image !== 'undefined') { const img = new Image(); img.onload = () => xong(img); img.onerror = () => SC.loi.push(sp.ma + ': ảnh hỏng'); SC.napAnh(img, tep.anh); }
    }
    return sp;
  }
  function xoaNhoDo() {
    try { if (G.tinhLinh && G.tinhLinh.clearCache) G.tinhLinh.clearCache(); } catch (e) { /* bỏ qua */ }
    try { if (G.doRoi && G.doRoi.xoaNho) G.doRoi.xoaNho(); } catch (e) { /* bỏ qua */ }
  }
  // V3: trong lúc nạp tệp ảnh tải sau, một hình mới về chỉ xoá hình đã nhớ (em bé + đồ, vật rơi) khi nó đang được dùng: thân em bé
  // của nhân vật đang chơi, vũ khí cùng loại món đang mang, trang phục, vật phẩm. Gom lại, xoá nhiều nhất một lần mỗi giây.
  // Tải xong thì chayNapSau xoá thêm một lần cuối như cũ. Ngoài lúc nạp tệp tải sau (hoặc tắt cờ): xoá ngay như cũ.
  let henXoa = 0;
  function dangDung(sp) {
    try {
      const sv = G.save, ma = sp.ma || '';
      if (sp.tp || sp.vp) return true;
      if (sp.vk) { const t = sp.vk.loai; return !!(sv && sv.carry && sv.carry.some((id) => { const w = G.weaponById ? G.weaponById(id) : null; return w && w.type === t; })); }
      if (sp.doi === 'em-be' || /^em-be/.test(ma)) return !sv || ma === 'em-be' || ma.indexOf('em-be-' + sv.hero) === 0;
      return false;
    } catch (e) { return true; }
  }
  function xoaNhoDoKhiCan(sp) {
    if (!G.NAP_SAU_MOI || !napSauDangChay) { xoaNhoDo(); return; }
    if (!dangDung(sp) || henXoa) return;
    henXoa = setTimeout(() => { henXoa = 0; xoaNhoDo(); }, 1000);
  }
  function boDo(ma) {
    const sp = SC.do[ma]; if (!sp) return;
    delete SC.do[ma];
    if (sp.tp) { const L = G.heroLooks, o = L && L[sp.tp.o]; if (o && sp.tp.cu !== undefined) { if (sp.tp.cu) o[sp.tp.look] = sp.tp.cu; else delete o[sp.tp.look]; } }
    xoaNhoDo();
  }
  boDo.cu = true;
  const doSan = (ma) => { const s = SC.do[ma]; return s && s.ready ? s : null; };

  // ---------- VŨ KHÍ ----------
  // ----- CỠ VŨ KHÍ ẢNH AI KHI VẼ (chỉ đổi HÌNH, không đổi tầm đánh, vùng trúng, sát thương) -----
  // Ảnh AI vẽ to (kiếm ~46 điểm ảnh, gấp rưỡi thân em bé 29). G.CO_VK: hệ số co theo loại, co quanh điểm cầm (cam); mũi, dây cung,
  // hạt hệ co theo. "lang": nhân thêm cho vũ khí bay theo em bé ở làng. "nam": chỗ bàn tay nắm trên ảnh AI, tính từ điểm cầm dọc
  // thân về phía mũi (điểm ảnh game của ảnh gốc), để chuôi nằm đúng trong tay (js/hero_tinhlinh.js).
  // Tắt: G.CO_VK = null, hoặc mở game với ?covk=0  -> vẽ y hệt bản cũ.
  if (G.CO_VK === undefined) {
    let tat = false;
    try { tat = typeof location !== 'undefined' && /[?&]covk=0(&|$)/.test(location.search || ''); } catch (e) { tat = false; }
    G.CO_VK = tat ? null : { sword: 0.54, bow: 0.52, spear: 0.59, hammer: 0.48, lang: 0.9, nam: 1.5 };
  }
  // Hệ số co của một món: opts.lang (vũ khí bay ở làng) nhân thêm hệ số làng. Tắt cờ: 1.
  SC.coVk = function (loai, opts) {
    const C = G.CO_VK; if (!C || typeof C !== 'object') return 1;
    let k = +C[loai]; if (!(k > 0.05 && k <= 4)) k = 1;
    if (opts && opts.lang) { const l = +C.lang; if (l > 0.05 && l <= 4) k *= l; }
    return k;
  };
  // Chỗ tay nắm trên ảnh AI (đã co): khoảng cách từ điểm cầm dọc thân. Tắt cờ: null (giữ cách cũ).
  SC.namVk = function (loai, opts) {
    const C = G.CO_VK; if (!C || typeof C !== 'object' || loai === 'bow') return null;
    const n = isFinite(+C.nam) ? +C.nam : 0;
    return n * SC.coVk(loai, opts);
  };
  SC.timVuKhi = function (o) {
    if (!o) return null;
    const b = 'vk-' + o.type + '-' + (o.family | 0), st = o.stage | 0;
    // Mầm (giai đoạn 1): vẫn hình thường + hạt hệ; Thành hình (2) trở lên mới đổi sang hình vẽ theo hệ → 3 mức khác nhau rõ.
    return (o.branch && st && doSan(b + '-' + o.branch + '-' + st)) || (o.branch && st >= 2 && doSan(b + '-' + o.branch)) || doSan(b);
  };
  // ----- BIẾN ĐỔI THEO HỆ (Lửa, Độc, Băng) cho vũ khí ảnh AI -----
  // Bản vẽ code đổi hình theo nhánh và giai đoạn (js/weapon_art.js). Ảnh AI chỉ có một hình, nên game tự biến đổi:
  //  - Giai đoạn 1 (Mầm): giữ màu gốc, thêm hạt hiệu ứng nhẹ dọc thân (Lửa: tàn lửa bay lên; Độc: giọt nọc rơi, bọt; Băng: lấp lánh, hơi sương).
  //  - Giai đoạn 2 (Thành hình): nhuộm lưỡi/thân theo bảng màu hệ (giữ sáng tối ảnh gốc, pha 45%, cán gần tay cầm không nhuộm), viền ngoài đổi màu hệ.
  //  - Giai đoạn 3 (Thức tỉnh): nhuộm 70%, quầng sáng hệ, hạt dày; Lửa có ngọn lửa liếm dọc lưỡi.
  // Có ảnh biến thể riêng (vk-<loại>-<dòng>-<nhánh>[-<gđ>]) thì không nhuộm, chỉ thêm hạt và quầng sáng.
  const ELP_DU = { // bản dự phòng khi chưa có G.weaponArt.ELP (cùng màu weapon_art.js)
    fire: { B: ['#8a1c12', '#e8492a', '#ffb347'], ol: '#4a1010', glow: '#ffc64c', hot: '#fff0b0', fx: ['#ffb347', '#ffd27a', '#ff8a3a'] },
    poison: { B: ['#1d5a2a', '#49a83c', '#b5ea6a'], B2: ['#3d1d55', '#6b3a8f', '#a56fd0'], ol: '#12331a', glow: '#b5ea6a', hot: '#e6f58a', fx: ['#b5ea6a', '#a56fd0', '#8fd070'] },
    ice: { B: ['#2f62ad', '#7fc4f2', '#eafcff'], ol: '#1c3a70', glow: '#bfe9ff', hot: '#ffffff', fx: ['#ffffff', '#bfe9ff', '#9fd0f5'] },
  };
  const elp = (el) => (G.weaponArt && G.weaponArt.ELP && G.weaponArt.ELP[el]) || ELP_DU[el];
  const HE_T0 = { sword: 0.2, spear: 0.55, hammer: 0.45, bow: 0.16 }; // từ đâu (tỉ lệ dọc thân tính từ tay cầm) thì bắt đầu nhuộm
  const HE_PHA = [0, 0, 0.45, 0.7], HE_K = [1, 1, 1.05, 1.1];
  const rgb = (col) => { const n = parseInt(col.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  // Hệ đang hiện của món (null: bản thường). nhuom: có nhuộm ảnh không (ảnh thường, giai đoạn >= 2).
  function heCua(sp, o) {
    const el = o && /^(fire|poison|ice)$/.test(o.branch) ? o.branch : null, st = el ? clamp(o.stage | 0, 0, 3) : 0;
    if (!el || !st) return null;
    return { el, st, nhuom: !sp.vk.bienThe && st >= 2 };
  }
  SC.heCua = heCua;
  // Đo thân vũ khí một lần: độ nhuộm từng điểm ảnh thật (0 ở cán, 1 ở lưỡi), điểm viền ngoài, các điểm dọc lưỡi để rải hạt.
  function hinhVk(sp) {
    if (sp.hh) return sp.hh;
    const V = sp.vk, N = sp.net || 1, pw = sp.pw, ph = sp.ph, px = sp.px, bow = V.loai === 'bow';
    const th = Math.atan2(V.mui[1] - V.cam[1], V.mui[0] - V.cam[0]), ct = Math.cos(th), st = Math.sin(th);
    const T = new Float32Array(pw * ph);
    let mx = 1e-6;
    for (let j = 0; j < ph; j++) for (let i = 0; i < pw; i++) {
      if (!px[j * pw + i]) continue;
      const u = (i + 0.5) / N - V.cam[0], v = (j + 0.5) / N - V.cam[1], a = bow ? Math.abs(-u * st + v * ct) : u * ct + v * st;
      T[j * pw + i] = a; if (a > mx) mx = a;
    }
    const t0 = HE_T0[V.loai] || 0.2, w = new Float32Array(pw * ph), bien = new Uint8Array(pw * ph), ngan = [];
    const rong = (i, j) => i < 0 || j < 0 || i >= pw || j >= ph || !px[j * pw + i];
    const NB = 18, xo = new Array(NB).fill(null);
    for (let j = 0; j < ph; j++) for (let i = 0; i < pw; i++) {
      const k = j * pw + i; if (!px[k]) continue;
      const a = T[k] / mx, q = clamp((a - t0) / 0.15, 0, 1);
      w[k] = q * q * (3 - 2 * q);
      if (rong(i - 1, j) || rong(i + 1, j) || rong(i, j - 1) || rong(i, j + 1)) {
        bien[k] = 1;
        if (w[k] > 0.5) { // điểm viền trên lưỡi: chia theo dọc thân, mỗi khúc giữ một điểm (xen kẽ hai mép)
          const b = Math.min(NB - 1, Math.floor(((a - t0) / (1 - t0 + 1e-6)) * NB)), sc = ((i * 7 + j * 13) % 17) / 17;
          if (b >= 0 && (!xo[b] || sc > xo[b][2])) xo[b] = [(i + 0.5) / N, (j + 0.5) / N, sc];
        }
      }
    }
    for (const p of xo) if (p) ngan.push([p[0], p[1]]);
    if (!ngan.length) ngan.push([V.mui[0], V.mui[1]]);
    return (sp.hh = { w, bien, pts: ngan });
  }
  // Màu từng điểm ảnh thật sau khi nhuộm theo hệ el, giai đoạn st (nhớ trên sp.mau).
  function pxHe(sp, el, st) {
    const key = 'he|' + el + st; if (sp.mau[key]) return sp.mau[key];
    const H = hinhVk(sp), E = elp(el), B = E.B.map(rgb), OL = rgb(E.ol), pha = HE_PHA[st], src = sp.px, out = new Array(src.length);
    for (let k = 0; k < src.length; k++) {
      const col = src[k]; if (!col) { out[k] = null; continue; }
      const a = pha * H.w[k]; if (a <= 0.01) { out[k] = col; continue; }
      const o = rgb(col), L = (0.3 * o[0] + 0.59 * o[1] + 0.11 * o[2]) / 255;
      let m;
      if (H.bien[k] && L < 0.3) m = OL; // viền ngoài: màu viền của hệ
      else {
        const l = clamp((L - 0.08) / 0.8, 0, 1), A = l < 0.5 ? B[0] : B[1], C = l < 0.5 ? B[1] : B[2], f = l < 0.5 ? l * 2 : (l - 0.5) * 2;
        m = [A[0] + (C[0] - A[0]) * f, A[1] + (C[1] - A[1]) * f, A[2] + (C[2] - A[2]) * f];
      }
      const b = H.bien[k] && L < 0.3 ? Math.min(1, H.w[k]) : a;
      out[k] = hex2(Math.round(o[0] + (m[0] - o[0]) * b), Math.round(o[1] + (m[1] - o[1]) * b), Math.round(o[2] + (m[2] - o[2]) * b));
    }
    return (sp.mau[key] = out);
  }
  // Hình vũ khí xoay góc a (độ, 0 chĩa về trước, -90 chĩa lên): điểm cầm ở gốc. Nhớ theo góc (bước 5 độ), bậc, hệ và giai đoạn.
  // Trả về { cv, dx, dy, w, h, c, s, k, glow }: dx, dy, w, h theo điểm ảnh GAME; cv có số điểm ảnh gấp net lần (vẽ bằng drawImage có cỡ đích).
  // k: hệ số phóng (giai đoạn cao to hơn chút, như bản code); glow: quầng sáng hệ (giai đoạn 3).
  function xoayVk(sp, a, rar, he, co) {
    a = Math.round(a / 5) * 5; co = co > 0 && co !== 1 ? Math.round(co * 1000) / 1000 : 1;
    const chung = boNhoBat(), k = (chung ? idAnh(sp.img) + '|' : '') + a + '|' + rar + (he ? '|' + he.el + he.st : '') + (co !== 1 ? '|c' + co : ''); let r = chung ? XOAY_NHO.get(k) : sp.xoay.get(k); if (r) return r;
    const V = sp.vk, N = sp.net || 1, w = sp.rong, h = sp.cao, pw = sp.pw || w, ph = sp.ph || h, th = Math.atan2(V.mui[1] - V.cam[1], V.mui[0] - V.cam[0]), q = a * D2R - th, c = Math.cos(q), s = Math.sin(q);
    const nh = he && he.nhuom, K = (nh ? HE_K[he.st] : 1) * co, src = nh ? pxHe(sp, he.el, he.st) : sp.px;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const p of [[0, 0], [w, 0], [0, h], [w, h]]) { const u = p[0] - V.cam[0], v = p[1] - V.cam[1], X = (u * c - v * s) * K, Y = (u * s + v * c) * K; x0 = Math.min(x0, X); y0 = Math.min(y0, Y); x1 = Math.max(x1, X); y1 = Math.max(y1, Y); }
    x0 = Math.floor(x0) - 1; y0 = Math.floor(y0) - 1; x1 = Math.ceil(x1) + 1; y1 = Math.ceil(y1) + 1;
    const W = x1 - x0, H = y1 - y0, CW = Math.max(1, W * N), CH = Math.max(1, H * N), cv = document.createElement('canvas'); cv.width = CW; cv.height = CH;
    const g = cv.getContext('2d'), vien = RAR_VIEN[rar] || null, id = g.createImageData(CW, CH), d = id.data;
    for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) {
      // tâm điểm ảnh thật (x, y) theo toạ độ game -> điểm trên ảnh gốc (toạ độ game) -> điểm ảnh thật của ảnh gốc
      const X = (x0 + (x + 0.5) / N) / K, Y = (y0 + (y + 0.5) / N) / K, u = X * c + Y * s + V.cam[0], v = -X * s + Y * c + V.cam[1], i = Math.floor(u * N), j = Math.floor(v * N);
      if (i < 0 || j < 0 || i >= pw || j >= ph) continue;
      let col = src[j * pw + i]; if (!col) continue;
      const n = parseInt(col.slice(1), 16), o = (y * CW + x) * 4;
      d[o] = (n >> 16) & 255; d[o + 1] = (n >> 8) & 255; d[o + 2] = n & 255; d[o + 3] = 255;
    }
    // Viền bậc Lam/Tím/Vàng: một vòng màu bậc dày 1 điểm ảnh game bao ngoài hình (ảnh AI không có viền một màu cố định để đổi màu).
    if (vien) {
      const vc = rgb(vien), A = new Uint8Array(CW * CH);
      for (let i = 0; i < CW * CH; i++) A[i] = d[i * 4 + 3] ? 1 : 0;
      let cur = A;
      for (let it = 0; it < N; it++) {
        const nx = cur.slice();
        for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) {
          const i = y * CW + x; if (cur[i]) continue;
          if ((x > 0 && cur[i - 1]) || (x < CW - 1 && cur[i + 1]) || (y > 0 && cur[i - CW]) || (y < CH - 1 && cur[i + CW])) { nx[i] = 2; const o = i * 4; d[o] = vc[0]; d[o + 1] = vc[1]; d[o + 2] = vc[2]; d[o + 3] = 255; }
        }
        cur = nx;
      }
    }
    g.putImageData(id, 0, 0);
    r = { cv, dx: x0, dy: y0, w: W, h: H, c, s, k: K, glow: null };
    if (he && he.st >= 3) { // quầng sáng: hình bóng tô màu hệ, loang 1-2 điểm ảnh quanh thân
      const P = 2, gv = document.createElement('canvas'); gv.width = CW + 2 * P * N; gv.height = CH + 2 * P * N;
      const bo = document.createElement('canvas'); bo.width = CW; bo.height = CH;
      const bx = bo.getContext('2d'); bx.drawImage(cv, 0, 0); bx.globalCompositeOperation = 'source-in'; bx.fillStyle = elp(he.el).glow; bx.fillRect(0, 0, CW, CH);
      const gx = gv.getContext('2d');
      for (const o of [[-2, 0, 0.35], [2, 0, 0.35], [0, -2, 0.35], [0, 2, 0.35], [-1, -1, 0.6], [1, -1, 0.6], [-1, 1, 0.6], [1, 1, 0.6]]) { gx.globalAlpha = o[2]; gx.drawImage(bo, (P + o[0]) * N, (P + o[1]) * N); }
      r.glow = { cv: gv, dx: x0 - P, dy: y0 - P, w: W + 2 * P, h: H + 2 * P };
    }
    if (chung) return XOAY_NHO.set(k, r, CW * CH + (r.glow ? r.glow.cv.width * r.glow.cv.height : 0)); // V2: bộ nhớ chung, khoá theo ảnh
    if (sp.xoay.size > 400) sp.xoay.clear();
    sp.xoay.set(k, r);
    return r;
  }
  SC.xoayVk = xoayVk;
  // Hạt hiệu ứng của hệ, vẽ mỗi khung (không tạo canvas): toạ độ theo điểm ảnh game, 1 điểm ảnh mỗi hạt.
  const fr = (v) => v - Math.floor(v);
  function hatHe(c, sp, R, he, T, t) {
    const E = elp(he.el), pts = hinhVk(sp).pts, st = he.st, n = [0, 4, 7, 12][st], seed = (sp.vk.dong * 7 + sp.vk.loai.length * 3) * 0.37;
    const a0 = c.globalAlpha, dot = (x, y, col, al, ww, hh) => { c.globalAlpha = a0 * clamp(al, 0, 1); c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), ww || 1, hh || 1); };
    if (he.el === 'fire' && st >= 3) { // ngọn lửa liếm dọc lưỡi
      for (let j = 0; j < pts.length; j += 2) {
        const p = T(pts[j]), hgt = 2 + Math.round(3 * (0.5 + 0.5 * Math.sin(t * 11 + j * 1.7 + seed)));
        for (let y = 0; y <= hgt; y++) {
          const f = y / hgt, x = p[0] + Math.sin(t * 9 + j + y * 0.9) * f * 1.2, col = f < 0.34 ? E.B[1] : f < 0.7 ? E.glow : E.hot;
          dot(x - (y === 0 ? 1 : 0), p[1] - y, col, 0.9 - f * 0.35, y === 0 ? 3 : 1, 1);
        }
      }
    }
    for (let i = 0; i < n; i++) {
      const h = fr(Math.sin(i * 12.9898 + seed) * 43758.5453), p = T(pts[Math.floor(h * pts.length) % pts.length]);
      if (he.el === 'fire') { // tàn lửa bay lên, lập loè
        const ph = fr(t * (0.9 + h * 0.6) + h * 7);
        if (fr(t * 9 + i * 0.37) < 0.15) continue;
        dot(p[0] + Math.sin(ph * 6 + i) * 1.2, p[1] - ph * (5 + 3 * st), ph < 0.3 ? E.hot : ph < 0.6 ? E.fx[0] : E.fx[2], 1 - ph);
      } else if (he.el === 'poison') {
        const ph = fr(t * (0.6 + h * 0.5) + h * 5);
        if (i % 3 === 2) { // bọt: phồng lên rồi vỡ
          const x = p[0] + (h - 0.5) * 2, y = p[1] - ph * 3;
          if (ph < 0.8) dot(x, y, E.fx[1], 0.85);
          else { const k = 1; dot(x - k, y, E.fx[1], 0.6); dot(x + k, y, E.fx[1], 0.6); dot(x, y - k, E.fx[1], 0.6); dot(x, y + k, E.fx[1], 0.6); }
        } else dot(p[0], p[1] + ph * ph * (6 + 2 * st), ph < 0.15 ? E.hot : E.fx[0], 1 - ph * 0.7, 1, ph > 0.2 && ph < 0.7 ? 2 : 1); // giọt nọc rơi
      } else { // băng: lấp lánh hình chữ thập và hơi sương trôi
        const ph = fr(t * (0.5 + h * 0.4) + h * 9);
        if (i % 2 === 0) {
          if (ph < 0.3) { const k = ph < 0.15 ? 1 : 2; dot(p[0], p[1], '#ffffff', 1); for (const q of [[k, 0], [-k, 0], [0, k], [0, -k]]) dot(p[0] + q[0], p[1] + q[1], E.fx[1], 0.9 - ph * 2); }
        } else dot(p[0] + (h - 0.5) * 4 * ph, p[1] + ph * 4, E.fx[1], (1 - ph) * 0.55, 2, 1);
      }
    }
    c.globalAlpha = a0;
  }
  SC.hatHe = hatHe;
  function chamDay(c, x0, y0, x1, y1, col) { c.fillStyle = col; const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); for (let i = 0; i <= n; i++) c.fillRect(Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), 1, 1); }
  // Vẽ vũ khí tự vẽ (cùng cách gọi với G.weaponArt.draw).
  SC.veVuKhi = function (c, sp, opts, x0, y0, ang, pull) {
    const rar = Math.max(0, Math.min(3, (opts && opts.rarity) | 0)), he = heCua(sp, opts), R = xoayVk(sp, ang || 0, rar, he, SC.coVk(sp.vk.loai, opts)), X = Math.round(x0), Y = Math.round(y0);
    const t = (opts && opts.t != null ? +opts.t : G.time) || 0;
    const sm = c.imageSmoothingEnabled; c.imageSmoothingEnabled = false;
    if (R.glow) {
      const op = c.globalCompositeOperation, a0 = c.globalAlpha;
      c.globalCompositeOperation = 'lighter'; c.globalAlpha = a0 * (0.3 + 0.12 * Math.sin(t * 5));
      c.drawImage(R.glow.cv, X + R.glow.dx, Y + R.glow.dy, R.glow.w, R.glow.h);
      c.globalCompositeOperation = op; c.globalAlpha = a0;
    }
    c.drawImage(R.cv, X + R.dx, Y + R.dy, R.w, R.h);
    c.imageSmoothingEnabled = sm;
    const V = sp.vk, K = R.k || 1;
    const T = (p) => { const u = p[0] - V.cam[0], v = p[1] - V.cam[1]; return [X + (u * R.c - v * R.s) * K, Y + (u * R.s + v * R.c) * K]; };
    if (V.day) {
      // dây cung: hai đầu dây (chấm trong công cụ) nối qua điểm kéo; giương cung thì có mũi tên
      const A = T(V.day[0]), B = T(V.day[1]), a = Math.round((ang || 0) / 5) * 5 * D2R, fx = Math.cos(a), fy = Math.sin(a);
      const span = Math.hypot(B[0] - A[0], B[1] - A[1]), k = Math.max(0, Math.min(1, pull || 0)), M = [(A[0] + B[0]) / 2 - fx * k * span * 0.35, (A[1] + B[1]) / 2 - fy * k * span * 0.35];
      if (k <= 0.02) chamDay(c, A[0], A[1], B[0], B[1], '#e8e2d0');
      else {
        chamDay(c, A[0], A[1], M[0], M[1], '#e8e2d0'); chamDay(c, M[0], M[1], B[0], B[1], '#e8e2d0');
        const L = span * 0.55; chamDay(c, M[0], M[1], M[0] + fx * L, M[1] + fy * L, '#b78350');
        c.fillStyle = '#f4f8ff'; c.fillRect(Math.round(M[0] + fx * (L + 1)), Math.round(M[1] + fy * (L + 1)), 1, 1);
        c.fillStyle = '#d2362e'; c.fillRect(Math.round(M[0] + fx * 2 - fy), Math.round(M[1] + fy * 2 + fx), 1, 1);
      }
    }
    if (he) hatHe(c, sp, R, he, T, t);
  };
  // Ô đồ: vũ khí nằm chéo (cung đứng), vừa trong ô sz, tâm (x, y). Có hệ thì nhuộm theo hệ (không có hạt).
  SC.iconVuKhi = function (c, sp, opts, x, y, sz) {
    const he = heCua(sp, opts), ang = sp.vk.loai === 'bow' ? 0 : -45, R = xoayVk(sp, ang, Math.max(0, Math.min(3, (opts && opts.rarity) | 0)), he && he.nhuom ? he : null);
    sz = sz || 24; const m = Math.max(R.w, R.h); let k = sz / m; if (k >= 1) k = Math.max(1, Math.floor(k));
    const sm = c.imageSmoothingEnabled; c.imageSmoothingEnabled = false;
    c.drawImage(R.cv, Math.round(x - (R.w * k) / 2), Math.round(y - (R.h * k) / 2), Math.round(R.w * k), Math.round(R.h * k));
    c.imageSmoothingEnabled = sm;
  };
  function noiVuKhi() {
    const WA = G.weaponArt;
    if (!WA || WA._spriteCustom) return;
    WA._spriteCustom = true;
    const draw0 = WA.draw, icon0 = WA.icon;
    WA.drawCode = draw0; WA.iconCode = icon0;
    WA.draw = function (c, opts, x0, y0, ang, pull) { const sp = SC.timVuKhi(opts); if (!sp) return draw0.apply(this, arguments); SC.veVuKhi(c, sp, opts, x0, y0, ang, pull); };
    WA.icon = function (c, opts, x, y, sz) { const sp = SC.timVuKhi(opts); if (!sp) return icon0.apply(this, arguments); SC.iconVuKhi(c, sp, opts, x, y, sz); };
  }

  // ---------- TRANG PHỤC ----------
  // Đặt ảnh vào hệ toạ độ F của em bé (F.ox, F.oy, góc xoay): điểm ảnh (i, j) nằm ở (lx + i, ly + j) trong hệ F.
  // Khung em bé ghép theo điểm ảnh game: điểm nào có ảnh vẫn do điểm ảnh thật ở giữa ô net x net quyết định (hình bóng như bản thường).
  // Khung ghép nét cao (F.S.N >= 2) và ảnh có net >= 2: mỗi điểm còn mang N x N điểm con lấy đúng chỗ trên ảnh gốc (đủ chi tiết gốc).
  function diemGame(sp, i, j) {
    const N = sp.net || 1;
    if (N === 1) return sp.px[j * sp.rong + i];
    const pw = sp.pw, x = Math.min(pw - 1, Math.floor((i + 0.5) * N)), y = Math.min(sp.ph - 1, Math.floor((j + 0.5) * N));
    return sp.px[y * pw + x];
  }
  // Điểm ảnh thật của ảnh gốc tại toạ độ (u, v) theo điểm ảnh game của ảnh (null: trong suốt / ngoài ảnh).
  function diemThat(sp, u, v) {
    const N = sp.net || 1, x = Math.floor(u * N), y = Math.floor(v * N);
    return x < 0 || y < 0 || x >= sp.pw || y >= sp.ph ? null : sp.px[y * sp.pw + x];
  }
  // kx, ky (ghép, tuỳ chọn): co giãn ảnh quanh góc trên-trái (lx, ly). Không ghi (1) thì y hệt trước.
  function veVaoKhung(F, sp, lx, ly, doi, kx, ky) {
    kx = kx > 0 ? kx : 1; ky = ky > 0 ? ky : 1;
    const S = F.S, w = sp.rong, h = sp.cao, M = S.N > 1 && (sp.net || 1) > 1 ? S.N : 1, MM = M * M, k1 = kx === 1 && ky === 1;
    const con = (f) => { const o = new Array(MM); for (let k = 0; k < MM; k++) { const q = f(((k % M) + 0.5) / M, (((k / M) | 0) + 0.5) / M); o[k] = q && doi ? doi(q) : q; } return o; };
    if (F.z && k1) {
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
        const col = diemGame(sp, i, j); if (!col) continue;
        S.p(F.ox + lx + i, F.oy + ly + j, doi ? doi(col) : col, M > 1 ? con((a, b) => diemThat(sp, i + a, j + b)) : null);
      }
      return;
    }
    const cs = F.cs, sn = F.sn;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const p of [[lx, ly], [lx + w * kx, ly], [lx, ly + h * ky], [lx + w * kx, ly + h * ky]]) { const q = F.pt(p[0], p[1]); x0 = Math.min(x0, q[0]); y0 = Math.min(y0, q[1]); x1 = Math.max(x1, q[0]); y1 = Math.max(y1, q[1]); }
    for (let y = Math.floor(y0) - 1; y <= Math.ceil(y1) + 1; y++) for (let x = Math.floor(x0) - 1; x <= Math.ceil(x1) + 1; x++) {
      const dx = x - F.ox, dy = y - F.oy, u = dx * cs + dy * sn, v = -dx * sn + dy * cs;
      const i = k1 ? Math.round(u - lx) : Math.floor((u - lx + 0.5) / kx), j = k1 ? Math.round(v - ly) : Math.floor((v - ly + 0.5) / ky);
      if (i < 0 || j < 0 || i >= w || j >= h) continue;
      const col = diemGame(sp, i, j); if (!col) continue;
      // điểm con (a, b) của điểm (x, y): xoay ngược về ảnh; điểm (x, y) phủ ảnh từ u - lx - 0,5 tới u - lx + 0,5
      S.p(x, y, doi ? doi(col) : col, M > 1 ? con((a, b) => { const X = dx + a - 0.5, Y = dy + b - 0.5; return diemThat(sp, (X * cs + Y * sn - lx + 0.5) / kx, (-X * sn + Y * cs - ly + 0.5) / ky); }) : null);
    }
  }
  SC.veVaoKhung = veVaoKhung;
  const toiDi = (col) => { const v = parseInt(col.slice(1), 16); return hex2(Math.round(((v >> 16) & 255) * 0.72), Math.round(((v >> 8) & 255) * 0.72), Math.round((v & 255) * 0.78)); };
  // Màu tay áo: màu nhiều nhất của áo (bỏ viền), kèm bản tối và sáng.
  function mauTayAo(sp) {
    if (sp.mau.tay) return sp.mau.tay;
    const dem = {}; for (const c of sp.px) if (c && c !== INK && c !== '#14182e') dem[c] = (dem[c] || 0) + 1;
    let best = '#a89872', n = 0; for (const c in dem) if (dem[c] > n) { n = dem[c]; best = c; }
    const v = parseInt(best.slice(1), 16), r = (v >> 16) & 255, g = (v >> 8) & 255, b = v & 255, m = (k) => hex2(Math.min(255, Math.round(r * k)), Math.min(255, Math.round(g * k)), Math.min(255, Math.round(b * k)));
    return (sp.mau.tay = [m(0.65), best, hex2(Math.min(255, r + 50), Math.min(255, g + 50), Math.min(255, b + 50))]);
  }
  const PHANG = { ol: false, bevel: false };
  // Lớp vốn có của món đồ (để biết cap.lop có dời lớp hay không).
  const lopGoc = (t) => (t.o === 'hats' ? (t.lop === 'truoc' ? 'truoc' : 'than') : t.o === 'backs' || t.o === 'wings' ? 'sau' : t.o === 'masks' ? 'truoc' : t.o === 'hands' ? (t.kieu === 'cam' ? 'truoc' : 'than') : 'than');
  // CÁNH THEO CẤP (làn E1). Mã tp-wings-<loại>-1 và tp-wings-<loại>-3 (ô wings, look = <loại>) là ảnh riêng của cánh cấp 1 và cấp 3;
  // tp-wings-<loại> vẫn là ảnh cấp 2 và là ảnh dự phòng cho cấp chưa có ảnh riêng. Cờ tắt: G.spriteCustom.CANH_THEO_CAP = false
  // (mọi cấp lại dùng ảnh cấp 2 như trước; gọi G.tinhLinh.clearCache() để hình đổi ngay).
  const MA_CANH_CAP = /^tp-wings-([a-z0-9_]+)-([13])$/;
  SC.CANH_THEO_CAP = true;
  const capCanh = (sp) => { const m = sp && sp.tp && sp.tp.o === 'wings' ? MA_CANH_CAP.exec(sp.ma) : null; return m && m[1] === sp.tp.look ? +m[2] : 0; }; // 1 | 3 | 0 (không phải ảnh theo cấp)
  const anhCanh = (look, lv) => { if (lv === 2 || SC.CANH_THEO_CAP === false) return null; const a = doSan('tp-wings-' + look + '-' + lv); return a && capCanh(a) === lv ? a : null; };
  // Cùng ảnh đó nhưng mang mã của ảnh cấp 2, để tinhDatMon lấy đúng mục chỉnh (cap) của ảnh cấp 2.
  const muonCap = (a, ma) => (a.muon && a.muon.ma === ma ? a.muon : (a.muon = Object.create(a, { ma: { value: ma } })));
  function dinhNghia(sp) {
    const t = sp.tp, L = t.lech, ve = (F, P, dx, dy, doi) => P(PHANG, () => veVaoKhung(F, sp, L[0] + (dx || 0), L[1] + (dy || 0), doi));
    const o = { id: t.look, name: sp.ten, tuVe: true, net: sp.net || 1, ma: sp.ma, lopGoc: lopGoc(t) }; // net: game ghép em bé nét cao khi mặc món này
    // GHÉP (docs/review/ghep-trang-bi/DINH-DANG-GHEP.md mục 4): món có "diem" hoặc nhân vật có "cap" cho món này thì đặt theo
    // tinhDatMon; còn lại đi ĐÚNG đường cũ (dòng "ve(...)" bên dưới) nên game y hệt trước. Trả về true nếu đã vẽ (hoặc ẩn).
    const moi = (cx, P, hx, hy) => {
      if (!cx || !cx.fit || !(t.diem || coCap(cx.key, sp.ma))) return false;
      const r = SC.tinhDatMon(cx, sp, { hx, hy });
      if (r.an) return true;
      const f = () => { for (const d of r.ds) veDat(cx, r.sp, d); };
      if (P) P(PHANG, f); else f();
      return true;
    };
    o.lopCap = (cx) => { const c = cx && cx.fit ? SC.capTheo(cx.key, sp.ma, cx.dong) : null; return (c && c.lop) || null; };
    if (t.o === 'hats') {
      const veMu = (cx, P) => { if (!moi(cx, P)) ve(cx.H, P); };
      o.draw = (cx, P) => { if (t.lop !== 'truoc') veMu(cx, P); }; if (t.lop === 'truoc') o.front = veMu;
      o.veLop = veMu;
    } else if (t.o === 'robes') { o.draw = (cx, P) => { if (!moi(cx, P)) ve(cx.B, P); }; o.veLop = o.draw; if (t.tayAo) o.sleeve = () => mauTayAo(sp); }
    else if (t.o === 'backs') { o.draw = (cx, P) => { if (!moi(cx, P)) ve(cx.B, P); }; o.veLop = o.draw; }
    else if (t.o === 'hands') {
      if (t.kieu === 'cam') {
        o.prop = (cx, P, hx, hy) => { if (!moi(cx, P, hx, hy)) ve(cx.B, P, hx, hy); };
        o.veLop = (cx, P) => { if (cx.ps && cx.ps.free) o.prop(cx, P, Math.round(cx.hf[0]), Math.round(cx.hf[1])); };
      } else { o.belt = (cx, P) => { if (!moi(cx, P)) ve(cx.B, P, Math.round((-(cx.tr || 0) + (cx.sw || 0)) * 0.7), 0); }; o.veLop = o.belt; }
    } else if (t.o === 'masks') {
      o.draw = (H, cx) => { if (!moi(cx, null)) veVaoKhung(H, sp, L[0], L[1]); };
      o.veLop = (cx, P) => P(PHANG, (s) => { const c0 = s.clip; s.clip = false; o.draw(cx.H, cx); s.clip = c0; });
    } else if (t.o === 'wings') {
      // CÁNH THEO CẤP (làn E1): cấp 1 và cấp 3 có ảnh riêng (tp-wings-<loại>-1, tp-wings-<loại>-3) thì vẽ ảnh đó; không có thì vẽ ảnh
      // cấp 2 (tệp tp-wings-<loại>, y hệt trước); ảnh cấp 2 cũng không có thì vẽ code như cũ (t.cu). Ảnh theo cấp đặt như ảnh cấp 2:
      // điểm goc_canh của ảnh trùng điểm goc_canh của thân; chỉnh theo cặp (cap) ghi cho ảnh cấp 2 trong tệp ghép cũng áp cho ảnh theo cấp.
      const goc = capCanh(sp) ? null : sp, maGoc = goc ? goc.ma : 'tp-wings-' + t.look; // goc: ảnh cấp 2 (null: tệp này là ảnh riêng của một cấp)
      o.levels = 3;
      o.draw = (cx, P) => {
        const lv = Math.max(1, Math.min(3, cx.lv | 0)), a = anhCanh(t.look, lv) || goc;
        if (!a) { if (t.cu && t.cu.draw) t.cu.draw(cx, P); return; } // cấp này chưa có ảnh nào: code cũ
        if (cx && cx.fit && (a.tp.diem || coCap(cx.key, a.ma) || coCap(cx.key, maGoc))) {
          const r = SC.tinhDatMon(cx, coCap(cx.key, a.ma) || !coCap(cx.key, maGoc) ? a : muonCap(a, maGoc), null);
          if (!r.an) P(PHANG, () => { for (const d of r.ds) veDat(cx, r.sp, d); });
          return;
        }
        const La = a.tp.lech, flap = [-14, 0, 18, 0][(cx.f | 0) % 4] * (lv === 1 ? 0.6 : 1) * (cx.ps && cx.ps.anim === 'dodge' ? 1.5 : 1);
        P(PHANG, () => veVaoKhung(cx.B.sub(-3, -11, flap * 0.7 + 16), a, La[0], La[1], toiDi)); // cánh xa: tối hơn
        P(PHANG, () => veVaoKhung(cx.B.sub(-4, -10, flap), a, La[0], La[1]));
      };
      o.veLop = o.draw;
    }
    return o;
  }
  // Vẽ một phần đã tính chỗ (d.cu: y hệt đường cũ; còn lại: gốc ảnh O, xoay a độ, co giãn sx, sy).
  function veDat(cx, sp, d) {
    if (d.cu) veVaoKhung(d.F, sp, d.lx, d.ly, d.doi);
    else veVaoKhung(cx.S.fr(d.O[0], d.O[1], d.a), sp, 0, 0, d.doi, d.sx, d.sy);
  }

  // ======================= GHÉP TRANG BỊ =======================
  // Định dạng: docs/review/ghep-trang-bi/DINH-DANG-GHEP.md. Hồ sơ hình thể nhân vật: tệp ghep-<key>.sprite.json
  //   { "doi_tuong": "ghep", "ma": "ghep-smith", "nhan_vat": "smith", "diem": {...}, "diem_theo": {...}, "cap": {...} }
  // Toạ độ trên nhân vật tính từ chân (x về trước mặt, y âm là lên), trên ảnh món đồ tính từ góc trên-trái; đơn vị điểm ảnh game,
  // đếm như vị trí điểm ảnh (điểm ảnh thứ i nằm ở i). Thân vẽ code tự tính điểm từ khung xương từng khung (js/hero_tinhlinh.js).
  const TEN_DIEM = ['dinh_dau', 'tam_dau', 'gay', 'mat', 'co', 'vai_sau', 'vai_truoc', 'nguc', 'eo', 'hong', 'khuyu_sau', 'khuyu_truoc', 'tay_sau', 'tay_truoc',
    'goi_sau', 'goi_truoc', 'chan_sau', 'chan_truoc', 'cam', 'lung', 'goc_canh'];
  const DIEM_DAU = { dinh_dau: 1, tam_dau: 1, gay: 1, mat: 1 }; // điểm thuộc đầu: thân AI dời theo phần đầu tự đo
  const LOP_CAP = { sau: 1, than: 1, truoc: 1, truoc_tay: 1 };
  SC.TEN_DIEM = TEN_DIEM;
  SC.ghep = {};
  SC.ghepVer = 0;
  function docBoDiem(d, lim) {
    if (!d || typeof d !== 'object') return null;
    const o = {}; let n = 0;
    for (const k of TEN_DIEM) { const p = P2(d[k]); if (p && Math.abs(p[0]) <= lim && Math.abs(p[1]) <= lim) { o[k] = p; n++; } }
    return n ? o : null;
  }
  SC.docBoDiem = docBoDiem;
  const soKep = (v, a, b) => (v == null || v === '' || !isFinite(+v) ? undefined : clamp(+v, a, b));
  // Một mục chỉnh (cap hoặc một mục trong cap.theo): chỉ giữ trường có ghi.
  function docChinh(c) {
    const o = {};
    if (!c || typeof c !== 'object') return o;
    const gan = (k, v) => { if (v !== undefined) o[k] = v; };
    gan('dx', soKep(c.dx, -60, 60)); gan('dy', soKep(c.dy, -60, 60)); gan('sx', soKep(c.sx, 0.8, 1.25)); gan('sy', soKep(c.sy, 0.8, 1.25)); gan('xoay', soKep(c.xoay, -180, 180));
    if (LOP_CAP[c.lop]) o.lop = c.lop;
    if (typeof c.an === 'boolean') o.an = c.an;
    // Đợt 5 (trường tuỳ chọn, chỉ vũ khí trên thân AI dùng): "bam": tên một điểm neo của thân (thường là "tay_truoc"): chỗ bàn tay NẮM
    // vũ khí được đặt đúng vào điểm đó của thân ở khung đang vẽ. false: bỏ bám ở khung này. Không ghi: như cũ.
    // "bam_vk": điểm nào của vũ khí bám vào đó: "nam" (chỗ tay nắm chuôi; mặc định của kiếm, giáo, búa), "cam" (điểm cầm vu_khi.cam;
    // mặc định của cung), "day" (cung: chỗ tay kéo dây, lùi theo độ căng dây).
    if (c.bam === false) o.bam = false; else if (typeof c.bam === 'string' && TEN_DIEM.indexOf(c.bam) >= 0) o.bam = c.bam;
    if (c.bam_vk === 'nam' || c.bam_vk === 'cam' || c.bam_vk === 'day') o.bam_vk = c.bam_vk;
    return o;
  }
  function docCap(c) {
    if (!c || typeof c !== 'object') return null;
    const goc = Object.assign({ dx: 0, dy: 0, sx: 1, sy: 1, xoay: 0, an: false }, docChinh(c));
    goc.bien_the = typeof c.bien_the === 'string' && /^[A-Za-z0-9_-]{1,40}$/.test(c.bien_the) ? c.bien_the : null;
    goc.da_chinh = c.da_chinh === true;
    const theo = {};
    if (c.theo && typeof c.theo === 'object') for (const k in c.theo) if (/^[a-z]{2,8}(:\d{1,2})?$/.test(k)) theo[k] = docChinh(c.theo[k]);
    return { goc, theo };
  }
  function themGhep(tep) {
    const m = /^ghep-(smith|hunter|healer|wrestler)$/.exec(tep.ma), key = /^(smith|hunter|healer|wrestler)$/.test(tep.nhan_vat) ? tep.nhan_vat : m && m[1];
    if (!key) throw new Error('tệp ghép thiếu nhân vật (smith, hunter, healer, wrestler)');
    const g = { ma: tep.ma, key, diem: docBoDiem(tep.diem, 200) || {}, theo: {}, cap: {}, coVk: false };
    if (tep.diem_theo && typeof tep.diem_theo === 'object') for (const k in tep.diem_theo) if (/^[a-z]{2,8}(:\d{1,2})?$/.test(k)) { const d = docBoDiem(tep.diem_theo[k], 200); if (d) g.theo[k] = d; }
    if (tep.cap && typeof tep.cap === 'object') for (const k in tep.cap) if (/^[A-Za-z0-9_-]{1,40}$/.test(k)) { const c = docCap(tep.cap[k]); if (c) { g.cap[k] = c; if (k.indexOf('vk-') === 0) g.coVk = true; } }
    SC.ghep[key] = g; SC.ghepVer++;
    xoaNhoDo();
    return g;
  }
  function boGhep(key) { delete SC.ghep[key]; SC.ghepVer++; xoaNhoDo(); }
  SC.khoaGhep = (key) => (SC.ghep[key] ? '|g' + SC.ghepVer : '');
  const coCap = (key, ma) => !!(SC.ghep[key] && SC.ghep[key].cap[ma]);
  // Tên động tác: thân code (run, dodge, hurt, hold, ...) và thân AI (move, ne, hit, tele, ...) gọi khác nhau; khoá "theo" ghi tên nào cũng được.
  const CHUAN = { run: 'move', dash: 'move', dodge: 'ne', hurt: 'hit', hold: 'tele', spec: 'atk', cast: 'atk', sweep: 'atk', gong: 'idle' };
  const DOI_CODE = { move: 'run', ne: 'dodge', hit: 'hurt', tele: 'hold' };
  SC.TEN_AI = CHUAN; SC.TEN_CODE = DOI_CODE;
  // Các khoá "theo" áp cho (ten, i), ưu tiên tăng dần: động tác (tên khác, tên chuẩn, đúng tên) rồi khung.
  function khoaTheo(ten, i) {
    const c = CHUAN[ten] || ten, ds = [];
    for (const n of [DOI_CODE[c], c, ten]) if (n && ds.indexOf(n) < 0) ds.push(n);
    return ds.concat(ds.map((n) => n + ':' + (i | 0)));
  }
  SC.khoaTheo = khoaTheo;
  // Chỉnh theo cặp (nhân vật key + món ma) đã gộp "theo" của động tác / khung dong = { ten, i }. null: không có.
  SC.capTheo = function (key, ma, dong) {
    const g = SC.ghep[key], c = g && g.cap[ma];
    if (!c) return null;
    const r = Object.assign({}, c.goc);
    if (dong) for (const k of khoaTheo(dong.ten, dong.i)) if (c.theo[k]) Object.assign(r, c.theo[k]);
    return r;
  };
  // Thân AI: điểm neo khung (ten, i), toạ độ tính từ chân. Lấy diem_theo (khung thắng động tác), thiếu thì lấy "diem" (khung đứng
  // đầu tiên) rồi dời theo phần game tự đo (SC.khopEmBe): đầu dời theo dau, còn lại theo than; lăn/ngã: xoay, dời cả khối.
  // null: chưa có tệp ghép cho nhân vật này (game ước lượng từ khung xương như cũ).
  SC.diemAI = function (key, ten, i, khop) {
    const g = SC.ghep[key];
    if (!g) return null;
    const th = {};
    for (const k of khoaTheo(ten, i)) if (g.theo[k]) Object.assign(th, g.theo[k]);
    const quay = !!(khop && khop.rot != null), d = {}, ng = {};
    const c = quay ? Math.cos(khop.rot * D2R) : 1, s = quay ? Math.sin(khop.rot * D2R) : 0;
    for (const n of TEN_DIEM) {
      if (th[n]) { d[n] = th[n].slice(); ng[n] = 'tep'; continue; }
      const p = g.diem[n];
      if (!p) continue;
      if (ten === 'idle' && (i | 0) === 0) { d[n] = p.slice(); ng[n] = 'tep'; continue; }
      if (quay) d[n] = [khop.x + p[0] * c - p[1] * s, khop.y + p[0] * s + p[1] * c];
      else { const q = khop ? (DIEM_DAU[n] ? khop.dau : khop.than) : null; d[n] = [p[0] + ((q && q[0]) || 0), p[1] + ((q && q[1]) || 0)]; }
      ng[n] = 'uoc-luong';
    }
    return { diem: d, nguon: ng };
  };
  // neo truyền cho lopDo: có tệp ghép thì thêm khung đang vẽ, điểm của khung và khoá bộ nhớ đệm. Không có: trả lại neo cũ (y hệt trước).
  function neoGhep(key, s, neo, kh, sp) {
    if (!SC.ghep[key]) return neo;
    const da = sp ? SC.diemKhung(sp, key, s.ten, s.i, kh) : SC.diemAI(key, s.ten, s.i, kh), n = Object.assign({}, neo || {});
    n.khung = { ten: s.ten, i: s.i }; n.diem = da ? da.diem : null; n.nguon = da ? da.nguon : null;
    n.khoa = '|g' + SC.ghepVer + ':' + s.ten + ':' + s.i;
    return n;
  }
  const xoay2 = (x, y, a) => { const r = a * D2R, c = Math.cos(r), s = Math.sin(r); return [x * c - y * s, x * s + y * c]; };
  // Khớp các điểm P (trên ảnh món đồ) vào các điểm Q (trên thân, toạ độ tấm ghép): 1 điểm: trùng điểm, giữ góc goc; từ 2 điểm: dời theo
  // trung bình, co đều (kẹp 0,85..1,15) và xoay (kẹp goc ± 20 độ) cho khớp nhất. Không kéo méo.
  function khopDiem(P, Q, goc) {
    const n = P.length;
    if (n === 1) return { T: Q[0].slice(), Pm: P[0].slice(), a: goc, k: 1 };
    let px = 0, py = 0, qx = 0, qy = 0;
    for (let i = 0; i < n; i++) { px += P[i][0]; py += P[i][1]; qx += Q[i][0]; qy += Q[i][1]; }
    px /= n; py /= n; qx /= n; qy /= n;
    let A = 0, Bq = 0, pp = 0;
    for (let i = 0; i < n; i++) { const ux = P[i][0] - px, uy = P[i][1] - py, vx = Q[i][0] - qx, vy = Q[i][1] - qy; A += ux * vx + uy * vy; Bq += ux * vy - uy * vx; pp += ux * ux + uy * uy; }
    let a = goc, k = 1;
    if (pp > 0.25 && (A || Bq)) { a = Math.atan2(Bq, A) / D2R; k = Math.hypot(A, Bq) / pp; }
    const dl = clamp((((a - goc) % 360) + 540) % 360 - 180, -20, 20);
    return { T: [qx, qy], Pm: [px, py], a: goc + dl, k: clamp(k, 0.85, 1.15) };
  }
  SC.khopDiem = khopDiem;
  const capDoi = (c) => !!(c && (c.dx || c.dy || c.xoay || c.sx !== 1 || c.sy !== 1));
  // CHỖ ĐẶT một món đồ trên khung đang vẽ (game và API datDo dùng chung). cx: bối cảnh vẽ (js/hero_tinhlinh.js taoCx).
  // Trả về { sp (ảnh dùng: món hoặc biến thể), c (cap đã gộp), an, ds: [phần], chung: [tên điểm chung], uoc, chuaChinh }.
  // Mỗi phần: { cu: true, F, lx, ly, doi } (y hệt đường cũ) hoặc { O: [x, y], a, sx, sy, doi } toạ độ tấm ghép.
  // Cánh có 2 phần: lá xa (tối hơn) rồi lá gần.
  SC.tinhDatMon = function (cx, sp0, x) {
    const c = cx.fit ? SC.capTheo(cx.key, sp0.ma, cx.dong) : null;
    const bt = c && c.bien_the ? doSan(c.bien_the) : null, sp = bt && bt.tp && bt.tp.o === sp0.tp.o ? bt : sp0, t = sp.tp, L = t.lech;
    const kq = { sp, c, an: !!(c && c.an), ds: [], chung: [], uoc: false, chuaChinh: false };
    if (kq.an) return kq;
    const B = cx.B, H = cx.H;
    let ds;
    if (t.o === 'hats' || t.o === 'masks') ds = [{ F: H, lx: L[0], ly: L[1] }];
    else if (t.o === 'hands' && t.kieu === 'cam') {
      const hx = x && x.hx != null ? x.hx : Math.round(cx.hf[0]), hy = x && x.hy != null ? x.hy : Math.round(cx.hf[1]), p = B.pt(hx, hy);
      ds = [{ F: B, lx: L[0] + hx, ly: L[1] + hy, thay: { tay_truoc: p, tay_sau: p } }]; // đồ cầm: khớp vào bàn tay đang cầm đồ (tay xa, tay rảnh)
    } else if (t.o === 'hands') { const d = Math.round((-(cx.tr || 0) + (cx.sw || 0)) * 0.7); ds = [{ F: B, lx: L[0] + d, ly: L[1], cong: [d, 0] }]; } // bùa lắc theo bước
    else if (t.o === 'wings') {
      const lv = Math.max(1, Math.min(3, cx.lv | 0)), flap = [-14, 0, 18, 0][(cx.f | 0) % 4] * (lv === 1 ? 0.6 : 1) * (cx.ps && cx.ps.anim === 'dodge' ? 1.5 : 1);
      const xa = B.sub(-3, -11, flap * 0.7 + 16), gan = B.sub(-4, -10, flap);
      ds = [{ F: xa, lx: L[0], ly: L[1], doi: toiDi, chi: 'goc_canh', them: [xa.ox - gan.ox, xa.oy - gan.oy] }, { F: gan, lx: L[0], ly: L[1], chi: 'goc_canh' }];
    } else ds = [{ F: B, lx: L[0], ly: L[1] }];
    const dm = t.diem && cx.diemCua ? cx.diemCua() : null, cc = c || {};
    for (const d of ds) {
      d.doi = d.doi || null;
      let fit = null;
      if (dm) {
        const P = [], Q = [];
        for (const n in t.diem) {
          if (d.chi && n !== d.chi) continue;
          let q = d.thay && d.thay[n] ? d.thay[n] : dm.d[n];
          if (!q) continue;
          if (d.cong) { const r = xoay2(d.cong[0], d.cong[1], d.F.deg); q = [q[0] + r[0], q[1] + r[1]]; }
          if (d.them) q = [q[0] + d.them[0], q[1] + d.them[1]];
          P.push(t.diem[n]); Q.push(q);
          if (kq.chung.indexOf(n) < 0) kq.chung.push(n);
          if (!(d.thay && d.thay[n]) && dm.ng[n] === 'uoc-luong') kq.uoc = true;
        }
        if (P.length) fit = khopDiem(P, Q, d.F.deg);
      }
      if (!fit) {
        kq.chuaChinh = true; kq.uoc = true;
        if (!capDoi(c)) { d.cu = true; continue; } // không có điểm chung, không chỉnh: y hệt đường cũ
        const w = sp.rong, h = sp.cao; // chỉ có chỉnh theo cặp: lấy tâm ảnh ở chỗ cũ làm điểm neo
        fit = { T: d.F.pt(d.lx + w / 2, d.ly + h / 2), Pm: [w / 2, h / 2], a: d.F.deg, k: 1 };
      }
      const dd = xoay2(cc.dx || 0, cc.dy || 0, d.F.deg);
      d.a = fit.a + (cc.xoay || 0); d.sx = fit.k * (cc.sx || 1); d.sy = fit.k * (cc.sy || 1);
      const r = xoay2(d.sx * fit.Pm[0], d.sy * fit.Pm[1], d.a);
      d.O = [fit.T[0] + dd[0] - r[0], fit.T[1] + dd[1] - r[1]];
    }
    kq.ds = ds;
    return kq;
  };

  // ---------- API cho công cụ (tools/tach-ghep, tach-do...): xem thử y hệt game ----------
  const r2 = (v) => Math.round(v * 100) / 100;
  // Bối cảnh của một khung. a: đối tượng vẽ em bé của game (o: key, move, atk, dodge, p, weapon, outfit...) hoặc
  // { key, dong_tac, khung, vu_khi ('sword'|'bow'|'spear'|'hammer'|null), v, outfit }.
  function ngCanh(a) {
    const TL = G.tinhLinh;
    if (!a || !TL || !TL.cxGia) return null;
    const key = TL.HERO[a.key] ? a.key : 'smith', of = TL.outfitOf(key, a), sp = SC.cuaEmBe(key, a);
    if (sp) { // thân AI
      let s;
      if (a.dong_tac != null) { const ten0 = String(a.dong_tac), ten = sp.dt[ten0] ? ten0 : SC.TEN_AI[ten0] || ten0, k = sp.dt[ten] ? ten : 'idle'; s = { ten: k, i: clamp(a.khung | 0, 0, sp.dt[k].so - 1) }; }
      else s = SC.chonEmBe(sp, a);
      const kh = SC.khopEmBe(sp, s.ten, s.i), neo = neoGhep(key, s, SC.neoCua(sp, s.ten), kh, sp);
      // nhịp đung đưa: trong game theo động tác của thân code cùng lúc; ở đây suy từ động tác AI (move = chạy; hàng đòn theo vũ khí = đánh, chưởng)
      const fr = a.dong_tac != null ? { key, of, anim: s.ten === 'move' ? 'run' : s.ten === 'idle' ? 'idle' : s.ten === 'cast' ? 'cast' : LA_DON[s.ten] ? 'atk' : s.ten, f: s.i } : TL.frame(a, 1);
      return { ai: true, cx: TL.cxLopDo({ key, of, anim: fr.anim, f: fr.f }, neo, kh), ten: s.ten, i: s.i, key, of };
    }
    let ps;
    if (a.dong_tac != null) {
      const ten = SC.TEN_CODE[a.dong_tac] || String(a.dong_tac), vk = a.vu_khi === undefined ? 'sword' : a.vu_khi && a.vu_khi.type ? a.vu_khi.type : a.vu_khi || 'none';
      ps = TL.poseRs(key, vk, ten, clamp(a.khung | 0, 0, 13), a.v | 0, a.rs == null ? 6 : a.rs);
    } else ps = TL.frame(a, 1).ps;
    return { ai: false, cx: TL.cxGia(key, of, ps, null), ten: ps.anim, i: ps.f | 0, key, of };
  }
  SC.ngCanh = ngCanh;
  // Điểm neo nhân vật ở một khung. Gọi: diemNhanVat(o) hoặc diemNhanVat({ key, dong_tac, khung, vu_khi }) hoặc diemNhanVat(key, dong_tac, khung).
  // Trả về { diem: { tên: [x, y] tính từ chân }, nguon: { tên: 'xuong' | 'tep' | 'uoc-luong' }, than: 'code' | 'ai', dong_tac, khung, goc: { than, dau } }.
  // Cũng nhận diemNhanVat(key, o) (o: đối tượng vẽ em bé hoặc { dong_tac, khung, ... }).
  const thamSo = (a, b, c, tuy) => (typeof a !== 'string' ? a : b && typeof b === 'object' ? Object.assign({}, b, { key: a }) : Object.assign({ key: a, dong_tac: b == null ? 'idle' : b, khung: c }, tuy || {}));
  SC.diemNhanVat = function (a, dong_tac, khung) {
    const ctx = ngCanh(thamSo(a, dong_tac, khung));
    if (!ctx) return null;
    const dm = ctx.cx.diemCua(), ps = ctx.cx.ps, diem = {}, uoc = [];
    for (const n in dm.d) { diem[n] = [r2(dm.d[n][0] + (ps.x || 0)), r2(dm.d[n][1] + (ps.y || 0))]; if (dm.ng[n] === 'uoc-luong') uoc.push(n); }
    const gt = r2(ctx.cx.B.deg), gd = r2(ctx.cx.H.deg);
    return { diem, nguon: Object.assign({}, dm.ng), uoc_luong: uoc, than: ctx.ai ? 'ai' : 'code', dong_tac: ctx.ten, khung: ctx.i, goc: { than: gt, dau: gd }, gocThan: gt, gocDau: gd };
  };
  // Một phần đã tính -> phép đặt ảnh tính từ chân: ảnh món đồ (rong x cao điểm ảnh game) vẽ bằng
  //   translate(x, y); rotate(xoay độ); scale(sx, sy); drawImage(ảnh, 0, 0, rong, cao)   (rồi lật theo hướng mặt như em bé).
  // Khi xoay = 0 game làm tròn x, y; khi xoay khác 0 game dựng từng điểm ảnh (như vũ khí), canvas xoay có thể lệch nhau 1 điểm ảnh.
  function doiRaChan(d, ps) {
    let x, y, sx = 1, sy = 1, a;
    if (d.cu) { const q = d.F.pt(d.lx, d.ly); x = q[0]; y = q[1]; a = d.F.deg; } else { x = d.O[0]; y = d.O[1]; sx = d.sx; sy = d.sy; a = d.a; }
    x += ps.x || 0; y += ps.y || 0;
    if (Math.abs(a) < 0.01) { x = Math.round(x); y = Math.round(y); a = 0; }
    return { x: r2(x), y: r2(y), sx: r2(sx), sy: r2(sy), xoay: r2(a) };
  }
  // Chỗ đặt một món đồ: datDo(key, maDo, dong_tac, khung, tuyChon), datDo(key, maDo, o) hoặc datDo(o, maDo) (o: đối tượng vẽ em bé của game).
  // Trả về { x, y, sx, sy, xoay, lop, da_chinh, uoc_luong, chua_chinh, an, hien, diem_chung, bien_the, ma, o, rong, cao, than, dong_tac, khung, xa }
  // (xa: lá cánh xa, vẽ tối hơn). null: không có món hoặc chưa nạp xong.
  SC.datDo = function (a, maDo, dong_tac, khung, tuy) {
    const ctx = ngCanh(thamSo(a, dong_tac, khung, tuy));
    const sp0 = doSan(maDo);
    if (!ctx || !sp0 || !sp0.tp) return null;
    const cx = ctx.cx, t0 = sp0.tp, ps = cx.ps;
    const r = SC.tinhDatMon(cx, sp0, null), c = r.c || {};
    const out = { ma: sp0.ma, o: t0.o, than: ctx.ai ? 'ai' : 'code', dong_tac: ctx.ten, khung: ctx.i, lop: c.lop || lopGoc(r.sp.tp), da_chinh: c.da_chinh === true,
      an: r.an, hien: !r.an && !(t0.o === 'hands' && t0.kieu === 'cam' && !ps.free), uoc_luong: r.an ? false : r.uoc, chua_chinh: r.an ? false : r.chuaChinh,
      diem_chung: r.chung.slice(), bien_the: r.sp !== sp0 ? r.sp.ma : null, rong: r.sp.rong, cao: r.sp.cao, net: r.sp.net || 1,
      khong_khoac: ctx.ai && t0.o === 'robes' }; // áo không khoác lên thân AI (game hiện bằng viền bậc + dấu ngực); chỗ đặt chỉ để tham khảo
    if (r.an || !r.ds.length) return Object.assign(out, { x: null, y: null, sx: 1, sy: 1, xoay: 0 });
    Object.assign(out, doiRaChan(r.ds[r.ds.length - 1], ps));
    if (r.ds.length > 1) out.xa = Object.assign(doiRaChan(r.ds[0], ps), { toi: true });
    return out;
  };
  // Các món ĐANG MẶC (ảnh AI) chưa hiệu chỉnh cho nhân vật key: chưa có điểm, không có điểm chung với thân, chưa duyệt (da_chinh).
  // o: (tuỳ chọn) đối tượng có outfit như khi vẽ em bé. Trả về [{ ma, o, look, ly_do: [...] }]. Game không hiện gì; công cụ dùng để cảnh báo.
  SC.chuaChinh = function (key, o) {
    const TL = G.tinhLinh, L = G.heroLooks;
    if (!TL || !L) return [];
    key = TL.HERO[key] ? key : 'smith';
    const of = TL.outfitOf(key, o || {}), ds = [];
    for (const m of [['hats', of.hat], ['robes', of.robe], ['backs', of.back], ['hands', of.hand], ['masks', of.mask], ['wings', of.wing && of.wing.kind]]) {
      const it = m[1] && L[m[0]] && L[m[0]][m[1]];
      if (!it || !it.tuVe || !it.ma || !doSan(it.ma)) continue;
      const r = SC.datDo(key, it.ma, 'idle', 0, { outfit: (o && (o.outfit || (o.p && o.p.outfit))) || undefined }), ly = [];
      if (!r) continue;
      if (!doSan(it.ma).tp.diem) ly.push('mon-chua-co-diem'); else if (r.chua_chinh) ly.push('khong-co-diem-chung');
      if (r.uoc_luong) ly.push('uoc-luong');
      if (!r.da_chinh) ly.push('chua-duyet');
      if (ly.length) ds.push({ ma: it.ma, o: m[0], look: m[1], ly_do: ly });
    }
    return ds;
  };
  // Vũ khí: chỉnh theo cặp nhân vật + vũ khí (khoá: mã tệp vũ khí, "vk-<loại>-<dòng>", "vk-<loại>"; cụ thể nhất thắng), gộp "theo".
  // Trả về { dx, dy, xoay, bam } hoặc null. Chỉ dời / xoay hình vũ khí quanh điểm cầm, không đổi đòn đánh.
  // (anim, f): thân code thì là động tác và khung của khung xương; thân AI thì là hàng và khung ẢNH AI đang vẽ (SC.khungVk), để
  // "tele:3", "atk:0", "hit:2" trong tệp ghép chỉ đúng khung hình người chơi đang thấy.
  // bam (Đợt 5, tuỳ chọn): tên điểm neo của thân mà bàn tay nắm vũ khí bám vào (js/hero_tinhlinh.js vkGhep); null: chỉ dời / xoay như cũ.
  SC.capVuKhi = function (key, w, type, anim, f) {
    const g = SC.ghep[key];
    if (!g || !g.coVk || !type) return null;
    let wo = null, ma = null;
    try { wo = G.weaponArt && G.weaponArt.fromWeapon ? G.weaponArt.fromWeapon(w) : null; const s = wo && SC.timVuKhi(wo); ma = s && s.ma; } catch (e) { wo = null; }
    const ks = [ma, wo ? 'vk-' + type + '-' + (wo.family | 0) : null, 'vk-' + type];
    let k = null; for (const q of ks) if (q && g.cap[q]) { k = q; break; }
    if (!k) return null;
    const c = SC.capTheo(key, k, { ten: anim, i: f });
    if (!c || (!c.dx && !c.dy && !c.xoay && !c.bam)) return null;
    return { dx: c.dx || 0, dy: c.dy || 0, xoay: c.xoay || 0, bam: c.bam || null, bam_vk: c.bam_vk || null, khoa: k };
  };
  // Thân AI đang vẽ cho đối tượng o (như khi vẽ em bé): hàng, khung ảnh AI và điểm neo của khung đó (toạ độ tính từ chân), để vũ khí
  // chỉnh theo đúng khung ảnh AI. null: nhân vật chưa có tệp ghép chỉnh vũ khí, hoặc không dùng thân AI (khi đó game làm y như cũ).
  // Phiên 3: đang ở hàng đòn theo vũ khí thì luôn trả về (kể cả khi chưa có tệp ghép), kèm bàn tay trước tự đo (SC.diemKhung).
  SC.khungVk = function (o) {
    const key = o && o.key, g = SC.ghep[key], coVk = !!(g && g.coVk);
    if (!G.tinhLinh || (!coVk && !G.DON_VK)) return null;
    const sp = SC.cuaEmBe(key, o);
    if (!sp || !sp.img) return null;
    try {
      const s = SC.chonEmBe(sp, o);
      if (!coVk && !LA_DON[s.ten]) return null;
      const da = SC.diemKhung(sp, key, s.ten, s.i, SC.khopEmBe(sp, s.ten, s.i));
      return { ten: s.ten, i: s.i, diem: da ? da.diem : null };
    } catch (e) { return null; }
  };
  SC.MOC_TRANG_PHUC = { hats: 'H', masks: 'H', robes: 'B', backs: 'B', hands: 'B', wings: 'vai' };
  function noiTrangPhuc(sp) {
    const L = G.heroLooks, t = sp.tp; if (!L || !L[t.o]) return;
    const cu = L[t.o][t.look];
    // Ảnh riêng của cánh cấp 1 / cấp 3 KHÔNG thay ảnh cấp 2: đã có ảnh đứng tên loại cánh này thì thôi (lúc vẽ nó tự tìm ảnh theo cấp).
    // Chưa có ảnh nào thì tệp này đứng tên: cấp có ảnh vẽ ảnh, cấp còn lại vẽ code như cũ.
    if (capCanh(sp) && cu && cu.tuVe) return;
    if (t.cu === undefined) t.cu = cu && cu.tuVe ? cu.cuGoc || null : cu || null;
    const o = dinhNghia(sp); o.cuGoc = t.cu;
    L[t.o][t.look] = o;
  }

  // ---------- VẬT PHẨM ----------
  SC.vatPham = (kind) => (kind ? doSan('vp-' + kind) : null);
  // Vẽ vật phẩm vừa trong ô vuông size, tâm (cx, cy).
  SC.veVatPham = function (c, sp, cx, cy, size) {
    const w = sp.rong, h = sp.cao; let k = size / Math.max(w, h); if (k >= 1) k = Math.floor(k);
    const sm = c.imageSmoothingEnabled; c.imageSmoothingEnabled = false;
    c.drawImage(sp.img, Math.round(cx - (w * k) / 2), Math.round(cy - (h * k) / 2), Math.round(w * k), Math.round(h * k));
    c.imageSmoothingEnabled = sm;
  };
  let lanNoi = 0;
  function noiVatPham() {
    const T = G.theme;
    if (!T || !T.resIcon) { if (lanNoi++ < 50 && typeof setTimeout !== 'undefined') setTimeout(noiVatPham, 50); return; }
    if (T._spriteCustom) return;
    T._spriteCustom = true;
    const res0 = T.resIcon;
    T.resIconCode = res0;
    T.resIcon = function (kind, x, y, h) {
      const sp = SC.vatPham(kind); if (!sp) return res0.apply(this, arguments);
      h = h || 7; SC.veVatPham(G.ux, sp, x + h / 2, y + h / 2, h);
    };
  }

  // ---------- GIAO DIỆN (ảnh AI cho bản đồ, nút…; tools/tach-giao-dien) ----------
  // Tệp: { "doi_tuong": "giao-dien", "ma": "gd-<tên>", "anh": "data:image/png;base64,…", "net": 2, "vien": [trên, phải, dưới, trái] }
  //   anh: MỘT ảnh tĩnh, số điểm ảnh gấp net lần cỡ game.   vien (tuỳ chọn, điểm ảnh GAME): cắt 9 mảnh, bốn góc giữ nguyên cỡ,
  //   cạnh và ruột kéo giãn (khung bản đồ to).
  // Mã đang dùng (js/minimap.js): gd-phong-<loại phòng> (12 biểu tượng), gd-o-phong, gd-o-phong-cur, gd-loi-noi, gd-khung-ban-do.
  // Không có tệp gd-* nào thì game vẽ bằng code y như cũ.
  SC.gd = {};
  function themGd(tep) {
    if (!/^gd-[a-z0-9_-]+$/.test(tep.ma)) throw new Error('mã giao diện phải là gd-<tên>');
    const g = { ma: tep.ma, ten: String(tep.ten || tep.ma), doi: 'giao-dien', net: docNet(tep.net), rong: 0, cao: 0, pw: 0, ph: 0, img: null, ready: false, vien: null, ghep9: new Map() };
    if (Array.isArray(tep.vien) && tep.vien.length === 4 && tep.vien.every((v) => isFinite(+v) && +v >= 0)) {
      g.vien = tep.vien.map((v) => Math.min(400, Math.round(+v)));
      if (!g.vien.some((v) => v > 0)) g.vien = null;
    }
    const xong = (src) => {
      g.img = src; g.pw = src.width; g.ph = src.height; g.rong = Math.max(1, Math.round(src.width / g.net)); g.cao = Math.max(1, Math.round(src.height / g.net));
      g.ghep9.clear(); g.ready = true;
    };
    SC.gd[g.ma] = g;
    if (tep.anhCanvas && tep.anhCanvas.getContext) xong(tep.anhCanvas); // công cụ đưa thẳng canvas (vẽ ngay, không chờ)
    else {
      if (typeof tep.anh !== 'string' || tep.anh.indexOf('data:image/png;base64,') !== 0) { delete SC.gd[g.ma]; throw new Error('thiếu ảnh'); }
      if (typeof Image !== 'undefined') { const img = new Image(); img.onload = () => xong(img); img.onerror = () => { SC.loi.push(g.ma + ': ảnh hỏng'); if (SC.gd[g.ma] === g) delete SC.gd[g.ma]; }; SC.napAnh(img, tep.anh); }
    }
    return g;
  }
  SC.gdSan = (ma) => { const g = SC.gd[ma]; return g && g.ready ? g : null; };
  // Ảnh 9 mảnh dựng sẵn cho cỡ đích (w x h điểm ảnh game): một canvas w*net x h*net, nhớ lại để lần sau vẽ một phát.
  function gdGhep9(g, w, h) {
    const N = g.net, W = Math.max(1, Math.round(w * N)), H = Math.max(1, Math.round(h * N)), key = W + 'x' + H;
    let cv = g.ghep9.get(key); if (cv) return cv;
    if (g.ghep9.size > 6) g.ghep9.clear();
    cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
    // viền theo điểm ảnh THẬT; chật quá thì thu viền cho vừa
    let t = g.vien[0] * N, r = g.vien[1] * N, b = g.vien[2] * N, l = g.vien[3] * N;
    const giu = (a, b2, max, src) => { const m = Math.min(max, src - 1); if (a + b2 > m) { const k = m / (a + b2); return [Math.floor(a * k), Math.floor(b2 * k)]; } return [a, b2]; };
    [l, r] = giu(l, r, W, g.pw); [t, b] = giu(t, b, H, g.ph);
    const sx = [0, l, g.pw - r], sw = [l, g.pw - l - r, r], dx = [0, l, W - r], dw = [l, W - l - r, r];
    const sy = [0, t, g.ph - b], sh = [t, g.ph - t - b, b], dy = [0, t, H - b], dh = [t, H - t - b, b];
    for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) if (sw[i] > 0 && sh[j] > 0 && dw[i] > 0 && dh[j] > 0) c.drawImage(g.img, sx[i], sy[j], sw[i], sh[j], dx[i], dy[j], dw[i], dh[j]);
    g.ghep9.set(key, cv);
    return cv;
  }
  // Vẽ ảnh giao diện vào ô (x, y, w, h) theo toạ độ đang dùng của bút c. Có "vien" thì cắt 9 mảnh, không thì kéo giãn cả ảnh.
  // Phóng to thì giữ điểm ảnh sắc cạnh; thu nhỏ hơn ảnh gốc thì làm mịn để không rụng nét.
  SC.veGd = function (c, g, x, y, w, h) {
    if (!g || !g.ready || w <= 0 || h <= 0) return false;
    const src = g.vien && (Math.abs(w - g.rong) > 0.01 || Math.abs(h - g.cao) > 0.01) ? gdGhep9(g, w, h) : g.img;
    const us = c === G.ux ? G.uiScale || 1 : c === G.wx ? G.NET || 1 : 1, sm = c.imageSmoothingEnabled;
    c.imageSmoothingEnabled = w * us < src.width - 0.5 || h * us < src.height - 0.5;
    c.drawImage(src, x, y, w, h);
    c.imageSmoothingEnabled = sm;
    return true;
  };

  // Hàm vẽ bằng code (bỏ qua hình tự vẽ), cho công cụ so sánh.
  if (G.monsterArt && !G.monsterArt.drawCode) G.monsterArt.drawCode = G.monsterArt.draw;
  if (G.art && G.art.hero && !G.art.heroCode) G.art.heroCode = G.art.hero;
  SC.noi = true;
  // Tệp do game/build.py nhúng vào bản đóng gói.
  if (Array.isArray(G.customSpriteData)) { for (const t of G.customSpriteData) SC.add(t); delete G.customSpriteData; }

  // ---------- ẢNH TẢI SAU (Đợt 10, quyết định Q5) ----------
  // Bản đóng gói 2 tệp (python3 game/build.py --hai-tep): trang chỉ nhúng phần ảnh BẮT BUỘC cho màn chào / làng / ải 1; phần còn lại
  // (quái, trùm, vũ khí các dòng, hiệu ứng theo hệ…) nằm trong tệp linh-khi-anh.<mã>.json đặt cạnh trang. build.py ghi G.ANH_SAU = { tep, so, byte }.
  // - js/engine.js gọi SC.napSau() ngay sau khi khung hình đầu (màn chào) đã vẽ, rồi vẽ một chỉ báo nhỏ ở góc trong lúc tải (SC.sau).
  // - Tệp là mảng JSON MỖI HÌNH MỘT DÒNG: dòng nào về tới thì nhận hình đó luôn (SC.add như hình nhúng), không chờ cả tệp.
  // - Tải hỏng (mất mạng, 404, tệp cụt, nội dung lạ): GIỮ phần đã nhận, không báo lỗi lên màn chơi, ghi console.info, thử lại 2 lần (sau 3 giây và 10 giây).
  //   Vẫn không được thì thôi: hình thiếu vẽ bằng code như khi chưa có ảnh AI. Có mạng trở lại thì thử thêm một lượt.
  // - Bản một tệp, công cụ Xưởng Sprite, bản thử: không có G.ANH_SAU → không làm gì (SC.sau.tt = 'khong').
  // SC.sau.tt: 'khong' không có tệp phụ · 'cho' chưa bắt đầu · 'tai' đang tải · 'thu-lai' đang chờ thử lại · 'xong' · 'loi' (đã thôi).
  const KS = G.ANH_SAU && typeof G.ANH_SAU.tep === 'string' && /^[A-Za-z0-9._-]{1,80}$/.test(G.ANH_SAU.tep) ? G.ANH_SAU : null;
  const AS = (SC.sau = { tt: KS ? 'cho' : 'khong', tep: KS ? KS.tep : '', xong: 0, tong: KS ? KS.so | 0 : 0, lan: 0, loi: '', hetLuc: 0 });
  const CHO_THU = [3000, 10000], IM_LANG = 30000; // IM_LANG: quá 30 giây không thêm byte nào thì coi lượt đó hỏng
  if (G.ngonNgu && G.ngonNgu.them) G.ngonNgu.them({ 'Đang tải thêm ảnh… {0}%': 'Loading more art… {0}%', 'Mạng yếu: thiếu vài ảnh, game vẫn chơi bình thường': 'Weak network: some art is missing, the game still plays fine' });
  const ghi = (s) => { try { if (typeof console !== 'undefined' && console.info) console.info('[Linh Khí] ' + s); } catch (e) { /* bỏ qua */ } };
  const nghi = (ms) => new Promise((r) => setTimeout(r, ms));
  const daNhan = new Set();
  // Hình tải sau sẵn sàng muộn hơn lúc game đã vẽ: xoá các hình đã nhớ (em bé + đồ, vật rơi, vỏ phòng, mảnh giao diện) để dựng lại với ảnh mới.
  function xoaNhoSau(het) {
    xoaNhoDo();
    if (!het) return;
    try { if (G.roomArt && G.roomArt.xoaDem) G.roomArt.xoaDem(); } catch (e) { /* bỏ qua */ }
    try { if (G.theme && G.theme.clearCache) G.theme.clearCache(); } catch (e) { /* bỏ qua */ }
  }
  function demSan() { let n = 0; for (const k in SC.ds) if (SC.ds[k].ready) n++; for (const k in SC.do) if (SC.do[k].ready) n++; return n; }
  function nhanDong(s) {
    s = s.trim();
    if (!s || s === '[' || s === ']') return;
    if (s.charCodeAt(s.length - 1) === 44) s = s.slice(0, -1); // dấu phẩy cuối dòng
    let t; try { t = JSON.parse(s); } catch (e) { throw new Error('dòng hỏng hoặc tệp cụt'); } // dòng hỏng: cả lượt tải coi như hỏng (phần đã nhận vẫn giữ)
    if (!t || typeof t !== 'object' || typeof t.ma !== 'string') throw new Error('dòng không phải hình');
    if (daNhan.has(t.ma)) return; // lượt thử lại: hình đã nhận rồi thì bỏ qua
    daNhan.add(t.ma);
    trongNapSau = true; // V3: ảnh của dòng này giải mã ngoài luồng chính (SC.napAnh)
    try { SC.add(t); } finally { trongNapSau = false; }
    AS.xong = daNhan.size;
    return true;
  }
  // V3: chờ tới sau khung hình kế tiếp (đã vẽ xong), để mỗi khung chỉ nhận vài hình; trang ẩn (không có khung) thì chờ 100 ms.
  const choKhung = () => new Promise((r) => {
    let xong = false; const f = () => { if (!xong) { xong = true; r(); } };
    try { requestAnimationFrame(() => setTimeout(f, 0)); } catch (e) { /* bỏ qua */ }
    setTimeout(f, 100);
  });
  async function taiMotLuot() {
    const ngat = typeof AbortController !== 'undefined' ? new AbortController() : null;
    let hen = 0;
    const canh = () => { clearTimeout(hen); if (ngat) hen = setTimeout(() => ngat.abort(), IM_LANG); };
    try {
      canh();
      const res = await fetch(AS.tep, ngat ? { signal: ngat.signal } : undefined);
      if (!res.ok) throw new Error('máy chủ trả ' + res.status);
      let du = '', dau = false, moc = Date.now(), soHinh = 0;
      const nhan = async (chu, het) => {
        du += chu;
        const ds = du.split('\n'); du = het ? '' : ds.pop();
        for (const d of ds) {
          if (!dau && d.trim()) { dau = true; if (d.trim() !== '[') throw new Error('nội dung không phải tệp ảnh'); } // ví dụ sw.js trả trang HTML khi mất mạng
          const moi = nhanDong(d);
          if (G.NAP_SAU_MOI) { // V3: mỗi khung nhiều nhất 3 hình hoặc 5 ms, rồi nhường cho khung hình sau
            if (moi) soHinh++;
            if (soHinh >= 3 || Date.now() - moc > 5) { await choKhung(); moc = Date.now(); soHinh = 0; }
          } else if (Date.now() - moc > 6) { await nghi(0); moc = Date.now(); } // nhường khung hình: không làm giật game đang chạy
        }
      };
      if (res.body && res.body.getReader && typeof TextDecoder !== 'undefined') {
        const doc = res.body.getReader(), giai = new TextDecoder();
        for (;;) { const { done, value } = await doc.read(); if (done) break; canh(); await nhan(giai.decode(value, { stream: true }), false); }
        await nhan(giai.decode(), true);
      } else await nhan(await res.text(), true);
      if (daNhan.size < AS.tong) throw new Error('tệp cụt: mới có ' + daNhan.size + '/' + AS.tong + ' hình');
    } finally { clearTimeout(hen); }
  }
  // Máy đã lưu tệp ảnh của bản cũ (sw.js lưu mọi tệp để chơi khi mất mạng): xoá để không đầy máy. Chỉ đụng tệp linh-khi-anh.* khác tên hiện tại.
  function donBanCu() {
    try {
      if (typeof caches === 'undefined' || !caches.keys) return;
      caches.keys().then((ten) => ten.forEach((n) => caches.open(n).then((c) => c.keys().then((ks) => ks.forEach((k) => {
        if (/\/linh-khi-anh\.[0-9a-f]+\.json(\?|$)/.test(k.url) && k.url.indexOf('/' + AS.tep) < 0) c.delete(k);
      }))))).catch(() => {});
    } catch (e) { /* bỏ qua */ }
  }
  let dangChay = false;
  async function chayNapSau() {
    if (dangChay) return;
    dangChay = true;
    let san = -1;
    napSauDangChay = true;
    // Cách cũ (tắt V3): cứ 400 ms có hình mới là xoá hình đã nhớ của em bé + đồ. V3: chỉ xoá khi hình mới đang được dùng (xoaNhoDoKhiCan).
    const theoDoi = G.NAP_SAU_MOI ? 0 : setInterval(() => { const n = demSan(); if (n !== san) { san = n; xoaNhoSau(false); } }, 400);
    try {
      for (let lan = 0; lan <= CHO_THU.length; lan++) {
        AS.lan++; AS.tt = 'tai';
        try {
          await taiMotLuot();
          AS.tt = 'xong'; AS.loi = '';
          ghi('Đã tải xong ' + AS.tong + ' ảnh tải sau (' + AS.tep + ').');
          donBanCu();
          break;
        } catch (e) {
          AS.loi = String((e && e.message) || e);
          ghi('Chưa tải được tệp ảnh ' + AS.tep + ' (lượt ' + AS.lan + '): ' + AS.loi + '. Đã nhận ' + daNhan.size + '/' + AS.tong + ' hình; game vẫn chạy, hình thiếu vẽ bằng code.');
        }
        if (lan < CHO_THU.length) { AS.tt = 'thu-lai'; await nghi(CHO_THU[lan]); }
      }
      if (AS.tt !== 'xong') {
        AS.tt = 'loi'; AS.hetLuc = Date.now();
        ghi('Thôi không tải tệp ảnh nữa (đã thử ' + AS.lan + ' lượt). Mở lại game khi mạng tốt hơn để có đủ ảnh.');
        try { window.addEventListener('online', () => { chayNapSau(); }, { once: true }); } catch (e) { /* bỏ qua */ }
      }
    } finally {
      dangChay = false;
      // ảnh còn giải mã thêm vài nhịp sau khi dòng cuối về: theo dõi thêm 3 giây rồi xoá hình đã nhớ một lần cuối
      setTimeout(() => { clearInterval(theoDoi); napSauDangChay = false; xoaNhoSau(true); }, 3000);
    }
  }
  // Gọi nhiều lần cũng chỉ chạy một lần. Không có tệp phụ, hoặc trình duyệt không có fetch (rất cũ): không làm gì.
  SC.napSau = function () {
    if (!KS || AS.tt !== 'cho') return;
    if (typeof fetch !== 'function' || typeof Promise === 'undefined') { AS.tt = 'loi'; AS.loi = 'trình duyệt không có fetch'; AS.hetLuc = Date.now(); ghi('Trình duyệt không tải được tệp ảnh rời: hình thiếu vẽ bằng code.'); return; }
    chayNapSau().catch((e) => { AS.tt = 'loi'; AS.loi = String((e && e.message) || e); AS.hetLuc = Date.now(); });
  };
  // Chỉ báo nhỏ ở góc (js/engine.js gọi sau khi vẽ xong cảnh): { pct } đang tải; { loi: true } vừa thôi (hiện 6 giây); null: không vẽ gì.
  SC.sauChiBao = function () {
    if (AS.tt === 'tai' || AS.tt === 'thu-lai') return { pct: AS.tong > 0 ? Math.min(99, Math.floor(AS.xong / AS.tong * 100)) : 0 };
    if (AS.tt === 'loi' && AS.hetLuc && Date.now() - AS.hetLuc < 6000) return { loi: true };
    return null;
  };
})();
