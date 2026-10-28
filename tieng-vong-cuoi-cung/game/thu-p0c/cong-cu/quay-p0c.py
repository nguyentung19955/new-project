#!/usr/bin/env python3
"""Quay trang thử P0-C (game/thu-p0c/index.html) → game/thu-p0c/video/
Một kịch bản bot, chạy song song từng bước trên 2 trang cùng đầu vào: SẠCH (?vao=e&battu=1) và DEBUG (+ ?hitbox=1&debug=p0c).
  1. Đánh tinh anh Chuông Gỗ Gác Lớn CHỈ BẰNG ĐÁNH THƯỜNG (Âm Đao cấp 1, không bấm V, không Dư Âm): chạm Chém khi tinh anh không ra đòn;
     thấy báo ĐẬP (lóe vàng) → lùi khỏi tầm; thấy báo HÚC (lóe đỏ) → đứng chờ, lúc nó lao tới gần thì LƯỚT xuyên qua.
  2. Tới chỗ Ấn Rèn I rơi → nhặt.  3. Sang phòng F, tới đe rèn, bấm phím F (= nút Rèn) → Âm Đao cấp 3.
  4. Giữ Chém 26 tick rồi thả → Dư Âm (chém vang + vết).
?battu=1 chỉ để video không bị cắt giữa chừng nếu bot trúng đòn (số lần trúng ghi trong ket-qua.json). Trong trận KHÔNG dời quái,
không đặt lại hồi chiêu, không can thiệp trạng thái. 60 hình/s, mỗi hình = 1 bước logic, H.264 -preset veryfast.
Không phải bộ kiểm thử tự động: chỉ quay + ghi số / log ra file.
Chạy: python3 -B game/thu-p0c/cong-cu/quay-p0c.py [--khong-video]   (cần playwright, Chromium, ffmpeg, Pillow)"""
import asyncio, functools, http.server, io, json, os, socketserver, subprocess, sys, threading
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
GOC = os.path.normpath(os.path.join(HERE, '..', '..', '..'))
OUT = os.path.join(GOC, 'game', 'thu-p0c', 'video'); os.makedirs(OUT, exist_ok=True)
VIDEO = '--khong-video' not in sys.argv
try:
    FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18)
except Exception:
    FONT = ImageFont.load_default()


class Im(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def ffmpeg(dst):
    return subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '60', '-c:v', 'mjpeg', '-i', '-',
                             '-vf', 'format=yuv420p', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-r', '60', '-movflags', '+faststart', dst],
                            stdin=subprocess.PIPE)


def nhan(im, chu):
    d = ImageDraw.Draw(im, 'RGBA'); w = d.textlength(chu, font=FONT)
    d.rectangle([im.width - w - 16, 512, im.width, 540], fill=(12, 15, 20, 210)); d.text((im.width - w - 8, 515), chu, font=FONT, fill=(243, 230, 200))
    return im


class Trang:
    def __init__(s, b, cong, q, ten):
        s.b, s.cong, s.q, s.ten = b, cong, q, ten

    async def mo(s):
        s.pg = await s.b.new_page(viewport={'width': 960, 'height': 540}, device_scale_factor=1)
        s.loi = []; s.pg.on('pageerror', lambda e: s.loi.append(str(e)))
        await s.pg.route('https://fonts.g*/**', lambda r: r.abort())
        await s.pg.goto('http://127.0.0.1:%d/game/thu-p0c/index.html?ghi=1&battu=1&vao=e%s' % (s.cong, s.q))
        await s.pg.wait_for_function('window.TVDEMO && TVDEMO.ready', timeout=120000)
        await s.pg.evaluate('TVP0.batDau()'); await s.pg.evaluate('TVP0.anUI(1)')
        await s.pg.wait_for_function('TVP0C.P0C && document.readyState==="complete"')
        await asyncio.sleep(0.5)   # ảnh Ấn Rèn nạp xong
        return s

    async def js(s, e, a=None):
        return await s.pg.evaluate(e, a)

    async def buoc(s, phim):
        await s.pg.evaluate('p=>TVP0.khung(1,p)', phim)

    async def anh(s):
        return Image.open(io.BytesIO(await s.pg.screenshot(type='jpeg', quality=90)))


