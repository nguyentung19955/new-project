"""Luyện vũ khí (phiên 1) + LƯU MÂY / ĐĂNG NHẬP GOOGLE / ?cloud=0: bản lưu cũ trên mây hoặc trên máy được chuyển MỘT lần, trường mới
(w.luyen, sv.nlr, sv.luyenChuyen, w.hcCu) lên mây và về máy đúng, tải lại không chuyển / hoàn lần hai. Firebase giả trong trang
(tests/fake_firebase.js, như tests/may.py), không cần mạng.

  python3 tests/luyen_may.py
"""
import os, sys, json, copy
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ui_lib import Game, Checker, ROOT, URL
from playwright.sync_api import sync_playwright

FAKE = open(os.path.join(ROOT, 'tests', 'fake_firebase.js'), encoding='utf-8').read()
ck = Checker('luyen_may')
_ok = ck.ok
ck.ok = lambda c, m: (print('  đạt:', m) if c else None, _ok(c, m))[1]
KEY = 'linhkhi_save_v1'
BTN_GOOGLE = (233, 154)


def seed(local=None, cloud=None, user=None):
    js = "if (!sessionStorage.__seeded) { sessionStorage.__seeded = 1;"
    if local is not None:
        js += f"localStorage.setItem('{KEY}', {json.dumps(json.dumps(local))});"
    if cloud is not None:
        js += f"localStorage.setItem('__fakefs', {json.dumps(json.dumps(cloud))});"
    if user is not None:
        js += f"localStorage.setItem('__fakeauth', {json.dumps(json.dumps(user))});"
    return js + "}\n" + FAKE


def online(g, ms=4000):
    g.pg.wait_for_function("G.cloud.online()", timeout=ms)


def ban_cu(g, gold):
    """Bản lưu LUẬT CŨ (chưa chuyển): kiếm Thành hình Lửa +9 bậc Tím, 40 quặng, 6 đá, 1 bùa, lò 3, đã hạ Mộc Tinh + Ngư Tinh."""
    s = g.ev("""() => { const s = G.newSave(); for (const w of s.weapons) delete w.luyen; delete s.nlr; delete s.luyenChuyen;
      const w = s.weapons.find((x) => x.type === 'sword'); w.marks = { fire: G.MARKS[1], poison: 0, ice: 0 }; w.branch = 'fire'; w.sharpen = 9;
      w.ep = { b: 3, d: [{ m: 'linhKhi', q: 1 }], may: {} };
      s.ore = 40; s.daBac = 6; s.buaBac = 1; s.forge = 3; s.heroes.smith.lvl = 18;
      for (let r = 0; r < 2; r++) for (let i = 0; i < 5; i++) s.stars[r + '-' + i] = 3;
      return s; }""")
    s['gold'] = gold
    return s


def trang(g):
    return g.ev("""(() => { const s = G.save, w = s.weapons.find((x) => x.type === 'sword');
      return { c: s.luyenChuyen, L: G.luyen.cap(w), nlr: s.nlr, gold: s.gold, ore: s.ore, sh: w.sharpen, hc: !!w.hcCu, uid: G.cloud.user && G.cloud.user.uid }; })()""")


def may(g, uid):
    d = g.ev(f"window.__fs['linhkhi_users/{uid}']")
    if not d or not d.get('save'):
        return None
    s = json.loads(d['save'])
    w = [x for x in s['weapons'] if x['type'] == 'sword'][0]
    return {'c': s.get('luyenChuyen'), 'L': w.get('luyen'), 'nlr': s.get('nlr'), 'gold': s.get('gold'), 'ore': s.get('ore'), 'sh': w.get('sharpen'), 'hc': 'hcCu' in w}


