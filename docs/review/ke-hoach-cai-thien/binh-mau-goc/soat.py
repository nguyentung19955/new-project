"""Soát máy cho phiên "Nút Bình máu lên góc" (binh-mau-goc). Không chơi tay: bot dựng cảnh bằng mã, chạm bằng ngón giả (Playwright).
Chạy từ gốc repo:
  python3 docs/review/ke-hoach-cai-thien/binh-mau-goc/soat.py <trang mới .html> <trang TRƯỚC .html>
1. Chạm thật vào nút Bình máu (ngón giả, toạ độ màn hình) ở 4 màn (844×390, 667×375, 1280×720, cầm dọc 390×844) × 4 chế độ
   (Trên trái mặc định / Trên phải / Như cũ / ?binhgoc=0): bình giảm 1, máu tăng; chạm nút Tạm dừng vẫn tạm dừng, không uống bình.
2. Cài đặt Anh Mõ → trang 2 → nút "Bình máu": bấm đổi vòng Trên trái → Trên phải → Như cũ → Trên trái, lưu theo máy (localStorage),
   tải lại trang vẫn nhớ; không ghi vào bản lưu (mây). Có chữ tiếng Anh.
3. ?binhgoc=0 (kể cả khi máy đã lưu "Trên phải") và chế độ "Như cũ": lớp giao diện (canvas #ui, đồng hồ cố định) so với trang TRƯỚC
   → số điểm ảnh khác (mong 0).
In "Đạt n, sai m"; mã thoát 1 nếu có mục sai hoặc lỗi JS.
"""
import base64, io, os, sys
import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.join(HERE, '..', '..', '..', '..', 'game')
sys.path.insert(0, os.path.join(GAME, 'tests'))
from ui_lib import Game  # noqa: E402

MOI = 'file://' + os.path.abspath(sys.argv[1])
CU = 'file://' + os.path.abspath(sys.argv[2])
KHOA = 'linhkhi.binhViTri'
dung, loi = [], []


def ok(c, s):
    (dung if c else loi).append(s)
    print(('  ĐẠT ' if c else '  SAI ') + s)


HELP = r"""
window.T = {
  sc: null,
  freeze() { if (!T.sc) { const sc = G.scene; T.sc = sc; G.scene = { update() {}, draw() { sc.draw(); }, hide() {} }; } },
  thaw() { if (T.sc) { G.scene = T.sc; T.sc = null; } },
  rng(seed) { const r = G.srand(seed); Math.random = r; G.rnd = r; },
  start(r, i, seed) { T.thaw(); T.rng(seed * 13 + 5); G.testSave({ lvl: 6 + r * 7 + i, tier: Math.min(2, r), sharpen: 2, branch: 'fire', marks: 140 });
    G.save.potions = 2; G.save.stars = Object.assign(G.save.stars || {}, { '0-0': 1, '0-1': 1, '0-2': 1, '0-4': 1 });
    G.startStage(r, i, 0, { kind: 'A', seed }); const S = G.getRun(); S.fade = 0; return S; },
  ve(t) { const c = G.ux, cv = c.canvas; G.time = t; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
    c.setTransform(G.uiScale, 0, 0, G.uiScale, G.ox * G.dpr, G.oy * G.dpr); G.scene.draw(); return cv.toDataURL('image/png'); },
};
"""


def mo(p, size, url, vt=None):
    init = ("try { localStorage.setItem('%s', '%s'); } catch (e) {}" % (KHOA, vt)) if vt else ("try { localStorage.removeItem('%s'); } catch (e) {}" % KHOA)
    g = Game(p, size, url=url + '?cloud=0' + ('' if '?' in url else ''), init_script=init)
    g.pg.add_script_tag(path=os.path.join(GAME, 'tests', 'setup.js'))
    g.ev(HELP)
    return g


def anh(d):
    return np.asarray(Image.open(io.BytesIO(base64.b64decode(d.split(',')[1]))).convert('RGBA')).astype(int)


