// Chi tiết thêm cho các quái trông "chung chung" (góp ý của chủ dự án: "quái cũng cần chi tiết hơn chút").
// Tệp này chạy SAU các tệp cử động của từng vùng, trước MA._xong():
//  - vẽ thêm điểm ảnh lên hình gốc (vảy, đốm, ánh mắt, nanh...), chỉ trong khung hình cũ để không đổi cỡ va chạm;
//  - tách thêm bộ phận cử động riêng (vây, cánh, đuôi, xúc tu, gai) và viết lại các cử động để bộ phận đó chuyển động.
// Mọi cử động mới đều gọi bộ cử động chuẩn (CH) hoặc cử động cũ trước, rồi mới thêm cử động của bộ phận.
const CT = MA.chiTiet = { sua: [] };
// Vẽ một điểm vào hình gốc: sửa cả lớp "thân chưa viền" (pre) lẫn lớp đã viền, để viền tối vẫn tự tính lại mỗi khung.
// trong = true: chỉ vẽ lên chỗ đã có thân (không mọc thêm ra ngoài).
let CT_BB = null;
function ctDiem(g, x, y, c, trong) {
  x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= g.w || y >= g.h) return;
  if (CT_BB && (x < CT_BB.x0 || x > CT_BB.x1 || y < CT_BB.y0 || y > CT_BB.y1)) return; // giữ khung cũ (cỡ va chạm)
  const i = y * g.w + x, goc0 = g.pre ? g.pre[i] : g.d[i];
  if (trong && !goc0) return;
  if (g.pre) { g.pre[i] = c; if (g.sauVien && g.d[i] === g.sauVien[i]) { g.d[i] = c; g.sauVien[i] = c; } }
  else g.d[i] = c;
}
// Bọc hàm vẽ hình gốc của con id: ve(g, hv, ph) vẽ thêm chi tiết. Khung hình (cỡ va chạm) được giữ nguyên: điểm nào ngoài khung cũ thì bỏ.
function ctHinh(id, ve) {
  const d = DEFS[id]; if (!d) return; const cu = d.luoi;
  d.luoi = function (ph, hv) {
    const g = cu(ph, hv);
    try { CT_BB = bbox(g); ve(g, hv, ph); g.bb = null; } catch (e) { MA.loi.push('chitiet ' + id + ': ' + (e && e.stack || e)); }
    CT_BB = null; return g;
  };
  CT.sua.push(id);
}
// Thêm bộ phận cử động (danh sách hoặc hàm theo biến thể hình).
function ctPhan(id, ds) {
  const d = DEFS[id]; if (!d) return; const cu = d.parts;
  d.parts = function (ph, hv) { const a = (typeof cu === 'function' ? cu(ph, hv) : cu) || []; const b = typeof ds === 'function' ? ds(ph, hv) : ds; return a.concat(b || []); };
}
// Thêm cử động cho bộ phận: chạy cử động cũ (hoặc chuẩn) rồi gọi them(P).
function ctCu(id, ten, them) {
  const d = DEFS[id]; if (!d) return; const a = d.anims[ten];
  const cu = a ? (typeof a === 'function' ? a : a.f) : CH[ten]; if (!cu) return;
  const f = P => { cu(P); them(P); };
  if (a && typeof a !== 'function') a.f = f; else d.anims[ten] = { d: (a && a.d) || DMAC[ten][0], lap: DMAC[ten] ? DMAC[ten][1] : false, f };
}
// Ghi nhiều cử động một lúc: bang = { idle: P => ..., move: ... }
function ctAnim(id, bang) { for (const k of Object.keys(bang)) ctCu(id, k, bang[k]); }
// Đốm 3 tông: một điểm tối, một điểm sáng chéo phía trên trái.
function ctDom(g, x, y, toi, sang) { ctDiem(g, x, y, toi, true); if (sang) ctDiem(g, x - 1, y - 1, sang, true); }
// Đường thẳng chỉ vẽ lên các điểm đang mang một trong các màu chiMau (để vân không đè lên mắt, miệng).
function ctDuong(g, x0, y0, x1, y1, c, chiMau) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); for (let i = 0; i <= n; i++) { const x = Math.round(x0 + (x1 - x0) * i / n), y = Math.round(y0 + (y1 - y0) * i / n), q = g.pre ? g.pre[y * g.w + x] : g.d[y * g.w + x]; if (!chiMau || chiMau.indexOf(q) >= 0) ctDiem(g, x, y, c, true); } }
// Khối 2x2 (đốm to dễ thấy ở cỡ thật), chỉ trên thân.
function ctO(g, x, y, c, chiMau) { for (const d of [[0, 0], [1, 0], [0, 1], [1, 1]]) { const q = g.pre ? g.pre[(y + d[1]) * g.w + x + d[0]] : null; if (!chiMau || chiMau.indexOf(q) >= 0) ctDiem(g, x + d[0], y + d[1], c, true); } }
// Lớp vẽ đè mỗi khung (ánh mắt nhấp nháy, tia lửa ngòi...): hàm f(c, x, y) tại điểm (sx, sy) trên hình gốc. Không vẽ khi đang chết.
function ctPhu(P, sx, sy, f) { if (P.anim === 'die' || P.a <= 0) return; const q = P.pt(sx, sy); P.over(c => f(c, q[0], q[1])); }
const ctRung = (u, k) => u > k ? (((u * 24) | 0) % 2 ? .6 : -.6) : 0;

