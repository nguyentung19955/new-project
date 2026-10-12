// Đo kiếm che mặt trong TRẬN THẬT (luật game chạy từng khung 1/60 giây qua tests/au_lib.js), nạp bằng add_script_tag.
// Mỗi khung: lấy đúng đối tượng vẽ của người chơi (G.heroArgs), vẽ lại ở chỗ riêng 64×64 hai lần: có vũ khí / không vẽ vũ khí
// (G.weaponArt.draw tạm không làm gì). Hiệu hai ảnh = điểm ảnh vũ khí CÒN THẤY. Đếm số điểm đó trong vùng mặt (SC.matKhung,
// đĩa mắt-mũi-miệng) và vùng đầu (đĩa đầu, lớn gấp đôi). Ghi kèm trạng thái, khung thân, góc kiếm, trước/sau thân.
window.DOMAT = (function () {
  const S = 2, W = 64 * S, H = 64 * S, OX = 32, OY = 54; // vẽ gấp đôi như màn trận (canvas 960 cho 480 điểm ảnh game): giữ nét 0,5 điểm ảnh của ảnh AI
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c.getContext('2d', { willReadFrequently: true }); };
  const cA = mk(), cB = mk();
  function ve(c, o) { c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H); c.setTransform(S, 0, 0, S, 0, 0); c.imageSmoothingEnabled = false; G.art.hero(c, o); }
  // đo một khung: trả bản ghi + (tuỳ chọn) ảnh khung có vũ khí
  function doKhung(P, nhan, giu) {
    const TL = G.tinhLinh, SC = G.spriteCustom;
    const o = Object.assign({}, G.heroArgs(P), { x: OX, y: OY, noShadow: true, roundShadow: false, alpha: null });
    if (giu) o.p = Object.assign({}, P, giu); // trạng thái giả (giữ lấy đà) chỉ để vẽ
    let vg = null; try { vg = TL.vkGhep(o); } catch (e) { vg = null; }
    ve(cA, o);
    const d0 = G.weaponArt.draw; G.weaponArt.draw = function () {};
    try { ve(cB, o); } finally { G.weaponArt.draw = d0; }
    const a = cA.getImageData(0, 0, W, H).data, b = cB.getImageData(0, 0, W, H).data;
    const r = { tt: nhan, t: +(+o.t).toFixed(4), f: P.face, ang: vg && vg.wp ? vg.wp.ang : null, truoc: vg && vg.wp ? !!vg.wp.front : null };
    let sp = null, s = null;
    try { sp = SC.cuaEmBe(o.key, o); s = SC.chonEmBe(sp, o); r.k = s.ten + ':' + s.i; } catch (e) { r.k = '?'; }
    let m = sp && s ? SC.matKhung(sp, s.ten, s.i) : null;
    if (!m && sp && s && SC.matKhungGan && !/^(ne|die)$/.test(s.ten)) { m = SC.matKhungGan(sp, s.ten, s.i); if (m) r.muon = 1; } // không đo được: mượn khung gần (cùng luật game)
    let vk = 0;
    for (let i = 0; i < W * H; i++) { const j = i * 4; if (Math.abs(a[j] - b[j]) + Math.abs(a[j + 1] - b[j + 1]) + Math.abs(a[j + 2] - b[j + 2]) + Math.abs(a[j + 3] - b[j + 3]) > 60) vk++; }
    r.vk = vk;
    let hs = 2166136261; for (let i = 0; i < a.length; i++) hs = Math.imul(hs ^ a[i], 16777619) >>> 0; r.h = hs; // dấu vân của ảnh có vũ khí (so từng điểm ảnh giữa hai bản)
    if (m) {
      const f = P.face, mx = OX + f * m.x + (f < 0 ? 1 : 0), my = OY + m.y, R = Math.max(2, m.r);
      const hx = mx - f * 0.6 * m.r, hy = my - 0.6 * m.r, HR = 2 * m.r; // đĩa đầu (SC.matKhung dời tâm đầu 0,3·Rđầu, r = 0,5·Rđầu)
      let nm = 0, tm = 0, nd = 0, td = 0;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const px = (x + 0.5) / S, py = (y + 0.5) / S, i = y * W + x, j = i * 4;
        if (b[j + 3] < 40) continue; // chỉ tính chỗ có thân
        const khac = Math.abs(a[j] - b[j]) + Math.abs(a[j + 1] - b[j + 1]) + Math.abs(a[j + 2] - b[j + 2]) + Math.abs(a[j + 3] - b[j + 3]) > 60;
        if ((px - mx) ** 2 + (py - my) ** 2 <= R * R) { tm++; if (khac) nm++; }
        if ((px - hx) ** 2 + (py - hy) ** 2 <= HR * HR) { td++; if (khac) nd++; }
      }
      r.mat = nm; r.matT = tm; r.dau = nd; r.dauT = td; r.mxy = [+(mx - OX).toFixed(1), +(my - OY).toFixed(1), +R.toFixed(1)];
    } else r.mat = null;
    return { r, cv: cA.canvas };
  }
  return { doKhung, W, H };
})();
