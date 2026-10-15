#!/usr/bin/env node
// BƯỚC 2 — PHIÊN A: kiểm Sổ yêu quái (js/so_yeu_quai.js) không cần trình duyệt (docs/ke-hoach/buoc-2/KE-HOACH.md mục 4 "Phiên A").
// Chạy hai bản game trong Node qua tests/node_trang.js: bản thường và bản ?soyq=0 (cờ quay lui).
//   1. Bảng G.SO_YQ: đủ 36 trang, mã trùng hình quái (monster_art.js), mọi quái của G.MOB_ART có trang, thưởng đúng bảng kế hoạch.
//   2. Hạ quái đúng hệ khắc chế (đòn kết liễu / hiệu ứng do vũ khí) → ★★; sai hệ, hiệu ứng do chưởng → không. Đếm số lần hạ, ★★★.
//   3. Trùm vùng: hết ải thắng có sao thứ ba → ★★ (+ lớp thích nghi); không sao thứ ba → chỉ ★; ải ngày không tính. Bot thắng ải thật ghi đúng.
//   4. Bù bản lưu cũ đúng (vùng đã qua → đã gặp, trùm có sao → đã hạ, sao 3 → điểm yếu), chỉ một lần; bản lưu cũ khác giữ nguyên.
//   5. Nhận thưởng đúng số, chỉ một lần; thưởng vùng + danh hiệu; chấm đỏ Ông Từ.
//   6. Vẽ thẻ "Sổ" (VI + EN, mọi vùng, ô chưa gặp / đã gặp / trùm): không lỗi, chữ mới đều có bản tiếng Anh.
//   7. ?soyq=0: thẻ ẩn, không ghi sổ, không bù.
// Chạy: node game/tests/so_yeu_quai.test.js
'use strict';
const path = require('path'), fs = require('fs'), { spawn } = require('child_process');
const TRANG = path.join(__dirname, 'node_trang.js');

function moTrang(q) {
  const env = Object.assign({}, process.env);
  if (q) env.LK_Q = q; else delete env.LK_Q;
  const p = spawn(process.execPath, [TRANG], { env, stdio: ['pipe', 'pipe', 'pipe'] });
  let buf = '', cho = [], loi = '';
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
const boSo = (o) => { const c = JSON.parse(JSON.stringify(o)); delete c.so; if (c.nv) delete c.nv.hat; return c; }; // nv.hat: hạt giống ngẫu nhiên của Việc hôm nay (tạo mới mỗi lần nạp bản chưa có)
const sx = (v) => JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.keys(x).sort().reduce((a, kk) => ((a[kk] = x[kk]), a), {}) : x));

