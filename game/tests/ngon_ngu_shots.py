"""Chụp các màn chính để kiểm ngôn ngữ (js/ngon_ngu.js). Một lượt, không chơi thật: đặt cảnh rồi vẽ đúng một khung hình
(vòng lặp game bị dừng, số ngẫu nhiên và đồng hồ cố định) nên hai lần chụp cùng mã cho ảnh giống nhau từng điểm ảnh.

  python3 tests/ngon_ngu_shots.py --lang vi --out <thư mục>  [--root <thư mục game khác>]  [--chi <tên cảnh,…>]
  python3 tests/ngon_ngu_shots.py --lang en --out <thư mục>      in thêm danh sách G.ngonNgu.thieu và lỗi console
  python3 tests/ngon_ngu_shots.py --so <thư mục A> <thư mục B>   so từng ảnh cùng tên, in số điểm ảnh khác
"""
import os, sys, json
HERE = os.path.dirname(os.path.abspath(__file__))


def arg(name, d=None):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else d


def so(a, b):
    from PIL import Image, ImageChops
    tong = 0
    for n in sorted(os.listdir(a)):
        if not n.endswith('.png') or not os.path.exists(os.path.join(b, n)): continue
        x, y = Image.open(os.path.join(a, n)).convert('RGB'), Image.open(os.path.join(b, n)).convert('RGB')
        if x.size != y.size: print('%-28s KHÁC CỠ' % n); tong += 1; continue
        d = ImageChops.difference(x, y).convert('L').point(lambda v: 255 if v else 0)
        k = d.histogram()[255]; bb = d.getbbox()
        print('%-28s khác %d điểm ảnh %s' % (n, k, bb or ''))
        tong += k
    print('TỔNG khác: %d' % tong)
    return tong


if '--so' in sys.argv:
    i = sys.argv.index('--so'); sys.exit(1 if so(sys.argv[i + 1], sys.argv[i + 2]) else 0)

from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(arg('--root', os.path.dirname(HERE)))
OUT = arg('--out'); LANG = arg('--lang', 'vi'); CHI = arg('--chi')
VIEN = LANG == 'vien'  # mở game ở tiếng Anh, vẽ vài cảnh, đổi sang tiếng Việt rồi mới chụp: phải y hệt bản tiếng Việt
VIVI = LANG == 'vivi'  # đối chứng: cũng vẽ trước 12 cảnh nhưng luôn ở tiếng Việt
if VIEN or VIVI: LANG = 'vi'
os.makedirs(OUT, exist_ok=True)

INIT = r"""
window.__raf = window.requestAnimationFrame; window.requestAnimationFrame = function () { return 0; };
Date.now = () => 1760000000000; performance.now = () => 5000;
try { localStorage.clear(); if ('%s' === 'en') localStorage.setItem('linhkhi_lang', 'en'); } catch (e) {}
""" % ('en' if VIEN else LANG)

HELP = r"""
window.LK = {
  seed(n) { const r = G.srand(n || 777); Math.random = r; G.rnd = r; },
  // chạy n bước rồi vẽ đúng một khung hình
  ve(n) { for (let i = 0; i < (n || 0); i++) { G.tickDraw = false; G.tick(); G.click = null; }
    G.ui.begin(); G.scene.draw(); if (G.theme && G.theme.endFrame) G.theme.endFrame(); G.click = null; },
  save() { G.testSave({ lvl: 14, tier: 1, sharpen: 2, branch: 'fire', marks: 140, gold: 4321 }); const s = G.save;
    s.ore = 57; s.stones = 9; s.mats = [12, 7, 3]; s.shards = [2, 1, 0]; s.stars = { '0-0': 3, '0-1': 2, '0-2': 1 }; s.wins = 3;
    G.newWeapon(s, 'spear', 2); G.newWeapon(s, 'hammer', 3); },
  lang: () => G.LANG || 'vi',
  lang2() { if (G.ngonNgu && G.LANG !== '%s') G.ngonNgu.dat('%s'); },
  lang2x() { if (G.ngonNgu && G.LANG !== 'vi') G.ngonNgu.dat('vi', false); },
  lang2y() { if (G.ngonNgu && '%s' === 'en') G.ngonNgu.dat('en', false); },
  lang0: '%s',
  // G.testSave xoá bản lưu (ngôn ngữ trong bản lưu mất) nên đặt lại ngôn ngữ đang kiểm
  giuLang() { if (G.ngonNgu && G.LANG !== LK.lang0) G.ngonNgu.dat(LK.lang0, false); },
  lang3: 0,
  village(who, more) { LK.seed(); LK.save(); LK.giuLang(); G.time = 100; G.setScene(G.Village); const A = G.villageApi; if (who) A.open(who); if (more) more(A.V, A); },
  stage(r, i, n) { LK.seed(); LK.save(); LK.giuLang(); G.time = 100; G.startStage(r, i, 0, { kind: 'A', seed: 4242 }); const S = G.getRun(); S.fade = 0; S.tut = null; S.hint = null; return S; },
};
""" % (LANG, LANG, LANG, LANG)

