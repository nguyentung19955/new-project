// ASTRAL ARSENAL — KIỂM "CHẾ ĐỘ NHƯ DCDW" (11/11, nhánh claude/che-do-dcdw): BỎ 4 chế độ + ĐƯỜNG ĐUA (RACE TRACK) — thap/js/chedo-dd.js, chedo-c.js, chedo-d.js
//  ✓ GAME MODE chỉ còn TOWER CLIMB · CO-OP · PVP · ONLINE · RACE TRACK (không Săn Trùm / Thử thách ngắn / Thử thách tuần / Vô tận / SOLO)
//  ✓ CD.vao('san' | 'thu') không vào được · không còn khoá tính năng san / thu / tw / vt (không báo "mở tính năng") · bản lưu cũ cd.san / thu / vt / tw còn nguyên
//  ✓ thắng tầng 100 Leo Tháp = kết thúc bình thường (không hỏi FINISH / ENDLESS, không vào Vô tận)
//  ✓ Đường Đua: bàn co-op, đồng đội dùng cùng bộ bài, 3 tim, đồng hồ 8:00; chuỗi quái theo hạt TUẦN (2 lượt cùng tuần → cùng chuỗi loại/làn)
//  ✓ TẤT ĐỊNH: 2 lượt cùng hạt trận (Math.random có hạt, bot của game chơi) → cùng điểm / số diệt / thời gian · chedo-dd.js không gọi Math.random
//  ✓ trần quái sống: lúc SINH không vượt DDC.tran · điểm = tổng cân nặng · hết lượt: kỷ lục tuần + mốc (cờ ghi 1 lần — lượt 2 không phát lại)
//  ✓ lưu ở turret_kt.cd.dd · không ghi kỷ lục wave CO-OP (turret_best) · bản ghi bảng xếp hạng lb/dd/{tuần}: w = điểm, k = w·100000 + 99999 − t
//  ✓ bảng xếp hạng chỉ 1 tab (RACE TRACK) · tab EVENT có thẻ RACE TRACK, không còn WEEKLY CHALLENGE · tiếng Việt có ĐƯỜNG ĐUA
// Chạy: python3 -m http.server 8765 (gốc repo) · NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-duong-dua.js [BASE]
'use strict';
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const BASE = process.argv[2] || process.env.BASE || 'http://localhost:8765/thap/';
let loi = 0; const ok = (c, t) => { console.log((c ? '  ✓ ' : '  ✗ ') + t); if (!c) loi++; };

