"""Ảnh soát TĨNH giao diện Luyện vũ khí phiên 2 (docs/review/ke-hoach-cai-thien/luyen-vu-khi/bao-cao-2.md). Không chơi thử: đặt bản lưu rồi vẽ
đúng một khung hình (vòng lặp game dừng, như tests/luyen_shots.py), chụp VI + EN, mỗi cảnh một ảnh.

  python3 tests/luyen2_shots.py [--out <thư mục>] [--nguon]   (mặc định docs/review/ke-hoach-cai-thien/luyen-vu-khi/anh-phien-2/, ảnh JPG)
  Mặc định mở dist/linh-khi.html (chạy python3 build.py trước); --nguon: mở index.html (mã nguồn, thiếu ảnh).

Cảnh: Ông Thợ Rèn ở cấp 2 / 5 (khoá trần) / 8 / 14 / 15, khoá thiếu mảnh, 3 kiểu ăn mừng, Hành trang › Vũ khí, thanh tài nguyên ở làng,
bảng báo chuyển bản lưu, màn kết quả, bảng thua (gợi ý), HUD trong ải (ô 54×35), ô cỡ 20 (phóng to), màn điện thoại ngang 844×390,
?luyen=0 (giao diện cũ). In thêm: chữ chưa dịch (G.ngonNgu.thieu), chữ bị cắt "…" (T.chuDo), lỗi console."""
import os, sys
from playwright.sync_api import sync_playwright
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else os.path.join(ROOT, '..', 'docs', 'review', 'ke-hoach-cai-thien', 'luyen-vu-khi', 'anh-phien-2')

