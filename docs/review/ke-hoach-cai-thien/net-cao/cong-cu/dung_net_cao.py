"""DỰNG BẢN ẢNH NÉT CAO CHO CU TÍ (bộ ninja, zed-moi) — thử nghiệm ?netcao=3 / ?netcao=4 (net-cao/bao-cao.md).

Bản to ×1,2 hiện có ("tam_to" + "to", do-net 17/10) dựng bằng do-net/cong-cu/dung_zed_net.py → dung_to(): mỗi ô 96 của tấm dựng lại TỪ
ẢNH GỐC ở cỡ ×k (k = 1,2), cùng mảnh, cùng chỗ dán, thu nhỏ kiểu nét (thu_net: một màu có thật mỗi điểm, alpha 0/255). Ở đây chạy LẠI
ĐÚNG đường đó (không viết lại): chỉ đổi k:
    nét 3: k = 1,2 × 3 / 2 = 1,8 (ô 173)       nét 4: k = 1,2 × 4 / 2 = 2,4 (ô 231)
  - hàng thường: docs/anh-goc/zed/dung-zed-game.py (qua dung_zed_net, chụp cách ghép từng ô);
  - 3 hàng kiếm nặng (kiem_1~kn … kiem_3~kn + nắm tay): docs/anh-goc/zed/dung-kiem-nang.py hàm dung() (hai lượt góc như main(), KHÔNG ghi gì).
Chỉ ghi THÊM vào game/art/custom/zed-moi.sprite.json: "tam_n3", "to_n3", "tam_n4", "to_n4" (mọi trường khác giữ nguyên từng ký tự).
Ô nào dựng: các ô game thật sự vẽ (ra/o-dung.json của o_dung.py) — ô khác thiếu thì game lấy bản to ×1,2 (đúng chỗ, kém nét).
Kiểm trước khi ghi: dựng lại ở k = 1,2 rồi so với "tam_to" đang có (mặt nạ trùng ≥ 99 % mỗi ô) → chứng minh cùng hình học.
  python3 dung_net_cao.py           dựng + kiểm, lưu ảnh xem vào ra/
  python3 dung_net_cao.py --ghi     … và ghi vào tệp game
"""
import base64, importlib.util, io, json, math, os, sys
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', '..'))
TEP = os.path.join(REPO, 'game', 'art', 'custom', 'zed-moi.sprite.json')
RA = os.path.join(HERE, 'ra'); os.makedirs(RA, exist_ok=True)
GHI = '--ghi' in sys.argv
COT = 16
HANG_THEM = {5, 98, 99, 100, 101, 112, 113, 114, 115, 124}  # chet; nắm tay dung~16_*, chay~16_*; nắm tay kiem_1~kn
SO_MAU = 64

# nạp dung-kiem-nang.py (nó tự nạp dung_zed_net.py → vá Image.resize/paste… + dung-zed-game.py), KHÔNG chạy main()
_sp = importlib.util.spec_from_file_location('kn', os.path.join(REPO, 'docs', 'anh-goc', 'zed', 'dung-kiem-nang.py'))
KN = importlib.util.module_from_spec(_sp)
_argv = sys.argv; sys.argv = [sys.argv[0]]
_sp.loader.exec_module(KN)
sys.argv = _argv
NET = KN.NET
DZ, thu_net = NET['DZ'], NET['thu_net']


def doc_anh(s):
    return np.array(Image.open(io.BytesIO(base64.b64decode(s.split(',', 1)[1]))).convert('RGBA'))


def dung_to_k(tam, k):
    NET['K_TO'], NET['O_TO'] = k, int(math.ceil(96 * k - 1e-9))
    try:
        return NET['dung_to'](tam)
    finally:
        NET['K_TO'], NET['O_TO'] = 1.2, 116