// ============ HANG BIỂN ============
// ---- Cá Nóc: đốm trên lưng, ánh mắt, vây ngực và đuôi vẫy riêng, gai lưng dựng lên khi báo đòn ----
ctHinh('caNoc', g => {
  const LUNG = ['#1fb49c', '#98f3da', '#0e746e'];
  for (const p of [[25, 24], [30, 24], [35, 23], [28, 27], [38, 26], [33, 26], [22, 28]]) ctO(g, p[0], p[1], '#063b3c', LUNG); // đốm báo trên lưng
  for (const p of [[27, 23], [32, 23], [37, 25]]) ctDiem(g, p[0], p[1], '#98f3da', true);
  ctDiem(g, 25, 29, '#ffffff', true); ctDiem(g, 37, 29, '#ffffff', true); // ánh mắt
  ctDiem(g, 27, 30, S2[1], true); ctDiem(g, 36, 30, S2[1], true); // con ngươi đỏ
  for (let x = 27; x <= 36; x += 3) ctDiem(g, x, 39, B2[1], true); // vằn bụng
  ctDiem(g, 29, 38, TR, true); ctDiem(g, 35, 38, TR, true); // nanh dưới
});
ctPhan('caNoc', [
  { n: 'vay', m: [[17, 33, 25, 37]], mau: ['#ee5c3a'], pv: [24, 35] },
  { n: 'duoi', m: [[41, 27, 47, 37]], mau: ['#ee5c3a', '#b32a2c'], pv: [41, 32], keep: 0 },
  { n: 'gai', m: [[26, 19, 37, 24]], mau: ['#ffffff', '#a9d8ee'], pv: [32, 25], keep: 0 },
  { n: 'gaiD', m: [[24, 40, 38, 45]], mau: ['#ffffff', '#a9d8ee'], pv: [31, 40], keep: 0 }]);
