// Kiểm DỰ ÁN FIREBASE THẬT (chạy trên GitHub Actions sau khi triển khai): đăng nhập khách → ghi/đọc 1 bản lưu thử
// bằng đúng mã của game → báo rõ chỗ nào chưa bật (Anonymous, Firestore, quy tắc). Không dùng gì trả phí.
import {createRequire} from 'module';
import {initializeApp} from 'firebase/app';
import {getAuth, signInAnonymously} from 'firebase/auth';
import * as S from 'firebase/firestore';
const require = createRequire(import.meta.url);
const fs = require('fs'), vm = require('vm');
const {taoDongBo, taoCongFirestore} = require('../../game/luu-may.js');
const g = {window:{}}; vm.runInNewContext(fs.readFileSync(new URL('../../game/firebase/cau-hinh.js', import.meta.url), 'utf8'), g);
const CH = g.window.TVCC_FIREBASE;
const kq = [];
const bao = (dat, t) => { kq.push((dat ? 'ĐẠT ' : 'CHƯA ') + t); console.log((dat ? 'ĐẠT ' : 'CHƯA ') + t); };
const app = initializeApp(CH);
let u = null;
try { u = (await signInAnonymously(getAuth(app))).user; bao(true, 'Authentication: đăng nhập khách (Anonymous) hoạt động'); }
catch (e){ bao(false, 'Authentication: chưa bật Anonymous (' + (e.code || e.message) + ') → Firebase Console ▸ Authentication ▸ Sign-in method ▸ Anonymous ▸ Enable'); }
if (u){
  const db = S.getFirestore(app), kho = new Map();
  const k = {getItem:x => kho.has(x) ? kho.get(x) : null, setItem:(x, v) => kho.set(x, String(v)), removeItem:x => kho.delete(x), key:i => [...kho.keys()][i] ?? null, get length(){ return kho.size; }};
  const D = taoDongBo({kho:k, cong:taoCongFirestore(S, db)}); D.datUid(u.uid);
  try {
    await D.keo(); bao(true, 'Firestore: đọc bản lưu của chính mình được');
    k.setItem('tvcc-an', '{"kiem_tra":true}');
    const r = await D.gui(); const s = await S.getDocFromServer(S.doc(db, 'nguoi_choi', u.uid, 'ban_luu', 'tvcc-an'));
    bao(r && s.exists() && s.data().revision === 1, 'Firestore: ghi bản lưu thử theo quy tắc mới (mỗi khoá 1 tài liệu, revision)');
  } catch (e){
    const ma = String(e && (e.code || e.message));
    if (/permission/i.test(ma)) bao(false, 'Firestore: QUY TẮC CHƯA CẬP NHẬT (' + ma + ') → Firestore Database ▸ Rules ▸ dán nội dung tieng-vong-cuoi-cung/firestore.rules ▸ Publish');
    else if (/not.found|NOT_FOUND|does not exist/i.test(ma)) bao(false, 'Firestore: chưa tạo cơ sở dữ liệu (' + ma + ') → Firestore Database ▸ Create database ▸ Production mode');
    else bao(false, 'Firestore: lỗi ' + ma);
  }
  try { await u.delete(); } catch (e){}   // xoá tài khoản khách dùng để kiểm
}
fs.writeFileSync('ket-qua-kiem-tra-that.txt', kq.join('\n') + '\n');
process.exit(0);
