# ghép dải khung kiểm đầu rồng (tools/thap-kt-rong.js) → <ra>/<cảnh>_strip.jpg
import sys, os, glob
from PIL import Image
OUT = sys.argv[1] if len(sys.argv) > 1 else 'docs/demo-hop-tuong/tuvan/rong'
CHON = {  # khung (×40 ms) cho từng cảnh: trồi → gầm → phun/quét → chìm
  'lev_solo': [1, 3, 5, 8, 14, 22, 30, 36, 38, 40, 44, 50],
  'wyrm_solo': [1, 3, 5, 8, 14, 20, 28, 33, 35, 38, 42, 48],
  'wyrm_non': [0, 1, 2, 3, 5, 8, 12, 16, 19, 21, 23, 26],
  'wyrm_non5': [0, 1, 2, 3, 5, 8, 12, 16, 19, 21, 23, 26],
  'lev_coop': [2, 5, 10, 18, 26, 34, 37, 39],
  'wyrm_pvp': [2, 5, 10, 18, 26, 33, 36, 39],
  'wyrm_gon': [2, 5, 10, 18, 26, 33, 36, 39],
}
CROP = sys.argv[2] if len(sys.argv) > 2 else None
for ten, ds in CHON.items():
    fs = [f'{OUT}/raw/{ten}_{i:02d}.png' for i in ds if os.path.exists(f'{OUT}/raw/{ten}_{i:02d}.png')]
    if not fs: continue
    ims = [Image.open(f).convert('RGB') for f in fs]
    W, H = ims[0].size; w = 300; h = round(H * w / W); cot = 6 if len(ims) > 8 else 4
    hang = (len(ims) + cot - 1) // cot
    S = Image.new('RGB', (w * cot, h * hang), (0, 0, 0))
    for i, im in enumerate(ims): S.paste(im.resize((w, h), Image.LANCZOS), ((i % cot) * w, (i // cot) * h))
    S.save(f'{OUT}/{ten}_strip.jpg', quality=82); print(ten, S.size)
