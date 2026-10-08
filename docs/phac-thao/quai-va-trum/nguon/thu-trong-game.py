# Thử hình quái và trùm mới ngay trong game mà KHÔNG sửa file nào của game:
# tạo một bản sao tạm của thư mục game, chèn thêm dòng nạp js/monster_art.js sau art.js, ép cảnh cần xem rồi chụp canvas thế giới.
# Dùng: python3 thu-trong-game.py '<json cấu hình>' ra.png|ra.gif
# Cấu hình: r (vùng 0..2), i (ải 0..4; 4 là trùm vùng, 0..3 là trùm nhỏ), room ("last" là phòng trùm), px, py, hold (ghim người chơi),
#   keepBoss (giữ máu trùm tối thiểu), ticks (60 mỗi giây), from, every (lấy khung nào), cols, zoom, crop [x0,y0,x1,y1], ms (cho GIF),
#   stats (cách chơi để trùm sinh dạng thích nghi, ví dụ {"el":{"fire":300},"ranged":300,"dodges":30}),
#   mons (thả quái: [[vai, x, y], ...]), old (true: tháo hình mới, xem lại hình cũ),
#   debug: [[tick, tên đòn]] ép trùm ra đòn; [tick, "hp", 0.5] đặt máu; [tick, "kill"] hạ trùm; [tick, "hit"]; [tick, "status", "ice"].
# Ví dụ GIF trận Ngư Tinh có trong BAO-CAO.md.
import sys, json, base64, io, os, shutil, tempfile
from PIL import Image
from playwright.sync_api import sync_playwright
GOC = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'game'))
TAM = os.path.join(tempfile.mkdtemp(prefix='linhkhi-thu-'), 'game')
shutil.copytree(GOC, TAM, ignore=shutil.ignore_patterns('dist'))
_h = open(os.path.join(TAM, 'index.html'), encoding='utf-8').read()
assert '<script src="js/art.js"></script>' in _h
open(os.path.join(TAM, 'index.html'), 'w', encoding='utf-8').write(_h.replace('<script src="js/art.js"></script>', '<script src="js/art.js"></script>\n<script src="js/monster_art.js"></script>'))
cfg = json.loads(sys.argv[1]); out = sys.argv[2]
JS = """async (cfg) => {
  window.requestAnimationFrame = () => 0;
  G.resetSave(); const sv = G.save; sv.sound = false; if (sv.tut) sv.tut.done = true;
  for (const k of G.HKEYS) { sv.heroes[k].unlocked = true; sv.heroes[k].lvl = 12; }
  if (cfg.old) G.monsterArt.unhook();
  G.startStage(cfg.r, cfg.i == null ? 1 : cfg.i, 0);
  const S = G.getRun();
  if (cfg.stats) { const st = S.stats; if (cfg.stats.el) Object.assign(st.el, cfg.stats.el); for (const k of ['ranged', 'melee', 'dodges']) if (cfg.stats[k] != null) st[k] = cfg.stats[k]; }
  if (cfg.room != null) G.gotoRoom(cfg.room === 'last' ? S.rooms.length - 1 : cfg.room);
  const frames = [], log = [];
  const W = () => G.getWorld();
  if (cfg.mons) {
    const w = W(); w.ents.length = 0; w.waves = []; w.waveI = 99; w.cleared = false;
    for (const m of cfg.mons) { const e = G.spawnEnemy(m[0], m[1], m[2], m[3] || {}); if (m[4]) Object.assign(e, m[4]); }
  }
  if (cfg.px != null) { W().P.x = cfg.px; if (cfg.py != null) W().P.y = cfg.py; }
  let t0 = performance.now(), draws = 0, err = null;
  const seq = cfg.debug || [];   // [[tick, tên đòn], ...]
  for (let s = 0; s < cfg.ticks; s++) {
    const w = W(); if (!w) break;
    if (G.getRun() && G.getRun().mode !== 'play') break;
    w.P.hp = w.P.maxhp; w.P.inv = Math.max(w.P.inv || 0, 0.2);
    if (cfg.hold && w.P) { w.P.x = cfg.px; w.P.y = cfg.py == null ? w.P.y : cfg.py; }
    for (const q of seq) if (q[0] === s) { if (q[1] === 'hp') w.boss.hp = w.boss.maxhp * q[2]; else if (q[1] === 'kill') window.__kill = true; else if (q[1] === 'killall') { for (const e of w.ents.slice()) G.damage(e, 1e12, {}); } else if (q[1] === 'hit') { for (const e of w.ents) e.flash = 0.1; if (w.boss) w.boss.flash = 0.1; } else if (q[1] === 'status') { for (const e of w.ents) G.applyStatus(e, q[2], w.P, 3); } else G.bossDebug(q[1]); }
    if (cfg.keepBoss && w.boss && !w.boss.dead && !seq.some((q) => q[1] === 'kill' && q[0] <= s)) w.boss.hp = Math.max(w.boss.hp, w.boss.maxhp * (cfg.keepBoss));
    if (window.__kill && w.boss && !w.boss.dead) { w.boss.hidden = false; try { G.damage(w.boss, 1e12, {}); } catch (e) { w.boss.hp = 0; } }
    try { G.tick(); G.click = null; } catch (e) { err = 'tick: ' + (e.stack || e); break; }
    if (s >= (cfg.from || 0) && (s - (cfg.from || 0)) % (cfg.every || 6) === 0) {
      try { G.ui.begin(); G.scene.draw(); draws++; } catch (e) { err = 'draw: ' + (e.stack || e); break; }
      frames.push(document.getElementById('world').toDataURL());
    }
  }
  const b = W() && W().boss;
  return { frames, err, ms: performance.now() - t0, draws, boss: b ? { kind: b.kind, phase: b.phase, layers: b.layers, hp: b.hp / b.maxhp } : null, cache: G.monsterArt.cacheSize() };
}"""
with sync_playwright() as p:
    br = p.chromium.launch()
    pg = br.new_page(viewport={'width': 844, 'height': 390})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type in ('error', 'warning') and 'ERR_' not in m.text else None)
    pg.goto('file://' + TAM + '/index.html'); pg.wait_for_timeout(900)
    res = pg.evaluate(JS, cfg)
    fr = [Image.open(io.BytesIO(base64.b64decode(u.split(',')[1]))).convert('RGB') for u in res['frames']]
    Z = cfg.get('zoom', 2)
    crop = cfg.get('crop')
    if crop: fr = [f.crop(tuple(crop)) for f in fr]
    fr = [f.resize((f.size[0] * Z, f.size[1] * Z), Image.NEAREST) for f in fr]
    if out.endswith('.gif'):
        fr[0].save(out, save_all=True, append_images=fr[1:], duration=cfg.get('ms', 100), loop=0, optimize=False)
    elif fr:
        cols = cfg.get('cols', 4); rows = (len(fr) + cols - 1) // cols
        sheet = Image.new('RGB', (fr[0].size[0] * cols, fr[0].size[1] * rows), '#000')
        for i, f in enumerate(fr): sheet.paste(f, ((i % cols) * f.size[0], (i // cols) * f.size[1]))
        sheet.save(out)
    print(json.dumps({k: v for k, v in res.items() if k != 'frames'}, ensure_ascii=False)[:900], 'khung', len(fr), 'lỗi', errs[:4])
    br.close()
shutil.rmtree(os.path.dirname(TAM), ignore_errors=True)
