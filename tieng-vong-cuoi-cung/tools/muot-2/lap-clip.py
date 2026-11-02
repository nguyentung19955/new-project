#!/usr/bin/env python3
"""MƯỢT MỨC 2 – lắp khung ChatGPT vẽ (art/muot-2/<tên>/moi-NN.png, thay-NN.png) vào clip gốc.
Chạy:  python3 tools/muot-2/lap-clip.py <tên> [thư mục ảnh xem NGOÀI repo] [--thu]   (--thu = chỉ kiểm, không ghi)
Việc làm (theo docs/yeu-cau-anh/muot-2/NNN-<tên>.md):
  1. kiểm ảnh mới: đúng cỡ ô gốc, RGBA, có hình, không chạm mép;
  2. căn ĐÁY (chỉ dời nguyên điểm ảnh theo chiều dọc, không vẽ lại) cho clip đứng đất: đáy khung mới = đáy khung gốc liền kề;
     đo lệch ngang tâm thân so với khung kề (báo, không tự sửa nếu ≤ 6 px);
  3. lưu khung gốc bị thay vào art/muot-2/<tên>/cu-fNN.png; đánh số lại fNN.png trong thư mục clip;
  4. cập nhật so_hinh, ms, khung sự kiện trong nhan-vat.json / quai.json (giữ kiểu trình bày gốc);
  5. Kiếm Khách: lớp sức mạnh kiểu "khung" có thư mục clip → khung mới dùng lại ảnh lớp ChatGPT của khung gốc gần nhất,
     dời theo điểm neo đo (do-neo.py) – không vẽ gì mới; sau đó chạy lại do-neo.py;
  6. ảnh ghép trước/sau + GIF vào thư mục xem.
"""
import sys, os, json, shutil, importlib.util
import numpy as np
from PIL import Image, ImageDraw

GOC = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ghi_json import dump

NV = 'game/thu-mat-na/nhan-vat.json'; QJ = 'game/thu-mat-na/quai.json'
CAP = ['cap/0', 'cap/1', 'cap/2']

def kk(clip): return {'json': NV, 'dir': 'art/kiem-khach/' + clip, 'kk': True}
def q(l, st): return {'json': QJ, 'dir': 'art/quai-moi/%s/%s' % (l, st), 'loai': l, 'st': st}

def dich(lst, tu, n=1):
    """dời chỉ số khung >= tu thêm n"""
    return [x + n if x >= tu else x for x in lst]

# ---- cấu hình từng yêu cầu ---------------------------------------------------------------------------------
# thu_tu: số = khung gốc fNN, chuỗi = ảnh mới trong art/muot-2/<tên>/
# sua(d): sửa dữ liệu JSON (d = nhan-vat.json hoặc quai.json đã nạp)
def _kkcap(d, ten):
    return [c['clip'][ten] for c in d['cap']]

def s_don4(d):
    for c in _kkcap(d, 'don4'):
        c['so_hinh'] = 11; c['ms'] = [60, 65, 50, 40, 33, 33, 50, 33, 55, 60, 80]; c['trung'] = [6, 7, 8, 9]; c['lao'] = [2, 8, c['lao'][2]]
def s_dapdat(d):
    c = d['clip']['dapdat']; c['so_hinh'] = 15; c['ms'] = [55, 55, 45, 45, 33, 45, 45, 45, 50, 55, 55, 55, 55, 70, 80]; c['trung'] = [5, 6, 7, 8, 9]
def s_chemkhong(d):
    for c in _kkcap(d, 'chemkhong'): c['so_hinh'] = 8; c['ms'] = [50, 50, 45, 33, 50, 50, 65, 70]; c['trung'] = [2, 3, 4, 5]
def s_chemkhong2(d):
    for c in _kkcap(d, 'chemkhong'): c['so_hinh'] = 9; c['ms'] = [50, 50, 45, 33, 45, 33, 50, 65, 70]; c['trung'] = [2, 3, 4, 5, 6]
