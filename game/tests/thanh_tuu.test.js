#!/usr/bin/env node
// BƯỚC 2 — PHIÊN C: kiểm Thành tựu + Danh hiệu (js/thanh_tuu.js) không cần trình duyệt (docs/ke-hoach/buoc-2/KE-HOACH.md mục 4 "Phiên C").
// Chạy hai bản game trong Node qua tests/node_trang.js (DOM / canvas giả, ?cloud=0): bản thường và bản ?thanhtuu=0 (cờ quay lui).
//   1. Bù bản lưu cũ: đã hạ Hồ Tinh, đủ sao → thành tựu 1–4, 9, 10 đạt ngay (chưa nhận), cờ tt.bu; phần cũ của bản lưu không đổi.
//   2. Đếm quái: bot thắng 1 ải → tt.dem.quai = số quái hạ, tinh anh đếm riêng; khongBinh / khacChe / khongKip theo hetAi.
//   3. Nhận thưởng MỘT lần: đúng số vàng / linh khí / đá / bùa / quặng; nhận lần hai, nhận khi chưa đạt → không gì.
//   4. Danh hiệu: nhận thành tựu có danh hiệu → tự đeo (khi chưa đeo gì); đổi / cất; không đeo được danh hiệu chưa có; danh hiệu từ Sổ (so.vung).
//   5. Đọc so / nv an toàn: chưa có thì 0, có thì tính (Chép sổ, Chăm chỉ); dữ liệu hỏng không lỗi.
//   6. Giao diện: thẻ Thành tựu ở Ông Từ (mở sau ải Rừng già 1), chấm đỏ, bấm huy hiệu + Nhận, Đổi danh hiệu, Hành trang, làng — vẽ không lỗi.
//   7. Lưu / mây: tt đi qua G.fixSave + JSON nguyên vẹn.
//   8. ?thanhtuu=0: không đếm, thẻ ẩn, không hiện danh hiệu; dữ liệu tt giữ nguyên.
// Chạy: node game/tests/thanh_tuu.test.js
'use strict';
const path = require('path'), fs = require('fs'), { spawn } = require('child_process');
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
const sx = (v) => JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.keys(x).sort().reduce((a, kk) => ((a[kk] = x[kk]), a), {}) : x));

