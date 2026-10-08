// Mục D của tests/ghep2.py: bản đồ nhỏ và bản đồ to chỉ dùng một màu ô, một màu viền, một màu biểu tượng.
// Ghi lại mọi lệnh tô và kẻ viền mà bản đồ gửi xuống lớp giao diện, rồi xem chúng dùng những màu nào.
() => {
  const { ok, room, paint } = T2;
  const c = G.ux, PAL = G.minimap.PAL;
  const realFill = c.fillRect, realStroke = c.strokeRect;
  let rec = [];
  c.fillRect = function (x, y, w, h) { rec.push({ k: 'f', col: String(c.fillStyle), x, y, w, h }); return realFill.apply(c, arguments); };
  c.strokeRect = function (x, y, w, h) { rec.push({ k: 's', col: String(c.strokeStyle), x: x - 0.5, y: y - 0.5, w: w + 1, h: h + 1 }); return realStroke.apply(c, arguments); };
  // trình duyệt đổi màu về dạng chuẩn (#rrggbb hoặc rgba(...)): đổi bảng màu sang cùng dạng để so
  const norm = (col) => { const o = c.fillStyle; c.fillStyle = col; const r = String(c.fillStyle); c.fillStyle = o; return r; };
  const N = {}; for (const k in PAL) N[k] = norm(PAL[k]);
  const inside = (r, g) => r.x >= g[0] - 3 && r.y >= g[1] - 3 && r.x + r.w <= g[0] + g[2] + 3 && r.y + r.h <= g[1] + g[3] + 3;
  const near = (a, b) => Math.abs(a - b) < 0.01;
  // độ sặc sỡ của một màu: chênh lệch lớn nhất giữa ba kênh đỏ, lục, lam
  // Từ khi đổi sang chủ đề trống đồng, bản đồ vẫn một tông nhưng là tông đồng và xanh ngọc: các màu của bảng màu đó không tính là sặc sỡ.
  const chan = (col) => { const m = col.match(/[\d.]+/g); return col[0] === '#' ? [1, 3, 5].map((i) => parseInt(col.slice(i, i + 2), 16)) : m.slice(0, 3).map(Number); };
  const palSet = new Set(Object.values(N).map((q) => chan(q).join()));
  const vivid = (col) => { if (palSet.has(chan(col).join())) return 0; const v = chan(col); return Math.max(...v) - Math.min(...v); };
  const hue = (col) => { const [r, g, b] = chan(col), mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn || 1; const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return (h * 60 + 360) % 360; };
  ok('D: bảng màu bản đồ chỉ có một màu nền ô, một màu viền, một màu biểu tượng (cộng màu của ô đang đứng)', PAL && Object.keys(PAL).sort().join() === 'cur,curEdge,edge,faint,fill,icon', PAL && Object.keys(PAL).join());
  ok('D: không còn bảng màu riêng cho từng loại phòng', G.minimap.COL === undefined);
  const fills = { cur: new Set(), seen: new Set(), known: new Set() }, edges = { cur: new Set(), seen: new Set(), known: new Set() };
  const iconCols = new Set(), other = new Set(), types = new Set(), legendFill = new Set(), legendIcon = new Set();
  let cells = 0, lockSeen = 0, lockOk = true, legendRows = 0, worst = 0, halo = 0;
  for (const big of [false, true]) for (const kind of ['A', 'B', 'C']) for (const seed of [3, 11]) {
    room({ kind, seed, r: seed % 3, i: kind === 'C' ? 4 : 2 });
    const S = T2.S, map = S.map, M = G.mapgen;
    // phòng đầu đang đứng; phòng số chẵn đã qua; phòng lẻ mới biết. Cửa Trùm còn khóa.
    for (const r of map.rooms) { if (r.id % 2 === 0) S.seen[r.id] = true; S.known[r.id] = true; }
    S.fade = 0;
    if (big) S.mode = 'map';
    rec = []; paint();
    const list = G.minimap.cells(S, big), s = big ? 3 : 1;
    const g = big ? [64, 40, 244, 164] : (() => { const b = G.minimap.rect(S); return [b[0] + 4, b[1] + 14, b[2] - 8, b[3] - 17]; })();
    const mine = rec.filter((r) => inside(r, g) && !(big && r.w > 200) && !(r.w >= G.W - 1));
    const used = new Set();
    for (const cl of list) {
      if (!cl.st) continue;
      cells++; types.add(cl.type);
      for (const r of mine) {
        if (near(r.x, cl.x) && near(r.y, cl.y) && near(r.w, cl.w) && near(r.h, cl.h)) { (r.k === 'f' ? fills : edges)[cl.st].add(r.col); used.add(r); }
        else if (cl.st === 'cur' && r.k === 'f' && near(r.x, cl.x - 2) && near(r.w, cl.w + 4)) { halo++; used.add(r); }
        else if (r.k === 'f' && r.w <= s + 0.1 && r.h <= s + 0.1 && r.x >= cl.x && r.x <= cl.x + cl.w && r.y >= cl.y && r.y <= cl.y + cl.h) { iconCols.add(r.col); used.add(r); }
      }
    }
    // ổ khóa ở lối vào Trùm
    for (const r0 of map.rooms) for (const d of ['right', 'down']) {
      const n = r0.doors[d];
      if (n == null || !M.isGate(map, r0.id, n)) continue;
      const a = list.find((q) => q.id === r0.id), b = list.find((q) => q.id === n);
      if (!a.st || !b.st) continue;
      lockSeen++;
      const lx = d === 'right' ? a.x + a.w + (b.x - a.x - a.w) / 2 : a.x + a.w / 2, ly = d === 'right' ? a.y + a.h / 2 : a.y + a.h + (b.y - a.y - a.h) / 2;
      const bits = mine.filter((r) => !used.has(r) && r.k === 'f' && r.w < 1.9 && r.h < 1.9 && Math.abs(r.x - lx) < 8 && Math.abs(r.y - ly) < 8);
      if (bits.length < 10 || bits.some((r) => r.col !== N.icon)) { lockOk = false; T2.dbg = (T2.dbg || '') + ' [' + (big ? 'to' : 'nhỏ') + kind + seed + ' ' + bits.length + ' ' + [...new Set(bits.map((r) => r.col))].join('/') + ']'; }
      for (const r of bits) used.add(r);
      for (const r of mine) if (!used.has(r) && r.k === 'f' && Math.abs(r.x + r.w / 2 - lx) < 1 && Math.abs(r.y + r.h / 2 - ly) < 1) used.add(r); // nền tối sau ổ khóa
    }
    for (const r of mine) { if (!used.has(r)) other.add(r.col); worst = Math.max(worst, vivid(r.col)); }
    if (big) {
      const shown = ['start', 'fight', 'elite', 'chest', 'fountain', 'merchant', 'challenge', 'curse', 'boss'].filter((t) => map.rooms.some((r) => r.type === t && G.minimap.stateOf(S, r.id)));
      shown.forEach((t, i) => {
        legendRows++;
        const y = 50 + i * 13;
        for (const r of rec) {
          if (r.k === 'f' && near(r.x, 322) && near(r.y, y) && near(r.w, 13)) legendFill.add(r.col);
          if (r.k === 'f' && r.w <= 1.1 && r.x >= 322 && r.x <= 335 && r.y >= y && r.y <= y + 11) legendIcon.add(r.col);
        }
      });
      for (const r of rec) if (r.x >= 320 && r.x + r.w <= 425 && r.y >= 48 && r.y <= 240) worst = Math.max(worst, vivid(r.col));
    }
    S.mode = 'play';
  }
  const one = (set, col) => set.size === 1 && set.has(col);
  ok('D: đã soi đủ chín loại phòng trên cả ba kiểu bản đồ, bản đồ nhỏ lẫn bản đồ to', types.size === 9 && cells > 60, types.size + ' loại, ' + cells + ' ô');
  ok('D: mọi ô đã qua, bất kể loại phòng, cùng đúng một màu nền', one(fills.seen, N.fill), [...fills.seen].join(' | '));
  ok('D: mọi ô mới biết cùng đúng một màu nền (màu ô đã qua, làm nhạt đi)', one(fills.known, N.faint), [...fills.known].join(' | '));
  const rgb = (col) => (col[0] === '#' ? [1, 3, 5].map((i) => parseInt(col.slice(i, i + 2), 16)) : col.match(/[\d.]+/g).slice(0, 3).map(Number)).join();
  const alpha = (col) => (col[0] === '#' ? 1 : Number(col.match(/[\d.]+/g)[3]));
  ok('D: ô đã qua đậm hơn ô mới biết: cùng một màu, ô mới biết chỉ đậm chưa tới một nửa', rgb(N.fill) === rgb(N.faint) && alpha(N.faint) <= 0.5 && alpha(N.fill) === 1, N.fill + ' so với ' + N.faint);
  ok('D: mọi ô đã qua và mới biết cùng một màu viền cố định', one(edges.seen, N.edge) && one(edges.known, N.edge), [...edges.seen, ...edges.known].join(' | '));
  const lum = (col) => rgb(col).split(',').map(Number).reduce((a, b) => a + b, 0);
  ok('D: ô đang đứng sáng hơn ô đã qua và có viền nổi màu riêng, giống nhau ở mọi bản đồ', one(fills.cur, N.cur) && one(edges.cur, N.curEdge) && lum(N.cur) > lum(N.fill) + 80 && lum(N.curEdge) > lum(N.edge) + 200 && halo >= 12, [...fills.cur].join() + ' viền ' + [...edges.cur].join() + ' quầng ' + halo);
  ok('D: mọi biểu tượng dùng đúng một màu sáng duy nhất', one(iconCols, N.icon), [...iconCols].join(' | '));
  ok('D: lối nối giữa các phòng cùng màu viền; không còn màu nào khác trong lưới bản đồ', one(other, N.edge), [...other].join(' | '));
  ok('D: ngoài bảng màu một tông của bản đồ, không còn màu sặc sỡ nào (xanh, đỏ, tím) trong bản đồ và chú giải', worst <= 60, 'chênh kênh màu lớn nhất ' + worst);
  const hf = hue(N.fill), hc = hue(N.cur), he = hue(N.edge);
  ok('D: bảng màu một tông theo chủ đề trống đồng: nền ô và ô đang đứng cùng sắc xanh ngọc, viền màu đồng; không có đỏ, lam, tím', hf > 150 && hf < 195 && Math.abs(hc - hf) < 12 && he > 20 && he < 50, 'sắc nền ' + Math.round(hf) + ', ô đang đứng ' + Math.round(hc) + ', viền ' + Math.round(he));
  ok('D: chú giải của bản đồ to: mọi loại phòng cùng màu ô, cùng màu biểu tượng', legendRows > 20 && one(legendFill, N.fill) && one(legendIcon, N.icon), legendRows + ' dòng; ' + [...legendFill].join() + ' ; ' + [...legendIcon].join());
  ok('D: cửa Trùm còn khóa có ổ khóa, cùng màu biểu tượng', lockSeen >= 4 && lockOk, lockSeen + ' cửa' + (T2.dbg || ''));
  // chú giải có đủ ba khác biệt còn lại
  const realText = G.ui.text; let texts = [];
  G.ui.text = function (s) { texts.push(String(s)); return realText.apply(this, arguments); };
  room({ kind: 'B', seed: 3 }); T2.S.mode = 'map'; T2.S.fade = 0; texts = []; paint();
  ok('D: chú giải ghi đủ: đang ở đây, đã qua, mới biết, cửa Trùm còn khóa', ['Bạn đang ở đây', 'Phòng đã qua', 'Phòng mới biết', 'Cửa Trùm còn khóa'].every((t) => texts.includes(t)), texts.filter((t) => t.length < 22).join(' | '));
  G.ui.text = realText; T2.S.mode = 'play';
  // mở cửa Trùm thì ổ khóa biến mất
  room({ kind: 'C', seed: 3, i: 4 });
  {
    const S = T2.S, map = S.map, M = G.mapgen;
    for (const r of map.rooms) { S.seen[r.id] = true; S.known[r.id] = true; if (r.type !== 'boss') S.cleared[r.id] = true; }
    S.fade = 0; rec = []; paint();
    const list = G.minimap.cells(S, false), b = G.minimap.rect(S);
    const tiny = rec.filter((r) => r.k === 'f' && r.w < 1 && inside(r, [b[0] + 4, b[1] + 14, b[2] - 8, b[3] - 17]));
    ok('D: cửa Trùm đã mở thì không còn ổ khóa trên bản đồ', M.gateOpen(map, S.cleared) && tiny.length === 0, tiny.length);
  }
  c.fillRect = realFill; c.strokeRect = realStroke;
  return T2.out.splice(0);
}
