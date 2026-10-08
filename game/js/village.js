// Làng: màn hình chính, bản đồ chọn ải, lò rèn, trang bị, hero và cây kỹ năng, hướng dẫn, cài đặt.
(function () {
  const G = window.G, ui = G.ui;
  const V = { tab: 'hub', sel: null, ftab: 'sharpen', node: null, page: 0, confirm: false, diff: 0, msg: null, msgT: 0 };

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
  G.villageApi = { canPay, pay, V };

  function drawScene() {
    const c = G.wx, A = G.art, p = A.p;
    c.setTransform(1, 0, 0, 1, 0, 0);
    p(c, 0, 0, 480, 70, '#2b1d2e');
    p(c, 0, 70, 480, 50, '#5a2f3a');
    p(c, 0, 120, 480, 40, '#a8553a');
    A.ellipse(c, 420, 96, 18, 18, '#ffcf6a');
    for (let i = 0; i < 6; i++) p(c, i * 90 - 20, 130 - ((i * 37) % 22), 120, 40, '#3a2430');
    p(c, 0, 160, 480, 110, '#4a3a2a');
    for (let i = 0; i < 60; i++) p(c, (i * 83) % 480, 164 + ((i * 47) % 100), 3 + (i % 4), 1, i % 2 ? '#40322a' : '#57452f');
    const hut = (x, y, w) => {
      p(c, x, y - 34, w, 34, '#6b4a30');
      p(c, x - 6, y - 46, w + 12, 12, '#8a5a2a');
      p(c, x - 2, y - 52, w + 4, 6, '#a06a32');
      p(c, x + w / 2 - 5, y - 20, 10, 20, '#2a1c14');
    };
    hut(150, 176, 52); hut(382, 172, 60); hut(280, 168, 40);
    // lò rèn
    p(c, 228, 150, 34, 26, '#4a4444');
    p(c, 236, 158, 18, 12, Math.floor(G.time * 6) % 2 ? '#ff7a2a' : '#ffd23f');
    p(c, 240, 132, 8, 18, '#3a3434');
    if (V.tab === 'hub') {
      const sv = G.save;
      c.save();
      c.translate(232, 236);
      c.scale(3, 3);
      const w = G.weaponById(sv.carry[0]);
      A.hero(c, { x: 0, y: 0, face: 1, key: sv.hero, move: false, t: G.time, atk: -1, dodge: -1, weapon: w, helm: sv.helm, armor: sv.armor });
      c.restore();
    }
  }
  function topBar() {
    const sv = G.save;
    ui.rect(0, 0, 480, 22, 'rgba(14,10,10,0.88)');
    const parts = [
      ['Vàng ' + sv.gold, '#ffd23f'], ['Quặng ' + sv.ore, '#c9ccd2'], ['Đá tôi ' + sv.stones, '#d48af5'],
      [G.REGIONS[0].mat + ' ' + sv.mats[0], '#9bd14a'], [G.REGIONS[1].mat + ' ' + sv.mats[1], '#7fd4ff'], [G.REGIONS[2].mat + ' ' + sv.mats[2], '#ff9a5a'],
      ['Mảnh trùm ' + sv.shards.join('/'), '#ffb0a0'],
    ];
    let x = 8;
    for (const q of parts) {
      ui.text(q[0], x, 14, { size: 7.5, bold: true, color: q[1] });
      ui.font(7.5, true);
      x += G.ux.measureText(q[0]).width + 10;
    }
  }
  function goHub() { V.tab = 'hub'; V.sel = null; V.node = null; V.confirm = false; V.page = 0; }
  function frame(title) {
    ui.panel(8, 26, 464, 240, title);
    if (ui.btn(390, 29, 78, 22, '← Về làng', { size: 8.5 })) goHub();
  }

  // ---------- màn hình chính ----------
  function hub() {
    const sv = G.save, hs = sv.heroes[sv.hero], H = G.HEROES[sv.hero];
    ui.text('LINH KHÍ', 14, 42, { size: 15, bold: true, color: '#ffd27a' });
    const btns = [['map', 'Vào ải'], ['forge', 'Lò rèn'], ['gear', 'Trang bị'], ['hero', 'Hero và kỹ năng'], ['help', 'Hướng dẫn'], ['settings', 'Cài đặt']];
    btns.forEach((b, i) => {
      if (ui.btn(14, 52 + i * 33, 124, 28, b[1], { size: 10, color: b[0] === 'map' ? '#a8452a' : '#5a4030' })) { V.tab = b[0]; V.sel = null; V.page = 0; }
    });
    ui.panel(318, 30, 154, 142);
    ui.text(H.name, 326, 46, { size: 11, bold: true, color: '#ffd27a' });
    ui.text('Cấp ' + hs.lvl, 464, 46, { size: 9, align: 'right', bold: true });
    ui.bar(326, 51, 138, 4, hs.lvl >= G.MAX_LEVEL ? 1 : hs.xp / G.xpNeed(hs.lvl), '#e2b36a');
    const P = G.buildPlayer();
    ui.text('Máu ' + P.maxhp + ' · Mana ' + P.maxmana, 326, 68, { size: 7.5 });
    const pts = Math.floor(hs.lvl / 3) - (hs.sk.atk + hs.sk.def + hs.sk.elem);
    if (pts > 0) ui.text('Còn ' + pts + ' điểm kỹ năng chưa dùng', 326, 80, { size: 7.5, color: '#9be07a', bold: true });
    sv.carry.forEach((id, i) => { const w = G.weaponById(id); if (w) G.weaponLine(w, 326, 88 + i * 26, 138, false); });
    ui.text((sv.helm ? G.GEAR.helm[sv.helm].name : 'Chưa đội mũ') + ' · ' + (sv.armor ? G.GEAR.armor[sv.armor].name : 'Chưa mặc áo'), 326, 152, { size: 6.5, color: '#d9cdb8' });
    if (P.set) ui.text('Đủ bộ ' + G.REGIONS.find((r) => r.boss === P.set).bossName, 326, 163, { size: 6.5, color: '#9be07a' });
    const cleared = Object.keys(sv.stars).length;
    if (cleared === 0) {
      ui.rect(146, 56, 150, 20, 'rgba(10,8,6,0.8)', '#ffd27a');
      ui.text('← Bấm Vào ải để bắt đầu', 152, 69.5, { size: 8.5, bold: true, color: '#ffd27a' });
    }
  }

  // ---------- bản đồ ----------
  function unlocked(r, i, diff) {
    const map = diff ? G.save.stars2 : G.save.stars;
    if (diff && Object.keys(G.save.stars).length < 15) return false;
    if (r === 0 && i === 0) return true;
    const pr = i === 0 ? r - 1 : r, pi = i === 0 ? 4 : i - 1;
    return !!map[pr + '-' + pi];
  }
  function mapScreen() {
    const sv = G.save;
    frame('Bản đồ: chọn ải');
    const all = Object.keys(sv.stars).length >= 15;
    if (all) {
      if (ui.btn(228, 29, 156, 22, V.diff ? 'Độ khó 2 (chạm để đổi)' : 'Độ khó thường (chạm để đổi)', { size: 7.5, color: V.diff ? '#6a2a8a' : '#5a4030' })) { V.diff = V.diff ? 0 : 1; V.sel = null; }
    } else V.diff = 0;
    const map = V.diff ? sv.stars2 : sv.stars;
    for (let r = 0; r < 3; r++) {
      const R = G.REGIONS[r], y = 58 + r * 52;
      ui.text(R.name, 18, y + 14, { size: 10, bold: true, color: G.EL[R.el].col });
      ui.text('Hệ chủ đạo: ' + G.EL[R.el].name, 18, y + 26, { size: 7, color: '#d9cdb8' });
      ui.text('Trùm: ' + R.bossName, 18, y + 36, { size: 7, color: '#d9cdb8' });
      for (let i = 0; i < 5; i++) {
        const x = 118 + i * 70, key = r + '-' + i, st = map[key] || 0, ok = unlocked(r, i, V.diff);
        const selc = V.sel && V.sel[0] === r && V.sel[1] === i;
        const label = i === 4 ? R.bossName : 'Ải ' + (i + 1);
        if (ui.btn(x, y, 64, 42, label, { size: i === 4 ? 8.5 : 10, disabled: !ok, color: selc ? '#b5672f' : i === 4 ? '#7a2a22' : '#5a4030', sub: ok ? '★'.repeat(st) + '☆'.repeat(3 - st) : 'Chưa mở' })) V.sel = [r, i];
      }
    }
    if (V.sel) {
      const r = V.sel[0], i = V.sel[1], R = G.REGIONS[r];
      const b = G.stageStats(r, i, V.diff);
      ui.rect(16, 216, 448, 44, 'rgba(50,42,36,0.9)', '#6a5a4a');
      ui.text(R.name + ' ' + (i + 1) + (i === 4 ? ': trùm vùng ' + R.bossName : ': trùm nhỏ ' + R.mini) + ' · ' + (i < 2 ? 7 : 8) + ' phòng', 24, 231, { size: 8.5, bold: true });
      ui.text('Thưởng: ' + b.xp + ' kinh nghiệm, khoảng ' + b.gold + ' vàng, ' + R.mat.toLowerCase() + (i === 4 ? ', mảnh trùm, vũ khí bậc cao' : ''), 24, 244, { size: 7.5, color: '#d9cdb8' });
      ui.text('Gợi ý cấp hero: ' + Math.max(1, Math.round((r * 5 + i) * 1.6 + 1 + (V.diff ? 6 : 0))), 24, 255, { size: 7.5, color: '#d9cdb8' });
      if (ui.btn(372, 222, 84, 32, 'Bắt đầu', { size: 11, color: '#a8452a' })) G.startStage(r, i, V.diff);
    } else ui.text('Chạm một ải để xem thông tin.', 24, 238, { size: 8.5, color: '#d9cdb8' });
  }

  // ---------- lò rèn ----------
  function weaponGrid(y0, filter) {
    const list = G.save.weapons.filter(filter || (() => true));
    list.slice(0, 12).forEach((w, k) => {
      const x = 16 + (k % 2) * 226, y = y0 + Math.floor(k / 2) * 25;
      if (G.weaponLine(w, x, y, 220, V.sel === w.id)) { V.sel = w.id; G.click = null; G.sfx('ui'); }
      if (G.save.carry.includes(w.id)) ui.text('đang mang', x + 214, y + 9.5, { size: 6, align: 'right', color: '#9be07a' });
    });
    return list;
  }
  function forge() {
    const sv = G.save;
    frame('Lò rèn cấp ' + sv.forge);
    const tabs = [['sharpen', 'Mài'], ['tier', 'Nâng bậc'], ['reforge', 'Tôi lại'], ['craft', 'Rèn đồ'], ['up', 'Nâng lò']];
    tabs.forEach((t, i) => {
      if (ui.btn(98 + i * 58, 29, 55, 22, t[1], { size: 8, color: V.ftab === t[0] ? '#b5672f' : '#5a4030' })) { V.ftab = t[0]; V.sel = null; }
    });
    if (V.ftab === 'sharpen') {
      weaponGrid(54);
      const w = G.weaponById(V.sel);
      ui.rect(16, 210, 448, 50, 'rgba(50,42,36,0.9)', '#6a5a4a');
      if (!w) ui.text('Chọn một vũ khí để mài. Mỗi cấp mài tăng 8% sát thương gốc.', 24, 238, { size: 8.5, color: '#d9cdb8' });
      else {
        const cap = G.FORGE_CAP[sv.forge];
        const c = G.sharpenCost(w.sharpen);
        const cost = { ore: c.ore, gold: c.gold, mat: [0, 0, 0] };
        if (c.mat) cost.mat[w.sharpen < 7 ? 1 : 2] = c.mat;
        ui.text(G.wName(w) + ' · sát thương mỗi đòn ' + G.wBase(w, sv.heroes[sv.hero].lvl).toFixed(1), 24, 225, { size: 8.5, bold: true });
        if (w.sharpen >= 10) ui.text('Đã mài tối đa.', 24, 240, { size: 8 });
        else if (w.sharpen >= cap) ui.text('Lò cấp ' + sv.forge + ' chỉ mài tới +' + cap + '. Hãy nâng lò.', 24, 240, { size: 8, color: '#ff9a5a' });
        else {
          ui.text('Lên +' + (w.sharpen + 1) + ' tốn: ' + costText(cost), 24, 240, { size: 8, color: canPay(cost) ? '#d9cdb8' : '#ff9a5a' });
          if (ui.btn(372, 218, 84, 34, 'Mài', { size: 11, disabled: !canPay(cost) })) { pay(cost); w.sharpen++; G.persist(); G.sfx('evolve'); }
        }
      }
    } else if (V.ftab === 'tier') {
      weaponGrid(54);
      const w = G.weaponById(V.sel);
      ui.rect(16, 210, 448, 50, 'rgba(50,42,36,0.9)', '#6a5a4a');
      if (!w) ui.text('Nâng bậc giữ nguyên dấu ấn. Bậc Sắt chỉ tiến hóa tới Thành hình, bậc Bạc và Linh tới Thức tỉnh.', 24, 238, { size: 7.5, color: '#d9cdb8' });
      else if (w.tier >= 2) { ui.text(G.wName(w), 24, 225, { size: 8.5, bold: true }); ui.text('Đã ở bậc cao nhất.', 24, 240, { size: 8 }); }
      else {
        const cost = G.TIER_UP[w.tier + 1];
        ui.text(G.wName(w) + ' · bậc ' + G.TIERS[w.tier].name + ' lên ' + G.TIERS[w.tier + 1].name + ' (sát thương gốc +20%)', 24, 225, { size: 8.5, bold: true });
        ui.text('Tốn: ' + costText(cost), 24, 240, { size: 8, color: canPay(cost) ? '#d9cdb8' : '#ff9a5a' });
        if (ui.btn(372, 218, 84, 34, 'Nâng bậc', { size: 10, disabled: !canPay(cost) })) {
          pay(cost); w.tier++;
          if (w.tier === 2 && !w.affix) w.affix = G.pick(Object.keys(G.AFFIX));
          if (G.wStage(w) === 3 && !w.name) G.addMarks(w, w.branch, 0.001);
          G.persist(); G.sfx('evolve');
        }
      }
    } else if (V.ftab === 'reforge') {
      const list = weaponGrid(54, (w) => !!w.branch);
      if (!list.length) ui.text('Chưa có vũ khí nào khóa nhánh. Vũ khí khóa nhánh khi đủ 30 dấu ấn của một hệ.', 20, 70, { size: 8.5, color: '#d9cdb8' });
      const w = G.weaponById(V.sel);
      ui.rect(16, 210, 448, 50, 'rgba(50,42,36,0.9)', '#6a5a4a');
      if (!w || !w.branch) ui.text('Tôi lại để đổi nhánh hệ. Tốn 1 đá tôi, vũ khí giữ một nửa số dấu ấn.', 24, 238, { size: 8.5, color: '#d9cdb8' });
      else {
        ui.text(G.wName(w) + ' · đang theo nhánh ' + G.EL[w.branch].name + ' (' + Math.floor(w.marks[w.branch]) + ' dấu ấn)', 24, 225, { size: 8.5, bold: true });
        ui.text('Đổi sang:', 24, 244, { size: 8 });
        G.ELS.filter((e) => e !== w.branch).forEach((e, k) => {
          if (ui.btn(80 + k * 100, 232, 92, 22, G.EL[e].name + ' (1 đá tôi)', { size: 8, disabled: sv.stones < 1, color: G.EL[e].dark })) {
            sv.stones--;
            const half = Math.floor(w.marks[w.branch] / 2);
            w.marks[w.branch] = 0;
            w.marks[e] = Math.max(w.marks[e], half);
            w.branch = w.marks[e] >= G.MARKS[0] ? e : null; // chưa đủ 30 dấu ấn thì mở khóa nhánh
            w.name = null;
            G.persist(); G.sfx('evolve');
          }
        });
      }
    } else if (V.ftab === 'craft') {
      const items = [];
      for (const slot of ['helm', 'armor']) for (const id in G.GEAR[slot]) items.push([slot, id, G.GEAR[slot][id]]);
      items.forEach((it, k) => {
        const x = 16 + (k % 2) * 226, y = 54 + Math.floor(k / 2) * 25, g = it[2];
        const own = sv.owned[it[0]].includes(it[1]);
        if (ui.btn(x, y, 220, 22, '', { color: V.sel === it[1] ? '#7a5a2a' : '#3a322c' })) V.sel = it[1];
        ui.text(g.name, x + 6, y + 9.5, { size: 7.5, bold: true, color: g.set ? '#ffd27a' : '#f1ead9' });
        ui.text(it[0] === 'helm' ? 'Giảm ' + Math.round(g.pct * 100) + '% thời gian dính ' + G.EL[g.res].name : 'Máu +' + g.hp + (g.dr ? ', giảm ' + Math.round(g.dr * 100) + '% sát thương' : ''), x + 6, y + 18.5, { size: 6.5, color: '#d9cdb8' });
        ui.text(own ? 'Đã có' : canPay(g.cost) ? 'Rèn được' : '', x + 214, y + 9.5, { size: 6.5, align: 'right', color: own ? '#9be07a' : '#ffd27a' });
      });
      ui.rect(16, 210, 448, 50, 'rgba(50,42,36,0.9)', '#6a5a4a');
      const slot = V.sel && (G.GEAR.helm[V.sel] ? 'helm' : G.GEAR.armor[V.sel] ? 'armor' : null);
      if (!slot) ui.text('Chọn một món để xem giá. Mũ và áo cùng một trùm tạo thành bộ.', 24, 238, { size: 8.5, color: '#d9cdb8' });
      else {
        const g = G.GEAR[slot][V.sel], own = sv.owned[slot].includes(V.sel);
        ui.text(g.name + (g.set ? ' · ' + G.SETS[g.set] : ''), 24, 225, { size: 7.5, bold: true });
        ui.text(own ? 'Bạn đã có món này. Vào Trang bị để mặc.' : 'Tốn: ' + costText(g.cost), 24, 240, { size: 8, color: own || canPay(g.cost) ? '#d9cdb8' : '#ff9a5a' });
        if (!own && ui.btn(372, 218, 84, 34, 'Rèn', { size: 11, disabled: !canPay(g.cost) })) {
          pay(g.cost); sv.owned[slot].push(V.sel);
          if (!sv[slot]) sv[slot] = V.sel;
          G.persist(); G.sfx('evolve');
        }
      }
    } else {
      ui.para('Lò rèn cấp ' + sv.forge + ' mài được vũ khí tới +' + G.FORGE_CAP[sv.forge] + '.', 24, 76, 430, { size: 9.5 });
      const up = G.FORGE_UP[sv.forge];
      if (!up) ui.text('Lò rèn đã ở cấp cao nhất.', 24, 100, { size: 9.5, color: '#9be07a' });
      else {
        ui.text('Nâng lên cấp ' + (sv.forge + 1) + ' để mài tới +' + G.FORGE_CAP[sv.forge + 1] + '. Tốn: ' + costText(up), 24, 100, { size: 9, color: canPay(up) ? '#d9cdb8' : '#ff9a5a' });
        if (ui.btn(24, 116, 120, 30, 'Nâng lò', { size: 11, disabled: !canPay(up) })) { pay(up); sv.forge++; G.persist(); G.sfx('evolve'); }
      }
    }
  }

  // ---------- trang bị ----------
  function cycle(slot) {
    const sv = G.save, own = sv.owned[slot];
    const list = [null].concat(own);
    sv[slot] = list[(list.indexOf(sv[slot]) + 1) % list.length];
    G.persist();
  }
  function gear() {
    const sv = G.save;
    frame('Trang bị');
    ui.text('Đang mang', 16, 62, { size: 7.5, color: '#d9cdb8' });
    sv.carry.forEach((id, slot) => {
      const w = G.weaponById(id);
      if (w && G.weaponLine(w, 16, 66 + slot * 25, 220, false)) {
        G.click = null;
        if (V.sel != null && !sv.carry.includes(V.sel)) { sv.carry[slot] = V.sel; V.sel = null; G.persist(); G.sfx('pick'); }
      }
    });
    ui.text('Rương đồ', 16, 128, { size: 7.5, color: '#d9cdb8' });
    const stash = sv.weapons.filter((w) => !sv.carry.includes(w.id));
    const pages = Math.max(1, Math.ceil(stash.length / 4));
    V.page = Math.min(V.page, pages - 1);
    if (!stash.length) ui.text('Trống. Vũ khí nhặt trong ải sẽ nằm ở đây.', 16, 146, { size: 8 });
    stash.slice(V.page * 4, V.page * 4 + 4).forEach((w, k) => {
      if (G.weaponLine(w, 16, 132 + k * 25, 220, V.sel === w.id)) { V.sel = V.sel === w.id ? null : w.id; G.click = null; G.sfx('ui'); }
    });
    if (pages > 1 && ui.btn(16, 236, 70, 20, 'Trang ' + (V.page + 1) + '/' + pages, { size: 8 })) V.page = (V.page + 1) % pages;
    const selW = G.weaponById(V.sel);
    if (selW && !sv.carry.includes(selW.id)) {
      const price = 20 * (selW.tier + 1) + selW.sharpen * 15;
      if (ui.btn(150, 236, 86, 20, 'Bán ' + price + ' vàng', { size: 8, color: '#6a2a22' })) {
        sv.weapons = sv.weapons.filter((w) => w.id !== selW.id);
        sv.gold += price; V.sel = null; G.persist(); G.sfx('pick');
      }
    }
    // mũ, áo, bùa
    const hs = sv.heroes[sv.hero];
    const rows = [
      ['helm', 'Mũ', sv.helm ? G.GEAR.helm[sv.helm].name : 'Không đội', sv.helm ? 'Giảm ' + Math.round(G.GEAR.helm[sv.helm].pct * 100) + '% thời gian dính ' + G.EL[G.GEAR.helm[sv.helm].res].name : 'Rèn mũ ở lò rèn'],
      ['armor', 'Áo', sv.armor ? G.GEAR.armor[sv.armor].name : 'Không mặc', sv.armor ? 'Máu +' + G.GEAR.armor[sv.armor].hp : 'Rèn áo ở lò rèn'],
      ['charm', 'Bùa', sv.charm ? G.GEAR.charm[sv.charm].name : 'Không đeo', sv.charm ? G.GEAR.charm[sv.charm].desc : 'Bùa rớt từ quái tinh anh'],
    ];
    rows.forEach((r, k) => {
      const y = 58 + k * 40;
      ui.rect(246, y, 218, 36, 'rgba(50,42,36,0.9)', '#6a5a4a');
      ui.text(r[1] + ': ' + r[2], 252, y + 13, { size: 8.5, bold: true });
      ui.para(r[3], 252, y + 24, 150, { size: 6.5, color: '#d9cdb8' });
      const locked = r[0] === 'charm' && hs.lvl < 5;
      if (ui.btn(412, y + 8, 46, 20, locked ? 'Cấp 5' : 'Đổi', { size: 8, disabled: locked || !sv.owned[r[0]].length })) cycle(r[0]);
    });
    const P = G.buildPlayer();
    ui.text('Máu ' + P.maxhp + ' · Mana ' + P.maxmana + ' · Giảm sát thương ' + Math.round(P.dr * 100) + '%', 246, 190, { size: 7.5 });
    const y2 = ui.para(P.set ? G.SETS[P.set] : 'Mặc mũ và áo của cùng một trùm để có hiệu ứng bộ.', 246, 204, 216, { size: 7.5, color: P.set ? '#9be07a' : '#d9cdb8' });
    // chỉ cách đổi vũ khí đang mang
    const tip = !stash.length ? '' : selW && !sv.carry.includes(selW.id) ? 'Đã chọn ' + G.wName(selW) + '. Giờ chạm một vũ khí đang mang để thay, hoặc bấm Bán.' : 'Muốn đổi vũ khí đang mang: chạm một vũ khí trong rương đồ để chọn trước.';
    if (tip) ui.para(tip, 246, Math.max(y2 + 8, 236), 216, { size: 7.5, color: '#ffd27a' });
  }

  // ---------- hero ----------
  function hero() {
    const sv = G.save;
    frame('Hero và kỹ năng');
    G.HKEYS.forEach((k, i) => {
      const H = G.HEROES[k], hs = sv.heroes[k];
      const x = 16 + i * 113;
      if (ui.btn(x, 54, 108, 34, H.name, { size: 10, disabled: !hs.unlocked, color: sv.hero === k ? '#b5672f' : '#5a4030', sub: hs.unlocked ? 'Cấp ' + hs.lvl + (sv.hero === k ? ' · đang chọn' : '') : H.unlock })) {
        sv.hero = k; G.persist();
      }
    });
    const k = sv.hero, H = G.HEROES[k], hs = sv.heroes[k];
    ui.text(H.name + ' · cấp ' + hs.lvl, 16, 104, { size: 10, bold: true, color: '#ffd27a' });
    ui.bar(16, 108, 200, 4, hs.lvl >= G.MAX_LEVEL ? 1 : hs.xp / G.xpNeed(hs.lvl), '#e2b36a');
    let y = 124;
    ui.text('Máu gốc ' + H.hp + ' · Mana ' + H.mana + ' · Tốc độ ' + Math.round(H.speed * 100) + '%', 16, y, { size: 7.5 });
    y = ui.para('Sở trường: ' + H.fav.map((f) => G.WTYPES[f].name).join(', ') + ' (+10% sát thương)', 16, y + 12, 210, { size: 7.5 });
    y = ui.para('Nội tại: ' + H.passive, 16, y + 3, 210, { size: 7.5, color: '#d9cdb8' });
    y = ui.para('Kỹ năng ' + H.skill + ' (40 mana): ' + H.skillDesc, 16, y + 3, 210, { size: 7.5, color: '#d9cdb8' });
    // cây kỹ năng
    const spent = hs.sk.atk + hs.sk.def + hs.sk.elem;
    const pts = Math.floor(hs.lvl / 3) - spent;
    ui.text('Cây kỹ năng · còn ' + pts + ' điểm (mỗi 3 cấp nhận 1 điểm)', 240, 104, { size: 8, bold: true, color: pts > 0 ? '#9be07a' : '#d9cdb8' });
    G.SKEYS.forEach((b, r) => {
      const y0 = 110 + r * 44, n = hs.sk[b], B = G.SKILLS[b];
      ui.rect(240, y0, 224, 40, 'rgba(50,42,36,0.9)', '#6a5a4a');
      ui.text(B.name, 246, y0 + 12, { size: 9, bold: true, color: '#ffd27a' });
      for (let j = 0; j < 5; j++) ui.rect(280 + j * 12, y0 + 5, 9, 8, j < n ? '#ffd23f' : '#3a322c', '#000');
      if (n < 5) {
        ui.para('Tiếp: ' + B.nodes[n], 246, y0 + 24, 166, { size: 6.5, color: '#d9cdb8' });
        if (ui.btn(416, y0 + 8, 42, 24, 'Học', { size: 9, disabled: pts <= 0 })) { hs.sk[b]++; G.persist(); G.sfx('evolve'); }
      } else ui.text('Đã học hết nhánh này.', 246, y0 + 28, { size: 7, color: '#9be07a' });
    });
    if (spent > 0 && ui.btn(240, 241, 150, 22, 'Đặt lại điểm (100 vàng)', { size: 7.5, disabled: sv.gold < 100 })) {
      sv.gold -= 100; hs.sk = { atk: 0, def: 0, elem: 0 }; G.persist();
    }
  }

  function help() {
    frame('Hướng dẫn');
    let y = 62;
    const pages = [[
      ['Di chuyển và đánh', 'Cảm ứng: đặt ngón ở nửa trái màn hình rồi kéo để đi. Bên phải có các nút tròn: giữ Đánh để ra đòn liên tục, Né để lăn tránh, Đặc biệt để tung đòn mạnh (tốn mana), nút còn lại là kỹ năng riêng của hero.'],
      ['Các ô ở mép trên', 'Chạm ô vũ khí ở góc trên bên phải để đổi giữa hai vũ khí. Chạm ô Bình máu để hồi máu. Chạm Dừng để tạm nghỉ.'],
      ['Mở rương, qua cửa', 'Lại gần rương, suối hay thương nhân rồi bấm Đánh. Hết quái thì cửa mở: đi vào cửa có mũi tên để sang phòng kề. Chạm bản đồ nhỏ để xem cả ải.'],
      ['Bàn phím', 'Mũi tên hoặc WASD để đi, J đánh, K né, L đặc biệt, I kỹ năng, Q đổi vũ khí, E uống bình máu, M xem bản đồ, Esc tạm dừng hoặc đóng bảng.'],
      ['Ba sao', 'Sao 1: qua ải. Sao 2: không dùng bình máu. Sao 3: ra đòn kết liễu trùm bằng hệ khắc chế nó.'],
    ], [
      ['Dấu ấn', G.HINTS[0] + ' ' + G.HINTS[1]],
      ['Ba hệ', G.HINTS[4] + ' ' + G.HINTS[5]],
      ['Trùm học theo bạn', G.HINTS[2] + ' ' + G.HINTS[3]],
      ['Vật trong phòng', 'Chậu than, nấm độc và tinh thể băng phát nổ khi bị đánh, gây hiệu ứng lên quái đứng gần. Đây là cách gây hệ khi vũ khí còn trắng.'],
    ]];
    V.page = G.clamp(V.page, 0, pages.length - 1);
    for (const l of pages[V.page]) {
      ui.text(l[0], 18, y, { size: 8.5, bold: true, color: '#ffd27a' });
      y = ui.para(l[1], 18, y + 11, 440, { size: 7.5, color: '#e8dfcc' }) + 7;
    }
    if (ui.btn(18, 238, 150, 22, V.page === 0 ? 'Xem tiếp: dấu ấn và hệ →' : '← Xem lại: cách điều khiển', { size: 8 })) V.page = 1 - V.page;
    ui.text('Trang ' + (V.page + 1) + '/2', 178, 252, { size: 7.5, color: '#d9cdb8' });
  }
  function settings() {
    const sv = G.save;
    frame('Cài đặt');
    if (ui.btn(24, 60, 180, 28, 'Âm thanh: ' + (sv.sound ? 'bật' : 'tắt'))) { sv.sound = !sv.sound; G.persist(); G.audioStart(); }
    if (ui.btn(24, 96, 180, 28, 'Toàn màn hình')) {
      try { const el = document.documentElement; if (document.fullscreenElement) document.exitFullscreen(); else el.requestFullscreen().catch(() => say('Thiết bị này không cho bật toàn màn hình.')); } catch (e) { say('Thiết bị này không cho bật toàn màn hình.'); }
    }
    ui.para('Tiến trình được lưu trong trình duyệt này. Đổi máy hoặc xoá dữ liệu trình duyệt sẽ mất tiến trình.', 24, 146, 430, { size: 8, color: '#d9cdb8' });
    if (!V.confirm) {
      if (ui.btn(24, 180, 180, 28, 'Xoá tiến trình, chơi lại từ đầu', { size: 8, color: '#6a2a22' })) V.confirm = true;
    } else {
      ui.text('Chắc chắn xoá hết? Không khôi phục được.', 24, 176, { size: 8.5, color: '#ff9a5a', bold: true });
      if (ui.btn(24, 184, 110, 28, 'Xoá hết', { color: '#8a1f1a' })) { G.resetSave(); V.confirm = false; V.tab = 'hub'; say('Đã xoá tiến trình.'); }
      if (ui.btn(142, 184, 110, 28, 'Thôi')) V.confirm = false;
    }
  }

  G.Village = {
    enter() { goHub(); G.persist(); },
    update(dt) {
      if (V.msgT > 0) V.msgT -= dt;
      // Esc: huỷ câu hỏi xoá, hoặc quay về màn hình làng
      if (G.keyP.Escape) { if (V.confirm) V.confirm = false; else if (V.tab !== 'hub') goHub(); }
    },
    draw() {
      drawScene();
      topBar();
      if (V.tab === 'hub') hub();
      else if (V.tab === 'map') mapScreen();
      else if (V.tab === 'forge') forge();
      else if (V.tab === 'gear') gear();
      else if (V.tab === 'hero') hero();
      else if (V.tab === 'help') help();
      else settings();
      if (V.msgT > 0) { ui.rect(120, 246, 240, 18, 'rgba(10,8,6,0.9)', '#ffd27a'); ui.text(V.msg, 240, 258, { size: 8, align: 'center' }); }
    },
  };

  G.Title = {
    update() {
      if (G.downs.length || G.keyP.Enter || G.keyP.Space || G.keyP.KeyJ) G.setScene(G.Village);
    },
    draw() {
      const c = G.wx, A = G.art;
      V.tab = 'title';
      drawScene();
      c.save(); c.translate(240, 236); c.scale(3, 3);
      A.hero(c, { x: 0, y: 0, face: 1, key: 'smith', move: false, t: G.time, atk: (G.time % 1.6) < 0.4 ? (G.time % 1.6) / 0.4 : -1, dodge: -1, weapon: { type: 'sword', tier: 0, marks: { fire: 300, poison: 0, ice: 0 }, branch: 'fire', sharpen: 0 } });
      c.restore();
      ui.rect(0, 0, 480, 270, 'rgba(10,6,8,0.35)');
      ui.text('LINH KHÍ', 240, 78, { size: 40, bold: true, align: 'center', color: '#ffd27a' });
      ui.text('Vũ khí lớn lên theo bạn. Yêu tinh học theo bạn.', 240, 100, { size: 10, align: 'center', color: '#f1ead9' });
      if (Math.floor(G.time * 2) % 2) ui.text('Chạm để bắt đầu', 240, 128, { size: 11, align: 'center', bold: true });
      ui.text('Bản thử · hình vẽ tạm', 240, 262, { size: 7, align: 'center', color: '#b8b0a0' });
    },
  };
})();
