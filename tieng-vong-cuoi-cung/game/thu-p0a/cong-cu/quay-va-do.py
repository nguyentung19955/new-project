#!/usr/bin/env python3
"""Quay video 60 hình/s (mỗi hình = 1 bước logic; debug chậm: mỗi tick giữ 4 hình = ¼ tốc độ) + đo trang thử P0-A → game/thu-p0a/video/
Video H.264 (-preset veryfast). Bật lớp hộp đòn (?hitbox=1) + log input (?debug=input). Đầu vào do kịch bản bấm phím / đặt cần gạt giả.
Không phải kiểm thử tự động: chỉ quay + ghi số đo ra do-*.json / log-*.txt để chủ dự án xem.
Cần playwright + Chromium + ffmpeg + Pillow.   Chạy: python3 -B game/thu-p0a/cong-cu/quay-va-do.py [ten-canh ...]"""
import asyncio, functools, http.server, io, json, os, socketserver, subprocess, sys, threading
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
GOC = os.path.normpath(os.path.join(HERE, '..', '..', '..'))
OUT = os.path.join(GOC, 'game', 'thu-p0a', 'video'); os.makedirs(OUT, exist_ok=True)
try:
    FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 20)
    FONT_S = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 15)
except Exception:
    FONT = FONT_S = ImageFont.load_default()


class Im(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def ffmpeg(dst, w=960, h=540):
    return subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '60', '-c:v', 'mjpeg', '-i', '-',
                             '-vf', 'format=yuv420p', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-r', '60', '-movflags', '+faststart', dst],
                            stdin=subprocess.PIPE)


class Trang:
    """một trang game ở chế độ tự bước (?ghi=1)"""
    def __init__(s, p, cong, q):
        s.p, s.cong, s.q, s.st = p, cong, q, {'f': 0}

    async def mo(s):
        s.b = await s.p.chromium.launch()
        s.pg = await s.b.new_page(viewport={'width': 960, 'height': 540}, device_scale_factor=1)
        s.loi = []; s.pg.on('pageerror', lambda e: s.loi.append(str(e)))
        await s.pg.route('https://fonts.g*/**', lambda r: r.abort())
        await s.pg.goto('http://127.0.0.1:%d/game/thu-p0a/index.html?ghi=1&hitbox=1&debug=input&battu=1%s' % (s.cong, s.q))
        await s.pg.wait_for_function('window.TVDEMO && TVDEMO.ready', timeout=120000)
        await s.pg.evaluate('TVP0.batDau()'); await s.pg.evaluate('TVP0.anUI(1)')
        return s

    async def js(s, e, *a):
        return await s.pg.evaluate(e, *a) if a else await s.pg.evaluate(e)

    async def buoc(s, phim='', cam=None):
        s.st = await s.pg.evaluate('([p,c])=>TVP0.khung(1,p,c)', [phim, cam])
        return s.st

    async def anh(s):
        return Image.open(io.BytesIO(await s.pg.screenshot(type='png')))

    async def dong(s):
        await s.b.close()


def nhan(im, chu, mau=(255, 230, 160), y=0, nen=(12, 15, 20, 200)):
    d = ImageDraw.Draw(im, 'RGBA'); w = d.textlength(chu, font=FONT)
    d.rectangle([0, y, w + 16, y + 28], fill=nen); d.text((8, y + 3), chu, font=FONT, fill=mau)
    return im


def jpg(im):
    b = io.BytesIO(); im.convert('RGB').save(b, 'JPEG', quality=88); return b.getvalue()


# ---------------------------------------------------------------- kịch bản
NOM = '(PA.x0+10)*T'          # x trái hình nộm (Q[6])
GAC = 5                        # chỉ số quái gác trong Q


async def dat_nom(t, dx=-82):
    await t.js('TVP0.datLaiQuai(6)'); await t.js('TVP0.datLam(%s+%d,1)' % (NOM, dx)); await t.js('TVP0.xoaLog()')


def tl_bam(bam, n):
    """dòng thời gian: tập tick có bấm Chém → danh sách phím mỗi tick"""
    return ['a' if i in bam else '' for i in range(n)]


