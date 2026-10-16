#!/usr/bin/env node
// BƯỚC 3 — VÙNG 4 SÔNG SÂU, PHIÊN 2A: 8 quái thường vùng 4 + kỹ năng riêng (docs/review/ke-hoach-cai-thien/vung-4-2a/bao-cao.md).
// Chạy ba bản game trong Node qua tests/node_trang.js (DOM / canvas giả, ?cloud=0, không trình duyệt): bản thường, ?quaisong=0, ?vung4=0.
//   1. Bảng: G.MOB_ART vùng 4 = 8 mã mới; ?quaisong=0 = mượn Hang biển như phiên 1; ?vung4=0 = 3 vùng; 3 vùng cũ giữ nguyên (mã, SO, MEO).
//   2. Khai báo: mỗi mã có hình (vung 'song', tên, hình tạm mượn), SO, MEO, tiếng Anh tên + mẹo.
//   3. Từng con một mình trong phòng (bé đứng yên): có ra đòn, có vùng đỏ báo trước ≥ báo trước của vai cũ (KN.CU), trúng được bé đứng yên,
//      không số NaN; và cơ chế riêng (Rái Cá đáp hụt thì ngẩn, Đỉa bám → chậm, lăn giũ ra, Ba Ba cổ duỗi không quay, Cóc nhảy lùi,
//      Rắn lặn (vô hình, không nhắm được) / sàn khô không lặn, Ếch chết sớm nổ trúng quái, Ma Da xoáy kéo, Trai khép vỏ chặn đòn trước).
//   4. Bé biết né (bot thật): đứng yên mất nhiều máu hơn hẳn né (đòn né được).
//   5. Cả ải 4-1 … 4-5 bằng bot (bất tử): quái mới ra trận, không NaN, không lỗi; ?quaisong=0 vẫn chạy.
//   6. Vẽ: G.monsterArt.draw 8 mã mọi cử động (hình code nhuộm), nhánh ảnh mượn + ctx.filter (KN.veTam) đặt / trả lại filter đúng.
// Chạy: node game/tests/quai_song.test.js
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

const MA8 = ['raiCa', 'diaTrau', 'baBa', 'cocTia', 'ranNuoc', 'echPhinh', 'maDa', 'traiGai'];
const VAI = ['rusher', 'swarm', 'shield', 'archer', 'nimble', 'kami', 'bomber', 'spiky'];

