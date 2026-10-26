#!/usr/bin/env python3
"""Kiểm thử clip chạy Lam mới (rig-v3) TRONG MÀN CHƠI THẬT (game/demo.html) bằng Chromium headless + input giả lập.
Chạy từng bước logic bằng tay (savePrev → step → render(1)) nên kết quả xác định, mỗi bước = 1 khung video 60 fps.
Ghi log từng bước (x, dx thực, vx, pha, khung, trạng thái, bóng) → so-do.json; chụp màn 960×540 → video + GIF.
Cần: playwright (Python) + Chromium, ffmpeg. Phục vụ trang qua http (đường dẫn tương đối ../art/... như trên githack).
Chạy: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 game/tools/kiem-thu-chay-lam.py [--khong-quay]
Từ 26/10/2026 (rig-v4) demo.html mặc định là clip rig-v4 → công cụ này mở demo.html?clip=v3 để vẫn đo đúng clip rig-v3."""
import asyncio, json, os, sys, subprocess, shutil, threading, functools, http.server, io
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.dirname(HERE)
ROOT = os.path.dirname(GAME)
OUT = os.path.join(GAME, 'kiem-thu-chay-lam')
TMP = os.path.join(OUT, '_khung')
QUAY = '--khong-quay' not in sys.argv
PORT = 8799

# Kịch bản: (bước bắt đầu, bước kết thúc, phím giữ, nhãn). Bước tính từ lúc bấm "Bắt đầu" (rút dao khoá ~52 bước đầu).
KICH = [
    (0, 56, '', '0. Vào ải: rút dao (dáng nghỉ TẠM)'),
    (56, 120, 'l', '1. Chạy TRÁI → va tường trái (giữ phím)'),
    (120, 150, '', '2. Dừng (đứng yên)'),
    (150, 174, 'r', '3. Chạy PHẢI, nhả / giữ phím: tăng – giảm tốc'),
    (174, 182, '', '3. Chạy PHẢI, nhả / giữ phím: tăng – giảm tốc'),
    (182, 189, 'r', '3. Chạy PHẢI, nhả / giữ phím: tăng – giảm tốc'),
    (189, 193, '', '3. Chạy PHẢI, nhả / giữ phím: tăng – giảm tốc'),
    (193, 200, 'r', '3. Chạy PHẢI, nhả / giữ phím: tăng – giảm tốc'),
    (200, 204, '', '3. Chạy PHẢI, nhả / giữ phím: tăng – giảm tốc'),
    (204, 270, 'r', '4. Chạy phải → va bậc đá (tường phải, giữ phím)'),
    (270, 290, 'rj', '5. Nhảy lên bậc + tiếp đất, chạy tiếp'),
    (290, 304, 'r', '5. Nhảy lên bậc + tiếp đất, chạy tiếp'),
    (304, 324, 'rj', '5. Nhảy lên bậc + tiếp đất, chạy tiếp'),
    (324, 352, 'r', '5. Nhảy lên bậc + tiếp đất, chạy tiếp'),
    (352, 362, 'l', '6. Quay đầu trái khi đang chạy'),
    (362, 396, 'l', '6. Quay đầu trái khi đang chạy'),
    (396, 420, '', '7. Dừng'),
    (420, 421, 'v', '8. Tiếng Vọng: bấm Vọng → ghi'),
    (421, 450, 'r', '8. Tiếng Vọng: ghi (chạy, nhảy, va bậc)'),
    (450, 466, 'rj', '8. Tiếng Vọng: ghi (chạy, nhảy, va bậc)'),
    (466, 500, 'r', '8. Tiếng Vọng: ghi (chạy, nhảy, va bậc)'),
    (500, 524, 'l', '8. Tiếng Vọng: ghi (chạy, nhảy, va bậc)'),
    (524, 525, 'v', '9. Dừng ghi → bóng phát lại'),
    (525, 560, 'l', '9. Bóng phát lại đúng khung đã ghi (Lam chạy trái)'),
    (560, 700, '', '9. Bóng phát lại đúng khung đã ghi'),
]
N = KICH[-1][1]


def kich(n):
    for a, b, k, nh in KICH:
        if a <= n < b:
            return k, nh
    return '', ''


