"""Kiểm thân mới của Cái Bống (em-be-healer): bảng tư thế × vũ khí (có/không đồ), làng, Ông Từ, trận với 4 vũ khí.
Chạy từ gốc repo sau `python3 game/build.py`:  SP=<thư mục ảnh tạm> python3 docs/review/ke-hoach-cai-thien/cai-bong/kiem.py"""
import os, re, io, sys, json, base64, subprocess, time
from playwright.sync_api import sync_playwright
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../..')); SP = os.environ.get('SP', '/tmp'); os.makedirs(SP, exist_ok=True)
TU_THE = re.search(r'TU_THE = r"""(.*?)"""', open(R + '/game/tests/don_vk_shots.py').read(), re.S).group(1)
CHO = ("window.G && G.scene && G.spriteCustom && (()=>{const s=G.spriteCustom.get('em-be-healer');return s&&s.img&&s.dt.move&&s.dt.move.so===8})()"
       " && G.spriteCustom.do && G.spriteCustom.do['vk-sword-3'] && G.spriteCustom.do['vk-sword-3'].ready")
BANG = r"""
() => {
  const S = 3, CW = 56, CH = 60;
  const tt = [['đứng', {}], ['chạy 0', { move: true, t: 0.0 }], ['chạy 2', { move: true, t: 0.17 }], ['chạy 4', { move: true, t: 0.33 }], ['chạy 6', { move: true, t: 0.5 }],
    ['đánh', { atk: 0.5, p: { comboI: 0, mv: {}, st: {} } }], ['giữ', { p: { mv: { holding: true, charge: 1 }, st: {} } }], ['trúng', { p: { hurtT: 0.1, st: {} } }], ['lộn', { dodge: 0.4 }]];
  const vk = [['tay không', null], ['kiếm', 'sword'], ['cung', 'bow'], ['giáo', 'spear'], ['búa', 'hammer']];
  const DO = [null, { hat: null, robe: 'ao_vai', back: 'ho_lo', hand: null, mask: null }, { hat: 'non_la', robe: 'ao_la', back: null, hand: 'bua_lua', mask: null }];
  const W = (CW * tt.length + 34) * S, H = (CH * vk.length * 2 + 10) * S, out = document.createElement('canvas'); out.width = W; out.height = H;
  const c = out.getContext('2d'); c.imageSmoothingEnabled = false; c.fillStyle = '#3d5a33'; c.fillRect(0, 0, W, H); c.font = (6 * S) + 'px sans-serif';
  tt.forEach(([n], j) => { c.fillStyle = '#fff'; c.fillText(n, (34 + j * CW + 2) * S, 7 * S); });
  vk.forEach(([ten, wt], r) => [0, 1].forEach((lop) => {
    const y0 = (10 + (r * 2 + lop) * CH) * S; c.fillStyle = '#fff'; c.fillText(ten + (lop ? ' +đồ' : ''), 1 * S, y0 + 30 * S);
    tt.forEach(([n, o], j) => {
      const of = lop ? DO[1 + ((r + j) % 2)] : null, oo = JSON.parse(JSON.stringify(o));
      const tm = oo.t; delete oo.t;
      const cv = window.__VE('healer', wt, Object.assign(oo, tm != null ? { t: tm } : {}), of, CW, CH);
      const x0 = (34 + j * CW) * S; c.fillStyle = (r + lop + j) % 2 ? '#4a6b3c' : '#56704a'; c.fillRect(x0, y0, CW * S, CH * S); c.drawImage(cv, x0, y0, CW * S, CH * S);
    });
  }));
  return out.toDataURL('image/png');
}"""
def nen(path, img, w=None):
    if w and img.width > w: img = img.resize((w, round(img.height * w / img.width)), Image.LANCZOS)
    img.convert('RGB').quantize(128).save(path, optimize=True)
srv = subprocess.Popen(['python3', '-m', 'http.server', '8791'], cwd=R, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
errs = []
try:
  with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=2)
    pg = ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('http://localhost:8791/game/dist/linh-khi.html?cloud=0'); pg.wait_for_function(CHO, timeout=120000); pg.wait_for_timeout(800)
    print('healer:', pg.evaluate("Object.entries(G.spriteCustom.get('em-be-healer').dt).map(([n,a])=>n+'@'+a.hang+'x'+a.so+'/'+a.giay).join(' ')"))
    pg.add_script_tag(path=R + '/game/tests/setup.js'); pg.add_script_tag(content=TU_THE)
    # 1. bảng tư thế (dừng vòng lặp trong lúc vẽ rồi bật lại)
    pg.evaluate("() => { window.__tk = G.tick; G.tick = function () {}; }")
    d = pg.evaluate(BANG); Image.open(io.BytesIO(base64.b64decode(d.split(',')[1]))).save(SP + '/bang.png')
    pg.evaluate("() => { G.tick = window.__tk; }")
    # 2. làng (Cái Bống đang chọn, mặc áo vải)
    pg.evaluate("() => { G.testSave({ hero: 'healer', melee: 'sword', lvl: 12, tier: 1, gold: 400 }); G.save.outfit && G.outfit && (G.save.outfit.wear = Object.assign(G.save.outfit.wear || {}, {})); G.setScene(G.Village); }")
    pg.wait_for_timeout(2500); pg.screenshot(path=SP + '/lang.png')
    pg.evaluate("() => G.villageApi.open('tu')"); pg.wait_for_timeout(900); pg.screenshot(path=SP + '/ong-tu.png')
    # 3. trận, 4 vũ khí (cận chiến kiếm/giáo/búa + cung ở tay hai), bấm đánh liên tục
    for wt in ['sword', 'spear', 'hammer', 'bow']:
      pg.evaluate("""(wt) => { G.testSave({ hero: 'healer', melee: wt === 'bow' ? 'sword' : wt, lvl: 20, tier: 2 }); if (wt === 'bow') G.save.carry = [G.save.carry[1], G.save.carry[0]];
        G.startStage(0, 2, 0, { kind: 'A', seed: 4242 }); const S = G.getRun(); S.fade = 0; S.tut = null; S.hint = null; G.testGoto('fight');
        const W = G.getWorld(); W.waves = []; W.spawns = []; }""", wt)
      pg.wait_for_timeout(1200)
      info = pg.evaluate("() => { const S = G.getRun(), P = S.P; P.hp = P.maxhp; return [P.weapon && P.weapon.type, Math.round(P.x), Math.round(P.y)]; }")
      pg.keyboard.down('j'); pg.keyboard.down('d'); pg.wait_for_timeout(300); pg.screenshot(path=SP + '/tran-%s.png' % wt); pg.keyboard.up('j'); pg.keyboard.up('d')
      print('trận', wt, info)
    b.close()
finally: srv.kill()
print('pageerror:', errs if errs else 'không có')
