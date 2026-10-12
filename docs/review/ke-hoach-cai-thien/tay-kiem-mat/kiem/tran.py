"""Chụp em bé đang chém kiếm trong trận thật (có vệt chém), phóng to quanh em bé. Chạy: python3 tran.py <url> <tệp ra>"""
import base64, os, sys
from playwright.sync_api import sync_playwright
URL, OUT = sys.argv[1], sys.argv[2]
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../game')
loi = []
JS = r"""() => {
  const KEYS = ['smith','hunter','wrestler','healer'], N = 10, K = 3, CW = 70, CH = 64;
  const out = document.createElement('canvas'); out.width = CW * K * N; out.height = CH * K * KEYS.length * 3; const o = out.getContext('2d'); o.imageSmoothingEnabled = false;
  const info = [];
  KEYS.forEach((k, r) => {
    const { W, P } = AU.room({ hero: k, melee: 'sword', lvl: 10 });
    AU.want(P, 'sword');
    const e = AU.dummy(P.x + 30, P.y, { hp: 1e7 });
    AU.run(30, true);
    for (let cb = 0; cb < 3; cb++) {
      let n = 0, f = 0;
      AU.press({ atkP: true, atk: true });
      AU.run(60, true, () => {
        AU.pin([{ e, x: P.x + 30, y: P.y }]);
        if (f++ % 2 === 0 && n < N && P.atkT > 0) {
          try { G.drawWorld(G.getRun().r); } catch (er) { info.push(String(er)); }
          const cv = G.wx.canvas, sc = cv.width / G.W, cam = Math.round(W.cam);
          const sx = (P.x - cam - CW / 2) * sc, sy = (P.y - CH + 12) * sc;
          o.drawImage(cv, sx, sy, CW * sc, CH * sc, n * CW * K, (r * 3 + cb) * CH * K, CW * K, CH * K);
          n++;
        }
        if (n >= N && !(P.atkT > 0)) return false;
      });
      AU.inp.atk = false;
      AU.run(4, true);
      info.push([k, cb, n, P.comboI]);
    }
  });
  return { png: out.toDataURL(), info, W: G.W, cw: G.wx.canvas.width };
}"""
with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=2); g = ctx.new_page()
    g.on('pageerror', lambda e: loi.append(str(e)))
    g.goto(URL)
    g.wait_for_function("window.G && G.scene && G.spriteCustom && ['smith','hunter','wrestler','healer'].every(k => { const s = G.spriteCustom.get('em-be-'+k); return s && s.img && s.donMa; })", timeout=180000)
    g.wait_for_timeout(2000)
    for f in ('bot.js', 'setup.js'):
        g.add_script_tag(path=os.path.join(ROOT, 'tests', f))
    g.add_script_tag(path=os.path.join(ROOT, 'tests', 'au_lib.js'))
    r = g.evaluate(JS)
    open(OUT, 'wb').write(base64.b64decode(r.pop('png').split(',')[1]))
    print(r)
    b.close()
print('pageerror:', loi or 'không có')
