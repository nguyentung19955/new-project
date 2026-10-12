"""Trận thật, vòng lặp thật (bản hai tệp, iPhone ngang 844x390 dpr 3): đếm vệt từng nhát combo.
Chạy: python3 tran.py <url linh-khi-nhe.html?cloud=0[&...]> <json ra> [giây mỗi ca] [px: 1 = đo điểm ảnh]"""
import json, os, sys
from playwright.sync_api import sync_playwright

URL, OUT = sys.argv[1], sys.argv[2]
GIAY = float(sys.argv[3]) if len(sys.argv) > 3 else 8
PX = len(sys.argv) > 4 and sys.argv[4] == '1'
CHI = os.environ.get('CHI')
D = os.path.dirname(os.path.abspath(__file__))
TESTS = os.environ.get('TESTS') or os.path.join(D, '../../../../../game/tests')
CA = []
for k, bo in (('smith', None), ('smith', 'rung'), ('hunter', None), ('hunter', 'bien'), ('wrestler', None), ('wrestler', 'lau'), ('healer', None)):
    for wt in ('sword', 'spear', 'hammer', 'bow'):
        CA.append((k, bo, wt, 5, False))
for wt in ('sword', 'spear'):
    CA.append(('smith', None, wt, 0, True))   # giữ nút
    CA.append(('smith', None, wt, 9, False))  # chạm chậm hơn
kq = {}; loi = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    ctx = b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=3, is_mobile=True, has_touch=True)
    g = ctx.new_page(); g.on('pageerror', lambda e: loi.append(str(e)))
    g.goto(URL)
    g.wait_for_function("window.G && G.scene && G.spriteCustom && ['smith','hunter','wrestler','healer'].every(k => { const s = G.spriteCustom.get('em-be-'+k); return s && s.img; })", timeout=240000)
    g.wait_for_timeout(2500)
    for f in ('setup.js',):
        g.add_script_tag(path=os.path.join(TESTS, f))
    g.add_script_tag(path=os.path.join(D, 'do_vet.js')); g.add_script_tag(path=os.path.join(D, 'do_tran.js'))
    g.evaluate("(px) => { VT.doPx = px; }", PX)
    for k, bo, wt, nhip, giu in CA:
        ten = '%s:%s:%s:%s' % (k, bo or '-', wt, 'giu' if giu else 'cham%d' % nhip)
        if CHI and not ten.startswith(CHI): continue
        g.evaluate("([k,bo,wt,nhip,giu]) => VT.bat(k, bo, wt, nhip, giu)", [k, bo, wt, nhip, giu])
        g.wait_for_timeout(int(GIAY * 1000))
        r = g.evaluate("() => { const r = VT.kq(); VT.dung(); return r; }")
        kq[ten] = r
        ns = r['nhat']; khong = [x for x in ns if not x['vet']]; it = [x for x in ns if x['vet'] and x['soVe'] < 4]
        print('%-30s nhát %3d | không sinh vệt %2d | vệt vẽ <4 lần %2d | E tối đa %d | px tb %s' % (ten, len(ns), len(khong), len(it), r['toiDaE'], round(sum(x['px'] for x in ns) / max(1, len(ns)))), flush=True)
    b.close()
json.dump({'kq': kq, 'loi': loi}, open(OUT, 'w'), ensure_ascii=False, indent=0)
print('pageerror:', loi or 'không có')
