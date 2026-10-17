"""VỆT CHÉM KIẾM NẶNG — bản nét 4 (thử nghiệm ?netcao): cắt lại 4 hàng từ ĐÚNG ảnh gốc docs/anh-goc/kiem-nang/vet-kiem-nang-4x6.png bằng
đúng các bước của docs/anh-goc/kiem-nang/cat-vet-kiem-nang.py (bỏ nền xanh, cùng khung bao chung 6 khung, thu_net.thu), chỉ khác cỡ ra:
gấp 4 điểm ảnh / điểm game thay vì 2 (cỡ khung game, neo "goc", số khung, giây… giữ nguyên của tệp đang có). Ghi THÊM "tam_n4" vào
game/art/custom/hu-chem-kiem-nang-<1..4>.sprite.json (js/fx_anh.js chỉ tải khi canvas nét ≥ 3).
  python3 cat_vet_n4.py [--ghi]"""
import base64, importlib.util, json, os, sys
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', '..'))
_sp = importlib.util.spec_from_file_location('cv', os.path.join(REPO, 'docs', 'anh-goc', 'kiem-nang', 'cat-vet-kiem-nang.py'))
CV = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(CV)
thu_net = CV.thu_net
RA = os.path.join(HERE, 'ra'); os.makedirs(RA, exist_ok=True)
N4 = 4


def main():
    a = np.array(Image.open(CV.ANH).convert('RGBA'))
    xanh = CV.nen_xanh(a); fg = ~xanh
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    m = fg & (g > np.maximum(r, b))
    a[..., 1] = np.where(m, np.maximum(r, b), g).astype(np.uint8)
    a[..., 3] = np.where(fg, 255, 0).astype(np.uint8)
    dai = CV.dai_hang(fg)
    assert len(dai) == 4
    for (y0, y1), (ma, *_r) in zip(dai, CV.HANG):
        p = os.path.join(CV.RA, ma + '.sprite.json')
        tep = json.load(open(p, encoding='utf-8'))
        fw, fh = tep['khung_rong'], tep['khung_cao']
        o = a[max(0, y0 - 2):y1 + 3]
        cells = [o[:, c * CV.O:(c + 1) * CV.O] for c in range(6)]
        u = np.zeros(cells[0].shape[:2], bool)
        for c in cells:
            u |= c[..., 3] > 0
        ys, xs = np.nonzero(u)
        bx0, bx1, by0, by1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
        # kiểm: cỡ nét 2 tính lại phải ra đúng khung tệp (cùng khung bao)
        W2 = int(round((bx1 - bx0) * CV.KG * 2)); H2 = int(round((by1 - by0) * CV.KG * 2)); W2 += W2 % 2; H2 += H2 % 2
        assert (W2 // 2, H2 // 2) == (fw, fh), (ma, W2, H2, fw, fh)
        nho = [thu_net.thu(c[by0:by1, bx0:bx1], fw * N4, fh * N4) for c in cells]
        dai_anh = thu_net.giam_mau(np.concatenate(nho, 1), 48)
        # so mặt nạ với bản nét 2 (thu bản nét 4 về 2 bằng lấy mẫu) — cùng hình
        cu = np.array(Image.open(__import__('io').BytesIO(base64.b64decode(tep['tam'].split(',', 1)[1]))).convert('RGBA'))[..., 3] > 0
        moi = np.array(Image.fromarray(dai_anh).resize((cu.shape[1], cu.shape[0]), Image.BOX))[..., 3] >= 128
        iou = (cu & moi).sum() / max(1, (cu | moi).sum())
        png = thu_net.png_bang_mau(dai_anh)
        Image.fromarray(dai_anh).save(os.path.join(RA, ma + '-n4.png'))
        print('%s: khung %d×%d game → ảnh %d×%d (nét 4), mặt nạ trùng bản nét 2: %.3f, %d KB (nét 2: %d KB)' % (
            ma, fw, fh, dai_anh.shape[1], dai_anh.shape[0], iou, len(png) // 1024, len(tep['tam']) * 3 // 4 // 1024))
        if '--ghi' in sys.argv:
            tep['tam_n4'] = 'data:image/png;base64,' + base64.b64encode(png).decode()
            json.dump(tep, open(p, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))


main()
