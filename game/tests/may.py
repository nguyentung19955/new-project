"""Lưu mây, bảng vàng, hòm thư góp ý (js/cloud.js, js/cloud_ui.js, js/bang_vang.js). Không cần mạng:
Firebase là bản giả trong trang (tests/fake_firebase.js), mọi lần tải thư viện từ gstatic bị chặn.

  python3 tests/may.py          # chạy hết
  python3 tests/may.py tat      # chỉ một phần: tat, luu, chon, google, gopy, xephang, quantri
"""
import os, sys, json, threading, functools, http.server, socketserver
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ui_lib import Game, Checker, ROOT
from playwright.sync_api import sync_playwright

FAKE = open(os.path.join(ROOT, 'tests', 'fake_firebase.js'), encoding='utf-8').read()
ONLY = sys.argv[1] if len(sys.argv) > 1 else None
ck = Checker('may')
SAVE_KEY = 'linhkhi_save_v1'
# bảng Anh Mõ (toạ độ game 480x270): nút Đăng nhập Google, Góp ý, Góp ý nhận được
BTN_GOOGLE, BTN_FB, BTN_ADMIN = (233, 154), (387, 154), (310, 181)


def run(name):
    return ONLY in (None, name)


def seed(local=None, cloud=None, user=None):
    """Mã chạy trước game (chỉ lần nạp đầu): bản lưu trên máy, dữ liệu trên mây giả, người đang đăng nhập."""
    js = "if (!sessionStorage.__seeded) { sessionStorage.__seeded = 1;"
    if local is not None:
        js += f"localStorage.setItem('{SAVE_KEY}', {json.dumps(json.dumps(local))});"
    if cloud is not None:
        js += f"localStorage.setItem('__fakefs', {json.dumps(json.dumps(cloud))});"
    if user is not None:
        js += f"localStorage.setItem('__fakeauth', {json.dumps(json.dumps(user))});"
    return js + "}\n" + FAKE


def block_cdn(g):
    hits = []
    g.ctx.route('**/www.gstatic.com/**', lambda r: (hits.append(r.request.url), r.abort()))
    return hits


def spy(g):
    """Ghi lại chữ trên mọi nút vẽ bằng G.theme trong khung hình gần nhất."""
    g.ev("""(() => { if (window.__spy) return; window.__spy = 1; window.__lab = [];
      for (const k of ['btn', 'sbtn']) { const f = G.theme[k]; G.theme[k] = function (x, y, w, h, l) { window.__lab.push(String(l)); return f.apply(this, arguments); }; } })()""")


def labels(g):
    g.ev("window.__lab = []"); g.wait(120)
    return g.ev("window.__lab")


def anh_mo(g):
    g.ev("G.setScene(G.Village); G.villageApi.open('mo')"); g.wait(200)


def base_save(g, **kw):
    """Một bản lưu hợp lệ dựng bằng chính game (G.newSave), sửa vài trường."""
    return g.ev("(o) => { const s = G.newSave(); Object.assign(s, o); return s; }", kw)


def online(g, ms=3000):
    g.pg.wait_for_function("G.cloud.online()", timeout=ms)