INIT = r"""
try { localStorage.clear(); } catch (e) {}
"""
DUNG = "window.requestAnimationFrame = function () { return 0; };"
HELP = r"""
(function () { const t = document.getElementById('lk-tai'); if (t) t.remove(); })();
window.LK = {
  ve(n) { for (let i = 0; i < (n || 0); i++) { G.tickDraw = false; G.tick(); G.click = null; }
    G.ui.begin(); G.scene.draw(); if (G.theme && G.theme.endFrame) G.theme.endFrame(); G.click = null; },
  // trum: số trùm vùng đã hạ; L: cấp Luyện kiếm (phi tiêu thấp hơn 1); manh: số mảnh mỗi trùm
  dat(lang, trum, L, he, more, manh) {
    const r = G.srand(777); Math.random = r; G.rnd = r;
    if (G.hinhThai && G.hinhThai.am) G.hinhThai.am.on = null; G.luyen.anMung.on = null; G.luyen.baoBang.on = null;
    G.testSave({ lvl: 6 + 6 * trum, luyen: 1 });
    const s = G.save;
    for (let rr = 0; rr < Math.max(1, trum); rr++) for (let ii = 0; ii < (rr < trum ? 5 : 4); ii++) s.stars[rr + '-' + ii] = 3;
    G.save = G.fixSave(JSON.parse(JSON.stringify(s)));
    const sv = G.save; sv.gold = 2400; sv.linhKhi = 260; sv.nlr = 64; sv.mats = [9, 6, 12]; sv.shards = sv.shards.map(() => (manh == null ? 2 : manh));
    const w = sv.weapons.find((x) => x.type === 'sword'), b = sv.weapons.find((x) => x.type === 'bow');
    w.luyen = L; b.luyen = Math.max(1, L - 1); if (he) { w.branch = he; b.branch = 'ice'; }
    sv.weapons.forEach((x, i) => { if (x !== w && x !== b) x.luyen = Math.max(1, Math.min(15, L - 2 - i)); if (x.luyen >= 3 && !x.branch) x.branch = 'poison'; G.luyen.dongBo(x); });
    G.luyen.dongBo(w); G.luyen.dongBo(b);
    if (L >= 15) G.luyen.datDong(w, 'trum');
    if (G.ngonNgu) G.ngonNgu.dat(lang, false);
    G.time = 100; G.setScene(G.Village);
    const A = G.villageApi; A.open('ren'); A.V.ftab = 'luyen'; G.luyen.ui.sel = w.id; G.luyen.ui.doi = null; if (more) more(A.V, A, w, sv);
  },
  // luyện kiếm 1 cấp ở làng rồi dời đồng hồ tới giây t của ăn mừng
  anMung(t) { const sv = G.save, w = sv.weapons.find((x) => x.type === 'sword'); sv.gold = 99999; sv.linhKhi = 9999; sv.nlr = 999; sv.mats = [99, 99, 99]; sv.shards = sv.shards.map(() => 9);
    G.noRender = false; G.time = 100; G.luyen.nang(sv, w, w.branch || 'fire'); G.time = 100 + t; },
};
"""
S = "(V, A, w, sv) => { %s }"
CANH = [
    ('ren-cap2', "LK.dat('%s', 0, 2, null)"),
    ('ren-cap5-khoa-tran', "LK.dat('%s', 0, 5, 'fire')"),
    ('ren-cap5-thieu-manh', "LK.dat('%s', 1, 5, 'fire', null, 0)"),
    ('ren-cap8', "LK.dat('%s', 1, 8, 'fire')"),
    ('ren-cap14', "LK.dat('%s', 4, 14, 'fire')"),
    ('ren-cap15', "LK.dat('%s', 4, 15, 'fire')"),
    ('an-mung-dai-cap6', "LK.dat('%s', 1, 5, 'fire'); LK.anMung(1.0)"),
    ('an-mung-ngan-cap9', "LK.dat('%s', 2, 8, 'fire'); LK.anMung(0.5)"),
    ('an-mung-1-cap7', "LK.dat('%s', 1, 6, 'fire'); LK.anMung(0.22)"),
    ('hanh-trang', "LK.dat('%s', 1, 7, 'poison', " + S % "V.tab = 'bag'; if (G.hanhTrang && G.hanhTrang.reset) G.hanhTrang.reset(); if (G.hanhTrang) G.hanhTrang.tab = 'weapon';" + ")"),
    ('hanh-trang-tai-nguyen', "LK.dat('%s', 1, 7, 'poison', " + S % "V.tab = 'bag'; if (G.hanhTrang && G.hanhTrang.reset) G.hanhTrang.reset(); if (G.hanhTrang) G.hanhTrang.tab = 'res';" + ")"),
    ('thanh-lang', "LK.dat('%s', 1, 7, 'poison', " + S % "A.goHub();" + ")"),
    ('bao-chuyen', "LK.dat('%s', 1, 9, 'fire', " + S % "A.goHub(); if (sv.zed) { delete sv.zed.bao; delete sv.zed.boBao; delete sv.zed.boBanBao; } delete sv.heMoiBao; delete sv.canLaiBao; sv.luyenBao = { vk: sv.weapons.map((x) => [x.type, G.luyen.cap(x)]), vang: 2300, lk: 40, nlr: 96, nl: [6, 6, 10], lo: 4, vi: 76 }; G.noRender = false; G.villageScene.update(0.1, false); G.time = 101;" + ")"),
    ('ket-qua', "LK.dat('%s', 1, 4, 'fire', " + S % "G.startStage(0, 1, 0); for (let i = 0; i < 4; i++) { G.tickDraw = false; G.tick(); } const W = G.getWorld(); const gia = W && !W.boss; if (gia) W.boss = { weak: [] }; G.finishStage(true); if (gia) W.boss = null;" + ")"),
    ('bang-thua', "LK.dat('%s', 1, 4, 'fire', " + S % "G.startStage(0, 3, 0); for (let i = 0; i < 4; i++) { G.tickDraw = false; G.tick(); } G.finishStage(false);" + ")"),
    ('hud-trong-ai', "LK.dat('%s', 3, 12, 'fire', " + S % "G.startStage(2, 0, 0);" + ")"),
]
O_NHO = r"""(() => { const w = G.save.weapons.find((x) => x.type === 'sword'), giu = w.luyen; const c = G.ux;
  G.ui.rect(0, 80, 240, 66, 'rgba(10,20,20,0.95)');
  [1, 2, 5, 9, 12, 15].forEach((L, i) => { w.luyen = L; G.luyen.dongBo(w);
    G.oBacVk(6 + i * 38, 84, 20, w); G.art.weaponIcon(c, w, 16 + i * 38, 94, 16);
    G.oBacVk(4 + i * 38, 108, 32, w); G.art.weaponIcon(c, w, 20 + i * 38, 124, 26); });
  w.luyen = giu; G.luyen.dongBo(w); })()"""
LUYEN0 = [('luyen0-ren', "LK.dat('%s', 1, 7, 'fire')")]


def chup(pg, js, lang, ten, out):
    pg.evaluate(js % lang)
    pg.evaluate('LK.ve(%d)' % (90 if ten in ('ket-qua', 'bang-thua', 'hud-trong-ai') else 0)); pg.wait_for_timeout(60); pg.evaluate('LK.ve(0)')
    f = os.path.join(out, '%s-%s.png' % (lang, ten))
    pg.screenshot(path=f)
    return f


