// Phép thử lõi đồng bộ của game/luu-may.js (bản 2: revision + transaction) – không cần mạng: node tools/firebase/kiem-thu-luu-may.js
const fs = require('fs'), path = require('path');
const {taoDongBo, KHOA_SAO, KHOA_CHO_PHEP} = require('../../game/luu-may.js');
let hong = 0, dat = 0;
const ok = (dk, t, x) => { if (dk) dat++; else hong++; console.log((dk ? 'ĐẠT ' : 'HỎNG ') + t + (!dk && x !== undefined ? ' – ' + JSON.stringify(x) : '')); };
function khoGia(){ const m = new Map(); return {getItem:k => m.has(k) ? m.get(k) : null, setItem:(k, v) => m.set(k, String(v)), removeItem:k => m.delete(k), key:i => [...m.keys()][i] ?? null, get length(){ return m.size; }, clear:() => m.clear(), _m:m}; }
// máy chủ giả làm đúng như firestore.rules + runTransaction: revision chỉ tăng đúng 1, sai revision → xung đột
function mayGia(){ const docs = {}; let soGhi = 0, matMang = false;
  return {docs, get soGhi(){ return soGhi; }, hong(v){ matMang = v; },
    async layVe(u, ds){ if (matMang) throw new Error('mất mạng'); const kq = {}; for (const k of ds){ const d = docs[u + '/' + k]; if (d) kq[k] = {du:d.du, rev:d.revision}; } return kq; },
    async giaoDich(u, ds, tb){ if (matMang) throw new Error('mất mạng'); const xong = [], xungDot = [];
      for (const x of ds){ const d = docs[u + '/' + x.k], rev = d ? d.revision : 0;
        if (rev !== x.revCu){ xungDot.push({k:x.k, du:d.du, rev}); continue; }
        if (!KHOA_CHO_PHEP.includes(x.k)) throw new Error('permission-denied');
        docs[u + '/' + x.k] = {du:x.du, revision:rev + 1, thietBi:tb, saoLuuTruoc:d ? d.du : ''}; soGhi++; xong.push({k:x.k, rev:rev + 1}); }
      return {xong, xungDot}; }};
}
const V = (kho, k = 'tvcc-vung1') => JSON.parse(kho.getItem(k) || '{}').manh;
const M = (may, k = 'tvcc-vung1', u = 'u1') => { const d = may.docs[u + '/' + k]; return d && d.du ? JSON.parse(d.du).manh : null; };
(async () => {
  // 0. danh sách khoá trong game trùng với firestore.rules
  const luat = fs.readFileSync(path.join(__dirname, '../../firestore.rules'), 'utf8');
  const dsLuat = JSON.parse((luat.match(/allowedKey\(k\)\s*\{\s*return k in (\[[^\]]*\])/) || [0, '[]'])[1].replace(/'/g, '"'));
  ok(JSON.stringify(dsLuat) === JSON.stringify(KHOA_CHO_PHEP), 'danh sách khoá game trùng firestore.rules', {dsLuat, KHOA_CHO_PHEP});
  const may = mayGia();
  // 1. máy A chơi, gửi lên
  const kA = khoGia(); const A = taoDongBo({kho:kA, cong:may}); A.datUid('u1'); await A.keo();
  kA.setItem('tvcc-vung1', '{"manh":5}'); kA.setItem('khac', 'x'); kA.setItem('tvcc-la', 'y');
  await A.gui();
  ok(M(may) === 5 && may.docs['u1/tvcc-vung1'].revision === 1, 'gửi bản lưu Vùng 1 lên mây (revision 1)');
  ok(!may.docs['u1/khac'] && !may.docs['u1/tvcc-la'] && !may.docs['u1/tvcc-may-meta'], 'chỉ gửi khoá trong danh sách cho phép');
  const g1 = may.soGhi; await A.gui(); ok(may.soGhi === g1, 'không đổi gì thì không ghi thêm (tiết kiệm hạn mức)');
  kA.setItem('tvcc-vung1', '{"manh":6}'); await A.gui();
  ok(may.docs['u1/tvcc-vung1'].revision === 2 && JSON.parse(may.docs['u1/tvcc-vung1'].saoLuuTruoc).manh === 5, 'ghi tiếp: revision 2, bản trước giữ ở saoLuuTruoc');
  // 2. xoá localStorage, tải lại → về từ mây
  kA.clear(); const A2 = taoDongBo({kho:kA, cong:may}); A2.datUid('u1'); await A2.keo();
  ok(V(kA) === 6, 'xoá localStorage rồi mở lại: tiến độ về từ mây');
  const g2 = may.soGhi; await A2.gui(); ok(may.soGhi === g2, '…và không gửi ngược lên (không tốn lượt ghi)');
  // 2b. xoá localStorage trong lúc trang đang mở
  kA.clear(); A2.quet(); await A2.keo(); ok(V(kA) === 6, 'xoá dữ liệu khi trang đang mở: lần kéo sau vẫn lấy lại được');
  // 3. mất mạng: không coi là đã kéo, không gửi
  const kB = khoGia(); kB.setItem('tvcc-vung1', '{"manh":0}'); const B = taoDongBo({kho:kB, cong:may}); B.datUid('u1');
  may.hong(true); let loi = null; try { await B.keo(); } catch (e){ loi = e; }
  ok(loi && !B.daKeo(), 'mất mạng: kéo báo lỗi, không coi là đã kéo');
  ok((await B.gui()) === false && M(may) === 6, 'chưa kéo được thì KHÔNG gửi');
  may.hong(false);
  // 4. máy B có bản lưu riêng từ trước (khác mây) → XUNG ĐỘT, không đè bên nào
  const kq4 = await B.keo();
  ok(kq4.xungDot.includes('tvcc-vung1') && V(kB) === 0 && M(may) === 6, 'máy B có bản riêng khác mây: báo xung đột, giữ cả 2 (máy 0, mây 6)', kq4);
  await B.gui(); ok(M(may) === 6, 'đang xung đột thì không gửi đè');
  B.chon('tvcc-vung1', 'may-chu');
  ok(V(kB) === 6 && JSON.parse(kB.getItem(KHOA_SAO))['tvcc-vung1'].du === '{"manh":0}', 'chọn "dùng bản mây": máy nhận 6, bản cũ giữ dự phòng trên máy');
  // 5. hai máy cùng sửa từ revision 2: A ghi trước, B ghi sau → B KHÔNG đè, thành xung đột
  kA.setItem('tvcc-vung1', '{"manh":10}'); kB.setItem('tvcc-vung1', '{"manh":20}');
  await A2.gui(); const r5 = await B.gui();
  ok(M(may) === 10 && r5 === false && B.xungDot().includes('tvcc-vung1'), 'hai máy ghi cùng lúc: máy ghi sau không đè, báo xung đột', {may:M(may), x:B.xungDot()});
  B.chon('tvcc-vung1', 'thiet-bi'); await B.gui();
  ok(M(may) === 20 && JSON.parse(may.docs['u1/tvcc-vung1'].saoLuuTruoc).manh === 10, 'chọn "giữ bản máy này": mây = 20, bản 10 giữ ở saoLuuTruoc');
  await A2.keo(); ok(V(kA) === 20, 'máy A (không có thay đổi mới) tự nhận bản mới hơn');
  // 6. game đã đọc rồi mà mây mới hơn → không đè game đang chạy, không gửi đè
  const kC = khoGia(); const C = taoDongBo({kho:kC, cong:may}); C.datUid('u1'); await C.keo(); C.khoaDoc();
  kA.setItem('tvcc-vung1', '{"manh":30}'); await A2.gui();
  const kq6 = await C.keo();
  ok(V(kC) === 20 && kq6.giu.includes('tvcc-vung1'), 'đang chơi: bản mây mới hơn không đè game đang chạy (báo tải lại)');
  await C.gui(); ok(M(may) === 30, '…và máy đó không gửi đè');
  kC.setItem('tvcc-vung1', '{"manh":40}'); await C.gui();
  ok(M(may) === 30 && C.xungDot().includes('tvcc-vung1'), 'máy đó chơi tiếp rồi ghi: thành xung đột chứ không mất tiến độ máy kia');
  // 7. xoá bản lưu (chơi lại) cũng đồng bộ (du = '')
  kA.setItem('tvcc-he-thong', '1'); await A2.gui(); kA.removeItem('tvcc-he-thong'); await A2.gui();
  ok(may.docs['u1/tvcc-he-thong'].du === '' && may.docs['u1/tvcc-he-thong'].revision === 2, 'xoá bản lưu được ghi lên mây');
  const kD = khoGia(); const D = taoDongBo({kho:kD, cong:may}); D.datUid('u1'); await D.keo();
  ok(kD.getItem('tvcc-he-thong') === null && V(kD) === 30, 'máy mới nhận đúng (khoá đã xoá không xuất hiện)');
  // 8. đổi tài khoản (Google có sẵn bản lưu khác): KHÔNG tự đẩy bản khách lên, báo xung đột
  may.docs['g1/tvcc-vung1'] = {du:'{"manh":500}', revision:4, saoLuuTruoc:''};
  kD.setItem('tvcc-vung1', '{"manh":31}'); D.datUid('g1'); await D.keo(); await D.gui();
  ok(M(may, 'tvcc-vung1', 'g1') === 500 && D.xungDot().includes('tvcc-vung1') && V(kD) === 31, 'sang tài khoản Google có bản lưu: không đè, cho chọn');
  // tài khoản Google trống → bản máy được gửi lên
  const kE = khoGia(); kE.setItem('tvcc-chung', '{"hoi":2}'); const E = taoDongBo({kho:kE, cong:may}); E.datUid('g2'); await E.keo(); await E.gui();
  ok(may.docs['g2/tvcc-chung'] && may.docs['g2/tvcc-chung'].revision === 1, 'tài khoản trống: bản máy được gửi lên');
  // 9. xuất / nhập bản lưu
  const s = A2.xuat(); const kF = khoGia(); const Fx = taoDongBo({kho:kF}); const rn = Fx.nhap(s);
  ok(rn.ok && V(kF) === 30 && !kF.getItem('khac'), 'xuất rồi nhập bản lưu sang máy khác (chỉ khoá game)');
  ok(!Fx.nhap('rác').ok && !Fx.nhap('{"khoa":{}}').ok, 'file không phải bản lưu thì từ chối');
  // 10. bản lưu quá lớn không gửi (luật giới hạn 16000), không sập
  const kG = khoGia(); const G = taoDongBo({kho:kG, cong:may, suKien:(l, x) => { if (l === 'loi') G._loi = x; }}); G.datUid('u3'); await G.keo();
  kG.setItem('tvcc-an', 'x'.repeat(17000)); await G.gui();
  ok(!may.docs['u3/tvcc-an'] && G._loi, 'bản lưu quá lớn: không gửi, báo lỗi');
  // 11. kho hỏng / không có localStorage không làm sập
  const kHong = {getItem(){ throw new Error('chặn'); }, setItem(){ throw new Error('chặn'); }, removeItem(){}, key(){ throw new Error('chặn'); }, length:0};
  let sap = false; try { const H = taoDongBo({kho:kHong, cong:may}); H.datUid('u2'); await H.keo(); await H.gui(); H.xuat(); } catch (e){ sap = e; }
  ok(!sap, 'localStorage bị chặn: không sập', sap && sap.message);
  console.log(`\n${dat}/${dat + hong} đạt`); process.exit(hong ? 1 : 0);
})();
