"""Chụp quái ở cỡ thật trong game (cạnh em bé) theo ba vùng, và đồ rơi trên sàn ba vùng.
Chạy: python3 tests/chitiet_shots.py THƯ_MỤC_RA [quai|do|all]. Ảnh chụp ở khung 960x540 (game 480x270 phóng 2 lần như màn điện thoại).
Dùng cho docs/do-roi-va-quai-chi-tiet (ảnh trước/sau). Cần Playwright và Pillow."""
import io, os, sys
from PIL import Image
from quai_lib import sync_playwright, open_page

CLIP = {'x': 16, 'y': 0, 'width': 960, 'height': 540}
NHOM = [
    ['heoCon', 'ongVo', 'boHung', 'hoaBaoTu', 'chonBong', 'namPhong', 'socNo', 'nhimDoc', 'heoNanh', 'namPhongChua'],
    ['cua', 'caCon', 'oc', 'haiQuy', 'caChuon', 'caNoc', 'sua', 'nhim', 'cuaTuong', 'caNocChua'],
    ['linhMa', 'doiThan', 'tuongDa', 'denLong', 'meoDen', 'huLua', 'tieuYeu', 'nhimThan', 'tuongMa', 'huChua'],
]
TRUM = [['namChua', 'mocTinh'], ['cuaDa', 'nguTinh'], ['hoLua', 'hoTinh']]

# Dựng phòng vùng r, xếp các con ids thành lưới, em bé đứng giữa. anim/t: cử động và thời điểm.
SETUP = r"""([r, ids, anim, t, cols]) => {
  const { S, W, P } = T.room(r, 2, { seed: 9 }); T.frame(60);
  W.ents.length = 0; W.zones.length = 0; W.shots && (W.shots.length = 0);
  const x0 = W.x0 + 30, x1 = W.x1 - 30, y0 = W.y0 + 42, y1 = W.y1 - 8, n = ids.length, rows = Math.ceil(n / cols);
  ids.forEach((id, i) => {
    const cx = i % cols, cy = Math.floor(i / cols);
    const x = x0 + (x1 - x0) * (cols === 1 ? 0.5 : cx / (cols - 1)), y = y0 + (y1 - y0) * (rows === 1 ? 0.6 : cy / (rows - 1));
    const e = G.spawnEnemy('elite', x, y, { art: id, trait: 'nhanh' });
    e.trait = null; e.an = { n: anim, t: t }; e.face = -1; e.dirA = Math.PI; e.spawnT = 0; e.flash = 0; e.hitT = 0;
  });
  const k = ids.length, hx = k % cols, hy = Math.floor(k / cols); P.x = x0 + (x1 - x0) * (hx / Math.max(1, cols - 1)); P.y = rows > 1 ? y0 + (y1 - y0) * (hy / (rows - 1)) : y1; if (cols === 2) { P.x = (x0 + x1) / 2; P.y = y1; } S.hint = null; W.banner = null;
  G.ui.begin(); G.scene.draw();
}"""
FRAME = r"""([anim, t]) => { const W = G.getWorld(); for (const e of W.ents) e.an = { n: anim, t }; G.ui.begin(); G.scene.draw(); }"""


def snap(pg):
    return Image.open(io.BytesIO(pg.screenshot(clip=CLIP))).convert('RGB')


def quai(pg, out):
    ims = []
    for r in range(3):
        pg.evaluate(SETUP, [r, NHOM[r], 'idle', 0, 4])
        ims.append(snap(pg))
    for r in range(3):
        pg.evaluate(SETUP, [r, TRUM[r], 'idle', 0, 2])
        ims.append(snap(pg))
    for i, im in enumerate(ims):
        im.save(os.path.join(out, 'quai-%d.png' % i))
    print('đã chụp quái', out)


