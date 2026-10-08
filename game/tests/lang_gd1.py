"""Giai đoạn 1: nạp hai tệp mới (ui_theme.js, village_scene.js) lên game đang có rồi chụp ảnh để duyệt.
   python3 tests/lang_gd1.py            -> chụp mọi ảnh vào docs/giao-dien-va-lang/
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright
from ui_lib import Game, ROOT

OUT = os.path.join(os.path.dirname(ROOT), 'docs', 'giao-dien-va-lang')
os.makedirs(OUT, exist_ok=True)


DEMO = r"""
(() => {
  const T = G.theme, ui = G.ui;
  G.ThemeDemo = { update() {}, draw() {
    const c = G.wx; c.setTransform(1,0,0,1,0,0); c.fillStyle = '#241d2b'; c.fillRect(0,0,480,270);
    const sv = G.save;
    T.topBar(G.villageScene.resParts(), 'Thợ Rèn · cấp 14');
    const L = (s, x, y) => ui.text(s, x, y, { size: 6.5, color: '#b8b0c8' });
    // nút to
    L('Nút to: thường, đang bấm, mờ, nút chính', 8, 26);
    T.btn(8, 30, 72, 26, 'Bắt đầu');
    G.pointers.set(99, { x: 120, y: 40, sx: 120, sy: 40, role: null, stale: false });
    T.btn(86, 30, 72, 26, 'Bắt đầu'); G.pointers.delete(99);
    T.btn(164, 30, 72, 26, 'Bắt đầu', { disabled: true });
    T.btn(8, 62, 72, 28, 'Lên đò', { primary: true, size: 11 });
    T.btn(86, 62, 150, 28, 'Rồng: Vàng x1,6', { gold: true, sub: '300 vàng, 4 mảnh trùm', subSize: 6.5, size: 8.5 });
    // nút nhỏ, thẻ mục
    L('Nút nhỏ, thẻ chuyển mục, nút tròn', 8, 102);
    T.sbtn(8, 106, 40, 18, 'Xem'); T.sbtn(54, 106, 40, 18, 'Đổi', { sel: true }); T.sbtn(100, 106, 62, 18, 'Bán 60 vàng', { danger: true, size: 7 }); T.sbtn(168, 106, 44, 18, 'Học', { disabled: true });
    ['Mài', 'Nâng bậc', 'Tôi lại', 'Rèn đồ'].forEach((t, i) => T.tab(8 + i * 58, 130, 55, 20, t, i === 1, { dot: i === 2 }));
    T.round(30, 180, 20, 'atk'); T.round(76, 180, 20, 'skill'); T.round(122, 180, 20, 'sp'); T.round(168, 180, 20, 'dodge'); 
    T.round(216, 178, 26, 'talk', { lit: true, label: 'Nói chuyện' });
    // thanh
    L('Máu, mana, kinh nghiệm, máu trùm', 8, 214);
    T.bar(8, 218, 110, 'hp', 121 / 168, '121/168'); T.bar(8, 230, 96, 'mana', 0.5, '60/120'); T.bar(124, 220, 110, 'xp', 0.35, null, { h: 6 }); T.bar(124, 230, 110, 'boss', 0.62, 'Mộc Tinh', { h: 10 });
    T.toast(8, 246, 228, 'Đã mài Gươm Rồng Xích Diệm lên +5');
    // bảng
    T.panel(246, 22, 226, 96, 'Thương nhân', { rightPad: 62 });
    T.sbtn(410, 26, 56, 16, '✕ Xong', { size: 7.5 });
    T.inset(254, 48, 210, 24, true); ui.text('Bình máu lớn · 120 vàng', 260, 63, { size: 8.5, bold: true });
    T.inset(254, 76, 210, 24, false); ui.text('Bùa lửa · 80 vàng', 260, 91, { size: 8.5, bold: true, color: '#a9c2b4' });
    // ô đồ
    L('Ô đồ bốn bậc', 246, 130);
    ['Thường', 'Lam', 'Tím', 'Vàng'].forEach((n, i) => { const x = 246 + i * 34; T.slot(x, 134, 26, i, { sel: i === 2 });
      G.art.weaponIcon(G.ux, sv.weapons[i % sv.weapons.length], x + 13, 147, 18, 'idle'); ui.text(n, x + 13, 170, { size: 7, bold: true, align: 'center', color: T.RAR_TEXT[i] }); });
    // thẻ ải
    L('Thẻ ải: đã qua, đang chọn, mới mở, chưa mở, trùm', 246, 180);
    T.stageCard(244, 182, 44, 50, 1, 'done', 3); T.stageCard(290, 182, 44, 50, 2, 'sel', 2); T.stageCard(336, 182, 44, 50, 3, 'open', 0); T.stageCard(382, 182, 44, 50, 4, 'lock', 0); T.stageCard(428, 180, 48, 54, 5, 'done', 1, { boss: true });
    // thẻ kết quả và khung thoại
    T.card(388, 128, 84, 44, { rar: 2, title: 'Nhặt được' }); ui.text('Cung Đèn Ông Sao', 395, 158, { size: 7.5, bold: true, color: T.RAR_TEXT[2] });
    T.dialog(246, 240, 226, 'Ông Thợ Rèn', 'Đưa đây ông xem lưỡi nào!', { tail: -1 });
  } };
  G.setScene(G.ThemeDemo);
})()
"""

def load(g):
    for n in ('ui_theme.js', 'village_scene.js'):
        pth = os.path.join(ROOT, 'js', n)
        if os.path.exists(pth) and not g.ev("!!document.querySelector('script[data-n=\"%s\"]')" % n):
            g.pg.add_script_tag(path=pth)
    g.wait(100)

def main():
    with sync_playwright() as p:
        g = Game(p, 'phone')
        load(g)
        g.ev("""(() => { const s = G.save; s.gold = 3200; s.heroes.smith.lvl = 14; for (const k of G.HKEYS) s.heroes[k].unlocked = k !== 'wrestler'; s.ore = 46; s.stones = 5; s.mats = [24, 18, 9]; s.tut.lang = { hint: 1, lai: 99, xen: 99, may: 99, tu: 99, mo: 1 };
            s.heroes.smith.sk = { atk: 1, def: 0, elem: 0 }; G.setScene(G.VillageDemo); })()""")
        g.wait(1800)
        g.pg.screenshot(path=os.path.join(OUT, 'lang-trong-game.png'))
        # đầu bên trái của làng
        g.ev("(() => { const S = G.villageScene.state; S.path = null; S.x = 150; S.y = 158; S.cam = 0; S.face = -1; })()")
        g.wait(500)
        g.pg.screenshot(path=os.path.join(OUT, 'lang-dau-trai.png'))
        g.ev(DEMO); g.wait(500)
        g.pg.screenshot(path=os.path.join(OUT, 'bo-giao-dien.png'))
        if g.errs: print('LỖI:', g.errs); sys.exit(1)
        print('đã chụp')
        g.browser.close()

main()
