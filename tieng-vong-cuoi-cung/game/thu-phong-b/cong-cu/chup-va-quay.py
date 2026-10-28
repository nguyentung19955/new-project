#!/usr/bin/env python3
"""Ảnh duyệt + video + số đo cho trang thử PHÒNG B → game/thu-phong-b/xem-thu/
Không phải kiểm thử tự động: chỉ chụp, quay, ghi số đo để chủ dự án xem.
  TRƯỚC = game/thu-p0a/index.html (phòng B như hiện tại)   SAU = game/thu-phong-b/index.html
Cần playwright + Chromium + ffmpeg + Pillow.
Chạy: python3 -B game/thu-phong-b/cong-cu/chup-va-quay.py [mep] [anh] [iphone] [do] [video] [phong] [iphone-phong] [do-phong] [video-abc]
     (không ghi gì = làm hết). Bước 2: phong / iphone-phong / do-phong / video-abc = 3 phòng A, B, C.
     Bước 3 (D / E / F): phong-def iphone-def do-def video-def ranh bo-nen thap-b
       (ranh = video cuộn chậm A → F + soi ranh mảng nướng; bo-nen = Bọ trên nền D, màu + xám; thap-b = cửa sổ tháp phòng B trước / sau)."""
import asyncio, base64, functools, http.server, io, json, os, socketserver, subprocess, sys, threading, time
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw, ImageFont, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
GOC = os.path.normpath(os.path.join(HERE, '..', '..', '..'))
OUT = os.path.join(GOC, 'game', 'thu-phong-b', 'xem-thu'); os.makedirs(OUT, exist_ok=True)
try:
    FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 20)
except Exception:
    FONT = ImageFont.load_default()
TRUOC = 'game/thu-p0a/index.html'
SAU = 'game/thu-phong-b/index.html'


