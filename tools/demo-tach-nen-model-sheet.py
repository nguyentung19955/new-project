# Tách nền xám + bóng đổ khỏi model sheet (flood từ viền, dừng ở nét viền đen)
import numpy as np, sys
from PIL import Image
from scipy import ndimage
def tach(p, tol=70):
  a=np.array(Image.open(p).convert('RGB')).astype(int)
  bg=np.median(np.concatenate([a[:10].reshape(-1,3),a[-10:].reshape(-1,3)]),0)
  sat=a.max(2)-a.min(2)
  near=(np.abs(a-bg).max(2)<tol)&(sat<28)
  lb,n=ndimage.label(near)
  border=set(np.unique(np.concatenate([lb[0],lb[-1],lb[:,0],lb[:,-1]])))-{0}
  bgm=np.isin(lb,list(border))
  fg=~bgm
  fg=ndimage.binary_opening(fg,iterations=2)
  l2,k=ndimage.label(fg); sz=ndimage.sum(fg,l2,range(1,k+1))
  fg=np.isin(l2,[i+1 for i,s in enumerate(sz) if s>3000])
  rgba=np.dstack([a,(fg*255)]).astype('uint8')
  return Image.fromarray(rgba)
if __name__=='__main__':
  im=tach(sys.argv[1]); im.save(sys.argv[2])
