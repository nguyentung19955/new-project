"""Chụp ảnh và GIF cho hiệu ứng đạn và phần hiển thị linh khí vào docs/dan-va-linh-khi/ (cần Pillow).
Chạy: python3 tests/dan_linhkhi_shots.py"""
import io, os, sys
from playwright.sync_api import sync_playwright
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(os.path.dirname(ROOT), 'docs', 'dan-va-linh-khi')
os.makedirs(OUT, exist_ok=True)
SC = 2  # ảnh chụp: 844x390 điểm, mật độ 2

ROOM = r"""
([r, o]) => {
  G.testSave(Object.assign({ hero: 'smith', lvl: 12, tier: 2 }, o || {}));
  G.rnd = G.srand(11);
  G.startStage(r, 1, 0);
  const S = G.getRun(), W = G.getWorld(), P = S.P;
  W.waves = []; W.spawns = []; W.ents.length = 0; W.banner = null; S.hint = null;
  P.inv = 1e9;
  window.FR(20);
  W.banner = null;
  return [W.geo.fx0, W.geo.fy0, W.geo.fx1, W.geo.fy1];
}
"""
MOB = r"""
([role, el, x, y, hp]) => {
  const W = G.getWorld(), g = W.geo, e = G.spawnEnemy(role, g.cx + x, g.cy + y, { hpMult: hp || 1e4 });
  e.inside = true;
  if (el === 'fire') { e.st.fire = 3; e.st.last = 'fire'; }
  if (el === 'poison') { e.st.poisonN = 2; e.st.poisonT = 4; e.st.last = 'poison'; }
  if (el === 'ice') { e.st.iceN = 2; e.st.iceT = 4; e.st.last = 'ice'; }
  return W.ents.length - 1;
}
"""


