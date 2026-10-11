"""Kiểm Đợt 8 (độ đọc trận đấu). Một lượt Playwright cho mỗi lệnh, không chạy bộ test dài.
Chạy từ thư mục gốc repo:
  python3 docs/review/ke-hoach-cai-thien/dot-8/kiem.py anh <tiền tố> [THƯ_MỤC_GAME] [co=0] [khung=N]   chụp 4 tình huống ở 844×390 và 1280×720 vào anh/<tiền tố>-…
  python3 docs/review/ke-hoach-cai-thien/dot-8/kiem.py do [THƯ_MỤC_GAME] [co=0]               10 giây bot đánh phòng 6 quái: đếm số sát thương, số đè nhau, dòng thông báo
  python3 docs/review/ke-hoach-cai-thien/dot-8/kiem.py bot [THƯ_MỤC_GAME]                      bot chơi ải 1, ghi nhật ký sát thương (để so với bản trước)
  python3 docs/review/ke-hoach-cai-thien/dot-8/kiem.py so <THƯ_MỤC_GAME_TRƯỚC>                 cờ G.DO_DOC_TRAN = false ở bản mới so với bản trước: đếm điểm ảnh khác
  python3 docs/review/ke-hoach-cai-thien/dot-8/kiem.py nut | thu-tu                          bảng nút hai chế độ cờ + đếm điểm ảnh đỏ cảnh báo | thứ tự vẽ các lớp trong một khung hình
  python3 docs/review/ke-hoach-cai-thien/dot-8/kiem.py tat-ca <THƯ_MỤC_GAME_TRƯỚC>               chạy hết các phép kiểm (sau khi đã chụp ảnh truoc-/sau-) và ghi ket-qua.json
THƯ_MỤC_GAME: thư mục game/ cần kiểm (mặc định là bản đang có; bản trước khi sửa thì dùng một git worktree).
Chỉ dùng bản lưu thử tự tạo trong trình duyệt tạm (không đụng dữ liệu thật)."""
import hashlib, io, json, os, subprocess, sys, time
from PIL import Image, ImageChops
from playwright.sync_api import sync_playwright

DAY = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.normpath(os.path.join(DAY, '..', '..', '..', '..', 'game'))
ANH = os.path.join(DAY, 'anh')
sys.path.insert(0, os.path.join(GAME, 'tests'))
from quai_lib import LIB

CO = [a for a in sys.argv if a.startswith('co=')]
CO = None if not CO else CO[0] != 'co=0'
KHUNG = [int(a[6:]) for a in sys.argv if a.startswith('khung=')]  # khung=331: chụp cảnh "đông quái" ở đúng khung đó (để trước/sau cùng một khoảnh khắc)
ARGS = [a for a in sys.argv[2:] if not a.startswith('co=') and not a.startswith('khung=')]
CONG = [8851]; MAY = []
CO_MAN = {'dt844': dict(viewport={'width': 844, 'height': 390}), 'may1280': dict(viewport={'width': 1280, 'height': 720})}

