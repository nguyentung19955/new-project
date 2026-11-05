"""Kiểm kê ảnh rời của bản web (game/dist sau LK_ANH_ROI=1 python3 game/build.py --hai-tep):
mỗi ảnh: mã, loại, vùng, bậc, tệp, cỡ tệp, rộng × cao (đọc PNG), bộ nhớ giải mã ước tính (rộng × cao × 4).
Dùng: python3 kiem_ke.py <cổng http.server trong game/dist> <tệp json ra>
"""
import json, os, struct, sys
from playwright.sync_api import sync_playwright
DIST = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', '..', 'game', 'dist'))
port = int(sys.argv[1]); ra = sys.argv[2]
JS = r"""(() => {
  const SC = G.spriteCustom, out = [];
  for (const [ma, it] of SC.roi.ds) {
    const loai = SC.ds[ma] ? SC.ds[ma].doi : SC.gd && SC.gd[ma] ? 'giao-dien' : SC.zed && SC.zed[ma] ? 'zed' : SC.do && SC.do[ma] ? 'do' : G.fxAnh && G.fxAnh.ds[ma] ? 'hieu-ung' : '?';
    out.push({ ma, loai, png: it.png, webp: it.webp, bac: it.bac, co: it.co, vung: it.vung, trum: it.trum, khoa: it.khoa });
  }
  return out;
})()"""
def png_wh(p):
    with open(p, 'rb') as f:
        h = f.read(24)
    return struct.unpack('>II', h[16:24])
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page()
    pg.goto('http://127.0.0.1:%d/linh-khi-nhe.html?cloud=0' % port)
    pg.wait_for_function('window.G && G.scene && G.spriteCustom && G.spriteCustom.roi', timeout=60000)
    ds = pg.evaluate(JS); b.close()
for d in ds:
    w, h = png_wh(os.path.join(DIST, d['png']))
    d['w'], d['h'] = w, h; d['mib'] = w * h * 4 / 1048576
    d['kb_webp'] = os.path.getsize(os.path.join(DIST, d['webp'])) / 1024 if d['webp'] else None
    d['kb_png'] = os.path.getsize(os.path.join(DIST, d['png'])) / 1024
json.dump(ds, open(ra, 'w'), ensure_ascii=False, indent=0)
print(len(ds), 'ảnh; tổng giải mã %.1f MiB' % sum(d['mib'] for d in ds))
