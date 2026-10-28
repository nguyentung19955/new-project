#!/usr/bin/env python3
"""Quay + đo trang thử Lam mới 2 (game/thu-lam-moi-2/index.html) → game/thu-lam-moi-2/xem-thu/
Không phải bộ kiểm thử tự động: chỉ quay ảnh / GIF / video + ghi số đo ra do-trong-game.json để người duyệt xem.
  1. đo  : lịch chém 1 theo từng bước (atkT, hộp bật, hình A/B/C/D) + chạy (đổi ô sau bao nhiêu px) → do-trong-game.json
  2. gif : chạy + chém TRÊN NỀN THẬT (phòng A), cắt quanh Lam, đúng cỡ game (112) và phóng 2x; màu và bóng đen; chém với ?vfx=0
  3. video: chơi thật (KHÔNG bất tử) 60 hình/s – trên: Lam mới, dưới: Lam cũ (?lam=cu), cùng chuỗi phím → so-moi-cu-60fps.mp4
            + choi-that-vfx0-hitbox-60fps.mp4 (Lam mới, tắt VFX, hiện hộp đòn) – duyệt tạo dáng / vùng chạm
  4. anh : màn có nút cảm ứng kiểu iPhone ngang (844×390, chạm) → man-choi-co-nut.png
  5. vet : VỆT MẪU PH13 (chém 1 + pogo trượt / trúng) trên nền thật, 112 px, có / không hộp đòn, chậm ×4 + log từng bước → xem-thu/vet-ph13/
60 hình/s, mỗi hình = 1 bước logic. Chạy: python3 -B game/thu-lam-moi-2/cong-cu/quay-lam-moi-2.py [do gif video anh vet]"""
import asyncio, functools, http.server, io, json, os, socketserver, subprocess, sys, threading
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
GOC = os.path.normpath(os.path.join(HERE, '..', '..', '..'))
OUT = os.path.join(GOC, 'game', 'thu-lam-moi-2', 'xem-thu'); os.makedirs(OUT, exist_ok=True)
try:
    FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18)
except Exception:
    FONT = ImageFont.load_default()


class Im(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def ffmpeg(dst, w, h):
    return subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '60', '-c:v', 'mjpeg', '-i', '-',
                             '-vf', 'format=yuv420p', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-r', '60', '-movflags', '+faststart', dst],
                            stdin=subprocess.PIPE)


def jpg(im):
    b = io.BytesIO(); im.convert('RGB').save(b, 'JPEG', quality=88); return b.getvalue()


def nhan(im, chu, y=0):
    d = ImageDraw.Draw(im, 'RGBA'); w = d.textlength(chu, font=FONT)
    d.rectangle([0, y, w + 16, y + 26], fill=(12, 15, 20, 210)); d.text((8, y + 3), chu, font=FONT, fill=(243, 230, 200))
    return im


class Trang:
    def __init__(s, b, cong, q, vp=(960, 540), cham=False):
        s.b, s.cong, s.q, s.vp, s.cham = b, cong, q, vp, cham

    async def mo(s, ghi=True):
        ctx = await s.b.new_context(viewport={'width': s.vp[0], 'height': s.vp[1]}, device_scale_factor=1, has_touch=s.cham, is_mobile=s.cham)
        s.pg = await ctx.new_page()
        s.loi = []; s.pg.on('pageerror', lambda e: s.loi.append(str(e)))
        await s.pg.route('https://fonts.g*/**', lambda r: r.abort())
        await s.pg.goto('http://127.0.0.1:%d/game/thu-lam-moi-2/index.html?%s%s' % (s.cong, 'ghi=1&' if ghi else '', s.q))
        await s.pg.wait_for_function('window.TVDEMO && TVDEMO.ready', timeout=120000)
        await s.pg.evaluate('TVP0.batDau()')
        if ghi: await s.pg.evaluate('TVP0.anUI(1)')
        await s.pg.evaluate('TVP0.khung(30,"")')
        return s

    async def js(s, e, a=None):
        return await s.pg.evaluate(e, a)

    async def buoc(s, phim, n=1):
        await s.pg.evaluate('([p,n])=>TVP0.khung(n,p)', [phim, n])

    async def anh(s):
        return Image.open(io.BytesIO(await s.pg.screenshot(type='png'))).convert('RGB')

    async def lam_man(s):   # vị trí chân Lam trên màn (px logic = px ảnh chụp ở 960×540)
        return await s.js('({x:pl.x+pl.w/2-ox, y:pl.y+pl.h-oy, f:pl.face, a2:pl.a2, dang:LM2.dang, atkT:pl.atkT, atkN:pl.atkN, hp:pl.hp, room:S.room})')