class Im(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def server():
    h = functools.partial(Im, directory=GOC)
    s = socketserver.TCPServer(('127.0.0.1', 0), h); threading.Thread(target=s.serve_forever, daemon=True).start()
    return s, s.server_address[1]


def nhan(im, chu, mau=(255, 230, 160), y=0):
    d = ImageDraw.Draw(im, 'RGBA'); w = d.textlength(chu, font=FONT)
    d.rectangle([0, y, w + 16, y + 28], fill=(12, 15, 20, 200)); d.text((8, y + 3), chu, font=FONT, fill=mau); return im


async def mo(p, cong, trang, q='', vp=(960, 540), dsf=1, touch=False, an_ui=True):
    b = await p.chromium.launch()
    ctx = await b.new_context(viewport={'width': vp[0], 'height': vp[1]}, device_scale_factor=dsf, has_touch=touch, is_mobile=touch)
    pg = await ctx.new_page(); loi = []
    pg.on('pageerror', lambda e: loi.append(str(e)))
    await pg.route('https://fonts.g*/**', lambda r: r.abort())
    await pg.goto('http://127.0.0.1:%d/%s?ghi=1&battu=1%s' % (cong, trang, q))
    await pg.wait_for_function('window.TVDEMO && TVDEMO.ready', timeout=180000)
    await pg.evaluate('TVP0.batDau()')
    if touch: await pg.evaluate('setMode(true)')
    if an_ui: await pg.evaluate('TVP0.anUI(1)')
    return b, pg, loi


# cảnh chiến đấu cố định (cả hai trang cùng lệnh → cùng trạng thái): Lam cột 9, Chuông Gỗ 1 ngay trước mặt, Chuông Gỗ 2 đang LẤY ĐÀ (lóe vàng + "!"),
# Lam bấm chém → chụp đúng lúc vệt chém hiện (atkT = su + 2)
CANH = '''(async (cho) => {
  TVP0.datLaiQuai(3); TVP0.datLaiQuai(4);
  TVP0.datLam((PB.x0 + 9) * T, 1);
  const q3 = Q[3], q4 = Q[4];
  q3.x = q3.px = (PB.x0 + 11) * T + 8; q3.face = -1; q3.st = 'walk'; q3.t = 0; q3.cd = 999;
  q4.x = q4.px = (PB.x0 + 17) * T; q4.face = -1; q4.st = 'walk'; q4.t = 0; q4.cd = 999;
  for (let i = 0; i < 70; i++) { TVP0.khung(1, ''); q3.x = q3.px = (PB.x0 + 11) * T + 8; q4.x = q4.px = (PB.x0 + 17) * T; q3.st = q4.st = 'walk'; q3.cd = q4.cd = 999; }
  q4.st = 'wind'; q4.t = 8; q4.face = -1;
  TVP0.khung(1, 'a');
  for (let i = 0; i < cho; i++) TVP0.khung(1, '');
  return {f: S.frame, atkN: pl.atkN, atkT: pl.atkT, q3: q3.st, q4: q4.st + ':' + q4.t, camx: S.camx};
})'''


async def anh_chien_dau(p, cong):
    kq = {}
    for ten, trang in (('truoc', TRUOC), ('sau', SAU)):
        b, pg, loi = await mo(p, cong, trang)
        r = await pg.evaluate(CANH + '(8)'); kq[ten] = r
        im = Image.open(io.BytesIO(await pg.screenshot(type='png'))).convert('RGB')
        im.save(os.path.join(OUT, '%s-chien-dau.png' % ten)); ImageOps.grayscale(im).save(os.path.join(OUT, '%s-chien-dau-xam.png' % ten))
        kq[ten + '_loi'] = loi; await b.close()
    g = Image.new('RGB', (1920, 540)); g2 = Image.new('RGB', (1920, 540))
    for i, ten in enumerate(('truoc', 'sau')):
        a = Image.open(os.path.join(OUT, '%s-chien-dau.png' % ten)); x = Image.open(os.path.join(OUT, '%s-chien-dau-xam.png' % ten)).convert('RGB')
        g.paste(nhan(a.copy(), 'TRƯỚC (thu-p0a)' if i == 0 else 'SAU (thu-phong-b)', (255, 176, 138) if i == 0 else (127, 224, 200), 500), (960 * i, 0))
        g2.paste(nhan(x.copy(), 'TRƯỚC – xám' if i == 0 else 'SAU – xám', (255, 255, 255), 500), (960 * i, 0))
    g.save(os.path.join(OUT, 'ghep-truoc-sau.png')); g2.save(os.path.join(OUT, 'ghep-truoc-sau-xam.png'))
    print('ảnh chiến đấu', kq); return kq


async def anh_iphone(p, cong):
    kq = {}
    for ten, trang in (('truoc', TRUOC), ('sau', SAU)):
        b, pg, loi = await mo(p, cong, trang, vp=(844, 390), dsf=3, touch=True, an_ui=False)
        r = await pg.evaluate(CANH + '(8)')
        await pg.screenshot(path=os.path.join(OUT, 'iphone-844x390-%s.png' % ten))
        kq[ten] = {'canh': r, 'loi': loi, 'BK': await pg.evaluate('BK'), 'touch': await pg.evaluate('!!touchMode'),
                   'vung_cham': await pg.evaluate('''[...document.querySelectorAll('#dpad,.ab')].map(e => { const r = e.getBoundingClientRect(); return [e.id, Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; })''')}
        await b.close()
    print('iphone', json.dumps(kq, ensure_ascii=False)); return kq


async def anh_mep(p, cong):
    b, pg, loi = await mo(p, cong, SAU)
    ds = []
    for k in ('hang-dai', 'mang-4x4', 'goc-lom', 'be-don', 'hanh-lang-tran'):
        for v in (0, 1):
            u = await pg.evaluate('([k,v])=>TVPB.kiemMep(k,2,v)', [k, v])
            f = 'kiem-mep-%s%s.png' % (k, '-collider' if v else ''); open(os.path.join(OUT, f), 'wb').write(base64.b64decode(u.split(',')[1])); ds.append(f)
    so = await pg.evaluate('TVPB.so()'); await b.close()
    print('ảnh kiểm mép', ds, loi); return {'anh': ds, 'so': so, 'loi': loi}


# bot đánh: Python quyết định phím từng bước từ trạng thái gọn (TVPB.tt ở trang sau; trang trước dùng cùng biểu thức)
TT = '''(() => { const f = q => ({x: q.x + q.w / 2, st: q.st, t: q.t, dead: qDown(q)});
  return {f: S.frame, x: pl.x + pl.w / 2, face: pl.face, atkN: pl.atkN, q3: f(Q[3]), q4: f(Q[4])}; })()'''


def bot(s, i, nho):
    tg = None
    for k in ('q3', 'q4'):
        if not s[k]['dead'] and s[k]['st'] != 'die': tg = s[k]; break
    if tg is None: return ''
    dx = tg['x'] - s['x']; huong = 'r' if dx > 0 else 'l'; xa = 'l' if dx > 0 else 'r'
    if tg['st'] == 'wind' and tg['t'] >= 16 and abs(dx) < 150: return xa                      # đã lấy đà lâu: không ngắt được → lùi
    if tg['st'] == 'strike' and abs(dx) < 150: return xa
    if abs(dx) > 76: return huong
    if (s['face'] > 0) != (dx > 0): return huong
    return 'a' if i % 2 == 0 else ''


async def chay_bot(pg, n, phim_san=None):
    await pg.evaluate('TVP0.datLaiQuai(3); TVP0.datLaiQuai(4); TVP0.datLam((PB.x0 + 3) * T + 6, 1); DO.reset()')
    phim = []
    for i in range(n):
        if phim_san is not None: k = phim_san[i] if i < len(phim_san) else ''
        else: s = await pg.evaluate(TT); k = bot(s, i, None)
        phim.append(k)
        await pg.evaluate('(k) => TVP0.khung(1, k)', k)
    d = await pg.evaluate('''(() => { const a = DO.ds.slice().sort((p, q) => p - q); return {n: a.length, tb: +(DO.tong / DO.n).toFixed(3), p50: +a[a.length >> 1].toFixed(3),
      p95: +a[Math.floor(a.length * 0.95)].toFixed(3), max: +DO.max.toFixed(3), q3: Q[3].st, q4: Q[4].st, hp: pl.hp}; })()''')
    return phim, d


async def do_ve(p, cong):
    """thời gian vẽ 1 khung (render), Chromium headless trên máy chủ không GPU – chỉ để so TRƯỚC / SAU"""
    kq = {'ghi_chu': 'Chromium headless, máy chủ Linux KHÔNG GPU, viewport 960×540 dsf 1. Chỉ so TRƯỚC/SAU; CHƯA đo trên iPhone thật.'}
    b, pg, loi = await mo(p, cong, SAU)
    phim, d_sau = await chay_bot(pg, 600)
    so = await pg.evaluate('TVPB.so()'); await b.close()
    b, pg, loi2 = await mo(p, cong, TRUOC)
    _, d_truoc = await chay_bot(pg, 600, phim_san=phim); await b.close()
    kq.update({'bot_600_khung': {'truoc': d_truoc, 'sau': d_sau}, 'nap_sau': so, 'loi_trang': loi + loi2})
    for ten, trang in (('truoc', TRUOC), ('sau', SAU)):   # đứng yên (2 quái tuần tra) 600 khung
        b, pg, l3 = await mo(p, cong, trang)
        await pg.evaluate('TVP0.datLam((PB.x0 + 9) * T, 1)')
        kq.setdefault('dung_yen_600_khung', {})[ten] = await pg.evaluate('''(() => { DO.reset(); for (let i = 0; i < 600; i++) { savePrev(); step(); render(1); }
          const a = DO.ds.slice().sort((p, q) => p - q); return {n: a.length, tb: +(DO.tong / DO.n).toFixed(3), p50: +a[a.length >> 1].toFixed(3), p95: +a[Math.floor(a.length * 0.95)].toFixed(3), max: +DO.max.toFixed(3)}; })()''')
        await b.close()
    json.dump({'phim_bot': ''.join(k if k else '.' for k in phim)}, open(os.path.join(OUT, 'phim-bot.json'), 'w'))
    print('đo', json.dumps(kq, ensure_ascii=False)); return kq


async def video(p, cong):
    b, pg, loi = await mo(p, cong, SAU)
    dst = os.path.join(OUT, 'lam-danh-2-chuong-go-60fps.mp4')
    ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '60', '-c:v', 'mjpeg', '-i', '-',
                           '-vf', 'format=yuv420p', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '22', '-r', '60', '-movflags', '+faststart', dst], stdin=subprocess.PIPE)
    # bot đánh tới khi cả 2 quái gục (tối đa 900 khung = 15 s) + 40 khung sau
    await pg.evaluate('TVP0.datLaiQuai(3); TVP0.datLaiQuai(4); TVP0.datLam((PB.x0 + 3) * T + 6, 1)')
    n = 0; het = None
    while n < 900:
        s = await pg.evaluate(TT)
        if het is None and s['q3']['dead'] and s['q4']['dead']: het = n
        if het is not None and n - het > 40: break
        k = bot(s, n, None) if het is None else ''
        await pg.evaluate('(k) => TVP0.khung(1, k)', k)
        im = Image.open(io.BytesIO(await pg.screenshot(type='png'))).convert('RGB'); bb = io.BytesIO(); im.save(bb, 'JPEG', quality=92); ff.stdin.write(bb.getvalue()); n += 1
    ff.stdin.close(); ff.wait(); await b.close()
    print('video', dst, n, 'khung', loi); return {'file': os.path.basename(dst), 'khung': n, 'giay': round(n / 60, 2), 'loi_trang': loi}


