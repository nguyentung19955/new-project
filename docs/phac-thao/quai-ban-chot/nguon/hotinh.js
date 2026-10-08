// Hồ Tinh vẽ lại: cáo chín đuôi, trùm vùng Lâu đài cổ (hệ Lửa). Ba phương án dáng, ba pha.
// Mọi nét vẽ đi qua phép biến đổi HT_T (dời, xoay, phóng k) nên pha 3 được vẽ thật ở cỡ gấp rưỡi.
const HT_IV = ['#7a5a52', '#c9ad98', '#f2e6cf', '#fffdf2'], HT_IVX = ['#4e3a40', '#8c7468', '#b8a48e', '#d8cab2'];
const HT_CAM = ['#8a2a10', '#e0661e', '#ff9a3a', '#ffd27a'], HT_CAMX = ['#5a1c10', '#a0481a', '#c8702c', '#e0a060'];
const HT_DO = ['#5a0e0c', '#b0261a', '#e8442a', '#ff8a5a'], HT_DOX = ['#3c0a0c', '#7a1c16', '#a83020', '#c86448'];
const HT_MA = ['#2a3cc8', '#3aa0ff', '#8fe6ff', '#ffffff'], HT_LUA = ['#b0261a', '#ff8a1e', '#ffd23c', '#fff6b0'];
const HT_T = { k: 1, ox: 0, oy: 0, a: 0 };
function HT_p(x, y) { const T = HT_T, c = Math.cos(T.a), s = Math.sin(T.a); return [(T.ox + x * c - y * s) * T.k, (T.oy + x * s + y * c) * T.k]; }
function HT_E(g, x, y, rx, ry, col) { const T = HT_T, q = HT_p(x, y), cx = q[0], cy = q[1]; rx *= T.k; ry *= T.k; if (rx < .35 || ry < .35) return; if (!T.a) { ell(g, cx, cy, rx, ry, col); return; }
  const c = Math.cos(T.a), s = Math.sin(T.a), R = Math.max(rx, ry) + 1; for (let py = Math.floor(cy - R); py <= cy + R; py++) for (let px = Math.floor(cx - R); px <= cx + R; px++) { const dx = px + .5 - cx, dy = py + .5 - cy, u = (dx * c + dy * s) / rx, w = (-dx * s + dy * c) / ry; if (u * u + w * w <= 1) set(g, px, py, col); } }
function HT_P(g, pts, col) { poly(g, pts.map(q => HT_p(q[0], q[1])), col); }
function HT_L(g, x0, y0, x1, y1, col, t) { const a = HT_p(x0, y0), b = HT_p(x1, y1); line(g, a[0], a[1], b[0], b[1], col, (t || 1) * (HT_T.k > 1 && (t || 1) <= 1 ? 1.6 : HT_T.k)); }
function HT_D(g, x, y, col) { const q = HT_p(x, y); if (HT_T.k > 1) rect(g, Math.round(q[0]), Math.round(q[1]), 2, 2, col); else set(g, q[0], q[1], col); }
function HT_bz(a, b, c, d, n) { const o = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; o.push([u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]]); } return o; }
// ống mềm có bóng 4 lớp: pts là các điểm dọc thân, rf(t) bán kính, cf(t, i) dải màu, edge màu viền ngăn cách
function HT_ong(g, pts, rf, cf, edge) { const n = pts.length - 1, R = pts.map((q, i) => rf(i / n)), C = pts.map((q, i) => cf(i / n, i));
  if (edge) pts.forEach((q, i) => HT_E(g, q[0], q[1], R[i] + 1.1, R[i] + 1.1, edge));
  pts.forEach((q, i) => HT_E(g, q[0], q[1], R[i], R[i], C[i][0]));
  pts.forEach((q, i) => HT_E(g, q[0] - R[i] * .08, q[1] - R[i] * .18, R[i] * .86, R[i] * .86, C[i][1]));
  pts.forEach((q, i) => HT_E(g, q[0] - R[i] * .2, q[1] - R[i] * .36, R[i] * .62, R[i] * .62, C[i][2]));
  pts.forEach((q, i) => { if (R[i] > 2.6) HT_E(g, q[0] - R[i] * .34, q[1] - R[i] * .62, R[i] * .24, R[i] * .2, C[i][3]); }); }
