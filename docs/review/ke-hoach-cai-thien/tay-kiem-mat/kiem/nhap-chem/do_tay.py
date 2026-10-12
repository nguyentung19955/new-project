"""Đo số điểm ảnh (như matNa) + bàn tay máy tự đo + vùng mặt từng khung atk_sword trong game. python3 do_tay.py <url>"""
import json, sys
from playwright.sync_api import sync_playwright
JS = """() => { const SC = G.spriteCustom, o = {};
 for (const k of ['smith','hunter','wrestler','healer']) {
  const sp = SC.get('em-be-' + k), a = sp.dt.atk_sword, N = sp.net || 1, h = Math.floor(N / 2);
  const cv = document.createElement('canvas'); cv.width = sp.img.width; cv.height = sp.img.height;
  const x = cv.getContext('2d'); x.drawImage(sp.img, 0, 0); const d = x.getImageData(0, 0, cv.width, cv.height).data;
  o[k] = []; delete sp.tayC; delete sp.tayBang;
  for (let i = 0; i < a.so; i++) { let n = 0;
   for (let y = 0; y < sp.fh; y++) for (let q = 0; q < sp.fw; q++) { const X = (i * sp.fw + q) * N + h, Y = (a.hang * sp.fh + y) * N + h; if (d[(Y * cv.width + X) * 4 + 3] > 127) n++; }
   const dk = SC.diemKhung(sp, k, 'atk_sword', i, null);
   o[k].push({ so: n, tu_do: SC.tayAI(sp, 'atk_sword', i), dung: dk && dk.diem.tay_truoc, nguon: dk && dk.nguon.tay_truoc, mat: SC.matKhung(sp, 'atk_sword', i) });
  } }
 return o; }"""
with sync_playwright() as p:
    b = p.chromium.launch(); g = b.new_page(); loi = []
    g.on('pageerror', lambda e: loi.append(str(e)))
    g.goto(sys.argv[1])
    g.wait_for_function("window.G && G.spriteCustom && ['smith','hunter','wrestler','healer'].every(k => { const s = G.spriteCustom.get('em-be-'+k); return s && s.img && s.donMa; })", timeout=180000)
    g.wait_for_timeout(1500)
    r = g.evaluate(JS)
    for k, v in r.items():
        print(k)
        for i, f in enumerate(v): print('  ', i + 1, json.dumps(f, ensure_ascii=False))
    print('pageerror:', loi or 'không có'); b.close()
