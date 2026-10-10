"""AUDIT đăng nhập và lưu mây (phiên au-van-hanh-ui, mục 7.1–7.2). CHỈ THỬ, không sửa game.
Dùng Firebase GIẢ trong trang (tests/fake_firebase.js, như tests/may.py) nên không cần mạng; KHÔNG thay cho thử Google thật trên điện thoại.
Mỗi tình huống in "ĐÚNG NHƯ MONG ĐỢI" hoặc "CÓ VẤN ĐỀ" kèm số liệu; bài không thất bại khi thấy vấn đề (mục đích là ghi nhận).
Chạy từ thư mục game:  python3 tests/au_luu.py"""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ui_lib import Game, ROOT
from playwright.sync_api import sync_playwright

FAKE = open(os.path.join(ROOT, 'tests', 'fake_firebase.js'), encoding='utf-8').read()
KEY = 'linhkhi_save_v1'
RES = []


def seed(local=None, cloud=None, user=None):
    js = "if (!sessionStorage.__seeded) { sessionStorage.__seeded = 1;"
    if local is not None:
        js += f"localStorage.setItem('{KEY}', {json.dumps(json.dumps(local))});"
    if cloud is not None:
        js += f"localStorage.setItem('__fakefs', {json.dumps(json.dumps(cloud))});"
    if user is not None:
        js += f"localStorage.setItem('__fakeauth', {json.dumps(json.dumps(user))});"
    return js + "}\n" + FAKE


def note(name, good, detail):
    RES.append({'tinh_huong': name, 'on': good, 'chi_tiet': detail})
    print(('  ĐÚNG NHƯ MONG ĐỢI: ' if good else '  CÓ VẤN ĐỀ: ') + name + ' — ' + str(detail))


def spy(g):
    g.ev("""(() => { if (window.__spy) return; window.__spy = 1; window.__lab = [];
      for (const k of ['btn', 'sbtn']) { const f = G.theme[k]; G.theme[k] = function (x, y, w, h, l) { window.__lab.push(String(l)); return f.apply(this, arguments); }; } })()""")


def labels(g):
    g.ev("window.__lab = []"); g.wait(150)
    return g.ev("window.__lab")


def block(g):
    g.ctx.route('**/www.gstatic.com/**', lambda r: r.abort())


def save_with(g, **kw):
    return g.ev("(o) => { const s = G.newSave(); Object.assign(s, o); return s; }", kw)


