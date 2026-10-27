#!/usr/bin/env python3
"""Chụp nhanh Làng Chuông v2 (thân gỗ gen, mảng rễ, tiền cảnh mới) – không phải bộ kiểm thử tự động:
  • nạp demo.html (máy chủ cục bộ) và bản build demo.build.html (file://): ghi lỗi console / lỗi trang / tải hỏng;
  • ảnh 960×540 (DPR 1) vài cảnh → game/kiem-thu-lang-chuong/anh-960-*-v2.png; số đo → so-do-v2.json.
Cần playwright + Chromium. Chạy: python3 -B game/tools/chup-lang-chuong-v2.py  (chạy build-demo.py trước)."""
import asyncio, functools, http.server, json, os, socketserver, threading
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.dirname(HERE)
GOC = os.path.dirname(GAME)
OUT = os.path.join(GAME, 'kiem-thu-lang-chuong')
CANH = (('cong-lang', 'A1.x0+5'), ('cong-cong-tac', 'A2.x0+13'), ('san-chuong', 'RB.x0+6'), ('cau-do', 'RC.x0+20'),
        ('diem-luu', 'RD.x0+15'), ('phong-boss', 'RE.x0+8'))


class Im(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


async def mo(b, url):
    ctx = await b.new_context(viewport={'width': 960, 'height': 540}, device_scale_factor=1)
    pg = await ctx.new_page()
    log = {'console_loi': [], 'trang_loi': [], 'yeu_cau_loi': []}
    pg.on('console', lambda m: log['console_loi'].append(m.text) if m.type in ('error', 'warning') and 'fonts.g' not in str(m.location) else None)
    pg.on('pageerror', lambda e: log['trang_loi'].append(str(e)))
    pg.on('requestfailed', lambda r: log['yeu_cau_loi'].append(r.url[:120]) if 'fonts.g' not in r.url else None)
    await pg.route('https://fonts.g*/**', lambda r: r.abort())
    await pg.goto(url)
    await pg.wait_for_function('window.TVDEMO && (TVDEMO.ready || TVDEMO.err)', timeout=60000)
    log['tvdemo'] = await pg.evaluate('({ready:TVDEMO.ready, err:TVDEMO.err||"", gach:TVDEMO.gach, lc:TVDEMO.lc, re:RE_DAT.length})')
    return pg, log


async def main():
    s = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Im, directory=GOC)); s.daemon_threads = True
    threading.Thread(target=s.serve_forever, daemon=True).start()
    so = {}
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg, so['build'] = await mo(b, 'file://' + os.path.join(GAME, 'demo.build.html')); await pg.close()
        pg, so['demo'] = await mo(b, 'http://127.0.0.1:%d/game/demo.html' % s.server_address[1])
        await pg.click('#btn-start')
        await pg.evaluate("()=>{ window.loop=function(){}; document.getElementById('warn').hidden=true; }")
        for ten, cot in CANH:
            await pg.evaluate("(c)=>{ placePlayer(eval(c)*T, FLOOR-pl.h); pl.drawT=0; for(let i=0;i<30;i++){ savePrev(); step(); } render(1); }", cot)
            await pg.screenshot(path=os.path.join(OUT, 'anh-960-%s-v2.png' % ten))
        so['demo']['loi_sau_chup'] = {'trang_loi': list(so['demo']['trang_loi'])}
        await b.close()
    json.dump(so, open(os.path.join(OUT, 'so-do-v2.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(json.dumps(so, ensure_ascii=False)[:1500])

asyncio.run(main())