def s_chet(d):
    c = d['clip']['chet']; c['so_hinh'] = 8; c['ms'] = [50, 67, 67, 67, 83, 100, 100, 200]
def s_luot(d):
    c = d['clip']['luot']; c['so_hinh'] = 8; c['ms'] = [33, 33, 50, 50, 50, 33, 50, 67]
def s_tiepdat(d):
    c = d['clip']['tiepdat']; c['so_hinh'] = 4; c['ms'] = [33, 50, 50, 67]
def s_trungdon(d): pass
def qh(d, l, st): return d['loai'][l]['hinh'][st]
def s_bo_chet(d): c = qh(d, 'bo', 'chet'); c['ms'] = [60, 65, 70, 80, 90, 90, 100, 120, 180]
def s_doi_chet(d): c = qh(d, 'doi', 'chet'); c['so_hinh'] = 11; c['ms'] = [67, 67, 67, 67, 67, 50, 50, 50, 67, 83, 150]
def s_nam_chet(d): c = qh(d, 'nam', 'chet'); c['so_hinh'] = 10; c['ms'] = [83, 83, 83, 100, 100, 117, 100, 117, 117, 100]
def s_nam_danh(d): c = qh(d, 'nam', 'danh'); c['ms'] = [120, 100, 100, 67, 50, 67, 83, 100, 100]
def s_chuong_di(d): c = qh(d, 'chuong', 'di'); c['so_hinh'] = 10; c['ms'] = 110
def s_chuong_danh(d):
    L = d['loai']['chuong']; c = L['hinh']['danh']; c['so_hinh'] = 10; c['ms'] = [100, 100, 100, 90, 80, 60, 50, 80, 100, 120]
    L['khung_trung'] = [5, 6, 7]; L['fx_danh']['ms'] = [100, 100, 100, 90, 80, 110, 80, 100, 120]
def s_cau_danh(d): c = qh(d, 'cau', 'danh'); c['ms'] = [67, 83, 100, 67, 50, 50, 67, 83, 100]
def s_tan_di(d): c = qh(d, 'tan', 'di'); c['ms'] = 117
def s_tan_danh(d):
    L = d['loai']['tan']; c = L['hinh']['danh']; c['so_hinh'] = 10; c['ms'] = [133, 117, 100, 83, 50, 33, 67, 100, 117, 133]
    L['khung_trung'] = [6, 7]; L['chieu']['chan_dong'] = 6
def s_vai_chet(d): c = qh(d, 'vai', 'chet'); c['so_hinh'] = 10; c['ms'] = [90, 90, 85, 85, 80, 80, 80, 80, 110, 160]
def s_ken_danh(d):
    L = d['loai']['ken']; c = L['hinh']['danh']; c['so_hinh'] = 10; c['ms'] = [67, 83, 100, 83, 67, 67, 50, 50, 83, 100]; L['chieu']['khung_ban'] = 7
def s_tang_chet(d): c = qh(d, 'tang', 'chet'); c['so_hinh'] = 11; c['ms'] = [67, 67, 67, 83, 50, 50, 100, 117, 117, 133, 133]
def s_tang_danh(d):
    L = d['loai']['tang']; c = L['hinh']['danh']; c['so_hinh'] = 10; c['ms'] = [100, 100, 100, 83, 67, 50, 50, 33, 83, 117]; L['khung_trung'] = [6, 7, 8, 9]
def s_chuong_chet(d): c = qh(d, 'chuong', 'chet'); c['so_hinh'] = 10; c['ms'] = [100, 100, 90, 90, 85, 85, 75, 60, 110, 180]
def s_cau_chet(d): c = qh(d, 'cau', 'chet'); c['so_hinh'] = 10; c['ms'] = [67, 67, 67, 83, 83, 83, 67, 100, 117, 150]
def s_ken_chet(d): c = qh(d, 'ken', 'chet'); c['so_hinh'] = 10; c['ms'] = [67, 67, 67, 83, 83, 83, 67, 100, 117, 150]
def s_phu_chet(d): c = qh(d, 'phu', 'chet'); c['ms'] = [83, 83, 83, 100, 100, 117, 117, 117, 100]

