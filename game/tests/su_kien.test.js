#!/usr/bin/env node
// BƯỚC 2 — PHIÊN 0: kiểm nền chung js/su_kien.js không cần trình duyệt (docs/ke-hoach/buoc-2/KE-HOACH.md mục 4 "Phiên 0").
// Chạy hai bản game trong Node qua tests/node_trang.js (DOM / canvas giả, ?cloud=0): bản thường và bản ?sukien=0 (cờ quay lui).
//   1. Bản lưu cũ (tests/cay_luu.json + bản dựng tay): G.fixSave KHÔNG đổi phần cũ (so với bản ?sukien=0), chỉ thêm so / nv / tt rỗng, an toàn.
//   2. so / nv / tt hỏng → dựng lại riêng phần đó; dữ liệu đúng giữ nguyên; sửa hai lần ra cùng kết quả.
//   3. Bot thắng 1 ải → đúng chuỗi sự kiện (vaoAi … gapQuai / haQuai … hetAi), hàm Bảng vàng (G.onStageEnd cũ) vẫn được gọi, gọi TRƯỚC hetAi.
//   4. Ải ngày → hetAi có aiNgay; các sự kiện đọc mỗi khung (lộn né, đặc biệt, đổi vũ khí, chưởng, rương, thử thách, phản ứng hệ, nâng cấp ở làng).
//   5. Khung thẻ Ông Từ / Anh Mõ: hàm rỗng thì thẻ ẩn; Phiên A / B / C gán hàm thì thẻ hiện, chấm đỏ theo .cham; vẽ không lỗi.
//   6. Mây giả: kéo bản lưu cũ từ "mây" (C.pull, Firestore giả) → bản dùng có so / nv / tt, tiến độ giữ nguyên, bản đẩy lên đọc lại được.
//   7. ?sukien=0: không phát sự kiện, không thêm so / nv / tt, thẻ mới ẩn dù có hàm.
// Chạy: node game/tests/su_kien.test.js
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
const boBa = (o) => { const c = Object.assign({}, o); delete c.so; delete c.nv; delete c.tt; return c; };
const sx = (v) => JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.keys(x).sort().reduce((a, kk) => ((a[kk] = x[kk]), a), {}) : x));

