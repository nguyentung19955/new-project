#!/usr/bin/env node
// BƯỚC 3 — VÙNG 4 SÔNG SÂU, PHIÊN 3B: Thuồng Luồng pha 1, sân bãi đá giữa sông, Vỗ sóng bờ, khung đổi hệ theo pha (js/thuong_luong.js).
// Không cần trình duyệt: hai / ba bản game trong Node qua tests/node_trang.js (DOM / canvas giả, ?cloud=0).
//   1. Sân: chỗ đứng thu còn ~70% sàn trùm (nước sâu quanh), đầu ở mép phải, lớp kháng hệ pha 1 (Độc) → yếu Lửa, thẻ dưới thanh máu.
//   2. Ba chiêu pha 1 + Đớp + Lặn đổi chỗ: đúng hình vùng, báo trước đủ lâu, né được (tính bằng tốc chạy chậm nhất), đúng tác dụng
//      (hai dải đuôi, phun nhắm lại, vệt độc, vòm chắn, lộ điểm yếu, đớp lần hai, lặn không đánh trúng được).
//   3. Vỗ sóng bờ: đứng sát mép trên / dưới / trái > 1,5 giây → sóng phủ dải mép (báo trước 1 giây); đứng giữa / sát mép phải: không.
//   4. Đổi hệ theo pha: Độc → Băng → Lửa (điểm yếu Lửa → Độc → Băng); ?tldoihe=0: Độc suốt trận; gộp với lớp thích nghi cùng hệ.
//   5. Bot bất tử hạ Thuồng Luồng: không NaN, không lỗi; hạ xong trả lại sàn cũ (đi tới cửa / nhặt đồ được).
//   6. Vẽ (VI + EN): phòng trùm lúc báo đuôi, sóng bờ, vòm, vệt độc, đổi pha, hạ xong — không lỗi; tên chiêu có tiếng Anh.
//   7. Cờ: ?tlrieng=0 → Thuồng Luồng như phiên 1 (chiêu Ngư Tinh, sân thường); ?vung4=0 → không có gì.
// Chạy: node game/tests/thuong_luong.test.js
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

// Trong trang: dựng phòng trùm 4-5 (bản lưu cấp 40), chờ hết màn ra mắt. Gắn các hàm giúp vào G.__tl.
const CAI = () => {
  const H = (G.__tl = {});
  H.vao = function (o) {
    o = o || {};
    G.testSave({ lvl: 40, sharpen: 15, branch: o.branch || 'fire', marksMoi: 5000 });
    const s = G.save; for (let rr = 0; rr < 3; rr++) for (let ii = 0; ii < 5; ii++) s.stars[rr + '-' + ii] = 3;
    for (let ii = 0; ii < 4; ii++) s.stars['3-' + ii] = 1;
    if (o.stats) { const S0 = G.getRun && G.getRun(); void S0; }
    G.rnd = G.srand(o.hat || 4545); // cùng chuỗi ngẫu nhiên mỗi lần chạy
    G.startStage(3, 4, 0);
    if (o.stats) Object.assign(G.getRun().stats.el, o.stats);
    G.testGoto('boss');
    const W = G.getWorld(), b = W.boss;
    W.P.x = (W.x0 + W.x1) / 2 - 40; W.P.y = (W.y0 + W.y1) / 2;
    for (let i = 0; i < 400 && b.invuln > 0; i++) G.sim(1);
    return W;
  };
  // Giữ em bé đứng yên (không bot), bất tử; chờ trùm rảnh rồi ép ra chiêu k; trả về các vùng của trùm sinh ra trong khung đó.
  H.bat = function () { if (!H.h0) { H.h0 = G.hurtPlayer; G.hurtPlayer = function () { H.trung = (H.trung || 0) + 1; return false; }; } };
  H.tha = function () { if (H.h0) { G.hurtPlayer = H.h0; H.h0 = null; } };
  H.cho = function (n) { for (let i = 0; i < n; i++) G.sim(1); };
  H.ra = function (k, P) {
    const W = G.getWorld(), b = W.boss;
    for (let i = 0; i < 900 && (b.busy > 0 || b.seq.length); i++) G.sim(1);
    if (P) { W.P.x = P[0]; W.P.y = P[1]; }
    const truoc = new Set(W.zones);
    b.dbg = k; b.cd = 0; b.last = null;
    const ak = (G.bossSK[b.kind][k] && G.bossSK[b.kind][k].anim) || k; // chiêu mượn cử động khác (Đớp: 'atk')
    for (let i = 0; i < 60; i++) {
      if (P) { W.P.x = P[0]; W.P.y = P[1]; }
      G.sim(1);
      if (b.an && b.an.n === ak && b.skillName === G.bossSK[b.kind][k].name) break;
    }
    return { zs: W.zones.filter((z) => !truoc.has(z) && z.src === b), b, W };
  };
  return 1;
};

