"""Kiểm tra điều khiển thật (chạm, nhiều ngón, chuột, bàn phím) trên mọi màn hình.
Dùng: python3 tests/ui_input.py [phone|p169|desk|port|all] [url]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ui_lib import *

RUN = "G.getRun()"
P = "G.getRun().P"
SETUP = os.path.join(ROOT, 'tests', 'setup.js')
DIRV = {'up': (0, -1), 'down': (0, 1), 'left': (-1, 0), 'right': (1, 0)}
# Người chơi có nằm trong sàn phòng không.
INSIDE = "(() => { const S = G.getRun(), W = S.W, P = S.P; return P.x >= W.x0 && P.x <= W.x1 && P.y >= W.y0 && P.y <= W.y1 && W.x0 >= W.geo.fx0 && W.x1 <= W.geo.fx1 && W.y0 >= W.geo.fy0 && W.y1 <= W.geo.fy1; })()"
# Hạ hết quái cho tới khi phòng được dọn xong.
CLEAR = "(() => { const S = G.getRun(); S.P.inv = 999; for (let k = 0; k < 40 && !S.W.cleared; k++) { for (const e of S.W.ents.slice()) G.damage(e, 1e6, {}); G.sim(50); S.P.inv = 999; } })()"


def cut(a, b):
    """Hai ô [x, y, rộng, cao] có đè lên nhau không."""
    return a[0] < b[0] + b[2] and b[0] < a[0] + a[2] and a[1] < b[1] + b[3] and b[1] < a[1] + a[3]


def run(p, size, url=None):
    g = Game(p, size, url=url)
    g.pg.add_script_tag(path=SETUP)  # chỉ dùng khi kiểm tra: G.testGoto nhảy tới phòng theo loại
    c = Checker('điều khiển ' + size)
    ev = g.ev
    ev("window.__sw = 0; const f = G.sfx; G.sfx = function (n, k) { if (n === 'swing') window.__sw++; return f(n, k); }")
    tab = lambda: ev("G.villageApi.V.tab")
    mode = lambda: ev(RUN + ".mode")
    bp = lambda n: ev(f"G.stageUi.btnPos('{n}')")[:2]
    def press(name, hold=60):
        x, y = bp(name); g.down(x, y); g.wait(hold); g.up(); g.wait(80)
    goto = lambda t: ev(f"G.testGoto('{t}')")
    def near(what):
        """Đứng cạnh đồ vật trong phòng. what: điều kiện chọn đồ vật p, ví dụ p.act === 'chest'."""
        ev(f"(() => {{ const S = G.getRun(), pr = S.W.props.find((p) => {what}); S.P.x = pr.x - 12; S.P.y = Math.min(S.W.y1, Math.max(S.W.y0, pr.y + 3)); }})()"); g.wait(120)
    def put(x, y):
        """Đặt người chơi. x, y: biểu thức theo W (phòng) và g (khung phòng), ví dụ g.cx - 50."""
        ev(f"(() => {{ const S = G.getRun(), W = S.W, g = W.geo; S.P.x = {x}; S.P.y = {y}; }})()")
    def drag(dx, dy):
        """Đặt ngón lên vùng cần rồi kéo về một hướng, chưa nhấc."""
        g.down(60, 200); g.wait(40); g.move(60 + dx / 2, 200 + dy / 2); g.move(60 + dx, 200 + dy)

    # ---- làng có người: mỗi chức năng là một người. Các hàm dưới đây điều khiển bằng chạm thật.
    VS = "G.villageScene"
    ORDER = ['lai', 'ren', 'xen', 'may', 'do', 'tu', 'mo']
    TABS = {'lai': 'map', 'ren': 'forge', 'xen': 'gear', 'may': 'outfit', 'do': 'skill', 'tu': 'hero', 'mo': 'settings'}
    def wait_tab(t, ms=10000):
        for _ in range(ms // 100):
            if tab() == t: return True
            g.wait(100)
        return tab() == t
    def face(k):
        """Chạm khuôn mặt của một người trên dải lối tắt ở mép trên."""
        x, y = ev(f"{VS}.stripAt({ORDER.index(k)})"); g.tap(x, y)
    def visit(k):
        """Chạm khuôn mặt: em bé tự chạy tới rồi bảng mở."""
        face(k); return wait_tab(TABS[k])
    def close():
        """Nút đóng bảng: '✕ Xong' ở góc bảng, hoặc '✕ Về làng' trên tranh bản đồ."""
        if tab() == 'map': g.tap(438, 16)
        else: g.tap(436, 57)
    hero_xy = lambda: ev(f"[{VS}.state.x, {VS}.state.y, {VS}.state.cam]")
    scr = lambda wx, wy: ev(f"{VS}.screen({wx}, {wy})")  # điểm trong làng -> toạ độ màn hình (cảnh trượt ngang và lùi xuống một chút)
    def settle(cond="true", ms=6000):
        # Chờ em bé chạy xong (và điều kiện cond đúng), tối đa ms.
        for _ in range(ms // 100):
            g.wait(100)
            if ev(f"!{VS}.state.path && ({cond})"): return True
        return False

    # ---- màn hình đầu: chạm đúng chỗ khuôn mặt Chú Lái Đò sẽ hiện, không được bấm xuyên qua
    fx, fy = ev(f"{VS}.stripAt(0)"); g.tap(fx, fy)
    c.ok(ev("G.scene === G.Village"), 'chạm màn hình đầu thì vào làng')
    g.wait(600)
    c.ok(tab() == 'hub' and ev(f"{VS}.state.goal") is None, 'chạm màn hình đầu không được bấm xuyên vào dải khuôn mặt của làng (đang ở ' + str(tab()) + ')')
    g.wait(900)
    x0, y0, cam0 = hero_xy()
    c.ok(x0 > 560 and cam0 > 200, f'vào làng thì em bé xuống đò ở bến bên phải (x = {x0:.0f}, màn hình trượt {cam0:.0f})')
    # ---- đi tám hướng bằng cần điều khiển, màn hình trượt ngang theo em bé
    g.down(60, 200); g.wait(40); g.move(40, 200); g.move(20, 200); g.wait(1500)
    x1, y1, cam1 = hero_xy()
    c.ok(x1 < x0 - 40 and abs(y1 - y0) < 6, f'kéo cần sang trái thì em bé đi sang trái ({x0:.0f} -> {x1:.0f})')
    g.move(20, 240); g.wait(500); x2, y2, cam2 = hero_xy()
    c.ok(y2 > y1 + 10 and x2 < x1 - 5, f'kéo chéo xuống trái thì đi chéo ({y1:.0f} -> {y2:.0f})')
    g.move(60, 160); g.wait(500); x3, y3, cam3 = hero_xy(); g.up(); g.wait(120)
    c.ok(y3 < y2 - 10, 'kéo lên thì đi lên')
    c.ok(cam3 < cam0 - 20, f'màn hình trượt ngang theo em bé ({cam0:.0f} -> {cam3:.0f})')
    x4 = hero_xy()[0]; g.wait(200); c.ok(abs(hero_xy()[0] - x4) < 1, 'nhấc ngón thì em bé đứng lại')
    wx = ev(f"{VS}.state.wp[0].x"); c.ok(abs(wx - x4) < 40, 'vũ khí sống bay theo sau em bé')
    # ---- tài nguyên hiện bằng biểu tượng: chạm vào thì hiện tên trong chốc lát
    g.tap(10, 7); c.ok(ev("G.theme.tipNow()") == 'Vàng', 'chạm biểu tượng đồng tiền ở dải trên cùng thì hiện tên Vàng')
    g.wait(2200); c.ok(ev("G.theme.tipNow()") is None, 'tên biểu tượng tự tắt sau chốc lát')
    c.ok(tab() == 'hub' and ev(f"{VS}.state.path") is None, 'chạm biểu tượng tài nguyên không làm em bé chạy đi')
    # ---- dải bảy khuôn mặt không đè lên công trình: mép dưới của dải nằm trên nóc mái lò rèn, đình, nhà thợ may
    c.ok(ev(f"{VS}.screen(0, 50)[1]") >= 52, 'dải khuôn mặt nằm gọn phía trên các mái nhà (cảnh làng đã lùi xuống)')
    # ---- tới gần một người: nút tròn thành "Nói chuyện", bấm thì mở đúng bảng
    ev(f"(() => {{ const S = {VS}.state, N = {VS}.NPCS.ren; S.x = N.den[0]; S.y = N.den[1]; S.path = null; }})()"); g.wait(300)
    c.ok(ev(f"{VS}.state.near && {VS}.state.near.id") == 'ren', 'đứng cạnh Ông Thợ Rèn thì game nhận ra người ở gần')
    bx, by, br = ev(f"{VS}.btnAt()"); g.tap(bx, by)
    c.ok(tab() == 'forge', 'bấm nút Nói chuyện mở bảng Lò rèn')
    close(); c.ok(tab() == 'hub', 'nút Xong đóng bảng, về lại làng')
    g.pg.keyboard.press('KeyJ'); g.wait(120); c.ok(tab() == 'forge', 'phím J cũng nói chuyện với người ở gần'); close()
    ev(f"(() => {{ const S = {VS}.state; S.x = 520; S.y = 170; S.path = null; }})()"); g.wait(300)
    c.ok(ev(f"{VS}.state.near") is None, 'đi xa thì nút Nói chuyện tắt')
    g.tap(bx, by); c.ok(tab() == 'hub', 'không có ai ở gần thì bấm nút tròn không mở gì')
    # ---- chạm thẳng vào người: em bé tự chạy tới rồi mở bảng
    nx, ny = ev(f"{VS}.NPCS.may.pos"); tx, ty = scr(nx, ny - 12)
    g.tap(tx, ty)
    c.ok(wait_tab('outfit'), 'chạm vào Cô Thợ May thì em bé tự chạy tới và bảng mũ áo mở')
    close()
    # ---- chạm vào đất thì em bé đi tới đó
    xa = hero_xy()[0]; g.tap(260, 228); g.wait(200); settle(); xb = hero_xy(); hs = scr(xb[0], xb[1])
    c.ok(abs(hs[0] - 260) < 12 and abs(hs[1] - 228) < 8 and tab() == 'hub', f'chạm vào đất thì em bé đi tới chỗ đó ({xa:.0f} -> {xb[0]:.0f}, {xb[1]:.0f})')
    # ---- chạm vào vũ khí sống để xem vũ khí
    g.wait(900); wx, wy = ev(f"[{VS}.state.wp[0].x, {VS}.state.wp[0].y]"); tx, ty = scr(wx, wy - 20)
    g.tap(tx, ty); c.ok(tab() == 'weapon', 'chạm vào vũ khí sống thì mở màn Xem vũ khí')
    g.tap(431, 37); c.ok(tab() == 'hub', 'nút Quay lại từ màn Xem vũ khí')
    # ---- dải bảy khuôn mặt: chạm một mặt là em bé tự chạy tới và mở đúng bảng; nút đóng đưa về làng
    for i, k in enumerate(ORDER):
        ok_open = visit(k)
        c.ok(ok_open, f'khuôn mặt thứ {i+1} ({k}) mở {TABS[k]} (đang {tab()})')
        if k == 'ren':  # đang mở bảng mà chạm mặt khác thì sang thẳng người đó
            face('xen'); c.ok(tab() == 'gear', 'đang mở bảng, chạm khuôn mặt khác thì sang thẳng người đó'); face('ren')
        close()
        c.ok(tab() == 'hub', f'nút đóng bảng từ {TABS[k]}')
    c.ok(ev(f"{VS}.state.x") < 200, 'sau khi gặp Anh Mõ thì em bé đang ở đầu bên trái của làng')
    # ---- ba bé hero còn lại ngồi ở sân đình: chạm bé chưa mở thì không đổi
    kid = ev(f"(() => {{ const S = {VS}.state; S.x = 262; S.y = 176; S.face = 1; S.cam = 22; S.path = null; for (const w of S.wp) {{ w.x = 240; w.y = 176; }} return [186, 134]; }})()"); g.wait(500)
    tx, ty = scr(kid[0], kid[1] - 10); g.tap(tx, ty); g.wait(200); settle()
    c.ok(ev("G.save.hero") == 'smith', 'chạm bé hero chưa mở thì không đổi hero')
    # ---- bản đồ vùng dạng tranh: chọn ải rồi Lên đò
    c.ok(visit('lai'), 'Chú Lái Đò mở tranh bản đồ vùng')
    c.ok(ev("JSON.stringify(G.villageApi.V.sel)") == '[0,0]', 'tranh bản đồ chọn sẵn ải đang tới (ải 1)')
    n2 = ev(f"{VS}.MAP.nodes[0][1]"); g.tap(n2[0], n2[1])
    c.ok(ev("JSON.stringify(G.villageApi.V.sel)") == '[0,0]', 'chạm ải chưa mở thì không chọn được')
    n1 = ev(f"{VS}.MAP.nodes[0][0]"); g.tap(n1[0], n1[1])
    c.ok(ev("JSON.stringify(G.villageApi.V.sel)") == '[0,0]', 'chọn ải 1')
    g.tap(436, 238, 500)
    c.ok(ev("G.scene === G.StageScene && G.getRun().tut === true"), 'Bắt đầu vào ải hướng dẫn')
    c.ok(ev(RUN + ".hint") is not None, 'ải đầu có lời chỉ dẫn')

    # ---- bản đồ nhỏ không đè lên ô vũ khí, nút bấm, sàn phòng
    mm = ev("G.minimap.rect(G.getRun())")
    c.ok(not cut(mm, [368, 0, 112, 38]), f'bản đồ nhỏ không đè lên ô vũ khí {mm}')
    hit = [n for n in ['atk', 'dodge', 'special', 'skill'] for b in [ev(f"G.stageUi.btnPos('{n}')")] if cut(mm, [b[0] - b[2] - 6, b[1] - b[2] - 6, 2 * b[2] + 12, 2 * b[2] + 12])]
    c.ok(not hit, f'bản đồ nhỏ không đè lên nút bấm {hit}')
    fl = ev("(() => { const g = G.getRun().W.geo; return [g.fx0, g.fy0, g.fx1 - g.fx0, g.fy1 - g.fy0, g.big]; })()")
    c.ok(not fl[4] and not cut(mm, fl[:4]), f'bản đồ nhỏ không đè lên sàn phòng thường {mm} {fl}')
    mb = ev("G.minimap.rect({ W: { geo: G.roomArt.geo(true) } })"); fb = ev("(() => { const g = G.roomArt.geo(true); return [g.fx0, g.fy0, g.fx1 - g.fx0, g.fy1 - g.fy0]; })()")
    c.ok(not cut(mb, fb) and not cut(mb, [368, 0, 112, 38]), f'ở phòng trùm bản đồ nhỏ không đè lên sàn và ô vũ khí {mb} {fb}')

    # ---- cần điều khiển: 4 hướng (phòng rương, không có quái). Đứng lệch khỏi cửa, giữ cần mãi cũng không ra khỏi sàn.
    goto('chest'); g.wait(500)
    room = ev(RUN + ".idx")
    for dx, dy, key, sign, name, x, y, wall in [(40, 0, 'x', 1, 'phải', 'W.x1 - 25', 'g.cy + 40', 'x1'), (-40, 0, 'x', -1, 'trái', 'W.x0 + 25', 'g.cy + 40', 'x0'),
                                                (0, -40, 'y', -1, 'lên', 'g.cx - 50', 'W.y0 + 25', 'y0'), (0, 40, 'y', 1, 'xuống', 'g.cx - 50', 'W.y1 - 25', 'y1')]:
        put(x, y)
        a = ev(P + "." + key)
        drag(dx, dy); g.wait(350)
        b = ev(P + "." + key)
        c.ok((b - a) * sign > 8, f'kéo cần sang {name} (đổi {b - a:.1f})')
        g.wait(500)
        b = ev(P + "." + key); edge = ev(RUN + ".W." + wall)
        g.up(); g.wait(60)
        c.ok(ev(INSIDE) and abs(b - edge) < 0.5 and ev(RUN + ".idx") == room, f'giữ cần sang {name} thì dừng ở mép sàn, không ra ngoài ({b:.1f}, mép {edge})')
    put('g.cx - 50', 'g.cy + 40')
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
        put('W.x0 + 10', 'g.cy + 40'); ev(P + ".dodgeCd = 0; window.__sw = 0")
        g.down(60, 200, 0); g.wait(40); g.move(100, 200, 0); g.wait(200)
        a = ev(P + ".x")
        dx, dy = bp('dodge')
        g.down(dx, dy, 1); g.wait(60); g.up(1); g.wait(150)
        c.ok(ev(P + ".dodgeCd > 0"), 'hai ngón: Né trong lúc giữ cần')
        c.ok(ev("G.pointers.size") == 1, 'nhấc ngón bấm nút thì ngón giữ cần vẫn còn')
        g.wait(500)
        put('W.x0 + 10', 'g.cy + 40')
        ax, ay = bp('atk')
        g.down(ax, ay, 1); g.wait(900)
        # Luật mới (js/moves.js): đang cầm cung thì giữ Đánh là giương cung, thả ra mới bắn. Kiếm thì giữ vẫn đánh liên tục.
        c.ok(ev("window.__sw") >= 2 or ev("!!(" + P + ".mv && " + P + ".mv.holding)"), 'hai ngón: giữ Đánh trong lúc giữ cần (cung thì giương cung)')
        c.ok(ev("G.pointers.size") == 2, 'đang có đúng 2 ngón')
        g.up(1); g.wait(100)
        c.ok(ev("window.__sw") >= 1, 'thả nút Đánh thì đòn tung ra')
        put('W.x0 + 10', 'g.cy + 40')
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
    goto('chest'); g.wait(450)
    put('g.cx - 60', 'g.cy + 4')
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
    ev("G.giveWeapon('spear', 0)"); goto('fountain'); g.wait(450)
    ev(P + ".hp = 20"); near("p.act === 'fountain' && p.kind === 'hp'"); press('atk')
    c.ok(ev(P + ".hp") > 20, 'suối hồi máu')
    near("p.act === 'stash'"); press('atk'); g.wait(150)
    c.ok(mode() == 'swap', 'mở rương đồ ở phòng suối')
    old = ev("G.save.carry[0]")
    g.tap(338, 79); c.ok(ev(RUN + ".sel") is not None, 'chọn vũ khí trong rương')
    g.tap(142, 79)
    c.ok(ev("G.save.carry[0]") != old and ev(P + ".weapons[0].id === G.save.carry[0]"), 'đổi vũ khí đang mang')
    g.tap(97, 218); c.ok(mode() == 'play', 'đóng bảng rương đồ')

    # ---- phòng phụ của bản đồ, thương nhân, bàn thờ, thử thách
    ev("G.save.tut.done = true; G.startStage(0, 2, 0, { kind: 'A', seed: 1 })"); g.wait(500)
    side = ev("G.getRun().map.rooms.filter((o) => G.mapgen.SIDE.includes(o.type)).map((o) => [o.id, o.type])")
    kind = side[0][1] if len(side) == 1 else None
    if kind: ev(f"G.gotoRoom({side[0][0]})"); g.wait(200)
    has = ev("(() => { const S = G.getRun(), t = S.W.type; return t === 'challenge' ? !!S.challenge : S.W.props.some((p) => p.act === { merchant: 'merchant', curse: 'altar' }[t]); })()")
    c.ok(kind and ev(RUN + ".W.type") == kind and has, f'bản đồ có đúng một phòng phụ, vào thì đúng là phòng {kind} {side}')
    goto('merchant'); ev("G.save.gold = 500; " + P + ".potions = 1"); g.wait(450)
    near("p.act === 'merchant'"); press('atk'); g.wait(150)
    c.ok(mode() == 'merchant', 'mở bảng thương nhân')
    g.tap(132, 118); c.ok(ev("G.save.gold") == 440 and ev(P + ".potions") == 2, 'mua bình máu')
    g.tap(132, 118); c.ok(ev("G.save.gold") == 440, 'không mua được lần hai')
    g.tap(127, 194); c.ok(mode() == 'play', 'đóng bảng thương nhân')
    goto('curse'); g.wait(450)
    near("p.act === 'altar'"); press('atk'); g.wait(150)
    c.ok(mode() == 'curse', 'mở bàn thờ lời nguyền')
    g.tap(318, 182); c.ok(mode() == 'play' and ev(RUN + ".curse") is None, 'bỏ qua lời nguyền')
    press('atk'); g.wait(150); mm = ev(RUN + ".marksMult"); g.tap(162, 182)
    c.ok(mode() == 'play' and ev(RUN + ".curse") is not None and ev(RUN + ".marksMult") == mm * 2, 'nhận lời nguyền')
    goto('challenge'); g.wait(300)
    t0 = ev(RUN + ".challenge.t"); g.wait(1000); t1 = ev(RUN + ".challenge.t")
    c.ok(0.6 < t0 - t1 < 1.5, f'đồng hồ thử thách chạy đúng nhịp ({t0 - t1:.2f} giây sau 1 giây)')
    gold = ev("G.save.gold")
    ev(CLEAR)
    c.ok(ev(RUN + ".W.cleared") and ev("G.save.gold") >= gold + 80, 'vượt thử thách có thưởng')

    # ---- bản đồ nhỏ và bản đồ to (phòng đầu, quái còn sống)
    ev("G.startStage(0, 1, 0, { kind: 'A', seed: 1 })")
    for _ in range(40):
        g.wait(100)
        if ev(RUN + ".W.ents.length") > 0: break
    snap = "(() => { const S = G.getRun(); return [S.roomT, S.P.x, S.P.y, S.P.hp].concat(S.W.ents.map((e) => e.x + e.y)).join(' '); })()"
    mm = ev("G.minimap.rect(G.getRun())"); mx, my = mm[0] + mm[2] / 2, mm[1] + mm[3] / 2
    g.tap(mx, my)
    c.ok(mode() == 'map', 'chạm bản đồ nhỏ thì mở bản đồ to')
    s0 = ev(snap); g.wait(500); s1 = ev(snap)
    c.ok(s0 == s1 and ev(RUN + ".W.ents.length") > 0, 'đang mở bản đồ thì trận đấu đứng yên')
    g.tap(mx, my)
    c.ok(mode() == 'play', 'chạm lần nữa thì đóng bản đồ, chơi tiếp')
    g.wait(300)
    c.ok(mode() == 'play' and ev(snap) != s1, 'đóng bản đồ thì trận đấu chạy tiếp')
    # ---- cửa khoá khi phòng còn quái
    d = ev("""(() => { const S = G.getRun(), W = S.W, d = W.doors[0], q = G.roomArt.doorPos(W.geo, d.dir); S.P.x = q.x; S.P.y = q.y;
      return { dir: d.dir, open: W.doors.some((o) => o.open), n: W.ents.length, cleared: !!W.cleared, idx: S.idx }; })()""")
    vx, vy = DIRV[d['dir']]
    drag(vx * 40, vy * 40); g.wait(700)
    st = ev("(() => { const S = G.getRun(); return [S.idx, !!S.trans]; })()")
    g.up(); g.wait(60)
    c.ok(d['n'] > 0 and not d['cleared'] and not d['open'], f'phòng còn quái thì mọi cửa đều khoá {d}')
    c.ok(st == [d['idx'], False] and ev(INSIDE), f'đẩy vào cửa khoá thì không sang phòng khác {st}')
    # ---- dọn xong phòng thì cửa mở, kéo cần đi qua cửa sang phòng kề
    ev(CLEAR)
    d = ev("""(() => { const S = G.getRun(), W = S.W, d = W.doors.find((o) => o.open);
      if (!d) return null;
      const q = G.roomArt.doorPos(W.geo, d.dir), v = G.mapgen.DIRS[d.dir]; S.P.x = q.x - v[0] * 30; S.P.y = q.y - v[1] * 30;
      return { dir: d.dir, to: d.to, idx: S.idx }; })()""")
    c.ok(d is not None, 'dọn xong phòng thì cửa mở')
    if d:
        g.wait(100)
        vx, vy = DIRV[d['dir']]
        drag(vx * 40, vy * 40)
        for _ in range(60):
            g.wait(50)
            if ev(RUN + ".idx") != d['idx']: break
        g.up()
        for _ in range(40):
            g.wait(50)
            if not ev("!!" + RUN + ".trans"): break
        r = ev("""(dir) => { const S = G.getRun(), W = S.W, q = G.roomArt.doorPos(W.geo, G.mapgen.OPP[dir]);
          return { idx: S.idx, trans: !!S.trans, dist: Math.hypot(S.P.x - q.x, S.P.y - q.y), seen: !!S.seen[S.idx], mode: S.mode }; }""", d['dir'])
        c.ok(r['idx'] == d['to'] and not r['trans'] and r['mode'] == 'play', f"kéo cần vào cửa đang mở thì sang phòng kề ({d['idx']} -> {r['idx']}, cần tới {d['to']})")
        c.ok(r['dist'] < 20 and ev(INSIDE) and r['seen'], f"sang phòng mới thì đứng ngay trong cửa đối diện (cách cửa {r['dist']:.1f})")

    # ---- bảng kết quả
    last = ev(RUN + ".rooms.length - 1")
    ev(f"G.gotoRoom({last}); G.finishStage(true)"); g.wait(700)
    c.ok(mode() == 'result', 'hiện bảng thắng')
    si = ev(RUN + ".i")
    g.tap(230, 229, 400); c.ok(mode() == 'play' and ev(RUN + ".idx") == 0 and ev(RUN + ".i") == si, 'Chơi lại ải này')
    ev(f"G.gotoRoom({last}); G.finishStage(true)"); g.wait(700)
    g.tap(342, 229, 400); c.ok(mode() == 'play' and ev(RUN + ".idx") == 0 and ev(RUN + ".i") == si + 1, 'Ải tiếp theo: vào thẳng ải kế, không về làng')
    last = ev(RUN + ".rooms.length - 1")
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
    ev("G.startStage(0, 1, 0, { kind: 'A', seed: 1 })"); goto('chest'); g.wait(500)
    a = ev(P + ".x"); g.pg.keyboard.down('KeyD'); g.wait(300); g.pg.keyboard.up('KeyD')
    c.ok(ev(P + ".x") > a + 8, 'phím D đi sang phải')
    ev("window.__sw = 0"); g.pg.keyboard.down('KeyJ'); g.wait(700); g.pg.keyboard.up('KeyJ'); g.wait(120)  # cung, giáo, búa: giữ là lấy đà, thả ra mới đánh
    c.ok(ev("window.__sw") >= 1, 'phím J đánh')
    g.pg.keyboard.press('Escape'); g.wait(100); c.ok(mode() == 'paused', 'Esc tạm dừng')
    g.pg.keyboard.press('Escape'); g.wait(100); c.ok(mode() == 'play', 'Esc chơi tiếp')
    ev(RUN + ".mode = 'swap'"); g.wait(100); g.pg.keyboard.press('Escape'); g.wait(100); c.ok(mode() == 'play', 'Esc đóng bảng')
    g.pg.keyboard.press('KeyM'); g.wait(100); c.ok(mode() == 'map', 'phím M mở bản đồ')
    t0 = ev(RUN + ".roomT"); g.wait(300)
    c.ok(ev(RUN + ".roomT") == t0, 'mở bản đồ bằng phím thì trận đấu cũng đứng yên')
    g.pg.keyboard.press('KeyM'); g.wait(100); c.ok(mode() == 'play', 'phím M đóng bản đồ')
    g.pg.keyboard.press('KeyM'); g.wait(100); g.pg.keyboard.press('Escape'); g.wait(100); c.ok(mode() == 'play', 'Esc cũng đóng bản đồ')
    ev("G.setScene(G.Village)"); g.wait(100); visit('ren'); g.pg.keyboard.press('Escape'); g.wait(100)
    c.ok(tab() == 'hub', 'Esc ở làng đóng bảng, quay về cảnh làng')
    xk = hero_xy()[0]; g.pg.keyboard.down('KeyA'); g.wait(300); g.pg.keyboard.up('KeyA')
    c.ok(hero_xy()[0] < xk - 8, 'phím A đi sang trái ở làng')

    # ---- lò rèn
    ev("""(() => { const sv = G.save; sv.gold = 5000; sv.ore = 60; sv.stones = 3; sv.mats = [30, 30, 30]; sv.shards = [3, 3, 3];
      sv.weapons.forEach((w) => { w.sharpen = 0; w.tier = 0; });
      const w = sv.weapons[0]; w.branch = 'fire'; w.marks.fire = 40;
      while (sv.weapons.length < 5) G.newWeapon(sv, 'hammer', 0);
      sv.heroes.hunter.unlocked = true; sv.heroes.hunter.lvl = 6; sv.heroes.smith.lvl = 6; sv.owned.helm = ['h_r2']; sv.helm = null; })()""")
    FT = [189, 250, 312, 373, 435]  # tâm năm thẻ Mài, Nâng bậc, Tôi lại, Rèn đồ, Nâng lò
    c.ok(visit('ren') and tab() == 'forge', 'Ông Thợ Rèn mở lò rèn')
    c.ok(ev(f"{VS}.state.news.ren") is True, 'đủ nguyên liệu thì Ông Thợ Rèn có dấu chấm than báo việc mới')
    g.tap(260, 105); wid = ev("G.villageApi.V.sel"); c.ok(wid is not None, 'chọn vũ khí để mài')
    g.tap(415, 234); c.ok(ev(f"G.weaponById({wid}).sharpen") == 1, 'Mài lên +1')
    g.tap(FT[1], 80); g.tap(260, 105); g.tap(415, 234)
    c.ok(ev("G.weaponById(G.villageApi.V.sel).tier") == 1, 'Nâng bậc')
    g.tap(FT[2], 80); g.tap(260, 105); br = ev("G.weaponById(G.villageApi.V.sel).branch"); g.tap(238, 246)
    c.ok(ev("G.weaponById(G.villageApi.V.sel).branch") != br and ev("G.save.stones") == 2, 'Tôi lại đổi nhánh')
    # Mũ áo nay do Cô Thợ May may: thẻ Rèn đồ chỉ đường sang đó; mũ đã rèn ở bản cũ (h_r2) nằm trong kho trang phục
    g.tap(FT[3], 80); c.ok(ev("G.save.outfit.items.some((it) => it.k === 'mu_da_ca')"), 'Rèn đồ: mũ rèn ở bản cũ đã chuyển sang kho trang phục')
    g.tap(FT[4], 80); g.tap(229, 187); c.ok(ev("G.save.forge") == 2, 'Nâng lò')
    g.tap(FT[3], 80); g.tap(415, 234); g.wait(150)
    c.ok(tab() == 'outfit', 'Rèn đồ: nút Sang Cô Thợ May mở bảng trang phục')
    close()
    # ---- Bà Hàng Xén: rương vũ khí, chọn hai món mang theo, xem, bán
    c.ok(visit('xen') and tab() == 'gear', 'Bà Hàng Xén mở rương vũ khí')
    old = ev("G.save.carry[0]"); g.tap(260, 152); sel = ev("G.villageApi.V.sel"); g.tap(260, 91)
    c.ok(ev("G.save.carry[0]") == sel and sel != old, 'thay vũ khí đang mang')
    g.tap(260, 91); c.ok(tab() == 'weapon', 'chưa chọn gì mà chạm món đang mang thì mở Xem vũ khí')
    g.tap(431, 37); c.ok(tab() == 'gear', 'Quay lại thì về đúng bảng của Bà Hàng Xén')
    g.tap(260, 152); g.tap(300, 249); c.ok(tab() == 'weapon', 'nút Xem cho món trong rương'); g.tap(431, 37)
    n = ev("G.save.weapons.length"); gold = ev("G.save.gold"); g.tap(260, 152) if ev("G.villageApi.V.sel") is None else None; g.tap(400, 249)
    c.ok(ev("G.save.weapons.length") == n - 1 and ev("G.save.gold") > gold, 'bán vũ khí')
    close()
    # ---- Cô Thợ May: trang phục năm ô (may, lật trang, mặc, tháo, mặc thử)
    c.ok(visit('may') and tab() == 'outfit', 'Cô Thợ May mở bảng trang phục')
    n0 = ev("G.save.outfit.items.length")
    g.tap(262, 79); c.ok(ev("G.villageApi.V.otab") == 'craft', 'thẻ May đồ')
    g.tap(453, 200); c.ok(ev("G.villageApi.V.page") == 1, 'lật trang danh sách món may')
    g.tap(300, 103); k = ev("G.villageApi.V.sel"); c.ok(k == 'mu_vay_ca', f'chọn món để may ({k})')
    g.tap(419, 227); c.ok(ev("G.save.outfit.items.length") == n0 + 1 and ev("G.villageApi.V.otab") == 'wear', 'May xong một món, chuyển sang thẻ Mặc đồ')
    g.tap(419, 218); c.ok(ev("G.outfit.worn(G.save, 'hat') && G.outfit.worn(G.save, 'hat').k") == 'mu_vay_ca', 'bấm Mặc thì em bé đội món vừa may')
    g.tap(419, 218); c.ok(ev("G.save.outfit.wear.hat") is None, 'bấm Tháo ra thì bỏ mũ')
    g.tap(119, 181); c.ok(ev("G.villageApi.V.pv") == 'lon', 'nút Lộn ở ô mặc thử')
    g.tap(338, 79); c.ok(ev("G.villageApi.V.otab") == 'wing', 'thẻ Cánh')
    close()
    # ---- Ông Từ: chọn hero; Cụ Đồ: cây kỹ năng và hướng dẫn
    c.ok(visit('tu') and tab() == 'hero', 'Ông Từ mở bảng chọn hero')
    g.tap(389, 90); c.ok(ev("G.save.hero") == 'hunter', 'chọn hero')
    close()
    seat = ev(f"(() => {{ const S = {VS}.state; S.x = 262; S.y = 176; S.face = 1; S.cam = 22; S.path = null; for (const w of S.wp) {{ w.x = 240; w.y = 176; }} return [186, 134]; }})()"); g.wait(500)
    tx, ty = scr(seat[0], seat[1] - 10); g.tap(tx, ty); g.wait(200); settle("G.save.hero === 'smith'")
    c.ok(ev("G.save.hero") == 'smith', 'chạm bé Thợ Rèn đang ngồi ở sân đình thì đổi lại sang bé đó')
    visit('tu'); g.tap(389, 90); close()
    c.ok(visit('do') and tab() == 'skill', 'Cụ Đồ mở cây kỹ năng')
    g.tap(434, 129); c.ok(ev("G.save.heroes.hunter.sk.atk") == 1, 'học kỹ năng')
    g.tap(434, 171); g.tap(434, 213)
    c.ok(ev("G.save.heroes.hunter.sk.def") == 1 and ev("G.save.heroes.hunter.sk.elem") == 0, 'hết điểm thì không học thêm được')
    g.tap(311, 80); c.ok(tab() == 'help', 'thẻ Hướng dẫn ở chỗ Cụ Đồ (thẻ giữa trong ba thẻ, thẻ thứ ba là Bảng vàng)')
    g.tap(452, 250); c.ok(ev("G.villageApi.V.page") == 1, 'lật trang hướng dẫn'); close()
    # ---- Anh Mõ: cài đặt
    c.ok(visit('mo') and tab() == 'settings', 'Anh Mõ mở cài đặt')
    s0 = ev("G.save.sound"); g.tap(264, 88); c.ok(ev("G.save.sound") != s0, 'bật tắt âm thanh')
    g.tap(264, 210); c.ok(ev("G.villageApi.V.confirm") is True, 'hỏi lại trước khi xoá')
    g.tap(224, 214); c.ok(ev("G.villageApi.V.confirm") is False and ev("G.save.gold") > 0, 'Thôi thì không xoá')
    g.tap(264, 210); g.tap(352, 214)
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
