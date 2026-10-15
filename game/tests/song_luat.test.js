#!/usr/bin/env node
// BƯỚC 3 — VÙNG 4 SÔNG SÂU, PHIÊN 2B: kiểm theme phòng Sông sâu + luật riêng (js/song_luat.js), không cần trình duyệt.
// Chạy 4 bản game trong Node (tests/node_trang.js, DOM / canvas giả, ?cloud=0): bản thường, ?dongchay=0, ?songluat=0, ?vung4=0.
//   1. Theme: room_art có theme thứ 4 'Sông sâu' (mã song), vùng 4 dựng bằng theme này; ?nensong=0 → vùng mượn (Hang biển) như phiên 1.
//   2. Bố cục 5 ải × nhiều hạt giống: dải dòng chảy chỉ ở phòng đánh quái, cách mọi cửa ≥ 2 ô, không phủ chỗ đứng đầu phòng; 4-1..4-3 ≤ 1 dải,
//      4-4..4-5 ≤ 2 dải; mỗi dải 1–2 cầu tre; ải 4-1 phòng đầu luôn có dải + mũi tên lớn + câu mẹo; lục bình từ 4-2, đèn dầu từ 4-3;
//      vùng 4 không còn nấm / chậu than / tinh thể; phòng Cá Trê có 2 vũng nước sâu.
//   3. Dòng chảy: đứng yên trong dải trôi đúng tốc (≈ 28 / 21 điểm ảnh/giây), trên cầu và ngoài dải không trôi; tốc dòng < 45% tốc chạy
//      của nhân vật chậm nhất; bước ngang ra khỏi dải không bị cản; KHÔNG đẩy em bé vào vùng đỏ đang báo (đứng yên vẫn không trúng đòn);
//      quái trôi theo vai (bầy ×2, tinh anh ×0,5, trùm 0).
//   4. Nước sâu: em bé lội chậm 25%, lăn né không chậm; quái trong vũng +1 tầng Băng mỗi giây.
//   5. Lục bình / đèn dầu: đánh trúng → nổ hệ + vũng 3 giây chỉ gây hệ lên quái (em bé đứng trong không mất máu), hết 3 giây thì tan.
//   6. Cờ: ?dongchay=0 không có dải; ?songluat=0 vùng 4 dùng vật cũ (nấm / chậu than / tinh thể), không vũng; ?vung4=0 không có G.songLuat.
//      Ba vùng cũ: đồ vật từng phòng giống hệt bản ?vung4=0 (cùng hạt ngẫu nhiên).
//   7. Vẽ trận vùng 4 (theme bật / tắt, có dải, vũng, lục bình, đèn dầu, vũng đang cháy) không lỗi; bot (bất tử) qua ải 4-4 không NaN.
// Chạy: node game/tests/song_luat.test.js
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

// Dựng bản lưu đã qua 3 vùng, vào ải (r, i) với hạt ngẫu nhiên cố định; đi qua mọi phòng, ghi lại bố cục.
const BO_CUC = (arg) => {
  const [r, i, hat] = arg;
  G.testSave({ lvl: 40, sharpen: 15, branch: 'fire', marksMoi: 5000 });
  const s = G.save;
  for (let rr = 0; rr < 3; rr++) for (let ii = 0; ii < 5; ii++) s.stars[rr + '-' + ii] = 3;
  for (let ii = 0; ii < i; ii++) s.stars[r + '-' + ii] = 1;
  const rnd0 = G.rnd; G.rnd = G.srand(hat);
  const out = [];
  try {
    G.startStage(r, i, 0);
    const S = G.getRun();
    for (const o of S.map.rooms) {
      if (o.id !== S.idx) G.gotoRoom(o.id);
      const W = S.W;
      out.push({ id: o.id, type: W.type, doors: W.doors.map((d) => d.dir), song: W.song ? JSON.parse(JSON.stringify(W.song)) : null,
        props: W.props.filter((p) => p.type !== 'roomFore').map((p) => [p.type, Math.round(p.x), Math.round(p.y)]), banner: W.banner ? W.banner.s : null,
        cam: G.songLuat ? G.songLuat.vungCua(W.geo, W.doors.map((d) => d.dir)) : null, geo: { cx: W.geo.cx, cy: W.geo.cy, fx0: W.geo.fx0, fx1: W.geo.fx1, fy0: W.geo.fy0, fy1: W.geo.fy1 } });
    }
  } finally { G.rnd = rnd0; }
  return out;
};

