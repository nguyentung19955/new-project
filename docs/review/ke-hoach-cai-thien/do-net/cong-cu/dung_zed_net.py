"""DỰNG LẠI ẢNH TẤM CU TÍ (zed-moi, zed-rung, zed-bien, zed-lau) cho NÉT — chỉ thay ẢNH, giữ nguyên mọi số trong tệp.
Chạy lại chính docs/anh-goc/zed/dung-zed-game.py (cùng khung nguồn, cùng tỉ lệ co từng hàng, cùng chỗ đặt từng khung, cùng hàng nắm tay)
nhưng KHÔNG ghi tệp: bắt lại các tấm ảnh nó dựng. Chỉ khác một chỗ: phép thu nhỏ ảnh AI (Image.BOX = lấy trung bình, làm nhoè + viền
alpha lửng) đổi sang thu_net.thu (lấy màu theo ô, alpha 0/255, viền tối 1 điểm ảnh). Rồi giảm màu chung cho cả tấm (thu_net.giam_mau).
Phần dong_tac (neo, eo, nắm tay, cầm chuẩn…) của tệp game GIỮ NGUYÊN từng ký tự (các phiên khác đã sửa tay sau lần dựng).
  python3 dung_zed_net.py --kiem     dựng bằng BOX như cũ, so với ảnh đang có trong game (phải khớp → chứng minh cùng hình học)
  python3 dung_zed_net.py [--ghi]    dựng NÉT; không --ghi: chỉ lưu ảnh xem vào ra/; --ghi: ghi ảnh mới vào game/art/custom/<mã>.sprite.json
                                     (ảnh cũ giữ ở game/art/custom/<mã>-netcu.sprite.json, mục "net_cua", chỉ tải khi ?netcu=1, như -muotcu)"""
import base64, importlib.util, io, json, os, re, sys
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import thu_net
thu_net.VIEN = 999  # Cu Tí: KHÔNG tô viền tối (ngón tay / cẳng tay nhỏ bị nuốt thành vệt đen, soát cầm vũ khí báo tay rời cán) — chỉ alpha 0/255 + màu có thật
REPO = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', '..'))
CUS = os.path.join(REPO, 'game', 'art', 'custom')
RA = os.path.join(HERE, 'ra'); os.makedirs(RA, exist_ok=True)
KIEM = '--kiem' in sys.argv
GHI = '--ghi' in sys.argv
MA = ['zed-moi', 'zed-rung', 'zed-bien', 'zed-lau']

_sp = importlib.util.spec_from_file_location('dzg', os.path.join(REPO, 'docs', 'anh-goc', 'zed', 'dung-zed-game.py'))
DZ = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(DZ)

BAT = {}
DZ.xem_truoc = lambda *a, **k: None
DZ.xem_cam_vk = lambda *a, **k: None
DZ.png_b64 = lambda im: im                    # giữ nguyên ảnh (không mã hoá)
DZ.ghi_tep = lambda ten, t: BAT.__setitem__(ten, t)

_resize = Image.Image.resize
DEM = {'net': 0, 'giu': 0}


def resize(self, size, resample=None, *a, **k):
    if not KIEM and resample == Image.BOX and self.mode in ('RGBA', 'L') and size[0] < self.width * 0.6:
        DEM['net'] += 1
        if self.mode == 'L':
            return _resize(self, size, resample, *a, **k)  # mặt nạ (lớp ngón nam_chuoi.lop96): giữ như cũ, ngưỡng 0,5 ở nơi gọi
        r = Image.fromarray(thu_net.thu(np.asarray(self), size[0], size[1]))
        r._src = self; r._co = tuple(size)
        r._bb = _resize(self, size, resample, *a, **k).getbbox()  # khung bao như BOX → phép dời "tràn ô" y hệt lần dựng cũ (neo khớp)
        return r
    DEM['giu'] += 1
    return _resize(self, size, resample, *a, **k)


Image.Image.resize = resize
_getbbox = Image.Image.getbbox
Image.Image.getbbox = lambda self, *a, **k: self.__dict__['_bb'] if '_bb' in self.__dict__ else _getbbox(self, *a, **k)

# ---- ghi lại cách ghép (để dựng bản TO ×1,2 đúng cùng chỗ): mảnh co từ ảnh nào, dán ở đâu trong ô, ô nào của tấm ----
_paste, _ac, _crop, _fa = Image.Image.paste, Image.Image.alpha_composite, Image.Image.crop, Image.fromarray
REG = {}