with sync_playwright() as p:
    tmp = Game(p, 'phone')
    cu = ban_cu(tmp, 500)
    tmp.close()

    print('• Bản cũ trên mây (máy mới, tài khoản khách đã có) → chuyển một lần, đẩy bản đã chuyển lên mây')
    cloud = dict(copy.deepcopy(cu), savedAt=5000, owner='khachA')
    g = Game(p, 'phone', fresh=False, init_script=seed(None, {'linhkhi_users/khachA': {'save': json.dumps(cloud), 'updatedAt': 5000, 'prog': 1, 'v': 1, 'ver': 'x'}}, {'uid': 'khachA', 'isAnonymous': True}))
    online(g); g.wait(5000)
    a = trang(g)
    ck.ok(a['c'] == 1 and a['L'] == 9 and a['nlr'] >= 40 + 12 + 6 and a['ore'] == 40 and a['sh'] == 9 and a['hc'], f'bản trên mây chuyển sang Luyện: kiếm Luyện 9, NLR {a["nlr"]}, quặng / mài cũ giữ ({a})')
    m = may(g, 'khachA')
    ck.ok(m and m['c'] == 1 and m['L'] == 9 and m['nlr'] == a['nlr'] and m['gold'] == a['gold'] and m['hc'], f'mây nhận bản đã chuyển (luyenChuyen, w.luyen, nlr, w.hcCu): {m}')
    g.ev("location.reload()"); g.pg.wait_for_function('window.G && G.scene'); online(g); g.wait(5000)
    b = trang(g)
    ck.ok(b['L'] == a['L'] and b['nlr'] == a['nlr'] and b['gold'] == a['gold'], f'tải lại: không chuyển / hoàn lần hai ({b})')
    ck.ok(g.ev("!!localStorage.getItem('linhkhi_save_v1_truoc_luyen')"), 'bản gốc chép sang khoá sao lưu trên máy')
    ck.done(g); g.close()

    print('• Bản cũ trên máy, mây trống (khách mới) → chuyển, đẩy lên; tiêu NLR lưu lên mây')
    g = Game(p, 'phone', fresh=False, init_script=seed(dict(copy.deepcopy(cu), savedAt=9000)))
    online(g); g.wait(5000)
    a = trang(g); uid = a['uid']
    m = may(g, uid)
    ck.ok(a['c'] == 1 and a['L'] == 9 and m and m['L'] == 9 and m['nlr'] == a['nlr'], f'máy chuyển rồi đẩy lên mây ({a} | {m})')
    g.ev("(() => { const s = G.save; s.gold = 5000; s.linhKhi = 500; s.mats = [20, 20, 20]; s.shards = s.shards.map(() => 3); const w = s.weapons.find((x) => x.type === 'sword'); G.luyen.nang(s, w); G.persist(); })()")
    g.wait(5000)
    m2 = may(g, uid)
    ck.ok(m2 and m2['L'] == 10 and m2['nlr'] == a['nlr'] - 50, f'luyện lên 10 (−50 NLR) → mây cập nhật: {m2}')
    print('• Đăng nhập Google: giữ tiến trình Luyện')
    g.ev("G.setScene(G.Village); G.villageApi.open('mo'); G.villageApi.V.tab = 'settings'"); g.wait(200)
    g.tap(*BTN_GOOGLE); g.wait(800)
    c = trang(g)
    ck.ok(c['uid'] == uid and c['L'] == 10 and c['nlr'] == m2['nlr'] and not g.ev("G.cloud.user.isAnonymous"), f'nối Google: giữ uid, cấp Luyện, NLR ({c})')
    g.ev("G.save.gold += 1; G.persist()"); g.wait(5000)
    m3 = may(g, uid)
    ck.ok(m3 and m3['L'] == 10 and m3['nlr'] == c['nlr'], f'sau khi nối Google, lưu lên mây vẫn đủ trường mới: {m3}')
    ck.done(g); g.close()

    print('• ?cloud=0: chỉ lưu trên máy, trường mới lưu và nạp đúng')
    g = Game(p, 'phone', url=URL + '?cloud=0', fresh=False, init_script=f"if (!sessionStorage.__s) {{ sessionStorage.__s = 1; localStorage.setItem('{KEY}', {json.dumps(json.dumps(cu))}); }}")
    g.wait(300)
    a = g.ev("({ off: !G.cloud || !G.cloud.online || !G.cloud.online(), c: G.save.luyenChuyen, L: G.luyen.cap(G.save.weapons.find((x) => x.type === 'sword')), nlr: G.save.nlr })")
    g.ev("G.persist()")
    raw = json.loads(g.ev(f"localStorage.getItem('{KEY}')"))
    w = [x for x in raw['weapons'] if x['type'] == 'sword'][0]
    ck.ok(a['off'] and a['c'] == 1 and a['L'] == 9 and raw.get('luyenChuyen') == 1 and w.get('luyen') == 9 and raw.get('nlr') == a['nlr'], f'?cloud=0: chuyển và lưu trên máy ({a})')
    g.ev("location.reload()"); g.pg.wait_for_function('window.G && G.scene'); g.wait(300)
    b = g.ev("({ L: G.luyen.cap(G.save.weapons.find((x) => x.type === 'sword')), nlr: G.save.nlr })")
    ck.ok(b['L'] == 9 and b['nlr'] == a['nlr'], f'?cloud=0 tải lại: y hệt ({b})')
    ck.done(g); g.close()
print('PASS' if not ck.fails else 'FAIL')
sys.exit(1 if ck.fails else 0)
