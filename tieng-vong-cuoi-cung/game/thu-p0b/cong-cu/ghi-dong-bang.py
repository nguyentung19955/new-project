#!/usr/bin/env python3
"""PH14 mục 7 – GHI SNAPSHOT bản đóng băng P0-B: mọi file trang THẬT SỰ tải (trang, runtime dùng chung, ảnh, JSON, âm thanh …) kèm sha1 + cỡ,
chia "riêng trang" / "dùng chung" (runtime, art/, anim/ … – file mà trang khác cũng nạp, đổi ở đó là bản nhìn thấy đổi).
Ra: game/thu-p0b/dong-bang/<mã phiên>.json. Không sửa trang. Đối chiếu sau này: chạy lại script, so sha1 – khác là KHÔNG còn đúng bản đóng băng.
Bản đóng gói tự chứa (game/dong-goi-trang-thu.py) nhúng đúng các file này vào một HTML – đó là bản giữ nguyên tuyệt đối.
Chạy: python3 game/thu-p0b/cong-cu/ghi-dong-bang.py [game/thu-p0b/index.html]"""
import asyncio, functools, hashlib, http.server, json, os, re, socketserver, sys, threading, time
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
GOC = os.path.normpath(os.path.join(HERE, '..', '..', '..'))
TRANG = sys.argv[1] if len(sys.argv) > 1 else 'game/thu-p0b/index.html'


class Im(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


async def main():
    srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Im, directory=GOC)); cong = srv.server_address[1]
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    html = open(os.path.join(GOC, TRANG), encoding='utf-8').read()
    m = re.findall(r"p0[a-z]*-\d{4}-[0-9a-f]{8}", html); phien = m[0] if m else 'khong-ro-phien'
    tai = set(); t_cuoi = [time.time()]
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': 960, 'height': 540})
        goc = 'http://127.0.0.1:%d/' % cong

        def ghi(r):
            u = r.url
            if u.startswith(goc): tai.add(u[len(goc):].split('?')[0].split('#')[0]); t_cuoi[0] = time.time()
        pg.on('request', ghi)
        await pg.route('https://fonts.g*/**', lambda r: r.abort())
        await pg.goto(goc + TRANG)
        await pg.wait_for_function('window.TVDEMO && TVDEMO.ready', timeout=180000)
        try: await pg.evaluate('TVP0.batDau()')
        except Exception: pass
        t0 = time.time()
        while time.time() - t_cuoi[0] < 6 and time.time() - t0 < 60: await asyncio.sleep(1)
        await b.close()
    from urllib.parse import unquote
    ds = []
    for f in sorted(unquote(x) for x in tai):
        q = os.path.join(GOC, f)
        if not os.path.isfile(q): continue
        bb = open(q, 'rb').read()
        dung_chung = not f.startswith(os.path.dirname(TRANG) + '/')
        ds.append({'file': f, 'sha1': hashlib.sha1(bb).hexdigest(), 'byte': len(bb), 'loai': 'dùng chung' if dung_chung else 'riêng trang'})
    out = os.path.join(GOC, os.path.dirname(TRANG), 'dong-bang'); os.makedirs(out, exist_ok=True)
    kq = {'phien': phien, 'trang': TRANG, 'ngay_ghi': time.strftime('%Y-%m-%d'),
          'ghi_chu': 'Snapshot bản đóng băng: MỌI file trang tải khi chạy (Chromium). "dùng chung" = runtime / ảnh / JSON mà trang khác cũng nạp – '
                     'đổi chúng là đổi bản nhìn thấy dù index.html giữ nguyên. Đối chiếu: chạy lại ghi-dong-bang.py rồi so sha1.',
          'so_file': len(ds), 'runtime_dung_chung': [d['file'] for d in ds if d['file'].startswith('game/runtime/')], 'file': ds}
    json.dump(kq, open(os.path.join(out, phien + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(phien, len(ds), 'file ·', len(kq['runtime_dung_chung']), 'runtime dùng chung →', os.path.join(out, phien + '.json'))

asyncio.run(main())
