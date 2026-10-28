#!/usr/bin/env python3
"""Quay trang thử P0-C (game/thu-p0c/index.html) → game/thu-p0c/video/   (sửa theo PHAN-HOI-10)
Không phải bộ kiểm thử tự động: chỉ quay + ghi số / log ra file (không có đạt / trượt).

  1. LUỒNG NGƯỜI CHƠI – KHÔNG bất tử (PH10 mục 8; bot có thể chết, ghi lại): ?vao=e, chạy song song từng bước trên 2 trang cùng đầu vào
     SẠCH (?vao=e) và DEBUG (+ ?hitbox=1&debug=p0c).
       a. Đánh tinh anh CHỈ BẰNG ĐÁNH THƯỜNG (cấp 1, không V, không Dư Âm): thấy báo ĐẬP (giơ tay) → lướt / lùi khỏi tầm;
          thấy báo HÚC (rụt người + ») → chờ, nó lao tới gần thì LƯỚT xuyên qua. Chết → hồi sinh ở mốc đầu E → đánh lại.
       b. Nhặt Ấn → sang F (qua chuông lưu F) → đứng cạnh đe 40 tick (KHÔNG tự rèn) → bấm F → cấp 3.
       c. Tới hình nộm F (chỗ an toàn): giữ Chém 26 tick rồi thả → Dư Âm vào hình nộm.
       d. Quay lại E: 2 Chuông Gỗ thường (sau rèn) – né đòn đập, rồi giữ–thả Dư Âm trong lúc nó hồi; đánh thường khi Dư Âm đang hồi.
  2. DEBUG TRẠNG THÁI (PH10 mục 3, 4, 5, 6) – một trang ?vao=e&hitbox=1&debug=p0c, từng ca dựng bằng lệnh debug (ghi rõ trên hình):
     lướt sớm / quá sớm · rời E khi đang đánh (+ vết Dư Âm vang lúc Lam đã ở F) · mốc hồi sinh E · tinh anh chết → Lam chết trước khi nhặt ·
     nhặt rồi chết · đứng cạnh đe không tự rèn · rèn rồi quay lại bấm nữa · rời phòng khi Ấn còn trên đất.
  3. ĐO lướt xuyên + đẩy chạm thân (cong-cu/do-luot-day.js) → video/do-luot-day.json (không video).
  4. ?choang=120 (biến thể, tắt mặc định): cùng bot đánh tinh anh, không video – chỉ ghi số choáng.
60 hình/s, mỗi hình = 1 bước logic, H.264 -preset veryfast.
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
    FONT2 = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 15)
except Exception:
    FONT = FONT2 = ImageFont.load_default()


class Im(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def ffmpeg(dst):
    return subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '60', '-c:v', 'mjpeg', '-i', '-',
                             '-vf', 'format=yuv420p', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-r', '60', '-movflags', '+faststart', dst],
                            stdin=subprocess.PIPE)


def nhan(im, chu, ca=''):
    d = ImageDraw.Draw(im, 'RGBA'); w = d.textlength(chu, font=FONT)
    d.rectangle([im.width - w - 16, 512, im.width, 540], fill=(12, 15, 20, 210)); d.text((im.width - w - 8, 515), chu, font=FONT, fill=(243, 230, 200))
    if ca:   # tên ca (debug trạng thái): gói dòng, đặt trên thanh chú thích collider của ?hitbox=1
        dong, cur = [], ''
        for tu in ca.split(' '):
            if d.textlength(cur + ' ' + tu, font=FONT2) > 900 and cur: dong.append(cur); cur = tu
            else: cur = (cur + ' ' + tu).strip()
        dong.append(cur); y0 = 484 - 20 * len(dong)
        for i, t in enumerate(dong):
            w2 = d.textlength(t, font=FONT2); d.rectangle([0, y0 + i * 20, w2 + 16, y0 + i * 20 + 20], fill=(20, 40, 70, 225)); d.text((8, y0 + i * 20 + 2), t, font=FONT2, fill=(200, 230, 255))
    return im


class Trang:
    def __init__(s, b, cong, q):
        s.b, s.cong, s.q = b, cong, q

    async def mo(s):
        s.pg = await s.b.new_page(viewport={'width': 960, 'height': 540}, device_scale_factor=1)
        s.loi = []; s.pg.on('pageerror', lambda e: s.loi.append(str(e)))
        await s.pg.route('https://fonts.g*/**', lambda r: r.abort())
        await s.pg.goto('http://127.0.0.1:%d/game/thu-p0c/index.html?ghi=1&vao=e%s' % (s.cong, s.q))
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


def huong(dx):
    return 'r' if dx > 0 else 'l'


def bot_tinh_anh(s, st):
    """Một bước đánh tinh anh (chỉ đánh thường). s: trạng thái bot. Trả (phím, nhãn)."""
    ta, x, fr = st['ta'], st['x'], st['f']
    dx = ta['x'] - x; adx = abs(dx); toi = huong(dx); lui = huong(-dx)
    khe = adx - ta['w'] / 2 - 4 - 20   # mép hộp húc – mép vùng ăn đòn Lam
    san_sang = st['dash'] <= 0 and st['dashCd'] <= 0
    if st['hp'] <= 0: return '', 'Lam ngã – chờ hồi sinh'
    if ta['ta'] in ('dapBao', 'dap'):
        if ta['ta'] == 'dapBao' and adx < 200 and san_sang and not s.get('luiDap'): s['luiDap'] = 1; return lui + 's', 'thấy GIƠ TAY (báo đập) → lướt lùi'
        return (lui, 'thấy báo đập → lùi khỏi tầm') if adx < 260 else ('', 'chờ đập hụt')
    s['luiDap'] = 0
    if ta['ta'] == 'hucBao':
        return ('', 'thấy RỤT NGƯỜI + » (báo húc) → chờ') if adx >= 160 else (lui, 'báo húc → giãn cách')
    if ta['ta'] == 'huc':
        if khe <= 45 and san_sang and (ta['hucDir'] > 0) == (dx < 0): return toi + 's', 'HÚC lao tới → LƯỚT xuyên qua'
        return (toi if st['xu'] else ''), ('đang xuyên thân' if st['xu'] else 'húc')
    if ta['ta'] in ('ngu', 'thuc', 've'):
        return (toi, 'tiến vào') if adx > 300 else ('', 'chờ')
    if adx > 118: return toi, 'áp sát'
    if adx < 84 and ta['ta'] != 'choang': return lui, 'giãn cách (thân to)'
    if (dx > 0) != (st['face'] > 0): return toi, 'quay mặt'
    if fr - s['lastA'] >= 14:
        s['lastA'] = fr; return 'a', 'chạm Chém (đánh thường)' + (' – tinh anh choáng' if ta['ta'] == 'choang' else '')
    return '', 'đánh thường'


def bot_luong(choang_only=False):
    """Bot luồng người chơi. Trả về hàm (state) → (phím, nhãn) và dict trạng thái bot."""
    s = {'pha': 'danh', 'lastA': -99, 'giu': 0, 'cho': 0, 'ren': False, 'xong': 0, 'cg': None, 'giuDA': 0, 'ganNom': 0}

    def toi_x(st, x, tol=6):
        dx = x - st['x']
        return (huong(dx), dx) if abs(dx) > tol else ('', 0)

    def f(st):
        ta = st['ta']; fr = st['f']
        if st['f'] > 7000: s['xong'] = 1
        if s['pha'] == 'danh':
            if ta['gone'] or ta['ta'] == 'chet':
                s['pha'] = 'nhat'
                if choang_only: s['xong'] = 1
                return '', 'tinh anh hạ'
            return bot_tinh_anh(s, st)
        if s['pha'] == 'nhat':
            if st['an']['co']: s['pha'] = 'de'; return '', 'đã nhặt Ấn Rèn I'
            if not st['an']['on']: return '', 'chờ Ấn rơi'
            k, _ = toi_x(st, st['an']['x'], 4)
            return k, 'tới nhặt Ấn'
        if s['pha'] == 'de':
            k, _ = toi_x(st, st['de'] - 60)
            if k: return k, 'sang phòng F (qua chuông lưu), tới đe rèn'
            if st['face'] < 0: return 'r', 'quay về phía đe'
            s['cho'] += 1
            if s['cho'] < 40: return '', 'đứng cạnh đe – KHÔNG tự rèn (cấp ' + str(st['cap']) + ')'
            if not s['ren'] and st['coTheRen']: s['ren'] = True; return 'F', 'bấm Rèn (phím F)'
            if s['ren'] and st['cap'] >= 3: s['pha'] = 'cho3'; s['cho'] = 0
            return '', 'ở đe rèn'
        if s['pha'] == 'cho3':
            s['cho'] += 1
            if s['cho'] < 100: return '', 'Đánh thường mạnh hơn · Mở Dư Âm'
            k, _ = toi_x(st, st['nom'] - 100)
            if k: return k, 'tới hình nộm F (chỗ an toàn)'
            if st['face'] < 0: return 'r', 'quay về hình nộm'
            s['pha'] = 'giu'; s['giu'] = 0; return '', ''
        if s['pha'] == 'giu':
            s['giu'] += 1
            if s['giu'] <= 26: return 'a', 'tập: GIỮ Chém ' + str(s['giu']) + ' tick'
            s['pha'] = 'sau'; s['cho'] = 0; return '', 'thả → DƯ ÂM vào hình nộm'
        if s['pha'] == 'sau':
            s['cho'] += 1
            if s['cho'] < 80: return '', 'Dư Âm: chém vang + vết vang'
            s['pha'] = 'raE'; return '', ''
        if s['pha'] == 'raE':
            if st['room'] != 'Đấu trường tinh anh' or st['x'] > st['de'] - 300: return 'l', 'quay lại sân E'
            s['pha'] = 'cg'; return '', ''
        if s['pha'] == 'cg':
            song = [c for c in st['cg'] if c['on']]
            if not song:
                s['cho'] += 1
                if s['cho'] > 90: s['xong'] = 1
                return '', 'sau rèn: hạ 2 Chuông Gỗ'
            c = min(song, key=lambda c: abs(c['x'] - st['x'])); dx = c['x'] - st['x']; adx = abs(dx); toi = huong(dx); lui = huong(-dx)
            if s['giuDA'] > 0:   # đang giữ Chém cho Dư Âm (trong lúc Chuông Gỗ hồi đòn)
                s['giuDA'] += 1
                if s['giuDA'] <= 25: return 'a', 'nó đang hồi → GIỮ Chém ' + str(s['giuDA'])
                s['giuDA'] = 0; s['sauDA'] = fr; return '', 'thả → DƯ ÂM trong khoảng hồi'
            if c['st'] == 'wind':
                return (lui, 'thấy lóe (báo đập) → lùi né') if adx < 150 else ('', 'chờ nó đập hụt')
            if c['st'] == 'strike' and c['t'] <= 10:
                return (lui, 'né đập') if adx < 140 else ('', 'né – đập hụt')
            co_da = st['duam'] and st['knHoi'] <= 0 and c['st'] in ('strike', 'rec')
            if co_da:
                if adx > 106: return toi, 'nó đang hồi → áp sát'
                if (dx > 0) != (st['face'] > 0): return toi, 'quay mặt'
                s['giuDA'] = 1; return 'a', 'nó đang hồi → GIỮ Chém 1'
            if adx > 112: return toi, 'áp sát Chuông Gỗ'
            if adx < 76: return lui, 'giãn cách'
            if (dx > 0) != (st['face'] > 0): return toi, 'quay mặt'
            if fr - s['lastA'] >= 16 and fr - s.get('sauDA', -99) > 30: s['lastA'] = fr; return 'a', 'đánh thường (Dư Âm đang hồi ' + str(st['knHoi']) + ')' if st['knHoi'] > 0 else 'đánh thường'
            return '', 'chờ thời điểm'
        return '', ''
    return f, s


async def luong(b, cong):
    sach = await Trang(b, cong, '').mo(); dbg = await Trang(b, cong, '&hitbox=1&debug=p0c').mo()
    f, so = bot_luong()
    vs = [ffmpeg(os.path.join(OUT, '1-sach-luong-nguoi-choi-khong-bat-tu.mp4')), ffmpeg(os.path.join(OUT, '2-debug-luong-nguoi-choi-khong-bat-tu.mp4'))] if VIDEO else []
    lech = 0; nhanCu = ''; moc = []; n = 0; hp_cu = 5; chet = []
    while not so['xong'] and n < 7200:
        st = await sach.js('TVP0C.tt()'); st2 = await dbg.js('TVP0C.tt()')
        if (st['f'], st['x'], st['ta']['hp'], st['ta']['ta'], st['hp']) != (st2['f'], st2['x'], st2['ta']['hp'], st2['ta']['ta'], st2['hp']): lech += 1
        if st['hp'] <= 0 and hp_cu > 0: chet.append(st['f'])
        hp_cu = st['hp']
        phim, chu = f(st)
        if chu and chu != nhanCu: moc.append([st['f'], chu]); nhanCu = chu
        if phim == 'F':
            for t in (sach, dbg): await t.pg.keyboard.press('f')
            phim = ''
        for t in (sach, dbg): await t.buoc(phim)
        n += 1
        if VIDEO:
            for i, t in enumerate((sach, dbg)):
                im = nhan((await t.anh()).convert('RGB'), 'P0-C · bot · KHÔNG bất tử · máu ' + str(max(0, st['hp'])) + ' · ' + chu + ('' if i == 0 else '  [debug]'))
                bb = io.BytesIO(); im.save(bb, 'JPEG', quality=88); vs[i].stdin.write(bb.getvalue())
    for v in vs: v.stdin.close(); v.wait()
    kq = {'buoc': n, 'lech_sach_debug': lech, 'lam_nga_o_frame': chet, 'tom_tat': await sach.js('TVP0C.tomTat()'), 'tom_tat_debug': await dbg.js('TVP0C.tomTat()'),
          'trang_thai_cuoi': await sach.js('TVP0C.tt()'), 'moc_bot': moc, 'loi_trang': {'sach': sach.loi, 'debug': dbg.loi},
          'p0_log_tinh_anh': await sach.js('TVP0.P0.LOG.map(r=>r.s).filter(s=>s.includes("Chuông Gỗ#7")).slice(0,40)'),
          'p0_log_cuoi': await sach.js('TVP0.P0.LOG.slice(-40).map(r=>r.s)')}
    open(os.path.join(OUT, 'log-luong-nguoi-choi-sach.txt'), 'w', encoding='utf-8').write('\n'.join(await sach.js('TVP0C.log()')) + '\n')
    open(os.path.join(OUT, 'log-luong-nguoi-choi-debug.txt'), 'w', encoding='utf-8').write('\n'.join(await dbg.js('TVP0C.log()')) + '\n')
    await sach.pg.close(); await dbg.pg.close()
    print('luong', json.dumps({k: kq[k] for k in ('buoc', 'lech_sach_debug', 'lam_nga_o_frame', 'tom_tat', 'loi_trang')}, ensure_ascii=False))
    return kq


# ---------------- 2. DEBUG TRẠNG THÁI: mỗi ca = lệnh dựng (JS) + các đoạn bước (số tick, phím hoặc hàm, nhãn) + lệnh đọc kết quả ----------------
DI = lambda x, tol=6: (lambda st: (huong(x - st['x']) if abs(x - st['x']) > tol else ''))   # đi tới toạ độ x
J_GIET_TA = "(()=>{ killQuai(TA, 1); return TA.ta; })()"
J_GIET_LAM = "(()=>{ pl.iframes = 0; pl.hp = 1; hurt(1); return pl.dead; })()"
J_KQ = "(()=>{ const t = TVP0C.tt(); return {f: t.f, taPos: t.ta.x, taHome: TA.sx + TA.w / 2, khongDanh: TA.khongDanh(), x: t.x, room: t.room, hp: t.hp, moc: t.moc, an: t.an, cap: t.cap, renLan: t.renLan, coTheRen: t.coTheRen, ta: {ta: t.ta.ta, hp: t.ta.hp, the: t.ta.the}, " \
       "nutRen: !document.getElementById('btn-ren').hidden, tk: (({roiE, veCho, hoiDayVe, xuyen, xuyenGiu, lamChet, mocE, renLap, ren, anNhat}) => ({roiE, veCho, hoiDayVe, xuyen, xuyenGiu, lamChet, mocE, renLap, ren, anNhat}))(TVP0C.P0C.TK)}; })()"
X = lambda c, room='PE': "(%s.x0 + %s) * T" % (room, c)

def tao_ca(G):
    """G: toạ độ đọc từ trang (PE/PF/PD = mép trái phòng, DE = tâm đe)."""
    PE, PF, PD, DE = G['PE'], G['PF'], G['PD'], G['DE']
    nho = {}
    def luot_som(st):
        if st['ta']['ta'] == 'huc' and abs(st['ta']['x'] - st['x']) - 78 <= 72 and not nho.get('da'): nho['da'] = 1; return 'rs'
        return 'r' if st['xu'] else ''
    def nhat(st): return huong(st['an']['x'] - st['x']) if st['an']['on'] and abs(st['an']['x'] - st['x']) > 4 else ''
    return [
    ('CA 3a · lướt SỚM ~3 tick (khe ≈ 70 px) vào húc đối đầu → bản trước TRÚNG; giờ giữ miễn tới khi ra khỏi thân', [
        ('js', "(()=>{ newGame(); TA.x = TA.px = %s; TA.ta = TA.st = 'hucBao'; TA.t = 0; TA.hucDir = -1; TA.face = -1; TA.cdHuc = TA.cdDap = 9999; TVP0.datLam(TA.x + TA.w / 2 - 170, 1); return 1; })()" % X(16)),
        ('buoc', 100, luot_som, 'chờ húc; lướt khi khe ≈ 70 px'),
        ('kq', 'luot_som')]),
    ('CA 3b · lướt QUÁ SỚM (ngay khi nó vừa lao, khe ≈ 250 px) → hết lướt + hết miễn trước khi chạm → vẫn trúng (đúng luật)', [
        ('js', "(()=>{ newGame(); TA.x = TA.px = %s; TA.ta = TA.st = 'hucBao'; TA.t = 0; TA.hucDir = -1; TA.face = -1; TA.cdHuc = TA.cdDap = 9999; TVP0.datLam(TA.x + TA.w / 2 - 330, 1); return 1; })()" % X(16)),
        ('buoc', 90, lambda st: ('rs' if st['ta']['ta'] == 'huc' and st['ta']['t'] == 1 else ''), 'lướt ngay khi nó vừa lao'),
        ('kq', 'luot_qua_som')]),
    ('CA 4 · RỜI E khi tinh anh đang đánh → ngừng đánh, không truy vào F, về chỗ, hồi đầy · vết Dư Âm vang lúc Lam đã ở F không trừ máu', [
        ('js', "(()=>{ newGame(); AD.datCap(3, 'DEBUG ca 4'); TVP0.datLam(%d, -1); const c = pl.x + pl.w / 2 - 96; TA.x = TA.px = c - TA.w / 2; TA.ta = TA.st = 'di'; TA.t = 0; TA.face = 1; TA.cdDap = TA.cdHuc = 160; TA.hp = TA.hp0 = 120; return TA.x; })()" % (PE + 26 * 32)),
        ('buoc', 27, 'a', 'GIỮ Chém → Dư Âm (vết đặt trong E)'),
        ('buoc', 8, '', 'thả → chém vang trúng · vết sẽ vang sau 24 tick'),
        ('kq', 'sau_chem_vang'),
        ('buoc', 1, 'rs', 'lướt sang phải'),
        ('buoc', 40, DI(PF + 60), 'rời E sang F (vết vang khi Lam đã ở F)'),
        ('kq', 'vet_vang_khi_o_F'),
        ('buoc', 24, lambda st: 'l' if st['face'] > 0 else 'a', 'đứng trong F chém về phía E'),
        ('buoc', 170, '', 'tinh anh về chỗ (cột 19) → hồi đầy → ngủ gác'),
        ('kq', 'roi_E'),
        ('buoc', 70, DI(PF - 190), 'vào lại E → tinh anh thức lại, đầy máu'),
        ('kq', 'vao_lai_E')]),
    ('CA 6 · mốc hồi sinh gần E: đang lưu ở chuông A, đi D → E (đặt mốc đầu E) → ngã → hồi sinh ĐẦU E, không phải qua A–D', [
        ('js', "(()=>{ newGame(); for (const b of BELLS) b.on = false; BELLS[3].on = true; S.cp = BELLS[3]; TVP0.datLam(%d, 1); for (const b of BO.DS) b.gone = true; return S.cp === BELLS[3]; })()" % (PD + 24 * 32)),
        ('buoc', 80, 'r', 'từ D (chuông lưu đang ở A) đi sang E'),
        ('js', J_GIET_LAM),
        ('buoc', 150, '', 'Lam ngã → hồi sinh'),
        ('kq', 'moc_E')]),
    ('CA 5a · tinh anh chết → Lam ngã TRƯỚC khi nhặt Ấn → hồi sinh, Ấn vẫn trên đất, nhặt được', [
        ('js', "(()=>{ newGame(); TVP0.datLam(%d, 1); return 1; })()" % (PE + 14 * 32)),
        ('buoc', 30, '', ''),
        ('js', J_GIET_TA),
        ('buoc', 50, '', 'tinh anh hạ (DEBUG) → Ấn rơi'),
        ('js', J_GIET_LAM),
        ('buoc', 150, '', 'Lam ngã trước khi nhặt → hồi sinh mốc E'),
        ('kq', 'chet_truoc_nhat'),
        ('buoc', 200, nhat, 'đi lại nhặt Ấn'),
        ('kq', 'nhat_lai')]),
    ('CA 5b · đã nhặt Ấn rồi ngã → không mất quyền rèn', [
        ('js', J_GIET_LAM),
        ('buoc', 150, '', 'ngã khi đang giữ Ấn → hồi sinh'),
        ('kq', 'chet_sau_nhat')]),
    ('CA 5c · đứng cạnh đe có Ấn 150 tick → KHÔNG tự rèn (phải bấm Rèn)', [
        ('buoc', 330, DI(DE - 60), 'đi sang F, tới đe'),
        ('buoc', 150, '', 'đứng cạnh đe, không bấm'),
        ('kq', 'dung_gan_de'),
        ('phim', 'f'),
        ('buoc', 100, '', 'bấm Rèn (F) → cấp 3'),
        ('kq', 'da_ren')]),
    ('CA 5d · đã rèn → ra xa rồi quay lại đe, bấm Rèn 2 lần nữa → không rèn lặp, không thưởng thêm', [
        ('buoc', 60, DI(DE - 260), 'ra xa đe'),
        ('buoc', 60, DI(DE - 60), 'quay lại đe'),
        ('phim', 'f'), ('buoc', 20, '', 'bấm Rèn lần 2'), ('phim', 'f'), ('buoc', 40, '', 'bấm Rèn lần 3'),
        ('kq', 'ren_lap')]),
    ('CA 5e · rời phòng khi Ấn còn trên đất: sang F rồi quay lại E → Ấn vẫn còn', [
        ('js', "(()=>{ newGame(); TVP0.datLam(%d, 1); return 1; })()" % (PE + 23 * 32)),
        ('buoc', 20, '', ''),
        ('js', J_GIET_TA),
        ('buoc', 40, '', 'tinh anh hạ (DEBUG) → Ấn rơi'),
        ('buoc', 110, DI(PF + 90), 'sang F, không nhặt'),
        ('buoc', 120, DI(PF - 120), 'quay lại E'),
        ('kq', 'roi_sang_F_quay_lai'),
        ('buoc', 120, nhat, 'nhặt Ấn'),
        ('kq', 'nhat_sau_F')]),
    ('CA 5e′ · rời phòng khi Ấn còn trên đất: sang D rồi quay lại E → Ấn vẫn còn', [
        ('js', "(()=>{ newGame(); for (const b of BO.DS) b.gone = true; TVP0.datLam(%d, -1); return 1; })()" % (PE + 15 * 32)),
        ('buoc', 20, '', ''),
        ('js', J_GIET_TA),
        ('buoc', 40, '', 'tinh anh hạ (DEBUG) → Ấn rơi'),
        ('buoc', 180, DI(PD + 26 * 32), 'sang D, không nhặt'),
        ('buoc', 150, DI(PE + 8 * 32), 'quay lại E'),
        ('kq', 'roi_sang_D_quay_lai'),
        ('buoc', 120, nhat, 'nhặt Ấn'),
        ('kq', 'nhat_sau_D')]),
    ]


async def trang_thai(b, cong):
    t = await Trang(b, cong, '&hitbox=1&debug=p0c').mo()
    G = await t.js("({PE: PE.x0 * T, PF: PF.x0 * T, PD: PD.x0 * T, DE: DE.x})")
    v = ffmpeg(os.path.join(OUT, '3-debug-trang-thai-luot-roi-E-hoi-sinh-an-de.mp4')) if VIDEO else None
    KQ = {}; n = 0; LOG = []; da = [0]
    async def dong_bo():
        L = await t.js('TVP0C.log()')
        if len(L) < da[0]: da[0] = 0
        LOG.extend(L[da[0]:]); da[0] = len(L)
    for ten, buoc in tao_ca(G):
        await t.js('TVP0C.P0C.ghi(%s, "ca")' % json.dumps('==== ' + ten))
        ma = ten.split(' · ')[0]
        for b_ in buoc:
            if b_[0] == 'js':
                if 'newGame()' in b_[1]: await dong_bo(); da[0] = 0
                await t.js(b_[1]); continue
            if b_[0] == 'phim':
                await t.pg.keyboard.press(b_[1]); continue
            if b_[0] == 'kq':
                KQ[b_[1]] = await t.js(J_KQ); continue
            _, so, phim, chu = b_
            for i in range(so):
                st = await t.js('TVP0C.tt()')
                k = phim(st) if callable(phim) else phim
                await t.buoc(k); n += 1
                if VIDEO:
                    im = nhan((await t.anh()).convert('RGB'), 'DEBUG · ' + (chu or ' '), ten)
                    bb = io.BytesIO(); im.save(bb, 'JPEG', quality=88); v.stdin.write(bb.getvalue())
    if v: v.stdin.close(); v.wait()
    await dong_bo()
    open(os.path.join(OUT, 'log-debug-trang-thai.txt'), 'w', encoding='utf-8').write('\n'.join(LOG) + '\n')
    KQ['_loi_trang'] = t.loi; KQ['_buoc'] = n
    await t.pg.close()
    print('trang_thai', json.dumps(KQ, ensure_ascii=False)[:3000])
    return KQ


async def do(b, cong):
    t = await Trang(b, cong, '').mo()
    kq = await t.js(open(os.path.join(HERE, 'do-luot-day.js'), encoding='utf-8').read())
    await t.pg.close()
    json.dump(kq, open(os.path.join(OUT, 'do-luot-day.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    return kq


async def choang120(b, cong):
    t = await Trang(b, cong, '&choang=120').mo()
    f, so = bot_luong(choang_only=True); n = 0
    while not so['xong'] and n < 4000:
        st = await t.js('TVP0C.tt()'); k, _ = f(st)
        await t.pg.evaluate('p=>{TVP0.datPhim(p); savePrev(); step();}', k); n += 1
    kq = {'buoc': n, 'tom_tat': await t.js('TVP0C.tomTat()'), 'log_the': [s for s in await t.js('TVP0C.log()') if 'VỠ THẾ' in s or 'VÁN MỚI' in s or 'HẠ' in s]}
    await t.pg.close()
    return kq


async def main():
    srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Im, directory=GOC)); cong = srv.server_address[1]
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    KQ = {}
    chi = [a for a in sys.argv[1:] if not a.startswith('--')]
    async with async_playwright() as p:
        b = await p.chromium.launch()
        if not chi or 'do' in chi: KQ['do_luot_day'] = 'xem do-luot-day.json'; await do(b, cong)
        if not chi or 'choang' in chi: KQ['choang120'] = await choang120(b, cong)
        if not chi or 'trang' in chi: KQ['trang_thai'] = await trang_thai(b, cong)
        if not chi or 'luong' in chi: KQ['luong_nguoi_choi'] = await luong(b, cong)
        await b.close()
    dst = os.path.join(OUT, 'ket-qua.json')
    cu = json.load(open(dst, encoding='utf-8')) if chi and os.path.exists(dst) else {}
    cu.update(KQ); json.dump(cu, open(dst, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

asyncio.run(main())
