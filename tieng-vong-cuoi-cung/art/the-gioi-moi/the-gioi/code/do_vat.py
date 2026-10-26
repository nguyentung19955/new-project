"""Bước 2 – đồ vật: tách từng vật + trạng thái từ nguon/do-vat.png, đặt cỡ theo Lam 112 px / gạch 32 px (logic),
neo đáy giữa, atlas 2x + JSON.

Cỡ chọn (px logic, xem CO bên dưới): công tắc rộng 40 (~1,25 ô), cổng cao 128 (4 ô), điểm lưu cao 88 (~2,75 ô),
mảnh chuông / bình máu cao 24 (0,75 ô), thùng gỗ rộng 48 (1,5 ô), biển chỉ đường cao 72 (2,25 ô).
Cổng: ảnh nguồn chỉ có [đóng] [cột trái + cánh hé] [cánh mở hẳn + cột phải] → ghép lại cho cùng khung, cùng 2 cột:
  hé  = (cột trái + cánh hé) của nguồn + cột phải cắt từ cổng đóng
  mở  = (cánh mở + cột) của nguồn LẬT NGANG (để bản lề vẫn ở cột trái như cổng đóng/hé) + cột phải cắt từ cổng đóng."""
import numpy as np
import scipy.ndimage as nd

from chung import DOVAT, BOI, dan, doc_rgb, doi_co, khu_vien_trang, luu_json, luu_png, nen_trang, tach_vung, u8, xep_atlas

# vùng trên do-vat.png (x0,y0,x1,y1)
V = {
    'cong-tac-len': (30, 165, 337, 350),
    'cong-tac-an': (346, 222, 652, 350),
    'cong-tac-an-tia': (346, 138, 652, 350),
    'cong-dong': (676, 55, 1066, 394),
    'cong-he-goc': (1080, 55, 1233, 394),
    'cong-mo-goc': (1365, 55, 1518, 394),
    'diem-luu-tat': (26, 426, 425, 918),
    'diem-luu-sang': (440, 426, 842, 920),
    'manh-chuong': (884, 440, 1092, 672),
    'binh-mau': (1150, 462, 1290, 656),
    'thung-go': (914, 695, 1203, 955),
    'bien-chi-duong': (1256, 624, 1503, 946),
}
# (tên, cách đo cỡ, px logic, ghi chú)
CO = {
    'cong-tac': ('rong', 40, 'công tắc chuông – rộng ~1,25 ô'),
    'cong': ('cao', 128, 'cổng gỗ – cao 4 ô (cao hơn Lam 112)'),
    'diem-luu': ('cao', 88, 'điểm lưu có chuông – cao ~2,75 ô'),
    'manh-chuong': ('cao_loi', 24, 'mảnh chuông vàng – tinh thể cao 0,75 ô (quầng sáng thêm ngoài)'),
    'binh-mau': ('cao', 24, 'bình máu – cao 0,75 ô'),
    'thung-go': ('rong', 48, 'thùng gỗ – rộng 1,5 ô'),
    'bien-chi-duong': ('cao', 72, 'biển chỉ đường – cao 2,25 ô'),
}


def tach_quang(a, box, mau=(255, 206, 64), nguong=0.06, mu=1.0):
    """Tách vật có quầng sáng vàng nhạt: lõi (vùng được viền mực bao) đặc; ngoài lõi alpha = mức 'khác trắng' theo màu quầng."""
    x0, y0, x1, y1 = box
    sub = a[y0:y1, x0:x1]
    L = sub.mean(-1)
    muc = (sub[..., 1] < 205) | (L < 120)          # thân tinh thể cam/nâu đậm; quầng thì vàng nhạt (G > 205)
    loi = nd.binary_fill_holes(nd.binary_closing(muc, iterations=2))
    lab, n = nd.label(loi)
    if n:
        sz = nd.sum(loi, lab, range(1, n + 1))
        loi = lab == (1 + int(np.argmax(sz)))
    loi = nd.binary_dilation(loi, iterations=1)
    F = np.array(mau, float)
    al = np.clip((255 - sub.min(-1)) / (255 - F.min()), 0, 1) ** mu
    al[al < nguong] = 0
    col = np.where(al[..., None] > 0, (sub - 255 * (1 - al[..., None])) / np.maximum(al[..., None], 1e-3), 0)
    col = np.clip(col, 0, 255)
    rgb = np.where(loi[..., None], sub, col)
    alpha = np.where(loi, 1.0, al)
    out = np.dstack([rgb, alpha * 255])
    out = u8(out)
    out[out[..., 3] == 0] = 0
    return out, loi


def cat_sat(rg):
    al = rg[..., 3] > 0
    ys, xs = np.nonzero(al)
    return rg[ys.min():ys.max() + 1, xs.min():xs.max() + 1], (xs.min(), ys.min())


