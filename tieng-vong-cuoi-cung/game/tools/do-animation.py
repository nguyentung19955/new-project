#!/usr/bin/env python3
"""Đo animation bằng CHẠY THỬ (Chromium headless, SwiftShader) – trước/sau khi sửa (docs/fix-animation.md).

- Thay requestAnimationFrame bằng đồng hồ giả: gọi vòng lặp thật của game (loop) mỗi 1000/60 ms hoặc 1000/120 ms.
- Bọc ctx.drawImage: ghi lại toạ độ VẼ THẬT của sprite Lam / quái / boss (ma trận transform + ô nguồn), suy ra trên màn:
  tâm thân, đỉnh mũ, đế ủng; so với pivot vật lý (chân hitbox) đã nội suy.
- Kịch bản: đứng, chạy (+ quay đầu, dừng), nhảy, combo 3 đòn, chém trên không, bị đánh, chết, quái đi / đánh / chết, boss.
- Ra: game/xem-thu/anh/do-animation.json (số liệu), debug-*.png (lớp debug), truoc-sau-*.gif (so trước/sau).

Chạy (từ tieng-vong-cuoi-cung/):
    python3 game/tools/do-animation.py            # cần bản "trước" = commit gốc (mặc định HEAD) dựng ở thư mục tạm
    python3 game/tools/do-animation.py --goc <commit>
"""
import io, json, os, subprocess, sys, tempfile
import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__)); GAME = os.path.dirname(HERE); ROOT = os.path.dirname(GAME)
OUT = os.path.join(GAME, 'xem-thu', 'anh'); os.makedirs(OUT, exist_ok=True)
ARGS = ['--use-angle=swiftshader', '--use-gl=angle', '--enable-unsafe-swiftshader', '--disable-accelerated-2d-canvas']
GOC = sys.argv[sys.argv.index('--goc') + 1] if '--goc' in sys.argv else 'HEAD'

# mốc trong ô cắt (crop) của từng khung, dùng chung cho bản trước/sau (khung cắt giống hệt – đã kiểm)
LJ = json.load(open(os.path.join(GAME, 'anim', 'lam-chibi.json'), encoding='utf-8'))
QJ = json.load(open(os.path.join(GAME, 'anim', 'quai-boss.json'), encoding='utf-8'))
MOC = {}
for k, f in LJ['frames'].items():
    m = LJ['moc'][k]
    MOC['%d,%d' % (f[0], f[1])] = dict(k=k, tx=m['tx'] - f[4], ty=m['ty'] - f[5], top=m['dinh'] - f[5], de=m['de'] - f[5],
                                       mu=m['mu'], sh='lam')
qa = np.asarray(Image.open(os.path.join(GAME, 'anim', 'quai-boss.png')).convert('RGBA'))[..., 3] > 128
for k, f in QJ['frames'].items():
    al = qa[f[1]:f[1] + f[3], f[0]:f[0] + f[2]]
    ys, xs = np.where(al); up = al[:int(al.shape[0] * 0.6)]; uy, ux = np.where(up)
    MOC['q%d,%d' % (f[0], f[1])] = dict(k=k, tx=float(ux.mean()), ty=float(uy.mean()), top=float(ys.min()), de=float(ys.max()), sh='qb')