def paste(self, im, box=None, mask=None):
    if hasattr(im, '_src') and box is not None and len(box) == 2:
        self.__dict__.setdefault('_ghep', []).append((im._src, im._co, tuple(box)))
    return _paste(self, im, box, mask)


def alpha_composite(self, im, dest=(0, 0), source=(0, 0)):
    g = getattr(im, '_ghep', None) or getattr(im, '_lop', None)
    if g is not None and im.width == DZ.O:
        self.__dict__.setdefault('_rec', []).append(('lop' if hasattr(im, '_lop') else 'ghep', g, tuple(dest)))
    return _ac(self, im, dest, source)


def crop(self, box=None):
    r = _crop(self, box)
    if hasattr(self, '_rec') and box and box[0] == 0 and box[1] == 0:
        r._rec = self._rec
    return r


def fromarray(a, *x, **k):
    r = _fa(a, *x, **k)
    if id(a) in REG:
        r._lop = REG.pop(id(a))
    return r


Image.Image.paste, Image.Image.alpha_composite, Image.Image.crop, Image.fromarray = paste, alpha_composite, crop, fromarray
_lop96 = DZ.NC.lop96


def lop96(than96, mat_na, nw, nh, dx, dy, O=96):
    r = _lop96(than96, mat_na, nw, nh, dx, dy, O)
    REG[id(r)] = (list(getattr(than96, '_ghep', [])), mat_na, nw, nh, dx, dy)
    return r


DZ.NC.lop96 = lop96
SO_MAU = 64  # màu chung mỗi tấm (thường và to riêng)
K_TO, O_TO, COT_TO = 1.2, 116, 16   # bản to: ×1,2 (= ?cotiTo mặc định), ô 116 (≥ 96 × 1,2), xếp 16 ô một hàng (chỉ các ô có hình)