# ---------------- BƯỚC 2: 3 phòng A / B / C (TRƯỚC = thu-p0a, SAU = thu-phong-b) ----------------
CANH_PHONG = {
    # A: điểm lưu đã bật, Lam vừa chém hình nộm (hình nộm lắc + sáng, bảng số)
    'a': '''(async () => { const b = BELLS[3]; for (const x of BELLS) x.on = false; b.on = true; S.cp = b; b.ring = 0;
      TVP0.datLaiQuai(6); TVP0.datLam((PA.x0 + 7) * T + 4, 1); for (let i = 0; i < 40; i++) TVP0.khung(1, '');
      TVP0.khung(1, 'a'); for (let i = 0; i < 9; i++) TVP0.khung(1, ''); return {f: S.frame, room: S.room, camx: S.camx}; })()''',
    'b': CANH + '(8)',
    # C: Lam giữa hành lang, quái gác thức (đứng trước cổng)
    'c': '''(async () => { TVP0.datLaiQuai(5); TVP0.datLam((PC.x0 + 11) * T, 1); for (let i = 0; i < 90; i++) TVP0.khung(1, '');
      return {f: S.frame, room: S.room, camx: S.camx, q5: Q[5].st}; })()'''
}


async def anh_phong(p, cong):
    kq = {}
    for ph in 'abc':
        for ten, trang in (('truoc', TRUOC), ('sau', SAU)):
            b, pg, loi = await mo(p, cong, trang)
            r = await pg.evaluate(CANH_PHONG[ph]); kq['%s_%s' % (ph, ten)] = {'canh': r, 'loi': loi}
            im = Image.open(io.BytesIO(await pg.screenshot(type='png'))).convert('RGB')
            im.save(os.path.join(OUT, 'phong-%s-%s.png' % (ph, ten))); ImageOps.grayscale(im).save(os.path.join(OUT, 'phong-%s-%s-xam.png' % (ph, ten)))
            await b.close()
    for xam in (False, True):
        g = Image.new('RGB', (1920, 1620))
        for j, ph in enumerate('abc'):
            for i, ten in enumerate(('truoc', 'sau')):
                a = Image.open(os.path.join(OUT, 'phong-%s-%s%s.png' % (ph, ten, '-xam' if xam else ''))).convert('RGB')
                nhan(a, 'Phòng %s – %s' % (ph.upper(), 'TRƯỚC (thu-p0a)' if i == 0 else 'SAU (thu-phong-b)'), (255, 176, 138) if i == 0 else (127, 224, 200), 500)
                g.paste(a, (960 * i, 540 * j))
        g.save(os.path.join(OUT, 'ghep-phong-abc%s.png' % ('-xam' if xam else '')))
    print('ảnh phòng', json.dumps(kq, ensure_ascii=False)); return kq