# ---------------------------------------------------------------- 1. tắt mây mà game vẫn chạy
if run('tat'):
    print('• Tắt mây: không cấu hình / mở từ tệp / không có mạng')
    with sync_playwright() as p:
        # mở từ tệp (file://), không có Firebase giả: tự tắt, không tải gì từ mạng
        g = Game(p, 'phone')
        hits = block_cdn(g)
        g.wait(400)
        st = g.ev("({ why: G.cloud.why, en: G.cloud.enabled, st: G.cloud.status, lbl: G.cloud.label() })")
        ck.ok(st['why'] == 'file' and not st['en'], f'mở từ tệp: tắt mây ({st})')
        anh_mo(g); spy(g)
        lab = labels(g)
        ck.ok('✉ Góp ý' in lab and any('Đăng nhập Google' in l for l in lab), 'Anh Mõ vẫn có Góp ý, nút Google mờ: ' + str([l for l in lab if 'Góp' in l or 'Google' in l]))
        g.ev("G.save.gold = 42; G.persist()")
        ck.ok(json.loads(g.ev(f"localStorage.getItem('{SAVE_KEY}')"))['gold'] == 42, 'vẫn lưu trên máy')
        ck.ok(not hits, 'không tải thư viện Firebase khi mở từ tệp')
        g.ev("G.startStage(0, 0, 0)"); g.wait(600)
        ck.ok(g.ev("G.scene === G.StageScene"), 'vào ải chơi bình thường')
        ck.done(g); g.close()

        # không cấu hình: FIREBASE_CONFIG không được gán
        g = Game(p, 'phone', init_script="window.LK_CLOUD_TEST = true; Object.defineProperty(window, 'FIREBASE_CONFIG', { get() { return undefined; }, set(v) {}, configurable: true });")
        g.wait(300)
        ck.ok(g.ev("G.cloud.why") == 'no-config' and not g.ev("G.cloud.enabled"), 'không có cấu hình: tắt mây')
        anh_mo(g); g.wait(200)
        ck.ok('Chưa bật lưu mây' in g.ev("G.cloud.label()"), 'dòng trạng thái: Chưa bật lưu mây')
        ck.done(g); g.close()

        # không có mạng: chạy qua http, mọi tải từ gstatic bị chặn → tự tắt, không lỗi trang
        class Quiet(http.server.SimpleHTTPRequestHandler):
            def log_message(self, *a):
                pass
        Handler = functools.partial(Quiet, directory=ROOT)
        srv = socketserver.TCPServer(('127.0.0.1', 0), Handler)
        threading.Thread(target=srv.serve_forever, daemon=True).start()
        url = f'http://127.0.0.1:{srv.server_address[1]}/index.html'
        for page in (url, url.replace('index.html', 'dist/linh-khi.html')):
            if 'dist' in page and not os.path.exists(os.path.join(ROOT, 'dist', 'linh-khi.html')):
                continue
            g = Game.__new__(Game)
            g.size, g.touch, g.fingers, g.errs = 'phone', True, {}, []
            g.browser = p.chromium.launch(); g.ctx = g.browser.new_context(**{'viewport': {'width': 844, 'height': 390}, 'has_touch': True, 'is_mobile': True})
            hits = block_cdn(g)
            g.pg = g.ctx.new_page()
            g.pg.on('pageerror', lambda e: g.errs.append('PAGEERROR ' + str(e)))
            g.pg.on('console', lambda m: g.errs.append(m.text) if m.type == 'error' and 'ERR_' not in m.text and 'fonts.g' not in m.text else None)
            g.pg.goto(page); g.pg.wait_for_function('window.G && G.scene'); g.wait(1200)
            st = g.ev("({ why: G.cloud.why, en: G.cloud.enabled, lbl: G.cloud.label() })")
            ck.ok(len(hits) >= 1 and st['why'] == 'offline' and not st['en'], f'{"dist" if "dist" in page else "index"} qua http, chặn gstatic: thử tải rồi tự tắt ({st})')
            ck.ok('ngoại tuyến' in st['lbl'], 'dòng trạng thái: Đang ngoại tuyến')
            g.ev("G.resetSave(); G.save.sound = false; G.setScene(G.Village); G.villageApi.open('mo')"); g.wait(300)
            g.ev("G.startStage(0, 0, 0)"); g.wait(500)
            ck.ok(g.ev("G.scene === G.StageScene"), 'không mạng: vẫn vào ải được')
            ck.done(g); g.close()
        srv.shutdown()

# ---------------------------------------------------------------- 2. khách tự đăng nhập, lưu gộp 4 giây
if run('luu'):
    print('• Khách tự đăng nhập, lưu gộp')
    with sync_playwright() as p:
        g = Game(p, 'phone', init_script=seed())
        hits = block_cdn(g)
        online(g)
        u = g.ev("({ uid: G.cloud.user.uid, anon: G.cloud.user.isAnonymous, n: window.__anonCount })")
        ck.ok(u['anon'] and u['uid'].startswith('khach') and u['n'] == 1, 'vào game tự đăng nhập khách ẩn danh: ' + str(u))
        ck.ok(not hits and g.ev("window.__fbConfig.projectId") == 'sontinhthuytinh', 'dùng cấu hình dự án sontinhthuytinh, không tải CDN khi đã có thư viện')
        g.wait(4500)
        doc = g.ev(f"window.__fs['linhkhi_users/' + G.cloud.user.uid]")
        ck.ok(doc and isinstance(doc['save'], str) and doc['updatedAt'] > 0 and doc['v'] == 1 and 'prog' in doc, 'bản lưu nằm ở linhkhi_users/{uid}')
        n0 = g.ev("window.__fsLog.filter(x => x.path.startsWith('linhkhi_users/')).length")
        g.ev("(async () => { for (let i = 0; i < 6; i++) { G.save.gold += 10; G.persist(); await new Promise(r => setTimeout(r, 150)); } })()")
        g.wait(1500)
        ck.ok(g.ev("window.__fsLog.filter(x => x.path.startsWith('linhkhi_users/')).length") == n0, 'chưa ghi ngay khi vừa lưu (chờ gộp)')
        ck.ok('Đang lưu' in g.ev("G.cloud.label()"), 'trạng thái Đang lưu lên mây…')
        g.wait(4000)
        n1 = g.ev("window.__fsLog.filter(x => x.path.startsWith('linhkhi_users/')).length")
        ck.ok(n1 == n0 + 1, f'6 lần lưu trong 1 giây chỉ thành 1 lần ghi lên mây ({n1 - n0})')
        cl = json.loads(g.ev("window.__fs['linhkhi_users/' + G.cloud.user.uid].save"))
        ck.ok(cl['gold'] == g.ev("G.save.gold") and cl['owner'] == g.ev("G.cloud.user.uid"), 'bản trên mây khớp bản trên máy, có chủ là uid')
        ck.ok(g.ev("G.cloud.label()").startswith('Đã lưu lên mây lúc '), 'trạng thái: ' + g.ev("G.cloud.label()"))
        n2 = n1
        g.ev("G.persist(); G.persist(); G.Village.enter()"); g.wait(4500)
        ck.ok(g.ev("window.__fsLog.filter(x => x.path.startsWith('linhkhi_users/')).length") == n2, 'lưu mà không có gì đổi thì không ghi lên mây')
        # mất mạng giữa chừng: báo ngoại tuyến, có mạng lại thì đẩy
        g.ev("window.__fbFail = true; G.save.gold += 1; G.persist()"); g.wait(4500)
        ck.ok('ngoại tuyến' in g.ev("G.cloud.label()"), 'ghi lỗi → Đang ngoại tuyến')
        g.ev("window.__fbFail = false; window.dispatchEvent(new Event('online'))"); g.wait(300)
        ck.ok(json.loads(g.ev("window.__fs['linhkhi_users/' + G.cloud.user.uid].save"))['gold'] == g.ev("G.save.gold"), 'có mạng lại → tự đẩy bản lưu')
        anh_mo(g); g.shot(os.path.join(ROOT, '..', 'docs', 'firebase-linh-khi', 'anh-mo-khach.png'))
        ck.done(g); g.close()

