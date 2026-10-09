"""Chụp ảnh và GIF quái mới trong game cho báo cáo, lưu vào docs/quai-vao-game/.
Chạy: python3 tests/quai_shots.py [tên ...]   (không ghi tên thì chụp tất cả). Cần Playwright và Pillow."""
import io, os, sys
from PIL import Image
from quai_lib import sync_playwright, open_page, ROOT

OUT = os.path.join(os.path.dirname(ROOT), 'docs', 'quai-vao-game')
CLIP = {'x': 16, 'y': 0, 'width': 960, 'height': 540}  # khung game 480x270 phóng 2 lần
VUNG = ['rung', 'bien', 'lau-dai']
TEN = ['Rừng già', 'Hang biển', 'Lâu đài cổ']

PREP = r"""
(() => {
  T.clean = () => { const S = G.getRun(), W = G.getWorld(), P = S.P; if (P.mv) { P.mv.tips = { sword: 1, bow: 1, spear: 1, hammer: 1 }; P.mv.tipWait = null; } if (W.banner && (W.banner.tip || W.banner.t < 99)) W.banner = null; S.hint = null; };
  T.keep = () => { const S = G.getRun(); const P = S.P; P.hp = Math.max(P.hp, P.maxhp * 0.6); P.dead = false; S.W.over = null; };
  T.run = (n, bot) => { T.useBot(!!bot); for (let k = 0; k < n; k++) { T.frame(1); T.keep(); } T.useBot(false); };
})();
"""


def snap(pg):
    return Image.open(io.BytesIO(pg.screenshot(clip=CLIP))).convert('RGB')


