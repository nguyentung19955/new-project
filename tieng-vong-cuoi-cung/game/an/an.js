'use strict';
/* an.js – VẬT PHẨM ẨN + NHIỆM VỤ ẨN (phiên "an"). Logic thuần, KHÔNG vẽ gì. Chạy cả trình duyệt lẫn Node (phép thử).
   Dữ liệu: game/an/du-lieu.json (bí mật + nhiệm vụ ẩn của mọi vùng). Lưu riêng khoá 'tvcc-an' (không đụng bản lưu vùng).

   const A = BiMat.tao(duLieu, trangThaiCu?, {coAnh:(p)=>bool})
   A.suKien(ev, the)  → danh sách việc mới xảy ra [{k:'bi-mat'|'nv-lo'|'nv-xong'|'tien-do', muc, thuong:[...]}]
       ev  : {k:'vao-phong', vung, phong} | {k:'nhat', vung, phong, id} | {k:'vo-tuong', vung, phong, cot, hang}
             | {k:'cham-o', vung, phong, o:'G', cot, hang} | {k:'bi-danh', vung, phong} | {k:'ha-trum', vung, phong}
             | {k:'dung-im', vung, phong, cot, hang, giay} | {k:'kiem'}  (chỉ xét lại điều kiện)
       the : ảnh chụp thế giới hiện tại {kho:{loai:số}, co:(ten)=>bool, daNhat:[id]} – vùng tự cung cấp
   A.nhatKy(vung?)    → dòng nhật ký (chỉ những nhiệm vụ đã LỘ; chưa lộ thì không hiện gì)
   A.dem(vung)        → {timThay, tong} bí mật đang bật của vùng
   A.thuongCho()/A.daTraThuong(i) – phần thưởng chưa trao được (thiếu hình/hệ thống) giữ lại, trao sau, không mất
   A.luu()            → trạng thái để JSON hoá
   A.moTruyen(id)     → mở đoạn truyện bí mật (false nếu truyện còn chờ ChatGPT → giữ chờ)
   A.theTen(the)      → Thẻ Tên đã nhặt kèm chữ khắc ; A.truyenDaMo() ; A.demLoiTat(vung)
   Mục có "cho_chatgpt"/"cho_tinh_nang" hoặc thiếu ảnh trong "can_anh" → TẮT (không đếm, không kích hoạt).
   Bí mật loai:"loi_tat" (lối tắt) đếm riêng, KHÔNG vào "Secret Found" (ChatGPT 02/11). Kết quả có thêm k:'loi-tat' | 'thanh-tuu'. */
