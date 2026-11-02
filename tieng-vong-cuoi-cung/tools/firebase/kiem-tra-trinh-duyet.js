// Kiểm lưu mây trong trình duyệt thật (Playwright) với "Firebase giả lập": thay 3 file SDK Firebase bằng bản giả
// nói chuyện với 1 kho dữ liệu nằm trong Node (đóng vai máy chủ Firestore + Auth). Không cần mạng, không cần dự án thật.
// Chạy: (cd tieng-vong-cuoi-cung && python3 -m http.server 8765 &) ; node tools/firebase/kiem-tra-trinh-duyet.js
const {chromium} = require('playwright');
const GOC = 'http://localhost:8765/game/';
const SDK = 'https://gia-firebase.test/sdk/';
const CH = {apiKey:'gia', authDomain:'gia', projectId:'gia', appId:'gia', sdk:SDK, nhipGui:3000};

// ---- "máy chủ" giả ----
const MC = {docs:{}, google:{}, so:0, ghi:0, doc:0};
function xuLy(op, a){
  if (op === 'anon'){ return {uid:'u' + (++MC.so), providerData:[]}; }
  if (op === 'get'){ MC.doc++; const d = MC.docs[a.uid]; return d ? JSON.parse(JSON.stringify(d)) : null; }
  if (op === 'set'){ MC.ghi++; const d = MC.docs[a.uid] || (MC.docs[a.uid] = {}); for (const [k, v] of Object.entries(a.d)){ if (v && typeof v === 'object' && !Array.isArray(v) && (k === 'khoa' || k === 'saoLuu')) d[k] = Object.assign(d[k] || {}, v); else d[k] = v; } return true; }
  if (op === 'link'){ const cu = MC.google[a.gid]; if (cu && cu !== a.uid) return {loi:'auth/credential-already-in-use'}; MC.google[a.gid] = a.uid; return {uid:a.uid, providerData:[{providerId:'google.com', email:a.gid + '@gmail.com', displayName:a.gid}]}; }
  if (op === 'cred'){ return {uid:MC.google[a.gid], providerData:[{providerId:'google.com', email:a.gid + '@gmail.com', displayName:a.gid}]}; }
}
const APP = `export function initializeApp(c){ return {c}; }`;
// phiên đăng nhập giữ trong sessionStorage (giống Firebase giữ trong IndexedDB: xoá localStorage không mất đăng nhập)
const AUTH = `
const may = (op, a) => window.__mayGia(op, a || {});
const giu = u => { try { sessionStorage.setItem('gia-user', JSON.stringify(u)); } catch (e){} };
export function getAuth(){ const a = {currentUser:null}; try { a.currentUser = JSON.parse(sessionStorage.getItem('gia-user')); } catch (e){} return a; }
export function connectAuthEmulator(){}
export function onAuthStateChanged(auth, f){ setTimeout(() => f(auth.currentUser), 0); return () => {}; }
export async function signInAnonymously(auth){ const u = await may('anon'); auth.currentUser = u; giu(u); return {user:u}; }
export class GoogleAuthProvider { static credentialFromError(e){ return e.customData; } }
const gid = () => window.__googleGia || 'nguoichoi';
export async function linkWithPopup(u, p){ const r = await may('link', {uid:u.uid, gid:gid()}); if (r.loi){ const e = new Error(r.loi); e.code = r.loi; e.customData = {gid:gid()}; throw e; } window.__authGia.currentUser = r; giu(r); return {user:r}; }
export async function signInWithPopup(auth, p){ return linkWithPopup(await signInAnonymously(auth).then(x => x.user), p); }
export async function signInWithCredential(auth, c){ const u = await may('cred', c); auth.currentUser = u; window.__authGia = auth; giu(u); return {user:u}; }
export async function signOut(auth){ auth.currentUser = null; sessionStorage.removeItem('gia-user'); }
const _g = getAuth; export { _g as _getAuth };
`.replace('export function getAuth(){', 'export function getAuth(){ window.__authGia = window.__authGia || null; const a0 = window.__authGia; if (a0) return a0;').replace('return a; }', 'window.__authGia = a; return a; }');
const FS = `
const may = (op, a) => window.__mayGia(op, a || {});
export function getFirestore(){ return {}; }
export function connectFirestoreEmulator(){}
export function doc(db, c, id){ return {c, id}; }
export async function getDoc(r){ if (window.__matMang) throw new Error('mất mạng'); const d = await may('get', {uid:r.id}); return {exists:() => !!d, data:() => d}; }
export async function setDoc(r, d, o){ if (window.__matMang) throw new Error('mất mạng'); d = JSON.parse(JSON.stringify(d)); return may('set', {uid:r.id, d}); }
export function serverTimestamp(){ return {sv:'thoi-gian'}; }
`;
let hong = 0, dat = 0;
const ok = (dk, t, x) => { if (dk) dat++; else hong++; console.log((dk ? 'ĐẠT ' : 'HỎNG ') + t + (x !== undefined ? ' – ' + JSON.stringify(x) : '')); };

