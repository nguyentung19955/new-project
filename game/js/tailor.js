// Bảng của Cô Thợ May (khung cửi): trang phục năm ô theo giao diện trống đồng (G.theme).
//   Mặc đồ: năm ô đang mặc, kho trang phục có lật trang, xem chỉ số và tác dụng, mặc, tháo, nâng bậc.
//   May đồ: may theo công thức từ gỗ linh, vảy cá, đá lửa (món bộ cần thêm một mảnh trùm).
//   Cánh: mở cấp cánh bằng mảnh trùm (mầm cánh, cánh nhỏ, cánh lớn).
// Bên trái luôn có em bé mặc thử, cử động được (đứng, chạy, lộn), và lời cô thợ may.
// Chỉ đọc ngón tay qua G.click (các nút của G.theme). Số liệu và luật ở js/outfit.js.
(function () {
  const G = window.G, ui = G.ui, T = G.theme, VA = G.villageApi, VS = G.villageScene;
  if (!VA || !G.outfit) return;
  const O = G.outfit, V = VA.V;
  const SOFT = '#a9c2b4', TXT = '#f1e6c6', GOLD = '#f6dc92', GOOD = '#9be07a', WARN = '#ff9a5a', PURP = '#d7b0ff';
  const X0 = 8, Y0 = 46, PW = 464, PH = 220;
  const RX = 150; // mép trái phần bên phải
  const HN = { fire: 'Lửa', poison: 'Độc', ice: 'Băng' };
  const say = (s) => VA.say(s);

  // Em bé mặc thử, phóng 3 lần, cử động theo chế độ đang chọn (đứng, chạy, lộn).
  function preview(sv) {
    const x = 14, y = 70, w = 128, h = 100;
    T.inset(x, y, w, h, false, { fill: '#173030' });
    const c = G.ux, t = G.time, lk = O.look(sv);
    // sàn và bóng
    c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(x + 1, y + h - 14, w - 2, 13);
    const mode = V.pv || 'dung';
    let o = { move: false, dodge: -1 };
    if (mode === 'chay') o = { move: true, dodge: -1 };
    else if (mode === 'lon') { const ph = (t * 1.1) % 1.4; o = { move: false, dodge: ph < 0.5 ? ph / 0.5 : -1 }; }
    c.save();
    c.beginPath(); c.rect(x + 1, y + 1, w - 2, h - 2); c.clip();
    c.translate(x + 76, y + h - 9); c.scale(2.5, 2.5);
    try { G.art.hero(c, Object.assign({ x: 0, y: 0, face: 1, key: sv.hero, t, atk: -1, weapon: null, outfit: lk }, o)); } catch (e) { /* bỏ qua */ }
    c.restore();
    const modes = [['dung', 'Đứng'], ['chay', 'Chạy'], ['lon', 'Lộn']];
    modes.forEach((m, i) => { if (T.sbtn(x + i * 43, y + h + 3, 41, 15, m[1], { size: 7, pad: 2, sel: mode === m[0] })) V.pv = m[0]; });
  }
  // Tổng chỉ số và bộ đang mặc (cột trái, dưới em bé mặc thử).
  function summary(sv) {
    const sm = O.sum(sv), s = sm.stats, keys = Object.keys(s);
    let y = 198;
    ui.text('Đang mặc tăng:', 14, y, { size: 7, bold: true, color: GOLD });
    const parts = keys.map((k) => O.statText(k, s[k]));
    y = ui.para(parts.length ? parts.join(', ') : 'chưa có gì', 14, y + 9, 128, { size: 6.5, color: parts.length ? TXT : SOFT });
    for (const k in sm.sets) {
      const n = sm.sets[k], S = O.SETS[k];
      if (n < 2) continue;
      y = ui.para(S.name + ' ' + n + '/5' + (n >= 3 ? ': +' + Math.round(sm.elBonus[S.el] * 100) + '% sát thương ' + HN[S.el] : ': thêm 1 món nữa để đủ bộ'), 14, y + 2, 128, { size: 6.5, bold: true, color: n >= 3 ? GOOD : SOFT });
    }
    return y;
  }
  // Lời cô thợ may: một dải giấy trên băng tiêu đề, cạnh tên cô (lời nhắn tạm thời nói thay câu thường).
  function talk(line) {
    const s = V.msgT > 0 && V.msg ? V.msg : line;
    if (!s) return;
    const x = 112, w = 282, L = ui.wrap(s, w - 10, 6.5, true).slice(0, 2), y = Y0 + 2;
    T.inset(x, y, w, 19, false, { fill: '#f3e8c8', col: '#a8752f' });
    L.forEach((l, i) => ui.text(l, x + 5, y + (L.length > 1 ? 8 : 12) + i * 8, { size: 6.5, bold: true, color: '#2a1a14', shadow: false }));
  }
  // Một ô đồ có hình món (và chấm đỏ nếu món mới).
  function cell(it, x, y, s, sel, o) {
    o = o || {};
    T.slot(x, y, s, it ? it.r : 0, { sel, dim: o.dim });
    if (it) O.drawIcon(G.ux, it, x + s / 2, y + s / 2, s - 8);
    if (it && it.n) { const c = G.ux; c.beginPath(); c.arc(x + s - 3, y + 3, 2.6, 0, 7); c.fillStyle = '#ff5a3a'; c.fill(); }
    if (it && O.ITEMS[it.k].el) { const c = G.ux; c.fillStyle = G.EL[O.ITEMS[it.k].el].col; c.fillRect(x + 3, y + s - 6, 3, 3); }
    return T.hit(x, y, s, s);
  }
  // Chi tiết một món: tên, ô, bậc, hệ, bộ, chỉ số, tác dụng.
  function details(it, x, y, w) {
    const Ti = O.ITEMS[it.k], R = G.RARITY[it.r];
    ui.text(O.name(it), x, y, { size: 8.5, bold: true, color: R.col });
    const tags = [O.SLOT_NAME[Ti.slot], 'bậc ' + R.name];
    if (Ti.el) tags.push('hệ ' + HN[Ti.el]);
    if (Ti.set) tags.push(O.SETS[Ti.set].name);
    ui.text(tags.join(' · '), x, y + 10, { size: 6.5, color: SOFT });
    const st = O.stats(it);
    ui.text(Object.keys(st).map((k) => O.statText(k, st[k])).join(', '), x, y + 20, { size: 7, color: TXT });
    const sp = O.special(it);
    if (sp) return ui.para('★ ' + sp.name + ': ' + sp.desc, x, y + 30, w, { size: 6.5, color: sp.key === 'none' ? SOFT : PURP });
    if (Ti.old) return ui.para('Tác dụng cũ: ' + G.GEAR.charm[Ti.old].desc + ' (hero từ cấp 5).', x, y + 30, w, { size: 6.5, color: PURP });
    if (it.r < 2) return ui.para('Lên bậc Tím: mở tác dụng đặc biệt' + (Ti.el ? ' hệ ' + HN[Ti.el] : ' (khiên đầu phòng)') + '.', x, y + 30, w, { size: 6.5, color: SOFT });
    return y + 30;
  }

  // ---------- thẻ Mặc đồ ----------
  function wearTab(sv) {
    let line = 'Chạm một ô để xem đồ của ô đó. Chọn món trong kho rồi bấm Mặc.';
    // năm ô đang mặc
    ui.text('Đang mặc', RX + 2, 98, { size: 7, bold: true, color: GOLD });
    O.SLOTS.forEach((slot, i) => {
      const x = RX + i * 40, y = 102, it = O.worn(sv, slot);
      if (cell(it, x, y, 30, V.oslot === slot)) {
        if (V.oslot === slot) V.oslot = null; else { V.oslot = slot; if (it) V.sel = it.id; }
        V.page = 0;
      }
      if (!it) ui.text('trống', x + 15, y + 19, { size: 6, align: 'center', color: '#5f7a74' });
      ui.text(O.SLOT_NAME[slot].split(',')[0], x + 15, y + 40, { size: 6, align: 'center', color: V.oslot === slot ? GOLD : SOFT });
    });
    // kho trang phục
    const all = sv.outfit.items.filter((it) => !V.oslot || O.ITEMS[it.k].slot === V.oslot);
    const wearing = (it) => sv.outfit.wear[O.ITEMS[it.k].slot] === it.id;
    all.sort((a, b) => (b.n - a.n) || (b.r - a.r) || (O.SLOTS.indexOf(O.ITEMS[a.k].slot) - O.SLOTS.indexOf(O.ITEMS[b.k].slot)) || (a.id - b.id));
    ui.text('Kho' + (V.oslot ? ' · ' + O.SLOT_NAME[V.oslot] : '') + ' (' + all.length + (V.oslot ? '' : '/' + O.MAX_ITEMS) + ')', 356, 98, { size: 7, bold: true, color: GOLD });
    if (V.oslot) { if (T.sbtn(424, 88, 42, 13, 'Tất cả', { size: 6.5, pad: 2 })) { V.oslot = null; V.page = 0; } }
    const per = 14, cols = 7;
    VA.pager(all.length, per, 366, 175);
    const page = all.slice(V.page * per, V.page * per + per);
    if (!all.length) ui.para(V.oslot ? 'Chưa có món nào cho ô này.' : 'Kho trống. Quái và trùm rơi trang phục; Bà Hàng Xén bán đồ thường; cô may được đồ bộ.', 356, 116, 108, { size: 6.5, color: SOFT });
    // lưới kho nằm dưới năm ô: 7 cột x 2 hàng
    page.forEach((it, i) => {
      const x = RX + (i % cols) * 29, y = 150 + Math.floor(i / cols) * 27;
      if (cell(it, x, y, 26, V.sel === it.id)) { V.sel = it.id; it.n = 0; }
      if (wearing(it)) { const c = G.ux; c.fillStyle = GOOD; c.fillRect(x + 2, y + 2, 4, 4); }
    });
    // ô chi tiết
    T.inset(RX, 205, 316, 58, false);
    const it = O.byId(sv, V.sel);
    if (!it) { ui.para('Chạm một món để xem chỉ số và tác dụng. Món đang mặc có dấu xanh.', RX + 6, 218, 300, { size: 7, color: SOFT }); return line; }
    details(it, RX + 6, 215, 214);
    const Ti = O.ITEMS[it.k], on = wearing(it);
    if (T.sbtn(RX + 226, 209, 86, 18, on ? 'Tháo ra' : 'Mặc', { size: 8, pad: 2, primary: !on })) {
      if (on) { O.unwear(sv, Ti.slot); say('Cởi ra rồi, bé mặc lại đồ quen nhé.'); }
      else { O.wear(sv, it); say(Ti.slot === 'wing' ? 'Cánh xinh quá! Bé lộn thử xem nào.' : 'Vừa in! Bé xoay một vòng cho cô xem.'); V.pv = Ti.slot === 'wing' ? 'lon' : 'chay'; }
      G.persist(); G.sfx('pick'); VS.checkNews();
    }
    const c = O.upCost(it);
    if (c) {
      const okp = O.canPay(sv, c);
      if (T.sbtn(RX + 226, 230, 86, 18, 'Lên ' + G.RARITY[it.r + 1].name, { size: 8, pad: 2, disabled: !okp })) {
        if (O.upgrade(sv, it)) { G.persist(); G.sfx('evolve'); say('Xong! ' + Ti.name + ' lên bậc ' + G.RARITY[it.r].name + '.' + (it.r === 2 ? ' Mở được tác dụng đặc biệt rồi đó.' : '')); }
      }
      T.resRow(T.costItems(c), RX + 222, 258, { size: 6.5, gap: 4 });
      line = okp ? 'Đủ đồ để nâng bậc món này đấy.' : 'Nâng bậc cần nguyên liệu của vùng món đó.';
    } else ui.text('Bậc cao nhất', RX + 269, 241, { size: 7, align: 'center', color: G.RARITY[3].col });
    return line;
  }

  // ---------- thẻ May đồ ----------
  function craftTab(sv) {
    const list = O.craftList();
    let line = 'Có gỗ linh, vảy cá, đá lửa thì cô may cho. Đồ bộ cần thêm một mảnh trùm.';
    const per = 4;
    VA.pager(list.length, per, 366, 192);
    list.slice(V.page * per, V.page * per + per).forEach((k, i) => {
      const Ti = O.ITEMS[k], y = 92 + i * 25, c = O.craftCost(k), own = O.has(sv, k), okp = O.canPay(sv, c);
      T.inset(RX, y, 316, 23, V.sel === k);
      if (T.hit(RX, y, 316, 23)) V.sel = k;
      T.slot(RX + 2, y + 1, 21, 0);
      O.drawIcon(G.ux, k, RX + 12, y + 11, 17);
      ui.text(Ti.name, RX + 28, y + 10, { size: 7.5, bold: true, color: Ti.set ? GOLD : TXT });
      ui.text(O.SLOT_NAME[Ti.slot] + (Ti.el ? ' · ' + HN[Ti.el] : '') + (Ti.set ? ' · ' + O.SETS[Ti.set].name : ''), RX + 28, y + 19, { size: 6, color: SOFT });
      T.resRow(T.costItems(c), RX + 150, y + 15, { size: 6.5, gap: 4 });
      ui.text(own ? 'đã có' : okp ? 'may được' : '', RX + 312, y + 9, { size: 6, align: 'right', color: own ? SOFT : GOOD });
    });
    T.inset(RX, 205, 316, 58, false);
    const k = typeof V.sel === 'string' ? V.sel : null;
    if (!k || !O.ITEMS[k]) { ui.para('Chạm một món để xem. Món may ra ở bậc Thường, nâng bậc ở thẻ Mặc đồ.', RX + 6, 218, 300, { size: 7, color: SOFT }); return line; }
    const fake = { k, r: 0, lv: 1 };
    details(fake, RX + 6, 215, 214);
    const c = O.craftCost(k), okp = O.canPay(sv, c) && !O.full(sv);
    if (T.btn(RX + 226, 212, 86, 30, 'May', { size: 10, primary: true, disabled: !okp })) {
      const it = O.craft(sv, k);
      if (it) { G.persist(); G.sfx('evolve'); V.sel = it.id; V.otab = 'wear'; V.oslot = O.ITEMS[k].slot; V.page = 0; say('May xong ' + O.name(it) + '! Bé mặc thử luôn đi.'); VS.checkNews(); }
    }
    T.resRow(T.costItems(c), RX + 222, 256, { size: 6.5, gap: 4 });
    if (!okp) line = O.full(sv) ? 'Kho đầy rồi, cô không may thêm được.' : 'Còn thiếu nguyên liệu. Vào ải ' + G.REGIONS[O.ITEMS[k].reg].name + ' kiếm thêm nhé.';
    return line;
  }

  // ---------- thẻ Cánh ----------
  function wingTab(sv) {
    const wings = sv.outfit.items.filter((it) => O.ITEMS[it.k].slot === 'wing');
    let line = 'Cánh lớn dần theo cấp: mầm cánh, cánh nhỏ, cánh lớn. Mở cấp bằng mảnh trùm.';
    ui.text('Cánh của bé (' + wings.length + ')', RX + 2, 98, { size: 7, bold: true, color: GOLD });
    if (!wings.length) {
      ui.para('Chưa có cánh. Cô may được Cánh chuồn chuồn ở thẻ May đồ; trùm vùng có thể rơi Cánh lá, Cánh băng, Cánh lửa.', RX + 2, 112, 310, { size: 7.5, color: TXT });
      line = 'Bé chưa có cánh. Gom gỗ linh, vảy cá, đá lửa, cô may cho đôi cánh chuồn chuồn.';
    }
    wings.slice(0, 8).forEach((it, i) => {
      const x = RX + i * 39, y = 104;
      if (cell(it, x, y, 34, V.sel === it.id)) V.sel = it.id;
      for (let j = 0; j < 3; j++) ui.rect(x + 7 + j * 8, y + 38, 6, 4, j < it.lv ? '#ffd23f' : '#0d1716', j < it.lv ? '#fff0a8' : T.C.brD);
    });
    const it = O.byId(sv, V.sel);
    T.inset(RX, 155, 316, 108, false);
    if (!it || O.ITEMS[it.k].slot !== 'wing') { if (wings.length) ui.text('Chạm một đôi cánh để xem.', RX + 6, 170, { size: 7.5, color: SOFT }); return line; }
    details(it, RX + 6, 166, 300);
    const Ti = O.ITEMS[it.k], on = sv.outfit.wear.wing === it.id;
    ui.para('Cánh chỉ là hình và tác dụng: bé không bay, không nhảy. Cánh vỗ khi đứng và khi lộn.', RX + 6, 214, 210, { size: 6.5, color: SOFT });
    if (T.sbtn(RX + 226, 160, 86, 18, on ? 'Tháo ra' : 'Mang cánh', { size: 8, pad: 2, primary: !on })) {
      if (on) O.unwear(sv, 'wing'); else { O.wear(sv, it); V.pv = 'lon'; }
      G.persist(); G.sfx('pick');
    }
    const c = O.wingCost(it);
    if (c) {
      const okp = O.canPay(sv, c);
      if (T.btn(RX + 226, 222, 86, 28, 'Mở cấp ' + (it.lv + 1), { size: 9, gold: true, disabled: !okp })) {
        if (O.wingUp(sv, it)) { G.persist(); G.sfx('evolve'); V.pv = 'lon'; say('Cánh lớn lên rồi! Giờ là ' + O.name(it) + '.'); }
      }
      T.resRow(T.costItems(c), RX + 6, 252, { size: 7, gap: 5 });
      line = okp ? 'Đủ mảnh trùm rồi, mở cấp cánh thôi!' : 'Mở cấp cánh cần mảnh trùm' + (Ti.el ? ' ' + G.REGIONS[Ti.reg].bossName : ' của cả ba vùng') + '.';
    } else { ui.text('Cánh đã lớn hết cỡ.', RX + 6, 252, { size: 7.5, color: GOOD }); line = 'Đôi cánh đẹp nhất làng rồi đó!'; }
    return line;
  }

  function panel() {
    const sv = G.save;
    O.sync(sv);
    T.panel(X0, Y0, PW, PH, 'Cô Thợ May', { rightPad: 74, noBand: true });
    if (T.sbtn(X0 + PW - 66, Y0 + 3, 60, 17, '✕ Xong', { size: 8, pad: 5 })) { VA.goHub(); return null; }
    const tabs = [['wear', 'Mặc đồ'], ['craft', 'May đồ'], ['wing', 'Cánh']];
    if (!V.otab) V.otab = 'wear';
    tabs.forEach((t, i) => {
      const dot = (t[0] === 'wear' && O.newCount(sv) > 0) || (t[0] === 'craft' && O.canCraftNew(sv));
      if (T.tab(RX + i * 76, 70, 72, 18, t[1], V.otab === t[0], { pad: 2, dot })) { V.otab = t[0]; V.sel = null; V.page = 0; }
    });
    preview(sv);
    const sy = summary(sv);
    const line = V.otab === 'craft' ? craftTab(sv) : V.otab === 'wing' ? wingTab(sv) : wearTab(sv);
    void sy;
    talk(line);
    return null;
  }
  panel.full = true;
  VA.PANELS.outfit = panel;
  G.tailor = { panel };
})();
