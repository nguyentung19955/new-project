"""Phần giao diện của tests/chuong.py: chạm thật (Playwright, tests/ui_lib.py) ở khung ngang (phone) và khung dọc bị xoay (port).
  - Cụ Đồ, thẻ Cây chưởng: chạm thẻ, chạm nút để chọn rồi chạm lần nữa để học, nút Học, nút còn khoá không học được,
    "Dùng cây này" hỏi lại rồi đổi cây và trả điểm, không chữ nào tràn khung.
  - Trong ải: chạm nút Chưởng thì bắn (tốn mana); giữ nút Chưởng (Hỏa chưởng có Tích lực) thì tích, thả ra mới bắn.
  - Hành trang trong ải, thẻ Kỹ năng > Cây chưởng: chỉ xem (không có nút Học, Dùng cây này; chạm nút không học).
  - Ở làng: Hành trang, thẻ Kỹ năng > Cây chưởng học được; mẹo lần đầu có điểm chưởng."""
import os
from ui_lib import Game, Checker, ROOT

SETUP = ROOT + '/tests/setup.js'


def one(p, size, verbose):
    g = Game(p, size)
    g.pg.add_script_tag(path=SETUP)
    c = Checker('chưởng: giao diện ' + size)
    ev = g.ev
    hs = "G.save.heroes.smith"
    pts = lambda: ev(f"G.chuong.pts({hs}, 'smith').left")
    rank = lambda cay, i: ev(f"(({hs}.ch.cay === '{cay}') ? ({hs}.ch.n['{i}'] | 0) : -1)")
    over = lambda: ev("G.chuongUI.texts.filter((t) => t.w > t.max + 0.6).map((t) => t.s)")
    ev("G.testSave({ hero: 'smith', lvl: 12, tier: 1 }); G.save.heroes.smith.ch = { cay: 'hoa', n: {} }; G.save.stars = { '0-0': 3 }; G.setScene(G.Village)"); g.wait(300)
    # mẹo lần đầu có điểm chưởng (ở làng)
    ev("G.villageScene.state.hintT = 0; G.villageScene.state.msgT = 0"); g.wait(200)
    c.ok(not ev("!!G.save.tut.chTip"), 'chưa mở thẻ Cây chưởng thì làng còn nhắc (mẹo lần đầu)')
    c.ok(ev("G.villageScene.state.news.do") is True, 'Cụ Đồ có dấu chấm than khi còn điểm chưởng')
    # Cụ Đồ: chạm thẻ Cây chưởng
    ev("G.villageApi.open('do')"); g.wait(200)
    g.tap(273, 80); g.wait(200)
    c.ok(ev("G.villageApi.V.tab") == 'chuong', 'chạm thẻ "Cây chưởng" ở Cụ Đồ')
    c.ok(ev("!!G.save.tut.chTip"), 'đã mở thẻ Cây chưởng: thôi nhắc mẹo')
    c.ok(pts() == 12, f'cấp 12 có 12 điểm chưởng ({pts()})')
    xy = ev("G.chuongUI.nodeXY('hoa', 'luc')")
    g.tap(*xy); g.wait(150)
    c.ok(rank('hoa', 'luc') == 0 and ev("G.chuongUI.sel && G.chuongUI.sel.id") == 'luc', 'chạm nút lần đầu: chọn để xem mô tả (chưa học)')
    g.tap(*xy); g.wait(150)
    c.ok(rank('hoa', 'luc') == 1 and pts() == 11, 'chạm lần nữa: học 1 bậc, bớt 1 điểm')
    g.tap(*ev("G.chuongUI.boxXY('learn')")); g.wait(150)
    c.ok(rank('hoa', 'luc') == 2 and pts() == 10, 'bấm nút Học: thêm 1 bậc')
    t = ev("G.chuongUI.nodeXY('hoa', 'tich')"); g.tap(*t); g.wait(120); g.tap(*t); g.wait(150)
    c.ok(rank('hoa', 'tich') == 0 and pts() == 10, 'nút còn khoá (cần dồn 10 điểm) không học được')
    t = ev("G.chuongUI.nodeXY('doc', 'luc')"); g.tap(*t); g.wait(120); g.tap(*t); g.wait(150)
    c.ok(rank('hoa', 'luc') == 2 and pts() == 10, 'chạm nút của cây chưa dùng: chỉ xem, không học')
    bad = over(); c.ok(not bad, f'không chữ nào tràn khung trên thẻ Cây chưởng {bad[:3]}')
    u = ev("G.chuongUI.boxXY('use/bang')"); g.tap(*u); g.wait(150)
    c.ok(ev(f"{hs}.ch.cay") == 'hoa', 'bấm "Dùng cây này" khi đã học điểm: hỏi lại trước, chưa đổi')
    g.tap(*u); g.wait(200)
    c.ok(ev(f"{hs}.ch.cay") == 'bang' and pts() == 12 and ev("G.save.gold") == 0, 'bấm lần nữa: đổi sang Băng chưởng, trả lại hết điểm, không tốn vàng')
    u = ev("G.chuongUI.boxXY('use/hoa')"); g.tap(*u); g.wait(200)
    c.ok(ev(f"{hs}.ch.cay") == 'hoa', 'chưa học điểm nào thì đổi cây ngay, không cần hỏi')
    g.shot('/tmp/claude-0/-home-claude-new-project/3b3e2f92-0192-5fb1-add9-ffdd7ce9db26/scratchpad/ui_' + size + '.png') if verbose else None
    # Hành trang ở làng: thẻ Kỹ năng > Cây chưởng học được
    ev("G.villageApi.goHub()"); g.wait(150)
    ev("G.hanhTrang.openVillage(); G.hanhTrang.tab = 'skill'"); g.wait(200)
    g.tap(16 + 124 + 60, 92 + 7); g.wait(200)
    c.ok(ev("G.hanhTrang.ktab") == 'chuong', 'Hành trang, thẻ Kỹ năng: chạm "Cây chưởng"')
    t = ev("G.chuongUI.nodeXY('hoa', 'no')"); g.tap(*t); g.wait(120); g.tap(*t); g.wait(150)
    c.ok(rank('hoa', 'no') == 1, 'ở làng: học nút trong Hành trang')
    bad = over(); c.ok(not bad, f'không chữ nào tràn khung trong Hành trang {bad[:3]}')
    ev("G.villageApi.goHub()"); g.wait(150)
    # trong ải: nút Chưởng
    ev(f"G.save.heroes.smith.ch.n = {{ luc: 5, no: 5, tich: 2 }}; G.startStage(0, 1, 0)"); g.wait(600)
    RUN = "G.getRun()"; P = RUN + ".P"
    ev("(() => { const W = G.getWorld(); W.waves = []; W.spawns = []; for (const e of W.ents) e.dead = true; W.ents = []; })()")
    ev(P + ".mana = 100; " + P + ".skillCd = 0; " + P + ".inv = 99"); g.wait(100)
    x, y = ev("G.stageUi.btnPos('skill')")[:2]
    g.down(x, y); g.wait(60); g.up(); g.wait(120)
    m = ev(P + ".mana")
    c.ok(m <= 100 - ev("G.CHUONG.cost") + 2, f'chạm nút Chưởng trong ải: bắn, tốn mana ({m})')
    g.wait(1200); ev(P + ".mana = 100; " + P + ".skillCd = 0"); g.wait(50)
    g.down(x, y); g.wait(700)
    holding = ev(P + ".chHold") and ev(P + ".mana") >= 99 and ev("G.chuong.chargeOf(" + P + ")") > 0.3
    g.up(); g.wait(150)
    c.ok(holding and ev(P + ".mana") < 80, 'giữ nút Chưởng (Hỏa chưởng có Tích lực): đang tích thì chưa bắn, thả ra mới bắn')
    # Hành trang trong ải: chỉ xem
    ev(RUN + ".mode = 'paused'"); g.wait(150)
    g.tap(240, 237); g.wait(250)
    c.ok(ev(RUN + ".mode") == 'bag', 'bảng Tạm dừng: mở Hành trang (chỉ xem)')
    ev("G.hanhTrang.tab = 'skill'; G.hanhTrang.ktab = 'chuong'"); g.wait(200)
    r0 = rank('hoa', 'vet')
    t = ev("G.chuongUI.nodeXY('hoa', 'vet')"); g.tap(*t); g.wait(120); g.tap(*t); g.wait(150)
    c.ok(rank('hoa', 'vet') == r0 and ev("!G.chuongUI.boxes.learn && !G.chuongUI.boxes['use/doc']"), 'trong ải: Cây chưởng chỉ xem (không Học, không đổi cây)')
    bad = over(); c.ok(not bad, f'không chữ nào tràn khung (chỉ xem) {bad[:3]}')
    ok = c.done(g)
    g.close()
    return ok


def run(p, verbose=False):
    good = True
    for size in ['phone', 'port']:
        good = one(p, size, verbose) and good
    return good
