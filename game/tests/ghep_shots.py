"""Chụp ảnh từ game cho báo cáo đợt ghép 1, lưu vào docs/ghep/.
Chạy: python3 tests/ghep_shots.py [tên ảnh ...]   (không ghi tên thì chụp đủ sáu ảnh)
Cần Playwright và Pillow (Pillow chỉ dùng để ghép nhiều ảnh thành một tấm)."""
import io, os, sys
from playwright.sync_api import sync_playwright
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(os.path.dirname(ROOT), 'docs', 'ghep')
VW, VH = 992, 540  # khung game 480x270 phóng đúng 2 lần, lề 16 mỗi bên

# Đồ dùng chung trong trang: bot giả bấm nút, chạy từng khung có vẽ.
LIB = r"""
(() => {
  const T = (window.T = {});
  T.inp = {};
  G.botInput = () => Object.assign({ mx: 0, my: 0 }, T.inp);
  T.frame = (n, i) => { for (let k = 0; k < (n || 1); k++) { if (i) T.inp = Object.assign({}, i); G.tick(); G.ui.begin(); G.scene.draw(); G.click = null; for (const q of ['atkP', 'dodgeP', 'specialP', 'skillP', 'swapP']) delete T.inp[q]; } };
  // Dừng vòng lặp thật của game để ảnh chụp đúng khung vừa dựng.
  T.freeze = () => { const s = G.scene; G.scene = { update() {}, draw() { s.draw(); }, hide() {} }; T.real = s; };
  T.thaw = () => { if (T.real) G.scene = T.real; T.real = null; };
  T.dummy = (x, y, role, hp) => { const e = G.spawnEnemy(role || 'rusher', x, y, { hpMult: hp || 60 }); e.st.stun = 1e9; e.inside = true; e.face = -1; return e; };
  // Vào một phòng đánh, hero đứng giữa, vài con quái đứng trước mặt.
  T.fight = function (o) {
    T.thaw(); G.pointers.clear();
    G.testSave(Object.assign({ lvl: 12 }, o.save));
    for (const w of G.save.weapons) { if (o.family != null) w.family = o.family[w.type === 'bow' ? 1 : 0]; G.fitAffixes(w); }
    if (o.gear) { G.save.owned.helm = [o.gear[0]]; G.save.helm = o.gear[0]; G.save.owned.armor = [o.gear[1]]; G.save.armor = o.gear[1]; }
    G.rnd = G.srand(o.seed || 3);
    G.startStage(o.region || 0, 2, 0);
    const S = G.getRun(), W = G.getWorld(), P = S.P;
    W.waves = []; W.props = []; S.hint = null;
    if (o.bow) P.cur = 1;
    T.inp = {}; T.frame(8); W.banner = null; if (P.mv) { P.mv.tips = { sword: 1, bow: 1, spear: 1, hammer: 1 }; P.mv.tipWait = null; }
    P.x = o.x || 200; P.y = 196; P.face = 1; P.inv = 0; P.mana = P.maxmana; P.hp = P.maxhp;
    for (const d of o.dummies || [[236, 196], [252, 184], [258, 208]]) T.dummy(d[0], d[1], d[2], d[3]);
    W.cam = 0; T.frame(3); W.banner = null;
    return { S, W, P };
  };
  // Giả một ngón tay đang giữ nút (để nút vẽ ở trạng thái đang bấm và có cần điều khiển).
  T.finger = (role, x, y, dx, dy) => { G.pointers.set('t' + role, { id: 't' + role, x: x + (dx || 0), y: y + (dy || 0), sx: x, sy: y, role, stale: false }); };
  T.village = function (tab, extra) {
    T.thaw(); G.pointers.clear();
    G.testSave({ hero: 'smith', lvl: 14, gold: 3200 });
    const sv = G.save; G.rnd = G.srand(11);
    sv.ore = 46; sv.stones = 5; sv.mats = [24, 18, 9]; sv.shards = [6, 4, 0]; sv.forge = 2;
    for (const k of G.HKEYS) { sv.heroes[k].unlocked = k !== 'wrestler'; sv.heroes[k].lvl = k === 'smith' ? 14 : 6; }
    sv.weapons = []; sv.nextId = 1;
    const mk = (type, r, fam, el, marks, sharpen, gold) => { const w = G.newWeapon(sv, type, r, { family: fam, gold: gold || 0 }); if (el) { w.marks[el] = marks; if (marks >= 30) w.branch = el; } w.sharpen = sharpen || 0; return w; };
    const a = mk('sword', 2, 3, 'fire', 190, 4), b = mk('bow', 1, 0, 'ice', 64, 2);
    mk('hammer', 3, 5, 'poison', 320, 5, 0); mk('spear', 0, 0, 'fire', 130, 1); mk('sword', 0, 6, null, 0, 0); mk('bow', 2, 9, 'fire', 12, 0);
    mk('hammer', 1, 2, null, 0, 0); mk('spear', 3, 5, 'ice', 150, 3, 1); mk('sword', 1, 8, 'poison', 40, 0); mk('spear', 2, 6, null, 0, 0);
    sv.carry = [a.id, b.id];
    sv.owned.helm = ['h_r1']; sv.helm = 'h_r1'; sv.owned.armor = ['a_r1']; sv.armor = 'a_r1';
    for (let r = 0; r < 2; r++) for (let i = 0; i < 5; i++) sv.stars[r + '-' + i] = 2;
    G.setScene(G.Village);
    const V = G.villageApi.V; V.tab = tab; V.sel = null; V.page = 0;
    if (extra) extra(V, sv);
    G.rnd = Math.random;
    T.frame(2);
  };
})();
"""

