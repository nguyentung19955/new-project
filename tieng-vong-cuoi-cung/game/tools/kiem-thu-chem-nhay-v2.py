#!/usr/bin/env python3
"""(v2, 27/10/2026: Lam KHÔNG CHÓP, rút dao + đứng thở, trượt tường QUAY LƯNG 2 phía, hộp đòn sát tầm dao, ảnh Vọng /
Cộng hưởng / keng) Quay + đo hoạt ảnh hành động của Lam (chém, bị đánh, nhảy/rơi/tiếp đất, lướt, bám/trượt tường + nhảy tường, Tiếng Vọng)
TRONG GAME THẬT (game/demo.html), Chromium headless, chạy tay từng bước logic (savePrev → step → render(1)) → mỗi bước = 1 khung
video 60 fps, kết quả xác định. Không đổi gameplay: kịch bản chỉ bấm phím; riêng phần dựng cảnh (đặt Lam cạnh quái / trên gờ /
cạnh tường, quái chờ không đánh trong cảnh combo) đặt thẳng biến trước mỗi cảnh – ghi rõ trong GHI-CHU.
Xuất vào game/kiem-thu-chem-nhay-v2/: lam-v2-60fps.mp4 (mọi cảnh), chem-debug-hitbox-60fps.mp4 (cảnh chém, bật ?debug=anim:
hộp đòn đỏ, vùng ăn đòn, hộp quái), log-tung-buoc.csv, so-do.json.
Cần: playwright (Python) + Chromium, ffmpeg. Chạy: python3 -B game/tools/kiem-thu-chem-nhay-v2.py [--khong-quay]"""
import asyncio, json, os, sys, subprocess, shutil, threading, functools, http.server, csv
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.dirname(HERE)
ROOT = os.path.dirname(GAME)
OUT = os.path.join(GAME, 'kiem-thu-chem-nhay-v2')
TMP = os.path.join(OUT, '_khung')
QUAY = '--khong-quay' not in sys.argv
PORT = 8798

