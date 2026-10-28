#!/usr/bin/env python3
"""Quay + đo trang thử P0-B (game/thu-p0b/index.html) → game/thu-p0b/video/
  luot1 : CÙNG một kịch bản bot cho A (ghi chủ động) và B (Vọng Chiến), CẢ HAI MIỄN PHÍ, phòng B (2 Chuông Gỗ) → C (quái gác) → D (2 Bọ Vỏ Mộc).
          4 trang chạy song song từng bước: A sạch | B sạch (video sạch) và A debug | B debug (?hitbox=1&debug=vong, video debug).
  luot2 : cờ riêng ?nac=1 – B tốn nấc (2 nấc, hồi 1 / 150 tick), A vẫn miễn phí. Chỉ số đo (không video).
60 hình/s, mỗi hình = 1 bước logic, H.264 -preset veryfast. Không phải bộ kiểm thử tự động: chỉ quay + ghi số / log ra file.
Chạy: python3 -B game/thu-p0b/cong-cu/quay-p0b.py [luot1 luot2]   (cần playwright, Chromium, ffmpeg, Pillow)"""
import asyncio, functools, http.server, io, json, os, socketserver, subprocess, sys, threading
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
GOC = os.path.normpath(os.path.join(HERE, '..', '..', '..'))
OUT = os.path.join(GOC, 'game', 'thu-p0b', 'video'); os.makedirs(OUT, exist_ok=True)
try:
    FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 20)
except Exception:
    FONT = ImageFont.load_default()


class Im(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def ffmpeg(dst, w, h):
    return subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '60', '-c:v', 'mjpeg', '-i', '-',
                             '-vf', 'format=yuv420p', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-r', '60', '-movflags', '+faststart', dst],
                            stdin=subprocess.PIPE)


def nhan(im, chu, mau=(206, 240, 214), y=0):
    d = ImageDraw.Draw(im, 'RGBA'); w = d.textlength(chu, font=FONT)
    d.rectangle([im.width - w - 16, y + 512, im.width, y + 540], fill=(12, 15, 20, 210)); d.text((im.width - w - 8, y + 515), chu, font=FONT, fill=mau)
    return im


def jpg(im):
    b = io.BytesIO(); im.convert('RGB').save(b, 'JPEG', quality=88); return b.getvalue()


class Trang:
    def __init__(s, b, cong, q):
        s.b, s.cong, s.q = b, cong, q

    async def mo(s):
        s.pg = await s.b.new_page(viewport={'width': 960, 'height': 540}, device_scale_factor=1)
        s.loi = []; s.pg.on('pageerror', lambda e: s.loi.append(str(e)))
        await s.pg.route('https://fonts.g*/**', lambda r: r.abort())
        await s.pg.goto('http://127.0.0.1:%d/game/thu-p0b/index.html?ghi=1&battu=1%s' % (s.cong, s.q))
        await s.pg.wait_for_function('window.TVDEMO && TVDEMO.ready', timeout=120000)
        await s.pg.evaluate('TVP0.batDau()'); await s.pg.evaluate('TVP0.anUI(1)')
        # trạng thái đầu GIỐNG NHAU ở mọi trang (đặt MỘT lần trước trận): quái ở chỗ gốc, Lam đầu Sân hai chuông, không bóng
        await s.pg.evaluate('for(const i of [3,4,5]) TVP0.datLaiQuai(i); BO.datLai(); echo=null; rec=null; TVP0.datLam((PB.x0+1)*T,1)')
        for _ in range(4): await s.buoc('')
        return s

    async def js(s, e):
        return await s.pg.evaluate(e)

    async def buoc(s, phim):
        await s.pg.evaluate('p=>TVP0.khung(1,p)', phim)

    async def anh(s):
        return Image.open(io.BytesIO(await s.pg.screenshot(type='jpeg', quality=90)))


