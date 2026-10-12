"""Kiểm Ngư Tinh pha 2, pha 3 trong game (phiên nhập Ngư Tinh pha 2, 3 — 12/10).
Chạy (từ gốc repo, sau python3 game/build.py):  python3 docs/review/ke-hoach-cai-thien/nhap-anh-12-10/ngu-tinh/kiem.py
Ra (cạnh tệp này): pha-1.png, pha-2.png, pha-3.png (phòng trùm thật 844×390, hạ máu để game TỰ chuyển pha),
can-canh.png (đúng đường vẽ của game: 3 pha × đứng, lấy đà, tấn công, trúng đòn, chạy, chết), chuyen-pha.gif, ket-qua.json."""
import base64, io, json, os, subprocess, sys, time
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

DAY = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.normpath(os.path.join(DAY, '..', '..', '..', '..', '..'))
GAME = os.path.join(REPO, 'game')
sys.path.insert(0, os.path.join(GAME, 'tests'))
from quai_lib import LIB
try: FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 13)
except Exception: FONT = ImageFont.load_default()

THEM = r"""
(() => {
  const SC = G.spriteCustom, ve0 = SC.veKhung; T.nhat = [];
  SC.veKhung = function (c, sp, ten) { T.nhat.push(sp.ma + ':' + ten); return ve0.apply(this, arguments); };
  T.yen = (b) => { const W = G.getWorld(); b.cd = 99; b.busy = 5; b.seq.length = 0; b.wind = 0; b.lunge = null; b.tired = 0; b.hitT = 0; b.flash = 0; W.zones = []; W.projs = []; };
  T.trum = (r) => { _gieo(20261012 + r); G.time = 50; const b = T.boss(r, true).b; for (let i = 0; i < 400 && (b.intro > 0 || b.invuln > 0 || b.busy > 0); i++) T.sim(1, true); T.yen(b); return b.art; };
  T.ve = (o) => { const b = G.getWorld().boss, w = 300, h = 210, cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
    c.fillStyle = '#2a3340'; c.fillRect(0, 0, w, h);
    const giu = { x: b.x, y: b.y, phase: b.phase, an: b.an, dying: b.dying, hitT: b.hitT, wind: b.wind, face: b.face, dirA: b.dirA, t: G.time };
    const D = G.monsterArt.dur(b.art, o.n) || 1;
    b.x = w / 2; b.y = h - 14; b.phase = o.pha - 1; b.face = 1; b.dirA = 0; b.flash = 0; b.tired = 0; b.st.stun = 0; b.st.frozen = 0; b.wind = 0; G.time = 0;
    b.dying = null; b.hitT = 0; b.an = { n: o.n, t: o.u * D, spd: 1 };
    if (o.n === 'die') { b.dying = o.u; b.an = { n: 'idle', t: 0, spd: 1 }; }
    if (o.n === 'hit') { b.hitT = 0.4 - o.u * 0.4; b.an = { n: 'idle', t: 0, spd: 1 }; }
    T.nhat.length = 0; G.art.boss(c, b);
    Object.assign(b, { x: giu.x, y: giu.y, phase: giu.phase, an: giu.an, dying: giu.dying, hitT: giu.hitT, wind: giu.wind, face: giu.face, dirA: giu.dirA }); G.time = giu.t;
    return { url: cv.toDataURL('image/png'), nhat: T.nhat.slice() }; };
  T.hp = (pha) => { const b = G.getWorld().boss; b.hp = b.maxhp * (pha === 2 ? 0.6 : 0.3); };
  T.buoc = (n) => { const b = G.getWorld().boss, S = G.getRun(); T.frame(n); S.P.hp = S.P.maxhp; return { phase: b.phase, an: b.an && b.an.n, t: b.an && b.an.t, x: b.x, y: b.y }; };
  T.ve2 = () => { const W = G.getWorld(), b = W.boss; T.yen(b); b.an = { n: 'idle', t: 0, spd: 1 }; for (let i = 0; i < 30; i++) { T.yen(b); T.frame(1); G.getRun().P.hp = G.getRun().P.maxhp; } return b.phase; };
})();
"""
COT = [('idle', 0.3, 'đứng'), ('tele', 0.6, 'lấy đà'), ('atk', 0.85, 'tấn công'), ('hit', 0.6, 'trúng đòn'), ('move', 0.3, 'chạy'), ('die', 0.2, 'gục')]
KQ = {}


def anh(u): return Image.open(io.BytesIO(base64.b64decode(u.split(',')[1]))).convert('RGB')


