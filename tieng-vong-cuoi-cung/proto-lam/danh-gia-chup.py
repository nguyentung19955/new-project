#!/usr/bin/env python3
"""Chụp dữ liệu THÔ từ proto.html để đánh giá lại pipeline 3D → pixel (không ghi đè out/run/*, out/idle/*).
Ghi vào proto-lam/out/danh-gia/raw/ :
  run-F-cuoi.png     khung 64×64 cuối cùng của pipeline hiện tại (phải trùng từng pixel out/run/run-F.png)
  run-F-id.npy       mặt nạ ID bộ phận 64×64 (sau hậu kỳ, đã lật)
  run-F-raw.npz      ci/id/dep 64×64 TRƯỚC hậu kỳ (chưa lật) – lấy bằng cách bọc lam.hauKy
  run-F-512.png      render toon mượt 512×512 (có AA) cùng camera/khung hình ô 64 (đã lật)
  run-F-512id.png    render ID 512×512 không AA (đã lật), kênh R = ID
  run-F-64thang.png  render toon 64×64 KHÔNG hậu kỳ, không siêu lấy mẫu (1 mẫu/px) – để so "render thẳng 64"
  idle-0-512.png, idle-0-cuoi.png  tương tự cho idle khung 0
Chạy: python3 proto-lam/danh-gia-chup.py
"""
import base64, json, os, sys, time, warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out', 'danh-gia', 'raw')
os.makedirs(OUT, exist_ok=True)
CAO = 44

JS = r"""
(cao) => {
  var THREE = window.THREE, PROTO = window.PROTO;
  function b64(arr) { var s = ''; for (var j = 0; j < arr.length; j += 8192) s += String.fromCharCode.apply(null, arr.subarray(j, j + 8192)); return btoa(s); }
  function b64f32(arr) { return b64(new Uint8Array(arr.buffer)); }
  var cv = document.createElement('canvas'); cv.width = 64; cv.height = 64;
  var R = new THREE.WebGLRenderer({ canvas: cv, antialias: false, alpha: true, preserveDrawingBuffer: true }); R.setPixelRatio(1); R.outputEncoding = THREE.LinearEncoding;
  var lam = PROTO.tao(THREE);
  // bọc hauKy để lấy ci/id/dep thô
  var raw = null, hk = lam.hauKy;
  lam.hauKy = function (ci, id, dep, n, cam, tuyR) { raw = { ci: b64(new Uint8Array(Int16Array.from(ci).buffer)), id: b64(Uint8Array.from(id)), dep: b64f32(Float32Array.from(dep)), n: n }; return hk(ci, id, dep, n, cam, tuyR); };
  // render mượt 512 + ID 512
  var cv2 = document.createElement('canvas'); cv2.width = 512; cv2.height = 512;
  var R2 = new THREE.WebGLRenderer({ canvas: cv2, antialias: true, alpha: true, preserveDrawingBuffer: true }); R2.setPixelRatio(1); R2.outputEncoding = THREE.LinearEncoding;
  var cv3 = document.createElement('canvas'); cv3.width = 512; cv3.height = 512;
  var R3 = new THREE.WebGLRenderer({ canvas: cv3, antialias: false, alpha: true, preserveDrawingBuffer: true }); R3.setPixelRatio(1); R3.outputEncoding = THREE.LinearEncoding;
  var cv4 = document.createElement('canvas'); cv4.width = 64; cv4.height = 64;
  var R4 = new THREE.WebGLRenderer({ canvas: cv4, antialias: false, alpha: true, preserveDrawingBuffer: true }); R4.setPixelRatio(1); R4.outputEncoding = THREE.LinearEncoding;
  function doiVL(id) { lam.meshes.forEach(function (m) { m.material = id ? m.userData.mi : m.userData.m; }); }
  function chupKhung(ten, i) {
    var f = lam.datKhung(ten, i), cam = lam.taoCamPx(cao);
    var r = lam.renderPixel(R, cao, {});
    R2.setClearColor(0x000000, 0); R2.clear(); R2.render(lam.scene, cam);
    doiVL(true); R3.setClearColor(0x000000, 0); R3.clear(); R3.render(lam.scene, cam); doiVL(false);
    R4.setClearColor(0x000000, 0); R4.clear(); R4.render(lam.scene, cam);
    return { ten: f.ten, t: f.t, px: b64(r.px), id: b64(r.id), pivot: r.pivot, raw: raw, muot: cv2.toDataURL('image/png'), id512: cv3.toDataURL('image/png'), thang64: cv4.toDataURL('image/png') };
  }
  var out = { run: [], idle: [], ID: PROTO.ID, HEX: PROTO.HEX };
  var K = lam.tinhAnim('run');
  for (var i = 0; i < K.frames.length; i++) out.run.push(chupKhung('run', i));
  lam.tinhAnim('idle');
  out.idle.push(chupKhung('idle', 0));
  return out;
}
"""


