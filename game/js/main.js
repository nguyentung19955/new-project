// Khởi động game.
(function () {
  const G = window.G;
  G.loadSave();
  let started = false;
  function start() {
    if (started) return;
    started = true;
    G.setScene(G.Title);
    G.run();
  }
  // Chờ phông chữ một chút cho đẹp, nhưng không chờ quá 1,2 giây.
  // Phiên hiệu năng (V11): thẻ phông chữ Google không chặn vẽ nữa (media="print", tải xong mới bật): mạng chặn Google thì game không phải
  // chờ hết thời gian chờ mới chạy. Ở đây chờ tệp CSS phông về (hoặc lỗi) rồi mới nạp phông, trong cùng hạn 1,2 giây như cũ.
  try {
    if (document.fonts && document.fonts.load) {
      const lk = document.querySelector('link[href*="fonts.googleapis.com"]');
      // Phiên hiệu năng 13/10: tệp CSS phông đã LỖI trước khi tệp này chạy (mạng chặn Google, chơi ngoại tuyến): sự kiện 'error' đã qua,
      // chờ nữa chỉ phí trọn 1,2 giây trước màn chào → vào ngay (index.html ghi dấu data-loi ở onerror). Phông dự phòng như khi hết giờ chờ.
      const cho = lk && lk.media === 'print' && !(lk.dataset && lk.dataset.loi) ? new Promise((r) => { lk.addEventListener('load', r); lk.addEventListener('error', r); }) : Promise.resolve();
      Promise.race([
        cho.then(() => document.fonts.load('700 12px "Be Vietnam Pro"')),
        new Promise((r) => setTimeout(r, 1200)),
      ]).then(start, start);
    } else start();
  } catch (e) { start(); }
})();

// Thêm vào màn hình chính: đăng ký sw.js (chỉ có trên spiritblade.web.app) để máy mở game như ứng dụng, toàn màn hình.
// Không chạy trong khung nhúng (bản xem trước) hay khi mở tệp trên máy; không có sw.js thì bỏ qua, không báo lỗi.
(function () {
  try {
    if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol) || window.top !== window.self) return;
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
  } catch (e) { /* bỏ qua */ }
})();

// PWA bỏ thanh URL (15/10): Android mở từ màn hình chính mà máy không cho chế độ "fullscreen" của manifest (display-mode vẫn là standalone /
// minimal-ui, còn thanh trạng thái/thanh điều hướng) → lần chạm đầu tiên xin toàn màn hình. Chỉ chạy ở chế độ ứng dụng: mở trong trình duyệt thường
// thì không làm gì. iPhone (navigator.standalone) không có toàn màn hình kiểu này: iOS tự lo theo các thẻ apple-mobile-web-app-* trong index.html.
// Thoát toàn màn hình (vuốt, nút "Toàn màn hình" ở Anh Mõ) thì để yên tới lần mở lại game sau (quay lại từ ứng dụng khác).
(function () {
  try {
    const mm = (q) => !!(window.matchMedia && window.matchMedia(q).matches);
    if (window.top !== window.self || navigator.standalone === true || mm('(display-mode: fullscreen)')) return;
    if (!(mm('(display-mode: standalone)') || mm('(display-mode: minimal-ui)'))) return;
    const el = document.documentElement;
    if (!el.requestFullscreen) return;
    let cho = true;
    const thu = () => {
      if (!cho || document.fullscreenElement) return;
      cho = false;
      try { const p = el.requestFullscreen({ navigationUI: 'hide' }); if (p && p.catch) p.catch(() => {}); } catch (e) { /* máy không cho: bỏ qua */ }
    };
    for (const t of ['pointerup', 'touchend', 'click', 'keydown']) window.addEventListener(t, thu, { capture: true, passive: true });
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && !document.fullscreenElement) cho = true; });
  } catch (e) { /* bỏ qua */ }
})();
