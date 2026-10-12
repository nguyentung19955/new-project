"""Đo FPS / thời gian khung theo cảnh × mức CPU trên bản 2 tệp phục vụ cục bộ (đủ ảnh tải sau).
python3 khung.py <cổng> <ra.json> [giây mỗi cảnh=12] [cpu,...=1,4,6] [profile=1]"""
import json, os, sys, time
from playwright.sync_api import sync_playwright

CONG = int(sys.argv[1]); RA = sys.argv[2]
SEC = int(sys.argv[3]) if len(sys.argv) > 3 else 12
CPUS = [int(x) for x in (sys.argv[4] if len(sys.argv) > 4 else '1,4,6').split(',')]
PROF = (sys.argv[5] if len(sys.argv) > 5 else '1') == '1'
REPO = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'repo', 'game')
URL = 'http://localhost:%d/?cloud=0' % CONG

INIT = r"""(() => {
  // đếm canvas tạo ra + còn sống (FinalizationRegistry), và diện tích điểm ảnh
  const reg = new FinalizationRegistry((a) => { window.__cv.song--; window.__cv.dtSong -= a.v; });
  window.__cv = { tao: 0, song: 0, dtSong: 0, img: 0 };
  const ce = Document.prototype.createElement;
  Document.prototype.createElement = function (t, o) {
    const el = ce.call(this, t, o);
    if (String(t).toLowerCase() === 'canvas') {
      const C = window.__cv; C.tao++; C.song++; const box = { v: 0 }; reg.register(el, box);
      let w = 300, h = 150; C.dtSong += w * h; box.v = w * h;
      Object.defineProperty(el, 'width', { get() { return w; }, set(v) { C.dtSong += (v | 0) * h - w * h; w = v | 0; box.v = w * h; HTMLCanvasElement.prototype.__lookupSetter__('width').call(el, v); }, configurable: true });
      Object.defineProperty(el, 'height', { get() { return h; }, set(v) { C.dtSong += w * (v | 0) - w * h; h = v | 0; box.v = w * h; HTMLCanvasElement.prototype.__lookupSetter__('height').call(el, v); }, configurable: true });
    }
    return el;
  };
  const OI = window.Image; let nImg = 0;
  window.Image = function (a, b) { window.__cv.img++; return new OI(a, b); }; window.Image.prototype = OI.prototype;
  window.__ft = []; let last = 0;
  const loop = (t) => { if (last) window.__ft.push([t, t - last]); last = t; requestAnimationFrame(loop); }; requestAnimationFrame(loop);
  window.__lt = [];
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lt.push([e.startTime, e.duration]); }).observe({ type: 'longtask', buffered: true }); } catch (e) {}
  window.__err = [];
  window.addEventListener('error', (e) => window.__err.push(String(e.message)));
})();"""

