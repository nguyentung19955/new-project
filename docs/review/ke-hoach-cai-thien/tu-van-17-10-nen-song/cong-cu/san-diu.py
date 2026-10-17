"""SÀN DỊU (tư vấn 17/10 mục 2.1): giảm độ tương phản CHI TIẾT của ảnh sàn, giữ mảng điểm ảnh lớn, KHÔNG làm mờ.
Sửa thẳng ảnh trong game/art/custom/gd-nen-<vùng>-<mảng>.sprite.json (mục "anh"); bản gốc chép sang <mã>-sancu.sprite.json
(mục "san_cua": <mã> — chỉ ở bản hai tệp, game nạp khi ?sanmoi=0, như tấm -netcu của phiên do-net).
Ba bước, đều làm trên lưới điểm ảnh GAME (ảnh net 2 → mỗi điểm game là một khối 2×2, khối giữ nguyên):
  1. Đốm lẻ: điểm game nào khác màu cả 4 điểm kề (tính vòng quanh mép để ảnh vẫn lặp liền) thì lấy màu nhiều nhất trong 4 điểm kề
     → bớt đốm lá / hạt 1 điểm, mảng lớn giữ nguyên (không trộn màu mới).
  2. Ép độ lệch quanh màu trung bình của MẢNG: màu mới = TB + (màu − TB) × (1 − giam) (giam 0,22 = bớt 22% tương phản chi tiết).
  3. Đổi độ sáng cả mảng khoảng doi mức (nhân theo tỉ lệ để giữ độ đậm màu; âm = tối hơn): nền sáng hơn một chút thì viền tối
     #14182e của Cu Tí / quái nổi rõ hơn (đo ở bao-cao.md).
Không thêm màu ngoài các màu đã có (bước 1) và các màu đã ép (bước 2, 3): số màu không tăng.
Chạy từ gốc repo (đọc bản -sancu nếu đã có, nên chạy lại bao nhiêu lần cũng ra cùng kết quả):
  python3 docs/review/ke-hoach-cai-thien/tu-van-17-10-nen-song/cong-cu/san-diu.py --ghi
"""
import base64, hashlib, io, json, os, sys
import numpy as np
from PIL import Image

GOC = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', '..'))
CUS = os.path.join(GOC, 'game', 'art', 'custom')
# vùng: (giam, doi, don_dom) — số theo đo ở bao-cao.md
CAU_HINH = {
    'rung': (0.24, 14, True),
    'bien': (0.20, 0, False),
    'lau': (0.20, 12, False),
    'song': (0.22, 8, False),
}
MANG = ['san0', 'san1', 'san2', 'san-nhan']
GHI = '--ghi' in sys.argv


def doc(tep):
    d = json.load(open(tep, encoding='utf-8'))
    im = Image.open(io.BytesIO(base64.b64decode(d['anh'].split(',', 1)[1]))).convert('RGBA')
    return d, np.asarray(im).copy()


def ma_png(a):
    b = io.BytesIO(); Image.fromarray(a.astype(np.uint8), 'RGBA').save(b, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()


def don_dom(g):
    """g: H×W×4 (lưới game). Điểm khác cả 4 điểm kề → màu nhiều nhất trong 4 điểm kề (vòng quanh mép)."""
    key = (g[..., 0].astype(np.int64) << 24) | (g[..., 1].astype(np.int64) << 16) | (g[..., 2].astype(np.int64) << 8) | g[..., 3]
    ke = [np.roll(key, s, ax) for s, ax in ((1, 0), (-1, 0), (1, 1), (-1, 1))]
    keg = [np.roll(g, s, ax) for s, ax in ((1, 0), (-1, 0), (1, 1), (-1, 1))]
    le = np.all([k != key for k in ke], axis=0)
    out = g.copy()
    for y, x in zip(*np.nonzero(le)):
        vals = [k[y, x] for k in ke]
        best = max(set(vals), key=vals.count)
        j = vals.index(best)
        out[y, x] = keg[j][y, x]
    return out, int(le.sum())


def ep(a, tb, giam, doi):
    """Bước 2 + 3 trên một ảnh bất kỳ (dùng chung TB của ảnh thường cho ảnh nét cao → cùng màu)."""
    b = a.copy(); rgb = a[..., :3].astype(float)
    k = 1 + doi / max(1.0, float(0.299 * tb[0] + 0.587 * tb[1] + 0.114 * tb[2]))  # sáng thêm theo tỉ lệ (giữ độ đậm màu, không bạc màu)
    b[..., :3] = np.clip(np.rint((tb + (rgb - tb) * (1 - giam)) * k), 0, 255)
    return b


def xu_ly(a, net, giam, doi, dd):
    g = a[::net, ::net].copy()
    n_le = 0
    if dd: g, n_le = don_dom(g)
    tb = g[..., :3].astype(float)[g[..., 3] > 0].mean(0)
    return np.repeat(np.repeat(ep(g, tb, giam, doi), net, 0), net, 1), n_le, tb


def doc_khoa(d, k):
    return np.asarray(Image.open(io.BytesIO(base64.b64decode(d[k].split(',', 1)[1]))).convert('RGBA')).copy()


def L(a):
    return 0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2]


for vung, (giam, doi, dd) in CAU_HINH.items():
    for m in MANG:
        ma = 'gd-nen-%s-%s' % (vung, m)
        tep, tcu = os.path.join(CUS, ma + '.sprite.json'), os.path.join(CUS, ma + '-sancu.sprite.json')
        if not os.path.exists(tep): continue
        nguon = tcu if os.path.exists(tcu) else tep
        d, a = doc(nguon)
        if 'san_cua' in d:  # đọc từ bản cũ: trả mã gốc
            d = {k: v for k, v in d.items() if k != 'san_cua'}; d['ma'] = ma
        net = int(d.get('net', 1))
        b, n_le, tb = xu_ly(a, net, giam, doi, dd)
        La, Lb = L(a[..., :3].astype(float))[a[..., 3] > 0], L(b[..., :3].astype(float))[b[..., 3] > 0]
        nmau = lambda x: len(set(map(tuple, x.reshape(-1, 4)[:, :3].tolist())))
        print('%-22s sd L %.1f -> %.1f  TB %.0f -> %.0f  đốm lẻ %d  màu %d -> %d' % (ma, La.std(), Lb.std(), La.mean(), Lb.mean(), n_le, nmau(a), nmau(b)))
        if GHI:
            if not os.path.exists(tcu):
                cu = dict(d); cu['ma'] = ma + '-sancu'; cu['san_cua'] = ma
                json.dump(cu, open(tcu, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
            moi = dict(d); moi['anh'] = ma_png(b); moi['san_moi'] = 1
            # 17/10 nét cao — nền: ảnh nét 3 / 4 (anh_n3 / anh_n4) ép cùng cách (không dọn đốm: ảnh nét cao là chi tiết thật), rồi ghi lại
            # khoá net_cao_cua theo ảnh thường MỚI (build.py bỏ ảnh nét cao nếu khoá lệch).
            co_n = [k for k in ('anh_n3', 'anh_n4') if k in d]
            for k in co_n: moi[k] = ma_png(ep(doc_khoa(d, k), tb, giam, doi))
            if co_n: moi['net_cao_cua'] = hashlib.sha256(moi['anh'].encode()).hexdigest()[:12]
            json.dump(moi, open(tep, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
