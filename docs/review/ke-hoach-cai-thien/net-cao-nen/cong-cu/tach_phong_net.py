"""NÉT CAO — NỀN (17/10): cắt lại một lô của tools/tach-phong (chạy trong Chromium không màn hình) ở độ nét N = 2/3/4.
Trang công cụ chỉ cho chọn net 1/2 (4 cho biểu tượng), nên chạy BẢN CHÉP TẠM của trang với hàm NET() trả N (không sửa công cụ thật).
Cách cắt, chỗ đặt, cỡ ảnh (điểm game) y hệt; chỉ đổi số điểm ảnh ảnh. --net 2 --cach min = đúng như lần nhập vào game (để so).
  python3 tach_phong_net.py <mã lô> <ảnh gốc | git:<commit>:<đường dẫn>> --net N --cach min|net
Ảnh ra: ra/net<N>-<cach>/<mã>.png"""
import os, sys, json, base64, subprocess, time, shutil, tempfile, io
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', '..'))


def _arg(k, d):
    return sys.argv[sys.argv.index(k) + 1] if k in sys.argv else d


LO, ANH = sys.argv[1], sys.argv[2]
N = int(_arg('--net', '2')); CACH = _arg('--cach', 'net'); CONG = int(_arg('--cong', '8790'))
RA = os.path.join(HERE, 'ra', 'net%d-%s' % (N, CACH)); os.makedirs(RA, exist_ok=True)
tam = tempfile.mkdtemp()
try:
    os.makedirs(os.path.join(tam, 'tools'))
    shutil.copytree(os.path.join(REPO, 'tools', 'tach-phong'), os.path.join(tam, 'tools', 'tach-phong'))
    p = os.path.join(tam, 'tools', 'tach-phong', 'index.html')
    s = open(p, encoding='utf-8').read()
    cu = "const NET = () => {"
    assert cu in s
    s = s.replace(cu, "const NET = () => (window.__NET || 0) || (() => {")
    # đóng ngoặc thêm cho hàm bọc: tìm hết dòng
    i = s.index("const NET = () => (window.__NET || 0) || (() => {")
    j = s.index('\n', i)
    dong = s[i:j]
    assert dong.endswith('};'), dong
    s = s[:i] + dong[:-2] + '})();' + s[j:]
    open(p, 'w', encoding='utf-8').write(s)
    for k in ('game',):  # trang tách nạp js game (xem thử) bằng đường dẫn tương đối
        os.symlink(os.path.join(REPO, k), os.path.join(tam, k))
    if ANH.startswith('git:'):
        _, c, path = ANH.split(':', 2)
        b = subprocess.run(['git', '-C', REPO, 'show', c + ':' + path], capture_output=True, check=True).stdout
        anh = os.path.join(tam, 'goc.png'); open(anh, 'wb').write(b)
    else:
        anh = os.path.abspath(ANH)
    srv = subprocess.Popen(['python3', '-m', 'http.server', str(CONG)], cwd=tam, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
    try:
        with sync_playwright() as pw:
            b = pw.chromium.launch(); pg = b.new_page(viewport={'width': 1200, 'height': 1800}); loi = []
            pg.on('pageerror', lambda e: loi.append(str(e)))
            pg.add_init_script('window.__NET = %d;' % N)
            pg.goto('http://localhost:%d/tools/tach-phong/index.html' % CONG); pg.wait_for_timeout(1500)
            print(pg.evaluate("(id) => { const i = LO.findIndex((l) => l.id === id); const s = document.getElementById('chonLo'); s.value = i; s.dispatchEvent(new Event('change')); return LO[i].ten; }", LO))
            pg.wait_for_timeout(300)
            pg.evaluate("(v) => { const s = document.getElementById('doNet'); s.value = v; }", CACH)
            pg.set_input_files('#chonAnh', anh); pg.wait_for_timeout(4000)
            ds = pg.evaluate("() => L.ds.map((m, i) => KQ[i] ? Object.assign(phanTep(i, false), { _N: KQ[i].out.N }) : { ma: m.ma, thieu: true })")
            for t in ds:
                if t.get('thieu'):
                    print('  THIẾU', t['ma']); continue
                open(os.path.join(RA, t['ma'] + '.png'), 'wb').write(base64.b64decode(t['anh'].split(',')[1]))
                print('  %s %sx%s net %s' % (t['ma'], t['rong'], t['cao'], t.get('net')))
            print('lỗi trang', loi or 'không có'); b.close()
    finally:
        srv.kill()
finally:
    shutil.rmtree(tam, ignore_errors=True)