INIT = r"""
window.__now=0; window.__raf=[];
window.requestAnimationFrame=cb=>{ __raf.push(cb); return __raf.length; };
window.__tick=ms=>{ __now+=ms; const q=__raf; __raf=[]; for(const cb of q) cb(__now); };
window.__draws=[];
const _di=CanvasRenderingContext2D.prototype.drawImage;
CanvasRenderingContext2D.prototype.drawImage=function(){
  if(arguments.length===9 && this.canvas.id==='cv'){ const m=this.getTransform();
    __draws.push({img:arguments[0],sx:arguments[1],sy:arguments[2],sw:arguments[3],dx:arguments[5],dy:arguments[6],dw:arguments[7],dh:arguments[8],a:m.a,d:m.d,e:m.e,f:m.f}); }
  return _di.apply(this,arguments);
};
"""
HELP = r"""
window.__MOC=%s;
window.__go=(ms,keys,once)=>{ keys=keys||''; for(const k of KEYS) kb[k]=keys.includes(k)?1:0; if(once) for(const k of once) latch[k]=1;
  __draws.length=0; __tick(ms);
  const al=accT/DT, bk=BK, out={t:__now, a2:pl.a2, k2:pl.k2, ox:ox, oy:oy, cam:lerp(S.pcx,S.camx,al), bk:BK};
  const lam=__draws.filter(d=>d.img===LAM.img).pop();
  if(lam){ const m=__MOC[lam.sx+','+lam.sy]; if(m){ const sc=lam.dw/lam.sw;
    const X=v=>(lam.a*(lam.dx+v*sc)+lam.e)/bk, Y=v=>(lam.d*(lam.dy+v*sc)+lam.f)/bk;
    Object.assign(out,{key:m.k, tx:X(m.tx), ty:Y(m.ty), top:Y(m.top), de:Y(m.de), mu:m.mu, flip:lam.a<0}); } }
  out.px=lerp(pl.px,pl.x,al)+pl.w/2-ox; out.py=lerp(pl.py,pl.y,al)+pl.h-oy;
  const q=Q[window.__qi||0]; if(q && !q.gone){ const qx=lerp(q.px,q.x,al)+q.w/2-ox, qy=lerp(q.py,q.y,al)+q.h-oy+3; let best=null, bd=1e9;
    for(const d of __draws){ if(d.img!==QB.img) continue; const m=__MOC['q'+d.sx+','+d.sy]; if(!m||m.k.startsWith('boss')) continue;
      const x=(d.a*(d.dx+m.tx)+d.e)/bk, dd=Math.abs(x-qx); if(dd<bd){ bd=dd; best=[d,m]; } }
    if(best){ const [d,m]=best; Object.assign(out,{qk:m.k, qst:q.st, qtx:(d.a*(d.dx+m.tx)+d.e)/bk, qtop:(d.d*(d.dy+m.top)+d.f)/bk, qde:(d.d*(d.dy+m.de)+d.f)/bk, qpx:qx, qpy:qy}); } }
  if(S.room>=ROOMS.length-2){ const d=__draws.filter(d=>(d.img===QB.img||d.img===QB.w)&&__MOC['q'+d.sx+','+d.sy]&&__MOC['q'+d.sx+','+d.sy].k.startsWith('boss'))[0];
    if(d){ const m=__MOC['q'+d.sx+','+d.sy]; Object.assign(out,{bk2:m.k, btx:(d.a*(d.dx+m.tx)+d.e)/bk, btop:(d.d*(d.dy+m.top)+d.f)/bk, bpx:lerp(boss.px,boss.x,al)+boss.w/2-ox}); } }
  return out; };
window.__tele=(r,lx)=>{ placePlayer((r.x0+lx)*T, FLOOR-pl.h); pl.drawT=0; pl.iframes=0; boss.k2=boss.k2||0; S.camx=S.pcx=clamp(pl.x+pl.w/2-W/2+48,r.x0*T,(r.x0+r.w)*T-W); };
1;
""" % json.dumps(MOC)


