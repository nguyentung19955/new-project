#!/usr/bin/env node
// CẢM GIÁC ĐÁNH RIÊNG 4 MÓN + ĐÒN NỐI KHI ĐỔI VŨ KHÍ (16/10, docs/review/ke-hoach-cai-thien/vu-khi-chatgpt/bao-cao-B.md). Không cần trình duyệt:
// chạy hai bản game trong Node qua tests/node_trang.js (DOM / canvas giả, ?cloud=0): bản thường và bản ?camgiac=0&donnoi=0.
//   1. Cờ: G.CAM_GIAC_VK, G.BU_KHUNG, G.DON_NOI bật mặc định; ?camgiac=0&donnoi=0 tắt.
//   2. Khựng hình theo món (G.fx.khungVk): kiếm 45 / nhát kết 70, thương 55 / quét 65, búa 90 / nện đất 110 (trùm 50), phi tiêu 25 / 35;
//      phần dài hơn số cũ được ghi để trả lại cho đồng hồ đòn.
//   3. Đẩy lùi theo món: kiếm ~4, thương ~2,5, búa ~10, phi tiêu ~1 điểm ảnh; bản tắt cờ: kiếm 2,5 như cũ.
//   4. Bot đánh một quái đứng yên (chỉ bị đẩy, không tự đi lại) 8 giây bằng từng món cận chiến: MỌI lúc chạm của chuỗi đều trúng
//      (quái không bị đẩy ra khỏi tầm làm hụt nhát sau).
//   5. Đòn nối: trúng → đổi trong 0,18 giây → vũ khí mới ra một đòn = k x đòn thường đầu chuỗi, không cộng mana, không thêm thời gian chờ
//      đòn; mỗi món một lần trong chuỗi; quá cửa sổ hoặc ?donnoi=0 thì không có.
// Chạy: node game/tests/cam_giac_vk.test.js
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

// Dựng phòng trống, cầm món wt, một quái đứng yên cách dx điểm ảnh. Trả { W, P, e, w }.
function dung(wt, dx, role) {
  G.testSave({ lvl: 10, melee: wt === 'bow' ? 'sword' : wt });
  G.startStage(0, 1, 0);
  const W = G.getWorld(), P = W.P;
  W.ents.length = 0; W.projs.length = 0; W.zones.length = 0; W.waves = []; W.spawns = [];
  P.x = (W.x0 + W.x1) / 2 - 40; P.y = (W.y0 + W.y1) / 2; P.face = 1; P.crit = 0;
  const i = P.weapons.findIndex((x) => x.type === wt); if (i >= 0) P.cur = i;
  const e = G.spawnEnemy(role || 'rusher', P.x + dx, P.y);
  e.inside = true; e.speed = 0; e.cd = 99; e.hp = e.maxhp = 1e6; e.armor = 0; e.spawnT = 0;
  return { W, P, e, w: G.curW(P) };
}

function thuDay([wt, dx]) {
  const { e, w } = window.__dung(wt, dx);
  const x0 = e.x;
  G.cb.playerHit(e, 1, { w, dir: 1, ranged: wt === 'bow' });
  for (let i = 0; i < 60; i++) { e.speed = 0; e.cd = 99; e.wind = 0; G.updateWorld(1 / 60, {}); }
  return +(e.x - x0).toFixed(2);
}

// Bot giữ / bấm nút Đánh 8 giây; quái chỉ bị đẩy (không tự đi, không đánh), về chỗ cũ đầu mỗi chuỗi. Đếm lúc chạm (hitDone false → true)
// và lúc chạm có trúng quái: nhát 2, 3 (4) của chuỗi vẫn trúng sau khi quái bị đẩy bởi các nhát trước.
function thuChuoi([wt, dx]) {
  const { P, e } = window.__dung(wt, dx);
  let cham = 0, trung = 0, xMax = 0;
  const x0 = e.x;
  for (let f = 0; f < 8 * 60; f++) {
    e.speed = 0; e.cd = 99; e.wind = 0; e.st.stun = 0;
    // đầu mỗi chuỗi (nhát đầu chưa chạm) quái về chỗ cũ: đòn kết (G.MOVES push, có từ trước) cố ý hất quái ra xa ở CUỐI chuỗi
    if (P.atkT > 0 && !P.hitDone && P.mv && P.mv.cur && (P.mv.cur.step | 0) === 0) { e.x = x0; e.kbVx = e.kbVy = 0; }
    const truoc = P.hitDone, hp = e.hp;
    const inp = { mx: 0, my: 0, atk: wt === 'sword' ? true : f % 4 === 0, atkP: wt === 'sword' ? f === 0 : f % 4 === 0 };
    G.updateWorld(1 / 60, inp);
    if (P.x < x0 - 200) break;
    if (truoc === false && P.hitDone === true && P.atkT > 0) { cham++; if (e.hp < hp) trung++; }
    xMax = Math.max(xMax, e.x - P.x);
    P.mana = 0; // không dùng Đặc biệt
  }
  return { cham, trung, xa: +xMax.toFixed(1) };
}