THEM = r"""
(() => {
  // quái thật (tự đi, tự đánh), máu nhân k để trận kéo dài đủ lâu cho việc đo
  T.quai = (vai, x, y, k) => { const e = G.spawnEnemy(vai, x, y, {}); e.inside = true; e.maxhp = Math.round(e.maxhp * (k || 1)); e.hp = e.maxhp; return e; };
  T.sauQuai = (k) => { const g = G.getWorld().geo; return [['rusher', -70, -30], ['rusher', 60, -34], ['swarm', -40, 30], ['shield', 80, 20], ['spiky', 0, -44], ['archer', 110, -10]].map((d) => T.quai(d[0], g.cx + d[1], g.cy + d[2], k)); };
  T.giuMau = () => { const S = G.getRun(); if (S && S.P) { S.P.hp = Math.max(S.P.hp, S.P.maxhp * 0.6); S.P.dead = false; S.W.over = null; } };
  // hộp bao của các số đang hiện (đơn vị game). Bản mới ghi sẵn hộp đã vẽ ở n.hop; bản cũ thì tính lại đúng theo công thức vẽ của fx.js.
  T.hopSo = () => { const st = G.fx.state(); if (!st) return []; const c = G.ux, cam = Math.round((st.W.cam || 0)), out = [];
    for (const n of st.N) { if (n.d > 0) continue;
      if (n.hop) { out.push({ s: n.s, b: n.hop.slice(), loai: n.loai || '' }); continue; }
      const age = n.t0 - n.t, a = n.t < n.t0 * 0.35 ? n.t / (n.t0 * 0.35) : 1, eio = (x) => (x < 0.5 ? 2 * x * x : 1 - 2 * (1 - x) * (1 - x));
      let sc = age < 0.07 ? 0.55 + (0.45 + n.pop) * (1 - (1 - age / 0.07) * (1 - age / 0.07)) : age < 0.24 ? 1 + n.pop * (1 - eio((age - 0.07) / 0.17)) : 1; sc *= 0.88 + 0.12 * a;
      const size = Math.max(6.5, n.size * sc); c.font = '700 ' + (Math.round(size * 2) / 2) + 'px "Be Vietnam Pro", system-ui, sans-serif';
      const w = c.measureText(n.s).width, x = n.x - cam, y = n.y + size * 0.35;
      out.push({ s: n.s, b: [x - w / 2, y - size * 0.74, x + w / 2, y + size * 0.1], loai: '' }); }
    return out; };
  T.de = (a, b) => Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
  T.ve = () => { G.ui.begin(); G.scene.draw(); };
  // Đầu mỗi cảnh: đồng hồ game về 0 và đồng hồ máy đi theo đồng hồ game (thanh máu tụt dần, nút nảy dùng đồng hồ máy) → hai lần chạy ra đúng một khung hình.
  T.dau = () => { G.time = 0; try { performance.now = () => G.time * 1000; } catch (e) { /* bỏ qua */ } };
})();
"""

