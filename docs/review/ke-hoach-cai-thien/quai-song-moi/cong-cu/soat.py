"""quai-song-moi: ảnh soát tĩnh (headless, bot tự đánh / quái đứng đánh, KHÔNG chơi thử).
Cùng một bản game (game/dist/linh-khi.html), chụp TRƯỚC = cờ tắt (?quaisongmoi=0&santl=0&ngumoman=0&nentile=0) và SAU = mặc định, ghép trên/dưới:
  ../anh-soat/truoc-sau-<cảnh>.png      python3 soat.py [cảnh,cảnh]
Thêm: GIF 6 hàng của từng quái dựng thẳng từ tấm sprite (gif-<mã>.gif, tam-<mã>.png) — không cần trình duyệt.
"""
import os, sys, json, io, base64, time
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '../../../../../game'))
OUT = os.path.join(HERE, '..', 'anh-soat'); os.makedirs(OUT, exist_ok=True)
sys.path.insert(0, os.path.join(ROOT, 'tests'))
CHON = sys.argv[1].split(',') if len(sys.argv) > 1 else None
CO_TRUOC = 'quaisongmoi=0&santl=0&ngumoman=0'   # song-phong thêm &nentile=0 (sàn ảnh mới) — xem CANH
MA4 = [('raiCa', 'rusher'), ('diaTrau', 'swarm'), ('baBa', 'shield'), ('cocTia', 'archer')]
TEN_HANG = ['dung', 'di', 'bao truoc', 'danh', 'trung don', 'chet']


def gif_quai(ma):
    t = json.load(open(os.path.join(ROOT, 'art/custom', ma + '.sprite.json'), encoding='utf-8'))
    tam = Image.open(io.BytesIO(base64.b64decode(t['tam'].split(',', 1)[1]))).convert('RGBA')
    n = t['net']; fw, fh = t['khung_rong'] * n, t['khung_cao'] * n; gx, gy = t['goc'][0] * n, t['goc'][1] * n
    dt = t['dong_tac']; K = 2
    W, H = fw * K, fh * K + 14
    bg = (52, 66, 58, 255)
    # tấm soát tĩnh: 6 hàng, vạch đỏ = đường chân, vạch lam = điểm neo
    so = max(v['so'] for v in dt.values())
    st = Image.new('RGBA', (fw * so * K + 90, len(dt) * (fh * K + 4)), bg); d = ImageDraw.Draw(st)
    for R, (k, v) in enumerate(dt.items()):
        for C in range(v['so']):
            o = tam.crop((C * fw, v['hang'] * fh, (C + 1) * fw, (v['hang'] + 1) * fh)).resize((fw * K, fh * K), Image.NEAREST)
            x, y = 90 + C * fw * K, R * (fh * K + 4); st.alpha_composite(o, (x, y))
            d.line([(x, y + gy * K), (x + fw * K - 1, y + gy * K)], fill=(255, 80, 80, 160)); d.line([(x + gx * K, y), (x + gx * K, y + fh * K)], fill=(90, 160, 255, 120))
            if v.get('khung') and C in v['khung']: d.rectangle([x, y, x + fw * K - 1, y + fh * K - 1], outline=(255, 210, 60, 255))
        d.text((4, R * (fh * K + 4) + 4), '%d %s\n%.2fs' % (R + 1, k, v['giay']), fill=(255, 255, 255, 255))
    st.save(os.path.join(OUT, 'tam-%s.png' % ma))
    fr, du = [], []
    for k, v in dt.items():
        cot = v.get('khung') or list(range(v['so']))
        lap = 2 if v.get('lap') else 1
        for _ in range(lap):
            for C in cot:
                f = Image.new('RGBA', (W, H), bg); dd = ImageDraw.Draw(f)
                o = tam.crop((C * fw, v['hang'] * fh, (C + 1) * fw, (v['hang'] + 1) * fh)).resize((fw * K, fh * K), Image.NEAREST)
                f.alpha_composite(o, (0, 14)); dd.text((2, 1), '%s %d' % (k, C + 1), fill=(255, 255, 255, 255))
                fr.append(f.convert('P', palette=Image.ADAPTIVE)); du.append(int(1000 * v['giay'] / len(cot)))
    fr[0].save(os.path.join(OUT, 'gif-%s.gif' % ma), save_all=True, append_images=fr[1:], duration=du, loop=0, disposal=2)
    return len(fr)


