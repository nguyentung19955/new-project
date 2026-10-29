#!/usr/bin/env python3
"""Quay CHƠI THẬT bản tích hợp P0-C + LAM MỚI (game/thu-p0c-lam-moi/index.html) → game/thu-p0c-lam-moi/video/
Không phải bộ kiểm thử: chỉ quay + ghi log. KHÔNG bất tử (Lam có thể bị đánh / chết – ghi lại).
Bot = ĐÚNG bot luồng người chơi của P0-C (game/thu-p0c/cong-cu/quay-p0c.py: bot_luong – nạp phần định nghĩa của file đó, không sửa):
  vào thẳng E (?vao=e) → đánh tinh anh Chuông Gỗ Gác Lớn chỉ bằng đánh thường (né đập, lướt xuyên húc) → nhặt Ấn Rèn I → sang F, đứng cạnh đe
  → bấm Rèn → cấp 3 → giữ Chém 26 tick rồi thả = Dư Âm (tụ → chém vang) vào hình nộm → quay lại E đánh 2 Chuông Gỗ (có Dư Âm).
Góc dưới: máu · việc bot đang làm · nhãn tư thế Lam mới (máy hình). 60 hình/s, mỗi hình = 1 bước logic.
Chạy: python3 -B game/thu-p0c-lam-moi/cong-cu/quay-p0c-lam-moi.py   (~15–25 phút)"""
import asyncio, functools, io, json, os, socketserver, threading

HERE = os.path.dirname(os.path.abspath(__file__))
GOC = os.path.normpath(os.path.join(HERE, '..', '..', '..'))
NGUON = os.path.join(GOC, 'game', 'thu-p0c', 'cong-cu', 'quay-p0c.py')
src = open(NGUON, encoding='utf-8').read()
G = {'__file__': NGUON, '__name__': 'quay_p0c_dinh_nghia'}
exec(compile(src[:src.index('\nasync def main():')], NGUON, 'exec'), G)   # chỉ phần định nghĩa (Trang, nhan, bot_luong, ffmpeg …)
OUT = os.path.join(GOC, 'game', 'thu-p0c-lam-moi', 'video'); os.makedirs(OUT, exist_ok=True)
from playwright.async_api import async_playwright


class Trang(G['Trang']):
    async def mo(s):
        s.pg = await s.b.new_page(viewport={'width': 960, 'height': 540}, device_scale_factor=1)
        s.loi = []; s.pg.on('pageerror', lambda e: s.loi.append(str(e)))
        await s.pg.route('https://fonts.g*/**', lambda r: r.abort())
        await s.pg.goto('http://127.0.0.1:%d/game/thu-p0c-lam-moi/index.html?ghi=1&vao=e%s' % (s.cong, s.q))
        await s.pg.wait_for_function('window.TVDEMO && TVDEMO.ready', timeout=180000)
        await s.pg.evaluate('TVP0.batDau()'); await s.pg.evaluate('TVP0.anUI(1)')
        await s.pg.wait_for_function('TVP0C.P0C && document.readyState==="complete"')
        await asyncio.sleep(0.5)
        return s


async def main():
    srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(G['Im'], directory=GOC)); cong = srv.server_address[1]
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    async with async_playwright() as p:
        b = await p.chromium.launch()
        t = await Trang(b, cong, '').mo()
        f, so = G['bot_luong']()
        v = G['ffmpeg'](os.path.join(OUT, 'choi-that-p0c-lam-moi-60fps.mp4'))
        n = 0; moc = []; nhanCu = ''; hp_cu = 5; chet = []; tu = {}; lg = []
        while not so['xong'] and n < 7200:
            st = await t.js('TVP0C.tt()')
            if st['hp'] <= 0 and hp_cu > 0: chet.append(st['f'])
            hp_cu = st['hp']
            phim, chu = f(st)
            if chu and chu != nhanCu: moc.append([st['f'], chu]); nhanCu = chu
            if phim == 'F': await t.pg.keyboard.press('f'); phim = ''
            await t.buoc(phim); n += 1
            r = await t.js('[LM2.nhan, pl.a2, pl.atkN, pl.atkT, pl.hp, pl.dead]'); lg.append(r); tu[str(r[0])] = tu.get(str(r[0]), 0) + 1
            im = G['nhan']((await t.anh()).convert('RGB'), 'P0-C LAM MỚI · KHÔNG bất tử · máu %d · %s · %s' % (max(0, st['hp']), chu, r[0]))
            bb = io.BytesIO(); im.save(bb, 'JPEG', quality=88); v.stdin.write(bb.getvalue())
        v.stdin.close(); v.wait()
        kq = {'buoc': n, 'lam_nga_o_frame': chet, 'tom_tat': await t.js('TVP0C.tomTat()'), 'trang_thai_cuoi': await t.js('TVP0C.tt()'),
              'moc_bot': moc, 'tu_the_so_buoc': tu, 'loi_trang': t.loi, 'ghi_chu_log': '[nhãn tư thế, trạng thái, atkN, atkT, máu, chết] mỗi bước', 'log': lg}
        json.dump(kq, open(os.path.join(OUT, 'log-choi-that.json'), 'w', encoding='utf-8'), ensure_ascii=False)
        print('bước', n, 'ngã', chet, 'lỗi', t.loi); print('tư thế:', sorted(tu)); print('mốc:', [m[1] for m in moc][:40])
        await b.close()

asyncio.run(main())
