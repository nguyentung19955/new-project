#!/usr/bin/env python3
"""Quay + đo trang thử Lam mới 2 (game/thu-lam-moi-2/index.html) → game/thu-lam-moi-2/xem-thu/
Không phải bộ kiểm thử tự động: chỉ quay ảnh / GIF / video + ghi số đo ra do-trong-game.json để người duyệt xem.
  1. đo  : lịch chém 1 theo từng bước (atkT, hộp bật, hình A/B/C/D) + chạy (đổi ô sau bao nhiêu px) → do-trong-game.json
  2. gif : chạy + chém TRÊN NỀN THẬT (phòng A), cắt quanh Lam, đúng cỡ game (112) và phóng 2x; màu và bóng đen; chém với ?vfx=0
  3. video: chơi thật (KHÔNG bất tử) 60 hình/s – trên: Lam mới, dưới: Lam cũ (?lam=cu), cùng chuỗi phím → so-moi-cu-60fps.mp4
            + choi-that-vfx0-hitbox-60fps.mp4 (Lam mới, tắt VFX, hiện hộp đòn) – duyệt tạo dáng / vùng chạm
  4. anh : màn có nút cảm ứng kiểu iPhone ngang (844×390, chạm) → man-choi-co-nut.png
  6. bo3 : BỘ TƯ THẾ 3 – GIF từng động tác (màu + bóng đen, ≈toàn tốc + chậm 4) → xem-thu/bo3/ ; videobo3: video chơi thật qua đủ động tác
  7. bo4 : BỘ TƯ THẾ 4 – GIF combo 1→2→3, hất, trên không, lướt, bị đánh (thật), tường lưng áp vách trái/phải + ảnh dải vệt mẫu → xem-thu/bo4/ ;
            videobo4: video chơi thật (không bất tử) qua đủ động tác
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


def luu_gif(fr, ten, ms=1000 / 60, buoc=1, dither=True):
    """fr: list ảnh mỗi bước logic; GIF lấy mỗi `buoc` bước, dồn dư 10 ms. dither=False: không rải điểm (file nhỏ hơn nhiều)"""
    chon = fr[::buoc]; du = 0; ds = []
    for _ in chon:
        t = ms * buoc + du; r = max(20, int(round(t / 10)) * 10); du = t - r; ds.append(r)
    pal = [f.quantize(colors=255, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG if dither else Image.Dither.NONE) for f in chon]
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


# ---------------- BỘ TƯ THẾ 3 (PH13 mục 2 + 5) ----------------
TRANG_THAI_JS = ('[pl.m2n, pl.a2, pl.atkN, pl.atkT, +pl.vy.toFixed(2), pl.onGround, S.hitstop, pl.hp, LM2.bo, '
                 '!!(pl.atkN && atkBox(pl,pl.atkN,pl.atkT,pl.face,{})), pl.atkBounced]')
FONT_N = None


def nho(im, chu):
    global FONT_N
    if FONT_N is None:
        try: FONT_N = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 12)
        except Exception: FONT_N = ImageFont.load_default()
    o = Image.new('RGB', (im.width, im.height + 18), (12, 15, 20)); o.paste(im, (0, 0))
    ImageDraw.Draw(o).text((4, im.height + 2), chu, font=FONT_N, fill=(243, 230, 200)); return o


async def bo3(b, cong):
    """GIF từng động tác ở đúng cỡ game (Lam ~112 px, viewport 960×540 @1x) trên NỀN THẬT phòng A. Mỗi GIF: TRÁI màu có vệt,
    PHẢI bóng đen (?bong=1&vfx=0) – hai trang chạy cùng phím, cùng bước. Dưới mỗi hình: tư thế · trạng thái · bước.
    Ra xem-thu/bo3/<động-tác>.gif (≈ toàn tốc: GIF tối đa 50 hình/s → mỗi bước 20 ms = 0,83×) + <động-tác>-cham4.gif (67 ms/bước) + log-bo3.json."""
    BD = os.path.join(OUT, 'bo3'); os.makedirs(BD, exist_ok=True)
    A = await Trang(b, cong, '').mo(); B = await Trang(b, cong, 'bong=1&vfx=0').mo()
    log = {'ghi_chu': 'mỗi dòng 1 bước logic 60 Hz: [tư thế, trạng thái, atkN, atkT, vy, chạm đất, khựng, máu, bộ sheet, hộp bật, đã nảy]'}

    async def dat(x, f):
        for t in (A, B): await t.js('TVP0.datLam(%s, %d)' % (x, f)); await t.buoc('', 40)

    async def quay(ten, kb, khung, w=220, h=170, duoi=22):
        """kb: list (phím) mỗi bước, hoặc hàm (i, trạng thái) → phím; khung: 'lam' (bám chân) hoặc (x, y) điểm cố định trong THẾ GIỚI"""
        fr = []; lg = []; st = await A.js(TRANG_THAI_JS)
        n = len(kb) if isinstance(kb, list) else kb('n', None)
        for i in range(n):
            ph = kb[i] if isinstance(kb, list) else kb(i, st)
            await A.buoc(ph); await B.buoc(ph); st = await A.js(TRANG_THAI_JS); lg.append(st)
            if khung == 'lam': p = await A.lam_man(); X, Y = p['x'], p['y']
            else: X, Y = await A.js('([x, y]) => [x - ox, y - oy]', list(khung))   # điểm THẾ GIỚI cố định → màn (camera trôi theo Lam)
            a = cat(await A.anh(), X, Y, w, h, duoi); c = cat(await B.anh(), X, Y, w, h, duoi)
            o = Image.new('RGB', (2 * w + 4, h), (12, 15, 20)); o.paste(a, (0, 0)); o.paste(c, (w + 4, 0))
            fr.append(nho(o, '%s · %s%s · bước %d%s' % (st[0], st[1], (' atkT %d' % st[3]) if st[2] else '', i + 1, ' · khựng' if st[6] else '')))
        luu_gif(fr, 'bo3/%s.gif' % ten, ms=20, dither=False); luu_gif(fr, 'bo3/%s-cham4.gif' % ten, ms=4000 / 60, dither=False)
        log[ten] = lg; print(ten, len(fr), 'bước', ''.join('' if j and lg[j - 1][0] == r[0] else ' ' + r[0] for j, r in enumerate(lg)))

    x0 = '(PA.x0+5)*T'
    await dat(x0, 1); await A.buoc('', 80); await B.buoc('', 80); await quay('dung', [''] * 130, 'lam')   # 40 + 80 = 120 bước đứng → vòng mới bắt đầu ở I1
    await dat(x0, 1); await quay('chay', [''] * 4 + ['r'] * 70 + [''] * 16, 'lam')
    await dat('Q[6].x-70', 1); await quay('chem1', [''] * 4 + ['a'] + [''] * 34, 'lam', w=240)
    the = 'pl.x+pl.w/2, pl.y+pl.h'
    await dat(x0, 1); p = await A.js('[%s]' % the)
    await quay('nhay-roi-tiep-dat', [''] * 4 + ['j'] * 18 + [''] * 50, (p[0] + 20, p[1]), w=240, h=300, duoi=30)
    await dat('Q[6].x+16', 1); p = await A.js('[%s]' % the)

    def pogo(i, st):
        if i == 'n': return 150
        if i < 12: return 'j'
        return 'da' if (st[4] > 5 and st[2] != 4) else ''   # bổ khi đã rơi gần hình nộm → thấy P1, P2 rồi nảy P3
    await quay('pogo-trung-hinh-nom', pogo, (p[0], p[1]), w=260, h=380, duoi=20)
    await dat('(PA.x0+1)*T', -1); p = await A.js('[%s]' % the)
    await quay('bam-truot-tuong', [''] * 4 + ['lj'] * 20 + ['l'] * 50 + ['lj'] + ['r'] * 12 + [''] * 30, (p[0] + 40, p[1]), w=260, h=300, duoi=30)
    json.dump(log, open(os.path.join(BD, 'log-bo3.json'), 'w'), ensure_ascii=False)
    print('loi', A.loi, B.loi)


KICH_BAN_BO3 = ([('', 130)] + [('r', 60), ('', 20)]                                                  # đứng 2 s, chạy, dừng
                + [('a', 1), ('', 34)]                                                                # chém 1 hình nộm
                + [('j', 18), ('', 50)]                                                               # nhảy-rơi-tiếp đất
                + [('POGO', 3), ('', 30)]                                                             # tới hình nộm, nhảy, pogo trúng 3 lần
                + [('l', 170), ('lj', 20), ('l', 50), ('lj', 1), ('r', 14), ('', 40)]                 # vách trái: bám, trượt, nhảy tường
                + [('r', 330), ('', 10), ('a', 1), ('', 30), ('a', 1), ('', 30), ('r', 20), ('rj', 14), ('r', 10), ('', 60)])   # sang phòng B, Chuông Gỗ


async def video_bo3(b, cong):
    """chơi thật KHÔNG bất tử, 60 hình/s, Lam mới bộ 3: đứng → chạy → chém 1 → nhảy-rơi-tiếp đất → pogo hình nộm → bám/trượt/nhảy tường
    → sang phòng B gặp Chuông Gỗ. Góc trên: tư thế hiện tại (nhãn máy hình). → xem-thu/bo3/choi-that-bo3-60fps.mp4 + log"""
    BD = os.path.join(OUT, 'bo3'); os.makedirs(BD, exist_ok=True)
    A = await Trang(b, cong, '').mo()
    await A.js('TVP0.datLam((PA.x0+3)*T, 1)'); await A.buoc('', 1)
    ff = ffmpeg(os.path.join(BD, 'choi-that-bo3-60fps.mp4'), 960, 540); lg = []
    i = 0
    async def mot(ph):
        nonlocal i
        await A.buoc(ph); i += 1; s = await A.js(TRANG_THAI_JS); lg.append(s)
        ff.stdin.write(jpg(nhan(await A.anh(), 'Lam mới bộ 3 · %s · %s · máu %d · bước %d' % (s[0], s[1], s[7], i))))

    for phim, k in KICH_BAN_BO3:
        if phim == 'POGO':   # lái như người chơi: đi tới hình nộm, nhảy, bổ xuống khi đang rơi gần, nảy k lần rồi để rơi xuống đất
            nay = 0; nhay = 0; da_bat = False; f_nay = await A.js('LM2.nay ? LM2.nay.f : -1')
            for _ in range(400):
                st = await A.js('[Q[6].x+Q[6].w/2-(pl.x+pl.w/2), pl.onGround, pl.vy, pl.atkN, pl.atkBounced]')
                dx, dat_, vy, an, bn = st; hg = 'r' if dx > 3 else 'l' if dx < -3 else ''
                if nay >= k:
                    if dat_ and da_bat: break
                    ph = 'r' if nay >= k else ''
                elif dat_ and nhay == 0:
                    ph = hg if abs(dx) > 3 else 'j'
                    if ph == 'j': nhay = 12
                elif nhay > 0: ph = 'j' + hg; nhay -= 1
                else: ph = ('da' + hg) if (vy > 5 and an != 4) else hg
                await mot(ph)
                f = await A.js('LM2.nay ? LM2.nay.f : -1')
                if f != f_nay: f_nay = f; nay += 1; da_bat = True      # mỗi sự kiện nảy (pogoBounce) đếm 1 lần
            continue
        for _ in range(k):
            st = await A.js('[pl.vy, pl.atkN]')
            ph = phim
            if phim == 'da' and not (st[0] > 0): ph = ''          # pogo chỉ bấm khi đang rơi
            await mot(ph)
    ff.stdin.close(); ff.wait()
    json.dump({'ghi_chu': TRANG_THAI_JS, 'buoc': lg}, open(os.path.join(BD, 'log-video.json'), 'w'), ensure_ascii=False)
    seen = sorted({r[0] for r in lg}); print('video bo3', i, 'bước, tư thế đã hiện:', seen, 'máu cuối', lg[-1][7], A.loi, await A.lam_man())


# ---------------- BỘ TƯ THẾ 4 (29/10): chém 2/3, hất, trên không, lướt, bị đánh, tường LƯNG áp vách ----------------
TRANG_THAI4_JS = ('[pl.m2n, pl.a2, pl.atkN, pl.atkT, +pl.vy.toFixed(2), pl.onGround, S.hitstop, pl.hp, LM2.bo, '
                  '!!(pl.atkN && atkBox(pl,pl.atkN,pl.atkT,pl.face,{})), pl.hurtT, pl.dash, pl.face, pl.m2l]')


async def bo4(b, cong):
    """GIF ở đúng cỡ game (Lam ~112 px, 960×540 @1x), NỀN THẬT. TRÁI = màu có vệt mẫu, PHẢI = bóng đen (?bong=1&vfx=0), cùng phím cùng bước.
    Ra xem-thu/bo4/<động-tác>.gif (≈ toàn tốc, 20 ms/bước) + -cham4.gif (67 ms/bước) + log-bo4.json
    + dai-vet-<đòn>.png: mỗi bước active (± 1) một ô phóng 2 lần – hàng trên vệt mẫu, hàng dưới có hộp đòn (?hitbox=1)."""
    BD = os.path.join(OUT, 'bo4'); os.makedirs(BD, exist_ok=True)
    A = await Trang(b, cong, '').mo(); B = await Trang(b, cong, 'bong=1&vfx=0').mo()
    log = {'ghi_chu': 'mỗi dòng 1 bước logic 60 Hz: [tư thế, trạng thái, atkN, atkT, vy, chạm đất, khựng, máu, bộ sheet, hộp bật, hurtT, dash, hướng, lật]'}

    async def dat(x, f, cho=40):
        for t in (A, B): await t.js('TVP0.datLam(%s, %d)' % (x, f)); await t.buoc('', cho)

    async def quay(ten, kb, khung, w=240, h=170, duoi=22, cat_lai=None):
        fr = []; lg = []; st = await A.js(TRANG_THAI4_JS)
        n = len(kb) if isinstance(kb, list) else kb('n', None)
        for i in range(n):
            ph = kb[i] if isinstance(kb, list) else kb(i, st)
            await A.buoc(ph); await B.buoc(ph); st = await A.js(TRANG_THAI4_JS); lg.append(st)
            if khung == 'lam': p = await A.lam_man(); X, Y = p['x'], p['y']
            else: X, Y = await A.js('([x, y]) => [x - ox, y - oy]', list(khung))
            a = cat(await A.anh(), X, Y, w, h, duoi); c = cat(await B.anh(), X, Y, w, h, duoi)
            o = Image.new('RGB', (2 * w + 4, h), (12, 15, 20)); o.paste(a, (0, 0)); o.paste(c, (w + 4, 0))
            fr.append(nho(o, '%s · %s%s · bước %d%s' % (st[0], st[1], (' atkT %d' % st[3]) if st[2] else '', i + 1, ' · khựng' if st[6] else '')))
        if cat_lai:
            i0, i1 = cat_lai(lg); fr = fr[i0:i1]; lg = lg[i0:i1]
        luu_gif(fr, 'bo4/%s.gif' % ten, ms=20, dither=False); luu_gif(fr, 'bo4/%s-cham4.gif' % ten, ms=4000 / 60, dither=False)
        log[ten] = lg; print(ten, len(fr), 'bước', ''.join('' if j and lg[j - 1][0] == r[0] else ' ' + r[0] for j, r in enumerate(lg)))

    the = 'pl.x+pl.w/2, pl.y+pl.h'
    # 1. combo 1 → 2 → 3 vào hình nộm (bấm lại trong recovery = cửa sổ nối cũ; khựng khi trúng)
    await dat('Q[6].x-70', 1); p = await A.js('[%s]' % the)
    await quay('combo-1-2-3', [''] * 4 + ['a'] + [''] * 15 + ['a'] + [''] * 15 + ['a'] + [''] * 45, (p[0] + 40, p[1]), w=300, h=190)
    # 2. hất (lên + chém) vào hình nộm
    await dat('Q[6].x-70', 1); p = await A.js('[%s]' % the)
    await quay('hat', [''] * 4 + ['ua'] + [''] * 36, (p[0] + 40, p[1]), w=280, h=220)
    # 3. chém trên không: nhảy cạnh hình nộm, chém khi đang lên
    await dat('Q[6].x-80', 1); p = await A.js('[%s]' % the)
    await quay('chem-tren-khong', [''] * 4 + ['j'] * 8 + ['ja'] + ['j'] * 10 + [''] * 50, (p[0] + 40, p[1]), w=300, h=300, duoi=30)
    # 4. lướt: 2 lần trên đất (chờ hồi lướt), khung cố định theo thế giới
    x0 = '(PA.x0+4)*T'
    await dat(x0, 1); p = await A.js('[%s]' % the)
    await quay('luot', [''] * 4 + ['s'] + [''] * 30 + ['s'] + [''] * 24, (p[0] + 110, p[1]), w=360, h=170)
    # 5. bị đánh THẬT: đứng cạnh Chuông Gỗ phòng B (Q[3]) chờ nó đập – cắt từ 20 bước trước cú trúng tới 45 bước sau
    await dat('Q[3].x-40', 1, 10)

    def cho_danh(i, st):
        return 150 if i == 'n' else ''

    def cat_danh(lg):
        k = next((j for j, r in enumerate(lg) if r[0] == 'BD1'), None)
        return (0, len(lg)) if k is None else (max(0, k - 20), min(len(lg), k + 45))
    await quay('bi-danh', cho_danh, 'lam', w=280, h=190, cat_lai=cat_danh)
    # 6. tường LƯNG áp vách: vách TRÁI phòng A (hình gốc) rồi vách PHẢI (khối cổng làng cột 28 – hình lật), có nhảy tường
    await dat('(PA.x0+1)*T', -1); p = await A.js('[%s]' % the)
    await quay('tuong-lung-vach-trai', [''] * 4 + ['lj'] * 20 + ['l'] * 50 + ['lj'] + ['r'] * 12 + [''] * 30, (p[0] + 50, p[1]), w=280, h=300, duoi=30)
    await dat('26*T', 1); p = await A.js('[%s]' % the)
    await quay('tuong-lung-vach-phai', [''] * 4 + ['rj'] * 20 + ['r'] * 50 + ['rj'] + ['l'] * 12 + [''] * 30, (p[0] + 10, p[1]), w=280, h=300, duoi=30)
    json.dump(log, open(os.path.join(BD, 'log-bo4.json'), 'w'), ensure_ascii=False)
    print('loi', A.loi, B.loi)
    # ẢNH DẢI VỆT: chém vào không khí (xa hình nộm) – mỗi bước su−1 … su+ac một ô
    C = await Trang(b, cong, 'hitbox=1').mo(); D = await Trang(b, cong, '').mo()
    for ten, n, kb, dx, dy in [('chem2', 2, ['a'] + [''] * 14 + ['a'] + [''] * 24, 50, 0), ('chem3', 3, ['a'] + [''] * 14 + ['a'] + [''] * 14 + ['a'] + [''] * 24, 40, 0),
                               ('hat', 5, ['ua'] + [''] * 24, 40, 0), ('chem-tren-khong', 6, ['j'] * 6 + ['ja'] + ['j'] * 20, 45, 0)]:
        o = {}
        for t in (C, D): await t.js('TVP0.datLam(Q[6].x+200, 1)'); await t.buoc('', 30)
        for key, t in (('mau', D), ('hop', C)):
            ds = []
            for ph in kb:
                await t.buoc(ph); r = await t.js('[pl.atkN,pl.atkT,LM2.phaChem(pl.atkT,pl.atkN),pl.m2n,!!(pl.atkN&&atkBox(pl,pl.atkN,pl.atkT,pl.face,{}))]')
                if r[0] == n and ATK_SU[n] - 1 <= r[1] <= ATK_SU[n] + 8:
                    p = await t.lam_man(); ds.append((r, cat(await t.anh(), p['x'] + dx, p['y'] + dy, 190, 180, 24)))
            o[key] = ds
        m = min(len(o['mau']), len(o['hop'])); w, h = o['mau'][0][1].size; W2, H2 = w * 2, h * 2
        im = Image.new('RGB', (m * (W2 + 6) + 6, 2 * (H2 + 30) + 10), (30, 33, 40)); d = ImageDraw.Draw(im)
        for i in range(m):
            for j, k in enumerate(('mau', 'hop')):
                r, c = o[k][i]; x = 6 + i * (W2 + 6); y = 6 + j * (H2 + 30)
                d.text((x, y), 'atkT %d · %s · %s%s' % (r[1], r[3], TEN_PHA_CHEM[r[2]] if r[2] >= 0 else '(không vệt)', ' · HỘP' if r[4] else ''), font=FONT_N or FONT, fill=(243, 230, 200))
                im.paste(c.resize((W2, H2), Image.NEAREST), (x, y + 24))
        im.save(os.path.join(BD, 'dai-vet-%s.png' % ten)); print('dai-vet', ten, m)


ATK_SU = {2: 7, 3: 9, 5: 11, 6: 9}   # su THẬT lúc chạy (P0: 2 → 7, 3 → 9; 5, 6 giữ) – chỉ để chọn ô ảnh dải; máy hình đọc ATK trong game

KICH_BAN_BO4 = ([('', 40), ('r', 34), ('', 10)]                                                     # đứng → chạy tới hình nộm
                + [('a', 1), ('', 15), ('a', 1), ('', 15), ('a', 1), ('', 45)]                       # combo 1 → 2 → 3
                + [('ua', 1), ('', 36)]                                                              # hất
                + [('l', 12), ('', 6), ('j', 8), ('ja', 1), ('j', 10), ('', 40)]                     # chém trên không
                + [('l', 40), ('', 8), ('s', 1), ('', 30)]                                           # lướt
                + [('l', 120), ('lj', 20), ('l', 50), ('lj', 1), ('r', 14), ('', 40)]                # vách trái: bám, trượt lưng áp vách, nhảy tường
                + [('r', 300), ('', 10), ('a', 1), ('', 16), ('a', 1), ('', 16), ('a', 1), ('', 30)]  # sang phòng B: combo vào Chuông Gỗ
                + [('', 90), ('s', 1), ('', 20), ('ua', 1), ('', 30), ('', 60), ('r', 20), ('rj', 14), ('r', 10), ('', 40)])   # chờ bị đánh, lướt, hất


async def video_bo4(b, cong):
    """chơi thật KHÔNG bất tử, 60 hình/s, Lam mới bộ 3 + 4 → xem-thu/bo4/choi-that-bo4-60fps.mp4 + log-video.json"""
    BD = os.path.join(OUT, 'bo4'); os.makedirs(BD, exist_ok=True)
    A = await Trang(b, cong, '').mo()
    await A.js('TVP0.datLam((PA.x0+5)*T, 1)'); await A.buoc('', 1)
    ff = ffmpeg(os.path.join(BD, 'choi-that-bo4-60fps.mp4'), 960, 540); lg = []; i = 0
    for phim, k in KICH_BAN_BO4:
        for _ in range(k):
            await A.buoc(phim); i += 1; s = await A.js(TRANG_THAI4_JS); lg.append(s)
            ff.stdin.write(jpg(nhan(await A.anh(), 'Lam mới bộ 3+4 · %s · %s · máu %d · bước %d' % (s[0], s[1], s[7], i))))
    ff.stdin.close(); ff.wait()
    json.dump({'ghi_chu': TRANG_THAI4_JS, 'buoc': lg}, open(os.path.join(BD, 'log-video.json'), 'w'), ensure_ascii=False)
    seen = sorted({r[0] for r in lg}); print('video bo4', i, 'bước, tư thế đã hiện:', seen, 'máu cuối', lg[-1][7], A.loi)


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
        if 'bo3' in viec: await bo3(b, cong)
        if 'videobo3' in viec: await video_bo3(b, cong)
        if 'bo4' in viec: await bo4(b, cong)
        if 'videobo4' in viec: await video_bo4(b, cong)
        await b.close()


if __name__ == '__main__':
    asyncio.run(main(sys.argv[1:] or ['do', 'gif', 'video', 'anh', 'vet']))
