"""Rà soát C (12/10), mục 5: em bé đi trong làng có bị vật che khuất quá nhiều không, có chỗ đi được mà sai lớp không.
Quét lưới các điểm đi được (VS.blocked = false) trong làng 720x270. Ở mỗi điểm vẽ cảnh làng có em bé và không có em bé (vũ khí bay
theo dời ra xa), đếm số điểm ảnh em bé còn thấy được so với lúc em bé đứng chỗ trống. In các chỗ thấy < 50% và ghi ảnh phóng to.
Chạy (sau khi build hai tệp và mở máy chủ srv.py):  python3 game/tests/au_lang_che.py <thư mục ra> [địa chỉ gốc] [đuôi sau ?cloud=0]"""
import json, os, sys, time
from playwright.sync_api import sync_playwright

GAME = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/au-lang-che'
BASE = sys.argv[2] if len(sys.argv) > 2 else 'http://127.0.0.1:8765'
EXTRA = sys.argv[3] if len(sys.argv) > 3 else ''
os.makedirs(OUT, exist_ok=True)

JS = r"""
async (buoc) => {
  G.testSave({ hero: 'smith', melee: 'sword', lvl: 14 });
  G.setScene(G.Village);
  const VS = G.villageScene, S = VS.state, c = G.wx, N = G.NET || 1;
  G.tick = () => {};
  const ve = (an, x, y) => {
    S.x = x; S.y = y; S.face = 1; S.moving = false; S.t = 1;
    S.cam = G.clamp(x - 240, 0, VS.W - 480);
    for (const w of S.wp) { w.x = -999; w.y = -999; }
    VS.drawWorld({ hideHero: an });
  };
  const hop = (x, y) => { const cam = G.clamp(x - 240, 0, VS.W - 480); return [Math.max(0, Math.round((x - cam - 14) * N)), Math.max(0, Math.round((y + VS.OY - 40) * N)), Math.round(28 * N), Math.round(44 * N)]; };
  const dem = (x, y) => {
    const h = hop(x, y);
    ve(true, x, y); const a = c.getImageData(h[0], h[1], h[2], h[3]).data;
    ve(false, x, y); const b = c.getImageData(h[0], h[1], h[2], h[3]).data;
    let n = 0; for (let i = 0; i < a.length; i += 4) if (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) > 30) n++;
    return n;
  };
  // điểm chuẩn: giữa đường đất trống
  let goc = 0; for (const p of [[300, 196], [420, 196], [200, 196]]) if (!VS.blocked(p[0], p[1])) { goc = Math.max(goc, dem(p[0], p[1])); }
  const ra = [];
  for (let y = 64; y <= 248; y += buoc) for (let x = 12; x < VS.W - 8; x += buoc) {
    if (VS.blocked(x, y)) continue;
    const n = dem(x, y);
    ra.push([x, y, +(n / goc).toFixed(2)]);
  }
  return { goc, ra };
}
"""


def main():
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 844, 'height': 390}, device_scale_factor=1)
        pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        pg.goto('%s/linh-khi-nhe.html?cloud=0%s' % (BASE, EXTRA))
        pg.wait_for_function('window.G && G.scene', timeout=90000)
        pg.add_script_tag(path=os.path.join(GAME, 'tests', 'setup.js'))
        time.sleep(10)  # chờ ảnh rời (WebP) của làng tải xong
        kq = pg.evaluate(JS, 6)
        json.dump(kq, open(os.path.join(OUT, 'lang-che.json'), 'w'))
        thap = [r for r in kq['ra'] if r[2] < 0.5]
        print('điểm chuẩn', kq['goc'], '| số điểm đi được', len(kq['ra']), '| thấy < 50%:', len(thap))
        for r in sorted(thap, key=lambda r: r[2])[:60]: print('  ', r)
        # ảnh vài chỗ che nhiều nhất
        for i, r in enumerate(sorted(thap, key=lambda r: r[2])[:6]):
            url = pg.evaluate("([x, y]) => { const VS = G.villageScene, S = VS.state; S.x = x; S.y = y; S.face = 1; S.cam = G.clamp(x - 240, 0, VS.W - 480); for (const w of S.wp) { w.x = -999; w.y = -999; } VS.drawWorld({}); return document.getElementById('world').toDataURL(); }", [r[0], r[1]])
            import base64
            open(os.path.join(OUT, 'che-%d-%d-%d.png' % (i, r[0], r[1])), 'wb').write(base64.b64decode(url.split(',')[1]))
        b.close()
    print('pageerror:', len(errs), errs[:5])
    sys.exit(1 if errs else 0)


if __name__ == '__main__':
    main()
