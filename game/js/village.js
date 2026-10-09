// Làng: cảnh làng có người (js/village_scene.js). Mỗi chức năng là một người đứng cạnh công trình của mình:
//   Chú Lái Đò: tranh bản đồ vùng, chọn ải, độ khó, nút "Lên đò"      Ông Thợ Rèn: lò rèn (Mài, Nâng bậc, Tôi lại, Rèn đồ, Nâng lò)
//   Bà Hàng Xén: rương vũ khí, chọn hai món mang theo, bán đồ, bán trang phục thường
//   Cô Thợ May: trang phục năm ô (bảng riêng ở js/tailor.js)
//   Cụ Đồ: cây kỹ năng, đặt lại điểm, hướng dẫn                         Ông Từ: chọn hero, xem chỉ số
//   Anh Mõ: cài đặt                                                     Chạm vũ khí sống đang bay theo: xem vũ khí
// Bảng nằm bên phải, người đứng bên trái và nói một câu. Hình vẽ theo chủ đề trống đồng (js/ui_theme.js).
(function () {
  const G = window.G, ui = G.ui, T = G.theme, VS = G.villageScene;
  const V = { tab: 'hub', who: null, sel: null, ftab: 'sharpen', node: null, page: 0, confirm: false, diff: 0, msg: null, msgT: 0, wid: null, back: 'hub', dtab: 'skill' };
  const TAB_OF = { lai: 'map', ren: 'forge', xen: 'gear', may: 'outfit', do: 'skill', tu: 'hero', mo: 'settings' };
  const WHO_OF = { map: 'lai', forge: 'ren', gear: 'xen', outfit: 'may', skill: 'do', help: 'do', hero: 'tu', settings: 'mo' };
  // Khung bảng bên phải và vùng nội dung bên trong
  const PX = 152, PY = 46, PW = 320, PH = 220, CX = 160, CW = 304;
  const SOFT = '#a9c2b4', TXT = '#f1e6c6', GOLD = '#f6dc92', GOOD = '#9be07a', WARN = '#ff9a5a';

  function say(s) { V.msg = s; V.msgT = 2.5; }
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
    if (c.gold) a.push(c.gold + ' vàng');
    if (c.ore) a.push(c.ore + ' quặng');
    if (c.stones) a.push(c.stones + ' đá tôi');
    if (c.mat) c.mat.forEach((n, i) => { if (n) a.push(n + ' ' + G.REGIONS[i].mat.toLowerCase()); });
    if (c.shard) c.shard.forEach((n, i) => { if (n) a.push(n + ' mảnh ' + G.REGIONS[i].bossName); });
    return a.join(', ');
  }
  // Mở bảng của một người (k: lai, ren, xen, may, do, tu, mo)
  function open(k) {
    V.who = k; V.tab = TAB_OF[k]; V.sel = null; V.page = 0; V.confirm = false; V.node = null; V.msgT = 0;
    if (k === 'do') V.tab = V.dtab === 'help' ? 'help' : 'skill';
    if (k === 'lai') pickNext();
  }
  function goHub() {
    const was = V.tab;
    V.tab = 'hub'; V.who = null; V.sel = null; V.node = null; V.confirm = false; V.page = 0;
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
      ui.text('Trang ' + (V.page + 1) + '/' + pages, x + 50, y + 11.5, { size: 7.5, align: 'center', color: SOFT });
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
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1;
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
      ui.font(6.5, true); ui.rect(px - 16, py - 7, 32, 10, 'rgba(74,54,38,0.85)'); ui.text('sắp có', px, py + 0.6, { size: 6.5, bold: true, align: 'center', color: '#f0e6c8', shadow: false });
    }
    // 15 thẻ ải mặt trống
    let hit = null, hd = 19;
    for (let r = 0; r < 3; r++) for (let i = 0; i < 5; i++) {
      const q = M.nodes[r][i], st = map[r + '-' + i] || 0, ok = unlocked(r, i, V.diff), boss = i === 4, rad = boss ? 12 : 10;
      const selc = V.sel && V.sel[0] === r && V.sel[1] === i;
      T.stageCard(q[0] - 20, q[1] - rad - 4, 40, 36, i + 1, !ok ? 'lock' : selc ? 'sel' : st ? 'done' : 'open', st, { r: rad, boss, noClick: true, noStars: true });
      if (ok && st) inkText('★'.repeat(st) + '☆'.repeat(3 - st), q[0], q[1] + rad + 8.5, 6.5, '#ffd23f', 'rgba(74,54,38,0.95)');
      else if (ok && !selc) inkText('mới', q[0], q[1] + rad + 8.5, 6.5, '#2f7a2a', halo);
      if (ok && G.click) { const d = Math.hypot(G.click.x - q[0], G.click.y - q[1]); if (d < hd) { hd = d; hit = [r, i]; } }
    }
    if (hit && !(G.click.x > 246 && G.click.y > 206)) { V.sel = hit; G.click = null; G.sfx('ui'); }
    // em bé đứng ở ải đang chọn
    if (V.sel) {
      const q = M.nodes[V.sel[0]][V.sel[1]], rad = V.sel[1] === 4 ? 12 : 10;
      G.art.hero(G.ux, { x: q[0], y: q[1] - rad + 1, face: 1, key: sv.hero, move: false, t: G.time, atk: -1, dodge: -1, weapon: null, outfit: G.outfit ? G.outfit.look(sv) : null, noShadow: true });
      VS.bubble(V.sel[1] === 4 ? 'Trùm ' + G.REGIONS[V.sel[0]].bossName : 'Ải ' + (V.sel[1] + 1), q[0], q[1] - rad - 26, { bg: '#ffe9a8', size: 7.5 });
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
      ui.text(R.name + ' · ' + (i === 4 ? 'Ải trùm' : 'Ải ' + (i + 1)) + (V.diff ? ' · khó 2' : ''), 256, 219, { size: 9.5, bold: true, color: GOLD });
      ui.text((i === 4 ? 'Trùm vùng ' + R.bossName : 'Trùm nhỏ ' + R.mini) + ' · ' + (i < 2 ? 7 : 8) + ' phòng', 256, 230, { size: 7, color: TXT });
      ui.text('Hệ ' + G.EL[R.el].name + ' · gợi ý cấp hero ' + Math.max(1, Math.round((r * 5 + i) * 1.6 + 1 + (V.diff ? 6 : 0))), 256, 240, { size: 7, color: G.EL[R.el].col });
      ui.para('Thưởng: ' + b.xp + ' kinh nghiệm, ~' + b.gold + ' vàng, ' + (5 + i) + ' ' + R.mat.toLowerCase() + (i === 4 ? ', ' + (V.diff ? 4 : 3) + ' mảnh ' + R.bossName + ', vũ khí quý' : ''), 256, 250.5, 144, { size: 6.5, color: SOFT });
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
    ui.text(G.wName(w), 96, 68, { size: 10.5, bold: true, color: rar.col });
    ui.text('Bậc ' + rar.name + (fam ? ' · dòng ' + fam.name : ' · ' + G.WTYPES[w.type].name), 96, 80, { size: 7.5, color: SOFT });
    if (fam && fam.nature) ui.text('Tính nết: ' + fam.nature, 96, 91, { size: 7.5, color: SOFT });
    ui.text('Sát thương mỗi đòn ' + G.wBase(w, sv.heroes[sv.hero].lvl).toFixed(1) + ' · hệ số bậc x' + String(G.wRarMult(w)).replace('.', ','), 96, 102, { size: 7.5 });
    const mi = G.markInfo(w);
    ui.text(mi.txt, 96, 113, { size: 7.5, color: mi.col });
    ui.bar(96, 117, 146, 4, mi.frac, mi.col);
    ui.text('Tiến hóa cao nhất của bậc này: ' + G.STAGE_NAMES[rar.maxStage], 18, 140, { size: 7, color: SOFT });
    // dòng phụ và dòng mạnh
    let y = 156;
    T.head('Dòng phụ', 18, y);
    y += 12;
    if (!w.affixes || !w.affixes.length) { ui.text(r === 0 ? 'Bậc Thường không có dòng phụ.' : 'Chưa có.', 18, y, { size: 7.5, color: SOFT }); y += 11; }
    for (const k of w.affixes || []) { ui.text('• ' + G.AFFIX[k], 18, y, { size: 7.5 }); y += 11; }
    if (w.power && G.POWER[w.power]) {
      y += 3;
      ui.text('Dòng mạnh: ' + G.POWER[w.power].name, 18, y, { size: 8.5, bold: true, color: G.RARITY[3].col });
      y = ui.para(G.POWER[w.power].desc, 18, y + 11, 200, { size: 7.5 });
    }
    ui.para(r >= 3 ? 'Đã ở bậc cao nhất.' : 'Ông Thợ Rèn nâng bậc được, không mất dấu ấn và tiến hóa.', 18, 250, 220, { size: 7, color: SOFT });
    // đặc trưng hệ theo cấp
    const x0 = 250;
    T.head('Đặc trưng hệ theo cấp', x0, 68);
    const el = w.branch, E = el ? G.EL[el] : null;
    if (!el) ui.para('Chưa khóa nhánh hệ. Kết liễu quái đang dính hiệu ứng để nhận dấu ấn; đủ ' + G.MARKS[0] + ' dấu ấn của một hệ thì vũ khí theo hệ đó.', x0, 80, 212, { size: 7, color: SOFT });
    const rows = [
      ['Trắng', 'Chỉ có chỉ số, chưa mang hệ.'],
      ['Mầm', 'Chỉ số tăng. ' + Math.round(G.PROC[1] * 100) + '% mỗi đòn gây ' + (el ? (el === 'fire' ? 'cháy' : el === 'poison' ? 'độc' : 'chậm') : 'hiệu ứng hệ') + ', vệt chém nhuốm màu hệ. Chưa có luật hệ.'],
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
      ui.text(locked ? 'Cần bậc Lam' : got ? 'Đã mở' : i === st + 1 ? 'Sắp mở: ' + G.MARKS[i - 1] + ' dấu ấn' : 'Chưa mở', x0 + 209, ry + 10, { size: 6.5, align: 'right', bold: got, color: locked ? WARN : got ? GOOD : SOFT });
      if (q[1]) ui.para(q[1], x0 + 5, ry + 19, 204, { size: 6.5, color: TXT });
      else if (el) {
        const f = G.HE_FEATURES[el][q[2]];
        ui.text('Đặc trưng ' + (q[2] + 1) + ': ' + f.name, x0 + 62, ry + 10, { size: 7.5, bold: true, color: got ? E.col2 : TXT });
        ui.para(f.desc, x0 + 5, ry + 20, 204, { size: 6.5, color: TXT });
      } else {
        ui.text(q[2] ? 'Đặc trưng 2: phản ứng dây chuyền' : 'Đặc trưng 1: thứ để lại trên sân', x0 + 5, ry + 21, { size: 7, color: TXT });
        ui.text(G.ELS.map((e) => G.EL[e].name + ': ' + G.HE_FEATURES[e][q[2]].name).join(' · '), x0 + 5, ry + 31, { size: 7, color: TXT });
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
      if (G.weaponLine(w, CX, y, CW, V.sel === w.id)) { V.sel = w.id; G.click = null; G.sfx('ui'); }
      if (carry.includes(w.id)) ui.text('đang mang', CX + CW - 6, y + 9.5, { size: 6.5, align: 'right', color: GOOD });
    });
    ui.text(list.length + ' vũ khí', CX + 2, 200.5, { size: 7, color: SOFT });
    return list;
  }
  const actBtn = (label, o) => T.btn(CX + CW - 92, DET_Y + 9, 86, 34, label, Object.assign({ size: 11, primary: true }, o));
  function forge() {
    const sv = G.save;
    let line = null; // câu ông thợ rèn nói
    frame('Lò rèn cấp ' + sv.forge);
    const tabs = [['sharpen', 'Mài'], ['tier', 'Nâng bậc'], ['reforge', 'Tôi lại'], ['craft', 'Rèn đồ'], ['up', 'Nâng lò']];
    tabs.forEach((t, i) => {
      if (T.tab(CX + i * 61.5, PY + 23, 58, 22, t[1], V.ftab === t[0], { pad: 2 })) { V.ftab = t[0]; V.sel = null; V.page = 0; }
    });
    const R4 = G.RARITY, xm = (m) => 'x' + String(m).replace('.', ',');
    if (V.ftab !== 'up') T.inset(CX, DET_Y, CW, 52, false);
    if (V.ftab === 'sharpen') {
      weaponList();
      const w = G.weaponById(V.sel);
      line = 'Chọn một vũ khí để mài. Mỗi cấp mài tăng 8% sát thương gốc.';
      if (!w) ui.text('Chạm một vũ khí ở trên để chọn.', CX + 8, DET_Y + 30, { size: 8.5, color: SOFT });
      else {
        const cap = G.FORGE_CAP[sv.forge];
        const c = G.sharpenCost(w.sharpen);
        const cost = { ore: c.ore, gold: c.gold, mat: [0, 0, 0] };
        if (c.mat) cost.mat[w.sharpen < 7 ? 1 : 2] = c.mat;
        ui.text(G.wName(w), CX + 8, DET_Y + 14, { size: 8.5, bold: true, color: R4[G.wRar(w)].col });
        ui.text('Sát thương mỗi đòn ' + G.wBase(w, sv.heroes[sv.hero].lvl).toFixed(1), CX + 8, DET_Y + 26, { size: 7.5 });
        if (w.sharpen >= 10) { ui.text('Đã mài tối đa.', CX + 8, DET_Y + 40, { size: 8, color: GOOD }); line = 'Lưỡi này bén hết cỡ rồi cháu ạ.'; }
        else if (w.sharpen >= cap) { ui.para('Lò cấp ' + sv.forge + ' chỉ mài tới +' + cap + '. Hãy nâng lò.', CX + 8, DET_Y + 38, 290, { size: 7.5, color: WARN }); line = 'Lò còn yếu, phải nâng lò mới mài tiếp được.'; }
        else {
          ui.para('Lên +' + (w.sharpen + 1) + ' tốn: ' + costText(cost), CX + 8, DET_Y + 38, 198, { size: 7.5, color: canPay(cost) ? TXT : WARN });
          if (!canPay(cost)) line = 'Chưa đủ nguyên liệu. Vào ải kiếm thêm rồi quay lại nhé.';
          if (actBtn('Mài', { disabled: !canPay(cost) })) { pay(cost); w.sharpen++; G.persist(); G.sfx('evolve'); say('Đã mài ' + G.wName(w) + ' lên +' + w.sharpen + '!'); }
        }
      }
    } else if (V.ftab === 'tier') {
      weaponList();
      const w = G.weaponById(V.sel);
      const raise = (to, gold) => { // lên một nấc: giữ nguyên dấu ấn và tiến hóa, bù dòng phụ cho đủ theo bậc mới
        w.rarity = to; if (to === 3) w.gold = gold;
        G.fitAffixes(w);
        if (G.wStage(w) === 3 && !w.named) G.addMarks(w, w.branch, 0.001);
        G.persist(); G.sfx('evolve'); say('Đã nâng ' + G.wName(w) + ' lên bậc ' + R4[to].name + '!');
      };
      line = 'Bốn bậc: ' + R4.map((q) => q.name + ' ' + xm(q.mult)).join(', ') + '. Nâng bậc không mất dấu ấn và tiến hóa.';
      if (!w) {
        ui.para('Thường chỉ tiến hóa tới Thành hình. Lam có 1 dòng phụ, Tím 2, Vàng 2 và 1 dòng mạnh. Lên Vàng cần mảnh trùm vùng.', CX + 8, DET_Y + 14, 288, { size: 7.5, color: SOFT });
      } else if (G.wRar(w) < 2) {
        const r = G.wRar(w), cost = G.TIER_UP[r + 1];
        ui.text(G.wName(w) + ': ' + R4[r].name + ' lên ' + R4[r + 1].name, CX + 8, DET_Y + 14, { size: 8.5, bold: true, color: R4[r + 1].col });
        ui.para('Sát thương gốc ' + xm(R4[r].mult) + ' lên ' + xm(R4[r + 1].mult) + ', thêm 1 dòng phụ' + (r === 0 ? ', tiến hóa được tới Thức tỉnh' : '') + '.', CX + 8, DET_Y + 25, 198, { size: 7, color: TXT });
        ui.para('Tốn: ' + costText(cost), CX + 8, DET_Y + 46, 198, { size: 7, color: canPay(cost) ? TXT : WARN });
        line = 'Dấu ấn và tiến hóa được giữ nguyên.' + (canPay(cost) ? '' : ' Nhưng cháu chưa đủ nguyên liệu.');
        if (actBtn('Nâng bậc', { size: 10, disabled: !canPay(cost) })) raise(r + 1, 0);
      } else {
        // Nấc cuối lên Vàng: cần mảnh trùm (chỉ trùm vùng rơi). Dùng mảnh trùm vùng nào thì nhận hệ số Vàng của vùng đó.
        const isGold = G.wRar(w) === 3, opts = [0, 1, 2].filter((k) => !isGold || k > w.gold);
        if (!opts.length) { ui.text(G.wName(w), CX + 8, DET_Y + 20, { size: 8.5, bold: true, color: R4[3].col }); ui.text('Đã ở bậc cao nhất (Vàng ' + xm(G.wRarMult(w)) + ').', CX + 8, DET_Y + 36, { size: 8 }); line = 'Món này quý nhất rồi, ông không làm hơn được nữa.'; }
        else {
          ui.text(G.wName(w) + (isGold ? ': luyện Vàng mạnh hơn' : ': Tím lên Vàng, thêm 1 dòng mạnh'), CX + 8, DET_Y + 12, { size: 7.5, bold: true, color: R4[3].col });
          line = 'Chọn mảnh trùm để luyện. Mỗi lần tốn 4 mảnh trùm và 2 đá tôi. Mảnh của vùng sau cho Vàng mạnh hơn.';
          opts.forEach((k, j) => {
            const cost = G.goldCost(k);
            if (T.btn(CX + 4 + j * 99, DET_Y + 17, 96, 30, G.REGIONS[k].bossName + ' ' + xm(G.GOLD_MULT[k]), { size: 8.5, sub: costText(cost), subSize: 6.5, disabled: !canPay(cost), gold: true })) { pay(cost); raise(3, k); }
          });
        }
      }
    } else if (V.ftab === 'reforge') {
      const list = weaponList((w) => !!w.branch);
      if (!list.length) ui.para('Chưa có vũ khí nào khóa nhánh. Vũ khí khóa nhánh khi đủ 30 dấu ấn của một hệ.', CX + 4, LIST_Y + 16, 290, { size: 8.5, color: SOFT });
      const w = G.weaponById(V.sel);
      line = 'Tôi lại để đổi nhánh hệ. Tốn 1 đá tôi, vũ khí giữ một nửa số dấu ấn.';
      if (!w || !w.branch) ui.text('Chạm một vũ khí đã khóa nhánh để chọn.', CX + 8, DET_Y + 30, { size: 8.5, color: SOFT });
      else {
        ui.text(G.wName(w), CX + 8, DET_Y + 13, { size: 8.5, bold: true, color: R4[G.wRar(w)].col });
        ui.text('Đang theo nhánh ' + G.EL[w.branch].name + ' (' + Math.floor(w.marks[w.branch]) + ' dấu ấn). Đổi sang:', CX + 8, DET_Y + 24, { size: 7.5 });
        if (sv.stones < 1) line = 'Cháu hết đá tôi rồi. Rương và trùm trong ải hay rơi đá tôi đấy.';
        G.ELS.filter((e) => e !== w.branch).forEach((e, k) => {
          if (T.btn(CX + 8 + k * 148, DET_Y + 28, 140, 20, G.EL[e].name + ' (1 đá tôi)', { size: 8, disabled: sv.stones < 1, fill: G.EL[e].dark })) {
            sv.stones--;
            const half = Math.floor(w.marks[w.branch] / 2);
            w.marks[w.branch] = 0;
            w.marks[e] = Math.max(w.marks[e], half);
            w.branch = w.marks[e] >= G.MARKS[0] ? e : null; // chưa đủ 30 dấu ấn thì mở khóa nhánh
            w.name = null;
            G.persist(); G.sfx('evolve'); say('Đã tôi lại sang hệ ' + G.EL[e].name + '.');
          }
        });
      }
    } else if (V.ftab === 'craft') {
      // Mũ, áo, bùa nay là trang phục: Cô Thợ May may, nâng bậc, mặc thử. Ông chỉ đường sang đó.
      ui.para('Mũ, áo, đồ đeo lưng, bùa và cánh giờ do Cô Thợ May may từ gỗ linh, vảy cá, đá lửa. Mũ áo ông rèn trước đây đã được chuyển sang kho trang phục, không mất món nào.', CX + 6, LIST_Y + 8, 292, { size: 8, color: TXT });
      ui.text('Kho trang phục: ' + (G.outfit ? sv.outfit.items.length : 0) + ' món', CX + 6, LIST_Y + 62, { size: 8, bold: true, color: GOLD });
      line = 'Đồ vải vóc thì sang khung cửi của Cô Thợ May nhé cháu.';
      if (actBtn('Sang Cô Thợ May', { size: 9 })) { VS.goNpc('may', true); return line; }
    } else {
      ui.para('Lò rèn cấp ' + sv.forge + ' mài được vũ khí tới +' + G.FORGE_CAP[sv.forge] + '.', CX + 4, 112, 296, { size: 9.5 });
      const up = G.FORGE_UP[sv.forge];
      if (!up) { ui.text('Lò rèn đã ở cấp cao nhất.', CX + 4, 134, { size: 9.5, color: GOOD }); line = 'Lò của ông giờ nóng nhất vùng rồi!'; }
      else {
        const y2 = ui.para('Nâng lên cấp ' + (sv.forge + 1) + ' để mài tới +' + G.FORGE_CAP[sv.forge + 1] + '.', CX + 4, 134, 296, { size: 9 });
        ui.para('Tốn: ' + costText(up), CX + 4, y2 + 4, 296, { size: 9, color: canPay(up) ? TXT : WARN });
        line = canPay(up) ? 'Đủ đồ rồi đấy, nâng lò thôi cháu!' : 'Gom đủ nguyên liệu rồi ông nâng lò cho.';
        if (T.btn(CX + 4, y2 + 24, 130, 34, 'Nâng lò', { size: 11, primary: true, disabled: !canPay(up) })) { pay(up); sv.forge++; G.persist(); G.sfx('evolve'); say('Lò rèn đã lên cấp ' + sv.forge + '!'); }
      }
    }
    return line;
  }

  // ---------- rương vũ khí, chọn hai món mang theo, bán đồ (Bà Hàng Xén) ----------
  function gear() {
    const sv = G.save;
    if (V.gtab === 'outfit' && G.outfit) return shop();
    frame('Hàng xén: vũ khí');
    if (G.outfit && T.sbtn(PX + PW - 150, PY + 3, 80, 17, 'Trang phục ›', { size: 8, pad: 4 })) { V.gtab = 'outfit'; V.sel = null; V.page = 0; return null; }
    ui.text('Đang mang', CX + 2, 77, { size: 7.5, color: SOFT });
    sv.carry.forEach((id, slot) => {
      const w = G.weaponById(id);
      if (w && G.weaponLine(w, CX, 80 + slot * PITCH, CW, false)) {
        G.click = null;
        if (V.sel != null && !sv.carry.includes(V.sel)) { sv.carry[slot] = V.sel; V.sel = null; G.persist(); G.sfx('pick'); }
        else viewWeapon(w.id, 'gear'); // chưa chọn gì để thay: mở màn xem vũ khí
      }
    });
    const stash = sv.weapons.filter((w) => !sv.carry.includes(w.id));
    ui.text('Rương đồ' + (stash.length ? ' (' + stash.length + ' món)' : ''), CX + 2, 138, { size: 7.5, color: SOFT });
    if (!stash.length) ui.text('Trống. Vũ khí nhặt trong ải sẽ nằm ở đây.', CX + 2, 156, { size: 8 });
    pager(stash.length, ROWS, CX, 241);
    stash.slice(V.page * ROWS, V.page * ROWS + ROWS).forEach((w, k) => {
      if (G.weaponLine(w, CX, 141 + k * PITCH, CW, V.sel === w.id)) { V.sel = V.sel === w.id ? null : w.id; G.click = null; G.sfx('ui'); }
    });
    const selW = G.weaponById(V.sel);
    if (selW && !sv.carry.includes(selW.id)) {
      const price = [20, 60, 150, 400][G.wRar(selW)] + selW.sharpen * 15;
      if (T.sbtn(CX + 112, 240, 56, 19, 'Xem', { size: 8.5, pad: 3 })) viewWeapon(selW.id, 'gear');
      if (T.sbtn(CX + 176, 240, 128, 19, 'Bán ' + price + ' vàng', { size: 8.5, pad: 3, danger: true })) {
        sv.weapons = sv.weapons.filter((w) => w.id !== selW.id);
        sv.gold += price; V.sel = null; G.persist(); G.sfx('pick'); say('Bà mua rồi nhé, ' + price + ' vàng của cháu đây.');
      }
    }
    // bà chỉ cách đổi vũ khí đang mang
    return !stash.length ? 'Chạm một vũ khí đang mang để xem bậc, dòng phụ và đặc trưng hệ.' : selW && !sv.carry.includes(selW.id) ? 'Đã chọn ' + G.wName(selW) + '. Giờ chạm một vũ khí đang mang để thay, hoặc bấm Xem, Bán.' : 'Chạm vũ khí đang mang để xem. Muốn đổi: chạm một món trong rương để chọn trước.';
  }

  // ---------- trang phục thường (Bà Hàng Xén bán) ----------
  function shop() {
    const sv = G.save, O = G.outfit, list = O.shopList();
    frame('Hàng xén: trang phục');
    if (T.sbtn(PX + PW - 150, PY + 3, 80, 17, '‹ Vũ khí', { size: 8, pad: 4 })) { V.gtab = 'weapon'; V.sel = null; V.page = 0; return null; }
    ui.text('Đồ thường, mặc ngay được. Đem tới Cô Thợ May để nâng bậc.', CX + 2, 78, { size: 7, color: SOFT });
    pager(list.length, 5, CX + CW - 100, 239);
    let line = 'Áo mũ thường đây cháu ơi, rẻ mà bền. Muốn đẹp hơn thì nhờ Cô Thợ May nâng bậc.';
    list.slice(V.page * 5, V.page * 5 + 5).forEach((k, i) => {
      const Ti = O.ITEMS[k], y = 84 + i * 30, own = O.has(sv, k);
      T.inset(CX, y, CW, 28, false);
      T.slot(CX + 3, y + 2, 24, 0);
      O.drawIcon(G.ux, k, CX + 15, y + 14, 20);
      ui.text(Ti.name + ' · ' + O.SLOT_NAME[Ti.slot], CX + 32, y + 11, { size: 8, bold: true, color: TXT });
      const st = O.stats({ k, r: 0 });
      ui.text(Object.keys(st).map((q) => O.statText(q, st[q])).join(', ') + (own ? ' · đã có' : ''), CX + 32, y + 22, { size: 6.5, color: own ? GOOD : SOFT });
      if (T.sbtn(CX + CW - 84, y + 5, 78, 18, 'Mua ' + Ti.price + ' vàng', { size: 7.5, pad: 2, disabled: sv.gold < Ti.price || O.full(sv) })) {
        const it = O.buy(sv, k);
        if (it) { G.persist(); G.sfx('pick'); VS.checkNews(); say('Của cháu đây, ' + Ti.name + '. Sang Cô Thợ May mà mặc thử.'); }
      }
    });
    if (O.full(sv)) line = 'Kho trang phục của cháu đầy rồi, bà không bán thêm được.';
    return line;
  }

  // ---------- trang phục (Cô Thợ May): bảng nằm ở js/tailor.js, gắn vào PANELS.outfit ----------
  function outfit() { frame('Thợ may'); return 'Khung cửi đang sửa, cháu quay lại sau nhé.'; }

  // ---------- chọn hero, xem chỉ số (Ông Từ) ----------
  function hero() {
    const sv = G.save;
    frame('Sân đình: chọn hero');
    let line = null;
    G.HKEYS.forEach((k, i) => {
      const H = G.HEROES[k], hs = sv.heroes[k];
      const x = CX + (i % 2) * 154, y = 72 + Math.floor(i / 2) * 40;
      if (T.btn(x, y, 150, 36, '', { disabled: !hs.unlocked, sel: sv.hero === k })) { sv.hero = k; G.persist(); VS.checkNews(); }
      // chân dung em bé tinh linh của từng hero; hero đang chọn thì nhún nhảy, chưa mở thì mờ
      G.art.hero(G.ux, { x: x + 18, y: y + 32, face: 1, key: k, move: sv.hero === k, t: G.time, atk: -1, dodge: -1, weapon: null, noShadow: true, alpha: hs.unlocked ? null : 0.4, outfit: sv.hero === k && G.outfit ? G.outfit.look(sv) : null });
      ui.text(H.name, x + 88, y + 15, { size: 10, bold: true, align: 'center', color: hs.unlocked ? '#fff0c4' : '#8fa49e' });
      ui.text(hs.unlocked ? 'Cấp ' + hs.lvl + (sv.hero === k ? ' · đang chọn' : '') : H.unlock, x + 88, y + 27, { size: 7, align: 'center', color: hs.unlocked ? '#e8d9a8' : '#8fa49e' });
    });
    const k = sv.hero, H = G.HEROES[k], hs = sv.heroes[k];
    ui.text(H.name + ' · cấp ' + hs.lvl, CX + 2, 164, { size: 10, bold: true, color: GOLD });
    T.bar(CX + 110, 157, 192, 'xp', hs.lvl >= G.MAX_LEVEL ? 1 : hs.xp / G.xpNeed(hs.lvl), null, { h: 7 });
    let y = 178;
    ui.text('Máu gốc ' + H.hp + ' · Mana ' + H.mana + ' · Tốc độ ' + Math.round(H.speed * 100) + '%', CX + 2, y, { size: 7.5 });
    y = ui.para('Sở trường: ' + H.fav.map((f) => G.WTYPES[f].name).join(', ') + ' (+10% sát thương)', CX + 2, y + 11, 300, { size: 7.5 });
    y = ui.para('Nội tại: ' + H.passive, CX + 2, y + 2, 300, { size: 7.5, color: SOFT });
    ui.para('Kỹ năng ' + H.skill + ' (40 mana): ' + H.skillDesc, CX + 2, y + 2, 300, { size: 7.5, color: SOFT });
    const lock = G.HKEYS.filter((q) => !sv.heroes[q].unlocked);
    line = lock.length ? 'Khẽ thôi, các bé đang chơi trong sân. Còn ' + lock.length + ' bé chưa về làng: hạ trùm vùng để đón về.' : 'Khẽ thôi, các bé đang chơi trong sân. Chạm một bé để đổi.';
    return line;
  }

  // ---------- cây kỹ năng và hướng dẫn (Cụ Đồ) ----------
  function doTabs() {
    [['skill', 'Cây kỹ năng'], ['help', 'Hướng dẫn']].forEach((t, i) => {
      if (T.tab(CX + i * 154, PY + 23, 150, 22, t[1], V.tab === t[0], { pad: 2 })) { V.tab = t[0]; V.dtab = t[0]; V.page = 0; }
    });
  }
  function skill() {
    const sv = G.save, k = sv.hero, H = G.HEROES[k], hs = sv.heroes[k];
    frame('Gốc đa: ' + H.name);
    doTabs();
    const spent = hs.sk.atk + hs.sk.def + hs.sk.elem;
    const pts = Math.floor(hs.lvl / 3) - spent;
    ui.text('Còn ' + pts + ' điểm (mỗi 3 cấp nhận 1 điểm)', CX + 2, 104, { size: 8, bold: true, color: pts > 0 ? GOOD : SOFT });
    G.SKEYS.forEach((b, r) => {
      const y0 = 109 + r * 42, n = hs.sk[b], Bk = G.SKILLS[b];
      T.inset(CX, y0, CW, 39, false);
      ui.text(Bk.name, CX + 6, y0 + 12, { size: 9, bold: true, color: GOLD });
      for (let j = 0; j < 5; j++) { ui.rect(CX + 46 + j * 12, y0 + 5, 9, 8, j < n ? '#ffd23f' : '#0d1716', j < n ? '#fff0a8' : T.C.brD); }
      if (n < 5) {
        ui.para('Tiếp: ' + Bk.nodes[n], CX + 6, y0 + 24, 236, { size: 7, color: TXT });
        if (T.sbtn(CX + CW - 54, y0 + 8, 48, 24, 'Học', { size: 9, pad: 4, primary: pts > 0, disabled: pts <= 0 })) { hs.sk[b]++; G.persist(); G.sfx('evolve'); VS.checkNews(); }
      } else ui.text('Đã học hết nhánh này.', CX + 6, y0 + 28, { size: 7.5, color: GOOD });
    });
    if (spent > 0 && T.sbtn(CX, 240, 170, 20, 'Đặt lại điểm (100 vàng)', { size: 8, pad: 3, disabled: sv.gold < 100 })) {
      sv.gold -= 100; hs.sk = { atk: 0, def: 0, elem: 0 }; G.persist(); VS.checkNews(); say('Lão xoá hết rồi, con học lại từ đầu nhé.');
    }
    return pts > 0 ? 'Ngồi xuống đây, lão chỉ cho một chiêu. Con còn ' + pts + ' điểm chưa dùng đấy.' : 'Lên thêm cấp rồi quay lại, lão dạy tiếp. Cứ 3 cấp con được 1 điểm.';
  }
  const HELP = () => [
    ['Đi lại trong làng', 'Kéo ở nửa trái màn hình để đi, hoặc chạm vào một người để em bé tự chạy tới. Dải khuôn mặt ở mép trên là lối tắt. Ai có việc mới thì có dấu chấm than vàng.'],
    ['Di chuyển và đánh', 'Cảm ứng: đặt ngón ở nửa trái màn hình rồi kéo để đi. Bên phải có các nút tròn: giữ Đánh để ra đòn liên tục, Né để lăn tránh, Đặc biệt để tung đòn mạnh (tốn mana), nút còn lại là kỹ năng riêng của hero.'],
    ['Các ô ở mép trên', 'Chạm ô vũ khí ở góc trên bên phải để đổi giữa hai vũ khí. Chạm ô Bình máu để hồi máu. Chạm Dừng để tạm nghỉ.'],
    ['Mở rương, qua cửa', 'Lại gần rương, suối hay thương nhân rồi bấm Đánh. Hết quái thì cửa mở: đi vào cửa có mũi tên để sang phòng kề. Chạm bản đồ nhỏ để xem cả ải.'],
    ['Bàn phím', 'Mũi tên hoặc WASD để đi, J đánh (ở làng: nói chuyện), K né, L đặc biệt, I kỹ năng, Q đổi vũ khí, E uống bình máu, M xem bản đồ, Esc tạm dừng hoặc đóng bảng.'],
    ['Ba sao', 'Sao 1: qua ải. Sao 2: không dùng bình máu. Sao 3: ra đòn kết liễu trùm bằng hệ khắc chế nó.'],
    ['Dấu ấn', G.HINTS[0] + ' ' + G.HINTS[1]],
    ['Ba hệ', G.HINTS[4] + ' ' + G.HINTS[5]],
    ['Trùm học theo bạn', G.HINTS[2] + ' ' + G.HINTS[3]],
    ['Đọc đòn quái', 'Vùng đỏ trên sàn là chỗ đòn sắp rơi xuống, đầy dần rồi nổ: đi ra ngoài hoặc lộn qua. Quái đánh được mọi hướng, kể cả trên dưới và chéo. Vòng đỏ chỗ trống là quái sắp mọc lên.'],
    ['Các loại quái', 'Xông tới, bầy nhỏ, bắn xa (gọi thêm bầy), nhanh nhẹn (lặn rồi trồi sau lưng), giáp (che phía trước, hồi máu cho bạn: vòng ra sau hoặc đánh vỡ giáp), cảm tử (lao vào rồi nổ), đặt bom (bom có vòng đếm ngược), gai (đang dựng gai mà chém thì bị phản đòn). Nổ ở Hang biển làm đóng băng, ở Rừng già để vũng độc, ở Lâu đài cổ để vệt cháy.'],
    ['Tinh anh và trùm', 'Tinh anh có chiêu riêng và một dấu hiệu trên đầu: tia chớp là nhanh, khiên là bọc giáp, quả bom là nổ khi chết, giọt máu là hút máu. Trùm nhỏ có hai chiêu riêng. Trùm vùng có ba pha, đổi ở 2/3 và 1/3 máu, pha sau thêm chiêu và nhanh hơn; sau chiêu lớn trùm choáng một lúc, đó là lúc đánh mạnh nhất.'],
    ['Vật trong phòng', 'Chậu than, nấm độc và tinh thể băng phát nổ khi bị đánh, gây hiệu ứng lên quái đứng gần. Đây là cách gây hệ khi vũ khí còn trắng.'],
    ['Bốn bậc màu', 'Thường (sát thương x1, tiến hóa tới Thành hình), Lam (x1,15, có 1 dòng phụ), Tím (x1,3, có 2 dòng phụ), Vàng (x1,5 trở lên, 2 dòng phụ và 1 dòng mạnh riêng). Từ Lam trở lên tiến hóa được tới Thức tỉnh.'],
    ['Nguồn vũ khí', 'Rương và quái tinh anh rơi vũ khí bậc ngẫu nhiên, cao nhất là Tím; vùng sau dễ ra bậc cao hơn. Trùm vùng lần đầu bị hạ chắc chắn rơi một vũ khí Vàng. Ông Thợ Rèn nâng bậc từng nấc mà không mất tiến hóa; nấc lên Vàng cần mảnh trùm.'],
    ['Đặc trưng hệ theo cấp', 'Trắng: chỉ có chỉ số. Mầm: có tỉ lệ gây cháy, độc, chậm nhưng chưa có luật hệ. Thành hình: mở đặc trưng 1, thứ để lại trên sân (vệt cháy, vũng độc, gai băng). Thức tỉnh: mở đặc trưng 2, phản ứng dây chuyền (nổ lan, lây độc, băng vỡ).'],
    ['Xem vũ khí', 'Ở làng, chạm vào vũ khí đang bay theo em bé để xem bậc, dòng phụ và các đặc trưng đã mở, sắp mở. Ở chỗ Bà Hàng Xén cũng có nút Xem cho món trong rương.'],
  ];
  function help() {
    frame('Gốc đa: hướng dẫn');
    doTabs();
    // xếp các mục vào từng trang cho vừa bảng
    const secs = HELP(), pages = [[]], top = 106, bottom = 236;
    let y = top;
    for (const s of secs) {
      const h = 11 + ui.wrap(s[1], 298, 7.5).length * 10.5 + 5;
      if (y + h > bottom && pages[pages.length - 1].length) { pages.push([]); y = top; }
      pages[pages.length - 1].push(s); y += h;
    }
    V.page = G.clamp(V.page, 0, pages.length - 1);
    y = top;
    for (const l of pages[V.page]) {
      T.head(l[0], CX + 2, y);
      y = ui.para(l[1], CX + 2, y + 11, 298, { size: 7.5, color: TXT }) + 5 + 2.5;
    }
    pager(pages.length, 1, CX + CW - 100, 242);
    return 'Lão chép cả ra đây, con đọc thong thả. Bấm mũi tên để lật trang.';
  }

  // ---------- cài đặt (Anh Mõ) ----------
  function settings() {
    const sv = G.save;
    frame('Cổng làng: cài đặt');
    if (T.btn(CX + 4, 74, 200, 28, 'Âm thanh: ' + (sv.sound ? 'bật' : 'tắt'))) { sv.sound = !sv.sound; G.persist(); G.audioStart(); }
    if (T.btn(CX + 4, 108, 200, 28, 'Toàn màn hình')) {
      try { const el = document.documentElement; if (document.fullscreenElement) document.exitFullscreen(); else el.requestFullscreen().catch(() => say('Thiết bị này không cho bật toàn màn hình.')); } catch (e) { say('Thiết bị này không cho bật toàn màn hình.'); }
    }
    ui.para('Tiến trình được lưu trong trình duyệt này. Đổi máy hoặc xoá dữ liệu trình duyệt sẽ mất tiến trình.', CX + 4, 156, 292, { size: 8, color: SOFT });
    if (!V.confirm) {
      if (T.btn(CX + 4, 196, 200, 28, 'Xoá tiến trình, chơi lại từ đầu', { size: 8, danger: true })) V.confirm = true;
    } else {
      ui.text('Chắc chắn xoá hết? Không khôi phục được.', CX + 4, 192, { size: 8.5, color: WARN, bold: true });
      // "Thôi" nằm đúng chỗ nút xoá vừa bấm, để bấm đúp nhầm cũng không mất tiến trình
      if (T.btn(CX + 4, 200, 120, 28, 'Thôi')) V.confirm = false;
      else if (T.btn(CX + 132, 200, 120, 28, 'Xoá hết', { danger: true })) { G.resetSave(); V.confirm = false; goHub(); VS.enter({}); VS.say('Đã xoá tiến trình.'); return null; }
    }
    return V.confirm ? 'Ấy ấy! Xoá là mất hết đấy, nghĩ kỹ chưa?' : 'Cốc cốc cốc! Làng nước nghe đây! Cần chỉnh gì cứ bảo anh.';
  }

  const PANELS = { forge, gear, outfit, hero, skill, help, settings };
  Object.assign(G.villageApi, { PANELS, pager, say, costText, frame, npcSide, viewWeapon });
  G.Village = {
    enter() { goHub(); VS.enter({}); G.persist(); },
    hide() { /* không có gì phải dừng */ },
    update(dt) {
      if (V.msgT > 0) V.msgT -= dt;
      VS.update(dt, V.tab !== 'hub');
      // Esc: huỷ câu hỏi xoá, hoặc đóng bảng quay về làng
      if (G.keyP.Escape) { if (V.confirm) V.confirm = false; else if (V.tab === 'weapon' && V.back !== 'hub') V.tab = V.back; else if (V.tab !== 'hub') goHub(); }
    },
    draw() {
      if (V.tab === 'title') V.tab = 'hub';
      if (V.tab === 'map') { mapScreen(); return; }
      VS.drawWorld(V.tab === 'hub' ? null : { dim: 0.62, hideHero: true });
      if (V.tab === 'hub') {
        VS.drawHud();
        const S = VS.state;
        if (!Object.keys(G.save.stars).length && S.hintT <= 0 && !S.near && !S.path && S.msgT <= 0) T.toastFit(240, 244, 'Tới bến đò bên phải, gặp Chú Lái Đò để vào ải', { size: 7.5 });
        return;
      }
      VS.drawTop();
      if (V.tab === 'weapon') { weaponView(); return; }
      const hit = VS.drawStrip(V.who || WHO_OF[V.tab], true, true);
      if (hit) { VS.goNpc(hit, true); return; }
      const fn = PANELS[V.tab] || settings;
      const tab = V.tab, line = fn();
      if (fn.full) return; // bảng tự vẽ người nói (Cô Thợ May)
      if (V.tab === tab || (WHO_OF[V.tab] && WHO_OF[V.tab] === WHO_OF[tab])) npcSide(line);
    },
  };

  G.Title = {
    enter() { VS.enter({ from: 'keep' }); VS.state.x = 470; VS.state.cam = 230; },
    update(dt) {
      VS.update(dt, true);
      if (G.downs.length || G.keyP.Enter || G.keyP.Space || G.keyP.KeyJ) G.setScene(G.Village);
    },
    draw() {
      const c = G.wx, A = G.art;
      V.tab = 'title';
      VS.drawWorld({ dim: 0.5, hideHero: true });
      c.save(); c.translate(96, 250); c.scale(3, 3);
      A.hero(c, { x: 0, y: 0, face: 1, key: 'smith', move: false, t: G.time, atk: (G.time % 1.6) < 0.4 ? (G.time % 1.6) / 0.4 : -1, dodge: -1, weapon: { type: 'sword', family: 0, rarity: 3, marks: { fire: 300, poison: 0, ice: 0 }, branch: 'fire', sharpen: 0 } });
      c.restore();
      T.drum(240, 62, 50, 0.5);
      const u = G.ux; ui.font(40, true); u.textAlign = 'center'; u.lineJoin = 'round'; u.lineWidth = 5; u.strokeStyle = '#1a120a'; u.strokeText('LINH KHÍ', 240, 78);
      ui.text('LINH KHÍ', 240, 78, { size: 40, bold: true, align: 'center', color: GOLD });
      ui.text('Vũ khí lớn lên theo bạn. Yêu tinh học theo bạn.', 240, 100, { size: 10, align: 'center', color: TXT });
      if (Math.floor(G.time * 2) % 2) T.toastFit(240, 112, 'Chạm để bắt đầu', { size: 11 });
      ui.text('Bản thử · hình vẽ tạm', 240, 264, { size: 7, align: 'center', color: SOFT });
    },
  };
})();
