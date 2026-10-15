"""Phiên 1: quét 30 quái thường + tinh anh bằng code game thật (Node, không trình duyệt), cờ cũ / cờ mới, cùng hạt ngẫu nhiên, 6 giây mỗi con.
In: cột hàng đánh đã hiện, số lần đổi khung lúc báo đòn / số lượt báo đòn, số lần lật đi↔đứng.   python3 quet_phien_1.py > quet-phien-1.txt"""
import sys, json, os
sys.argv = [sys.argv[0], '/tmp']
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from xem_phien_1 import *
os.chdir(HERE)
g=Game()
nguon=''.join(d for d in open('phien1_ghi.js') if not d.lstrip().startswith('//'))
g.ev('(window.__P1 = ' + nguon.strip().rstrip(';') + ', 1)')
M=json.loads(g.ev('JSON.stringify(G.MOB_ART)'))
ds=[]
for role,v in M.items():
    if role in ('mini','boss'): continue
    for r,x in enumerate(v):
        for ma in (x if isinstance(x,list) else [x]): ds.append((ma,role,r))
g.ev('(a) => __P1.nap(a)', [json.load(open(f'{ROOT}/{m}.sprite.json')) for m,_,_ in ds])
for ma,role,r in ds:
    out=[]
    for moi in (False,True):
        x=g.ev('(a) => __P1.chay(a)', dict(ma=ma, role=role, r=r, cach=50, giay=6, moi=moi))
        out.append(x)
    def atk(x): return sorted({y['b'][2] for y in x if y['b'] and y['b'][1]=='atk'})
    def tele(x):
        c=[y['b'][2] for y in x if y['b'] and y['b'][1]=='tele']; return sum(1 for i in range(1,len(c)) if c[i]!=c[i-1]), len(c)
    def lat(x):
        c=[y['b'][1] for y in x if y['b']]; return sum(1 for i in range(1,len(c)) if c[i]!=c[i-1] and {c[i],c[i-1]}=={'idle','move'})
    so=json.load(open(f'{ROOT}/{ma}.sprite.json'))['dong_tac']['atk']
    print(f"{ma:13}{role:7} atk so={so['so']} khung={so.get('khung')} CU={atk(out[0])} MOI={atk(out[1])} | tele CU={tele(out[0])} MOI={tele(out[1])} | đi↔đứng CU={lat(out[0])} MOI={lat(out[1])}")