# Dựng cảnh (JS chạy trước cảnh). Toạ độ: ô 32 px; phòng RB bắt đầu ở cột 66, A1 ở cột 0.
DUNG = {
    'combo': """()=>{ const q=Q[0]; resetQuai(q); q.x=(66+9)*T; q.y=FLOOR-q.h; q.px=q.x; q.py=q.y; q.cd=400; q.face=-1;
        placePlayer(q.x-62, FLOOR-pl.h); pl.face=1; for(const o of Q) if(o!==q){ o.gone=true; } }""",
    'bidanh-lui': """()=>{ const q=Q[0]; resetQuai(q); q.gone=false; q.x=(66+9)*T; q.y=FLOOR-q.h; q.px=q.x; q.py=q.y; q.cd=0; q.face=-1;
        placePlayer(q.x-62, FLOOR-pl.h); pl.face=1; pl.iframes=0; pl.hp=5; }""",
    'bidanh-toi': """()=>{ const q=Q[0]; resetQuai(q); q.x=(66+9)*T; q.y=FLOOR-q.h; q.px=q.x; q.py=q.y; q.cd=0; q.face=-1;
        placePlayer(q.x-62, FLOOR-pl.h); pl.face=-1; pl.iframes=0; pl.hp=5; }""",
    'nay': """()=>{ const q=Q[0]; resetQuai(q); q.x=(66+9)*T; q.y=FLOOR-q.h; q.px=q.x; q.py=q.y; q.cd=400; q.hp=99; q.face=-1;
        placePlayer(q.x+q.w/2-pl.w/2, q.y-190); pl.onGround=false; pl.vy=0; pl.face=1; pl.iframes=0; pl.hp=5; }""",
    'tren-khong': """()=>{ const q=Q[0]; resetQuai(q); q.x=(66+9)*T; q.y=FLOOR-q.h; q.px=q.x; q.py=q.y; q.cd=400; q.hp=99; q.face=-1;
        placePlayer(q.x-170, FLOOR-pl.h); pl.face=1; pl.iframes=0; pl.hp=5; }""",
    'nhay': """()=>{ placePlayer(4*T, FLOOR-pl.h); pl.face=1; pl.hp=5; }""",
    'roi-cao': """()=>{ placePlayer(29*T, 4*T-pl.h); pl.face=1; pl.hp=5; }""",
    'luot': """()=>{ placePlayer(3*T, FLOOR-pl.h); pl.face=1; pl.hp=5; }""",
    'tuong': """()=>{ placePlayer(28*T-pl.w-2, 5*T); pl.onGround=false; pl.face=1; pl.vy=0; pl.hp=5; }""",
    'vong': """()=>{ placePlayer(4*T, FLOOR-pl.h); pl.face=1; pl.hp=5; rec=null; echo=null; }""",
    'rutdao': """()=>{ placePlayer(4*T, FLOOR-pl.h); pl.face=1; pl.hp=5; pl.drawT=RUT_T; CH.ten=''; rec=null; echo=null; }""",
    'chay': """()=>{ placePlayer(1.5*T, FLOOR-pl.h); pl.face=1; pl.hp=5; pl.drawT=0; rec=null; echo=null; }""",
    'tuong-trai': """()=>{ placePlayer(31*T+2, 5*T); pl.onGround=false; pl.face=-1; pl.vy=0; pl.hp=5; }""",
    'cong-huong': """()=>{ const q=GUARD; resetQuai(q); q.cd=400; q.face=-1; q.px=q.x; q.py=q.y; for(const o of Q) if(o!==q) o.gone=true;
        placePlayer(q.x-62, FLOOR-pl.h); pl.face=1; pl.iframes=0; pl.hp=5; rec=null; echo=null; S.resFirst=false; }""",
}
# (cảnh, [(số bước, phím giữ, phím nhấn ở bước đầu đoạn), …], tiêu đề)
CANH = [
    ('rutdao', [(52, '', ''), (170, '', '')], '0. Vào ải: RÚT DAO 52 bước (khoá điều khiển như game) → ĐỨNG THỞ (lặp) – không chóp mũ'),
    ('chay', [(40, '', ''), (36, 'r', ''), (70, '', ''), (30, 'l', ''), (70, '', ''), (20, 'r', ''), (40, '', '')], '1. Chạy ↔ đứng thở (đổi qua lại không lóe), chạy 2 hướng'),
    ('tuong', [(70, 'r', ''), (10, '', 'j'), (18, 'r', ''), (50, 'r', ''), (10, '', 'j'), (40, '', '')], '2a. Tường bên PHẢI: bám → trượt (lưng áp tường, mặt ra) → nhảy tường → quay lại'),
    ('tuong-trai', [(70, 'l', ''), (10, '', 'j'), (18, 'l', ''), (50, 'l', ''), (10, '', 'j'), (40, '', '')], '2b. Tường bên TRÁI: bám → trượt → nhảy tường → quay lại'),
    ('combo', [(20, '', ''), (19, '', 'a'), (19, '', 'a'), (40, '', 'a'), (30, '', '')], '3a. Combo chém 1 → 2 → 3 trúng quái (hộp đòn mới sát tầm dao)'),
    ('tren-khong', [(10, '', ''), (6, 'u', 'a'), (34, '', ''), (8, 'r', 'j'), (14, 'r', 'a'), (40, '', '')], '3b. Chém hất (↑+X), chém trên không (hộp đòn 6 mới)'),
    ('nay', [(14, 'd', ''), (2, 'd', 'a'), (40, 'd', ''), (12, 'd', 'a'), (40, '', '')], '3c. Chém nảy (↓+X) trên đầu quái'),
    ('cong-huong', [(10, '', 'v'), (40, '', 'a'), (1, '', 'v'), (10, '', ''), (70, '', 'a'), (30, '', '')],
     '4. Vọng (ảnh gen) → chém vỏ cứng: KENG (ảnh gen) → bóng phát (Vọng) → chém cùng bóng: CỘNG HƯỞNG (ảnh gen)'),
]
CHEM = {'combo', 'tren-khong', 'nay'}

