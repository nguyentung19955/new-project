import json,sys
it=json.load(open('/tmp/cc/p3.json')); it=it if isinstance(it,list) else it['items']
lo,hi=int(sys.argv[1]),int(sys.argv[2]); tabs=[int(t) for t in sys.argv[3].split(',')]
sel=it[lo:hi]; tabs=tabs[:len(sel)]
a=[{"name":"navigate","input":{"tabId":t,"url":"https://chatgpt.com/"}} for t in tabs]
for t,x in zip(tabs,sel):
  a.append({"name":"javascript_tool","input":{"action":"javascript_exec","tabId":t,"text":"window._me=%s;window._need=1;(0,eval)(localStorage.getItem('_spk'));window._p=%s;window._try();window._me"%(json.dumps(x['name']),json.dumps(x['prompt']))}})
fw=tabs[0]
a.append({"name":"javascript_tool","input":{"action":"javascript_exec","tabId":fw,"text":"window._bcF=new BroadcastChannel('refch');window.addEventListener('message',e=>{const d=e.data;if(d&&d.ref){window._bcF.postMessage({to:d.to,b64:d.b64,name:d.name})}});window._rel=new BroadcastChannel('rel2');window._rel.onmessage=e=>{if(window._gh)window._gh.postMessage(e.data,'*')};for(const [id,t,y,u] of [['rb2','REF2',60,'https://raw.githubusercontent.com/nguyentung19955/new-project/claude/demo-hop-tuong/README.md'],['gh2','GH2',120,'https://github.com/nguyentung19955/new-project/upload/claude/demo-hop-tuong/docs/demo-hop-tuong/thap-art']]){const b=document.createElement('button');b.id=id;b.textContent=t;b.style.cssText='position:fixed;left:300px;top:'+y+'px;z-index:99999;padding:12px;background:red;color:#fff';b.onclick=()=>{if(id=='rb2')window._raw=window.open(u);else window._gh=window.open(u)};document.body.appendChild(b)}'fw'"}})
json.dump(a,open('/tmp/cc/p3w/a.json','w'))
canvas="(async()=>{const im=document.querySelector('img');await im.decode().catch(()=>{});const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const g=c.getContext('2d');g.fillStyle='#FF00FF';g.fillRect(0,0,c.width,c.height);g.drawImage(im,0,0);opener.postMessage({ref:1,to:TO,name:'REFN',b64:c.toDataURL('image/png').split(',')[1]},'*');return c.width})()"
base="https://raw.githubusercontent.com/nguyentung19955/new-project/claude/demo-hop-tuong/"
b=[]
for x in sel:
  b.append({"name":"navigate","input":{"tabId":"RAW","url":base+x['ref']}})
  b.append({"name":"javascript_tool","input":{"action":"javascript_exec","tabId":"RAW","text":canvas.replace('TO',json.dumps([x['name']])).replace('REFN',x['ref'].split('/')[-1])}})
b.append({"name":"computer","input":{"action":"wait","duration":5,"tabId":fw}})
for t in tabs:
  b.append({"name":"javascript_tool","input":{"action":"javascript_exec","tabId":t,"text":"[window._me,window._n,document.querySelector('.ProseMirror').innerText.length,document.querySelectorAll('button[aria-label^=Remove]').length]"}})
json.dump(b,open('/tmp/cc/p3w/b.json','w'))
c=[]
for t in tabs:
  c.append({"name":"javascript_tool","input":{"action":"javascript_exec","tabId":t,"text":"document.querySelector('.ProseMirror').focus();1"}})
  c.append({"name":"computer","input":{"action":"key","text":"Return","tabId":t,"action_summary":"Sends the image prompt"}})
json.dump(c,open('/tmp/cc/p3w/c.json','w'))
col="(async()=>{const im=[...document.images].filter(i=>i.naturalWidth>=1000).pop();const bl=await (await fetch(im.src)).blob();const b64=await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result.split(',')[1]);fr.readAsDataURL(bl)});new BroadcastChannel('rel2').postMessage({name:window._me,b64});})();window._me"
st=[{"name":"javascript_tool","input":{"action":"javascript_exec","tabId":t,"text":"[window._me,[...document.images].filter(i=>i.naturalWidth>=1000).length,document.querySelectorAll('[data-testid=stop-button]').length,/unable|can't|policy/i.test(document.body.innerText.slice(-600))]"}} for t in tabs]
json.dump(st,open('/tmp/cc/p3w/s.json','w'))
json.dump({"tabs":tabs,"names":[x['name'] for x in sel],"col":col},open('/tmp/cc/p3w/meta.json','w'))
print([x['name'] for x in sel])
