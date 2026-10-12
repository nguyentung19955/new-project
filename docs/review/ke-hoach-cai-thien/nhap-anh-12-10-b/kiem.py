"""Kiểm phiên nhập ảnh 12/10-b trong game (game/dist/linh-khi.html?cloud=0, sau khi chạy game/build.py):
  1. Cái Bống: hàng đòn mới (atk_sword..cast) ghép vào thân, chọn đúng hàng theo vũ khí; bảng ảnh don-healer.png.
  2. Phòng Lâu đài cổ (vùng 2) dựng bằng code game: phong-lau-*.png.
Chạy từ gốc repo:  python3 docs/review/ke-hoach-cai-thien/nhap-anh-12-10-b/kiem.py [thư mục ra]"""
import sys, re, os, io, base64, subprocess, time
from playwright.sync_api import sync_playwright
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../..'))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))
os.makedirs(OUT, exist_ok=True)
src = open(R + '/game/tests/don_vk_shots.py').read()
TU_THE = re.search(r'TU_THE = r"""(.*?)"""', src, re.S).group(1)
BANG = re.search(r'BANG = r"""(.*?)"""', src, re.S).group(1)
src = open(R + '/docs/review/phong-a3/kiem/kiem.py').read()
JS_PHONG = re.search(r'JS_PHONG = r"""(.*?)"""', src, re.S).group(1)
CHO = "window.G && G.scene && G.spriteCustom && G.spriteCustom.get('em-be-healer') && G.spriteCustom.get('em-be-healer').dt.atk_sword && G.spriteCustom.do && G.spriteCustom.do['vk-sword-3'] && G.spriteCustom.do['vk-sword-3'].ready && G.spriteCustom.ghep && G.spriteCustom.ghep.healer"
def nen(d, path, k=2/3, mau=64):
    im = Image.open(io.BytesIO(base64.b64decode(d.split(',')[1]))).convert('RGB')
    im = im.resize((int(im.width * k), int(im.height * k)), Image.NEAREST).quantize(mau); im.save(path, optimize=True); return os.path.getsize(path)
srv = subprocess.Popen(['python3', '-m', 'http.server', '8773'], cwd=R, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
try:
  with sync_playwright() as p:
    b = p.chromium.launch(); errs = []
    pg = b.new_page(viewport={'width': 960, 'height': 540}); pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('http://localhost:8773/game/dist/linh-khi.html?cloud=0'); pg.wait_for_function(CHO, timeout=120000); pg.wait_for_timeout(1500)
    print('healer:', pg.evaluate("()=>Object.entries(G.spriteCustom.get('em-be-healer').dt).map(([n,a])=>n+'@'+a.hang+'x'+a.so).join(' ')"))
    pg.evaluate("() => { G.tick = function () {}; }"); pg.add_script_tag(content=TU_THE)
    print(pg.evaluate("""()=>{const out=[],k='healer',sp=G.spriteCustom.cuaEmBe(k,{});
      for(const wt of ['sword','bow','spear','hammer']){const s=G.spriteCustom.chonEmBe(sp,{key:k,t:1,atk:0.5,dodge:-1,weapon:{type:wt},p:{comboI:0,mv:{},st:{}}});out.push(wt+'->'+s.ten+':'+s.i);}
      const s=G.spriteCustom.chonEmBe(sp,{key:k,t:1,atk:-1,dodge:-1,weapon:{type:'sword'},p:{castT:0.2,st:{}}});out.push('chuong->'+s.ten+':'+s.i);return out.join(' ')}"""))
    print('don-healer.png', nen(pg.evaluate(BANG, 'healer'), OUT + '/don-healer.png'))
    r = pg.evaluate(JS_PHONG, [[2, 0, 1, ['up', 'left']], [2, 2, 0, ['down']]])
    print('phong loi:', r['err'], r['errP'])
    for i, q in enumerate(r['out']):
        print('phong-lau-%d.png' % i, 'trang tri', q['tt'], 'tien canh', q['fg'], nen(q['url'], OUT + '/phong-lau-%d.png' % i, 1, 128))
    print('pageerror', errs or 'không có'); b.close()
finally: srv.kill()
