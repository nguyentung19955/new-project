#!/usr/bin/env python3
"""Sửa theo nhận xét iPhone 28/10 (kiếm to, vệt chém, nhảy) – chụp + đo + quay cho game/thu-p0a/am-dao.html → game/thu-p0a/video-am-dao/2810/
  khung  : chụp TỪNG TICK của nhát 1, 2, 3, hất, bổ xuống (nảy), trên không, chém vang – cắt quanh Lam, phóng ×2, ghép thành 1 ảnh mỗi đòn
           (bản sạch + bản ?hitbox=1). Chạy với --goc <thư mục repo khác> để chụp bản TRƯỚC (git worktree của commit cũ).
  mui    : đo mũi lưỡi (bảng luoi của sheet) so với mép hộp đòn ở mọi tick hộp bật → mui.json
  nhay   : đo quỹ đạo nhảy trong game (đứng yên, giữ nhảy / chạm 1 tick / giữ 8 tick / nhảy tường / nảy) cho ?nhay=cu và mặc định → nhay.json
  video  : video ngắn KHÔNG bất tử: chạy – nhảy – chém (phòng P0-A) → 2810-chay-nhay-chem.mp4
Chỉ là chụp + ghi số cho chủ dự án xem, không phải bộ kiểm thử tự động.
Chạy: python3 -B game/thu-p0a/cong-cu/quay-2810.py [khung mui nhay video] [--goc DIR --nhan truoc]"""
import asyncio, functools, http.server, io, json, os, socketserver, subprocess, sys, threading
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
GOC_REPO = os.path.normpath(os.path.join(HERE, '..', '..', '..'))
GOC = os.path.abspath(sys.argv[sys.argv.index('--goc') + 1]) if '--goc' in sys.argv else GOC_REPO
NHAN = sys.argv[sys.argv.index('--nhan') + 1] if '--nhan' in sys.argv else 'sau'
OUT = os.path.join(GOC_REPO, 'game', 'thu-p0a', 'video-am-dao', '2810'); os.makedirs(OUT, exist_ok=True)
try:
    FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 15)
except Exception:
    FONT = ImageFont.load_default()


