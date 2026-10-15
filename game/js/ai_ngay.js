// ẢI THEO NGÀY — đợt 6 (13/10/2026), docs/review/ke-hoach-cai-thien/he-thong-moi/YEU-CAU-6-EP-DO-AI-NGAY.md
//   - 3 ải: Ải Đá Bậc (đá nâng bậc; T7, CN, T2, T4), Ải Đá Mài (quặng; T3, T6, T7, CN), Ải Vàng (vàng; T5, T6, T7, CN). Bảng: G.AI_NGAY (js/data.js).
//   - Tính theo giờ máy người chơi, đổi ngày lúc 00:00. Mở sau khi hạ trùm vùng 1. Mỗi ải 3 lượt / ngày, trừ lượt khi THẮNG.
//     3 mức: Dễ / Vừa / Khó mở khi đã hạ trùm vùng 1 / 2 / 3; quái theo ải trùm của vùng đó (js/stage.js: S.aiNgay, một phòng, nhiều đợt
//     quái, đợt cuối có 1 tinh anh). Chống chỉnh giờ máy đơn giản: lưu ngày lớn nhất đã thấy (sv.aiNgay.cuoi); ngày lùi thì không hồi lượt.
//   - Bản lưu: sv.aiNgay = { cuoi: 'YYYY-MM-DD', luot: { da, mai, vang } } (máy + mây cùng định dạng; bản lưu cũ không có thì tạo mới).
//   - Cổng vào: bản đồ của Chú Lái Đò, nút "Ải ngày" (G.Village tab 'aingay'). Cờ tắt ?aingay=0 (G.AI_NGAY_BAT = false).
//   - Ảnh (docs/anh-goc/ep-do/cat_ep_do.py): gd-cong-ai-ngay, gd-ai-ngay-da / -mai / -vang. Chưa có thì vẽ code.
(function () {
  'use strict';
  const G = window.G, ui = G.ui;
  if (!G || !G.AI_NGAY) return;
  const CF = G.AI_NGAY;
  const A = (G.aiNgay = {});
  const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
  const SOFT = '#a9c2b4', TXT = '#f1e6c6', GOLD = '#f6dc92', GOOD = '#9be07a', WARN = '#ff9a5a';
  const THU = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  if (G.ngonNgu && G.ngonNgu.them) G.ngonNgu.them({
    'Ải ngày': 'Daily trials', 'Ải theo ngày': 'Daily trials', 'Ải Đá Bậc': 'Stone Trial', 'Ải Đá Mài': 'Whetstone Trial', 'Ải Vàng': 'Gold Trial',
    'Dễ': 'Easy', 'Vừa': 'Normal', 'Khó': 'Hard', 'CN': 'Sun', 'T2': 'Mon', 'T3': 'Tue', 'T4': 'Wed', 'T5': 'Thu', 'T6': 'Fri', 'T7': 'Sat',
    'Mở: {0}': 'Open: {0}', 'Hôm nay mở': 'Open today', 'Hôm nay đóng': 'Closed today', 'Lượt: {0}/{1}': 'Runs: {0}/{1}',
    'Ngày mới sau {0}': 'New day in {0}', 'Cần hạ {0}': 'Beat {0} first', '{0} đá': '{0} stones', '{0} quặng': '{0} ore', '{0} vàng': '{0} gold',
    '{0} · {1}': '{0} · {1}', 'Thắng mới trừ lượt. Mỗi ải 3 lượt mỗi ngày, hồi lúc 0 giờ.': 'Only wins use a run. 3 runs per trial per day, reset at midnight.',
    'Hạ trùm vùng Rừng già để mở ải ngày.': 'Beat the Old Forest boss to unlock daily trials.', 'Hết lượt hôm nay': 'No runs left today',
    'Ải ngày đang tắt (?aingay=0)': 'Daily trials are off (?aingay=0)', '← Bản đồ': '← Map',
    'Thua ải ngày: không mất lượt.': 'Lost the trial: no run used.', 'Hết lượt hôm nay: không có thưởng.': 'No runs left today: no reward.',
    'Còn {0} lượt hôm nay': '{0} runs left today', 'Qua {0} · {1}': 'Cleared {0} · {1}', 'Thua {0} · {1}': 'Lost {0} · {1}',
    '+{0} đá nâng bậc': '+{0} tier stones', '+{0} bùa giữ bậc': '+{0} tier ward', '+{0} quặng': '+{0} ore', '+{0} vàng': '+{0} gold', '+{0} kinh nghiệm': '+{0} XP',
    'Chiều sâu: 1 phòng, {0} đợt quái, tinh anh cuối': '1 room, {0} waves, elite at the end',
  });
  A.bat = () => G.AI_NGAY_BAT !== false;
  const ngayCua = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  A.homNay = () => { const d = new Date(); return { key: ngayCua(d), thu: d.getDay(), d }; };
  // Mở ải ngày: đã hạ trùm vùng 1 (độ khó nào cũng tính). Mức k mở khi đã hạ trùm vùng k + 1.
  const daHa = (sv, r) => !!(sv && ((sv.stars && sv.stars[r + '-4']) || (sv.stars2 && sv.stars2[r + '-4'])));
  A.mo = (sv) => daHa(sv || G.save, 0);
  A.mucMo = (sv, k) => daHa(sv || G.save, k);
  // Trạng thái trong bản lưu + hồi lượt khi sang ngày mới (ngày lùi: không hồi)
  A.st = function (sv) {
    sv = sv || G.save;
    if (!sv) return null;
    let o = sv.aiNgay;
    if (!o || typeof o !== 'object' || Array.isArray(o)) o = sv.aiNgay = { cuoi: '', luot: {} };
    if (typeof o.cuoi !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(o.cuoi)) o.cuoi = '';
    if (!o.luot || typeof o.luot !== 'object' || Array.isArray(o.luot)) o.luot = {};
    for (const k of CF.thuTu) o.luot[k] = Math.max(0, Math.min(CF.luot, Math.floor(num(o.luot[k], CF.luot))));
    for (const k of Object.keys(o.luot)) if (CF.thuTu.indexOf(k) < 0) delete o.luot[k];
    const h = A.homNay().key;
    if (h > o.cuoi) { o.cuoi = h; for (const k of CF.thuTu) o.luot[k] = CF.luot; }
    return o;
  };
  A.moHomNay = (loai) => { const a = CF.ai[loai]; return !!a && a.thu.indexOf(A.homNay().thu) >= 0; };
  A.luot = (loai, sv) => { const o = A.st(sv); return o ? o.luot[loai] | 0 : 0; };
  A.conLaiGiay = () => { const d = new Date(), m = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1); return Math.max(0, Math.round((m - d) / 1000)); };
  const dongHo = (s) => [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((v) => String(v).padStart(2, '0')).join(':');
  A.duoc = function (loai, muc, sv) { // '' là vào được
    sv = sv || G.save;
    if (!A.bat()) return 'Ải ngày đang tắt (?aingay=0)';
    if (!A.mo(sv)) return 'Hạ trùm vùng Rừng già để mở ải ngày.';
    if (!A.moHomNay(loai)) return 'Hôm nay đóng';
    if (!A.mucMo(sv, muc)) return G.t('Cần hạ {0}', G.REGIONS[muc].bossName);
    if (A.luot(loai, sv) <= 0) return 'Hết lượt hôm nay';
    return '';
  };
  A.coLuot = (sv) => A.bat() && A.mo(sv) && CF.thuTu.some((k) => A.moHomNay(k) && A.luot(k, sv) > 0);
  // Vào ải: vùng của mức (quái, cảnh vùng đó), S.i = 3 (đợt quái muộn); js/stage.js đọc S.aiNgay
  A.vao = function (loai, muc) {
    if (A.duoc(loai, muc) !== '') return false;
    G.startStage(muc, 3, 0, { aiNgay: { loai, muc } });
    return true;
  };
  A.choiLai = (S) => !!(S && S.aiNgay && A.duoc(S.aiNgay.loai, S.aiNgay.muc) === '');
  const tenAi = (loai) => G.tv(CF.ai[loai].ten);
  A.tenNgan = (S) => G.t('{0} · {1}', tenAi(S.aiNgay.loai), G.tv(CF.muc[S.aiNgay.muc]));
  A.tieuDe = (S, R) => G.t(R.win ? 'Qua {0} · {1}' : 'Thua {0} · {1}', tenAi(S.aiNgay.loai), G.tv(CF.muc[S.aiNgay.muc]));
  // Thưởng (js/stage.js settle gọi đúng một lần). ln(tpl, ...): thêm dòng có bản dịch.
  A.thuong = function (S, R, win, ln) {
    const sv = G.save, an = S.aiNgay, a = CF.ai[an.loai], k = an.muc, T = a.thuong;
    if (!win) { R.lines.push(ln(S.quit ? 'Thua ải ngày: không mất lượt.' : 'Thua ải ngày: không mất lượt.')); return; }
    const o = A.st(sv);
    if (!o || (o.luot[an.loai] | 0) <= 0) { R.lines.push(ln('Hết lượt hôm nay: không có thưởng.')); return; }
    o.luot[an.loai]--;
    if (T.da) { const n = T.da[k] | 0; if (G.epDo) G.epDo.themDa(sv, n); else sv.daBac = Math.max(0, num(sv.daBac, 0)) + n; R.lines.push(ln('+{0} đá nâng bậc', n)); }
    if (T.bua && Math.random() < (T.bua[k] || 0)) { if (G.epDo) G.epDo.themBua(sv, 1); else sv.buaBac = Math.max(0, num(sv.buaBac, 0)) + 1; R.lines.push(ln('+{0} bùa giữ bậc', 1)); }
    if (T.quang) { const n = T.quang[k] | 0; sv.ore += n; R.lines.push(ln('+{0} quặng', n)); }
    if (T.vang) { const n = T.vang[k] | 0; sv.gold += n; R.lines.push(ln('+{0} vàng', n)); }
    const xp = Math.round(G.stageStats(k, 4, 0).xp * (CF.xp || 0));
    if (xp > 0) { R.lines.push(ln('+{0} kinh nghiệm', xp)); R.up = G.addXp(sv.hero, xp); }
    R.lines.push(ln('Còn {0} lượt hôm nay', o.luot[an.loai]));
  };
  // Phần thưởng một lượt (chữ trên nút)
  A.chuThuong = function (loai, k) {
    const T = CF.ai[loai].thuong;
    if (T.da) return G.t('{0} đá', T.da[k]);
    if (T.quang) return G.t('{0} quặng', T.quang[k]);
    return G.t('{0} vàng', T.vang[k]);
  };
  // Bản lưu: sửa trường aiNgay mỗi lần nạp (bọc G.fixSave; nạp sau js/ep_do.js)
  if (G.fixSave && !G.fixSave.aiNgayBoc) {
    const goc = G.fixSave;
    G.fixSave = function () {
      const r = goc.apply(this, arguments);
      try { if (r && typeof r === 'object' && r.aiNgay != null) A.st(r); } catch (e) { console.error('Linh Khí: lỗi khi sửa phần ải ngày của bản lưu (bỏ qua)', e); }
      return r;
    };
    G.fixSave.aiNgayBoc = true;
  }

  // ---------- màn chọn ải ngày (G.Village tab 'aingay') ----------
  const gd = (ma) => { const s = G.spriteCustom; return s && s.gdSan ? s.gdSan(ma) : null; };
  const veGd = (ma, x, y, w, h) => { const g = gd(ma); return !!(g && G.spriteCustom.veGd(G.ux, g, x, y, w, h)); };
  const MAU = { da: '#b06aff', mai: '#9aa4b0', vang: '#ffd24a' };
  function veCong(x, y, w, h) {
    if (veGd('gd-cong-ai-ngay', x, y, w, h)) return;
    const c = G.ux, t = G.time || 0;
    ui.rect(x + 8, y + 10, w - 16, h - 14, '#3a4a48', '#1a2422');
    c.fillStyle = '#123'; c.fillRect(x + 22, y + 26, w - 44, h - 34);
    for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(80,220,255,' + (0.25 + 0.1 * i) + ')'; c.beginPath(); c.arc(x + w / 2, y + h / 2 + 6, 4 + ((i * 5 + t * 12) % 30), 0, 7); c.fill(); }
    for (let i = 0; i < 7; i++) ui.rect(x + 12 + i * ((w - 24) / 7), y + 12, (w - 24) / 7 - 2, 8, '#5a7a74', '#1a2422');
  }
  function veIcon(loai, x, y, s) {
    if (veGd('gd-ai-ngay-' + loai, x, y, s, s)) return;
    const c = G.ux; c.fillStyle = '#1a1a22'; c.beginPath(); c.arc(x + s / 2, y + s / 2, s / 2, 0, 7); c.fill();
    c.fillStyle = MAU[loai]; c.beginPath(); c.arc(x + s / 2, y + s / 2, s / 2 - 3, 0, 7); c.fill();
  }
  A.screen = function () {
    const VA = G.villageApi, T = G.theme, sv = G.save, VS = G.villageScene;
    if (VS && VS.drawWorld) VS.drawWorld({ dim: 0.62, hideHero: true });
    T.panel(8, 26, 464, 240, 'Ải theo ngày', { rightPad: 90, noBand: true });
    if (T.sbtn(396, 29, 70, 17, '← Bản đồ', { size: 8, pad: 4 })) { VA.V.tab = 'map'; G.sfx('ui'); return; }
    veCong(14, 52, 92, 96);
    const h = A.homNay(), o = A.st(sv);
    ui.text(G.t('{0} · {1}', G.tv(THU[h.thu]), h.d.getDate() + '/' + (h.d.getMonth() + 1)), 60, 160, { size: 9, bold: true, align: 'center', color: GOLD });
    ui.text(G.t('Ngày mới sau {0}', dongHo(A.conLaiGiay())), 60, 172, { size: 7, align: 'center', color: SOFT });
    const lx = T.chuMoi && T.chuMoi() ? 17 : 14, lw = T.chuMoi && T.chuMoi() ? 91 : 94; // chu-lech-khung: lòng khung bảng bắt đầu ở x 14,5 (+2 đệm)
    ui.para('Thắng mới trừ lượt. Mỗi ải 3 lượt mỗi ngày, hồi lúc 0 giờ.', lx, 186, lw, { size: 6.5, color: SOFT });
    ui.para(G.t('Chiều sâu: 1 phòng, {0} đợt quái, tinh anh cuối', CF.dot), lx, 222, lw, { size: 6.5, color: SOFT });
    if (!A.bat() || !A.mo(sv)) { ui.para(A.bat() ? 'Hạ trùm vùng Rừng già để mở ải ngày.' : 'Ải ngày đang tắt (?aingay=0)', 120, 70, 340, { size: 9, color: WARN }); return; }
    CF.thuTu.forEach((loai, i) => {
      const a = CF.ai[loai], y = 52 + i * 70, mo = A.moHomNay(loai), con = o ? o.luot[loai] | 0 : 0;
      T.inset(114, y, 352, 66, false, mo ? null : { fill: '#16262a' });
      veIcon(loai, 120, y + 6, 32);
      ui.text(G.tv(a.ten), 158, y + 14, { size: 9.5, bold: true, color: mo ? MAU[loai] : SOFT });
      // các ngày mở, hôm nay đậm
      let x = 158;
      a.thu.forEach((t) => { const s = G.tv(THU[t]), hn = t === h.thu; ui.font(7, hn); const w = G.ux.measureText(s).width; ui.text(s, x, y + 25, { size: 7, bold: hn, color: hn ? GOOD : SOFT }); x += w + 6; });
      ui.text(G.tv(mo ? 'Hôm nay mở' : 'Hôm nay đóng'), 460, y + 14, { size: 7.5, bold: true, align: 'right', color: mo ? GOOD : WARN });
      ui.text(G.t('Lượt: {0}/{1}', con, CF.luot), 460, y + 25, { size: 7.5, align: 'right', color: con > 0 ? TXT : WARN });
      CF.muc.forEach((m, k) => {
        const why = A.duoc(loai, k, sv), bx = 158 + k * 102;
        const sub = A.mucMo(sv, k) ? A.chuThuong(loai, k) : G.t('Cần hạ {0}', G.REGIONS[k].bossName);
        if (T.btn(bx, y + 31, 98, 30, G.tv(m) + ' · ' + G.REGIONS[k].name, { size: 7.5, sub, subSize: 6.5, primary: !why, disabled: !!why })) {
          if (A.vao(loai, k)) G.sfx('ui');
        }
      });
    });
  };
})();