def kich_ban():
    """(tên cảnh, [(số bước logic, phím giữ, phím bấm 1 lần ở bước đầu, js trước)])"""
    return [
        ('idle', [(10, '', '', "__tele(A1,4)"), (96, '', '', None)]),
        ('run', [(80, 'r', '', "__tele(RD,3)"), (40, 'l', '', None), (24, '', '', None)]),
        ('jump', [(24, 'j', 'j', None), (60, '', '', None)]),
        ('combo', [(10, '', 'a', None)] + [(10, '', 'a', None)] * 7 + [(40, '', '', None)]),
        ('chem-tren-khong', [(10, 'j', 'j', None), (60, 'j', 'a', None), (30, '', '', None)]),
        ('hurt', [(50, '', '', "hurt(-1)")]),
        ('death', [(110, '', '', "pl.hp=1; pl.iframes=0; hurt(-1)")]),
        ('camera', [(48, 'l', '', "Q[1].gone=true; placePlayer((RB.x0+22)*T+4, 11*T-pl.h); pl.face=-1; pl.drawT=0; pl.iframes=0; S.look=-48; S.camx=S.pcx=clamp(pl.x+10-480-48,RB.x0*T,(RB.x0+RB.w)*T-W)")]),
        ('quai-di', [(90, '', '', "placePlayer((RB.x0+14)*T, 11*T-pl.h); pl.drawT=0; pl.iframes=0; S.camx=S.pcx=RB.x0*T+40; __qi=0; Q[0].x=Q[0].px=(RB.x0+7)*T; Q[0].st='walk'; Q[0].cd=9999")]),
        ('quai-danh', [(90, '', '', "placePlayer((RB.x0+3)*T, FLOOR-pl.h); pl.drawT=0; pl.iframes=0; pl.hp=99; Q[0].x=Q[0].px=pl.x+110; Q[0].face=-1; Q[0].cd=0; Q[0].st='walk'")]),
        ('quai-chet', [(80, '', '', "killQuai(Q[0],1)")]),
        ('boss', [(160, '', '', "__tele(RE,4); pl.hp=99; bossStart()")]),
    ]


def chay(url, hz, w, h, dpr, chup=None, debug_shots=None):
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=ARGS)
        pg = b.new_page(viewport={'width': w, 'height': h}, device_scale_factor=dpr)
        loi = []; pg.on('pageerror', lambda e: loi.append(str(e)))
        pg.add_init_script(INIT)
        pg.goto(url)
        for _ in range(400):
            pg.wait_for_timeout(25); pg.evaluate('__tick(16.667)')
            if pg.evaluate('window.TVDEMO && TVDEMO.ready'):
                break
        pg.click('#btn-start'); pg.evaluate(HELP); pg.evaluate('setMode(false)')
        ms = 1000 / hz; per = hz // 60
        pg.evaluate("for(let i=0;i<90;i++) __go(%f)" % ms)       # rút dao xong
        ket = {}
        for ten, buoc in kich_ban():
            mau, anh = [], []
            for n, giu, mot, js in buoc:
                if js:
                    pg.evaluate(js)
                if not (chup and ten in chup) and not debug_shots:   # nhanh: chạy cả đoạn trong 1 lần gọi
                    rs = pg.evaluate('([n,a,b,c])=>{const o=[]; for(let i=0;i<n;i++) o.push(__go(a,b,i?[]:c)); return o;}',
                                     [n * per, ms, giu, list(mot)])
                    for r in rs:
                        r['canh'] = ten
                    mau += rs; continue
                for i in range(n * per):
                    r = pg.evaluate('([a,b,c])=>__go(a,b,c)', [ms, giu, list(mot) if i == 0 else []])
                    r['canh'] = ten; mau.append(r)
                    if chup and ten in chup and i % (2 * per) == 0:
                        cx = r.get('qpx' if ten.startswith('quai') else 'px', 480)
                        x0 = int(max(0, min(w - 340, cx - 170))); y0 = int(max(0, min(h - 250, r.get('qpy' if ten.startswith('quai') else 'py', 400) - 205)))
                        anh.append(Image.open(io.BytesIO(pg.screenshot(clip=dict(x=x0, y=y0, width=340, height=250)))).convert('RGB'))
                    if debug_shots and (ten, len(mau)) in debug_shots:
                        pg.screenshot(path=os.path.join(OUT, 'debug-%s.png' % debug_shots[(ten, len(mau))]))
            ket[ten] = dict(mau=mau, anh=anh)
        b.close()
        if loi:
            print('LỖI trang:', loi[:3])
        return ket