SCENES = r"""
(() => {
  const C = (window.__canh = {});
  let timers = [];
  const clear = () => { for (const t of timers) clearInterval(t); timers = []; G.botInput = window.__bot0; };
  window.__bot0 = window.__bot0 || G.botInput;
  const spam = (on) => { const b0 = window.__bot0; G.botInput = function (S) { const i = b0(S); if (on) { i.skillP = true; i.specialP = (G.time * 60 | 0) % 20 === 0; i.atk = true; i.atkP = true; } return i; }; };
  const bat = () => timers.push(setInterval(() => { const S = G.getRun(); if (!S) return; const P = S.P; P.hp = P.maxhp; P.inv = 0.5; P.mana = P.maxmana; if (S.mode === 'dead') S.mode = 'play'; const W = G.getWorld(); if (W) W.over = null; }, 200));
  const fill = (n, roles, hp) => timers.push(setInterval(() => {
    const S = G.getRun(); if (!S || G.scene !== G.StageScene) return;
    const W = G.getWorld(); if (S.mode !== 'play') S.mode = 'play';
    const rw = W.x1 - W.x0 - 20, rh = W.y1 - W.y0 - 30;
    const live = W.ents.filter((e) => !e.dead && !e.isBoss).length;
    for (let i = live; i < n; i++) { const e = G.spawnEnemy(roles[i % roles.length], W.x0 + 10 + (i * 53) % rw, W.y0 + 20 + (i * 37) % rh, { hpMult: hp }); e.inside = true; }
  }, 250));
  C.lang = () => { clear(); G.testSave({ hero: 'smith', melee: 'sword', lvl: 12, tier: 1 }); G.setScene(G.Village); };
  C.phongIt = (r) => { clear(); G.testSave({ hero: 'smith', melee: 'sword', lvl: 12, tier: 1, sharpen: 3, branch: 'fire', marks: 300 });
    G.startStage(r || 0, 1, 0, { kind: 'A', seed: 99 }); const S = G.getRun(); S.fade = 0; S.tut = null; S.hint = null; G.testGoto('fight');
    const W = G.getWorld(); W.waves = []; W.spawns = []; Object.assign(G.botCfg, { explore: false, props: false });
    spam(false); bat(); fill(3, ['rusher', 'archer', 'swarm'], 1e4); };
  C.phongDong = (r, br) => { clear(); G.testSave({ hero: 'smith', melee: 'sword', lvl: 30, tier: 2, sharpen: 6, branch: br || 'fire', marks: 300 });
    G.startStage(r || 0, 2, 0, { kind: 'A', seed: 4242 }); const S = G.getRun(); S.fade = 0; S.tut = null; S.hint = null; G.testGoto('fight');
    const W = G.getWorld(); W.waves = []; W.spawns = []; Object.assign(G.botCfg, { explore: false, props: false });
    spam(true); bat(); fill(14, ['rusher', 'swarm', 'shield', 'kami', 'nimble', 'bomber', 'archer', 'spiky', 'elite'], 1e5); };
  C.trum = (r) => { clear(); G.testSave({ hero: 'smith', melee: 'sword', lvl: 30, tier: 2, sharpen: 6, branch: 'ice', marks: 300 });
    G.startStage(r, 4, 0, { kind: 'A', seed: 3 }); const S = G.getRun(); S.fade = 0; S.tut = null; S.hint = null; G.gotoRoom(S.map.boss);
    Object.assign(G.botCfg, { explore: false, props: false }); spam(true); bat();
    timers.push(setInterval(() => { const W = G.getWorld(), b = W && W.boss; if (b && !b.dead) { b.hp = Math.max(b.hp, b.maxhp * 0.25); } }, 200)); };
  C.dung = clear;
  return Object.keys(C);
})()
"""


def stats(ft):
    v = sorted(x[1] for x in ft)
    n = len(v)
    if not n: return {}
    q = lambda p: round(v[min(n - 1, int(p * n))], 1)
    return {'n': n, 'fps': round(1000 * n / sum(v), 1), 'tb': round(sum(v) / n, 1), 'p95': q(0.95), 'p99': q(0.99), 'max': round(v[-1], 1), 'tren33': sum(1 for x in v if x > 34), 'tren50': sum(1 for x in v if x > 50)}


