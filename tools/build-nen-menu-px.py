# Nền menu pixel hoá (claude/sua-giao-dien-10, theo mockup designer docs/DESIGN-REVIEW.md A4.1):
# assets/ui/nen-menu.jpg (1600×743) → thu 534×248 (trung bình vùng) → 64 màu → assets/ui/nen-menu-px.png; game phóng nearest (image-rendering: pixelated).
# Không dùng bảng màu chung 46 màu (bản canh/nen-menu 320×180 46 màu mất hoa văn trống đồng — tester), nên để ở assets/ui, không ở assets/pixel.
# Chạy: python3 tools/build-nen-menu-px.py && node tools/build-asset-list.js
import os
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
im = Image.open(os.path.join(ROOT, 'assets/ui/nen-menu.jpg')).convert('RGB').resize((534, 248), Image.BOX)
im.quantize(64, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).save(os.path.join(ROOT, 'assets/ui/nen-menu-px.png'), optimize=True)
print('assets/ui/nen-menu-px.png')
