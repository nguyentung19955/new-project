"""Kiểm tra BÁN ĐỒ LẤY VÀNG (js/ban_do.js) bằng chạm thật:
  Bà Hàng Xén: bán 1 trang phục, khoá/mở khoá, bán hết đồ Thường (bỏ qua đồ đang mặc và đồ khoá), bảng hỏi lại khi bán đồ Tím,
  chọn nhiều món, bán vũ khí (khoá bằng ổ khoá, chọn nhiều); Hành trang ở làng: Khoá, Bán, Chọn nhiều; trong ải không có nút bán.
  Vàng cộng đúng, lưu ngay; bản lưu cũ đọc được; khung ngang và cầm dọc (khung xoay); không chữ tràn khung.
Dùng: python3 tests/ban_do.py [phone|port|all] [--anh]   (--anh: chụp ảnh vào docs/ban-do/)"""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ui_lib import *

SETUP = os.path.join(ROOT, 'tests', 'setup.js')
DOCS = os.path.join(os.path.dirname(ROOT), 'docs', 'ban-do')
KEY = 'linhkhi_save_v1'
# Ghi mọi chữ vẽ ra (vị trí trái, phải) để tìm chữ tràn khung.
HOOK = r"""(() => {
  const ui = G.ui, old = ui.text;
  window.__txt = [];
  ui.text = function (s, x, y, o) {
    if (typeof s === 'string' && s) {
      o = o || {}; ui.font(Math.max(6.5, o.size || 9), o.bold);
      const w = G.ux.measureText(s).width, a = o.align || 'left', x0 = a === 'center' ? x - w / 2 : a === 'right' ? x - w : x;
      window.__txt.push([s, x0, x0 + w, y]);
    }
    return old.apply(this, arguments);
  };
})()"""
SAVE = """(() => {
  G.testSave({lvl: 9}); const sv = G.save, O = G.outfit; sv.gold = 1000; sv.tut.done = true;
  O.wear(sv, O.add(sv, 'mu_rom', 0));          // đang mặc, Thường
  O.add(sv, 'mu_tai_cao', 3);                    // Vàng
  O.add(sv, 'ao_vay', 2);                        // Tím
  for (let i = 0; i < 4; i++) O.add(sv, 'ao_vai', 0);   // 4 món Thường
  O.add(sv, 'khan_xep', 0).lock = 1;             // Thường đã khoá
  O.add(sv, 'ao_la', 1); O.add(sv, 'giap_tre', 1);      // 2 món Lam
  for (let i = 0; i < 5; i++) G.newWeapon(sv, 'spear', i % 2);   // rương: Thường, Lam, Thường, Lam, Thường
  G.persist(); G.setScene(G.Village);
})()"""
# Bà Hàng Xén: khung bảng 152..472, nội dung 160..464
TAB_W, TAB_BUY, TAB_SELL = (241, 57), (296, 57), (366, 57)
SELL_ONE, LOCK_ONE = (432, 219), (374, 219)
ASK_OK, ASK_NO = (373, 178), (251, 178)
MULTI_SELL = (386, 249)


