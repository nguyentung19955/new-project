# Cắt ô từ bảng: python3 o.py <bảng.png> <ra.png> hàng:cột[,hàng:cột...] [phóng]
import sys
from PIL import Image
im = Image.open(sys.argv[1]); z = int(sys.argv[4]) if len(sys.argv) > 4 else 2
cells = [tuple(map(int, s.split(':'))) for s in sys.argv[3].split(',')]
out = Image.new('RGB', (len(cells) * 128 * z, 128 * z))
for k, (r, c) in enumerate(cells):
    out.paste(im.crop((c * 128, r * 142 + 14, c * 128 + 128, r * 142 + 142)).resize((128 * z, 128 * z), Image.NEAREST), (k * 128 * z, 0))
out.save(sys.argv[2])
