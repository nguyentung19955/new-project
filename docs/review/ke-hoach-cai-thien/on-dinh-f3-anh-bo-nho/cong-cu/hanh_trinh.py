"""Đo pixel ảnh đã giải mã đang giữ khi chơi lần lượt làng → vùng 1 → 2 → 3 → 4 → làng (ải trùm, i = 4), rồi chuyển vùng thêm N lần.
Dùng: python3 hanh_trinh.py <cổng> '<cờ thêm, vd &taicu=1&bonhocu=1>' [số lần chuyển thêm] [Mbps] [iphone]
In JSON từng mốc: thời gian chờ vào ải (s), MiB đang giữ (ảnh rời), số ảnh, số ảnh đã giải phóng, lỗi JS.
"""
import json, os, sys, time
from playwright.sync_api import sync_playwright
GAME = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', '..', 'game'))
port = int(sys.argv[1]); co = sys.argv[2] if len(sys.argv) > 2 else ''; them = int(sys.argv[3]) if len(sys.argv) > 3 else 0
mbps = float(sys.argv[4]) if len(sys.argv) > 4 and sys.argv[4] != '0' else 0; kieu = sys.argv[5] if len(sys.argv) > 5 else ''; iphone = 'iphone' in kieu; thuong = 'thuong' in kieu  # thuong: giả máy 8 lõi / 8 GB
UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
DO = r"""(() => { const SC = G.spriteCustom, R = SC.roi, b = R.boNho ? R.boNho() : null; let px = 0, so = 0;
  if (!b) for (const it of R.ds.values()) if (it.ve) { px += (it.img.naturalWidth|0) * (it.img.naturalHeight|0); so++; }
  const tk = R.thongKe ? R.thongKe() : {};
  return { mb: b ? +b.mb.toFixed(1) : +(px * 4 / 1048576).toFixed(1), so: b ? b.so : so, bo: tk.soBo || 0, loi: R.loi(), loiTai: R.loiTai ? R.loiTai() : 0,
    scene: G.scene === G.StageScene ? 'ai' : G.scene === G.Village ? 'lang' : G.scene === G.ChoVung ? 'cho' : '?' }; })()"""
RANH = r"""(() => { const R = G.spriteCustom.roi; const tk = R.thongKe ? R.thongKe() : { dangGiai: 0, choGiai: 0 };
  let con = 0; for (const it of R.ds.values()) if (!it.ve && it.u != null && it.u < 90 && G.spriteCustom.roi.trangThai && R.trangThai(it.ma) !== 'failed') con++;
  return R.dang() === 0 && !tk.dangGiai && !tk.choGiai; })()"""
loi = []
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': 844, 'height': 390}, user_agent=UA if iphone else None)
    pg = ctx.new_page()
    if thuong: pg.add_init_script("Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 }); Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });")
    pg.on('pageerror', lambda e: loi.append(str(e)[:200]))
    if mbps:
        cdp = ctx.new_cdp_session(pg); cdp.send('Network.enable')
        cdp.send('Network.emulateNetworkConditions', {'offline': False, 'latency': 60, 'downloadThroughput': mbps * 125000, 'uploadThroughput': 125000})
    t0 = time.time()
    pg.goto('http://127.0.0.1:%d/linh-khi-nhe.html?cloud=0%s' % (port, co))
    pg.wait_for_function('window.G && G.scene && G.spriteCustom && G.spriteCustom.roi', timeout=120000)
    pg.add_script_tag(path=os.path.join(GAME, 'tests', 'setup.js'))
    pg.evaluate("(() => { G.testSave({}); const st = G.save.stars || (G.save.stars = {}); G.setScene(G.Village); })()")
    def cho_ranh(gioi=240):
        t = time.time(); on = 0
        while time.time() - t < gioi:
            if pg.evaluate(RANH): on += 1
            else: on = 0
            if on >= 6: return
            pg.wait_for_timeout(500)
    cho_ranh(); kq = []
    kq.append(dict(moc='làng (đầu)', t=round(time.time() - t0, 1), **pg.evaluate(DO)))
    thu_tu = [0, 1, 2, 3] + [i % 4 for i in range(them)]
    for k, r in enumerate(thu_tu):
        t1 = time.time()
        pg.evaluate('G.setScene(G.Village); G.startStage(%d, 4)' % r)
        pg.wait_for_function('G.scene === G.StageScene', timeout=300000)
        cho = round(time.time() - t1, 1)
        pg.wait_for_timeout(1500); cho_ranh(60)
        kq.append(dict(moc=('vùng %d' % (r + 1)) + (' (lần %d)' % (k + 1) if k >= 4 else ''), cho_vao_ai=cho, **pg.evaluate(DO)))
    pg.evaluate('G.setScene(G.Village)'); pg.wait_for_timeout(3000); cho_ranh(60)
    kq.append(dict(moc='làng (cuối)', **pg.evaluate(DO)))
    tk = pg.evaluate('G.spriteCustom.roi.thongKe ? G.spriteCustom.roi.thongKe() : null')
    b.close()
for d in kq: print(json.dumps(d, ensure_ascii=False))
print(json.dumps({'loi_js': loi[:10], 'so_loi_js': len(loi), 'gioi_han': tk and tk.get('gioiHan'), 'may': tk and tk.get('may'), 'tt': tk and tk.get('tt')}, ensure_ascii=False))
