'use strict';
/* luu-may.js – LƯU MÂY bằng Firebase (phiên "Lưu game bằng Firebase", mã firebase).
   Ý tưởng: game vẫn lưu localStorage y như cũ (nguồn chính, chơi offline được). File này chỉ ĐỒNG BỘ
   các khoá localStorage bắt đầu bằng 'tvcc-' (tvcc-vung1, tvcc-chung, tvcc-he-thong…) lên/xuống
   Firestore, tài liệu nguoi_choi/{uid}. Không có cấu hình Firebase / không có mạng / trang bị chặn mạng
   (vd chạy trong Artifact của claude.ai) → tự tắt, KHÔNG báo lỗi, game chạy bằng localStorage như cũ.

   Dùng trong trang:
     <script src="../firebase/cau-hinh.js"></script>   (window.TVCC_FIREBASE = {...} hoặc null)
     <script src="../luu-may.js"></script>
     ...trước khi game đọc bản lưu:  if (window.LuuMay) await LuuMay.cho(2500);
     ...sau mỗi lần ghi (không bắt buộc, chỉ để gửi sớm): LuuMay.daGhi('tvcc-vung1')
   Đăng nhập: tự đăng nhập ẨN DANH; LuuMay.dangNhapGoogle() để gắn tài khoản Google (giữ tiến độ khi đổi máy).
   Xung đột 2 máy: theo từng khoá, bản SỬA SAU CÙNG thắng; bản bị đè được giữ 1 bản dự phòng
   (trên máy: 'tvcc-may-sao-luu'; trên mây: trường saoLuu).
   Node (phép thử): require('./luu-may.js').taoDongBo({kho, cong, gio}). */
