"""Kiểm phiên Cốt truyện + Âm thanh (js/truyen.js, js/nhac.js, bảng Cài đặt Anh Mõ trang 2).
  cd game && python3 tests/truyen_am_thanh.py
Cỡ iPhone ngang 844x390, cảm ứng. Ảnh: docs/review/ke-hoach-cai-thien/truyen-am-thanh/anh/
Kiểm: mở đầu chiếu một lần (bản lưu trống), không chiếu với người chơi cũ, chạm / Bỏ qua chạy đúng, trùm nói khi ra mắt và khi gục,
kết vùng sau Mộc Tinh, đoạn kết sau Hồ Tinh, câu mới của người làng, Cài đặt trang 2 (kéo thanh Nhạc, nút Tiết kiệm pin), cờ ?truyen=0,
bản lưu hỏng trường mới, nhạc chọn đúng bài theo cảnh, 0 lỗi trang."""
import os, json
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = os.path.dirname(ROOT)
OUT = os.path.join(REPO, 'docs', 'review', 'ke-hoach-cai-thien', 'truyen-am-thanh', 'anh')
URL = 'file://' + ROOT + '/index.html'
SETUP = os.path.join(ROOT, 'tests', 'setup.js')


def main():
    os.makedirs(OUT, exist_ok=True)
    errs, ok, bad = [], [], []

    def check(name, cond, info=''):
        (ok if cond else bad).append(name + ('' if cond else ' :: ' + str(info)))
        print(('ĐẠT ' if cond else 'HỎNG') + ' ' + name + ('' if cond else ' :: ' + str(info)))

    with sync_playwright() as p:
        b = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        ctx = b.new_context(viewport={'width': 844, 'height': 390}, has_touch=True, is_mobile=True, device_scale_factor=1.5)
        pg = ctx.new_page()
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(URL)
        pg.evaluate('localStorage.clear()')
        pg.reload()
        pg.wait_for_function('window.G && G.scene === G.Title')
        pg.wait_for_timeout(500)

        def xy(x, y):
            r = pg.evaluate("(() => { const r = document.getElementById('stage').getBoundingClientRect(); return [r.left, r.top, G.scale]; })()")
            return r[0] + x * r[2], r[1] + y * r[2]

        def tap(x, y, ms=250):
            cx, cy = xy(x, y)
            pg.touchscreen.tap(cx, cy)
            pg.wait_for_timeout(ms)

        def shot(name):
            pg.screenshot(path=os.path.join(OUT, name + '.png'))

        # 1. Người mới: chạm màn chào -> vào làng -> mở đầu
        tap(240, 200, 700)
        d = pg.evaluate("G.truyen.dang && { i: G.truyen.dang.i, n: G.truyen.dang.ds.length }")
        check('mở đầu hiện khi vào làng lần đầu', d and d['n'] == 4, d)
        pg.wait_for_timeout(600)
        shot('01-mo-dau-1-linh-khi-can')
        tap(240, 120, 900); shot('02-mo-dau-2-ba-yeu-tinh')
        tap(240, 120, 900); shot('03-mo-dau-3-em-be-bi-bat')
        tap(240, 120, 900); shot('04-mo-dau-4-cu-ti-len-duong')
        check('chạm để sang khung', pg.evaluate('G.truyen.dang && G.truyen.dang.i') == 3)
        pg.evaluate("G.audioStart()")
        pg.wait_for_timeout(400)
        check('nhạc làng trong lúc chiếu truyện', pg.evaluate('G.nhac.ten') == 'lang', pg.evaluate('[G.nhac.ten, G.amThanh.ac() && G.amThanh.ac().state]'))
        tap(240, 120, 500)
        check('hết mở đầu thì về làng', pg.evaluate('!G.truyen.dang && G.scene === G.Village && G.save.truyen.mo === 1'))
        # mở đầu tự sang khung sau 5 giây: tổng thời gian không quá ~20 giây
        pg.evaluate("G.truyen.xemLai()")
        pg.wait_for_timeout(5400)
        check('tự sang khung sau 5 giây', pg.evaluate('G.truyen.dang && G.truyen.dang.i') == 1, pg.evaluate('G.truyen.dang && G.truyen.dang.i'))
        sk = pg.evaluate('G.truyen.SKIP')
        tap(sk[0] + sk[2] / 2, sk[1] + sk[3] / 2, 400)
        check('nút Bỏ qua (cao 32 ≥ 44 điểm)', pg.evaluate('!G.truyen.dang') and sk[3] * pg.evaluate('G.scale') >= 44, [sk, pg.evaluate('G.scale')])
        # 2. Tải lại: không chiếu lại
        pg.reload(); pg.wait_for_function('window.G && G.scene === G.Title'); pg.wait_for_timeout(300)
        tap(240, 200, 600)
        check('chỉ hiện một lần', pg.evaluate('!G.truyen.dang && G.scene === G.Village'))
        # 3. Người chơi cũ (đã qua ải 1, bản lưu chưa có trường truyen): không ép xem; bản lưu có trường hỏng: không lỗi
        pg.evaluate("""(() => { const s = JSON.parse(localStorage.getItem('linhkhi_save_v1')); delete s.truyen; s.stars = { '0-0': 3, '0-1': 2 }; s.nhac = 'abc'; s.tieng = 250; localStorage.setItem('linhkhi_save_v1', JSON.stringify(s)); })()""")
        pg.reload(); pg.wait_for_function('window.G && G.scene === G.Title'); pg.wait_for_timeout(300)
        tap(240, 200, 600)
        check('người chơi cũ không bị ép xem mở đầu', pg.evaluate('!G.truyen.dang && G.save.truyen.mo === 1'))
        check('bản lưu có số hỏng được sửa', pg.evaluate("G.save.nhac === undefined && G.save.tieng === 100"), pg.evaluate('[G.save.nhac, G.save.tieng]'))
        pg.evaluate("""(() => { const s = JSON.parse(localStorage.getItem('linhkhi_save_v1')); s.truyen = 'hong'; localStorage.setItem('linhkhi_save_v1', JSON.stringify(s)); })()""")
        pg.reload(); pg.wait_for_function('window.G && G.scene === G.Title'); pg.wait_for_timeout(300)
        tap(240, 200, 600)
        check('trường truyen hỏng không làm lỗi', pg.evaluate('!G.truyen.dang && typeof G.save.truyen === "object"'))

        # 4. Cài đặt (Anh Mõ) trang 1 và trang 2
        pg.add_script_tag(path=SETUP)
        pg.evaluate("G.villageApi.open('mo')"); pg.wait_for_timeout(500)
        shot('05-cai-dat-trang-1')
        tap(160 + 4 + 48, 68 + 16, 500)
        check('mở trang 2 Cài đặt', pg.evaluate('G.villageApi.V.cd2 === true'))
        # kéo thanh Nhạc từ giữa về gần đầu
        x0, x1, y = 160 + 94, 160 + 222, 66 + 16
        a, bb = xy(x0 + 64, y), xy(x0 + 20, y)
        pg.evaluate("G.audioStart()")
        cdp = ctx.new_cdp_session(pg)
        def touch(kind, pt):
            cdp.send('Input.dispatchTouchEvent', {'type': kind, 'touchPoints': [] if kind == 'touchEnd' else [{'x': pt[0], 'y': pt[1]}]})
        touch('touchStart', a); pg.wait_for_timeout(80)
        for k in range(1, 6):
            touch('touchMove', (a[0] + (bb[0] - a[0]) * k / 5, a[1])); pg.wait_for_timeout(50)
        touch('touchEnd', bb); pg.wait_for_timeout(300)
        nh = pg.evaluate('G.save.nhac')
        check('kéo thanh Nhạc đổi âm lượng và lưu', nh is not None and nh <= 25 and json.loads(pg.evaluate("localStorage.getItem('linhkhi_save_v1')")).get('nhac') == nh, nh)
        tap(160 + 228 + 18, 104 + 16, 300)  # Tiếng: bấm "+" (đang 100 thì giữ 100)
        tap(160 + 52 + 18, 104 + 16, 300)   # Tiếng: bấm "−" -> 90
        check('nút − của thanh Tiếng', pg.evaluate('G.save.tieng') == 90, pg.evaluate('G.save.tieng'))
        tap(160 + 154 + 73, 146 + 16, 400)
        check('nút Tiết kiệm pin bật G.save.pin', pg.evaluate('G.save.pin === true'))
        shot('06-cai-dat-trang-2-am-thanh-pin-truyen')
        tap(160 + 154 + 73, 146 + 16, 300)
        check('bấm lần nữa tắt Tiết kiệm pin', pg.evaluate('G.save.pin === undefined'))
        pg.evaluate("G.save.nhac = 60; G.persist()")
        tap(160 + 4 + 73, 186 + 16, 600)
        check('nút Xem lại truyện chiếu lại', pg.evaluate('!!G.truyen.dang'))
        pg.evaluate("G.truyen.het(); G.villageApi.goHub()")
        pg.wait_for_timeout(200)

        # 5. Người làng có câu mới sau trùm vùng 1
        # nhảy thẳng vào làng bằng code (như các bài kiểm tra khác) thì KHÔNG chiếu truyện
        pg.evaluate("G.save.stars['0-2'] = 1; G.save.stars['0-3'] = 1; G.save.stars['0-4'] = 2; G.setScene(G.Village)")
        pg.wait_for_timeout(300)
        check('vào làng bằng code: không chiếu kết vùng', pg.evaluate('!G.truyen.dang'))
        # như người chơi: hạ trùm Rừng già, bảng kết quả, về làng
        pg.evaluate("delete G.save.stars['0-4']; G.startStage(0, 4, 0); G.gotoRoom(G.getRun().map.boss); G.kill(G.getRun().W.boss, {}); G.winPortal(); G.usePortal()")
        pg.wait_for_timeout(300)
        pg.evaluate("G.keyP.Escape = true")
        pg.wait_for_timeout(500)  # làng tự chiếu đoạn kết vùng 1
        d = pg.evaluate("G.truyen.dang && G.truyen.dang.o.ten")
        check('kết vùng Rừng già tự chiếu khi về làng', d == 'vung0', d)
        shot('07-ket-vung-rung-cu-teo')
        tap(240, 120, 900)
        shot('08-ket-vung-rung-cu-do')
        pg.evaluate("G.truyen.het()")
        check('kết vùng chỉ chiếu một lần', pg.evaluate('G.save.truyen.v') == 1)
        pg.evaluate("G.villageScene.onTalk('ren')"); pg.wait_for_timeout(400)
        msg = pg.evaluate("G.villageApi.V.msgT > 0 && G.villageApi.V.msg")
        check('Ông Thợ Rèn nói câu mới', msg == 'Gỗ linh Rừng già đây rồi! Mang về ông rèn cho.', msg)
        shot('09-nguoi-lang-cau-moi-tho-ren')
        pg.evaluate("G.villageApi.goHub()"); pg.wait_for_timeout(100)
        pg.evaluate("G.villageScene.onTalk('ren')"); pg.wait_for_timeout(200)
        check('câu mới chỉ nói một lần', not pg.evaluate("G.villageApi.V.msgT > 0 && G.villageApi.V.msg"))
        pg.evaluate("G.villageApi.goHub()")

        # 6. Trùm nói: Mộc Tinh ra mắt và gục (vòng lặp thật, không bot)
        pg.evaluate("G.testSave({ lvl: 12 }); G.save.sound = true; G.save.truyen = { mo: 1, v: 1, n: {} }; G.save.stars = { '0-0': 3, '0-1': 3, '0-2': 3, '0-3': 3, '0-4': 3 }; G.startStage(0, 4, 0); G.gotoRoom(G.getRun().map.boss)")
        pg.wait_for_timeout(1500)
        bo = pg.evaluate("G.truyen.bongTrum() && G.truyen.bongTrum().s")
        check('Mộc Tinh nói câu ra mắt', bo and bo.startswith('Ta là cây cổ thụ'), bo)
        check('nhạc trùm trong phòng trùm', pg.evaluate('G.nhac.ten') == 'trum0', pg.evaluate('G.nhac.ten'))
        shot('10-trum-moc-tinh-ra-mat')
        pg.evaluate("(() => { const W = G.getRun().W; G.kill(W.boss, {}); })()")
        pg.wait_for_timeout(900)
        bo = pg.evaluate("G.truyen.bongTrum() && G.truyen.bongTrum().s")
        check('Mộc Tinh nói câu khi gục', bo and bo.startswith('Lá rụng về cội'), bo)
        shot('11-trum-moc-tinh-guc')
        pg.wait_for_timeout(3000)
        check('hạ trùm xong về nhạc vùng', pg.evaluate('G.nhac.ten') == 'vung0', pg.evaluate('G.nhac.ten'))
        # trùm nhỏ vùng 3
        pg.evaluate("G.startStage(2, 1, 0); G.gotoRoom(G.getRun().map.boss)")
        pg.wait_for_timeout(1200)
        bo = pg.evaluate("G.truyen.bongTrum() && G.truyen.bongTrum().s")
        check('Hổ Lửa (trùm nhỏ) nói câu ra mắt', bo and bo.startswith('Gừừ'), bo)
        shot('12-trum-nho-ho-lua')
        check('nhạc trùm Lâu đài', pg.evaluate('G.nhac.ten') == 'trum2', pg.evaluate('G.nhac.ten'))
        # 7. Đoạn kết sau Hồ Tinh
        pg.evaluate("""(() => { for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) G.save.stars[r + '-' + i] = 3; G.save.stars['0-4'] = 3; G.save.stars['1-4'] = 3; G.save.truyen.v = 2; G.startStage(2, 4, 0); G.gotoRoom(G.getRun().map.boss); G.kill(G.getRun().W.boss, {}); G.winPortal(); G.usePortal(); })()""")
        pg.wait_for_timeout(300)
        pg.evaluate("G.keyP.Escape = true")
        pg.wait_for_timeout(500)
        d = pg.evaluate("G.truyen.dang && [G.truyen.dang.o.ten, G.truyen.dang.ds.length]")
        check('hạ Hồ Tinh: kết vùng + đoạn kết', d and d[0] == 'vung2' and d[1] == 4, d)
        tap(240, 120, 700); tap(240, 120, 900)
        shot('13-doan-ket-hoi-lang')
        tap(240, 120, 900)
        shot('14-doan-ket-moi-do-kho-2')
        pg.evaluate("G.truyen.het()")
        # 8. Tiếng Anh: không còn câu tiếng Việt chưa dịch trong các màn mới
        pg.evaluate("G.ngonNgu.dat('en', false); G.ngonNgu.thieu.clear(); G.truyen.xemLai()")
        for _ in range(4):
            pg.wait_for_timeout(250); pg.evaluate("G.truyen.tiep()")
        pg.evaluate("G.truyen.choi(G.truyen.LOI.VUNG[0].concat(G.truyen.LOI.KET).map(f => Object.assign({nen:'lang'}, f)))")
        pg.wait_for_timeout(300)
        shot('15-tieng-anh-ket-vung')
        for _ in range(6):
            pg.wait_for_timeout(200); pg.evaluate("G.truyen.tiep()")
        pg.evaluate("G.villageApi.open('mo'); G.villageApi.V.cd2 = true"); pg.wait_for_timeout(300)
        pg.evaluate("G.villageApi.V.cd2 = false"); pg.wait_for_timeout(300)
        miss = pg.evaluate("[...G.ngonNgu.thieu]")
        check('bản tiếng Anh đủ chữ mới', not miss, miss[:8])
        pg.evaluate("G.ngonNgu.dat('vi', false); G.villageApi.goHub()")
        # 9. Cờ tắt
        pg.goto(URL + '?truyen=0&nhac=0')
        pg.evaluate("localStorage.clear()"); pg.goto(URL + '?truyen=0&nhac=0')
        pg.wait_for_function('window.G && G.scene === G.Title'); pg.wait_for_timeout(300)
        tap(240, 200, 800)
        check('?truyen=0: không chiếu mở đầu', pg.evaluate('!G.truyen.dang && G.scene === G.Village'))
        check('?nhac=0: không phát nhạc', pg.evaluate('G.nhac.tat === true && G.nhac.ten === null'))
        b.close()
    print('lỗi trang:', errs[:5])
    check('0 lỗi trang', not errs, errs[:3])
    with open(os.path.join(OUT, 'ket-qua.json'), 'w', encoding='utf-8') as f:
        json.dump({'dat': ok, 'hong': bad, 'loi_trang': errs}, f, ensure_ascii=False, indent=1)
    print('ĐẠT %d / %d' % (len(ok), len(ok) + len(bad)))


if __name__ == '__main__':
    main()
