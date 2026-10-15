#!/usr/bin/env node
// BƯỚC 3 — VÙNG 4 SÔNG SÂU, PHIÊN 1: kiểm khung vùng 4 chạy bằng hình tạm, không cần trình duyệt (docs/ke-hoach/buoc-3/KE-HOACH.md mục 5, 8).
// Chạy hai bản game trong Node qua tests/node_trang.js (DOM / canvas giả, ?cloud=0): bản thường (G.VUNG4) và bản ?vung4=0 (cờ quay lui).
//   1. Bảng số: 4 vùng / 20 ải ở bản thường; ?vung4=0 đúng 3 vùng / 15 ải (không phần tử thừa).
//   2. Bản lưu cũ 15 ải (mảnh trùm 3 ô, truyện v = 3): G.fixSave không lỗi, phần cũ giữ nguyên, thêm ô mảnh thứ 4 (bản thường);
//      ?vung4=0 giữ ô thứ 4 đã có (không xoá dữ liệu vùng 4); bản lưu có sao vùng 4 nạp ở ?vung4=0 không lỗi.
//   3. Mở khoá: vùng 4 mở khi hạ Hồ Tinh; Độ khó 2 ba vùng đầu như cũ; Độ khó 2 vùng 4 mở khi hạ Thuồng Luồng.
//   4. Chơi ải 4-1 và ải trùm 4-5 bằng bot (bất tử): quái mượn hình Hang biển, trùm Thuồng Luồng (chiêu Ngư Tinh), thưởng nguyên liệu vùng cũ,
//      mảnh Thuồng Luồng, kỷ lục b.thuong; không số NaN, không lỗi ngầm.
//   5. Vẽ: bản đồ hai trang + làng + Hành trang (VI + EN) không lỗi.
//   6. Lưu mây / bảng vàng: BOSSES có 'thuong'; luật Firestore cũ từ chối → ghi lại bản cắt far ≤ 15, sao ≤ 90, bỏ b_thuong.
// Chạy: node game/tests/vung4.test.js
'use strict';
const path = require('path'), fs = require('fs'), vm = require('vm'), { spawn } = require('child_process');
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

// bảng số theo vùng / ải (để so hai bản)
const BANG = () => ({
  vung: G.REGIONS.length, ten: G.REGIONS.map((r) => r.name), rec: G.STAGE_REC.length, kMob: G.STAGE_K.mob.length, kBoss: G.STAGE_K.boss.length,
  k2: G.STAGE_K_K2.mob.length, d2: G.DIFF2.length, d2r: G.DIFF2_REC.length, roi: [G.ROI_MOI.vk.vang.length, G.ROI_MOI.vk.lk.length, G.ROI_MOI.ruong.lk.length, G.ROI_MOI.ao.vang.length, G.ROI_MOI.aoTrum.vang.length],
  ep: [G.EP_DO.roi.mini.length, G.EP_DO.roi.miniDau.length, G.EP_DO.roi.vung.length, G.EP_DO.roi.vungDau.length],
  art: Object.keys(G.MOB_ART).filter((k) => Array.isArray(G.MOB_ART[k])).map((k) => G.MOB_ART[k].length), boss: Object.keys(G.MOB_ART.boss).sort(),
  hp: Object.keys(G.BOSS_HP_OF).sort(), sk: Object.keys(G.bossSK).sort(), soAi: G.SO_AI(), map2: !!(G.villageScene.MAP2), muon: G.VUNG4_MUON,
  bosses: G.cloud ? G.cloud.BOSSES.slice() : null, cap: G.REGIONS.map((r, i) => G.stageStats(i, 4, 0)).map((s) => Math.round(s.hp)),
  shardsMoi: G.newSave().shards.length,
});