// Dựng phòng vùng 4 trống, một con quái `art` (vai `role`) ở (ex, ey), bé ở (px, py), bé đứng yên (không bấm gì).
const LIB = `(() => {
  const T = (window.TQ = {});
  T.bot = G.botInput; // bot thật (tests/bot.js)
  T.phong = function (o) {
    G.testSave({ lvl: 30, sharpen: 6 });
    const s = G.save; for (let r = 0; r < 3; r++) for (let i = 0; i < 5; i++) s.stars[r + '-' + i] = 3;
    G.rnd = G.srand(o.seed || 7);
    G.botInput = () => ({ mx: 0, my: 0 });
    G.startStage(3, 1, 0);
    const S = G.getRun(), W = G.getWorld(), P = S.P;
    W.waves = []; W.spawns = []; W.ents.length = 0; W.zones.length = 0; W.projs.length = 0; W.props = W.props.filter((p) => p.type === 'roomFore'); W.banner = null; S.hint = null;
    if (P.mv) { P.mv.tips = { sword: 1, bow: 1, spear: 1, hammer: 1 }; P.mv.tipWait = null; }
    const cx = (W.x0 + W.x1) / 2, cy = (W.y0 + W.y1) / 2;
    P.x = cx + (o.px || 0); P.y = cy + (o.py || 0); P.inv = 0; P.hp = P.maxhp; P.face = 1;
    const e = G.spawnEnemy(o.role, cx + (o.ex == null ? 90 : o.ex), cy + (o.ey || 0), { art: o.art });
    e.spawnT = 0; e.cd = 0.2; e.an = { n: 'idle', t: 0, spd: 1 };
    T.S = S; T.W = W; T.P = P; T.e = e;
    return { art: e.art, kn: !!e.kn, cx, cy };
  };
  // chạy n giây; ghi mọi vùng mới của con quái (báo trước), số lần bé mất máu do nó, cờ theo dõi mỗi khung (theo(e, P, W) → đối tượng gộp)
  T.chay = function (giay, o) {
    o = o || {};
    const W = T.W, P = T.P, e = T.e, bao = [], h0 = G.hurtPlayer, ghi = { trung: 0, mau: 0, el: {}, bad: [] }, da = new Set();
    G.hurtPlayer = function (amt, el, src) { const hp = P.hp, r = h0.apply(this, arguments); if (r && src === e || (r && src && src.src === e)) { ghi.trung++; ghi.mau += hp - P.hp; ghi.el[el || '-'] = 1; } return r; };
    try {
      for (let f = 0; f < Math.round(giay * 60); f++) {
        if (o.giuMau) { P.hp = P.maxhp; P.dead = false; W.over = null; }
        if (o.moiKhung) o.moiKhung(f / 60);
        G.sim(1);
        for (const z of W.zones) if (!da.has(z)) { da.add(z); if (z.src === e && z.t0 > 0 && !z.pool && z.shape !== 'kn') bao.push(+z.t0.toFixed(3)); }
        if (!isFinite(e.x) || !isFinite(e.y) || !isFinite(e.hp) || !isFinite(P.x) || !isFinite(P.y)) { ghi.bad.push('NaN f' + f); break; }
        if (o.theo) o.theo(e, P, W, ghi);
      }
    } finally { G.hurtPlayer = h0; }
    ghi.bao = bao; ghi.baoMin = bao.length ? Math.min.apply(null, bao) : null;
    return ghi;
  };
})()`;