async def canh_so_sanh(p, cong, ten, phan, cap=True):
    """chạy CÙNG kịch bản trên nhịp cũ (?p0=0) và mới, ghép 2 khung cạnh nhau → 1920×540"""
    A = await Trang(p, cong, '&p0=0').mo(); B = await Trang(p, cong, '').mo()
    ff = ffmpeg(os.path.join(OUT, ten)); n = 0; logs = {'cu': [], 'moi': []}
    for tieu_de, chuan_bi, buoc_fn, so in phan:
        for t in (A, B): await chuan_bi(t)
        sA, sB = {}, {}
        for i in range(so):
            kA = buoc_fn(i, A, sA); kB = buoc_fn(i, B, sB)
            if asyncio.iscoroutine(kA): kA = await kA
            if asyncio.iscoroutine(kB): kB = await kB
            await A.buoc(*kA); await B.buoc(*kB)
            ia, ib = await A.anh(), await B.anh()
            nhan(ia, 'CŨ  ?p0=0 · ' + tieu_de, (255, 176, 138)); nhan(ib, 'MỚI  P0-A · ' + tieu_de, (127, 224, 200))
            g = Image.new('RGB', (1920, 540)); g.paste(ia, (0, 0)); g.paste(ib, (960, 0))
            ff.stdin.write(jpg(g)); n += 1
        logs['cu'] += ['== ' + tieu_de] + await A.js('TVP0.log()') + ['tk ' + json.dumps(await A.js('TVP0.tk()'))]
        logs['moi'] += ['== ' + tieu_de] + await B.js('TVP0.log()') + ['tk ' + json.dumps(await B.js('TVP0.tk()'))]
    ff.stdin.close(); ff.wait()
    loi = A.loi + B.loi; await A.dong(); await B.dong()
    for k in logs: open(os.path.join(OUT, ten.replace('.mp4', '-log-%s.txt' % k)), 'w', encoding='utf-8').write('\n'.join(logs[k]) + '\n')
    print('%s: %d khung (%.1f s), lỗi trang %d' % (ten, n, n / 60, len(loi)))
    return {'file': ten, 'khung': n, 'giay': round(n / 60, 2), 'loi_trang': loi}


async def canh_don(p, cong, ten, q, phan):
    """một trang, nhiều phần; phần = (tiêu đề, chuẩn bị, hàm bước, số bước)"""
    t = await Trang(p, cong, q).mo(); ff = ffmpeg(os.path.join(OUT, ten)); n = 0; logs = []
    for tieu_de, chuan_bi, buoc_fn, so in phan:
        await chuan_bi(t); s = {}
        for i in range(so):
            k = buoc_fn(i, t, s)
            if asyncio.iscoroutine(k): k = await k
            if k is None: break
            await t.buoc(*k)
            im = nhan(await t.anh(), tieu_de, (127, 224, 200))
            ff.stdin.write(jpg(im)); n += 1
        logs += ['== ' + tieu_de] + await t.js('TVP0.log()') + ['tk ' + json.dumps(await t.js('TVP0.tk()'))]
    ff.stdin.close(); ff.wait(); loi = t.loi; await t.dong()
    open(os.path.join(OUT, ten.replace('.mp4', '-log.txt')), 'w', encoding='utf-8').write('\n'.join(logs) + '\n')
    print('%s: %d khung (%.1f s), lỗi trang %d' % (ten, n, n / 60, len(loi)))
    return {'file': ten, 'khung': n, 'giay': round(n / 60, 2), 'loi_trang': loi}


# ---- 1. combo cũ vs mới
def kb_tl(bam):
    return lambda i, t, s: ('a' if i in bam else '', None)


async def bi_danh_buoc(i, t, s):
    """đứng trước Chuông Gỗ Q[3]; khi nó lấy đà ≥ 20 tick: bấm Chém, 3 tick sau bấm nữa (vào chờ);
    bị đập → 2 tick sau bấm (đang bị đánh); hết bị đánh bấm tiếp"""
    q = await t.js('({st:Q[3].st,t:Q[3].t,h:pl.hurtT})')
    if 'pha' not in s: s['pha'] = 0
    k = ''
    if s['pha'] == 0 and q['st'] == 'wind' and q['t'] >= 20: s['pha'] = 1; s['i'] = i; k = 'a'
    elif s['pha'] == 1 and i == s['i'] + 3: k = 'a'; s['pha'] = 2
    elif s['pha'] == 2 and q['h'] > 8: s['pha'] = 3; s['i'] = i
    elif s['pha'] == 3 and i == s['i'] + 2: k = 'a'; s['pha'] = 4
    elif s['pha'] == 4 and q['h'] == 0 and i % 2 == 0: k = 'a'; s['pha'] = 5; s['i'] = i
    elif s['pha'] == 5 and i == s['i'] + 4: k = 'a'; s['pha'] = 6
    return (k, None)


