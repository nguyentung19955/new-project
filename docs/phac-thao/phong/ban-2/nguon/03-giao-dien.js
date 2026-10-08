// Giao diện giả lập: vẽ theo đúng kiểu giao diện thật của game (thanh máu, ô vũ khí, nút cảm ứng) và thêm bản đồ nhỏ.
(function () {
  const G = window.G, PT = window.PT;
  const rect = (c, x, y, w, h, fill, stroke) => {
    if (fill) { c.fillStyle = fill; c.fillRect(x, y, w, h); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1; c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1); }
  };
  const circle = (c, x, y, r, fill, stroke) => {
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2);
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1; c.stroke(); }
  };
  const bar = (c, x, y, w, h, f, col) => { rect(c, x, y, w, h, 'rgba(0,0,0,0.6)'); rect(c, x, y, Math.max(0, w * Math.min(1, f)), h, col); rect(c, x, y, w, h, null, 'rgba(0,0,0,0.8)'); };
  PT.ui = { rect, circle, bar };

  // Bố cục chuẩn của game hiện tại (Kiểu B, C) và bố cục dồn ra hai lề (Kiểu A)
  PT.LAYOUT = {
    game: {
      hp: [6, 5, 112], pot: [4, 23, 50, 21], pau: [58, 23, 30, 21], weap: [[368, 3, 54, 35], [424, 3, 54, 35]],
      joy: [62, 216, 24], atk: [430, 220, 28], dodge: [380, 246, 18], special: [384, 196, 18], skill: [434, 166, 18],
      map: [392, 42, 86, 78], title: [240, 14],
    },
    le: {
      hp: [5, 5, 95], pot: [5, 23, 54, 20], pau: [62, 23, 38, 20], weap: [[379, 3, 48, 35], [430, 3, 48, 35]],
      joy: [52, 212, 26], atk: [443, 224, 28], dodge: [396, 249, 17], special: [394, 207, 17], skill: [432, 174, 17],
      map: [381, 44, 96, 92], title: null,
    },
  };

  // st: { hp, maxhp, mana, maxmana, potions, weapons, cur, skill, title }
  PT.hud = function (c, L, st, map) {
    const T = (s, x, y, o) => PT.text(c, s, x, y, o);
    bar(c, L.hp[0], L.hp[1], L.hp[2], 8, st.hp / st.maxhp, '#d8453a');
    T(Math.ceil(st.hp) + '/' + st.maxhp, L.hp[0] + L.hp[2] / 2, L.hp[1] + 7, { size: 6.5, align: 'center', bold: true });
    bar(c, L.hp[0], L.hp[1] + 10, L.hp[2], 5, st.mana / st.maxmana, '#3f8be0');
    rect(c, L.pot[0], L.pot[1], L.pot[2], L.pot[3], 'rgba(160,40,30,0.85)', '#e2b36a');
    T('Bình máu ×' + st.potions, L.pot[0] + L.pot[2] / 2, L.pot[1] + L.pot[3] / 2 + 2.6, { size: 7, align: 'center', bold: true, color: '#fff3da' });
    rect(c, L.pau[0], L.pau[1], L.pau[2], L.pau[3], 'rgba(40,36,32,0.8)', '#e2b36a');
    T('Dừng', L.pau[0] + L.pau[2] / 2, L.pau[1] + L.pau[3] / 2 + 2.6, { size: 7, align: 'center', bold: true });
    if (L.title && st.title) T(st.title, L.title[0], L.title[1], { size: 7, align: 'center', color: '#d9cdb8' });
    st.weapons.forEach((w, i) => {
      const b = L.weap[i], x = b[0], on = i === st.cur;
      rect(c, x, b[1], b[2], b[3], on ? 'rgba(90,60,30,0.9)' : 'rgba(30,26,22,0.75)', on ? '#ffd27a' : '#6a5a4a');
      c.save(); c.translate(x + 12, b[1] + 10); G.art.weaponIcon(c, w, 0, 0); c.restore();
      const mi = G.markInfo ? G.markInfo(w) : { frac: 0, col: '#888' };
      T(G.TIERS[w.tier].name + (w.sharpen ? ' +' + w.sharpen : ''), x + b[2] - 3, b[1] + 11, { size: 7, align: 'right', bold: on, color: on ? '#fff3da' : '#b8b0a0' });
      T(G.STAGE_NAMES[G.wStage(w)], x + b[2] / 2, b[1] + 26.5, { size: 6.5, align: 'center', color: w.branch ? G.EL[w.branch].col : '#b8b0a0' });
      bar(c, x + 3, b[1] + 29.5, b[2] - 6, 3, mi.frac, mi.col);
    });
    // cần di chuyển
    circle(c, L.joy[0], L.joy[1], L.joy[2], 'rgba(255,255,255,0.08)', 'rgba(255,255,255,0.35)');
    const jd = st.joy || [0.45, -0.25];
    circle(c, L.joy[0] + jd[0] * L.joy[2], L.joy[1] + jd[1] * L.joy[2], L.joy[2] * 0.44, 'rgba(255,255,255,0.35)');
    const lab = { atk: 'Đánh', dodge: 'Né', special: 'Đặc biệt', skill: st.skill || 'Nung' };
    const colr = { atk: '200,90,40', dodge: '120,120,120', special: '63,139,224', skill: '160,110,220' };
    for (const k of ['atk', 'dodge', 'special', 'skill']) {
      const b = L[k];
      circle(c, b[0], b[1], b[2], 'rgba(' + colr[k] + ',' + (k === 'atk' ? 0.6 : 0.3) + ')', 'rgba(255,255,255,0.55)');
      T(lab[k], b[0], b[1] + 2.5, { size: k === 'atk' ? 9 : 6.5, align: 'center', bold: true, color: '#fff' });
    }
    if (map && L.map) PT.minimap(c, L.map[0], L.map[1], L.map[2], L.map[3], map);
  };

  // Bản đồ nhỏ. m: { rooms: [{ x, y, s: 'cur' | 'seen' | 'near', icon }], links: [[i, j]], label }
  // cur: phòng đang đứng (sáng), seen: phòng đã qua (tô đặc), near: phòng kề bên chưa vào (chỉ có viền). Phòng chưa biết không vẽ.
  PT.minimap = function (c, x, y, w, h, m) {
    rect(c, x, y, w, h, 'rgba(14,11,10,0.78)', '#7a5a3a');
    const head = m.label ? 12 : 0;
    if (m.label) PT.text(c, m.label, x + w / 2, y + 9, { size: 6.5, align: 'center', bold: true, color: '#ffd27a' });
    let x0 = 99, x1 = -99, y0 = 99, y1 = -99;
    for (const r of m.rooms) { x0 = Math.min(x0, r.x); x1 = Math.max(x1, r.x); y0 = Math.min(y0, r.y); y1 = Math.max(y1, r.y); }
    const nx = x1 - x0 + 1, ny = y1 - y0 + 1, gap = m.gap || 5;
    const cw = Math.min(m.cw || 17, Math.floor((w - 10 - (nx - 1) * gap) / nx)), ch = Math.min(m.ch || 13, Math.floor((h - head - 10 - (ny - 1) * gap) / ny));
    const tw = nx * cw + (nx - 1) * gap, th = ny * ch + (ny - 1) * gap;
    const bx = Math.round(x + (w - tw) / 2), by = Math.round(y + head + (h - head - th) / 2);
    const pos = (r) => [bx + (r.x - x0) * (cw + gap), by + (r.y - y0) * (ch + gap)];
    for (const l of m.links) {
      const a = m.rooms[l[0]], b = m.rooms[l[1]], pa = pos(a), pb = pos(b);
      const known = a.s !== 'near' && b.s !== 'near';
      const col = known ? '#b8a88c' : 'rgba(184,168,140,0.5)';
      if (a.y === b.y) rect(c, Math.min(pa[0], pb[0]) + cw, pa[1] + ch / 2 - 1.5, gap, 3, col);
      else rect(c, pa[0] + cw / 2 - 1.5, Math.min(pa[1], pb[1]) + ch, 3, gap, col);
    }
    for (const r of m.rooms) {
      const q = pos(r), X = q[0], Y = q[1];
      if (r.s === 'cur') {
        rect(c, X - 2, Y - 2, cw + 4, ch + 4, 'rgba(255,210,122,0.35)');
        rect(c, X, Y, cw, ch, '#ffd27a', '#fff6d8');
        circle(c, X + cw / 2, Y + ch / 2, 2.6, '#7a2a1e', '#2a0e0a');
      } else if (r.s === 'seen') {
        rect(c, X, Y, cw, ch, '#8a7a62', '#b8a88c');
      } else {
        rect(c, X, Y, cw, ch, 'rgba(0,0,0,0.25)', null);
        c.save(); c.setLineDash([2, 1.5]); c.strokeStyle = 'rgba(214,198,170,0.85)'; c.lineWidth = 1; c.strokeRect(X + 0.5, Y + 0.5, cw - 1, ch - 1); c.restore();
        PT.text(c, '?', X + cw / 2, Y + ch / 2 + 2.6, { size: 7, align: 'center', bold: true, color: 'rgba(214,198,170,0.8)', flat: true });
      }
      if (r.icon === 'start') { c.fillStyle = '#3a3026'; c.beginPath(); c.moveTo(X + cw / 2, Y + 3); c.lineTo(X + cw / 2 + 4, Y + ch - 3); c.lineTo(X + cw / 2 - 4, Y + ch - 3); c.fill(); }
      if (r.icon === 'chest') { rect(c, X + cw / 2 - 3.5, Y + ch / 2 - 2.5, 7, 5, '#e8b83a', '#4a3210'); }
    }
  };
  // Bản đồ mẫu của một ải 8 phòng: đã qua 3, đang đứng 1, thấy lối sang 3 phòng kề, còn 1 phòng chưa biết (ẩn).
  PT.MAP = {
    label: 'Đã qua 4/8 phòng',
    rooms: [
      { x: 0, y: 1, s: 'seen', icon: 'start' }, { x: 1, y: 1, s: 'seen' }, { x: 1, y: 2, s: 'seen', icon: 'chest' },
      { x: 2, y: 1, s: 'cur' }, { x: 2, y: 0, s: 'near' }, { x: 3, y: 1, s: 'near' }, { x: 2, y: 2, s: 'near' },
    ],
    links: [[0, 1], [1, 2], [1, 3], [3, 4], [3, 5], [3, 6]],
  };
  PT.hudState = function () {
    const S = G.getRun(), P = S.P;
    return { hp: P.hp, maxhp: P.maxhp, mana: P.mana, maxmana: P.maxmana, potions: P.potions, weapons: P.weapons, cur: P.cur, skill: G.HEROES[P.key].skill };
  };
})();
