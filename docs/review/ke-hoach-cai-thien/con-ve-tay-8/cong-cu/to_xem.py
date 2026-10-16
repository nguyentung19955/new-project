"""Tờ xem nhanh các ô chụp trong gom.json (khung tím = chỗ hình code). python3 to_xem.py <thư mục ra> [id,id,...]"""
import json, sys, os, base64, io
from PIL import Image, ImageDraw, ImageFont
od = sys.argv[1]
G = json.load(open(od + '/gom.json'))
chon = set(int(x) for x in sys.argv[2].split(',')) if len(sys.argv) > 2 else None
F = ImageFont.load_default()
CW, CH, NC = 300, 230, 5
o = [g for g in G if g['png'] and (chon is None or g['id'] in chon)]
for p in range(0, len(o), 25):
    part = o[p:p + 25]
    sh = Image.new('RGB', (CW * NC, CH * ((len(part) + NC - 1) // NC)), (40, 40, 48))
    d = ImageDraw.Draw(sh)
    for i, g in enumerate(part):
        im = Image.open(io.BytesIO(base64.b64decode(g['png'].split(',', 1)[1]))).convert('RGB')
        b = g['snap']['bb']
        dd = ImageDraw.Draw(im); dd.rectangle([b[0], b[1], b[2] - 1, b[3] - 1], outline=(255, 0, 255))
        s = min((CW - 6) / im.width, (CH - 40) / im.height, 3)
        im = im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.NEAREST)
        x, y = (i % NC) * CW, (i // NC) * CH
        sh.paste(im, (x + 3, y + 38))
        d.text((x + 3, y + 2), '#%d %s f=%d' % (g['id'], g['lop'], g['f']), fill=(255, 255, 120), font=F)
        d.text((x + 3, y + 13), g['chu'][:52], fill=(220, 220, 220), font=F)
        d.text((x + 3, y + 24), (g['chu'][52:104] + ' | ' + list(g['nhan'])[0])[:60], fill=(160, 200, 255), font=F)
    sh.save(od + '/to-%02d.png' % (p // 25))
print(len(o), 'ô')