# ---------------------------------------------------------------- 3. chọn bản mới hơn, hỏi lại khi bản trên máy đi xa hơn
if run('chon'):
    print('• Chọn bản lưu')
    with sync_playwright() as p:
        tmp = Game(p, 'phone'); s0 = base_save(tmp); tmp.close()
        stars_many = {f'{r}-{i}': 3 for r in range(3) for i in range(5)}
        # a) mây mới hơn → dùng mây; âm thanh giữ theo máy
        local = dict(s0, gold=5, savedAt=1000, sound=False, owner='khachA')
        cloud = dict(s0, gold=777, savedAt=5000, sound=True, owner='khachA')
        g = Game(p, 'phone', fresh=False, init_script=seed(local, {'linhkhi_users/khachA': {'save': json.dumps(cloud), 'updatedAt': 5000, 'prog': 1, 'v': 1, 'ver': 'x'}}, {'uid': 'khachA', 'isAnonymous': True}))
        online(g); g.wait(300)
        r = g.ev("({ gold: G.save.gold, sound: G.save.sound, n: window.__anonCount || 0, uid: G.cloud.user.uid })")
        ck.ok(r['gold'] == 777 and r['uid'] == 'khachA' and r['n'] == 0, f'bản trên mây mới hơn → dùng bản trên mây, giữ tài khoản khách cũ ({r})')
        ck.ok(r['sound'] is False, 'âm thanh giữ theo máy (tắt trên máy, bật trên mây)')
        ck.ok(json.loads(g.ev(f"localStorage.getItem('{SAVE_KEY}')"))['gold'] == 777, 'bản trên mây được ghi xuống máy')
        g.ev("location.reload()"); g.pg.wait_for_function('window.G && G.scene'); online(g); g.wait(300)
        ck.ok(g.ev("G.save.gold") == 777 and g.ev("window.__fsLog.filter(x => x.op === 'set').length") == 0, 'mở lại: hai bản như nhau, không ghi thừa')
        ck.done(g); g.close()
        # b) máy mới hơn → giữ máy, đẩy lên
        local = dict(s0, gold=9, savedAt=9000, owner='khachA')
        g = Game(p, 'phone', fresh=False, init_script=seed(local, {'linhkhi_users/khachA': {'save': json.dumps(dict(s0, gold=1)), 'updatedAt': 2000, 'prog': 1, 'v': 1, 'ver': 'x'}}, {'uid': 'khachA', 'isAnonymous': True}))
        online(g); g.wait(300)
        ck.ok(g.ev("G.save.gold") == 9 and json.loads(g.ev("window.__fs['linhkhi_users/khachA'].save"))['gold'] == 9, 'bản trên máy mới hơn → giữ và đẩy lên mây')
        ck.done(g); g.close()
        # c) mây mới hơn nhưng máy đi xa hơn rõ rệt → hỏi lại
        for pick, want in (('cf-local', 'máy'), ('cf-cloud', 'mây')):
            local = dict(s0, gold=11, savedAt=1000, stars=stars_many, owner='khachA')
            g = Game(p, 'phone', fresh=False, init_script=seed(local, {'linhkhi_users/khachA': {'save': json.dumps(dict(s0, gold=22)), 'updatedAt': 8000, 'prog': 1, 'v': 1, 'ver': 'x'}}, {'uid': 'khachA', 'isAnonymous': True}))
            g.pg.wait_for_selector('#lk-conflict', timeout=3000)
            txt = g.pg.text_content('#lk-conflict')
            ck.ok('45 sao' in txt and 'Trên mây' in txt, 'hai bản lệch, máy đi xa hơn → hỏi chọn bản, có tóm tắt hai bản')
            if want == 'máy':
                g.shot(os.path.join(ROOT, '..', 'docs', 'firebase-linh-khi', 'chon-ban-luu.png'))
            g.pg.click(f'[data-act={pick}]'); g.wait(400)
            gold = g.ev("G.save.gold"); cl = json.loads(g.ev("window.__fs['linhkhi_users/khachA'].save"))['gold']
            ck.ok((gold, cl) == ((11, 11) if want == 'máy' else (22, 22)), f'chọn giữ bản trên {want}: máy {gold}, mây {cl}')
            ck.done(g); g.close()
        # d) bản lưu cũ chưa có savedAt vẫn đọc được
        old = dict(s0, gold=321); old.pop('savedAt', None)
        g = Game(p, 'phone', fresh=False, init_script=seed(old))
        online(g); g.wait(300)
        ck.ok(g.ev("G.save.gold") == 321 and json.loads(g.ev("window.__fs['linhkhi_users/' + G.cloud.user.uid].save"))['gold'] == 321, 'bản lưu cũ (không có mốc giờ) giữ nguyên và được đẩy lên')
        ck.done(g); g.close()

