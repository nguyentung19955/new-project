#!/usr/bin/env python3
"""Ảnh duyệt + video + số đo cho trang thử PHÒNG B → game/thu-phong-b/xem-thu/
Không phải kiểm thử tự động: chỉ chụp, quay, ghi số đo để chủ dự án xem.
  TRƯỚC = game/thu-p0a/index.html (phòng B như hiện tại)   SAU = game/thu-phong-b/index.html
Cần playwright + Chromium + ffmpeg + Pillow.
Chạy: python3 -B game/thu-phong-b/cong-cu/chup-va-quay.py [mep] [anh] [iphone] [do] [video]   (không ghi gì = làm hết)"""
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
    for k in ('hang-dai', 'mang-4x4', 'goc-lom', 'be-don'):
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
    so['ngay'] = time.strftime('%Y-%m-%d %H:%M')
    json.dump(so, open(so_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    s.shutdown()


if __name__ == '__main__':
    asyncio.run(main(sys.argv[1:] or ['mep', 'anh', 'iphone', 'do', 'video']))