def dung_to(tam):
    """dựng các ô dùng tới ở cỡ ×1,2 từ ẢNH GỐC (không phóng ảnh đã co): mỗi mảnh co lại từ đầu với cỡ round(nw×1,2), dán ở round(dx×1,2)."""
    o = {}

    def ve_ghep(cell, ghep):
        for src, (nw, nh), (dx, dy) in ghep:
            W2, H2 = max(1, round(nw * K_TO)), max(1, round(nh * K_TO))
            m = thu_net.thu(np.asarray(src), W2, H2)
            x0, y0 = round(dx * K_TO), round(dy * K_TO)
            xa, ya, xb, yb = max(0, x0), max(0, y0), min(O_TO, x0 + W2), min(O_TO, y0 + H2)
            if xb <= xa or yb <= ya:
                continue
            sub = m[ya - y0:yb - y0, xa - x0:xb - x0]
            dac = sub[..., 3] > 0
            reg = cell[ya:yb, xa:xb]; reg[dac] = sub[dac]
        return cell
    for kieu, g, (X, Y) in tam._rec:
        key = (X // DZ.O, Y // DZ.O)
        cell = o.setdefault(key, np.zeros((O_TO, O_TO, 4), np.uint8))
        if kieu == 'ghep':
            ve_ghep(cell, g)
        else:
            ghep, mat_na, nw, nh, dx, dy = g
            t = ve_ghep(np.zeros((O_TO, O_TO, 4), np.uint8), ghep)
            W2, H2 = max(1, round(nw * K_TO)), max(1, round(nh * K_TO))
            mk = _resize(Image.fromarray((mat_na * 255).astype(np.uint8)), (W2, H2), Image.BOX)
            mm = Image.new('L', (O_TO, O_TO), 0); _paste(mm, mk, (round(dx * K_TO), round(dy * K_TO)))
            t[np.asarray(mm) < 128] = 0
            dac = t[..., 3] > 0; cell[dac] = t[dac]
    ds = sorted(k for k, v in o.items() if v[..., 3].any())
    n = len(ds)
    hang = (n + COT_TO - 1) // COT_TO
    big = np.zeros((hang * O_TO, COT_TO * O_TO, 4), np.uint8)
    for j, k in enumerate(ds):
        big[(j // COT_TO) * O_TO:(j // COT_TO + 1) * O_TO, (j % COT_TO) * O_TO:(j % COT_TO + 1) * O_TO] = o[k]
    cot = tam.width // DZ.O
    bang = [-1] * (cot * (tam.height // DZ.O))
    for j, (c, r) in enumerate(ds):
        bang[r * cot + c] = j
    return thu_net.giam_mau(big, SO_MAU), {'k': K_TO, 'o': O_TO, 'cot': COT_TO, 'cot_goc': cot, 'o_cua': bang}


def doc_tam(ma):
    d = json.load(open(os.path.join(CUS, ma + '.sprite.json'), encoding='utf-8'))
    return d, Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',', 1)[1]))).convert('RGBA')


def main():
    DZ.main()
    kq = {}
    for ma in MA:
        d, cu = doc_tam(ma)
        moi = BAT[ma]['tam']
        a, b = np.asarray(cu), np.asarray(moi.convert('RGBA'))
        if a.shape != b.shape:
            print(ma, 'KHÁC CỠ', a.shape, b.shape); kq[ma] = 'khác cỡ'; continue
        ma_a, ma_b = a[..., 3] > 0, b[..., 3] > 0
        iou = (ma_a & ma_b).sum() / max(1, (ma_a | ma_b).sum())
        sai = np.abs(a.astype(int) - b.astype(int))[ma_a & ma_b].mean() if (ma_a & ma_b).any() else 0
        if BAT[ma]['dong_tac'] != d['dong_tac']:
            khac = set()
            def so(x, y, duong):
                if isinstance(x, dict) and isinstance(y, dict):
                    for k in set(x) | set(y): so(x.get(k), y.get(k), duong + '/' + str(k))
                elif x != y: khac.add(re.sub(r'/[^/]*$', '', duong) + ' :' + duong.split('/')[-1])
            so(BAT[ma]['dong_tac'], d['dong_tac'], '')
            print('  dong_tac khác ở:', sorted({k.split(':')[-1] for k in khac}), len(khac))
        ma_c = a[..., 3] >= 128
        iou2 = (ma_c & ma_b).sum() / max(1, (ma_c | ma_b).sum())
        kq[ma] = {'iou_alpha_128': round(float(iou2), 4), 'iou_alpha': round(float(iou), 4), 'sai_mau_tb': round(float(sai), 2), 'dong_tac_trung': BAT[ma]['dong_tac'] == d['dong_tac']}
        print(ma, kq[ma])
        if not KIEM:
            to, meta = dung_to(BAT[ma]['tam'])
            moi = thu_net.giam_mau(np.asarray(moi.convert('RGBA')), SO_MAU)
            _fa(moi).save(os.path.join(RA, ma + '-net.png'))
            _fa(to).save(os.path.join(RA, ma + '-to.png'))
            print('  bản to %s: %d ô, %d×%d, %d KB (bản thường %d KB)' % (ma, sum(1 for v in meta['o_cua'] if v >= 0), to.shape[1], to.shape[0],
                  len(thu_net.png_bang_mau(to)) // 1024, len(thu_net.png_bang_mau(moi)) // 1024))
            if GHI:
                ghi(ma, d, moi, to, meta)
    print('thu nhỏ nét: %d lần, giữ phép cũ: %d lần' % (DEM['net'], DEM['giu']))


def ghi(ma, d, moi, to, meta):
    p = os.path.join(CUS, ma + '.sprite.json')
    pc = os.path.join(CUS, ma + '-netcu.sprite.json')
    if not os.path.exists(pc):  # tấm cũ (một lần): cùng nội dung, mã riêng, chỉ tải khi ?netcu=1 (js/sprite_custom.js)
        cu = dict(d); cu['ma'] = ma + '-netcu'; cu['net_cua'] = ma
        with open(pc, 'w', encoding='utf-8') as f:
            json.dump(cu, f, ensure_ascii=False, separators=(',', ':'))
    d2 = dict(d)
    d2['tam'] = 'data:image/png;base64,' + base64.b64encode(thu_net.png_bang_mau(moi)).decode()
    d2['tam_to'] = 'data:image/png;base64,' + base64.b64encode(thu_net.png_bang_mau(to)).decode()
    d2['to'] = meta
    d2['net_moi'] = 'do-net 17/10: ảnh dựng lại bằng docs/review/ke-hoach-cai-thien/do-net/cong-cu/dung_zed_net.py (lấy màu theo ô, không trung bình)'
    with open(p, 'w', encoding='utf-8') as f:
        json.dump(d2, f, ensure_ascii=False, separators=(',', ':'))
    print('  ghi', p)


main()
