#!/usr/bin/env node
// BƯỚC 2 — PHIÊN B: kiểm "Việc hôm nay" (js/viec_ngay.js) không cần trình duyệt (docs/ke-hoach/buoc-2/KE-HOACH.md mục 4 "Phiên B").
// Chạy hai bản game trong Node qua tests/node_trang.js (DOM / canvas giả, ?cloud=0): bản thường và bản ?viecngay=0 (cờ quay lui).
// Ngày giả: thay Date trong trang (window.__ngay('2026-10-15') đặt giờ máy giả lúc 10 giờ sáng ngày đó).
//   1. Mở sau ải Rừng già 2; thẻ ở Anh Mõ hiện / ẩn đúng.
//   2. Cùng hạt giống + cùng ngày → cùng 3 việc (Dễ / Vừa / Khó, khác nhóm); khác hạt giống → khác; sang ngày mới → việc mới, tránh việc hôm qua.
//   3. Ngày lùi giờ máy → giữ nguyên việc, không ra việc mới.
//   4. Đếm tiến độ từ sự kiện (bỏ ải hướng dẫn); bot thắng ải thật → số quái đếm đúng, bảng kết quả có dòng "Việc hôm nay: x/3".
//   5. Nhận thưởng đúng mức; rương ngày khi xong 3/3; đóng dấu tuần; đủ 5 ngày → rương tuần; mỗi thứ nhận một lần.
//   6. Quên nhận → hôm sau tự cộng (việc + rương ngày), sang tuần mới tự cộng rương tuần; có dòng báo.
//   7. Đổi việc 1 lần / ngày.
//   8. Vẽ thẻ (VI + EN), bảng xem trong Tạm dừng, chấm đỏ Anh Mõ; bản lưu đi qua G.fixSave giữ nguyên nv.
//   9. ?viecngay=0: thẻ ẩn, không đếm, không có nút Tạm dừng.
// Chạy: node game/tests/viec_ngay.test.js
'use strict';
const path = require('path'), { spawn } = require('child_process');
const TRANG = path.join(__dirname, 'node_trang.js');

function moTrang(q) {
  const env = Object.assign({}, process.env);
  if (q) env.LK_Q = q; else delete env.LK_Q;
  const p = spawn(process.execPath, [TRANG], { env, stdio: ['pipe', 'pipe', 'pipe'] });
  let buf = '';
  const cho = [];
  p.stdout.on('data', (d) => {
    buf += d;
    let i;
    while ((i = buf.indexOf('\n')) >= 0) { const l = buf.slice(0, i); buf = buf.slice(i + 1); const f = cho.shift(); if (f) f(l); }
  });
  p.stderr.on('data', () => {});
  const goi = (code, arg) => new Promise((res, rej) => {
    cho.push((l) => { const o = JSON.parse(l); if (o.ok) res(o.v); else rej(new Error(o.loi)); });
    p.stdin.write(JSON.stringify({ code: typeof code === 'function' ? '(' + code.toString() + ')' : code, arg }) + '\n');
  });
  return { goi, dong: () => p.kill() };
}
let soDat = 0;
function dat(ok, m) { if (!ok) throw new Error('SAI: ' + m); soDat++; console.log('  ✓ ' + m); }

// cài ngày giả + bản lưu mẫu (đã qua ải Rừng già 2, chưa hạ Mộc Tinh → mức thưởng 1)
const CAI = function () {
  if (!window.__RD) {
    const RD = Date; let lech = 0;
    const FD = function (...a) { if (!(this instanceof FD)) return new RD(RD.now() + lech).toString(); return a.length ? new RD(...a) : new RD(RD.now() + lech); };
    FD.now = () => RD.now() + lech; FD.UTC = RD.UTC; FD.parse = RD.parse; FD.prototype = RD.prototype;
    window.Date = FD; window.__RD = RD;
    // tests/bot_nang.js thay G.aiNgay.homNay bằng ngày giả của bot (G.botSangNgay): ở đây đọc lại giờ máy (đã giả bằng Date ở trên)
    G.aiNgay.homNay = () => { const d = new Date(); return { key: G.ngay.key(d), thu: d.getDay(), d }; };
    window.__ngay = (k) => { const a = k.split('-').map(Number); lech = new RD(a[0], a[1] - 1, a[2], 10, 0, 0).getTime() - RD.now(); return G.ngay.homNay().key; };
  }
  window.__moi = (sao, hat) => {
    G.testSave({ lvl: 20, sharpen: 4 });
    const s = G.save;
    s.stars = sao || { '0-0': 3, '0-1': 3 };
    G.suKien.suaBanLuu(s);
    s.nv.hat = hat || 777; s.nv.cuoi = ''; s.nv.ds = []; s.nv.hom = ''; s.nv.tuan = { ma: '', ngay: [] }; s.nv.tuanNhan = 0; s.nv.demRuong = 0; delete s.nv.quen;
    return s;
  };
  window.__ds = () => G.save.nv.ds.map((v) => v.m + (v.x != null ? '(' + v.x + ')' : '') + ':' + v.o).join(',');
  return true;
};

