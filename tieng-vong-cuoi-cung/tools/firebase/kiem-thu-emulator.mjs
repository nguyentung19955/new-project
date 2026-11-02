// Phép thử lưu mây với Firebase Emulator THẬT (Auth + Firestore + firestore.rules) – chạy trên GitHub Actions:
//   npm i --no-save firebase@10.14.1 && npx firebase-tools@13 emulators:exec --only auth,firestore --project demo-tvcc "node tools/firebase/kiem-thu-emulator.mjs"
import {createRequire} from 'module';
import {initializeApp, deleteApp} from 'firebase/app';
import {getAuth, connectAuthEmulator, signInAnonymously, GoogleAuthProvider, linkWithCredential, signInWithCredential, reauthenticateWithCredential, signOut, getIdToken} from 'firebase/auth';
import * as S from 'firebase/firestore';
const require = createRequire(import.meta.url);
const {taoDongBo, taoCongFirestore, docToken, kiemPhien} = require('../../game/luu-may.js');
let hong = 0, dat = 0;
const ok = (dk, t, x) => { if (dk) dat++; else hong++; console.log((dk ? 'ĐẠT ' : 'HỎNG ') + t + (!dk && x !== undefined ? ' – ' + JSON.stringify(x) : '')); };
const khoGia = () => { const m = new Map(); return {getItem:k => m.has(k) ? m.get(k) : null, setItem:(k, v) => m.set(k, String(v)), removeItem:k => m.delete(k), key:i => [...m.keys()][i] ?? null, get length(){ return m.size; }, clear:() => m.clear()}; };
let n = 0;
async function moApp(){
  const app = initializeApp({apiKey:'demo', projectId:'demo-tvcc', appId:'demo'}, 'a' + (++n));
  const auth = getAuth(app); connectAuthEmulator(auth, 'http://127.0.0.1:9099', {disableWarnings:true});
  const db = S.getFirestore(app); S.connectFirestoreEmulator(db, '127.0.0.1', 8080);
  const u = (await signInAnonymously(auth)).user;
  return {app, db, uid:u.uid, cong:taoCongFirestore(S, db)};
}
const bi = async f => { try { await f(); return false; } catch (e){ return /permission|PERMISSION/.test(String(e && (e.code || e.message))); } };
const V = kho => JSON.parse(kho.getItem('tvcc-vung1') || '{}').manh;
try {
  const X = await moApp();
  // 2 "máy" cùng 1 người chơi (cùng uid)
  const kA = khoGia(), kB = khoGia();
  const A = taoDongBo({kho:kA, cong:X.cong}), B = taoDongBo({kho:kB, cong:X.cong});
  A.datUid(X.uid); B.datUid(X.uid); await A.keo(); await B.keo();
  kA.setItem('tvcc-vung1', '{"manh":5}'); kA.setItem('tvcc-chung', '{"hoi":1}');
  ok(await A.gui(), 'máy A gửi lên Firestore (đúng firestore.rules)');
  const s1 = await S.getDocFromServer(S.doc(X.db, 'nguoi_choi', X.uid, 'ban_luu', 'tvcc-vung1'));
  ok(s1.exists() && s1.data().revision === 1 && s1.data().capNhat, 'tài liệu ban_luu/tvcc-vung1 revision 1, có giờ máy chủ');
  ok((await S.getDocFromServer(S.doc(X.db, 'nguoi_choi', X.uid))).data().phienBan === 2, 'tài liệu người chơi phienBan 2');
  await B.keo(); ok(V(kB) === 5, 'máy B (máy mới) nhận tiến độ');
  kA.setItem('tvcc-vung1', '{"manh":10}'); kB.setItem('tvcc-vung1', '{"manh":20}');
  await A.gui(); const rB = await B.gui();
  const s2 = (await S.getDocFromServer(S.doc(X.db, 'nguoi_choi', X.uid, 'ban_luu', 'tvcc-vung1'))).data();
  ok(rB === false && JSON.parse(s2.du).manh === 10 && B.xungDot().includes('tvcc-vung1'), 'hai máy ghi cùng lúc: transaction chặn máy sau, báo xung đột', s2);
  B.chon('tvcc-vung1', 'thiet-bi'); await B.gui();
  const s3 = (await S.getDocFromServer(S.doc(X.db, 'nguoi_choi', X.uid, 'ban_luu', 'tvcc-vung1'))).data();
  ok(JSON.parse(s3.du).manh === 20 && s3.revision === 3 && JSON.parse(s3.saoLuuTruoc).manh === 10, 'chọn giữ bản máy: revision 3, bản cũ ở saoLuuTruoc', s3);
  kB.removeItem('tvcc-chung'); await B.gui();
  ok((await S.getDocFromServer(S.doc(X.db, 'nguoi_choi', X.uid, 'ban_luu', 'tvcc-chung'))).data().du === '', 'xoá bản lưu ghi du rỗng (rules không cho xoá tài liệu)');
  // quy tắc bảo mật
  const Y = await moApp();
  const tl = (db, u, k) => S.doc(db, 'nguoi_choi', u, 'ban_luu', k);
  const hop = (k, rev) => ({tenKhoa:k, du:'{}', revision:rev, capNhat:S.serverTimestamp(), thietBi:'x', saoLuuTruoc:''});
  ok(await bi(() => S.getDocFromServer(tl(Y.db, X.uid, 'tvcc-vung1'))), 'người khác KHÔNG đọc được bản lưu của mình');
  ok(await bi(() => S.setDoc(tl(Y.db, X.uid, 'tvcc-an'), hop('tvcc-an', 1))), 'người khác KHÔNG ghi được vào bản lưu của mình');
  ok(await bi(() => S.setDoc(tl(Y.db, Y.uid, 'tvcc-la'), hop('tvcc-la', 1))), 'khoá không có trong danh sách bị từ chối');
  ok(await bi(() => S.setDoc(tl(Y.db, Y.uid, 'tvcc-an'), hop('tvcc-an', 5))), 'tạo mới phải revision 1');
  ok(!(await bi(() => S.setDoc(tl(Y.db, Y.uid, 'tvcc-an'), hop('tvcc-an', 1)))), 'tạo đúng thì được');
  ok(await bi(() => S.setDoc(tl(Y.db, Y.uid, 'tvcc-an'), hop('tvcc-an', 3))), 'nhảy revision (1→3) bị từ chối');
  ok(await bi(() => S.setDoc(tl(Y.db, Y.uid, 'tvcc-an'), Object.assign(hop('tvcc-an', 2), {du:'x'.repeat(16001)}))), 'bản lưu quá 16000 ký tự bị từ chối');
  ok(await bi(() => S.setDoc(tl(Y.db, Y.uid, 'tvcc-an'), Object.assign(hop('tvcc-an', 2), {la:1}))), 'trường lạ bị từ chối');
  ok(await bi(() => S.deleteDoc(tl(Y.db, Y.uid, 'tvcc-an'))), 'không xoá được tài liệu');
  ok(await bi(() => S.setDoc(S.doc(Y.db, 'khac', 'x'), {a:1})), 'đường khác bị chặn');
  // (dangnhap) đăng nhập Google + auth_time (Auth Emulator nhận "id token Google" giả dạng JSON)
  const ngu = ms => new Promise(r => setTimeout(r, ms));
  const Z = await moApp(); const authZ = getAuth(Z.app);
  const tGuest = docToken(await getIdToken(authZ.currentUser, true));
  await ngu(2100);
  const gg = () => GoogleAuthProvider.credential(JSON.stringify({sub:'gg-tung-1', email:'tung@example.com', email_verified:true, name:'Tung'}));
  const lk = await linkWithCredential(authZ.currentUser, gg());
  let tLink = docToken(await getIdToken(lk.user, true));
  ok(lk.user.uid === Z.uid && lk.user.providerData.some(p => p.providerId === 'google.com'), 'gắn Google vào tài khoản khách: giữ nguyên UID (giữ tiến độ)');
  console.log('  ghi chú: auth_time khách ' + tGuest.authTime + ' → sau khi gắn Google ' + tLink.authTime + (tLink.authTime > tGuest.authTime ? ' (máy chủ làm mới auth_time)' : ' (KHÔNG làm mới → game xác thực lại)'));
  if (tLink.authTime <= tGuest.authTime){ await reauthenticateWithCredential(lk.user, gg()); tLink = docToken(await getIdToken(lk.user, true)); }
  ok(tLink.authTime > tGuest.authTime && tLink.nhaCungCap === 'google.com' && !kiemPhien(tLink, {bayGio:Date.now()}).hetHan, 'sau khi đăng nhập Google: auth_time mới, phiên còn hạn', tLink);
  await ngu(2100);
  const tRefresh = docToken(await getIdToken(lk.user, true));
  ok(tRefresh.authTime === tLink.authTime && tRefresh.iat > tLink.iat, 'token tự làm mới KHÔNG đổi auth_time (mốc 7 ngày không bị kéo dài)', {tRefresh, tLink});
  await signOut(authZ); await signInAnonymously(authZ);
  let tr = null; try { await linkWithCredential(authZ.currentUser, gg()); } catch (e){ tr = e; }
  ok(tr && tr.code === 'auth/credential-already-in-use' && GoogleAuthProvider.credentialFromError(tr), 'khách khác gắn Google đã dùng → credential-already-in-use, có credential để chuyển', tr && tr.code);
  const lai = await signInWithCredential(authZ, GoogleAuthProvider.credentialFromError(tr));
  const tLai = docToken(await getIdToken(lai.user, true));
  ok(lai.user.uid === Z.uid && tLai.authTime > tLink.authTime, 'đăng xuất rồi đăng nhập lại: cùng tài khoản, auth_time mới (tính lại 7 ngày)', {tLai, tLink});
  await deleteApp(Z.app);
  await deleteApp(X.app); await deleteApp(Y.app);
} catch (e){ hong++; console.log('HỎNG lỗi bất ngờ: ' + (e && (e.stack || e))); }
console.log(`\n${dat}/${dat + hong} đạt`); process.exit(hong ? 1 : 0);
