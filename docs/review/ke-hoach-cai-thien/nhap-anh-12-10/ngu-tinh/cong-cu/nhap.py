"""Ngư Tinh pha 2/3: ảnh gốc nền hồng tím -> tệp sprite (ô 180x116, gốc [90,112], net 2, 4 hàng 6·4·6·4).
python3 nhap.py <ra_thu_muc> [so_mau=24]"""
import numpy as np, json, sys, io, base64, os
from PIL import Image
from scipy import ndimage
SRC='/home/claude/new-project/docs/anh-goc/2026-10-12/'
RA=sys.argv[1]; os.makedirs(RA,exist_ok=True); SOMAU=int(sys.argv[2]) if len(sys.argv)>2 else 24
LUOI={'nguTinh-pha2':([0,265,531,794,1058,1319,1581,1846,1941],[0,199,400,597,808]),
      'nguTinh-pha3':([0,286,572,856,1140,1422,1703,1986,2171],[0,190,366,540,723])}
SO=[6,4,6,4]; FW,FH,GX,GY,N=180,116,90,112,2
RONG_P1=116  # bề ngang trung bình khung đứng pha 1 (điểm game)
TAM_P1=90    # tâm ngang trung bình khung đứng pha 1
def tach_o(c):
    r,g,b=c[...,0],c[...,1],c[...,2]
    tia=np.minimum(r,b)-g                     # độ "hồng tím"
    nen=(tia>100)&(np.abs(r-b)<80)
    m=~nen
    # quầng: điểm ám hồng tím mạnh sát nền -> bỏ (2 lượt)
    for _ in range(2):
        sat=ndimage.binary_dilation(nen)&m
        bo=sat&(tia>35)
        m&=~bo; nen|=bo
    # vụn + thành phần chạm mép ô: chỉ bỏ nếu nhỏ (vạch lưới sót); thân chạm mép giữ lại
    lab,n=ndimage.label(m); sz=ndimage.sum(m,lab,range(1,n+1))
    bien=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
    keep=np.zeros(n+1,bool)
    for i in range(1,n+1):
        s=sz[i-1]
        if s<6: continue
        if i in bien and s<400: continue
        keep[i]=True
    m=keep[lab]
    # lấp lỗ kín nhỏ (khe nền lọt trong thân)
    ho=ndimage.binary_fill_holes(m)&~m; l2,n2=ndimage.label(ho); s2=ndimage.sum(ho,l2,range(1,n2+1))
    for i in range(1,n2+1):
        if s2[i-1]<=40: m|=(l2==i)
    # khử ám hồng tím còn lại
    o=c.copy().astype(float); sp=np.clip(np.minimum(r,b)-g,0,None)*ndimage.binary_dilation(nen,iterations=3)  # chỉ khử ở mép (3 điểm sát nền), giữ màu bụng
    o[...,0]-=sp; o[...,2]-=sp
    # điểm lấp lỗ đang mang màu nền -> lấy màu lân cận
    lo=m&nen
    if lo.any():
        idx=ndimage.distance_transform_edt(lo,return_distances=False,return_indices=True)
        o[lo]=o[idx[0][lo],idx[1][lo]]
    # thân chính (để căn đáy): thành phần lớn nhất
    l3,n3=ndimage.label(m); s3=ndimage.sum(m,l3,range(1,n3+1)); than=l3==(1+int(np.argmax(s3)))
    return np.clip(o,0,255),m,than
