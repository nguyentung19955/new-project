#!/usr/bin/env node
// BỘ ĐỒ MUA BẰNG VÀNG (15/10, docs/review/ke-hoach-cai-thien/bo-do-mua): kiểm luật trong Node (tests/node_trang.js, ?cloud=0), không trình duyệt.
//   1. Bản lưu cũ (chưa có cờ zed.boMua) có bộ Biển cấp 2 đang mặc → nạp lại vẫn có, vẫn cấp 2, vẫn đang mặc; bản lưu cũ đã hạ Mộc Tinh
//      mà chưa có bộ Rừng → được tặng bù (luật cũ), không bắt mua. Qua cả VM.canLai (bản lưu chưa cân lại).
//   2. Bản lưu mới: hạ Mộc Tinh (bot bất tử chơi ải 1-5) → bộ Rừng MỞ BÁN nhưng CHƯA CÓ (không mặc / nâng được), dòng báo kết quả, dấu báo làng;
//      nạp lại (fixSave) không tặng bù.
//   3. Mua: đủ vàng → trừ đúng giá G.BO_MUA, có bộ, nâng cấp 1 được; thiếu vàng → không mua, vàng giữ nguyên; bộ chưa mở bán → không mua.
//   4. ?bocu=1: hạ trùm là có bộ như cũ, không mua được.
//   5. Vẽ bảng Cô Thợ May (thẻ Nâng cấp, Mua) VI + EN không lỗi; bản lưu đi qua JSON (lưu mây) giữ nguyên.
// Chạy: node game/tests/bo_do_mua.test.js
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

// chơi ải trùm vùng r (bot bất tử) trên bản lưu đang có
const CHOI_TRUM = (r) => {
  const s = G.save;
  for (let rr = 0; rr < r; rr++) for (let ii = 0; ii < 5; ii++) s.stars[rr + '-' + ii] = 3;
  for (let ii = 0; ii < 4; ii++) s.stars[r + '-' + ii] = 1;
  const h0 = G.hurtPlayer; G.hurtPlayer = function () { return false; };
  let out = null, loi = null, lines = [];
  try {
    G.startStage(r, 4, 0);
    out = G.probeRun(900);
    const R = G.getRun() && G.getRun().result;
    if (R && R.lines) lines = R.lines.map((q) => (typeof q === 'string' ? q : q && (q.s || q.t || JSON.stringify(q))));
  } catch (e) { loi = String(e && e.stack || e); } finally { G.hurtPlayer = h0; }
  const z = s.zed || {};
  return { loi, win: !!(out && out.win), sao: s.stars[r + '-4'] || 0, boMo: z.boMo || null, boBan: z.boBan || null, boMua: z.boMua, boBanBao: z.boBanBao, lines };
};

