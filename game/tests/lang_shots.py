"""Chụp ảnh từng màn hình của bộ giao diện trống đồng và làng có người để duyệt bằng mắt.
Ảnh lưu vào docs/giao-dien-va-lang/. Chạy từ thư mục game:
   python3 tests/lang_shots.py              -> chụp đủ bộ
   python3 tests/lang_shots.py ten-anh ...  -> chỉ chụp các ảnh có tên chứa một trong các chữ đó
Cần Playwright và Chromium."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright
import ui_lib
from ui_lib import Game, ROOT

OUT = os.path.join(os.path.dirname(ROOT), 'docs', 'giao-dien-va-lang')
os.makedirs(OUT, exist_ok=True)
ONLY = sys.argv[1:]
# cỡ điện thoại ngang, ảnh phóng 2 lần cho nhẹ; và cỡ cầm dọc (game tự xoay ngang)
ui_lib.SIZES['dt'] = dict(viewport={'width': 844, 'height': 390}, has_touch=True, is_mobile=True, device_scale_factor=2)
ui_lib.SIZES['doc'] = dict(viewport={'width': 390, 'height': 844}, has_touch=True, is_mobile=True, device_scale_factor=2)

RICH = """(() => { G.resetSave(); const s = G.save; s.sound = false; s.gold = 3200; s.ore = 46; s.stones = 5; s.mats = [24, 18, 9]; s.shards = [4, 2, 0];
  s.heroes.smith.lvl = 14; s.heroes.smith.sk = { atk: 2, def: 1, elem: 0 }; s.heroes.hunter.unlocked = true; s.heroes.hunter.lvl = 6; s.heroes.healer.unlocked = true; s.heroes.healer.lvl = 3;
  const a = G.weaponById(s.carry[0]); a.rarity = 2; a.marks.fire = 130; a.branch = 'fire'; a.sharpen = 4; G.fitAffixes(a);
  const b = G.weaponById(s.carry[1]); b.rarity = 1; b.marks.ice = 64; b.branch = 'ice'; b.sharpen = 2; G.fitAffixes(b);
  G.newWeapon(s, 'spear', 0, { family: 2 }); G.newWeapon(s, 'hammer', 3, { gold: 1, family: 5 }); G.newWeapon(s, 'sword', 1, { family: 6 }); G.newWeapon(s, 'bow', 0, { family: 7 }); G.newWeapon(s, 'hammer', 0, { family: 1 });
  s.owned.helm = ['h_r1', 'h_moc']; s.helm = 'h_r1'; s.owned.armor = ['a_r1']; s.armor = 'a_r1'; s.owned.charm = ['c_mist']; s.charm = 'c_mist';
  for (let i = 0; i < 7; i++) s.stars[Math.floor(i / 5) + '-' + (i % 5)] = 1 + ((i * 2) % 3);
  s.tut.done = true; G.setScene(G.Village); })()"""
ACT = "(a) => { const S = G.getRun(), pr = S.W.props.find((p) => p.act === a); S.P.x = pr.x - 10; S.P.y = pr.y + 4; S.prop = pr; }"

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



def main():
    with sync_playwright() as p:
        g = Game(p, 'dt')
        g.pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
        ev = g.ev
        V, VS = 'G.villageApi.V', 'G.villageScene'
        def shot(name, wait=250):
            if ONLY and not any(o in name for o in ONLY): return
            g.wait(wait); g.pg.screenshot(path=os.path.join(OUT, name + '.png')); print('đã chụp', name)
        def talk(k): ev(f"{VS}.goNpc('{k}', true)"); g.wait(450)
        def home(): ev("G.keyP.Escape = true"); g.wait(200)

        g.wait(600); shot('01-tieu-de')
        g.tap(240, 150); g.wait(1600); shot('01b-lan-dau-vao-lang'); g.wait(9000); shot('01c-lan-dau-chi-duong-toi-lai-do')
        ev(RICH); g.wait(1700)
        shot('lang-trong-game'); shot('02-lang-dau-phai-vua-xuong-do')
        ev(f"(() => {{ const S = {VS}.state, N = {VS}.NPCS.ren; S.x = N.den[0]; S.y = N.den[1]; S.face = 1; S.path = null; }})()"); g.wait(900)
        shot('03-toi-gan-nut-noi-chuyen')
        ev(f"(() => {{ const S = {VS}.state; S.x = 250; S.y = 170; S.face = -1; S.cam = 10; S.path = null; }})()"); g.wait(900)
        shot('04-lang-dau-trai')
        x, y = ev(f"{VS}.stripAt(2)"); g.tap(x, y, 500); shot('05-cham-khuon-mat-em-be-tu-chay', 100)
        g.wait(3500); home()
        g.tap(10, 7); shot('06-cham-bieu-tuong-hien-ten', 150)
        g.wait(2000)
        # từng người và bảng của họ
        talk('lai'); shot('10-lai-do-ban-do-vung')
        ev(f"{V}.sel = [0, 4]"); shot('10b-lai-do-chon-ai-trum'); home()
        talk('ren'); ev(f"{V}.sel = G.save.carry[1]"); shot('11-tho-ren-mai')
        ev(f"{V}.ftab = 'tier'; {V}.sel = G.save.carry[1]"); shot('11b-tho-ren-nang-bac')
        ev(f"{V}.sel = G.save.carry[0]"); shot('11c-tho-ren-len-vang')
        ev(f"{V}.ftab = 'reforge'; {V}.sel = G.save.carry[0]"); shot('11d-tho-ren-toi-lai')
        ev(f"{V}.ftab = 'craft'; {V}.sel = 'h_r2'"); shot('11e-tho-ren-ren-do')
        ev(f"{V}.ftab = 'up'; {V}.sel = null"); shot('11f-tho-ren-nang-lo'); ev(f"{V}.ftab = 'sharpen'"); home()
        talk('xen'); shot('12-hang-xen-ruong-vu-khi')
        ev(f"{V}.sel = G.save.weapons[3].id"); shot('12b-hang-xen-da-chon-mon'); home()
        talk('may'); shot('13-tho-may-mu-ao-bua'); home()
        talk('do'); ev(f"{V}.tab = 'skill'"); shot('14-cu-do-cay-ky-nang')
        ev(f"{V}.tab = 'help'; {V}.page = 0"); shot('14b-cu-do-huong-dan'); ev(f"{V}.tab = 'skill'; {V}.dtab = 'skill'"); home()
        talk('tu'); shot('15-ong-tu-chon-hero'); home()
        talk('mo'); shot('16-anh-mo-cai-dat')
        ev(f"{V}.confirm = true"); shot('16b-anh-mo-hoi-lai-truoc-khi-xoa'); ev(f"{V}.confirm = false"); home()
        ev(f"{VS}.onWeapon(G.save.carry[0])"); shot('17-xem-vu-khi'); home()
        # độ khó 2: tranh bản đồ màu đêm
        ev("for (let r = 0; r < 3; r++) for (let i = 0; i < 5; i++) G.save.stars[r + '-' + i] = G.save.stars[r + '-' + i] || 2; G.save.stars2['0-0'] = 2;")
        talk('lai'); ev(f"{V}.diff = 1; {V}.sel = [0, 1]"); shot('10c-ban-do-do-kho-2'); ev(f"{V}.diff = 0"); home()
        # trong trận
        ev("G.startStage(0, 1, 0, { kind: 'A', seed: 1 })"); g.wait(1500); shot('20-trong-tran')
        ev("G.keyP.Escape = true"); shot('21-tam-dung'); ev("G.keyP.Escape = true"); g.wait(150)
        mm = ev("G.minimap.rect(G.getRun())"); g.tap(mm[0] + mm[2] / 2, mm[1] + mm[3] / 2); shot('22-ban-do-ai'); ev("G.getRun().mode = 'play'")
        ev("G.testGoto('chest'); G.sim(30)"); ev(ACT, 'chest'); g.wait(200); g.pg.keyboard.press('KeyJ'); shot('23-ruong-bau'); ev("G.getRun().mode = 'play'")
        ev("G.testGoto('merchant'); G.sim(30)"); ev(ACT, 'merchant'); g.wait(200); g.pg.keyboard.press('KeyJ'); shot('24-thuong-nhan'); ev("G.getRun().mode = 'play'")
        ev("G.testGoto('curse'); G.sim(30)"); ev(ACT, 'altar'); g.wait(200); g.pg.keyboard.press('KeyJ'); shot('25-ban-tho-loi-nguyen'); ev("G.getRun().mode = 'play'")
        ev("G.getRun().mode = 'swap'"); shot('26-ruong-do-doi-vu-khi'); ev("G.getRun().mode = 'play'")
        ev("(() => { const S = G.getRun(); S.got.push({ s: G.wName(G.save.weapons[3]) + ' (Vàng)', w: G.save.weapons[3] }); S.got.push('3 quặng'); G.gotoRoom(S.rooms.length - 1); G.finishStage(true); })()"); g.wait(700); shot('27-ket-qua-thang')
        ev("G.startStage(1, 4, 0)"); g.wait(900); ev("G.gotoRoom(G.getRun().rooms.length - 1)"); g.wait(1800); shot('28-phong-trum-thanh-mau-trum')
        ev("G.finishStage(false)"); g.wait(700); shot('29-ket-qua-thua')
        ev("G.setScene(G.Village)"); g.wait(300)
        ev(DEMO); shot('bo-giao-dien', 500)
        errs = list(g.errs); g.browser.close()
        # cầm dọc: khung game tự xoay ngang
        g = Game(p, 'doc'); g.ev(RICH); g.wait(1700)
        if not ONLY or any('doc' in o for o in ONLY): g.pg.screenshot(path=os.path.join(OUT, '30-cam-doc-game-tu-xoay-ngang.png')); print('đã chụp 30-cam-doc')
        errs += g.errs; g.browser.close()
        if errs: print('LỖI:', errs); sys.exit(1)

main()
