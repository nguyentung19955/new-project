"""Cắt 2 lô VẼ LẠI 12/10 (mũ, đồ lưng) bằng tools/tach-do chạy headless. Xuất .sprite.json (nét gấp đôi) ra thư mục SP.
Chạy từ gốc repo:  SP=/thu/muc python3 docs/review/ke-hoach-cai-thien/nhap-anh-12-10-b/tach_do.py"""
import os, json, base64, subprocess, time
from playwright.sync_api import sync_playwright
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../..')); SP = os.environ.get('SP', '/tmp')
LO = [('tp-hats-ve-lai', 've-lai-mu-9.png'), ('tp-backs-ve-lai', 've-lai-do-lung-3.png')]
srv = subprocess.Popen(['python3', '-m', 'http.server', '8771'], cwd=R, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
try:
  with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1200, 'height': 1600}); loi = []
    pg.on('pageerror', lambda e: loi.append(str(e)))
    pg.goto('http://localhost:8771/tools/tach-do/index.html'); pg.wait_for_timeout(1500)
    for lid, anh in LO:
      pg.evaluate("(id) => { const i = LO.findIndex((l) => l.id === id); const s = document.getElementById('chonLo'); s.value = i; s.dispatchEvent(new Event('change')); }", lid)
      pg.wait_for_timeout(300)
      pg.set_input_files('#chonAnh', R + '/docs/anh-goc/2026-10-12/' + anh); pg.wait_for_timeout(3500)
      print(lid, 'heNet', pg.evaluate("() => document.getElementById('heNet').value"))
      ds = pg.evaluate("() => L.ds.map((m, i) => KQ[i] ? phanTep(i, false) : { ma: m.ma, thieu: true })")
      for t in ds:
        if t.get('thieu'): print('  THIẾU', t['ma']); continue
        json.dump(t, open(SP + '/' + t['ma'] + '.sprite.json', 'w'), ensure_ascii=False, separators=(',', ':'))
        open(SP + '/' + t['ma'] + '.png', 'wb').write(base64.b64decode(t['anh'].split(',')[1]))
        print('  %s %sx%s net %s tp %s' % (t['ma'], t['rong'], t['cao'], t.get('net'), json.dumps(t.get('trang_phuc'), ensure_ascii=False)))
      pg.screenshot(path=SP + '/trang-' + lid + '.png', full_page=True)
    print('pageerror', loi or 'không có'); b.close()
finally: srv.kill()
