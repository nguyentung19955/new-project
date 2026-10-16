import sys, os, glob, numpy as np
from PIL import Image, ImageDraw
RA = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ra')
fs = sorted(glob.glob(RA + '/*.png')); fs = [f for f in fs if not os.path.basename(f).startswith('lat-') and (len(sys.argv) < 2 or any(k in f for k in sys.argv[1].split(',')))]
k = int(sys.argv[2]) if len(sys.argv) > 2 else 3
ims = []
for f in fs:
    im = Image.open(f).convert('RGBA'); im = im.resize((im.width * k, im.height * k), Image.NEAREST)
    bg = Image.new('RGBA', im.size, (90, 40, 110, 255)); bg.alpha_composite(im); ims.append((os.path.basename(f)[:-4], bg))
W = max(i.width for _, i in ims) + 10; H = sum(i.height + 16 for _, i in ims)
o = Image.new('RGB', (W, H), (30, 30, 30)); d = ImageDraw.Draw(o); y = 0
for n, i in ims: d.text((4, y), n, fill=(255, 255, 255)); o.paste(i, (4, y + 12)); y += i.height + 16
o.save(sys.argv[3] if len(sys.argv) > 3 else '/tmp/claude-0/-home-claude-new-project/fe19bbb7-6800-5b42-8726-acabface6a3d/scratchpad/w/xem.png')
