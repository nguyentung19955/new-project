import sys, os
from PIL import Image, ImageDraw, ImageFont
from khop3 import *
sys.path.insert(0, OLD); os.chdir(OLD)
from run2 import capelet_overlay
TORSO = LO(1); CAPE = defringe(capelet_overlay(Image.open('p01.png').convert('RGBA')))
os.chdir(HERE)
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 26)
def bg(size):
    im = Image.new('RGBA', size, (255, 255, 255, 255)); d = ImageDraw.Draw(im)
    for y in range(0, size[1], 24):
        for x in range(0, size[0], 24):
            if (x//24 + y//24) % 2: d.rectangle([x, y, x+23, y+23], fill=(255, 120, 220, 255))
    return im
def arm_case(b):
    cv = Image.new('RGBA', (800, 800)); Mt = place((360, 330), 0, (160, 250)); put(cv, TORSO, Mt)
    parts, _ = limb(ARM_A, app(Mt, (178, 104)), 100, 100-b, 100-b)
    for img, M in parts: put(cv, img, M)
    put(cv, CAPE, Mt); return cv
def leg_case(b):
    cv = Image.new('RGBA', (800, 800)); Mt = place((360, 260), 0, (160, 250))
    a_up = 90 - b*0.45; a_lo = a_up + b
    parts, _ = limb(LEG_A, app(Mt, (190, 232)), a_up, a_lo, 90 + (a_lo-90)*0.5)
    for img, M in parts: put(cv, img, M)
    put(cv, TORSO, Mt); return cv
rows = []
for name, fn in [('TAY', arm_case), ('CHÂN', leg_case)]:
    cells = []
    for b, lab in [(0, 'duỗi'), (50, 'gập vừa'), (105, 'gập mạnh')]:
        c = fn(b); bb = c.getbbox(); c = c.crop((bb[0]-20, bb[1]-20, bb[2]+20, bb[3]+20))
        c = c.resize((int(c.width*2), int(c.height*2)), Image.LANCZOS)
        o = bg(c.size); o.alpha_composite(c)
        ImageDraw.Draw(o).text((10, 8), f'{name} – {lab} ({b}°)', fill=(0, 0, 0), font=F); cells.append(o)
    rows.append(cells)
W = max(sum(c.width for c in r)+40 for r in rows); H = sum(max(c.height for c in r) for r in rows)+30
sh = Image.new('RGB', (W, H), (255, 255, 255)); y = 10
for r in rows:
    x = 10
    for c in r: sh.paste(c.convert('RGB'), (x, y)); x += c.width+10
    y += max(c.height for c in r)+10
sh.save('thu-khop-v3.png')
print({k: round(seg_len(ARM_A[k]), 1) for k in ('up', 'lo')}, {k: round(seg_len(LEG_A[k]), 1) for k in ('up', 'lo')})
