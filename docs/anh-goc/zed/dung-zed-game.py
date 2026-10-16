#!/usr/bin/env python3
"""DỰNG BỘ ZED MỚI CHO GAME (tích hợp 13/10/2026 — docs/review/ke-hoach-cai-thien/zed-tich-hop/YEU-CAU.md).

Chạy lại được bất cứ lúc nào (từ đâu cũng được):  python3 docs/anh-goc/zed/dung-zed-game.py
Đọc:  docs/anh-goc/zed/moi/<ten>-gif/   (khung đã cắt + bao-cao.json có điểm chân từng khung)
      docs/anh-goc/zed/gan-vk/neo.json  (điểm cầm + góc vũ khí từng khung, toạ độ ẢNH KHUNG ĐÃ CẮT = nguồn)
Ghi:  game/art/custom/zed-moi.sprite.json  thân Zed: mỗi động tác 1 hàng, khung 96×96 điểm ảnh (= 48×48 game, net 2),
                                            chân tại (48,90) ảnh = goc [24,45] game; thêm các hàng "nắm tay" (lớp vẽ đè lên cán vũ khí)
      game/art/custom/zed-vk.sprite.json    4 vũ khí × 4 cấp (kiếm, thương, búa, phi tiêu), ảnh rời, game tự xoay theo neo
      docs/review/ke-hoach-cai-thien/zed-co-deu/xem-truoc-*.png  ảnh xem trước (dựng như game ghép: người → vũ khí → nắm tay)
      game/art/custom/zed-rung.sprite.json  TRANG PHỤC BỘ 2 "RỪNG" (13/10/2026, docs/review/ke-hoach-cai-thien/zed-bo-rung/YEU-CAU.md):
                                            cùng chuẩn với zed-moi, ảnh từ trang-phuc/bo-2-rung/<tên>-cat/, neo dùng lại neo.json của hàng
                                            ninja tương ứng (xem hàm dung_bo), vũ khí dùng chung zed-vk
      docs/review/ke-hoach-cai-thien/zed-bo-rung/xem-truoc-rung.png
      game/art/custom/zed-bien.sprite.json  TRANG PHỤC BỘ 3 "BIỂN" (13/10/2026, docs/review/ke-hoach-cai-thien/zed-bo-bien/YEU-CAU.md):
                                            y như bộ Rừng (hàm dung_bo, danh sách BO_KHAC), ảnh từ trang-phuc/bo-3-bien/<tên>-cat/
      docs/review/ke-hoach-cai-thien/zed-bo-bien/xem-truoc-bien.png
      game/art/custom/zed-lau.sprite.json  TRANG PHỤC BỘ 4 "LÂU ĐÀI CỔ" (13/10/2026, docs/review/ke-hoach-cai-thien/zed-bo-lau/YEU-CAU.md):
                                            y như bộ Rừng/Biển (hàm dung_bo, danh sách BO_KHAC), ảnh từ trang-phuc/bo-4-lau/<tên>-cat/
      docs/review/ke-hoach-cai-thien/zed-bo-lau/xem-truoc-lau.png
      docs/review/ke-hoach-cai-thien/zed-cam-vk/xem-cam-vk.png (+ xem-cam-vk-<bộ>.png)  ảnh soát CẦM VŨ KHÍ lúc đứng/đi/chạy

CẦM VŨ KHÍ LÚC ĐỨNG / ĐI / CHẠY (13/10/2026 — docs/review/ke-hoach-cai-thien/zed-cam-vk/YEU-CAU.md):
  neo.json có thêm mục "<thư mục hàng>#<loại>" (01-dung, 02-di, 03-chay-v4 × kiem/thuong/bua/phitieu; ghi bằng gan-vk/cam-vk.py).
  Mỗi mục thành một hàng "<khoá>_<loại>" trong dong_tac (dung_kiem, di_thuong, chay_bua, chay_phitieu…): "hang" = hàng thân
  đứng/đi/chạy (dùng chung ảnh thân), "cam_vk" = khoá hàng thân, có vk / vk_tl / vk_cam / neo / hang_tay riêng (nắm tay vẽ đè lên cán).
  Các bộ trang phục khác lấy neo theo hàng ninja tương ứng như mọi hàng (dung_bo, chinh_nam bán kính r_nam = 18).
  game/js/zed_moi.js chọn hàng <khoá>_<loại> theo vũ khí đang cầm (tắt: ?camvk=0).

CO THEO TỪNG HÀNG (sửa 13/10/2026 — docs/review/ke-hoach-cai-thien/zed-co-deu/YEU-CAU.md):
  Ảnh gốc mỗi động tác vẽ Zed một cỡ khác nhau (chạy nhỏ hơn đứng ~25%, trúng đòn/thương giữ to hơn…), nên mỗi hàng có tỉ lệ
  co riêng s_hang = s × r_hang, trong đó s = CAO_96 / chiều cao tấm đứng và r_hang làm cho ĐẦU Zed ở hàng đó bằng đầu ở tấm đứng.
  Cỡ đầu đo trên ảnh nguồn từng khung (hàm do_dau), không phụ thuộc tư thế cúi/nhảy/ngã:
    - mặt = mảng da (cùng hàm da() bên dưới) lớn, nằm cao nhất trong khung; cằm = đáy mảng mặt
    - cao_dau = cằm − đỉnh tóc (trung vị của đỉnh điểm ảnh đặc trên các cột giữa mặt, phân vị 20–80 bề ngang mặt)
    - mat = căn bậc hai diện tích mảng mặt
  Mỗi hàng: bỏ khung đo hỏng (cao_dau < 0,75 × lớn nhất hàng — lúc mảng da cao nhất là bàn tay chứ không phải mặt), lấy trung vị
  cao_dau và mat; r_hang = căn( (cao_dau_đứng / cao_dau_hàng) × (mat_đứng / mat_hàng) )  (trung bình nhân hai phép đo, đỡ lệch khi
  đầu ngửa/nghiêng). Hàng chết 06-chet-b2 cũng theo cách này (bỏ hệ số phóng cứng cũ).
  Vũ khí: độ dài tính theo Zed chuẩn (chiều cao ảnh khung tấm đứng × s), KHÔNG theo hàng → vũ khí không to nhỏ theo động tác.
  Neo vũ khí quy đổi bằng s_hang, dx, dy của chính khung đó. Hình nào sau khi co vẫn tràn ô 96×96 thì DỜI trong ô (ít nhất có thể,
  từng khung; neo + nắm tay dời theo) — không cắt hình.

CÁCH GHÉP VŨ KHÍ = y hệt docs/anh-goc/zed/gan-vk/ghep-thu-vk.py (bản đã duyệt):
  - điểm cầm trên người: chinh_nam (tâm điểm da quanh điểm ghi trong neo.json, bán kính 28)
  - điểm cầm trên vũ khí: chuoi (cam = tỉ lệ dọc chiều dài; không có cam: tâm phần quấn đỏ của chuôi)
  - độ dài: sc = dai × (chiều cao lớn nhất các khung của động tác) / (bề ngang ảnh vũ khí cấp 1); cấp khác dùng cùng sc
  - góc độ: 0 = mũi chỉ sang phải, dương = chúc xuống (xoay theo chiều kim đồng hồ quanh điểm cầm); sau = 1 vũ khí vẽ SAU người
  - nắm tay: điểm màu da trong bán kính 26 quanh điểm cầm (và tay2) vẽ lại ĐÈ lên vũ khí
HỆ TOẠ ĐỘ trong tệp game: "he_neo": "nguon-96" = toạ độ trên khung 96×96 của tấm (chân tại 48,90). Game chia 2 rồi trừ goc (24,45)
để ra điểm ảnh game tính từ chân. Quy đổi: X96 = dx + x_nguon × s, Y96 = dy + y_nguon × s (s, dx, dy của từng khung: cùng phép
co/dịch đã dùng để đặt khung đó vào ô 96×96).
"""
import base64, glob, io, json, math, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'gan-vk'))
import nam_chuoi as NC  # nắm chuôi thật 15/10 (docs/review/ke-hoach-cai-thien/vk-khop-tay)

