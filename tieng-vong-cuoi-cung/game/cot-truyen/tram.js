'use strict';
/* tram.js – logic TRẠM TELEPORT ở Làng Chuông (không vẽ). Gộp tram-dich-chuyen.json với game/the-gioi.json (nếu phiên Vùng mới đã tạo).
   Một vùng đi được khi: có duong_dan VÀ (điều kiện 'mo' đạt HOẶC LuuChung đã mở vùng đó). */
(function(goc){
  function gop(tram, theGioi){
    const ds = (tram && tram.vung || []).map(v => Object.assign({}, v));
    const tg = theGioi && (theGioi.vung || theGioi.ds_vung) || [];
    for (const v of tg){
      if (!v || !v.id) continue;
      const cu = ds.find(x => x.id === v.id);
      // the-gioi.json: 'trang' tính từ thư mục game/ → đổi sang đường dẫn từ gốc dự án; tên trong trạm (tên vùng theo gdd) được ưu tiên
      const moi = {ten: cu && cu.ten ? undefined : v.ten, duong_dan: v.duong_dan || (v.trang ? 'game/' + v.trang : v.url), diem_vao: v.diem_vao};
      for (const k of Object.keys(moi)) if (moi[k] === undefined) delete moi[k];
      if (cu) Object.assign(cu, moi); else ds.push(Object.assign({id: v.id, mo: null}, moi));
    }
    return ds;
  }
  function trangThai(ds, LC, datDK){
    return ds.map(v => {
      const moKhoa = !!LC && (LC.vungMo(v.id) || (v.mo !== null && datDK(LC, v.mo)));
      return Object.assign({}, v, {di_duoc: !!v.duong_dan && moKhoa, mo_khoa: moKhoa});
    });
  }
  async function nap(gocDuAn){
    const lay = async u => { try { const r = await fetch(gocDuAn + u, {cache:'no-store'}); return r.ok ? r.json() : null; } catch (e){ return null; } };
    const [tram, tg] = await Promise.all([lay('game/cot-truyen/tram-dich-chuyen.json'), lay('game/the-gioi.json')]);
    const ds = gop(tram, tg), LC = goc.LuuChung;
    return trangThai(ds, LC, (L, dk) => L.datDieuKien(dk));
  }
  const API = {gop, trangThai, nap};
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else goc.TramDichChuyen = API;
})(typeof window !== 'undefined' ? window : globalThis);