JS_STEP = """([keys,press,cap])=>{
  for(const k of KEYS) kb[k]=0; for(const c of keys) kb[c]=1; for(const c of press) latch[c]=1;
  savePrev(); step(); render(1);
  const hb=pl.dead?null:atkBox(pl,pl.atkN,pl.atkT,pl.face,{x:0,y:0,w:0,h:0});
  const ten=pl.h2?LAM.HD.meta.frames[pl.k2].ten:(pl.k2<0?'nghi':'chay#'+pl.k2);
  if(cap!==null){ let d=document.getElementById('__cap'); if(!d){ d=document.createElement('div'); d.id='__cap';
      d.style.cssText='position:fixed;left:8px;top:62px;z-index:99;font:600 13px/1.35 ui-monospace,Menlo,monospace;color:#fff;background:rgba(0,0,0,.62);padding:5px 8px;border-radius:6px;white-space:pre;pointer-events:none';
      document.body.appendChild(d); }
    d.textContent=cap+'\\nLam: '+pl.a2+' · khung '+ten+(pl.atkN?' · atkT '+pl.atkT+(hb?' · HỘP ĐÒN BẬT':''):'')+(S.hitstop?' · hitstop '+S.hitstop:'')
      +'\\nvx '+pl.vx.toFixed(2)+'  vy '+pl.vy.toFixed(2)+(pl.hurtT?'  hurtT '+pl.hurtT:'')+(pl.landT?'  landT '+pl.landT:'')+(pl.st==='wall'?'  bám '+pl.wallStickT+'/6':'')
      +'  hiệu ứng: '+IFX.filter(f=>f.on).map(f=>f.anh).join(',')+(echo&&!echo.done?'\\nBóng: '+echo.cur.a2+' khung '+(echo.cur.h2?LAM.HD.meta.frames[echo.cur.k2].ten:echo.cur.k2):''); }
  return {x:pl.x,y:pl.y,vx:pl.vx,vy:pl.vy,g:pl.onGround,face:pl.face,a2:pl.a2,k2:pl.k2,h2:pl.h2,ten,atkN:pl.atkN,atkT:pl.atkT,
    hb:hb?[hb.x,hb.y,hb.w,hb.h]:null,hit:S.hitstop,st:pl.st,dash:pl.dash,hurtT:pl.hurtT,hurtK:pl.hurtK,landT:pl.landT,wst:pl.wallStickT,wjT:pl.wjT,
    fx:IFX.filter(f=>f.on).map(f=>[f.anh,f.anim,f.t,Math.round(f.x),Math.round(f.y)]),
    echo:echo&&!echo.done?{i:echo.i-1,a2:echo.cur.a2,k2:echo.cur.k2,h2:echo.cur.h2,n:echo.cur.n,at:echo.cur.at}:null,
    rec:rec?{n:rec.n,k2:REC[rec.n-1]&&REC[rec.n-1].k2,h2:REC[rec.n-1]&&REC[rec.n-1].h2}:null,
    q:Q.map(q=>({x:q.x,y:q.y,hp:q.hp,st:q.st,gone:q.gone})), hp:pl.hp};
}"""


