// LỰC CHIẾN (tiếng Anh "Combat Power"): một con số tóm tắt em bé mạnh cỡ nào, tính từ đúng các chỉ số game đang dùng trong trận,
// và dải thông báo "Lực chiến 1.234 ▲ +56" mỗi khi con số đổi (nâng vũ khí bằng linh khí, mài,
// lên cấp, học kỹ năng, chưởng...). CHỈ HIỂN THỊ: không đổi sát thương, máu, chỉ số đồ, cân bằng, không ghi gì vào bản lưu.
//
// Khác "Sức mạnh" (G.power, js/combat.js): Sức mạnh là thước đo đã cân với "Sức mạnh khuyên dùng" của từng ải (bot đo), quy mọi
// vũ khí về thang của kiếm. Lực chiến thì tính thẳng SÁT THƯƠNG MỖI GIÂY thật của từng loại vũ khí (nhịp đánh trong G.MOVES),
// cộng cả dòng phụ, dòng mạnh, hồi chiêu, tốc chạy, nên mọi thay đổi trên đồ đều làm con số nhích theo đúng chiều.
//
// CÔNG THỨC (G.lucChien):
//   P = G.buildPlayer() (hàm dựng Zed lúc vào trận: cấp, điểm kỹ năng, vũ khí, chưởng)
//   Đòn của mỗi vũ khí đang mang w:
//     dps(w) = G.pDamage(P, w)                       sát thương gốc × bậc × mốc linh khí × mài × cấp × điểm Công × sở trường
//            × nhịp(w.type)                          (tổng hệ số các nhát / tổng thời gian chuỗi đòn, G.MOVES)
//            × (1 + chí mạng)                        (điểm Công + dòng phụ "chí mạng" 10%)
//            × dòng phụ (mana ×1,03, tầm ×1,03) × dòng mạnh (Diệt yêu ×1,10, Thấm hệ ×1,05, Mở màn ×1,05)
//            × (1 + nửa phần "+15% lên quái dính hiệu ứng")
//   DPS = 0,75 × vũ khí mạnh hơn + 0,25 × vũ khí còn lại (như Sức mạnh: trùm bắt đổi vũ khí; ô trống tính 0)
//       × hệ số chưởng (G.chuong.powerMult) × (1 + nửa phần hồi chiêu nhanh)
//       × mana và đòn Đặc biệt (Đặc biệt rẻ hơn 0,6%/mana, mana tối đa 0,08%/điểm, hồi mana mỗi đòn 3%/điểm)
//       × hiệu ứng hệ kéo dài (20% phần tăng), nổ kết hợp hệ (10% phần tăng), đổi vũ khí chắc gây hiệu ứng (×1,02)
//   Độ bền: EHP = máu tối đa / (1 − giảm sát thương, tối đa 75%; nội tại Cu Lì / nét Cu Lì dạy Zed tính một nửa)
//       × (1 + 0,3 × kháng hệ trung bình) × (1 + hồi máu mỗi phòng) × lộn nhanh, tốc chạy (đợt 2: bỏ phần trang phục cũ)
//   Skill bộ đồ đã mở (14/10): DPS × hệ số đòn, EHP × hệ số máu của G.boSk.quyDoi (js/bo_skill.js), giống Sức mạnh
//   Lực chiến = làm tròn(7 × căn bậc hai(DPS × EHP))
//   Em bé mới (Cu Tí cấp 1, Kiếm Rèn + Cung Tre Thường) ≈ 400; cuối game (cấp 40, Vàng +15, Thức tỉnh, đồ bộ) ≈ 4.000.
//
// Cờ tắt: G.LUC_CHIEN = false hoặc ?lucchien=0 → không hiện con số lẫn thông báo (game như trước).
(function () {
  const G = window.G;
  const LC = (G.lucChienUI = {});
  if (G.LUC_CHIEN === undefined) { let tat = false; try { tat = /[?&]lucchien=0(&|$)/.test(location.search || ''); } catch (e) { tat = false; } G.LUC_CHIEN = !tat; }
  LC.on = () => G.LUC_CHIEN !== false;

  // ---------- nhịp đánh: hệ số sát thương mỗi giây so với một đòn (đọc G.MOVES, thiếu thì dùng cd) ----------
  const RATE = {};
  function nhip(type) {
    if (RATE[type]) return RATE[type];
    const M = G.MOVES && G.MOVES[type], WT = G.WTYPES[type];
    let r = 0;
    try {
      if (M && M.chain) { let m = 0, d = 0; for (const s of M.chain) { m += s.mult; d += s.dur; } r = d > 0 ? m / d : 0; }
      else if (M && M.swing) r = M.swing.mult / M.swing.dur;
      else if (M && M.shot) r = M.shot.mult / (M.shot.still || M.shot.move);
    } catch (e) { r = 0; }
    if (!(r > 0)) r = 1 / ((WT && WT.cd) || 0.5);
    return (RATE[type] = r);
  }
  LC.nhip = nhip;
  const AFX = { mana: 1.03, reach: 1.03 };
  const POW = { boss: 1.1, proc: 1.05, first: 1.05 };

  // Sát thương mỗi giây ước lượng của một vũ khí trong tay P (đánh liên tục một mục tiêu).
  function dpsOf(P, w) {
    let d = G.pDamage(P, w) * nhip(w.type);
    d *= 1 + (P.crit || 0) + (G.wHas(w, 'crit') ? 0.1 : 0);
    for (const k of w.affixes || []) if (AFX[k]) d *= AFX[k];
    if (w.power && POW[w.power]) d *= POW[w.power];
    d *= 1 + ((P.statusBonus || 1) - 1) * 0.5;
    return d;
  }
  LC.dpsOf = dpsOf;

  // Các phần của lực chiến cho bản lưu sv và em bé key (mặc định em bé đang chọn). Không đổi sv.
  G.lucChienParts = function (sv, key) {
    sv = sv || G.save;
    if (!sv || !sv.heroes) return null;
    key = key || sv.hero;
    if (!sv.heroes[key] || !G.HEROES[key]) return null;
    const keep = G.save, s = key === sv.hero ? sv : Object.assign({}, sv, { hero: key });
    G.save = s;
    try {
      const P = G.buildPlayer();
      const ds = P.weapons.map((w) => dpsOf(P, w)).sort((a, b) => b - a);
      // ô thứ hai bỏ trống tính là 0: tháo vũ khí thì lực chiến giảm (trùm thích nghi hệ nên cần đủ hai món)
      let dps = ds.length ? ds[0] * 0.75 + (ds[1] || 0) * 0.25 : 7.5 * (1 + G.LVL_DMG * (P.lvl - 1));
      if (G.chuong && G.chuong.powerMult) dps *= G.chuong.powerMult(s, key);
      dps *= 1 + (1 - (P.cdMul || 1)) * 0.5;
      // mana và đòn Đặc biệt: đòn Đặc biệt rẻ hơn, mana nhiều hơn, hồi mana mỗi đòn, hiệu ứng hệ kéo dài, nổ kết hợp hệ, đổi vũ khí chắc gây hiệu ứng
      dps *= 1 + ((P.specCost != null ? 25 - P.specCost : 0) * 0.006) + 0.0008 * ((P.maxmana || 100) - 100) + 0.03 * ((P.manaHit || 2) - 2);
      dps *= 1 + ((P.statusDur || 1) - 1) * 0.2 + ((P.comboMult || 1) - 1) * 0.1 + (P.swapProc ? 0.02 : 0);
      const drP = P.dr - (P.drNT || 0) / 2; // nội tại giảm sát thương (Cu Lì, hoặc Zed được Cu Lì dạy) chỉ tính một nửa
      let ehp = P.maxhp / (1 - G.clamp(drP, 0, 0.75));
      let res = 0; for (const e of G.ELS) res += Math.min(0.8, P.resist[e] || 0);
      ehp *= 1 + 0.3 * (res / G.ELS.length);
      ehp *= 1 + (P.roomHeal || 0);
      if (P.dodgeCdMax < 1) ehp *= 1 + (1 - P.dodgeCdMax) * 0.2;
      const base = 72 * (G.HEROES[key].speed || 1);
      ehp *= 1 + G.clamp(P.speed / base - 1, 0, 0.5) * 0.2;
      // 14/10 (bước 1, mục 2): skill bộ đồ đã mở (cùng hệ số với Sức mạnh, js/bo_skill.js G.boSk.quyDoi)
      if (G.boSk && G.boSk.quyDoi) { const q = G.boSk.quyDoi(P); dps *= q.off; ehp *= q.ehp; }
      const v = Math.round(7 * Math.sqrt(Math.max(0, dps * ehp)));
      return { dps, ehp, value: isFinite(v) ? v : 0 };
    } finally { G.save = keep; }
  };
  // Lực chiến (số nguyên) của em bé key trong bản lưu sv. Hàm thuần: bản lưu không đổi. Lỗi thì trả 0.
  G.lucChien = function (sv, key) {
    try { const q = G.lucChienParts(sv, key); return q ? q.value : 0; } catch (e) { return 0; }
  };
  // Lực chiến nếu làm fn trên bản sao NÔNG của bản lưu (mảng carry được chép riêng nên bản thật không đổi).
  // fn(s) chỉ được đổi s.carry[...] (thử mang vũ khí).
  const CACHE = new Map();
  LC.thu = function (key, fn, sv) {
    sv = sv || G.save;
    if (!sv) return 0;
    const now = G.time || 0, hit = CACHE.get(key);
    if (hit && hit.sv === sv && now - hit.t < 0.5 && now >= hit.t) return hit.v;
    let v = 0;
    try {
      const v0 = G.lucChien(sv); // tính bản thật trước, rồi mới tới bản sao
      const c = Object.assign({}, sv, { carry: (sv.carry || []).slice() });
      fn(c);
      v = G.lucChien(c) - v0;
    } catch (e) { v = 0; }
    if (CACHE.size > 80) CACHE.clear();
    CACHE.set(key, { v, t: now, sv });
    return v;
  };
  // Mang vũ khí w ở ô slot thì lực chiến đổi bao nhiêu
  LC.thuVuKhi = (w, slot, sv) => LC.thu('w' + w.id + '-' + slot + '-' + ((sv || G.save).carry || []).join(','), (s) => { s.carry[slot] = w.id; }, sv);

  // ---------- số có dấu ngăn hàng nghìn: tiếng Việt 1.234, tiếng Anh 1,234 ----------
  G.soNghin = function (n) {
    const s = String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, G.LANG === 'en' ? ',' : '.');
    return (n < 0 ? '−' : '') + s;
  };
  LC.chu = (v) => G.t('Lực chiến {0}', G.soNghin(v));
  LC.delta = (d) => (d > 0 ? '▲ +' : '▼ −') + G.soNghin(Math.abs(d));

  // ---------- dải thông báo ----------
  // Theo dõi lực chiến của em bé đang chọn (mỗi 0,15 giây) ở làng và màn kết quả của ải; trong trận không hiện.
  // Đổi em bé, nạp bản lưu khác (đăng nhập, lưu mây) thì chỉ ghi mốc mới, không báo. Thay đổi liền nhau gộp vào một dải.
  const st = { sv: null, hero: null, v: null, chk: -1, toast: null, sfxT: -9 };
  LC.st = st;
  const nowS = () => (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
  const CHAY = 0.6, HIEN = 1.5; // số chạy 0,6 giây, rồi hiện thêm 1,5 giây
  function dangXem() {
    const sc = G.scene;
    if (!sc || G.noRender) return false;
    if (G.truyen && G.truyen.dang) return false;
    if (sc === G.Village) { const V = G.villageApi && G.villageApi.V; return !(V && V.tab === 'title'); }
    if (sc === G.StageScene && G.getRun) { const S = G.getRun(); return !!(S && S.mode === 'result'); }
    return false;
  }
  LC.dangHien = () => !!(st.toast && nowS() < st.toast.end);
  LC.baoDoi = function (from, to) { // hiện (hoặc gộp vào) dải thông báo từ giá trị from sang to
    const t = nowS(), q = st.toast;
    if (q && t < q.end) {
      const shown = q.from + (q.to - q.from) * ease(Math.min(1, (t - q.t0) / CHAY));
      q.from = shown; q.to = to; q.t0 = t; q.end = t + CHAY + HIEN;
    } else st.toast = { base: from, from, to, t0: t, born: t, end: t + CHAY + HIEN };
    const up = to > (st.toast.base);
    if (t - st.sfxT > 0.35) { st.sfxT = t; try { G.sfx(up ? 'mark' : 'pick', up ? 1.25 : 0.62); } catch (e) { /* bỏ qua */ } }
  };
  const ease = (k) => 1 - Math.pow(1 - k, 3);
  LC.kiem = function (force) {
    if (!LC.on() || !dangXem()) return;
    const sv = G.save;
    if (!sv || !sv.heroes) return;
    const t = nowS();
    if (!force && t - st.chk < 0.15) return;
    st.chk = t;
    const v = G.lucChien(sv);
    if (st.sv !== sv || st.hero !== sv.hero || st.v == null || !v) { st.sv = sv; st.hero = sv.hero; st.v = v; return; }
    if (v !== st.v) { const old = st.v; st.v = v; LC.baoDoi(old, v); }
  };
  LC.ve = function () {
    const q = st.toast;
    if (!q || !LC.on()) return;
    const t = nowS();
    if (t >= q.end) { st.toast = null; return; }
    if (!dangXem()) return;
    const T = G.theme, ui = G.ui, c = G.ux;
    const k = ease(Math.min(1, (t - q.t0) / CHAY)), cur = Math.round(q.from + (q.to - q.from) * k);
    const d = q.to - q.base, up = d >= 0;
    if (!d && k >= 1) return;
    const s1 = LC.chu(cur), s2 = LC.delta(d), size = 9;
    ui.font(size, true); const w1 = c.measureText(s1).width; ui.font(size, true); const w2 = c.measureText(s2).width;
    const w = Math.ceil(w1 + w2 + 10 + 40);
    const S = G.scene === G.StageScene;
    const x = Math.round(240 - w / 2), y = S ? 4 : 200; // làng: trên dải gợi ý dưới cùng (236); màn kết quả: mép trên
    if (T && T.toast) T.toast(x, y, w, '', { age: t - q.born, left: q.end - t });
    else ui.rect(x, y, w, 18, 'rgba(10,8,6,0.88)', '#ffd27a');
    // chữ hai màu (nảy và mờ theo dải)
    const age = t - q.born, left = q.end - t, ga0 = c.globalAlpha;
    let dy = 0;
    if (age < 0.14) dy = -Math.round(5 * (1 - age / 0.14)); else if (age < 0.26) dy = 1;
    c.globalAlpha = ga0 * Math.min(age < 0.12 ? 0.3 + (age / 0.12) * 0.7 : 1, left < 0.3 ? Math.max(0, left / 0.3) : 1);
    const tx0 = x + (w - w1 - w2 - 10) / 2, ty = y + dy + 9 + size * 0.36;
    ui.text(s1, tx0, ty, { size, bold: true, color: up ? '#ffe9a8' : '#f1e6c6' });
    // phần tăng / giảm: nảy nhẹ khi số vừa chạy xong
    const pop = k >= 1 && t - q.t0 - CHAY < 0.18 ? 1 : 0;
    ui.text(s2, tx0 + w1 + 10, ty - pop, { size, bold: true, color: up ? '#9be07a' : '#ff8f7f' });
    c.globalAlpha = ga0;
  };
  // Gắn vào cuối mỗi khung hình (sau khi cảnh đã vẽ): js/ui_theme.js gọi T.endFrame ở engine.js. Không nhận chạm nên không chặn nút nào.
  const T = G.theme;
  if (T && T.endFrame) {
    const cu = T.endFrame;
    T.endFrame = function () {
      const r = cu.apply(this, arguments);
      try { LC.kiem(); LC.ve(); } catch (e) { /* lỗi lực chiến không được làm đứng game */ }
      return r;
    };
  }
})();
