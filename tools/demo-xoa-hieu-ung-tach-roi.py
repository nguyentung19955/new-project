# Tự xoá hiệu ứng tách rời / màu lạ (chỉ xoá điểm ảnh)
import numpy as np
from PIL import Image
from scipy import ndimage
def keep_main(a):
  m=a[...,3]>0; l,k=ndimage.label(m,structure=np.ones((3,3)))
  if k>1:
    sz=ndimage.sum(m,l,range(1,k+1)); main=np.argmax(sz)+1
    a[...,3][(l!=main)&m]=0
  return a
def clean(im, flash=True):
  a=np.array(im.convert('RGBA')).astype(int)
  a=keep_main(a)
  r,g,b,al=a[...,0],a[...,1],a[...,2],a[...,3]
  warm=(al>0)&(r>180)&(b<130)&(r-b>80)           # lửa vàng/cam
  fl=(al>0)&(np.minimum(np.minimum(r,g),b)>238)&(b>=r) if flash else np.zeros_like(warm)
  eff=warm|fl
  info=int(eff.sum())
  if eff.any():
    zone=ndimage.binary_dilation(eff,iterations=2)
    mn=np.minimum(np.minimum(r,g),b); mx=np.maximum(np.maximum(r,g),b)
    kill=zone&(eff|(mx<90)|((mn>140)&(b>=r-1)))&(al>0)
    a[...,3]=np.where(kill,0,al); a=keep_main(a)
  return Image.fromarray(a.astype('uint8')), info
