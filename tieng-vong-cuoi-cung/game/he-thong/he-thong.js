'use strict';
/* he-thong.js – Hệ thống đồ / điểm / mở khoá (phiên "do"). Logic thuần, KHÔNG vẽ gì, chạy được cả trình duyệt lẫn Node (kiểm thử).
   Dữ liệu: game/he-thong/du-lieu.json. Trạng thái lưu riêng (khoá localStorage 'tvcc-he-thong'), không đụng bản lưu Vùng 1.

   API chính (cho Vùng 1 và phiên "sucmanh" – game/thu-mat-na/lop-trang-bi.js – đọc):
     const ht = HeThong.tao(duLieu, trangThaiCu?, {coAnh:(duongDan)=>bool, ngauNhien?:()=>số})
     ht.congDiem(nguon)            nguon: 'quai_thuong' | 'tinh_anh' | 'trum' | 'bi_mat' | số → {them, lenCap}
     ht.cap() / ht.notCon()       cấp hiện tại / số Nốt Ngân chưa tiêu
     ht.moNut(id)                 → {ok, ly}
     ht.trangThaiNut(id)          'da_mo' | 'mo_duoc' | 'thieu_not' | 'thieu_nut_truoc' | 'cho_anh'
     ht.roiDo(nguon, {sauTrum})   → món đồ (Âm Phù có độ hiếm + dòng phụ) hoặc null; tự cho vào túi
     ht.lap(uid) / ht.go(uid)     cắm / gỡ Âm Phù vào Dây Ngân (giới hạn ô)
     ht.chiSo()                   tổng hiệu ứng: {sat_thuong, manh_am, am_diem, hoi_mau, khang, cap_kiem, them_nhat:[], vet_kiem, clip_dung}
     ht.capSucManh()              0..3 – mức "mạnh lên" để phiên sucmanh chọn lớp hiển thị (gợi ý, chờ 2 phiên thống nhất)
     ht.trangBiDangDung()         danh sách Âm Phù đang cắm (id mẫu, độ hiếm) – phiên sucmanh dùng để hiện lên người
     ht.luu()                     đối tượng JSON để lưu
*/
(function(goc){
  const PHIEN = 1;

  function mulberry32(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  function trangThaiMoi(){ return {phien:PHIEN, diem:0, notDaTieu:0, nut:[], tui:[], lap:[], dem:0, hat:(Date.now() >>> 0) || 1}; }

  function tao(D, cu, tuyChon){
    const O = tuyChon || {};
    const S = (cu && cu.phien === PHIEN) ? Object.assign(trangThaiMoi(), cu) : trangThaiMoi();
    const coAnh = O.coAnh || (() => false);
    const rnd = O.ngauNhien || mulberry32(S.hat);
    const NUT = {}; for (const n of D.cay) NUT[n.id] = n;
    const MAU = {}; for (const m of D.am_phu) MAU[m.id] = m;
    const moc = D.diem.moc_cap;

    function cap(){ let c = 0; for (let i = 1; i < moc.length; i++) if (S.diem >= moc[i]) c = i; return c; }
    function notCon(){ return cap() - S.notDaTieu; }

    function congDiem(nguon){
      const goc = typeof nguon === 'number' ? nguon : (D.diem[nguon] || 0);
      const truoc = cap();
      const them = Math.round(goc * (1 + (chiSo().am_diem || 0) / 100));
      S.diem += them;
      return {them, lenCap:cap() - truoc};
    }

    function duAnh(n){ return !(n.can_anh && n.can_anh.length) || n.can_anh.every(coAnh); }
    function trangThaiNut(id){
      const n = NUT[id]; if (!n) return 'khong_co';
      if (S.nut.includes(id)) return 'da_mo';
      if (!duAnh(n)) return 'cho_anh';
      if ((n.can || []).some(k => !S.nut.includes(k))) return 'thieu_nut_truoc';
      if (notCon() < n.gia) return 'thieu_not';
      return 'mo_duoc';
    }
    function moNut(id){
      const t = trangThaiNut(id);
      if (t !== 'mo_duoc') return {ok:false, ly:t};
      S.nut.push(id); S.notDaTieu += NUT[id].gia; return {ok:true};
    }

    function chonDoHiem(sauTrum){
      const ds = D.do_hiem.filter(h => !h.chi_sau_trum || sauTrum);
      let tong = ds.reduce((a, h) => a + h.trong_so, 0), r = rnd() * tong;
      for (const h of ds){ r -= h.trong_so; if (r < 0) return h; }
      return ds[ds.length - 1];
    }
    function roiDo(nguon, o){
      const tl = (D.roi_do || {})[nguon] || 0;
      if (rnd() >= tl) return null;
      const mau = D.am_phu[Math.floor(rnd() * D.am_phu.length)];
      const h = chonDoHiem(o && o.sauTrum);
      const kho = D.dong_phu.slice(), dp = [];
      for (let i = 0; i < h.dong_phu && kho.length; i++){
        const d = kho.splice(Math.floor(rnd() * kho.length), 1)[0];
        dp.push({id:d.id, v:d.min + Math.floor(rnd() * (d.max - d.min + 1))});
      }
      const mon = {uid:'p' + (++S.dem), mau:mau.id, hiem:h.id, dong:dp};
      S.tui.push(mon); return mon;
    }
    const tim = uid => S.tui.find(m => m.uid === uid);
    function oDaDung(){ return S.lap.reduce((a, u) => a + ((MAU[(tim(u) || {}).mau] || {}).o || 0), 0); }
    function oToiDa(){ return D.day_ngan.o_dau; }   // +ô theo Mảnh Ký Ức: chờ thiết kế
    function lap(uid){
      const m = tim(uid); if (!m) return {ok:false, ly:'khong_co'};
      if (S.lap.includes(uid)) return {ok:false, ly:'da_lap'};
      if (oDaDung() + MAU[m.mau].o > oToiDa()) return {ok:false, ly:'het_o'};
      S.lap.push(uid); return {ok:true};
    }
    function go(uid){ const i = S.lap.indexOf(uid); if (i < 0) return {ok:false}; S.lap.splice(i, 1); return {ok:true}; }

    function chiSo(){
      const c = {sat_thuong:0, manh_am:0, am_diem:0, hoi_mau:0, khang:0, cap_kiem:0, them_nhat:[], vet_kiem:null, clip_dung:null};
      const cong = hu => { for (const [k, v] of Object.entries(hu || {})){
        if (k === 'cap_kiem') c.cap_kiem = Math.max(c.cap_kiem, v);
        else if (k === 'them_nhat') c.them_nhat.push(v);
        else if (k === 'vet_kiem' || k === 'clip_dung') c[k] = v;
        else c[k] = (c[k] || 0) + v; } };
      for (const id of S.nut) if (NUT[id] && duAnh(NUT[id])) cong(NUT[id].hieu_ung);
      for (const u of S.lap){ const m = tim(u); if (!m) continue; cong(MAU[m.mau].chinh); for (const d of m.dong) cong({[d.id]:d.v}); }
      return c;
    }
    function capSucManh(){ const n = S.nut.length; return n >= 6 ? 3 : n >= 4 ? 2 : n >= 1 ? 1 : 0; }
    function trangBiDangDung(){ return S.lap.map(tim).filter(Boolean).map(m => ({uid:m.uid, mau:m.mau, hiem:m.hiem})); }
    function moTaDong(d){ const g = D.dong_phu.find(x => x.id === d.id); return g ? g.ten.replace('{v}', d.v) : d.id; }

    return {S, D, cap, notCon, congDiem, trangThaiNut, moNut, roiDo, lap, go, oDaDung, oToiDa, chiSo, capSucManh, trangBiDangDung, moTaDong,
      diemCapSau(){ const c = cap(); return c + 1 < moc.length ? moc[c + 1] : null; },
      luu(){ return JSON.parse(JSON.stringify(S)); }};
  }

  const HeThong = {tao, PHIEN, mulberry32, KHOA_LUU:'tvcc-he-thong'};
  if (typeof module !== 'undefined' && module.exports) module.exports = HeThong;
  else goc.HeThong = HeThong;
})(typeof window !== 'undefined' ? window : globalThis);
