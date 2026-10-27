"""Chụp ảnh + quay video 60 fps trang thu-lam-moi.html (Chromium headless, bước game điều khiển tay – ?tu=0).
Mỗi hình video = đúng 1 bước game (1/60 s). Kết quả → ../xem-thu/
Chạy:  python3 game/thu-lam-moi/cong-cu/quay.py      (cần playwright + Chromium, ffmpeg)"""
import os
import sys
import json
import time
import shutil
import subprocess
import threading
import functools
import http.server
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
TRANG = os.path.normpath(os.path.join(HERE, '..'))
GOC = os.path.normpath(os.path.join(TRANG, '..', '..'))          # thư mục tieng-vong-cuoi-cung
RA = os.path.join(TRANG, 'xem-thu')
TAM = os.path.join('/tmp', 'thu-lam-moi-khung')


def server():
    class Im(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    h = functools.partial(Im, directory=GOC)
    s = http.server.ThreadingHTTPServer(('127.0.0.1', 0), h)
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s


def mo(page, port, q):
    page.goto(f'http://127.0.0.1:{port}/game/thu-lam-moi/thu-lam-moi.html?tu=0&{q}')
    page.wait_for_function('window.TLM && (window.TLM.san_sang || window.TLM.loi)', timeout=60000)
    loi = page.evaluate('window.TLM.loi || null')
    if loi:
        raise SystemExit('trang lỗi: ' + loi)


def nhap(page, l=False, r=False, chem=False):
    page.evaluate(f'(() => {{ const I = window.TLM.IN; I.l = {str(l).lower()}; I.r = {str(r).lower()}; '
                  f'if ({str(chem).lower()} && !I.chem) I.chemMoi = true; I.chem = {str(chem).lower()}; }})()')


def buoc(page, n=1):
    page.evaluate(f'window.TLM.buoc({n})')


def dat_x(page, xs):
    page.evaluate(f'(() => {{ const L = window.TLM.LAMS; {json.dumps(xs)}.forEach((x, i) => {{ if (L[i]) L[i].x = x; }}); }})()')


def chup(page, path):
    page.locator('canvas').screenshot(path=path)


def anh_tinh(page, port):
    """ảnh 960×540: đứng, chạy, chém, so cũ/mới, bản xám, tắt vệt sáng."""
    def kich_ban(q, ten, viec, xam=True):
        mo(page, port, q)
        viec()
        chup(page, os.path.join(RA, ten + '.png'))
        if xam:
            mo(page, port, q + '&xam=1')
            viec()
            chup(page, os.path.join(RA, ten + '-xam.png'))

    def dung():
        buoc(page, 250)                              # đang nghiêng đầu nghe (giây 3,5–5,7)

    def chay():
        nhap(page, r=True); buoc(page, 40); nhap(page, l=True); buoc(page, 49)

    def chem():
        nhap(page, chem=True); buoc(page, 1); nhap(page); buoc(page, 12)   # atkT 13: đang trúng
    kich_ban('hud=0', 'dung', dung)
    kich_ban('hud=0', 'chay', chay)
    kich_ban('hud=0', 'chem', chem)
    kich_ban('hud=0&debug=1', 'chem-hop-don', chem, xam=False)
    kich_ban('hud=0&rim=0', 'dung-khong-vet-sang', dung)
    kich_ban('hud=0&so=1', 'so-cu-moi-dung', dung)
    kich_ban('hud=0&so=1', 'so-cu-moi-chay', chay)
    kich_ban('hud=0&so=1', 'so-cu-moi-chem', chem)
    mo(page, port, '')                               # có nút + chữ như khi chơi
    buoc(page, 30)
    chup(page, os.path.join(RA, 'man-choi-co-nut.png'))


def video(page, port, q, ten, kich):
    shutil.rmtree(TAM, ignore_errors=True)
    os.makedirs(TAM)
    mo(page, port, q)
    i = 0
    for (l, r, chem, n) in kich:
        for _ in range(n):
            nhap(page, l, r, chem)
            buoc(page, 1)
            chup(page, os.path.join(TAM, f'{i:05d}.png'))
            i += 1
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '60', '-i', os.path.join(TAM, '%05d.png'),
                    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-r', '60', os.path.join(RA, ten)], check=True)
    return i


def main():
    os.makedirs(RA, exist_ok=True)
    s = server()
    port = s.server_address[1]
    so = {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        page = b.new_page(viewport={'width': 960, 'height': 540}, device_scale_factor=1)
        loi = []
        page.on('pageerror', lambda e: loi.append(str(e)))
        t0 = time.time()
        anh_tinh(page, port)
        # đứng nghe 6 s (360 bước)
        so['dung-nghe-60fps.mp4'] = video(page, port, 'hud=0', 'dung-nghe-60fps.mp4', [(False, False, False, 360)])
        # chạy qua lại: tăng tốc, nhả (giảm tốc), chạy tiếp, đổi hướng, chạm mép, dừng
        chay = [(False, False, False, 20), (False, True, False, 70), (False, False, False, 14), (False, True, False, 40),
                (False, False, False, 6), (False, True, False, 30), (True, False, False, 110), (False, False, False, 10),
                (True, False, False, 30), (False, True, False, 60), (False, False, False, 40)]
        so['chay-qua-lai-60fps.mp4'] = video(page, port, 'hud=0', 'chay-qua-lai-60fps.mp4', chay)
        # chém 3 lần (đứng chém, chạy rồi chém, chém quay trái)
        chem = [(False, False, False, 20), (False, False, True, 1), (False, False, False, 45),
                (False, True, False, 30), (False, True, True, 1), (False, False, False, 45),
                (True, False, True, 1), (False, False, False, 50)]
        so['chem-3-lan-60fps.mp4'] = video(page, port, 'hud=0', 'chem-3-lan-60fps.mp4', chem)
        so['chem-3-lan-hop-don-60fps.mp4'] = video(page, port, 'hud=0&debug=1', 'chem-3-lan-hop-don-60fps.mp4', chem)
        so['so-cu-moi-60fps.mp4'] = video(page, port, 'hud=0&so=1', 'so-cu-moi-60fps.mp4',
                                          [(False, False, False, 120)] + chay[1:] + chem)
        # đo thời gian vẽ 1 khung (máy chủ, không GPU) – chỉ để tham khảo
        mo(page, port, 'hud=0&so=1')
        ms = page.evaluate('(() => { const t = performance.now(); for (let i = 0; i < 300; i++) window.TLM.buoc(1); return (performance.now() - t) / 300; })()')
        b.close()
    so['ms_moi_buoc_ve_2_lam_chromium_headless'] = round(ms, 3)
    so['loi_trang'] = loi
    so['thoi_gian_quay_s'] = round(time.time() - t0, 1)
    with open(os.path.join(RA, 'so-do.json'), 'w', encoding='utf-8') as f:
        json.dump(so, f, ensure_ascii=False, indent=1)
    print(so)
    shutil.rmtree(TAM, ignore_errors=True)


if __name__ == '__main__':
    main()
