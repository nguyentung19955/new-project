// HÀNH TRANG: gom mọi thứ Zed đang có về một bảng nhiều thẻ.
//   Nhân vật (hình Zed, bộ trang phục + khung nâng bộ, cấp, sức mạnh, máu, mana, chỉ số), Vũ khí (4 vũ khí cố định, nâng bằng linh khí,
//   js/vk_moi.js), Kỹ năng (điểm, nút đã học, cây chưởng), Tài nguyên (biểu tượng, số, dùng để làm gì, kiếm ở đâu).
//   Đợt 2: bỏ thẻ Trang phục (quần áo cũ), Linh khí (dấu ấn từng vũ khí), rương vũ khí và bán đồ (js/ban_do.js đã xoá).
// Mở ở làng: nút túi vải góc trên bên phải (V.tab = 'bag'). Mở trong ải: nút "Hành trang" trong bảng Tạm dừng, chỉ xem.
// Mài, nâng lò vẫn ở người trong làng; bảng có nút "Đến chỗ ..." để sang người đó.
// Chỉ đọc ngón tay qua G.click, G.downs, G.pointers. Không đổi luật, số cân bằng; chỉ ghi bản lưu bằng cách làm giống các bảng cũ
// (hs.sk[b]++, js/vk_moi.js nâng vũ khí / bộ, rồi G.persist()).
(function () {
  const G = window.G, ui = G.ui, T = G.theme, VA = G.villageApi, VS = G.villageScene;
  if (!T || !VA) return;
  const V = VA.V;
  const SOFT = '#a9c2b4', TXT = '#f1e6c6', GOLD = '#f6dc92', GOOD = '#9be07a', WARN = '#ff9a5a';
  const X0 = 8, Y0 = 46, PW = 464, PH = 220; // khung bảng (như bảng Cô Thợ May, nằm dưới dải khuôn mặt)
  const CX = 16, CY = 92, CW = 448, CH = 170; // vùng nội dung bên dưới hàng thẻ
  const TABS = [['hero', 'Nhân vật'], ['weapon', 'Vũ khí'], ['skill', 'Kỹ năng'], ['res', 'Tài nguyên']];
  const B = (G.hanhTrang = { tab: 'hero', sel: null, sc: {}, view: false, open: false });
  let RO = false; // đang trong ải: chỉ xem

  // ---------- tiện ích ----------
  // Cắt chữ cho vừa bề rộng, thêm dấu "…"
  function fit(s, w, size, bold) {
    s = G.tv(s);
    ui.font(Math.max(6.5, size), bold);
    const c = G.ux;
    if (c.measureText(s).width <= w) return s;
    let lo = 0, hi = s.length;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (c.measureText(s.slice(0, m) + '…').width <= w) lo = m; else hi = m - 1; }
    return s.slice(0, lo).trimEnd() + '…';
  }
  const tx = (s, x, y, w, o) => ui.text(fit(String(s), w, o.size || 9, o.bold), x, y, o);
  const pct = (v) => Math.round(v * 100) + '%';
  const so1 = (v) => (G.LANG === 'en' ? v.toFixed(1) : v.toFixed(1).replace('.', ',')); // một số lẻ: tiếng Việt dùng dấu phẩy
  // Nút "Đến chỗ ...": sang người trong làng làm việc đó (chỉ ở làng)
  function goBtn(x, y, w, k, label) {
    if (RO) return false;
    if (T.sbtn(x, y, w, 17, label, { size: 7, pad: 2 })) { B.sel = null; VS.goNpc(k, true); return true; }
    return false;
  }
  // Ghi chú trong ải: không thay được đồ
  function roNote(x, y, align) { ui.text('Về làng để thay', x, y, { size: 7, bold: true, align: align || 'left', color: WARN }); }

  // ---------- vùng cuộn: kéo ngón lên xuống để cuộn, chữ và nút ngoài vùng bị che ----------
  // fn(y0) vẽ nội dung bắt đầu từ y0 (đã trừ phần cuộn) và trả về y cuối. Lần chạm ngoài vùng không lọt vào nút trong vùng.
  function region(key, x, y, w, h, fn) {
    const st = B.sc[key] || (B.sc[key] = { y: 0, max: 0 });
    // ngón đặt xuống trong vùng (G.downs đã được xoá trước lúc vẽ, nên xét các ngón đang giữ theo chỗ bắt đầu chạm)
    for (const q of G.pointers.values()) {
      if (q.role || q.stale) continue;
      if (q.htKey == null && G.inRect({ x: q.sx, y: q.sy }, x, y, w, h)) { q.htKey = key; q.htY = q.sy; }
      if (q.htKey === key) { st.y -= q.y - q.htY; q.htY = q.y; }
    }
    st.y = G.clamp(st.y, 0, st.max);
    const c = G.ux, cl = G.click, out = cl && !G.inRect(cl, x, y, w, h);
    if (out) G.click = null;
    c.save(); c.beginPath(); c.rect(x - 2, y, w + 4, h); c.clip();
    let end = y;
    try { end = fn(y - st.y); } finally { c.restore(); }
    if (out) G.click = cl;
    st.max = Math.max(0, Math.ceil(end + st.y - y - h + 4));
    st.y = G.clamp(st.y, 0, st.max);
    if (st.max > 0) { // thanh cuộn nhỏ bên phải
      const th = Math.max(16, (h * h) / (h + st.max)), ty = y + ((h - th) * st.y) / st.max;
      ui.rect(x + w + 1, y, 3, h, 'rgba(0,0,0,0.45)'); ui.rect(x + w + 1, ty, 3, th, T.C.gold);
    }
    return st;
  }

  // ---------- 1. Nhân vật ----------
  function heroArt(sv, x, y, w, h) {
    T.inset(x, y, w, h, false, { fill: '#173030' });
    const c = G.ux;
    c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(x + 1, y + h - 12, w - 2, 11);
    c.save(); c.beginPath(); c.rect(x + 1, y + 1, w - 2, h - 2); c.clip();
    c.translate(x + w / 2 + 6, y + h - 8); c.scale(2.2, 2.2);
    try { G.art.hero(c, { x: 0, y: 0, face: 1, key: sv.hero, t: G.time, move: false, atk: -1, dodge: -1, weapon: null, noShadow: true }); } catch (e) { /* thiếu hình thì bỏ qua */ }
    c.restore();
  }
  // Trang phục Zed (js/data.js G.ZED_BO; docs/review/ke-hoach-cai-thien/zed-bo-rung): dòng nhỏ trên khung hình Zed. Đã mở từ 2 bộ trở lên
  // thì là nút bấm đổi sang bộ kế tiếp (chỉ ở làng), chưa mở thì nhắc cách mở. Trả true nếu vừa đổi bộ (vẽ lại khung sau).
  function zedBoChon(sv) {
    if (!G.ZED_BO || !G.zedBo) return false;
    const cur = G.zedBo(sv), mo = G.ZED_BO_KEYS.filter((k) => G.zedBoMo(k, sv));
    const ten = G.t('Bộ: {0}', G.tv(G.ZED_BO[cur].ten));
    if (mo.length > 1 && !RO && !G.ZED_BO_THU) {
      if (T.sbtn(CX + 4, CY + 4, 104, 14, ten + ' ›', { size: 6.5, pad: 1 })) {
        const nx = mo[(mo.indexOf(cur) + 1) % mo.length];
        if (!sv.zed || typeof sv.zed !== 'object') return false;
        if (nx === 'ninja') delete sv.zed.bo; else sv.zed.bo = nx;
        G.persist(); G.sfx && G.sfx('ui');
        return true;
      }
      // còn bộ chưa mở (vd. đã có Rừng, chưa có Biển) → nhắc cách mở bộ kế tiếp dưới nút
      const kh = G.ZED_BO_KEYS.find((k) => !G.zedBoMo(k, sv)), rk = kh ? G.REGIONS[G.zedBoVung(kh)] : null;
      if (rk) tx(G.t('Hạ {0} để mở {1}', rk.bossName, G.tv(G.ZED_BO[kh].ten)), CX + 56, CY + 24, 104, { size: 6, align: 'center', color: SOFT });
      return false;
    }
    tx(ten, CX + 56, CY + 13, 104, { size: 6.5, bold: true, align: 'center', color: TXT });
    const khoa = G.ZED_BO_KEYS.find((k) => !G.zedBoMo(k, sv));
    if (khoa && !G.ZED_BO_THU) {
      const r = G.REGIONS[G.zedBoVung(khoa)];
      if (r) tx(G.t('Hạ {0} để mở {1}', r.bossName, G.tv(G.ZED_BO[khoa].ten)), CX + 56, CY + 22, 104, { size: 6, align: 'center', color: SOFT });
    } else if (mo.length > 1 && RO) tx('Về làng để thay', CX + 56, CY + 22, 104, { size: 6, align: 'center', color: WARN });
    return false;
  }
  function heroTab(sv) {
    const k = sv.hero, H = G.HEROES[k], hs = sv.heroes[k], P = G.buildPlayer(), pw = G.power();
    heroArt(sv, CX, CY + 2, 112, 96);
    if (zedBoChon(sv)) return;
    tx(H.name, CX + 56, CY + 111, 112, { size: 10, bold: true, align: 'center', color: GOLD });
    ui.text(hs.lvl >= G.MAX_LEVEL ? G.t('Cấp {0} (tối đa)', hs.lvl) : G.t('Cấp {0}', hs.lvl), CX + 56, CY + 122, { size: 8, bold: true, align: 'center', color: TXT });
    const xf = hs.lvl >= G.MAX_LEVEL ? 1 : hs.xp / G.xpNeed(hs.lvl);
    T.bar(CX + 4, CY + 127, 104, 'xp', xf, null, { h: 7 });
    ui.text(hs.lvl >= G.MAX_LEVEL ? 'Đã tối đa' : G.t('{0}/{1} kinh nghiệm', Math.floor(hs.xp), G.xpNeed(hs.lvl)), CX + 56, CY + 144, { size: 6.5, align: 'center', color: SOFT });
    if (!RO && T.sbtn(CX + 6, CY + 150, 100, 16, 'Nét đã học: Ông Từ', { size: 7, pad: 2 })) { VS.goNpc('tu', true); return; }
    const x = CX + 122, w = CW - 128;
    region('hero', x, CY, w, CH, (y) => {
      y += 11;
      // Lực chiến (js/luc_chien.js): con số to nhất của bảng, đổi theo mọi món đồ; Sức mạnh (so với khuyên dùng của ải) ở dòng dưới
      const LCU = G.lucChienUI;
      if (LCU && LCU.on()) {
        const lcs = LCU.chu(G.lucChien(sv));
        ui.text(lcs, x, y, { size: 11, bold: true, color: '#ffe9a8' });
        y += 12;
        ui.text(G.t('Sức mạnh {0}', pw), x, y, { size: 8, bold: true, color: GOLD });
        ui.font(8, true); const sx = x + G.ux.measureText(G.t('Sức mạnh {0}', pw)).width + 6;
        tx('(số này so với Sức mạnh khuyên dùng ở thẻ ải)', sx, y, x + w - sx, { size: 6.5, color: SOFT });
      } else {
        ui.text(G.t('Sức mạnh {0}', pw), x, y, { size: 11, bold: true, color: GOLD });
        ui.font(11, true); const sx = x + G.ux.measureText(G.t('Sức mạnh {0}', pw)).width + 8;
        tx('(số này so với Sức mạnh khuyên dùng ở thẻ ải)', sx, y, x + w - sx, { size: 6.5, color: SOFT });
      }
      y += 6;
      // chỉ số chính: hai cột
      const rows = [
        ['Máu', P.maxhp], ['Mana', P.maxmana],
        ['Sát thương thêm', '+' + pct(P.dmgMult - 1)], ['Chí mạng', pct(P.crit)],
        ['Giảm sát thương', pct(Math.min(0.75, P.dr))], ['Tốc chạy', pct(P.speed / 72)],
        ['Kháng Lửa', pct(P.resist.fire)], ['Kháng Độc', pct(P.resist.poison)],
        ['Kháng Băng', pct(P.resist.ice)], ['Hồi chiêu nhanh', '+' + pct(1 - (P.cdMul || 1))],
      ];
      const cw = (w - 6) / 2;
      rows.forEach((r, i) => {
        const cx = x + (i % 2) * (cw + 6), cy = y + Math.floor(i / 2) * 13;
        T.inset(cx, cy, cw, 12, false);
        ui.text(r[0], cx + 4, cy + 9, { size: 7, color: SOFT });
        ui.text(String(r[1]), cx + cw - 4, cy + 9, { size: 7.5, bold: true, align: 'right', color: r[0] === 'Máu' ? '#ff9a7a' : r[0] === 'Mana' ? '#8fc6ff' : TXT });
      });
      y += Math.ceil(rows.length / 2) * 13 + 10;
      T.head('Cu Tí', x, y); y += 3;
      // ZED: sở trường, nội tại, nét chưởng gồm cả các nét ba bạn đã dạy (js/data.js G.favOf, G.passiveOf, G.skillDescOf)
      y = ui.para(G.t('Sở trường: {0} (+10% sát thương)', G.favOf(k).map((f) => G.tv(G.WTYPES[f].name)).join(', ')), x, y + 8, w, { size: 7 });
      y = ui.para(G.t('Nội tại: {0}', G.passiveOf(k)), x, y, w, { size: 7, color: SOFT });
      y = ui.para(G.t('Chưởng ({0} mana, {1}). {2}', G.CHUONG ? G.CHUONG.cost : 30, G.chuong ? G.CHUONG.trees[G.chuong.state(sv.heroes[sv.hero], sv.hero).cay].name : '', G.skillDescOf(k)), x, y, w, { size: 7, color: SOFT });
      // khung nâng cấp bộ trang phục Zed đang mặc (js/vk_moi.js; đổi bộ ở nút trên hình Zed)
      if (G.vkMoi) y = G.vkMoi.boPanel(x, y + 4, w, RO, VA.say);
      // vũ khí đang mang
      y += 8; T.head('Vũ khí đang mang', x, y); y += 4;
      sv.carry.forEach((id) => {
        const wp = G.weaponById(id); if (!wp) return;
        tx(G.t('• {0} · sát thương mỗi đòn {1}', G.wName(wp), so1(G.wBase(wp, hs.lvl))), x, y + 8, w, { size: 7, color: G.RARITY[G.wRar(wp)].col });
        y += 10;
      });
      return y + 4;
    });
  }

  // ---------- 2. Vũ khí ----------
  function weaponTab(sv) {
    // 4 vũ khí cố định, nâng bằng linh khí ngay tại đây (js/vk_moi.js; trong ải chỉ xem)
    if (!G.vkMoi) return;
    region('weapon', CX, CY, CW - 4, CH, (y) => {
      y = G.vkMoi.vkPanel(CX, y + 2, CW - 8, { ro: RO, say: VA.say });
      // Đợt 6: ép đồ (bậc vũ khí, js/ep_do.js) ngay dưới; trong ải chỉ xem
      if (G.epDo && G.epDo.bat()) { T.head('Ép đồ', CX, y + 10); y = G.epDo.panel(CX, y + 14, CW - 8, { ro: RO, say: VA.say, h: 168 }); }
      if (RO) { roNote(CX, y + 10); return y + 14; }
      y += 2;
      if (goBtn(CX, y, 214, 'ren', 'Đến Ông Thợ Rèn: mài, nâng lò')) return y;
      return y + 20;
    });
  }

  // ---------- 3. Kỹ năng ----------
  function skillTab(sv) {
    // hai thẻ con: Cây kỹ năng (điểm mỗi 3 cấp) và Cây chưởng (điểm mỗi cấp, js/chuong_ui.js)
    if (G.chuongUI) {
      const cp = G.chuong.pts(sv.heroes[sv.hero], sv.hero).left;
      if (T.tab(CX, CY - 1, 120, 16, 'Cây kỹ năng', B.ktab !== 'chuong', { pad: 1, size: 7.5 })) B.ktab = 'skill';
      if (T.tab(CX + 124, CY - 1, 120, 16, G.t('Cây chưởng') + (cp > 0 ? ' (' + cp + ')' : ''), B.ktab === 'chuong', { pad: 1, size: 7.5, dot: cp > 0 && !RO })) B.ktab = 'chuong';
      if (B.ktab === 'chuong') { G.chuongUI.tree(CX, CY + 18, CW - 4, CH - 18, { ro: RO }); return; }
    }
    skillTree(sv);
  }
  function skillTree(sv) {
    const k = sv.hero, H = G.HEROES[k], hs = sv.heroes[k];
    const spent = hs.sk.atk + hs.sk.def + hs.sk.elem, pts = Math.floor(hs.lvl / 3) - spent;
    region('skill', CX, CY + 18, CW - 4, CH - 18, (y) => {
      ui.text(G.t('Còn {0} điểm kỹ năng', pts), CX, y + 10, { size: 9, bold: true, color: pts > 0 ? GOOD : SOFT });
      tx(G.t('Mỗi 3 cấp nhận 1 điểm. Đã học {0} nút. {1}', spent, RO ? 'Về làng để học thêm.' : pts > 0 ? 'Bấm Học để học nút kế tiếp.' : ''), CX + 130, y + 10, CW - 140, { size: 7, color: RO ? WARN : SOFT });
      y += 16;
      const cw = (CW - 16) / 3;
      let bottom = y;
      G.SKEYS.forEach((b, i) => {
        const Bk = G.SKILLS[b], n = hs.sk[b], x = CX + i * (cw + 4);
        let yy = y;
        T.inset(x, yy, cw, 20, false);
        ui.text(G.tv(Bk.name) + ' ' + n + '/5', x + 5, yy + 13, { size: 8.5, bold: true, color: GOLD });
        if (n < 5 && !RO) {
          if (T.sbtn(x + cw - 44, yy + 3, 40, 14, 'Học', { size: 7.5, pad: 2, primary: pts > 0, disabled: pts <= 0 })) { hs.sk[b]++; G.persist(); G.sfx('evolve'); VS.checkNews(); }
        }
        yy += 24;
        Bk.nodes.forEach((s, j) => {
          const got = j < n, nextOne = j === n;
          ui.text(got ? '✓' : nextOne ? '›' : '·', x + 3, yy + 8, { size: 7.5, bold: true, color: got ? GOOD : nextOne ? GOLD : '#5f7a74' });
          yy = ui.para(s, x + 12, yy + 8, cw - 14, { size: 6.5, color: got ? TXT : nextOne ? GOLD : SOFT }) - 6.5;
        });
        bottom = Math.max(bottom, yy);
      });
      y = bottom + 6;
      T.head(G.t('Chưởng và nội tại của {0}', H.name), CX, y + 6);
      y = ui.para(G.t('Chưởng ({0} mana). {1}. Nội tại: {2}.', G.CHUONG ? G.CHUONG.cost : 30, G.skillDescOf(k), G.passiveOf(k)), CX, y + 16, CW - 8, { size: 7, color: TXT });
      if (!RO) { y += 2; if (goBtn(CX, y, 220, 'do', 'Đến Cụ Đồ: cây kỹ năng, đặt lại điểm')) return y; y += 20; }
      return y;
    });
  }

  // ---------- 4. Tài nguyên ----------
  function resInfo() {
    const R = G.REGIONS;
    // Đợt 4: chữ theo luật mới (bỏ nâng bậc, trang phục cũ, đá tôi; mảnh trùm dùng nâng bộ, gỗ linh mài +6)
    const a = [
      ['gold', 'Mài, nâng lò, nâng bộ trang phục, đổi nguyên liệu, đặt lại điểm kỹ năng', 'Qua ải, hạ quái, tinh anh, trùm, phòng thử thách'],
      ['ore', 'Mài vũ khí, nâng lò cấp 4', 'Qua ải (nhiều sao được nhiều hơn), rương báu, phòng thử thách, thương nhân'],
    ];
    const matUse = ['Nâng lò cấp 2, mài +5 lên +6', 'Mài từ +6 tới +9, nâng lò cấp 3', 'Mài từ +9 trở lên, nâng lò cấp 4'];
    R.forEach((r, i) => a.push(['mat' + i, matUse[i] || 'Nguyên liệu vùng', G.t('Qua ải {0}', r.name)]));
    R.forEach((r, i) => a.push(['shard' + i, i === 0 ? 'Nâng bộ Ninja và bộ Rừng lên cấp 2, 3' : 'Nâng bộ của vùng này lên cấp 2, 3', G.t('Hạ trùm vùng {0} (ải 5 {1})', r.bossName, r.name)]));
    return a;
  }
  function resTab(sv) {
    const val = { gold: sv.gold, ore: sv.ore, stone: sv.stones };
    for (let i = 0; i < 3; i++) { val['mat' + i] = sv.mats[i]; val['shard' + i] = sv.shards[i]; }
    region('res', CX, CY, CW - 4, CH, (y) => {
      for (const q of resInfo()) {
        T.inset(CX, y, CW - 8, 24, false);
        T.resIcon(q[0], CX + 4, y + 4, 16);
        tx(T.resName(q[0]), CX + 24, y + 10, 100, { size: 7.5, bold: true, color: GOLD });
        ui.text(String(val[q[0]] | 0), CX + 24, y + 20, { size: 8.5, bold: true, color: TXT });
        tx(G.t('Dùng: {0}', q[1]), CX + 128, y + 10, CW - 142, { size: 6.5, color: TXT });
        tx(G.t('Kiếm: {0}', q[2]), CX + 128, y + 20, CW - 142, { size: 6.5, color: SOFT });
        y += 26;
      }
      // Đợt 6: đá nâng bậc, bùa giữ bậc (ép đồ, js/ep_do.js)
      if (G.epDo && G.epDo.bat()) {
        const ds = [[G.epDo.iconDa, 'Đá nâng bậc', G.epDo.da(sv), 'Ép vũ khí lên bậc (Ông Thợ Rèn, thẻ Ép đồ), đổi dòng hiệu ứng', 'Trùm nhỏ, trùm vùng (lần đầu nhiều hơn), Ải Đá Bậc (ải ngày)'],
          [G.epDo.iconBua, 'Bùa giữ bậc', G.epDo.bua(sv), 'Ép từ Vàng trở lên mà hỏng thì không tụt bậc', 'Trùm vùng, Ải Đá Bậc mức Khó, thương nhân trong ải']];
        for (const q of ds) {
          T.inset(CX, y, CW - 8, 24, false);
          q[0](CX + 12, y + 12, 16);
          tx(q[1], CX + 24, y + 10, 100, { size: 7.5, bold: true, color: GOLD });
          ui.text(String(q[2] | 0), CX + 24, y + 20, { size: 8.5, bold: true, color: TXT });
          tx(G.t('Dùng: {0}', q[3]), CX + 128, y + 10, CW - 142, { size: 6.5, color: TXT });
          tx(G.t('Kiếm: {0}', q[4]), CX + 128, y + 20, CW - 142, { size: 6.5, color: SOFT });
          y += 26;
        }
      }
      return y + 2;
    });
  }

  // ---------- khung bảng ----------
  // ro: đang trong ải (chỉ xem). close(): đóng bảng.
  function panel(ro, close) {
    RO = !!ro;
    const sv = G.save;
    B.open = true;
    // Trong ải: dòng nhắc nằm ở dải tiêu đề, hoa văn chim Lạc dừng trước dòng nhắc (không chữ nào đè hoa văn)
    const roTxt = 'Trong ải chỉ xem. Về làng để thay đồ, học kỹ năng.';
    let roW = 0; if (RO) { ui.font(6.5, false); roW = Math.ceil(G.ux.measureText(roTxt).width) + 10; }
    T.panel(X0, Y0, PW, PH, RO ? 'Hành trang (chỉ xem)' : 'Hành trang', { rightPad: 74 + roW, noBand: true });
    if (T.sbtn(X0 + PW - 66, Y0 + 3, 60, 17, RO ? '← Quay lại' : '✕ Xong', { size: 8, pad: 5 })) { close(); return; }
    if (RO) ui.text(roTxt, X0 + PW - 72, Y0 + 15, { size: 6.5, align: 'right', color: WARN });
    const tabs = TABS; // linh khí nay ở thẻ Vũ khí
    if (!tabs.some((t) => t[0] === B.tab)) B.tab = 'hero';
    const tw = (CW - (tabs.length - 1) * 3) / tabs.length;
    tabs.forEach((t, i) => {
      if (T.tab(CX + i * (tw + 3), Y0 + 23, tw, 19, G.tc('thẻ', t[1]), B.tab === t[0], { pad: 2 })) { B.tab = t[0]; B.sel = null; }
    });
    const fn = { hero: heroTab, weapon: weaponTab, skill: skillTab, res: resTab }[B.tab] || heroTab;
    fn(sv);
    // lời nhắn ngắn (đã nâng vũ khí, đã nâng bộ...)
    if (!RO && V.msgT > 0 && V.msg) T.toastFit(240, Y0 + PH - 8, V.msg, { size: 7.5 });
  }
  B.panel = panel;
  B.reset = function () { B.sel = null; B.sc = {}; };

  // ở làng: bảng 'bag' của village.js (tự vẽ, không có người nói bên trái)
  function bagPanel() { B.panel(false, () => { B.open = false; VA.goHub(); }); return null; }
  bagPanel.full = true;
  VA.PANELS.bag = bagPanel;
  B.openVillage = function () { B.reset(); V.tab = 'bag'; V.who = null; V.msgT = 0; G.sfx && G.sfx('ui'); };

  // ---------- nút túi vải ở góc trên bên phải của làng ----------
  const BAG = ['....kk.kk....', '...kaakaak...', '....kaaak....', '.....kak.....', '...kkkakkk...', '..kbbbbbbbk..', '.kbbgbbbgbbk.', 'kbbbbbgbbbbbk', 'kbgbbbbbbbgbk', 'kbbbbgbgbbbbk', 'kbbbbbbbbbbbk', '.kbbbbbbbbbk.', '..kkkkkkkkk..'];
  const PAL = { k: '#2a1408', a: '#f6dc92', b: '#a8452a', g: '#ffd23f' };
  let bagCv = null;
  const gdAnh = (ma) => { const s = G.spriteCustom; return s && s.gdSan ? s.gdSan(ma) : null; }; // ảnh AI giao diện (phiên C2): chưa có tệp thì trả về null, vẽ code y như cũ
  function bagIcon(cx, cy, s) {
    const ga = gdAnh('gd-tui');
    if (ga) { G.spriteCustom.veGd(G.ux, ga, Math.round(cx - 6.5 * s), Math.round(cy - 6.5 * s), 13 * s, 13 * s); return; }
    if (!bagCv) {
      bagCv = document.createElement('canvas'); bagCv.width = 13; bagCv.height = 13;
      const g = bagCv.getContext('2d');
      BAG.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (PAL[r[i]]) { g.fillStyle = PAL[r[i]]; g.fillRect(i, j, 1, 1); } });
    }
    const c = G.ux, sm = c.imageSmoothingEnabled; c.imageSmoothingEnabled = false;
    c.drawImage(bagCv, Math.round(cx - 6.5 * s), Math.round(cy - 6.5 * s), 13 * s, 13 * s);
    c.imageSmoothingEnabled = sm;
  }
  B.icon = bagIcon;
  B.HUB = [432, 17, 44, 31]; // vùng nút ở làng (dưới dải tài nguyên, bên phải dải khuôn mặt)
  B.hubButton = function () {
    const r = B.HUB, held = [...G.pointers.values()].some((q) => !q.role && !q.stale && G.inRect(q, r[0], r[1], r[2], r[3]));
    T.plate(r[0], r[1] + (held ? 1 : 0), r[2], r[3]);
    bagIcon(r[0] + r[2] / 2, r[1] + 11 + (held ? 1 : 0), 1.25);
    ui.text('Hành trang', r[0] + r[2] / 2, r[1] + 27 + (held ? 1 : 0), { size: 6.5, bold: true, tiny: true, align: 'center', color: GOLD });
    if ((G.click && G.inRect(G.click, r[0] - 2, r[1] - 1, r[2] + 4, r[3] + 2)) || G.keyP.KeyB) { G.click = null; B.openVillage(); return true; }
    return false;
  };
})();