// lưỡi lửa ba lớp, gốc tại (x, y), cao h, rộng w, ngả lean
function HT_lua(g, x, y, h, w, cols, lean) { for (let i = 0; i < 3; i++) { const f = 1 - i * .3, W = w * f, H = h * f, l = (lean || 0) * f; HT_P(g, [[x - W, y], [x - W * .75, y - H * .4], [x - W * .1 + l * .5, y - H * .62], [x + l, y - H], [x + W * .55 + l * .4, y - H * .5], [x + W, y - H * .15], [x + W * .8, y]], cols[i]); } }
function HT_cf(t, i) { const u = t + ((i % 4) < 2 ? .03 : -.03); return u < .5 ? HT_IV : u < .68 ? HT_CAM : HT_DO; }
function HT_cfx(t, i) { const u = t + ((i % 4) < 2 ? .03 : -.03); return u < .5 ? HT_IVX : u < .68 ? HT_CAMX : HT_DOX; }
// đầu cáo nhìn trái, gốc tọa độ ở giữa sọ
function HT_dau(g, p) { const I = HT_IV, m = p === 3 ? 5.5 : p === 2 ? 3.6 : 2.6, f = p === 3 ? 6.5 : p === 2 ? 3.6 : 3;
  // tai xa, tai gần
  HT_P(g, [[-4, -6], [-1, -24], [6, -8]], HT_IVX[2]); HT_P(g, [[-2, -8], [-.6, -19], [3.5, -9]], '#5a1420'); HT_P(g, [[-2.2, -17], [-1, -24], [1.2, -16.5]], HT_DOX[2]);
  HT_P(g, [[2, -5], [11, -28], [17, -3]], I[1]); HT_P(g, [[2, -5], [11, -28], [9, -5]], I[2]); HT_P(g, [[7, -7], [11, -21], [14.5, -6]], '#7a1c2a'); HT_P(g, [[9, -9], [11, -16], [12.5, -8]], '#b0403a'); HT_P(g, [[8.4, -19], [11, -28], [13.6, -18]], HT_DO[2]); HT_P(g, [[9.6, -22], [11, -28], [12.2, -22]], HT_CAM[2]);
  if (p === 3) { HT_P(g, [[14, -6], [22, -14], [17, -1]], I[2]); HT_P(g, [[-8, -7], [-9, -15], [-3, -9]], I[2]); }
  // sọ
  HT_E(g, 0, -.5, 11.5, 10.4, I[0]); HT_E(g, -.4, -1.4, 10.8, 9.3, I[1]); HT_E(g, -1, -2.5, 9.2, 7.5, I[2]); HT_E(g, 3, -8, 3, 1.3, I[3]);
  // lông má chĩa ra sau, chóp cam
  const s = p === 3 ? 1.35 : 1; HT_P(g, [[3, -1], [3 + 16 * s, 2 * s], [8, 7]], I[2]); HT_P(g, [[2, 4], [2 + 15 * s, 10 * s], [4, 10]], I[1]); HT_P(g, [[-1, 6], [-1 + 11 * s, 15 * s], [-2, 11]], I[1]);
  HT_P(g, [[3 + 11 * s, 1 * s], [3 + 16 * s, 2 * s], [3 + 11 * s, 3.6 * s]], HT_CAM[2]); HT_P(g, [[2 + 10.5 * s, 7.4 * s], [2 + 15 * s, 10 * s], [2 + 10 * s, 9 * s]], HT_CAM[1]);
  // hàm dưới, họng, mõm trên
  HT_P(g, [[-7, 4], [-19.4, 4.5], [-17.4, 5.8 + m], [-7, 7.6 + m]], I[1]); HT_P(g, [[-8, 4.5], [-19.4, 4.8], [-17, 4.8 + m], [-8, 5.2 + m]], '#3a0a14'); HT_P(g, [[-9, 3.8 + m], [-15, 4.2 + m], [-9, 5.2 + m]], '#c8384a');
  HT_P(g, [[-7, -4.6], [-14, -.6], [-21.6, 1.4], [-21.8, 4.4], [-7, 5]], I[2]); HT_P(g, [[-7, -4.6], [-14, -.6], [-21.6, 1.4], [-13, 1.4], [-7, .4]], I[3]); HT_L(g, -20.4, 4.8, -9, 5, I[0], 1);
  HT_E(g, -21, 2.6, 1.7, 1.6, '#1c0f18'); HT_D(g, -21.8, 1.8, '#8a8290');
  // nanh
  for (const q of [[-17.8, f], [-14.8, f * .55], [-12, f * .7], [-9.6, f * .45]]) HT_P(g, [[q[0] - .9, 4.8], [q[0] + .9, 4.8], [q[0] + .2, 4.8 + q[1]]], '#fff8e0');
  for (const q of [[-16.2, f * .6], [-13.4, f * .4], [-10.8, f * .4]]) HT_P(g, [[q[0] - .8, 5.2 + m], [q[0] + .8, 5.2 + m], [q[0], 5.2 + m - q[1]]], '#fff8e0');
  // hoa văn đỏ như mặt nạ cáo
  const R = HT_DO[2]; HT_L(g, -9.4, -6.8, -5.6, -8.8, R, 1.4); HT_D(g, 4.5, -8.6, R); HT_D(g, 7, -7, HT_DO[1]);
  HT_L(g, 2, -4.8, 7.5, -6.2, R, 1.4); HT_L(g, -6.5, 2.2, -1, 4, R, 1.3); HT_L(g, -5.5, 4.8, -.5, 6.6, R, 1.3); HT_L(g, -16.5, .2, -12.5, -1.4, HT_DO[1], 1); HT_D(g, 6, 2, R);
  // mắt xếch
  const ec = p === 3 ? '#ffffff' : p === 2 ? '#d86cff' : '#ffd23c', e2 = p === 3 ? '#f0b0ff' : p === 2 ? '#f6d0ff' : '#fff6b0';
  HT_P(g, [[-13.4, -1.2], [-2, -9], [2.6, -4.6], [-6, 1.2]], '#1c0f18'); HT_P(g, [[-11, -1.8], [-2.4, -7.4], [.8, -4.6], [-6, -.2]], ec); HT_P(g, [[-8.4, -2.4], [-3.4, -5.8], [-1.4, -4.4], [-6, -1.4]], e2);
  HT_L(g, -5.2, -6, -4.8, -1.2, p === 3 ? '#a040d0' : '#14182e', p === 3 ? 1 : 1.5); HT_D(g, -8, -3, '#ffffff'); HT_L(g, -14.6, -2.6, 2.6, -10.6, '#2a1420', 2); HT_L(g, 2.6, -4.6, 5, -3.6, '#1c0f18', 1); }
