#!/usr/bin/env node
// LUYỆN VŨ KHÍ — phiên 1 (luật, ví, chuyển bản lưu): kiểm không cần trình duyệt (docs/review/ke-hoach-cai-thien/luyen-vu-khi/THIET-KE.md mục 5.2 bước 5).
// Chạy ba bản game trong Node qua tests/node_trang.js (DOM / canvas giả, ?cloud=0): bản thường (Luyện bật), ?luyen=0 (luật cũ), ?tutbac=1.
//   0. Nạp: G.luyen, bảng 15 cấp, cờ; ?luyen=0 về ải ngày / ép đồ cũ; bỏ tụt bậc cho cả luật cũ (?tutbac=1 bật lại).
//   1. Chuyển bản lưu cũ: 16 trường hợp (mục 4 / mục D của ket-qua-mo-hinh.txt) → đúng cấp Luyện và phần hoàn của mô hình;
//      Sức mạnh mới không tụt quá 7% so với Sức mạnh luật cũ của CÙNG bản lưu (tính bằng G.power ở bản ?luyen=0); lò rèn hoàn đủ;
//      ví cũ → NLR; khoá sao lưu linhkhi_save_v1_truoc_luyen (giữ bản đầu); chuyển một lần (nạp lại không hoàn lần hai).
//      Thêm: bản dòng ép mạnh (Rực lửa 4 dòng tốt) vẫn không tụt quá 7% (nâng thêm món khác).
//   2. Bản lưu rỗng (null, {}, sai phiên bản) và bản hỏng (trường sai kiểu, số âm, cấp Luyện lạ) → không lỗi, số hợp lệ.
//   3. Đường lui: bản đã chuyển nạp ở ?luyen=0 → đúng bản cũ (hệ, dấu ấn, mài, bậc, quặng, đá, bùa, lò, Sức mạnh); bật lại → đúng bản Luyện.
//   4. Luật: giá đúng bảng, luôn thành công, giới hạn theo trùm, chọn hệ ở cấp 3, mảnh trùm ở cấp 6, dòng Viên mãn, mảnh lần đầu 5.
//   5. Ví: quặng / đá / bùa / Ải Rèn / Bà Hàng Xén / trùm → NLR; ?luyen=0 vẫn vào quặng / đá như cũ.
//   6. Sức mạnh (G.power, Lực chiến nếu có) theo cấp Luyện; thành tựu theo cấp Luyện.
//   7. Lưu / mây: trường mới qua G.fixSave + JSON nguyên vẹn (đường nạp mây cũng là G.fixSave).
//   8. Giao diện tối thiểu: Ông Thợ Rèn thẻ Luyện, Hành trang, HUD, màn kết quả, tiếng Anh — vẽ không lỗi, bấm Luyện được.
//   9. Bot: G.upg.auto luyện (không mài / ép), không tiêu âm.
// Chạy: node game/tests/luyen.test.js
'use strict';
const path = require('path'), { spawn } = require('child_process');
const TRANG = path.join(__dirname, 'node_trang.js');

function moTrang(q) {
  const env = Object.assign({}, process.env);
  if (q) env.LK_Q = q; else delete env.LK_Q;
  const p = spawn(process.execPath, [TRANG], { env, stdio: ['pipe', 'pipe', 'pipe'] });
  let buf = '', loi = '';
  const cho = [];
  p.stdout.on('data', (d) => {
    buf += d;
    let i;
    while ((i = buf.indexOf('\n')) >= 0) { const l = buf.slice(0, i); buf = buf.slice(i + 1); const f = cho.shift(); if (f) f(l); }
  });
  p.stderr.on('data', (d) => { loi += d; });
  const goi = (code, arg) => new Promise((res, rej) => {
    cho.push((l) => { const o = JSON.parse(l); if (o.ok) res(o.v); else rej(new Error(o.loi)); });
    p.stdin.write(JSON.stringify({ code: typeof code === 'function' ? '(' + code.toString() + ')' : code, arg }) + '\n');
  });
  return { goi, dong: () => p.kill(), loi: () => loi };
}

let soDat = 0;
function dat(ok, m) { if (!ok) throw new Error('SAI: ' + m); soDat++; console.log('  ✓ ' + m); }

// [cấp hệ, mài, bậc ép] → [cấp Luyện, hoàn vàng, hoàn LK, hoàn NLR] (ket-qua-mo-hinh.txt mục D)
const CA = [
  [[0, 0, 0], [1, 0, 0, 0]], [[0, 3, 1], [3, 150, 0, 3]], [[1, 2, 1], [3, 0, 10, 0]], [[1, 5, 1], [5, 0, 0, 0]],
  [[1, 6, 2], [6, 21, 0, 0]], [[2, 3, 1], [6, 0, 60, 0]], [[2, 6, 3], [8, 0, 0, 0]], [[2, 9, 3], [9, 0, 0, 0]],
  [[2, 10, 4], [11, 0, 0, 0]], [[2, 12, 4], [11, 310, 0, 0]], [[3, 10, 4], [12, 0, 170, 0]], [[3, 15, 4], [14, 0, 0, 0]],
  [[3, 15, 5], [15, 0, 0, 0]], [[3, 15, 6], [15, 5447, 0, 257]], [[3, 0, 0], [6, 0, 860, 0]], [[0, 15, 6], [12, 10047, 0, 492]],
];

