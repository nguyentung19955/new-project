'use strict';
/* noi-vung-2.js – nối Vùng 1 → Vùng 2 (phiên "Vùng mới"). Chỉ THÊM, không đổi hành vi cũ của Vùng 1.
   • Phòng trùm P12 "Mute Bell Choir": tường phải (cột 38–39, hàng 10–12) có CỔNG RỄ ĐAN (ảnh ChatGPT art/vung-2/cong/re-dan/,
     lớp sau + lớp trước, 8 khung mở ×100 ms). Ảnh phòng P12 dùng bản nướng có hầm thông (art/vung-1/P12-mo-*, cùng bộ nướng
     tools/vung-1/ve-phong.py, cùng hạt giống) – cổng đóng che kín hầm.
   • Hạ Hollow Bell Mother → rễ tháo xoắn (khi tới gần hoặc bấm "Follow the roots" ở màn "Region 1 Complete") → lối ra mép phải
     → sang Vùng 2 phòng R201 (mép trái). Mở 1 lần rồi giữ mở (cờ LuuChung 'cong:p12-vung-2').
   • Từ Vùng 2 đi ngược về (?tu_vung=vung-2): tự vào P12, đứng trong cổng phía phải.
   • Mang chỉ số nhân vật qua vùng: game/lien-vung.js. */
