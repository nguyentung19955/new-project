"""Dựng nhiều nền phòng (không có nhân vật) cho cả ba vùng, ghép thành một tấm để xem nhanh độ đa dạng: điểm nhấn, tiền cảnh, ánh sáng.
Chạy từ thư mục game:  python3 tests/dau_truong_nen.py [ảnh ra] [thư mục game]"""
import base64, io, os, sys
from playwright.sync_api import sync_playwright
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(sys.argv[2]) if len(sys.argv) > 2 else os.path.dirname(HERE)
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.dirname(HERE)), 'docs', 'vfx', 'anh-dau-truong', 'nen-cac-phong.png')
JS = """([r, s, big]) => {
  const W = { uid: 'xem' + r + ':' + s, region: r, type: big ? 'boss' : ['fight', 'start', 'chest', 'elite'][s % 4], seed: 1000 + s * 37, variant: s % 3,
    doors: [{ dir: 'up', open: s % 2 === 0 }, { dir: 'down', open: false }, { dir: 'left', open: s % 3 === 0 }], geo: G.roomArt.geo(big) };
  const room = G.roomArt.get(W), cv = document.createElement('canvas'); cv.width = 480; cv.height = 270;
  const c = cv.getContext('2d'); c.drawImage(room.base, 0, 0); c.drawImage(room.fore, 0, 0); c.drawImage(room.fg, 0, 0);
  return cv.toDataURL('image/png');
}"""
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page()
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file://' + ROOT + '/index.html'); pg.wait_for_function('window.G && G.roomArt'); pg.wait_for_timeout(300)
    cells = []
    for r in range(3):
        for s in range(5):
            u = pg.evaluate(JS, [r, s, s == 4])
            im = Image.open(io.BytesIO(base64.b64decode(u.split(',')[1]))).convert('RGB')
            cells.append(im.crop((70, 0, 410, 270)))
    b.close()
sheet = Image.new('RGB', (340 * 5, 270 * 3))
for k, im in enumerate(cells): sheet.paste(im, ((k % 5) * 340, (k // 5) * 270))
sheet.save(OUT)
print('lỗi JS:', errs or 'không có')