async def anh_iphone_phong(p, cong):
    kq = {}
    for ph in 'abc':
        for ten, trang in (('truoc', TRUOC), ('sau', SAU)):
            b, pg, loi = await mo(p, cong, trang, vp=(844, 390), dsf=3, touch=True, an_ui=False)
            await pg.evaluate(CANH_PHONG[ph])
            await pg.screenshot(path=os.path.join(OUT, 'iphone-844x390-%s-%s.png' % (ph, ten)))
            kq['%s_%s' % (ph, ten)] = {'loi': loi, 'vung_cham': await pg.evaluate('''[...document.querySelectorAll('#dpad,.ab')].map(e => { const r = e.getBoundingClientRect(); return [e.id, Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; })''')}
            await b.close()
    print('iphone phòng', json.dumps(kq, ensure_ascii=False)); return kq


TT_ABC = '''(() => { const f = q => ({x: q.x + q.w / 2, st: q.st, t: q.t, dead: qDown(q), nom: !!q.nom, flash: q.flash});
  return {f: S.frame, x: pl.x + pl.w / 2, face: pl.face, g: pl.onGround, hp: pl.hp, room: S.room, pa: PA.i, pb: PB.i, pc: PC.i, endC: (PC.x0 + 20) * T,
    q3: f(Q[3]), q4: f(Q[4]), q5: f(Q[5]), q6: f(Q[6])}; })()'''


def bot_abc(s, i, nho):
    """đi phải qua A → B → C: chém hình nộm 4 lần, đánh gục 2 Chuông Gỗ, tới trước quái gác chém vài nhát rồi dừng"""
    x = s['x']
    q6 = s['q6']
    if nho.get('nom', 0) < 4 and abs(q6['x'] - x) < 300:
        dx = q6['x'] - x
        if abs(dx) > 60: return 'r' if dx > 0 else 'l'
        if (s['face'] > 0) != (dx > 0): return 'r' if dx > 0 else 'l'
        if i % 14 == 0: nho['nom'] = nho.get('nom', 0) + 1; return 'a'
        return ''
    for k in ('q3', 'q4'):
        q = s[k]
        if not q['dead'] and q['st'] != 'die' and abs(q['x'] - x) < 420:
            return bot(s, i, None)
    q5 = s['q5']
    if s['room'] == s['pc'] and abs(q5['x'] - x) < 110:
        nho['gac'] = nho.get('gac', 0) + 1
        if nho['gac'] > 150: return ''
        if q5['st'] in ('wind', 'strike') and abs(q5['x'] - x) < 150: return 'l'
        return 'a' if i % 2 == 0 else ''
    return 'r'


async def video_abc(p, cong):
    b, pg, loi = await mo(p, cong, SAU)
    dst = os.path.join(OUT, 'lam-di-a-b-c-60fps.mp4')
    ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '60', '-c:v', 'mjpeg', '-i', '-',
                           '-vf', 'format=yuv420p', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '22', '-r', '60', '-movflags', '+faststart', dst], stdin=subprocess.PIPE)
    await pg.evaluate('TVP0.datLaiQuai(3); TVP0.datLaiQuai(4); TVP0.datLaiQuai(5); TVP0.datLaiQuai(6); for (const x of BELLS) x.on = false; TVP0.datLam((PA.x0 + 2) * T + 2, 1)')
    n = 0; nho = {}; het = None
    while n < 2400:
        s = await pg.evaluate(TT_ABC)
        k = bot_abc(s, n, nho)
        if het is None and nho.get('gac', 0) > 150: het = n
        if het is not None and n - het > 30: break
        await pg.evaluate('(k) => TVP0.khung(1, k)', k)
        im = Image.open(io.BytesIO(await pg.screenshot(type='jpeg', quality=92))); bb = io.BytesIO(); im.save(bb, 'JPEG', quality=92); ff.stdin.write(bb.getvalue()); n += 1
    ff.stdin.close(); ff.wait(); await b.close()
    print('video A→B→C', dst, n, 'khung', loi); return {'file': os.path.basename(dst), 'khung': n, 'giay': round(n / 60, 2), 'loi_trang': loi}