async def do(b, cong):
    t = await Trang(b, cong, '').mo()
    await t.js('TVP0.datLam((PA.x0+6)*T, 1)'); await t.buoc('', 20)
    kq = {'quy_uoc': QUY_UOC, 'chem1': [], 'chay': []}
    await t.buoc('a')
    for i in range(30):
        r = await t.js('[pl.atkN,pl.atkT,!!atkBox(pl,pl.atkN,pl.atkT,pl.face,{}),LM2.dang,+(pl.x).toFixed(2),LM2.nhan,pl.atkN===1?LM2.phaChem(pl.atkT):-1,S.hitstop]')
        kq['chem1'].append({'buoc_sau_bam': i + 1, 'atkN': r[0], 'atkT': r[1], 'hop': r[2], 'hinh': r[3], 'tu_the': r[5],
                            'vet_pha': TEN_PHA_CHEM[r[6]] if r[6] >= 0 else '', 'hitstop': r[7], 'x': r[4]})
        await t.buoc('')
    # cho phép nối nhát 2 trong recovery (code cũ): bấm lại ở atkT 16
    await t.buoc('', 30); await t.buoc('a'); await t.buoc('', 14); await t.buoc('a')
    noi = []
    for i in range(12):
        noi.append(await t.js('[pl.atkN,pl.atkT,LM2.dang]')); await t.buoc('')
    kq['noi_nhat2_bam_luc_atkT15'] = noi
    await t.js('TVP0.datLam((PA.x0+3)*T, 1)'); await t.buoc('', 20)
    x0 = await t.js('pl.x'); truoc = None
    for i in range(70):
        await t.buoc('r'); r = await t.js('[+(pl.x).toFixed(2), pl.vx, LM2.dang, +(pl.pha).toFixed(4), pl.a2]')
        kq['chay'].append(r)
    # đổi ô: quãng giữa hai lần đổi (khi đã đủ tốc)
    doi = []; prev = None; xprev = None
    for x, vx, dang, pha, a2 in kq['chay']:
        if dang != prev and a2 == 'run' and abs(vx) >= 4.39:
            if xprev is not None: doi.append(round(x - xprev, 2))
            xprev = x
        prev = dang
    kq['chay_quang_moi_o_px'] = doi
    kq['loi_trang'] = t.loi
    json.dump(kq, open(os.path.join(OUT, 'do-trong-game.json'), 'w'), ensure_ascii=False, indent=1)
    print('chém:', [(r['atkT'], r['hop'], r['hinh']) for r in kq['chem1'][:24]])
    print('chạy quãng mỗi ô:', doi[:12]); print('nối nhát 2:', noi[:6]); print('lỗi:', t.loi)


QUY_UOC = ('Số bước theo ENGINE THẬT (PH13 mục 1.4): "buoc_sau_bam" 1 = bước bấm Chém, đã là atkT 1 (startAtk đặt 0 rồi cùng bước cộng 1). '
           'Hộp bật khi su ≤ atkT < su+ac (chém 1: su 7, ac 8 → atkT 7–14). A hiện 6 bước (atkT 1–6), B 4 (7–10), C 4 (11–14), D 8 (15–22). '
           'Không thêm tick startup. Bước khựng (hitstop) không cộng atkT – hình + vệt đứng yên, dòng log lặp lại cùng atkT.')
TEN_PHA_CHEM = ['nét mảnh', 'cung đầy', 'vỡ', 'mảnh tắt']
TEN_PHA_POGO = ['nêm bật', 'cung ép', 'mảnh tách', 'dấu nhỏ']


def cat(im, x, y, w=200, h=150, duoi=22):
    x0 = int(round(x - w / 2)); y0 = int(round(y - h + duoi))
    return im.crop((x0, y0, x0 + w, y0 + h))


def luu_gif(fr, ten, ms=1000 / 60, buoc=1):
    """fr: list ảnh mỗi bước logic; GIF lấy mỗi `buoc` bước, dồn dư 10 ms"""
    chon = fr[::buoc]; du = 0; ds = []
    for _ in chon:
        t = ms * buoc + du; r = max(20, int(round(t / 10)) * 10); du = t - r; ds.append(r)
    pal = [f.quantize(colors=255, method=Image.Quantize.MEDIANCUT) for f in chon]
    pal[0].save(os.path.join(OUT, ten), save_all=True, append_images=pal[1:], duration=ds, loop=0, disposal=1)


