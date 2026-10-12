"""Bước góc kiếm lớn nhất trong một khung hình, từ tệp json của do_mat.py (trường goc). Chạy: python3 buoc_goc.py <tệp.json>"""
import json,sys
d=json.load(open(sys.argv[1]))
for ten in d:
  mx=0;arg=None; mv=0; argv=None
  for kk,a in d[ten].items():
    for i in range(1,len(a)):
      g0,g1=a[i-1].get('goc'),a[i].get('goc')
      if g0 is None or g1 is None: continue
      j=abs(((g1-g0+180)%360)-180)
      if j>mx: mx=j;arg=(kk,i,g0,g1,a[i-1]['s'],a[i]['s'])
      # vào: khung trước là đứng/chạy, khung này không
      if a[i-1]['s'].split(':')[0] in ('idle','move') and i<14 and j>mv: mv=j;argv=(kk,i,g0,g1,a[i]['s'])
  print(f'{ten:10s} bước lớn nhất {mx:4.0f}° {arg} | quanh lúc vào (14 khung đầu) {mv:4.0f}° {argv}')
