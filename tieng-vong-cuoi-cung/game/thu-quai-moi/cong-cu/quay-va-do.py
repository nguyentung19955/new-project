#!/usr/bin/env python3
"""Quay video 60 fps từng con + đo nạp/giải mã/vẽ trên Chromium headless (Playwright). KHÔNG phải iPhone thật.

- Video: mở thu-quai-moi.html?ghi=1&con=X&hitbox=1, mỗi khung video = đúng 1 bước logic (60/s) → mp4 60 fps chính xác.
- Đo: mở ?tu=1&con=X (chạy rAF thật, 2 vòng kịch bản) ở máy bàn (1280×720, dpr 1) và giả lập iPhone 13 ngang
  (dpr 3, CPU chậm 4×) → window.KQ → ../so-do.json
Chạy: python3 game/thu-quai-moi/cong-cu/quay-va-do.py [video] [do]"""
import asyncio, functools, http.server, json, os, socketserver, subprocess, sys, threading, time
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
THU = os.path.normpath(os.path.join(HERE, '..'))
GOC = os.path.normpath(os.path.join(THU, '..', '..'))
VID = os.path.join(THU, 'video'); os.makedirs(VID, exist_ok=True)

class Im(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
def may_chu():
    s = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Im, directory=GOC)); s.daemon_threads = True
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s.server_address[1]

def url(cong, q): return 'http://127.0.0.1:%d/game/thu-quai-moi/thu-quai-moi.html?%s' % (cong, q)

async def quay(p, cong, con):
    b = await p.chromium.launch()
    pg = await b.new_page(viewport={'width': 960, 'height': 540}, device_scale_factor=2)
    loi = []; pg.on('pageerror', lambda e: loi.append(str(e)))
    await pg.goto(url(cong, 'ghi=1&hitbox=1&con=' + con))
    await pg.wait_for_function('window.TVTHU && (TVTHU.ready || TVTHU.err)', timeout=60000)
    await pg.evaluate("document.getElementById('so').hidden=true; document.getElementById('bar').hidden=true")
    await pg.evaluate('TVTHU.batDau()')
    dst = os.path.join(VID, con + '-60fps.mp4')
    ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '60', '-c:v', 'mjpeg', '-i', '-',
                           '-vf', 'format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-r', '60',
                           '-movflags', '+faststart', dst], stdin=subprocess.PIPE)
    n, sau = 0, None
    for i in range(1800):
        st = await pg.evaluate('TVTHU.khung(1)')
        ff.stdin.write(await pg.screenshot(type='jpeg', quality=92)); n += 1
        if st['xong'] and sau is None: sau = 40
        if sau is not None:
            sau -= 1
            if sau <= 0: break
    ff.stdin.close(); ff.wait(); await b.close()
    print(con, dst, n, 'khung', round(n / 60, 1), 's; lỗi trang', loi, flush=True)
    return {'video': os.path.basename(dst), 'so_khung': n, 'giay': round(n / 60, 2), 'loi_trang': loi}

async def do(p, cong, con, ch):
    b = await p.chromium.launch()
    ctx = await b.new_context(**ch['ctx'])
    pg = await ctx.new_page()
    if ch.get('cpu'):
        cdp = await ctx.new_cdp_session(pg); await cdp.send('Emulation.setCPUThrottlingRate', {'rate': ch['cpu']})
    loi = []; pg.on('pageerror', lambda e: loi.append(str(e)))
    await pg.goto(url(cong, 'tu=1&vong=2&con=' + con))
    await pg.wait_for_function('window.KQ && window.KQ.xong', timeout=600000)
    kq = await pg.evaluate('JSON.parse(JSON.stringify(window.KQ))')
    await pg.screenshot(path=os.path.join(THU, 'chup-%s-%s.png' % (ch['ten'], con)))
    await b.close()
    kq['cau_hinh'] = ch['ten']; kq['loi_trang'] = loi
    print(ch['ten'], con, 'nạp', round(kq['msTrang']), 'ms; vẽ', kq['ve'], 'giật', kq['giat'], 'khi đổi', kq['giatKhiDoi'], flush=True)
    return kq

async def main(viec):
    cong = may_chu()
    out_p = os.path.join(THU, 'so-do.json')
    out = json.load(open(out_p)) if os.path.exists(out_p) else {}
    out['ghi_chu'] = 'Chromium headless (Playwright, GPU phần mềm). iPhone = chỉ giả lập cỡ màn/dpr/UA + CPU chậm 4×; KHÔNG phải iPhone thật.'
    async with async_playwright() as p:
        if 'video' in viec:
            out.setdefault('video', {})
            for c in (os.environ.get('CON') or 'nam doi menam ca-ba').split():
                out['video'][c] = await quay(p, cong, c)
        if 'do' in viec:
            ip = p.devices['iPhone 13 landscape']
            chs = [{'ten': 'may-ban', 'ctx': {'viewport': {'width': 1280, 'height': 720}, 'device_scale_factor': 1}},
                   {'ten': 'gia-lap-iphone13-cpu4x', 'ctx': dict(ip), 'cpu': 4}]
            out['do'] = [await do(p, cong, c, ch) for ch in chs for c in ('nam', 'doi', 'menam', 'ca-ba')]
    json.dump(out, open(out_p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

if __name__ == '__main__':
    asyncio.run(main(sys.argv[1:] or ['video', 'do']))