# ---------------------------------------------------------------- 4. nối Google, nút quản trị
if run('google'):
    print('• Đăng nhập Google, nút quản trị')
    with sync_playwright() as p:
        for email, admin in (('nguoichoi@gmail.com', False), ('ly230595@gmail.com', True)):
            g = Game(p, 'phone', init_script=f"window.__googleEmail = '{email}';\n" + FAKE)
            online(g)
            g.ev("G.save.gold = 1234; G.persist()")
            uid = g.ev("G.cloud.user.uid")
            anh_mo(g); spy(g)
            lab = labels(g)
            ck.ok('Đăng nhập Google' in lab and not any('Góp ý nhận được' in l for l in lab), 'khách: có nút Đăng nhập Google, không có nút Góp ý nhận được')
            g.tap(*BTN_GOOGLE); g.wait(500)
            u = g.ev("({ uid: G.cloud.user.uid, anon: G.cloud.user.isAnonymous, who: G.cloud.who(), gold: G.save.gold })")
            ck.ok(u['uid'] == uid and not u['anon'] and u['gold'] == 1234, f'nối khách vào Google: giữ uid và tiến trình ({u})')
            lab = labels(g)
            ck.ok('Đã đăng nhập Google' in lab, 'nút đổi thành Đã đăng nhập Google')
            has = any('Góp ý nhận được' in l for l in lab)
            ck.ok(has == admin, f'{email}: nút Góp ý nhận được {"hiện" if admin else "ẩn"}')
            if admin:
                g.shot(os.path.join(ROOT, '..', 'docs', 'firebase-linh-khi', 'anh-mo-quan-tri.png'))
            else:
                g.shot(os.path.join(ROOT, '..', 'docs', 'firebase-linh-khi', 'anh-mo-google.png'))
            ck.done(g); g.close()
        # email quản trị nhưng chưa xác minh → không có nút
        g = Game(p, 'phone', init_script=seed(user={'uid': 'adm', 'isAnonymous': False, 'email': 'ly230595@gmail.com', 'emailVerified': False, 'displayName': 'A'}))
        online(g); anh_mo(g); spy(g)
        ck.ok(not g.ev("G.cloud.isAdmin()") and not any('Góp ý nhận được' in l for l in labels(g)), 'email quản trị chưa xác minh: không có nút')
        ck.done(g); g.close()
        # tài khoản Google đã có dữ liệu riêng → chuyển sang nó
        g = Game(p, 'phone', init_script=seed(cloud={'linhkhi_users/google-cu': {'save': '', 'updatedAt': 1, 'prog': 0, 'v': 1, 'ver': 'x'}}) + "\nwindow.__linkConflict = true;")
        online(g)
        anh_mo(g); g.tap(*BTN_GOOGLE); g.wait(600)
        ck.ok(g.ev("G.cloud.user.uid") == 'google-cu' and not g.ev("G.cloud.user.isAnonymous"), 'tài khoản Google đã có → chuyển sang tài khoản đó')
        ck.done(g); g.close()

