# Vẽ vài ô em bé phóng to theo mô tả JSON: python3 ve_o.py <ra.png> '<json danh sách [key, bo, wt, face, gear, poseIndex]>' [phóng] [js cờ]
import sys, os, json; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
ds = json.loads(sys.argv[2]); Z = int(sys.argv[3]) if len(sys.argv) > 3 else 6; CO = sys.argv[4] if len(sys.argv) > 4 else ''
with sync_playwright() as p:
    b, pg, errs = mo(p); pg.add_script_tag(path=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tu_the.js'))
    if CO: pg.evaluate(CO)
    d = pg.evaluate("""([ds, Z]) => { const A = AUD, cv = document.createElement('canvas'); cv.width = 64 * Z * ds.length; cv.height = 64 * Z + 14; const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; c.fillStyle = '#4a6b3c'; c.fillRect(0, 0, cv.width, cv.height);
      const t = document.createElement('canvas'); t.width = 64; t.height = 64; const x = t.getContext('2d');
      ds.forEach((q, i) => { const po = A.tuThe(q[2] || 'sword')[q[5]]; const e = A.ve(x, A.oCua(q[0], A.outfit(q[1], q[4] || {}), q[2], q[3], po)); c.drawImage(t, i * 64 * Z, 14, 64 * Z, 64 * Z); c.fillStyle = '#fff'; c.font = '12px sans-serif'; c.fillText(q[0] + ' ' + (q[1]||'goc') + ' ' + q[2] + ' ' + po[0] + (e ? ' LỖI ' + e : ''), i * 64 * Z + 4, 11); c.fillStyle = '#4a6b3c'; });
      return cv.toDataURL(); }""", [ds, Z])
    luu_png(d, sys.argv[1]); print('pageerror', errs)
