# ghép dải ảnh vòng hồi chiêu (sau tools/thap-chup-vonghoi.js) — chạy ở gốc repo
import json, glob, os
from PIL import Image, ImageDraw
D = 'docs/demo-hop-tuong/tuvan/vong_hoichieu/'
rows = []
for j in sorted(glob.glob(D + '_*.json')):
    fs = json.load(open(j)); ims = [Image.open(f).convert('RGB') for f in fs]
    ims = [i.resize((i.width * 2, i.height * 2), Image.LANCZOS) if i.width < 200 else i for i in ims]
    h = max(i.height for i in ims); w = sum(i.width for i in ims) + 6 * (len(ims) - 1)
    S = Image.new('RGB', (w, h + 30), (12, 14, 20)); x = 0; d = ImageDraw.Draw(S)
    for im, l in zip(ims, ['0%', '25%', '50%', '75%', '100%', 'pulse']):
        S.paste(im, (x, 0)); d.text((x + 8, h + 8), l, fill=(230, 255, 235)); x += im.width + 6
    n = os.path.basename(j)[1:-5]; d.text((w - 160, h + 8), n, fill=(140, 160, 150)); S.save(D + 'dai_' + n + '.png'); rows.append(S)
    for f in fs: os.remove(f)
    os.remove(j)
W = max(r.width for r in rows); H = sum(r.height + 10 for r in rows)
A = Image.new('RGB', (W, H), (0, 0, 0)); y = 0
for r in rows: A.paste(r, (0, y)); y += r.height + 10
A.save(D + 'tonghop.png'); print(A.size)
