// HÀNH TRANG: gom mọi thứ em bé đang có về một bảng nhiều thẻ.
//   Nhân vật (hình em bé đang mặc, cấp, sức mạnh, máu, mana, chỉ số, tác dụng trang phục), Vũ khí (đang mang, trong rương, thay
//   vũ khí), Trang phục (đang mặc, kho, mặc/tháo), Linh khí (dấu ấn ba hệ của từng vũ khí, nguồn linh khí), Kỹ năng (điểm, nút đã học),
//   Tài nguyên (biểu tượng, số, dùng để làm gì, kiếm ở đâu).
// Mở ở làng: nút túi vải góc trên bên phải (V.tab = 'bag'). Mở trong ải: nút "Hành trang" trong bảng Tạm dừng, chỉ xem.
// Mua, may, mài, nâng bậc vẫn ở người trong làng; bảng có nút "Đến chỗ ..." để sang người đó.
// Chỉ đọc ngón tay qua G.click, G.downs, G.pointers. Không đổi luật, số cân bằng; chỉ ghi bản lưu bằng cách làm giống các bảng cũ
// (đổi sv.carry, G.outfit.wear/unwear, hs.sk[b]++ rồi G.persist()).
(function () {
  const G = window.G, ui = G.ui, T = G.theme, VA = G.villageApi, VS = G.villageScene;
  if (!T || !VA) return;
  const V = VA.V;
  const SOFT = '#a9c2b4', TXT = '#f1e6c6', GOLD = '#f6dc92', GOOD = '#9be07a', WARN = '#ff9a5a', PURP = '#d7b0ff';
  const X0 = 8, Y0 = 46, PW = 464, PH = 220; // khung bảng (như bảng Cô Thợ May, nằm dưới dải khuôn mặt)
  const CX = 16, CY = 92, CW = 448, CH = 170; // vùng nội dung bên dưới hàng thẻ
  const TABS = [['hero', 'Nhân vật'], ['weapon', 'Vũ khí'], ['outfit', 'Trang phục'], ['lk', 'Linh khí'], ['skill', 'Kỹ năng'], ['res', 'Tài nguyên']];
  const B = (G.hanhTrang = { tab: 'hero', sel: null, osel: null, oslot: null, sc: {}, view: false, wv: false, open: false });
  let RO = false; // đang trong ải: chỉ xem

  // ---------- tiện ích ----------
  // Cắt chữ cho vừa bề rộng, thêm dấu "…"
  function fit(s, w, size, bold) {
    ui.font(Math.max(6.5, size), bold);
    const c = G.ux;
    if (c.measureText(s).width <= w) return s;
    let lo = 0, hi = s.length;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (c.measureText(s.slice(0, m) + '…').width <= w) lo = m; else hi = m - 1; }
    return s.slice(0, lo).trimEnd() + '…';
  }
  const tx = (s, x, y, w, o) => ui.text(fit(String(s), w, o.size || 9, o.bold), x, y, o);
  const pct = (v) => Math.round(v * 100) + '%';
  const HN = { fire: 'Lửa', poison: 'Độc', ice: 'Băng' };
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
    try { G.art.hero(c, { x: 0, y: 0, face: 1, key: sv.hero, t: G.time, move: false, atk: -1, dodge: -1, weapon: null, noShadow: true, outfit: G.outfit ? G.outfit.look(sv) : null }); } catch (e) { /* thiếu hình thì bỏ qua */ }
    c.restore();
  }
  function heroTab(sv) {
    const k = sv.hero, H = G.HEROES[k], hs = sv.heroes[k], P = G.buildPlayer(), pw = G.power();
    heroArt(sv, CX, CY + 2, 112, 96);
    tx(H.name, CX + 56, CY + 111, 112, { size: 10, bold: true, align: 'center', color: GOLD });
    ui.text('Cấp ' + hs.lvl + (hs.lvl >= G.MAX_LEVEL ? ' (tối đa)' : ''), CX + 56, CY + 122, { size: 8, bold: true, align: 'center', color: TXT });
    const xf = hs.lvl >= G.MAX_LEVEL ? 1 : hs.xp / G.xpNeed(hs.lvl);
    T.bar(CX + 4, CY + 127, 104, 'xp', xf, null, { h: 7 });
    ui.text(hs.lvl >= G.MAX_LEVEL ? 'Đã tối đa' : Math.floor(hs.xp) + '/' + G.xpNeed(hs.lvl) + ' kinh nghiệm', CX + 56, CY + 144, { size: 6.5, align: 'center', color: SOFT });
    if (!RO && T.sbtn(CX + 6, CY + 150, 100, 16, 'Đổi hero: Ông Từ', { size: 7, pad: 2 })) { VS.goNpc('tu', true); return; }
    const x = CX + 122, w = CW - 128;
    region('hero', x, CY, w, CH, (y) => {
      y += 11;
      ui.text('Sức mạnh ' + pw, x, y, { size: 11, bold: true, color: GOLD });
      ui.font(11, true); const sx = x + G.ux.measureText('Sức mạnh ' + pw).width + 8;
      tx('(số này so với Sức mạnh khuyên dùng ở thẻ ải)', sx, y, x + w - sx, { size: 6.5, color: SOFT });
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
      T.head('Hero', x, y); y += 3;
      y = ui.para('Sở trường: ' + H.fav.map((f) => G.WTYPES[f].name).join(', ') + ' (+10% sát thương)', x, y + 8, w, { size: 7 });
      y = ui.para('Nội tại: ' + H.passive, x, y, w, { size: 7, color: SOFT });
      y = ui.para('Kỹ năng ' + H.skill + ' (40 mana): ' + H.skillDesc, x, y, w, { size: 7, color: SOFT });
      // trang phục
      y += 8; T.head('Trang phục đang mặc', x, y); y += 3;
      const O = G.outfit;
      if (O) {
        const sm = O.sum(sv), ks = Object.keys(sm.stats);
        y = ui.para(ks.length ? ks.map((q) => O.statText(q, sm.stats[q])).join(', ') : 'Chưa mặc món nào tăng chỉ số.', x, y + 8, w, { size: 7, color: ks.length ? TXT : SOFT });
        for (const s in sm.sets) {
          const n = sm.sets[s], S = O.SETS[s];
          if (n < 2) continue;
          y = ui.para(S.name + ' ' + n + '/5' + (n >= 3 ? ': +' + Math.round((sm.elBonus[S.el] || 0) * 100) + '% sát thương ' + HN[S.el] : ': mặc thêm 1 món của bộ để đủ bộ') + (sm.set2 && G.SETS[sm.set2] ? ' · ' + G.SETS[sm.set2] : ''), x, y + 1, w, { size: 7, bold: true, color: n >= 3 ? GOOD : SOFT });
        }
        for (const it of sm.items) { const sp = O.special(it); if (sp && sp.key !== 'none') y = ui.para('★ ' + sp.name + ': ' + sp.desc, x, y + 1, w, { size: 6.5, color: PURP }); }
      }
      // vũ khí đang mang
      y += 8; T.head('Vũ khí đang mang', x, y); y += 4;
      sv.carry.forEach((id) => {
        const wp = G.weaponById(id); if (!wp) return;
        tx('• ' + G.wName(wp) + ' · sát thương mỗi đòn ' + G.wBase(wp, hs.lvl).toFixed(1).replace('.', ','), x, y + 8, w, { size: 7, color: G.RARITY[G.wRar(wp)].col });
        y += 10;
      });
      return y + 4;
    });
  }

  // ---------- 2. Vũ khí ----------
  function featText(w) {
    if (!w.branch) return 'Chưa có hệ: đủ ' + G.MARKS[0] + ' dấu ấn một hệ thì vũ khí theo hệ đó';
    const st = G.wStage(w), cap = G.RARITY[G.wRar(w)].maxStage, m = Math.floor(w.marks[w.branch]);
    return G.HE_FEATURES[w.branch].map((f, i) => {
      const need = G.MARKS[i + 1];
      return f.name + ': ' + (st >= i + 2 ? 'đã mở' : i + 2 > cap ? 'cần bậc Lam' : 'còn ' + (need - m) + ' dấu ấn');
    }).join(' · ');
  }
  function weaponRow(sv, w, x, y, wd, carried) {
    const r = G.wRar(w), R = G.RARITY[r], sel = B.sel === w.id, mi = G.markInfo(w);
    T.inset(x, y, wd, 40, sel);
    T.slot(x + 3, y + 4, 32, r);
    G.art.weaponIcon(G.ux, w, x + 19, y + 20, 26);
    const bw = 104, tw = wd - 44 - bw;
    tx(G.wName(w), x + 40, y + 10, tw, { size: 8, bold: true, color: R.col });
    const aff = (w.affixes || []).map((k) => G.AFFIX[k]).concat(w.power && G.POWER[w.power] ? ['Dòng mạnh ' + G.POWER[w.power].name] : []);
    tx('Bậc ' + R.name + ' · mài +' + (w.sharpen | 0) + ' · đòn ' + G.wBase(w, sv.heroes[sv.hero].lvl).toFixed(1).replace('.', ',') + (aff.length ? ' · ' + aff.join(', ') : ' · không dòng phụ'), x + 40, y + 20, tw, { size: 6.5, color: TXT });
    tx(mi.txt, x + 40, y + 29, tw, { size: 6.5, color: mi.col === '#666' ? SOFT : mi.col });
    tx(featText(w), x + 40, y + 37.5, tw, { size: 6.5, color: SOFT });
    // nút bên phải
    const bx = x + wd - bw - 2;
    if (T.sbtn(bx, y + 3, bw, 15, 'Xem chi tiết', { size: 7, pad: 1 })) { openWeapon(w.id); return true; }
    if (carried) {
      ui.text('đang mang ô ' + (sv.carry.indexOf(w.id) + 1), bx + bw / 2, y + 30, { size: 7, bold: true, align: 'center', color: GOOD });
    } else if (RO) roNote(bx + bw / 2, y + 30, 'center');
    else {
      for (let s = 0; s < sv.carry.length; s++) {
        if (T.sbtn(bx + s * (bw / 2 + 1), y + 21, bw / 2 - 1, 15, 'Mang ô ' + (s + 1), { size: 7, pad: 1, primary: sel })) {
          sv.carry[s] = w.id; B.sel = null; G.persist(); G.sfx('pick'); VS.checkNews(); VA.say('Đã mang ' + G.wName(w) + ' ở ô ' + (s + 1) + '.');
          return true;
        }
      }
    }
    if (T.hit(x, y, wd - bw - 4, 40)) B.sel = sel ? null : w.id;
    return false;
  }
  function openWeapon(id) {
    if (RO) { V.wid = id; V.back = 'bag'; B.wv = true; G.sfx('ui'); }
    else VA.viewWeapon(id, 'bag');
  }
  function weaponTab(sv) {
    const carry = sv.carry.map((id) => G.weaponById(id)).filter(Boolean);
    const stash = sv.weapons.filter((w) => !sv.carry.includes(w.id)).sort((a, b) => (G.wRar(b) - G.wRar(a)) || (b.sharpen - a.sharpen) || (a.id - b.id));
    region('weapon', CX, CY, CW - 4, CH, (y) => {
      T.head('Đang mang (' + carry.length + ')', CX, y + 9);
      y += 13;
      for (const w of carry) { weaponRow(sv, w, CX, y, CW - 6, true); y += 43; }
      T.head('Trong rương (' + stash.length + ')', CX, y + 9);
      tx(RO ? 'Trong ải chỉ xem được. Về làng để thay vũ khí.' : 'Chạm một món rồi bấm "Mang ô 1" hoặc "Mang ô 2" để thay.', CX + 120, y + 9, CW - 130, { size: 6.5, color: RO ? WARN : SOFT });
      y += 13;
      if (!stash.length) { ui.text('Rương trống. Vũ khí nhặt trong ải sẽ nằm ở đây.', CX + 4, y + 10, { size: 7.5, color: SOFT }); y += 16; }
      for (const w of stash) { weaponRow(sv, w, CX, y, CW - 6, false); y += 43; }
      if (!RO) {
        y += 2;
        if (goBtn(CX, y, 214, 'ren', 'Đến Ông Thợ Rèn: mài, nâng bậc, tôi lại') || goBtn(CX + 220, y, 200, 'xen', 'Đến Bà Hàng Xén: bán vũ khí')) return y;
        y += 20;
      }
      return y;
    });
  }

  // ---------- 3. Trang phục ----------
  function cell(it, x, y, s, sel) {
    const O = G.outfit;
    T.slot(x, y, s, it ? it.r : 0, { sel });
    if (it) O.drawIcon(G.ux, it, x + s / 2, y + s / 2, s - 8);
    if (it && O.ITEMS[it.k] && O.ITEMS[it.k].el) { const c = G.ux; c.fillStyle = G.EL[O.ITEMS[it.k].el].col; c.fillRect(x + 3, y + s - 6, 3, 3); }
    return T.hit(x, y, s, s);
  }
  function outfitTab(sv) {
    const O = G.outfit;
    if (!O || !sv.outfit) { ui.text('Chưa có trang phục.', CX, CY + 20, { size: 8, color: SOFT }); return; }
    O.sync(sv);
    const LW = 222;
    const wearing = (it) => sv.outfit.wear[O.ITEMS[it.k].slot] === it.id;
    region('outfit', CX, CY, LW, CH, (y) => {
      T.head('Đang mặc', CX, y + 9);
      y += 13;
      O.SLOTS.forEach((slot, i) => {
        const x = CX + i * 44 + 2, it = O.worn(sv, slot);
        if (cell(it, x, y, 32, it ? B.osel === it.id : B.oslot === slot)) {
          if (it) { B.osel = B.osel === it.id ? null : it.id; B.oslot = null; } else B.oslot = B.oslot === slot ? null : slot;
        }
        if (!it) ui.text('trống', x + 16, y + 20, { size: 6.5, align: 'center', color: '#5f7a74' });
        tx(O.SLOT_NAME[slot].split(',')[0], x + 16, y + 42, 42, { size: 6.5, align: 'center', color: B.oslot === slot ? GOLD : SOFT });
      });
      y += 48;
      const all = sv.outfit.items.filter((it) => !B.oslot || O.ITEMS[it.k].slot === B.oslot);
      all.sort((a, b) => (b.r - a.r) || (O.SLOTS.indexOf(O.ITEMS[a.k].slot) - O.SLOTS.indexOf(O.ITEMS[b.k].slot)) || (a.id - b.id));
      T.head('Kho' + (B.oslot ? ' · ' + O.SLOT_NAME[B.oslot].split(',')[0] : '') + ' (' + all.length + (B.oslot ? '' : '/' + O.MAX_ITEMS) + ')', CX, y + 9);
      if (B.oslot && T.sbtn(CX + LW - 48, y, 44, 13, 'Tất cả', { size: 6.5, pad: 2 })) B.oslot = null;
      y += 13;
      if (!all.length) { y = ui.para(B.oslot ? 'Chưa có món nào cho ô này.' : 'Kho trống. Quái và trùm rơi trang phục, Bà Hàng Xén bán đồ thường, Cô Thợ May may đồ bộ.', CX, y + 9, LW - 4, { size: 7, color: SOFT }); return y; }
      all.forEach((it, i) => {
        const x = CX + (i % 7) * 31 + 2, yy = y + Math.floor(i / 7) * 31;
        if (cell(it, x, yy, 28, B.osel === it.id)) B.osel = B.osel === it.id ? null : it.id;
        if (wearing(it)) { const c = G.ux; c.fillStyle = GOOD; c.fillRect(x + 2, yy + 2, 4, 4); }
      });
      return y + Math.ceil(all.length / 7) * 31 + 4;
    });
    // bên phải: chi tiết món đang chọn, nút mặc/tháo, tác dụng đang có
    const RX = CX + LW + 10, RW = CW - LW - 14;
    region('outfit2', RX, CY, RW, CH, (y) => {
      const it = O.byId(sv, B.osel);
      if (!it) { y = ui.para('Chạm một món để xem chỉ số, bộ và tác dụng. Món đang mặc có dấu xanh.', RX, y + 9, RW, { size: 7, color: SOFT }); }
      else {
        const Ti = O.ITEMS[it.k], R = G.RARITY[it.r], on = wearing(it);
        tx(O.name(it), RX, y + 9, RW - 70, { size: 8.5, bold: true, color: R.col });
        if (RO) roNote(RX + RW, y + 9, 'right');
        else if (T.sbtn(RX + RW - 64, y, 64, 15, on ? 'Tháo ra' : 'Mặc', { size: 7.5, pad: 2, primary: !on })) {
          if (on) { O.unwear(sv, Ti.slot); VA.say('Đã tháo ' + O.name(it) + '.'); } else { O.wear(sv, it); VA.say('Đã mặc ' + O.name(it) + '.'); }
          G.persist(); G.sfx('pick'); VS.checkNews();
        }
        const tags = [O.SLOT_NAME[Ti.slot], 'bậc ' + R.name]; if (Ti.el) tags.push('hệ ' + HN[Ti.el]); if (Ti.set) tags.push(O.SETS[Ti.set].name);
        y = ui.para(tags.join(' · ') + (on ? ' · đang mặc' : ''), RX, y + 20, RW, { size: 6.5, color: on ? GOOD : SOFT });
        const st = O.stats(it), ks = Object.keys(st);
        y = ui.para(ks.length ? ks.map((q) => O.statText(q, st[q])).join(', ') : 'Không tăng chỉ số', RX, y, RW, { size: 7, color: TXT });
        const sp = O.special(it);
        if (sp) y = ui.para('★ ' + sp.name + ': ' + sp.desc, RX, y, RW, { size: 6.5, color: sp.key === 'none' ? SOFT : PURP });
        else if (Ti.old) y = ui.para('Tác dụng cũ: ' + G.GEAR.charm[Ti.old].desc + ' (hero từ cấp 5).', RX, y, RW, { size: 6.5, color: PURP });
        else if (it.r < 2) y = ui.para('Lên bậc Tím ở Cô Thợ May để mở tác dụng đặc biệt.', RX, y, RW, { size: 6.5, color: SOFT });
      }
      y += 6;
      T.head('Bộ và tác dụng đang có', RX, y + 6); y += 9;
      const sm = O.sum(sv), ks = Object.keys(sm.stats);
      y = ui.para(ks.length ? ks.map((q) => O.statText(q, sm.stats[q])).join(', ') : 'Chưa có.', RX, y + 6, RW, { size: 6.5, color: ks.length ? TXT : SOFT });
      for (const s in sm.sets) {
        const n = sm.sets[s], S = O.SETS[s];
        y = ui.para(S.name + ' ' + n + '/5' + (n >= 3 ? ': +' + Math.round((sm.elBonus[S.el] || 0) * 100) + '% sát thương ' + HN[S.el] : n >= 2 ? ': ' + (G.SETS[S.old] || 'thêm 1 món để đủ bộ') : ': mặc thêm món cùng bộ'), RX, y + 1, RW, { size: 6.5, bold: n >= 2, color: n >= 3 ? GOOD : SOFT });
      }
      for (const k in sm.specials) for (const q of sm.specials[k]) { const sp = O.special(q.it); if (sp) y = ui.para('★ ' + sp.name, RX, y + 1, RW, { size: 6.5, color: PURP }); }
      if (!RO) {
        y += 4;
        if (goBtn(RX, y, RW, 'may', 'Đến Cô Thợ May: may, nâng bậc')) return y;
        y += 20;
        if (goBtn(RX, y, RW, 'xen', 'Đến Bà Hàng Xén: mua đồ thường')) return y;
        y += 20;
      }
      return y;
    });
  }

  // ---------- 4. Linh khí ----------
  function lkTab(sv) {
    const L = G.LINHKHI || {}, LK = G.lk;
    const list = sv.carry.map((id) => G.weaponById(id)).filter(Boolean).concat(sv.weapons.filter((w) => !sv.carry.includes(w.id)));
    region('lk', CX, CY, CW - 4, CH, (y) => {
      T.head('Nguồn linh khí (dấu ấn hệ)', CX, y + 9);
      const src = ['hạ tinh anh +' + L.elite, 'trùm nhỏ +' + L.mini, 'trùm vùng +' + L.boss, 'kết liễu quái thường đang dính hệ +1'];
      if (L.drop > 0) src.push('quái thường ' + Math.round(L.drop * 100) + '% rơi viên linh khí, nhặt +' + L.orb);
      y = ui.para(src.join(' · ') + '. Hệ nhận được: hệ quái đang dính lúc gục, không dính thì theo hệ của vùng.' + (sv.hero === 'smith' ? ' Thợ Rèn nhận dấu ấn nhanh hơn 20%.' : ''), CX, y + 20, CW - 8, { size: 7, color: TXT });
      y = ui.para('Mốc tiến hoá: ' + G.MARKS.map((m, i) => m + ' ' + G.STAGE_NAMES[i + 1]).join(' · ') + '. Vũ khí Thường chỉ lên tới Thành hình.', CX, y + 1, CW - 8, { size: 6.5, color: SOFT });
      y += 5;
      const cw = (CW - 8 - 150) / 3;
      for (const w of list) {
        const r = G.wRar(w), on = sv.carry.includes(w.id);
        T.inset(CX, y, CW - 8, 34, false);
        T.slot(CX + 3, y + 3, 28, r);
        G.art.weaponIcon(G.ux, w, CX + 17, y + 17, 22);
        tx(G.wName(w), CX + 35, y + 12, 112, { size: 7.5, bold: true, color: G.RARITY[r].col });
        tx((on ? 'đang mang · ' : '') + (w.branch ? 'theo hệ ' + HN[w.branch] + ' · ' + G.STAGE_NAMES[G.wStage(w)] : 'chưa có hệ'), CX + 35, y + 22, 112, { size: 6.5, color: on ? GOOD : SOFT });
        G.ELS.forEach((el, i) => {
          const I = LK ? LK.info(w, el) : null, E = G.EL[el], x = CX + 150 + i * cw;
          if (!I) return;
          if (I.main) ui.rect(x, y + 2, cw - 3, 30, 'rgba(255,220,140,0.08)', E.col);
          if (LK) LK.icon(el, x + 7, y + 9, 1, !I.active);
          ui.text(E.name + ' ' + I.m, x + 14, y + 12, { size: 7.5, bold: I.main, color: I.active ? E.col : '#7f8f8a' });
          T.bar(x + 4, y + 15, cw - 11, null, I.frac, null, { h: 4, col: I.active ? E.col : '#55625e' });
          const nx = I.next == null ? 'đã đủ ' + G.MARKS[2] : !I.active ? 'đang theo hệ khác' : 'còn ' + I.left + ' tới ' + I.next + (I.idx > G.RARITY[r].maxStage ? ' (cần bậc Lam)' : '');
          tx(nx, x + 4, y + 28, cw - 8, { size: 6.5, color: I.active ? TXT : SOFT });
        });
        y += 37;
      }
      if (!RO) { if (goBtn(CX, y + 2, 230, 'ren', 'Đến Ông Thợ Rèn: tôi lại để đổi hệ')) return y; y += 22; }
      return y + 2;
    });
  }

  // ---------- 5. Kỹ năng ----------
  function skillTab(sv) {
    const k = sv.hero, H = G.HEROES[k], hs = sv.heroes[k];
    const spent = hs.sk.atk + hs.sk.def + hs.sk.elem, pts = Math.floor(hs.lvl / 3) - spent;
    region('skill', CX, CY, CW - 4, CH, (y) => {
      ui.text('Còn ' + pts + ' điểm kỹ năng', CX, y + 10, { size: 9, bold: true, color: pts > 0 ? GOOD : SOFT });
      tx('Mỗi 3 cấp nhận 1 điểm. Đã học ' + spent + ' nút. ' + (RO ? 'Về làng để học thêm.' : pts > 0 ? 'Bấm Học để học nút kế tiếp.' : ''), CX + 130, y + 10, CW - 140, { size: 7, color: RO ? WARN : SOFT });
      y += 16;
      const cw = (CW - 16) / 3;
      let bottom = y;
      G.SKEYS.forEach((b, i) => {
        const Bk = G.SKILLS[b], n = hs.sk[b], x = CX + i * (cw + 4);
        let yy = y;
        T.inset(x, yy, cw, 20, false);
        ui.text(Bk.name + ' ' + n + '/5', x + 5, yy + 13, { size: 8.5, bold: true, color: GOLD });
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
      T.head('Kỹ năng riêng của ' + H.name, CX, y + 6);
      y = ui.para(H.skill + ' (40 mana): ' + H.skillDesc + '. Nội tại: ' + H.passive + '.', CX, y + 16, CW - 8, { size: 7, color: TXT });
      if (!RO) { y += 2; if (goBtn(CX, y, 220, 'do', 'Đến Cụ Đồ: cây kỹ năng, đặt lại điểm')) return y; y += 20; }
      return y;
    });
  }

  // ---------- 6. Tài nguyên ----------
  function resInfo() {
    const R = G.REGIONS;
    const a = [
      ['gold', 'Mài, nâng bậc, nâng lò, may và mua trang phục, đặt lại điểm kỹ năng', 'Qua ải, hạ quái, bán vũ khí cho Bà Hàng Xén'],
      ['ore', 'Mài vũ khí, nâng vũ khí lên bậc Lam, nâng lò cấp 4', 'Qua ải (nhiều sao được nhiều hơn), rương báu, phòng thử thách, thương nhân'],
      ['stone', 'Tôi lại đổi hệ vũ khí, nâng lên Tím và Vàng, nâng bậc trang phục', 'Ba sao lần đầu, đôi khi sau ải, phòng thử thách'],
    ];
    const matUse = ['Nâng lò cấp 2, nâng vũ khí lên Lam, may và nâng đồ Bộ Rừng Già', 'Mài từ +5 tới +9, nâng vũ khí lên Tím, nâng lò cấp 3, may và nâng đồ Bộ Hang Biển', 'Mài từ +10, nâng lò cấp 4, may và nâng đồ Bộ Lâu Đài'];
    R.forEach((r, i) => a.push(['mat' + i, matUse[i] || 'Nguyên liệu vùng', 'Qua ải ' + r.name]));
    R.forEach((r, i) => a.push(['shard' + i, 'Nâng vũ khí lên Vàng (4 mảnh), may đồ bộ, mở cấp cánh', 'Hạ trùm vùng ' + r.bossName + ' (ải 5 ' + r.name + ')']));
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
        tx('Dùng: ' + q[1], CX + 128, y + 10, CW - 142, { size: 6.5, color: TXT });
        tx('Kiếm: ' + q[2], CX + 128, y + 20, CW - 142, { size: 6.5, color: SOFT });
        y += 26;
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
    if (RO && B.wv) { // xem chi tiết vũ khí trong ải: dùng lại màn "Xem vũ khí" của làng
      const was = V.tab; V.tab = 'weapon';
      VA.weaponView();
      if (V.tab !== 'weapon') B.wv = false;
      V.tab = was;
      if (G.keyP.Escape) { B.wv = false; G.keyP.Escape = false; }
      return;
    }
    T.panel(X0, Y0, PW, PH, RO ? 'Hành trang (chỉ xem)' : 'Hành trang', { rightPad: 74, noBand: true });
    if (T.sbtn(X0 + PW - 66, Y0 + 3, 60, 17, RO ? '← Quay lại' : '✕ Xong', { size: 8, pad: 5 })) { close(); return; }
    if (RO) ui.text('Trong ải chỉ xem. Về làng để thay đồ, học kỹ năng.', X0 + PW - 72, Y0 + 15, { size: 6.5, align: 'right', color: WARN });
    const tw = (CW - 5 * 3) / 6;
    TABS.forEach((t, i) => {
      if (T.tab(CX + i * (tw + 3), Y0 + 23, tw, 19, t[1], B.tab === t[0], { pad: 2 })) { B.tab = t[0]; B.sel = null; }
    });
    const fn = { hero: heroTab, weapon: weaponTab, outfit: outfitTab, lk: lkTab, skill: skillTab, res: resTab }[B.tab] || heroTab;
    fn(sv);
    // lời nhắn ngắn (đã thay vũ khí, đã mặc...)
    if (!RO && V.msgT > 0 && V.msg) T.toastFit(240, Y0 + PH - 8, V.msg, { size: 7.5 });
  }
  B.panel = panel;
  B.reset = function () { B.sel = null; B.osel = null; B.oslot = null; B.wv = false; B.sc = {}; };

  // ở làng: bảng 'bag' của village.js (tự vẽ, không có người nói bên trái)
  function bagPanel() { B.panel(false, () => { B.open = false; VA.goHub(); }); return null; }
  bagPanel.full = true;
  VA.PANELS.bag = bagPanel;
  B.openVillage = function () { B.reset(); V.tab = 'bag'; V.who = null; V.msgT = 0; G.sfx && G.sfx('ui'); };

  // ---------- nút túi vải ở góc trên bên phải của làng ----------
  const BAG = ['....kk.kk....', '...kaakaak...', '....kaaak....', '.....kak.....', '...kkkakkk...', '..kbbbbbbbk..', '.kbbgbbbgbbk.', 'kbbbbbgbbbbbk', 'kbgbbbbbbbgbk', 'kbbbbgbgbbbbk', 'kbbbbbbbbbbbk', '.kbbbbbbbbbk.', '..kkkkkkkkk..'];
  const PAL = { k: '#2a1408', a: '#f6dc92', b: '#a8452a', g: '#ffd23f' };
  let bagCv = null;
  function bagIcon(cx, cy, s) {
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
    ui.text('Hành trang', r[0] + r[2] / 2, r[1] + 27 + (held ? 1 : 0), { size: 6.5, bold: true, align: 'center', color: GOLD });
    if ((G.click && G.inRect(G.click, r[0] - 2, r[1] - 1, r[2] + 4, r[3] + 2)) || G.keyP.KeyB) { G.click = null; B.openVillage(); return true; }
    return false;
  };
})();
