import json, sys, subprocess, time, base64
from playwright.sync_api import sync_playwright
import os; R=os.path.abspath(os.path.join(os.path.dirname(__file__),'../../../..')); SP=os.environ.get('SP','/tmp')
srv=subprocess.Popen(['python3','-m','http.server','8765'],cwd=R,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(1)
try:
  with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1200,'height':2000})
    errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto('http://localhost:8765/tools/tach-anh-hung/index.html'); pg.wait_for_timeout(1500)
    for key in sys.argv[1:]:
      ma='em-be-%s-don'%key
      idx=pg.evaluate("ma=>NV.findIndex(q=>q.ma===ma && !q.bo)",ma)
      pg.select_option('#chonNV',str(idx)); pg.wait_for_timeout(300)
      pg.set_input_files('#chonAnh',R+'/docs/anh-goc/2026-10-12/%s.png'%ma); pg.wait_for_timeout(4000)
      print(ma, pg.evaluate("()=>Q.ma"), pg.inner_text('#theKq'))
      print(pg.inner_text('#dsKiem'))
      tep=pg.evaluate("()=>taoTep()")
      json.dump(tep,open(SP+'/%s.sprite.json'%ma,'w'),ensure_ascii=False,separators=(',',':'))
      open(SP+'/%s.png'%ma,'wb').write(base64.b64decode(tep['tam'].split(',')[1]))
      pg.locator('#cvGoc').screenshot(path=SP+'/%s_goc.png'%ma)
      pg.wait_for_timeout(2500); print('thu:', pg.inner_text('#ttThu'))
    print('pageerror',errs)
    b.close()
finally: srv.kill()
