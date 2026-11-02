'use strict';
/* lien-vung.js – NỐI CÁC VÙNG (phiên "Vùng mới", mã vung). Dùng chung cho game/vung-N/index.html. KHÔNG vẽ gì.
   • Mang nhân vật qua vùng: máu tối đa, số lượt hồi, Mảnh Âm (mang + gửi chuông) ghi vào LuuChung.nhanVat khi rời trang / đi cổng;
     vùng khác khi bắt đầu (Tiếp tục / đi cổng tới) nhận lại các chỉ số này → một nhân vật, nhiều vùng.
     Nâng cấp "Vitality" ở Chuông Lưu vẫn tính riêng từng vùng (mỗi vùng 1 lần), chỉ con số máu tối đa đi theo.
   • Đi cổng: LienVung.di({den:'vung-2', trang:'../vung-2/index.html', phong:'R201', cua:'R201-tay'}) – màn tối rồi chuyển trang;
     trang đích đọc ?tu_vung=<vùng cũ> + LuuChung.chuyenVung để tự vào đúng phòng / cửa (LienVung.toi()).
   Dùng: <script src="../lien-vung.js"></script> sau luu-chung.js + the-gioi.js; LienVung.gan('vung-1'). */
(function(goc){
  const LV = goc.LienVung = {vung:null, daNhan:false};
  const LC = () => goc.LuuChung;
  const V = () => goc.V1;

  // chỉ số nhân vật hiện tại của vùng này
  function chiSo(){
    const V1 = V(), G = V1 && V1.G, L = G && G.luu, pl = typeof DongCoMN !== 'undefined' ? DongCoMN.pl : null;
    if (!L) return null;
    return {vung:LV.vung, t:Date.now(), maxHp:L.maxHp, hoiMax:L.hoiMax, manh:L.manh, manhGui:L.manhGui,
      hp:pl && pl.hp > 0 ? pl.hp : L.maxHp, luotHoi:pl && pl.luotHoi !== undefined ? pl.luotHoi : L.hoiMax};
  }
  LV.ghi = function(){
    try { const o = chiSo(); if (o && LC() && LC().datNhanVat && V().G.trang !== 'menu') LC().datNhanVat(o); return o; } catch (e){ return null; }
  };
  // nhận chỉ số từ vùng khác (gọi ngay sau V1.batDau)
  LV.nhan = function(giuMau){
    try {
      const lc = LC(), nv = lc && lc.nhanVat && lc.nhanVat(), V1 = V(), G = V1.G, L = G.luu, E = DongCoMN, pl = E.pl;
      if (!nv || nv.vung === LV.vung || !L) return false;
      if (nv.maxHp > 0) L.maxHp = nv.maxHp;
      if (nv.hoiMax > 0) L.hoiMax = nv.hoiMax;
      if (nv.manh >= 0) L.manh = nv.manh;
      if (nv.manhGui >= 0) L.manhGui = nv.manhGui;
      E.P.maxHp = L.maxHp;
      pl.hp = giuMau && nv.hp > 0 ? Math.min(nv.hp, L.maxHp) : L.maxHp;
      pl.luotHoi = giuMau && nv.luotHoi >= 0 ? Math.min(nv.luotHoi, L.hoiMax) : L.hoiMax;
      V1.ghiLuu();
      LV.daNhan = true;
      LV.ghi();                       // từ giờ bản mới nhất thuộc vùng này
      return true;
    } catch (e){ console.error(e); return false; }
  };
  // đi cổng sang vùng khác
  LV.di = function(dich){
    const V1 = V(), lc = LC();
    if (LV.dangDi) return; LV.dangDi = true;
    try { V1.ghiLuu(); LV.ghi(); if (lc){ lc.moVung(dich.den); lc.datChuyenVung({tu:LV.vung, den:dich.den, phong:dich.phong, cua:dich.cua, t:Date.now()}); } } catch (e){}
    const sang = () => { if (V1.OPT && V1.OPT.tu) { LV.diToi = dich; return; } location.href = dich.trang + '?tu_vung=' + encodeURIComponent(LV.vung); };
    if (V1.chuyenCanh) V1.chuyenCanh(() => { sang(); return new Promise(() => {}); }); else sang();
  };
  // trang vừa mở có phải do đi cổng tới không → {tu, phong, cua}
  LV.toi = function(){
    let tu = null; try { tu = new URLSearchParams(location.search).get('tu_vung'); } catch (e){}
    if (!tu) return null;
    const cv = LC() && LC().chuyenVung ? LC().chuyenVung() : null;
    const hop = cv && cv.den === LV.vung && cv.tu === tu && Date.now() - cv.t < 10 * 60 * 1000;
    return hop ? cv : null;
  };
  LV.xongToi = function(){
    try { if (LC()) LC().datChuyenVung(null); } catch (e){}
    try { const u = new URL(location.href); u.searchParams.delete('tu_vung'); history.replaceState(null, '', u.pathname + u.search + u.hash); } catch (e){}
  };

  LV.gan = function(vung){
    LV.vung = vung;
    const V1 = V(); if (!V1 || !V1.batDau) return;
    // mọi lần bắt đầu (Tiếp tục / đi cổng tới): nhận chỉ số từ vùng khác nếu vùng khác ghi sau cùng; Trò chơi mới thì không
    const goc0 = V1.batDau;
    V1.batDau = async function(moi){
      const r = await goc0.apply(this, arguments);
      if (!moi) LV.nhan(!!LV.dangToi); else LV.ghi();
      return r;
    };
    // rời trang (đóng tab, về làng, chuyển vùng…) → ghi chỉ số
    goc.addEventListener('pagehide', () => LV.ghi());
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') LV.ghi(); });
  };
})(typeof window !== 'undefined' ? window : globalThis);