DAY = os.path.dirname(os.path.abspath(__file__))
GOC_REPO = os.path.abspath(os.path.join(DAY, '..', '..', '..'))
MOI = os.path.join(DAY, 'moi')
NEO = os.path.join(DAY, 'gan-vk', 'neo.json')
RA_GAME = os.path.join(GOC_REPO, 'game', 'art', 'custom')
RA_XEM = os.path.join(GOC_REPO, 'docs', 'review', 'ke-hoach-cai-thien', 'zed-co-deu')
# Trang phục bộ 2 "Rừng" (13/10/2026, docs/review/ke-hoach-cai-thien/zed-bo-rung/YEU-CAU.md): ảnh đã cắt ở trang-phuc/bo-2-rung/<tên>-cat/
RUNG = os.path.join(DAY, 'trang-phuc', 'bo-2-rung')
RA_XEM_RUNG = os.path.join(GOC_REPO, 'docs', 'review', 'ke-hoach-cai-thien', 'zed-bo-rung')
# Trang phục bộ 3 "Biển" (13/10/2026, docs/review/ke-hoach-cai-thien/zed-bo-bien/YEU-CAU.md): trang-phuc/bo-3-bien/<tên>-cat/
BIEN = os.path.join(DAY, 'trang-phuc', 'bo-3-bien')
RA_XEM_BIEN = os.path.join(GOC_REPO, 'docs', 'review', 'ke-hoach-cai-thien', 'zed-bo-bien')
# thư mục bộ ninja (cột 2 của DONG) → tên tấm các bộ trang phục khác (Rừng, Biển, Lâu đài: cùng tên, cùng tư thế, cùng số khung)
BO_TEN = {'06-chet-b2': '06-chet', '07-chuong-b2': '07-chuong', '08-kiem-1-tp': '08-kiem-1', '09-kiem-2-tp': '09-kiem-2',
            '23-tram-nguyet-tp': '23-tram-nguyet'}
R_NAM_RUNG = 18        # bán kính chinh_nam trên ảnh Rừng (áo không tay: bán kính 28 sẽ kéo điểm cầm lên cẳng tay)
R_NAM_BIEN = 18        # bộ Biển áo ngắn tay (cẳng tay trần) → như bộ Rừng
# Trang phục bộ 4 "Lâu đài cổ" (13/10/2026, docs/review/ke-hoach-cai-thien/zed-bo-lau/YEU-CAU.md): trang-phuc/bo-4-lau/<tên>-cat/
LAU = os.path.join(DAY, 'trang-phuc', 'bo-4-lau')
RA_XEM_LAU = os.path.join(GOC_REPO, 'docs', 'review', 'ke-hoach-cai-thien', 'zed-bo-lau')
R_NAM_LAU = 18         # bộ Lâu đài áo ngắn tay, găng da hở ngón (nắm tay vẫn là da) → như bộ Rừng/Biển

O = 96                 # cạnh ô ảnh (nguồn 96 = game 48 × net 2)
CHAN = (48, 90)        # chân trong ô 96 (= goc [24,45] game)
CAO_96 = 62            # Zed đứng cao 62 điểm ảnh ô 96 (= 31 điểm ảnh game, như docs/anh-goc/zed/kiem-sheet.py CAO_GAME)
DAI_CAP1 = 0.8         # như ghep-thu-vk.py
Q_VK = 2.0             # ảnh vũ khí lưu ở tỉ lệ Q_VK × s (s: tỉ lệ co thân) để game chỉ phải thu nhỏ, không phóng to

# (khoá game, thư mục, giây một vòng, lặp)
DONG = [
    ('dung', '01-dung', 1.0, True), ('di', '02-di', 0.8, True), ('chay', '03-chay-v4', 0.6, True), ('lon', '04-lon', 0.27, False),
    ('trung', '05-trung-don', 0.2, False), ('chet', '06-chet-b2', 0.6, False), ('chuong', '07-chuong-b2', 0.3, False),
    ('kiem_1', '08-kiem-1-tp', 0.3, False), ('kiem_2', '09-kiem-2-tp', 0.3, False), ('kiem_3', '10-kiem-3', 0.46, False),
    ('thuong_1', '11-thuong-1', 0.38, False), ('thuong_2', '12-thuong-2', 0.34, False), ('thuong_3', '13-thuong-3', 0.34, False),
    ('thuong_quet', '14-thuong-quet', 0.52, False), ('thuong_giu', '15-thuong-giu', 0.45, True), ('thuong_xoc', '16-thuong-xoc', 0.16, False),
    ('bua_nen', '17-bua-nen', 0.8, False), ('bua_giu', '18-bua-giu', 0.5, True), ('bua_nen_dat', '19-bua-nen-dat', 0.7, False),
    ('phitieu', '20-phi-tieu', 0.38, False), ('phitieu_ngam', '21-phi-tieu-ngam', 0.45, True), ('phitieu_chum', '22-phi-tieu-chum', 0.5, False),
    ('db_kiem', '23-tram-nguyet-tp', 0.35, False), ('db_thuong', '24-phi-thuong', 0.35, False), ('db_bua', '25-dia-chan', 0.35, False),
    ('db_phitieu', '26-mua-phi-tieu', 0.35, False), ('dam', '27-dam', 0.3, False),
    # 16/10 (docs/review/ke-hoach-cai-thien/vk-khop-tay/bao-cao-2.md): chạy HAI TAY ôm cán — game dùng khi chạy cầm thương / búa
    # (hàng chay2tay_thuong, chay2tay_bua; tắt ?chay2tay=0). Chỉ có ảnh bộ ninja → các bộ khác không có hàng này (game giữ hàng chạy cũ).
    ('chay2tay', '03-chay-2tay', 0.6, True),
    # HÀNG MỚI 16/10 (docs/review/ke-hoach-cai-thien/hang-moi-16-10/bao-cao.md): chủ game gen lại đứng thở 8 khung, lộn 6, trúng đòn 4
    # (ảnh docs/anh-goc/cu-ti-hang-moi-16-10/, cắt bằng cat-diem-anh.py vào moi16/<tên>-gif/). Khoá "<hàng>~16": game/js/zed_moi.js
    # dùng thay hàng cũ cùng tên (cả các hàng cầm vũ khí dung~16_<loại> → dung_<loại>); ?hangcu=1 về hàng cũ. Chỉ bộ ninja.
    # Kiếm 1 / kiếm 2 mới KHÔNG dùng (đổi tay: tay phải chống hông, tay trái vung), kiếm 3 gen hỏng — xem báo cáo.
    ('dung~16', '01-dung-8k', 1.0, True), ('lon~16', '04-lon-6k', 0.27, False), ('trung~16', '05-trung-don-4k', 0.2, False),
]
CHI_NINJA = {'03-chay-2tay', '01-dung-8k', '04-lon-6k', '05-trung-don-4k'}   # hàng chỉ có ảnh bộ ninja: dung_bo bỏ qua
MOI16 = os.path.join(DAY, 'moi16')
GOC_RIENG = {t: os.path.join(MOI16, t + '-gif') for t in ('01-dung-8k', '04-lon-6k', '05-trung-don-4k')}
# Co theo CHIỀU CAO thay vì cỡ đầu (16/10): tóc bay của ảnh mới làm đo đầu sai (trúng đòn đo đầu to hơn 15% → người co nhỏ hơn
# đứng 7 điểm ảnh ô 96). Các khung ghi ở đây (đếm từ 0, tư thế đứng thẳng) co cho cao bằng trung vị hàng dung~16.
R_CAO = {'04-lon-6k': [5], '05-trung-don-4k': [2, 3]}
NEO_DAU = ('dung', 'di', 'chay', 'chay2tay', 'dung~16')
DAU_X = 49  # hoành độ tâm đầu trong ô 96 cho các hàng NEO_DAU
VK = [('kiem', 'vk-kiem-moi'), ('thuong', 'vk-thuong'), ('bua', 'vk-bua'), ('phitieu', 'vk-phi-tieu')]
VK_THU_MUC = dict((b, a) for a, b in VK)
RA_CAM = os.path.join(GOC_REPO, 'docs', 'review', 'ke-hoach-cai-thien', 'zed-cam-vk')