# ---------------------------------------------------------------- 5. hòm thư góp ý
FB_KEYS = 'at,contact,guest,kind,scr,shot,text,ua,uid,ver,where'
if run('gopy'):
    print('• Góp ý')
    with sync_playwright() as p:
        g = Game(p, 'phone', init_script=FAKE)
        online(g); anh_mo(g)
        g.tap(*BTN_FB)
        ck.ok(g.pg.is_visible('#lk-fb'), 'Anh Mõ → ✉ Góp ý mở hòm thư')
        ck.ok(not g.pg.query_selector('#lk-fb-shot'), 'mở ở làng: không có ô đính kèm ảnh trận')
        kinds = g.pg.eval_on_selector_all('[data-act=fb-kind]', 'a => a.map(b => b.textContent)')
        ck.ok(kinds == ['Lỗi', 'Ý tưởng', 'Cân bằng', 'Khác'], 'bốn loại: ' + str(kinds))
        g.pg.fill('#lk-fb-text', 'ngắn'); g.pg.click('[data-act=fb-send]'); g.wait(150)
        ck.ok('10' in g.pg.text_content('#lk-fb-err') and g.pg.input_value('#lk-fb-text') == 'ngắn', 'dưới 10 ký tự → báo, giữ chữ đã gõ')
        g.pg.fill('#lk-fb-text', 'x' * 1200)
        ck.ok(len(g.pg.input_value('#lk-fb-text')) == 1000, 'tối đa 1000 ký tự')
        g.pg.keyboard.press('KeyJ')  # gõ chữ không lọt xuống game
        g.pg.click('[data-act=fb-kind][data-k=idea]')
        g.pg.fill('#lk-fb-text', 'Nút Lên đò hơi khó thấy trên máy nhỏ')
        g.pg.fill('#lk-fb-contact', 'zalo 0900')
        g.shot(os.path.join(ROOT, '..', 'docs', 'firebase-linh-khi', 'gop-y.png'))
        g.pg.click('[data-act=fb-send]'); g.wait(300)
        ck.ok(g.pg.is_visible('#lk-fb-thanks') and 'đã được gửi' in g.pg.text_content('#lk-fb-thanks'), 'gửi xong → Cảm ơn góp ý, đã gửi')
        adds = g.ev("window.__fsLog.filter(x => x.op === 'add')")
        ck.ok(len(adds) == 1 and adds[0]['path'].startswith('linhkhi_feedback/'), 'lưu vào linhkhi_feedback')
        d = adds[0]['data']
        ck.ok(','.join(sorted(d)) == FB_KEYS, 'đúng các trường: ' + ','.join(sorted(d)))
        ck.ok(d['kind'] == 'idea' and d['contact'] == 'zalo 0900' and d['uid'] == g.ev("G.cloud.user.uid") and d['guest'] is True and d['shot'] == '', 'loại, liên hệ, uid, khách')
        ck.ok(d['ver'] == g.ev("G.VERSION") and d['where'].startswith('Làng') and d['scr'].startswith('844x390') and 0 < len(d['ua']) <= 160 and d['at'] > 0, f"kèm phiên bản, chỗ mở, màn hình, máy: {d['ver']} · {d['where']} · {d['scr']} · {d['ua']}")
        g.pg.click('[data-act=fb-close]'); g.wait(150)
        ck.ok(not g.pg.query_selector('#lk-ov') and not g.ev("G.overlayOpen"), 'Đóng → về game')
        # 60 giây
        g.tap(*BTN_FB); g.pg.fill('#lk-fb-text', 'Góp ý thứ hai gửi ngay'); g.pg.click('[data-act=fb-send]'); g.wait(200)
        ck.ok('đợi' in g.pg.text_content('#lk-fb-err') and g.ev("window.__fsLog.filter(x => x.op === 'add').length") == 1, 'trong 60 giây → chặn, báo đợi')
        g.pg.keyboard.press('Escape'); g.wait(100)
        ck.ok(not g.pg.query_selector('#lk-ov'), 'Esc đóng hòm thư')
        # mất mạng → hàng đợi, tối đa 5
        g.ev("window.__fbFail = true")
        for i in range(7):
            g.ev("(() => { const s = JSON.parse(localStorage.getItem('linhkhi.feedback')); s.last = 0; s.n = 0; localStorage.setItem('linhkhi.feedback', JSON.stringify(s)); })()")
            g.tap(*BTN_FB); g.pg.fill('#lk-fb-text', f'Góp ý lúc mất mạng số {i + 1}'); g.pg.click('[data-act=fb-send]'); g.wait(200)
            if i == 0:
                ck.ok('tự gửi khi có mạng' in g.pg.text_content('#lk-fb-thanks'), 'mất mạng → báo đã lưu, sẽ tự gửi')
            g.pg.click('[data-act=fb-close]'); g.wait(100)
        q = g.ev("JSON.parse(localStorage.getItem('linhkhi.feedback')).queue")
        ck.ok(len(q) == 5 and q[-1]['text'].endswith('7'), f'hàng đợi giữ tối đa 5 góp ý mới nhất ({len(q)})')
        g.ev("window.__fbFail = false; window.dispatchEvent(new Event('online'))"); g.wait(1200)
        ck.ok(g.ev("window.__fsLog.filter(x => x.op === 'add').length") == 6 and not g.ev("JSON.parse(localStorage.getItem('linhkhi.feedback')).queue.length"), 'có mạng lại → tự gửi hết hàng đợi')
        # 10 / ngày
        g.ev("(() => { const s = JSON.parse(localStorage.getItem('linhkhi.feedback')); s.last = 0; s.n = 10; s.day = new Date().toDateString(); localStorage.setItem('linhkhi.feedback', JSON.stringify(s)); })()")
        g.tap(*BTN_FB); g.pg.fill('#lk-fb-text', 'Góp ý thứ mười một trong ngày'); g.pg.click('[data-act=fb-send]'); g.wait(200)
        ck.ok('10 góp ý' in g.pg.text_content('#lk-fb-err'), 'quá 10 góp ý một ngày → chặn')
        g.ev("(() => { const s = JSON.parse(localStorage.getItem('linhkhi.feedback')); s.day = 'Mon Jan 01 2001'; localStorage.setItem('linhkhi.feedback', JSON.stringify(s)); })()")
        g.pg.click('[data-act=fb-send]'); g.wait(300)
        ck.ok(g.pg.is_visible('#lk-fb-thanks'), 'sang ngày mới → gửi được')
        g.pg.click('[data-act=fb-close]')
        # trong trận: bảng tạm dừng, kèm ảnh
        g.ev("G.startStage(0, 0, 0)"); g.wait(900)
        g.ev("(() => { const s = JSON.parse(localStorage.getItem('linhkhi.feedback')); s.last = 0; localStorage.setItem('linhkhi.feedback', JSON.stringify(s)); })()")
        g.pg.keyboard.press('Escape'); g.wait(300)
        ck.ok(g.ev("G.getRun().mode") == 'paused', 'Esc → tạm dừng')
        g.shot(os.path.join(ROOT, '..', 'docs', 'firebase-linh-khi', 'tam-dung.png'))
        g.tap(240, 205); g.wait(300)
        ck.ok(g.pg.is_visible('#lk-fb') and g.pg.is_checked('#lk-fb-shot'), 'bảng tạm dừng → ✉ Góp ý, có ô đính kèm ảnh (đã chọn)')
        g.pg.click('[data-act=fb-kind][data-k=bug]'); g.pg.fill('#lk-fb-text', 'Quái đứng kẹt trong tường phòng đầu')
        g.shot(os.path.join(ROOT, '..', 'docs', 'firebase-linh-khi', 'gop-y-trong-tran.png'))
        g.pg.click('[data-act=fb-send]'); g.wait(300)
        d = g.ev("window.__fsLog.filter(x => x.op === 'add').pop().data")
        ck.ok(d['shot'].startswith('data:image/jpeg;base64,') and len(d['shot']) <= 200000, f"ảnh JPEG ≤150KB ({len(d['shot'])} ký tự)")
        ck.ok(d['where'].startswith('Ải ') and 'phòng' in d['where'] and d['kind'] == 'bug', 'chỗ mở: ' + d['where'])
        g.pg.click('[data-act=fb-close]'); g.wait(200)
        ck.ok(g.ev("G.getRun().mode") == 'paused', 'đóng hòm thư → vẫn ở bảng tạm dừng')
        # màn kết quả
        g.ev("(() => { const s = JSON.parse(localStorage.getItem('linhkhi.feedback')); s.last = 0; localStorage.setItem('linhkhi.feedback', JSON.stringify(s)); })()")
        g.ev("G.getRun().quit = true; G.finishStage(false)"); g.wait(700)
        g.tap(372, 33); g.wait(300)
        ck.ok(g.pg.is_visible('#lk-fb') and g.pg.query_selector('#lk-fb-shot') is not None, 'màn kết quả → ✉ Góp ý, có ảnh')
        g.pg.click('[data-act=fb-close]')
        ck.done(g); g.close()

