"""Đo thời gian tải (sửa từ docs/review/kiem-thu-12-10/tai.py cho phiên tải nhanh 12/10): lần đầu (không đệm) và lần 2 (cùng hồ sơ
trình duyệt: HTTP cache + service worker), mạng 4G và 3G chậm, CPU ×1 và ×4. Máy chủ HTTPS + HTTP/2 như Firebase (srv_h2.js).
Thêm so với bản gốc: "anh_dau" = lúc mọi hình màn chào / làng đã có (bản ảnh rời), "chamTre" = từ lúc chạm tới lúc vào làng.
python3 tai2.py <url> <ra.json> [mạng,...] [cpu,...] [may-chu]
  may-chu: KHÔNG dùng giả lập mạng của DevTools (nó không bóp các yêu cầu do service worker gửi đi, nên lần 1 tải ảnh nhanh giả tạo);
  url có thể chứa {mang} để chọn máy chủ đã bóp băng thông ở phía máy chủ (srv_h2.js với LK_MBPS, LK_RTT), ví dụ https://localhost:845{mang}/"""
import json, os, sys, time, tempfile, shutil
from playwright.sync_api import sync_playwright

URL = sys.argv[1]; RA = sys.argv[2]
MANG = sys.argv[3].split(',') if len(sys.argv) > 3 else ['4G', '3G']
CPUS = [int(x) for x in sys.argv[4].split(',')] if len(sys.argv) > 4 else [1, 4]
MAY_CHU = len(sys.argv) > 5 and sys.argv[5] == 'may-chu'
# Chứng chỉ tự ký: tin theo mã khoá (LK_SPKI = base64 sha256 của khoá công khai) để trình duyệt LƯU ĐỆM như với chứng chỉ thật
# (bỏ qua lỗi chứng chỉ kiểu --ignore-certificate-errors thì Chrome không lưu đệm gì, lần 2 không khác lần 1).
SPKI = os.environ.get('LK_SPKI', '')
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
    if (m.anhDau == null && SC.roi) { let du = true; for (const it of SC.roi.ds.values()) if (it.bac === 0 && !it.ve) { du = false; break; } if (du) m.anhDau = t; }
  }, 10);
  const loop = (ts) => { if (last) m.ft.push(+(ts - last).toFixed(1)); last = ts; requestAnimationFrame(loop); }; requestAnimationFrame(loop);
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) (m.lt = m.lt || []).push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({ type: 'longtask', buffered: true }); } catch (e) {}
})();"""

NETS = {'4G': (9, 170), '3G': (1.5, 300)}  # 4G 9 Mbps / trễ 170 ms; 3G chậm 1,5 Mbps / 300 ms (như tester 3)


def mot(pw, net, cpu, udir, sw=True):
    ctx = pw.chromium.launch_persistent_context(udir, ignore_https_errors=not SPKI, args=[('--ignore-certificate-errors-spki-list=' + SPKI) if SPKI else '--ignore-certificate-errors', '--host-resolver-rules=MAP fonts.googleapis.com 127.0.0.1:9, MAP fonts.gstatic.com 127.0.0.1:9'], viewport={'width': 844, 'height': 390}, device_scale_factor=3, is_mobile=True, has_touch=True,
                                                service_workers='allow' if sw else 'block')
    pg = ctx.pages[0] if ctx.pages else ctx.new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append('console.' + m.type + ': ' + m.text[:200]) if m.type in ('error', 'warning') else None)
    # KHÔNG dùng pg.route (Playwright tắt bộ nhớ đệm HTTP khi chặn yêu cầu, lần 2 sẽ tải lại hết); phông Google đã chặn bằng host-resolver-rules.
    cdp = ctx.new_cdp_session(pg)
    cdp.send('Network.enable')
    mbps, rtt = NETS[net]
    if not MAY_CHU: cdp.send('Network.emulateNetworkConditions', {'offline': False, 'latency': rtt, 'downloadThroughput': mbps * 1e6 / 8, 'uploadThroughput': mbps * 1e6 / 16})
    if cpu > 1: cdp.send('Emulation.setCPUThrottlingRate', {'rate': cpu})
    bytes_ = {}
    reqs = {}
    cdp.on('Network.responseReceived', lambda e: reqs.__setitem__(e['requestId'], (e['response']['url'].split('/')[-1][:40], e['response'].get('fromDiskCache'), e['response'].get('fromServiceWorker'), e['response']['status'])))
    cdp.on('Network.loadingFinished', lambda e: bytes_.__setitem__(e['requestId'], e['encodedDataLength']))
    pg.add_init_script(MOC)
    t0 = time.time()
    pg.goto(URL.replace('{mang}', {'4G': '1', '3G': '2'}[net]), wait_until='commit', timeout=300000)
    pg.wait_for_function('window.__m && __m.manChao != null', timeout=300000, polling=50)
    pg.wait_for_timeout(150)
    t_cham = pg.evaluate('() => Math.round(performance.now())')
    pg.mouse.click(422, 120)
    try: pg.wait_for_function('__m.lang != null', timeout=30000, polling=50)
    except Exception: pass
    pg.wait_for_function('__m.xongSau != null', timeout=400000, polling=200)
    pg.wait_for_timeout(1500)
    m = pg.evaluate('() => __m')
    m['cham'] = t_cham; m['chamTre'] = (m['lang'] - t_cham) if m.get('lang') else None
    m['sw'] = pg.evaluate('() => !!(navigator.serviceWorker && navigator.serviceWorker.controller)')
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
        for net in MANG:
            for cpu in CPUS:
                udir = tempfile.mkdtemp(prefix='lk-tai-')
                r = {}
                for lan in ('lan1', 'lan2'):
                    r[lan] = mot(pw, net, cpu, udir)
                    print(net, 'cpu', cpu, lan, json.dumps({k: v for k, v in r[lan].items() if k not in ('yeu_cau', 'longtask_sau_lang')}, ensure_ascii=False), flush=True)
                kq['%s cpu%d' % (net, cpu)] = r
                shutil.rmtree(udir, ignore_errors=True)
    json.dump(kq, open(RA, 'w'), ensure_ascii=False, indent=1)


main()