async def chuan_bi_bi_danh(t):
    await t.js('TVP0.datLaiQuai(3); TVP0.datLaiQuai(4); TVP0.datLam(Q[3].x-60,1); TVP0.xoaLog()')


def cheo(goc_do, bam_luc, n):
    import math
    dx, dy = math.cos(math.radians(goc_do)), -math.sin(math.radians(goc_do))
    return lambda i, t, s: ('a' if i in bam_luc else '', [dx, dy] if i < n - 20 else None)


async def canh_1(p, cong):
    return await canh_so_sanh(p, cong, '1-combo-cu-vs-moi.mp4', [
        ('bấm nhanh: 5 lần trong 9 tick', dat_nom, kb_tl({0, 2, 4, 6, 8}), 80),
        ('bấm sớm: 4–5 tick sau mỗi nhát', dat_nom, kb_tl({0, 5, 25, 30, 50, 55}), 110),
        ('bấm đều 16 tick', dat_nom, kb_tl({0, 16, 32, 64, 80, 96}), 130),
        ('bấm khi bị Chuông Gỗ đánh', chuan_bi_bi_danh, bi_danh_buoc, 200),
        ('chạy + cần chéo lên 30°, rồi 50°', lambda t: t.js('TVP0.datLam(%s-250,1); TVP0.xoaLog(); TVP0.datLaiQuai(6)' % NOM), cheo(30, {24}, 60), 60),
        ('cần chéo lên 50°', lambda t: t.js('TVP0.datLam(%s-250,1); TVP0.datLaiQuai(6)' % NOM), cheo(50, {24}, 60), 60),
    ])


# ---- 2. Chuông Gỗ: khựng / không ngắt / chết
async def cg_buoc(i, t, s):
    q = await t.js('({st:Q[3].st,t:Q[3].t,x:Q[3].x+36,hp:Q[3].hp,lx:pl.x+10,atk:pl.atkN,dash:pl.dash})')
    d = q['x'] - q['lx']; ve = 'r' if d > 0 else 'l'; xa = 'l' if d > 0 else 'r'
    pha = s.setdefault('pha', 0)
    if q['st'] in ('die',) or q['hp'] <= 0: return ('', None) if i < s.setdefault('ket', i + 90) else None
    if pha == 0:   # chém ngay khi nó mới bắt đầu lấy đà (< 18 tick) → khựng; 2 nhát (1 nhát vào chỗ chờ) rồi lùi
        if i >= 34: s['pha'] = 1; s['i0'] = i
        return ('a' if i in (0, 3) else '', None)
    if pha == 1:   # lùi ra, chờ nó lấy đà
        if i - s['i0'] < 30: return (xa, None)
        if q['st'] == 'wind' and q['t'] >= 19 and abs(d) <= 100: s['pha'] = 2; s['i0'] = i; return ('a', None)
        if abs(d) > 85: return (ve, None)
        return ('', None)
    if pha == 2:   # chém trúng lúc lấy đà ≥ 18 (không ngắt) rồi lướt ra sau lưng né đòn đập
        if i - s['i0'] == 9: return (ve + 's', None)
        if i - s['i0'] < 40: return ('', None)
        s['pha'] = 3; return ('', None)
    # pha 3: đánh tới chết, quay mặt về phía nó
    if abs(d) > 90: return (ve, None)
    if q['st'] == 'wind' and q['t'] > 16: return (xa + ('s' if q['t'] > 24 else ''), None)
    return ((ve if i % 6 == 0 else '') + ('a' if i % 2 == 0 else ''), None)