def mo(p, url_them, vp):
    br = p.chromium.launch()
    ctx = br.new_context(viewport=vp, device_scale_factor=1)
    ctx.route('**/*', lambda r: r.continue_() if r.request.url.startswith('file:') else r.abort())
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
    def ghi(m):
        t = m.text
        if 'ERR_' in t or 'net::' in t: return
        if m.type == 'error' or (m.type == 'warning' and 'luyen' in t.lower()): errs.append(t)
    pg.on('console', ghi)
    pg.add_init_script(INIT)
    pg.goto('file://' + ROOT + ('/index.html' if '--nguon' in sys.argv else '/dist/linh-khi.html') + '?cloud=0' + url_them)
    pg.wait_for_function('window.G && G.scene', timeout=20000)
    pg.add_script_tag(path=os.path.join(HERE, 'setup.js'))
    pg.evaluate(HELP)
    pg.evaluate("G.save.sound = false; G.audioStart = () => {}")
    pg.evaluate("(() => { const SC = G.spriteCustom; if (SC && SC.canAnh) for (const m of ['zed-moi', 'zed-vk', 'zed-vk-he']) SC.canAnh(m); })()")
    pg.wait_for_timeout(4000)
    pg.evaluate(DUNG); pg.wait_for_timeout(200)
    return br, pg, errs


def main():
    os.makedirs(OUT, exist_ok=True)
    with sync_playwright() as p:
        br, pg, errs = mo(p, '', {'width': 960, 'height': 540})
        pg.evaluate("G.theme && G.theme.chuDo && (G.theme.chuDo.cat = 0)")
        for lang in ('vi', 'en'):
            for ten, js in CANH:
                chup(pg, js, lang, ten, OUT)
                print('chụp', lang, ten)
        # ô cỡ 20 và ô trong trận 54×35: cắt và phóng to ×3 từ ảnh HUD / kết quả
        for lang in ('vi', 'en'):
            im = Image.open(os.path.join(OUT, '%s-hud-trong-ai.png' % lang)).convert('RGB')
            im.crop((720, 0, 960, 90)).resize((720, 270), Image.NEAREST).save(os.path.join(OUT, '%s-o-trong-tran-phong-to.png' % lang))
        # ô cỡ 20 và 32 (cấp 1, 2, 5, 9, 12, 15), phóng to ×3
        pg.evaluate("LK.dat('vi', 4, 9, 'fire', (V, A) => { A.goHub(); })"); pg.evaluate('LK.ve(0)')
        pg.evaluate(O_NHO)
        f = os.path.join(OUT, '_o.png'); pg.screenshot(path=f)
        Image.open(f).convert('RGB').crop((0, 160, 480, 292)).resize((1440, 396), Image.NEAREST).save(os.path.join(OUT, 'o-co-20-va-32-phong-to.png')); os.remove(f)
        th = pg.evaluate('G.ngonNgu ? [...G.ngonNgu.thieu] : []')
        cat = pg.evaluate('G.theme && G.theme.chuDo ? G.theme.chuDo.cat : -1')
        br.close()
        # màn điện thoại ngang (844×390)
        br, pg2, errs2 = mo(p, '', {'width': 844, 'height': 390})
        for lang in ('vi', 'en'):
            chup(pg2, CANH[3][1], lang, 'dien-thoai-ngang-ren-cap8', OUT)
        print('chụp màn điện thoại ngang')
        br.close()
        # ?luyen=0: giao diện cũ
        br, pg3, errs3 = mo(p, '&luyen=0', {'width': 960, 'height': 540})
        chup(pg3, "LK.dat('%s', 1, 7, 'fire', (V) => { V.ftab = 'vk'; })", 'vi', 'luyen0-ren', OUT)
        top0 = pg3.evaluate("(() => { G.villageApi.goHub(); return G.villageScene.resParts().length; })()")
        chup(pg3, "LK.dat('%s', 1, 7, 'fire', (V, A) => { A.goHub(); })", 'vi', 'luyen0-thanh-lang', OUT)
        print('chụp ?luyen=0 (thanh làng %d ô)' % top0)
        br.close()
    # đổi ra JPG (nhẹ hơn PNG ~4 lần) cho thư mục docs
    for f in sorted(os.listdir(OUT)):
        if f.endswith('.png'):
            Image.open(os.path.join(OUT, f)).convert('RGB').save(os.path.join(OUT, f[:-4] + '.jpg'), quality=88)
            os.remove(os.path.join(OUT, f))
    print('--- chữ chưa dịch: %d' % len(th))
    for s in th: print('  ', s)
    print('--- chữ bị cắt "…" (T.chuDo.cat): %s' % cat)
    ds = errs + errs2 + errs3
    print('--- lỗi console: %d' % len(ds))
    for e in ds[:20]: print('  ' + e[:300])
    print('ghi', os.path.relpath(OUT))


main()
