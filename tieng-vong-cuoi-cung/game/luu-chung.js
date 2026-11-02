'use strict';
/* luu-chung.js – LƯU CHUNG giữa các vùng và Làng Chuông (phiên "Cốt truyện + điểm khởi đầu", mã cottruyen).
   Chỉ là dữ liệu + logic, KHÔNG vẽ gì. Mỗi vùng vẫn giữ bản lưu riêng của mình (vd 'tvcc-vung1');
   file này giữ phần dùng chung: tiến độ cốt truyện (cờ + hồi), vùng đã mở / đã vào, kho chung, điểm quay về.
   Dùng: <script src="../luu-chung.js"></script> rồi gọi window.LuuChung.xxx (mọi hàm bọc try/catch, lỗi lưu không làm hỏng game).
   Node (phép thử): const LC = require('./luu-chung.js').tao(khoGia) – khoGia có getItem/setItem/removeItem. */
(function(goc){
  const KHOA = 'tvcc-chung', PHIEN_BAN = 1;
  const VUNG_DAU = 'vung-1';            // vùng mở sẵn từ đầu

  function moi(){
    return {
      phien_ban: PHIEN_BAN,
      hoi: 1,                 // hồi truyện hiện tại (1..3, theo docs/gdd.md mục 2)
      co: {},                 // cờ cốt truyện: {ten_co: true | số}  (đã xem mở đầu, đã gặp nhân vật…)
      daXem: [],              // id cảnh / đoạn hội thoại đã xem hết (không chiếu lại bắt buộc)
      vungMo: [VUNG_DAU],     // vùng teleport được từ làng
      vungVao: [],            // vùng đã từng đặt chân
      vungCuoi: null,         // vùng chơi gần nhất
      diemVe: null,           // {vung, phong, cot, hang} – chỗ quay lại vùng khi đi từ làng
      kho: {},                // kho chung {loai: số}
      manhKyUc: [],           // id Mảnh Ký Ức đã nhặt (dùng chung mọi vùng)
      nhanVat: null,          // (vung) chỉ số nhân vật mang qua vùng: {vung, t, maxHp, hoiMax, manh, manhGui, hp, luotHoi} – game/lien-vung.js
      chuyenVung: null,       // (vung) đang đi cổng sang vùng khác: {tu, den, phong, cua, t}
      giay: 0
    };
  }

  function tao(kho){
    let d = null;
    function doc(){
      try {
        const s = kho && kho.getItem(KHOA); if (!s) return moi();
        const x = JSON.parse(s);
        if (!x || x.phien_ban !== PHIEN_BAN) return moi();
        const m = moi();
        return Object.assign(m, x, {co: Object.assign({}, x.co), kho: Object.assign({}, x.kho),
          vungMo: Array.from(new Set([VUNG_DAU].concat(x.vungMo || [])))});
      } catch (e){ return moi(); }
    }
    const L = () => d || (d = doc());
    function ghi(){ try { kho && kho.setItem(KHOA, JSON.stringify(L())); return true; } catch (e){ return false; } }
    const themMot = (mang, v) => { if (!mang.includes(v)) { mang.push(v); return true; } return false; };

    const api = {
      KHOA, PHIEN_BAN, VUNG_DAU,
      du: () => JSON.parse(JSON.stringify(L())),             // bản sao để xem
      napLai(){ d = doc(); return api; },
      xoa(){ d = moi(); try { kho && kho.removeItem(KHOA); } catch (e){} return api; },
      ghi,
      /* cốt truyện */
      co: ten => L().co[ten] || false,
      datCo(ten, gt){ L().co[ten] = gt === undefined ? true : gt; ghi(); return api; },
      hoi: () => L().hoi,
      datHoi(n){ if (n > L().hoi){ L().hoi = n; ghi(); } return api; },
      daXem: id => L().daXem.includes(id),
      xemXong(id){ if (themMot(L().daXem, id)) ghi(); return api; },
      /* vùng + teleport */
      vungMo: id => L().vungMo.includes(id),
      dsVungMo: () => L().vungMo.slice(),
      moVung(id){ if (themMot(L().vungMo, id)) ghi(); return api; },
      vaoVung(id){ const x = L(); themMot(x.vungMo, id); themMot(x.vungVao, id); x.vungCuoi = id; ghi(); return api; },
      daVaoVung: id => L().vungVao.includes(id),
      vungCuoi: () => L().vungCuoi,
      datDiemVe(dv){ L().diemVe = dv ? Object.assign({}, dv) : null; ghi(); return api; },
      diemVe: () => L().diemVe ? Object.assign({}, L().diemVe) : null,
      /* kho chung */
      dem: loai => L().kho[loai] || 0,
      them(loai, so){ const k = L().kho; k[loai] = (k[loai] || 0) + (so === undefined ? 1 : so); ghi(); return api; },
      dung(loai, so){ so = so === undefined ? 1 : so; const k = L().kho; if ((k[loai] || 0) < so) return false; k[loai] -= so; ghi(); return true; },
      /* Mảnh Ký Ức (gdd: 48 mảnh → kết thật) */
      nhatKyUc(id){ if (themMot(L().manhKyUc, id)) ghi(); return api; },
      soKyUc: () => L().manhKyUc.length,
      congGiay(s){ L().giay += s; return api; },
      /* (vung) mang nhân vật qua vùng – chỉ THÊM, không đổi hành vi cũ */
      nhanVat: () => L().nhanVat ? Object.assign({}, L().nhanVat) : null,
      datNhanVat(o){ L().nhanVat = o ? Object.assign({}, o) : null; ghi(); return api; },
      chuyenVung: () => L().chuyenVung ? Object.assign({}, L().chuyenVung) : null,
      datChuyenVung(o){ L().chuyenVung = o ? Object.assign({}, o) : null; ghi(); return api; }
    };
    return api;
  }

  /* Điều kiện mở vùng (dùng cho trạm teleport): {co:'ten'} | {vung_ha_trum:'vung-1'} | {tat_ca:[...]} | {mot_trong:[...]} | true/false */
  function datDieuKien(LC, dk){
    if (dk === true) return true;
    if (!dk) return false;
    if (dk.co) return !!LC.co(dk.co);
    if (dk.hoi) return LC.hoi() >= dk.hoi;
    if (dk.vung_ha_trum) return !!LC.co('ha_trum:' + dk.vung_ha_trum);
    if (dk.tat_ca) return dk.tat_ca.every(x => datDieuKien(LC, x));
    if (dk.mot_trong) return dk.mot_trong.some(x => datDieuKien(LC, x));
    return false;
  }

  if (typeof module !== 'undefined' && module.exports){ module.exports = {tao, moi, datDieuKien, KHOA, PHIEN_BAN}; }
  else {
    let ls = null; try { ls = goc.localStorage; } catch (e){}
    const LC = tao(ls); LC.tao = tao; LC.datDieuKien = dk => datDieuKien(LC, dk);
    goc.LuuChung = LC;
  }
})(typeof window !== 'undefined' ? window : globalThis);