async def gif(b, cong):
    for q, tb in [('', 'mau'), ('&bong=1', 'bong')]:
        # CHẠY: từ đứng, chạy phải ~1,6 s (đủ tốc 264 px/s), cắt khung theo Lam (camera bám nên Lam gần như đứng yên trên màn – nền trôi)
        t = await Trang(b, cong, 'vfx=0' + q).mo()
        await t.js('TVP0.datLam((PA.x0+4)*T, 1)'); await t.buoc('', 20)
        fr = []
        for i in range(10): await t.buoc('r')
        for i in range(64):
            await t.buoc('r'); p = await t.lam_man(); fr.append(cat(await t.anh(), p['x'], p['y']))
        luu_gif(fr, 'chay-nen-that-112-%s.gif' % tb, buoc=2)   # 30 hình/s: mỗi ô giữ 3–4 bước nên không mất ô
        luu_gif([f.resize((f.width * 2, f.height * 2), Image.LANCZOS) for f in fr], 'chay-nen-that-2x-%s.gif' % tb, buoc=2)
        # CHÉM: đứng cạnh hình nộm, 2 lần chém 1 cách nhau (không nối), vfx=0
        await t.js('TVP0.datLam((PA.x0+8)*T, 1)'); await t.buoc('', 30)
        fr = []
        for lan in range(2):
            p = await t.lam_man(); X, Y = p['x'], p['y']
            await t.buoc('a'); fr.append(cat(await t.anh(), X + 30, Y, 240))
            for i in range(40): await t.buoc(''); fr.append(cat(await t.anh(), X + 30, Y, 240))
        luu_gif(fr, 'chem1-nen-that-112-%s.gif' % tb)
        luu_gif([f.resize((f.width * 2, f.height * 2), Image.LANCZOS) for f in fr], 'chem1-nen-that-2x-%s.gif' % tb, buoc=2)   # 2x: 30 hình/s (bản 112 giữ 60 hình/s)
        luu_gif([f.resize((f.width * 2, f.height * 2), Image.LANCZOS) for f in fr[:41]], 'chem1-nen-that-2x-%s-cham4.gif' % tb, ms=4000 / 60)
        print('gif', tb, t.loi)


KICH_BAN = ([('', 20)] + [('r', 70)] + [('', 10)] + [('a', 1), ('', 30)] + [('a', 1), ('', 14), ('a', 1), ('', 16), ('a', 1), ('', 40)]
            + [('l', 40), ('', 6), ('r', 30), ('rj', 14), ('r', 30), ('', 20)] + [('a', 1), ('', 12), ('ra', 1), ('r', 60)]
            + [('r', 150), ('', 10), ('a', 1), ('', 24), ('a', 1), ('', 24), ('a', 1), ('', 60)] + [('l', 50), ('', 30)])


