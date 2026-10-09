"""Kiểm tra Xưởng Sprite (tools/xuong-sprite) từ đầu đến cuối, và bộ nạp hình tự vẽ trong game (js/sprite_custom.js).

  1. Tạo ảnh vẽ tay giả lập trên giấy trắng, đưa vào công cụ: tách nền, pixel hoá đúng cỡ, giảm màu.
  2. Chọn mẫu khung, tự đoán bộ phận, kéo khớp, tô bộ phận.
  3. Xem từng động tác, xuất tệp .sprite.json, mở lại tệp, nháp còn sau khi tải lại trang.
  4. Bỏ tệp vào game/art/custom/ tạm, đóng gói, vào game: quái dùng hình mới (đủ động tác, lật hướng, chớp trúng đòn);
     em bé cũng vậy. Xoá tệp, đóng gói lại: trở về hình code.
  5. Nút "Xem trong game" mở bản game thử có quái mới đánh nhau thật, không ghi bản lưu thật.
Cuối bài game/art/custom/ chỉ còn .gitkeep và bản đóng gói được dựng lại sạch.
Chạy: python3 tests/xuong_sprite.py
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile

from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from xuong_sprite_ve import ve_bon_chan, ve_nguoi, ve_kiem, ve_mu, ve_xu  # noqa: E402

GAME = os.path.dirname(HERE)
REPO = os.path.dirname(GAME)
CUSTOM = os.path.join(GAME, 'art', 'custom')
TOOL = 'file://' + os.path.join(REPO, 'tools', 'xuong-sprite', 'index.html')
TOOL_DIST = 'file://' + os.path.join(GAME, 'dist', 'xuong-sprite.html')
GAME_DIST = 'file://' + os.path.join(GAME, 'dist', 'linh-khi.html')

ok_n = 0
bad = []


def ok(name, cond, extra=''):
    global ok_n
    if cond:
        ok_n += 1
        print('  ĐẠT  ' + name)
    else:
        bad.append(name)
        print('  HỎNG ' + name + ('  (' + str(extra) + ')' if extra != '' else ''))


def build():
    r = subprocess.run([sys.executable, os.path.join(GAME, 'build.py')], capture_output=True, text=True)
    if r.returncode:
        print(r.stdout, r.stderr)
    return r.returncode == 0, r.stdout


def don_custom():
    for n in os.listdir(CUSTOM):
        if n != '.gitkeep':
            os.remove(os.path.join(CUSTOM, n))


def mo(pw, url, w=1280, h=760, **kw):
    b = pw.chromium.launch()
    ctx = b.new_context(viewport={'width': w, 'height': h}, accept_downloads=True, **kw)
    pg = ctx.new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
    pg.goto(url)
    return b, ctx, pg, errs


# Vẽ một quái (bằng G.monsterArt.draw hoặc bằng code) ra canvas riêng rồi trả về dấu vân (chuỗi điểm ảnh).
VAN = """([id, o, code]) => { const cv = document.createElement('canvas'); cv.width = 260; cv.height = 200; const c = cv.getContext('2d');
  const MA = G.monsterArt; (code ? MA.drawCode : MA.draw).call(MA, c, id, 130, 170, Object.assign({ bao: false, fx: false }, o));
  const d = c.getImageData(0, 0, 260, 200).data; let n = 0, h = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 20) { n++; h = (h * 31 + d[i] * 7 + d[i + 1] * 3 + d[i + 2] + (i >> 2)) >>> 0; } return [n, h]; }"""
LAT = """([id, o]) => { const W = 260, H = 200, ve = (f) => { const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
  G.monsterArt.draw(c, id, 130, 170, Object.assign({ bao: false, fx: false, face: f }, o)); return c.getImageData(0, 0, W, H).data; };
  const a = ve(1), b = ve(-1); let best = 0, n = 0; for (const k of [-1, 0, 1]) { let same = 0; n = 0; for (let y = 0; y < H; y++) for (let x = 1; x < W - 1; x++) { const i = (y * W + x) * 4, j = (y * W + (259 - x + k)) * 4; if (a[i + 3] > 20) { n++; if (b[j + 3] > 20 && Math.abs(a[i] - b[j]) < 4) same++; } } best = Math.max(best, same); } return [n, best]; }"""


def kiem_do(pw, tmp):
    """Đồ: vũ khí, trang phục, vật phẩm từ công cụ vào game."""
    kiem, mu, xu = ve_kiem(os.path.join(tmp, 'kiem.png')), ve_mu(os.path.join(tmp, 'mu.png')), ve_xu(os.path.join(tmp, 'xu.png'))
    b, ctx, pg, errs = mo(pw, TOOL)
    pg.wait_for_function('window.XS_UI')
    ma = pg.eval_on_selector_all('#dsChon .the[data-ma]', 'e => e.map(x => x.dataset.ma)')
    n_tp = pg.evaluate("['hats','robes','backs','hands','masks','wings'].reduce((a, o) => a + Object.keys(G.heroLooks[o]).length, 0)")
    ok('Danh sách có 40 vũ khí (4 loại x 10 dòng)', len([m for m in ma if m.startswith('vk-')]) == 40)
    ok('Danh sách có mọi trang phục của game', len([m for m in ma if m.startswith('tp-')]) == n_tp, (n_tp, len([m for m in ma if m.startswith('tp-')])))
    ok('Danh sách có 13 vật phẩm rơi ra', len([m for m in ma if m.startswith('vp-')]) == 13)
    tep = {}
    # --- vũ khí ---
    pg.click('.the[data-ma="vk-sword-0"]'); pg.set_input_files('#chonAnh', kiem); pg.wait_for_function('XS_S.R')
    pg.evaluate('XS_UI.denBuoc(3)'); pg.wait_for_timeout(200)
    d = pg.evaluate('XS_S.dd')
    ok('Vũ khí: điểm cầm ở chuôi (dưới), mũi ở trên', d['cam'][1] > d['mui'][1] + 10, d)
    box = pg.locator('#cv3').bounding_box()
    z = pg.evaluate("""() => { const cv = document.getElementById('cv3'), A = XS_S._anhDo, dp = devicePixelRatio; const z = Math.max(1, Math.floor(Math.min((cv.width - 40 * dp) / A.w, (cv.height - 40 * dp) / A.h))); return [z, Math.round((cv.width - A.w * z) / 2), Math.round((cv.height - A.h * z) / 2), dp]; }""")
    sx = box['x'] + (z[1] + d['cam'][0] * z[0]) / z[3]; sy = box['y'] + (z[2] + d['cam'][1] * z[0]) / z[3]
    pg.mouse.move(sx, sy); pg.mouse.down(); pg.mouse.move(sx, sy - 15, steps=4); pg.mouse.up()
    ok('Kéo điểm cầm bằng chuột', pg.evaluate('XS_S.dd.cam[1]') < d['cam'][1] - 1)
    ok('Hình vũ khí đi vào đường vẽ của game ngay trong công cụ', pg.evaluate("!!G.spriteCustom.timVuKhi({ type: 'sword', family: 0 }) && G.weaponArt._spriteCustom"))
    pg.evaluate('XS_UI.denBuoc(4)'); pg.wait_for_timeout(200)
    ok('Vũ khí: xem đứng, chạy, đánh, né, trúng đòn, ô đồ', pg.eval_on_selector_all('#dsDongTac .chip', 'e => e.length') == 6 and pg.is_visible('#khoiBac'))
    pg.click('#dsDongTac [data-dt="atk"]'); pg.wait_for_timeout(300)
    pg.evaluate('XS_UI.denBuoc(5)'); pg.wait_for_timeout(200)
    with pg.expect_download() as dl:
        pg.click('#nutTaiVe')
    p1 = os.path.join(tmp, dl.value.suggested_filename); dl.value.save_as(p1)
    with open(p1, encoding='utf-8') as f:
        tep['vk'] = json.load(f)
    ok('Tải về vk-sword-0.sprite.json có ảnh, điểm cầm, mũi', dl.value.suggested_filename == 'vk-sword-0.sprite.json' and tep['vk']['anh'].startswith('data:image/png') and tep['vk']['vu_khi']['cam'])
    pg.evaluate('XS_UI.denBuoc(3)'); pg.click('#dsHe .chip:nth-child(2)'); pg.click('#dsGd .chip:nth-child(2)')
    ok('Chọn hệ Lửa, giai đoạn Thành hình: mã đổi thành vk-sword-0-fire-2', pg.evaluate('XS_S.muc.ma') == 'vk-sword-0-fire-2')
    # --- trang phục ---
    pg.click('#cacBuoc [data-b="1"]'); pg.click('.the[data-ma="tp-hats-non_la"]'); pg.set_input_files('#chonAnh', mu); pg.wait_for_function('XS_S.R && XS_S.muc.ma === "tp-hats-non_la"')
    pg.evaluate('XS_UI.denBuoc(3)'); pg.wait_for_timeout(200)
    l0 = pg.evaluate('XS_S.dd.lech.slice()')
    pg.click('[data-nhich="1,0"]'); pg.click('[data-nhich="0,-1"]'); pg.click('[data-nhich="0,-1"]')
    l1 = pg.evaluate('XS_S.dd.lech')
    ok('Trang phục: nút nhích dời món đồ từng điểm ảnh', l1 == [l0[0] + 1, l0[1] - 2], (l0, l1))
    ok('Trang phục: mũ tự vẽ thay hình Nón lá ngay trong công cụ', pg.evaluate('!!G.heroLooks.hats.non_la.tuVe'))
    pg.evaluate('XS_UI.denBuoc(5)'); pg.wait_for_timeout(200)
    tep['tp'] = pg.evaluate('XS_UI.taoTep(true, true)')
    # --- vật phẩm ---
    pg.click('#cacBuoc [data-b="1"]'); pg.click('.the[data-ma="vp-gold"]'); pg.set_input_files('#chonAnh', xu); pg.wait_for_function('XS_S.R && XS_S.muc.ma === "vp-gold"')
    pg.evaluate('XS_UI.denBuoc(3)'); pg.wait_for_timeout(200)
    ok('Vật phẩm: bỏ qua bước khung, sang thẳng bước xem', pg.evaluate('XS_S.buoc') == 4)
    tep['vp'] = pg.evaluate('XS_UI.taoTep(true, true)')
    # mở lại tệp vũ khí
    pg.set_input_files('#chonTep', p1); pg.wait_for_timeout(700)
    ok('Mở lại tệp vũ khí: đúng món, đúng điểm cầm', pg.evaluate('XS_S.muc.ma') == 'vk-sword-0' and pg.evaluate('XS_S.dd.cam') == tep['vk']['vu_khi']['cam'])
    ok('Không có lỗi trang khi làm đồ', not errs, errs[:3])
    b.close()
    # --- vào game ---
    for k, t in tep.items():
        with open(os.path.join(CUSTOM, t['ma'] + '.sprite.json'), 'w', encoding='utf-8') as f:
            json.dump(t, f)
    good, out = build()
    ok('Đóng gói nhúng ba món đồ tự vẽ', good and all(t['ma'] in out for t in tep.values()), out[-300:])
    b, ctx, pg, errs = mo(pw, GAME_DIST, 960, 540)
    pg.wait_for_function('window.G && G.scene')
    pg.wait_for_function("G.spriteCustom.timVuKhi({ type: 'sword', family: 0 }) && G.spriteCustom.vatPham('gold') && G.heroLooks.hats.non_la.tuVe")
    VK = """([fam, code]) => { const cv = document.createElement('canvas'); cv.width = 120; cv.height = 120; const c = cv.getContext('2d'); const WA = G.weaponArt;
      (code ? WA.drawCode : WA.draw).call(WA, c, { type: 'sword', family: fam, rarity: 0 }, 60, 80, -60, 0); const d = c.getImageData(0, 0, 120, 120).data; let h = 0, n = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 20) { n++; h = (h * 31 + d[i] + (i >> 2)) >>> 0; } return [n, h]; }"""
    a, a0 = pg.evaluate(VK, [0, False]), pg.evaluate(VK, [0, True])
    ok('Kiếm dòng 1 vẽ bằng hình tự vẽ', a[0] > 50 and a != a0, (a, a0))
    ok('Kiếm dòng khác vẫn vẽ bằng code', pg.evaluate(VK, [1, False]) == pg.evaluate(VK, [1, True]))
    KID = """(hat) => { const cv = document.createElement('canvas'); cv.width = 80; cv.height = 70; const c = cv.getContext('2d');
      G.art.hero(c, { x: 40, y: 60, face: 1, key: 'smith', move: false, t: 0, atk: -1, dodge: -1, outfit: { hat } }); const d = c.getImageData(0, 0, 80, 70).data; let h = 0, n = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 20) { n++; h = (h * 31 + d[i] + (i >> 2)) >>> 0; } return [n, h]; }"""
    k1 = pg.evaluate(KID, 'non_la')
    pg.evaluate("G.spriteCustom.remove('tp-hats-non_la')")
    k0 = pg.evaluate(KID, 'non_la')
    ok('Em bé đội Nón lá tự vẽ; bỏ tệp thì về Nón lá gốc', k1 != k0 and not pg.evaluate('G.heroLooks.hats.non_la.tuVe'), (k1, k0))
    r = pg.evaluate("""() => { const cv = document.createElement('canvas'); cv.width = 30; cv.height = 30; const old = G.ux; G.ux = cv.getContext('2d'); try { G.theme.resIcon('gold', 2, 2, 14); } finally { G.ux = old; }
      const d = cv.getContext('2d').getImageData(0, 0, 30, 30).data; let g = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 20 && d[i + 1] > d[i] + 60) g++; return g; }""")
    ok('Biểu tượng vàng trên giao diện dùng hình tự vẽ (xu xanh)', r > 20, r)
    r = pg.evaluate("""() => { G.testSave ? 0 : 0; const sv = G.newSave(); G.save = sv; sv.tut.done = true; G.startStage(0, 2, 0); const W = G.getWorld(); W.waves = []; W.spawns = []; G.doRoi.tha(W, 240, 150, { kind: 'gold' });
      let err = null; try { for (let k = 0; k < 120; k++) { G.tick(); if (k % 10 === 0) { G.ui.begin(); G.scene.draw(); } } } catch (e) { err = String(e); } return err; }""")
    ok('Trận có vũ khí, đồ rơi tự vẽ chạy không lỗi', r is None, r)
    ok('Không có lỗi trang trong game có đồ tự vẽ', not errs, errs[:3])
    b.close()
    don_custom()


def main():
    tmp = tempfile.mkdtemp(prefix='xuong_sprite_')
    bon, nguoi = ve_bon_chan(os.path.join(tmp, 've-tay-bon-chan.png')), ve_nguoi(os.path.join(tmp, 've-tay-nguoi.png'))
    don_custom()
    good, _ = build()
    ok('Đóng gói được khi thư mục hình tự vẽ trống', good)
    with open(os.path.join(GAME, 'dist', 'linh-khi.html'), encoding='utf-8') as f:
        main_html = f.read()
    ok('Bản chơi chính không chứa mã trang thử và không đọc nháp của công cụ', 'xuongSprite' not in main_html and 'nguon/thu.js' not in main_html and 'customSpriteData =' not in main_html)
    for p in (os.path.join(REPO, 'tools', 'xuong-sprite', 'index.html'), os.path.join(GAME, 'dist', 'xuong-sprite.html')):
        with open(p, encoding='utf-8') as f:
            t = f.read()
        ok('Công cụ là một tệp tự chứa: ' + os.path.relpath(p, REPO), '<script src=' not in t and t.count('<script>') == 1 and 'G.monsterArt' in t)
    tep_path = os.path.join(tmp, 'heoCon.sprite.json')
    try:
        with sync_playwright() as pw:
            # ---------- công cụ ----------
            b, ctx, pg, errs = mo(pw, TOOL)
            pg.wait_for_function('window.XS_UI')
            n_the = pg.eval_on_selector_all('#dsChon .the[data-ma]', 'e => e.map(x => x.dataset.ma)')
            ok('Danh sách có 36 quái và 5 lựa chọn em bé', len([m for m in n_the if not m.startswith(('em-be', 'vk-', 'tp-', 'vp-'))]) == 36 and len([m for m in n_the if m.startswith('em-be')]) == 5, len(n_the))
            ok('Thẻ quái có hình code để so', pg.evaluate("""() => { const c = document.querySelector('.the[data-ma=cua] canvas'); const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n > 300; }"""))
            pg.click('.the[data-ma="heoCon"]')
            ok('Chọn quái thì sang bước Đưa hình', pg.is_visible('#b2') and pg.is_visible('#vungTha'))
            pg.set_input_files('#chonAnh', bon)
            pg.wait_for_function('XS_S.R')
            R = pg.evaluate("""() => { const R = XS_S.R, c = [R.px[0], R.px[R.w - 1], R.px[(R.h - 1) * R.w], R.px[R.w * R.h - 1]]; let fg = 0, trang = 0; for (const p of R.px) if (p) { fg++; if ((p & 255) > 230 && ((p >> 8) & 255) > 230 && ((p >> 16) & 255) > 230) trang++; }
              const A = XS_S.nguon, k = A.w / 640, mi = Math.round(175 * k) * A.w + Math.round(538 * k), pm = A.px[mi];
              trang = XS_S.mat[mi] && (pm & 255) > 200 ? trang + 100 : trang;
              return { w: R.w, h: R.h, goc: c.filter((x) => x).length, fg, trang, mau: XS.soMau(R.px), cao: XS_S.tach.cao, mat: XS_S.mat.reduce((a, v) => a + v, 0), n: XS_S.mat.length }; }""")
            ok('Tách nền: bốn góc ảnh pixel trống', R['goc'] == 0, R)
            ok('Tách nền: giữ phần lớn con vật, bỏ phần lớn giấy', 0.15 < R['mat'] / R['n'] < 0.6, R['mat'] / R['n'])
            ok('Pixel hoá về đúng chiều cao của quái gốc (32)', R['h'] == R['cao'] == 32, R)
            ok('Giữ lại tròng mắt trắng bên trong (tách nền từ mép vào)', R['trang'] >= 100, R['trang'])
            ok('Giảm màu: không quá 20 màu (mặc định mới)', 3 <= R['mau'] <= 20, R['mau'])
            pg.fill('#soMau', '5'); pg.dispatch_event('#soMau', 'input'); pg.wait_for_timeout(250)
            ok('Thanh số màu đổi số màu', pg.evaluate('XS.soMau(XS_S.R.px)') <= 5)
            pg.fill('#caoPx', '40'); pg.dispatch_event('#caoPx', 'input'); pg.wait_for_timeout(250)
            ok('Thanh chiều cao đổi cỡ pixel', pg.evaluate('XS_S.R.h') == 40)
            pg.fill('#caoPx', '32'); pg.dispatch_event('#caoPx', 'input'); pg.fill('#soMau', '20'); pg.dispatch_event('#soMau', 'input'); pg.wait_for_timeout(250)
            # cục tẩy: xoá một vùng giữa thân
            before = pg.evaluate('XS_S.mat.reduce((a, v) => a + v, 0)')
            pg.click('[data-cu="tay"]')
            box = pg.locator('#cv2').bounding_box()
            pg.mouse.move(box['x'] + box['width'] * 0.45, box['y'] + box['height'] * 0.45); pg.mouse.down(); pg.mouse.move(box['x'] + box['width'] * 0.5, box['y'] + box['height'] * 0.47, steps=4); pg.mouse.up(); pg.wait_for_timeout(200)
            after = pg.evaluate('XS_S.mat.reduce((a, v) => a + v, 0)')
            ok('Cục tẩy xoá được phần hình', after < before, (before, after))
            pg.click('#nutHoanTac'); pg.wait_for_timeout(200)
            ok('Hoàn tác trả lại chỗ vừa tẩy', pg.evaluate('XS_S.mat.reduce((a, v) => a + v, 0)') == before)
            pg.click('[data-cu=""]')
            pg.click('#nutSang3'); pg.wait_for_timeout(200)
            K = pg.evaluate("""() => { const k = XS_S.kh, R = XS_S.R; let thieu = 0; const dung = new Set(); for (let i = 0; i < k.bo.length; i++) if (R.px[i]) { if (k.bo[i] === 255) thieu++; else dung.add(k.bo[i]); } return { mau: k.mau, thieu, dung: dung.size, khop: Object.keys(k.khop).length }; }""")
            ok('Gợi ý mẫu Bốn chân theo kiểu đi của Heo Rừng Con', K['mau'] == 'bonChan', K)
            ok('Tự đoán: mọi điểm ảnh có bộ phận, dùng đủ 7 bộ phận', K['thieu'] == 0 and K['dung'] == 7, K)
            # kéo khớp "mui" (mũi) bằng chuột
            bo3 = pg.evaluate('(() => { const r = document.getElementById("cv3").getBoundingClientRect(); return { r: [r.left, r.top], d: devicePixelRatio }; })()')
            k0 = pg.evaluate('XS_S.kh.khop.mui.slice()')
            z = pg.evaluate("""() => { const cv = document.getElementById('cv3'), R = XS_S.R, d = devicePixelRatio, w = cv.width, h = cv.height; const z = Math.max(1, Math.floor(Math.min((w - 40 * d) / R.w, (h - 40 * d) / R.h))); return [z, Math.round((w - R.w * z) / 2), Math.round((h - R.h * z) / 2), d]; }""")
            sx = bo3['r'][0] + (z[1] + k0[0] * z[0]) / z[3]; sy = bo3['r'][1] + (z[2] + k0[1] * z[0]) / z[3]
            pg.mouse.move(sx, sy); pg.mouse.down(); pg.mouse.move(sx - 20, sy + 12, steps=5); pg.mouse.up()
            k1 = pg.evaluate('XS_S.kh.khop.mui')
            ok('Kéo khớp bằng chuột', abs(k1[0] - k0[0]) > 1 and abs(k1[1] - k0[1]) > 0.5, (k0, k1))
            # tô bộ phận
            pg.click('[data-che="to"]'); pg.click('#dsBoPhan [data-bo="6"]')
            cnt0 = pg.evaluate('XS_S.kh.bo.filter((v) => v === 6).length')
            px = bo3['r'][0] + (z[1] + 20 * z[0]) / z[3]; py = bo3['r'][1] + (z[2] + 14 * z[0]) / z[3]
            pg.mouse.move(px, py); pg.mouse.down(); pg.mouse.move(px + 30, py, steps=4); pg.mouse.up()
            ok('Tô bộ phận đổi chỗ thuộc bộ phận', pg.evaluate('XS_S.kh.bo.filter((v) => v === 6).length') > cnt0)
            pg.click('#nutTuDoan')
            ok('Có đủ 7 mẫu khung', pg.eval_on_selector_all('#dsMau .chip', 'e => e.length') == 7)
            pg.click('#nutSang4'); pg.wait_for_timeout(500)
            ds = pg.eval_on_selector_all('#dsDongTac .chip', 'e => e.map((x) => x.dataset.dt)')
            ok('Đủ sáu động tác game cần', ds == ['idle', 'move', 'tele', 'atk', 'hit', 'die'], ds)
            T = pg.evaluate("""() => { const T = XS_S.tam, out = {}; for (const k in T.dong_tac) { const a = T.dong_tac[k], hs = new Set(); for (let i = 0; i < a.so; i++) { let h = 0, n = 0; for (let y = 0; y < T.fh; y++) for (let x = 0; x < T.fw; x++) { const p = T.px[(a.hang * T.fh + y) * T.w + i * T.fw + x]; if (p) { n++; h = (h * 31 + p + x * 7 + y) >>> 0; } } hs.add(h + ':' + n); if (!n) hs.add('TRONG'); } out[k] = [a.so, hs.size, hs.has('TRONG'), a.giay]; } return out; }""")
            ok('Mọi khung của mọi động tác đều có hình', all(not v[2] for v in T.values()), T)
            ok('Các khung của mỗi động tác khác nhau (có cử động)', all(v[1] >= max(2, v[0] // 2) for v in T.values()), T)
            ok('Động tác một lần dài đúng như quái gốc (đánh 0,6 giây)', abs(T['atk'][3] - 0.6) < 1e-6, T['atk'])
            for dt in ds:
                pg.click('#dsDongTac [data-dt="%s"]' % dt); pg.wait_for_timeout(120)
            pg.click('#dsDongTac [data-dt="move"]')
            g0 = pg.evaluate('XS_S.tam.dong_tac.move.giay')
            pg.fill('#toc', '200'); pg.dispatch_event('#toc', 'input'); pg.wait_for_timeout(300)
            ok('Thanh tốc độ làm động tác đi nhanh gấp đôi', abs(pg.evaluate('XS_S.tam.dong_tac.move.giay') - g0 / 2) < 0.01)
            pg.click('#dsDongTac [data-dt="atk"]')
            ok('Động tác đánh của quái có sẵn không có thanh tốc độ (game quyết định)', not pg.is_visible('#dongToc'))
            pg.fill('#bien', '160'); pg.dispatch_event('#bien', 'input'); pg.wait_for_timeout(300)
            ok('Thanh biên độ lưu theo động tác', pg.evaluate('XS_S.tam.dong_tac.atk.bien') == 160)
            pg.click('[data-huong="-1"]'); pg.wait_for_timeout(150)
            ok('Xem quay trái', pg.evaluate('XS_S.xem.face') == -1)
            ok('Cảnh xem có nền phòng và em bé', pg.evaluate("""() => { const c = document.getElementById('cv4'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < d.length; i += 400) if (d[i] + d[i + 1] + d[i + 2] > 60) n++; return n > 500; }"""))
            pg.click('#nutSang5'); pg.wait_for_timeout(300)
            with pg.expect_download() as dl:
                pg.click('#nutTaiVe')
            dl.value.save_as(tep_path)
            ok('Tải về đúng tên heoCon.sprite.json', dl.value.suggested_filename == 'heoCon.sprite.json', dl.value.suggested_filename)
            with pg.expect_download() as dl2:
                pg.click('#nutTaiAnh')
            ok('Tải ảnh heoCon.png', dl2.value.suggested_filename == 'heoCon.png')
            with open(tep_path, encoding='utf-8') as f:
                tep = json.load(f)
            ok('Tệp có tấm sprite PNG, khung, khớp, thông số động tác', tep['loai'] == 'linh-khi-sprite' and tep['tam'].startswith('data:image/png;base64,') and set(tep['dong_tac']) == set(ds) and tep['cong_cu']['khop'] and tep['cong_cu']['bo_phan'] and tep['goc'])
            nhap = pg.evaluate("localStorage.getItem('xuongSprite.nhap.heoCon') !== null")
            ok('Lưu nháp trong máy', nhap)
            sig = pg.evaluate('[XS_S.R.w, XS_S.R.h, XS_S.kh.mau, XS_S.dong_tac.atk && XS_S.dong_tac.atk.bien]')
            # tải lại trang: nháp còn, mở tệp: khôi phục đúng
            pg.reload(); pg.wait_for_function('window.XS_UI')
            ok('Tải lại trang: thẻ Heo Rừng Con có nhãn Đang làm', pg.is_visible('.the[data-ma="heoCon"] .nhan'))
            pg.set_input_files('#chonTep', tep_path); pg.wait_for_timeout(800)
            sig2 = pg.evaluate('[XS_S.R.w, XS_S.R.h, XS_S.kh.mau, XS_S.dong_tac.atk && XS_S.dong_tac.atk.bien, XS_S.buoc, !!XS_S.nguon]')
            ok('Mở tệp khôi phục hình, khung, thông số, về bước Chuyển động', sig2[:4] == sig and sig2[4] == 4 and sig2[5], (sig, sig2))
            # em bé
            pg.click('#cacBuoc [data-b="1"]'); pg.click('.the[data-ma="em-be"]'); pg.set_input_files('#chonAnh', nguoi); pg.wait_for_function('XS_S.R && XS_S.muc.ma === "em-be"')
            pg.evaluate('XS_UI.denBuoc(4)'); pg.wait_for_timeout(300)
            eb = pg.evaluate('[XS_S.kh.mau, XS_S.R.h, Object.keys(XS_S.tam.dong_tac)]')
            ok('Em bé: mẫu Người, cao 28, có thêm né lăn', eb[0] == 'nguoi' and eb[1] == 28 and 'ne' in eb[2], eb)
            tep_be = pg.evaluate('JSON.stringify(XS_UI.taoTep(true, false))')
            ok('Không có lỗi trang trong công cụ', not errs, errs[:3])
            b.close()

            # ---------- bản game thử trong công cụ (bản đóng gói) ----------
            b, ctx, pg, errs = mo(pw, TOOL_DIST)
            pg.wait_for_function('window.XS_UI')
            pg.click('#theMoi'); pg.fill('#moiMa', 'rongDat'); pg.fill('#moiTen', 'Rồng Đất'); pg.select_option('#moiVung', 'bien'); pg.click('#moiTao')
            pg.set_input_files('#chonAnh', bon); pg.wait_for_function('XS_S.R')
            pg.evaluate('XS_UI.denBuoc(5)'); pg.wait_for_timeout(200)
            ok('Quái mới: chọn quái có sẵn để mượn chỗ khi thử', pg.is_visible('#thayCho') and pg.eval_on_selector('#thayCho', 'e => e.value') != '')
            pg.select_option('#thayCho', 'cua')
            pg.click('#nutXemGame5')
            fr = None
            for _ in range(60):
                pg.wait_for_timeout(150)
                fr = next((f for f in pg.frames if 'xuong-sprite-thu' in f.url), None)
                if fr:
                    try:
                        if fr.evaluate('!!(window.G && G.getRun && G.getRun() && G.scene === G.StageScene)'):
                            break
                    except Exception:
                        pass
            pg.wait_for_timeout(600)
            st = fr.evaluate("""() => ({ ents: G.getWorld().ents.map((e) => e.art), sp: Object.keys(G.spriteCustom.ds), save: localStorage.getItem('linhkhi_save_v1'), r: G.getRun().r })""")
            ok('Xem trong game: vào phòng Hang biển, ba con Cua Lính mang hình Rồng Đất', st['ents'] == ['cua'] * 3 and 'rongDat' in st['sp'] and 'cua' in st['sp'] and st['r'] == 1, st)
            pg.click('#nutTuDanh'); pg.wait_for_timeout(2500)
            st2 = fr.evaluate("""() => ({ hp: G.getRun().P.hp > 0, hit: G.getWorld().ents.some((e) => e.hp < e.maxhp) || G.getWorld().ents.length < 3, save: localStorage.getItem('linhkhi_save_v1') })""")
            ok('Bé tự đánh: quái mất máu, bé còn sống', st2['hp'] and st2['hit'], st2)
            ok('Bản game thử không ghi bản lưu thật', st['save'] is None and st2['save'] is None, st2['save'])
            pg.click('#nutDongGame')
            ok('Không có lỗi trang khi xem trong game', not errs, errs[:3])
            b.close()

            # ---------- trong game thật ----------
            shutil.copy(tep_path, os.path.join(CUSTOM, 'heoCon.sprite.json'))
            with open(os.path.join(CUSTOM, 'em-be.sprite.json'), 'w', encoding='utf-8') as f:
                f.write(tep_be)
            good, out = build()
            ok('Đóng gói nhúng hai tệp hình tự vẽ', good and 'heoCon' in out and 'em-be' in out, out[-200:])
            b, ctx, pg, errs = mo(pw, GAME_DIST, 960, 540)
            pg.wait_for_function('window.G && G.scene')
            pg.wait_for_function("G.spriteCustom.get('heoCon') && G.spriteCustom.get('em-be')")
            pg.evaluate('window.requestAnimationFrame = () => 0')
            pg.add_script_tag(path=os.path.join(HERE, 'setup.js'))
            ok('Bộ nạp nhận hai tệp, không báo lỗi', pg.evaluate('G.spriteCustom.loi.length') == 0 and pg.evaluate('!G.customSpriteData'))
            for a in ['idle', 'move', 'tele', 'atk', 'hit', 'die', 'spawn', 'chieu1']:
                v_moi = pg.evaluate(VAN, ['heoCon', {'anim': a, 't': 0.2}, False])
                v_cu = pg.evaluate(VAN, ['heoCon', {'anim': a, 't': 0.2}, True])
                ok('Heo Rừng Con vẽ bằng hình tự vẽ khi ' + a, v_moi[0] > 100 and v_moi != v_cu, (v_moi, v_cu))
            fl = pg.evaluate(LAT, ['heoCon', {'anim': 'idle', 't': 0}])
            ok('Quay trái phải là hình lật gương', fl[0] > 100 and fl[1] > fl[0] * 0.9, fl)
            h0 = pg.evaluate(VAN, ['heoCon', {'anim': 'idle', 't': 0}, False])
            h1 = pg.evaluate(VAN, ['heoCon', {'anim': 'idle', 't': 0, 'hit': 0.8}, False])
            ok('Chớp trắng khi trúng đòn', h0 != h1 and h0[0] == h1[0], (h0, h1))
            d0 = pg.evaluate(VAN, ['heoCon', {'anim': 'die', 't': 0.05}, False])
            d1 = pg.evaluate(VAN, ['heoCon', {'anim': 'die', 't': 5}, False])
            ok('Chết: hình mờ dần rồi biến mất', d0[0] > 100 and d1[0] == 0, (d0, d1))
            ok('Quái khác vẫn vẽ bằng code', pg.evaluate(VAN, ['cua', {'anim': 'idle'}, False]) == pg.evaluate(VAN, ['cua', {'anim': 'idle'}, True]))
            ok('Thời lượng cử động giữ như quái gốc (luật chơi không đổi)', pg.evaluate("G.monsterArt.dur('heoCon','atk')") == 0.6)
            r = pg.evaluate("""() => { G.testSave({ lvl: 10 }); G.rnd = G.srand(5); G.startStage(0, 2, 0); const W = G.getWorld(); W.waves = []; W.spawns = [];
              for (let i = 0; i < 3; i++) { const e = G.spawnEnemy('rusher', 250 + i * 25, 140 + i * 20, { art: 'heoCon' }); e.inside = true; }
              let err = null; try { for (let k = 0; k < 240; k++) { G.tick(); if (k % 10 === 0) { G.ui.begin(); G.scene.draw(); } } } catch (e) { err = String(e); }
              return { err, n: W.ents.length }; }""")
            ok('Trận đánh với Heo Rừng Con tự vẽ chạy 4 giây không lỗi', r['err'] is None, r)
            hero = pg.evaluate("""() => { const v = (code) => { const cv = document.createElement('canvas'); cv.width = 120; cv.height = 100; const c = cv.getContext('2d');
                const o = { x: 60, y: 80, face: 1, key: 'hunter', move: false, t: 0.3, atk: -1, dodge: -1, weapon: { type: 'bow', family: 0, rarity: 0, marks: { fire: 0, poison: 0, ice: 0 }, sharpen: 0 } };
                (code ? G.art.heroCode : G.art.hero).call(G.art, c, o); const d = c.getImageData(0, 0, 120, 100).data; let h = 0, n = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 20) { n++; h = (h * 31 + d[i] + (i >> 2)) >>> 0; } return [n, h]; }; return [v(false), v(true)]; }""")
            ok('Em bé vẽ bằng hình tự vẽ (tệp em-be thay cả bốn bé)', hero[0][0] > 80 and hero[0] != hero[1], hero)
            ok('Không có lỗi trang trong game có hình tự vẽ', not errs, errs[:3])
            b.close()

            # ---------- xoá tệp: trở về hình code ----------
            don_custom()
            good, out = build()
            b, ctx, pg, errs = mo(pw, GAME_DIST, 960, 540)
            pg.wait_for_function('window.G && G.scene'); pg.wait_for_timeout(200)
            ok('Xoá tệp rồi đóng gói lại: không còn hình tự vẽ', good and pg.evaluate('Object.keys(G.spriteCustom.ds).length') == 0 and 'hình tự vẽ' not in out)
            ok('Heo Rừng Con trở lại hình code', pg.evaluate(VAN, ['heoCon', {'anim': 'atk', 't': 0.2}, False]) == pg.evaluate(VAN, ['heoCon', {'anim': 'atk', 't': 0.2}, True]))
            ok('Không có lỗi trang', not errs, errs[:3])
            b.close()
            kiem_do(pw, tmp)
    finally:
        don_custom()
        build()
        shutil.rmtree(tmp, ignore_errors=True)
    left = sorted(os.listdir(CUSTOM))
    ok('Cuối bài game/art/custom/ chỉ còn .gitkeep', left == ['.gitkeep'], left)
    print('%d/%d mục đạt' % (ok_n, ok_n + len(bad)))
    if bad:
        sys.exit(1)


if __name__ == '__main__':
    main()
