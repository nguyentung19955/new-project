"""Vẽ một dãy quái lên nền màu sàn ở cỡ thật và phóng to (để soi chi tiết, làm ảnh trước/sau).
Chạy: python3 tests/quai_tam.py ẢNH_RA id1,id2,... [phóng=3] [anim=idle] [t=0] [thư_mục_game]"""
import base64, os, sys
from quai_lib import sync_playwright, ROOT

JS = r"""([ids, k, anim, t]) => {
  const MA = G.monsterArt, info = (id) => MA.list.find((q) => q.id === id) || { w: 40, h: 40 };
  const reg = (id) => { const q = info(id); return q.vung === 'rung' ? '#3d3a26' : q.vung === 'bien' ? '#3b4250' : '#4a4442'; };
  const cell = ids.map((id) => { const q = info(id); return { id, w: Math.max(q.w, 30) + 16, h: Math.max(q.h, 30) + 14 }; });
  const W1 = cell.reduce((a, c) => a + c.w, 0), H1 = Math.max(...cell.map((c) => c.h));
  const cv = document.createElement('canvas'); cv.width = W1 * (1 + k); cv.height = H1 * k + 4; const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
  c.fillStyle = '#16121c'; c.fillRect(0, 0, cv.width, cv.height);
  let x = 0;
  for (const q of cell) {
    c.fillStyle = reg(q.id); c.fillRect(x, 0, q.w, H1); c.fillRect(W1 + x * k, 0, q.w * k, H1 * k);
    MA.draw(c, q.id, x + q.w / 2, H1 - 6, { anim, t, face: -1, bao: false });
    c.save(); c.translate(W1 + x * k, 0); c.scale(k, k); MA.draw(c, q.id, q.w / 2, H1 - 6, { anim, t, face: -1, bao: false }); c.restore();
    x += q.w;
  }
  return cv.toDataURL('image/png');
}"""

if __name__ == '__main__':
    out, ids = sys.argv[1], sys.argv[2].split(',')
    k = int(sys.argv[3]) if len(sys.argv) > 3 else 3
    anim = sys.argv[4] if len(sys.argv) > 4 else 'idle'
    t = float(sys.argv[5]) if len(sys.argv) > 5 else 0
    root = sys.argv[6] if len(sys.argv) > 6 else ROOT
    with sync_playwright() as pw:
        b = pw.chromium.launch(); pg = b.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + root + '/index.html'); pg.wait_for_function('window.G && G.monsterArt && G.monsterArt.list.length')
        url = pg.evaluate(JS, [ids, k, anim, t])
        open(out, 'wb').write(base64.b64decode(url.split(',')[1]))
        b.close()
        if errs: print('LỖI', errs)
        print('đã vẽ', out)
