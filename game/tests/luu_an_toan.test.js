#!/usr/bin/env node
// F2 BẢO VỆ BẢN LƯU — kiểm không cần trình duyệt (js/luu_an_toan.js). Chạy: node game/tests/luu_an_toan.test.js
//  1. Nâng cấp tuần tự: thuần (không sửa bản vào), tất định, nạp lại không đổi, bản phiên bản mới hơn → không nâng cấp.
//  2. Fixture bản lưu cũ (tests/fixtures-luu/*.json): nạp không lỗi, không mất vàng / sao / cấp / Luyện / trang phục / Page Scrap / trường lạ;
//     lưu → nạp lại không đổi; bản đã nâng cấp vẫn đọc được bằng mã cũ (?luucu=1).
//  3. JSON hỏng có bản sao → màn Khôi phục, không ghi đè; không có bản sao → bản trắng tạm, khoá ghi, chỉ "Chơi mới" khi chọn.
//  4. Đóng thẻ giữa lúc ghi (dừng sau từng bước) → nạp lại ra bản cũ hoặc bản mới, không bao giờ mất.
//  5. Bộ nhớ đầy → không xoá khoá chính, báo; 6. Hai thẻ → thẻ cũ thôi ghi; 7. Bản phiên bản mới hơn → không ghi đè;
//  8. ≥ 2 bản sao, không còn khoá tạm; "Xoá hết" vẫn còn bản cũ ở _bk1; 9. ?luucu=1 → đường lưu cũ y như trước.
//  10. Màn hỏi vẽ bằng khung / nút ảnh (bấm đúng toạ độ nút thì chọn được).
'use strict';
const fs = require('fs'), path = require('path');
const { moTrang, dat, dem } = require('./luu_lib');
const FX = path.join(__dirname, 'fixtures-luu');

// chạy trong trang: nạp một bản lưu (chuỗi) vào kho trống rồi G.loadSave
const NAP = (a) => {
  const ls = window.localStorage; ls.clear(); globalThis.__xoaMan();
  if (a.raw != null) ls.setItem('linhkhi_save_v1', a.raw);
  for (const k in a.them || {}) ls.setItem(k, a.them[k]);
  G.loadSave();
  return 1;
};
// tóm tắt bản đang dùng
const TT = () => {
  const s = G.save, LA = G.luuAT;
  let cap = 1, luyen = 0;
  for (const k in s.heroes) cap = Math.max(cap, s.heroes[k].lvl | 0);
  for (const w of s.weapons) luyen = Math.max(luyen, w.luyen | 0);
  return { gold: s.gold, stars: s.stars, cap, luyen, boMo: Object.keys((s.zed && s.zed.boMo) || {}), boCap: s.boCap || {}, trangSach: s.trangSach | 0, linhKhi: s.linhKhi | 0,
    sv: s.schemaVersion, saveId: s.saveId, rev: s.revision, v: s.v, khoa: LA ? LA.khoa : null, hash: LA && LA.hashND ? LA.hashND(s) : null, keys: Object.keys(s),
    man: LA && LA.man ? globalThis.__dsMan().map((m) => m.loai + ':' + (m.tieuDe || '')) : [], kho: Object.keys(Object.fromEntries([...Array(window.localStorage.length).keys()].map((i) => [window.localStorage.key(i), 1]))) };
};