(async () => {
  const b = await chromium.launch(), loi = [];
  async function mayMoi(o){
    o = o || {};
    const ctx = await b.newContext({viewport:{width:960, height:540}});
    await ctx.exposeFunction('__mayGia', (op, a) => xuLy(op, a));
    if (o.ch !== null) await ctx.addInitScript(c => { window.TVCC_FIREBASE = c; }, Object.assign({}, CH, o.ch || {}));
    await ctx.route(SDK + '**', r => {
      if (o.chan) return r.abort();
      const u = r.request().url(), body = u.endsWith('firebase-app.js') ? APP : u.endsWith('firebase-auth.js') ? AUTH : FS;
      r.fulfill({status:200, contentType:'text/javascript', body, headers:{'access-control-allow-origin':'*'}});
    });
    const pg = await ctx.newPage(); pg.on('pageerror', e => loi.push(e.message));
    return {ctx, pg};
  }
  const vao = async (pg, q) => { await pg.goto(GOC + 'vung-1/index.html?tu=1' + (q || '')); await pg.waitForFunction(() => window.TV && (TV.xong || TV.loi), null, {timeout:30000}); };
  const luuMay = () => { for (const d of Object.values(MC.docs)) if (d.khoa && d.khoa['tvcc-vung1']) return d; return null; };
  const manhMay = uid => { const d = MC.docs[uid]; return d && d.khoa['tvcc-vung1'] ? JSON.parse(d.khoa['tvcc-vung1'].du).manh : null; };

  // 1. máy A: chơi mới, nhặt Mảnh Âm, lưu → lên mây
  const A = await mayMoi(); await vao(A.pg);
  const ttA = await A.pg.evaluate(() => LuuMay.trangThai); ok(ttA === 'an-danh', 'tự đăng nhập ẩn danh', ttA);
  await A.pg.evaluate(() => TV.choi(true)); await A.pg.waitForTimeout(300);
  await A.pg.evaluate(() => { G.luu.manh = 77; V1.ghiLuu(); return LuuMay.guiNgay(); });
  const uidA = await A.pg.evaluate(() => LuuMay._dongBo.uid());
  ok(manhMay(uidA) === 77, 'lưu Vùng 1 lên mây (Mảnh Âm = 77)', manhMay(uidA));
  ok(MC.docs[uidA].khoa['tvcc-chung'], 'lưu chung (tvcc-chung) cũng lên mây');
  // 2. xoá localStorage, tải lại → tiến độ về
  await A.pg.evaluate(() => localStorage.clear());
  await vao(A.pg);
  const sauXoa = await A.pg.evaluate(() => ({co:V1.coLuu(), manh:JSON.parse(localStorage.getItem('tvcc-vung1') || '{}').manh, nut:!document.getElementById('b-tiep').disabled}));
  ok(sauXoa.co && sauXoa.manh === 77 && sauXoa.nut, 'xoá localStorage + tải lại: tiến độ về từ mây, nút Tiếp tục bật', sauXoa);
  // 3. tự gửi định kỳ (không gọi guiNgay)
  await A.pg.evaluate(() => TV.choi(false)); await A.pg.waitForTimeout(300);
  await A.pg.evaluate(() => { G.luu.manh = 88; V1.ghiLuu(); });
  await A.pg.waitForTimeout(4500);
  ok(manhMay(uidA) === 88, 'tự gửi lên sau vài giây khi game ghi lưu', manhMay(uidA));
  // 4. gắn Google ở máy A, rồi máy B (máy khác) đăng nhập cùng Google → nhận tiến độ
  await vao(A.pg);
  const gA = await A.pg.evaluate(() => LuuMay.dangNhapGoogle().then(ok => ({ok, tt:LuuMay.trangThai, mo:LuuMay.moTa()})));
  ok(gA.ok && gA.tt === 'google', 'máy A gắn tài khoản Google (giữ nguyên tiến độ)', gA);
  const B = await mayMoi(); await vao(B.pg);
  ok(await B.pg.evaluate(() => !V1.coLuu()), 'máy B mới: chưa có bản lưu');
  const gB = await B.pg.evaluate(() => LuuMay.dangNhapGoogle().then(ok => ({ok, uid:LuuMay._dongBo.uid(), loi:LuuMay.loi})));
  ok(gB.ok && gB.uid === uidA, 'máy B đăng nhập cùng Google → chuyển sang bản lưu của máy A', gB);
  await vao(B.pg);
  const mB = await B.pg.evaluate(() => JSON.parse(localStorage.getItem('tvcc-vung1') || '{}').manh);
  ok(mB === 88, 'máy B tải lại: có tiến độ của máy A (Mảnh Âm 88)', mB);
  // 5. xung đột: B chơi tiếp (99) sau A → A mở lại nhận 99, bản cũ giữ dự phòng
  await B.pg.evaluate(() => TV.choi(false)); await B.pg.waitForTimeout(300);
  await B.pg.evaluate(() => { G.luu.manh = 99; V1.ghiLuu(); return LuuMay.guiNgay(); });
  await vao(A.pg);
  const mA = await A.pg.evaluate(() => JSON.parse(localStorage.getItem('tvcc-vung1')).manh);
  ok(mA === 99 && MC.docs[uidA].saoLuu && MC.docs[uidA].saoLuu['tvcc-vung1'], 'hai máy: bản chơi sau cùng thắng, bản cũ giữ dự phòng', {mA});
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
  // 8. chưa cấu hình Firebase (như hiện giờ): lưu mây tắt, menu không hiện dòng lưu mây
  const D = await mayMoi({ch:null}); await vao(D.pg, '&moi=1');
  const dd = await D.pg.evaluate(() => ({tt:LuuMay.trangThai, an:document.getElementById('may-tt').hidden}));
  ok(dd.tt === 'tat' && dd.an, 'chưa có cấu hình: lưu mây tắt, chỉ lưu máy', dd);
  await D.pg.evaluate(() => TV.choi(true)); await D.pg.waitForTimeout(300);
  ok(await D.pg.evaluate(() => V1.coLuu()), '…và vẫn lưu máy bình thường');
  // 9. trang chọn mở được
  await D.pg.goto(GOC); ok((await D.pg.locator('a').count()) >= 3, 'trang chọn game/ có liên kết Làng, Vùng 1, Phòng demo');
  ok(loi.length === 0, 'không lỗi JS', loi);
  console.log(`\n${dat}/${dat + hong} đạt · máy chủ giả: ${MC.ghi} lần ghi, ${MC.doc} lần đọc`);
  await b.close(); process.exit(hong ? 1 : 0);
})();
