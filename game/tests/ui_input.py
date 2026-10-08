"""Kiểm tra điều khiển thật (chạm, nhiều ngón, chuột, bàn phím) trên mọi màn hình.
Dùng: python3 tests/ui_input.py [phone|p169|desk|port|all] [url]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ui_lib import *

RUN = "G.getRun()"
P = "G.getRun().P"


def run(p, size, url=None):
    g = Game(p, size, url=url)
    c = Checker('điều khiển ' + size)
    ev = g.ev
    ev("window.__sw = 0; const f = G.sfx; G.sfx = function (n, k) { if (n === 'swing') window.__sw++; return f(n, k); }")
    tab = lambda: ev("G.villageApi.V.tab")
    mode = lambda: ev(RUN + ".mode")
    bp = lambda n: ev(f"G.stageUi.btnPos('{n}')")[:2]
    def press(name, hold=60):
        x, y = bp(name); g.down(x, y); g.wait(hold); g.up(); g.wait(80)
    def near(i):
        ev(f"(() => {{ const S = G.getRun(), pr = S.W.props[{i}]; S.P.x = pr.x - 12; S.P.y = Math.min(S.W.y1, Math.max(S.W.y0, pr.y + 3)); }})()"); g.wait(120)

    # ---- màn hình đầu: chạm đúng chỗ nút Vào ải sẽ hiện, không được bấm xuyên qua
    g.tap(70, 66)
    c.ok(ev("G.scene === G.Village"), 'chạm màn hình đầu thì vào làng')
    c.ok(tab() == 'hub', 'chạm màn hình đầu không được bấm xuyên vào nút của làng (đang ở ' + str(tab()) + ')')
    # ---- các nút ở làng và nút quay về
    for i, t in enumerate(['map', 'forge', 'gear', 'hero', 'help', 'settings']):
        g.tap(76, 66 + i * 33)
        c.ok(tab() == t, f'nút làng thứ {i+1} mở {t} (đang {tab()})')
        g.tap(429, 40)
        c.ok(tab() == 'hub', f'nút Về làng từ {t}')
    # ---- bản đồ
    g.tap(76, 66); g.tap(150, 79)
    c.ok(ev("JSON.stringify(G.villageApi.V.sel)") == '[0,0]', 'chọn ải 1')
    g.tap(414, 238, 500)
    c.ok(ev("G.scene === G.StageScene && G.getRun().tut === true"), 'Bắt đầu vào ải hướng dẫn')
    c.ok(ev(RUN + ".hint") is not None, 'ải đầu có lời chỉ dẫn')

    # ---- cần điều khiển: 4 hướng (phòng rương, không có quái)
    ev("G.gotoRoom(2)"); g.wait(500)
    ev(P + ".x = 120; " + P + ".y = 190")
    for dx, dy, key, sign, name in [(40, 0, 'x', 1, 'phải'), (-40, 0, 'x', -1, 'trái'), (0, -40, 'y', -1, 'lên'), (0, 40, 'y', 1, 'xuống')]:
        ev(P + ".x = 120; " + P + ".y = 190")
        a = ev(P + "." + key)
        g.down(60, 200); g.wait(40); g.move(60 + dx / 2, 200 + dy / 2); g.move(60 + dx, 200 + dy); g.wait(350)
        b = ev(P + "." + key)
        g.up(); g.wait(60)
        c.ok((b - a) * sign > 8, f'kéo cần sang {name} (đổi {b - a:.1f})')
    a = ev(P + ".x"); g.wait(200)
    c.ok(abs(ev(P + ".x") - a) < 0.5, 'nhấc ngón thì đứng yên')
    c.ok(ev("G.pointers.size") == 0, 'không còn ngón nào bị kẹt')

    # ---- giữ Đánh
    ev("window.__sw = 0"); x, y = bp('atk'); g.down(x, y); g.wait(1500); g.up(); g.wait(80)
    n = ev("window.__sw")
    c.ok(n >= 3, f'giữ Đánh ra đòn liên tục ({n} đòn trong 1,5 giây)')
    # ---- Né, Đặc biệt, kỹ năng
    g.wait(500); press('dodge')
    c.ok(ev(P + ".dodgeCd > 0 || " + P + ".dodgeT > 0"), 'nút Né')
    g.wait(1200); ev(P + ".mana = 100"); press('special')
    m1 = ev(P + ".mana"); c.ok(m1 < 100, f'nút Đặc biệt tốn mana (còn {m1})')
    g.wait(1200); ev(P + ".mana = 100; " + P + ".skillCd = 0"); press('skill')
    c.ok(ev(P + ".mana < 100"), 'nút kỹ năng của hero')
    # ---- đổi vũ khí, bình máu, tạm dừng
    g.wait(600); cur = ev(P + ".cur"); g.down(440, 18); g.wait(50); g.up(); g.wait(80)
    c.ok(ev(P + ".cur") != cur, 'chạm ô vũ khí để đổi')
    ev(P + ".hp = 10"); g.down(28, 33); g.wait(50); g.up(); g.wait(80)
    c.ok(ev(P + ".potions") == 1 and ev(P + ".hp") > 10, 'chạm ô Bình máu')
    g.down(73, 33); g.wait(50); g.up(); g.wait(120)
    c.ok(mode() == 'paused', 'chạm Dừng')
    s0 = ev("G.save.sound"); g.tap(240, 134)
    c.ok(ev("G.save.sound") != s0, 'đổi âm thanh trong bảng tạm dừng'); g.tap(240, 134)
    g.tap(240, 100)
    c.ok(mode() == 'play', 'Chơi tiếp')

    # ---- hai ngón cùng lúc
    if g.touch:
        ev(P + ".x = 60; " + P + ".y = 190; " + P + ".dodgeCd = 0; window.__sw = 0")
        g.down(60, 200, 0); g.wait(40); g.move(100, 200, 0); g.wait(200)
        a = ev(P + ".x")
        dx, dy = bp('dodge')
        g.down(dx, dy, 1); g.wait(60); g.up(1); g.wait(150)
        c.ok(ev(P + ".dodgeCd > 0"), 'hai ngón: Né trong lúc giữ cần')
        c.ok(ev("G.pointers.size") == 1, 'nhấc ngón bấm nút thì ngón giữ cần vẫn còn')
        g.wait(500)
        ev(P + ".x = 60")
        ax, ay = bp('atk')
        g.down(ax, ay, 1); g.wait(900)
        c.ok(ev("window.__sw") >= 2, 'hai ngón: giữ Đánh trong lúc giữ cần')
        c.ok(ev("G.pointers.size") == 2, 'đang có đúng 2 ngón')
        g.up(1); g.wait(100)
        b = ev(P + ".x"); g.wait(300); b2 = ev(P + ".x")
        c.ok(b2 > b + 5, f'cần vẫn chạy sau khi nhấc ngón kia ({b:.0f} -> {b2:.0f})')
        # dùng lại mã ngón 1 cho nút khác
        g.down(dx, dy, 1); g.wait(50); g.up(1); g.wait(60)
        c.ok(ev("G.pointers.size") == 1, 'dùng lại mã ngón không để sót ngón')
        g.up(); g.wait(80)
        c.ok(ev("G.pointers.size") == 0, 'nhấc hết ngón')
        # ngón bị hệ thống huỷ
        g.down(60, 200, 0); g.move(100, 200, 0); g.wait(80); g.cdp.send('Input.dispatchTouchEvent', {'type': 'touchCancel', 'touchPoints': []}); g.fingers = {}; g.wait(120)
        a = ev(P + ".x"); g.wait(200)
        c.ok(ev("G.pointers.size") == 0 and abs(ev(P + ".x") - a) < 0.5, 'ngón bị huỷ thì nhân vật dừng')

    # ---- rương: đi bộ tới bằng cần, bấm Đánh, chọn quặng
    ev("G.gotoRoom(2)"); g.wait(450)
    g.down(60, 200); g.wait(40); g.move(100, 200)
    ok = False
    for _ in range(60):
        g.wait(100)
        if ev("!!" + RUN + ".near"): ok = True; break
    g.up(); g.wait(80)
    c.ok(ok, 'đi bộ tới rương')
    press('atk'); g.wait(150)
    c.ok(mode() == 'chest', 'bấm Đánh mở rương')
    ore = ev("G.save.ore"); g.tap(240, 134)
    c.ok(mode() == 'play' and ev("G.save.ore") > ore, 'chọn phần thưởng quặng')
    # ---- suối và rương đồ
    ev("G.giveWeapon('spear', 0); G.gotoRoom(5)"); g.wait(450)
    ev(P + ".hp = 20"); near(0); press('atk')
    c.ok(ev(P + ".hp") > 20, 'suối hồi máu')
    near(2); press('atk'); g.wait(150)
    c.ok(mode() == 'swap', 'mở rương đồ ở phòng suối')
    old = ev("G.save.carry[0]")
    g.tap(338, 79); c.ok(ev(RUN + ".sel") is not None, 'chọn vũ khí trong rương')
    g.tap(142, 79)
    c.ok(ev("G.save.carry[0]") != old and ev(P + ".weapons[0].id === G.save.carry[0]"), 'đổi vũ khí đang mang')
    g.tap(97, 218); c.ok(mode() == 'play', 'đóng bảng rương đồ')

    # ---- cửa chọn, thương nhân, bàn thờ, thử thách
    ev("G.save.tut.done = true; G.startStage(0, 2, 0); G.gotoRoom(4)"); g.wait(500)
    kind = ev(RUN + ".W.props[0].choice"); near(0); ev(P + ".y = " + RUN + ".W.y0 + 4"); g.wait(100); press('atk'); g.wait(200)
    c.ok(ev(RUN + ".W.type") == kind, f'chọn cửa vào phòng {kind}')
    ev(RUN + ".rooms[4] = 'merchant'; G.gotoRoom(4); G.save.gold = 500; " + P + ".potions = 1"); g.wait(450)
    near(0); press('atk'); g.wait(150)
    c.ok(mode() == 'merchant', 'mở bảng thương nhân')
    g.tap(132, 118); c.ok(ev("G.save.gold") == 440 and ev(P + ".potions") == 2, 'mua bình máu')
    g.tap(132, 118); c.ok(ev("G.save.gold") == 440, 'không mua được lần hai')
    g.tap(127, 194); c.ok(mode() == 'play', 'đóng bảng thương nhân')
    ev(RUN + ".rooms[4] = 'curse'; G.gotoRoom(4)"); g.wait(450)
    near(0); press('atk'); g.wait(150)
    c.ok(mode() == 'curse', 'mở bàn thờ lời nguyền')
    g.tap(318, 182); c.ok(mode() == 'play' and ev(RUN + ".curse") is None, 'bỏ qua lời nguyền')
    press('atk'); g.wait(150); mm = ev(RUN + ".marksMult"); g.tap(162, 182)
    c.ok(mode() == 'play' and ev(RUN + ".curse") is not None and ev(RUN + ".marksMult") == mm * 2, 'nhận lời nguyền')
    ev(RUN + ".rooms[4] = 'challenge'; G.gotoRoom(4)"); g.wait(300)
    t0 = ev(RUN + ".challenge.t"); g.wait(1000); t1 = ev(RUN + ".challenge.t")
    c.ok(0.6 < t0 - t1 < 1.5, f'đồng hồ thử thách chạy đúng nhịp ({t0 - t1:.2f} giây sau 1 giây)')
    gold = ev("G.save.gold")
    ev("""(() => { const S = G.getRun(); S.P.inv = 999; for (let k = 0; k < 40 && !S.W.cleared; k++) { for (const e of S.W.ents.slice()) G.damage(e, 1e6, {}); G.sim(50); S.P.inv = 999; } })()""")
    c.ok(ev(RUN + ".W.cleared") and ev("G.save.gold") >= gold + 80, 'vượt thử thách có thưởng')

    # ---- bảng kết quả
    last = ev(RUN + ".rooms.length - 1")
    ev(f"G.gotoRoom({last}); G.finishStage(true)"); g.wait(700)
    c.ok(mode() == 'result', 'hiện bảng thắng')
    g.tap(324, 229, 400); c.ok(mode() == 'play' and ev(RUN + ".idx") == 0, 'Chơi lại ải này')
    ev(f"G.gotoRoom({last}); G.finishStage(true)"); g.wait(700)
    g.tap(156, 229, 300); c.ok(ev("G.scene === G.Village") and tab() == 'hub', 'Về làng sau khi thắng')
    # ---- gục: đang giữ cần thì bảng hiện ra, nhấc ngón không được bấm nhầm
    ev("G.startStage(0, 1, 0)"); g.wait(500)
    g.down(150, 228); g.wait(60); g.move(156, 228)
    ev("(() => { const S = G.getRun(); S.P.hp = 0; S.P.dead = true; S.W.over = 'dead'; })()"); g.wait(1700)
    c.ok(mode() == 'dead', 'hiện bảng thua')
    g.up(); g.wait(250)
    c.ok(ev("G.scene === G.StageScene") and mode() == 'dead', 'nhấc ngón đang giữ cần không bấm nhầm Về làng')
    g.tap(324, 229, 400); c.ok(mode() == 'play', 'Thử lại')
    g.down(73, 33); g.wait(50); g.up(); g.wait(150); g.tap(240, 168, 300)
    c.ok(mode() == 'dead' and ev(RUN + ".quit === true"), 'Bỏ ải từ bảng tạm dừng')
    g.wait(400); g.tap(156, 229, 300); c.ok(ev("G.scene === G.Village"), 'Về làng sau khi bỏ ải')

    # ---- bàn phím
    ev("G.startStage(0, 1, 0); G.gotoRoom(2)"); g.wait(500)
    a = ev(P + ".x"); g.pg.keyboard.down('KeyD'); g.wait(300); g.pg.keyboard.up('KeyD')
    c.ok(ev(P + ".x") > a + 8, 'phím D đi sang phải')
    ev("window.__sw = 0"); g.pg.keyboard.down('KeyJ'); g.wait(700); g.pg.keyboard.up('KeyJ')
    c.ok(ev("window.__sw") >= 1, 'phím J đánh')
    g.pg.keyboard.press('Escape'); g.wait(100); c.ok(mode() == 'paused', 'Esc tạm dừng')
    g.pg.keyboard.press('Escape'); g.wait(100); c.ok(mode() == 'play', 'Esc chơi tiếp')
    ev(RUN + ".mode = 'swap'"); g.wait(100); g.pg.keyboard.press('Escape'); g.wait(100); c.ok(mode() == 'play', 'Esc đóng bảng')
    ev("G.setScene(G.Village)"); g.wait(100); g.tap(76, 99); g.pg.keyboard.press('Escape'); g.wait(100)
    c.ok(tab() == 'hub', 'Esc ở làng quay về màn hình chính')

    # ---- lò rèn
    ev("""(() => { const sv = G.save; sv.gold = 5000; sv.ore = 60; sv.stones = 3; sv.mats = [30, 30, 30]; sv.shards = [3, 3, 3];
      sv.weapons.forEach((w) => { w.sharpen = 0; w.tier = 0; });
      const w = sv.weapons[0]; w.branch = 'fire'; w.marks.fire = 40;
      while (sv.weapons.length < 5) G.newWeapon(sv, 'hammer', 0);
      sv.heroes.hunter.unlocked = true; sv.heroes.hunter.lvl = 6; sv.heroes.smith.lvl = 6; sv.owned.helm = ['h_r2']; sv.helm = null; })()""")
    g.tap(76, 99); c.ok(tab() == 'forge', 'vào lò rèn')
    g.tap(126, 65); wid = ev("G.villageApi.V.sel"); c.ok(wid is not None, 'chọn vũ khí để mài')
    g.tap(414, 235); c.ok(ev(f"G.weaponById({wid}).sharpen") == 1, 'Mài lên +1')
    g.tap(183, 40); g.tap(126, 65); g.tap(414, 235)
    c.ok(ev("G.weaponById(G.villageApi.V.sel).tier") == 1, 'Nâng bậc')
    g.tap(241, 40); g.tap(126, 65); br = ev("G.weaponById(G.villageApi.V.sel).branch"); g.tap(126, 243)
    c.ok(ev("G.weaponById(G.villageApi.V.sel).branch") != br and ev("G.save.stones") == 2, 'Tôi lại đổi nhánh')
    g.tap(299, 40); g.tap(126, 65); c.ok(ev("G.villageApi.V.sel") == 'h_r1', 'chọn món để rèn'); g.tap(414, 235)
    c.ok(ev("G.save.owned.helm.includes('h_r1')"), 'Rèn đồ')
    g.tap(357, 40); g.tap(84, 131); c.ok(ev("G.save.forge") == 2, 'Nâng lò')
    g.tap(429, 40)
    # ---- trang bị
    g.tap(76, 132); c.ok(tab() == 'gear', 'vào trang bị')
    old = ev("G.save.carry[0]"); g.tap(126, 143); sel = ev("G.villageApi.V.sel"); g.tap(126, 77)
    c.ok(ev("G.save.carry[0]") == sel and sel != old, 'thay vũ khí đang mang')
    n = ev("G.save.weapons.length"); gold = ev("G.save.gold"); g.tap(126, 143); g.tap(193, 246)
    c.ok(ev("G.save.weapons.length") == n - 1 and ev("G.save.gold") > gold, 'bán vũ khí')
    h = ev("G.save.helm"); g.tap(435, 76); h2 = ev("G.save.helm"); g.tap(435, 76); h3 = ev("G.save.helm")
    c.ok(h2 != h and h3 != h2, f'bấm Đổi để xoay vòng mũ ({h} -> {h2} -> {h3})')
    g.tap(429, 40)
    # ---- hero và kỹ năng
    g.tap(76, 165); g.tap(183, 71); c.ok(ev("G.save.hero") == 'hunter', 'chọn hero')
    g.tap(437, 130); c.ok(ev("G.save.heroes.hunter.sk.atk") == 1, 'học kỹ năng')
    g.tap(437, 174); g.tap(437, 218)
    c.ok(ev("G.save.heroes.hunter.sk.def") == 1 and ev("G.save.heroes.hunter.sk.elem") == 0, 'hết điểm thì không học thêm được')
    g.tap(429, 40)
    # ---- hướng dẫn, cài đặt
    g.tap(76, 198); g.tap(93, 249); c.ok(ev("G.villageApi.V.page") == 1, 'lật trang hướng dẫn'); g.tap(429, 40)
    g.tap(76, 231); s0 = ev("G.save.sound"); g.tap(114, 74); c.ok(ev("G.save.sound") != s0, 'bật tắt âm thanh')
    g.tap(114, 194); c.ok(ev("G.villageApi.V.confirm") is True, 'hỏi lại trước khi xoá')
    g.tap(197, 198); c.ok(ev("G.villageApi.V.confirm") is False and ev("G.save.gold") > 0, 'Thôi thì không xoá')
    g.tap(114, 194); g.tap(79, 198)
    c.ok(ev("G.save.gold") == 0 and ev("G.save.forge") == 1 and tab() == 'hub', 'Xoá hết thì về bản lưu mới')
    ok = c.done(g)
    g.close()
    return ok


if __name__ == '__main__':
    which = sys.argv[1] if len(sys.argv) > 1 else 'all'
    url = sys.argv[2] if len(sys.argv) > 2 else None
    sizes = ['phone', 'p169', 'desk', 'port'] if which == 'all' else [which]
    with sync_playwright() as p:
        res = [run(p, s, url) for s in sizes]
    sys.exit(0 if all(res) else 1)
