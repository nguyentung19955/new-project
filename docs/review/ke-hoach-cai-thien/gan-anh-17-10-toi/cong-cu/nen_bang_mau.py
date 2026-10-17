"""NÉN KHÔNG MẤT (17/10 tối): ghi lại các ảnh PNG bảng màu trong game/art/custom/*.sprite.json bằng do-net/cong-cu/thu_net.png_bang_mau
(bảng màu xếp theo độ sáng, nén zlib mức cao nhất) khi nhỏ hơn — ĐIỂM ẢNH Y HỆT (giải mã lại so từng điểm, khác thì bỏ qua).
Chỉ các ảnh có trong bản một tệp ("tam", "anh"; không đụng bản nét cao). Tệp có "net_cao_cua" (mã băm chuỗi tam/anh mà bản nét cao dựng theo):
nếu khớp chuỗi cũ thì tính lại theo chuỗi mới (ảnh y hệt nên bản nét cao vẫn đúng).
Chạy (từ gốc repo):  python3 docs/review/ke-hoach-cai-thien/gan-anh-17-10-toi/cong-cu/nen_bang_mau.py [--ghi]"""
import base64, hashlib, io, json, os, sys
import numpy as np
from PIL import Image
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'docs/review/ke-hoach-cai-thien/do-net/cong-cu'))
import thu_net as TN  # noqa: E402
D = os.path.join(ROOT, 'game/art/custom')
GHI = '--ghi' in sys.argv
tong = 0
for f in sorted(os.listdir(D)):
    if not f.endswith('.sprite.json'):
        continue
    p = os.path.join(D, f)
    t = json.load(open(p, encoding='utf-8'))
    if t.get('muot_cua') or t.get('net_cua') or t.get('san_cua'):
        continue
    doi = False
    for k in ('tam', 'anh'):
        s = t.get(k)
        if not isinstance(s, str) or not s.startswith('data:image/png;base64,') or len(s) < 20000:
            continue
        raw = base64.b64decode(s.split(',', 1)[1])
        a = np.array(Image.open(io.BytesIO(raw)).convert('RGBA'))
        if len(np.unique(a.reshape(-1, 4).view(np.uint32))) > 256:
            continue
        png = TN.png_bang_mau(a)
        if len(png) >= len(raw):
            continue
        b = np.array(Image.open(io.BytesIO(png)).convert('RGBA'))
        if b.shape != a.shape or not (np.array_equal(b, a) or np.array_equal(b[a[..., 3] > 0], a[a[..., 3] > 0]) and not b[a[..., 3] == 0][:, 3].any()):
            print('  khác điểm ảnh, bỏ qua:', f, k)
            continue
        moi = 'data:image/png;base64,' + base64.b64encode(png).decode()
        if t.get('net_cao_cua') == hashlib.sha256(s.encode()).hexdigest()[:12]:
            t['net_cao_cua'] = hashlib.sha256(moi.encode()).hexdigest()[:12]
        tong += len(s) - len(moi)
        print('%-40s %-4s %7d → %7d byte (base64)' % (f, k, len(s), len(moi)))
        t[k] = moi; doi = True
    if doi and GHI:
        json.dump(t, open(p, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('Tổng bớt: %.1f KB' % (tong / 1024), '(đã ghi)' if GHI else '(chưa ghi — thêm --ghi)')
