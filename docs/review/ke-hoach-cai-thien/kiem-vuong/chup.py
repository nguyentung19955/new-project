"""KIẾM VUÔNG — chụp HUD / túi đồ / Lò rèn / Luyện (17/10). KHÔNG chơi thử: dựng cảnh tĩnh headless rồi chụp (cách vu-khi-chatgpt/chup_soat_c.py).
Chạy từ gốc repo sau khi build:  python3 docs/review/ke-hoach-cai-thien/kiem-vuong/chup.py
Ra: so-<cảnh>.png (trái cũ ?kiemvuong=0, phải mới; trên cấp 1, dưới cấp 4); ảnh lẻ ở anh/ (không lưu vào repo); in lỗi JS."""
import io, os, sys
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'anh')
GAME = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', 'game'))
URL = 'file://' + GAME + '/dist/linh-khi.html?cloud=0'
DUNG = r'''
(cap) => {
  G.testSave({ lvl: 12 }); G.save.sound = false;
  const sv = G.save; if (G.vkMoi && G.vkMoi.chuan) G.vkMoi.chuan(sv);
  const w = sv.weapons.find((q) => q.type === 'sword'); G.vkMoi.datCap(w, cap, cap ? 'fire' : null);
  sv.equip = sv.equip || {}; try { sv.heroes[sv.hero].weapon = w.id; } catch (e) {}
  sv.linhKhi = 500; G.persist(); G.setScene(G.Village);
  return [G.wStage(w), G.wName(w)];
}
'''
CANH = [
    ('lo-ren', "() => { const V = G.villageApi; V.goHub(); V.open('ren'); V.V.ftab = 'vk'; G.hinhThai && (G.hinhThai.lo.sel = G.save.weapons.find((w) => w.type === 'sword').id); }"),
    ('luyen', "() => { const V = G.villageApi; V.goHub(); V.open('ren'); V.V.ftab = 'luyen'; }"),
    ('tui-do', "() => { const V = G.villageApi; V.goHub(); V.open('xen'); }"),
    ('xem-vk', "() => { const V = G.villageApi; V.goHub(); V.V.wid = G.save.weapons.find((w) => w.type === 'sword').id; V.V.back = 'hub'; V.V.tab = 'weapon'; }"),
    ('hud-tran', "() => { G.startStage(0, 0, 0, { kind: 'A', seed: 4242 }); const S = G.getRun(); S.fade = 0; S.tut = null; S.hint = null; }"),
]


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


def main():
    os.makedirs(OUT, exist_ok=True)
    loi = []
    with sync_playwright() as p:
        for nhan, co in (('moi', ''), ('cu', '&kiemvuong=0')):
            pg, errs = mo(p, URL + co)
            print(nhan, 'kiếm vuông:', pg.evaluate("() => !!(G.spriteCustom.kiemVuong && G.spriteCustom.kiemVuong())"))
            for cap in (0, 3):
                print(' ', pg.evaluate(DUNG, cap))
                for ten, js in CANH:
                    pg.evaluate(js); pg.wait_for_timeout(900)
                    pg.screenshot(path=os.path.join(OUT, '%s-cap%d-%s.png' % (ten, cap + 1, nhan)))
                    if ten == 'hud-tran':
                        pg.evaluate(DUNG, cap); pg.wait_for_timeout(300)
            loi += [nhan + ': ' + e for e in errs]
            pg.context.browser.close()
    # ghép so sánh: mỗi cảnh một hàng, trái cũ phải mới, cấp 1 rồi cấp 4
    for ten, _ in CANH:
        ims = [Image.open(os.path.join(OUT, '%s-cap%d-%s.png' % (ten, c, n))).convert('RGB') for c in (1, 4) for n in ('cu', 'moi')]
        W, H = 480, 270
        g = Image.new('RGB', (W * 2, (H + 16) * 2), (20, 18, 24)); d = ImageDraw.Draw(g)
        for i, im in enumerate(ims):
            x, y = (i % 2) * W, (i // 2) * (H + 16)
            g.paste(im.resize((W, H), Image.LANCZOS), (x, y + 16))
            d.text((x + 6, y + 2), '%s · cấp %d' % ('CŨ (?kiemvuong=0)' if i % 2 == 0 else 'MỚI (kiếm vuông)', 1 if i < 2 else 4), fill=(240, 230, 200))
        g.save(os.path.join(HERE, 'so-%s.png' % ten))
    print('lỗi JS:', loi[:10] or 'không có')
    return 1 if loi else 0


if __name__ == '__main__':
    sys.exit(main())
