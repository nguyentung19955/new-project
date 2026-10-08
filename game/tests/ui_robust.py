"""Kiểm tra độ bền: xoay màn hình giữa trận, ẩn trang, khung hình rất chậm, không có bộ nhớ lưu, bản lưu hỏng hoặc cũ.
Dùng: python3 tests/ui_robust.py [url]"""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ui_lib import *

url = sys.argv[1] if len(sys.argv) > 1 else None
KEY = 'linhkhi_save_v1'
BAD = {
    'không phải JSON': 'abc{{{',
    'null': 'null',
    'mảng': '[1,2,3]',
    'phiên bản lạ': '{"v":0,"gold":5}',
    'chỉ có v': '{"v":1}',
    'bản cũ thiếu trường': json.dumps({'v': 1, 'gold': 120, 'ore': 3, 'weapons': [{'id': 1, 'type': 'sword', 'tier': 0}, {'id': 2, 'type': 'bow', 'tier': 1}], 'carry': [1, 2], 'nextId': 3, 'hero': 'smith', 'heroes': {'smith': {'unlocked': True, 'lvl': 4, 'xp': 10}}, 'stars': {'0-0': 2}}),
    'trỏ tới vũ khí không có': json.dumps({'v': 1, 'weapons': [{'id': 7, 'type': 'spear', 'tier': 9, 'marks': {'fire': 'x'}, 'branch': 'gió', 'sharpen': 99}], 'carry': [3, 3], 'hero': 'ai đó', 'helm': 'h_khong_co', 'owned': {'helm': ['h_khong_co', 'h_r1'], 'armor': 5}, 'mats': [1], 'shards': 'x', 'gold': -5, 'forge': 99, 'stars': {'0-0': 9}}),
    'vũ khí rác': json.dumps({'v': 1, 'weapons': [None, 5, {'id': 1, 'type': 'súng'}, {'id': 2, 'type': 'bow'}, {'id': 2, 'type': 'bow'}], 'carry': 'x', 'heroes': {'smith': {'lvl': 3, 'sk': {'atk': 5, 'def': 5, 'elem': 5}}, 'hunter': 7}, 'sound': 'có'}),
}
WALK = """async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  G.save.sound = false;
  G.setScene(G.Village);
  for (const t of ['hub', 'map', 'forge', 'gear', 'hero', 'help', 'settings']) {
    G.villageApi.V.tab = t;
    for (const f of ['sharpen', 'tier', 'reforge', 'craft', 'up']) { G.villageApi.V.ftab = f; await wait(40); }
  }
  G.startStage(0, 0, 0); await wait(120); G.sim(200);
  for (let k = 1; k < G.getRun().rooms.length; k++) { G.gotoRoom(k); G.sim(40); await wait(40); }
  G.finishStage(true); await wait(120); // phòng cuối là phòng Trùm
  G.persist();
  return { carry: G.save.carry, n: G.save.weapons.length, hero: G.save.hero, gold: G.save.gold };
}"""