(function(){
  const V1 = window.V1, E = typeof DongCoMN !== "undefined" ? DongCoMN : null, LV = window.LienVung, LC = window.LuuChung;
  if (!V1 || !E || !LV) return;
  LV.gan('vung-1');
  const pl = E.pl, G = V1.G, T = 48, PX = 3, PHONG = 'P12', CO = 'cong:p12-vung-2';
  const O = [[38, 10], [39, 10], [38, 11], [39, 11], [38, 12], [39, 12]];
  const CUA = {id:'P12-dong-v2', cot:39, hang:10, cao:3, huong:'phai', toi:null, toi_cua:null,
    lien_vung:{vung:'vung-2', trang:'../vung-2/index.html', phong:'R201', cua:'R201-tay'}};
  const K = window.NoiVung2 = {mo:false, t:99, phong:null, san:false, lanDi:0};
  const IM = {};

  // ảnh cổng rễ đan (ChatGPT, Vùng 2 – yêu cầu 016) – chưa có ảnh thì KHÔNG bật cổng
  const A2 = '../../art/vung-2/cong/re-dan/';
  const napI = (k, f) => new Promise(ok => { const i = new Image(); i.onload = () => { IM[k] = i; ok(); }; i.onerror = () => ok(); i.src = A2 + f + '.png'; });
  const ds = [];
  for (const l of ['sau', 'truoc']){ ds.push(napI('dong_' + l, 'dong-' + l), napI('mo_' + l, 'mo-' + l)); for (let i = 0; i < 8; i++) ds.push(napI('mo' + i + '_' + l, 'mo-ra-f' + i + '-' + l)); }
  const choAnh = Promise.all(ds).then(() => { K.san = !!(IM.dong_sau && IM.dong_truoc && IM.mo_sau && IM.mo_truoc); });

  // ảnh phòng P12 có hầm thông (chỉ dùng khi cổng sẵn sàng)
  const napCanh0 = V1.napCanhPhong;
  if (napCanh0) V1.napCanhPhong = async function(id){
    if (id !== PHONG || id in V1.CANH) return napCanh0.apply(this, arguments);
    await choAnh;
    if (!K.san) return napCanh0.apply(this, arguments);
    const A = '../../art/vung-1/P12-mo', im = src => new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src; });
    let meta = null; try { const r = await fetch(A + '-canh.json'); if (r.ok) meta = await r.json(); } catch (e){}
    const [canh, truoc] = await Promise.all([im(A + '-canh.png'), im(A + '-truoc.png')]);
    if (!canh || !meta){ K.san = false; return napCanh0.apply(this, arguments); }
    V1.CANH[id] = {canh, truoc, manh:null, meta};
    return V1.CANH[id];
  };

  const trumHa = () => !!(G.luu && G.luu.trumHa);
  const daMo = () => !!(LC && LC.co(CO));
  function datO(mo){ for (const [c, r] of O) if (E.BD.L[r]) E.BD.L[r][c] = mo ? '.' : '#'; }
  function vaoP12(p){
    K.phong = p; K.mo = K.san && (daMo() || K.toiTuV2); K.t = 99;
    if (K.mo){ if (!p.cua.includes(CUA)) p.cua.push(CUA); datO(true); }
  }
  function moCong(){
    if (K.mo || !K.san) return;
    K.mo = true; K.t = 0;
    if (LC){ LC.datCo(CO); LC.moVung('vung-2'); }
    if (G.phong && !G.phong.cua.includes(CUA)) G.phong.cua.push(CUA);
    V1.thongBao('The braided roots unwind – a passage leads down into Region 2');
    E.S.sht = 8; E.S.shm = 1.5; E.S.shx = 1; E.S.shy = 0.5;
  }
  K.moCong = moCong;

  // mỗi bước 60 Hz (index.html gọi V1.buocTheGioi khi đang chơi)
  const buoc0 = V1.buocTheGioi;
  V1.buocTheGioi = function(){
    const r = buoc0.apply(this, arguments);
    if (G.id !== PHONG){ K.phong = null; return r; }
    if (K.phong !== G.phong) vaoP12(G.phong);
    if (!K.san) return r;
    K.t++;
    const songTrum = G.trum && !G.trum.dead && G.trum.st !== 'chet';
    if (!K.mo && trumHa() && !songTrum && !G.dongCua && !pl.dead && pl.x > 26 * T) moCong();
    if (K.mo && K.t === 48) datO(true);                       // rễ rút hết (8 khung) → đi qua được
    if (K.mo && K.t >= 48 && !pl.dead && !G.chuyen && pl.x + pl.w >= E.BD.COT * T - 3 && pl.y + pl.h > 10 * T && pl.y < 13 * T){
      K.lanDi++; LV.di({den:'vung-2', trang:CUA.lien_vung.trang, phong:'R201', cua:'R201-tay'});
    }
    return r;
  };

  // vẽ cổng 32×48 điểm ảnh (2×3 ô) – ve.js gọi V1.veMocSau / V1.veMocTruoc (sau / trước nhân vật)
  function veCong(c, lop){
    if (!K.san || G.id !== PHONG) return;
    const k = Math.floor(K.t / 6);
    const im = K.mo ? (k < 8 ? IM['mo' + k + '_' + lop] : IM['mo_' + lop]) : IM['dong_' + lop];
    if (!im) return;
    const w = im.width * PX, h = im.height * PX, cx = 39 * T, cy = 11.5 * T;
    c.save(); c.imageSmoothingEnabled = false; c.drawImage(im, Math.round(cx - w / 2), Math.round(cy - h / 2), w, h); c.restore();
  }
  V1.veMocSau = c => veCong(c, 'sau');
  V1.veMocTruoc = c => veCong(c, 'truoc');
  const den0 = V1.denThem;
  V1.denThem = function(){
    const ds = den0 ? den0.apply(this, arguments) : [];
    if (K.san && G.id === PHONG && (K.mo || trumHa())) ds.push([39 * T - 20, 11.5 * T, K.mo ? 46 : 32, K.mo ? 0.7 : 0.5]);
    return ds;
  };

  // sau khi trang dựng xong (index.html đã định nghĩa V1.thangTrum, choi, moLop)
  document.addEventListener('DOMContentLoaded', () => {
    const $ = id => document.getElementById(id);
    // màn "Region 1 Complete": thêm lối đi tiếp sang Vùng 2
    const thang0 = V1.thangTrum;
    if (thang0) V1.thangTrum = function(){
      const r = thang0.apply(this, arguments);
      if (LC) LC.moVung('vung-2');
      setTimeout(() => {
        const tt = $('het-tt'); if (!tt || !K.san) return;
        tt.innerHTML = tt.innerHTML.replace(/<i>Region 2[^<]*<\/i>/, '<i>Behind the choir, braided roots begin to unwind – a passage leads down to Region 2 "Rotting Roots".</i>');
        let b = $('b-het-v2');
        if (!b){
          const hang = $('b-het-tiep') && $('b-het-tiep').parentNode; if (!hang) return;
          b = document.createElement('button'); b.type = 'button'; b.id = 'b-het-v2'; b.className = 'chinh'; b.textContent = 'Follow the roots';
          hang.insertBefore(b, hang.firstChild); $('b-het-tiep').classList.remove('chinh');
          b.onclick = () => {
            if (pl.dead || G.id !== PHONG){ $('b-het-tiep').click(); return; }
            window.moLop(''); G.trang = 'choi'; V1.xoaVao && V1.xoaVao(); moCong();
          };
        }
      }, 950);
      return r;
    };
    // vừa đi cổng từ Vùng 2 về → vào thẳng P12, đứng trong cổng
    const cv = LV.toi();
    if (cv && cv.tu === 'vung-2') (async () => {
      for (let i = 0; i < 600 && !(window.TV && TV.xong); i++) await new Promise(ok => setTimeout(ok, 50));
      await choAnh;
      if (!window.TV || !TV.xong || !K.san) return;
      window.moLop(''); $('b-tiep').disabled = $('b-moi').disabled = true;
      K.toiTuV2 = true; LV.dangToi = true;
      if (LC) LC.datCo(CO);
      await V1.batDau(false, PHONG);
      vaoP12(G.phong); K.t = 99;
      V1.datNV(37 * T + T / 2, 13 * T); pl.face = -1;
      if (V1.camDat) V1.camDat();
      V1.xoaVao && V1.xoaVao();
      LV.dangToi = false; LV.xongToi();
    })();
  });
})();
