#!/usr/bin/env python3
"""Kiểm một bản game ĐANG CHẠY trên web (phiên F1): dùng sau khi đăng, cho bản thử staging, và cho lượt kiểm 30 phút/lần.

  python3 tools/phat-hanh/kiem_web.py https://spiritblade.web.app [--commit <sha>] [--staging] [--cho 120] [--ra tom-tat.txt]

  --commit SHA   buildId trên web phải là của commit này (so 7 ký tự đầu)
  --staging      kênh thử: mở trang KHÔNG kèm ?cloud=0 và đòi game tự tắt lưu mây (chặn đụng dữ liệu thật)
  --cho N        nếu chưa khớp (máy chủ chưa kịp đổi bản) thì thử lại trong N giây
  --ra TỆP       ghi tóm tắt tiếng Việt (để gắn vào issue báo động)

Kiểm: trang trả HTTP 200; build-manifest.json đọc được, có buildId (và đúng commit nếu có --commit); vài ảnh quan trọng tải được;
mở headless thấy màn đầu vẽ được, không lỗi JS. Bản thật luôn mở với ?cloud=0 và chặn mọi yêu cầu tới Firebase/Google
(không tạo tài khoản khách, không đọc/ghi lưu mây). Thoát mã 1 khi có lỗi.
"""
import json
import os
import sys
import time
import urllib.request
from urllib.parse import urlparse

UA = {'User-Agent': 'talesworn-kiem-web/1.0', 'Cache-Control': 'no-cache'}


def lay(url, n=None):
    r = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30)
    return r.status, (r.read(n) if n else r.read())


def doi(argv, ten, mac=None):
    return argv[argv.index(ten) + 1] if ten in argv else mac


def kiem_http(goc, commit):
    loi, tin = [], {}
    try:
        st, body = lay(goc)
        if st != 200 or b'<canvas' not in body:
            loi.append('Trang chính trả mã %s hoặc không phải trang game' % st)
        tin['trang_byte'] = len(body)
    except Exception as e:  # noqa: BLE001
        loi.append('Không mở được trang: %s' % e)
        return loi, tin
    try:
        st, body = lay(goc + 'build-manifest.json?t=%d' % time.time())
        m = json.loads(body)
        tin['buildId'] = m.get('buildId', '')
        tin['commit'] = m.get('commit', '')
        if not tin['buildId']:
            loi.append('build-manifest.json không có buildId')
        if commit and not str(m.get('commit', '')).startswith(commit[:7]):
            loi.append('Web đang chạy bản %s (commit %s), chưa phải commit %s' % (tin['buildId'], str(m.get('commit', ''))[:7], commit[:7]))
        for a in (m.get('anh_quan_trong') or [])[:6]:
            try:
                st, b = lay(goc + a)
                if st != 200 or not b:
                    loi.append('Ảnh %s trả mã %s' % (a, st))
            except Exception as e:  # noqa: BLE001
                loi.append('Ảnh %s không tải được: %s' % (a, e))
        tin['so_anh_kiem'] = len((m.get('anh_quan_trong') or [])[:6])
    except Exception as e:  # noqa: BLE001
        loi.append('Không đọc được build-manifest.json: %s' % e)
    return loi, tin


def kiem_trinh_duyet(goc, staging):
    from playwright.sync_api import sync_playwright
    loi, tin = [], {}
    host = urlparse(goc).netloc
    with sync_playwright() as p:
        kenh = os.environ.get('LK_KENH') or None
        b = p.chromium.launch(channel=kenh) if kenh else p.chromium.launch()
        ctx = b.new_context(viewport={'width': 844, 'height': 390})

        def chan(route):
            u = urlparse(route.request.url)
            if u.netloc == host or u.netloc in ('fonts.googleapis.com', 'fonts.gstatic.com') or u.scheme in ('data', 'blob'):
                return route.continue_()
            return route.abort()
        ctx.route('**/*', chan)
        pg = ctx.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
        try:
            pg.goto(goc if staging else goc + '?cloud=0', wait_until='domcontentloaded', timeout=60000)
            pg.wait_for_function('window.G && G.scene', timeout=60000)
            so = 0
            han = time.time() + 30
            while time.time() < han:
                so = pg.evaluate("""() => { const c = document.createElement('canvas'); c.width = 120; c.height = 68; const x = c.getContext('2d');
                  for (const id of ['world', 'ui']) { const e = document.getElementById(id); if (e && e.width) x.drawImage(e, 0, 0, 120, 68); }
                  const d = x.getImageData(0, 0, 120, 68).data, m = new Set(); for (let i = 0; i < d.length; i += 4) m.add((d[i] >> 3) + ',' + (d[i + 1] >> 3) + ',' + (d[i + 2] >> 3)); return m.size; }""")
                if so >= 12:
                    break
                pg.wait_for_timeout(500)
            tin['mau'] = so
            if so < 12:
                loi.append('Mở bằng trình duyệt: màn đầu không vẽ được (%d màu)' % so)
            why = pg.evaluate("G.cloud ? G.cloud.why : ''")
            tin['cloud'] = why
            if staging:
                q = pg.evaluate('location.search')
                if why != 'off' or 'cloud=0' not in q:
                    loi.append('Bản thử staging KHÔNG tự tắt lưu mây (cloud=%s, địa chỉ %s) — có thể đụng dữ liệu thật' % (why, q))
        except Exception as e:  # noqa: BLE001
            loi.append('Mở bằng trình duyệt không được: %s' % str(e).splitlines()[0][:200])
        if errs:
            loi.append('Lỗi JS khi mở: ' + ' | '.join(errs[:2]))
        b.close()
    return loi, tin


def main():
    a = sys.argv[1:]
    goc = a[0].rstrip('/') + '/'
    commit = doi(a, '--commit')
    cho = int(doi(a, '--cho', '0'))
    ra = doi(a, '--ra')
    staging = '--staging' in a
    han = time.time() + cho
    while True:
        loi, tin = kiem_http(goc, commit)
        if not loi or time.time() >= han:
            break
        print('  chưa khớp, thử lại sau 15 giây: ' + loi[0], flush=True)
        time.sleep(15)
    if not any('Không mở được trang' in x for x in loi) and '--khong-trinh-duyet' not in a:
        l2, t2 = kiem_trinh_duyet(goc, staging)
        loi += l2
        tin.update(t2)
    dong = ['Kiểm %s lúc %s UTC' % (goc, time.strftime('%Y-%m-%d %H:%M')),
            'buildId trên web: %s (commit %s)' % (tin.get('buildId', '?'), str(tin.get('commit', ''))[:7])]
    dong += (['KẾT QUẢ: ĐẠT'] if not loi else ['KẾT QUẢ: CÓ LỖI'] + ['- ' + x for x in loi])
    print('\n'.join(dong))
    if ra:
        with open(ra, 'w', encoding='utf-8') as f:
            f.write('\n'.join(dong) + '\n')
    sys.exit(1 if loi else 0)


if __name__ == '__main__':
    main()