def sheet(ims, cols, label=None):
    w, h = ims[0].size
    rows = (len(ims) + cols - 1) // cols
    out = Image.new('RGB', (w * cols, h * rows), (12, 10, 16))
    for i, im in enumerate(ims):
        out.paste(im, ((i % cols) * w, (i // cols) * h))
    return out


def save(im, name, scale=1.0):
    if scale != 1.0:
        im = im.resize((int(im.width * scale), int(im.height * scale)), Image.LANCZOS)
    im.save(os.path.join(OUT, name), optimize=True)
    print('ảnh', name, im.size)


def gif(frames, name, fps=12):
    fr = [f.resize((480, 270), Image.NEAREST).quantize(colors=128, method=Image.MEDIANCUT, dither=Image.NONE) for f in frames]
    fr[0].save(os.path.join(OUT, name), save_all=True, append_images=fr[1:], duration=int(1000 / fps), loop=0, optimize=True, disposal=1)
    print('gif', name, len(fr), 'khung', os.path.getsize(os.path.join(OUT, name)) // 1024, 'KB')


def record(pg, js_step, n, every=5):
    """Chạy n lượt js_step (mỗi lượt vài khung game), chụp một khung sau mỗi lượt."""
    fr = []
    for k in range(n):
        pg.evaluate(js_step)
        fr.append(snap(pg))
    return fr


def phong(pg, r):
    # một phòng đánh quái thật: bot tự đánh, chụp lúc đang có vùng đỏ báo đòn
    pg.evaluate("""(r) => { const o = T.room(r, 3, { seed: 21 + r }); const S = G.getRun();
      G.gotoRoom(S.map.rooms.findIndex((x) => x.type === 'fight')); const W = G.getWorld(); W.waveT = 0.01;
      W.waves = [['rusher', 'swarm', 'archer', 'shield', 'bomber', 'spiky', 'kami'], ['nimble', 'rusher', 'archer']];
      T.run(150, true); T.clean();
      for (let k = 0; k < 600; k++) { T.run(1, true); T.clean(); if (W.zones.filter((z) => z.t > 0.15 && z.src).length >= 2 && W.ents.length >= 5) break; } }""", r)
    save(snap(pg), f'phong-{VUNG[r]}.png')


def tinh_anh(pg, r):
    ims = []
    for k in range(2):
        pg.evaluate("""([r, k]) => { const { W, P } = T.room(r, 2, { seed: 40 + k }); const id = G.MOB_ART.elite[r][k];
          const e = G.spawnEnemy('elite', 290, 150, { art: id, trait: ['nhanh', 'giap', 'no', 'hut'][(r * 2 + k) % 4], hpMult: 50 }); e.inside = true;
          P.x = 210; P.y = 190; T.run(80); e.skCd = 0; e.cd = 0; T.clean();
          for (let t = 0; t < 200; t++) { T.frame(1); T.keep(); P.x = 210; P.y = 190; T.clean(); if ((e.act && e.act.k === 'sk' && e.act.t > e.act.T * 0.6) ) break; } }""", [r, k])
        ims.append(snap(pg))
    save(sheet(ims, 2), f'tinh-anh-{VUNG[r]}.png', 0.75)


def trum_nho(pg, r):
    ims = []
    for sk in ['chieu1', 'chieu2']:
        pg.evaluate("""([r, sk]) => { const { W, P, b } = T.boss(r, false, { seed: 3 }); T.run(100); b.invuln = 0; b.busy = 0; T.clean();
          P.x = W.x0 + 50; P.y = W.y1 - 30; b.x = (W.x0 + W.x1) / 2 + 30; b.y = (W.y0 + W.y1) / 2 - 10;
          G.bossDebug(sk); for (let t = 0; t < 300 && !(b.an && b.an.n === sk); t++) { T.frame(1); T.keep(); P.x = W.x0 + 50; P.y = W.y1 - 30; }
          T.frame(Math.round(G.monsterArt.dur(b.art, sk) * 60 * 0.42)); T.keep(); T.clean(); }""", [r, sk])
        ims.append(snap(pg))
    save(sheet(ims, 2), f'trum-nho-{VUNG[r]}.png', 0.75)


def trum(pg, r):
    ims = []
    for ph, sk in [(0, 'c1'), (1, ['c2', 'c4', 'c4'][r]), (2, 'c5')]:
        pg.evaluate("""([r, ph, sk]) => { const { W, P, b } = T.boss(r, true, { seed: 3 }); T.run(Math.ceil(b.intro * 60) + 10); T.clean();
          if (ph) { b.hp = b.maxhp * (ph === 1 ? 0.6 : 0.3); T.run(Math.ceil(G.monsterArt.dur(b.art, ph === 1 ? 'phase2' : 'phase3') * 60) + 30); }
          P.x = W.x0 + 40; P.y = W.y1 - 26; b.x = (W.x0 + W.x1) / 2 + 30; b.y = (W.y0 + W.y1) / 2 - 4; b.busy = 0; T.clean();
          G.bossDebug(sk); for (let t = 0; t < 300 && !(b.an && b.an.n === sk); t++) { T.frame(1); T.keep(); P.x = W.x0 + 40; P.y = W.y1 - 26; }
          const D = G.monsterArt.dur(b.art, sk), m = G.monsterArt.list.find((x) => x.id === b.art).anims.find((x) => x.id === sk).moc;
          T.frame(Math.round(D / [1, 1.1, 1.2][ph] * m[0] * 60 * 0.8)); T.keep(); P.x = W.x0 + 40; P.y = W.y1 - 26; T.clean(); }""", [r, ph, sk])
        ims.append(snap(pg))
    save(sheet(ims, 3), f'trum-{VUNG[r]}-ba-pha.png', 0.6)


def gifs(pg):
    # 1. phòng quái Hang biển: bot đánh, bom, cảm tử
    pg.evaluate("""() => { T.room(1, 3, { seed: 8 }); const S = G.getRun(); G.gotoRoom(S.map.rooms.findIndex((x) => x.type === 'fight')); const W = G.getWorld(); W.waveT = 0.01;
      W.waves = [['kami', 'bomber', 'rusher', 'spiky', 'archer']]; T.run(110, true); T.clean(); }""")
    gif(record(pg, "() => { T.run(5, true); T.clean(); }", 48), 'gif-phong-bien.gif')
    # 2. nhanh nhẹn lặn rồi trồi lên (Lâu đài cổ), xuất hiện từng tốp
    pg.evaluate("""() => { const { W, P } = T.room(2, 3, { seed: 12 }); P.x = 200; P.y = 170; const e = G.spawnEnemy('nimble', 300, 140, { hpMult: 50 }); e.inside = true; e.spawnT = 0; e.diveCd = 0.3; const e2 = G.spawnEnemy('spiky', 300, 210, { hpMult: 50 }); e2.inside = true; T.run(4); T.clean(); }""")
    gif(record(pg, "() => { const P = G.getRun().P; for (let k = 0; k < 5; k++) { T.frame(1); T.keep(); P.x = 200; P.y = 170; } T.clean(); }", 40), 'gif-lan-troi-len.gif')
    # 3. Mộc Tinh chuyển sang pha 3 rồi ra chiêu rừng gai
    pg.evaluate("""() => { const { W, P, b } = T.boss(0, true, { seed: 4 }); T.run(Math.ceil(b.intro * 60) + 10); b.hp = b.maxhp * 0.6; T.run(170); b.hp = b.maxhp * 0.3; P.x = W.x0 + 40; P.y = W.y1 - 30; T.clean(); }""")
    gif(record(pg, "() => { const S = G.getRun(), b = S.W.boss; if (b.an && b.an.n !== 'phase3' && b.busy <= 0 && !b.dbg) G.bossDebug('c5'); T.run(5, true); T.clean(); }", 72), 'gif-moc-tinh-pha-3.gif')
    # 4. Hồ Tinh: ra mắt rồi đánh (bot đánh thật)
    pg.evaluate("""() => { const { W, P, b } = T.boss(2, true, { seed: 6 }); T.clean(); }""")
    gif(record(pg, "() => { T.run(6, true); T.clean(); }", 70), 'gif-ho-tinh.gif')
    # 5. Ngư Tinh chết hoành tráng rồi mọc cổng
    pg.evaluate("""() => { const { W, P, b } = T.boss(1, true, { seed: 2 }); T.run(Math.ceil(b.intro * 60) + 30); b.hp = 1; b.phase = 2; G.damage(b, 1e12, { el: 'poison' }); T.clean(); }""")
    gif(record(pg, "() => { T.run(5); T.clean(); }", 60), 'gif-ngu-tinh-chet.gif')


ALL = ['phong', 'tinh_anh', 'trum_nho', 'trum', 'gifs']
if __name__ == '__main__':
    want = sys.argv[1:] or ALL
    os.makedirs(OUT, exist_ok=True)
    with sync_playwright() as pw:
        b, pg, errs = open_page(pw)
        pg.evaluate(PREP)
        for w in want:
            if w == 'gifs': gifs(pg)
            else:
                for r in range(3): globals()[w](pg, r)
        b.close()
    real = [e for e in errs if 'willReadFrequently' not in e]
    print('lỗi:', real[:5])