(async () => {
  const src = fs.readFileSync(path.join(__dirname, '../thap/js/chedo-dd.js'), 'utf8').split('\n').filter(l => !/^\s*\/\//.test(l)).join('\n');
  ok(!/Math\.random/.test(src), 'chedo-dd.js không gọi Math.random');
  const b = await chromium.launch({ args: ['--disable-gpu'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route(/\.(mp3|ogg|wav|m4a|mp4|webm)(\?.*)?$/i, r => r.abort());
  const mo = async (q) => {
    const p = await ctx.newPage(); p._e = []; p.on('pageerror', e => p._e.push(e.message.slice(0, 160)));
    await p.goto(BASE + 'index.html?notut=1&net=0' + (q || ''), { waitUntil: 'load' });
    await p.waitForFunction(() => typeof G !== 'undefined' && G.roster && G.roster.length && typeof DD !== 'undefined' && typeof HM !== 'undefined' && typeof UI !== 'undefined', null, { timeout: 30000 });
    await p.waitForTimeout(1200);
    await p.evaluate(() => { HD.moKhoa = () => true; UI.chon = ['cuongno', 'baotuyet', 'no5', 'lienket', 'sungluc']; });
    return p;
  };
  // ---------- 1. giao diện sau khi bỏ 4 chế độ ----------
  let p = await mo();
  await p.evaluate(() => { const c = CD.st(); c.san.da = { 'x:1': 1 }; c.thu.da = { 1: 1 }; c.vt = { best: 88 }; c.tw = { best: 20, tuan: 1 }; KT.luu(); });
  const g = await p.evaluate(() => {
    HM.moChe(); const che = [...document.querySelectorAll('#hm-tam .hm-chec')].map(x => x.dataset.che); HM.dong(true);
    const vao = [CD.vao('san', (CD.dsTrum()[0]), 1), CD.vao('thu', 1), CD.vao('thap', 1)], macDinh = HM.che;
    KTUI.moTab('sk'); const sk = document.getElementById('kt').textContent; KTUI.dong();
    CDDUI.bxhMo(); const tab = [...document.querySelectorAll('#tt-phu .cdd-tb')].map(x => x.textContent); TTUI.dong();
    const c = CD.st();
    return { che, vao, macDinh, tn: ['san', 'thu', 'tw', 'vt', 'thap'].filter(k => TTC.tn[k]), dd: !!TTC.tn.dd, skDD: /RACE TRACK/.test(sk), skTW: /WEEKLY CHALLENGE/.test(sk), tab, cu: [c.san.da['x:1'], c.thu.da[1], c.vt.best, c.tw.best] };
  });
  ok(g.che.join() === 'coop,pvp,online,dd,hd,rd,pu' /* 12/11: thêm RAID, PUSH */ && g.macDinh === 'coop', 'GAME MODE = ' + g.che.join() + ' · mặc định ' + g.macDinh + ' (không còn Leo Tháp)');
  ok(g.vao.every(x => x === false), 'CD.vao(san / thu / thap) không vào được');
  ok(!g.tn.length && g.dd, 'khoá tính năng: không còn san/thu/tw/vt (' + g.tn.join() + '), có dd');
  ok(g.skDD && !g.skTW, 'tab EVENT: có thẻ RACE TRACK, không còn WEEKLY CHALLENGE');
  ok(g.tab.length === 1 && /RACE TRACK/.test(g.tab[0]), 'bảng xếp hạng 1 tab: ' + g.tab.join(' | '));
  ok(g.cu.join() === '1,1,88,20', 'bản lưu cũ cd.san / thu / vt / tw còn nguyên (' + g.cu.join() + ')');
  // ---------- 2. tầng 100 Leo Tháp ----------
  const t100 = await p.evaluate(() => {
    CD.st().thap.max = 99; G.debug.auto = true;
    CD.cho = CD.cauHinh('thap', 100); UI.che = 'solo'; UI.vao(); if (!G.cd) return null; // Leo Tháp đã bỏ: vào thẳng bằng cấu hình (chỉ để kiểm không còn hỏi ENDLESS)
    const dung0 = !!G.dung; // màn mở đầu trận có thể đang giữ G.dung — chỉ so trước/sau
    for (let i = 0; i < 400; i++) capNhat(1 / 60);
    G.wave = G.cd.w1; G.cd.het = true; G.hang.length = 0; for (const E of G.quai) { E.chet = true; E.tChet = 1; } capNhat(1 / 60); capNhat(1 / 60);
    const h = document.getElementById('cdd-hoi');
    return { kt: !!G.ketThuc, thang: !!(G.ketThuc && G.ketThuc.thang), hoi: !!(h && !h.hidden), vt: !!(G.vt && G.vt.on), dung: !!G.dung !== dung0 };
  });
  ok(t100 && t100.kt && t100.thang && !t100.hoi && !t100.vt && !t100.dung, 'thắng tầng 100 = kết thúc bình thường, không hỏi ENDLESS ' + JSON.stringify(t100));
  await p.waitForTimeout(1500);
  ok(await p.evaluate(() => CD.st().thap.max === 100 && !document.getElementById('ketqua').hidden), 'màn kết quả tầng 100 hiện, thap.max = 100');
  ok(!p._e.length, 'không lỗi trang (phần 1–2) ' + p._e.join(' | ')); await p.close();
  // ---------- 2b. bỏ Leo Tháp: mốc wave CO-OP lần đầu + quy đổi tầng cũ + hướng dẫn riêng ----------
  p = await mo();
  const cm = await p.evaluate(async () => {
    const o = {}, v0 = KT.vang, n0 = KT.ngoc;
    o.ke0 = MOCW.ke(); const a = MOCW.nhan(25); o.moc = a.moc.join(); o.vang = KT.vang - v0; o.ngoc = KT.ngoc - n0; o.lai = MOCW.nhan(25).moc.length; o.ke1 = MOCW.ke();
    o.luu = Object.keys(JSON.parse(localStorage.getItem('turret_kt')).cd.cm.nhan).join();
    const c = CD.st(); c.thap.max = 40; delete c.cm; o.qd = Object.keys(MOCW.st().nhan).join(); o.wave = TT.giaTri('wave'); o.tang = TT.giaTri('tang');
    c.thap.max = 0; TT.st().dem.wave = 17; o.wave2 = TT.giaTri('wave');
    o.hj = TTC.hj.map(d => d.v.map(x => x[0] + x[1]).join('/')).join(' ');
    o.do = TT.dk('do'); o.mv = HM.mvMoChu(Object.keys(MAVUONG).find(id => MAVUONG[id].mo2));
    HM.chonChe('hd'); await new Promise(r => setTimeout(r, 300));
    o.hd = { dang: HD.dang, che: G.che, deck: G.ban[0] && G.ban[0].deck.join(), cd: !!G.cd, dd: !!G.dd, home: HM.che };
    return o;
  });
  ok(cm.ke0 === 10 && cm.moc === '10,20' && cm.vang === 8000 && cm.ngoc === 90 && cm.lai === 0 && cm.ke1 === 30 && cm.luu === '10,20', 'mốc wave CO-OP lần đầu: tới wave 25 → mốc 10 + 20 (8 000 vàng, 90 ngọc), không phát lại, kế tiếp 30 ' + JSON.stringify(cm).slice(0, 120));
  ok(cm.qd === '10,20,30' && cm.wave === 33 && cm.tang === 40, 'quy đổi tầng cũ: tầng 40 → mốc 10/20/30 coi như đã nhận, Hành trình thấy wave ' + cm.wave);
  ok(cm.wave2 === 17 && !/tang/.test(cm.hj), 'Hành trình đo theo wave: ' + cm.hj);
  ok(/wave 30/.test(cm.do) && !/floor/i.test(cm.do) && /wave/.test(cm.mv) && !/floor/i.test(cm.mv), 'điều kiện Đỏ / chỉ huy ghi theo wave: ' + cm.do);
  ok(cm.hd.dang && cm.hd.che === 'solo' && cm.hd.deck === 'tia,lien,bang,set,sungluc' && !cm.hd.cd && !cm.hd.dd && cm.hd.home === 'coop', 'GAME MODE → TUTORIAL: trận hướng dẫn riêng (bộ cố định, không cấu hình chế độ nào) ' + JSON.stringify(cm.hd));
  ok(!p._e.length, 'không lỗi trang (phần 2b) ' + p._e.join(' | ')); await p.close();
  // ---------- 3. Đường Đua: 2 lượt cùng hạt ----------
  const chay = async (lan) => {
    const p = await mo();
    const r = await p.evaluate((lan) => {
      const mb = (a) => function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
      G.debug.auto = true; G.debug.seed = 4242; REN.ve = () => { };
      const gr = mb(99), r0 = Math.random; Math.random = gr;
      const ra = { chuoi: [], dinhSinh: 0 };
      const ld = DD.loai; DD.loai = function () { const q = ld.apply(this, arguments); if (ra.chuoi.length < 60) ra.chuoi.push(q.id + q.p); return q; };
      const sq = sinhQuai; sinhQuai = function (id, pi, s) { if (!s) ra.dinhSinh = Math.max(ra.dinhSinh, DD.song()); return sq.apply(this, arguments); };
      const best0 = localStorage.getItem('turret_best');
      try {
        ra.vao = DD.vao(); G.cho = 0.5;
        ra.dau = { che: G.che, tim: G.ban[0].tim, cung: G.ban[0].deck.join() === G.ban[1].deck.join(), dd: !!G.dd, cd: !!G.cd };
        let n = 0; while (!G.ketThuc && n++ < 40000) { capNhat(1 / 60); if (n % 30 === 0) { try { FX.capNhat(0.5); if (VX.ds && VX.ds.length > 200) VX.reset(); } catch (e) { } } }
      } finally { Math.random = r0; }
      const k = G.ketThuc; ra.kq = k && { thang: k.thang, dd: k.dd };
      ra.tim = G.ban[0].tim; UI.ketQua(k);
      const s = JSON.parse(JSON.stringify(DD.st()));
      ra.st = s; ra.luu = JSON.parse(localStorage.getItem('turret_kt')).cd.dd; ra.lb = CD.st().lb && CD.st().lb.dd; ra.best = localStorage.getItem('turret_best') === best0;
      ra.banGhi = BXH.banGhi('dd', 617, 408); ra.duong = BXH.duong('dd', 2967);
      ra.chu = [document.getElementById('kq-so').textContent, document.querySelector('#ketqua [data-act="choilai"]').textContent, document.getElementById('kq-phu').textContent];
      if (lan === 2) { const v0 = KT.vang; const x = DD.ket(DD.cauHinh(), k.dd); ra.lai = { moc: x.moc.length, vang: KT.vang - v0, moi: x.moi }; }
      return ra;
    }, lan);
    r.e = p._e; await p.close(); return r;
  };
  const a = await chay(1), c = await chay(2);
  ok(a.vao && a.dau.che === 'coop' && a.dau.tim === 3 && a.dau.cung && a.dau.dd && !a.dau.cd, 'vào trận: bàn co-op, 3 tim, đồng đội cùng bộ bài ' + JSON.stringify(a.dau));
  ok(a.kq && a.kq.dd && a.kq.dd.diem > 50, 'lượt 1: điểm ' + (a.kq && a.kq.dd && a.kq.dd.diem) + ' · diệt ' + (a.kq && a.kq.dd && a.kq.dd.giet) + ' · ' + (a.kq && a.kq.dd && a.kq.dd.t) + ' s · tim ' + a.tim);
  ok(JSON.stringify(a.kq) === JSON.stringify(c.kq), 'TẤT ĐỊNH: lượt 2 cùng hạt → cùng kết quả ' + JSON.stringify(c.kq));
  ok(a.chuoi.join() === c.chuoi.join() && a.chuoi.length === 60, 'chuỗi quái theo hạt tuần giống nhau (60 con đầu: ' + a.chuoi.slice(0, 8).join(' ') + ' …)');
  ok(a.dinhSinh < 34 + 1 && a.dinhSinh > 0, 'trần quái sống lúc sinh ≤ DDC.tran (đỉnh lúc sinh ' + a.dinhSinh + ')');
  ok(a.kq.dd.diem >= a.kq.dd.giet, 'điểm (' + a.kq.dd.diem + ') ≥ số diệt (' + a.kq.dd.giet + ') — cân nặng');
  ok(a.st.best === a.kq.dd.diem && a.luu && a.luu.best === a.kq.dd.diem, 'kỷ lục tuần lưu ở turret_kt.cd.dd = ' + (a.luu && a.luu.best));
  const mocDat = [100, 250, 400, 550, 700, 850].filter(m => a.kq.dd.diem >= m);
  ok(Object.keys(a.st.nhan).map(Number).sort((x, y) => x - y).join() === mocDat.join(), 'cờ mốc đã ghi: ' + Object.keys(a.st.nhan).join() + ' (điểm ' + a.kq.dd.diem + ')');
  ok(c.lai && c.lai.moc === 0 && c.lai.vang === 0 && !c.lai.moi, 'tính lại cùng điểm: không phát lại mốc, không kỷ lục mới ' + JSON.stringify(c.lai));
  ok(a.best, 'không ghi kỷ lục wave (turret_best không đổi)');
  ok(!a.lb, 'trận thử (auto) không xếp hàng gửi bảng xếp hạng');
  const bg = a.banGhi;
  ok(a.duong === 'lb/dd/2967' && bg.w === 617 && bg.t === 408 && bg.k === 617 * 100000 + 99999 - 408 && bg.v === 1 && typeof bg.n === 'string', 'bản ghi lb/dd: ' + JSON.stringify({ w: bg.w, t: bg.t, k: bg.k }));
  ok(/^SCORE/.test(a.chu[0]) && a.chu[1] === 'RACE AGAIN' && /RACE TRACK · WEEK/.test(a.chu[2]), 'màn kết quả: ' + a.chu.join(' | '));
  ok(!a.e.length && !c.e.length, 'không lỗi trang (Đường Đua) ' + a.e.concat(c.e).join(' | '));
  // ---------- 4. tiếng Việt ----------
  p = await mo('&lang=vi');
  const vi = await p.evaluate(async () => { HM.moChe(); await new Promise(r => setTimeout(r, 400)); const t = document.getElementById('hm-tam').textContent; HM.dong(true); HM.chonChe('dd'); HM.choi(); await new Promise(r => setTimeout(r, 600)); return [t, document.getElementById('tt-phu').textContent]; });
  ok(/ĐƯỜNG ĐUA/.test(vi[0]) && /HƯỚNG DẪN/.test(vi[0]) && !/SĂN TRÙM|VÔ TẬN|THỬ THÁCH|LEO THÁP/.test(vi[0]), 'VI: GAME MODE có ĐƯỜNG ĐUA, không còn 4 chế độ cũ');
  ok(/ĐƯỜNG ĐUA/.test(vi[1]) && /MỐC TUẦN/.test(vi[1]) && /BẮT ĐẦU ĐUA/.test(vi[1]) && !/RACE|WEEK |PTS/.test(vi[1]), 'VI: bảng Đường Đua đã dịch');
  ok(!p._e.length, 'không lỗi trang (VI) ' + p._e.join(' | ')); await p.close();
  await b.close();
  console.log(loi ? '✗ Đường Đua / bỏ chế độ: ' + loi + ' lỗi' : '✓ Đường Đua / bỏ chế độ đạt');
  process.exit(loi ? 1 : 0);
})();
