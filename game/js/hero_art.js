// Hình và hoạt ảnh hero (ghi đè G.art.hero).
// Sprite pixel viết tay bằng dữ liệu (mỗi ký tự là một màu trong bảng màu), ráp theo khung xương,
// dựng một lần vào canvas nhỏ rồi lưu đệm theo: hero, trang bị, vũ khí, hoạt ảnh, khung hình.
(function () {
  'use strict';
  const G = window.G, A = G && G.art;
  if (!A || !A.hero) return;
  const old = A.hero; // bản cũ, dùng khi có lỗi

  // ---------- bộ đệm điểm ảnh ----------
  const BW = 192, BH = 136, OX = 88, OY = 108; // gốc (0,0) là điểm giữa hai bàn chân
  const N = BW * BH;
  const main = new Uint32Array(N), lay = new Uint32Array(N), fxb = new Uint32Array(N), tmp = new Uint32Array(N);
  const wm = new Uint8Array(N); // điểm thuộc vũ khí (để viền theo màu hệ)
  let T = lay;

  // ---------- màu ----------
  const hx = (h) => { const v = parseInt(h.slice(1), 16); return (0xff000000 | ((v & 255) << 16) | (v & 0xff00) | (v >> 16)) >>> 0; };
  function mixi(a, b, k) {
    const r = (a & 255) + ((b & 255) - (a & 255)) * k, g = ((a >> 8) & 255) + (((b >> 8) & 255) - ((a >> 8) & 255)) * k;
    const bl = ((a >> 16) & 255) + (((b >> 16) & 255) - ((a >> 16) & 255)) * k;
    return ((a & 0xff000000) | (Math.round(bl) << 16) | (Math.round(g) << 8) | Math.round(r)) >>> 0;
  }
  const alpha = (c, a) => ((c & 0xffffff) | (Math.round(a * 255) << 24)) >>> 0;
  const INK = hx('#1b1118'), SHADE = hx('#2a1838'), GLINT = hx('#fff4d6'), WHITE = hx('#ffffff');
  const WOOD = hx('#8a5a34'), WOODD = hx('#5a3822'), WOODL = hx('#b07c4a'), GOLD = hx('#e2b64e'), GOLDL = hx('#ffe9a0'), GOLDD = hx('#9c7426');
  const dark = (c, k) => mixi(c, SHADE, k == null ? 0.38 : k);
  const light = (c, k) => mixi(c, GLINT, k == null ? 0.36 : k);

  // ---------- vẽ cơ bản ----------
  let bx0 = BW, bx1 = -1, by0 = BH, by1 = -1; // vùng đã vẽ của lớp hiện tại, để gộp lớp cho nhanh
  function P(x, y, c) {
    x += OX; y += OY;
    if (x >= 1 && x < BW - 1 && y >= 1 && y < BH - 1) {
      T[y * BW + x] = c;
      if (x < bx0) bx0 = x; if (x > bx1) bx1 = x; if (y < by0) by0 = y; if (y > by1) by1 = y;
    }
  }
  function rect(x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) P(x + i, y + j, c); }
  // Đoạn thẳng dày: đóng dấu ô vuông w dọc theo đoạn.
  function tline(x0, y0, x1, y1, w, c, ox, oy) {
    const dx = x1 - x0, dy = y1 - y0;
    const n = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy))));
    const o = w >> 1;
    for (let i = 0; i <= n; i++) rect(Math.round(x0 + (dx * i) / n) - o + (ox || 0), Math.round(y0 + (dy * i) / n) - o + (oy || 0), w, w, c);
  }
  // Chi (tay, chân): lõi tối, phủ màu chính lệch về phía sáng, thêm một vệt sáng.
  function limb(x0, y0, x1, y1, w, cm, cd, cl) {
    tline(x0, y0, x1, y1, w, cd);
    const w2 = w - 1;
    if (w2 >= 1) tline(x0, y0, x1, y1, w2, cm, 1 + (w2 >> 1) - (w >> 1), (w2 >> 1) - (w >> 1));
    if (cl && w >= 3) tline(x0, y0, x1, y1, 1, cl, w - 1 - (w >> 1), -(w >> 1));
  }
  // Tô đa giác (chẵn lẻ), toạ độ thực.
  function poly(pts, c) {
    let y0 = 1e9, y1 = -1e9;
    const n = pts.length;
    for (let i = 0; i < n; i++) { if (pts[i][1] < y0) y0 = pts[i][1]; if (pts[i][1] > y1) y1 = pts[i][1]; }
    for (let y = Math.ceil(y0 - 0.5); y <= Math.floor(y1 + 0.5); y++) {
      const yy = Math.min(y1 - 0.01, Math.max(y0 + 0.01, y + 0.003));
      const xs = [];
      for (let i = 0; i < n; i++) {
        const a = pts[i], b = pts[(i + 1) % n];
        if ((a[1] <= yy) !== (b[1] <= yy)) xs.push(a[0] + ((yy - a[1]) * (b[0] - a[0])) / (b[1] - a[1]));
      }
      xs.sort((p, q) => p - q);
      for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.round(xs[k]); x <= Math.round(xs[k + 1]); x++) P(x, y, c);
    }
  }
  // Dán sprite. sh: độ nghiêng (số điểm hàng trên cùng lệch sang phải). fn: đổi ký tự theo vị trí (hoa văn áo).
  function blit(rows, x, y, pal, sh, fn) {
    const h = rows.length;
    for (let j = 0; j < h; j++) {
      const r = rows[j], o = sh ? Math.round((sh * (h - 1 - j)) / Math.max(1, h - 1)) : 0;
      for (let i = 0; i < r.length; i++) {
        let ch = r.charCodeAt(i);
        if (ch === 46) continue;
        if (fn) ch = fn(ch, i, j);
        const c = pal.T[ch];
        if (c) P(x + i + o, y + j, c);
      }
    }
  }
  const dk = (c) => mixi(c, INK, 0.55);
  // Gộp lớp đang vẽ xuống ảnh chính. inner: làm tối một điểm quanh lớp để tách khối (viền trong).
  function commit(inner, mask) {
    if (bx1 < 0) { T = lay; return; }
    const xa = Math.max(1, bx0 - 1), xb = Math.min(BW - 2, bx1 + 1), ya = Math.max(1, by0 - 1), yb = Math.min(BH - 2, by1 + 1);
    if (inner) {
      for (let y = ya; y <= yb; y++) {
        let i = y * BW + xa;
        for (let x = xa; x <= xb; x++, i++) {
          if (lay[i] || !main[i]) continue;
          if (lay[i - 1] || lay[i + 1] || lay[i - BW] || lay[i + BW]) main[i] = dk(main[i]);
        }
      }
    }
    const m = mask ? 1 : 0;
    for (let y = ya; y <= yb; y++) {
      let i = y * BW + xa;
      for (let x = xa; x <= xb; x++, i++) if (lay[i]) { main[i] = lay[i]; wm[i] = m; lay[i] = 0; }
    }
    bx0 = BW; bx1 = -1; by0 = BH; by1 = -1;
    T = lay;
  }
  // Xoay ảnh chính quanh (px, py), lấy mẫu gần nhất; viền sẽ được vẽ lại sau nên vẫn nét.
  function rotate(deg, px, py, dx, dy) {
    const r = (deg * Math.PI) / 180, cs = Math.cos(r), sn = Math.sin(r);
    tmp.fill(0);
    for (let y = 0; y < BH; y++) for (let x = 0; x < BW; x++) {
      const rx = x - OX - px - dx, ry = y - OY - py - dy;
      const sx = Math.round(rx * cs + ry * sn + px) + OX, sy = Math.round(-rx * sn + ry * cs + py) + OY;
      if (sx >= 0 && sx < BW && sy >= 0 && sy < BH) tmp[y * BW + x] = main[sy * BW + sx];
    }
    main.set(tmp);
  }
  // Dời ảnh chính sao cho điểm thấp nhất nằm sát mặt đất.
  function ground(up) {
    let by = -1;
    for (let y = BH - 1; y >= 0 && by < 0; y--) for (let x = 0; x < BW; x++) if (main[y * BW + x]) { by = y; break; }
    const d = OY - 1 - by - (up || 0);
    if (by < 0 || !d) return;
    tmp.fill(0);
    for (let y = 0; y < BH; y++) { const s = y - d; if (s >= 0 && s < BH) for (let x = 0; x < BW; x++) tmp[y * BW + x] = main[s * BW + x]; }
    main.set(tmp);
  }

  // ---------- sprite ----------
  // s S z: da | h H j: tóc | a A q: đồ đội đầu (đổi theo mũ) | c C x: áo (đổi theo áo giáp) | d D v: vải phụ
  // l L k: da thuộc | b B g: trắng | y Y u: vàng | r R p: đỏ | e E: mắt | w: lòng trắng | o: miệng | 1: nét tối
  const SP = {
    smithHead: [
      '....jhhhhj...',
      '..jhhHHhhhhj.',
      '.jhhHHhhhhhhj',
      '.jhhhhhhhhhhh',
      '.qaaaaAAAaaaa',
      '.qqaaaaaaaaaa',
      '.jhzssjjssjjs',
      '.jhssswEsssEs',
      '.zsssswesssez',
      '.zzssssssSss.',
      '..zsssssooz..',
      '...zzssssz...',
    ],
    hunterHead: [
      '...jhhhhhj...',
      '..jhhhhhhhhj.',
      '.jhhhhhhhhhhj',
      '.jhzzzzzzzzzz',
      '.jhzzzwEzzzEz',
      '.jzssswesssez',
      '.zzsssssssSs.',
      '..zsssssoss..',
      '...zsssssz...',
      '....zzzzz....',
    ],
    hat: [
      '.........aAa.........',
      '.......qaaAAaa.......',
      '.....qqaaaaAAAaa.....',
      '...qqaaaaaaaAAAAaa...',
      '.qqqaaaaaaaaaaAAAAaa.',
      'qqqaaaaaaaaaaaaaaAAAa',
      '.qqqqqqqqqqqqqqqqqqq.',
    ],
    healerHead: [
      '....qaaaaa...',
      '..qaaaAAAAa..',
      '.qaaaaaaAAAaq',
      '.qaaqqaaaAAaa',
      '.qqaaaqqaaaaa',
      '.qaaaaaaqqaaa',
      '.gbzsssssssss',
      '.gbssBBsssBBs',
      '.zsssseessses',
      '..zssssssSss.',
      '..gbBBBBBBb..',
      '...gbBBBBb...',
    ],
    beard: [
      'gbBBBBb',
      'gbBBBBb',
      '.gbBBBb',
      '.gbBBb.',
      '..gbBb.',
      '..gbb..',
      '...gb..',
      '...b...',
    ],
    wrestHead: [
      '...jhhhhhhj..',
      '..jhhhHHhhhhj',
      '.jhhhhhhhhhhh',
      '.jhzsssssssss',
      '.jzsjjjssjjjs',
      '.zssswEsssEss',
      '.zsssweSssess',
      '.zzsssssssss.',
      '..zssooooss..',
      '..zzsssssss..',
      '...zzzzzzz...',
    ],
    knot: [
      '.jhh.',
      'jhHhj',
      '.jhh.',
      '..a..',
    ],
    smithT: [
      '..xcccccc..',
      '.xccCCcccc.',
      '.xcllllccc.',
      '.xclLllllc.',
      '.xclLllylc.',
      '.xclLllllc.',
      '.xclLlllkc.',
      '.kkkkyykkk.',
      '.xlLlllllk.',
      '..lLllllk..',
      '..lLllllk..',
      '..kllllkk..',
    ],
    hunterT: [
      '.xcccccc.',
      'xccCCcccl',
      'xccCcclLc',
      'xcccclLcc',
      'xccclLccc',
      'xcclLcccc',
      'xclLccccc',
      'xlLcccccc',
      'kkkyykkkk',
      'xccCccccx',
      'xccCccccx',
      '.xccccxx.',
    ],
    quiver: [
      'r.b...',
      'rpbg..',
      'kLLk..',
      'klLLk.',
      '.klLLk',
      '..klLL',
      '...klL',
      '....kl',
    ],
    healerT: [
      '..xcbBc..',
      '.xccbBcc.',
      '.xcbBccc.',
      '.xbBcCcc.',
      '.xccCccx.',
      '.xccCccx.',
      '.yyyYYyu.',
      '.xccCccx.',
      '.xccCccx.',
    ],
    gourd: [
      '.k.',
      '.y.',
      'yYy',
      'uyy',
    ],
    wrestT: [
      '....zssssssssss....',
      '..zzsssSSSSsssssz..',
      '.zsssSSSSsssssssss.',
      '.zssSSssssssssssss.',
      '.zsssssssszssssssz.',
      '.zsssssszzzsssszzz.',
      '.zzsssssssssssssz..',
      '..zssssszsssszssz..',
      '..zsssssssssssssz..',
      '...zssszssszsssz...',
      '...zssssssssssz....',
      '...rrRRRrrrrrrp....',
      '...prrrrrrrrrrp....',
      '....zs.prRrp.sz....',
      '.......prRrp.......',
      '.......prrrp.......',
      '........ppp........',
    ],
    // dây chéo và miếng vai khi Đô Vật mặc áo
    wrestArmor: [
      '...........xcCCCc..',
      '..........xcCCCcccx',
      '.........xcc.xcccx.',
      '........xcc........',
      '.......xcc.........',
      '......xcc..........',
      '.....xcc...........',
      '....xcc............',
      '...xcc.............',
      '...xcCCCCCcccccx...',
      '...xccccccccccx....',
    ],
    boot: ['lll..', 'llLl.', 'kkkkk'],
    sandal: ['sk...', 'sskS.', 'kkkkk'],
    shoe: ['11...', '111g.', 'gggg.'],
    bare: ['sss...', 'ssssS.', 'zzssss'],
    horn: ['.L', 'lL', 'lk'],
    fin: ['..A...', '.AaA..', 'AaaaA.', 'aaaqaa'],
    ear: ['B..', 'Br.', 'BrB'],
    bottle: ['.b.', 'gGg', 'GGG'],
  };

  // ---------- bảng màu ----------
  const HP = {
    smith: { s: '#e9b083', h: '#3a2620', a: '#d8372d', c: '#d9933f', d: '#4e4a60', l: '#6c402a' },
    hunter: { s: '#e0a676', h: '#3a2418', a: '#e8cc80', c: '#5c9a40', d: '#b89662', l: '#7a4a2a' },
    healer: { s: '#e6bb97', h: '#d8d8e0', a: '#2f3a80', c: '#4658ac', d: '#2c3878', l: '#6a4a2e' },
    wrestler: { s: '#cf8f5e', h: '#261a16', a: '#d0382e', c: '#8a6a52', d: '#d0382e', l: '#6a4a2e' },
  };
  const ARMOR_COL = { a_r1: '#a89872', a_r2: '#4a7f9a', a_r3: '#8a7a74', a_moc: '#7a5632', a_ngu: '#3f8fb5', a_ho: '#f0ece2' };
  const HELM_COL = { h_r1: '#d9b46a', h_r2: '#4a7f9a', h_r3: '#b0502a', h_moc: '#8a6a44', h_ngu: '#5fb0d0', h_ho: '#f4f1ea' };
  function tri(o, ch, base, lk, dkk) {
    o[ch[0]] = base; o[ch[1]] = light(base, lk); o[ch[2]] = dark(base, dkk);
  }
  const PALS = new Map();
  function palette(key, helm, armor) {
    const id = key + '|' + (helm || '') + '|' + (armor || '');
    let ps = PALS.get(id);
    if (ps) return ps;
    const H = HP[key];
    const o = {};
    tri(o, 'sSz', hx(H.s), 0.4, 0.34);
    tri(o, 'hHj', hx(H.h), 0.3, 0.45);
    let acc = hx(H.a);
    if (helm && HELM_COL[helm]) acc = key === 'hunter' ? mixi(hx(HELM_COL[helm]), acc, 0.35) : hx(HELM_COL[helm]);
    tri(o, 'aAq', acc, 0.36, 0.4);
    tri(o, 'cCx', armor && ARMOR_COL[armor] ? hx(ARMOR_COL[armor]) : hx(H.c), 0.34, 0.4);
    tri(o, 'dDv', hx(H.d), 0.3, 0.4);
    tri(o, 'lLk', hx(H.l), 0.3, 0.42);
    tri(o, 'bBg', hx('#eceaf0'), 0.6, 0.3);
    tri(o, 'yYu', GOLD, 0.5, 0.42);
    tri(o, 'rRp', hx('#d0382e'), 0.34, 0.42);
    tri(o, 'mMn', hx('#b9c0c9'), 0.5, 0.42);
    o.G = hx('#7cc85a');
    o.e = o.E = INK; o.w = WHITE; o['1'] = hx('#2a2030');
    o.o = mixi(o.z, hx('#7a2a2a'), 0.55);
    const mk = (src, f) => {
      const p = { T: new Uint32Array(128) };
      for (const k in src) { const v = f ? f(src[k], k) : src[k]; p[k] = v; p.T[k.charCodeAt(0)] = v; }
      return p;
    };
    const pal = mk(o);
    const eyeSkin = key === 'hunter' ? o.z : o.s;
    ps = {
      pal,
      far: mk(o, (v) => mixi(v, SHADE, 0.24)), // tay chân phía xa: tối hơn để tạo chiều sâu
      shut: mk(o, (v, k) => (k === 'E' || k === 'w' ? eyeSkin : v)), // mắt nhắm
    };
    PALS.set(id, ps);
    return ps;
  }

  // ---------- thông số từng hero ----------
  const HS = {
    smith: { hipY: -13, hipF: -2, hipB: 2, legW: 3, th: 5.6, sh: 5.6, torso: 'smithT', tCx: 5, tBot: 2, shF: [-3, 2], shB: [3, 2], up: 5, fo: 5, armW: 3, hand: 3, head: 'smithHead', hCx: 5, hOv: 1, foot: 'boot', shadow: 9 },
    hunter: { hipY: -13, hipF: -2, hipB: 2, legW: 3, th: 5.6, sh: 5.6, torso: 'hunterT', tCx: 4, tBot: 2, shF: [-2, 2], shB: [3, 2], up: 5, fo: 5, armW: 3, hand: 3, head: 'hunterHead', hCx: 5, hOv: 1, foot: 'sandal', shadow: 9 },
    healer: { hipY: -12, hipF: -1, hipB: 2, legW: 2, th: 5, sh: 5, torso: 'healerT', tCx: 4, tBot: 0, shF: [-2, 2], shB: [3, 2], up: 5, fo: 5, armW: 3, hand: 3, head: 'healerHead', hCx: 5, hOv: 1, foot: 'shoe', shadow: 9 },
    wrestler: { hipY: -14, hipF: -4, hipB: 4, legW: 5, th: 6.2, sh: 6.2, torso: 'wrestT', tCx: 9, tBot: 4, shF: [-6, 3], shB: [7, 3], up: 6, fo: 6, armW: 5, hand: 4, head: 'wrestHead', hCx: 5, hOv: 1, foot: 'bare', shadow: 13 },
  };

  // ---------- khung xương ----------
  const D2R = Math.PI / 180;
  function ik(sx, sy, tx, ty, l1, l2, bend) {
    const dx = tx - sx, dy = ty - sy, d = Math.max(0.001, Math.hypot(dx, dy));
    const m = l1 + l2;
    if (d > m) { const k = d / m; l1 *= k; l2 *= k; }
    const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
    const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    const ux = dx / d, uy = dy / d;
    return [sx + ux * a + uy * bend * h, sy + uy * a - ux * bend * h];
  }
  const fk = (s, a1, a2, l1, l2) => {
    const e = [s[0] + Math.sin(a1 * D2R) * l1, s[1] + Math.cos(a1 * D2R) * l1];
    return { s, e, h: [e[0] + Math.sin(a2 * D2R) * l2, e[1] + Math.cos(a2 * D2R) * l2] };
  };
  const R = Math.round;
  const lerp = (a, b, k) => a + (b - a) * k;

  function hand(h, pal, size) {
    const x = R(h[0]) - 1, y = R(h[1]) - 1;
    if (size >= 4) {
      rect(x, y - 1, 4, 4, pal.s);
      P(x + 3, y - 1, pal.S); P(x + 2, y - 1, pal.S); P(x + 3, y, pal.S);
      P(x, y + 2, pal.z); P(x + 1, y + 2, pal.z); P(x, y + 1, pal.z);
    } else {
      rect(x, y, 3, 3, pal.s);
      P(x + 2, y, pal.S); P(x + 1, y, pal.S);
      P(x, y + 2, pal.z);
    }
  }
  function drawArm(key, H, a, pal) {
    const w = H.armW, s = a.s, e = a.e, h = a.h;
    const at = (p, q, k) => [lerp(p[0], q[0], k), lerp(p[1], q[1], k)];
    if (key === 'smith') {
      limb(s[0], s[1], e[0], e[1], w, pal.s, pal.z, pal.S);
      limb(e[0], e[1], h[0], h[1], w, pal.s, pal.z, pal.S);
      const c = at(s, e, 0.25);
      limb(s[0], s[1], c[0], c[1], w, pal.c, pal.x, pal.C); // tay áo ngắn
      const m = at(e, h, 0.4);
      P(R(m[0]), R(m[1]), pal.z); // vết muội than
      const b = at(e, h, 0.72);
      tline(b[0], b[1], b[0], b[1], w, pal.l);
    } else if (key === 'hunter') {
      limb(s[0], s[1], e[0], e[1], w, pal.c, pal.x, pal.C);
      limb(e[0], e[1], h[0], h[1], w, pal.s, pal.z, pal.S);
      const b0 = at(e, h, 0.3), b1 = at(e, h, 0.75);
      limb(b0[0], b0[1], b1[0], b1[1], w, pal.l, pal.k, pal.L); // bao tay da
    } else if (key === 'healer') {
      limb(s[0], s[1], e[0], e[1], w, pal.c, pal.x, pal.C);
      limb(e[0], e[1], h[0], h[1], w, pal.c, pal.x, pal.C);
      const b0 = at(e, h, 0.45), b1 = at(e, h, 0.85);
      limb(b0[0], b0[1], b1[0], b1[1], w + 1, pal.c, pal.x, pal.C); // ống tay rộng
      tline(b1[0], b1[1], b1[0], b1[1], w + 1, pal.b, 0, 0);
    } else {
      limb(s[0], s[1], e[0], e[1], w, pal.s, pal.z, pal.S);
      limb(e[0], e[1], h[0], h[1], w - 1, pal.s, pal.z, pal.S);
      const b0 = at(e, h, 0.55), b1 = at(e, h, 0.8);
      limb(b0[0], b0[1], b1[0], b1[1], w - 1, pal.r, pal.p, pal.R); // băng cổ tay
    }
    hand(h, pal, H.hand);
  }
  function drawLeg(key, H, hxp, hyp, ax, ay, pal) {
    const k = ik(hxp, hyp, ax, ay, H.th, H.sh, 1);
    const w = H.legW;
    if (key === 'wrestler') {
      limb(hxp, hyp, k[0], k[1], w, pal.s, pal.z, pal.S);
      limb(k[0], k[1], ax, ay, w - 1, pal.s, pal.z, pal.S);
      tline(ax, ay, ax, ay, w - 1, pal.r);
      blit(SP.bare, R(ax) - 2, R(ay), pal);
    } else if (key === 'hunter') {
      limb(hxp, hyp, k[0], k[1], w, pal.d, pal.v, pal.D);
      limb(k[0], k[1], ax, ay, w, pal.D, pal.d, pal.b); // xà cạp
      for (const q of [0.35, 0.7]) { const m = [lerp(k[0], ax, q), lerp(k[1], ay, q)]; P(R(m[0]) - 1, R(m[1]), pal.v); P(R(m[0]), R(m[1]), pal.v); P(R(m[0]) + 1, R(m[1]), pal.v); }
      blit(SP.sandal, R(ax) - 1, R(ay), pal);
    } else if (key === 'healer') {
      limb(hxp, hyp, k[0], k[1], w, pal.d, pal.v);
      limb(k[0], k[1], ax, ay, w, pal.d, pal.v);
      blit(SP.shoe, R(ax) - 1, R(ay), pal);
    } else {
      limb(hxp, hyp, k[0], k[1], w, pal.d, pal.v, pal.D);
      limb(k[0], k[1], ax, ay, w, pal.d, pal.v, pal.D);
      tline(ax, ay - 1, ax, ay, w, pal.l);
      blit(SP.boot, R(ax) - 1, R(ay), pal);
    }
  }
  // Dải vải bay (đuôi khăn, đuôi đai): chuỗi điểm uốn theo sóng.
  function ribbon(x, y, len, ang, amp, ph, c1, c2) {
    const r = ang * D2R, cs = Math.cos(r), sn = Math.sin(r);
    for (let i = 0; i < len; i++) {
      const w = Math.sin(ph + i * 0.9) * amp * (i / len);
      const px = R(x + cs * i - sn * w), py = R(y + sn * i + cs * w);
      P(px, py, c1);
      if (i < len - 1) { if (Math.abs(cs) > 0.7) P(px, py + 1, c2); else P(px + 1, py, c2); }
    }
  }
  // Áo dài của Thầy Lang: vạt áo phủ từ hông xuống mắt cá, ôm theo hai bàn chân.
  function robe(hipX, hipY, ps, pal) {
    const yb = -3;
    const l = Math.min(ps.ffx, ps.bfx) - 2, r = Math.max(ps.ffx, ps.bfx) + 2;
    const n = yb - hipY;
    for (let y = hipY; y <= yb; y++) {
      const k = n > 0 ? (y - hipY) / n : 1, kk = Math.pow(k, 0.7);
      const sw = R(ps.sw2 * k * (0.6 + ps.wind) - ps.wind * 2 * k * k);
      const xl = R(lerp(hipX - 3, Math.min(l, hipX - 4), kk)) + sw, xr = R(lerp(hipX + 3, Math.max(r, hipX + 4), kk)) + (sw > 0 ? sw : 0);
      const f1 = xl + R((xr - xl) * 0.42), f2 = xl + R((xr - xl) * 0.74);
      for (let x = xl; x <= xr; x++) {
        let c = pal.c;
        if (x <= xl + 1 || (x === f1 && k > 0.2) || (x === f2 && k > 0.45)) c = pal.x;
        else if ((x === f1 + 1 && k > 0.2) || x === xr) c = pal.C;
        if (y === yb) c = x % 3 === 0 ? pal.Y : pal.y;
        P(x, y, c);
      }
    }
  }

  // ---------- vũ khí ----------
  function wcol(look) {
    if (look.el && G.EL[look.el]) {
      const E = G.EL[look.el];
      return { mid: hx(E.col), light: hx(E.col2), dark: hx(E.dark), core: mixi(hx(E.col2), WHITE, 0.5), el: look.el };
    }
    const b = hx(look.col || '#b9c0c9');
    return { mid: b, light: mixi(b, WHITE, 0.6), dark: mixi(b, hx('#3a3a5a'), 0.5), core: mixi(b, WHITE, 0.3), el: null };
  }
  const wlen = (look) => (look.type === 'sword' ? 17 + look.stage * 2 : look.type === 'hammer' ? 17 + look.stage : look.type === 'spear' ? 28 + look.stage : 0);
  // Vẽ vũ khí từ điểm cầm (gx, gy) theo góc wa (độ; 0 chĩa ra trước, âm chĩa lên). Hạt hiệu ứng đi vào lớp fxb.
  function drawWeapon(look, gx, gy, wa, ps, seed) {
    const r = wa * D2R, cs = Math.cos(r), sn = Math.sin(r);
    const st = look.stage, W = wcol(look), el = W.el;
    const U = (u, v) => [gx + u * cs - v * sn, gy + u * sn + v * cs];
    const wp = (arr, c) => poly(arr.map((p) => U(p[0], p[1])), c);
    const wl = (u0, v0, u1, v1, t, c) => { const a = U(u0, v0), b = U(u1, v1); tline(a[0], a[1], b[0], b[1], t, c); };
    const wpx = (u, v, c) => { const a = U(u, v); P(R(a[0]), R(a[1]), c); };
    const ls = cs >= 0 ? -1 : 1; // phía nhận sáng
    const rnd = (k) => { const v = Math.sin((seed + 1) * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
    let tipU = 0; // vị trí đầu vũ khí để rắc hạt
    if (look.type === 'sword') {
      const L = 17 + st * 2, hw = [1.2, 1.2, 1.5, 2][st];
      wl(-3, 0, 2, 0, 2, WOOD);
      wpx(-4, 0, GOLD); if (st >= 2) wpx(-5, 0, GOLDL);
      let top = [[4, -hw], [L - 3, -hw], [L, 0]], bot = [[L - 3, hw], [4, hw]];
      if (el === 'fire' && st >= 3) {
        // lưỡi lửa lượn sóng
        top = [[4, -hw], [7, -hw - 1.2], [10, -hw + 0.4], [13, -hw - 1.2], [16, -hw + 0.4], [L - 2, -hw - 0.6], [L + 1, 0]];
        bot = [[L - 3, hw], [15, hw + 1], [12, hw - 0.4], [9, hw + 1], [6, hw - 0.4], [4, hw]];
      } else if (el === 'ice' && st >= 2) {
        top = [[4, -hw - 1], [L - 6, -hw], [L, 0]]; bot = [[L - 6, hw], [4, hw + 1]];
      }
      wp(top.concat(bot), W.mid);
      wp([[4, ls * hw], [L - 3, ls * hw], [L, 0], [4, 0]], W.light);
      wl(4, -ls * hw, L - 3, -ls * hw, 1, W.dark);
      if (el) wl(5, 0, L - 3, 0, 1, W.core);
      if (el === 'poison' && st >= 2) for (let u = 6; u < L - 4; u += 4) wp([[u, ls * hw], [u + 0.5, ls * (hw + 2.4)], [u + 2.4, ls * hw]], W.mid); // gai
      if (el === 'ice' && st >= 2) { wp([[3, -2], [7, -5 - st], [8, -1]], W.light); wp([[3, 2], [6, 4 + st], [8, 1]], W.mid); } // tinh thể ở chuôi
      const gw = 3 + (st > 0 ? 1 : 0) + (st > 2 ? 1 : 0);
      wl(3, -gw, 3, gw, 2, el && st >= 2 ? W.dark : GOLDD);
      wl(3, -gw + 1, 3, gw - 1, 1, el && st >= 2 ? W.mid : GOLD);
      tipU = L;
    } else if (look.type === 'hammer') {
      const HL = 14 + st, hu = 3.5 + (st >= 2 ? 1 : 0), hv = 6 + (st >= 1 ? 1 : 0) + (st >= 3 ? 1 : 0);
      wl(-4, 0, HL, 0, 2, WOODD); wl(-4, 0, HL, 0, 1, WOOD);
      wpx(-5, 0, GOLD);
      if (el === 'ice' && st >= 2) {
        wp([[HL - hu - 1, 0], [HL - hu + 1, -hv], [HL + hu, -hv - 1], [HL + hu + 2, 0], [HL + hu, hv + 1], [HL - hu + 1, hv]], W.mid);
        wp([[HL - hu + 1, ls * hv], [HL + hu, ls * (hv + 1)], [HL + hu + 1, ls * 1], [HL - hu + 1, ls * 2]], W.light);
        wl(HL - 1, -ls * 2, HL + hu, -ls * (hv - 1), 1, W.dark);
      } else {
        wp([[HL - hu, -hv], [HL + hu, -hv], [HL + hu, hv], [HL - hu, hv]], el ? mixi(W.mid, W.dark, 0.45) : mixi(W.mid, hx('#4a4a60'), 0.4));
        wp([[HL - hu, ls * hv], [HL + hu, ls * hv], [HL + hu, ls * (hv - 2)], [HL - hu, ls * (hv - 2)]], W.light);
        wp([[HL - hu, -ls * hv], [HL + hu, -ls * hv], [HL + hu, -ls * (hv - 1.6)], [HL - hu, -ls * (hv - 1.6)]], W.dark);
        wl(HL - hu, -hv, HL - hu, hv, 1, W.dark);
        if (el) { wp([[HL - 1, -hv + 3], [HL + 1, -hv + 3], [HL + 1, hv - 3], [HL - 1, hv - 3]], W.mid); wl(HL, -hv + 3, HL, hv - 3, 1, st >= 2 ? W.core : W.light); }
        if (el === 'poison' && st >= 2) for (const s of [-1, 1]) for (const u of [HL - 2, HL + 2]) wp([[u - 1.4, s * hv], [u, s * (hv + 2.6)], [u + 1.4, s * hv]], W.mid);
        if (!el) { wl(HL, -hv + 2, HL, hv - 2, 1, W.dark); }
      }
      tipU = HL;
    } else if (look.type === 'spear') {
      const BL = 7 + st, hw = st >= 2 ? 2.6 : 2;
      wl(-13, 0, 21, 0, 2, WOODD); wl(-13, 0, 21, 0, 1, WOODL);
      if (st >= 3) for (const s of [-1, 1]) wp([[21, s * 1], [18, s * (hw + 3.4)], [24, s * (hw + 0.4)]], W.mid); // ngạnh
      wp([[20, 0], [23, -hw], [21 + BL, 0], [23, hw]], W.mid);
      wp([[20, 0], [23, ls * hw], [21 + BL, 0]], W.light);
      if (el) wl(22, 0, 19 + BL, 0, 1, W.core);
      if (el === 'poison' && st >= 2) wp([[23, ls * hw], [22, ls * (hw + 2.4)], [25.5, ls * hw]], W.mid);
      wl(19, -1.6, 19, 1.6, 1, st >= 1 ? GOLD : hx('#6a6a78'));
      // tua đỏ rủ xuống
      const t0 = U(17, 0), rd = hx('#d0382e'), rdd = hx('#8a1f1a');
      const sw = R((ps.sw || 0) * 1.2 - (ps.wind || 0) * 2);
      P(R(t0[0]), R(t0[1]) + 1, rd); P(R(t0[0]), R(t0[1]) + 2, rd); P(R(t0[0]) + sw, R(t0[1]) + 3, rd); P(R(t0[0]) + sw, R(t0[1]) + 4, rdd);
      P(R(t0[0]) - 1, R(t0[1]) + 1, rdd); P(R(t0[0]) - 1 + sw, R(t0[1]) + 3, rdd);
      tipU = 21 + BL;
    } else if (look.type === 'bow') {
      const h = 10 + st, pull = ps.pull || 0;
      const bw = el ? W.mid : WOOD, bl = el ? W.light : WOODL, bd = el ? W.dark : WOODD;
      const cu = (v) => 3 - 5.5 * (v / h) * (v / h) + (Math.abs(v) > h - 2 ? 1.2 : 0);
      for (let v = -h; v <= h; v += 0.5) {
        const a = U(cu(v), v), thick = Math.abs(v) < h * 0.62;
        if (thick) { rect(R(a[0]) - 1, R(a[1]), 2, 1, bd); P(R(a[0]), R(a[1]), bw); } else P(R(a[0]), R(a[1]), bw);
      }
      for (let v = -h * 0.5; v <= h * 0.5; v += 0.5) { const a = U(cu(v), v); if (ls * v > 0.8) P(R(a[0]), R(a[1]), bl); }
      wl(3, -1.5, 3, 1.5, 2, st >= 1 ? GOLDD : hx('#5a3a22')); wl(3, -1, 3, 1, 1, st >= 1 ? GOLD : hx('#8a5a34'));
      const s0 = U(cu(-h), -h), s1 = U(cu(h), h), sm = U(-2.5 - pull, 0), str = hx('#efe8d6');
      tline(s0[0], s0[1], sm[0], sm[1], 1, str); tline(sm[0], sm[1], s1[0], s1[1], 1, str);
      if (st >= 2) for (const s of [-1, 1]) {
        if (el === 'ice') wp([[cu(h) - 1, s * (h - 1)], [cu(h) + 3, s * (h + 3)], [cu(h) + 2, s * (h - 2)]], W.light);
        else wp([[cu(h) - 1, s * (h - 1)], [cu(h) + 1, s * (h + 2 + (st > 2 ? 1 : 0))], [cu(h) + 2.5, s * (h - 1)]], el === 'fire' ? W.light : W.mid);
      }
      if (ps.arrow) {
        const a0 = U(-2.5 - pull, 0), a1 = U(12 - pull, 0), a2 = U(15 - pull, 0);
        tline(a0[0], a0[1], a1[0], a1[1], 1, hx('#e6d2a4'));
        tline(a1[0], a1[1], a2[0], a2[1], ps.arrow > 1 ? 2 : 1, el ? W.light : hx('#e8eef5'));
        wpx(-1.5 - pull, -1, WHITE); wpx(-1.5 - pull, 1, WHITE);
      }
      tipU = 4;
    }
    // hạt theo hệ: tàn lửa bay lên, giọt độc rơi xuống, bụi băng lấp lánh
    if (el && (st >= 1 || look.coat)) {
      const save = T; T = fxb;
      const n = 1 + (st >= 2 ? 1 : 0) + (st >= 3 ? 1 : 0);
      const lo = look.type === 'hammer' ? tipU - 3 : look.type === 'bow' ? -2 : 5, span = look.type === 'bow' ? 1 : tipU - lo;
      for (let i = 0; i < n; i++) {
        const u = lo + rnd(i) * span, v = look.type === 'bow' ? (rnd(i + 9) - 0.5) * 18 : (rnd(i + 5) - 0.5) * 4;
        const a = U(u, v), x = R(a[0]), y = R(a[1]);
        if (el === 'fire') { const up = 2 + R(rnd(i + 3) * 4); P(x, y - up, W.light); if (rnd(i + 7) > 0.5) P(x + 1, y - up - 2, W.mid); }
        else if (el === 'poison') { const dn = 3 + R(rnd(i + 3) * 4); P(x, y + dn, W.mid); P(x, y + dn + 1, W.dark); }
        else { const ox = R((rnd(i + 3) - 0.5) * 6), oy = -1 - R(rnd(i + 4) * 3); P(x + ox, y + oy, WHITE); if (st >= 2 && i === 0) { P(x + ox - 1, y + oy, W.light); P(x + ox + 1, y + oy, W.light); P(x + ox, y + oy - 1, W.light); P(x + ox, y + oy + 1, W.light); } }
      }
      T = save;
    }
    return U(tipU, 0);
  }
  // Vệt chém hình lưỡi liềm quanh (cx, cy) từ góc a0 tới a1; sy < 1 làm dẹt để ra nhát chém ngang.
  function smear(cx, cy, a0, a1, r0, r1, sy, col, al) {
    const save = T; T = fxb;
    const n = 10, pts = [];
    for (let i = 0; i <= n; i++) { const a = (a0 + ((a1 - a0) * i) / n) * D2R; pts.push([cx + Math.cos(a) * r1, cy + Math.sin(a) * r1 * sy]); }
    for (let i = n; i >= 0; i--) { const a = (a0 + ((a1 - a0) * i) / n) * D2R, rr = r1 - (r1 - r0) * Math.pow(i / n, 1.5); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * sy]); }
    poly(pts, alpha(col, al));
    // mép ngoài sáng hơn
    for (let i = 0; i < n * 3; i++) { const k = 0.35 + (0.65 * i) / (n * 3), a = (a0 + (a1 - a0) * k) * D2R; P(R(cx + Math.cos(a) * r1), R(cy + Math.sin(a) * r1 * sy), alpha(WHITE, Math.min(1, al + 0.15))); }
    T = save;
  }

  // ---------- dựng một khung hình ----------
  function render(key, ps, look, palset, eq, seed, mode) {
    const H = HS[key], pal = ps.shut ? palset.shut : palset.pal, far = palset.far;
    main.fill(0); lay.fill(0); fxb.fill(0); wm.fill(0);
    T = lay; bx0 = BW; bx1 = -1; by0 = BH; by1 = -1;
    const hipX = R(ps.hx), hipY = H.hipY + R(ps.hy), lean = R(ps.lean);
    const trs = SP[H.torso], tH = trs.length;
    const tTop = hipY + H.tBot - tH + 1;
    const nx = hipX + lean, ny = tTop;
    const sF = [nx + H.shF[0], tTop + H.shF[1]], sB = [nx + H.shB[0], tTop + H.shB[1]];
    let F = fk(sF, ps.fA, ps.fB, H.up, H.fo), B = fk(sB, ps.bA, ps.bB, H.up, H.fo);
    const wt = look && !ps.noW ? look.type : 'none';
    const bow = wt === 'bow';
    const wr = ps.wa * D2R, wcs = Math.cos(wr), wsn = Math.sin(wr);
    if (ps.two && wt !== 'none') {
      if (bow) {
        const tx = B.h[0] - wcs * (2.5 + ps.pull), ty = B.h[1] - wsn * (2.5 + ps.pull);
        const e = ik(sF[0], sF[1], tx, ty, H.up, H.fo, -1);
        F = { s: sF, e, h: [tx, ty] };
      } else {
        const g = ps.g2 || 5;
        const tx = F.h[0] + wcs * g, ty = F.h[1] + wsn * g;
        const e = ik(sB[0], sB[1], tx, ty, H.up, H.fo, -1);
        B = { s: sB, e, h: [tx, ty] };
      }
    }
    const grip = bow ? B.h : F.h;
    const gx = R(grip[0]), gy = R(grip[1]);
    let tip = null;
    const weaponLayer = () => { tip = drawWeapon(look, gx, gy, ps.wa, ps, seed); commit(true, true); };

    // 1. đồ đeo sau lưng
    if (key === 'hunter') {
      blit(SP.quiver, nx - 10, tTop + 2, pal);
      commit(false);
    } else if (key === 'wrestler') {
      // đuôi đai đỏ sau hông
      ribbon(hipX - 6, hipY - 2, 6, lerp(110, 170, ps.wind), 1.2, ps.sw * 1.5, far.r, far.p);
      ribbon(hipX - 6, hipY - 1, 4, lerp(95, 150, ps.wind), 1, ps.sw2 * 1.5, far.R, far.p);
      commit(false);
    }
    // 2. tay phía xa (và cung)
    if (bow) { weaponLayer(); hand(B.h, far, H.hand); }
    drawArm(key, H, B, far);
    commit(true);
    // 3. hai chân
    const fay = -3 + ps.ffy, bay = -3 + ps.bfy;
    drawLeg(key, H, hipX + H.hipB, hipY, ps.bfx, bay, far); commit(true);
    drawLeg(key, H, hipX + H.hipF, hipY, ps.ffx, fay, pal); commit(true);
    // 4. vạt áo dài
    if (key === 'healer') { robe(hipX, hipY, ps, eq.armor ? palette(key, eq.helm, null).pal : pal); commit(true); }
    // 5. thân
    let fn = null;
    const A_ = eq.armor;
    if (A_) {
      const cc = 99, cC = 67, cx_ = 120; // c, C, x
      if (A_ === 'a_r2') fn = (ch, i, j) => (ch === cc && j % 3 === 2 ? cx_ : ch);
      else if (A_ === 'a_r3') fn = (ch, i, j) => (ch === cc && i % 3 === 1 && j % 3 === 1 ? cC : ch === cc && (i + j) % 5 === 0 ? cx_ : ch);
      else if (A_ === 'a_moc') fn = (ch, i, j) => (ch === cc && (i * 2 + ((j / 3) | 0)) % 5 === 0 ? cx_ : ch);
      else if (A_ === 'a_ngu') fn = (ch, i, j) => (ch === cc && (i + (j % 2)) % 2 === 0 ? (j % 2 ? cx_ : cC) : ch);
    }
    blit(trs, hipX - H.tCx, tTop, pal, lean, fn);
    if (key === 'wrestler' && A_) blit(SP.wrestArmor, hipX - H.tCx, tTop, pal, lean, fn);
    if (A_ === 'a_ho' && key !== 'wrestler') {
      // cổ lông trắng
      for (let i = -3; i <= 4; i++) { P(nx + i, tTop + (i === -3 || i === 4 ? 1 : 0), pal.B); P(nx + i, tTop + 1, i % 2 ? pal.b : pal.B); }
    }
    commit(true);
    if (key === 'healer') {
      // bầu hồ lô bên hông, đung đưa
      blit(SP.gourd, hipX - 5 + R(ps.sw2 * 0.6 - ps.wind), hipY - 4, pal);
      commit(true);
    }
    if (wt !== 'none' && !bow && ps.wz < 0) weaponLayer();
    // 6. đầu và đồ đội
    const hrs = SP[H.head];
    const hX = nx - H.hCx + R(ps.hdx), hY = ny - hrs.length + H.hOv + R(ps.hdy);
    const lag = ps.lag || 0;
    if (key === 'smith') {
      // hai đuôi khăn đỏ
      const ang = lerp(118, 176, ps.wind), amp = 1.1 + ps.wind * 0.6;
      ribbon(hX, hY + 5, 7, ang, amp, ps.sw * 1.6, pal.a, pal.q);
      ribbon(hX, hY + 4, 5, ang - 22, amp, ps.sw2 * 1.6 + 1, pal.A, pal.q);
      commit(false);
      blit(hrs, hX, hY, pal);
      P(hX, hY + 4, pal.q); P(hX, hY + 5, pal.a); // nút khăn
    } else if (key === 'hunter') {
      blit(hrs, hX, hY, pal);
      // quai nón
      P(hX + 2, hY + 4, pal.k); P(hX + 2, hY + 5, pal.k); P(hX + 3, hY + 6, pal.k); P(hX + 3, hY + 7, pal.k); P(hX + 4, hY + 8, pal.k);
      commit(true);
      blit(SP.hat, hX - 4, hY - 4 + lag, pal);
    } else if (key === 'healer') {
      blit(hrs, hX, hY, pal);
      commit(true);
      blit(SP.beard, hX + 4, hY + 12, pal, -R(ps.sw2 * (0.8 + ps.wind) + ps.wind * 2.4));
      commit(false);
    } else {
      blit(hrs, hX, hY, pal);
      if (eq.helm) { rect(hX + 2, hY + 2, 11, 1, pal.a); P(hX + 1, hY + 2, pal.q); rect(hX + 6, hY + 2, 3, 1, pal.A); } // khăn buộc trán
      blit(SP.knot, hX + 3, hY - 3 + lag, pal);
    }
    // phụ kiện mũ theo bộ
    const top = key === 'hunter' ? hY - 4 + lag : key === 'wrestler' ? hY : hY;
    if (eq.helm === 'h_moc') {
      const wp_ = { T: new Uint32Array(128) }; wp_.T[108] = WOOD; wp_.T[76] = WOODL; wp_.T[107] = WOODD;
      const dy = key === 'hunter' ? 1 : -2, sp = key === 'hunter' ? 4 : 0;
      blit(SP.horn, hX + 1 - sp + 3, top + dy, wp_); blit(SP.horn.map((r) => r.split('').reverse().join('')), hX + 9 + (key === 'hunter' ? 1 : 0), top + dy, wp_);
    } else if (eq.helm === 'h_ngu') {
      blit(SP.fin, hX + 2, top - (key === 'hunter' ? 2 : 3), pal);
    } else if (eq.helm === 'h_ho') {
      const dy = key === 'hunter' ? 0 : -2;
      blit(SP.ear, hX + 2, top + dy, pal); blit(SP.ear.map((r) => r.split('').reverse().join('')), hX + 9, top + dy, pal);
    }
    commit(true);
    // 7. vũ khí cầm tay và tay gần
    if (wt !== 'none' && !bow && !(ps.wz < 0)) {
      weaponLayer();
      if (ps.two) { hand(B.h, far, H.hand); commit(false); }
    }
    drawArm(key, H, F, pal);
    if (ps.fx && ps.fx.hold) blit(SP.bottle, R((ps.fx.far ? B : F).h[0]) - 1, R((ps.fx.far ? B : F).h[1]) - 3, pal);
    commit(true);
    if (ps.fx && ps.fx.far && ps.fx.throwArm) { drawArm(key, H, B, pal); commit(true); }

    // 8. xoay cả người (lăn, ngã)
    if (ps.rot) rotate(ps.rot, ps.px || 0, ps.py || 0, ps.rdx || 0, ps.rdy || 0);
    if (ps.ground) ground(ps.up);
    if (ps.drop && look) {
      // vũ khí rơi nằm trên đất
      T = lay;
      drawWeapon(look, 6, look.type === 'hammer' ? -8 : -2, look.type === 'bow' ? 80 : look.type === 'hammer' ? 0 : 4, { pull: 0, sw: 0, wind: 0 }, 0);
      commit(true, true);
    }
    if (ps.fx && ps.fx.fly) { T = lay; blit(SP.bottle, R(ps.fx.fly[0]), R(ps.fx.fly[1]), pal); commit(false); }

    // 9. hiệu ứng không viền
    T = fxb;
    const W = look ? wcol(look) : null;
    if (ps.smear && W && wt !== 'none' && !bow) {
      const s = ps.smear, rr = Math.hypot(F.h[0] - sF[0], F.h[1] - sF[1]) + wlen(look);
      smear(sF[0], sF[1] + (s.dy || 0), s.a0, s.a1, rr - (s.th || 7), rr + 1, s.sy || 1, W.el ? W.light : WHITE, s.al);
    }
    if (ps.fx) {
      const f = ps.fx;
      if (f.speed) {
        // vệt gió khi lướt
        for (let i = 0; i < 4; i++) { const y = -5 - i * 6 - ((seed + i) % 2) * 2, x = -9 - ((i * 5 + seed * 3) % 6), ln = 8 + ((i + seed) % 2) * 5; rect(x - ln, y, ln, 1, alpha(W && W.el ? W.light : WHITE, 0.75 - i * 0.1)); }
      }
      if (f.impact && tip) {
        // tia văng khi búa nện xuống
        const c = W && W.el ? W.light : hx('#fff0c0'), x = R(tip[0]), k = f.impact;
        for (const d of [[-1, -0.5], [1, -0.5], [-0.6, -1], [0.6, -1], [0, -1.2]]) for (let i = 2; i < 3 + k * 3; i++) P(x + R(d[0] * (i + k * 4)), -2 + R(d[1] * (i + k * 4)), alpha(c, 0.95));
        rect(x - 6 - R(k * 5), -1, 12 + R(k * 10), 1, alpha(c, 0.8));
      }
      if (f.ignite && tip) {
        // lửa bùng dọc vũ khí
        const fc = hx('#ff7a2a'), fy = hx('#ffd23f');
        for (let i = 0; i < 6; i++) {
          const k = (i + 0.5) / 6, x = R(lerp(gx, tip[0], k)), y = R(lerp(gy, tip[1], k));
          const hgt = R(f.ignite * (3 + ((i * 7 + seed * 3) % 4)));
          for (let j = 1; j <= hgt; j++) { P(x + (((j + seed + i) % 3) - 1 > 0 ? 1 : 0), y - j - 1, j > hgt * 0.5 ? fc : fy); }
          P(x + ((i + seed) % 3) - 1, y - hgt - 3, alpha(fy, 0.9));
        }
      }
      if (f.dust) for (let i = 0; i < 5; i++) { const x = f.dust[0] + ((i * 5 + seed * 2) % 9) - 4; P(x, -1 - ((i + seed) % 3), alpha(hx('#d8c8a8'), 0.7)); P(x + 1, -1 - ((i + seed) % 3), alpha(hx('#d8c8a8'), 0.5)); }
      if (f.flex) {
        // tia gồng quanh người
        const c = hx('#ffd27a');
        for (let i = 0; i < 6; i++) { const a = (i * 60 + 20 + seed * 17) * D2R, r0 = 20 + f.flex * 4, r1 = r0 + 3 + f.flex * 3; tline(Math.cos(a) * r0, -20 + Math.sin(a) * r0 * 0.9, Math.cos(a) * r1, -20 + Math.sin(a) * r1 * 0.9, 1, alpha(c, 0.9)); }
      }
    }
    T = lay;

    // 10. viền ngoài, nhuộm màu, cắt gọn, đưa vào canvas
    const tint = mode.flash ? [WHITE, 0.72] : mode.ice ? [hx('#a8dcf5'), 0.5] : mode.poison ? [hx('#8fd860'), 0.28] : null;
    if (tint) for (let i = 0; i < N; i++) if (main[i]) main[i] = mixi(main[i], tint[0], tint[1]);
    const oc = mode.gong ? hx('#ffcf5a') : INK;
    const wo = W && W.el ? mixi(W.dark, INK, 0.45) : INK;
    tmp.fill(0);
    let x0 = BW, x1 = -1, y0 = BH, y1 = -1;
    for (let y = 1; y < BH - 1; y++) {
      let i = y * BW + 1;
      for (let x = 1; x < BW - 1; x++, i++) {
        let c = main[i];
        if (!c) {
          const l = main[i - 1], r = main[i + 1], u = main[i - BW], d = main[i + BW];
          if (l || r || u || d) {
            const w = (l && wm[i - 1]) || (r && wm[i + 1]) || (u && wm[i - BW]) || (d && wm[i + BW]);
            const b = (l && !wm[i - 1]) || (r && !wm[i + 1]) || (u && !wm[i - BW]) || (d && !wm[i + BW]);
            c = w && !b ? wo : oc;
          }
        }
        const f = fxb[i];
        if (f) {
          const a = (f >>> 24) / 255;
          c = c ? mixi(c, (f | 0xff000000) >>> 0, a) : f;
        }
        if (c) {
          tmp[i] = c;
          if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
        }
      }
    }
    if (x1 < 0) { x0 = x1 = OX; y0 = y1 = OY; }
    const w = x1 - x0 + 1, h = y1 - y0 + 1;
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const c2 = cv.getContext('2d');
    const img = c2.createImageData(w, h);
    const out = new Uint32Array(img.data.buffer);
    for (let y = 0; y < h; y++) out.set(tmp.subarray((y + y0) * BW + x0, (y + y0) * BW + x0 + w), y * w);
    c2.putImageData(img, 0, 0);
    return { cv, ox: x0 - OX, oy: y0 - OY };
  }

  // ---------- tư thế ----------
  // Góc tay: 0 là buông thẳng xuống, 90 đưa ra trước, 180 giơ lên, âm là ra sau. Bàn chân tính theo gốc toạ độ.
  const BASE = { hx: 0, hy: 0, lean: 0, hdx: 0, hdy: 0, fA: 6, fB: 16, bA: -8, bB: 8, ffx: -3, ffy: 0, bfx: 3, bfy: 0, wa: -50, pull: 0, rot: 0, sw: 0, sw2: 0, wind: 0, lag: 0, wz: 0, two: 0, g2: 5 };
  const mk = (s, o) => Object.assign({}, s, o);
  function stand(key, wt) {
    const p = mk(BASE);
    if (wt === 'sword') { p.fA = 25; p.fB = 75; p.wa = -50; }
    else if (wt === 'hammer') { p.fA = 30; p.fB = 80; p.wa = -40; p.two = 1; p.g2 = 5; if (key === 'wrestler') { p.fA = 55; p.fB = 85; } }
    else if (wt === 'spear') { p.fA = 48; p.fB = 98; p.wa = -78; if (key === 'wrestler') { p.fA = 75; p.fB = 100; } }
    else if (wt === 'bow') { p.bA = 35; p.bB = 70; p.wa = 16; p.fA = 4; p.fB = 14; }
    if (key === 'healer') { p.lean = 1; p.hdx = 1; p.ffx = -2; p.bfx = 3; }
    if (key === 'wrestler') { p.ffx = -5; p.bfx = 5; }
    return p;
  }
  const EASE = {
    io: (k) => k * k * (3 - 2 * k),
    in: (k) => k * k * k,
    out: (k) => 1 - (1 - k) * (1 - k) * (1 - k),
    lin: (k) => k,
    step: (k) => (k >= 1 ? 1 : 0),
  };
  // Nội suy giữa các tư thế khoá: [thời điểm, tư thế, kiểu chuyển].
  function kf(keys, u) {
    if (u <= keys[0][0]) return mk(keys[0][1]);
    for (let i = 1; i < keys.length; i++) {
      if (u <= keys[i][0] || i === keys.length - 1) {
        const a = keys[i - 1], b = keys[i];
        const k = EASE[b[2] || 'io'](Math.min(1, Math.max(0, (u - a[0]) / Math.max(1e-6, b[0] - a[0]))));
        const o = mk(b[1]);
        for (const n in a[1]) { const va = a[1][n], vb = b[1][n]; if (typeof va === 'number' && typeof vb === 'number') o[n] = va + (vb - va) * k; }
        o.two = k > 0.02 ? b[1].two : a[1].two;
        o.wz = k > 0.5 ? b[1].wz : a[1].wz;
        return o;
      }
    }
    return mk(keys[keys.length - 1][1]);
  }
  const TAU = Math.PI * 2;

  function poseIdle(key, wt, f, blink) {
    const S = stand(key, wt), ph = f / 8;
    const dn = ph >= 0.5 ? 1 : 0;
    const p = mk(S);
    { p.hy += dn; p.hdy += ph >= 0.5 && ph < 0.625 ? -1 : ph < 0.125 ? 1 : 0; }
    p.sw = Math.sin(TAU * ph); p.sw2 = Math.sin(TAU * ph - 1.3);
    p.lag = ph >= 0.625 && ph < 0.875 ? 1 : 0;
    if (wt === 'sword') p.wa += dn ? 3 : 0;
    if (wt === 'bow') p.wa += dn ? 2 : 0;
    p.bB += dn ? 4 : 0;
    p.shut = blink;
    return p;
  }
  function poseRun(key, wt, f) {
    const S = stand(key, wt), th = (f / 8) * TAU, sn = Math.sin(th), cs = Math.cos(th);
    const amp = key === 'hunter' ? 6.5 : key === 'wrestler' ? 6 : 5.5, lift = key === 'wrestler' ? 3 : 4;
    const p = mk(S, { lean: key === 'wrestler' ? 1 : 2, wind: 1 });
    p.ffx = -amp * cs; p.ffy = -Math.max(0, sn) * lift - (sn > 0 && cs > 0 ? 1 : 0);
    p.bfx = amp * cs; p.bfy = -Math.max(0, -sn) * lift - (sn < 0 && cs < 0 ? 1 : 0);
    p.hy = R(1 - 2 * Math.abs(sn)) + (key === 'healer' ? 0 : 0);
    p.hx = 0;
    p.hdy = Math.abs(sn) > 0.9 ? 0 : 0;
    p.lag = Math.abs(cs) > 0.9 ? -1 : 0; // nón, búi tóc trễ một nhịp
    p.sw = Math.sin(th * 2); p.sw2 = Math.sin(th * 2 - 1.2);
    // tay xa đánh ngược nhịp chân
    const sA = -cs * 42;
    if (wt === 'sword') { p.fA = -38 + sn * 8; p.fB = -8 + sn * 8; p.wa = -158 + sn * 5; p.bA = -sA; p.bB = -sA + 55; }
    else if (wt === 'hammer') { p.fA = 22; p.fB = 88; p.wa = -156 + (p.hy > 0 ? 4 : 0); p.wz = -1; p.two = 0; p.bA = -sA; p.bB = -sA + 55; }
    else if (wt === 'spear') { p.fA = -18 + sn * 6; p.fB = 36 + sn * 6; p.wa = -14; p.bA = -sA; p.bB = -sA + 55; }
    else if (wt === 'bow') { p.bA = 38 + cs * 10; p.bB = 78 + cs * 10; p.wa = 12; p.fA = sA; p.fB = sA + 55; }
    else { p.fA = sA; p.fB = sA + 55; p.bA = -sA; p.bB = -sA + 55; }
    if (key === 'healer') p.lean = 2;
    return p;
  }
  const ATKN = { sword: 10, hammer: 14, spear: 10, bow: 12, none: 8 };
  function atkKeys(key, wt, combo) {
    const S = stand(key, wt);
    const step = S.bfx + 3;
    if (wt === 'sword') {
      if (combo === 0) return [ // chém ngang
        [0, S],
        [0.2, mk(S, { fA: -72, fB: -108, wa: -172, lean: -1, hx: -1, bA: 45, bB: 85, hdx: S.hdx - 1 }), 'out'],
        [0.45, mk(S, { fA: 80, fB: 92, wa: 6, lean: 2, hx: 2, bfx: step, bA: -45, bB: -25 }), 'in'],
        [0.62, mk(S, { fA: 62, fB: 70, wa: 38, lean: 2, hx: 2, bfx: step, bA: -40, bB: -15 }), 'out'],
        [1, S, 'io']];
      if (combo === 1) return [ // chém ngược từ dưới lên
        [0, S],
        [0.2, mk(S, { fA: 32, fB: 6, wa: 138, lean: 2, hy: 2, hx: 0, bA: -30, bB: 0 }), 'out'],
        [0.45, mk(S, { fA: 112, fB: 132, wa: -38, lean: 0, hy: -1, hx: 2, bfx: step, bA: -50, bB: -30 }), 'in'],
        [0.62, mk(S, { fA: 135, fB: 165, wa: -82, lean: -1, hy: -1, hx: 2, bfx: step, bA: -40, bB: -20 }), 'out'],
        [1, S, 'io']];
      return [ // nhảy bổ từ trên xuống, hai tay
        [0, S],
        [0.24, mk(S, { fA: 176, fB: 190, wa: -118, lean: -2, hy: -3, ffy: -2, bfy: -1, two: 1, g2: -2, hdx: S.hdx - 1 }), 'out'],
        [0.45, mk(S, { fA: 60, fB: 70, wa: 44, lean: 3, hy: 3, hx: 3, bfx: step + 2, two: 1, g2: -2, hdy: 1 }), 'in'],
        [0.68, mk(S, { fA: 58, fB: 66, wa: 50, lean: 3, hy: 3, hx: 3, bfx: step + 2, two: 1, g2: -2, hdy: 1 }), 'lin'],
        [1, S, 'io']];
    }
    if (wt === 'hammer') {
      const big = combo === 2;
      return [
        [0, S],
        [0.13, mk(S, { fA: 70, fB: 105, wa: -30, two: 1, g2: 5 }), 'io'],
        [0.34, mk(S, { fA: 176, fB: 190, wa: -114, two: 1, g2: 5, lean: -2, hy: big ? -4 : -1, hx: -1, ffy: big ? -2 : 0, bfy: big ? -2 : 0, hdx: S.hdx - 1 }), 'out'],
        [0.45, mk(S, { fA: 60, fB: 72, wa: 44, two: 1, g2: 5, lean: 3, hy: big ? 4 : 3, hx: 2, bfx: step, hdy: 1 }), 'in'],
        [0.5, mk(S, { fA: 60, fB: 72, wa: 47, two: 1, g2: 5, lean: 3, hy: big ? 5 : 4, hx: 2, bfx: step, hdy: 2 }), 'lin'],
        [0.68, mk(S, { fA: 60, fB: 74, wa: 44, two: 1, g2: 5, lean: 3, hy: 2, hx: 2, bfx: step, hdy: 0 }), 'out'],
        [1, S, 'io']];
    }
    if (wt === 'spear') {
      const up = combo === 1 ? -9 : 0, far = combo === 2 ? 2 : 0;
      return [
        [0, S],
        [0.22, mk(S, { fA: -72, fB: 18, wa: -4 + up, two: 1, g2: 8, lean: -1, hx: -2, hdx: S.hdx - 1, bfx: S.bfx - 1 }), 'out'],
        [0.45, mk(S, { fA: 58, fB: 82 - up, wa: up, two: 1, g2: 7, lean: 3, hx: 4 + far, hy: 2, bfx: step + 3 + far, ffx: S.ffx - 2 }), 'in'],
        [0.64, mk(S, { fA: 58, fB: 82 - up, wa: up, two: 1, g2: 7, lean: 3, hx: 3 + far, hy: 2, bfx: step + 3 + far, ffx: S.ffx - 2 }), 'lin'],
        [1, S, 'io']];
    }
    if (wt === 'bow') {
      const deep = combo === 2 ? 1.5 : 0;
      return [
        [0, S],
        [0.12, mk(S, { bA: 80, bB: 88, wa: 0, pull: 0, two: 1, arrow: 1 }), 'out'],
        [0.34, mk(S, { bA: 88, bB: 91, wa: 0, pull: 7 + deep, two: 1, arrow: 1, lean: -1, hdx: S.hdx - 1 }), 'out'],
        [0.41, mk(S, { bA: 88, bB: 91, wa: 0, pull: 8 + deep, two: 1, arrow: 1, lean: -1 - (deep ? 1 : 0), hdx: S.hdx - 1 }), 'lin'],
        [0.43, mk(S, { bA: 90, bB: 96, wa: -7, pull: 0, two: 0, fA: -78, fB: -98, lean: -1 }), 'step'],
        [0.7, mk(S, { bA: 86, bB: 92, wa: -3, pull: 0, two: 0, fA: -70, fB: -80, lean: 0 }), 'out'],
        [1, S, 'io']];
    }
    // tay không: đấm
    return [
      [0, S],
      [0.22, mk(S, { fA: -60, fB: 40, lean: -1, hx: -1 }), 'out'],
      [0.45, mk(S, { fA: 85, fB: 90, lean: 2, hx: 2, bfx: step }), 'in'],
      [0.65, mk(S, { fA: 80, fB: 88, lean: 2, hx: 2, bfx: step }), 'lin'],
      [1, S, 'io']];
  }
  function poseAtk(key, wt, f, combo) {
    const n = ATKN[wt] || 8, u = (f + 0.5) / n;
    const p = kf(atkKeys(key, wt, combo), u);
    if (wt === 'bow') { p.arrow = u > 0.06 && u < 0.42 ? (combo === 2 ? 2 : 1) : 0; }
    if (wt === 'sword') {
      const k = u >= 0.4 && u < 0.5 ? 0.9 : u >= 0.5 && u < 0.6 ? 0.5 : 0;
      if (k) {
        if (combo === 0) p.smear = { a0: 160, a1: p.wa - 2, sy: 0.3, al: k, th: 8, dy: 2 };
        else if (combo === 1) p.smear = { a0: 125, a1: p.wa, sy: 1, al: k, th: 7 };
        else p.smear = { a0: -128, a1: p.wa, sy: 1, al: k, th: 9 };
      }
    } else if (wt === 'hammer') {
      if (u >= 0.4 && u < 0.5) p.smear = { a0: -110, a1: p.wa - 4, sy: 1, al: 0.75, th: 6 };
      if (u >= 0.43 && u < 0.66) p.fx = { impact: u < 0.52 ? 0.4 : u < 0.6 ? 0.8 : 1.1 };
    } else if (wt === 'spear') {
      if (u >= 0.4 && u < 0.56) p.fx = { thrust: 1 };
    }
    return p;
  }
  function poseDash(key, wt) {
    const S = stand(key, wt);
    const p = mk(S, { lean: 4, hy: 3, hx: 1, ffx: -9, bfx: 7, hdx: S.hdx + 1, hdy: 1, wind: 1, sw: 0.5, sw2: -0.5, lag: -1 });
    if (wt === 'spear') { p.fA = 58; p.fB = 84; p.wa = 0; p.two = 1; p.g2 = 7; }
    else { p.fA = 86; p.fB = 92; p.wa = 2; p.bA = -70; p.bB = -85; }
    return p;
  }
  function poseSpec(key, wt, f) {
    const S = stand(key, wt), u = (f + 0.5) / 7;
    if (wt === 'hammer') {
      const sl = { fA: 60, fB: 72, wa: 46, two: 1, g2: 5, lean: 3, hx: 2, bfx: S.bfx + 3 };
      const p = kf([
        [0, mk(S, { fA: 150, fB: 160, wa: -60, two: 1, g2: 5, hy: -5, ffy: -3, bfy: -3, lean: 1 })],
        [0.16, mk(S, Object.assign({ hy: 5, hdy: 2 }, sl)), 'in'],
        [0.6, mk(S, Object.assign({ hy: 3, hdy: 1 }, sl)), 'out'],
        [1, S, 'io']], u);
      if (u > 0.12 && u < 0.62) p.fx = { impact: u < 0.3 ? 0.7 : u < 0.45 ? 1.2 : 1.6 };
      if (u < 0.2) p.smear = { a0: -110, a1: p.wa - 4, sy: 1, al: 0.8, th: 7 };
      return p;
    }
    if (wt === 'bow') {
      const p = kf([
        [0, mk(S, { bA: 138, bB: 146, wa: -58, pull: 8, two: 1, lean: -2, hdx: S.hdx - 1, hy: 1 })],
        [0.2, mk(S, { bA: 138, bB: 146, wa: -58, pull: 9, two: 1, lean: -2, hdx: S.hdx - 1, hy: 1 }), 'lin'],
        [0.24, mk(S, { bA: 140, bB: 150, wa: -64, pull: 0, two: 0, fA: -60, fB: -95, lean: -2, hy: 1 }), 'step'],
        [0.7, mk(S, { bA: 136, bB: 144, wa: -58, pull: 0, two: 0, fA: -50, fB: -70, lean: -1 }), 'out'],
        [1, S, 'io']], u);
      p.arrow = u < 0.22 ? 2 : 0;
      return p;
    }
    // kiếm, giáo: hãm lại sau cú lướt
    const D = poseDash(key, wt);
    const p = kf([[0.5, mk(D, { hx: 2, ffx: -6, wind: 0.6 })], [1, S, 'out']], u);
    if (u < 0.8) p.fx = { dust: [R(p.bfx) + 2] };
    return p;
  }
  function poseCast(key, wt, f) {
    const S = stand(key, wt), u = (f + 0.5) / 8;
    if (key === 'smith') {
      // giơ cao vũ khí, lửa bùng lên
      const up = wt === 'bow' ? { bA: 170, bB: 184, wa: -90 } : { fA: 172, fB: 186, wa: -92 };
      const p = kf([[0, S], [0.28, mk(S, Object.assign({ lean: -1, hy: -1, bfx: S.bfx + 1 }, up)), 'out'], [0.75, mk(S, Object.assign({ lean: -1, hy: 0, bfx: S.bfx + 1 }, up)), 'lin'], [1, S, 'io']], u);
      p.wz = 0;
      p.fx = { ignite: u < 0.2 ? 0.3 : u < 0.8 ? 1 + (f % 2) * 0.3 : 0.5 };
      return p;
    }
    if (key === 'hunter') {
      // quỳ xuống cài bẫy
      const dn = { hy: 6, lean: 3, hdy: 1, ffx: -5, bfx: 5 };
      const arm = wt === 'bow' ? { fA: 55, fB: 35 } : { bA: 55, bB: 35 };
      const p = kf([[0, S], [0.3, mk(S, Object.assign({}, dn, arm)), 'out'], [0.7, mk(S, Object.assign({}, dn, arm, wt === 'bow' ? { fB: 20 } : { bB: 20 })), 'lin'], [1, S, 'io']], u);
      if (u > 0.3 && u < 0.75) p.fx = { dust: [12] };
      return p;
    }
    if (key === 'healer') {
      // vung tay ném bình thuốc
      const farArm = wt !== 'bow';
      const back = farArm ? { bA: -150, bB: -185 } : { fA: -150, fB: -185 };
      const fwd = farArm ? { bA: 105, bB: 80 } : { fA: 105, fB: 80 };
      const p = kf([[0, S], [0.3, mk(S, Object.assign({ lean: -1, hdx: S.hdx - 1 }, back)), 'out'], [0.5, mk(S, Object.assign({ lean: 3, hx: 1 }, fwd)), 'in'], [0.75, mk(S, Object.assign({ lean: 3, hx: 1 }, fwd)), 'lin'], [1, S, 'io']], u);
      // chuyển góc tay ném đi vòng qua trên đầu
      if (u > 0.3 && u < 0.5) { const k = EASE.in((u - 0.3) / 0.2); const A1 = lerp(-150, -255, k), A2 = lerp(-185, -280, k); if (farArm) { p.bA = A1; p.bB = A2; } else { p.fA = A1; p.fB = A2; } }
      p.fx = { far: farArm, throwArm: farArm && u > 0.12 && u < 0.8 };
      if (u < 0.44) p.fx.hold = 1;
      else if (u < 0.95) { const k = (u - 0.44) / 0.5; p.fx.fly = [10 + k * 14, -26 + k * k * 22]; }
      return p;
    }
    // Đô Vật gồng: hai tay gập lên khoe bắp
    const fl = { fA: 178, fB: 186, bA: 105, bB: 200, hy: 2, ffx: S.ffx - 2, bfx: S.bfx + 2, lean: 0, wa: -80 };
    const p = kf([[0, S], [0.14, mk(S, { hy: 4, fA: 40, fB: 60, bA: 30, bB: 90, ffx: S.ffx - 2, bfx: S.bfx + 2 }), 'out'], [0.34, mk(S, fl), 'out'], [0.8, mk(S, fl), 'lin'], [1, poseGong(key, wt, 0), 'io']], u);
    p.wz = 0; p.two = 0;
    if (u > 0.26 && u < 0.85) p.fx = { flex: u < 0.4 ? 0 : u < 0.6 ? 1 : 2 };
    return p;
  }
  function poseGong(key, wt, f) {
    const S = stand(key, wt);
    const dn = f >= 2 ? 1 : 0;
    const p = mk(S, { hy: 2 + dn, ffx: S.ffx - 2, bfx: S.bfx + 2, bA: -35, bB: 50, hdy: f === 2 ? -1 : 0, sw: Math.sin(f * 1.57), sw2: Math.cos(f * 1.57) });
    if (wt === 'bow') { p.fA = -30; p.fB = 55; } else if (wt === 'hammer') { p.fA = 40; p.fB = 80; } else if (wt === 'spear') { p.fA = 28; p.fB = 92; } else if (wt === 'sword') { p.fA = 30; p.fB = 80; } else { p.fA = 35; p.fB = -40; }
    return p;
  }
  function poseHurt(key, wt) {
    const S = stand(key, wt);
    return mk(S, { lean: -3, hx: -2, hy: 1, hdx: S.hdx - 1, hdy: 0, fA: S.fA - 25, fB: S.fB - 20, bA: 60, bB: 110, bfx: S.bfx - 1, ffx: S.ffx - 2, ffy: -1, shut: 1, sw: -1, sw2: -1, wind: -0.4, wa: S.wa - (wt === 'hammer' ? 0 : 18), wz: 0 });
  }
  function poseDie(key, wt, f) {
    const S = stand(key, wt);
    const limp = mk(S, { lean: -1, fA: -25, fB: -45, bA: 35, bB: 60, hdx: S.hdx - 1, shut: 1, noW: 1, drop: 1, wind: 0, sw: 0, sw2: 0, ffx: -2, bfx: 2 });
    if (f === 0) return mk(poseHurt(key, wt), { hy: 2 });
    if (f === 1) return mk(limp, { lean: -3, hy: 3, hx: -2, drop: 0, noW: 0, wa: S.wa + 40, fA: 20, fB: 40 });
    const rot = [0, 0, -28, -58, -90, -90, -90, -90][f];
    const p = mk(limp, { rot, px: -4, py: 0 });
    if (f >= 4) { p.ground = 1; p.rdy = 0; } else p.rdy = -1;
    if (f === 5) p.up = 2;
    if (f >= 4) p.fx = f === 4 ? { dust: [-20] } : null;
    return p;
  }
  function poseDodge(key, wt, f) {
    const S = stand(key, wt);
    if (f === 0) return mk(S, { lean: 5, hy: 4, hx: 2, hdy: 2, hdx: S.hdx + 1, ffx: -7, bfx: 3, fA: 80, fB: 95, bA: 70, bB: 90, wa: 10, wind: 1, sw: 0.6, sw2: 0.2, lag: -1 });
    if (f === 7) return mk(S, { lean: 2, hy: 5, hdy: 2, ffx: -4, bfx: 5, fA: 30, fB: 60, wind: 0.4, fx: { dust: [-8] } });
    const tuck = mk(S, { hy: 7, lean: 4, hdx: 0, hdy: 5, ffx: 0, ffy: -1, bfx: 3, bfy: -2, fA: 50, fB: 115, bA: 60, bB: 120, noW: 1, wind: 0.5, sw: 0, sw2: 0 });
    tuck.rot = 30 + (f - 1) * 60;
    tuck.px = 1; tuck.py = key === 'wrestler' ? -13 : -11;
    tuck.ground = 1;
    tuck.fx = { speed: 1 };
    return tuck;
  }

  // ---------- chọn hoạt ảnh và khung hình theo trạng thái ----------
  function pick(o, wt) {
    const p = o.p, t = (o.t != null ? o.t : G.time) || 0;
    if (p && p.dead) return ['die', Math.min(7, Math.floor((p.deadT || 0) / 0.075)), 0];
    if (o.dodge >= 0) return ['dodge', Math.min(7, Math.floor(o.dodge * 8)), 0];
    if (p && p.dashT > 0) return ['dash', Math.floor(t * 30) % 2, 0];
    if (p && p.specT > 0) return ['spec', Math.min(6, Math.max(0, Math.floor((1 - p.specT / 0.35) * 7))), 0];
    if (p && p.castT > 0) return ['cast', Math.min(7, Math.max(0, Math.floor((1 - p.castT / 0.4) * 8))), 0];
    if (p && p.mv && p.mv.holding && o.atk < 0) {
      // đang giữ nút lấy đà (js/moves.js): đứng yên ở khung giương cung, giơ búa, thu giáo
      const n = ATKN[wt] || 8, u = wt === 'bow' ? 0.38 : wt === 'hammer' ? 0.33 : 0.24;
      return ['atk', Math.min(n - 1, Math.floor(u * n)), p.mv.level >= (wt === 'hammer' ? 2 : 1) ? 2 : 0];
    }
    if (o.atk >= 0) {
      const n = ATKN[wt] || 8;
      const combo = p ? (Math.max(0, p.comboI | 0) % 3) : Math.floor(t / 1.6) % 3;
      return ['atk', Math.min(n - 1, Math.floor(o.atk * n)), combo];
    }
    if ((p && p.hurtT > 0) || (!p && o.flash)) return ['hurt', 0, 0];
    if (o.move) return ['run', Math.floor(t * 13) % 8, 0];
    if (o.gong) return ['gong', Math.floor(t * 7) % 4, 0];
    return ['idle', Math.floor(t * 6.5) % 8, t % 3.7 < 0.14 ? 1 : 0];
  }
  function poseOf(key, wt, a, f, v) {
    switch (a) {
      case 'die': return poseDie(key, wt, f);
      case 'dodge': return poseDodge(key, wt, f);
      case 'dash': { const p = poseDash(key, wt); p.fx = { speed: 1 }; return p; }
      case 'spec': return poseSpec(key, wt, f);
      case 'cast': return poseCast(key, wt, f);
      case 'atk': return poseAtk(key, wt, f, v);
      case 'hurt': return poseHurt(key, wt);
      case 'run': return poseRun(key, wt, f);
      case 'gong': return poseGong(key, wt, f);
      default: return poseIdle(key, wt, f, v);
    }
  }

  // ---------- bộ nhớ đệm ----------
  const CACHE = new Map();
  const CAP = 1400;
  function getFrame(o) {
    const key = HS[o.key] ? o.key : 'smith';
    const look = o.weapon ? A.weaponLook(o.weapon) : null;
    if (look) look.coat = o.weapon.coat || null;
    const wt = look && HS && (look.type === 'sword' || look.type === 'hammer' || look.type === 'spear' || look.type === 'bow') ? look.type : 'none';
    const sel = pick(o, wt);
    const p = o.p, st = p && p.st;
    const flash = !!(o.flash || (p && p.hurtT > 0));
    const tintK = flash ? 'F' : st && st.ice > 0 ? 'I' : st && st.poison > 0 ? 'P' : '';
    const wk = wt === 'none' ? '-' : wt + look.stage + (look.el || '') + (look.el ? '' : look.col) + (look.coat ? 'c' : '');
    const id = key + '|' + (o.helm || '') + '|' + (o.armor || '') + '|' + wk + '|' + sel[0] + '|' + sel[1] + '|' + sel[2] + '|' + tintK + (o.gong ? 'G' : '');
    let fr = CACHE.get(id);
    if (fr) return fr;
    if (CACHE.size >= CAP) CACHE.clear();
    const ps = poseOf(key, wt, sel[0], sel[1], sel[2]);
    fr = render(key, ps, wt === 'none' ? null : look, palette(key, o.helm, o.armor), { helm: o.helm, armor: o.armor }, sel[1] + sel[2] * 3,
      { flash, ice: tintK === 'I', poison: tintK === 'P', gong: !!o.gong });
    fr.sh = HS[key].shadow; fr.dead = sel[0] === 'die' && sel[1] >= 4;
    CACHE.set(id, fr);
    return fr;
  }

  let warned = false;
  A.hero = function (c, o) {
    let fr = null;
    try { fr = getFrame(o); } catch (e) {
      if (!warned) { warned = true; if (window.console) console.warn('hero_art: dùng lại hình cũ', e); }
    }
    if (!fr) return old.call(A, c, o);
    const x = Math.round(o.x), y = Math.round(o.y), f = o.face < 0 ? -1 : 1;
    c.save();
    if (o.alpha != null) c.globalAlpha = c.globalAlpha * o.alpha;
    c.imageSmoothingEnabled = false;
    if (fr.dead) A.ellipse(c, x - f * 16, y, 18, 2, 'rgba(0,0,0,0.3)');
    else A.ellipse(c, x, y, fr.sh, 2, 'rgba(0,0,0,0.3)');
    c.translate(x + (f < 0 ? 1 : 0), y);
    c.scale(f, 1);
    c.drawImage(fr.cv, fr.ox, fr.oy);
    if (o.gong) {
      // hào quang lúc Gồng: vệt sáng bốc lên quanh người
      const t = (o.t != null ? o.t : G.time) || 0, hw = fr.sh + 3;
      for (let i = 0; i < 6; i++) {
        const ph = (t * 1.6 + i * 0.37) % 1, sx = Math.round(-hw + ((i * 2 * hw) / 5)) + (i % 2), sy = Math.round(-4 - ph * 38);
        c.fillStyle = i % 2 ? '#fff3b0' : '#ffd27a';
        c.globalAlpha = (o.alpha != null ? o.alpha : 1) * (1 - ph) * 0.9;
        c.fillRect(sx, sy, 1, 4 + (i % 3));
      }
    }
    c.restore();
  };
  // Cho công cụ kiểm tra xem số khung đang lưu.
  A.heroCacheSize = () => CACHE.size;
})();