# tên cảnh -> mã JS đặt cảnh (chạy xong thì LK.ve(số bước))
CANH = [
    ('01-man-hinh-dau', "LK.seed(); G.resetSave(); LK.giuLang(); G.save.sound = false; G.time = 100; G.setScene(G.Title)", 30),
    ('02-lang', "LK.village()", 40),
    ('03-phong-danh', "LK.stage(0, 1)", 260),
    ('04-tui-do', "LK.village(null, (V) => { V.tab = 'bag'; })", 5),
    ('05-cai-dat', "LK.village('mo')", 5),
]
CANH_EN = [
    ('10-ren', "LK.village('ren', (V) => { V.sel = G.save.carry[0]; })", 5),
    ('11-ren-nang-bac', "LK.village('ren', (V) => { V.ftab = 'tier'; V.sel = G.save.carry[0]; })", 5),
    ('11b-ren-toi-lai', "LK.village('ren', (V) => { V.ftab = 'reforge'; V.sel = G.save.weapons[3].id; })", 5),
    ('11c-ren-do', "LK.village('ren', (V) => { V.ftab = 'craft'; })", 5),
    ('11d-nang-lo', "LK.village('ren', (V) => { V.ftab = 'up'; })", 5),
    ('12-shop', "LK.village('xen')", 5),
    ('12b-shop-do', "LK.village('xen', (V) => { V.gtab = 'outfit'; })", 5),
    ('12c-shop-ban', "LK.village('xen', (V) => { V.gtab = 'sell'; })", 5),
    ('13-may', "LK.village('may')", 5),
    ('13b-may-do', "LK.village('may', (V) => { V.otab = 'craft'; })", 5),
    ('13c-may-canh', "LK.village('may', (V) => { V.otab = 'wing'; })", 5),
    ('14-ky-nang', "LK.village('do')", 5),
    ('15-cay-chuong', "LK.village('do', (V) => { V.tab = 'chuong'; V.dtab = 'chuong'; })", 5),
    ('15b-huong-dan-1', "LK.village('do', (V) => { V.tab = 'help'; V.dtab = 'help'; V.page = 0; })", 5),
    ('15c-huong-dan-2', "LK.village('do', (V) => { V.tab = 'help'; V.dtab = 'help'; V.page = 1; })", 5),
    ('15d-huong-dan-3', "LK.village('do', (V) => { V.tab = 'help'; V.dtab = 'help'; V.page = 2; })", 5),
    ('15e-huong-dan-4', "LK.village('do', (V) => { V.tab = 'help'; V.dtab = 'help'; V.page = 3; })", 5),
    ('15f-huong-dan-5', "LK.village('do', (V) => { V.tab = 'help'; V.dtab = 'help'; V.page = 4; })", 5),
    ('15g-bang-vang', "LK.village('do', (V) => { V.tab = 'rank'; V.dtab = 'rank'; })", 5),
    ('16-anh-hung', "LK.village('tu')", 5),
    ('16b-anh-hung-2', "LK.village('tu', (V) => { V.sel = 'wrestler'; })", 5),
    ('17-ban-do-vung', "LK.village('lai')", 5),
    ('17b-ban-do-ai-trum', "LK.village('lai', (V) => { V.sel = [0, 4]; })", 5),
    ('18-xem-vu-khi', "LK.village(null, (V, A) => { A.viewWeapon(G.save.carry[0], 'hub'); })", 5),
    ('18b-xem-vu-khi-vang', "LK.village(null, (V, A) => { A.viewWeapon(G.save.weapons[3].id, 'hub'); })", 5),
    ('19-tui-vu-khi', "LK.village(null, (V) => { V.tab = 'bag'; G.hanhTrang.tab = 'weapon'; })", 5),
    ('19b-tui-trang-phuc', "LK.village(null, (V) => { V.tab = 'bag'; G.hanhTrang.tab = 'outfit'; })", 5),
    ('19c-tui-linh-khi', "LK.village(null, (V) => { V.tab = 'bag'; G.hanhTrang.tab = 'lk'; })", 5),
    ('19d-tui-ky-nang', "LK.village(null, (V) => { V.tab = 'bag'; G.hanhTrang.tab = 'skill'; })", 5),
    ('19e-tui-tai-nguyen', "LK.village(null, (V) => { V.tab = 'bag'; G.hanhTrang.tab = 'res'; })", 5),
    ('20-tam-dung', "LK.stage(0, 1).mode = 'paused'", 3),
    ('21-ban-do-to', "LK.stage(0, 1).mode = 'map'", 3),
    ('22-thua', "{ const S = LK.stage(0, 1); for (let i = 0; i < 200; i++) { G.tick(); } G.finishStage(false); }", 30),
    ('23-thang', "{ const S = LK.stage(0, 4); G.gotoRoom(S.map.rooms.length - 1, 'boss'); for (let i = 0; i < 200; i++) { G.tick(); } S.loot.bossDown = true; S.loot.finalEl = 'fire'; G.winPortal(); G.finishStage(true); }", 30),
    ('24-phong-trum', "{ const S = LK.stage(0, 4); G.gotoRoom(S.map.rooms.length - 1, 'boss'); }", 200),
    ('25-phong-tinh-anh', "{ const S = LK.stage(1, 2); G.gotoRoom(2, 'elite'); }", 120),
    ('26-phong-thuong-nhan', "{ const S = LK.stage(1, 2); G.gotoRoom(2, 'merchant'); }", 60),
    ('27-phong-ruong', "{ const S = LK.stage(2, 2); G.gotoRoom(2, 'chest'); }", 60),
    ('28-phong-nguyen', "{ const S = LK.stage(2, 2); G.gotoRoom(2, 'curse'); }", 60),
    ('29-phong-suoi', "{ const S = LK.stage(2, 2); G.gotoRoom(2, 'fountain'); }", 60),
    ('30-tui-trong-ai', "LK.stage(0, 1).mode = 'bag'", 3),
    ('31-bang-vang-man-dau', "LK.seed(); G.resetSave(); LK.giuLang(); G.save.sound = false; G.time = 100; G.setScene(G.Title); G.villageApi.V.tRank = true", 5),
    ('32-phong-danh-lau', "LK.stage(1, 3)", 700),
    ('33-gop-y', "LK.village('mo'); if (G.cloudUI) G.cloudUI.feedback({})", 5),
]
CANH = CANH + CANH_EN; CANH_EN = []


