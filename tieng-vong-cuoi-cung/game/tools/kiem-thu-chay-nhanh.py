#!/usr/bin/env python3
"""So sánh clip chạy CŨ (rig-v3, demo.html?clip=v3) và clip CHẠY NHANH mới (rig-v4, demo.html mặc định) TRONG CÙNG MÀN CHƠI
THẬT, cùng tốc độ 264 px logic/s, cùng chuỗi phím. Chromium headless, chạy tay từng bước logic (savePrev → step → render(1))
nên kết quả xác định; mỗi bước = 1 khung video 60 fps. Hai lượt chạy có vật lý giống hệt (gameplay không đổi), chỉ khác hình.
Xuất vào game/kiem-thu-chay-nhanh/: video 60 fps từng clip + video ghép cạnh nhau v3 | v4, GIF 112 px (cắt quanh Lam 1:1,
không phóng), số đo so-do.json + log CSV từng bước.
Cần: playwright (Python) + Chromium, ffmpeg; python3 + numpy/pillow/scipy (đọc rig để đo trượt chân, tools/diem-cham-clip.py).
Chạy: python3 -B game/tools/kiem-thu-chay-nhanh.py [--khong-quay]"""
import asyncio, json, os, sys, subprocess, shutil, threading, functools, http.server
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.dirname(HERE)
ROOT = os.path.dirname(GAME)
OUT = os.path.join(GAME, 'kiem-thu-chay-nhanh')
TMP = os.path.join(OUT, '_khung')
QUAY = '--khong-quay' not in sys.argv
PORT = 8798
CLIPS = {'v3': {'url': 'game/demo.html?clip=v3', 'rig': 'art/modular/lam-moi/rig-v3', 'ten': 'clip CŨ rig-v3 (83,66 px/chu kỳ)'},
         'v4': {'url': 'game/demo.html', 'rig': 'art/modular/lam-moi/rig-v4', 'ten': 'clip MỚI rig-v4 (132 px/chu kỳ)'}}

# Kịch bản (bước bắt đầu, bước kết thúc, phím giữ, nhãn). Bước tính từ lúc bấm "Bắt đầu" (rút dao khoá ~52 bước đầu).
# Giống kịch bản đã dùng cho kiem-thu-chay-lam (màn Cổng làng) + thêm đoạn tăng tốc từ đứng yên và dừng giữa đường.
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
    (352, 396, 'l', '6. Quay đầu trái khi đang chạy'),
    (396, 420, '', '7. Dừng'),
    (420, 421, 'v', '8. Tiếng Vọng: bấm Vọng → ghi'),
    (421, 450, 'r', '8. Tiếng Vọng: ghi (chạy, nhảy, va bậc)'),
    (450, 466, 'rj', '8. Tiếng Vọng: ghi (chạy, nhảy, va bậc)'),
    (466, 500, 'r', '8. Tiếng Vọng: ghi (chạy, nhảy, va bậc)'),
    (500, 524, 'l', '8. Tiếng Vọng: ghi (chạy, nhảy, va bậc)'),
    (524, 525, 'v', '9. Dừng ghi → bóng phát lại'),
    (525, 560, 'l', '9. Bóng phát lại đúng clip + khung đã ghi'),
    (560, 640, '', '9. Bóng phát lại đúng clip + khung đã ghi'),
    (640, 700, 'r', '10. Từ đứng yên tăng tốc chạy phải'),
    (700, 712, '', '11. Nhả phím: giảm tốc, dừng'),
    (712, 760, 'l', '12. Chạy trái, nhảy, tiếp đất'),
    (760, 780, 'lj', '12. Chạy trái, nhảy, tiếp đất'),
    (780, 820, 'l', '12. Chạy trái, nhảy, tiếp đất'),
    (820, 850, '', '13. Dừng'),
]
N = KICH[-1][1]


def kich(n):
    for a, b, k, nh in KICH:
        if a <= n < b:
            return k, nh
    return '', ''


