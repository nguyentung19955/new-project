import sys, json
from playwright.sync_api import sync_playwright
ROOT='/home/claude/new-project/game'
URL=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8766/index.html?cloud=0'
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium' if False else None)
    pg=b.new_page(viewport={'width':844,'height':390},device_scale_factor=1)
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL); pg.wait_for_timeout(2500)
    pg.add_script_tag(path=ROOT+'/tests/setup.js')
    r=pg.evaluate('''()=>{
      const out={};
      G.resetSave(); out.moi=G.lucChienParts(); out.moiSM=G.power();
      const cfg=[['c1',{lvl:1}],['c10',{lvl:10,tier:1,sharpen:3}],['c20',{lvl:20,tier:2,sharpen:6,branch:'fire',marksMoi:400}],
        ['c40',{lvl:40,tier:3,sharpen:15,branch:'fire',marksMoi:900,power:'boss',affixes:['crit','mana']}]];
      for(const [k,o] of cfg){G.testSave(o); out[k]=[G.lucChien(),G.power()];}
      // chiều
      G.testSave({lvl:10,tier:1,sharpen:3}); const sv=G.save; const a=G.lucChien();
      const w=G.newWeapon(sv,'sword',2); w.affixes=[];w.power=null; const g=G.lucChienUI.thuVuKhi(w,0);
      sv.carry[0]=w.id; const b2=G.lucChien();
      G.weaponById(sv.carry[0]).sharpen++; const c=G.lucChien();
      sv.carry[1]=null; const d=G.lucChien();
      sv.heroes.smith.lvl++; const e=G.lucChien();
      sv.heroes.smith.sk.atk++; const f=G.lucChien();
      out.chieu={dau:a,thu:g,mangTim:b2,mai:c,thaoO2:d,lenCap:e,kyNang:f};
      out.heroes=G.HKEYS.map(k=>[k,G.lucChien(sv,k)]);
      out.hero=sv.hero;
      return out;}''')
    print(json.dumps(r,indent=0,ensure_ascii=False)); print('ERR',errs)
    b.close()