async def vet(b, cong):
    """VỆT MẪU PH13 trên NỀN THẬT phòng A, đúng cỡ game (Lam cao ~112 px) – xem-thu/vet-ph13/:
    chem1-vet-112-{mau,hitbox}[-cham4].gif · pogo-{truot,trung}-112-{mau,hitbox}[-cham4].gif · dai-chem1-vet.png / dai-pogo-vet.png (mỗi bước
    active một ô, phóng 2 lần, có / không hộp đòn) · do-vet.json (log từng bước: atkT, hộp, tư thế, pha vệt, khựng, sự kiện nảy)."""
    VD = os.path.join(OUT, 'vet-ph13'); os.makedirs(VD, exist_ok=True)
    log = {'quy_uoc': QUY_UOC, 'quy_uoc_pogo': 'Pogo: ATK[4] su 0 → hộp bật NGAY atkT 1 (tick pogo), tới atkT 10; nảy đặt atkT 11 → hộp + vệt tắt cùng bước. '
           'P1 atkT 1–2, P2 từ 3; P3 từ bước nảy (đặt trong pogoBounce), 3 bước logic rồi về J2/J3/F.',
           'chem1': [], 'pogo_truot': [], 'pogo_trung': []}
    o = {}
    for q, tb in [('', 'mau'), ('hitbox=1', 'hitbox')]:
        t = await Trang(b, cong, q).mo()
        # CHÉM 1 cạnh hình nộm (trúng thật → có khựng)
        await t.js('TVP0.datLam(Q[6].x-70, 1)'); await t.buoc('', 40)
        p = await t.lam_man(); X, Y = p['x'], p['y']; fr = []; dai = []
        for i in range(30):
            await t.buoc('a' if i == 0 else '')
            r = await t.js('[pl.atkN,pl.atkT,!!atkBox(pl,pl.atkN,pl.atkT,pl.face,{}),LM2.nhan,pl.atkN===1?LM2.phaChem(pl.atkT):-1,S.hitstop]')
            im = await t.anh(); fr.append(cat(im, X + 40, Y, 220, 150))
            if tb == 'mau': log['chem1'].append({'buoc': i + 1, 'atkN': r[0], 'atkT': r[1], 'hop': r[2], 'tu_the': r[3], 'vet_pha': TEN_PHA_CHEM[r[4]] if r[4] >= 0 else '', 'hitstop': r[5]})
        if tb == 'mau': luu_gif(fr, 'vet-ph13/chem1-vet-112-%s.gif' % tb)
        luu_gif(fr, 'vet-ph13/chem1-vet-112-%s-cham4.gif' % tb, ms=4000 / 60)
        # ảnh dải: chém vào KHÔNG KHÍ (xa hình nộm) để tia trúng / số sát thương không che vệt
        await t.js('TVP0.datLam(Q[6].x+170, 1)'); await t.buoc('', 40); p = await t.lam_man(); X, Y = p['x'], p['y']
        for i in range(17):
            await t.buoc('a' if i == 0 else ''); r = await t.js('[pl.atkN,pl.atkT,pl.atkN===1?LM2.phaChem(pl.atkT):-1]')
            if 6 <= r[1] <= 15: dai.append((r[1], r[2], cat(await t.anh(), X + 40, Y, 170, 120, 16)))
        o['chem-' + tb] = dai
        # POGO trượt (không có gì bên dưới): thấy đủ 4 pha vệt
        await t.js('TVP0.datLam(Q[6].x-260, 1)'); await t.buoc('', 30)
        fr = []; dai = []; da = False
        for i in range(70):
            vy = await t.js('pl.vy')
            ph = 'j' if i < 14 else ('da' if (vy > 0 and not da) else '')
            if ph == 'da': da = True
            await t.buoc(ph); p = await t.lam_man()
            r = await t.js('[pl.atkN,pl.atkT,!!atkBox(pl,pl.atkN,pl.atkT,pl.face,{}),LM2.nhan,pl.atkN===4?LM2.phaPogo(pl.atkT):-1,S.hitstop,pl.atkBounced,+pl.vy.toFixed(2)]')
            im = await t.anh(); fr.append(cat(im, p['x'], p['y'] + 40, 180, 200, 0))
            if tb == 'mau': log['pogo_truot'].append({'buoc': i + 1, 'atkN': r[0], 'atkT': r[1], 'hop': r[2], 'tu_the': r[3], 'vet_pha': TEN_PHA_POGO[r[4]] if r[4] >= 0 else '', 'vy': r[7]})
            if r[0] == 4 and 1 <= r[1] <= 11 and not (dai and dai[-1][0] == r[1]): dai.append((r[1], r[4], cat(im, p['x'], p['y'] + 46, 120, 140, 0)))
        if tb == 'mau': luu_gif(fr, 'vet-ph13/pogo-truot-112-%s.gif' % tb)
        luu_gif(fr, 'vet-ph13/pogo-truot-112-%s-cham4.gif' % tb, ms=4000 / 60)
        o['pogo-' + tb] = dai
        # POGO trúng hình nộm (nảy → vệt tắt ngay, vòng va chạm tại điểm trúng); bấm xuống+chém khi đang rơi
        await t.js('TVP0.datLam(Q[6].x+16, 1)'); await t.buoc('', 30)
        fr = []
        for i in range(90):
            st = await t.js('[pl.vy, pl.atkN]')
            ph = 'j' if i < 12 else ('da' if (st[0] > 0 and st[1] != 4) else '')
            await t.buoc(ph); p = await t.lam_man()
            r = await t.js('[pl.atkN,pl.atkT,!!atkBox(pl,pl.atkN,pl.atkT,pl.face,{}),LM2.nhan,pl.atkN===4&&!pl.atkBounced?LM2.phaPogo(pl.atkT):-1,S.hitstop,pl.atkBounced,+pl.vy.toFixed(2),LM2.nay]')
            fr.append(cat(await t.anh(), p['x'], p['y'] + 90, 200, 280, 0))
            if tb == 'mau': log['pogo_trung'].append({'buoc': i + 1, 'phim': ph, 'atkN': r[0], 'atkT': r[1], 'hop': r[2], 'tu_the': r[3], 'vet_pha': TEN_PHA_POGO[r[4]] if r[4] >= 0 else '',
                                                    'hitstop': r[5], 'da_nay': r[6], 'vy': r[7], 'nay_cuoi': r[8]})
        if tb == 'mau': luu_gif(fr, 'vet-ph13/pogo-trung-112-%s.gif' % tb)
        luu_gif(fr, 'vet-ph13/pogo-trung-112-%s-cham4.gif' % tb, ms=4000 / 60)
        print('vet', tb, t.loi)
    json.dump(log, open(os.path.join(VD, 'do-vet.json'), 'w'), ensure_ascii=False, indent=1)
    # ảnh dải: mỗi bước một ô, phóng 2 lần (nearest – thấy điểm ảnh thật), hàng trên màu, hàng dưới có hộp đòn
    for ten, ds_m, ds_h, ten_pha in [('chem1', o['chem-mau'], o['chem-hitbox'], TEN_PHA_CHEM), ('pogo', o['pogo-mau'], o['pogo-hitbox'], TEN_PHA_POGO)]:
        n = min(len(ds_m), len(ds_h)); w, h = ds_m[0][2].size; W2, H2 = w * 2, h * 2
        im = Image.new('RGB', (n * (W2 + 6) + 6, 2 * (H2 + 30) + 10), (30, 33, 40)); d = ImageDraw.Draw(im)
        for i in range(n):
            for j, ds in enumerate((ds_m, ds_h)):
                at, pha, c = ds[i]; x = 6 + i * (W2 + 6); y = 6 + j * (H2 + 30)
                d.text((x, y), 'atkT %d · %s' % (at, ten_pha[pha] if pha >= 0 else '(không vệt)'), font=FONT, fill=(243, 230, 200))
                im.paste(c.resize((W2, H2), Image.NEAREST), (x, y + 24))
        im.save(os.path.join(VD, 'dai-%s-vet.png' % ten))


