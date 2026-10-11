import json,sys
d=json.load(open(sys.argv[1]+'/so-do.json'))
ref=None
print('hàng khung | tự nhiên | khop | đầu(x,ytop) | mũ dx,dy so idle:0 | lưng dx,dy so thân')
for r in d['bang']:
    h=r['dau']; m=r['mu']; l=r['lung']
    if r['hang']=='idle' and r['khung']==0:
        ref=(( (m[0]+m[2])/2-h[0], m[1]-h[1]) if m else None, ((l[0]+l[2])/2-h[0], (l[1]+l[3])/2-h[1]) if l else None)
    md = ('%+.1f,%+.1f'%((m[0]+m[2])/2-h[0]-ref[0][0], m[1]-h[1]-ref[0][1])) if m and h else 'ẩn'
    ld = ('%+.1f,%+.1f'%((l[0]+l[2])/2-h[0]-ref[1][0], (l[1]+l[3])/2-h[1]-ref[1][1])) if l and h else 'ẩn'
    tn=r['tu_nhien']
    print(r['hang'],r['khung'],'|',tn['ten'],tn['i'],'|',json.dumps(r['khop']),'|','%.1f,%.1f'%(h[0],h[1]),'|',md,'|',ld)