def cell(i):
    """Ô thứ i trong lưới bán trang phục (6 cột)."""
    return 160 + (i % 6) * 31 + 1 + 14, 86 + (i // 6) * 31 + 14


def run(p, size, shots):
    g = Game(p, size)
    g.pg.add_script_tag(path=SETUP)
    c = Checker('bán đồ ' + size)
    ev = g.ev
    ev(SAVE); g.wait(500)
    ev(HOOK)
    gold = lambda: ev("G.save.gold")
    saved = lambda: json.loads(ev(f"localStorage.getItem('{KEY}')"))
    def shot(name):
        if shots and size == 'phone':
            os.makedirs(DOCS, exist_ok=True); g.shot(os.path.join(DOCS, name + '.png'))
    def over(x0, x1):
        """Chữ vẽ ra ngoài khung [x0, x1] trong khung hình vừa vẽ."""
        ev("window.__txt = []"); g.wait(80)
        return ev(f"window.__txt.filter((q) => q[3] > 40 && q[2] > {x0} + 1 && (q[1] < {x0} || q[2] > {x1})).map((q) => q[0] + ' [' + Math.round(q[1]) + '..' + Math.round(q[2]) + ']')")
    def bar(i):
        b = ev("G.banDo.bar")[i]
        return b[0] + b[2] / 2, b[1] + b[3] / 2
    order = lambda: ev("""(() => { const sv = G.save, O = G.outfit, w = (it) => sv.outfit.wear[O.ITEMS[it.k].slot] === it.id;
        return sv.outfit.items.slice().sort((a, b) => (w(b) - w(a)) || (b.r - a.r) || (O.SLOTS.indexOf(O.ITEMS[a.k].slot) - O.SLOTS.indexOf(O.ITEMS[b.k].slot)) || (a.id - b.id)).map((it) => it.k + ':' + it.id); })()""")
    idx = lambda k: next(i for i, s in enumerate(order()) if s.startswith(k + ':'))

    # ---- mở Bà Hàng Xén, thẻ Bán trang phục ----
    ev("G.villageScene.goNpc('xen', true)"); g.wait(400)
    c.ok(ev("G.villageApi.V.tab") == 'gear', 'mở bảng Bà Hàng Xén')
    g.tap(*TAB_SELL, 250)
    c.ok(ev("G.villageApi.V.gtab") == 'sell', 'chạm thẻ "Bán trang phục"')
    shot('1-ban-trang-phuc')
    o = over(152, 472); c.ok(not o, 'thẻ Bán trang phục: không chữ tràn khung: ' + '; '.join(o[:3]))

    # ---- bán 1 trang phục (Lam, không cần hỏi) ----
    g0, n0 = gold(), ev("G.save.outfit.items.length")
    i = idx('ao_la'); g.tap(*cell(i), 200)
    price = ev("G.banDo.oPrice(G.outfit.byId(G.save, G.villageApi.V.sel))")
    c.ok(ev("G.outfit.byId(G.save, G.villageApi.V.sel).k") == 'ao_la', 'chạm một ô thì chọn món đó')
    shot('2-chon-mot-mon')
    g.tap(*SELL_ONE, 250)
    c.ok(gold() == g0 + price and ev("G.save.outfit.items.length") == n0 - 1, f'bán 1 trang phục Lam: vàng {g0} -> {gold()} (+{price}), kho bớt 1')
    c.ok(saved()['gold'] == g0 + price and not any(x['k'] == 'ao_la' for x in saved()['outfit']['items']), 'bán xong lưu ngay vào máy')
    c.ok('Đã bán 1 món, +%d vàng.' % price == ev("G.villageApi.V.msg"), 'có lời báo "Đã bán 1 món, +... vàng"')
    c.ok(ev("(() => { const T = G.theme, old = T.resRow; let got = null; T.resRow = function (items) { if (!got) got = items; return old.apply(this, arguments); }; G.villageScene.drawTop(); T.resRow = old; return got && got[0][0] === 'gold' ? got[0][1] : null; })()") == gold(), 'số vàng trên dải góc trên cập nhật ngay')

    # ---- món đang mặc không bán được ----
    i = idx('mu_rom'); g.tap(*cell(i), 200); g0 = gold()
    g.tap(*SELL_ONE, 250)
    c.ok(gold() == g0 and any(x.startswith('mu_rom') for x in order()), 'món đang mặc: nút Bán bị khoá, không bán được')

    # ---- khoá / mở khoá ----
    i = idx('giap_tre'); g.tap(*cell(i), 200)
    g.tap(*LOCK_ONE, 250)
    c.ok(ev("G.save.outfit.items.find((x) => x.k === 'giap_tre').lock") == 1, 'bấm Khoá thì món bị khoá')
    c.ok(any(x['k'] == 'giap_tre' and x.get('lock') == 1 for x in saved()['outfit']['items']), 'khoá được lưu')
    g0 = gold(); g.tap(*SELL_ONE, 250)
    c.ok(gold() == g0, 'món đã khoá không bán được')
    g.tap(*LOCK_ONE, 250)
    c.ok(not ev("G.save.outfit.items.find((x) => x.k === 'giap_tre').lock"), 'bấm Mở khoá thì mở')
    g.tap(*LOCK_ONE, 250)  # khoá lại để thử "Bán hết Lam" bỏ qua

    # ---- bán hết đồ Thường: 4 áo vải (bỏ qua mũ rơm đang mặc và khăn xếp đã khoá), không cần hỏi (4 món) ----
    g0 = gold(); exp = 4 * ev("G.banDo.oPrice({k: 'ao_vai', r: 0})")
    g.tap(*bar(0), 250)
    left = [s.split(':')[0] for s in order()]
    c.ok(gold() == g0 + exp and 'ao_vai' not in left and 'mu_rom' in left and 'khan_xep' in left, f'Bán hết Thường: bán 4 áo vải (+{exp}), giữ mũ rơm đang mặc và khăn xếp đã khoá')
    c.ok(ev("G.villageApi.V.msg") == 'Đã bán 4 món, +%d vàng.' % exp, 'báo "Đã bán 4 món, +... vàng"')
    # Bán hết Lam: chỉ còn giáp tre đã khoá -> không bán gì
    g0 = gold(); g.tap(*bar(1), 250)
    c.ok(gold() == g0 and 'giap_tre' in [s.split(':')[0] for s in order()], 'Bán hết Lam bỏ qua món đã khoá')

    # ---- bán đồ Tím: hỏi lại ----
    i = idx('ao_vay'); g.tap(*cell(i), 200); g0 = gold()
    g.tap(*SELL_ONE, 250)
    c.ok(ev("!!G.banDo.ask") and gold() == g0, 'bán món Tím: hiện bảng hỏi lại, chưa bán')
    shot('3-bang-xac-nhan')
    o = over(152, 472); c.ok(not o, 'bảng hỏi lại: không chữ tràn khung: ' + '; '.join(o[:3]))
    g.tap(*LOCK_ONE, 200)  # chạm chỗ khác dưới bảng hỏi: không lọt xuống
    c.ok(ev("!!G.banDo.ask") and not ev("G.save.outfit.items.find((x) => x.k === 'ao_vay').lock"), 'đang hỏi lại thì chạm nút bên dưới không có tác dụng')
    g.tap(*ASK_NO, 250)
    c.ok(not ev("!!G.banDo.ask") and gold() == g0 and 'ao_vay' in [s.split(':')[0] for s in order()], 'bấm "Thôi, giữ lại": không bán')
    g.tap(*SELL_ONE, 250); g.tap(*ASK_OK, 250)
    c.ok(gold() == g0 + ev("G.banDo.O_PRICE[2]") and 'ao_vay' not in [s.split(':')[0] for s in order()], 'bấm Bán trong bảng hỏi: bán món Tím, cộng đúng vàng')

    # ---- chọn nhiều: thêm 5 món Thường rồi chọn 3 món ----
    ev("(() => { const sv = G.save, O = G.outfit; for (let i = 0; i < 5; i++) O.add(sv, 'ao_toi', 0); })()"); g.wait(150)
    g.tap(*bar(2), 200)
    c.ok(ev("G.banDo.multi") is True, 'bấm Chọn nhiều')
    ids = [s for s in order() if s.startswith('ao_toi:')]
    for s in ids[:3]: g.tap(*cell(order().index(s)), 150)
    g.tap(*cell(idx('mu_rom')), 150)  # món đang mặc: không chọn được
    c.ok(ev("G.banDo.ids.size") == 3, 'chạm 3 món thì đánh dấu 3 món (món đang mặc không chọn được)')
    pr = ev("G.banDo.oPrice({k: 'ao_toi', r: 0})")
    ev("window.__txt = []"); g.wait(100)
    c.ok(any(t[0] == 'Bán 3 món · %d vàng' % (3 * pr) for t in ev("window.__txt")), 'nút ghi "Bán 3 món · X vàng"')
    shot('4-chon-nhieu')
    o = over(152, 472); c.ok(not o, 'chọn nhiều: không chữ tràn khung: ' + '; '.join(o[:3]))
    g0 = gold(); g.tap(*MULTI_SELL, 250)
    c.ok(gold() == g0 + 3 * pr and len([s for s in order() if s.startswith('ao_toi:')]) == 2, f'bán 3 món một lúc: +{3 * pr}')
    # 5 món trở lên: hỏi lại
    ev("(() => { const sv = G.save, O = G.outfit; for (let i = 0; i < 4; i++) O.add(sv, 'ao_the', 0); })()"); g.wait(150)
    g.tap(*bar(2), 200)
    if not ev("G.banDo.multi"): g.tap(*bar(2), 200)
    for s in [s for s in order() if s.startswith('ao_toi:') or s.startswith('ao_the:')]: g.tap(*cell(order().index(s)), 120)
    c.ok(ev("G.banDo.ids.size") == 6, 'chọn 6 món')
    g0 = gold(); g.tap(*MULTI_SELL, 250)
    c.ok(ev("!!G.banDo.ask") and gold() == g0, 'bán từ 5 món trở lên: hiện bảng hỏi lại')
    g.tap(*ASK_OK, 250)
    c.ok(ev("G.save.gold") > g0 and ev("G.villageApi.V.msg").startswith('Đã bán 6 món'), 'bấm Bán: "Đã bán 6 món, +... vàng"')

    # ---- vũ khí: khoá bằng ổ khoá, bán hết Thường, chọn nhiều ----
    g.tap(*TAB_W, 250)
    c.ok(ev("G.villageApi.V.gtab") == 'weapon', 'thẻ Vũ khí')
    stash = lambda: ev("G.save.weapons.filter((w) => !G.save.carry.includes(w.id)).map((w) => [w.id, G.wRar(w), w.lock || 0])")
    st = stash(); first = st[0]
    g.tap(464 - 9, 141 + 11, 200)
    c.ok(ev(f"G.weaponById({first[0]}).lock") == 1, 'chạm ổ khoá ở mép phải dòng vũ khí thì khoá')
    shot('5-ban-vu-khi')
    o = over(152, 472); c.ok(not o, 'thẻ Vũ khí: không chữ tràn khung: ' + '; '.join(o[:3]))
    g0 = gold(); thuong = [w for w in st if w[1] == 0 and w[0] != first[0]]
    g.tap(*bar(0), 250)
    left = [w[0] for w in stash()]
    c.ok(gold() == g0 + 20 * len(thuong) and first[0] in left and all(w[0] not in left for w in thuong) and len(ev("G.save.carry.filter((id) => G.weaponById(id))")) == 2,
         f'Bán hết Thường (vũ khí): bán {len(thuong)} món, giữ món khoá và hai món đang mang')
    g.tap(*bar(2), 200)
    lam = [w for w in stash() if w[1] == 1]
    for k, w in enumerate(stash()):
        if w[1] == 1: g.tap(300, 141 + k * 23.5 + 11, 120)
    g0 = gold(); g.tap(*MULTI_SELL, 250)
    c.ok(gold() == g0 + 60 * len(lam) and first[0] in [w[0] for w in stash()], f'chọn nhiều vũ khí Lam rồi bán: +{60 * len(lam)}')
    g.tap(438, 57, 250)

    # ---- Hành trang ở làng ----
    ev("""(() => { const sv = G.save, O = G.outfit; O.add(sv, 'ao_vai', 0); O.add(sv, 'mu_tai_cao', 2); G.newWeapon(sv, 'hammer', 1); G.persist(); })()""")
    g.tap(454, 32, 300)
    c.ok(ev("G.villageApi.V.tab") == 'bag', 'mở Hành trang ở làng')
    tw = (448 - 15) / 6
    g.tap(16 + 2 * (tw + 3) + tw / 2, 78, 250)
    # chọn áo vải trong kho (lưới 7 cột, sắp theo bậc)
    ks = ev("""(() => { const sv = G.save, O = G.outfit; return sv.outfit.items.slice().sort((a, b) => (b.r - a.r) || (O.SLOTS.indexOf(O.ITEMS[a.k].slot) - O.SLOTS.indexOf(O.ITEMS[b.k].slot)) || (a.id - b.id)).map((it) => it.k); })()""")
    j = ks.index('ao_vai'); g.tap(18 + (j % 7) * 31 + 14, 166 + (j // 7) * 31 + 14, 200)
    c.ok(ev("G.outfit.byId(G.save, G.hanhTrang.osel).k") == 'ao_vai', 'Hành trang: chạm món trong kho')
    shot('6-hanh-trang-trang-phuc')
    o = over(8, 472); c.ok(not o, 'Hành trang thẻ Trang phục: không chữ tràn khung: ' + '; '.join(o[:3]))
    t = [x[0] for x in ev("window.__txt")]
    c.ok('Khoá' in t and any(s.startswith('Bán ') and s.endswith(' vàng') for s in t), 'Hành trang ở làng có nút Khoá và Bán cho món đang xem')
    g0 = gold(); pr = ev("G.banDo.oPrice({k: 'ao_vai', r: 0})")
    g.tap(360, 117, 250)
    c.ok(gold() == g0 + pr and 'ao_vai' not in ev("G.save.outfit.items.map((x) => x.k)"), f'Hành trang: bấm Bán thì bán (+{pr})')
    c.ok(saved()['gold'] == gold(), 'Hành trang: bán xong lưu ngay')
    # thẻ Vũ khí: khoá rồi bán món đầu trong rương
    g.tap(16 + 1 * (tw + 3) + tw / 2, 78, 250)
    shot('7-hanh-trang-vu-khi')
    o = over(8, 472); c.ok(not o, 'Hành trang thẻ Vũ khí: không chữ tràn khung: ' + '; '.join(o[:3]))
    top = ev("G.save.weapons.filter((w) => !G.save.carry.includes(w.id)).sort((a, b) => (G.wRar(b) - G.wRar(a)) || (b.sharpen - a.sharpen) || (a.id - b.id))[0].id")
    g.tap(306 + 47 + 24, 204 + 10, 200)   # Khoá
    c.ok(ev(f"G.weaponById({top}).lock") == 1, 'Hành trang: bấm Khoá vũ khí')
    g0 = gold(); g.tap(306 + 99 + 25, 204 + 10, 200)
    c.ok(gold() == g0 and ev(f"!!G.weaponById({top})"), 'Hành trang: vũ khí đã khoá không bán được')
    g.tap(306 + 47 + 24, 204 + 10, 200)   # Mở khoá
    g.tap(306 + 99 + 25, 204 + 10, 250)
    c.ok(gold() == g0 + 60 and not ev(f"!!G.weaponById({top})"), 'Hành trang: mở khoá rồi bán vũ khí Lam: +60')
    g.tap(438, 57, 250)

    # ---- trong ải: Hành trang chỉ xem, không có nút bán ----
    ev("G.startStage(0, 0, 0)"); g.wait(500)
    ev("G.keyP.Escape = true"); g.wait(300)
    g.tap(240, 237, 300)
    c.ok(ev("G.getRun().mode") == 'bag', 'trong ải mở Hành trang từ Tạm dừng')
    bad = []
    for k in (1, 2):
        g.tap(16 + k * (tw + 3) + tw / 2, 78, 250)
        ev("G.hanhTrang.osel = G.save.outfit.items[0] && G.save.outfit.items[0].id"); g.wait(120)
        ev("window.__txt = []"); g.wait(100)
        t = [x[0] for x in ev("window.__txt")]
        bad += [s for s in t if s.startswith('Bán') or s in ('Khoá', 'Mở khoá', 'Chọn nhiều')]
    c.ok(not bad, 'trong ải không thấy nút Bán, Khoá, Chọn nhiều: ' + ', '.join(bad[:4]))
    ev("G.getRun().quit = true; G.finishStage(false); G.setScene(G.Village)"); g.wait(300)

    # ---- bản lưu cũ ----
    old = ev("""(() => { const s = JSON.parse(JSON.stringify(G.save)); for (const w of s.weapons) delete w.lock; for (const it of s.outfit.items) delete it.lock; s.outfit.items[0].lock = 'có'; return JSON.stringify(s); })()""")
    r = ev("(s) => { const f = G.fixSave(JSON.parse(s)); return [f.weapons.every((w) => !('lock' in w)), f.outfit.items.slice(1).every((it) => !('lock' in it)), f.outfit.items[0].lock, f.outfit.items.length]; }", old)
    c.ok(r[0] and r[1] and r[2] == 1 and r[3] > 0, 'bản lưu cũ (không có trường khoá) đọc được, mặc định không khoá; giá trị lạ đổi thành khoá')
    ev("(s) => { localStorage.setItem('" + KEY + "', s); G.loadSave(); G.save.sound = false; G.setScene(G.Village); G.villageScene.goNpc('xen', true); }", old); g.wait(400)
    g.tap(*TAB_SELL, 250)
    c.ok(ev("G.villageApi.V.gtab") == 'sell' and not g.errs, 'bản lưu cũ mở thẻ Bán trang phục không lỗi')
    ok = c.done(g)
    g.close()
    return ok


if __name__ == '__main__':
    arg = [a for a in sys.argv[1:] if not a.startswith('--')]
    sizes = ['phone', 'port'] if not arg or arg[0] == 'all' else [arg[0]]
    good = True
    with sync_playwright() as p:
        for s in sizes:
            good = run(p, s, '--anh' in sys.argv) and good
    sys.exit(0 if good else 1)
