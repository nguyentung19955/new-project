"""CHỤP SOÁT phiên D (headless, KHÔNG chơi thử bằng tay: dựng cảnh bằng lệnh theo kịch bản cố định).

  python3 chup.py <tệp html> <thư mục ra>

Ra (844×390 như iPhone ngang, dpr 2):
  slice-<cảnh>.png (ảnh mới) và slice-<cảnh>-cu.png (?slicecu=1, ảnh mượn cũ):
    1-fire-ink, 2-fire-guard, 3-guard-vo-1, 3-guard-vo-2, 4-thuong-bang-dat, 5-nhat-bang-nut-doi, 6-page-scrap-roi, 7-ket-qua
  hud-moi.png (?hudmoi=1) / hud-cu.png, hud-so-sanh-x3.png (cắt góc HUD phóng ×3: cũ | mới)
  rowan-<động tác>.gif: từng khung tấm Rowan phóng ×3, trái phiên C (đầu cũ) | phải phiên D
  rowan-trong-tran-<cảnh>.png: Rowan trong trận (đứng, chạy, né)
"""
import base64, io, json, os, sys
from playwright.sync_api import sync_playwright
from PIL import Image

HTML = os.path.abspath(sys.argv[1])
OUT = os.path.abspath(sys.argv[2])
os.makedirs(OUT, exist_ok=True)
W, H, DPR = 844, 390, 2
GOC = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', '..'))
SETUP = os.path.join(GOC, 'game', 'tests', 'setup.js')

VAO_SLICE = r'''
() => {
  G.resetSave(); G.save.sound = false;
  G.keys = {}; G.keyP = {}; if (G.pointers) G.pointers.clear();
  G.startStage(0, 0, 0);
  const S = G.getRun();
  S.fade = 0; S.mode = 'play';
  return !!S.slice;
}
'''
SACH = r'''
() => { const S = G.getRun(), Wd = S.W; S.fade = 0; S.hint = null; if (Wd.mobs) Wd.mobs.length = 0; if (Wd.ents) Wd.ents.length = 0; if (Wd.projs) Wd.projs.length = 0;
  if (Wd.spawns) Wd.spawns.length = 0; Wd.waves = []; Wd.waveT = 999; Wd.banner = null; S.P.inv = 99; return true; }
'''
PHONG = r'''
(n) => { G.gotoRoom(n); const S = G.getRun(); S.fade = 0; S.mode = 'play'; S.trans = null; return S.idx; }
'''
TRUM = r'''
() => { const S = G.getRun(), Wd = S.W, b = Wd.boss; if (!b) return null; b.busy = 999; b.vx = 0; b.vy = 0; b.atkT = 0; if (b.st) b.st.stun = 999; S.P.inv = 99; if (Wd.banner) Wd.banner = null;
  for (const k of Object.keys(Wd)) if (Array.isArray(Wd[k]) && /^(ents|projs|haz|hazards|zones|bullets|fxs|mobs|spawns|tele|warn|warns|aoe|aoes|timers)$/.test(k)) Wd[k].length = 0;
  S.P.x = b.x - 95; S.P.y = b.y + 4; return [b.x, b.y, b.h]; }
'''


def chup(pg, ten):
    pg.screenshot(path=os.path.join(OUT, ten + '.png'))


def mo(b, co=''):
    ctx = b.new_context(viewport={'width': W, 'height': H}, device_scale_factor=DPR, is_mobile=True, has_touch=True)
    pg = ctx.new_page()
    pg.on('pageerror', lambda e: print('LỖI TRANG:', e))
    pg.goto('file://' + HTML + '?cloud=0' + co)
    pg.wait_for_function('() => window.G && G.scene && G.bia', timeout=180000)
    pg.wait_for_timeout(5000)
    pg.add_script_tag(path=SETUP)
    return ctx, pg


