// ASTRAL ARSENAL — MÔ PHỎNG GACHA THU THẬP (sở hữu + rương + mở nhóm theo cấp phi công) — docs/demo-hop-tuong/tuvan/gacha-thu-thap/BANG-MO-NHOM.md §4
//  Đọc bảng nhóm thật (thap/js/sohuu.js → SHC) + roster thật (thap/assets/roster.json); số rương / túi trận / XP chép từ kinhte.js, thebai.js, tientrinh.js.
//  2 mức người chơi: THƯỜNG 5 trận/ngày · NHẸ 1–2 trận/ngày (xen kẽ). In: cấp, số ụ SỞ HỮU mỗi bậc, số ụ đã MỞ, bản sao Vàng/Đỏ ở ngày 1/3/7/14/30
//  (trung bình N lần chạy, hạt giống cố định) + ngày dự kiến mở mỗi nhóm.
//  Chạy: node tools/thap-sim-gacha.js [số lần=2000]
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const GOC = path.join(__dirname, '..', 'thap');
const ctx = {}; vm.createContext(ctx);
const src = fs.readFileSync(path.join(GOC, 'js', 'sohuu.js'), 'utf8');
vm.runInContext(src.slice(0, src.indexOf('const SH = {')) + ';this.SHC = SHC;', ctx);
const SHC = ctx.SHC;
const ROSTER = JSON.parse(fs.readFileSync(path.join(GOC, 'assets', 'roster.json'), 'utf8')).filter(r => r.id !== 'haoquang');
const BAC = {}; for (const r of ROSTER) BAC[r.id] = r.bac;
const TIER = ['trang', 'xanh', 'tim', 'vang', 'do'];
const capMo = {}; for (const L in SHC.nhom) for (const id of SHC.nhom[L].ds) capMo[id] = +L;
const thieu = ROSTER.filter(r => !capMo[r.id]).map(r => r.id);
const N = +(process.argv[2] || 2000);

// ---- số liệu game (chép) ----
const xpCan = (L) => 20 + 15 * L, xpTong = (L) => { let x = 0; for (let l = 1; l < Math.min(L, 30); l++) x += xpCan(l); return x; };
const capTuXp = (xp) => { let L = 1; while (L < 30 && xp >= xpTong(L + 1)) L++; return L; };
const soLuot = (w) => Math.min(14, 1 + Math.floor(Math.min(w, 36) / 4) + Math.floor(Math.max(0, w - 36) / 8));
const TILE_TUI = { trang: 58, xanh: 29, tim: 11, vang: 1.8, do: 0.2 };
const RUONG = {
  thuong: { so: 6, tiLe: { trang: 62, xanh: 29, tim: 8.5, vang: 0.5, do: 0 } },
  vang: { so: 8, tiLe: { trang: 44, xanh: 36, tim: 16, vang: 3.8, do: 0.2 }, it: 'tim', pityV: 10 },
  su: { so: 3, tiLe: { trang: 35, xanh: 40, tim: 25 }, co: 'su' },
  hh: { so: 2, tiLe: { trang: 40, xanh: 40, tim: 20 }, co: 'vang' },
  cd: { so: 2, tiLe: { xanh: 40, tim: 60 }, co: 'do' },
};
const VQ = [[null, 30], [['trang', 10], 16], [null, 14], [null, 14], [['xanh', 4], 12], [null, 6], [['tim', 2], 7.5], [['vang', 1], 0.5]];

// ---- người chơi ----
const MUC = {
  thuong: { ten: 'THƯỜNG (5 trận/ngày)', tran: () => 5, wave: (d) => [14, 18, 22, 24, 26, 28, 30][d - 1] || Math.min(33, 30 + (d - 8) * 0.25), hjTre: 1, muaSp: ['trang', 'xanh', 'tim'] },
  nhe: { ten: 'NHẸ (1–2 trận/ngày)', tran: (d) => (d % 2 ? 2 : 1), wave: (d) => [14, 16, 18, 20, 21, 22, 23][d - 1] || Math.min(30, 23 + (d - 7) * 0.4), hjTre: 2, muaSp: ['trang'] },
};