CFG = {
 'kk-don4':      dict(kk('don4'), so_goc=9, thu_tu=[0, 1, 2, 3, 4, 'moi-01', 5, 'moi-02', 6, 7, 8], sua=s_don4, day=True),
 'kk-dapdat':    dict(kk('dapdat'), so_goc=14, thu_tu=[0, 1, 2, 3, 'moi-01'] + list(range(4, 14)), sua=s_dapdat, day=True),
 'kk-chemkhong': dict(kk('chemkhong'), so_goc=7, thu_tu=[0, 1, 2, 'moi-01', 3, 4, 5, 6], sua=s_chemkhong, day=False),
 'kk-chemkhong-2': dict(kk('chemkhong'), so_goc=8, thu_tu=[0, 1, 2, 3, 4, 'moi-01', 5, 6, 7], sua=s_chemkhong2, day=False, sau='kk-chemkhong'),
 'kk-chet':      dict(kk('chet'), so_goc=7, thu_tu=[0, 1, 2, 'thay-03', 'moi-01', 4, 5, 6], sua=s_chet, day=True),
 'kk-luot':      dict(kk('luot'), so_goc=6, thu_tu=[0, 1, 2, 3, 4, 'moi-01', 'moi-02', 5], sua=s_luot, day=True),
 'kk-tiepdat':   dict(kk('tiepdat'), so_goc=3, thu_tu=[0, 1, 'moi-01', 2], sua=s_tiepdat, day=True),
 'kk-trungdon':  dict(kk('trungdon'), so_goc=6, thu_tu=[0, 1, 'thay-02', 3, 'thay-04', 5], sua=s_trungdon, day=True),
 'bo-chet':      dict(q('bo', 'chet'), so_goc=9, thu_tu=['thay-%02d' % i for i in range(9)], sua=s_bo_chet, day=True, ke=('art/quai-moi/bo/trung', 0)),
 'doi-chet':     dict(q('doi', 'chet'), so_goc=9, thu_tu=[0, 1, 2, 3, 4, 5, 6, 'moi-01', 'moi-02', 7, 8], sua=s_doi_chet, day=False),
 'nam-chet':     dict(q('nam', 'chet'), so_goc=9, thu_tu=[0, 1, 2, 3, 4, 5, 'moi-01', 6, 7, 8], sua=s_nam_chet, day=True),
 'nam-danh':     dict(q('nam', 'danh'), so_goc=9, thu_tu=[0, 1, 2, 'thay-03', 'thay-04', 'thay-05', 'thay-06', 'thay-07', 8], sua=s_nam_danh, day=True),
 'chuong-di':    dict(q('chuong', 'di'), so_goc=9, thu_tu=list(range(9)) + ['moi-01'], sua=s_chuong_di, day=False),
 'chuong-danh':  dict(q('chuong', 'danh'), so_goc=9, thu_tu=[0, 1, 2, 3, 4, 5, 'moi-01', 6, 7, 8], sua=s_chuong_danh, day=False),
 'cau-danh':     dict(q('cau', 'danh'), so_goc=9, thu_tu=[0, 1, 2, 'thay-03', 4, 5, 6, 'thay-07', 8], sua=s_cau_danh, day=True),
 'tan-di':       dict(q('tan', 'di'), so_goc=9, thu_tu=['thay-00'] + list(range(1, 9)), sua=s_tan_di, day=True),
 'tan-danh':     dict(q('tan', 'danh'), so_goc=9, thu_tu=[0, 1, 2, 3, 4, 'moi-01', 5, 6, 7, 8], sua=s_tan_danh, day=True),
 'vai-chet':     dict(q('vai', 'chet'), so_goc=9, thu_tu=[0, 1, 2, 3, 4, 5, 6, 'moi-01', 7, 8], sua=s_vai_chet, day=False),
 'ken-danh':     dict(q('ken', 'danh'), so_goc=9, thu_tu=[0, 1, 2, 3, 4, 5, 'moi-01', 6, 7, 8], sua=s_ken_danh, day=True),
 'tang-chet':    dict(q('tang', 'chet'), so_goc=9, thu_tu=[0, 1, 2, 3, 'moi-01', 'moi-02', 4, 5, 6, 7, 8], sua=s_tang_chet, day=False),
 'tang-danh':    dict(q('tang', 'danh'), so_goc=9, thu_tu=[0, 1, 2, 3, 4, 5, 6, 'moi-01', 7, 8], sua=s_tang_danh, day=False),
 'chuong-chet':  dict(q('chuong', 'chet'), so_goc=9, thu_tu=[0, 1, 2, 3, 4, 5, 6, 'moi-01', 7, 8], sua=s_chuong_chet, day=False),
 'cau-chet':     dict(q('cau', 'chet'), so_goc=9, thu_tu=[0, 1, 2, 3, 4, 5, 'moi-01', 6, 7, 8], sua=s_cau_chet, day=True),
 'ken-chet':     dict(q('ken', 'chet'), so_goc=9, thu_tu=[0, 1, 2, 3, 4, 5, 'moi-01', 6, 7, 8], sua=s_ken_chet, day=True),
 'phu-chet':     dict(q('phu', 'chet'), so_goc=9, thu_tu=[0, 1, 2, 3, 4, 5, 6, 'thay-07', 8], sua=s_phu_chet, day=True),
}

