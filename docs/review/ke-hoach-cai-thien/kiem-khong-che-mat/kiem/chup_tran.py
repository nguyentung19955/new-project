"""Chụp màn hình trận thật như trên iPhone ngang (844×390, dpr 3): 4 em bé đứng cầm kiếm, cắt quanh em bé, trước (?kiemsau=0) / sau.
Chạy: python3 chup_tran.py <url gốc không tham số kiemsau> <ảnh ra>"""
import io, os, sys
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright
URL, OUT = sys.argv[1], sys.argv[2]
GAME = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../game')
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 22)
JS = r"""(key) => { const { W, P } = AU.room({ hero: key, melee: 'sword', lvl: 10 }); AU.want(P, 'sword'); P.face = 1; AU.run(40, true); AU.live(false);
  G.drawWorld(G.getRun().r); const cv = G.wx.canvas, r = cv.getBoundingClientRect(), sc = r.width / G.W, cam = Math.round(W.cam);
  return { x: r.left + (P.x - cam - 24) * sc, y: r.top + (P.y - 44) * sc, width: 48 * sc, height: 52 * sc }; }"""
anh = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium'); loi = []
    for nhan, q in (('TRƯỚC', '&kiemsau=0'), ('SAU', '')):
        ctx = b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=3, is_mobile=True, has_touch=True); g = ctx.new_page()
        g.on('pageerror', lambda e: loi.append(str(e)))
        g.goto(URL + q)
        g.wait_for_function("window.G && G.scene && G.spriteCustom && ['smith','hunter','wrestler','healer'].every(k => { const s = G.spriteCustom.get('em-be-'+k); return s && s.img && s.donMa; }) && G.spriteCustom.timVuKhi({type:'sword',family:0})", timeout=180000)
        g.wait_for_timeout(1500)
        for f in ('bot.js', 'setup.js', 'au_lib.js'): g.add_script_tag(path=os.path.join(GAME, 'tests', f))
        hang = []
        for k in ('smith', 'hunter', 'wrestler', 'healer'):
            r = g.evaluate(JS, k); g.wait_for_timeout(100)
            hang.append(Image.open(io.BytesIO(g.screenshot(clip=r))).convert('RGB'))
        anh.append((nhan, hang)); ctx.close()
    b.close()
w, h = anh[0][1][0].size
S = Image.new('RGB', (w * 4, (h + 30) * 2), (30, 36, 44)); dr = ImageDraw.Draw(S)
for r, (nhan, hang) in enumerate(anh):
    dr.text((6, r * (h + 30) + 3), nhan + (' (?kiemsau=0, như bản web trước)' if r == 0 else ' (G.KIEM_SAU)'), fill=(255, 255, 255), font=F)
    for c, im in enumerate(hang): S.paste(im, (c * w, r * (h + 30) + 30))
S.save(OUT, optimize=True); print('pageerror:', loi or 'không có', S.size)
