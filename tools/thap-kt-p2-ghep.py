# ghép chuỗi khung VFX P2 thành dải: <ra>/<cảnh>_strip.jpg (10 khung đều nhau, trái → phải = báo trước → trúng → dư âm)
import sys, os, glob, json
from PIL import Image, ImageDraw
OUT = sys.argv[1] if len(sys.argv) > 1 else 'docs/demo-hop-tuong/tuvan/vfx-p2'
kq = json.load(open(OUT + '/raw/ket-qua.json'))
for ten in [k for k in kq if k != 'errs']:
    fs = sorted(glob.glob(f'{OUT}/raw/{ten}_[0-9][0-9].jpg'))
    if not fs: continue
    n = min(10, len(fs)); pick = [fs[round(i * (len(fs) - 1) / (n - 1))] for i in range(n)]
    ims = [Image.open(f).convert('RGB') for f in pick]; s = 200
    st = Image.new('RGB', (s * n, s), (0, 0, 0))
    for i, im in enumerate(ims): st.paste(im.resize((s, s), Image.LANCZOS), (i * s, 0))
    st.save(f'{OUT}/{ten}_strip.jpg', quality=82); print(ten, len(fs))
