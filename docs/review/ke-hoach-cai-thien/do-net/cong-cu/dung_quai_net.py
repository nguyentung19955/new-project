"""DỰNG LẠI ẢNH QUÁI BỊ NHOÈ (do-net 17/10) — chỉ thay ẢNH, giữ nguyên mọi số trong tệp (khung, gốc, căn tâm, động tác).
Các tấm quái dựng bằng quai-moi-*/cong-cu (thu nhỏ LANCZOS → pha màu ở mọi mép trong thân). Công cụ dựng cũ không chạy lại được (tấm -cu
đã xoá 15/10), nên làm NGƯỢC: với từng khung của tấm đang dùng, tìm khung ảnh gốc (docs/anh-goc/quai-moi/dong-tac/<mã>-<n>-<động tác>-cat/)
và tỉ lệ co + chỗ dán cho ra ĐÚNG khung đó (dựng lại bằng chính hàm thu cũ dung-quai-moi.thu, so mặt nạ đục, IoU ≥ 0,97). Khớp thì dựng lại khung
từ ảnh gốc ở đúng cỡ + chỗ đó bằng thu_net.thu (lấy màu có thật, không pha). Không khớp (hàng đã thay ảnh khác, khung ghép tay…) → giữ khung cũ.
  python3 dung_quai_net.py [mã,mã,…] [--ghi]     không --ghi: chỉ lưu ảnh xem + số đo vào ra/
--ghi: ghi ảnh mới vào game/art/custom/<mã>.sprite.json (mục "net_moi" ghi chú). Tấm cũ: lịch sử git (bản một tệp không giữ thêm)."""
import base64, glob, importlib.util, io, json, os, sys
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import thu_net
from chi_so import do as chi_so
REPO = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', '..'))
CUS = os.path.join(REPO, 'game', 'art', 'custom')
NGUON = os.path.join(REPO, 'docs', 'anh-goc', 'quai-moi', 'dong-tac')
RA = os.path.join(HERE, 'ra'); os.makedirs(RA, exist_ok=True)
_sp = importlib.util.spec_from_file_location('dqm', os.path.join(REPO, 'docs', 'review', 'ke-hoach-cai-thien', 'quai-moi-4-con', 'cong-cu', 'dung-quai-moi.py'))
DQ = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(DQ)
GHI = '--ghi' in sys.argv
ARGS = [a for a in sys.argv[1:] if not a.startswith('--')]
MAC_DINH = ['nhim', 'nhimDoc', 'haiQuy', 'caCon', 'caChuon', 'caNoc', 'tuongDa', 'sua', 'linhMa', 'denLong', 'huLua', 'huChua', 'hoaBaoTu', 'ongVo',
            'tieuYeu', 'oc', 'nhimThan', 'namChua', 'cua', 'cuaTuong', 'namPhong', 'doiThan', 'raiCa', 'boHung', 'namPhongChua', 'meoDen', 'diaTrau',
            'heoNanh', 'socNo', 'tuongMa', 'cocTia', 'chonBong', 'baBa', 'caNocChua', 'heoCon']
BUOC = {'idle': '1-dung', 'move': '2-di', 'tele': '3-bao-don', 'atk': '4-danh', 'hit': '5-trung-don', 'die': '6-chet'}
NGUONG = 0.97


def doc(ma):
    d = json.load(open(os.path.join(CUS, ma + '.sprite.json'), encoding='utf-8'))
    return d, np.array(Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',', 1)[1]))).convert('RGBA'))


def bb(m):
    ys, xs = np.nonzero(m)
    return (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1) if len(xs) else None


def khop(o_mask, a, flip):
    """tìm tỉ lệ z + chỗ dán (X, Y) để DQ.thu(a, z) trùng mặt nạ o_mask; trả (iou, z, X, Y, cỡ)"""
    if flip:
        a = a[:, ::-1]
    sb = bb(a[..., 3] > 128); ob = bb(o_mask)
    if sb is None or ob is None:
        return None
    z0 = (ob[3] - ob[1]) / max(1, sb[3] - sb[1])
    tot = None
    for z in z0 * (1 + np.linspace(-0.05, 0.05, 41)):
        t = DQ.thu(a, z); m = t[..., 3] > 0; tb = bb(m)
        if tb is None:
            continue
        if abs((tb[2] - tb[0]) - (ob[2] - ob[0])) > 1 or abs((tb[3] - tb[1]) - (ob[3] - ob[1])) > 1:
            continue
        for ddx in (-1, 0, 1):
            for ddy in (-1, 0, 1):
                X, Y = ob[0] - tb[0] + ddx, ob[1] - tb[1] + ddy
                big = np.zeros_like(o_mask)
                x0, y0, x1, y1 = max(0, X), max(0, Y), min(o_mask.shape[1], X + m.shape[1]), min(o_mask.shape[0], Y + m.shape[0])
                if x1 <= x0 or y1 <= y0:
                    continue
                big[y0:y1, x0:x1] = m[y0 - Y:y1 - Y, x0 - X:x1 - X]
                iou = (big & o_mask).sum() / max(1, (big | o_mask).sum())
                if tot is None or iou > tot[0]:
                    tot = (iou, z, X, Y, (t.shape[1], t.shape[0]), flip)
    return tot


