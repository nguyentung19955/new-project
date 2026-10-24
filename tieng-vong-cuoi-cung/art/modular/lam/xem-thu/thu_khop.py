import numpy as np
from PIL import Image, ImageDraw, ImageFont
from khop import *
from run2 import capelet_overlay
TORSO = L(1); CAPE = capelet_overlay(TORSO)
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 26)
def bg(size):
    im = Image.new('RGBA', size, (255, 255, 255, 255)); d = ImageDraw.Draw(im)
    for y in range(0, size[1], 24):
        for x in range(0, size[0], 24):
            if (x//24 + y//24) % 2: d.rectangle([x, y, x+23, y+23], fill=(255, 120, 220, 255))
    return im
def arm_case(bend):
    cv = Image.new('RGBA', (700, 700))
    Mt = place((300, 330), 0, (160, 250)); put(cv, TORSO, Mt)
    sh = app(Mt, (178, 104))
    Mu, Ml, end = limb(ARM, sh, 100, 100-bend)
    chain(cv, [(ARM['up'], ARM['up_f'], Mu), (ARM['lo'], ARM['lo_f'], Ml)])
    put(cv, GLOVE, place(end, (100-bend)-90, GLOVE_WRIST))
    put(cv, CAPE, Mt)
    return cv
def leg_case(bend):
    cv = Image.new('RGBA', (700, 700))
    Mt = place((300, 260), 0, (160, 250))
    hip = app(Mt, (190, 232))
    a_up = 90 - bend*0.45; a_lo = a_up + bend
    Mu, Ml, end = limb(LEG, hip, a_up, a_lo)
    chain(cv, [(LEG['up'], LEG['up_f'], Mu), (LEG['lo'], LEG['lo_f'], Ml)])
    put(cv, BOOT, place(end, (a_lo-90)*0.5, BOOT_ANKLE))
    put(cv, TORSO, Mt)
    return cv
rows = []
for name, fn in [('TAY', arm_case), ('CHÂN', leg_case)]:
    cells = []
    for b, lab in [(0, 'duỗi'), (50, 'gập vừa'), (105, 'gập mạnh')]:
        c = fn(b); bb = c.getbbox()
        c = c.crop((bb[0]-20, bb[1]-20, bb[2]+20, bb[3]+20))
        k = 2.0; c = c.resize((int(c.width*k), int(c.height*k)), Image.LANCZOS)
        out = bg(c.size); out.alpha_composite(c)
        ImageDraw.Draw(out).text((10, 8), f'{name} – {lab} ({b}°)', fill=(0, 0, 0), font=F)
        cells.append(out)
    rows.append(cells)
W = max(sum(c.width for c in r)+40 for r in rows); H = sum(max(c.height for c in r) for r in rows)+30
sheet = Image.new('RGB', (W, H), (255, 255, 255)); y = 10
for r in rows:
    x = 10
    for c in r: sheet.paste(c.convert('RGB'), (x, y)); x += c.width+10
    y += max(c.height for c in r)+10
sheet.save('thu-khop.png'); print(sheet.size)
# riêng: bộ phận đã tách (xem phần kéo dài ẩn)
parts = [ARM['up'], ARM['lo'], LEG['up'], LEG['lo'], GLOVE, BOOT]
W = sum(p.width for p in parts)*2+80; H = max(p.height for p in parts)*2+20
s = bg((W, H)); x = 10
for p in parts:
    q = p.resize((p.width*2, p.height*2), Image.LANCZOS); s.alpha_composite(q, (x, 10)); x += q.width+12
s.convert('RGB').save('bo-phan-moi.png')