def P(*a): return os.path.join(GOC, *a)
def nap(p): return Image.open(p).convert('RGBA')
def day(im, kkm=False):
    A = np.array(im).astype(int); a = A[..., 3] > 128
    if kkm: a = a & ~((A[..., 2] > A[..., 0] + 40) & (A[..., 1] > A[..., 0] + 20))   # bỏ vệt chém cyan
    ys = np.nonzero(a.any(1))[0]; return int(ys.max()) if len(ys) else None

def bang_mau(dir_cha):
    """bảng màu gốc = mọi màu đặc trong các khung fNN.png của nhân vật/quái (thư mục cha của clip)"""
    import glob
    S = set()
    for f in glob.glob(os.path.join(dir_cha, '*', 'f*.png')):
        a = np.array(Image.open(f).convert('RGBA')); S |= set(map(tuple, a[a[..., 3] > 0][:, :3]))
    return np.array(sorted(S), dtype=int)

def chuan_mau(im, pal):
    """đưa ảnh ChatGPT về đúng bảng màu gốc (mỗi điểm lấy màu gốc gần nhất), bỏ viền hồng magenta còn sót, alpha 0/255.
    Không vẽ thêm, không nội suy – chỉ chọn lại màu trong bảng có sẵn."""
    a = np.array(im).astype(int); op = a[..., 3] >= 128
    hong = op & (a[..., 0] > a[..., 1] + 50) & (a[..., 2] > a[..., 1] + 50) & (a[..., 0] > 120)
    op &= ~hong
    px = a[op][:, :3]
    d = ((px[:, None, :] - pal[None, :, :]) ** 2).sum(-1)
    o = np.zeros_like(a); o[op, :3] = pal[d.argmin(1)]; o[op, 3] = 255
    return Image.fromarray(o.astype(np.uint8), 'RGBA'), int(hong.sum()), len(np.unique(px, axis=0))

def tam_than(im, kkm):
    a = np.array(im).astype(int); op = a[..., 3] > 128
    if kkm:
        r, g, b = a[..., 0], a[..., 1], a[..., 2]
        cyan = (b > r + 40) & (g > r + 20); kem = op & (r > 170) & (g > 150) & (b > 120) & (r - b < 70)
        m = op & ~cyan & ~kem
        if m.sum() > 30: op = m
    ys, xs = np.nonzero(op); return float(xs.mean()) if len(xs) else None

def doi(im, dx, dy):
    if not dx and not dy: return im
    o = Image.new('RGBA', im.size, (0, 0, 0, 0)); o.paste(im, (dx, dy)); return o