def main():
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=SC)
        pg = ctx.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + ROOT + '/index.html')
        pg.wait_for_function('window.G && G.scene')
        pg.wait_for_timeout(300)
        pg.evaluate("window.requestAnimationFrame = () => 0")
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'bot.js'))
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
        pg.evaluate("window.FR = (n) => { for (let i = 0; i < n; i++) { G.tick(); G.ui.begin(); G.scene.draw(); G.click = null; } }")
        ev = pg.evaluate

        def grab():
            return Image.open(io.BytesIO(pg.screenshot())).convert('RGB')

        # toạ độ game (480x270) -> điểm ảnh của ảnh chụp
        def box(x0, y0, x1, y1):
            k = 390 / 270 * SC
            ox = (844 * SC - 480 * k) / 2
            return (int(ox + x0 * k), int(y0 * k), int(ox + x1 * k), int(y1 * k))

        def gif(name, frames, step, crop, scale=1.0, ms=50):
            ims = []
            for i in range(frames):
                ev(f"FR({step})")
                im = grab().crop(crop)
                if scale != 1.0:
                    im = im.resize((int(im.width * scale), int(im.height * scale)), Image.LANCZOS)
                ims.append(im.convert('P', palette=Image.ADAPTIVE, colors=128))
            ims[0].save(os.path.join(OUT, name), save_all=True, append_images=ims[1:], duration=ms, loop=0, optimize=True)
            print('đã lưu', name)

        def save(im, name):
            im.save(os.path.join(OUT, name)); print('đã lưu', name)

        # ---------- 1. mỗi loại đạn ở ba vùng (đạn đứng yên để nhìn rõ hình) ----------
        rows = []
        for r in [0, 1, 2]:
            ev(ROOM, [r, {}])
            ev(r"""() => {
              const W = G.getWorld(), g = W.geo, cy = g.cy - 20;
              const kinds = [['orb', null], ['orb', 'poison'], ['orb', 'ice'], ['spike', 'ice'], ['spike', 'poison'], ['spike', null], ['fire', 'fire'], ['bua', 'poison'], ['fruit', null]];
              kinds.forEach((k, i) => { const a = -0.5 + i * 0.35; W.projs.push({ team: 'enemy', kind: k[0], el: k[1], x: g.cx - 92 + i * 23, y: cy, vx: Math.cos(a) * 2, vy: Math.sin(a) * 2, t: 99, dmg: 0, src: null, z: 12 }); });
              const P = G.getRun().P; P.x = g.cx; P.y = g.fy1 - 20;
              FR(30);
            }""")
            rows.append(grab().crop(box(136, 22, 344, 52)))
        # mũi tên của mình: thường, mang hệ Lửa/Độc/Băng, giữ rồi thả (to)
        ev(ROOM, [1, {}])
        ev(r"""() => {
          const W = G.getWorld(), g = W.geo, P = G.getRun().P, w = G.curW(P);
          P.x = g.cx; P.y = g.fy1 - 20;
          const he = [null, 'fire', 'poison', 'ice', 'fire'];
          he.forEach((el, i) => W.projs.push({ team: 'player', kind: 'arrow', x: g.cx - 80 + i * 40, y: g.cy + 10, vx: 6, vy: -1.5, t: 99, w, mult: 0, pierce: 0, big: i === 4, col: el ? G.EL[el].col : '#f1ead9', seen: [], z: 11, he: el ? { el, lv: 2 } : null }));
          FR(30);
        }""")
        rows.append(grab().crop(box(136, 50, 344, 80)))
        wd = rows[0].width
        sheet = Image.new('RGB', (wd, sum(r.height for r in rows)))
        y = 0
        for r in rows:
            sheet.paste(r, (0, y)); y += r.height
        save(sheet, '01-dan-tung-loai.png')

        # ---------- 2. đạn bay và trúng: quái bắn xa, tinh anh bắn vòng, tên của mình trúng quái ----------
        for r, name in [(2, '02-dan-lau-dai.gif'), (1, '03-dan-hang-bien.gif'), (0, '04-dan-rung-gia.gif')]:
            ev(ROOM, [r, {'branch': ['poison', 'ice', 'fire'][r], 'marks': 140}])
            ev(r"""(r) => {
              const W = G.getWorld(), g = W.geo, P = G.getRun().P;
              P.x = g.cx - 60; P.y = g.cy + 30;
              const kinds = r === 2 ? ['fire', 'bua', 'orb', 'fruit'] : r === 1 ? ['orb', 'spike', 'orb', 'spike'] : ['orb', 'fruit', 'spike', 'orb'];
              const els = r === 2 ? ['fire', 'poison', null, null] : r === 1 ? [null, 'ice', 'ice', null] : [null, null, 'poison', 'poison'];
              let k = 0;
              window.SHOOT = () => {
                const a0 = Math.atan2(P.y - (g.cy - 50), P.x - (g.cx + 70));
                for (let i = -2; i <= 2; i++) { const a = a0 + i * 0.28; W.projs.push({ team: 'enemy', kind: kinds[k % 4], el: els[k % 4], x: g.cx + 70, y: g.cy - 50, vx: Math.cos(a) * 95, vy: Math.sin(a) * 95, t: 3, dmg: 1, src: null, z: 12 }); }
                k++;
              };
              const e = G.spawnEnemy('shield', g.cx + 40, g.cy + 30, { hpMult: 1e4 }); e.inside = true; e.st.stun = 1e9;
              window.ARROW = (big) => { const w = G.curW(P); if (w.type !== 'bow') P.cur = 1 - P.cur; const ww = G.curW(P); const el = ww.branch;
                W.projs.push({ team: 'player', kind: 'arrow', x: P.x + 8, y: P.y, px: P.x, py: P.y, vx: 270, vy: 0, t: 1.3, w: ww, mult: 1, pierce: 0, big: !!big, col: el ? G.EL[el].col : '#f1ead9', seen: [], z: 11, he: el ? { el, lv: 2 } : null }); };
              SHOOT(); FR(3);
            }""", r)
            frames = []
            for i in range(44):
                if i % 11 == 0: ev("SHOOT()")
                if i % 8 == 2: ev(f"ARROW({str(i % 16 == 10).lower()})")
                ev("FR(2)")
                frames.append(grab().crop(box(120, 40, 360, 240)).resize((480, 400), Image.LANCZOS).convert('P', palette=Image.ADAPTIVE, colors=128))
            frames[0].save(os.path.join(OUT, name), save_all=True, append_images=frames[1:], duration=40, loop=0, optimize=True)
            print('đã lưu', name)
            if r == 2:
                save(grab().crop(box(120, 40, 360, 240)), '05-dan-trung-anh.png')

        # ---------- 3. linh khí trong trận: kết liễu quái đang cháy, hạt sáng bay vào vạch, "+1 Lửa" ----------
        ev(ROOM, [1, {'branch': 'fire', 'marks': 112}])
        ev("() => { const w = G.curW(G.getRun().P); w.marks.poison = 14; w.marks.ice = 6; }")
        for spec in [['rusher', 'fire', -50, -10], ['archer', 'poison', 10, -30], ['shield', 'ice', 50, 10], ['rusher', None, -10, 30]]:
            ev(MOB, spec)
        ev("FR(40)")
        save(grab(), '06-linh-khi-trong-tran.png')
        save(grab().crop(box(330, 0, 480, 70)).resize((600, 280), Image.NEAREST), '07-vach-linh-khi-phong-to.png')
        frames = []
        for i in range(60):
            if i == 4: ev("() => { const W = G.getWorld(); const e = W.ents.find((q) => q.st.fire > 0); G.kill(e, {}); }")
            if i == 30: ev("() => { const W = G.getWorld(); const e = W.ents.find((q) => q.st.fire > 0 || q.st.poisonN > 0) || W.ents[0]; e.st.fire = 3; e.st.last = 'fire'; G.kill(e, {}); }")
            ev("FR(2)")
            frames.append(grab().crop(box(150, 0, 480, 150)).resize((660, 300), Image.LANCZOS).convert('P', palette=Image.ADAPTIVE, colors=160))
        frames[0].save(os.path.join(OUT, '08-nhan-dau-an.gif'), save_all=True, append_images=frames[1:], duration=45, loop=0, optimize=True)
        print('đã lưu 08-nhan-dau-an.gif')
        # sắp đạt mốc: vạch nhấp nháy
        ev("() => { G.curW(G.getRun().P).marks.fire = 117; }")
        frames = []
        for i in range(16):
            ev("FR(4)")
            frames.append(grab().crop(box(366, 36, 480, 58)).resize((456, 88), Image.NEAREST).convert('P', palette=Image.ADAPTIVE, colors=64))
        frames[0].save(os.path.join(OUT, '09-sap-dat-moc.gif'), save_all=True, append_images=frames[1:], duration=70, loop=0, optimize=True)
        print('đã lưu 09-sap-dat-moc.gif')

        # ---------- 4. màn kết quả ----------
        ev(ROOM, [1, {'branch': 'fire', 'marks': 96}])
        ev(r"""() => {
          const S = G.getRun(), P = S.P, W = G.getWorld();
          const kill = (el, w) => { const e = G.spawnEnemy('rusher', W.geo.cx, W.geo.cy, { hpMult: 10 }); e.inside = true;
            if (el === 'fire') { e.st.fire = 3; e.st.last = 'fire'; } else if (el === 'poison') { e.st.poisonN = 1; e.st.poisonT = 3; e.st.last = 'poison'; } else { e.st.iceN = 1; e.st.iceT = 3; e.st.last = 'ice'; }
            G.kill(e, { w }); };
          for (let i = 0; i < 9; i++) kill('fire', P.weapons[0]);
          for (let i = 0; i < 3; i++) kill('poison', P.weapons[0]);
          for (let i = 0; i < 4; i++) kill('ice', P.weapons[1]);
          FR(60);
          S.got.push('3 quặng');
          G.gotoRoom(S.rooms.length - 1); G.finishStage(true); FR(40);
        }""")
        save(grab(), '10-man-ket-qua.png')

        # ---------- 5. xem vũ khí, thợ rèn, Cụ Đồ (ở làng, chạy theo thời gian thật) ----------
        ev(r"""() => { G.testSave({ hero: 'smith', lvl: 12, tier: 2, branch: 'fire', marks: 140, affixes: ['crit', 'mana'] });
          const w = G.weaponById(G.save.carry[0]); w.marks.poison = 18; w.marks.ice = 4;
          const b = G.weaponById(G.save.carry[1]); b.branch = null; b.marks = { fire: 3, poison: 26, ice: 11 };
          G.save.gold = 999; G.setScene(G.Village); }""")
        V, VS = 'G.villageApi.V', 'G.villageScene'
        def frames_now(n=20):
            ev(f"FR({n})")
        frames_now(60)
        ev(f"{VS}.onWeapon(G.save.carry[0])"); ev(f"{V}.wvTab = 'lk'"); frames_now(); save(grab(), '11-xem-vu-khi-linh-khi.png')
        ev(f"{V}.wid = G.save.carry[1]"); frames_now(); save(grab(), '12-xem-vu-khi-chua-khoa-he.png')
        ev("G.keyP.Escape = true"); frames_now(5)
        ev(f"{VS}.goNpc('ren', true)"); frames_now(30)
        ev(f"{V}.ftab = 'sharpen'; {V}.sel = G.save.carry[0]"); frames_now(); save(grab(), '13-tho-ren-xem-linh-khi.png')
        ev("G.keyP.Escape = true"); frames_now(5)
        ev(f"{VS}.goNpc('do', true)"); frames_now(30)
        ev(f"""() => {{ {V}.tab = 'help'; for (let i = 0; i < 12; i++) {{ {V}.page = i; const t0 = G.ui.text; let f = false; G.ui.text = function (s) {{ if (String(s).includes('Linh khí: dấu ấn')) f = true; return t0.apply(this, arguments); }}; G.ui.begin(); G.scene.draw(); G.ui.text = t0; if (f) return i; }} }}""")
        frames_now(); save(grab(), '14-cu-do-trang-linh-khi.png')
        print('lỗi trang:', errs, 'lỗi vẽ:', ev('G.fx.errs'))
        b.close()


if __name__ == '__main__':
    main()
