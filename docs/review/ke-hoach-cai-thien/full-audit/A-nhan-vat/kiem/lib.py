# Mở bản hai tệp (như web) trên srv2.py, chờ ảnh em bé + đồ sẵn sàng. Dùng chung cho các script kiểm của phiên A.
import os, sys, json, base64, io
from playwright.sync_api import sync_playwright
URL = os.environ.get('LK_URL', 'http://localhost:8790/linh-khi-nhe.html?cloud=0')
def mo(p, w=960, h=540, them=''):
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': w, 'height': h})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL + them)
    pg.wait_for_function("window.G && G.scene && G.spriteCustom && G.spriteCustom.ds && G.spriteCustom.ds['em-be-smith'] && G.spriteCustom.ds['em-be-smith'].ready", timeout=90000)
    # nạp hết ảnh tải sau (thân bộ, đòn, đồ, quái)
    pg.evaluate("""() => { const SC = G.spriteCustom; try { SC.napSau && SC.napSau(); } catch (e) {} for (const m in SC.ds) try { SC.canAnh(m); } catch (e) {} for (const m in (SC.do || {})) try { SC.canAnh(m); } catch (e) {} }""")
    try:
        pg.wait_for_function("""() => { const SC = G.spriteCustom; const a = Object.values(SC.ds).concat(Object.values(SC.do || {})); return a.every(s => s.ready); }""", timeout=90000)
    except Exception as e:
        print('chưa nạp đủ ảnh:', pg.evaluate("""() => { const SC = G.spriteCustom; return Object.entries(SC.ds).concat(Object.entries(SC.do||{})).filter(e => !e[1].ready).map(e => e[0]).slice(0, 30); }"""))
    pg.wait_for_timeout(800)
    return b, pg, errs
def luu_png(dataurl, path, max_mb=1.0):
    from PIL import Image
    im = Image.open(io.BytesIO(base64.b64decode(dataurl.split(',')[1]))).convert('RGB')
    im.save(path, optimize=True)
    if os.path.getsize(path) > max_mb * 1e6: im.quantize(colors=128).save(path, optimize=True)
    return im
