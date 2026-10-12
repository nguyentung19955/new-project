// Làng: cảnh làng có người (js/village_scene.js). Mỗi chức năng là một người đứng cạnh công trình của mình:
//   Chú Lái Đò: tranh bản đồ vùng, chọn ải, độ khó, nút "Lên đò"      Ông Thợ Rèn: lò rèn (Mài, Nâng bậc, Tôi lại, Rèn đồ, Nâng lò)
//   Bà Hàng Xén: rương vũ khí, chọn hai món mang theo, bán đồ, bán trang phục thường
//   Cô Thợ May: trang phục năm ô (bảng riêng ở js/tailor.js)
//   Cụ Đồ: cây kỹ năng, đặt lại điểm, hướng dẫn                         Ông Từ: chọn hero, xem chỉ số
//   Anh Mõ: cài đặt                                                     Chạm vũ khí sống đang bay theo: xem vũ khí
//   Nút túi vải góc trên bên phải: Hành trang (js/hanh_trang.js), gom nhân vật, vũ khí, trang phục, linh khí, kỹ năng, tài nguyên
// Bảng nằm bên phải, người đứng bên trái và nói một câu. Hình vẽ theo chủ đề trống đồng (js/ui_theme.js).
(function () {
  const G = window.G, ui = G.ui, T = G.theme, VS = G.villageScene;
  const V = { tab: 'hub', who: null, sel: null, ftab: 'sharpen', node: null, page: 0, confirm: false, diff: 0, msg: null, msgT: 0, wid: null, back: 'hub', dtab: 'skill' };
  const TAB_OF = { lai: 'map', ren: 'forge', xen: 'gear', may: 'outfit', do: 'skill', tu: 'hero', mo: 'settings' };
  const WHO_OF = { map: 'lai', forge: 'ren', gear: 'xen', outfit: 'may', skill: 'do', chuong: 'do', help: 'do', rank: 'do', hero: 'tu', settings: 'mo' };
  // Khung bảng bên phải và vùng nội dung bên trong
  const PX = 152, PY = 46, PW = 320, PH = 220, CX = 160, CW = 304;
  const SOFT = '#a9c2b4', TXT = '#f1e6c6', GOLD = '#f6dc92', GOOD = '#9be07a', WARN = '#ff9a5a';

  function say(s) { V.msg = s; V.msgT = 2.5; }
  // Dấu thập phân trong con số hiển thị: tiếng Việt dùng dấu phẩy (x1,15), tiếng Anh dùng dấu chấm (x1.15)
  const dp = () => (G.LANG === 'en' ? '.' : ',');
  // V25 (chữ to hơn): đoạn chữ trong khung cố định — vượt quá maxLines dòng thì vẽ cỡ nhỏ cũ để không lọt khỏi khung
  function fitPara(str, x, y, w, o, maxLines) { return ui.para(str, x, y, w, Object.assign({}, o, { tiny: ui.wrap(str, w, o.size, o.bold).length > maxLines })); }
  // Cắt một dòng cho vừa bề rộng, thêm "…"
  function cut1(str, w, size, bold) { const a = ui.wrap(str, w, size, bold); return a.length > 1 ? a[0] + '…' : a[0] || ''; }
  function canPay(c) {
    const sv = G.save;
    if (!c) return true;
    if (c.gold && sv.gold < c.gold) return false;
    if (c.ore && sv.ore < c.ore) return false;
    if (c.stones && sv.stones < c.stones) return false;
    if (c.mat) for (let i = 0; i < 3; i++) if (sv.mats[i] < (c.mat[i] || 0)) return false;
    if (c.shard) for (let i = 0; i < 3; i++) if (sv.shards[i] < (c.shard[i] || 0)) return false;
    return true;
  }
  function pay(c) {
    const sv = G.save;
    sv.gold -= c.gold || 0; sv.ore -= c.ore || 0; sv.stones -= c.stones || 0;
    if (c.mat) for (let i = 0; i < 3; i++) sv.mats[i] -= c.mat[i] || 0;
    if (c.shard) for (let i = 0; i < 3; i++) sv.shards[i] -= c.shard[i] || 0;
  }
  function costText(c) {
    const a = [];
    if (c.gold) a.push(G.t('{0} vàng', c.gold));
    if (c.ore) a.push(G.t('{0} quặng', c.ore));
    if (c.stones) a.push(G.t('{0} đá tôi', c.stones));
    if (c.mat) c.mat.forEach((n, i) => { if (n) a.push(G.t('{0} {1}', n, G.REGIONS[i].mat.toLowerCase())); });
    if (c.shard) c.shard.forEach((n, i) => { if (n) a.push(G.t('{0} mảnh {1}', n, G.REGIONS[i].bossName)); });
    return a.join(', ');
  }
  // Mở bảng của một người (k: lai, ren, xen, may, do, tu, mo)
  function open(k) {
    V.who = k; V.tab = TAB_OF[k]; V.sel = null; V.page = 0; V.confirm = false; V.node = null; V.msgT = 0; V.cd2 = false;
    if (G.banDo) G.banDo.reset();
    if (k === 'do') {
      V.tab = V.dtab === 'help' || (V.dtab === 'chuong' && chuongOpen()) || (V.dtab === 'rank' && PANELS.rank) ? V.dtab : 'skill';
      // V29 (O7): thẻ Cây kỹ năng hết điểm mà còn điểm chưởng thì mở thẳng thẻ Cây chưởng, khỏi thấy "Còn 0 điểm"
      if (V.tab === 'skill' && chuongOpen() && G.chuong) {
        const sv = G.save, hs = sv.heroes[sv.hero];
        if (Math.floor(hs.lvl / 3) - (hs.sk.atk + hs.sk.def + hs.sk.elem) <= 0 && G.chuong.pts(hs, sv.hero).left > 0) V.tab = 'chuong';
      }
    }
    if (k === 'lai') pickNext();
  }
  // V53: thẻ Cây chưởng chỉ hiện sau khi qua ải đầu tiên (người mới làm quen Cây kỹ năng trước)
  function chuongOpen() { return Object.keys(G.save.stars || {}).length >= 1; }
  function goHub() {
    const was = V.tab;
    V.tab = 'hub'; V.who = null; V.sel = null; V.node = null; V.confirm = false; V.page = 0;
    if (G.banDo) G.banDo.reset();
    if (was !== 'hub' && was !== 'title' && was !== 'weapon') VS.closeTalk();
    VS.state.talk = null;
    // rời Cô Thợ May: các món mới đã được thấy trong kho, bỏ dấu báo mới
    if (was === 'outfit' && G.outfit && G.save.outfit) { for (const it of G.save.outfit.items) it.n = 0; G.persist(); VS.checkNews(); }
  }
  G.villageApi = { canPay, pay, V, open, goHub, TAB_OF };
  VS.onTalk = open;
  VS.onWeapon = (id) => viewWeapon(id, 'hub');

  function frame(title) {
    T.panel(PX, PY, PW, PH, title, { rightPad: 74, noBand: true });
    if (T.sbtn(PX + PW - 66, PY + 3, 60, 17, '✕ Xong', { size: 8, pad: 5 })) goHub();
  }
  // Nút lật trang: ‹ Trang 1/3 ›. Trả về số trang.
  function pager(n, per, x, y) {
    const pages = Math.max(1, Math.ceil(n / per));
    V.page = G.clamp(V.page, 0, pages - 1);
    if (pages > 1) {
      if (T.sbtn(x, y - 1, 26, 18, '‹', { size: 10, pad: 4 })) V.page = (V.page + pages - 1) % pages;
      ui.text(G.t('Trang {0}/{1}', V.page + 1, pages), x + 50, y + 11.5, { size: 7.5, align: 'center', color: SOFT });
      if (T.sbtn(x + 74, y - 1, 26, 18, '›', { size: 10, pad: 4 })) V.page = (V.page + 1) % pages;
    }
    return pages;
  }
  // Người đứng bên trái bảng và nói một câu (lời nhắn tạm thời thì nói thay câu thường)
  function npcSide(text) {
    const k = V.who || WHO_OF[V.tab];
    if (!k) return;
    const N = VS.NPCS[k];
    VS.bigNpc(G.ux, k, 78, 262, 3, Math.floor(G.time * 2) % 3);
    T.dialog(8, 64, 138, N.ten, V.msgT > 0 && V.msg ? V.msg : text || N.chao, { tail: 58 });
  }

  // ---------- bản đồ vùng dạng tranh vẽ (Chú Lái Đò) ----------
  function unlocked(r, i, diff) {
    const map = diff ? G.save.stars2 : G.save.stars;
    if (diff && Object.keys(G.save.stars).length < 15) return false;
    if (r === 0 && i === 0) return true;
    const pr = i === 0 ? r - 1 : r, pi = i === 0 ? 4 : i - 1;
    return !!map[pr + '-' + pi];
  }
  // Chọn sẵn ải đang tới: ải đã mở đầu tiên chưa có sao
  function pickNext() {
    const map = V.diff ? G.save.stars2 : G.save.stars;
    V.sel = null;
    for (let r = 0; r < 3 && !V.sel; r++) for (let i = 0; i < 5; i++) if (unlocked(r, i, V.diff) && !map[r + '-' + i]) { V.sel = [r, i]; break; }
    if (!V.sel) V.sel = [0, 0];
  }
  function inkText(s, x, y, size, col, halo) { // chữ trên giấy: viền sáng quanh chữ
    const c = G.ux;
    ui.font(size, true); c.textAlign = 'center'; c.lineJoin = 'round'; c.lineWidth = size / 3.2; c.strokeStyle = halo || 'rgba(240,230,200,0.9)';
    c.strokeText(s, x, y);
    ui.text(s, x, y, { size, bold: true, align: 'center', color: col, shadow: false });
  }
  function mapScreen() {
    const sv = G.save, c = G.wx, M = VS.MAP, night = !!V.diff;
    const all = Object.keys(sv.stars).length >= 15;
    if (!all) V.diff = 0;
    const map = V.diff ? sv.stars2 : sv.stars;
    G.wxDat(c, 0, 0); c.globalAlpha = 1;
    c.drawImage(VS.mapArt(night), 0, 0);
    // đường nét đứt nối các ải theo thứ tự; chưa mở thì nhạt
    const ink = night ? '#3a2a4a' : '#7a4a30', faint = night ? '#6a6488' : '#b8a880';
    for (let r = 0; r < 3; r++) {
      const n = M.nodes[r];
      VS.mapDash(c, M.from[r], n[0], unlocked(r, 0, V.diff) ? ink : faint);
      if (r === 2) VS.mapDash(c, M.nodes[1][4], n[0], unlocked(2, 0, V.diff) ? ink : faint);
      for (let i = 0; i < 4; i++) VS.mapDash(c, n[i], n[i + 1], unlocked(r, i + 1, V.diff) ? ink : faint);
    }
    VS.mapDash(c, M.nodes[2][4], [392, 70], faint); VS.mapDash(c, M.nodes[2][3], [420, 150], faint); VS.mapDash(c, M.nodes[1][4], [344, 194], faint);
    VS.putNpc(c, 'lai', 32, 264, Math.floor(G.time * 2) % 3, { look: 1, noShadow: true }, 2);
    // tên vùng, tên trùm, vùng sắp có
    const halo = night ? 'rgba(20,16,40,0.85)' : null;
    inkText('Làng', 36, 110, 8, night ? '#e8dcc0' : '#4a3626', halo);
    for (let r = 0; r < 3; r++) {
      const q = M.names[r], R = G.REGIONS[r], b = M.nodes[r][4];
      inkText(R.name, q[0], q[1], 10, night ? '#f1e6c6' : q[2], halo);
      inkText(R.bossName, b[0] + (r === 2 ? 40 : 38), b[1] + (r === 2 ? -6 : 3), 6.5, night ? '#e8dcc0' : '#4a3626', halo);
    }
    for (const q of M.soon) {
      inkText(q[0], q[1], q[2], 8, night ? '#8a86a8' : '#8a7a58', halo);
      const px = q[3] || q[1], py = q[4] || q[2] + 12;
      ui.font(6.5, true); ui.rect(px - 16, py - 7, 32, 10, 'rgba(74,54,38,0.85)'); ui.text(G.tc('bản đồ', 'sắp có'), px, py + 0.6, { size: 6.5, bold: true, align: 'center', color: '#f0e6c8', shadow: false });
    }
    // 15 thẻ ải mặt trống; ải chưa qua ghi sức mạnh khuyên dùng, tô màu so với sức mạnh của bé (xanh đủ, vàng sát nút, đỏ thiếu)
    const pw = G.power();
    let hit = null, hd = 19;
    for (let r = 0; r < 3; r++) for (let i = 0; i < 5; i++) {
      const q = M.nodes[r][i], st = map[r + '-' + i] || 0, ok = unlocked(r, i, V.diff), boss = i === 4, rad = boss ? 12 : 10;
      const selc = V.sel && V.sel[0] === r && V.sel[1] === i;
      T.stageCard(q[0] - 20, q[1] - rad - 4, 40, 36, i + 1, !ok ? 'lock' : selc ? 'sel' : st ? 'done' : 'open', st, { r: rad, boss, noClick: true, noStars: true });
      if (ok && st) inkText('★'.repeat(st) + '☆'.repeat(3 - st), q[0], q[1] + rad + 8.5, 6.5, '#ffd23f', 'rgba(74,54,38,0.95)');
      else if (ok && !selc) { const need = G.stageRec(r, i, V.diff); inkText('⚔' + need, q[0], q[1] + rad + 8.5, 6.5, G.powerCol(pw, need), 'rgba(40,28,20,0.92)'); }
      if (ok && G.click) { const d = Math.hypot(G.click.x - q[0], G.click.y - q[1]); if (d < hd) { hd = d; hit = [r, i]; } }
    }
    if (hit && !(G.click.x > 246 && G.click.y > 206)) { V.sel = hit; G.click = null; G.sfx('ui'); }
    // em bé đứng ở ải đang chọn
    if (V.sel) {
      const q = M.nodes[V.sel[0]][V.sel[1]], rad = V.sel[1] === 4 ? 12 : 10;
      G.art.hero(G.ux, { x: q[0], y: q[1] - rad + 1, face: 1, key: sv.hero, move: false, t: G.time, atk: -1, dodge: -1, weapon: null, outfit: G.outfit ? G.outfit.look(sv) : null, noShadow: true });
      VS.bubble(V.sel[1] === 4 ? G.t('Trùm {0}', G.REGIONS[V.sel[0]].bossName) : G.t('Ải {0}', V.sel[1] + 1), q[0], q[1] - rad - 26, { bg: '#ffe9a8', size: 7.5 });
    }
    VS.bubble(V.msgT > 0 && V.msg ? V.msg : V.sel ? 'Lên đò đi cháu, nước đang êm.' : 'Đi đâu hả cháu?', 40, 198, { maxW: 76, size: 7.5 });
    if (T.sbtn(404, 7, 68, 18, '✕ Về làng', { size: 8, pad: 4 })) { goHub(); return; }
    if (all) {
      if (T.sbtn(330, 182, 142, 19, V.diff ? 'Độ khó 2 (chạm để đổi)' : 'Độ khó thường (chạm để đổi)', { size: 7.5, pad: 3, sel: !!V.diff })) { V.diff = V.diff ? 0 : 1; pickNext(); }
    }
    // thẻ thông tin ải và nút Lên đò
    T.panel(248, 206, 226, 60, null, { plain: true, noBand: true });
    if (V.sel) {
      const r = V.sel[0], i = V.sel[1], R = G.REGIONS[r], b = G.stageStats(r, i, V.diff);
      ui.text(G.t(V.diff ? '{0} · {1} · khó 2' : '{0} · {1}', R.name, i === 4 ? 'Ải trùm' : G.t('Ải {0}', i + 1)), 256, 219, { size: 9.5, bold: true, color: GOLD });
      const l2 = G.t('{0} · 8 phòng · ', i === 4 ? G.t('Trùm {0}', R.bossName) : G.t('Trùm nhỏ {0}', R.mini));
      ui.text(l2, 256, 230, { size: 7, color: TXT });
      ui.font(7); ui.text(G.t('hệ {0}', G.EL[R.el].name), 256 + G.ux.measureText(l2).width, 230, { size: 7, color: G.EL[R.el].col });
      // Sức mạnh khuyên dùng so với sức mạnh hiện tại của bé (G.power): xanh đủ, vàng sát nút, đỏ thiếu
      const need = G.stageRec(r, i, V.diff), col = G.powerCol(pw, need);
      ui.text(G.t('Sức mạnh khuyên dùng {0} · bé {1}', need, pw), 256, 240, { size: 7.5, bold: true, color: col });
      // V25: chữ to hơn; dòng thưởng dài quá 2 dòng (ải trùm) thì giữ cỡ nhỏ cũ để không lọt khỏi khung
      const rw = i === 4 ? G.t('Thưởng: {0} kinh nghiệm, ~{1} vàng, {2} {3}, {4} mảnh {5}, vũ khí quý', b.xp, b.gold, 5 + i, R.mat.toLowerCase(), V.diff ? 4 : 3, R.bossName) : G.t('Thưởng: {0} kinh nghiệm, ~{1} vàng, {2} {3}', b.xp, b.gold, 5 + i, R.mat.toLowerCase());
      ui.para(rw, 256, 250.5, 144, { size: 6.5, color: SOFT, tiny: ui.wrap(rw, 144, 6.5).length > 2 });
      if (T.btn(404, 217, 64, 38, 'Lên đò', { size: 11, primary: true })) G.startStage(r, i, V.diff);
    } else ui.text('Chạm một ải trên tranh để xem.', 256, 238, { size: 8, color: SOFT });
  }

  // ---------- xem một vũ khí: bậc, dòng phụ, đặc trưng hệ đã mở và sắp mở ----------
  function viewWeapon(id, back) { V.wid = id; V.back = back || 'hub'; V.tab = 'weapon'; G.sfx('ui'); }
  function weaponView() {
    const sv = G.save, w = G.weaponById(V.wid);
    T.panel(8, 26, 464, 240, 'Xem vũ khí', { rightPad: 90, noBand: true });
    if (T.sbtn(396, 29, 70, 17, '← Quay lại', { size: 8, pad: 4 }) || !w) { V.tab = V.back; if (V.tab === 'hub') goHub(); return; }
    const r = G.wRar(w), rar = G.RARITY[r], st = G.wStage(w), WA = G.weaponArt;
    const fam = WA ? WA.FAMILIES[w.type][w.family] : null;
    // ô hình lớn, viền màu bậc
    T.slot(18, 56, 70, r);
    G.art.weaponIcon(G.ux, w, 53, 91, 54, 'idle');
    if (G.LANG === 'vi') ui.text(G.wName(w), 96, 68, { size: 10.5, bold: true, color: rar.col });
    else { const q = T.vua(G.wName(w), 150, 10.5, true); ui.text(q[0], 96, 68 + (q[1] - 10.5) * 0.36, { size: q[1], bold: true, color: rar.col }); } // tên tiếng Anh dài: thu cỡ chữ cho khỏi lấn cột bên phải
    ui.text(fam ? G.t('Bậc {0} · dòng {1}', rar.name, fam.name) : G.t('Bậc {0} · {1}', rar.name, G.WTYPES[w.type].name), 96, 80, { size: 7.5, color: SOFT });
    if (fam && fam.nature) ui.text(G.t('Tính nết: {0}', fam.nature), 96, 91, { size: 7.5, color: SOFT });
    ui.text(G.t('Sát thương mỗi đòn {0} · hệ số bậc x{1}', G.wBase(w, sv.heroes[sv.hero].lvl).toFixed(1).replace('.', dp()), String(G.wRarMult(w)).replace('.', dp())), 96, 102, { size: 7.5 });
    // Hai thẻ ở cột trái: Linh khí (bảng dấu ấn ba hệ, js/linhkhi.js) và Dòng phụ (dòng phụ, dòng mạnh). Mặc định mở Linh khí.
    const lkTab = G.lk && V.wvTab !== 'aff';
    if (G.lk) {
      if (T.sbtn(246, 29, 70, 17, 'Linh khí', { size: 8, pad: 4, primary: lkTab })) V.wvTab = 'lk';
      if (T.sbtn(320, 29, 70, 17, 'Dòng phụ', { size: 8, pad: 4, primary: !lkTab })) V.wvTab = 'aff';
    }
    const mi = G.markInfo(w);
    ui.text(mi.txt, 96, 113, { size: 7.5, color: mi.col });
    ui.bar(96, 117, 146, 4, mi.frac, mi.col);
    let y = 156;
    if (lkTab) G.lk.panel(w, 18, 140, 224);
    else ui.text(G.t('Tiến hóa cao nhất của bậc này: {0}', G.STAGE_NAMES[rar.maxStage]), 18, 140, { size: 7, color: SOFT });
    // dòng phụ và dòng mạnh
    if (!lkTab) {
    T.head('Dòng phụ', 18, y);
    y += 12;
    if (!w.affixes || !w.affixes.length) { ui.text(r === 0 ? 'Bậc Thường không có dòng phụ.' : 'Chưa có.', 18, y, { size: 7.5, color: SOFT }); y += 11; }
    for (const k of w.affixes || []) { ui.text(G.t('• {0}', G.AFFIX[k]), 18, y, { size: 7.5 }); y += 11; }
    if (w.power && G.POWER[w.power]) {
      y += 3;
      ui.text(G.t('Dòng mạnh: {0}', G.POWER[w.power].name), 18, y, { size: 8.5, bold: true, color: G.RARITY[3].col });
      y = ui.para(G.POWER[w.power].desc, 18, y + 11, 200, { size: 7.5 });
    }
    }
    ui.para(r >= 3 ? 'Đã ở bậc cao nhất.' : 'Ông Thợ Rèn nâng bậc được, không mất dấu ấn và tiến hóa.', 18, 250, 220, { size: 7, color: SOFT });
    // đặc trưng hệ theo cấp
    const x0 = 250;
    T.head('Đặc trưng hệ theo cấp', x0, 68);
    const el = w.branch, E = el ? G.EL[el] : null;
    if (!el) ui.para(G.t('Chưa khóa nhánh hệ. Kết liễu quái đang dính hiệu ứng để nhận dấu ấn; đủ {0} dấu ấn của một hệ thì vũ khí theo hệ đó.', G.MARKS[0]), x0, 80, 212, { size: 7, color: SOFT });
    const rows = [
      ['Trắng', 'Chưa mang hệ. Hạ tinh anh, trùm hoặc nhặt viên linh khí quái thường rơi để có dấu ấn.'],
      ['Mầm', G.t('Chỉ số tăng. {0}% mỗi đòn gây {1}, vệt chém nhuốm màu hệ. Chưa có luật hệ.', Math.round(G.PROC[1] * 100), el ? (el === 'fire' ? 'cháy' : el === 'poison' ? 'độc' : 'chậm') : 'hiệu ứng hệ')],
      ['Thành hình', null, 0],
      ['Thức tỉnh', null, 1],
    ];
    let ry = el ? 78 : 110;
    rows.forEach((q, i) => {
      const got = st >= i, locked = i > rar.maxStage;
      const h = i < 2 ? (el ? (i ? 34 : 23) : 0) : (el ? 44 : 38);
      if (!h) return;
      T.inset(x0, ry, 214, h - 2, false, { fill: got ? '#24484a' : '#17302f', col: got && E ? E.dark : T.C.brD });
      ui.text(q[0], x0 + 5, ry + 10, { size: 8, bold: true, color: got && E ? E.col : SOFT });
      ui.text(locked ? 'Cần bậc Lam' : got ? 'Đã mở' : i === st + 1 ? G.t('Sắp mở: {0} dấu ấn', G.MARKS[i - 1]) : 'Chưa mở', x0 + 209, ry + 10, { size: 6.5, align: 'right', bold: got, tiny: true, color: locked ? WARN : got ? GOOD : SOFT });
      if (q[1]) fitPara(q[1], x0 + 5, ry + 19, 204, { size: 6.5, color: TXT }, 2);
      else if (el) {
        const f = G.HE_FEATURES[el][q[2]];
        ui.text(G.t('Đặc trưng {0}: {1}', q[2] + 1, f.name), x0 + 62, ry + 10, { size: 7.5, bold: true, color: got ? E.col2 : TXT });
        fitPara(f.desc, x0 + 5, ry + 20, 204, { size: 6.5, color: TXT }, 2);
      } else {
        ui.text(q[2] ? 'Đặc trưng 2: phản ứng dây chuyền' : 'Đặc trưng 1: thứ để lại trên sân', x0 + 5, ry + 21, { size: 7, color: TXT });
        ui.text(G.ELS.map((e) => G.t('{0}: {1}', G.EL[e].name, G.HE_FEATURES[e][q[2]].name)).join(' · '), x0 + 5, ry + 31, { size: 7, color: TXT, tiny: ui.wrap(G.ELS.map((e) => G.t('{0}: {1}', G.EL[e].name, G.HE_FEATURES[e][q[2]].name)).join(' · '), 204, 7).length > 1 });
      }
      ry += h;
    });
  }

  // ---------- lò rèn (Ông Thợ Rèn) ----------
  const ROWS = 4, PITCH = 23.5, LIST_Y = 94, DET_Y = 208;
  function weaponList(filter) {
    // vũ khí đang mang lên đầu, rồi tới bậc cao
    const carry = G.save.carry;
    const list = G.save.weapons.filter(filter || (() => true)).sort((a, b) => (carry.includes(b.id) - carry.includes(a.id)) || (G.wRar(b) - G.wRar(a)) || (a.id - b.id));
    pager(list.length, ROWS, CX + CW - 100, 189);
    list.slice(V.page * ROWS, V.page * ROWS + ROWS).forEach((w, k) => {
      const y = LIST_Y + k * PITCH;
      if (G.weaponLine(w, CX, y, CW, V.sel === w.id, carry.includes(w.id) ? 48 : 0)) { V.sel = w.id; G.click = null; G.sfx('ui'); }
      if (carry.includes(w.id)) ui.text('đang mang', CX + CW - 6, y + 9.5, { size: 6.5, align: 'right', color: GOOD });
    });
    ui.text(G.t('{0} vũ khí', list.length), CX + 2, 200.5, { size: 7, color: SOFT });
    // xem bảng linh khí (dấu ấn hệ) và đặc trưng của món đang chọn
    const sw = V.sel != null && G.weaponById(V.sel);
    if (sw && list.includes(sw) && T.sbtn(CX + 52, 190, 88, 16, 'Xem linh khí', { size: 7.5, pad: 3 })) viewWeapon(sw.id, 'forge');
    return list;
  }
  const actBtn = (label, o) => T.btn(CX + CW - 92, DET_Y + 9, 86, 34, label, Object.assign({ size: 11, primary: true }, o));
  function forge() {
    const sv = G.save;
    let line = null; // câu ông thợ rèn nói
    frame(G.t('Lò rèn cấp {0}', sv.forge));
    // 12/10 (cờ G.CHU_RO): thẻ "Rèn đồ" cũ (chỉ còn lời giải thích cho bản cũ) được ẩn; bốn thẻ còn lại giãn đều. Đồ vải đã ở Cô Thợ May.
    const anRen = G.CHU_RO !== false;
    if (anRen && V.ftab === 'craft') V.ftab = 'sharpen';
    const tabs = [['sharpen', 'Mài'], ['tier', 'Nâng bậc'], ['reforge', 'Tôi lại']].concat(anRen ? [] : [['craft', 'Rèn đồ']], [['up', 'Nâng lò']]);
    const tp = anRen ? 77 : 61.5, tw = anRen ? 73 : 58;
    tabs.forEach((t, i) => {
      if (T.tab(CX + i * tp, PY + 23, tw, 22, t[1], V.ftab === t[0], { pad: 2 })) { V.ftab = t[0]; V.sel = null; V.page = 0; }
    });
    const R4 = G.RARITY, xm = (m) => 'x' + String(m).replace('.', dp());
    if (V.ftab !== 'up') T.inset(CX, DET_Y, CW, 52, false);
    if (V.ftab === 'sharpen') {
      weaponList();
      const w = G.weaponById(V.sel);
      line = 'Chọn một vũ khí để mài. Mỗi cấp mài tăng 8% sát thương gốc.';
      if (!w) ui.text('Chạm một vũ khí ở trên để chọn.', CX + 8, DET_Y + 30, { size: 8.5, color: SOFT });
      else {
        const cap = G.FORGE_CAP[sv.forge];
        const cost = G.sharpenFull(w.sharpen);
        ui.text(G.wName(w), CX + 8, DET_Y + 14, { size: 8.5, bold: true, color: R4[G.wRar(w)].col });
        // V26: số trước → sau khi mài (mài thử trên chính món rồi trả lại ngay, không lưu)
        const lvl = sv.heroes[sv.hero].lvl, f1 = (v) => v.toFixed(1).replace('.', dp()), dNow = G.wBase(w, lvl);
        let dAfter = null;
        if (w.sharpen < Math.min(cap, G.MAX_SHARPEN)) { w.sharpen++; try { dAfter = G.wBase(w, lvl); } finally { w.sharpen--; } }
        ui.text(dAfter != null ? G.t('Sát thương mỗi đòn {0} → {1} sau khi mài', f1(dNow), f1(dAfter)) : G.t('Sát thương mỗi đòn {0}', f1(dNow)), CX + 8, DET_Y + 26, { size: 7.5 });
        if (w.sharpen >= G.MAX_SHARPEN) { ui.text('Đã mài tối đa.', CX + 8, DET_Y + 40, { size: 8, color: GOOD }); line = 'Lưỡi này bén hết cỡ rồi cháu ạ.'; }
        else if (w.sharpen >= cap) { ui.para(G.t('Lò cấp {0} chỉ mài tới +{1}. Hãy nâng lò.', sv.forge, cap), CX + 8, DET_Y + 38, 290, { size: 7.5, color: WARN }); line = 'Lò còn yếu, phải nâng lò mới mài tiếp được.'; }
        else {
          ui.para(G.t('Lên +{0} tốn: {1}', w.sharpen + 1, costText(cost)), CX + 8, DET_Y + 38, 198, { size: 7.5, color: canPay(cost) ? TXT : WARN });
          if (!canPay(cost)) line = 'Chưa đủ nguyên liệu. Vào ải kiếm thêm rồi quay lại nhé.';
          // V21: mài món đang mang thì Sức mạnh tăng bao nhiêu (món trong rương không tính vào Sức mạnh)
          const gain = G.upg && G.upg.gainOf ? G.upg.gainOf('sh' + w.id + '-' + w.sharpen + '-' + sv.hero + '-' + lvl, (s) => { const x = s.weapons.find((q) => q.id === w.id); if (x) x.sharpen++; }) : 0;
          if (actBtn('Mài', { disabled: !canPay(cost), sub: gain > 0 ? G.upg.gainText(gain) : '', subSize: 7.5 })) { pay(cost); w.sharpen++; G.persist(); G.sfx('evolve'); say(G.t('Đã mài {0} lên +{1}!', G.wName(w), w.sharpen)); }
        }
      }
    } else if (V.ftab === 'tier') {
      weaponList();
      const w = G.weaponById(V.sel);
      const raise = (to, gold) => { // lên một nấc: giữ nguyên dấu ấn và tiến hóa, bù dòng phụ cho đủ theo bậc mới
        w.rarity = to; if (to === 3) w.gold = gold;
        G.fitAffixes(w);
        if (G.wStage(w) === 3 && !w.named) G.addMarks(w, w.branch, 0.001);
        G.persist(); G.sfx('evolve'); say(G.t('Đã nâng {0} lên bậc {1}!', G.wName(w), R4[to].name));
      };
      line = G.t('Bốn bậc: {0}. Nâng bậc không mất dấu ấn và tiến hóa.', R4.map((q) => G.t('{0} {1}', q.name, xm(q.mult))).join(', '));
      if (!w) {
        ui.para('Thường chỉ tiến hóa tới Thành hình. Lam có 1 dòng phụ, Tím 2, Vàng 2 và 1 dòng mạnh. Lên Vàng cần mảnh trùm vùng.', CX + 8, DET_Y + 14, 288, { size: 7.5, color: SOFT });
      } else if (G.wRar(w) < 2) {
        const r = G.wRar(w), cost = G.TIER_UP[r + 1];
        ui.text(G.t('{0}: {1} lên {2}', G.wName(w), R4[r].name, R4[r + 1].name), CX + 8, DET_Y + 14, { size: 8.5, bold: true, color: R4[r + 1].col });
        ui.para(G.t(r === 0 ? 'Sát thương gốc {0} lên {1}, thêm 1 dòng phụ, tiến hóa được tới Thức tỉnh.' : 'Sát thương gốc {0} lên {1}, thêm 1 dòng phụ.', xm(R4[r].mult), xm(R4[r + 1].mult)), CX + 8, DET_Y + 25, 198, { size: 7, color: TXT });
        ui.para(G.t('Tốn: {0}', costText(cost)), CX + 8, DET_Y + 46, 198, { size: 7, color: canPay(cost) ? TXT : WARN });
        line = canPay(cost) ? 'Dấu ấn và tiến hóa được giữ nguyên.' : 'Dấu ấn và tiến hóa được giữ nguyên. Nhưng cháu chưa đủ nguyên liệu.';
        const gain = G.upg && G.upg.gainOf ? G.upg.gainOf('ti' + w.id + '-' + r + '-' + w.sharpen + '-' + sv.hero, (s) => { const x = s.weapons.find((q) => q.id === w.id); if (x) { x.rarity = r + 1; if (x.tier != null) x.tier = r + 1; if (G.fitAffixes) G.fitAffixes(x); } }) : 0; // V21
        if (actBtn('Nâng bậc', { size: 10, disabled: !canPay(cost), sub: gain > 0 ? G.upg.gainText(gain) : '', subSize: 7.5 })) raise(r + 1, 0);
      } else {
        // Nấc cuối lên Vàng: cần mảnh trùm (chỉ trùm vùng rơi). Dùng mảnh trùm vùng nào thì nhận hệ số Vàng của vùng đó.
        const isGold = G.wRar(w) === 3, opts = [0, 1, 2].filter((k) => !isGold || k > w.gold);
        if (!opts.length) { ui.text(G.wName(w), CX + 8, DET_Y + 20, { size: 8.5, bold: true, color: R4[3].col }); ui.text(G.t('Đã ở bậc cao nhất (Vàng {0}).', xm(G.wRarMult(w))), CX + 8, DET_Y + 36, { size: 8 }); line = 'Món này quý nhất rồi, ông không làm hơn được nữa.'; }
        else {
          ui.text(G.t(isGold ? '{0}: luyện Vàng mạnh hơn' : '{0}: Tím lên Vàng, thêm 1 dòng mạnh', G.wName(w)), CX + 8, DET_Y + 12, { size: 7.5, bold: true, color: R4[3].col });
          line = 'Chọn mảnh trùm để luyện. Mỗi lần tốn 4 mảnh trùm và 2 đá tôi. Mảnh của vùng sau cho Vàng mạnh hơn.';
          opts.forEach((k, j) => {
            const cost = G.goldCost(k);
            if (T.btn(CX + 4 + j * 99, DET_Y + 17, 96, 30, G.t('{0} {1}', G.REGIONS[k].bossName, xm(G.GOLD_MULT[k])), { size: 8.5, sub: costText(cost), subSize: 6.5, disabled: !canPay(cost), gold: true })) { pay(cost); raise(3, k); }
          });
        }
      }
    } else if (V.ftab === 'reforge') {
      const list = weaponList((w) => !!w.branch);
      if (!list.length) ui.para(G.t('Chưa có vũ khí nào khóa nhánh. Vũ khí khóa nhánh khi đủ {0} dấu ấn của một hệ.', G.MARKS[0]), CX + 4, LIST_Y + 16, 290, { size: 8.5, color: SOFT });
      const w = G.weaponById(V.sel);
      line = 'Tôi lại để đổi nhánh hệ. Tốn 1 đá tôi, vũ khí giữ một nửa số dấu ấn.';
      if (!w || !w.branch) ui.text('Chạm một vũ khí đã khóa nhánh để chọn.', CX + 8, DET_Y + 30, { size: 8.5, color: SOFT });
      else {
        ui.text(G.wName(w), CX + 8, DET_Y + 13, { size: 8.5, bold: true, color: R4[G.wRar(w)].col });
        ui.text(G.t('Đang theo nhánh {0} ({1} dấu ấn). Đổi sang:', G.EL[w.branch].name, Math.floor(w.marks[w.branch])), CX + 8, DET_Y + 24, { size: 7.5 });
        if (sv.stones < 1) line = 'Cháu hết đá tôi rồi. Rương và trùm trong ải hay rơi đá tôi đấy.';
        G.ELS.filter((e) => e !== w.branch).forEach((e, k) => {
          if (T.btn(CX + 8 + k * 148, DET_Y + 28, 140, 20, G.t('{0} (1 đá tôi)', G.EL[e].name), { size: 8, disabled: sv.stones < 1, fill: G.EL[e].dark })) {
            sv.stones--;
            const half = Math.floor(w.marks[w.branch] / 2);
            w.marks[w.branch] = 0;
            w.marks[e] = Math.max(w.marks[e], half);
            w.branch = w.marks[e] >= G.MARKS[0] ? e : null; // chưa đủ G.MARKS[0] dấu ấn thì mở khóa nhánh
            w.name = null;
            G.persist(); G.sfx('evolve'); say(G.t('Đã tôi lại sang hệ {0}.', G.EL[e].name));
          }
        });
      }
    } else if (V.ftab === 'craft') {
      // Mũ, áo, bùa nay là trang phục: Cô Thợ May may, nâng bậc, mặc thử. Ông chỉ đường sang đó.
      ui.para('Mũ, áo, đồ đeo lưng, bùa và cánh giờ do Cô Thợ May may từ gỗ linh, vảy cá, đá lửa. Mũ áo ông rèn trước đây đã được chuyển sang kho trang phục, không mất món nào.', CX + 6, LIST_Y + 8, 292, { size: 8, color: TXT });
      ui.text(G.t('Kho trang phục: {0} món', G.outfit ? sv.outfit.items.length : 0), CX + 6, LIST_Y + 62, { size: 8, bold: true, color: GOLD });
      line = 'Đồ vải vóc thì sang khung cửi của Cô Thợ May nhé cháu.';
      if (actBtn('Sang Cô Thợ May', { size: 7.5, disabled: !!(VS.shown && !VS.shown('may')) })) { VS.goNpc('may', true); return line; } // V53: cô chưa về thì nút mờ
    } else {
      ui.para(G.t('Lò rèn cấp {0} mài được vũ khí tới +{1}.', sv.forge, G.FORGE_CAP[sv.forge]), CX + 4, 112, 296, { size: 9.5 });
      const up = G.FORGE_UP[sv.forge];
      if (!up) { ui.text('Lò rèn đã ở cấp cao nhất.', CX + 4, 134, { size: 9.5, color: GOOD }); line = 'Lò của ông giờ nóng nhất vùng rồi!'; }
      else {
        const y2 = ui.para(G.t('Nâng lên cấp {0} để mài tới +{1}.', sv.forge + 1, G.FORGE_CAP[sv.forge + 1]), CX + 4, 134, 296, { size: 9 });
        ui.para(G.t('Tốn: {0}', costText(up)), CX + 4, y2 + 4, 296, { size: 9, color: canPay(up) ? TXT : WARN });
        line = canPay(up) ? 'Đủ đồ rồi đấy, nâng lò thôi cháu!' : 'Gom đủ nguyên liệu rồi ông nâng lò cho.';
        if (T.btn(CX + 4, y2 + 24, 130, 34, 'Nâng lò', { size: 11, primary: true, disabled: !canPay(up) })) { pay(up); sv.forge++; G.persist(); G.sfx('evolve'); say(G.t('Lò rèn đã lên cấp {0}!', sv.forge)); }
      }
    }
    return line;
  }

  // ---------- rương vũ khí, chọn hai món mang theo, bán đồ (Bà Hàng Xén) ----------
  // Ba thẻ trên băng tiêu đề: Vũ khí (rương, đổi món mang theo, bán), Mua trang phục (đồ thường), Bán trang phục.
  // Bán, khoá, chọn nhiều, bán hết theo bậc, hỏi lại: js/ban_do.js (G.banDo).
  function xenTabs() {
    // Phiên cân bằng (mục 3): thêm thẻ Nguyên liệu (đổi vàng lấy nguyên liệu vùng đã qua, js/upgrade.js U.doi).
    const BD = G.banDo, tabs = [['weapon', 'Vũ khí', 36], ['nl', 'Nguyên liệu', 48], ['outfit', 'Mua đồ mặc', 46], ['sell', 'Bán đồ mặc', 46]];
    // Rà soát C: thẻ rộng theo chữ (phông thật trên iPhone rộng hơn, "Nguyên liệu" chạm viền thẻ) nếu băng tiêu đề còn chỗ
    if (G.RSC !== false) {
      ui.font(7.5, true);
      const rong = tabs.map((t) => Math.max(t[2], Math.ceil(G.ux.measureText(G.tv ? G.tv(t[1]) : t[1]).width) + 9));
      ui.font(11, true);
      const tit = Math.ceil(G.ux.measureText(G.tv ? G.tv('Hàng xén') : 'Hàng xén').width) + 16;
      const du = PW - 70 - tit - tabs.reduce((a, t) => a + t[2] + 2, 0), thieu = rong.map((w, i) => w - tabs[i][2]), tong = thieu.reduce((a, b) => a + b, 0);
      if (du > 0 && tong > 0) { const k = Math.min(1, du / tong); tabs.forEach((t, i) => { t[2] = Math.floor(t[2] + thieu[i] * k); }); } // thiếu chỗ thì chia phần còn trống theo độ thiếu
    }
    let x = PX + PW - 70 - tabs.reduce((a, t) => a + t[2] + 2, 0);
    const cur = V.gtab === 'outfit' || V.gtab === 'sell' || V.gtab === 'nl' ? V.gtab : 'weapon';
    for (const t of tabs) {
      if ((t[0] === 'weapon' || t[0] === 'nl' || G.outfit) && T.sbtn(x, PY + 3, t[2], 17, t[1], { size: 7, pad: 2, sel: cur === t[0] }) && cur !== t[0]) {
        V.gtab = t[0]; V.sel = null; V.page = 0; if (BD) BD.reset(); return true;
      }
      x += t[2] + 2;
    }
    return false;
  }
  function gear() {
    const BD = G.banDo, g = BD ? BD.guard() : undefined;
    const line = gearBody();
    if (BD && BD.modal(g)) return 'Cháu nghĩ kỹ chưa? Bán rồi bà không trả lại đâu nhé.';
    return line;
  }
  function gearBody() {
    const sv = G.save, BD = G.banDo;
    if (V.gtab === 'outfit' && G.outfit) return shop();
    if (V.gtab === 'sell' && G.outfit && BD) return sellOutfit();
    if (V.gtab === 'nl') return nguyenLieu();
    frame('Hàng xén');
    if (xenTabs()) return null;
    const multi = BD && BD.multi && BD.kind === 'w';
    // ổ khoá ở mép phải mỗi dòng: chạm để khoá hoặc mở khoá (món khoá không bán được)
    const lockAt = (w, y) => BD && BD.lockBtn(CX + CW - 16, y + 3, 14, 16, !!w.lock) && (BD.toggleLock(w), BD.tell(w.lock ? G.t('Đã khoá {0}, bà sẽ không mua món này.', G.wName(w)) : G.t('Đã mở khoá {0}.', G.wName(w))), true);
    ui.text('Đang mang', CX + 2, 77, { size: 7.5, color: SOFT });
    sv.carry.forEach((id, slot) => {
      const w = G.weaponById(id), y = 80 + slot * PITCH;
      if (!w) return;
      const hit = G.weaponLine(w, CX, y, CW - 18, false);
      if (lockAt(w, y)) return;
      if (hit) {
        G.click = null;
        if (multi) { BD.tell('Vũ khí đang mang không bán được.'); return; }
        if (V.sel != null && !sv.carry.includes(V.sel)) { sv.carry[slot] = V.sel; V.sel = null; G.persist(); G.sfx('pick'); }
        else viewWeapon(w.id, 'gear'); // chưa chọn gì để thay: mở màn xem vũ khí
      }
    });
    const stash = sv.weapons.filter((w) => !sv.carry.includes(w.id));
    ui.text(stash.length ? G.t('Rương đồ ({0} món)', stash.length) : 'Rương đồ', CX + 2, 138, { size: 7.5, color: SOFT });
    if (BD && stash.length) BD.quickBar(sv, 'w', CX + CW, 127, 12);
    if (!stash.length) ui.text('Trống. Vũ khí nhặt trong ải sẽ nằm ở đây.', CX + 2, 156, { size: 8 });
    pager(stash.length, ROWS, CX, 241);
    stash.slice(V.page * ROWS, V.page * ROWS + ROWS).forEach((w, k) => {
      const y = 141 + k * PITCH, picked = multi && BD.ids.has(w.id);
      const hit = G.weaponLine(w, CX, y, CW - 18, picked || (!multi && V.sel === w.id), BD ? 44 : 0);
      if (BD) ui.text(G.t('{0} vàng', BD.wPrice(w)), CX + CW - 22, y + 9.5, { size: 6.5, align: 'right', color: w.lock ? SOFT : GOLD });
      if (lockAt(w, y)) return;
      if (hit) {
        G.click = null;
        if (multi) BD.togglePick(sv, 'w', w);
        else { V.sel = V.sel === w.id ? null : w.id; G.sfx('ui'); }
      }
      if (picked) BD.tick(CX + 1, y + 1);
    });
    const selW = G.weaponById(V.sel);
    if (multi) {
      BD.sellBtn(sv, 'w', CX + 108, 240, CW - 108, 19);
      return 'Chạm các vũ khí trong rương để chọn, rồi bấm Bán. Món khoá thì bà không mua.';
    }
    if (selW && !sv.carry.includes(selW.id)) {
      const price = BD ? BD.wPrice(selW) : [20, 60, 150, 400][G.wRar(selW)] + selW.sharpen * 15;
      if (T.sbtn(CX + 112, 240, 56, 19, 'Xem', { size: 8.5, pad: 3 })) viewWeapon(selW.id, 'gear');
      if (T.sbtn(CX + 176, 240, 128, 19, selW.lock ? 'Đã khoá' : G.t('Bán {0} vàng', price), { size: 8.5, pad: 3, danger: true, disabled: !!selW.lock })) {
        if (BD) { if (BD.request(sv, 'w', [selW.id])) V.sel = null; }
        else { sv.weapons = sv.weapons.filter((w) => w.id !== selW.id); sv.gold += price; V.sel = null; G.persist(); G.sfx('pick'); say(G.t('Bà mua rồi nhé, {0} vàng của cháu đây.', price)); }
      }
      if (selW.lock) return 'Món này cháu đã khoá. Chạm ổ khoá để mở nếu muốn bán.';
    }
    // bà chỉ cách đổi vũ khí đang mang
    return !stash.length ? 'Chạm một vũ khí đang mang để xem bậc, dòng phụ và đặc trưng hệ.' : selW && !sv.carry.includes(selW.id) ? G.t('Đã chọn {0}. Giờ chạm một vũ khí đang mang để thay, hoặc bấm Xem, Bán.', G.wName(selW)) : 'Chạm vũ khí đang mang để xem. Muốn đổi: chạm một món trong rương để chọn trước.';
  }

  // ---------- đổi vàng lấy nguyên liệu vùng đã qua (Bà Hàng Xén, phiên cân bằng mục 3) ----------
  function nguyenLieu() {
    const sv = G.save, U = G.upg, D = G.DOI_NL;
    frame('Hàng xén');
    if (xenTabs()) return null;
    if (!U || !D) return null;
    const n = sv.doiNL | 0;
    ui.para(G.t('{0} vàng đổi 1 nguyên liệu của vùng đã hạ trùm. Còn {1}/{2} lượt đổi; mỗi ải thắng thêm {3} lượt.', D.gia, n, D.max, D.them), CX + 2, 78, CW - 4, { size: 7, color: SOFT });
    let line = n > 0 ? 'Thiếu gỗ, vảy hay đá của vùng cháu đã qua thì bà đổi cho, khỏi phải quay lại cày.' : 'Hết hàng rồi cháu ạ. Thắng thêm ải là bà lại có hàng về.';
    for (let r = 0; r < 3; r++) {
      const y = 100 + r * 44, reg = G.REGIONS[r], why = U.doiDuoc(sv, r);
      T.inset(CX, y, CW, 40, false);
      ui.text(G.tv(reg.mat), CX + 8, y + 15, { size: 9, bold: true, color: U.daQua(sv, r) ? TXT : SOFT });
      ui.text(G.t('Đang có {0} · vùng {1}', sv.mats[r], G.tv(reg.name)), CX + 8, y + 29, { size: 7, color: SOFT });
      if (T.sbtn(CX + CW - 168, y + 10, 76, 20, why || G.t('Đổi 1 ({0})', D.gia), { size: 7.5, pad: 2, disabled: !!why })) {
        if (U.doi(sv, r, 1)) { G.persist(); G.sfx('pick'); say(G.t('Của cháu đây, 1 {0}.', G.tv(reg.mat.toLowerCase()))); }
      }
      const k5 = Math.min(5, n);
      if (T.sbtn(CX + CW - 86, y + 10, 80, 20, G.t('Đổi {0} ({1})', Math.max(1, k5), Math.max(1, k5) * D.gia), { size: 7.5, pad: 2, disabled: !!why || k5 < 2 || sv.gold < k5 * D.gia })) {
        const got = U.doi(sv, r, k5);
        if (got) { G.persist(); G.sfx('pick'); say(G.t('Của cháu đây, {0} {1}.', got, G.tv(reg.mat.toLowerCase()))); }
      }
    }
    return line;
  }

  // ---------- bán trang phục (Bà Hàng Xén mua lại) ----------
  const OCOLS = 6, OROWS = 5, OPITCH = 31;
  function sellOutfit() {
    const sv = G.save, O = G.outfit, BD = G.banDo;
    O.sync(sv);
    frame('Hàng xén');
    if (xenTabs()) return null;
    const multi = BD.multi && BD.kind === 'o';
    const isWorn = (it) => sv.outfit.wear[O.ITEMS[it.k].slot] === it.id;
    const all = sv.outfit.items.slice().sort((a, b) => (isWorn(b) - isWorn(a)) || (b.r - a.r) || (O.SLOTS.indexOf(O.ITEMS[a.k].slot) - O.SLOTS.indexOf(O.ITEMS[b.k].slot)) || (a.id - b.id));
    ui.text(G.t('Kho {0}/{1}', all.length, O.MAX_ITEMS), CX + 2, 79, { size: 7.5, bold: true, color: all.length >= O.MAX_ITEMS ? WARN : SOFT });
    if (all.length) BD.quickBar(sv, 'o', CX + CW, 69, 13);
    const per = OCOLS * OROWS;
    pager(all.length, per, CX, 241);
    if (!all.length) ui.para('Kho trống. Đồ rơi trong ải, đồ mua và đồ may sẽ nằm ở đây.', CX + 2, 100, 180, { size: 8, color: SOFT });
    all.slice(V.page * per, V.page * per + per).forEach((it, i) => {
      const x = CX + (i % OCOLS) * OPITCH + 1, y = 86 + Math.floor(i / OCOLS) * OPITCH, picked = multi && BD.ids.has(it.id);
      T.slot(x, y, 28, it.r, { sel: picked || (!multi && V.sel === it.id) });
      O.drawIcon(G.ux, it, x + 14, y + 14, 20);
      if (isWorn(it)) { G.ux.fillStyle = GOOD; G.ux.fillRect(x + 3, y + 3, 4, 4); }
      if (it.lock) BD.lockIcon(x + 19, y + 17, true);
      if (picked) BD.tick(x + 1, y + 1);
      if (T.hit(x, y, 28, 28)) {
        if (multi) BD.togglePick(sv, 'o', it);
        else V.sel = V.sel === it.id ? null : it.id;
      }
    });
    // bên phải: món đang xem hoặc tổng đã chọn
    const RX = CX + OCOLS * OPITCH + 6, RW = CX + CW - RX;
    T.inset(RX, 86, RW, 150, false);
    const it = !multi && O.byId(sv, V.sel);
    if (multi) {
      const t = BD.total(sv, 'o', BD.ids);
      ui.text(G.t('Đã chọn {0} món', t.n), RX + 5, 98, { size: 8.5, bold: true, color: GOLD });
      ui.text(G.t('Bà trả {0} vàng', t.gold), RX + 5, 110, { size: 8, color: TXT });
      ui.para('Chạm các ô bên trái để chọn hoặc bỏ. Món đang mặc (chấm xanh) và món khoá thì không chọn được.', RX + 5, 124, RW - 10, { size: 6.5, color: SOFT });
      BD.sellBtn(sv, 'o', CX + 108, 240, CW - 108, 19);
      return 'Chọn xong thì bấm Bán ở dưới, bà trả vàng ngay.';
    }
    if (!it) {
      ui.para('Chạm một món để xem giá bà trả. Chấm xanh: đang mặc. Ổ khoá: món đã khoá, bà không mua.', RX + 5, 98, RW - 10, { size: 7, color: SOFT });
      ui.para(G.t('Giá bà trả: Thường {0}, Lam {1}, Tím {2}, Vàng {3} vàng.', BD.O_PRICE[0], BD.O_PRICE[1], BD.O_PRICE[2], BD.O_PRICE[3]), RX + 5, 160, RW - 10, { size: 6.5, color: TXT });
      return all.length >= O.MAX_ITEMS ? 'Kho của cháu đầy rồi. Bán bớt cho bà đi, kẻo đồ rơi trong ải bị đổi ra vàng rẻ.' : 'Đồ mặc chật, cũ thì bán lại cho bà. Bà trả rẻ thôi nhé, món nào quý thì khoá lại kẻo bán nhầm.';
    }
    const Ti = O.ITEMS[it.k], R = G.RARITY[it.r], why = BD.why(sv, 'o', it), price = BD.oPrice(it);
    ui.text(BD.fit(O.name(it), RW - 10, 8), RX + 5, 98, { size: 8, bold: true, color: R.col });
    let y = ui.para(G.t(isWorn(it) ? '{0} · bậc {1} · đang mặc' : '{0} · bậc {1}', O.SLOT_NAME[Ti.slot].split(',')[0], R.name), RX + 5, 109, RW - 10, { size: 6.5, color: isWorn(it) ? GOOD : SOFT });
    const st = O.stats(it), ks = Object.keys(st);
    y = ui.para(ks.length ? ks.map((q) => O.statText(q, st[q])).join(', ') : 'Không tăng chỉ số', RX + 5, y + 1, RW - 10, { size: 6.5, color: TXT });
    ui.text(G.t('Bà trả {0} vàng', price), RX + 5, 200, { size: 8, bold: true, color: why ? SOFT : GOLD });
    if (T.sbtn(RX + 4, 210, 44, 19, it.lock ? 'Mở khoá' : 'Khoá', { size: 7, pad: 2, sel: !!it.lock })) {
      BD.toggleLock(it); BD.tell(it.lock ? G.t('Đã khoá {0}.', O.name(it)) : G.t('Đã mở khoá {0}.', O.name(it)));
    }
    if (T.sbtn(RX + 52, 210, RW - 56, 19, why ? 'Không bán' : 'Bán', { size: 8, pad: 2, danger: !why, disabled: !!why })) {
      if (BD.request(sv, 'o', [it.id])) V.sel = null;
    }
    return why === 'đang mặc' ? 'Món cháu đang mặc thì bà không mua. Tháo ra ở Cô Thợ May trước đã.' : why ? 'Món này cháu khoá rồi. Bấm Mở khoá nếu thật muốn bán.' : G.t('Món này bà trả {0} vàng. Bán thì bấm nút đỏ nhé.', price);
  }

  // ---------- trang phục thường (Bà Hàng Xén bán) ----------
  function shop() {
    const sv = G.save, O = G.outfit, list = O.shopList();
    frame('Hàng xén');
    if (xenTabs()) return null;
    ui.text('Đồ thường, mặc ngay được. Đem tới Cô Thợ May để nâng bậc.', CX + 2, 78, { size: 7, color: SOFT });
    pager(list.length, 5, CX + CW - 100, 239);
    let line = 'Áo mũ thường đây cháu ơi, rẻ mà bền. Muốn đẹp hơn thì nhờ Cô Thợ May nâng bậc.';
    list.slice(V.page * 5, V.page * 5 + 5).forEach((k, i) => {
      const Ti = O.ITEMS[k], y = 84 + i * 30, own = O.has(sv, k);
      T.inset(CX, y, CW, 28, false);
      T.slot(CX + 3, y + 2, 24, 0);
      O.drawIcon(G.ux, k, CX + 15, y + 14, 20);
      ui.text(G.t('{0} · {1}', Ti.name, O.SLOT_NAME[Ti.slot]), CX + 32, y + 11, { size: 8, bold: true, color: TXT });
      const st = O.stats({ k, r: 0 });
      ui.text(cut1(own ? G.t('{0} · đã có', Object.keys(st).map((q) => O.statText(q, st[q])).join(', ')) : Object.keys(st).map((q) => O.statText(q, st[q])).join(', '), CW - 120, 6.5), CX + 32, y + 22, { size: 6.5, color: own ? GOOD : SOFT });
      if (T.sbtn(CX + CW - 84, y + 5, 78, 18, G.t('Mua {0} vàng', Ti.price), { size: 7.5, pad: 2, disabled: sv.gold < Ti.price || O.full(sv) })) {
        const it = O.buy(sv, k);
        if (it) { G.persist(); G.sfx('pick'); VS.checkNews(); say(G.t('Của cháu đây, {0}. Sang Cô Thợ May mà mặc thử.', Ti.name)); }
      }
    });
    if (O.full(sv)) line = 'Kho trang phục của cháu đầy rồi. Sang thẻ Bán trang phục bán bớt cho bà nhé.';
    return line;
  }

  // ---------- trang phục (Cô Thợ May): bảng nằm ở js/tailor.js, gắn vào PANELS.outfit ----------
  function outfit() { frame('Thợ may'); return 'Khung cửi đang sửa, cháu quay lại sau nhé.'; }

  // ---------- chọn hero, xem chỉ số (Ông Từ) ----------
  function hero() {
    const sv = G.save;
    frame(G.CHU_RO !== false ? 'Sân đình: chọn em bé' : 'Sân đình: chọn hero'); // 12/10: cả game gọi là "em bé"
    let line = null;
    G.HKEYS.forEach((k, i) => {
      const H = G.HEROES[k], hs = sv.heroes[k];
      const x = CX + (i % 2) * 154, y = 72 + Math.floor(i / 2) * 40;
      if (T.btn(x, y, 150, 36, '', { disabled: !hs.unlocked, sel: sv.hero === k })) { sv.hero = k; G.persist(); VS.checkNews(); }
      // chân dung em bé tinh linh của từng hero; hero đang chọn thì nhún nhảy, chưa mở thì mờ
      // phiên kiểm trang phục 12/10: mũ cao (nón lá, mũ tai cáo) nhô khỏi thẻ -> cắt trong khung thẻ (cờ tắt G.THE_EM_BE_CAT = false)
      const cat = G.THE_EM_BE_CAT !== false && G.ux.save; if (cat) { G.ux.save(); G.ux.beginPath(); G.ux.rect(x + 2, y + 2, 146, 32); G.ux.clip(); }
      G.art.hero(G.ux, { x: x + 18, y: y + 32, face: 1, key: k, move: sv.hero === k, t: G.time, atk: -1, dodge: -1, weapon: null, noShadow: true, alpha: hs.unlocked ? null : 0.4, outfit: sv.hero === k && G.outfit ? G.outfit.look(sv) : null });
      if (cat) G.ux.restore();
      // Lực chiến của từng bé nếu mang đúng vũ khí, trang phục đang có (js/luc_chien.js): thẻ thêm một dòng
      const lcOn = hs.unlocked && G.lucChienUI && G.lucChienUI.on();
      ui.text(H.name, x + 88, y + (lcOn ? 10.5 : 15), { size: lcOn ? 9 : 10, bold: true, align: 'center', color: hs.unlocked ? '#fff0c4' : '#8fa49e' });
      ui.text(hs.unlocked ? G.t(sv.hero === k ? 'Cấp {0} · đang chọn' : 'Cấp {0}', hs.lvl) : H.unlock, x + 88, y + (lcOn ? 20 : 27), { size: 7, align: 'center', color: hs.unlocked ? '#e8d9a8' : '#8fa49e' });
      if (lcOn) ui.text(G.lucChienUI.chu(G.lucChien(sv, k)), x + 88, y + 29.5, { size: 7.5, bold: true, align: 'center', color: '#ffe9a8' });
    });
    const k = sv.hero, H = G.HEROES[k], hs = sv.heroes[k];
    ui.text(G.t('{0} · cấp {1}', H.name, hs.lvl), CX + 2, 164, { size: 10, bold: true, color: GOLD });
    T.bar(CX + 110, 157, 192, 'xp', hs.lvl >= G.MAX_LEVEL ? 1 : hs.xp / G.xpNeed(hs.lvl), null, { h: 7 });
    let y = 178;
    // Sức mạnh: một con số tính từ cấp hero, vũ khí mạnh nhất đang mang (bậc, mài, tiến hóa), điểm kỹ năng, mũ và áo (G.power)
    const pw = G.power();
    ui.text(G.t('Sức mạnh {0}', pw), CX + 2, y, { size: 8.5, bold: true, color: GOLD });
    ui.font(8.5, true); const sx = CX + 2 + G.ux.measureText(G.t('Sức mạnh {0}', pw)).width + 6;
    ui.text(G.t('Máu gốc {0} · Mana {1} · Tốc độ {2}%', H.hp, H.mana, Math.round(H.speed * 100)), sx, y, { size: 7.5 });
    y = ui.para(G.t('Sở trường: {0} (+10% sát thương)', H.fav.map((f) => G.tv(G.WTYPES[f].name)).join(', ')), CX + 2, y + 11, 300, { size: 7.5 });
    y = ui.para(G.t('Nội tại: {0}', H.passive), CX + 2, y + 2, 300, { size: 7.5, color: SOFT });
    ui.para(G.t('Chưởng ({0} mana). {1}', G.CHUONG ? G.CHUONG.cost : 30, H.skillDesc), CX + 2, y + 2, 300, { size: 7.5, color: SOFT });
    const lock = G.HKEYS.filter((q) => !sv.heroes[q].unlocked);
    line = lock.length ? G.t('Khẽ thôi, các bé đang chơi trong sân. Còn {0} bé chưa về làng: hạ trùm vùng để đón về.', lock.length) : 'Khẽ thôi, các bé đang chơi trong sân. Chạm một bé để đổi.';
    return line;
  }

  // ---------- cây kỹ năng và hướng dẫn (Cụ Đồ) ----------
  function doTabs() {
    // thẻ Bảng vàng (js/bang_vang.js) chỉ có khi tệp đó được nạp
    const tabs = [['skill', 'Cây kỹ năng']].concat(chuongOpen() ? [['chuong', 'Cây chưởng']] : [], [['help', 'Hướng dẫn']], PANELS.rank ? [['rank', 'Bảng vàng']] : []);
    const w = Math.floor((CW - (tabs.length - 1) * 4) / tabs.length);
    tabs.forEach((t, i) => {
      const dot = t[0] === 'chuong' && G.chuong && G.chuong.pts(G.save.heroes[G.save.hero], G.save.hero).left > 0;
      if (T.tab(CX + i * (w + 4), PY + 23, w, 22, t[1], V.tab === t[0], { pad: 2, size: tabs.length > 3 ? 7.5 : 8, dot })) { V.tab = t[0]; V.dtab = t[0]; V.page = 0; }
    });
  }
  function skill() {
    const sv = G.save, k = sv.hero, H = G.HEROES[k], hs = sv.heroes[k];
    frame(G.t('Gốc đa: {0}', H.name));
    doTabs();
    const spent = hs.sk.atk + hs.sk.def + hs.sk.elem;
    const pts = Math.floor(hs.lvl / 3) - spent;
    ui.text(G.t('Còn {0} điểm (mỗi 3 cấp nhận 1 điểm)', pts), CX + 2, 104, { size: 8, bold: true, color: pts > 0 ? GOOD : SOFT });
    G.SKEYS.forEach((b, r) => {
      const y0 = 109 + r * 42, n = hs.sk[b], Bk = G.SKILLS[b];
      T.inset(CX, y0, CW, 39, false);
      ui.text(Bk.name, CX + 6, y0 + 12, { size: 9, bold: true, color: GOLD });
      for (let j = 0; j < 5; j++) { ui.rect(CX + 46 + j * 12, y0 + 5, 9, 8, j < n ? '#ffd23f' : '#0d1716', j < n ? '#fff0a8' : T.C.brD); }
      if (n < 5) {
        ui.para(G.t('Tiếp: {0}', Bk.nodes[n]), CX + 6, y0 + 24, 236, { size: 7, color: TXT });
        // V21: học thêm một điểm nhánh này thì Sức mạnh tăng bao nhiêu (nút như hồi máu mỗi phòng không đổi con số thì không ghi)
        const gain = G.upg && G.upg.gainOf ? G.upg.gainOf('sk' + k + '-' + b + '-' + n + '-' + hs.lvl, (s) => { s.heroes[s.hero].sk[b]++; }) : 0;
        if (gain > 0) ui.text(G.upg.gainText(gain), CX + CW - 60, y0 + 15, { size: 7.5, bold: true, align: 'right', color: GOOD });
        if (T.sbtn(CX + CW - 54, y0 + 8, 48, 24, 'Học', { size: 9, pad: 4, primary: pts > 0, disabled: pts <= 0 })) { hs.sk[b]++; G.persist(); G.sfx('evolve'); VS.checkNews(); }
      } else ui.text('Đã học hết nhánh này.', CX + 6, y0 + 28, { size: 7.5, color: GOOD });
    });
    if (spent > 0 && T.sbtn(CX, 240, 170, 20, 'Đặt lại điểm (100 vàng)', { size: 8, pad: 3, disabled: sv.gold < 100 })) {
      sv.gold -= 100; hs.sk = { atk: 0, def: 0, elem: 0 }; G.persist(); VS.checkNews(); say('Lão xoá hết rồi, con học lại từ đầu nhé.');
    }
    return pts > 0 ? G.t('Ngồi xuống đây, lão chỉ cho một chiêu. Con còn {0} điểm chưa dùng đấy.', pts) : 'Lên thêm cấp rồi quay lại, lão dạy tiếp. Cứ 3 cấp con được 1 điểm.';
  }
  // ---------- cây chưởng (Cụ Đồ): bảng vẽ ở js/chuong_ui.js ----------
  function chuong() {
    const sv = G.save, H = G.HEROES[sv.hero];
    frame(G.t('Gốc đa: chưởng của {0}', H.name));
    doTabs();
    if (!sv.tut.chTip) { sv.tut.chTip = 1; G.persist(); } // đã xem thẻ Cây chưởng: thôi nhắc ở làng
    if (!G.chuongUI) return null;
    return G.chuongUI.tree(CX, 96, CW, 166, {});
  }
  const HELP = () => [
    ['Đi lại trong làng', 'Kéo ở nửa trái màn hình để đi, hoặc chạm vào một người để em bé tự chạy tới. Dải khuôn mặt ở mép trên là lối tắt. Ai có việc mới thì có dấu chấm than vàng.'],
    ['Di chuyển và đánh', 'Cảm ứng: đặt ngón ở nửa trái màn hình rồi kéo để đi. Bên phải có các nút tròn: giữ Đánh để ra đòn liên tục, Né để lăn tránh, Đặc biệt để tung đòn mạnh (tốn mana), nút trên cùng là Chưởng.'],
    ['Chưởng', G.t('Nút Chưởng bắn một luồng chưởng linh khí (tốn {0} mana), tự ngắm quái gần nhất theo tám hướng. Hệ của chưởng theo cây chưởng đang dùng. Mỗi em bé có nét riêng: Cu Tí đẩy lùi mạnh, Cu Tèo bay xa và nhanh, Cái Bống trúng thì hồi chút máu, Cu Lì tầm gần mà to. Chưởng không cho linh khí cho vũ khí (linh khí chỉ đến từ vũ khí) và không kết hợp hệ với vũ khí.', G.CHUONG ? G.CHUONG.cost : 30)],
    ['Ba cây chưởng', 'Hỏa chưởng: cầu lửa nổ lan, vệt cháy, giữ nút để tích lực. Độc chưởng: mây độc, lây độc, ăn mòn giáp, tách 3 luồng. Băng chưởng: mũi băng xuyên nhiều quái, làm chậm, đóng băng, băng vỡ. Mỗi cấp nhận 1 điểm chưởng (riêng với điểm kỹ năng). Mỗi lúc dùng một cây; ở làng đổi cây miễn phí ở Cụ Đồ (thẻ Cây chưởng) hoặc Hành trang, điểm đã học được trả lại hết.'],
    ['Đánh tám hướng', 'Mọi đòn tự quay về quái gần nhất trong tầm, theo cả tám hướng (lên, xuống, chéo). Không có quái gần thì đánh theo hướng đang kéo cần, hoặc hướng vừa đi.'],
    ['Chiêu Đặc biệt', 'Mỗi loại vũ khí một chiêu (tốn mana). Kiếm, Trảm Nguyệt: phóng vệt chém trăng khuyết bay xuyên mọi quái. Giáo, Phi Thương: ném giáo xuyên một hàng quái, ghim con cuối, giáo tự bay về tay (lúc giáo chưa về thì nút Đánh là cú đấm tay). Búa, Địa Chấn: nện ra vệt nứt đất hất tung quái, kèm vòng chấn quanh người. Cung, Mưa Tên: mưa tên rơi vào cụm quái gần nhất.'],
    ['Các ô ở mép trên', 'Chạm ô vũ khí ở góc trên bên phải để đổi giữa hai vũ khí. Chạm ô Bình máu để hồi máu. Chạm Dừng để tạm nghỉ.'],
    ['Mở rương, qua cửa', 'Lại gần rương, suối hay thương nhân rồi bấm Đánh. Hết quái thì cửa mở: đi vào cửa có mũi tên để sang phòng kề. Chạm bản đồ nhỏ để xem cả ải.'],
    ['Bàn phím', 'Mũi tên hoặc WASD để đi, J đánh (ở làng: nói chuyện), K né, L đặc biệt, I chưởng (giữ để tích lực), Q đổi vũ khí, E uống bình máu, M xem bản đồ, Esc tạm dừng hoặc đóng bảng.'],
    ['Ba sao', 'Sao 1: qua ải. Sao 2: không dùng bình máu. Sao 3: ra đòn kết liễu trùm bằng hệ khắc chế nó.'],
    G.lk ? ['Linh khí', '', G.lk.guide] : null, // trang vẽ hình về linh khí (dấu ấn hệ), js/linhkhi.js
    ['Dấu ấn', G.t('{0} {1}', G.HINTS[0], G.HINTS[1])],
    ['Ba hệ', G.t('{0} {1}', G.HINTS[4], G.HINTS[5])],
    ['Trùm học theo bạn', G.t('{0} {1}', G.HINTS[2], G.HINTS[3])],
    ['Đọc đòn quái', 'Vùng đỏ trên sàn là chỗ đòn sắp rơi xuống, đầy dần rồi nổ: đi ra ngoài hoặc lộn qua. Quái đánh được mọi hướng, kể cả trên dưới và chéo. Vòng đỏ chỗ trống là quái sắp mọc lên.'],
    ['Các loại quái', 'Xông tới, bầy nhỏ, bắn xa (gọi thêm bầy), nhanh nhẹn (lặn rồi trồi sau lưng), giáp (che phía trước, hồi máu cho bạn: vòng ra sau hoặc đánh vỡ giáp), cảm tử (lao vào rồi nổ), đặt bom (bom có vòng đếm ngược), gai (đang dựng gai mà chém thì bị phản đòn). Nổ ở Hang biển làm đóng băng, ở Rừng già để vũng độc, ở Lâu đài cổ để vệt cháy.'],
    ['Tinh anh và trùm', 'Tinh anh có chiêu riêng và một dấu hiệu trên đầu: tia chớp là nhanh, khiên là bọc giáp, quả bom là nổ khi chết, giọt máu là hút máu. Trùm nhỏ có hai chiêu riêng. Trùm vùng có ba pha, đổi ở 2/3 và 1/3 máu, pha sau thêm chiêu và nhanh hơn; sau chiêu lớn trùm choáng một lúc, đó là lúc đánh mạnh nhất.'],
    ['Vật trong phòng', 'Chậu than, nấm độc và tinh thể băng phát nổ khi bị đánh, gây hiệu ứng lên quái đứng gần. Đây là cách gây hệ khi vũ khí còn trắng.'],
    ['Bốn bậc màu', 'Thường (sát thương x1, tiến hóa tới Thành hình), Lam (x1,15, có 1 dòng phụ), Tím (x1,3, có 2 dòng phụ), Vàng (x1,5 trở lên, 2 dòng phụ và 1 dòng mạnh riêng). Từ Lam trở lên tiến hóa được tới Thức tỉnh.'],
    ['Nguồn vũ khí', 'Rương và quái tinh anh rơi vũ khí bậc ngẫu nhiên, cao nhất là Tím; vùng sau dễ ra bậc cao hơn. Trùm vùng lần đầu bị hạ chắc chắn rơi một vũ khí Vàng. Ông Thợ Rèn nâng bậc từng nấc mà không mất tiến hóa; nấc lên Vàng cần mảnh trùm.'],
    ['Đặc trưng hệ theo cấp', G.t('Trắng: chưa có hệ. Linh khí (dấu ấn) có từ: hạ tinh anh ({0}), trùm nhỏ ({1}), trùm vùng ({2}); quái thường {3}% rơi viên linh khí của vùng ({4}), đi lại gần để nhặt; kết liễu quái đang dính hệ (+1). Hệ theo hệ quái đang dính, không dính thì theo vùng. Mầm: có tỉ lệ gây cháy, độc, chậm nhưng chưa có luật hệ. Thành hình: mở đặc trưng 1, thứ để lại trên sân (vệt cháy, vũng độc, gai băng). Thức tỉnh: mở đặc trưng 2, phản ứng dây chuyền (nổ lan, lây độc, băng vỡ).', G.LINHKHI.elite, G.LINHKHI.mini, G.LINHKHI.boss, Math.round(G.LINHKHI.drop * 100), G.LINHKHI.orb)],
    ['Xem vũ khí', 'Ở làng, chạm vào vũ khí đang bay theo em bé để xem bậc, dòng phụ và các đặc trưng đã mở, sắp mở. Ở chỗ Bà Hàng Xén cũng có nút Xem cho món trong rương.'],
  ];
  function help() {
    frame('Gốc đa: hướng dẫn');
    doTabs();
    // xếp các mục vào từng trang cho vừa bảng
    const secs = HELP().filter(Boolean), pages = [[]], top = 106, bottom = 236;
    let y = top;
    for (const s of secs) {
      const h = s[2] ? bottom - top : 11 + ui.wrap(s[1], 298, 7.5).length * 10.5 + 5; // trang vẽ hình (Linh khí) đứng riêng một trang
      if (y + h > bottom && pages[pages.length - 1].length) { pages.push([]); y = top; }
      pages[pages.length - 1].push(s); y += h;
    }
    V.page = G.clamp(V.page, 0, pages.length - 1);
    y = top;
    for (const l of pages[V.page]) {
      if (l[2]) { l[2].draw(CX + 2, y, 298); y += l[2].h; continue; }
      T.head(l[0], CX + 2, y);
      y = ui.para(l[1], CX + 2, y + 11, 298, { size: 7.5, color: TXT }) + 5 + 2.5;
    }
    pager(pages.length, 1, CX + CW - 100, 242);
    return 'Lão chép cả ra đây, con đọc thong thả. Bấm mũi tên để lật trang.';
  }

  // ---------- cài đặt (Anh Mõ) ----------
  // Lưu mây, đăng nhập Google, góp ý: js/cloud.js, js/cloud_ui.js (không có thì bảng chỉ còn phần cũ)
  // Phiên Cốt truyện + Âm thanh: mọi nút của bảng cao 32 (khoảng 46 điểm trên iPhone cầm ngang, tối thiểu 44). Trang 2 (V.cd2):
  // thanh Nhạc, thanh Tiếng (0..100, G.save.nhac / G.save.tieng, js/engine.js G.amThanh), bật/tắt âm thanh, Tiết kiệm pin (G.save.pin), Xem lại truyện.
  const CDH = 32;
  function settings() {
    const sv = G.save, CL = G.cloud, CU = G.cloudUI;
    if (V.cd2) return settings2();
    frame('Cổng làng: cài đặt');
    if (T.btn(CX + 4, 68, 96, CDH, 'Âm thanh, pin ›', { size: 8.5, sub: sv.sound ? 'Nhạc · Truyện' : 'Đang tắt', subSize: 7 })) { V.cd2 = true; V.confirm = false; G.audioStart(); }
    // Độ nét hình (js/engine.js G.NET): Cao = canvas thế giới gấp đôi điểm ảnh (ảnh AI rõ hơn), Thường = như cũ (nhẹ máy yếu)
    if (T.btn(CX + 104, 68, 96, CDH, sv.net === 'thuong' ? 'Độ nét: Thường' : 'Độ nét: Cao', { size: 8.5 })) {
      if (sv.net === 'thuong') delete sv.net; else sv.net = 'thuong';
      G.persist(); say(sv.net === 'thuong' ? 'Độ nét Thường: nhẹ máy hơn, hình AI kém rõ hơn.' : 'Độ nét Cao: hình AI rõ gấp đôi.');
    }
    if (T.btn(CX + 204, 68, 96, CDH, 'Toàn màn hình', { size: 8.5 })) {
      try { const el = document.documentElement; if (document.fullscreenElement) document.exitFullscreen(); else el.requestFullscreen().catch(() => say('Thiết bị này không cho bật toàn màn hình.')); } catch (e) { say('Thiết bị này không cho bật toàn màn hình.'); }
    }
    T.head('Lưu tiến trình', CX + 4, 113);
    if (!V.moi && inviteWant('mo')) V.moi = { where: 'mo' }; // Đợt 1: lần trước bấm "Để sau" → Anh Mõ nhắc lại đúng một lần
    if (CL) {
      const on = CL.online();
      ui.text(CL.label(), CX + 4, 125, { size: 7.5, color: on && !CL.dirty ? GOOD : SOFT });
      ui.text(on ? (CL.isGuest() ? 'Tài khoản: Khách. Đăng nhập Google để giữ tiến trình khi đổi máy.' : G.t('Tài khoản Google: {0}', G.kd(CL.who()))) : 'Tiến trình luôn được lưu trong trình duyệt này.', CX + 4, 136, { size: 7, color: SOFT });
      if (on && CL.isGuest()) {
        G.syncTaps.push({ x: CX + 4, y: 142, w: 146, h: CDH, fn: () => titleLogin(CL) });
        if (T.btn(CX + 4, 142, 146, CDH, 'Đăng nhập Google', { size: 8.5, primary: true }) && !V.gBusy) {
          V.gBusy = true; say('Đang mở cửa sổ đăng nhập Google…');
          const snap = guestSnap();
          CL.google().then((r) => { guestKeep(snap, r); return r; }).then((r) => say(r === 'redirect' ? 'Đang chuyển sang trang Google…' : r === 'linked' ? 'Đã nối tài khoản Google. Tiến trình được giữ nguyên.' : 'Đã đăng nhập Google.'), (e) => say(G.t('Chưa đăng nhập được: {0}', e.message))).then(() => { V.gBusy = false; });
        }
      } else T.btn(CX + 4, 142, 146, CDH, on ? 'Đã đăng nhập Google' : 'Đăng nhập Google', { size: 8.5, disabled: true });
    } else ui.para('Tiến trình được lưu trong trình duyệt này. Đổi máy hoặc xoá dữ liệu trình duyệt sẽ mất tiến trình.', CX + 4, 125, 292, { size: 7.5, color: SOFT });
    if (CU && T.btn(CX + 154, 142, 146, CDH, '✉ Góp ý', { size: 8.5 })) CU.feedback({});
    if (CL && CU && CL.isAdmin()) {
      const n = CL.adminNew;
      if (T.btn(CX + 4, 178, 296, 22, n ? G.t('📥 Góp ý nhận được ({0} mới)', n) : '📥 Góp ý nhận được', { size: 8.5, gold: true, dot: !!n })) CU.inbox();
    }
    if (!V.confirm) {
      if (T.btn(CX + 4, 208, 200, CDH, 'Xoá tiến trình, chơi lại từ đầu', { size: 8, danger: true })) V.confirm = true;
      // Ngôn ngữ (js/ngon_ngu.js): bấm là đổi ngay Tiếng Việt <-> English, nhớ theo máy và ghi vào bản lưu (trường lang)
      if (G.ngonNgu && T.btn(CX + 208, 208, 92, CDH, 'Ngôn ngữ', { size: 8, sub: G.LANG === 'en' ? 'English' : 'Tiếng Việt' })) {
        G.ngonNgu.doi(); say(G.LANG === 'en' ? 'Language: English.' : 'Ngôn ngữ: Tiếng Việt.');
      }
    } else {
      ui.text('Chắc chắn xoá hết? Không khôi phục được.', CX + 4, 205, { size: 8, color: WARN, bold: true });
      // "Thôi" nằm đúng chỗ nút xoá vừa bấm, để bấm đúp nhầm cũng không mất tiến trình
      if (T.btn(CX + 4, 208, 120, CDH, 'Thôi')) V.confirm = false;
      else if (T.btn(CX + 132, 208, 120, CDH, 'Xoá hết', { danger: true })) { G.resetSave(); V.confirm = false; goHub(); VS.enter({}); VS.say('Đã xoá tiến trình.'); return null; }
    }
    if (G.VERSION) ui.text(G.t('Phiên bản {0}', G.VERSION), CX + CW - 2, 258, { size: 6.5, align: 'right', color: SOFT });
    return V.confirm ? 'Ấy ấy! Xoá là mất hết đấy, nghĩ kỹ chưa?' : 'Cốc cốc cốc! Làng nước nghe đây! Cần chỉnh gì cứ bảo anh.';
  }
  // Trang 2: Nhạc, Tiếng, bật/tắt âm thanh, Tiết kiệm pin, Xem lại truyện
  function settings2() {
    const sv = G.save, AM = G.amThanh;
    frame('Âm thanh, pin, truyện');
    thanhAm('Nhạc', 'nhac', 66);
    thanhAm('Tiếng', 'tieng', 104);
    if (T.btn(CX + 4, 146, 146, CDH, sv.sound ? 'Âm thanh: bật' : 'Âm thanh: tắt', { size: 8.5, sel: !!sv.sound })) {
      sv.sound = !sv.sound; G.persist(); G.audioStart(); if (AM) AM.capNhat();
      say(sv.sound ? 'Bật cả nhạc lẫn tiếng.' : 'Tắt hết nhạc và tiếng.');
    }
    if (T.btn(CX + 154, 146, 146, CDH, sv.pin ? 'Tiết kiệm pin: bật' : 'Tiết kiệm pin: tắt', { size: 8.5, sub: '30 khung/giây', subSize: 7, sel: !!sv.pin })) {
      if (sv.pin) delete sv.pin; else sv.pin = true;
      G.persist(); say(sv.pin ? 'Tiết kiệm pin: hình vẽ 30 khung mỗi giây, máy đỡ nóng.' : 'Vẽ đủ khung hình, mượt nhất.');
    }
    if (T.btn(CX + 4, 186, 146, CDH, 'Xem lại truyện', { size: 8.5, disabled: !G.truyen })) { V.confirm = false; G.truyen.xemLai(); }
    if (T.btn(CX + 154, 186, 146, CDH, '‹ Trở lại', { size: 8.5 })) V.cd2 = false;
    ui.para('Nhạc tạo ngay trong máy, không tải thêm gì. Tiết kiệm pin: vẽ 30 khung mỗi giây, trận đấu vẫn chạy đủ nhanh.', CX + 4, 232, 296, { size: 7.5, color: SOFT });
    return 'Nhạc làng có sáo trúc với đàn bầu đấy. Nghe hay thì để to lên!';
  }
  // Một thanh âm lượng: nút − và + (mỗi lần 10), kéo hoặc chạm trên thanh (mỗi nấc 5). Nhả tay mới lưu.
  function thanhAm(nhan, k, y) {
    const AM = G.amThanh, sv = G.save;
    if (!AM) return;
    const cu = AM.so(k), x0 = CX + 94, x1 = CX + 222;
    let v = cu;
    ui.text(nhan, CX + 4, y + 20, { size: 9, bold: true, color: TXT });
    if (T.btn(CX + 52, y, 36, CDH, '−', { size: 12 })) v = Math.max(0, v - 10);
    if (T.btn(CX + 228, y, 36, CDH, '+', { size: 12 })) v = Math.min(100, v + 10);
    const theo = (px) => Math.round(G.clamp((px - x0) / (x1 - x0), 0, 1) * 20) * 5;
    for (const p of G.pointers.values()) if (!p.stale && p.sx >= x0 - 6 && p.sx <= x1 + 6 && p.sy >= y - 2 && p.sy <= y + CDH + 2) { v = theo(p.x); p.role = 'ui'; }
    if (G.click && G.inRect(G.click, x0 - 6, y - 2, x1 - x0 + 12, CDH + 4)) { v = theo(G.click.x); G.click = null; }
    const kx = x0 + ((x1 - x0) * v) / 100;
    ui.rect(x0, y + 14, x1 - x0, 5, '#14201e', '#3a5a52');
    if (v > 0) ui.rect(x0, y + 14, kx - x0, 5, GOLD);
    ui.rect(Math.round(kx - 4), y + 7, 8, 19, '#f3e8c8', '#2a1a14');
    ui.text(v ? String(v) : G.t('Tắt'), CX + 300, y + 20, { size: 9, bold: true, align: 'right', color: v ? GOLD : SOFT });
    if (v !== cu) { sv[k] = v; AM.capNhat(); V.cdLuu = k; }
    if (V.cdLuu && !G.pointers.size) { const kk = V.cdLuu; V.cdLuu = null; G.persist(); if (kk === 'tieng') G.sfx('pick'); }
  }

  const PANELS = { forge, gear, outfit, hero, skill, chuong, help, settings };
  Object.assign(G.villageApi, { PANELS, pager, say, costText, frame, npcSide, viewWeapon, weaponView, doTabs });
  G.Village = {
    enter() {
      goHub(); VS.enter({}); G.persist();
      // Bấm một gợi ý ở bảng thua (G.upgradeTips): về làng là mở luôn bảng của người làng tương ứng, chọn sẵn món cần nâng.
      const g = G.villageGo; G.villageGo = null;
      if (!g) return;
      if (g.weapon != null && G.weaponById(g.weapon)) { viewWeapon(g.weapon, 'hub'); return; }
      if (!g.who || !TAB_OF[g.who]) return;
      open(g.who);
      if (g.ftab) V.ftab = g.ftab;
      if (g.otab) V.otab = g.otab;
      if (g.oslot) V.oslot = g.oslot;
      if (g.who === 'xen') V.gtab = g.gtab || 'weapon';
      if (g.who === 'do') { V.tab = g.tab === 'chuong' && chuongOpen() ? 'chuong' : 'skill'; V.dtab = V.tab; }
      if (g.sel != null) V.sel = g.sel;
      if (g.page != null) V.page = g.page;
      if (g.stage) { V.diff = 0; V.sel = g.stage; }
    },
    hide() { /* không có gì phải dừng */ },
    update(dt) {
      if (V.msgT > 0) V.msgT -= dt;
      VS.update(dt, V.tab !== 'hub' || !!V.moi);
      if (V.moi) { if (G.keyP.Escape && !V.gBusy) { inviteLater(); G.keyP.Escape = false; } return; } // đang hỏi liên kết Google: Esc = Để sau
      // Esc: huỷ câu hỏi xoá, hoặc đóng bảng quay về làng
      if (G.keyP.Escape) { if (G.banDo && G.banDo.ask) { G.banDo.ask = null; G.keyP.Escape = false; } else if (V.confirm) V.confirm = false; else if (V.tab === 'weapon' && V.back !== 'hub') V.tab = V.back; else if (V.tab !== 'hub') goHub(); }
    },
    // Đợt 1 (Q4): vẽ làng như cũ (_draw), rồi nếu đang mời liên kết Google thì vẽ hộp mời đè lên trên.
    draw() {
      G.syncTaps = [];
      const moi = V.moi, c = moi ? G.click : null;
      if (moi) G.click = null; // lần chạm không lọt xuống bảng bên dưới
      this._draw();
      if (moi && V.moi === moi) inviteDraw(c);
      else if (!V.moi && V.tab === 'hub' && inviteWant('hub')) V.moi = { where: 'hub' };
    },
    _draw() {
      if (V.tab === 'title') V.tab = 'hub';
      if (V.tab === 'map') { mapScreen(); return; }
      VS.drawWorld(V.tab === 'hub' ? null : { dim: 0.62, hideHero: true });
      if (V.tab === 'hub') {
        VS.drawHud();
        if (G.hanhTrang) G.hanhTrang.hubButton(); // nút Hành trang (túi vải) góc trên bên phải, js/hanh_trang.js
        const S = VS.state;
        if (!Object.keys(G.save.stars).length && S.hintT <= 0 && !S.near && !S.path && S.msgT <= 0) T.toastFit(240, 244, 'Tới bến đò bên phải, gặp Chú Lái Đò để vào ải', { size: 7.5 });
        // mẹo lần đầu có điểm chưởng: tới Cụ Đồ, thẻ Cây chưởng (tắt khi đã mở thẻ đó)
        else if (G.chuong && !G.save.tut.chTip && Object.keys(G.save.stars).length && S.hintT <= 0 && !S.near && S.msgT <= 0 && G.chuong.pts(G.save.heroes[G.save.hero], G.save.hero).left > 0) T.toastFit(240, 244, 'Có điểm chưởng! Gặp Cụ Đồ ở gốc đa, thẻ Cây chưởng để học', { size: 7.5 });
        return;
      }
      VS.drawTop();
      if (V.tab === 'weapon') { weaponView(); return; }
      const hit = VS.drawStrip(V.who || WHO_OF[V.tab], true, true);
      if (hit && VS.shown && !VS.shown(hit)) say('Cô Thợ May đi chợ xa. Qua ải Rừng già 2 rồi cô về may đồ cho bé.'); // V53
      else if (hit) { VS.goNpc(hit, true); return; }
      const fn = PANELS[V.tab] || settings;
      const tab = V.tab, line = fn();
      if (fn.full) return; // bảng tự vẽ người nói (Cô Thợ May)
      if (V.tab === tab || (WHO_OF[V.tab] && WHO_OF[V.tab] === WHO_OF[tab])) npcSide(line);
    },
  };

  // ---------- Đợt 1 (Q4): mời liên kết Google sau khi xong ải 1 ----------
  // Chỉ mời người đang chơi bằng tài khoản khách (ẩn danh) đã qua ải 1 (stars['0-0']) và đang nối được mây.
  // G.save.moiGoogle là trường MỚI, tuỳ chọn (bản lưu cũ không có): không có = chưa mời; 1 = đã bấm "Để sau" một lần;
  // 2 = đã bấm "Để sau" cả ở lần Anh Mõ nhắc lại → không tự mời nữa (nút Đăng nhập Google ở Anh Mõ vẫn luôn còn).
  // V.moiPhien: đã trả lời trong phiên chơi này → không hỏi lại cho tới lần mở game sau.
  function inviteWant(where) {
    const CL = G.cloud, sv = G.save;
    if (V.moiPhien || V.gBusy || !CL || !CL.online() || !CL.isGuest() || !sv || !sv.stars || !sv.stars['0-0']) return false;
    const n = sv.moiGoogle | 0;
    return where === 'hub' ? n === 0 : n === 1;
  }
  // Cất bản lưu của khách trước khi đăng nhập / liên kết Google. Nếu Google chuyển sang một tài khoản ĐÃ CÓ tiến trình ('switched'),
  // js/cloud.js có thể tự dùng bản trên mây mà không hỏi (khi bản của khách không hơn rõ rệt). Luồng đó giữ nguyên, không sửa ở đây;
  // chỉ chép nguyên văn bản của khách sang khoá dự phòng linhkhi_save_v1_khach (đã có bản khác thì ghi vào ..._khach2) để còn cứu lại được.
  function guestSnap() {
    try { const CL = G.cloud; return CL && CL.isGuest() && Object.keys(G.save.stars || {}).length ? JSON.stringify(G.save) : null; } catch (e) { return null; }
  }
  function guestKeep(snap, r) {
    if (!snap || r !== 'switched') return;
    try { const ls = window.localStorage, K = 'linhkhi_save_v1_khach', old = ls.getItem(K); ls.setItem(old === null || old === snap ? K : K + '2', snap); } catch (e) { /* bộ nhớ đầy: bỏ qua */ }
  }
  function inviteLater() {
    const M = V.moi;
    if (!M) return;
    V.moi = null; V.moiPhien = true;
    G.save.moiGoogle = M.where === 'hub' ? 1 : 2; G.persist();
    const m = 'Lúc nào muốn liên kết, gặp Anh Mõ ở cổng làng.';
    if (V.tab === 'hub') VS.say(m); else say(m);
  }
  // Liên kết thất bại (đóng cửa sổ, bị chặn, mất mạng…): chỉ báo lỗi trong hộp, KHÔNG đụng tới bản lưu trên máy hay trên mây.
  function inviteLink() {
    const CL = G.cloud, M = V.moi;
    if (!M || V.gBusy || !CL) return;
    V.gBusy = true; M.err = '';
    const snap = guestSnap();
    CL.google().then((r) => {
      guestKeep(snap, r);
      V.moi = null; V.moiPhien = true;
      const m = r === 'redirect' ? 'Đang chuyển sang trang Google…' : r === 'linked' ? 'Đã liên kết Google. Tiến trình được giữ nguyên.' : 'Đã đăng nhập Google.';
      if (V.tab === 'hub') VS.say(m); else say(m);
    }, (e) => { M.err = (e && e.message) || 'Lỗi'; }).then(() => { V.gBusy = false; });
  }
  function inviteDraw(click) {
    const CL = G.cloud, M = V.moi;
    // đã liên kết xong ở chỗ khác, hoặc mất kết nối giữa chừng: đóng hộp, không ghi gì
    if (!CL || !CL.isGuest() || (!CL.online() && !V.gBusy)) { V.moi = null; return; }
    const w = 284, h = 132, x = 98, y = 66, busy = !!V.gBusy;
    const bL = [x + 14, y + h - 34, 96, 24], bG = [x + w - 158, y + h - 34, 144, 24];
    G.syncTaps = busy ? [] : [{ x: bG[0], y: bG[1], w: bG[2], h: bG[3], fn: inviteLink }]; // chạy ngay trong lúc chạm để Safari không chặn cửa sổ Google
    G.click = click || null;
    T.dim(0.6);
    T.panel(x, y, w, h, 'Giữ tiến trình', { plain: true });
    ui.text('Liên kết Google để giữ tiến trình trên mọi máy', x + w / 2, y + 40, { size: 9, bold: true, align: 'center', color: GOLD });
    let yy = y + 54;
    if (M.err) {
      ui.wrap(G.t('Chưa liên kết được: {0}', M.err), w - 28, 7.5, true).slice(0, 2).forEach((l) => { ui.text(l, x + w / 2, yy, { size: 7.5, bold: true, align: 'center', color: WARN }); yy += 10; });
      ui.text('Tiến trình của bạn vẫn còn nguyên. Có thể thử lại hoặc để sau.', x + w / 2, yy + 1, { size: 7, align: 'center', color: TXT });
    } else {
      const body = busy ? 'Đang mở cửa sổ đăng nhập Google…' : 'Tiến trình đang chơi được giữ nguyên. Đổi máy hoặc xoá dữ liệu trình duyệt vẫn chơi tiếp được.';
      ui.wrap(body, w - 36, 7.5).slice(0, 3).forEach((l) => { ui.text(l, x + w / 2, yy, { size: 7.5, align: 'center', color: TXT }); yy += 10; });
    }
    if (T.btn(bL[0], bL[1], bL[2], bL[3], 'Để sau', { size: 9, disabled: busy })) inviteLater();
    else {
      if (T.btn(bG[0], bG[1], bG[2], bG[3], busy ? 'Đang mở Google…' : M.err ? 'Thử lại' : 'Liên kết Google', { size: 9, primary: !busy, disabled: busy })) inviteLink();
      if (!busy) googleMark(bG[0] + 15, bG[1] + bG[3] / 2);
    }
    G.click = null;
  }

  // Màn mở đầu (Đợt 1, quyết định Q4). Khi lưu mây dùng được (spiritblade.web.app): KHÔNG bắt đăng nhập nữa.
  //   - "Chơi ngay": vào luôn bằng tài khoản khách (ẩn danh Firebase, js/cloud.js tự đăng nhập và tự lưu mây). Mây chưa kịp nối
  //     thì vẫn vào, chơi lưu trên máy; nối được là js/cloud.js tự đồng bộ như cũ.
  //   - "Đăng nhập Google": cho người đã có tài khoản (chơi tiếp tiến trình cũ). Đã đăng nhập Google rồi thì nút chính là "Vào game".
  // Không có mây (bản xem trước trong Claude, mở tệp trên máy, mất mạng, ?cloud=0): chạm để chơi như cũ, chỉ lưu trên máy.
  function titleGate() {
    const CL = G.cloud;
    const need = !!(CL && !CL.why);
    const ok = !need || (CL.online() && !CL.isGuest());
    return { CL, need, ok };
  }
  // Tiếng Anh: thông báo đăng nhập hỏng của js/cloud.js có thể đã được dịch sẵn, nên so thêm với bản dịch (tiếng Việt không đi qua đây)
  function gMsgFail(m) { m = String(m); return m.indexOf(G.t('Chưa đăng nhập được: {0}', '')) === 0 || m === G.t('Google chưa trả kết quả đăng nhập về [no-redirect-result]'); }
  function titleLogin(CL) {
    if (V.gBusy) return;
    V.gBusy = true; V.tMsg = 'Đang mở trang đăng nhập Google…'; V.tMsgT = 30;
    // V1: đăng nhập thất bại (cửa sổ bị chặn, bị đóng, mở trong Zalo/Messenger/Facebook) → bật cờ V.loginFail để màn chào hiện dòng gợi ý mở bằng trình duyệt thật
    const snap = guestSnap();
    CL.google().then((r) => { guestKeep(snap, r); V.loginFail = false; V.tMsg = r === 'redirect' ? 'Đang chuyển sang trang Google…' : r === 'linked' ? 'Đã nối tài khoản Google, giữ nguyên tiến trình.' : 'Đã đăng nhập Google.'; }, (e) => { V.loginFail = true; V.tMsg = G.t('Chưa đăng nhập được: {0}', e.message); })
      .then(() => { V.gBusy = false; V.tMsgT = 8; say(V.tMsg); });
  }
  // Bố cục màn chào (toạ độ 480x270), Giai đoạn 4 yêu cầu 2: logo > nút chính > nút phụ > dòng thông tin.
  // Nút nào chạy ngay trong lúc chạm (G.syncTaps) thì dùng đúng ô của nút vẽ.
  // gg, bv (Đợt 1): hàng nút dưới "Chơi ngay" khi chưa đăng nhập Google: Đăng nhập Google | Bảng vàng. (guest: ô nút "Chơi tạm" cũ, nay không vẽ nữa.)
  const TL = { main: [140, 128, 200, 32], play: [160, 128, 160, 32], guest: [180, 168, 120, 20], row: [[128, 168, 108, 22], [244, 168, 108, 22]], gg: [112, 166, 150, 24], bv: [268, 166, 100, 24], info: 210, lang: [430, 5, 44, 16], logo: [140, 52, 200, 40] }; // logo: ô của ảnh gd-logo (phiên C3), trùm đúng chỗ chữ LINH KHÍ
  G.titleLayout = TL; // để bài kiểm tra biết nút nằm ở đâu
  // Lớp tối dịu phía sau khối chữ và nút: hình elip tối dần ra mép (không phủ cả màn), để chữ không đè lên nhà cửa sáng.
  function titleVeil() {
    const c = G.ux; c.save();
    c.translate(240, 128); c.scale(1, 0.62);
    const gr = c.createRadialGradient(0, 0, 20, 0, 0, 190);
    gr.addColorStop(0, 'rgba(8,6,10,0.78)'); gr.addColorStop(0.55, 'rgba(8,6,10,0.56)'); gr.addColorStop(1, 'rgba(8,6,10,0)');
    c.fillStyle = gr; c.fillRect(-200, -210, 400, 420);
    c.restore();
  }
  // Tiêu đề: chữ LINH KHÍ có viền tối dày + bóng đổ lệch xuống, dòng phụ SPIRITBLADE giãn chữ (tên miền spiritblade.web.app).
  function titleLogo() {
    const u = G.ux;
    T.drum(240, 30, 20, 0.85); // mặt trống đồng nhỏ làm biểu tượng, nằm trên chữ (không còn nằm sau chữ)
    // Phiên C3: có tệp gd-logo (ảnh AI 200×40, chữ LINH KHÍ khắc gỗ; trang tools/tach-giao-dien, lô "Logo") thì vẽ ảnh vào đúng chỗ của chữ;
    // không có thì vẽ chữ phông y như cũ. Dòng phụ và câu giới thiệu bên dưới vẫn là chữ của game.
    const SC = G.spriteCustom, logo = SC && SC.gdSan && SC.veGd ? SC.gdSan('gd-logo') : null;
    if (logo) SC.veGd(u, logo, TL.logo[0], TL.logo[1], TL.logo[2], TL.logo[3]);
    else {
      ui.font(38, true); u.textAlign = 'center'; u.lineJoin = 'round';
      u.fillStyle = 'rgba(0,0,0,0.55)'; u.fillText('LINH KHÍ', 240, 89);
      u.lineWidth = 5; u.strokeStyle = '#1a120a'; u.strokeText('LINH KHÍ', 240, 86);
      ui.text('LINH KHÍ', 240, 86, { size: 38, bold: true, align: 'center', color: GOLD, shadow: false });
      // vệt sáng mảnh trên nửa trên mặt chữ (ánh kim loại), chỉ một dải, không phát sáng
      u.save(); u.beginPath(); u.rect(120, 58, 240, 12); u.clip();
      ui.text('LINH KHÍ', 240, 86, { size: 38, bold: true, align: 'center', color: '#fff6d8', shadow: false }); u.restore();
    }
    // dòng phụ: chữ giãn rộng, hai gạch đồng hai bên
    ui.font(9, true);
    const sub = 'S P I R I T B L A D E', sw = u.measureText(sub).width;
    u.fillStyle = '#a8752f'; u.fillRect(Math.round(240 - sw / 2 - 26), 98, 18, 1); u.fillRect(Math.round(240 + sw / 2 + 8), 98, 18, 1);
    ui.text(sub, 240, 101.5, { size: 9, bold: true, align: 'center', color: '#d9a441' });
    ui.text('Vũ khí lớn lên theo bạn. Yêu tinh học theo bạn.', 240, 116, { size: 8, align: 'center', color: TXT });
  }
  G.Title = {
    enter() { VS.enter({ from: 'keep' }); VS.state.x = 470; VS.state.cam = 230; },
    update(dt) {
      VS.update(dt, true);
      const g = titleGate();
      if (V.tRank) { if (G.keyP.Escape) V.tRank = false; return; } // đang xem Bảng vàng
      if (g.need) { if (G.keyP.Enter || G.keyP.Space) G.setScene(G.Village); return; } // vào bằng nút "Chơi ngay" / "Vào game"
      // không có mây: chạm chỗ trống để vào; chạm dải nút phụ thì không
      const r = TL.row, onBtns = G.downs.some((d) => d.y > r[0][1] - 4 && d.y < r[0][1] + r[0][3] + 4 && d.x > r[0][0] - 4 && d.x < r[1][0] + r[1][2] + 4);
      const L = TL.lang, onLang = G.downs.some((d) => d.x > L[0] - 6 && d.y < L[1] + L[3] + 6); // nút EN / VI ở góc trên phải
      if ((G.downs.length && !onBtns && !onLang) || G.keyP.Enter || G.keyP.Space || G.keyP.KeyJ) G.setScene(G.Village);
    },
    draw() {
      const c = G.wx, A = G.art;
      V.tab = 'title';
      VS.drawWorld({ dim: 0.42, hideHero: true }); // cảnh làng sống (đèn lồng chập chờn, khói lò rèn, đom đóm) dùng lại của village_scene.js
      // em bé cầm kiếm lửa: phóng đúng 2 lần (điểm ảnh vuông, không vỡ), đứng góc dưới bên trái, không chạm nút
      c.save(); c.translate(70, 252); c.scale(2, 2);
      A.hero(c, { x: 0, y: 0, face: 1, key: 'smith', move: false, t: G.time, atk: (G.time % 2.4) < 0.4 ? (G.time % 2.4) / 0.4 : -1, dodge: -1, weapon: { type: 'sword', family: 0, rarity: 3, marks: { fire: 300, poison: 0, ice: 0 }, branch: 'fire', sharpen: 0 } });
      c.restore();
      titleVeil();
      G.syncTaps = [];
      // Bảng vàng mở ngay trên màn mở đầu (không vào làng), có nút đóng
      if (!(V.tRank && G.bangVang)) titleLogo();
      else {
        const px = 80; // giữa màn hình
        T.dim(0.45);
        const py = PY + 28; // không có hàng thẻ như ở làng: khung thấp xuống, nội dung bảng vàng nằm ngay dưới tiêu đề
        T.panel(px, py, PW, PH - 28, 'Bảng vàng', { rightPad: 74, noBand: true });
        if (T.sbtn(px + PW - 66, py + 3, 60, 17, '✕ Đóng', { size: 8, pad: 5 })) V.tRank = false;
        G.bangVang.panel(px + (CX - PX), CW);
        return;
      }
      const { CL, need, ok } = titleGate();
      const M = TL.main, R0 = TL.row[0], R1 = TL.row[1];
      if (CL && CL.online() && CL.isGuest()) { // nút Đăng nhập chạy ngay trong lúc chạm để Safari không chặn cửa sổ Google
        if (need && !ok) G.syncTaps.push({ x: TL.gg[0], y: TL.gg[1], w: TL.gg[2], h: TL.gg[3], fn: () => titleLogin(CL) });
        if (!need || ok) G.syncTaps.push({ x: R0[0], y: R0[1], w: R0[2], h: R0[3], fn: () => titleLogin(CL) });
      }
      if (!need) {
        // không có mây: chạm đâu cũng vào. Dải chữ sáng lên tối đi nhẹ nhàng (không chớp tắt).
        const ga = G.ux.globalAlpha; G.ux.globalAlpha = ga * (0.62 + 0.38 * (0.5 + 0.5 * Math.sin(G.time * 3.2)));
        T.toastFit(240, M[1] + 7, 'Chạm để bắt đầu', { size: 11 });
        G.ux.globalAlpha = ga;
      } else if (ok) {
        const P = TL.play;
        if (T.btn(P[0], P[1], P[2], P[3], 'Vào game ▶', { size: 12, primary: true })) G.setScene(G.Village);
      } else {
        // Đợt 1 (Q4): hai nút rõ. "Chơi ngay" luôn bấm được (kể cả khi mây chưa kịp nối); "Đăng nhập Google" cho người đã có tài khoản.
        const loading = !CL.online(), busy = !!V.gBusy, Gg = TL.gg, Bv = TL.bv;
        if (T.btn(M[0], M[1], M[2], M[3], 'Chơi ngay ▶', { size: 12, primary: true })) G.setScene(G.Village);
        if (T.btn(Gg[0], Gg[1], Gg[2], Gg[3], loading ? (CL.status === 'error' ? 'Chưa kết nối được mây' : 'Đang kết nối…') : busy ? 'Đang mở Google…' : 'Đăng nhập Google', { size: 8.5, disabled: loading || busy })) titleLogin(CL);
        if (!loading && !busy) googleMark(Gg[0] + 15, Gg[1] + Gg[3] / 2);
        if (T.btn(Bv[0], Bv[1], Bv[2], Bv[3], '🏆 Bảng vàng', { size: 8, disabled: !G.bangVang })) { V.tRank = true; G.bangVang.reload && G.bangVang.reload(); }
        // V1: đăng nhập Google vừa thất bại → dòng gợi ý mở bằng trình duyệt thật (vẫn chơi được bằng "Chơi ngay")
        if (V.loginFail && !busy) ui.text('Mở bằng Chrome/Safari để đăng nhập Google', 240, Gg[1] + Gg[3] + 10, { size: 7, align: 'center', color: '#e8d7b0' });
      }
      if (CL) {
        const on = CL.online(), guest = CL.isGuest();
        if (!need || ok) {
          if (T.btn(R0[0], R0[1], R0[2], R0[3], on && !guest ? G.kd('✓ ' + String(CL.who()).slice(0, 14)) : 'Đăng nhập Google', { size: 8, primary: on && guest, disabled: !on || !guest })) titleLogin(CL);
          if (T.btn(R1[0], R1[1], R1[2], R1[3], '🏆 Bảng vàng', { size: 8, disabled: !G.bangVang })) { V.tRank = true; G.bangVang.reload && G.bangVang.reload(); }
        }
        if (CL.gMsg) { if (/^Chưa đăng nhập|chưa trả kết quả/.test(CL.gMsg) || (G.LANG !== 'vi' && gMsgFail(CL.gMsg))) V.loginFail = true; V.tMsg = CL.gMsg; V.tMsgT = 8; CL.gMsg = ''; }
        if (V.tMsgT > 0) V.tMsgT -= 1 / 60;
        const line = V.tMsgT > 0 && V.tMsg ? V.tMsg : need && !ok ? G.t('Đã có tài khoản? Bấm Đăng nhập Google để chơi tiếp tiến trình cũ. {0}', CL.label()) : CL.label();
        const lines = ui.wrap(line, 260, 7); // hẹp để không chạm hình em bé bên trái
        lines.slice(0, 2).forEach((l, i) => ui.text(l, 240, TL.info + i * 9, { size: 7, align: 'center', color: V.tMsgT > 0 && V.tMsg ? GOLD : '#c9bfa8' }));
      }
      // nút nhỏ đổi ngôn ngữ ngay ở màn mở đầu (chữ đang dùng sáng hơn); nhớ theo máy nên lần sau mở lại vẫn đúng
      if (G.ngonNgu && T.sbtn(TL.lang[0], TL.lang[1], TL.lang[2], TL.lang[3], 'EN / VI', { size: 7.5, sel: G.LANG === 'en' })) G.ngonNgu.doi();
      // thông tin phụ: nhỏ, góc dưới bên phải, không tranh chỗ với nút
      ui.text(G.t('Phiên bản {0}', G.VERSION || '?'), 474, 264, { size: 7, align: 'right', color: 'rgba(232,222,196,0.85)', shadow: true });
    },
  };
  // Chữ G bốn màu nhỏ đầu nút Đăng nhập Google (vẽ điểm ảnh, không tải hình ngoài)
  function googleMark(x, cy) {
    const u = G.ux, k = 1, cols = ['#4285f4', '#ea4335', '#fbbc05', '#34a853'];
    const R = [
      '..rrrr..', '.rr..rr.', 'rr......', 'yy......', 'yy..bbbb', 'gg....bb', '.gg..bb.', '..gggg..'];
    u.save();
    u.fillStyle = '#fff6e8'; u.beginPath(); u.arc(x, cy, 6.5, 0, 7); u.fill();
    const m = { r: cols[1], y: cols[2], g: cols[3], b: cols[0] };
    R.forEach((row, j) => { for (let i = 0; i < row.length; i++) if (m[row[i]]) { u.fillStyle = m[row[i]]; u.fillRect(x - 4 + i * k, cy - 4 + j * k, k, k); } });
    u.restore();
  }
})();
