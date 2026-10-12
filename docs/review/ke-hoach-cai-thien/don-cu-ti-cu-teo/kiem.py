import sys, re, base64, subprocess, time, io
sys.path.insert(0,'/home/claude/new-project/game/tests')
src=open('/home/claude/new-project/game/tests/don_vk_shots.py').read()
TU_THE=re.search(r'TU_THE = r"""(.*?)"""',src,re.S).group(1)
BANG=re.search(r'BANG = r"""(.*?)"""',src,re.S).group(1)
from playwright.sync_api import sync_playwright
from PIL import Image
import os; R=os.path.abspath(os.path.join(os.path.dirname(__file__),'../../../..')); SP=os.environ.get('SP','/tmp')
srv=subprocess.Popen(['python3','-m','http.server','8766'],cwd=R,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(1)
CHO="window.G && G.spriteCustom && ['smith','hunter'].every(k=>{const s=G.spriteCustom.get('em-be-'+k);return s&&s.img&&s.dt.atk_sword&&s.dt.cast}) && G.spriteCustom.do && G.spriteCustom.do['vk-sword-3'] && G.spriteCustom.do['vk-sword-3'].ready && G.spriteCustom.ghep && G.spriteCustom.ghep.smith"
try:
  with sync_playwright() as p:
    b=p.chromium.launch()
    for trang in sys.argv[1:]:
      errs=[]; pg=b.new_page(viewport={'width':960,'height':540}); pg.on('pageerror',lambda e: errs.append(str(e)))
      pg.goto('http://localhost:8766/game/dist/%s?cloud=0'%trang); pg.wait_for_function(CHO,timeout=120000); pg.wait_for_timeout(800)
      print(trang, pg.evaluate("()=>['smith','hunter'].map(k=>k+': '+Object.entries(G.spriteCustom.get('em-be-'+k).dt).map(([n,a])=>n+'@'+a.hang+'x'+a.so).join(' ')).join(' | ')"))
      if trang=='linh-khi.html':
        pg.evaluate("() => { G.tick = function () {}; }"); pg.add_script_tag(content=TU_THE)
        # chon dung hang
        print(pg.evaluate("""()=>{const out=[];for(const k of ['smith','hunter']){const sp=G.spriteCustom.cuaEmBe(k,{});
          for(const wt of ['sword','bow','spear','hammer']){const s=G.spriteCustom.chonEmBe(sp,{key:k,t:1,atk:0.5,dodge:-1,weapon:{type:wt},p:{comboI:0,mv:{},st:{}}});out.push(k+'/'+wt+'->'+s.ten+':'+s.i);}
          const s=G.spriteCustom.chonEmBe(sp,{key:k,t:1,atk:-1,dodge:-1,weapon:{type:'sword'},p:{castT:0.2,st:{}}});out.push(k+'/chuong->'+s.ten+':'+s.i);}return out.join(' ')}"""))
        for k in ['smith','hunter']:
          d=pg.evaluate(BANG,k); im=Image.open(io.BytesIO(base64.b64decode(d.split(',')[1]))).convert('RGB')
          im=im.resize((im.width*2//3, im.height*2//3), Image.NEAREST).quantize(64)
          im.save(SP+'/don-%s.png'%k, optimize=True)
      print('pageerror', errs); pg.close()
    b.close()
finally: srv.kill()
