// Bản đồ nhỏ ở góc trên bên phải (dưới hai ô vũ khí) và bản đồ to khi chạm vào.
// Chỉ hiện phòng đã qua (tô đặc), phòng đang đứng (sáng, có viền) và phòng kề đã biết (chỉ viền và biểu tượng).
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
  };
  const COL = {
    start: '#7fc060', fight: '#a09488', elite: '#e8853a', chest: '#e8c040', fountain: '#4a9fe0',
    merchant: '#c8a070', challenge: '#40c0b0', curse: '#a070e0', boss: '#d84a40',
  };
  const NAME = {
    start: 'Bắt đầu', fight: 'Đánh quái', elite: 'Tinh anh', chest: 'Rương báu', fountain: 'Suối hồi',
    merchant: 'Thương nhân', challenge: 'Thử thách', curse: 'Lời nguyền', boss: 'Trùm',
  };
  MM.COL = COL; MM.NAME = NAME; MM.ICON = ICON;
  function icon(name, x, y, s, col) {
    const rows = ICON[name];
    if (!rows) return;
    const c = G.ux;
    c.fillStyle = col;
    for (let j = 0; j < 7; j++) for (let i = 0; i < 7; i++) if (rows[j][i] === '#') c.fillRect(x + i * s, y + j * s, s + 0.05, s + 0.05);
  }
  MM.icon = icon;
  function dark(hex, k) {
    const n = parseInt(hex.slice(1), 16);
    return 'rgb(' + Math.round((n >> 16) * k) + ',' + Math.round(((n >> 8) & 255) * k) + ',' + Math.round((n & 255) * k) + ')';
  }
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
    const open = M.gateOpen(map, S.cleared);
    const lw = Math.max(2, Math.round(s * 1.6));
    // lối nối giữa các phòng đã biết
    for (const r of map.rooms) {
      for (const d of ['right', 'down']) {
        const n = r.doors[d];
        if (n == null) continue;
        const sa = stateOf(S, r.id), sb = stateOf(S, n);
        if (!sa || !sb || (sa === 'known' && sb === 'known')) continue;
        const gate = M.isGate(map, r.id, n) && !open;
        const faint = sa === 'known' || sb === 'known';
        const col = gate ? '#e0443a' : faint ? 'rgba(200,170,120,0.5)' : '#c8a878';
        if (d === 'right') ui.rect(X(r.x) + cw, Y(r.y) + ch / 2 - lw / 2, gp, lw, col);
        else ui.rect(X(r.x) + cw / 2 - lw / 2, Y(r.y) + ch, lw, gp, col);
        if (gate) {
          // ổ khóa đỏ nằm giữa lối vào
          const lx = d === 'right' ? X(r.x) + cw + gp / 2 : X(r.x) + cw / 2, ly = d === 'right' ? Y(r.y) + ch / 2 : Y(r.y) + ch + gp / 2;
          const k = Math.max(0.6, s * 0.75);
          ui.rect(lx - 3.5 * k - 1, ly - 3.5 * k - 1, 7 * k + 2, 7 * k + 2, '#2a0c0a');
          icon('lock', lx - 3.5 * k, ly - 3.5 * k, k, '#ff6a5a');
        }
      }
    }
    for (const r of map.rooms) {
      const st = stateOf(S, r.id);
      if (!st) continue;
      const cx = X(r.x), cy = Y(r.y), col = COL[r.type];
      const ix = cx + (cw - 7 * s) / 2, iy = cy + (ch - 7 * s) / 2;
      if (st === 'cur') {
        const blink = Math.floor(G.time * 3) % 2;
        ui.rect(cx - 2, cy - 2, cw + 4, ch + 4, blink ? 'rgba(255,230,160,0.5)' : 'rgba(255,210,122,0.28)');
        ui.rect(cx, cy, cw, ch, '#ffd27a', '#fff6d8');
        icon(r.type, ix, iy, s, '#4a2408');
      } else if (st === 'seen') {
        ui.rect(cx, cy, cw, ch, dark(col, 0.55), dark(col, 0.95));
        icon(r.type, ix, iy, s, S.cleared[r.id] || !G.mapgen.isFight(r.type) ? '#f4ead0' : '#1a1210');
      } else {
        ui.rect(cx, cy, cw, ch, 'rgba(0,0,0,0.35)', col);
        icon(r.type, ix, iy, s, col);
      }
    }
  }

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
    return gi.keys ? 'Mỗi cánh có một phòng quái giữ một mảnh chìa. Đã có ' + gi.n + '/3 mảnh.' : 'Cửa Trùm nằm trong phòng Suối hồi, mở khi dọn xong 3 phòng quái. Đã dọn ' + gi.n + '/3.';
  };

  // Ô bản đồ nhỏ: [x, y, rộng, cao]. Trong phòng trùm (sàn rộng) thì thu lại thành một nút nhỏ.
  MM.rect = function (S) {
    return S.W && S.W.geo && S.W.geo.big ? [424, 41, 52, 15] : [374, 41, 102, 68];
  };
  MM.draw = function (S) {
    const b = MM.rect(S), x = b[0], y = b[1], w = b[2], h = b[3];
    const small = h < 30;
    ui.rect(x, y, w, h, 'rgba(14,10,10,0.88)', '#7a5a3a');
    if (small) { ui.text('Bản đồ', x + w / 2, y + 10.5, { size: 7, bold: true, align: 'center', color: '#ffd27a' }); return; }
    ui.rect(x + 1.5, y + 1.5, w - 3, h - 3, null, 'rgba(255,220,160,0.12)');
    ui.text('Bản đồ', x + 6, y + 10.5, { size: 7, bold: true, color: '#ffd27a' });
    const gi = gateInfo(S);
    if (gi) {
      const col = gi.open ? '#8fe06a' : gi.keys ? '#ffd27a' : '#ff9a8a';
      ui.text(gi.n + '/' + gi.need, x + w - 6, y + 10.5, { size: 7, align: 'right', bold: true, color: col });
      icon(gi.keys ? 'key' : 'lock', x + w - 27, y + 4, 1, col);
    } else {
      const n = S.map.rooms.filter((r) => S.seen[r.id]).length;
      ui.text('Phòng ' + n + '/8', x + w - 6, y + 10.5, { size: 6.5, align: 'right', color: '#d9cdb8' });
    }
    grid(S, x + 4, y + 14, w - 8, h - 17, 13, 9, 4, 1);
  };

  // Bản đồ to: hiện khi chạm vào bản đồ nhỏ, trò chơi tạm dừng.
  MM.drawBig = function (S) {
    const reg = G.REGIONS[S.r];
    ui.rect(0, 0, G.W, G.H, 'rgba(0,0,0,0.72)');
    ui.panel(50, 14, 380, 242, 'Bản đồ ải · ' + reg.name + ' ' + (S.i + 1));
    ui.rect(60, 36, 252, 172, 'rgba(8,6,6,0.6)', '#4a3a2c');
    grid(S, 64, 40, 244, 164, 36, 28, 12, 3);
    // chú giải: chỉ các loại phòng đã biết
    const types = [];
    for (const r of S.map.rooms) if (stateOf(S, r.id) && !types.includes(r.type)) types.push(r.type);
    const order = ['start', 'fight', 'elite', 'chest', 'fountain', 'merchant', 'challenge', 'curse', 'boss'].filter((t) => types.includes(t));
    ui.text('Chú giải', 322, 46, { size: 8, bold: true, color: '#ffd27a' });
    order.forEach((t, k) => {
      const y = 53 + k * 15;
      ui.rect(322, y, 13, 11, 'rgba(0,0,0,0.35)', COL[t]);
      icon(t, 325, y + 2, 1, COL[t]);
      ui.text(NAME[t], 340, y + 8.5, { size: 7.5, color: '#f1ead9' });
    });
    const ky = 53 + order.length * 15 + 4;
    ui.rect(322, ky, 13, 11, '#ffd27a', '#fff6d8');
    ui.text('Bạn đang ở đây', 340, ky + 8.5, { size: 7, color: '#ffd27a' });
    ui.para(MM.gateText(S), 62, 222, 250, { size: 7.5, color: '#ffd9c8' });
    ui.text('Chạm để chơi tiếp', 420, 246, { size: 8, align: 'right', bold: true, color: Math.floor(G.time * 2.5) % 2 ? '#ffd27a' : '#fff3da' });
  };
})();
