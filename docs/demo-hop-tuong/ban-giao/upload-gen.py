import json,sys
gh=int(sys.argv[1]); tabs=[int(t) for t in sys.argv[2].split(',')]
acc="window._acc=[];if(window._accL)window.removeEventListener('message',window._accL);window._accL=e=>{const d=e.data;if(!d)return;if(d.b64&&d.name){const bin=atob(d.b64);const u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);window._acc.push(new File([u],d.name,{type:'image/png'}));}if(d.flush){const inp=document.querySelector('input[type=file]');const dt=new DataTransfer();window._acc.forEach(f=>dt.items.add(f));inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}));window._acc=[];}};window.addEventListener('message',window._accL);'ok'"
col="(async()=>{const im=[...document.images].filter(i=>i.naturalWidth>=1000).pop();const bl=await (await fetch(im.src)).blob();const b64=await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result.split(',')[1]);fr.readAsDataURL(bl)});new BroadcastChannel('rel2').postMessage({name:window._me,b64});})();window._me"
a=[{"name":"navigate","input":{"tabId":gh,"url":"https://github.com/nguyentung19955/new-project/upload/claude/demo-hop-tuong/docs/demo-hop-tuong/thap-art"}},{"name":"javascript_tool","input":{"action":"javascript_exec","tabId":gh,"text":acc}}]
for t in tabs: a.append({"name":"javascript_tool","input":{"action":"javascript_exec","tabId":t,"text":col}})
a+= [{"name":"computer","input":{"action":"wait","duration":6,"tabId":gh}},
 {"name":"javascript_tool","input":{"action":"javascript_exec","tabId":gh,"text":"const a=window._acc.map(f=>f.name+':'+f.size);window._accL({data:{flush:true}});a"}}]
a+= [{"name":"computer","input":{"action":"wait","duration":10,"tabId":gh}}]*3
a+= [{"name":"javascript_tool","input":{"action":"javascript_exec","tabId":gh,"text":"const n=(document.body.innerText.match(/raw_p3_\\w+\\.png/g)||[]);const up=/Uploading [0-9]/.test(document.body.innerText);if(!up&&n.length>=%d){[...document.querySelectorAll('button')].find(x=>/Commit changes/.test(x.innerText)).click()};[n,up]"%len(tabs)}}]
print(json.dumps(a))