# Bốn tình huống của brief. Mỗi cái chạy trên một trang mới (hạt giống cố định) nên hai bản game ra cùng một khung hình.
CANH = {
    # 1. phòng đông 6 quái đang đánh: dừng ở khung có nhiều số sát thương nhất trong 6 giây đầu
    'dong': r"""() => { T.dau(); _gieo(11); const { S, W, P } = T.room(0, 2, { seed: 7, save: { branch: 'fire', marks: 30 } }); T.sauQuai(30); T.useBot(true);
        let best = -1, at = 0; const dem = []; for (let f = 0; f < 360; f++) { T.frame(1); T.giuMau(); const n = T.hopSo().length; dem.push(n); if (f > 60 && n > best) { best = n; at = f; } }
        return { at, best }; }""",
    'dong2': r"""(at) => { T.dau(); _gieo(11); const { S, W, P } = T.room(0, 2, { seed: 7, save: { branch: 'fire', marks: 30 } }); T.sauQuai(30); T.useBot(true);
        for (let f = 0; f <= at; f++) { T.frame(1); T.giuMau(); } T.ve(); return T.hopSo().length; }""",
    # 2. tinh anh ải hướng dẫn + hai thông báo nối nhau (tinh anh rơi đồ, rơi trang phục) + chữ chỉ dẫn + "Chạm để đổi vũ khí"
    'tinh-anh': r"""() => { T.dau(); _gieo(12); G.pointers.clear(); G.testSave({ lvl: 3 }); G.save.tut.done = false; G.rnd = G.srand(5); G.startStage(0, 0, 0, { kind: 'A', seed: 3 }); const S = G.getRun(); S.fade = 0;
        G.testGoto('elite'); const W = G.getWorld(), P = S.P; T.useBot(true);
        for (let f = 0; f < 2400 && !W.ents.some((e) => e.role === 'elite'); f++) { T.frame(1); T.giuMau(); }
        for (const e of W.ents) { e.maxhp *= 20; e.hp = e.maxhp; }
        for (let f = 0; f < 150; f++) { T.frame(1); T.giuMau(); if (f === 60) W.banner = { s: G.t('Tinh anh rơi {0}', 'Cung Tre (Lam)'), col: '#6ab0ff', t: 3 }; if (f === 110) W.banner = { s: G.t('Rơi trang phục: {0}', 'Nón Lá (Thường)'), col: '#d6d0c2', t: 3 }; }
        T.ve(); return 1; }""",
    # 3. trùm vùng: thanh máu + thông báo + vùng báo đòn đang hiện
    'trum': r"""() => { T.dau(); _gieo(13); const { S, W, P, b } = T.boss(0, true, { seed: 5 }); T.useBot(true); b.maxhp *= 30; b.hp = b.maxhp;
        let f = 0, ok = 0; for (; f < 1500 && !ok; f++) { T.frame(1); T.giuMau(); ok = f > 200 && W.zones.some((z) => z.team !== 'player' && z.t > 0.25 && z.t0 && z.t < z.t0 - 0.2); }
        W.banner = { s: G.t('{0} nổi giận!', b.name), col: '#ff6a5a', t: 2 }; for (let k = 0; k < 9; k++) { T.frame(1); T.giuMau(); }
        T.ve(); return f; }""",
    # 4. ải 1 phòng đầu (chữ chỉ dẫn)
    'huong-dan': r"""() => { T.dau(); _gieo(14); G.pointers.clear(); G.testSave({ lvl: 1 }); G.save.tut.done = false; G.rnd = G.srand(5); G.startStage(0, 0, 0, { kind: 'A', seed: 3 }); const S = G.getRun(); S.fade = 0;
        T.useBot(false); for (let f = 0; f < 60; f++) T.frame(1); T.ve(); return 1; }""",
}


