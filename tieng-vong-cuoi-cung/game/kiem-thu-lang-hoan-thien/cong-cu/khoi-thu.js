/* ======================= THỬ – chỉ có trong game/kiem-thu-lang-hoan-thien/kiem-thu*.html, KHÔNG có trong demo.html =======================
   demo.html đã có: ?vao=quai | ?vao=boss, ?tt=0, ?hitbox=1. Khối này thêm:
     ?quai=0     bỏ cả 3 quái Sân chuông · ?quai=gac  chỉ giữ quái gác cổng (để quay Cộng hưởng)
     ?ghi=1      chế độ chụp / quay: không tự chạy; mỗi khung gọi TVTHU.khung() (60 bước/giây cố định, 1 bước = 1 khung video)
   Dùng chung cho bản TRƯỚC (demo.html cũ, không có LHT) – mọi hàm làng hoàn thiện đều kiểm tra có tồn tại không. */
const THU=(()=>{ let q; try{ q=new URLSearchParams(location.search); }catch(e){ q=new Map(); }
  return {ghi:q.get('ghi')==='1', quai:q.get('quai')||''}; })();
const _newGame=newGame;
newGame=function(){ _newGame();
  if(THU.quai==='0') for(const q of Q){ q.gone=true; q.dead=true; }
  if(THU.quai==='gac') for(const q of Q) if(q!==GUARD){ q.gone=true; q.dead=true; }
  for(const q of Q) q.H=null; boss.H=null; };
/* bot đi phải: nhảy khi có ô chặn trước chân (khối đá Sân chuông) */
const BOT={giuJ:false,giuT:0};
function botPhai(){
  const fx=pl.x+pl.w/2, fy=pl.y+pl.h, dac=(x,y)=>solidC(tile(Math.floor(x/T),Math.floor(y/T)));
  kb.r=1;
  if(pl.onGround && (dac(fx+58,fy-4)||dac(fx+58,fy-40)) && !BOT.giuJ){ BOT.giuJ=true; BOT.giuT=0; }
  if(BOT.giuJ){ kb.j=1; BOT.giuT++; if((pl.vy>=0 && !pl.onGround) || BOT.giuT>40) BOT.giuJ=false; }
}
if(THU.ghi) loop=function(){};
window.TVTHU={
  async batDau(){ while(!(window.TVDEMO&&TVDEMO.ready&&loadEl.hidden)) await wait(50); audioInit(); startEl.hidden=true; S.paused=false; document.getElementById('warn').hidden=true; },
  datCam(x,camx,y){ placePlayer(x,(y===undefined?FLOOR:y)-pl.h); pl.drawT=0; pl.face=1; const r=ROOMS[S.room];
    for(let i=0;i<2;i++){ savePrev(); step(); } S.camx=S.pcx=clamp(camx,r.x0*T,(r.x0+r.w)*T-W); S.camy=0; render(1);
    return {camx:S.camx, ox, x:pl.x, room:S.room}; },
  /* n bước; phim = {r:1, j:1, …} giữ trong các bước đó; 'phai' = bot đi phải (tự nhảy qua khối) */
  khung(n,phim){ for(let i=0;i<(n||1);i++){ for(const k of KEYS) kb[k]=0; if(phim==='phai') botPhai(); else if(phim) for(const k in phim) kb[k]=phim[k];
      savePrev(); step(); } for(const k of KEYS) kb[k]=0; render(1);
    return {f:S.frame, x:+(pl.x+pl.w/2).toFixed(1), y:+pl.y.toFixed(1), g:pl.onGround, room:S.room, res:S.resCount, rec:!!rec, echo:!!echo, hp:pl.hp,
      th:typeof TH!=='undefined'&&TH.on, gan:typeof TH!=='undefined'&&TH.gan?TH.gan.id:null}; },
  ve(){ render(1); },
  tocMau(){ pl.hp=P.maxHp; },
  noi(){ if(typeof TH!=='undefined' && TH.gan){ thMo(TH.gan); return true; } return false; },
  tiep(){ if(typeof thTiepTuc==='function') thTiepTuc(); },
  dong(){ if(typeof thDong==='function') thDong(); },
  moNPC(id,i){ if(typeof NPC==='undefined') return false; const n=NPC.find(v=>v.id===id); thMo(n); for(let k=0;k<(i||0);k++) thTiepTuc(); return true; },
  luu(i,on,ring){ const b=BELLS[i]; for(const o of BELLS) o.on=false; b.on=!!on; b.ring=ring||0; render(1); },
  rung(n){ if(typeof lhRung==='function') lhRung(n); },
  ket(){ endScreen(); },
  /* boss pha 2 treo trần (chỉ để chụp trần): đặt trạng thái + vài bước cho rig */
  bossTreo(){ boss.st='hang'; boss.phase=2; boss.hittable=false; boss.x=HANG_X; boss.y=HANG_Y; boss.px=boss.x; boss.py=boss.y; boss.shardT=9999; bossBar(true);
    for(let i=0;i<20;i++){ savePrev(); boss.t=0; boss.shardT=9999; updateBoss(); } render(1); },
  hint(an){ document.getElementById('hint').style.visibility=an?'hidden':''; }
};