with sync_playwright() as p:
    allok = True
    # ---- bản lưu hỏng hoặc cũ
    c = Checker('bản lưu hỏng')
    for name, raw in BAD.items():
        g = Game(p, 'p169', url=url, fresh=False, init_script="try { localStorage.setItem(%s, %s); } catch (e) {}" % (json.dumps(KEY), json.dumps(raw)))
        try:
            r = g.ev(WALK)
            c.ok(not g.errs, f'{name}: lỗi {g.errs[:2]}')
            c.ok(r['n'] >= 2 and r['carry'][0] is not None and r['carry'][0] != r['carry'][1] and r['hero'] == 'smith' and r['gold'] >= 0, f'{name}: bản lưu sau khi sửa chưa hợp lệ {r}')
        except Exception as e:
            c.ok(False, f'{name}: {str(e)[:200]}')
        g.close()
    g = Game(p, 'p169', url=url, fresh=False, init_script="try { localStorage.setItem(%s, %s); } catch (e) {}" % (json.dumps(KEY), json.dumps(BAD['bản cũ thiếu trường'])))
    c.ok(g.ev("G.save.gold") == 120 and g.ev("G.save.heroes.smith.lvl") == 4 and g.ev("G.save.stars['0-0']") == 2, 'bản lưu cũ giữ được tiến trình')
    g.close()
    allok &= c.done()

    # ---- không có bộ nhớ lưu
    c = Checker('không lưu được')
    g = Game(p, 'p169', url=url, fresh=False, init_script="Object.defineProperty(window, 'localStorage', { get() { throw new Error('bị chặn'); } });")
    try:
        r = g.ev(WALK); c.ok(r['n'] >= 2, 'vẫn chơi được khi không có bộ nhớ lưu')
    except Exception as e:
        c.ok(False, 'không có bộ nhớ lưu: ' + str(e)[:200])
    allok &= c.done(g); g.close()

    # ---- xoay màn hình, ẩn trang, khung hình chậm
    c = Checker('xoay, ẩn trang, khung hình chậm')
    g = Game(p, 'phone', url=url); ev = g.ev
    ev("G.save.tut.done = true; G.startStage(0, 1, 0, { kind: 'A', seed: 1 }); G.gotoRoom(G.getRun().rooms.indexOf('chest'))"); g.wait(400)  # phòng rương: không có quái
    bp = lambda n: ev(f"G.stageUi.btnPos('{n}')")[:2]
    g.down(60, 200); g.move(100, 200); g.wait(150)
    g.pg.set_viewport_size({'width': 390, 'height': 844}); g.wait(400)
    c.ok(ev("G.portrait") is True and ev("G.cy") > 0, 'xoay dọc: nút dời xuống dưới khung hình')
    c.ok(ev("G.pointers.size") == 0, 'xoay máy thì bỏ các ngón đang giữ')
    g.up(); g.wait(80)
    c.ok(ev("G.scene === G.StageScene && G.getRun().mode") == 'play', 'xoay máy không bấm nhầm gì')
    ui = ev("(() => { const u = document.getElementById('ui'), r = u.getBoundingClientRect(); return [u.width, u.height, r.width, r.height, devicePixelRatio]; })()")
    c.ok(abs(ui[0] - ui[2] * min(3, ui[4])) < 2 and abs(ui[1] - ui[3] * min(3, ui[4])) < 2, f'lớp chữ khớp kích thước mới {ui}')
    ev("window.__sw = 0; const f = G.sfx; G.sfx = function (n, k) { if (n === 'swing') window.__sw++; return f(n, k); }")
    x, y = bp('atk'); g.down(x, y); g.wait(700); g.up(); g.wait(60)
    c.ok(ev("window.__sw") >= 1, 'sau khi xoay dọc nút Đánh vẫn bấm được')
    a = ev("G.getRun().P.x"); g.down(60, 300); g.move(100, 300); g.wait(300); g.up()
    c.ok(ev("G.getRun().P.x") > a + 5, 'cần điều khiển chạy ở vùng dưới khung hình khi cầm dọc')
    g.pg.set_viewport_size({'width': 844, 'height': 390}); g.wait(400)
    c.ok(ev("G.portrait") is False and ev("G.cy") == 0, 'xoay ngang lại')
    sc = ev("(() => { const s = document.getElementById('stage').getBoundingClientRect(), f = document.getElementById('fit').getBoundingClientRect(); return [s.width, s.height, f.width, f.height, document.documentElement.scrollHeight, innerHeight]; })()")
    c.ok(sc[1] <= sc[3] + 1 and sc[0] <= sc[2] + 1 and sc[4] <= sc[5], f'khung game nằm gọn trong màn hình, trang không cuộn {sc}')
    for (w, h) in [(320, 180), (1024, 1366), (2000, 500), (200, 120)]:
        g.pg.set_viewport_size({'width': w, 'height': h}); g.wait(200)
    g.pg.set_viewport_size({'width': 844, 'height': 390}); g.wait(300)
    # mất tiêu điểm lúc đang giữ cần
    g.down(60, 200); g.move(100, 200); g.wait(100)
    ev("window.dispatchEvent(new Event('blur'))"); g.wait(100)
    a = ev("G.getRun().P.x"); g.wait(200)
    c.ok(ev("G.pointers.size") == 0 and abs(ev("G.getRun().P.x") - a) < 0.5, 'mất tiêu điểm thì nhả hết điều khiển')
    g.up(); g.wait(60)
    # trang bị ẩn
    ev("Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange'))"); g.wait(150)
    c.ok(ev("G.getRun().mode") == 'paused', 'trang bị ẩn thì tự tạm dừng')
    ev("Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange'))"); g.wait(100)
    c.ok(ev("G.getRun().mode") == 'paused', 'hiện lại vẫn tạm dừng, chờ người chơi bấm')
    g.tap(240, 100); c.ok(ev("G.getRun().mode") == 'play', 'bấm Chơi tiếp sau khi quay lại')
    # khung hình rất chậm
    t0 = ev("G.time")
    ev("(() => { const e = performance.now() + 1500; while (performance.now() < e) {} })()"); g.wait(120)
    dt = ev("G.time") - t0
    c.ok(dt < 0.6, f'treo 1,5 giây thì game không chạy bù dồn (game trôi {dt:.2f} giây)')
    t0 = ev("G.time"); g.wait(1000); dt = ev("G.time") - t0
    c.ok(0.7 < dt < 1.3, f'sau đó chạy lại đúng nhịp ({dt:.2f} giây mỗi giây)')
    # chặn cuộn và phóng to
    c.ok(ev("getComputedStyle(document.getElementById('fit')).touchAction") == 'none', 'vùng game chặn cuộn và phóng to bằng ngón')
    c.ok(ev("(() => { const e = new Event('contextmenu', { cancelable: true, bubbles: true }); document.getElementById('ui').dispatchEvent(e); return e.defaultPrevented; })()"), 'chặn bảng chọn khi nhấn giữ')
    allok &= c.done(g); g.close()
    sys.exit(0 if allok else 1)
