// (dangnhap) Kiểm + bật đăng nhập Google trên DỰ ÁN FIREBASE THẬT bằng Identity Toolkit API (chạy trên GitHub Actions, dùng service account sẵn có).
//  - Google provider đã bật chưa (đang tắt mà đã có cấu hình → tự bật);
//  - Authorized domains có <dự án>.web.app và <dự án>.firebaseapp.com chưa (thiếu → tự thêm);
//  - đăng nhập khách (Anonymous) còn bật không.
// Không đủ quyền / chưa từng cấu hình Google → ghi hướng dẫn bấm tay. Không dùng gì trả phí.
// Chạy: GOOGLE_APPLICATION_CREDENTIALS=sa.json PROJECT=tieng-vong-cuoi-cun node tools/firebase/kiem-nha-cung-cap-google.mjs
import fs from 'fs';
import crypto from 'crypto';
const PROJECT = process.env.PROJECT || 'tieng-vong-cuoi-cun';
const kq = [];
const bao = (muc, t) => { const d = muc + ' ' + t; kq.push(d); console.log(d); };
const xong = () => { fs.writeFileSync('ket-qua-google.txt', kq.join('\n') + '\n'); process.exit(0); };
const CONSOLE = `https://console.firebase.google.com/project/${PROJECT}/authentication/providers`;
let sa;
try { sa = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8')); } catch (e){ bao('CHƯA', 'không đọc được service account'); xong(); }
const b64 = x => Buffer.from(typeof x === 'string' ? x : JSON.stringify(x)).toString('base64url');
async function layVe(){
  const now = Math.floor(Date.now() / 1000);
  const dau = b64({alg:'RS256', typ:'JWT'}) + '.' + b64({iss:sa.client_email, scope:'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/firebase',
    aud:'https://oauth2.googleapis.com/token', iat:now, exp:now + 3600});
  const ky = crypto.createSign('RSA-SHA256').update(dau).sign(sa.private_key).toString('base64url');
  const r = await fetch('https://oauth2.googleapis.com/token', {method:'POST', headers:{'content-type':'application/x-www-form-urlencoded'},
    body:'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + dau + '.' + ky});
  const j = await r.json(); if (!j.access_token) throw new Error('token: ' + JSON.stringify(j)); return j.access_token;
}
const API = `https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT}`;
let ve;
async function goi(dd, o){
  const r = await fetch(API + dd, Object.assign({}, o, {headers:Object.assign({authorization:'Bearer ' + ve, 'content-type':'application/json', 'x-goog-user-project':PROJECT}, (o || {}).headers)}));
  const j = await r.json().catch(() => ({})); return {ok:r.ok, ma:r.status, j};
}
try { ve = await layVe(); } catch (e){ bao('CHƯA', 'không lấy được quyền từ service account: ' + e.message); xong(); }

// 1. cấu hình chung: tên miền được phép + khách
const cf = await goi('/config');
if (!cf.ok){
  bao('CHƯA', `service account không đọc được cấu hình Authentication (HTTP ${cf.ma} ${cf.j.error && cf.j.error.status || ''}) → cần vai trò "Firebase Authentication Admin" HOẶC kiểm tay: ${CONSOLE}`);
} else {
  const ds = cf.j.authorizedDomains || [], can = [`${PROJECT}.web.app`, `${PROJECT}.firebaseapp.com`], thieu = can.filter(d => !ds.includes(d));
  if (!thieu.length) bao('ĐẠT', 'Authorized domains có ' + can.join(' và '));
  else {
    const p = await goi('/config?updateMask=authorizedDomains', {method:'PATCH', body:JSON.stringify({authorizedDomains:[...ds, ...thieu]})});
    bao(p.ok ? 'ĐẠT' : 'CHƯA', p.ok ? 'đã tự thêm Authorized domains: ' + thieu.join(', ') : `thiếu Authorized domains ${thieu.join(', ')} và không tự thêm được (HTTP ${p.ma}) → Authentication ▸ Settings ▸ Authorized domains ▸ Add domain`);
  }
  const an = cf.j.signIn && cf.j.signIn.anonymous && cf.j.signIn.anonymous.enabled;
  bao(an ? 'ĐẠT' : 'CHƯA', an ? 'đăng nhập khách (Anonymous) đang bật' : 'Anonymous đang TẮT → bật lại ở ' + CONSOLE);
}
// 2. nhà cung cấp Google
const gg = await goi('/defaultSupportedIdpConfigs/google.com');
if (gg.ok && gg.j.enabled) bao('ĐẠT', 'Google sign-in đang BẬT (clientId ' + String(gg.j.clientId || '').slice(0, 12) + '…)');
else if (gg.ok && gg.j.clientId){
  const p = await goi('/defaultSupportedIdpConfigs/google.com?updateMask=enabled', {method:'PATCH', body:JSON.stringify({enabled:true})});
  bao(p.ok ? 'ĐẠT' : 'CHƯA', p.ok ? 'Google sign-in đang tắt → ĐÃ TỰ BẬT' : `Google sign-in đang tắt, không tự bật được (HTTP ${p.ma}) → ${CONSOLE} ▸ Google ▸ Enable ▸ chọn email hỗ trợ ▸ Save`);
} else if (gg.ma === 404){
  bao('CHƯA', `Google sign-in CHƯA BẬT (chưa từng cấu hình – cần bấm tay 1 lần để Google tự tạo OAuth client) → ${CONSOLE} ▸ Add new provider ▸ Google ▸ Enable ▸ chọn email hỗ trợ ▸ Save`);
} else bao('CHƯA', `không đọc được cấu hình Google (HTTP ${gg.ma} ${gg.j.error && gg.j.error.status || ''}) → kiểm tay: ${CONSOLE}`);
xong();