JS_STEP = """([keys,cap,shot])=>{
  for(const k of KEYS) kb[k]=0; for(const c of keys) kb[c]=1;
  const ph0=pl.pha;
  savePrev(); step();
  const e=echo&&!echo.done?{i:echo.i-1,k2:echo.cur.k2,a2:echo.cur.a2,p2:echo.cur.p2,l2:echo.cur.l2,cl:echo.cur.cl}:null;
  window.__VE=[]; render(1);
  if(cap!==null){ let d=document.getElementById('__cap'); if(!d){ d=document.createElement('div'); d.id='__cap';
      d.style.cssText='position:fixed;left:8px;top:62px;z-index:99;font:600 13px/1.35 ui-monospace,Menlo,monospace;color:#fff;background:rgba(0,0,0,.62);padding:5px 8px;border-radius:6px;white-space:pre;pointer-events:none';
      document.body.appendChild(d); }
    d.textContent=cap+'\\nLam: '+pl.a2+'  khung '+(pl.k2<0?'nghỉ(TẠM)':(pl.k2+'/'+LAM_N+(pl.a2==='run'?'':' TẠM')))+'  pha '+pl.pha.toFixed(3)+'  dx '+pl.dxT.toFixed(2)+(e?'\\nBóng: clip '+e.cl+' khung '+(e.k2<0?'nghỉ':e.k2)+' (bản ghi #'+e.i+')':''); }
  return {x:pl.x,y:pl.y,dx:pl.dxT,vx:pl.vx,pha0:ph0,pha:pl.pha,k2:pl.k2,a2:pl.a2,l2:pl.l2,cl:pl.cl,g:pl.onGround,face:pl.face,
    recN:rec?rec.n:-1,recK:(rec&&rec.n>0)?REC[rec.n-1].k2:null,recP:(rec&&rec.n>0)?REC[rec.n-1].p2:null,recC:(rec&&rec.n>0)?REC[rec.n-1].cl:null,
    echo:e,ve:window.__VE, ox:ox, oy:oy, hit:S.hitstop};
}"""

JS_HOOK = """()=>{ const g=drawLam; window.drawLam=function(bo,s,x,y){ if(window.__VE) __VE.push({bong:bo!==LAM, k2:s.k2, cl:s.cl, cur:(echo&&s===echo.cur)}); return g(bo,s,x,y); };
  window.loop=function(){};
}"""


def phuc_vu():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', PORT), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


async def chay_clip(b, clip):
    c = CLIPS[clip]
    d = os.path.join(TMP, clip)
    os.makedirs(d, exist_ok=True)
    pg = await b.new_page(viewport={'width': 960, 'height': 540}, device_scale_factor=1)
    loi = []
    pg.on('pageerror', lambda e: loi.append(str(e)))
    await pg.route('https://fonts.googleapis.com/**', lambda r: r.abort())
    await pg.route('https://fonts.gstatic.com/**', lambda r: r.abort())
    await pg.goto(f'http://127.0.0.1:{PORT}/{c["url"]}')
    await pg.wait_for_function('window.TVDEMO', timeout=30000)
    nap = await pg.evaluate('window.TVDEMO')
    if not nap.get('ready'):
        raise SystemExit(f'{clip}: game không nạp được: {nap}')
    await pg.evaluate(JS_HOOK)
    await pg.click('#btn-start')
    await pg.evaluate("()=>{ document.getElementById('warn').hidden=true; }")
    log = []
    for n in range(N):
        k, nh = kich(n)
        r = await pg.evaluate(JS_STEP, [k, (f'[{c["ten"]}]  ' + nh) if QUAY else None, QUAY])
        r['n'] = n; r['keys'] = k; r['canh'] = nh
        log.append(r)
        if QUAY:
            await pg.screenshot(path=os.path.join(d, '%05d.png' % n))
    await pg.close()
    return nap['lam'], loi, log


