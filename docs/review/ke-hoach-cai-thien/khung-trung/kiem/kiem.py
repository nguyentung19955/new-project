import sys, os
K='/home/claude/new-project/docs/review/ke-hoach-cai-thien/full-audit/A-nhan-vat/kiem'
sys.path.insert(0,K)
from lib import mo, luu_png
from playwright.sync_api import sync_playwright
them=sys.argv[1] if len(sys.argv)>1 else ''
with sync_playwright() as p:
    b,pg,errs=mo(p,them=them)
    pg.add_script_tag(path=K+'/tu_the.js')
    print('flags',pg.evaluate("[G.KHUNG_TRUNG,G.VK_NGA,G.BUA_LON]"))
    print(pg.evaluate("""() => { const SC=G.spriteCustom, r={};
      for (const [m,k] of [['socNo','atk'],['socNo','die'],['em-be-wrestler-bien','atk'],['hoTinh-p2','atk'],['socNo','idle']]) { const a=SC.ds[m].dt[k];
        const f=[]; for (let j=0;j<=20;j++) f.push(SC.khungMot(a,j/20)); r[m+'/'+k]=JSON.stringify(a.bang||null)+' '+f.join(''); }
      return r; }"""))
    if 'png' in sys.argv:
        url=pg.evaluate("""() => { const A=AUD, Z=3, W=64;
          const cv=document.createElement('canvas'); const ts=[0.02,0.08,0.15,0.22,0.35,0.6]; const vks=['sword','spear','hammer','bow'];
          const rows=[]; for (const key of ['smith','wrestler']) for (const wt of vks) for (const nga of [false,true]) rows.push([key,wt,nga]);
          const rows2=[]; for (const key of ['smith','healer']) for (const bl of [false,true]) rows2.push([key,bl]);
          cv.width=Math.max(ts.length,6)*W*Z+80; cv.height=(rows.length+rows2.length)*W*Z/1.4+20; const c=cv.getContext('2d'); c.fillStyle='#4a6b3c'; c.fillRect(0,0,cv.width,cv.height);
          const t=document.createElement('canvas'); t.width=t.height=64; const x=t.getContext('2d'); c.imageSmoothingEnabled=false;
          let y=0; c.font='12px sans-serif';
          for (const [key,wt,nga] of rows) { G.VK_NGA=nga; ts.forEach((k,i)=>{ const o=A.oCua(key,A.outfit(null,{}),wt,1,['',{p:{dead:true,deadT:k,hurtT:0,st:{}}}]); A.ve(x,o); c.drawImage(t,8,8,48,48,80+i*W*Z*0.8,y,48*Z*0.8*1.33,48*Z*0.8*1.33); });
            c.fillStyle='#fff'; c.fillText(key+' '+wt+(nga?' SAU':' TRUOC'),2,y+30); y+=W*Z/1.4; }
          const us=[0.05,0.2,0.35,0.5,0.65,0.85];
          for (const [key,bl] of rows2) { G.BUA_LON=bl; us.forEach((u,i)=>{ const o=A.oCua(key,A.outfit(null,{hand:'bua_hut'}),'sword',1,['',{dodge:u,p:{dead:false,hurtT:0,st:{}}}]); A.ve(x,o); c.drawImage(t,8,8,48,48,80+i*W*Z*0.8,y,48*Z*0.8*1.33,48*Z*0.8*1.33); });
            c.fillStyle='#fff'; c.fillText(key+' lộn bùa'+(bl?' SAU':' TRUOC'),2,y+30); y+=W*Z/1.4; }
          G.VK_NGA=true; G.BUA_LON=true; return cv.toDataURL(); }""")
        luu_png(url,'luoi.png')
    print('pageerror',errs)
    b.close()
