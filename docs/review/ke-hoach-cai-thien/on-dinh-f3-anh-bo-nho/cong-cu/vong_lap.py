"""Kiểm vòng lặp + bộ đếm hiệu năng trên bản web (game/dist):
  an-hien  — trong ải đông quái: giả "ẩn tab" 5 giây (document.hidden = true, requestAnimationFrame NGỪNG như trình duyệt thật), rồi hiện lại;
             đo G.time và độ dời của quái ở khung đầu sau khi quay lại. Chạy với cờ '' (mới) và '&vonglapcu=1' (cũ) để so.
  stress   — 30 quái không chết + bot tự đánh trong N giây (mặc định 300), CPU chậm x lần (mặc định 1): lỗi JS, số liệu G.hieuNang.lay() mỗi 15 s,
             bậc chất lượng hình tự động.
Dùng: python3 vong_lap.py <cổng> <an-hien|stress> ['<cờ>'] [giây] [cpu x]
"""
import json, os, sys, time
from playwright.sync_api import sync_playwright
GAME = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', '..', 'game'))
port = int(sys.argv[1]); kb = sys.argv[2]; co = sys.argv[3] if len(sys.argv) > 3 else ''
SEC = int(sys.argv[4]) if len(sys.argv) > 4 else 300; CPU = float(sys.argv[5]) if len(sys.argv) > 5 else 1
AN = r"""(() => { // giả ẩn tab: document.hidden + rAF ngừng (giữ callback lại, trả khi hiện)
  let an = false, giu = [];
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => an });
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (an ? 'hidden' : 'visible') });
  const raf0 = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => { if (an) { giu.push(cb); return 0; } return raf0(cb); };
  window.__an = (v) => { an = v; document.dispatchEvent(new Event('visibilitychange')); if (!v) { const g = giu; giu = []; for (const cb of g) raf0(cb);
    // đọc G.time và vị trí quái NGAY TRONG khung đầu sau khi hiện (callback của game chạy trước callback này trong cùng khung)
    return new Promise((ok) => raf0(() => { const W = G.getWorld(); ok({ t: G.time, ents: W.ents.map((e) => [e.x, e.y]) }); })); } };
})()"""
SETUP = r"""(() => {
  G.testSave({ hero: 'smith', melee: 'sword', lvl: 12, tier: 1, sharpen: 3, branch: 'fire', marks: 300 });
  G.startStage(0, 2, 0, { kind: 'A', seed: 4242 });
  return true; })()"""
FILL = r"""(() => {
  const S = G.getRun(); S.fade = 0; S.tut = null; S.hint = null;
  if (G.testGoto) G.testGoto('fight');
  const W = S.W; W.waves = []; W.spawns = [];
  if (G.botCfg) Object.assign(G.botCfg, { explore: false, props: false });
  const roles = ['rusher', 'swarm', 'shield', 'kami', 'nimble', 'bomber', 'archer', 'spiky', 'elite'];
  window.__fill = () => {
    const S = G.getRun(); if (!S || G.scene !== G.StageScene) return;
    const W = S.W, P = S.P; if (S.mode !== 'play') S.mode = 'play';
    const rw = W.x1 - W.x0 - 20, rh = W.y1 - W.y0 - 30;
    for (let i = W.ents.length; i < window.__soQuai; i++) { const e = G.spawnEnemy(roles[i % roles.length], W.x0 + 10 + (i * 53) % rw, W.y0 + 20 + (i * 37) % rh, { hpMult: 1e5 }); e.inside = true; }
    P.hp = P.maxhp; P.mana = Math.max(P.mana, 30); W.over = null;
  };
  window.__fill(); window.__hFill = setInterval(window.__fill, 250);
  return true; })()"""
VT = "(() => { const W = G.getWorld(); return { t: G.time, ents: W.ents.map((e) => [e.x, e.y]) }; })()"
loi = []
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 844, 'height': 390})
    pg.on('pageerror', lambda e: loi.append(str(e)[:240]))
    if kb == 'an-hien': pg.add_init_script(AN)
    pg.goto('http://127.0.0.1:%d/linh-khi-nhe.html?cloud=0%s' % (port, co))
    pg.wait_for_function('window.G && G.scene && G.spriteCustom', timeout=120000)
    for f in ('bot.js', 'setup.js'): pg.add_script_tag(path=os.path.join(GAME, 'tests', f))
    pg.wait_for_timeout(1500)
    pg.evaluate('window.__soQuai = %d' % (14 if kb == 'an-hien' else 30))
    pg.evaluate(SETUP); pg.wait_for_function('G.scene === G.StageScene', timeout=120000); pg.wait_for_timeout(800)
    pg.evaluate(FILL); pg.wait_for_timeout(2000)
    kq = {'kich_ban': kb, 'co': co}
    if kb == 'an-hien':
        pg.evaluate('clearInterval(window.__hFill)')  # không thêm quái trong lúc đo
        a = pg.evaluate(VT); pg.evaluate('window.__an(true)'); pg.wait_for_timeout(5000)
        trong = pg.evaluate(VT)
        sau = pg.evaluate('window.__an(false)')
        n = min(len(a['ents']), len(sau['ents']))
        dmax = max([abs(sau['ents'][i][0] - trong['ents'][i][0]) + abs(sau['ents'][i][1] - trong['ents'][i][1]) for i in range(n)] or [0])
        kq.update({'G_time_truoc_an': round(a['t'], 3), 'G_time_trong_luc_an_5s': round(trong['t'] - a['t'], 3), 'G_time_nhay_khi_hien': round(sau['t'] - trong['t'], 3),
                   'quai_doi_xa_nhat_px_khi_hien': round(dmax, 1), 'so_lan_nghi': pg.evaluate('G.vongLap ? G.vongLap.soNghi : null')})
    else:
        if CPU > 1:
            cdp = pg.context.new_cdp_session(pg); cdp.send('Emulation.setCPUThrottlingRate', {'rate': CPU})
        mau = []; t0 = time.time()
        while time.time() - t0 < SEC:
            pg.wait_for_timeout(15000)
            h = pg.evaluate('G.hieuNang ? G.hieuNang.lay() : null')
            if h: mau.append({k: (round(v, 1) if isinstance(v, float) else v) for k, v in h.items() if k not in ('nhatKy',)})
        kq['mau'] = mau; kq['nhat_ky_bac'] = pg.evaluate('G.hieuNang ? G.hieuNang.lay().nhatKy : null')
        kq['vfx_cuoi'] = pg.evaluate('JSON.parse(JSON.stringify(G.VFX))'); kq['so_toi_da'] = pg.evaluate('G.theme && G.theme.DOC ? G.theme.DOC.soToiDa : null')
        kq['scene_cuoi'] = pg.evaluate("G.scene === G.StageScene ? 'ai' : '?'")
    b.close()
kq['loi_js'] = loi[:5]; kq['so_loi_js'] = len(loi)
print(json.dumps(kq, ensure_ascii=False))
