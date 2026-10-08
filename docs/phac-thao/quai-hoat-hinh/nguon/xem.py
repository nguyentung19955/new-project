# Xem thử hoạt hình quái. Mỗi lần chạy sẽ tự ghép lại mã (ra tệp tạm, không đụng tệp của game).
#   python3 xem.py luoi ID[:pha] ra.png            -> tờ lưới toạ độ + bộ phận đã cắt (để lấy toạ độ)
#   python3 xem.py dai ID CU_DONG ra.png [góc_độ] [pha] [số_khung]   -> dải khung hình một cử động
#   python3 xem.py tatca ID ra.png [góc_độ] [pha]  -> mọi cử động của một con
#   python3 xem.py in "biểu thức"               -> in kết quả ra màn hình
#   python3 xem.py js "biểu thức trả về canvas" ra.png
#   python3 xem.py gif TEN [TEN...]                -> dựng ../TEN.gif và ../TEN.png theo to.js (GIFS[TEN])
import asyncio, base64, os, sys, subprocess, tempfile, shutil, json
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.abspath(os.path.join(HERE, '..'))
PT = os.path.abspath(os.path.join(HERE, '..', '..')); ROOT = os.path.abspath(os.path.join(PT, '..', '..'))
rd = lambda p: open(p, encoding='utf-8').read()
args = sys.argv[1:]
def page_html(ma):
    js = ['window.G={};', rd(os.path.join(ROOT, 'game/js/data.js')), rd(os.path.join(ROOT, 'game/js/hero_tinhlinh.js')), rd(os.path.join(PT, 'hero-tinh-linh/nguon/to.js')), rd(ma), rd(os.path.join(HERE, 'xem.js'))]
    if os.path.exists(os.path.join(HERE, 'to.js')): js.append(rd(os.path.join(HERE, 'to.js')))
    return '<!doctype html><html lang="vi"><meta charset="utf-8"><body style="background:#111">%s</body></html>' % ''.join('<script>%s</script>' % s for s in js)
async def shot(pg, expr, out):
    data = await pg.evaluate('(' + expr + ').toDataURL("image/png")'); open(out, 'wb').write(base64.b64decode(data.split(',')[1]))
async def main():
    tmp = tempfile.mkdtemp(prefix='quai-'); ma = os.path.join(tmp, 'ma.js')
    r = subprocess.run([sys.executable, os.path.join(HERE, 'ghep.py'), '--out', ma], capture_output=True, text=True)
    if 'BỎ QUA' in r.stdout or 'LỖI' in r.stdout: print(r.stdout)
    async with async_playwright() as p:
        br = await p.chromium.launch(); pg = await br.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        await pg.set_content(page_html(ma)); await pg.wait_for_timeout(200)
        for w in ('700', '500'): await pg.evaluate('document.fonts.load(\'%s 40px "Inter"\')' % w)
        loi = await pg.evaluate('G.monsterArt ? G.monsterArt.loi : ["không nạp được monster_art"]')
        if errs or loi: print('LỖI KHI NẠP:', errs, loi)
        cmd = args[0]
        if cmd == 'luoi':
            idp = args[1].split(':'); await shot(pg, 'XEM.luoi(%r, %s)' % (idp[0], idp[1] if len(idp) > 1 else '1'), args[2]); print('đã ghi', args[2])
        elif cmd in ('dai', 'tatca'):
            k = 3 if cmd == 'dai' else 2; out = args[k]; o = {}
            if len(args) > k + 1 and args[k + 1] != '-': o['dir'] = float(args[k + 1]) * 3.14159265 / 180
            if len(args) > k + 2: o['phase'] = int(args[k + 2])
            if len(args) > k + 3: o['n'] = int(args[k + 3])
            ex = 'XEM.dai(%r, %r, %s)' % (args[1], args[2], json.dumps(o)) if cmd == 'dai' else 'XEM.tatCa(%r, %s)' % (args[1], json.dumps(o))
            await shot(pg, ex, out); print('đã ghi', out)
        elif cmd == 'in':
            print(await pg.evaluate(args[1]))
        elif cmd == 'js':
            await shot(pg, args[1], args[2]); print('đã ghi', args[2])
        elif cmd == 'gif':
            for ten in args[1:]:
                n = await pg.evaluate('XEM.to(GIFS[%r]())' % ten); fd = os.path.join(tmp, ten); os.makedirs(fd, exist_ok=True)
                for i in range(n): await shot(pg, 'XEM.khung(%d)' % i, os.path.join(fd, 'f%04d.png' % i))
                gif = os.path.join(OUT, ten + '.gif')
                for cols, sc in ((128, 1), (64, 1), (40, 1), (24, 1), (64, 2 / 3), (32, 2 / 3)):
                    vf = ('scale=iw*%s:ih*%s:flags=neighbor,' % (sc, sc) if sc != 1 else '') + 'split[a][b];[a]palettegen=max_colors=%d:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle' % cols
                    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '12', '-i', os.path.join(fd, 'f%04d.png'), '-vf', vf, '-loop', '0', gif], check=True)
                    if os.path.getsize(gif) < 3.9e6: break
                print('đã ghi', gif, n, 'khung', os.path.getsize(gif) // 1024, 'KB')
                if await pg.evaluate('typeof BANGS !== "undefined" && !!BANGS[%r]' % ten):
                    await shot(pg, 'BANGS[%r]()' % ten, os.path.join(OUT, ten + '.png')); print('đã ghi', ten + '.png')
                shutil.rmtree(fd)
        if errs: print('LỖI:', errs[:6])
        await br.close()
    shutil.rmtree(tmp, ignore_errors=True)
asyncio.run(main())
