// HIỆU ỨNG DÍNH QUÁI (17/10, docs/review/ke-hoach-cai-thien/hieu-ung-dinh-quai/bao-cao.md phần B).
// Neo hiệu ứng nhắm vào quái theo THÂN THẬT của quái (hộp điểm ảnh đo sẵn ở js/dinh_quai_bang.js, từng con, từng pha trùm, hai mặt)
// thay cho chiều cao hình vẽ cũ e.h / các số cố định (16 điểm, chặn 60 điểm, cỡ tối đa 1,5). Chỉ đổi CHỖ VẼ và CỠ hình:
// không đổi sát thương, vùng trúng, thời lượng, luật chơi. Nơi dùng: js/fx.js (bodyOf, fx.entity, hit, dmg), js/fx_chuong.js (chHit, chBoom),
// js/fx_he.js (spPin), js/combat.js (biểu tượng trên đầu trùm), js/bo_skill.js (dây leo, vòng chậm).
// Cờ tắt: ?dinhquai=0 (G.DINH_QUAI = false) → mọi chỗ vẽ y hệt trước.
(function () {
  const G = window.G;
  if (!G) return;
  if (G.DINH_QUAI === undefined) { let tat = false; try { tat = /[?&]dinhquai=0(&|$)/.test(String(location.search || '')); } catch (e) { tat = false; } G.DINH_QUAI = !tat; }
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const OUT = { x0: 0, x1: 0, y0: 0, y1: 0, w: 0, h: 0, cx: 0 };
  // Hộp thân (điểm game, tính từ chân e.x, e.y; mặt hiện tại; pha hiện tại của trùm). null: không có số đo → nơi gọi vẽ như cũ.
  function than(e) {
    if (G.DINH_QUAI === false || !e || e.isPlayer) return null;
    const B = G.DINH_QUAI_BANG;
    if (!B) return null;
    let key = e.isBoss && e.kind !== 'mini' ? 'trum:' + e.kind : e.art;
    if (key === 'trum:thuong' && B['trum:thuongMoi'] && G.thuongLuong && G.thuongLuong.moiVe && G.thuongLuong.moiVe(e)) key = 'trum:thuongMoi'; // thuong-luong-that: ảnh thật 3 pha
    const T = key && B[key];
    if (!T || !T.length) return null;
    const p = e.isBoss ? clamp(e.phase | 0, 0, T.length - 1) : 0, m = e.face > 0 ? 1 : 0;
    const a = T[p] && T[p][m], g = T[0][m];
    if (!a || !g) return null;
    // Bề ngang lấy ở pha 1 (pha sau có thể kèm bóng phân thân / rễ / sóng quanh chân); đáy thân không xuống dưới chân quá 1 điểm.
    OUT.x0 = g[0]; OUT.x1 = g[1]; OUT.y0 = a[2]; OUT.y1 = Math.min(a[3], 1);
    // Khung ảnh vừa vẽ (ghiKhung): đỉnh / đáy thân theo đúng dáng đang vẽ (trùm cúi, vươn, quái phồng to…) thay cho dáng đứng thở trong bảng
    const K = e.__dqK;
    if (K && G.time - K.t <= 0.1 && K.y1 > K.y0) { OUT.y0 = K.y0; OUT.y1 = Math.min(K.y1, 1); }
    OUT.w = OUT.x1 - OUT.x0; OUT.h = Math.max(4, OUT.y1 - OUT.y0); OUT.cx = clamp((OUT.x0 + OUT.x1) / 2, -12, 12);
    return OUT;
  }
  // Độ cao (dương, tính từ chân) của chỗ đòn chạm thân: 16 điểm như cũ với quái thường, nhưng ít nhất 30 % và nhiều nhất 55 % chiều cao thân.
  function caoTrung(e) {
    const T = than(e);
    if (!T) return null;
    return -T.y1 + clamp(16, 0.3 * T.h, 0.55 * T.h);
  }
  // Thân đang bị nhấc lên (Địa Chấn hất tung — cùng công thức js/combat.js veQuaiDW)
  function nhac(e) {
    if (G.DINH_QUAI === false || !e || e.isPlayer || e.isBoss) return 0;
    return e.mvLift > 0 ? Math.round(Math.sin((e.mvLift / 0.45) * Math.PI) * 10) : 0;
  }
  // Quái đứng ở chỗ (x, y) (chỗ chưởng nổ): con gần nhất trong tầm thân
  function quaiTai(x, y) {
    if (G.DINH_QUAI === false || !G.targets) return null;
    let best = null, bd = 1e9;
    for (const e of G.targets()) {
      const d = Math.abs(e.x - x) - (e.r || 8), dy = Math.abs(e.y - y);
      if (d < 22 && dy < 22 && d + dy < bd) { bd = d + dy; best = e; }
    }
    return best;
  }
  // Hộp điểm ảnh đục (alpha ≥ 128) của một khung trong tấm sprite, theo điểm game tính từ góc trái trên của ô. Nhớ theo tấm + hàng + khung.
  const BB = new Map();
  function khungBB(sp, hang, i) {
    const key = sp.ma + '|' + hang + '|' + i;
    if (BB.has(key)) return BB.get(key);
    let r = null;
    try {
      const n = sp.net || 1, w = sp.fw * n, h = sp.fh * n, cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      const x = cv.getContext('2d', { willReadFrequently: true }); x.drawImage(sp.img, i * w, hang * h, w, h, 0, 0, w, h);
      const d = x.getImageData(0, 0, w, h).data;
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      for (let Y = 0; Y < h; Y++) for (let X = 0; X < w; X++) if (d[(Y * w + X) * 4 + 3] >= 128) { if (X < x0) x0 = X; if (X > x1) x1 = X; if (Y < y0) y0 = Y; if (Y > y1) y1 = Y; }
      if (x1 >= x0) r = [x0 / n, (x1 + 1) / n, y0 / n, (y1 + 1) / n];
    } catch (e) { r = null; }
    if (BB.size < 4000) BB.set(key, r);
    return r;
  }
  // js/sprite_custom.js (SC.veKhung) gọi ngay sau khi vẽ thân quái: ghi hộp thân của khung đang vẽ (tính từ gốc vẽ ≈ chân, đã gồm lật mặt
  // và co / giãn của bút) vào quái đang vẽ (G.fx.dangVe). Chỉ khung thân đầu tiên mỗi nhịp (bóng phân thân vẽ sau không tính).
  function ghiKhung(c, sp, hang, i, dx, dy) {
    if (G.DINH_QUAI === false || G.noRender) return;
    const e = G.fx && G.fx.dangVe;
    if (!e || e.isPlayer || e.__dqT === G.time || !c.getTransform) return;
    e.__dqT = G.time;
    const b = khungBB(sp, hang, i);
    if (!b) return;
    const T = c.getTransform(), n = G.NET || 1;
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const lx of [dx + b[0], dx + b[1]]) for (const ly of [dy + b[2], dy + b[3]]) {
      const X = (T.a * lx + T.c * ly) / n, Y = (T.b * lx + T.d * ly) / n;
      if (X < x0) x0 = X; if (X > x1) x1 = X; if (Y < y0) y0 = Y; if (Y > y1) y1 = Y;
    }
    const K = e.__dqK || (e.__dqK = { x0: 0, x1: 0, y0: 0, y1: 0, t: 0 });
    K.x0 = x0; K.x1 = x1; K.y0 = y0; K.y1 = y1; K.t = G.time;
  }
  G.dinhQuai = { than, caoTrung, nhac, quaiTai, ghiKhung, bat: () => G.DINH_QUAI !== false };
})();
