'use strict';
/* luu-may.js – LƯU MÂY bằng Firebase (phiên "Lưu game bằng Firebase", mã firebase). Bản 2 – làm theo tư vấn ChatGPT
   (docs/firebase/tu-van-chatgpt.txt): "Local-first + Cloud backup + Conflict-safe".
   - localStorage là nơi lưu CHÍNH (chơi offline được). File này chỉ đồng bộ các khoá trong KHOA_CHO_PHEP
     (tvcc-vung1, tvcc-chung, tvcc-he-thong, tvcc-an, tvcc-trang-bi-v1) – phải trùng danh sách trong firestore.rules.
   - Firestore: nguoi_choi/{uid} {phienBan:2, taoLuc}; nguoi_choi/{uid}/ban_luu/{khoá}
       {tenKhoa, du (chuỗi JSON; '' = đã xoá), revision (số nguyên), capNhat (giờ máy chủ), thietBi, saoLuuTruoc}.
   - KHÔNG dùng đồng hồ máy để chọn bản mới. Mỗi khoá có "revision": máy nhớ revision mây lần đồng bộ gần nhất;
     ghi bằng TRANSACTION chỉ khi mây vẫn đúng revision đó (rồi +1). Mây đã bị máy khác sửa mà máy này cũng có
     thay đổi chưa gửi → XUNG ĐỘT: không đè bên nào, giữ cả 2, người chơi chọn (LuuMay.chon).
   - Mây mới hơn mà máy không có thay đổi → lấy bản mây (trước khi game đọc; game đã đọc rồi thì báo "tải lại").
   - Không cấu hình / không mạng / trang bị chặn mạng (vd Artifact claude.ai) → tự tắt, KHÔNG lỗi; vẫn có Xuất/Nhập bản lưu.
   Dùng trong trang:
     <script src="../firebase/cau-hinh.js"></script> <script src="../luu-may.js"></script>
     trước khi game đọc bản lưu: if (window.LuuMay && LuuMay.coMay()) await LuuMay.cho(2500);
     sau mỗi lần ghi (không bắt buộc): LuuMay.daGhi('tvcc-vung1')
   Node (phép thử): require('./luu-may.js') → {taoDongBo, taoCongFirestore, ...}. */