def main():
    cong = 8891
    sv = subprocess.Popen([sys.executable, '-m', 'http.server', str(cong), '--bind', '127.0.0.1'], cwd=os.path.join(GAME, 'dist'), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
    try:
        with sync_playwright() as pw:
            b = pw.chromium.launch(); pg = b.new_page(viewport={'width': 844, 'height': 390}); errs = []
            pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
            pg.add_init_script("(() => { let a = 20261012; Math.random = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; window._gieo = (v) => { a = v; }; })();")
            pg.goto('http://127.0.0.1:%d/linh-khi.html?cloud=0' % cong)
            pg.wait_for_function('window.G && G.scene'); pg.wait_for_timeout(600)
            pg.evaluate('window.requestAnimationFrame = () => 0')
            pg.add_script_tag(path=os.path.join(GAME, 'tests', 'bot.js')); pg.add_script_tag(path=os.path.join(GAME, 'tests', 'setup.js'))
            pg.evaluate(LIB); pg.evaluate(THEM)
            pg.wait_for_function("['nguTinh', 'nguTinh-p2', 'nguTinh-p3'].every((m) => G.spriteCustom.ds[m] && G.spriteCustom.ds[m].ready)", timeout=60000); pg.wait_for_timeout(800)
            KQ['tep_pha'] = pg.evaluate("['nguTinh', 'nguTinh-p2', 'nguTinh-p3'].map((m) => { const s = G.spriteCustom.ds[m]; return { ma: m, fw: s.fw, fh: s.fh, net: s.net, hang: Object.keys(s.dt) }; })")
            r = next(i for i in range(3) if pg.evaluate('(r) => T.trum(r)', i) == 'nguTinh')
            KQ['vung_cua_ngu_tinh'] = r
            # 1. cận cảnh bằng đúng đường vẽ của game
            ve = {}
            for pha in (1, 2, 3):
                for n, u, _ in COT:
                    k = pg.evaluate('(o) => T.ve(o)', {'pha': pha, 'n': n, 'u': u}); ve[(pha, n)] = anh(k['url']); KQ.setdefault('tam_da_ve', {})['pha %d %s' % (pha, n)] = k['nhat']
            don = []
            for n, k in (('tele', 8), ('atk', 14)):
                for i in range(k):
                    hinh = [anh(pg.evaluate('(o) => T.ve(o)', {'pha': p, 'n': n, 'u': (i + 0.5) / k})['url']) for p in (1, 2, 3)]
                    o = Image.new('RGB', (900, 210)); [o.paste(h, (j * 300, 0)) for j, h in enumerate(hinh)]; don.append(o)
            # 2. phòng thật: pha 1, rồi hạ máu để game tự chuyển pha 2, pha 3; ghi khung hình lúc chuyển pha làm GIF
            pg.evaluate('(r) => T.trum(r)', r); pg.evaluate('T.ve2()')
            pg.screenshot(path=os.path.join(DAY, 'pha-1.png'))
            gif = []; ds_pha = []
            for pha in (2, 3):
                pg.evaluate('(p) => T.hp(p)', pha)
                for i in range(110):
                    s = pg.evaluate('T.buoc(2)')
                    if i % 2 == 0: gif.append(Image.open(io.BytesIO(pg.screenshot())).convert('RGB'))
                    if i > 10 and s['an'] not in ('phase2', 'phase3'): break
                ds_pha.append(pg.evaluate('T.ve2()'))
                pg.screenshot(path=os.path.join(DAY, 'pha-%d.png' % pha))
                for _ in range(6): gif.append(Image.open(io.BytesIO(pg.screenshot())).convert('RGB'))
            KQ['pha_sau_khi_ha_mau'] = ds_pha
            KQ['loi'] = errs + pg.evaluate('T.errs')
            b.close()
    finally:
        sv.kill()
    # GIF: chỉ vùng quanh trùm (cắt 390×270 rồi thu 0,6), 64 màu chung, 12 hình/giây, cứ 2 hình lấy 1
    nho = [g.crop((230, 20, 620, 290)).resize((234, 162), Image.NEAREST) for g in gif[::2]]
    pal = nho[len(nho) // 2].quantize(48, dither=Image.Dither.NONE)
    fr = [g.quantize(palette=pal, dither=Image.Dither.NONE) for g in nho]
    fr[0].save(os.path.join(DAY, 'chuyen-pha.gif'), save_all=True, append_images=fr[1:], duration=167, loop=0, optimize=True)
    dn = [g.crop((0, 30, 900, 210)).resize((600, 120), Image.NEAREST) for g in don]
    pal2 = dn[len(dn) // 2].quantize(64, dither=Image.Dither.NONE)
    f2 = [g.quantize(palette=pal2, dither=Image.Dither.NONE) for g in dn]
    f2[0].save(os.path.join(DAY, 'don-tan-cong.gif'), save_all=True, append_images=f2[1:], duration=[90] * 8 + [70] * 14, loop=0, optimize=True)
    KQ['gif_don'] = {'so_hinh': len(f2), 'byte': os.path.getsize(os.path.join(DAY, 'don-tan-cong.gif'))}
    KQ['gif'] = {'so_hinh': len(fr), 'byte': os.path.getsize(os.path.join(DAY, 'chuyen-pha.gif'))}
    # ảnh cận cảnh
    W1, H1 = 300, 210; Wt = W1 * len(COT); hang = []
    def nhan(t, mau=(255, 220, 140)): im = Image.new('RGB', (Wt, 22), (18, 14, 22)); ImageDraw.Draw(im).text((6, 3), t, fill=mau, font=FONT); return im
    hang.append(nhan('Ngư Tinh vẽ bằng đúng đường vẽ của game. Cột: ' + ' · '.join(c[2] for c in COT), (255, 255, 255)))
    for pha, chu in ((1, 'pha 1 (nguTinh)'), (2, 'pha 2 · nổi giận (nguTinh-p2)'), (3, 'pha 3 · hoá băng (nguTinh-p3)')):
        hang.append(nhan(chu)); im = Image.new('RGB', (Wt, H1))
        for i, (n, u, _) in enumerate(COT): im.paste(ve[(pha, n)], (i * W1, 0))
        hang.append(im)
    out = Image.new('RGB', (Wt, sum(h.height for h in hang))); y = 0
    for h in hang: out.paste(h, (0, y)); y += h.height
    out.save(os.path.join(DAY, 'can-canh.png'), optimize=True)
    json.dump(KQ, open(os.path.join(DAY, 'ket-qua.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(json.dumps({k: v for k, v in KQ.items() if k != 'tam_da_ve'}, ensure_ascii=False))
    print(json.dumps(KQ['tam_da_ve'], ensure_ascii=False))


main()