const HT_DANG = {
  1: { w: 196, h: 140, gy: 131, tb: [100, 116], A: [1, 13, 25, 37, 49, 61, 73, 85, 96], L: [58, 68, 76, 82, 86, 88, 90, 90, 88], cu: 0, tw: 6.6,
    torso: [[96, 112], [98, 94], [84, 83], [70, 87]], tr: [14, 10.6], hip: [91, 113, 15, 14], chest: [69, 91, 10.6, 12], neck: [[71, 85], [76, 73], [63, 72], [60, 62]], nr: [9, 6.6], head: [54, 56, .18],
    legs: [{ far: 1, pts: [[75, 96], [71, 112], [73.5, 128]], r: [5, 3.4], paw: [70.5, 128.4] }, { pts: [[93, 124], [84, 128.4], [78, 128.2]], r: [4.6, 3.4], paw: [75, 128.4] }, { pts: [[68, 96], [62.5, 112], [65, 128]], r: [5.4, 3.6], paw: [62, 128.4] }],
    hat: [[73, 75], [70, 86], [62, 86], [58, 79]], mark: [89, 110] },
  2: { w: 196, h: 124, gy: 116, tb: [124, 84], A: [-4, 13, 30, 47, 64, 81, 98, 115, 132], L: [52, 58, 68, 74, 76, 74, 72, 72, 70], cu: 0, tw: 6.4,
    torso: [[118, 84], [104, 82], [90, 92], [76, 94]], tr: [13, 11], hip: [116, 86, 13, 12], chest: [76, 95, 12, 10], neck: [[72, 93], [64, 93], [56, 95], [50, 96]], nr: [9.4, 7.4], head: [44, 96, -.14],
    legs: [{ far: 1, pts: [[80, 99], [78, 108], [66, 113]], r: [5, 3.4], paw: [62, 113.4] }, { far: 1, pts: [[110, 92], [118, 106], [108, 113]], r: [5.6, 3.4], paw: [104.5, 113.4] }, { pts: [[120, 90], [130, 102], [119, 113]], r: [6.6, 3.6], paw: [115.5, 113.4] }, { pts: [[73, 99], [68, 110], [54, 113]], r: [5.4, 3.6], paw: [50, 113.4] }],
    hat: [[70, 86], [68, 99], [60, 103], [57, 101]], mark: [116, 84] },
  3: { w: 200, h: 144, gy: 135, tb: [114, 112], A: [-14, 0, 14, 28, 42, 56, 70, 84, 97], L: [66, 74, 80, 84, 86, 88, 88, 86, 82], cu: 1, tw: 6.4,
    torso: [[107, 108], [104, 92], [94, 80], [84, 75]], tr: [13.5, 11.5], hip: [106, 110, 13, 13], chest: [83, 77, 12, 12], neck: [[81, 72], [76, 62], [71, 57], [67, 53]], nr: [10, 7.4], head: [62, 49, -.22],
    legs: [{ far: 1, pts: [[86, 84], [72, 94], [62, 88]], r: [5, 3.2], paw: [59, 86.5], up: 1 }, { far: 1, pts: [[112, 114], [116, 124], [112, 132]], r: [5.6, 3.4], paw: [108.5, 132.4] }, { pts: [[104, 116], [97, 124], [102, 132]], r: [6.4, 3.6], paw: [98.5, 132.4] }, { pts: [[79, 80], [64, 84], [56, 74]], r: [5.4, 3.4], paw: [54, 71.5], up: 1 }],
    hat: [[86, 66], [82, 78], [74, 78], [70, 68]], mark: [106, 108] } };