(function(goc){
  const KHOA_CHO_PHEP = ['tvcc-vung1', 'tvcc-chung', 'tvcc-he-thong', 'tvcc-an', 'tvcc-trang-bi-v1'];
  const KHOA_META = 'tvcc-may-meta', KHOA_SAO = 'tvcc-may-sao-luu', KHOA_TB = 'tvcc-may-thiet-bi';
  const PHIEN_BAN = 2, BO_SUU_TAP = 'nguoi_choi', CON = 'ban_luu', TOI_DA = 16000;

  function bam(s){ // băm ngắn (FNV-1a 32 bit) để so sánh
    s = s === null || s === undefined ? '' : String(s);
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return h.toString(36) + ':' + s.length;
  }
  const RONG = bam('');

  /* ---------- LÕI ĐỒNG BỘ (không phụ thuộc Firebase; thử được bằng Node) ----------
     kho: giống localStorage.  cong: {layVe(uid,[khoá]) -> {khoá:{du,rev}}, giaoDich(uid,[{k,du,revCu}],thietBi) -> {xong:[{k,rev}], xungDot:[{k,du,rev}]}} */
  function taoDongBo(o){
    const kho = o.kho, sk = o.suKien || (() => {}), khoa = o.khoa || KHOA_CHO_PHEP;
    let cong = o.cong || null, uid = null;
    const ban = new Set(), giuLai = new Set();
    let daDoc = false, daKeo = false;
    const doc = k => { try { const v = kho.getItem(k); return v === null || v === undefined ? '' : String(v); } catch (e){ return ''; } };
    const viet = (k, v) => { try { if (v === '' || v === null) kho.removeItem(k); else kho.setItem(k, v); } catch (e){} };
    let thietBi = doc(KHOA_TB);
    if (!thietBi){ thietBi = 'tb-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); viet(KHOA_TB, thietBi); }
    const moiMeta = () => ({phien_ban:PHIEN_BAN, uid:null, k:{}, xd:{}});
    let meta = docMeta();
    function docMeta(){
      try { const m = JSON.parse(kho.getItem(KHOA_META) || 'null'); if (m && m.phien_ban === PHIEN_BAN && m.k && m.xd) return m; } catch (e){}
      return moiMeta();
    }
    function ghiMeta(){ try { kho.setItem(KHOA_META, JSON.stringify(meta)); } catch (e){} }
    const mk = k => meta.k[k] || {rev:0, hs:RONG};
    const ban_ = k => bam(doc(k)) !== mk(k).hs;      // máy có thay đổi chưa gửi (so với lần đồng bộ gần nhất)

    function quet(){
      // localStorage bị xoá sạch (xoá dữ liệu trang web) khi trang đang mở → coi như máy mới (để lấy bản mây về)
      if (meta.uid && doc(KHOA_META) === ''){ const u = meta.uid; meta = moiMeta(); meta.uid = u; ban.clear(); giuLai.clear(); ghiMeta(); }
      let doi = false;
      for (const k of khoa){
        if (meta.xd[k]) continue;
        if (ban_(k)){ if (!ban.has(k)){ ban.add(k); doi = true; } giuLai.delete(k); } else ban.delete(k);
      }
      return doi;
    }
    function saoLuuMay(k, du){
      try { const s = JSON.parse(doc(KHOA_SAO) || '{}'); s[k] = {du, luc:Date.now()}; kho.setItem(KHOA_SAO, JSON.stringify(s)); } catch (e){}
    }
    function apDung(k, du, rev){
      const dl = doc(k);
      if (dl !== '' && dl !== du) saoLuuMay(k, dl);
      viet(k, du); meta.k[k] = {rev, hs:bam(du)};
    }

    /* Ghép bản mây (đã xác nhận từ máy chủ) vào máy. */
    function hopNhat(may){
      const kq = {apDung:[], gui:[], giu:[], xungDot:[]};
      for (const k of khoa){
        const s = (may && may[k]) || {rev:0, du:''}, m = mk(k), dl = doc(k);
        if (meta.xd[k]){ if (s.rev !== meta.xd[k].rev) meta.xd[k] = {du:s.du, rev:s.rev}; kq.xungDot.push(k); continue; }
        if (s.rev === m.rev){ if (ban_(k)){ ban.add(k); kq.gui.push(k); } continue; }
        // mây đã đổi so với lần đồng bộ gần nhất
        if (dl === s.du){ meta.k[k] = {rev:s.rev, hs:bam(dl)}; ban.delete(k); continue; }
        if (!ban_(k)){
          if (daDoc){ giuLai.add(k); ban.delete(k); kq.giu.push(k); continue; }   // game đang chạy: không đè, báo tải lại
          apDung(k, s.du, s.rev); ban.delete(k); kq.apDung.push(k); continue;
        }
        meta.xd[k] = {du:s.du, rev:s.rev}; ban.delete(k); kq.xungDot.push(k);   // cả 2 bên đều đổi → giữ cả 2
      }
      ghiMeta();
      return kq;
    }

    async function keo(){
      if (!cong || !uid) return null;
      const may = await cong.layVe(uid, khoa);
      quet();
      const kq = hopNhat(may);
      daKeo = true; sk('keo', kq);
      return kq;
    }

    let dangGui = null;
    function gui(){
      if (!cong || !uid || !daKeo) return Promise.resolve(false);
      quet();
      if (!canGui().length) return Promise.resolve(true);
      if (dangGui) return dangGui;
      dangGui = guiThat().catch(e => { sk('loi', e); return false; }).finally(() => { dangGui = null; });
      return dangGui;
    }
    async function guiThat(){
      const ds = [], qua = [];
      for (const k of canGui()){
        const du = doc(k);
        if (du.length > TOI_DA){ qua.push(k); continue; }
        ds.push({k, du, revCu:mk(k).rev});
      }
      if (qua.length) sk('loi', new Error('save too large: ' + qua.join(', ')));
      if (!ds.length) return false;
      sk('dang-gui', ds.map(x => x.k));
      const kq = await cong.giaoDich(uid, ds, thietBi);
      for (const x of kq.xong || []){ const d = ds.find(y => y.k === x.k); meta.k[x.k] = {rev:x.rev, hs:bam(d.du)}; if (!ban_(x.k)) ban.delete(x.k); }
      for (const x of kq.xungDot || []){ meta.xd[x.k] = {du:x.du, rev:x.rev}; ban.delete(x.k); }
      ghiMeta();
      sk('gui', kq);
      return !(kq.xungDot || []).length;
    }
    function canGui(){ return [...ban].filter(k => !giuLai.has(k) && !meta.xd[k]); }

    /* Người chơi chọn khi xung đột: 'may-chu' (dùng bản trên mây) hoặc 'thiet-bi' (giữ bản máy này, ghi đè mây – bản mây thành saoLuuTruoc). */
    function chon(k, ben){
      const x = meta.xd[k]; if (!x) return false;
      delete meta.xd[k];
      if (ben === 'may-chu'){ apDung(k, x.du, x.rev); ban.delete(k); }
      else { meta.k[k] = {rev:x.rev, hs:mk(k).hs}; if (ban_(k)) ban.add(k); }
      ghiMeta(); return true;
    }

    /* Xuất / nhập bản lưu (dự phòng khi Safari xoá dữ liệu web, chuyển máy không cần mạng). */
    function xuat(){
      const d = {tro_choi:'tieng-vong-cuoi-cung', phien_ban:1, luc:new Date().toISOString(), khoa:{}};
      for (const k of khoa){ const v = doc(k); if (v !== '') d.khoa[k] = v; }
      return JSON.stringify(d);
    }
    function nhap(chuoi){
      let d; try { d = JSON.parse(chuoi); } catch (e){ return {ok:false, loi:'not a save file'}; }
      if (!d || d.tro_choi !== 'tieng-vong-cuoi-cung' || !d.khoa || typeof d.khoa !== 'object') return {ok:false, loi:'not a save file'};
      const ds = [];
      for (const k of khoa){
        if (!(k in d.khoa)) continue;
        const v = d.khoa[k]; if (typeof v !== 'string') continue;
        const cu = doc(k); if (cu !== '' && cu !== v) saoLuuMay(k, cu);
        viet(k, v); ds.push(k);
        if (meta.xd[k]){ meta.k[k] = {rev:meta.xd[k].rev, hs:mk(k).hs}; delete meta.xd[k]; }   // nhập = người chơi chủ động chọn bản này
      }
      if (!ds.length) return {ok:false, loi:'empty save file'};
      quet(); ghiMeta();
      return {ok:true, khoa:ds};
    }

    quet();
    return {
      quet, keo, gui, hopNhat, chon, xuat, nhap, canGui,
      datCong(c){ cong = c; },
      datUid(u){
        if (u === uid) return;
        uid = u; daKeo = false; giuLai.clear();
        if (meta.uid !== u){ meta.uid = u; meta.k = {}; meta.xd = {}; ghiMeta(); }   // tài khoản khác: revision cũ không còn đúng
        quet();
      },
      uid: () => uid, thietBi: () => thietBi,
      khoaDoc(){ daDoc = true; },
      daKeo: () => daKeo,
      giuLai: () => [...giuLai],
      xungDot: () => Object.keys(meta.xd),
      meta: () => JSON.parse(JSON.stringify(meta))
    };
  }

  /* ---------- CỔNG FIRESTORE (dùng chung cho trình duyệt, phép thử emulator, kiểm dự án thật) ----------
     S = module firebase/firestore (getDocFromServer, runTransaction, doc, serverTimestamp), db = Firestore. */
  function taoCongFirestore(S, db, henGio){
    henGio = henGio || (p => p);
    const chaDaCo = new Set();
    const tl = (u, k) => S.doc(db, BO_SUU_TAP, u, CON, k);
    return {
      async layVe(u, ds){
        const kq = {};
        const snap = await henGio(Promise.all(ds.map(k => S.getDocFromServer(tl(u, k)))), 9000, 'reading cloud');
        snap.forEach((s, i) => { if (s.exists()){ const d = s.data(); kq[ds[i]] = {du:typeof d.du === 'string' ? d.du : '', rev:d.revision | 0}; } });
        return kq;
      },
      async giaoDich(u, ds, thietBi){
        return henGio(S.runTransaction(db, async tx => {
          const xong = [], xungDot = [];
          const cha = S.doc(db, BO_SUU_TAP, u);
          const sCha = chaDaCo.has(u) ? null : await tx.get(cha);
          const sv = [];
          for (const x of ds) sv.push(await tx.get(tl(u, x.k)));
          if (sCha && !sCha.exists()) tx.set(cha, {phienBan:PHIEN_BAN, taoLuc:S.serverTimestamp()});
          ds.forEach((x, i) => {
            const s = sv[i], d = s.exists() ? s.data() : null, rev = d ? (d.revision | 0) : 0;
            if (rev !== x.revCu){ xungDot.push({k:x.k, du:d && typeof d.du === 'string' ? d.du : '', rev}); return; }
            tx.set(tl(u, x.k), {tenKhoa:x.k, du:x.du, revision:rev + 1, capNhat:S.serverTimestamp(), thietBi:String(thietBi).slice(0, 80),
              saoLuuTruoc:d && typeof d.du === 'string' ? d.du : ''});
            xong.push({k:x.k, rev:rev + 1});
          });
          return {xong, xungDot};
        }), 12000, 'writing cloud').then(kq => { chaDaCo.add(u); return kq; });
      }
    };
  }

  /* ---------- PHIÊN ĐĂNG NHẬP GOOGLE: GIỮ ĐÚNG SO_NGAY_PHIEN NGÀY (phiên "dangnhap", docs/dang-nhap/nghien-cuu.md) ----------
     Mốc = claim auth_time trong ID token (giờ máy chủ Google lúc ĐĂNG NHẬP, không đổi khi token tự làm mới mỗi giờ).
     "Bây giờ" = max(đồng hồ máy, iat của token mới nhất đã thấy) → vặn lùi đồng hồ máy không kéo dài được phiên.
     Phiên khách (ẩn danh) không hết hạn. Đổi số ngày: sửa đúng 1 chỗ này. */
  const SO_NGAY_PHIEN = 7, NGAY_MS = 86400000, KHOA_PHIEN = 'tvcc-may-phien';
  function docToken(jwt){   // giải phần payload JWT (không kiểm chữ ký – chỉ đọc giờ; máy chủ Firebase mới là nơi kiểm)
    try {
      let s = String(jwt).split('.')[1].replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '=';
      const txt = typeof atob === 'function' ? atob(s) : Buffer.from(s, 'base64').toString('binary');
      const p = JSON.parse(decodeURIComponent(txt.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
      return {authTime:+p.auth_time || 0, iat:+p.iat || 0, nhaCungCap:(p.firebase && p.firebase.sign_in_provider) || ''};
    } catch (e){ return null; }
  }
  /* t: {authTime (giây), iat (giây)}; o: {bayGio (ms máy), daThay (ms máy chủ lớn nhất đã thấy), mocDuPhong (ms), soNgay} */
  function kiemPhien(t, o){
    o = o || {};
    const soNgay = o.soNgay || SO_NGAY_PHIEN;
    const moc = Math.max((t && t.authTime || 0) * 1000, o.mocDuPhong || 0);
    const bayGio = Math.max(o.bayGio || 0, (t && t.iat || 0) * 1000, o.daThay || 0);
    if (!moc) return {hetHan:false, moc:0, conLai:soNgay * NGAY_MS, bayGio};   // không đọc được mốc: không tự đăng xuất
    const conLai = moc + soNgay * NGAY_MS - bayGio;
    return {hetHan:conLai <= 0, moc, conLai, bayGio};
  }

  const XUAT = {taoDongBo, taoCongFirestore, bam, docToken, kiemPhien, SO_NGAY_PHIEN, KHOA_PHIEN, KHOA_CHO_PHEP, KHOA_META, KHOA_SAO, BO_SUU_TAP, CON, PHIEN_BAN};
  if (typeof module !== 'undefined' && module.exports){ module.exports = XUAT; return; }

  /* ---------- PHẦN TRÌNH DUYỆT ---------- */
  const W = goc;
  const Q = (() => { try { return new URLSearchParams(location.search); } catch (e){ return new URLSearchParams(''); } })();
  let ls = null; try { ls = W.localStorage; ls.getItem('x'); } catch (e){ ls = null; }
  const CH = W.TVCC_FIREBASE || null;
  const nghe = new Set();
  const LM = {
    trangThai: 'tat',        // tat | dang-ket-noi | an-danh | google | ngoai-tuyen | loi
    dongBo: '',              // '' | dang-gui | xong | cho | xung-dot | moi-hon
    loi: '', ten: '', email: '',
    thongBao: '',            // thông báo ngắn (vd hết phiên 7 ngày) – trang hiện rồi gọi boThongBao()
    soNgayPhien: SO_NGAY_PHIEN,
    laGoogle: () => LM.trangThai === 'google' || LM._tt === 'google',
    boThongBao(){ LM.thongBao = ''; bao(); },
    tenNgan(){   // "Tung · ly23…@gmail.com" – gọn cho màn ngang iPhone
      const ten = String(LM.ten || '').trim().split(/\s+/)[0].slice(0, 14);
      const e = String(LM.email || ''), at = e.indexOf('@');
      const em = at > 4 ? e.slice(0, 4) + '…' + e.slice(at) : e;
      return [ten, em].filter(Boolean).join(' · ') || 'Google account';
    },
    nghe(f){ nghe.add(f); try { f(LM); } catch (e){} return () => nghe.delete(f); },
    cho: () => Promise.resolve(false),
    daGhi(){}, guiNgay: () => Promise.resolve(false),
    dangNhapGoogle: () => Promise.resolve(false),
    dangXuat: () => Promise.resolve(false),
    coMay: () => false,
    xungDot: () => [], chon: () => false,
    moTa(){   // chữ theo tư vấn ChatGPT (mục H)
      const t = LM.trangThai, d = LM.dongBo;
      if (t === 'tat') return 'Saved on this device · Your game works without internet';
      if (t === 'dang-ket-noi') return 'Connecting cloud save…';
      if (t === 'ngoai-tuyen') return 'Offline · Saved on this device';
      if (d === 'xung-dot') return 'Cloud save needs attention';
      if (t === 'loi') return 'Cloud save needs attention · Saved on this device';
      if (d === 'moi-hon') return 'Newer cloud save found · Reload to apply';
      if (d === 'dang-gui' || d === 'cho') return 'Saving to cloud…';
      return t === 'google' ? 'Google connected · Progress backed up' : 'Cloud save up to date';
    }
  };
  W.LuuMay = LM;
  function bao(tt, loi){ if (tt) LM.trangThai = tt; if (loi !== undefined) LM.loi = String(loi || ''); for (const f of nghe){ try { f(LM); } catch (e){} } }

  // service worker: mở game khi không có mạng (chỉ trên Firebase Hosting – không chạy ở localhost/Artifact)
  try {
    if (CH && CH.projectId && 'serviceWorker' in navigator && location.protocol === 'https:' && Q.get('sw') !== '0' &&
        (location.hostname === CH.projectId + '.web.app' || location.hostname === CH.projectId + '.firebaseapp.com')){
      const d = (document.currentScript && document.currentScript.src) || '';
      const url = d ? new URL('sw.js', d).href : '/game/sw.js';
      W.addEventListener('load', () => navigator.serviceWorker.register(url).catch(() => {}));
    }
  } catch (e){}

  // Xuất / nhập bản lưu – dùng được cả khi không có lưu mây
  const DB = ls ? taoDongBo({kho:ls, suKien:(l, x) => suKien(l, x)}) : null;
  LM._dongBo = DB;
  LM.xuat = () => DB ? DB.xuat() : '';
  LM.taiXuat = () => {
    const s = LM.xuat(); if (!s) return false;
    try { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([s], {type:'application/json'}));
      a.download = 'the-last-echo-save-' + new Date().toISOString().slice(0, 10) + '.json'; document.body.appendChild(a); a.click(); a.remove(); return true; } catch (e){ return false; }
  };
  LM.nhap = s => { if (!DB) return {ok:false, loi:'storage blocked'}; const r = DB.nhap(s); if (r.ok) LM.guiNgay(); return r; };
  LM.chonNhap = () => new Promise(r => {   // mở hộp chọn file, nhập xong trả về {ok}
    const i = document.createElement('input'); i.type = 'file'; i.accept = '.json,application/json';
    i.onchange = () => { const f = i.files && i.files[0]; if (!f) return r({ok:false}); const fr = new FileReader(); fr.onload = () => r(LM.nhap(String(fr.result))); fr.onerror = () => r({ok:false}); fr.readAsText(f); };
    i.click();
  });

  function suKien(loai, x){
    if (loai === 'loi'){ bao(navigator.onLine === false ? 'ngoai-tuyen' : 'loi', x && x.message || x); return; }
    if (loai === 'dang-gui'){ LM.dongBo = 'dang-gui'; bao(); return; }
    if (LM.trangThai === 'ngoai-tuyen' || LM.trangThai === 'loi') bao(LM._tt || 'an-danh', '');
    capNhatDongBo();
  }
  function capNhatDongBo(){
    if (!DB) return;
    LM.dongBo = DB.xungDot().length ? 'xung-dot' : DB.giuLai().length ? 'moi-hon' : DB.canGui().length ? 'cho' : 'xong';
    bao();
  }

  const laMayNha = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) && !(CH && (CH.choLocalhost || CH.emulator)) && Q.get('may') !== '1';
  const tatHan = !DB || !CH || !CH.apiKey || Q.get('may') === '0' || laMayNha || !/^https?:$/.test(location.protocol);
  if (tatHan) return;
  LM.coMay = () => true;
  LM.xungDot = () => DB.xungDot();
  LM.chon = (k, ben) => { const ok = DB.chon(k, ben); capNhatDongBo(); if (ok) guiKiem().then(capNhatDongBo); return ok; };
  LM.chonTatCa = ben => { for (const k of DB.xungDot()) DB.chon(k, ben); capNhatDongBo(); return guiKiem().then(() => { capNhatDongBo(); return true; }); };

  const SDK = (CH.sdk || 'https://www.gstatic.com/firebasejs/10.14.1/').replace(/\/?$/, '/');
  const henGio = (p, ms, ten) => Promise.race([p, new Promise((_, b) => setTimeout(() => b(new Error('timed out: ' + ten)), ms))]);
  let F = null;

  // authDomain cùng tên miền với trang game (đăng nhập Google trên iPhone Safari – tư vấn ChatGPT mục D)
  const cungMien = CH.projectId && (location.hostname === CH.projectId + '.web.app' || location.hostname === CH.projectId + '.firebaseapp.com');
  async function napSdk(){
    const [mA, mAuth, mS] = await henGio(Promise.all([import(SDK + 'firebase-app.js'), import(SDK + 'firebase-auth.js'), import(SDK + 'firebase-firestore.js')]), 10000, 'loading Firebase');
    const app = mA.initializeApp({apiKey:CH.apiKey, authDomain:cungMien ? location.hostname : CH.authDomain, projectId:CH.projectId, appId:CH.appId, storageBucket:CH.storageBucket, messagingSenderId:CH.messagingSenderId});
    // (dangnhap) phiên đăng nhập LÂU DÀI: IndexedDB → localStorage → sessionStorage → bộ nhớ. Safari chặn loại nào thì SDK tự lùi sang loại sau.
    let auth = null;
    try {
      if (mAuth.initializeAuth){
        const ds = [mAuth.indexedDBLocalPersistence, mAuth.browserLocalPersistence, mAuth.browserSessionPersistence, mAuth.inMemoryPersistence].filter(Boolean);
        auth = mAuth.initializeAuth(app, {persistence:ds, popupRedirectResolver:mAuth.browserPopupRedirectResolver});
      }
    } catch (e){ auth = null; }
    if (!auth) auth = mAuth.getAuth(app);
    const db = mS.getFirestore(app);
    if (CH.emulator){ mAuth.connectAuthEmulator(auth, 'http://' + CH.emulator.auth, {disableWarnings:true}); mS.connectFirestoreEmulator(db, CH.emulator.firestore.split(':')[0], +CH.emulator.firestore.split(':')[1]); }
    F = {app, auth, db, A:mAuth, S:mS};
    DB.datCong(taoCongFirestore(mS, db, henGio));
    return F;
  }
  const laGoogleU = u => !!(u && (u.providerData || []).some(p => p && p.providerId === 'google.com'));
  function capNhatNguoi(u){
    if (!u){ LM.ten = LM.email = ''; return; }
    const g = (u.providerData || []).find(p => p.providerId === 'google.com');
    LM._tt = g ? 'google' : 'an-danh'; LM.ten = g ? (g.displayName || '') : ''; LM.email = g ? (g.email || '') : '';
  }
  async function vaoUid(u){
    capNhatNguoi(u); DB.datUid(u.uid);
    await DB.keo(); bao(LM._tt, '');
    await guiKiem(); capNhatDongBo();
  }

  /* ---------- (dangnhap) PHIÊN GOOGLE 7 NGÀY ---------- */
  const docPhien = () => { try { return JSON.parse(ls.getItem(KHOA_PHIEN) || 'null') || {}; } catch (e){ return {}; } };
  const ghiPhien = p => { try { if (p) ls.setItem(KHOA_PHIEN, JSON.stringify(p)); else ls.removeItem(KHOA_PHIEN); } catch (e){} };
  async function layToken(u, ep){
    let jwt = '';
    try { jwt = await henGio(F.A.getIdToken ? F.A.getIdToken(u, !!ep) : u.getIdToken(!!ep), 8000, 'token'); }
    catch (e){ jwt = u.accessToken || (u.stsTokenManager && u.stsTokenManager.accessToken) || ''; }   // không mạng: đọc token đã lưu
    return jwt ? docToken(jwt) : null;
  }
  // Vừa đăng nhập Google xong: ghi giờ máy chủ đã thấy. Nếu máy chủ không làm mới auth_time (gắn Google vào tài khoản khách)
  // thì xác thực lại bằng chính thông tin Google vừa nhận để có auth_time mới; không được thì lấy iat (giờ máy chủ) làm mốc dự phòng.
  async function sauDangNhapGoogle(kq){
    const u = kq && kq.user; if (!laGoogleU(u)) return;
    LM.thongBao = '';
    const p = {uid:u.uid};
    let t = await layToken(u, true);
    if (t && t.authTime && t.iat - t.authTime > 300){
      try {
        const c = F.A.GoogleAuthProvider.credentialFromResult && F.A.GoogleAuthProvider.credentialFromResult(kq);
        if (c && F.A.reauthenticateWithCredential){ await henGio(F.A.reauthenticateWithCredential(u, c), 8000, 'reauth'); t = await layToken(u, true) || t; }
      } catch (e){}
      if (t.iat - t.authTime > 300) p.mocDuPhong = t.iat * 1000;
    }
    if (t) p.daThay = t.iat * 1000;
    ghiPhien(p);
  }
  let dangKiem = null;
  /* Kiểm phiên Google: quá SO_NGAY_PHIEN ngày kể từ auth_time → tự đăng xuất về khách (giữ bản lưu trên máy). Trả về true nếu vừa hết hạn. */
  function kiemPhienGoogle(){
    if (dangKiem) return dangKiem;
    const lan = (async () => {
      const u = F && F.auth.currentUser;
      if (!laGoogleU(u)){ LM.phien = null; return false; }   // khách: không hết hạn
      const t = await layToken(u, false);
      if (!t) return false;
      let p = docPhien(); if (p.uid !== u.uid) p = {uid:u.uid};
      p.daThay = Math.max(p.daThay || 0, t.iat * 1000); ghiPhien(p);
      const kq = kiemPhien(t, {bayGio:Date.now(), daThay:p.daThay, mocDuPhong:p.mocDuPhong});
      LM.phien = {moc:kq.moc, conLai:kq.conLai};
      return kq.hetHan;
    })().catch(() => false);
    // hết hạn → về khách SAU khi nhả khoá (về khách lại gọi gửi/kiểm – tránh tự chờ chính mình)
    dangKiem = lan.then(het => { dangKiem = null; return het ? hetPhien().then(() => true, () => true) : false; });
    return dangKiem;
  }
  let dangHet = null;
  function hetPhien(){ if (!dangHet) dangHet = hetPhienThat().finally(() => { dangHet = null; }); return dangHet; }
  async function hetPhienThat(){
    // localStorage là nơi lưu chính → tiến độ trên máy giữ nguyên; không gửi gì lên mây bằng phiên đã hết hạn
    ghiPhien(null); DB.datUid(null); LM.phien = null;
    LM.thongBao = 'Your sign-in expired after ' + SO_NGAY_PHIEN + ' days. Sign in again to sync your progress.';
    try { await F.A.signOut(F.auth); } catch (e){}
    capNhatNguoi(null); LM._tt = 'an-danh'; bao('an-danh', '');
    await vaoKhach();
  }
  async function vaoKhach(){
    try { const r = await henGio(F.A.signInAnonymously(F.auth), 8000, 'guest sign-in'); await vaoUid(r.user); return true; }
    catch (e){ bao(navigator.onLine === false ? 'ngoai-tuyen' : 'loi', e && e.message || e); return false; }
  }
  // mọi lần gửi lên mây đều kiểm phiên trước
  async function guiKiem(){ if (F && await kiemPhienGoogle()) return false; return DB.gui(); }

  // tài khoản Google đã có bản lưu ở máy khác: KHÔNG đẩy tiến độ ẩn danh lên; chuyển sang tài khoản đó, kéo bản mây, xung đột thì cho chọn
  async function doiSangGoogle(e){
    const cred = F.A.GoogleAuthProvider.credentialFromError(e);
    if (!cred) return false;
    await DB.gui().catch(() => {});        // bản máy vẫn nằm trong localStorage; cố gửi nốt lên tài khoản khách cũ
    const kq = await F.A.signInWithCredential(F.auth, cred);
    await sauDangNhapGoogle(kq); await vaoUid(kq.user); return true;
  }
  const laTrungTk = e => e && (e.code === 'auth/credential-already-in-use' || e.code === 'auth/email-already-in-use');

  let xongKeo; const henKeo = new Promise(r => { xongKeo = r; });
  async function batDau(){
    bao('dang-ket-noi');
    try {
      await napSdk();
      if (F.A.getRedirectResult){   // quay lại sau đăng nhập Google kiểu chuyển trang
        try { const r = await henGio(F.A.getRedirectResult(F.auth), 8000, 'google redirect'); if (r && r.user) await sauDangNhapGoogle(r); }
        catch (e){ if (laTrungTk(e)){ await doiSangGoogle(e); xongKeo(true); return; } }
      }
      const u = await henGio(new Promise(r => { const bo = F.A.onAuthStateChanged(F.auth, x => { bo(); r(x); }); }), 8000, 'sign-in');
      if (u && laGoogleU(u)){ capNhatNguoi(u); if (await kiemPhienGoogle()){ xongKeo(true); return; } }   // mở game: kiểm phiên 7 ngày trước khi đồng bộ
      const nguoi = u || (await henGio(F.A.signInAnonymously(F.auth), 8000, 'guest sign-in')).user;
      await vaoUid(nguoi);
      xongKeo(true);
    } catch (e){
      xongKeo(false);
      bao(navigator.onLine === false ? 'ngoai-tuyen' : 'loi', e && e.message || e);
    }
  }

  // gửi gom (debounce 10 giây) – tiết kiệm hạn mức miễn phí
  const NHIP = Math.max(3000, +(CH.nhipGui || 10000));
  let henGui = null;
  function hen(ms){ if (henGui) return; henGui = setTimeout(() => { henGui = null; if (DB.daKeo()) guiKiem().then(capNhatDongBo); }, ms); }
  setInterval(() => { if (DB.quet() || DB.canGui().length){ capNhatDongBo(); hen(0); } }, NHIP);
  // game mở lâu (iPhone để nguyên trang nhiều ngày): kiểm phiên mỗi 10 phút và mỗi lần quay lại trang
  setInterval(() => { if (F) kiemPhienGoogle(); }, Math.max(1000, +(CH.nhipKiemPhien || 600000)));
  LM.daGhi = () => { DB.quet(); capNhatDongBo(); hen(NHIP); };
  LM.guiNgay = () => guiKiem().then(v => { capNhatDongBo(); return v; });
  LM.kiemPhien = () => F ? kiemPhienGoogle() : Promise.resolve(false);
  const xa = () => { try { if (DB.quet() || DB.canGui().length) guiKiem(); } catch (e){} };   // cố gắng cuối; cờ "chưa gửi" vẫn còn cho lần mở sau
  W.addEventListener('pagehide', xa);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') xa(); else if (F) kiemPhienGoogle(); });
  W.addEventListener('online', () => {
    if (!F){ batDau(); return; }
    if (!F.auth.currentUser){ vaoKhach(); return; }
    if (!DB.daKeo() || !DB.uid()) vaoUid(F.auth.currentUser).catch(() => {}); else LM.guiNgay();
  });
  W.addEventListener('offline', () => bao('ngoai-tuyen'));

  /* Chờ bản mây (tối đa ms, chỉ cho giao diện – không huỷ việc kéo) trước khi game đọc bản lưu. */
  LM.cho = ms => henGio(henKeo, ms || 2500, 'waiting for cloud').catch(() => false).then(v => { DB.khoaDoc(); return v; });

  /* Đăng nhập Google: gọi TRỰC TIẾP trong sự kiện chạm nút (không await gì trước popup). Đang là khách → GẮN (link) Google vào
     tài khoản khách, giữ nguyên tiến độ. Popup bị chặn → chuyển trang (authDomain cùng tên miền). */
  LM.dangNhapGoogle = () => {
    if (!F){ bao(null, navigator.onLine === false ? 'offline' : 'cloud not ready'); return Promise.resolve(false); }
    const P = new F.A.GoogleAuthProvider(), cu = F.auth.currentUser;
    try { P.setCustomParameters && P.setCustomParameters({prompt:'select_account'}); } catch (e){}
    const p = cu ? F.A.linkWithPopup(cu, P) : F.A.signInWithPopup(F.auth, P);
    return p.then(async kq => { await sauDangNhapGoogle(kq); await vaoUid(kq.user); return true; }).catch(async e => {
      const ma = e && e.code || '';
      try {
        if (laTrungTk(e)) return await doiSangGoogle(e);
        if ((ma === 'auth/popup-blocked' || ma === 'auth/operation-not-supported-in-this-environment') && cungMien){
          await (cu ? F.A.linkWithRedirect(cu, P) : F.A.signInWithRedirect(F.auth, P)); return false;
        }
      } catch (e2){ bao(null, e2 && (e2.code || e2.message)); return false; }
      if (ma === 'auth/popup-closed-by-user' || ma === 'auth/cancelled-popup-request'){ bao(null, ''); return false; }
      bao(null, ma || (e && e.message)); return false;
    });
  };
  /* Đăng xuất: gửi nốt bản lưu lên mây (nếu được), rồi về chế độ khách. Bản lưu trên máy KHÔNG bị xoá. */
  LM.dangXuat = async () => {
    if (!F) return false;
    try { await henGio(DB.gui(), 8000, 'saving before sign-out'); } catch (e){}
    ghiPhien(null); LM.thongBao = ''; LM.phien = null;
    try { await F.A.signOut(F.auth); } catch (e){}
    DB.datUid(null); capNhatNguoi(null); LM._tt = 'an-danh'; bao('an-danh', '');
    await vaoKhach(); return true;
  };

  batDau();
})(typeof window !== 'undefined' ? window : globalThis);
