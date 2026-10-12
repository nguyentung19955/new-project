"""Chặn tệp ảnh rời → game vẫn chạy (vẽ code), không lỗi trang; chặn riêng .webp → từng ảnh tự tải bản .png.
python3 chan_anh.py <url chặn mọi ảnh anh/> <url chặn .webp> <thư mục ra>"""
import json, os, sys
from playwright.sync_api import sync_playwright
U_CHAN, U_WEBP, RA = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(RA, exist_ok=True)
kq = {}
with sync_playwright() as pw:
    b = pw.chromium.launch(args=['--ignore-certificate-errors', '--host-resolver-rules=MAP fonts.googleapis.com 127.0.0.1:9, MAP fonts.gstatic.com 127.0.0.1:9'])
    for ten, url in (('chan-het', U_CHAN), ('chan-webp', U_WEBP)):
        ctx = b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=3, is_mobile=True, has_touch=True, ignore_https_errors=True)
        pg = ctx.new_page(); loi = []; info = []
        pg.on('pageerror', lambda e: loi.append(str(e)))
        pg.on('console', lambda m: info.append(m.text[:160]) if '[Linh Khí]' in m.text else None)
        pg.goto(url)
        pg.wait_for_function('G.spriteCustom.sau.tt === "xong" || G.spriteCustom.sau.tt === "loi"', timeout=120000, polling=250)
        r = {'sau': pg.evaluate('() => ({ tt: G.spriteCustom.sau.tt, xong: G.spriteCustom.sau.xong, tong: G.spriteCustom.sau.tong, loi: G.spriteCustom.roi.loi() })')}
        chi = pg.evaluate('() => G.spriteCustom.sauChiBao()')
        r['chi_bao'] = chi
        pg.screenshot(path=os.path.join(RA, ten + '-man-chao.png'))
        # vào làng rồi vào ải trùm Rừng già, chơi thật 4 giây
        pg.mouse.click(422, 120); pg.wait_for_timeout(1500)
        pg.evaluate("() => { G.startStage(0, 4, 0, { kind: 'A', seed: 3 }); const S = G.getRun(); G.gotoRoom(S.map.boss); }")
        pg.wait_for_timeout(4000)
        pg.screenshot(path=os.path.join(RA, ten + '-trum.png'))
        r['canh'] = pg.evaluate('() => [G.scene === G.StageScene, G.getRun() && G.getRun().mode]')
        r['san'] = pg.evaluate('() => { const SC = G.spriteCustom; let a = 0, n = 0; for (const k in SC.ds) { n++; if (SC.ds[k].ready) a++; } return a + "/" + n; }')
        r['loi_trang'] = loi; r['ghi'] = info[-3:]
        kq[ten] = r
        ctx.close()
    b.close()
print(json.dumps(kq, ensure_ascii=False, indent=1))
json.dump(kq, open(os.path.join(RA, 'chan-anh.json'), 'w'), ensure_ascii=False, indent=1)
