#!/usr/bin/env node
// BƯỚC 3 — VÙNG 4 SÔNG SÂU, PHIÊN 3A: 2 tinh anh (Rái Cá Thủ Lĩnh, Cóc Tía Chúa) + trùm nhỏ Cá Trê Râu Roi
// (docs/review/ke-hoach-cai-thien/vung-4-3a/bao-cao.md). Ba bản game trong Node (tests/node_trang.js, ?cloud=0): thường, ?trumsong=0, ?vung4=0.
//   1. Bảng: G.MOB_ART vùng 4 (tinh anh, trùm nhỏ) = mã mới; ?trumsong=0 = mượn Hang biển như phiên 1; 3 vùng cũ giữ nguyên.
//   2. Khai báo: hình tạm (vung 'song', loại, con mượn, nhuộm), tên + mẹo + tên chiêu có tiếng Anh.
//   3. Rái Cá Thủ Lĩnh: lưới có vòng đỏ ≥ 1 giây; trúng thì mắc lưới (bé đứng yên dù đẩy cần), bấm Né giãy nhanh hơn, không lộn được;
//      nón đuốc báo trước tới sau lúc được thả + 0,9 giây → được thả rồi bước ngang là né; nổi giận gọi 2 Rái Cá con một lần.
//   4. Cóc Tía Chúa: lưỡi kéo bé về sát cóc; vòng dậm báo trước ≥ kéo + 0,9 giây → lăn ra là né; mưa bọt 6 bọt vòng quanh, đứng giữa không trúng;
//      nổi giận thêm bọt giữa.
//   5. Cá Trê: quất râu X (4 vạch, báo ≥ 0,7), pha 2 bánh xe nhiều đợt (mỗi đợt báo ≥ 0,45, nan lệch); phun bùn 3 vòng + vũng trơn làm chậm;
//      lặn bùn: ẩn (không nhắm / không trúng), gợn đuổi chậm hơn bé, vòng trồi báo ≥ 0,45, trồi lên lộ bụng (choáng); pha 2 lặn 2 lần;
//      chống mép: đứng sát mép > 1,5 giây → cột bùn dọc mép (báo ≥ 0,8), đứng giữa sân thì không.
//   6. Không đòn một phát chết: mọi vùng / đòn của 3 con ở Sức mạnh khuyên dùng < máu tối đa của bé.
//   7. Bot (bất tử) qua 4-3, 4-4 (gặp tinh anh, trùm nhỏ mới) không NaN; ?trumsong=0 chạy với con mượn.
//   8. Vẽ: 3 mã mọi cử động; Cá Trê pha 2 đổi màu nhuộm; không lỗi ngầm.
// Chạy: node game/tests/trum_song.test.js
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
const MA3 = ['raiCaChua', 'cocChua', 'caTre'];