async def canh_2(p, cong):
    async def cb(t): await t.js('TVP0.datLaiQuai(3); TVP0.datLaiQuai(4); TVP0.datLam(Q[3].x-60,1); TVP0.xoaLog()')
    return await canh_don(p, cong, '2-chuong-go.mp4', '', [('Chuông Gỗ [40]: khựng · lấy đà ≥ 18 không ngắt · chết', cb, cg_buoc, 900)])


# ---- 3. quái gác: Keng → nứt → vỡ → choáng → hồi phục → ổn định → phá lại → chết
async def gac_buoc(i, t, s):
    g = await t.js('({p:Q[5].T.pha,v:Q[5].T.v,t:Q[5].T.t,hp:Q[5].hp,st:Q[5].st,atk:pl.atkN,at:pl.atkT,x:Q[5].x+36,lx:pl.x+10})')
    pha = s.setdefault('pha', 0); d = g['x'] - g['lx']
    if g['hp'] <= 0 or g['st'] == 'die': return ('', None) if i < s.setdefault('ket', i + 100) else None
    if abs(d) > 92: return ('r', None)
    nhip = lambda: 'a' if g['atk'] == 0 or (g['atk'] < 3 and g['at'] >= 10) else ''
    if pha == 0:   # combo tới khi vỡ
        if g['p'] == 'choang': s['pha'] = 1; s['i0'] = i; return ('', None)
        return (nhip(), None)
    if pha == 1:   # 1 nhát máu lúc choáng, rồi đứng xem hết choáng
        if i - s['i0'] == 20: return ('a', None)
        if g['p'] == 'onDinh': s['pha'] = 2; s['i0'] = i
        return ('', None)
    if pha == 2:   # đánh trong ổn định: vỏ vẫn chặn, Thế không xuống dưới 1
        if g['p'] == 'thuong': s['pha'] = 3; s['i0'] = i; return ('', None)
        return (nhip() if i - s['i0'] > 6 else '', None)
    if pha == 3:   # hết ổn định: phá lại rồi hạ
        return (nhip(), None)
    return ('', None)


async def canh_3(p, cong):
    async def cb(t): await t.js('TVP0.datLaiQuai(5); TVP0.datLam(Q[5].x-260,1); TVP0.xoaLog()')
    return await canh_don(p, cong, '3-quai-gac-the.mp4', '', [('Quái gác [30, Thế 60, vỏ]: Keng → vỡ → choáng 120 → hồi phục 20 → ổn định 60', cb, gac_buoc, 1400)])


# ---- 4. replay / Cộng hưởng
def ghi_bong(off, the=10, muc='gac'):
    """ghi Vọng: V, 8 tick sau Chém 1 nhát, chờ, V (bóng phát). Rồi Lam chém sao cho hộp Lam = hộp bóng + off tick.
    off None: Lam không chém (bóng một mình)."""
    async def buoc(i, t, s):
        if i == 0: return ('v', None)
        if i == 8: return ('a', None)
        if i == 40: return ('v', None)
        if i == 41:
            k = (await t.js('TVP0.recHb()'))[0]; su = await t.js('ATK[1].su')
            if muc == 'gac': await t.js('TVP0.datLaiQuai(%d); TVP0.datThe(%d,%d); Q[%d].T.lastHit=S.frame+500' % (GAC, GAC, the, GAC))
            else: await t.js('TVP0.datLaiQuai(6)')
            s['fv'] = t.st['f']   # tick của bước bấm V (bóng phát REC[0])
            s['ban'] = None if off is None else s['fv'] + k + off - su
            await t.js('TVP0.P0.ghi("— bóng sẽ chém ở tick %d; Lam %s")' % (s['fv'] + k, 'không chém' if off is None else 'bấm ở f%d → hộp tick %d (lệch %+d)' % (s['ban'] + 1, s['fv'] + k + off, off)))
        if s.get('ban') is not None and t.st['f'] == s['ban']: s['ban'] = None; return ('a', None)
        if i > 150: return None
        return ('', None)
    return buoc


