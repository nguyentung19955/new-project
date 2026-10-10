"""Chụp ảnh kiểm tra HUD, màn đăng nhập, túi đồ, bảng vàng ở ba cỡ màn hình (Giai đoạn 4 yêu cầu 2).
Chạy từ thư mục game:  python3 tests/hud_shots.py [thư mục ra] [cỡ...]
  cỡ: may (960x540), ngang (điện thoại ngang 844x390), doc (điện thoại dọc 390x844). Không ghi thì chụp cả ba.
Ảnh để tự xem bằng mắt; bài báo lỗi JS nếu có (trả mã lỗi 1)."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL = 'file://' + ROOT + '/index.html'
SIZES = {
    'may': dict(viewport={'width': 960, 'height': 540}, device_scale_factor=1),
    'ngang': dict(viewport={'width': 844, 'height': 390}, is_mobile=True, has_touch=True, device_scale_factor=2),
    'doc': dict(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, device_scale_factor=2),
}
# Vùng an toàn giả (tai thỏ bên trái, thanh điều hướng bên phải khi cầm ngang) để xem HUD có bị che không.
SAFE = "document.documentElement.style.setProperty('--sa-l', '44px'); document.documentElement.style.setProperty('--sa-r', '34px'); document.documentElement.style.setProperty('--sa-b', '21px'); window.dispatchEvent(new Event('resize'));"
HELP = r"""
window.T = {
  sc: null,
  freeze() { if (!T.sc) { const sc = G.scene; T.sc = sc; G.scene = { update() {}, draw() { sc.draw(); }, hide() {} }; } },
  thaw() { if (T.sc) { G.scene = T.sc; T.sc = null; } },
  rng(seed) { const r = G.srand(seed); Math.random = r; G.rnd = r; },
  start(r, i, seed) {
    T.thaw(); T.rng(seed * 13 + 5);
    G.testSave({ lvl: 6 + r * 7 + i, tier: Math.min(2, r), sharpen: 2, branch: 'fire', marks: 140 });
    G.save.potions = 2;
    G.startStage(r, i, 0, { kind: 'A', seed });
    const S = G.getRun(); S.fade = 0; return S;
  },
  // Giả lập mây: cần đăng nhập Google (như trên spiritblade.web.app) hoặc đã đăng nhập.
  cloud(state) {
    const old = G.cloud || {};
    G.cloud = Object.assign(Object.create(old), {
      why: '', status: 'ok', online: () => true, isGuest: () => state !== 'in', who: () => 'Tùng Nguyễn', isAdmin: () => false,
      label: () => state === 'in' ? 'Đã lưu lên mây' : 'Đang kết nối lưu mây', gMsg: '', google: () => new Promise(() => {}),
    });
  },
};
"""


def main():
    out = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1] in SIZES else os.path.join(ROOT, '..', 'docs', 'vfx', 'anh-hud')
    sizes = [a for a in sys.argv[1:] if a in SIZES] or list(SIZES)
    os.makedirs(out, exist_ok=True)
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        for sz in sizes:
            pg = b.new_page(**SIZES[sz])
            pg.on('pageerror', lambda e: errs.append(sz + ': ' + str(e)))
            pg.on('console', lambda m: errs.append(sz + ': ' + m.text) if m.type == 'error' and 'ERR_' not in m.text and 'fonts.g' not in m.text else None)
            pg.goto(URL)
            pg.wait_for_function('window.G && G.scene')
            pg.wait_for_timeout(500)
            pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'bot.js'))
            pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
            pg.evaluate(HELP)
            shot = lambda name, wait=400: (pg.wait_for_timeout(wait), pg.screenshot(path=os.path.join(out, sz + '-' + name + '.png')))
            # màn đăng nhập: không có mây (chạm để chơi), cần đăng nhập Google, đã đăng nhập
            pg.evaluate("() => { G.resetSave(); G.save.sound = false; G.setScene(G.Title); }")
            shot('dang-nhap-khong-may', 900)
            pg.evaluate("() => { T.cloud('need'); }")
            shot('dang-nhap-google')
            pg.evaluate("() => { T.cloud('in'); }")
            shot('dang-nhap-da-vao')
            # trong ải: phòng quái thường
            pg.evaluate("""() => { const S = T.start(0, 0, 3); S.tut = null; S.hint = null; const W = S.W; for (let k = 0; k < 240 && W.ents.length < 3; k++) G.sim(1); G.sim(40);
                S.P.hp = Math.round(S.P.maxhp * 0.62); S.P.mana = S.P.maxmana * 0.4; S.P.specCd = 0.5; S.P.skillCd = 3; T.freeze(); }""")
            shot('ai-thuong')
            # ải đầu (có lời chỉ dẫn)
            pg.evaluate("""() => { T.thaw(); G.testSave({ lvl: 1 }); G.save.tut.done = false; G.startStage(0, 0, 0, { kind: 'A', seed: 3 }); const S = G.getRun(); S.fade = 0; G.sim(60); T.freeze(); }""")
            shot('ai-huong-dan')
            # phòng trùm
            pg.evaluate("""() => { const S = T.start(0, 4, 5); S.tut = null; S.hint = null; G.testGoto('boss'); G.sim(200); const b = S.W.boss; if (b) b.hp = b.maxhp * 0.55; G.sim(5); T.freeze(); }""")
            shot('ai-trum')
            # tạm dừng → hành trang (chỉ xem)
            pg.evaluate("""() => { T.thaw(); const S = G.getRun(); S.mode = 'bag'; G.hanhTrang.tab = 'hero'; T.freeze(); }""")
            shot('tui-do-ai')
            # hành trang ở làng: các thẻ
            for tab in ('hero', 'weapon', 'outfit'):
                pg.evaluate("""(t) => { T.thaw(); G.testSave({ lvl: 12, tier: 2 }); G.setScene(G.Village); G.hanhTrang.openVillage(); G.hanhTrang.tab = t; }""", tab)
                shot('tui-do-' + tab, 500)
            # bảng vàng (từ màn chào)
            pg.evaluate("() => { G.setScene(G.Title); G.villageApi.V.tRank = true; }")
            shot('bang-vang', 600)
            pg.evaluate("""() => { const C0 = G.cloud; const names = ['Tùng', 'Mai Anh', 'Bé Na', 'Khách 4821', 'Hùng Rèn', 'Lan', 'Minh Khôi Nguyễn Văn', 'Cò']; 
                const patch = { online: () => true, user: { uid: 'u3' }, myScore: { power: 155 }, getMyScore: async () => ({ power: 155 }),
                  topScores: async (cat, cur, n) => ({ items: names.map((nm, i) => ({ uid: 'u' + i, name: nm, power: 420 - i * 37, hero: G.HKEYS[i % 4], far: 12 - i })), cursor: null, more: false }) };
                for (let o = C0; o && o !== Object.prototype; o = Object.getPrototypeOf(o)) Object.assign(o, patch); G.bangVang.reload(); }""")
            shot('bang-vang-mang', 600)
            pg.evaluate("() => { G.villageApi.V.tRank = false; }")
            pg.reload(); pg.wait_for_function('window.G && G.scene'); pg.wait_for_timeout(300)
            pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'bot.js')); pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js')); pg.evaluate(HELP)
            # phòng tinh anh
            pg.evaluate("""() => { const S = T.start(0, 2, 7); S.tut = null; S.hint = null; G.testGoto('elite'); const W = S.W;
                for (let k = 0; k < 1500 && !W.ents.some((e) => e.role === 'elite'); k++) { if (W.ents.length && !(k % 30)) W.ents.length = 0; G.sim(1); } G.sim(30);
                const e = W.ents.find((q) => q.role === 'elite'); if (e) e.hp = e.maxhp * 0.7; G.sim(2); T.freeze(); }""")
            shot('ai-tinh-anh')
            # vùng an toàn giả: tai thỏ, thanh điều hướng (chỉ khi ngang)
            if sz == 'ngang':
                pg.evaluate(SAFE)
                pg.evaluate("""() => { const S = T.start(1, 1, 3); S.tut = null; S.hint = null; G.sim(60); T.freeze(); }""")
                shot('ai-tai-tho')
                pg.evaluate("() => { T.thaw(); G.resetSave(); G.setScene(G.Title); T.cloud('need'); }")
                shot('dang-nhap-tai-tho', 600)
            pg.close()
        b.close()
    print('lỗi JS:', errs or 'không có')
    return 1 if errs else 0


if __name__ == '__main__':
    sys.exit(main())