def bang_dich(clip):
    out = subprocess.run([sys.executable, '-B', os.path.join(HERE, 'diem-cham-clip.py'), os.path.join(ROOT, CLIPS[clip]['rig'])],
                         check=True, capture_output=True, text=True).stdout
    return json.loads(out)['dich']


def do(clip, nap, loi, log, dich):
    Q = nap['quang']
    NK = nap['khung']
    # (a) pha: chỉ cộng khi chạy trên đất, đúng |dx thực|/QUANG; không reset
    lech_max, nhay = 0.0, []
    for r in log:
        dd = (r['pha'] - r['pha0']) % 1.0
        ky = (abs(r['dx']) / Q) % 1.0 if r['a2'] == 'run' else 0.0
        e = min(abs(dd - ky), 1 - abs(dd - ky))
        lech_max = max(lech_max, e)
        if e > 1e-9 or (r['a2'] == 'run' and r['k2'] != int(r['pha'] * NK)):
            nhay.append(r['n'])
    # (b) bước nhảy khung giữa hai bước chạy liền nhau; riêng các bước đổi vận tốc
    dk_all, dk_doi, doi = {}, 0, 0
    for a, b in zip(log, log[1:]):
        if a['a2'] == 'run' and b['a2'] == 'run':
            dk = (b['k2'] - a['k2']) % NK
            dk_all[dk] = dk_all.get(dk, 0) + 1
            if abs(b['vx'] - a['vx']) > 0.01:
                doi += 1
                dk_doi = max(dk_doi, dk)
    full = [(a, b) for a, b in zip(log, log[1:]) if a['a2'] == 'run' and b['a2'] == 'run' and abs(abs(b['dx']) - 4.4) < 1e-6]
    ky_vong_moi_buoc = 4.4 / Q * NK
    # (c) trượt chân: điểm vật chất đang chạm đất phải đứng yên trên nền thế giới.
    #     Mỗi bước chạy (khung k → k'), ủng chịu lực ở cả 2 khung: trượt = |dx + hướng·dịch(k→k')| (dịch < 0 = lùi so với neo).
    truot, truot_buoc, chiu, nguoc, t_max, t_cham = [], 0, {}, [], [], []
    for a, b in zip(log, log[1:]):
        if not (b['a2'] == 'run' and a['k2'] >= 0 and b['k2'] >= 0 and a['g'] and b['g']):
            continue
        if a['a2'] != 'run' and abs(b['dx']) > 0:   # vào chạy từ khung TẠM: không cùng clip chạy
            continue
        if a['l2'] != b['l2']:                      # lật hướng giữa 2 bước: hình đổi bên, không so được
            continue
        dk = (b['k2'] - a['k2']) % NK
        if dk > 4:
            continue
        sg = -1.0 if b['l2'] else 1.0               # hướng hình (Lam quay trái → lật)
        if b['dx'] * sg < 0:                        # thân còn trôi NGƯỢC hướng mặt (vừa bấm quay đầu, vx chưa đổi dấu)
            for ten, v in dich[a['k2']][dk].items():
                nguoc.append((b['n'], round(abs(b['dx'] + sg * v), 3)))
            continue
        for ten, v in dich[a['k2']][dk].items():
            s = b['dx'] + sg * v                    # dịch thế giới của điểm chạm = dx nhân vật + dịch trong hình
            truot.append(abs(s))
            (t_max if abs(abs(b['dx']) - 4.4) < 1e-6 else t_cham).append(abs(s))
            truot_buoc += 1
            chiu.setdefault(ten, []).append((b['n'], s))
    # tích luỹ mỗi lần chạm đất (các bước liền nhau cùng ủng)
    tich = []
    for ten, ds in chiu.items():
        cur, last = 0.0, None
        for n, s in ds:
            if last is not None and n != last + 1:
                tich.append(abs(cur)); cur = 0.0
            cur += s; last = n
        if last is not None:
            tich.append(abs(cur))
    # (d) va tường: giữ phím vào tường, trên đất, dx = 0 → pha đứng yên, không vẽ khung chạy
    vt = [r for r in log if r['g'] and r['keys'] in ('l', 'r') and abs(r['dx']) < 1e-9 and r['hit'] == 0 and r['canh'][:2] in ('1.', '4.', '6.')]
    vt_pha = len(set(round(r['pha'], 9) for r in vt))
    vt_chay = sum(1 for r in vt if r['a2'] == 'run')
    vong = sum(1 for a, b in zip(log, log[1:]) if b['a2'] == 'run' and b['pha'] < a['pha'])
    # (e) Tiếng Vọng: bản ghi = (clip, khung, pha) của Lam; bóng phát + VẼ đúng clip + khung đã ghi
    ghi = {}
    for r in log:
        if r['recN'] > 0:
            ghi[r['recN'] - 1] = (r['k2'], r['pha'], r['l2'], r['cl'], r['recK'], r['recP'], r['recC'])
    ghi_ok = all(g[0] == g[4] and abs(g[1] - g[5]) < 1e-12 and g[3] == g[6] == clip for g in ghi.values())
    phat, sai, sai_ve = 0, [], []
    for r in log:
        e = r['echo']
        if not e:
            continue
        phat += 1
        g = ghi.get(e['i'])
        if g is None or g[0] != e['k2'] or g[2] != e['l2'] or abs(g[1] - e['p2']) > 1e-12 or g[3] != e['cl']:
            sai.append(r['n'])
        ve = [v for v in r['ve'] if v['bong'] and v['cur']]
        if not ve or any(v['k2'] != e['k2'] or v['cl'] != e['cl'] for v in ve):
            sai_ve.append(r['n'])
    bpc = Q / 4.4
    return {
        'clip': clip, 'nap': nap, 'loi_trang': loi, 'so_buoc_logic': len(log),
        'chu_ky_o_264_px_s': {'quang_duong_moi_chu_ky_px_logic': Q, 'buoc_logic_moi_chu_ky': round(bpc, 3),
                              'giay': round(bpc / 60, 4), 'buoc_chan_moi_giay': round(2 * 60 / bpc, 2),
                              'sai_moi_buoc_chan_px_logic': round(Q / 2, 2), 'sai_so_voi_chieu_cao_Lam': round(Q / 2 / 112, 3),
                              'khung_sheet_moi_buoc_logic': round(ky_vong_moi_buoc, 3),
                              'so_khung_khac_nhau_hien_ra_moi_chu_ky': min(NK, round(bpc)),
                              'so_vong_pha_quan_sat': vong},
        'pha': {'lech_lon_nhat_so_voi_|dx|/QUANG': lech_max, 'so_buoc_pha_nhay_hoac_reset': len(nhay), 'buoc_loi': nhay[:20]},
        'nhay_khung': {'phan_bo_buoc_nhay_khung_giua_2_buoc_chay': {str(k): v for k, v in sorted(dk_all.items())},
                       'so_buoc_doi_van_toc_khi_dang_chay': doi, 'buoc_nhay_khung_lon_nhat_khi_doi_toc': dk_doi,
                       'buoc_nhay_khung_lon_nhat_o_toc_do_toi_da': max(((b['k2'] - a['k2']) % NK for a, b in full), default=None),
                       'ghi_chu': 'ở 4,4 px/bước mỗi bước tiến %.3f khung → bước nhảy %d hoặc %d khung là đúng, không có bước nhảy lớn hơn khi đổi tốc'
                                  % (ky_vong_moi_buoc, int(ky_vong_moi_buoc), int(ky_vong_moi_buoc) + 1)},
        'truot_chan': {'so_cap_buoc_do': truot_buoc,
                       'truot_lon_nhat_moi_buoc_px_logic': round(max(truot), 3) if truot else None,
                       'truot_trung_binh_moi_buoc_px_logic': round(sum(truot) / len(truot), 3) if truot else None,
                       'truot_tich_luy_lon_nhat_mot_lan_cham_dat_px_logic': round(max(tich), 3) if tich else None,
                       'so_lan_cham_dat': len(tich),
                       'quang_1_khung_px_logic': round(Q / NK, 3),
                       'o_toc_do_toi_da_4.4_px_buoc': {'so_mau': len(t_max), 'lon_nhat': round(max(t_max), 3) if t_max else None,
                                                       'trung_binh': round(sum(t_max) / len(t_max), 3) if t_max else None},
                       'khi_tang_giam_toc': {'so_mau': len(t_cham), 'lon_nhat': round(max(t_cham), 3) if t_cham else None,
                                             'trung_binh': round(sum(t_cham) / len(t_cham), 3) if t_cham else None},
                       'buoc_than_troi_nguoc_huong_mat_[buoc,truot]': nguoc,
                       'ghi_chu': 'trượt = |dx_thực + hướng × dịch(k→k′)|: độ dịch của điểm vật chất ở đế đang chạm đất so với nền thế giới giữa 2 bước logic. '
                                  'Khác 0 chỉ do làm tròn khung (floor(pha×32)): khung hiện ra trễ tối đa 1 khung so với quãng '
                                  'đường thật, nên lệch tức thời ≤ QUANG/32 rồi tự bù lại – không dồn thành trượt. Các bước thân trôi '
                                  'ngược hướng mặt (lúc quay đầu) tính riêng: ở đó chân vẫn đạp tới trong khi thân lùi → trượt thật.'},
        'va_tuong': {'so_buoc_giu_phim_vao_tuong_dx_0': len(vt), 'so_gia_tri_pha_khac_nhau': vt_pha,
                     'so_buoc_ve_khung_chay_khi_va_tuong': vt_chay},
        'tieng_vong': {'so_buoc_da_ghi': len(ghi), 'ban_ghi_khop_clip_khung_pha_cua_Lam': ghi_ok, 'so_buoc_bong_phat': phat,
                       'buoc_bong_sai_ban_ghi': sai, 'buoc_bong_VE_sai_clip_hoac_khung': sai_ve},
    }