async def canh_4(p, cong):
    async def cb_gac(t): await t.js('TVP0.datLaiQuai(%d); TVP0.datLam(Q[%d].x-85,1); TVP0.xoaLog(); echo=null; rec=null' % (GAC, GAC))
    async def cb_nom(t): await t.js('TVP0.datLaiQuai(6); TVP0.datLam(%s-82,1); TVP0.xoaLog(); echo=null; rec=null' % NOM)
    r = [await canh_don(p, cong, '4-replay-cong-huong.mp4', '', [
        ('Hộp bóng bật 8 tick trên hình nộm → trúng 1 lần (D bóng bền)', cb_nom, ghi_bong(None, muc='nom'), 160),
        ('Cùng tick: Lam + bóng vào quái gác Thế 10 → gom, cả hai bị chặn, +10', cb_gac, ghi_bong(0), 150),
        ('Khác tick: bóng trước 5 tick (Thế 10) → tổng 10', cb_gac, ghi_bong(5), 150),
        ('Khác tick: Lam trước 5 tick (Thế 10) → Lam phá vỏ, bóng 2 + 10 = 12', cb_gac, ghi_bong(-5), 150),
        ('Cộng hưởng vỏ đầy (Thế 60) → vỡ ngay', cb_gac, ghi_bong(0, the=60), 150),
    ])]
    r.append(await canh_don(p, cong, '4b-so-loi-D-moi-moi-tick.mp4', '&dmoi=1', [
        ('CHỈ ĐỂ SO LỖI (?dmoi=1): D bóng mới mỗi tick → 1 hộp trúng nhiều lần', cb_nom, ghi_bong(None, muc='nom'), 150)]))
    return r


