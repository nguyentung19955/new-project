"""Tư vấn 16/10 (tu-van-1): kiểm tự động + ảnh soát 960x540 cho MỞ DẦN (js/mo_dan.js), BỐ CỤC NÚT MỚI và VÒNG CHỌN VŨ KHÍ (js/stage.js),
TỰ NGẮM THEO HƯỚNG CẦN (js/moves.js). Không chơi thử: đặt bản lưu, dựng cảnh, chạm giả bằng CDP rồi đọc trạng thái.
Chạy từ thư mục game: python3 tests/mo_dan_shots.py [thư mục ảnh]  (mặc định docs/review/ke-hoach-cai-thien/tu-van-1/anh)
Mở dist/linh-khi.html (có ảnh nhúng; chạy python3 build.py trước). Thoát mã 1 nếu có lỗi trang hoặc điều kiện sai."""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright
import ui_lib
from ui_lib import Game, ROOT

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(ROOT), 'docs', 'review', 'ke-hoach-cai-thien', 'tu-van-1', 'anh')
os.makedirs(OUT, exist_ok=True)
ui_lib.SIZES['soat'] = dict(viewport={'width': 960, 'height': 540}, has_touch=True, device_scale_factor=1)
TRANG = ROOT + '/dist/linh-khi.html' if os.path.exists(ROOT + '/dist/linh-khi.html') else ROOT + '/index.html'
loi, dung = [], []

def ok(cond, msg):
    (dung if cond else loi).append(msg)
    print(('ĐẠT ' if cond else 'SAI ') + msg)

NGUOI_MOI = """(() => { G.resetSave(); const s = G.save; s.sound = false; s.truyen = { mo: 1, v: 3, n: {} }; G.persist(); return JSON.stringify(s.moDan); })()"""
# bản lưu cũ: KHÔNG có trường moDan, đã qua cả vùng 1 → nạp lại trang thì phải là { cu: 1 }
BAN_CU = """(() => { G.resetSave(); const s = JSON.parse(JSON.stringify(G.save)); delete s.moDan; s.sound = false; s.truyen = { mo: 1, v: 3, n: {} }; s.tut.done = true;
  s.stars = { '0-0': 3, '0-1': 3 }; s.heroes[s.hero].lvl = 6; localStorage.setItem(G.SAVE_KEY, JSON.stringify(s)); return true; })()"""
VAO_LANG = "() => { if (G.truyen) G.truyen.dang = null; G.setScene(G.Village); if (G.truyen) G.truyen.dang = null; }"

def chup(g, ten):
    g.wait(450)
    g.pg.locator('#stage').screenshot(path=os.path.join(OUT, ten))

