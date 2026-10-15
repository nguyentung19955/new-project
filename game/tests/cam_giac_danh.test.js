#!/usr/bin/env node
// SOÁT MƯỢT PHIÊN 2 — CẢM GIÁC ĐÁNH (docs/review/ke-hoach-cai-thien/soat-muot/bao-cao-phien-2.md), kiểm không cần trình duyệt.
// Chạy hai bản game trong Node qua tests/node_trang.js (DOM / canvas giả, ?cloud=0, G.noRender): bản thường và bản tắt hết cờ.
//   1. Cờ: mặc định bật cả 6 (G.RUNG_MUOT, G.DAY_LUI, G.AM_MOI, G.DUNG_MOI, G.CHOP_MO, G.CHAY_DANH_NANG); ?rungcu=1&dayluicu=1&amcu=1&dungcu=1
//      &chopmo=0&chaydanhnang=0 tắt cả 6.
//   2. Đẩy lùi (mục 7): quái thường trúng đòn lùi thật ~2,5 điểm ảnh, mượt qua nhiều khung (không nhảy một khung); quái giáp / tinh anh / trùm
//      hệ số nhỏ; không đẩy quá 80% tầm vũ khí; đòn kết (moves push) lùi đúng quãng cũ; đóng băng không lùi. Bản cũ: không lùi khi đánh thường.
//   3. Chạy + đánh nặng (mục 12A): búa / nhát kết kiếm hệ số đi 0,25; bản cũ như trước.
//   4. Bản lưu: G.fixSave giữ G.save.rungTat (nút "Rung màn" ở Anh Mõ); hàm âm thanh mới gọi được khi không có âm thanh.
// Chạy: node game/tests/cam_giac_danh.test.js
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
const TAT = 'rungcu=1&dayluicu=1&amcu=1&dungcu=1&chopmo=0&chaydanhnang=0';

// Đặt một quái đứng trước mặt người chơi trong phòng đang chơi, đánh trúng một lần rồi chạy luật n khung. Trả về quãng lùi (điểm ảnh).
function thuDay([role, n, dat]) {
  G.testSave({ lvl: 10 });
  G.startStage(0, 1, 0);
  const W = G.getWorld(), P = W.P;
  W.ents.length = 0; W.projs.length = 0; W.zones.length = 0;
  P.x = (W.x0 + W.x1) / 2 - 30; P.y = (W.y0 + W.y1) / 2; P.face = 1;
  const e = G.spawnEnemy(role, P.x + (dat === 'xa' ? 36 : 20), P.y);
  e.inside = true; e.speed = 0; e.cd = 99; e.hp = e.maxhp = 1e6; e.armor = role === 'shield' ? e.armor : 0;
  if (dat === 'bang') e.st.frozen = 5;
  const w = G.curW ? G.curW(P) : P.weapons[P.cur];
  const x0 = e.x, buoc = [];
  if (dat === 'ket') G.kbDay && G.DAY_LUI !== false ? G.kbDay(e, 1, 0, G.kbQuang(10), true) : (e.x += 10);
  else G.cb.playerHit(e, 1, { w, dir: 1 });
  for (let i = 0; i < n; i++) {
    // chỉ chạy phần đẩy lùi + giữ trong phòng của G.updateWorld (không cho quái tự đi, không cho bot đánh tiếp)
    const sp = e.speed; e.speed = 0; e.cd = 99; e.wind = 0;
    G.updateWorld(1 / 60, {});
    e.speed = sp;
    buoc.push(+(e.x - x0).toFixed(2));
  }
  return { lui: e.x - x0, buoc, vx: e.kbVx || 0 };
}

