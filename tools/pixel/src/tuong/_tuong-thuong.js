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
    b.arm = o.armFn || arm;
    if (!o.noBackArm) b.arm(g, b.B, o.backHand ? o.backHand(b, p) : [b.B[0] - 1, b.B[1] + 5], skin, o.backSleeve);
    if (o.boneLegs) boneLegs(g, b, p, o.boneLegs);
    else if (!o.noLegs) legs(g, b, { skin, kneel: p.kneel, ...(o.legs || {}) });
    if (o.body) o.body(g, b, p);
    if (o.headFn) o.headFn(g, b, p);
    else head(g, { hx: b.hx, hy: b.hy, skin: o.face && o.face.skin || skin, eyes: p.eyes, child: b.child, ...(o.face || {}) });
    if (o.hair) { if (typeof o.hair === 'function') o.hair(g, b, p); else g.ascii(b.hx, b.hy - (o.hairUp || 0), HAIR[o.hair] || o.hair); }
    if (o.after) o.after(g, b, p);
    if (!p.lying && o.front) o.front(g, b, p);
    return b;
  }
  // tay xương 1 điểm (bộ xương): vai → khuỷu → bàn tay
  function boneArm(g, S, Hd, skin, sleeve) {
    const c = (skin && skin[1]) || 'trang-xam';
    const pts = linePts(S[0], S[1], Hd[0], Hd[1]);
    pts.forEach(([x, y], i) => g.set(x, y, sleeve && i < sleeve[1] ? sleeve[0][1] : c));
    const m = pts[pts.length >> 1]; g.set(m[0], m[1], 'trang');
    g.set(Hd[0], Hd[1], 'trang'); g.set(Hd[0] + 1, Hd[1], c); g.set(Hd[0], Hd[1] + 1, c);
  }
  // chân xương: ống chân 1 điểm + khớp gối + bàn chân 2 điểm
  function boneLegs(g, b, p, c = 'trang-xam') {
    const top = b.t1 + 1, foot = b.foot;
    for (const x of [13, 17]) {
      const y0 = p.kneel ? Math.max(top, foot - 2) : top;
      for (let y = y0; y < foot; y++) g.set(x, y, c);
      if (!p.kneel) g.set(x, Math.round((top + foot) / 2), 'trang');
      g.set(x, foot, 'trang'); g.set(x + 1, foot, c);
    }
  }
  // vũ khí cán dài cầm tay trước (dáng theo p.arm; quỳ = chống vũ khí)
  function pole(g, b, p, o) {
    const am = p.kneel ? 'idle' : p.arm;
    const Hd = o.hand ? o.hand(am) : handPos(b.S, am), dir = (o.dir && o.dir[am]) || WDIR[am];
    const tip = shaft(g, Hd, dir, o.len, o.back ?? 2, o.m || M.go, o.thick, o.reserve ?? 4);
    if (o.art) stamp(g, tip, dir, o.art);
    if (o.head) o.head(g, tip, dir);
    b.arm(g, b.S, Hd, b.skin, o.sleeve);
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
    if (!p.kneel) b.arm(g, [b.S[0] - 2, b.S[1]], sp, b.skin, o.sleeve);
    b.arm(g, b.S, Hd, b.skin, o.sleeve);
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
      'Đặc trưng (PROMPT-GEN-LAI.txt:72 · PROMPT-DUNG-XUONG.txt:47): giáp ngực ĐỒNG sọc răng cưa, khố xanh gỉ đồng, khoá đai mặt trời,',
      'MŨ LÔNG CHIM LẠC trắng hình quạt; cầm RÌU XÉO Đông Sơn. PHÁ CÁCH (DANH-SACH): GIÁP ĐỒNG RỖNG — hồn tướng Lạc, bộ giáp + khố',
      'không có người bên trong, trong mũ chỉ có 2 đốm mắt xanh gỉ đồng; tay / ống chân là giáp đồng rời, khe hở đen giữa các mảnh.',
      'Màu hành Kim (góp ý tester): mảnh giáp + mũ ánh BẠC-SẮT, viền / răng cưa / khoá đai bằng đồng; mũ có mặt nạ bạc 2 hốc mắt + khe miệng',
      '(khác mặt tối trùm mũ của Thợ Săn / Thợ Rèn).',
    ],
    fade: [['bac', 'sat-sang'], ['sat-sang', 'sat'], ['ngoc-sang', 'ngoc']],
    hurtSwap: [['ngoc-sang', 'sang']],
    draw(g, p) {
      const GI = ['sat', 'sat-sang', 'bac'];
      hero(g, p, {
        build: 'stocky', skin: GI,
        back(g, b, p) {   // mũ lông chim Lạc: quạt lông trắng
          const { hx, hy } = b;
          const top = [hx + 4, hy + 2];
          const tips = [[hx - 3, hy - 2], [hx - 2, hy - 4], [hx, hy - 6], [hx + 2, hy - 7], [hx + 4, hy - 7], [hx + 6, hy - 6], [hx + 8, hy - 4]];
          tips.forEach((t, i) => { const tt = p.alt && i % 2 ? add(t, [0, 1]) : t; g.line(top[0], top[1], tt[0], tt[1], i % 2 ? 'trang' : 'sang'); g.set(tt[0], tt[1], 'trang-xam'); });
          tips.forEach((t, i) => { if (i < tips.length - 1) { const m = linePts(top[0], top[1], t[0], t[1]); const q = m[m.length - 2]; g.set(q[0] + 1, q[1], 'trang-xam'); } });
        },
        legs: { pant: M.den, pantRows: 2, cuff: 'dong-sang' },
        body(g, b) {
          g.shade(torsoPts(b), GI);
          for (let x = b.sh[0]; x <= b.sh[1]; x++) g.set(x, b.t0, x % 2 ? 'dong-sang' : 'dong');   // viền vai đồng
          zig(g, b.sh[0] + 1, b.sh[1] - 1, b.t0 + 2, 'dong');
          for (let x = b.wa[0]; x <= b.wa[1]; x++) g.set(x, b.t1 - 1, 'dong-toi');
          g.set(15, b.t1 - 1, 'vang-nghe'); g.set(16, b.t1 - 1, 'vang-sang'); g.set(15, b.t1 - 2, 'vang-nghe'); g.set(16, b.t1, 'vang-nghe');
          for (let x = b.wa[0]; x <= b.wa[1]; x++) g.set(x, b.t1, x < 14 ? 'ngoc-sang' : 'ngoc');
          khoFlap(g, b, ['la-toi', 'ngoc', 'ngoc-sang'], 4);
          // khe hở đen: cổ + nách (giáp rỗng)
          for (let x = b.hx + 3; x <= b.hx + 6; x++) g.set(x, b.t0, 'khoi');
          g.set(b.sh[0], b.t0 + 1, 'khoi'); g.set(b.sh[1], b.t0 + 1, 'khoi');
        },
        headFn(g, b, p) {   // mũ đồng rỗng, bên trong tối, 2 đốm mắt gỉ xanh
          const { hx, hy } = b;
          g.ascii(hx, hy, [
            '..bbbSS..',
            '.bbSSSSSs',
            'bSDdDdDds',
            'bSbbbbbbs',
            'bSbqqbqqs',
            'bSbbbbbbs',
            'bSSSqqqSs',
            '.SSSSSSSs',
            '..sssss..',
          ]);
          if (p.eyes === 'closed') { g.set(hx + 4, hy + 4, 'ngoc'); g.set(hx + 7, hy + 4, 'ngoc'); }
          else { g.set(hx + 4, hy + 4, 'ngoc-sang'); g.set(hx + 7, hy + 4, 'ngoc-sang'); }
        },
        front(g, b, p) { pole(g, b, p, { len: 7, back: 2, m: M.go, el: 'kim', reserve: 6, art: AXE }); },
      });
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
      'Đặc trưng (PROMPT-GEN-LAI.txt:73 · PROMPT-DUNG-XUONG.txt:68): khổng lồ vai cực rộng, khố vàng đất, vòng đồng cổ tay; TAY KHÔNG',
      'vác / ném TẢNG ĐÁ xám to hơn đầu (⚠ game look = cleaver — theo prompt vẽ tảng đá). PHÁ CÁCH (DANH-SACH): NGƯỜI ĐẤT SÉT —',
      'khổng lồ đất sét nâu đỏ nứt nẻ, cỏ dại mọc trên vai và đầu, vụn đất rơi khi bước.',
    ],
    poses: {
      idle: [{ arm: 'shoulder' }, { arm: 'shoulder', dy: 1, crumb: 1 }, { arm: 'shoulder', alt: 1, crumb: 2 }],
      attack: [{ arm: 'over', rock: 1 }, { arm: 'over2', rock: 1 }, { arm: 'throw', fly: 1, crumb: 1 }, { arm: 'after', crumb: 2 }],
      cast: [{ arm: 'over', rock: 2, fx: 0 }, { arm: 'over2', rock: 2, fx: 1 }, { arm: 'throw', fly: 2, fx: 2 }],
    },
    fade: [['dong', 'dong-toi'], ['dong-sang', 'dong']],
    draw(g, p) {
      const SK = ['dong-toi', 'dong', 'dong-sang'];   // tuong-pixel-ro: đất sét VÀNG ĐẤT nung (màu Thổ; khác nâu bùn Đắp Đê / tò he hồng)
      const CRACK = [[12, 2], [13, 3], [13, 4], [18, 1], [19, 2], [17, 5], [18, 6], [11, 6], [16, 8]];
      hero(g, p, {
        build: 'huge', skin: SK,
        face: { fierce: 1, eyeW: 'vang-sang', eyeK: 'vien', brow: 'dong-toi' },
        backHand: (b, p) => (p.arm === 'over' || p.arm === 'over2' ? [b.B[0] + 3, b.B[1] - 6] : [b.B[0] - 1, b.B[1] + 7]),
        legs: { pantRows: 0 },
        body(g, b, p) {
          g.shade(torsoPts(b), SK);
          CRACK.forEach(([dx, dy]) => g.set(dx, b.t0 + dy, 'dong-toi'));
          for (let x = 11; x <= 20; x++) if (x !== 15 && x !== 16 && x % 3) g.set(x, b.t0 + 3, 'dong-toi');
          // cỏ dại trên vai
          g.ascii(b.sh[0] + 1, b.t0 - 2, ['m.M', 'm3m']); g.ascii(b.sh[1] - 4, b.t0 - 1, ['.M.m', '3m3.']);
          // khố vàng đất
          for (let x = b.wa[0]; x <= b.wa[1]; x++) { g.set(x, b.t1, 'son-sang'); g.set(x, b.t1 - 1, x % 3 ? 'son' : 'son-toi'); }
          g.shade(spans(b.t1 + 1, [[14, 17], [14, 17], [15, 16]]), ['son-toi', 'son', 'son-sang'], { noTop: true });
          g.set(b.B[0] - 1, b.B[1] + 3, 'dong-sang'); g.set(b.B[0], b.B[1] + 3, 'dong');
          // vụn đất rơi
          if (p.crumb === 1) { g.set(9, 27, 'dat'); g.set(22, 25, 'dat-sang'); }
          if (p.crumb === 2) { g.set(9, 29, 'dat'); g.set(23, 28, 'dat-sang'); }
        },
        after(g, b) {   // cỏ trên đầu + vết nứt trán
          g.ascii(b.hx + 2, b.hy - 2, ['.M.m.', 'm3m3M']);
          g.set(b.hx + 3, b.hy + 1, 'dong-toi'); g.set(b.hx + 4, b.hy + 2, 'dong-toi');
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
      'Đặc trưng (PROMPT-GEN-LAI.txt:657 · PROMPT-DUNG-XUONG.txt:90): gầy cao, áo quấn xám bạc, xà cạp xanh thép, quấn tay đỏ; CUNG gỗ dài',
      'cao hơn người, tên lắp sẵn (⚠ game look = crossbow — theo GEN-LAI vẽ cung); lông chim dài trên đầu, ống tên sau lưng.',
      'PHÁ CÁCH (DANH-SACH): NGƯỜI-CHIM LẠC — đầu chim Lạc mỏ dài, cánh tay phủ lông xám bạc, thân người gầy cao, chân chim.',
    ],
    poses: BOWP,
    draw(g, p) {
      const LONG = ['sat', 'sat-sang', 'bac'];
      hero(g, p, {
        build: 'thin', skin: LONG,
        back(g, b) {   // ống tên sau lưng
          g.shade(spans(b.t0 - 2, [[9, 10], [9, 10], [9, 11], [9, 11], [10, 11], [10, 11], [10, 11], [10, 11]]), M.dat);
          g.set(9, b.t0 - 3, 'trang'); g.set(10, b.t0 - 4, 'trang'); g.set(8, b.t0 - 3, 'son-sang');
        },
        legs: { pant: ['cham', 'cham-sang', 'sat-sang'], pantRows: 5, feet: ['dong', 'vang-nghe', 'vang-sang'] },
        body(g, b) {
          g.shade(torsoPts(b), ['cham-toi', 'cham', 'cham-sang']);   // tuong-pixel-ro: áo quấn XANH THÉP + dây đeo đỏ chéo — khác giáp bạc Lạc Tướng
          g.line(b.sh[0] + 1, b.t0, b.wa[1], b.t0 + 5, 'son-sang'); g.line(b.sh[0] + 1, b.t0 + 1, b.wa[1] - 1, b.t0 + 5, 'son');
          for (let x = b.wa[0]; x <= b.wa[1]; x++) g.set(x, b.t1, 'son');
          g.set(15, b.t1, 'son-sang');
          // lông rủ ở vai (cánh tay lông)
          g.set(b.B[0] - 1, b.B[1] + 2, 'bac'); g.set(b.B[0] - 1, b.B[1] + 4, 'sat-sang');
        },
        headFn(g, b, p) {   // đầu chim Lạc mỏ dài + mào lông dài
          const { hx, hy } = b;
          g.ascii(hx, hy, [
            '..iiis.......',
            '.isssss......',
            'isssssbs.....',
            'isbbbbbbs....',
            'isbbbbbbYyy..',
            '.isbbbbYYYYYy',
            '.iisbbbddddo.',
            '..iisbb......',
            '...ss........',
          ]);
          if (p.eyes === 'closed') { g.set(hx + 5, hy + 3, 'sat-toi'); g.set(hx + 6, hy + 3, 'sat-toi'); }
          else { g.set(hx + 5, hy + 3, 'sang'); g.set(hx + 6, hy + 3, 'vien'); g.set(hx + 5, hy + 2, 'sat-toi'); }
          const w = p.alt ? 1 : 0;   // lông chim dài dựng sau đầu
          g.line(hx + 2, hy, hx - 1 - w, hy - 7 + w, 'trang'); g.set(hx - 1 - w, hy - 7 + w, 'son-sang'); g.set(hx + 1, hy - 1, 'son');
          g.line(hx + 4, hy, hx + 3, hy - 3, 'sat-sang');
        },
        front(g, b, p) { bow(g, b, p, { half: 11, wrap: 'son-sang', el: 'kim', fletch: 'trang' }); this.headFn(g, b, p); },
      });
    },
  };

  // ================================================================ THỢ SĂN RỪNG
  T.thosan = {
    name: 'Thợ Săn Rừng',
    notes: [
      'Thợ Săn Rừng (mã thosan) — tướng Thường · hành Mộc. Quy chuẩn: docs/pixel/QUY-CHUAN.md',
      'Đặc trưng (PROMPT-GEN-LAI.txt:74 · PROMPT-DUNG-XUONG.txt:111): khom thấp, áo choàng MŨ TRÙM vá lá xanh rêu + nâu lá, mũ có 2 TAI BÁO,',
      'MẮT CAM sáng; CUNG + ống tên (⚠ DUNG-XUONG hai dao — GEN-LAI giữ cung). PHÁ CÁCH (DANH-SACH): MA CÂY — thân gỗ mục phủ rêu,',
      'mặt là HỐC CÂY tối có 2 mắt cam phát sáng, mũ trùm lá + tai báo, chân như rễ.',
    ],
    poses: BOWP,
    hurtSwap: [['lua-sang', 'sang']],
    fade: [['lua-sang', 'lua'], ['reu', 'reu-toi']],
    draw(g, p) {
      const R = ['reu-toi', 'reu', 'reu-sang'];
      const GO = ['dat-toi', 'dat', 'dat-sang'];
      hero(g, p, {
        build: 'normal', dy: 1, skin: GO,
        back(g, b, p) {   // áo choàng lá sau lưng
          g.shade(spans(b.t0 - 1, [[9, 12], [8, 12], [8, 12], [8, 12], [8, 12], [7, 12], [7, 12], [7, 12], [7, 11], p.alt ? [8, 11] : [7, 10]]), R);
          g.set(9, b.t0 + 3, 'dat'); g.set(8, b.t0 + 6, 'dat-sang'); g.set(10, b.t0 + 7, 'la-ma');
          g.set(11, b.t0 - 3, 'trang'); g.set(12, b.t0 - 3, 'trang-xam'); g.line(11, b.t0 - 2, 11, b.t0 + 3, 'dat');
        },
        legs: { pant: GO, pantRows: 99, feet: ['dat-toi', 'dat', 'reu'] },
        body(g, b) {
          g.shade(torsoPts(b), GO);
          for (let y = b.t0 + 1; y <= b.t1; y += 2) g.set(14, y, 'dat-toi');   // thớ gỗ
          g.set(17, b.t0 + 2, 'dat-toi'); g.set(17, b.t0 + 3, 'dat-toi');
          g.ascii(12, b.t0 + 4, ['uU..', 'eu.u', '..ue']);   // rêu phủ
          g.set(18, b.t1 - 1, 'reu'); g.set(19, b.t1 - 2, 'reu-sang');
          // rễ ở bàn chân
          g.set(11, b.foot, 'dat-toi'); g.set(20, b.foot, 'dat-toi');
        },
        headFn(g, b, p) {   // mặt hốc cây + mũ trùm lá tai báo
          const { hx, hy } = b;
          g.shade(spans(hy, [[2, 6], [1, 7], [0, 8], [0, 8], [0, 8], [0, 8], [0, 8], [1, 8], [2, 7]].map(([a, c]) => [hx + a, hx + c])), GO);
          g.ascii(hx + 3, hy + 3, ['gqqqqq', 'qqqqqqq', 'qqqqqqq', 'gqqqqqg', '.gqqqg.']);
          if (p.eyes === 'closed') { g.set(hx + 5, hy + 5, 'lua'); g.set(hx + 8, hy + 5, 'lua'); }
          else { g.set(hx + 4, hy + 4, 'lua'); g.set(hx + 5, hy + 4, 'lua-sang'); g.set(hx + 7, hy + 4, 'lua'); g.set(hx + 8, hy + 4, 'lua-sang'); }
          g.ascii(hx - 1, hy - 3, [
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
          g.set(hx + 3, hy, 'dat'); g.set(hx + 6, hy, 'la-ma');
          g.set(hx + 5, hy - 2, 'dat'); g.set(hx + 6, hy - 2, 'dat-sang');
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
      'Đặc trưng (PROMPT-GEN-LAI.txt:75 · PROMPT-DUNG-XUONG.txt:132): cao gầy, áo TÍM MẬN viền LỬA CAM, chuỗi hạt; gậy đầu HỒ LÔ lửa cháy;',
      'VÒNG LÔNG đỏ-đen + xương quanh đầu như bánh xe lửa. PHÁ CÁCH (DANH-SACH): BỘ XƯƠNG đội vòng mũ lông chim đỏ-đen,',
      'áo tím mận rách tả tơi hở xương sườn, LỬA CAM trong hốc mắt; gậy xương đầu hồ lô lửa.',
    ],
    poses: { cast: [{ arm: 'raise', fx: 0 }, { arm: 'high', fx: 1 }, { arm: 'front', fx: 2 }] },
    hurtSwap: [['lua-sang', 'sang'], ['trang', 'sang']],
    fade: [['lua-sang', 'toi'], ['lua', 'toi'], ['trang', 'trang-xam']],
    draw(g, p) {
      const XUONG = ['trang-xam', 'trang-xam', 'trang'];
      hero(g, p, {
        build: 'thin', skin: XUONG, armFn: boneArm, boneLegs: 'trang-xam',
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
        backSleeve: [M.tim, 3],
        body(g, b) {   // áo tím mận rách, hở xương sườn
          const pts = torsoPts(b).concat(spans(b.t1 + 1, [[12, 18], [12, 18], [12, 19], [11, 19]]));
          g.shade(pts, M.tim);
          for (let x = 11; x <= 19; x += 2) { g.clr(x, b.t1 + 4); g.set(x + 1, b.t1 + 4, 'lua'); }   // gấu rách
          g.clr(12, b.t1 + 3); g.clr(18, b.t1 + 2);
          for (let y = b.t0 + 1; y <= b.t1 - 1; y++) g.set(16, y, 'trang-xam');   // xương sống / ngực hở
          for (let y = b.t0 + 2; y <= b.t1 - 2; y += 2) { g.set(15, y, 'trang'); g.set(17, y, 'trang'); g.set(14, y, 'trang-xam'); g.set(18, y, 'trang-xam'); }
          for (let y = b.t0 + 1; y <= b.t1 - 1; y++) { g.set(13, y, 'lua'); g.set(19, y, 'lua'); }   // viền lửa cam
          for (let x = b.sh[0] + 1; x <= b.sh[1] - 1; x++) g.set(x, b.t0, x % 2 ? 'trang' : 'dat-sang');   // chuỗi hạt + xương
        },
        headFn(g, b, p) {   // sọ người, lửa cam trong hốc mắt
          const { hx, hy } = b;
          g.ascii(hx, hy, [
            '..xwwwx..',
            '.xwwWWwx.',
            'xwwwwwwwx',
            'xwwwwwwwx',
            'xwwKKwKKx',
            'xwwKKwKKx',
            '.xwwwKwwx',
            '..wKwKwK.',
            '..xwwwwx.',
          ]);
          if (p.eyes !== 'closed') { g.set(hx + 4, hy + 5, 'lua-sang'); g.set(hx + 7, hy + 5, 'lua-sang'); g.set(hx + 4, hy + 4, 'lua'); g.set(hx + 7, hy + 4, 'lua'); }
        },
        front(g, b, p) {
          pole(g, b, p, { len: 8, back: 6, m: ['trang-xam', 'trang-xam', 'trang'], el: 'hoa', sleeve: [M.tim, 2], reserve: 4,
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
      'PHÁ CÁCH (DANH-SACH): HỒN SƯƠNG — mặt là MẶT NẠ BĂNG trắng không biểu cảm (2 khe mắt, không miệng), thân sương mờ đục.',
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
        face: { noBrow: 1, mouth: false, eyeW: 'cham-toi', eyeK: 'cham-toi', skin: ['troi', 'trang', 'sang'] },
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
      'Đặc trưng (PROMPT-GEN-LAI.txt:78 · PROMPT-DUNG-XUONG.txt:174): thấp chắc như khối, chân ngắn to, áo VẢY xám thiếc, xà cạp đồng xỉn;',
      'GIÁO đồng rất dài mũi bạc + KHIÊN ĐỒNG tròn ở tay sau (giơ ngang, không che thân). PHÁ CÁCH (DANH-SACH): NGƯỜI TÊ TÊ —',
      'đầu + giáp vảy tê tê (con trút) xám thiếc tự nhiên, mõm dài nhọn, đứng 2 chân, đuôi vảy ngắn; vẫn giáo dài + khiên tròn.',
    ],
    poses: {
      attack: [{ arm: 'pull' }, { arm: 'aim' }, { arm: 'thrust' }, { arm: 'hold' }],
      cast: [{ arm: 'raise', fx: 0 }, { arm: 'high', fx: 1 }, { arm: 'thrust', fx: 2 }],
    },
    draw(g, p) {
      const VAY = ['sat', 'sat-sang', 'bac'];   // tuong-pixel-ro: vảy XÁM THIẾC sáng (khác giáp sắt tối Thánh Gióng)
      const scales = (g, x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (g.get(x, y) && (x + 2 * (y % 2)) % 4 === 0) g.set(x, y, 'sat'); else if (g.get(x, y) && (x + 2 * (y % 2)) % 4 === 1) g.set(x, y, 'bac'); };
      hero(g, p, {
        build: 'stocky', skin: ['dat', 'da-toi', 'da'],
        back(g, b) {
          // đuôi vảy ngắn chạm đất sau lưng
          g.shade(spans(b.t1 + 1, [[8, 11], [7, 10], [6, 9], [5, 8], [5, 7]]), VAY);
          scales(g, 5, b.t1 + 1, 11, b.t1 + 5);
          shield(g, b.B[0] - 2, b.B[1] + 2);
        },
        backHand: (b) => [b.B[0] - 1, b.B[1] + 3],
        legs: { pant: ['sat-toi', 'sat', 'sat-sang'], pantRows: 5, cuff: 'dong', feet: ['dat', 'da-toi', 'da'] },   // chân vảy (tuong-pixel-ro)
        body(g, b) {
          g.shade(torsoPts(b), VAY);
          scales(g, b.sh[0], b.t0, b.sh[1], b.t1 - 2);
          for (let x = b.wa[0]; x <= b.wa[1]; x++) g.set(x, b.t1 - 1, 'dong');
          g.set(15, b.t1 - 1, 'dong-sang');
        },
        headFn(g, b, p) {   // đầu tê tê: vảy trên đỉnh, mõm dài nhọn
          const { hx, hy } = b;
          g.ascii(hx - 1, hy + 1, [
            '...iSSSi....',
            '..iSsSsSi...',
            '.iSsSsSsSi..',
            'isSsSsSsSsi.',
            'isffFFFFFff.',
            '.iffFFFFFFFh',
            '..ffffFFFff.',
            '...fff......',
          ]);
          if (p.eyes === 'closed') { g.set(hx + 6, hy + 5, 'toi'); g.set(hx + 7, hy + 5, 'toi'); }
          else { g.set(hx + 6, hy + 5, 'vien'); g.set(hx + 5, hy + 5, 'trang'); }
        },
        front(g, b, p) {
          const S = b.S;
          const pos = { pull: [S[0] - 1, S[1] + 3], aim: [S[0] + 2, S[1] + 2], thrust: [S[0] + 5, S[1] + 2] };
          const dir = { pull: 'r', aim: 'r', thrust: 'r' };
          pole(g, b, p, { len: 18, back: 7, m: M.go, el: 'kim', reserve: 3, sleeve: [VAY, 3],
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
      'Đặc trưng (PROMPT-GEN-LAI.txt:79 · PROMPT-DUNG-XUONG.txt:195): cụ ông lưng còng, ĐẦU HÓI tròn to, áo lễ trắng ngà viền răng cưa đồng,',
      'gậy treo CHUÔNG ĐỒNG to hơn đầu, tua đỏ (⚠ ảnh cũ là chiêng — giữ dáng treo trên gậy). PHÁ CÁCH (DANH-SACH): CON RỐI NƯỚC —',
      'ông lão rối gỗ sơn bóng, khớp vai CHỐT GỖ, sơn tróc lộ vân gỗ, lông mày + râu vẽ sơn; vẫn giơ gậy treo chuông đồng.',
    ],
    poses: {
      attack: [{ arm: 'windup' }, { arm: 'raise' }, { arm: 'hold', ring: 1 }, { arm: 'idle', ring: 2 }],
      cast: [{ arm: 'raise', fx: 0, ring: 1 }, { arm: 'high', fx: 1, ring: 2 }, { arm: 'high', fx: 2, ring: 1 }],
    },
    draw(g, p) {
      const SON = ['da-toi', 'da-sang', 'sang'];   // gỗ sơn bóng
      const peg = (x, y) => { g.set(x, y, 'dat-toi'); g.set(x, y - 1, 'dat-sang'); };
      hero(g, p, {
        build: 'old', skin: SON,
        face: { brow: 'vien', mouth: false },
        legs: { pant: M.bac, pantRows: 4, feet: ['dat', 'da-toi', 'da-sang'] },
        body(g, b) {
          const pts = torsoPts(b).concat(spans(b.t1 + 1, [[12, 19], [11, 19], [11, 19], [11, 20]]));
          g.shade(pts, M.bac);   // tuong-pixel-ro: áo lễ ánh BẠC (màu Kim) thay trắng ngà — khác râu trắng Thổ Công
          zig(g, 11, 20, b.t1 + 3, 'dong', 'dong-sang');
          // tuong-pixel-ro: dải lụa SƠN SON chéo ngực + đai son (rối nước sơn son thếp vàng) — khác Thổ Công râu trắng áo vàng
          g.line(13, b.t0, 17, b.t0 + 5, 'son'); g.line(14, b.t0, 18, b.t0 + 4, 'son-sang'); g.line(12, b.t0 + 1, 16, b.t0 + 5, 'son-toi');
          for (let x = b.wa[0]; x <= b.wa[1]; x++) { g.set(x, b.t1 - 1, 'son'); g.set(x, b.t1, x % 2 ? 'vang-nghe' : 'son-sang'); }
          peg(b.B[0], b.B[1] + 1);
        },
        hair(g, b) {   // đầu rối hói bóng: sơn tróc lộ vân gỗ, râu vẽ sơn trắng
          g.set(b.hx + 3, b.hy + 1, 'sang'); g.set(b.hx + 4, b.hy + 1, 'sang'); g.set(b.hx + 2, b.hy + 2, 'sang');
          g.ascii(b.hx, b.hy + 3, ['w.', 'ww', 'x.']);
          g.set(b.hx + 6, b.hy + 2, 'dat-sang');
          g.ascii(b.hx + 4, b.hy + 6, ['.wwwww', '.wwWwx', '..wwx.', '..wx..']);
          g.set(b.hx + 7, b.hy + 6, 'son');   // miệng sơn đỏ
        },
        front(g, b, p) {
          pole(g, b, p, { len: 13, back: 5, m: ['dat-toi', 'dat', 'dat-sang'], el: 'kim', reserve: 8,
            head(g, tip, d) {
              const hk = [tip[0] + 4, tip[1]];
              g.line(tip[0], tip[1], hk[0], hk[1], 'dat'); g.set(tip[0], tip[1] - 1, 'dat-sang');
              const sw = p.ring === 1 ? 1 : p.ring === 2 ? -1 : 0;
              g.ascii(hk[0] - 3 + sw, hk[1] + 1, ['...o...', '..oDo..', '.oDDdo.', '.dDddo.', '.dDddo.', 'oDddddo', 'oyyyyyo', '...R...', '..RrR..']);
              if (p.ring) { g.set(hk[0] + 5 + sw, hk[1] + 3, 'sang'); g.set(hk[0] + 6 + sw, hk[1] + 2, 'vang-sang'); g.set(hk[0] - 4 + sw, hk[1] + 3, 'vang-sang'); }
            } });
          peg(b.S[0], b.S[1] + 1);
        },
      });
    },
  };

  // ================================================================ DŨNG SĨ TRE LÀNG
  T.tre = {
    name: 'Dũng Sĩ Tre Làng',
    notes: [
      'Dũng Sĩ Tre Làng (mã tre) — tướng Thường · hành Mộc. Quy chuẩn: docs/pixel/QUY-CHUAN.md',
      'Đặc trưng (PROMPT-GEN-LAI.txt:923 · PROMPT-DUNG-XUONG.txt:216): cậu bé gầy, tóc rối dựng (không khăn), quần đùi xanh tre, đai vàng,',
      'TAY CẦM SÀO TRE xanh có NGỌN LÁ, dài gấp 2 người, chĩa chéo lên trước. PHÁ CÁCH (DANH-SACH): HÌNH NHÂN TRE ĐAN — thân đan',
      'nan tre như cái giỏ, tóc là nan tre tua ra, đốt tre làm khớp; mắt là 2 lỗ đan tối.',
    ],
    poses: {
      idle: [{ arm: 'hold' }, { arm: 'hold', dy: 1 }, { arm: 'hold', alt: 1 }],
      attack: [{ arm: 'pull' }, { arm: 'hold' }, { arm: 'thrust' }, { arm: 'low' }],
      cast: [{ arm: 'raise', fx: 0 }, { arm: 'high', fx: 1 }, { arm: 'thrust', fx: 2 }],
    },
    fade: [['la-ma', 'la'], ['la-sang', 'la-ma'], ['trang', 'trang-xam']],
    draw(g, p) {
      // tuong-pixel-ro: nan TRE XANH (đầu, tay chân) + áo đan KEM — màu Mộc riêng, khác nhóm tướng nâu
      const NAN = ['la', 'la-ma', 'la-sang'];
      const AO = ['cat', 'trang', 'sang'];
      const weave = (x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if ((x + y) % 2 === 0) { const c = g.get(x, y); if (c === 'la-ma') g.set(x, y, 'la'); else if (c === 'trang') g.set(x, y, 'cat'); } };
      hero(g, p, {
        build: 'teen', skin: NAN,
        face: { eyeW: 'dat-toi', eyeK: 'vien', brow: 'dat', mouth: false },
        legs: { pant: M.laMa, pantRows: 2, cuff: 'la' },
        body(g, b) {
          g.shade(torsoPts(b), AO);
          for (let x = b.wa[0]; x <= b.wa[1]; x++) g.set(x, b.t1, x === 15 ? 'vang-sang' : 'vang-nghe');
          for (let x = b.sh[0]; x <= b.sh[1]; x++) g.set(x, b.t0 + 3, 'dat-sang');   // nẹp giỏ
        },
        hair(g, b, p) {   // nan tre tua ra
          const w = p.alt ? 1 : 0;
          g.ascii(b.hx - 1, b.hy - 3, [
            'G..c.G..c..',
            '.c.G.c.G.c.',
            '..GcGcGcG..',
            '.GcGcGcGcG.',
          ].map((r) => (w ? '.' + r.slice(0, -1) : r)));
          g.ascii(b.hx, b.hy + 1, ['GcGcGcGcG', 'cGc......', 'Gc.......']);
        },
        after(g, b) {
          weave(0, 0, 31, 31);
          // đốt tre ở khớp: vai, gối
          g.set(b.B[0], b.B[1] + 2, 'cat'); g.set(b.S[0], b.S[1] + 1, 'cat');
          for (const [a] of b.legs) g.set(a + 1, b.foot - 2, 'cat');
        },
        front(g, b, p) {
          const S = b.S;
          const pos = { pull: [S[0] - 1, S[1] + 2], hold: [S[0] + 2, S[1] + 2], thrust: [S[0] + 5, S[1]], low: [S[0] + 3, S[1] + 3] };
          const dir = { pull: 'ur', hold: 'ur', thrust: 'ur', low: 'r' };
          pole(g, b, p, { len: 12, back: 9, m: ['la', 'la-ma', 'la-sang'], el: 'moc', reserve: 3,
            hand: (am) => pos[am] || handPos(S, am), dir,
            head(g, tip, d) {
              const dd = DIR[d];
              g.set(tip[0] + dd[0], tip[1] + dd[1], 'la-ma');
              g.set(tip[0] - 1, tip[1] - 1, 'la-sang'); g.set(tip[0] - 2, tip[1] - 1, 'la-ma');
              g.set(tip[0] + 1, tip[1] + 1, 'la'); g.set(tip[0] + 2, tip[1] + 1, 'la-ma');
              g.set(tip[0] - 1, tip[1] + 1, 'la-ma'); g.set(tip[0] - 2, tip[1] + 2, 'la');
            } });
          weave(S[0] - 1, S[1] - 6, 31, 31);
        },
      });
    },
  };

  // ================================================================ THỢ SĂN ỐNG THỔI
  T.ongthoi = {
    name: 'Thợ Săn Ống Thổi',
    notes: [
      'Thợ Săn Ống Thổi (mã ongthoi) — tướng Thường · hành Mộc. Quy chuẩn: docs/pixel/QUY-CHUAN.md',
      'Đặc trưng (PROMPT-GEN-LAI.txt:80 · PROMPT-DUNG-XUONG.txt:237): thấp đậm, bụng tròn, KHỐ DỆT ĐEN sọc răng cưa trắng, khăn lưng xanh',
      'mòng két, ống tre đựng kim bên hông; ỐNG THỔI tre rất dài cầm NGANG kề miệng (⚠ game crossbow). PHÁ CÁCH (DANH-SACH):',
      'NGƯỜI CÓC — cóc tía bụng tròn đứng 2 chân (cóc là cậu ông trời), mắt lồi trên đỉnh đầu, miệng rộng, da sần.',
    ],
    poses: {
      idle: [{ arm: 'rest' }, { arm: 'rest', dy: 1 }, { arm: 'rest', alt: 1 }],
      attack: [{ arm: 'aim' }, { arm: 'aim', puff: 1 }, { arm: 'aim', dart: 1 }, { arm: 'rest' }],
      cast: [{ arm: 'aim', fx: 0, puff: 1 }, { arm: 'aim', fx: 1, dart: 1 }, { arm: 'aim', fx: 2, dart: 2 }],
    },
    fade: [['reu', 'reu-toi'], ['reu-sang', 'reu']],
    draw(g, p) {
      const COC = ['la-toi', 'reu', 'reu-sang'];   // màu hành Mộc (góp ý tester): cóc xanh rêu, đốm tía trên lưng
      hero(g, p, {
        build: 'stocky', dy: 1, skin: COC,
        legs: { pantRows: 0, feet: COC },
        body(g, b) {
          const pts = torsoPts(b).concat(spans(b.t0 + 4, [[b.wa[1] + 1, b.wa[1] + 1], [b.wa[1] + 1, b.wa[1] + 1]]));
          g.shade(pts, COC);
          g.shade(spans(b.t0 + 2, [[15, 18], [14, 19], [14, 20], [14, 20], [15, 19]]), ['dat-sang', 'cat', 'vang-sang']);   // bụng sáng
          [[12, 1], [11, 4], [13, 6], [20, 1]].forEach(([x, dy]) => g.set(x, b.t0 + dy, 'tim'));   // đốm tía da sần
          for (let x = b.wa[0]; x <= b.wa[1]; x++) { g.set(x, b.t1 - 1, 'ngoc'); g.set(x, b.t1, 'khoi'); }
          g.set(b.wa[1] - 2, b.t1 - 1, 'ngoc-sang');
          g.shade(spans(b.t1 + 1, [[13, 17], [13, 17], [14, 16]]), M.den, { noTop: true });
          zig(g, 13, 17, b.t1, 'trang');
          g.shade(spans(b.t1 - 2, [[10, 11], [10, 11], [10, 11], [10, 11]]), M.rom);
        },
        headFn(g, b, p) {   // đầu cóc: dẹt rộng, mắt lồi trên đỉnh, miệng rộng
          const { hx, hy } = b;
          g.ascii(hx - 1, hy + 1, [
            '...2u2.2u2.',
            '..2UuuU2Uu2',
            '.2uUuuuuuuu',
            '2uUuuuuuuuu',
            '2uuu2222222',
            '2uuuccccccu',
            '.2uuuuuuu2.',
            '..2222222..',
          ]);
          if (p.eyes === 'closed') { for (const x of [hx + 3, hx + 4, hx + 7, hx + 8]) g.set(x, hy + 2, 'la-toi'); }
          else { g.set(hx + 3, hy + 2, 'vang-sang'); g.set(hx + 4, hy + 2, 'vien'); g.set(hx + 7, hy + 2, 'vang-sang'); g.set(hx + 8, hy + 2, 'vien'); g.set(hx + 3, hy + 1, 'vang-nghe'); g.set(hx + 7, hy + 1, 'vang-nghe'); }
          g.set(hx + 2, hy + 4, 'tim'); g.set(hx + 5, hy + 3, 'tim-sang'); g.set(hx + 9, hy + 4, 'tim');
        },
        front(g, b, p) {
          const rest = p.arm === 'rest' || p.kneel;
          const BAM = ['la', 'la-ma', 'la-sang'];
          if (rest) {
            const Hd = [b.S[0] + 2, b.S[1] + 4];
            shaft(g, Hd, 'up', 16, 3, BAM, false, 0);
            g.set(Hd[0], Hd[1] - 16, 'la-sang');
            arm(g, b.S, Hd, COC);
            return;
          }
          const y = b.hy + 5;
          const x0 = b.hx + 9, x1 = 29;
          arm(g, [b.S[0] - 3, b.S[1]], [b.S[0] + 1, y + 1], COC);
          g.line(x0, y, x1, y, (x) => (x % 4 === 0 ? 'la' : 'la-ma'));
          g.line(x0 + 1, y + 1, x1, y + 1, (x) => (x % 4 === 0 ? 'la-toi' : 'la'));
          arm(g, b.S, [b.S[0] + 5, y + 1], COC);
          if (p.puff) g.ascii(b.hx + 4, b.hy + 6, ['ccc', '.c.']);   // phồng họng
          if (p.dart) { g.set(29, y - 2, 'bac'); g.set(28, y - 2, 'sat-sang'); g.set(27, y - 2, 'son-sang'); }
          if (p.fx !== undefined) fx(g, 'moc', p.fx, 24, y - 4);
        },
      });
    },
  };

  // ================================================================ NGƯỜI ĐẮP ĐÊ
  // tuong-pixel-ro: nón lá TO, vàng rơm sáng (dấu hiệu nhận ra từ xa)
  const NON = ['......Y......', '.....YYc.....', '....YYccG....', '...YYcccGG...', '..YYccccGGt..', '.YYcccccGGGt.', 'cYYcccccccGGt', '.ttttttttttt.'];
  T.dapde = {
    name: 'Người Đắp Đê',
    notes: [
      'Người Đắp Đê (mã dapde) — tướng Thường · hành Thổ. Quy chuẩn: docs/pixel/QUY-CHUAN.md',
      'Đặc trưng (PROMPT-GEN-LAI.txt:972 · PROMPT-DUNG-XUONG.txt:258): NỮ nông dân ~40 chắc khoẻ hông rộng, áo nâu bùn, quần chàm xắn ống dính bùn,',
      'sọt đất bên hông — KHÔNG giáp, KHÔNG mũ trụ; cầm XẺNG gỗ bản dẹt (⚠ không giáo/chĩa; game look = axe); NÓN LÁ vàng rơm.',
      'PHÁ CÁCH (DANH-SACH): NGƯỜI BÙN — người phụ nữ đắp bằng bùn đê nâu (váy bùn, búi tóc bùn), bùn nhễu giọt ở tay, rơm lẫn trong thân.',
      'tuong-pixel-ro (phân biệt tướng): mặt / tay để DA NGƯỜI lấm bùn, quần CHÀM lộ rõ, NÓN LÁ to vàng rơm, XẺNG lưỡi sắt.',
    ],
    fade: [['dat', 'dat-toi'], ['dat-sang', 'dat']],
    draw(g, p) {
      const BUN = ['dat-toi', 'dat', 'dat-sang'];
      hero(g, p, {
        build: 'normal', skin: M.da,   // tuong-pixel-ro: da người lấm bùn (áo/váy bùn nâu) — khác vỏ dừa Sọ Dừa / ma cây Thợ Săn
        legs: { pant: M.cham, pantRows: 3 },   // tuong-pixel-ro: quần CHÀM xắn ống lộ rõ (khác các tướng nâu)
        body(g, b, p) {
          const pts = torsoPts(b).concat(spans(b.t1 - 1, [[11, 20], [11, 20], [10, 21]]));   // váy bùn hông rộng (ngắn, lộ quần chàm)
          g.shade(pts, BUN);
          [[13, 1], [17, 3], [12, 6], [18, 7], [15, 9]].forEach(([x, dy]) => { g.set(x, b.t0 + dy, 'cat'); g.set(x + 1, b.t0 + dy - 1, 'vang-sang'); });   // rơm
          for (let x = 10; x <= 21; x += 3) g.set(x, b.t1 + 2, 'dat-toi');   // giọt nhễu ở gấu váy
          g.set(b.B[0] - 1, b.B[1] + 7 + (p.alt ? 1 : 0), 'dat');   // bùn nhỏ giọt ở tay
          g.ascii(7, b.t1 - 3, ['tggt', 'cGcG', 'GcGc', 'cGcG', '.tt.']);   // sọt đất bên hông
        },
        face: { brow: 'khoi' },
        hair(g, b) {
          g.ascii(b.hx - 2, b.hy + 2, ['.ttt', 'tggt', 'tgt.', '.t..']);   // búi tóc bùn sau gáy
          g.ascii(b.hx - 3, b.hy - 5, NON);
        },
        front(g, b, p) {
          pole(g, b, p, { len: 8, back: 3, m: M.go, el: 'tho',
            reserve: 6, art: { up: { at: [2, 7], rows: ['bSSs', 'bSSs', 'bSsi', 'bSsi', 'Sssi', '.ti.', '.tg.'] }, ur: { at: [0, 6], rows: ['..bSS', '.bSSs', 'bSSsi', '.Ssi.', '.g...', 'g....'] } } });   // xẻng LƯỠI SẮT to
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
      'PHÁ CÁCH (DANH-SACH): TƯỢNG TÒ HE — cậu bé nặn bột gạo bóng loáng (nâu trâu + khăn vàng), mắt chấm mực, QUE TRE cắm dưới chân như đế.',
    ],
    draw(g, p) {
      const BOT = ['da-toi', 'hong', 'da-sang'];   // tuong-pixel-ro: bột tò he HỒNG ĐẤT (khác nâu bùn / đất sét)
      hero(g, p, {
        build: 'child', skin: BOT,
        back(g, b, p) {   // đuôi khăn bay sau lưng
          g.ascii(b.B[0] - 3, b.t0 - 1, p.alt ? ['.yyy', 'yYy.', 'y...'] : ['yyy.', '.Yyy', '..y.']);
        },
        legs: { pant: ['dat-toi', 'dat', 'son-sang'], pantRows: 2 },
        body(g, b) {
          g.line(15, b.t1 + 1, 15, b.foot, 'cat'); g.set(15, b.foot, 'dat-sang');   // que tre làm đế
          g.shade(torsoPts(b), BOT);
          g.set(13, b.t0 + 2, 'sang'); g.set(14, b.t0 + 3, 'vang-sang');   // bóng bột nặn
          for (let x = b.wa[0]; x <= b.wa[1]; x++) g.set(x, b.t1, 'son');
          g.line(12, b.t1 - 2, 15, b.t1 + 1, 'cat'); g.set(12, b.t1 - 2, 'dat-sang');   // sáo trúc
          for (let x = b.sh[0]; x <= b.sh[1]; x++) { g.set(x, b.t0, x < 14 ? 'vang-sang' : 'vang-nghe'); g.set(x, b.t0 + 1, x % 2 ? 'vang-nghe' : 'dong'); }
        },
        face: { brow: 'dat', eyeW: 'dat-sang', mouth: false },
        hair(g, b) {   // đầu cạo + 3 chỏm (bột đen) + vệt bóng
          g.set(b.hx + 3, b.hy + 1, 'sang'); g.set(b.hx + 6, b.hy + 7, 'son-toi'); g.set(b.hx + 7, b.hy + 7, 'son-toi');
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
      'PHÁ CÁCH (DANH-SACH): TINH SEN — cô bé hoá từ đài sen: tóc là CÁNH SEN hồng xếp lớp, da xanh lá nhạt, chân như CUỐNG SEN; vẫn che lá sen.',
    ],
    poses: {
      idle: [{ arm: 'high' }, { arm: 'high', dy: 1 }, { arm: 'high', alt: 1 }],
      attack: [{ arm: 'high' }, { arm: 'raise' }, { arm: 'front', drop: 1 }, { arm: 'raise', drop: 2 }],
      cast: [{ arm: 'high', fx: 0 }, { arm: 'raise', fx: 1 }, { arm: 'front', fx: 2, drop: 1 }],
    },
    draw(g, p) {
      const AO = ['nuoc', 'nuoc-sang', 'troi'];
      const DA = ['la-ma', 'la-sang', 'trang'];
      hero(g, p, {
        build: 'child', skin: DA,
        backHand: (b) => [b.B[0] - 1, b.B[1] + 3],
        backSleeve: [AO, 3],
        boneLegs: 'la',
        body(g, b) {
          g.shade(torsoPts(b), AO);
          for (let y = b.t0 + 1; y <= b.t1; y += 2) g.set(17, y, 'nuoc');   // hàng khuy bà ba
          // nụ sen ở tay sau
          g.ascii(b.B[0] - 2, b.B[1] + 2, ['.p.', 'p1p', '.3.']);
        },
        face: { brow: 'la' },
        hair(g, b) {   // tóc là cánh sen hồng xếp lớp (2 lọn cánh thay bím)
          g.ascii(b.hx - 1, b.hy - 2, [
            '...pW.pW...',
            '..1pp1pp1..',
            '.1pWp1pWp1.',
            '1pp1pp1pp1.',
            '1p1pp....p.',
            'p1p........',
            '1pp........',
            '.1p........',
            '..1........',
          ]);
          g.ascii(b.hx + 1, b.hy + 2, ['M', 'm']);   // gương sen cài tai
        },
        front(g, b, p) {
          const am = p.kneel ? 'idle' : p.arm;
          const pos = { high: [b.S[0] + 1, b.S[1] - 6], raise: [b.S[0] + 3, b.S[1] - 5], front: [b.S[0] + 4, b.S[1] - 1], idle: [b.S[0] + 2, b.S[1] + 3] };
          const dir = { high: 'up', raise: 'ur', front: 'r', idle: 'up' }[am];
          const Hd = pos[am] || pos.idle;
          const tip = shaft(g, Hd, dir, am === 'high' ? 5 : 3, 1, ['la-toi', 'la', 'la-ma'], false, 4);
          stamp(g, tip, dir, LA_SEN);
          arm(g, b.S, Hd, DA, [AO, 2]);
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
      'PHÁ CÁCH (DANH-SACH): MA TRƠI — thân KHÓI TRO xám tan dần thành làn khói ở chân, ĐẦU LÀ NGỌN LỬA đỏ có 2 mắt, khố đỏ son.',
    ],
    hurtSwap: [['lua-sang', 'sang'], ['vang-sang', 'sang']],
    fade: [['lua', 'son'], ['lua-sang', 'lua'], ['vang-sang', 'lua-sang']],
    draw(g, p) {
      const KHOI = ['sat-toi', 'sat', 'sat-sang'];
      hero(g, p, {
        build: 'thin', skin: KHOI,
        back(g, b, p) {   // đuốc tay sau giơ cao
          const h = [b.B[0] - 1, b.B[1] - 4];
          g.line(h[0] + 1, h[1] + 3, h[0] - 1, h[1] - 6, 'dat');
          g.set(h[0], h[1] - 6, 'dat-toi'); g.set(h[0] - 1, h[1] - 7, 'dat-toi');
          const fl = (p.alt || p.k === 'cast') ? ['..L..', '.lLl.', 'lLLLl', 'lLLl.', '.rl..'] : ['.L...', '.lL..', 'lLLl.', 'lLLLl', '.rlr.'];
          g.ascii(h[0] - 3, h[1] - 12, fl);
          arm(g, b.B, h, KHOI);
        },
        noBackArm: true,
        noLegs: true,
        body(g, b, p) {   // thân khói tro → chân tan thành làn khói
          const w = p.alt ? 1 : 0;
          const pts = torsoPts(b).concat(spans(b.t1 + 1, [[12, 18], [12, 18], [13, 18], [13, 17], [13 + w, 17], [14, 17 - w], [14 - w, 16]]));
          g.shade(pts, KHOI);
          g.ascii(12 - w, b.foot - 1, ['.s.ss', 's.S.s']);
          for (let y = b.t0 + 1; y <= b.t1; y += 3) g.set(14 + (y % 2), y, 'sat-sang');
          for (let x = b.wa[0]; x <= b.wa[1]; x++) g.set(x, b.t1, 'son');
          g.shade(spans(b.t1 + 1, [[13, 16], [13, 16], [14, 15]]), M.son, { noTop: true });
        },
        headFn(g, b, p) {   // đầu là ngọn lửa đỏ có 2 mắt
          const { hx, hy } = b;
          const top = p.alt ? ['...l.....', '..lL..l..', '.lLl.lL..'] : ['....l....', '...lL.l..', '..lLl.Ll.'];
          g.ascii(hx, hy - 3, top.concat([
            '.lLLllLl.',
            '.lLYLLLl.',
            'lLLYYLLLl',
            'lLYYYYLLl',
            'lLYYYYYLl',
            'RlLYYYYLl',
            'RllLLLLlR',
            '.RllllllR',
            '..RRRRRR.',
          ]));
          if (p.eyes === 'closed') { g.set(hx + 4, hy + 4, 'son'); g.set(hx + 5, hy + 4, 'son'); g.set(hx + 7, hy + 4, 'son'); }
          else { g.set(hx + 4, hy + 4, 'son-toi'); g.set(hx + 4, hy + 3, 'son-toi'); g.set(hx + 7, hy + 4, 'son-toi'); g.set(hx + 7, hy + 3, 'son-toi'); }
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
      'PHÁ CÁCH (DANH-SACH): HÌNH NHÂN GIẤY — bé gái giấy điệp cam xếp NẾP như đèn lồng (đường gấp ngang rõ), mặt giấy trắng vẽ mực.',
    ],
    poses: {
      idle: [{ arm: 'up' }, { arm: 'up', dy: 1 }, { arm: 'up', alt: 1 }],
      attack: [{ arm: 'up', dy: 1 }, { arm: 'lift' }, { arm: 'lift', fire: 1 }, { arm: 'up', fire: 2 }],
      cast: [{ arm: 'lift', fx: 0 }, { arm: 'lift', fx: 1, alt: 1 }, { arm: 'lift', fx: 2, fire: 1 }],
      kneel: { arm: 'down' },
    },
    draw(g, p) {
      const AO = ['son', 'lua', 'lua-sang'];
      const GIAY = ['trang-xam', 'trang', 'sang'];
      hero(g, p, {
        build: 'child', dy: 1, skin: AO,
        noBackArm: true,
        legs: { pant: AO, pantRows: 3, feet: GIAY },
        body(g, b) {
          const pts = torsoPts(b).concat(spans(b.t1 + 1, [[11, 20], [11, 20], [10, 21]]));
          g.shade(pts, AO);
          for (let y = b.t0 + 1; y <= b.t1 + 3; y += 2) for (let x = 10; x <= 21; x++) if (g.get(x, y)) g.set(x, y, x < 13 ? 'lua' : 'son');   // nếp gấp giấy
          for (let x = b.wa[0]; x <= b.wa[1]; x++) g.set(x, b.t1 - 1, 'vang-nghe');
          g.set(12, b.t1, 'son-sang'); g.set(11, b.t1 + 1, 'son-sang');   // ruy băng đỏ
        },
        face: { brow: 'vien', skin: GIAY, eyeW: 'trang', mouth: false },
        after(g, b) { g.set(b.hx + 7, b.hy + 7, 'son'); g.set(b.hx + 3, b.hy + 5, 'trang-xam'); },
        hair(g, b) { g.ascii(b.hx, b.hy - 2, ['.qq...qq.', 'qKqq.qqKq', '..qqqqq..', '.qqqqqqq.', 'qqqqqqqqq', 'qqq....q.', 'qq.......', 'qq.......']); g.set(b.hx + 1, b.hy - 2, 'son-sang'); },
        front(g, b, p) {
          if (p.kneel || p.lying) { DEN(g, 21, 21, p.alt); arm(g, b.S, [b.S[0] + 2, b.S[1] + 3], AO); return; }
          const up = p.arm === 'lift' ? 3 : 1;
          const ty = b.hy - 7 - (up - 1);
          DEN(g, b.hx + 1, ty, p.alt);
          arm(g, [b.S[0] + 1, b.S[1]], [b.hx + 9, ty + 6], AO);
          arm(g, b.B, [b.hx - 1, ty + 6], AO);
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
      'vòng sắt cổ tay; BÚA TẠ đầu nung ĐỎ RỰC (⚠ không giáo; game look = cleaver); ĐẦU HÓI + RÂU rậm.',
      'PHÁ CÁCH (DANH-SACH + QUY-CHUAN 0b): NGƯỜI ĐÁ NỨT LỬA — thân đá đen bazan nứt nẻ, LỬA ĐỎ RỰC trong khe nứt, mắt than hồng,',
      'tạp dề da cháy sém; râu là đá vụn đen.',
    ],
    hurtSwap: [['lua-sang', 'sang']],
    fade: [['lua', 'son-toi'], ['lua-sang', 'son'], ['vang-sang', 'lua']],
    draw(g, p) {
      const DA = ['sat-toi', 'sat', 'sat-sang'];   // đá xám (góp ý tester: bớt tối để khác Lạc Tướng / Thợ Săn)
      const nut = (pts) => pts.forEach(([x, y, c]) => g.set(x, y, c || 'lua'));
      hero(g, p, {
        build: 'stocky', skin: DA,
        legs: { pant: ['dat-toi', 'dat', 'dat-sang'], pantRows: 5, feet: DA },
        body(g, b, p) {
          const pts = torsoPts(b).concat(spans(b.t0 + 3, [[b.wa[1] + 1, b.wa[1] + 1], [b.wa[1] + 1, b.wa[1] + 1], [b.wa[1] + 1, b.wa[1] + 1]]));
          g.shade(pts, DA);
          nut([[11, b.t0 + 1], [12, b.t0 + 2, 'lua-sang'], [12, b.t0 + 3], [19, b.t0], [20, b.t0 + 1, 'lua-sang'], [20, b.t0 + 2]]);
          // tạp dề da: yếm ngực + vạt dài
          g.shade(spans(b.t0 + 1, [[13, 18], [13, 18], [12, 19], [12, 20], [12, 20], [12, 20], [12, 19], [12, 19], [13, 18], [13, 18], [13, 18]]), ['dat-toi', 'dat', 'dat-sang']);
          g.line(13, b.t0, 12, b.t0 - 1, 'dat-toi'); g.line(18, b.t0, 19, b.t0 - 1, 'dat-toi');
          g.set(15, b.t0 + 4, 'dat-toi'); g.set(16, b.t0 + 4, 'dat-toi');
          [[13, 6], [17, 8], [14, 9]].forEach(([x, dy]) => g.set(x, b.t0 + dy, 'son-toi'));   // vết cháy sém
          g.set(b.B[0] - 1, b.B[1] + 4, 'sat-sang'); g.set(b.B[0], b.B[1] + 4, 'sat');
          g.set(b.B[0] - 1, b.B[1] + 1, 'lua'); g.set(b.B[0] - 1, b.B[1] + 2, 'lua-sang');   // khe nứt tay sau
        },
        face: { brow: 'vien', fierce: 1, mouth: false, eyeW: 'lua', eyeK: 'lua-sang' },
        hair(g, b) {   // đầu đá: khe nứt lửa trên trán, râu đá vụn
          g.set(b.hx + 3, b.hy + 1, 'sat'); g.set(b.hx + 4, b.hy + 1, 'sat');
          nut([[b.hx + 5, b.hy], [b.hx + 4, b.hy + 1, 'lua-sang'], [b.hx + 4, b.hy + 2], [b.hx + 1, b.hy + 3, 'son']]);
          g.ascii(b.hx + 3, b.hy + 5, ['ii.....', 'iiKiiKi', 'iKiliKi', '.iKiKi.', '..iii..']);
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
      'PHÁ CÁCH (DANH-SACH): BỘ XƯƠNG NGƯ PHỦ — bộ xương phủ rêu xanh, VỎ HẾN bám vai, 2 chân xương (không đuôi cá), áo xanh sông rách.',
    ],
    hurtSwap: [['trang', 'sang']],
    fade: [['trang', 'trang-xam'], ['trang-xam', 'reu-sang']],
    draw(g, p) {
      const AO = ['cham-toi', 'ngoc', 'ngoc-sang'];
      const XUONG = ['reu', 'trang-xam', 'trang'];
      hero(g, p, {
        build: 'normal', dy: 1, skin: XUONG, armFn: boneArm, boneLegs: 'trang-xam',
        back(g, b, p) {   // lưới vắt vai rủ sau lưng
          const w = p.alt ? 1 : 0;
          const pts = spans(b.t0 - 1, [[10, 13], [8, 13], [7, 13], [7, 12], [7 - w, 12], [7 - w, 12], [7 - w, 11], [8 - w, 11], [8 - w, 10]]);
          pts.forEach(([x, y]) => g.set(x, y, (x + y) % 2 ? 'trang-xam' : ((x % 2) ? 'dat-sang' : null)));
          g.set(7 - w, b.t0 + 3, 'lua'); g.set(8 - w, b.t0 + 7, 'lua'); g.set(9, b.t0 + 1, 'lua-sang');
        },
        body(g, b) {
          g.shade(torsoPts(b), AO);
          for (let y = b.t0 + 2; y <= b.t1 - 2; y += 2) { g.set(15, y, 'trang'); g.set(16, y, 'trang-xam'); g.set(17, y, 'trang'); }   // sườn lộ qua áo rách
          g.clr(b.wa[0], b.t1 - 1); g.clr(b.wa[1], b.t1 - 2);
          g.line(12, b.t0, 19, b.t0 + 6, 'trang-xam');   // dây lưới chéo ngực
          g.set(13, b.t0 + 1, 'lua');
          g.ascii(b.sh[1] - 2, b.t0 - 1, ['.nN', 'nNA']); g.ascii(b.sh[0], b.t0 - 1, ['Nn']);   // vỏ hến bám vai
          for (let x = b.wa[0]; x <= b.wa[1]; x++) g.set(x, b.t1, 'dat');
          g.ascii(9, b.t1 - 2, ['.tt.', 'cGcG', 'GcGc', '.cG.']);   // giỏ tre
        },
        headFn(g, b, p) {   // sọ phủ rêu + khăn vấn đỏ nâu
          const { hx, hy } = b;
          g.ascii(hx, hy, [
            '..xwwwx..',
            '.xwwwwwx.',
            'xuwwwwwwx',
            'xuuwwwwwx',
            'xwwKKwKKx',
            'xuwKKwKKx',
            '.xwwwKwwx',
            '..wKwKwK.',
            '..xwwwwx.',
          ]);
          if (p.eyes !== 'closed') { g.set(hx + 4, hy + 5, 'ngoc-sang'); g.set(hx + 7, hy + 5, 'ngoc-sang'); }
          g.ascii(hx - 1, hy - 1, ['...rRRR...', '..RR1RRRr.', '.rRRRRRRr.', '.uu.......']);   // khăn vấn + rêu
        },
        front(g, b, p) {
          pole(g, b, p, { len: 10, back: 4, m: M.go, el: 'thuy', reserve: 3,
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
      'PHÁ CÁCH (DANH-SACH): TƯỢNG GỐM — cô gái đất nung nâu đỏ có VẾT RẠN MEN LAM, khăn đầu cũng bằng gốm; vẫn giơ bình gốm men lam; nữ.',
    ],
    poses: {
      idle: [{ arm: 'hold' }, { arm: 'hold', dy: 1 }, { arm: 'hold', alt: 1 }],
      attack: [{ arm: 'over' }, { arm: 'over', dy: 1 }, { arm: 'throw', fly: 1 }, { arm: 'after', fly: 2 }],
      cast: [{ arm: 'over', fx: 0 }, { arm: 'over', fx: 1 }, { arm: 'throw', fx: 2, fly: 1 }],
    },
    draw(g, p) {
      const AO = ['dat-toi', 'dat', 'dat-sang'];
      const NUNG = ['dat', 'dong', 'dong-sang'];   // đất nung nâu / vàng đất (màu hành Thổ — góp ý tester)
      const ran = (pts) => pts.forEach(([x, y]) => { if (g.get(x, y)) g.set(x, y, 'nuoc'); });
      hero(g, p, {
        build: 'normal', skin: NUNG,
        backSleeve: [AO, 3],
        legs: { pant: AO, pantRows: 5, feet: NUNG },
        body(g, b) {
          const pts = torsoPts(b).concat(spans(b.t1 + 1, [[12, 19], [12, 19]]));
          g.shade(pts, AO);
          g.shade(spans(b.t0 + 2, [[13, 18], [13, 18], [13, 18], [13, 18], [12, 19], [12, 19], [12, 19], [12, 19]]), ['dat-sang', 'cat', 'vang-sang']);
          g.line(13, b.t0 + 2, 12, b.t0, 'cat'); g.line(18, b.t0 + 2, 19, b.t0, 'cat');
          g.set(15, b.t1 + 1, 'dat-sang');
          ran([[14, b.t0 + 3], [15, b.t0 + 4], [15, b.t0 + 5], [16, b.t0 + 6], [18, b.t0 + 2], [12, b.t1 + 1], [13, b.t1 + 2]]);
        },
        face: { brow: 'son-toi', eyeW: 'trang', eyeK: 'son-toi', mouth: false },
        hair(g, b) {   // khăn gốm (men nâu) thắt nút + vết rạn men lam trên mặt
          g.ascii(b.hx - 1, b.hy - 1, ['...dDDd...', '..dDDDDdd.', '.dDDddddot', '.ooooooooo', '.oo.......', '.do.......', '..o.......']);
          g.ascii(b.hx + 6, b.hy - 3, ['d.d', '.o.']);
          ran([[b.hx + 1, b.hy + 3], [b.hx + 1, b.hy + 4]]);
          g.set(b.hx + 7, b.hy + 7, 'son-toi');
        },
        front(g, b, p) {
          const S = b.S;
          const pos = { hold: [S[0] + 2, S[1] + 2], over: [S[0] + 2, b.hy - 2], throw: [S[0] + 5, S[1] - 1], after: [S[0] + 4, S[1] + 3], down: [S[0] + 2, S[1] + 5] };
          const Hd = pos[p.kneel ? 'down' : p.arm] || pos.hold;
          if (p.kneel) BINH(g, 21, 24);
          else if (p.arm === 'hold') BINH(g, Hd[0], Hd[1] - 4);
          else if (p.arm === 'over') BINH(g, Hd[0] - 5, Hd[1] - 5);
          if (p.fly) BINH(g, p.fly === 1 ? 24 : 25, p.fly === 1 ? 5 : 8);
          arm(g, S, Hd, NUNG, [AO, 2]);
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
      'PHÁ CÁCH (DANH-SACH): NGƯỜI NẤM — lão nấm linh chi: MŨ NẤM nâu đỏ to thay tóc, mặt + thân là cuống nấm trắng ngà còng,',
      'râu là sợi nấm trắng; vẫn gậy chống + gùi lá thuốc + áo xanh xám lá (hành Mộc).',
    ],
    poses: {
      attack: [{ arm: 'windup' }, { arm: 'raise' }, { arm: 'strike', puff: 1 }, { arm: 'follow', puff: 2 }],
    },
    draw(g, p) {
      const AO = ['trang-xam', 'trang', 'sang'];   // tuong-pixel-ro: thân CUỐNG NẤM trắng ngà (khác áo rêu Thợ Săn); lá xanh ở gùi
      const CUONG = ['dat-sang', 'cat', 'vang-sang'];
      hero(g, p, {
        build: 'old', skin: CUONG,
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
        face: { old: 1, brow: 'dat-sang', eyeW: 'trang', eyeK: 'dat-toi', mouth: false },
        hair(g, b, p) {   // mũ nấm linh chi nâu đỏ bóng, vân vòng; râu sợi nấm
          g.ascii(b.hx - 3, b.hy - 3, [
            '....rRRRRr.....',
            '..rR1LR1RRRr...',
            '.rR1RRrRR1RRr..',
            'rRRRrRRRRrRRRr.',
            'roooooooooooooo',
            '.o.o.oo.o.oo.o.',
          ]);
          g.ascii(b.hx + 4, b.hy + 6, ['.Wwwx', '..wWx', '..w.x', '...w.']);
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