def bot(cau):
    """LUẬT BOT CHUNG cho A và B (chỉ khác cách bấm V):
    – đi tới mục tiêu còn sống gần nhất (Chuông Gỗ, quái gác, Bọ); trong 62 px thì chạm Chém mỗi 14 tick; không né Chuông Gỗ;
      Bọ đang báo trước / húc mà Lam ở phía trước trong 200 px → lùi (nhảy khi nó húc tới gần).
    – NHÓM 3 NHÁT: nhát đầu của nhóm chỉ tính khi không có bóng đang phát. Lúc lẽ ra chạm nhát thứ 4 (14 tick sau nhát 3), hoặc khi mục tiêu
      chết giữa nhóm → GỌI BÓNG.  A: chạm V ở nhát đầu nhóm (bắt đầu ghi) + chạm V lúc gọi (dừng → phát).  B: chỉ chạm V lúc gọi.
    Không dời quái, không đặt lại gì trong trận."""
    s = {'n': 0, 'nhom': 0, 'goi': 0, 'trung_lam': 0, 'hurt0': 0, 'chet': {}, 'muc': None}

    def f(i, st):
        so = s
        if st['hurt'] > 0 and so['hurt0'] <= 0: so['trung_lam'] += 1
        so['hurt0'] = st['hurt']
        song = []
        for q in st['q']:
            k = 'q%d' % q['i']
            if q['chet']:
                so['chet'].setdefault(k, i)
            else: song.append((k, q['x'], None))
        for b in st['bo']:
            k = 'bo%d' % b['i']
            if b['chet']: so['chet'].setdefault(k, i)
            else: song.append((k, b['x'], b))
        ban = st['echo'] is not None and not st['echo']['done']
        goi = False
        if so['muc'] and so['muc'] in so['chet'] and so['nhom'] > 0: goi = True   # mục tiêu chết giữa nhóm → gọi
        if not song: return None   # hết mục tiêu: không gọi bóng nữa (A đang ghi thì bỏ dở, không phát)
        k, x, b = min(song, key=lambda t: abs(t[1] - st['lx'])); so['muc'] = k
        d = x - st['lx']; h = 'r' if d > 0 else 'l'; xa = 'l' if d > 0 else 'r'
        phim = ''
        if b and b['st'] in ('bao', 'huc') and (st['lx'] - x) * b['face'] > 0 and abs(d) < 200:
            phim = xa + ('j' if b['st'] == 'huc' and abs(d) < 150 and st['g'] else '')
        elif abs(d) > 62:
            phim = h; so['n'] = 0
        else:
            so['n'] += 1
            if so['n'] % 14 == 1:
                if so['nhom'] >= 3: goi = True
                else:
                    if so['nhom'] == 0 and ban: pass                       # chưa bắt đầu nhóm khi bóng còn phát
                    else:
                        if so['nhom'] == 0 and cau == 'a' and st['rec'] < 0: phim += 'v'   # A: bắt đầu ghi ở nhát đầu nhóm
                        so['nhom'] += 1
                    phim += 'a'
        if goi:
            so['nhom'] = 0; so['goi'] += 1
            if cau == 'b' or st['rec'] >= 0: phim += 'v'
        return phim
    return f, s


JS_ST = 'TVVB.trangThai()'


def nhan_hien(c):
    _, cau, q, _ = c
    return ('A · Ghi chủ động' if cau == 'a' else 'B · Vọng Chiến') + (' · tốn nấc' if 'nac=1' in q and cau == 'b' else ' · miễn phí') + (' · debug' if 'debug' in q else '')