(async () => {
  const A = moTrang(''), B = moTrang(TAT);
  try {
    console.log('1. Cờ quay lui');
    const ca = await A.goi(() => [G.RUNG_MUOT, G.DAY_LUI, G.AM_MOI, G.DUNG_MOI, G.CHOP_MO, G.CHAY_DANH_NANG]);
    dat(ca.every((v) => v === true), 'bản thường: 6 cờ đều bật');
    const cb = await B.goi(() => [G.RUNG_MUOT, G.DAY_LUI, G.AM_MOI, G.DUNG_MOI, G.CHOP_MO, G.CHAY_DANH_NANG]);
    dat(cb.every((v) => v === false), '?' + TAT + ': 6 cờ đều tắt');

    console.log('2. Đẩy lùi thật (mục 7)');
    const thuong = await A.goi(thuDay, ['rusher', 40, '']);
    dat(thuong.lui > 1.5 && thuong.lui < 4, 'quái thường lùi ' + thuong.lui.toFixed(1) + ' điểm ảnh (đòn thường 2,5)');
    dat(thuong.buoc[0] > 0 && thuong.buoc[0] < 1 && thuong.buoc[5] < thuong.lui, 'lùi mượt qua nhiều khung (khung đầu ' + thuong.buoc[0] + ', khung 6 ' + thuong.buoc[5] + ')');
    const xa = await A.goi(thuDay, ['rusher', 40, 'xa']);
    dat(xa.lui < 0.3, 'quái ở sát mép tầm kiếm không bị đẩy ra khỏi tầm (lùi ' + xa.lui.toFixed(2) + ')');
    const giap = await A.goi(thuDay, ['shield', 40, '']);
    dat(giap.lui >= 0 && giap.lui < thuong.lui * 0.35, 'quái giáp hệ số nhỏ: lùi ' + giap.lui.toFixed(2));
    const tinh = await A.goi(thuDay, ['elite', 40, '']);
    dat(tinh.lui < thuong.lui * 0.7, 'tinh anh lùi ít hơn: ' + tinh.lui.toFixed(2));
    const ket = await A.goi(thuDay, ['rusher', 60, 'ket']);
    dat(Math.abs(ket.lui - 10) < 0.8, 'đòn kết lùi đúng quãng cũ 10 điểm ảnh (' + ket.lui.toFixed(2) + ') nhưng trải ra nhiều khung (khung đầu ' + ket.buoc[0] + ')');
    const bang = await A.goi(thuDay, ['rusher', 30, 'bang']);
    dat(Math.abs(bang.lui) < 0.01, 'đang đóng băng: không lùi');
    const cu = await B.goi(thuDay, ['rusher', 30, '']);
    dat(Math.abs(cu.lui) < 0.01, 'bản cũ (?dayluicu=1): đánh thường không dời quái');
    const cuKet = await B.goi(thuDay, ['rusher', 5, 'ket']);
    dat(Math.abs(cuKet.buoc[0] - 10) < 0.01, 'bản cũ: đòn kết dịch 10 điểm ảnh trong một khung');

    console.log('3. Chạy + đánh nặng đứng lại (mục 12A)');
    const tocDo = (wt) => {
      G.testSave({ lvl: 10, melee: wt }); G.startStage(0, 1, 0);
      const P = G.getWorld().P; P.cur = 0;
      P.atkT = 0.3; P.atkDur = 0.5; P.mv = P.mv || {}; P.mv.cur = { kind: wt === 'hammer' ? 'nen' : 'chem' }; P.comboI = 2;
      return G.moves.speedAtk(P);
    };
    const ba = await A.goi(tocDo, 'hammer'), bb = await B.goi(tocDo, 'hammer');
    dat(Math.abs(ba - 0.25) < 1e-9 && bb > 0.5, 'búa: hệ số đi khi đánh 0,25 (bản cũ ' + bb + ')');
    const ka = await A.goi(tocDo, 'sword');
    dat(Math.abs(ka - 0.25) < 1e-9, 'nhát kết kiếm (kiem_3): 0,25');

    console.log('4. Bản lưu, âm thanh');
    const sv = await A.goi(() => { const s = G.fixSave(JSON.parse(JSON.stringify(Object.assign(G.newSave(), { rungTat: true })))); return s.rungTat === true; });
    dat(sv, 'G.fixSave giữ rungTat (nút Rung màn: tắt)');
    const am = await A.goi(() => { G.amGhi(true, true); G.sfxDanh('hammer'); G.sfxVung(1, 0.5, 0.45, 0); G.sfx('swing', 1, 1, 0.1); return true; });
    dat(am, 'G.sfxDanh / G.sfxVung / G.sfx(tên, cao, to, trễ) chạy không lỗi khi không có âm thanh');
    console.log('ĐẠT ' + soDat + ' mục');
  } catch (e) {
    console.error(e.message); console.error(A.loi().slice(-800)); console.error(B.loi().slice(-800));
    process.exitCode = 1;
  } finally { A.dong(); B.dong(); }
})();