function HT_than(v, p, kd) { const P = HT_DANG[v] || HT_DANG[1], k = p === 3 ? 1.5 : 1, g = S(Math.ceil(P.w * k), Math.ceil(P.h * k)), T = HT_T; T.k = k; T.ox = 0; T.oy = 0; T.a = 0;
  const tips = [], sp = HT_bz(P.torso[0], P.torso[1], P.torso[2], P.torso[3], 26), nk = HT_bz(P.neck[0], P.neck[1], P.neck[2], P.neck[3], 16);
  // đường các đuôi
  const tails = P.A.map((ad, i) => { const a = ad * Math.PI / 180, L = P.L[i] * (p === 3 ? 1.04 : 1), d = [Math.cos(a), -Math.sin(a)], n = [-Math.sin(a), -Math.cos(a)], B = P.tb;
    const c = P.cu ? 1 : Math.max(-1, Math.min(.55, (ad - 54) / 52)), o1 = P.cu ? -12 : -c * 7, o2 = P.cu ? 14 : c * 15, o3 = P.cu ? 3 : c * 4;
    return HT_bz(B, [B[0] + d[0] * L * .36 + n[0] * o1, B[1] + d[1] * L * .36 + n[1] * o1], [B[0] + d[0] * L * .8 + n[0] * o2, B[1] + d[1] * L * .8 + n[1] * o2], [B[0] + d[0] * L + n[0] * (o2 + o3) * (P.cu ? 1.5 : 1), B[1] + d[1] * L + n[1] * (o2 + o3) * (P.cu ? 1.5 : 1)], 64); });
  const up = (pts, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)]; let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l; let nx = ty, ny = -tx; if (ny > 0 || (ny === 0 && nx < 0)) { nx = -nx; ny = -ny; } return [tx, ty, nx, ny]; };
  const trf = t => P.tr[0] + (P.tr[1] - P.tr[0]) * t, nrf = t => P.nr[0] + (P.nr[1] - P.nr[0]) * t;
  // pha 3: lửa cháy sau lưng và dọc các đuôi
  if (p === 3) { tails.forEach((tl, i) => { for (const j of [18, 30, 42, 54]) HT_lua(g, tl[j][0], tl[j][1], 15 + (i + j) % 3 * 4, 6, [HT_LUA[0], HT_LUA[1], HT_LUA[2]], 3); });
    for (let i = 2; i < sp.length; i += 5) { const u = up(sp, i), r = trf(i / 26); HT_lua(g, sp[i][0] + u[2] * r, sp[i][1] + u[3] * r + 3, 20 + i % 3 * 3, 7, HT_LUA, 4); }
    HT_lua(g, P.head[0] + 8, P.head[1] - 14, 22, 8, HT_LUA, 5); }
  // chín đuôi: vẽ từ hai mép vào giữa
  const tw = t => P.tw * (t < .62 ? .3 + .7 * Math.sin(t / .62 * 1.5708) : Math.pow(Math.max(0, Math.cos((t - .62) / .38 * 1.5708)), .75));
  for (const i of kd ? [] : [0, 8, 1, 7, 2, 6, 3, 5, 4]) { const tl = tails[i]; HT_ong(g, tl, tw, t => HT_cf(t - .03, 0), '#3a1420');
    [[.5, HT_IV], [.68, HT_CAM]].forEach(bd => { const jb = Math.round(bd[0] * 64) - 1; [[.72, 5, 2], [.3, 9, 2], [-.15, 5, 1], [-.55, 8, 1], [-.9, 4, 0]].forEach(q => { const u = up(tl, jb), r = tw(jb / 64), jt = Math.min(64, jb + q[1] + (i % 2)), u2 = up(tl, jt), r2 = tw(jt / 64), bx = tl[jb][0] + u[2] * q[0] * r, by = tl[jb][1] + u[3] * q[0] * r, w = Math.max(1.3, r * .24);
      HT_P(g, [[bx + u[2] * w, by + u[3] * w], [bx - u[2] * w, by - u[3] * w], [tl[jt][0] + u2[2] * q[0] * r2 * .8, tl[jt][1] + u2[3] * q[0] * r2 * .8]], bd[1][q[2]]); }); });
    for (let j = 10; j < 40; j += 6) { const u = up(tl, j), r = tw(j / 64) * .5; HT_L(g, tl[j][0] - u[2] * r, tl[j][1] - u[3] * r, tl[j + 3][0] - u[2] * r, tl[j + 3][1] - u[3] * r, HT_IV[1], 1); }
    if (p === 3) for (const j of [14, 26, 38]) { const u = up(tl, j), r = tw(j / 64); HT_P(g, [[tl[j][0] + u[2] * (r - 1) - u[0] * 2.4, tl[j][1] + u[3] * (r - 1) - u[1] * 2.4], [tl[j][0] + u[2] * (r - 1) + u[0] * 2.4, tl[j][1] + u[3] * (r - 1) + u[1] * 2.4], [tl[j][0] + u[2] * (r + 5) + u[0] * 5, tl[j][1] + u[3] * (r + 5) + u[1] * 5]], HT_IV[2]); }
    tips[i] = tl[64]; }
  // chân phía xa
  const chan = (lg) => { const far = lg.far, q = lg.pts, cf = far ? HT_cfx : HT_cf, I = far ? HT_DOX : HT_DO; HT_ong(g, HT_bz(q[0], q[1], q[1], q[2], 18), t => lg.r[0] + (lg.r[1] - lg.r[0]) * t, (t, i) => cf(t * .92, i), '#3a1420');
    const x = lg.paw[0], y = lg.paw[1]; if (lg.up) { HT_E(g, x, y, 4.2, 3.6, I[1]); HT_E(g, x - .4, y - .6, 3.2, 2.5, I[2]); for (const d of [[-4.5, -3.4], [-5.4, -.6], [-4.6, 2.2]]) HT_L(g, x - 2.6, y + d[1] * .5, x + d[0] - (p === 3 ? 1.6 : 0), y + d[1], '#fff8e0', 1); }
    else { HT_E(g, x, y, 5, 2.6, I[1]); HT_E(g, x - .4, y - .7, 4, 1.6, I[2]); for (const d of [-4.6, -2.4, -.2]) { HT_L(g, x + d, y + .6, x + d - 1.2 - (p === 3 ? 1.4 : 0), y + 2.2, '#fff8e0', 1); } } };
  P.legs.filter(l => l.far).forEach(chan);
  // gai lông dọc sống lưng và gáy
  const gai = (pts, rf, st, h, col) => { for (let i = 2; i < pts.length - 1; i += st) { const u = up(pts, i), r = rf(i / (pts.length - 1)), bx = pts[i][0] + u[2] * (r - 1.5), by = pts[i][1] + u[3] * (r - 1.5); HT_P(g, [[bx - u[0] * 2.6, by - u[1] * 2.6], [bx + u[0] * 2.6, by + u[1] * 2.6], [bx + u[2] * h - u[0] * h * .7, by + u[3] * h - u[1] * h * .7]], col); } };
  gai(sp, trf, p === 3 ? 3 : 4, p === 3 ? 9 : 3.6, HT_IV[2]); gai(nk, nrf, 3, p === 3 ? 8 : 3.4, HT_IV[2]);
  // thân: hông, mình, ngực, cổ
  const cI = () => HT_IV; { const h = P.hip, c = P.chest; HT_E(g, h[0], h[1], h[2], h[3], HT_IV[0]); HT_E(g, c[0], c[1], c[2], c[3], HT_IV[0]); HT_ong(g, sp, trf, cI);
    HT_E(g, h[0] - .6, h[1] - 1.4, h[2] * .93, h[3] * .88, HT_IV[1]); HT_E(g, h[0] - 1.6, h[1] - 3, h[2] * .76, h[3] * .68, HT_IV[2]); HT_E(g, h[0] - 5, h[1] - 7, h[2] * .26, h[3] * .16, HT_IV[3]);
    HT_E(g, c[0] - .5, c[1] - 1.2, c[2] * .93, c[3] * .88, HT_IV[1]); HT_E(g, c[0] - 1.2, c[1] - 2.4, c[2] * .76, c[3] * .7, HT_IV[2]);
    HT_ong(g, nk, nrf, cI);
    // bờm ngực
    for (const d of [[-.9, -.5, -5, 7], [-.6, .2, -5, 8], [-.2, .7, -3, 8], [.25, .85, -1, 6]]) { const x = c[0] + d[0] * c[2], y = c[1] + d[1] * c[3]; HT_P(g, [[x - 2.6, y - 3], [x + 3, y - 1], [x + d[2], y + d[3] * (p === 3 ? 1.5 : 1)]], HT_IV[3]); HT_L(g, x + 2.6, y - .6, x + d[2] + .8, y + d[3] * .8, HT_IV[1], 1); }
    // hoa văn đỏ ở hông và vai
    const m = P.mark, R = HT_DO[2]; pl(g, [[m[0] - 5, m[1] - 3], [m[0], m[1] - 6], [m[0] + 5, m[1] - 3], [m[0] + 4, m[1] + 2], [m[0], m[1] + 3], [m[0] - 1, m[1]]].map(q => HT_p(q[0], q[1])), R, 1.3 * k); HT_L(g, m[0] - 8, m[1] + 2, m[0] - 4, m[1] + 6, HT_DO[1], 1.2); HT_L(g, m[0] + 7, m[1] + 4, m[0] + 3, m[1] + 8, HT_DO[1], 1.2);
    HT_L(g, c[0] + 3, c[1] - 6, c[0] + 7, c[1] - 2, R, 1.2); HT_L(g, c[0] + 1, c[1] - 3, c[0] + 5, c[1] + 1, HT_DO[1], 1.2); }
  P.legs.filter(l => !l.far).forEach(chan);
  // chuỗi hạt và lá bùa
  { const hb = HT_bz(P.hat[0], P.hat[1], P.hat[2], P.hat[3], 9); const bm = hb[5]; HT_L(g, bm[0], bm[1], bm[0] - .5, bm[1] + 4, '#8a2a10', 1); HT_P(g, [[bm[0] - 3.4, bm[1] + 3.4], [bm[0] + 2.6, bm[1] + 3.4], [bm[0] + 2.6, bm[1] + 13], [bm[0] - 3.4, bm[1] + 13]], '#ffd23c'); HT_P(g, [[bm[0] - 3.4, bm[1] + 3.4], [bm[0] - 1.6, bm[1] + 3.4], [bm[0] - 1.6, bm[1] + 13], [bm[0] - 3.4, bm[1] + 13]], '#fff6b0');
    HT_L(g, bm[0] - .4, bm[1] + 5, bm[0] - .4, bm[1] + 11, '#b0261a', 1); HT_L(g, bm[0] - 2, bm[1] + 6.4, bm[0] + 1.4, bm[1] + 6.4, '#b0261a', 1); HT_L(g, bm[0] - 2, bm[1] + 9.4, bm[0] + 1.4, bm[1] + 9.4, '#b0261a', 1);
    hb.forEach((q, i) => { const big = i === 5, c = i % 2 ? ['#8a2a10', '#e8442a', '#ffb070'] : ['#1a5a4a', '#3ad0a0', '#c8fff0']; HT_E(g, q[0], q[1], big ? 2.6 : 1.9, big ? 2.6 : 1.9, big ? '#c48a10' : c[0]); HT_E(g, q[0] - .2, q[1] - .3, big ? 1.9 : 1.3, big ? 1.9 : 1.3, big ? '#ffd23c' : c[1]); HT_D(g, q[0] - .8, q[1] - 1, big ? '#fff6b0' : c[2]); }); }
  // đầu
  T.ox = P.head[0]; T.oy = P.head[1]; T.a = P.head[2]; HT_dau(g, p); const eye = HT_p(-5, -4); T.ox = 0; T.oy = 0; T.a = 0;
  vien(g);
  // sau viền: mắt rực, lửa ma đầu đuôi, lửa trùm thân
  if (p >= 2) { const ec = p === 3 ? '#ffd0ff' : '#e08cff'; for (let j = 0; j < 6; j++) { const a = j / 6 * 6.283 + .4; line(g, eye[0] + Math.cos(a) * 6 * k, eye[1] + Math.sin(a) * 4.5 * k, eye[0] + Math.cos(a) * 9 * k, eye[1] + Math.sin(a) * 7 * k, ec, 1); } }
  if (p === 3) { for (let i = 1; i < sp.length; i += 4) { const u = up(sp, i), r = trf(i / 26); HT_lua(g, sp[i][0] + u[2] * (r - 2) + 2, sp[i][1] + u[3] * (r - 2), 12 + i % 3 * 3, 4.4, [HT_LUA[1], HT_LUA[2], HT_LUA[3]], 3); }
    for (const lg of P.legs) if (!lg.up) HT_lua(g, lg.paw[0] + 3, lg.paw[1] + 2, 12, 4.6, [HT_LUA[1], HT_LUA[2], HT_LUA[3]], 2);
    tails.forEach((tl, i) => { const j = 20 + (i * 7) % 24; HT_lua(g, tl[j][0], tl[j][1], 10, 3.6, [HT_LUA[1], HT_LUA[2], HT_LUA[3]], 2); });
    for (let i = 0; i < 26; i++) { const x = (i * 53 + 17) % P.w, y = (i * 41 + 5) % (P.gy - 24); HT_D(g, x, y, i % 3 ? '#ffd23c' : '#ff8a1e'); } }
  tips.forEach((q, i) => { const s = (p === 3 ? 1.25 : 1) * (i % 2 ? 1 : 1.15); HT_lua(g, q[0], q[1] + 2, 11 * s, 3.6 * s, HT_MA, 1.5); HT_E(g, q[0], q[1], 3.4 * s, 3 * s, HT_MA[1]); HT_E(g, q[0], q[1] + .2, 2.2 * s, 1.9 * s, HT_MA[2]); HT_E(g, q[0], q[1] + .4, 1 * s, .9 * s, HT_MA[3]); HT_D(g, q[0] + 3, q[1] - 13 * s, HT_MA[2]); HT_D(g, q[0] - 4, q[1] - 8 * s, HT_MA[1]); });
  T.k = 1; g.foot = Math.round(P.gy * k); return g; }
