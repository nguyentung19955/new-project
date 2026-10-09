// Thử luật Firestore của Linh Khí trên Firestore emulator (cần Java + firebase-tools + @firebase/rules-unit-testing).
// Thử trên bản luật ĐẦY ĐỦ game/firebase/firestore.rules.gop (luật Thần Thoại Việt + ba khối Linh Khí).
// Cài một lần ở thư mục tạm:  npm i firebase-tools @firebase/rules-unit-testing firebase
// Chạy (từ thư mục gốc repo):
//   NODE_PATH=<tạm>/node_modules <tạm>/node_modules/.bin/firebase emulators:exec --only firestore --project demo-lk "node game/tests/may_luat.test.js"
// Thiếu thư viện / Java / emulator → in SKIP, không tính lỗi.
const fs = require('fs'), path = require('path');
const skip = (why) => { console.log('SKIP: ' + why + ' (xem cách chạy ở đầu tệp)'); process.exit(0); };
let rut;
try { rut = require('@firebase/rules-unit-testing'); } catch (e) { skip('thiếu @firebase/rules-unit-testing'); }
try { require('child_process').execFileSync('java', ['-version'], { stdio: 'ignore' }); } catch (e) { skip('thiếu Java'); }
if (!process.env.FIRESTORE_EMULATOR_HOST) skip('Firestore emulator chưa chạy');
const { initializeTestEnvironment, assertSucceeds, assertFails } = rut;
let n = 0;
const ok = (m) => { n++; console.log('  ✓ ' + m); };
const yes = async (p, m) => { await assertSucceeds(p); ok(m); };
const no = async (p, m) => { await assertFails(p); ok(m); };

