"""Ảnh trước / sau cho báo cáo: trước = mở game với ?mulun=0&vknemat=0&dauthat=0 (tắt 3 cờ của phiên này), sau = mặc định.
Chạy: python3 anh_truoc_sau.py <thư mục ra>   (cần srv2.py phục vụ bản hai tệp ở cổng 8790)"""
import sys, os, json, subprocess
from PIL import Image, ImageDraw
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
H = os.path.dirname(os.path.abspath(__file__)); TMP = '/tmp/claude-0'
def ve(ra, ds, z, tat):
    env = dict(os.environ)
    if tat: env['LK_URL'] = 'http://localhost:8790/linh-khi-nhe.html?cloud=0&mulun=0&vknemat=0&dauthat=0'
    subprocess.run(['python3', os.path.join(H, 've_o.py'), ra, json.dumps(ds), str(z)], check=True, env=env, capture_output=True)
def cap(ten, ds, z=3):
    a, b = TMP + '/ts_a.png', TMP + '/ts_b.png'
    ve(a, ds, z, True); ve(b, ds, z, False)
    A, B = Image.open(a), Image.open(b)
    C = Image.new('RGB', (A.width + 70, A.height * 2), (30, 36, 44)); d = ImageDraw.Draw(C)
    C.paste(A, (70, 0)); C.paste(B, (70, A.height)); d.text((4, A.height // 2), 'TRUOC', fill=(255, 190, 90)); d.text((4, A.height * 3 // 2), 'SAU', fill=(120, 255, 120))
    p = os.path.join(OUT, ten); C.quantize(colors=128).save(p, optimize=True); print(p, os.path.getsize(p))
K = ['smith', 'hunter', 'healer', 'wrestler']
cap('mu-dung-truoc-sau.png', [[k, None, None, 1, {'hat': h}, 0] for k in ['smith', 'healer'] for h in ['non_la', 'khan_xep', 'mu_sung', 'mu_tai_cao', 'mu_vay_ca']], 3)
cap('mu-chuong-truoc-sau.png', [['wrestler', None, None, 1, {'hat': h}, i] for h in ['khan_xep', 'non_la'] for i in (21, 23, 24)] + [['healer', None, None, 1, {'hat': 'non_la'}, 21], ['hunter', None, None, 1, {'hat': 'non_la'}, 21]], 3)
cap('vu-khi-truoc-sau.png', [['smith', None, 'spear', 1, {}, 0], ['hunter', None, 'spear', 1, {}, 4], ['wrestler', None, 'sword', 1, {}, 0], ['smith', None, 'sword', 1, {}, 0], ['smith', None, 'hammer', 1, {}, 5], ['hunter', None, 'hammer', 1, {}, 4], ['healer', None, 'spear', -1, {}, 6], ['smith', None, 'hammer', 1, {}, 19]], 3)