def sheet(ims, nhan, out, s=3):
    bb = None
    for im in ims:
        b = im.getbbox()
        if b: bb = b if bb is None else (min(bb[0], b[0]), min(bb[1], b[1]), max(bb[2], b[2]), max(bb[3], b[3]))
    bb = (max(0, bb[0] - 3), max(0, bb[1] - 3), bb[2] + 3, bb[3] + 3); w, h = bb[2] - bb[0], bb[3] - bb[1]
    S = Image.new('RGBA', ((w * s + 4) * len(ims), h * s + 14), (34, 36, 48, 255)); dr = ImageDraw.Draw(S)
    for i, im in enumerate(ims):
        S.alpha_composite(im.crop(bb).resize((w * s, h * s), Image.NEAREST), (i * (w * s + 4), 12))
        dr.text((i * (w * s + 4) + 2, 0), nhan[i], fill=(255, 230, 0, 255) if not nhan[i].startswith('F') else (200, 200, 200, 255))
    S.save(out)
    return bb

def gif(ims, ms, out, bb, s=3):
    fr = []
    for im in ims:
        c = Image.new('RGBA', im.size, (34, 36, 48, 255)); c.alpha_composite(im); fr.append(c.crop(bb).resize(((bb[2] - bb[0]) * s, (bb[3] - bb[1]) * s), Image.NEAREST).convert('P', palette=Image.ADAPTIVE))
    fr[0].save(out, save_all=True, append_images=fr[1:], duration=ms, loop=0)

def lop_kk(clip, thu_tu, moi_im, goc_im, thu):
    """lớp sức mạnh kiểu khung: dùng lại ảnh lớp của khung gốc gần nhất, dời theo điểm neo"""
    spec = importlib.util.spec_from_file_location('do_neo', P('tools/suc-manh/do-neo.py'))
    src = open(P('tools/suc-manh/do-neo.py')).read()
    src = src[:src.index('\nfor c in CLIP')]   # chỉ lấy hàm đo
    ns = {'__file__': P('tools/suc-manh/do-neo.py')}; sys_argv = sys.argv; sys.argv = ['x', '/tmp/_muot2_neo']
    try: exec(compile(src, 'do-neo', 'exec'), ns)
    finally: sys.argv = sys_argv
    tb = json.load(open(P('game/thu-mat-na/trang-bi.json')))
    bao = []
    for lid, L in tb['lop'].items():
        if L.get('kieu') != 'khung': continue
        d = P('art/kiem-khach-lop', lid, clip)
        if not os.path.isdir(d): continue
        diem = 'nguc' if L.get('khe') == 'an' else 'mat_na'
        lopg = [nap(os.path.join(d, 'f%02d.png' % i)) for i in range(len(goc_im))]
        lopb = [open(os.path.join(d, 'f%02d.png' % i), 'rb').read() for i in range(len(goc_im))]
        moi = []
        for j, t in enumerate(thu_tu):
            if isinstance(t, int): moi.append(lopg[t]); continue
            # khung gốc gần nhất (đứng trước, nếu không có thì sau)
            # khung gốc kề (trước/sau) giống dáng nhất (IoU cao nhất)
            kt = next((thu_tu[i] for i in range(j - 1, -1, -1) if isinstance(thu_tu[i], int)), None)
            ks = next((thu_tu[i] for i in range(j + 1, len(thu_tu)) if isinstance(thu_tu[i], int)), None)
            def iou(x, y):
                A = np.array(x)[..., 3] > 128; B = np.array(y)[..., 3] > 128; return (A & B).sum() / max(1, (A | B).sum())
            ung = [k_ for k_ in (kt, ks) if k_ is not None]
            ung.sort(key=lambda k_: -iou(goc_im[k_], moi_im[t]))
            pb = ns['do_khung'](moi_im[t]).get(diem)
            k = ung[0]
            for k_ in ung:
                if ns['do_khung'](goc_im[k_]).get(diem) and lopg[k_].getbbox(): k = k_; break
            pa = ns['do_khung'](goc_im[k]).get(diem)
            if not pa or not pb or lopg[k].getbbox() is None:
                moi.append(Image.new('RGBA', (256, 256), (0, 0, 0, 0))); bao.append('%s %s: ẩn lớp (không đo được neo)' % (lid, t)); continue
            moi.append(doi(lopg[k], pb[0] - pa[0], pb[1] - pa[1])); bao.append('%s %s: lớp từ F%d dời (%d,%d)' % (lid, t, k, pb[0] - pa[0], pb[1] - pa[1]))
        if not thu:
            for j, im in enumerate(moi):
                if isinstance(thu_tu[j], int): open(os.path.join(d, 'f%02d.png' % j), 'wb').write(lopb[thu_tu[j]])
                else: im.save(os.path.join(d, 'f%02d.png' % j), optimize=True)
    return bao