async def do_ve_phong(p, cong):
    """đứng yên 300 khung ở từng phòng (TRƯỚC / SAU) + số nạp / nướng / bộ nhớ ảnh"""
    kq = {'ghi_chu': 'Chromium headless, máy chủ Linux KHÔNG GPU, 960×540 dsf 1. Chỉ so TRƯỚC/SAU; CHƯA đo trên iPhone thật.'}
    for ten, trang in (('truoc', TRUOC), ('sau', SAU)):
        b, pg, loi = await mo(p, cong, trang)
        for ph, x in (('a', '(PA.x0 + 6) * T'), ('b', '(PB.x0 + 9) * T'), ('c', '(PC.x0 + 8) * T')):
            await pg.evaluate('TVP0.datLam(%s, 1)' % x)
            kq.setdefault(ph, {})[ten] = await pg.evaluate('''(() => { DO.reset(); for (let i = 0; i < 300; i++) { savePrev(); step(); render(1); }
              const a = DO.ds.slice().sort((p, q) => p - q); return {n: a.length, tb: +(DO.tong / DO.n).toFixed(3), p50: +a[a.length >> 1].toFixed(3), p95: +a[Math.floor(a.length * 0.95)].toFixed(3), max: +DO.max.toFixed(3)}; })()''')
        if ten == 'sau': kq['nap_sau'] = await pg.evaluate('TVPB.so()')
        kq['loi_' + ten] = loi; await b.close()
    print('đo phòng', json.dumps(kq, ensure_ascii=False)); return kq


# ---------------- BƯỚC 3: phòng D / E / F ----------------
OUT3 = os.path.join(OUT, 'buoc-3'); os.makedirs(OUT3, exist_ok=True)
CANH_DEF = {
    # D: Lam trước mặt Bọ 1 (Bọ đang BÁO TRƯỚC húc: cúi đầu, lóe cam đỏ, "!"), Bọ 2 đi phía sau
    'd': ('d', '''(async () => { const b = BO.DS[0], c = BO.DS[1]; TVP0.datLam((PD.x0 + 8) * T, 1);
      b.x = b.px = (PD.x0 + 12) * T - b.w / 2; b.face = -1; b.st = 'di'; b.t = 0; b.cd = 999; c.x = c.px = (PD.x0 + 22) * T - c.w / 2; c.face = -1; c.cd = 999;
      for (let i = 0; i < 40; i++) { TVP0.khung(1, ''); b.x = b.px = (PD.x0 + 12) * T - b.w / 2; b.cd = 999; c.cd = 999; }
      b.st = 'bao'; b.t = 0; b.cd = 0; for (let i = 0; i < 14; i++) TVP0.khung(1, '');
      return {f: S.frame, b: b.st + ':' + b.t, c: c.st, camx: S.camx}; })()'''),
    # E: sân trống, Lam giữa sân
    'e': ('e', '''(async () => { TVP0.datLam((PE.x0 + 13) * T, 1); for (let i = 0; i < 60; i++) TVP0.khung(1, ''); return {f: S.frame, camx: S.camx}; })()'''),
    # F: chuông lưu đã bật, Lam đứng cạnh đe (đe đã nóng)
    'f': ('f', '''(async () => { const bl = BELLS[4]; for (const x of BELLS) x.on = false; bl.on = true; S.cp = bl;
      TVP0.datLam((PF.x0 + 9) * T + 18, -1); for (let i = 0; i < 70; i++) TVP0.khung(1, ''); return {f: S.frame, camx: S.camx, nong: TVPB.ttD().nong}; })()'''),
}


def luu_mx(im, ten):
    im.save(os.path.join(OUT3, ten + '.png')); ImageOps.grayscale(im).save(os.path.join(OUT3, ten + '-xam.png'))


async def anh_phong_def(p, cong):
    kq = {}
    for ph, (vao, js) in CANH_DEF.items():
        b, pg, loi = await mo(p, cong, SAU, q='&vao=' + vao)
        r = await pg.evaluate(js); kq[ph] = {'canh': r, 'loi': loi}
        luu_mx(Image.open(io.BytesIO(await pg.screenshot(type='png'))).convert('RGB'), 'phong-' + ph); await b.close()
    for xam in (False, True):
        g = Image.new('RGB', (960, 1620))
        for j, ph in enumerate('def'):
            a = Image.open(os.path.join(OUT3, 'phong-%s%s.png' % (ph, '-xam' if xam else ''))).convert('RGB')
            g.paste(nhan(a, 'Phòng %s' % ph.upper() + (' – xám' if xam else ''), (127, 224, 200), 500), (0, 540 * j))
        g.save(os.path.join(OUT3, 'ghep-phong-def%s.png' % ('-xam' if xam else '')))
    print('ảnh D/E/F', json.dumps(kq, ensure_ascii=False)); return kq