def main():
    with sync_playwright() as p:
        # ---------- 1. người mới ----------
        g = Game(p, 'soat', url='file://' + TRANG + '?cloud=0', fresh=False)
        ev = g.ev
        g.wait(600)
        md = ev(NGUOI_MOI)
        ok(json.loads(md).get('cu') is None, 'bản lưu mới: moDan không có cờ cu (' + md + ')')
        ok(ev("() => ['dacBiet','chuong','doiVk','linhKhi','epDo','thoMay','so','viecNgay','thanhTuu','aiNgay'].every((f) => !G.moDan.co(f))"), 'người mới: mọi chức năng sau mốc đều đóng')
        ev(VAO_LANG); g.wait(300)
        ok(ev("() => !G.villageScene.shown('ren') && !G.villageScene.shown('xen') && !G.villageScene.shown('may') && G.villageScene.shown('mo') && G.villageScene.shown('lai')"),
           'làng người mới: ẩn Thợ Rèn, Hàng Xén, Thợ May; còn Lái Đò, Anh Mõ')
        chup(g, '1-lang-nguoi-moi.png')
        # Cụ Đồ: chỉ thẻ Hướng dẫn
        ev("() => G.villageApi.open('do')"); g.wait(200)
        ok(ev("() => G.villageApi.V.tab") == 'help', 'Cụ Đồ người mới mở thẳng thẻ Hướng dẫn')
        chup(g, '2-cu-do-nguoi-moi.png')
        ev("() => G.villageApi.goHub()")
        # ải hướng dẫn: chỉ Đánh, Né, Bình máu
        ev("() => G.startStage(0, 0, 0)"); g.wait(400)
        r = ev("() => { const S = G.getRun(); return { seed: S.map.seed, dot: S.worlds[0].waves.map((w) => w.length), tut: S.tut }; }")
        ok(r['tut'] and r['seed'] == 1610 and r['dot'] == [1, 2], 'ải hướng dẫn xếp sẵn: hạt giống cố định, phòng đầu 1 rồi 2 con (' + json.dumps(r) + ')')
        g.wait(3800)
        chup(g, '3-hud-nguoi-moi.png')
        # bấm phím đổi vũ khí khi chưa mở: không đổi
        ev("() => { G.keyP.KeyQ = true; }"); g.wait(200)
        ok(ev("() => G.getRun().P.cur") == 0, 'người mới: phím đổi vũ khí chưa có tác dụng')
        # mốc: qua Rừng già 2 → về làng có dòng báo
        ev("() => { G.save.stars = { '0-0': 3, '0-1': 2 }; G.persist(); }")
        ev(VAO_LANG); g.wait(250)
        msg = ev("() => G.villageScene.state.msg")
        ok(bool(msg) and 'đổi vũ khí' in msg, 'về làng sau Rừng già 2: một dòng báo mở mới (' + str(msg) + ')')
        ok(ev("() => G.save.moDan.bao.ai1 === 1 && G.save.moDan.bao.ai2 === 1"), 'mốc đã báo được ghi vào bản lưu')
        chup(g, '4-lang-bao-mo-moi.png')
        ok(ev("() => G.moDan.baoMoi()") is None, 'vào làng lần sau: không còn mốc nào chờ báo')
        g.close()

        # ---------- 2. bản lưu cũ (không có moDan) ----------
        g = Game(p, 'soat', url='file://' + TRANG + '?cloud=0', fresh=False)
        ev = g.ev
        g.wait(500)
        ev(BAN_CU)
        g.pg.reload(); g.pg.wait_for_function('window.G && G.scene'); g.wait(600)
        ok(ev("() => !!(G.save.moDan && G.save.moDan.cu === 1)"), 'bản lưu cũ có tiến độ: moDan.cu = 1 (mở hết như trước)')
        ok(ev("() => ['dacBiet','chuong','doiVk','linhKhi','epDo','so','aiNgay'].every((f) => G.moDan.co(f))"), 'bản lưu cũ: mọi chức năng mở')
        ok(ev("() => G.villageScene.shown('ren') && G.villageScene.shown('xen') && G.villageScene.shown('may')"), 'bản lưu cũ: đủ người làng (Thợ May theo mốc cũ Rừng già 2)')
        ev(VAO_LANG); g.wait(300)
        ok(not ev("() => /Mở mới/.test(G.villageScene.state.msg || '')"), 'bản lưu cũ: không có dòng báo mở mới')
        chup(g, '5-lang-ban-luu-cu.png')
        # HUD đủ nút, bố cục mới
        ev("() => { G.save.stars['0-2'] = 3; G.startStage(0, 2, 0); }"); g.wait(1200)
        chup(g, '6-hud-moi.png')
        # cỡ nút ở điện thoại thật (844x390 → G.scale ~1,44): tính lại bằng cùng công thức với G.scale giả
        so = ev("""() => { const sc0 = G.scale, out = {}; for (const sc of [1.25, 1.44, 1.6]) { G.scale = sc; G.cx = 0; const a = G.stageUi.btnPos('atk'), d = G.stageUi.btnPos('dodge'),
            s = G.stageUi.btnPos('special'), k = G.stageUi.btnPos('skill');
            out[sc] = { danh: 2 * a[2] * sc, ne: 2 * d[2] * sc, cach: (Math.hypot(a[0] - d[0], a[1] - d[1]) - a[2] - d[2]) * sc, dacBiet: 2 * s[2] * sc, chuong: 2 * k[2] * sc }; }
            G.scale = sc0; window.dispatchEvent(new Event('resize')); return out; }""")
        for sc, v in so.items():
            ok(56 <= v['danh'] <= 64.5 and 56 <= v['ne'] <= 64.5 and 9.5 <= v['cach'] <= 12.5, 'G.scale ' + sc + ': Đánh %.0f px, Né %.0f px, cách %.1f px (Đặc biệt %.0f, Chưởng %.0f)' % (v['danh'], v['ne'], v['cach'], v['dacBiet'], v['chuong']))
        g.wait(300)
        # chạm nhanh ô vũ khí: sang món kế
        c0 = ev("() => G.getRun().P.cur")
        g.down(424, 20); g.wait(90); g.up(); g.wait(250)
        ok(ev("() => G.getRun().P.cur") == (c0 + 1) % 4, 'chạm nhanh ô vũ khí: đổi sang món kế')
        g.wait(900)
        # giữ ô vũ khí: mở vòng chọn, kéo tới ô 3 (Phi tiêu / món thứ 4), nhấc ngón
        g.down(424, 20); g.wait(420)
        ok(ev("() => !!G.getRun().vong"), 'giữ ô vũ khí 0,4 giây: mở vòng chọn')
        o3 = ev("() => G.stageUi.vongO(3)")
        g.move(o3[0] + o3[2] / 2, o3[1] + o3[3] / 2); g.wait(150)
        ok(ev("() => G.getRun().vong.chon") == 3, 'kéo ngón tới ô thứ 4: ô đó sáng lên')
        chup(g, '7-vong-chon-vu-khi.png')
        g.up(); g.wait(300)
        ok(ev("() => G.getRun().P.cur") == 3 and not ev("() => !!G.getRun().vong"), 'nhấc ngón: cầm món thứ 4, vòng đóng')
        # tự ngắm: quái gần nhất ở sau lưng, quái xa hơn trong nón ±40° theo hướng cần → chọn quái trong nón
        r = ev("""() => { const S = G.getRun(), P = S.P, W = S.W; W.ents.length = 0; W.waves = [];
            const mk = (x, y) => ({ x, y, r: 6, hp: 50, maxhp: 50, dead: false, st: {} });
            const sau = mk(P.x - 20, P.y), truoc = mk(P.x + 40, P.y + 6); W.ents.push(sau, truoc);
            P.stickX = 1; P.stickY = 0; const a = G.moves.aimM(P, 80);
            P.stickX = null; const b = G.moves.aimM(P, 80);
            P.stickX = 0; P.stickY = 1; const c = G.moves.aimM(P, 80);
            W.ents.length = 0; return [a.e === truoc, b.e === sau, c.e === sau]; }""")
        ok(r == [True, True, True], 'tự ngắm: có quái trong nón theo cần thì chọn nó; không gạt / nón trống thì quái gần nhất (' + str(r) + ')')
        # Anh Mõ › Âm thanh, điều khiển: nút Khoá mục tiêu
        ev("() => { G.setScene(G.Village); if (G.truyen) G.truyen.dang = null; G.villageApi.open('mo'); G.villageApi.V.tab = 'settings'; G.villageApi.V.cd2 = true; }")
        chup(g, '8-cai-dat-khoa-muc-tieu.png')
        g.close()

        # ---------- 3. cờ tắt ----------
        g = Game(p, 'soat', url='file://' + TRANG + '?cloud=0&modan=0&nutcu=1', fresh=False)
        ev = g.ev
        g.wait(500); ev(NGUOI_MOI)
        ok(ev("() => G.MO_DAN_BAT === false && G.NUT_CU === true && ['doiVk','so','thoMay'].every((f) => G.moDan.co(f))"), '?modan=0&nutcu=1: mở hết, bố cục nút cũ')
        ok(ev("() => G.stageUi.btnPos('atk')[2]") == 28, '?nutcu=1: nút Đánh về cỡ cũ (bán kính 28)')
        ev("() => G.startStage(0, 0, 0)"); g.wait(300)
        ok(ev("() => G.getRun().worlds[0].waves.map((w) => w.length).join()") == '3', '?modan=0: phòng đầu ải hướng dẫn như cũ (3 con một đợt)')
        g.close()
    print('\nĐạt %d, sai %d' % (len(dung), len(loi)))
    sys.exit(1 if loi else 0)

if __name__ == '__main__':
    main()
