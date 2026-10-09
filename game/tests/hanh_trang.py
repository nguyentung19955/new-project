"""Kiểm tra bảng HÀNH TRANG (js/hanh_trang.js) bằng chạm thật: mở ở làng, đi qua đủ 6 thẻ, con số khớp dữ liệu, thay vũ khí,
mặc và tháo trang phục, học kỹ năng, xem chi tiết vũ khí, cuộn; mở từ bảng Tạm dừng trong ải thì chỉ xem (không thay, không học).
Chạy cả khung ngang (phone) và cầm dọc (port, khung game tự xoay). Không chữ nào tràn ra ngoài khung bảng.
Dùng: python3 tests/hanh_trang.py [phone|port|all] [--anh]   (--anh: chụp ảnh từng thẻ vào docs/hanh-trang/)"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ui_lib import *

SETUP = os.path.join(ROOT, 'tests', 'setup.js')
DOCS = os.path.join(os.path.dirname(ROOT), 'docs', 'hanh-trang')
TABS = ['hero', 'weapon', 'outfit', 'lk', 'skill', 'res']
TAB_NAME = {'hero': 'nhan-vat', 'weapon': 'vu-khi', 'outfit': 'trang-phuc', 'lk': 'linh-khi', 'skill': 'ky-nang', 'res': 'tai-nguyen'}
# Ghi lại mọi chữ vẽ trong bảng Hành trang (vị trí trái, phải theo bề rộng thật) để so số liệu và tìm chữ tràn khung.
HOOK = r"""(() => {
  const ui = G.ui, B = G.hanhTrang, old = ui.text, op = B.panel;
  window.__txt = []; window.__rec = false;
  ui.text = function (s, x, y, o) {
    if (window.__rec && !B.wv && typeof s === 'string') {
      o = o || {}; ui.font(Math.max(6.5, o.size || 9), o.bold);
      const w = G.ux.measureText(s).width, a = o.align || 'left', x0 = a === 'center' ? x - w / 2 : a === 'right' ? x - w : x;
      window.__txt.push([s, x0, x0 + w, y]);
    }
    return old.apply(this, arguments);
  };
  B.panel = function () { window.__txt = []; window.__rec = true; try { return op.apply(this, arguments); } finally { window.__rec = false; } };
})()"""
SAVE = ("G.testSave({lvl: 9, branch: 'fire', marks: 140, tier: 2}); const sv = G.save; sv.gold = 1234; sv.ore = 17; sv.stones = 2; sv.mats = [5, 6, 7]; sv.shards = [1, 2, 3];"
        "sv.heroes.smith.sk = {atk: 1, def: 0, elem: 0};"
        "G.newWeapon(sv, 'spear', 1); const h = G.newWeapon(sv, 'hammer', 3); h.affixes = ['mana', 'crit']; h.power = 'boss';"
        "const O = G.outfit; O.wear(sv, O.add(sv, 'ao_vay', 2)); O.add(sv, 'mu_tai_cao', 3); O.add(sv, 'mu_rom', 0); G.persist(); G.setScene(G.Village)")


def tab_xy(i):
    tw = (448 - 15) / 6
    return 16 + i * (tw + 3) + tw / 2, 78


def run(p, size, shots):
    g = Game(p, size)
    g.pg.add_script_tag(path=SETUP)
    c = Checker('hành trang ' + size)
    ev = g.ev
    ev(SAVE); g.wait(700)
    ev(HOOK)
    txt = lambda: ev("window.__txt.map((q) => q[0])")
    has = lambda s: any(s in t for t in txt())
    def over():
        """Chữ nằm ngoài khung bảng (8..472)."""
        return ev("window.__txt.filter((q) => q[1] < 9 || q[2] > 471).map((q) => q[0] + ' [' + Math.round(q[1]) + '..' + Math.round(q[2]) + ']')")
    def shot(name):
        if shots:
            os.makedirs(DOCS, exist_ok=True); g.shot(os.path.join(DOCS, name + '.png'))

    # ---- mở ở làng bằng nút túi vải ----
    c.ok(ev("G.villageApi.V.tab") == 'hub', 'đang ở làng')
    g.tap(454, 32, 300)
    c.ok(ev("G.villageApi.V.tab") == 'bag', 'chạm nút Hành trang ở góc làng thì mở bảng')
    bad = []
    for i, t in enumerate(TABS):
        x, y = tab_xy(i); g.tap(x, y, 250)
        c.ok(ev("G.hanhTrang.tab") == t, f'chạm thẻ {t}')
        o = over(); bad += [t + ': ' + s for s in o]
        if size == 'phone': shot('lang-' + str(i + 1) + '-' + TAB_NAME[t])
    c.ok(not bad, 'không chữ nào tràn khung bảng ở làng: ' + '; '.join(bad[:4]))

    # ---- số liệu khớp ----
    g.tap(*tab_xy(0), 250)
    pw = ev("G.power()"); P = ev("(() => { const P = G.buildPlayer(); return [P.maxhp, P.maxmana]; })()")
    t = txt()
    c.ok(('Sức mạnh ' + str(pw)) in t, f'thẻ Nhân vật ghi đúng sức mạnh {pw}')
    c.ok(str(P[0]) in t and str(P[1]) in t, f'thẻ Nhân vật ghi đúng máu {P[0]} và mana {P[1]}')
    c.ok('Cấp 9' in t, 'thẻ Nhân vật ghi đúng cấp')
    g.tap(*tab_xy(5), 250); t = txt()
    c.ok(all(v in t for v in ['1234', '17', '2', '5', '6', '7', '1', '3']), 'thẻ Tài nguyên ghi đúng số từng tài nguyên')
    c.ok(sum(1 for s in t if s.startswith('Dùng: ')) == 9 and sum(1 for s in t if s.startswith('Kiếm: ')) == 9, 'mỗi tài nguyên có dòng dùng để làm gì và kiếm ở đâu')
    g.tap(*tab_xy(3), 250); t = ' '.join(txt())
    L = ev("G.LINHKHI")
    c.ok(f"hạ tinh anh +{L['elite']}" in t and f"trùm nhỏ +{L['mini']}" in t and f"trùm vùng +{L['boss']}" in t and 'đang dính hệ +1' in t, 'thẻ Linh khí ghi nguồn linh khí đọc từ G.LINHKHI')
    c.ok('Lửa 140' in t and 'còn 160 tới 300' in t, 'thẻ Linh khí ghi đúng dấu ấn và còn bao nhiêu tới mốc')

    # ---- vũ khí: xem chi tiết, thay vũ khí, cuộn ----
    g.tap(*tab_xy(1), 250)
    t = txt()
    c.ok(any('Mỗi đòn trúng hồi thêm 1 mana' in s for s in t) and any('Vệt cháy: đã mở' in s for s in t), 'thẻ Vũ khí ghi dòng phụ và đặc trưng hệ')
    g.tap(404, 109, 250)
    c.ok(ev("G.villageApi.V.tab") == 'weapon', 'Xem chi tiết mở màn Xem vũ khí')
    g.tap(431, 37, 250)
    c.ok(ev("G.villageApi.V.tab") == 'bag', 'Quay lại về Hành trang')
    hid = ev("G.save.weapons.find((w) => w.type === 'hammer').id")
    g.tap(377, 232, 250)
    c.ok(ev("G.save.carry[0]") == hid, 'bấm Mang ô 1 thì thay vũ khí đang mang')
    c.ok(ev("JSON.parse(localStorage.getItem('linhkhi_save_v1')).carry[0]") == hid, 'thay vũ khí được lưu')
    g.down(240, 240); g.wait(60); g.move(240, 200); g.wait(60); g.move(240, 150); g.wait(80); g.up(); g.wait(150)
    c.ok(ev("G.hanhTrang.sc.weapon.y") > 20, 'kéo ngón lên thì danh sách cuộn')

    # ---- trang phục: mặc, tháo ----
    g.tap(*tab_xy(2), 250)
    mid = ev("G.save.outfit.items.find((x) => x.k === 'mu_tai_cao').id")
    g.tap(32, 180, 200)
    c.ok(ev("G.hanhTrang.osel") == mid, 'chạm món trong kho thì chọn món đó')
    g.tap(428, 99, 250)
    c.ok(ev("G.save.outfit.wear.hat") == mid, 'bấm Mặc thì đội mũ')
    c.ok(ev("G.outfit.look(G.save).hat") == 'mu_tai_cao', 'hình em bé đổi theo mũ mới')
    g.tap(428, 99, 250)
    c.ok(ev("G.save.outfit.wear.hat") is None, 'bấm Tháo ra thì tháo mũ')
    g.tap(428, 99, 250)

    # ---- kỹ năng: học ở làng ----
    ev("G.save.heroes.smith.lvl = 12")
    g.tap(*tab_xy(4), 250)
    g.tap(136, 136, 250)  # (thẻ Kỹ năng có thêm hàng thẻ con Cây kỹ năng | Cây chưởng nên nút Học nằm thấp hơn 18)
    c.ok(ev("G.save.heroes.smith.sk.atk") == 2, 'bấm Học thì học nút kế tiếp nhánh Công')

    # ---- đóng ----
    g.tap(438, 57, 250)
    c.ok(ev("G.villageApi.V.tab") == 'hub', 'bấm Xong thì về làng')

    # ---- trong ải: mở từ bảng Tạm dừng, chỉ xem ----
    ev("G.startStage(0, 0, 0)"); g.wait(500)
    ev("G.keyP.Escape = true"); g.wait(300)
    c.ok(ev("G.getRun().mode") == 'paused', 'Esc tạm dừng')
    if size == 'phone': shot('ai-0-tam-dung')
    g.tap(240, 237, 300)
    c.ok(ev("G.getRun().mode") == 'bag', 'chạm Hành trang trong bảng Tạm dừng thì mở bảng')
    bad = []
    for i, t in enumerate(TABS):
        g.tap(*tab_xy(i), 250)
        bad += [t + ': ' + s for s in over()]
        if size == 'phone': shot('ai-' + str(i + 1) + '-' + TAB_NAME[t])
    c.ok(not bad, 'không chữ nào tràn khung bảng trong ải: ' + '; '.join(bad[:4]))
    g.tap(*tab_xy(1), 250)
    t = txt()
    c.ok(not any(s.startswith('Mang ô') for s in t) and 'Về làng để thay' in t, 'trong ải không có nút Mang ô, có chữ Về làng để thay')
    before = ev("G.save.carry.slice()")
    g.tap(377, 232, 250)
    c.ok(ev("G.save.carry") == before, 'trong ải chạm chỗ nút thay không đổi vũ khí')
    g.tap(404, 109, 250)
    c.ok(ev("G.hanhTrang.wv") is True, 'trong ải vẫn xem chi tiết vũ khí được')
    if size == 'phone': shot('ai-7-xem-vu-khi')
    g.tap(431, 37, 250)
    c.ok(ev("G.hanhTrang.wv") is False and ev("G.getRun().mode") == 'bag', 'Quay lại từ chi tiết về Hành trang')
    g.tap(*tab_xy(2), 250)
    g.tap(32, 180, 200)
    w0 = ev("JSON.stringify(G.save.outfit.wear)")
    g.tap(428, 99, 250)
    c.ok(ev("JSON.stringify(G.save.outfit.wear)") == w0, 'trong ải không mặc, tháo được')
    g.tap(*tab_xy(4), 250)
    sk = ev("G.save.heroes.smith.sk.atk")
    g.tap(136, 118, 250)
    c.ok(ev("G.save.heroes.smith.sk.atk") == sk and not any(s == 'Học' for s in txt()), 'trong ải không học kỹ năng được')
    g.tap(438, 57, 250)
    c.ok(ev("G.getRun().mode") == 'paused', 'Quay lại thì về bảng Tạm dừng')
    g.tap(240, 237, 300); ev("G.keyP.Escape = true"); g.wait(250)
    c.ok(ev("G.getRun().mode") == 'paused', 'Esc trong Hành trang về bảng Tạm dừng')
    g.tap(240, 100, 250)
    c.ok(ev("G.getRun().mode") == 'play', 'Chơi tiếp vẫn ở chỗ cũ')

    # ---- bản lưu cũ (không có trang phục, ít trường) vẫn mở được ----
    ev("(() => { const s = G.newSave(); delete s.outfit; delete s.tut; localStorage.setItem('linhkhi_save_v1', JSON.stringify(s)); G.loadSave(); G.save.sound = false; G.setScene(G.Village); })()")
    g.wait(500); g.tap(454, 32, 300)
    for i in range(6): g.tap(*tab_xy(i), 150)
    c.ok(ev("G.villageApi.V.tab") == 'bag' and not g.errs, 'bản lưu cũ vẫn mở đủ 6 thẻ không lỗi')
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
