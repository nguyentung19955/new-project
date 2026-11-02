// "Firebase giả lập" dùng chung cho kiem-tra-trinh-duyet.js và kiem-tra-dang-nhap.js: thay 3 file SDK Firebase bằng bản giả
// nói chuyện với 1 kho dữ liệu nằm trong Node (đóng vai máy chủ Firestore + Auth). Không cần mạng, không cần dự án thật.
// Máy chủ giả cấp ID token (JWT không ký) có auth_time = lúc đăng nhập, iat = lúc cấp → phép thử chỉnh MC.authTime để giả "đăng nhập 8 ngày trước".
const SDK = 'https://gia-firebase.test/sdk/';
const CH = {apiKey:'gia', authDomain:'gia', projectId:'gia', appId:'gia', sdk:SDK, nhipGui:3000, choLocalhost:true};

const MC = {docs:{}, google:{}, authTime:{}, so:0, ghi:0, doc:0};
const P = a => a.join('/');
const giay = () => Math.floor(Date.now() / 1000);
const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
const laGoogle = uid => Object.values(MC.google).includes(uid);
function xuLy(op, a){
  if (op === 'anon'){ const uid = 'u' + (++MC.so); MC.authTime[uid] = giay(); return {uid, providerData:[]}; }
  if (op === 'get'){ MC.doc++; const d = MC.docs[P(a.p)]; return d ? JSON.parse(JSON.stringify(d)) : null; }
  if (op === 'tx'){ // a.w: [{p, d}] – kiểm như firestore.rules (revision tăng đúng 1, đúng chủ)
    for (const w of a.w){ const cu = MC.docs[P(w.p)]; if (w.p[1] !== a.uid) return {loi:'permission-denied'};
      if (w.p.length === 4 && w.d.revision !== (cu ? cu.revision : 0) + 1) return {loi:'permission-denied'};
      if (w.p.length === 2 && cu) return {loi:'permission-denied'}; }
    for (const w of a.w){ MC.ghi++; MC.docs[P(w.p)] = w.d; } return {};
  }
  if (op === 'link'){ const cu = MC.google[a.gid]; if (cu && cu !== a.uid) return {loi:'auth/credential-already-in-use'}; MC.google[a.gid] = a.uid; MC.authTime[a.uid] = giay();
    return {uid:a.uid, providerData:[{providerId:'google.com', email:a.gid + '@gmail.com', displayName:a.gid}]}; }
  if (op === 'cred'){ const uid = MC.google[a.gid]; MC.authTime[uid] = giay(); return {uid, providerData:[{providerId:'google.com', email:a.gid + '@gmail.com', displayName:a.gid}]}; }
  if (op === 'token'){ if (!(a.uid in MC.authTime)) return {loi:'auth/user-token-expired'};
    return {jwt:b64({alg:'none'}) + '.' + b64({auth_time:MC.authTime[a.uid], iat:giay(), exp:giay() + 3600, user_id:a.uid,
      firebase:{sign_in_provider:laGoogle(a.uid) ? 'google.com' : 'anonymous'}}) + '.gia'}; }
}
const APP = `export function initializeApp(c){ return {c}; }`;
// phiên đăng nhập giữ trong sessionStorage (giống Firebase giữ trong IndexedDB: xoá localStorage không mất đăng nhập)
const AUTH = `
const may = (op, a) => window.__mayGia(op, a || {});
const giu = u => { try { sessionStorage.setItem('gia-user', JSON.stringify(u)); } catch (e){} };
export function getAuth(){ window.__authGia = window.__authGia || null; const a0 = window.__authGia; if (a0) return a0;
  const a = {currentUser:null}; try { a.currentUser = JSON.parse(sessionStorage.getItem('gia-user')); } catch (e){} window.__authGia = a; return a; }
export const indexedDBLocalPersistence = 'indexedDB', browserLocalPersistence = 'local', browserSessionPersistence = 'session', inMemoryPersistence = 'memory', browserPopupRedirectResolver = 'popup';
export function initializeAuth(app, o){ window.__phienGia = (o && o.persistence) || []; return getAuth(); }
export function connectAuthEmulator(){}
export function onAuthStateChanged(auth, f){ setTimeout(() => f(auth.currentUser), 0); return () => {}; }
export async function signInAnonymously(auth){ if (window.__matMang) throw new Error('mất mạng'); const u = await may('anon'); auth.currentUser = u; giu(u); return {user:u}; }
export class GoogleAuthProvider { setCustomParameters(){} static credentialFromError(e){ return e.customData; } static credentialFromResult(){ return null; } }
const gid = () => window.__googleGia || 'nguoichoi';
export async function linkWithPopup(u, p){ if (window.__matMang) { const e = new Error('mạng'); e.code = 'auth/network-request-failed'; throw e; }
  const r = await may('link', {uid:u.uid, gid:gid()}); if (r.loi){ const e = new Error(r.loi); e.code = r.loi; e.customData = {gid:gid()}; throw e; } window.__authGia.currentUser = r; giu(r); return {user:r}; }
export async function signInWithPopup(auth, p){ return linkWithPopup(await signInAnonymously(auth).then(x => x.user), p); }
export async function signInWithCredential(auth, c){ const u = await may('cred', c); auth.currentUser = u; window.__authGia = auth; giu(u); return {user:u}; }
export async function reauthenticateWithCredential(){ throw new Error('không dùng'); }
export async function getRedirectResult(){ return null; }
export async function getIdToken(u, ep){ if (window.__matMang) throw new Error('mất mạng'); const r = await may('token', {uid:u.uid}); if (r.loi){ const e = new Error(r.loi); e.code = r.loi; throw e; }
  u.accessToken = r.jwt; return r.jwt; }
export async function signOut(auth){ auth.currentUser = null; sessionStorage.removeItem('gia-user'); }
`;
const FS = `
const may = (op, a) => window.__mayGia(op, a || {});
export function getFirestore(){ return {}; }
export function connectFirestoreEmulator(){}
export function doc(db, ...p){ return {p}; }
const chua = () => { if (window.__matMang) throw new Error('mất mạng'); };
export async function getDocFromServer(r){ chua(); const d = await may('get', {p:r.p}); return {exists:() => !!d, data:() => d}; }
export async function runTransaction(db, f){ chua(); const w = [];
  const tx = {get:async r => { const d = await may('get', {p:r.p}); return {exists:() => !!d, data:() => d}; }, set:(r, d) => { w.push({p:r.p, d:JSON.parse(JSON.stringify(d))}); }};
  const kq = await f(tx); chua();
  const uid = window.__authGia && window.__authGia.currentUser && window.__authGia.currentUser.uid;
  const r = await may('tx', {uid, w}); if (r.loi){ const e = new Error(r.loi); e.code = r.loi; throw e; } return kq; }
export function serverTimestamp(){ return {sv:'thoi-gian'}; }
`;
/* Tạo 1 "máy" (context trình duyệt) nối với máy chủ giả. o: {ch: cấu hình thêm | null = không cấu hình, chan: chặn tải SDK, viewport} */
async function mayMoi(b, loi, o){
  o = o || {};
  const ctx = await b.newContext({viewport:o.viewport || {width:960, height:540}});
  await ctx.exposeFunction('__mayGia', (op, a) => xuLy(op, a));
  await ctx.addInitScript(c => { window.TVCC_FIREBASE = c; }, o.ch === null ? {tat:true} : Object.assign({}, CH, o.ch || {}));
  await ctx.route(SDK + '**', r => {
    if (o.chan) return r.abort();
    const u = r.request().url(), body = u.endsWith('firebase-app.js') ? APP : u.endsWith('firebase-auth.js') ? AUTH : FS;
    r.fulfill({status:200, contentType:'text/javascript', body, headers:{'access-control-allow-origin':'*'}});
  });
  const pg = await ctx.newPage(); pg.on('pageerror', e => loi.push(e.message));
  return {ctx, pg};
}
module.exports = {SDK, CH, MC, xuLy, APP, AUTH, FS, mayMoi};
