"""Kiểm đòn theo vũ khí của thân bộ trên bản HAI TỆP (như web). Cần srv2.py phục vụ game/dist ở cổng 8790:
  python3 ../../full-audit/A-nhan-vat/kiem/srv2.py game/dist 8790 &
  python3 kiem.py <thư mục ảnh> [key] [bo ...]
Ra: <bo>-sau.png / <bo>-truoc.png (phóng ×4: 4 vũ khí × các tư thế; 'trước' = gỡ tệp đòn của thân bộ ngay trong trang),
tran-<bo>-<vk>.png (chơi thật ải 1-1, mặc đủ bộ), số đo cỡ thân, pageerror."""
import sys, os, json
A = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'full-audit', 'A-nhan-vat', 'kiem'))
sys.path.insert(0, A)
from lib import *
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
KEY = sys.argv[2] if len(sys.argv) > 2 else 'smith'
BOS = sys.argv[3:] or ['rung', 'bien', 'lau']
POSE = ['đứng 0', 'chạy 2', 'chạy+đánh', 'giữ 0.1', 'giữ 0.6', 'giữ 1', 'chưởng 0.3', 'chưởng 0.1']
def ds_tu_the(wt):
    d = ['đứng 0', 'chạy 2']
    d += (['chém %d/%s' % (c, u) for c in (0, 1, 2) for u in ('0.2', '0.6')] if wt == 'sword' else ['đánh %s' % u for u in ('0.05', '0.2', '0.35', '0.5', '0.65', '0.85')])
    return d + POSE[2:]
VE = """([key, bo, wts, ten, Z]) => { const A = AUD, n = Math.max(...wts.map(w => ten[w].length));
  const cv = document.createElement('canvas'); cv.width = 64 * Z * n; cv.height = (64 * Z + 16) * wts.length; const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
  c.fillStyle = '#4a6b3c'; c.fillRect(0, 0, cv.width, cv.height);
  const t = document.createElement('canvas'); t.width = 64; t.height = 64; const x = t.getContext('2d'); const ghi = [];
  wts.forEach((wt, r) => { const L = A.tuThe(wt); ten[wt].forEach((nm, i) => { const po = L.find(q => q[0] === nm); if (!po) return;
    const o = A.oCua(key, A.outfit(bo, {}), wt, 1, po); const e = A.ve(x, o); let s = null; try { s = G.spriteCustom.chonEmBe(G.spriteCustom.cuaEmBe(key, o), o); } catch (er) {}
    const sp = G.spriteCustom.cuaEmBe(key, o); ghi.push([wt, nm, sp && sp.ma, s && s.ten, s && s.i, e]);
    c.drawImage(t, i * 64 * Z, r * (64 * Z + 16) + 16, 64 * Z, 64 * Z); c.fillStyle = '#fff'; c.font = '13px sans-serif'; c.fillText(wt + ' · ' + nm + (s ? ' [' + s.ten + ' ' + s.i + ']' : '') + (e ? ' LỖI' : ''), i * 64 * Z + 4, r * (64 * Z + 16) + 12); }); });
  return { url: cv.toDataURL(), ghi }; }"""
GO = """(goc) => { const SC = G.spriteCustom, sp = SC.ds[goc]; if (!sp || !SC.don[goc]) return false;
  if (sp.img0) sp.img = sp.img0; for (const k in sp.donHang || {}) delete sp.dt[k]; sp.img0 = null; sp.donMa = null; sp.donHang = null;
  delete sp.mn; sp.khop = {}; sp.mau = {}; sp.than = {}; sp.giu = {}; sp.ngucC = {}; sp.tayC = {}; sp.aoC = {}; delete sp.matC; delete sp.tayBang; delete SC.don[goc]; return true; }"""