# Đồ rơi đủ loại trên sàn ba vùng (em bé đứng giữa, một con quái cạnh để xem đồ có che quái không).
DO = r"""([r, t]) => {
  const { S, W, P } = T.room(r, 2, { seed: 9 }); T.frame(60);
  W.ents.length = 0; W.zones.length = 0;
  const sv = G.save, ws = [0, 1, 2, 3].map((k) => G.newWeapon(sv, ['sword', 'bow', 'spear', 'hammer'][k], k));
  const items = [
    { kind: 'weapon', w: ws[0], s: G.wName(ws[0]) }, { kind: 'weapon', w: ws[1], s: G.wName(ws[1]) }, { kind: 'weapon', w: ws[2], s: G.wName(ws[2]) }, { kind: 'weapon', w: ws[3], s: G.wName(ws[3]) },
    { kind: 'outfit', o: { k: 'mu_sung', r: 0, lv: 1 }, s: 'Mũ sừng gỗ' }, { kind: 'outfit', o: { k: 'ao_vay', r: 2, lv: 1 }, s: 'Áo vảy' }, { kind: 'outfit', o: { k: 'trong_nho', r: 3, lv: 1 }, s: 'Trống đồng nhỏ' },
    { kind: 'gold', s: '+120 vàng' }, { kind: 'ore', s: '+3 quặng' }, { kind: 'stone', s: '+1 đá tôi' }, { kind: 'mat' + r, s: '+5 nguyên liệu' }, { kind: 'shard' + r, s: '+1 mảnh trùm' }, { kind: 'xp', s: '+40 kinh nghiệm' },
  ];
  const cx = (W.x0 + W.x1) / 2, cy = (W.y0 + W.y1) / 2;
  items.forEach((it, i) => { const col = i % 5, row = Math.floor(i / 5); const x = cx - 72 + col * 36, y = cy - 40 + row * 34;
    W.props.push(Object.assign({ type: 'loot', x, y, sx: x, sy: y, born: G.time - 2 - i * 0.1 }, it)); });
  const e = G.spawnEnemy('elite', cx + 40, cy + 30, { art: G.MOB_ART.rusher[r] }); e.trait = null; e.an = { n: 'idle', t: 0 }; e.spawnT = 0;
  P.x = cx - 50; P.y = cy + 34; S.hint = null; W.banner = null;
  G.time += t; G.ui.begin(); G.scene.draw();
}"""


def do(pg, out):
    for r in range(3):
        pg.evaluate(DO, [r, 0])
        snap(pg).save(os.path.join(out, 'do-%d.png' % r))
    print('đã chụp đồ rơi', out)


PREP = r"""(() => {
  T.keep = () => { const S = G.getRun(); const P = S.P; P.hp = Math.max(P.hp, P.maxhp * 0.6); P.dead = false; S.W.over = null; if (P.mv) { P.mv.tips = { sword: 1, bow: 1, spear: 1, hammer: 1 }; P.mv.tipWait = null; } S.hint = null; if (S.W.banner && S.W.banner.tip) S.W.banner = null; };
  T.run = (n, bot) => { T.useBot(!!bot); for (let k = 0; k < n; k++) { T.frame(1); T.keep(); } T.useBot(false); };
})();"""


def gif(pg, out, r=1):
    """GIF ngắn trong game: quái đã sửa của vùng r đánh nhau với bot, một tinh anh gục rơi vũ khí, đồ bay về khi lại gần."""
    pg.evaluate(PREP)
    pg.evaluate("""(r) => { const { S, W, P } = T.room(r, 2, { seed: 31 }); T.frame(30); W.ents.length = 0;
      const ids = [['namPhong', 'nhimDoc', 'chonBong', 'ongVo'], ['caNoc', 'sua', 'caChuon', 'nhim'], ['huLua', 'nhimThan', 'denLong', 'doiThan']][r];
      const role = { namPhong: 'kami', nhimDoc: 'spiky', chonBong: 'nimble', ongVo: 'swarm', caNoc: 'kami', sua: 'bomber', caChuon: 'nimble', nhim: 'spiky', huLua: 'kami', nhimThan: 'spiky', denLong: 'archer', doiThan: 'swarm' };
      const cx = (W.x0 + W.x1) / 2, cy = (W.y0 + W.y1) / 2;
      ids.forEach((id, i) => { const e = G.spawnEnemy(role[id], cx - 60 + i * 40, cy - 40 + (i % 2) * 20, { art: id }); e.hp = e.maxhp = e.maxhp * 6; });
      const el = G.spawnEnemy('elite', cx + 20, cy + 10, { trait: 'nhanh' }); el.hp = 1; el.maxhp = 1;
      const DR = G.DROP.elite; G.DROP.elite = 1; window.__dr = DR;
      P.x = cx - 30; P.y = cy + 50; }""", r)
    fr = []
    for k in range(70):
        pg.evaluate("() => { T.run(3, true); }")
        fr.append(snap(pg).crop((236, 40, 724, 540)))
    pg.evaluate("() => { G.DROP.elite = window.__dr; }")
    q = [f.quantize(colors=128, method=Image.MEDIANCUT, dither=Image.NONE) for f in fr]
    q[0].save(os.path.join(out, 'trong-game.gif'), save_all=True, append_images=q[1:], duration=80, loop=0, optimize=True, disposal=1)
    print('gif', len(q), 'khung', os.path.getsize(os.path.join(out, 'trong-game.gif')) // 1024, 'KB')


if __name__ == '__main__':
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    what = sys.argv[2] if len(sys.argv) > 2 else 'all'
    with sync_playwright() as pw:
        b, pg, errs = open_page(pw)
        if what in ('quai', 'all'): quai(pg, out)
        if what in ('do', 'all'): do(pg, out)
        if what == 'gif': gif(pg, out, int(sys.argv[3]) if len(sys.argv) > 3 else 1)
        b.close()
        if errs: print('LỖI CONSOLE:', errs[:5])