(async () => {
  const A = moTrang(''), B = moTrang('vung4=0');
  try {
    // ---------- 1. bảng số ----------
    console.log('1. Bảng số theo vùng / ải');
    const a = await A.goi('(' + BANG.toString() + ')'), b = await B.goi('(' + BANG.toString() + ')');
    dat(a.vung === 4 && a.ten[3] === 'Sông sâu' && a.soAi === 20, 'bản thường: 4 vùng (vùng 4 "Sông sâu"), 20 ải');
    dat(a.rec === 20 && a.kMob === 20 && a.kBoss === 20 && a.k2 === 20, 'G.STAGE_REC, G.STAGE_K (mob, boss, độ khó 2) đủ 20 ải');
    dat(a.d2 === 4 && a.d2r === 4 && a.roi.every((n) => n === 4) && a.ep.every((n) => n === 4), 'G.DIFF2, G.DIFF2_REC, G.ROI_MOI, G.EP_DO.roi có phần tử thứ 4');
    dat(a.art.every((n) => n === 4) && a.boss.includes('thuong') && a.hp.includes('thuong') && a.sk.includes('thuong'), 'G.MOB_ART mọi vai 4 vùng, trùm thuong có hình, máu, bộ chiêu');
    dat(a.map2 && a.muon === 1 && a.bosses.includes('thuong') && a.shardsMoi === 4, 'bản đồ trang 2, hình tạm mượn Hang biển, BOSSES có thuong, bản lưu mới 4 ô mảnh');
    dat(a.cap[3] > a.cap[2], 'máu quái ải trùm vùng 4 > vùng 3 (' + a.cap[2] + ' → ' + a.cap[3] + ')');
    dat(b.vung === 3 && b.soAi === 15 && b.rec === 15 && b.kMob === 15 && b.kBoss === 15 && b.k2 === 15 && b.d2 === 3 && b.d2r === 3, '?vung4=0: 3 vùng, 15 ải ở mọi bảng');
    dat(b.roi.every((n) => n === 3) && b.ep.every((n) => n === 3) && b.art.every((n) => n === 3), '?vung4=0: bảng rơi / hình quái đúng 3 phần tử');
    dat(!b.boss.includes('thuong') && !b.hp.includes('thuong') && !b.sk.includes('thuong') && !b.map2 && b.muon === null && !b.bosses.includes('thuong') && b.shardsMoi === 3,
      '?vung4=0: không trùm thuong, không trang bản đồ 2, BOSSES 3, bản lưu mới 3 ô mảnh');
    const giong = JSON.stringify(Object.assign({}, a, { vung: 0, ten: 0, rec: 0, kMob: 0, kBoss: 0, k2: 0, d2: 0, d2r: 0, roi: 0, ep: 0, art: 0, boss: 0, hp: 0, sk: 0, soAi: 0, map2: 0, muon: 0, bosses: 0, cap: a.cap.slice(0, 3), shardsMoi: 0 }))
      === JSON.stringify(Object.assign({}, b, { vung: 0, ten: 0, rec: 0, kMob: 0, kBoss: 0, k2: 0, d2: 0, d2r: 0, roi: 0, ep: 0, art: 0, boss: 0, hp: 0, sk: 0, soAi: 0, map2: 0, muon: 0, bosses: 0, shardsMoi: 0 }));
    dat(giong, 'số của 3 vùng cũ giống hệt nhau ở hai bản');
    const so3 = (x) => x.goi(() => JSON.stringify({ rec: G.STAGE_REC.slice(0, 15), k: G.STAGE_K, d2: G.DIFF2.slice(0, 3), st: [0, 1, 2].map((r) => [0, 1, 2, 3, 4].map((i) => G.stageStats(r, i, 0))),
      st2: [0, 1, 2].map((r) => [0, 1, 2, 3, 4].map((i) => G.stageStats(r, i, 1))), rr: [0, 1, 2].map((r) => [0, 4].map((i) => [G.stageRec(r, i, 0), G.stageRec(r, i, 1)])),
      roi: G.ROI_MOI, ep: G.EP_DO.roi, art: G.MOB_ART }, (k, v) => (Array.isArray(v) && v.length === 4 ? v.slice(0, 3) : Array.isArray(v) && v.length === 20 ? v.slice(0, 15) : k === 'thuong' ? undefined : v)));
    const s3a = await so3(A), s3b = await so3(B);
    dat(s3a === s3b, 'stageStats / khuyên dùng / rơi đồ / hình quái của 15 ải cũ: bản thường == ?vung4=0');

    // ---------- 2. bản lưu cũ ----------
    console.log('2. Bản lưu cũ 15 ải');
    const banCu = await A.goi(() => {
      G.testSave({ lvl: 32, sharpen: 9 });
      const s = G.save;
      for (let r = 0; r < 3; r++) for (let i = 0; i < 5; i++) s.stars[r + '-' + i] = 3;
      s.mats = [11, 22, 33]; s.shards = [3, 4, 5]; s.truyen = { mo: 1, v: 3, n: { ren: 3 } }; s.rec = { power: 400, b: { moc: 60, ngu: 70, ho: 80 } };
      return JSON.stringify(s);
    });
    const kq2 = async (X, json) => X.goi((j) => {
      const o = JSON.parse(j);
      let sv, loi = null;
      try { sv = G.fixSave(JSON.parse(j)); } catch (e) { loi = String(e && e.stack || e); }
      if (loi) return { loi };
      G.save = sv; G.persist();
      let nap = null; try { nap = G.loadSave(); } catch (e) { loi = 'loadSave: ' + e; }
      const giu = ['gold', 'ore', 'mats', 'stars', 'stars2', 'scars', 'hero'].every((k) => JSON.stringify(sv[k]) === JSON.stringify(o[k]));
      return { loi, giu, shards: sv.shards, mats: sv.mats, tv: sv.truyen && sv.truyen.v, napDuoc: !!nap || !!G.save, sao: Object.keys(sv.stars).length };
    }, json);
    const r2a = await kq2(A, banCu), r2b = await kq2(B, banCu);
    dat(!r2a.loi && r2a.giu && r2a.sao === 15, 'bản thường: nạp bản lưu cũ không lỗi, phần cũ giữ nguyên (15 sao, nguyên liệu, vàng, quặng)');
    dat(JSON.stringify(r2a.shards) === '[3,4,5,0]' && JSON.stringify(r2a.mats) === '[11,22,33]', 'bản thường: mảnh trùm thêm ô thứ 4 = 0, nguyên liệu vẫn 3 ô');
    dat(!r2b.loi && r2b.giu && JSON.stringify(r2b.shards) === '[3,4,5]', '?vung4=0: bản lưu cũ y như cũ (mảnh 3 ô)');
    const banV4 = await A.goi((j) => { const s = JSON.parse(j); for (let i = 0; i < 5; i++) s.stars['3-' + i] = 2; s.shards = [3, 4, 5, 7]; s.rec.b.thuong = 99; return JSON.stringify(s); }, banCu);
    const r2c = await kq2(B, banV4), r2d = await kq2(A, banV4);
    dat(!r2c.loi && r2c.sao === 20 && JSON.stringify(r2c.shards) === '[3,4,5,7]', '?vung4=0 nạp bản lưu đã chơi vùng 4: không lỗi, giữ sao và mảnh vùng 4 (không xoá)');
    dat(!r2d.loi && JSON.stringify(r2d.shards) === '[3,4,5,7]', 'bản thường nạp lại: mảnh Thuồng Luồng còn nguyên');
    const veB = await B.goi(() => { const V = G.villageApi.V, loi = []; try { G.setScene(G.Village); V.tab = 'map'; G.Village.draw(); V.tab = 'hub'; G.Village.draw(); } catch (e) { loi.push(String(e && e.stack || e)); } return loi; });
    dat(!veB.length, '?vung4=0: vẽ bản đồ + làng với bản lưu có sao vùng 4 không lỗi' + (veB.length ? ': ' + veB[0] : ''));

    // ---------- 3. mở khoá ----------
    console.log('3. Mở khoá vùng 4');
    const mk = await A.goi(() => {
      G.testSave({ lvl: 40, sharpen: 15 });
      const s = G.save, V = G.villageApi.V, VA = G.villageApi, out = {}, loi = [];
      const mo = () => { VA.open('lai'); try { G.Village.draw(); } catch (e) { loi.push(String(e && e.stack || e)); } return [V.sel ? V.sel.join('-') : null, V.mapTrang | 0]; };
      for (let r = 0; r < 3; r++) for (let i = 0; i < 5; i++) if (r < 2 || i < 4) s.stars[r + '-' + i] = 3;
      V.diff = 0; out.truoc = mo();
      s.stars['2-4'] = 3; out.sau = mo();
      // độ khó 2: đã qua đủ 15 ải độ khó 2 mà chưa hạ Thuồng Luồng → không chọn vùng 4; hạ rồi thì ải đang tới là 4-1 khó 2
      for (let r = 0; r < 3; r++) for (let i = 0; i < 5; i++) s.stars2[r + '-' + i] = 1;
      V.diff = 1; out.kho2Chua = mo(); out.kho2ChuaD = V.diff;
      for (let i = 0; i < 5; i++) s.stars['3-' + i] = 2;
      V.diff = 1; out.kho2Roi = mo(); out.kho2RoiD = V.diff;
      V.diff = 0;
      return Object.assign(out, { loi });
    });
    dat(mk.truoc[0] === '2-4' && mk.truoc[1] === 0, 'chưa hạ Hồ Tinh: ải đang tới 3-5, bản đồ trang 1');
    dat(mk.sau[0] === '3-0' && mk.sau[1] === 1, 'hạ Hồ Tinh: ải đang tới 4-1, bản đồ tự mở trang Sông sâu');
    dat(mk.kho2Chua[0] !== '3-0' && mk.kho2ChuaD === 1, 'độ khó 2: chưa hạ Thuồng Luồng thì vùng 4 khó 2 chưa mở (' + mk.kho2Chua[0] + ')');
    dat(mk.kho2Roi[0] === '3-0' && mk.kho2Roi[1] === 1, 'độ khó 2: hạ Thuồng Luồng rồi → 4-1 khó 2 mở');
    dat(!mk.loi.length, 'vẽ bản đồ ở mọi bước không lỗi' + (mk.loi.length ? ': ' + mk.loi[0] : ''));

    // ---------- 4. chơi vùng 4 ----------
    console.log('4. Chơi ải vùng 4 (bot bất tử)');
    const choi = (r, i) => A.goi((ri) => {
      const [r, i] = ri;
      const s = G.save;
      for (let rr = 0; rr < 3; rr++) for (let ii = 0; ii < 5; ii++) s.stars[rr + '-' + ii] = 3;
      for (let ii = 0; ii < i; ii++) s.stars[r + '-' + ii] = 1;
      const mats0 = s.mats.slice(), shards0 = s.shards.slice();
      const h0 = G.hurtPlayer; G.hurtPlayer = function () { return false; }; // bất tử: chỉ kiểm luồng chạy, không kiểm độ khó
      let out, loi = null, info = {};
      try {
        G.startStage(r, i, 0);
        const S = G.getRun();
        info.region = S.W && S.W.region; info.r = S.r;
        out = G.probeRun(i === 4 ? 900 : 500);
        const S2 = G.getRun();
        info.boss = S2 && S2.W && S2.W.boss ? { kind: S2.W.boss.kind, art: S2.W.boss.art, name: S2.W.boss.name } : null;
      } catch (e) { loi = String(e && e.stack || e); } finally { G.hurtPlayer = h0; }
      const nghe = G.nhac && G.nhac.chonBai ? (() => { try { return G.nhac.chonBai(); } catch (e) { return 'loi ' + e; } })() : null;
      return { loi, out, info, mats0, shards0, mats: s.mats.slice(), shards: s.shards.slice(), sao: s.stars[r + '-' + i] || 0, recB: s.rec && s.rec.b, nghe };
    }, [r, i]);
    await A.goi(() => { G.testSave({ lvl: 40, sharpen: 15, branch: 'fire', marksMoi: 5000 }); return 1; });
    const c1 = await choi(3, 0);
    dat(!c1.loi && c1.info.region === 3 && c1.info.r === 3, 'vào ải 4-1: W.region = 3' + (c1.loi ? ' — ' + c1.loi : ''));
    dat(c1.out && !c1.out.bad.length, 'không số NaN / quái ngoài phòng' + (c1.out && c1.out.bad.length ? ': ' + c1.out.bad.slice(0, 3).join(', ') : ''));
    dat(c1.out.win === true && c1.sao >= 1, 'bot qua ải 4-1 (' + c1.out.kills + ' quái, ' + c1.out.t + ' giây)');
    const mi1 = await A.goi(() => G.matAi(3, 0));
    dat(c1.mats[mi1] > c1.mats0[mi1] && c1.mats.length === 3, 'thưởng nguyên liệu vùng cũ (ô ' + mi1 + ': ' + c1.mats0[mi1] + ' → ' + c1.mats[mi1] + '), không có ô nguyên liệu thứ 4');
    const c5 = await choi(3, 4);
    dat(!c5.loi && c5.info.boss === null || (c5.info.boss && c5.info.boss.kind === 'thuong'), 'ải 4-5: trùm kind thuong' + (c5.loi ? ' — ' + c5.loi : ''));
    dat(c5.out && !c5.out.bad.length, 'trận Thuồng Luồng: không số NaN' + (c5.out && c5.out.bad.length ? ': ' + c5.out.bad.slice(0, 3).join(', ') : ''));
    dat(c5.out.win === true && c5.shards[3] === c5.shards0[3] + 3, 'hạ Thuồng Luồng: +3 mảnh Thuồng Luồng (' + c5.shards0[3] + ' → ' + c5.shards[3] + ')');
    dat(c5.recB && c5.recB.thuong > 0, 'kỷ lục thời gian hạ Thuồng Luồng (b.thuong = ' + (c5.recB && c5.recB.thuong) + ' giây)');
    const nhac = await A.goi(() => { const S = { r: 3, W: { type: 'fight' }, mode: 'play' }; const g0 = G.getRun, sc0 = G.scene; G.getRun = () => S; G.scene = G.StageScene; let v; try { v = G.nhac && G.nhac.chonBai ? G.nhac.chonBai() : 'khong'; } catch (e) { v = 'loi ' + e; } G.getRun = g0; G.scene = sc0; return v; });
    dat(typeof nhac === 'string' && /^vung[0-3]$|^khong$/.test(nhac), 'nhạc vùng 4 chọn được bài (' + nhac + ')');

    // ---------- 5. vẽ ----------
    console.log('5. Vẽ bản đồ hai trang, làng, Hành trang (VI + EN)');
    const ve = await A.goi(() => {
      const V = G.villageApi.V, loi = [];
      for (const lang of ['vi', 'en']) {
        G.ngonNgu.dat(lang, false);
        try {
          G.setScene(G.Village);
          for (const tr of [0, 1]) for (const d of [0, 1]) { V.tab = 'map'; V.mapTrang = tr; V.diff = d; V.sel = tr ? [3, 2] : [1, 1]; G.Village.draw(); }
          V.tab = 'hub'; G.Village.draw();
          V.tab = 'bag'; if (G.hanhTrang.reset) G.hanhTrang.reset(); G.hanhTrang.tab = 'res'; G.Village.draw(); V.tab = 'hub'; // Hành trang, thẻ Tài nguyên (mảnh Thuồng Luồng)
        } catch (e) { loi.push(lang + ': ' + String(e && e.stack || e)); }
      }
      G.ngonNgu.dat('vi', false);
      const thieu = G.ngonNgu ? [...G.ngonNgu.thieu].filter((s) => /sông|thuồng|cá trê|ba vùng/i.test(s)) : [];
      return { loi, thieu, map2: G.villageScene.mapArt2(false).width };
    });
    dat(!ve.loi.length, 'vẽ bản đồ trang 1 + 2 (ngày / đêm), làng, Hành trang thẻ Tài nguyên, VI + EN không lỗi' + (ve.loi.length ? ': ' + ve.loi[0] : ''));
    dat(ve.map2 === 480, 'tranh Sông sâu 480 × 270');
    dat(!ve.thieu.length, 'tên mới có tiếng Anh' + (ve.thieu.length ? ': ' + JSON.stringify(ve.thieu) : ''));

    // ---------- 6. bảng vàng: luật Firestore cũ ----------
    console.log('6. Bảng vàng khi luật Firestore chưa đổi');
    const bv = await bangVangLuatCu();
    dat(bv.lan === 2 && bv.ghi.far === 15 && bv.ghi.stars === 90 && !('b_thuong' in bv.ghi) && bv.ghi.b_ho === 80, 'luật cũ từ chối → ghi lại bản cắt (far 15, sao 90, bỏ b_thuong, giữ b_ho)');
    dat(bv.lan2 === 1 && bv.luatCu, 'lần sau ghi thẳng bản cắt (không bị từ chối lần nữa)');
    dat(bv.moi.far === 20 && bv.moi.b_thuong === 120, 'luật mới nhận: ghi đủ far 20, b_thuong');

    const loiA = A.loi().split('\n').filter((l) => /TypeError|ReferenceError|RangeError|is not a function|Cannot read/.test(l));
    dat(!loiA.length, 'không lỗi ngầm trong bản thường' + (loiA.length ? ': ' + loiA.slice(0, 3).join(' | ') : ''));
    console.log('\nPASS — ' + soDat + ' điều kiện');
  } catch (e) {
    console.error(e && e.stack || e);
    console.error('stderr A:', A.loi().slice(-1500));
    process.exitCode = 1;
  } finally { A.dong(); B.dong(); }
})();