class Im(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


class Trang:
    def __init__(s, b, cong, q):
        s.b, s.cong, s.q = b, cong, q

    async def mo(s):
        s.pg = await s.b.new_page(viewport={'width': 960, 'height': 540}, device_scale_factor=1)
        s.loi = []; s.pg.on('pageerror', lambda e: s.loi.append(str(e)))
        await s.pg.route('https://fonts.g*/**', lambda r: r.abort())
        await s.pg.goto('http://127.0.0.1:%d/game/thu-p0a/am-dao.html?ghi=1%s' % (s.cong, s.q))
        await s.pg.wait_for_function('window.TVDEMO && TVDEMO.ready', timeout=120000)
        await s.pg.evaluate('TVP0.batDau()'); await s.pg.evaluate('TVP0.anUI(1)')
        return s

    async def js(s, e):
        return await s.pg.evaluate(e)

    async def buoc(s, phim=''):
        return await s.pg.evaluate('(p)=>TVP0.khung(1,p)', phim)

    async def anh(s):
        return Image.open(io.BytesIO(await s.pg.screenshot(type='png'))).convert('RGB')


TT = '({x:pl.x+10-ox, y:pl.y+30-oy, f:pl.face, n:pl.atkN, t:pl.atkT, vy:pl.vy, g:pl.onGround, py:pl.y})'


async def dat(t, cap=1, x='(PA.x0+10)*T-82'):
    await t.js('AD.datCap(%d,"công cụ"); TVP0.datLaiQuai(6); TVP0.datLam(%s,1); TVAD.hoiNgay(); echo=null; rec=null' % (cap, x))
    for _ in range(6): await t.buoc()


# mỗi đòn: (tên, cấp, hàm chuẩn bị bấm theo tick i → phím)
def kb_combo(n):
    bam = {1: [0], 2: [0, 14], 3: [0, 14, 28]}[n]
    return lambda i, st: 'a' if i in bam else ''


def kb_hat(i, st): return 'ua' if i == 0 else ''
def kb_kv(i, st): return 'a' if i < 22 else ''


def kb_khong(i, st):   # nhảy rồi chém trên không
    if i < 14: return 'j'
    return 'ja' if i == 14 else 'j'


def kb_nay(i, st):     # nhảy cao, rơi xuống trên hình nộm, bổ xuống (nảy)
    if i < 16: return 'jr' if i < 10 else 'j'
    if st['vy'] > 1 and not st.get('bo'): st['bo'] = 1; return 'da'
    return ''


DON = [('nhat1', 1, kb_combo(1), 1, 60, '(PA.x0+10)*T-82'), ('nhat2', 1, kb_combo(2), 2, 60, '(PA.x0+10)*T-82'), ('nhat3', 1, kb_combo(3), 3, 70, '(PA.x0+10)*T-82'),
       ('hat', 1, kb_hat, 5, 50, '(PA.x0+10)*T-82'), ('tren-khong', 1, kb_khong, 6, 60, '(PA.x0+10)*T-82'),
       ('bo-xuong', 1, kb_nay, 4, 90, '(PA.x0+10)*T-60'), ('chem-vang', 3, kb_kv, 7, 80, '(PA.x0+10)*T-82')]


def cat(im, st, mau):
    x, y = int(st['x']), int(st['y'])
    f = st['f']
    x0 = x - 70 if f > 0 else x - 190
    c = im.crop((x0, y - 190, x0 + 260, y + 30)).resize((520, 440), Image.LANCZOS)
    d = ImageDraw.Draw(c); d.rectangle([0, 0, 519, 20], fill=(12, 15, 20)); d.text((4, 2), '%s · %s' % (NHAN, mau), font=FONT, fill=(255, 230, 160))
    return c


async def chup_khung(b, cong):
    ket = {}
    for hb in (0, 1):
        t = await Trang(b, cong, '&battu=1&cap=1' + ('&hitbox=1' if hb else '')).mo()
        for ten, cap, kb, n, so, x in DON:
            await dat(t, cap, x); st = await t.js(TT); s = {'vy': 0}; tiles = []; vet_het = None
            for i in range(so):
                s['vy'] = st['vy']
                await t.buoc(kb(i, s)); st = await t.js(TT)
                vet = await t.js("IFX.filter(f=>f.on&&f.ten==='vet').length")
                if st['n'] == n or (vet and tiles):
                    tiles.append(cat(await t.anh(), st, 'đòn %d tick %d%s' % (n, st['t'], ' · vệt' if vet else '')))
                elif tiles and not vet:
                    if vet_het is None: vet_het = i
                    if i - vet_het > 2: break
            if not tiles: print('  !', ten, 'không ra đòn', n); continue
            cot = 6; hang = (len(tiles) + cot - 1) // cot
            g = Image.new('RGB', (520 * cot, 440 * hang), (0, 0, 0))
            for k, im in enumerate(tiles): g.paste(im, ((k % cot) * 520, (k // cot) * 440))
            g = g.resize((g.width // 2, g.height // 2), Image.LANCZOS)
            p = os.path.join(OUT, 'khung-%s-%s%s.png' % (ten, NHAN, '-hop' if hb else ''))
            g.save(p, optimize=True); ket[os.path.basename(p)] = len(tiles)
            print(' ', os.path.basename(p), len(tiles), 'khung')
        print('  lỗi trang:', t.loi); await t.pg.close()
    return ket


async def do_mui(b, cong):
    """mũi lưỡi lúc hộp bật: so với mép trước hộp (nhìn phải, px logic so với chân)"""
    t = await Trang(b, cong, '&battu=1').mo()
    kq = await t.js("""(()=>{const M=LAM.HD.meta, o={};
      for(const n of [1,2,3,4,5,6,7]){ const d=M.don['atk'+n]; if(!d) continue; const a=ATK[n], bx=a.box; const r=[];
        for(let at=a.su; at<a.su+a.ac; at++){ const ten=d.tu_the_theo_atkT? d.tu_the_theo_atkT[Math.max(1,Math.min(at,d.tu_the_theo_atkT.length))-1] : null;
          const fi=d.khung_theo_atkT[Math.max(1,Math.min(at,d.khung_theo_atkT.length))-1], fr=M.frames[fi], L=M.luoi[fr.ten]; if(!L) continue;
          const [mx,my]=L.mui, vx=Math.max(bx[0]-mx, mx-(bx[0]+bx[2]), 0), vy=Math.max(bx[1]-my, my-(bx[1]+bx[3]), 0);
          r.push({at, khung:fr.ten, mui:L.mui, goc:L.goc, dai:+Math.hypot(mx-L.goc[0],my-L.goc[1]).toFixed(1), vuot:+Math.hypot(vx,vy).toFixed(1)}); }
        o['atk'+n]={hop:bx, tick:r, vuot_max:Math.max(0,...r.map(q=>q.vuot)), trong_hop:r.filter(q=>q.vuot===0).length+'/'+r.length}; }
      return o;})()""")
    await t.pg.close(); return kq


async def do_nhay(b, cong):
    kq = {}
    for q, ten in (('&nhay=cu', 'cu'), ('', 'moi')):
        t = await Trang(b, cong, '&battu=1' + q).mo(); r = {}
        r['P'] = await t.js('({jumpHeight:P.jumpHeight,gravity:P.gravity,apexGravMul:P.apexGravMul,apexThreshold:P.apexThreshold,jumpCut:P.jumpCut,maxFall:P.maxFall,fallGravMul:P.fallGravMul,jumpVel,che:typeof NHAY!=="undefined"?NHAY.che:"cu"})')
        for kieu, giu in (('giu', 999), ('cham-1', 1), ('giu-8', 8)):
            await t.js('TVP0.datLam((PA.x0+3)*T,1)')
            for _ in range(8): await t.buoc()
            y0 = (await t.js(TT))['py']; ys = []; anim = []
            for i in range(120):
                st = await t.buoc('j' if i < giu else ''); s2 = await t.js('({py:pl.y,g:pl.onGround,k:pl.k2,vy:pl.vy})')
                ys.append(round(y0 - s2['py'], 2)); anim.append(await t.js('(()=>{const f=LAM.HD.meta.frames[pl.k2];return f?f.ten:pl.k2})()'))
                if i > 2 and s2['g']: break
            pk = max(ys); tp = ys.index(pk)
            r[kieu] = {'cao': pk, 'tick_len_dinh': tp + 1, 'tick_roi': len(ys) - tp - 1, 'tong': len(ys), 'gan_dinh_8px': sum(1 for y in ys if y >= pk - 8),
                       'toi_90': next(i for i, y in enumerate(ys) if y >= 0.9 * pk) + 1, 'quy_dao': ys, 'hoat_anh': anim}
        kq[ten] = r; print(' ', ten, {k: (v['cao'], v['tick_len_dinh'], v['tick_roi']) for k, v in r.items() if k != 'P'}, 'lỗi', t.loi)
        await t.pg.close()
    return kq


async def quay_video(b, cong):
    """KHÔNG bất tử: phòng P0-A, chạy tới, nhảy qua lại, chém hình nộm (combo, hất, trên không, bổ xuống)"""
    t = await Trang(b, cong, '&cap=1').mo()
    await t.js('TVP0.datLaiQuai(6); TVP0.datLam((PA.x0+2)*T,1)')
    for _ in range(4): await t.buoc()
    p = os.path.join(OUT, '2810-chay-nhay-chem.mp4')
    ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '60', '-c:v', 'mjpeg', '-i', '-', '-vf', 'format=yuv420p',
                           '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-r', '60', '-movflags', '+faststart', p], stdin=subprocess.PIPE)
    # bot đơn giản theo vị trí (không dời quái, không bất tử): nhảy tới → áp sát hình nộm → combo → hất → nhảy chém → lùi → nhảy bổ xuống (nảy) → combo
    NOMX = await t.js('Q[6].x+Q[6].w/2'); kq = []
    pha, dem, n = 0, 0, 0
    while n < 600:
        st = await t.js('({x:pl.x+10, g:pl.onGround, vy:pl.vy, atk:pl.atkN})'); d = NOMX - st['x']; k = ''
        if pha == 0: k = 'rj' if dem < 18 else 'r'; pha, dem = (1, 0) if dem > 20 and st['g'] else (0, dem + 1)
        elif pha == 1: k = 'r' if d > 72 else ''; pha = 2 if d <= 72 else 1; dem = 0
        elif pha == 2: k = 'a' if dem in (2, 16, 30) else ''; dem += 1; pha, dem = (3, 0) if dem > 62 else (2, dem)
        elif pha == 3: k = 'ua' if dem == 0 else ''; dem += 1; pha, dem = (4, 0) if dem > 32 else (3, dem)
        elif pha == 4: k = 'j' if dem < 14 else ('ja' if dem == 14 else ('j' if dem < 18 else '')); dem += 1; pha, dem = (5, 0) if dem > 50 and st['g'] else (4, dem)
        elif pha == 5: k = 'l' if d < 170 else ''; dem += 1; pha, dem = (6, 0) if d >= 170 and dem > 5 else (5, dem)
        elif pha == 6:
            k = ('r' if d > 0 else '') + 'j'; dem += 1
            if dem > 4 and not st['g'] and st['vy'] > 0 and abs(d) < 26: k = 'da'; pha, dem = 7, 0
            elif dem > 4 and st['g']: pha, dem = 8, 0
        elif pha == 7: dem += 1; k = 'j' if dem < 3 else ''; pha, dem = (8, 0) if st['g'] and dem > 10 else (7, dem)
        elif pha == 8: k = 'l' if d < 72 and dem < 30 else ''; dem += 1; pha, dem = (9, 0) if dem > 30 else (8, dem)
        elif pha == 9:
            k = 'a' if dem in (2, 16, 30) else ''; dem += 1
            if dem > 70: break
        await t.buoc(k); kq.append(k); n += 1
        im = await t.pg.screenshot(type='jpeg', quality=90); ff.stdin.write(im)
    kb = kq
    ff.stdin.close(); ff.wait()
    hp = await t.js('pl.hp'); pogo = await t.js('pl.airJump'); print('  video', len(kb), 'khung, máu Lam', hp, 'lỗi', t.loi, 'nhật ký phím:', ''.join(k[:1] or '.' for k in kb)); await t.pg.close()
    return {'file': os.path.basename(p), 'khung': len(kb), 'giay': round(len(kb) / 60, 2), 'bat_tu': False, 'loi_trang': t.loi}


async def main():
    can = [a for a in sys.argv[1:] if not a.startswith('--') and a not in (GOC, NHAN)] or ['khung', 'mui', 'nhay', 'video']
    srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Im, directory=GOC)); cong = srv.server_address[1]
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    kq_p = os.path.join(OUT, 'ket-qua-%s.json' % NHAN); kq = json.load(open(kq_p, encoding='utf-8')) if os.path.exists(kq_p) else {}
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for ten, fn in (('khung', chup_khung), ('mui', do_mui), ('nhay', do_nhay), ('video', quay_video)):
            if ten in can:
                kq[ten] = await fn(b, cong); json.dump(kq, open(kq_p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        await b.close()
    srv.shutdown()


if __name__ == '__main__':
    asyncio.run(main())
