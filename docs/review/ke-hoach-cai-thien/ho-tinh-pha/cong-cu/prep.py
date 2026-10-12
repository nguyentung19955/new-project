"""Khử viền xanh lá (despill) ở ảnh gốc nền xanh: điểm ngả xanh mạnh -> màu nền; ngả xanh nhẹ -> hạ kênh lục bằng max(đỏ, lam)."""
import sys, numpy as np
from PIL import Image
a=np.array(Image.open(sys.argv[1]).convert('RGB')).astype(int)
r,g,b=a[...,0],a[...,1],a[...,2]; m=np.maximum(r,b); e=g-m
manh=e>50; nhe=(e>0)&~manh
nen=np.array([2,249,2])
o=a.copy(); o[manh]=nen; o[...,1]=np.where(nhe,m,o[...,1])
Image.fromarray(o.astype('uint8')).save(sys.argv[2])
print('manh',int(manh.sum()),'nhe',int(nhe.sum()))
