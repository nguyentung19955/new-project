#!/usr/bin/env node
// ĐO ĐỘ ĐA DẠNG phần thưởng trong ải (phiên su-kien-ai, docs/review/ke-hoach-cai-thien/su-kien-ai/YEU-CAU.md).
// KHÔNG chạy game, KHÔNG mở trình duyệt, KHÔNG sửa game/: chỉ nạp game/js/data.js + game/js/mapgen.js (bản đồ thật, bảng số thật)
// rồi đi lại đúng các luật thưởng của js/stage.js (rương, thương nhân, bàn thờ, thử thách, tinh anh, qua ải) bằng số ngẫu nhiên.
// Chạy:  node docs/review/ke-hoach-cai-thien/su-kien-ai/cong-cu/do-su-kien.js [số lượt mỗi vùng, mặc định 100] [--json]
// Ghi:   cong-cu/ra/so-lieu.json
// Giả định (ghi rõ trong báo cáo): người chơi đi hết mọi phòng (M.walk không vội) — người vội: M.walk(map, true) bỏ phòng phụ;
// linh khí do kết liễu quái dính hệ lấy theo mô hình tools/can-bang/tinh.js mục 5 (~16 linh khí mỗi lượt vùng 1, chia đều theo số quái).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const GOC = path.join(__dirname, '..', '..', '..', '..', '..', 'game', 'js');
const N = +(process.argv.find((a) => /^\d+$/.test(a)) || 100);
const ctx = { window: {}, location: { search: '' }, console, Math };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(GOC, 'data.js'), 'utf8'), ctx);
const G = ctx.window.G;
// tiện ích y như js/engine.js (chép, không nạp engine.js vì cần DOM)
G.srand = function (seed) { let s = seed >>> 0 || 1; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
let rnd = G.srand(20261015);
G.rnd = () => rnd();
G.pick = (a) => a[Math.floor(G.rnd() * a.length)];
G.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
vm.runInContext(fs.readFileSync(path.join(GOC, 'mapgen.js'), 'utf8'), ctx);
const M = G.mapgen;

// ---- số quái mỗi phòng: chép đúng buildWaves của js/stage.js (chỉ đếm, không mọc quái) ----
function waves(type, r, i) {
  const B = G.ROOM_WAVES, late = i >= 3, out = [];
  const count = type === 'start' ? (i >= 2 ? B.start[1] : B.start[0]) : type === 'challenge' ? B.challenge : late ? B.late : B.early;
  const roles = ['rusher', 'swarm', 'archer', 'kami'];
  if (i >= 1 || r > 0) roles.push('shield', 'spiky');
  if (i >= 2 || r > 0) roles.push('nimble', 'bomber');
  const cost = { rusher: 1, swarm: 1.3, archer: 1, shield: 1.5, nimble: 1.2, kami: 0.9, bomber: 1.2, spiky: 1.2 };
  for (let k = 0; k < count; k++) {
    let pts = (3 + Math.min(1.5, i * 0.4) + r * 0.5) * (late ? B.ptsLate : B.pts);
    const list = [];
    if (type === 'elite' && k === count - 1) { list.push('elite'); pts -= 2.5; }
    for (let g = 0; g < 30 && pts > 0.9 && list.length < B.maxPerWave; g++) {
      const ro = G.pick(roles);
      if (cost[ro] > pts + 0.3 || ((ro === 'swarm' || ro === 'kami' || ro === 'bomber') && list.includes(ro))) continue;
      list.push(ro); pts -= cost[ro];
    }
    if (!list.length) list.push('rusher');
    out.push(list);
  }
  return out;
}
const MOB_ROOM = (t) => t === 'start' || t === 'fight' || t === 'elite' || t === 'challenge';
const LK_GIET = [16.4, 16.4, 16.4]; // linh khí kết liễu quái dính hệ mỗi lượt (tinh.js mục 5) — giữ như nhau 3 vùng (thận trọng)
const VAL = { gold: 1, ore: 12, lk: 4 };   // js/upgrade.js U.VAL (quy ra vàng)

function motLuot(r, i, voi) {
  const kind = M.pickKind(i, null, G.rnd), seed = 1 + Math.floor(G.rnd() * 999999);
  const map = M.make(kind, seed);
  const w = M.walk(map, !!voi);
  const order = w.order.concat([map.boss]);
  const types = order.map((id) => map.rooms[id].type);
  const side = map.rooms.find((x) => M.SIDE.includes(x.type)).type;
  // quái từng phòng theo thứ tự đi
  let mobs = 0; const mobAt = [];
  for (const t of types) { let n = 0; if (MOB_ROOM(t)) for (const wv of waves(t, r, i)) n += wv.filter((x) => x !== 'elite').length; mobAt.push(n); mobs += n; }
  const lkMoiQuai = LK_GIET[r] / Math.max(1, mobs);
  const ev = { kind, side, sideVisited: types.includes(side), chestVisited: types.includes('chest'), mobs, lk: 0, gold: 0, ore: 0, rnd: [], choice: [] };
  let mult = 1, lkCurse = 0;
  types.forEach((t, k) => {
    // linh khí giết quái thường + tinh anh (5) + trùm nhỏ (10) / trùm vùng (20) — nhân marksMult (G.addMarks ... * W.marksMult)
    let lkPhong = mobAt[k] * lkMoiQuai;
    if (t === 'elite') lkPhong += G.LINHKHI.elite;
    if (t === 'boss') lkPhong += i === 4 ? G.LINHKHI.boss : G.LINHKHI.mini;
    ev.lk += lkPhong * mult; if (mult > 1) lkCurse += lkPhong * (mult - 1);
    if (t === 'elite' && G.rnd() < G.DROP.elite) { const T = G.ROI_MOI.vk; ev.gold += T.vang[r]; ev.lk += T.lk[r]; ev.rnd.push('tinhAnhRoi'); }
    if (t === 'chest') {
      const lkN = G.ROI_MOI.ruong.lk[r], oreN = 5 + r * 3, el = G.pick(G.ELS);
      const gt = { lk: lkN * VAL.lk, ore: oreN * VAL.ore };
      ev.choice.push({ phong: 'chest', el, gt, chon: gt.ore >= gt.lk ? 'ore' : 'lk' });
      ev.ore += oreN; // người chơi tính toán chọn quặng (giá trị cao hơn); xem báo cáo
    }
    if (t === 'merchant') ev.choice.push({ phong: 'merchant', el: G.pick(G.ELS) });
    if (t === 'curse') { const c = G.pick(G.CURSES).id; ev.choice.push({ phong: 'curse', c }); mult = 2; ev.curseAt = k / (types.length - 1); }
    if (t === 'challenge') { ev.ore += 6; ev.gold += 80; ev.choice.push({ phong: 'challenge' }); }
    // quái thường rơi vàng 1,2% (tinh anh 12%)
    for (let q = 0; q < mobAt[k]; q++) if (G.rnd() < 0.012) { ev.gold += G.ROI_MOI.ao.vang[r]; ev.rnd.push('quaiRoiVang'); }
    if (t === 'elite' && G.rnd() < 0.12) { ev.gold += G.ROI_MOI.ao.vang[r]; ev.rnd.push('tinhAnhRoiVang'); }
  });
  ev.lkCurse = lkCurse;
  // qua ải (thắng): trùm nhỏ 50% thưởng, 15% quặng thêm, 35% trang phục cũ → vàng
  if (i < 4) {
    if (G.rnd() < G.DROP.stage) { ev.gold += G.ROI_MOI.vk.vang[r]; ev.lk += G.ROI_MOI.vk.lk[r]; ev.rnd.push('quaAiThuong'); }
    if (G.rnd() < 0.15) { ev.ore += G.DA_TOI_QUANG; ev.rnd.push('quangThem'); }
    if (G.rnd() < 0.35) { ev.gold += G.ROI_MOI.aoTrum.vang[r]; ev.rnd.push('trumNhoRoiVang'); }
  }
  return ev;
}

const out = { N, vung: [] };
for (let r = 0; r < 3; r++) {
  const runs = [], runsVoi = [];
  for (let k = 0; k < N; k++) { const i = k % 5; runs.push(motLuot(r, i, false)); runsVoi.push(motLuot(r, i, true)); }
  const dem = (arr, f) => arr.reduce((a, x) => { const k = f(x); a[k] = (a[k] || 0) + 1; return a; }, {});
  const tb = (arr, f) => +(arr.reduce((a, x) => a + f(x), 0) / arr.length).toFixed(2);
  // "trải nghiệm" khác nhau của phần có thể thấy/ chọn: loại phòng phụ + nội dung (hệ bùa rương, hệ bùa thương nhân, lời nguyền)
  const sig = (e) => e.choice.map((c) => c.phong + ':' + (c.el || c.c || '')).sort().join(','); // người đi hết phòng
  const sigs = new Set(runs.map(sig));
  // lặp liền: lượt sau có cùng loại phòng phụ với lượt trước
  let lapLien = 0; for (let k = 1; k < runs.length; k++) if (runs[k].side === runs[k - 1].side) lapLien++;
  // chuỗi dài nhất không gặp từng loại phòng phụ
  const chuoi = {}; for (const s of M.SIDE) { let cur = 0, mx = 0; for (const e of runs) { cur = e.side === s ? 0 : cur + 1; mx = Math.max(mx, cur); } chuoi[s] = mx; }
  let giongLien = 0; for (let k = 1; k < runs.length; k++) if (sig(runs[k]) === sig(runs[k - 1])) giongLien++;
  const cur = runs.filter((e) => e.side === 'curse');
  const batNgo = (e) => e.rnd.length + (e.chestVisited ? 1 : 0) + (e.sideVisited ? 1 : 0);
  out.vung.push({
    vung: G.REGIONS[r].name,
    phongPhu: dem(runs, (e) => e.side),
    ruongLuaChonGiaTri: { lk: G.ROI_MOI.ruong.lk[r] * VAL.lk, ore: (5 + r * 3) * VAL.ore, ghiChu: 'quy ra vàng theo U.VAL; bùa hệ là thưởng tạm 60 giây' },
    traiNghiemKhacNhau: sigs.size, traiNghiemToiDa: 3 * (3 + 3 + 1), // rương 3 hệ × (thương nhân 3 hệ | nguyền 3 | thử thách 1)
    giongHetLuotTruoc: +(giongLien / (runs.length - 1)).toFixed(2), lapLienPhongPhu: +(lapLien / (runs.length - 1)).toFixed(2),
    chuoiDaiNhatKhongGap: chuoi,
    batNgoMoiLuot: tb(runs, batNgo), batNgoNguoiVoi: tb(runsVoi, batNgo),
    nguoiVoiBoPhongPhu: +(runsVoi.filter((e) => !e.sideVisited).length / N).toFixed(2), nguoiVoiBoRuong: +(runsVoi.filter((e) => !e.chestVisited).length / N).toFixed(2),
    roiNgauNhien: dem([].concat(...runs.map((e) => e.rnd)), (x) => x),
    nguyen: { soLuot: cur.length, viTriTB: tb(cur, (e) => e.curseAt), lkThemTB: tb(cur, (e) => e.lkCurse), lkThemMin: Math.min(...cur.map((e) => e.lkCurse)).toFixed(1), lkThemMax: Math.max(...cur.map((e) => e.lkCurse)).toFixed(1), lkCaLuotTB: tb(runs, (e) => e.lk) },
    quaiMoiLuot: tb(runs, (e) => e.mobs),
  });
}
fs.mkdirSync(path.join(__dirname, 'ra'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'ra', 'so-lieu.json'), JSON.stringify(out, null, 1));
if (process.argv.includes('--json')) console.log(JSON.stringify(out, null, 1));
else for (const v of out.vung) console.log(v.vung, JSON.stringify(v));