(async () => {
  const A = moTrang(''), B = moTrang('viecngay=0');
  try {
    await A.goi(CAI); await B.goi(CAI);
    // ---------- 1. mở khoá, thẻ ----------
    console.log('1. Mở khoá, thẻ ở Anh Mõ');
    const m1 = await A.goi(() => {
      __ngay('2026-10-15');
      const VA = G.villageApi, r = {};
      __moi({ '0-0': 3 });
      r.mo0 = G.viecNgay.mo(); r.the0 = VA.theCua('mo').map((t) => t[0]).join(',');
      G.viecNgay.capNhat(); r.ds0 = G.save.nv.ds.length;
      __moi();
      r.mo1 = G.viecNgay.mo(); r.the1 = VA.theCua('mo').map((t) => t[0]).join(','); r.rong = !!VA.PANELS.viecNgay.rong;
      VA.open('mo'); r.tab = VA.V.tab; VA.goHub();
      return r;
    });
    dat(!m1.mo0 && m1.the0 === 'settings' && m1.ds0 === 0, 'chưa qua ải Rừng già 2: chưa mở, Anh Mõ chỉ có Cài đặt, không ra việc');
    dat(m1.mo1 && !m1.rong && m1.the1 === 'viecNgay,settings' && m1.tab === 'viecNgay', 'qua ải Rừng già 2: thẻ "Việc hôm nay" hiện trước Cài đặt, Anh Mõ mở thẻ này trước');

    // ---------- 2. hạt giống ----------
    console.log('2. Chọn 3 việc theo hạt giống');
    const m2 = await A.goi(() => {
      const r = {};
      __ngay('2026-10-15'); __moi(null, 777); G.viecNgay.capNhat(); r.a = __ds(); r.cuoi = G.save.nv.cuoi;
      const ban = JSON.stringify(G.save);
      r.nhom = G.save.nv.ds.map((v) => G.VIEC_NGAY.mau.find((t) => t.m === v.m).nhom);
      r.muc = G.save.nv.ds.map((v) => v.o).join('');
      __moi(null, 777); G.viecNgay.capNhat(); r.b = __ds(); // cùng hạt giống, cùng ngày
      // tải lại (bản lưu đi qua G.fixSave như khi nạp máy / mây): việc giữ nguyên
      G.save = G.fixSave(JSON.parse(ban)); G.viecNgay.capNhat(); r.lai = __ds();
      const khac = new Set();
      for (let h = 1; h <= 12; h++) { __moi(null, 1000 + h * 7919); G.viecNgay.capNhat(); khac.add(__ds()); }
      r.khac = khac.size;
      // nhiều ngày liền: không trùng đúng việc hôm qua (khi còn mẫu khác)
      __moi(null, 777); let trung = 0, ngay = 0, truoc = null;
      for (let d = 15; d <= 28; d++) { __ngay('2026-10-' + d); G.viecNgay.capNhat(); const now = G.save.nv.ds.map((v) => v.m); if (truoc) { ngay++; if (now.some((m) => truoc.includes(m))) trung++; } truoc = now; }
      r.trung = trung; r.ngay = ngay; r.hom = G.save.nv.hom;
      return r;
    });
    dat(m2.a.split(',').length === 3 && m2.muc === '012' && new Set(m2.nhom).size === 3, '3 việc: Dễ, Vừa, Khó, khác nhóm (' + m2.a + ')');
    dat(m2.a === m2.b && m2.a === m2.lai, 'cùng hạt giống + cùng ngày → cùng 3 việc; tải lại bản lưu vẫn vậy');
    dat(m2.khac >= 4, 'khác hạt giống → khác việc (' + m2.khac + ' bộ khác nhau / 12 hạt)');
    dat(m2.trung === 0 && m2.ngay === 13 && m2.hom.split(',').length === 3, '13 ngày liền: không ngày nào ra lại việc của hôm qua');

    // ---------- 3. ngày lùi ----------
    console.log('3. Ngày lùi giờ máy');
    const m3 = await A.goi(() => {
      __moi(null, 777); __ngay('2026-10-20'); G.viecNgay.capNhat(); const a = __ds(), c = G.save.nv.cuoi;
      G.save.nv.ds[0].d = 1;
      __ngay('2026-10-18'); G.viecNgay.capNhat();
      const b = __ds(), c2 = G.save.nv.cuoi, d = G.save.nv.ds[0].d;
      __ngay('2026-10-20'); G.viecNgay.capNhat(); const e = __ds();
      __ngay('2026-10-21'); G.viecNgay.capNhat(); const f = __ds();
      return { a, b, c, c2, d, e, f };
    });
    dat(m3.a === m3.b && m3.c === '2026-10-20' && m3.c2 === '2026-10-20' && m3.d === 1, 'lùi về 18/10: giữ nguyên việc + tiến độ, ngày lớn nhất vẫn 20/10');
    dat(m3.e === m3.a && m3.f !== m3.a, 'về lại 20/10: không ra việc mới; tới 21/10 mới có việc mới');

    // ---------- 4. đếm tiến độ ----------
    console.log('4. Đếm tiến độ từ sự kiện');
    const m4 = await A.goi(() => {
      __moi(null, 777); __ngay('2026-10-15'); G.viecNgay.capNhat();
      const nv = G.save.nv, K = G.suKien, r = {};
      nv.ds = [{ m: 'haQuai', x: null, can: 5, d: 0, nhan: 0, o: 0 }, { m: 'haTinhAnh', x: null, can: 2, d: 0, nhan: 0, o: 1 }, { m: 'ne', x: null, can: 3, d: 0, nhan: 0, o: 2 }];
      K.phat('haQuai', { ma: 'heoCon', tinhAnh: false, he: {}, S: { tut: true } }); // ải hướng dẫn: không tính
      r.tut = nv.ds[0].d;
      for (let i = 0; i < 3; i++) K.phat('haQuai', { ma: 'heoCon', tinhAnh: i === 0, he: {}, wType: 'sword' });
      K.phat('lonNe', {}); K.phat('lonNe', {});
      r.d = nv.ds.map((v) => v.d).join(',');
      r.vk = nv.vk && nv.vk.sword;
      // các mẫu khác
      const thu = (m, x, ten, d) => { nv.ds = [{ m, x, can: 9, d: 0, nhan: 0, o: 0 }]; K.phat(ten, d); return nv.ds[0].d; };
      r.mau = [
        thu('haLoai', 'heoCon', 'haQuai', { ma: 'heoCon', he: {} }), thu('haLoai', 'cua', 'haQuai', { ma: 'heoCon', he: {} }),
        thu('heKet', 'fire', 'haQuai', { el: 'fire', he: {} }), thu('heKet', 'fire', 'haQuai', { el: 'fire', ch: true, he: {} }),
        thu('dinhHe', null, 'haQuai', { he: { poison: true } }), thu('vuKhi', 'bow', 'haQuai', { wType: 'bow', he: {} }),
        thu('quaAi', null, 'hetAi', { win: true }), thu('quaAi', null, 'hetAi', { win: false }),
        thu('khongBinh', null, 'hetAi', { win: true, khongBinh: true }), thu('baSao', null, 'hetAi', { win: true, stars: 3 }),
        thu('trumKhac', null, 'hetAi', { win: true, khacChe: true }), thu('veVung', 0, 'hetAi', { win: true, r: 0 }), thu('veVung', 0, 'hetAi', { win: true, r: 1 }),
        thu('kho2', null, 'hetAi', { win: true, diff: 1 }), thu('aiNgay', null, 'hetAi', { win: true, aiNgay: { loai: 'da' }, tinhLuot: true }),
        thu('phanUng', null, 'phanUng', { loai: 'noLan' }), thu('doiVk', null, 'doiVk', {}), thu('dacBiet', null, 'dacBiet', {}), thu('chuong', null, 'chuong', {}),
        thu('ruong', null, 'moRuong', {}), thu('thuThach', null, 'thuThach', {}), thu('nangCap', null, 'nangCap', { loai: ['mai'] }),
      ].join('');
      // sổ (Phiên A): đếm trang "tìm ra điểm yếu" mới từ lúc nhận việc
      G.save.so.q = { heoCon: { g: 1, h: 3, k: 1, n: 0 } };
      nv.ds = [{ m: 'timDiemYeu', x: null, can: 1, d: 0, nhan: 0, o: 2, b: 1 }];
      K.phat('haQuai', { he: {} }); r.so0 = nv.ds[0].d;
      G.save.so.q.ongVo = { g: 1, h: 1, k: 1, n: 0 }; K.phat('haQuai', { he: {} }); r.so1 = nv.ds[0].d;
      // bot thắng ải thật
      __moi(null, 777); G.viecNgay.capNhat();
      G.save.nv.ds = [{ m: 'haQuai', x: null, can: 500, d: 0, nhan: 0, o: 0 }, { m: 'quaAi', x: null, can: 2, d: 0, nhan: 0, o: 1 }, { m: 'ne', x: null, can: 999, d: 0, nhan: 0, o: 2 }];
      G.startStage(0, 1, 0);
      const out = G.probeRun(400), S = G.getRun();
      r.win = out.win; r.kills = out.kills; r.dem = G.save.nv.ds[0].d; r.qua = G.save.nv.ds[1].d;
      r.dong = (S.result.lines || []).filter((l) => typeof l === 'string' && l.indexOf('Việc hôm nay') === 0);
      return r;
    });
    dat(m4.tut === 0, 'ải hướng dẫn không tính');
    dat(m4.d === '3,1,2' && m4.vk === 3, 'hạ quái / tinh anh / lộn né đếm đúng (' + m4.d + '); đếm số quái theo vũ khí');
    dat(m4.mau === '1010111011110111111111', 'đủ 22 mẫu đếm đúng điều kiện (' + m4.mau + ')');
    dat(m4.so0 === 0 && m4.so1 === 1, 'tìm ra điểm yếu: chỉ trang mới sau lúc nhận việc');
    dat(m4.win && m4.dem === m4.kills && m4.qua === 1, 'bot thắng ải 0-2: đếm ' + m4.dem + ' quái = số quái hạ, qua ải 1/2');
    dat(m4.dong.length === 1 && m4.dong[0] === 'Việc hôm nay: 0/3', 'bảng kết quả có 1 dòng "' + m4.dong[0] + '"');

    // ---------- 5. nhận thưởng, rương ngày, dải tuần, rương tuần ----------
    console.log('5. Nhận thưởng, rương ngày, dải tuần, rương tuần');
    const m5 = await A.goi(() => {
      const VN = G.viecNgay, r = {};
      __moi(null, 777); __ngay('2026-10-12'); // thứ Hai
      const sv = G.save;
      const lam = () => { VN.capNhat(); for (const v of sv.nv.ds) v.d = v.can; G.suKien.phat('nangCap', { loai: ['mai'] }); }; // đặt xong + 1 sự kiện để đóng dấu
      sv.gold = 0; sv.ore = 0; sv.daBac = 0; sv.linhKhi = 0; sv.buaBac = 0;
      VN.capNhat(); r.truoc = VN.nhan(0); sv.nv.ds[0].d = sv.nv.ds[0].can - 1; r.chua = VN.nhan(0);
      lam();
      r.cham = VN.choNhan(); r.ruong0 = VN.coRuong(sv.nv);
      const t = [VN.nhan(0), VN.nhan(1), VN.nhan(2)]; r.lai = VN.nhan(0);
      r.vang = sv.gold; r.quang = sv.ore; r.tong = t.reduce((a, q) => a + q.v, 0);
      r.rg = VN.moRuong(); r.rg2 = VN.moRuong(); r.da = sv.daBac; r.lk = sv.linhKhi; r.dem = sv.nv.demRuong;
      r.dau1 = sv.nv.tuan.ngay.join(','); r.cham2 = VN.choNhan();
      for (const d of ['13', '14', '15']) { __ngay('2026-10-' + d); lam(); VN.nhan(0); VN.nhan(1); VN.nhan(2); VN.moRuong(); }
      r.tuan4 = VN.coTuan(sv.nv);
      __ngay('2026-10-17'); VN.capNhat(); // bỏ thứ Sáu, làm thứ Bảy
      lam(); [0, 1, 2].forEach((i) => VN.nhan(i)); VN.moRuong();
      r.dau5 = sv.nv.tuan.ngay.join(','); r.tuan5 = VN.coTuan(sv.nv);
      const da0 = sv.daBac, bua0 = sv.buaBac;
      r.tq = VN.moTuan(); r.tq2 = VN.moTuan(); r.dTuan = sv.daBac - da0; r.bTuan = sv.buaBac - bua0;
      // mức thưởng theo trùm vùng
      r.muc = [VN.mucThuong({ stars: {} }), VN.mucThuong({ stars: { '0-4': 1 } }), VN.mucThuong({ stars: { '0-4': 1, '1-4': 2 } }), VN.mucThuong({ stars: {}, stars2: { '1-4': 1 } })].join('');
      return r;
    });
    dat(m5.truoc === null && m5.chua === null, 'việc chưa xong: không nhận được');
    dat(m5.cham && m5.ruong0 === true, 'xong 3/3 việc: chấm đỏ, rương ngày mở được');
    dat(m5.tong === 60 + 90 + 120 && m5.vang === 270 && m5.quang === 9 && m5.lai === null, 'nhận 3 việc mức 1: 60 + 90 + 120 vàng, 2 + 3 + 4 quặng; nhận lại không được');
    dat(m5.rg && m5.rg.da === 2 && m5.rg.lk === 8 && m5.da === 2 && m5.lk === 8 && m5.rg2 === null && m5.dem === 1, 'rương ngày mức 1: 2 đá + 8 linh khí, mở một lần, đếm demRuong');
    dat(m5.dau1 === '0' && m5.cham2 === false, 'xong 3/3 thứ Hai → đóng dấu ô thứ Hai; nhận hết thì hết chấm đỏ');
    dat(m5.tuan4 === false && m5.dau5 === '0,1,2,3,5' && m5.tuan5 === true, '4 ngày chưa có rương tuần; ngày thứ 5 (bỏ thứ Sáu) → có');
    dat(m5.tq && m5.tq.bua === 1 && m5.dTuan === 5 && m5.bTuan === 1 && m5.tq2 === null, 'rương tuần mức 1: 1 bùa + 5 đá, một lần');
    dat(m5.muc === '0122', 'mức thưởng: chưa hạ Mộc Tinh 1, hạ Mộc Tinh 2, hạ Ngư Tinh 3 (cả độ khó 2)');

    // ---------- 6. quên nhận ----------
    console.log('6. Quên nhận → hôm sau tự cộng');
    const m6 = await A.goi(() => {
      const VN = G.viecNgay, r = {};
      __moi({ '0-0': 3, '0-1': 3, '0-4': 2 }, 777); __ngay('2026-10-14'); // mức 2
      const sv = G.save; sv.gold = 0; sv.ore = 0; sv.daBac = 0; sv.linhKhi = 0; sv.buaBac = 0;
      VN.capNhat(); for (const v of sv.nv.ds) v.d = v.can; G.suKien.phat('nangCap', { loai: ['mai'] });
      VN.nhan(0); const g0 = sv.gold; // nhận 1 việc, quên 2 việc + rương
      __ngay('2026-10-15'); VN.capNhat();
      r.vang = sv.gold - g0; r.quang = sv.ore; r.da = sv.daBac; r.lk = sv.linhKhi; r.quen = JSON.stringify(sv.nv.quen); r.dem = sv.nv.demRuong;
      r.moi = sv.nv.ds.every((v) => v.d === 0 && !v.nhan) && sv.nv.ruong === 0 && sv.nv.cuoi === '2026-10-15';
      r.cham = VN.choNhan();
      // bảng ở Anh Mõ báo một lần rồi xoá
      G.noRender = false; G.setScene(G.Village); G.villageApi.open('mo'); G.Village.draw();
      r.noi = G.villageApi.V.msg; r.xoa = !('quen' in sv.nv); G.villageApi.goHub(); G.noRender = true;
      // tuần: 5 ngày đóng dấu, không mở rương tuần → sang thứ Hai tuần sau tự cộng
      sv.nv.tuan = { ma: '2026-10-12', ngay: [0, 1, 2, 3, 4] }; sv.nv.tuanNhan = 0; sv.nv.ds.forEach((v) => { v.d = 0; });
      const b0 = sv.buaBac, d0 = sv.daBac;
      __ngay('2026-10-19'); VN.capNhat();
      r.bua = sv.buaBac - b0; r.daT = sv.daBac - d0; r.tuan = sv.nv.tuan.ma + ':' + sv.nv.tuan.ngay.length; r.quen2 = JSON.stringify(sv.nv.quen);
      // không quên gì: không có dòng báo
      __ngay('2026-10-20'); VN.capNhat(); r.quen3 = 'quen' in sv.nv;
      return r;
    });
    dat(m6.vang === 180 + 240 && m6.quang === 3 + 4 + 6 && m6.da === 3 && m6.lk === 12 && m6.dem === 1, 'hôm sau tự cộng 2 việc quên nhận (180 + 240 vàng mức 2) + rương ngày (3 đá, 12 linh khí)');
    dat(m6.moi && m6.quen.indexOf('"v":420') >= 0, 'ra 3 việc mới, ghi lại phần tự cộng (' + m6.quen + ')');
    dat(m6.cham && typeof m6.noi === 'string' && m6.noi.indexOf('Hôm qua bé quên nhận: +') === 0 && m6.xoa, 'chấm đỏ Anh Mõ; mở bảng: "' + m6.noi + '" rồi xoá');
    dat(m6.bua === 1 && m6.daT === 8 && m6.tuan === '2026-10-19:0' && m6.quen2.indexOf('"bua":1') >= 0, 'sang tuần mới: rương tuần quên mở tự cộng (1 bùa + 8 đá mức 2), dải tuần làm lại');
    dat(m6.quen3 === false, 'không quên gì thì không có dòng báo');

    // ---------- 7. đổi việc ----------
    console.log('7. Đổi việc');
    const m7 = await A.goi(() => {
      const VN = G.viecNgay;
      __moi(null, 777); __ngay('2026-10-15'); VN.capNhat();
      const nv = G.save.nv, a = nv.ds.map((v) => v.m), nhomKhac = nv.ds.slice(1).map((v) => G.VIEC_NGAY.mau.find((t) => t.m === v.m).nhom);
      nv.ds[0].d = 1;
      const ok = VN.doi(0), b = nv.ds.map((v) => v.m), lai = VN.doi(1);
      const nhom0 = G.VIEC_NGAY.mau.find((t) => t.m === nv.ds[0].m).nhom;
      return { a, b, ok, lai, doi: nv.doi, d: nv.ds[0].d, o: nv.ds[0].o, khac: nhomKhac.indexOf(nhom0) < 0 };
    });
    dat(m7.ok && m7.a[0] !== m7.b[0] && m7.a.slice(1).join() === m7.b.slice(1).join() && m7.d === 0 && m7.o === 0 && m7.khac, 'đổi việc Dễ: ra việc khác (' + m7.a[0] + ' → ' + m7.b[0] + '), khác nhóm, tiến độ về 0');
    dat(!m7.lai && m7.doi === 1, 'mỗi ngày chỉ đổi 1 lần');

    // ---------- 8. vẽ ----------
    console.log('8. Vẽ thẻ (VI + EN), bảng xem trong Tạm dừng, lưu');
    const m8 = await A.goi(() => {
      const VN = G.viecNgay, VA = G.villageApi, r = {};
      __moi({ '0-0': 3, '0-1': 3, '0-2': 3, '0-3': 2, '0-4': 3, '1-0': 1 }, 777); __ngay('2026-10-15'); VN.capNhat();
      const sv = G.save; sv.nv.ds[0].d = sv.nv.ds[0].can; sv.nv.tuan.ngay = [0, 2];
      G.noRender = false;
      const ve = () => { try { G.Village.draw(); return true; } catch (e) { return String(e && e.stack || e); } };
      G.setScene(G.Village); VA.open('mo'); r.vi = ve(); r.loiVi = G.theme.chuDo ? G.theme.chuDo.cat : 0;
      G.LANG = 'en'; r.en = ve(); G.LANG = 'vi';
      r.chu = sv.nv.ds.map((v) => VN.chu(v));
      G.LANG = 'en'; r.chuEn = sv.nv.ds.map((v) => VN.chu(v)); r.mucEn = G.tv('Dễ') + '/' + G.t('Việc hôm nay: {0}/{1}', 1, 3); G.LANG = 'vi';
      VA.goHub(); G.villageScene.checkNews(); r.cham = G.villageScene.state.news.mo;
      // trong ải: Tạm dừng → Việc hôm nay
      G.startStage(0, 2, 0); G.sim(2);
      const S = G.getRun(); S.mode = 'paused'; r.nut = VN.coNut();
      try { G.StageScene.draw(); VN.xemTrongAi(); r.xem = VN.dangXem(); G.StageScene.draw(); G.LANG = 'en'; G.StageScene.draw(); G.LANG = 'vi'; r.ve = true; } catch (e) { r.ve = String(e && e.stack || e); }
      G.keyP.Escape = true; G.StageScene.update(0.016); G.keyP.Escape = false; r.dong = !VN.dangXem() && S.mode === 'paused';
      S.mode = 'play'; G.StageScene.draw(); r.tat = !VN.dangXem();
      G.noRender = true;
      // lưu: nv đi qua G.fixSave (máy + mây) giữ nguyên
      const a = JSON.stringify(sv.nv), b = JSON.stringify(G.fixSave(JSON.parse(JSON.stringify(sv))).nv);
      r.luu = a === b; r.kb = a.length;
      return r;
    });
    dat(m8.vi === true && m8.en === true, 'thẻ Việc hôm nay vẽ không lỗi (VI + EN)');
    dat(m8.chuEn.every((s, i) => s !== m8.chu[i] && !/[ạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹđ]/i.test(s)) && m8.mucEn === "Easy/Today's jobs: 1/3", 'chữ việc có bản tiếng Anh (' + m8.chuEn.join(' | ') + ')');
    dat(m8.cham === true, 'chấm đỏ Anh Mõ khi có việc chờ nhận');
    dat(m8.nut && m8.xem && m8.ve === true && m8.dong && m8.tat, 'Tạm dừng: có nút, bảng xem vẽ được (VI + EN), Esc đóng về Tạm dừng, chơi tiếp thì tắt');
    dat(m8.luu && m8.kb < 1024, 'nv đi qua G.fixSave giữ nguyên (' + m8.kb + ' byte < 1 KB)');

    // ---------- 9. ?viecngay=0 ----------
    console.log('9. Cờ quay lui ?viecngay=0');
    const m9 = await B.goi(() => {
      __ngay('2026-10-15'); __moi(null, 777);
      const VA = G.villageApi, VN = G.viecNgay, r = {};
      r.bat = VN.bat(); r.rong = !!VA.PANELS.viecNgay.rong; r.the = VA.theCua('mo').map((t) => t[0]).join(',');
      VN.capNhat(); r.ds = G.save.nv.ds.length; r.nut = VN.coNut();
      G.save.nv.ds = [{ m: 'haQuai', x: null, can: 5, d: 0, nhan: 0, o: 0 }];
      G.suKien.phat('haQuai', { he: {} }); r.d = G.save.nv.ds[0].d;
      G.startStage(0, 1, 0); const out = G.probeRun(400); const S = G.getRun();
      r.dong = (S.result.lines || []).some((l) => typeof l === 'string' && l.indexOf('Việc hôm nay') === 0); r.win = out.win;
      return r;
    });
    dat(m9.bat === false && m9.rong && m9.the === 'settings', 'thẻ ẩn, Anh Mõ chỉ có Cài đặt');
    dat(m9.ds === 0 && m9.d === 0 && !m9.nut && !m9.dong && m9.win, 'không ra việc, không đếm, không nút Tạm dừng, không dòng ở bảng kết quả; dữ liệu nv giữ nguyên');
    console.log('\nPASS — ' + soDat + ' điều kiện');
  } catch (e) {
    console.error(e.message || e);
    process.exitCode = 1;
  } finally { A.dong(); B.dong(); }
})();
