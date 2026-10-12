"""Gộp tệp in của do_mat.py theo trạng thái × (thân gốc | thân bộ): số khung đè mặt / tổng, lớn nhất. Chạy: python3 tong.py <tệp.txt>"""
import re,collections,sys
L=open(sys.argv[1]).read().splitlines()
agg=collections.defaultdict(lambda:[0,0,0,0.0])
for l in L:
    m=re.match(r'(\S+)\s+(\w+)\|(\w+)\|(-?1)\s+đè mặt\s+(\d+)/\s*(\d+).*?(\d+) điểm ảnh \(\s*([\d.]+)%',l)
    if not m: print(l); continue
    ten,k,bo,f,n,t,mx,pc=m.groups(); g='goc' if bo=='goc' else 'bo'
    a=agg[(ten,g)]; a[0]+=int(n); a[1]+=int(t); a[2]=max(a[2],int(mx)); a[3]=max(a[3],float(pc))
for k,v in agg.items(): print(k, f'{v[0]}/{v[1]} khung, max {v[2]}px {v[3]}%')
