#!/usr/bin/env python3
"""Quay video + đo trang thử Âm Đao cấp 1–4 (game/thu-p0a/am-dao.html) → game/thu-p0a/video-am-dao/
  VIDEO SẠCH (không log, không hộp đòn – để xem CẢM GIÁC): 4 ô cùng lúc cấp 1 | 2 | 3 | 4, cùng phòng, cùng đối thủ, cùng kịch bản bấm
  VIDEO DEBUG (hộp đòn + log – để KIỂM LUẬT): giữ/nhả, vết Dư Âm, chống proc, Cộng hưởng, debug chậm ¼
  PH7: ph7 (tạm dừng / mất focus / chuyển tab, lướt huỷ & hồi chiêu, mục tiêu sau lưng), vung (bản đồ VFX phủ hộp), tudo (chiến đấu tự do 4 cấp)
  PH8: vetanh (vết Dư Âm bản sạch trước/sau), vung8 (bản đồ phủ sau sửa + ?pogo=moi), pogo (lệch ngang nảy được: cũ / mới), hop8 (debug hộp đổi + ?giu=16),
       kb (Dư Âm 3 kịch bản so: sạch + debug)
60 hình/s, H.264 -preset veryfast; mỗi hình = 1 bước logic (debug chậm: 4 hình / bước). Đầu vào do kịch bản bấm phím giả.
Không phải bộ kiểm thử tự động: chỉ quay + ghi số đo / log ra file để chủ dự án xem.
Chạy: python3 -B game/thu-p0a/cong-cu/quay-am-dao.py [sach debug cham do ...]   (cần playwright, Chromium, ffmpeg, Pillow)"""
import asyncio, functools, http.server, importlib.util, io, json, os, socketserver, sys, threading
from playwright.async_api import async_playwright
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
# dùng lại hàm của quay-va-do.py (P0-A) – nạp mã nguồn, BỎ dòng chạy main() ở cuối file đó
import types
QVD = types.ModuleType('qvd'); QVD.__file__ = os.path.join(HERE, 'quay-va-do.py')
_src = open(QVD.__file__, encoding='utf-8').read(); _src = _src[:_src.rindex('asyncio.run(main())')]
exec(compile(_src, QVD.__file__, 'exec'), QVD.__dict__)
ffmpeg, nhan, jpg, ghi_bong, Im = QVD.ffmpeg, QVD.nhan, QVD.jpg, QVD.ghi_bong, QVD.Im
GOC = QVD.GOC
OUT = os.path.join(GOC, 'game', 'thu-p0a', 'video-am-dao'); os.makedirs(OUT, exist_ok=True)


class Trang:
    """một trang am-dao.html ở chế độ tự bước (?ghi=1). sach=True: tắt log + hộp đòn"""
    def __init__(s, b, cong, cap, sach, them=''):
        s.b, s.cong, s.cap, s.sach, s.them, s.st = b, cong, cap, sach, them, {'f': 0}

    async def mo(s):
        s.pg = await s.b.new_page(viewport={'width': 960, 'height': 540}, device_scale_factor=1)
        s.loi = []; s.pg.on('pageerror', lambda e: s.loi.append(str(e)))
        await s.pg.route('https://fonts.g*/**', lambda r: r.abort())
        q = '?ghi=1&battu=1&cap=%d' % s.cap + ('' if s.sach else '&hitbox=1&debug=input') + s.them
        await s.pg.goto('http://127.0.0.1:%d/game/thu-p0a/am-dao.html%s' % (s.cong, q))
        await s.pg.wait_for_function('window.TVDEMO && TVDEMO.ready', timeout=120000)
        await s.pg.evaluate('TVP0.batDau()'); await s.pg.evaluate('TVP0.anUI(1)')
        return s

    async def js(s, e, *a):
        return await s.pg.evaluate(e, *a) if a else await s.pg.evaluate(e)

    async def buoc(s, phim='', cam=None):
        s.st = await s.pg.evaluate('([p,c])=>TVP0.khung(1,p,c)', [phim, cam]); return s.st

    async def anh(s):
        return Image.open(io.BytesIO(await s.pg.screenshot(type='jpeg', quality=92)))

    async def dong(s):
        await s.pg.close()


# ------------------------------------------------------------------ kịch bản (dùng chung cho mọi cấp)
NOM = '(PA.x0+10)*T'
QS = "({st:Q[%d].st,t:Q[%d].t,l:Q[%d].x,w:Q[%d].w,hp:Q[%d].hp,chet:Q[%d].dead||Q[%d].st==='die',lx:pl.x+pl.w/2,atkN:pl.atkN,hurt:pl.hurtT})"


def qs(i): return QS % ((i,) * 7)


async def cb_nom(t):
    await t.js('TVP0.datLaiQuai(6); TVP0.datLam(%s-82,1); TVAD.hoiNgay(); TVP0.xoaLog(); echo=null; rec=null' % NOM)
    for _ in range(4): await t.buoc()


def bot_nom(i, t, s):
    """hình nộm: combo 1-2-3, rồi GIỮ Chém 30 tick (cấp 3+: Dư Âm), rồi combo lại"""
    if i >= 300: return None
    if i in (0, 14, 28, 190, 204, 218): return ('a', None)
    if 100 <= i < 130: return ('a', None)
    return ('', None)


def cb_quai(idx, an_khac=True):
    async def cb(t):
        await t.js('TVP0.datLaiQuai(3); TVP0.datLaiQuai(4); TVP0.datLaiQuai(5); TVAD.hoiNgay(); echo=null; rec=null')
        if idx == 3: await t.js('Q[4].gone=true; TVAD.datQuai(3,(PB.x0+8)*T,-1); TVP0.datLam(Q[3].x-110,1)')
        if idx == 5: await t.js('TVP0.datLam(Q[5].x-85,1)')
        await t.js('TVP0.xoaLog()')
        for _ in range(4): await t.buoc()
    return cb


def bot_danh(idx, gan=78):
    """mở đầu GIỮ Chém 28 tick (cấp 1–2: chỉ nhát 1; cấp 3–4: nhát 1 + Dư Âm), lùi 16 tick, rồi áp sát chém đều tới khi địch chết"""
    async def buoc(i, t, s):
        q = await t.js(qs(idx))
        if q['chet']:
            s['xong'] = s.get('xong', 0) + 1
            if 'fchet' not in s: s['fchet'] = i
            return None if s['xong'] > 70 else ('', None)
        if i < 28: return ('a', None)
        if i < 44: return ('l', None)
        if i < 60: return ('', None)
        d = abs((q['l'] + q['w'] / 2) - q['lx'])
        huong = 'r' if q['l'] + q['w'] / 2 > q['lx'] else 'l'
        if d > gan + 30 and not q['atkN']: return (huong, None)
        s['n'] = s.get('n', 0) + 1
        return ('a' if s['n'] % 16 == 1 else '', None)
    return buoc


async def cb_bay(t):
    await t.js('TVP0.datLaiQuai(3); TVP0.datLaiQuai(4); Q[4].gone=true; TVAD.hoiNgay(); echo=null; rec=null; TVAD.datQuai(3,(PB.x0+5)*T,1); TVP0.datLam(Q[3].x+330,-1); TVP0.xoaLog()')
    for _ in range(4): await t.buoc()


def bot_bay(D=20):
    """bẫy: chờ Chuông Gỗ đập hụt; lúc nó hồi đòn, Lam bước tới cho mép địch cách mép hộp D px, GIỮ Chém 21 tick → nhả
    (cấp 3+: Dư Âm chém HỤT, vết đặt) → lướt lùi; Chuông Gỗ đi tiếp vào chỗ vết → vết vang"""
    async def buoc(i, t, s):
        q = await t.js(qs(3)); ph = s.setdefault('pha', 0)
        if ph == 0:
            if q['st'] == 'rec': s['pha'] = 1
            return ('', None)
        if ph == 1:
            gap = (q['lx'] - 90) - (q['l'] + q['w'])
            if gap > D + 2: return ('l', None)
            if gap < D - 2: return ('r', None)
            s['pha'] = 2; s['i0'] = i
        if s['pha'] == 2:
            if i - s['i0'] < 21: return ('a', None)
            s['pha'] = 3; s['i0'] = i
        if s['pha'] == 3:
            dat = any(v['on'] for v in await t.js('TVAD.vet()'))
            if dat or i - s['i0'] > 40: s['pha'] = 4; s['i0'] = i; return ('rs', None)   # vết đã đặt (hộp chém vang đã bật) → lướt lùi
            return ('', None)
        if s['pha'] == 4:
            if i - s['i0'] < 10: return ('r', None)
            if i - s['i0'] > 90: return None
        return ('', None)
    return buoc


