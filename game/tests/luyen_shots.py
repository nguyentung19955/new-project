"""Ảnh soát TĨNH bảng Luyện tối thiểu (phiên 1 Luyện vũ khí, docs/review/ke-hoach-cai-thien/luyen-vu-khi). Không chơi thử: đặt bản lưu rồi vẽ
đúng một khung hình (vòng lặp game dừng, như tests/bo_do_mua_shots.py), chụp VI + EN, ghép một ảnh.

  python3 tests/luyen_shots.py [--out <tệp png>] [--nguon]   (mặc định docs/review/ke-hoach-cai-thien/luyen-vu-khi/xem-truoc-1.png)
  Mặc định mở dist/linh-khi.html (chạy python3 build.py trước); --nguon: mở index.html (mã nguồn, thiếu ảnh).

Cảnh: Ông Thợ Rèn thẻ Luyện ở cấp 2 (lên Mầm: chọn hệ), cấp 5 (khoá "Cần hạ Mộc Tinh"), cấp 9, cấp 15 (dòng Viên mãn), Hành trang › Vũ khí.
In thêm: chữ chưa dịch (G.ngonNgu.thieu), lỗi console."""
import os, sys
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else os.path.join(ROOT, '..', 'docs', 'review', 'ke-hoach-cai-thien', 'luyen-vu-khi', 'xem-truoc-1.png')

INIT = r"""
try { localStorage.clear(); } catch (e) {}
"""
DUNG = "window.requestAnimationFrame = function () { return 0; };"
HELP = r"""
(function () { const t = document.getElementById('lk-tai'); if (t) t.remove(); })();
window.LK = {
  ve(n) { for (let i = 0; i < (n || 0); i++) { G.tickDraw = false; G.tick(); G.click = null; }
    G.ui.begin(); G.scene.draw(); if (G.theme && G.theme.endFrame) G.theme.endFrame(); G.click = null; },
  // trum: số trùm vùng đã hạ; L: cấp Luyện kiếm (phi tiêu thấp hơn 1)
  dat(lang, trum, L, he, more) {
    const r = G.srand(777); Math.random = r; G.rnd = r;
    G.testSave({ lvl: 6 + 6 * trum, luyen: 1 });
    const s = G.save;
    for (let rr = 0; rr < Math.max(1, trum); rr++) for (let ii = 0; ii < (rr < trum ? 5 : 4); ii++) s.stars[rr + '-' + ii] = 3;
    G.save = G.fixSave(JSON.parse(JSON.stringify(s)));
    const sv = G.save; sv.gold = 2400; sv.linhKhi = 260; sv.nlr = 64; sv.mats = [9, 6, 3]; sv.shards = sv.shards.map(() => 1);
    const w = sv.weapons.find((x) => x.type === 'sword'), b = sv.weapons.find((x) => x.type === 'bow');
    w.luyen = L; b.luyen = Math.max(1, L - 1); if (he) { w.branch = he; b.branch = 'ice'; }
    G.luyen.dongBo(w); G.luyen.dongBo(b);
    if (L >= 15) G.luyen.datDong(w, 'trum');
    if (G.ngonNgu) G.ngonNgu.dat(lang, false);
    G.time = 100; G.setScene(G.Village);
    const A = G.villageApi; A.open('ren'); A.V.ftab = 'luyen'; G.luyen.ui.sel = w.id; if (more) more(A.V, A);
  },
};
"""
CANH = [
    ('ren-cap2', "LK.dat('%s', 0, 2, null)"),
    ('ren-cap5-khoa', "LK.dat('%s', 0, 5, 'fire')"),
    ('ren-cap9', "LK.dat('%s', 2, 9, 'fire')"),
    ('ren-cap15', "LK.dat('%s', 4, 15, 'fire')"),
    ('hanh-trang', "LK.dat('%s', 1, 7, 'poison', (V) => { V.tab = 'bag'; if (G.hanhTrang && G.hanhTrang.reset) G.hanhTrang.reset(); if (G.hanhTrang) G.hanhTrang.tab = 'weapon'; })"),
]


def main():
    tam = os.path.join(os.path.dirname(OUT), '_tam')
    os.makedirs(tam, exist_ok=True)
    anh = []
    with sync_playwright() as p:
        br = p.chromium.launch()
        ctx = br.new_context(viewport={'width': 960, 'height': 540}, device_scale_factor=1)
        ctx.route('**/*', lambda r: r.continue_() if r.request.url.startswith('file:') else r.abort())
        pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'ERR_' not in m.text and 'net::' not in m.text else None)
        pg.add_init_script(INIT)
        pg.goto('file://' + ROOT + ('/index.html' if '--nguon' in sys.argv else '/dist/linh-khi.html') + '?cloud=0')
        pg.wait_for_function('window.G && G.scene', timeout=20000)
        pg.add_script_tag(path=os.path.join(HERE, 'setup.js'))
        pg.evaluate(HELP)
        pg.evaluate("G.save.sound = false; G.audioStart = () => {}")
        pg.evaluate("(() => { const SC = G.spriteCustom; if (SC && SC.canAnh) for (const m of ['zed-moi', 'zed-vk']) SC.canAnh(m); })()")
        pg.wait_for_timeout(4000)
        pg.evaluate(DUNG); pg.wait_for_timeout(200)
        for lang in ('vi', 'en'):
            for ten, js in CANH:
                pg.evaluate(js % lang); pg.evaluate('LK.ve(5)'); pg.wait_for_timeout(80); pg.evaluate('LK.ve(0)')
                f = os.path.join(tam, '%s-%s.png' % (lang, ten))
                pg.screenshot(path=f)
                print('chụp', lang, ten)
                anh.append((lang + ' · ' + ten, f))
        th = pg.evaluate('G.ngonNgu ? [...G.ngonNgu.thieu] : []')
        print('--- chữ chưa dịch: %d' % len(th))
        for s in th: print('  ', s)
        print('--- lỗi console: %d' % len(errs))
        for e in errs[:20]: print('  ' + e[:300])
        br.close()
    n = len(CANH)
    W, H, NH = 480, 270, 14
    out = Image.new('RGB', (W * 2 + 6, (H + NH) * n + 4), (20, 20, 24))
    d = ImageDraw.Draw(out)
    for k, (nhan, f) in enumerate(anh):
        col, row = (0 if k < n else 1), k % n
        im = Image.open(f).convert('RGB').resize((W, H), Image.LANCZOS)
        x, y = col * (W + 6), row * (H + NH)
        d.text((x + 4, y + 1), nhan, fill=(240, 220, 160))
        out.paste(im, (x, y + NH))
    out.save(OUT)
    for _, f in anh: os.remove(f)
    os.rmdir(tam)
    print('ghi', os.path.relpath(OUT))


main()