(async () => {
  // Phiên A (sổ), B (việc ngày), C (thành tựu) bù / ghi vào so, nv, tt và tự kiểm ở bài riêng (tests/so_yeu_quai.test.js…):
  // bài này kiểm NỀN CHUNG của Phiên 0 nên bản "thường" tắt ba hệ đó bằng cờ quay lui của chúng.
  const A = moTrang('soyq=0&viecngay=0&thanhtuu=0'), B = moTrang('sukien=0');
  try {
    // ---------- 0. nạp ----------
    console.log('0. Nạp game');
    const nap = await A.goi(() => ({ sk: !!G.suKien, ngay: !!G.ngay, bat: G.SU_KIEN_BAT, boc: !!(G.onStageEnd && G.onStageEnd.suKienBoc),
      trong: typeof G.suKien.goc.onStageEnd, bv: !!G.bangVang, kill: !!G.kill.suKienBoc, tick: !!G.tick.suKienBoc, fix: !!G.fixSave.suKienBoc,
      start: !!G.startStage.suKienBoc, an: !!(G.aiNgay && G.aiNgay.thuong.suKienBoc), per: !!G.persist.suKienBoc, ch: !!G.chuong.fire.suKienBoc,
      mk: !!G.moves.onKill.suKienBoc, mh: !!G.moves.onHit.suKienBoc, so: !!(G.save && G.save.so && G.save.nv && G.save.tt) }));
    dat(nap.sk && nap.ngay && nap.bat === true, 'G.suKien, G.ngay có; cờ bật mặc định');
    dat(nap.boc && nap.trong === 'function' && nap.bv, 'G.onStageEnd là lớp bọc, hàm Bảng vàng (js/bang_vang.js, nạp sau) nằm bên trong');
    // G.tick, G.startStage, G.persist: lớp bọc của tệp này nằm TRONG lớp của js/luu_luot.js / js/cloud.js / js/sprite_custom.js (nạp sau) — mục 4–9 kiểm bằng sự kiện thật
    dat(nap.kill && nap.fix && nap.an && nap.ch && nap.mk && nap.mh, 'đã bọc G.kill, G.fixSave, G.aiNgay.thuong, G.chuong.fire, G.moves.onKill/onHit');
    dat(nap.so, 'bản lưu đang dùng có so / nv / tt');
    const napB = await B.goi(() => ({ bat: G.SU_KIEN_BAT, kill: !!G.kill.suKienBoc, fix: !!G.fixSave.suKienBoc, boc: !!Object.getOwnPropertyDescriptor(G, 'onStageEnd').get, so: !!(G.save && G.save.so) }));
    dat(napB.bat === false && !napB.kill && !napB.fix && !napB.boc && !napB.so, '?sukien=0: không bọc hàm nào, bản lưu không có so');

    // ---------- 1. bản lưu cũ ----------
    console.log('1. Bản lưu cũ: G.fixSave không đổi phần cũ');
    const cu = JSON.parse(fs.readFileSync(path.join(__dirname, 'cay_luu.json'), 'utf8'));
    const tay = await A.goi(() => { G.testSave({ lvl: 14 }); const s = G.save; s.stars = { '0-0': 3, '0-1': 2, '0-2': 1, '0-3': 3, '0-4': 3 }; s.gold = 1234; s.scars = { mocTinh: 'fire' }; delete s.so; delete s.nv; delete s.tt; return JSON.stringify(s); });
    const mau = cu.concat([tay]);
    for (let i = 0; i < mau.length; i++) {
      const fa = await A.goi('function (r) { return JSON.parse(JSON.stringify(G.fixSave(JSON.parse(r)))); }', mau[i]);
      const fb = await B.goi('function (r) { return JSON.parse(JSON.stringify(G.fixSave(JSON.parse(r)))); }', mau[i]);
      dat(sx(boBa(fa)) === sx(boBa(fb)), 'bản cũ #' + (i + 1) + ': phần cũ y hệt bản ?sukien=0 (' + Object.keys(fb).length + ' khoá)');
      dat(!('so' in fb) && fa.so && fa.so.v === 1 && Object.keys(fa.so.q).length === 0 && fa.nv.v === 1 && fa.nv.hat > 0 && fa.nv.ds.length === 0 && fa.tt.v === 1 && !fa.so.bu && !fa.tt.bu,
        'bản cũ #' + (i + 1) + ': thêm so / nv / tt rỗng (chưa đặt cờ bù "bu")');
    }
    const nm = await A.goi(() => { const s = G.newSave(); return { so: 'so' in s, nv: 'nv' in s, tt: 'tt' in s }; });
    dat(!nm.so && !nm.nv && !nm.tt, 'G.newSave không có so / nv / tt (tránh vòng "thiếu gì thì bù")');

    // ---------- 2. dữ liệu hỏng / đúng ----------
    console.log('2. so / nv / tt hỏng thì dựng lại, đúng thì giữ');
    const hong = await A.goi('function (r) { const s = JSON.parse(r); s.so = "x"; s.nv = [1, 2]; s.tt = { dem: { quai: "a", tinhAnh: 5.7, khongBinh: -3 }, xong: { a: 0, b: true }, nhan: 7, dh: 5, bu: "co" }; const f = G.fixSave(s); return JSON.parse(JSON.stringify(f)); }', tay);
    dat(hong.so.v === 1 && typeof hong.so.q === 'object' && hong.nv.v === 1 && Array.isArray(hong.nv.ds) && hong.nv.tuan.ma === '' && Array.isArray(hong.nv.tuan.ngay), 'so / nv sai kiểu → dựng lại rỗng');
    dat(sx(hong.tt.dem) === sx({ tinhAnh: 5 }) && sx(hong.tt.xong) === sx({ b: 1 }) && sx(hong.tt.nhan) === '{}' && !('dh' in hong.tt) && !('bu' in hong.tt), 'tt: bỏ số hỏng, chuẩn hoá cờ');
    dat(hong.gold === 1234 && hong.stars['0-4'] === 3, 'phần cũ không bị ảnh hưởng');
    const dung = await A.goi('function (r) { const s = JSON.parse(r); s.so = { v: 1, q: { heoCon: { g: 1, h: 5, k: 1, n: 3 }, ongVo: "x" }, vung: { 0: 1 }, bu: 1 }; s.nv = { v: 1, hat: 99, cuoi: "2026-10-15", ds: [{ m: "haQuai", x: null, can: 30, d: 12, nhan: 0 }, { m: "", can: 1 }], doi: 1, ruong: 0, hom: "quaAi", tuan: { ma: "2026-10-12", ngay: [3, 1, 1, 9] }, tuanNhan: 0, demRuong: 4 }; s.tt = { v: 1, dem: { quai: 412 }, xong: { buocDau: 1 }, nhan: { buocDau: 1 }, dh: "buocDau", bu: 1 }; const f1 = JSON.stringify(G.fixSave(s)); const f2 = JSON.stringify(G.fixSave(JSON.parse(f1))); return { f: JSON.parse(f1), giong: f1 === f2 }; }', tay);
    const f = dung.f;
    dat(sx(f.so.q) === sx({ heoCon: { g: 1, h: 5, k: 1, n: 3 } }) && f.so.vung[0] === 1 && f.so.bu === 1, 'so đúng giữ nguyên (trang lỗi bỏ đi)');
    dat(f.nv.hat === 99 && f.nv.cuoi === '2026-10-15' && f.nv.ds.length === 1 && f.nv.ds[0].d === 12 && sx(f.nv.tuan.ngay) === '[1,3]' && f.nv.demRuong === 4 && f.nv.doi === 1, 'nv đúng giữ nguyên (việc lỗi, ngày trùng / ngoài 0..6 bỏ)');
    dat(f.tt.dem.quai === 412 && f.tt.dh === 'buocDau' && f.tt.bu === 1, 'tt đúng giữ nguyên');
    dat(dung.giong, 'sửa hai lần ra cùng kết quả');
    const sau = await A.goi(() => { const s = G.fixSave({ v: 1, so: { v: 2, la: 'moi' } }); return s.so; });
    dat(sau.v === 2 && sau.la === 'moi', 'so của bản game mới hơn (v > 1) để nguyên, không sửa lùi');

    // ---------- 3. ngày ----------
    console.log('3. G.ngay');
    const ng = await A.goi(() => ({ h: G.ngay.homNay(), a: G.aiNgay.homNay().key, dt: G.ngay.dauTuan('2026-10-15'), dt2: G.ngay.dauTuan('2026-10-18'), dt3: G.ngay.dauTuan('2026-10-12'),
      t: G.ngay.thuTuan('2026-10-18'), c: G.ngay.cong('2026-02-28', 1), c2: G.ngay.cong('2026-12-31', 1), s1: G.ngay.sau('2026-10-16', '2026-10-15'), s2: G.ngay.sau('2026-10-14', '2026-10-15'), s3: G.ngay.sau('2026-10-14', ''),
      r1: G.ngay.ngauNhien(G.ngay.bam('2026-10-15:99'))(), r2: G.ngay.ngauNhien(G.ngay.bam('2026-10-15:99'))(), r3: G.ngay.ngauNhien(G.ngay.bam('2026-10-16:99'))() }));
    dat(ng.h.key === ng.a && typeof ng.h.thu === 'number', 'homNay() trùng ải ngày');
    dat(ng.dt === '2026-10-12' && ng.dt2 === '2026-10-12' && ng.dt3 === '2026-10-12' && ng.t === 6, 'dauTuan = thứ Hai, Chủ nhật là ngày thứ 7 của tuần');
    dat(ng.c === '2026-03-01' && ng.c2 === '2027-01-01', 'cong() qua tháng / năm');
    dat(ng.s1 && !ng.s2 && ng.s3, 'sau(): chỉ tiến khi ngày mới lớn hơn');
    dat(ng.r1 === ng.r2 && ng.r1 !== ng.r3 && ng.r1 >= 0 && ng.r1 < 1, 'hạt giống: cùng ngày cùng số, khác ngày khác số');

    // ---------- 4. bot thắng một ải ----------
    console.log('4. Bot thắng một ải → chuỗi sự kiện');
    const tran = await A.goi(() => {
      const log = [], dem = {}, go = [];
      for (const t of G.suKien.TEN) go.push(G.suKien.on(t, (d) => { dem[t] = (dem[t] || 0) + 1; if (t !== 'gapQuai' && t !== 'haQuai' || log.length < 400) log.push(t); if (t === 'hetAi') log.push('hetAi:' + d.win + ':' + d.stars + ':' + d.khongBinh); }));
      const trong = G.suKien.goc.onStageEnd; let bv = 0;
      G.onStageEnd = function (S, R) { bv++; log.push('bangVang'); return trong.apply(this, arguments); };
      G.testSave({ lvl: 30, sharpen: 6 });
      G.startStage(0, 1, 0);
      const out = G.probeRun(400);
      const S = G.getRun();
      G.onStageEnd = trong; // trả lại hàm Bảng vàng
      for (const g of go) g();
      return { log, dem, bv, win: out.win, kills: out.kills, dodges: out.dodges, rec: G.save.rec && G.save.rec.power, trongLai: G.suKien.goc.onStageEnd === trong };
    });
    console.log('    ', JSON.stringify(tran.dem), 'win=' + tran.win, 'kills=' + tran.kills);
    dat(tran.win === true, 'bot thắng ải 0-1');
    dat(tran.log[0] === 'vaoAi' && tran.log[1] === 'vaoPhong', 'đầu chuỗi: vaoAi rồi vaoPhong');
    dat(tran.dem.gapQuai > 0 && tran.dem.haQuai === tran.kills, 'gapQuai có; số haQuai = số quái hạ của ải (' + tran.kills + ')');
    dat(tran.dem.hetAi === 1 && tran.bv === 1, 'hetAi đúng 1 lần, hàm Bảng vàng gọi đúng 1 lần');
    const iB = tran.log.indexOf('bangVang'), iH = tran.log.indexOf('hetAi'), iK = tran.log.lastIndexOf('haQuai');
    dat(iB >= 0 && iB < iH && iK < iH, 'thứ tự: … haQuai … → Bảng vàng → hetAi');
    dat(/^hetAi:true:[123]:(true|false)$/.test(tran.log[iH + 1]), 'hetAi có win, sao, khongBinh (' + tran.log[iH + 1] + ')');
    dat(tran.rec > 0 && tran.trongLai, 'Bảng vàng vẫn ghi kỷ lục Sức mạnh (' + tran.rec + '); gán lại G.onStageEnd vẫn giữ lớp bọc');
    dat(!tran.dodges || tran.dem.lonNe > 0, 'lộn né của bot được đếm (' + (tran.dem.lonNe || 0) + ' / ' + tran.dodges + ')');

    // ---------- 5. ải ngày ----------
    console.log('5. Ải ngày');
    const an = await A.goi(() => {
      let d = null; const g = G.suKien.on('hetAi', (x) => { d = x; });
      G.testSave({ lvl: 30, sharpen: 6 });
      G.save.stars['0-4'] = 3;
      const loai = G.AI_NGAY.thuTu.find((k) => G.aiNgay.moHomNay(k));
      const vao = G.aiNgay.vao(loai, 0);
      const out = G.probeRun(400);
      g();
      return { loai, vao, win: out.win, d: d && { an: d.aiNgay, win: d.win, tinhLuot: d.tinhLuot } };
    });
    dat(an.vao && an.d && an.d.an && an.d.an.loai === an.loai, 'hết ải ngày (' + an.loai + ') phát hetAi có aiNgay');
    dat(an.d.win === an.win && (!an.win || an.d.tinhLuot === true), 'thắng ải ngày có tính lượt (tinhLuot = ' + an.d.tinhLuot + ')');

    // ---------- 6. sự kiện đọc mỗi khung + phản ứng hệ ----------
    console.log('6. Lộn né, đặc biệt, đổi vũ khí, chưởng, rương, thử thách, phản ứng hệ');
    const khung = await A.goi(() => {
      const dem = {}, go = [];
      for (const t of G.suKien.TEN) go.push(G.suKien.on(t, (d) => { dem[t] = dem[t] || []; dem[t].push(d.loai || d.cay || 1); }));
      G.testSave({ lvl: 30, sharpen: 6 });
      G.startStage(0, 1, 0);
      G.sim(2);
      let S = G.getRun(), P = S.P;
      P.dodgeT = 0.27; G.sim(1);
      P.specCd = 0.8; G.sim(1);
      P.cur = (P.cur + 1) % P.weapons.length; G.sim(1);
      P.mana = P.maxmana; const chOk = !!G.chuong.fire(P, 0); G.sim(1);
      // phản ứng hệ: vũ khí Thức tỉnh Lửa / Độc / Băng
      const w = G.curW(P);
      const thuc = (el) => { w.branch = el; w.marks[el] = G.MARKS[2]; };
      const tim = () => G.getWorld().ents.find((e) => !e.dead && !e.add && !e.illusion);
      const quai = () => { // phòng quái có quái đang đứng (P bất tử cho khỏi chết lúc chờ)
        for (let lan = 0; lan < 6; lan++) {
          for (let k = 0; k < 240 && !tim(); k++) { G.getRun().P.inv = 9; G.sim(1); }
          if (tim()) return tim();
          G.testGoto(lan % 2 ? 'elite' : 'fight'); G.sim(1);
        }
        return null;
      };
      let e = quai(); thuc('fire'); e.st.fire = 2; G.kill(e, { w });
      e = quai(); thuc('poison'); e.st.poisonN = 1; e.st.poisonDmg = 1; G.kill(e, { w });
      e = quai(); thuc('ice'); e.st.frozen = 1; e.mvShat = false; G.moves.onHit(e, 1, 'ice', { w });
      // rương
      G.testGoto('chest'); G.sim(1);
      S = G.getRun();
      const ruong = S.W.props.find((p) => p.type === 'chest');
      if (ruong) ruong.used = true;
      G.sim(1);
      // thử thách: dọn phòng nhanh
      G.testGoto('challenge'); G.sim(1);
      S = G.getRun();
      const coTT = !!S.challenge;
      for (let k = 0; k < 2000 && !S.W.cleared; k++) { for (const q of S.W.ents) if (!q.dead) G.kill(q, {}); G.sim(1); }
      G.sim(1);
      for (const g of go) g();
      return { dem, chOk, coRuong: !!ruong, coTT, daDon: S.W.cleared };
    });
    const d6 = khung.dem;
    dat((d6.lonNe || []).length === 1, 'lonNe khi P.dodgeT vừa bật');
    dat((d6.dacBiet || []).length === 1, 'dacBiet khi hồi chiêu đặc biệt vừa đặt');
    dat((d6.doiVk || []).length === 1, 'doiVk khi đổi vũ khí đang cầm');
    dat(khung.chOk && (d6.chuong || []).length === 1, 'chuong khi bắn chưởng (cây ' + (d6.chuong || [])[0] + ')');
    dat(sx(d6.phanUng) === sx(['noLan', 'layDoc', 'bangVo']), 'phanUng: Nổ lan, Lây độc, Băng vỡ (' + sx(d6.phanUng) + ')');
    dat(khung.coRuong && (d6.moRuong || []).length === 1, 'moRuong khi rương vừa được dùng');
    dat(khung.coTT && khung.daDon && (d6.thuThach || []).length === 1, 'thuThach khi dọn phòng thử thách kịp giờ');
    dat((d6.vaoPhong || []).length >= 3, 'vaoPhong mỗi lần sang phòng (' + (d6.vaoPhong || []).length + ')');

    // ---------- 7. nâng cấp ở làng ----------
    console.log('7. Nâng cấp ở làng');
    const nc = await A.goi(() => {
      const ds = []; const g = G.suKien.on('nangCap', (d) => ds.push(d.loai.join('+')));
      G.testSave({ lvl: 12 });
      G.setScene(G.Village); // Village.enter gọi G.persist: lấy mốc
      const sv = G.save, w = G.weaponById(sv.carry[0]);
      G.persist(); // không đổi gì
      w.sharpen++; G.persist();
      sv.heroes.smith.sk.atk++; G.persist();
      sv.forge++; G.persist();
      sv.gold += 50; G.persist(); // vàng không phải nâng cấp
      g();
      return ds;
    });
    dat(sx(nc) === sx(['mai', 'diem', 'lo']), 'nangCap: mài, học điểm, nâng lò; lưu không đổi gì thì không phát (' + sx(nc) + ')');

    // ---------- 8. khung thẻ Ông Từ / Anh Mõ ----------
    console.log('8. Khung thẻ Ông Từ (Cu Tí | Sổ | Thành tựu), Anh Mõ (Việc hôm nay | Cài đặt)');
    const the = await A.goi(() => {
      const VA = G.villageApi, P = VA.PANELS, V = VA.V, r = {};
      // Phiên A / B / C đã điền hàm thật: tạm thay bằng hàm rỗng (.rong) để kiểm đúng trạng thái Phiên 0, cuối mục trả lại
      const that = { so: P.so, thanhTuu: P.thanhTuu, viecNgay: P.viecNgay };
      for (const k of Object.keys(that)) if (!P[k].rong) { const f = function () { return ''; }; f.rong = true; P[k] = f; }
      G.noRender = false;
      const ve = () => { try { G.Village.draw(); return true; } catch (e) { return String(e && e.stack || e); } };
      r.rong = [P.so.rong, P.thanhTuu.rong, P.viecNgay.rong];
      r.the0 = [VA.theCua('tu').length, VA.theCua('mo').length];
      VA.open('tu'); r.tab0 = V.tab; r.ve0 = ve();
      VA.open('mo'); r.tab1 = V.tab; r.ve1 = ve();
      const goc = { so: P.so, thanhTuu: P.thanhTuu, viecNgay: P.viecNgay };
      let goi = 0;
      P.so = function () { goi++; VA.khungThe('tu', 'Sân đình: sổ yêu quái'); return 'Sổ đây cháu.'; };
      P.thanhTuu = function () { VA.khungThe('tu', 'Sân đình: thành tựu'); return 'Thành tựu.'; };
      P.thanhTuu.mo = () => false; // chưa mở
      P.viecNgay = function () { VA.khungThe('mo', 'Cổng làng: việc hôm nay'); return 'Việc đây.'; };
      r.the1 = [VA.theCua('tu').map((t) => t[0]).join(','), VA.theCua('mo').map((t) => t[0]).join(',')];
      VA.open('tu'); V.tab = 'so'; V.ttab = 'so'; r.ve2 = ve(); r.goi = goi;
      VA.goHub(); VA.open('tu'); r.nho = V.tab; // nhớ thẻ vừa xem
      V.tab = 'thanhTuu'; r.ve3 = ve(); r.veVe = V.tab; // thẻ chưa mở → về thẻ Cu Tí
      VA.open('mo'); r.tab2 = V.tab; r.ve4 = ve();
      G.save.stars = { '0-0': 3, '0-1': 3 };
      P.so.cham = () => true; P.viecNgay.cham = () => true;
      G.villageScene.checkNews(); r.cham = [G.villageScene.state.news.tu, G.villageScene.state.news.mo];
      P.so.cham = () => false; P.viecNgay.cham = () => false;
      G.villageScene.checkNews(); r.cham2 = [G.villageScene.state.news.tu, G.villageScene.state.news.mo];
      Object.assign(P, that); VA.goHub();
      G.noRender = true;
      return r;
    });
    dat(the.rong.every(Boolean) && sx(the.the0) === '[1,1]', 'Phiên 0: ba hàm rỗng (.rong), chưa có hàng thẻ');
    dat(the.tab0 === 'hero' && the.tab1 === 'settings' && the.ve0 === true && the.ve1 === true, 'chưa điền: Ông Từ mở Cu Tí, Anh Mõ mở Cài đặt như cũ, vẽ không lỗi');
    dat(the.the1[0] === 'hero,so' && the.the1[1] === 'viecNgay,settings', 'điền hàm: thẻ hiện theo thứ tự, thẻ .mo() = false thì ẩn');
    dat(the.ve2 === true && the.goi > 0 && the.nho === 'so', 'thẻ Sổ vẽ được, Ông Từ nhớ thẻ vừa xem');
    dat(the.ve3 === true && the.veVe === 'hero', 'thẻ chưa mở → về thẻ Cu Tí');
    dat(the.tab2 === 'viecNgay' && the.ve4 === true, 'Anh Mõ mở thẻ Việc hôm nay trước');
    dat(sx(the.cham) === '[true,true]' && sx(the.cham2) === '[false,false]', 'chấm đỏ Ông Từ / Anh Mõ theo .cham() của thẻ');

    // ---------- 9. mây giả ----------
    console.log('9. Mây giả: kéo bản lưu cũ từ mây');
    const may0 = await A.goi('function (r) { G.resetSave(); G.setScene(G.Village); const C = G.cloud; window.__ghi = []; window.__xong = null; ' +
      'C.ready = true; C.enabled = true; C.user = { uid: "u1", isAnonymous: false }; G.save.owner = "u1"; G.save.savedAt = 1; ' +
      'C.db = { collection() { return { doc() { return { get: () => Promise.resolve({ exists: true, data: () => ({ save: r, updatedAt: 2e12 }) }), set: (d) => { window.__ghi.push(d); return Promise.resolve(); }, update: () => Promise.resolve() }; } }; } }; ' +
      'C.pull().then(() => { window.__xong = "ok"; }, (e) => { window.__xong = String(e); }); return true; }', cu[cu.length - 1]);
    dat(may0, 'gọi C.pull với Firestore giả');
    await A.goi('1'); await A.goi('1');
    const may = await A.goi('function (r) { const c = JSON.parse(r), s = G.save; return { xong: window.__xong, sao: JSON.stringify(s.stars) === JSON.stringify(c.stars), vang: s.gold === c.gold, so: !!(s.so && s.nv && s.tt), owner: s.owner }; }', cu[cu.length - 1]);
    dat(may.xong === 'ok' && may.sao && may.vang && may.so && may.owner === 'u1', 'dùng bản mây: tiến độ giữ nguyên, có so / nv / tt');
    const day = await A.goi(() => { const C = G.cloud; G.save.gold += 1; G.persist(); return C.push(true).then ? 'p' : 'x'; });
    await A.goi('1');
    const ghi = await A.goi(() => { const d = window.__ghi[window.__ghi.length - 1]; if (!d) return null; const s = JSON.parse(d.save); const lai = G.fixSave(JSON.parse(d.save)); return { so: !!s.so && s.so.v === 1, nv: s.nv.hat > 0, kb: d.save.length, lai: JSON.stringify(lai.so) === JSON.stringify(s.so) }; });
    dat(day === 'p' && ghi && ghi.so && ghi.nv && ghi.lai && ghi.kb < 400000, 'đẩy lên mây: chuỗi bản lưu có so / nv / tt, đọc lại y nguyên (' + (ghi && Math.round(ghi.kb / 1024)) + ' KB < 400 KB)');
    await A.goi(() => { const C = G.cloud; C.ready = false; C.user = null; C.db = null; return true; });

    // ---------- 10. ?sukien=0 ----------
    console.log('10. Cờ quay lui ?sukien=0');
    const tat = await B.goi(() => {
      let n = 0; for (const t of G.suKien.TEN) G.suKien.on(t, () => { n++; });
      G.testSave({ lvl: 30, sharpen: 6 }); G.startStage(0, 1, 0); const out = G.probeRun(400);
      const VA = G.villageApi, P = VA.PANELS, goc = P.so;
      P.so = function () { return ''; };
      const the = VA.theCua('tu').length; P.so = goc;
      return { n, win: out.win, so: 'so' in G.save, the };
    });
    dat(tat.n === 0 && tat.win, 'không phát sự kiện nào (bot vẫn thắng)');
    dat(!tat.so && tat.the === 1, 'bản lưu không thêm so; thẻ mới ẩn dù đã có hàm');

    const loiA = await A.goi(() => (window.__loiNgam || []).filter((s) => /su_kien|suKien|khungThe|theMo/.test(s)));
    dat(!loiA.length, 'không có lỗi ngầm nào từ js/su_kien.js / khung thẻ');
    console.log('\nPASS — ' + soDat + ' điều kiện');
  } catch (e) {
    console.error(e.stack || e);
    console.error('--- stderr bản thường ---\n' + A.loi().slice(-3000));
    process.exitCode = 1;
  } finally { A.dong(); B.dong(); }
})();
