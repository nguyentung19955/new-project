import sys, json, base64, io
from PIL import Image, ImageDraw
# gif.py out.gif skipmap  (compares old vs new move rows for 3 keys)
out = sys.argv[1]; keys = ['smith', 'hunter', 'wrestler']
def L(f):
    d = json.load(open(f)); return d, Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',')[1]))).convert('RGBA')
olds = [L(f'/home/claude/new-project/game/art/custom/em-be-{k}.sprite.json') for k in keys]
news = [L(f's/em-be-{k}.sprite.json') for k in keys]
K = 2; T = 0.65; step = 0.04; frames = []
n = int(round(T * 2 / step))
for t in range(n):
    tt = t * step
    c = Image.new('RGBA', (96 * 3 * K, 96 * 2 * K + 16), (118, 140, 128, 255))
    for j, ((do, io_), (dn, inn)) in enumerate(zip(olds, news)):
        for r, (d, im) in enumerate(((do, io_), (dn, inn))):
            a = d['dong_tac']['move']; f = int(tt / a['giay'] * a['so']) % a['so']
            fr = im.crop((f * 96, 96, f * 96 + 96, 192)).resize((96 * K, 96 * K), Image.NEAREST)
            c.alpha_composite(fr, (j * 96 * K, r * 96 * K + 16 * r))
    dr = ImageDraw.Draw(c); dr.text((4, 2), 'TRUOC (cu)', fill=(255, 255, 255, 255)); dr.text((4, 96 * K + 2), 'SAU (moi)', fill=(255, 255, 255, 255))
    frames.append(c.convert('P', palette=Image.ADAPTIVE, colors=255))
frames[0].save(out, save_all=True, append_images=frames[1:], duration=int(step * 1000), loop=0, optimize=True)
# static strip of new rows
s = Image.new('RGBA', (768 * 2, 96 * 3 * 2), (118, 140, 128, 255))
for j, (d, im) in enumerate(news): s.alpha_composite(im.crop((0, 96, 768, 192)).resize((768 * 2, 192), Image.NEAREST), (0, j * 192))
s.save('s/strip.png')
