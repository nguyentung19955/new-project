"""Hình kiếm trong Ô ĐỒ (js/vk_moi.js VM.icon — túi đồ, Lò rèn, Luyện, ô trong trận): mặc định | ?kiemvuonghe=0&kiemvuonggan=0, ×2.
Hàng: Trắng, gân Trắng (Luyện 2), Lửa / Độc / Băng × Mầm, Thành hình, Thức tỉnh, gân Mầm (Luyện 4), gân Thành hình (Luyện 7). Bot headless.
Chạy (từ gốc repo, sau build):  python3 docs/review/ke-hoach-cai-thien/gan-anh-17-10-toi/cong-cu/o_do.py"""
import base64, io, os
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright
GOC = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', '..'))
FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13)
CA = [('Trắng', None, 0, 0), ('gân Trắng L2', None, 0, 2)] + [('%s %s' % (h, c), e, i, 0) for e, h in (('fire', 'Lửa'), ('poison', 'Độc'), ('ice', 'Băng')) for i, c in ((1, 'Mầm'), (2, 'T.hình'), (3, 'T.tỉnh'))] + [('gân Mầm L4', 'ice', 0, 4), ('gân T.hình L7', 'ice', 0, 7)]
JS = r'''
(ca) => {
  G.testSave({ lvl: 12 });
  const cv = document.createElement('canvas'), K = 2, S = 56; cv.width = ca.length * S * K; cv.height = S * K;
  const c = cv.getContext('2d'); c.scale(K, K); c.imageSmoothingEnabled = false;
  ca.forEach(([ten, el, cap, lv], i) => {
    const w = { id: 900 + i, type: 'sword', tier: 1, sharpen: 0, marks: { fire: 0, poison: 0, ice: 0 }, branch: null, perks: [] };
    if (lv) { w.luyen = lv; const ht = G.luyen.hinhThai(lv); if (G.vkMoi.datCap) G.vkMoi.datCap(w, ht, ht > 0 ? el : null); }
    else if (cap > 0) { w.marks[el] = G.MARKS[cap - 1]; w.branch = el; }
    c.fillStyle = '#2a2f3a'; c.fillRect(i * S + 2, 2, S - 4, S - 4);
    G.vkMoi.icon(c, w, i * S + S / 2, S / 2, 46);
  });
  return cv.toDataURL('image/png');
}
'''


def chay(co):
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--allow-file-access-from-files'])
        pg = b.new_page(viewport={'width': 960, 'height': 540})
        pg.route('http*://**', lambda r: r.abort())
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + GOC + '/game/dist/linh-khi.html?cloud=0' + co)
        pg.wait_for_timeout(800)
        pg.add_script_tag(path=os.path.join(GOC, 'game', 'tests', 'setup.js'))
        pg.wait_for_function("() => { const z = G.spriteCustom && G.spriteCustom.zed; if (!z) return false; for (const k of ['zed-vk','zed-vk-he','zed-vk-gan']) { const q = z[k]; if (q && !q.ready && G.spriteCustom.canAnh) G.spriteCustom.canAnh(k); if (!q || !q.ready) return false; } return true; }", timeout=90000)
        u = pg.evaluate(JS, CA); u = pg.evaluate(JS, CA)
        b.close()
    print(co or 'mặc định', 'lỗi JS:', errs or 'không có')
    return Image.open(io.BytesIO(base64.b64decode(u.split(',')[1]))).convert('RGB')


A = chay(''); B = chay('&kiemvuonghe=0&kiemvuonggan=0')
o = Image.new('RGB', (A.width, A.height * 2 + 60), (18, 18, 22)); d = ImageDraw.Draw(o)
for i, (t, *_r) in enumerate(CA): d.text((i * 112 + 4, 2), t, fill=(255, 230, 120), font=FONT)
o.paste(A, (0, 20)); d.text((4, 20 + A.height + 2), 'trên: mặc định (ảnh mới)   dưới: ?kiemvuonghe=0&kiemvuonggan=0 (nhuộm 30 % như trước)', fill=(200, 200, 200), font=FONT)
o.paste(B, (0, 40 + A.height))
o.save(os.path.join(GOC, 'docs/review/ke-hoach-cai-thien/gan-anh-17-10-toi/so-o-do.png'), optimize=True)