def slice_canh(b, nhan, co):
    ctx, pg = mo(b, co)
    assert pg.evaluate(VAO_SLICE), 'không vào được bản thử'
    pg.wait_for_timeout(1500)
    # 1. Fire Ink
    pg.evaluate(PHONG, 2)
    pg.evaluate(SACH)
    pg.evaluate('() => { const S = G.getRun(); S.P.x = S.W.x0 + 60; S.P.y = (S.W.y0 + S.W.y1) / 2; return 1; }')
    pg.wait_for_timeout(900)
    pg.evaluate('() => { const S = G.getRun(); if (S.W.banner) S.W.banner = null; return 1; }')
    chup(pg, 'slice-1-fire-ink' + nhan)
    # 2. phòng trùm: Thương Băng nằm đất
    pg.evaluate('() => { const L = G.getRun().slice; L.lua = true; L.trang = null; return 1; }')
    pg.evaluate(PHONG, 3)
    pg.wait_for_timeout(2500)
    pg.evaluate(TRUM)
    pg.evaluate('() => { const S = G.getRun(), N = S.slice.nhat; if (N) { S.P.x = N.x - 40; S.P.y = N.y; } return !!N; }')
    pg.wait_for_timeout(700)
    pg.evaluate(TRUM)
    pg.evaluate('() => { const S = G.getRun(), N = S.slice.nhat; if (N) { S.P.x = N.x - 40; S.P.y = N.y; } S.W.banner = null; return 1; }')
    pg.wait_for_timeout(200)
    chup(pg, 'slice-4-thuong-bang-dat' + nhan)
    # nhặt → nút ĐỔI
    pg.evaluate('() => { const S = G.getRun(), N = S.slice.nhat; if (N) { S.P.x = N.x; S.P.y = N.y; } return 1; }')
    pg.wait_for_timeout(500)
    pg.evaluate(TRUM)
    pg.evaluate('() => { const S = G.getRun(); S.W.banner = null; S.P.x -= 30; return S.P.weapons.length; }')
    pg.wait_for_timeout(300)
    chup(pg, 'slice-5-nhat-bang-nut-doi' + nhan)
    # 3. Fire Guard: 4 đòn Lửa vào trùm
    pg.evaluate(TRUM)
    pg.evaluate('() => { const S = G.getRun(), b = S.W.boss; for (let i = 0; i < 5; i++) { b.invuln = 0; G.damage(b, 1, { el: "fire", fromPlayer: true }); } return !!S.slice.guard; }')
    pg.wait_for_timeout(600)
    pg.evaluate(TRUM)
    pg.evaluate('() => { G.getRun().W.banner = null; return 1; }')
    pg.wait_for_timeout(150)
    chup(pg, 'slice-2-fire-guard' + nhan)
    # vỡ: 3 đòn Băng
    pg.evaluate('() => { const S = G.getRun(), b = S.W.boss; for (let i = 0; i < 3; i++) { b.invuln = 0; G.damage(b, 1, { el: "ice", fromPlayer: true }); } S.W.banner = null; return !S.slice.guard; }')
    pg.evaluate(TRUM)
    pg.wait_for_timeout(60)
    chup(pg, 'slice-3-guard-vo-1' + nhan)
    pg.wait_for_timeout(200)
    chup(pg, 'slice-3-guard-vo-2' + nhan)
    # hạ trùm: Page Scrap rơi
    pg.evaluate('() => { const S = G.getRun(), b = S.W.boss; b.invuln = 0; b.busy = 0; G.damage(b, 1e7, { fromPlayer: true }); return 1; }')
    pg.wait_for_timeout(1000)
    pg.evaluate('() => { const S = G.getRun(); S.W.banner = null; return 1; }')
    chup(pg, 'slice-6-page-scrap-roi' + nhan)
    pg.wait_for_timeout(2200)
    pg.evaluate('() => { G.winPortal(); G.usePortal(); return 1; }')
    pg.wait_for_timeout(2500)
    chup(pg, 'slice-7-ket-qua' + nhan)
    ctx.close()


