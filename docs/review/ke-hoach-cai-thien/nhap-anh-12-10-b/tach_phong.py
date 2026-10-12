"""Cắt lô 'Trang trí · Lâu đài cổ · 16 hình' (tt-lau) bằng tools/tach-phong headless. Xuất .sprite.json ra thư mục SP.
Chạy từ gốc repo:  SP=/thu/muc python3 docs/review/ke-hoach-cai-thien/nhap-anh-12-10-b/tach_phong.py"""
import os, json, base64, subprocess, time
from playwright.sync_api import sync_playwright
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../..')); SP = os.environ.get('SP', '/tmp')
srv = subprocess.Popen(['python3', '-m', 'http.server', '8772'], cwd=R, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
try:
  with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1200, 'height': 1800}); loi = []
    pg.on('pageerror', lambda e: loi.append(str(e)))
    pg.goto('http://localhost:8772/tools/tach-phong/index.html'); pg.wait_for_timeout(1500)
    print(pg.evaluate("() => { const i = LO.findIndex((l) => l.id === 'tt-lau'); const s = document.getElementById('chonLo'); s.value = i; s.dispatchEvent(new Event('change')); return LO[i].ten; }"))
    pg.wait_for_timeout(300)
    pg.set_input_files('#chonAnh', R + '/docs/anh-goc/2026-10-12/trang-tri-lau-dai.png'); pg.wait_for_timeout(4000)
    print('heNet', pg.evaluate("() => document.getElementById('heNet').value"))
    ds = pg.evaluate("() => L.ds.map((m, i) => KQ[i] ? phanTep(i, false) : { ma: m.ma, thieu: true })")
    for t in ds:
      if t.get('thieu'): print('  THIẾU', t['ma']); continue
      json.dump(t, open(SP + '/' + t['ma'] + '.sprite.json', 'w'), ensure_ascii=False, separators=(',', ':'))
      open(SP + '/' + t['ma'] + '.png', 'wb').write(base64.b64decode(t['anh'].split(',')[1]))
      print('  %s %sx%s net %s' % (t['ma'], t['rong'], t['cao'], t.get('net')))
    pg.wait_for_timeout(1500); pg.screenshot(path=SP + '/trang-tt-lau.png', full_page=True)
    print('pageerror', loi or 'không có'); b.close()
finally: srv.kill()
