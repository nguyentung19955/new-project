'use strict';
/* =====================================================================================================================
   lop-trang-bi.js – HIỂN THỊ trang bị / sức mạnh LÊN NGƯỜI Kiếm Khách (phiên "sucmanh"). Không biết luật game.
   Dữ liệu: game/thu-mat-na/trang-bi.json. Ảnh lớp: art/kiem-khach-lop/<id lớp>/<thư mục clip gốc>/fNN.png
   (cùng cỡ 256×256, cùng chân [128,172], cùng số khung với ảnh gốc art/kiem-khach/<clip>/fNN.png — ChatGPT/PixelLab vẽ).

   NGUYÊN TẮC:
   - Chưa đeo gì / cấp 0 / chưa có ảnh  →  KHÔNG vẽ gì thêm: nhân vật y hệt hiện tại.
   - Lớp chỉ được BẬT khi trang-bi.json ghi "co_anh": true (phiên LÀM ghi khi yêu cầu ảnh đã XONG) VÀ ảnh thật có trên đĩa
     (dò <id>/dung/f00.png). Chưa bật thì không tải gì cả. Không bao giờ vẽ hình tạm bằng code.
   - Clip nào lớp chưa có ảnh → lớp ẩn ở clip đó (không lệch khung, không kéo khung khác vào).
   - Hai kiểu lớp:
       "khung"  : mỗi khung clip gốc có 1 ảnh lớp phủ cùng cỡ, vẽ chồng đúng neo (chính xác nhất).
       "neo"    : 1 ảnh nhỏ (hoặc vài khung lặp) gắn vào điểm neo ghi theo từng khung clip gốc (rẻ: chuông hông, ấn…).
   - z: "sau" vẽ TRƯỚC thân (nằm sau lưng: khăn bay, hào quang ảnh), "truoc" vẽ SAU thân (nằm trên: vết nứt mặt nạ, ấn giáp).

   API cho trang (Vùng 1, phòng demo) và cho phiên "do" (hệ thống đồ – lo KIẾM đồ; phiên này lo HIỂN THỊ):
     await LopTrangBi.nap(urlJson, clipThem)       nạp trang-bi.json + dò ảnh lớp (clipThem: clip theo cấp đòn để nạp trước)
     LopTrangBi.veSau(ctx, ten, k, fx, fy, lat, s, alpha, trang)   gọi NGAY TRƯỚC khi vẽ thân
     LopTrangBi.veTruoc(ctx, ten, k, fx, fy, lat, s, alpha, trang) gọi NGAY SAU khi vẽ thân
         ten = tên clip trạng thái (dung, troi, don1…), k = khung đang vẽ, các tham số còn lại y như SpriteMN.ve
     LopTrangBi.deo(id) / go(id) / dangDeo() / coAnh(id) / dsLop()
     LopTrangBi.datCap(n) / cap() / capTheoTienDo({trum:[...], manh_am:n, ...}) / chiSo()
     LopTrangBi.dangKy(fn)                         báo khi đeo/gỡ/đổi cấp (fn nhận {k, ...})
   Thử nhanh qua URL:  ?trangbi=id1,id2  ?sucmanh=2   (chỉ có tác dụng với lớp đã có ảnh)
   ===================================================================================================================== */