wts = ['sword', 'bow', 'spear', 'hammer']
ten = {w: ds_tu_the(w) for w in wts}
with sync_playwright() as p:
    b, pg, errs = mo(p); pg.add_script_tag(path=os.path.join(A, 'tu_the.js'))
    info = pg.evaluate("""(key) => { const SC = G.spriteCustom, o = {}; for (const b of ['rung', 'bien', 'lau']) { const sp = SC.ds['em-be-' + key + '-' + b]; o[b] = sp ? { ready: sp.ready, don: sp.donMa, hang: Object.keys(sp.dt) } : null; } return o; }""", KEY)
    print(json.dumps(info, ensure_ascii=False))
    for bo in BOS:
        r = pg.evaluate(VE, [KEY, bo, wts, ten, 4]); luu_png(r['url'], os.path.join(OUT, '%s-%s-sau.png' % (KEY, bo)), 0.9)
        print(bo, 'sau', [g for g in r['ghi'] if g[5]] or 'không lỗi vẽ', sorted(set(g[3] for g in r['ghi'])))
        # cỡ thân trên tấm ghép: chiều cao khung đứng / đòn
        h = pg.evaluate("""(ma) => { const sp = G.spriteCustom.ds[ma]; const N = sp.net, cv = document.createElement('canvas'); cv.width = sp.img.width; cv.height = sp.img.height; const x = cv.getContext('2d'); x.drawImage(sp.img, 0, 0); const d = x.getImageData(0, 0, cv.width, cv.height).data, o = {};
          for (const k of ['idle', 'move', 'atk', 'atk_sword', 'atk_bow', 'atk_spear', 'atk_hammer', 'cast']) { const a = sp.dt[k]; if (!a) continue; o[k] = []; for (let i = 0; i < a.so; i++) { let t = 1e9, bt = -1; for (let y = 0; y < sp.fh * N; y++) for (let q = 0; q < sp.fw * N; q++) if (d[(((a.hang * sp.fh * N) + y) * cv.width + i * sp.fw * N + q) * 4 + 3] > 127) { t = Math.min(t, y); bt = Math.max(bt, y); } o[k].push([bt - t + 1, bt]); } } return o; }""", 'em-be-%s-%s' % (KEY, bo))
        print(bo, 'cao/đáy khung (nét×2):', json.dumps(h))
    for bo in BOS:
        if pg.evaluate(GO, 'em-be-%s-%s' % (KEY, bo)):
            r = pg.evaluate(VE, [KEY, bo, wts, ten, 4]); luu_png(r['url'], os.path.join(OUT, '%s-%s-truoc.png' % (KEY, bo)), 0.9)
    b.close()
    # chơi thật: mặc đủ bộ, 4 vũ khí + chưởng, bot đánh
    b, pg, errs2 = mo(p, 844, 390)
    pg.add_script_tag(path='/home/claude/new-project/game/tests/bot.js')
    SET = {'rung': ['mu_sung', 'ao_vo_cay', 'gui_tre', 'bua_nanh'], 'bien': None, 'lau': None}
    for bo in BOS:
        for wt in wts:
            r = pg.evaluate("""([k, wt, bo]) => { G.resetSave(); const sv = G.save; sv.sound = false; if (sv.tut) sv.tut.done = true;
              for (const h of G.HKEYS) { sv.heroes[h].unlocked = true; sv.heroes[h].lvl = 8; } sv.hero = k; if ('active' in sv) sv.active = k;
              const w = G.weaponById(sv.carry[0]); if (w) { w.type = wt; w.family = 2; w.tier = 1; }
              const O = G.outfit, I = O.ITEMS || O.I || {}; const ds = [];
              for (const id in I) if (I[id].set === bo && I[id].slot !== 'wing') ds.push(id);
              if (!ds.length) for (const id of { rung: ['mu_sung','ao_vo_cay','gui_tre','bua_nanh'], bien: ['ao_vay'], lau: ['ao_long'] }[bo]) ds.push(id);
              for (const id of ds) { const it = O.add(sv, id, 1, { quiet: true }); if (it) O.wear(sv, it); }
              G.startStage(0, 0, 0); return ds; }""", [KEY, wt, bo])
            for s in range(5):
                pg.evaluate("() => { try { G.botRun(1.5); } catch (e) { console.error(e); } }"); pg.wait_for_timeout(600)
            st = pg.evaluate("""(k) => { const W = G.getWorld && G.getWorld(), p = W && W.P; const o = { key: k, p, outfit: p && p.outfit }; const sp = G.spriteCustom.cuaEmBe(k, o); return { than: sp && sp.ma, don: sp && sp.donMa, bo_than: p && p.outfit && p.outfit.fx && p.outfit.fx.bo_than }; }""", KEY)
            pg.screenshot(path=os.path.join(OUT, 'tran-%s-%s.png' % (bo, wt)))
            print('trận', bo, wt, r, st)
    print('pageerror:', errs + errs2 or 'không có')
    b.close()
