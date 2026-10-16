#!/usr/bin/env node
// BƯỚC 3 — VÙNG 4 SÔNG SÂU, PHIÊN 3C: Thuồng Luồng pha 2 (Băng), pha 3 (Lửa), cảnh bỏ trốn (js/thuong_luong.js khối "PHIÊN 3C").
// Không cần trình duyệt: ba bản game trong Node qua tests/node_trang.js (DOM / canvas giả, ?cloud=0).
//   1. Chọn chiêu theo pha (không còn chiêu Ngư Tinh tạm), pha 2 mở dải Dòng nước (đẩy em bé), hệ Băng / Lửa.
//   2. Từng chiêu mới: vùng đỏ báo trước đủ lâu để đi bộ ra (tốc nhân vật chậm nhất, Cu Lì 64,8 ngang / 48,6 dọc), đúng tác dụng:
//      Xoáy nước (mọc xa em bé, kéo nhẹ hơn tốc chạy, lõi là vũng Băng), Lặn – trồi đớp (gợn chậm hơn tốc chạy, vòng đỏ, đầu lộ trên đá),
//      Dòng nước đổi chiều (mũi tên đổi trước 1,5 giây, tảng băng quét dải), Mưa mảnh đồng (6 bóng, một ở chỗ em bé, vật cản 4 giây không kẹt),
//      Siết sân (dải mép trong, sân hẹp lại tối đa 2 lần, quét lại mỗi 6 giây, giữa sân an toàn), Đớp liên hoàn (3 vạch nhắm lại, đầu chồm tới).
//   3. Không đòn một phát chết ở Sức mạnh khuyên dùng (em bé đủ máu, đòn mạnh nhất mỗi pha).
//   4. Cảnh bỏ trốn: không nổ tung, nhả mảnh nhỏ + ngoạm mảnh mặt trời + lặn mất; thắng ải như cũ (cổng mở sau cảnh), nước rút, dải dòng tan.
//   5. Bot bất tử hạ Thuồng Luồng (thấy chiêu pha 2, 3), không NaN, em bé luôn trong bãi đá.
//   6. Vẽ mọi lúc (VI + EN) không lỗi; chữ mới có tiếng Anh.
//   7. Cờ ?tl3c=0 → bản 3B (chiêu tạm Ngư Tinh, không dải dòng, trùm nổ như cũ); không lỗi ngầm.
// Chạy: node game/tests/thuong_luong_3c.test.js
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

const CAI = () => {
  const H = (G.__tl = {});
  H.vao = function (o) {
    o = o || {};
    G.testSave({ lvl: 40, sharpen: 15, branch: o.branch || 'fire', marksMoi: 5000 });
    const s = G.save; for (let rr = 0; rr < 3; rr++) for (let ii = 0; ii < 5; ii++) s.stars[rr + '-' + ii] = 3;
    for (let ii = 0; ii < 4; ii++) s.stars['3-' + ii] = 1;
    G.rnd = G.srand(o.hat || 4545);
    G.startStage(3, 4, 0);
    G.testGoto('boss');
    const W = G.getWorld(), b = W.boss;
    W.P.x = (W.x0 + W.x1) / 2 - 40; W.P.y = (W.y0 + W.y1) / 2;
    for (let i = 0; i < 400 && b.invuln > 0; i++) G.sim(1);
    if (o.pha) { b.hp = b.maxhp * (o.pha === 1 ? 0.6 : 0.3); if (o.pha === 2) { b.hp = b.maxhp * 0.6; G.sim(2); for (let i = 0; i < 400 && b.invuln > 0; i++) G.sim(1); b.hp = b.maxhp * 0.3; } G.sim(2); for (let i = 0; i < 400 && b.invuln > 0; i++) G.sim(1); }
    b.ngConLai = 0;
    return W;
  };
  H.bat = function () { if (!H.h0) { H.h0 = G.hurtPlayer; G.hurtPlayer = function () { H.trung = (H.trung || 0) + 1; return false; }; } };
  H.tha = function () { if (H.h0) { G.hurtPlayer = H.h0; H.h0 = null; } };
  H.cho = function (n, P) { const W = G.getWorld(); for (let i = 0; i < n; i++) { if (P) { W.P.x = P[0]; W.P.y = P[1]; } G.sim(1); } };
  // Chờ trùm rảnh rồi ép ra chiêu k (em bé giữ ở P); trả về vùng mới của trùm.
  H.ra = function (k, P) {
    const W = G.getWorld(), b = W.boss;
    for (let i = 0; i < 900 && (b.busy > 0 || b.seq.length || (b.tl && (b.tl.troi || b.tl.raKhoi))); i++) { if (P) { W.P.x = P[0]; W.P.y = P[1]; } G.sim(1); }
    if (P) { W.P.x = P[0]; W.P.y = P[1]; }
    const truoc = new Set(W.zones);
    b.dbg = k; b.cd = 0; b.last = null; b.ngConLai = 0;
    const sk = G.bossSK[b.kind][k], ak = sk.anim || k;
    for (let i = 0; i < 60; i++) {
      if (P) { W.P.x = P[0]; W.P.y = P[1]; }
      G.sim(1);
      if (b.skillName === sk.name && b.an && (b.an.n === ak || b.busy > 0)) break;
    }
    return { zs: W.zones.filter((z) => !truoc.has(z) && z.src === b), b, W };
  };
  H.chay = function (n, inp) { for (let i = 0; i < n; i++) { G.updateWorld(1 / 60, Object.assign({ mx: 0, my: 0 }, inp || {})); G.time += 1 / 60; } }; // em bé đứng yên (không tự đánh / đi)
  H.vMin = () => 72 * Math.min(...G.HKEYS.map((k) => G.HEROES[k].speed));
  return 1;
};

