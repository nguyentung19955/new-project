// Bản đồ nhỏ ở góc trên bên phải (dưới hai ô vũ khí) và bản đồ to khi chạm vào.
// Chỉ hiện phòng đã qua (đậm), phòng đang đứng (sáng, viền nổi) và phòng kề mới biết (nhạt). Mọi ô cùng một màu, loại phòng xem ở biểu tượng.
(function () {
  const G = window.G, ui = G.ui;
  const MM = (G.minimap = {});
  // Biểu tượng 7x7 cho từng loại phòng
  const ICON = {
    start: ['.#####.', '#.....#', '#.....#', '#.....#', '#...#.#', '#.....#', '#.....#'],
    fight: ['...#...', '...#...', '...#...', '...#...', '.#####.', '...#...', '...#...'],
    elite: ['#.....#', '##...##', '#######', '#.#.#.#', '#######', '.#.#.#.', '.......'],
    chest: ['.#####.', '#######', '#######', '.......', '#######', '###.###', '#######'],
    fountain: ['...#...', '..###..', '..###..', '.#####.', '.#####.', '.#####.', '..###..'],
    merchant: ['..###..', '...#...', '..###..', '.#####.', '#######', '#######', '.#####.'],
    challenge: ['#######', '.#####.', '..###..', '...#...', '..###..', '.#####.', '#######'],
    curse: ['.......', '..###..', '.#####.', '##.#.##', '.#####.', '..###..', '.......'],
    boss: ['.#####.', '#######', '#.###.#', '#######', '.#####.', '.#.#.#.', '.......'],
    lock: ['..###..', '.#...#.', '.#...#.', '#######', '###.###', '###.###', '#######'],
    key: ['.###...', '#...#..', '#...#..', '.###...', '..#....', '..##...', '..###..'],
    portal: ['..###..', '.#...#.', '#..#..#', '#.#.#.#', '#..#..#', '.#...#.', '..###..'], // cổng dịch chuyển sau khi thắng
  };
  // MỘT MÀU cho mọi ô phòng (yêu cầu của chủ dự án): một màu nền, một màu viền, một màu biểu tượng.
  // Loại phòng chỉ phân biệt bằng biểu tượng. Chỉ còn ba khác biệt:
  //   1. ô đang đứng sáng hơn và có viền nổi;  2. ô đã qua đậm, ô mới biết (chưa vào) nhạt;  3. cửa Trùm còn khóa có ổ khóa.
  const PAL = {
    fill: '#1f5750',      // nền ô đã qua: xanh ngọc đậm của trống đồng
    faint: 'rgba(31,87,80,0.3)', // cùng màu nền, nhạt hơn hẳn: ô mới biết (chưa vào)
    edge: '#a8752f',      // viền ô và lối nối: màu đồng
    icon: '#f6e6b8',      // mọi biểu tượng, kể cả ổ khóa
    cur: '#3f9486',       // ô đang đứng: cùng tông, sáng hơn
    curEdge: '#fff0c4',   // viền nổi của ô đang đứng
  };
  MM.PAL = PAL;
  const NAME = {
    start: 'Bắt đầu', fight: 'Đánh quái', elite: 'Tinh anh', chest: 'Rương báu', fountain: 'Suối hồi',
    merchant: 'Thương nhân', challenge: 'Thử thách', curse: 'Lời nguyền', boss: 'Trùm', portal: 'Cổng dịch chuyển',
  };
  MM.NAME = NAME; MM.ICON = ICON;
  // ẢNH GIAO DIỆN (tools/tach-giao-dien, tệp gd-*.sprite.json trong game/art/custom): có tệp nào thì vẽ ảnh thay phần code đó.
  //   gd-phong-<loại>  12 biểu tượng phòng (start, fight, elite, chest, fountain, merchant, challenge, curse, boss, lock, key, portal)
  //   gd-o-phong       nền một ô phòng        gd-o-phong-cur  ô đang đứng        gd-loi-noi  đoạn nối (vẽ nằm ngang, game tự xoay dọc)
  //   gd-khung-ban-do  khung/nền bản đồ to (cắt 9 mảnh theo "vien")
  // Không có tệp nào thì mọi thứ y hệt cũ.
  function gd(ma) { const s = G.spriteCustom; return s && s.gdSan ? s.gdSan(ma) : null; }
  MM.gd = gd;
  function icon(name, x, y, s, col) {
    const g = gd('gd-phong-' + name);
    if (g) {
      // ảnh nằm gọn trong ô 7x7 (nhân s), giữ đúng tỉ lệ ảnh; cổng dịch chuyển nhấp nháy bằng độ đậm
      const c = G.ux, k = Math.min((7 * s) / g.rong, (7 * s) / g.cao), w = g.rong * k, h = g.cao * k, ga = c.globalAlpha;
      if (col && col !== PAL.icon) c.globalAlpha = ga * 0.65;
      G.spriteCustom.veGd(c, g, x + (7 * s - w) / 2, y + (7 * s - h) / 2, w, h);
      c.globalAlpha = ga;
      return;
    }
    const rows = ICON[name];
    if (!rows) return;
    const c = G.ux;
    c.fillStyle = col;
    for (let j = 0; j < 7; j++) for (let i = 0; i < 7; i++) if (rows[j][i] === '#') c.fillRect(x + i * s, y + j * s, s + 0.05, s + 0.05);
  }
  MM.icon = icon;
  // Trạng thái hiển thị của một phòng: 'cur' đang đứng, 'seen' đã qua, 'known' kề phòng đã qua, null là chưa biết.
  function stateOf(S, id) {
    if (id === S.idx) return 'cur';
    if (S.seen[id]) return 'seen';
    if (S.known[id]) return 'known';
    return null;
  }
  MM.stateOf = stateOf;

  // Vẽ lưới phòng vào ô (x, y, w, h). cw, ch: cỡ ô phòng; gp: khe giữa hai ô; s: cỡ điểm của biểu tượng.
  function grid(S, x, y, w, h, cw, ch, gp, s) {
    const M = G.mapgen, map = S.map;
    const gw = map.w * cw + (map.w - 1) * gp, gh = map.h * ch + (map.h - 1) * gp;
    const x0 = x + (w - gw) / 2, y0 = y + (h - gh) / 2;
    const X = (i) => x0 + i * (cw + gp), Y = (j) => y0 + j * (ch + gp);
    if (s === 'cells') return map.rooms.map((r) => ({ id: r.id, type: r.type, st: stateOf(S, r.id), x: X(r.x), y: Y(r.y), w: cw, h: ch }));
    const open = M.gateOpen(map, S.cleared);
    const lw = Math.max(2, Math.round(s * 1.6));
    const gNoi = gd('gd-loi-noi'), tn = gNoi ? Math.max(lw, (gp * gNoi.cao) / gNoi.rong) : 0; // ảnh lối nối: dài bằng khe, dày theo tỉ lệ ảnh
    // lối nối giữa các phòng đã biết
    for (const r of map.rooms) {
      for (const d of ['right', 'down']) {
        const n = r.doors[d];
        if (n == null) continue;
        const sa = stateOf(S, r.id), sb = stateOf(S, n);
        if (!sa || !sb || (sa === 'known' && sb === 'known')) continue;
        const gate = M.isGate(map, r.id, n) && !open;
        if (gNoi) {
          const c = G.ux;
          if (d === 'right') G.spriteCustom.veGd(c, gNoi, X(r.x) + cw, Y(r.y) + ch / 2 - tn / 2, gp, tn);
          else { c.save(); c.translate(X(r.x) + cw / 2, Y(r.y) + ch + gp / 2); c.rotate(Math.PI / 2); G.spriteCustom.veGd(c, gNoi, -gp / 2, -tn / 2, gp, tn); c.restore(); }
        } else if (d === 'right') ui.rect(X(r.x) + cw, Y(r.y) + ch / 2 - lw / 2, gp, lw, PAL.edge);
        else ui.rect(X(r.x) + cw / 2 - lw / 2, Y(r.y) + ch, lw, gp, PAL.edge);
        if (gate) {
          // cửa Trùm còn khóa: ổ khóa nằm giữa lối vào (cùng màu với mọi biểu tượng)
          const lx = d === 'right' ? X(r.x) + cw + gp / 2 : X(r.x) + cw / 2, ly = d === 'right' ? Y(r.y) + ch / 2 : Y(r.y) + ch + gp / 2;
          const k = G.clamp(gp / 7, 0.7, s); // ổ khóa vừa khe giữa hai ô
          if (!gd('gd-phong-lock')) ui.rect(lx - 3.5 * k - 1, ly - 3.5 * k - 1, 7 * k + 2, 7 * k + 2, '#1a120a');
          icon('lock', lx - 3.5 * k, ly - 3.5 * k, k, PAL.icon);
        }
      }
    }
    for (const r of map.rooms) {
      const st = stateOf(S, r.id);
      if (!st) continue;
      const cx = X(r.x), cy = Y(r.y);
      cell(st, cx, cy, cw, ch);
      // đã thắng: phòng trùm hiện biểu tượng cổng dịch chuyển (nhấp nháy nhẹ cho dễ tìm)
      const ic = S.portal && S.portal.room === r.id ? 'portal' : r.type;
      icon(ic, cx + (cw - 7 * s) / 2, cy + (ch - 7 * s) / 2, s, ic === 'portal' && Math.floor(G.time * 2) % 2 ? '#8ff0d8' : PAL.icon);
    }
  }
  // Một ô phòng theo trạng thái: đang đứng (sáng, viền nổi, nhấp nháy nhẹ), đã qua (đậm), mới biết (nhạt).
  function cell(st, cx, cy, cw, ch) {
    const gO = gd('gd-o-phong'), gC = st === 'cur' ? gd('gd-o-phong-cur') : null;
    if (gC || gO) {
      // ô bằng ảnh: đang đứng nhấp nháy sáng lên, mới biết (chưa vào) vẫn mờ 0,3
      const c = G.ux, ga = c.globalAlpha, V = G.spriteCustom;
      if (st === 'cur') {
        const blink = Math.floor(G.time * 3) % 2;
        V.veGd(c, gC || gO, cx, cy, cw, ch);
        if (blink) { const op = c.globalCompositeOperation; c.globalCompositeOperation = 'lighter'; c.globalAlpha = ga * 0.3; V.veGd(c, gC || gO, cx, cy, cw, ch); c.globalCompositeOperation = op; c.globalAlpha = ga; }
        if (!gC) ui.rect(cx - 1, cy - 1, cw + 2, ch + 2, null, blink ? PAL.curEdge : 'rgba(255,240,196,0.6)'); // chưa có ảnh ô đang đứng: thêm viền nổi
      } else {
        if (st !== 'seen') c.globalAlpha = ga * 0.3;
        V.veGd(c, gO, cx, cy, cw, ch);
        c.globalAlpha = ga;
      }
      return;
    }
    if (st === 'cur') {
      const blink = Math.floor(G.time * 3) % 2;
      ui.rect(cx - 2, cy - 2, cw + 4, ch + 4, blink ? 'rgba(255,246,216,0.55)' : 'rgba(255,246,216,0.3)');
      ui.rect(cx, cy, cw, ch, PAL.cur, PAL.curEdge);
    } else ui.rect(cx, cy, cw, ch, st === 'seen' ? PAL.fill : PAL.faint, PAL.edge);
  }
  MM.cell = cell;

  // Số ghi ở góc bản đồ nhỏ: mảnh chìa (Kiểu C), phòng quái đã dọn (Kiểu B), số phòng đã qua (Kiểu A).
  function gateInfo(S) {
    const M = G.mapgen, map = S.map;
    if (!map.gate) return null;
    return { n: M.gateCount(map, S.cleared), need: map.gate.need, keys: map.gate.rule === 'keys', open: M.gateOpen(map, S.cleared) };
  }
  MM.gateInfo = gateInfo;
  MM.gateText = function (S) {
    const gi = gateInfo(S);
    if (!gi) return 'Suối hồi nằm ngay trước phòng Trùm.';
    if (gi.open) return gi.keys ? 'Đã đủ 3 mảnh chìa: cửa phía trên sảnh đã mở.' : 'Đã dọn đủ 3 phòng quái: cửa Trùm trong phòng Suối hồi đã mở.';
    return gi.keys ? G.t('Mỗi cánh có một phòng quái giữ một mảnh chìa. Đã có {0}/3 mảnh.', gi.n) : G.t('Cửa Trùm nằm trong phòng Suối hồi, mở khi dọn xong 3 phòng quái. Đã dọn {0}/3.', gi.n);
  };

  // Ô bản đồ nhỏ: [x, y, rộng, cao]. Trong phòng trùm (sàn rộng) thì thu lại thành một nút nhỏ.
  MM.rect = function (S) {
    const g = S.W && S.W.geo;
    // Đợt 2: phòng thường sàn rộng (tường phải tới x = 394) thì bản đồ nhỏ thu hẹp lại cho vừa cột phải, không đè sàn.
    if (g && g.rong && !g.big) return [393, 58, 85, 68];
    return g && g.big ? [424, 58, 52, 15] : [374, 58, 102, 68]; // dời xuống nhường chỗ cho ba vạch linh khí dưới ô vũ khí (js/linhkhi.js)
  };
  MM.draw = function (S) {
    const b = MM.rect(S), x = b[0], y = b[1], w = b[2], h = b[3];
    const small = h < 30;
    if (G.theme) G.theme.plate(x, y, w, h); else ui.rect(x, y, w, h, 'rgba(14,10,10,0.88)', '#7a5a3a');
    if (small) { ui.text('Bản đồ', x + w / 2, y + 10.5, { size: 7, bold: true, align: 'center', color: '#f6dc92' }); return; }
    ui.text('Bản đồ', x + 6, y + 10.5, { size: 7, bold: true, color: '#f6dc92' });
    const gi = gateInfo(S);
    if (gi) {
      ui.text(gi.n + '/' + gi.need, x + w - 6, y + 10.5, { size: 7, align: 'right', bold: true, color: PAL.icon });
      icon(gi.keys ? 'key' : 'lock', x + w - 27, y + 4, 1, PAL.icon);
    } else {
      const n = S.map.rooms.filter((r) => S.seen[r.id]).length;
      ui.text(G.t('Phòng {0}/8', n), x + w - 6, y + 10.5, { size: 6.5, align: 'right', color: '#d9cdb8' });
    }
    grid(S, x + 4, y + 14, w - 8, h - 17, 13, 9, 4, 1);
  };

  // Chỗ đặt từng ô phòng trên bản đồ nhỏ (big = false) hoặc bản đồ to (big = true): để bài kiểm tra soi màu.
  MM.cells = function (S, big) {
    if (big) return grid(S, 64, 40, 244, 164, 36, 28, 12, 'cells');
    const b = MM.rect(S);
    return grid(S, b[0] + 4, b[1] + 14, b[2] - 8, b[3] - 17, 13, 9, 4, 'cells');
  };
  // Bản đồ to: hiện khi chạm vào bản đồ nhỏ, trò chơi tạm dừng.
  MM.drawBig = function (S) {
    const reg = G.REGIONS[S.r];
    ui.rect(0, 0, G.W, G.H, 'rgba(0,0,0,0.72)');
    const gK = gd('gd-khung-ban-do');
    if (gK) {
      // khung bằng ảnh: lót nền tối cho cả bảng (phòng khi giữa ảnh để trống), rồi vẽ khung ÔM NGOÀI bảng: viền nằm ở phần lề
      // quanh bảng (lề trên dưới 13, trái phải 48 điểm ảnh) nên không đè lên tên ải, chú giải hay dòng chữ dưới cùng.
      const v = gK.vien || [0, 0, 0, 0], t = Math.min(v[0], 13), r = Math.min(v[1], 48), b = Math.min(v[2], 13), l = Math.min(v[3], 48);
      ui.rect(50, 14, 380, 242, 'rgba(20,16,14,0.94)');
      G.spriteCustom.veGd(G.ux, gK, 50 - l, 14 - t, 380 + l + r, 242 + t + b);
      ui.text(G.t('Bản đồ ải · {0} {1}', reg.name, S.i + 1), 58, 29, { size: 11, bold: true, color: '#ffd27a' });
    } else ui.panel(50, 14, 380, 242, G.t('Bản đồ ải · {0} {1}', reg.name, S.i + 1));
    ui.rect(60, 36, 252, 172, 'rgba(8,16,16,0.6)', '#5a3d1a');
    grid(S, 64, 40, 244, 164, 36, 28, 12, 3);
    // chú giải: chỉ các loại phòng đã biết
    const types = [];
    for (const r of S.map.rooms) if (stateOf(S, r.id) && !types.includes(r.type)) types.push(r.type);
    const order = ['start', 'fight', 'elite', 'chest', 'fountain', 'merchant', 'challenge', 'curse', 'boss'].filter((t) => types.includes(t));
    if (S.portal) { const bi = order.indexOf('boss'); if (bi >= 0 && !S.map.rooms.some((r) => r.type === 'boss' && r.id !== S.portal.room && stateOf(S, r.id))) order.splice(bi, 1); order.push('portal'); }
    ui.text('Chú giải', 322, 45, { size: 8, bold: true, color: '#ffd27a' });
    // mọi loại phòng cùng một màu ô, chỉ khác biểu tượng
    order.forEach((t, k) => {
      const y = 50 + k * 13;
      cell('seen', 322, y, 13, 11);
      icon(t, 325, y + 2, 1, PAL.icon);
      ui.text(NAME[t], 340, y + 8.5, { size: 7.5, color: '#f1ead9' });
    });
    // ba khác biệt còn lại
    let ky = 50 + order.length * 13 + 5;
    ui.rect(322, ky - 3, 98, 1, 'rgba(168,117,47,0.6)');
    const rows = [['cur', 'Bạn đang ở đây'], ['seen', 'Phòng đã qua'], ['known', 'Phòng mới biết']];
    for (const [st, label] of rows) {
      cell(st, 322, ky, 13, 11);
      ui.text(label, 340, ky + 8.5, { size: 7, color: '#f1ead9' });
      ky += st === 'cur' ? 15 : 13;
    }
    {
      if (!gd('gd-phong-lock')) ui.rect(324, ky + 1, 9, 9, '#1a120a');
      icon('lock', 325, ky + 2, 1, PAL.icon);
      ui.text('Cửa Trùm còn khóa', 340, ky + 8.5, { size: 7, color: '#f1ead9' });
    }
    ui.para(MM.gateText(S), 62, 222, 250, { size: 7.5, color: '#ffd9c8' });
    ui.text('Chạm để chơi tiếp', 420, 246, { size: 8, align: 'right', bold: true, color: Math.floor(G.time * 2.5) % 2 ? '#ffd27a' : '#fff3da' });
  };
})();