(async () => {
  const A = moTrang(''), B = moTrang('quaisong=0'), C = moTrang('vung4=0');
  try {
    for (const X of [A, B, C]) await X.goi(LIB);

    // ---------- 1. bảng ----------
    console.log('1. G.MOB_ART vùng 4, cờ quay lui, 3 vùng cũ giữ nguyên');
    const bang = () => ({ art: G.MOB_ART, so: Object.keys(G.knQuai.SO), meo: G.knQuai.meo ? Object.keys(G.knQuai.SO).map((k) => G.knQuai.meo(k) && G.knQuai.meo(k)[1]) : [], q: G.QUAI_SONG, muon: G.VUNG4_MUON });
    const a = await A.goi(bang), b = await B.goi(bang), c = await C.goi(bang);
    dat(VAI.every((v, i) => a.art[v][3] === MA8[i]), 'bản thường: 8 vai vùng 4 = ' + MA8.join(', '));
    dat(a.art.elite[3].join() === 'raiCaChua,cocChua' && a.art.mini[3] === 'caTre' && a.muon === 1, 'tinh anh / trùm nhỏ vùng 4 riêng (phiên 3A, tests/trum_song.test.js); VUNG4_MUON giữ 1 (trùm vùng: phiên 3B)');
    dat(b.q === false && VAI.every((v) => b.art[v][3] === b.art[v][1]), '?quaisong=0: 8 vai vùng 4 mượn Hang biển như phiên 1');
    dat(VAI.every((v) => c.art[v].length === 3) && c.q === undefined, '?vung4=0: 3 vùng, không có mã mới');
    dat(VAI.every((v) => JSON.stringify(a.art[v].slice(0, 3)) === JSON.stringify(c.art[v])) && JSON.stringify(a.art.elite.slice(0, 3)) === JSON.stringify(c.art.elite), 'mã quái 3 vùng cũ giống hệt ?vung4=0');
    const boMoi = (ma8) => { const SO = Object.assign({}, G.knQuai.SO); for (const k of ma8) delete SO[k]; return JSON.stringify([SO, Object.keys(SO).map((k) => G.knQuai.meo(k)), G.knQuai.CU]); };
    const cu = await C.goi(boMoi, MA8), moi = await A.goi(boMoi, MA8);
    dat(cu === moi && JSON.parse(moi)[1].length === 24, 'số liệu SO + lời mẹo 24 con cũ + KN.CU: bản thường == ?vung4=0');

    // ---------- 2. khai báo ----------
    console.log('2. Hình, số liệu, mẹo, tiếng Anh');
    const kb = await A.goi((ma8) => {
      const M = G.monsterArt, out = {};
      for (const k of ma8) {
        const d = M._defs[k], it = M.list.find((x) => x.id === k), T = M.hinhTam[k];
        out[k] = { ten: d && d.ten, vung: d && d.vung, muon: T && T.muon, coMuon: !!(T && M._defs[T.muon]), w: it && it.w, h: it && it.h, cao: M.cao(k), so: !!G.knQuai.SO[k], meo: G.knQuai.meo(k), css: M.locCss(T.loc) };
      }
      G.ngonNgu.dat('en', false);
      const en = ma8.map((k) => [G.tv(M._defs[k].ten), G.tv(G.knQuai.meo(k)[1])]);
      G.ngonNgu.dat('vi', false);
      return { out, en, loi: M.loi.slice() };
    }, MA8);
    dat(!kb.loi.length, 'monster_art không lỗi' + (kb.loi.length ? ': ' + kb.loi[0] : ''));
    for (const k of MA8) { const o = kb.out[k]; dat(o.ten && o.vung === 'song' && o.coMuon && o.w > 10 && o.h > 10 && o.cao > 10 && o.so && o.meo && o.meo[0] === o.ten, k + ': "' + o.ten + '" (hình tạm ← ' + o.muon + ', ' + o.w + '×' + o.h + ', ' + o.css + ')'); }
    const thieuEn = kb.en.filter(([t, m], i) => t === kb.out[MA8[i]].ten || m === kb.out[MA8[i]].meo[1] || /[ăâđêôơưáàảãạ]/i.test(t + m));
    dat(!thieuEn.length, 'tên + mẹo 8 con có tiếng Anh' + (thieuEn.length ? ': ' + JSON.stringify(thieuEn[0]) : ''));

    // ---------- 3. từng con ----------
    console.log('3. Từng con một mình trong phòng (bé đứng yên)');
    const CU = await A.goi(() => G.knQuai.CU);
    const motCon = (o, giay, fn) => A.goi((x) => {
      const [o, giay, fn] = x;
      const r0 = TQ.phong(o);
      const theo = fn ? eval('(' + fn + ')') : null;
      const g = TQ.chay(giay, { giuMau: true, theo });
      return Object.assign(g, { art: r0.art, kn: r0.kn });
    }, [o, giay, fn ? fn.toString() : null]);
    for (let i = 0; i < 8; i++) {
      const k = MA8[i], v = VAI[i], g = await motCon({ art: k, role: v, ex: v === 'archer' || v === 'bomber' || v === 'spiky' || v === 'nimble' ? 110 : 60 }, 8);
      dat(g.art === k && g.kn, k + ': ra trận đúng mã, có kỹ năng riêng');
      dat(!g.bad.length, k + ': không số NaN');
      dat(g.trung > 0, k + ': trúng được bé đứng yên (' + g.trung + ' lần / 8 giây, ' + Math.round(g.mau) + ' máu, hệ ' + Object.keys(g.el).join('/') + ')');
      dat(g.baoMin != null && g.baoMin >= CU[v].bao - 0.06 || (k === 'traiGai' && g.baoMin >= 0.7) || (k === 'maDa' && g.baoMin >= 1.8),
        k + ': có vùng đỏ báo trước, ngắn nhất ' + g.baoMin + ' giây (vai cũ ' + CU[v].bao + ')');
    }
    // cơ chế riêng
    const rc = await motCon({ art: 'raiCa', role: 'rusher', ex: 80 }, 3, (e, P, W, g) => { if (e.act && e.act.fired && !g.p) { g.p = 1; P.x -= 60; } if (e.st.stun > 0.5) g.ngan = 1; if (e.ghost) g.bay = 1; });
    dat(rc.ngan && rc.bay, 'Rái Cá: vọt lên (không nhắm được lúc bay), bé tránh khỏi vòng thì đáp hụt → ngẩn ra (choáng)');
    const dt1 = await motCon({ art: 'diaTrau', role: 'swarm', ex: 40 }, 4, (e, P, W, g) => { if (e.kn.bam > 0) { g.bam = 1; if (P.knCham > 0) g.cham = 1; if (Math.abs(e.x - P.x) < 12) g.theo = 1; } });
    dat(dt1.bam && dt1.cham && dt1.theo && dt1.el.poison, 'Đỉa: lao bám chân → bé đi chậm, đỉa bám theo, đòn Độc');
    const dt2 = await motCon({ art: 'diaTrau', role: 'swarm', ex: 40 }, 4, (e, P, W, g) => { if (e.kn.bam > 0 && !g.lan) { g.lan = 1; P.dodgeT = 0.27; } if (g.lan && !(e.kn.bam > 0) && e.st.stun > 0) g.giu = 1; });
    dat(dt2.lan && dt2.giu, 'Đỉa: bấm lăn khi đang bị bám → giũ ra (đỉa văng, choáng)');
    const bb = await motCon({ art: 'baBa', role: 'shield', ex: 60 }, 4, (e, P, W, g) => { if (e.kn.ket > 0 && !e.act && !g.k) { g.k = 1; g.f = e.face; P.x = e.x - e.face * 40; } if (g.k && !g.xong) { if (e.kn.ket > 0) { if (e.face !== g.f) g.quay = 1; } else g.xong = 1; } });
    dat(bb.k && !bb.quay && bb.trung > 0, 'Ba Ba: đớp xong cổ còn duỗi, bé ra sau lưng thì nó không quay lại được');
    const ct = await motCon({ art: 'cocTia', role: 'archer', ex: 30 }, 3, (e, P, W, g) => { const d = Math.hypot(e.x - P.x, e.y - P.y); g.d0 = g.d0 || d; g.d1 = Math.max(g.d1 || 0, d); if (e.kn.bay > 0) g.nhay = 1; });
    dat(ct.nhay && ct.d1 > ct.d0 + 20, 'Cóc Tía: bé lại gần thì nhảy lùi (' + Math.round(ct.d0) + ' → ' + Math.round(ct.d1) + ' điểm ảnh)');
    const rn = await motCon({ art: 'ranNuoc', role: 'nimble', ex: 110 }, 5, (e, P, W, g) => { if (e.ghost) { g.an = 1; if (!G.targets().includes(e)) g.khongNham = 1; if (e.kn.mo === 0) g.voHinh = 1; } });
    dat(rn.an && rn.khongNham && rn.voHinh && rn.el.poison, 'Rắn Nước: lặn (vô hình, không nhắm được), trồi lên đớp, đòn Độc');
    const rk = await A.goi(() => { G.vung4Nuoc = () => false; try { TQ.phong({ art: 'ranNuoc', role: 'nimble', ex: 90 }); return TQ.chay(5, { giuMau: true, theo: (e, P, W, g) => { if (e.ghost) g.an = 1; } }); } finally { delete G.vung4Nuoc; } });
    dat(!rk.an && rk.trung > 0, 'Rắn Nước: G.vung4Nuoc = sàn khô → không lặn, chỉ cắn thường (' + rk.trung + ' lần)');
    const ec = await A.goi(() => {
      TQ.phong({ art: 'echPhinh', role: 'kami', ex: 150 });
      const W = TQ.W, e = TQ.e, b = G.spawnEnemy('rusher', e.x + 20, e.y, { art: 'raiCa' }); b.spawnT = 0;
      const hp0 = b.hp; G.damage(e, e.hp + 1, { el: 'fire' });
      return { chet: e.dead, mat: hp0 - b.hp, phan: (hp0 - b.hp) / b.maxhp };
    });
    dat(ec.chet && ec.phan > 0.3 && ec.phan < 0.4, 'Ếch Phình: bị đánh chết trước khi nổ → nổ trúng quái đứng gần (−' + Math.round(ec.phan * 100) + '% máu Rái Cá)');
    const ec2 = await motCon({ art: 'echPhinh', role: 'kami', ex: 50 }, 3, (e, P, W, g) => { if (e.kn.bay > 0) g.nay = 1; if (P.knCham > 0) g.cham = 1; });
    dat(ec2.nay && ec2.el.ice, 'Ếch Phình: nảy tới rồi nổ Băng');
    const md = await motCon({ art: 'maDa', role: 'bomber', ex: 120 }, 4, (e, P, W, g) => {
      if (!g.dich && W.zones.some((z) => z.src === e && z.fxKind === 'bomb')) { g.dich = 1; P.x += 26; g.x0 = P.x; }
      if (g.dich && !g.het) { g.xa = Math.max(g.xa || 0, g.x0 - P.x); if (!W.zones.some((z) => z.src === e && z.fxKind === 'bomb')) g.het = 1; }
    });
    dat(md.xa > 3 && md.el.ice, 'Ma Da: bé đứng lệch tâm xoáy thì bị kéo vào (' + md.xa.toFixed(1) + ' điểm ảnh), bắn nước Băng');
    const tg = await A.goi(() => {
      TQ.phong({ art: 'traiGai', role: 'spiky', ex: 60 });
      const e = TQ.e, P = TQ.P; e.face = -1; e.cd = 99;
      const giap = () => G.mobArmor(e, {});
      const truoc = giap(); P.x = e.x + 40; const sau = giap(); P.x = e.x - 40;
      e.cd = 0; let ha = null, mo = 0;
      TQ.chay(2, { giuMau: true, theo: (q) => { if (q.act && q.act.k === 'kn' && ha == null) ha = G.mobArmor(q, {}); } });
      return { truoc, sau, ha };
    });
    dat(tg.truoc >= 1 && tg.sau < 0.5 && tg.ha != null && tg.ha < 0.5, 'Trai Gai: khép vỏ chặn đòn phía trước (giáp ' + tg.truoc + '), sau lưng ăn đòn (' + tg.sau + '), há vỏ ăn đòn (' + tg.ha + ')');

    // ---------- 4. né được ----------
    console.log('4. Né được (bot thật) — so với đứng yên');
    const ne = await A.goi((x) => {
      const [ma8, vai] = x, out = {};
      for (let i = 0; i < ma8.length; i++) {
        let yen = 0, neT = 0;
        for (const seed of [3, 11]) {
          TQ.phong({ art: ma8[i], role: vai[i], ex: 100, seed }); const r1 = TQ.chay(10, { giuMau: true }); yen += r1.mau;
          TQ.phong({ art: ma8[i], role: vai[i], ex: 100, seed }); G.botInput = (S) => { const b = TQ.bot(S); return Object.assign({}, b, { atkP: false, atk: false, specialP: false, skillP: false }); };
          const r2 = TQ.chay(10, { giuMau: true }); neT += r2.mau;
        }
        out[ma8[i]] = [Math.round(yen), Math.round(neT)];
      }
      return out;
    }, [MA8, VAI]).catch((e) => ({ loi: String(e) }));
    if (ne.loi) throw new Error(ne.loi);
    const neBang = MA8.map((k) => k + ' ' + ne[k][0] + '→' + ne[k][1]).join(', ');
    dat(MA8.every((k) => ne[k][1] <= ne[k][0]), 'bot né (không đánh) mất ít máu hơn hoặc bằng đứng yên: ' + neBang);

    // ---------- 5. cả ải ----------
    console.log('5. Cả ải vùng 4 bằng bot (bất tử)');
    const ai = (X, i) => X.goi((i) => {
      G.botInput = TQ.bot;
      G.testSave({ lvl: 40, sharpen: 15, branch: 'fire', marksMoi: 5000 });
      const s = G.save; for (let r = 0; r < 3; r++) for (let ii = 0; ii < 5; ii++) s.stars[r + '-' + ii] = 3; for (let ii = 0; ii < i; ii++) s.stars['3-' + ii] = 1;
      G.rnd = G.srand(9 + i);
      const h0 = G.hurtPlayer, gap = {}; G.hurtPlayer = function () { return false; };
      const sp0 = G.spawnEnemy; G.spawnEnemy = function () { const e = sp0.apply(this, arguments); gap[e.art] = (gap[e.art] || 0) + 1; return e; };
      let out, loi = null;
      try { G.startStage(3, i, 0); out = G.probeRun(i === 4 ? 900 : 500); } catch (e) { loi = String(e && e.stack || e); } finally { G.hurtPlayer = h0; G.spawnEnemy = sp0; }
      return { loi, win: out && out.win, bad: out ? out.bad : ['?'], kills: out && out.kills, t: out && out.t, gap };
    }, i);
    for (let i = 0; i < 5; i++) {
      const r = await ai(A, i), moiGap = MA8.filter((k) => r.gap[k]);
      dat(!r.loi && r.win && !r.bad.length, 'ải 4-' + (i + 1) + ': qua ải, không NaN (' + r.kills + ' quái, ' + r.t + ' giây; gặp ' + moiGap.length + '/8 con mới: ' + moiGap.map((k) => k + '×' + r.gap[k]).join(' ') + ')' + (r.loi ? ' — ' + r.loi : ''));
    }
    const rb = await ai(B, 1);
    dat(!rb.loi && rb.win && !MA8.some((k) => rb.gap[k]), '?quaisong=0: ải 4-2 chạy, không có con mới');

    // ---------- 6. vẽ ----------
    console.log('6. Vẽ');
    const ve = await A.goi((ma8) => {
      const M = G.monsterArt, loi = [];
      const cv = document.createElement('canvas'); cv.width = 128; cv.height = 128; const c = cv.getContext('2d');
      for (const k of ma8) for (const an of ['idle', 'move', 'tele', 'atk', 'hit', 'die', 'spawn']) for (const t of [0, 0.2, 0.5]) {
        try { M.draw(c, k, 64, 100, { anim: an, t, face: t ? 1 : -1, bao: false }); M.draw(c, k, 64, 100, { anim: an, t }); } catch (e) { loi.push(k + ' ' + an + ': ' + e); }
      }
      // nhánh ảnh mượn: giả con mượn đã có ảnh, bút có filter → vẽ con mượn với filter nhuộm, xong trả filter cũ
      const S2 = G.spriteCustom, g0 = S2.get, ghi = [], KN = G.knQuai;
      S2.get = (id) => (ma8.some((k) => M.hinhTam[k].muon === id) ? { ready: true } : g0(id));
      try {
        for (const k of ma8) {
          let fv = 'none', f = null;
          Object.defineProperty(c, 'filter', { configurable: true, get: () => fv, set: (v) => { fv = v; if (v !== 'none') f = v; } });
          const ok = KN.veTam(c, k, 64, 100, { anim: 'idle', t: 0 }); ghi.push([k, ok, f, fv]);
          delete c.filter;
        }
      } catch (e) { loi.push('veTam: ' + e); } finally { S2.get = g0; }
      return { loi, ghi, css: ma8.map((k) => M.locCss(M.hinhTam[k].loc)) };
    }, MA8);
    dat(!ve.loi.length, '8 mã × 7 cử động vẽ không lỗi (hình code đổi màu)' + (ve.loi.length ? ': ' + ve.loi[0] : ''));
    dat(ve.ghi.every((g, i) => g[1] === true && g[2] === ve.css[i] && g[3] === 'none'), 'nhánh ảnh mượn: vẽ qua ctx.filter đúng màu nhuộm từng con, xong trả filter cũ');

    const loiA = A.loi().split('\n').filter((l) => /TypeError|ReferenceError|RangeError|is not a function|Cannot read/.test(l));
    dat(!loiA.length, 'không lỗi ngầm' + (loiA.length ? ': ' + loiA.slice(0, 3).join(' | ') : ''));
    console.log('\nPASS — ' + soDat + ' điều kiện');
  } catch (e) {
    console.error(e && e.stack || e);
    console.error('stderr A:', A.loi().slice(-1500));
    process.exitCode = 1;
  } finally { A.dong(); B.dong(); C.dong(); }
})();