def chay():
    a = doc_rgb('do-vat.png')
    goc = {}
    for k, box in V.items():
        if k == 'manh-chuong':
            rg, loi = tach_quang(a, box)                     # có quầng
            goc['manh-chuong-quang'] = (rg, (box[0], box[1]), loi)
            rg, loi = tach_quang(a, box, nguong=0.55)        # chỉ lõi + tia lấp lánh (quầng để game tự vẽ)
            goc[k] = (rg, (box[0], box[1]), loi)
        else:
            rg, (ox, oy) = tach_vung(a, box, pad=0)
            if k in ('bien-chi-duong', 'binh-mau', 'thung-go'):
                lab, n = nd.label(rg[..., 3] > 0)          # chỉ giữ mảng lớn nhất (góc vùng lẹm vào vật bên cạnh)
                if n > 1:
                    sz = nd.sum(rg[..., 3] > 0, lab, range(1, n + 1))
                    rg[lab != 1 + int(np.argmax(sz))] = 0
            goc[k] = (rg, (ox, oy), None)

    # ---- cổng: ghép 3 trạng thái trên cùng khung toạ độ nguồn (khung của cổng đóng)
    dong, (dx0, dy0), _ = goc['cong-dong']
    H, W = dong.shape[:2]
    CAT_COT_PHAI = 980 - dx0                     # cột phải của cổng đóng bắt đầu từ x=980 nguồn (mép trái viền cột)
    cot_phai = np.zeros_like(dong)
    cot_phai[:, CAT_COT_PHAI:] = dong[:, CAT_COT_PHAI:]
    he, (hx0, hy0), _ = goc['cong-he-goc']
    mo, (mx0, my0), _ = goc['cong-mo-goc']
    mo = mo[:, ::-1].copy()
    # căn: mép trái cột trái (vùng có alpha đầu tiên ở nửa thân) của ảnh hé/mở ↔ của cổng đóng; cùng y nguồn
    def mep_trai(rg):
        r = rg[rg.shape[0] // 2 - 40: rg.shape[0] // 2 + 40, :, 3] > 128
        return int(np.nonzero(r.any(0))[0].min())
    ld = mep_trai(dong)
    st = {'cong-dong': dong.astype(float)}
    for ten, im, (ix, iy) in (('cong-he', he, (hx0, hy0)), ('cong-mo', mo, (mx0, my0))):
        c = np.zeros((H, W, 4))
        c = dan(c, im, ld - mep_trai(im), iy - dy0)
        c = dan(c, cot_phai, 0, 0)
        st[ten] = c
    # ---- đổi cỡ + neo
    out, meta = [], {}

    def he_so(nhom, rg, loi=None):
        cach, px, _ = CO[nhom]
        if cach == 'rong':
            return px * BOI / rg.shape[1]
        if cach == 'cao_loi':
            ys = np.nonzero(loi.any(1))[0]
            return px * BOI / (ys.max() - ys.min() + 1)
        return px * BOI / rg.shape[0]

    def them(ten, rg, s, nhom, neo_x=None, ghi=''):
        h, w = rg.shape[:2]
        im = doi_co(u8(rg), max(1, round(w * s)), max(1, round(h * s)))
        al = im[..., 3] > 0
        ys, xs = np.nonzero(al)
        x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
        im = im[y0:y1, x0:x1]
        nx = (neo_x * s - x0) if neo_x is not None else im.shape[1] / 2
        # đáy = hàng thấp nhất có ≥ 20 % điểm đặc trong hàng có nhiều điểm nhất (bỏ hạt lẻ)
        dem = (im[..., 3] > 128).sum(1)
        ny = int(np.nonzero(dem >= 0.2 * dem.max())[0].max()) + 1
        out.append((ten, im))
        meta[ten] = {'neo': [round(float(nx), 1), ny], 'nhom': nhom, 'mo_ta': CO[nhom][2] + (' · ' + ghi if ghi else ''),
                     'co_logic': [round(im.shape[1] / BOI, 1), round(im.shape[0] / BOI, 1)], 'he_so_nguon_sang_2x': round(s, 4)}

    def tam_chan(rg):
        """Tâm ngang của phần chân (20 % dưới) – để các trạng thái cùng neo dù hiệu ứng lệch."""
        al = rg[..., 3] > 128
        ys = np.nonzero(al.any(1))[0]
        band = al[ys.max() - max(4, (ys.max() - ys.min()) // 5): ys.max() + 1]
        xs = np.nonzero(band.any(0))[0]
        return (xs.min() + xs.max() + 1) / 2

    # công tắc: cùng hệ số, neo theo chân đế
    s = he_so('cong-tac', goc['cong-tac-len'][0])
    for k in ('cong-tac-len', 'cong-tac-an', 'cong-tac-an-tia'):
        rg = goc[k][0]
        them(k, rg, s, 'cong-tac', tam_chan(rg), {'cong-tac-len': 'chưa ấn', 'cong-tac-an': 'đã ấn',
                                                   'cong-tac-an-tia': 'đã ấn + tia "!" (khung hiệu ứng lúc vừa ấn)'}[k])
    s = he_so('cong', dong)
    for k, g in (('cong-dong', 'đóng'), ('cong-he', 'hé (bước 1)'), ('cong-mo', 'mở (bước 2)')):
        rg = st[k]
        # giữ nguyên khung chung: thêm 1 điểm gần trong suốt ở 2 góc để cắt sát không làm lệch khung giữa 3 trạng thái
        rg = rg.copy()
        them(k, rg, s, 'cong', tam_chan(st['cong-dong']), g)
    s = he_so('diem-luu', goc['diem-luu-tat'][0])
    for k, g in (('diem-luu-tat', 'chuông thường'), ('diem-luu-sang', 'chuông sáng (đã lưu)')):
        them(k, goc[k][0], s, 'diem-luu', tam_chan(goc[k][0]), g)
    rg, _, loi = goc['manh-chuong']
    s = he_so('manh-chuong', rg, loi)
    xl = np.nonzero(loi.any(0))[0]
    them('manh-chuong', rg, s, 'manh-chuong', (xl.min() + xl.max() + 1) / 2, 'lõi + tia lấp lánh, KHÔNG quầng (game vẽ quầng bằng gradient)')
    rg, _, _ = goc['manh-chuong-quang']
    them('manh-chuong-quang', rg, s, 'manh-chuong', (xl.min() + xl.max() + 1) / 2,
         'có quầng vàng bán trong suốt (tách theo màu quầng) – khung to, chỉ dùng nếu muốn quầng vẽ sẵn')
    for k in ('binh-mau', 'thung-go', 'bien-chi-duong'):
        them(k, goc[k][0], he_so(k, goc[k][0]), k)

    # cổng: 3 trạng thái cắt sát riêng → khung lệch nhau; đưa về cùng khung (theo neo) để game vẽ chồng mờ dần được
    cs = [k for k in meta if meta[k]['nhom'] == 'cong']
    L = max(meta[k]['neo'][0] for k in cs)
    Rr = max(dict(out)[k].shape[1] - meta[k]['neo'][0] for k in cs)
    T = max(meta[k]['neo'][1] for k in cs)
    Bb = max(dict(out)[k].shape[0] - meta[k]['neo'][1] for k in cs)
    Wc, Hc = int(np.ceil(L + Rr)), int(T + Bb)
    for i, (ten, im) in enumerate(out):
        if ten in cs:
            c = np.zeros((Hc, Wc, 4))
            c = dan(c, im, L - meta[ten]['neo'][0], T - meta[ten]['neo'][1])
            out[i] = (ten, u8(c))
            meta[ten]['neo'] = [round(float(L), 1), int(T)]
            meta[ten]['co_logic'] = [round(Wc / BOI, 1), round(Hc / BOI, 1)]
    for ten, im in out:
        luu_png(im, f'{DOVAT}/vat/{ten}.png')
    at, pos = xep_atlas(out, rong=1024)
    luu_png(at, f'{DOVAT}/do-vat-atlas.png')
    for k, v in pos.items():
        meta[k]['khung'] = v
    luu_json({
        'ten': 'Đồ vật thế giới mới – phong cách viền đen dày',
        'anh': 'do-vat-atlas.png',
        'quy_uoc': {
            'boi_so': 2, 'khung': '[x, y, rộng, cao] px ảnh 2x trong atlas',
            'neo': '[nx, ny] px ảnh 2x trong khung = điểm đáy-giữa (chỗ chạm đất). Vẽ ở logic: '
                   'drawImage(atlas, x,y,w,h, X - nx/2, Y - ny/2, w/2, h/2) với (X,Y) = điểm đáy-giữa trong thế giới.',
            'cong': '3 trạng thái cổng cùng cỡ khung + cùng neo → vẽ chồng, đổi alpha theo d.open (0 đóng → 0,5 hé → 1 mở).',
            'co_logic': 'cỡ khung tính theo px logic (= px ảnh / 2)',
        },
        'vat': meta,
    }, f'{DOVAT}/do-vat-atlas.json')
    print('đồ vật:', len(meta), '· atlas', at.shape[1], '×', at.shape[0])
    for k, v in meta.items():
        print(f'  {k:16s} {v["co_logic"]} logic  neo {v["neo"]}')
    return meta


if __name__ == '__main__':
    chay()
