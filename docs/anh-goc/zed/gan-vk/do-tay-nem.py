#!/usr/bin/env python3
# Đo vùng CÁNH TAY ném/đấm đang duỗi ở các hàng không có vũ khí (phitieu, phitieu_ngam, phitieu_chum, dam) — zed-8-huong 13/10/2026.
# Mỗi khung: [trục x, trục y, x0, y0, x1, y1] (ô 96 nguồn): mũi tay = cột xa nhất trong dải trên eo; dải tay = các hàng có điểm ảnh ở 8 cột
# ngoài cùng (nới 2–3 điểm ảnh); gốc xoay = 18 điểm ảnh lùi từ mũi (không vào quá eo + 6). Tay không duỗi (< 22 điểm ảnh từ eo) hoặc dải dày > 11
# (tay chéo đè lên thân) → null. In bảng JSON cho TAY trong game/js/zed_moi.js (dán tay.json vào).
import json,base64,io,sys
import numpy as np, os
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../..'))
from PIL import Image
s=open(ROOT+'/game/js/zed_eo_data.js').read()
EO=json.loads(s[s.index('ZED_EO = ')+9:].rstrip().rstrip(';'))['bo']
HANG=['phitieu','phitieu_ngam','phitieu_chum','dam']
def do(ma, bo):
    d=json.load(open(f'{ROOT}/game/art/custom/{ma}.sprite.json'))
    im=np.array(Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',')[1]))).convert('RGBA'))
    out={}
    for ten in HANG:
        a0=d['dong_tac'][ten]; r=int(a0['hang']); n=int(a0['so']); res=[]
        for i in range(n):
            a=im[r*96:(r+1)*96, i*96:(i+1)*96, 3]>40
            wy,wx=EO[bo][ten][i]
            y0,y1=wy-34,wy-3
            best=None
            for y in range(y0,y1):
                xs=np.nonzero(a[y])[0]
                if len(xs) and (best is None or xs.max()>best[0]): best=(int(xs.max()),y)
            tx,ty=best
            th=[]
            for x in range(96):
                col=np.nonzero(a[y0:y1, x])[0]
                th.append(len(col))
            # vai: từ đầu mũi lùi về, cột cuối cùng còn mỏng (<=8) liên tục
            if tx-wx<22: res.append(None); continue
            cols=a[y0:y1, tx-7:tx+1]
            ys=np.nonzero(cols.any(axis=1))[0]
            ya,yb=int(ys.min())+y0, int(ys.max())+y0
            if yb-ya>11: res.append(None); continue
            xr=max(wx+6, tx-18)
            res.append([xr, (ya+yb+1)//2, xr, ya-2, min(96, tx+3), yb+3])
        out[ten]=res
    return out
T={}
for ma,bo in [('zed-moi','moi'),('zed-rung','rung'),('zed-bien','bien'),('zed-lau','lau')]:
    try: T[bo]=do(ma,bo)
    except Exception as e: print('loi',ma,e,file=sys.stderr)
json.dump(T,open(sys.argv[1] if len(sys.argv) > 1 else 'tay.json','w'),separators=(',',':'))
for bo in T:
    for ten in T[bo]: print(bo,ten,T[bo][ten])
