"""F4 — chụp soát headless 844×390 (giả iPhone): làng; ải 1-1 cầm từng vũ khí (đứng + đánh); đổi trang phục trong ải; đánh trùm Thornwood.
Ghi số lần "vẽ tới trang chưa giải mã" (miss) của js/trang_anh.js trong lúc chụp + lỗi trang.
  python3 chup_f4.py <dist> '<cờ thêm>' <thư mục ra> <tiền tố tên ảnh>"""
import json, os, sys, time, subprocess
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import do_bo_nho as D
VK = ['sword', 'spear', 'hammer', 'bow']


def main():
    dist, co, ra, tt = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
    os.makedirs(ra, exist_ok=True)
    port = 8930 + (abs(hash(co)) % 30)
    srv = subprocess.Popen([sys.executable, D.SRV, dist, str(port)], stderr=subprocess.DEVNULL); time.sleep(1)
    loi, kq = [], {}
    try:
        with sync_playwright() as p:
            b = p.chromium.launch()
            ctx = b.new_context(viewport={'width': 844, 'height': 390}, user_agent=D.UA, is_mobile=True, has_touch=True, device_scale_factor=2)
            pg = ctx.new_page(); pg.add_init_script(D.INIT)
            pg.on('pageerror', lambda e: loi.append(str(e)[:200]))
            miss = lambda: pg.evaluate('G.trangAnh && G.trangAnh.thongKe ? G.trangAnh.thongKe().miss : 0')
            def ranh(gioi=60):
                t, on = time.time(), 0
                while time.time() - t < gioi:
                    on = on + 1 if pg.evaluate(D.RANH) else 0
                    if on >= 6: return
                    pg.wait_for_timeout(250)
            def chup(ten):
                pg.screenshot(path=os.path.join(ra, '%s-%s.png' % (tt, ten)))
            pg.goto('http://127.0.0.1:%d/linh-khi-nhe.html?cloud=0%s' % (port, co))
            pg.wait_for_function('window.G && G.scene && G.spriteCustom && G.spriteCustom.roi', timeout=120000)
            pg.add_script_tag(path=os.path.join(D.GAME, 'tests', 'setup.js'))
            pg.evaluate("(() => { G.testSave({}); G.setScene(G.Village); })()"); ranh(120); pg.wait_for_timeout(1500)
            m0 = miss(); chup('lang'); kq['lang_miss'] = miss() - m0
            pg.evaluate("G.startStage(0, 0)"); pg.wait_for_function('G.scene === G.StageScene', timeout=300000); ranh(60); pg.wait_for_timeout(1500)
            m0 = miss(); kq['vk'] = []
            for i in range(4):
                pg.evaluate("(() => { const P = G.getRun().P; const k = P.weapons.findIndex((w) => w.type === '%s'); if (k >= 0) P.cur = k; })()" % VK[i])
                pg.wait_for_timeout(700); chup('ai-%s-dung' % VK[i])
                pg.evaluate("(() => { const P = G.getRun().P; P.atkT = 0; if (G.heroAttack) G.heroAttack(P); })()")
                pg.keyboard.down('j'); pg.wait_for_timeout(120); chup('ai-%s-danh' % VK[i]); pg.keyboard.up('j'); pg.wait_for_timeout(500)
                kq['vk'].append([VK[i], pg.evaluate("G.curW(G.getRun().P).type")])
            kq['ai_miss'] = miss() - m0
            m0 = miss()
            pg.evaluate("G.ZED_BO_THU = 'lau'"); pg.wait_for_timeout(300); chup('ai-doi-bo-lau-ngay'); ranh(60); pg.wait_for_timeout(1000); chup('ai-doi-bo-lau')
            kq['doi_bo_miss'] = miss() - m0
            pg.evaluate("G.ZED_BO_THU = null"); pg.evaluate("G.setScene(G.Village)"); pg.wait_for_timeout(1000)
            pg.evaluate("G.startStage(0, 4)"); pg.wait_for_function('G.scene === G.StageScene', timeout=300000); ranh(60)
            nb = pg.evaluate("(() => { const m = G.getRun().map; const b = m.rooms.find((r) => r.type === 'boss'); return [b.id, Object.values(b.doors)[0]]; })()")
            pg.evaluate("G.gotoRoom(%d)" % nb[1]); pg.wait_for_timeout(1000); ranh(90); chup('trum-phong-truoc')
            m0 = miss()
            pg.evaluate("G.gotoRoom(%d)" % nb[0]); pg.wait_for_timeout(2500); chup('trum-vao')
            pg.wait_for_timeout(3000); chup('trum-danh')
            kq['trum_miss'] = miss() - m0
            kq['trum_san'] = pg.evaluate("(() => { const SC = G.spriteCustom; return ['mocTinh', 'mocTinh-p2', 'mocTinh-p3'].map((m) => m + ':' + !!(SC.ds[m] && SC.ds[m].ready)); })()")
            kq['tk'] = pg.evaluate("G.trangAnh && G.trangAnh.thongKe ? (({ mib, trang, san, miss, bo, loi }) => ({ mib, trang, san, miss, bo, loi }))(G.trangAnh.thongKe()) : null")
            b.close()
    finally:
        srv.kill()
    kq['loi_js'] = loi
    json.dump(kq, open(os.path.join(ra, tt + '.json'), 'w'), ensure_ascii=False, indent=1)
    print(json.dumps(kq, ensure_ascii=False))


if __name__ == '__main__':
    main()
