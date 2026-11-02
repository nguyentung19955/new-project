// Phép thử lõi đồng bộ của game/luu-may.js (không cần mạng/Firebase): node tools/firebase/kiem-thu-luu-may.js
const {taoDongBo, KHOA_SAO} = require('../../game/luu-may.js');
let hong = 0, dat = 0;
const ok = (dk, t, x) => { if (dk) dat++; else hong++; console.log((dk ? 'ĐẠT ' : 'HỎNG ') + t + (!dk && x !== undefined ? ' – ' + JSON.stringify(x) : '')); };
function khoGia(){ const m = new Map(); return {getItem:k => m.has(k) ? m.get(k) : null, setItem:(k, v) => m.set(k, String(v)), removeItem:k => m.delete(k), key:i => [...m.keys()][i] ?? null, get length(){ return m.size; }, clear:() => m.clear(), _m:m}; }
function mayGia(){ const docs = {}; let soGhi = 0; let hong = false;
  return {docs, get soGhi(){ return soGhi; }, hong(v){ hong = v; },
    async layVe(u){ if (hong) throw new Error('mất mạng'); return docs[u] ? JSON.parse(JSON.stringify(docs[u])) : null; },
    async guiLen(u, vq){ if (hong) throw new Error('mất mạng'); soGhi++; const d = docs[u] || (docs[u] = {khoa:{}, saoLuu:{}}); Object.assign(d.khoa, vq.khoa); Object.assign(d.saoLuu, vq.saoLuu || {}); }};
}
let dongHo = 1000; const gio = () => dongHo;
(async () => {
  const may = mayGia();
  // 1. máy A chơi, gửi lên
  const kA = khoGia(); const A = taoDongBo({kho:kA, cong:may, gio}); A.datUid('u1');
  await A.keo();
  dongHo = 2000; kA.setItem('tvcc-vung1', '{"manh":5}'); kA.setItem('khac', 'x');
  await A.gui();
  ok(may.docs.u1 && JSON.parse(may.docs.u1.khoa['tvcc-vung1'].du).manh === 5, 'gửi bản lưu Vùng 1 lên mây');
  ok(!may.docs.u1.khoa.khac && !may.docs.u1.khoa['tvcc-may-meta'], 'chỉ gửi khoá tvcc- (không gửi khoá lạ, không gửi meta)');
  const g1 = may.soGhi; await A.gui(); ok(may.soGhi === g1, 'không đổi gì thì không ghi thêm (tiết kiệm hạn mức)');
  // 2. xoá localStorage, tải lại → về từ mây
  kA.clear(); const A2 = taoDongBo({kho:kA, cong:may, gio}); A2.datUid('u1'); await A2.keo();
  ok(kA.getItem('tvcc-vung1') === '{"manh":5}', 'xoá localStorage rồi mở lại: tiến độ về từ mây');
  // 3. chưa kéo được (mất mạng) thì không gửi đè
  const kB = khoGia(); kB.setItem('tvcc-vung1', '{"manh":0}'); const B = taoDongBo({kho:kB, cong:may, gio}); B.datUid('u1');
  may.hong(true); let loi = null; try { await B.keo(); } catch (e){ loi = e; }
  ok(loi && !B.daKeo(), 'mất mạng: kéo báo lỗi, không coi là đã kéo');
  ok((await B.gui()) === false && JSON.parse(may.docs.u1.khoa['tvcc-vung1'].du).manh === 5, 'chưa kéo được thì KHÔNG gửi đè tiến độ trên mây');
  may.hong(false);
  // 4. máy B có bản lưu cũ từ trước khi bật lưu mây (t=0) → nhường bản mây, giữ dự phòng
  await B.keo();
  ok(kB.getItem('tvcc-vung1') === '{"manh":5}', 'bản máy có từ trước (chưa từng đồng bộ) nhường bản mây');
  ok(JSON.parse(kB.getItem(KHOA_SAO))['tvcc-vung1'].du === '{"manh":0}', 'bản máy bị thay được giữ dự phòng (tvcc-may-sao-luu)');
  // 5. xung đột 2 máy: sửa sau cùng thắng, bản bị đè giữ trên mây
  dongHo = 3000; kA.setItem('tvcc-vung1', '{"manh":10}'); await A2.gui();
  dongHo = 4000; kB.setItem('tvcc-vung1', '{"manh":20}'); await B.gui();
  ok(JSON.parse(may.docs.u1.khoa['tvcc-vung1'].du).manh === 20, 'xung đột: bản sửa sau cùng (máy B) thắng trên mây');
  ok(may.docs.u1.saoLuu['tvcc-vung1'] && JSON.parse(may.docs.u1.saoLuu['tvcc-vung1'].du).manh === 10, 'bản bị đè (máy A) giữ trong saoLuu');
  const A3 = taoDongBo({kho:kA, cong:may, gio}); A3.datUid('u1'); await A3.keo();
  ok(kA.getItem('tvcc-vung1') === '{"manh":20}', 'máy A mở lại thì nhận bản mới hơn');
  // 6. game đã đọc rồi mà mây mới hơn → không đè máy, không gửi đè mây
  const kC = khoGia(); const C = taoDongBo({kho:kC, cong:may, gio}); C.datUid('u1'); await C.keo();
  C.khoaDoc(); dongHo = 5000; kA.setItem('tvcc-vung1', '{"manh":30}'); await A3.gui();
  const kq = await C.keo();
  ok(kC.getItem('tvcc-vung1') === '{"manh":20}' && kq.giu.includes('tvcc-vung1'), 'đang chơi: bản mây mới hơn không đè lên game đang chạy');
  await C.gui(); ok(JSON.parse(may.docs.u1.khoa['tvcc-vung1'].du).manh === 30, '…và máy cũ không gửi đè bản mây mới hơn');
  dongHo = 6000; kC.setItem('tvcc-vung1', '{"manh":40}'); await C.gui();
  ok(JSON.parse(may.docs.u1.khoa['tvcc-vung1'].du).manh === 40, 'game ghi lại (mới hơn) thì được gửi lên bình thường');
  // 7. xoá khoá (chơi lại từ đầu) cũng đồng bộ
  dongHo = 7000; kC.removeItem('tvcc-he-thong'); kC.setItem('tvcc-he-thong', '1'); await C.gui(); dongHo = 8000; kC.removeItem('tvcc-he-thong'); await C.gui();
  ok(may.docs.u1.khoa['tvcc-he-thong'].du === null, 'xoá bản lưu cũng được ghi lên mây');
  const kD = khoGia(); kD.setItem('tvcc-he-thong', 'cu'); const D = taoDongBo({kho:kD, cong:may, gio}); D.datUid('u1'); await D.keo();
  ok(kD.getItem('tvcc-he-thong') === null, 'máy khác nhận việc xoá');
  // 8. kho hỏng / không có localStorage không làm sập
  const kHong = {getItem(){ throw new Error('chặn'); }, setItem(){ throw new Error('chặn'); }, removeItem(){}, key(){ throw new Error('chặn'); }, length:0};
  let sap = false; try { const H = taoDongBo({kho:kHong, cong:may, gio}); H.datUid('u2'); await H.keo(); await H.gui(); } catch (e){ sap = e; }
  ok(!sap, 'localStorage bị chặn: không sập', sap && sap.message);
  console.log(`\n${dat}/${dat + hong} đạt`); process.exit(hong ? 1 : 0);
})();