def thong_ke(mau, pre=''):
    """độ lệch giữa 2 lần vẽ kề nhau của sprite SO VỚI pivot vật lý (đã trừ chuyển động thật)."""
    tx = 'qtx' if pre == 'q' else 'btx' if pre == 'b' else 'tx'
    top = 'qtop' if pre == 'q' else 'btop' if pre == 'b' else 'top'
    px = 'qpx' if pre == 'q' else 'bpx' if pre == 'b' else 'px'
    dxs, dts, dds, mus, doi = [], [], [], [], 0
    for a, b in zip(mau, mau[1:]):
        if tx not in a or tx not in b:
            continue
        fa = -1 if a.get('flip') else 1
        rx_a = (a[tx] - a[px]); rx_b = (b[tx] - b[px])
        dxs.append(abs(rx_b - rx_a))
        if pre == '':
            dts.append(abs((b['top'] - b['py']) - (a['top'] - a['py'])))
            dds.append(abs((b['de'] - b['py']) - (a['de'] - a['py'])))
            if a.get('mu') and b.get('mu') and a['key'] != b['key']:
                mus.append(abs(b['mu'] / a['mu'] - 1) * 100)
        elif pre == 'q':
            dts.append(abs((b['qtop'] - b['qpy']) - (a['qtop'] - a['qpy'])))
            dds.append(abs((b['qde'] - b['qpy']) - (a['qde'] - a['qpy'])))
        else:
            dts.append(0); dds.append(0)
    f = lambda v: round(float(np.max(v)), 1) if v else 0
    g = lambda v: round(float(np.mean(v)), 2) if v else 0
    return dict(than_x_max=f(dxs), than_x_tb=g(dxs), dinh_y_max=f(dts), de_y_max=f(dds), co_max_pct=f(mus), n=len(dxs))


def rung_camera(mau):
    """camera đang trượt theo Lam (chạy trên bệ đá Sân chuông): sai số bước dịch màn hình so với camera lý tưởng (không làm tròn)
    = |Δox − Δcam|, đơn vị PIXEL THẬT (×BK). Mọi thứ vẽ theo ox (nền, Lam, quái) cùng giật theo sai số này."""
    m = [x for x in mau if x['canh'] == 'camera'][8:]
    bk = m[0]['bk']
    e = np.abs(np.diff([x['ox'] for x in m]) - np.diff([x['cam'] for x in m])) * bk
    lech = max(abs(x['ox'] - x['cam']) * bk for x in m)
    return dict(lech_cam_max=round(float(lech), 2), sai_buoc_max=round(float(e.max()), 2), sai_buoc_tb=round(float(e.mean()), 2),
                bk=round(bk, 3), n=len(e))


def nhip(mau, ten='run'):
    """thời lượng 1 vòng chạy (ms) đo theo đồng hồ giả."""
    ks = [(m['t'], m['key']) for m in mau if m['canh'] == ten and m.get('a2') == 'run']
    doi = [t for (t, k), (t0, k0) in zip(ks[1:], ks) if k != k0]
    return round((doi[9] - doi[1]) / 8 * 8, 1) if len(doi) > 10 else None


def gif(truoc, sau, path, nhan):
    from PIL import ImageDraw, ImageFont
    global FONT
    FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 13)
    fr = []
    for a, b in zip(truoc, sau):
        c = Image.new('RGB', (a.width * 2 + 6, a.height + 22), (20, 20, 24)); c.paste(a, (0, 22)); c.paste(b, (a.width + 6, 22))
        d = ImageDraw.Draw(c); d.text((6, 4), 'TRƯỚC – ' + nhan, fill=(255, 140, 140), font=FONT); d.text((a.width + 12, 4), 'SAU – ' + nhan, fill=(140, 255, 160), font=FONT)
        fr.append(c.quantize(96))
    fr[0].save(path, save_all=True, append_images=fr[1:], duration=33, loop=0, optimize=True)


