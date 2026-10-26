"""Đo thu-boss.html trên Chromium headless (Playwright): cách A (mảnh) và B (sheet), máy bàn + giả lập iPhone.
Mỗi lần đo: trình duyệt MỚI (bộ nhớ sạch), mở ?cach=X&tu=1, chờ trận xong (2 vòng), đọc window.KQ,
đo RAM thật của cả cây tiến trình Chromium (psutil, RSS) sau khi nạp và lúc xong. Kết quả → so-do.json.
Chạy: python3 do-thu-boss.py   (từ thư mục bất kỳ; tự mở máy chủ tĩnh ở thư mục tieng-vong-cuoi-cung/)"""
import json, os, sys, threading, time, functools, http.server, socketserver
import psutil
from playwright.sync_api import sync_playwright

GOC = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PORT = 8765


def may_chu():
    class Im(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    h = functools.partial(Im, directory=GOC)
    socketserver.TCPServer.allow_reuse_address = True
    s = socketserver.ThreadingTCPServer(('127.0.0.1', PORT), h)
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s


def ram_chromium():
    me = psutil.Process()
    tong = 0
    for p in me.children(recursive=True):
        try:
            tong += p.memory_info().rss
        except psutil.Error:
            pass
    return tong


def do_mot(pw, cach, cauhinh, so=False):
    br = pw.chromium.launch()
    ctx = br.new_context(**cauhinh['ctx'])
    pg = ctx.new_page()
    if cauhinh.get('cpu'):
        cdp = ctx.new_cdp_session(pg)
        cdp.send('Emulation.setCPUThrottlingRate', {'rate': cauhinh['cpu']})
    ram0 = ram_chromium()
    url = f'http://127.0.0.1:{PORT}/game/thu-boss/thu-boss.html?cach={cach}&tu=1&vong=2' + ('&so=1' if so else '')
    pg.goto(url)
    pg.wait_for_function('window.KQ && window.KQ.anh', timeout=180000)
    ram_nap = ram_chromium()
    pg.wait_for_function('window.KQ.xong' + (' && window.KQ.ssXong' if so else ''), timeout=600000)
    ram_xong = ram_chromium()
    kq = pg.evaluate('JSON.parse(JSON.stringify(window.KQ,(k,v)=>k==="map"?undefined:v))')
    kq['ram_chromium_truoc'] = ram0
    kq['ram_chromium_sau_nap'] = ram_nap
    kq['ram_chromium_luc_xong'] = ram_xong
    if not so:
        pg.screenshot(path=os.path.join(os.path.dirname(__file__), f'chup-{cauhinh["ten"]}-{cach}.png'))
    else:
        pg.screenshot(path=os.path.join(os.path.dirname(__file__), f'chup-so-diem-anh-{cach}.png'))
    br.close()
    return kq


def main():
    s = may_chu()
    out = {'ghi_chu': 'Chromium headless (Playwright, GPU phần mềm). iPhone = chỉ giả lập cỡ màn/dpr/UA + CPU chậm 4×; '
                      'KHÔNG phải đo trên iPhone thật.', 'ket_qua': []}
    with sync_playwright() as pw:
        ip = pw.devices['iPhone 13 landscape']
        cauhinh = [
            {'ten': 'may-ban', 'ctx': {'viewport': {'width': 1280, 'height': 720}, 'device_scale_factor': 1}},
            {'ten': 'gia-lap-iphone13-cpu4x', 'ctx': dict(ip), 'cpu': 4},
        ]
        for ch in cauhinh:
            for cach in ('0', 'A', 'A2', 'B'):
                t = time.time()
                kq = do_mot(pw, cach, ch)
                kq['cau_hinh'] = ch['ten']
                out['ket_qua'].append(kq)
                print(ch['ten'], cach, f'{time.time() - t:.0f}s', 'nạp', round(kq['msNap']), 'ms; vẽ TB/p95/max',
                      [round(kq['ve'][k], 2) for k in ('tb', 'p95', 'max')], 'giật', kq['giat'], 'khi đổi', kq['giatKhiDoi'],
                      'RAM', round(kq['ram_chromium_sau_nap'] / 2**20), 'MB', flush=True)
        out['so_diem_anh'] = {}
        for cach in ('A', 'A2'):
            kq = do_mot(pw, cach, cauhinh[0], so=True)
            out['so_diem_anh'][cach] = kq.get('ss')
            print('so điểm ảnh', cach, json.dumps(kq.get('ss'), ensure_ascii=False)[:300], flush=True)
    s.shutdown()
    with open(os.path.join(os.path.dirname(__file__), 'so-do.json'), 'w') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
