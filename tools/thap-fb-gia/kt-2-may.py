import json, time, sys
from playwright.sync_api import sync_playwright
from PIL import Image
# TURRET MERGE — kiểm CO-OP online bằng 2 trình duyệt Playwright, chạy ĐÚNG đường code Firebase (?net=fb) nhưng thay SDK trong
# js/online/vendor bằng SDK giả (client.js) nối tới server.js — máy chủ giả thi hành ĐÚNG rules đang publish của turret-merge.
# Chạy (từ gốc repo):  NODE_PATH=<nơi có ws> node tools/thap-fb-gia/server.js &   python3 -m http.server 8000 &
#                      python3 tools/thap-fb-gia/kt-2-may.py [DPR] [thư mục ảnh]
import os
S=os.path.dirname(os.path.abspath(__file__))
FAKE=open(S+'/client.js').read()
URL='http://localhost:8000/thap/?net=fb&nointro=1&auto=1'
DPR=int(sys.argv[1]) if len(sys.argv)>1 else 1
OUT=sys.argv[2] if len(sys.argv)>2 else S+'/shots'
import os; os.makedirs(OUT, exist_ok=True)
errs=[]; R={}
IPHONE_UA='Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
def route(r):
    u=r.request.url
    r.fulfill(status=200, content_type='application/javascript', body=FAKE if 'app-compat' in u else '/*fake*/')
def mk(b, name, state=None, ua=None):
    kw=dict(viewport={'width':390,'height':844}, device_scale_factor=DPR, has_touch=True, storage_state=state)
    if ua: kw['user_agent']=ua
    ctx=b.new_context(**kw)
    ctx.add_init_script("try{if(!localStorage.getItem('turret_hd'))localStorage.setItem('turret_hd','{\"xong\":true,\"boQua\":true}')}catch(e){}")
    ctx.route('**/js/online/vendor/*.js', route)
    p=ctx.new_page()
    p.on('pageerror', lambda e: errs.append((name,'pageerror',str(e)+' '+str(e.stack)[:900])))
    p.on('console', lambda m: errs.append((name,'console.'+m.type,m.text)) if m.type in ('error','warning') else None)
    p.goto(URL); p.wait_for_function('typeof G!=="undefined" && G.rosterMap && G.roster && G.roster.length>0', timeout=60000)
    p.wait_for_function('NET.ok', timeout=20000)
    return ctx,p
def sbs(a,bb,n):
    pa,pb=OUT+'/_a.png',OUT+'/_b.png'; a.screenshot(path=pa); bb.screenshot(path=pb)
    A=Image.open(pa); B=Image.open(pb); g=16*DPR
    c=Image.new('RGB',(A.width*2+g,A.height),(16,17,20)); c.paste(A,(0,0)); c.paste(B,(A.width+g,0)); c.save(OUT+'/'+n+'.png'); os.remove(pa); os.remove(pb)
def db(p, op='dump', **kw):
    return p.evaluate("(m)=>new Promise(ok=>{const w=new WebSocket('ws://localhost:8790'); w.onopen=()=>w.send(JSON.stringify(Object.assign({rid:1},m))); w.onmessage=e=>{const r=JSON.parse(e.data); if(r.rid===1){ok(r); w.close()}}})", dict(op=op, **kw))
