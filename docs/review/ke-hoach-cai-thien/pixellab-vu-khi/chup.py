"""VŨ KHÍ PIXELLAB (?vkpl=1) — chụp headless 844×390 Rowan cầm từng vũ khí (đứng + đang đánh) ở ảnh cũ và ảnh PixelLab, cấp Trắng → Thức tỉnh.
KHÔNG chơi thử: dựng phòng tĩnh (tests/setup.js + T.room như bua-khop-2/chup.py) rồi chụp. Chạy từ gốc repo sau khi build hai tệp:
  python3 docs/review/ke-hoach-cai-thien/pixellab-vu-khi/chup.py
Ra: tren-tay-<loại>.png (mỗi hàng một cấp: cũ đứng | cũ đánh | PixelLab đứng | PixelLab đánh), o-do.png (Lò rèn / túi đồ), in lỗi JS."""
import io, os, sys, subprocess, time
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..'))
DIST = os.path.join(ROOT, 'game', 'dist'); TESTS = os.path.join(ROOT, 'game', 'tests')
PORT = int(os.environ.get('PORT', '8827'))
LIB = open(os.path.join(ROOT, 'docs', 'review', 'ke-hoach-cai-thien', 'bua-khop-2', 'lib.js')).read()
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 12)
LOAI = [('kiem', 'sword'), ('thuong', 'spear'), ('bua', 'hammer'), ('phitieu', 'bow')]
CAP = [(0, None, 'Trắng'), (1, 'fire', 'Mầm Lửa'), (2, 'poison', 'Thành hình Độc'), (3, 'ice', 'Thức tỉnh Băng')]
DUNG = r'''([melee, bow, cap, he]) => {
  T.room({ hero: 'smith', melee: bow ? 'sword' : melee, face: 1, bow, dum: [[60, 0]] });
  const P = T.P, sv = G.save, w = sv.weapons.find((q) => q.type === melee);
  G.vkMoi.datCap(w, cap, he); if (G.luyen && G.luyen.bat()) w.luyen = [1, 3, 6, 12][cap];
  T.hold({}, 20); P.face = 1;
  return [G.wStage(w), w.branch, G.vkPl ? G.vkPl() : null];
}'''


def mo(b, co):
    pg = b.new_page(viewport={'width': 844, 'height': 390}, device_scale_factor=2, is_mobile=True, has_touch=True)
    errs = []
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
    pg.goto('http://127.0.0.1:%d/linh-khi-nhe.html?cloud=0%s' % (PORT, co))
    pg.wait_for_function('window.G && G.scene', timeout=60000)
    pg.wait_for_function("() => { const SC = G.spriteCustom, z = SC && SC.zed; for (const m of ['zed-vk', 'zed-vk-he', 'zed-moi']) { const q = z && z[m]; if (q && !q.ready && SC.canAnh) SC.canAnh(m); if (!(q && q.ready)) return false; } return true; }", timeout=90000)
    if co:
        pg.wait_for_function("() => { const v = G.vkPl && G.vkPl(); return v && v.vk && v.he; }", timeout=90000)
    pg.add_script_tag(path=os.path.join(TESTS, 'bot.js'))
    pg.add_script_tag(path=os.path.join(TESTS, 'setup.js'))
    pg.evaluate("() => { G.testSave({ melee: 'sword' }); G.startStage(0, 2, 0); }")  # tải trước ảnh vùng Rừng (ChoVung) để T.room vào ải ngay
    pg.wait_for_function("() => !!G.getRun()", timeout=90000)
    pg.wait_for_timeout(1500)
    pg.evaluate("window.requestAnimationFrame = () => 0")
    pg.evaluate(LIB)
    return pg, errs


