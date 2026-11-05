#!/usr/bin/env node
// F2 BẢO VỆ BẢN LƯU — lưu mây (js/cloud.js nhánh mới + js/luu_an_toan.js) với FIRESTORE GIẢ trong Node (không mạng, không tài khoản thật,
// trang chạy ?cloud=0; bài kiểm tự gắn Firestore giả vào G.cloud). Chạy: node game/tests/luu_may.test.js
//  Bảng mục 4.4: mây trống + máy có tiến trình (không ghi lúc vừa đăng nhập); máy trắng + mây có → tải, giữ bản máy; giống → không làm gì;
//  kế thừa (máy đi tiếp / mây đi tiếp); hai bản tiến triển độc lập → màn chọn (Use Cloud / Keep This Device / Cancel), sao lưu cả hai;
//  so-sánh-rồi-ghi (máy khác ghi chen giữa → không ghi đè); ngoại tuyến rồi có mạng lại (đọc trước rồi mới đồng bộ); mây hỏng; mây do mã mới
//  hơn tạo; bản sao mây (≤ 3, < 400000 ký tự); khôi phục từ mây khi máy hỏng; đổi tài khoản Google; ?luucu=1 vẫn chạy đường cũ.
'use strict';
const fs = require('fs'), path = require('path');
const { moTrang, dat, dem } = require('./luu_lib');
const FX = path.join(__dirname, 'fixtures-luu');
const fx = (f) => JSON.parse(fs.readFileSync(path.join(FX, f), 'utf8')).save;

// Cài trong trang: Firestore giả + hàm tiện
const CAI = () => {
  globalThis.taoDb = function () {
    const docs = {}, log = [];
    const chep = (x) => JSON.parse(JSON.stringify(x));
    const snap = (id) => ({ exists: id in docs, data: () => chep(docs[id]) });
    const db = { docs, log, offline: false };
    const loiMang = () => { const e = new Error('mất mạng'); e.code = 'unavailable'; return e; };
    db.collection = (c) => ({ doc: (id) => ({ id: c + '/' + id,
      get: async () => { if (db.offline) throw loiMang(); return snap(c + '/' + id); },
      set: async (d) => { if (db.offline) throw loiMang(); docs[c + '/' + id] = chep(d); log.push('set'); } }) });
    db.runTransaction = async (fn) => {
      if (db.offline) throw loiMang();
      const ghi = [];
      const tx = { get: async (r) => snap(r.id), set: (r, d) => { ghi.push([r.id, d]); } };
      const kq = await fn(tx);
      if (db.chen) { const f = db.chen; db.chen = null; f(); } // máy khác ghi chen sau lúc đọc: transaction thật sẽ thử lại, ở đây đọc lại để mô phỏng
      for (const [id, d] of ghi) { docs[id] = chep(d); log.push('tx'); }
      return kq;
    };
    return db;
  };
  globalThis.ganMay = function (uid, db) {
    const C = G.cloud;
    C.db = db; C.user = { uid, isAnonymous: uid.indexOf('khach') === 0, providerData: [] }; C.ready = true; C.enabled = true; C.why = ''; C.status = 'ok';
    C.daDongBo = false; C.mayToken = undefined; C.choChon = false; C.tamDung = false; C.chanGhi = ''; C.dirty = false; C.pendingApply = null; C._epSaoLuu = false;
    C._doc = function () { return this.db.collection('linhkhi_users').doc(this.user.uid); };
    return 1;
  };
  globalThis.napMay = function (raw, them) {
    const ls = window.localStorage, LA = G.luuAT; ls.clear();
    if (LA.man) LA.man.length = 0; if (LA.mo) LA.dong();
    if (raw != null) ls.setItem('linhkhi_save_v1', raw);
    for (const k in them || {}) ls.setItem(k, them[k]);
    G.loadSave();
    if (LA.mo) { LA.man.unshift(LA.mo); LA.dong(); } // không mở màn ngay (G.scene trong Node): giữ trong hàng đợi để bài kiểm đọc
    return 1;
  };
  globalThis.xa = async () => { for (let i = 0; i < 200; i++) await null; };
  globalThis.dsMan = () => { const LA = G.luuAT; return (LA.mo ? [LA.mo] : []).concat(LA.man); };
  // tài liệu mây kiểu "máy khác vừa ghi" (đường mới): save JSON có revision
  globalThis.docMay = function (s, at) { return { save: JSON.stringify(s), updatedAt: at || Date.now(), prog: G.cloud.progress(s), v: 1, ver: 'thu' }; };
  globalThis.mayS = function (db, uid) { const d = db.docs['linhkhi_users/' + uid]; return d ? JSON.parse(d.save) : null; };
  return 1;
};