(async () => {
  const A = moTrang(''), B = moTrang('dongchay=0'), C = moTrang('songluat=0'), D = moTrang('vung4=0');
  try {
    // ---------- 1. theme ----------
    console.log('1. Theme phòng Sông sâu');
    const th = await A.goi(() => {
      const RA = G.roomArt, T = RA.THEMES[3];
      const a = { ten: T && T.name, ma: T && T.ma, reg: T && T.reg, vv: RA.vungTheme(3), v0: [0, 1, 2].map(RA.vungTheme), floors: T && T.floors.length };
      G.NEN_SONG = false; a.tat = RA.vungTheme(3); G.NEN_SONG = true;
      return a;
    });
    dat(th.ten === 'Sông sâu' && th.ma === 'song' && th.reg === 3 && th.floors === 3, 'room_art THEMES[3] = Sông sâu (mã song, 3 kiểu sàn)');
    dat(th.vv === 3 && JSON.stringify(th.v0) === '[0,1,2]', 'vùng 4 dựng bằng theme Sông sâu; ba vùng cũ giữ theme cũ');
    dat(th.tat === 1, '?nensong=0 (G.NEN_SONG = false): vùng 4 dựng như phiên 1 (vùng mượn Hang biển)');

    // ---------- 2. bố cục ----------
    console.log('2. Bố cục dải dòng chảy, cầu tre, vật mang hệ (5 ải × 8 hạt)');
    const tatCa = [];
    for (let i = 0; i < 5; i++) for (let h = 1; h <= 8; h++) tatCa.push({ i, h, phong: await A.goi(BO_CUC, [3, i, 1000 + h * 77 + i]) });
    const cat = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
    let soDai = 0, saiCua = 0, saiLoai = 0, saiSo = 0, saiCau = 0, saiRong = 0, cuVat = 0, lbSom = 0, ddSom = 0, coLB = 0, coDD = 0, coSau = 0, meoDung = 0, meoSai = 0, caTre = 0, caTreSai = 0, coHai = 0, dauPhong = 0;
    for (const { i, phong } of tatCa) {
      for (const p of phong) {
        const dai = (p.song && p.song.dai) || [];
        soDai += dai.length;
        if (dai.length > 1) coHai++;
        if (dai.length && !['start', 'fight', 'elite', 'challenge'].includes(p.type)) saiLoai++;
        if (dai.length > (i >= 3 ? 2 : 1)) saiSo++;
        for (const d of dai) {
          if (p.cam.some((c) => cat([d.x0, d.y0, d.x1, d.y1], c))) saiCua++;
          if (p.type === 'start' && cat([d.x0, d.y0, d.x1, d.y1], [p.geo.cx - 26, p.geo.cy, p.geo.cx + 26, p.geo.cy + 52])) dauPhong++;
          if (!d.cau || d.cau.length < 1 || d.cau.length > 2) saiCau++;
          const rong = d.doc ? d.x1 - d.x0 : d.y1 - d.y0, fw = p.geo.fx1 - p.geo.fx0, fh = p.geo.fy1 - p.geo.fy0;
          if (rong < (d.doc ? fw : fh) * 0.18 || rong > (d.doc ? fw : fh) * 0.3) saiRong++;
        }
        for (const pr of p.props) {
          if (['mushroom', 'brazier', 'crystal'].includes(pr[0])) cuVat++;
          if (pr[0] === 'lucbinh') { coLB++; if (i < 1 && p.type !== 'boss') lbSom++; }
          if (pr[0] === 'dendau') { coDD++; if (i < 2 && p.type !== 'boss') ddSom++; }
        }
        coSau += ((p.song && p.song.sau) || []).length;
        if (i === 0 && p.type === 'start') { if (dai.length === 1 && dai[0].lon && /cầu tre/.test(p.banner || '')) meoDung++; else meoSai++; }
        if (p.type === 'boss' && i < 4) { caTre++; if (((p.song && p.song.sau) || []).length < 2) caTreSai++; }
      }
    }
    dat(soDai > 40 && coHai > 0, 'có dải dòng chảy (' + soDai + ' dải trên ' + tatCa.length + ' lượt ải; ' + coHai + ' phòng có 2 dải)');
    dat(!saiLoai && !saiSo, 'dải chỉ ở phòng đánh quái; 4-1..4-3 ≤ 1 dải / phòng, 4-4..4-5 ≤ 2');
    dat(!saiCua, 'không dải nào chạm vùng 2 ô quanh cửa');
    dat(!dauPhong, 'không dải nào phủ chỗ em bé đứng lúc vào phòng đầu ải');
    dat(!saiCau, 'mỗi dải có 1–2 cầu tre');
    dat(!saiRong, 'bề rộng dải ≈ 1/4 phòng (18–30% bề ngang / bề dọc sàn)');
    dat(meoDung === 8 && !meoSai, 'ải 4-1 phòng đầu: luôn 1 dải, mũi tên lớn nhấp nháy, câu mẹo cầu tre (8/8 hạt)');
    dat(!cuVat, 'vùng 4 không còn nấm độc / chậu than / tinh thể băng (thay bằng lục bình / đèn dầu / nước sâu)');
    dat(coLB > 0 && coDD > 0 && coSau > 0, 'có đủ ba nguồn hệ (lục bình ' + coLB + ', đèn dầu ' + coDD + ', vũng nước sâu ' + coSau + ')');
    dat(!lbSom && !ddSom, 'phòng đánh quái: lục bình từ ải 4-2, đèn dầu từ ải 4-3 (trước đó là nước sâu)');
    dat(caTre > 0 && !caTreSai, 'phòng Cá Trê (4-1..4-4) có 2 vũng nước sâu (' + caTre + ' phòng)');

    // ---------- 3. dòng chảy ----------
    console.log('3. Dòng chảy');
    const dong = await A.goi(() => {
      G.testSave({ lvl: 40 });
      const s = G.save; for (let rr = 0; rr < 3; rr++) for (let ii = 0; ii < 5; ii++) s.stars[rr + '-' + ii] = 3;
      const rnd0 = G.rnd; G.rnd = G.srand(4242);
      G.startStage(3, 0, 0);
      G.rnd = rnd0;
      const S = G.getRun(), W = S.W, P = W.P, d = W.song.dai[0], L = G.songLuat;
      W.waves = []; W.waveI = 99; W.ents.length = 0; W.spawns = [];
      const h0 = G.hurtPlayer;
      const chay = (giay, inp) => { for (let k = 0; k < Math.round(giay * 60); k++) G.updateWorld(1 / 60, Object.assign({ mx: 0, my: 0 }, inp || {})); };
      const out = { doc: d.doc, huong: d.huong, cau: d.cau };
      // điểm giữa dải, xa cầu
      const giua = (k) => { const c = d.cau[0], p = d.doc ? [(d.x0 + d.x1) / 2, c[3] + 30 + k] : [c[2] + 30 + k, (d.y0 + d.y1) / 2]; return p; };
      let p = giua(0); P.x = p[0]; P.y = p[1]; P.vx = 0; chay(1);
      out.troi = [P.x - p[0], P.y - p[1]];
      const c = d.cau[0]; P.x = (c[0] + c[2]) / 2; P.y = (c[1] + c[3]) / 2; const pc = [P.x, P.y]; chay(1);
      out.cau1 = [P.x - pc[0], P.y - pc[1]];
      P.x = d.doc ? (d.x0 - 20 > W.x0 + 4 ? d.x0 - 20 : d.x1 + 20) : W.geo.cx; P.y = d.doc ? W.geo.cy : (d.y0 - 14 > W.y0 + 4 ? d.y0 - 14 : d.y1 + 14); const pn = [P.x, P.y]; chay(1);
      out.ngoai = [P.x - pn[0], P.y - pn[1]];
      // bước ngang ra khỏi dải
      p = giua(0); P.x = p[0]; P.y = p[1];
      let t = 0; while (t < 3 && L.dongTai(W, P.x, P.y)) { chay(1 / 60, d.doc ? { mx: -1 } : { my: -1 }); t += 1 / 60; }
      out.raNgang = Math.round(t * 100) / 100;
      out.tiLe = L.CFG.v / (72 * Math.min(...G.HKEYS.map((k) => G.HEROES[k].speed)));
      // vùng đỏ đang báo nằm xuôi dòng: đứng yên không bị đẩy vào, không trúng đòn
      p = giua(0); P.x = p[0]; P.y = p[1]; P.inv = 0; const hp0 = P.hp;
      const zx = d.doc ? P.x : P.x + d.huong * 26, zy = d.doc ? P.y + d.huong * 22 : P.y;
      W.songChan = 0;
      G.zoneCircle(zx, zy, 14, 1.2, 99999, null);
      let trongVung = 0; for (let k = 0; k < 90; k++) { chay(1 / 60); const z = W.zones.find((q) => q.dmg === 99999); if (z && z.t > 0 && G.inZone(z, P)) trongVung++; }
      out.vungDo = { trongVung, mat: hp0 - P.hp, chan: W.songChan };
      // quái trôi theo vai
      W.zones.length = 0;
      P.x = W.geo.fx1 - 12; P.y = W.geo.fy0 + 12;
      out.quai = ['rusher', 'swarm', 'elite'].map((role) => { // từng con một (khỏi đẩy nhau), giữa dải, xa cầu
        W.ents.length = 0;
        const q = giua(0), e = G.spawnEnemy(role, q[0], q[1], {}); e.inside = true; e.speed = 0; e.st.stun = 99; e.cd = 99; e.dmg = 0;
        const e0 = [e.x, e.y]; chay(0.5);
        return Math.round((Math.abs(e.x - e0[0]) + Math.abs(e.y - e0[1])) * 10) / 10;
      });
      W.ents.length = 0;
      G.hurtPlayer = h0;
      return out;
    });
    const kv = dong.doc ? 28 * 0.75 : 28;
    const troi = dong.doc ? dong.troi[1] : dong.troi[0], ngang = dong.doc ? dong.troi[0] : dong.troi[1];
    dat(Math.abs(troi - dong.huong * kv) < 1.5 && Math.abs(ngang) < 0.5, 'đứng yên trong dải: trôi theo mũi tên ' + troi.toFixed(1) + ' điểm ảnh/giây (mong ' + (dong.huong * kv).toFixed(1) + ')');
    dat(Math.abs(dong.cau1[0]) + Math.abs(dong.cau1[1]) < 0.01, 'đứng trên cầu tre: không trôi');
    dat(Math.abs(dong.ngoai[0]) + Math.abs(dong.ngoai[1]) < 0.01, 'ngoài dải: không trôi');
    dat(dong.tiLe < 0.45, 'tốc dòng = ' + Math.round(dong.tiLe * 100) + '% tốc chạy của nhân vật chậm nhất (< 45%)');
    dat(dong.raNgang > 0 && dong.raNgang < 0.9, 'bước ngang ra khỏi dải mất ' + dong.raNgang + ' giây (dòng không cản bước ngang)');
    dat(dong.vungDo.trongVung === 0 && dong.vungDo.mat === 0 && dong.vungDo.chan > 0, 'vùng đỏ đang báo xuôi dòng: dòng dừng đẩy ở mép (' + dong.vungDo.chan + ' bước bị chặn), đứng yên không trúng đòn');
    dat(Math.abs(dong.quai[1] - 2 * dong.quai[0]) < 1 && Math.abs(dong.quai[2] - 0.5 * dong.quai[0]) < 0.6 && dong.quai[0] > 5, 'quái trôi theo vai: thường ' + dong.quai[0] + ', bầy ' + dong.quai[1] + ' (×2), tinh anh ' + dong.quai[2] + ' (×0,5) điểm ảnh / 0,5 giây');

    // ---------- 4, 5. nước sâu, lục bình, đèn dầu ----------
    console.log('4. Nước sâu · 5. Lục bình, đèn dầu');
    const vat = await A.goi(() => {
      G.testSave({ lvl: 40 });
      const s = G.save; for (let rr = 0; rr < 3; rr++) for (let ii = 0; ii < 5; ii++) s.stars[rr + '-' + ii] = 3;
      for (let ii = 0; ii < 3; ii++) s.stars['3-' + ii] = 1;
      G.startStage(3, 3, 0);
      const S = G.getRun(), W = S.W, P = W.P;
      W.waves = []; W.waveI = 99; W.ents.length = 0; W.spawns = []; W.song.dai = []; W.zones.length = 0;
      const chay = (giay, inp) => { for (let k = 0; k < Math.round(giay * 60); k++) G.updateWorld(1 / 60, Object.assign({ mx: 0, my: 0 }, inp || {})); };
      const g = W.geo, o = { x: g.cx - 40, y: g.cy - 30, rx: 40, ry: 20 };
      W.song.sau = [o];
      const out = {};
      P.x = o.x - 30; P.y = o.y; let x0 = P.x; chay(0.4, { mx: 1 }); out.trong = P.x - x0;
      P.x = g.cx + 40; P.y = g.cy + 50; x0 = P.x; chay(0.4, { mx: 1 }); out.ngoai = P.x - x0;
      // lăn né trong vũng không chậm
      P.x = o.x - 34; P.y = o.y; P.dodgeCd = 0; x0 = P.x; G.updateWorld(1 / 60, { mx: 1, my: 0, dodgeP: true }); chay(0.25, { mx: 1 }); out.ne = P.x - x0;
      P.x = g.cx + 30; P.y = g.cy + 50; P.dodgeCd = 0; x0 = P.x; G.updateWorld(1 / 60, { mx: 1, my: 0, dodgeP: true }); chay(0.25, { mx: 1 }); out.neNgoai = P.x - x0;
      // quái trong vũng: +1 tầng Băng mỗi giây
      P.x = g.fx1 - 12; P.y = g.fy0 + 12;
      const e = G.spawnEnemy('shield', o.x, o.y, {}); e.inside = true; e.speed = 0; e.st.stun = 99; e.cd = 99; e.dmg = 0; e.hp = e.maxhp = 1e9;
      let ice = 0; const n0 = e.st.iceN || 0;
      for (let k = 0; k < 125; k++) { chay(1 / 60); ice = Math.max(ice, e.st.iceN || 0); }
      out.bang = ice - n0;
      W.ents.length = 0; W.song.sau = [];
      // lục bình, đèn dầu
      const hp0 = P.hp;
      for (const loai of ['lucbinh', 'dendau']) {
        const pr = { type: loai, env: true, x: g.cx, y: g.cy, song: true }; W.props.push(pr);
        const q = G.spawnEnemy('shield', g.cx + 10, g.cy + 2, {}); q.inside = true; q.speed = 0; q.st.stun = 99; q.cd = 99; q.dmg = 0; q.hp = q.maxhp = 1e9;
        P.x = g.cx - 4; P.y = g.cy + 2; P.inv = 0;
        G.triggerProp(pr);
        const z = W.zones.find((zz) => zz.song === loai), life0 = z && z.life;
        const he = loai === 'lucbinh' ? (q.st.poisonN || 0) : (q.st.fire > 0 ? 1 : 0);
        chay(1.5);
        const giua = !!W.zones.find((zz) => zz.song === loai);
        chay(1.7);
        out[loai] = { vung: !!z, el: z && z.el, life: life0, he, giua, tan: !W.zones.find((zz) => zz.song === loai), propMat: !W.props.includes(pr), poison2: q.st.poisonN || 0 };
        W.ents.length = 0;
      }
      out.mauBe = hp0 - P.hp;
      return out;
    });
    dat(Math.abs(vat.trong / vat.ngoai - 0.75) < 0.04, 'lội nước sâu chậm 25% (' + vat.trong.toFixed(1) + ' / ' + vat.ngoai.toFixed(1) + ')');
    dat(Math.abs(vat.ne - vat.neNgoai) < 0.5, 'lăn né trong nước sâu đi xa như ngoài (' + vat.ne.toFixed(1) + ' / ' + vat.neNgoai.toFixed(1) + ')');
    dat(vat.bang >= 2, 'quái đứng trong nước sâu 2,1 giây: +' + vat.bang + ' tầng Băng');
    dat(vat.lucbinh.vung && vat.lucbinh.el === 'poison' && vat.lucbinh.life === 3 && vat.lucbinh.he >= 3 && vat.lucbinh.propMat, 'đánh vỡ lục bình: nổ Độc (' + vat.lucbinh.he + ' tầng) + vũng độc 3 giây');
    dat(vat.lucbinh.giua && vat.lucbinh.tan, 'vũng độc còn ở giây 1,5, tan sau 3 giây');
    dat(vat.lucbinh.poison2 > vat.lucbinh.he || vat.lucbinh.poison2 >= 3, 'quái đứng trong vũng độc được thêm tầng Độc');
    dat(vat.dendau.vung && vat.dendau.el === 'fire' && vat.dendau.he && vat.dendau.giua && vat.dendau.tan && vat.dendau.propMat, 'đánh đổ đèn dầu: nổ Lửa + vệt lửa dầu 3 giây rồi tan');
    dat(vat.mauBe === 0, 'em bé đứng giữa vũng độc / vệt lửa: không mất máu');

    // ---------- 6. cờ ----------
    console.log('6. Cờ quay lui, ba vùng cũ không đổi');
    const bB = [], bC = [];
    for (let i = 0; i < 5; i++) for (let h = 1; h <= 3; h++) { bB.push(await B.goi(BO_CUC, [3, i, 500 + h * 31 + i])); bC.push(await C.goi(BO_CUC, [3, i, 500 + h * 31 + i])); }
    const daiB = bB.flat().reduce((n, p) => n + ((p.song && p.song.dai) || []).length, 0);
    const vatB = bB.flat().flatMap((p) => p.props.map((x) => x[0]));
    dat(daiB === 0 && vatB.includes('lucbinh') && vatB.includes('dendau'), '?dongchay=0: không dải dòng chảy nào; lục bình / đèn dầu / nước sâu vẫn có');
    const daiC = bC.flat().reduce((n, p) => n + ((p.song && p.song.dai) || []).length + ((p.song && p.song.sau) || []).length, 0);
    const vatC = bC.flat().flatMap((p) => p.props.map((x) => x[0]));
    dat(daiC === 0 && !vatC.includes('lucbinh') && !vatC.includes('dendau') && (vatC.includes('mushroom') || vatC.includes('brazier') || vatC.includes('crystal')), '?songluat=0: không dải / vũng, vật mang hệ như ba vùng cũ');
    const coD = await D.goi(() => ({ sl: G.songLuat, r: G.REGIONS.length }));
    dat(coD.sl === null && coD.r === 3, '?vung4=0: G.songLuat = null, 3 vùng');
    let khac = 0, soPhong = 0;
    for (const [r, i] of [[0, 1], [0, 3], [1, 2], [1, 4], [2, 0], [2, 4]]) {
      for (const h of [7, 8]) {
        const a = await A.goi(BO_CUC, [r, i, h * 101 + r * 7 + i]), d = await D.goi(BO_CUC, [r, i, h * 101 + r * 7 + i]);
        soPhong += a.length;
        if (JSON.stringify(a.map((p) => [p.type, p.props, p.song])) !== JSON.stringify(d.map((p) => [p.type, p.props, p.song]))) khac++;
      }
    }
    dat(khac === 0, 'ba vùng cũ: đồ vật ' + soPhong + ' phòng giống hệt bản ?vung4=0 (cùng hạt), không có W.song');

    // ---------- 7. vẽ + bot ----------
    console.log('7. Vẽ trận vùng 4, bot qua ải 4-4');
    const ve = await A.goi(() => {
      const loi = [];
      const warn0 = console.warn; let canhBao = 0; console.warn = function () { canhBao++; return warn0.apply(console, arguments); };
      try {
        G.testSave({ lvl: 40 });
        const s = G.save; for (let rr = 0; rr < 3; rr++) for (let ii = 0; ii < 5; ii++) s.stars[rr + '-' + ii] = 3;
        for (let ii = 0; ii < 4; ii++) s.stars['3-' + ii] = 1;
        for (const i of [0, 3, 4]) {
          G.startStage(3, i, 0);
          const S = G.getRun();
          for (const o of S.map.rooms) {
            if (o.id !== S.idx) G.gotoRoom(o.id);
            const W = S.W;
            W.props.push({ type: 'lucbinh', env: true, x: W.geo.cx - 30, y: W.geo.cy, song: true }, { type: 'dendau', env: true, x: W.geo.cx + 30, y: W.geo.cy, song: true });
            if (W.song) W.zones.push({ shape: 'circle', x: W.geo.cx, y: W.geo.cy + 20, r: 28, t: 0, pool: true, team: 'player', life: 2, tick: 1, every: 1, el: 'poison', src: 1, oz: true, song: 'lucbinh' },
              { shape: 'circle', x: W.geo.cx, y: W.geo.cy - 20, r: 32, t: 0, pool: true, team: 'player', life: 1, tick: 1, every: 1, el: 'fire', src: 1, oz: true, song: 'dendau' });
            for (const nen of [true, false]) {
              G.NEN_SONG = nen;
              try { G.time = 1.3; G.drawWorld(3); G.time = 2.7; G.drawWorld(3); } catch (e) { loi.push(o.type + ' nen=' + nen + ': ' + String(e && e.stack || e).slice(0, 300)); }
            }
            G.NEN_SONG = true;
            if (G.art.roomErr) { loi.push('roomErr ' + String(G.art.roomErr.stack || G.art.roomErr).slice(0, 300)); G.art.roomErr = null; }
          }
        }
      } finally { console.warn = warn0; }
      return { loi, canhBao, baoThieu: G.roomArt.baoThieu || null, loiVe: G.songLuat.loiVe ? String(G.songLuat.loiVe) : null };
    });
    dat(!ve.loi.length && !ve.loiVe, 'vẽ mọi phòng ải 4-1, 4-4, 4-5 (theme bật / tắt, dải, cầu, vũng, lục bình, đèn dầu) không lỗi' + (ve.loi.length ? ': ' + ve.loi[0] : '') + (ve.loiVe ? ': ' + ve.loiVe : ''));
    dat(ve.baoThieu === null && ve.canhBao === 0, 'room_art không báo thiếu theme, không cảnh báo khi vẽ vùng 4');
    const bot = await A.goi(() => {
      G.testSave({ lvl: 40, sharpen: 15, branch: 'fire', marksMoi: 5000 });
      const s = G.save; for (let rr = 0; rr < 3; rr++) for (let ii = 0; ii < 5; ii++) s.stars[rr + '-' + ii] = 3;
      for (let ii = 0; ii < 3; ii++) s.stars['3-' + ii] = 1;
      const h0 = G.hurtPlayer; G.hurtPlayer = function () { return false; };
      let out = null, loi = null;
      try { G.startStage(3, 3, 0); out = G.probeRun(600); } catch (e) { loi = String(e && e.stack || e); } finally { G.hurtPlayer = h0; }
      return { out, loi };
    });
    dat(!bot.loi && bot.out && !bot.out.bad.length && bot.out.win, 'bot (bất tử) qua ải 4-4 có dòng chảy: không NaN, không quái ngoài phòng (' + (bot.out && bot.out.t) + ' giây)' + (bot.loi ? ' — ' + bot.loi : ''));
    for (const [ten, X] of [['thường', A], ['dongchay=0', B], ['songluat=0', C], ['vung4=0', D]]) {
      const l = X.loi().split('\n').filter((x) => /TypeError|ReferenceError|RangeError|is not a function|Cannot read/.test(x));
      dat(!l.length, 'không lỗi ngầm (' + ten + ')' + (l.length ? ': ' + l.slice(0, 2).join(' | ') : ''));
    }
    console.log('\nPASS — ' + soDat + ' điều kiện');
  } catch (e) {
    console.error(e && e.stack || e);
    console.error('stderr A:', A.loi().slice(-1500));
    process.exitCode = 1;
  } finally { A.dong(); B.dong(); C.dong(); D.dong(); }
})();
