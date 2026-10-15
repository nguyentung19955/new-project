#!/usr/bin/env node
// BƯỚC 3 — VÙNG 4 SÔNG SÂU, PHIÊN 2C: kiểm truyện + làng + nhạc vùng 4 trong Node (không trình duyệt; tests/node_trang.js, ?cloud=0).
//   1. Lời: MO_VUNG[3] (2 khung), VUNG[3] (5 khung, khung đầu nền b7), câu cuối KET dẫn sang Sông sâu, lời trùm thuong / mini3 / đổi pha,
//      câu người làng mốc 4; mọi câu mới có bản tiếng Anh.
//   2. Mở trang Sông sâu trên bản đồ lần đầu → chiếu mở vùng một lần (khoá truyen.mv); Bé Sen vắng ở bến tới khi hạ Thuồng Luồng.
//   3. Hạ Thuồng Luồng về làng → chiếu kết vùng 4 (t.v = 4); người làng nói câu mốc 4; Bé Sen về, nói câu mới; Xem lại có mở vùng.
//   4. Vẽ mọi khung (VI + EN) không lỗi; Thuồng Luồng đổi pha → bong bóng lời; nhạc vùng 4 / trùm 4 có bài riêng.
//   5. ?vung4=0: lời / làng / nhạc như cũ (3 vùng, câu KET cũ), không chiếu mở vùng, Bé Sen luôn ở bến.
// Chạy: node game/tests/vung4_truyen.test.js
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

// dựng bản lưu đã hạ Hồ Tinh (15 ải), truyện đã xem tới đoạn kết vùng 3; bật truyện (node_trang đặt G.botInput)
const DUNG = () => {
  G.testSave({ lvl: 32, sharpen: 9 });
  const s = G.save;
  for (let r = 0; r < 3; r++) for (let i = 0; i < 5; i++) s.stars[r + '-' + i] = 3;
  s.truyen = { mo: 1, v: 3, n: { lai: 3, ren: 3, xen: 3, may: 3, do: 3, tu: 3, mo: 3 } };
  G.botInput = null; G.TRUYEN = true; G.truyen.het && (G.truyen.dang = null);
  G.setScene(G.Village);
  const V = G.villageApi.V; V.tab = 'hub'; V.moi = null;
  return true;
};