def neo_cam(neo_all, thu):
    """Các mục cầm vũ khí lúc đứng/đi/chạy của một hàng: [(loại, neo)] theo thứ tự VK (mục "<thu>#<loại>" của neo.json)."""
    return [(loai, neo_all[thu + '#' + loai]) for loai, _ in VK if thu + '#' + loai in neo_all]


# ---------- y hệt ghep-thu-vk.py ----------
def da(a):
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    return (r > 170) & (g > 110) & (b > 70) & (r - b > 50) & (a[..., 3] > 0)


def chinh_nam(im, x, y, r=28):
    a = np.array(im); m = da(a)
    yy, xx = np.mgrid[:a.shape[0], :a.shape[1]]
    vung = m & ((xx - x) ** 2 + (yy - y) ** 2 < r * r)
    if vung.sum() < 20:
        return float(x), float(y)
    return float(xx[vung].mean()), float(yy[vung].mean())


def chuoi(vk, cam=None):
    a = np.array(vk)
    if cam is not None:
        x = int(a.shape[1] * cam); ys = np.nonzero(a[:, x, 3] > 0)[0]
        return float(x), float(ys.mean() if len(ys) else a.shape[0] / 2)
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    m = (r > 110) & (g < 70) & (b < 70) & (a[..., 3] > 0)
    m[:, int(a.shape[1] * 0.35):] = False
    ys, xs = np.nonzero(m)
    if len(xs) == 0:
        return a.shape[1] * 0.1, a.shape[0] / 2
    return float(np.median(xs)), float(np.median(ys))


def lop_tay(im, x, y, tay2):
    a = np.array(im); m = da(a)
    yy, xx = np.mgrid[:a.shape[0], :a.shape[1]]
    tay = m & ((xx - x) ** 2 + (yy - y) ** 2 < 26 ** 2)
    if tay2:
        tay |= m & ((xx - tay2[0]) ** 2 + (yy - tay2[1]) ** 2 < 26 ** 2)
    lop = a.copy(); lop[..., 3] = np.where(tay, a[..., 3], 0)
    return Image.fromarray(lop)


# ---------- đo cỡ đầu (co theo từng hàng) ----------
def do_dau(im):
    """(cao_dau, mat) trên ảnh nguồn một khung: cao_dau = cằm − đỉnh tóc, mat = căn diện tích mảng da mặt. None nếu không thấy mặt."""
    a = np.array(im)
    m = ndimage.binary_opening(da(a), iterations=2)
    lab, n = ndimage.label(m)
    if n == 0:
        return None
    sz = ndimage.sum(m, lab, range(1, n + 1)); cm = ndimage.center_of_mass(m, lab, range(1, n + 1))
    i = min((j for j in range(n) if sz[j] > 0.15 * sz.max()), key=lambda j: cm[j][0])  # mảng da lớn nằm cao nhất = mặt
    yy, xx = np.nonzero(lab == i + 1)
    x0, x1 = np.percentile(xx, [20, 80]).astype(int)
    cot = a[:yy.max() + 1, x0:x1 + 1, 3] > 0
    dinh = [int(np.argmax(cot[:, j])) for j in range(cot.shape[1]) if cot[:, j].any()]
    return float(yy.max() - np.median(dinh)), float(np.sqrt(sz[i]))


def co_dau_hang(fr):
    """Trung vị (cao_dau, mat) của một hàng, bỏ khung đo hỏng."""
    ds = [d for d in (do_dau(f['im']) for f in fr) if d]
    lon = max(d[0] for d in ds)
    ds = [d for d in ds if d[0] >= 0.75 * lon]
    return float(np.median([d[0] for d in ds])), float(np.median([d[1] for d in ds])), len(ds)


# ---------- đọc khung ----------
def doc_dong(thu, goc=None):
    """goc: thư mục chứa bao-cao.json + <tên>/khung-NN.png (mặc định moi/<thu>-gif = bộ ninja)."""
    goc = goc or os.path.join(MOI, thu + '-gif')
    bc = json.load(open(os.path.join(goc, 'bao-cao.json'), encoding='utf-8'))
    h = bc['hang'][0]
    fs = sorted(glob.glob(os.path.join(goc, h['ten'], 'khung-*.png')))
    ra = []
    for k, f in zip(h['khung'], fs):
        im = Image.open(f).convert('RGBA')
        kb = k['khung_bao']
        bb = im.getbbox()
        # chân: hoành độ theo báo cáo cắt (điểm chân đo trên tấm gốc), tung độ = đáy hình thật (điểm ảnh đặc thấp nhất)
        # tâm đầu (bề ngang phần trên 30% hình) — dùng làm điểm neo ngang cho hàng lặp di chuyển
        a = np.array(im)[bb[1]:bb[1] + max(1, int((bb[3] - bb[1]) * 0.3)), :, 3] > 0
        xs = np.nonzero(a.any(0))[0]
        dau_x = float((xs.min() + xs.max()) / 2) if len(xs) else float(k['chan'][0] - kb[0])
        ra.append({'im': im, 'chan': (float(k['chan'][0] - kb[0]), float(bb[3])), 'bb': bb, 'dau_x': dau_x})
    if len(fs) != len(h['khung']):
        print('  ! %s: %d tệp khung, báo cáo ghi %d' % (thu, len(fs), len(h['khung'])))
    return ra


