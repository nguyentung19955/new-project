"""Ảnh soát tĩnh thẻ "Sổ" của Ông Từ (Bước 2 — Phiên A, js/so_yeu_quai.js). Không chơi: đặt bản lưu mẫu, mở bảng, vẽ đúng một khung hình
(vòng lặp game dừng, đồng hồ cố định) rồi chụp màn 480×270 (điểm ảnh ×2) ở tiếng Việt và tiếng Anh, ghép thành một tấm 2 × 2:
  hàng trên: Rừng già, trang Mộc Tinh (đã tìm điểm yếu, quà chờ nhận) — VI | EN
  hàng dưới: Hang biển, trang Cua Lính (đã hạ, chưa điểm yếu) cạnh các ô chưa gặp — VI | EN

  python3 game/tests/so_yeu_quai_shots.py [--out docs/ke-hoach/buoc-2/xem-so.png] [--q soyq=0] [--nguon]
Phiên D (ảnh): mặc định mở bản đóng gói game/dist/linh-khi.html (có ảnh nhúng: chạy python3 game/build.py trước);
--nguon: mở game/index.html (mã nguồn, không có ảnh → hình vẽ code). --q khunganh=0: bản đóng gói nhưng tắt ảnh khung Bước 2.
"""
import os, sys
from playwright.sync_api import sync_playwright
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
REPO = os.path.dirname(ROOT)


def arg(name, d=None):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else d


OUT = arg('--out', os.path.join(REPO, 'docs', 'ke-hoach', 'buoc-2', 'xem-so.png'))
Q = arg('--q', '')
TRANG = ROOT + '/index.html' if '--nguon' in sys.argv or not os.path.exists(ROOT + '/dist/linh-khi.html') else ROOT + '/dist/linh-khi.html'

INIT = r"""
window.requestAnimationFrame = function () { return 0; };
Date.now = () => 1760000000000; performance.now = () => 5000;
try { localStorage.clear(); } catch (e) {}
"""

DUNG = r"""
(o) => {
  { const el = document.getElementById('lk-tai'); if (el) el.remove(); } // vòng lặp game dừng nên màn tải HTML không tự gỡ
  G.ngonNgu.dat(o.lang, false);
  const r = G.srand(777); Math.random = r; G.rnd = r;
  G.testSave({ lvl: 20, tier: 2, sharpen: 4, branch: 'fire', marks: 200, gold: 2345 });
  G.ngonNgu.dat(o.lang, false);
  G.save = G.fixSave(G.save);
  const sv = G.save;
  sv.tut.done = true;
  sv.stars = { '0-0': 3, '0-1': 3, '0-2': 2, '0-3': 3, '0-4': 3, '1-0': 2, '1-1': 1 };
  sv.scars = { moc: 'fire' }; sv.rec = { power: 300, b: { moc: 41.5 } };
  sv.so.q = {
    heoCon: { g: 1, h: 34, k: 1, n: 7 }, ongVo: { g: 1, h: 12, k: 1, n: 3 }, boHung: { g: 1, h: 9, k: 0, n: 1 }, hoaBaoTu: { g: 1, h: 6, k: 1, n: 1 },
    chonBong: { g: 1, h: 3, k: 0, n: 1 }, namPhong: { g: 1, h: 8, k: 1, n: 3 }, socNo: { g: 1, h: 0, k: 0, n: 0 }, nhimDoc: { g: 1, h: 5, k: 0, n: 1 },
    heoNanh: { g: 1, h: 4, k: 1, n: 3 }, namPhongChua: { g: 1, h: 2, k: 0, n: 1 }, namChua: { g: 1, h: 2, k: 1, n: 3 }, mocTinh: { g: 1, h: 2, k: 1, n: 1, l: 41 },
    cua: { g: 1, h: 5, k: 0, n: 1 }, caCon: { g: 1, h: 2, k: 1, n: 3 }, oc: { g: 1, h: 0, k: 0, n: 0 },
  };
  sv.so.bu = 1;
  G.time = 100;
  G.setScene(G.Village);
  const VA = G.villageApi, V = VA.V;
  VA.open('tu'); V.tab = 'so'; V.ttab = 'so'; V.soVung = o.vung; V.soSel = o.sel; V.msgT = 0;
  const d0 = Object.assign({}, G.theme.chuDo);
  for (let i = 0; i < 3; i++) { G.ui.begin(); G.scene.draw(); if (G.theme && G.theme.endFrame) G.theme.endFrame(); G.click = null; }
  const d = G.theme.chuDo; // chữ trong khung: số chỗ phải cắt "…" / thấp hơn khung / đệm hẹp (chỉ đếm lần đặt mới)
  return [G.LANG, V.tab, G.villageApi.theCua('tu').map((t) => t[0]).join(), 'cắt ' + (d.cat - d0.cat), 'thấp ' + (d.thap - d0.thap), 'hẹp ' + (d.hep - d0.hep)];
}
"""