const LIB = `(() => {
  const T = (window.TQ = {});
  T.bot = G.botInput;
  T.vao = function (o) {
    G.testSave({ lvl: o.lvl || 30, sharpen: o.sharpen || 6 });
    const s = G.save; for (let r = 0; r < 3; r++) for (let i = 0; i < 5; i++) s.stars[r + '-' + i] = 3;
    G.rnd = G.srand(o.seed || 7);
    T.inp = { mx: 0, my: 0 };
    G.botInput = () => Object.assign({}, T.inp);
    G.startStage(3, o.ai == null ? 1 : o.ai, 0);
    const S = G.getRun(), W = G.getWorld(), P = S.P;
    W.waves = []; W.spawns = []; W.ents.length = 0; W.zones.length = 0; W.projs.length = 0; W.props = W.props.filter((p) => p.type === 'roomFore'); W.banner = null; S.hint = null;
    W.song = null; // bỏ dải dòng chảy / vũng của js/song_luat.js (đo riêng chiêu)
    if (P.mv) { P.mv.tips = { sword: 1, bow: 1, spear: 1, hammer: 1 }; P.mv.tipWait = null; }
    const cx = (W.x0 + W.x1) / 2, cy = (W.y0 + W.y1) / 2;
    P.x = cx + (o.px || 0); P.y = cy + (o.py || 0); P.inv = 0; P.hp = P.maxhp; P.face = 1;
    T.S = S; T.W = W; T.P = P; T.cx = cx; T.cy = cy;
    return { cx, cy, x0: W.x0, x1: W.x1, y0: W.y0, y1: W.y1 };
  };
  T.tinhAnh = function (o) {
    const r = T.vao(o), W = T.W;
    const e = G.spawnEnemy('elite', T.cx + (o.ex == null ? 70 : o.ex), T.cy + (o.ey || 0), { art: o.art, trait: o.trait || 'giap' });
    e.spawnT = 0; e.cd = 9; e.skCd = 0.05; e.an = { n: 'idle', t: 0, spd: 1 };
    T.e = e; W.banner = null;
    return Object.assign(r, { art: e.art, ten: e.knTen });
  };
  T.tre = function (o) {
    const r = T.vao(o), W = T.W;
    const b = G.makeBoss('mini', { name: 'Cá Trê', layers: [] });
    b.x = T.cx + (o.ex == null ? 70 : o.ex); b.y = T.cy + (o.ey || 0); b.invuln = 0; b.busy = 0; b.intro = 0; b.cd = 0.1; b.an = { n: 'idle', t: 0, spd: 1 };
    if (o.ph) { b.hp = b.maxhp * 0.45; }
    if (o.dbg) b.dbg = o.dbg;
    T.e = b; W.banner = null;
    return Object.assign(r, { art: b.art });
  };
  // chạy n giây: ghi vùng mới của con đang đo (src) — báo trước t0, hình, tên chiêu; đòn trúng bé; theo(e, P, W, ghi) mỗi khung
  T.chay = function (giay, o) {
    o = o || {};
    const W = T.W, P = T.P, e = T.e, ghi = { trung: 0, mau: 0, maxHit: 0, el: {}, bad: [], vung: [] }, da = new Set();
    const h0 = G.hurtPlayer;
    G.hurtPlayer = function (amt, el, src) { const hp = P.hp, r = h0.apply(this, arguments); const s2 = src && src.src ? src.src : src; if (r && (s2 === e || (!s2 && W.boss === e))) { ghi.trung++; ghi.mau += hp - P.hp; ghi.maxHit = Math.max(ghi.maxHit, hp - P.hp); ghi.el[el || '-'] = 1; } return r; };
    try {
      for (let f = 0; f < Math.round(giay * 60); f++) {
        if (o.giuMau) { P.hp = P.maxhp; P.dead = false; W.over = null; }
        if (o.moiKhung) o.moiKhung(f / 60, e, P, W, ghi);
        G.sim(1);
        for (const z of W.zones) if (!da.has(z)) { da.add(z); if (z.src === e && !z.ct && !z.pool) ghi.vung.push({ t0: +(z.t0 || 0).toFixed(3), shape: z.shape, skill: z.skill || null, f: f / 60, dmg: z.dmg, x: z.x, y: z.y, r: z.r, ang: z.ang, len: z.len }); }
        if (!isFinite(e.x) || !isFinite(e.y) || !isFinite(e.hp) || !isFinite(P.x) || !isFinite(P.y)) { ghi.bad.push('NaN f' + f); break; }
        if (o.theo) o.theo(e, P, W, ghi, f / 60);
      }
    } finally { G.hurtPlayer = h0; }
    const bt = ghi.vung.filter((v) => v.t0 > 0).map((v) => v.t0);
    ghi.baoMin = bt.length ? Math.min.apply(null, bt) : null;
    return ghi;
  };
})()`;

