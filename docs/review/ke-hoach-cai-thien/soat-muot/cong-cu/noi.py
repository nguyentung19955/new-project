import json,numpy as np
from phan_tich import *
K=json.load(open('so_lieu.json'))
res={}
for q in K['quai']:
    ma=q['ma']; d,im=nap(ma); dt=d['dong_tac']
    F={t:cat(d,im,v['hang'],v['so']) for t,v in dt.items()}
    def m(a): 
        x=do_khung(a); return x
    def cmp(a,b):
        A,B=m(a),m(b)
        if not A or not B: return None
        return dict(co=round(max(A['dt']/B['dt'],B['dt']/A['dt']),2), chan=abs(A['y1']-B['y1'])/2, x=round(abs(A['cx']-B['cx'])/2,1), khac=round(khac(a,b),3))
    # khung cuối thực phát của atk: cột cuối trong 'khung' nếu có, cắt 0.75
    r={}
    if 'tele' in F and 'atk' in F:
        ak=dt['atk'].get('khung') or list(range(dt['atk']['so']))
        r['tele>atk']=cmp(F['tele'][-1],F['atk'][ak[0]])
        # atk kết thúc ở u=0.75
        last=ak[min(len(ak)-1,int(0.75*len(ak)))]
        r['atk(0.75)>idle']=cmp(F['atk'][last],F['idle'][0]); r['atk_cot_cuoi_phat']=last; r['atk_so']=len(ak)
    if 'hit' in F: r['hit>idle']=cmp(F['hit'][min(3,int(0.857*4))],F['idle'][0])
    if 'move' in F: r['idle>move']=cmp(F['idle'][0],F['move'][0])
    if 'hit' in F: r['hit_trang']=[ (do_khung(k) or {}).get('trang') for k in F['hit']]
    res[ma]=r
json.dump(res,open('noi.json','w'),ensure_ascii=False,indent=1)
for ma,r in res.items():
    s=' '.join(f"{k}:{v['co']}/{v['chan']}/{v['x']}/{v['khac']}" for k,v in r.items() if isinstance(v,dict))
    print(f"{ma:12} {s} hitW={r.get('hit_trang')} cuoi={r.get('atk_cot_cuoi_phat')}/{r.get('atk_so')}")
