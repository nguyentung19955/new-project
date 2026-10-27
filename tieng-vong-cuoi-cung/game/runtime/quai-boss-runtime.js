/* =====================================================================================================
   QUÁI CHUÔNG GỖ + BOSS CHUÔNG GÁC LÀNG – vẽ trực tiếp từ MẢNH + JSON (không sprite sheet)
   Một file, không phụ thuộc gì của game. Gắn vào window.QBR. Dùng trong game/thu-quai-boss/thu-quai-boss.html;
   ghép vào game/demo.html theo hướng dẫn trong game/thu-quai-boss/GHI-CHU.md (mục "Cách ghép").

   Gói asset: game/runtime/quai-boss/ (sinh bởi game/runtime/xuat-quai-boss.py từ art/the-gioi-moi/quai-boss/)
     quai-boss-rig.json + 14 PNG mảnh (2 px ảnh / 1 px logic).

   Bốn phần:
   1. NẠP     QBR.nap(base, tienDo) – tải JSON + mọi mảnh, decode() hết, tạo ảnh trắng / vàng / tối cache 1 lần
              mỗi mảnh (nháy trắng, lóe vàng, tối dần không xử lý pixel mỗi khung), vẽ thử 1 lần để GPU nhận ảnh.
   2. TƯ THẾ  mảng Float32 [dx,dy,goc,sx,sy,toi,mo,hien] × số nút. Lấy mẫu clip: NỘI SUY TUYẾN TÍNH giữa hai
              khung tính sẵn; 'hien' (bật/tắt mảnh, vd. thân chẻ đôi lúc chết) ĐỔI BẬC theo khung trước, không nội suy.
   3. VẼ      QBR.ve(ctx, nv, tuThe, x, y, latNgang, o) – (x,y) = điểm neo (chân / trục chuông trên mặt đất).
   4. ÁNH XẠ  trạng thái gameplay → clip + thời điểm trong clip (QBR.capNhatQuai / QBR.capNhatBoss, gọi mỗi bước
              logic sau khi game cập nhật). Gameplay quyết định hitbox / lúc chạm; animation chỉ thể hiện đúng lúc.
              Đổi clip: hoà (blend) từ tư thế ĐANG hiện, không giật về dáng nghỉ.
   ===================================================================================================== */