async def quay_4o(b, cong, ten, phan, sach=True):
    """4 trang cấp 1..4 chạy song song cùng kịch bản; ghép 2×2 → 1920×1080"""
    T4 = [await Trang(b, cong, c, sach).mo() for c in (1, 2, 3, 4)]
    ff = ffmpeg(os.path.join(OUT, ten), 1920, 1080); n = 0; kq = {}; logs = {c: [] for c in (1, 2, 3, 4)}
    for tieu_de, cb, mk_bot, toi_da in phan:
        for t in T4: await cb(t)
        bots = [mk_bot() for _ in T4]; S = [{} for _ in T4]; xong = [False] * 4
        for i in range(toi_da):
            for j, t in enumerate(T4):
                k = None if xong[j] else bots[j](i, t, S[j])
                if asyncio.iscoroutine(k): k = await k
                if k is None: xong[j] = True; k = ('', None)
                await t.buoc(*k)
            g = Image.new('RGB', (1920, 1080))
            for j, t in enumerate(T4):
                im = await t.anh(); nhan(im, 'ÂM ĐAO CẤP %d  ·  %s' % (j + 1, tieu_de), (255, 217, 160)); g.paste(im, ((j % 2) * 960, (j // 2) * 540))
            ff.stdin.write(jpg(g)); n += 1
            if all(xong): break
        for j, t in enumerate(T4):
            tk = await t.js('Object.assign(TVAD.tk(), {trungLam: TVP0.tk().trung})')
            nom = await t.js('(Q[6].n10||[]).reduce((a,r)=>a+r[1],0)')
            kq.setdefault(tieu_de, {})['cap%d' % (j + 1)] = {'tick_chet': S[j].get('fchet'), 'bot': S[j].get('so'), 'tong_hinh_nom_10s': nom, 'tk': tk, 'thieu_ket_cuc': (await t.js('TVP0.tk()'))['thieu']}
            logs[j + 1] += ['== ' + tieu_de] + await t.js('TVP0.log()')
            await t.js('TVP0.xoaLog()')
    ff.stdin.close(); ff.wait()
    loi = sum([t.loi for t in T4], [])
    for t in T4: await t.dong()
    for c in logs: open(os.path.join(OUT, ten.replace('.mp4', '-log-cap%d.txt' % c)), 'w', encoding='utf-8').write('\n'.join(logs[c]) + '\n')
    print('%s: %d khung (%.1f s), lỗi trang %d' % (ten, n, n / 60, len(loi)))
    return {'file': ten, 'khung': n, 'giay': round(n / 60, 2), 'loi_trang': loi, 'ket_qua': kq}


async def canh_sach(b, cong):
    return await quay_4o(b, cong, '1-sach-cap-1-2-3-4.mp4', [
        ('Hình nộm: combo · GIỮ Chém · combo', cb_nom, lambda: bot_nom, 300),
        ('Chuông Gỗ: giữ Chém mở đầu rồi chém tới chết', cb_quai(3), lambda: bot_danh(3), 700),
        ('Quái gác (vỏ): giữ Chém mở đầu rồi chém tới chết', cb_quai(5), lambda: bot_danh(5, 60), 700),
        ('Bẫy Dư Âm: chém HỤT, lướt lùi, địch đi vào vết', cb_bay, lambda: bot_bay(20), 700),
    ])


# ------------------------------------------------------------------ debug: một trang, nhiều phần (hộp đòn + log)
async def canh_don(b, cong, ten, cap, phan, them=''):
    t = await Trang(b, cong, cap, False, them).mo(); ff = ffmpeg(os.path.join(OUT, ten)); n = 0; logs = []; kq = []
    for tieu_de, chuan_bi, buoc_fn, so in phan:
        await chuan_bi(t); s = {}
        tk0 = await t.js('TVAD.tk()')
        for i in range(so):
            k = buoc_fn(i, t, s)
            if asyncio.iscoroutine(k): k = await k
            if k is None: break
            await t.buoc(*k)
            ff.stdin.write(jpg(nhan(await t.anh(), tieu_de, (255, 217, 160)))); n += 1
        tk1 = await t.js('TVAD.tk()')
        logs += ['== ' + tieu_de] + await t.js('TVP0.log()') + ['tk P0 ' + json.dumps(await t.js('TVP0.tk()')), 'tk Âm Đao ' + json.dumps(tk1)]
        kq.append({'phan': tieu_de, 'tk_tang': {k: tk1[k] - tk0.get(k, 0) for k in tk1}, 'thieu_ket_cuc': (await t.js('TVP0.tk()'))['thieu']})
        await t.js('TVP0.xoaLog()')
    ff.stdin.close(); ff.wait(); loi = t.loi; await t.dong()
    open(os.path.join(OUT, ten.replace('.mp4', '-log.txt')), 'w', encoding='utf-8').write('\n'.join(logs) + '\n')
    print('%s: %d khung (%.1f s), lỗi trang %d' % (ten, n, n / 60, len(loi)))
    return {'file': ten, 'khung': n, 'giay': round(n / 60, 2), 'loi_trang': loi, 'phan': kq}


def giu(n, sau=70, them=None):
    """giữ Chém n tick rồi nhả, chờ `sau` tick. them: {tick: phím thêm}"""
    def f(i, t, s):
        if i >= n + sau: return None
        k = 'a' if i < n else ''
        if them and i in them: k += them[i]
        return (k, None)
    return f


async def cb_nom_dbg(t):
    await cb_nom(t); await t.js('TVP0.xoaLog()')


def cb_hoi(cap=None, hoi=True):
    async def cb(t):
        if cap: await t.js('TVAD.cap(%d)' % cap)
        await t.js('TVP0.datLaiQuai(6); TVP0.datLam(%s-82,1); echo=null; rec=null' % NOM)
        if hoi: await t.js('TVAD.hoiNgay()')
        for _ in range(3): await t.buoc()
        await t.js('TVP0.xoaLog()')
    return cb


async def cb_bi_danh(t):
    await t.js('TVP0.datLaiQuai(3); TVP0.datLaiQuai(4); Q[4].gone=true; TVAD.datQuai(3,(PB.x0+8)*T,-1); TVP0.datLam(Q[3].x-40,-1); TVAD.hoiNgay(); TVP0.xoaLog()')   # quay lưng: nhát 1 không trúng (không ngắt đòn đập)


def bot_bi_danh(i, t, s):
    """đứng trước Chuông Gỗ: khi nó lấy đà ≥ 8 tick thì bắt đầu GIỮ Chém; bị đập lúc đang giữ / đã nạp → xoá"""
    async def f():
        q = await t.js(qs(3))
        if s.get('bat') is None and q['st'] == 'wind' and q['t'] >= 8: s['bat'] = i
        if s.get('bat') is not None and i - s['bat'] > 120: return None
        return ('a' if s.get('bat') is not None and i - s['bat'] < 60 else '', None)
    return f()


async def canh_giu(b, cong):
    return await canh_don(b, cong, '2-debug-giu-nha.mp4', 3, [
        ('cấp 3 · chạm 1 tick → nhả sớm (chỉ đánh thường)', cb_hoi(3), giu(1, 40), 41),
        ('cấp 3 · giữ 15 → nhả sớm, không có kỹ năng', cb_hoi(), giu(15, 45), 60),
        ('cấp 3 · giữ 21 → nhả khi nhát 1 CHƯA xong → xếp hàng → tung khi hết re', cb_hoi(), giu(21, 90), 111),
        ('cấp 3 · giữ 22 → nhả ở tick cuối nhát 1 → xếp hàng 1 tick', cb_hoi(), giu(22, 90), 112),
        ('cấp 3 · giữ 40 → thế tụ → nhả → tung NGAY', cb_hoi(), giu(40, 90), 130),
        ('cấp 3 · giữ 100 → tụ quá 60 tick → TỰ TUNG (không kẹt)', cb_hoi(), giu(100, 40), 140),
        ('cấp 3 · giữ 30 rồi LƯỚT ở tick 26 → xoá, không mất hồi', cb_hoi(), giu(30, 50, {26: 's'}), 80),
        ('cấp 3 · dùng Dư Âm rồi giữ 40 khi ĐANG HỒI CHIÊU → không nạp', cb_hoi(), lambda i, t, s: None if i >= 180 else ('a' if i < 28 or 100 <= i < 140 else '', None), 180),
        ('cấp 3 · giữ 21 (xếp hàng) rồi CHẠM MỚI ngay → chạm mới thắng, kỹ năng xoá', cb_hoi(), giu(21, 60, {22: 'a'}), 81),
        ('cấp 3 · bị Chuông Gỗ đập lúc đang giữ → xoá (bi-danh)', cb_bi_danh, bot_bi_danh, 300),
        ('cấp 1 · giữ 40 → không có Dư Âm (chỉ nhát 1)', cb_hoi(1), giu(40, 40), 80),
        ('cấp 2 · giữ 40 → không có Dư Âm (chỉ nhát 1)', cb_hoi(2), giu(40, 40), 80),
        ('cấp 4 · giữ 30 → Dư Âm, vết [16,20]', cb_hoi(4), giu(30, 80), 110),
    ])


async def cb_vet(t):
    """phòng A: hình nộm + quái gác dời sang cạnh hình nộm (quái gác không đánh) để có ca 1 lần chém trúng 2 mục tiêu"""
    await t.js('TVAD.cap(3); TVP0.datLaiQuai(6); TVP0.datLaiQuai(5); TVAD.datQuai(5,Q[6].x+30,-1); Q[5].st="sleep"; TVP0.datLam(%s-82,1); TVAD.hoiNgay(); echo=null; rec=null' % NOM)
    for _ in range(3): await t.buoc()
    await t.js('TVP0.xoaLog()')


def bot_vet(i, t, s):
    """10 lần dùng Dư Âm: 1–4 trúng hình nộm; 5 trúng 2 mục tiêu; 6–10 HỤT (quay lưng / đứng xa). Rồi 10 nhát thường → 0 vết. Hồi chiêu đặt lại bằng công cụ"""
    async def f():
        lan = s.setdefault('lan', 0); i0 = s.setdefault('i0', 0)
        if lan < 10:
            if i == i0:
                await t.js('TVAD.hoiNgay()')
                if lan == 4: await t.js('TVP0.datLam(Q[6].x-60,1)')
                elif lan == 5: await t.js('TVP0.datLam(%s-82,-1)' % NOM)       # quay lưng → hụt
                elif lan == 7: await t.js('TVP0.datLam(%s-260,1)' % NOM)      # đứng xa → hụt
                elif lan < 4: await t.js('TVP0.datLam(%s-82,1)' % NOM)
            r = i - i0
            if r < 26: return ('a', None)
            if r < 70: return ('', None)
            s['lan'] = lan + 1; s['i0'] = i + 1; return ('', None)
        r = i - i0
        if r == 0: await t.js('TVP0.datLam(%s-82,1)' % NOM)
        if r >= 10 * 16 + 30: return None
        return ('a' if r % 16 == 0 and r < 160 else '', None)
    return f()


async def canh_vet(b, cong):
    return await canh_don(b, cong, '3-debug-vet-du-am.mp4', 3, [
        ('vết theo LẦN DÙNG: 10 lần Dư Âm (5 trúng – 1 lần trúng 2 con – 5 hụt) → đúng 10 vết; 10 nhát thường → 0 vết', cb_vet, bot_vet, 1200),
    ])


# ---- chống proc + Cộng hưởng
def bong_chem_vang(off_lam=None, vet_cung=False):
    """ghi Vọng: Lam GIỮ Chém (Dư Âm) trước hình nộm, dừng ghi, bóng phát lại chém vang. Bóng KHÔNG sinh vết.
    vet_cung: Lam dùng Dư Âm thật lần nữa để vết vang trùng lúc bóng + Lam trúng → vết 'k' không vào Cộng hưởng"""
    async def f(i, t, s):
        if i == 0: return ('v', None)
        if 2 <= i < 30: return ('a', None)
        if i == 80: return ('v', None)
        if i == 81: await t.js('TVAD.hoiNgay(); TVP0.datLaiQuai(6)'); s['vet0'] = (await t.js('TVAD.tk()'))['vet']
        if vet_cung and i == 84: return ('a', None)
        if vet_cung and 84 <= i < 112: return ('a', None)
        if i > 200: return None
        return ('', None)
    return f


def vet_cung_bong():
    """bóng phát lại nhát 1 đúng tick vết Dư Âm của Lam vang (cùng mục tiêu): gom 2 lần trúng, KHÔNG Cộng hưởng (vết 'k' không có co.ch).
    Lam giữ Chém sau khi dừng ghi sao cho vết vang = tick bóng chém; nhát của Lam đã cách xa > 12 tick nên cũng không ghép"""
    async def f(i, t, s):
        if i == 0: return ('v', None)
        if i == 70: return ('a', None)
        if i == 100: return ('v', None)
        if i == 101:
            k = (await t.js('TVP0.recHb()'))[0]; await t.js('TVAD.hoiNgay(); TVP0.datLaiQuai(6)')
            s['bong'] = t.st['f'] + k   # tick bóng chém (REC[0] phát ở bước bấm V)
            s['nha'] = s['bong'] - 30   # đo: nhả trong thế tụ ở tick R → vết vang ở tick R+30 (tick logic, hitstop không đếm)
            await t.js('TVP0.P0.ghi("— bóng sẽ chém ở f%d; Lam giữ Chém rồi nhả ở f%d để vết vang cùng tick")' % (s['bong'], s['nha']))
        if s.get('nha') is not None and s['nha'] - 32 <= t.st['f'] < s['nha']: return ('a', None)
        if i > 260: return None
        return ('', None)
    return f


async def cb_bong(t):
    await t.js('TVAD.cap(3); TVP0.datLaiQuai(6); TVP0.datLam(%s-82,1); TVAD.hoiNgay(); echo=null; rec=null' % NOM)
    for _ in range(3): await t.buoc()
    await t.js('TVP0.xoaLog()')


async def cb_gac_vet(t):
    await t.js('TVAD.cap(4); TVP0.datLaiQuai(5); TVP0.datLam(Q[5].x-85,1); TVAD.hoiNgay(); echo=null; rec=null')
    for _ in range(3): await t.buoc()
    await t.js('TVP0.xoaLog()')


def doi_cap_bong():
    """ghi ở cấp 1 (nhát 1 = 10), đổi lên cấp 2 TRƯỚC khi bóng phát: bóng giữ số đã chốt (2), Lam 12, thêm 12"""
    async def f(i, t, s):
        if i == 0: await t.js('TVAD.cap(1)'); return ('v', None)
        if i == 8: return ('a', None)
        if i == 40:
            await t.js('TVAD.cap(2)'); return ('v', None)
        if i == 41:
            k = (await t.js('TVP0.recHb()'))[0]; su = await t.js('ATK[1].su'); await t.js('TVP0.datLaiQuai(6)')
            s['ban'] = t.st['f'] + k - su
        if s.get('ban') is not None and t.st['f'] == s['ban']: s['ban'] = None; return ('a', None)
        if i > 150: return None
        return ('', None)
    return f


async def canh_proc(b, cong):
    GAC = 5
    async def cb_gac(t):
        await t.js('TVAD.cap(1); TVP0.datLaiQuai(%d); TVP0.datLam(Q[%d].x-85,1); TVP0.xoaLog(); echo=null; rec=null' % (GAC, GAC))
    async def cb_nom1(t):
        await t.js('TVAD.cap(1); TVP0.datLaiQuai(6); TVP0.datLam(%s-82,1); TVP0.xoaLog(); echo=null; rec=null' % NOM)
    async def cb_nom2(t):
        await t.js('TVAD.cap(1); TVP0.datLaiQuai(6); TVP0.datLam(%s-82,1); TVP0.xoaLog(); echo=null; rec=null' % NOM)
    return await canh_don(b, cong, '4-debug-chong-proc-cong-huong.mp4', 3, [
        ('bóng phát lại CHÉM VANG: bóng gây [15,20]×0,25/0,5, KHÔNG sinh vết (đếm vết không tăng)', cb_bong, bong_chem_vang(), 200),
        ("vết 'k' vang CÙNG TICK bóng chém vào hình nộm → gom 2 lần trúng, KHÔNG Cộng hưởng", cb_bong, vet_cung_bong(), 262),
        ('cấp 4 · vết vào quái gác còn vỏ → Keng, máu 0 (không thành 1), Thế −20', cb_gac_vet, giu(28, 60), 88),
        ('cấp 1 (Âm Đao) · hộp bóng bật 8 tick → trúng 1 lần (mã đòn bền)', cb_nom1, ghi_bong(None, muc='nom'), 160),
        ('cấp 1 · cùng tick Lam + bóng vào quái gác Thế 10 → gom, cả hai bị chặn, +10', cb_gac, ghi_bong(0), 150),
        ('cấp 1 · Lam trước 5 tick (Thế 10) → Lam phá vỏ, bóng 2 + thêm 10 = 12', cb_gac, ghi_bong(-5), 150),
        ('cấp 1 · quái gác ĐÃ MẤT VỎ, cùng tick → 10 + 2 + 10 = 22', cb_gac, ghi_bong(0, muc='gacvo'), 150),
        ('ghi ở cấp 1, đổi cấp 2 trước khi bóng phát → bóng 2 (đã chốt), Lam 12, thêm 12', cb_nom2, doi_cap_bong(), 160),
    ])


# ---- debug chậm ¼: âm nhận / hộp đòn / vết theo tick
async def canh_cham(b, cong):
    t = await Trang(b, cong, 3, False).mo(); ff = ffmpeg(os.path.join(OUT, '5-debug-cham-am-nhan-hop-don.mp4')); n = 0; bang = []
    await t.js('TVP0.datLaiQuai(6); TVP0.datLam(%s-82,1); TVAD.hoiNgay(); TVP0.xoaLog()' % NOM)
    for _ in range(3): await t.buoc()
    # nhát 1, combo 2, 3; rồi giữ → Dư Âm; chờ vết vang
    lich = {0: 'a', 3 + 7: 'a', 18 + 7: 'a'}
    for i in range(170):
        k = 'a' if (i in (0, 10, 25) or 70 <= i < 100) else ''
        await t.js('AD.batDo()')
        st = await t.buoc(k)
        do = await t.js('AD.layDo()') or []
        r = await t.js('''(()=>{const a=pl.atkN?ATK[pl.atkN]:null, hop=!!(a&&pl.atkT>=a.su&&pl.atkT<a.su+a.ac);
          const v=AD.VET.find(v=>v.on); return {f:S.frame, atkN:pl.atkN, atkT:pl.atkT, hop, khung: pl.h2&&pl.k2>=0?LAM.HD.meta.frames[pl.k2].ten:'',
          vet: v?{t:v.t, bat: !!(v.D&&v.t>=v.tre&&v.t<v.tre+v.bat)}:null};})()''')
        r['am_nhan'] = [d for d in do if not d['bong']]; bang.append(r)
        im = await t.anh()
        nhan(im, 'DEBUG CHẬM ¼ · cấp 3 · âm nhận chỉ sáng ở tick hộp bật; mép sáng = mép hộp', (255, 217, 160))
        an = r['am_nhan'][0] if r['am_nhan'] else None
        s = 'đòn %s tick %s │ hộp %s │ âm nhận %s │ vết %s' % (r['atkN'] or '–', r['atkT'] or '–', 'BẬT' if r['hop'] else '–',
            ('mép (%.0f,%.0f) dài %.0f' % (an['mep'][0], an['mep'][1], an['dai'])) if an else '–',
            ('t%d%s' % (r['vet']['t'], ' VANG' if r['vet']['bat'] else '')) if r['vet'] else '–')
        nhan(im, s, (255, 90, 90) if r['hop'] or (r['vet'] and r['vet']['bat']) else (240, 240, 240), y=500)
        for _ in range(4): ff.stdin.write(jpg(im)); n += 1
    ff.stdin.close(); ff.wait(); loi = t.loi; await t.dong()
    json.dump(bang, open(os.path.join(OUT, '5-bang-tick-am-nhan.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    lech = [r for r in bang if bool(r['hop']) != bool(r['am_nhan'])]
    print('5-debug-cham: %d khung, tick âm nhận lệch hộp: %d, lỗi trang %d' % (n, len(lech), len(loi)))
    return {'file': '5-debug-cham-am-nhan-hop-don.mp4', 'khung': n, 'tick_am_nhan_lech_hop': len(lech), 'loi_trang': loi}


# ---- đo số
async def do_so(b, cong):
    kq = {}
    # 1. chạm → hộp ở mọi cấp, có / không giữ (rảnh, 20 lần mỗi kiểu)
    for cap in (1, 2, 3, 4):
        t = await Trang(b, cong, cap, False).mo()
        await t.js('TVP0.datLaiQuai(6); TVP0.datLam(%s-82,1); TVP0.xoaLog()' % NOM)
        for _ in range(3): await t.buoc()
        tre = {'cham': [], 'giu30': []}
        for kieu, n_giu in (('cham', 1), ('giu30', 30)):
            for _ in range(20):
                await t.js('TVAD.hoiNgay()')
                for i in range(n_giu): await t.buoc('a')
                for i in range(70): await t.buoc('')
            tre[kieu] = [int(l.split('→ hộp ')[1].split(' ')[0]) for l in await t.js('TVP0.log()') if 'hộp atk1 bật' in l]
            await t.js('TVP0.xoaLog()')
        kq['cham_hop_cap%d' % cap] = {k: sorted(set(v)) for k, v in tre.items()} | {'so_lan': {k: len(v) for k, v in tre.items()}}
        if cap == 1:
            # 2. chí mạng: 400 nhát 1 trên hình nộm (gieo lúc tạo đòn, hạt giống theo phòng); 2 lượt cùng hạt → cùng chuỗi
            ds = []
            for lap in range(2):
                ds.append(await t.js('''(()=>{AD.datHat(S.room); const r=[]; for(let k=0;k<400;k++){ TVP0.datLam((PA.x0+10)*T-82,1); TVP0.khung(1,'a'); if(pl.D&&pl.D.chiMang) r.push(k); TVP0.khung(30,''); } return r;})()'''))
            kq['chi_mang'] = {'so_nhat': 400, 'nhat_chi_mang': ds[0], 'so_chi_mang': len(ds[0]), 'ti_le': round(len(ds[0]) / 400, 3), 'hai_luot_giong_nhau': ds[0] == ds[1]}
        kq['thong_so_cap%d' % cap] = await t.js('({cap:AD.cap, don1:PL_CS[1].goc, don3:PL_CS[3].goc, chem:PL_CS[7].goc, vet:AD.cs.kyNang.vet.goc, hoi:AD.cs.kyNang.hoi, duAm:!!AD.cs.co.duAm, box1:ATK[1].box, box7:ATK[7].box})')
        await t.dong()
    # 3. âm nhận: điểm mép mỗi đòn (đánh thường 1,2,3,5,6 + chém vang 7) – mép phải nằm TRÊN cạnh hộp, chỉ ở tick hộp bật
    t = await Trang(b, cong, 3, True).mo()
    await t.js('TVP0.datLaiQuai(6); TVP0.datLam(%s-200,1); TVP0.xoaLog()' % NOM)
    for _ in range(3): await t.buoc()
    an = {}
    for ten, phim_dau, so in (('atk1', 'a', 30), ('atk5', 'au', 30), ('atk6', 'ja', 40), ('atk4_nay', 'da', 50), ('chem_vang_7', 'a', 70)):
        await t.js('TVAD.hoiNgay()'); ve = []
        for i in range(so):
            if ten == 'atk6': k = 'j' if i < 8 else ('ja' if i == 8 else ('j' if i < 14 else ''))
            elif ten == 'atk4_nay': k = 'j' if i < 10 else ('d' if i < 14 else ('da' if i == 14 else 'd'))   # PH7: đòn nảy (pogo) – nhảy, giữ xuống, Chém
            elif ten == 'chem_vang_7': k = 'a' if i < 30 else ''
            else: k = phim_dau if i == 0 else ''
            await t.js('AD.batDo()'); await t.buoc(k); ve += [d for d in (await t.js('AD.layDo()') or [])]
        for _ in range(40): await t.buoc('')
        an[ten] = ve
    for ten, ph in (('atk2_atk3', None),):
        ve = []
        for i in range(60):
            k = 'a' if i in (0, 10, 25) else ''
            await t.js('AD.batDo()'); await t.buoc(k); ve += [d for d in (await t.js('AD.layDo()') or [])]
        an[ten] = ve
    tong = {}
    for ten, ve in an.items():
        for d in ve:
            n = d['n']; bx, by, bw, bh = d['hop']; ex, ey = d['mep']
            tren_canh = min(abs(ex - bx), abs(ex - bx - bw), abs(ey - by), abs(ey - by - bh)) < 0.6
            r = tong.setdefault('atk%d' % n, {'so_tick_ve': 0, 'dai_min': 999, 'dai_max': 0, 'mep_tren_canh_hop': 0, 'tick': set()})
            r['so_tick_ve'] += 1; r['dai_min'] = min(r['dai_min'], d['dai']); r['dai_max'] = max(r['dai_max'], d['dai']); r['mep_tren_canh_hop'] += tren_canh; r['tick'].add(d['at'])
    for r in tong.values(): r['tick'] = sorted(r['tick'])
    kq['am_nhan'] = tong
    kq['loi_trang'] = t.loi
    await t.dong()
    json.dump(kq, open(os.path.join(OUT, 'do-so.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(json.dumps(kq, ensure_ascii=False)[:3000])
    return kq


# ================================================================== PHẢN HỒI 7 (28/10)
# ---- mục 7–8: đo vùng hộp có VFX không (canh_vung) – ảnh bản đồ phủ + số
DON_VUNG = [
    ('atk1 nhát 1', 1, lambda i: 'a' if i == 0 else '', 40),
    ('atk2 nhát 2', 2, lambda i: 'a' if i in (0, 9) else '', 50),
    ('atk3 nhát 3', 3, lambda i: 'a' if i in (0, 9, 24) else '', 75),
    ('atk4 nảy (pogo)', 4, lambda i: 'j' if i < 10 else ('d' if i < 14 else ('da' if i == 14 else 'd')), 50),
    ('atk5 hất', 5, lambda i: 'au' if i == 0 else '', 40),
    ('atk6 trên không', 6, lambda i: 'j' if i < 8 else ('ja' if i == 8 else ('j' if i < 14 else '')), 40),
    ('atk7 chém vang (cú quét thấp)', 7, lambda i: 'a' if i < 30 else '', 70),
]


async def canh_vung(b, cong, ten_ra='8-vung-hop-phu-vfx', them='', don=None, vet=True, js=None):
    import base64
    t = await Trang(b, cong, 3, True, them).mo(); kq = {}; anh = []
    if js: await t.js(js)
    for ten, n, kb, so in (DON_VUNG if don is None else don):
        await t.js('TVP0.datLaiQuai(6); TVP0.datLam((PA.x0+10)*T-250,1); TVAD.hoiNgay(); TVAD.phuMoi()')
        for _ in range(5): await t.buoc()
        for i in range(so):
            await t.buoc(kb(i)); await t.js('TVAD.phuDon(%d)' % n)
        kq[ten] = await t.js('TVAD.phuKetQua()')
        anh.append((ten, Image.open(io.BytesIO(base64.b64decode((await t.js('TVAD.phuAnh()')).split(',')[1]))).convert('RGB')))
    for cap in ((3, 4) if vet else ()):   # vết: phần sáng NGOÀI hộp vết (mục 8)
        await t.js('TVAD.cap(%d); TVP0.datLaiQuai(6); TVP0.datLam((PA.x0+10)*T-250,1); TVAD.hoiNgay(); TVAD.phuMoi()' % cap)
        for _ in range(5): await t.buoc()
        for i in range(100):
            await t.buoc('a' if i < 30 else ''); await t.js('TVAD.phuVet()')
        ten = 'vết Dư Âm cấp %d' % cap
        kq[ten] = await t.js('TVAD.phuKetQua(true)')
        anh.append((ten, Image.open(io.BytesIO(base64.b64decode((await t.js('TVAD.phuAnh()')).split(',')[1]))).convert('RGB')))
    loi = t.loi; await t.dong()
    W, H = anh[0][1].size
    g = Image.new('RGB', (W * 3, H * ((len(anh) + 2) // 3)), (20, 20, 20))
    for j, (ten, im) in enumerate(anh):
        r = kq[ten]; c = r['cua_so_mep']
        nhan(im, ten + ('  ' + json.dumps(r['hop']) if 'vết' not in ten else ''), (255, 217, 160))
        if 'vết' in ten: nhan(im, 'sáng ngoài hộp %d px · góc hộp sáng %s%% · mép %s / giữa %s' % (r['pixel_sang_ngoai_hop'], r['goc_hop_sang_pct'], r['vet_mep']['sang_tb_dai_mep_3px'], r['vet_mep']['sang_tb_giua']), (240, 240, 240), y=H - 56)
        else: nhan(im, 'phủ %d%% · LÕI vệt ngoài hộp %d px (xa %.1f) · mờ ngoài %d px (xa %.1f)' % (r['phu_ca_hop'], r['loi_vet_chem_ngoai_hop_px'], r['loi_vuot_xa_nhat_px'], r['pixel_sang_ngoai_hop'], r['mo_vuot_xa_nhat_px']), (240, 240, 240), y=H - 56)
        nhan(im, 'mép có VFX: trên %s%% dưới %s%% trước %s%% sau %s%%' % (c['tren'], c['duoi'], c['truoc'], c['sau']), (240, 240, 240), y=H - 30)
        g.paste(im, ((j % 3) * W, (j // 3) * H))
    g.save(os.path.join(OUT, ten_ra + '.png'))
    json.dump(kq, open(os.path.join(OUT, ten_ra + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('%s: lỗi trang %d' % (ten_ra, len(loi))); print(json.dumps(kq, ensure_ascii=False)[:2500])
    return {'file': ten_ra + '.png', 'ket_qua': kq, 'loi_trang': loi}


# ---- mục 4, 5, 6 (+ mục tiêu sau lưng của mục 7): video debug
def giu_tam_dung(i, t, s):
    """giữ 15 → MỞ ⚙ (60 bước, ngón vẫn đè) → ĐÓNG ⚙ (vẫn đè thêm 45) → nhả: không tích, không Dư Âm"""
    async def f():
        if i == 15: await t.js('openSet()')
        if i == 75: await t.js('closeSet()')
        if i >= 180: return None
        return ('a' if i < 120 else '', None)
    return f()


def giu_blur(i, t, s):
    """giữ 35 (đã nạp, thế tụ) → cửa sổ MẤT FOCUS → ngón vẫn đè thêm 40 → nhả: không tự tung"""
    async def f():
        if i == 35: await t.js("window.dispatchEvent(new Event('blur'))")
        if i >= 150: return None
        return ('a' if i < 75 else '', None)
    return f()


def giu_an_tab(i, t, s):
    """giữ 21, nhả khi nhát 1 chưa xong (XẾP HÀNG) → ngay tick sau trang bị ẨN (chuyển tab) → quay lại: không tung"""
    async def f():
        if i == 22: await t.js("Object.defineProperty(document,'hidden',{configurable:true,get:()=>true}); document.dispatchEvent(new Event('visibilitychange')); delete document.hidden")
        if i >= 110: return None
        return ('a' if i < 21 else '', None)
    return f()


def luot_truoc_hop(i, t, s):
    """giữ 40 (thế tụ) → nhả: tung; LƯỚT 2 tick sau (trước hộp, su 6) → huỷ, KHÔNG mất hồi → giữ lại 30 ngay: Dư Âm ra lần 2"""
    if i >= 190: return None
    k = 'a' if i < 40 or 70 <= i < 100 else ''
    if i == 42: k += 's'
    return (k, None)


def luot_sau_hop(i, t, s):
    """giữ 40 → nhả: tung; LƯỚT 9 tick sau (hộp đã bật ở tick 6) → hồi chiêu GIỮ → giữ lại 30: không nạp (đang hồi)"""
    if i >= 160: return None
    k = 'a' if i < 40 or 70 <= i < 100 else ''
    if i == 49: k += 's'
    return (k, None)


def cb_sau_lung(dx):
    """hình nộm SAU LƯNG Lam: mép phải hình nộm cách tâm Lam dx px về phía sau (Lam nhìn phải)"""
    async def cb(t):
        await t.js('TVAD.cap(3); TVP0.datLaiQuai(6); TVP0.datLam(Q[6].x+Q[6].w+%d-10,1); TVAD.hoiNgay(); echo=null; rec=null' % dx)
        for _ in range(3): await t.buoc()
        await t.js('TVP0.xoaLog()')
    return cb


async def canh_ph7(b, cong):
    return await canh_don(b, cong, '6-debug-sua-ph7.mp4', 3, [
        ('PH7-6 · giữ 15 → MỞ ⚙ 60 bước (ngón vẫn đè) → đóng ⚙, đè thêm → nhả: KHÔNG tích, KHÔNG Dư Âm', cb_hoi(3), giu_tam_dung, 180),
        ('PH7-6 · giữ 35 (thế tụ) → MẤT FOCUS → đè thêm 40 → nhả: huỷ, KHÔNG tự tung', cb_hoi(), giu_blur, 150),
        ('PH7-6 · giữ 21 → nhả (xếp hàng) → CHUYỂN TAB ngay → quay lại: huỷ, KHÔNG tung', cb_hoi(), giu_an_tab, 110),
        ('PH7-4 · tung → LƯỚT trước khi hộp bật → không vết, KHÔNG mất hồi → giữ lại: Dư Âm ra ngay', cb_hoi(), luot_truoc_hop, 190),
        ('PH7-4 · tung → hộp bật (hồi bắt đầu) → LƯỚT sau đó → hồi GIỮ → giữ lại: không nạp', cb_hoi(), luot_sau_hop, 160),
        ('PH7-5/7 · hình nộm SAU LƯNG 6 px: chém vang (hộp cũ) TRÚNG, vết (chỉ phía trước) KHÔNG trúng', cb_sau_lung(6), giu(30, 80), 110),
        ('PH7-7 · hình nộm SAU LƯNG 25 px: nhát 2 (hộp −36) TRÚNG – xem có VFX ở sau lưng không', cb_sau_lung(25), lambda i, t, s: None if i >= 60 else ('a' if i in (0, 9) else '', None), 60),
    ])


# ---- mục 10: chiến đấu TỰ DO – không dời quái, không đặt lại hồi chiêu giữa trận
JS_TU_DO = """(()=>{const K=TVAD.kn(); return {lx:pl.x+pl.w/2, hurt:pl.hurtT, atkN:pl.atkN, g:pl.onGround, hoi:K.hoi, duAm:!!AD.cs.co.duAm, giu:K.giu, f:S.frame,
  q:[3,4,5].map(i=>({i, x:Q[i].x+Q[i].w/2, chet:Q[i].dead||Q[i].st==='die'||Q[i].gone, hp:Q[i].hp}))};})()"""


async def cb_tu_do(t):
    # trạng thái đầu GIỐNG NHAU ở 4 cấp (đặt MỘT lần trước trận): quái ở chỗ gốc, Lam đầu Sân hai chuông, hồi chiêu 0, không vết
    await t.js('for(const i of [3,4,5]) TVP0.datLaiQuai(i); TVAD.hoiNgay(); for(const v of AD.VET) v.on=false; echo=null; rec=null; TVP0.datLam((PB.x0+1)*T,1); TVP0.xoaLog()')
    for _ in range(4): await t.buoc()


def bot_tu_do():
    """luật bot CHUNG cho mọi cấp: đi tới quái gần nhất còn sống; trong tầm thì chạm Chém mỗi 14 tick;
    nếu Dư Âm CÓ (cấp 3+) và hết hồi → giữ Chém 24 tick (nhát 1 + Dư Âm), nhả, 30 tick sau mới được giữ lại. Không né, không đặt lại gì giữa trận"""
    async def f(i, t, s):
        st = await t.js(JS_TU_DO); so = s.setdefault('so', {'trung_lam': 0, 'giu_du_am': 0, 'chet': {}})
        if st['hurt'] > 0 and s.get('hurt0', 0) <= 0: so['trung_lam'] += 1
        s['hurt0'] = st['hurt']
        for q in st['q']:
            if q['chet'] and str(q['i']) not in so['chet']: so['chet'][str(q['i'])] = i
        song = [q for q in st['q'] if not q['chet']]
        if not song:
            if 'fchet' not in s: s['fchet'] = i; so['tick_xong'] = i
            s['xong'] = s.get('xong', 0) + 1
            return None if s['xong'] > 60 else ('', None)
        if i >= 3000: so['het_gio'] = True; return None
        if s.get('giu', 0) > 0:
            s['giu'] -= 1
            if s['giu'] == 0: s['nha'] = 30   # nhả rồi chờ: không giữ lại liền (tránh giữ nối thành thế tụ)
            return ('a', None)
        if s.get('nha', 0) > 0: s['nha'] -= 1
        q = min(song, key=lambda q: abs(q['x'] - st['lx'])); d = q['x'] - st['lx']; h = 'r' if d > 0 else 'l'
        if abs(d) > 62: s['n'] = 0; return (h, None)
        if st['duAm'] and st['hoi'] <= 0 and not st['atkN'] and st['g'] and s.get('nha', 0) <= 0:
            s['giu'] = 23; so['giu_du_am'] += 1; return (h + 'a', None)
        s['n'] = s.get('n', 0) + 1
        return ('a' if s['n'] % 14 == 1 else '', None)
    return f


async def canh_tu_do(b, cong):
    return await quay_4o(b, cong, '7-tu-do-cap-1-2-3-4.mp4', [
        ('TỰ DO: 2 Chuông Gỗ + quái gác, không dời quái, không đặt lại hồi chiêu', cb_tu_do, bot_tu_do, 3100),
    ])

# ================================================================== PHẢN HỒI 8 (28/10)
# ---- mục 6: vết Dư Âm BẢN SẠCH trước (PH7: phủ kín rồi cắt chữ nhật + viền chữ nhật lúc vang) / sau (PH8: vừa hộp + mặt nạ bầu dục mờ dần)
async def canh_vet_anh(b, cong):
    """ảnh chụp đúng màn game (bản sạch, không hộp đòn), cắt quanh hộp vết ×3: hàng trên PH7 (cũ), hàng dưới PH8 (mới)"""
    t = await Trang(b, cong, 3, True).mo(); hang = []
    CHUP = [('cấp 3 · treo (t 10)', 3, 10), ('cấp 3 · chờ vang (t 20)', 3, 20), ('cấp 3 · VANG (t 26)', 3, 26), ('cấp 3 · tàn (t 34)', 3, 34), ('cấp 4 · VANG (t 26)', 4, 26)]
    for cu in (True, False):
        o = []
        for ten, cap, tv in CHUP:
            await t.js('TVAD.AD.vetCu=%s; TVAD.cap(%d); TVP0.datLaiQuai(6); TVP0.datLam((PA.x0+10)*T-330,1); TVAD.hoiNgay(); for(const v of AD.VET) v.on=false; echo=null; rec=null' % ('true' if cu else 'false', cap))
            for _ in range(5): await t.buoc()
            for i in range(140):
                await t.buoc('a' if i < 26 else '')
                v = await t.js('(()=>{const v=AD.VET.find(v=>v.on); return v?{t:v.t,x:v.x-ox,y:v.y-oy,w:v.w,h:v.h}:null})()')
                if v and v['t'] == tv: break
            im = await t.anh(); M = 26
            c = im.crop((int(v['x']) - M, int(v['y']) - M, int(v['x'] + v['w']) + M, int(v['y'] + v['h']) + M)).resize(((int(v['w']) + 2 * M) * 3, (int(v['h']) + 2 * M) * 3), Image.NEAREST)
            nhan(c, ('PH7 cũ · ' if cu else 'PH8 mới · ') + ten, (255, 217, 160)); o.append(c)
        hang.append(o)
    await t.js('TVAD.AD.vetCu=false'); loi = t.loi; await t.dong()
    w, h = hang[0][0].size; g = Image.new('RGB', (w * len(CHUP), h * 2), (20, 20, 20))
    for r, o in enumerate(hang):
        for j, c in enumerate(o): g.paste(c, (j * w, r * h))
    g.save(os.path.join(OUT, '9-vet-du-am-sach-truoc-sau.png'))
    print('9-vet-du-am-sach-truoc-sau.png, lỗi trang %d' % len(loi))
    return {'file': '9-vet-du-am-sach-truoc-sau.png', 'loi_trang': loi}


async def canh_vung8(b, cong):
    """bản đồ vùng phủ sau PH8 (hộp mới + vệt mới + vết mới) + biến thể ?pogo=moi"""
    a = await canh_vung(b, cong, '9-vung-hop-phu-vfx-ph8')
    p = await canh_vung(b, cong, '9-vung-hop-pogo-moi', '&pogo=moi', [x for x in DON_VUNG if x[1] == 4], vet=False)
    c = await canh_vung(b, cong, '9-vung-vet-kieu-ph7-do-lai', don=[], js='TVAD.AD.vetCu=true')   # vết kiểu PH7 đo lại bằng ĐỘ SÁNG (so với vết mới)
    return {'mac_dinh': a, 'pogo_moi': p, 'vet_kieu_ph7': c}


# ---- mục 3: pogo cũ / ?pogo=moi – lệch ngang nào thì nảy được (hình nộm, Lam rơi từ 40 px trên đỉnh, nhìn phải)
JS_POGO = """(dx)=>{TVP0.datLaiQuai(6); const q=Q[6]; TVP0.datLam(q.x+q.w/2+dx-10,1); pl.y=pl.py=q.y-40-pl.h; pl.vy=0; pl.onGround=false; savePrev(); return 0;}"""


async def do_pogo(b, cong):
    kq = {}
    for kieu, them in (('cu', ''), ('moi', '&pogo=moi')):
        t = await Trang(b, cong, 1, True, them).mo(); r = {}
        for dx in range(-100, 101, 4):
            await t.js(JS_POGO, dx); nay = False; trung = False; hp0 = await t.js('Q[6].hp')
            for i in range(30):
                await t.buoc('da' if i == 0 else 'd')
                st = await t.js('({b:pl.atkBounced, n:pl.atkN, g:pl.onGround})')
                nay = nay or bool(st['b'] and st['n'] == 4)
                if st['g']: break
            r[dx] = nay
        kq[kieu] = {'hop': await t.js('ATK[4].box'), 'nay_theo_lech': r, 'dai_lech_nay_duoc': [min(k for k, v in r.items() if v), max(k for k, v in r.items() if v)] if any(r.values()) else None, 'so_lech_nay': sum(r.values())}
        await t.dong()
    print('pogo', json.dumps({k: (v['hop'], v['dai_lech_nay_duoc']) for k, v in kq.items()}))
    return kq


# ---- mục 1–2: debug hộp đổi (mục tiêu sau lưng nhát 2, mép trước hất), + ?giu=16
def cb_truoc(mep):
    """hình nộm PHÍA TRƯỚC: mép trái hình nộm cách tâm Lam `mep` px (Lam nhìn phải)"""
    async def cb(t):
        await t.js('TVAD.cap(1); TVP0.datLaiQuai(6); TVP0.datLam(Q[6].x-%d-10,1); TVAD.hoiNgay(); echo=null; rec=null' % mep)
        for _ in range(3): await t.buoc()
        await t.js('TVP0.xoaLog()')
    return cb


async def canh_hop8(b, cong):
    """kết quả trúng / hụt đọc ở log (-log.txt): dòng 'Lam D … trúng hình nộm'. Lam lao tới trong combo (lunge) nên mục tiêu sau lưng còn xa hơn lúc hộp nhát 2 bật"""
    combo2 = lambda i, t, s: None if i >= 60 else ('a' if i in (0, 9) else '', None)
    hat = lambda i, t, s: None if i >= 50 else ('au' if i == 0 else '', None)
    r = await canh_don(b, cong, '10-debug-hop-ph8.mp4', 3, [
        ('PH8-1 · nhát 2 · hình nộm SAU LƯNG 25 px (PH7 hộp −36: trúng 12) – hộp mới −10', cb_sau_lung(25), combo2, 60),
        ('PH8-1 · nhát 2 · hình nộm SAU LƯNG 6 px (chạm lưng lúc bắt đầu combo)', cb_sau_lung(6), combo2, 60),
        ('PH8-1 · nhát 2 · hình nộm lấn 6 px vào nửa TRƯỚC thân (−6)', cb_sau_lung(-6), combo2, 60),
        ('PH8-2 · hình nộm trước 82 px: chém hất (mép mới 78) KHÔNG trúng (PH7: trúng)', cb_truoc(82), hat, 50),
        ('PH8-2 · hình nộm trước 70 px: chém hất TRÚNG', cb_truoc(70), hat, 50),
    ])
    g = await canh_don(b, cong, '10b-debug-giu16.mp4', 3, [
        ('?giu=16 (BIẾN THỂ THỬ) · giữ 15 → nhả sớm', cb_hoi(3), giu(15, 45), 60),
        ('?giu=16 · giữ 17 → Dư Âm (hồi 150, [15,20] giữ nguyên)', cb_hoi(), giu(17, 80), 97),
    ], '&giu=16')
    return {'hop': r, 'giu16': g}


# ---- Dư Âm: 3 kịch bản so (PH8 mục 2), cùng đối thủ (2 Chuông Gỗ + quái gác), trạng thái đầu giống nhau, trong trận KHÔNG dời quái / đặt lại hồi
JS_KB = """(()=>{const K=TVAD.kn(), H=hurtBox(), R={x:0,y:0,w:0,h:0}; let nguy=false;
  const q=[3,4,5].map(i=>{const e=Q[i], chet=e.dead||e.st==='die'||e.gone;
    if(!chet && (e.st==='wind' || (e.st==='strike' && e.t<=10))){ quaiHitbox(e,R); const lao=e.st==='wind'?18:Math.max(0,(5-e.t)*3.6);
      if(e.face>0) R.w+=lao; else { R.x-=lao; R.w+=lao; } if(H.x<R.x+R.w && H.x+H.w>R.x && H.y<R.y+R.h && H.y+H.h>R.y) nguy=true; }
    return {i, x:e.x+e.w/2, chet, hp:e.hp, st:e.st, t:e.t, cd:e.cd||0};});
  return {lx:pl.x+pl.w/2, hurt:pl.hurtT, atkN:pl.atkN, g:pl.onGround, hoi:K.hoi, duAm:!!AD.cs.co.duAm, giu:K.giu, f:S.frame, nguy, q,
    vet:AD.VET.some(v=>v.on&&v.t>=0&&v.t<v.tre+v.bat)};})()"""


def bot_kb(kieu):
    """kieu: 'thuong' = bot tự do PH7 KHÔNG dùng kỹ năng · 'moc' = bot tự do PH7 (giữ khi hết hồi) · 'ne' = né đòn rồi chém thường ·
    'hut' = 'ne' + Dư Âm SAU khi quái đánh hụt · 'bay' = 'ne' + khi Dư Âm sẵn: giữ khoảng ~120, quái lấy đà thì đặt vết rồi LƯỚT lùi, quái lao vào vết"""
    async def f(i, t, s):
        st = await t.js(JS_KB); so = s.setdefault('so', {'trung_lam': 0, 'tick_nguy_hiem': 0, 'giu_du_am': 0, 'chet': {}, 'hut_thay': 0})
        if st['hurt'] > 0 and s.get('hurt0', 0) <= 0: so['trung_lam'] += 1
        s['hurt0'] = st['hurt']; so['tick_nguy_hiem'] += st['nguy']
        for q in st['q']:
            if q['chet'] and str(q['i']) not in so['chet']: so['chet'][str(q['i'])] = i
            k = 'q%d' % q['i']; truoc = s.get(k)
            if truoc == 'strike' and q['st'] == 'rec' and st['hurt'] <= 0: so['hut_thay'] += 1; s['co_hoi'] = i + 45; s['co_hoi_q'] = q['i']   # quái vừa ĐÁNH HỤT
            s[k] = q['st']
        song = [q for q in st['q'] if not q['chet']]
        if not song:
            if 'fchet' not in s: s['fchet'] = i; so['tick_xong'] = i
            s['xong'] = s.get('xong', 0) + 1
            return None if s['xong'] > 60 else ('', None)
        if i >= 4000: so['het_gio'] = True; return None
        q = min(song, key=lambda q: abs(q['x'] - st['lx'])); d = q['x'] - st['lx']; h = 'r' if d > 0 else 'l'; xa = 'l' if h == 'r' else 'r'
        # đang giữ Chém (Dư Âm)
        if s.get('giu', 0) > 0:
            s['giu'] -= 1
            if s['giu'] == 0: s['nha'] = 30; s['cho_vet'] = kieu == 'bay'
            return ('a', None)
        if s.get('nha', 0) > 0: s['nha'] -= 1
        if kieu in ('thuong', 'moc'):   # bot tự do PH7 (không né)
            if abs(d) > 62: s['n'] = 0; return (h, None)
            if kieu == 'moc' and st['duAm'] and st['hoi'] <= 0 and not st['atkN'] and st['g'] and s.get('nha', 0) <= 0:
                s['giu'] = 23; so['giu_du_am'] += 1; return (h + 'a', None)
            s['n'] = s.get('n', 0) + 1
            return ('a' if s['n'] % 14 == 1 else '', None)
        san = st['duAm'] and st['hoi'] <= 0 and st['g'] and s.get('nha', 0) <= 0
        doa = q['st'] == 'wind' or (q['st'] == 'strike' and q['t'] <= 10)
        # bẫy: vết đã đặt → lướt lùi rồi lùi tiếp, đứng chờ vết vang
        if s.get('cho_vet') and st['vet']:
            s['cho_vet'] = False; s['lui'] = 14; return (xa + 's', None)
        if s.get('lui', 0) > 0: s['lui'] -= 1; return (xa, None)
        if kieu == 'bay' and st['vet']: return ('', None)
        if kieu == 'bay' and san and not st['atkN']:
            if q['st'] == 'wind' and q['t'] <= 6 and 70 <= abs(d) <= 150:
                s['cho_bay'] = 0; s['giu'] = 21; so['giu_du_am'] += 1; return (h + 'a', None)
            cho = s['cho_bay'] = s.get('cho_bay', 0) + (0 if doa else 1)
            if s.get('danh_tiep', -1) == i: s['cho_bay'] = 0
            if cho == 150: so['bo_cho_bay'] = so.get('bo_cho_bay', 0) + 1; s['danh_tiep'] = i + 240   # chờ 150 tick quái không lấy đà → đánh thường 240 tick rồi thử lại
            if not doa and cho < 150 and s.get('danh_tiep', -1) < i:   # chờ quái tới: giữ khoảng ~115–130, không chém
                if abs(d) < 115: return (xa, None)
                if abs(d) > 130: return (h, None)
                return ('', None)
        # né: quái lấy đà / đang đập mà Lam trong tầm → lùi (lướt nếu sát)
        if doa and abs(d) < 140:
            if abs(d) < 95 and not s.get('da_luot') and q['st'] == 'wind' and q['t'] >= 12: s['da_luot'] = True; return (xa + 's', None)
            return (xa, None)
        if not doa: s['da_luot'] = False
        if kieu == 'hut' and san and not st['atkN'] and s.get('co_hoi', -1) >= i:
            if abs(d) > 66: return (h, None)
            s['giu'] = 21; s['co_hoi'] = -1; so['giu_du_am'] += 1; return (h + 'a', None)
        if abs(d) > 62: s['n'] = 0; return (h, None)
        s['n'] = s.get('n', 0) + 1
        return ('a' if s['n'] % 14 == 1 else '', None)
    return f


KB = [('(a) cấp 1 · CHỈ đánh thường (bot PH7, không né)', 1, 'thuong'), ('(a) cấp 3 · CHỈ đánh thường (bot PH7, không né)', 3, 'thuong'),
      ('mốc PH7 · cấp 3 · bot tự do (giữ khi hết hồi)', 3, 'moc'), ('nền né · cấp 3 · né + CHỈ đánh thường', 3, 'ne'),
      ('(b) cấp 3 · né + Dư Âm SAU đòn hụt', 3, 'hut'), ('(c) cấp 3 · né + đặt vết rồi lùi', 3, 'bay')]


async def quay_kb(b, cong, ten, sach):
    KB_ = [KB[int(x)] for x in os.environ['KB_LOC'].split(',')] if os.environ.get('KB_LOC') else KB   # KB_LOC=5: chỉ chạy kịch bản số 5 (chỉnh bot)
    T = [await Trang(b, cong, c, sach).mo() for _, c, _ in KB_]
    for t in T: await cb_tu_do(t)
    nhanh = os.environ.get('KB_NHANH')   # chỉ chạy số, không quay (để chỉnh bot)
    ff = None if nhanh else ffmpeg(os.path.join(OUT, ten), 1920, 720); n = 0; bots = [bot_kb(k) for _, _, k in KB_]; S = [{} for _ in T]; xong = [False] * len(T)
    for i in range(4100):
        for j, t in enumerate(T):
            k = None if xong[j] else await bots[j](i, t, S[j])
            if k is None: xong[j] = True; k = ('', None)
            await t.buoc(*k)
        n += 1
        if all(xong): break
        if nhanh: continue
        g = Image.new('RGB', (1920, 720))
        for j, t in enumerate(T):
            im = await t.anh(); nhan(im, KB_[j][0], (255, 217, 160)); g.paste(im.resize((640, 360)), ((j % 3) * 640, (j // 3) * 360))
        ff.stdin.write(jpg(g))
    if ff: ff.stdin.close(); ff.wait()
    kq = {}
    for j, t in enumerate(T):
        tk = await t.js('TVAD.tk()'); so = S[j]['so']
        kq[KB_[j][0]] = {'cap': KB_[j][1], 'bot': KB_[j][2], 'tick_xong': so.get('tick_xong'), 'chet': so['chet'], 'lam_bi_danh': so['trung_lam'], 'tick_nguy_hiem': so['tick_nguy_hiem'],
                        'quai_danh_hut_thay': so['hut_thay'], 'bo_cho_bay': so.get('bo_cho_bay', 0), 'bot_bat_dau_giu': so['giu_du_am'], 'tung': tk['tung'], 'huy_giu_chua_nap': tk['huyGiu'], 'xoa_da_nap': tk['xoa'],
                        'chem_vang_trung': tk['vetTrung'], 'chem_vang_hut': tk['vetHut'], 'vet_dat': tk['vet'], 'vet_vang_trung': tk['vetVangTrung'], 'vet_vang_hut': tk['vetVangHut'],
                        'thieu_ket_cuc': (await t.js('TVP0.tk()'))['thieu']}
        if not sach: open(os.path.join(OUT, ten.replace('.mp4', '-log-%d.txt' % (j + 1))), 'w', encoding='utf-8').write('== ' + KB_[j][0] + '\n' + '\n'.join(await t.js('TVP0.log()')) + '\n')
    loi = sum([t.loi for t in T], [])
    for t in T: await t.dong()
    print('%s: %d khung, lỗi trang %d' % (ten, n, len(loi)))
    for k, v in kq.items(): print(' ', k, json.dumps(v, ensure_ascii=False))
    return {'file': ten, 'khung': n, 'loi_trang': loi, 'ket_qua': kq}


async def canh_kb(b, cong):
    chi = os.environ.get('KB_CHI')
    r = {}
    if chi != 'debug': r['sach'] = await quay_kb(b, cong, '11-sach-du-am-3-kich-ban.mp4', True)
    if chi != 'sach': r['debug'] = await quay_kb(b, cong, '12-debug-du-am-3-kich-ban.mp4', False)
    return r

async def main():
    can = sys.argv[1:] or ['sach', 'giu', 'vet', 'proc', 'cham', 'do', 'ph7', 'vung', 'tudo', 'vetanh', 'vung8', 'pogo', 'hop8', 'kb']
    os.chdir(GOC)
    srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Im, directory=GOC)); cong = srv.server_address[1]
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    kq_p = os.path.join(OUT, 'ket-qua.json'); kq = json.load(open(kq_p, encoding='utf-8')) if os.path.exists(kq_p) else {}
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for ten, fn in (('sach', canh_sach), ('giu', canh_giu), ('vet', canh_vet), ('proc', canh_proc), ('cham', canh_cham), ('do', do_so), ('ph7', canh_ph7), ('vung', canh_vung), ('tudo', canh_tu_do),
                         ('vetanh', canh_vet_anh), ('vung8', canh_vung8), ('pogo', do_pogo), ('hop8', canh_hop8), ('kb', canh_kb)):
            if ten in can: kq[ten] = await fn(b, cong); json.dump(kq, open(kq_p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1, default=list)
        await b.close()
    srv.shutdown()


if __name__ == '__main__':
    asyncio.run(main())