(async () => {
  const A = moTrang(''), B = moTrang('trumsong=0'), C = moTrang('vung4=0');
  try {
    for (const X of [A, B, C]) await X.goi(LIB);

    // ---------- 1. bảng ----------
    console.log('1. G.MOB_ART vùng 4, cờ quay lui');
    const bang = (X) => X.goi(() => ({ elite: G.MOB_ART.elite.map((x) => x.slice()), mini: G.MOB_ART.mini.slice(), reg: G.REGIONS.length, flag: G.TRUM_SONG }));
    const ba = await bang(A), bb = await bang(B), bc = await bang(C);
    dat(JSON.stringify(ba.elite[3]) === '["raiCaChua","cocChua"]' && ba.mini[3] === 'caTre', 'bản thường: tinh anh vùng 4 = Rái Cá Thủ Lĩnh, Cóc Tía Chúa; trùm nhỏ = Cá Trê');
    dat(JSON.stringify(bb.elite[3]) === '["cuaTuong","caNocChua"]' && bb.mini[3] === 'cuaDa' && bb.flag === false, '?trumsong=0: mượn Hang biển như phiên 1');
    dat(bc.reg === 3 && bc.elite.length === 3 && bc.mini.length === 3, '?vung4=0: 3 vùng, không phần tử thừa');
    dat(JSON.stringify(ba.elite.slice(0, 3)) === JSON.stringify(bc.elite) && JSON.stringify(ba.mini.slice(0, 3)) === JSON.stringify(bc.mini), '3 vùng cũ: tinh anh / trùm nhỏ giữ nguyên');

    // ---------- 2. khai báo ----------
    console.log('2. Hình tạm, tên, tiếng Anh');
    const kb = await A.goi((ma) => {
      const M = G.monsterArt, D = M._defs, en = true;
      const tr = (s) => { G.ngonNgu.dat('en', false); let v; try { v = G.tv(s); } finally { G.ngonNgu.dat('vi', false); } return /[ăâđêôơưáàảãạ]/i.test(v || '') ? null : v; };
      return { d: ma.map((k) => [k, !!D[k], D[k] && D[k].vung, D[k] && D[k].loai, D[k] && D[k].ten, M.hinhTam[k] && M.hinhTam[k].muon, M.hinhTam[k] && M.hinhTam[k].loc.length]),
        ten: ma.map((k) => [D[k].ten, tr(D[k].ten)]), chieu: Object.values(G.chieuTrum.TEN3A).map((s) => [s, tr(s)]),
        meo: Object.values(G.chieuTrum.MEO3A).map((s) => [s, tr(s)]), txt: ['Mắc lưới! Bấm Né để giãy', 'Lộ bụng!', 'Gọi đàn!', 'Bị kéo!'].map((s) => [s, tr(s)]), en: !!en };
    }, MA3);
    dat(kb.d.every((x) => x[1] && x[2] === 'song' && x[5] && x[6] > 0) && kb.d[0][3] === 'tinhanh' && kb.d[1][3] === 'tinhanh' && kb.d[2][3] === 'trumnho',
      'hình tạm: ' + kb.d.map((x) => x[0] + ' ← ' + x[5] + ' (' + x[3] + ')').join(', '));
    const thieu = [].concat(kb.ten, kb.chieu, kb.meo, kb.txt).filter((x) => !x[1] || x[1] === x[0]);
    dat(!thieu.length, 'tên, tên chiêu, mẹo, chữ trên đầu đều có tiếng Anh' + (thieu.length ? ': thiếu ' + thieu.map((x) => x[0]).join(' | ') : ' (' + [].concat(kb.ten, kb.chieu, kb.meo, kb.txt).length + ' câu)'));

    // ---------- 3. Rái Cá Thủ Lĩnh ----------
    console.log('3. Rái Cá Thủ Lĩnh — lưới chài, đuốc');
    const rc = await A.goi(() => {
      const r0 = TQ.tinhAnh({ art: 'raiCaChua', ex: 60 });
      let luoi = 0, x0 = null, giuYen = true, tha = null, duocT0 = null, luoiLuc = null;
      const g = TQ.chay(4, { giuMau: true, moiKhung: (t, e, P) => { if (P.luoiT > 0) TQ.inp = { mx: 1, my: 0 }; else TQ.inp = { mx: 0, my: 0 }; },
        theo: (e, P, W, ghi, t) => {
          if (P.luoiT > 0) { if (x0 == null) { x0 = [P.x, P.y]; luoiLuc = P.luoiT; } else if (Math.hypot(P.x - x0[0], P.y - x0[1]) > 0.5) giuYen = false; luoi = Math.max(luoi, P.luoiT); }
          else if (x0 && tha == null) tha = t;
          for (const z of W.zones) if (z.src === e && z.skill === 'Quét đuốc' && duocT0 == null) duocT0 = { t0: z.t0, luc: t, luoiCon: P.luoiT };
        } });
      // giãy: bấm Né liên tục lúc mắc lưới
      TQ.tinhAnh({ art: 'raiCaChua', ex: 60, seed: 7 });
      let giayT = null, x1 = null, lon = 0;
      const g2 = TQ.chay(4, { giuMau: true, moiKhung: (t, e, P) => { TQ.inp = { mx: 0, my: 0, dodgeP: P.luoiT > 0 && Math.floor(t * 60) % 6 === 0 }; },
        theo: (e, P, W, ghi, t) => { if (P.luoiT > 0) { if (giayT == null) { giayT = t; x1 = [P.x, P.y]; } if (Math.hypot(P.x - x1[0], P.y - x1[1]) > 0.5) lon++; } else if (giayT != null && giayT >= 0 && !TQ.ra) TQ.ra = t - giayT; } });
      const ra = TQ.ra; TQ.ra = null;
      // né: được thả thì bước ngang khỏi nón (vuông góc hướng tới tinh anh)
      TQ.tinhAnh({ art: 'raiCaChua', ex: 60, seed: 7 });
      let trungDuoc = 0;
      const h0 = G.hurtPlayer;
      const g3 = TQ.chay(4, { giuMau: true, moiKhung: (t, e, P) => { const daLuoi = TQ.daLuoi || P.luoiT > 0; TQ.daLuoi = daLuoi; TQ.inp = daLuoi && !(P.luoiT > 0) ? { mx: 0, my: 1 } : { mx: 0, my: 0 }; },
        theo: (e, P, W, ghi) => { ghi.duoc = ghi.vung.filter((v) => v.skill === 'Quét đuốc').length; } });
      TQ.daLuoi = false;
      // nổi giận: gọi 2 Rái Cá con một lần
      TQ.tinhAnh({ art: 'raiCaChua', ex: 60, seed: 3 });
      TQ.e.hp = TQ.e.maxhp * 0.3;
      let con = 0;
      TQ.chay(16, { giuMau: true, theo: (e, P, W) => { con = Math.max(con, W.ents.filter((x) => x.sum === e && !x.dead).length + (W.spawns || []).filter((s) => s.opt && s.opt.sumBy === e).length); e.hp = Math.max(e.hp, 1); } });
      const conArt = TQ.W.ents.filter((x) => x.sum === TQ.e).map((x) => x.art);
      return { ten: r0.ten, g: { trung: g.trung, baoMin: g.baoMin, vung: g.vung.map((v) => v.skill + ':' + v.t0), bad: g.bad }, luoi, luoiLuc, giuYen, tha, duocT0, g2: { ra, lon, giayT }, g3: { trung: g3.trung, vung: g3.vung.map((v) => v.skill), el: g3.el }, con, conArt };
    });
    dat(rc.ten === 'Rái Cá Thủ Lĩnh' && !rc.g.bad.length && rc.g.vung.some((v) => /^Quăng lưới chài:/.test(v)) && rc.g.vung.some((v) => /^Quét đuốc:/.test(v)), 'ra chiêu lưới rồi đuốc, không NaN (' + rc.g.vung.join(', ') + ')');
    dat(rc.g.baoMin >= 0.6 && +rc.g.vung.find((v) => /^Quăng/.test(v)).split(':')[1] >= 0.99, 'lưới báo trước ≥ 1 giây, mọi vùng ≥ 0,6 giây (nhỏ nhất ' + rc.g.baoMin + ')');
    dat(rc.luoiLuc >= 0.99 && rc.giuYen, 'bé đứng yên trúng lưới: mắc lưới ' + rc.luoiLuc.toFixed(2) + ' giây, đẩy cần cũng không đi được');
    dat(rc.duocT0 && rc.duocT0.t0 >= rc.duocT0.luoiCon + 0.89, 'nón đuốc báo trước ' + (rc.duocT0 && rc.duocT0.t0.toFixed(2)) + ' giây ≥ lưới còn ' + (rc.duocT0 && rc.duocT0.luoiCon.toFixed(2)) + ' + 0,9');
    dat(rc.g2.ra != null && rc.g2.ra < 0.75 && rc.g2.lon === 0, 'bấm Né liên tục: thoát lưới sau ' + (rc.g2.ra != null ? rc.g2.ra.toFixed(2) : '?') + ' giây (< 1), không lộn đi được lúc mắc lưới');
    dat(rc.g3.vung.includes('Quét đuốc') && rc.g3.trung === 1, 'được thả rồi bước ngang khỏi nón: chỉ trúng lưới, không trúng đuốc (trúng ' + rc.g3.trung + ')');
    dat(rc.con === 2 && rc.conArt.every((a) => a === 'raiCa'), 'nổi giận: gọi đúng 2 Rái Cá con một lần (' + rc.conArt.join(', ') + ')');

    // ---------- 4. Cóc Tía Chúa ----------
    console.log('4. Cóc Tía Chúa — lưỡi kéo, dậm lá sen, mưa bọt');
    const cc = await A.goi(() => {
      const ra = {};
      // lưỡi kéo: bé đứng yên cách 90
      TQ.tinhAnh({ art: 'cocChua', ex: 90 });
      TQ.e.cocLuot = 1; // lượt sau = lưỡi kéo
      let gan = 1e9, dap = null, keoLuc = null;
      const g = TQ.chay(3, { giuMau: true, theo: (e, P, W, ghi, t) => {
        const d = Math.hypot(P.x - e.x, P.y - e.y); if (ghi.vung.some((v) => v.skill === 'Lưỡi kéo') && ghi.trung > 0) gan = Math.min(gan, d);
        if (ghi.trung > 0 && keoLuc == null) keoLuc = t;
        if (dap == null) { const z = W.zones.find((z) => z.src === e && z.skill === 'Dậm lá sen'); if (z) dap = { t0: z.t0, r: z.r, luc: t }; }
      } });
      ra.keo = { gan, dap, keoLuc, trung: g.trung, vung: g.vung.map((v) => v.skill + ':' + v.t0) };
      // lăn ra sau khi bị kéo
      TQ.tinhAnh({ art: 'cocChua', ex: 90 }); TQ.e.cocLuot = 1;
      let lan = null;
      const g2 = TQ.chay(3, { giuMau: true, moiKhung: (t, e, P, W, ghi) => { const z = W.zones.find((z) => z.src === e && z.skill === 'Dậm lá sen'); TQ.inp = z && z.t < z.t0 - 0.3 && lan == null ? { mx: -1, my: 0, dodgeP: true } : z && z.t < z.t0 - 0.3 ? { mx: -1, my: 0 } : { mx: 0, my: 0 }; if (TQ.inp.dodgeP) lan = t; } });
      ra.lanRa = { trung: g2.trung, vung: g2.vung.map((v) => v.skill) };
      // mưa bọt: đứng yên giữa vòng
      TQ.tinhAnh({ art: 'cocChua', ex: 90 }); TQ.e.cocLuot = 0; // lượt sau = mưa bọt
      const g3 = TQ.chay(3, { giuMau: true });
      const bot = g3.vung.filter((v) => v.skill === 'Mưa bọt');
      ra.bot = { n: bot.length, trung: g3.trung, baoMin: bot.length ? Math.min.apply(null, bot.map((v) => v.t0)) : null, xa: bot.map((v) => Math.hypot(v.x - TQ.cx, (v.y - TQ.cy) / G.ZK)).map((x) => Math.round(x)) };
      // nổi giận: thêm bọt giữa
      TQ.tinhAnh({ art: 'cocChua', ex: 90 }); TQ.e.cocLuot = 0; TQ.e.hp = TQ.e.maxhp * 0.3;
      const g4 = TQ.chay(3, { giuMau: true, theo: (e) => { e.hp = Math.max(e.hp, 1); } });
      const b4 = g4.vung.filter((v) => v.skill === 'Mưa bọt');
      ra.gian = { n: b4.length, trung: g4.trung, baoMin: b4.length ? Math.min.apply(null, b4.map((v) => v.t0)) : null };
      return ra;
    });
    dat(cc.keo.trung >= 1 && cc.keo.gan < 34, 'lưỡi trúng bé đứng cách 90: bị kéo về sát cóc (còn cách ' + Math.round(cc.keo.gan) + ')');
    dat(cc.keo.dap && cc.keo.dap.t0 >= 0.9 + 0.25 - 0.01 && cc.keo.dap.r > cc.keo.gan + 10, 'vòng dậm lá sen báo trước ' + (cc.keo.dap && cc.keo.dap.t0.toFixed(2)) + ' giây (≥ kéo 0,25 + 0,9), bán kính ' + (cc.keo.dap && cc.keo.dap.r));
    dat(cc.lanRa.trung === 1, 'bị kéo rồi lăn ra ngoài: chỉ trúng lưỡi, không trúng dậm (trúng ' + cc.lanRa.trung + ')');
    dat(cc.bot.n === 6 && cc.bot.trung === 0 && cc.bot.baoMin >= 0.99 && cc.bot.xa.every((x) => x >= 40), 'mưa bọt: 6 bọt thành vòng quanh bé (cách ' + cc.bot.xa.join('/') + '), báo trước ≥ 1 giây, đứng yên giữa vòng không trúng');
    dat(cc.gian.n === 7 && cc.gian.trung >= 1 && cc.gian.baoMin >= 0.99, 'nổi giận: thêm bọt rơi giữa vòng (7 bọt), đứng yên thì trúng');

    // ---------- 5. Cá Trê ----------
    console.log('5. Cá Trê Râu Roi — quất râu, phun bùn, lặn bùn, chống mép');
    const ct = await A.goi(() => {
      const ra = {};
      // quất râu pha 1: bé đứng giữa hai vạch (thẳng hướng tới trùm) → không trúng; đứng trên vạch chéo → trúng
      TQ.tre({ ex: 50, dbg: 'chieu1' });
      const g1 = TQ.chay(2, { giuMau: true });
      const rau = g1.vung.filter((v) => v.skill === 'Quất râu');
      ra.rau = { n: rau.length, baoMin: rau.length ? Math.min.apply(null, rau.map((v) => v.t0)) : null, trung: g1.trung, ten: TQ.e.art, gocs: rau.map((v) => Math.round(((v.ang * 180 / Math.PI) % 360 + 360) % 360)) };
      // pha 2 bánh xe
      TQ.tre({ ex: 50, dbg: 'chieu1', ph: true });
      const g2 = TQ.chay(3.5, { giuMau: true });
      const xo = g2.vung.filter((v) => v.skill === 'Quất râu xoay');
      const dot = {}; for (const v of xo) { const k = Math.round(v.f * 10) / 10; dot[k] = (dot[k] || 0) + 1; }
      ra.xoay = { n: xo.length, baoMin: xo.length ? Math.min.apply(null, xo.map((v) => v.t0)) : null, dot: Object.keys(dot).length, gocs: Array.from(new Set(xo.map((v) => Math.round(((v.ang * 180 / Math.PI) % 360 + 360) % 360)))).length };
      // phun bùn: 3 vòng; đứng trong vũng thì chậm
      TQ.tre({ ex: 90, dbg: 'atk' });
      let cham = 0;
      const g3 = TQ.chay(3, { giuMau: true, theo: (e, P) => { if (P.knCham > 0) cham++; } });
      const bun = g3.vung.filter((v) => v.skill === 'Phun bùn');
      ra.bun = { n: bun.length, baoMin: bun.length ? Math.min.apply(null, bun.map((v) => v.t0)) : null, cham, trung: g3.trung };
      // lặn bùn pha 1: bé chạy vòng — gợn đuổi chậm hơn bé
      TQ.tre({ ex: 80, dbg: 'chieu2' });
      let an = 0, nham = 0, toiDa = 0, lo = 0, giuX = null, dTB = [];
      const g4 = TQ.chay(5, { giuMau: true, moiKhung: () => { TQ.inp = { mx: 0, my: 0 }; },
        theo: (e, P, W) => { if (e.hidden) { an++; if (G.targets().includes(e)) nham++; } if (e.st && e.st.stun > 0 && e.exposed > 0) lo++; } });
      const ln = g4.vung.filter((v) => v.skill === 'Lặn bùn');
      ra.lan = { an: an / 60, nham, n: ln.length, baoMin: ln.length ? Math.min.apply(null, ln.map((v) => v.t0)) : null, lo: lo / 60, trung: g4.trung, hidden: TQ.e.hidden };
      // gợn đuổi theo bé chạy thẳng: khoảng cách không giảm
      TQ.tre({ ex: 40, dbg: 'chieu2' });
      let d0 = null, d1 = null;
      TQ.chay(1.8, { giuMau: true, moiKhung: () => { TQ.inp = { mx: -1, my: 0 }; }, theo: (e, P, W, ghi, t) => { if (e.hidden && d0 == null) d0 = Math.hypot(P.x - e.x, P.y - e.y); if (e.hidden && P.x > W.x0 + 12) d1 = Math.hypot(P.x - e.x, P.y - e.y); } });
      ra.duoi = { d0, d1 };
      // pha 2: lặn 2 lần
      TQ.tre({ ex: 80, dbg: 'chieu2', ph: true });
      let lanLan = 0, truoc = false;
      const g5 = TQ.chay(7, { giuMau: true, theo: (e) => { if (e.hidden && !truoc) lanLan++; truoc = !!e.hidden; } });
      ra.lan2 = { lanLan, vung: g5.vung.filter((v) => v.skill === 'Lặn bùn').length };
      // chống mép: đứng sát mép trái 3 giây
      const r6 = TQ.tre({ ex: 60, px: -1000 });
      TQ.P.x = TQ.W.x0 + 18;
      TQ.e.cd = 99;
      const g6 = TQ.chay(2.6, { giuMau: true, theo: (e) => { e.cd = 99; } });
      const mep = g6.vung.filter((v) => v.skill === 'Bùn phụt');
      ra.mep = { n: mep.length, baoMin: mep.length ? Math.min.apply(null, mep.map((v) => v.t0)) : null, luc: mep.length ? mep[0].f : null, xs: mep.map((v) => Math.round(v.x - r6.x0)), trung: g6.trung };
      // đứng giữa sân: không có bùn phụt
      TQ.tre({ ex: 60, px: -40 });
      const g7 = TQ.chay(3, { giuMau: true, theo: (e) => { e.cd = 99; } });
      ra.giua = g7.vung.filter((v) => v.skill === 'Bùn phụt').length;
      // đứng sát mép rồi bước vào trong khi thấy vòng → né được
      TQ.tre({ ex: 60 }); TQ.P.x = TQ.W.x0 + 18;
      const g8 = TQ.chay(3, { giuMau: true, moiKhung: (t, e, P, W) => { e.cd = 99; const z = W.zones.find((z) => z.src === e && z.skill === 'Bùn phụt' && z.t > 0); TQ.inp = z && z.t < z.t0 - 0.2 ? { mx: 1, my: 0 } : { mx: 0, my: 0 }; } });
      ra.neMep = g8.trung;
      return ra;
    });
    dat(ct.rau.ten === 'caTre' && ct.rau.n === 4 && ct.rau.baoMin >= 0.69 && ct.rau.trung === 0, 'quất râu pha 1: 4 vạch chữ X (' + ct.rau.gocs.join('°, ') + '°) báo ' + ct.rau.baoMin + ' giây; bé đứng thẳng hướng (giữa hai vạch) không trúng');
    dat(ct.xoay.n >= 12 && ct.xoay.dot >= 3 && ct.xoay.gocs >= 12 && ct.xoay.baoMin >= 0.45, 'pha 2 bánh xe: ' + ct.xoay.n + ' nan, ' + ct.xoay.dot + ' đợt, ' + ct.xoay.gocs + ' góc khác nhau (nan quay), báo ≥ ' + ct.xoay.baoMin);
    dat(ct.bun.n === 3 && ct.bun.baoMin >= 0.6 && ct.bun.cham > 0, 'phun bùn: 3 vòng báo ' + ct.bun.baoMin + ' giây, vũng bùn làm bé đứng trong đi chậm (' + ct.bun.cham + ' khung)');
    dat(ct.lan.an >= 1.5 && ct.lan.nham === 0 && ct.lan.n === 1 && ct.lan.baoMin >= 0.45 && ct.lan.lo >= 1.0 && !ct.lan.hidden, 'lặn bùn: ẩn ' + ct.lan.an.toFixed(2) + ' giây (không nhắm được), vòng trồi báo ' + ct.lan.baoMin + ', trồi lên lộ bụng ' + ct.lan.lo.toFixed(2) + ' giây');
    dat(ct.duoi.d0 != null && ct.duoi.d1 != null && ct.duoi.d1 >= ct.duoi.d0 - 2, 'gợn bùn đuổi chậm hơn bé chạy: cách ' + Math.round(ct.duoi.d0) + ' → ' + Math.round(ct.duoi.d1));
    dat(ct.lan2.lanLan === 2 && ct.lan2.vung === 2, 'pha 2: lặn 2 lần liền (2 vòng trồi)');
    dat(ct.mep.n >= 4 && ct.mep.baoMin >= 0.79 && ct.mep.luc >= 1.45 && ct.mep.xs.every((x) => x < 40), 'chống mép: đứng sát mép ' + ct.mep.luc.toFixed(2) + ' giây → ' + ct.mep.n + ' cột bùn dọc mép (x ' + ct.mep.xs.join('/') + '), báo ' + ct.mep.baoMin);
    dat(ct.giua === 0, 'đứng giữa sân: không có bùn phụt');
    dat(ct.neMep === 0, 'thấy cột bùn thì bước vào trong: không trúng');

    // ---------- 6. không đòn một phát chết ----------
    console.log('6. Không đòn một phát chết ở Sức mạnh khuyên dùng (bé đủ máu; ngưỡng kiểm 85%)');
    const mot = await A.goi((ma) => {
      const kq = {};
      for (let i = 0; i < 5; i++) {
        G.testSave({ lvl: 30, sharpen: 6 });
        const s = G.save; for (let r = 0; r < 3; r++) for (let k = 0; k < 5; k++) s.stars[r + '-' + k] = 3;
        const hs = s.heroes[s.hero], rec = G.STAGE_REC[15 + i];
        while (G.power() < rec && hs.lvl < G.MAX_LEVEL) hs.lvl++;
        G.startStage(3, i, 0);
        const W = G.getWorld(), P = W.P;
        // đòn mạnh nhất của mỗi con: sát thương gốc × hệ số lớn nhất của các chiêu, qua giáp của bé (hurtPlayer thật, bé đứng yên, không bất tử)
        const S3 = G.chieuTrum.S3A, maxK = { raiCaChua: Math.max(S3.raiCaLuoi.nonSat, S3.raiCaLuoi.sat), cocChua: Math.max(S3.cocLuoi.dapSat, S3.cocBot.sat, S3.cocLuoi.sat), caTre: Math.max(S3.caTreLan.sat, S3.caTreRau.sat, S3.caTreBun.sat, S3.caTreMep.sat) };
        const r = {};
        for (const k of ma) {
          if (k === 'caTre' && i === 4) continue; // ải 4-5: trùm vùng, không có trùm nhỏ
          let dmg;
          if (k === 'caTre') { W.ents.length = 0; const b = G.makeBoss('mini', { name: 'x', layers: [] }); dmg = b.dmg; W.boss = null; }
          else { const e = G.spawnEnemy('elite', P.x + 60, P.y, { art: k, trait: 'giap' }); dmg = e.dmg; e.dead = true; }
          P.hp = P.maxhp; P.inv = 0; P.dead = false; W.over = null;
          const hp0 = P.hp; G.hurtPlayer(dmg * maxK[k], 'fire', null, false);
          r[k] = +((hp0 - P.hp) / P.maxhp).toFixed(3);
        }
        kq['4-' + (i + 1)] = { pw: Math.round(G.power()), rec, maxhp: P.maxhp, r };
      }
      return kq;
    }, MA3);
    const maxF = Math.max.apply(null, Object.values(mot).map((o) => Math.max.apply(null, Object.values(o.r))));
    dat(maxF < 0.85, 'đòn mạnh nhất của 3 con ở khuyên dùng: tối đa ' + Math.round(maxF * 100) + '% máu (' + Object.entries(mot).map(([k, o]) => k + ' ' + Object.entries(o.r).map(([a, v]) => a + ' ' + Math.round(v * 100) + '%').join('/')).join('; ') + ')');

    // ---------- 7. cả ải bằng bot ----------
    console.log('7. Bot (bất tử) qua ải có tinh anh / trùm nhỏ mới');
    const ai = (X, i, seed) => X.goi(([i, seed]) => {
      G.botInput = TQ.bot;
      G.testSave({ lvl: 40, sharpen: 15, branch: 'fire', marksMoi: 5000 });
      const s = G.save; for (let r = 0; r < 3; r++) for (let ii = 0; ii < 5; ii++) s.stars[r + '-' + ii] = 3; for (let ii = 0; ii < i; ii++) s.stars['3-' + ii] = 1;
      G.rnd = G.srand(seed);
      const h0 = G.hurtPlayer, gap = {}; G.hurtPlayer = function () { return false; };
      const sp0 = G.spawnEnemy; G.spawnEnemy = function () { const e = sp0.apply(this, arguments); gap[e.art] = (gap[e.art] || 0) + 1; return e; };
      const mb0 = G.makeBoss; G.makeBoss = function () { const b = mb0.apply(this, arguments); gap[b.art] = (gap[b.art] || 0) + 1; return b; };
      let out, loi = null;
      try { G.startStage(3, i, 0); out = G.probeRun(600); } catch (e) { loi = String(e && e.stack || e); } finally { G.hurtPlayer = h0; G.spawnEnemy = sp0; G.makeBoss = mb0; }
      return { loi, win: out && out.win, bad: out ? out.bad : ['?'], t: out && out.t, gap, bossT: out && out.bossT };
    }, [i, seed]);
    let gapE = {};
    for (const [i, seed] of [[2, 11], [3, 12], [3, 21], [0, 13]]) {
      const r = await ai(A, i, seed);
      for (const k in r.gap) gapE[k] = (gapE[k] || 0) + r.gap[k];
      dat(!r.loi && r.win && !r.bad.length && r.gap.caTre === 1, 'ải 4-' + (i + 1) + ': qua ải, không NaN, gặp Cá Trê (' + r.t + ' giây, trùm nhỏ ' + r.bossT + ' giây; tinh anh: ' + ['raiCaChua', 'cocChua'].map((k) => k + '×' + (r.gap[k] || 0)).join(' ') + ')' + (r.loi ? ' — ' + r.loi : ''));
    }
    dat(gapE.raiCaChua > 0 && gapE.cocChua > 0, 'cả hai tinh anh mới đều ra trận (' + gapE.raiCaChua + ' / ' + gapE.cocChua + ')');
    const rb = await ai(B, 3, 12);
    dat(!rb.loi && rb.win && !MA3.some((k) => rb.gap[k]) && rb.gap.cuaDa === 1, '?trumsong=0: ải 4-4 chạy, không có con mới (Cua Đá mượn)');

    // ---------- 8. vẽ ----------
    console.log('8. Vẽ');
    const ve = await A.goi((ma) => {
      const M = G.monsterArt, loi = [];
      const cv = document.createElement('canvas'); cv.width = 160; cv.height = 160; const c = cv.getContext('2d');
      for (const k of ma) for (const an of ['idle', 'move', 'tele', 'atk', 'chieu1', 'chieu2', 'hit', 'die', 'spawn', 'stun']) for (const t of [0, 0.3]) for (const ph of [1, 2]) {
        if (!M._defs[k].anims[an]) continue;
        try { M.draw(c, k, 80, 130, { anim: an, t, face: t ? 1 : -1, bao: false, phase: ph }); } catch (e) { loi.push(k + ' ' + an + ': ' + e); }
      }
      const S2 = G.spriteCustom, g0 = S2.get, ghi = [];
      S2.get = (id) => (ma.some((k) => M.hinhTam[k].muon === id) ? { ready: true } : g0(id));
      try {
        for (const [k, ph] of [['raiCaChua', 1], ['caTre', 1], ['caTre', 2]]) {
          let fv = 'none', f = null;
          Object.defineProperty(c, 'filter', { configurable: true, get: () => fv, set: (v) => { fv = v; if (v !== 'none') f = v; } });
          M.draw(c, k, 64, 100, { anim: 'idle', t: 0, phase: ph }); ghi.push([k, ph, f, fv]);
          delete c.filter;
        }
      } catch (e) { loi.push('veTam: ' + e); } finally { S2.get = g0; }
      // vẽ trận: lưới, gợn bùn, vũng bùn, lưỡi (lớp sàn) không lỗi
      G.noRender = false;
      try {
        TQ.tre({ ex: 60, dbg: 'chieu2' }); TQ.chay(1.2, { giuMau: true });
        for (const z of TQ.W.zones) if (z.ct && z.ct.ve) z.ct.ve(c, z.ct);
        TQ.tre({ ex: 60, dbg: 'atk' }); TQ.chay(1.5, { giuMau: true });
        for (const z of TQ.W.zones) if (z.ct && z.ct.ve) z.ct.ve(c, z.ct);
        TQ.tinhAnh({ art: 'raiCaChua', ex: 60 }); TQ.chay(1.4, { giuMau: true });
        for (const z of TQ.W.zones) if (z.ct && z.ct.ve) z.ct.ve(c, z.ct);
        G.art.enemy(c, TQ.e);
      } catch (e) { loi.push('trận: ' + (e && e.stack || e)); } finally { G.noRender = true; }
      return { loi, ghi, css: [M.locCss(M.hinhTam.raiCaChua.loc), M.locCss(M.hinhTam.caTre.loc), M.locCss(M.hinhTam.caTre.locP2)] };
    }, MA3);
    dat(!ve.loi.length, '3 mã mọi cử động (pha 1, 2) + vật trên sàn vẽ không lỗi' + (ve.loi.length ? ': ' + ve.loi[0] : ''));
    dat(ve.ghi[0][2] === ve.css[0] && ve.ghi[1][2] === ve.css[1] && ve.ghi[2][2] === ve.css[2] && ve.ghi.every((g) => g[3] === 'none'), 'ảnh mượn nhuộm đúng màu, Cá Trê pha 2 ánh cam, trả filter cũ');

    for (const [ten, X] of [['A', A], ['B', B], ['C', C]]) {
      const l = X.loi().split('\n').filter((s) => /TypeError|ReferenceError|RangeError|is not a function|Cannot read/.test(s));
      dat(!l.length, 'không lỗi ngầm (bản ' + ten + ')' + (l.length ? ': ' + l.slice(0, 3).join(' | ') : ''));
    }
    console.log('\nPASS — ' + soDat + ' điều kiện');
  } catch (e) {
    console.error(e && e.stack || e);
    console.error('stderr A:', A.loi().slice(-2000));
    process.exitCode = 1;
  } finally { A.dong(); B.dong(); C.dong(); }
})();
