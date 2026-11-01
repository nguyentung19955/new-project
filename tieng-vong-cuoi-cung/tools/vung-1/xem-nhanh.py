# Xem nhanh ảnh nướng: ghép canh lên nền tối, phóng ×2; thêm ?luoi → vẽ viền đỏ quanh ô va chạm để soát mép.
import sys, json, os
from PIL import Image, ImageDraw
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../..')
for pid in sys.argv[1:]:
    luoi = '-l' in pid; pid = pid.replace('-l', '')
    im = Image.open(f'{D}/art/vung-1/{pid}-canh.png'); P = json.load(open(f'{D}/game/vung-1/phong/{pid}.json'))
    bg = Image.new('RGBA', im.size, (22, 24, 42, 255)); bg.alpha_composite(im)
    if luoi:
        d = ImageDraw.Draw(bg)
        for r, row in enumerate(P['luoi']):
            for c, ch in enumerate(row):
                if ch in '#N': d.rectangle((c*16, r*16, c*16+15, r*16+15), outline=(255, 0, 0, 255) if ch == '#' else (255,160,0,255))
    bg = bg.resize((im.width * 2, im.height * 2), Image.NEAREST)
    bg.save(f'{D}/tools/vung-1/xem/nuong-{pid}{"-luoi" if luoi else ""}.png')