ctAnim('caNoc', {
  idle: P => { const u = P.u; P.r('vay', 28 * sn(u * 2)).r('duoi', 16 * sn(u * 1.5 + .2)).s('gai', 1, 1 + .12 * sn(u)).s('gaiD', 1, 1 + .1 * sn(u + .5)); },
  move: P => { const u = P.u; P.r('vay', 40 * sn(u * 2)).r('duoi', 24 * sn(u * 2 + .3)); },
  tele: P => { const u = P.u, k = seg(u, 0, .4); P.s('gai', 1, 1 + .45 * k).s('gaiD', 1, 1 + .35 * k).r('vay', 45 * sn(u * 4)).r('duoi', 20 * sn(u * 4)); },
  atk: P => { const u = P.u, k = 1 - seg(u, .3, 1); P.s('gai', 1, 1 + .5 * k).s('gaiD', 1, 1 + .4 * k).r('vay', -30 * k).r('duoi', 25 * sn(u * 3)); },
  hit: P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); P.r('vay', -35 * k).r('duoi', 30 * k).s('gai', 1, 1 - .3 * k); },
  die: P => { const k = seg(P.u, 0, .25); P.r('vay', 50 * k).r('duoi', -40 * k).s('gai', 1, 1 - .4 * k); },
});
// ---- Sứa Bom: vành chuông có vân sáng, đốm phát quang, ngòi bom sáng; hai chùm xúc tu lượn lệch nhịp, quả bom đung đưa ----
ctHinh('sua', g => {
  const CHUONG = ['#50bde6', '#2273b2', '#d4f5ff'];
  for (const l of [[14, 7, 9, 19], [19, 5, 16, 11], [31, 5, 34, 11], [36, 7, 40, 19], [25, 4, 25, 9]]) ctDuong(g, l[0], l[1], l[2], l[3], '#0f437a', CHUONG); // gân chuông
  for (let x = 8; x <= 35; x += 3) ctDiem(g, x, 20, '#8fdcf5', true); // vân vành chuông
  for (let x = 9; x <= 34; x += 3) ctDiem(g, x, 19, '#50bde6', true);
  for (const p of [[28, 8], [31, 10], [13, 17], [33, 16], [21, 6]]) { ctDiem(g, p[0], p[1], '#d4f5ff', true); ctDiem(g, p[0] + 1, p[1], '#8fdcf5', true); } // đốm phát quang
  ctDiem(g, 26, 28, '#ffe14a'); ctDiem(g, 27, 27, '#ffffff'); ctDiem(g, 25, 27, '#ff8a3c'); // ngòi bom cháy
  ctDiem(g, 22, 33, '#ffe14a', true); ctDiem(g, 23, 33, '#ffe14a', true); // dấu nguy trên bom
  ctDiem(g, 24, 15, '#ffffff', true); ctDiem(g, 18, 17, '#fff8e0', true); ctDiem(g, 28, 17, '#fff8e0', true); // nanh
});
ctPhan('sua', [
  { n: 'tuaT', m: [[5, 22, 19, 40]], mau: ['#3fa8d8', '#c8f2ff', '#ff5a46', '#0f437a', '#ff7a5c'], pv: [13, 22], keep: 0 },
  { n: 'tuaP', m: [[30, 22, 41, 40]], mau: ['#3fa8d8', '#c8f2ff', '#ff5a46', '#0f437a', '#ff7a5c'], pv: [33, 22], keep: 0 },
  { n: 'bom', m: [[19, 22, 30, 40]], pv: [25, 22], keep: 0 }]);