def luu_log(clip, log):
    with open(os.path.join(OUT, f'log-tung-buoc-{clip}.csv'), 'w', encoding='utf-8') as f:
        f.write('buoc,phim,canh,x,y,dx_thuc,vx,tren_dat,trang_thai,khung,lat,clip,pha_truoc,pha_sau,ban_ghi_n,bong_ban_ghi,bong_clip,bong_khung\n')
        for r in log:
            e = r['echo'] or {}
            f.write('%d,%s,"%s",%.3f,%.3f,%.4f,%.4f,%d,%s,%d,%d,%s,%.6f,%.6f,%d,%s,%s,%s\n' % (
                r['n'], r['keys'], r['canh'], r['x'], r['y'], r['dx'], r['vx'], r['g'], r['a2'], r['k2'], r['l2'], r['cl'],
                r['pha0'], r['pha'], r['recN'], e.get('i', ''), e.get('cl', ''), e.get('k2', '')))


def video(logs):
    from PIL import Image, ImageDraw, ImageFont
    enc = ['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'slow', '-r', '60']
    for clip in ('v3', 'v4'):
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '60', '-i', os.path.join(TMP, clip, '%05d.png')] + enc
                       + [os.path.join(OUT, f'chay-{clip}-60fps.mp4')], check=True)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '60', '-i', os.path.join(TMP, 'v3', '%05d.png'),
                    '-framerate', '60', '-i', os.path.join(TMP, 'v4', '%05d.png'),
                    '-filter_complex', '[0:v]pad=iw+8:ih:0:0:color=white[a];[a][1:v]hstack=inputs=2'] + enc
                   + [os.path.join(OUT, 'chay-v3-canh-v4-60fps.mp4')], check=True)
    # GIF 112 px: cắt 1:1 quanh Lam (Lam cao đúng 112 px logic trên màn 960×540), KHÔNG phóng; v3 trái | v4 phải.
    try:
        ft = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 12)
    except OSError:
        ft = ImageFont.load_default()
    CW, CH = 232, 176

    def cat(clip, n):
        r = logs[clip][n]
        cx = r['x'] + 10 - r['ox']; cy = r['y'] + 30 - r['oy']
        x0 = int(round(min(max(cx - CW / 2, 0), 960 - CW))); y0 = int(round(min(max(cy - CH + 34, 0), 540 - CH)))
        return Image.open(os.path.join(TMP, clip, '%05d.png' % n)).convert('RGB').crop((x0, y0, x0 + CW, y0 + CH))

    def gif(ten, a, b):
        ims = []
        for i, n in enumerate(range(a, b, 2)):          # 30 fps (30-30-40 ms ⇒ đúng thời gian thật)
            c = Image.new('RGB', (CW * 2 + 6, CH + 18), (255, 255, 255))
            c.paste(cat('v3', n), (0, 18)); c.paste(cat('v4', n), (CW + 6, 18))
            d = ImageDraw.Draw(c)
            d.text((4, 2), 'v3 cũ (83,66 px/chu kỳ)', fill=(0, 0, 0), font=ft)
            d.text((CW + 10, 2), 'v4 mới (132 px/chu kỳ)', fill=(0, 0, 0), font=ft)
            ims.append(c)
        ms = [(30, 30, 40)[i % 3] for i in range(len(ims))]
        pal = ims[len(ims) // 2].quantize(colors=200, method=Image.MEDIANCUT)
        q = [i.quantize(palette=pal, dither=Image.Dither.NONE) for i in ims]
        p = os.path.join(OUT, ten)
        q[0].save(p, save_all=True, append_images=q[1:], duration=ms, loop=0, optimize=True)
        print(ten, len(q), 'khung', os.path.getsize(p) // 1024, 'KB')
    gif('112px-1-chay-trai-va-tuong-dung.gif', 52, 150)
    gif('112px-2-chay-phai-tang-giam-toc.gif', 148, 272)
    gif('112px-3-nhay-tiep-dat-quay-dau.gif', 268, 420)
    gif('112px-4-dung-yen-tang-toc-giam-toc.gif', 636, 720)
    gif('112px-5-chay-trai-nhay-tiep-dat-dung.gif', 712, 850)


async def main():
    os.makedirs(OUT, exist_ok=True)
    if os.path.isdir(TMP):
        shutil.rmtree(TMP)
    os.makedirs(TMP)
    srv = phuc_vu()
    logs, kq = {}, {}
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for clip in ('v3', 'v4'):
            nap, loi, log = await chay_clip(b, clip)
            logs[clip] = log
            kq[clip] = (nap, loi)
            print(clip, 'xong', len(log), 'bước; lỗi trang:', loi)
        await b.close()
    srv.shutdown()
    so = {'kich_ban': [list(k) for k in KICH], 'toc_do_chay_game_px_logic_s': 264}
    for clip in ('v3', 'v4'):
        so[clip] = do(clip, *kq[clip], logs[clip], bang_dich(clip))
        luu_log(clip, logs[clip])
    # vật lý hai lượt phải giống hệt (chỉ khác hình)
    so['vat_ly_hai_luot_giong_het'] = all(abs(a['x'] - b['x']) < 1e-9 and abs(a['y'] - b['y']) < 1e-9 and a['a2'] == b['a2']
                                          for a, b in zip(logs['v3'], logs['v4']))
    json.dump(so, open(os.path.join(OUT, 'so-do.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(json.dumps({k: v for k, v in so.items() if k != 'kich_ban'}, ensure_ascii=False, indent=1))
    if QUAY:
        video(logs)
        shutil.rmtree(TMP)


asyncio.run(main())