def main():
    with sync_playwright() as p:
        # ---------- 7.1a: có mây → màn chào bắt đăng nhập Google; đăng nhập Google LỖI (bị chặn cửa sổ / trình duyệt trong Zalo, Messenger)
        g = Game(p, 'phone', init_script=seed(user={'uid': 'khachA', 'isAnonymous': True}), fresh=False)
        block(g)
        g.pg.wait_for_function("G.cloud.online()", timeout=4000)
        g.ev("G.setScene(G.Title)"); spy(g); g.wait(300)
        lab0 = labels(g)
        # giả lỗi: cửa sổ Google bị chặn (Safari/WebView) — nối tài khoản thất bại
        g.ev("(() => { G.cloud.user.linkWithPopup = () => Promise.reject(Object.assign(new Error('blocked'), { code: 'auth/popup-blocked' })); return 1; })()")
        m = g.ev("G.titleLayout.main")
        g.tap(m[0] + m[2] / 2, m[1] + m[3] / 2, 600)
        msg = g.ev("G.villageApi && G.villageApi.V ? G.villageApi.V.tMsg : ''")
        g.wait(11500)  # chờ quá 10 giây (mốc hiện nút Chơi tạm khi mây không kết nối được)
        lab1 = labels(g)
        has_guest = any('Chơi tạm' in l for l in lab1)
        g.pg.keyboard.press('Enter'); g.wait(200)
        in_game = g.ev("G.scene !== G.Title")
        # chạm chỗ trống
        g.tap(400, 240, 300)
        in_game2 = g.ev("G.scene !== G.Title")
        note('Đăng nhập Google lỗi (cửa sổ bị chặn) mà mây vẫn kết nối: còn đường vào game không', has_guest or in_game or in_game2,
             {'nut_luc_dau': [l for l in lab0][:4], 'thong_bao': msg, 'nut_sau_11_giay': lab1[:4], 'co_nut_choi_tam': has_guest, 'vao_duoc': in_game or in_game2})
        g.close()

        # ---------- 7.1b: mây không tải được (mất mạng): có vào được không, mất bao lâu
        g = Game(p, 'phone', init_script="window.LK_CLOUD_TEST_OFF = 1;", fresh=False)
        # file:// → why = 'file' → không cần đăng nhập. Để thử 'mất mạng' thật phải chạy qua http (tests/may.py 'tat' đã làm: tự tắt, vào được).
        g.ev("G.setScene(G.Title)"); g.wait(200)
        g.tap(240, 200, 300)
        note('Không có mây (mở tệp/mất mạng): chạm là vào game, chỉ lưu trên máy', g.ev("G.scene === G.Village"), {'why': g.ev("G.cloud.why"), 'nhan': g.ev("G.cloud.label()")})
        g.close()

        # ---------- 7.1c: thư viện Firebase tải được nhưng đăng nhập khách hỏng (mạng chập chờn): chờ bao lâu mới có nút Chơi tạm
        g = Game(p, 'phone', init_script="window.__fbAuthFail = true;" + seed(), fresh=False)
        block(g)
        g.ev("G.setScene(G.Title)"); spy(g)
        t_seen = None
        for i in range(30):
            g.wait(500)
            if any('Chơi tạm' in l for l in labels(g)):
                t_seen = (i + 1) * 0.65; break
        note('Đăng nhập khách lỗi mạng: nút "Chơi tạm" hiện ra', t_seen is not None, {'giay_xap_xi': t_seen, 'status': g.ev("G.cloud.status"), 'nhan': g.ev("G.cloud.label()")})
        g.close()

        # ---------- 7.2a: hai máy — bản trên máy MỚI HƠN theo giờ nhưng TIẾN ĐỘ THẤP hơn mây (chơi offline trên máy cũ) → có ghi đè mây không
        g0 = Game(p, 'phone')
        rich = save_with(g0, gold=5000, stars={'0-0': 3, '0-1': 3, '0-2': 3, '0-3': 3, '0-4': 3, '1-0': 3, '1-1': 2}, savedAt=1_700_000_000_000, owner='khachA')
        poor = save_with(g0, gold=12, stars={'0-0': 1}, savedAt=1_700_000_500_000, owner='khachA')
        g0.close()
        cloud = {'linhkhi_users/khachA': {'save': json.dumps(rich), 'updatedAt': rich['savedAt'], 'prog': 0, 'v': 1}}
        g = Game(p, 'phone', init_script=seed(local=poor, cloud=cloud, user={'uid': 'khachA', 'isAnonymous': True}), fresh=False)
        block(g)
        g.pg.wait_for_function("G.cloud.online()", timeout=4000); g.wait(800)
        cs = json.loads(g.ev("window.__fs['linhkhi_users/khachA'].save"))
        asked = g.ev("!!document.querySelector('#lk-ov')")
        note('Bản trên máy mới hơn theo giờ nhưng ít tiến độ hơn mây: mây có bị ghi đè không', cs['gold'] == 5000,
             {'vang_tren_may_sau_khi_mo': cs['gold'], 'sao_tren_may': sum(cs['stars'].values()), 'co_hoi_lai': asked})
        g.close()

        # ---------- 7.2b: đang có một lần đẩy lên mây chưa xong thì người chơi lưu tiếp → cờ "còn thay đổi chưa lưu" có bị xoá nhầm
        g = Game(p, 'phone', init_script=seed(user={'uid': 'khachB', 'isAnonymous': True}), fresh=False)
        block(g)
        g.pg.wait_for_function("G.cloud.online()", timeout=4000); g.wait(600)
        r = g.ev("""async () => { const C = G.cloud; const pr = C.push(true); G.save.gold += 77; G.persist(); await pr;
          const cl = JSON.parse(window.__fs['linhkhi_users/' + C.user.uid].save).gold;
          return { dirty: C.dirty, label: C.label(), local: G.save.gold, cloud: cl }; }""")
        note('Lưu trong lúc đang đẩy lên mây: trạng thái còn biết là chưa lưu xong', r['dirty'] or r['local'] == r['cloud'], r)
        g.wait(4600)
        r2 = g.ev("({ cloud: JSON.parse(window.__fs['linhkhi_users/' + G.cloud.user.uid].save).gold, local: G.save.gold })")
        note('…và 4,6 giây sau bản trên mây có bắt kịp không', r2['cloud'] == r2['local'], r2)
        g.close()

        # ---------- 7.2c: ghi lên mây lỗi (mất mạng giữa chừng), mạng trở lại nhưng KHÔNG có sự kiện "online" và người chơi không đổi gì → có tự thử lại không
        g = Game(p, 'phone', init_script=seed(user={'uid': 'khachC', 'isAnonymous': True}), fresh=False)
        block(g)
        g.pg.wait_for_function("G.cloud.online()", timeout=4000); g.wait(600)
        g.ev("window.__fbFail = true; G.save.gold += 5; G.persist();"); g.wait(4500)
        st1 = g.ev("({ status: G.cloud.status, dirty: G.cloud.dirty, label: G.cloud.label() })")
        g.ev("window.__fbFail = false"); g.wait(9000)
        r = g.ev("({ cloud: JSON.parse(window.__fs['linhkhi_users/' + G.cloud.user.uid].save).gold, local: G.save.gold, status: G.cloud.status })")
        note('Ghi lỗi rồi mạng ổn lại (không có sự kiện online, không đổi gì thêm): tự thử lại trong 9 giây', r['cloud'] == r['local'], {'luc_loi': st1, 'sau_9_giay': r})
        g.close()

        # ---------- 7.2d: tải lại trang giữa ải (đóng tab giữa chừng): phần thưởng có bị nhân đôi / mất không
        g = Game(p, 'phone')
        g.pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
        g.ev("G.botInput = null; G.testSave({ lvl: 5 }); G.persist();")
        before = g.ev("({ gold: G.save.gold, xp: G.save.heroes.smith.xp })")
        g.ev("G.startStage(0, 0, 0, { kind: 'A', seed: 3 }); const S = G.getRun(); G.sim(120); for (const e of S.W.ents.slice()) G.damage(e, 1e6, {}); G.sim(120);")
        mid = g.ev("({ gold: G.save.gold, got: (G.getRun().got || []).length })")
        g.pg.reload(); g.pg.wait_for_function('window.G && G.scene'); g.wait(300)
        after = g.ev("({ gold: G.save.gold, xp: G.save.heroes.smith.xp, scene: G.scene === G.Title })")
        note('Tải lại trang giữa ải: không nhân đôi phần thưởng (thưởng chỉ cộng khi hết ải)', after['gold'] <= mid['gold'] and after['gold'] >= before['gold'],
             {'truoc_ai': before, 'giua_ai': mid, 'sau_tai_lai': after})
        g.close()

        # ---------- 7.2e: cài đặt âm thanh lưu ở đâu, có lên mây không
        g = Game(p, 'phone', init_script=seed(user={'uid': 'khachD', 'isAnonymous': True}), fresh=False)
        block(g)
        g.pg.wait_for_function("G.cloud.online()", timeout=4000); g.wait(600)
        g.ev("G.save.sound = false; G.save.gold += 1; G.persist(); G.cloud.push(true)"); g.wait(300)
        cl = json.loads(g.ev("window.__fs['linhkhi_users/khachD'].save"))
        loc = json.loads(g.ev(f"localStorage.getItem('{KEY}')"))
        note('Âm thanh: chỉ bật/tắt, lưu trên máy (không theo tài khoản)', loc.get('sound') is False and 'sound' in cl,
             {'tren_may': loc.get('sound'), 'trong_ban_may_chu_co_truong_sound': 'sound' in cl, 'gia_tri_tren_mây': cl.get('sound')})
        g.close()

    out = os.path.join(os.path.dirname(ROOT), 'docs', 'review', 'anh', 'au_luu.json')
    with open(out, 'w', encoding='utf-8') as fo:
        json.dump(RES, fo, ensure_ascii=False, indent=1)
    print(f"{sum(1 for r in RES if r['on'])}/{len(RES)} tình huống đúng như mong đợi; xem {out}")


if __name__ == '__main__':
    main()