const tiaNgoi = (P) => ctPhu(P, 26, 27, (c, x, y) => { const f = ((P.t * 14) | 0) % 3; F.px(c, x - 1 + (f === 1 ? 1 : 0), y - 1 - (f === 2 ? 1 : 0), f ? '#fff6b0' : '#ff8a1e', f ? 1 : 2, f ? 1 : 2); F.px(c, x + (f - 1) * 2, y - 2 - f, '#ffd23c'); });
ctAnim('sua', {
  spawn: P => { if (P.u > .6) tiaNgoi(P); },
  idle: P => { tiaNgoi(P); const u = P.u; P.w('tuaT', 12, -u, .45).w('tuaP', 12, -u + .5, .45).r('bom', 7 * sn(u + .1)); P.sy *= 1 + .05 * sn(u); P.sx *= 1 - .04 * sn(u); },
  move: P => { tiaNgoi(P); const u = P.u; P.b('tuaT', 18 + 8 * sn(u)).b('tuaP', 18 + 8 * sn(u + .2)).w('tuaT', 9, -u * 2, .45).w('tuaP', 9, -u * 2 + .3, .45).r('bom', 12 * sn(u - .2)); },
  tele: P => { tiaNgoi(P); const u = P.u, k = seg(u, 0, .4); P.r('tuaT', 25 * k).r('tuaP', -25 * k).w('tuaT', 14, -u * 4, .45).w('tuaP', 14, -u * 4, .45).r('bom', 14 * sn(u * 5)); },
  atk: P => { const k = 1 - seg(P.u, 0, .6); P.r('tuaT', 40 * k).r('tuaP', -40 * k).s('bom', 1 + .2 * k); },
  hit: P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); P.b('tuaT', -30 * k).b('tuaP', 30 * k).r('bom', 25 * k); },
  die: P => { const k = seg(P.u, 0, .3); P.r('tuaT', 30 * k).r('tuaP', -30 * k).b('tuaT', 30 * k).b('tuaP', -30 * k); },
});
// ---- Cá Chuồn: ánh mắt, vạch sáng dọc thân; cánh vây vỗ, đuôi quẫy, vây bụng lay ----
ctHinh('caChuon', g => {
  ctDiem(g, 15, 19, '#ffffff', true); ctDiem(g, 16, 20, '#14182e', true); // ánh mắt, con ngươi
  for (let x = 18; x <= 34; x += 2) ctDiem(g, x, 21, '#a6deff', true); // đường sáng dọc thân
  for (let x = 19; x <= 33; x += 4) ctDiem(g, x, 19, '#0e2a5a', true); // vảy lưng
  for (const p of [[25, 6], [27, 9], [29, 12]]) ctDiem(g, p[0], p[1], '#4f86b0', true); // gân cánh
});
ctPhan('caChuon', [
  { n: 'canh', m: [{ p: [[17, 17], [24, 0], [42, 0], [34, 19]] }], mau: ['#a9d8ee', '#ffffff', '#4f86b0', '#ee5c3a', '#ffbe88'], pv: [27, 18], keep: 1 },
  { n: 'duoi', m: [[36, 9, 51, 31]], mau: ['#1b4c92', '#3883d4', '#0e2a5a'], pv: [36, 21], keep: 0 },
  { n: 'vay', m: [[19, 25, 30, 33]], pv: [21, 25], keep: 0 }]);
ctAnim('caChuon', {
  idle: P => { const u = P.u; P.r('canh', 10 * sn(u * 2)).r('duoi', 12 * sn(u * 2 + .2)).r('vay', 10 * sn(u + .3)); },
  move: P => { const u = P.u; P.r('canh', -18 + 22 * sn(u * 2)).r('duoi', 20 * sn(u * 2 + .3)).r('vay', 14 * sn(u * 2)); },
  tele: P => { const u = P.u, k = seg(u, 0, .4); P.r('canh', 25 * k + 6 * sn(u * 6)).b('duoi', -20 * k).r('vay', -15 * k); },
  atk: P => { const u = P.u, k = 1 - seg(u, .5, 1); P.r('canh', 30 * k).r('duoi', 28 * sn(u * 4)).r('vay', 20 * k); },
  hit: P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); P.r('canh', -30 * k).b('duoi', 30 * k); },
  die: P => { const k = seg(P.u, 0, .3); P.r('canh', 45 * k).b('duoi', 35 * k).r('vay', 30 * k); },
});
// ---- Nhím Biển: ánh mắt, nanh, đốm phát quang; ba chùm gai xù ra riêng ----
ctHinh('nhim', g => {
  ctDiem(g, 26, 34, '#ffffff', true); ctDiem(g, 36, 35, '#ffffff', true);
  ctDiem(g, 30, 41, '#fff8e0', true); ctDiem(g, 34, 41, '#fff8e0', true);
  for (const p of [[28, 30], [35, 31], [24, 37], [40, 37], [32, 28]]) ctDiem(g, p[0], p[1], '#bfe9ff', true);
  for (const p of [[27, 31], [36, 30], [31, 32]]) ctDiem(g, p[0], p[1], '#988aee', true);
  const THAN = ['#4836a0', '#988aee'];
  for (const l of [[32, 29, 32, 33], [27, 30, 29, 33], [37, 30, 35, 33]]) ctDuong(g, l[0], l[1], l[2], l[3], '#281d62', THAN); // rãnh vỏ
  for (const p of [[29, 22], [35, 22], [19, 34], [45, 34], [21, 29], [43, 29], [20, 39], [44, 39]]) ctDiem(g, p[0], p[1], '#ff7a5c', true); // đầu gai đỏ (có độc)
});
ctPhan('nhim', [
  { n: 'gaiTren', m: [[25, 21, 41, 28]], mau: ['#ffffff', '#bfe9ff', '#281d62'], pv: [32, 32], keep: 0 },
  { n: 'gaiT', m: [[18, 28, 26, 42]], mau: ['#ffffff', '#bfe9ff', '#281d62', '#110b2c'], pv: [30, 35], keep: 0 },
  { n: 'gaiP', m: [[39, 28, 47, 42]], mau: ['#ffffff', '#bfe9ff', '#281d62', '#110b2c'], pv: [34, 35], keep: 0 }]);