CANH = [('vi', 0, 'mocTinh'), ('en', 0, 'mocTinh'), ('vi', 1, 'cua'), ('en', 1, 'cua')]


def main():
    tam = []
    with sync_playwright() as p:
        br = p.chromium.launch()
        ctx = br.new_context(viewport={'width': 480, 'height': 270}, device_scale_factor=2)
        ctx.route('**/*', lambda r: r.continue_() if r.request.url.startswith('file:') else r.abort())
        pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'ERR_' not in m.text and 'net::' not in m.text else None)
        pg.add_init_script(INIT)
        pg.goto('file://' + TRANG + '?cloud=0' + ('&' + Q if Q else ''))
        pg.wait_for_function('window.G && G.scene', timeout=20000)
        pg.add_script_tag(path=os.path.join(HERE, 'setup.js'))
        pg.wait_for_timeout(2500)  # ảnh AI (dữ liệu nhúng) giải mã xong
        for i, (lang, vung, sel) in enumerate(CANH):
            print(i, pg.evaluate(DUNG, {'lang': lang, 'vung': vung, 'sel': sel}))  # lần đầu: đếm chữ bị cắt / lệch khung
            pg.wait_for_timeout(400)
            pg.evaluate(DUNG, {'lang': lang, 'vung': vung, 'sel': sel})
            f = os.path.join(os.path.dirname(OUT), '_so_%d.png' % i)
            pg.screenshot(path=f)
            tam.append(f)
        # soát chữ cả 36 trang × 2 ngôn ngữ (không chụp): đếm chữ bị cắt "…" / thấp hơn khung
        print('soát 36 trang × VI/EN:', pg.evaluate(r"""() => {
          const d0 = Object.assign({}, G.theme.chuDo), VA = G.villageApi, V = VA.V;
          for (const lang of ['vi', 'en']) { G.ngonNgu.dat(lang, false);
            for (const t of G.SO_YQ.trang) { V.soVung = t[1]; V.soSel = t[0]; G.ui.begin(); G.scene.draw(); if (G.theme.endFrame) G.theme.endFrame(); G.click = null; } }
          const d = G.theme.chuDo; return { cat: d.cat - d0.cat, thap: d.thap - d0.thap, hep: d.hep - d0.hep, lan: d.lan - d0.lan };
        }"""))
        print('lỗi console: %d' % len(errs))
        for e in errs[:20]: print('  ' + e[:300])
        br.close()
    hs = [Image.open(f).convert('RGB') for f in tam]
    w, h = hs[0].size
    out = Image.new('RGB', (w * 2 + 8, h * 2 + 8), (20, 24, 46))
    for i, im in enumerate(hs):
        out.paste(im, ((i % 2) * (w + 8), (i // 2) * (h + 8)))
    out.save(OUT)
    for f in tam: os.remove(f)
    print('đã ghi', OUT, out.size)


main()