async def anh_iphone_def(p, cong):
    kq = {}
    for ph, (vao, js) in CANH_DEF.items():
        b, pg, loi = await mo(p, cong, SAU, q='&vao=' + vao, vp=(844, 390), dsf=3, touch=True, an_ui=False)
        await pg.evaluate(js)
        await pg.screenshot(path=os.path.join(OUT3, 'iphone-844x390-%s.png' % ph))
        kq[ph] = {'loi': loi, 'BK': await pg.evaluate('BK'), 'goi_y': await pg.evaluate('hintEl.textContent'),
                  'vung_cham': await pg.evaluate('''[...document.querySelectorAll('#dpad,.ab')].map(e => { const r = e.getBoundingClientRect(); return [e.id, Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; })''')}
        await b.close()
    print('iphone D/E/F', json.dumps(kq, ensure_ascii=False)); return kq


async def anh_bo_nen(p, cong):
    """Bọ màu trầm trên nền D: cảnh D (báo húc) với nền D GỐC (al 1) và nền D đã GIẢM tương phản (al 0,8), cắt quanh Bọ, màu + xám,
    + độ tương phản độ sáng Bọ / nền quanh Bọ (trung vị) để có số chứ không chỉ mắt nhìn"""
    kq = {}; anh = {}
    vao, js = CANH_DEF['d']
    for ten, them in (('nen-goc', '&nenD=goc'), ('nen-giam', '')):
        b, pg, loi = await mo(p, cong, SAU, q='&vao=d' + them)
        await pg.evaluate(js)
        hop = await pg.evaluate('''BO.DS.map(b => [Math.round(b.x - ox), Math.round(b.y - oy - 22), b.w, b.h + 22])''')
        im = Image.open(io.BytesIO(await pg.screenshot(type='png'))).convert('RGB'); anh[ten] = (im, hop)
        await pg.evaluate('TVP0.anUI(1); PBK.anBo = true; render(1)')   # cùng khung, KHÔNG vẽ Bọ → lấy nền thật sau Bọ
        nen = Image.open(io.BytesIO(await pg.screenshot(type='png'))).convert('RGB')
        await pg.evaluate('PBK.anBo = false')
        import numpy as np
        L = np.asarray(ImageOps.grayscale(im)).astype(float); Ln = np.asarray(ImageOps.grayscale(nen)).astype(float)
        do = []
        for (x, y, w, h) in hop:
            m = np.abs(L[y:y + h, x:x + w] - Ln[y:y + h, x:x + w]) > 12          # điểm thuộc Bọ = khác ảnh không Bọ
            if m.sum() < 50: continue
            bo = np.median(L[y:y + h, x:x + w][m]); quanh = np.median(Ln[max(0, y - 30):y + h, max(0, x - 40):x + w + 40])
            lech = float(np.std(Ln[max(0, y - 30):y + h, max(0, x - 40):x + w + 40]))   # độ lệch chuẩn độ sáng nền quanh Bọ = tương phản nền
            do.append({'L_bo': round(float(bo), 1), 'L_nen_quanh': round(float(quanh), 1), 'chenh': round(float(bo - quanh), 1), 'do_lech_nen': round(lech, 1),
                       'ti_le_weber': round(float((bo - quanh) / max(quanh, 1)), 2), 'phan_tram_diem_bo_sang_hon_nen': round(float((L[y:y + h, x:x + w][m] > quanh + 10).mean() * 100), 1)})
        kq[ten] = {'loi': loi, 'do': do}; await b.close()
    # ghép: 2 hàng (nền gốc / nền giảm) × (màu, xám), cắt 640×260 quanh 2 Bọ
    g = Image.new('RGB', (1280, 520))
    for j, ten in enumerate(('nen-goc', 'nen-giam')):
        im, hop = anh[ten]; x0 = max(0, min(320, hop[0][0] - 120)); vung = (x0, 230, x0 + 640, 490)
        a = im.crop(vung); x = ImageOps.grayscale(a).convert('RGB')
        g.paste(nhan(a, ('Nền D gốc' if j == 0 else 'Nền D giảm tương phản (đang dùng)'), (255, 230, 160)), (0, 260 * j)); g.paste(nhan(x, 'xám'), (640, 260 * j))
        luu_mx(im, 'bo-' + ten)
    g.save(os.path.join(OUT3, 'bo-tren-nen-d-ghep.png'))
    print('Bọ trên nền', json.dumps(kq, ensure_ascii=False)); return kq


async def anh_thap_b(p, cong):
    """phòng B: cùng cảnh chiến đấu, tháp nền chưa nén sáng (?thapB=cu) / đã nén sáng (mặc định) – màu + xám + phóng vùng cửa sổ"""
    kq = {}; ims = {}
    for ten, them in (('truoc', '&thapB=cu'), ('sau', '')):
        b, pg, loi = await mo(p, cong, SAU, q=them)
        kq[ten] = {'canh': await pg.evaluate(CANH + '(8)'), 'loi': loi}
        im = Image.open(io.BytesIO(await pg.screenshot(type='png'))).convert('RGB'); ims[ten] = im; luu_mx(im, 'thap-b-' + ten); await b.close()
    g = Image.new('RGB', (1920, 540)); g2 = Image.new('RGB', (1920, 540)); z = Image.new('RGB', (1280, 640))
    for i, ten in enumerate(('truoc', 'sau')):
        lb = 'TRƯỚC – cửa sổ sáng' if i == 0 else 'SAU – nén vùng sáng tháp'
        g.paste(nhan(ims[ten].copy(), lb, (255, 230, 160), 500), (960 * i, 0)); g2.paste(nhan(ImageOps.grayscale(ims[ten]).convert('RGB'), lb + ' (xám)', (255, 255, 255), 500), (960 * i, 0))
        z.paste(nhan(ims[ten].crop((400, 140, 720, 460)).resize((640, 640), Image.LANCZOS), lb), (640 * i, 0))
    g.save(os.path.join(OUT3, 'thap-b-truoc-sau.png')); g2.save(os.path.join(OUT3, 'thap-b-truoc-sau-xam.png')); z.save(os.path.join(OUT3, 'thap-b-phong-cua-so.png'))
    print('tháp B', kq); return kq