// Đòn nối: kiếm trúng rồi đổi; trả các số đo.
function thuNoi(kieu) {
  const { W, P, e } = window.__dung('sword', 20);
  const iS = P.weapons.findIndex((x) => x.type === 'sword');
  const ke = P.weapons[(iS + 1) % P.weapons.length];
  const buoc = (inp, n) => { for (let i = 0; i < (n || 1); i++) { e.speed = 0; e.cd = 99; G.updateWorld(1 / 60, Object.assign({ mx: 0, my: 0 }, i === 0 ? inp : {})); } };
  G.cb.playerHit(e, 1, { w: G.curW(P), dir: 1 });
  if (kieu === 'tre') buoc({}, 15); // 0,25 giây: quá cửa sổ
  const hp0 = e.hp, mana0 = P.mana, n0 = W.stats.donNoi | 0;
  buoc({ swapP: true });
  const sau = { mat: hp0 - e.hp, mana: P.mana - mana0, noi: (W.stats.donNoi | 0) - n0, cd: P.cdT, loai: G.curW(P).type, ke: ke.type };
  const C = G.MOVES, m = ke.type === 'spear' ? C.spear.chain[0] : ke.type === 'hammer' ? C.hammer.swing : ke.type === 'bow' ? C.bow.shot : C.sword.chain[0];
  sau.mong = G.pDamage(P, ke) * m.mult * (G.DON_NOI_SO ? G.DON_NOI_SO.k : 0.7);
  if (ke.type === 'bow') { buoc({}, 30); sau.mat = hp0 - e.hp; } // phi tiêu bay tới quái
  // lần đổi thứ hai, thứ ba trong cùng chuỗi: món đã nối không nối lại
  const lan = [];
  for (let k = 0; k < P.weapons.length + 1; k++) {
    buoc({}, 46); // chờ hết 0,75 giây đổi
    G.cb.playerHit(e, 1, { w: G.curW(P), dir: 1 });
    const t0 = W.stats.donNoi | 0;
    buoc({ swapP: true });
    lan.push({ loai: G.curW(P).type, noi: (W.stats.donNoi | 0) - t0, t: P.t });
  }
  sau.lan = lan;
  return sau;
}