# ---------------------------------------------------------------- 6. bảng vàng
if run('xephang'):
    print('• Bảng vàng')
    with sync_playwright() as p:
        others = {}
        heroes = None
        for i in range(13):
            others[f'linhkhi_scores/u{i:02d}'] = {'name': f'Người {i:02d}', 'power': 300 + i * 37, 'stars': i * 3, 'far': min(15, i + 1), 'hero': 'smith', 'g': False, 'at': 1, 'b_ngu': 60 + i * 5}
        g = Game(p, 'phone', init_script=seed(cloud=others))
        online(g)
        uid = g.ev("G.cloud.user.uid")
        g.ev("G.save.stars['0-0'] = 3; G.save.stars['0-1'] = 2; G.persist(); G.bangVang.sync(true)"); g.wait(400)
        row = g.ev(f"window.__fs['linhkhi_scores/{uid}']")
        ck.ok(row and row['stars'] == 5 and row['far'] == 2 and row['name'].startswith('Khách ') and len(row['name']) == 10 and row['hero'] == 'smith', 'qua ải → ghi dòng của mình (tên Khách + 4 số): ' + json.dumps(row, ensure_ascii=False))
        n = g.ev(f"window.__fsLog.filter(x => x.path === 'linhkhi_scores/{uid}').length")
        g.ev("G.bangVang.sync(true)"); g.wait(300)
        ck.ok(g.ev(f"window.__fsLog.filter(x => x.path === 'linhkhi_scores/{uid}').length") == n, 'không có gì tốt hơn → không ghi')
        g.ev("G.save.stars = { '0-0': 1 }; G.persist(); G.bangVang.sync(true)"); g.wait(300)
        ck.ok(g.ev(f"window.__fsLog.filter(x => x.path === 'linhkhi_scores/{uid}').length") == n and g.ev(f"window.__fs['linhkhi_scores/{uid}'].stars") == 5, 'kém hơn (ít sao hơn) → không ghi đè')
        # kỷ lục trùm vùng ở màn kết quả
        g.ev("G.save.stars = { '0-0': 3, '0-1': 2 }; G.persist()")
        res = []
        for t in (64.0, 80.0, 41.5):
            g.ev(f"""(() => {{ G.startStage(1, 4, 0); const S = G.getRun(); const k = S.rooms.indexOf('boss'); G.gotoRoom(k); S.roomT = {t} + 1.5; S.endT = 1.5; G.finishStage(true); }})()""")
            g.wait(500)
            res.append([l for l in g.ev("G.getRun().result.lines.filter(l => typeof l === 'string')") if 'Kỷ lục' in l and 'Ngư' in l])
            if t == 41.5:
                g.shot(os.path.join(ROOT, '..', 'docs', 'firebase-linh-khi', 'ket-qua-ky-luc.png'))
        ck.ok(res[0] and 'Kỷ lục đầu' in res[0][0] and '64,0' in res[0][0], 'lần đầu hạ Ngư Tinh → báo kỷ lục đầu tiên: ' + str(res[0]))
        ck.ok(not res[1], 'chậm hơn → không báo')
        ck.ok(res[2] and 'Kỷ lục mới' in res[2][0] and '41,5' in res[2][0], 'nhanh hơn → Kỷ lục mới: ' + str(res[2]))
        g.wait(2500)
        ck.ok(g.ev(f"window.__fs['linhkhi_scores/{uid}'].b_ngu") == 41.5, 'thời gian hạ trùm nhanh nhất lên bảng (41,5 giây)')
        # xem bảng ở Cụ Đồ
        g.ev("G.setScene(G.Village); G.villageApi.V.dtab = 'rank'; G.villageApi.open('do')"); g.wait(600)
        spy(g); lab = labels(g)
        ck.ok(all(x in lab for x in ['Cây kỹ năng', 'Hướng dẫn', 'Bảng vàng', 'Đổi tên']) and not any(x in lab for x in ['Sao', 'Ngư Tinh']), 'Cụ Đồ có thẻ Bảng vàng (một bảng theo Sức mạnh, không chia thẻ), nút Đổi tên')
        reads = g.ev("window.__fsReads")
        ck.ok(g.ev("G.bangVang.data.power.items.length") == 8, 'trang đầu tải 8 dòng (đỡ lượt đọc)')
        g.shot(os.path.join(ROOT, '..', 'docs', 'firebase-linh-khi', 'bang-vang-suc-manh.png'))
        g.ev("G.bangVang.page = 1"); g.wait(500)
        ck.ok(g.ev("G.bangVang.data.power.items.length") == 14 and not g.ev("G.bangVang.data.power.more"), 'sang trang 2 mới tải tiếp (đủ 14 người, hết)')
        top = g.ev("G.bangVang.data.power.items.map(x => x.power)")
        ck.ok(top == sorted(top, reverse=True), 'xếp Sức mạnh giảm dần')
        # đổi tên
        g.ev("G.bangVang.page = 0"); g.wait(200)
        g.tap(160 + 150 + 36, 252); g.wait(300)
        ck.ok(g.pg.is_visible('#lk-rename'), 'Đổi tên mở khung nhập')
        g.pg.fill('#lk-name', 'a'); g.pg.click('[data-act=name-ok]'); g.wait(100)
        ck.ok(g.pg.text_content('#lk-name-err') != '', 'tên 1 ký tự → báo lỗi')
        g.pg.fill('#lk-name', '  Bé   Na<b>!!  '); g.pg.click('[data-act=name-ok]'); g.wait(2600)
        ck.ok(g.ev("G.save.lbName") == 'Bé Nab' and g.ev(f"window.__fs['linhkhi_scores/{uid}'].name") == 'Bé Nab', 'lọc ký tự lạ, gộp dấu cách: "Bé Nab" lên bảng')
        clean = g.ev("['Ăn Quả 99', 'x', 'a'.repeat(17), '🙂🙂', 'Tèo_-2'].map(G.bangVang.cleanName)")
        ck.ok(clean == ['Ăn Quả 99', '', '', '', 'Tèo_-2'], 'luật tên 2-16 ký tự: ' + str(clean))
        for _ in range(3):
            g.ev("G.bangVang.page++"); g.wait(300)
        ck.ok(g.ev("G.bangVang.data.power.items.some(x => x.uid === G.cloud.user.uid && x.name === 'Bé Nab')"), 'dòng của mình có trên bảng (tên mới)')
        ck.done(g); g.close()
        # ngoại tuyến: bảng báo cần mạng, vẫn thấy kỷ lục của mình
        g = Game(p, 'phone')
        g.ev("G.setScene(G.Village); G.villageApi.V.dtab = 'rank'; G.villageApi.open('do')"); g.wait(400)
        g.shot(os.path.join(ROOT, '..', 'docs', 'firebase-linh-khi', 'bang-vang-ngoai-tuyen.png'))
        ck.ok(g.ev("G.villageApi.V.tab") == 'rank', 'không có mạng: thẻ Bảng vàng vẫn mở được')
        ck.done(g); g.close()