const LopTrangBi = (() => {
  const KHOA = 'tvcc-trang-bi-v1';
  const st = {json:null, lop:{}, deo:[], cap:0, nap:false, goc:'', nghe:[]};
  const pad = n => String(n).padStart(2, '0');
  const BUSTER = Date.now();
  function anh(src){ return new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src + '?v=' + BUSTER; }); }

  /* ---------- lưu / tải (per-viewer, bọc try/catch – trang chạy đúng kể cả không có bộ nhớ) ---------- */
  function docLuu(){ try { const s = localStorage.getItem(KHOA); return s ? JSON.parse(s) : null; } catch (e){ return null; } }
  function ghiLuu(){ try { localStorage.setItem(KHOA, JSON.stringify({deo:st.deo, cap:st.cap})); } catch (e){} }
  function bao(e){ for (const f of st.nghe) try { f(e); } catch (x){} }

  // thư mục clip gốc của trạng thái `ten` → lấy từ DongCoMN (clip theo cấp đòn trước, rồi clip thường)
  function clipGoc(ten){
    const E = typeof DongCoMN !== 'undefined' ? DongCoMN : null; if (!E) return null;
    return (E.NV.capClip && E.NV.capClip[ten]) || E.NV.clip[ten] || null;
  }

  // nạp 1 clip lớp "khung" cho thư mục clip gốc `tm` (đúng số khung với clip gốc) – lười, nạp lần đầu cần
  function napKhung(L, tm, n){
    const o = L.khung[tm] = {ok:false, hinh:[], dang:true};
    Promise.all(Array.from({length:n}, (_, i) => anh(L.dir + tm + '/f' + pad(i) + '.png'))).then(ds => {
      o.dang = false;
      if (ds.every(Boolean)){ o.hinh = ds; o.ok = true; }   // thiếu 1 khung → bỏ cả clip (tránh nhấp nháy)
    });
    return o;
  }

  async function nap(url, clipThem){
    url = url || '../thu-mat-na/trang-bi.json';
    try { st.json = await fetch(url + '?v=' + BUSTER, {cache:'no-store'}).then(r => r.json()); }
    catch (e){ st.json = {lop:{}, cap_suc_manh:[]}; }
    st.goc = new URL(st.json.goc || '../../art/kiem-khach-lop/', new URL(url, location.href)).href;
    const ds = Object.entries(st.json.lop || {});
    await Promise.all(ds.map(async ([id, d]) => {
      const L = st.lop[id] = {id, d, dir:st.goc + id + '/', coAnh:false, khung:{}, anhNeo:[]};
      if (d.tat || d.co_anh !== true) return;            // chưa ghi co_anh:true (ảnh chưa XONG) → không dò, không tải gì
      if ((d.kieu || 'khung') === 'khung'){
        L.coAnh = !!(await anh(L.dir + 'dung/f00.png'));   // dò 1 ảnh: chưa có → lớp chưa bật, không dò thêm
      } else {
        const n = d.so_hinh_neo || 1;
        const a = await Promise.all(Array.from({length:n}, (_, i) => anh(L.dir + (d.tep || 'neo') + pad(i) + '.png')));
        if (a.every(Boolean)){ L.anhNeo = a; L.coAnh = true; }
      }
    }));
    // trạng thái: URL > lưu > mặc định (không đeo gì, cấp 0)
    const luu = docLuu() || {};
    st.deo = Array.isArray(luu.deo) ? luu.deo.filter(id => st.lop[id]) : [];
    st.cap = luu.cap | 0;
    const q = new URLSearchParams(location.search);
    if (q.has('trangbi')) st.deo = q.get('trangbi').split(',').filter(id => st.lop[id]);
    if (q.has('sucmanh')) st.cap = Math.max(0, q.get('sucmanh') | 0);
    st.nap = true;
    // nạp trước ảnh lớp (đã có ảnh) cho mọi clip đã biết – tránh lớp "hiện trễ" ở lần đầu ra đòn
    const E = typeof DongCoMN !== 'undefined' ? DongCoMN : null;
    if (E) for (const L of Object.values(st.lop)) if (L.coAnh && (L.d.kieu || 'khung') === 'khung')
      for (const C of [...Object.values(E.NV.clip), ...Object.values(E.NV.capClip || {}), ...(clipThem || [])])
        if (C && C.ok){ const tm = String(C.def.thu_muc).replace(/\/$/, ''); if (!L.khung[tm]) napKhung(L, tm, C.hinh.length); }
    return API;
  }

  /* ---------- đeo / gỡ / cấp ---------- */
  // lớp đang hiển thị = lớp đeo tay + lớp tự gắn theo cấp sức mạnh; cùng "khe" thì lớp sau thay lớp trước
  function lopHien(){
    const caps = st.json ? (st.json.cap_suc_manh || []) : [];
    const ids = [];
    for (let i = 0; i <= Math.min(st.cap, caps.length - 1); i++) ids.push(...(caps[i].lop || []));
    ids.push(...st.deo);
    const theoKhe = new Map();
    for (const id of ids){ const L = st.lop[id]; if (!L || !L.coAnh) continue; theoKhe.set(L.d.khe || id, L); }
    return [...theoKhe.values()].sort((a, b) => (a.d.thu_tu || 0) - (b.d.thu_tu || 0));
  }
  function deo(id){ if (!st.lop[id] || st.deo.includes(id)) return false; const k = st.lop[id].d.khe;
    if (k) st.deo = st.deo.filter(x => (st.lop[x].d.khe || x) !== k);
    st.deo.push(id); ghiLuu(); bao({k:'deo', id}); return true; }
  function go(id){ const n = st.deo.length; st.deo = st.deo.filter(x => x !== id); if (st.deo.length !== n){ ghiLuu(); bao({k:'go', id}); return true; } return false; }
  function datCap(n){ n = Math.max(0, n | 0); if (n === st.cap) return; st.cap = n; ghiLuu(); bao({k:'cap', cap:n}); }

  // điều kiện mở cấp: mỗi mục trong dieu_kien phải đạt. tienDo do phiên "do"/trang cung cấp.
  //   {"trum": ["trum-v1"]}  đã hạ các trùm này · {"manh_am": 30} có ≥ 30 · {"chuong": 2} giữ ≥ 2 chuông · {"co": ["mat-na-ban-ngan"]} có vật này
  function datDieuKien(dk, td){
    for (const [k, v] of Object.entries(dk || {})){
      const c = td[k];
      if (Array.isArray(v)){ const co = Array.isArray(c) ? c : []; if (!v.every(x => co.includes(x))) return false; }
      else if (typeof v === 'number'){ if (!((+c || 0) >= v)) return false; }
      else if (v && !c) return false;
    }
    return true;
  }
  function capTheoTienDo(td){
    const caps = (st.json && st.json.cap_suc_manh) || []; let n = 0;
    for (let i = 1; i < caps.length; i++){ if (datDieuKien(caps[i].dieu_kien, td || {})) n = i; else break; }
    return n;
  }
  // chỉ số cộng thêm của cấp hiện tại (cộng dồn các cấp ≤ cap) – trang tự quyết dùng hay không; cấp 0 = không đổi gì
  function chiSo(){
    const caps = (st.json && st.json.cap_suc_manh) || [], o = {mau_them:0, sat_thuong_nhan:1, vong_them:0};
    for (let i = 1; i <= Math.min(st.cap, caps.length - 1); i++){
      const c = caps[i].chi_so || {};
      o.mau_them += c.mau_them || 0; o.vong_them += c.vong_them || 0; o.sat_thuong_nhan *= c.sat_thuong_nhan || 1;
    }
    for (const id of st.deo){ const c = (st.lop[id] && st.lop[id].d.chi_so) || {};
      o.mau_them += c.mau_them || 0; o.vong_them += c.vong_them || 0; o.sat_thuong_nhan *= c.sat_thuong_nhan || 1; }
    return o;
  }

  /* ---------- VẼ ---------- */
  // dùng chung SpriteMN.ve để lật / loé trắng / mờ giống hệt thân
  function veMot(g, L, ten, k, fx, fy, lat, s, alpha, trang){
    const C = clipGoc(ten); if (!C || !C.ok) return;
    const tm = String(C.def.thu_muc || ten).replace(/\/$/, ''), n = C.hinh.length;
    const d = L.d;
    if (d.clip && !d.clip.includes(ten) && !d.clip.includes(tm)) return;          // lớp chỉ khai báo cho một số clip
    if ((d.kieu || 'khung') === 'khung'){
      const o = L.khung[tm] || napKhung(L, tm, n);
      if (!o.ok || o.hinh.length !== n) return;
      SpriteMN.ve(g, {hinh:o.hinh, chan:C.chan}, k, fx, fy, lat, s, alpha, trang);
    } else {
      const neo = d.neo && (d.neo[tm] || d.neo[ten]); if (!neo) return;          // clip chưa đo điểm neo → ẩn
      const p = neo[Math.max(0, Math.min(neo.length - 1, k))]; if (!p) return;   // [x, y] trong ảnh gốc 256×256 (mặt PHẢI)
      const msN = d.ms_neo || 120, i = L.anhNeo.length > 1 ? Math.floor(performance.now() / msN) % L.anhNeo.length : 0;
      const img = L.anhNeo[i], an = d.chan_neo || [img.width >> 1, img.height >> 1];
      // điểm neo của ảnh nhỏ đặt tại điểm p của khung gốc → chân ảo = an + (chan gốc − p)
      SpriteMN.ve(g, {hinh:[img], chan:[an[0] + C.chan[0] - p[0], an[1] + C.chan[1] - p[1]]}, 0, fx, fy, lat, s, alpha, trang);
    }
  }
  function ve(lop, g, ten, k, fx, fy, lat, s, alpha, trang){
    if (!st.nap) return;
    for (const L of lopHien()) if ((L.d.z || 'truoc') === lop) veMot(g, L, ten, k, fx, fy, lat, s, alpha, trang);
  }

  const API = {nap, deo, go, datCap, capTheoTienDo, chiSo,
    veSau:(...a) => ve('sau', ...a), veTruoc:(...a) => ve('truoc', ...a),
    dangDeo:() => st.deo.slice(), cap:() => st.cap, coAnh:id => !!(st.lop[id] && st.lop[id].coAnh),
    dsLop:() => Object.values(st.lop).map(L => ({id:L.id, ten:L.d.ten, khe:L.d.khe || '', coAnh:L.coAnh, kieu:L.d.kieu || 'khung'})),
    dsCap:() => ((st.json && st.json.cap_suc_manh) || []).map((c, i) => ({cap:i, ten:c.ten, dieu_kien:c.dieu_kien || {}, lop:c.lop || []})),
    lopDangHien:() => lopHien().map(L => L.id), cauHinh:() => ({ap_chi_so:!!(st.json && st.json.ap_chi_so), tu_dong_cap:!!(st.json && st.json.tu_dong_cap)}), dangKy:f => st.nghe.push(f), get daNap(){ return st.nap; }};
  return API;
})();
if (typeof window !== 'undefined') window.LopTrangBi = LopTrangBi;