(async function () {
  const A = moTrang('');
  try {
    console.log('1. Bản lưu cũ giữ nguyên bộ đã có');
    const cu = await A.goi(() => {
      G.resetSave();
      const s = JSON.parse(JSON.stringify(G.save));
      for (let rr = 0; rr < 2; rr++) for (let ii = 0; ii < 5; ii++) s.stars[rr + '-' + ii] = 2;
      s.zed = { v: 1, hoc: { hunter: 1, healer: 1 }, boMo: { bien: 1 }, bo: 'bien' }; // bộ Rừng chưa có trong boMo (bản cũ mở bù lúc nạp)
      s.boCap = { bien: 2, ninja: 1 };
      s.gold = 1234;
      const a = G.fixSave(JSON.parse(JSON.stringify(s)));
      const c = JSON.parse(JSON.stringify(s)); delete c.canLai; // bản chưa cân lại: VM.canLai chạy
      const b = G.fixSave(c);
      const k = (x) => ({ bien: G.zedBoMo('bien', x), rung: G.zedBoMo('rung', x), lau: G.zedBoMo('lau', x), capBien: G.vkMoi.boCap(x, 'bien'), capNinja: G.vkMoi.boCap(x, 'ninja'), mac: G.zedBo(x), boMua: x.zed.boMua, gold: x.gold, banLau: G.zedBoBan('lau', x) });
      // nạp lần hai (đã có boMua) không mất gì
      const a2 = G.fixSave(JSON.parse(JSON.stringify(a)));
      return { a: k(a), b: k(b), a2: k(a2), canLai: b.canLai };
    });
    dat(cu.a.bien && cu.a.capBien === 2 && cu.a.mac === 'bien', 'bản lưu cũ có bộ Biển cấp 2 đang mặc → vẫn có, cấp 2, đang mặc');
    dat(cu.a.rung && !cu.a.lau && cu.a.capNinja === 1 && cu.a.gold === 1234, 'bản lưu cũ đã hạ Mộc Tinh → bộ Rừng được giữ (tặng bù như luật cũ), không trừ vàng; bộ Lâu đài chưa có');
    dat(cu.a.boMua === 1 && cu.a2.bien && cu.a2.rung && cu.a2.capBien === 2, 'đánh dấu zed.boMua; nạp lại lần nữa vẫn giữ nguyên');
    dat(cu.b.bien && cu.b.rung && cu.b.capBien === 2 && cu.b.mac === 'bien', 'bản lưu cũ chưa cân lại (VM.canLai chạy) vẫn giữ bộ Biển cấp 2, bộ Rừng');
    dat(!cu.a.banLau, 'chưa hạ Hồ Tinh → bộ Lâu đài chưa mở bán');

    console.log('2. Hạ Mộc Tinh: bộ Rừng mở bán, chưa có');
    await A.goi(() => { G.testSave({ lvl: 40, sharpen: 15, branch: 'fire', marksMoi: 5000 }); G.save.canLai = G.SAVE_CAN_LAI; delete G.save.zed; G.save = G.fixSave(G.save); G.save.gold = 0; return 1; });
    const h = await A.goi(CHOI_TRUM, 0);
    dat(!h.loi && h.win && h.sao >= 1, 'bot hạ Mộc Tinh' + (h.loi ? ' — ' + h.loi : ''));
    dat(!(h.boMo && h.boMo.rung) && h.boBan && h.boBan.rung === 1 && h.boMua === 1 && h.boBanBao === 1, 'bộ Rừng mở bán (zed.boBan.rung) nhưng chưa có (zed.boMo không có rung); dấu báo làng');
    dat(h.lines.some((s) => /Thợ May/.test(String(s))), 'dòng báo "Cô Thợ May đã có bộ…" ở bảng kết quả: ' + h.lines.filter((s) => /Thợ May/.test(String(s))).join(' | '));
    const s2 = await A.goi(() => {
      const sv = G.save, VM = G.vkMoi;
      const r = { ban: G.zedBoBan('rung'), co: G.zedBoMo('rung'), nang: VM.boDuoc(sv, 'rung'), mua0: VM.boMuaDuoc(sv, 'rung') };
      sv.zed.bo = 'rung'; r.mac = G.zedBo(); // chưa có thì không mặc được
      delete sv.zed.bo;
      const n = G.fixSave(JSON.parse(JSON.stringify(sv)));
      r.sauNap = { co: G.zedBoMo('rung', n), ban: G.zedBoBan('rung', n) };
      r.cham = VM.coTheMuaBo(sv);
      return r;
    });
    dat(s2.ban && !s2.co && s2.nang === 'Chưa mua bộ' && s2.mac === 'ninja', 'chưa mua: không nâng cấp được ("Chưa mua bộ"), không mặc được (vẫn Ninja)');
    dat(!s2.sauNap.co && s2.sauNap.ban, 'nạp lại (fixSave) không tặng bù bộ Rừng, vẫn đang bán');
    dat(s2.mua0 === 'Thiếu vàng' && s2.cham === true, '0 vàng: chưa mua được ("Thiếu vàng"); Cô Thợ May có chấm đỏ (bộ mới bán chưa xem)');

    console.log('3. Mua bằng vàng');
    const m = await A.goi(() => {
      const sv = G.save, VM = G.vkMoi, gia = G.zedBoGia('rung');
      const r = { gia };
      sv.gold = gia - 1; r.thieu = VM.muaBo(sv, 'rung'); r.vangThieu = sv.gold; r.coThieu = G.zedBoMo('rung');
      sv.gold = gia + 777; r.du = VM.muaBo(sv, 'rung'); r.vangDu = sv.gold; r.coDu = G.zedBoMo('rung'); r.lai = VM.muaBo(sv, 'rung'); r.vangLai = sv.gold;
      r.nang = VM.boDuoc(sv, 'rung'); r.ban = !!(sv.zed.boBan && sv.zed.boBan.rung);
      sv.gold = 99999; r.bien = VM.muaBo(sv, 'bien'); r.vangBien = sv.gold; r.lyDoBien = VM.boMuaDuoc(sv, 'bien');
      r.ninja = VM.muaBo(sv, 'ninja');
      r.json = G.zedBoMo('rung', JSON.parse(JSON.stringify(sv))) && G.zedBoMo('rung', G.fixSave(JSON.parse(JSON.stringify(sv))));
      return r;
    });
    dat(m.gia === 1500, 'giá bộ Rừng 1.500 vàng (G.BO_MUA)');
    dat(m.thieu === false && m.vangThieu === m.gia - 1 && !m.coThieu, 'thiếu 1 vàng: không mua, vàng giữ nguyên');
    dat(m.du === true && m.vangDu === 777 && m.coDu && !m.ban, 'đủ vàng: mua được, trừ đúng ' + m.gia + ' vàng (còn 777), bộ Rừng thành đã có');
    dat(m.lai === false && m.vangLai === 777, 'đã có thì không mua lại, không trừ thêm');
    dat(m.nang === 'Thiếu linh khí' || m.nang === '', 'mua xong mới nâng cấp được (lý do còn lại: ' + (m.nang || 'nâng được') + ')');
    dat(m.bien === false && m.vangBien === 99999 && m.lyDoBien === 'Chưa mở bán', 'bộ Biển chưa mở bán (chưa hạ Ngư Tinh): không mua được dù đủ vàng');
    dat(m.ninja === false, 'bộ Ninja có sẵn, không bán');
    dat(m.json === true, 'bản lưu qua JSON (lưu mây) + fixSave vẫn giữ bộ đã mua');

    console.log('5. Vẽ bảng Cô Thợ May');
    const ve = await A.goi(() => {
      const VA = G.villageApi, loi = [];
      for (const lang of ['vi', 'en']) {
        G.LANG = lang;
        for (const t of ['mua', 'nang']) {
          try { VA.open('may'); VA.V.mtab = t; const line = VA.PANELS.outfit(); if (line === undefined) loi.push(lang + ' ' + t + ': không có câu'); } catch (e) { loi.push(lang + ' ' + t + ': ' + e.message); }
        }
      }
      G.LANG = 'vi';
      return { loi, en: G.ngonNgu && G.ngonNgu.them ? 1 : 0 };
    });
    dat(!ve.loi.length, 'vẽ thẻ Mua + Nâng cấp (VI + EN) không lỗi' + (ve.loi.length ? ': ' + ve.loi.join('; ') : ''));
  } finally { A.dong(); }

  console.log('4. Cờ quay lui ?bocu=1');
  const B = moTrang('bocu=1');
  try {
    await B.goi(() => { G.testSave({ lvl: 40, sharpen: 15, branch: 'fire', marksMoi: 5000 }); G.save.canLai = G.SAVE_CAN_LAI; delete G.save.zed; G.save = G.fixSave(G.save); G.save.gold = 5000; return 1; });
    const h = await B.goi(CHOI_TRUM, 0);
    dat(!h.loi && h.win && h.boMo && h.boMo.rung === 1 && !h.boBan, '?bocu=1: hạ Mộc Tinh là có bộ Rừng ngay (như cũ)');
    const r = await B.goi(() => ({ ban: G.BO_MUA_BAT, ly: G.vkMoi.boMuaDuoc(G.save, 'bien'), vang: G.save.gold }));
    dat(r.ban === false && r.ly === 'Tắt bán bộ', '?bocu=1: không bán bộ (G.BO_MUA_BAT = false)');
  } finally { B.dong(); }
  console.log('ĐẠT ' + soDat + ' điều kiện');
})().catch((e) => { console.error(e.message || e); process.exit(1); });
