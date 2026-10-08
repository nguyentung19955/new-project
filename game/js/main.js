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
