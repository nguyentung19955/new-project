import json
cur={
2:"RIEL 60 90, RISH 69 83, RILE 60 122, RIAR 52 87, RIKN 62 114, RIHI 64 106, LEHI 70 106, LEAR 70 102, LESH 75 82, LEEL 72 94, LEKN 76 114, LELE 76 122",
3:"RIEL 68 94, RIAR 74 98, RISH 73 83, RILE 70 115, RIKN 69 107, LEAR 84 90, RIHI 63 98, LESH 80 78, LEEL 82 90, LEHI 64 97, LEKN 64 107, LELE 57 115",
4:"LEAR 65 93, RIAR 58 89, RISH 66 79, RIEL 54 83, LEEL 72 91, RILE 69 111, LESH 78 81, RIKN 72 104, RIHI 65 96, LEHI 68 97, LEKN 67 107, LELE 59 110",
5:"RIEL 89 86, RIAR 97 82, RISH 78 82, RILE 75 115, RIKN 78 108, RIHI 71 100, LEAR 99 76, LESH 80 77, LEEL 90 81, LEHI 70 99, LEKN 70 109, LELE 62 114",
6:"RILE 76 118, RIKN 76 109, RIHI 71 100, LEHI 66 101, LESH 65 75, RISH 79 79, LEEL 61 85, LEKN 64 109, LELE 59 118, LEAR 61 78, RIEL 79 76, RIAR 71 72",
7:"RIKN 81 108, RILE 77 115, RIHI 73 100, RIEL 84 90, RISH 79 78, LEHI 68 101, RIAR 84 96, LEKN 68 110, LESH 73 82, LEEL 70 94, LELE 63 119, LEAR 78 101",
8:"RISH 76 83, RIEL 73 94, RILE 70 119, RIAR 79 101, RIKN 71 109, RIHI 65 100, LEHI 62 99, LEAR 82 96, LESH 73 82, LEEL 73 92, LEKN 63 108, LELE 59 116"}
def P(s): return {t.split()[0]:(int(t.split()[1]),int(t.split()[2])) for t in s.split(', ')}
cur={k:P(v) for k,v in cur.items()}
F1=P("LESH 80 75, LEEL 81 87, LEAR 85 97, LEHI 77 101, LEKN 75 111, LELE 74 120, RIHI 68 102, RISH 66 78, RIKN 66 112, RIEL 61 91, RILE 62 120, RIAR 60 100")
# targets. RI = back arm/leg (swinging arm), LE = front.
T={
2:dict(RISH=(69,81),LESH=(75,80),RIEL=(60,88),RIAR=(52,86),LEEL=(72,92),LEAR=(70,100),RIHI=(64,104),LEHI=(70,104),RIKN=(62,112),LEKN=(76,112),RILE=(60,120),LELE=(76,120)),
3:dict(RISH=(67,80),LESH=(74,80),RIEL=(57,84),RIAR=(50,78),LEEL=(70,90),LEAR=(66,96),RIHI=(63,105),LEHI=(69,105),RIKN=(60,113),LEKN=(76,113),RILE=(58,120),LELE=(76,120)),
4:dict(RISH=(74,80),LESH=(80,79),RIEL=(80,86),RIAR=(88,86),LEEL=(84,88),LEAR=(88,94),RIHI=(68,101),LEHI=(75,101),RIKN=(64,111),LEKN=(81,110),RILE=(60,120),LELE=(84,120)),
5:dict(RISH=(78,80),LESH=(84,78),RIEL=(90,82),RIAR=(100,82),LEEL=(90,86),LEAR=(98,88),RIHI=(71,100),LEHI=(77,100),RIKN=(66,111),LEKN=(83,110),RILE=(62,120),LELE=(86,120)),
6:dict(RISH=(77,80),LESH=(83,79),RIEL=(90,88),RIAR=(97,96),LEEL=(86,90),LEAR=(92,98),RIHI=(70,101),LEHI=(76,101),RIKN=(66,111),LEKN=(82,110),RILE=(62,120),LELE=(86,120)),
7:dict(RISH=(72,80),LESH=(79,78),RIEL=(80,90),RIAR=(86,98),LEEL=(80,90),LEAR=(84,99),RIHI=(67,101),LEHI=(74,101),RIKN=(64,111),LEKN=(78,111),RILE=(62,120),LELE=(80,120)),
8:{k:F1[k] for k in F1},
}
X=lambda x:round(583.7+4.075*x); Y=lambda y:round(55.6+4.075*y)
fx={1:690,2:723,3:755,4:788,5:821,6:853,7:886,8:919}
out={}
for f in range(2,9):
    acts=[{"name":"computer","input":{"action":"left_click","coordinate":[fx[f],683],"tabId":1238135504}},{"name":"computer","input":{"action":"wait","duration":1,"tabId":1238135504}}]
    # order: move joints farthest first? just in listed order; skip if same
    for k,(tx,ty) in T[f].items():
        cx,cy=cur[f][k]
        if (cx,cy)==(tx,ty): continue
        acts.append({"name":"computer","input":{"action":"left_click_drag","start_coordinate":[X(cx),Y(cy)],"coordinate":[X(tx),Y(ty)],"tabId":1238135504}})
    out[f]=acts
json.dump(out,open('sk_acts.json','w'))
for f in out: print(f,len(out[f]))
# overlap warning: current joints within 2px of each other
for f in range(2,9):
    c=cur[f]; ks=list(c)
    for i in range(len(ks)):
        for j in range(i+1,len(ks)):
            a,b=c[ks[i]],c[ks[j]]
            if abs(a[0]-b[0])<=2 and abs(a[1]-b[1])<=2: print('overlap',f,ks[i],ks[j])