def ffmpeg_ra(dst):
    return subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '60', '-c:v', 'mjpeg', '-i', '-',
                             '-vf', 'format=yuv420p', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-r', '60', '-movflags', '+faststart', dst], stdin=subprocess.PIPE)


async def ranh(p, cong, quay=True):
    """(1) video cuộn chậm A → F: camera đặt thẳng, 1,5 px / khung (đi qua mọi ranh mảng 256 × 128), Lam đứng ở A, ẩn UI.
       (2) soi ranh: ở nhiều vị trí camera lẻ × tỉ lệ K (1 / 1,5 / 2 / 2,1656 = iPhone 844×390@3x / 3) vẽ riêng lớp đất trên nền đen + trắng,
           đếm điểm hở trong ô đặc (phải = 0) + ảnh phóng 4× quanh giao điểm ranh mảng."""
    b, pg, loi = await mo(p, cong, SAU, q='&vao=a')
    gi = await pg.evaluate('TVPB.gioi()')
    dst = os.path.join(OUT3, 'cuon-cham-a-f-60fps.mp4'); ff = ffmpeg_ra(dst) if quay else None
    x = gi['a0']; n = 0
    while quay and x <= gi['cF']:
        await pg.evaluate('(x) => TVPB.datCam(x)', x)
        im = Image.open(io.BytesIO(await pg.screenshot(type='jpeg', quality=95))); bb = io.BytesIO(); im.save(bb, 'JPEG', quality=95); ff.stdin.write(bb.getvalue())
        x += 1.5; n += 1
    if ff: ff.stdin.close(); ff.wait()
    kq = {} if not quay else {'video': {'file': 'buoc-3/' + os.path.basename(dst), 'khung': n, 'giay': round(n / 60, 2), 'px_moi_khung': 1.5, 'tu': gi['a0'], 'den': gi['cF']}}
    # soi ranh
    soi = []; tong = {}
    import random; rd = random.Random(20261029)
    xs = [min(gi['cF'], gi['a0'] + i * (gi['cF'] - gi['a0']) / 47 + rd.random() * 3) for i in range(48)]   # camera game không vượt mép phải F
    for K in (1, 1.5, 2, 2.165625, 3):
        ho = ranh_ho = 0
        for cx in xs:
            r = await pg.evaluate('([cx, K]) => { const r = TVPB.soiRanh(cx, 0, K, false); delete r.url; return r; }', [cx, K])
            ho += r['ho']; ranh_ho += r['ranh']
            if r['ho']: soi.append(r)
        tong[str(K)] = {'vi_tri': len(xs), 'diem_ho_trong_o_dac': ho, 'trong_do_sat_ranh_mang': ranh_ho}
    kq['soi'] = {'tong': tong, 'chi_tiet_cho_ho': soi[:20]}
    # ảnh phóng 4× quanh giao điểm ranh mảng ở 4 chỗ (sàn B, trần C, tường A, sàn E) × K 2,1656 (iPhone) và 2
    anh = []
    for ten, cx, gy in (('san-b', gi['phong'][1][1] + 300.37, 512), ('tran-c', gi['phong'][2][1] + 64.61, 128), ('san-d', gi['phong'][3][1] + 0.5, 512), ('san-e', gi['phong'][4][1] + 130.83, 512)):
        for K in (2, 2.165625):
            r = await pg.evaluate('([cx, K, gy]) => TVPB.soiRanh(cx, 0, K, gy)', [cx, K, gy])
            f = 'ranh-%s-k%s.png' % (ten, str(K).replace('.', '_')); open(os.path.join(OUT3, f), 'wb').write(base64.b64decode(r['url'].split(',')[1])); anh.append([f, r['ho']])
    # thêm: ranh trần C (ranh dọc + ngang trong khối thân dày) – chọn đúng giao điểm (x bội 256, y = 128) trong trần
    kq['anh_phong'] = anh; kq['loi_trang'] = loi
    await b.close()
    print('ranh', json.dumps(kq, ensure_ascii=False)[:3000]); return kq


TT_D = 'TVPB.ttD()'