# ---------------------------------------------------------------- 7. góp ý nhận được (quản trị)
if run('quantri'):
    print('• Góp ý nhận được')
    with sync_playwright() as p:
        tmp = Game(p, 'phone'); tmp.close()
        fb = {}
        for i in range(25):
            fb[f'linhkhi_feedback/f{i:02d}'] = {'kind': ['bug', 'idea', 'balance', 'other'][i % 4], 'text': f'Góp ý số {i:02d}: ' + 'nội dung ' * 3, 'contact': 'zalo 09' if i % 5 == 0 else '', 'shot': '',
                                               'ver': 'lk-test', 'where': 'Làng · settings', 'scr': '844x390@3.0', 'ua': 'Android 14 · Chrome/120', 'at': 1700000000000 + i * 60000, 'uid': f'k{i}', 'guest': True}
        fb['linhkhi_feedback/f24']['shot'] = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ=='
        fb['linhkhi_feedback/f23']['status'] = 'done'
        g = Game(p, 'phone', init_script=seed(cloud=fb, user={'uid': 'admin1', 'isAnonymous': False, 'email': 'Ly230595@gmail.com', 'emailVerified': True, 'displayName': 'Chủ dự án'}))
        online(g); g.wait(300)
        ck.ok(g.ev("G.cloud.isAdmin()") and g.ev("G.cloud.adminNew") == 24, 'quản trị: đếm 24 góp ý mới (1 đã xử lý)')
        anh_mo(g); spy(g)
        ck.ok(any('Góp ý nhận được (24 mới)' in l for l in labels(g)), 'nút 📥 Góp ý nhận được có số mới (chấm đỏ)')
        g.ev("window.__fs['linhkhi_feedback/f24'].shot = G.cloudUI.capture()")  # ảnh thật chụp từ khung cảnh làng
        g.tap(*BTN_ADMIN); g.wait(400)
        ck.ok(g.pg.is_visible('#lk-inbox'), 'mở màn Góp ý nhận được')
        items = g.pg.eval_on_selector_all('#lk-in-list .lk-item', 'a => a.map(e => e.dataset.id)')
        ck.ok(len(items) == 20 and items[0] == 'f24' and items[1] == 'f23', 'mới nhất trước, mỗi lần 20 mục')
        ck.ok('Liên hệ: zalo 09' in g.pg.text_content('#lk-in-list') and 'Android 14' in g.pg.text_content('#lk-in-list'), 'hiện liên hệ, máy, trình duyệt')
        g.shot(os.path.join(ROOT, '..', 'docs', 'firebase-linh-khi', 'gop-y-nhan-duoc.png'))
        g.pg.click('[data-act=in-more]'); g.wait(300)
        ck.ok(g.pg.eval_on_selector_all('#lk-in-list .lk-item', 'a => a.length') == 25, 'Tải thêm → đủ 25')
        g.pg.click('[data-act=in-kind][data-k=bug]'); g.wait(100)
        n_bug = g.pg.eval_on_selector_all('#lk-in-list .lk-item', 'a => a.length')
        g.pg.click('[data-act=in-st][data-s=done]'); g.wait(100)
        n_done = g.pg.eval_on_selector_all('#lk-in-list .lk-item', 'a => a.length')
        ck.ok(n_bug == 7 and n_done == 0, f'lọc theo loại (Lỗi: {n_bug}) và trạng thái (Lỗi + Đã xử lý: {n_done})')
        g.pg.click('[data-act=in-kind][data-k=all]'); g.pg.click('[data-act=in-st][data-s=all]'); g.wait(100)
        first = '#lk-in-list .lk-item[data-id=f24]'
        g.pg.click(first + ' [data-act=in-set][data-s=seen]'); g.wait(200)
        ck.ok(g.ev("window.__fs['linhkhi_feedback/f24'].status") == 'seen', 'đổi trạng thái → Đã xem')
        g.pg.click(first + ' [data-act=in-note]'); g.pg.fill(first + ' textarea', 'Đã sửa ở bản sau'); g.pg.click(first + ' [data-act=in-note-save]'); g.wait(200)
        ck.ok(g.ev("window.__fs['linhkhi_feedback/f24'].note") == 'Đã sửa ở bản sau', 'ghi chú')
        upd = g.ev("window.__fsLog.filter(x => x.op === 'update').map(x => Object.keys(x.data).sort().join(','))")
        ck.ok(all(u in ('status', 'note,status') for u in upd), 'quản trị chỉ đổi status / note: ' + str(upd))
        g.pg.click(first + ' img'); g.wait(100)
        ck.ok(g.pg.is_visible('#lk-big'), 'chạm ảnh → xem ảnh to')
        g.pg.click('#lk-big'); g.wait(100)
        g.pg.click(first + ' [data-act=in-del]'); g.wait(100)
        ck.ok(g.pg.is_visible(first + ' [data-act=in-del-yes]') and g.ev("!!window.__fs['linhkhi_feedback/f24']"), 'Xoá → hỏi lại, chưa xoá')
        g.pg.click(first + ' [data-act=in-del-yes]'); g.wait(300)
        ck.ok(not g.ev("!!window.__fs['linhkhi_feedback/f24']") and g.pg.eval_on_selector_all('#lk-in-list .lk-item', 'a => a.length') == 24, 'xác nhận → xoá hẳn')
        g.pg.click('[data-act=in-close]')
        ck.done(g); g.close()
        # người khác gọi thẳng cũng không mở được
        g = Game(p, 'phone', init_script=FAKE)
        online(g); g.ev("G.cloudUI.inbox()"); g.wait(200)
        ck.ok(not g.pg.query_selector('#lk-inbox'), 'khách gọi thẳng G.cloudUI.inbox() → không mở')
        ck.done(g); g.close()

ok = ck.done()
sys.exit(0 if ok else 1)
