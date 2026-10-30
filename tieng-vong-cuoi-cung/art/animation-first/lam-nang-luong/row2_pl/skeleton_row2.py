import json
exec(open('sk.py').read().split("X=lambda")[0])   # loads cur (orig), F1, T (v2 targets)
cur={f:dict(T[f]) for f in T}   # v2 is now current
cur[7]['LEEL']=(81,90)
K=['RISH','LESH','RIEL','RIAR','LEEL','LEAR','RIHI','LEHI','RIKN','LEKN','RILE','LELE']
def pose(*v): return dict(zip(K,v))
N={
2:pose((68,80),(76,79),(60,74),(56,64),(66,76),(58,66),(66,102),(73,102),(60,112),(80,111),(56,120),(84,120)),
3:pose((70,82),(77,81),(78,94),(90,98),(82,92),(94,96),(66,105),(73,105),(60,113),(82,113),(56,120),(86,120)),
4:pose((72,81),(80,80),(88,92),(100,94),(90,90),(102,92),(68,104),(75,104),(60,113),(82,113),(56,120),(86,120)),
5:pose((69,80),(76,79),(60,70),(56,60),(66,72),(58,62),(67,102),(74,102),(61,112),(81,111),(56,120),(84,120)),
6:pose((73,79),(80,78),(88,74),(100,68),(90,76),(102,70),(70,101),(77,101),(64,111),(83,110),(60,120),(86,120)),
7:pose((75,80),(82,79),(92,78),(104,76),(92,80),(104,80),(71,101),(78,101),(64,111),(83,110),(60,120),(86,120)),
8:pose((76,82),(83,81),(88,92),(98,100),(90,90),(100,96),(72,106),(79,106),(62,114),(88,112),(54,120),(96,120)),
}
X=lambda x:round(583.7+4.075*x); Y=lambda y:round(55.6+4.075*y)
fx={2:723,3:755,4:788,5:821,6:853,7:886,8:919}
ex=[{'name':'computer','input':{'action':'left_click','coordinate':[255,747],'tabId':1238135504}},{'name':'computer','input':{'action':'wait','duration':1,'tabId':1238135504}},{'name':'computer','input':{'action':'left_click','coordinate':[865,452],'tabId':1238135504}},{'name':'computer','input':{'action':'wait','duration':2,'tabId':1238135504}},{'name':'javascript_tool','input':{'action':'javascript_exec','tabId':1238135504,'text':"const w=document.querySelector('iframe').contentWindow; const u=w.__caps[w.__caps.length-1]; const b=await (await w.fetch(u)).blob(); const j=JSON.parse(await b.text()); const ab=s=>s.split(' ').map(w=>w.slice(0,2)).join(''); const skip=['RIEA','LEEA','RIEY','LEEY','NO']; j.pose_keypoints[0].filter(p=>!skip.includes(ab(p.label))).map(p=>ab(p.label)+' '+Math.round(p.x*128)+' '+Math.round(p.y*128)).join(', ')"}}]
for f in range(2,9):
    acts=[{"name":"computer","input":{"action":"left_click","coordinate":[fx[f],683],"tabId":1238135504}},{"name":"computer","input":{"action":"wait","duration":1,"tabId":1238135504}}]
    pos=dict(cur[f]); 
    # order: move joints whose target is far first; avoid dropping onto an unmoved joint's position
    todo=[k for k in K if pos[k]!=N[f][k]]
    order=[]
    while todo:
        ok=[k for k in todo if not any(abs(N[f][k][0]-pos[o][0])<=2 and abs(N[f][k][1]-pos[o][1])<=2 for o in todo if o!=k)]
        k=(ok or todo)[0]; order.append(k); pos[k]=N[f][k]; todo.remove(k)
    pos=dict(cur[f])
    for k in order:
        acts.append({"name":"computer","input":{"action":"left_click_drag","start_coordinate":[X(pos[k][0]),Y(pos[k][1])],"coordinate":[X(N[f][k][0]),Y(N[f][k][1])],"tabId":1238135504}}); pos[k]=N[f][k]
    json.dump(acts+ex,open(f'r2_{f}.json','w'))
json.dump({str(k):{kk:list(v) for kk,v in N[k].items()} for k in N},open('row2_targets.json','w'))
print('ok')