def lam(ten):
    a=np.array(Image.open(SRC+ten+'.png').convert('RGB')).astype(int); xs,ys=LUOI[ten]
    o_=[]
    for R in range(4):
        for C in range(SO[R]):
            M=4; c=a[ys[R]+M:ys[R+1]-M, xs[C]+M:xs[C+1]-M]
            rgb,m,than=tach_o(c); o_.append((R,C,rgb,m,than))
    # tỉ lệ: bề ngang thân khung đứng = pha 1
    w=[np.nonzero(t.any(0))[0] for R,C,rgb,m,t in o_ if R==0]  # theo thân chính, không tính bông tuyết/giọt nước
    rong=np.mean([x[-1]-x[0]+1 for x in w]); s=RONG_P1/rong
    tam=np.mean([(x[-1]+x[0])/2 for x in w])     # tâm ngang khung đứng trong ô gốc
    sheet=np.zeros((4*FH,8*FW,4),np.uint8); bc={'ti_le':round(s,4),'cat_tren':[],'cat_ngang':[]}
    for R,C,rgb,m,than in o_:
        H,W=m.shape; tw,th=max(1,round(W*s)),max(1,round(H*s))
        pre=np.dstack([rgb*m[...,None],m*255.0]).astype(np.float32)
        ch=[np.array(Image.fromarray(pre[...,k]).resize((tw,th),Image.BOX)) for k in range(4)]
        al=ch[3]; ok=al>=128
        col=np.zeros((th,tw,3)); 
        for k in range(3): col[...,k]=np.where(al>0,ch[k]/np.maximum(al,1e-3)*255,0)
        tt=np.array(Image.fromarray((than*255).astype(np.uint8)).resize((tw,th),Image.BOX))>=128
        day=np.nonzero(tt.any(1))[0][-1]           # đáy thân ở ảnh thu
        dy=GY-day; dx=int(round(GX-tam*s))
        ys_,xs_=np.nonzero(ok)
        for y,x in zip(ys_,xs_):
            Y,X=y+dy,x+dx
            if 0<=Y<FH and 0<=X<FW: sheet[R*FH+Y,C*FW+X,:3]=np.clip(col[y,x],0,255); sheet[R*FH+Y,C*FW+X,3]=255
        cy=-min(0,(ys_+dy).min()); cx=max(0,-(xs_+dx).min(),(xs_+dx).max()-FW+1)
        if cy: bc['cat_tren'].append('%d.%d:%d'%(R+1,C+1,cy))
        if cx: bc['cat_ngang'].append('%d.%d:%d'%(R+1,C+1,cx))
    return sheet,bc
def luong_tu(sheets,k):
    """chung một bảng k màu cho cả hai pha? không: mỗi pha một bảng riêng"""
    out=[]
    for sh in sheets:
        op=sh[...,3]>0; px=sh[op][:,:3]
        im=Image.fromarray(px.reshape(1,-1,3)).quantize(colors=k,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE)
        pal=np.array(im.getpalette()[:3*k]).reshape(-1,3); q=pal[np.array(im).ravel()]
        s2=sh.copy(); s2[op,:3]=q; out.append(s2)
    return out
TEN={'nguTinh-pha2':('nguTinh-p2','Ngư Tinh · pha 2 (nổi giận)'),'nguTinh-pha3':('nguTinh-p3','Ngư Tinh · pha 3 (hoá băng)')}
for goc,(ma,ten) in TEN.items():
    sh,bc=lam(goc); sh=luong_tu([sh],SOMAU)[0]
    # vá điểm cô lập 1 điểm (không cần)
    big=np.repeat(np.repeat(sh,N,0),N,1)
    mau=sorted(set(map(tuple,big.reshape(-1,4).tolist()))); chi={c:i for i,c in enumerate(mau)}
    idx=np.array([chi[tuple(p)] for p in big.reshape(-1,4).tolist()],np.uint8).reshape(big.shape[:2])
    pim=Image.fromarray(idx,'P'); pim.putpalette([v for c in mau for v in c[:3]])
    buf=io.BytesIO(); pim.save(buf,'PNG',optimize=True,transparency=bytes(c[3] for c in mau))
    assert (np.array(Image.open(io.BytesIO(buf.getvalue())).convert('RGBA'))==big).all()
    t={'loai':'linh-khi-sprite','doi_tuong':'quai','ma':ma,'ten':ten,'vung':'bien','tam':'data:image/png;base64,'+base64.b64encode(buf.getvalue()).decode(),
       'net':N,'khung_rong':FW,'khung_cao':FH,'goc':[GX,GY],'rong':152,'cao':105,
       'dong_tac':{'idle':{'hang':0,'so':6,'giay':1.4,'lap':True},'tele':{'hang':1,'so':4,'giay':0.7},'atk':{'hang':2,'so':6,'giay':0.6},'hit':{'hang':3,'so':4,'giay':0.3}}}
    p=os.path.join(RA,ma+'.sprite.json'); json.dump(t,open(p,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
    Image.fromarray(sh).save(os.path.join(RA,ma+'.png'))
    bc['mau']=len(mau)-1; bc['byte']=os.path.getsize(p); print(ma,json.dumps(bc,ensure_ascii=False))
