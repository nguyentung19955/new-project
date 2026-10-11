"""Phiên C2 (ảnh AI cho 30 biểu tượng nhỏ + phóng to biểu tượng tinh anh): MỘT lượt kiểm nhanh bằng Playwright.
Chạy từ thư mục gốc repo:
  python3 docs/review/giao-dien-c2/kiem.py <thư mục bản code CŨ để so>   (ví dụ một git worktree của commit trước phiên này)
Làm gì:
  1) tự dựng ảnh lưới mẫu 6×5 (30 hình, nền hồng tím) → đưa vào trang tools/tach-giao-dien, lô "Biểu tượng nhỏ" → phải ĐẠT, tệp có "net": 2;
  2) chụp game ở 844×390, 10 cảnh: bản CŨ / bản MỚI không có tệp (phải khác 0 điểm ảnh, TRỪ cảnh tinh anh là thay đổi cố ý) / bản MỚI nạp tạm 30 tệp mẫu;
  3) ghép ảnh kiểm docs/review/giao-dien-c2/anh-kiem.png và ảnh trước/sau của tinh anh "Nổ khi chết" (tinh-anh-truoc-sau.png).
Không ghi gì vào game/art/custom. Ảnh mẫu chỉ nằm trong thư mục tạm."""
import base64, functools, http.server, io, json, os, sys, tempfile, threading
from PIL import Image, ImageChops, ImageDraw
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OLD = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else None
TMP = tempfile.mkdtemp(prefix='c2-')
DT = dict(viewport={'width': 844, 'height': 390}, is_mobile=True, has_touch=True, device_scale_factor=2)


def serve(root):
    class Im(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    s = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Im, directory=root))
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return 'http://127.0.0.1:%d' % s.server_address[1]