(function(){
'use strict';
const QBR = {};
const D = 1000/60;                      // ms mỗi bước logic
const NC = 8;                           // số thành phần tư thế mỗi nút
let J = null;                           // JSON rig đã nạp
QBR.D = D;

/* ------------------------------------------------ 1. NẠP ------------------------------------------------ */
function loadImg(src){
  return new Promise((res,rej)=>{
    const im=new Image(); im.decoding='async';
    im.onload=()=>{ if(im.decode) im.decode().then(()=>res(im),()=>res(im)); else res(im); };
    im.onerror=()=>rej(new Error('không tải được '+src));
    im.src=src;
  });
}
function boc(img,color){   // bóng một màu của mảnh (cache 1 lần)
  const c=document.createElement('canvas'); c.width=img.naturalWidth; c.height=img.naturalHeight;
  const g=c.getContext('2d'); g.drawImage(img,0,0); g.globalCompositeOperation='source-in'; g.fillStyle=color; g.fillRect(0,0,c.width,c.height);
  return c;
}
function vang(img){        // ánh vàng (giống bản tô vàng của demo cũ: ảnh + phủ vàng 70 %)
  const c=document.createElement('canvas'); c.width=img.naturalWidth; c.height=img.naturalHeight;
  const g=c.getContext('2d'); g.drawImage(img,0,0); g.globalCompositeOperation='source-atop'; g.globalAlpha=0.7; g.fillStyle='#E1B85A'; g.fillRect(0,0,c.width,c.height);
  return c;
}
// nhung (tuỳ chọn, bản build tự chứa): {json: rig đã parse, anh: {'quai/than.png': 'data:image/png;base64,…', …}} → không tải mạng
QBR.nap = async function(base, tienDo, nhung){
  const T0=performance.now();
  if(nhung){ J=JSON.parse(JSON.stringify(nhung.json)); }
  else {
    const r=await fetch(base+'quai-boss-rig.json',{cache:'no-cache'});
    if(!r.ok) throw new Error('lỗi mạng '+r.status+' khi tải '+base+'quai-boss-rig.json');
    J=await r.json();
  }
  const T1=performance.now();
  const ds=[];
  for(const nv in J.nv){
    const N=J.nv[nv];
    N.idx={}; N.nut_ds.forEach((n,i)=>N.idx[n]=i);
    N.cha=N.nut_ds.map(n=>N.nut[n].cha===null?-1:N.idx[N.nut[n].cha]);
    N.cha.forEach((p,i)=>{ if(p>=i) throw new Error('rig '+nv+': nút cha phải đứng trước nút con'); });
    N.ve=N.thu_tu_ve.map(n=>N.idx[n]);
    N.nghi=new Float32Array(N.nut_ds.length*NC);
    N.nut_ds.forEach((n,i)=>{ const o=i*NC; N.nghi[o+3]=1; N.nghi[o+4]=1; N.nghi[o+6]=1; N.nghi[o+7]=(N.nut[n].hien===false)?0:1; });
    for(const cn in N.clip){ const c=N.clip[cn]; c.F=c.khung.map(k=>{ const a=new Float32Array(k.length*NC); k.forEach((v,i)=>a.set(v,i*NC)); return a; }); }
    for(const n of N.nut_ds){ const nd=N.nut[n]; if(nd.anh) ds.push(nd); }
  }
  let xong=0;
  await Promise.all(ds.map(nd=>loadImg(nhung?nhung.anh[nd.anh]:base+nd.anh).then(im=>{ nd.img=im; xong++; if(tienDo) tienDo(xong/ds.length); })));
  const T2=performance.now();
  let byteGoc=0, byteCache=0; const bang=[];
  for(const nd of ds){
    const w=nd.img.naturalWidth, h=nd.img.naturalHeight;
    if(w!==nd.co_anh[0]||h!==nd.co_anh[1]) throw new Error(nd.anh+' cỡ '+w+'×'+h+' – JSON ghi '+nd.co_anh.join('×'));
    nd.trang=boc(nd.img,'#ffffff'); nd.den=boc(nd.img,'#0C0F14'); nd.vang=vang(nd.img);
    byteGoc+=w*h*4; byteCache+=w*h*4*3; bang.push({anh:nd.anh,w,h,byte:w*h*4});
  }
  // vẽ thử mọi ảnh 1 lần (để trình duyệt tải ảnh lên GPU trước khi vào màn chơi, không đợi lúc đánh)
  const tc=document.createElement('canvas'); tc.width=4; tc.height=4; const tg=tc.getContext('2d');
  for(const nd of ds){ tg.drawImage(nd.img,0,0,4,4); tg.drawImage(nd.trang,0,0,4,4); tg.drawImage(nd.den,0,0,4,4); tg.drawImage(nd.vang,0,0,4,4); }
  tg.getImageData(0,0,1,1);
  const T3=performance.now();
  QBR.so = {ms_json:+(T1-T0).toFixed(1), ms_anh_va_decode:+(T2-T1).toFixed(1), ms_cache_va_ve_thu:+(T3-T2).toFixed(1), ms_tong:+(T3-T0).toFixed(1),
    so_anh_png:ds.length, so_anh_cache:ds.length*3, byte_png:J.tong.byte_png, byte_giai_ma_png:byteGoc, byte_giai_ma_cache:byteCache,
    mb_giai_ma_tong:+((byteGoc+byteCache)/1048576).toFixed(2), bang};
  return QBR.so;
};
QBR.json = ()=>J;

/* ------------------------------------------------ 2. TƯ THẾ ------------------------------------------------ */
QBR.tuThe = nv=>new Float32Array(J.nv[nv].nghi);
QBR.nghi = (nv,out)=>{ out.set(J.nv[nv].nghi); return out; };
// lấy mẫu clip tại tMs (lặp nếu clip lặp; không lặp thì giữ khung cuối)
QBR.mau = function(nv,cn,tMs,out){
  const c=J.nv[nv].clip[cn], F=c.F, n=F.length, b=c.buoc_ms;
  let t=tMs, i0, i1, u;
  if(c.lap){ t=((t%c.ms)+c.ms)%c.ms; const x=t/b; i0=Math.floor(x)%n; i1=(i0+1)%n; u=x-Math.floor(x); }
  else { const tm=(n-1)*b; t=t<0?0:t>tm?tm:t; const x=t/b; i0=Math.min(n-1,Math.floor(x)); i1=Math.min(n-1,i0+1); u=x-i0; }
  const A=F[i0], B=F[i1], L=A.length;
  for(let o=0;o<L;o+=NC){ for(let k=0;k<7;k++) out[o+k]=A[o+k]+(B[o+k]-A[o+k])*u; out[o+7]=A[o+7]; }   // hien: đổi bậc
  return out;
};
// hoà a → b theo w (0..1); cờ hien lấy theo b (đổi bậc)
QBR.hoa = function(out,a,b,w){ const L=out.length; for(let o=0;o<L;o+=NC){ for(let k=0;k<7;k++) out[o+k]=a[o+k]+(b[o+k]-a[o+k])*w; out[o+7]=b[o+7]; } return out; };
function nutSet(nv,P,ten,dx,dy,goc,sx,sy){ const o=J.nv[nv].idx[ten]*NC; P[o]=dx; P[o+1]=dy; P[o+2]=goc; P[o+3]=sx===undefined?1:sx; P[o+4]=sy===undefined?1:sy; }
function nutCong(nv,P,ten,dx,dy,goc){ const o=J.nv[nv].idx[ten]*NC; P[o]+=dx; P[o+1]+=dy; P[o+2]+=goc; }
function tatCa(nv,P,k,v){ const L=P.length; for(let o=k;o<L;o+=NC) P[o]=v; }
QBR.nutSet=nutSet; QBR.nutCong=nutCong;
QBR.lay=(nv,P,ten,k)=>P[J.nv[nv].idx[ten]*NC+k];

/* ------------------------------------------------ 3. VẼ ------------------------------------------------ */
const MW=new Float32Array(16*6);
function maTran(N,P){
  const nn=N.nut_ds.length;
  for(let i=0;i<nn;i++){
    const nd=N.nut[N.nut_ds[i]], o=i*NC, g=(nd.goc_nghi+P[o+2])*Math.PI/180, c=Math.cos(g), s=Math.sin(g), sx=P[o+3], sy=P[o+4];
    const la=c*sx, lb=s*sx, lc=-s*sy, ld=c*sy, le=nd.gan[0]+P[o], lf=nd.gan[1]+P[o+1], p=N.cha[i], m=i*6;
    if(p<0){ MW[m]=la; MW[m+1]=lb; MW[m+2]=lc; MW[m+3]=ld; MW[m+4]=le; MW[m+5]=lf; }
    else { const q=p*6, A=MW[q], B=MW[q+1], C=MW[q+2], Dd=MW[q+3], E=MW[q+4], F=MW[q+5];
      MW[m]=A*la+C*lb; MW[m+1]=B*la+Dd*lb; MW[m+2]=A*lc+C*ld; MW[m+3]=B*lc+Dd*ld; MW[m+4]=A*le+C*lf+E; MW[m+5]=B*le+Dd*lf+F; }
  }
}
QBR.soLanVe=0;
// o: {alpha, trang 0..1 (nháy trắng do game), vang 0..1 (lóe vàng), tru: tên nút bỏ qua}
QBR.ve = function(ctx,nv,P,x,y,lat,o){
  const N=J.nv[nv], s=N.ty_le, al=o&&o.alpha!==undefined?o.alpha:1, tr=o&&o.trang||0, va=o&&o.vang||0;
  if(al<=0) return;
  maTran(N,P);
  const ga=ctx.globalAlpha;
  ctx.save(); ctx.translate(x,y); ctx.scale(lat?-s:s,s);
  for(const i of N.ve){
    const nd=N.nut[N.nut_ds[i]], q=i*NC;
    if(!nd.img || P[q+7]<0.5) continue;
    const a=ga*al*P[q+6]; if(a<=0) continue;
    const m=i*6, px=-nd.pivot[0], py=-nd.pivot[1], w=nd.co[0], h=nd.co[1];
    ctx.save(); ctx.transform(MW[m],MW[m+1],MW[m+2],MW[m+3],MW[m+4],MW[m+5]);
    ctx.globalAlpha=a; ctx.drawImage(nd.img,px,py,w,h); QBR.soLanVe++;
    if(P[q+5]>0){ ctx.globalAlpha=a*P[q+5]; ctx.drawImage(nd.den,px,py,w,h); QBR.soLanVe++; }
    if(va>0){ ctx.globalAlpha=a*va; ctx.drawImage(nd.vang,px,py,w,h); QBR.soLanVe++; }
    if(tr>0){ ctx.globalAlpha=a*tr; ctx.drawImage(nd.trang,px,py,w,h); QBR.soLanVe++; }
    ctx.restore();
  }
  ctx.restore(); ctx.globalAlpha=ga;
};
// hộp bao (px logic, toạ độ của (x,y) truyền vào) của phần ĐẶC (alpha>32) của một mảnh – để kiểm hình khớp hitbox
QBR.hopManh = function(nv,P,ten,x,y,lat,out){
  const N=J.nv[nv], s=N.ty_le, i=N.idx[ten], nd=N.nut[ten]; maTran(N,P);
  const m=i*6, px=nd.pivot[0], py=nd.pivot[1];
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for(const [u,v] of nd.vien){   // bao lồi phần đặc của mảnh → hộp bao chặt cả khi mảnh xoay
    const a=u-px, b=v-py, wx=MW[m]*a+MW[m+2]*b+MW[m+4], wy=MW[m+1]*a+MW[m+3]*b+MW[m+5];
    const X=x+(lat?-wx:wx)*s, Y=y+wy*s; if(X<x0)x0=X; if(X>x1)x1=X; if(Y<y0)y0=Y; if(Y>y1)y1=Y; }
  out=out||{}; out.x=x0; out.y=y0; out.w=x1-x0; out.h=y1-y0; return out;
};

// vị trí gốc một nút (px logic, so với điểm neo, chưa lật) – vd. 'than' để kiểm thân không bị nâng thêm khi game đã nâng
QBR.diemNut = function(nv,P,ten){ const N=J.nv[nv]; maTran(N,P); const m=N.idx[ten]*6; return [MW[m+4]*N.ty_le, MW[m+5]*N.ty_le]; };

/* ------------------------------------------------ 4. BỘ HOẠT HOẠ + ÁNH XẠ GAMEPLAY ------------------------------------------------
   Mỗi thực thể có 1 bộ hoạt hoạ H: {k: khoá clip hiện tại, src: hàm/clip, t, r (ms tiến mỗi bước – để nội suy giữa 2 bước),
   tu: tư thế nguồn lúc đổi clip, b0: bước bắt đầu hoà, bn: số bước hoà}. Đổi khoá → chụp tư thế ĐANG HIỆN làm điểm đầu hoà. */
function Hoat(nv){ return {nv, k:'', clip:null, fn:null, t:0, r:D, b0:0, bn:0, tu:QBR.tuThe(nv), cur:QBR.tuThe(nv), tmp:QBR.tuThe(nv), dich:null, info:''}; }
QBR.Hoat=Hoat;
function datH(H,frame,k,clip,fn,t,r,bn){
  if(H.k!==k){ if(H.k) tinh(H,frame-1,1,H.tu); else QBR.nghi(H.nv,H.tu); H.k=k; H.b0=frame; H.bn=bn; }   // chụp tư thế đang hiện
  H.clip=clip; H.fn=fn; H.t=t; H.r=r;
}
function smooth(x){ x=x<0?0:x>1?1:x; return x*x*(3-2*x); }
// tư thế lúc vẽ: al = phần bước nội suy giữa bước trước (0) và bước hiện tại (1) – CÙNG quy ước với vị trí lerp(px,x,al),
// nên al = 1 cho đúng tư thế của bước logic hiện tại (lúc game kiểm hitbox).
function tinh(H,frame,al,out){
  const t=H.t-(1-al)*H.r, P=H.tmp;
  if(H.clip) QBR.mau(H.nv,H.clip,t,P); else QBR.nghi(H.nv,P);
  if(H.fn) H.fn(P,t,H);
  const w=H.bn>0?smooth((frame-H.b0+al)/(H.bn+1)):1;
  if(w<1) QBR.hoa(out,H.tu,P,w); else out.set(P);
  return out;
}
QBR.tinh=(H,frame,al)=>tinh(H,frame,al,H.cur);

/* ---- QUÁI: trạng thái game (updateQuai trong demo.html) → clip ----
   walk → 'di' theo q.at (game dời 0,9 px/bước = 54 px/s = tốc độ chân chịu lực của clip)
   wind (30 bước) → 'dam' 0–500 ms; strike (16) → 500–767 ms (hitbox game t 5–10 = clip 583–667 ms = khung chạm 18–20);
   rec (26) → 767–1200 ms. Ba trạng thái dùng CHUNG khoá 'dam' nên liền mạch, không hoà.
   hit (16) → 'trung' (quái CÓ choáng trong game: trúng đòn ngắt đòn đấm) · die → 'chet' (giữ khung cuối; game làm mờ q.fade)
   sleep/awake (quái gác) → 'dung' chậm. */
QBR.capNhatQuai = function(q,frame){
  const H=q.H||(q.H=Hoat('quai'));
  switch(q.st){
    case 'walk':   datH(H,frame,'di','di',null,q.at*D,D,6); break;
    case 'wind':   datH(H,frame,'dam','dam',null,q.t*D,D,5); break;
    case 'strike': datH(H,frame,'dam','dam',null,500+q.t*D,D,5); break;
    case 'rec':    datH(H,frame,'dam','dam',null,500+16*D+q.t*D,D,5); break;
    case 'hit':    datH(H,frame,'trung','trung',null,q.t*D,D,3); break;
    case 'die':    datH(H,frame,'chet','chet',null,q.t*D,D,2); break;
    case 'sleep':  datH(H,frame,'ngu','dung',null,q.at*D*0.5,D*0.5,8); break;
    default:       datH(H,frame,'dung','dung',null,q.at*D,D,6);
  }
  H.info=q.st+' t'+q.t+' → '+(H.clip?(H.k!==H.clip?H.k+'/':'')+H.clip+' '+Math.round(H.t)+' ms (khung '+khungSo('quai',H.clip,H.t)+')':H.k);
};
function khungSo(nv,cn,t){ const c=J.nv[nv].clip[cn]; let x=t; if(c.lap) x=((x%c.ms)+c.ms)%c.ms; return Math.min(c.F.length-1,Math.max(0,Math.floor(x/c.buoc_ms))); }
QBR.khungSo=khungSo;

/* ---- BOSS: các tư thế tự đặt (dựng từ 6 mảnh có sẵn, đơn vị px ảnh nguồn; 1 px logic ≈ 3,37 px nguồn) ---- */
const B='boss';
const TU = {
  ngu(P,t){       // ngủ (chờ Lam vào phòng): chìm xuống sát đất, hai nắm tay đặt trên đất, thở rất chậm, hơi tối
    const th=Math.sin(t*0.0018);
    nutSet(B,P,'than',0,18,0,1.02+0.006*th,0.98-0.006*th); nutSet(B,P,'tay-truoc',-200,235,-6); nutSet(B,P,'tay-sau',90,248,6); nutSet(B,P,'xich',0,0,6);
    tatCa(B,P,5,0.18);
  },
  gam(P,t){       // thức giấc / gầm: ngả ra sau, hai nắm tay giơ cao trên mái, rung
    const j=((t/D|0)>>1)%2?1:-1;
    nutSet(B,P,'than',3*j,-4,6,1.02,1); nutSet(B,P,'tay-truoc',66+4*j,-586,-20); nutSet(B,P,'tay-sau',-66-4*j,-590,20); nutSet(B,P,'xich',0,0,-6+4*j);
  },
  rung(P,t){      // chuyển pha 2 (30 bước đầu toP2): rung bần bật tại chỗ
    const j=((t/D|0)>>1)%2?1:-1;
    nutSet(B,P,'than',5*j,0,1.5*j); nutSet(B,P,'tay-truoc',-6*j,-40,-4*j); nutSet(B,P,'tay-sau',6*j,-36,4*j); nutSet(B,P,'xich',0,0,-8*j);
  },
  bay(P,t){       // bay lên trần (toP2 sau 30 bước, rise): vươn hai tay lên, thân hơi kéo dài, xích trôi sau
    nutSet(B,P,'than',0,0,-3,0.97,1.03); nutSet(B,P,'tay-truoc',40,-380,-15); nutSet(B,P,'tay-sau',-40,-385,15); nutSet(B,P,'xich',0,0,10);
  },
  treo(P,t){      // treo trần: thân đung đưa nhẹ, hai nắm tay buông thõng, đoạn xích treo giữ gần thẳng đứng
    const sw=Math.sin(t*0.003), s2=Math.sin(t*0.0042);
    nutSet(B,P,'than',0,0,2.5*sw); nutSet(B,P,'tay-truoc',30+10*sw,140+12*s2,-12); nutSet(B,P,'tay-sau',-30+8*sw,130-12*s2,12);
    nutSet(B,P,'xich',0,0,-2.5*sw+4*Math.sin(t*0.0048));
  },
  rungTran(P,t){  // rung trần (shakeCeil): hai nắm tay thay nhau nện lên trần
    const k=((t/D|0)>>3)%2, j=((t/D|0)>>1)%2?1:-1;
    nutSet(B,P,'than',0,4*j,1*j); nutSet(B,P,'tay-truoc',50,k?-640:-500,-22); nutSet(B,P,'tay-sau',-50,k?-500:-640,22); nutSet(B,P,'xich',0,0,6*j);
  },
  giat(P,t){      // bị xích giật (pulled, 14 bước đầu): chúi về phía nút, tay quờ lên
    const j=((t/D|0)>>1)%2?1:-1;
    nutSet(B,P,'than',0,8,-10+2*j); nutSet(B,P,'tay-truoc',60,-420,-30); nutSet(B,P,'tay-sau',-40,-450,30); nutSet(B,P,'xich',0,0,25);
  },
  roi(P,t){       // rơi xuống (pulled sau 14 bước): thân kéo dài, tay giơ cao
    nutSet(B,P,'than',0,0,-6,0.96,1.05); nutSet(B,P,'tay-truoc',40,-560,-26); nutSet(B,P,'tay-sau',-40,-580,26); nutSet(B,P,'xich',0,0,15);
  },
  choang(P,t){    // choáng trên đất (stun 180 bước): nén lúc vừa rơi, ngồi bệt (xích chạm đất), lắc lư chậm, tay nằm trên đất
    const k=Math.max(0,1-t/170), w=Math.sin(t*0.0035);
    nutSet(B,P,'than',0,20,2*w,1+0.1*k,1-0.1*k); nutSet(B,P,'tay-truoc',-237,235,-10+3*w); nutSet(B,P,'tay-sau',102,248,10-3*w); nutSet(B,P,'xich',0,0,-10-6*w);
  }
};
QBR.TU=TU;
/* đập (dap): game cho boss NHẢY THẬT (vy −14, trọng lực 0,7) → độ cao do GAME. Clip gốc tự nâng thân 16–19 px trong
   chuẩn bị/trên không → BỎ phần nâng đó (chỉ giữ nghiêng thân, tay, xích), thay bằng một cú nhún lấy đà khi còn trên đất. */
const NHUN=14;   // px nguồn (~4 px logic)
function dapChuanBi(P,t){ const k=smooth(t/480), o=J.nv[B].idx.than*NC; P[o+1]=NHUN*k; P[o+3]=1+0.035*k; P[o+4]=1-0.035*k; }
function dapTrenKhong(P,t,H){ const o=J.nv[B].idx.than*NC, k=Math.max(0,1-H.khong/4); P[o+1]=NHUN*k; P[o+3]=1+0.035*k-0.03*(1-k); P[o+4]=1-0.035*k+0.03*(1-k); }

/* ---- BOSS: trạng thái game (updateBoss) → clip / tư thế ----
   slamPrep (30)  → 'dap' 0–500 ms (nhún, không tự nâng thân)
   slamAir        → KHÔNG theo thời gian: đi lên: 500→700 ms theo vy/vy0; đi xuống: 700→950 ms theo phần độ cao đã rơi
                    (h / h đỉnh) – chạm 950 ms đúng lúc game báo tiếp đất. Không có mốc 950 ms cố định.
   slamRec (45)   → sự kiện tiếp đất: 'dap' 950 + t ms (khung chạm 19–21) → 1700 ms
   sweepPrep (30) → 'quet' 0–500 · sweep (14) → 500–733 (hitbox game t 2–10 = 533–667 ms = khung 11–13) · sweepRec (36) → 733–1333
   intro → 'gam' · sleep → 'ngu' · walk → 'dung' · toP2 → 'rung' rồi 'bay' · hang → 'treo' · shakeCeil → 'rungTran'
   pulled → 'giat' rồi 'roi' · stun → 'choang' · rise → 'bay' · die → 'chet'
   Trúng đòn: game KHÔNG cho boss choáng → không đổi clip (đòn đang đánh chạy tiếp), chỉ nháy trắng do game (b.flash). */
QBR.capNhatBoss = function(b,frame,G){
  const H=b.H||(b.H=Hoat(B));
  switch(b.st){
    case 'sleep': datH(H,frame,'ngu',null,TU.ngu,b.at*D,D,10); break;
    case 'intro': datH(H,frame,'gam',null,TU.gam,b.t*D,D,18); break;
    case 'walk':  datH(H,frame,'dung','dung',null,b.at*D,D,10); break;
    case 'slamPrep': H.khong=0; H.vy0=0; H.h0=0; datH(H,frame,'dap','dap',dapChuanBi,b.t*D,D,6); break;
    case 'slamAir': {
      const h=Math.max(0,G.FLOOR-(b.y+b.h));
      if(!H.khong){ H.vy0=Math.min(-1,b.vy); H.h0=0; }
      H.khong=(H.khong||0)+1;
      let t, r;
      if(b.vy<0){ t=500+200*(1-b.vy/H.vy0); r=200*(0.7/-H.vy0)*1; }
      else { if(h>H.h0) H.h0=h; const p=H.h0>0?1-h/H.h0:1; t=700+250*Math.min(1,p); r=0; }
      datH(H,frame,'dap','dap',dapTrenKhong,t,0,6);
      H.r=r>0?r:0;
      break;
    }
    case 'slamRec': datH(H,frame,'dap','dap',null,950+b.t*D,D,2); break;
    case 'sweepPrep': datH(H,frame,'quet','quet',null,b.t*D,D,6); break;
    case 'sweep':     datH(H,frame,'quet','quet',null,500+b.t*D,D,6); break;
    case 'sweepRec':  datH(H,frame,'quet','quet',null,500+14*D+b.t*D,D,6); break;
    case 'toP2': if(b.t<30) datH(H,frame,'rung',null,TU.rung,b.t*D,D,6); else datH(H,frame,'bay',null,TU.bay,b.t*D,D,14); break;
    case 'hang': datH(H,frame,'treo',null,TU.treo,b.at*D,D,14); break;
    case 'shakeCeil': datH(H,frame,'rungTran',null,TU.rungTran,b.t*D,D,4); break;
    case 'pulled': if(b.t<14) datH(H,frame,'giat',null,TU.giat,b.t*D,D,3); else datH(H,frame,'roi',null,TU.roi,b.t*D,D,5); break;
    case 'stun': datH(H,frame,'choang',null,TU.choang,b.t*D,D,3); break;
    case 'rise': datH(H,frame,'bay',null,TU.bay,b.t*D,D,10); break;
    case 'die':  datH(H,frame,'chet','chet',null,b.t*D,D,4); break;
    default:     datH(H,frame,'dung','dung',null,b.at*D,D,10);
  }
  H.info=b.st+' t'+b.t+' → '+(H.clip?H.clip+' '+Math.round(H.t)+' ms (khung '+khungSo(B,H.clip,H.t)+')':H.k+' (tư thế tự đặt)');
};

window.QBR = QBR;
})();