PRE = r"""() => {
  T.save = (o) => G.testSave(Object.assign({ lvl: 36, gold: 99999, melee: 'sword', branch: 'fire', marksMoi: G.MARKS[1] + 30 }, o || {}));
  T.chay = (n) => { for (let k = 0; k < n; k++) { T.frame(1); if (G.theme && G.theme.endFrame) G.theme.endFrame(); const S = G.getRun && G.getRun(); if (S && S.P && S.P.hp < S.P.maxhp * 0.5) { S.P.hp = S.P.maxhp; S.P.dead = false; } } };
}"""
QUAI = "() => { const { W, P } = T.room(3, 2, { seed: 9, save: { lvl: 36 } }); W.props = W.props.filter((p) => p.type === 'roomFore'); P.x = 150; P.y = 150; " + \
       " ".join("{ const e = G.spawnEnemy('%s', %d, %d, { art: '%s', hpMult: 80 }); e.inside = true; e.spawnT = 0; }" % (r, 230 + 70 * (i % 2), 110 + 55 * i, m) for i, (m, r) in enumerate(MA4)) + " }"
CANH = {
  'quai-4-con': (QUAI, [6, 40, 70, 100, 130], None),
  'song-phong': ("""() => { T.save(); G.rnd = G.srand(34); G.startStage(3, 2, 0); const S = G.getRun(); S.fade = 0; S.tut = null; S.hint = null; const W = G.getWorld(); W.waves = []; W.spawns = []; }""", [30, 120], None),
  'song-trum': ("""() => { T.save(); const x = T.boss(3, true, { seed: 5, save: { lvl: 36 } }); x.S.fade = 0; T.useBot(true); }""", [20, 60, 200], None),
  'ngu-tinh-ra-mat': ("""() => { T.save(); T.boss(1, true, { seed: 4, save: { lvl: 30 } }).S.fade = 0; }""", [20, 45, 70, 95, 120, 150, 165], None),
}


def chay(pw, co, ten):
    from quai_lib import LIB
    b = pw.chromium.launch(); pg = b.new_page(viewport={'width': 992, 'height': 540}); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto('file://' + ROOT + '/dist/linh-khi.html?cloud=0' + ('&' + co if co else '')); pg.wait_for_function('window.G && G.scene'); pg.wait_for_timeout(2500)
    pg.evaluate("window.requestAnimationFrame = () => 0")
    pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'bot.js')); pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
    pg.evaluate(LIB); pg.evaluate(PRE)
    js, moc = CANH[ten][:2]; pg.evaluate(js); anh = []; da = 0
    for m in moc:
        pg.evaluate('(n) => T.chay(n)', m - da); da = m
        pg.wait_for_timeout(300)
        anh.append(Image.open(io.BytesIO(pg.screenshot())).convert('RGB'))
    loi = errs + pg.evaluate('T.errs'); b.close(); return anh, loi


def ghep(tr, sa, ten):
    W0, H0 = tr[0].size; n = len(tr); k = 0.5 if n > 2 else 0.75; w = int(W0 * k); h = int(H0 * k)
    im = Image.new('RGB', (w * n + 4 * (n - 1), h * 2 + 30), (30, 24, 36)); d = ImageDraw.Draw(im)
    for i, (a, bb) in enumerate(zip(tr, sa)):
        im.paste(a.resize((w, h), Image.LANCZOS), (i * (w + 4), 14)); im.paste(bb.resize((w, h), Image.LANCZOS), (i * (w + 4), h + 30))
    d.text((4, 1), ten + ' - TRUOC (tren, co tat: ' + CO_TRUOC + ')', fill=(255, 220, 160)); d.text((4, h + 17), 'SAU (duoi, mac dinh)', fill=(160, 255, 200))
    im.save(os.path.join(OUT, 'truoc-sau-%s.png' % ten), optimize=True)


if __name__ == '__main__':
    if not CHON or 'gif' in CHON:
        for m, _ in MA4: print('gif', m, gif_quai(m), 'khung')
    from quai_lib import sync_playwright
    with sync_playwright() as pw:
        for ten in CANH:
            if CHON and ten not in CHON: continue
            t0 = time.time(); tr, l1 = chay(pw, CO_TRUOC + ('&nentile=0' if ten == 'song-phong' else ''), ten); sa, l2 = chay(pw, '', ten)
            ghep(tr, sa, ten)
            if os.environ.get('LUU'): [x.save(os.path.join(OUT, 'sau-%s-%d.png' % (ten, i))) for i, x in enumerate(sa)]
            print(ten, '%.0fs' % (time.time() - t0), 'lỗi', l1[:3], l2[:3], flush=True)
