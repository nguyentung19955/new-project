// PHÔNG CHỮ CHỦ ĐỀ TALESWORN (phiên E, 05/11/2026; docs/review/ke-hoach-cai-thien/talesworn-e-phong/bao-cao.md).
// Chủ đề cổ tích châu Âu "The Unwritten Tales": ba vai phông, nhúng sẵn trong game (js/phong_data.js, woff2 thu gọn, giấy phép SIL OFL 1.1):
//   - 'td'   TIÊU ĐỀ  — Grenze Gotisch (chữ gô-tích sách cổ, ĐỦ dấu tiếng Việt): logo TALESWORN, tên bảng, tên trùm, tên người nói, tên chương.
//   - 'than' THÂN CHỮ — Alegreya Sans (chữ sách nhân văn, ĐỦ dấu tiếng Việt, dễ đọc ở cỡ nhỏ): nút, hộp thoại, HUD, mọi chữ còn lại.
//   - 'so'   SỐ       — Silkscreen (chữ điểm ảnh, KHÔNG có dấu tiếng Việt): số sát thương / số nhỏ, CHỈ khi chuỗi toàn số + ký hiệu.
// QUY TẮC RƠI PHÔNG: (1) vai 'so' mà chuỗi có chữ cái (vd. "Sạch bóng quái!", "+3 Lửa") → cả chuỗi dùng phông THÂN (Alegreya Sans), không trộn
// phông trong một chuỗi; (2) ký tự không có trong phông tiêu đề (★ ✕ ▶ …) → trình duyệt lấy ký tự đó từ phông thân, rồi Be Vietnam Pro, rồi phông máy.
// Cỡ: mỗi vai nhân một hệ số (K) để chiều cao chữ thường (x-height) ≈ Be Vietnam Pro cũ → bố cục giữ như trước, hàm căn chữ đo lại theo phông mới.
// CỜ QUAY LUI ?phongcu=1: không nạp phông mới, mọi chữ vẽ bằng Be Vietnam Pro y như trước phiên (G.phong = null).
(function () {
  const G = window.G;
  const ui = G.ui;
  let cu = false;
  try { cu = /[?&]phongcu=1(&|$)/.test(String(window.location && window.location.search)); } catch (e) { cu = false; }
  G.PHONG_CU = cu;
  G.phong = null;
  const DATA = G.PHONG_DATA;
  if (cu || !ui || !DATA || typeof document === 'undefined' || !document.fonts || typeof FontFace === 'undefined' || typeof atob === 'undefined') return;
  const DU = ', "Be Vietnam Pro", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  const HO = { than: '"TW Than"' + DU, td: '"TW Tieu De", "TW Than"' + DU, so: '"TW So", "TW Than"' + DU };
  const K = { than: 1.12, td: 1.15, so: 1 };
  const SO_RE = /^[\d\s+\-−×%!.,:/()#]+$/; // chuỗi Silkscreen vẽ được (toàn số / ký hiệu)
  const P = { vai: 'than', HO, K };
  // nạp phông từ dữ liệu nhúng (không cần mạng): nhanh, xong trong vài mili giây
  const cho = [];
  try {
    for (const d of DATA) {
      const bin = atob(d.b64), u8 = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      const f = new FontFace(d.ho, u8.buffer, { weight: d.net, style: 'normal', display: 'block' });
      document.fonts.add(f);
      cho.push(f.load().catch(() => null));
    }
  } catch (e) { return; } // trình duyệt không nhận phông nhúng: giữ phông cũ
  P.san = Promise.all(cho).then(() => Promise.all([
    document.fonts.load('700 12px "TW Tieu De"'), document.fonts.load('500 12px "TW Than"'),
    document.fonts.load('700 12px "TW Than"'), document.fonts.load('700 12px "TW So"'),
  ])).catch(() => null);
  // vai thật cho chuỗi s (s không biết: theo vai)
  P.chon = (vai, s) => (vai === 'so' && s != null && !SO_RE.test(String(s)) ? 'than' : HO[vai] ? vai : 'than');
  P.ho = (vai) => HO[vai] || HO.than;
  P.k = (vai) => K[vai] || 1;
  // chuỗi font canvas: nét, cỡ (đơn vị game, chưa nhân hệ số), vai, chuỗi sẽ vẽ (để rơi phông)
  P.font = (bold, px, vai, s) => { const v = P.chon(vai || P.vai, s); return (bold ? '700 ' : '500 ') + px * K[v] + 'px ' + HO[v]; };
  // vẽ / đo trong vai khác (vd. tiêu đề) rồi trả lại vai cũ
  P.voi = function (vai, fn) {
    const cu0 = P.vai;
    P.vai = HO[vai] ? vai : 'than';
    try { return fn(); } finally { P.vai = cu0; }
  };
  G.phong = P;
  // mọi chữ giao diện đi qua ui.font (engine.js): đổi họ phông + hệ số cỡ theo vai đang bật
  ui.FONT = HO.than;
  ui.font = function (size, bold, tiny) {
    const v = P.vai;
    G.ux.font = (bold ? '700 ' : '500 ') + ui.fs(size, tiny) * K[v] + 'px ' + HO[v];
  };
  // chữ HTML (khung đăng nhập / lưu mây / góp ý, màn tải): cùng phông thân (chỉ đổi họ phông, không đụng gì khác)
  try {
    const st = document.createElement('style');
    st.textContent = 'body{font-family:' + HO.than + '}#lk-ov,#lk-ov *{font-family:' + HO.than + '!important}';
    (document.head || document.documentElement).appendChild(st);
  } catch (e) { /* bỏ qua */ }
})();
