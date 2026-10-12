"""So từng điểm ảnh: vẽ mọi kịch bản (do_kiem.js, 4 em bé × 2 hướng mặt) rồi in mã băm của từng dải ảnh.
Chạy: python3 so_diem_anh.py <url đủ tham số> <tệp json ra>. Hai tệp json giống hệt = vẽ giống hệt từng điểm ảnh."""
import hashlib, json, os, sys
from playwright.sync_api import sync_playwright
URL, OUT = sys.argv[1], sys.argv[2]; DAY = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'do_kiem.js')
kq = {}; loi = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    g = b.new_page(viewport={'width': 844, 'height': 390}); g.on('pageerror', lambda e: loi.append(str(e)))
    g.goto(URL)
    g.wait_for_function("window.G && G.spriteCustom && G.tinhLinh && ['smith','hunter','wrestler','healer'].every(k => { const s = G.spriteCustom.get('em-be-'+k); return s && s.img && s.donMa; }) && G.spriteCustom.timVuKhi({type:'sword',family:0})", timeout=180000)
    g.wait_for_timeout(1500); g.add_script_tag(path=DAY)
    for kb in ['nhat1', 'nhat2', 'nhat3', 'lien', 'chay', 'chieu', 'giu', 'luot']:
        for k in ['smith', 'hunter', 'wrestler', 'healer']:
            for f in (1, -1):
                u = g.evaluate('([a,b,f]) => DK.ve(a,b,f,2).url', [kb, k, f])
                kq['%s/%s/%d' % (kb, k, f)] = hashlib.md5(u.encode()).hexdigest()
    b.close()
json.dump(kq, open(OUT, 'w'), indent=0)
print(len(kq), 'dải; pageerror:', loi or 'không có')