def main():
    tmp = tempfile.mkdtemp(prefix='tv-goc-')
    subprocess.run(['git', 'worktree', 'add', '--detach', tmp, GOC], cwd=ROOT, check=True, capture_output=True)
    try:
        rel = os.path.relpath(GAME, subprocess.run(['git', 'rev-parse', '--show-toplevel'], cwd=ROOT, capture_output=True, text=True).stdout.strip())
        gtr = os.path.join(tmp, rel)
        subprocess.run([sys.executable, os.path.join(gtr, 'build-demo.py')], check=True, capture_output=True)
        subprocess.run([sys.executable, os.path.join(GAME, 'build-demo.py')], check=True, capture_output=True)
        url = {'truoc': 'file://' + os.path.join(gtr, 'demo.build.html'), 'sau': 'file://' + os.path.join(GAME, 'demo.build.html')}
        KQ = {}
        for ban in ('truoc', 'sau'):
            for hz in (60, 120):
                print('chạy', ban, hz, 'Hz …', flush=True); import time; t0=time.time()
                r = chay(url[ban], hz, 844, 390, 3)
                print('  xong', round(time.time()-t0), 's', flush=True)
                mau = [m for v in r.values() for m in v['mau']]
                bang = {}
                for ten, v in r.items():
                    pre = 'q' if ten.startswith('quai') else 'b' if ten == 'boss' else ''
                    if pre == '':
                        for an in sorted({m.get('a2') for m in v['mau'] if m.get('a2')}):
                            bang['%s/%s' % (ten, an)] = thong_ke([m for m in v['mau'] if m.get('a2') == an])
                        bang[ten + '/(cả cảnh)'] = thong_ke(v['mau'])
                    else:
                        bang[ten] = thong_ke(v['mau'], pre)
                KQ['%s_%d' % (ban, hz)] = dict(bang=bang, camera=rung_camera(mau), vong_chay_ms=nhip(mau),
                                               mau=mau if hz == 60 else None)
        # ảnh debug (bản sau, iPhone) + GIF trước/sau (960×540)
        shots = {('idle', 40): 'dung', ('run', 60): 'chay', ('combo', 25): 'combo-a', ('combo', 48): 'combo-b', ('combo', 70): 'combo-c',
                 ('jump', 14): 'nhay', ('chem-tren-khong', 30): 'chem-tren-khong', ('quai-danh', 42): 'quai-dam', ('boss', 120): 'boss', ('death', 30): 'chet'}
        chay(url['sau'] + '?debug=anim', 60, 844, 390, 3, debug_shots=shots)
        canh = ['idle', 'run', 'combo', 'quai-di']
        A = chay(url['truoc'], 60, 960, 540, 1, chup=canh); B = chay(url['sau'], 60, 960, 540, 1, chup=canh)
        for ten, nhan in [('idle', 'đứng (thật tốc độ)'), ('run', 'chạy + quay đầu'), ('combo', 'combo 3 đòn'), ('quai-di', 'quái đi')]:
            gif(A[ten]['anh'], B[ten]['anh'], os.path.join(OUT, 'truoc-sau-%s.gif' % ten), nhan)
        json.dump(KQ, open(os.path.join(OUT, 'do-animation.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
        for k, v in KQ.items():
            print('==', k, 'camera(std, max) px logic', v['camera'], 'vòng chạy ms', v['vong_chay_ms'])
            for t, s in v['bang'].items():
                print('   %-28s %s' % (t, s))
    finally:
        subprocess.run(['git', 'worktree', 'remove', '--force', tmp], cwd=ROOT, capture_output=True)


if __name__ == '__main__':
    main()