(async () => {
  const A = moTrang(''), B = moTrang('soyq=0');
  try {
    // ---------- 0. nạp ----------
    console.log('0. Nạp game');
    const nap = await A.goi(() => ({ co: !!G.soYQ, bat: G.soYQ.bat(), rong: !!G.villageApi.PANELS.so.rong, fix: !!G.fixSave.soYqBoc, the: G.villageApi.theCua('tu').map((t) => t[0]) }));
    dat(nap.co && nap.bat && !nap.rong && nap.fix, 'G.soYQ bật; PANELS.so là hàm thật (không còn .rong); đã bọc G.fixSave');
    dat(nap.the[0] === 'hero' && nap.the[1] === 'so', 'Ông Từ có thẻ Cu Tí | Sổ (| Thành tựu khi Phiên C mở): ' + nap.the.join());

    // ---------- 1. bảng ----------
    console.log('1. Bảng G.SO_YQ');
    const bang = await A.goi(() => {
      const CF = G.SO_YQ, ma = CF.trang.map((t) => t[0]), defs = G.monsterArt._defs, M = G.MOB_ART;
      const tatCa = [];
      // 3 vùng đầu (Sổ chưa có trang vùng 4 Sông sâu — bước 3 phiên 2A: 8 quái mới chưa vào sổ, xem docs/review/ke-hoach-cai-thien/vung-4-2a/bao-cao.md)
      for (const k of ['rusher', 'swarm', 'shield', 'archer', 'nimble', 'kami', 'bomber', 'spiky']) tatCa.push(...M[k].slice(0, 3));
      M.elite.forEach((a) => tatCa.push(...a)); tatCa.push(...M.mini, ...Object.values(M.boss));
      const loai = {}; CF.trang.forEach((t) => { loai[t[2]] = (loai[t[2]] || 0) + 1; });
      const heDung = CF.trang.every((t) => (t[2] === 'trum' ? t[3] === null : G.ELS.includes(t[3])));
      // tổng thưởng cả game
      let vang = 0, lk = 0, da = 0;
      for (const t of CF.trang) { const D = G.soYQ.BANG[t[0]], q = G.soYQ.thuongNac(D, 7); vang += q.vang; lk += q.lk; da += q.da; }
      da += CF.vungDa.reduce((a, b) => a + b, 0);
      // loại trong bảng khớp loại của hình quái
      const LO = { thuong: 'thuong', tinhanh: 'tinhanh', trumnho: 'trumnho', trum: 'trum' };
      const loaiKhop = CF.trang.every((t) => defs[t[0]] && LO[t[2]] === defs[t[0]].loai);
      const vungKhop = CF.trang.every((t) => ['rung', 'bien', 'laudai'][t[1]] === defs[t[0]].vung);
      return { n: ma.length, khongTrung: new Set(ma).size === ma.length, coHinh: ma.every((m) => !!defs[m]), du: tatCa.every((m) => ma.includes(m)), thua: ma.filter((m) => !tatCa.includes(m)),
        loai, heDung, vang, lk, da, loaiKhop, vungKhop, vungDa: CF.vungDa, mt: CF.vang.trum, can: CF.can };
    });
    dat(bang.n === 36 && bang.khongTrung && bang.coHinh, '36 trang, không trùng, mã nào cũng có hình trong monster_art.js');
    dat(bang.du && !bang.thua.length, 'mọi quái của G.MOB_ART (8 vai × 3 vùng, 6 tinh anh, 3 trùm nhỏ, 3 trùm vùng) đều có trang');
    dat(bang.loai.thuong === 24 && bang.loai.tinhanh === 6 && bang.loai.trumnho === 3 && bang.loai.trum === 3 && bang.loaiKhop && bang.vungKhop, 'loại / vùng mỗi trang khớp hình quái: 24 thường, 6 tinh anh, 3 trùm nhỏ, 3 trùm vùng');
    dat(bang.heDung, 'hệ khắc chế: quái thường / tinh anh / trùm nhỏ có hệ, trùm vùng để null (dùng sao thứ ba)');
    dat(bang.vang === 2640 && bang.lk === 198 && bang.da === 46, `tổng thưởng cả game đúng kế hoạch mục 5 (~2.500 V, ~200 LK, ~45 Đ): ${bang.vang} V, ${bang.lk} LK, ${bang.da} Đ`);

    // ---------- 2. hạ quái thường / tinh anh ----------
    console.log('2. Hạ quái: ★, ★★ (hệ khắc chế), ★★★');
    const ha = await A.goi(() => {
      G.testSave({ lvl: 14 }); G.save.tut.done = true;
      G.startStage(0, 1, 0);
      const S = G.getRun();
      // dựng quái giả có đủ trường mà G.kill cần: lấy một con có sẵn trong phòng làm mẫu rồi đổi mã hình
      for (let i = 0; i < 200 && !S.W.ents.length; i++) G.tick();
      const W = S.W, mau = W.ents[0];
      const lam = (art) => { const e = Object.assign(Object.create(Object.getPrototypeOf(mau)), mau); e.art = art; e.dead = false; e.hp = 1; e.st = G.st0(); e.add = false; e.illusion = false; W.ents.push(e); return e; };
      const r = {};
      const so = () => G.save.so.q;
      // heoCon: khắc Lửa. Đòn Băng kết liễu → ★ chưa ★★
      let e = lam('heoCon'); G.kill(e, { el: 'ice' });
      r.saiHe = JSON.stringify(so().heoCon);
      e = lam('heoCon'); G.kill(e, { el: 'fire' });
      r.dungHe = JSON.stringify(so().heoCon);
      // boHung: khắc Độc. Đang dính độc do CHƯỞNG → không tính; độc do vũ khí → tính
      e = lam('boHung'); e.st.poisonN = 3; e.st.ch = { poison: 1 }; G.kill(e, {});
      r.chuong = so().boHung.k | 0;
      e = lam('boHung'); e.st.poisonN = 3; G.kill(e, {});
      r.vuKhi = so().boHung.k | 0;
      // hoaBaoTu: khắc Băng, đang bị đóng băng do vũ khí
      e = lam('hoaBaoTu'); e.st.frozen = 1; G.kill(e, {});
      r.bang = so().hoaBaoTu.k | 0;
      // quái phụ / ảo ảnh không tính
      e = lam('ongVo'); e.add = true; G.kill(e, { el: 'fire' });
      e = lam('ongVo'); e.illusion = true; G.kill(e, { el: 'fire' });
      r.phu = so().ongVo ? so().ongVo.h | 0 : 0;
      // tinh anh: 10 con → ★★★
      for (let i = 0; i < 10; i++) { e = lam('heoNanh'); e.role = 'elite'; G.kill(e, { el: i === 9 ? 'fire' : null }); }
      r.tinhAnh = G.soYQ.nac(G.save, 'heoNanh');
      r.tinhAnhH = so().heoNanh.h;
      // quái thường: 30 con → ★★★
      for (let i = 0; i < 28; i++) { e = lam('heoCon'); G.kill(e, {}); }
      r.thuong = G.soYQ.nac(G.save, 'heoCon');
      r.ma = Object.keys(so()).filter((m) => !G.soYQ.BANG[m]);
      return r;
    });
    dat(/"h":1/.test(ha.saiHe) && /"k":0/.test(ha.saiHe), 'heoCon (khắc Lửa) hạ bằng đòn Băng: ★ đã hạ, chưa ★★ — ' + ha.saiHe);
    dat(/"h":2/.test(ha.dungHe) && /"k":1/.test(ha.dungHe), 'hạ bằng đòn Lửa: ★★ tìm ra điểm yếu — ' + ha.dungHe);
    dat(ha.chuong === 0 && ha.vuKhi === 1, 'boHung (khắc Độc): độc do chưởng không tính, độc do vũ khí tính');
    dat(ha.bang === 1, 'hoaBaoTu (khắc Băng): đang bị đóng băng do vũ khí → ★★');
    dat(ha.phu === 0, 'quái phụ do trùm gọi (e.add), ảo ảnh (e.illusion) không tính');
    dat(ha.tinhAnh === 7 && ha.tinhAnhH === 10, 'tinh anh hạ đủ 10 con (con cuối đúng hệ) → ★ ★★ ★★★');
    dat(ha.thuong === 7, 'quái thường hạ đủ 30 con → ★★★ thuần thục');
    dat(!ha.ma.length, 'không ghi mã lạ vào sổ');

    // ---------- 3. trùm vùng ----------
    console.log('3. Trùm vùng: sao thứ ba = tìm ra điểm yếu');
    const trum = await A.goi(() => {
      G.testSave({ lvl: 14 }); G.save.tut.done = true;
      const K = G.suKien, r = {};
      const S = { r: 0, i: 4, layers: [{ type: 'resist', el: 'fire' }, { type: 'antiRanged' }], loot: { kills: 0 } };
      K.phat('vaoAi', { S });
      let R = { lines: [] };
      K.phat('hetAi', { S, R, win: true, r: 0, i: 4, trumVung: true, khacChe: false, aiNgay: null });
      r.khongSao3 = JSON.stringify(G.save.so.q.mocTinh);
      K.phat('vaoAi', { S });
      R = { lines: [] };
      K.phat('hetAi', { S, R, win: true, r: 0, i: 4, trumVung: true, khacChe: true, aiNgay: null });
      r.sao3 = JSON.stringify(G.save.so.q.mocTinh); r.dong = R.lines.slice();
      // thua: không tính
      K.phat('hetAi', { S: { r: 1, i: 4, layers: [] }, R: { lines: [] }, win: false, r: 1, i: 4, trumVung: true, khacChe: false });
      r.thua = !!G.save.so.q.nguTinh;
      // ải ngày: không phải trùm vùng
      K.phat('hetAi', { S: { r: 1, i: 4, aiNgay: { loai: 'da' } }, R: { lines: [] }, win: true, r: 1, i: 4, trumVung: false, aiNgay: { loai: 'da' } });
      r.aiNgay = !!G.save.so.q.nguTinh;
      return r;
    });
    dat(/"h":1/.test(trum.khongSao3) && /"k":0/.test(trum.khongSao3) && /"l":9/.test(trum.khongSao3), 'hạ Mộc Tinh không sao thứ ba: ★ đã hạ, ghi lớp thích nghi (kháng Lửa, chống đánh xa) — ' + trum.khongSao3);
    dat(/"h":2/.test(trum.sao3) && /"k":1/.test(trum.sao3), 'hạ lần nữa có sao thứ ba: ★★ — ' + trum.sao3);
    dat(trum.dong.some((s) => /Mộc Tinh — tìm ra điểm yếu/.test(s)), 'bảng kết quả có dòng "Sổ yêu quái: Mộc Tinh — tìm ra điểm yếu!"');
    dat(!trum.thua && !trum.aiNgay, 'thua ải trùm, ải ngày: không tính trùm vùng');

    const bot = await A.goi(() => {
      G.testSave({ lvl: 30, sharpen: 8, tier: 3, branch: 'fire', marks: 300 }); G.save.tut.done = true;
      let n = 0, lines = null; const ds = {};
      const g1 = G.suKien.on('haQuai', (d) => { if (G.soYQ.BANG[d.ma]) { n++; ds[d.ma] = (ds[d.ma] || 0) + 1; } });
      const g2 = G.suKien.on('hetAi', (d) => { lines = d.R ? d.R.lines.slice() : null; });
      G.startStage(0, 4, 0);
      const res = G.probeRun(900), S = G.getRun();
      g1(); g2();
      const q = G.save.so.q, sai = Object.keys(ds).filter((m) => (q[m].h | 0) !== ds[m]);
      return { win: !!res.win, n, kills: S.loot.kills, sai, moc: q.mocTinh ? q.mocTinh.h : 0, gap: Object.keys(q).length, lines };
    });
    dat(bot.win && bot.moc === 1, 'bot thắng ải 1-5 thật: Mộc Tinh ghi 1 lần hạ (không đếm hai lần)');
    dat(bot.n > 0 && !bot.sai.length, `số lần hạ từng trang = số sự kiện hạ quái (${bot.n} con, ${bot.gap} trang có tên; S.loot.kills = ${bot.kills})`);
    dat(Array.isArray(bot.lines) && bot.lines.some((s) => /trang mới/.test(s)), 'bảng kết quả có dòng "Sổ yêu quái: … trang mới"');

    // ---------- 4. bù bản lưu cũ ----------
    console.log('4. Bù bản lưu cũ');
    const bu = await A.goi(() => {
      G.testSave({ lvl: 20 });
      const s = JSON.parse(JSON.stringify(G.save));
      delete s.so; delete s.nv; delete s.tt;
      s.stars = { '0-0': 3, '0-1': 2, '0-2': 1, '0-3': 3, '0-4': 3, '1-0': 1 };
      s.stars2 = { '1-4': 2 }; // độ khó 2 cũng tính
      const sv = G.fixSave(JSON.parse(JSON.stringify(s)));
      const q = sv.so.q, r = {};
      r.bu = sv.so.bu;
      r.r0 = G.soYQ.trangVung(0).every((D) => q[D.ma] && q[D.ma].g === 1);
      r.moc = JSON.stringify(q.mocTinh);
      r.r1 = G.soYQ.trangVung(1).filter((D) => D.loai !== 'trum').every((D) => q[D.ma] && q[D.ma].g === 1);
      r.ngu = JSON.stringify(q.nguTinh);
      r.r2 = G.soYQ.trangVung(2).some((D) => q[D.ma]);
      r.thuongChuaHa = G.soYQ.trangVung(0).filter((D) => D.loai !== 'trum').every((D) => (q[D.ma].h | 0) === 0);
      // lần hai: không bù lại (sửa dữ liệu rồi nạp lại → giữ nguyên)
      sv.so.q.heoCon.g = 0;
      const sv2 = G.fixSave(JSON.parse(JSON.stringify(sv)));
      r.motLan = sv2.so.q.heoCon.g === 0;
      r.cho = G.soYQ.cho(sv, 'mocTinh');
      return r;
    });
    dat(bu.bu === 1 && bu.r0 && bu.r1 && !bu.r2, 'vùng đã qua ải: mọi trang "Đã gặp" (vùng 1 đủ 12, vùng 2 trừ trùm vùng); vùng chưa tới: trống');
    dat(/"h":1/.test(bu.moc) && /"k":1/.test(bu.moc), 'Mộc Tinh (ải 1-5 có 3 sao): Đã hạ + Tìm ra điểm yếu — ' + bu.moc);
    dat(/"h":1/.test(bu.ngu) && /"k":0/.test(bu.ngu), 'Ngư Tinh (độ khó 2, 2 sao): Đã hạ, chưa điểm yếu — ' + bu.ngu);
    dat(bu.thuongChuaHa, 'quái thường / tinh anh chưa tính lần hạ (game cũ chưa đếm từng con)');
    dat(bu.motLan, 'bù một lần (cờ so.bu); nạp lại không bù lại');
    dat(bu.cho === 3, 'thưởng ★ ★★ của trùm bù vẫn chờ bấm Nhận');

    const cu = JSON.parse(fs.readFileSync(path.join(__dirname, 'cay_luu.json'), 'utf8'));
    const mau = cu.slice(0, 15);
    const kqA = await A.goi((ds) => ds.map((s) => JSON.stringify(G.fixSave(JSON.parse(s)))), mau);
    const kqB = await B.goi((ds) => ds.map((s) => JSON.stringify(G.fixSave(JSON.parse(s)))), mau);
    let giong = 0, soHop = 0;
    for (let i = 0; i < kqA.length; i++) {
      const a = JSON.parse(kqA[i]), b = JSON.parse(kqB[i]);
      if (sx(boSo(a)) === sx(boSo(b))) giong++;
      if (a.so && a.so.bu === 1 && Object.keys(a.so.q).every((m) => /^[a-zA-Z]+$/.test(m))) soHop++;
    }
    dat(giong === kqA.length, `${kqA.length} bản lưu cũ (tests/cay_luu.json): G.fixSave không đổi phần nào ngoài "so" so với bản ?soyq=0`);
    dat(soHop === kqA.length, 'mọi bản lưu cũ có so.bu = 1 sau khi nạp');

    // ---------- 5. nhận thưởng ----------
    console.log('5. Nhận thưởng');
    const nh = await A.goi(() => {
      G.testSave({ lvl: 20 });
      const sv = G.save; sv.gold = 1000; sv.linhKhi = 0; sv.daBac = 0;
      const Y = G.soYQ, r = {};
      Y.nhanHet(sv); // dọn
      sv.so.q = {}; sv.so.vung = {};
      sv.gold = 1000; sv.linhKhi = 0;
      const da0 = () => (G.epDo && G.epDo.da ? G.epDo.da(sv) : sv.daBac | 0);
      const d0 = da0();
      sv.so.q.cuaTuong = { g: 1, h: 10, k: 1, n: 0 }; // tinh anh vùng 2: 80 V, 6 LK, 1 Đ
      r.cham = !!(G.villageApi.PANELS.so.cham(sv)) && G.suKien.chamNguoi('tu', sv);
      r.q1 = Y.nhan(sv, 'cuaTuong');
      r.gold = sv.gold; r.lk = sv.linhKhi; r.da = da0() - d0;
      r.q2 = Y.nhan(sv, 'cuaTuong');
      r.n = sv.so.q.cuaTuong.n;
      r.cham2 = !!G.villageApi.PANELS.so.cham(sv);
      // vùng 1: mọi trang ★★ → 5 đá + "Thợ săn Rừng già"
      for (const D of Y.trangVung(0)) sv.so.q[D.ma] = { g: 1, h: 1, k: 1, n: 3 };
      r.v = Y.vung(sv, 0);
      const d1 = da0();
      r.qv = Y.nhanVung(sv, 0);
      r.daV = da0() - d1;
      r.qv2 = Y.nhanVung(sv, 0);
      r.dh = Y.danhHieu(sv).map((x) => x.ma + ':' + x.ten);
      return r;
    });
    dat(nh.cham, 'có trang chờ nhận → chấm đỏ thẻ Sổ và chấm đỏ Ông Từ');
    dat(nh.q1 && nh.q1.vang === 80 && nh.q1.lk === 6 && nh.q1.da === 1 && nh.gold === 1080 && nh.lk === 6 && nh.da === 1, 'Cua Tướng (tinh anh vùng 2) ★ ★★ ★★★: +80 vàng, +6 linh khí, +1 đá nâng bậc');
    dat(nh.q2 === null && nh.n === 7 && !nh.cham2, 'nhận lần hai: không có gì; hết chấm đỏ');
    dat(nh.v.du2 && nh.v.cho === 1 && nh.qv && nh.daV === 5 && nh.qv2 === null, 'vùng Rừng già đủ 12 trang ★★: +5 đá nâng bậc, một lần');
    dat(nh.dh.length === 1 && /^thoSan0:Thợ săn Rừng già$/.test(nh.dh[0]), 'danh hiệu "Thợ săn Rừng già" (G.soYQ.danhHieu cho Phiên C): ' + nh.dh.join());

    // ---------- 6. vẽ ----------
    console.log('6. Vẽ thẻ Sổ (VI + EN)');
    const ve = await A.goi(() => {
      const out = { loi: [], noi: [] };
      G.testSave({ lvl: 20 }); G.save.tut.done = true;
      G.save = G.fixSave(G.save);
      const sv = G.save;
      sv.so.q = { heoCon: { g: 1, h: 31, k: 1, n: 1 }, ongVo: { g: 1, h: 0, k: 0, n: 0 }, mocTinh: { g: 1, h: 2, k: 1, n: 0, l: 41 }, cua: { g: 1, h: 3, k: 0, n: 0 } };
      sv.scars = { moc: 'fire' }; sv.rec = { power: 1, b: { moc: 41.5 } }; sv.stars['0-4'] = 3;
      G.setScene(G.Village);
      const VA = G.villageApi, V = VA.V;
      for (const lang of ['vi', 'en']) {
        if (G.ngonNgu) G.ngonNgu.dat(lang, false);
        VA.open('tu'); V.tab = 'so'; V.ttab = 'so';
        for (let r = 0; r < 3; r++) for (const ma of G.soYQ.trangVung(r).map((D) => D.ma)) {
          V.soVung = r; V.soSel = ma;
          try { G.Village.draw(); const s = VA.PANELS.so(); if (typeof s !== 'string' || !s) out.loi.push('câu nói rỗng ' + ma); } catch (e) { out.loi.push(lang + ' ' + ma + ': ' + (e && e.stack || e)); }
        }
      }
      out.thieu = G.ngonNgu ? [...G.ngonNgu.thieu] : [];
      G.ngonNgu.dat('vi', false);
      VA.open('tu'); out.tab = V.tab;
      return out;
    });
    dat(!ve.loi.length, 'vẽ 36 trang × 2 ngôn ngữ không lỗi' + (ve.loi.length ? ': ' + ve.loi.slice(0, 3).join(' | ') : ''));
    const thieuSo = ve.thieu.filter((s) => !/^Sân đình$|^Cu Tí$/.test(s));
    dat(!thieuSo.length, 'tiếng Anh: không còn chuỗi tiếng Việt chưa dịch' + (thieuSo.length ? ': ' + JSON.stringify(thieuSo.slice(0, 8)) : ''));
    dat(ve.tab === 'so', 'Ông Từ nhớ thẻ vừa xem (mở lại vào thẳng thẻ Sổ)');

    // ---------- 7. ?soyq=0 ----------
    console.log('7. Cờ quay lui ?soyq=0');
    const tat = await B.goi(() => {
      G.testSave({ lvl: 14 }); G.save.tut.done = true;
      const s = JSON.parse(JSON.stringify(G.save)); delete s.so; s.stars = { '0-0': 3, '0-4': 3 };
      const sv = G.fixSave(s);
      G.save = sv;
      G.startStage(0, 1, 0); const S = G.getRun();
      for (let i = 0; i < 200 && !S.W.ents.length; i++) G.tick();
      const e0 = S.W.ents[0]; if (e0) G.kill(e0, { el: 'fire' });
      if (!e0) return { loi: 'không có quái' };
      return { bat: G.soYQ ? G.soYQ.bat() : null, rong: !!G.villageApi.PANELS.so.rong, the: G.villageApi.theCua('tu').map((t) => t[0]), q: Object.keys(G.save.so.q).length, bu: G.save.so.bu, fix: !!G.fixSave.soYqBoc };
    });
    dat(tat.bat === false && tat.rong && !tat.the.includes('so') && tat.the[0] === 'hero' && !tat.fix, '?soyq=0: thẻ Sổ ẩn (Ông Từ như cũ), không bọc G.fixSave');
    dat(tat.q === 0 && !tat.bu, '?soyq=0: hạ quái / bản lưu cũ không ghi gì vào sổ, không bù');

    const loiA = await A.goi(() => (window.__loiNgam || []).filter((s) => /so_yeu_quai|soYQ/.test(s)));
    dat(!loiA.length, 'không có lỗi ngầm từ js/so_yeu_quai.js');
    console.log(`\nPASS — ${soDat} điều kiện`);
  } catch (e) {
    console.error('\n' + (e && e.stack || e));
    console.error('stderr A:', A.loi().slice(-1500));
    process.exitCode = 1;
  } finally { A.dong(); B.dong(); }
})();
