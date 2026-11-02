// Kiểm ĐĂNG NHẬP GOOGLE + PHIÊN 7 NGÀY trong trình duyệt thật (Playwright) với Firebase giả lập (tools/firebase/firebase-gia.js).
// Chạy: (cd tieng-vong-cuoi-cung && python3 -m http.server 8765 &) ; node tools/firebase/kiem-tra-dang-nhap.js [thư-mục-ảnh]
// Đối số thư mục ảnh (tuỳ chọn, để NGOÀI repo): chụp menu 844×390 để tự xem.
const {chromium} = require('playwright');
const {MC, mayMoi} = require('./firebase-gia.js');
const GOC = 'http://localhost:8765/game/';
const ANH = process.argv[2] || '';
const NGAY = 86400;
let hong = 0, dat = 0;
const ok = (dk, t, x) => { if (dk) dat++; else hong++; console.log((dk ? 'ĐẠT ' : 'HỎNG ') + t + (x !== undefined ? ' – ' + JSON.stringify(x) : '')); };
const HET = 'Your sign-in expired after 7 days. Sign in again to sync your progress.';

(async () => {
  const b = await chromium.launch(), loi = [];
  const may = o => mayMoi(b, loi, Object.assign({viewport:{width:844, height:390}}, o || {}));
  const vao = async (pg, q) => { await pg.goto(GOC + 'vung-1/index.html?tu=1' + (q || '')); await pg.waitForFunction(() => window.TV && (TV.xong || TV.loi), null, {timeout:30000});
    await pg.waitForFunction(() => LuuMay.trangThai !== 'dang-ket-noi', null, {timeout:15000}); };
  const tt = pg => pg.evaluate(() => ({tt:LuuMay.trangThai, uid:LuuMay._dongBo.uid(), ai:(document.getElementById('dn-ai') || {}).textContent,
    vao:!document.getElementById('b-dn-vao').hidden, ra:!document.getElementById('b-dn-ra').hidden, bao:LuuMay.thongBao,
    hienBao:!!document.querySelector('#dn-bao.mo'), manh:JSON.parse(localStorage.getItem('tvcc-vung1') || '{}').manh, phien:LuuMay.phien}));
  const manhMay = uid => { const d = MC.docs[['nguoi_choi', uid, 'ban_luu', 'tvcc-vung1'].join('/')]; return d && d.du ? JSON.parse(d.du).manh : null; };
  const choiLuu = async (pg, n) => { await pg.evaluate(() => TV.choi(false)); await pg.waitForTimeout(250); await pg.evaluate(n => { G.luu.manh = n; V1.ghiLuu(); return LuuMay.guiNgay(); }, n); };
  const chup = async (pg, ten) => { if (ANH) await pg.screenshot({path:require('path').join(ANH, ten + '.png')}); };

  // 1. khách: menu có nút "Sign in with Google", ô đủ lớn, nằm trong màn 844×390
  const A = await may({ch:{nhipKiemPhien:1500}}); await A.ctx.addInitScript(() => { window.__googleGia = 'tung'; }); await vao(A.pg);
  let s = await tt(A.pg);
  ok(s.tt === 'an-danh' && s.ai === 'Playing as guest' && s.vao && !s.ra, 'khách: hiện "Playing as guest" + nút Sign in with Google', s);
  const phien = await A.pg.evaluate(() => window.__phienGia);
  ok(Array.isArray(phien) && phien[0] === 'indexedDB' && phien[1] === 'local', 'phiên đăng nhập lâu dài: IndexedDB → localStorage → … (không mất khi đóng Safari)', phien);
  const hop = await A.pg.locator('#b-dn-vao').boundingBox();
  ok(hop && hop.height >= 44 && hop.y >= 0 && hop.y + hop.height <= 390 && hop.x >= 0 && hop.x + hop.width <= 844, 'nút Sign in ≥ 44 px, nằm trong màn 844×390', hop);
  await chup(A.pg, '1-menu-khach');
  // 2. khách chơi, rồi đăng nhập Google → GẮN vào tài khoản khách, giữ tiến độ
  await choiLuu(A.pg, 42); await A.pg.evaluate(() => TV.choi && 0);
  await vao(A.pg);
  const uidKhach = (await tt(A.pg)).uid;
  await A.pg.click('#b-dn-vao'); await A.pg.waitForFunction(() => LuuMay.trangThai === 'google', null, {timeout:10000});
  await A.pg.waitForTimeout(300);
  s = await tt(A.pg);
  ok(s.uid === uidKhach && s.manh === 42 && manhMay(uidKhach) === 42 && s.ra && !s.vao && /^Signed in: tung · tung@gmail\.com$/.test(s.ai),
    'đăng nhập Google từ khách: cùng tài khoản, giữ tiến độ (42), hiện tên + nút Sign out', s);
  ok(s.phien && s.phien.conLai > 6.99 * NGAY * 1000, 'vừa đăng nhập: còn ~7 ngày', s.phien);
  ok(await A.pg.evaluate(() => document.getElementById('may-xd').offsetParent === null), 'không xung đột thì 2 nút chọn bản ẨN thật (không chỉ thuộc tính hidden)');
  await chup(A.pg, '2-menu-google');
  // 3. tải lại trang → vẫn đăng nhập
  await vao(A.pg); s = await tt(A.pg);
  ok(s.tt === 'google' && s.uid === uidKhach && s.ra, 'tải lại trang: vẫn đăng nhập Google', s);
  // 4. auth_time 6 ngày trước → vẫn đăng nhập
  MC.authTime[uidKhach] = Math.floor(Date.now() / 1000) - 6 * NGAY;
  await vao(A.pg); s = await tt(A.pg);
  ok(s.tt === 'google' && !s.bao, 'đăng nhập 6 ngày trước: vẫn đăng nhập', s);
  // 5. auth_time 8 ngày trước → mở game: tự đăng xuất về khách, giữ tiến độ máy, hiện thông báo
  MC.authTime[uidKhach] = Math.floor(Date.now() / 1000) - 8 * NGAY;
  const ghiTruoc = MC.ghi;
  await vao(A.pg); s = await tt(A.pg);
  ok(s.tt === 'an-danh' && s.uid !== uidKhach && s.manh === 42 && s.vao && s.bao === HET && s.hienBao, 'đăng nhập 8 ngày trước: tự về khách, tiến độ máy giữ (42), hiện thông báo hết hạn', s);
  ok(manhMay(uidKhach) === 42, '…bản mây của tài khoản Google không bị đụng', {ghi:MC.ghi - ghiTruoc});
  await chup(A.pg, '3-het-han');
  await A.pg.click('#dn-bao'); ok(!(await tt(A.pg)).hienBao, 'chạm để đóng thông báo');
  // 6. đăng nhập lại → tài khoản Google đã có bản lưu; bản máy giống → không hỏi; tính lại 7 ngày
  await A.pg.click('#b-dn-vao'); await A.pg.waitForFunction(() => LuuMay.trangThai === 'google', null, {timeout:10000}); await A.pg.waitForTimeout(300);
  s = await tt(A.pg);
  ok(s.uid === uidKhach && s.phien && s.phien.conLai > 6.99 * NGAY * 1000 && s.manh === 42 && !s.bao, 'đăng nhập lại: về tài khoản cũ, tính lại 7 ngày', s);
  // 7. game mở liên tục qua mốc 7 ngày (kiểm định kỳ) → tự đăng xuất
  await A.pg.evaluate(() => TV.choi(false)); await A.pg.waitForTimeout(200);
  MC.authTime[uidKhach] = Math.floor(Date.now() / 1000) - 7 * NGAY + 2;
  ok((await tt(A.pg)).tt === 'google', 'trước mốc 7 ngày: còn đăng nhập (đang chơi)');
  await A.pg.waitForTimeout(5000);
  s = await tt(A.pg);
  ok(s.tt === 'an-danh' && s.bao === HET && s.hienBao && s.manh === 42, 'đang chơi qua mốc 7 ngày: tự về khách, game vẫn chạy, hiện thông báo', s);
  ok(await A.pg.evaluate(() => G.trang === 'choi'), '…không làm gián đoạn màn chơi');
  await chup(A.pg, '4-het-han-khi-choi');
  // 8. đăng xuất bằng nút → về khách, không xoá bản lưu máy; đăng nhập lại tính lại 7 ngày
  await vao(A.pg);
  await A.pg.click('#b-dn-vao'); await A.pg.waitForFunction(() => LuuMay.trangThai === 'google', null, {timeout:10000});
  MC.authTime[uidKhach] = Math.floor(Date.now() / 1000) - 5 * NGAY;
  await choiLuu(A.pg, 55); await vao(A.pg);
  await A.pg.click('#b-dn-ra'); await A.pg.waitForFunction(() => LuuMay.trangThai === 'an-danh', null, {timeout:10000}); await A.pg.waitForTimeout(300);
  s = await tt(A.pg);
  ok(s.uid !== uidKhach && s.manh === 55 && manhMay(uidKhach) === 55 && !s.bao && s.vao, 'Sign out: lưu lên mây trước (55), về khách, bản máy còn nguyên', s);
  await A.pg.click('#b-dn-vao'); await A.pg.waitForFunction(() => LuuMay.trangThai === 'google', null, {timeout:10000}); await A.pg.waitForTimeout(300);
  s = await tt(A.pg);
  ok(s.uid === uidKhach && s.phien.conLai > 6.99 * NGAY * 1000, 'đăng xuất rồi đăng nhập lại: tính lại 7 ngày', s.phien);
  // 9. máy khác (khách, có tiến độ riêng) đăng nhập vào tài khoản Google đã có bản lưu → KHÔNG đè, cho chọn
  const B = await may(); await B.ctx.addInitScript(() => { window.__googleGia = 'tung'; }); await vao(B.pg);
  await choiLuu(B.pg, 7); await vao(B.pg);
  await B.pg.click('#b-dn-vao'); await B.pg.waitForFunction(() => LuuMay.trangThai === 'google', null, {timeout:10000}); await B.pg.waitForTimeout(400);
  const xd = await B.pg.evaluate(() => ({mo:LuuMay.moTa(), nut:document.getElementById('may-xd').offsetParent !== null, uid:LuuMay._dongBo.uid(), m:JSON.parse(localStorage.getItem('tvcc-vung1')).manh}));
  ok(xd.uid === uidKhach && xd.nut && xd.m === 7 && manhMay(uidKhach) === 55, 'tài khoản Google đã có bản lưu: không đè (mây 55, máy 7), hiện 2 nút chọn', xd);
  await chup(B.pg, '5-chon-ban');
  await Promise.all([B.pg.waitForEvent('load'), B.pg.click('#b-xd-may')]);
  await B.pg.waitForFunction(() => window.TV && (TV.xong || TV.loi), null, {timeout:30000});
  ok(await B.pg.evaluate(() => JSON.parse(localStorage.getItem('tvcc-vung1')).manh) === 55, 'chọn "Use cloud save": nhận 55');
  // 9b. trình duyệt không trả credential trong lỗi → báo bấm lại, lần bấm sau đăng nhập thẳng, vẫn cho chọn bản
  const D = await may(); await D.ctx.addInitScript(() => { window.__googleGia = 'tung'; window.__khongCred = true; }); await vao(D.pg);
  await choiLuu(D.pg, 3); await vao(D.pg);
  await D.pg.click('#b-dn-vao'); await D.pg.waitForTimeout(500);
  const d1 = await D.pg.evaluate(() => ({tt:LuuMay.trangThai, loi:document.getElementById('dn-loi').textContent}));
  ok(d1.tt === 'an-danh' && /already has a save/.test(d1.loi), 'không lấy được credential: vẫn là khách, báo "bấm lại để chuyển"', d1);
  await D.pg.click('#b-dn-vao'); await D.pg.waitForFunction(() => LuuMay.trangThai === 'google', null, {timeout:10000}); await D.pg.waitForTimeout(400);
  const d2 = await D.pg.evaluate(() => ({uid:LuuMay._dongBo.uid(), nut:document.getElementById('may-xd').offsetParent !== null, m:JSON.parse(localStorage.getItem('tvcc-vung1')).manh}));
  ok(d2.uid === uidKhach && d2.nut && d2.m === 3 && manhMay(uidKhach) === 55, '…bấm lần 2: vào tài khoản Google, không đè (mây 55, máy 3), cho chọn', d2);
  await D.ctx.close();
  // 10. màn tiêu đề game/: ô tài khoản nằm trong bảng Account (khoidau) + nút chọn bản khi xung đột
  await B.pg.goto(GOC); await B.pg.waitForFunction(() => LuuMay.trangThai !== 'dang-ket-noi' && window.TIEU_DE && TIEU_DE.xong, null, {timeout:15000}); await B.pg.waitForTimeout(300);
  await B.pg.click('#b-tk'); await B.pg.waitForTimeout(200);
  const ic = await B.pg.evaluate(() => ({ai:document.getElementById('dn-ai').textContent, ra:!document.getElementById('b-dn-ra').hidden, xd:!!document.getElementById('kd-b-tk-xd'), tt:document.getElementById('kd-tk-tt').textContent}));
  ok(/^Signed in: tung/.test(ic.ai) && ic.ra && ic.xd && /^(Signed in · Synced|Syncing…|Action needed · Choose a save)$/.test(ic.tt), 'màn tiêu đề: Account có ô tài khoản (Signed in + Sign out) + trạng thái chữ rõ', ic);
  await chup(B.pg, '6-trang-chon');
  // 11. Làng Chuông: thông báo khi đang chơi (ô tài khoản đã chuyển vào Account trên màn tiêu đề – khoidau)
  await B.pg.goto(GOC + 'lang-chuong/?thu=1'); await B.pg.waitForTimeout(2500);
  const lc = await B.pg.evaluate(() => ({o:!!document.getElementById('dn-ai'), bao:!!document.getElementById('dn-bao')}));
  ok(!lc.o && lc.bao, 'Làng Chuông nạp thông báo, không còn ô đăng nhập giữa màn', lc);
  await chup(B.pg, '7-lang');
  // 12. không có mạng (chặn tải Firebase): vẫn chơi, nút đăng nhập báo nhẹ nhàng, không lỗi
  const C = await may({chan:true}); await vao(C.pg, '&moi=1');
  await C.pg.evaluate(() => TV.choi(true)); await C.pg.waitForTimeout(300);
  const cc = await C.pg.evaluate(() => ({g:G.trang, co:V1.coLuu(), tt:LuuMay.trangThai}));
  ok(cc.g === 'choi' && cc.co, 'không có mạng: vẫn chơi + lưu trên máy', cc);
  await vao(C.pg, '');
  await C.pg.click('#b-dn-vao'); await C.pg.waitForTimeout(300);
  const cl = await C.pg.evaluate(() => ({loi:!document.getElementById('dn-loi').hidden, chu:document.getElementById('dn-loi').textContent}));
  ok(cl.loi, 'không có mạng: bấm Sign in chỉ báo chữ, không sập', cl);
  await chup(C.pg, '8-khong-mang');
  // 13. đang đăng nhập Google mà mất mạng: vẫn chơi, không tự đăng xuất (còn hạn)
  await A.pg.evaluate(() => TV.choi(false)); await A.pg.waitForTimeout(200);
  await A.ctx.setOffline(true); await A.pg.evaluate(() => { window.__matMang = true; window.dispatchEvent(new Event('offline')); });
  await A.pg.evaluate(() => { G.luu.manh = 66; V1.ghiLuu(); TV.buoc(30, 'right'); }); await A.pg.waitForTimeout(2500);
  const off = await A.pg.evaluate(() => ({tt:LuuMay.trangThai, g:LuuMay.laGoogle(), m:JSON.parse(localStorage.getItem('tvcc-vung1')).manh}));
  ok(off.tt === 'ngoai-tuyen' && off.g && off.m === 66, 'Google + mất mạng: vẫn chơi, lưu máy, không tự đăng xuất', off);
  await A.ctx.setOffline(false); await A.pg.evaluate(() => { window.__matMang = false; window.dispatchEvent(new Event('online')); }); await A.pg.waitForTimeout(1500);
  ok(manhMay(uidKhach) === 66, 'có mạng lại: tự gửi lên tài khoản Google', manhMay(uidKhach));
  ok(loi.length === 0, 'không lỗi JS', loi);
  console.log(`\n${dat}/${dat + hong} đạt`);
  await b.close(); process.exit(hong ? 1 : 0);
})().catch(e => { console.log('HỎNG lỗi bất ngờ: ' + (e && (e.stack || e))); process.exit(1); });