(function(goc){
  const TIEN_TO = 'tvcc-', BO_QUA = 'tvcc-may-', KHOA_META = 'tvcc-may-meta', KHOA_SAO = 'tvcc-may-sao-luu';
  const PHIEN_BAN = 1, BO_SUU_TAP = 'nguoi_choi';

  function bam(s){ // băm chuỗi ngắn gọn để so sánh (FNV-1a 32 bit)
    if (s === null || s === undefined) return '-';
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return h.toString(36) + ':' + s.length;
  }

  /* ---------- LÕI ĐỒNG BỘ (không phụ thuộc Firebase; thử được bằng Node) ----------
     kho: giống localStorage (getItem/setItem/removeItem/key/length)
     cong: {layVe(uid) -> Promise<{khoa:{k:{du,t}}}|null>, guiLen(uid, vaQua) -> Promise}
     gio: () => mili giây hiện tại */
  function taoDongBo(o){
    const kho = o.kho, gio = o.gio || (() => Date.now());
    let cong = o.cong || null, uid = null;
    let meta = docMeta();
    const ban = new Set();          // khoá cần gửi lên
    const giuLai = new Set();       // khoá trên mây mới hơn nhưng game đã đọc rồi → không gửi đè cho tới khi game ghi lại
    let daDoc = false;              // game đã đọc bản lưu (sau cho()) → không ghi đè localStorage nữa
    let daKeo = false;              // đã kéo bản mây thành công ít nhất 1 lần (chưa kéo được thì KHÔNG gửi để khỏi đè tiến độ trên mây)
    let mayCu = {};                 // bản mây lần kéo gần nhất {k:{du,t}}
    const sk = o.suKien || (() => {});

    function docMeta(){
      try { const m = JSON.parse(kho.getItem(KHOA_META) || 'null'); if (m && m.phien_ban === PHIEN_BAN) return m; } catch (e){}
      return {phien_ban:PHIEN_BAN, t:{}, biet:{}, moi:true};
    }
    function ghiMeta(){ try { kho.setItem(KHOA_META, JSON.stringify(meta)); } catch (e){} }
    function dsKhoa(){
      const ds = [];
      try { for (let i = 0; i < kho.length; i++){ const k = kho.key(i); if (k && k.startsWith(TIEN_TO) && !k.startsWith(BO_QUA)) ds.push(k); } } catch (e){}
      return ds;
    }
    function doc(k){ try { return kho.getItem(k); } catch (e){ return null; } }

    /* Quét localStorage: khoá nào đổi so với lần trước → đánh dấu thời điểm sửa + cần gửi. */
    function quet(){
      // khoá meta biến mất = localStorage bị xoá sạch (xoá dữ liệu trang web) → KHÔNG coi là "người chơi xoá bản lưu",
      // bắt đầu lại như máy mới để bản trên mây được lấy về
      if (!meta.moi && doc(KHOA_META) === null){ meta = {phien_ban:PHIEN_BAN, t:{}, biet:{}, moi:true}; ban.clear(); giuLai.clear(); }
      const lanDau = !!meta.moi; let doi = false;
      const ds = new Set(dsKhoa().concat(Object.keys(meta.biet)));
      for (const k of ds){
        const h = bam(doc(k));
        if (meta.biet[k] === h) continue;
        if (h === '-' && meta.biet[k] === undefined) continue;
        meta.biet[k] = h;
        // lần đầu chạy lưu mây: bản lưu cũ trên máy coi là "rất cũ" (t=0) để bản trên mây (nếu có) được ưu tiên
        meta.t[k] = lanDau ? 0 : gio();
        giuLai.delete(k); ban.add(k); doi = true;
      }
      if (lanDau){ delete meta.moi; doi = true; }
      if (doi) ghiMeta();
      return doi;
    }

    function saoLuuMay(k, du, t){
      try { const s = JSON.parse(doc(KHOA_SAO) || '{}'); s[k] = {du, t, luc:gio()}; kho.setItem(KHOA_SAO, JSON.stringify(s)); } catch (e){}
    }

    /* Ghép bản mây vào máy. Trả về {apDung:[...], gui:[...], giu:[...]} */
    function hopNhat(may){
      const kq = {apDung:[], gui:[], giu:[]};
      const khoaMay = (may && may.khoa) || {};
      mayCu = khoaMay;
      const tatCa = new Set(Object.keys(khoaMay).concat(dsKhoa(), Object.keys(meta.biet)));
      for (const k of tatCa){
        if (!k.startsWith(TIEN_TO) || k.startsWith(BO_QUA)) continue;
        const c = khoaMay[k], dl = doc(k), hl = bam(dl), tl = meta.t[k] || 0;
        const hc = c ? bam(c.du) : '-', tc = c ? (c.t || 0) : -1;
        if (hc === hl){ if (c){ meta.t[k] = Math.max(tl, tc); } ban.delete(k); continue; }
        if (c && (tc > tl || tl === 0)){   // t=0: bản máy có từ trước khi bật lưu mây → nhường bản mây
          if (daDoc){ giuLai.add(k); ban.delete(k); kq.giu.push(k); continue; }
          if (dl !== null) saoLuuMay(k, dl, tl);
          try { if (c.du === null || c.du === undefined) kho.removeItem(k); else kho.setItem(k, c.du); } catch (e){}
          meta.t[k] = tc; meta.biet[k] = hc; ban.delete(k); kq.apDung.push(k);
        } else { ban.add(k); kq.gui.push(k); }
      }
      ghiMeta();
      return kq;
    }

    async function keo(){
      if (!cong || !uid) return null;
      const may = await cong.layVe(uid);
      quet();
      const kq = hopNhat(may);
      daKeo = true;
      sk('keo', kq);
      return kq;
    }

    let dangGui = null;
    async function gui(){
      if (!cong || !uid || !daKeo) return false;
      quet();
      if (![...ban].some(k => !giuLai.has(k))) return true;
      if (dangGui) return dangGui;
      dangGui = guiThat().catch(e => { sk('loi', e); return false; }).finally(() => { dangGui = null; });
      return dangGui;
    }
    async function guiThat(){
      // đọc lại bản mây ngay trước khi ghi: máy khác vừa ghi mới hơn thì không đè (và biết đúng bản nào bị đè để giữ dự phòng)
      hopNhat(await cong.layVe(uid));
      const ds = [...ban].filter(k => !giuLai.has(k));
      if (!ds.length) return true;
      const vaQua = {khoa:{}, saoLuu:{}};
      for (const k of ds){
        const du = doc(k);
        vaQua.khoa[k] = {du: du === null ? null : du, t: meta.t[k] || gio()};
        const c = mayCu[k];
        if (c && bam(c.du) !== bam(du)) vaQua.saoLuu[k] = c;   // giữ 1 bản dự phòng của bản bị đè trên mây
      }
      if (!Object.keys(vaQua.saoLuu).length) delete vaQua.saoLuu;
      await cong.guiLen(uid, vaQua);
      for (const k of ds){ if (bam(doc(k)) === bam(vaQua.khoa[k].du)) ban.delete(k); mayCu[k] = vaQua.khoa[k]; }
      sk('gui', ds); return true;
    }

    quet();
    return {
      quet, keo, gui, hopNhat,
      datCong(c){ cong = c; },
      datUid(u){ if (u !== uid){ uid = u; daKeo = false; mayCu = {}; } },
      uid: () => uid,
      khoaDoc(){ daDoc = true; },
      daKeo: () => daKeo,
      canGui: () => [...ban].filter(k => !giuLai.has(k)),
      giuLai: () => [...giuLai],
      meta: () => JSON.parse(JSON.stringify(meta))
    };
  }

  if (typeof module !== 'undefined' && module.exports){ module.exports = {taoDongBo, bam, TIEN_TO, KHOA_META, KHOA_SAO, BO_SUU_TAP}; return; }

  /* ---------- PHẦN TRÌNH DUYỆT ---------- */
  const W = goc;
  const Q = (() => { try { return new URLSearchParams(location.search); } catch (e){ return new URLSearchParams(''); } })();
  let ls = null; try { ls = W.localStorage; ls.getItem('x'); } catch (e){ ls = null; }
  const CH = W.TVCC_FIREBASE || null;
  const nghe = new Set();
  const LM = {
    trangThai: 'tat',        // tat | dang-ket-noi | an-danh | google | ngoai-tuyen | loi
    loi: '', ten: '', email: '',
    nghe(f){ nghe.add(f); try { f(LM); } catch (e){} return () => nghe.delete(f); },
    cho: () => Promise.resolve(false),
    daGhi(){}, guiNgay: () => Promise.resolve(false),
    dangNhapGoogle: () => Promise.resolve(false),
    dangXuat: () => Promise.resolve(false),
    coMay: () => false,
    moTa(){
      return {tat:'Lưu trên máy này', 'dang-ket-noi':'Đang kết nối lưu mây…', 'an-danh':'Đã lưu mây (khách)',
        google:'Đã lưu mây: ' + (LM.email || LM.ten || 'Google'), 'ngoai-tuyen':'Không có mạng – lưu trên máy, sẽ gửi lên sau',
        loi:'Lưu mây lỗi – vẫn lưu trên máy'}[LM.trangThai] || '';
    }
  };
  W.LuuMay = LM;
  function bao(tt, loi){ if (tt) LM.trangThai = tt; if (loi !== undefined) LM.loi = String(loi || ''); for (const f of nghe){ try { f(LM); } catch (e){} } }

  const tatHan = !ls || !CH || !CH.apiKey || Q.get('may') === '0' || !/^https?:$/.test(location.protocol);
  if (tatHan) return;

  const DB = taoDongBo({kho: ls, suKien(loai, x){ if (loai === 'loi') bao(navigator.onLine === false ? 'ngoai-tuyen' : 'loi', x && x.message || x); else if (LM.trangThai === 'ngoai-tuyen' || LM.trangThai === 'loi') bao(LM._tt || 'an-danh', ''); if (loai === 'keo' && x.giu.length) bao(null, 'Có bản lưu mới hơn trên mây – tải lại trang để dùng'); }});
  LM._dongBo = DB;
  LM.coMay = () => true;

  const SDK = (CH.sdk || 'https://www.gstatic.com/firebasejs/10.14.1/').replace(/\/?$/, '/');
  const henGio = (p, ms, ten) => Promise.race([p, new Promise((_, b) => setTimeout(() => b(new Error('quá giờ: ' + ten)), ms))]);
  let F = null;   // {app, auth, db, A (module auth), S (module firestore)}

  async function napSdk(){
    const [mA, mAuth, mS] = await henGio(Promise.all([import(SDK + 'firebase-app.js'), import(SDK + 'firebase-auth.js'), import(SDK + 'firebase-firestore.js')]), 10000, 'tải Firebase');
    const app = mA.initializeApp({apiKey:CH.apiKey, authDomain:CH.authDomain, projectId:CH.projectId, appId:CH.appId, storageBucket:CH.storageBucket, messagingSenderId:CH.messagingSenderId});
    const auth = mAuth.getAuth(app);
    const db = mS.getFirestore(app);
    if (CH.emulator){ mAuth.connectAuthEmulator(auth, 'http://' + CH.emulator.auth, {disableWarnings:true}); mS.connectFirestoreEmulator(db, CH.emulator.firestore.split(':')[0], +CH.emulator.firestore.split(':')[1]); }
    F = {app, auth, db, A:mAuth, S:mS};
    DB.datCong({
      async layVe(u){ const s = await henGio(mS.getDoc(mS.doc(db, BO_SUU_TAP, u)), 8000, 'đọc mây'); return s.exists() ? s.data() : null; },
      async guiLen(u, vaQua){
        const d = Object.assign({phienBan:PHIEN_BAN, capNhat:mS.serverTimestamp()}, vaQua);
        await henGio(mS.setDoc(mS.doc(db, BO_SUU_TAP, u), d, {merge:true}), 10000, 'ghi mây');
      }
    });
    return F;
  }

  function capNhatNguoi(u){
    if (!u){ LM.ten = LM.email = ''; return; }
    const g = (u.providerData || []).find(p => p.providerId === 'google.com');
    LM._tt = g ? 'google' : 'an-danh'; LM.ten = g ? (g.displayName || '') : ''; LM.email = g ? (g.email || '') : '';
  }

  async function vaoUid(u){
    capNhatNguoi(u); DB.datUid(u.uid);
    await DB.keo(); bao(LM._tt, LM.loi);
    await DB.gui();
  }

  let xongKeo; const henKeo = new Promise(r => { xongKeo = r; });
  async function batDau(){
    bao('dang-ket-noi');
    try {
      await napSdk();
      const u = await henGio(new Promise(r => { const bo = F.A.onAuthStateChanged(F.auth, x => { bo(); r(x); }); }), 8000, 'đăng nhập');
      const nguoi = u || (await henGio(F.A.signInAnonymously(F.auth), 8000, 'đăng nhập ẩn danh')).user;
      await vaoUid(nguoi);
      xongKeo(true);
    } catch (e){
      xongKeo(false);
      bao(navigator.onLine === false ? 'ngoai-tuyen' : 'loi', e && e.message || e);
      if (!F) return;                 // không tải được SDK (bị chặn mạng) → dừng hẳn, chỉ lưu máy
    }
  }

  // gửi định kỳ (gom nhiều lần ghi thành 1 lần để tiết kiệm hạn mức miễn phí)
  const NHIP = Math.max(3000, +(CH.nhipGui || 10000));
  let henGui = null;
  function hen(ms){ if (henGui) return; henGui = setTimeout(() => { henGui = null; if (DB.daKeo()) DB.gui(); }, ms); }
  setInterval(() => { if (DB.quet() || DB.canGui().length) hen(0); }, NHIP);
  LM.daGhi = () => { DB.quet(); hen(NHIP); };
  LM.guiNgay = () => DB.gui();
  const xa = () => { try { if (DB.quet() || DB.canGui().length) DB.gui(); } catch (e){} };
  W.addEventListener('pagehide', xa);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') xa(); });
  W.addEventListener('online', () => { if (!F) return; if (!DB.daKeo() && F.auth.currentUser) vaoUid(F.auth.currentUser).catch(() => {}); else DB.gui(); });
  W.addEventListener('offline', () => bao('ngoai-tuyen'));

  /* Chờ bản mây (tối đa ms) trước khi game đọc bản lưu. Hết giờ thì chơi bằng bản máy. */
  LM.cho = (ms) => henGio(henKeo, ms || 2500, 'chờ mây').catch(() => false).then(v => { DB.khoaDoc(); return v; });

  LM.dangNhapGoogle = async () => {
    if (!F) return false;
    const P = new F.A.GoogleAuthProvider();
    try {
      const cu = F.auth.currentUser;
      const kq = cu ? await F.A.linkWithPopup(cu, P) : await F.A.signInWithPopup(F.auth, P);
      await vaoUid(kq.user); return true;
    } catch (e){
      const ma = e && e.code || '';
      if (ma === 'auth/credential-already-in-use' || ma === 'auth/email-already-in-use'){
        // tài khoản Google này đã có bản lưu từ máy khác → chuyển sang nó, ghép theo "sửa sau cùng thắng"
        const cred = F.A.GoogleAuthProvider.credentialFromError(e);
        if (cred){ const kq = await F.A.signInWithCredential(F.auth, cred); await vaoUid(kq.user); return true; }
      }
      bao(null, ma || (e && e.message)); return false;
    }
  };
  LM.dangXuat = async () => { if (!F) return false; await DB.gui(); await F.A.signOut(F.auth); const r = await F.A.signInAnonymously(F.auth); await vaoUid(r.user); return true; };

  batDau();
})(typeof window !== 'undefined' ? window : globalThis);