(function(goc){
  const KHOA_LUU = 'tvcc-an', PHIEN_BAN = 1;

  function moi(){ return {phien_ban:PHIEN_BAN, bm:[], lt:[], nvLo:[], nvXong:[], tt:[], truyen:[], co:{}, dem:{}, cho:[]}; }

  function tao(D, cu, tuyChon){
    const o = tuyChon || {}, coAnh = o.coAnh || (() => false);
    const S = Object.assign(moi(), cu && cu.phien_ban === PHIEN_BAN ? JSON.parse(JSON.stringify(cu)) : {});
    const bat = m => !m.cho_chatgpt && !m.cho_tinh_nang && (m.can_anh || []).every(coAnh);
    const BM = (D.bi_mat || []).filter(bat), NV = (D.nhiem_vu || []).filter(bat);
    const laLT = b => b.loai === 'loi_tat', daCo = b => (laLT(b) ? S.lt : S.bm).includes(b.id);
    const them = (mang, v) => { if (mang.includes(v)) return false; mang.push(v); return true; };
    // bản lưu cũ: lối tắt từng bị đếm như bí mật → chuyển sang bộ đếm lối tắt
    for (const b of (D.bi_mat || []).filter(laLT)){ const i = S.bm.indexOf(b.id); if (i >= 0){ S.bm.splice(i, 1); them(S.lt, b.id); } }
    let ctx = {ev:{}, the:{}};

    /* Điều kiện (JSON). Đánh giá theo sự kiện vừa xảy ra + trạng thái đã lưu + thế giới hiện tại. */
    function dk(c){
      const ev = ctx.ev, the = ctx.the;
      if (c === true) return true;
      if (!c) return false;
      if (c.tat_ca) return c.tat_ca.every(dk);
      if (c.mot_trong) return c.mot_trong.some(dk);
      if (c.khong) return !dk(c.khong);
      if (c.nhat) return (the.daNhat || []).includes(c.nhat) || (ev.k === 'nhat' && ev.id === c.nhat);
      if (c.dem) return ((the.kho || {})[c.dem.loai] || 0) >= c.dem.so;
      if (c.co) return !!S.co[c.co] || !!(the.co && the.co(c.co));
      if (c.bi_mat) return S.bm.includes(c.bi_mat);
      if (c.nv_xong) return S.nvXong.includes(c.nv_xong);
      if (c.dang_o) return ev.phong === c.dang_o;
      if (c.vao_phong) return ev.k === 'vao-phong' && ev.phong === c.vao_phong;
      if (c.qua) return ev.k === 'vao-phong' && ev.phong === c.qua.den && ev.tu === c.qua.tu;   // đi qua cửa nối 2 phòng (lối tắt)
      if (c.vo_tuong) return ev.k === 'vo-tuong' && ev.phong === c.vo_tuong.phong &&
        (c.vo_tuong.cot === undefined || Math.abs(ev.cot - c.vo_tuong.cot) <= (c.vo_tuong.lech || 0)) &&
        (c.vo_tuong.hang === undefined || Math.abs(ev.hang - c.vo_tuong.hang) <= (c.vo_tuong.lech || 0));
      if (c.cham_o) return ev.k === 'cham-o' && ev.phong === c.cham_o.phong && ev.o === c.cham_o.o;
      if (c.dung_im) return ev.k === 'dung-im' && ev.phong === c.dung_im.phong && (ev.giay || 0) >= (c.dung_im.giay || 3) &&
        Math.abs(ev.cot - c.dung_im.cot) <= (c.dung_im.ban_kinh || 1) && Math.abs(ev.hang - c.dung_im.hang) <= (c.dung_im.ban_kinh || 1);
      if (c.trum_sach) return !!S.co['trum_sach:' + c.trum_sach];
      return false;
    }

    /* Bộ đếm "thắng trùm không trúng đòn": vào phòng trùm → đặt 0; trúng đòn trong phòng trùm → +1; hạ trùm với 0 → cờ trum_sach:<vùng>. */
    function demTrum(ev){
      const dTrum = (D.phong_trum || {})[ev.vung];
      if (!dTrum) return;
      const khoa = 'trung:' + ev.vung;
      if (ev.k === 'vao-phong' && ev.phong === dTrum) S.dem[khoa] = 0;
      if (ev.k === 'bi-danh' && ev.phong === dTrum) S.dem[khoa] = (S.dem[khoa] || 0) + 1;
      if (ev.k === 'ha-trum' && ev.phong === dTrum && S.dem[khoa] === 0) S.co['trum_sach:' + ev.vung] = true;
    }

    function suKien(ev, the){
      ctx = {ev:ev || {}, the:the || {}};
      demTrum(ctx.ev);
      const ra = [];
      const timRa = b => { if (laLT(b)){ S.lt.push(b.id); ra.push({k:'loi-tat', muc:b, thuong:traThuong(b.thuong)}); }
                           else { S.bm.push(b.id); ra.push({k:'bi-mat', muc:b, thuong:traThuong(b.thuong)}); } };
      for (const b of BM){
        if (daCo(b) || (b.vung && ctx.ev.vung && b.vung !== ctx.ev.vung && !b.moi_vung)) continue;
        if (dk(b.dieu_kien)) timRa(b);
      }
      // xét nhiệm vụ nhiều lượt: hoàn thành một cái có thể làm lộ / xong cái khác (vd "tìm hết bí mật")
      for (let lap = 0, doi = true; doi && lap < 4; lap++){
        doi = false;
        for (const n of NV){
          if (!S.nvLo.includes(n.id) && dk(n.lo || true)){ S.nvLo.push(n.id); ra.push({k:'nv-lo', muc:n}); doi = true; }
          if (S.nvLo.includes(n.id) && !S.nvXong.includes(n.id) && dk(n.xong)){
            S.nvXong.push(n.id); ra.push({k:'nv-xong', muc:n, thuong:traThuong(n.thuong)}); doi = true;
          } else if (S.nvLo.includes(n.id) && !S.nvXong.includes(n.id) && n.tien_do && ctx.ev.k === 'nhat'){
            const t = tienDo(n); if (t && t.da > (S.dem['td:' + n.id] || 0)){ S.dem['td:' + n.id] = t.da; ra.push({k:'tien-do', muc:n, td:t}); }
          }
        }
        // bí mật có thể phụ thuộc nhiệm vụ (và ngược lại)
        for (const b of BM) if (!daCo(b) && (b.dieu_kien && (b.dieu_kien.nv_xong || b.dieu_kien.tat_ca)) && dk(b.dieu_kien)){ timRa(b); doi = true; }
      }
      // thành tựu tự động: tìm hết bí mật (đang bật) của một vùng
      for (const t of D.thanh_tuu || []){
        if (!t.dieu_kien_vung || S.tt.includes(t.id)) continue;
        const d = dem(t.dieu_kien_vung); if (d.tong && d.timThay === d.tong){ S.tt.push(t.id); ra.push({k:'thanh-tuu', muc:t}); }
      }
      return ra;
    }
    function tienDo(n){
      const t = n.tien_do; if (!t) return null;
      if (t.dem) return {da:Math.min(t.so, (ctx.the.kho || {})[t.dem] || 0), tong:t.so};
      if (t.bi_mat_vung){ const d = dem(t.bi_mat_vung); return {da:d.timThay, tong:d.tong}; }
      return null;
    }

    /* Phần thưởng: trả về danh sách để vùng trao (an.js không biết gì về vùng). Thành tựu ghi luôn ở đây. */
    function traThuong(ds){
      const ra = [];
      for (const t of ds || []){
        if (t.loai === 'thanh_tuu'){ if (them(S.tt, t.id)) ra.push(t); continue; }
        ra.push(Object.assign({}, t));
      }
      return ra;
    }

    function dem(vung){
      const ds = BM.filter(b => !laLT(b) && (!vung || b.vung === vung));
      return {timThay:ds.filter(b => S.bm.includes(b.id)).length, tong:ds.length};
    }
    function nhatKy(vung){
      return NV.filter(n => S.nvLo.includes(n.id) && (!vung || n.vung === vung)).map(n => {
        ctx = {ev:{}, the:o.the ? o.the() : ctx.the};
        const xong = S.nvXong.includes(n.id), td = tienDo(n);
        return {id:n.id, ten:n.ten, goi_y:n.goi_y || '', xong, td, bieu_tuong:n.bieu_tuong || null, vung:n.vung,
          trang_thai:xong ? 'Remembered' : td && td.da > 0 ? 'Unfinished' : 'Discovered'};
      });
    }
    function moTruyen(id){
      const t = (D.truyen || {})[id]; if (!t || t.cho_chatgpt || !t.chu) return false;
      them(S.truyen, id); return true;
    }
    function theTen(the){
      const da = (the || (o.the ? o.the() : {})).daNhat || [];
      return Object.keys(D.the_ten || {}).filter(id => da.includes(id)).map(id => Object.assign({id}, D.the_ten[id]));
    }

    return {
      S, D, BM, NV, KHOA_LUU, suKien, dem, nhatKy, dk:c => dk(c),
      daTim: id => S.bm.includes(id) || S.lt.includes(id), daXong: id => S.nvXong.includes(id), thanhTuu: () => S.tt.slice(),
      giuCho(t){ S.cho.push(t); }, thuongCho: () => S.cho.slice(), daTraThuong(i){ S.cho.splice(i, 1); },
      moTruyen, theTen, truyenDaMo: () => S.truyen.map(id => Object.assign({id}, D.truyen[id])),
      demLoiTat: vung => { const ds = BM.filter(b => laLT(b) && (!vung || b.vung === vung)); return {mo:ds.filter(b => S.lt.includes(b.id)).length, tong:ds.length}; },
      luu: () => JSON.parse(JSON.stringify(S))
    };
  }

  const API = {tao, moi, KHOA_LUU, PHIEN_BAN};
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else goc.BiMat = API;
})(typeof window !== 'undefined' ? window : globalThis);
