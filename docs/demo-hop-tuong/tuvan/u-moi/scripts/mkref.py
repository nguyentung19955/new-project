import json, os
from PIL import Image
A = '/home/claude/wt-demo/thap/assets/'
OUT = '/home/claude/new-project/docs/demo-hop-tuong/tuvan/u-moi/ref/'
os.makedirs(OUT, exist_ok=True)
order = json.load(open('/tmp/um/prompts.json'))['order']
def fit(im, n):
    im = im.convert('RGBA'); bb = im.getbbox(); im = im.crop(bb)
    s = n / max(im.size); return im.resize((max(1, int(im.width*s)), max(1, int(im.height*s))), Image.LANCZOS)
for i in order:
    c = Image.new('RGBA', (640, 320), (255, 0, 255, 255))
    h = fit(Image.open(A + i + '_nong.png'), 250)
    dp = A + i + '_de.png'
    b = fit(Image.open(dp if os.path.exists(dp) else A + 'de_chung.png'), 290)
    c.alpha_composite(h, ((320 - h.width)//2, (320 - h.height)//2))
    c.alpha_composite(b, (320 + (320 - b.width)//2, (320 - b.height)//2))
    c.convert('RGB').save(OUT + f'ref_{i}.png', optimize=True)
print(len(os.listdir(OUT)))
