// Hàm vẽ 20 tướng Thường (DANH-SACH lô 1–2) — dùng bởi _gen-thuong.js. Mỗi tướng: name, notes (đặc trưng + nguồn), draw(g, pose).
// pose: { k: idle|attack|cast|hurt|die, i, arm: idle|windup|raise|strike|follow|hold|high|front|down, dy, alt, fx, eyes, kneel, lying }
'use strict';
module.exports = (L) => {
  const { M, stamp, DIR, perp, shaft, handPos, WDIR, arm, head, build, torsoPts, legs, fx, spans, linePts } = L;
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const mul = (a, k) => [a[0] * k, a[1] * k];
  const D = (d) => DIR[d] || d;

  // ---- vũ khí dùng chung
  function axeHead(g, tip, dir, m) {           // rìu xéo Đông Sơn: lưỡi cong lệch về trước
    const d = D(dir), p = perp(d);
    const cells = [[0, 0, 1], [1, 0, 1], [-1, 0, 1], [0, 1, 1], [1, 1, 1], [2, 1, 2], [-1, 1, 1], [0, 2, 1], [1, 2, 1], [2, 2, 2], [3, 2, 2], [-1, 2, 0], [1, 3, 2], [2, 3, 2], [0, 3, 0], [3, 3, 2]];
    for (const [k, j, t] of cells) { const q = add(add(tip, mul(d, k - 1)), mul(p, j)); g.set(q[0], q[1], m[t]); }
    const s = add(tip, mul(d, 1)); g.set(s[0], s[1], m[0]);
  }
  function bladeHead(g, tip, dir, m, len = 3) {  // mũi giáo / chĩa: lưỡi nhọn dọc theo hướng
    const d = D(dir), p = perp(d);
    for (let k = 0; k < len; k++) { const q = add(tip, mul(d, k)); g.set(q[0], q[1], k === len - 1 ? m[2] : m[1]); }
    const w1 = add(tip, p), w2 = add(tip, mul(p, -1));
    g.set(w1[0], w1[1], m[0]); g.set(w2[0], w2[1], m[2]);
  }

  // ---- lớp áo / khố dùng chung
  function torso(g, b, m, o = {}) { g.shade(torsoPts(b), m); }
  function khoFlap(g, b, m, rows = 4) {         // khố: đai eo + vạt trước rủ xuống giữa hai chân
    const y = b.t1;
    for (let x = b.wa[0]; x <= b.wa[1]; x++) g.set(x, y, m[1]);
    const cx = Math.round((b.wa[0] + b.wa[1]) / 2);
    g.shade(spans(y + 1, Array.from({ length: rows }, (_, j) => [cx - 1 + (j > 2 ? 0 : 0), cx + 1])), m, { noTop: true });
  }
  const zig = (g, x0, x1, y, a, b) => { for (let x = x0; x <= x1; x++) g.set(x, y + ((x % 2) ? 0 : 1), a); if (b) for (let x = x0; x <= x1; x++) if (x % 2) g.set(x, y + 1, b); };

  const AXE = {
    up: { at: [1, 7], rows: ['.o.....', '.dDD...', '.ddDDY.', '.dddDDY', '.dd.dDY', '.d...DY', '.o....Y'] },
    ur: { at: [0, 4], rows: ['...o...', '..ddD..', '.d.dDY.', 'o..ddDY', '....dDY', '.....Y.'] },
  };
  const T = {};

  // ---- khung chung: tay sau → chân → thân → đầu → tóc → (vũ khí + tay trước)
  const HAIR = {
    ngan: ['..qqqqq..', '.qqqqqqq.', 'qqqqqqqq.', 'qqq......', 'qq.......', 'qq.......'],
    rối: ['.q.q.q.q.', 'qqqqqqqqq', 'qqqqqqqqq', 'qqqq...qq', 'qq.......', 'qq.......', '.q.......'],
  };
  function hero(g, p, o) {
    const b = build(o.build || 'normal', (p.dy || 0) + (o.dy || 0)); b.p = p;
    const skin = o.skin || M.da; b.skin = skin;
    if (o.back) o.back(g, b, p);
    if (!o.noBackArm) arm(g, b.B, o.backHand ? o.backHand(b, p) : [b.B[0] - 1, b.B[1] + 5], skin, o.backSleeve);
    if (!o.noLegs) legs(g, b, { skin, kneel: p.kneel, ...(o.legs || {}) });
    if (o.body) o.body(g, b, p);
    head(g, { hx: b.hx, hy: b.hy, skin: o.face && o.face.skin || skin, eyes: p.eyes, child: b.child, ...(o.face || {}) });
    if (o.hair) { if (typeof o.hair === 'function') o.hair(g, b, p); else g.ascii(b.hx, b.hy - (o.hairUp || 0), HAIR[o.hair] || o.hair); }
    if (o.after) o.after(g, b, p);
    if (!p.lying && o.front) o.front(g, b, p);
    return b;
  }
  // vũ khí cán dài cầm tay trước (dáng theo p.arm; quỳ = chống vũ khí)
  function pole(g, b, p, o) {
    const am = p.kneel ? 'idle' : p.arm;
    const Hd = o.hand ? o.hand(am) : handPos(b.S, am), dir = (o.dir && o.dir[am]) || WDIR[am];
    const tip = shaft(g, Hd, dir, o.len, o.back ?? 2, o.m || M.go, o.thick, o.reserve ?? 4);
    if (o.art) stamp(g, tip, dir, o.art);
    if (o.head) o.head(g, tip, dir);
    arm(g, b.S, Hd, b.skin, o.sleeve);
    if (p.fx !== undefined && o.el) fx(g, o.el, p.fx, Hd[0] + 2, Hd[1] - 5);
    return { Hd, tip, dir };
  }
  // cung: tay trước cầm giữa cung, dây kéo về `pull` điểm; arrow: có tên; fly: tên bay xa
  function bow(g, b, p, o) {
    const Hd = [b.S[0] + 3, b.S[1] + 2];
    const L = o.half || 10;
    const pull = p.kneel ? 0 : (p.pull || 0);
    const pts = [];
    for (let dy = -L; dy <= L; dy++) pts.push([Hd[0] + 1 - Math.round(3 * (dy / L) * (dy / L)), Hd[1] + dy]);
    const top = pts[0], bot = pts[pts.length - 1];
    const sp = [Hd[0] - 1 - pull, Hd[1]];
    g.line(top[0], top[1], sp[0], sp[1], 'trang-xam'); g.line(sp[0], sp[1], bot[0], bot[1], 'trang-xam');
    pts.forEach(([x, y], i) => { g.set(x, y, i < 3 || i > pts.length - 4 ? (o.m || M.go)[0] : (o.m || M.go)[1]); g.set(x + 1, y, (o.m || M.go)[0]); });
    if (o.wrap) { g.set(Hd[0] + 1, Hd[1] - 1, o.wrap); g.set(Hd[0] + 1, Hd[1] + 1, o.wrap); }
    if (p.arrow && !p.kneel) { g.line(sp[0], sp[1], Hd[0] + 4, Hd[1], 'dat-sang'); g.set(Hd[0] + 4, Hd[1], 'bac'); g.set(Hd[0] + 5, Hd[1], 'sat-sang'); g.set(sp[0], sp[1] - 1, o.fletch || 'trang'); g.set(sp[0] + 1, sp[1] - 1, o.fletch || 'trang'); }
    if (p.fly) { g.line(25, Hd[1] - 1, 28, Hd[1] - 1, 'dat-sang'); g.set(29, Hd[1] - 1, 'bac'); g.set(25, Hd[1] - 2, 'trang'); }
    // tay sau kéo dây (qua ngực), tay trước nắm cung
    if (!p.kneel) arm(g, [b.S[0] - 2, b.S[1]], sp, b.skin, o.sleeve);
    arm(g, b.S, Hd, b.skin, o.sleeve);
    if (p.fx !== undefined && o.el) fx(g, o.el, p.fx, Hd[0] + 3, Hd[1] - 4);
  }
  const BOWP = {
    idle: [{ arrow: 0 }, { arrow: 0, dy: 1 }, { arrow: 0, alt: 1 }],
    attack: [{ pull: 1, arrow: 1 }, { pull: 4, arrow: 1 }, { pull: 0, fly: 1 }, { pull: 0 }],
    cast: [{ pull: 2, arrow: 1, fx: 0 }, { pull: 4, arrow: 1, fx: 1 }, { pull: 0, fly: 1, fx: 2 }],
  };

  // ================================================================ LẠC TƯỚNG
  T.lactuong = {
    name: 'Lạc Tướng',
    notes: [
      'Lạc Tướng (mã lactuong) — tướng Thường · hành Kim. Quy chuẩn: docs/pixel/QUY-CHUAN.md',
      'Đặc trưng (PROMPT-GEN-LAI.txt:72 · PROMPT-DUNG-XUONG.txt:47): nam ~30 chắc nịch ngực rộng, giáp ngực ĐỒNG sọc răng cưa,',
      'khố xanh gỉ đồng, khoá thắt lưng mặt trời, MŨ LÔNG CHIM LẠC trắng hình quạt, 3 vạch xăm má; cầm RÌU XÉO Đông Sơn lưỡi cong lệch.',
    ],
    draw(g, p) {
      const b = build('stocky', p.dy);
      const { hx, hy } = b;
      // mũ lông chim: quạt lông trắng sau đầu
      const top = [hx + 4, hy + 2];
      const tips = [[hx - 3, hy - 2], [hx - 2, hy - 4], [hx, hy - 6], [hx + 2, hy - 7], [hx + 4, hy - 7], [hx + 6, hy - 6], [hx + 8, hy - 4]];
      tips.forEach((t, i) => { const tt = p.alt && i % 2 ? add(t, [0, 1]) : t; g.line(top[0], top[1], tt[0], tt[1], i % 2 ? 'trang' : 'sang'); g.set(tt[0], tt[1], 'trang-xam'); });
      tips.forEach((t, i) => { if (i < tips.length - 1) { const m = linePts(top[0], top[1], t[0], t[1]); const q = m[m.length - 2]; g.set(q[0] + 1, q[1], 'trang-xam'); } });
      // tay sau
      arm(g, b.B, [b.B[0] - 1, b.B[1] + 5], M.da);
      legs(g, b, { skin: M.da, kneel: p.kneel });
      // giáp ngực đồng + răng cưa + đai mặt trời
      torso(g, b, M.dong);
      zig(g, b.sh[0] + 1, b.sh[1] - 1, b.t0 + 2, 'dong-toi');
      for (let x = b.wa[0]; x <= b.wa[1]; x++) g.set(x, b.t1 - 1, 'dong-toi');
      g.set(15, b.t1 - 1, 'vang-nghe'); g.set(16, b.t1 - 1, 'vang-sang'); g.set(15, b.t1 - 2, 'vang-nghe'); g.set(16, b.t1, 'vang-nghe');
      // khố xanh gỉ đồng
      for (let x = b.wa[0]; x <= b.wa[1]; x++) g.set(x, b.t1, x < 14 ? 'ngoc-sang' : 'ngoc');
      khoFlap(g, b, ['la-toi', 'ngoc', 'ngoc-sang'], 4);
      // đầu: tóc đen ngắn, đai đồng trán, 3 vạch xăm má
      head(g, { hx, hy, skin: M.da, eyes: p.eyes, fierce: 1 });
      g.ascii(hx, hy, ['..qqqqq..', '.qqqqqqq.', 'qqqqqqqqq', 'qqq......', 'qq.......', 'qq.......']);
      for (let x = hx; x <= hx + 8; x++) g.set(x, hy + 2, x % 2 ? 'dong-sang' : 'dong');
      g.set(hx + 3, hy + 5, 'cham-toi'); g.set(hx + 3, hy + 6, 'cham-toi'); g.set(hx + 4, hy + 6, 'da-toi');
      // rìu xéo
      if (!p.lying) {
        const am = p.kneel ? 'idle' : p.arm;
        const Hd = handPos(b.S, am), dir = WDIR[am];
        const tip = shaft(g, Hd, dir, 7, 2, M.go, false, 6);
        stamp(g, tip, dir, AXE);
        arm(g, b.S, Hd, M.da);
        if (p.fx !== undefined) fx(g, 'kim', p.fx, Hd[0] + 2, Hd[1] - 5);
      }
    },
  };

  // ================================================================ LỰC SĨ NÚI
  const ROCK = (g, x, y, big) => {         // tảng đá xám nứt (góc trên-trái = x,y)
    const rows = big
      ? ['..SSSb...', '.SSssSSs.', 'SSsssssis', 'Sssisssss', 'sssssisii', '.sissssi.', '..iiiii..']
      : ['.SSb..', 'SssSs.', 'Ssisss', 'sssisi', '.iiii.'];
    g.ascii(x, y, rows);
  };
  T.lucsi = {
    name: 'Lực Sĩ Núi',
    notes: [
      'Lực Sĩ Núi (mã lucsi) — tướng Thường · hành Thổ. Quy chuẩn: docs/pixel/QUY-CHUAN.md',
      'Đặc trưng (PROMPT-GEN-LAI.txt:73 · PROMPT-DUNG-XUONG.txt:68): nam khổng lồ, vai cực rộng, da nâu đỏ đất sét, khố vàng đất,',
      'vòng đồng cổ tay; TAY KHÔNG vác / ném TẢNG ĐÁ xám to hơn đầu (⚠ game look = cleaver — theo prompt vẽ tảng đá).',
    ],
    poses: {
      idle: [{ arm: 'shoulder' }, { arm: 'shoulder', dy: 1 }, { arm: 'shoulder', alt: 1 }],
      attack: [{ arm: 'over', rock: 1 }, { arm: 'over2', rock: 1 }, { arm: 'throw', fly: 1 }, { arm: 'after' }],
      cast: [{ arm: 'over', rock: 2, fx: 0 }, { arm: 'over2', rock: 2, fx: 1 }, { arm: 'throw', fly: 2, fx: 2 }],
    },
    draw(g, p) {
      const SK = ['dat', 'da-toi', 'da'];
      hero(g, p, {
        build: 'huge', skin: SK, hair: ['..qqqqq..', '.qqqqqqq.', 'qqqqqqqq.', 'qq.......', 'q........'],
        face: { fierce: 1 },
        backHand: (b, p) => (p.arm === 'over' || p.arm === 'over2' ? [b.B[0] + 3, b.B[1] - 6] : [b.B[0] - 1, b.B[1] + 7]),
        legs: { pantRows: 0 },
        body(g, b) {
          g.shade(torsoPts(b), SK);
          // cơ ngực / bụng
          for (let x = 11; x <= 20; x++) if (x !== 15 && x !== 16) g.set(x, b.t0 + 3, 'da-toi');   // đường cơ ngực
          g.set(12, b.t0 + 1, 'da'); g.set(13, b.t0 + 1, 'da'); g.set(17, b.t0 + 1, 'da'); g.set(18, b.t0 + 1, 'da');
          for (let y = b.t0 + 2; y <= b.t1 - 2; y++) g.set(15, y, 'da-toi');
          g.set(14, b.t0 + 5, 'da-toi'); g.set(17, b.t0 + 5, 'da-toi'); g.set(14, b.t0 + 7, 'da-toi'); g.set(17, b.t0 + 7, 'da-toi');
          // khố vàng đất
          for (let x = b.wa[0]; x <= b.wa[1]; x++) { g.set(x, b.t1, 'dong-sang'); g.set(x, b.t1 - 1, x % 3 ? 'dong' : 'dong-toi'); }
          g.shade(spans(b.t1 + 1, [[14, 17], [14, 17], [15, 16]]), ['dong', 'dong-sang', 'cat'], { noTop: true });
          // vòng đồng cổ tay sau
          g.set(b.B[0] - 1, b.B[1] + 3, 'dong-sang'); g.set(b.B[0], b.B[1] + 3, 'dong');
        },
        front(g, b, p) {
          const S = b.S;
          const pos = { shoulder: [S[0] + 1, S[1] - 2], over: [S[0] - 1, S[1] - 8], over2: [S[0] + 1, S[1] - 9], throw: [S[0] + 4, S[1] - 1], after: [S[0] + 3, S[1] + 3], down: [S[0] + 1, S[1] + 6] };
          const Hd = pos[p.kneel ? 'down' : p.arm] || pos.shoulder;
          if (p.kneel) ROCK(g, 21, 24, false);
          else if (p.arm === 'shoulder') ROCK(g, S[0] - 4, S[1] - 7, true);
          else if (p.rock) ROCK(g, Hd[0] - 6, Hd[1] - 6, true);
          if (p.fly) ROCK(g, 24, 6 + (p.fly === 2 ? 0 : 2), false);
          arm(g, S, Hd, SK);
          g.set(Hd[0] - 1, Hd[1] + 1, 'dong-sang'); g.set(Hd[0] - 1, Hd[1] + 2, 'dong');
          if (p.fx !== undefined) fx(g, 'tho', p.fx, 16, 4);
        },
      });
    },
  };

  // ================================================================ XẠ THỦ VĂN LANG
  T.xathu = {
    name: 'Xạ Thủ Văn Lang',
    notes: [
      'Xạ Thủ Văn Lang (mã xathu) — tướng Thường · hành Kim. Quy chuẩn: docs/pixel/QUY-CHUAN.md',
      'Đặc trưng (PROMPT-GEN-LAI.txt:657 · PROMPT-DUNG-XUONG.txt:90): nam thiếu niên gầy cao, áo quấn không tay xám bạc, xà cạp xanh thép,',
      'quấn tay đỏ; CUNG gỗ dài cao hơn người, tên lắp sẵn (⚠ game look = crossbow — theo GEN-LAI vẽ cung); búi tóc cao cắm 1 lông chim, ống tên bên hông.',
    ],
    poses: BOWP,
    draw(g, p) {
      hero(g, p, {
        build: 'thin',
        hair(g, b, p) {
          g.ascii(b.hx, b.hy - 3, ['...qq....', '..qqqq...', '...qq....', '..qqqqq..', '.qqqqqqq.', 'qqqqqqqq.', 'qqq......', 'qq.......']);
          // lông chim dài dựng trên búi
          g.line(b.hx + 4, b.hy - 4, b.hx + 1 - (p.alt ? 1 : 0), b.hy - 9 + (p.alt ? 1 : 0), 'trang'); g.set(b.hx + 4, b.hy - 4, 'son-sang');
          g.set(b.hx + 1 - (p.alt ? 1 : 0), b.hy - 9 + (p.alt ? 1 : 0), 'vien');
        },
        back(g, b) {   // ống tên da sau lưng
          g.shade(spans(b.t0 - 2, [[9, 10], [9, 10], [9, 11], [9, 11], [10, 11], [10, 11], [10, 11], [10, 11]]), M.dat);
          g.set(9, b.t0 - 3, 'trang'); g.set(10, b.t0 - 4, 'trang'); g.set(8, b.t0 - 3, 'son-sang');
        },
        legs: { pant: ['cham', 'cham-sang', 'sat-sang'], pantRows: 6, feet: M.dat },
        body(g, b) {
          g.shade(torsoPts(b), M.bac);
          g.line(b.sh[0] + 1, b.t0, b.wa[1], b.t0 + 5, 'sat');   // vạt áo quấn chéo
          for (let x = b.wa[0]; x <= b.wa[1]; x++) g.set(x, b.t1, 'son');
          g.set(15, b.t1, 'son-sang');
        },
        front(g, b, p) { bow(g, b, p, { half: 11, wrap: 'son-sang', el: 'kim', fletch: 'trang' }); },
      });
    },
  };

  // ================================================================ THỢ SĂN RỪNG
  T.thosan = {
    name: 'Thợ Săn Rừng',
    notes: [
      'Thợ Săn Rừng (mã thosan) — tướng Thường · hành Mộc. Quy chuẩn: docs/pixel/QUY-CHUAN.md',
      'Đặc trưng (PROMPT-GEN-LAI.txt:74 · PROMPT-DUNG-XUONG.txt:111): nam gầy dẻo luôn khom thấp, áo choàng MŨ TRÙM vá lá xanh rêu + nâu lá,',
      'mũ trùm có 2 TAI BÁO, mặt khuất bóng, MẮT CAM sáng; CUNG + ống tên (⚠ DUNG-XUONG hai dao — GEN-LAI giữ cung).',
    ],
    poses: BOWP,
    draw(g, p) {
      const R = ['reu-toi', 'reu', 'reu-sang'];
      hero(g, p, {
        build: 'normal', dy: 1, skin: ['dat', 'da-toi', 'da'],
        face: { eyeW: 'lua-sang', eyeK: 'lua', noBrow: 1, mouth: false, skin: ['toi', 'dat', 'da-toi'] },
        back(g, b, p) {   // áo choàng sau lưng
          g.shade(spans(b.t0 - 1, [[9, 12], [8, 12], [8, 12], [8, 12], [8, 12], [7, 12], [7, 12], [7, 12], [7, 11], p.alt ? [8, 11] : [7, 10]]), R);
          g.set(9, b.t0 + 3, 'dat'); g.set(8, b.t0 + 6, 'dat-sang'); g.set(10, b.t0 + 7, 'dat');
          // ống tên
          g.set(11, b.t0 - 3, 'trang'); g.set(12, b.t0 - 3, 'trang-xam'); g.line(11, b.t0 - 2, 11, b.t0 + 3, 'dat');
        },
        legs: { pant: M.dat, pantRows: 3, feet: M.dat },
        body(g, b) {
          g.shade(torsoPts(b), R);
          g.set(13, b.t0 + 2, 'dat'); g.set(14, b.t0 + 2, 'dat'); g.set(17, b.t0 + 4, 'dat-sang'); g.set(16, b.t0 + 5, 'dat');
          for (let x = b.wa[0]; x <= b.wa[1]; x++) g.set(x, b.t1 - 1, 'dat-toi');
        },
        hair(g, b) {   // mũ trùm sâu + 2 tai báo
          g.ascii(b.hx - 1, b.hy - 3, [
            '..ee....ee.',
            '.eUue..eUue',
            '.eUuuuuuuue',
            'eUuuuuuuuuu',
            'eUuuuuuuuue',
            'eUu.......e',
            'euu........',
            'euu........',
            'euu........',
            'eu.........',
            'eu.........',
          ]);
          g.set(b.hx + 3, b.hy, 'dat'); g.set(b.hx + 6, b.hy, 'dat');
          g.set(b.hx + 5, b.hy - 2, 'dat'); g.set(b.hx + 6, b.hy - 2, 'dat-sang');
        },
        front(g, b, p) { bow(g, b, p, { half: 9, el: 'moc', fletch: 'la-ma', m: M.dat }); },
      });
    },
  };

  // ================================================================ THẦY MO LỬA
  T.thaymo = {
    name: 'Thầy Mo Lửa',
    notes: [
      'Thầy Mo Lửa (mã thaymo) — tướng Thường · hành Hỏa. Quy chuẩn: docs/pixel/QUY-CHUAN.md',
      'Đặc trưng (PROMPT-GEN-LAI.txt:75 · PROMPT-DUNG-XUONG.txt:132): nam ~45 cao gầy, áo TÍM MẬN viền LỬA CAM, chuỗi hạt, mặt vẽ trắng xương;',
      'gậy gỗ xương xẩu đầu HỒ LÔ lửa cháy; VÒNG LÔNG đỏ-đen + xương tròn quanh đầu như bánh xe lửa.',
    ],
    poses: { cast: [{ arm: 'raise', fx: 0 }, { arm: 'high', fx: 1 }, { arm: 'front', fx: 2 }] },
    draw(g, p) {
      hero(g, p, {
        build: 'thin',
        back(g, b, p) {   // vòng lông đỏ-đen quanh đầu như bánh xe lửa, xen xương trắng
          const cx = b.hx + 4, cy = b.hy + 4;
          for (let k = 0; k < 14; k++) {
            const a = (k / 14) * Math.PI * 2 + (p.alt ? 0.22 : 0);
            const ca = Math.cos(a), sa = Math.sin(a);
            if (sa > 0.55) continue;
            const c1 = k % 2 ? 'son' : 'khoi', c2 = k % 2 ? 'son-sang' : 'son-toi';
            for (let r = 5; r <= 8; r++) g.set(cx + Math.round(ca * r), cy + Math.round(sa * r * 0.95), r === 8 ? c2 : c1);
            if (k % 3 === 0) g.set(cx + Math.round(ca * 6), cy + Math.round(sa * 6 * 0.95), 'trang');
          }
        },
        backSleeve: [M.tim, 4],
        legs: { pant: M.tim, pantRows: 5, feet: M.da },
        body(g, b) {
          const pts = torsoPts(b).concat(spans(b.t1 + 1, [[12, 18], [12, 18], [12, 19], [11, 19]]));
          g.shade(pts, M.tim);
          for (let y = b.t0; y <= b.t1 + 4; y++) g.set(15, y, 'lua');   // viền lửa vạt áo
          for (let x = 11; x <= 19; x++) g.set(x, b.t1 + 4, x % 2 ? 'lua' : 'lua-sang');
          for (let x = b.sh[0] + 1; x <= b.sh[1] - 1; x++) g.set(x, b.t0 + 1, x % 2 ? 'trang' : 'dat-sang');   // chuỗi hạt + xương
        },
        face: { skin: ['trang-xam', 'trang', 'sang'], brow: 'vien', fierce: 1 },
        hair: ['..qqqqq..', '.qqqqqqq.', 'qqqqqqqq.', 'qqq......', 'qq.......', 'qq.......', 'q........'],
        after(g, b) { g.set(b.hx + 4, b.hy + 3, 'toi'); g.set(b.hx + 7, b.hy + 3, 'toi'); g.set(b.hx + 5, b.hy + 7, 'toi'); g.set(b.hx + 7, b.hy + 7, 'toi'); g.set(b.hx + 6, b.hy + 8, 'trang-xam'); },
        front(g, b, p) {
          pole(g, b, p, { len: 8, back: 6, m: ['dat-toi', 'dat', 'dat-sang'], el: 'hoa', sleeve: [M.tim, 3], reserve: 4,
            head(g, tip, dir) {   // hồ lô lửa
              const d = DIR[dir];
              const c = [tip[0] + d[0] * 2, tip[1] + d[1] * 2];
              g.ascii(c[0] - 1, c[1] - 2, ['.d.', 'dDd', '.d.', 'dDd', 'ddd']);
              const fl = p.alt ? ['.l.', 'lLl', '.L.'] : ['..l', '.lL', 'lLl'];
              g.ascii(c[0] - 1, c[1] - 5, fl);
            } });
        },
      });
    },
  };

  // ================================================================ THẦN SƯƠNG NÚI
  T.thansuong = {
    name: 'Thần Sương Núi',
    notes: [
      'Thần Sương Núi (mã thansuong) — tướng Thường · hành Thủy. Quy chuẩn: docs/pixel/QUY-CHUAN.md',
      'Đặc trưng (PROMPT-GEN-LAI.txt:681 · PROMPT-DUNG-XUONG.txt:153): linh hồn sương mảnh, LƠ LỬNG, KHÔNG CHÂN (thân tan thành đuôi mây),',
      'khăn sương lam băng nhạt; hai tay khum giữ TINH THỂ BĂNG xanh đậm (⚠ không giáo); TÓC TRẮNG rất dài bay NGƯỢC lên như khói.',
    ],
    poses: {
      idle: [{ arm: 'cup' }, { arm: 'cup', dy: -1 }, { arm: 'cup', alt: 1 }],
      attack: [{ arm: 'cup' }, { arm: 'push1' }, { arm: 'push2', shard: 1 }, { arm: 'push1', shard: 2 }],
      cast: [{ arm: 'lift', fx: 0 }, { arm: 'lift', fx: 1, dy: -1 }, { arm: 'push2', fx: 2 }],
    },
    fade: [['troi', 'nuoc-sang'], ['sang', 'troi']],
    draw(g, p) {
      const SK = ['nuoc-sang', 'troi', 'sang'];
      hero(g, p, {
        build: 'teen', dy: -1, skin: SK, noLegs: true,
        face: { brow: 'cham', eyeK: 'cham-toi', skin: ['trang-xam', 'trang', 'sang'] },
        back(g, b, p) {   // tóc trắng rất dài bay NGƯỢC lên như khói
          const A = p.alt ? [
            '..W...W....',
            '.Ww..Ww.W..',
            '.wwWWwWWw..',
            '.WwwwwWww..',
            'WwAwwAwwW..',
            'WwwAwwwAwW.',
            '.wwwAwwwwwW',
            '.wAwwwwwwwA',
            '.wwwA......',
            '..wA.......',
          ] : [
            '.W...W.....',
            '.wW.Ww..W..',
            '..wWwW.Ww..',
            '.WwwwwWww..',
            'WwAwwAwwW..',
            'WwwAwwwAwW.',
            '.wwwAwwwwwW',
            '.wAwwwwwwwA',
            '.wwwA......',
            '..wA.......',
          ];
          g.ascii(b.hx - 2, b.hy - 7, A);
        },
        noBackArm: true,
        body(g, b, p) {   // thân khăn sương → đuôi mây (không chân)
          const pts = torsoPts(b).concat(spans(b.t1 + 1, [[12, 19], [11, 19], [11, 18], [10, 17], [9, 16]]));
          g.shade(pts, ['nuoc-sang', 'troi', 'sang']);
          g.line(12, b.t0 + 1, 18, b.t0 + 4, 'nuoc-sang');
          const tail = p.alt ? [[8, 13], [7, 10], [6, 8]] : [[8, 14], [6, 11], [5, 7]];
          const y0 = b.t1 + 6;
          tail.forEach(([a, c], j) => { for (let x = a; x <= c; x++) g.set(x, y0 + j, j === 2 ? 'nuoc-sang' : x === a ? 'sang' : 'troi'); });
          g.set(13, y0 - 1, 'nuoc-sang'); g.set(15, y0 + 1, 'troi');
        },
        after(g, b) { g.ascii(b.hx - 1, b.hy - 1, ['.wwwwwwwwA', 'wwAwwwwwA.', 'wA.......', 'wA.......', 'wA.......']); },
        front(g, b, p) {
          const S = b.S;
          const pos = { cup: [S[0], S[1] + 3], push1: [S[0] + 2, S[1] + 1], push2: [S[0] + 4, S[1]], lift: [S[0] + 1, S[1] - 4], down: [S[0], S[1] + 4] };
          const Hd = pos[p.kneel ? 'down' : p.arm] || pos.cup;
          arm(g, [S[0] - 6, S[1]], [Hd[0] - 2, Hd[1] + 1], SK);
          // tinh thể băng xanh đậm
          g.ascii(Hd[0] - 1, Hd[1] - 4, ['.A.', 'vNA', 'vnN', 'vnn', '.v.']);
          arm(g, S, Hd, SK);
          if (p.shard) { const x = p.shard === 1 ? 24 : 27; g.ascii(x, Hd[1] - 2, ['.A', 'Nn', 'v.']); }
          if (p.fx !== undefined) fx(g, 'thuy', p.fx, Hd[0] + 1, Hd[1] - 4);
        },
      });
    },
  };

  // ================================================================ DŨNG SĨ GIÁO ĐỒNG
  const shield = (g, cx, cy) => {        // khiên đồng tròn, hoa văn trống đồng (sao giữa + vành)
    g.ascii(cx - 3, cy - 3, [
      '..DDDo..',
      '.Dooooo.',
      'Doddydoo',
      'DoyYYdoo',
      'Dodyddoo',
      'Dodddooo',
      '.Dooooo.',
      '..oooo..',
    ]);
  };
  T.giaodong = {
    name: 'Dũng Sĩ Giáo Đồng',
    notes: [
      'Dũng Sĩ Giáo Đồng (mã giaodong) — tướng Thường · hành Kim. Quy chuẩn: docs/pixel/QUY-CHUAN.md',
      'Đặc trưng (PROMPT-GEN-LAI.txt:78 · PROMPT-DUNG-XUONG.txt:174): nam ~20 thấp chắc như khối, chân ngắn to, áo VẢY xám thiếc,',
      'xà cạp đồng xỉn; GIÁO đồng rất dài mũi bạc + KHIÊN ĐỒNG tròn ở tay sau (giơ ngang, không che thân).',
    ],
    poses: {
      attack: [{ arm: 'pull' }, { arm: 'aim' }, { arm: 'thrust' }, { arm: 'hold' }],
      cast: [{ arm: 'raise', fx: 0 }, { arm: 'high', fx: 1 }, { arm: 'thrust', fx: 2 }],
    },
    draw(g, p) {
      hero(g, p, {
        build: 'stocky',
        back(g, b) { shield(g, b.B[0] - 2, b.B[1] + 4); },
        backHand: (b) => [b.B[0] - 1, b.B[1] + 4],
        legs: { pant: ['dong-toi', 'dong', 'dong-sang'], pantRows: 5, cuff: 'dong-toi' },
        body(g, b) {
          g.shade(torsoPts(b), M.sat);
          for (let y = b.t0 + 1; y < b.t1 - 1; y++) for (let x = b.wa[0] + 1; x < b.wa[1]; x++) if ((x + (y % 2)) % 2 === 0) g.set(x, y, y % 2 ? 'sat-sang' : 'sat-toi');
          for (let x = b.wa[0]; x <= b.wa[1]; x++) g.set(x, b.t1 - 1, 'dong');
          g.set(15, b.t1 - 1, 'dong-sang');
        },
        hair(g, b) {
          g.ascii(b.hx, b.hy, ['..qqqqq..', '.qqqqqqq.', 'qqqqqqqq.', 'qqq......', 'qq.......', 'qq.......']);
          for (let x = b.hx; x <= b.hx + 8; x++) g.set(x, b.hy + 2, x % 3 ? 'dong' : 'dong-sang');
        },
        face: { fierce: 1 },
        front(g, b, p) {
          const S = b.S;
          const pos = { pull: [S[0] - 1, S[1] + 3], aim: [S[0] + 2, S[1] + 2], thrust: [S[0] + 5, S[1] + 2] };
          const dir = { pull: 'r', aim: 'r', thrust: 'r' };
          pole(g, b, p, { len: 18, back: 7, m: M.go, el: 'kim', reserve: 3,
            hand: (am) => pos[am] || handPos(S, am), dir,
            head(g, tip, d) { bladeHead(g, tip, d, M.bac, 3); const q = [tip[0] - DIR[d][0], tip[1] - DIR[d][1]]; g.set(q[0], q[1], 'son'); } });
        },
      });
    },
  };

  // ================================================================ THẦY CHUÔNG ĐỒNG
  T.chuongdong = {
    name: 'Thầy Chuông Đồng',
    notes: [
      'Thầy Chuông Đồng (mã chuongdong) — tướng Thường · hành Kim. Quy chuẩn: docs/pixel/QUY-CHUAN.md',
      'Đặc trưng (PROMPT-GEN-LAI.txt:79 · PROMPT-DUNG-XUONG.txt:195): cụ ông ~75 lưng còng, ĐẦU HÓI tròn to, áo lễ trắng ngà viền răng cưa đồng,',
      'chân trần; gậy treo CHUÔNG ĐỒNG to hơn đầu, có tua đỏ (⚠ ảnh cũ là chiêng — giữ dáng treo trên gậy). Râu bạc.',
    ],
    poses: {
      attack: [{ arm: 'windup' }, { arm: 'raise' }, { arm: 'hold', ring: 1 }, { arm: 'idle', ring: 2 }],
      cast: [{ arm: 'raise', fx: 0, ring: 1 }, { arm: 'high', fx: 1, ring: 2 }, { arm: 'high', fx: 2, ring: 1 }],
    },
    draw(g, p) {
      hero(g, p, {
        build: 'old',
        face: { old: 1, brow: 'trang', fierce: 0 },
        legs: { pant: M.trang, pantRows: 4 },
        body(g, b) {
          const pts = torsoPts(b).concat(spans(b.t1 + 1, [[12, 19], [11, 19], [11, 19], [11, 20]]));
          g.shade(pts, M.trang);
          zig(g, 11, 20, b.t1 + 3, 'dong', 'dong-sang');
          g.line(13, b.t0, 17, b.t0 + 5, 'trang-xam');   // vạt giao lĩnh
          for (let x = b.wa[0]; x <= b.wa[1]; x++) g.set(x, b.t1 - 1, 'dong');
        },
        hair(g, b) {   // hói: vòng tóc bạc sau gáy, râu bạc dài
          g.set(b.hx + 1, b.hy + 3, 'trang'); g.set(b.hx, b.hy + 3, 'trang'); g.set(b.hx, b.hy + 4, 'trang-xam'); g.set(b.hx, b.hy + 5, 'trang-xam');
          g.set(b.hx + 3, b.hy + 1, 'sang'); g.set(b.hx + 4, b.hy + 1, 'sang');
          g.ascii(b.hx + 4, b.hy + 6, ['.wwwww', '.wwWwx', '..wwx.', '..wx..']);
        },
        after(g, b) { g.set(b.hx + 6, b.hy + 6, 'da-toi'); },
        front(g, b, p) {
          pole(g, b, p, { len: 10, back: 5, m: ['dat-toi', 'dat', 'dat-sang'], el: 'kim', reserve: 8,
            head(g, tip, d) {
              const dd = DIR[d];
              const hk = [tip[0] + 4, tip[1]];
              g.line(tip[0], tip[1], hk[0], hk[1], 'dat'); g.set(tip[0], tip[1] - 1, 'dat-sang');
              const sw = p.ring === 1 ? 1 : p.ring === 2 ? -1 : 0;
              g.ascii(hk[0] - 3 + sw, hk[1] + 1, [
                '...o...',
                '..oDo..',
                '.oDDdo.',
                '.dDddo.',
                '.dDddo.',
                'oDddddo',
                'oyyyyyo',
                '...R...',
                '..RrR..',
              ]);
              if (p.ring) { g.set(hk[0] + 5 + sw, hk[1] + 3, 'sang'); g.set(hk[0] + 6 + sw, hk[1] + 2, 'vang-sang'); g.set(hk[0] - 4 + sw, hk[1] + 3, 'vang-sang'); }
            } });
        },
      });
    },
  };

  // ================================================================ DŨNG SĨ TRE LÀNG
  T.tre = {
    name: 'Dũng Sĩ Tre Làng',
    notes: [
      'Dũng Sĩ Tre Làng (mã tre) — tướng Thường · hành Mộc. Quy chuẩn: docs/pixel/QUY-CHUAN.md',
      'Đặc trưng (PROMPT-GEN-LAI.txt:923 · PROMPT-DUNG-XUONG.txt:216): cậu bé ~11 gầy, bàn chân to, TÓC RỐI DỰNG (không khăn),',
      'áo không tay kem, quần đùi xanh tre, đai vàng, chân trần; TAY CẦM SÀO TRE xanh có NGỌN LÁ, dài gấp 2 người, chĩa chéo lên trước.',
    ],
    poses: {
      idle: [{ arm: 'hold' }, { arm: 'hold', dy: 1 }, { arm: 'hold', alt: 1 }],
      attack: [{ arm: 'pull' }, { arm: 'hold' }, { arm: 'thrust' }, { arm: 'low' }],
      cast: [{ arm: 'raise', fx: 0 }, { arm: 'high', fx: 1 }, { arm: 'thrust', fx: 2 }],
    },
    draw(g, p) {
      hero(g, p, {
        build: 'teen',
        hair: ['q.q.qq.q.', 'qqqqqqqqq', 'qqqqqqqqq', 'qqq.q..q.', 'qq.......', 'qq.......', '.q.......'], hairUp: 1,
        legs: { pant: M.laMa, pantRows: 2, cuff: 'la' },
        body(g, b) {
          g.shade(torsoPts(b), M.trang);
          for (let x = b.wa[0]; x <= b.wa[1]; x++) g.set(x, b.t1, x === 15 ? 'vang-sang' : 'vang-nghe');
        },
        front(g, b, p) {
          const S = b.S;
          const pos = { pull: [S[0] - 1, S[1] + 2], hold: [S[0] + 2, S[1] + 2], thrust: [S[0] + 5, S[1]], low: [S[0] + 3, S[1] + 3] };
          const dir = { pull: 'ur', hold: 'ur', thrust: 'ur', low: 'r' };
          pole(g, b, p, { len: 12, back: 9, m: ['la', 'la-ma', 'la-sang'], el: 'moc', reserve: 3,
            hand: (am) => pos[am] || handPos(S, am), dir,
            head(g, tip, d) {   // ngọn lá tre
              const dd = DIR[d];
              g.set(tip[0] + dd[0], tip[1] + dd[1], 'la-ma');
              g.set(tip[0] - 1, tip[1] - 1, 'la-sang'); g.set(tip[0] - 2, tip[1] - 1, 'la-ma');
              g.set(tip[0] + 1, tip[1] + 1, 'la'); g.set(tip[0] + 2, tip[1] + 1, 'la-ma');
              g.set(tip[0] - 1, tip[1] + 1, 'la-ma'); g.set(tip[0] - 2, tip[1] + 2, 'la');
            } });
        },
      });
    },
  };

  // ================================================================ THỢ SĂN ỐNG THỔI
  T.ongthoi = {
    name: 'Thợ Săn Ống Thổi',
    notes: [
      'Thợ Săn Ống Thổi (mã ongthoi) — tướng Thường · hành Mộc. Quy chuẩn: docs/pixel/QUY-CHUAN.md',
      'Đặc trưng (PROMPT-GEN-LAI.txt:80 · PROMPT-DUNG-XUONG.txt:237): nam vùng cao ~40 thấp đậm, bụng tròn, KHỐ DỆT ĐEN sọc răng cưa trắng,',
      'khăn lưng xanh mòng két, ống tre đựng kim bên hông, tóc dài buộc thấp; ỐNG THỔI tre rất dài cầm NGANG kề môi (⚠ game crossbow).',
    ],
    poses: {
      idle: [{ arm: 'rest' }, { arm: 'rest', dy: 1 }, { arm: 'rest', alt: 1 }],
      attack: [{ arm: 'aim' }, { arm: 'aim', puff: 1 }, { arm: 'aim', dart: 1 }, { arm: 'rest' }],
      cast: [{ arm: 'aim', fx: 0, puff: 1 }, { arm: 'aim', fx: 1, dart: 1 }, { arm: 'aim', fx: 2, dart: 2 }],
    },
    draw(g, p) {
      hero(g, p, {
        build: 'stocky', dy: 1,
        back(g, b) { g.shade(spans(b.hy + 5, [[b.hx - 1, b.hx], [b.hx - 2, b.hx - 1], [b.hx - 2, b.hx - 1], [b.hx - 2, b.hx - 1]]), M.toc); },
        legs: { pantRows: 0 },
        body(g, b) {
          const pts = torsoPts(b).concat(spans(b.t0 + 4, [[b.wa[1] + 1, b.wa[1] + 1], [b.wa[1] + 1, b.wa[1] + 1]]));
          g.shade(pts, M.da);
          g.set(17, b.t0 + 4, 'da-sang'); g.set(18, b.t0 + 5, 'da-sang');
          for (let x = b.wa[0]; x <= b.wa[1]; x++) { g.set(x, b.t1 - 1, 'ngoc'); g.set(x, b.t1, 'khoi'); }
          g.set(b.wa[1] - 2, b.t1 - 1, 'ngoc-sang');
          g.shade(spans(b.t1 + 1, [[13, 17], [13, 17], [14, 16]]), M.den, { noTop: true });
          zig(g, 13, 17, b.t1, 'trang');
          // ống tre đựng kim bên hông
          g.shade(spans(b.t1 - 2, [[10, 11], [10, 11], [10, 11], [10, 11]]), M.rom);
        },
        hair: ['..qqqqq..', '.qqqqqqq.', 'qqqqqqqq.', 'qqq......', 'qq.......', 'qq.......', 'q........'],
        front(g, b, p) {
          const rest = p.arm === 'rest' || p.kneel;
          const BAM = ['la', 'la-ma', 'la-sang'];
          if (rest) {   // nghỉ: ống thổi dựng đứng như gậy
            const Hd = [b.S[0] + 2, b.S[1] + 4];
            shaft(g, Hd, 'up', 16, 3, BAM, false, 0);
            g.set(Hd[0], Hd[1] - 16, 'la-sang');
            arm(g, b.S, Hd, M.da);
            return;
          }
          const y = b.hy + 7;
          const x0 = b.hx + 7, x1 = 29;
          arm(g, [b.S[0] - 3, b.S[1]], [b.S[0] + 1, y + 1], M.da);
          g.line(x0, y, x1, y, (x) => (x % 4 === 0 ? 'la' : 'la-ma'));
          g.line(x0 + 1, y + 1, x1, y + 1, (x) => (x % 4 === 0 ? 'la-toi' : 'la'));
          arm(g, b.S, [b.S[0] + 5, y + 1], M.da);
          if (p.puff) { g.set(b.hx + 6, b.hy + 6, 'da-sang'); g.set(b.hx + 7, b.hy + 6, 'da-sang'); }
          if (p.dart) { g.set(29, y - 2, 'bac'); g.set(28, y - 2, 'sat-sang'); g.set(27, y - 2, 'son-sang'); }
          if (p.fx !== undefined) fx(g, 'moc', p.fx, 24, y - 4);
        },
      });
    },
  };

  // ================================================================ NGƯỜI ĐẮP ĐÊ
  const NON = ['.....c.....', '....cYc....', '...cYccG...', '..cYcccGG..', '.cYccccGGt.', 'GccccccGGGt', '.tttttttt..'];
  T.dapde = {
    name: 'Người Đắp Đê',
    notes: [
      'Người Đắp Đê (mã dapde) — tướng Thường · hành Thổ. Quy chuẩn: docs/pixel/QUY-CHUAN.md',
      'Đặc trưng (PROMPT-GEN-LAI.txt:972 · PROMPT-DUNG-XUONG.txt:258): NỮ nông dân ~40 chắc khoẻ hông rộng, áo nâu bùn, quần chàm xắn ống dính bùn,',
      'sọt đất bên hông — KHÔNG giáp, KHÔNG mũ trụ; cầm XẺNG gỗ bản dẹt (⚠ không giáo/chĩa; game look = axe); NÓN LÁ vàng rơm.',
    ],
    draw(g, p) {
      hero(g, p, {
        build: 'normal',
        backSleeve: [['dat', 'dat-sang', 'cat'], 3],
        legs: { pant: M.cham, pantRows: 4, cuff: 'cham-sang' },
        body(g, b) {
          const pts = torsoPts(b).concat(spans(b.t1 - 1, [[11, 20], [11, 20]]));
          g.shade(pts, ['dat', 'dat-sang', 'cat']);
          g.line(13, b.t0, 16, b.t0 + 3, 'dat');   // vạt áo
          for (let x = 11; x <= 20; x++) g.set(x, b.t1, 'dat-toi');
          g.set(13, b.t1 + 5, 'dat'); g.set(17, b.t1 + 4, 'dat');   // bùn
          g.ascii(8, b.t1 - 3, ['tggt', 'cGcG', 'GcGc', 'cGcG', '.tt.']);   // sọt đất bên hông
        },
        face: { brow: 'khoi' },
        hair(g, b) {
          g.ascii(b.hx - 1, b.hy + 2, ['qqq', 'qq.', 'qq.', 'qq.', '.q.']);   // tóc búi sau gáy
          g.ascii(b.hx - 2, b.hy - 4, NON);
        },
        front(g, b, p) {
          pole(g, b, p, { len: 8, back: 3, m: M.go, el: 'tho', sleeve: [['dat', 'dat-sang', 'cat'], 2],
            reserve: 6, art: { up: { at: [2, 6], rows: ['cccGt', 'cccGt', 'ccGGt', 'cGGGt', 'cGGtt', '.tgt.'] }, ur: { at: [0, 6], rows: ['..ccc.', '.cccGt', 'cccGGt', '.cGGt.', '..Gt..', '.g....', 'g.....'] } } });
        },
      });
    },
  };

  // ================================================================ TRẺ CHĂN TRÂU
  T.chantrau = {
    name: 'Trẻ Chăn Trâu',
    notes: [
      'Trẻ Chăn Trâu (mã chantrau) — tướng Thường · hành Thổ. Quy chuẩn: docs/pixel/QUY-CHUAN.md',
      'Đặc trưng (PROMPT-GEN-LAI.txt:83 · PROMPT-DUNG-XUONG.txt:279): cậu bé ~7, nhỏ nhất đội, cởi trần, quần đùi nâu trâu, KHĂN VÀNG quàng cổ,',
      'sáo trúc giắt lưng, đầu cạo để 3 CHỎM TÓC (trái đào); cầm GẬY CHĂN TRÂU đầu trâu (⚠ DUNG-XUONG ná — GEN-LAI giữ gậy).',
    ],
    draw(g, p) {
      hero(g, p, {
        build: 'child',
        back(g, b, p) {   // đuôi khăn bay sau lưng
          g.ascii(b.B[0] - 3, b.t0 - 1, p.alt ? ['.yyy', 'yYy.', 'y...'] : ['yyy.', '.Yyy', '..y.']);
        },
        legs: { pant: ['dat-toi', 'dat', 'dat-sang'], pantRows: 2 },
        body(g, b) {
          g.shade(torsoPts(b), M.da);
          for (let x = b.wa[0]; x <= b.wa[1]; x++) g.set(x, b.t1, 'dat');
          g.line(12, b.t1 - 2, 15, b.t1 + 1, 'cat'); g.set(12, b.t1 - 2, 'dat-sang');   // sáo trúc
          for (let x = b.sh[0]; x <= b.sh[1]; x++) { g.set(x, b.t0, x < 14 ? 'vang-sang' : 'vang-nghe'); g.set(x, b.t0 + 1, x % 2 ? 'vang-nghe' : 'dong'); }
        },
        face: { brow: 'khoi' },
        hair(g, b) {   // đầu cạo + 3 chỏm
          g.ascii(b.hx + 1, b.hy - 1, ['.qq.....', 'qqq.qq..', 'q...qq..']);
          g.ascii(b.hx, b.hy + 2, ['q.', 'qq', 'q.']);
        },
        front(g, b, p) {
          pole(g, b, p, { len: 7, back: 2, m: M.go, el: 'tho', reserve: 5,
            art: { up: { at: [3, 6], rows: ['w.....w', 'xw...wx', '.xtttx.', '..tgt..', '..gKg..', '..tgt..'] } } });
        },
      });
    },
  };

  // ================================================================ CÔ HÁI SEN
  const LA_SEN = { up: { at: [5, 5], rows: ['..MMmmmmM..', '.Mmmm3mmmm.', 'Mm3mm3mm3m3', '.m33m3m333.', '...323332..'] } };
  T.haisen = {
    name: 'Cô Hái Sen',
    notes: [
      'Cô Hái Sen (mã haisen) — tướng Thường · hành Thủy. Quy chuẩn: docs/pixel/QUY-CHUAN.md',
      'Đặc trưng (PROMPT-GEN-LAI.txt:85 · PROMPT-DUNG-XUONG.txt:321): bé gái ~10 mặt tròn, áo bà ba xanh nước nhạt, quần hồng sen,',
      'hoa sen cài tai, 2 BÍM TÓC ngắn; cầm LÁ SEN to làm ô che đầu + NỤ SEN hồng — không vũ khí.',
    ],
    poses: {
      idle: [{ arm: 'high' }, { arm: 'high', dy: 1 }, { arm: 'high', alt: 1 }],
      attack: [{ arm: 'high' }, { arm: 'raise' }, { arm: 'front', drop: 1 }, { arm: 'raise', drop: 2 }],
      cast: [{ arm: 'high', fx: 0 }, { arm: 'raise', fx: 1 }, { arm: 'front', fx: 2, drop: 1 }],
    },
    draw(g, p) {
      const AO = ['nuoc', 'nuoc-sang', 'troi'];
      hero(g, p, {
        build: 'child',
        backHand: (b) => [b.B[0] - 1, b.B[1] + 3],
        backSleeve: [AO, 3],
        legs: { pant: ['son-sang', 'hong', 'da-sang'], pantRows: 4 },
        body(g, b) {
          g.shade(torsoPts(b), AO);
          for (let y = b.t0 + 1; y <= b.t1; y += 2) g.set(17, y, 'nuoc');   // hàng khuy bà ba
          // nụ sen ở tay sau
          g.ascii(b.B[0] - 2, b.B[1] + 2, ['.p.', 'p1p', '.3.']);
        },
        face: { brow: 'khoi' },
        hair(g, b) {
          g.ascii(b.hx, b.hy, ['..qqqqq..', '.qqqqqqq.', 'qqqqqqqqq', 'qqq....q.', 'qq.......', 'qq.......']);
          g.ascii(b.hx - 1, b.hy + 5, ['qq', 'qK', '.q', '.R']);   // bím tóc
          g.ascii(b.hx + 1, b.hy + 2, ['pW', '1p']);   // hoa sen cài tai
        },
        front(g, b, p) {
          const am = p.kneel ? 'idle' : p.arm;
          const pos = { high: [b.S[0] + 1, b.S[1] - 6], raise: [b.S[0] + 3, b.S[1] - 5], front: [b.S[0] + 4, b.S[1] - 1], idle: [b.S[0] + 2, b.S[1] + 3] };
          const dir = { high: 'up', raise: 'ur', front: 'r', idle: 'up' }[am];
          const Hd = pos[am] || pos.idle;
          const tip = shaft(g, Hd, dir, am === 'high' ? 5 : 3, 1, ['la-toi', 'la', 'la-ma'], false, 4);
          stamp(g, tip, dir, LA_SEN);
          arm(g, b.S, Hd, M.da, [AO, 2]);
          if (p.drop) { const x = p.drop === 1 ? 26 : 28; g.ascii(x, Hd[1] - 1, ['.z', 'Aa', 'an']); }
          if (p.fx !== undefined) fx(g, 'thuy', p.fx, Hd[0] + 2, Hd[1] - 4);
        },
      });
    },
  };

  // ================================================================ CHÀNG ĐỐT NƯƠNG
  T.dotnuong = {
    name: 'Chàng Đốt Nương',
    notes: [
      'Chàng Đốt Nương (mã dotnuong) — tướng Thường · hành Hỏa. Quy chuẩn: docs/pixel/QUY-CHUAN.md',
      'Đặc trưng (PROMPT-GEN-LAI.txt:1140 · PROMPT-DUNG-XUONG.txt:342): nam vùng cao ~16 gầy cao, khố đỏ son gỉ, áo gi-lê xám tro, tóc buộc LÁ XANH;',
      'cầm DAO RỰA cong (tay trước) + ĐUỐC cán dài đang cháy giơ cao (tay sau) — không giáo.',
    ],
    draw(g, p) {
      hero(g, p, {
        build: 'thin',
        back(g, b, p) {   // đuốc tay sau giơ cao
          const h = [b.B[0] - 1, b.B[1] - 4];
          g.line(h[0] + 1, h[1] + 3, h[0] - 1, h[1] - 6, 'dat');
          g.set(h[0], h[1] - 6, 'dat-toi'); g.set(h[0] - 1, h[1] - 7, 'dat-toi');
          const fl = (p.alt || p.k === 'cast') ? ['..L..', '.lLl.', 'lLLLl', 'lLLl.', '.rl..'] : ['.L...', '.lL..', 'lLLl.', 'lLLLl', '.rlr.'];
          g.ascii(h[0] - 3, h[1] - 12, fl);
          arm(g, b.B, h, M.da);
        },
        noBackArm: true,
        legs: { pantRows: 0 },
        body(g, b) {
          g.shade(torsoPts(b), M.da);
          g.shade(torsoPts(b).filter(([x]) => x <= 14 || x >= 18), M.tro);   // gi-lê mở giữa
          for (let x = b.wa[0]; x <= b.wa[1]; x++) g.set(x, b.t1, 'son');
          g.shade(spans(b.t1 + 1, [[13, 16], [13, 16], [14, 15]]), M.son, { noTop: true });
        },
        face: { brow: 'khoi', fierce: 1 },
        hair(g, b) {
          g.ascii(b.hx, b.hy - 2, ['..mM.....', '.3mqq....', '..qqqqq..', '.qqqqqqq.', 'qqqqqqqq.', 'qqq......', 'qq.......', 'qq.......']);
        },
        front(g, b, p) {
          pole(g, b, p, { len: 1, back: 1, m: ['dat-toi', 'dat-toi', 'dat'], el: 'hoa', reserve: 6,
            art: { up: { at: [1, 6], rows: ['...b', '..bS', '.bSs', '.bSs', 'bSs.', '.o..'] }, ur: { at: [0, 5], rows: ['..bbb', '.bSSs', 'bSss.', '.ss..', 'o....'] } } });
        },
      });
    },
  };

  // ================================================================ CÔ THẢ ĐÈN TRỜI
  const DEN = (g, x, y, alt) => g.ascii(x, y, [
    '.oyyyyo.',
    'yYWYyYyo',
    'yYYYyYyo',
    'yYYYyYyo',
    'yYYYyYyo',
    'yYYYyyyo',
    '.oyyyyo.',
    '..o' + (alt ? 'Ll' : 'lL') + 'o..',
  ]);
  T.denroi = {
    name: 'Cô Thả Đèn Trời',
    notes: [
      'Cô Thả Đèn Trời (mã denroi) — tướng Thường · hành Hỏa. Quy chuẩn: docs/pixel/QUY-CHUAN.md',
      'Đặc trưng (PROMPT-GEN-LAI.txt:87 · PROMPT-DUNG-XUONG.txt:363): bé gái ~8 rất thấp, ÁO TỨ THÂN cam, thắt lưng vàng, ruy băng đỏ,',
      '2 BÚI TÓC; hai tay nâng ĐÈN TRỜI giấy vàng to bằng người trên đầu.',
    ],
    poses: {
      idle: [{ arm: 'up' }, { arm: 'up', dy: 1 }, { arm: 'up', alt: 1 }],
      attack: [{ arm: 'up', dy: 1 }, { arm: 'lift' }, { arm: 'lift', fire: 1 }, { arm: 'up', fire: 2 }],
      cast: [{ arm: 'lift', fx: 0 }, { arm: 'lift', fx: 1, alt: 1 }, { arm: 'lift', fx: 2, fire: 1 }],
      kneel: { arm: 'down' },
    },
    draw(g, p) {
      const AO = ['son', 'lua', 'lua-sang'];
      hero(g, p, {
        build: 'child', dy: 1,
        noBackArm: true,
        legs: { pant: AO, pantRows: 3 },
        body(g, b) {
          const pts = torsoPts(b).concat(spans(b.t1 + 1, [[12, 19], [12, 19]]));
          g.shade(pts, AO);
          g.line(14, b.t0, 17, b.t0 + 3, 'son');
          for (let x = b.wa[0]; x <= b.wa[1]; x++) g.set(x, b.t1 - 1, 'vang-nghe');
          g.set(12, b.t1, 'son-sang'); g.set(11, b.t1 + 1, 'son-sang');   // ruy băng đỏ
        },
        face: { brow: 'khoi' },
        hair(g, b) { g.ascii(b.hx, b.hy - 2, ['.qq...qq.', 'qKqq.qqKq', '..qqqqq..', '.qqqqqqq.', 'qqqqqqqqq', 'qqq....q.', 'qq.......', 'qq.......']); g.set(b.hx + 1, b.hy - 2, 'son-sang'); },
        front(g, b, p) {
          if (p.kneel || p.lying) { DEN(g, 21, 21, p.alt); arm(g, b.S, [b.S[0] + 2, b.S[1] + 3], M.da, [AO, 2]); return; }
          const up = p.arm === 'lift' ? 3 : 1;
          const ty = b.hy - 7 - (up - 1);
          DEN(g, b.hx + 1, ty, p.alt);
          arm(g, [b.S[0] + 1, b.S[1]], [b.hx + 9, ty + 6], M.da, [AO, 2]);
          arm(g, b.B, [b.hx - 1, ty + 6], M.da, [AO, 2]);
          if (p.fire) { const x = p.fire === 1 ? 24 : 27; g.ascii(x, ty + 1, ['.L.', 'lLl', '.r.']); }
          if (p.fx !== undefined) fx(g, 'hoa', p.fx, b.hx + 4, ty + 4);
        },
      });
    },
  };

  // ================================================================ THỢ RÈN ĐÔNG SƠN
  T.thoren = {
    name: 'Thợ Rèn Đông Sơn',
    notes: [
      'Thợ Rèn Đông Sơn (mã thoren) — tướng Thường · hành Hỏa. Quy chuẩn: docs/pixel/QUY-CHUAN.md',
      'Đặc trưng (PROMPT-GEN-LAI.txt:1212 · PROMPT-DUNG-XUONG.txt:384): nam ~40 to bè, cẳng tay lớn, bụng to, TẠP DỀ DA nâu sẫm, tay trần,',
      'vòng sắt cổ tay; BÚA TẠ đầu nung ĐỎ RỰC (⚠ không giáo; game look = cleaver); ĐẦU HÓI bóng + RÂU ĐEN rậm.',
    ],
    draw(g, p) {
      hero(g, p, {
        build: 'stocky',
        legs: { pant: ['dat-toi', 'dat', 'dat-sang'], pantRows: 5, feet: M.dat },
        body(g, b) {
          const pts = torsoPts(b).concat(spans(b.t0 + 3, [[b.wa[1] + 1, b.wa[1] + 1], [b.wa[1] + 1, b.wa[1] + 1], [b.wa[1] + 1, b.wa[1] + 1]]));
          g.shade(pts, M.da);
          // tạp dề da: yếm ngực + vạt dài
          g.shade(spans(b.t0 + 1, [[13, 18], [13, 18], [12, 19], [12, 20], [12, 20], [12, 20], [12, 19], [12, 19], [13, 18], [13, 18], [13, 18]]), ['dat-toi', 'dat', 'dat-sang']);
          g.line(13, b.t0, 12, b.t0 - 1, 'dat-toi'); g.line(18, b.t0, 19, b.t0 - 1, 'dat-toi');
          g.set(15, b.t0 + 4, 'dat-toi'); g.set(16, b.t0 + 4, 'dat-toi');
          g.set(b.B[0] - 1, b.B[1] + 4, 'sat-sang'); g.set(b.B[0], b.B[1] + 4, 'sat');
        },
        face: { brow: 'vien', fierce: 1, mouth: false },
        hair(g, b) {   // hói bóng + râu đen rậm + tóc hai bên
          g.set(b.hx + 3, b.hy + 1, 'sang'); g.set(b.hx + 4, b.hy + 1, 'da-sang');
          g.ascii(b.hx, b.hy + 3, ['q.', 'qq', 'qq']);
          g.ascii(b.hx + 3, b.hy + 5, ['qq.....', 'qqqqqqq', 'qqqKqqq', '.qqqqq.', '..qqq..']);
          g.set(b.hx + 6, b.hy + 6, 'son-toi'); g.set(b.hx + 7, b.hy + 6, 'son-toi');
        },
        front(g, b, p) {
          pole(g, b, p, { len: 6, back: 2, m: M.go, el: 'hoa', reserve: 4,
            hand: (am) => (am === 'idle' ? [b.S[0] + 2, b.S[1] + 2] : handPos(b.S, am)), dir: { idle: 'd' },
            art: { up: { at: [2, 5], rows: ['sssss', 'lLLLl', 'llLll', 'rlllr', 'sssss', '..g..'] } } });
          const am = p.kneel ? 'idle' : p.arm;
          const Hd = am === 'idle' ? [b.S[0] + 2, b.S[1] + 2] : handPos(b.S, am);
          g.set(Hd[0] - 1, Hd[1] - 1, 'sat-sang'); g.set(Hd[0] - 1, Hd[1] - 2, 'sat');
        },
      });
    },
  };

  // ================================================================ NGƯ PHỦ SÔNG ĐÀ
  T.nguphu = {
    name: 'Ngư Phủ Sông Đà',
    notes: [
      'Ngư Phủ Sông Đà (mã nguphu) — tướng Thường · hành Thủy. Quy chuẩn: docs/pixel/QUY-CHUAN.md',
      'Đặc trưng (PROMPT-GEN-LAI.txt:220 · PROMPT-DUNG-XUONG.txt:405): nam ~45 gầy gân, gối hơi khuỵu — HAI CHÂN NGƯỜI (không đuôi cá),',
      'áo xanh sông, quần chàm phai xắn, giỏ tre bên hông; CHĨA BA xiên cá; LƯỚI vắt vai như áo choàng + PHAO CAM.',
    ],
    draw(g, p) {
      const AO = ['cham-toi', 'ngoc', 'ngoc-sang'];
      hero(g, p, {
        build: 'normal', dy: 1,
        back(g, b, p) {   // lưới vắt vai rủ sau lưng
          const w = p.alt ? 1 : 0;
          const pts = spans(b.t0 - 1, [[10, 13], [8, 13], [7, 13], [7, 12], [7 - w, 12], [7 - w, 12], [7 - w, 11], [8 - w, 11], [8 - w, 10]]);
          pts.forEach(([x, y]) => g.set(x, y, (x + y) % 2 ? 'trang-xam' : ((x % 2) ? 'dat-sang' : null)));
          g.set(7 - w, b.t0 + 3, 'lua'); g.set(8 - w, b.t0 + 7, 'lua'); g.set(9, b.t0 + 1, 'lua-sang');
        },
        backSleeve: [AO, 3],
        legs: { pant: ['cham', 'cham-sang', 'nuoc-sang'], pantRows: 4, cuff: 'cham-sang' },
        body(g, b) {
          g.shade(torsoPts(b), AO);
          g.line(12, b.t0, 19, b.t0 + 6, 'trang-xam');   // dây lưới chéo ngực
          g.set(15, b.t0 + 3, 'lua');
          for (let x = b.wa[0]; x <= b.wa[1]; x++) g.set(x, b.t1, 'dat');
          g.ascii(9, b.t1 - 2, ['.tt.', 'cGcG', 'GcGc', '.cG.']);   // giỏ tre
        },
        face: { old: 1, brow: 'khoi' },
        hair(g, b) {
          g.ascii(b.hx - 1, b.hy - 1, ['...rRRR...', '..RR1RRRr.', '.qqqqqqqq.', '.qqqqqqqq.', '.qqq......', '.qq.......']);   // khăn vấn đỏ nâu
          g.ascii(b.hx + 5, b.hy + 7, ['qq', '.q']);   // râu thưa
        },
        front(g, b, p) {
          pole(g, b, p, { len: 10, back: 4, m: M.go, el: 'thuy', reserve: 3, sleeve: [AO, 2],
            art: { up: { at: [2, 4], rows: ['b.b.b', 'S.S.S', 'sSSSs', '..s..'] }, ur: { at: [0, 4], rows: ['.b.b.', 'b.S..', '.SSb.', 'sS...', 's....'] } } });
        },
      });
    },
  };

  // ================================================================ THỢ GỐM PHÙ LÃNG
  const BINH = (g, x, y) => g.ascii(x, y, ['..nn..', '.vNNv.', 'nNANnv', 'nNNnnv', 'vnnnvv', '.vvvv.']);
  T.thogom = {
    name: 'Thợ Gốm Phù Lãng',
    notes: [
      'Thợ Gốm Phù Lãng (mã thogom) — tướng Thường · hành Thổ. Quy chuẩn: docs/pixel/QUY-CHUAN.md',
      'Đặc trưng (PROMPT-GEN-LAI.txt:90 · PROMPT-DUNG-XUONG.txt:426): nữ ~18 dáng vừa, TẠP DỀ KEM CÁT trên áo nâu đất, KHĂN NÂU THẮT NÚT;',
      'cầm BÌNH GỐM tròn MEN LAM giơ trên đầu sắp ném.',
    ],
    poses: {
      idle: [{ arm: 'hold' }, { arm: 'hold', dy: 1 }, { arm: 'hold', alt: 1 }],
      attack: [{ arm: 'over' }, { arm: 'over', dy: 1 }, { arm: 'throw', fly: 1 }, { arm: 'after', fly: 2 }],
      cast: [{ arm: 'over', fx: 0 }, { arm: 'over', fx: 1 }, { arm: 'throw', fx: 2, fly: 1 }],
    },
    draw(g, p) {
      const AO = ['dat-toi', 'dat', 'dat-sang'];
      hero(g, p, {
        build: 'normal',
        backSleeve: [AO, 3],
        legs: { pant: AO, pantRows: 5 },
        body(g, b) {
          const pts = torsoPts(b).concat(spans(b.t1 + 1, [[12, 19], [12, 19]]));
          g.shade(pts, AO);
          g.shade(spans(b.t0 + 2, [[13, 18], [13, 18], [13, 18], [13, 18], [12, 19], [12, 19], [12, 19], [12, 19]]), ['dat-sang', 'cat', 'vang-sang']);
          g.line(13, b.t0 + 2, 12, b.t0, 'cat'); g.line(18, b.t0 + 2, 19, b.t0, 'cat');
          g.set(15, b.t1 + 1, 'dat-sang');
        },
        face: { brow: 'khoi' },
        hair(g, b) {
          g.ascii(b.hx - 1, b.hy - 1, ['...gGGg...', '..gGGGGgg.', '.gGGgggggt', '.qqqqqqqq.', '.qq.......', '.qq.......', '..q.......']);
          g.ascii(b.hx + 6, b.hy - 3, ['g.g', '.t.']);   // nút khăn
        },
        front(g, b, p) {
          const S = b.S;
          const pos = { hold: [S[0] + 2, S[1] + 2], over: [S[0] + 2, b.hy - 2], throw: [S[0] + 5, S[1] - 1], after: [S[0] + 4, S[1] + 3], down: [S[0] + 2, S[1] + 5] };
          const Hd = pos[p.kneel ? 'down' : p.arm] || pos.hold;
          if (p.kneel) BINH(g, 21, 24);
          else if (p.arm === 'hold') BINH(g, Hd[0], Hd[1] - 4);
          else if (p.arm === 'over') BINH(g, Hd[0] - 5, Hd[1] - 5);
          if (p.fly) BINH(g, p.fly === 1 ? 24 : 25, p.fly === 1 ? 5 : 8);
          arm(g, S, Hd, M.da, [AO, 2]);
          if (p.fx !== undefined) fx(g, 'tho', p.fx, 24, 8);
        },
      });
    },
  };

  // ================================================================ THẦY LANG LÁ THUỐC
  T.thaylang = {
    name: 'Thầy Lang Lá Thuốc',
    notes: [
      'Thầy Lang Lá Thuốc (mã thaylang) — tướng Thường · hành Mộc. Quy chuẩn: docs/pixel/QUY-CHUAN.md',
      'Đặc trưng (PROMPT-GEN-LAI.txt:91 · PROMPT-DUNG-XUONG.txt:448): cụ ông ~70 còng, gầy xương, áo xanh xám lá, quần xắn, túi thuốc,',
      'hoa thuốc tím; GẬY CHỐNG cong; GÙI TRE sau lưng đầy LÁ THUỐC nhô quá đầu (⚠ game look = staff + orb — giữ gậy chống, không cầu phép).',
    ],
    poses: {
      attack: [{ arm: 'windup' }, { arm: 'raise' }, { arm: 'strike', puff: 1 }, { arm: 'follow', puff: 2 }],
    },
    draw(g, p) {
      const AO = ['reu', 'reu-sang', 'la-sang'];
      hero(g, p, {
        build: 'old',
        back(g, b, p) {   // gùi tre + lá thuốc nhô quá đầu
          const x = b.B[0] - 4, y = b.t0 - 2;
          g.ascii(x - 1, y - 9 + (p.alt ? 1 : 0), ['..M..m.', '.mMm3Mm', 'm3mMm3.', '.3mP3m.', 'm33mJ3m', '.3m3m3.']);
          g.ascii(x, y - 3, ['tgggggt', 'GcGcGcG', 'cGcGcGc', 'GcGcGcG', 'cGcGcGc', 'GcGcGcG', 'cGcGcGt', '.tgggt.']);
        },
        backSleeve: [AO, 3],
        legs: { pant: AO, pantRows: 3, cuff: 'reu' },
        body(g, b) {
          g.shade(torsoPts(b), AO);
          g.line(13, b.t0, 17, b.t0 + 4, 'reu');
          g.set(12, b.t0, 'dat'); g.set(12, b.t0 + 1, 'dat');   // quai gùi
          g.ascii(17, b.t1 - 1, ['tgt', 'GcG', '.g.']);   // túi thuốc
          g.set(19, b.t1 - 2, 'tim-sang'); g.set(20, b.t1 - 3, 'tim');
        },
        face: { old: 1, brow: 'trang' },
        hair(g, b) {
          g.ascii(b.hx, b.hy, ['..wwww...', '.wwwwww..', 'wwwx.....', 'ww.......', 'wx.......']);
          g.ascii(b.hx + 4, b.hy + 6, ['.wwww', '..wwx', '..wx.']);
        },
        front(g, b, p) {
          pole(g, b, p, { len: 5, back: 6, m: ['dat-toi', 'dat', 'dat-sang'], el: 'moc', reserve: 4, sleeve: [AO, 2],
            art: { up: { at: [1, 3], rows: ['.tg', 't.G', 't..'] } } });
          if (p.puff) g.ascii(p.puff === 1 ? 26 : 27, 14, ['.m', 'mM', 'J.']);
        },
      });
    },
  };

  // chân dung: góc cắt 16×16 quanh đầu (hx-3, hy-4) + chỉnh riêng
  const PC = {"lactuong": ["stocky", 0, 0, -1], "lucsi": ["huge", 0, 0, 0], "xathu": ["thin", 0, 0, -1], "thosan": ["normal", 1, 0, -1], "thaymo": ["thin", 0, 0, 0], "thansuong": ["teen", -1, 0, 0], "giaodong": ["stocky", 0, 0, 0], "chuongdong": ["old", 0, 0, 0], "tre": ["teen", 0, 0, 0], "ongthoi": ["stocky", 1, 0, 0], "dapde": ["normal", 0, 0, -1], "chantrau": ["child", 0, 0, 0], "haisen": ["child", 0, 0, 0], "dotnuong": ["thin", 0, 0, -1], "denroi": ["child", 1, 0, 0], "thoren": ["stocky", 0, 0, 0], "nguphu": ["normal", 1, 0, 0], "thogom": ["normal", 0, 0, -1], "thaylang": ["old", 0, -1, 0]};
  for (const [k, [kind, dy, ddx, ddy]] of Object.entries(PC)) { const b = build(kind, dy); T[k].portrait = { x: b.hx - 3 + ddx, y: b.hy - 3 + ddy }; }
  return T;
};