function chay(muc, seed, ngayMax) {
  let a = seed >>> 0; const r = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const P = MUC[muc], co = new Set(SHC.khoiDau), ban = {}; let xp = 0, kl = 0, ngoc = 0, pv = 0, nhanCap = 1, trumHa = 0, hjXong = 0, moc = {};
  const cap = () => capTuXp(xp), mo = (id) => cap() >= (capMo[id] || 1) && (BAC[id] !== 'do' || kl >= 30);
  const pool = (b) => ROSTER.filter(x => x.bac === b && (mo(x.id) || co.has(x.id))).map(x => x.id);
  const them = (id, n) => { co.add(id); ban[id] = (ban[id] || 0) + n; };
  const chon = (b) => { for (let i = TIER.indexOf(b); i >= 0; i--) { const ds = pool(TIER[i]); if (ds.length) return ds[Math.floor(r() * ds.length)]; } return null; };
  const rutBac = (t) => { let x = r() * 100; for (const b of TIER) { const w = t[b] || 0; if (x < w) return b; x -= w; } return 'trang'; };
  const tuan = () => { const ds = pool('vang'); return ds.length ? ds[0] : null; }; // ụ nổi bật (cố định trong tuần)
  const BAN = { trang: [4, 8], xanh: [2, 4], tim: [1, 2], vang: [1, 1], do: [1, 1] };
  const ruong = (k, n) => {
    const C = RUONG[k], bac = [];
    for (let i = 0; i < C.so; i++) bac.push(rutBac(C.tiLe));
    if (C.it && !bac.some(b => TIER.indexOf(b) >= 2)) bac[0] = 'tim';
    if (C.pityV) { if (!bac.includes('vang') && pv + 1 >= C.pityV && pool('vang').length) bac[0] = 'vang'; pv = bac.includes('vang') ? 0 : pv + 1; }
    for (const b of bac) { const id = chon(b); if (id) { const [x, y] = BAN[BAC[id]]; them(id, x + Math.floor(r() * (y - x + 1))); } }
    for (let i = 0; i < (n || 1); i++) { const id = C.co === 'su' ? (tuan() || chon('vang')) : C.co ? chon(C.co) : null; if (id) them(id, 1); }
  };
  const lenCap = () => { const L = cap(); for (let l = nhanCap + 1; l <= L; l++) { ngoc += 20; if (l % 5 === 0) ruong('vang'); if (l === 6) { const id = chon('vang'); if (id) them(id, 1); } } nhanCap = Math.max(nhanCap, L); };
  const out = {}; let sk = 0;
  them(SHC.qua.hd, 1); // xong hướng dẫn
  for (let d = 1; d <= ngayMax; d++) {
    if ((d - 1) % 7 === 0) sk = 0;
    const w0 = P.wave(d), n = P.tran(d);
    for (let g = 0; g < n; g++) {
      const w = Math.max(1, Math.round(w0 + (r() - 0.5) * 6)), trum = Math.floor(w / 10);
      xp += w + 3 * trum; kl = Math.max(kl, w);
      for (let i = 0; i < soLuot(w); i++) { const b = rutBac(TILE_TUI); const trong = r() < (b === 'do' ? 0.3 : 0.5); if (trong && [...co].some(id => BAC[id] === b)) continue; const ds = pool(b); if (!ds.length) continue; const id = ds[Math.floor(r() * ds.length)]; const [x, y] = { trang: [3, 6], xanh: [2, 4], tim: [1, 2], vang: [1, 1], do: [1, 1] }[b]; them(id, x + Math.floor(r() * (y - x + 1))); }
      const sk0 = sk; sk += Math.min(60, w + 5 * trum);
      for (const [m, f] of [[100, () => ruong('su')], [180, () => ruong('thuong')], [400, () => ruong('su')], [550, () => ruong('vang')], [1000, () => ruong('su', 2)], [1300, () => ruong('vang')], [1700, () => ruong('hh')]]) if (sk0 < m && sk >= m) f();
      if (trum && trumHa < 12 && r() < 0.5) { trumHa++; ruong('hh'); } // trùm mới hạ lần đầu (≈ nửa số trận có trùm mới ở tuần đầu)
      for (const [mw, nn] of [[20, 1], [30, 2]]) if (w >= mw && !moc[mw]) { moc[mw] = 1; ruong('hh', nn); }
      lenCap();
    }
    ngoc += 45; // nhiệm vụ + điểm danh + quay (trung bình)
    if (d % 7 === 3) ruong('thuong'); if (d % 7 === 0) ruong('vang'); // điểm danh
    if (cap() >= 2) { // vòng quay miễn phí + cửa hàng
      let x = r() * 100, o = 0; while (o < VQ.length - 1 && x >= VQ[o][1]) { x -= VQ[o][1]; o++; }
      if (VQ[o][0]) { const id = chon(VQ[o][0][0]); if (id) them(id, VQ[o][0][1]); }
      for (const b of P.muaSp) { const id = chon(b); if (id) them(id, { trang: 30, xanh: 9, tim: 3 }[b]); }
    }
    if (kl >= 28 && r() < 0.3) ruong('hh'); // nhiệm vụ "Reach wave 30"
    if (cap() >= 3 && ngoc >= 500) { ngoc -= 500; ruong('vang'); }
    // hành trình 7 ngày: THƯỜNG xong ngày N vào ngày N, NHẸ chậm gấp đôi
    while (hjXong < 7 && d >= Math.ceil((hjXong + 1) * P.hjTre)) {
      hjXong++;
      if (hjXong === 1) { ngoc += 30; ruong('thuong'); them(SHC.qua.hj1, 1); }
      if (hjXong === 2) { ngoc += 30; ruong('thuong'); }
      if (hjXong === 3) { ngoc += 40; const id = chon('tim'); if (id) them(id, 4); }
      if (hjXong === 4) { ngoc += 40; them(SHC.qua.hj4, 1); }
      if (hjXong === 5) ruong('vang');
      if (hjXong === 6) { ngoc += 50; them(SHC.qua.hj6, 1); }
      if (hjXong === 7) { const id = chon('vang'); if (id) them(id, 2); }
    }
    const dem = {}, moDem = {}, banB = {};
    for (const b of TIER) { dem[b] = 0; moDem[b] = 0; banB[b] = 0; }
    for (const x of ROSTER) { if (co.has(x.id)) dem[x.bac]++; if (co.has(x.id) || mo(x.id)) moDem[x.bac]++; banB[x.bac] += ban[x.id] || 0; }
    out[d] = { cap: cap(), dem, moDem, banB, kl };
  }
  return out;
}

