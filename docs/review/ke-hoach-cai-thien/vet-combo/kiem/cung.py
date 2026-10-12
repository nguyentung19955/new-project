"""Cung vệt kiếm so với đường vung thật (cung.js). Chạy: python3 cung.py <url> [tham số thêm vd &kiemsau=0]"""
import json, os, sys
from playwright.sync_api import sync_playwright
URL = sys.argv[1]; D = os.path.dirname(os.path.abspath(__file__))
TESTS = os.environ.get('TESTS') or os.path.join(D, '../../../../../game/tests')
loi = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    g = b.new_page(viewport={'width': 844, 'height': 390}); g.on('pageerror', lambda e: loi.append(str(e)))
    g.goto(URL)
    g.wait_for_function("window.G && G.scene && G.spriteCustom && G.tinhLinh && ['smith','hunter','wrestler','healer'].every(k => { const s = G.spriteCustom.get('em-be-'+k); return s && s.img; }) && G.spriteCustom.timVuKhi({type:'sword',family:0})", timeout=240000)
    g.wait_for_timeout(2500)
    for f in ('bot.js', 'setup.js', 'au_lib.js'): g.add_script_tag(path=os.path.join(TESTS, f))
    for f in ('do_vet.js', 'cung.js'): g.add_script_tag(path=os.path.join(D, f))
    kq = {}
    for k, bo in (('smith', None), ('smith', 'rung'), ('hunter', None), ('hunter', 'bien'), ('wrestler', None), ('wrestler', 'lau'), ('healer', None)):
        if bo:
            g.evaluate("([k,bo]) => { G.testSave({hero:k}); VC.mac(bo); G.spriteCustom.cuaEmBe(k, {key:k, outfit: G.outfit && G.outfit.look ? G.outfit.look(G.save) : null}); }", [k, bo]); g.wait_for_timeout(4000)
        r = g.evaluate("([k,bo]) => CV.do(k, bo)", [k, bo]); kq['%s:%s' % (k, bo or '-')] = r
        for x in r:
            print('%-14s nhát %d: mẫu %2d, bỏ (chĩa sau) %2d, bỏ (sau thân) %2d, còn %2d | cung thật %3d° -> vệt trước %3d° (%2d mẫu), G.VET_TRON %3d° (%2d mẫu)' % ('%s:%s' % (k, bo or '-'), x['nhat'], x['mau'], x['boKhop'], x['boSau'], x['con'], x['cungThat'], x['cungVet'], x['con'], x['cungMoi'], x['conMoi']), flush=True)
    b.close()
json.dump(kq, open(os.environ.get('OUT', '/dev/null'), 'w'), ensure_ascii=False)
print('pageerror:', loi or 'không có')
