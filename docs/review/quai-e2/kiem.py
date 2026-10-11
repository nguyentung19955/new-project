"""Kiểm phiên E2 (dáng pha 2, pha 3 của 3 trùm vùng). Một lượt Playwright, không chạy bộ test dài.
Chạy: python3 docs/review/quai-e2/kiem.py
Việc làm:
  1. Dựng 6 tấm MẪU (chép 4 hàng đứng / lấy đà / tấn công / trúng đòn của tấm pha 1 rồi đổi màu), đặt TẠM vào game/art/custom, gói game
     ra một thư mục tạm, rồi XOÁ ngay 6 tệp mẫu và gói lại. Không tệp mẫu nào ở lại trong repo.
  2. So bản trước khi sửa (git HEAD lúc bắt đầu phiên, truyền qua biến GOC) với bản mới KHÔNG có tệp pha: phải 0 điểm ảnh khác.
  3. Bản mới CÓ tệp mẫu: pha 2, pha 3 dùng tấm mẫu ở 4 hàng; hàng chạy và chết vẫn là tấm pha 1.
  4. Trang tools/tach-quai: prompt 36 quái cũ không đổi; 6 mục mới; nút tải ảnh tham chiếu; tách thử một tấm 8×4.
Ra: anh-kiem.png và ket-qua.json cạnh tệp này."""
import base64, io, json, os, shutil, subprocess, sys, time
from PIL import Image, ImageDraw, ImageFont, ImageChops
from playwright.sync_api import sync_playwright

DAY = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.normpath(os.path.join(DAY, '..', '..', '..'))
GAME = os.path.join(REPO, 'game')
CUSTOM = os.path.join(GAME, 'art', 'custom')
TAM = os.environ.get('TAM') or os.path.join('/tmp', 'quai-e2')
GOC = os.environ.get('GOC', 'HEAD')  # commit trước khi sửa
sys.path.insert(0, os.path.join(GAME, 'tests'))
from quai_lib import LIB

try: FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 13)
except Exception: FONT = ImageFont.load_default()
TRUM = ['mocTinh', 'nguTinh', 'hoTinh']
HANG_PHA = ['idle', 'tele', 'atk', 'hit']
KQ = {}


def doi_mau(im, pha):
    r, g, b, a = im.split()
    if pha == 2: r2, g2, b2 = r.point(lambda v: min(255, int(v * 1.25 + 45))), g.point(lambda v: int(v * 0.55)), b.point(lambda v: int(v * 0.55))  # ngả đỏ
    else: r2, g2, b2 = b, r, g  # xoay kênh màu
    return Image.merge('RGBA', (r2, g2, b2, a))