(async () => {
  const A = moTrang(''), B = moTrang('vung4=0');
  try {
    // ---------- 1. lời ----------
    console.log('1. Lời vùng 4');
    const loi = await A.goi(() => {
      const L = G.truyen.LOI, D = G.ngonNgu.D;
      const moi = [].concat(L.MO_VUNG[3].map((f) => f.loi), L.VUNG[3].map((f) => f.loi), [L.KET[1].loi], L.TRUM.thuong, L.TRUM.mini3, L.TRUM_PHA.thuong.filter(Boolean),
        Object.keys(L.LANG).map((k) => L.LANG[k][3]), G.villageScene.SEN_LOI_VE, ['Sông sâu', 'Bé Sen']);
      return { mv: L.MO_VUNG[3].length, v: L.VUNG.length, v3: L.VUNG[3].length, nen0: L.VUNG[3][0].nen, ket: L.KET[1].loi, lang: Object.keys(L.LANG).map((k) => L.LANG[k].length),
        thieuEn: moi.filter((s) => !D.has(s)), soMoi: moi.length, anh: G.truyen.ANH.b7 };
    });
    dat(loi.mv === 2 && loi.v === 4 && loi.v3 === 5 && loi.nen0 === 'b7' && loi.anh === 'b7-thuong-luong-bo-tron', 'MO_VUNG[3] 2 khung, VUNG[3] 5 khung (khung đầu nền b7 → ảnh b7-thuong-luong-bo-tron)');
    dat(/Sông sâu/.test(loi.ket) && !/Độ khó 2/.test(loi.ket), 'câu cuối đoạn kết Hồ Tinh dẫn sang Sông sâu');
    dat(loi.lang.every((n) => n === 4), '7 người làng có câu mốc thứ 4');
    dat(!loi.thieuEn.length, loi.soMoi + ' câu mới đều có tiếng Anh' + (loi.thieuEn.length ? ': ' + JSON.stringify(loi.thieuEn) : ''));

    // ---------- 2. mở vùng + Bé Sen bị bắt ----------
    console.log('2. Mở trang Sông sâu lần đầu');
    const mv = await A.goi('(' + DUNG.toString() + ')').then(() => A.goi(() => {
      const V = G.villageApi.V, TR = G.truyen, out = {};
      out.vangTruoc = G.villageScene.senVang();
      V.tab = 'map'; V.mapTrang = 0; G.Village.update(0.016); out.trang1 = !!TR.dang; // trang ba vùng đầu: không chiếu
      V.mapTrang = 1; G.Village.update(0.016);
      out.dang = TR.dang && TR.dang.o.ten; out.soKhung = TR.dang && TR.dang.ds.length; out.mv = G.save.truyen.mv;
      out.vangSau = G.villageScene.senVang(); out.senO = G.villageScene.senO();
      TR.het(); G.Village.update(0.016); out.lai = !!TR.dang;
      return out;
    }));
    dat(!mv.vangTruoc && !mv.trang1, 'chưa mở trang Sông sâu: không chiếu, Bé Sen còn ở bến');
    dat(mv.dang === 'mv3' && mv.soKhung === 2 && mv.mv === 1, 'mở trang Sông sâu: chiếu mở vùng 2 khung, ghi truyen.mv = 1');
    dat(mv.vangSau && !mv.senO && !mv.lai, 'sau đó Bé Sen vắng ở bến; mở lại bản đồ không chiếu lần hai');

    // ---------- 3. hạ Thuồng Luồng ----------
    console.log('3. Hạ Thuồng Luồng, về làng');
    const ket = await A.goi(() => {
      const V = G.villageApi.V, TR = G.truyen, out = {};
      G.save.stars['3-4'] = 3;
      V.tab = 'hub'; TR.cho.vung = true; G.Village.update(0.016);
      out.dang = TR.dang && TR.dang.o.ten; out.soKhung = TR.dang && TR.dang.ds.length; out.v = G.save.truyen.v;
      TR.het();
      out.vang = G.villageScene.senVang(); out.loiSen = G.villageScene.senLoi() === G.villageScene.SEN_LOI_VE;
      out.lai = TR.loiMoi('lai'); out.lai2 = TR.loiMoi('lai');
      TR.xemLai(); out.xemLai = TR.dang.ds.map((f) => f.nen || 'lang'); out.xemSo = TR.dang.ds.length; TR.het();
      return out;
    });
    dat(ket.dang === 'vung3' && ket.soKhung === 5 && ket.v === 4, 'về làng: chiếu kết vùng 4 (5 khung), truyen.v = 4');
    dat(!ket.vang && ket.loiSen, 'Bé Sen về bến, nói 4 câu mới');
    dat(/Núi Sét/.test(ket.lai) && ket.lai2 === null, 'Chú Lái Đò nói câu mốc 4 một lần');
    dat(ket.xemSo === 5 + 3 + 3 + 3 + 2 + 2 + 5 && ket.xemLai.filter((n) => n === 'song').length === 3 && ket.xemLai.includes('b7'), 'Xem lại: mở đầu, 3 kết vùng + KET, mở vùng 4, kết vùng 4');

    // ---------- 4. vẽ, trùm, nhạc ----------
    console.log('4. Vẽ khung, lời trùm đổi pha, nhạc');
    const ve = await A.goi(() => {
      const TR = G.truyen, L = TR.LOI, loi = [];
      G.ngonNgu.thieu.clear();
      for (const lang of ['vi', 'en']) {
        G.ngonNgu.dat(lang, false);
        for (const ds of [L.MO_VUNG[3], L.VUNG[3], L.KET]) {
          TR.choi(ds.map((f) => Object.assign({ nen: 'lang' }, f)), { ten: 'thu' });
          for (let i = 0; i < ds.length; i++) { TR.dang.i = i; for (const t of [0.1, 2, 7]) { TR.dang.t = t; try { TR.draw(); } catch (e) { loi.push(lang + ' ' + i + ': ' + (e && e.stack || e)); } } }
          TR.het();
        }
      }
      G.ngonNgu.dat('vi', false);
      const thieu = [...G.ngonNgu.thieu];
      // trùm đổi pha (bong bóng lời, không dừng trận)
      const b = { kind: 'thuong', name: 'Thuồng Luồng', phase: 0, hp: 100, x: 300, y: 150 }, S = { r: 3, mode: 'play', W: { boss: b, type: 'boss' } }, g0 = G.getRun, nr = G.noRender;
      G.getRun = () => S; G.noRender = false;
      const bong = [];
      try {
        TR.trumNhip(0.016); bong.push(TR.bongTrum() && TR.bongTrum().s);
        b.phase = 1; TR.trumNhip(0.016); bong.push(TR.bongTrum() && TR.bongTrum().s);
        b.phase = 2; TR.trumNhip(0.016); bong.push(TR.bongTrum() && TR.bongTrum().s);
        b.hp = 0; b.dead = true; TR.trumNhip(0.016); bong.push(TR.bongTrum() && TR.bongTrum().s);
        const m = { kind: 'mini', name: 'Cá Trê', phase: 0, hp: 50, x: 200, y: 150 }; S.W.boss = m; TR.trumNhip(0.016); bong.push(TR.bongTrum() && TR.bongTrum().s);
      } finally { G.getRun = g0; G.noRender = nr; }
      // nhạc
      const nhac = [];
      const sc0 = G.scene; G.scene = G.StageScene;
      try {
        for (const W of [{ type: 'fight' }, { type: 'boss', boss: { dead: false } }]) { const S2 = { r: 3, W, mode: 'play' }; G.getRun = () => S2; nhac.push(G.nhac.chonBai()); }
      } finally { G.getRun = g0; G.scene = sc0; }
      const doDay = (ten) => { const B = G.nhac.BAI[ten]; let n = 0, L2 = 0; for (const v of B.vong) { for (const o of v.theoO) n += o.length; L2 += v.len; } return +(n / (L2 * 60 / B.bpm / 2)).toFixed(1); };
      return { loi, thieu, bong, nhac, nd: ['vung0', 'vung1', 'vung2', 'vung3', 'trum3'].map(doDay) };
    });
    dat(!ve.loi.length, 'vẽ mọi khung mở vùng / kết vùng 4 / KET (VI + EN, nền b7 vẽ code) không lỗi' + (ve.loi.length ? ': ' + ve.loi[0] : ''));
    dat(!ve.thieu.length, 'không chữ nào thiếu tiếng Anh khi vẽ' + (ve.thieu.length ? ': ' + JSON.stringify(ve.thieu.slice(0, 4)) : ''));
    dat(/^Trống đồng im rồi/.test(ve.bong[0]) && /^Lạnh buốt/.test(ve.bong[1]) && /^Mảnh trống ơi/.test(ve.bong[2]) && /^Hừ\.\.\./.test(ve.bong[3]), 'Thuồng Luồng: ra mắt, pha 2, pha 3, gục — đúng lời');
    dat(/^Ục ục/.test(ve.bong[4]), 'Cá Trê (mini3) nói câu ra mắt');
    dat(ve.nhac[0] === 'vung3' && ve.nhac[1] === 'trum3', 'nhạc vùng 4: vung3, trùm: trum3 (' + ve.nhac.join(', ') + ')');
    dat(ve.nd[3] > 0 && ve.nd[3] <= Math.max(ve.nd[0], ve.nd[1], ve.nd[2]), 'bài Sông sâu không dày nốt hơn 3 bài cũ (nốt/giây ' + ve.nd.join(' / ') + ')');

    // ---------- 5. ?vung4=0 ----------
    console.log('5. ?vung4=0');
    const b0 = await B.goi('(' + DUNG.toString() + ')').then(() => B.goi(() => {
      const V = G.villageApi.V, TR = G.truyen, L = TR.LOI;
      G.save.truyen.mv = 1; // bản lưu đã chơi vùng 4 nạp ở ?vung4=0
      const vang = G.villageScene.senVang();
      V.tab = 'map'; V.mapTrang = 1; G.Village.update(0.016);
      const out = { v: L.VUNG.length, ket: L.KET[1].loi, lang: Object.keys(L.LANG).map((k) => L.LANG[k].length), vang, dang: !!TR.dang, loiSen: G.villageScene.senLoi() === G.villageScene.SEN_LOI_VE };
      if (TR.dang) TR.het();
      return out;
    }));
    dat(b0.v === 3 && /Độ khó 2/.test(b0.ket) && b0.lang.every((n) => n === 3), 'lời 3 vùng y như cũ (câu KET mời Độ khó 2)');
    dat(!b0.vang && !b0.dang && !b0.loiSen, 'không chiếu mở vùng, Bé Sen luôn ở bến, câu cũ');

    const loiA = (A.loi() + B.loi()).split('\n').filter((l) => /TypeError|ReferenceError|RangeError|is not a function|Cannot read/.test(l));
    dat(!loiA.length, 'không lỗi ngầm' + (loiA.length ? ': ' + loiA.slice(0, 3).join(' | ') : ''));
    console.log('\nPASS — ' + soDat + ' điều kiện');
  } catch (e) {
    console.error(e && e.stack || e);
    console.error('stderr A:', A.loi().slice(-1500));
    process.exitCode = 1;
  } finally { A.dong(); B.dong(); }
})();