JS_STEP = """([keys,cap,shot])=>{
  for(const k of KEYS) kb[k]=0; for(const c of keys) kb[c]=1;
  const ph0=pl.pha, recN=rec?rec.n:-1, ei=echo?echo.i:-1;
  savePrev(); step();
  const e=echo&&!echo.done?{i:echo.i-1,k2:echo.cur.k2,a2:echo.cur.a2,p2:echo.cur.p2,l2:echo.cur.l2}:null;
  window.__VE=[]; render(1);
  if(cap!==null){ let d=document.getElementById('__cap'); if(!d){ d=document.createElement('div'); d.id='__cap';
      d.style.cssText='position:fixed;left:8px;top:62px;z-index:99;font:600 13px/1.35 ui-monospace,Menlo,monospace;color:#fff;background:rgba(0,0,0,.62);padding:5px 8px;border-radius:6px;white-space:pre;pointer-events:none';
      document.body.appendChild(d); }
    d.textContent=cap+'\\nLam: '+pl.a2+'  khung '+(pl.k2<0?'nghỉ(TẠM)':(pl.k2+'/32'+(pl.a2==='run'?'':' TẠM')))+'  pha '+pl.pha.toFixed(3)+'  dx '+pl.dxT.toFixed(2)+(e?'\\nBóng: khung '+(e.k2<0?'nghỉ':e.k2)+' (bản ghi #'+e.i+')':''); }
  return {x:pl.x,y:pl.y,dx:pl.dxT,vx:pl.vx,pha0:ph0,pha:pl.pha,k2:pl.k2,a2:pl.a2,l2:pl.l2,g:pl.onGround,face:pl.face,
    recN:rec?rec.n:-1,recK:(rec&&rec.n>0)?REC[rec.n-1].k2:null,recP:(rec&&rec.n>0)?REC[rec.n-1].p2:null,echo:e,ve:window.__VE,
    cam:S.camx, ox:ox, oy:oy, hit:S.hitstop};
}"""

# ghi lại MỌI lần vẽ Lam (bo = LAM hay LAM.E, khung) để đối chiếu bóng vẽ đúng khung đã ghi
JS_HOOK = """()=>{ const g=drawLam; window.drawLam=function(bo,s,x,y){ if(window.__VE) __VE.push({bong:bo!==LAM, k2:s.k2, l2:s.l2, cur:(echo&&s===echo.cur)}); return g(bo,s,x,y); };
  window.loop=function(){};   // dừng vòng rAF: chạy tay từng bước logic
}"""


def phuc_vu():
    h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
    class Q(h.func):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', PORT), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


async def mo(b, url, route_sai=False):
    pg = await b.new_page(viewport={'width': 960, 'height': 540}, device_scale_factor=1)
    loi = []
    pg.on('pageerror', lambda e: loi.append(str(e)))
    await pg.route('https://fonts.googleapis.com/**', lambda r: r.abort())
    await pg.route('https://fonts.gstatic.com/**', lambda r: r.abort())
    if route_sai:   # thay PNG bằng bản bị thu 2048×927 → game phải báo lỗi rõ
        from PIL import Image
        im = Image.open(os.path.join(ROOT, 'art/modular/lam-moi/rig-v3/sprite/lam-chay-2x.png')).resize((2048, 927))
        bb = io.BytesIO(); im.save(bb, 'PNG'); data = bb.getvalue()
        await pg.route('**/lam-chay-2x.png', lambda r: r.fulfill(body=data, content_type='image/png'))
    await pg.goto(url)
    await pg.wait_for_function('window.TVDEMO', timeout=30000)
    return pg, loi


async def main():
    os.makedirs(OUT, exist_ok=True)
    if os.path.isdir(TMP): shutil.rmtree(TMP)
    os.makedirs(TMP)
    srv = phuc_vu()
    kq = {}
    async with async_playwright() as p:
        b = await p.chromium.launch()
        # (0) kiểm assert cỡ ảnh
        pg, _ = await mo(b, f'http://127.0.0.1:{PORT}/game/demo.html?clip=v3', route_sai=True)
        kq['assert_co_anh_sai'] = await pg.evaluate('window.TVDEMO')
        kq['assert_co_anh_sai']['thong_bao'] = await pg.evaluate("document.getElementById('load-err').innerText")
        await pg.close()
        # (1) màn chơi thật
        pg, loi = await mo(b, f'http://127.0.0.1:{PORT}/game/demo.html?clip=v3')
        kq['nap'] = await pg.evaluate('window.TVDEMO.lam')
        await pg.evaluate(JS_HOOK)
        await pg.click('#btn-start')
        await pg.evaluate("()=>{ document.getElementById('warn').hidden=true; }")
        log = []
        for n in range(N):
            k, nh = kich(n)
            r = await pg.evaluate(JS_STEP, [k, nh, QUAY])
            r['n'] = n; r['keys'] = k; r['canh'] = nh
            log.append(r)
            if QUAY:
                await pg.screenshot(path=os.path.join(TMP, '%05d.png' % n))
        kq['loi_trang'] = loi
        await b.close()
    srv.shutdown()
    print('xong', len(log), 'bước; lỗi trang:', loi)
    do(kq, log)
    if QUAY:
        video(log)
        shutil.rmtree(TMP)