(async () => {
  const A = moTrang(''), B = moTrang('luyen=0'), C = moTrang('tutbac=1&luyen=0');
  try {
    console.log('0. Nạp game');
    const n0 = await A.goi(() => ({ co: !!G.luyen, bat: G.luyen.bat(), n: G.LUYEN.cap.length - 1, tran: G.LUYEN.tran.join(','), thu: G.AI_NGAY.thuTu.join(','), tut: G.EP_DO.tutTu,
      M: G.LUYEN.cap.slice(1).map((c) => c.M).join(','), tong: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].reduce((a, L) => { const c = G.luyen.gia(L); if (c) { a.v += c.v; a.lk += c.lk; a.r += c.r; } return a; }, { v: 0, lk: 0, r: 0 }) }));
    dat(n0.co && n0.bat && n0.n === 15 && n0.tran === '5,9,12,13,15', 'G.luyen có, cờ bật mặc định, 15 cấp, giới hạn theo trùm 5/9/12/13/15 (phiên 1: trần trước Hồ Tinh 12)');
    dat(n0.M === '1,1.15,1.35,1.55,1.75,2.05,2.35,2.65,3,3.35,3.7,4.5,4.9,5.3,5.7', 'M theo bảng thiết kế (trần ×5,7 — Q1-A)');
    dat(n0.tong.v === 11400 && n0.tong.lk === 1450 && n0.tong.r === 598, 'cộng giá 1→15: 11.400 vàng, 1.450 linh khí, 598 NLR');
    dat(n0.thu === 'ren,vang' && n0.tut === 99, 'ải ngày: Ải Rèn + Ải Vàng; không tụt bậc');
    const n1 = await B.goi(() => ({ bat: G.luyen.bat(), thu: G.AI_NGAY.thuTu.join(','), tut: G.EP_DO.tutTu, bua: G.EP_DO.bua.trumVung, buaAi: G.AI_NGAY.ai.da.thuong.bua.join(',') }));
    dat(!n1.bat && n1.thu === 'da,mai,vang', '?luyen=0: luật cũ (Ải Đá Bậc, Ải Đá Mài, Ải Vàng)');
    dat(n1.tut === 99 && n1.bua === 0 && n1.buaAi === '0,0,0', '?luyen=0 vẫn bỏ tụt bậc, ẩn bùa (không rơi ở trùm / Ải Đá Bậc)');
    const n2 = await C.goi(() => ({ tut: G.EP_DO.tutTu, bua: G.EP_DO.bua.trumVung }));
    dat(n2.tut === 4 && n2.bua === 0.1, '?tutbac=1: bật lại tụt bậc từ Vàng, bùa rơi 10% ở trùm vùng');

    // ---------- 1. chuyển bản lưu cũ ----------
    console.log('1. Chuyển bản lưu cũ (16 trường hợp)');
    // dựng bản lưu cũ ở trang ?luyen=0 (đúng như người chơi đang có), ghi raw JSON
    const dung = async (st, sh, b, o) => B.goi((a) => {
      const [st, sh, b, o] = a;
      G.resetSave(); const s = G.save;
      s.heroes.smith.lvl = o.lvl || 20; s.tut.done = true;
      for (let k = 0; k < (o.trum || 0); k++) s.stars[k + '-4'] = 3;
      s.stars['0-0'] = 3;
      s.forge = o.lo || 1; s.ore = o.ore || 0; s.daBac = o.da || 0; s.buaBac = o.bua || 0; s.gold = 1000; s.linhKhi = 50; s.mats = [5, 5, 5];
      const w = s.weapons.find((x) => x.type === 'sword');
      G.vkMoi.datCap(w, st, st ? 'fire' : null); w.sharpen = sh;
      const D = o.dong || ['linhKhi', 'giamST', 'hoiChieu', 'stHe'];
      if (b) w.ep = { b, d: D.slice(0, Math.max(0, b - 2)).map((m) => ({ m, q: o.q || 1 })), may: {} };
      delete s.luyenChuyen; delete s.nlr; for (const x of s.weapons) delete x.luyen;
      G.save = G.fixSave(JSON.parse(JSON.stringify(s)));
      return { raw: JSON.stringify(G.save), p: G.power() };
    }, [st, sh, b, o || {}]);
    const chuyen = (raw) => A.goi((raw) => {
      try { window.localStorage.removeItem(G.luyen.KHOA_TRUOC); } catch (e) { /* */ }
      const s = G.fixSave(JSON.parse(raw)); G.save = s;
      const w = s.weapons.find((x) => x.type === 'sword'), bw = s.weapons.find((x) => x.type === 'bow');
      const bao = s.luyenBao ? JSON.parse(JSON.stringify(s.luyenBao)) : null;
      return { L: G.luyen.cap(w), Lb: G.luyen.cap(bw), st: G.wStage(w), he: w.branch, cho: G.luyen.choChonHe(w), c: s.luyenChuyen, nlr: s.nlr, gold: s.gold, lk: s.linhKhi, mats: s.mats.slice(),
        bao, p: G.power(), sh: w.sharpen, ep: w.ep ? w.ep.b : 0, ore: s.ore, da: s.daBac, bua: s.buaBac, lo: s.forge, hc: w.hcCu, saoLuu: window.localStorage.getItem(G.luyen.KHOA_TRUOC) };
    }, raw);
    let tut = [];
    for (const [k, [[st, sh, b], [L, v, lk, r]]] of CA.entries()) {
      const cu = await dung(st, sh, b);
      const m = await chuyen(cu.raw);
      const ten = ['Trắng', 'Mầm', 'Thành hình', 'Thức tỉnh'][st] + ' +' + sh + ' ' + ['Trắng', 'Xanh lam', 'Xanh lục', 'Tím', 'Vàng', 'Đỏ', 'Rực lửa'][b];
      const h = m.bao || { vang: 0, lk: 0, nlr: 0 };
      const lech = m.p / cu.p - 1;
      tut.push(lech);
      dat(m.c === 1 && m.L === L && m.Lb === 1 && Math.abs(h.vang - v) <= 1 && Math.abs(h.lk - lk) <= 1 && Math.abs(h.nlr - r) <= 1 && lech >= -0.07,
        (k + 1) + '. ' + ten + ' → Luyện ' + m.L + ' (mô hình ' + L + '), hoàn ' + Math.round(h.vang) + '/' + Math.round(h.lk) + '/' + Math.round(h.nlr) + ' (mô hình ' + v + '/' + lk + '/' + r + '), Sức mạnh ' + cu.p + ' → ' + m.p + ' (' + (lech * 100).toFixed(1) + '%)');
      const ht = m.L >= 12 ? 3 : m.L >= 6 ? 2 : m.L >= 3 ? 1 : 0;
      dat(st ? m.st === ht && m.he === 'fire' : (m.L >= 3 ? m.cho && m.st === 0 : m.st === 0), '   hình thái theo cấp Luyện' + (st ? ' (' + ['Trắng', 'Mầm', 'Thành hình', 'Thức tỉnh'][m.st] + ', giữ hệ Lửa)' : m.L >= 3 ? ' (Trắng lên ≥ 3: chờ chọn hệ miễn phí)' : '') + '; trường cũ giữ nguyên (mài +' + m.sh + ', bậc ' + m.ep + ')');
      if (k === CA.length - 1) dat(m.sh === sh && m.ep === b && m.hc && m.saoLuu === cu.raw, '   bản gốc chép sang khoá linhkhi_save_v1_truoc_luyen, hình thái cũ cất ở w.hcCu');
    }
    dat(Math.min(...tut) >= -0.07, 'không ai tụt Sức mạnh quá 7% (thấp nhất ' + (Math.min(...tut) * 100).toFixed(1) + '%, cao nhất +' + (Math.max(...tut) * 100).toFixed(1) + '%)');
    // dòng ép mạnh: Rực lửa với 4 dòng tốt nhất (q 1,2)
    const manh = await dung(3, 15, 6, { dong: ['chiMang', 'trum', 'tocDanh', 'stChiMang'], q: 1.2, lvl: 35, trum: 3 });
    const mm = await chuyen(manh.raw);
    dat(mm.p >= manh.p * 0.93 && mm.L === 15, 'Rực lửa 4 dòng tốt nhất (q 1,2): Sức mạnh ' + manh.p + ' → ' + mm.p + ' (' + ((mm.p / manh.p - 1) * 100).toFixed(1) + '%, ≥ −7%): kiếm Luyện 15, phi tiêu Luyện ' + mm.Lb);
    // lò rèn + ví cũ
    const lo = await dung(2, 9, 3, { lo: 4, ore: 50, da: 10, bua: 1 });
    const ml = await chuyen(lo.raw);
    dat(ml.bao && ml.bao.lo === 4 && ml.bao.vang === 2300 && ml.bao.nl.join(',') === '6,6,10' && ml.nlr === 50 + 20 + 6 + 20, 'lò cấp 4 hoàn 2.300 vàng, 20 NLR, 6/6/10 nguyên liệu vùng; ví cũ 50 quặng + 10 đá + 1 bùa → 76 NLR (tổng ' + ml.nlr + ')');
    dat(ml.gold === 1000 + 2300 && ml.mats.join(',') === '11,11,15' && ml.ore === 50 && ml.da === 10 && ml.bua === 1 && ml.lo === 4, 'cộng vàng, nguyên liệu vùng; trường cũ (quặng, đá, bùa, lò) giữ nguyên cho đường lui');
    const lai = await A.goi(() => { const a = JSON.stringify(G.save), s = G.fixSave(JSON.parse(a)); return { nlr: s.nlr, gold: s.gold, L: s.weapons.map((w) => w.luyen).join(','), bao: JSON.stringify(s.luyenBao) === JSON.stringify(G.save.luyenBao), giong: JSON.stringify(s) === a }; });
    dat(lai.nlr === ml.nlr && lai.gold === ml.gold && lai.bao && lai.giong, 'nạp lại bản đã chuyển: không chuyển / hoàn lần hai');
    const bao = await A.goi(() => { const s = G.luyen.bao({ luyenBao: { vk: [['sword', 9]], vang: 2300, lk: 0, nlr: 96, nl: [6, 6, 10], lo: 4, vi: 76 } }); return s; });
    dat(/Luyện vũ khí/.test(bao) && /2300 vàng/.test(bao) && /96 nguyên liệu rèn/.test(bao) && /Lv 9/.test(bao), 'câu báo một lần ở làng: ' + bao);
    // khoá sao lưu: giữ bản đầu tiên
    const sl = await A.goi((raw) => { window.localStorage.setItem(G.luyen.KHOA_TRUOC, 'ban-dau'); G.fixSave(JSON.parse(raw)); return window.localStorage.getItem(G.luyen.KHOA_TRUOC); }, lo.raw);
    dat(sl === 'ban-dau', 'khoá sao lưu đã có thì không ghi đè');

    // ---------- 2. bản lưu rỗng / hỏng ----------
    console.log('2. Bản lưu rỗng và bản hỏng');
    const rong = await A.goi(() => {
      const r = [];
      for (const s of [null, undefined, {}, { v: 2 }, [], 'abc']) { const f = G.fixSave(s); r.push(f.luyenChuyen === 1 && f.nlr === 0 && f.weapons.length === 4 && f.weapons.every((w) => G.luyen.cap(w) === 1)); }
      return r;
    });
    dat(rong.every(Boolean), 'bản rỗng (null, undefined, {}, sai phiên bản, mảng, chuỗi) → bản mới theo luật Luyện: 4 vũ khí Luyện 1, NLR 0');
    const hong = await A.goi(() => {
      G.resetSave(); const s = JSON.parse(JSON.stringify(G.save));
      delete s.luyenChuyen; s.ore = 'abc'; s.daBac = -5; s.buaBac = null; s.forge = 99; s.nlr = 'x';
      s.weapons[0].ep = 'hỏng'; s.weapons[0].sharpen = 'n'; s.weapons[0].marks = null; s.weapons[1].luyen = undefined; delete s.weapons[1].luyen;
      s.weapons[2].hcCu = 7; s.weapons[3].dongVM = 'lạ';
      let f, loi = null;
      try { f = G.fixSave(s); } catch (e) { loi = String(e); }
      const t = JSON.parse(JSON.stringify(G.save)); delete t.luyenChuyen; t.weapons[0].luyen = 99; t.weapons[1].luyen = 'abc'; t.weapons[2].luyen = -3; t.luyenChuyen = 1; t.nlr = -7;
      const g = G.fixSave(t);
      return { loi, ok: !!f && f.luyenChuyen === 1 && isFinite(f.nlr) && f.nlr >= 0 && f.weapons.every((w) => G.luyen.cap(w) >= 1),
        L: g.weapons.map((w) => w.luyen).join(','), nlr: g.nlr, p: (() => { G.save = g; return G.power(); })() };
    });
    dat(!hong.loi && hong.ok, 'bản hỏng (quặng chữ, đá âm, bậc ép hỏng, mài chữ, dấu ấn null…) chuyển không lỗi, số hợp lệ' + (hong.loi ? ': ' + hong.loi : ''));
    dat(hong.L === '15,1,1,1' && hong.nlr === 0 && hong.p > 0, 'cấp Luyện lạ (99, chữ, âm) kẹp về 1..15, NLR âm về 0, Sức mạnh tính được (' + hong.p + ')');

    // ---------- 3. đường lui ?luyen=0 ----------
    console.log('3. Đường lui ?luyen=0');
    const cu = await dung(2, 9, 3, { lo: 3, ore: 40, da: 6 });
    const moi = await chuyen(cu.raw);
    const ve = await B.goi((raw) => { const s = G.fixSave(JSON.parse(raw)); G.save = s; const w = s.weapons.find((x) => x.type === 'sword'); return { raw: JSON.stringify(s), st: G.wStage(w), he: w.branch, sh: w.sharpen, ep: w.ep.b, ore: s.ore, da: s.daBac, lo: s.forge, p: G.power(), hm: !!w.hcMoi }; }, await A.goi(() => JSON.stringify(G.save)));
    dat(ve.st === 2 && ve.he === 'fire' && ve.sh === 9 && ve.ep === 3 && ve.ore === 40 && ve.da === 6 && ve.lo === 3, '?luyen=0 nạp bản đã chuyển: Thành hình Lửa +9 bậc Tím, 40 quặng, 6 đá, lò 3 như cũ');
    dat(ve.p === cu.p && ve.hm, 'Sức mạnh luật cũ y như trước khi chuyển (' + cu.p + ' = ' + ve.p + '); bộ hình thái của Luyện cất ở w.hcMoi');
    const lai2 = await A.goi((raw) => { const s = G.fixSave(JSON.parse(raw)); G.save = s; const w = s.weapons.find((x) => x.type === 'sword'); return { L: G.luyen.cap(w), st: G.wStage(w), p: G.power(), nlr: s.nlr, bao: !!s.luyenBao }; }, ve.raw);
    dat(lai2.L === moi.L && lai2.st === 2 && lai2.p === moi.p && lai2.nlr === moi.nlr, 'bật lại Luyện: đúng bản Luyện (Luyện ' + lai2.L + ', Sức mạnh ' + lai2.p + '), không chuyển lại');

    // ---------- 4. luật ----------
    console.log('4. Luật Luyện');
    const lu = await A.goi(() => {
      G.resetSave(); const s = G.save, L = G.luyen, w = s.weapons.find((x) => x.type === 'sword'), r = {};
      s.gold = 100000; s.linhKhi = 10000; s.nlr = 2000; s.mats = [200, 200, 200]; s.shards = s.shards.map(() => 0);
      const g0 = { v: s.gold, lk: s.linhKhi, r: s.nlr };
      r.l2 = L.nang(s, w) && w.luyen === 2 && s.gold === g0.v - 100 && s.linhKhi === g0.lk - 10 && s.nlr === g0.r - 5;
      r.he = L.duoc(s, w); r.he2 = !!L.nang(s, w); r.l3 = !!L.nang(s, w, 'ice') && w.luyen === 3 && w.branch === 'ice' && G.wStage(w) === 1 && s.mats[0] === 196;
      L.nang(s, w); L.nang(s, w); r.tran5 = w.luyen === 5 && L.duoc(s, w) === 'Cần hạ Mộc Tinh';
      s.stars['0-4'] = 3; r.manh = L.duoc(s, w); s.shards[0] = 1; r.l6 = !!L.nang(s, w) && w.luyen === 6 && G.wStage(w) === 2 && s.shards[0] === 0;
      let lan = 0; for (let k = 0; k < 50; k++) { if (L.nang(s, w)) lan++; }
      r.tran9 = w.luyen === 9 && lan === 3;
      s.stars['1-4'] = 3; s.shards = s.shards.map(() => 10);
      for (let k = 0; k < 50; k++) L.nang(s, w);
      r.tran12 = w.luyen === 12 && G.wStage(w) === 3 && L.duoc(s, w) === 'Cần hạ Hồ Tinh';
      s.stars['2-4'] = 3; const m2 = s.shards[2]; for (let k = 0; k < 50; k++) L.nang(s, w);
      r.tran13 = w.luyen === 13 && s.shards[2] === m2 - 1;
      if (s.shards.length > 3) { s.stars['3-4'] = 3; for (let k = 0; k < 5; k++) L.nang(s, w); }
      r.vm = s.shards.length > 3 ? w.luyen === 15 && w.dongVM === 'chiMang' && G.epDo.dong(w, 'chiMang') === 0.08 && L.datDong(w, 'trum') && G.epDo.dong(w, 'trum') === 0.16 && G.epDo.dong(w, 'chiMang') === 0 : 'không có vùng 4';
      r.phu = [G.epDo.phu(w), G.epDo.satThuong(w), G.epDo.bac(w)];
      // không có tỉ lệ hỏng: 200 lần trên bản mới, lần nào đủ đồ cũng lên
      let hong = 0; for (let k = 0; k < 200; k++) { const t = JSON.parse(JSON.stringify(s)); const x = t.weapons.find((q) => q.type === 'bow'); t.gold = 1e6; t.linhKhi = 1e5; t.nlr = 1e5; if (!L.nang(t, x)) hong++; }
      r.hong = hong;
      return r;
    });
    dat(lu.l2, 'Luyện 1 → 2: trừ đúng 100 vàng, 10 linh khí, 5 NLR');
    dat(lu.he === 'Chọn hệ' && !lu.he2 && lu.l3, 'lên 3 (Mầm) phải chọn hệ; chọn Băng → Mầm Băng, trừ 4 Gỗ linh');
    dat(lu.tran5 && lu.manh === 'Thiếu mảnh Mộc Tinh' && lu.l6, 'chưa hạ Mộc Tinh: tối đa cấp 5 ("Cần hạ Mộc Tinh"); cấp 6 cần 1 mảnh Mộc Tinh, lên Thành hình');
    dat(lu.tran9 && lu.tran12 && lu.tran13, 'giới hạn theo trùm: 9 sau Mộc Tinh, 12 sau Ngư Tinh (cấp 12 lên Thức tỉnh), 13 sau Hồ Tinh (cấp 13 cần 1 mảnh Hồ Tinh)');
    dat(lu.vm === true || lu.vm === 'không có vùng 4', 'cấp 15: dòng Viên mãn mặc định Chí mạng +8%, đổi miễn phí (Trùm +16%) — ' + lu.vm);
    dat(lu.phu[0] === 0.1 && lu.phu[1] === 1 && lu.phu[2] >= 4, 'từ cấp 9 kiếm +10% tốc đánh (E.phu), ép đồ không nhân sát thương nữa, khung ô theo cấp Luyện (bậc ' + lu.phu[2] + ')');
    dat(lu.hong === 0, 'không có tỉ lệ thất bại: 200/200 lần đủ đồ đều lên cấp');
    const md = await A.goi(() => {
      G.testSave({ lvl: 12, luyen: 5 }); const s = G.save; s.stars['0-0'] = 3; s.stars['0-1'] = 3; s.stars['0-2'] = 3; s.stars['0-3'] = 3;
      const n0 = s.shards[0];
      G.botBatTu = true; G.startStage(0, 4, 0); const out = G.probeRun(900); const n1 = s.shards[0];
      G.startStage(0, 4, 0); const out2 = G.probeRun(900);
      return { win: out.win, win2: out2.win, dau: n1 - n0, lai: s.shards[0] - n1 };
    });
    dat(md.win && md.dau === 5 && (!md.win2 || md.lai === 3), 'hạ Mộc Tinh lần đầu +5 mảnh (thưởng bảo đảm), đánh lại +3' + (md.win2 ? '' : ' (lần hai bot thua: chỉ kiểm lần đầu)'));

    // ---------- 5. ví ----------
    console.log('5. Ví: nguyên liệu rèn');
    const vi = await A.goi(() => {
      G.resetSave(); const s = G.save, r = {};
      G.themQuang(s, 6); r.q = s.nlr; G.epDo.themDa(s, 3); r.d = s.nlr; G.epDo.themBua(s, 1); r.b = s.nlr;
      r.cu = [s.ore, s.daBac, s.buaBac];
      const t = G.epDo.thuongTrum(s, 1, true, true, 0); r.trum = [s.nlr - r.b, t.map((x) => x[0]).join('|')];
      s.gold = 1000; const truoc = s.nlr; G.upg.bqMua(s, 2); r.bq = [s.nlr - truoc, s.gold];
      // Ải Rèn: thắng một lượt mức Dễ
      s.stars['0-4'] = 3; const R = { lines: [] }; const n0 = s.nlr;
      G.aiNgay.homNay = () => ({ key: '2026-01-05', thu: 1, d: new Date(2026, 0, 5) });
      G.aiNgay.thuong({ aiNgay: { loai: 'ren', muc: 0 } }, R, true, (a, b) => G.t(a, b)); r.ren = [s.nlr - n0, R.lines.join(' | ')];
      // thưởng ải thường (stage.js) — bot đánh 1-2
      G.testSave({ lvl: 10, luyen: 4 }); const s2 = G.save; s2.stars['0-0'] = 3; const n2 = s2.nlr | 0, o2 = s2.ore;
      G.startStage(0, 1, 0); const out = G.probeRun(600); const R2 = G.getRun().result;
      r.ai = [out.win, (s2.nlr | 0) - n2, s2.ore - o2, (R2 && R2.lines || []).map((l) => l.s || l).filter((x) => /rèn|quặng/.test(x)).join(' | ')];
      return r;
    });
    dat(vi.q === 6 && vi.d === 12 && vi.b === 18 && vi.cu.join(',') === '0,0,0', 'quặng 1:1, đá 1:2, bùa 1:6 vào NLR; quặng / đá / bùa cũ không tăng');
    dat(vi.trum[0] >= 16 && /nguyên liệu rèn/.test(vi.trum[1]), 'trùm vùng Hang biển lần đầu: 8 đá → ' + vi.trum[0] + ' NLR ("' + vi.trum[1] + '")');
    dat(vi.bq[0] === 2 && vi.bq[1] === 1000 - 2 * 40, 'Bà Hàng Xén bán NLR 40 vàng / cái');
    dat(vi.ren[0] === 14 && /nguyên liệu rèn/.test(vi.ren[1]), 'Ải Rèn mức Dễ: +14 NLR (' + vi.ren[1] + ')');
    dat(vi.ai[0] && vi.ai[1] > 0 && vi.ai[2] === 0 && /nguyên liệu rèn/.test(vi.ai[3]), 'thắng ải 1-2: +' + vi.ai[1] + ' NLR, quặng không đổi (' + vi.ai[3] + ')');
    const viCu = await B.goi(() => { G.resetSave(); const s = G.save; G.themQuang(s, 6); G.epDo.themDa(s, 3); return [s.ore, s.daBac, s.nlr | 0, G.chuQuang()]; });
    dat(viCu.join(',') === '6,3,0,+{0} quặng', '?luyen=0: quặng, đá vào ví cũ như trước');

    // ---------- 6. Sức mạnh, thành tựu ----------
    console.log('6. Sức mạnh, thành tựu');
    const sm = await A.goi(() => {
      G.resetSave(); const s = G.save, w = s.weapons.find((x) => x.type === 'sword');
      const d1 = G.wBase(w, 1); w.luyen = 9; const d9 = G.wBase(w, 1); w.luyen = 15; const d15 = G.wBase(w, 1);
      const ps = []; for (const L of [1, 3, 6, 9, 12, 15]) { w.luyen = L; for (const x of s.weapons) if (x.type === 'bow') x.luyen = L; ps.push(G.power()); }
      w.sharpen = 15; w.ep = { b: 6, d: [], may: {} }; const pMai = G.power();
      const lc = G.lucChien ? (() => { try { return G.lucChien(s); } catch (e) { return 'loi ' + e; } })() : null;
      w.sharpen = 0; delete w.ep; const lc0 = G.lucChien ? G.lucChien(s) : null;
      // thành tựu
      G.resetSave(); const t = G.save, TT = G.thanhTuu, ma = ['mam', 'epTim', 'thucTinh1', 'epDo', 'mai10'];
      const truoc = ma.map((m) => TT.tienDo(m, t)[0]);
      for (const x of t.weapons) x.luyen = 15;
      const sau = ma.map((m) => TT.tienDo(m, t).join('/'));
      const ten = G.THANH_TUU.DS.filter((a) => ma.includes(a.ma)).map((a) => a.ten).join(', ');
      // tư vấn 2 (js/luc_chien.js): một số "Sức mạnh" + dòng "đổi gì" sau nâng cấp đọc G.power / G.pDamage → phải theo cấp Luyện
      const LC = G.lucChienUI; let doi = null, gop = null;
      if (LC && LC.chup && LC.doiGi) {
        G.resetSave(); const u = G.save, k = u.weapons.find((x) => x.type === 'sword'); u.gold = 1000; u.linhKhi = 100; u.nlr = 50;
        const a0 = LC.chup(u), p0 = LC.giaTri ? LC.giaTri(u) : G.power(); G.luyen.nang(u, k); const a1 = LC.chup(u), p1 = LC.giaTri ? LC.giaTri(u) : G.power();
        doi = LC.doiGi(a0, a1); gop = [p0, p1, LC.gop ? LC.gop() : null];
      }
      return { r9: d9 / d1, r15: d15 / d1, ps, pMai, lc, lc0, truoc, sau, ten, doi, gop };
    });
    dat(Math.abs(sm.r9 - 3 / 1.06) < 1e-9 && Math.abs(sm.r15 - 5.7 / 1.06) < 1e-9, 'sát thương vũ khí = M của cấp Luyện (cấp 9: ×' + sm.r9.toFixed(3) + ', cấp 15: ×' + sm.r15.toFixed(3) + '; phần phụ ~6% tách ra từ cấp 9)');
    dat(sm.ps.every((p, i) => !i || p > sm.ps[i - 1]), 'Sức mạnh tăng theo cấp Luyện: ' + sm.ps.join(' < '));
    dat(sm.pMai === sm.ps[sm.ps.length - 1] && (sm.lc == null || sm.lc === sm.lc0), 'mài / bậc ép cũ không còn cộng Sức mạnh' + (sm.lc != null ? ' (cả Lực chiến: ' + sm.lc + ')' : ''));
    dat(sm.doi == null || (/Kiếm: đòn \+/.test(sm.doi) && sm.gop[1] > sm.gop[0]), 'số Sức mạnh gộp (tư vấn 2) và dòng "đổi gì" theo cấp Luyện: ' + (sm.gop ? sm.gop[0] + ' → ' + sm.gop[1] + ' · "' + sm.doi + '"' : 'không có js/luc_chien.js'));
    dat(sm.truoc.every((x) => x === 0) && sm.sau.join(' ') === '4/1 4/1 4/1 4/1 4/4', 'thành tựu theo cấp Luyện (' + sm.ten + '): ' + sm.sau.join(' '));

    // ---------- 7. lưu / mây ----------
    console.log('7. Lưu / mây');
    const luu = await A.goi(() => {
      G.testSave({ lvl: 30, luyen: 15 }); const s = G.save; s.nlr = 123; s.luyenChuyen = 1;
      const w = s.weapons[0]; G.luyen.datDong(w, 'hoiChieu');
      const a = JSON.stringify(s), f = G.fixSave(JSON.parse(a));
      return { L: f.weapons.map((x) => x.luyen).join(','), nlr: f.nlr, c: f.luyenChuyen, vm: f.weapons[0].dongVM, giong: JSON.stringify(f) === JSON.stringify(G.fixSave(JSON.parse(JSON.stringify(f)))) };
    });
    dat(luu.nlr === 123 && luu.c === 1 && luu.vm === 'hoiChieu' && /15/.test(luu.L) && luu.giong, 'w.luyen, w.dongVM, sv.nlr, sv.luyenChuyen qua G.fixSave + JSON nguyên vẹn (đường nạp máy và mây), nạp lại ra y hệt');

    // ---------- 8. giao diện tối thiểu ----------
    console.log('8. Giao diện tối thiểu');
    const gd = await A.goi(() => {
      const VA = G.villageApi, V = VA.V, r = {};
      G.noRender = false;
      const ve = () => { try { G.ui.begin && G.ui.begin(); G.Village.draw(); return true; } catch (e) { return String(e && e.stack || e); } };
      G.testSave({ lvl: 12, luyen: 2 }); const s = G.save; for (let k = 0; k < 4; k++) s.stars['0-' + k] = 3; s.gold = 5000; s.linhKhi = 500; s.nlr = 300; s.mats = [40, 40, 40];
      G.setScene(G.Village);
      VA.open('ren'); r.ve0 = ve(); r.tab = V.ftab;
      const w = s.weapons.find((x) => x.type === 'sword');
      G.luyen.ui.sel = w.id; r.ve1 = ve();
      // nút "Luyện · Lửa" (lên Mầm): cột phải x = 160 + 106, hàng nút dưới cùng
      const rx = 160 + 106, rw = 304 - 106, bw = Math.floor((rw - 14) / 3), y0 = 93 + 13, yb = y0 + (170 - 14) - 30;
      G.click = { x: rx + 6 + bw / 2, y: yb + 10 + 8 }; r.ve2 = ve(); r.L = G.luyen.cap(w); r.he = w.branch; r.msg = V.msg;
      G.click = { x: rx + rw - 82 + 38, y: yb + 10 + 8 }; r.ve3 = ve(); r.L2 = G.luyen.cap(w);
      V.tab = 'bag'; if (G.hanhTrang && G.hanhTrang.reset) G.hanhTrang.reset(); r.ve4 = ve();
      s.luyenBao = { vk: [['sword', 4]], vang: 10, lk: 0, nlr: 3, nl: [0, 0, 0], lo: 0, vi: 0 }; VA.goHub(); G.villageScene.update(0.1, false); r.bao = !s.luyenBao;
      G.ngonNgu.dat('en', false); VA.open('ren'); r.ve5 = ve(); V.tab = 'bag'; r.ve6 = ve(); G.ngonNgu.dat('vi', false);
      r.thieu = [...G.ngonNgu.thieu].filter((x) => /Luyện|luyện|nguyên liệu rèn|NLR|Viên mãn|Tinh luyện|Ải Rèn|Cần hạ/.test(x));
      // HUD + màn kết quả trong ải
      G.startStage(0, 0, 0); let hud = true; try { G.ui.begin(); G.StageScene.draw(); } catch (e) { hud = String(e && e.stack || e); }
      r.hud = hud; const out = G.probeRun(600); let kq = true; try { G.ui.begin(); G.StageScene.draw(); } catch (e) { kq = String(e && e.stack || e); }
      r.kq = kq && out.win !== undefined ? kq : kq;
      VA.goHub(); G.noRender = true;
      return r;
    });
    dat(gd.ve0 === true && gd.tab === 'luyen' && gd.ve1 === true, 'Ông Thợ Rèn: một thẻ Luyện, vẽ không lỗi' + (gd.ve0 !== true ? ': ' + gd.ve0 : ''));
    dat(gd.ve2 === true && gd.L === 3 && gd.he === 'fire' && /Lv 2 → 3/.test(gd.msg || ''), 'bấm "Luyện · Lửa": Luyện 3 hệ Lửa, báo "' + gd.msg + '"');
    dat(gd.ve3 === true && gd.L2 === 4, 'bấm "Luyện lên 4": Luyện 4');
    dat(gd.ve4 === true && gd.bao, 'Hành trang (bảng Luyện) vẽ không lỗi; câu báo chuyển bản lưu hiện một lần ở làng');
    dat(gd.ve5 === true && gd.ve6 === true && !gd.thieu.length, 'tiếng Anh vẽ được, không sót chữ Luyện chưa dịch (' + gd.thieu.join(' | ') + ')');
    dat(gd.hud === true && gd.kq === true, 'HUD trong ải và màn kết quả vẽ không lỗi' + (gd.hud !== true ? ': ' + gd.hud : gd.kq !== true ? ': ' + gd.kq : ''));

    // ---------- 9. bot ----------
    console.log('9. Bot nâng cấp');
    const bot = await A.goi(() => {
      G.resetSave(); const s = G.save; s.heroes.smith.lvl = 12; s.gold = 3000; s.linhKhi = 400; s.nlr = 80; s.ore = 99; s.mats = [30, 0, 0]; s.stars['0-0'] = 3;
      const p0 = G.power(), did = G.upg.auto(s), p1 = G.power();
      return { p0, p1, did, am: s.gold < 0 || s.nlr < 0 || s.linhKhi < 0 || s.mats.some((x) => x < 0), ore: s.ore, sh: s.weapons.map((w) => w.sharpen).join(','), L: s.weapons.map((w) => G.luyen.cap(w)).join(',') };
    });
    dat(bot.p1 > bot.p0 && !bot.am && bot.ore === 99 && bot.sh === '0,0,0,0' && bot.did.every((t) => !/Mài|lò|Nâng .* lên Mầm/.test(t)), 'G.upg.auto chỉ Luyện (không mài / lò / nâng hệ bằng linh khí), không tiêu âm: Sức mạnh ' + bot.p0 + ' → ' + bot.p1 + ', cấp ' + bot.L);

    const loi = await A.goi(() => (window.__loiNgam || []).filter((s) => /luyen|Luyện/.test(s)));
    dat(!loi.length, 'không có lỗi ngầm nào từ js/luyen.js' + (loi.length ? ': ' + loi.slice(0, 2).join(' | ') : ''));
    console.log('\nPASS — ' + soDat + ' điều kiện');
  } catch (e) {
    console.error(e.stack || e);
    console.error('--- stderr bản thường ---\n' + A.loi().slice(-3000));
    process.exitCode = 1;
  } finally { A.dong(); B.dong(); C.dong(); }
})();