// pha 2: phân thân mờ màu lửa ma ở hai bên
function HT_phanThan(g0, gb) { const mx = 58, g = S(g0.w + mx * 2, g0.h + 8); const st = (s, ox, oy, al, fl) => { for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) { const c = s.d[y * s.w + x]; if (!c) continue; const X = fl ? ox + s.w - 1 - x : x + ox, Y = y + oy; if (X < 0 || Y < 0 || X >= g.w || Y >= g.h || g.d[Y * g.w + X]) continue;
      g.d[Y * g.w + X] = al ? ((c === OL || c === '#0a0c1e') ? 'rgba(170,235,255,' + (al + .3) + ')' : ((x + y) % 2 ? 'rgba(90,170,255,' + al + ')' : 'rgba(150,110,255,' + al + ')')) : c; } };
  // hai bóng bên trái nhìn cùng hướng; bên phải là bóng cáo không đuôi quay mặt ra ngoài, đứng tách hẳn khỏi tán đuôi
  const b = bbox(gb), oxR = g.w - 2 - gb.w + b.x0; st(g0, mx, 8, 0); st(g0, mx - 30, 4, .34); st(gb, oxR, 6, .36, 1); st(g0, mx - 56, 0, .17); st(gb, oxR - 24, 0, .16, 1); g.foot = g0.foot + 8; return g; }
