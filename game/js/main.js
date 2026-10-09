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
  try {
    if (document.fonts && document.fonts.load) {
      Promise.race([
        document.fonts.load('700 12px "Be Vietnam Pro"'),
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