async def chay(b, cong, ten, cau_hinh, video=True, toi_da=6000):
    """cau_hinh: [(nhãn, cau 'a'|'b', query, video_nhom)]; video_nhom: tên file mp4 mà trang này góp 1 ô (trái → phải)"""
    T = [await Trang(b, cong, q).mo() for _, _, q, _ in cau_hinh]
    bots = [bot(c) for _, c, _, _ in cau_hinh]
    nhom = {}
    for j, (_, _, _, v) in enumerate(cau_hinh):
        if v: nhom.setdefault(v, []).append(j)
    ff = {v: ffmpeg(os.path.join(OUT, v), 960 * len(js), 540) for v, js in nhom.items()} if video else {}
    xong = [False] * len(T); tick_xong = [None] * len(T); n = 0
    for i in range(toi_da):
        for j, t in enumerate(T):
            if xong[j]: continue
            st = await t.js(JS_ST)
            k = bots[j][0](i, st)
            if k is None:
                xong[j] = True; tick_xong[j] = i; k = ''
            await t.buoc(k)
        if video:
            for v, js in nhom.items():
                g = Image.new('RGB', (960 * len(js), 540))
                for c, j in enumerate(js):
                    im = await T[j].anh(); nhan(im, nhan_hien(cau_hinh[j])); g.paste(im, (c * 960, 0))
                ff[v].stdin.write(jpg(g))
        n += 1
        if all(xong): break
    # thêm 60 bước sau khi xong (cho thấy kết thúc; bóng cuối phát xong → được tính)
    for _ in range(60):
        for t in T: await t.buoc('')
        if video:
            for v, js in nhom.items():
                g = Image.new('RGB', (960 * len(js), 540))
                for c, j in enumerate(js):
                    im = await T[j].anh(); nhan(im, nhan_hien(cau_hinh[j])); g.paste(im, (c * 960, 0))
                ff[v].stdin.write(jpg(g))
    for p in ff.values(): p.stdin.close(); p.wait()
    kq = {}
    for j, (nh, cau, q, v) in enumerate(cau_hinh):
        t = T[j]; s = bots[j][1]
        tk = await t.js('TVVB.tk()'); ph = await t.js('TVVB.phat()')
        log = await t.js('TVVB.log()'); logp = await t.js('TVP0.log()')
        kq[nh] = {'query': q, 'tick_xong': tick_xong[j], 'chet_luc': s['chet'], 'lam_bi_trung': s['trung_lam'], 'bot_goi': s['goi'], 'tk': tk, 'phat': ph,
                  'loi_trang': t.loi, 'thieu_ket_cuc': (await t.js('TVP0.tk()'))['thieu']}
        fn = os.path.join(OUT, '%s-log-%s.txt' % (ten, nh.replace(' ', '-').replace('·', '').replace('--', '-').lower()))
        open(fn, 'w', encoding='utf-8').write('\n'.join(['== Vọng (?debug=vong)'] + log + ['', '== P0 (trúng / Cộng hưởng)'] + logp) + '\n')
        await t.pg.close()
    print(ten, n, 'bước', {k: (v['tick_xong'], v['tk']['phat'], v['tk']['hut'], v['tk']['chBong'], v['loi_trang']) for k, v in kq.items()})
    return kq


async def main():
    can = sys.argv[1:] or ['luot1', 'luot2']
    os.chdir(GOC)
    srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Im, directory=GOC)); cong = srv.server_address[1]
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    kq_p = os.path.join(OUT, 'ket-qua.json'); kq = json.load(open(kq_p, encoding='utf-8')) if os.path.exists(kq_p) else {}
    async with async_playwright() as p:
        b = await p.chromium.launch()
        if 'luot1' in can:
            kq['luot1'] = await chay(b, cong, 'luot1', [
                ('A sach', 'a', '&vong=a', '1-sach-A-vs-B.mp4'), ('B sach', 'b', '&vong=b', '1-sach-A-vs-B.mp4'),
                ('A debug', 'a', '&vong=a&hitbox=1&debug=vong', '2-debug-A-vs-B.mp4'), ('B debug', 'b', '&vong=b&hitbox=1&debug=vong', '2-debug-A-vs-B.mp4')])
            json.dump(kq, open(kq_p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        if 'luot2' in can:
            kq['luot2'] = await chay(b, cong, 'luot2', [('A mien phi', 'a', '&vong=a&nac=1', None), ('B nac', 'b', '&vong=b&nac=1', None)], video=False)
            json.dump(kq, open(kq_p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        await b.close()
    srv.shutdown()


if __name__ == '__main__':
    asyncio.run(main())
