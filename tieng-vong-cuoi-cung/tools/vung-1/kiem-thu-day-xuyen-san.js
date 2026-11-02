// Quét mọi chỗ dây leo xuyên sàn mỏng ở Vùng 1: đi ngang không rơi, đứng đó bấm ↑ / ↓ phải bám dây. Chạy: (cd tieng-vong-cuoi-cung && python3 -m http.server 8765) rồi node tools/vung-1/kiem-thu-day-xuyen-san.js
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:960,height:540}});
await pg.goto('http://localhost:8765/game/vung-1/index.html?tu=1');await pg.waitForFunction(()=>window.TV&&(TV.xong||TV.loi),null,{timeout:20000});
const r=await pg.evaluate(async()=>{const {V1,E}=TV,pl=E.pl,T=48;await V1.batDau(true);const out=[];
 // quét mọi phòng: mọi ô cầu dây (dây xuyên sàn) → đứng cạnh, đi ngang qua (không rơi), đứng giữa bấm ↑ và ↓ (phải bám dây)
 for(const id of ['P01','P02','P03','P04','P06','P09']){const p=await V1.layPhong(id);V1.vaoPhong(p,null,null);
  const cau=[...E.BD.cau].map(s=>s.split(',').map(Number));
  for(const [c,r] of cau){
   const thu=async(phim,n,dx)=>{V1.vaoPhong(p,null,{x:c*T+24+dx,y:r*T});V1.camDat();for(let i=0;i<10;i++){for(const k of V1.KEYS)V1.ep[k]=0;TV.mot();}
     const y0=pl.y,x0=pl.x;let leo=0;for(let i=0;i<n;i++){for(const k of V1.KEYS)V1.ep[k]=0;V1.ep[phim]=1;TV.mot();if(pl.leo)leo++;}return {dy:Math.round(pl.y-y0),dx:Math.round(pl.x-x0),leo};};
   const di=await thu('r',40,-60), len=await thu('u',40,0), xuong=await thu('d',40,0);
   out.push(`${id} (${c},${r}) đi ngang dy=${di.dy} dx=${di.dx} | ↑ dy=${len.dy} leo=${len.leo} | ↓ dy=${xuong.dy} leo=${xuong.leo}`);}}
 return out;});
console.log(r.join('\n'));await b.close();})();