def tam_mau(ma, pha):
    """Tấm mẫu <ma>-p<pha>: 4 hàng của tấm pha 1, đổi màu."""
    t = json.load(open(os.path.join(CUSTOM, ma + '.sprite.json'), encoding='utf-8'))
    n = int(t.get('net') or 1); fw, fh = t['khung_rong'] * n, t['khung_cao'] * n
    goc = Image.open(io.BytesIO(base64.b64decode(t['tam'].split(',')[1]))).convert('RGBA')
    moi = Image.new('RGBA', (fw * 8, fh * 4), (0, 0, 0, 0)); dt = {}
    for i, k in enumerate(HANG_PHA):
        a = t['dong_tac'][k]
        moi.paste(goc.crop((0, a['hang'] * fh, fw * 8, a['hang'] * fh + fh)), (0, i * fh))
        dt[k] = dict(a, hang=i)
    moi = doi_mau(moi, pha); buf = io.BytesIO(); moi.save(buf, 'PNG')
    o = {k: t[k] for k in ('loai', 'doi_tuong', 'vung', 'khung_rong', 'khung_cao', 'goc', 'rong', 'cao') if k in t}
    if n > 1: o['net'] = n
    o.update(ma='%s-p%d' % (ma, pha), ten='MẪU KIỂM %s pha %d' % (ma, pha), tam='data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode(), dong_tac=dt)
    return o


def goi(den):
    r = subprocess.run([sys.executable, os.path.join(GAME, 'build.py')], cwd=REPO, capture_output=True, text=True)
    if r.returncode: sys.exit('build.py hỏng: ' + r.stdout[-400:] + r.stderr[-400:])
    os.makedirs(den, exist_ok=True); shutil.copy(os.path.join(GAME, 'dist', 'linh-khi.html'), os.path.join(den, 'linh-khi.html'))
    return r.stdout


def chuan_bi():
    shutil.rmtree(TAM, ignore_errors=True); os.makedirs(os.path.join(TAM, 'cu'))
    with open(os.path.join(TAM, 'cu', 'linh-khi.html'), 'wb') as f: f.write(subprocess.check_output(['git', 'show', GOC + ':game/dist/linh-khi.html'], cwd=REPO))
    with open(os.path.join(TAM, 'tach-quai-cu.html'), 'wb') as f: f.write(subprocess.check_output(['git', 'show', GOC + ':tools/tach-quai/index.html'], cwd=REPO))
    goi(os.path.join(TAM, 'moi'))
    tep = []
    try:
        for ma in TRUM:
            for pha in (2, 3):
                p = os.path.join(CUSTOM, '%s-p%d.sprite.json' % (ma, pha)); tep.append(p)
                json.dump(tam_mau(ma, pha), open(p, 'w', encoding='utf-8'))
        out = goi(os.path.join(TAM, 'mau'))
        KQ['build_nhan_ma_moi'] = all(('%s-p%d' % (m, p)) in out for m in TRUM for p in (2, 3))
        KQ['dung_luong_tam_mau_byte'] = {os.path.basename(p): os.path.getsize(p) for p in tep}
    finally:
        for p in tep:
            if os.path.exists(p): os.remove(p)
        goi(os.path.join(TAM, 'moi2'))
    KQ['xoa_het_tam_mau'] = not any(os.path.exists(p) for p in tep) and subprocess.check_output(['git', 'status', '--porcelain', 'game/art/custom'], cwd=REPO).decode().strip() == ''
    bo_gio = lambda d: b'\n'.join(l for l in open(os.path.join(TAM, d, 'linh-khi.html'), 'rb').read().split(b'\n') if b'.VERSION = ' not in l)  # dòng VERSION ghi giờ gói, bỏ ra khi so
    KQ['goi_lai_giong_ban_khong_tep'] = bo_gio('moi') == bo_gio('moi2')


THEM = r"""
(() => {
  const SC = G.spriteCustom, ve0 = SC.veKhung; T.nhat = [];
  SC.veKhung = function (c, sp, ten) { T.nhat.push(sp.ma + ':' + ten); return ve0.apply(this, arguments); };
  // vào phòng trùm vùng r, chờ hết màn ra mắt, cho trùm đứng yên
  T.trum = (r) => { _gieo(20261011 + r); G.time = 50; const b = T.boss(r, true).b; for (let i = 0; i < 400 && (b.intro > 0 || b.invuln > 0 || b.busy > 0); i++) { T.sim(1, true); } T.yen(b); return b.art; };
  T.yen = (b) => { const W = G.getWorld(); b.cd = 99; b.busy = 5; /* bận: trùm đứng thở tại chỗ, không đi, không ra chiêu */ b.seq.length = 0; b.wind = 0; b.lunge = null; b.tired = 0; b.hitT = 0; b.flash = 0; W.zones = []; W.projs = []; };
  // vẽ riêng con trùm bằng đúng đường vẽ của game (G.art.boss). o: { pha: 1..3, n: cử động, u: 0..1, wind, time }
  T.ve = (o) => { const b = G.getWorld().boss, w = 300, h = 210, cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
    c.fillStyle = '#2a3340'; c.fillRect(0, 0, w, h);
    const giu = { x: b.x, y: b.y, phase: b.phase, an: b.an, dying: b.dying, hitT: b.hitT, wind: b.wind, face: b.face, dirA: b.dirA, t: G.time };
    const D = G.monsterArt.dur(b.art, o.n) || 1;
    b.x = w / 2; b.y = h - 14; b.phase = o.pha - 1; b.face = 1; b.dirA = 0; b.flash = 0; b.tired = 0; b.st.stun = 0; b.st.frozen = 0; b.wind = o.wind || 0; G.time = o.time || 0;
    b.dying = null; b.hitT = 0; b.an = { n: o.n, t: o.u * D, spd: 1 };
    if (o.n === 'die') { b.dying = o.u; b.an = { n: 'idle', t: 0, spd: 1 }; }
    if (o.n === 'hit') { b.hitT = 0.4 - o.u * 0.4; b.an = { n: 'idle', t: 0, spd: 1 }; }
    T.nhat.length = 0; G.art.boss(c, b);
    Object.assign(b, { x: giu.x, y: giu.y, phase: giu.phase, an: giu.an, dying: giu.dying, hitT: giu.hitT, wind: giu.wind, face: giu.face, dirA: giu.dirA }); G.time = giu.t;
    return { url: cv.toDataURL('image/png'), nhat: T.nhat.slice() }; };
  // ép pha theo ĐÚNG luật game: hạ máu xuống dưới mốc, để game tự phát cảnh chuyển pha rồi về đứng thở
  T.epPha = (pha) => { const b = G.getWorld().boss, S = G.getRun(); b.hp = b.maxhp * (pha === 2 ? 0.6 : 0.3); const giua = [];
    for (let i = 0; i < 260; i++) { T.frame(1); S.P.hp = S.P.maxhp; if (b.an && /^phase/.test(b.an.n)) giua.push(b.an.t); else if (giua.length) break; }
    T.yen(b); b.an = { n: 'idle', t: 0, spd: 1 }; for (let i = 0; i < 30; i++) { T.yen(b); T.frame(1); S.P.hp = S.P.maxhp; }
    return { phase: b.phase, soKhungChuyenPha: giua.length }; };
})();
"""
CONG = [8851]; MAY = []


def may_chu(thu_muc):
    cong = CONG[0]; CONG[0] += 1
    MAY.append(subprocess.Popen([sys.executable, '-m', 'http.server', str(cong), '--bind', '127.0.0.1'], cwd=thu_muc, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)); time.sleep(1.0)
    return cong


def mo(pw, thu_muc, cho=()):
    b = pw.chromium.launch(); pg = b.new_page(viewport={'width': 844, 'height': 390}); errs = []
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
    cong = may_chu(thu_muc)
    pg.add_init_script("(() => { let a = 20261011; Math.random = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; let dh = 1e6; performance.now = () => (dh += 16.6667); Date.now = () => Math.floor(1.76e12 + dh); window._gieo = (v) => { a = v; }; })();")  # hạt giống và đồng hồ cố định: hai lần chạy ra ảnh giống hệt, mới so '0 điểm ảnh khác' được
    pg.goto('http://127.0.0.1:%d/linh-khi.html?cloud=0' % cong)
    pg.wait_for_function('window.G && G.scene'); pg.wait_for_timeout(600)
    pg.evaluate("window.requestAnimationFrame = () => 0")
    pg.add_script_tag(path=os.path.join(GAME, 'tests', 'bot.js')); pg.add_script_tag(path=os.path.join(GAME, 'tests', 'setup.js'))
    pg.evaluate(LIB); pg.evaluate(THEM)
    pg.wait_for_function("(ds) => ds.every((m) => G.spriteCustom.get(m)) && Object.values(G.spriteCustom.ds).every((s) => s.ready)", arg=TRUM + list(cho)); pg.wait_for_timeout(1200)  # chờ nạp xong mọi ảnh AI
    return b, pg, errs


def anh(u): return Image.open(io.BytesIO(base64.b64decode(u.split(',')[1]))).convert('RGB')
def khac(a, b): return sum(1 for p in ImageChops.difference(a, b).getdata() if p != (0, 0, 0))


COT = [('idle', 0.3, 'đứng'), ('tele', 0.6, 'lấy đà'), ('atk', 0.4, 'tấn công'), ('hit', 0.6, 'trúng đòn'), ('move', 0.3, 'chạy (mượn pha 1)'), ('die', 0.2, 'chết (mượn pha 1)')]


def chay_game(pw):
    ds = {}
    for ten, thu_muc, cho in (('cu', 'cu', ()), ('moi', 'moi', ()), ('mau', 'mau', ['%s-p%d' % (m, p) for m in TRUM for p in (2, 3)])):
        b, pg, errs = mo(pw, os.path.join(TAM, thu_muc), cho)
        o = {'ve': {}, 'phong': {}}
        for r in range(3):
            art = pg.evaluate('(r) => T.trum(r)', r)
            for pha in (1, 2, 3):
                for n, u, _ in COT:
                    k = pg.evaluate('(o) => T.ve(o)', {'pha': pha, 'n': n, 'u': u})
                    o['ve'][(art, pha, n)] = (anh(k['url']), k['nhat'])
            if ten == 'mau' or ten == 'moi':  # chớp trắng báo sắp ra đòn: 0,1 giây trước khi đòn ra, hai nhịp sáng / tắt
                o['ve'][(art, 'bao', 1)] = anh(pg.evaluate('(o) => T.ve(o)', {'pha': 1, 'n': 'c1', 'u': 0.3, 'wind': 0.1, 'time': 0.06})['url'])
                o['ve'][(art, 'bao', 0)] = anh(pg.evaluate('(o) => T.ve(o)', {'pha': 1, 'n': 'c1', 'u': 0.3, 'wind': 0.1, 'time': 0.01})['url'])
                o['ve'][(art, 'bao', 2)] = anh(pg.evaluate('(o) => T.ve(o)', {'pha': 1, 'n': 'c1', 'u': 0.3, 'wind': 0, 'time': 0.06})['url'])  # không lấy đà: không chớp
            # phòng thật: ép pha 2 theo luật game rồi chụp cả màn hình
            pg.evaluate('(r) => T.trum(r)', r)
            ep = pg.evaluate('T.epPha(2)')
            o['phong'][art] = (Image.open(io.BytesIO(pg.screenshot())).convert('RGB'), ep)
        if ten == 'mau':  # để sẵn: tệp pha có thêm hàng "chạy" thì game dùng luôn (thử bằng cách gắn tạm hàng chạy vào tấm mẫu đang nạp, rồi gỡ)
            KQ['de_san_hang_chay_trong_tep_pha'] = pg.evaluate("(() => { const p = G.spriteCustom.ds[T.trum(1) + '-p2']; p.dt.move = Object.assign({}, p.dt.idle); const k = T.ve({ pha: 2, n: 'move', u: 0.3 }).nhat; delete p.dt.move; return k; })()")
        o['ds_quai'] = pg.evaluate("G.monsterArt.list.map((m) => m.id).filter((id) => /-p[23]$/.test(id))")
        o['loi'] = errs + pg.evaluate('T.errs')
        ds[ten] = o; b.close()
    return ds


def chay_trang(pw):
    """Trang tools/tach-quai: mở qua máy chủ ở gốc repo (để trang lấy được game/dist/linh-khi.html)."""
    shutil.copy(os.path.join(TAM, 'tach-quai-cu.html'), os.path.join(REPO, 'tools', 'tach-quai', '_cu.html'))
    kq = {}
    try:
        cong = may_chu(REPO); b = pw.chromium.launch(); errs = []
        pg = b.new_page(viewport={'width': 900, 'height': 1400}, accept_downloads=True); pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('http://127.0.0.1:%d/tools/tach-quai/_cu.html' % cong); cu = pg.evaluate('QUAI.map(taoPrompt)')
        # tấm 8×6 giả của Heo Rừng Con (nền hồng tím, có lưới) để so kết quả tách của trang cũ và trang mới
        t = json.load(open(os.path.join(CUSTOM, 'heoCon.sprite.json'), encoding='utf-8')); n = int(t.get('net') or 1)
        g = Image.open(io.BytesIO(base64.b64decode(t['tam'].split(',')[1]))).convert('RGBA'); K = 4 // n
        g = g.resize((g.width * K, g.height * K), Image.NEAREST); nen = Image.new('RGBA', g.size, (255, 0, 255, 255)); nen.alpha_composite(g); d = ImageDraw.Draw(nen)
        for c in range(9): d.line([(min(nen.width - 1, c * nen.width // 8), 0), (min(nen.width - 1, c * nen.width // 8), nen.height)], fill=(20, 24, 46, 255), width=3)
        for r in range(7): d.line([(0, min(nen.height - 1, r * nen.height // 6)), (nen.width, min(nen.height - 1, r * nen.height // 6))], fill=(20, 24, 46, 255), width=3)
        heo = os.path.join(TAM, 'heoCon-8x6.png'); nen.convert('RGB').save(heo)
        def tach(pg, chi_so, duong):
            pg.select_option('#chonQuai', str(chi_so)); pg.set_input_files('#chonAnh', duong); pg.wait_for_function('typeof KQ !== "undefined" && KQ && !document.getElementById("buoc3").hidden'); pg.wait_for_timeout(300)
            return pg.evaluate('({ dat: KQ.dat, tep: taoTep(), kiem: [...document.querySelectorAll("#dsKiem li")].map((l) => (l.className === "loi" ? "LỖI: " : "") + l.textContent) })')
        tep_cu = tach(pg, 0, heo)
        pg.goto('http://127.0.0.1:%d/tools/tach-quai/index.html' % cong); moi = pg.evaluate('QUAI.map(taoPrompt)'); ma = pg.evaluate('QUAI.map((q) => q.ma)')
        tep_moi = tach(pg, 0, heo)
        kq['so_muc'] = [len(cu), len(moi)]; kq['prompt_cu_khong_doi'] = moi[:len(cu)] == cu; kq['6_muc_cuoi'] = ma[len(cu):]
        kq['tach_quai_thuong_khong_doi'] = json.dumps(tep_cu, sort_keys=True) == json.dumps(tep_moi, sort_keys=True)
        kq['prompt'] = dict(zip(ma[len(cu):], moi[len(cu):]))
        kq['tham_chieu'] = {}
        for i in range(len(cu), len(moi)):
            pg.select_option('#chonQuai', str(i))
            with pg.expect_download() as dl: pg.click('#nutThamChieu')
            p = os.path.join(TAM, dl.value.suggested_filename.replace('.png', '-' + ma[i] + '.png')); dl.value.save_as(p); im = Image.open(p).convert('RGB')
            kq['tham_chieu'][ma[i]] = {'ten_tep': dl.value.suggested_filename, 'co': list(im.size), 'nen': '#%02X%02X%02X' % im.getpixel((8, 8)), 'so_khung': pg.evaluate('Q.so'), 'o': pg.evaluate('[Q.fw, Q.fh]')}
        # tách thử: lấy ảnh tham chiếu pha 1 của Ngư Tinh, đổi màu (giả làm ảnh ChatGPT vẽ pha 2), đưa lại vào trang
        i2 = ma.index('nguTinh-p2'); gia = os.path.join(TAM, 'gia-nguTinh-p2.png')
        im = Image.open(os.path.join(TAM, 'nguTinh-pha1-tham-chieu-nguTinh-p2.png')).convert('RGB'); px = im.load()
        for y in range(im.height):
            for x in range(im.width):
                r, g2, b2 = px[x, y]
                if (r, g2, b2) != (255, 0, 255) and (r, g2, b2) != (20, 24, 46): px[x, y] = (min(255, int(r * 1.25 + 45)), int(g2 * 0.55), int(b2 * 0.55))
        im.save(gia); t2 = tach(pg, i2, gia)
        kq['tach_8x4'] = {'dat': t2['dat'], 'kiem': t2['kiem'], 'ma': t2['tep']['ma'], 'dong_tac': t2['tep']['dong_tac'], 'khung': [t2['tep']['khung_rong'], t2['tep']['khung_cao']], 'net': t2['tep'].get('net', 1)}
        tam_anh = Image.open(io.BytesIO(base64.b64decode(t2['tep']['tam'].split(',')[1]))); kq['tach_8x4']['co_tam'] = list(tam_anh.size)
        pg.evaluate('document.querySelector("header") && window.scrollTo(0, 0)'); pg.set_viewport_size({'width': 900, 'height': 900})
        kq['_anh_trang'] = Image.open(io.BytesIO(pg.screenshot(full_page=True))).convert('RGB'); kq['loi_trang'] = errs; b.close()
    finally:
        os.remove(os.path.join(REPO, 'tools', 'tach-quai', '_cu.html'))
    return kq


def main():
    chuan_bi()
    with sync_playwright() as pw:
        try:
            G = chay_game(pw); TR = chay_trang(pw)
        finally:
            for m in MAY: m.kill()
    cu, moi, mau = G['cu'], G['moi'], G['mau']
    # 2. không có tệp pha: bản mới giống hệt bản trước khi sửa
    k1 = {'%s pha %s %s' % k: khac(cu['ve'][k][0], moi['ve'][k][0]) for k in cu['ve']}
    KQ['khong_tep_so_voi_ban_truoc'] = {'so_anh': len(k1), 'tong_diem_khac': sum(k1.values()), 'phong_that_pha2_diem_khac': {a: khac(cu['phong'][a][0], moi['phong'][a][0]) for a in TRUM}}
    # 3. có tệp mẫu
    dung = {}; sai = []
    for art in TRUM:
        for pha in (2, 3):
            for n, u, _ in COT:
                im, nhat = mau['ve'][(art, pha, n)]; muon = '%s-p%d:%s' % (art, pha, n) if n in HANG_PHA else '%s:%s' % (art, n)
                d = khac(im, moi['ve'][(art, pha, n)][0])
                ok = nhat == [muon] and ((d > 500) if n in HANG_PHA else d == 0)
                dung['%s pha %d %s' % (art, pha, n)] = {'tam_da_ve': nhat, 'diem_khac_so_voi_khong_tep': d, 'dat': ok}
                if not ok: sai.append('%s pha %d %s: %s, khác %d' % (art, pha, n, nhat, d))
        for n, u, _ in COT:  # pha 1 không bị ảnh hưởng bởi tệp pha
            d = khac(mau['ve'][(art, 1, n)][0], moi['ve'][(art, 1, n)][0])
            if d or mau['ve'][(art, 1, n)][1] != ['%s:%s' % (art, n)]: sai.append('%s pha 1 %s đổi %d điểm' % (art, n, d))
    KQ['co_tep_mau'] = {'sai': sai, 'chi_tiet': dung, 'ep_pha_2_theo_luat_game': {a: mau['phong'][a][1] for a in TRUM},
                        'co_trum_bang_nhau_pha1_pha3_hoTinh': mau['ve'][('hoTinh', 3, 'idle')][0].size == mau['ve'][('hoTinh', 1, 'idle')][0].size,
                        'danh_sach_quai_khong_them_muc': mau['ds_quai'] == []}
    KQ['chop_bao_don'] = {a: {'nhip_sang_khac_nhip_tat': khac(moi['ve'][(a, 'bao', 1)], moi['ve'][(a, 'bao', 0)]), 'nhip_tat_khac_luc_khong_lay_da': khac(moi['ve'][(a, 'bao', 0)], moi['ve'][(a, 'bao', 2)])} for a in TRUM}
    KQ['loi_trang_game'] = {k: G[k]['loi'] for k in G}
    anh_trang = TR.pop('_anh_trang'); KQ['trang_tach_quai'] = TR
    # ----- ảnh kiểm -----
    W1, H1 = 300, 210; hang = []
    def nhan(t, w, mau_chu=(255, 220, 140)): im = Image.new('RGB', (w, 22), (18, 14, 22)); ImageDraw.Draw(im).text((6, 3), t, fill=mau_chu, font=FONT); return im
    Wt = W1 * len(COT)
    hang.append(nhan('PHIÊN E2 · Dáng pha của trùm vùng. Tấm pha 2, pha 3 ở đây là TẤM MẪU máy tự dựng (chép pha 1 rồi đổi màu), đã xoá sau khi kiểm.', Wt, (255, 255, 255)))
    hang.append(nhan('   '.join('[%d] %s' % (i + 1, c[2]) for i, c in enumerate(COT)) + '   · 4 cột đầu lấy từ tệp pha, 2 cột cuối mượn tấm pha 1', Wt))
    for art in TRUM:
        for pha, chu in ((1, 'pha 1'), (2, 'pha 2 · có tệp %s-p2 (mẫu đỏ)' % art), (3, 'pha 3 · có tệp %s-p3 (mẫu đổi kênh màu)' % art)):
            hang.append(nhan('%s · %s' % (art, chu), Wt)); im = Image.new('RGB', (Wt, H1))
            for i, (n, u, _) in enumerate(COT): im.paste(mau['ve'][(art, pha, n)][0], (i * W1, 0))
            hang.append(im)
    hang.append(nhan('Chớp trắng báo sắp ra đòn (0,25 giây cuối trước khi đòn ra, chỉ khi trùm dùng ảnh AI): nhịp tắt / nhịp sáng của 3 trùm', Wt))
    im = Image.new('RGB', (Wt, H1))
    for i, art in enumerate(TRUM): im.paste(moi['ve'][(art, 'bao', 0)], (i * 2 * W1, 0)); im.paste(moi['ve'][(art, 'bao', 1)], (i * 2 * W1 + W1, 0))
    hang.append(im)
    hang.append(nhan('Phòng thật 844×390, hạ máu để game TỰ chuyển pha 2. Trái: không có tệp pha (giống hệt bản trước: %s điểm khác). Phải: có tệp mẫu.' % KQ['khong_tep_so_voi_ban_truoc']['phong_that_pha2_diem_khac'], Wt))
    for art in TRUM:
        im = Image.new('RGB', (Wt, 390), (0, 0, 0)); im.paste(moi['phong'][art][0], (0, 0)); im.paste(mau['phong'][art][0], (Wt - 844, 0)); hang.append(im)
    hang.append(nhan('Trang Tách Quái: mục "Ngư Tinh · pha 2", ảnh tham chiếu pha 1 và kết quả tách thử tấm 8×4', Wt))
    hang.append(anh_trang.crop((0, 0, min(Wt, anh_trang.width), min(1560, anh_trang.height))))  # phần đầu trang là đủ thấy mục mới, lưới 8×4 và kết quả kiểm
    H = sum(h.height for h in hang); ra = Image.new('RGB', (Wt, H), (18, 14, 22)); y = 0
    for h in hang: ra.paste(h, (0, y)); y += h.height
    ra.save(os.path.join(DAY, 'anh-kiem.png'), optimize=True)
    json.dump(KQ, open(os.path.join(DAY, 'ket-qua.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    gon = {k: v for k, v in KQ.items() if k not in ('co_tep_mau', 'trang_tach_quai')}; gon['co_tep_mau_sai'] = sai
    gon['trang'] = {k: v for k, v in TR.items() if k != 'prompt'}
    print(json.dumps(gon, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
