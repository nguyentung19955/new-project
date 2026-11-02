// Kiểm lưu mây trong trình duyệt thật (Playwright) với "Firebase giả lập": thay 3 file SDK Firebase bằng bản giả
// nói chuyện với 1 kho dữ liệu nằm trong Node (đóng vai máy chủ Firestore + Auth). Không cần mạng, không cần dự án thật.
// Chạy: (cd tieng-vong-cuoi-cung && python3 -m http.server 8765 &) ; node tools/firebase/kiem-tra-trinh-duyet.js
const {chromium} = require('playwright');
const GOC = 'http://localhost:8765/game/';
const {MC, mayMoi:mayGia} = require('./firebase-gia.js');   // máy chủ + SDK Firebase giả (dùng chung)
let hong = 0, dat = 0;
const ok = (dk, t, x) => { if (dk) dat++; else hong++; console.log((dk ? 'ĐẠT ' : 'HỎNG ') + t + (x !== undefined ? ' – ' + JSON.stringify(x) : '')); };

(async () => {
  const b = await chromium.launch(), loi = [];
  const mayMoi = o => mayGia(b, loi, o);
  const vao = async (pg, q) => { await pg.goto(GOC + 'vung-1/index.html?tu=1' + (q || '')); await pg.waitForFunction(() => window.TV && (TV.xong || TV.loi), null, {timeout:30000}); };
  const manhMay = uid => { const d = MC.docs[['nguoi_choi', uid, 'ban_luu', 'tvcc-vung1'].join('/')]; return d && d.du ? JSON.parse(d.du).manh : null; };
  const tl = (uid, k) => MC.docs[['nguoi_choi', uid, 'ban_luu', k].join('/')];

  // 1. máy A: chơi mới, nhặt Mảnh Âm, lưu → lên mây
  const A = await mayMoi(); await vao(A.pg);
  const ttA = await A.pg.evaluate(() => LuuMay.trangThai); ok(ttA === 'an-danh', 'tự đăng nhập ẩn danh', ttA);
  await A.pg.evaluate(() => TV.choi(true)); await A.pg.waitForTimeout(300);
  await A.pg.evaluate(() => { G.luu.manh = 77; V1.ghiLuu(); return LuuMay.guiNgay(); });
  const uidA = await A.pg.evaluate(() => LuuMay._dongBo.uid());
  ok(manhMay(uidA) === 77 && tl(uidA, 'tvcc-vung1').revision >= 1, 'lưu Vùng 1 lên mây (Mảnh Âm = 77, mỗi khoá 1 tài liệu có revision)', manhMay(uidA));
  ok(tl(uidA, 'tvcc-chung') && MC.docs['nguoi_choi/' + uidA] && MC.docs['nguoi_choi/' + uidA].phienBan === 2, 'lưu chung (tvcc-chung) cũng lên mây; tài liệu người chơi phienBan 2');
  const chu = await A.pg.evaluate(() => LuuMay.moTa()); ok(chu === 'Cloud save up to date', 'chữ trạng thái khi đã gửi xong', chu);
  // 2. xoá localStorage, tải lại → tiến độ về
  await A.pg.evaluate(() => localStorage.clear());
  await vao(A.pg);
  const sauXoa = await A.pg.evaluate(() => ({co:V1.coLuu(), manh:JSON.parse(localStorage.getItem('tvcc-vung1') || '{}').manh, nut:!document.getElementById('b-tiep').disabled}));
  ok(sauXoa.co && sauXoa.manh === 77 && sauXoa.nut, 'xoá localStorage + tải lại: tiến độ về từ mây, nút Tiếp tục bật', sauXoa);
  // 3. tự gửi định kỳ (không gọi guiNgay)
  await A.pg.evaluate(() => TV.choi(false)); await A.pg.waitForTimeout(300);
  await A.pg.evaluate(() => { G.luu.manh = 88; V1.ghiLuu(); });
  const dangCho = await A.pg.evaluate(() => LuuMay.moTa()); ok(dangCho === 'Saving to cloud…', 'chưa gửi xong thì KHÔNG báo "up to date"', dangCho);
  await A.pg.waitForTimeout(4500);
  ok(manhMay(uidA) === 88, 'tự gửi lên sau vài giây khi game ghi lưu', manhMay(uidA));
  // 4. gắn Google ở máy A, rồi máy B (máy khác) đăng nhập cùng Google → nhận tiến độ
  await vao(A.pg);
  const gA = await A.pg.evaluate(() => LuuMay.dangNhapGoogle().then(ok => ({ok, tt:LuuMay.trangThai, mo:LuuMay.moTa()})));
  ok(gA.ok && gA.tt === 'google' && gA.mo === 'Google connected · Progress backed up', 'máy A gắn tài khoản Google (giữ nguyên tiến độ)', gA);
  const B = await mayMoi(); await vao(B.pg);
  ok(await B.pg.evaluate(() => !V1.coLuu()), 'máy B mới: chưa có bản lưu');
  const gB = await B.pg.evaluate(() => LuuMay.dangNhapGoogle().then(ok => ({ok, uid:LuuMay._dongBo.uid(), loi:LuuMay.loi})));
  ok(gB.ok && gB.uid === uidA, 'máy B đăng nhập cùng Google → chuyển sang bản lưu của máy A', gB);
  await vao(B.pg);
  const mB = await B.pg.evaluate(() => JSON.parse(localStorage.getItem('tvcc-vung1') || '{}').manh);
  ok(mB === 88, 'máy B tải lại: có tiến độ của máy A (Mảnh Âm 88)', mB);
  // 5. B chơi tiếp (99) → A mở lại (không có thay đổi) nhận 99; bản cũ giữ ở saoLuuTruoc
  await B.pg.evaluate(() => TV.choi(false)); await B.pg.waitForTimeout(300);
  await B.pg.evaluate(() => { G.luu.manh = 99; V1.ghiLuu(); return LuuMay.guiNgay(); });
  await vao(A.pg);
  const mA = await A.pg.evaluate(() => JSON.parse(localStorage.getItem('tvcc-vung1')).manh);
  ok(mA === 99 && JSON.parse(tl(uidA, 'tvcc-vung1').saoLuuTruoc).manh === 88, 'hai máy lần lượt: máy kia nhận bản mới, bản trước giữ dự phòng trên mây', {mA});
  // 5b. XUNG ĐỘT: A và B cùng chơi từ cùng 1 bản; A gửi trước; B gửi sau → B không đè, menu hiện 2 nút chọn
  await vao(B.pg);
  await A.pg.evaluate(() => TV.choi(false)); await B.pg.evaluate(() => TV.choi(false)); await A.pg.waitForTimeout(300);
  await A.pg.evaluate(() => { G.luu.manh = 120; V1.ghiLuu(); return LuuMay.guiNgay(); });
  await B.pg.evaluate(() => { G.luu.manh = 130; V1.ghiLuu(); return LuuMay.guiNgay(); });
  ok(manhMay(uidA) === 120, 'xung đột: máy ghi sau KHÔNG đè tiến độ máy ghi trước', manhMay(uidA));
  await vao(B.pg);
  const xd = await B.pg.evaluate(() => ({mo:LuuMay.moTa(), nut:!document.getElementById('may-xd').hidden, m:JSON.parse(localStorage.getItem('tvcc-vung1')).manh}));
  ok(xd.mo === 'Cloud save needs attention' && xd.nut && xd.m === 130, 'máy B: báo "Cloud save needs attention", hiện nút chọn, vẫn giữ bản máy (130)', xd);
  await Promise.all([B.pg.waitForEvent('load'), B.pg.click('#b-xd-may')]);
  await B.pg.waitForFunction(() => window.TV && (TV.xong || TV.loi), null, {timeout:30000});
  const sauChon = await B.pg.evaluate(() => ({m:JSON.parse(localStorage.getItem('tvcc-vung1')).manh, mo:LuuMay.moTa(), sao:JSON.parse(localStorage.getItem('tvcc-may-sao-luu'))['tvcc-vung1']}));
  ok(sauChon.m === 120 && sauChon.mo !== 'Cloud save needs attention' && JSON.parse(sauChon.sao.du).manh === 130, 'bấm "Use cloud save": nhận 120, bản 130 giữ dự phòng trên máy', sauChon);
  // 5c. xuất / nhập bản lưu
  const [tai] = await Promise.all([B.pg.waitForEvent('download'), B.pg.click('#b-xuat')]);
  const tep = require('fs').readFileSync(await tai.path(), 'utf8');
  ok(JSON.parse(JSON.parse(tep).khoa['tvcc-vung1']).manh === 120, 'nút "Export save" tải về file bản lưu');
  const Dn = await mayMoi({ch:null}); await vao(Dn.pg, '&moi=1');
  const nh = await Dn.pg.evaluate(s => { const r = LuuMay.nhap(s); return {ok:r.ok, m:JSON.parse(localStorage.getItem('tvcc-vung1')).manh}; }, tep);
  ok(nh.ok && nh.m === 120, 'nhập file bản lưu ở máy không có mạng/lưu mây', nh);
  await Dn.ctx.close();
  // 6. đang chơi thì rớt mạng: vẫn chơi + lưu máy; có mạng lại thì gửi lên
  await A.pg.evaluate(() => TV.choi(false)); await A.pg.waitForTimeout(300);
  await A.ctx.setOffline(true); await A.pg.evaluate(() => { window.__matMang = true; window.dispatchEvent(new Event('offline')); });
  await A.pg.evaluate(() => { G.luu.manh = 111; V1.ghiLuu(); TV.buoc(30, 'right'); });
  const off = await A.pg.evaluate(() => ({tt:LuuMay.trangThai, manh:JSON.parse(localStorage.getItem('tvcc-vung1')).manh}));
  ok(off.tt === 'ngoai-tuyen' && off.manh === 111, 'mất mạng: game vẫn chạy, lưu trên máy', off);
  await A.ctx.setOffline(false); await A.pg.evaluate(() => { window.__matMang = false; window.dispatchEvent(new Event('online')); });
  await A.pg.waitForTimeout(1500);
  ok(manhMay(uidA) === 111, 'có mạng lại: tự gửi bản lưu lên mây', manhMay(uidA));
  // 7. trang bị chặn mạng (như trong Artifact claude.ai): không tải được Firebase → vẫn chơi được, không lỗi
  const C = await mayMoi({chan:true}); await vao(C.pg, '&moi=1');
  await C.pg.evaluate(() => TV.choi(true)); await C.pg.waitForTimeout(300);
  const cc = await C.pg.evaluate(() => ({tt:LuuMay.trangThai, g:G.trang, co:V1.coLuu()}));
  ok(cc.g === 'choi' && cc.co && (cc.tt === 'loi' || cc.tt === 'ngoai-tuyen'), 'chặn mạng hẳn: vẫn chơi + lưu máy', cc);
  // 8. không có cấu hình Firebase: lưu mây tắt, menu không hiện dòng lưu mây
  const D = await mayMoi({ch:null}); await vao(D.pg, '&moi=1');
  const dd = await D.pg.evaluate(() => ({tt:LuuMay.trangThai, an:document.getElementById('may-tt').hidden, tep:!document.getElementById('luu-tep').hidden}));
  ok(dd.tt === 'tat' && dd.an && dd.tep, 'chưa có cấu hình: lưu mây tắt, chỉ lưu máy', dd);
  await D.pg.evaluate(() => TV.choi(true)); await D.pg.waitForTimeout(300);
  ok(await D.pg.evaluate(() => V1.coLuu()), '…và vẫn lưu máy bình thường');
  // 9. trang chọn mở được
  await D.pg.goto(GOC); ok((await D.pg.locator('a').count()) >= 3, 'trang chọn game/ có liên kết Làng, Vùng 1, Phòng demo');
  await A.pg.evaluate(() => TV.choi(false)).catch(() => {});
  ok(loi.length === 0, 'không lỗi JS', loi);
  console.log(`\n${dat}/${dat + hong} đạt · máy chủ giả: ${MC.ghi} lần ghi, ${MC.doc} lần đọc`);
  await b.close(); process.exit(hong ? 1 : 0);
})();