ctAnim('nhim', {
  idle: P => { const u = P.u; P.s('gaiTren', 1 + .08 * sn(u), 1 + .08 * sn(u)).s('gaiT', 1 + .08 * sn(u + .33)).s('gaiP', 1 + .08 * sn(u + .66)); P.r('gaiTren', 4 * sn(u)); },
  move: P => { const u = P.u; P.r('gaiT', 8 * sn(u * 2)).r('gaiP', -8 * sn(u * 2)).r('gaiTren', 5 * sn(u * 2 + .25)); },
  tele: P => { const k = seg(P.u, 0, .45); P.s('gaiTren', 1 + .3 * k).s('gaiT', 1 + .3 * k).s('gaiP', 1 + .3 * k); },
  atk: P => { const k = kf(P.u, [[0, 1], [.15, 1.45, 'out'], [1, 1]]); P.s('gaiTren', k).s('gaiT', k).s('gaiP', k); },
  hit: P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); P.s('gaiTren', 1 - .25 * k).s('gaiT', 1 - .25 * k).s('gaiP', 1 - .25 * k); },
});
// ---- Bầy Cá Con: mỗi con một vằn sẫm ngang thân và ánh mắt trắng (dễ nhận ra ba con riêng) ----
ctHinh('caCon', g => {
  ctDuong(g, 11, 7, 11, 12, '#0e2a5a', ['#3883d4']); ctDuong(g, 28, 15, 28, 20, '#063b3c', ['#1fb49c']); ctDuong(g, 14, 24, 14, 30, '#6a1220', ['#ee5c3a']);
  ctDiem(g, 12, 8, '#ffffff', true); ctDiem(g, 28, 16, '#ffffff', true); ctDiem(g, 13, 25, '#ffffff', true);
});

// ============ RỪNG GIÀ ============
// ---- Bầy Ong Vò Vẽ: gân cánh, kim chích sáng ----
ctHinh('ongVo', g => {
  const CANH = ['#d8f4ec', '#9cc8c0'];
  for (const l of [[17, 3, 13, 8], [36, 11, 32, 16], [18, 21, 14, 26]]) ctDuong(g, l[0], l[1], l[2], l[3], '#7aa8a4', CANH);
  for (const p of [[4, 9], [5, 9], [3, 6]]) ctDiem(g, p[0], p[1], '#fff8e0', true);
});
// ---- Chồn Bóng: vằn sáng dọc sống lưng, mắt rực có lõi trắng, khói bóng tím bay từ chóp đuôi ----
ctHinh('chonBong', g => {
  for (const x of [20, 25, 30, 35]) { ctDiem(g, x, 16, '#9a88c8', true); ctDiem(g, x + 1, 17, '#40305e', true); }
  ctDiem(g, 13, 16, '#ffffff', true); ctDiem(g, 14, 17, '#f070ff', true);
  for (const p of [[49, 9], [51, 11], [53, 13], [47, 13]]) ctDiem(g, p[0], p[1], '#40305e', true); // vằn đuôi
});
const khoiDuoi = P => ctPhu(P, 58, 7, (c, x, y) => { for (let i = 0; i < 3; i++) { const q = (P.t * .9 + i / 3) % 1; F.a(c, (1 - q) * .8); F.px(c, x + q * 10 * P.face + Math.sin(q * 9 + i) * 2, y - q * 8, i ? '#9a48d4' : '#e4a8ff', q < .4 ? 2 : 1, q < .4 ? 2 : 1); } F.a(c, 1); });
ctAnim('chonBong', { idle: khoiDuoi, move: khoiDuoi, tele: khoiDuoi });
// ---- Nấm Phồng: viền đốm độc, ánh mắt, rễ chân cử động riêng, bào tử bốc lên từ mũ ----
ctHinh('namPhong', (g, hv) => {
  if (hv) return;
  for (const p of [[27, 41], [35, 42]]) ctDiem(g, p[0], p[1], '#ffffff', true);
  for (const p of [[22, 37], [26, 38], [37, 38], [41, 37]]) { ctDiem(g, p[0], p[1], '#78b818', true); ctDiem(g, p[0], p[1] + 1, '#c4f43c'); } // giọt độc rỉ dưới vành mũ
  for (const p of [[29, 47], [33, 47]]) ctDiem(g, p[0], p[1], '#fff8e0', true); // nanh
  for (const x of [24, 28, 33, 37]) ctDuong(g, x, 35, x + (x < 31 ? -1 : 1), 37, '#58208c', ['#9a48d4', '#e8e0c4']); // phiến dưới mũ
});
ctPhan('namPhong', (ph, hv) => hv ? [] : [
  { n: 'reT', m: [[17, 46, 27, 52]], mau: ['#5c3a1e', '#2e1a10', '#b0a488', '#6a5c48', '#fff8e0'], pv: [27, 47], keep: 0 },
  { n: 'reP', m: [[37, 46, 47, 52]], mau: ['#5c3a1e', '#2e1a10', '#b0a488', '#6a5c48', '#fff8e0'], pv: [37, 47], keep: 0 }]);