(async () => {
  // Bước 2 Phiên E: bài này kiểm luật với bảng thưởng GỐC (?thuongb2=goc); số đã chỉnh kiểm ở tests/thuong_b2.test.js
  const A = moTrang('thuongb2=goc'), B = moTrang('thanhtuu=0&thuongb2=goc');
  try {
    console.log('0. Nạp game');
    const nap = await A.goi(() => ({ tt: !!G.thanhTuu, bat: G.THANH_TUU_BAT, n: G.THANH_TUU.DS.length, dh: Object.keys(G.THANH_TUU.DH).length,
      rong: !!G.villageApi.PANELS.thanhTuu.rong, ma: new Set(G.THANH_TUU.DS.map((a) => a.ma)).size,
      dhDung: G.THANH_TUU.DS.every((a) => !a.th.dh || G.THANH_TUU.DH[a.th.dh]), cap: G.THANH_TUU.DS.every((a) => G.THANH_TUU.CAP[a.cap] && a.hinh >= 0 && a.hinh < 16) }));
    dat(nap.tt && nap.bat === true && nap.n === 30 && nap.ma === 30, 'G.thanhTuu có, 30 thành tựu, mã không trùng');
    dat(nap.dh === 20 && nap.dhDung && nap.cap, '20 danh hiệu (14 thành tựu + 6 Sổ), mã danh hiệu / cấp / hình hợp lệ');
    dat(!nap.rong, 'PANELS.thanhTuu đã điền (không còn hàm rỗng của Phiên 0)');

    // ---------- 1. bù bản lưu cũ ----------
    console.log('1. Bù bản lưu cũ');
    const bu = await A.goi(() => {
      G.testSave({ lvl: 31, sharpen: 6 });
      const s = G.save;
      for (let r = 0; r < 3; r++) for (let i = 0; i < 5; i++) s.stars[r + '-' + i] = 3;
      s.heroes.hunter.unlocked = true; s.heroes.healer.unlocked = true; s.heroes.wrestler.unlocked = true;
      delete s.tt; delete s.so; delete s.nv;
      const raw = JSON.stringify(s);
      const sv = G.fixSave(JSON.parse(raw));
      const truoc = JSON.parse(JSON.stringify(sv)); delete truoc.tt;
      const moi = G.thanhTuu.kiem(sv);
      const sau = JSON.parse(JSON.stringify(sv)); delete sau.tt;
      return { moi, bu: sv.tt.bu, nhan: Object.keys(sv.tt.nhan).length, giu: JSON.stringify(truoc) === JSON.stringify(sau), cap30: sv.tt.xong.cap20 };
    });
    dat(['buocDau', 'cuuTeo', 'cuuBong', 'cuuLi', 'sao15', 'sao45', 'cap20'].every((m) => bu.moi.includes(m)), 'đã hạ Hồ Tinh + đủ 45 sao + cấp 31 → đạt ngay: ' + bu.moi.join(', '));
    dat(!bu.moi.includes('quai100') && !bu.moi.includes('cap40') && !bu.moi.includes('kho2'), 'thành tựu đếm số / chưa tới thì chưa đạt');
    dat(bu.bu === 1 && bu.nhan === 0, 'cờ bù tt.bu = 1, chưa tự nhận thưởng (bé vẫn bấm Nhận)');
    dat(bu.giu, 'kiểm thành tựu không đổi phần cũ của bản lưu');
    const cu = JSON.parse(fs.readFileSync(path.join(__dirname, 'cay_luu.json'), 'utf8'));
    const cuKq = [];
    for (const r of cu) cuKq.push(await A.goi('function (r) { const sv = G.fixSave(JSON.parse(r)); const m = G.thanhTuu.kiem(sv); return { m: m.length, dd: !!sv.stars["0-0"] === !!sv.tt.xong.buocDau || !!(sv.tut && sv.tut.done) }; }', r));
    dat(cuKq.every((q) => q.dd), cu.length + ' bản lưu cũ (cay_luu.json): kiểm không lỗi, "Bước đầu" đúng theo ải 0-0 (' + cuKq.map((q) => q.m).join('/') + ' thành tựu)');

    // ---------- 2. đếm ----------
    console.log('2. Đếm quái và các mốc sau ải');
    const tran = await A.goi(() => {
      G.testSave({ lvl: 30, sharpen: 6 });
      let ta = 0; const go = G.suKien.on('haQuai', (d) => { if (d.tinhAnh) ta++; });
      G.startStage(0, 1, 0);
      const out = G.probeRun(400);
      go();
      const S = G.getRun(), dm = G.save.tt.dem;
      return { win: out.win, kills: out.kills, quai: dm.quai | 0, ta, tinhAnh: dm.tinhAnh | 0, kb: dm.khongBinh | 0, potion: !!(S && S.usedPotion) };
    });
    dat(tran.win && tran.quai === tran.kills && tran.kills > 0, 'bot thắng 0-1: tt.dem.quai = ' + tran.quai + ' = số quái hạ');
    dat(tran.tinhAnh === tran.ta, 'tinh anh đếm riêng (' + tran.tinhAnh + ')');
    dat(tran.kb === (tran.potion ? 0 : 1), 'qua ải không bình máu → khongBinh +1 (' + tran.kb + ')');
    const het = await A.goi(() => {
      const o = G.save.tt; o.dem = {};
      const K = G.suKien, S0 = { layers: [], aiNgay: null };
      K.phat('hetAi', { S: S0, win: true, khongBinh: true, khacChe: true, trumVung: true, tut: false, aiNgay: null, quit: false });
      K.phat('hetAi', { S: { layers: [{ type: 'resist', el: 'fire' }] }, win: true, khongBinh: false, khacChe: true, trumVung: true });
      K.phat('hetAi', { S: S0, win: false, khongBinh: true, khacChe: true, trumVung: true }); // thua: không tính
      K.phat('hetAi', { S: S0, win: true, khongBinh: true, khacChe: true, trumVung: true, aiNgay: { loai: 'vang' } }); // ải ngày: không tính
      K.phat('hetAi', { S: S0, win: true, khongBinh: true, khacChe: false, tut: true }); // ải hướng dẫn: không tính
      return Object.assign({}, o.dem);
    });
    dat(het.khongBinh === 1 && het.khacChe === 2 && het.khongKip === 1, 'hetAi: khongBinh 1, khacChe 2, khongKip 1 (trùm chưa kháng hệ); thua / ải ngày / hướng dẫn không tính');

    // ---------- 3. nhận một lần ----------
    console.log('3. Nhận thưởng một lần');
    const nh = await A.goi(() => {
      G.testSave({ lvl: 20 });
      const s = G.save, TT = G.thanhTuu; s.stars['0-0'] = 3; s.ore = 5;
      TT.kiem();
      const g0 = s.gold, r = {};
      r.a = TT.nhan('buocDau'); r.vang = s.gold - g0; r.dh = s.tt.dh;
      r.b = TT.nhan('buocDau'); r.vang2 = s.gold - g0;
      r.c = TT.nhan('quai100'); // chưa đạt
      s.tt.dem.quai = 999; s.tt.dem.tinhAnh = 50;
      for (const w of s.weapons) w.sharpen = 0;
      s.weapons[0].sharpen = 10;
      const lk0 = G.vkMoi.lk(s), da0 = G.epDo.da(s), bua0 = G.epDo.bua(s), q0 = s.ore;
      r.d = TT.nhan('quai100') && TT.nhan('tinhAnh50') && TT.nhan('cap20') && TT.nhan('mai10');
      s.tt.dem.quai = 5000; r.e = TT.nhan('quai5000');
      r.lk = G.vkMoi.lk(s) - lk0; r.da = G.epDo.da(s) - da0; r.bua = G.epDo.bua(s) - bua0; r.q = s.ore - q0; r.vang3 = s.gold - g0;
      r.cho = TT.choNhan().length; r.nhanN = Object.keys(s.tt.nhan).length;
      return r;
    });
    dat(nh.a && nh.vang === 100 && nh.dh === 'tanBinh', 'nhận "Bước đầu": +100 vàng, tự đeo danh hiệu "Tân binh"');
    dat(!nh.b && nh.vang2 === 100 && !nh.c, 'nhận lần hai / nhận khi chưa đạt: không có gì');
    dat(nh.d && nh.e && nh.da === 3 && nh.q === 10 && nh.bua === 1 && nh.vang3 === 100 + 200 + 300 && nh.lk === 0, 'thưởng đúng: 100 quái +200 V, 50 tinh anh +3 đá, cấp 20 +300 V, mài +10 +10 quặng, 5.000 quái +1 bùa');
    dat(nh.nhanN === 6, 'đã nhận đúng 6 thành tựu');

    // ---------- 4. danh hiệu ----------
    console.log('4. Đổi danh hiệu');
    const dh = await A.goi(() => {
      const s = G.save, TT = G.thanhTuu, r = {};
      r.ds0 = TT.dsDh().join(',');
      r.khongCo = TT.deo('anhHung'); r.van = s.tt.dh;
      s.stars['0-4'] = 3; s.heroes.hunter.unlocked = true; TT.kiem();
      const lk0 = G.vkMoi.lk(s);
      r.n = TT.nhan('cuuTeo'); r.lk = G.vkMoi.lk(s) - lk0; r.giu = s.tt.dh; // đang đeo Tân binh: không tự đổi
      r.ds1 = TT.dsDh().join(',');
      r.doi = TT.deo('cuuBan'); r.dang = TT.dangDeo().ten;
      r.cat = TT.deo(null); r.sauCat = TT.dangDeo();
      s.so = { v: 1, q: {}, vung: { 0: 1, 1: 3 } };
      r.ds2 = TT.dsDh().join(',');
      r.so = TT.deo('bacThay1'); r.dang2 = TT.dangDeo().ten;
      s.so.vung = {}; r.mat = TT.dangDeo(); // danh hiệu Sổ mất (dữ liệu sổ đổi): không hiện, không lỗi
      return r;
    });
    dat(dh.ds0 === 'tanBinh,khacTinh' && !dh.khongCo && dh.van === 'tanBinh', 'chỉ đeo được danh hiệu đã có');
    dat(dh.n && dh.lk === 10 && dh.giu === 'tanBinh' && dh.ds1 === 'tanBinh,cuuBan,khacTinh', 'nhận "Cứu bạn đầu tiên": +10 linh khí, có thêm "Người cứu bạn", không tự đổi danh hiệu đang đeo');
    dat(dh.doi && dh.dang === 'Người cứu bạn' && dh.cat && dh.sauCat === null, 'đổi sang "Người cứu bạn", cất danh hiệu');
    dat(dh.ds2 === 'tanBinh,cuuBan,khacTinh,thoSan0,thoSan1,bacThay1' && dh.so && dh.dang2 === 'Bậc thầy Hang biển' && dh.mat === null, 'danh hiệu từ Sổ yêu quái (so.vung bit 1 / 2) đọc an toàn');

    // ---------- 5. so / nv ----------
    console.log('5. Đọc so / nv an toàn');
    const sn = await A.goi(() => {
      const s = G.save, TT = G.thanhTuu, r = {};
      delete s.so; delete s.nv; r.p0 = [TT.tienDo('so12')[0], TT.tienDo('viec7')[0]];
      s.so = 'hong'; s.nv = 5; r.p1 = [TT.tienDo('so12')[0], TT.tienDo('soDu')[0], TT.tienDo('viec7')[0]];
      s.so = { v: 1, q: {}, vung: {} };
      ['heoCon', 'ongVo', 'boHung', 'hoaBaoTu', 'chonBong', 'namPhong', 'socNo', 'nhimDoc', 'heoNanh', 'namPhongChua', 'namChua'].forEach((m) => { s.so.q[m] = { g: 1, h: 3, k: 0, n: 1 }; });
      s.so.q.mocTinh = { g: 1, h: 0, k: 1, n: 0 }; // trùm vùng tìm ra điểm yếu (bù bản lưu cũ) cũng tính ★
      s.so.q.cua = { g: 1, h: 0, k: 0, n: 0 }; // mới gặp: chưa ★
      s.nv = { v: 1, demRuong: 7 };
      const m = TT.kiem();
      r.p2 = [TT.tienDo('so12')[0], TT.tienDo('soDu')[0], TT.tienDo('viec7')[0]]; r.m = m;
      return r;
    });
    dat(sx(sn.p0) === '[0,0]' && sx(sn.p1) === '[0,0,0]', 'chưa có / hỏng so, nv → tiến độ 0, không lỗi');
    dat(sx(sn.p2) === '[12,1,7]' && sn.m.includes('so12') && sn.m.includes('viec7') && !sn.m.includes('soDu'), '12 trang ★ → "Chép sổ"; 7 rương ngày → "Chăm chỉ"');

    // ---------- 6. giao diện ----------
    console.log('6. Giao diện: Ông Từ, Hành trang, làng');
    const gd = await A.goi(() => {
      const VA = G.villageApi, V = VA.V, P = VA.PANELS, TT = G.thanhTuu, r = {};
      G.noRender = false;
      const ve = () => { try { G.ui.begin && G.ui.begin(); G.Village.draw(); return true; } catch (e) { return String(e && e.stack || e); } };
      G.testSave({ lvl: 12 }); G.setScene(G.Village);
      r.moChua = VA.theCua('tu').map((t) => t[0]).join(',');
      G.save.stars['0-0'] = 2; G.save.stars['0-1'] = 2; // người mới (≤ 1 ải) chỉ có một chấm đỏ ở Lái Đò / Cụ Đồ…: qua 2 ải
      r.mo = VA.theCua('tu').map((t) => t[0]).join(',');
      G.villageScene.checkNews(); r.cham = !!G.villageScene.state.news.tu && P.thanhTuu.cham(G.save);
      VA.open('tu'); V.tab = 'thanhTuu'; V.ttab = 'thanhTuu'; V.ttSel = null; r.ve0 = ve(); r.sel = V.ttSel;
      // bấm ô huy hiệu thứ 5 (Diệt yêu) rồi bấm lại ô "Bước đầu" và nút Nhận
      G.click = { x: 160 + 2 + 4 * 30 + 15, y: 100 + 13 }; r.ve1 = ve(); r.sel2 = V.ttSel;
      G.click = { x: 160 + 2 + 15, y: 100 + 13 }; ve();
      const g0 = G.save.gold;
      G.click = { x: 160 + 304 - 66 + 31, y: 262 - 24 + 10 }; r.ve2 = ve(); r.nhan = G.save.tt.nhan.buocDau === 1 && G.save.gold - g0 === 100;
      r.cham2 = P.thanhTuu.cham(G.save);
      // Đổi danh hiệu
      G.click = { x: 160 + 304 - 43, y: 68 + 9 }; r.ve3 = ve(); r.doi = !!V.ttDoi;
      G.click = { x: 160 + 149 + 6 + 40, y: 68 + 38 + 10 }; r.ve4 = ve(); r.cat = !G.save.tt.dh; // ô thứ hai (cột phải): "Không đeo"
      G.click = { x: 160 + 40, y: 68 + 38 + 10 }; ve(); r.deo = G.save.tt.dh;
      // Hành trang + làng có danh hiệu
      VA.goHub(); V.tab = 'bag'; if (G.hanhTrang && G.hanhTrang.reset) G.hanhTrang.reset(); r.ve5 = ve();
      VA.goHub(); r.ve6 = ve();
      // chạm dải danh hiệu ở Hành trang → sang Ông Từ, thẻ Thành tựu
      V.tab = 'bag'; if (G.hanhTrang && G.hanhTrang.reset) G.hanhTrang.reset(); G.click = { x: 16 + 56, y: 92 + 2 + 96 - 8 }; r.ve7 = ve(); r.toi = V.who + ':' + V.tab;
      // tiếng Anh
      G.ngonNgu.dat('en', false); VA.open('tu'); V.tab = 'thanhTuu'; V.ttDoi = false; r.ve8 = ve(); V.ttDoi = true; r.ve9 = ve(); V.ttDoi = false; G.ngonNgu.dat('vi', false);
      const thieu = [...G.ngonNgu.thieu].filter((s) => /huy hiệu|danh hiệu|Danh hiệu|Thành tựu|Đã đạt|Tiến độ|Thưởng|Nhận|đá nâng bậc|bùa|Cu Tí lên/.test(s));
      r.thieu = thieu;
      VA.goHub(); G.noRender = true;
      return r;
    });
    const boSo = (x) => String(x).split(',').filter((t) => t !== 'so').join(','); // thẻ Sổ (Phiên A) mở từ đầu: không tính ở đây
    dat(boSo(gd.moChua) === 'hero' && boSo(gd.mo) === 'hero,thanhTuu', 'thẻ Thành tựu chỉ hiện sau khi qua ải Rừng già 1');
    dat(gd.cham, 'có huy hiệu chờ nhận → chấm đỏ Ông Từ');
    dat(gd.ve0 === true && gd.sel === 'buocDau' && gd.ve1 === true && gd.sel2 === 'quai100', 'vẽ thẻ không lỗi; tự chọn huy hiệu chờ nhận; chạm huy hiệu để xem');
    dat(gd.ve2 === true && gd.nhan && gd.cham2 === false, 'bấm Nhận: +100 vàng, hết chấm đỏ');
    dat(gd.ve3 === true && gd.doi && gd.ve4 === true && gd.cat && gd.deo === 'tanBinh', 'Đổi danh hiệu: cất (Không đeo) rồi đeo lại "Tân binh"');
    dat(gd.ve5 === true && gd.ve6 === true, 'Hành trang và làng (danh hiệu trên đầu Cu Tí) vẽ không lỗi');
    dat(gd.ve7 === true && gd.toi === 'tu:thanhTuu', 'chạm dải danh hiệu ở Hành trang → Ông Từ, thẻ Thành tựu');
    dat(gd.ve8 === true && gd.ve9 === true && !gd.thieu.length, 'bản tiếng Anh vẽ được, không sót chữ chưa dịch (' + gd.thieu.join(' | ') + ')');

    // ---------- 7. lưu ----------
    console.log('7. Lưu / mây');
    const luu = await A.goi(() => { const s = JSON.stringify(G.save), f = G.fixSave(JSON.parse(s)); return { dh: f.tt.dh, nhan: f.tt.nhan.buocDau, xong: Object.keys(f.tt.xong).length, giong: JSON.stringify(f.tt) === JSON.stringify(G.save.tt), kb: JSON.stringify(G.save.tt).length }; });
    dat(luu.dh === 'tanBinh' && luu.nhan === 1 && luu.giong && luu.kb < 1500, 'tt qua G.fixSave + JSON nguyên vẹn (' + luu.kb + ' byte ≤ 1,5 KB)');

    // ---------- 8. ?thanhtuu=0 ----------
    console.log('8. Cờ quay lui ?thanhtuu=0');
    const tat = await B.goi(() => {
      G.testSave({ lvl: 30, sharpen: 6 }); G.save.stars['0-0'] = 3;
      G.save.tt = { v: 1, dem: {}, dh: 'tanBinh', nhan: { buocDau: 1 }, xong: { buocDau: 1 } };
      G.startStage(0, 1, 0); const out = G.probeRun(400);
      const VA = G.villageApi;
      return { bat: G.THANH_TUU_BAT, win: out.win, quai: G.save.tt.dem.quai || 0, rong: !!VA.PANELS.thanhTuu.rong, the: VA.theCua('tu').map((t) => t[0]).join(','),
        dd: G.thanhTuu.dangDeo(), giu: G.save.tt.dh, nhan: G.thanhTuu.nhan('buocDau') };
    });
    dat(tat.bat === false && tat.win && tat.quai === 0, 'không đếm quái (bot vẫn thắng)');
    dat(tat.rong && boSo(tat.the) === 'hero' && tat.dd === null && !tat.nhan, 'thẻ ẩn, không hiện / không nhận gì');
    dat(tat.giu === 'tanBinh', 'dữ liệu tt trong bản lưu giữ nguyên');

    const loiA = await A.goi(() => (window.__loiNgam || []).filter((s) => /thanh_tuu|thanhTuu/.test(s)));
    dat(!loiA.length, 'không có lỗi ngầm nào từ js/thanh_tuu.js');
    console.log('\nPASS — ' + soDat + ' điều kiện');
  } catch (e) {
    console.error(e.stack || e);
    console.error('--- stderr bản thường ---\n' + A.loi().slice(-3000));
    process.exitCode = 1;
  } finally { A.dong(); B.dong(); }
})();