def bot(chi_danh=False):
    """Trả về hàm (state) → (phím, nhãn, lệnh JS phụ). Chỉ dùng trạng thái đọc được trên màn (đòn đang báo, khoảng cách)."""
    s = {'pha': 'danh', 'lastA': -99, 'giu': 0, 'cho': 0, 'ren': False, 'xong': 0}

    def f(st):
        ta, x, fr = st['ta'], st['x'], st['f']
        if s['pha'] == 'danh':
            if ta['gone'] or ta['ta'] == 'chet':
                s['pha'] = 'nhat'; return '', 'tinh anh hạ'
            if chi_danh and fr >= 1200: s['xong'] = 1
            dx = ta['x'] - x; adx = abs(dx); toi = 'r' if dx > 0 else 'l'; lui = 'l' if dx > 0 else 'r'
            if ta['ta'] in ('dapBao', 'dap'):
                return (lui, 'thấy báo ĐẬP → lùi') if adx < 255 else ('', 'chờ đập hụt')
            if ta['ta'] == 'hucBao':
                return ('', 'thấy báo HÚC → chờ') if adx >= 150 else (lui, 'thấy báo HÚC → giãn cách')
            if ta['ta'] == 'huc':
                if adx <= 150 and st['dash'] <= 0: return toi + 's', 'HÚC lao tới → LƯỚT xuyên qua'
                return '', 'húc'
            if ta['ta'] in ('ngu', 'thuc'):
                return (toi, 'tiến vào') if adx > 300 else ('', 'chờ')
            # tinh anh không ra đòn (đi / lùi / hồi / choáng / đứng dậy) → áp sát, chạm Chém mỗi 14 tick
            if adx > 118: return toi, 'áp sát'
            if adx < 78 and ta['ta'] != 'choang': return lui, 'giãn cách (thân to)'
            if (dx > 0) != (st['face'] > 0): return toi, 'quay mặt'
            if fr - s['lastA'] >= 14:
                s['lastA'] = fr; return 'a', 'chạm Chém (đánh thường)' + (' – tinh anh choáng' if ta['ta'] == 'choang' else '')
            return '', 'đánh thường'
        if s['pha'] == 'nhat':
            if st['an']['co']: s['pha'] = 'de'; return '', 'đã nhặt Ấn Rèn I'
            if not st['an']['on']: return '', 'chờ Ấn rơi'
            dx = st['an']['x'] - x
            return ('r' if dx > 0 else 'l') if abs(dx) > 4 else '', 'tới nhặt Ấn'
        if s['pha'] == 'de':
            dx = st['de'] - 84 - x   # đứng bên trái đe ~84 px (không che đe)
            if abs(dx) > 6: return 'r' if dx > 0 else 'l', 'sang phòng F, tới đe rèn'
            if st['face'] < 0: return 'r', 'quay về phía đe'
            s['cho'] += 1
            if s['cho'] >= 20 and not s['ren'] and st['coTheRen']: s['ren'] = True; return 'F', 'bấm Rèn (phím F)'
            if s['ren'] and st['cap'] >= 3:
                s['pha'] = 'cho3'; s['cho'] = 0
            return '', 'ở đe rèn'
        if s['pha'] == 'cho3':
            s['cho'] += 1
            if s['cho'] < 110: return '', 'Âm Đao cấp 3 – mở Dư Âm'
            if s['cho'] < 124: return 'l', 'quay ra khoảng trống'
            s['pha'] = 'giu'; s['giu'] = 0
            return '', ''
        if s['pha'] == 'giu':
            s['giu'] += 1
            if s['giu'] <= 26: return 'a', 'GIỮ Chém ' + str(s['giu']) + ' tick'
            s['pha'] = 'sau'; s['cho'] = 0; return '', 'thả → DƯ ÂM'
        if s['pha'] == 'sau':
            s['cho'] += 1
            if s['cho'] > 100: s['xong'] = 1
            return '', 'Dư Âm: chém vang + vết'
        return '', ''
    return f, s


