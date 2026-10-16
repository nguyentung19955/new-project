"""Ảnh soát bao-cao-C (16/10): hình thái vũ khí. KHÔNG chơi thử: chỉ dựng cảnh tĩnh (headless) rồi chụp.
Chạy từ thư mục game sau khi build:  python3 ../docs/review/ke-hoach-cai-thien/vu-khi-chatgpt/chup_soat_c.py
Ra (anh-soat/): c-lo-ren-*.png (điện thoại ngang 960×540), c-an-mung.png (6 khung ghép), c-ket-qua.png, c-lo-ren-tat.png (?hinhthai=0),
c-lo-ren-en.png, c-xem-vk.png. In lỗi JS và chuỗi tiếng Anh còn thiếu (nếu có)."""
import os, sys
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'anh-soat')
GAME = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', 'game'))
URL = 'file://' + GAME + '/dist/linh-khi.html?cloud=0'

DUNG = r'''
(lk) => {
  G.testSave({ lvl: 12 }); G.save.sound = false;
  const sv = G.save; if (G.vkMoi && G.vkMoi.chuan) G.vkMoi.chuan(sv);
  const by = (t) => sv.weapons.find((w) => w.type === t);
  const dat = (t, st, el) => { const w = by(t); if (w) G.vkMoi.datCap(w, st, el); };
  dat('sword', 1, 'fire'); dat('spear', 0, null); dat('hammer', 2, 'ice'); dat('bow', 3, 'poison');
  sv.linhKhi = lk; G.persist();
  G.setScene(G.Village);
  return sv.weapons.map((w) => [w.type, G.wStage(w), G.wName(w)]);
}
'''


def mo(p, url):
    pg = p.chromium.launch().new_page(viewport={'width': 960, 'height': 540}, is_mobile=True, has_touch=True)
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'ERR_' not in m.text and 'fonts.g' not in m.text else None)
    pg.goto(url)
    pg.wait_for_function('window.G && G.scene')
    pg.add_script_tag(path=os.path.join(GAME, 'tests', 'setup.js'))
    pg.wait_for_timeout(400)
    pg.wait_for_function("() => { const z = G.spriteCustom && G.spriteCustom.zed; const q = z && z['zed-vk']; if (q && !q.ready && G.spriteCustom.canAnh) G.spriteCustom.canAnh('zed-vk'); return !!(q && q.ready); }", timeout=60000)
    return pg, errs


def lo(pg, sel, ten):
    pg.evaluate("(t) => { const V = G.villageApi; V.goHub(); V.open('ren'); V.V.ftab = 'vk'; G.hinhThai && (G.hinhThai.lo.sel = G.save.weapons.find((w) => w.type === t).id); }", sel)
    pg.wait_for_timeout(900)
    pg.screenshot(path=os.path.join(OUT, ten))


def main():
    os.makedirs(OUT, exist_ok=True)
    allerr = []
    with sync_playwright() as p:
        pg, errs = mo(p, URL)
        print('vũ khí', pg.evaluate(DUNG, 200))
        pg.wait_for_timeout(500)
        lo(pg, 'sword', 'c-lo-ren-1.png')   # Mầm → Thành hình, chưa đủ (bóng + khoá)
        lo(pg, 'spear', 'c-lo-ren-2.png')   # Trắng → Mầm, đủ (chọn hệ)
        lo(pg, 'bow', 'c-lo-ren-3.png')     # Thức tỉnh (hình thái cuối)
        # màn Xem vũ khí (tên hình thái + dòng cấp kế)
        pg.evaluate("() => { const V = G.villageApi; V.goHub(); V.V.wid = G.save.weapons.find((w) => w.type === 'hammer').id; V.V.back = 'hub'; V.V.tab = 'weapon'; }")
        pg.wait_for_timeout(700)
        pg.screenshot(path=os.path.join(OUT, 'c-xem-vk.png'))
        # ăn mừng: nâng búa Thành hình → Thức tỉnh, dừng đồng hồ game rồi chụp từng thời điểm
        pg.evaluate("() => { const V = G.villageApi; V.goHub(); V.open('ren'); V.V.ftab = 'vk'; G.save.linhKhi = 2000; const w = G.save.weapons.find((q) => q.type === 'hammer'); G.hinhThai.lo.sel = w.id; }")
        pg.wait_for_timeout(600)
        ok = pg.evaluate("() => { const w = G.save.weapons.find((q) => q.type === 'hammer'); const r = G.vkMoi.nang(G.save, w); window.__tick = G.tick; G.tick = () => {}; return [r, !!G.hinhThai.am.on, G.wStage(w)]; }")
        print('nâng', ok)
        khung = []
        for t in (0.08, 0.3, 0.55, 0.92, 1.05, 1.3):
            pg.evaluate("(t) => { G.hinhThai.am.on.t0 = G.time - t; }", t)
            pg.wait_for_timeout(250)
            khung.append((t, Image.open(__import__('io').BytesIO(pg.screenshot())).convert('RGB')))
        W, H = 480, 270
        g = Image.new('RGB', (W * 3, (H + 16) * 2), (20, 18, 24))
        d = ImageDraw.Draw(g)
        for i, (t, im) in enumerate(khung):
            x, y = (i % 3) * W, (i // 3) * (H + 16)
            g.paste(im.resize((W, H)), (x, y + 16))
            d.text((x + 6, y + 2), f't = {t:.2f} s', fill=(240, 230, 200))
        g.save(os.path.join(OUT, 'c-an-mung.png'))
        pg.evaluate("() => { G.hinhThai.am.on = null; G.tick = window.__tick; }")
        # màn kết quả (thắng ải 1-2, đang cầm kiếm)
        pg.evaluate("""() => { G.testSave({ lvl: 12 }); const sv = G.save; G.vkMoi.chuan && G.vkMoi.chuan(sv); for (let i = 0; i < 5; i++) sv.stars['0-' + i] = 2;
          G.vkMoi.datCap(sv.weapons.find((w) => w.type === 'sword'), 1, 'fire'); sv.linhKhi = 150;
          G.startStage(0, 1, 0, { kind: 'A', seed: 4242 }); const S = G.getRun(); S.fade = 0; S.tut = null; S.hint = null;
          G.gotoRoom(S.map.boss); G.finishStage(true); S.modeT = -9; }""")
        pg.wait_for_timeout(900)
        pg.screenshot(path=os.path.join(OUT, 'c-ket-qua.png'))
        allerr += errs
        # tiếng Anh
        pg.evaluate("() => G.ngonNgu.dat('en', false)")
        pg.evaluate(DUNG, 200)
        pg.wait_for_timeout(300)
        pg.evaluate("() => G.ngonNgu.thieu.clear()")
        lo(pg, 'sword', 'c-lo-ren-en.png')
        lo(pg, 'spear', 'c-lo-ren-en-2.png')
        thieu = pg.evaluate("() => Array.from(G.ngonNgu.thieu)")
        print('EN còn thiếu:', thieu[:30])
        pg.context.browser.close()
        # cờ tắt
        pg, errs = mo(p, URL + '&hinhthai=0')
        print('tắt', pg.evaluate("() => G.HINH_THAI_BAT"), pg.evaluate(DUNG, 200))
        lo(pg, 'sword', 'c-lo-ren-tat.png')
        allerr += errs
        pg.context.browser.close()
    print('lỗi JS:', allerr[:10] or 'không có')
    return 1 if allerr else 0


if __name__ == '__main__':
    sys.exit(main())
