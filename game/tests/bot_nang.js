// Bot cân bằng (đợt 5, docs/review/ke-hoach-cai-thien/he-thong-moi/YEU-CAU-5-BOT-CAN-BANG.md): nâng cấp ở làng như người chơi bình thường
// theo HỆ THỐNG MỚI — 4 vũ khí cố định, nâng bằng linh khí (G.VK_MOI), nâng bộ trang phục (linh khí + vàng + mảnh trùm, G.BO_MOI),
// không rơi đồ, không quần áo cũ. Chỉ dùng khi kiểm tra (tests/cay.py, tests/campaign.py). Nạp sau tests/bot.js.
//
// Cách bot chơi:
//  - Dùng 2 vũ khí: món chính = Kiếm, món phụ = Phi tiêu (như hai món đầu vòng xoay của bản lưu mới; mô hình đợt 4 cũng vậy).
//    Hai món kia để Trắng +0 (Sức mạnh chỉ tính 2 món mạnh nhất nên G.upg.auto không nâng chúng). Trong trận bot chỉ đổi qua lại
//    giữa 2 món này (G.botVk, tests/bot.js).
//  - Lên Mầm chọn hệ hợp vùng: món chính lấy hệ khắc vùng đang đánh (G.WEAK[hệ vùng]: Rừng già → Lửa, Hang biển → Độc,
//    Lâu đài cổ → Băng); món phụ lấy hệ khắc hệ của món chính (G.WEAK[hệ món chính]) để khi trùm học kháng hệ món chính thì đổi sang
//    món phụ đánh đúng chỗ yếu. Không đổi hệ về sau (đổi hệ tốn linh khí).
//  - Bộ trang phục: mặc bộ có cấp cao nhất (bằng nhau thì bộ mới mở sau cùng); nâng bộ mới mở sau cùng còn chưa tối đa khi đủ linh khí + vàng + mảnh, và chỉ khi giá linh khí của cấp bộ đó không cao hơn lần nâng vũ khí rẻ nhất còn chờ
//    (người chơi mua món rẻ trước). Nâng bộ làm trước G.upg.auto để vàng không bị mài tiêu hết.
//    Bộ đang nhắm còn thiếu mảnh trùm (cấp 2, 3): khi cần cày, bot đánh lại trùm vùng đó nếu đã dư sức (như người chơi muốn bộ cấp 3).
//  - Còn lại: G.upg.auto (học kỹ năng, chưởng, mài, nâng lò, nâng vũ khí bằng linh khí — việc tăng Sức mạnh nhiều nhất trên mỗi đồng).
(function () {
  const G = window.G, VM = G.vkMoi, U = G.upg;
  // 14/10 (bước 1 làm chắc, mục 5): món chính / phụ chọn được (G.botDatVk) để chạy chiến dịch có Thương và Búa; mặc định Kiếm + Phi tiêu.
  let CHINH = 'sword', PHU = 'bow';
  G.botDatVk = function (chinh, phu) { CHINH = chinh || 'sword'; PHU = phu || (CHINH === 'bow' ? 'sword' : 'bow'); return [CHINH, PHU]; };
  const vungDangDanh = (sv) => { let n = 0; for (let k = 0; k < 15; k++) if (sv.stars[Math.floor(k / 5) + '-' + (k % 5)]) n = k + 1; return Math.min(2, Math.floor(Math.min(n, 14) / 5)); };
  const wOf = (sv, t) => sv.weapons.find((w) => w.type === t);
  U.heMam = function (sv, w) {
    const heChinh = (() => { const c = wOf(sv, CHINH); return c && G.wStage(c) > 0 ? c.branch : G.WEAK[G.REGIONS[vungDangDanh(sv)].el]; })();
    return w.type === CHINH ? G.WEAK[G.REGIONS[vungDangDanh(sv)].el] : G.WEAK[heChinh];
  };
  // vị trí 2 món bot dùng trong P.weapons (theo sv.carry)
  G.botVk = function (P) { return [CHINH, PHU].map((t) => P.weapons.findIndex((w) => w.type === t)); };

  const moBo = (sv) => (G.ZED_BO_KEYS || []).filter((k) => G.zedBoMo(k, sv));
  // bộ nhắm nâng: bộ mới mở sau cùng chưa tối đa (người chơi nâng bộ mới, mặc nó khi đã bằng cấp bộ đang mặc)
  function boNham(sv) {
    const mo = moBo(sv), max = G.BO_MOI.max;
    for (let i = mo.length - 1; i >= 0; i--) if (VM.boCap(sv, mo[i]) < max) return mo[i];
    return null;
  }
  function mac(sv) {
    const mo = moBo(sv);
    let best = mo[0];
    for (const k of mo) if (VM.boCap(sv, k) >= VM.boCap(sv, best)) best = k;
    if (!sv.zed || typeof sv.zed !== 'object') sv.zed = { v: 1, hoc: {} };
    if (best === 'ninja') delete sv.zed.bo; else sv.zed.bo = best;
  }
  const choVk = (sv) => Math.min(...[CHINH, PHU].map((t) => { const c = VM.gia(G.wStage(wOf(sv, t))); return c == null ? Infinity : c; }));
  // ghi mốc: lần đầu một vũ khí đạt cấp, một bộ đạt cấp
  function ghiMoc(sv, moc, ai) {
    for (const t of [CHINH, PHU]) { const st = G.wStage(wOf(sv, t)); for (let s = 1; s <= st; s++) { const k = t + ' ' + G.STAGE_NAMES[s]; if (!(k in moc)) moc[k] = ai; } }
    for (const k of G.ZED_BO_KEYS) { const c = VM.boCap(sv, k); for (let s = 1; s <= c; s++) { const q = 'bộ ' + k + ' ' + s; if (!(q in moc)) moc[q] = ai; } }
  }
  // ---------- ÉP ĐỒ (14/10, bước 1 mục 5; js/ep_do.js) ----------
  // Như người chơi bình thường: ép món chính trước, món phụ theo sau (thấp hơn món chính 1 bậc). Bậc có nguy cơ tụt (từ Vàng) chỉ ép khi
  // có bùa giữ bậc (dùng bùa) hoặc đá dư gấp đôi giá. Làm TRƯỚC G.upg.auto để vàng không bị mài tiêu hết. Tắt: G.botEp = false.
  G.botEp = true;
  function epDo(sv, did) {
    const E = G.epDo;
    if (!G.botEp || !E || !E.bat()) return;
    const CF = G.EP_DO;
    for (let n = 0; n < 12; n++) {
      const c = wOf(sv, CHINH), p = wOf(sv, PHU);
      const w = E.bac(p) + 1 < E.bac(c) ? p : c;
      if (E.duoc(sv, w) !== '') break;
      const t = E.bac(w) + 1, g = E.gia(t), coBua = E.bua(sv) > 0;
      if (t >= CF.tutTu && !coBua && E.da(sv) < 2 * g.da) break;
      const kq = E.ep(sv, w, coBua);
      if (!kq) break;
      did.push('Ép ' + w.type + ' ' + (kq.ok ? 'lên ' : 'hỏng ') + CF.ten[kq.b1]);
      const moc = G.botMoc || {}, k = w.type + ' bậc ' + CF.ten[kq.b1];
      if (kq.ok && !(k in moc)) moc[k] = G.botAiHien || '?';
    }
  }

  // ---------- ẢI NGÀY (14/10, bước 1 mục 5; js/ai_ngay.js) ----------
  // Ngày GIẢ cho bot: G.botSangNgay() sang ngày kế (thứ trong tuần xoay vòng, bắt đầu từ Thứ 2); G.aiNgay.homNay đọc ngày giả này.
  // G.botAiNgay(): chơi mọi ải ngày mở hôm nay ở mức cao nhất đã mở, tới khi hết lượt (thua 2 lần liền thì thôi ải đó).
  let ngay = 0;
  const NGAY0 = Date.UTC(2026, 0, 5); // Thứ 2, 05/01/2026
  const ngayGia = () => { const d = new Date(NGAY0 + ngay * 86400000); return { key: d.toISOString().slice(0, 10), thu: d.getUTCDay(), d }; };
  if (G.aiNgay) G.aiNgay.homNay = ngayGia;
  G.botSangNgay = function () { ngay++; return ngayGia().key; };
  G.botAiNgay = function () {
    const A = G.aiNgay, sv = G.save, out = [];
    if (!A || !A.bat() || !A.mo(sv)) return out;
    for (const loai of G.AI_NGAY.thuTu) {
      let muc = 2; while (muc > 0 && !A.mucMo(sv, muc)) muc--;
      let thua = 0;
      for (let k = 0; k < 6 && thua < 2 && A.duoc(loai, muc, sv) === ''; k++) {
        G.botNang(G.botAiHien || '1-1'); // mốc nâng cấp ghi theo ải thường đang tới
        const truoc = { lk: VM.lk(sv), gold: sv.gold, ore: sv.ore, da: G.epDo ? G.epDo.da(sv) : 0 };
        A.vao(loai, muc);
        const r = G.probeRun(600);
        const win = !!r.win;
        if (!win) thua++; else thua = 0;
        out.push({ loai, muc, win, t: r.t || 0, gold: sv.gold - truoc.gold, ore: sv.ore - truoc.ore, da: (G.epDo ? G.epDo.da(sv) : 0) - truoc.da, lk: VM.lk(sv) - truoc.lk });
      }
    }
    return out;
  };

  // Nâng cấp ở làng. ai: nhãn ải đang tới (để ghi mốc). Trả về tóm tắt cho bảng của bot.
  G.botNang = function (ai) {
    const sv = G.save;
    const moc = (G.botMoc = G.botMoc || {});
    sv.vkThu = ['sword', 'bow', 'spear', 'hammer'];
    sv.carry = sv.vkThu.map((t) => wOf(sv, t).id);
    const did = [];
    for (let n = 0; n < 6; n++) {
      mac(sv);
      const bo = boNham(sv);
      if (!bo) break;
      const g = VM.boGia(VM.boCap(sv, bo));
      if (!g || g.lk > choVk(sv) || VM.boDuoc(sv, bo) !== '') break;
      VM.nangBo(sv, bo); did.push('Nâng bộ ' + bo + ' lên ' + VM.boCap(sv, bo));
    }
    mac(sv);
    G.botAiHien = ai;
    epDo(sv, did);
    // G.upg.auto chỉ thấy 2 món bot dùng (Sức mạnh tính 2 món mạnh nhất; nếu để cả 4 thì auto có thể nâng Búa thay Phi tiêu)
    const du = sv.carry.slice();
    sv.carry = [CHINH, PHU].map((t) => wOf(sv, t).id);
    try { did.push(...U.auto(sv)); } finally { sv.carry = du; }
    mac(sv);
    ghiMoc(sv, moc, ai);
    const hs = sv.heroes[sv.hero], P = G.buildPlayer();
    const vk = (t) => { const w = wOf(sv, t); return G.STAGE_NAMES[G.wStage(w)] + (w.branch ? '/' + G.EL[w.branch].name : '') + ' +' + w.sharpen + (G.epDo && G.epDo.bac(w) ? ' ' + G.EP_DO.ten[G.epDo.bac(w)] : ''); };
    const bo = G.zedBo(sv);
    let nx = null;
    // bộ đang nhắm còn thiếu mảnh trùm (cấp 2, 3) mà trùm vùng đó đã hạ: lượt cày nào cũng đánh lại trùm vùng đó (cho cả linh khí nhiều
    // nhất); cd_lib chỉ đánh lại trùm khi đã dư sức (Sức mạnh >= 1,15 x khuyên dùng của ải trùm), không thì cày như thường.
    const bn = boNham(sv), gb = bn && VM.boGia(VM.boCap(sv, bn));
    if (gb && gb.manh > VM.manh(sv, bn) && sv.stars[VM.boVungManh(bn) + '-4']) nx = [VM.boVungManh(bn), 4];
    if (!nx) nx = U.grindTarget(sv);
    return { lvl: hs.lvl, power: G.power(), hp: P.maxhp, gold: Math.floor(sv.gold), lk: Math.floor(VM.lk(sv)), ore: sv.ore, forge: sv.forge,
      mats: sv.mats.join('/'), shards: sv.shards.join('/'), chinh: vk(CHINH), phu: vk(PHU), bo: bo + VM.boCap(sv, bo),
      where: nx ? nx[0] * 5 + nx[1] : null, did, da: G.epDo ? G.epDo.da(sv) : 0, bua: G.epDo ? G.epDo.bua(sv) : 0 };
  };
})();
