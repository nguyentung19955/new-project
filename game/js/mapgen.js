// Bản đồ một ải: 8 phòng vuông trên lưới, sinh ngẫu nhiên theo hạt giống, ba kiểu bố cục A, B, C.
//   A: đường chính 6 phòng ngoằn ngoèo, thêm 2 phòng phụ bỏ qua được.
//   B: mê cung nhỏ trong ô 3x3 có đường vòng; cửa Trùm nằm trong phòng Suối hồi, mở khi dọn xong 3 phòng quái.
//   C: sảnh giữa là phòng Bắt đầu, ba cánh giữ ba mảnh chìa; đủ 3 mảnh thì cửa phía trên sảnh mở, qua Suối hồi tới Trùm.
// Quy ước số phòng: 0 là Bắt đầu, 6 là Suối hồi, 7 là Trùm.
(function () {
  const G = window.G;
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const DKEYS = ['up', 'down', 'left', 'right'];
  const OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };
  const MAXW = 5, MAXH = 4; // bản đồ nhỏ vẽ vừa lưới 5 x 4
  const SIDE = ['merchant', 'challenge', 'curse'];
  const KINDS = ['A', 'B', 'C'];
  const isFight = (t) => t === 'fight' || t === 'elite'; // phòng quái được tính vào điều kiện mở cửa Trùm

  function rng(seed) {
    // Trộn hạt giống trước để các hạt liền nhau không cho kết quả gần giống nhau.
    let s = (seed >>> 0) ^ 0x9e3779b9;
    s = Math.imul(s ^ (s >>> 15), 0x85ebca6b) >>> 0;
    const f = G.srand(s || 1);
    for (let i = 0; i < 4; i++) f();
    return f;
  }
  const pick = (rn, a) => a[Math.floor(rn() * a.length)];
  function shuffle(rn, a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rn() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  const key = (x, y) => x + ',' + y;
  function room(id, x, y, type, main) { return { id, x, y, type, main: !!main, doors: {} }; }
  function link(a, b) {
    for (const d of DKEYS) if (a.x + DIRS[d][0] === b.x && a.y + DIRS[d][1] === b.y) { a.doors[d] = b.id; b.doors[OPP[d]] = a.id; return true; }
    return false;
  }
  // Dời toạ độ về gốc 0 và xếp phòng theo số.
  function finish(kind, seed, rooms, gate) {
    const mx = Math.min(...rooms.map((r) => r.x)), my = Math.min(...rooms.map((r) => r.y));
    for (const r of rooms) { r.x -= mx; r.y -= my; }
    rooms.sort((a, b) => a.id - b.id);
    return {
      kind, seed, rooms, start: 0, fountain: 6, boss: 7, gate: gate || null,
      w: Math.max(...rooms.map((r) => r.x)) + 1, h: Math.max(...rooms.map((r) => r.y)) + 1,
    };
  }
  function bboxOk(cells) {
    const xs = cells.map((c) => c[0]), ys = cells.map((c) => c[1]);
    return Math.max(...xs) - Math.min(...xs) < MAXW && Math.max(...ys) - Math.min(...ys) < MAXH;
  }

  // ---------- Kiểu A: đường chính có nhánh phụ ----------
  function genA(seed, rn) {
    for (let guard = 0; guard < 400; guard++) {
      // lối chính: đi ngẫu nhiên 6 ô không cắt chính mình, phải rẽ ít nhất 2 lần
      const path = [[0, 0]];
      const used = new Set([key(0, 0)]);
      let turns = 0, last = null, ok = true;
      while (path.length < 6) {
        const [x, y] = path[path.length - 1];
        const opts = shuffle(rn, DKEYS).filter((d) => {
          const nx = x + DIRS[d][0], ny = y + DIRS[d][1];
          return !used.has(key(nx, ny)) && bboxOk(path.concat([[nx, ny]]));
        });
        if (!opts.length) { ok = false; break; }
        // hơi ưu tiên rẽ để lối đi ngoằn ngoèo
        const d = last && opts.length > 1 && rn() < 0.45 ? opts.find((o) => o !== last) : opts[0];
        if (last && d !== last) turns++;
        last = d;
        const c = [x + DIRS[d][0], y + DIRS[d][1]];
        path.push(c); used.add(key(c[0], c[1]));
      }
      if (!ok || turns < 2) continue;
      // Phòng Trùm chỉ được kề đúng một ô của lối chính là Suối hồi? Không cần: cửa mới quyết định, không phải ô kề.
      // hai phòng phụ gắn vào bốn phòng đầu của lối chính (không gắn vào Suối hồi và Trùm)
      const sideCells = [];
      const parents = shuffle(rn, [0, 1, 2, 3]);
      for (const pi of parents) {
        if (sideCells.length >= 2) break;
        const [x, y] = path[pi];
        const free = shuffle(rn, DKEYS).map((d) => [x + DIRS[d][0], y + DIRS[d][1]]).filter((c) => !used.has(key(c[0], c[1])) && bboxOk(path.concat(sideCells.map((s) => s.c), [c])));
        if (!free.length) continue;
        used.add(key(free[0][0], free[0][1]));
        sideCells.push({ c: free[0], parent: pi });
      }
      if (sideCells.length < 2) continue;
      const types = ['start', 'fight', 'fight', 'elite'];
      const rooms = [];
      for (let i = 0; i < 4; i++) rooms.push(room(i, path[i][0], path[i][1], types[i], true));
      const sideTypes = shuffle(rn, ['chest', pick(rn, SIDE)]);
      sideCells.forEach((s, k) => rooms.push(room(4 + k, s.c[0], s.c[1], sideTypes[k], false)));
      rooms.push(room(6, path[4][0], path[4][1], 'fountain', true));
      rooms.push(room(7, path[5][0], path[5][1], 'boss', true));
      const main = [0, 1, 2, 3, 6, 7];
      for (let i = 0; i < 5; i++) link(rooms[main[i]], rooms[main[i + 1]]);
      sideCells.forEach((s, k) => link(rooms[s.parent], rooms[4 + k]));
      return finish('A', seed, rooms, null);
    }
    return null;
  }

  // ---------- Kiểu B: mê cung nhỏ 3x3 ----------
  function genB(seed, rn) {
    for (let guard = 0; guard < 400; guard++) {
      const corners = [[0, 0], [2, 0], [0, 2], [2, 2]];
      const bc = pick(rn, corners);
      // Suối hồi là một trong hai ô kề góc của Trùm
      const fc = pick(rn, [[bc[0] === 0 ? 1 : 1, bc[1]], [bc[0], 1]]);
      // Bắt đầu ở xa Trùm: góc đối diện hoặc một ô cách Trùm ít nhất 3 bước
      const far = [];
      for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) if (Math.abs(x - bc[0]) + Math.abs(y - bc[1]) >= 3) far.push([x, y]);
      const sc = pick(rn, far);
      // bỏ đi một ô trong 9 ô
      const all = [];
      for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) all.push([x, y]);
      const fixed = new Set([key(bc[0], bc[1]), key(fc[0], fc[1]), key(sc[0], sc[1])]);
      const drop = pick(rn, all.filter((c) => !fixed.has(key(c[0], c[1]))));
      const rest = shuffle(rn, all.filter((c) => !fixed.has(key(c[0], c[1])) && key(c[0], c[1]) !== key(drop[0], drop[1])));
      const types = shuffle(rn, ['fight', 'fight', 'elite', 'chest', pick(rn, SIDE)]);
      const rooms = [room(0, sc[0], sc[1], 'start', true)];
      rest.forEach((c, k) => rooms.push(room(1 + k, c[0], c[1], types[k], isFight(types[k]))));
      rooms.push(room(6, fc[0], fc[1], 'fountain', true));
      rooms.push(room(7, bc[0], bc[1], 'boss', true));
      const at = {};
      for (const r of rooms) at[key(r.x, r.y)] = r;
      // cây khung ngẫu nhiên trên 7 phòng không phải Trùm, rồi thêm cửa để có đường vòng
      const inner = rooms.filter((r) => r.type !== 'boss');
      const seen = new Set([0]);
      const stack = [rooms[0]];
      const edges = new Set();
      const ek = (a, b) => (a.id < b.id ? a.id + '-' + b.id : b.id + '-' + a.id);
      while (stack.length) {
        const cur = stack[stack.length - 1];
        const nb = shuffle(rn, DKEYS).map((d) => at[key(cur.x + DIRS[d][0], cur.y + DIRS[d][1])]).filter((n) => n && n.type !== 'boss' && !seen.has(n.id));
        if (!nb.length) { stack.pop(); continue; }
        seen.add(nb[0].id); edges.add(ek(cur, nb[0])); link(cur, nb[0]); stack.push(nb[0]);
      }
      if (seen.size !== inner.length) continue;
      const extra = [];
      for (const a of inner) for (const d of ['down', 'right']) {
        const b = at[key(a.x + DIRS[d][0], a.y + DIRS[d][1])];
        if (b && b.type !== 'boss' && !edges.has(ek(a, b))) extra.push([a, b]);
      }
      if (!extra.length) continue;
      const add = shuffle(rn, extra).slice(0, 1 + (rn() < 0.6 && extra.length > 1 ? 1 : 0));
      for (const [a, b] of add) link(a, b);
      link(rooms[6], rooms[7]);
      const need = rooms.filter((r) => isFight(r.type)).map((r) => r.id);
      return finish('B', seed, rooms, { a: 6, b: 7, ids: need, need: need.length, rule: 'clear' });
    }
    return null;
  }

  // ---------- Kiểu C: sảnh trung tâm ----------
  function genC(seed, rn) {
    for (let guard = 0; guard < 400; guard++) {
      const cells = { hub: [0, 0], fountain: [0, -1], boss: [0, -2] };
      const wings = [[-1, 0], [1, 0], [0, 1]];
      const keyTypes = shuffle(rn, ['fight', 'fight', 'elite']);
      const rooms = [room(0, 0, 0, 'start', true)];
      wings.forEach((c, k) => { const r = room(1 + k, c[0], c[1], keyTypes[k], true); r.key = true; rooms.push(r); });
      const used = new Set([key(0, 0), key(0, -1), key(0, -2)].concat(wings.map((c) => key(c[0], c[1]))));
      const sideTypes = shuffle(rn, ['chest', pick(rn, SIDE)]);
      let ok = true;
      const links = [];
      for (let k = 0; k < 2; k++) {
        // phòng phụ gắn vào cuối một cánh (phòng chìa hoặc phòng phụ đã gắn trước đó)
        const hosts = shuffle(rn, rooms.filter((r) => r.id >= 1));
        let done = false;
        for (const h of hosts) {
          const free = shuffle(rn, DKEYS).map((d) => [h.x + DIRS[d][0], h.y + DIRS[d][1]]).filter((c) => {
            if (used.has(key(c[0], c[1]))) return false;
            if (c[1] < 0 && c[0] === 0) return false;
            return bboxOk(rooms.map((r) => [r.x, r.y]).concat([cells.fountain, cells.boss, c]));
          });
          if (!free.length) continue;
          const r = room(4 + k, free[0][0], free[0][1], sideTypes[k], false);
          used.add(key(r.x, r.y)); rooms.push(r); links.push([h.id, r.id]); done = true;
          break;
        }
        if (!done) { ok = false; break; }
      }
      if (!ok) continue;
      rooms.push(room(6, 0, -1, 'fountain', true));
      rooms.push(room(7, 0, -2, 'boss', true));
      rooms.sort((a, b) => a.id - b.id);
      for (let k = 1; k <= 3; k++) link(rooms[0], rooms[k]);
      for (const [a, b] of links) link(rooms[a], rooms[b]);
      link(rooms[0], rooms[6]); link(rooms[6], rooms[7]);
      return finish('C', seed, rooms, { a: 0, b: 6, ids: [1, 2, 3], need: 3, rule: 'keys' });
    }
    return null;
  }

  const M = (G.mapgen = { KINDS, SIDE, DIRS, OPP, DKEYS, isFight });
  // Sinh bản đồ. kind: 'A' | 'B' | 'C'. Cùng kind và seed thì luôn ra cùng một bản đồ.
  M.make = function (kind, seed) {
    seed = (seed >>> 0) || 1;
    const rn = rng(seed + KINDS.indexOf(kind) * 7919);
    const m = kind === 'A' ? genA(seed, rn) : kind === 'B' ? genB(seed, rn) : genC(seed, rn);
    if (!m) throw new Error('Không sinh được bản đồ kiểu ' + kind + ' với hạt giống ' + seed);
    return m;
  };
  // Chọn kiểu cho một lần vào ải: ải cuối vùng luôn là C; ải khác ngẫu nhiên, tránh kiểu của lần chơi ngay trước.
  M.pickKind = function (i, last, rnd) {
    if (i === 4) return 'C';
    const pool = KINDS.filter((k) => k !== last);
    return pool[Math.floor((rnd || Math.random)() * pool.length)];
  };
  // Số phòng điều kiện đã dọn (mảnh chìa đã có ở Kiểu C).
  M.gateCount = function (map, cleared) {
    return map.gate ? map.gate.ids.filter((id) => cleared[id]).length : 0;
  };
  M.gateOpen = function (map, cleared) {
    return !map.gate || M.gateCount(map, cleared) >= map.gate.need;
  };
  // Cửa nối a với b có phải cửa có điều kiện (cửa dẫn tới Trùm) không.
  M.isGate = function (map, a, b) {
    const g = map.gate;
    return !!g && ((g.a === a && g.b === b) || (g.a === b && g.b === a));
  };
  // Đường đi ngắn nhất giữa hai phòng. pass(a, b) trả về false nếu cửa đang không qua được.
  M.path = function (map, from, to, pass) {
    const prev = { [from]: -1 };
    const q = [from];
    while (q.length) {
      const cur = q.shift();
      if (cur === to) { const out = []; for (let c = to; c !== -1; c = prev[c]) out.unshift(c); return out; }
      const r = map.rooms[cur];
      for (const d of DKEYS) {
        const n = r.doors[d];
        if (n == null || n in prev || (pass && !pass(cur, n))) continue;
        prev[n] = cur; q.push(n);
      }
    }
    return null;
  };
  M.dirTo = function (map, a, b) {
    const r = map.rooms[a];
    for (const d of DKEYS) if (r.doors[d] === b) return d;
    return null;
  };

  // Đi thử cả ải theo đúng luật cửa: phòng có quái thì phải dọn mới ra được, cửa Trùm theo điều kiện.
  // Trả về thứ tự vào phòng lần đầu và số phòng quái đã dọn lúc vào Trùm.
  M.walk = function (map, greedy) {
    const cleared = {}, seen = {}, order = [];
    let cur = map.start, fights = 0, steps = 0, from = -1;
    const hasMob = (t) => isFight(t) || t === 'start' || t === 'challenge';
    const pass = (a, b) => !M.isGate(map, a, b) || M.gateOpen(map, cleared);
    for (let guard = 0; guard < 200; guard++) {
      if (!seen[cur]) { seen[cur] = true; order.push(cur); }
      const r = map.rooms[cur];
      if (r.type === 'boss') return { order, fights, steps, from, ok: true };
      if (!cleared[cur]) { cleared[cur] = true; if (hasMob(r.type)) fights++; }
      // mục tiêu: phòng chưa vào gần nhất (trừ Trùm, và trừ Suối hồi nếu còn phòng khác), sau cùng mới tới Suối hồi rồi Trùm
      let goal = null, best = 1e9;
      for (const o of map.rooms) {
        if (seen[o.id] || o.type === 'boss') continue;
        if (greedy && !o.main) continue; // người chơi vội: bỏ phòng phụ
        const p = M.path(map, cur, o.id, pass);
        if (!p) continue;
        const cost = p.length + (o.type === 'fountain' ? 50 : 0);
        if (cost < best) { best = cost; goal = p; }
      }
      if (!goal) goal = M.path(map, cur, map.boss, pass);
      if (!goal || goal.length < 2) return { order, fights, steps, ok: false };
      from = cur; cur = goal[1]; steps++;
    }
    return { order, fights, steps, ok: false };
  };

  // Kiểm tra một bản đồ. Trả về danh sách lỗi (rỗng là đạt).
  M.check = function (map) {
    const errs = [];
    const R = map.rooms;
    if (R.length !== 8) errs.push('không đủ 8 phòng: ' + R.length);
    const cells = new Set();
    R.forEach((r, i) => {
      if (r.id !== i) errs.push('số phòng lệch ở vị trí ' + i);
      if (cells.has(key(r.x, r.y))) errs.push('hai phòng trùng một ô ' + key(r.x, r.y));
      cells.add(key(r.x, r.y));
      if (r.x < 0 || r.y < 0 || r.x >= MAXW || r.y >= MAXH) errs.push('phòng ' + i + ' nằm ngoài lưới ' + MAXW + 'x' + MAXH);
    });
    if (map.w > MAXW || map.h > MAXH) errs.push('bản đồ rộng quá lưới');
    const count = {};
    for (const r of R) count[r.type] = (count[r.type] || 0) + 1;
    const sides = SIDE.reduce((n, t) => n + (count[t] || 0), 0);
    if (count.start !== 1 || count.fountain !== 1 || count.boss !== 1 || count.chest !== 1 || count.elite !== 1 || count.fight !== 2 || sides !== 1) errs.push('sai bộ loại phòng: ' + JSON.stringify(count));
    if (R[0] && R[0].type !== 'start') errs.push('phòng 0 không phải Bắt đầu');
    if (R[6] && R[6].type !== 'fountain') errs.push('phòng 6 không phải Suối hồi');
    if (R[7] && R[7].type !== 'boss') errs.push('phòng 7 không phải Trùm');
    if (errs.length) return errs;
    // cửa: phải nối hai ô kề nhau và có đủ hai chiều
    for (const r of R) {
      for (const d of DKEYS) {
        const n = r.doors[d];
        if (n == null) continue;
        const o = R[n];
        if (!o) { errs.push('cửa dẫn tới phòng không có: ' + r.id + ' ' + d); continue; }
        if (o.x !== r.x + DIRS[d][0] || o.y !== r.y + DIRS[d][1]) errs.push('cửa nối hai ô không kề: ' + r.id + '-' + n);
        if (o.doors[OPP[d]] !== r.id) errs.push('cửa một chiều: ' + r.id + '-' + n);
      }
    }
    // mọi phòng tới được (không tính khóa)
    for (const r of R) if (!M.path(map, 0, r.id)) errs.push('phòng ' + r.id + ' không tới được');
    // Trùm chỉ có một cửa và cửa đó thông với Suối hồi
    const bd = DKEYS.filter((d) => R[7].doors[d] != null);
    if (bd.length !== 1 || R[7].doors[bd[0]] !== 6) errs.push('Trùm phải có đúng một cửa, thông với Suối hồi');
    const fights = R.filter((r) => isFight(r.type)).map((r) => r.id);
    if (map.gate) {
      const g = map.gate;
      if (g.need !== 3 || g.ids.length !== 3 || !g.ids.every((id) => isFight(R[id].type))) errs.push('điều kiện mở cửa phải là 3 phòng quái');
      // khi cửa còn khóa: không tới được Trùm, nhưng phải tới được mọi phòng điều kiện
      const shut = (a, b) => !M.isGate(map, a, b);
      if (M.path(map, 0, 7, shut)) errs.push('có lối tắt tới Trùm khi cửa còn khóa');
      for (const id of g.ids) if (!M.path(map, 0, id, shut)) errs.push('phòng điều kiện ' + id + ' nằm sau cửa khóa');
      if (map.kind === 'C' && M.path(map, 0, 6, shut)) errs.push('Kiểu C: tới được Suối hồi khi chưa đủ chìa');
      if (map.kind === 'B' && !(g.a === 6 && g.b === 7)) errs.push('Kiểu B: cửa khóa phải nằm giữa Suối hồi và Trùm');
    } else {
      // không có cửa điều kiện: mỗi phòng quái của lối chính phải là chỗ bắt buộc đi qua
      for (const id of fights) {
        const p = M.path(map, 0, 7, (a, b) => a !== id && b !== id);
        if (p) errs.push('bỏ qua được phòng quái ' + id + ' mà vẫn tới Trùm');
      }
    }
    // đi thử: người chơi vội (bỏ phòng phụ) và người chơi đi hết đều phải tới Trùm sau ít nhất 3 phòng quái
    for (const greedy of [true, false]) {
      const w = M.walk(map, greedy);
      if (!w.ok) errs.push('đi thử không tới được Trùm' + (greedy ? ' (bỏ phòng phụ)' : ''));
      else {
        if (w.fights < 4) errs.push('vào Trùm khi mới dọn ' + w.fights + ' phòng có quái');
        if (w.from !== 6) errs.push('vào Trùm mà không đi từ Suối hồi');
        // Kiểu A và C: Suối hồi còn là phòng mới cuối cùng trước Trùm. Kiểu B có thể ghé Suối hồi sớm rồi quay lại.
        if (map.kind !== 'B' && w.order[w.order.length - 2] !== 6) errs.push('phòng mới ngay trước Trùm không phải Suối hồi');
        if (!greedy && w.order.length !== 8) errs.push('đi hết mà không qua đủ 8 phòng');
      }
    }
    return errs;
  };
  // Mô tả ngắn để so sánh hai bản đồ có giống nhau không.
  M.sig = function (map) {
    return map.rooms.map((r) => r.type[0] + r.x + r.y + DKEYS.map((d) => (r.doors[d] == null ? '-' : r.doors[d])).join('')).join('|');
  };
})();