(async () => {
  const A = moTrang(''), CU = moTrang('luucu=1');
  try {
    const CAI = () => { globalThis.__dsMan = () => (G.luuAT.mo ? [G.luuAT.mo] : []).concat(G.luuAT.man || []); globalThis.__xoaMan = () => { const LA = G.luuAT; if (LA.man) LA.man.length = 0; if (LA.mo) LA.dong(); LA.loiDay = false; }; return 1; };
    await A.goi(CAI); await CU.goi(CAI);
    console.log('1. Nâng cấp tuần tự (hàm thuần)');
    const n1 = await A.goi(() => {
      const LA = G.luuAT;
      const goc = { v: 1, gold: 5, stars: { '0-0': 1 }, savedAt: 123, la: { x: [1, 2] } };
      const chep = JSON.stringify(goc);
      const m = LA.nangCap(goc), m2 = LA.nangCap(m.s);
      const khacGio = LA.nangCap(Object.assign({}, goc, { savedAt: 999 }));
      const moi = LA.nangCap({ v: 1, schemaVersion: 99, gold: 1 });
      return { khongSua: JSON.stringify(goc) === chep, sv: m.s.schemaVersion, tu: m.tu, den: m.den, rev: m.s.revision, up: m.s.updatedAt, la: JSON.stringify(m.s.la),
        batDinh: JSON.stringify(m.s) === JSON.stringify(m2.s), cungId: m.s.saveId === khacGio.s.saveId, moi: !!moi.moi, moiGiu: moi.s.schemaVersion, SCHEMA: LA.SCHEMA, v: m.s.v };
    });
    dat(n1.khongSua, 'nangCap không sửa bản đưa vào');
    dat(n1.sv === 2 && n1.tu === 1 && n1.den === 2 && n1.SCHEMA === 2 && n1.v === 1, 'bản cũ (không có schemaVersion) → phiên bản 2, v vẫn = 1 (mã cũ đọc được)');
    dat(n1.rev === 0 && n1.up === 123 && n1.la === '{"x":[1,2]}', 'thêm revision 0, updatedAt = savedAt, giữ trường lạ');
    dat(n1.batDinh, 'nâng cấp lần hai không đổi gì (tất định)');
    dat(n1.cungId, 'saveId theo nội dung: cùng bản lưu khác giờ lưu → cùng saveId');
    dat(n1.moi && n1.moiGiu === 99, 'bản phiên bản mới hơn mã → đánh dấu moi, không hạ cấp');

    console.log('2. Fixture bản lưu cũ');
    const tep = fs.readdirSync(FX).filter((f) => f.endsWith('.json')).sort();
    dat(tep.length >= 5, 'có ' + tep.length + ' fixture (≥ 5)');
    for (const f of tep) {
      const fx = JSON.parse(fs.readFileSync(path.join(FX, f), 'utf8')), mg = fx.mong;
      await A.goi(NAP, { raw: JSON.stringify(fx.save) });
      const r = await A.goi(TT);
      const sao = Object.keys(mg.stars).every((k) => (r.stars[k] | 0) >= mg.stars[k]) && Object.keys(r.stars).length >= Object.keys(mg.stars).length;
      let ok = r.khoa === '' && r.gold >= mg.gold && sao && r.cap >= mg.capMin && r.sv === 2 && typeof r.saveId === 'string' && Number.isInteger(r.rev) && r.v === 1;
      if (mg.luyenMax) ok = ok && r.luyen >= mg.luyenMax;
      if (mg.boMo) ok = ok && mg.boMo.every((k) => r.boMo.includes(k));
      if (mg.boCap) ok = ok && Object.keys(mg.boCap).every((k) => (r.boCap[k] | 0) >= mg.boCap[k]);
      if (mg.trangSach) ok = ok && r.trangSach >= mg.trangSach;
      if (mg.linhKhiMin) ok = ok && r.linhKhi >= mg.linhKhiMin;
      if (mg.giuTruong) ok = ok && mg.giuTruong.every((k) => r.keys.includes(k));
      if (mg.saveId) ok = ok && r.saveId === mg.saveId;
      if (mg.revMin) ok = ok && r.rev >= mg.revMin;
      dat(ok, f + ': nạp không lỗi, giữ vàng ' + r.gold + ' (≥ ' + mg.gold + '), ' + Object.keys(r.stars).length + ' ải có sao, cấp ' + r.cap + (mg.luyenMax ? ', Luyện ' + r.luyen : '') + (mg.boMo ? ', trang phục ' + r.boMo.join('+') : '') + (mg.trangSach ? ', Page Scrap ' + r.trangSach : '') + (mg.giuTruong ? ', trường lạ còn' : ''));
      // lưu rồi nạp lại: không đổi nội dung
      const r2 = await A.goi(() => { const h = G.luuAT.hashND(G.save); G.persist(); const ok = G.luuAT.kq.ok; const raw = window.localStorage.getItem('linhkhi_save_v1'); G.loadSave(); return { ok, h, h2: G.luuAT.hashND(G.save), raw, khoa: G.luuAT.khoa, tam: window.localStorage.getItem('linhkhi_save_v1_tam') }; });
      dat(r2.ok && r2.h === r2.h2 && r2.khoa === '' && r2.tam === null, f + ': lưu → nạp lại không đổi, không còn khoá tạm');
      // mã cũ (?luucu=1) đọc bản đã nâng cấp: không thành bản trắng
      await CU.goi(NAP, { raw: r2.raw });
      const rc = await CU.goi(TT);
      dat(rc.gold === r.gold && Object.keys(rc.stars).length === Object.keys(r.stars).length && rc.cap === r.cap && rc.saveId === r.saveId, f + ': mã cũ (?luucu=1) đọc được bản đã nâng cấp, giữ nguyên tiến trình và saveId');
    }

    console.log('3. JSON hỏng → màn Khôi phục, không reset ngầm');
    const fx3 = JSON.parse(fs.readFileSync(path.join(FX, '03-giua-vung-2-luyen-cao.json'), 'utf8')).save;
    const h1 = await A.goi((raw) => {
      const ls = window.localStorage; ls.clear(); globalThis.__xoaMan(); ls.setItem('linhkhi_save_v1', raw); G.loadSave();
      G.save.gold += 7; G.persist(); G.save.gold += 3; G.persist(); // có _bk1
      const vang = G.save.gold, bk1 = ls.getItem('linhkhi_save_v1_bk1');
      const hong = '{"v":1,"gold":12,"weap'; ls.setItem('linhkhi_save_v1', hong);
      G.loadSave();
      const LA = G.luuAT, r = { khoa: LA.khoa, vangDung: G.save.gold, vangBk1: JSON.parse(bk1).gold, vang, conHong: ls.getItem('linhkhi_save_v1') === hong, catHong: ls.getItem('linhkhi_save_v1_hong') === hong, man: globalThis.__dsMan().map((m) => m.loai) };
      G.persist(); r.ghiDuoc = G.luuAT.kq.ok; r.vanHong = ls.getItem('linhkhi_save_v1') === hong;
      const ds = LA.dsPhucHoi(); r.soBan = ds.length; r.nhan = ds.map((u) => u.nhan[0]);
      LA.chonPhucHoi(ds[0]);
      r.sau = { khoa: LA.khoa, gold: JSON.parse(ls.getItem('linhkhi_save_v1')).gold };
      return r;
    }, JSON.stringify(fx3));
    dat(h1.khoa === 'phucHoi' && h1.man.includes('ph'), 'khoá chính hỏng: khoá ghi, mở màn Khôi phục');
    dat(h1.vangDung === h1.vangBk1 && h1.vangDung > 0, 'tạm dùng bản sao gần nhất (vàng ' + h1.vangDung + ') thay vì bản trắng');
    dat(h1.catHong && h1.conHong && !h1.ghiDuoc && h1.vanHong, 'bản hỏng được cất ở _hong; chưa chọn thì G.persist không ghi đè khoá chính');
    dat(h1.soBan >= 2 && h1.nhan[0] === 'Máy: bản sao gần nhất', 'màn Khôi phục liệt kê ' + h1.soBan + ' bản sao (gần nhất trước)');
    dat(h1.sau.khoa === '' && h1.sau.gold === h1.vangDung, 'chọn bản sao → ghi lại khoá chính, mở khoá');

    const h2 = await A.goi(() => {
      const ls = window.localStorage; ls.clear(); globalThis.__xoaMan(); const hong = 'không phải JSON'; ls.setItem('linhkhi_save_v1', hong);
      G.loadSave();
      const LA = G.luuAT, r = { khoa: LA.khoa, gold: G.save.gold, ds: LA.dsPhucHoi().length, man: globalThis.__dsMan().map((m) => m.loai) };
      G.persist(); r.ghi = G.luuAT.kq.ok; r.con = ls.getItem('linhkhi_save_v1') === hong;
      LA.choiMoi();
      r.sau = { khoa: LA.khoa, moi: JSON.parse(ls.getItem('linhkhi_save_v1')).gold === 0, hong: ls.getItem('linhkhi_save_v1_hong') === hong };
      return r;
    });
    dat(h2.khoa === 'phucHoi' && h2.ds === 0 && !h2.ghi && h2.con, 'không có bản sao: bản trắng chỉ để chạy màn chào, KHÔNG ghi đè bản hỏng');
    dat(h2.sau.khoa === '' && h2.sau.moi && h2.sau.hong, '"Chơi mới" chỉ khi người chơi chọn; bản hỏng vẫn nằm ở _hong');

    console.log('4. Đóng thẻ giữa lúc ghi');
    for (const buoc of ['tam', 'bk', 'chinh']) {
      const r = await A.goi((a) => {
        const ls = window.localStorage; ls.clear(); globalThis.__xoaMan(); ls.setItem('linhkhi_save_v1', a.raw); G.loadSave(); G.persist();
        const cu = G.save.gold; G.save.gold = cu + 500;
        G.luuAT._buoc = (b) => { if (b === a.buoc) { const e = new Error('đóng thẻ'); e.gia = true; throw e; } };
        let dung = false; try { G.persist(); } catch (e) { dung = !!e.gia; }
        G.luuAT._buoc = null;
        G.loadSave(); // mở lại
        return { dung, cu, moi: cu + 500, gold: G.save.gold, khoa: G.luuAT.khoa, tam: ls.getItem('linhkhi_save_v1_tam') };
      }, { raw: JSON.stringify(fx3), buoc });
      dat(r.dung && r.gold === r.moi && r.khoa === '' && r.tam === null, 'dừng sau bước "' + buoc + '": mở lại được bản mới nhất (vàng ' + r.gold + '), dọn khoá tạm');
    }

    console.log('5. Bộ nhớ đầy');
    const q = await A.goi((raw) => {
      const goc = window.localStorage; goc.clear(); globalThis.__xoaMan(); goc.setItem('linhkhi_save_v1', raw); G.loadSave(); G.persist();
      const truoc = goc.getItem('linhkhi_save_v1');
      const tong = () => { let n = 0; for (let i = 0; i < goc.length; i++) { const k = goc.key(i); n += k.length + goc.getItem(k).length; } return n; };
      const tran = { n: tong() + 50 };
      const day = { getItem: (k) => goc.getItem(k), removeItem: (k) => goc.removeItem(k), key: (i) => goc.key(i), get length() { return goc.length; }, clear: () => goc.clear(),
        setItem(k, v) { const cu = goc.getItem(k); if (tong() - (cu ? k.length + cu.length : 0) + k.length + String(v).length > tran.n) { const e = new Error('QuotaExceededError'); e.name = 'QuotaExceededError'; throw e; } goc.setItem(k, v); } };
      window.localStorage = day;
      G.save.gold += 1; const r1 = G.luuAT.ghi(G.save);
      const sau1 = goc.getItem('linhkhi_save_v1');
      tran.n = 10; G.save.gold += 1; const r2 = G.luuAT.ghi(G.save);
      const sau2 = goc.getItem('linhkhi_save_v1');
      window.localStorage = goc;
      return { r1, r2, con1: !!sau1 && JSON.parse(sau1).v === 1, con2: sau2 === sau1, coTruoc: !!truoc, loiDay: G.luuAT.loiDay, man: globalThis.__dsMan().map((m) => m.tieuDe) };
    }, JSON.stringify(fx3));
    dat(q.con1 && q.coTruoc, 'đầy một phần: bỏ khoá tạm / bản sao cũ, khoá chính vẫn là bản hợp lệ (' + (q.r1.ok ? 'ghi thẳng được' : 'giữ bản cũ') + ')');
    dat(!q.r2.ok && q.r2.ly === 'day' && q.con2, 'đầy hẳn: không ghi được nhưng KHÔNG xoá khoá chính (bản cũ còn nguyên)');
    dat(q.loiDay && q.man.includes('Bộ nhớ máy đầy'), 'báo người chơi "Bộ nhớ máy đầy" (một lần)');

    console.log('6. Hai thẻ cùng mở');
    const tb = await A.goi((raw) => {
      const ls = window.localStorage; ls.clear(); globalThis.__xoaMan(); ls.setItem('linhkhi_save_v1', raw); G.loadSave(); G.persist();
      const khac = JSON.parse(ls.getItem('linhkhi_save_v1')); khac.gold += 999; const sKhac = JSON.stringify(khac);
      ls.setItem('linhkhi_save_v1', sKhac); // thẻ kia vừa lưu
      G.save.gold += 1; G.persist(); const ok = G.luuAT.kq.ok;
      return { ok, khoa: G.luuAT.khoa, giu: ls.getItem('linhkhi_save_v1') === sKhac, man: globalThis.__dsMan().map((m) => m.tieuDe) };
    }, JSON.stringify(fx3));
    dat(!tb.ok && tb.khoa === 'the' && tb.giu && tb.man.includes('Game đang mở ở thẻ khác'), 'thẻ cũ thấy thẻ khác vừa lưu → thôi ghi, giữ tiến trình của thẻ kia, báo tải lại');

    console.log('7. Bản lưu của phiên bản mới hơn');
    const mv = await A.goi((raw) => {
      const ls = window.localStorage; ls.clear(); globalThis.__xoaMan(); const s = JSON.parse(raw); s.schemaVersion = 99; s.tuongLai = 1; const r = JSON.stringify(s);
      ls.setItem('linhkhi_save_v1', r); G.loadSave();
      const out = { khoa: G.luuAT.khoa, gold: G.save.gold, man: globalThis.__dsMan().map((m) => m.tieuDe) };
      G.save.gold += 5; G.persist(); out.ghi = G.luuAT.kq.ok; out.giu = ls.getItem('linhkhi_save_v1') === r;
      return out;
    }, JSON.stringify(fx3));
    dat(mv.khoa === 'moi' && mv.gold === fx3.gold && !mv.ghi && mv.giu && mv.man.includes('Cần cập nhật game'), 'schemaVersion mới hơn mã: vẫn chơi được, KHÔNG ghi đè, báo "Cần cập nhật game"');

    console.log('8. Bản sao');
    const bs = await A.goi((raw) => {
      const ls = window.localStorage; ls.clear(); globalThis.__xoaMan(); ls.setItem('linhkhi_save_v1', raw); G.loadSave();
      for (let i = 0; i < 4; i++) { G.save.gold += 1; G.persist(); }
      const r = { bk1: !!ls.getItem('linhkhi_save_v1_bk1'), bk2: !!ls.getItem('linhkhi_save_v1_bk2'), phien: !!ls.getItem('linhkhi_save_v1_phien'), tam: ls.getItem('linhkhi_save_v1_tam'), rev: G.save.revision };
      const vang = G.save.gold; G.resetSave();
      const dd = JSON.parse(ls.getItem('linhkhi_save_v1_bk_doi')); r.xoa = { gold: G.save.gold, bk1Gold: dd.gold, vang, khacId: dd.saveId !== G.save.saveId, trongDs: G.luuAT.xepUngVien(ls).ds.some((u) => u.khoa === 'linhkhi_save_v1_bk_doi') };
      return r;
    }, JSON.stringify(fx3));
    dat(bs.bk1 && bs.bk2 && bs.phien && bs.tam === null, 'giữ ≥ 2 bản sao (_bk1, _bk2) + bản lúc mở phiên (_phien), không sót khoá tạm');
    dat(bs.rev >= 4, 'revision tăng mỗi lần lưu có thay đổi (đang ' + bs.rev + ')');
    dat(bs.xoa.gold === 0 && bs.xoa.bk1Gold === bs.xoa.vang && bs.xoa.khacId && bs.xoa.trongDs, '"Xoá hết": bản cũ được giữ ở _bk_doi (màn Khôi phục thấy), bản mới có saveId mới');

    console.log('9. Cờ quay lui ?luucu=1');
    const cu = await CU.goi((raw) => {
      const ls = window.localStorage; ls.clear(); globalThis.__xoaMan(); ls.setItem('linhkhi_save_v1', raw); G.loadSave(); G.save.gold += 1; G.persist();
      const keys = []; for (let i = 0; i < ls.length; i++) keys.push(ls.key(i));
      return { bat: G.luuAT.bat, keys, rev: G.save.revision === undefined, gold: JSON.parse(ls.getItem('linhkhi_save_v1')).gold };
    }, JSON.stringify(fx3));
    dat(cu.bat === false && cu.rev && !cu.keys.some((k) => /_tam|_bk1|_bk2|_phien/.test(k)) && cu.gold === fx3.gold + 1, '?luucu=1: không đóng dấu, không khoá tạm / bản sao, ghi thẳng như cũ');

    console.log('10. Màn hỏi vẽ bằng khung / nút ảnh');
    const ui = await A.goi(() => {
      const LA = G.luuAT, T = G.theme, goc = { panel: T.panel, inset: T.inset, btn: T.btn }, dung = {};
      for (const k in goc) T[k] = function () { dung[k] = (dung[k] || 0) + 1; return goc[k].apply(this, arguments); };
      LA.man.length = 0; LA.mo = null; G.scene = G.Title;
      let chon = null;
      LA.moMan({ loai: 'xd', may: LA.tomTat(G.save, 1), thietBi: LA.tomTat(G.save, 2), xong: (l) => { chon = l; } });
      const mo = G.scene === LA.proxy;
      const b = LA.BO_CUC.xd.nut[1]; G.click = { x: b[0] + b[2] / 2, y: b[1] + b[3] / 2 };
      G.scene.draw();
      const sau = G.scene === G.Title;
      for (const k in goc) T[k] = goc[k];
      return { mo, chon, sau, dung };
    });
    dat(ui.mo && ui.chon === 'thietBi' && ui.sau, 'màn chọn xung đột mở trên cảnh hiện tại, bấm "Giữ máy này" đúng toạ độ → chọn được, đóng màn');
    dat(ui.dung.panel >= 1 && ui.dung.inset >= 2 && ui.dung.btn >= 3, 'dùng G.theme.panel / inset / btn (khung, ô, nút ảnh gd-*) — không vẽ khung riêng');

    const loiNgam = await A.goi('globalThis.__loiNgam || []');
    dat(!loiNgam.some((l) => /luu_an_toan|luuAT/.test(l)), 'không có lỗi ngầm từ js/luu_an_toan.js');
    console.log('\nĐẠT ' + dem() + ' mục.');
  } catch (e) {
    console.error(e.message || e);
    console.error(A.loi().slice(-2000));
    process.exitCode = 1;
  } finally { A.dong(); CU.dong(); }
})();
