"""Xuất khuôn xám, bản tô bằng mask và JSON khớp: python3 xuat.py"""
import json
from khuon2 import *
pc = build()
t, meta = sheet(pc, 'xam'); t.save('khuon-v2-xam.png')
c, _ = sheet(pc, 'mau'); c.save('khuon-v2-to-mask.png')
meta['chop-mu']['goc_trong_mu'] = pc['chop-mu'].extra['goc_trong_mu']
json.dump(dict(vien=T_LINE, xa_toi=FAR, palette=PAL, manh=meta), open('khuon-v2.json', 'w'),
          ensure_ascii=False, indent=1, default=float)
