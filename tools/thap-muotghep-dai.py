# TURRET MERGE — ghép ảnh chụp kéo/ghép (thap-kt-muotghep.js SHOTS=1) thành 1 dải khung + GIF
# Chạy: python3 tools/thap-muotghep-dai.py <thư-mục-ảnh> <TAG_MODE> <thư-mục-ra>
import sys, glob, os, re
from PIL import Image
src, tag, out = sys.argv[1], sys.argv[2], sys.argv[3]
def so(f): return int(re.findall(r'(\d+)\.png$', f)[0])
keo = sorted(glob.glob(os.path.join(src, tag + '_keo*.png')), key=so)
tha = sorted(glob.glob(os.path.join(src, tag + '_tha*.png')), key=so)
ds = keo + tha
ims = [Image.open(f).convert('RGB') for f in ds]
h = 520; ims = [im.resize((round(im.width * h / im.height), h), Image.LANCZOS) for im in ims]
w = sum(im.width for im in ims) + 6 * (len(ims) - 1)
dai = Image.new('RGB', (w, h), (12, 14, 18)); x = 0
for im in ims: dai.paste(im, (x, 0)); x += im.width + 6
os.makedirs(out, exist_ok=True)
dai.save(os.path.join(out, 'dai_khung_keo_ghep.jpg'), quality=86)
g = [im.resize((im.width * 2 // 3, im.height * 2 // 3), Image.LANCZOS).quantize(colors=200, method=Image.Quantize.MEDIANCUT) for im in ims]
g[0].save(os.path.join(out, 'keo_ghep.gif'), save_all=True, append_images=g[1:], duration=[250] * len(keo) + [117] * len(tha), loop=0)
print(len(keo), len(tha), dai.size)