def main():
    with sync_playwright() as p:
        br = p.chromium.launch()
        ctx = br.new_context(viewport={'width': 960, 'height': 540}, device_scale_factor=1)
        ctx.route('**/*', lambda r: r.continue_() if r.request.url.startswith('file:') else r.abort())
        pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'ERR_' not in m.text and 'net::' not in m.text else None)
        pg.add_init_script(INIT)
        pg.goto('file://' + ROOT + '/index.html')
        pg.wait_for_function('window.G && G.scene', timeout=20000)
        pg.add_script_tag(path=os.path.join(HERE, 'setup.js'))
        pg.evaluate(HELP)
        if LANG == 'en':  # ghi mọi chuỗi vẽ ra mà KHÔNG đi qua bản dịch nào (để soát chữ Việt không dấu còn sót: "Kho", "Mua"…)
            pg.evaluate(r"""(() => { const ok = new Set(), raw = LK.raw = new Set();
              const note = (v) => { if (typeof v === 'string') { ok.add(v); ok.add(v.trim()); } return v; };
              for (const k of ['t', 'tc', 'tv']) { const f = G[k]; G[k] = function () { return note(f.apply(this, arguments)); }; }
              const w = G.ui.wrap; G.ui.wrap = function () { const a = w.apply(this, arguments); a.forEach(note); return a; };
              const c = G.ux, f = c.fillText; c.fillText = function (t) { if (typeof t === 'string' && /[A-Za-z]{2}/.test(t) && !ok.has(t) && !ok.has(t.trim()) && !G.ngonNgu.D.has(t) && !G.ngonNgu.D.has(t.trim())) raw.add(t); return f.apply(this, arguments); };
            })()""")
        pg.wait_for_timeout(1500)  # ảnh AI (dữ liệu nhúng) giải mã xong
        if VIEN or VIVI:
            for ten, js, n in CANH[:12]: pg.evaluate("LK.lang0 = '%s'" % ('en' if VIEN else 'vi')); pg.evaluate(js); pg.evaluate('LK.ve(%d)' % n)
            pg.evaluate("LK.lang0 = 'vi'; G.ngonNgu.dat('vi')")
            print('đã vẽ 12 cảnh ở tiếng Anh rồi đổi sang tiếng Việt; lang trong máy =', pg.evaluate("localStorage.getItem('linhkhi_lang')"))
        extra = []
        p2 = os.path.join(HERE, 'ngon_ngu_canh.json')
        ds = CANH + (CANH_EN if LANG == 'en' else [])
        if LANG == 'en' and os.path.exists(p2): ds += [tuple(x) for x in json.load(open(p2, encoding='utf-8'))]
        for ten, js, n in ds:
            if CHI and not any(c in ten for c in CHI.split(',')): continue
            try:
                pg.evaluate(js); pg.evaluate('LK.ve(%d)' % n); pg.wait_for_timeout(60); pg.evaluate('LK.ve(0)')
            except Exception as e:
                errs.append('CẢNH %s: %s' % (ten, str(e)[:300]))
            pg.screenshot(path=os.path.join(OUT, ten + '.png'))
            print('chụp', ten)
        if LANG == 'en':
            th = pg.evaluate('[...G.ngonNgu.thieu]')
            print('--- G.ngonNgu.thieu: %d' % len(th))
            for s in th: print('  ' + json.dumps(s, ensure_ascii=False))
            raw = pg.evaluate('[...LK.raw]')
            print('--- chuỗi vẽ thẳng không qua bản dịch: %d' % len(raw))
            for t in raw: print('  ' + json.dumps(t, ensure_ascii=False))
        print('--- lỗi console: %d' % len(errs))
        for e in errs[:40]: print('  ' + e[:300])
        br.close()


main()
