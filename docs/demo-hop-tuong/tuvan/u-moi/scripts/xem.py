# Dựng BANG-MOI/BANG-XAM, GIF theo họ, thư mục đo nhận diện
import json, os, sys, math, shutil
import numpy as np
from PIL import Image, ImageDraw, ImageFont
sys.path.insert(0, '/tmp/um/scripts')
exec(open('/tmp/um/phanho.py').read())
CUT = '/tmp/um/cut'
NH = '/home/claude/new-project/docs/demo-hop-tuong/tuvan/nhandien'
OUT = '/home/claude/wt-demo/docs/demo-hop-tuong/tuvan/u-moi'
meta = json.load(open(NH + '/meta.json', encoding='utf-8'))
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed.ttf'
MAU_BAC = {'trang': (200, 200, 200), 'xanh': (80, 150, 255), 'tim': (190, 110, 255), 'vang': (255, 200, 60), 'do': (255, 80, 80)}
def co(i): return os.path.exists(f'{CUT}/{i}_o1.png')
def trim(im): bb = im.getbbox(); return im.crop(bb) if bb else im
def ho(i): return (D.get(i) or DONE.get(i))[0]
def thietbi(i): return (D.get(i) or DONE.get(i))[1]

def o1(i, n):
    im = trim(Image.open(f'{CUT}/{i}_o1.png').convert('RGBA'))
    s = n / max(im.size); return im.resize((max(1, round(im.width*s)), max(1, round(im.height*s))), Image.LANCZOS)

def bang(path, gray):
    cot, c, lab = 10, 140, 34
    rows = math.ceil(len(meta) / cot)
    W, H = cot * (c + 6) + 6, rows * (c + lab + 6) + 6
    img = Image.new('RGB', (W, H), (30, 32, 36)); d = ImageDraw.Draw(img); f = ImageFont.truetype(FONT, 13)
    for k, m in enumerate(meta):
        x, y = 6 + (k % cot) * (c + 6), 6 + (k // cot) * (c + lab + 6)
        cell = Image.new('RGBA', (c, c), (58, 62, 70, 255))
        if co(m['id']):
            u = o1(m['id'], c - 10); cell.alpha_composite(u, ((c - u.width)//2, (c - u.height)//2))
        else:
            d2 = ImageDraw.Draw(cell); d2.text((10, 60), 'chưa có', font=f, fill=(255, 120, 120))
        cell = cell.convert('RGB')
        if gray: cell = cell.convert('L').convert('RGB')
        img.paste(cell, (x, y))
        d.rectangle([x, y + c, x + c, y + c + 3], fill=MAU_BAC[m['bac']])
        d.text((x + 2, y + c + 4), m['ten'][:21], font=f, fill=(235, 235, 235))
        d.text((x + 2, y + c + 18), f"{m['id']} · {ho(m['id'])}{' · TB' if thietbi(m['id']) else ''}"[:24], font=f, fill=(150, 155, 165))
    img.save(path, optimize=True)

def gif_ho(fam, path):
    ids = [m['id'] for m in meta if ho(m['id']) == fam and co(m['id'])]
    if not ids: return 0
    cot = min(6, len(ids)); rows = math.ceil(len(ids) / cot); c = 200; lab = 18
    f = ImageFont.truetype(FONT, 12)
    units = []
    for i in ids:
        a = trim(Image.open(f'{CUT}/{i}_o1.png').convert('RGBA'))
        s = 176 / max(a.size)
        def ld(k):
            p = f'{CUT}/{i}_o{k}.png'
            im = Image.open(p).convert('RGBA'); t = trim(im)
            if t.getbbox() is None or t.width < 4: return None
            return t.resize((max(1, round(t.width*s)), max(1, round(t.height*s))), Image.LANCZOS)
        units.append((i, ld(2), ld(3), thietbi(i) or (D.get(i, ('',0,'','','',''))[0] in ('FLD',) )))
    N = 24; frames = []
    by = {m['id']: m for m in meta}
    for t in range(N):
        fr = Image.new('RGBA', (cot * c, rows * (c + lab)), (38, 40, 46, 255)); d = ImageDraw.Draw(fr)
        for k, (i, base, head, dev) in enumerate(units):
            x0, y0 = (k % cot) * c, (k // cot) * (c + lab)
            cx, cy = x0 + c // 2, y0 + c // 2
            if base is not None: fr.alpha_composite(base, (cx - base.width//2, cy - base.height//2))
            if head is not None:
                if dev:
                    ang = -360.0 * t / N * 0.25  # quay chậm 90° mỗi vòng GIF
                    off = 0
                else:
                    ang = 35 * math.sin(2 * math.pi * t / N)
                    off = 7 if t % 6 == 0 else (3 if t % 6 == 1 else 0)  # giật lùi khi bắn
                h = head.rotate(ang, resample=Image.BICUBIC, expand=True)
                r = math.radians(ang)
                dx, dy = off * math.sin(r), off * math.cos(r)  # lùi ngược hướng nòng (nòng chĩa lên)
                fr.alpha_composite(h, (int(cx - h.width/2 + dx), int(cy - h.height/2 + dy)))
            d.text((x0 + 4, y0 + c + 2), f"{by[i]['ten']} ({i})"[:30], font=f, fill=(230, 230, 230))
        frames.append(fr.convert('RGB'))
    # một bảng màu MEDIANCUT chung, không dither
    W, H = frames[0].size
    mont = Image.new('RGB', (W, H * 4))
    for k in range(4): mont.paste(frames[k * N // 4], (0, H * k))
    pal = mont.quantize(colors=255, method=Image.Quantize.MEDIANCUT)
    q = [fr.quantize(palette=pal, dither=Image.Dither.NONE) for fr in frames]
    q[0].save(path, save_all=True, append_images=q[1:], duration=90, loop=0, optimize=False, disposal=1)
    return len(ids)

def do_meas(tmp):
    os.makedirs(tmp + '/o', exist_ok=True)
    shutil.copy(NH + '/meta.json', tmp + '/meta.json')
    for m in meta:
        i = m['id']; old = Image.open(f'{NH}/o/{i}.png').convert('RGBA')
        if not co(i): old.save(f'{tmp}/o/{i}.png'); continue
        bb = old.getbbox(); dm = max(bb[2] - bb[0], bb[3] - bb[1])
        u = o1(i, dm); cv = Image.new('RGBA', old.size, (0, 0, 0, 0))
        cv.alpha_composite(u, ((old.width - u.width)//2, (old.height - u.height)//2)); cv.save(f'{tmp}/o/{i}.png')

if __name__ == '__main__':
    os.makedirs(OUT + '/gif', exist_ok=True)
    bang(OUT + '/BANG-MOI.png', False); bang(OUT + '/BANG-XAM.png', True)
    for fam, ten in [('BAL','BALLISTIC'),('ENE','ENERGY'),('MEC','MECHANICAL'),('FLD','FIELD-CONTROL'),('DEP','DEPLOYER-FACTORY'),('ORG','ORGANIC-ARCANE')]:
        print(ten, gif_ho(fam, f'{OUT}/gif/HO-{ten}.gif'))
    if len(sys.argv) > 1: do_meas(sys.argv[1])
