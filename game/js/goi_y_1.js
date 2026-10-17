// GỢI Ý MỘT VIỆC (17/10, docs/review/ke-hoach-cai-thien/TU-VAN-CHATGPT-17-10.md mục 5: "Sau lượt chơi, cần chỉ rõ một việc quan trọng nhất nên làm").
// Sau mỗi lượt chơi (màn kết quả thắng / bỏ ải, và lúc về làng) hiện MỘT dòng "Nên làm: …". Chỉ đọc dữ liệu có sẵn, không đổi luật / số / bản lưu:
//   - ải đích: thắng thì ải kế (như nút "Ải tiếp theo"), thua / bỏ thì chính ải đó; Sức mạnh và Sức mạnh khuyên dùng: G.power, G.stageRec;
//   - việc nâng cấp: G.upgradeTips (js/upgrade.js — đã xếp theo "làm được ngay mà tăng nhiều", đã theo luật Luyện khi Luyện bật, đã bỏ người
//     làng / thẻ chưa mở). Chọn: điểm kỹ năng chưa học → việc làm được ngay khi còn yếu hơn khuyên dùng → đi ải kế khi đã đủ sức → việc thiếu đồ.
// Bấm vào dòng ở màn kết quả: về làng, mở đúng người làng (G.villageGo, như bảng thua). Bảng thua (đã có danh sách "Nên cày gì") không đổi.
// Cờ tắt: ?goiy1=0 (G.GOI_Y_1 = false) → màn kết quả và làng y như trước.
(function () {
  'use strict';
  const G = window.G;
  if (!G) return;
  if (G.GOI_Y_1 === undefined) { let tat = false; try { tat = typeof location !== 'undefined' && /[?&]goiy1=0(&|$)/.test(location.search || ''); } catch (e) { tat = false; } G.GOI_Y_1 = !tat; }
  const GY = (G.goiY1 = { cho: null });
  GY.bat = () => G.GOI_Y_1 !== false;
  if (G.ngonNgu && G.ngonNgu.them) G.ngonNgu.them({
    'Nên làm: {0}': 'Next: {0}', 'Nên làm: {0} ({1})': 'Next: {0} ({1})', 'đi tiếp ải {0}': 'go on to {0}',
    'chơi lại ải cũ để lên cấp, gom đồ (khuyên dùng {0})': 'replay old stages to level up and gather materials (recommended {0})',
    'Bấm để tới chỗ người làng': 'Tap to go to the villager',
  });
  const stName = (r, i) => (i === 4 ? G.t('trùm {0}', G.REGIONS[r].bossName) : G.tv(G.REGIONS[r].name) + ' ' + (i + 1));
  // Ải kế sau ải (r, i) — cùng luật với nút "Ải tiếp theo / Sang vùng mới" ở js/stage.js
  function aiKe(r, i, diff) {
    const sv = G.save;
    if (i < 4) return [r, i + 1];
    if (r < G.REGIONS.length - 1 && !(diff && r >= 2 && !(sv && sv.stars && sv.stars[(r + 1) + '-4']))) return [r + 1, 0];
    return null;
  }
  // Chọn MỘT việc. ctx = { r, i, diff, win }. Trả { s (chữ đã dịch), go (G.villageGo) } hoặc null.
  GY.chon = function (ctx) {
    const sv = G.save;
    if (!sv || !sv.heroes || !ctx || ctx.r == null || !G.upgradeTips || !G.power || !G.stageRec) return null;
    const ke = ctx.win ? aiKe(ctx.r, ctx.i, ctx.diff) : null, t = ke || [ctx.r, ctx.i];
    let T = null;
    try { T = G.upgradeTips(t[0], t[1], ctx.diff | 0, 3); } catch (e) { T = null; }
    const tips = (T && T.tips) || [], pw = T ? T.power : G.power(), rec = T ? T.rec : G.stageRec(t[0], t[1], ctx.diff | 0);
    const lam = (q) => ({ s: G.t('Nên làm: {0}', q.text), go: q.go || null });
    const hoc = tips.find((q) => q.ok && (q.kind === 'skill' || q.kind === 'chuong'));
    if (hoc) return lam(hoc); // điểm kỹ năng chưa học: miễn phí, luôn nhắc trước
    const ok = tips.find((q) => q.ok);
    if (pw < rec && ok) return lam(ok);
    if (ke && pw >= rec) return { s: G.t('Nên làm: {0}', G.t('đi tiếp ải {0}', stName(ke[0], ke[1]))), go: { who: 'lai', stage: ke } };
    if (ok) return lam(ok);
    const q = tips[0];
    if (q) return { s: G.t('Nên làm: {0} ({1})', q.text, q.sub), go: q.go || null };
    if (pw < rec) return { s: G.t('Nên làm: {0}', G.t('chơi lại ải cũ để lên cấp, gom đồ (khuyên dùng {0})', rec)), go: null };
    return null;
  };
  // Gọi lúc lượt chơi kết thúc: nghe sự kiện "hetAi" (js/su_kien.js phát trong G.onStageEnd, sau Bảng vàng; KHÔNG bọc G.onStageEnd vì
  // js/su_kien.js đã đặt getter / setter cho nó). Tính một lần, giữ cho màn kết quả (R.goiY1) và cho lúc về làng (GY.cho).
  function hetAi(d) {
    try {
      const S = d && d.S, R = d && d.R;
      if (!GY.bat() || !S || !R || S.aiNgay || S.tut) { GY.cho = null; return; }
      const g = GY.chon({ r: S.r, i: S.i, diff: S.diff, win: !!R.win });
      R.goiY1 = g; GY.cho = g;
    } catch (e) { GY.cho = null; if (typeof console !== 'undefined') console.warn('goi_y_1: bỏ qua', e); }
  }
  if (G.suKien && G.suKien.on) G.suKien.on('hetAi', hetAi);
  // Màn kết quả (js/stage.js): có dòng để vẽ không
  GY.co = (R) => !!(GY.bat() && R && R.goiY1 && R.goiY1.s);
  // Vẽ một dòng ở (x, y) rộng wd; bấm thì về làng mở người làng. Trả true nếu đã bấm (đã đổi cảnh).
  GY.veKetQua = function (R, x, y, wd) {
    if (!GY.co(R)) return false;
    const ui = G.ui, g = R.goiY1, h = 11;
    ui.rect(x, y, wd, h, 'rgba(60,110,60,0.35)', 'rgba(143,208,122,0.6)');
    const a = ui.wrap(g.s, wd - (g.go ? 16 : 8), 7, true);
    ui.text(a[0] + (a.length > 1 ? '…' : ''), x + 4, y + 8, { size: 7, bold: true, color: '#fff0c4' });
    if (g.go) {
      ui.text('▶', x + wd - 4, y + 8, { size: 7, align: 'right', color: '#f6dc92' });
      if (G.click && G.inRect && G.inRect(G.click, x, y, wd, h)) { G.click = null; G.sfx && G.sfx('ui'); GY.cho = null; G.villageGo = g.go; return true; }
    }
    return false;
  };
  // Về làng: một dòng báo (gọi TRƯỚC dòng "Mở mới" của js/mo_dan.js — có mốc mới thì câu mốc mới đè lên)
  GY.baoLang = function () {
    const g = GY.cho; GY.cho = null;
    if (!GY.bat() || !g || !g.s || !G.villageScene || !G.villageScene.say) return;
    try { G.villageScene.say(g.s, 5); } catch (e) { /* bỏ qua */ }
  };
})();
