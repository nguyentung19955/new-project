'use strict';
/* he-thong.js – Hệ thống tiến triển / Charm / cây kỹ năng (phiên "do"). Logic thuần, KHÔNG vẽ gì; chạy cả trình duyệt lẫn Node (kiểm thử).
   Phiên bản 2 – theo tư vấn ChatGPT (docs/he-thong-do/tu-van-chatgpt.txt). Dữ liệu: game/he-thong/du-lieu.json.
   Trạng thái lưu riêng (khoá localStorage 'tvcc-he-thong'), không đụng bản lưu Vùng 1.

   const ht = HeThong.tao(D, trangThaiCu?, {coAnh(p), coCo(ten), coChe:[...], soKyUc(), ngauNhien(), vung:'vung-1'})
     ht.congDiem(nguon, {khoa})  nguon: 'quai_thuong'|'quai_manh'|'tinh_anh'|'trum'|'bi_mat'|'thu_thach_ky_uc'|số → {them, lenCap, laDau, moChon}
                                 (moChon = lần này mở lựa chọn Charm đầu → KHÔNG rơi thêm Charm ngẫu nhiên)
                                 tinh_anh + khoa: lần đầu 45, tái đấu 15; lần đầu tiên hạ tinh anh → mở lựa chọn Charm đầu (S.choChon)
     ht.cap() / ht.notCon() / ht.nguongCap(L) / ht.diemCapSau()
     ht.trangThaiNut(id)          'da_mo'|'mo_duoc'|'thieu_not'|'thieu_cap'|'thieu_nut_truoc'|'thieu_dieu_kien'|'thieu_thu_thach'|'chua_co_che'|'cho_anh'
     ht.moNut(id) / ht.xongThuThach(id)
     ht.chonCharmDau(id)          chọn 1 trong 2 Charm đầu (không RNG)
     ht.roiDo(nguon)              → {mon, phanRa, dust} | null   (Charm Faded trùng mẫu đã có → tự phân rã thành Echo Dust: không có đồ rác)
     ht.phanRa(uid) / ht.lap(uid) / ht.go(uid) / ht.oDaDung() / ht.oToiDa()
     ht.taiRen(uid, iDong, traShard) / ht.giuKetQua(uid, giuMoi)   (Morrow – tắt tới khi có Morrow)
     ht.chiSo()                   tổng hiệu ứng (đã áp trần cộng dồn)
     ht.capSucManh() / ht.trangBiDangDung()   – cho phiên "sucmanh" (lop-trang-bi.js)
     ht.luu()
*/
(function(goc){
  const PHIEN = 2;

  function mulberry32(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  function trangThaiMoi(){
    return {phien:PHIEN, diem:0, notDaTieu:0, nut:[], tui:[], lap:[], dem:0, dust:0, capKiem:0,
      tinhAnhDa:[], choChon:null, daChonDau:false, thuThach:[], hat:(Date.now() >>> 0) || 1};
  }

  function tao(D, cu, tuyChon){
    const O = tuyChon || {};
    const S = (cu && cu.phien === PHIEN) ? Object.assign(trangThaiMoi(), cu) : trangThaiMoi();
    const coAnh = O.coAnh || (() => false);
    const coCo = O.coCo || (() => false);
    const coChe = new Set(O.coChe || []);
    const vung = O.vung || 'vung-1';
    const rnd = O.ngauNhien || mulberry32(S.hat);
    const NUT = {}; for (const n of D.cay) NUT[n.id] = n;
    const MAU = {}; for (const m of D.charm) MAU[m.id] = m;
    const HIEM = {}; D.do_hiem.forEach((h, i) => { HIEM[h.id] = Object.assign({thu_tu:i}, h); });
    const Dm = D.diem, moc = Dm.moc_cap;

    /* ---------- cấp ---------- */
    function nguongCap(L){
      if (L <= 1) return 0;
      if (L <= moc.length) return moc[L - 1];
      let x = moc[moc.length - 1];
      for (let k = moc.length; k < L; k++) x += Dm.sau_cap_12.co_ban + Dm.sau_cap_12.moi_cap * (k - moc.length);
      return x;
    }
    function cap(){ let L = 1; while (L < Dm.cap_toi_da && S.diem >= nguongCap(L + 1)) L++; return L; }
    function notCon(){ return cap() - 1 - S.notDaTieu; }
    const tuKhoang = v => Array.isArray(v) ? v[0] + Math.floor(rnd() * (v[1] - v[0] + 1)) : (v || 0);
    function heSoGiam(nguon){
      const g = Dm.giam_dan; if (!g || !(g.ap_cho || []).includes(nguon)) return 1;
      const muc = (g.cap_muc_tieu || {})[vung]; if (!muc) return 1;
      const vuot = cap() - muc; return vuot > 0 ? Math.max(g.toi_thieu, 1 - g.moi_cap_vuot * vuot) : 1;
    }
    function congDiem(nguon, o){
      o = o || {}; let laDau = false;
      if (nguon === 'tinh_anh' && o.khoa){
        if (S.tinhAnhDa.includes(o.khoa)) nguon = 'tinh_anh_tai_dau';
        else { laDau = true; S.tinhAnhDa.push(o.khoa); }
      }
      let moChon = false;
      if (nguon === 'tinh_anh' && !S.daChonDau && !S.choChon && D.charm_dau){ S.choChon = D.charm_dau.chon.slice(); moChon = true; }
      const goc = typeof nguon === 'number' ? nguon : tuKhoang(Dm[nguon]);
      const truoc = cap();
      const them = Math.max(goc > 0 ? 1 : 0, Math.round(goc * heSoGiam(nguon) * (1 + (chiSo().am_diem || 0) / 100)));
      S.diem += them;
      return {them, lenCap:cap() - truoc, laDau, moChon};
    }

    /* ---------- cây kỹ năng ---------- */
    const duAnh = n => !(n.can_anh && n.can_anh.length) || n.can_anh.every(coAnh);
    function trangThaiNut(id){
      const n = NUT[id]; if (!n) return 'khong_co';
      if (S.nut.includes(id)) return 'da_mo';
      if (n.can_co_che && !coChe.has(n.can_co_che)) return 'chua_co_che';
      if (!duAnh(n)) return 'cho_anh';
      if (cap() < (n.cap || 1)) return 'thieu_cap';
      if ((n.can_co || []).some(c => !coCo(c))) return 'thieu_dieu_kien';
      if (n.can_thu_thach && !S.thuThach.includes(n.can_thu_thach)) return 'thieu_thu_thach';
      if ((n.can || []).some(k => !S.nut.includes(k))) return 'thieu_nut_truoc';
      if (notCon() < n.gia) return 'thieu_not';
      return 'mo_duoc';
    }
    function moNut(id){
      const t = trangThaiNut(id);
      if (t !== 'mo_duoc') return {ok:false, ly:t};
      S.nut.push(id); S.notDaTieu += NUT[id].gia; return {ok:true};
    }
    function xongThuThach(id){ if (!S.thuThach.includes(id)) S.thuThach.push(id); }

    /* ---------- Charm ---------- */
    function chonDoHiem(){
      const w = (D.trong_so_hiem || {})[vung] || D.trong_so_hiem.cuoi;
      let tong = w.reduce((a, b) => a + b, 0), r = rnd() * tong;
      for (let i = 0; i < w.length; i++){ r -= w[i]; if (r < 0) return D.do_hiem[i]; }
      return D.do_hiem[0];
    }
    function taoMon(mauId, hiemId){
      const h = HIEM[hiemId];
      const kho = D.dong_phu.filter(d => !d.can_co_che || coChe.has(d.can_co_che)), dp = [];
      for (let i = 0; i < h.dong_phu && kho.length; i++){
        const d = kho.splice(Math.floor(rnd() * kho.length), 1)[0];
        dp.push({id:d.id, v:d.min + Math.floor(rnd() * (d.max - d.min + 1))});
      }
      return {uid:'c' + (++S.dem), mau:mauId, hiem:hiemId, dong:dp, lanRen:0};
    }
    const dustCua = m => ((D.echo_dust || {}).phan_ra || {})[m.hiem] || 0;
    function roiDo(nguon){   // tinh anh: gọi 'tinh_anh' cho lần đầu, 'tinh_anh_tai_dau' cho tái đấu (lấy từ congDiem().laDau)
      const tl = (D.roi_do || {})[nguon] || 0;
      if (rnd() >= tl) return null;
      const mau = D.charm[Math.floor(rnd() * D.charm.length)];
      const mon = taoMon(mau.id, chonDoHiem().id);
      if (mon.dong.length === 0 && S.tui.some(m => m.mau === mon.mau)){   // trùng, không dòng phụ → không thể tốt hơn món đang có
        const d = dustCua(mon); S.dust += d; return {mon, phanRa:true, dust:d};
      }
      S.tui.push(mon); return {mon, phanRa:false, dust:0};
    }
    function chonCharmDau(id){
      if (!S.choChon || !S.choChon.includes(id)) return {ok:false, ly:'khong_co_lua_chon'};
      const mon = taoMon(id, (D.charm_dau && D.charm_dau.do_hiem) || D.do_hiem[0].id);
      S.tui.push(mon); S.choChon = null; S.daChonDau = true; return {ok:true, mon};
    }
    const tim = uid => S.tui.find(m => m.uid === uid);
    function phanRa(uid){
      const m = tim(uid); if (!m) return {ok:false, ly:'khong_co'};
      go(uid); S.tui.splice(S.tui.indexOf(m), 1);
      const d = dustCua(m); S.dust += d; return {ok:true, dust:d};
    }
    function oDaDung(){ return S.lap.reduce((a, u) => a + ((MAU[(tim(u) || {}).mau] || {}).o || 0), 0); }
    function oToiDa(){
      const C = D.o_charm, ky = O.soKyUc ? (O.soKyUc() | 0) : 0;
      return Math.min(C.o_toi_da, C.o_dau + C.moc_ky_uc.filter(x => ky >= x).length);
    }
    function lap(uid){
      const m = tim(uid); if (!m) return {ok:false, ly:'khong_co'};
      if (S.lap.includes(uid)) return {ok:false, ly:'da_lap'};
      if (S.lap.some(u => (tim(u) || {}).mau === m.mau)) return {ok:false, ly:'trung_mau'};
      if (oDaDung() + MAU[m.mau].o > oToiDa()) return {ok:false, ly:'het_o'};
      S.lap.push(uid); return {ok:true};
    }
    function go(uid){ const i = S.lap.indexOf(uid); if (i < 0) return {ok:false}; S.lap.splice(i, 1); return {ok:true}; }

    /* ---------- tái rèn (Morrow) ---------- */
    function giaRen(m){ const g = D.tai_ren.gia; return g[Math.min(m.lanRen || 0, g.length - 1)]; }
    function taiRen(uid, iDong, traShard){
      if (!(D.tai_ren.bat || O.choTaiRen)) return {ok:false, ly:'chua_mo'};
      const m = tim(uid); if (!m || !m.dong[iDong]) return {ok:false, ly:'khong_co'};
      if (m.choGiu) return {ok:false, ly:'dang_cho_chon'};
      const g = giaRen(m);
      if (S.dust < g.dust) return {ok:false, ly:'thieu_dust'};
      if (!traShard || !traShard(g.shard)) return {ok:false, ly:'thieu_shard'};
      S.dust -= g.dust; m.lanRen = (m.lanRen || 0) + 1;
      const khac = new Set(m.dong.filter((_, i) => i !== iDong).map(d => d.id));
      const kho = D.dong_phu.filter(d => !khac.has(d.id) && (!d.can_co_che || coChe.has(d.can_co_che)));
      const d = kho[Math.floor(rnd() * kho.length)];
      m.choGiu = {i:iDong, moi:{id:d.id, v:d.min + Math.floor(rnd() * (d.max - d.min + 1))}};
      return {ok:true, cu:m.dong[iDong], moi:m.choGiu.moi};
    }
    function giuKetQua(uid, giuMoi){
      const m = tim(uid); if (!m || !m.choGiu) return {ok:false};
      if (giuMoi) m.dong[m.choGiu.i] = m.choGiu.moi;
      delete m.choGiu; return {ok:true};
    }

    /* ---------- chỉ số ---------- */
    function chiSo(){
      const c = {sat_thuong:0, manh_am:0, am_diem:0, hoi_mau:0, khang:0, hoi_echo:0, khang_bay:0, cap_kiem:S.capKiem || 0,
        them_nhat:[], vfx_chem:null, hoan_hoi:null, ket_lieu_hoi:null, tren_khong_khang:0};
      const tb = {sat_thuong:0, khang:0, hoi_echo:0};   // phần từ trang bị → áp trần
      const cong = (hu, tuTrangBi) => { for (const [k, v] of Object.entries(hu || {})){
        if (k === 'them_nhat') c.them_nhat.push(v);
        else if (k === 'vfx_chem' || k === 'hoan_hoi' || k === 'ket_lieu_hoi') c[k] = v;
        else if (k === 'sat_thuong_cay') c.sat_thuong += v;
        else if (k === 'khang_cay') c.khang += v;
        else if (k === 'tren_khong_khang') c.tren_khong_khang = Math.max(c.tren_khong_khang, v);
        else if (tuTrangBi && k in tb) tb[k] += v;
        else c[k] = (c[k] || 0) + v; } };
      for (const id of S.nut) if (NUT[id] && duAnh(NUT[id])) cong(NUT[id].hieu_ung, false);
      for (const u of S.lap){ const m = tim(u); if (!m || !MAU[m.mau]) continue; cong(MAU[m.mau].hieu_ung, true); for (const d of m.dong) cong({[d.id]:d.v}, true); }
      const T = D.tran || {};
      c.sat_thuong += Math.min(tb.sat_thuong, T.sat_thuong ?? 1e9);
      c.khang += Math.min(tb.khang, T.khang ?? 1e9);
      c.hoi_echo += Math.min(tb.hoi_echo, T.hoi_echo ?? 1e9);
      return c;
    }
    function capSucManh(){ const n = S.nut.length; return n >= 6 ? 3 : n >= 4 ? 2 : n >= 1 ? 1 : 0; }
    function trangBiDangDung(){ return S.lap.map(tim).filter(Boolean).map(m => ({uid:m.uid, mau:m.mau, hiem:m.hiem})); }
    function moTaDong(d){ const g = D.dong_phu.find(x => x.id === d.id); return g ? g.ten + ': ' + g.mo_ta.replace('{v}', d.v) : d.id; }

    return {S, D, cap, notCon, nguongCap, congDiem, trangThaiNut, moNut, xongThuThach, roiDo, chonCharmDau, phanRa, lap, go, oDaDung, oToiDa,
      taiRen, giuKetQua, giaRen, chiSo, capSucManh, trangBiDangDung, moTaDong, tim, MAU, HIEM,
      diemCapSau(){ const c = cap(); return c < Dm.cap_toi_da ? nguongCap(c + 1) : null; },
      luu(){ return JSON.parse(JSON.stringify(S)); }};
  }

  const HeThong = {tao, PHIEN, mulberry32, KHOA_LUU:'tvcc-he-thong'};
  if (typeof module !== 'undefined' && module.exports) module.exports = HeThong;
  else goc.HeThong = HeThong;
})(typeof window !== 'undefined' ? window : globalThis);
