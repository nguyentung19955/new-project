'use strict';
/* noi-vung-1.js – nối Vùng 2 ↔ Vùng 1 (phiên "Vùng mới"). Chỉ THÊM, dùng móc sẵn có của Vùng 2 (dhVaoPhong, dhBuoc, veDiaHinh…).
   • R201 "Root Descent" mép trái (cột 0–1, hàng 14–16): CỔNG RỄ ĐAN (ảnh ChatGPT art/vung-2/cong/re-dan/) – lối về Vùng 1 phòng trùm P12.
     Mở khi đã hạ trùm Vùng 1 (cờ LuuChung 'ha_trum:vung-1') hoặc đã đi qua cổng (cờ 'cong:p12-vung-2'); chưa thì rễ đan kín.
   • Vừa đi cổng từ Vùng 1 tới (?tu_vung=vung-1): tự vào R201, đứng ngay trong cổng, mang theo máu / Mảnh Âm (game/lien-vung.js).
   • Chuông Lưu (R204 Rootwatch Rest…): nút "Return to Bell Village" khi Làng Chuông đã mở (cờ 'lang_mo'), giống Vùng 1. */
(function(){
  const V1 = window.V1, E = typeof DongCoMN !== "undefined" ? DongCoMN : null, LV = window.LienVung, LC = window.LuuChung;
  if (!V1 || !E || !LV) return;
  LV.gan('vung-2');
  const pl = E.pl, G = V1.G, T = 48, PX = 3, PHONG = 'R201', CO = 'cong:p12-vung-2';
  const O = [[0, 14], [1, 14], [0, 15], [1, 15], [0, 16], [1, 16]];
  const K = window.NoiVung1 = {mo:false, t:99, tbT:0, lanDi:0};
  const IM = () => V1.IM2 || {};
  const coAnh = () => { const I = IM(); return !!(I.rd_dong_sau && I.rd_dong_truoc && I.rd_mo_sau && I.rd_mo_truoc); };
  const duocMo = () => !!(LC && (LC.co('ha_trum:vung-1') || LC.co(CO)));
  function datO(mo){ for (const [c, r] of O) if (E.BD.L[r]) E.BD.L[r][c] = mo ? '.' : '#'; }

  // vào phòng: cổng đóng → bịt ô; mở → để trống
  const vao0 = V1.dhVaoPhong;
  V1.dhVaoPhong = function(p){
    const r = vao0 ? vao0.apply(this, arguments) : undefined;
    if (p && p.id === PHONG){ K.mo = duocMo(); K.t = 99; datO(K.mo); }
    return r;
  };
  // mỗi bước: tới gần cổng đã mở → đi; cổng đóng → nhắc
  const buoc0 = V1.dhBuoc;
  V1.dhBuoc = function(){
    const r = buoc0 ? buoc0.apply(this, arguments) : undefined;
    if (G.id !== PHONG || !G.phong) return r;
    K.t++; if (K.tbT > 0) K.tbT--;
    if (!K.mo && duocMo()){ K.mo = true; K.t = 0; }               // (vừa mở cờ ở trang khác)
    if (K.mo && K.t === 48) datO(true);
    const giua = pl.y + pl.h > 14 * T && pl.y < 17 * T;
    if (K.mo && K.t >= 48 && !pl.dead && !G.chuyen && pl.x <= 3 && giua){
      K.lanDi++; LV.di({den:'vung-1', trang:'../vung-1/index.html', phong:'P12', cua:'P12-dong-v2'});
    } else if (!K.mo && !pl.dead && pl.x < 3.2 * T && giua && K.tbT <= 0 && G.tbT <= 0){
      V1.thongBao('Braided roots seal the way back up – they answer only to the Hollow Bell Mother\'s fall'); K.tbT = 300;
    }
    return r;
  };

  // vẽ cổng 32×48 điểm ảnh (2×3 ô), neo giữa cột 0–1, hàng 14–16
  function veCong(c, lop){
    if (G.id !== PHONG || !coAnh()) return;
    const I = IM(), k = Math.floor(K.t / 6);
    const im = K.mo ? (k < 8 ? I['rd_mo' + k + '_' + lop] : I['rd_mo_' + lop]) : I['rd_dong_' + lop];
    if (!im) return;
    const w = im.width * PX, h = im.height * PX, cx = 1 * T, cy = 15.5 * T;
    c.save(); c.imageSmoothingEnabled = false; c.drawImage(im, Math.round(cx - w / 2), Math.round(cy - h / 2), w, h); c.restore();
  }
  const veSau0 = V1.veDiaHinh, veTruoc0 = V1.veDiaHinhTruoc, den0 = V1.denThem;
  V1.veDiaHinh = function(c){ const r = veSau0 ? veSau0.apply(this, arguments) : undefined; veCong(c, 'sau'); return r; };
  V1.veDiaHinhTruoc = function(c){ const r = veTruoc0 ? veTruoc0.apply(this, arguments) : undefined; veCong(c, 'truoc'); return r; };
  V1.denThem = function(){
    const ds = den0 ? den0.apply(this, arguments) : [];
    if (G.id === PHONG && coAnh()) ds.push([1 * T + 20, 15.5 * T, K.mo ? 46 : 30, K.mo ? 0.7 : 0.45]);
    return ds;
  };

  document.addEventListener('DOMContentLoaded', () => {
    const $ = id => document.getElementById(id);
    // Chuông Lưu → về Làng Chuông (chỉ khi làng đã mở – cùng điều kiện Vùng 1)
    const moChuong0 = V1.moChuong; let nut = null;
    if (moChuong0) V1.moChuong = function(){
      const r = moChuong0.apply(this, arguments);
      try {
        if (!LC || !LC.co('lang_mo')){ if (nut) nut.hidden = true; return r; }
        if (!nut){
          const hang = document.querySelector('#l-chuong .hang'); if (!hang) return r;
          nut = document.createElement('button'); nut.type = 'button'; nut.id = 'b-lang'; nut.textContent = 'Return to Bell Village';
          nut.onclick = () => {
            const c = G.phong && G.phong.chuong_luu;
            LC.datDiemVe({vung:'vung-2', phong:G.id, cot:c && c.cot, hang:c && c.hang});
            LV.ghi(); K.veLang = (K.veLang || 0) + 1;
            if (V1.OPT && V1.OPT.tu) return;
            location.href = '../lang-chuong/index.html?tu=vung-2';
          };
          hang.appendChild(nut);
        }
        nut.hidden = false;
      } catch (e){}
      return r;
    };
    // vừa đi cổng từ Vùng 1 tới → vào thẳng R201, đứng trong cổng
    const cv = LV.toi();
    if (cv && cv.tu === 'vung-1') (async () => {
      for (let i = 0; i < 600 && !(window.TV && TV.xong); i++) await new Promise(ok => setTimeout(ok, 50));
      if (!window.TV || !TV.xong) return;
      window.moLop(''); $('b-tiep').disabled = $('b-moi').disabled = true;
      if (LC) LC.datCo(CO);
      LV.dangToi = true;
      await V1.batDau(false, PHONG);
      K.mo = true; K.t = 99; datO(true);
      V1.datNV(2 * T + T / 2, 17 * T); pl.face = 1;
      if (V1.camDat) V1.camDat();
      V1.xoaVao && V1.xoaVao();
      LV.dangToi = false; LV.xongToi();
    })();
  });
})();
