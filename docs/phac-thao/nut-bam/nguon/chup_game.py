"""Chụp game thật có bộ nút mới (trang thu.html) ở cỡ điện thoại.
Dùng: python3 chup_game.py [url trang thử] [thư mục ra] [tiền tố tên file] [--them]"""
import sys, os
from playwright.sync_api import sync_playwright
here = os.path.dirname(os.path.abspath(__file__))
THEM = '--them' in sys.argv  # chụp thêm ba hero còn lại
sys.argv = [a for a in sys.argv if a != '--them']
url = sys.argv[1] if len(sys.argv) > 1 else 'file://' + os.path.join(here, 'thu.html')
out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(here, '..')
pre = sys.argv[3] if len(sys.argv) > 3 else 'trong-game'
# Bản lưu giàu: kiếm hệ Lửa mốc 2, cung hệ Băng. Vào một phòng đánh quái ở Lâu đài cổ.
VAO = """(hero) => { G.resetSave(); const sv = G.save; sv.sound = false; sv.tut.done = true;
  for (const k of G.HKEYS) { sv.heroes[k].unlocked = true; sv.heroes[k].lvl = 12; }
  sv.hero = hero || 'smith';
  const w = G.weaponById(sv.carry[0]); w.marks.fire = 140; w.branch = 'fire'; w.tier = 2; w.sharpen = 6;
  const b = G.weaponById(sv.carry[1]); b.marks.ice = 40; b.branch = 'ice'; b.tier = 1;
  G.rnd = G.srand(11); G.startStage(2, 2, 0); G.gotoRoom(1); G.sim(150);
  const S = G.getRun(); S.P.mana = S.P.maxmana; S.P.hp = S.P.maxhp; }"""
DUNG = "() => { G.tick = function () {}; }"  # đứng hình để chụp cho đúng trạng thái
with sync_playwright() as p:
    br = p.chromium.launch()
    ctx = br.new_context(viewport={'width': 844, 'height': 390}, has_touch=True, is_mobile=True, device_scale_factor=3)
    pg = ctx.new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append('LỖI ' + str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'ERR_' not in m.text and 'fonts.g' not in m.text else None)
    pg.goto(url)
    pg.wait_for_function('window.G && G.scene')
    def shot(name):
        pg.wait_for_timeout(250)
        pg.screenshot(path=os.path.join(out, pre + name + '.png'))
    # 1. đang chơi bình thường
    pg.evaluate(VAO, 'smith'); pg.wait_for_timeout(300)
    pg.evaluate(DUNG); shot('')
    # 2. đang hồi: vừa lộn, vừa dùng kỹ năng, vừa tung đòn đặc biệt, thiếu mana, vừa đổi vũ khí
    pg.reload(); pg.wait_for_function('window.G && G.scene')
    pg.evaluate(VAO, 'smith'); pg.wait_for_timeout(200)
    pg.evaluate("""() => { const P = G.getRun().P; P.skillCd = 3.4; P.dodgeCd = 0.55 * P.dodgeCdMax; P.specCd = 0; P.mana = 12; P.swapCd = 0.9; P.potions = 0; P.coats[G.curW(P).id] = { el: 'fire', t: 4.4 }; G.sim(1); }""")
    pg.evaluate(DUNG); shot('-dang-hoi')
    # 3. các hero khác và vũ khí khác (ảnh phụ)
    if THEM:
        for hero, cur in [('hunter', 1), ('healer', 0), ('wrestler', 1)]:
            pg.reload(); pg.wait_for_function('window.G && G.scene')
            pg.evaluate(VAO, hero); pg.evaluate("(c) => { G.getRun().P.cur = c; G.sim(2); }", cur)
            pg.evaluate(DUNG); shot('-' + hero)
    print('lỗi:', errs[:5])
    br.close()