def chromium(fn):
    from playwright.sync_api import sync_playwright
    args = ['--use-angle=swiftshader', '--use-gl=angle', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl']
    with sync_playwright() as pw:
        kw = {'args': args}
        if os.path.isfile('/opt/pw-browsers/chromium'): kw['executable_path'] = '/opt/pw-browsers/chromium'
        br = pw.chromium.launch(**kw)
        try: return fn(br)
        finally: br.close()


def chay(br):
    page = br.new_page(); loi = []
    page.on('pageerror', lambda e: loi.append(str(e)))
    page.goto('file://' + os.path.join(HERE, 'proto.html'))
    page.wait_for_function('window.PROTO && window.THREE', timeout=30000)
    t0 = time.time()
    d = page.evaluate(JS, CAO)
    if loi: sys.exit('Lỗi JS: ' + '; '.join(loi))
    print('render %.1fs' % (time.time() - t0))
    return d


def dataurl(s):
    import io
    return Image.open(io.BytesIO(base64.b64decode(s.split(',', 1)[1]))).convert('RGBA')


def luu(ten, f):
    n = 64
    im = Image.frombytes('RGBA', (n, n), base64.b64decode(f['px'])); im.save(os.path.join(OUT, ten + '-cuoi.png'))
    idm = np.frombuffer(base64.b64decode(f['id']), dtype=np.uint8).reshape(n, n); np.save(os.path.join(OUT, ten + '-id.npy'), idm)
    r = f['raw']
    ci = np.frombuffer(base64.b64decode(r['ci']), dtype=np.int16).reshape(n, n)
    rid = np.frombuffer(base64.b64decode(r['id']), dtype=np.uint8).reshape(n, n)
    dep = np.frombuffer(base64.b64decode(r['dep']), dtype=np.float32).reshape(n, n)
    np.savez(os.path.join(OUT, ten + '-raw.npz'), ci=ci, id=rid, dep=dep)
    # ảnh 512 lật ngang (Lam nhìn phải) như khung 64
    dataurl(f['muot']).transpose(Image.FLIP_LEFT_RIGHT).save(os.path.join(OUT, ten + '-512.png'))
    dataurl(f['id512']).transpose(Image.FLIP_LEFT_RIGHT).save(os.path.join(OUT, ten + '-512id.png'))
    dataurl(f['thang64']).transpose(Image.FLIP_LEFT_RIGHT).save(os.path.join(OUT, ten + '-64thang.png'))


if __name__ == '__main__':
    d = chromium(chay)
    for i, f in enumerate(d['run']): luu('run-%d' % i, f)
    luu('idle-0', d['idle'][0])
    json.dump({'ID': d['ID'], 'HEX': d['HEX'], 'pivot': [f['pivot'] for f in d['run']]}, open(os.path.join(OUT, 'meta.json'), 'w'), indent=1, ensure_ascii=False)
    # kiểm trùng pixel với out/run
    for i in range(8):
        a = np.array(Image.open(os.path.join(OUT, 'run-%d-cuoi.png' % i)).convert('RGBA'))
        b = np.array(Image.open(os.path.join(HERE, 'out', 'run', 'run-%d.png' % i)).convert('RGBA'))
        print('run-%d trùng out/run: %s (%d px khác)' % (i, bool((a == b).all()), int((a != b).any(axis=2).sum())))