def phuc_vu():
    class Qh(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', PORT), functools.partial(Qh, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


async def chay(b, url, canh_list, thu_muc, quay):
    os.makedirs(thu_muc, exist_ok=True)
    pg = await b.new_page(viewport={'width': 960, 'height': 540}, device_scale_factor=1)
    loi = []
    pg.on('pageerror', lambda e: loi.append(str(e)))
    await pg.route('https://fonts.googleapis.com/**', lambda r: r.abort())
    await pg.route('https://fonts.gstatic.com/**', lambda r: r.abort())
    await pg.goto(f'http://127.0.0.1:{PORT}/{url}')
    await pg.wait_for_function('window.TVDEMO', timeout=30000)
    nap = await pg.evaluate('window.TVDEMO')
    if not nap.get('ready'):
        raise SystemExit('game không nạp được: %s' % nap)
    await pg.evaluate("()=>{ window.loop=function(){}; }")
    await pg.click('#btn-start')
    await pg.evaluate("()=>{ document.getElementById('warn').hidden=true; }")
    for _ in range(60):      # hết rút dao lúc mở game (cảnh 0 quay lại rút dao)
        await pg.evaluate(JS_STEP, ['', '', None])
    log, n = [], 0
    for ten, doan, tieu in canh_list:
        await pg.evaluate(DUNG[ten])
        for _ in range(3):
            await pg.evaluate("()=>{ for(const k of KEYS) kb[k]=0; savePrev(); S.camx=clamp(pl.x+pl.w/2-W/2+S.look,ROOMS[roomAt(pl.x)].x0*T,(ROOMS[roomAt(pl.x)].x0+ROOMS[roomAt(pl.x)].w)*T-W); S.pcx=S.camx; }")
        for so, giu, nhan in doan:
            for i in range(so):
                r = await pg.evaluate(JS_STEP, [giu, nhan if i == 0 else '', tieu if quay else None])
                r.update({'n': n, 'canh': ten, 'giu': giu, 'nhan': nhan if i == 0 else ''})
                log.append(r)
                if quay:
                    await pg.screenshot(path=os.path.join(thu_muc, '%05d.png' % n))
                n += 1
    await pg.close()
    return nap, loi, log


def video(thu_muc, dst):
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '60', '-i', os.path.join(thu_muc, '%05d.png'),
                    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-r', '60', dst], check=True)


def do(log, meta):
    """số đo khớp gameplay ↔ hình từ log từng bước"""
    kq = {'don': [], 'trung': [], 'luot': [], 'tuong': {}, 'tiep_dat': [], 'bi_danh': [], 'vong': {}}
    # mỗi lần ra đòn: atkT đầu tiên hộp đòn bật → tên khung
    prev = None
    for i, r in enumerate(log):
        if r['atkN'] and r['hb'] and not (prev and prev['atkN'] == r['atkN'] and prev['hb'] and prev['atkT'] in (r['atkT'] - 1, r['atkT'])):
            d = meta['don']['atk%d' % r['atkN']]
            kq['don'].append({'buoc': r['n'], 'canh': r['canh'], 'don': r['atkN'], 'atkT_hop_bat': r['atkT'], 'su': d['su'],
                              'khung_hien': r['ten'], 'khung_trung_mong_doi': d['tu_the_theo_atkT'][max(d['su'], 1) - 1],
                              'khop': r['ten'] == d['tu_the_theo_atkT'][max(d['su'], 1) - 1] and r['atkT'] == max(d['su'], 1)})
        if r['hit'] and not (prev and prev['hit']):
            kq['trung'].append({'buoc': r['n'], 'canh': r['canh'], 'don': r['atkN'], 'atkT': r['atkT'], 'hitstop': r['hit'],
                                'tia_trung': [f for f in r['fx'] if f[0] == 'trung-don' and f[2] <= 1]})
        if r['st'] == 'dash' and not (prev and prev['st'] == 'dash'):
            j = i
            while j < len(log) and log[j]['st'] == 'dash':
                j += 1
            kq['luot'].append({'buoc': r['n'], 'so_buoc': j - i, 'quang_px': round(log[j - 1]['x'] - log[i - 1]['x'], 2),
                               'khung': [log[k]['ten'] for k in range(i, j)]})
        if r['landT'] == 10 and prev and prev['landT'] != 10:
            kq['tiep_dat'].append({'buoc': r['n'], 'canh': r['canh'], 'khung': [log[k]['ten'] for k in range(i, min(i + 7, len(log)))],
                                   'bui': [f[0] + '/' + f[1] for f in r['fx'] if f[0] == 'bui' and f[2] <= 2]})
        if r['hurtT'] and not (prev and prev['hurtT']):
            kq['bi_danh'].append({'buoc': r['n'], 'canh': r['canh'], 'huong_day': 'lùi' if r['hurtK'] < 0 else 'tới',
                                  'khung_17_buoc': [log[k]['ten'] for k in range(i, min(i + 17, len(log)))],
                                  'hieu_ung': [f[0] for f in r['fx']]})
        prev = r
    w = [r for r in log if r['st'] == 'wall']
    kq['tuong'] = {'so_buoc_bam_tuong': len(w), 'bam_vy0': sum(1 for r in w if r['wst'] < 6 and abs(r['vy']) < 1e-9),
                   'vy_truot_max': max((r['vy'] for r in w), default=0),
                   'khung': sorted(set(r['ten'] for r in w)),
                   'so_vun_go': sum(1 for r in log for f in r['fx'] if f[0] == 'truot-tuong' and f[2] == 1),
                   'nhay_tuong_khung': [r['ten'] for r in log if r['wjT'] >= 11 and not r['g']][:8]}
    e = [r for r in log if r['echo']]
    kq['vong'] = {'so_buoc_phat': len(e), 'buoc_bong_chem': sum(1 for r in e if r['echo']['n']),
                  'khung_bong_hanh_dong': sum(1 for r in e if r['echo']['h2'])}
    kq['res'] = {'keng': sum(1 for r in log for f in r['fx'] if f[0] == 'keng' and f[2] == 1),
                 'cong_huong': sum(1 for r in log for f in r['fx'] if f[0] == 'cong-huong' and f[2] == 1),
                 'vong': sum(1 for r in log for f in r['fx'] if f[0] == 'vong' and f[2] == 1)}
    rd = [r for r in log if r['canh'] == 'rutdao']
    kq['rut_dao_dung'] = {'so_buoc_rut_dao': sum(1 for r in rd if r['a2'] == 'rutdao'),
                          'khung_rut_dao': [r['ten'] for r in rd if r['a2'] == 'rutdao'],
                          'so_buoc_dung': sum(1 for r in rd if r['a2'] == 'idle'),
                          'khung_dau_dung': [r['ten'] for r in rd if r['a2'] == 'idle'][:30]}
    ch = [r for r in log if r['canh'] == 'chay']
    kq['chay_dung'] = {'chuyen': [(ch[i]['n'], ch[i - 1]['a2'] + '→' + ch[i]['a2'], ch[i - 1]['ten'] + '→' + ch[i]['ten'])
                                  for i in range(1, len(ch)) if ch[i]['a2'] != ch[i - 1]['a2']],
                       'buoc_khung_nghi_TAM': sum(1 for r in log if r['ten'] == 'nghi')}
    kq['tom_tat'] = {'so_lan_ra_don_co_hop_bat': len(kq['don']), 'khung_trung_dung_tick': sum(d['khop'] for d in kq['don']),
                     'so_lan_trung': len(kq['trung'])}
    return kq


async def main():
    os.makedirs(OUT, exist_ok=True)
    srv = phuc_vu()
    meta = json.load(open(os.path.join(ROOT, 'art/modular/lam-moi/hanh-dong/sprite/lam-hanh-dong-2x.json'), encoding='utf-8'))
    async with async_playwright() as p:
        b = await p.chromium.launch()
        nap, loi, log = await chay(b, 'game/demo.html', CANH, os.path.join(TMP, 'thuong'), QUAY)
        if QUAY:
            _, loi2, _ = await chay(b, 'game/demo.html?debug=anim', [c for c in CANH if c[0] in CHEM], os.path.join(TMP, 'debug'), True)
            loi += loi2
        await b.close()
    srv.shutdown()
    if QUAY:
        video(os.path.join(TMP, 'thuong'), os.path.join(OUT, 'lam-v2-60fps.mp4'))
        video(os.path.join(TMP, 'debug'), os.path.join(OUT, 'chem-debug-hitbox-60fps.mp4'))
        shutil.rmtree(TMP)
    kq = do(log, meta)
    kq['loi_trang'] = loi
    kq['nap'] = nap
    json.dump(kq, open(os.path.join(OUT, 'so-do.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    with open(os.path.join(OUT, 'log-tung-buoc.csv'), 'w', newline='', encoding='utf-8') as f:
        cols = ['n', 'canh', 'giu', 'nhan', 'x', 'y', 'vx', 'vy', 'g', 'face', 'st', 'a2', 'ten', 'atkN', 'atkT', 'hb', 'hit', 'dash',
                'hurtT', 'landT', 'wst', 'wjT', 'fx']
        w = csv.writer(f); w.writerow(cols)
        for r in log:
            w.writerow([round(r[c], 3) if isinstance(r[c], float) else (json.dumps(r[c], ensure_ascii=False) if isinstance(r[c], (list, dict)) else r[c]) for c in cols])
    print(json.dumps(kq['tom_tat'], ensure_ascii=False), 'lỗi trang:', loi)


asyncio.run(main())