def mo(pw, root, man='dt844', co=None):
    b = pw.chromium.launch()
    pg = b.new_page(**CO_MAN[man])
    errs = []
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
    cong = CONG[0]; CONG[0] += 1  # trang cần máy chủ nhỏ trong game/dist thì mới nạp được ảnh AI (CHUNG.md luật 7)
    may = subprocess.Popen([sys.executable, '-m', 'http.server', str(cong), '--bind', '127.0.0.1'], cwd=os.path.join(root, 'dist'), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    MAY.append(may); time.sleep(0.8)
    # Hạt hiệu ứng dùng Math.random: gắn hạt giống cố định để hai lần chạy ra ảnh giống hệt (mới so "0 điểm ảnh khác" được)
    pg.add_init_script("(() => { let a = 20261011; Math.random = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; window._gieo = (v) => { a = v; }; })();")
    pg.goto('http://127.0.0.1:%d/linh-khi.html?cloud=0' % cong)
    pg.wait_for_function('window.G && G.scene')
    pg.wait_for_timeout(600)
    pg.evaluate("window._raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = () => 0")
    pg.add_script_tag(path=os.path.join(root, 'tests', 'bot.js'))
    pg.add_script_tag(path=os.path.join(root, 'tests', 'setup.js'))
    pg.evaluate(LIB)
    pg.evaluate(THEM)
    pg.wait_for_function("G.spriteCustom && ['heoCon','nhimDoc','heoNanh','namChua'].every((m) => G.spriteCustom.get(m))")
    pg.wait_for_timeout(400)
    if co is not None: pg.evaluate('(v) => { G.DO_DOC_TRAN = v; }', co)
    return b, pg, errs


def chup(pw, root, man, ten, co=None):
    b, pg, errs = mo(pw, root, man, co)
    if ten == 'dong':
        r = pg.evaluate(CANH['dong']); b.close()
        if KHUNG: r['at'] = KHUNG[0]
        b, pg, errs = mo(pw, root, man, co)
        r = dict(r, luc_chup=pg.evaluate(CANH['dong2'], r['at']))
    else: r = pg.evaluate(CANH[ten])
    im = Image.open(io.BytesIO(pg.screenshot())).convert('RGB')
    tt = pg.evaluate("() => ({ co: G.DO_DOC_TRAN, loi: G.fx.errs })")
    b.close()
    return im, r, errs, tt


def anh():
    pre = ARGS[0]; root = ARGS[1] if len(ARGS) > 1 else GAME
    os.makedirs(ANH, exist_ok=True)
    with sync_playwright() as pw:
        for man in CO_MAN:
            for ten in ['dong', 'tinh-anh', 'trum', 'huong-dan']:
                im, r, errs, tt = chup(pw, root, man, ten, CO)
                p = os.path.join(ANH, '%s-%s-%s.png' % (pre, man, ten)); im.save(p, optimize=True)
                print(man, ten, json.dumps(r), tt, 'lỗi JS:', errs)


DO = r"""() => { T.dau(); _gieo(21); const { S, W, P } = T.room(0, 2, { seed: 7, save: { branch: 'fire', marks: 30 } }); T.sauQuai(40); T.useBot(true);
  const g = W.geo, kq = { khung: 600, soToiDa: 0, khungQua6: 0, capDe: 0, khungCoDe: 0, tongSo: 0, dongToiDa: 0, thongBaoVaoGiuaSan: 0, viDu: [], sanGiua: [g.fx0 + 20, W.y0 + 24, g.fx1 - 20, W.y1 - 20] };
  for (let f = 0; f < 600; f++) {
    T.frame(1); T.giuMau();
    if (f === 120) W.banner = { s: G.t('Tinh anh rơi {0}', 'Cung Tre (Lam)'), col: '#6ab0ff', t: 3 };
    if (f === 150) W.banner = { s: G.t('Rơi trang phục: {0}', 'Nón Lá (Thường)'), col: '#d6d0c2', t: 3 };
    if (f === 180) W.banner = { s: G.t('{0} đạt mốc {1}! Mở đặc trưng: {2}', 'Kiếm Sắt', 'Thức tỉnh', 'Vệt lửa'), col: '#ff7a2a', t: 4.5 };
    const H = T.hopSo().filter((h) => h.loai !== 'chu'); kq.tongSo += H.length; kq.soToiDa = Math.max(kq.soToiDa, H.length); if (H.length > 6) kq.khungQua6++;
    const A = T.hopSo(); let de = 0;
    for (let i = 0; i < A.length; i++) for (let j = i + 1; j < A.length; j++) if (T.de(A[i].b, A[j].b) > 0.5) { de++; if (kq.viDu.length < 4) kq.viDu.push([f, A[i].s, A[i].b.map(Math.round), A[j].s, A[j].b.map(Math.round)]); }
    kq.capDe += de; if (de) kq.khungCoDe++;
    const M = G.docTran && G.docTran.khung ? G.docTran.khung() : null; // bản mới: vùng thông báo vừa vẽ { dong, hop }
    if (M) { kq.dongToiDa = Math.max(kq.dongToiDa, M.dong); if (M.hop && T.de(M.hop, kq.sanGiua) > 0) kq.thongBaoVaoGiuaSan++; }
  }
  kq.loiFx = G.fx.errs; kq.co = G.DO_DOC_TRAN; return kq; }"""


def do():
    root = ARGS[0] if ARGS else GAME
    with sync_playwright() as pw:
        b, pg, errs = mo(pw, root, 'dt844', CO)
        kq = pg.evaluate(DO); b.close()
    print(json.dumps(kq, ensure_ascii=False, indent=1)); print('lỗi JS:', errs)
    return kq


BOT = r"""() => { T.dau(); _gieo(31); G.pointers.clear(); G.testSave({ lvl: 1 }); G.save.potions = 2; const r = G.srand(3 * 13 + 5); Math.random = r; G.rnd = r; T.useBot(true);
  const nk = [], d0 = G.damage, h0 = G.hurtPlayer; let buoc = 0;
  G.damage = function (t, amt, o) { const hp = t.hp, v = d0.apply(this, arguments); nk.push(buoc + ':' + (t.isBoss ? 'trum' : t.role) + ':' + (Math.round((hp - t.hp) * 100) / 100)); return v; };
  G.hurtPlayer = function (amt) { const P = G.getWorld().P, hp = P.hp, v = h0.apply(this, arguments); if (v) nk.push(buoc + ':be:' + (Math.round((hp - P.hp) * 100) / 100)); return v; };
  G.startStage(0, 0, 0, { kind: 'A', seed: 3 }); const S0 = G.getRun(); S0.fade = 0;
  const out = { thang: null, giay: 0 };
  for (; buoc < 600 * 60; buoc++) { const S = G.getRun(); if (!S) break; if (S.mode === 'result' || S.mode === 'dead') { out.thang = S.mode === 'result'; break; }
    if (S.mode !== 'play') { G.botRun(1); continue; }
    T.frame(1); } // mỗi bước đều vẽ thật như khi chơi, để lớp vẽ (số sát thương, thông báo, đứng hình khi trúng đòn) cũng chạy
  const S = G.getRun(); out.giay = +(buoc / 60).toFixed(1); out.mau = S ? Math.round(S.P.hp) + '/' + S.P.maxhp : null; out.soDong = nk.length; out.nhatKy = nk.join('\n'); out.loiFx = G.fx.errs; out.co = G.DO_DOC_TRAN; return out; }"""


def bot():
    root = ARGS[0] if ARGS else GAME
    with sync_playwright() as pw:
        b, pg, errs = mo(pw, root, 'dt844', CO)
        kq = pg.evaluate(BOT); b.close()
    nk = kq.pop('nhatKy'); kq['bamNhatKy'] = hashlib.sha256(nk.encode()).hexdigest()[:16]
    print(json.dumps(kq, ensure_ascii=False)); print('lỗi JS:', errs)
    return kq, nk


def so():
    truoc = ARGS[0]; kq = {}
    with sync_playwright() as pw:
        for man in CO_MAN:
            for ten in ['dong', 'tinh-anh', 'trum', 'huong-dan']:
                a, ra, ea, _ = chup(pw, truoc, man, ten, None)
                c, rc, ec, tt = chup(pw, GAME, man, ten, False)
                d = ImageChops.difference(a, c).convert('L').point(lambda v: 255 if v else 0)
                n = sum(1 for v in d.getdata() if v)
                kq['%s-%s' % (man, ten)] = n
                print(man, ten, 'điểm ảnh khác:', n, tt, ea, ec)
    print(json.dumps(kq, ensure_ascii=False))
    return kq


NUT = r"""(co) => { T.dau(); G.DO_DOC_TRAN = co; G.btnArt.clear(); G.ui.begin(); const c = G.ux; G.ui.rect(-80, -80, 700, 500, '#1c2a22');
  const ds = [], w = (el) => ({ type: 'sword', branch: el === 'none' ? null : el, stage: 2, rarity: 1 });
  let i = 0; const cho = (ten, ve) => { const x = 34 + (i % 8) * 56, y = 46 + Math.floor(i / 8) * 76; ve(x, y); G.ui.text(ten, x, y + 34, { size: 6.5, align: 'center', color: '#f1e6c6' }); ds.push({ ten, x, y }); i++; };
  for (const el of ['none', 'fire', 'poison', 'ice']) cho('Đánh ' + el, (x, y) => G.btnArt.draw(c, 'atk', x, y, 24, { weapon: w(el), t: 0.1, id: 'k' + i }));
  for (const el of ['none', 'fire', 'poison', 'ice']) cho('Chiêu ' + el, (x, y) => G.btnArt.draw(c, 'special', x, y, 18, { weapon: w(el), cost: 25, t: 0.1, id: 'k' + i }));
  cho('Chiêu thiếu mana', (x, y) => G.btnArt.draw(c, 'special', x, y, 18, { weapon: w('fire'), cost: 25, disabled: true, t: 0.1, id: 'k' + i }));
  for (const el of ['fire', 'poison', 'ice']) cho('Chưởng ' + el, (x, y) => G.btnArt.draw(c, 'chuong', x, y, 18, { el, cost: 30, t: 0.1, id: 'k' + i }));
  cho('Chưởng thiếu mana', (x, y) => G.btnArt.draw(c, 'chuong', x, y, 18, { el: 'fire', cost: 30, disabled: true, t: 0.1, id: 'k' + i }));
  cho('Né', (x, y) => G.btnArt.draw(c, 'dodge', x, y, 18, { dir: 0, t: 0.1, id: 'k' + i }));
  cho('Bình máu', (x, y) => G.btnArt.draw(c, 'potion', x, y, 12, { count: 2, t: 0.1, id: 'k' + i }));
  cho('Tạm dừng', (x, y) => G.btnArt.draw(c, 'pause', x, y, 11, { t: 0.1, id: 'k' + i }));
  // đếm điểm ảnh "đỏ cảnh báo" (cùng họ màu với vùng báo đòn 255,40,28): sắc độ ≤ 12° hoặc ≥ 350°, độ đậm ≥ 0,55, độ sáng ≥ 0,5
  const k = G.uiScale, ox = G.ox * G.dpr, oy = G.oy * G.dpr;
  for (const d of ds) { const x0 = Math.round((d.x - 27) * k + ox), y0 = Math.round((d.y - 30) * k + oy), ww = Math.round(54 * k), hh = Math.round(56 * k), D = c.getImageData(x0, y0, ww, hh).data; let n = 0, tong = 0;
    for (let q = 0; q < D.length; q += 4) { const r = D[q] / 255, g = D[q + 1] / 255, b = D[q + 2] / 255; if (D[q] === 28 && D[q + 1] === 42 && D[q + 2] === 34) continue; tong++;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b), dl = mx - mn; if (mx < 0.5 || dl / (mx || 1) < 0.55 || mx !== r) continue; let h = 60 * (((g - b) / dl) % 6); if (h < 0) h += 360; if (h <= 12 || h >= 350) n++; }
    d.do = n; d.phanTram = +(100 * n / Math.max(1, tong)).toFixed(1); }
  return ds.map((d) => [d.ten, d.do, d.phanTram]); }"""


def nut():
    """Bảng các nút ở hai chế độ cờ (tắt = cũ, bật = mới) và số điểm ảnh đỏ cảnh báo trên từng nút."""
    kq = {}; hinh = []
    with sync_playwright() as pw:
        for co in (False, True):
            b, pg, errs = mo(pw, GAME, 'may1280', None)
            kq['co_bat' if co else 'co_tat'] = pg.evaluate(NUT, co)
            hop = pg.evaluate("() => { const b = document.getElementById('world').getBoundingClientRect(); return [b.x, b.y, b.width / 480]; }")
            im = Image.open(io.BytesIO(pg.screenshot())).convert('RGB'); k = hop[2]
            hinh.append(im.crop((round(hop[0]), round(hop[1] + 8 * k), round(hop[0] + 460 * k), round(hop[1] + 170 * k))))
            b.close()
    out = Image.new('RGB', (hinh[0].width, hinh[0].height * 2 + 6), (0, 0, 0)); out.paste(hinh[0], (0, 0)); out.paste(hinh[1], (0, hinh[0].height + 6))
    os.makedirs(ANH, exist_ok=True); out.save(os.path.join(ANH, 'nut-truoc-sau.png'), optimize=True)
    for a, c in zip(kq['co_tat'], kq['co_bat']): print('%-20s đỏ cảnh báo: trước %5d điểm (%4.1f%%)  →  sau %5d điểm (%4.1f%%)' % (a[0], a[1], a[2], c[1], c[2]))
    print('lỗi JS:', errs)
    return kq


THU_TU = r"""() => { T.dau(); _gieo(13); const { S, W, P, b } = T.boss(0, true, { seed: 5 }); T.useBot(true); b.maxhp *= 30; b.hp = b.maxhp;
  let ok = 0; for (let f = 0; f < 1500 && !ok; f++) { T.frame(1); T.giuMau(); ok = f > 200 && W.zones.some((z) => z.team !== 'player' && z.t > 0.25) && G.fx.state().N.some((n) => n.hop); }
  W.banner = { s: G.t('{0} nổi giận!', b.name), col: '#ff6a5a', t: 2 };
  const log = [], boc = (o, k, ten) => { const f = o[k]; o[k] = function () { if (log[log.length - 1] !== ten) log.push(ten); return f.apply(this, arguments); }; return () => { o[k] = f; }; };
  const go = [boc(G.docTran, 'duoi', '3-4. chữ phụ + thông báo (drawHud duoi)'), boc(G.ux, 'strokeText', '5. số sát thương (drawNums)'), boc(G.docTran, 'tren', '6. thanh máu quái / trùm (drawHud tren)'), boc(G.baoTruoc, 'draw', '7. vùng báo đòn (G.baoTruoc.draw)'), boc(G.minimap, 'draw', '8. viền màn hình: bản đồ nhỏ, ô vũ khí, nút (drawHud vien)')];
  T.frame(1); for (const g of go) g();
  return log; }"""


def thu_tu():
    with sync_playwright() as pw:
        b, pg, errs = mo(pw, GAME, 'dt844', None)
        kq = pg.evaluate(THU_TU); b.close()
    for d in kq: print(d)
    print('lỗi JS:', errs)
    return kq


def do_do(im):
    """Số điểm ảnh đỏ cảnh báo trong vùng sàn của một ảnh chụp 844×390 (để chắc vùng báo đòn vẫn đỏ)."""
    import colorsys
    n = 0
    for r, g, b in im.crop((200, 100, 640, 370)).getdata():
        h, s_, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
        if v >= 0.5 and s_ >= 0.55 and (h * 360 <= 12 or h * 360 >= 350): n += 1
    return n


def tat_ca():
    """Chạy mọi phép kiểm của brief và ghi ket-qua.json. Tham số: THƯ_MỤC_GAME_TRƯỚC."""
    global CO, ARGS
    truoc = ARGS[0]; kq = {}
    ARGS = [truoc]; CO = None; kq['do_truoc'] = do()
    ARGS = []; kq['do_sau'] = do()
    ARGS = [truoc]; a, nka = bot()
    ARGS = []; c, nkc = bot()
    kq['bot_ai1'] = {'truoc': a, 'sau': c, 'nhat_ky_trung': nka == nkc}
    ARGS = [truoc]; kq['co_tat_so_voi_ban_truoc_diem_anh_khac'] = so()
    kq['nut_do_canh_bao'] = nut()
    kq['thu_tu_ve_mot_khung'] = thu_tu()
    kq['vung_bao_don_diem_do_trong_san'] = {t: do_do(Image.open(os.path.join(ANH, '%s-dt844-trum.png' % t)).convert('RGB')) for t in ('truoc', 'sau')}
    json.dump(kq, open(os.path.join(DAY, 'ket-qua.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    open(os.path.join(DAY, 'nhat-ky-sat-thuong-ai1.txt'), 'w', encoding='utf-8').write(nkc)
    print('đã ghi ket-qua.json')


if __name__ == '__main__':
    try: {'anh': anh, 'do': do, 'bot': bot, 'so': so, 'nut': nut, 'thu-tu': thu_tu, 'tat-ca': tat_ca}[sys.argv[1]]()
    finally:
        for m in MAY: m.terminate()