SHOTS = {}


def shot(name):
    def deco(fn):
        SHOTS[name] = fn
        return fn
    return deco


def grab(pg):
    pg.evaluate("T.freeze()")
    pg.wait_for_timeout(120)
    im = Image.open(io.BytesIO(pg.screenshot()))
    pg.evaluate("T.thaw()")
    return im.convert('RGB')


def stack(images, cols, gap=6, bg=(18, 13, 16)):
    w, h = images[0].size
    rows = (len(images) + cols - 1) // cols
    out = Image.new('RGB', (cols * w + (cols - 1) * gap, rows * h + (rows - 1) * gap), bg)
    for i, im in enumerate(images):
        out.paste(im, ((i % cols) * (w + gap), (i // cols) * (h + gap)))
    return out


@shot('tran-danh')
def tran_danh(pg):
    # Thợ Rèn và thanh Gươm Rồng hệ Lửa (Tím, Thành hình) đang chém nhát kết; ngón tay giữ nút Đánh và cần điều khiển.
    pg.evaluate("""() => {
      const { P } = T.fight({ save: { hero: 'smith', melee: 'sword', tier: 2, branch: 'fire', marks: 190, sharpen: 3 }, family: [3, 0], gear: ['h_r1', 'a_r1'],
        dummies: [[236, 196, 'rusher', 40], [254, 184, 'shield', 40], [262, 210, 'rusher', 40], [300, 196, 'archer', 40]] });
      const b = G.stageUi.btnPos('atk'); T.finger('atk', b[0], b[1]); T.finger('joy', 62, 216, 14, -4);
      let hits = 0, n = 0;
      while (n++ < 400) { T.frame(1, { atk: true, mx: 0 }); if (P.mv.kind === 'chem' && P.mv.step === 2 && P.mv.prog > 0.38) break; }
    }""")
    return grab(pg)


@shot('bon-hero-trong-tran')
def bon_hero(pg):
    ims = []
    cases = [
        # (bản lưu, dòng [cận chiến, cung], dùng cung?, cách dựng khung)
        ("{ hero: 'smith', melee: 'sword', tier: 1, branch: 'fire', marks: 320 }", '[0, 3]', False,
         "while (n++ < 300) { T.frame(1, { atk: true }); if (P.mv.kind === 'chem' && P.mv.step === 1 && P.hitDone) break; }"),
        ("{ hero: 'hunter', melee: 'spear', tier: 2, branch: 'ice', marks: 130 }", '[2, 0]', True,
         "T.frame(40, { atk: true });"),
        ("{ hero: 'healer', melee: 'spear', tier: 1, branch: 'poison', marks: 130 }", '[5, 3]', False,
         "for (let k = 0; k < 4; k++) { T.frame(2, { atk: true, atkP: true }); T.frame(1, {}); let m = 0; while (P.atkT > 0 && m++ < 200) { if (k === 3 && P.mv.kind === 'quet' && P.mv.prog > 0.4) break; T.frame(1, {}); } }"),
        ("{ hero: 'wrestler', melee: 'hammer', tier: 3, branch: 'fire', marks: 130 }", '[5, 3]', False,
         "T.frame(72, { atk: true }); T.frame(1, {}); while (n++ < 60 && !P.hitDone) T.frame(1, {}); T.frame(3, {});"),
    ]
    for save, fam, bow, play in cases:
        pg.evaluate("""() => {
          const { P } = T.fight({ save: %s, family: %s, bow: %s, region: %d, dummies: %s });
          const b = G.stageUi.btnPos('atk'); T.finger('atk', b[0], b[1]);
          let n = 0;
          %s
        }""" % (save, fam, 'true' if bow else 'false', len(ims) % 3,
                '[[300, 196], [322, 186], [330, 206]]' if bow else '[[238, 196], [250, 182], [256, 210], [176, 200]]' if 'quet' in play else '[[238, 196], [250, 182], [256, 210]]', play))
        ims.append(grab(pg))
    return stack(ims, 2)


@shot('lo-ren-bon-bac')
def lo_ren(pg):
    # Hai khung: chọn một món Tím (đang lên Vàng, chọn mảnh trùm) và chọn một món Thường (lên Lam).
    ims = []
    for pick in ["(w) => w.rarity === 2 && w.type === 'bow'", "(w) => w.rarity === 0 && w.type === 'spear'"]:
        pg.evaluate("(f) => T.village('forge', (V, sv) => { V.ftab = 'tier'; V.sel = sv.weapons.find(eval(f)).id; })", pick)
        ims.append(grab(pg))
    return stack(ims, 1)


@shot('kho-do')
def kho_do(pg):
    ims = []
    pg.evaluate("T.village('gear', (V, sv) => { V.sel = sv.weapons.find((w) => w.rarity === 3).id; })")
    ims.append(grab(pg))
    # bảng rương báu trong ải và bảng kết quả khi trùm vùng rơi Vàng: phần thưởng cũng dùng hình vũ khí sống
    pg.evaluate("""() => { T.thaw(); G.testSave({ hero: 'smith', lvl: 20 }); G.rnd = G.srand(21); G.startStage(1, 4, 0);
      const S = G.getRun(); S.W.waves = []; G.onEliteDown({}); G.onEliteDown({}); G.onEliteDown({}); G.onEliteDown({});
      G.gotoRoom(S.rooms.length - 1); G.damage(G.getWorld().boss, 1e12, { el: 'ice' }); T.frame(130, {}); G.rnd = Math.random; }""")
    ims.append(grab(pg))
    return stack(ims, 1)


@shot('mo-dac-trung')
def mo_dac_trung(pg):
    ims = []
    # Khung 1: kiếm Lửa vừa đủ 300 dấu ấn giữa trận: thông báo Thức tỉnh kèm tên đặc trưng 2, quái đang cháy chết thì nổ lan.
    pg.evaluate("""() => {
      const { P, W } = T.fight({ save: { hero: 'smith', melee: 'sword', tier: 2, branch: 'fire', marks: 299.5, sharpen: 2 }, family: [3, 0],
        dummies: [[234, 196, 'rusher', 0.05], [262, 196, 'rusher', 0.08], [288, 190, 'rusher', 0.08], [276, 212, 'swarm', 0.3], [322, 198, 'shield', 30]] });
      for (const e of W.ents) G.applyStatus(e, 'fire', 4);
      let n = 0;
      while (n++ < 900 && G.wStage(G.curW(P)) < 3) T.frame(1, { atk: true });
      T.frame(7, { atk: true });
    }""")
    ims.append(grab(pg))
    # Khung 2: màn xem vũ khí ở làng liệt kê đặc trưng đã mở và sắp mở.
    pg.evaluate("T.village('weapon', (V, sv) => { V.wid = sv.carry[0]; V.back = 'gear'; })")
    ims.append(grab(pg))
    return stack(ims, 1)


@shot('lang')
def lang(pg):
    ims = []
    pg.evaluate("T.village('hub')")
    ims.append(grab(pg))
    pg.evaluate("T.village('hero')")
    ims.append(grab(pg))
    return stack(ims, 1)


def main():
    names = [a for a in sys.argv[1:] if a in SHOTS] or list(SHOTS)
    os.makedirs(OUT, exist_ok=True)
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': VW, 'height': VH})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'ERR_' not in m.text and 'fonts.g' not in m.text else None)
        pg.goto('file://' + ROOT + '/index.html')
        pg.wait_for_function('window.G && G.scene')
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
        pg.evaluate(LIB)
        for n in names:
            im = SHOTS[n](pg)
            path = os.path.join(OUT, n + '.png')
            im.save(path, optimize=True)
            print('đã chụp', os.path.relpath(path, os.path.dirname(ROOT)), im.size)
        b.close()
    if errs:
        print('LỖI TRANG:', errs[:5])
        sys.exit(1)


main()