def hud(b):
    for nhan, co in (('hud-cu', ''), ('hud-moi', '&hudmoi=1')):
        ctx, pg = mo(b, co)
        pg.evaluate('() => { G.testSave({ lvl: 12 }); G.save.sound = false; G.startStage(0, 1, 0, { kind: "A", seed: 7 }); const S = G.getRun(); S.fade = 0; S.mode = "play"; return 1; }')
        pg.wait_for_timeout(2500)
        pg.evaluate(SACH)
        pg.wait_for_timeout(300)
        chup(pg, nhan)
        ctx.close()
    a = Image.open(os.path.join(OUT, 'hud-cu.png')).convert('RGB')
    c = Image.open(os.path.join(OUT, 'hud-moi.png')).convert('RGB')
    kq = []
    for im in (a, c):
        kq.append((im.crop((0, 0, 560, 120)), im.crop((im.width - 560, 0, im.width, 120))))
    S = Image.new('RGB', (1120 + 16, 120 * 2 + 16), (20, 20, 20))
    for i, (l, r) in enumerate(kq):
        S.paste(l, (0, i * 128)); S.paste(r, (576, i * 128))
    S.resize((S.width * 3 // 2, S.height * 3 // 2), Image.NEAREST).save(os.path.join(OUT, 'hud-so-sanh-x3.png'))


def rowan_trong_tran(b):
    ctx, pg = mo(b)
    pg.evaluate('() => { G.testSave({ lvl: 12 }); G.save.sound = false; G.startStage(0, 1, 0, { kind: "A", seed: 7 }); const S = G.getRun(); S.fade = 0; S.mode = "play"; return 1; }')
    pg.wait_for_timeout(2500)
    pg.evaluate(SACH)
    pg.evaluate('() => { G.getRun().P.inv = 0; return 1; }')  # không nháy bất tử (ảnh rõ)
    nhip = r'''([giu, bam]) => { const K = { R: 'ArrowRight', K: 'KeyK', J: 'KeyJ' }; G.keys = {}; for (const k of giu.split(',')) if (K[k]) G.keys[K[k]] = true;
      for (const k of bam.split(',')) if (K[k]) G.keyP[K[k]] = true; const R = G.getRun(); if (R && R.W && R.W.mobs) R.W.mobs.length = 0; return 1; }'''
    for ten, giu, bam, ms in (('dung', '', '', 600), ('chay', 'R', '', 250), ('ne', 'R', 'K', 100), ('chem', '', 'J', 120)):
        pg.evaluate(nhip, [giu, bam])
        pg.wait_for_timeout(ms)
        chup(pg, 'rowan-trong-tran-' + ten)
    ctx.close()


def rowan_gif():
    def tam(p):
        d = json.load(open(p, encoding='utf-8'))
        return Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',')[1]))).convert('RGBA'), d
    A, _ = tam(os.path.join(GOC, 'game', 'art', 'custom', 'zed-rowan-daucu.sprite.json'))
    B, d = tam(os.path.join(GOC, 'game', 'art', 'custom', 'zed-rowan.sprite.json'))
    dt = d['dong_tac']
    for ten, k in (('lon', 'lon~16'), ('trung', 'trung~16'), ('dung', 'dung~16'), ('chay', 'chay~16'), ('chem', None)):
        ds = [(dt[k]['hang'], i, dt[k]['giay'] / dt[k]['so']) for i in range(dt[k]['so'])] if k else \
             [(dt[q]['hang'], i, dt[q]['giay'] / dt[q]['so']) for q in ('kiem_1~kn', 'kiem_2~kn', 'kiem_3~kn') for i in range(dt[q]['so'])]
        kh, tg = [], []
        for hang, i, g in ds:
            o = Image.new('RGBA', (96 * 2 + 8, 96), (78, 102, 62, 255))
            o.alpha_composite(A.crop((i * 96, hang * 96, i * 96 + 96, hang * 96 + 96)), (0, 0))
            o.alpha_composite(B.crop((i * 96, hang * 96, i * 96 + 96, hang * 96 + 96)), (104, 0))
            kh.append(o.convert('RGB').resize((o.width * 3 // 2, o.height * 3 // 2), Image.NEAREST))  # tấm net 2: ×1,5 điểm ảnh tấm = ×3 điểm game
            tg.append(max(60, int(g * 1000 * 2)))  # chậm ×2 để soát
        kh[0].save(os.path.join(OUT, 'rowan-' + ten + '.gif'), save_all=True, append_images=kh[1:], duration=tg, loop=0)


def main():
    rowan_gif()
    with sync_playwright() as p:
        b = p.chromium.launch()
        for nhan, co in (('', ''), ('-cu', '&slicecu=1')):
            slice_canh(b, nhan, co)
        hud(b)
        rowan_trong_tran(b)
        b.close()
    print('xong')


if __name__ == '__main__':
    main()
