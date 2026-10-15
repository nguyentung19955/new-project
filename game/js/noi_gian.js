// NỔI GIẬN THẤY ĐƯỢC — docs/review/ke-hoach-cai-thien/noi-gian-manh/YEU-CAU.md (15/10).
// Luật (tốc, nghỉ, số đòn, nối chiêu, sát thương, di chuyển, mệt) ở js/boss.js, js/chieu_trum.js, js/mobs.js; mọi hệ số: G.NOI_GIAN (js/data.js).
// Tệp này: (1) tinh anh nổi giận ở ≤ 35% máu (một lần duy nhất), (2) dấu hiệu nhìn thấy BỀN SUỐT PHA: thân tô đỏ nhẹ có nhịp, quầng đỏ
// nhấp nháy dưới chân, đốm lửa giận bốc quanh thân (pha 3 / hóa cuồng: nhịp nhanh hơn, đỏ hơn, nhiều đốm hơn), (3) pha 3 của trùm vùng:
// màn hơi đỏ ở mép (rung nhẹ khi dậm nằm ở js/boss.js). Chỉ là HÌNH (trừ mục 1). (15/10 don-tep B: bỏ cờ tắt ?giancu=1 / G.NOI_GIAN_BAT.)
// Nạp sau js/fx.js, js/mobs.js, js/chieu_trum.js.
(function () {
  const G = window.G;
  if (!G) return;
  const W = () => G.getWorld();
  const BAT = () => !!G.NOI_GIAN;
  const NG = (G.noiGian = {});
  function FX(n, a, b, c, d, e) { if (G.noRender) return; const f = G.fx && G.fx[n]; if (f) f(a, b, c, d, e); }

  // ---------- mức giận của một con: 0 không, 1 nổi giận (trùm pha 2, trùm nhỏ pha 2, tinh anh), 2 hóa cuồng (trùm vùng pha 3) ----------
  NG.muc = function (e) {
    if (!BAT() || !e || e.dead || e.dying != null) return 0;
    if (e.isBoss) return e.phase >= 2 && e.kind !== 'mini' ? 2 : e.phase >= 1 ? 1 : 0;
    return e.ngGian ? 1 : 0;
  };

  // ---------- TINH ANH: nổi giận ở ≤ nguong máu, một lần ----------
  // Gọi mỗi khung từ js/mobs.js (G.mob.update). Trả về hệ số tốc chiêu (1 khi chưa giận / cờ tắt).
  NG.tinhAnh = function (e) {
    if (!BAT() || !e || e.role !== 'elite' || e.dead) return 1;
    const N = G.NOI_GIAN.tinhAnh;
    if (!e.ngGian && e.maxhp > 0 && e.hp > 0 && e.hp <= e.maxhp * N.nguong) {
      e.ngGian = true;
      e.dmg *= N.sat; // × sát thương (một lần)
      if (e.skCd > 0) e.skCd *= N.hoi; // chiêu riêng đang hồi: rút ngắn luôn
      FX('text', e.x, e.y - (e.h || 30) - 10, 'Nổi giận!', '#ff6a5a', 9); // chuỗi tĩnh: dịch lúc vẽ (tools/ngon-ngu/tu-dien/noi-gian.json)
      FX('burst', e.x, e.y - (e.h || 30) * 0.5, '#ff5a30', 12, 70);
      if (G.sfx) G.sfx('warn', 0.7);
    }
    return e.ngGian ? N.toc : 1;
  };
  NG.hoiTinhAnh = (e) => (BAT() && e && e.ngGian ? G.NOI_GIAN.tinhAnh.hoi : 1);
  // Báo trước của tinh anh khi nổi giận: T chia tốc, không ngắn hơn sàn công bằng (to: chiêu riêng — vùng to / nhiều đợt, 0,6 giây;
  // đòn thường 0,45 giây) và không dài hơn T cũ.
  NG.baoTinhAnh = function (e, T, to) {
    const k = NG.tinhAnh(e);
    if (k === 1) return T;
    return Math.min(T, Math.max(T / k, to ? G.NOI_GIAN.san.baoTo : G.NOI_GIAN.san.bao));
  };

  // ---------- HÌNH ----------
  const nhip = (lv) => 0.5 + 0.5 * Math.sin((G.time || 0) * (lv >= 2 ? 10 : 6.5));
  const TINT = ['#ff2a18', 0];
  // Tô đỏ thân có nhịp (o.tint của G.monsterArt.draw / ảnh AI); null khi không giận. Nhuộm hệ (nhịp độc / cháy) có trước thì giữ.
  NG.tint = function (e) {
    const lv = NG.muc(e);
    if (!lv) return null;
    const p = nhip(lv);
    TINT[1] = lv >= 2 ? 0.16 + 0.16 * p : 0.08 + 0.12 * p;
    return TINT;
  };
  const hh = (i, k) => { const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return s - Math.floor(s); };
  function rongCua(e) { return Math.max(10, Math.min(46, (e.isBoss && e.kind !== 'mini' ? (e.r || 30) * 1.25 : (e.r || 10) * 1.6))); }
  // Quầng đỏ dưới chân (vẽ TRƯỚC thân).
  NG.veDuoi = function (c, e) {
    const lv = NG.muc(e);
    if (!lv || G.noRender || e.hidden) return;
    const A = G.art, p = nhip(lv), rx = rongCua(e) * (1 + 0.08 * p), K = G.ZK || 0.85;
    // Con vẽ tay đợt 3 (YEU-CAU-3.md): quầng elip mờ giữ tạm ở đợt 2 → ảnh hu-hao-quang-gian (vòng lửa đỏ lặp 6 khung, vòng
    // rộng 40 khi co 1, neo tâm vòng) dưới chân: co = 2·rx·1,1 / 40 (vòng phủ quầng cũ, nhịp to nhỏ theo nhịp giận), lv 1 nhạt hơn lv 2.
    // Thân nhuộm đỏ có nhịp và màn đỏ ở mép (pha 3) giữ nguyên. Ảnh chưa tải: không vẽ gì dưới chân.
    const FA = G.fxAnh;
    if (FA && FA.co('hu-hao-quang-gian')) FA.ve(c, 'hu-hao-quang-gian', e.x, e.y, (G.time || 0) * (lv >= 2 ? 1.4 : 1) + (e.id || 0) * 0.13, 0, (2 * rx * 1.1) / 40, false, lv >= 2 ? 0.95 : 0.75);
  };
  // Đốm lửa giận bốc lên quanh thân: đợt 2 con-ve-tay đã tắt (đốm VUÔNG vẽ code); 15/10 don-tep B bỏ hẳn cùng cờ ?vetaycu=1. Giữ hàm rỗng cho nơi gọi.
  NG.veTren = function () {};

  // ---------- pha 3 (hóa cuồng): màn hơi đỏ ở mép ----------
  let VIG = null;
  function vien(c, a) {
    if (!VIG) {
      if (typeof document === 'undefined' || !document.createElement) return;
      VIG = document.createElement('canvas');
      VIG.width = 240; VIG.height = 135;
      const v = VIG.getContext('2d'), Wd = 240, H = 135, d = 22, col = 'rgba(200,16,8,';
      const side = (x0, y0, x1, y1, rx, ry, rw, rh) => { const g = v.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, col + '1)'); g.addColorStop(1, col + '0)'); v.fillStyle = g; v.fillRect(rx, ry, rw, rh); };
      side(0, 0, d, 0, 0, 0, d, H); side(Wd, 0, Wd - d, 0, Wd - d, 0, d, H);
      side(0, 0, 0, d * 0.6, 0, 0, Wd, d * 0.6); side(0, H, 0, H - d * 0.6, 0, H - d * 0.6, Wd, d * 0.6);
    }
    const ga = c.globalAlpha;
    c.globalAlpha = Math.min(1, a);
    c.drawImage(VIG, 0, 0, G.W, G.H);
    c.globalAlpha = ga;
  }
  NG.veMep = function () {
    if (!BAT() || G.noRender) return;
    const w = W(), b = w && w.boss;
    if (!b || b.dead || b.dying != null || b.kind === 'mini' || !(b.phase >= 2) || w.over) return;
    if (G.ux) vien(G.ux, 0.1 + 0.05 * Math.sin((G.time || 0) * 3));
  };
  if (G.fx && G.fx.drawUI) { const d0 = G.fx.drawUI; G.fx.drawUI = function (a, b) { try { NG.veMep(); } catch (e) { /* chỉ là hình */ } return d0.call(this, a, b); }; }
})();