const QH = {};
QH.chon = 1;
QH.hoTinh = function (v, p) { v = v || 1; p = p || 1; const g = HT_than(v, p); return p === 2 ? HT_phanThan(g, HT_than(v, 2, 1)) : g; };
// nền lâu đài đỏ than
function HT_nen(c, x, y, w, h, fl) { c.save(); c.beginPath(); c.roundRect(x, y, w, h, 14); c.clip(); const gr = c.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#1a0c10'); gr.addColorStop(1, '#4a1612'); c.fillStyle = gr; c.fillRect(x, y, w, h);
  for (let i = 0; i < 7; i++) { const px = x + 60 + i * 160; c.fillStyle = '#241016'; c.fillRect(px, y, 44, fl); c.fillStyle = '#34161a'; c.fillRect(px + 6, y, 8, fl); c.fillStyle = '#1a0a10'; c.fillRect(px - 8, y + fl - 18, 60, 18); c.fillRect(px - 8, y, 60, 14); }
  for (let i = 0; i < 40; i++) { c.fillStyle = i % 3 ? 'rgba(255,138,30,.5)' : 'rgba(255,210,60,.6)'; c.fillRect(x + (i * 131 + 40) % w, y + (i * 67 + 20) % fl, 3, 3); }
  c.fillStyle = '#2a1014'; c.fillRect(x, y + fl, w, h - fl); c.fillStyle = '#6a2418'; c.fillRect(x, y + fl, w, 4); c.fillStyle = '#1a0a10'; for (let i = 0; i < 12; i++) c.fillRect(x + 30 + i * 90, y + fl + 16, 40, 4); c.restore(); }