const baoTu = P => ctPhu(P, 32, 27, (c, x, y) => { for (let i = 0; i < 4; i++) { const q = (P.t * .7 + i / 4) % 1; F.a(c, 1 - q); F.px(c, x + (hh(i, 3, 9) - .5) * 22 + Math.sin(q * 7 + i) * 2, y - q * 14, i % 2 ? '#c4f43c' : '#f4ffb0', 1, 1); } F.a(c, 1); });
ctAnim('namPhong', {
  idle: P => { baoTu(P); P.r('reT', 8 * sn(P.u)).r('reP', -8 * sn(P.u + .3)); },
  move: P => { baoTu(P); P.r('reT', 22 * sn(P.u)).r('reP', 22 * sn(P.u + .5)); },
  tele: P => { P.r('reT', -12 * seg(P.u, 0, .4)).r('reP', 12 * seg(P.u, 0, .4)); },
  hit: P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); P.r('reT', 20 * k).r('reP', -20 * k); },
});
// ---- Nhím Gai Độc: chóp gai nhỏ giọt độc xanh, mắt có ánh, mũi hồng; chùm gai phập phồng, bốn chân bước ----
ctHinh('nhimDoc', (g, hv) => {
  if (hv) return;
  for (const p of [[40, 30], [48, 30], [33, 31], [44, 32], [28, 35], [54, 36], [58, 37], [25, 39], [61, 41]]) { ctDiem(g, p[0], p[1], '#c4f43c', true); }
  ctDiem(g, 31, 45, '#ffffff', true); ctDiem(g, 30, 46, '#ff5a3c', true); ctDiem(g, 20, 48, '#c8707a', true);
  for (let x = 37; x <= 50; x += 4) ctDuong(g, x, 41, x - 2, 48, '#1c1210', ['#6a4c38', '#3e2a20']); // vằn lông
});
ctPhan('nhimDoc', (ph, hv) => hv ? [] : [
  { n: 'gai', m: [[27, 29, 63, 40]], mau: ['#e4a8ff', '#9a48d4', '#1c1210', '#c4f43c', '#e8e0c4'], pv: [44, 43], keep: 0 },
  { n: 'chanT', m: [[33, 51, 41, 56]], pv: [37, 51], z: -1 }, { n: 'chanS', m: [[48, 51, 57, 56]], pv: [52, 51], z: -1 }]);
ctAnim('nhimDoc', {
  idle: P => { P.s('gai', 1 + .06 * sn(P.u), 1 + .1 * sn(P.u)); },
  move: P => { P.r('chanT', 28 * sn(P.u * 2)).r('chanS', -28 * sn(P.u * 2)).r('gai', 3 * sn(P.u * 2)); },
  hit: P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); P.s('gai', 1 - .15 * k); },
  die: P => { const k = seg(P.u, 0, .3); P.r('chanT', 30 * k).r('chanS', -30 * k); },
});