def do(kq, log):
    """Số đo từ log từng bước."""
    Q = kq['nap']['quang']
    # (a) pha: chỉ đổi khi chạy trên đất, đúng bằng |dx thực|/83,66 (mod 1); không bao giờ nhảy/reset
    lech_max, nhay = 0.0, []
    for r in log:
        d = (r['pha'] - r['pha0']) % 1.0
        ky = (abs(r['dx']) / Q) % 1.0 if r['a2'] == 'run' else 0.0
        e = min(abs(d - ky), 1 - abs(d - ky))
        lech_max = max(lech_max, e)
        if e > 1e-9: nhay.append(r['n'])
        if r['a2'] == 'run' and r['k2'] != int(r['pha'] * 32): nhay.append(r['n'])
    # (b) quanh các lần đổi tốc độ (|Δvx| > 0,01 khi đang chạy): bước nhảy khung lớn nhất (theo vòng 32)
    doi, kmax = 0, 0
    for a, b in zip(log, log[1:]):
        if a['a2'] == 'run' and b['a2'] == 'run':
            dk = (b['k2'] - a['k2']) % 32
            kmax = max(kmax, dk)
            if abs(b['vx'] - a['vx']) > 0.01: doi += 1
    # (c) va tường: giữ phím về phía tường mà dx = 0 trên đất
    vt = [r for r in log if r['g'] and r['keys'] in ('l', 'r') and abs(r['dx']) < 1e-9 and r['hit'] == 0 and r['canh'][:2] in ('1.', '4.', '6.')]
    vt_pha = sorted(set(round(r['pha'], 9) for r in vt))
    doan, cur = [], None
    for r in vt:
        if cur and r['n'] == cur['het'] + 1 and abs(r['pha'] - cur['pha']) < 1e-12: cur['het'] = r['n']; cur['khung'].add(r['k2'])
        else:
            cur = {'tu': r['n'], 'het': r['n'], 'pha': r['pha'], 'khung': {r['k2']}}; doan.append(cur)
    doan = [{'buoc': [c['tu'], c['het']], 'pha_dung_yen': round(c['pha'], 4), 'khung_ve': sorted(c['khung']),
             'canh': next(r['canh'] for r in log if r['n'] == c['tu'])} for c in doan]
    # (d) chu kỳ ở tốc độ tối đa: các bước chạy với |dx| = 4,4
    full = [r for r in log if r['a2'] == 'run' and abs(abs(r['dx']) - 4.4) < 1e-6]
    buoc_moi_chu_ky = Q / 4.4
    vong = 0
    for a, b in zip(log, log[1:]):
        if b['a2'] == 'run' and b['pha'] < a['pha']: vong += 1
    # (e) Tiếng Vọng: khung bóng phát lại == khung Lam đã ghi ở cùng chỉ số bản ghi; và lần VẼ bóng dùng đúng khung đó
    ghi = {}
    for r in log:
        if r['recN'] > 0: ghi[r['recN'] - 1] = (r['k2'], r['pha'], r['l2'], r['recK'], r['recP'])
    phat, sai, sai_ve = 0, [], []
    for r in log:
        e = r['echo']
        if not e: continue
        phat += 1
        g = ghi.get(e['i'])
        if g is None or g[0] != e['k2'] or g[2] != e['l2'] or abs(g[1] - e['p2']) > 1e-12: sai.append(r['n'])
        ve = [v for v in r['ve'] if v['bong'] and v['cur']]
        if not ve or any(v['k2'] != e['k2'] for v in ve): sai_ve.append(r['n'])
    ghi_ok = all(g[0] == g[3] and abs(g[1] - g[4]) < 1e-12 for g in ghi.values())
    so = {
        'nap_sheet': kq['nap'],
        'assert_co_anh_sai_2048x927': {'game_bao_loi': not kq['assert_co_anh_sai']['ready'], 'thong_bao': kq['assert_co_anh_sai']['thong_bao']},
        'loi_trang': kq['loi_trang'],
        'so_buoc_logic': len(log),
        'pha': {'lech_lon_nhat_so_voi_|dx|/83.66': lech_max, 'so_buoc_pha_nhay_hoac_reset': len(nhay), 'buoc_loi': nhay[:20],
                'so_lan_doi_toc_do_khi_dang_chay': doi, 'khung_nhay_lon_nhat_giua_2_buoc_chay': kmax,
                'ghi_chu': 'ở 4,4 px/bước mỗi bước tiến 4,4/83,66×32 = 1,68 khung → bước nhảy khung 1 hoặc 2 là đúng; không có bước nhảy lớn hơn khi đổi tốc độ'},
        'va_tuong': {'so_buoc_giu_phim_vao_tuong_dx_0': len(vt), 'gia_tri_pha_khac_nhau_trong_cac_buoc_do': len(vt_pha), 'doan': doan},
        'chu_ky': {'buoc_logic_moi_chu_ky_o_4.4': round(buoc_moi_chu_ky, 3), 'giay': round(buoc_moi_chu_ky / 60, 4),
                   'buoc_chan_moi_giay': round(2 * 60 / buoc_moi_chu_ky, 2), 'so_buoc_chay_toc_do_toi_da': len(full),
                   'so_vong_pha_quan_sat': vong},
        'tieng_vong': {'so_buoc_da_ghi': len(ghi), 'ban_ghi_khop_khung_va_pha_cua_Lam': ghi_ok, 'so_buoc_bong_phat': phat,
                       'buoc_bong_sai_khung_ghi': sai, 'buoc_bong_VE_sai_khung': sai_ve},
    }
    json.dump(so, open(os.path.join(OUT, 'so-do.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    # log gọn dạng CSV
    with open(os.path.join(OUT, 'log-tung-buoc.csv'), 'w', encoding='utf-8') as f:
        f.write('buoc,phim,canh,x,y,dx_thuc,vx,tren_dat,trang_thai,khung,lat,pha_truoc,pha_sau,ban_ghi_n,bong_ban_ghi,bong_khung\n')
        for r in log:
            e = r['echo'] or {}
            f.write('%d,%s,"%s",%.3f,%.3f,%.4f,%.4f,%d,%s,%d,%d,%.6f,%.6f,%d,%s,%s\n' % (r['n'], r['keys'], r['canh'], r['x'], r['y'], r['dx'], r['vx'],
                    r['g'], r['a2'], r['k2'], r['l2'], r['pha0'], r['pha'], r['recN'], e.get('i', ''), e.get('k2', '')))
    print(json.dumps(so, ensure_ascii=False, indent=1))


def video(log):
    from PIL import Image
    fps = 60
    mp4 = os.path.join(OUT, 'kiem-thu-chay-lam-60fps.mp4')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(fps), '-i', os.path.join(TMP, '%05d.png'),
                    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'slow', mp4], check=True)
    # GIF từng tình huống (bản xem nhanh; video mp4 60 fps mới là bản đủ khung): 960×540 (giữ khung 16:9 của game),
    # lấy 1/2 khung = 30 fps, thời lượng 30-30-40 ms (trung bình đúng 33,3 ms → đúng tốc độ thật); cảnh camera cuộn nhiều
    # lấy 1/3 khung = 20 fps (50 ms) cho nhẹ. Bảng màu dùng chung 160 màu.
    def gif(ten, a, b, cham=1, zoom=False, buoc=2):
        ims = []
        for n in range(a, b):
            if cham == 1 and (n - a) % buoc: continue
            im = Image.open(os.path.join(TMP, '%05d.png' % n)).convert('RGB')
            if zoom:   # phóng ×2 quanh Lam, vẫn khung 16:9 (480×270 → 960×540), lọc LANCZOS
                r = log[n]; cx = r['x'] + 10 - r['ox']; cy = r['y'] + 30 - r['oy'] - 40
                x0 = int(min(max(cx - 240, 0), 480)); y0 = int(min(max(cy - 135, 0), 270))
                im = im.crop((x0, y0, x0 + 480, y0 + 270)).resize((960, 540), Image.LANCZOS)
            ims.append(im)
        ms = ([(30, 30, 40)[i % 3] for i in range(len(ims))] if buoc == 2 else 50) if cham == 1 else int(round(1000 / 60 * cham / 10)) * 10
        pal = ims[len(ims) // 2].quantize(colors=160, method=Image.MEDIANCUT)
        q = [i.quantize(palette=pal, dither=Image.Dither.NONE) for i in ims]
        p = os.path.join(OUT, ten)
        q[0].save(p, save_all=True, append_images=q[1:], duration=ms, loop=0, optimize=True)
        print(ten, len(q), 'khung', os.path.getsize(p) // 1024, 'KB')
    gif('1-chay-trai-va-tuong.gif', 52, 126)
    gif('2-chay-phai-tang-giam-toc-va-bac.gif', 148, 236)
    gif('3-nhay-tiep-dat-quay-dau.gif', 268, 372, buoc=3)
    gif('4-tieng-vong.gif', 418, 632, buoc=3)
    gif('5-chay-tang-giam-toc-cham-x4-phong-x2.gif', 150, 210, cham=4, zoom=True)


asyncio.run(main())
