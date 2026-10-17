"""Chụp ảnh TRƯỚC / SAU cho phiên "Tư vấn 17/10 — dễ đọc" (hộp mẹo, thông báo trùm, nút Bình máu, HUD gọn, màn rộng).
KHÔNG chơi thử bằng tay: dựng cảnh bằng mã (G.startStage, G.testGoto, G.sim) rồi chụp màn hình headless.
Chạy từ gốc repo:
  python3 docs/review/ke-hoach-cai-thien/tu-van-17-10-de-doc/chup.py <trang .html đã build> <thư mục ra> <tiền tố> [cờ url, vd '&manrong=1']
  <trang>: dist/linh-khi.html của bản cần chụp (TRƯỚC: build ở commit trước phiên; SAU: game/dist/linh-khi.html hiện tại).
  (index.html chưa build không có ảnh AI nên Cu Tí / quái vẽ thiếu.)
In ra lỗi JS (nếu có) và các số đo (cỡ nút, khung hộp mẹo...) dạng JSON.
"""
import json, os, sys
from playwright.sync_api import sync_playwright

TRANG = os.path.abspath(sys.argv[1])
GAME = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'game')
OUT = os.path.abspath(sys.argv[2])
PRE = sys.argv[3]
CO = sys.argv[4] if len(sys.argv) > 4 else ''
URL = 'file://' + TRANG + '?cloud=0' + CO
SIZES = {
    '844x390': dict(viewport={'width': 844, 'height': 390}, is_mobile=True, has_touch=True, device_scale_factor=2),
    '1280x720': dict(viewport={'width': 1280, 'height': 720}, device_scale_factor=1),
}
HELP = r"""
window.T = {
  sc: null,
  freeze() { if (!T.sc) { const sc = G.scene; T.sc = sc; G.scene = { update() {}, draw() { sc.draw(); }, hide() {} }; } },
  thaw() { if (T.sc) { G.scene = T.sc; T.sc = null; } },
  rng(seed) { const r = G.srand(seed); Math.random = r; G.rnd = r; },
  start(r, i, seed, lvl) {
    T.thaw(); T.rng(seed * 13 + 5);
    G.testSave({ lvl: lvl || 6 + r * 7 + i, tier: Math.min(2, r), sharpen: 2, branch: 'fire', marks: 140 });
    G.save.potions = 2;
    G.startStage(r, i, 0, { kind: 'A', seed });
    const S = G.getRun(); S.fade = 0; return S;
  },
  // đặt Cu Tí và quái vào chỗ dễ nhìn (Cu Tí giữa-dưới sàn, quái phía trên / bên phải)
  bay(S) {
    const W = S.W, g = W.geo, P = S.P;
    P.x = g.fx0 + (g.fx1 - g.fx0) * 0.38; P.y = g.fy1 - 34; P.face = 1;
    const es = W.ents.filter((e) => e && !e.dead && !e.isBoss);
    es.forEach((e, k) => { e.x = g.fx0 + (g.fx1 - g.fx0) * (0.55 + 0.12 * (k % 3)); e.y = g.fy1 - 30 - 26 * Math.floor(k / 3) - (k % 2) * 14; });
  },
  doRa() {
    const S = G.getRun(), U = G.stageUi, o = {};
    if (U && U.boCuc && U.nutMoi && U.nutMoi()) { const B = U.boCuc(); for (const k of ['atk', 'dodge', 'special', 'skill', 'potion']) if (B[k]) o[k] = Math.round((B[k][2] + 1) * 2 * G.scale * 10) / 10; }
    o.hop = G.hudGon && G.hudGon.meoKhung ? G.hudGon.meoKhung() : null;
    o.hopPx = o.hop ? Math.round((o.hop[3] - o.hop[1]) * G.scale * 10) / 10 : null;
    return o;
  },
};
"""
SAN = """() => { const z = G.spriteCustom && G.spriteCustom.zed; if (!z) return true; for (const k of ['zed-moi','zed-vk']) { const q = z[k]; if (q && !q.ready && G.spriteCustom.canAnh) G.spriteCustom.canAnh(k); if (q && !q.ready) return false; } return true; }"""