def main():
    with sync_playwright() as p:
        # 1. chạm thật
        for size in ('phone', 'p169', 'desk', 'port'):
            for ten, co, vt, mong in (('Trên trái', '', None, 'trai'), ('Trên phải', '', 'phai', 'phai'), ('Như cũ', '', 'cu', 'cu'), ('?binhgoc=0', '&binhgoc=0', 'phai', 'cu')):
                g = mo(p, size, MOI.replace('.html', '.html') if not co else MOI, vt)
                if co:
                    g.pg.goto(MOI + '?cloud=0' + co); g.pg.wait_for_function('window.G && G.scene'); g.wait(200)
                    g.pg.add_script_tag(path=os.path.join(GAME, 'tests', 'setup.js')); g.ev(HELP)
                g.ev("() => { G.save.sound = false; const S = T.start(1, 0, 3); S.tut = null; S.hint = null; G.testGoto('fight'); const W = S.W; for (let k = 0; k < 60; k++) G.sim(1); W.banner = null; S.P.hp = Math.round(S.P.maxhp * 0.3); S.P.inv = 99; }")
                g.wait(250)
                v = g.ev("() => G.binhGoc ? G.binhGoc.vt() : 'khong'")
                x, y, r = g.ev("() => G.stageUi.btnPos('potion')")
                hp0, n0 = g.ev("() => [G.getRun().P.hp, G.getRun().P.potions]")
                g.tap(x, y, 400)
                hp1, n1 = g.ev("() => [G.getRun().P.hp, G.getRun().P.potions]")
                ok(v == mong and n1 == n0 - 1 and hp1 > hp0, '%s %s: chỗ %s, chạm nút Bình máu (%.0f, %.0f) → bình %d→%d, máu %d→%d' % (size, ten, v, x, y, n0, n1, hp0, hp1))
                pa = g.ev("() => G.stageUi.PAU")
                g.tap(pa[0] + pa[2] / 2, pa[1] + pa[3] / 2, 300)
                md, n2 = g.ev("() => [G.getRun().mode, G.getRun().P.potions]")
                ok(md == 'paused' and n2 == n1, '%s %s: chạm Tạm dừng → %s, bình vẫn %d' % (size, ten, md, n2))
                ok(not g.errs, '%s %s: không lỗi JS %s' % (size, ten, g.errs[:2]))
                g.browser.close()

        # 2. cài đặt
        g = Game(p, 'phone', url=MOI + '?cloud=0')  # không init_script: tải lại trang phải giữ lựa chọn
        g.ev("() => localStorage.removeItem('%s')" % KHOA); g.pg.reload(); g.pg.wait_for_function('window.G && G.scene'); g.wait(300)
        g.ev("() => { G.save.sound = false; G.setScene(G.Village); if (G.truyen) G.truyen.dang = null; G.villageApi.open('mo'); G.villageApi.V.tab = 'settings'; G.villageApi.V.cd2 = true; }")
        g.wait(400)
        ve = []
        for _ in range(4):
            ve.append(g.ev("() => [G.binhGoc.vt(), localStorage.getItem('%s')]" % KHOA))
            g.tap(160 + 226 + 37, 226 + 16, 250)
        ok(ve == [['trai', None], ['phai', 'phai'], ['cu', 'cu'], ['trai', None]], 'Cài đặt: bấm nút "Bình máu" đổi vòng ' + str(ve))
        ban = g.ev("() => JSON.stringify(G.save).indexOf('binhViTri') < 0 && !('binhViTri' in G.save)")
        g.pg.reload(); g.pg.wait_for_function('window.G && G.scene'); g.wait(300)
        ok(g.ev("() => G.binhGoc.vt()") == 'phai' and ban, 'Cài đặt: lưu theo máy (tải lại trang vẫn "Trên phải"), không ghi vào bản lưu mây')
        g.ev("() => { G.setScene(G.Village); if (G.truyen) G.truyen.dang = null; G.villageApi.open('mo'); G.villageApi.V.tab = 'settings'; G.villageApi.V.cd2 = true; G.ngonNgu.dat('en'); }")
        g.wait(400)
        en = g.ev("() => [G.tv('Bình máu'), G.tv('Trên trái'), G.tv('Trên phải'), G.tv('Như cũ')].join('|')")
        ok(en == 'Potion|Top left|Top right|Classic', 'Cài đặt: tiếng Anh ' + en)
        g.pg.screenshot(path=os.path.join(HERE, 'anh', 'cai-dat-en.jpg'), type='jpeg', quality=80)
        g.ev("() => G.ngonNgu.dat('vi')"); g.wait(300)
        g.pg.screenshot(path=os.path.join(HERE, 'anh', 'cai-dat.jpg'), type='jpeg', quality=80)
        ok(not g.errs, 'Cài đặt: không lỗi JS %s' % g.errs[:2])
        g.browser.close()

        # 3. như cũ = TRƯỚC (lớp giao diện, đồng hồ cố định)
        CANH = [
            "() => { const S = T.start(1, 0, 3); S.tut = null; S.hint = null; G.testGoto('fight'); for (let k = 0; k < 40; k++) G.sim(1); S.W.banner = null; S.P.hp = Math.round(S.P.maxhp * 0.6); S.P.st.fire = 3; G.sim(1); T.freeze(); }",
            "() => { const S = T.start(1, 4, 5); S.tut = null; S.hint = null; G.testGoto('boss'); G.sim(120); S.W.banner = null; G.sim(1); T.freeze(); }",
            "() => { const S = T.start(1, 1, 3); S.tut = null; S.hint = null; for (let k = 0; k < 40; k++) G.sim(1); S.bdMoDen = 1e9; G.sim(1); if (G.lk) G.lk.pulseAt = -99; T.freeze(); }",  # bản đồ nhỏ mở (đồng hồ cố định nên đặt hạn rất xa)
        ]
        for size in ('phone', 'desk', 'port'):
            ref = []
            g = mo(p, size, CU)
            for c in CANH:
                g.ev(c); ref.append(anh(g.ev("() => { for (let i = 0; i < 6; i++) T.ve(110 + i); return T.ve(123.456); }")))
            g.browser.close()
            for ten, url, vt in (('?binhgoc=0 (máy đã lưu Trên phải)', MOI + '?cloud=0&binhgoc=0', 'phai'), ('Như cũ', MOI + '?cloud=0', 'cu')):
                init = "try { localStorage.setItem('%s', '%s'); } catch (e) {}" % (KHOA, vt)
                g = Game(p, size, url=url, init_script=init)
                g.pg.add_script_tag(path=os.path.join(GAME, 'tests', 'setup.js')); g.ev(HELP)
                khac = []
                for i, c in enumerate(CANH):
                    g.ev(c); a = anh(g.ev("() => { for (let i = 0; i < 6; i++) T.ve(110 + i); return T.ve(123.456); }"))
                    khac.append(int((np.abs(a - ref[i]).max(axis=2) > 0).sum()) if a.shape == ref[i].shape else -1)
                ok(all(k == 0 for k in khac), '%s %s: lớp giao diện khác TRƯỚC %s điểm ảnh (3 cảnh)' % (size, ten, khac))
                ok(not g.errs, '%s %s: không lỗi JS %s' % (size, ten, g.errs[:2]))
                g.browser.close()
    print('\nĐạt %d, sai %d' % (len(dung), len(loi)))
    return 1 if loi else 0


if __name__ == '__main__':
    sys.exit(main())