(async () => {
  const A = moTrang(''), B = moTrang('camgiac=0&donnoi=0');
  try {
    for (const T of [A, B]) await T.goi('(window.__dung = ' + dung.toString() + ', 1)');
    console.log('1. Cờ');
    dat((await A.goi(() => [G.CAM_GIAC_VK, G.BU_KHUNG, G.DON_NOI])).every((v) => v === true), 'bản thường: G.CAM_GIAC_VK, G.BU_KHUNG, G.DON_NOI bật');
    dat((await B.goi(() => [G.CAM_GIAC_VK, G.DON_NOI])).every((v) => v === false), '?camgiac=0&donnoi=0: tắt');
    dat(await A.goi(() => G.SWAP_CD === 0.75 && G.DON_NOI_SO.cua === 0.18), 'thời gian chờ đổi giữ 0,75 giây, cửa sổ đòn nối 0,18 giây');

    console.log('2. Khựng hình theo món');
    const kv = await A.goi(() => {
      const f = G.fx.khungVk, r = (type, o, boss) => f(boss ? { isBoss: true } : {}, Object.assign({ type }, o));
      return {
        kiem: r('sword', {})[0], kiemKet: r('sword', { heavy: true })[0], dam: r('spear', {})[0], quet: r('spear', { heavy: true })[0],
        bua: r('hammer', {}), buaNang: r('hammer', { heavy: true })[0], buaTrum: r('hammer', {}, true)[0],
        tieu: r('bow', { ranged: true })[0], tieuChum: r('bow', { ranged: true, heavy: true })[0], kiemCm: r('sword', { crit: true })[0],
      };
    });
    dat(kv.kiem === 45 && kv.kiemKet === 70, 'kiếm 45 ms, nhát kết 70 ms');
    dat(kv.dam === 55 && kv.quet === 65, 'thương đâm 55 ms, quét 65 ms');
    dat(kv.bua[0] === 90 && kv.buaNang === 110 && kv.buaTrum === 50, 'búa nện 90 ms, nện đất 110 ms, đánh trùm chỉ 50 ms');
    dat(kv.tieu === 25 && kv.tieuChum === 35, 'phi tiêu 25 ms, ném chùm 35 ms');
    dat(Math.abs(kv.bua[1] - (1 - 70 / 90)) < 1e-9, 'búa: phần khựng dài hơn số cũ (70 → 90 ms) được trả lại cho đồng hồ đòn');
    dat(kv.kiemCm <= 115, 'chí mạng không quá 115 ms (' + kv.kiemCm + ')');

    console.log('3. Đẩy lùi theo món');
    const d = {};
    for (const [wt, dx] of [['sword', 20], ['spear', 30], ['hammer', 18], ['bow', 60]]) d[wt] = await A.goi(thuDay, [wt, dx]);
    dat(d.sword >= 3 && d.sword <= 5, 'kiếm lùi ' + d.sword + ' điểm ảnh (3–5)');
    dat(d.spear >= 1.8 && d.spear <= 3, 'thương lùi ' + d.spear + ' (2–3)');
    dat(d.hammer >= 8 && d.hammer <= 12, 'búa lùi ' + d.hammer + ' (8–12)');
    dat(d.bow >= 0 && d.bow <= 2, 'phi tiêu lùi ' + d.bow + ' (0–2)');
    const cu = await B.goi(thuDay, ['sword', 20]);
    dat(cu > 1.5 && cu < 3, 'tắt cờ: kiếm lùi ' + cu + ' như cũ (2,5)');
    const trum = await A.goi(() => G.kbHeSo({ isBoss: true, st: {} }) * G.DAY_VK.hammer[1]);
    dat(trum <= 3, 'trùm không bị đẩy mạnh: búa nặng nhất lên trùm ' + trum.toFixed(1) + ' điểm ảnh');

    console.log('4. Bot: quái không bị đẩy ra khỏi tầm làm hụt nhát sau');
    for (const [wt, dx] of [['sword', 18], ['spear', 34], ['hammer', 16]]) {
      const r = await A.goi(thuChuoi, [wt, dx]);
      dat(r.cham >= 8 && r.trung === r.cham, wt + ': ' + r.trung + '/' + r.cham + ' lúc chạm đều trúng (quái xa nhất ' + r.xa + ' điểm ảnh)');
    }

    console.log('5. Đòn nối khi đổi vũ khí');
    const n = await A.goi(thuNoi, '');
    dat(n.noi === 1 && n.loai === n.ke, 'trúng rồi đổi trong 0,18 giây: ' + n.ke + ' tự ra 1 đòn nối');
    dat(Math.abs(n.mat - n.mong) < n.mong * 0.25 + 0.5, 'sát thương đòn nối ' + n.mat.toFixed(1) + ' ≈ k x đòn đầu chuỗi ' + n.mong.toFixed(1));
    dat(n.mana < 1 && n.cd <= 0.1, 'không cộng mana đánh trúng (mana +' + n.mana.toFixed(2) + ', chỉ hồi theo thời gian), không thêm thời gian chờ đòn (cdT ' + n.cd.toFixed(2) + ')');
    // chuỗi: hết khi quá DON_NOI_SO.chuoi giây kể từ đòn nối gần nhất; trong chuỗi món đã nối không nối lại
    const chuoi = await A.goi(() => G.DON_NOI_SO.chuoi);
    let lap = { [n.ke]: 1 }, tCuoi = n.lan.length ? n.lan[0].t - 0.77 : 0, lapLai = false, coTu = false;
    for (const l of n.lan) {
      if (l.t - tCuoi > chuoi) lap = {};
      if (l.noi && lap[l.loai]) lapLai = true;
      if (!l.noi && lap[l.loai]) coTu = true;
      if (l.noi) { lap[l.loai] = 1; tCuoi = l.t; }
    }
    dat(!lapLai && coTu, 'mỗi món chỉ nối một lần trong chuỗi (+ có nối, - bị chặn vì đã nối): ' + n.ke + '+ ' + n.lan.map((l) => l.loai + (l.noi ? '+' : '-')).join(' '));
    const tre = await A.goi(thuNoi, 'tre');
    dat(tre.noi === 0, 'đổi sau 0,25 giây (quá cửa sổ): không có đòn nối');
    const tat = await B.goi(thuNoi, '');
    dat(tat.noi === 0 && tat.mat === 0, '?donnoi=0: không có đòn nối');
    console.log('ĐẠT ' + soDat + ' mục');
  } catch (e) {
    console.error(e.message); console.error(A.loi().slice(-800)); console.error(B.loi().slice(-800));
    process.exitCode = 1;
  } finally { A.dong(); B.dong(); }
})();