def o_cua(big, meta, j):
    O, C = meta['o'], meta['cot']
    return big[(j // C) * O:(j // C + 1) * O, (j % C) * O:(j % C + 1) * O]


def kiem_nang_tam(d):
    """như KN.main() tới chỗ dựng tấm (2 lượt góc), không ghi neo / tệp. Trả (tam PIL có _rec, D = dt['kiem_nang'])."""
    kiem16 = d['dong_tac']['kiem_1~16']
    L = KN.do_dai(kiem16)
    kh = KN.NK.tinh()
    tam, dt, dong, sk = KN.dung({'vk': 'vk-kiem-moi', 'khung': kh}, kiem16)
    goc_dat = {}
    for i in KN.KHUNG_DAT:
        n = dt['kiem_nang']['nam']['neo'][i]
        kk = (KN.Y_DAT - n[1]) / L
        if kk >= 1:
            continue
        a = math.degrees(math.asin(max(-1.0, kk)))
        goc_dat[i] = round(a if math.cos(math.radians(kh[i][2])) > 0 else 180 - a, 1)
    kh = KN.NK.tinh(goc_dat)
    tam, dt, dong, sk = KN.dung({'vk': 'vk-kiem-moi', 'khung': kh}, kiem16)
    return tam, dt['kiem_nang']


def main():
    d = json.load(open(TEP, encoding='utf-8'))
    to0 = d['to']; CG = to0['cot_goc']
    cu_to = doc_anh(d['tam_to'])
    h0 = d['kiem_nang']['h_tam']
    # hàng dựng: mọi hàng có ô game vẽ thật (o_dung.py) + hàng chết và các hàng nắm tay của bản 16/10 / kiếm nặng (bot ít gặp) — trọn hàng
    hang_dung = set(json.load(open(os.path.join(RA, 'o-dung.json')))['hang']) | HANG_THEM if os.path.exists(os.path.join(RA, 'o-dung.json')) else None

    # ---- nguồn từng ô game (chỉ số i = hàng × 12 + cột): (tấm dựng, ô nguồn r, c) ----
    DZ.main()
    tam0 = NET['BAT']['zed-moi']['tam']
    print('tấm hàng thường dựng lại: %d×%d (game: %d hàng thường)' % (tam0.width, tam0.height, h0))
    assert tam0.height // 96 == h0 and tam0.width // 96 == CG, 'tấm dựng lại khác cỡ tấm game'
    tam_kn, D = kiem_nang_tam(d)
    r_than, r_nam = 2, D['nam']['hang_tay']
    nguon = {}
    for i, j in enumerate(to0['o_cua']):
        if j < 0:
            continue
        r, c = divmod(i, CG)
        if r < h0:
            nguon[i] = ('thuong', r, c)
        else:
            lop, jj = divmod(r - h0, 3)
            k, a, b, _ = KN.HANG[jj]
            if lop == 1:
                continue
            nguon[i] = ('kn', r_than if lop == 0 else r_nam, a + c)

    bo = {'thuong': tam0, 'kn': tam_kn}
    dung = {}

    def lay(k):
        if k not in dung:
            dung[k] = {t: dung_to_k(bo[t], k) for t in bo}
        return dung[k]

    # ---- kiểm: k = 1,2 phải ra đúng bản to đang có ----
    L12 = lay(1.2)
    xau, tb = [], []
    for i, (t, r, c) in nguon.items():
        big, meta = L12[t]
        js = meta['o_cua'][r * meta['cot_goc'] + c]
        a = o_cua(cu_to, to0, to0['o_cua'][i])[..., 3] > 0
        b = o_cua(big, meta, js)[..., 3] > 0 if js >= 0 else np.zeros_like(a)
        iou = (a & b).sum() / max(1, (a | b).sum())
        tb.append(iou)
        if iou < 0.99:
            xau.append((i, t, r, c, round(float(iou), 3)))
    print('kiểm k=1,2: %d ô, mặt nạ trùng trung bình %.4f, thấp nhất %.4f, %d ô < 0,99: %s' % (len(tb), np.mean(tb), np.min(tb), len(xau), xau[:12]))
    json.dump({'o': len(tb), 'tb': float(np.mean(tb)), 'min': float(np.min(tb)), 'duoi_099': xau}, open(os.path.join(RA, 'kiem-k12.json'), 'w'))

    hong = {x[0] for x in xau}
    chon = sorted(i for i in nguon if (hang_dung is None or i // CG in hang_dung) and i not in hong)
    print('ô dựng nét cao: %d / %d (hàng game dùng%s; bỏ %d ô không khớp kiểm)' % (len(chon), len(nguon), '' if hang_dung else ': không có o-dung.json → mọi ô bản to', len(xau)))
    kq = {}
    for N in (3, 4):
        k = round(1.2 * N / 2, 6)
        LK = lay(k)
        O = int(math.ceil(96 * k - 1e-9))
        hang = (len(chon) + COT - 1) // COT
        big = np.zeros((hang * O, COT * O, 4), np.uint8)
        bang = [-1] * len(to0['o_cua'])
        for n, i in enumerate(chon):
            t, r, c = nguon[i]
            src, meta = LK[t]
            js = meta['o_cua'][r * meta['cot_goc'] + c]
            if js < 0:
                continue
            big[(n // COT) * O:(n // COT + 1) * O, (n % COT) * O:(n % COT + 1) * O] = o_cua(src, meta, js)
            bang[i] = n
        big = thu_net.giam_mau(big, SO_MAU)
        png = thu_net.png_bang_mau(big)
        Image.fromarray(big).save(os.path.join(RA, 'zed-moi-n%d.png' % N))
        kq[N] = (png, {'k': k, 'o': O, 'cot': COT, 'cot_goc': CG, 'o_cua': bang})
        print('nét %d: k %.2f, ô %d, tấm %d×%d (%.1f triệu điểm), PNG %d KB' % (N, k, O, big.shape[1], big.shape[0], big.shape[0] * big.shape[1] / 1e6, len(png) // 1024))
    if GHI:
        s0 = open(TEP, encoding='utf-8').read()
        d = json.loads(s0)
        import chia_trang  # tấm lớn → nhiều trang ≤ 8 hàng ô (trần canvas / giải mã ảnh của máy)
        for N, (png, meta) in kq.items():
            tr, n = chia_trang.chia(np.array(Image.open(io.BytesIO(png)).convert('RGBA')), meta)
            meta['trang'] = n
            d['tam_n%d' % N] = ['data:image/png;base64,' + base64.b64encode(b).decode() for b in tr]
            d['to_n%d' % N] = meta
        json.dump(d, open(TEP, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
        print('ghi', os.path.relpath(TEP, REPO))


main()