def cat(pg, x, y):
    box = pg.evaluate("(() => { const c = document.querySelector('canvas'); const r = c.getBoundingClientRect(); return [r.left, r.top, r.width / 480, G.getWorld().cam]; })()")
    hw, hh = 46, 34
    clip = {'x': box[0] + (x - box[3] - hw) * box[2], 'y': box[1] + (y - 14 - hh) * box[2], 'width': 2 * hw * box[2], 'height': 2 * hh * box[2]}
    im = Image.open(io.BytesIO(pg.screenshot(clip=clip))).convert('RGB')
    return im.resize((im.width * 3 // 2, im.height * 3 // 2), Image.NEAREST)


def main():
    srv = subprocess.Popen([sys.executable, os.path.join(ROOT, 'docs', 'review', 'kiem-thu-12-10', 'srv.py'), DIST, str(PORT)], stderr=subprocess.DEVNULL)
    time.sleep(0.8)
    loi, anh, info = [], {}, []
    try:
        with sync_playwright() as p:
            b = p.chromium.launch()
            for nhan, co in (('cu', ''), ('pl', '&vkpl=1')):
                pg, errs = mo(b, co)
                for loai, melee in LOAI:
                    for cap, he, ten in CAP:
                        info.append((nhan, loai, pg.evaluate(DUNG, [melee, melee == 'bow', cap, he])))
                        P = pg.evaluate('[T.P.x, T.P.y]')
                        anh[(nhan, loai, cap, 'dung')] = cat(pg, *P)
                        pg.evaluate("T.hold({atkP:true,atk:true},1)"); pg.evaluate("T.hold({}, %d)" % (4 if melee != 'hammer' else 9))
                        P = pg.evaluate('[T.P.x, T.P.y]')
                        anh[(nhan, loai, cap, 'danh')] = cat(pg, *P)
                # ô đồ: Lò rèn và túi đồ với kiếm Thức tỉnh Băng
                pg.evaluate("() => { G.testSave({ lvl: 12 }); const sv = G.save; const w = sv.weapons.find((q) => q.type === 'sword'); G.vkMoi.datCap(w, 3, 'ice'); sv.linhKhi = 500; G.persist(); G.setScene(G.Village); }")
                pg.wait_for_timeout(600)
                pg.evaluate("() => { const V = G.villageApi; V.goHub(); V.open('ren'); V.V.ftab = 'vk'; G.hinhThai && (G.hinhThai.lo.sel = G.save.weapons.find((w) => w.type === 'sword').id); }")
                pg.evaluate("() => { for (let i = 0; i < 6; i++) { G.tick && G.tick(); G.ui.begin(); G.scene.draw(); } }")
                pg.screenshot(path=os.path.join(HERE, 'anh-lo-ren-%s.png' % nhan))
                loi += [nhan + ': ' + e for e in errs + pg.evaluate('T.errs')]
                pg.close()
            b.close()
    finally:
        srv.kill()
    for x in info:
        print(x)
    for loai, _ in LOAI:
        w, h = anh[('cu', loai, 0, 'dung')].size
        g = Image.new('RGB', (4 * (w + 4) + 4, 22 + len(CAP) * (h + 18)), (20, 16, 18)); d = ImageDraw.Draw(g)
        for i, t in enumerate(['CŨ · đứng', 'CŨ · đánh', 'PIXELLAB · đứng', 'PIXELLAB · đánh']):
            d.text((8 + i * (w + 4), 4), t, font=F, fill=(255, 210, 122))
        for r, (cap, he, ten) in enumerate(CAP):
            for i, k in enumerate([('cu', 'dung'), ('cu', 'danh'), ('pl', 'dung'), ('pl', 'danh')]):
                x, y = 4 + i * (w + 4), 22 + r * (h + 18)
                g.paste(anh[(k[0], loai, cap, k[1])], (x, y)); d.text((x + 3, y + h + 2), ten, font=F, fill=(230, 220, 200))
        g.save(os.path.join(HERE, 'tren-tay-%s.png' % loai))
    a, c = Image.open(os.path.join(HERE, 'anh-lo-ren-cu.png')), Image.open(os.path.join(HERE, 'anh-lo-ren-pl.png'))
    g = Image.new('RGB', (a.width // 2 + c.width // 2 + 8, a.height // 2), (20, 16, 18))
    g.paste(a.resize((a.width // 2, a.height // 2)), (0, 0)); g.paste(c.resize((c.width // 2, c.height // 2)), (a.width // 2 + 8, 0))
    g.save(os.path.join(HERE, 'lo-ren-cu-pl.png'))
    for f in ('anh-lo-ren-cu.png', 'anh-lo-ren-pl.png'):
        os.remove(os.path.join(HERE, f))
    print('lỗi JS:', loi[:10] or 'không có')
    return 1 if loi else 0


if __name__ == '__main__':
    sys.exit(main())