(async () => {
  const [host, port] = process.env.FIRESTORE_EMULATOR_HOST.split(':');
  const env = await initializeTestEnvironment({ projectId: 'demo-lk',
    firestore: { rules: fs.readFileSync(path.join(__dirname, '../firebase/firestore.rules.gop'), 'utf8'), host, port: +port } });
  const ctx = (uid, tok) => env.authenticatedContext(uid, tok).firestore();
  const g1 = ctx('u1'), g2 = ctx('u2'), anon = env.unauthenticatedContext().firestore();
  const admin = ctx('adm', { email: 'ly230595@gmail.com', email_verified: true });
  const adminUnv = ctx('adm2', { email: 'ly230595@gmail.com', email_verified: false });
  const other = ctx('o1', { email: 'khac@gmail.com', email_verified: true });

  console.log('• linhkhi_users');
  const sv = { save: '{"v":1}', updatedAt: 1, prog: 3, v: 1, ver: 'lk-1' };
  await yes(g1.doc('linhkhi_users/u1').set(sv), 'ghi bản lưu của mình');
  await yes(g1.doc('linhkhi_users/u1').get(), 'đọc bản lưu của mình');
  await no(g2.doc('linhkhi_users/u1').get(), 'không đọc được bản lưu người khác');
  await no(g2.doc('linhkhi_users/u1').set(sv), 'không ghi được bản lưu người khác');
  await no(anon.doc('linhkhi_users/u1').get(), 'chưa đăng nhập: không đọc');
  await no(g1.doc('linhkhi_users/u1').set({ ...sv, la: 1 }), 'trường lạ → từ chối');
  await no(g1.doc('linhkhi_users/u1').set({ ...sv, save: 'x'.repeat(400001) }), 'bản lưu quá 400000 ký tự → từ chối');
  await no(g1.doc('users/u1').set({ save: 1 }), 'khối users của Thần Thoại Việt vẫn giữ luật cũ (save phải là chuỗi)');

  console.log('• linhkhi_scores');
  const sc = { name: 'Khách 1234', power: 500, stars: 12, far: 5, hero: 'smith', g: false, at: 1, b_moc: 60.5 };
  await yes(g1.doc('linhkhi_scores/u1').set(sc), 'tạo dòng của mình');
  await yes(anon.collection('linhkhi_scores').orderBy('power', 'desc').limit(8).get(), 'ai cũng xem được bảng (kể cả chưa đăng nhập)');
  await no(g2.doc('linhkhi_scores/u1').set({ ...sc, power: 600 }), 'không ghi dòng người khác');
  await yes(g1.doc('linhkhi_scores/u1').set({ ...sc, power: 520, b_moc: 50, b_ngu: 80 }), 'tốt hơn (Sức mạnh tăng, hạ Mộc Tinh nhanh hơn, thêm Ngư Tinh) → được');
  await no(g1.doc('linhkhi_scores/u1').set({ ...sc, power: 400, b_moc: 50, b_ngu: 80 }), 'Sức mạnh giảm → từ chối');
  await no(g1.doc('linhkhi_scores/u1').set({ ...sc, power: 520, stars: 3, b_moc: 50, b_ngu: 80 }), 'sao giảm → từ chối');
  await no(g1.doc('linhkhi_scores/u1').set({ ...sc, power: 520, b_moc: 70, b_ngu: 80 }), 'thời gian trùm chậm hơn → từ chối');
  await no(g1.doc('linhkhi_scores/u1').set({ ...sc, power: 520, b_moc: 50 }), 'xoá kỷ lục trùm đã có → từ chối');
  await yes(g1.doc('linhkhi_scores/u1').set({ ...sc, name: 'Bé Na', power: 520, b_moc: 50, b_ngu: 80 }), 'đổi tên → được');
  for (const [m, bad] of [['tên 1 ký tự', { name: 'a' }], ['tên 17 ký tự', { name: 'a'.repeat(17) }], ['Sức mạnh quá lớn', { power: 2000000 }], ['Sức mạnh số lẻ', { power: 600.5 }],
    ['sao quá 90', { stars: 91 }], ['ải xa nhất quá 15', { far: 16 }], ['hero lạ', { hero: 'rong' }], ['hạ trùm dưới 5 giây', { b_ho: 2 }], ['trường lạ', { cheat: 1 }]]) {
    await no(g2.doc('linhkhi_scores/u2').set({ ...sc, ...bad }), m + ' → từ chối');
  }
  await no(g2.doc('linhkhi_scores/u2').set({ name: 'Khách', power: 1, stars: 0, far: 0, hero: 'smith' }), 'thiếu trường at → từ chối');

  console.log('• linhkhi_feedback');
  const fb = { kind: 'bug', text: 'Quái kẹt trong tường phòng đầu', contact: '', shot: '', ver: 'lk-1', where: 'Làng', scr: '844x390@3.0', ua: 'Android', at: 1, uid: 'u1', guest: true };
  await yes(g1.collection('linhkhi_feedback').add(fb), 'khách tạo góp ý hợp lệ');
  await no(g1.collection('linhkhi_feedback').add({ ...fb, uid: 'u2' }), 'uid sai người → từ chối');
  await no(g1.collection('linhkhi_feedback').add({ ...fb, text: 'ngắn' }), 'dưới 10 ký tự → từ chối');
  await no(g1.collection('linhkhi_feedback').add({ ...fb, text: 'x'.repeat(1001) }), 'quá 1000 ký tự → từ chối');
  await no(g1.collection('linhkhi_feedback').add({ ...fb, kind: 'spam' }), 'loại lạ → từ chối');
  await no(g1.collection('linhkhi_feedback').add({ ...fb, shot: 'x'.repeat(200001) }), 'ảnh quá lớn → từ chối');
  await no(g1.collection('linhkhi_feedback').add({ ...fb, status: 'done' }), 'người gửi tự đặt trạng thái → từ chối');
  await no(anon.collection('linhkhi_feedback').add(fb), 'chưa đăng nhập → không gửi được');
  await env.withSecurityRulesDisabled(async (c) => { await c.firestore().doc('linhkhi_feedback/a').set(fb); });
  const list = (db) => db.collection('linhkhi_feedback').orderBy('at', 'desc').limit(20).get();
  await yes(list(admin), 'quản trị (email đã xác minh) xem được');
  for (const [m, db] of [['email quản trị chưa xác minh', adminUnv], ['tài khoản khác', other], ['khách (cả người gửi)', g1], ['chưa đăng nhập', anon]]) {
    await no(list(db), m + ': không xem được');
    await no(db.doc('linhkhi_feedback/a').update({ status: 'seen' }), m + ': không đổi trạng thái được');
    await no(db.doc('linhkhi_feedback/a').delete(), m + ': không xoá được');
  }
  await yes(admin.doc('linhkhi_feedback/a').update({ status: 'seen', note: 'đã xem' }), 'quản trị đổi trạng thái + ghi chú');
  await no(admin.doc('linhkhi_feedback/a').update({ status: 'xoa' }), 'trạng thái lạ → từ chối');
  await no(admin.doc('linhkhi_feedback/a').update({ text: 'sửa lời người chơi' }), 'quản trị không sửa được nội dung người chơi');
  await yes(admin.doc('linhkhi_feedback/a').delete(), 'quản trị xoá được');
  console.log('• Luật của Thần Thoại Việt không đổi');
  await no(g1.collection('feedback').get(), 'feedback (Thần Thoại Việt): khách vẫn không đọc được');
  await yes(admin.collection('feedback').orderBy('at', 'desc').limit(5).get(), 'feedback (Thần Thoại Việt): quản trị vẫn đọc được');
  await no(g1.collection('rooms').get(), 'rooms vẫn cấm liệt kê');
  await env.cleanup();
  console.log('XONG: ' + n + ' mục đạt');
})().catch((e) => { console.error('HỎNG:', e && e.message || e); process.exit(1); });
