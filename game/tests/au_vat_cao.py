"""Rà soát C (12/10), mục 5: vật trang trí cao trong phòng (tượng đá Lâu đài, gốc cổ thụ Rừng già, mỏ neo Hang biển...) phải che
em bé khi em bé đứng SAU vật (chân em bé cao hơn chân vật). Trước phiên: vật nằm ở lớp nền nên em bé luôn vẽ đè lên vật.
Tìm ở mỗi vùng một phòng có vật cao (G.roomArt.vatCao), đặt em bé sau vật 6 điểm và trước vật 6 điểm, chụp phóng to.
Đếm điểm ảnh khác nhau giữa ảnh "em bé sau vật" và ảnh "không có em bé" ở vùng thân vật: sau phiên phải nhỏ hơn (vật che bé).
Chạy: python3 game/tests/au_vat_cao.py <thư mục ra> [địa chỉ gốc] [đuôi sau ?cloud=0]"""
import os, sys, time
from playwright.sync_api import sync_playwright

GAME = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/au-vat-cao'
BASE = sys.argv[2] if len(sys.argv) > 2 else 'http://127.0.0.1:8765'
EXTRA = sys.argv[3] if len(sys.argv) > 3 else ''
os.makedirs(OUT, exist_ok=True)

TIM = r"""
(r) => {
  const giu = G.RSC; G.RSC = true; // tìm vật bằng hàm mới cả khi đang chụp bản cũ (?rsc=0); vẽ thì theo cờ thật
  try { return tim(r); } finally { G.RSC = giu; }
  function tim(r) {
  for (let seed = 1; seed < 400; seed++) {
    const o = AU.room({ region: r, seed, stage: seed % 5 });
    const W = o.W; W.ents = [];
    AU.run(1, true);
    const ds = G.roomArt.vatCao ? G.roomArt.vatCao(G.wx, W) : [];
    const to = ds.filter((d) => d.h >= 20).sort((a, b) => b.h - a.h)[0];
    if (!to) continue;
    return { seed, n: ds.length, x: to.x, y: to.y, h: to.h };
  }
  return null;
  }
}
"""


def main():
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 844, 'height': 390}, device_scale_factor=2)
        pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        pg.goto('%s/linh-khi-nhe.html?cloud=0%s' % (BASE, EXTRA))
        pg.wait_for_function('window.G && G.scene', timeout=90000)
        for f in ('setup.js', 'au_lib.js'): pg.add_script_tag(path=os.path.join(GAME, 'tests', f))
        time.sleep(4)  # chờ ảnh trang trí tải
        for r in range(3):
            # chờ ảnh của vùng tải xong: dựng phòng vùng đó vài lần
            pg.evaluate("(r) => { AU.room({ region: r, seed: 1 }); AU.run(2, true); }", r); time.sleep(2.5)
            kq = pg.evaluate(TIM, r)
            print('vùng', r, kq)
            if not kq: continue
            pg.evaluate("([r, seed]) => { const o = AU.room({ region: r, seed, stage: seed % 5 }); o.W.ents = []; }", [r, kq['seed']])
            for ten, dy, an in (('sau', -6, False), ('truoc', 6, False), ('khong', -6, True)):
                pg.evaluate("""([dy, an, q]) => {
                  const W = G.getWorld(), P = G.getRun().P;
                  const S = G.getRun(); S.fade = 0; S.trans = null;
                  for (let i = 0; i < 40; i++) { P.x = an ? -999 : q.x; P.y = Math.max(W.y0, q.y + dy); P.face = 1; P.inv = 0; AU.run(1, true); }
                }""", [dy, an, kq])
                pg.screenshot(path=os.path.join(OUT, 'vung%d-%s.png' % (r, ten)))
        b.close()
    print('pageerror:', len(errs), errs[:5])


if __name__ == '__main__':
    main()
