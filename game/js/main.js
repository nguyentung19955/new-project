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
      const cho = lk && lk.media === 'print' ? new Promise((r) => { lk.addEventListener('load', r); lk.addEventListener('error', r); }) : Promise.resolve();
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