// ============ LÂU ĐÀI CỔ ============
// ---- Bầy Dơi Than: gân màng cánh, ánh mắt ----
ctHinh('doiThan', g => {
  const MANG = ['#26222c'];
  for (const l of [[9, 8, 3, 11], [9, 9, 6, 12], [17, 8, 23, 10], [17, 9, 21, 12], [30, 17, 25, 20], [38, 17, 44, 19], [37, 18, 42, 21], [12, 23, 5, 25], [19, 23, 25, 25], [20, 24, 23, 27]]) ctDuong(g, l[0], l[1], l[2], l[3], '#48424e', MANG);
  for (const p of [[12, 9], [16, 9], [32, 15], [36, 15], [15, 24], [19, 24]]) ctDiem(g, p[0], p[1], '#fff6b0', true);
});
// ---- Hũ Lửa Sống: lá bùa vàng dán trán (bùa trấn yểm), vết nứt rực lửa; hai quai vẫy như tay, hai chân bước, tàn lửa bay ----
ctHinh('huLua', (g, hv) => {
  if (hv) return;
  for (let y = 29; y <= 31; y++) for (let x = 31; x <= 36; x++) ctDiem(g, x, y, '#ffd23c', true);
  for (const p of [[32, 30], [33, 29], [34, 30], [35, 31], [33, 31]]) ctDiem(g, p[0], p[1], '#b0261a', true);
  ctDiem(g, 37, 30, '#f0582a', true); ctDiem(g, 36, 32, '#ffd23c', true);
  ctDuong(g, 27, 39, 29, 42, '#f0582a', ['#96402a', '#5c2418']); ctDuong(g, 41, 38, 39, 41, '#f0582a', ['#96402a', '#5c2418']);
  ctDiem(g, 28, 40, '#ffd23c', true); ctDiem(g, 40, 39, '#ffd23c', true);
  ctDiem(g, 26, 36, '#ffffff', true); ctDiem(g, 39, 36, '#ffffff', true);
});
ctPhan('huLua', (ph, hv) => hv ? [] : [
  { n: 'taiT', m: [[19, 31, 25, 39]], pv: [25, 34], keep: 0 }, { n: 'taiP', m: [[43, 31, 49, 39]], pv: [43, 34], keep: 0 },
  { n: 'chanT', m: [[26, 46, 31, 50]], pv: [29, 46], z: -1 }, { n: 'chanS', m: [[36, 46, 42, 50]], pv: [38, 46], z: -1 }]);
