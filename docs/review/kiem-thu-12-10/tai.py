"""Đo thời gian tải bản 2 tệp: lần đầu (không đệm) và lần 2 (cùng hồ sơ trình duyệt: HTTP cache + service worker).
python3 tai.py <cổng> <ra.json>"""
import json, sys, time, tempfile, shutil
from playwright.sync_api import sync_playwright

CONG = int(sys.argv[1]); RA = sys.argv[2]
URL = 'http://localhost:%d/?cloud=0' % CONG
MOC = r"""(() => {
  const m = (window.__m = { ft: [] }); let last = 0;
  const iv = setInterval(() => {
    const t = Math.round(performance.now()), G = window.G;
    if (m.tai == null && document.getElementById('lk-tai')) m.tai = t;
    if (m.manChao == null && G && G.scene && !document.getElementById('lk-tai')) m.manChao = t;
    if (m.lang == null && G && G.scene && G.Village && G.scene === G.Village) m.lang = t;
    const SC = G && G.spriteCustom; if (!SC || !SC.sau) return;
    m.sau = { tt: SC.sau.tt, xong: SC.sau.xong, tong: SC.sau.tong, lan: SC.sau.lan };
    if (m.batDauSau == null && SC.sau.tt === 'tai') m.batDauSau = t;
    if (m.xongSau == null && (SC.sau.tt === 'xong' || SC.sau.tt === 'loi' || SC.sau.tt === 'khong')) m.xongSau = t;
  }, 10);
  const loop = (ts) => { if (last) m.ft.push(+(ts - last).toFixed(1)); last = ts; requestAnimationFrame(loop); }; requestAnimationFrame(loop);
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) (m.lt = m.lt || []).push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({ type: 'longtask', buffered: true }); } catch (e) {}
})();"""

NETS = {'4G 9Mbps/170ms': (9, 170), '3G cham 1.5Mbps/300ms': (1.5, 300)}


def mot(pw, net, cpu, udir, sw=True):
    ctx = pw.chromium.launch_persistent_context(udir, args=['--host-resolver-rules=MAP fonts.googleapis.com 127.0.0.1:9, MAP fonts.gstatic.com 127.0.0.1:9'], viewport={'width': 844, 'height': 390}, device_scale_factor=3, is_mobile=True, has_touch=True,
                                                service_workers='allow' if sw else 'block')
    pg = ctx.pages[0] if ctx.pages else ctx.new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append('console.' + m.type + ': ' + m.text[:200]) if m.type in ('error', 'warning') else None)
    pg.route('**/fonts.g*/**', lambda r: r.abort())
    pg.route('**fonts.googleapis.com**', lambda r: r.abort())
    cdp = ctx.new_cdp_session(pg)
    cdp.send('Network.enable')
    mbps, rtt = NETS[net]
    cdp.send('Network.emulateNetworkConditions', {'offline': False, 'latency': rtt, 'downloadThroughput': mbps * 1e6 / 8, 'uploadThroughput': mbps * 1e6 / 16})
    if cpu > 1: cdp.send('Emulation.setCPUThrottlingRate', {'rate': cpu})
    bytes_ = {}
    reqs = {}
    cdp.on('Network.responseReceived', lambda e: reqs.__setitem__(e['requestId'], (e['response']['url'].split('/')[-1][:40], e['response'].get('fromDiskCache'), e['response'].get('fromServiceWorker'), e['response']['status'])))
    cdp.on('Network.loadingFinished', lambda e: bytes_.__setitem__(e['requestId'], e['encodedDataLength']))
    pg.add_init_script(MOC)
    t0 = time.time()
    pg.goto(URL, wait_until='commit', timeout=300000)
    pg.wait_for_function('window.__m && __m.manChao != null', timeout=300000, polling=50)
    pg.wait_for_timeout(150)
    pg.mouse.click(422, 120)
    try: pg.wait_for_function('__m.lang != null', timeout=30000, polling=50)
    except Exception: pass
    pg.wait_for_function('__m.xongSau != null', timeout=400000, polling=200)
    pg.wait_for_timeout(1500)
    m = pg.evaluate('() => __m')
    ft = m.pop('ft'); m['khung_trong_luc_tai_sau'] = None
    if m.get('batDauSau') is not None:
        # khoảng cách khung trong thời gian đang tải ảnh sau (người chơi đã ở làng)
        pass
    m['so_khung'] = len(ft); m['khung_max_ms'] = max(ft) if ft else None
    m['khung_tren_50ms'] = sum(1 for x in ft if x > 50); m['khung_tren_100ms'] = sum(1 for x in ft if x > 100)
    lt = m.get('lt') or []
    m['longtask_sau_lang'] = [x for x in lt if m.get('lang') and x[0] > m['lang']][:30]
    m['longtask_tong_ms_sau_lang'] = sum(x[1] for x in lt if m.get('lang') and x[0] > m['lang'])
    m.pop('lt', None)
    m['byte_mang'] = sum(bytes_.values())
    m['yeu_cau'] = [list(reqs[k]) + [bytes_.get(k)] for k in reqs]
    m['loi'] = errs[:10]
    m['dong_ho_s'] = round(time.time() - t0, 1)
    ctx.close()
    return m


def main():
    kq = {}
    with sync_playwright() as pw:
        for net in NETS:
            for cpu in (4,):
                udir = tempfile.mkdtemp(prefix='lk-prof-')
                a = mot(pw, net, cpu, udir); print(net, 'cpu', cpu, 'lan1', json.dumps({k: v for k, v in a.items() if k != 'yeu_cau'}, ensure_ascii=False), flush=True)
                b = mot(pw, net, cpu, udir); print(net, 'cpu', cpu, 'lan2', json.dumps({k: v for k, v in b.items() if k != 'yeu_cau'}, ensure_ascii=False), flush=True)
                kq[net + ' cpu' + str(cpu)] = {'lan1': a, 'lan2': b}
                shutil.rmtree(udir, ignore_errors=True)
        udir = tempfile.mkdtemp(prefix='lk-prof-')
        a = mot(pw, '4G 9Mbps/170ms', 1, udir); print('4G cpu1 lan1', json.dumps({k: v for k, v in a.items() if k != 'yeu_cau'}, ensure_ascii=False), flush=True)
        kq['4G 9Mbps/170ms cpu1'] = {'lan1': a}
        shutil.rmtree(udir, ignore_errors=True)
    json.dump(kq, open(RA, 'w'), ensure_ascii=False, indent=1)


main()