// js/cloud.js riêng trong vm (như tests/cloud_save_regression.test.js), G.VUNG4 bật; Firestore giả từ chối far > 15 / b_thuong (luật cũ) hoặc nhận hết (luật mới).
async function bangVangLuatCu() {
  const mk = (luatMoi) => {
    const G = { VUNG4: true, VERSION: 'test', REGIONS: [], HKEYS: [], save: { stars: {}, stars2: {}, heroes: {}, weapons: [] }, persist() {}, loadSave() {} };
    const ctx = { G, location: { search: '', protocol: 'https:', origin: 'https://x.test' }, navigator: { onLine: true }, document: { createElement() { return {}; }, head: { appendChild() {} } },
      addEventListener() {}, setTimeout, clearTimeout, Promise, Date, JSON, Math, String, Array, Object, Error, isFinite, console };
    ctx.window = ctx; ctx.top = ctx; ctx.self = ctx;
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'cloud.js'), 'utf8'), ctx, { filename: 'js/cloud.js' });
    const C = G.cloud; C.ready = true; C.enabled = true; C.why = ''; C.user = { uid: 'u', isAnonymous: false }; C.online = () => true;
    const st = { lan: 0, ghi: null };
    C.myScore = { name: 'Bé', power: 500, stars: 45, far: 15, hero: 'smith', g: true, at: 1, b_moc: 60, b_ngu: 70, b_ho: 80 };
    C.db = { collection: () => ({ doc: () => ({ set: async (x) => { st.lan++; if (!luatMoi && ((x.far | 0) > 15 || (x.stars | 0) > 90 || 'b_thuong' in x)) { const e = new Error('denied'); e.code = 'permission-denied'; throw e; } st.ghi = x; } }) }) };
    return { C, st };
  };
  const e = { name: 'Bé', power: 650, stars: 100, far: 20, hero: 'smith', b: { moc: 60, ngu: 70, ho: 80, thuong: 120 } };
  const L = mk(false);
  await L.C.submitScore(e);
  const lan = L.st.lan, ghi = L.st.ghi;
  L.st.lan = 0;
  await L.C.submitScore(Object.assign({}, e, { power: 700 }));
  const N = mk(true);
  await N.C.submitScore(e);
  return { lan, ghi, lan2: L.st.lan, luatCu: !!L.C.luatCu, moi: N.st.ghi || {} };
}