def png_b64(im):
    b = io.BytesIO(); im.save(b, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode('ascii')


def dung_than(dong, neo_all, s, vk_cua, neo_cua, neo_nam=None, r0=28):
    """Dựng tấm thân + nắm tay của MỘT bộ trang phục (cùng chuẩn cho mọi bộ).
    dong: [(khoá, thư mục, giây, lặp, khung)]; s: tỉ lệ co tấm đứng của bộ; neo_all: neo theo thư mục của bộ (khoá 'khung' như neo.json);
    vk_cua(k, n) → dict vk / vk_tl / vk_cam của hàng; neo_cua(thu, i, f, kk) → (x, y, tay2 | None) điểm cầm trên ảnh nguồn khung đó.
    neo_nam (nắm chuôi 15/10, gan-vk/nam_chuoi.py): neo biến thể mới cùng khoá như neo_all → mỗi hàng có thêm dong_tac[k]['nam'] =
    {neo, hang_tay (lớp NGÓN TAY TRƯỚC), vk_tl/vk_cam nếu khác}; game dùng khi ?namchuoi khác 0. r0: bán kính đầu của tam_nam.
    Trả (tam, dt, xem, dau, r_hang, tran, cot)."""
    dau = {thu: co_dau_hang(fr) for k, thu, gi, lap, fr in dong}
    dau_dung = dau[dong[0][1]]
    r_hang = {thu: math.sqrt(dau_dung[0] / d[0] * dau_dung[1] / d[1]) for thu, d in dau.items()}
    fr_cua = {thu: fr for k, thu, gi, lap, fr in dong}
    if '01-dung-8k' in fr_cua:  # R_CAO: co theo chiều cao khung đứng thẳng = cao trung vị hàng đứng mới (sau co)
        h16 = float(np.median([f['bb'][3] - f['bb'][1] for f in fr_cua['01-dung-8k']])) * r_hang['01-dung-8k']
        for thu, ks in R_CAO.items():
            if thu in fr_cua:
                r_hang[thu] = h16 / float(np.median([fr_cua[thu][i]['bb'][3] - fr_cua[thu][i]['bb'][1] for i in ks]))
    so_tay = sum((1 if thu in neo_all else 0) + len(neo_cam(neo_all, thu)) for k, thu, gi, lap, fr in dong) * (2 if neo_nam else 1)
    cot = max(len(fr) for *_, fr in dong)
    tam = Image.new('RGBA', (cot * O, (len(dong) + so_tay) * O), (0, 0, 0, 0))
    dt, tran, hang_tay, xem = {}, [], len(dong), {}
    for hang, (k, thu, gi, lap, fr) in enumerate(dong):
        sk = s * r_hang[thu]  # co theo từng hàng: đầu bằng đầu tấm đứng
        n = neo_all.get(thu)
        d = {'hang': hang, 'so': len(fr), 'giay': gi, 'lap': lap}
        # các bộ neo của hàng: (khoá dong_tac, neo, dict); hàng đòn có 1 bộ (chính nó), đứng/đi/chạy có thêm 4 bộ cầm vũ khí <k>_<loại>
        bo_neo = [(k, n, d, thu)] if n else []
        for loai, nc in neo_cam(neo_all, thu):
            bo_neo.append((k + '_' + loai, nc, {'hang': hang, 'so': len(fr), 'giay': gi, 'lap': lap, 'cam_vk': k}, thu + '#' + loai))
        nam_cua = {}
        for kn, nn, dn, key in bo_neo:
            dn['hang_tay'] = hang_tay; hang_tay += 1
            dn.update(vk_cua(kn, nn))
            dn['neo'] = []
            xem[kn] = []
        for kn, nn, dn, key in bo_neo:
            if neo_nam and key in neo_nam:
                nm = {'neo': [], 'hang_tay': hang_tay}; hang_tay += 1
                v2 = vk_cua(kn, neo_nam[key], True)
                for q_ in ('vk_tl', 'vk_cam'):
                    if v2[q_] != dn[q_]:
                        nm[q_] = v2[q_]
                dn['nam'] = nm; nam_cua[kn] = neo_nam[key]
        xem[k] = []
        for i, f in enumerate(fr):
            im = f['im']
            nw, nh = max(1, round(im.width * sk)), max(1, round(im.height * sk))
            sx, sy = nw / im.width, nh / im.height
            # Hàng lặp di chuyển (đứng/đi/chạy): neo ngang theo TÂM ĐẦU, không theo bàn chân —
            # bàn chân đổi bên mỗi bước nên neo theo chân làm người giật tới/lui mỗi khung.
            if k in NEO_DAU:
                dx = round(DAU_X - f['dau_x'] * sx)  # đầu luôn ở cùng một chỗ, bằng chỗ đầu khi đứng
            else:
                dx = round(CHAN[0] - f['chan'][0] * sx)
            dy = round(CHAN[1] - f['chan'][1] * sy)
            nho = im.resize((nw, nh), Image.BOX)
            bb = nho.getbbox()
            if bb:  # tràn ô 96×96 → dời vào trong ô (ít nhất có thể), không cắt hình
                ddx = max(0, -(dx + bb[0])) - max(0, dx + bb[2] - O)
                ddy = max(0, -(dy + bb[1])) - max(0, dy + bb[3] - O)
                if bb[2] - bb[0] > O or bb[3] - bb[1] > O:
                    tran.append('%s khung %d (hình lớn hơn ô, vẫn bị cắt)' % (thu, i + 1))
                elif ddx or ddy:
                    dx += ddx; dy += ddy
                    tran.append('%s khung %d dời (%+d,%+d)' % (thu, i + 1, ddx, ddy))
            o = Image.new('RGBA', (O, O), (0, 0, 0, 0)); o.paste(nho, (dx, dy), nho)
            tam.alpha_composite(o, (i * O, hang * O))
            item = {'than': o}
            for kn, nn, dn, key in bo_neo:
                it = item if kn == k else {'than': o}
                kk = nn['khung'][i] if i < len(nn['khung']) else None
                if not kk:
                    dn['neo'].append(None)
                else:
                    x, y, t2 = neo_cua(thu, i, f, kk)
                    X, Y = dx + x * sx, dy + y * sy
                    sau = kk[3] if len(kk) > 3 else 0
                    dn['neo'].append([round(X, 2), round(Y, 2), kk[2], sau])
                    ly = lop_tay(im, x, y, t2).resize((nw, nh), Image.BOX)
                    ot = Image.new('RGBA', (O, O), (0, 0, 0, 0)); ot.paste(ly, (dx, dy), ly)
                    tam.alpha_composite(ot, (i * O, dn['hang_tay'] * O))
                    it.update(tay=ot, neo=(X, Y, kk[2], sau))
                if kn in nam_cua:  # biến thể NẮM CHUÔI: tâm nắm đấm, góc qua hai nắm, lớp ngón tay trước (nam_chuoi.py)
                    k2 = nam_cua[kn]['khung'][i] if i < len(nam_cua[kn]['khung']) else None
                    if not k2:
                        dn['nam']['neo'].append(None)
                    else:
                        x, y, t2 = neo_cua(thu, i, f, k2)
                        r0_ = NC.R0_HANG.get(thu, r0)
                        xn, yn = NC.tam_nam(im, x, y, r0_)
                        tn = NC.tam_nam(im, t2[0], t2[1], r0_) if t2 else None
                        g = k2[2]
                        if tn and len(k2) > 5 and isinstance(k2[5], dict) and k2[5].get('hai'):
                            g = round(math.degrees(math.atan2(tn[1] - yn, tn[0] - xn)), 1)
                        X2, Y2 = dx + xn * sx, dy + yn * sy
                        n2 = [round(X2, 2), round(Y2, 2), g, k2[3] if len(k2) > 3 else 0]
                        if tn:  # tâm nắm tay thứ hai (ô 96): game vẽ thêm lớp ngón ở chỗ đó trên cán
                            n2.append([round(dx + tn[0] * sx, 2), round(dy + tn[1] * sy, 2)])
                        dn['nam']['neo'].append(n2)
                        pts = [(xn, yn)] + ([tn] if tn else [])
                        lp = NC.lop96(o, NC.mat_na_nam(im, pts), nw, nh, dx, dy, O)
                        tam.alpha_composite(Image.fromarray(lp), (i * O, dn['nam']['hang_tay'] * O))
                if kn != k:
                    xem[kn].append(it)
            xem[k].append(item)
        dt[k] = d
        for kn, nn, dn, key in bo_neo:
            if kn != k:
                dt[kn] = dn
    tam = tam.crop((0, 0, tam.width, hang_tay * O))
    return tam, dt, xem, dau, r_hang, tran, cot


def ghi_tep(ten, t):
    p = os.path.join(RA_GAME, ten + '.sprite.json')
    with open(p, 'w', encoding='utf-8') as fo:
        json.dump(t, fo, ensure_ascii=False, separators=(',', ':'))
    print('Ghi %s (%.0f KB)' % (os.path.relpath(p, GOC_REPO), os.path.getsize(p) / 1024))


def xem_truoc(p, xem, dt, vk_meta, tam_vk, cot):
    """Ảnh xem trước: ghép như game (cấp 1 và cấp 4), cỡ ô 96 (= game ×2)."""
    def ghep(k, i, cap):
        it = xem[k][i]; d = dt[k]
        nen = Image.new('RGBA', (O * 2, O * 2), (0, 0, 0, 0)); goc0 = (O // 2, O // 2)
        if 'neo' not in it:
            nen.alpha_composite(it['than'], goc0); return nen
        X, Y, g, sau = it['neo']
        r = vk_meta[d['vk']][cap]; v = tam_vk.crop((r[0], r[1], r[0] + r[2], r[1] + r[3]))
        f = d['vk_tl'] * 2  # điểm ảnh ô 96 / điểm ảnh tấm vk
        v = v.resize((max(1, round(v.width * f)), max(1, round(v.height * f))), Image.NEAREST)
        gx, gy = d['vk_cam'][cap][0] * f, d['vk_cam'][cap][1] * f
        R = int(math.hypot(v.width, v.height)) + 4
        t = Image.new('RGBA', (2 * R, 2 * R), (0, 0, 0, 0)); t.alpha_composite(v, (int(R - gx), int(R - gy)))
        t = t.rotate(-g, resample=Image.NEAREST)
        lop = Image.new('RGBA', nen.size, (0, 0, 0, 0)); lop.paste(t, (int(goc0[0] + X - R), int(goc0[1] + Y - R)), t)
        if sau:
            nen.alpha_composite(lop); nen.alpha_composite(it['than'], goc0)
        else:
            nen.alpha_composite(it['than'], goc0); nen.alpha_composite(lop)
        nen.alpha_composite(it['tay'], goc0)
        return nen
    hang = []
    for k, *_ in DONG:
        if k not in dt:
            continue
        for cap in ((0, 3) if 'vk' in dt[k] else (0,)):
            hang.append([ghep(k, i, cap) for i in range(dt[k]['so'])])
    P = Image.new('RGBA', (cot * O * 2, len(hang) * O * 2), (40, 44, 52, 255))
    for r_, h in enumerate(hang):
        for c_, im in enumerate(h):
            P.alpha_composite(im, (c_ * O * 2, r_ * O * 2))
    os.makedirs(os.path.dirname(p), exist_ok=True)
    P.convert('RGB').save(p, optimize=True)
    print('Ghi ' + os.path.relpath(p, GOC_REPO))


def xem_cam_vk(p, xem, dt, vk_meta, tam_vk, nhan='ninja'):
    """Ảnh soát cầm vũ khí lúc đứng/đi/chạy: hàng = (đứng/đi/chạy) × 4 vũ khí cấp 1, ghép như game (vũ khí SAU → thân → vũ khí
    TRƯỚC → nắm tay), ô cắt quanh người phóng ×3 (= game ×6). Cột trái ghi tên hàng."""
    from PIL import ImageDraw
    hang = [(k + '_' + loai, '%s %s' % (k, loai)) for k in NEO_DAU for loai, _ in VK if k + '_' + loai in dt]
    if not hang:
        return
    cot = max(dt[h]['so'] for h, _ in hang)
    Z, NHAN, CW, CH = 3, 110, 105, 84    # ô cắt CW×CH điểm ảnh ô 96 quanh chân (lệch ra trước 20), phóng ×Z
    P = Image.new('RGBA', (NHAN + cot * CW * Z, len(hang) * CH * Z + 24), (40, 44, 52, 255))
    d = ImageDraw.Draw(P)
    d.text((6, 6), 'Zed cam vu khi luc dung/di/chay - bo %s - vu khi cap 1 (x3). Lon/trung don/chet: an vu khi.' % nhan, fill=(230, 230, 230))
    for r_, (h, ten) in enumerate(hang):
        y0 = 24 + r_ * CH * Z
        d.text((6, y0 + CH * Z // 2 - 6), ten, fill=(230, 230, 230))
        for i, it in enumerate(xem[h]):
            nen = Image.new('RGBA', (O * 2, O * 2), (0, 0, 0, 0)); goc0 = (O // 2, O // 2)
            if 'neo' in it:
                X, Y, g, sau = it['neo']
                da_ = dt[h]; r = vk_meta[da_['vk']][0]; v = tam_vk.crop((r[0], r[1], r[0] + r[2], r[1] + r[3]))
                f = da_['vk_tl'] * 2
                v = v.resize((max(1, round(v.width * f)), max(1, round(v.height * f))), Image.NEAREST)
                gx, gy = da_['vk_cam'][0][0] * f, da_['vk_cam'][0][1] * f
                R = int(math.hypot(v.width, v.height)) + 4
                t = Image.new('RGBA', (2 * R, 2 * R), (0, 0, 0, 0)); t.alpha_composite(v, (int(R - gx), int(R - gy)))
                t = t.rotate(-g, resample=Image.NEAREST)
                lop = Image.new('RGBA', nen.size, (0, 0, 0, 0)); lop.paste(t, (int(goc0[0] + X - R), int(goc0[1] + Y - R)), t)
                if sau:
                    nen.alpha_composite(lop); nen.alpha_composite(it['than'], goc0)
                else:
                    nen.alpha_composite(it['than'], goc0); nen.alpha_composite(lop)
                nen.alpha_composite(it['tay'], goc0)
            else:
                nen.alpha_composite(it['than'], goc0)
            x0 = goc0[0] + CHAN[0] - CW // 2 + 20; y0c = goc0[1] + CHAN[1] - CH + 6
            o_ = nen.crop((x0, y0c, x0 + CW, y0c + CH)).resize((CW * Z, CH * Z), Image.NEAREST)
            P.alpha_composite(o_, (NHAN + i * CW * Z, y0))
    os.makedirs(os.path.dirname(p), exist_ok=True)
    P.convert('RGB').save(p, optimize=True)
    print('Ghi %s (%d×%d)' % (os.path.relpath(p, GOC_REPO), P.width, P.height))


def main():
    neo_all = json.load(open(NEO, encoding='utf-8'))
    dong = [(k, thu, gi, lap, doc_dong(thu, GOC_RIENG.get(thu))) for k, thu, gi, lap in DONG]
    H_dung = float(np.median([f['bb'][3] - f['bb'][1] for f in dong[0][4]]))
    s = CAO_96 / H_dung
    print('Chiều cao Zed đứng (nguồn): %.1f điểm ảnh → %d điểm ảnh ô 96; tỉ lệ co tấm đứng s = %.5f' % (H_dung, CAO_96, s))
    L_VK = max(f['im'].height for f in dong[0][4])  # chiều cao ảnh khung tấm đứng (nguồn): chuẩn độ dài vũ khí mọi hàng

    # ảnh vũ khí gốc (đủ 4 cấp)
    vk_goc = {}
    for loai, thu in VK:
        vk_goc[loai] = [Image.open(f).convert('RGBA') for f in sorted(glob.glob(os.path.join(MOI, thu + '-gif', thu, 'khung-*.png')))]
        assert len(vk_goc[loai]) == 4, thu
    q = Q_VK * s

    # ---------- tấm thân + nắm tay (bộ 1: ninja) ----------
    def vk_ninja(k, n, nam=False):
        d = {'vk': VK_THU_MUC[n['vk']]}
        # độ dài vũ khí theo Zed chuẩn (tấm đứng, tỉ lệ s), không theo hàng → cùng một cỡ ở mọi động tác
        sc = n.get('dai', DAI_CAP1) * L_VK / vk_goc[d['vk']][0].width  # điểm ảnh người nguồn (tấm đứng) / điểm ảnh vũ khí nguồn
        d['vk_tl'] = round(sc * s / (q * 2), 5)                         # điểm ảnh GAME / điểm ảnh ảnh vũ khí đã lưu
        cam = n.get('cam')
        d['vk_cam'] = []
        for cap in range(4):
            gx, gy = chuoi(vk_goc[d['vk']][cap], cam)
            bb = vk_goc[d['vk']][cap].getbbox()
            d['vk_cam'].append([round((gx - bb[0]) * q, 2), round((gy - bb[1]) * q, 2)])
        return d

    def neo_ninja(thu, i, f, kk):
        r_ = NC.R0_HANG.get(thu, 28)
        x, y = chinh_nam(f['im'], kk[0], kk[1], r_)
        return x, y, (chinh_nam(f['im'], *kk[4], r_) if len(kk) > 4 else None)

    neo_nam, bao_nam = NC.chuan_bi(neo_all, {thu: [f['im'] for f in fr] for k, thu, gi, lap, fr in dong}, L_VK)
    print('Nắm chuôi (gan-vk/nam_chuoi.py): thương dai %.3f cam %.2f, phi tiêu ×%.1f' % (NC.THUONG_DAI, NC.THUONG_CAM, NC.PHI_TO))
    for b_ in bao_nam:
        print('  ' + b_)
    tam, dt, xem, dau, r_hang, tran, cot = dung_than(dong, neo_all, s, vk_ninja, neo_ninja, neo_nam)
    hang_tay = tam.height // O

    # ---------- tấm vũ khí: mỗi loại một hàng, 4 cấp (dùng chung cho mọi bộ trang phục) ----------
    o_vk, vk_meta, yk = [], {}, 0
    for loai, thu in VK:
        xk, cao_h, ds = 0, 0, []
        for cap in range(4):
            v = vk_goc[loai][cap]; v = v.crop(v.getbbox())
            v = v.resize((max(1, round(v.width * q)), max(1, round(v.height * q))), Image.BOX)
            o_vk.append((v, xk, yk)); ds.append([xk, yk, v.width, v.height]); xk += v.width + 2; cao_h = max(cao_h, v.height)
        vk_meta[loai] = ds; yk += cao_h + 2
    W = max(x + v.width for v, x, y in o_vk)
    tam_vk = Image.new('RGBA', (W, yk), (0, 0, 0, 0))
    for v, x, y in o_vk:
        tam_vk.alpha_composite(v, (x, y))
    # LỚP NGÓN RIÊNG (nắm chuôi 15/10, nam_chuoi.ngon_anh): mỗi loại × cấp một nắm ngón theo bề dày cán ở điểm cầm (biến thể 'nam' của
    # hàng dung_<loại>), xếp thêm một hàng dưới cùng tấm zed-vk (các ô vũ khí cũ không dời). 'ngon': [x, y, rộng, cao, lệch] — đơn vị
    # điểm ảnh ô 96 (game vẽ ×0,5); lệch = tâm cán − điểm cầm theo phương vuông góc (điểm ảnh game).
    def doan_can(loai, cap, cx, cy):
        """Đoạn cán liền (y đầu, y cuối) trên cột cx của ảnh vũ khí (tấm zed-vk) chứa điểm cầm cy; None nếu cột trống ở đó."""
        r = vk_meta[loai][cap]
        cot_ = np.array(tam_vk.crop((r[0], r[1], r[0] + r[2], r[1] + r[3])))[:, min(r[2] - 1, max(0, int(round(cx)))), 3] > 0
        y0_ = int(round(cy))
        if not (0 <= y0_ < len(cot_)) or not cot_[y0_]:
            ys = np.nonzero(cot_)[0]
            if not len(ys):
                return None
            y0_ = int(ys[np.argmin(np.abs(ys - cy))])
        a_, b_ = y0_, y0_
        while a_ > 0 and cot_[a_ - 1]: a_ -= 1
        while b_ < len(cot_) - 1 and cot_[b_ + 1]: b_ += 1
        return a_, b_
    # biến thể 'nam': điểm cầm trên vũ khí dời về GIỮA bề dày cán (chuoi() lấy trung vị phần đỏ — có tua đỏ ở cấp cao thì lệch xuống)
    for k_, da_ in dt.items():
        if 'nam' not in da_:
            continue
        cam0 = da_['nam'].get('vk_cam', da_['vk_cam']); cam1 = []
        for cap in range(4):
            d_ = doan_can(da_['vk'], cap, *cam0[cap])
            cam1.append([cam0[cap][0], round((d_[0] + d_[1] + 1) / 2, 2)] if d_ else list(cam0[cap]))
        if cam1 != da_['vk_cam']:
            da_['nam']['vk_cam'] = cam1
    ngon_meta, ngon_anh, xk, cao_h = {}, [], 0, 0
    for loai, thu in VK:
        da_ = dt['dung_' + loai]; nm = da_.get('nam', {})
        tl, cam = nm.get('vk_tl', da_['vk_tl']), nm.get('vk_cam', da_['vk_cam'])
        ngon_meta[loai] = []
        for cap in range(4):
            d_ = doan_can(loai, cap, *cam[cap])
            t96 = max(2, int(round((d_[1] - d_[0] + 1) * tl * 2))) if d_ else 2
            lech = round(((d_[0] + d_[1] + 1) / 2 - cam[cap][1]) * tl, 2) if d_ else 0
            im_ = NC.ngon_anh(t96)
            ngon_anh.append((im_, xk)); ngon_meta[loai].append([xk, yk, im_.width, im_.height, lech])
            xk += im_.width + 2; cao_h = max(cao_h, im_.height)
    # NẮM TAY ÔM CÁN TỪ ẢNH (16/10, bao-cao-2.md; nam_chuoi.tach_nam_tay / nam_tay_96): 4 góc × (lớp SAU, lớp TRƯỚC) cho mỗi cỡ, thêm một hàng
    # nữa dưới hàng ngón. Cỡ (đường kính nắm tay kể cả viền, điểm ảnh ô 96) theo LOẠI vũ khí = chiều cao lớp ngón tự vẽ cấp 1 của loại đó
    # (= bề dày cán + 4, như lớp đang thay): nắm đấm thân Zed chỉ ~5 điểm ảnh, cán 4 điểm ảnh → cỡ thân thì cán che gần hết lòng bàn tay,
    # không thấy ngón ôm cán (đã thử, xem bao-cao-2.md mục 2). In thêm cỡ nắm đấm đo trên tấm đứng để so.
    # 'nam_tay': {goc: [độ], co: {loại: D}, sau: {D: [[x, y, rộng, cao, cx, cy] × 4]}, truoc: {...}} — đơn vị ô 96 (game vẽ ×0,5), (cx, cy) = tâm lỗ.
    nam_tay_meta, nam_tay_anh, cao2 = None, [], 0
    if os.path.exists(NC.ANH_NAM_TAY):
        dk = []
        for i_, f_ in enumerate(dong[0][4]):
            kk_ = neo_all['01-dung#kiem']['khung'][i_]
            xn_, yn_ = NC.tam_nam(f_['im'], kk_[0], kk_[1])
            a_ = np.array(f_['im']); m_ = ndimage.binary_closing(NC.da(a_), iterations=2); yy_, xx_ = np.mgrid[:a_.shape[0], :a_.shape[1]]
            lb_, _ = ndimage.label(m_); q_ = lb_[int(round(yn_)), int(round(xn_))]
            if q_:
                kh_ = (lb_ == q_) & ((xx_ - xn_) ** 2 + (yy_ - yn_) ** 2 < NC.R_NAM ** 2)
                dk.append(2 * math.sqrt(kh_.sum() / math.pi))
        D_than = int(round(float(np.median(dk)) * s)) + 2
        ds_ = NC.tach_nam_tay()
        co_ = {loai: ngon_meta[loai][0][3] for loai, _ in VK}
        nam_tay_meta = {'goc': [d_['goc'] for d_ in ds_], 'co': co_, 'sau': {}, 'truoc': {}}
        xk2, yk2 = 0, yk + cao_h + 2
        for D_ in sorted(set(co_.values())):
            for d_ in ds_:
                sau_, truoc_, (cx_, cy_) = NC.nam_tay_96(d_, D_)
                for ten_, im_ in (('sau', sau_), ('truoc', truoc_)):
                    nam_tay_anh.append((im_, xk2, yk2)); nam_tay_meta[ten_].setdefault(str(D_), []).append([xk2, yk2, im_.width, im_.height, cx_, cy_])
                    xk2 += im_.width + 2; cao2 = max(cao2, im_.height)
        print('Nắm tay ôm cán (ảnh %s): nắm đấm thân ở tấm đứng ≈ %d điểm ảnh ô 96 (khối da %.1f nguồn + viền); cỡ dùng %s; góc đo %s' % (
            os.path.basename(NC.ANH_NAM_TAY), D_than, float(np.median(dk)), co_, nam_tay_meta['goc']))
        xk = max(xk, xk2)
    t2_ = Image.new('RGBA', (max(W, xk), yk + cao_h + (2 + cao2 if nam_tay_meta else 0)), (0, 0, 0, 0)); t2_.alpha_composite(tam_vk, (0, 0))
    for im_, x_ in ngon_anh:
        t2_.alpha_composite(im_, (x_, yk))
    for im_, x_, y_ in nam_tay_anh:
        t2_.alpha_composite(im_, (x_, y_))
    tam_vk = t2_
    than = {
        'loai': 'linh-khi-sprite', 'doi_tuong': 'zed', 'ma': 'zed-moi', 'ten': 'Zed (bộ ảnh mới 13/10)', 'phien_ban': 1,
        'tam': png_b64(tam), 'net': 2, 'khung_rong': 48, 'khung_cao': 48, 'goc': [24, 45], 'rong': 16, 'cao': CAO_96 // 2,
        'he_neo': 'nguon-96', 'dong_tac': dt,
        'ghi_chu': 'Dựng bằng docs/anh-goc/zed/dung-zed-game.py. neo: [X96, Y96, góc độ, sau] theo ô 96×96 (chân 48,90); '
                   'vk_tl: điểm ảnh game trên 1 điểm ảnh tấm zed-vk; vk_cam: điểm cầm trên ảnh vũ khí từng cấp (điểm ảnh tấm zed-vk).',
    }
    vk = {
        'loai': 'linh-khi-sprite', 'doi_tuong': 'zed', 'ma': 'zed-vk', 'ten': 'Vũ khí Zed 4 loại × 4 cấp', 'phien_ban': 1,
        'tam': png_b64(tam_vk), 'vk': vk_meta, 'ngon': ngon_meta, **({'nam_tay': nam_tay_meta} if nam_tay_meta else {}), 'cap': ['Trắng', 'Mầm', 'Thành hình', 'Thức tỉnh'],
        'ti_le': round(q, 5), 'ghi_chu': 'Mỗi loại một hàng [x, y, rộng, cao] × 4 cấp; ti_le = điểm ảnh tấm / điểm ảnh ảnh gốc.',
    }
    ghi_tep('zed-moi', than)
    ghi_tep('zed-vk', vk)
    print('Tấm thân: %d×%d, %d hàng thân + %d hàng nắm tay' % (tam.width, tam.height, len(dong), hang_tay - len(dong)))
    if tran:
        print('  Tràn ô 96×96 đã xử lý: ' + ', '.join(tran))
    # bảng cỡ người từng hàng (ô 96): TRƯỚC = tỉ lệ chung s (chết ×1,639 cũ), SAU = s × r_hang
    print('\n| Hàng | r_hang | Đầu trước | Đầu sau | Cao người trước (TV/max) | Cao người sau (TV/max) |')
    print('|---|---|---|---|---|---|')
    for k, thu, gi, lap, fr in dong:
        cao_ng = [f['bb'][3] - f['bb'][1] for f in fr]
        s_cu = s * (H_dung / max(cao_ng) if thu == '06-chet-b2' else 1)
        s_moi = s * r_hang[thu]
        print('| %s | %.3f | %.1f | %.1f | %.1f / %.1f | %.1f / %.1f |' % (
            thu, r_hang[thu], dau[thu][0] * s_cu, dau[thu][0] * s_moi,
            np.median(cao_ng) * s_cu, max(cao_ng) * s_cu, np.median(cao_ng) * s_moi, max(cao_ng) * s_moi))
    xem_truoc(os.path.join(RA_XEM, 'xem-truoc-than.png'), xem, dt, vk_meta, tam_vk, cot)
    xem_cam_vk(os.path.join(RA_CAM, 'xem-cam-vk.png'), xem, dt, vk_meta, tam_vk)

    # ---------- CÁC BỘ TRANG PHỤC KHÁC (bộ 2 "Rừng", bộ 3 "Biển", bộ 4 "Lâu đài cổ"): xem dung_bo ----------
    ctx = {'dong': dong, 'neo_all': neo_all, 'neo_nam': neo_nam, 'dt': dt, 'vk_meta': vk_meta, 'tam_vk': tam_vk, 'than': than}
    for bo in BO_KHAC:
        dung_bo(ctx, **bo)


# Các bộ trang phục dựng thêm (cùng hàm dung_bo). ten_tam = tên thư mục ảnh đã cắt <ten>-cat/ (giống nhau ở mọi bộ, xem BO_TEN).
BO_KHAC = [
    dict(bo='rung', nhan='Rừng', thu_muc=RUNG, ma='zed-rung', ten='Zed — trang phục Thợ Săn Rừng (bộ 2)',
         ghi_them=' Bộ 2 "Rừng": neo dùng lại neo.json của hàng ninja tương ứng (quy đổi + chinh_nam trên ảnh Rừng); '
                  'vũ khí dùng chung tấm zed-vk.',
         r_nam=R_NAM_RUNG, xem=os.path.join(RA_XEM_RUNG, 'xem-truoc-rung.png')),
    # BỘ 3 "BIỂN" (13/10/2026, docs/review/ke-hoach-cai-thien/zed-bo-bien/YEU-CAU.md): áo ngắn tay (cẳng tay trần) → bán kính
    # chinh_nam như bộ Rừng. Sót màu băng tay trắng đã sửa thẳng PNG bằng trang-phuc/bo-3-bien/sua-bang-tay.py.
    dict(bo='bien', nhan='Biển', thu_muc=BIEN, ma='zed-bien', ten='Zed — trang phục Chiến Binh Biển (bộ 3)',
         ghi_them=' Bộ 3 "Biển": neo dùng lại neo.json của hàng ninja tương ứng (quy đổi + chinh_nam trên ảnh Biển); '
                  'vũ khí dùng chung tấm zed-vk.',
         r_nam=R_NAM_BIEN, xem=os.path.join(RA_XEM_BIEN, 'xem-truoc-bien.png')),
    # BỘ 4 "LÂU ĐÀI CỔ" (13/10/2026, docs/review/ke-hoach-cai-thien/zed-bo-lau/YEU-CAU.md): áo ngắn tay, găng da nâu hở ngón →
    # bán kính chinh_nam như bộ Rừng/Biển. 02-di, 03-chay-v4 cắt ở chế độ phục hồi (mũi chân khung 1 chạm mép), bao-cao.json dùng được.
    dict(bo='lau', nhan='Lâu đài', thu_muc=LAU, ma='zed-lau', ten='Zed — trang phục Hiệp Sĩ Lâu Đài (bộ 4)',
         ghi_them=' Bộ 4 "Lâu đài cổ": neo dùng lại neo.json của hàng ninja tương ứng (quy đổi + chinh_nam trên ảnh Lâu đài); '
                  'vũ khí dùng chung tấm zed-vk.',
         r_nam=R_NAM_LAU, xem=os.path.join(RA_XEM_LAU, 'xem-truoc-lau.png')),
]


def dung_bo(ctx, bo, nhan, thu_muc, ma, ten, ghi_them, r_nam, xem):
    """Dựng tấm thân một bộ trang phục khác bộ ninja (bộ 2 "Rừng": docs/review/ke-hoach-cai-thien/zed-bo-rung/YEU-CAU.md;
    bộ 3 "Biển": .../zed-bo-bien/YEU-CAU.md). Ảnh: <thu_muc>/<tên>-cat/<tên>/khung-NN.png (tên theo BO_TEN).
    Cùng chuẩn (net 2, goc [24,45], ô 96, chân (48,90), co từng hàng theo cỡ ĐẦU so với tấm đứng của chính bộ đó; đứng/đi/chạy neo
    ngang theo tâm đầu — NEO_DAU/DAU_X). Vũ khí: dùng chung tấm zed-vk, vk / vk_tl / vk_cam y hệt hàng ninja → vũ khí cùng cỡ ở mọi bộ.
    Neo: dùng lại gan-vk/neo.json của hàng ninja tương ứng (tư thế trùng). Điểm cầm đã chỉnh trên ảnh ninja (chinh_nam, như bộ ninja)
    được quy đổi sang ảnh bộ này theo điểm chân + tỉ lệ chiều cao hình (k = cao hình bộ này / cao hình ninja của cùng khung), rồi chạy
    chinh_nam trên ảnh bộ này (bán kính r_nam) để bám đúng nắm tay. Góc độ, sau, dai, cam giữ nguyên."""
    dong, neo_all, dt, vk_meta, tam_vk, than = (ctx[k] for k in ('dong', 'neo_all', 'dt', 'vk_meta', 'tam_vk', 'than'))
    print('\n===== Bộ "%s" =====' % nhan)
    ninja_fr = {thu: fr for k, thu, gi, lap, fr in dong}
    dong_r, neo_r, ve_ninja, nam_r = [], {}, {}, {}
    neo_nam = ctx.get('neo_nam') or {}
    for k, thu, gi, lap in DONG:
        if thu in CHI_NINJA:
            continue
        tt = BO_TEN.get(thu, thu)
        fr = doc_dong(tt, os.path.join(thu_muc, tt + '-cat'))
        assert len(fr) == len(ninja_fr[thu]), '%s: %d khung, ninja %d' % (tt, len(fr), len(ninja_fr[thu]))
        dong_r.append((k, tt, gi, lap, fr))
        ve_ninja[tt] = thu
        if thu in neo_all:
            neo_r[tt] = neo_all[thu]
            if thu in neo_nam:
                nam_r[tt] = neo_nam[thu]
        for loai, nc in neo_cam(neo_all, thu):  # cầm vũ khí lúc đứng/đi/chạy: neo theo hàng ninja tương ứng như mọi hàng
            neo_r[tt + '#' + loai] = nc
            if thu + '#' + loai in neo_nam:
                nam_r[tt + '#' + loai] = neo_nam[thu + '#' + loai]
    H_r = float(np.median([f['bb'][3] - f['bb'][1] for f in dong_r[0][4]]))
    s_r = CAO_96 / H_r
    print('Chiều cao Zed đứng bộ %s (nguồn): %.1f điểm ảnh; s = %.5f' % (nhan, H_r, s_r))
    lech = []

    def vk_bo(k, n, nam=False):
        d0 = {kk: dt[k][kk] for kk in ('vk', 'vk_tl', 'vk_cam')}
        if nam and 'nam' in dt[k]:
            d0.update({kk: dt[k]['nam'][kk] for kk in ('vk_tl', 'vk_cam') if kk in dt[k]['nam']})
        return d0

    def doi(fn, fr_, x, y):
        k_ = (fr_['bb'][3] - fr_['bb'][1]) / (fn['bb'][3] - fn['bb'][1])
        return fr_['chan'][0] + (x - fn['chan'][0]) * k_, fr_['chan'][1] + (y - fn['chan'][1]) * k_

    def neo_bo(tt, i, f, kk):
        fn = ninja_fr[ve_ninja[tt]][i]
        xn, yn = chinh_nam(fn['im'], kk[0], kk[1])
        x0, y0 = doi(fn, f, xn, yn)
        x, y = chinh_nam(f['im'], x0, y0, r_nam)
        lech.append(math.hypot(x - x0, y - y0))
        t2 = None
        if len(kk) > 4:
            t2 = chinh_nam(f['im'], *doi(fn, f, *chinh_nam(fn['im'], *kk[4])), r_nam)
        return x, y, t2

    tam_r, dt_r, xem_r, dau_r, r_hang_r, tran_r, cot_r = dung_than(dong_r, neo_r, s_r, vk_bo, neo_bo, nam_r, r_nam)
    tep = dict(than)
    tep.update({'ma': ma, 'ten': ten, 'tam': png_b64(tam_r), 'dong_tac': dt_r, 'bo': bo, 'ghi_chu': than['ghi_chu'] + ghi_them})
    ghi_tep(ma, tep)
    print('Tấm thân %s: %d×%d' % (nhan, tam_r.width, tam_r.height))
    if tran_r:
        print('  Tràn ô 96×96 đã xử lý: ' + ', '.join(tran_r))
    if lech:
        print('  chinh_nam trên ảnh %s dời điểm cầm (điểm ảnh nguồn): trung vị %.1f, lớn nhất %.1f, %d điểm' % (
            nhan, float(np.median(lech)), max(lech), len(lech)))
    print('| Hàng %s | r_hang | Đầu (ô 96) | Cao người TV (ô 96) |' % nhan)
    print('|---|---|---|---|')
    for k, tt, gi, lap, fr in dong_r:
        sk = s_r * r_hang_r[tt]
        print('| %s | %.3f | %.1f | %.1f |' % (tt, r_hang_r[tt], dau_r[tt][0] * sk, np.median([f['bb'][3] - f['bb'][1] for f in fr]) * sk))
    xem_truoc(xem, xem_r, dt_r, vk_meta, tam_vk, cot_r)
    xem_cam_vk(os.path.join(RA_CAM, 'xem-cam-vk-%s.png' % bo), xem_r, dt_r, vk_meta, tam_vk, bo)

if __name__ == '__main__':
    main()