def main():
    kq = {}
    with sync_playwright() as pw:
        for cpu in CPUS:
            b = pw.chromium.launch(args=['--enable-precise-memory-info', '--js-flags=--expose-gc', '--host-resolver-rules=MAP fonts.googleapis.com 127.0.0.1:9, MAP fonts.gstatic.com 127.0.0.1:9'])
            ctx = b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=3, is_mobile=True, has_touch=True, service_workers='block')
            pg = ctx.new_page()
            errs = []
            pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)[:300]))
            pg.on('console', lambda m: errs.append('console.' + m.type + ': ' + m.text[:200]) if m.type in ('error', 'warning') else None)
            pg.route('**fonts.g**', lambda r: r.abort())
            pg.add_init_script(INIT)
            pg.goto(URL); pg.wait_for_function('window.G && G.scene')
            pg.wait_for_function("G.spriteCustom.sau.tt === 'xong'", timeout=120000)
            pg.wait_for_timeout(3500)
            pg.add_script_tag(path=os.path.join(REPO, 'tests', 'bot.js'))
            pg.add_script_tag(path=os.path.join(REPO, 'tests', 'setup.js'))
            pg.evaluate(SCENES)
            cdp = ctx.new_cdp_session(pg)
            cdp.send('Performance.enable')
            if cpu > 1: cdp.send('Emulation.setCPUThrottlingRate', {'rate': cpu})
            res = {}
            plan = [('lang', 'C.lang()'), ('phong_it_rung', 'C.phongIt(0)'), ('phong_dong_rung_lua', "C.phongDong(0,'fire')"), ('phong_dong_bien_doc', "C.phongDong(1,'poison')"),
                    ('phong_dong_lau_bang', "C.phongDong(2,'ice')"), ('trum_rung', 'C.trum(0)'), ('trum_bien', 'C.trum(1)'), ('trum_lau', 'C.trum(2)')]
            for name, js in plan:
                pg.evaluate('() => { window.__ft = []; window.__lt = []; }')
                m0 = {x['name']: x['value'] for x in cdp.send('Performance.getMetrics')['metrics']}
                t0 = pg.evaluate('performance.now()')
                pg.evaluate('() => { const C = window.__canh; ' + js + '; }')
                prof = PROF and cpu == 4 and name in ('phong_dong_rung_lua', 'trum_lau')
                if prof:
                    pg.wait_for_timeout(2500)
                    cdp.send('Profiler.enable'); cdp.send('Profiler.setSamplingInterval', {'interval': 500}); cdp.send('Profiler.start')
                    pg.wait_for_timeout(max(1000, SEC * 1000 - 2500))
                    pr = cdp.send('Profiler.stop')['profile']
                    json.dump(pr, open(os.path.join(os.path.dirname(RA), 'prof_%s_cpu%d.cpuprofile' % (name, cpu)), 'w'))
                else:
                    pg.wait_for_timeout(SEC * 1000)
                m1 = {x['name']: x['value'] for x in cdp.send('Performance.getMetrics')['metrics']}
                ft = pg.evaluate('window.__ft'); lt = pg.evaluate('window.__lt')
                dau = [x for x in ft if x[0] - t0 < 2000]; sau = [x for x in ft if x[0] - t0 >= 2000]
                info = pg.evaluate("() => ({ cv: Object.assign({}, window.__cv), heap: performance.memory.usedJSHeapSize, ents: G.getWorld && G.getWorld() ? G.getWorld().ents.length : 0, zones: G.getWorld && G.getWorld() ? G.getWorld().zones.length : 0, projs: G.getWorld && G.getWorld() ? G.getWorld().projs.length : 0, fx: G.fx && G.fx.stats ? G.fx.stats() : null, scene: G.scene === G.Village ? 'lang' : G.scene === G.StageScene ? 'ai' : '?', boss: G.getWorld && G.getWorld() && G.getWorld().boss ? G.getWorld().boss.art || G.getWorld().boss.name : null })")
                dur = m1['Timestamp'] - m0['Timestamp']
                res[name] = {'on_dinh_sau_2s': stats(sau), 'hai_giay_dau': stats(dau), 'cpu_ban_pct': round(100 * (m1['TaskDuration'] - m0['TaskDuration']) / dur, 1),
                             'script_pct': round(100 * (m1['ScriptDuration'] - m0['ScriptDuration']) / dur, 1),
                             'longtask': {'so': len(lt), 'max': round(max([x[1] for x in lt] or [0])), 'tong': round(sum(x[1] for x in lt))}, 'luc_cuoi': info}
                print(cpu, name, json.dumps(res[name], ensure_ascii=False), flush=True)
            # tạm dừng: bấm nút tạm dừng qua bot
            pg.evaluate("() => { const C = window.__canh; C.phongIt(0); }")
            pg.wait_for_timeout(1500)
            pg.evaluate("() => { const b0 = window.__bot0; let once = true; G.botInput = (S) => { const i = b0(S); i.pauseP = once; once = false; i.mx = 0; i.my = 0; i.atk = false; return i; }; }")
            pg.wait_for_timeout(1000)
            mode = pg.evaluate('() => G.getRun().mode + "/" + (G.getRun().paused||"")')
            m0 = {x['name']: x['value'] for x in cdp.send('Performance.getMetrics')['metrics']}
            pg.evaluate('() => { window.__ft = []; }'); pg.wait_for_timeout(6000)
            m1 = {x['name']: x['value'] for x in cdp.send('Performance.getMetrics')['metrics']}
            dur = m1['Timestamp'] - m0['Timestamp']
            res['tam_dung'] = {'mode': mode, 'cpu_ban_pct': round(100 * (m1['TaskDuration'] - m0['TaskDuration']) / dur, 1), 'khung': stats(pg.evaluate('window.__ft'))}
            print(cpu, 'tam_dung', json.dumps(res['tam_dung'], ensure_ascii=False), flush=True)
            res['loi'] = errs[:20] + pg.evaluate('window.__err')[:10]
            kq['cpu%d' % cpu] = res
            b.close()
            json.dump(kq, open(RA, 'w'), ensure_ascii=False, indent=1)


main()