const tanLua = P => ctPhu(P, 34, 22, (c, x, y) => { for (let i = 0; i < 3; i++) { const q = (P.t * 1.1 + i / 3) % 1; F.a(c, 1 - q); F.px(c, x + Math.sin(q * 8 + i * 2) * 3, y - q * 12, q < .3 ? '#fff6b0' : q < .6 ? '#ffd23c' : '#f0582a', 1, 1); } F.a(c, 1); });
ctAnim('huLua', {
  idle: P => { tanLua(P); P.r('taiT', 10 * sn(P.u)).r('taiP', -10 * sn(P.u)); },
  move: P => { tanLua(P); P.r('taiT', 18 * sn(P.u)).r('taiP', 18 * sn(P.u)).r('chanT', 25 * sn(P.u)).r('chanS', -25 * sn(P.u)); },
  hit: P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); P.r('taiT', -25 * k).r('taiP', 25 * k); },
  die: P => { const k = seg(P.u, 0, .25); P.r('taiT', -40 * k).r('taiP', 40 * k); },
});
// ---- Đèn Lồng Ma: nan tre trên thân đèn, ánh mắt; quai treo đung đưa, lửa trong đèn chập chờn ----
ctHinh('denLong', g => {
  for (const x of [23, 34]) ctDuong(g, x, 13, x, 22, '#b0261a', ['#f0582a', '#5a0e0c', '#b0261a']);
  ctDiem(g, 21, 18, '#ffffff', true); ctDiem(g, 32, 18, '#ffffff', true);
  for (let x = 22; x <= 32; x += 2) ctDiem(g, x, 29, '#ffd23c', true); // viền vàng đáy đèn
});
ctPhan('denLong', [{ n: 'quai', m: [[25, 6, 34, 10]], pv: [29, 10], keep: 0 }]);
const lepLua = P => ctPhu(P, 27, 24, (c, x, y) => { const f = ((P.t * 10) | 0) % 4; F.a(c, .55 + .15 * (f % 2)); F.px(c, x - 1, y - (f === 3 ? 1 : 0), '#fff6b0', 2 + (f === 1 ? 1 : 0), 1); F.a(c, 1); });
ctAnim('denLong', {
  idle: P => { lepLua(P); P.r('quai', 14 * sn(P.u)); }, move: P => { lepLua(P); P.r('quai', 20 * sn(P.u * 2)); },
  tele: P => { P.r('quai', 25 * sn(P.u * 3)); }, hit: P => { P.r('quai', 30 * kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]])); },
});
// ---- Nhím Than Hồng: vết nứt than đỏ rực trên lưng, mắt có lõi sáng, nanh; ba chùm gai và hai chân cử động riêng, tàn than bay ----
ctHinh('nhimThan', (g, hv) => {
  if (hv) return;
  const LUNG = ['#48424e', '#8a8290'];
  ctDuong(g, 26, 34, 29, 36, '#f0582a', LUNG); ctDuong(g, 33, 32, 34, 35, '#f0582a', LUNG); ctDuong(g, 38, 33, 36, 36, '#f0582a', LUNG); ctDuong(g, 30, 33, 31, 35, '#ff8a1e', LUNG);
  for (const p of [[27, 35], [34, 33], [37, 34]]) ctDiem(g, p[0], p[1], '#fff6b0', true);
  ctDiem(g, 29, 39, '#fff6b0', true); ctDiem(g, 38, 39, '#fff6b0', true);
  ctDiem(g, 32, 45, '#fff8e0', true); ctDiem(g, 36, 45, '#fff8e0', true);
});
ctPhan('nhimThan', (ph, hv) => hv ? [] : [
  { n: 'gaiTren', m: [[25, 25, 41, 32]], mau: ['#f0506e', '#ffb070', '#26222c'], pv: [33, 35], keep: 0 },
  { n: 'gaiT', m: [[20, 31, 27, 44]], mau: ['#f0506e', '#ffb070', '#26222c', '#0e0c12'], pv: [30, 38], keep: 0 },
  { n: 'gaiP', m: [[41, 31, 50, 44]], mau: ['#f0506e', '#ffb070', '#26222c', '#0e0c12'], pv: [38, 38], keep: 0 },
  { n: 'chanT', m: [[25, 45, 31, 48]], pv: [29, 45], z: -1 }, { n: 'chanS', m: [[38, 45, 44, 48]], pv: [40, 45], z: -1 }]);
const tanThan = P => ctPhu(P, 33, 30, (c, x, y) => { for (let i = 0; i < 2; i++) { const q = (P.t * .8 + i / 2) % 1; F.a(c, 1 - q); F.px(c, x + (i ? 5 : -6) + Math.sin(q * 6) * 2, y - q * 12, q < .4 ? '#ffd23c' : '#f0582a', 1, 1); } F.a(c, 1); });
ctAnim('nhimThan', {
  idle: P => { tanThan(P); const u = P.u; P.s('gaiTren', 1 + .08 * sn(u)).s('gaiT', 1 + .08 * sn(u + .33)).s('gaiP', 1 + .08 * sn(u + .66)); },
  move: P => { tanThan(P); P.r('chanT', 28 * sn(P.u * 2)).r('chanS', -28 * sn(P.u * 2)).r('gaiTren', 4 * sn(P.u * 2)); },
  hit: P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); P.s('gaiTren', 1 - .2 * k).s('gaiT', 1 - .2 * k).s('gaiP', 1 - .2 * k); },
  die: P => { const k = seg(P.u, 0, .3); P.r('chanT', 30 * k).r('chanS', -30 * k); },
});