(async () => {
  const A = moTrang(''), B = moTrang('tldoihe=0'), Cq = moTrang('tlrieng=0'), D = moTrang('vung4=0');
  try {
    for (const T of [A, B, Cq]) await T.goi(CAI);

    // ---------- 1. sân ----------
    console.log('1. Sân bãi đá giữa sông, đầu ở mép phải, hệ pha 1');
    const s1 = await A.goi(() => {
      const W = G.__tl.vao(), b = W.boss, S = W.tlSan;
      const chip = b.layers.map((l) => (l.type === 'resist' ? 'Kháng ' + l.el : l.type));
      return { b: [W.x0, W.x1, W.y0, W.y1], S, x: b.x, y: b.y, el: b.el, weak: b.weak, chip, sk: Object.keys(G.bossSK.thuong), khac: G.bossSK.thuong !== G.bossSK.ngu,
        props: W.props.filter((p) => p.type === 'tlThan').map((p) => p.ben), ten: ['c1', 'c2', 'c3'].map((k) => G.bossSK.thuong[k].name) };
    });
    const dt0 = (s1.S.x1 - s1.S.x0) * (s1.S.y1 - s1.S.y0), dt1 = (s1.b[1] - s1.b[0]) * (s1.b[3] - s1.b[2]), tl = dt1 / dt0;
    dat(tl > 0.65 && tl < 0.76, 'chỗ đứng còn ' + Math.round(tl * 100) + '% sàn trùm (' + (s1.b[1] - s1.b[0]) + ' × ' + (s1.b[3] - s1.b[2]) + '), quanh là nước sâu');
    dat(s1.x >= s1.b[1] - 6 && s1.props.join() === 'tren,duoi', 'đầu ở mép phải (x = ' + Math.round(s1.x) + '), thân trồi ở mép trên + dưới');
    dat(s1.khac && s1.ten.join() === 'Quật đuôi,Phun nước đen,Vòng thân', 'bộ chiêu riêng pha 1: ' + s1.ten.join(', ') + ' (không còn SK.thuong = SK.ngu)');
    dat(s1.el === 'poison' && s1.weak.join() === 'fire' && s1.chip[0] === 'Kháng poison', 'pha 1 hệ Độc: lớp "Kháng Độc" đứng đầu, điểm yếu Lửa');

    // ---------- 2. ba chiêu ----------
    console.log('2. Ba chiêu pha 1 (vùng đỏ, báo trước, né được)');
    const s2 = await A.goi(() => {
      const H = G.__tl; H.bat();
      const W = H.vao(), b = W.boss, out = {};
      const vMin = 72 * Math.min(...G.HKEYS.map((k) => G.HEROES[k].speed)); // tốc chạy chậm nhất (Cu Lì)
      out.vMin = vMin;
      // Quật đuôi: em bé sát mép trên → dải mép trên
      let r = H.ra('c1', [W.x0 + 100, W.y0 + 2]);
      const rs = r.zs.filter((z) => z.shape === 'rect'), zd = rs[0], z2 = rs[1];
      const giua = { x: W.x0 + 100, y: (W.y0 + W.y1) / 2 };
      out.c1 = zd ? { t: zd.t, y0: zd.y, y1: zd.y + zd.h, w: zd.w, ten: zd.skill, giua: G.inZone(zd, giua) || (z2 && G.inZone(z2, giua)), trung: G.inZone(zd, W.P),
        ra: (zd.y + zd.h - W.P.y + 4) / (vMin * 0.75), hai: z2 ? { t: z2.t, duoi: z2.y > (W.y0 + W.y1) / 2 } : null } : null;
      H.cho(120);
      out.c1duoi = (() => { const r2 = H.ra('c1', [W.x0 + 60, W.y1 - 1]); const z = r2.zs.find((q) => q.shape === 'rect'); return z ? [z.y, z.y + z.h, G.inZone(z, W.P)] : null; })();
      H.cho(120);
      // Phun nước đen: tia thẳng tới em bé, để lại vệt
      r = H.ra('c2', [W.x0 + 60, (W.y0 + W.y1) / 2]);
      const zl = r.zs.find((z) => z.shape === 'line');
      out.c2 = zl ? { t: zl.t, w: zl.w, trung: G.inZone(zl, W.P), ngang: !G.inZone(zl, { x: W.P.x, y: W.P.y + zl.w / 2 + 6 }), ra: (zl.w / 2 + 4) / (vMin * 0.75), el: zl.el } : null;
      // lần phun 2, 3: nhắm lại chỗ em bé lúc đó (em bé đã dời đi 40 điểm ảnh), báo trước riêng
      const Q2 = [W.x0 + 60, (W.y0 + W.y1) / 2 - 40]; let z2l = null;
      for (let i = 0; i < 60 && !z2l; i++) { W.P.x = Q2[0]; W.P.y = Q2[1]; G.sim(1); z2l = W.zones.find((z) => z.src === b && z.shape === 'line' && z.t > 0 && z !== zl); }
      out.c2b = z2l ? { t: z2l.t, trung: G.inZone(z2l, W.P) } : null;
      for (let i = 0; i < 90 && !W.zones.some((z) => z.tlVet); i++) G.sim(1);
      const vet = W.zones.find((z) => z.tlVet);
      out.vet = vet ? { life: vet.life, pool: vet.pool, el: vet.el } : null;
      H.cho(240);
      // Vòng thân: 3 vòm, vòm đầu ngay chỗ em bé, đầu trườn lên đá lộ điểm yếu, chân vòm chắn, thân vòm chắn đạn
      const P0 = [W.x0 + 70, (W.y0 + W.y1) / 2];
      r = H.ra('c3', P0);
      const x0 = b.x;
      let vom = [];
      for (let i = 0; i < 120 && !vom.length; i++) { G.sim(1); W.P.x = P0[0]; W.P.y = P0[1]; vom = W.zones.filter((z) => z.src === b && z.shape === 'circle' && z.t > 0); }
      out.c3 = { so: vom.length, t: vom.length ? Math.min(...vom.map((z) => z.t)) : 0, trung: vom.some((z) => G.inZone(z, W.P)), r: vom[0] && vom[0].r };
      H.cho(18);
      out.c3.dau = [Math.round(x0), Math.round(b.x)]; out.c3.lo = b.exposed;
      // chân vòm đẩy em bé ra; đạn của em bé bay vào vòm thì tan
      const v = b.tl.vom[0];
      W.P.x = v.x + v.rx; W.P.y = v.y; G.sim(1);
      out.c3.chan = Math.hypot(W.P.x - (v.x + v.rx), (W.P.y - v.y) / (G.ZK || 0.85));
      W.projs.push({ team: 'player', kind: 'arrow', x: v.x - 2, y: v.y, vx: 0, vy: 0, t: 1, dmg: 1, seen: [], z: 11 });
      const dan = W.projs[W.projs.length - 1]; G.sim(1); out.c3.dan = dan.t <= 0;
      out.c3.ra = (v.rx * (G.ZK || 0.85) + 4) / (vMin * 0.75);
      H.cho(200);
      out.c3.ve = [Math.round(b.x), b.tl.vom.length];
      // chống áp sát: vảy dựng gai quanh đầu lúc đầu nằm trên đá
      b.tlGoc.push({ type: 'antiMelee' }); G.thuongLuong.datHe(b, b.phase);
      r = H.ra('c3', [W.x1 - 80, b.y]);
      let gai = null;
      for (let i = 0; i < 160 && !gai; i++) { G.sim(1); gai = W.zones.find((z) => z.src === b && z.skill === 'Vảy dựng gai'); }
      out.gai = gai ? { r: gai.r, t: gai.t } : null;
      H.cho(300);
      // Đớp: em bé đứng sát đầu → quạt trước mặt; còn đứng sát thì đớp lần hai
      const sat = [b.x - 50, b.y];
      const cb = G.bossSK.thuong.chon(b, 0);
      out.chonGan = cb.filter((k) => k === 'dop').length;
      r = H.ra('dop', sat);
      const zc = r.zs.find((z) => z.shape === 'cone');
      out.dop = zc ? { t: zc.t, ten: zc.skill, trung: G.inZone(zc, W.P), r: zc.r } : null;
      let z2c = null;
      for (let i = 0; i < 80 && !z2c; i++) { W.P.x = sat[0]; W.P.y = sat[1]; G.sim(1); z2c = W.zones.find((z) => z.src === b && z.shape === 'cone' && z.t > 0 && z !== zc); }
      out.dop2 = z2c ? { t: z2c.t } : null;
      H.cho(200);
      // Lặn đổi chỗ: đầu lặn (không nhắm / đánh trúng được) rồi trồi chỗ khác dọc mép phải
      b.tl.lanCd = 0; b.cd = 5;
      const y0 = b.y; let lan = 0, khongTrung = true, xa = 0;
      for (let i = 0; i < 200; i++) {
        W.P.x = W.x0 + 40; W.P.y = (W.y0 + W.y1) / 2; G.sim(1);
        if (b.hidden) { lan += 1 / 60; if (G.targets().includes(b) || G.damage(b, 10, {}) > 0) khongTrung = false; }
        else if (lan > 0) { xa = Math.abs(b.y - y0); break; }
      }
      out.lan = { giay: +lan.toFixed(2), khongTrung, xa: Math.round(xa), x: Math.round(b.x) };
      H.tha();
      return out;
    });
    const c1 = s2.c1;
    dat(c1 && c1.ten === 'Quật đuôi' && c1.trung && !c1.giua && c1.w > 240, 'Quật đuôi: dải sát mép phía em bé (cao ' + Math.round(c1.y1 - c1.y0) + '), giữa sân không trúng');
    dat(c1.t >= 1.1 && c1.ra < c1.t, 'Quật đuôi: báo trước ' + c1.t.toFixed(2) + ' giây ≥ thời gian đi bộ ra khỏi dải từ sát mép (' + c1.ra.toFixed(2) + ' giây, nhân vật chậm nhất)');
    dat(c1.hai && c1.hai.duoi && c1.hai.t > c1.t + 0.4, 'Quật đuôi: quất ngược sang dải mép kia sau ' + (c1.hai.t - c1.t).toFixed(2) + ' giây (hai dải báo đỏ từ đầu chiêu), giữa sân an toàn');
    dat(s2.c1duoi && s2.c1duoi[2] && s2.c1duoi[1] > s1.b[3], 'Quật đuôi: em bé sát mép dưới → dải mép dưới');
    dat(s2.c2 && s2.c2.trung && s2.c2.ngang && s2.c2.t >= 0.79 && s2.c2.ra < s2.c2.t && s2.c2.el === 'poison', 'Phun nước đen: tia tới chỗ em bé, báo trước ' + s2.c2.t.toFixed(2) + ' giây, bước ngang ' + Math.round(s2.c2.w / 2 + 6) + ' điểm ảnh là né (' + s2.c2.ra.toFixed(2) + ' giây)');
    dat(s2.c2b && s2.c2b.trung && s2.c2b.t >= 0.45, 'Phun nước đen: phun lần sau nhắm lại chỗ em bé, báo trước ' + (s2.c2b && s2.c2b.t.toFixed(2)) + ' giây');
    dat(s2.vet && s2.vet.pool && Math.abs(s2.vet.life - 3) < 0.1 && s2.vet.el === 'poison', 'Phun nước đen: để lại vệt độc 3 giây');
    dat(s2.c3.so === 3 && s2.c3.trung && s2.c3.t >= 1.9, 'Vòng thân: 3 vòm, một vòm ngay chỗ em bé, siết sau ' + s2.c3.t.toFixed(2) + ' giây (ra khỏi vòm mất ' + s2.c3.ra.toFixed(2) + ' giây)');
    dat(s2.c3.dau[0] - s2.c3.dau[1] >= 40 && s2.c3.lo > 1.5, 'Vòng thân: đầu trườn lên đá (x ' + s2.c3.dau[0] + ' → ' + s2.c3.dau[1] + '), lộ điểm yếu ' + s2.c3.lo.toFixed(2) + ' giây');
    dat(s2.c3.chan >= 7 && s2.c3.dan, 'Vòng thân: chân vòm đẩy em bé ra, đạn bay vào thân vòm thì tan');
    dat(s2.c3.ve[0] >= s1.b[1] - 8 && s2.c3.ve[1] === 0, 'Vòng thân xong: đầu về mép phải, vòm chìm (' + s2.c3.ve.join(', ') + ')');
    dat(s2.gai && s2.gai.r >= 40 && s2.gai.t >= 0.55, 'Chống áp sát: vảy dựng gai quanh đầu (báo trước ' + s2.gai.t.toFixed(2) + ' giây)');
    dat(s2.chonGan >= 3 && s2.dop && s2.dop.ten === 'Đớp' && s2.dop.trung && s2.dop.t >= 0.55, 'Đớp: em bé đứng sát đầu thì hay bị đớp (quạt bán kính ' + (s2.dop && s2.dop.r) + ', báo trước ' + (s2.dop && s2.dop.t.toFixed(2)) + ' giây)');
    dat(s2.dop2 && s2.dop2.t >= 0.45, 'Đớp: còn đứng sát thì đớp lần hai (báo trước ' + (s2.dop2 && s2.dop2.t.toFixed(2)) + ' giây)');
    dat(s2.lan.giay >= 0.9 && s2.lan.khongTrung && s2.lan.xa >= 40 && s2.lan.x >= s1.b[1] - 8, 'Lặn đổi chỗ: lặn ' + s2.lan.giay + ' giây (không nhắm / đánh trúng được), trồi cách chỗ cũ ' + s2.lan.xa + ' điểm ảnh dọc mép phải');

    // ---------- 3. Vỗ sóng bờ ----------
    console.log('3. Vỗ sóng bờ (chống đứng sát mép)');
    const s3 = await A.goi(() => {
      const H = G.__tl; H.bat();
      const out = {};
      const thu = (ten, f, giay) => {
        const W = H.vao(), b = W.boss;
        b.cd = 99; // trùm không ra chiêu: chỉ đo sóng bờ
        const [x, y] = f(W);
        let z = null, t = 0;
        for (let i = 0; i < giay * 60 && !z; i++) { W.P.x = x; W.P.y = y; b.cd = 99; G.sim(1); t += 1 / 60; z = W.zones.find((q) => q.skill === 'Vỗ sóng bờ'); }
        out[ten] = z ? { sau: +t.toFixed(2), bao: +z.t.toFixed(2), trung: G.inZone(z, W.P), vao: G.inZone(z, { x: (W.x0 + W.x1) / 2, y: (W.y0 + W.y1) / 2 }), g: [z.x, z.y, z.w, z.h], b: [W.x0, W.x1, W.y0, W.y1] } : null;
      };
      thu('tren', (W) => [W.x0 + 120, W.y0 + 10], 4);
      thu('duoi', (W) => [W.x0 + 120, W.y1 - 10], 4);
      thu('trai', (W) => [W.x0 + 4, (W.y0 + W.y1) / 2], 4);
      thu('giua', (W) => [(W.x0 + W.x1) / 2 - 30, (W.y0 + W.y1) / 2], 6);
      thu('phai', (W) => [W.x1 - 4, W.y0 + 70], 6);
      out.vMin = 72 * Math.min(...G.HKEYS.map((k) => G.HEROES[k].speed));
      H.tha();
      return out;
    });
    for (const k of ['tren', 'duoi', 'trai']) {
      const o = s3[k], sau = k === 'trai' ? o.g[2] - 10 : o.g[3] - 10, ra = (sau + 4) / (s3.vMin * (k === 'trai' ? 1 : 0.75));
      dat(o && o.sau >= 1.45 && o.sau < 1.7 && o.trung && !o.vao && o.bao >= 1.05 && ra < o.bao,
        'mép ' + k + ': đứng ' + o.sau + ' giây → sóng phủ dải ' + sau + ' điểm ảnh, báo trước ' + o.bao + ' giây (từ sát mép đi ra mất ' + ra.toFixed(2) + ' giây), giữa sân không trúng');
    }
    dat(!s3.giua && !s3.phai, 'đứng giữa sân hoặc sát mép phải (chỗ cái đầu) 6 giây: không có sóng bờ');

    // ---------- 4. đổi hệ theo pha ----------
    console.log('4. Đổi hệ theo pha');
    const PHA = () => {
      const H = G.__tl; H.bat();
      const W = H.vao(), b = W.boss, out = [];
      out.push([b.phase, b.el, b.weak.join(), b.layers[0].el]);
      for (const f of [0.6, 0.3]) {
        b.hp = b.maxhp * f; G.sim(2);
        out.push([b.phase, b.el, b.weak.join(), b.layers[0].el, (W.banner && W.banner.s) || '']);
        for (let i = 0; i < 400 && b.invuln > 0; i++) G.sim(1);
      }
      // chiêu pha 3 vẫn chạy (pha 2, 3 mượn thêm c4 / c5 của Ngư Tinh tới phiên 3C)
      W.P.x = W.x0 + 10; W.P.y = (W.y0 + W.y1) / 2; // đứng xa đầu (không thêm Đớp)
      const chon = [0, 1, 2].map((p) => G.bossSK.thuong.chon(b, p).join());
      H.tha();
      return { rows: out, chon };
    };
    const PA = await A.goi(PHA), pB = (await B.goi(PHA)).rows, pA = PA.rows;
    dat(pA[0][1] === 'poison' && pA[1][1] === 'ice' && pA[2][1] === 'fire', 'hệ theo pha: ' + pA.map((x) => x[1]).join(' → '));
    dat(pA[0][2] === 'fire' && pA[1][2] === 'poison' && pA[2][2] === 'ice', 'điểm yếu theo pha: ' + pA.map((x) => x[2]).join(' → ') + ' (sao thứ ba pha 3: kết liễu bằng Băng)');
    dat(/đánh bằng Độc/.test(pA[1][4]) && /đánh bằng Băng/.test(pA[2][4]), 'đổi pha: dòng nhắc đổi vũ khí ("' + pA[1][4] + '")');
    dat(PA.chon.join(' | ') === 'c1,c2,c3 | c1,c2,c3,n1,n2,c4 | c1,c2,c3,n1,n2,c4,c5', 'chọn chiêu theo pha (pha 2, 3: thêm chiêu tạm của Ngư Tinh, phiên 3C thay): ' + PA.chon.join(' | '));
    dat(pB.every((x) => x[1] === 'poison' && x[2] === 'fire'), '?tldoihe=0: Độc suốt trận, yếu Lửa suốt trận');
    const gop = await A.goi(() => {
      const H = G.__tl; H.bat();
      const W = H.vao({ stats: { poison: 900, fire: 0, ice: 0, none: 10 } }), b = W.boss;
      const r = b.layers.filter((l) => l.type === 'resist').map((l) => [l.el, +l.pct.toFixed(3), !!l.he]);
      H.tha();
      return { r, weak: b.weak };
    });
    dat(gop.r.length === 1 && gop.r[0][0] === 'poison' && gop.r[0][1] > 0.4 && gop.r[0][2], 'trùng lớp thích nghi "Kháng Độc": gộp một thẻ, kháng ' + Math.round(gop.r[0][1] * 100) + '%');

    // ---------- 5. bot hạ Thuồng Luồng ----------
    console.log('5. Bot bất tử hạ Thuồng Luồng');
    const s5 = await A.goi(() => {
      const H = G.__tl; H.bat();
      G.testSave({ lvl: 40, sharpen: 15, branch: 'fire', marksMoi: 5000 });
      const s = G.save; for (let rr = 0; rr < 3; rr++) for (let ii = 0; ii < 5; ii++) s.stars[rr + '-' + ii] = 3;
      for (let ii = 0; ii < 4; ii++) s.stars['3-' + ii] = 1;
      G.startStage(3, 4, 0); G.testGoto('boss');
      const S = G.getRun(), W = S.W, b = W.boss, ten = new Set();
      const o0 = G.sim;
      let maxL = 0, bad = 0;
      for (let i = 0; i < 600 && !S.won; i++) {
        G.botRun ? G.botRun(1) : G.sim(30);
        if (b.skillName) ten.add(b.skillName);
        if (!(W.P.x >= W.x0 - 0.01 && W.P.x <= W.x1 + 0.01 && W.P.y >= W.y0 - 0.01 && W.P.y <= W.y1 + 0.01)) maxL++;
        if (!isFinite(b.x + b.y + b.hp + W.P.x + W.P.y)) bad++;
      }
      void o0;
      const hoi = [W.x0, W.x1, W.y0, W.y1];
      for (let i = 0; i < 5; i++) G.sim(1);
      H.tha();
      return { won: S.won, ten: [...ten], ngoai: maxL, bad, hoi: [W.x0, W.x1, W.y0, W.y1], S: W.tlSan, sao: S.result && S.result.stars, hoi0: hoi };
    });
    dat(s5.won && !s5.bad, 'bot hạ Thuồng Luồng, không số NaN (chiêu đã thấy: ' + s5.ten.join(', ') + ')');
    dat(s5.ngoai === 0, 'em bé luôn trong bãi đá suốt trận');
    dat(s5.hoi[0] === s5.S.x0 && s5.hoi[1] === s5.S.x1 && s5.hoi[2] === s5.S.y0 && s5.hoi[3] === s5.S.y1, 'hạ xong: nước rút, trả lại sàn cũ (đi tới cửa / nhặt đồ được)');

    // ---------- 6. vẽ ----------
    console.log('6. Vẽ phòng trùm (VI + EN)');
    const s6 = await A.goi(() => {
      const H = G.__tl; H.bat();
      const loi = [];
      const warn0 = console.warn; let canhBao = 0; console.warn = function () { canhBao++; return warn0.apply(console, arguments); };
      const ve = (ten) => { try { G.noRender = false; G.drawWorld(3); G.time += 0.37; G.drawWorld(3); } catch (e) { loi.push(ten + ': ' + String(e && e.stack || e).slice(0, 300)); } };
      try {
        for (const lang of ['vi', 'en']) {
          G.ngonNgu.dat(lang, false);
          const W = H.vao(), b = W.boss;
          ve('dau');
          H.ra('c1', [W.x0 + 80, W.y0 + 4]); ve('duoi bao'); H.cho(70); ve('duoi quet');
          H.ra('c2', [W.x0 + 80, W.y0 + 70]); H.cho(60); ve('phun');
          H.ra('c3', [W.x0 + 80, W.y0 + 70]); H.cho(70); ve('vom'); H.cho(100); ve('vom siet');
          b.cd = 99; for (let i = 0; i < 100; i++) { W.P.x = W.x0 + 100; W.P.y = W.y0 + 6; b.cd = 99; G.sim(1); } ve('song bo');
          b.hp = b.maxhp * 0.6; G.sim(2); ve('pha 2'); b.hp = b.maxhp * 0.3; G.sim(2); ve('pha 3');
          W.safe = true; G.sim(2); ve('ha xong');
        }
        G.ngonNgu.dat('vi', false);
      } finally { console.warn = warn0; G.noRender = true; }
      const en = ['Quật đuôi', 'Phun nước đen', 'Vòng thân', 'Vỗ sóng bờ', 'Vảy dựng gai', 'Đớp', 'Hệ {0}: đánh bằng {1}!'].map((s) => [s, G.ngonNgu.D.get(s) || null]);
      H.tha();
      return { loi, canhBao, loiVe: G.thuongLuong.loiVe ? String(G.thuongLuong.loiVe) : null, roomErr: G.art.roomErr ? String(G.art.roomErr) : null, en, loiNgam: (globalThis.__loiNgam || []).length };
    });
    dat(!s6.loi.length && !s6.loiVe && !s6.roomErr, 'vẽ mọi lúc (báo đuôi, quét, phun, vòm, siết, sóng bờ, pha 2, 3, hạ xong) VI + EN không lỗi' + (s6.loi.length ? ': ' + s6.loi[0] : s6.loiVe ? ': ' + s6.loiVe : ''));
    const thieu = s6.en.filter((x) => !x[1]);
    dat(!thieu.length, 'chữ mới có tiếng Anh' + (thieu.length ? ': thiếu ' + thieu.map((x) => x[0]).join(', ') : ''));
    const dich = await A.goi(() => { const o = []; G.ngonNgu.dat('en', false); for (const s of ['Quật đuôi', 'Phun nước đen', 'Vòng thân', 'Vỗ sóng bờ', 'Vảy dựng gai', 'Đớp']) o.push(G.tv(s)); o.push(G.t('Hệ {0}: đánh bằng {1}!', G.EL.ice.name, G.EL.poison.name)); G.ngonNgu.dat('vi', false); return o; });
    dat(dich.every((s) => /^[\x20-\x7e]+$/.test(s)), 'tên chiêu tiếng Anh: ' + dich.join(', '));

    // ---------- 7. cờ ----------
    console.log('7. Cờ quay lui');
    const c7 = await Cq.goi(() => {
      const H = G.__tl; H.bat();
      const W = H.vao(), b = W.boss;
      const o = { cung: G.bossSK.thuong === G.bossSK.ngu, tl: G.thuongLuong, san: !!W.tlSan, b: [W.x0, W.x1, W.y0, W.y1], g: W.geo.bounds, el: b.el, layers: b.layers.length };
      H.tha();
      return o;
    });
    dat(c7.cung && c7.tl === null && !c7.san && c7.b[0] === c7.g.x0 && c7.b[1] === c7.g.x1 && c7.layers === 0, '?tlrieng=0: chiêu Ngư Tinh, sân thường, không lớp hệ (như phiên 1)');
    const d7 = await D.goi(() => ({ tl: G.thuongLuong, sk: Object.keys(G.bossSK) }));
    dat(d7.tl === null && !d7.sk.includes('thuong'), '?vung4=0: không có Thuồng Luồng, tệp không làm gì');
    const ngam = await Promise.all([A, B, Cq, D].map((T) => T.goi(() => (globalThis.__loiNgam || []).slice(0, 2))));
    dat(ngam.every((x) => !x.length), 'không lỗi ngầm ở cả 4 bản' + (ngam.some((x) => x.length) ? ': ' + JSON.stringify(ngam) : ''));

    console.log('\nPASS — ' + soDat + ' điều kiện');
  } catch (e) {
    console.error(e.message || e);
    for (const T of [A, B, Cq, D]) { const l = T.loi(); if (l) console.error(l.slice(0, 1500)); }
    process.exitCode = 1;
  } finally { for (const T of [A, B, Cq, D]) T.dong(); }
})();