def lam(ma):
    d, sh = doc(ma)
    n = d.get('net', 1); fw, fh = d['khung_rong'] * n, d['khung_cao'] * n
    moi = sh.copy()
    kq = {'khop': 0, 'tong': 0, 'giu': []}
    for ten, a_ in d['dong_tac'].items():
        if ten not in BUOC:
            continue
        g = glob.glob(os.path.join(NGUON, '%s-%s-cat' % (ma, BUOC[ten])))
        nguon = [np.array(Image.open(f).convert('RGBA')) for f in sorted(glob.glob(os.path.join(g[0], '*', 'khung-*.png')))] if g else []
        if ten == 'hit' and not nguon:
            continue
        for C in range(a_['so']):
            R = a_['hang']
            o = sh[R * fh:(R + 1) * fh, C * fw:(C + 1) * fw]
            om = o[..., 3] > 0
            if om.sum() < 30:
                continue
            kq['tong'] += 1
            tot = None
            # thử khung cùng cột trước, rồi các khung khác của hàng (khung lặp / đảo thứ tự)
            thu_tu = ([C] if C < len(nguon) else []) + [j for j in range(len(nguon)) if j != C]
            for j in thu_tu:
                for fl in (False, True):
                    r = khop(om, nguon[j], fl)
                    if r and (tot is None or r[0] > tot[0]):
                        tot = r + (j,)
                if tot and tot[0] >= 0.985:
                    break
            if not tot or tot[0] < NGUONG:
                kq['giu'].append('%s %d (%.3f)' % (ten, C + 1, tot[0] if tot else 0))
                continue
            iou, z, X, Y, (w, h), fl, j = tot
            a = nguon[j][:, ::-1] if fl else nguon[j]
            t = thu_net.thu(a, w, h)
            cell = np.zeros_like(o)
            x0, y0, x1, y1 = max(0, X), max(0, Y), min(fw, X + w), min(fh, Y + h)
            cell[y0:y1, x0:x1] = t[y0 - Y:y1 - Y, x0 - X:x1 - X]
            moi[R * fh:(R + 1) * fh, C * fw:(C + 1) * fw] = cell
            kq['khop'] += 1
    so_mau = len(np.unique(sh[sh[..., 3] > 0][:, :3].view(np.dtype((np.void, 3)))))
    moi = thu_net.giam_mau(moi, max(48, min(96, so_mau)))
    kq['truoc'] = chi_so(Image.fromarray(sh)); kq['sau'] = chi_so(Image.fromarray(moi))
    png = thu_net.png_bang_mau(moi)
    kq['kb_truoc'] = len(d['tam']) * 3 // 4 // 1024; kq['kb_sau'] = len(png) // 1024
    Image.fromarray(moi).save(os.path.join(RA, ma + '-net.png'))
    if GHI and kq['khop']:
        d['tam'] = 'data:image/png;base64,' + base64.b64encode(png).decode()
        d['net_moi'] = 'do-net 17/10: %d/%d khung dựng lại từ ảnh gốc bằng docs/review/ke-hoach-cai-thien/do-net/cong-cu/dung_quai_net.py' % (kq['khop'], kq['tong'])
        with open(os.path.join(CUS, ma + '.sprite.json'), 'w', encoding='utf-8') as f:
            json.dump(d, f, ensure_ascii=False, separators=(',', ':'))
    return kq


def ghi_ra(ds):
    """--ghi-ra: ghi các ảnh đã dựng ở lần chạy trước (ra/<mã>-net.png + ra/quai-net.json), không dựng lại."""
    tong = json.load(open(os.path.join(RA, 'quai-net.json')))
    for ma in ds:
        kq = tong.get(ma)
        if not kq or not kq['khop']:
            continue
        d, sh = doc(ma)
        moi = np.array(Image.open(os.path.join(RA, ma + '-net.png')).convert('RGBA'))
        assert moi.shape == sh.shape, ma
        d['tam'] = 'data:image/png;base64,' + base64.b64encode(thu_net.png_bang_mau(moi)).decode()
        d['net_moi'] = 'do-net 17/10: %d/%d khung dựng lại từ ảnh gốc bằng docs/review/ke-hoach-cai-thien/do-net/cong-cu/dung_quai_net.py' % (kq['khop'], kq['tong'])
        with open(os.path.join(CUS, ma + '.sprite.json'), 'w', encoding='utf-8') as f:
            json.dump(d, f, ensure_ascii=False, separators=(',', ':'))
        print('ghi', ma)


if __name__ == '__main__' and '--ghi-ra' in sys.argv:
    ghi_ra(ARGS[0].split(',') if ARGS else MAC_DINH)
    sys.exit(0)

if __name__ == '__main__':
    ds = ARGS[0].split(',') if ARGS else MAC_DINH
    tong = {}
    p = os.path.join(RA, 'quai-net.json')
    if os.path.exists(p):
        tong = json.load(open(p))
    for ma in ds:
        kq = lam(ma)
        kq = json.loads(json.dumps(kq, default=float))
        tong[ma] = kq
        print('%-14s khớp %2d/%2d  NHOE %.1f → %.1f  %d→%d KB  giữ: %s' % (ma, kq['khop'], kq['tong'], kq['truoc']['NHOE'], kq['sau']['NHOE'], kq['kb_truoc'], kq['kb_sau'], ', '.join(kq['giu'][:6])), flush=True)
        json.dump(tong, open(p, 'w'), ensure_ascii=False, indent=1)