TO['ho-tinh-ve-lai'] = function () {
  const N = QH.chon, [cv, c, y0] = page(1080, 6400, 'Hồ Tinh vẽ lại: ba phương án', 'Cáo chín đuôi trong Lĩnh Nam chích quái, trùm vùng Lâu đài cổ, hệ Lửa. Lông trắng ngà, chóp đuôi, tai, chân chuyển cam đỏ. Đầu mỗi đuôi có một đốm lửa ma. Vẽ phóng to 5 lần, cạnh em bé.');
  const D = [['Ngồi kiêu kỳ', 'Ngồi thẳng lưng, hất cằm, chín đuôi xòe như chiếc quạt lửa sau lưng.'], ['Rình mồi', 'Thân hạ thấp, đầu chúi về trước, đuôi tỏa rộng che kín cả lưng.'], ['Chồm lên', 'Đứng bằng hai chân sau, vung vuốt, chín đuôi cuộn xoáy một chiều.']];
  let y = y0;
  for (let v = 1; v <= 3; v++) { const g = QH.hoTinh(v, 1), b = bbox(g), fh = (g.foot - b.y0) * 5, H = fh + 190, d = D[v - 1]; panel(c, 16, y, 1048, H);
    if (v === N) { c.strokeStyle = GOLDT; c.lineWidth = 4; c.beginPath(); c.roundRect(18, y + 2, 1044, H - 4, 18); c.stroke(); rr(c, 850, y + 26, 190, 46, 23, GOLDT); text(c, 'Đề xuất', 945, y + 59, 28, '#2b2632', true, 'center'); }
    badge(c, v, 58, y + 50); text(c, 'Phương án ' + v + ': ' + d[0], 94, y + 61, 32, v === N ? GOLDT : CREAM, true); para(c, d[1], 36, y + 104, 1000, 23, CREAM, 30); text(c, b.w + ' x ' + b.h + ' điểm ảnh', 36, y + 134, 20, SOFT, false);
    const fy = y + H - 34, x = Math.min(620, 1044 - b.w * 2.5); aura(c, x, fy - fh / 2, 5, 58, 46, '255,90,40'); floor(c, 40, fy, 1000); draw(c, g, x, fy, 5); put(c, { key: 'smith', weapon: W('sword') }, 78, fy, 5); y += H + 22; }
  text(c, 'Ba pha của phương án số ' + N, 22, y + 34, 34, GOLDT, true); y += 52;
  const PH = [['Pha 1: kiêu kỳ', 'Thong thả, mắt vàng hẹp, lửa ma chập chờn ở đầu chín đuôi.', '#ffd27a'], ['Pha 2: phân thân', 'Mắt tím rực. Các bóng cáo mờ màu lửa ma hiện ra hai bên, thật giả khó phân.', '#c9a0ff'], ['Pha 3: hóa cuồng', 'To gấp rưỡi. Lửa trùm toàn thân, lông dựng ngược, nanh dài, mắt trắng rực.', '#ff9d6a']];
  const G = [1, 2, 3].map(p => QH.hoTinh(N, p)), B = G.map(bbox), h12 = Math.max(G[0].foot - B[0].y0, G[1].foot - B[1].y0) * 2, HA = h12 + 150;
  [[16, 400], [432, 632]].forEach((q, i) => { panel(c, q[0], y, q[1], HA); const fy = y + h12 + 30; if (i) aura(c, q[0] + q[1] / 2, fy - h12 / 2, 4, 58, 38, '150,110,255'); draw(c, G[i], q[0] + q[1] / 2, fy, 2); text(c, PH[i][0], q[0] + q[1] / 2, y + h12 + 72, 28, PH[i][2], true, 'center'); para(c, PH[i][1], q[0] + q[1] / 2, y + h12 + 104, q[1] - 36, 21, CREAM, 27, 'center'); });
  y += HA + 16; { const h3 = (G[2].foot - B[2].y0) * 2, H3 = h3 + 60; panel(c, 16, y, 1048, H3); const fy = y + h3 + 30, x = 36 + B[2].w; aura(c, x, fy - h3 / 2, 4, 59, 46, '255,120,30'); draw(c, G[2], x, fy, 2);
    const tx = Math.min(1040 - 300, 70 + B[2].w * 2); text(c, PH[2][0], tx, y + 80, 30, PH[2][2], true); para(c, PH[2][1], tx, y + 120, 1044 - tx, 22, CREAM, 30); para(c, 'Ba pha vẽ cùng tỉ lệ (phóng 2 lần). Pha 3 là hình vẽ riêng ở cỡ lớn: ' + B[2].w + ' x ' + B[2].h + ' điểm ảnh, pha 1 là ' + B[0].w + ' x ' + B[0].h + '.', tx, y + 230, 1044 - tx, 20, SOFT, 28); y += H3 + 26; }
  text(c, 'Cỡ thật cạnh em bé (phóng 3 lần)', 22, y + 34, 34, GOLDT, true); y += 52;
  { const hs = (G[0].foot - B[0].y0) * 3, Hs = hs + 100, f2 = y + hs + 56; HT_nen(c, 16, y, 1048, Hs, hs + 56); put(c, { key: 'smith', weapon: W('sword') }, 120, f2, 3); put(c, { key: 'hunter', weapon: W('bow') }, 220, f2, 3); draw(c, G[0], Math.min(660, 1050 - B[0].w * 1.5), f2, 3); y += Hs; }
  return cut(cv, y + 22);
};