# ---------- 1) ảnh lưới mẫu 6×5: hình khối đơn giản, mỗi ô một dáng và một màu để nhận ra trong game ----------
def anh_mau(path):
    C, cot, hang = 170, 6, 5
    im = Image.new('RGB', (C * cot, C * hang), '#FF00FF')
    d = ImageDraw.Draw(im)
    for i in range(1, cot): d.line([(i * C, 0), (i * C, C * hang)], fill='#201820', width=2)
    for j in range(1, hang): d.line([(0, j * C), (C * cot, j * C)], fill='#201820', width=2)
    V = '#14182e'
    LUA, DOC, BANG = ('#fe7d04', '#feec86'), ('#5aca02', '#fbfed0'), ('#32b0e9', '#eefffc')

    def o(i): return ((i % cot) * C, (i // cot) * C)
    def P(i, pts, mau, w=8):
        x, y = o(i); q = [(x + a, y + b) for a, b in pts]; d.polygon(q, fill=mau); d.line(q + [q[0]], fill=V, width=w, joint='curve')
    def E(i, box, mau, w=8):
        x, y = o(i); d.ellipse([x + box[0], y + box[1], x + box[2], y + box[3]], fill=mau, outline=V, width=w)
    def R(i, box, mau, w=8, r=0):
        x, y = o(i); d.rounded_rectangle([x + box[0], y + box[1], x + box[2], y + box[3]], r, fill=mau, outline=V, width=w)
    def cham(i, box, mau):
        x, y = o(i); d.ellipse([x + box[0], y + box[1], x + box[2], y + box[3]], fill=mau)

    giot = [(85, 25), (130, 95), (125, 130), (85, 148), (45, 130), (40, 95)]
    for k, (a, b) in enumerate([LUA, DOC, BANG]):                       # 1–3 hệ: giọt màu hệ + lõi sáng
        P(k, giot, a); cham(k, (68, 90, 102, 124), b)
    for k, (a, b) in enumerate([LUA, DOC, BANG]):                       # 4–6 trạng thái: ô vuông màu hệ + lõi
        R(3 + k, (35, 35, 135, 135), a, r=14); cham(3 + k, (60, 60, 110, 110), b)
    R(6, (20, 60, 150, 110), '#c98c34', r=10); cham(6, (70, 68, 100, 102), '#58371e')   # 7 dây trói: thanh dẹt ngang
    P(7, [(105, 22), (45, 92), (80, 92), (60, 148), (128, 72), (92, 72)], '#f4bf4d')  # 8 nhanh: tia sét
    P(8, [(35, 30), (135, 30), (135, 95), (85, 148), (35, 95)], '#cecdda'); x, y = o(8); d.line([(x + 85, y + 40), (x + 85, y + 135)], fill='#5c5b73', width=10)  # 9 giáp
    E(9, (30, 50, 135, 150), '#3b3234'); x, y = o(9); d.line([(x + 105, y + 55), (x + 130, y + 28)], fill='#c98c34', width=10); cham(9, (120, 15, 148, 43), '#ffc90e'); cham(9, (50, 70, 75, 95), '#cecdda')  # 10 nổ: bom
    P(10, giot, '#c43b37'); cham(10, (58, 92, 78, 122), '#f9b788')       # 11 hút máu: giọt đỏ
    P(11, [(25, 148), (48, 50), (68, 120), (85, 22), (102, 120), (122, 50), (145, 148)], '#efe2d1')  # 12 gai: ba mũi nhọn
    R(12, (68, 18, 102, 110), '#feec86', r=8); E(12, (66, 122, 104, 156), '#feec86')   # 13 sắp ra đòn: chấm than mảnh
    E(13, (28, 55, 142, 152), '#c43b37'); R(13, (62, 22, 108, 62), '#efe2d1', r=6)    # 14 túi
    R(14, (40, 78, 130, 150), '#f4bf4d', r=6); x, y = o(14); d.arc([x + 52, y + 22, x + 118, y + 110], 180, 360, fill=V, width=20); d.arc([x + 58, y + 28, x + 112, y + 104], 180, 360, fill='#f4bf4d', width=8); cham(14, (75, 100, 95, 125), V)  # 15 khoá
    R(15, (40, 78, 130, 150), '#8fa49e', r=6); x, y = o(15); d.arc([x + 82, y + 18, x + 148, y + 100], 180, 360, fill=V, width=20); d.arc([x + 88, y + 24, x + 142, y + 94], 180, 360, fill='#8fa49e', width=8)  # 16 khoá mở: quai lệch phải
    R(16, (30, 30, 140, 140), '#5aca02', r=12); x, y = o(16); d.line([(x + 55, y + 88), (x + 78, y + 112), (x + 118, y + 58)], fill='#1c3a10', width=16, joint='curve')  # 17 dấu tích
    sao = [(85, 18), (103, 66), (153, 68), (113, 100), (128, 150), (85, 121), (42, 150), (57, 100), (17, 68), (67, 66)]
    P(17, sao, '#f4bf4d')                                                # 18 sao đặc
    x, y = o(18); q = [(x + a, y + b) for a, b in sao]; d.line(q + [q[0]], fill='#8fa49e', width=12, joint='curve')  # 19 sao rỗng: chỉ viền
    for k, mau in enumerate(['#f4bf4d', '#cecdda', '#c98c34']): E(19 + k, (25, 30, 145, 140), mau)  # 20–22 huy chương
    P(22, [(35, 32), (135, 32), (135, 95), (85, 146), (35, 95)], '#cedaea'); cham(22, (70, 60, 100, 90), '#ffffff')  # 23 khiên
    R(23, (48, 12, 122, 158), '#f4bf4d', r=10); R(23, (76, 34, 94, 104), '#a03409', w=1); cham(23, (74, 118, 96, 140), '#a03409')  # 24 chấm than trên thẻ
    for k, (a, b) in enumerate([LUA, DOC, BANG]):                       # 25–27 bùa: tờ giấy vàng + chấm hệ
        R(24 + k, (48, 18, 122, 152), '#feec86'); R(24 + k, (48, 18, 122, 42), a, w=8); cham(24 + k, (65, 68, 105, 108), a)
    for k, (a, b) in enumerate([LUA, DOC, BANG]):                       # 28–30 ngọc: bầu dục dẹt
        E(27 + k, (25, 38, 145, 132), a); cham(27 + k, (48, 55, 78, 80), b)
    im.save(path)


# ---------- game ----------
HELP = r"""
window.T = {
  sc: null,
  freeze() { const sc = G.scene; G.scene = { update() {}, draw() { sc.draw(); }, hide() {} }; G.tick = function () {}; },
  rng(seed) { const r = G.srand(seed); Math.random = r; G.rnd = r; },
  save(o) { G.time = 100; T.rng(5); G.testSave(Object.assign({ lvl: 12, gold: 500, branch: 'fire', marks: 40 }, o || {})); G.save.stars = { '0-0': 3, '0-1': 2 }; return G.save; },
  start(r, i, seed) { T.save(); G.save.potions = 2; T.rng(seed * 13 + 5); G.startStage(r, i, 0, { kind: 'A', seed }); const S = G.getRun(); S.fade = 0; return S; },
  // vào phòng tinh anh: hạ các đợt quái thường cho tới khi con tinh anh hiện ra hẳn, rồi dọn hết quái khác để ảnh chỉ còn nó
  elite() {
    const R = G.getRun(), W = R.W, P = R.P; P.inv = 9999;
    const xong = () => W.ents.some((e) => e.role === 'elite' && !e.dead && !(e.spawnT > 0));
    for (let k = 0; k < 3000 && !xong(); k++) { for (const e of W.ents) if (!e.dead && e.role !== 'elite' && !(e.spawnT > 0)) G.kill(e, {}); G.sim(2); }
    for (const e of W.ents) if (!e.dead && e.role !== 'elite') G.kill(e, {});
    G.sim(240);
    for (let i = W.ents.length - 1; i >= 0; i--) if (W.ents[i].role !== 'elite') W.ents.splice(i, 1);
    for (const e of W.ents) if (e.role === 'elite') { Object.assign(e.st, { fire: 0, poisonN: 0, poisonT: 0, iceN: 0, iceT: 0, frozen: 0, stun: 0, root: 0, last: null }); e.hp = e.maxhp; e.x = Math.round((W.x0 + W.x1) / 2 + 40); e.y = Math.round(P.y - 10); e.act = null; e.an = { n: 'idle', t: 0, spd: 1 }; e.hitT = 0; e.flash = 0; e.face = -1; e.dirA = Math.PI; }
    if (G.fx && G.fx.reset) G.fx.reset(); // bỏ hiệu ứng quái gục còn treo (G.sim không chạy hiệu ứng)
  },
  lang() { T.save(); const sv = G.save; sv.weapons[0].lock = true; G.newWeapon(sv, 'spear', 1).lock = true; G.newWeapon(sv, 'hammer', 0); G.setScene(G.Village); G.villageApi.V.tab = 'hub'; for (let k = 0; k < 30; k++) G.tick(); G.time = 200; G.villageScene.state.t = 50; }, // đặt lại hai đồng hồ để bản cũ và bản mới vẽ cùng một khung hình
};
"""
SCENES = [
    # tên, có thay đổi cố ý không, mã chạy trong trang
    ('tran', False, "() => { const S = T.start(0, 1, 3); G.gotoRoom(S.map.rooms.find(o => o.type === 'fight').id); const W = G.getRun().W; for (let k = 0; k < 400 && W.ents.length < 2; k++) G.sim(1); G.sim(20); const P = G.getRun().P; P.st.fire = 2; P.st.poison = 2; P.st.ice = 2; P.oShield = 2; for (const e of W.ents) { e.spikeUp = 0; e.brokeT = 0; e.wind = 0; e.st.root = 0; } T.freeze(); }"),
    ('troi', False, "() => { G.TRANG_THAI_TREN_THAN = false; const S = T.start(0, 1, 3); G.gotoRoom(S.map.rooms.find(o => o.type === 'fight').id); const W = G.getRun().W; for (let k = 0; k < 400 && W.ents.length < 2; k++) G.sim(1); G.sim(20); for (const e of W.ents) { e.spikeUp = 0; e.brokeT = 0; e.wind = 0; e.st.root = 1; } T.freeze(); }"),  # dấu trói: chỉ còn hiện trên đầu quái khi tắt "trạng thái trên thân" của Đợt 7 (và trên trùm)
    ('tinh-anh', True, "() => { const S = T.start(0, 2, 3); G.testGoto('elite'); const W = G.getRun().W; T.elite(); for (const e of W.ents) { if (e.role === 'elite') e.trait = 'no'; e.spikeUp = 0; e.wind = 0; } T.freeze(); }"),
    ('tinh-anh-2', True, "() => { const S = T.start(0, 2, 3); G.testGoto('elite'); const W = G.getRun().W; T.elite(); for (const e of W.ents) { if (e.role === 'elite') { e.trait = 'hut'; e.spikeUp = 1; e.wind = 0.1; e.st.root = 1; e.st.poisonN = 2; e.st.poisonT = 3; e.st.last = 'poison'; e.hp = e.maxhp * 0.6; } } T.freeze(); }"),
    ('lang', False, "() => { T.lang(); const N = G.villageScene.state.news; for (const k of ['ren', 'do', 'xen', 'may']) N[k] = true; T.freeze(); }"),
    ('hanh-trang', False, "() => { T.lang(); G.hanhTrang.openVillage(); G.hanhTrang.tab = 'weapon'; T.freeze(); }"),
    ('hanh-trang-linh-khi', False, "() => { T.lang(); G.hanhTrang.openVillage(); G.hanhTrang.tab = 'lk'; T.freeze(); }"),
    ('ban-do', False, "() => { T.lang(); G.villageApi.open('xen'); G.banDo.setMulti(true, 'w'); for (const w of G.save.weapons) if (!w.lock && !G.save.carry.includes(w.id)) G.banDo.ids.add(w.id); T.freeze(); }"),
    ('bang-vang', False, "() => { T.lang(); const C = G.cloud, B = G.bangVang; C.online = () => true; C.myScore = undefined; C.user = { uid: 'u3' }; B.t = G.time; B.data = { power: { items: ['Tí', 'Sửu', 'Dần', 'Mão', 'Thìn'].map((n, i) => ({ uid: 'u' + i, name: n, power: 900 - i * 70, stars: 30 - i, far: 8 - i, hero: 'smith' })), cursor: null, more: false, loading: false, err: '' } }; G.villageApi.V.dtab = 'rank'; G.villageApi.open('do'); T.freeze(); }"),
    ('cay-chuong', False, "() => { T.lang(); G.villageApi.V.dtab = 'chuong'; G.villageApi.open('do'); T.freeze(); }"),
    ('ket-qua', False, "() => { const S = T.start(0, 1, 3); T.rng(77); G.testGoto('boss'); G.getRun().P.inv = 9999; G.sim(120); G.getRun().usedPotion = true; G.finishStage(true); G.getRun().modeT = -9; T.freeze(); }"),
    ('thuong-nhan', False, "() => { const S = T.start(0, 1, 3); G.testGoto('merchant'); const R = G.getRun(); R.shop = { el: 'fire', bought: {} }; G.save.gold = 500; R.mode = 'merchant'; T.freeze(); }"),
    ('ruong', False, "() => { const S = T.start(0, 1, 3); const R = G.getRun(); R.opts = [{ kind: 'ore', n: 3, label: '3 quặng', sub: 'Để mài vũ khí' }, { kind: 'charm', el: 'poison', label: 'Bùa Độc', sub: 'Phủ hệ lên cả hai vũ khí trong 60 giây' }, { kind: 'charm', el: 'ice', label: 'Bùa Băng', sub: 'Phủ hệ lên cả hai vũ khí trong 60 giây' }]; R.prop = {}; R.mode = 'chest'; T.freeze(); }"),
]


# Lỗi console kiểu "Failed to load resource" là lỗi mạng của máy thử (phông chữ, Firebase), không tính.
def mo_game(b, base, errs, nhan):
    pg = b.new_page(**DT)
    pg.on('pageerror', lambda e: errs.append('%s: %s' % (nhan, e)))
    pg.on('console', lambda m: errs.append('%s console: %s' % (nhan, m.text)) if m.type == 'error' and 'Failed to load resource' not in m.text and 'bad HTTP response' not in m.text else None)
    nap(pg, base)
    return pg


def nap(pg, base):
    pg.goto(base + '/game/index.html?cloud=0')
    pg.wait_for_function('window.G && G.scene')
    pg.wait_for_timeout(500)
    pg.add_script_tag(url=base + '/game/tests/bot.js')
    pg.add_script_tag(url=base + '/game/tests/setup.js')
    pg.evaluate(HELP)


def chup(pg):
    pg.wait_for_timeout(300)
    return Image.open(io.BytesIO(pg.screenshot())).convert('RGB')


def khac(a, b):
    if a.size != b.size: return -1, None
    d = ImageChops.difference(a, b).convert('L').point(lambda v: 255 if v else 0)
    return d.histogram()[255], d.getbbox()


def tu_url(u):
    return Image.open(io.BytesIO(base64.b64decode(u.split(',', 1)[1]))).convert('RGB')


def main():
    kq = {'loi': []}
    moi = serve(REPO)
    cu = serve(OLD) if OLD else None
    mau = os.path.join(TMP, 'luoi-mau-bieu-tuong.png')
    anh_mau(mau)
    anh = {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        # ----- 1) trang công cụ -----
        errs = []
        pg = b.new_page(viewport={'width': 900, 'height': 1400}, device_scale_factor=1)
        pg.on('pageerror', lambda e: errs.append('cong-cu: %s' % e))
        pg.on('console', lambda m: errs.append('cong-cu console: %s' % m.text) if m.type == 'error' and 'Failed to load resource' not in m.text and 'bad HTTP response' not in m.text else None)
        pg.goto(moi + '/tools/tach-giao-dien/index.html')
        pg.select_option('#chonLo', str(pg.evaluate("LO.findIndex((l) => l.id === 'nho')")))
        prompt = pg.input_value('#oPrompt')
        kq['prompt'] = {'dai': len(prompt), 'co_bang_mau': 'BẢNG MÀU' in prompt, 'co_vien': '#14182e' in prompt, 'co_nen': '#FF00FF' in prompt, 'so_o': prompt.count('ô ') and len([1 for i in range(1, 31) if ('ô %d:' % i) in prompt])}
        open(os.path.join(TMP, 'prompt.txt'), 'w', encoding='utf-8').write(prompt)
        pg.set_input_files('#chonAnh', mau)
        pg.wait_for_function("document.getElementById('theKq') && /ĐẠT|CÓ LỖI/.test(document.getElementById('theKq').textContent)", timeout=30000)
        kq['cong_cu'] = pg.inner_text('#theKq')
        kq['cong_cu_kiem'] = pg.eval_on_selector_all('#dsKiem li', 'els => els.map(e => (e.className ? "[" + e.className + "] " : "") + e.textContent)')
        teps = pg.evaluate('L.ds.map((m, i) => (KQ[i] ? jsonMon(i) : null))')
        ds = [json.loads(t) for t in teps if t]
        kq['so_tep'] = len(ds)
        kq['net'] = sorted(set(t.get('net') for t in ds))
        kq['co_dung'] = all(tu_url(t['anh']).size == (t['rong'] * 2, t['cao'] * 2) for t in ds)
        kq['ma'] = [t['ma'] for t in ds]
        pg.wait_for_function("!document.getElementById('xemNho').hidden", timeout=10000)
        anh['xem'] = tu_url(pg.evaluate("document.getElementById('cvBieuTuong').toDataURL('image/png')"))
        pg.screenshot(path=os.path.join(TMP, 'cong-cu.png'), full_page=True)
        # đổi sang lô khác rồi quay lại: không lỗi
        pg.select_option('#chonLo', '0'); pg.wait_for_timeout(200); pg.select_option('#chonLo', str(pg.evaluate("LO.findIndex((l) => l.id === 'nho')"))); pg.wait_for_timeout(200)
        pg.close()
        kq['loi'] += errs

        # ----- 2) game, 844×390 -----
        errs = []
        pm = mo_game(b, moi, errs, 'moi')
        pc = mo_game(b, cu, errs, 'cu') if cu else None
        for ten, co_y, code in SCENES:
            pm.evaluate(code)
            k0 = chup(pm)
            kq['%s: hai lần chụp cùng trang' % ten] = khac(k0, chup(pm))[0]
            if pc:
                pc.evaluate(code)
                kc = chup(pc)
                n, box = khac(kc, k0)
                kq['%s: CŨ so MỚI không tệp%s' % (ten, ' (thay đổi CỐ Ý)' if co_y else '')] = {'diem_khac': n, 'vung': box}
                anh[ten + '-cu'] = kc
            pm.evaluate('(ds) => { for (const t of ds) G.spriteCustom.add(JSON.parse(t)); }', [t for t in teps if t])
            pm.wait_for_function('(ms) => ms.every((m) => G.spriteCustom.gdSan(m))', arg=kq['ma'])
            k1 = chup(pm)
            n, box = khac(k0, k1)
            kq['%s: có tệp so không tệp' % ten] = {'diem_khac': n, 'vung': box}
            anh[ten + '-khong'] = k0
            anh[ten + '-co'] = k1
            pm.evaluate('(ms) => { for (const m of ms) G.spriteCustom.remove(m); }', kq['ma'])
            kq['%s: gỡ tệp so lúc đầu' % ten] = khac(k0, chup(pm))[0]
            if ten == 'tinh-anh':
                kq['tinh-anh: tâm quái (điểm màn hình)'] = pm.evaluate("() => { const S = G.getRun(), e = S.W.ents.find(o => o.role === 'elite'), cv = document.querySelector('canvas'), r = cv.getBoundingClientRect(); return { x: r.left + (e.x - (S.W.cam || 0)) / G.W * r.width, y: r.top + (e.y - e.h) / G.H * r.height, k: r.width / G.W, trait: e.trait }; }")
            nap(pm, moi)
            if pc: nap(pc, cu)
        pm.close()
        if pc: pc.close()
        # bản gói: mở không lỗi, có phần mới
        pg = b.new_page(viewport={'width': 844, 'height': 390})
        pg.on('pageerror', lambda e: errs.append('dist: %s' % e))
        pg.goto(moi + '/game/dist/linh-khi.html?cloud=0'); pg.wait_for_function('window.G && G.scene'); pg.wait_for_timeout(1200)
        kq['dist: cạnh ô nền biểu tượng tinh anh'] = pg.evaluate('G.mobIconCo')
        kq['dist: có LK.gdMo'] = pg.evaluate('!!(G.lk && G.lk.gdMo)')
        pg.close(); kq['loi'] += errs
        b.close()

    for k, v in anh.items(): v.save(os.path.join(TMP, k + '.png'))
    ghep(anh, kq)
    print(json.dumps(kq, ensure_ascii=False, indent=1))
    print('ảnh tạm:', TMP)


# ----- 3) ảnh kiểm -----
def cum_khac(a, c, toi_da=9):
    """Các cụm điểm ảnh khác nhau giữa hai ảnh → danh sách khung (x0, y0, x1, y1), cụm to trước."""
    from PIL import ImageFilter
    K = 8
    d = ImageChops.difference(a, c).convert('L').point(lambda v: 255 if v else 0)
    nho = d.resize((a.width // K, a.height // K), Image.BOX).point(lambda v: 255 if v else 0).filter(ImageFilter.MaxFilter(5))
    w, h = nho.size; px = nho.load(); seen = set(); out = []
    for y in range(h):
        for x in range(w):
            if not px[x, y] or (x, y) in seen: continue
            st = [(x, y)]; seen.add((x, y)); x0 = x1 = x; y0 = y1 = y
            while st:
                u, v = st.pop(); x0 = min(x0, u); x1 = max(x1, u); y0 = min(y0, v); y1 = max(y1, v)
                for q in ((u + 1, v), (u - 1, v), (u, v + 1), (u, v - 1)):
                    if 0 <= q[0] < w and 0 <= q[1] < h and px[q] and q not in seen: seen.add(q); st.append(q)
            out.append((x0 * K, y0 * K, (x1 + 1) * K, (y1 + 1) * K))
    out.sort(key=lambda r: -(r[2] - r[0]) * (r[3] - r[1]))
    return out[:toi_da]


def ghep(anh, kq):
    W, w = 1200, 596
    hang = []

    def doi(a, c, loc=Image.LANCZOS):
        k = w / a.width
        r = Image.new('RGB', (W, round(a.height * k)), '#101010')
        r.paste(a.resize((w, r.height), loc), (0, 0)); r.paste(c.resize((w, r.height), loc), (W - w, 0))
        hang.append(r)

    def canh(ten):
        """Một hàng cho một cảnh: trái = cả màn CÓ tệp mẫu (khung vàng quanh chỗ đổi); phải = từng chỗ đổi phóng to, mỗi cặp: hình code | ảnh mẫu."""
        a, c = anh[ten + '-khong'], anh[ten + '-co']
        ds = cum_khac(a, c)
        k = w / c.width
        tr = c.resize((w, round(c.height * k)), Image.LANCZOS)
        d = ImageDraw.Draw(tr)
        for (x0, y0, x1, y1) in ds: d.rectangle([x0 * k - 3, y0 * k - 3, x1 * k + 3, y1 * k + 3], outline='#ffd23f', width=2)
        o = [];
        for (x0, y0, x1, y1) in ds:
            pad = 14; bx = (max(0, x0 - pad), max(0, y0 - pad), min(a.width, x1 + pad), min(a.height, y1 + pad))
            bw, bh = bx[2] - bx[0], bx[3] - bx[1]
            f = min(2, 142 / bw, 120 / bh)
            f = 2 if f >= 2 else 1 if f >= 1 else f
            ca = a.crop(bx).resize((max(1, round(bw * f)), max(1, round(bh * f))), Image.NEAREST if f >= 1 else Image.LANCZOS)
            cc = c.crop(bx).resize(ca.size, Image.NEAREST if f >= 1 else Image.LANCZOS)
            t = Image.new('RGB', (ca.width * 2 + 4, ca.height), '#ffd23f'); t.paste(ca, (0, 0)); t.paste(cc, (ca.width + 4, 0)); o.append(t)
        # xếp các cặp vào cột phải, tràn thì xuống dòng
        x = y = 0; cao = 0; vt = []
        for t in o:
            if x and x + t.width > w: x = 0; y += cao + 8; cao = 0
            vt.append((t, x, y)); x += t.width + 10; cao = max(cao, t.height)
        ph = y + cao
        r = Image.new('RGB', (W, max(tr.height, ph)), '#101010'); r.paste(tr, (0, 0))
        for t, x, y in vt: r.paste(t, (W - w + x, y))
        hang.append(r)

    # tinh anh "Nổ khi chết": TRƯỚC (bản cũ, ô 9×9) và SAU (bản mới, ô 13×13), cả màn và phóng to quanh đầu quái
    if 'tinh-anh-cu' in anh:
        t = kq.get('tinh-anh: tâm quái (điểm màn hình)') or {}
        a, c = anh['tinh-anh-cu'], anh['tinh-anh-khong']
        doi(a, c)
        cx, cy = round(t.get('x', 422) * 2), round(t.get('y', 150) * 2)
        o = (max(0, cx - 150), max(0, cy - 110), min(a.width, cx + 150), min(a.height, cy + 90))
        doi(a.crop(o), c.crop(o), Image.NEAREST)
        ts = Image.new('RGB', (W, hang[0].height + hang[1].height + 8), '#101010'); ts.paste(hang[0], (0, 0)); ts.paste(hang[1], (0, hang[0].height + 8))
        ts.quantize(colors=256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).save(os.path.join(HERE, 'tinh-anh-truoc-sau.png'), optimize=True)
        doi(anh['tinh-anh-2-cu'].crop(o), anh['tinh-anh-2-khong'].crop(o), Image.NEAREST)
    # các cảnh có tệp mẫu
    for ten, _, _ in SCENES: canh(ten)
    x = anh['xem']; k = W / x.width
    hang.append(x.resize((W, round(x.height * k)), Image.NEAREST))
    H = sum(h.height for h in hang) + 8 * (len(hang) - 1)
    out = Image.new('RGB', (W, H), '#101010'); y = 0
    for h in hang: out.paste(h, (0, y)); y += h.height + 8
    out.quantize(colors=256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).save(os.path.join(HERE, 'anh-kiem.png'), optimize=True)


main()
