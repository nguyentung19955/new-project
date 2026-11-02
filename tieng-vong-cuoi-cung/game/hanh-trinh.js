'use strict';
/* hanh-trinh.js – MỘT HÀNH TRÌNH (phiên "Khởi đầu – đợt 1", theo docs/khoi-dau/tu-van-chatgpt.txt mục 2, 4).
   Chỉ dữ liệu + logic, KHÔNG vẽ. Không đổi cấu trúc lưu cũ: đọc các khoá sẵn có (tvcc-chung, tvcc-vung1, tvcc-vung2…).
   - coLuu(kho): đã có hành trình trên máy chưa (→ màn tiêu đề hiện CONTINUE hay chỉ NEW GAME).
   - noiTiep(kho): CONTINUE đi đâu = nơi an toàn cuối (LuuChung.noiCuoi: 'lang' | 'vung-1' | 'vung-2'); vùng tự vào Chuông Lưu cuối.
   - tomTat(doc): {noi, ten, chiTiet, giay, trum, t} để hiện dòng trạng thái + thẻ so sánh khi xung đột mây.
   - moi(kho): NEW GAME = sao lưu toàn bộ khoá game vào 'tvcc-sao-luu-hanh-trinh' rồi xoá chúng.
   Trình duyệt: window.HanhTrinh; Node (phép thử): require('./hanh-trinh.js'). */
(function(goc){
  const KHOA_GAME = ['tvcc-chung', 'tvcc-vung1', 'tvcc-vung2', 'tvcc-he-thong', 'tvcc-an', 'tvcc-trang-bi-v1'];
  const KHOA_SAO = 'tvcc-sao-luu-hanh-trinh';
  const TEN = {'lang':'Bell Village', 'vung-1':'Weeping Heartwood', 'vung-2':'Rotting Roots'};
  const TRANG = {'lang':'lang-chuong/index.html', 'vung-1':'vung-1/index.html', 'vung-2':'vung-2/index.html'};
  const KHOA_VUNG = {'vung-1':'tvcc-vung1', 'vung-2':'tvcc-vung2'};

  const json = s => { try { return s ? JSON.parse(s) : null; } catch (e){ return null; } };
  const docKho = kho => k => { try { return kho ? kho.getItem(k) : null; } catch (e){ return null; } };

  function coLuu(kho){
    const d = docKho(kho);
    if (d('tvcc-vung1') || d('tvcc-vung2')) return true;
    const c = json(d('tvcc-chung'));
    return !!(c && ((c.daXem && c.daXem.length) || (c.vungVao && c.vungVao.length) || c.noiCuoi));
  }
  // nơi an toàn cuối: ưu tiên mốc LuuChung.noiCuoi, rồi vùng chơi gần nhất, rồi làng
  function noiCuoi(doc){
    const c = json(doc('tvcc-chung')) || {};
    let n = c.noiCuoi && c.noiCuoi.noi;
    if (!TRANG[n]) n = TRANG[c.vungCuoi] ? c.vungCuoi : null;
    if (!n) n = doc('tvcc-vung1') ? 'vung-1' : 'lang';
    return n;
  }
  function noiTiep(kho){ const n = noiCuoi(docKho(kho)); return {noi:n, trang:TRANG[n] + '?tiep=1', ten:TEN[n]}; }

  // tóm tắt một bản lưu (doc = k => chuỗi JSON); dùng cho dòng trạng thái + thẻ THIS DEVICE / CLOUD
  function tomTat(doc){
    const c = json(doc('tvcc-chung')) || {}, n = noiCuoi(doc);
    const v1 = json(doc('tvcc-vung1')), v2 = json(doc('tvcc-vung2'));
    const vung = n === 'vung-1' ? v1 : n === 'vung-2' ? v2 : null;
    const chiTiet = n === 'lang' ? '' : (vung && vung.chuong ? 'Rest Bell' : 'Entrance');
    const giay = Math.round((v1 && v1.giay || 0) + (v2 && v2.giay || 0));
    const co = c.co || {};
    const trum = Object.keys(co).filter(k => /^ha_trum:/.test(k) && co[k]).length || ((v1 && v1.trumHa ? 1 : 0) + (v2 && v2.trumHa ? 1 : 0));
    const t = Math.max(c.capNhat || 0, c.noiCuoi && c.noiCuoi.t || 0, c.nhanVat && c.nhanVat.t || 0) || null;
    return {noi:n, ten:TEN[n], chiTiet, giay, trum, t};
  }
  const chuNoi = s => s.ten + (s.chiTiet ? ' · ' + s.chiTiet : '');
  function chuTuoi(t, bayGio){
    if (!t) return '';
    const s = Math.max(0, ((bayGio || Date.now()) - t) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + ' min ago';
    if (s < 86400) return Math.floor(s / 3600) + ' h ago';
    const d = Math.floor(s / 86400); return d + (d === 1 ? ' day ago' : ' days ago');
  }
  const chuGio = g => { g = Math.round(g || 0); const h = Math.floor(g / 3600), m = Math.floor(g % 3600 / 60); return h ? h + ' h ' + m + ' min' : m + ' min'; };

  function saoLuu(kho, khoaSao){
    const d = docKho(kho), goi = {t:Date.now(), khoa:{}};
    for (const k of KHOA_GAME){ const v = d(k); if (v) goi.khoa[k] = v; }
    if (!Object.keys(goi.khoa).length) return false;
    try { kho.setItem(khoaSao || KHOA_SAO, JSON.stringify(goi)); return true; } catch (e){ return false; }
  }
  // NEW GAME: sao lưu trước (lỗi sao lưu → KHÔNG xoá), rồi xoá mọi khoá hành trình
  function moi(kho){
    if (coLuu(kho) && !saoLuu(kho)) return false;
    for (const k of KHOA_GAME){ try { kho.removeItem(k); } catch (e){} }
    return true;
  }

  const API = {KHOA_GAME, KHOA_SAO, TEN, TRANG, KHOA_VUNG, coLuu, noiCuoi:kho => noiCuoi(docKho(kho)), noiTiep, tomTat, chuNoi, chuTuoi, chuGio, saoLuu, moi};
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else goc.HanhTrinh = API;
})(typeof window !== 'undefined' ? window : globalThis);