# ---- 5. debug chậm: quy ước tick (¼ tốc độ, mỗi tick 4 hình)
async def canh_5(p, cong):
    A = await Trang(p, cong, '&p0=0').mo(); B = await Trang(p, cong, '').mo()
    ff = ffmpeg(os.path.join(OUT, '5-debug-cham-quy-uoc-tick.mp4')); n = 0; bang = {}
    for t in (A, B): await t.js('TVP0.datLam((PA.x0+4)*T,1); TVP0.xoaLog()')
    for t in (A, B):
        for _ in range(6): await t.buoc()
        await t.js('TVP0.xoaLog()')
    for i in range(34):
        for t in (A, B): await t.buoc('a' if i == 0 else '')
        hang = []
        for t, ten in ((A, 'cu'), (B, 'moi')):
            tk = (await t.js('TVP0.tick()'))[-1]; bang.setdefault(ten, []).append(tk); hang.append(tk)
        ia, ib = await A.anh(), await B.anh()
        for im, tk, ten, mau in ((ia, hang[0], 'CŨ  su 11 · vệt bat_dau 10', (255, 176, 138)), (ib, hang[1], 'MỚI  su 7 · vetBatDau 7', (127, 224, 200))):
            nhan(im, ten + ' · ¼ tốc độ', mau)
            s = 'tick đòn %s  │  hộp %s  │  khung %s  │  vệt %s' % (tk['atkT'] or '–', 'BẬT' if tk['hop'] else '–', tk['khung'] or '–', tk['vet'] if tk['vet'] >= 0 else '–')
            nhan(im, s, (255, 90, 90) if tk['hop'] else (240, 240, 240), y=500)
        g = Image.new('RGB', (1920, 540)); g.paste(ia, (0, 0)); g.paste(ib, (960, 0))
        for _ in range(4): ff.stdin.write(jpg(g)); n += 1
    ff.stdin.close(); ff.wait(); await A.dong(); await B.dong()
    json.dump(bang, open(os.path.join(OUT, '5-bang-tick.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    kq = {}
    for ten, L in bang.items():
        hop = [r['atkT'] for r in L if r['hop'] and r['atkN'] == 1]
        vet0 = [r['atkT'] for r in L if r['vet'] == 0 and r['atkN'] == 1]
        vet_dau = next((r for r in L if r['vet'] >= 0 and r['atkN'] == 1), None)
        trung = next((r['atkT'] for r in L if r['atkN'] == 1 and r['khung'].endswith('trung')), None)
        kq[ten] = {'hop_tick': [hop[0], hop[-1]] if hop else None, 'khung_trung_tu_tick': trung,
                   'vet_hien_lan_dau': {'tick': vet_dau['atkT'], 'khung_vet': vet_dau['vet']} if vet_dau else None,
                   'vet_khung0_o_tick': vet0, 'lech_vet_so_hop': (vet_dau['atkT'] - hop[0]) if (vet_dau and hop) else None,
                   'lech_khung_so_hop': (trung - hop[0]) if (trung and hop) else None}
    print('5-debug-cham: %d khung' % n, json.dumps(kq, ensure_ascii=False))
    return {'file': '5-debug-cham-quy-uoc-tick.mp4', 'khung': n, 'giay': round(n / 60, 2), 'ket_qua': kq}


# ---- 6. đo nhanh không quay: độ trễ chạm → hộp, combo đủ 3 nhát, tỉ lệ hất khi chạy, mọi lần bấm có kết cục
async def do_so(p, cong):
    kq = {}
    for q, ten in (('&p0=0', 'cu'), ('', 'moi')):
        t = await Trang(p, cong, q).mo(); r = {}
        # (a) chạm lúc rảnh → hộp: 20 lần, mỗi kiểu atk1 / atk5 (cần lên phím) / atk6 (trên không)
        await t.js('TVP0.datLam((PA.x0+4)*T,1); TVP0.xoaLog()')
        for _ in range(20):
            await t.buoc('a')
            for _ in range(45): await t.buoc('')
        L = await t.js('TVP0.log()')
        r['tre_cham_hop_ranh'] = sorted(set(int(x.split('→ hộp ')[1].split(' ')[0]) for x in L if '→ hộp ' in x))
        # (b) bấm nhanh liên tục (mỗi 3 tick) 120 tick: số nhát ra, số lần bấm, thiếu kết cục
        await t.js('TVP0.datLam((PA.x0+4)*T,1); TVP0.xoaLog()')
        for i in range(160): await t.buoc('a' if i % 3 == 0 and i < 120 else '')
        r['bam_nhanh_moi_3_tick_120'] = await t.js('TVP0.tk()')
        # (c) bấm sớm (4 tick sau khi mỗi nhát bắt đầu) – số nhát combo nối được
        await t.js('TVP0.datLam((PA.x0+4)*T,1); TVP0.xoaLog()')
        for i in range(400):
            st = t.st; k = ''
            if i and st['atkN'] and st['atkT'] == 4: k = 'a'
            elif i == 0 or (not st['atkN'] and i % 50 == 0): k = 'a'
            await t.buoc(k)
        L = await t.js('TVP0.log()')
        r['bam_som_4_tick'] = {'atk2': sum('thuc-hien atk2' in x or '→ atk2' in x for x in L), 'atk3': sum('thuc-hien atk3' in x or '→ atk3' in x for x in L),
                               'mat': sum('MAT' in x or 'het-han' in x for x in L), 'tk': await t.js('TVP0.tk()')}
        # (d) chạy + cần chéo lên ở các góc: chém hất hay chém thường
        import math
        r['cheo_len'] = {}
        for goc in (15, 25, 30, 35, 40, 44, 46, 50, 60):
            await t.js('TVP0.datLam((PA.x0+3)*T,1); TVP0.xoaLog()')
            dx, dy = math.cos(math.radians(goc)), -math.sin(math.radians(goc))
            for i in range(40): await t.buoc('a' if i == 20 else '', [dx, dy])
            L = await t.js('TVP0.log()'); r['cheo_len'][goc] = 'HẤT' if any('HẤT' in x and ('→' in x) for x in L) else 'thường'
        kq[ten] = r; await t.dong()
    json.dump(kq, open(os.path.join(OUT, 'do-so.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('do-so', json.dumps(kq, ensure_ascii=False)[:2000])
    return kq


async def main():
    srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Im, directory=GOC)); cong = srv.server_address[1]
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    chon = sys.argv[1:] or ['do', '1', '2', '3', '4', '5']
    kq = {}
    async with async_playwright() as p:
        for c in chon:
            if c == 'do': kq['do_so'] = await do_so(p, cong)
            else: kq['canh_' + c] = await globals()['canh_' + c](p, cong)
    f = os.path.join(OUT, 'ket-qua.json'); cu = json.load(open(f)) if os.path.exists(f) else {}
    cu.update(kq); json.dump(cu, open(f, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    srv.shutdown()


asyncio.run(main())
