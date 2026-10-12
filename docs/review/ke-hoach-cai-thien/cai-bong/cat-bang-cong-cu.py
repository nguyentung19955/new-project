import json, sys, asyncio
from playwright.sync_api import sync_playwright
img=sys.argv[1]; so1=int(sys.argv[2]); out=sys.argv[3]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page()
    errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto('http://localhost:8765/tools/tach-anh-hung/index.html'); pg.wait_for_timeout(800)
    pg.evaluate("""(so1)=>{const i=NV.findIndex(q=>q.ma==='em-be-healer'); datNV(NV[i]); hienNV(); SO[1]=so1;}""", so1)
    pg.set_input_files('#chonAnh', img); pg.wait_for_timeout(4000)
    print(pg.evaluate("SO"), pg.evaluate("KQ && KQ.dat"))
    print(pg.inner_text('#dsKiem'))
    t=pg.evaluate("JSON.stringify(taoTep())")
    open(out,'w').write(t)
    print('errs',errs)
    b.close()
