"""Đo vệt từng nhát combo trên bản hai tệp (như web), iPhone ngang 844x390 dpr 3.
Chạy: python3 do.py <url linh-khi-nhe.html?cloud=0[&...]> <tệp json ra> [gif: thư mục ra GIF] [tests: thư mục game/tests]
4 em bé x (thân gốc + 1 thân bộ) x 4 vũ khí x (đứng yên, vừa chạy)."""
import base64, io, json, os, sys
from playwright.sync_api import sync_playwright

URL, OUT = sys.argv[1], sys.argv[2]
GIF = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] != '-' else None
TESTS = sys.argv[4] if len(sys.argv) > 4 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../game/tests')
CHI = os.environ.get('CHI')  # vd "smith:-:sword" để chạy một ca
DAY = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'do_vet.js')
THAN = {'smith': [None, 'rung'], 'hunter': [None, 'bien'], 'wrestler': [None, 'lau'], 'healer': [None, 'bien']}
WTS = ['sword', 'spear', 'hammer', 'bow']
kq = {}; loi = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    ctx = b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=3, is_mobile=True, has_touch=True)
    g = ctx.new_page(); g.on('pageerror', lambda e: loi.append(str(e)))
    g.goto(URL)
    g.wait_for_function("window.G && G.scene && G.spriteCustom && ['smith','hunter','wrestler','healer'].every(k => { const s = G.spriteCustom.get('em-be-'+k); return s && s.img; }) && G.spriteCustom.timVuKhi({type:'sword',family:0})", timeout=240000)
    g.wait_for_timeout(2500)
    for f in ('bot.js', 'setup.js', 'au_lib.js'):
        g.add_script_tag(path=os.path.join(TESTS, f))
    g.add_script_tag(path=DAY)
    for k, bos in THAN.items():
        for bo in bos:
            for wt in WTS:
                for dc in (False, True):
                    ten = '%s:%s:%s:%s' % (k, bo or '-', wt, 'chay' if dc else 'dung')
                    if CHI and not ten.startswith(CHI): continue
                    chup = bool(GIF) and (os.environ.get('CHUP') == 'all' or (bo is None and k == 'smith'))
                    # ảnh thân bộ tải sau: chờ
                    if bo:
                        g.evaluate("([k,bo]) => { G.testSave({hero:k}); VC.mac(bo); }", [k, bo])
                        try:
                            g.wait_for_function("([k,bo]) => { const s = G.spriteCustom.get('em-be-'+k+'-'+bo); const d = G.spriteCustom.get('em-be-'+k+'-'+bo+'-don'); return s && s.img && (!G.spriteCustom.ds['em-be-'+k+'-'+bo+'-don'] || (d && d.img)); }", arg=[k, bo], timeout=20000)
                        except Exception: pass
                    r = g.evaluate("([k,bo,wt,dc,chup]) => VC.chay(k, bo, wt, dc, chup)", [k, bo, wt, dc, chup])
                    if chup:
                        from PIL import Image
                        ims = [Image.open(io.BytesIO(base64.b64decode(u.split(',')[1]))).convert('RGB') for u in r['anh']]
                        os.makedirs(GIF, exist_ok=True)
                        json.dump([], open(os.devnull, 'w'))
                        q = [im.resize((im.width // 2, im.height // 2), Image.NEAREST).quantize(colors=96, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE) for im in ims]
                        q[0].save(os.path.join(GIF, '%s%s-%s.gif' % ('' if bo is None and k == 'smith' else k + '-' + (bo or 'goc') + '-', wt, 'chay' if dc else 'dung')), save_all=True, append_images=q[1:], duration=33, loop=0, optimize=True)
                    del r['anh']
                    kq[ten] = r
                    tom = ' '.join('%s%d:%dpx/%dk/l%s' % (n['kind'][:3], n['pose'], n['px'], n['kThay'], n.get('lech')) for n in r['nhat'])
                    print('%-28s %-26s %s' % (ten, (r['than'] or '') + '/' + (r['don'] or ''), tom), flush=True)
    b.close()
json.dump({'kq': kq, 'loi': loi}, open(OUT, 'w'), ensure_ascii=False, indent=0)
print('pageerror:', loi or 'không có')
