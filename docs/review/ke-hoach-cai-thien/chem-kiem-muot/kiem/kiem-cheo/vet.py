"""Cung vệt chém (js/fx.js cungVk) của 3 nhát trong chuỗi, trước (?kiemmuot=0) và sau. Chạy: python3 vet.py <url gốc không có ?>"""
import os, sys
from playwright.sync_api import sync_playwright
URL = sys.argv[1]; DAY = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'do_kiem.js')
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    g = b.new_page(viewport={'width': 844, 'height': 390}); loi = []; g.on('pageerror', lambda e: loi.append(str(e)))
    for nhan, q in (('TRƯỚC', '?cloud=0&kiemmuot=0'), ('SAU', '?cloud=0')):
        g.goto(URL + q)
        g.wait_for_function("window.G && G.spriteCustom && G.tinhLinh && ['smith','hunter','wrestler','healer'].every(k => { const s = G.spriteCustom.get('em-be-'+k); return s && s.img && s.donMa; }) && G.spriteCustom.timVuKhi({type:'sword',family:0})", timeout=180000)
        g.wait_for_timeout(1000); g.add_script_tag(path=DAY)
        for k in ('smith', 'hunter', 'wrestler', 'healer'):
            for r in g.evaluate('k => DK.vet(k)', k):
                print('%-5s %-9s %s  cung vệt %s -> %s (giữa %s)  kiếm lúc chạm %s' % (nhan, k, r['nhat'], r['dau'], r['cuoi'], r['giua'], r['gocCham']))
    b.close()
print('pageerror:', loi or 'không có')
