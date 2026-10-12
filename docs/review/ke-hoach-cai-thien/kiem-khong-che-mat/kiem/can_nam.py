"""Ảnh cận nắm tay cầm kiếm, trước (G.KIEM_SAU tắt) / sau, 4 em bé × (đứng, chạy, chém), phóng ×10 điểm ảnh game.
Chạy: python3 can_nam.py <url> <ảnh ra>"""
import base64, io, os, sys
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright
URL, OUT = sys.argv[1], sys.argv[2]
KIT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../full-audit/A-nhan-vat/kiem/tu_the.js')
Z = 10
JS = r"""([key, bat, ten]) => {
  G.KIEM_SAU = bat; const A = window.AUD, L = A.tuThe('sword'), pose = L.find(p => p[0] === ten);
  const o = A.oCua(key, A.outfit(null, {}), 'sword', 1, pose);
  const c = document.createElement('canvas'); c.width = 64 * 10; c.height = 64 * 10; const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  x.fillStyle = '#4a6b3c'; x.fillRect(0, 0, c.width, c.height); x.setTransform(10, 0, 0, 10, 0, 0); G.art.hero(x, o); G.KIEM_SAU = true;
  return c.toDataURL();
}"""
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 16)
TT = [('đứng 0.35', 'đứng'), ('chạy 2', 'chạy'), ('chém 0/0.6', 'chém')]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium'); g = b.new_page(viewport={'width': 844, 'height': 390}); loi = []
    g.on('pageerror', lambda e: loi.append(str(e)))
    g.goto(URL)
    g.wait_for_function("window.G && G.spriteCustom && ['smith','hunter','wrestler','healer'].every(k => { const s = G.spriteCustom.get('em-be-'+k); return s && s.img && s.donMa; }) && G.spriteCustom.timVuKhi({type:'sword',family:3})", timeout=180000)
    g.wait_for_timeout(1500); g.add_script_tag(path=KIT)
    cw = 30 * Z; S = Image.new('RGB', (cw * 6, (30 * Z + 24) * 4), (30, 36, 44)); dr = ImageDraw.Draw(S)
    for r, (k, ten) in enumerate([('smith', 'Cu Tí'), ('hunter', 'Cu Tèo'), ('wrestler', 'Cu Lì'), ('healer', 'Cái Bống')]):
        for c, (tt, nh) in enumerate(TT):
            for s, bat in enumerate((False, True)):
                u = g.evaluate(JS, [k, bat, tt]); im = Image.open(io.BytesIO(base64.b64decode(u.split(',')[1]))).convert('RGB')
                x0 = (c * 2 + s) * cw; y0 = r * (30 * Z + 24)
                S.paste(im.crop((20 * Z, 26 * Z, 50 * Z, 56 * Z)), (x0, y0 + 24))
                dr.text((x0 + 4, y0 + 3), '%s · %s · %s' % (ten, nh, 'TRƯỚC' if not bat else 'SAU'), fill=(255, 200, 180) if not bat else (190, 255, 190), font=F)
    S.save(OUT, optimize=True); print('pageerror:', loi or 'không có', S.size)
    b.close()
