// Dựng các tờ phác thảo quái và trùm. Mở to.html?to=<tên tờ>. Hình lấy thẳng từ game/js/monster_art.js nên tờ duyệt và game là một.
(async function () {
  const M = G.monsterArt, qs = new URLSearchParams(location.search), TO = qs.get('to') || 'vung-bien';
  const root = document.getElementById('to');
  const ELC = { fire: '#ff9a52', poison: '#9be070', ice: '#8fdcff' }, ELN = { fire: 'Lửa', poison: 'Độc', ice: 'Băng' };
  const ROLE = { rusher: 'Lính xông', swarm: 'Bầy nhỏ', shield: 'Khiên', archer: 'Xạ thủ', nimble: 'Nhanh nhẹn', elite: 'Tinh anh' };
  const el = (tag, cls, html, parent) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; (parent || root).appendChild(e); return e; };
  const loadImg = (src) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });
  const HERO = await loadImg('be-smith.png'); // khung 120x120, chân bé ở (50,100)
  await document.fonts.ready;

  // ---------- dữ liệu ba vùng ----------
  const R = [
    {
      key: 'rung', reg: 0, name: 'Rừng già', el: 'poison', boss: 'moc', bossName: 'Mộc Tinh', miniName: 'Nấm Chúa',
      sub: 'Bảng màu lục và tím độc. Quái là cây cỏ, nấm và thú rừng. Trùm vùng là cây cổ thụ thành tinh.',
      floor: ['#55602f', '#4b562a', '#606c36'], wall: ['#26331f', '#1c2717'],
      mon: {
        rusher: 'Gốc cây con biết đi. Giơ chùy gỗ lên cao rồi nện xuống.',
        swarm: 'Đi theo bầy. Ngồi thụp xuống rồi húc đầu, tung bào tử.',
        shield: 'Mai cứng đầy gai, khó đánh vỡ. Hạ sừng rồi húc thẳng.',
        archer: 'Đứng xa. Ngửa đầu, phồng bầu rồi nhổ hạt độc.',
        nimble: 'Chạy vòng ra sau lưng. Chổng đuôi lá rồi phóng tới.',
        elite: 'Cậu ông trời. Phồng bọng họng, đứng dậy rồi nện bụng xuống đất. Nấm trên lưng đổi màu theo hệ nó mang.',
      },
      mini: 'Vua nấm đội vương miện. Nhảy lên nện xuống, cúi mũ lao húc, bắn bọc độc từ đỉnh mũ, gầm gọi nấm con.',
      miniPoses: [[{}, 'đứng'], [{ kd: 'slam', an: 3 }, 'sắp nện'], [{ kd: 'charge', sk: 1 }, 'lao húc'], [{ kd: 'summon', an: 3, roar: 1 }, 'gầm gọi bầy']],
      bossNote: ['Cây cổ thụ thành tinh trong truyện Lạc Long Quân, mặt hiện trên thân cây.', 'Hai tay cành: tay trái vươn thành roi dây quất nửa sân.', 'Lõi nhựa trong miệng: lúc mệt thì lộ ra, đánh vào đau nhất.', 'Mất máu thì rụng hết lá; sắp hết máu thì nhổ rễ bước tới.'],
      bossPoses: [['phase1', 'nổi giận'], ['sweepOut', 'quất roi'], ['exposed', 'mệt, lộ lõi']],
    },
    {
      key: 'bien', reg: 1, name: 'Hang biển', el: 'ice', boss: 'ngu', bossName: 'Ngư Tinh', miniName: 'Cua Đá',
      sub: 'Bảng màu lam và trắng băng. Quái là cá, cua, ốc, sứa. Trùm vùng là thủy quái Ngư Tinh nằm trong vũng nước cuối hang.',
      floor: ['#3d4a5e', '#354256', '#475468'], wall: ['#1f2a3c', '#172030'],
      mon: {
        rusher: 'Phồng người, dựng gai rồi húc. Càng phồng to là càng sắp đánh.',
        swarm: 'Chạy ngang theo bầy. Giơ càng lên doạ rồi kẹp.',
        shield: 'Vỏ ốc là khiên. Rụt vào vỏ rồi thò càng ra đấm.',
        archer: 'Đứng xa. Phồng má rồi nhổ ngọc băng.',
        nimble: 'Lượn ra sau lưng. Cuộn mình ngóc đầu rồi phóng thẳng như mũi tên.',
        elite: 'Sứa lớn đội vương miện tinh thể. Giơ hai xúc tu to lên rồi quật xuống. Vương miện đổi màu theo hệ nó mang.',
      },
      mini: 'Mai là tảng đá mọc tinh thể băng, một càng khổng lồ. Giơ càng nện xuống, co mình lao húc, bắn tinh thể, gầm gọi cua con.',
      miniPoses: [[{}, 'đứng'], [{ kd: 'slam', an: 3 }, 'sắp nện'], [{ kd: 'swipe', sk: 1 }, 'quét càng'], [{ kd: 'summon', an: 3, roar: 1 }, 'gầm gọi bầy']],
      bossNote: ['Thủy quái trong truyện Lạc Long Quân diệt Ngư Tinh: con cá khổng lồ dài bằng sáu em bé.', 'Đầu mọc gai, cái sừng to phía trước.', 'Miệng rộng đầy răng nhọn, hàm dưới trề ra.', 'Hai sợi râu dài uốn như râu rồng, vây lưng như cánh buồm.', 'Sóng và bọt nước quanh thân; nửa mình chìm dưới nước.'],
      bossPoses: [['roar', 'gầm: nước dâng'], ['spikes', 'dựng gai'], ['exposed', 'mệt, lộ mang']],
    },
    {
      key: 'lau-dai', reg: 2, name: 'Lâu đài cổ', el: 'fire', boss: 'ho', bossName: 'Hồ Tinh', miniName: 'Hổ Lửa',
      sub: 'Bảng màu đỏ cam và vàng lửa trên nền đá sắt tối. Quái là hồn ma, tượng đá, đèn lồng và thú lửa. Trùm vùng là cáo chín đuôi.',
      floor: ['#6b625c', '#5d5550', '#776d66'], wall: ['#3a3236', '#2c2629'],
      mon: {
        rusher: 'Hồn lính đội nón, khói đen làm thân. Kéo giáo ra sau rồi đâm thẳng.',
        swarm: 'Bay theo bầy, cánh rực lửa. Giương cánh rồi bổ nhào cắn.',
        shield: 'Tượng nghê canh cổng sống dậy, thân đá khó vỡ. Cào chân rồi húc.',
        archer: 'Lơ lửng ở xa. Lửa trên đầu bùng to rồi phun cầu lửa.',
        nimble: 'Họ hàng nhỏ của Hồ Tinh. Chổng đuôi lửa rồi phóng tới.',
        elite: 'Bộ giáp tướng không người mặc, lửa cháy bên trong. Giơ đại đao rồi bổ xuống. Lửa đổi màu theo hệ nó mang.',
      },
      mini: 'Hổ vằn than hồng, bờm và đuôi bốc lửa. Chồm lên vồ, hạ mình lao húc, phun lửa từ lưng, gầm gọi dơi lửa.',
      miniPoses: [[{}, 'đứng'], [{ kd: 'slam', an: 3 }, 'chồm lên'], [{ kd: 'charge', sk: 1 }, 'lao húc'], [{ kd: 'summon', an: 3, roar: 1 }, 'gầm gọi bầy']],
      bossNote: ['Cáo chín đuôi Hồ Tây trong truyện Lạc Long Quân, lông trắng vằn đỏ.', 'Chín đuôi đầu ngọn lửa: mất máu thì mất dần từng đuôi.', 'Vồ, bắn hồ hỏa, xoay đuôi thành vòng rồi nổ, phân thân thành ảo ảnh.', 'Sắp hết máu thì hóa cuồng, to gấp rưỡi.'],
      bossPoses: [['pounceLeap', 'vồ'], ['foxFire', 'hồ hỏa'], ['novaRing', 'đuôi xoay vòng']],
    },
  ];
  const byKey = (k) => R.find((r) => r.key === k);

  // ---------- đồ nghề ----------
  const mon = (reg, role, P, elx) => M.buildMon(reg, role, P || {}, role === 'elite' ? elx || R[reg].el : null);
  const mini = (reg, P) => M.build(M.MINI[reg], Object.assign({ w: -1, br: 0, bl: 0, tl: 0, an: 0, sk: 0, kd: '', roar: 0, f3: 0, dead: 0 }, P || {}), { el: R[reg].el, E: M.ELP[R[reg].el] });
  function boss(kind, id, Q2, X2) {
    const B = M.BOSS[kind], d = id ? B.demos.find((v) => v.id === id) : null;
    return M.build(B, Object.assign({}, B.pose(), d ? d.Q : {}, Q2 || {}), Object.assign({}, d ? d.X : {}, X2 || {}));
  }
  function canvas(w, h, Z, fn, parent) {
    const c = document.createElement('canvas'); c.width = Math.round(w * Z); c.height = Math.round(h * Z);
    const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.scale(Z, Z); fn(x, Z);
    if (parent) parent.appendChild(c);
    return c;
  }
  function put(x, s, px, py, flip) { x.save(); x.translate(Math.round(px), Math.round(py)); if (flip) x.scale(-1, 1); x.drawImage(s.cv, -s.ox, -s.oy); x.restore(); }
  function shadow(x, px, py, r) { x.fillStyle = 'rgba(0,0,0,0.28)'; x.fillRect(px - r + 2, py - 1, 2 * r - 4, 1); x.fillRect(px - r, py, 2 * r, 1); x.fillRect(px - r + 2, py + 1, 2 * r - 4, 1); }
  function hero(x, px, py, flip) { if (!HERO) return; shadow(x, px, py, 7); x.save(); x.translate(px, py); if (flip) x.scale(-1, 1); x.drawImage(HERO, -50, -100); x.restore(); }
  function text(x, Z, s, px, py, o) {
    o = o || {};
    x.save(); x.setTransform(1, 0, 0, 1, 0, 0);
    x.font = (o.bold ? '700 ' : '500 ') + (o.size || 15) + 'px Inter'; x.textAlign = o.align || 'center'; x.textBaseline = 'middle';
    const w = x.measureText(s).width, X = px * Z, Y = py * Z;
    if (o.bg !== false) { x.fillStyle = 'rgba(22,18,28,0.82)'; const bx = o.align === 'left' ? X - 6 : X - w / 2 - 6; x.beginPath(); x.roundRect(bx, Y - (o.size || 15) * 0.75, w + 12, (o.size || 15) * 1.5, 6); x.fill(); }
    x.fillStyle = o.col || '#f1ead9'; x.fillText(s, X, Y + 1);
    x.restore();
  }
  const hsh = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  // Sàn phòng nhìn từ trên: tường phía trên cao 26, sàn w x h.
  function room(x, rg, ox, oy, w, h, water) {
    const F = rg.floor, Wc = rg.wall;
    x.fillStyle = Wc[1]; x.fillRect(ox - 6, oy - 30, w + 12, h + 38);
    x.fillStyle = Wc[0]; x.fillRect(ox, oy - 26, w, 26);
    x.fillStyle = Wc[1]; for (let i = 0; i < w; i += 22) x.fillRect(ox + i, oy - 26, 1, 26);
    x.fillStyle = 'rgba(255,255,255,0.06)'; x.fillRect(ox, oy - 26, w, 2);
    x.fillStyle = F[0]; x.fillRect(ox, oy, w, h);
    x.save(); x.beginPath(); x.rect(ox, oy, w, h); x.clip();
    for (let i = 0; i < (w * h) / 90; i++) {
      const px = ox + Math.floor(hsh(i + rg.reg * 31) * (w - 8)), py = oy + Math.floor(hsh(i * 3 + 7) * (h - 4));
      x.fillStyle = i % 3 ? F[1] : F[2];
      if (rg.reg === 2) x.fillRect(ox + Math.floor((px - ox) / 26) * 26, oy + Math.floor((py - oy) / 20) * 20, i % 2 ? 26 : 1, i % 2 ? 1 : 20);
      else x.fillRect(px, py, 3 + Math.floor(hsh(i) * 6), 1 + (i % 2));
    }
    x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(ox, oy, w, 3);
    x.restore();
    if (water) {
      const wx = ox + w - water;
      x.fillStyle = '#1f456e'; x.fillRect(wx, oy, water, h);
      x.fillStyle = '#2b5d8c'; for (let i = 0; i < 26; i++) x.fillRect(wx + 4 + Math.floor(hsh(i + 50) * (water - 20)), oy + 6 + Math.floor(hsh(i + 90) * (h - 12)), 8 + (i % 3) * 3, 1);
      x.fillStyle = '#bfe4f7'; for (let y = 0; y < h; y += 5) x.fillRect(wx - 1 + Math.round(Math.sin(y * 0.5) * 1.5), oy + y, 2, 3);
    }
  }
  // Ngư Tinh nằm trong nước: cắt phần chìm, thêm bọt và sóng quanh thân. (x, y) là mặt nước dưới bụng.
  function ngu(x, s, px, py, flip, o) {
    o = o || {};
    x.fillStyle = 'rgba(8,18,34,0.45)'; x.beginPath(); x.ellipse(px, py + 2, 78, 7, 0, 0, 7); x.fill();
    x.save(); x.beginPath(); x.rect(px - 200, py - 300, 400, 300 + 5); x.clip();
    x.translate(px, py); if (flip) x.scale(-1, 1); if (o.rot) { x.translate(0, -24); x.rotate(o.rot); x.translate(0, 24); } x.translate(0, o.dy || 0);
    x.drawImage(s.cv, -s.ox, -s.oy); x.restore();
    const f = flip ? -1 : 1;
    x.fillStyle = '#eaf8ff';
    for (const q of [[-70, 3, 16], [-44, 5, 22], [-12, 4, 18], [18, 6, 24], [48, 4, 16], [68, 2, 10], [-84, 1, 8]]) x.fillRect(px + f * q[0] - q[2] / 2, py + q[1], q[2], 2);
    x.fillStyle = '#9fd4f0';
    for (const q of [[-58, 8, 20], [-20, 9, 26], [30, 10, 22], [62, 7, 12], [-90, 5, 10], [86, 5, 10]]) x.fillRect(px + f * q[0] - q[2] / 2, py + q[1], q[2], 1);
    x.fillStyle = '#ffffff';
    for (const q of [[-78, -2], [-64, -5], [74, -3], [80, -7], [-30, 1], [40, 0]]) x.fillRect(px + f * q[0], py + q[1], 2, 2);
  }
  // Dải nhiều tư thế đứng chung một hàng: items = [[hình, chú thích], ...].
  function strip(items, Z, o) {
    o = o || {};
    const gap = o.gap == null ? 8 : o.gap, pad = 4;
    let up = 0, down = 0, w = pad;
    for (const it of items) { const s = it[0]; up = Math.max(up, s.oy); down = Math.max(down, s.cv.height - s.oy); w += Math.max(s.cv.width, o.minW || 0) + gap; }
    w += pad - gap;
    const base = up + 3, h = base + Math.max(down, 3) + (o.cap === false ? 3 : 3 + 20 / Z);
    return canvas(Math.max(w, o.w || 0), h, Z, (x) => {
      let cx = pad + (Math.max(w, o.w || 0) - w) / 2;
      for (const it of items) {
        const s = it[0], cw = Math.max(s.cv.width, o.minW || 0), px = Math.round(cx + (cw - s.cv.width) / 2 + s.ox);
        if (o.shadow !== false) shadow(x, Math.round(cx + cw / 2), base, Math.min(30, Math.max(5, Math.round(s.cv.width * 0.3))));
        if (it[2] === 'ngu') ngu(x, s, px, base - 4, false); else put(x, s, px, base, o.flip);
        if (it[1]) text(x, Z, it[1], cx + cw / 2, h - 10 / Z, { size: o.capSize || 14, col: '#b8b0c8', bg: false });
        cx += cw + gap;
      }
    });
  }
  const card = (parent, w) => { const c = el('div', 'card', null, parent); if (w) c.style.width = w + 'px'; return c; };
  const chip = (e) => '<span class="chip" style="background:' + ELC[e] + '">hệ ' + ELN[e] + '</span>';

  // ====================================================================
  // TỜ MỘT VÙNG
  // ====================================================================
  function toVung(rg) {
    el('h1', null, rg.name + chip(rg.el));
    el('div', 'sub', rg.sub + ' Mọi con đều vẽ lại theo nét của em bé tinh linh: viền tối, mắt to tròn, đầu to thân tròn.');
    el('h2', null, 'Quái thường và tinh anh: mỗi loại một kiểu đánh riêng, nhìn dáng là biết sắp ra đòn');
    let row = el('div', 'row'), c;
    for (const role of ['rusher', 'swarm', 'shield', 'archer', 'nimble', 'elite']) {
      const D = M.MON[rg.reg][role], big = role === 'elite';
      c = card(row, 556);
      const hit = role === 'nimble' ? { lg: 1 } : { sk: 1 };
      const st = el('div', null, null, c); st.style.minHeight = '176px'; st.style.display = 'flex'; st.style.alignItems = 'flex-end'; st.style.justifyContent = 'center';
      st.appendChild(strip([[mon(rg.reg, role, {}), 'đứng'], [mon(rg.reg, role, { an: 3 }), 'sắp đánh'], [mon(rg.reg, role, hit), 'ra đòn']], big ? 3 : 4, { minW: 26, gap: big ? 10 : 8 }));
      el('div', 'ten', D.name, c);
      el('div', 'vai', ROLE[role] + (big ? ' · to gần gấp đôi quái thường' : ''), c).style.color = ELC[rg.el];
      el('div', 'ghi', rg.mon[role], c);
      if (big) {
        const ec = el('div', 'nho', null, c); ec.style.justifyContent = 'flex-start'; ec.style.alignItems = 'center'; ec.style.gap = '10px'; ec.style.marginTop = '6px';
        el('span', null, 'Cùng một con, mang ba hệ:', ec).style.fontSize = '16px';
        ec.appendChild(strip(['fire', 'poison', 'ice'].map((e) => [mon(rg.reg, 'elite', {}, e), ELN[e]]), 2, { minW: 44, gap: 6, shadow: false, capSize: 13 }));
      }
    }
    el('h2', null, 'Trùm nhỏ: ' + rg.miniName);
    row = el('div', 'row');
    c = card(row, 1700);
    c.appendChild(strip(rg.miniPoses.map((p) => [mini(rg.reg, p[0]), p[1]]), 3, { gap: 16 }));
    el('div', 'ten', rg.miniName, c);
    el('div', 'vai', 'Trùm nhỏ · gặp ở cuối bốn ải đầu của vùng', c).style.color = ELC[rg.el];
    el('div', 'ghi', rg.mini, c);

    el('h2', null, 'Trùm vùng: ' + rg.bossName);
    row = el('div', 'row'); row.style.flexWrap = 'nowrap';
    c = card(row, 1000);
    const B = M.BOSS[rg.boss];
    if (rg.boss === 'ngu') {
      c.appendChild(canvas(240, 150, 4, (x) => {
        x.fillStyle = '#1f456e'; x.fillRect(0, 122, 240, 28); x.fillStyle = '#2b5d8c'; for (let i = 0; i < 18; i++) x.fillRect(Math.floor(hsh(i) * 220), 128 + Math.floor(hsh(i + 9) * 18), 12, 1);
        ngu(x, boss('ngu', 'idle', { wh: 0.2 }), 116, 122, false);
      }));
    } else c.appendChild(strip([[boss(rg.boss, 'idle'), null]], 4, { cap: false, w: 240 }));
    const side = el('div', 'cot', null, row); side.style.width = '684px';
    c = card(side); c.style.flex = '1';
    el('div', 'ten', rg.bossName, c);
    el('div', 'vai', 'Trùm vùng ' + rg.name + ' · gặp ở ải thứ năm', c).style.color = ELC[rg.el];
    el('ul', null, rg.bossNote.map((s) => '<li>' + s + '</li>').join(''), c);
    c = card(el('div', 'row'), 1700); c.style.marginTop = '16px';
    el('div', 'vai', 'Vài tư thế trong trận', c);
    c.appendChild(strip(rg.bossPoses.map((p) => [boss(rg.boss, p[0]), p[1], rg.boss === 'ngu' ? 'ngu' : null]), 2, { gap: 14, shadow: rg.boss !== 'ngu', capSize: 15 }));

    el('h2', null, 'Cỡ thật: em bé hero đứng cạnh từng con trong phòng (một điểm ảnh của game phóng 3 lần)');
    row = el('div', 'row');
    c = card(row, 690);
    c.appendChild(canvas(220, 232, 3, (x, Z) => {
      room(x, rg, 6, 30, 208, 196);
      hero(x, 26, 122, false);
      const P = [['rusher', 70, 70], ['swarm', 126, 62], ['swarm', 142, 72], ['shield', 180, 76], ['archer', 70, 140], ['nimble', 126, 136], ['elite', 176, 150]];
      for (const p of P) { const s = mon(rg.reg, p[0], {}); shadow(x, p[1], p[2], M.MON[rg.reg][p[0]].sh); put(x, s, p[1], p[2], true); }
      for (const p of P) if (!(p[0] === 'swarm' && p[1] === 142)) text(x, Z, M.MON[rg.reg][p[0]].name, p[1] + (p[0] === 'swarm' ? 8 : 0), p[2] + 9, { size: 14 });
      text(x, Z, 'Em bé hero', 26, 131, { size: 14, col: '#ffd27a' });
      text(x, Z, 'Phòng thường: sàn 208 x 196', 110, 216, { size: 14, col: '#b8b0c8' });
    }));
    c = card(row, 964);
    c.appendChild(canvas(312, 232, 3, (x, Z) => {
      room(x, rg, 6, 30, 300, 196, rg.boss === 'ngu' ? 176 : 0);
      hero(x, 30, 130, false);
      const ms = mini(rg.reg, {});
      shadow(x, 92, 96, M.MINI[rg.reg].sh); put(x, ms, 92, 96, true);
      text(x, Z, rg.miniName, 92, 105, { size: 15 });
      if (rg.boss === 'ngu') ngu(x, boss('ngu', 'idle'), 208, 150, true);
      else { const bs = boss(rg.boss, 'idle', rg.boss === 'moc' ? { lookX: -1 } : {}); shadow(x, 228, 172, B.sh); put(x, bs, 228, 172, rg.boss !== 'moc'); }
      text(x, Z, rg.bossName, rg.boss === 'ngu' ? 208 : 228, rg.boss === 'ngu' ? 168 : 182, { size: 15 });
      text(x, Z, 'Em bé hero', 30, 139, { size: 14, col: '#ffd27a' });
      text(x, Z, 'Phòng trùm: sàn 300 x 200. Trùm nhỏ và trùm vùng đứng chung để so cỡ.', 156, 218, { size: 14, col: '#b8b0c8' });
    }));
  }

  // ====================================================================
  // NGƯ TINH QUA CÁC PHA VÀ BỐN DẠNG THÍCH NGHI
  // ====================================================================
  function toPha() {
    el('h1', null, 'Ngư Tinh: ba giai đoạn và bốn dạng thích nghi' + chip('ice'));
    el('div', 'sub', 'Trùm vùng Hang biển. Trận đánh có ba giai đoạn, càng về sau nước càng dâng, sân càng hẹp. Trùm còn học theo cách bạn chơi: nhìn hình là biết nó đang kháng gì.');
    el('h2', null, 'Ba giai đoạn của trận: nước dâng dần');
    let row = el('div', 'row');
    const PH = [
      ['Giai đoạn 1 · máu trên 60%', 'Bơi bình thản, mắt vàng. Sân còn rộng.', { }, { }, 0],
      ['Giai đoạn 2 · máu dưới 60%: nổi giận', 'Mắt cam, gai chuyển hồng, mình đầy sẹo. Nước dâng ngập hai mép sân. Phun nhiều cột nước hơn, đập sóng hai lần liền.', { eye: 'angry', jaw: 0.35 }, { phase: 1 }, 1],
      ['Giai đoạn 3 · máu dưới 30%: hóa cuồng', 'Mắt rực đỏ, gai dựng, vết nứt đỏ, thở ra hơi lạnh. Nước ngập thêm cả phía trái. Lao ngang sân ba lần liền.', { eye: 'angry', jaw: 0.7, up: 0.5 }, { phase: 2 }, 2],
    ];
    for (const p of PH) {
      const c = card(row, 556);
      c.appendChild(canvas(264, 196, 2, (x, Z) => {
        x.fillStyle = '#1f456e'; x.fillRect(0, 118, 264, 20);
        ngu(x, boss('ngu', null, p[2], p[3]), 128, 118, false);
        // sơ đồ sân: phần khô và phần ngập
        const ox = 62, oy = 146, w = 140, h = 44;
        x.fillStyle = '#1f456e'; x.fillRect(ox, oy, w, h);
        const y0 = p[4] >= 1 ? 7 : 0, x0 = p[4] >= 2 ? 44 : 0;
        x.fillStyle = '#4a586c'; x.fillRect(ox + x0, oy + y0, w - 34 - x0, h - y0 * 2);
        x.fillStyle = '#bfe4f7'; x.fillRect(ox + w - 34, oy + y0, 1, h - y0 * 2); if (y0) { x.fillRect(ox + x0, oy + y0 - 1, w - 34 - x0, 1); x.fillRect(ox + x0, oy + h - y0, w - 34 - x0, 1); } if (x0) x.fillRect(ox + x0 - 1, oy + y0, 1, h - y0 * 2);
        x.fillStyle = '#3f8fb5'; x.fillRect(ox + w - 28, oy + h / 2 - 6, 22, 12); x.fillStyle = '#eafcff'; x.fillRect(ox + w - 24, oy + h / 2 - 3, 3, 3);
        x.fillStyle = '#d2362e'; x.fillRect(ox + x0 + 14, oy + h / 2 - 3, 5, 6);
        text(x, Z, 'Sơ đồ sân: xám là chỗ đứng được, lam là nước', 132, 194 - 1, { size: 13, col: '#b8b0c8', bg: false });
      }));
      el('div', 'ten', p[0], c).style.fontSize = '22px';
      el('div', 'ghi', p[1], c);
    }
    el('h2', null, 'Các đòn đánh: tư thế báo trước của từng đòn');
    row = el('div', 'row');
    const AT = [
      ['Lao ngang sân', 'Chúi đầu lặn xuống, chỉ còn vây rẽ nước chạy vào đầu hàng, rồi cả thân vọt qua.', { jaw: 0.1, tail: 0.8 }, {}, { rot: 0.5, dy: 26 }],
      ['Phun cột nước', 'Ngửa đầu, phồng má, miệng sáng lên rồi nhổ từng bọc nước rơi xuống chỗ bạn.', { jaw: 0.5, glow: 1, eye: 'angry', puff: 0.6 }, {}, { rot: -0.25 }],
      ['Đập sóng', 'Vểnh đuôi lên thật cao rồi đập xuống, sóng tràn qua sân, phải chui qua khe hở.', { tail: 1, eye: 'angry' }, {}, { rot: 0.08 }],
      ['Dựng gai', 'Gai lưng và gai đầu dựng lên đỏ rực rồi bung ra quanh thân. Chỉ dùng khi bạn hay áp sát.', { up: 1, red: 1, eye: 'angry', jaw: 0.5 }, { aM: 1 }, {}],
      ['Gầm lúc đổi giai đoạn', 'Há miệng hết cỡ, râu phất ngược, sóng gầm toả ra. Nước dâng ngay sau đó.', { jaw: 1, eye: 'angry', up: 0.6, wh: -0.7 }, { phase: 1 }, { rot: -0.15 }],
      ['Mệt, lộ mang', 'Sau cú lao, nó nổi lên thở dốc, mang đỏ hồng lộ ra. Đây là lúc đánh đau nhất.', { jaw: 0.6, eye: 'dazed', gill: 2 }, {}, { dy: 3 }],
    ];
    for (const a of AT) {
      const c = card(row, 556);
      c.appendChild(canvas(264, 142, 2, (x) => { x.fillStyle = '#1f456e'; x.fillRect(0, 118, 264, 24); ngu(x, boss('ngu', null, a[2], a[3]), 128, 118, false, a[4]); }));
      el('div', 'ten', a[0], c).style.fontSize = '22px';
      el('div', 'ghi', a[1], c);
    }
    el('h2', null, 'Bốn dạng thích nghi: nhìn là biết trùm đang kháng gì');
    row = el('div', 'row');
    const span = (e, s) => '<span style="color:' + ELC[e] + ';font-weight:700">' + s + '</span>';
    const AD = [
      ['1. Kháng hệ: bạn dùng Lửa quá nhiều', 'Mọc lớp ' + span('fire', 'vảy giáp đỏ rực') + ' dọc lưng và trán: Lửa gần như vô hiệu. Lộ ra ' + span('ice', 'viên ngọc xanh băng') + ' ở sườn: đó là điểm yếu, hãy đánh bằng Băng.', 'elFire'],
      ['Kháng hệ: bạn dùng Độc quá nhiều', 'Mọc ' + span('poison', 'vảy rêu độc sủi bọng') + ': kháng Độc. Viên ngọc ' + span('fire', 'đỏ lửa') + ' ở sườn: yếu với Lửa.', 'elPoison'],
      ['Kháng hệ: bạn dùng Băng quá nhiều', 'Mọc ' + span('ice', 'vảy băng tinh thể') + ': kháng Băng. Viên ngọc ' + span('poison', 'xanh lục') + ' ở sườn: yếu với Độc.', 'elIce'],
      ['2. Chống đánh xa: bạn bắn cung nhiều', 'Ba bong bóng nước xoay quanh đầu che chắn. Nó có thêm đòn lặn rồi trồi lên ngay dưới chân bạn.', 'aR'],
      ['3. Chống áp sát: bạn đánh gần nhiều', 'Mọc hàng gai xương trắng dọc sườn và quanh hàm. Lại gần lâu là nó dựng gai bung ra.', 'aM'],
      ['4. Bắt bài lăn né: bạn lăn né nhiều', 'Mọc cần câu treo con mắt thứ ba luôn nhìn theo bạn. Đòn lao được thêm một lượt đón đầu chỗ bạn lăn tới.', 'aD'],
      ['Khi nhiều dạng bật cùng lúc', 'Trùm vùng có thể mang hai dạng một lúc. Hình vẽ xếp chồng lên nhau, vẫn đọc được từng dấu. Hình này bật cả bốn dạng và giai đoạn hóa cuồng để thử.', 'all'],
    ];
    for (const a of AD) {
      const c = card(row, a[2] === 'all' ? 1128 : 556);
      c.appendChild(canvas(264, 170, 2, (x) => { x.fillStyle = '#1f456e'; x.fillRect(0, 142, 264, 28); ngu(x, boss('ngu', a[2]), 118, 142, false); }));
      el('div', 'ten', a[0], c).style.fontSize = '22px';
      el('div', 'ghi', a[1], c);
    }
  }

  // ====================================================================
  // SÁU TRÙM ĐỨNG CẠNH NHAU
  // ====================================================================
  function toTatCa() {
    el('h1', null, 'Sáu trùm của ba vùng');
    el('div', 'sub', 'Cùng một tỉ lệ, em bé hero đứng cạnh để so cỡ (một điểm ảnh của game phóng 3 lần). Mỗi vùng có một trùm nhỏ ở bốn ải đầu và một trùm vùng ở ải thứ năm.');
    el('h2', null, 'Ba trùm vùng');
    let c = card(el('div', 'row'), 1700);
    c.appendChild(canvas(566, 166, 3, (x, Z) => {
      x.fillStyle = '#332d3a'; x.fillRect(0, 140, 566, 26);
      // Mộc Tinh
      hero(x, 20, 146, false); const a = boss('moc', 'idle'); shadow(x, 96, 146, 34); put(x, a, 96, 146, false);
      // Ngư Tinh
      hero(x, 186, 146, false); x.fillStyle = '#1f456e'; x.fillRect(206, 140, 186, 26); ngu(x, boss('ngu', 'idle'), 300, 142, true);
      // Hồ Tinh
      hero(x, 428, 146, false); const h = boss('ho', 'idle'); shadow(x, 500, 146, 24); put(x, h, 500, 146, true);
    }));
    const names = el('div', 'row', null, c); names.style.marginTop = '6px';
    const cap = (w, n, v, e, note) => { const d = el('div', null, null, names); d.style.width = w + 'px'; d.style.textAlign = 'center'; el('div', 'ten', n, d); el('div', 'vai', v + ' · hệ ' + ELN[e], d).style.color = ELC[e]; el('div', 'ghi', note, d); };
    cap(500, 'Mộc Tinh', 'Rừng già', 'poison', 'Cây cổ thụ thành tinh, cao gần bằng năm em bé.');
    cap(640, 'Ngư Tinh', 'Hang biển', 'ice', 'Thủy quái đầu gai, dài bằng sáu em bé, nằm trong nước.');
    cap(500, 'Hồ Tinh', 'Lâu đài cổ', 'fire', 'Cáo chín đuôi. Khi hóa cuồng to gấp rưỡi hình này.');
    el('h2', null, 'Ba trùm nhỏ');
    c = card(el('div', 'row'), 1700);
    c.appendChild(canvas(566, 96, 3, (x) => {
      x.fillStyle = '#332d3a'; x.fillRect(0, 74, 566, 22);
      [[0, 60, 130], [1, 236, 310], [2, 420, 498]].forEach((q) => { hero(x, q[1], 80, false); const s = mini(q[0], {}); shadow(x, q[2], 80, M.MINI[q[0]].sh); put(x, s, q[2], 80, true); });
    }));
    const n2 = el('div', 'row', null, c); n2.style.marginTop = '6px';
    const cap2 = (n, v, e, note) => { const d = el('div', null, null, n2); d.style.width = '546px'; d.style.textAlign = 'center'; el('div', 'ten', n, d); el('div', 'vai', v + ' · hệ ' + ELN[e], d).style.color = ELC[e]; el('div', 'ghi', note, d); };
    cap2('Nấm Chúa', 'Rừng già', 'poison', 'Vua nấm, gọi nấm con ra giúp.');
    cap2('Cua Đá', 'Hang biển', 'ice', 'Mai đá mọc băng, gọi cua con ra giúp.');
    cap2('Hổ Lửa', 'Lâu đài cổ', 'fire', 'Hổ than hồng, gọi dơi lửa ra giúp.');
  }

  // ====================================================================
  // TRƯỚC VÀ SAU
  // ====================================================================
  async function toTruocSau() {
    el('h1', null, 'Trước và sau');
    el('div', 'sub', 'Bên trái mỗi ô là hình đang có trong game (kiểu cũ, lệch tông với em bé hero mới). Bên phải là hình vẽ lại, cùng nét với hero và vũ khí sống. Em bé hero đứng giữa để so.');
    const old = async (k) => { const i = await loadImg('cu/' + k + '.png'); return { cv: i, ox: window.GOC[k][0], oy: window.GOC[k][1] }; };
    for (const rg of R) {
      el('h2', null, rg.name + chip(rg.el));
      const row = el('div', 'row');
      for (const role of ['rusher', 'shield', 'elite']) {
        const c = card(row, 256), o = await old('q' + rg.reg + '-' + role), n = mon(rg.reg, role, {});
        c.appendChild(canvas(76, 84, 3, (x, Z) => { x.fillStyle = '#332d3a'; x.fillRect(0, 70, 76, 14); put(x, o, 17, 73, true); put(x, n, 55, 73, true); text(x, Z, 'cũ', 17, 80, { size: 13, col: '#a9a2b8', bg: false }); text(x, Z, 'mới', 55, 80, { size: 13, col: '#ffd27a', bg: false }); }));
        el('div', 'vai', ROLE[role] + ': ' + M.MON[rg.reg][role].name, c);
      }
      const ob = await old('b-' + rg.boss), om = await old('m' + rg.reg);
      let c = card(row, 628);
      c.appendChild(canvas(200, 84, 3, (x, Z) => {
        x.fillStyle = '#332d3a'; x.fillRect(0, 70, 200, 14);
        put(x, om, 36, 73, true); hero(x, 88, 73, false); put(x, mini(rg.reg, {}), 152, 73, true);
        text(x, Z, "cũ", 36, 80, { size: 13, col: '#a9a2b8', bg: false }); text(x, Z, 'mới', 152, 80, { size: 13, col: '#ffd27a', bg: false });
      }));
      el('div', 'vai', 'Trùm nhỏ: ' + rg.miniName, c);
      c = card(el('div', 'row'), 1696); c.style.marginTop = '16px';
      c.appendChild(canvas(556, 150, 3, (x, Z) => {
        x.fillStyle = '#332d3a'; x.fillRect(0, 132, 556, 18);
        hero(x, 262, 136, false);
        if (rg.boss === 'ngu') { put(x, ob, 150, 136, false); x.fillStyle = '#1f456e'; x.fillRect(300, 132, 256, 18); ngu(x, boss('ngu', 'idle'), 420, 134, true); }
        else if (rg.boss === 'moc') { put(x, ob, 130, 136, false); put(x, boss('moc', 'idle'), 400, 136, false); }
        else { put(x, ob, 150, 136, false); put(x, boss('ho', 'idle'), 400, 136, true); }
        text(x, Z, 'cũ', 140, 144, { size: 14, col: '#a9a2b8', bg: false }); text(x, Z, 'mới', 410, 144, { size: 14, col: '#ffd27a', bg: false });
      }));
      el('div', 'vai', 'Trùm vùng: ' + rg.bossName, c);
    }
  }

  if (TO.startsWith('vung-')) toVung(byKey(TO.slice(5)));
  else if (TO === 'trum-bien-cac-pha') toPha();
  else if (TO === 'tat-ca-trum') toTatCa();
  else if (TO === 'truoc-va-sau') await toTruocSau();
  document.title = 'xong';
})();