(async () => {
  const A = moTrang(''), CU = moTrang('luucu=1');
  const s3 = fx('03-giua-vung-2-luyen-cao.json'), s5 = fx('05-truoc-talesworn.json'), s1 = fx('01-nguoi-moi.json');
  try {
    await A.goi(CAI); await CU.goi(CAI);

    console.log('1. Đăng nhập: máy có tiến trình, mây trống');
    const r1 = await A.goiCho(async (a) => {
      napMay(a.s3); const db = taoDb(); globalThis.db1 = db; ganMay('khach-1', db);
      await G.cloud.pull();
      const sauDangNhap = db.log.length;
      G.save.gold += 1; G.persist(); await G.cloud.push(true);
      const m = mayS(db, 'khach-1');
      return { qd: G.cloud.qdCuoi, sauDangNhap, ghi: db.log.slice(), gold: m && m.gold, rev: m && m.revision, sid: m && m.saveId === G.save.saveId, dong: !!G.luuAT.docDongBo('khach-1'), dirty: G.cloud.dirty };
    }, { s3: JSON.stringify(s3) });
    dat(r1.qd === 'cho-ghi-dau' && r1.sauDangNhap === 0, 'vừa đăng nhập: KHÔNG ghi mây (chờ lần lưu thật đầu tiên)');
    dat(r1.ghi.join() === 'tx' && r1.gold === s3.gold + 1 && r1.rev >= 1 && r1.sid && r1.dong && !r1.dirty, 'lần lưu đầu: ghi bằng transaction, có revision ' + r1.rev + ' + saveId, nhớ dấu đồng bộ');

    console.log('2. Máy trắng, mây có tiến trình');
    const r2 = await A.goiCho(async (a) => {
      napMay(a.s1); const db = taoDb(); const m = JSON.parse(a.s5); m.schemaVersion = 2; m.saveId = 'smay'; m.revision = 9;
      db.docs['linhkhi_users/u2'] = docMay(m, 1000); ganMay('u2', db);
      const trang = JSON.stringify(G.save);
      await G.cloud.pull();
      return { qd: G.cloud.qdCuoi, gold: G.save.gold, ghi: db.log.length, giu: window.localStorage.getItem('linhkhi_save_v1_xd_thietbi') === trang, maySid: G.save.saveId };
    }, { s1: JSON.stringify(s1), s5: JSON.stringify(s5) });
    dat(r2.qd === 'tai' && r2.gold === s5.gold && r2.ghi === 0 && r2.giu && r2.maySid === 'smay', 'tải bản mây (vàng ' + r2.gold + '), không ghi mây, bản máy cũ được cất ở _xd_thietbi');

    console.log('3. Hai bản giống nhau');
    const r3 = await A.goiCho(async (a) => {
      napMay(a.s3); const db = taoDb(); const m = JSON.parse(JSON.stringify(G.save)); m.savedAt = 5; m.owner = 'u3';
      db.docs['linhkhi_users/u3'] = docMay(m, 5); ganMay('u3', db);
      await G.cloud.pull();
      return { qd: G.cloud.qdCuoi, ghi: db.log.length, man: dsMan().length };
    }, { s3: JSON.stringify(s3) });
    dat(r3.qd === 'giong' && r3.ghi === 0 && r3.man === 0, 'cùng nội dung (khác giờ lưu / chủ): không làm gì, không hỏi');

    console.log('4. Kế thừa theo lịch sử đồng bộ');
    const r4 = await A.goiCho(async (a) => {
      napMay(a.s3); const db = taoDb(); ganMay('u4', db);
      await G.cloud.pull(); G.save.gold += 1; G.persist(); await G.cloud.push(true); // đã đồng bộ
      // (a) máy chơi thêm lúc ngoại tuyến rồi mở lại game
      G.save.gold += 100; G.persist(); G.cloud.daDongBo = false; G.cloud.dirty = false;
      await G.cloud.pull(); const qdA = G.cloud.qdCuoi; await G.cloud.push(true);
      const vangA = mayS(db, 'u4').gold;
      // (b) máy khác chơi tiếp trên mây, máy này không đổi
      const kh = mayS(db, 'u4'); kh.gold += 5000; kh.revision += 1; db.docs['linhkhi_users/u4'] = docMay(kh, 99);
      G.cloud.daDongBo = false; await G.cloud.pull();
      return { qdA, vangA, mong: a.g + 101, qdB: G.cloud.qdCuoi, goldB: G.save.gold, mongB: a.g + 101 + 5000, man: dsMan().length };
    }, { s3: JSON.stringify(s3), g: s3.gold });
    dat(r4.qdA === 'day' && r4.vangA === r4.mong, 'mây không đổi từ lần đồng bộ trước, máy đi tiếp → đẩy bản máy');
    dat(r4.qdB === 'tai' && r4.goldB === r4.mongB && r4.man === 0, 'máy không đổi, mây đi tiếp (máy khác) → tải bản mây, không hỏi');

    console.log('5. Hai bản tiến triển độc lập → màn chọn');
    for (const lua of ['may', 'thietBi', 'huy']) {
      const r = await A.goiCho(async (a) => {
        napMay(a.s3); const db = taoDb(); ganMay('u5', db);
        await G.cloud.pull(); G.save.gold += 1; G.persist(); await G.cloud.push(true);
        G.save.gold += 7; G.persist(); // máy chơi thêm (chưa đẩy)
        const kh = mayS(db, 'u5'); kh.gold += 3000; kh.stars['1-3'] = 2; kh.revision += 1; db.docs['linhkhi_users/u5'] = docMay(kh, 77); // máy khác cũng chơi thêm
        G.cloud.daDongBo = false; await G.cloud.pull();
        const ls = window.localStorage, man = dsMan(), m = man[0] || {};
        const out = { qd: G.cloud.qdCuoi, loai: m.loai, may: m.may && m.may.vang, tb: m.thietBi && m.thietBi.vang, sl: !!ls.getItem('linhkhi_save_v1_xd_thietbi') && !!ls.getItem('linhkhi_save_v1_xd_may'), ghiTruoc: db.log.length };
        G.cloud.dirty = true; await G.cloud.push(true); out.chanKhiCho = db.log.length === out.ghiTruoc; // đang chờ chọn: không đẩy
        G.luuAT.man.length = 0; m.xong(a.lua); await xa(); await G.cloud._pulling; await xa();
        const ms = mayS(db, 'u5');
        out.sau = { gold: G.save.gold, mayGold: ms.gold, sao: (ms._saoLuuMay || []).map((x) => JSON.parse(x.s).gold), tamDung: G.cloud.tamDung, ghi: db.log.length - out.ghiTruoc };
        return out;
      }, { s3: JSON.stringify(s3), lua });
      if (lua === 'may') {
        dat(r.qd === 'hoi' && r.loai === 'xd' && r.may === s3.gold + 1 + 3000 && r.tb === s3.gold + 8, 'hỏi: màn chọn hiện vàng hai bản (mây ' + r.may + ' / máy ' + r.tb + ')');
        dat(r.sl, 'sao lưu cả hai bản (_xd_thietbi, _xd_may) trước khi chọn');
        dat(r.chanKhiCho, 'đang chờ chọn: không đẩy mây');
        dat(r.sau.gold === r.may && r.sau.ghi === 0, '"Dùng bản mây": máy nhận bản mây, không ghi mây');
      } else if (lua === 'thietBi') {
        dat(r.sau.mayGold === r.tb && r.sau.sao.includes(r.may), '"Giữ máy này": mây nhận bản máy, bản mây cũ thành bản sao mây');
      } else dat(r.sau.ghi === 0 && r.sau.tamDung && r.sau.gold === r.tb, '"Huỷ": không đổi bản nào, tạm dừng lưu mây trong lần chơi này');
    }

    console.log('6. So-sánh-rồi-ghi: máy khác ghi chen giữa');
    const r6 = await A.goiCho(async (a) => {
      napMay(a.s3); const db = taoDb(); ganMay('u6', db);
      await G.cloud.pull(); G.save.gold += 1; G.persist(); await G.cloud.push(true);
      const kh = mayS(db, 'u6'); kh.gold = 1; kh.revision += 3; const docKhac = docMay(kh, 555); db.docs['linhkhi_users/u6'] = docKhac; // máy khác ghi
      G.save.gold += 2; G.persist(); await G.cloud.push(true);
      return { giu: mayS(db, 'u6').gold === 1, qd: G.cloud.qdCuoi, man: dsMan().map((m) => m.loai) };
    }, { s3: JSON.stringify(s3) });
    dat(r6.giu && r6.qd === 'hoi' && r6.man.includes('xd'), 'mây đổi sau lần đọc → transaction từ chối, không ghi đè, đọc lại và hỏi');

    console.log('7. Ngoại tuyến rồi có mạng lại');
    const r7 = await A.goiCho(async (a) => {
      napMay(a.s3); const db = taoDb(); ganMay('u7', db);
      await G.cloud.pull(); G.save.gold += 1; G.persist(); await G.cloud.push(true);
      db.offline = true; G.save.gold += 40; G.persist(); await G.cloud.push(true);
      const koMang = { dirty: G.cloud.dirty, may: mayS(db, 'u7').gold, local: JSON.parse(window.localStorage.getItem('linhkhi_save_v1')).gold };
      db.offline = false; clearTimeout(G.cloud._timer); await G.cloud.push(true); // có mạng lại: transaction đọc mây trước rồi mới ghi
      const ok1 = mayS(db, 'u7').gold;
      // lần hai: ngoại tuyến, trong lúc đó máy khác ghi mây
      db.offline = true; G.save.gold += 1; G.persist(); await G.cloud.push(true);
      const kh = mayS(db, 'u7'); kh.gold += 900; kh.revision += 1; db.docs['linhkhi_users/u7'] = docMay(kh, 4242);
      db.offline = false; await G.cloud.push(true);
      return { koMang, ok1, mong1: a.g + 41, giuKhac: mayS(db, 'u7').gold === kh.gold, qd: G.cloud.qdCuoi };
    }, { s3: JSON.stringify(s3), g: s3.gold });
    dat(r7.koMang.dirty && r7.koMang.may === s3.gold + 1 && r7.koMang.local === s3.gold + 41, 'mất mạng: vẫn lưu trên máy, xếp hàng chờ (dirty), mây giữ bản cũ');
    dat(r7.ok1 === r7.mong1, 'có mạng lại, mây chưa đổi → đồng bộ bản máy');
    dat(r7.giuKhac && r7.qd === 'hoi', 'có mạng lại nhưng máy khác đã ghi → không ghi đè, hỏi người chơi');

    console.log('8. Mây hỏng / mây do mã mới hơn tạo');
    const r8 = await A.goiCho(async (a) => {
      napMay(a.s3); const db = taoDb(); db.docs['linhkhi_users/u8'] = { save: '{"v":1,"gold":', updatedAt: 3, prog: 0, v: 1, ver: 'x' }; ganMay('u8', db);
      await G.cloud.pull(); const qd = G.cloud.qdCuoi; const cat = window.localStorage.getItem('linhkhi_save_v1_may_hong') === '{"v":1,"gold":';
      await G.cloud.push(true); const m = mayS(db, 'u8');
      const out = { qd, cat, gold: m.gold, saoHong: (m._saoLuuMay || []).some((x) => x.hong === 1 && x.s === '{"v":1,"gold":') };
      // mây phiên bản mới hơn
      napMay(a.s3); const db2 = taoDb(); const mm = JSON.parse(a.s3); mm.schemaVersion = 99; db2.docs['linhkhi_users/u9'] = docMay(mm, 8); ganMay('u9', db2);
      const truoc = JSON.stringify(db2.docs);
      await G.cloud.pull(); G.save.gold += 1; G.persist(); await G.cloud.push(true);
      out.moi = { qd: G.cloud.qdCuoi, chan: G.cloud.chanGhi, khongDoi: JSON.stringify(db2.docs) === truoc, man: dsMan().map((m) => m.tieuDe) };
      return out;
    }, { s3: JSON.stringify(s3) });
    dat(r8.qd === 'may-hong' && r8.cat && r8.gold === s3.gold && r8.saoHong, 'mây hỏng: dùng bản máy, bản mây hỏng được cất (trên máy + trong bản sao mây)');
    dat(r8.moi.qd === 'chan-moi' && r8.moi.chan === 'moi' && r8.moi.khongDoi && r8.moi.man.includes('Cần cập nhật game'), 'mây do mã mới hơn tạo: không ghi đè, báo cập nhật');

    console.log('9. Bản sao mây');
    const r9 = await A.goiCho(async (a) => {
      napMay(a.s3); const db = taoDb(); ganMay('u10', db);
      await G.cloud.pull();
      for (let i = 0; i < 6; i++) { G.save.gold += 1; G.persist(); G.cloud._epSaoLuu = true; await G.cloud.push(true); }
      const d = db.docs['linhkhi_users/u10'], m = JSON.parse(d.save);
      // bản lưu rất lớn: vẫn dưới 400000 ký tự (bớt bản sao)
      for (let i = 0; i < 3; i++) { G.save.rac = String(i).repeat(150000); G.persist(); G.cloud._epSaoLuu = true; await G.cloud.push(true); }
      const d2 = db.docs['linhkhi_users/u10'];
      delete G.save.rac; G.persist();
      return { n: m._saoLuuMay.length, rev: m._saoLuuMay.map((x) => x.rev), len2: d2.save.length, n2: (JSON.parse(d2.save)._saoLuuMay || []).length, keys: Object.keys(d).sort().join(',') };
    }, { s3: JSON.stringify(s3) });
    dat(r9.n === 3 && r9.rev[0] > r9.rev[1] && r9.rev[1] > r9.rev[2], 'giữ 3 bản sao mây gần nhất (revision ' + r9.rev.join(' > ') + ')');
    dat(r9.len2 < 400000 && r9.n2 < 3, 'bản lưu lớn: tự bớt bản sao để tài liệu < 400000 ký tự (' + r9.len2 + ', còn ' + r9.n2 + ' bản sao)');
    dat(r9.keys === 'prog,save,updatedAt,v,ver', 'tài liệu mây chỉ có 5 trường luật Firestore hiện hành cho phép (không cần sửa rules)');

    console.log('10. Máy hỏng → khôi phục từ mây');
    const r10 = await A.goiCho(async (a) => {
      const db = taoDb(); const m = JSON.parse(a.s5); m.schemaVersion = 2; m.saveId = 'sk'; m.revision = 3;
      const sao = JSON.parse(a.s3); m._saoLuuMay = [{ rev: 2, at: 10, prog: 1, s: JSON.stringify(sao) }];
      db.docs['linhkhi_users/u11'] = docMay(m, 20);
      napMay('{hỏng'); ganMay('u11', db);
      const khoa = G.luuAT.khoa;
      await G.cloud.pull();
      const ds = G.luuAT.dsPhucHoi(), ghi = db.log.length;
      G.luuAT.chonPhucHoi(ds[0]); await xa(); await G.cloud._pulling; await xa();
      return { khoa, nhan: ds.map((u) => u.nhan.join(' ')), ghi, gold: G.save.gold, khoaSau: G.luuAT.khoa, qd: G.cloud.qdCuoi, local: JSON.parse(window.localStorage.getItem('linhkhi_save_v1')).gold, hong: window.localStorage.getItem('linhkhi_save_v1_hong') };
    }, { s3: JSON.stringify(s3), s5: JSON.stringify(s5) });
    dat(r10.khoa === 'phucHoi' && r10.ghi === 0 && r10.nhan[0] === 'Mây: bản chính' && r10.nhan[1] === 'Mây: bản sao {0} 1', 'máy hỏng, không có bản sao trên máy: màn Khôi phục có bản mây + bản sao mây, chưa ghi gì');
    dat(r10.gold === s5.gold && r10.local === s5.gold && r10.khoaSau === '' && r10.qd === 'giong' && r10.hong === '{hỏng', 'chọn bản mây → máy nhận bản mây, bản hỏng vẫn cất ở _hong');

    console.log('11. Đổi sang tài khoản Google đã có tiến trình khác');
    const r11 = await A.goiCho(async (a) => {
      napMay(a.s3); const db = taoDb(); ganMay('khach-12', db);
      await G.cloud.pull(); G.save.gold += 1; G.persist(); await G.cloud.push(true);
      db.docs['linhkhi_users/google-12'] = docMay(JSON.parse(a.s5), 1);
      ganMay('google-12', db); await G.cloud.pull();
      return { qd: G.cloud.qdCuoi, gold: G.save.gold, may: mayS(db, 'google-12').gold, man: dsMan().map((m) => m.loai) };
    }, { s3: JSON.stringify(s3), s5: JSON.stringify(s5) });
    dat(r11.qd === 'hoi' && r11.gold === s3.gold + 1 && r11.may === s5.gold && r11.man.includes('xd'), 'khách có tiến trình đổi sang Google đã có tiến trình: không tự lấy bản nào, hỏi');

    console.log('12. ?luucu=1: đường mây cũ');
    const r12 = await CU.goiCho(async (a) => {
      napMay(a.s3); const db = taoDb(); ganMay('u13', db);
      await G.cloud.pull();
      return { log: db.log.slice(), bat: G.luuAT.bat, co: !!db.docs['linhkhi_users/u13'] };
    }, { s3: JSON.stringify(s3) });
    dat(r12.bat === false && r12.log.join() === 'set' && r12.co, '?luucu=1: pull cũ (ghi thẳng bằng set ngay khi đăng nhập) y như trước');

    const loiNgam = await A.goi('globalThis.__loiNgam || []');
    dat(!loiNgam.some((l) => /cloud|luu/.test(l)), 'không có lỗi ngầm');
    console.log('\nĐẠT ' + dem() + ' mục.');
  } catch (e) {
    console.error(e.message || e);
    console.error(A.loi().slice(-3000));
    process.exitCode = 1;
  } finally { A.dong(); CU.dong(); }
})();