async def chay(b, cong, ten, q_sach, q_dbg, v_sach, v_dbg, chi_danh):
    if True:
        sach = await Trang(b, cong, q_sach, 'sach').mo()
        dbg = await Trang(b, cong, q_dbg, 'debug').mo()
        f, so = bot(chi_danh)
        vs = [ffmpeg(os.path.join(OUT, v_sach)), ffmpeg(os.path.join(OUT, v_dbg))] if VIDEO else []
        lech = 0; nhanCu = ''; moc = []; n = 0
        while not so['xong'] and n < 6000:
            st = await sach.js('TVP0C.tt()'); st2 = await dbg.js('TVP0C.tt()')
            if (st['f'], st['x'], st['ta']['hp'], st['ta']['ta']) != (st2['f'], st2['x'], st2['ta']['hp'], st2['ta']['ta']): lech += 1
            phim, chu = f(st)
            if chu and chu != nhanCu: moc.append([st['f'], chu]); nhanCu = chu
            if phim == 'F':
                for t in (sach, dbg): await t.pg.keyboard.press('f')
                phim = ''
            for t in (sach, dbg): await t.buoc(phim)
            n += 1
            if VIDEO:
                for i, t in enumerate((sach, dbg)):
                    im = nhan((await t.anh()).convert('RGB'), 'P0-C · bot · ' + chu + ('' if i == 0 else '  [debug]'))
                    bb = io.BytesIO(); im.save(bb, 'JPEG', quality=88); vs[i].stdin.write(bb.getvalue())
        for v in vs: v.stdin.close(); v.wait()
        kq = {'buoc': n, 'lech_sach_debug': lech, 'tom_tat': await sach.js('TVP0C.tomTat()'), 'tom_tat_debug': await dbg.js('TVP0C.tomTat()'),
              'trang_thai_cuoi': await sach.js('TVP0C.tt()'), 'moc_bot': moc, 'loi_trang': {'sach': sach.loi, 'debug': dbg.loi},
              'p0_log_cuoi': await sach.js('TVP0.P0.LOG.slice(-60).map(r=>r.s)')}
        log = await sach.js('TVP0C.log()')
        open(os.path.join(OUT, 'log-%s-sach.txt' % ten), 'w', encoding='utf-8').write('\n'.join(log) + '\n')
        open(os.path.join(OUT, 'log-%s-debug.txt' % ten), 'w', encoding='utf-8').write('\n'.join(await dbg.js('TVP0C.log()')) + '\n')
        await sach.pg.close(); await dbg.pg.close()
        print(ten, json.dumps({k: kq[k] for k in ('buoc', 'lech_sach_debug', 'tom_tat', 'loi_trang')}, ensure_ascii=False))
        return kq


async def main():
    srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Im, directory=GOC)); cong = srv.server_address[1]
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    KQ = {}
    async with async_playwright() as p:
        b = await p.chromium.launch()
        # 1. luồng chính: tinh anh mặc định (160 máu) → Ấn → đe → Dư Âm
        KQ['luong_chinh'] = await chay(b, cong, 'luong-chinh', '', '&hitbox=1&debug=p0c',
                                       '1-sach-tinh-anh-an-ren-du-am.mp4', '2-debug-tinh-anh-an-ren-du-am.mp4', False)
        # 2. CHỈ ĐỂ KIỂM chu trình Thế: ?tamau=600 (biến thể, tắt mặc định), cùng bot, đánh 1200 tick: vỡ → choáng → ổn định → vỡ lại ×0,6 / ×0,4
        KQ['kiem_the'] = await chay(b, cong, 'kiem-the', '&tamau=600', '&tamau=600&hitbox=1&debug=p0c',
                                    '3-sach-kiem-the-tamau600.mp4', '4-debug-kiem-the-tamau600.mp4', True)
        await b.close()
    json.dump(KQ, open(os.path.join(OUT, 'ket-qua.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

asyncio.run(main())