def main():
    os.makedirs(OUT, exist_ok=True)
    errs, so = [], {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        for sz, opt in SIZES.items():
            pg = b.new_page(**opt)
            pg.on('pageerror', lambda e: errs.append(sz + ': ' + str(e)))
            pg.on('console', lambda m: errs.append(sz + ': ' + m.text) if m.type == 'error' and 'ERR_' not in m.text and 'fonts.g' not in m.text else None)
            pg.goto(URL)
            pg.wait_for_function('window.G && G.scene')
            pg.wait_for_timeout(600)
            pg.add_script_tag(path=os.path.join(GAME, 'tests', 'setup.js'))
            pg.evaluate(HELP)
            try:
                pg.wait_for_function(SAN, timeout=60000)
            except Exception:
                pass
            pg.wait_for_timeout(1500)

            def shot(name, wait=350):
                pg.wait_for_timeout(wait)
                pg.screenshot(path=os.path.join(OUT, PRE + '-' + sz + '-' + name + '.png'))
                so[sz + '-' + name] = pg.evaluate('() => T.doRa()')

            # 1. phòng quái thường có mẹo vũ khí (dải mẹo cũ ở đáy) — Cu Tí và quái gần mép dưới
            pg.evaluate("""() => { const S = T.start(0, 1, 3); S.tut = null; S.hint = null; const W = S.W;
                for (let k = 0; k < 300 && W.ents.length < 3; k++) G.sim(1); G.sim(20); T.bay(S); G.sim(1);
                W.banner = { s: G.MOVE_TIPS.sword, col: '#ffd27a', t: 5, tip: true }; S.P.hp = S.P.maxhp * 0.7; T.freeze(); }""")
            shot('meo')
            # 2. ải hướng dẫn: lời chỉ dẫn phòng đầu
            pg.evaluate("""() => { T.thaw(); G.testSave({ lvl: 1 }); G.save.tut.done = false; G.startStage(0, 0, 0, { kind: 'A', seed: 3 }); const S = G.getRun(); S.fade = 0; G.sim(90); T.freeze(); }""")
            shot('huong-dan')
            # 3. phòng trùm Rừng già: vừa "LỘ ĐIỂM YẾU!" + dòng báo nổi giận
            pg.evaluate("""() => { const S = T.start(0, 4, 5); S.tut = null; S.hint = null; G.testGoto('boss'); G.sim(200); const W = S.W, b = W.boss;
                if (b) { b.hp = b.maxhp * 0.55; b.exposed = 3; } T.bay(S); W.banner = { s: G.t('{0} nổi giận!', b.name), col: '#ff6a5a', t: 3 }; G.sim(1); T.freeze(); }""")
            shot('trum', 150)
            shot('trum-sau-1,5s', 1500)
            # 4. phòng trùm Sông sâu (Thuồng Luồng): dòng giải thích hệ + LỘ ĐIỂM YẾU
            pg.evaluate("""() => { const S = T.start(3, 4, 5, 40); S.tut = null; S.hint = null; G.testGoto('boss'); G.sim(260); const W = S.W, b = W.boss;
                if (b) { b.hp = b.maxhp * 0.7; b.exposed = 3; b.invuln = 0; } T.bay(S);
                const el = b && b.el && G.WEAK[b.el] ? b.el : 'fire';
                W.banner = { s: G.t('Hệ {0}: đánh bằng {1}!', G.EL[el].name, G.EL[G.WEAK[el]].name), col: G.EL[el].col, t: 3.2, icon: 'gd-he-' + G.WEAK[el] }; G.sim(1); T.freeze(); }""")
            shot('trum-song', 150)
            shot('trum-song-sau-1,5s', 1500)
            # 5. HUD phòng quái (không mẹo)
            pg.evaluate("""() => { const S = T.start(1, 1, 3); S.tut = null; S.hint = null; const W = S.W; for (let k = 0; k < 300 && W.ents.length < 3; k++) G.sim(1); G.sim(30);
                T.bay(S); W.banner = null; S.P.hp = Math.round(S.P.maxhp * 0.62); S.P.mana = S.P.maxmana * 0.6; G.sim(1); T.freeze(); }""")
            shot('hud')
            # 6. (SAU) chạm biểu tượng bản đồ: bản đồ mở vài giây
            pg.evaluate("""() => { if (G.hudGon && G.hudGon.moBanDo) { T.thaw(); G.hudGon.moBanDo(); G.sim(1); T.freeze(); } }""")
            shot('hud-mo-ban-do')
            pg.close()
        b.close()
    print(json.dumps(so, ensure_ascii=False))
    print('lỗi JS:', errs or 'không có')
    return 1 if errs else 0


if __name__ == '__main__':
    sys.exit(main())
