"""Ảnh soát TĨNH bảng Cô Thợ May sau khi bộ vùng phải mua bằng vàng (15/10, docs/review/ke-hoach-cai-thien/bo-do-mua).
Không chơi thử: đặt bản lưu rồi vẽ đúng một khung hình (vòng lặp game dừng, như tests/ngon_ngu_shots.py), chụp VI + EN, ghép một ảnh.

  python3 tests/bo_do_mua_shots.py [--out <tệp png>] [--nguon]   (mặc định docs/review/ke-hoach-cai-thien/bo-do-mua/xem-truoc.png)
  Mặc định mở bản đóng gói dist/linh-khi.html (đủ ảnh thân Zed các bộ; chạy python3 build.py trước); --nguon: mở index.html (mã nguồn, thiếu ảnh).

In thêm: chữ chưa dịch (G.ngonNgu.thieu), số lần chữ bị cắt / thu nhỏ trong khung (G.theme.chuDo), lỗi console."""
import os, sys
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else os.path.join(ROOT, '..', 'docs', 'review', 'ke-hoach-cai-thien', 'bo-do-mua', 'xem-truoc.png')

INIT = r"""
try { localStorage.clear(); } catch (e) {}
"""
# vòng lặp game chạy vài giây cho ảnh tải sau (thân Zed các bộ: zed-rung, zed-bien, zed-lau) nạp xong, rồi mới dừng vòng lặp
DUNG = "window.requestAnimationFrame = function () { return 0; };"
HELP = r"""
(function () { const t = document.getElementById('lk-tai'); if (t) t.remove(); })(); // màn "Đang tải…" (vòng lặp game dừng nên không tự tắt)
window.LK = {
  ve(n) { for (let i = 0; i < (n || 0); i++) { G.tickDraw = false; G.tick(); G.click = null; }
    G.ui.begin(); G.scene.draw(); if (G.theme && G.theme.endFrame) G.theme.endFrame(); G.click = null; },
  // bản lưu: đã hạ Mộc Tinh, Ngư Tinh; đã mua bộ Rừng (cấp 1); bộ Biển đang bán; bộ Lâu đài khoá
  dat(lang, gold, more) {
    const r = G.srand(777); Math.random = r; G.rnd = r;
    G.testSave({ lvl: 18, sharpen: 8, branch: 'fire', gold });
    const s = G.save;
    for (let rr = 0; rr < 2; rr++) for (let ii = 0; ii < 5; ii++) s.stars[rr + '-' + ii] = 3;
    s.zed = { v: 1, hoc: { hunter: 1, healer: 1 }, boMo: { rung: 1 }, bo: 'rung', boMua: 1 };
    s.boCap = { rung: 1, ninja: 2 }; s.linhKhi = 150; s.shards = [4, 2, 0, 0];
    G.save = G.fixSave(s); G.save.gold = gold;
    if (G.ngonNgu) G.ngonNgu.dat(lang, false);
    G.time = 100; G.setScene(G.Village);
    const A = G.villageApi; A.open('may'); if (more) more(A.V, A);
  },
};
"""
CANH = [
    ('mua', "LK.dat('%s', 2100, (V) => { V.mtab = 'mua'; })"),
    ('mua-xac-nhan', "LK.dat('%s', 5600, (V) => { V.mtab = 'mua'; V.xnBo = 'bien'; })"),
    ('nang-cap', "LK.dat('%s', 2100, (V) => { V.mtab = 'nang'; })"),
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
        pg.evaluate("(() => { const SC = G.spriteCustom; if (SC && SC.canAnh) for (const m of ['zed-moi', 'zed-rung', 'zed-bien', 'zed-lau', 'zed-vk']) SC.canAnh(m); })()")
        pg.wait_for_timeout(5000)
        pg.evaluate(DUNG); pg.wait_for_timeout(200)
        print('ảnh Zed đã nạp:', pg.evaluate("Object.keys((G.spriteCustom && G.spriteCustom.zed) || {}).filter((k) => G.spriteCustom.zed[k].ready)"))
        for lang in ('vi', 'en'):
            for ten, js in CANH:
                pg.evaluate("G.theme.chuDo && Object.keys(G.theme.chuDo).forEach((k) => { G.theme.chuDo[k] = 0; })")
                pg.evaluate(js % lang); pg.evaluate('LK.ve(5)'); pg.wait_for_timeout(80); pg.evaluate('LK.ve(0)')
                f = os.path.join(tam, '%s-%s.png' % (lang, ten))
                pg.screenshot(path=f)
                cd = pg.evaluate("G.theme.chuDo ? JSON.stringify(G.theme.chuDo) : ''")
                print('chụp', lang, ten, 'chuDo', cd)
                anh.append((lang + ' · ' + ten, f))
        th = pg.evaluate('G.ngonNgu ? [...G.ngonNgu.thieu] : []')
        print('--- chữ chưa dịch: %d' % len(th))
        for s in th: print('  ', s)
        print('--- lỗi console: %d' % len(errs))
        for e in errs[:20]: print('  ' + e[:300])
        br.close()
    # ghép: 2 cột (VI | EN) × 3 hàng, mỗi ảnh thu còn 480×270 + nhãn
    W, H, NH = 480, 270, 14
    out = Image.new('RGB', (W * 2 + 6, (H + NH) * 3 + 4), (20, 20, 24))
    d = ImageDraw.Draw(out)
    for k, (nhan, f) in enumerate(anh):
        col, row = (0 if k < 3 else 1), k % 3
        im = Image.open(f).convert('RGB').resize((W, H), Image.LANCZOS)
        x, y = col * (W + 6), row * (H + NH)
        d.text((x + 4, y + 1), nhan, fill=(240, 220, 160))
        out.paste(im, (x, y + NH))
    out.save(OUT)
    for _, f in anh: os.remove(f)
    os.rmdir(tam)
    print('ghi', os.path.relpath(OUT))


main()