(async () => {
  const A = moTrang(''), B = moTrang('tl3c=0'), D = moTrang('vung4=0');
  try {
    for (const T of [A, B]) await T.goi(CAI);

    // ---------- 1. chọn chiêu, dải dòng ----------
    console.log('1. Chọn chiêu theo pha, dải Dòng nước pha 2');
    const s1 = await A.goi(() => {
      const H = G.__tl; H.bat();
      const W = H.vao(), b = W.boss, out = {};
      W.P.x = W.x0 + 10; W.P.y = (W.y0 + W.y1) / 2;
      out.chon = [0, 1, 2].map((p) => G.bossSK.thuong.chon(b, p).join());
      out.dong0 = (W.song.dai || []).filter((d) => d.tlDong).length;
      b.hp = b.maxhp * 0.6; G.sim(2);
      for (let i = 0; i < 400 && b.invuln > 0; i++) G.sim(1);
      const d = (W.song.dai || []).find((q) => q.tlDong);
      out.el = b.el;
      out.dong = d ? { h: d.y1 - d.y0, x: [d.x0, d.x1], b: [W.x0, W.x1, W.y0, W.y1] } : null;
      if (d) { // đứng giữa dải: bị đẩy theo mũi tên; đứng ngoài dải: không
        b.cd = 99;
        const x0 = (W.x0 + W.x1) / 2 - 30, y = (d.y0 + d.y1) / 2; W.P.x = x0; W.P.y = y; H.chay(30);
        out.day = (W.P.x - x0) / 0.5 * d.huong;
        W.P.x = x0; W.P.y = d.y1 + 14; H.chay(30); out.ngoai = W.P.x - x0;
      }
      b.hp = b.maxhp * 0.3; G.sim(2);
      for (let i = 0; i < 400 && b.invuln > 0; i++) G.sim(1);
      out.el3 = b.el; out.dong3 = (W.song.dai || []).filter((q) => q.tlDong).length;
      out.sk = ['x2', 'l2', 'd2', 'm3', 's3', 'dl'].map((k) => G.bossSK.thuong[k].name);
      H.tha();
      return out;
    });
    dat(s1.chon[0] === 'c1,c2,c3' && s1.chon[1] === 'c1,c2,c3,x2,l2,d2' && s1.chon[2] === 'c1,c2,x2,l2,m3,s3,dl', 'chọn chiêu theo pha: ' + s1.chon.join(' | ') + ' (không còn chiêu Ngư Tinh tạm n1, n2, c4, c5)');
    dat(s1.sk.join() === 'Xoáy nước,Lặn – trồi đớp,Dòng nước đổi chiều,Mưa mảnh đồng,Siết sân,Đớp liên hoàn', 'tên chiêu: ' + s1.sk.join(', '));
    dat(s1.dong0 === 0 && s1.dong && s1.dong.h >= 30 && s1.el === 'ice' && s1.el3 === 'fire' && s1.dong3 === 1, 'pha 1 không có dải; pha 2 (Băng) mở một dải Dòng nước cao ' + (s1.dong && s1.dong.h) + ', còn ở pha 3 (Lửa)');
    dat(s1.day > 20 && s1.day < 35 && Math.abs(s1.ngoai) < 1, 'dải đẩy em bé ' + Math.round(s1.day) + ' điểm ảnh/giây theo mũi tên (≈ 43% tốc chạy chậm nhất), ngoài dải không trôi');

    // ---------- 2. chiêu pha 2 ----------
    console.log('2. Chiêu pha 2 (Băng)');
    const s2 = await A.goi(() => {
      const H = G.__tl; H.bat();
      const W = H.vao({ pha: 1 }), b = W.boss, out = { vMin: H.vMin() }, C = G.thuongLuong.CFG;
      // Xoáy nước
      const P0 = [W.x0 + 60, (W.y0 + W.y1) / 2];
      let r = H.ra('x2', P0);
      const bao = r.zs.filter((z) => z.skill === 'Xoáy nước' && z.t > 0);
      out.x2 = { so: bao.length, t: bao.length ? Math.min(...bao.map((z) => z.t)) : 0, xa: bao.length ? Math.min(...bao.map((z) => Math.hypot(z.x - P0[0], (z.y - P0[1]) / (G.ZK || 0.85)))) : 0 };
      for (let i = 0; i < 90 && b.tl.xoay.length < 2; i++) H.cho(1, P0);
      const xo = b.tl.xoay;
      out.x2.xoay = xo.length; out.x2.loi = xo[0] && xo[0].z ? { pool: !!xo[0].z.pool, el: xo[0].z.el } : null;
      // đứng yên cạnh xoáy: bị kéo vào; chạy ngược chiều kéo (tốc chậm nhất): thoát
      b.cd = 99;
      const o = xo[0]; o.vx = 0; o.vy = 0;
      W.P.x = o.x - 40; W.P.y = o.y; const d0 = Math.hypot(W.P.x - o.x, W.P.y - o.y);
      for (let i = 0; i < 30; i++) { b.cd = 99; H.chay(1); }
      out.x2.keo = (d0 - Math.hypot(W.P.x - o.x, W.P.y - o.y)) / 0.5;
      W.P.x = o.x - 40; W.P.y = o.y;
      for (let i = 0; i < 30; i++) { b.cd = 99; H.chay(1, { mx: -1 }); }
      out.x2.thoat = Math.hypot(W.P.x - o.x, W.P.y - o.y) > 40;
      for (let i = 0; i < 400 && b.tl.xoay.length; i++) { b.cd = 99; W.P.x = W.x0 + 10; G.sim(1); }
      out.x2.tan = b.tl.xoay.length === 0;
      b.cd = 0;
      // Lặn – trồi đớp: em bé đứng yên → gợn tới, vòng đỏ ngay chỗ em bé; đầu trồi lên đá lộ điểm yếu rồi lặn về mép phải
      const P1 = [W.x0 + 70, (W.y0 + W.y1) / 2];
      r = H.ra('l2', P1);
      let an = false, khong = true, vong = null, t = 0, gonV = 0, gx = null;
      for (let i = 0; i < 300 && !vong; i++) {
        H.cho(1, P1); t += 1 / 60;
        if (b.hidden) { an = true; if (G.targets().includes(b)) khong = false; if (gx && b.tl.troi && b.tl.troi.pha === 'duoi' && b.tl.troi.t > 0.05) gonV = Math.max(gonV, Math.hypot(b.x - gx[0], (b.y - gx[1])) * 60); gx = [b.x, b.y]; }
        vong = W.zones.find((z) => z.src === b && z.skill === 'Lặn – trồi đớp' && z.t > 0);
      }
      out.l2 = { an, khong, gonV, vong: vong ? { t: vong.t, r: vong.r, trung: G.inZone(vong, W.P) } : null };
      let lo = 0, xLo = 0;
      for (let i = 0; i < 200; i++) { H.cho(1, P1); if (!b.hidden && b.tl.troi) { lo = Math.max(lo, b.exposed); xLo = b.x; } if (!b.tl.troi && i > 60) break; }
      out.l2.lo = lo; out.l2.xLo = Math.round(xLo); out.l2.ve = [Math.round(b.x), W.x1, b.hidden, b.tl.raKhoi];
      // chạy thẳng ra xa gợn (tốc chậm nhất, chiều ngang): gợn không đuổi kịp
      r = H.ra('l2', [W.x0 + 150, (W.y0 + W.y1) / 2]);
      for (let i = 0; i < 40 && !b.hidden; i++) G.sim(1);
      let dmin = 1e9; const d1 = Math.hypot(W.P.x - b.x, W.P.y - b.y);
      for (let i = 0; i < 90 && b.tl.troi && b.tl.troi.pha === 'duoi'; i++) { W.P.x = Math.max(W.x0, W.P.x - out.vMin / 60); G.sim(1); dmin = Math.min(dmin, Math.hypot(W.P.x - b.x, W.P.y - b.y)); }
      out.l2.chay = [Math.round(d1), Math.round(dmin)];
      for (let i = 0; i < 400 && (b.tl.troi || b.busy > 0); i++) G.sim(1);
      // Dòng nước đổi chiều: tự đổi mỗi 10 giây (cảnh báo trước 1,5 giây); chiêu: vùng đỏ phủ dải, đổi chiều lúc nổ
      const Dg = b.tl.dong; Dg.doiT = 3; const h0 = Dg.d.huong; let canh = null; t = 0;
      for (let i = 0; i < 240 && Dg.d.huong === h0; i++) { b.cd = 99; W.P.x = W.x0 + 20; W.P.y = W.y0 + 10; G.sim(1); t += 1 / 60; if (Dg.canh && canh == null) canh = t; }
      out.d2 = { tu: +t.toFixed(2), canh: canh == null ? null : +(t - canh).toFixed(2), doi: Dg.d.huong !== h0 };
      b.cd = 0;
      const yd = (Dg.d.y0 + Dg.d.y1) / 2, P2 = [W.x0 + 90, yd];
      r = H.ra('d2', P2);
      const zr = r.zs.find((z) => z.skill === 'Dòng nước đổi chiều' && z.shape === 'rect');
      const h1 = Dg.d.huong;
      out.d2.z = zr ? { t: zr.t, phu: G.inZone(zr, W.P) && zr.w > W.x1 - W.x0, ra: (Dg.d.y1 - yd + 4) / (out.vMin * 0.75), ngoai: G.inZone(zr, { x: P2[0], y: Dg.d.y1 + 8 }) } : null;
      for (let i = 0; i < 120 && zr && zr.t > 0; i++) H.cho(1, P2);
      H.cho(3, P2);
      out.d2.doiLuc = Dg.d.huong !== h1;
      H.tha();
      return out;
    });
    const x2 = s2.x2;
    dat(x2.so === 2 && x2.t >= 0.75 && x2.xa >= 70, 'Xoáy nước: 2 vòng đỏ báo chỗ xoáy mọc ' + x2.t.toFixed(2) + ' giây, cách em bé ≥ ' + Math.round(x2.xa) + ' điểm ảnh');
    dat(x2.xoay === 2 && x2.loi && x2.loi.pool && x2.loi.el === 'ice', 'Xoáy nước: 2 xoáy trôi trên sân, lõi là vũng Băng');
    dat(x2.keo > 8 && x2.keo < s2.vMin * 0.75 * 0.5 && x2.thoat && x2.tan, 'Xoáy nước: đứng yên bị kéo ' + x2.keo.toFixed(1) + ' điểm ảnh/giây (< nửa tốc chạy dọc chậm nhất ' + (s2.vMin * 0.75).toFixed(1) + '), chạy ngược chiều kéo là thoát; xoáy tự tan');
    const l2 = s2.l2;
    dat(l2.an && l2.khong && l2.gonV <= 44 && l2.gonV < s2.vMin * 0.75, 'Lặn – trồi đớp: lặn hẳn (không nhắm được), gợn nước đuổi ' + Math.round(l2.gonV) + ' điểm ảnh/giây (chậm hơn tốc chạy dọc chậm nhất ' + (s2.vMin * 0.75).toFixed(1) + ')');
    dat(l2.vong && l2.vong.trung && l2.vong.t >= 0.65 && (l2.vong.r + 4) / s2.vMin < l2.vong.t, 'Lặn – trồi đớp: gợn dừng → vòng đỏ r ' + (l2.vong && l2.vong.r) + ' ngay chỗ em bé, báo trước ' + (l2.vong && l2.vong.t.toFixed(2)) + ' giây (đi ra mất ' + ((l2.vong.r + 4) / s2.vMin).toFixed(2) + ')');
    dat(l2.lo >= 1 && l2.xLo < l2.ve[1] - 60 && l2.ve[0] >= l2.ve[1] - 8 && !l2.ve[2] && !l2.ve[3], 'Lặn – trồi đớp: đầu trồi giữa bãi đá (x ' + l2.xLo + ') lộ điểm yếu ' + l2.lo.toFixed(2) + ' giây, rồi lặn về mép phải (x ' + l2.ve[0] + ')');
    dat(l2.chay[1] >= l2.chay[0] - 5, 'Lặn – trồi đớp: chạy thẳng ra xa gợn (tốc chậm nhất) thì gợn không đuổi kịp (cách ' + l2.chay.join(' → ') + ')');
    const d2 = s2.d2;
    dat(d2.doi && d2.canh >= 1.45 && d2.canh <= 1.6, 'Dòng nước tự đổi chiều; mũi tên báo đổi trước ' + d2.canh + ' giây');
    dat(d2.z && d2.z.phu && d2.z.t >= 1.45 && d2.z.ra < d2.z.t && !d2.z.ngoai && d2.doiLuc, 'Dòng nước đổi chiều (chiêu): vùng đỏ phủ cả dải, báo trước ' + (d2.z && d2.z.t.toFixed(2)) + ' giây (bước ra khỏi dải mất ' + (d2.z && d2.z.ra.toFixed(2)) + '), đứng trên đá ngoài dải không trúng, đổi chiều lúc nổ');

    // ---------- 3. chiêu pha 3 ----------
    console.log('3. Chiêu pha 3 (Lửa)');
    const s3 = await A.goi(() => {
      const H = G.__tl; H.bat();
      const W = H.vao({ pha: 2 }), b = W.boss, out = { vMin: H.vMin(), b: [W.x0, W.x1, W.y0, W.y1] }, ZK = G.ZK || 0.85;
      // Mưa mảnh đồng
      const P0 = [W.x0 + 80, (W.y0 + W.y1) / 2 + 20];
      let r = H.ra('m3', P0);
      const bo = r.zs.filter((z) => z.skill === 'Mưa mảnh đồng' && z.t > 0);
      let cach = 1e9; for (const a of bo) for (const c of bo) if (a !== c) cach = Math.min(cach, Math.hypot(a.x - c.x, (a.y - c.y) / ZK));
      out.m3 = { so: bo.length, t: bo.length ? Math.min(...bo.map((z) => z.t)) : 0, r: bo[0] && bo[0].r, trung: bo.some((z) => G.inZone(z, W.P)), cach: Math.round(cach), el: bo[0] && bo[0].el };
      for (let i = 0; i < 120 && b.tl.manh.length < bo.length; i++) H.cho(1, P0);
      out.m3.vat = b.tl.manh.length;
      const o = b.tl.manh[0];
      W.P.x = o.x; W.P.y = o.y; G.sim(1);
      out.m3.day = Math.hypot(W.P.x - o.x, (W.P.y - o.y) / ZK);
      let t = 0; for (let i = 0; i < 400 && b.tl.manh.length; i++) { b.cd = 99; G.sim(1); t += 1 / 60; }
      out.m3.giu = +t.toFixed(2);
      b.cd = 0;
      // Siết sân: 3 dải mép trong, giữa sân an toàn; sân hẹp lại; quét lại mỗi 6 giây; tối đa 2 lần thu
      const giua = [(W.x0 + W.x1) / 2 - 30, (W.y0 + W.y1) / 2];
      const b0 = [W.x0, W.x1, W.y0, W.y1];
      r = H.ra('s3', [W.x0 + 100, W.y0 + 4]);
      const ds = r.zs.filter((z) => z.skill === 'Siết sân');
      out.s3 = { so: ds.length, t: ds.length ? Math.min(...ds.map((z) => z.t)) : 0, trung: ds.some((z) => G.inZone(z, W.P)), giua: ds.some((z) => G.inZone(z, { x: giua[0], y: giua[1] })), day: ds[0] && ds[0].h - 10 };
      for (let i = 0; i < 120 && ds[0].t > 0; i++) H.cho(1, giua);
      H.cho(2, giua);
      out.s3.thu = [W.x0 - b0[0], b0[1] - W.x1, W.y0 - b0[2], b0[3] - W.y1];
      let lai = null; t = 0;
      const truoc = new Set(W.zones);
      for (let i = 0; i < 480 && !lai; i++) { b.cd = 99; W.P.x = giua[0]; W.P.y = giua[1]; G.sim(1); t += 1 / 60; lai = W.zones.find((z) => z.skill === 'Siết sân' && !truoc.has(z) && z.t > 0); }
      out.s3.lai = lai ? { sau: +t.toFixed(2), t: lai.t, giua: G.inZone(lai, W.P) } : null;
      b.cd = 0;
      for (let k = 0; k < 2; k++) { H.ra('s3', giua); for (let i = 0; i < 100; i++) H.cho(1, giua); }
      out.s3.toiDa = [W.x0 - b0[0], W.y0 - b0[2], b0[3] - W.y1, W.y1 - W.y0, W.x1 - W.x0];
      // Đớp liên hoàn: 3 vạch đỏ, mỗi vạch nhắm lại chỗ em bé lúc đó, đầu chồm tới
      for (let i = 0; i < 400 && b.busy > 0; i++) { b.cd = 99; G.sim(1); }
      for (let i = 0; i < 600 && b.x < W.x1 - 6; i++) { b.cd = 99; W.P.x = W.x0 + 40; G.sim(1); }
      const xDau = b.x, Q = [[b.x - 90, b.y], [b.x - 110, b.y - 34], [b.x - 130, b.y + 30]];
      r = H.ra('dl', Q[0]);
      const vach = [], seen = new Set();
      let k = 0;
      for (let i = 0; i < 260; i++) {
        const z = W.zones.find((q) => q.skill === 'Đớp liên hoàn' && q.t > 0 && !seen.has(q));
        if (z) { seen.add(z); vach.push({ t: z.t, w: z.w, trung: G.inZone(z, W.P), ngang: G.inZone(z, { x: W.P.x - Math.sin(z.ang) * (z.w / 2 + 5), y: W.P.y + Math.cos(z.ang) * (z.w / 2 + 5) }) }); k = Math.min(2, vach.length); }
        W.P.x = Q[k][0]; W.P.y = Q[k][1]; G.sim(1);
      }
      out.dl = { vach, chom: Math.round(xDau - Math.min(b.x, xDau)), raKhoi: b.tl.raKhoi };
      let xMin = b.x; for (let i = 0; i < 60; i++) { G.sim(1); xMin = Math.min(xMin, b.x); }
      out.dl.xMin = Math.round(xMin - W.x0);
      for (let i = 0; i < 600 && b.x < W.x1 - 8; i++) { b.cd = 99; W.P.x = W.x0 + 40; G.sim(1); }
      out.dl.ve = Math.round(W.x1 - b.x);
      H.tha();
      return out;
    });
    const m3 = s3.m3;
    dat(m3.so === 6 && m3.trung && m3.t >= 0.95 && (m3.r + 4) / (s3.vMin * 0.75) < m3.t && m3.el === 'fire', 'Mưa mảnh đồng: 6 bóng tròn (một ngay chỗ em bé), báo trước ' + m3.t.toFixed(2) + ' giây (ra khỏi bóng mất ' + ((m3.r + 4) / (s3.vMin * 0.75)).toFixed(2) + ')');
    dat(m3.cach >= 46 && m3.vat === 6 && m3.day >= 12 && Math.abs(m3.giu - 4) < 0.2, 'Mưa mảnh đồng: rơi xong nằm lại làm vật cản nóng ' + m3.giu + ' giây (đẩy em bé ra), các mảnh cách nhau ≥ ' + m3.cach + ' (khe ≥ ' + (m3.cach - 26) + ': không kẹt)');
    const s3s = s3.s3;
    dat(s3s.so === 3 && s3s.trung && !s3s.giua && s3s.t >= 1.15 && (s3s.day + 4) / (s3.vMin * 0.75) < s3s.t, 'Siết sân: dải mép trong (trên, dưới, trái) dày ' + s3s.day + ', báo trước ' + s3s.t.toFixed(2) + ' giây (đi ra mất ' + ((s3s.day + 4) / (s3.vMin * 0.75)).toFixed(2) + '), giữa sân an toàn');
    dat(s3s.thu.join() === '8,0,7,7', 'Siết sân: sân hẹp lại (trái 8, trên 7, dưới 7; mép phải là đầu)');
    dat(s3s.lai && s3s.lai.sau > 5 && s3s.lai.sau < 7.2 && s3s.lai.t >= 1.05 && !s3s.lai.giua, 'Siết sân: sau đó quét lại mép trong mỗi ~6 giây (lần sau sau ' + (s3s.lai && s3s.lai.sau) + ' giây, báo trước ' + (s3s.lai && s3s.lai.t.toFixed(2)) + '), giữa sân không trúng');
    dat(s3s.toiDa[0] === 16 && s3s.toiDa[1] === 14 && s3s.toiDa[3] >= 120, 'Siết sân: thu tối đa 2 lần (sân còn ' + s3s.toiDa[4] + ' × ' + s3s.toiDa[3] + ')');
    const dl = s3.dl;
    dat(dl.vach.length === 3 && dl.vach.every((v) => v.trung && !v.ngang) && dl.vach[0].t >= 0.7 && Math.min(...dl.vach.map((v) => v.t)) >= 0.55, 'Đớp liên hoàn: 3 vạch đỏ nhắm lại chỗ em bé mỗi cú, báo trước ' + dl.vach.map((v) => v.t.toFixed(2)).join(' / ') + ' giây; bước ngang ' + Math.round(dl.vach[0].w / 2 + 5) + ' điểm ảnh là né (' + ((dl.vach[0].w / 2 + 5) / (s3.vMin * 0.75)).toFixed(2) + ' giây)');
    dat(dl.chom >= 60 && dl.xMin >= 50 && dl.ve <= 8, 'Đớp liên hoàn: đầu chồm tới ' + dl.chom + ' điểm ảnh (không quá mép trái ' + dl.xMin + '), xong trườn về mép phải');

    // ---------- 4. không đòn một phát chết ----------
    console.log('4. Không đòn một phát chết ở Sức mạnh khuyên dùng');
    // bản lưu kiem-can-bang/luu-A.json (ải 3-5), nâng cấp tới Sức mạnh khuyên dùng 4-5 như do_trum.py (phiên 3B)
    let luu = JSON.parse(require('fs').readFileSync(path.join(__dirname, '..', '..', 'docs', 'review', 'ke-hoach-cai-thien', 'kiem-can-bang', 'luu-A.json'), 'utf8'))[14];
    if (typeof luu !== 'string') luu = JSON.stringify(luu);
    const s4 = await A.goi((luu) => {
      const H = G.__tl; H.tha();
      const out = {};
      const thu = (pha, k, P, loc) => {
        G.save = G.fixSave(JSON.parse(luu)); G.save.sound = false;
        const s = G.save; for (let ii = 0; ii < 4; ii++) s.stars['3-' + ii] = 1;
        const hs = s.heroes[s.hero]; while (G.power() < G.STAGE_REC[19] && hs.lvl < G.MAX_LEVEL) hs.lvl++;
        out.pw = Math.round(G.power()); out.rec = G.STAGE_REC[19];
        G.rnd = G.srand(77); G.startStage(3, 4, 0); G.testGoto('boss');
        const W = G.getWorld(), b = W.boss;
        for (let i = 0; i < 400 && b.invuln > 0; i++) G.sim(1);
        if (pha >= 1) { b.hp = b.maxhp * 0.6; G.sim(2); for (let i = 0; i < 400 && b.invuln > 0; i++) G.sim(1); }
        if (pha >= 2) { b.hp = b.maxhp * 0.3; G.sim(2); for (let i = 0; i < 400 && b.invuln > 0; i++) G.sim(1); }
        const h0 = G.hurtPlayer; let lon = 0;
        G.hurtPlayer = function () { const P = W.P, a = P.hp; P.inv = 0; const r = h0.apply(this, arguments); lon = Math.max(lon, a - P.hp); P.hp = P.maxhp; return r; };
        try {
          const pt = P(W);
          H.ra(k, pt);
          for (let i = 0; i < 360; i++) { const q = loc ? loc(W, b) : pt; W.P.x = q[0]; W.P.y = q[1]; W.P.hp = W.P.maxhp; W.P.inv = 0; b.cd = 99; G.sim(1); }
        } finally { G.hurtPlayer = h0; }
        return Math.round(lon / W.P.maxhp * 100);
      };
      out.p1 = { 'Quật đuôi': thu(0, 'c1', (W) => [W.x0 + 100, W.y0 + 4]) };
      out.p2 = { 'Lặn – trồi đớp': thu(1, 'l2', (W) => [W.x0 + 80, (W.y0 + W.y1) / 2]), 'Dòng nước đổi chiều': thu(1, 'd2', (W) => [W.x0 + 80, (W.y0 + W.y1) / 2], (W, b) => [W.x0 + 80, (b.tl.dong.d.y0 + b.tl.dong.d.y1) / 2]) };
      out.p3 = { 'Đớp liên hoàn': thu(2, 'dl', (W) => [W.x1 - 90, (W.y0 + W.y1) / 2], (W, b) => [b.x - 60, b.y]), 'Mưa mảnh đồng': thu(2, 'm3', (W) => [W.x0 + 80, (W.y0 + W.y1) / 2]), 'Siết sân': thu(2, 's3', (W) => [W.x0 + 100, W.y0 + 4], (W) => [W.x0 + 100, W.y0 + 4]) };
      return out;
    }, luu);
    const tat = Object.assign({}, s4.p1, s4.p2, s4.p3), max = Math.max(...Object.values(tat));
    dat(max < 100 && max > 0, 'Sức mạnh ' + s4.pw + ' / ' + s4.rec + ', em bé đủ máu: nhát mạnh nhất mỗi chiêu ' + Object.entries(tat).map(([k, v]) => k + ' ' + v + '%').join(', ') + ' máu tối đa');

    // ---------- 5. cảnh bỏ trốn ----------
    console.log('5. Cảnh bỏ trốn');
    const BO = () => {
      const H = G.__tl; H.bat();
      const W = H.vao({ pha: 2 }), b = W.boss, S = G.getRun(), out = {};
      const dai0 = (W.song.dai || []).filter((d) => d.tlDong).length;
      G.kill(b, {});
      out.tron = !!W.tlTron; out.dieT = W.bossDieT; out.banner = W.banner && W.banner.s;
      out.prop = W.props.some((p) => p.type === 'tlTron');
      out.dai = [dai0, (W.song.dai || []).filter((d) => d.tlDong).length];
      let t = 0; for (let i = 0; i < 600 && !S.won; i++) { G.sim(1); t += 1 / 60; }
      out.won = S.won; out.t = +t.toFixed(2);
      G.sim(5);
      out.san = [W.x0 === W.tlSan.x0, W.x1 === W.tlSan.x1, W.y0 === W.tlSan.y0, W.y1 === W.tlSan.y1];
      out.loot = !!S.loot.bossDown; out.portal = W.props.some((p) => p.type === 'portal');
      H.tha();
      return out;
    };
    const bo = await A.goi(BO), boB = await B.goi(BO);
    dat(bo.tron && bo.prop && bo.dieT >= 3.4 && /lặn mất/.test(bo.banner || ''), 'gục → cảnh bỏ trốn ' + bo.dieT.toFixed(1) + ' giây (nhả mảnh nhỏ, ngoạm mảnh mặt trời, lặn mất), không nổ tung; dòng "' + bo.banner + '"');
    dat(bo.won && bo.loot && bo.portal && bo.t >= 3.4 && bo.t < 4.5, 'thắng ải như hạ trùm thường: cổng mở sau ' + bo.t + ' giây (cảnh xong), đồ rơi như cũ');
    dat(bo.san.every(Boolean) && bo.dai[0] === 1 && bo.dai[1] === 0, 'nước rút: trả sàn cũ, dải Dòng nước tan');
    dat(!boB.tron && boB.won, '?tl3c=0: không có cảnh bỏ trốn (trùm gục như bản 3B, cổng mở sau ' + boB.t + ' giây)');

    // ---------- 6. bot ----------
    console.log('6. Bot bất tử hạ Thuồng Luồng');
    const s6 = await A.goi(() => {
      const H = G.__tl; H.bat();
      G.testSave({ lvl: 40, sharpen: 15, branch: 'fire', marksMoi: 5000 });
      const s = G.save; for (let rr = 0; rr < 3; rr++) for (let ii = 0; ii < 5; ii++) s.stars[rr + '-' + ii] = 3;
      for (let ii = 0; ii < 4; ii++) s.stars['3-' + ii] = 1;
      const ten = new Set();
      let ngoai = 0, bad = 0, won = 0;
      for (const hat of [11, 22, 33]) {
        G.rnd = G.srand(hat); G.startStage(3, 4, 0); G.testGoto('boss');
        const S = G.getRun(), W = S.W, b = W.boss;
        for (let i = 0; i < 600 && !S.won; i++) {
          G.botRun(0.5);
          if (b.skillName) ten.add(b.skillName);
          if (!(W.P.x >= W.x0 - 0.01 && W.P.x <= W.x1 + 0.01 && W.P.y >= W.y0 - 0.01 && W.P.y <= W.y1 + 0.01)) ngoai++;
          if (!isFinite(b.x + b.y + b.hp + W.P.x + W.P.y)) bad++;
        }
        if (S.won) won++;
      }
      H.tha();
      return { won, ten: [...ten], ngoai, bad };
    });
    const moi = ['Xoáy nước', 'Lặn – trồi đớp', 'Dòng nước đổi chiều', 'Mưa mảnh đồng', 'Siết sân', 'Đớp liên hoàn'];
    dat(s6.won === 3 && !s6.bad, 'bot hạ Thuồng Luồng 3 / 3 lượt, không NaN (chiêu đã thấy: ' + s6.ten.join(', ') + ')');
    dat(moi.filter((k) => s6.ten.includes(k)).length >= 5 && !s6.ten.some((k) => /Bổ rìu|Sóng thần|Cột nước|Xoáy hút/.test(k)), 'bot gặp chiêu riêng pha 2, 3 (' + moi.filter((k) => s6.ten.includes(k)).length + ' / 6), không còn chiêu Ngư Tinh');
    dat(s6.ngoai === 0, 'em bé luôn trong bãi đá (kể cả lúc sân hẹp lại)');

    // ---------- 7. vẽ ----------
    console.log('7. Vẽ (VI + EN)');
    const s7 = await A.goi(() => {
      const H = G.__tl; H.bat();
      const loi = [];
      const ve = (ten) => { try { G.noRender = false; G.drawWorld(3); G.time += 0.37; G.drawWorld(3); } catch (e) { loi.push(ten + ': ' + String(e && e.stack || e).slice(0, 300)); } finally { G.noRender = true; } };
      try {
        for (const lang of ['vi', 'en']) {
          G.ngonNgu.dat(lang, false);
          let W = H.vao({ pha: 1 }), b = W.boss;
          const P0 = [W.x0 + 70, (W.y0 + W.y1) / 2];
          ve('pha 2');
          H.ra('x2', P0); ve('xoay bao'); H.cho(60, P0); ve('xoay');
          H.ra('l2', P0); H.cho(80, P0); ve('gon'); H.cho(60, P0); ve('troi'); H.cho(80, P0); ve('lan ve');
          b.tl.dong.doiT = 1.2; H.cho(5, P0); ve('dong canh');
          H.ra('d2', P0); H.cho(100, P0); ve('troi go');
          W = H.vao({ pha: 2 }); b = W.boss;
          H.ra('m3', P0); ve('manh bao'); H.cho(70, P0); ve('manh');
          H.ra('s3', P0); ve('siet bao'); H.cho(80, P0); ve('siet');
          H.ra('dl', [b.x - 80, b.y]); H.cho(40); ve('dop lien hoan');
          G.kill(b, {}); for (const k of [0.3, 0.8, 1.3, 2.2, 3.0, 3.6]) { while (G.time - W.tlTron.t0 < k) G.sim(1); ve('bo tron ' + k); }
        }
        G.ngonNgu.dat('vi', false);
      } finally { G.noRender = true; }
      const S = ['Xoáy nước', 'Lặn – trồi đớp', 'Dòng nước đổi chiều', 'Mưa mảnh đồng', 'Siết sân', 'Đớp liên hoàn', 'Dòng nước sắp đổi chiều!', '{0} ngoạm mảnh trống lớn nhất rồi lặn mất!'];
      const en = S.map((s) => [s, G.ngonNgu.D.get(s) || null]);
      G.ngonNgu.dat('en', false); const dich = S.slice(0, 6).map((s) => G.tv(s)); dich.push(G.t(S[7], 'X')); G.ngonNgu.dat('vi', false);
      H.tha();
      return { loi, loiVe: G.thuongLuong.loiVe ? String(G.thuongLuong.loiVe.stack || G.thuongLuong.loiVe).slice(0, 400) : null, roomErr: G.art.roomErr ? String(G.art.roomErr) : null, en, dich };
    });
    dat(!s7.loi.length && !s7.loiVe && !s7.roomErr, 'vẽ mọi lúc (xoáy, gợn, trồi, dòng sắp đổi, tảng trôi, mảnh đồng, siết, đớp liên hoàn, 6 lúc của cảnh bỏ trốn) VI + EN không lỗi' + (s7.loi.length ? ': ' + s7.loi[0] : s7.loiVe ? ': ' + s7.loiVe : s7.roomErr ? ': ' + s7.roomErr : ''));
    const thieu = s7.en.filter((x) => !x[1]);
    dat(!thieu.length && s7.dich.every((s) => /^[\x20-\x7e]+$/.test(s)), 'chữ mới có tiếng Anh: ' + s7.dich.join(', ') + (thieu.length ? ' — thiếu ' + thieu.map((x) => x[0]).join(', ') : ''));

    // ---------- 8. cờ ----------
    console.log('8. Cờ quay lui');
    const c8 = await B.goi(() => {
      const H = G.__tl; H.bat();
      const W = H.vao({ pha: 1 }), b = W.boss;
      W.P.x = W.x0 + 10;
      const o = { chon: [0, 1, 2].map((p) => G.bossSK.thuong.chon(b, p).join()), dai: (W.song.dai || []).filter((d) => d.tlDong).length, c3: G.TL_3C };
      H.tha();
      return o;
    });
    dat(c8.c3 === false && c8.chon[1] === 'c1,c2,c3,n1,n2,c4' && c8.chon[2] === 'c1,c2,c3,n1,n2,c4,c5' && c8.dai === 0, '?tl3c=0: bản 3B (pha 2, 3 mượn chiêu Ngư Tinh, không dải Dòng nước)');
    const d8 = await D.goi(() => ({ tl: G.thuongLuong }));
    dat(d8.tl === null, '?vung4=0: không có Thuồng Luồng');
    const ngam = await Promise.all([A, B, D].map((T) => T.goi(() => (globalThis.__loiNgam || []).slice(0, 2))));
    dat(ngam.every((x) => !x.length), 'không lỗi ngầm ở cả 3 bản' + (ngam.some((x) => x.length) ? ': ' + JSON.stringify(ngam) : ''));

    console.log('\nPASS — ' + soDat + ' điều kiện');
  } catch (e) {
    console.error(e.message || e);
    for (const T of [A, B, D]) { const l = T.loi(); if (l) console.error(l.slice(0, 1500)); }
    process.exitCode = 1;
  } finally { for (const T of [A, B, D]) T.dong(); }
})();