def rooms(p): return ((db(p)['v'].get('turretmerge') or {}).get('rooms') or {})
tom=lambda p: p.evaluate('ONS.tom()')
with sync_playwright() as pw:
    b=pw.chromium.launch()
    ca,a=mk(b,'A'); cb,bb=mk(b,'B')
    for p in (a,bb): p.evaluate("UI.chon=deckNgauNhien(); UI.veBoChon()")
    R['anon']=[a.evaluate('NET.user.anon'), bb.evaluate('NET.user.anon')]
    # Google link (desktop = popup) keeps uid
    u0=bb.evaluate('NET.user.uid'); bb.click('#tk-chip'); bb.wait_for_selector('#tk-google:not([hidden])'); bb.click('#tk-google')
    bb.wait_for_function('NET.user && !NET.user.anon'); R['google_desktop']={'via':bb.evaluate('window.__linkVia'),'uid_kept':bb.evaluate('NET.user.uid')==u0}
    bb.wait_for_timeout(500); bb.click('[data-act=tk-dong]')
    # iPhone = redirect, keeps uid
    ci,ip=mk(b,'IPHONE',ua=IPHONE_UA); u1=ip.evaluate('NET.user.uid'); ip.click('#tk-chip'); ip.wait_for_selector('#tk-google:not([hidden])')
    ip.click('#tk-google'); ip.wait_for_timeout(1500); ip.wait_for_function('typeof NET!=="undefined" && NET.ok && NET.user && !NET.user.anon', timeout=30000)
    R['google_ios']={'via':ip.evaluate("localStorage.getItem('fake_link_via')"),'uid_kept':ip.evaluate('NET.user.uid')==u1}; ci.close()
    # stale room (3 h old) is ignored
    old=int(time.time()*1000)-3*3600*1000
    a.evaluate("""(old)=>new Promise(ok=>{const w=new WebSocket('ws://localhost:8790'); let n=0; w.onopen=()=>{w.send(JSON.stringify({op:'hello',rid:1,uid:'zzold'})); w.send(JSON.stringify({op:'set',rid:2,path:'turretmerge/rooms/QQQQ',v:{meta:{host:'zzold',at:old,st:'cho',seed:1,v:1},members:{zzold:true}}}))}; w.onmessage=()=>{if(++n===2){ok();w.close()}}})""", old)
    bb.click('#onl-nut'); bb.wait_for_selector('#onl-ma'); bb.fill('#onl-ma','QQQQ'); bb.click('[data-act=onl-vao]'); bb.wait_for_timeout(1200)
    R['stale_join']=bb.inner_text('#onl-loi')
    bb.fill('#onl-ma','ZZZZ'); bb.click('[data-act=onl-vao]'); bb.wait_for_timeout(1000); R['wrong_code']=bb.inner_text('#onl-loi')
    # create + join
    a.click('#onl-nut'); a.wait_for_selector('[data-act=onl-tao]'); a.click('[data-act=onl-tao]'); a.wait_for_function("document.querySelector('#sanh-ma') && document.querySelector('#sanh-ma').textContent.length===4", timeout=15000)
    code=a.inner_text('#sanh-ma'); R['code']=code
    bb.fill('#onl-ma', code); bb.click('[data-act=onl-vao]'); bb.wait_for_function("document.querySelector('#sanh-ma') && !document.querySelector('#onl-sanh').hidden", timeout=15000)
    a.wait_for_timeout(1200); sbs(a,bb,'01_sanh')
    r=rooms(a)[code]; R['members_on_create_join']=sorted(r.get('members',{}).keys())==sorted([a.evaluate('NET.user.uid'), bb.evaluate('NET.user.uid')])
    # third player -> full
    cc,c3=mk(b,'C'); c3.evaluate("UI.chon=deckNgauNhien(); UI.veBoChon()"); c3.click('#onl-nut'); c3.wait_for_selector('#onl-ma'); c3.fill('#onl-ma',code); c3.click('[data-act=onl-vao]'); c3.wait_for_timeout(1500); R['third']=c3.inner_text('#onl-loi'); cc.close()
    a.click('[data-act=onl-san]'); a.wait_for_timeout(600); sbs(a,bb,'02_sanh_ready'); bb.click('[data-act=onl-san]')
    a.wait_for_function('ONS.on', timeout=15000); bb.wait_for_function('ONS.on', timeout=15000)
    a.wait_for_function('G.wave>=2', timeout=90000); a.wait_for_timeout(7000); sbs(a,bb,'03_tran_wave2')
    a.wait_for_function('G.wave>=3', timeout=120000); bb.wait_for_timeout(1500)
    ta,tb=tom(a),tom(bb)
    R['wave_after_2']=[ta['wave'],tb['wave']]
    R['mirror']=[sum(x==y for x,y in zip(ta['toi'],tb['ban'])), sum(x==y for x,y in zip(tb['toi'],ta['ban']))]
    R['acts_received']=[ta['soAct'],tb['soAct']]
    # shared lives: guest leak -> host deducts -> both
    t0=a.evaluate('G.ban[0].tim'); bb.evaluate("ONS.gui('l',{n:1,id:'test'})"); a.wait_for_function('G.ban[0].tim===%d'%(t0-1), timeout=8000); bb.wait_for_function('G.ban[0].tim===%d'%(t0-1), timeout=8000)
    R['shared_lives']=[t0, a.evaluate('G.ban[0].tim'), bb.evaluate('G.ban[0].tim')]
    # disconnect: close guest context
    stB=cb.storage_state(); uB=bb.evaluate('NET.user.uid'); cb.close()
    a.wait_for_function("ONS.mat && !document.querySelector('#onl-mat').hidden", timeout=15000); a.wait_for_timeout(1500)
    R['disconnect']={'host_sees':a.inner_text('#mat-ten'),'paused':a.evaluate('G.dung'),'db_on':rooms(a)[code]['pl'][uB].get('on')}
    a.screenshot(path=OUT+'/_a.png')
    # reopen guest -> REJOIN
    cb,bb=mk(b,'B2',stB)
    R['rejoin_uid_same']=bb.evaluate('NET.user.uid')==uB
    bb.click('#onl-nut'); bb.wait_for_selector('#onl-lai:not([hidden])', timeout=15000); A=Image.open(OUT+'/_a.png'); bb.screenshot(path=OUT+'/_b.png')
    B=Image.open(OUT+'/_b.png'); g=16*DPR; c=Image.new('RGB',(A.width*2+g,A.height),(16,17,20)); c.paste(A,(0,0)); c.paste(B,(A.width+g,0)); c.save(OUT+'/04_mat_ket_noi.png'); os.remove(OUT+'/_a.png'); os.remove(OUT+'/_b.png')
    bb.click('#onl-lai'); bb.wait_for_function('ONS.on', timeout=15000); a.wait_for_function('!ONS.mat', timeout=20000); bb.wait_for_timeout(3000)
    ta,tb=tom(a),tom(bb); R['after_rejoin']={'waveA':ta['wave'],'waveB':tb['wave'],'timB':tb['tim'],'board_restored':sum(x==y for x,y in zip(tb['toi'],ta['ban'])),'host_paused':a.evaluate('G.dung')}
    sbs(a,bb,'05_vao_lai')
    w=ta['wave']; a.wait_for_function('G.wave>=%d'%(w+1), timeout=120000); bb.wait_for_timeout(2500)
    ta,tb=tom(a),tom(bb); R['play_after_rejoin']={'waveA':ta['wave'],'waveB':tb['wave'],'mirror':[sum(x==y for x,y in zip(ta['toi'],tb['ban'])), sum(x==y for x,y in zip(tb['toi'],ta['ban']))]}
    # end match: host ends -> guest follows -> host deletes room
    a.evaluate("ketThuc(false, TEXT.end.coopOut)"); bb.wait_for_function('!!G.ketThuc', timeout=10000); a.wait_for_timeout(2500); sbs(a,bb,'06_ket_qua')
    a.wait_for_timeout(5000); rs=rooms(a); R['room_deleted_after_match']=code not in rs
    R['guest_left_silently']={'code':bb.evaluate('ONL.code'),'panel_hidden':bb.evaluate("!document.querySelector('#onl-bang') || document.querySelector('#onl-bang').hidden")}
    bb.click('#ketqua [data-act=choilai]'); bb.wait_for_timeout(800); R['play_online_again_opens_panel']=bb.evaluate("!document.querySelector('#onl-bang').hidden && !document.querySelector('#chon').hidden")
    # cleanup test rooms (stale QQQQ by its owner)
    a.evaluate("""()=>new Promise(ok=>{const w=new WebSocket('ws://localhost:8790'); let n=0; w.onopen=()=>{w.send(JSON.stringify({op:'hello',rid:1,uid:'zzold'})); w.send(JSON.stringify({op:'remove',rid:2,path:'turretmerge/rooms/QQQQ'}))}; w.onmessage=()=>{if(++n===2){ok();w.close()}}})""")
    d=db(a); R['rooms_left']=list(((d['v'].get('turretmerge') or {}).get('rooms') or {}).keys()); R['denied']=d['denied']
    R['profiles']=len(((d['v'].get('turretmerge') or {}).get('profiles') or {}))
    b.close()
R['errors']=errs
print(json.dumps(R, indent=1, ensure_ascii=False))