def bot_d(s, i, nho):
    x = s['x']; song = [b for b in s['bo'] if not b['chet']]
    if s['room'] == s['pd'] and song:
        tg = min(song, key=lambda b: abs(b['x'] - x)); dx = tg['x'] - x
        if abs(dx) > 72: return 'r' if dx > 0 else 'l'
        if (s['face'] > 0) != (dx > 0): return 'r' if dx > 0 else 'l'
        return 'a' if i % 2 == 0 else ''
    if s['room'] != s['pf'] or s['de'] - x > 40: return 'r'
    nho['de'] = nho.get('de', 0) + 1
    return ''


async def video_def(p, cong):
    b, pg, loi = await mo(p, cong, SAU, q='&vao=d')
    dst = os.path.join(OUT3, 'lam-d-e-f-60fps.mp4'); ff = ffmpeg_ra(dst)
    n = 0; nho = {}; ghi = []
    while n < 3000:
        s = await pg.evaluate(TT_D); k = bot_d(s, n, nho)
        if n % 30 == 0: ghi.append([n, s['room'], round(s['x']), [(bb['st'], bb['hp'], bb['mai']) for bb in s['bo']], s['nong'], s['goiy']])
        if nho.get('de', 0) > 150: break
        await pg.evaluate('(k) => TVP0.khung(1, k)', k)
        im = Image.open(io.BytesIO(await pg.screenshot(type='jpeg', quality=92))); bb = io.BytesIO(); im.save(bb, 'JPEG', quality=92); ff.stdin.write(bb.getvalue()); n += 1
    ff.stdin.close(); ff.wait(); await b.close()
    print('video D→F', n, loi); return {'file': 'buoc-3/' + os.path.basename(dst), 'khung': n, 'giay': round(n / 60, 2), 'loi_trang': loi, 'nhat_ky_30_khung': ghi}


async def do_ve_def(p, cong):
    kq = {'ghi_chu': 'Chromium headless, máy chủ Linux KHÔNG GPU, 960×540 dsf 1, đứng yên 300 khung (D: 2 Bọ tuần tra). CHƯA đo trên iPhone thật.'}
    b, pg, loi = await mo(p, cong, SAU)
    for ph, x in (('a', '(PA.x0 + 6) * T'), ('b', '(PB.x0 + 9) * T'), ('c', '(PC.x0 + 8) * T'), ('d', '(PD.x0 + 3) * T'), ('e', '(PE.x0 + 13) * T'), ('f', '(PF.x0 + 9) * T')):
        await pg.evaluate('TVP0.datLam(%s, 1)' % x)
        kq[ph] = await pg.evaluate('''(() => { DO.reset(); for (let i = 0; i < 300; i++) { savePrev(); step(); render(1); }
          const a = DO.ds.slice().sort((p, q) => p - q); return {n: a.length, tb: +(DO.tong / DO.n).toFixed(3), p50: +a[a.length >> 1].toFixed(3), p95: +a[Math.floor(a.length * 0.95)].toFixed(3), max: +DO.max.toFixed(3)}; })()''')
    kq['nap'] = await pg.evaluate('TVPB.so()'); kq['loi'] = loi; await b.close()
    print('đo D/E/F', json.dumps(kq, ensure_ascii=False)); return kq


async def main(viec):
    s, cong = server()
    so_path = os.path.join(OUT, 'so-do.json')
    so = json.load(open(so_path)) if os.path.exists(so_path) else {}
    async with async_playwright() as p:
        if 'mep' in viec: so['kiem_mep'] = await anh_mep(p, cong)
        if 'anh' in viec: so['anh_chien_dau'] = await anh_chien_dau(p, cong)
        if 'iphone' in viec: so['iphone'] = await anh_iphone(p, cong)
        if 'do' in viec: so['do_ve'] = await do_ve(p, cong)
        if 'video' in viec: so['video'] = await video(p, cong)
        if 'phong' in viec: so['phong'] = await anh_phong(p, cong)
        if 'iphone-phong' in viec: so['iphone_phong'] = await anh_iphone_phong(p, cong)
        if 'do-phong' in viec: so['do_phong'] = await do_ve_phong(p, cong)
        if 'video-abc' in viec: so['video_abc'] = await video_abc(p, cong)
        b3 = so.setdefault('buoc_3', {})
        if 'phong-def' in viec: b3['phong'] = await anh_phong_def(p, cong)
        if 'iphone-def' in viec: b3['iphone'] = await anh_iphone_def(p, cong)
        if 'bo-nen' in viec: b3['bo_nen'] = await anh_bo_nen(p, cong)
        if 'thap-b' in viec: b3['thap_b'] = await anh_thap_b(p, cong)
        if 'do-def' in viec: b3['do_ve'] = await do_ve_def(p, cong)
        if 'ranh' in viec: b3['ranh'] = await ranh(p, cong)
        if 'soi' in viec: b3.setdefault('ranh', {}).update(await ranh(p, cong, quay=False))   # chỉ soi ranh, không quay lại video
        if 'video-def' in viec: b3['video'] = await video_def(p, cong)
    so['ngay'] = time.strftime('%Y-%m-%d %H:%M')
    json.dump(so, open(so_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    s.shutdown()


if __name__ == '__main__':
    asyncio.run(main(sys.argv[1:] or ['mep', 'anh', 'iphone', 'do', 'video', 'phong', 'iphone-phong', 'do-phong', 'video-abc']))