async def video(b, cong):
    """chơi thật (không ?battu): phòng A → B. Trên: Lam mới; dưới: Lam cũ – cùng chuỗi phím, cùng tick"""
    A = await Trang(b, cong, '').mo(); B = await Trang(b, cong, 'lam=cu').mo()
    for t in (A, B): await t.js('TVP0.datLam((PA.x0+3)*T, 1)'); await t.buoc('', 1)
    ff = ffmpeg(os.path.join(OUT, 'so-moi-cu-60fps.mp4'), 960, 1080)
    n = 0
    for phim, k in KICH_BAN:
        for i in range(k):
            await A.buoc(phim); await B.buoc(phim)
            a = nhan(await A.anh(), 'Lam MỚI 2 (thử)'); c = nhan(await B.anh(), 'Lam cũ (?lam=cu) – cùng phím')
            o = Image.new('RGB', (960, 1080)); o.paste(a, (0, 0)); o.paste(c, (0, 540)); ff.stdin.write(jpg(o)); n += 1
    ff.stdin.close(); ff.wait(); print('video so', n, 'hình', A.loi, B.loi, await A.lam_man())
    C = await Trang(b, cong, 'vfx=0&hitbox=1').mo()
    await C.js('TVP0.datLam((PA.x0+3)*T, 1)'); await C.buoc('', 1)
    ff = ffmpeg(os.path.join(OUT, 'choi-that-vfx0-hitbox-60fps.mp4'), 960, 540)
    for phim, k in KICH_BAN[:12]:
        for i in range(k):
            await C.buoc(phim); ff.stdin.write(jpg(nhan(await C.anh(), 'Lam mới 2 · ?vfx=0&hitbox=1')))
    ff.stdin.close(); ff.wait(); print('video vfx0', C.loi)


async def anh(b, cong):
    t = Trang(b, cong, '', vp=(844, 390), cham=True)
    await t.mo(ghi=False)
    await t.pg.touchscreen.tap(700, 300); await asyncio.sleep(0.4)
    await t.js('TVP0.datLam((PA.x0+7)*T, 1)')
    await asyncio.sleep(0.6)
    await t.pg.screenshot(path=os.path.join(OUT, 'man-choi-co-nut.png'))
    print('anh', t.loi)


async def main(viec):
    srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Im, directory=GOC)); cong = srv.server_address[1]
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    async with async_playwright() as p:
        b = await p.chromium.launch()
        if 'do' in viec: await do(b, cong)
        if 'gif' in viec: await gif(b, cong)
        if 'video' in viec: await video(b, cong)
        if 'anh' in viec: await anh(b, cong)
        if 'vet' in viec: await vet(b, cong)
        await b.close()


if __name__ == '__main__':
    asyncio.run(main(sys.argv[1:] or ['do', 'gif', 'video', 'anh', 'vet']))