def main():
    a = [x for x in sys.argv[1:] if not x.startswith('--')]; thu = '--thu' in sys.argv
    ten = a[0]; xem = a[1] if len(a) > 1 else '/tmp/muot-2-xem'; os.makedirs(xem, exist_ok=True)
    c = CFG[ten]; dclip = P(c['dir']); dmoi = P('art/muot-2', ten)
    goc_f = sorted(f for f in os.listdir(dclip) if f.startswith('f') and f.endswith('.png'))
    if len(goc_f) != c['so_goc']:
        if len(goc_f) == len(c['thu_tu']) and os.path.exists(os.path.join(dmoi, 'DA-LAP.txt')): sys.exit('ĐÃ LẮP rồi (%s) – bỏ qua' % ten)
        sys.exit('LỖI: thư mục clip có %d khung, cần %d (đúng trạng thái trước khi lắp)' % (len(goc_f), c['so_goc']))
    goc = [nap(os.path.join(dclip, f)) for f in goc_f]; W, H = goc[0].size
    goc_bytes = [open(os.path.join(dclip, f), 'rb').read() for f in goc_f]
    moi = {}; loi = []
    for t in c['thu_tu']:
        if isinstance(t, int): continue
        p = os.path.join(dmoi, t + '.png')
        if not os.path.exists(p): loi.append('thiếu ' + t + '.png'); continue
        im = nap(p)
        if im.size != (W, H): loi.append('%s cỡ %s ≠ ô gốc %dx%d' % (t, im.size, W, H)); continue
        bb = im.getbbox()
        if not bb: loi.append(t + ' trống'); continue
        al = np.array(im)[..., 3] > 20
        if al[0].any() or al[-1].any() or al[:, 0].any() or al[:, -1].any():
            loi.append(t + ' chạm mép ô (bị cắt?)')
        moi[t] = im
    if loi: print('KHÔNG LẮP ĐƯỢC:', '; '.join(loi)); sys.exit(2)
    # đưa về bảng màu gốc
    bao = []
    pal = bang_mau(os.path.dirname(dclip))
    for t in list(moi):
        moi[t], nh_, nm_ = chuan_mau(moi[t], pal)
        bao.append('%s: %d màu → bảng màu gốc %d màu; bỏ %d điểm viền hồng' % (t, nm_, len(pal), nh_))
    # căn đáy + đo lệch thân
    kkm = bool(c.get('kk'))
    for j, t in enumerate(c['thu_tu']):
        if isinstance(t, int): continue
        ke = [x for x in (c['thu_tu'][j - 1] if j else None, c['thu_tu'][j + 1] if j + 1 < len(c['thu_tu']) else None) if isinstance(x, int)]
        if not ke and c.get('ke'): kim = [nap(P(c['ke'][0], 'f%02d.png' % c['ke'][1]))]
        else: kim = [goc[k] for k in ke]
        im = moi[t]; dy = 0
        if c.get('day') and kim:
            muc = round(np.mean([day(x, kkm) for x in kim])); dy = muc - day(im, kkm)
        tx = [tam_than(x, kkm) for x in kim]; tm = tam_than(im, kkm)
        dx_bao = (np.mean(tx) - tm) if tx and tm is not None else 0
        if abs(dy) > 12: loi.append('%s đáy lệch %d px so với khung kề – sai cỡ/sai chỗ' % (t, dy))
        h0 = im.getbbox(); hk = [x.getbbox() for x in kim]
        if hk and not ten.endswith('chet') and t.startswith('moi'):
            ch = np.mean([b[3] - b[1] for b in hk]); cw = np.mean([b[2] - b[0] for b in hk])
            if (h0[3] - h0[1]) > ch * 1.45 or (h0[3] - h0[1]) < ch * 0.55: loi.append('%s cao %d px, khung kề ~%d – sai cỡ' % (t, h0[3] - h0[1], ch))
        moi[t] = doi(im, 0, dy)
        bao.append('%s: dời đáy %+d px; tâm thân lệch %+.1f px so với khung kề' % (t, dy, dx_bao))
    for b in bao: print('  ' + b)
    if loi: print('KHÔNG LẮP ĐƯỢC:', '; '.join(loi)); sys.exit(3)
    seq = [goc[t] if isinstance(t, int) else moi[t] for t in c['thu_tu']]
    nh = ['F%d' % t if isinstance(t, int) else t for t in c['thu_tu']]
    bb = sheet(goc, ['F%d' % i for i in range(len(goc))], os.path.join(xem, ten + '-truoc.png'))
    bb2 = sheet(seq, nh, os.path.join(xem, ten + '-sau.png'))
    # JSON
    jp = P(c['json']); s = open(jp).read(); d = json.loads(s); c['sua'](d)
    ms = None
    if c.get('kk'):
        # tìm def clip (clip hoặc cap) để lấy ms
        cl = c['dir'].split('/')[-1]
        df = d['clip'].get(cl) or next((cc['clip'][cl] for cc in d['cap'] if cl in cc['clip']), None)
        if df is None:
            df = next(v for v in d['clip'].values() if v.get('thu_muc') == cl)
        ms = df['ms']
    else:
        ms = d['loai'][c['loai']]['hinh'][c['st']]['ms']
    msl = ms if isinstance(ms, list) else [ms] * len(seq)
    assert len(msl) == len(seq), 'ms %d ≠ số khung %d' % (len(msl), len(seq))
    gif(seq, msl, os.path.join(xem, ten + '-sau.gif'), bb2)
    gif(goc, (msl[:len(goc)] if False else [100] * len(goc)), os.path.join(xem, ten + '-truoc.gif'), bb)
    if thu: print('THỬ (không ghi). Xem:', xem); return
    # ghi
    for t in c['thu_tu']:
        if isinstance(t, str) and t.startswith('thay-'):
            k = int(t[5:]); shutil.copy(os.path.join(dclip, 'f%02d.png' % k), os.path.join(dmoi, 'cu-f%02d.png' % k))
    if c.get('kk'):
        for b in lop_kk(c['dir'].split('/')[-1], c['thu_tu'], moi, goc, thu): print('  lớp: ' + b)
    for j, t in enumerate(c['thu_tu']):
        if isinstance(t, int): open(os.path.join(dclip, 'f%02d.png' % j), 'wb').write(goc_bytes[t])   # khung gốc: chép nguyên byte
        else: moi[t].save(os.path.join(dclip, 'f%02d.png' % j), optimize=True)
    open(jp, 'w').write(dump(s, d))
    open(os.path.join(dmoi, 'DA-LAP.txt'), 'w').write('Đã lắp vào %s: %s\n' % (c['dir'], ' '.join(nh)))
    if c.get('kk'):
        os.system('python3 "%s" /tmp/_muot2_neo >/dev/null' % P('tools/suc-manh/do-neo.py'))
    print('ĐÃ LẮP %s: %d → %d khung. Xem %s' % (ten, len(goc), len(seq), xem))

if __name__ == '__main__':
    main()