const NGAY = [1, 3, 7, 14, 30];
if (thieu.length) console.log('⚠ ụ chưa có trong bảng nhóm:', thieu.join(', '));
const tong = {}; for (const b of TIER) tong[b] = ROSTER.filter(r => r.bac === b).length;
console.log('Roster chơi được: ' + ROSTER.length + ' (' + TIER.map(b => b + ' ' + tong[b]).join(' · ') + ') · nhóm: ' + Object.keys(SHC.nhom).length + ' cấp\n');
for (const muc of Object.keys(MUC)) {
  const S = {}; for (const d of NGAY) S[d] = { cap: 0, dem: {}, moDem: {}, banB: {}, coDo: 0 };
  for (let i = 0; i < N; i++) {
    const o = chay(muc, 1234567 + i * 7919, 30);
    for (const d of NGAY) { const x = o[d], s = S[d]; s.cap += x.cap; if (x.dem.do > 0) s.coDo++; for (const b of TIER) { s.dem[b] = (s.dem[b] || 0) + x.dem[b]; s.moDem[b] = (s.moDem[b] || 0) + x.moDem[b]; s.banB[b] = (s.banB[b] || 0) + x.banB[b]; } }
  }
  console.log('== ' + MUC[muc].ten + ' — trung bình ' + N + ' lần ==');
  console.log('| Ngày | Cấp | Sở hữu Trắng/Xanh/Tím/Vàng/Đỏ (tổng) | Đã mở (bể rơi) | Bản Vàng · Đỏ đã nhận | Có ≥1 Đỏ |');
  for (const d of NGAY) {
    const s = S[d], f = (v) => (v / N).toFixed(1).replace(/\.0$/, ''), coT = TIER.reduce((a, b) => a + s.dem[b], 0), moT = TIER.reduce((a, b) => a + s.moDem[b], 0);
    console.log('| ' + d + ' | ' + f(s.cap) + ' | ' + TIER.map(b => f(s.dem[b])).join(' / ') + ' (' + f(coT) + ') | ' + f(moT) + ' | ' + f(s.banB.vang) + ' · ' + (s.banB.do / N).toFixed(2) + ' | ' + Math.round(s.coDo / N * 100) + '% |');
  }
  console.log('');
}
// ngày dự kiến mở mỗi nhóm (cấp trung bình theo ngày, mức THƯỜNG / NHẸ)
const capNgay = {}; for (const muc of Object.keys(MUC)) { const o = chay(muc, 99, 60), ds = []; for (let d = 1; d <= 60; d++) ds.push(o[d].cap); capNgay[muc] = ds; }
console.log('| Cấp | Nhóm | Ụ (T/X/Tm/V/Đ) | Ngày mở THƯỜNG | Ngày mở NHẸ |');
for (const L in SHC.nhom) {
  const g = SHC.nhom[L], dem = TIER.map(b => g.ds.filter(id => BAC[id] === b).length).join('/');
  const ngay = (m) => { const i = capNgay[m].findIndex(c => c >= +L); return i < 0 ? '> 60' : String(i + 1); };
  console.log('| ' + L + ' | ' + g.ten + ' | ' + dem + ' | ' + ngay('thuong') + ' | ' + ngay('nhe') + ' |');
}
