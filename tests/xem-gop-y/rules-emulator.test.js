// v163: kiểm tra luật firestore.rules cho feedback/{id} trên Firestore emulator (cần Java + firebase-tools + @firebase/rules-unit-testing).
// Cài một lần ở thư mục tạm:  npm i firebase-tools @firebase/rules-unit-testing firebase
// Chạy:  NODE_PATH=<thư mục tạm>/node_modules npx --prefix <thư mục tạm> firebase emulators:exec --only firestore --project demo-tt "node tests/xem-gop-y/rules-emulator.test.js"
const fs = require('fs'), path = require('path');
// thiếu thư viện / Java / emulator chưa chạy → bỏ qua (SKIP), không tính lỗi khi chạy tests/run-all.js
const skip = (why) => { console.log('SKIP: ' + why + ' (xem cách chạy ở đầu file)'); process.exit(0); };
let rut;
try { rut = require('@firebase/rules-unit-testing'); } catch (e) { skip('thiếu @firebase/rules-unit-testing'); }
try { require('child_process').execFileSync('java', ['-version'], { stdio: 'ignore' }); } catch (e) { skip('thiếu Java'); }
if (!process.env.FIRESTORE_EMULATOR_HOST) skip('Firestore emulator chưa chạy (thiếu FIRESTORE_EMULATOR_HOST — chạy qua firebase emulators:exec)');
const { initializeTestEnvironment, assertSucceeds, assertFails } = rut;
const ok = (c, m) => { if (!c) throw new Error('FAIL: ' + m); console.log('  ✓ ' + m); };

(async () => {
  const env = await initializeTestEnvironment({ projectId: 'demo-tt',
    firestore: { rules: fs.readFileSync(path.join(__dirname, '../../firestore.rules'), 'utf8'), host: '127.0.0.1', port: 8080 } });
  const seed = { kind: 'bug', text: 'Quái đi xuyên tướng ở khúc cua', contact: '', shot: '', ver: 'v162', where: 'Menu', scr: '844x390@2.0', ua: 'Android', at: 1, uid: 'u1', guest: true };
  await env.withSecurityRulesDisabled(async (c) => { await c.firestore().doc('feedback/a').set(seed); await c.firestore().doc('feedback/b').set({ ...seed, at: 2 }); });
  const admin = env.authenticatedContext('adm', { email: 'ly230595@gmail.com', email_verified: true }).firestore();
  const adminUpper = env.authenticatedContext('adm2', { email: 'Ly230595@Gmail.com', email_verified: true }).firestore();
  const unverified = env.authenticatedContext('adm3', { email: 'ly230595@gmail.com', email_verified: false }).firestore();
  const other = env.authenticatedContext('o1', { email: 'khac@gmail.com', email_verified: true }).firestore();
  const guest = env.authenticatedContext('u1', { firebase: { sign_in_provider: 'anonymous' } }).firestore();
  const anon = env.unauthenticatedContext().firestore();
  const list = (db) => db.collection('feedback').orderBy('at', 'desc').limit(20).get();

  console.log('• Đọc');
  await assertSucceeds(list(admin)); ok(true, 'quản trị (email đã xác minh) list được, orderBy at desc');
  await assertSucceeds(admin.doc('feedback/a').get()); ok(true, 'quản trị get được 1 góp ý');
  await assertSucceeds(list(adminUpper)); ok(true, 'email viết hoa khác vẫn khớp (so chữ thường)');
  for (const [n, db] of [['email chưa xác minh', unverified], ['tài khoản khác', other], ['khách ẩn danh (cả người gửi)', guest], ['chưa đăng nhập', anon]]) {
    await assertFails(list(db)); await assertFails(db.doc('feedback/a').get()); ok(true, `${n}: không đọc được`);
  }
  console.log('• Sửa trạng thái / ghi chú');
  await assertSucceeds(admin.doc('feedback/a').update({ status: 'seen' })); ok(true, 'quản trị đổi status');
  await assertSucceeds(admin.doc('feedback/a').update({ status: 'done', note: 'đã sửa' })); ok(true, 'quản trị đổi status + note');
  await assertFails(admin.doc('feedback/a').update({ status: 'xoa' })); ok(true, 'status lạ bị từ chối');
  await assertFails(admin.doc('feedback/a').update({ note: 'x'.repeat(301) })); ok(true, 'note > 300 ký tự bị từ chối');
  await assertFails(admin.doc('feedback/a').update({ text: 'sửa nội dung người chơi' })); ok(true, 'quản trị không sửa được trường khác (text)');
  await assertFails(admin.doc('feedback/a').update({ status: 'seen', uid: 'x' })); ok(true, 'kèm trường khác → từ chối');
  for (const [n, db] of [['email chưa xác minh', unverified], ['tài khoản khác', other], ['khách', guest]]) {
    await assertFails(db.doc('feedback/b').update({ status: 'seen' })); ok(true, `${n}: không đổi trạng thái được`);
  }
  console.log('• Xoá');
  for (const [n, db] of [['email chưa xác minh', unverified], ['tài khoản khác', other], ['khách', guest]]) {
    await assertFails(db.doc('feedback/b').delete()); ok(true, `${n}: không xoá được`);
  }
  await assertSucceeds(admin.doc('feedback/b').delete()); ok(true, 'quản trị xoá được');
  console.log('• Tạo (luật cũ giữ nguyên)');
  await assertSucceeds(guest.collection('feedback').add({ ...seed, at: 3 })); ok(true, 'khách tạo góp ý hợp lệ');
  await assertFails(guest.collection('feedback').add({ ...seed, uid: 'kẻ khác' })); ok(true, 'uid sai → từ chối');
  await assertFails(guest.collection('feedback').add({ ...seed, status: 'done' })); ok(true, 'người gửi không tự đặt status');
  await assertFails(anon.collection('feedback').add(seed)); ok(true, 'chưa đăng nhập → không tạo được');
  console.log('• Phòng chơi nhóm không bị ảnh hưởng');
  await assertFails(guest.collection('rooms').get()); ok(true, 'rooms vẫn cấm list');
  await env.cleanup();
  console.log('XONG');
})().catch((e) => { console.error(e); process.exit(1); });
