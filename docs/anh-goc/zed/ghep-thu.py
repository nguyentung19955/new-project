#!/usr/bin/env python3
"""Ghép lớp Zed v2: thân + áo choàng + giáp + nón lá, THEO ĐIỂM NEO TỪNG KHUNG, có kiểm tra và ảnh xem thử.

Làm lại theo docs/review/ke-hoach-cai-thien/zed-asset/ghep-sua/YEU-CAU.md + YEU-CAU-2.md (YEU-CAU-2 thắng).
Hướng dẫn chạy + chỉnh neo: docs/anh-goc/zed/README-ghep-lop.md

Chạy (từ gốc repo):
  python3 docs/anh-goc/zed/ghep-thu.py                      # đọc v2/, ghi neo tự động + ảnh kiểm + (nếu ĐẠT) lớp chính thức
  python3 docs/anh-goc/zed/ghep-thu.py --day-non an         # bản thử: không vẽ dây nón
  python3 docs/anh-goc/zed/ghep-thu.py --chi-kiem           # chỉ kiểm + ảnh debug, không ghi lớp chính thức

Nguyên tắc (khác bản cũ, xem bao-cao.md):
- Tách tấm bằng cat-diem-anh.tach_sheet ở chế độ CHÍNH THỨC: thiếu/thừa khung → dừng, không tự cắt/gộp.
- Khung thân k ghép với khung k cùng hàng của từng lớp (cả 4 tấm đều 8 × 3, kiểm số khung trước).
- Điểm neo đo TỪNG KHUNG trên thân (mặt, mắt, sừng, cổ, eo, vai, lưng, chân) và trên đồ (vành nón, lỗ sừng,
  cổ giáp, đai, khuy áo choàng). Không dùng tâm khung bao làm neo giải phẫu. Tệp chỉnh tay thắng tệp tự động.
- Nón lá: TÁCH làm hai phần theo hình học của chính ảnh nón (không đoán vùng bị che):
    non_truoc = chóp + vành (mọi điểm ảnh từ mép dưới vành trở lên, từng cột) → vẽ TRÊN thân (lớp 85),
                đục lỗ đúng hình sừng của thân ở khung đó → sừng thật hiện qua lỗ, không bị vẽ lại;
    non_sau   = mặt dưới nón + dây + nút dây + đuôi dây (phần dưới vành) → vẽ SAU thân (lớp 35)
                → dây không bao giờ cắt ngang mặt/mắt; chỉ lộ ra ngoài viền người.
  Vị trí: nón thấp nhất có thể mà phần non_truoc KHÔNG chạm vùng mặt bảo vệ (mắt + mặt dưới mắt, nới 2–4 điểm ảnh),
  lệch ngang tối đa ±12 điểm ảnh quanh giữa đầu để lỗ sừng vẽ sẵn của nón trùng sừng thật nhiều nhất.
- Giáp: một tỉ lệ cho cả 3 hàng (đo ở hàng đứng: cổ→eo thân / cổ→đai giáp), đặt cổ giáp vào cổ thân từng khung.
- Áo choàng: một tỉ lệ (đuôi áo tới ~75% đoạn cổ→chân ở hàng đứng), khuy áo đặt vào neo lưng từng khung, vẽ sau thân.
- Đổi cỡ: tỉ lệ 1 → không đổi cỡ. Tỉ lệ khác 1 → NEAREST + alpha cắt ngưỡng 128 (không sinh màu/alpha trung gian);
  ảnh so sánh NEAREST/BOX/LANCZOS ghi ở anh/so-sanh-doi-co.png. Ảnh xem thử phóng to bằng NEAREST ×2, ×3 (bội nguyên).
"""
import argparse, copy, importlib.util, json, os, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd

DAY = os.path.dirname(os.path.abspath(__file__))
GOC_REPO = os.path.normpath(os.path.join(DAY, '..', '..', '..'))
_sp = importlib.util.spec_from_file_location('cat_diem_anh', os.path.join(DAY, 'cat-diem-anh.py'))
cat = importlib.util.module_from_spec(_sp)
_sp.loader.exec_module(cat)

TEN_HANG = ['dung', 'di', 'chay']
GIAY = [1.2, 0.9, 0.6]          # SPEC mục 4
SO_COT, SO_HANG = 8, 3
PAD = 80                         # lề canvas quanh khung thân (đủ cho nón, áo choàng)
LOP_VE = {'ao_choang': 20, 'non_sau': 35, 'than': 40, 'giap': 60, 'non_truoc': 85}   # SPEC mục 2 (+ non_sau mới)
NGUON = {'than': 'v2/00-than-dung-di-chay.png', 'giap': 'v2/05-lop-giap-do.png',
         'non': 'v2/06-lop-non-la.png', 'ao_choang': 'v2/07-lop-ao-choang.png'}


def rel(p):
    return os.path.relpath(p, GOC_REPO)


# ============================================================== phân loại màu (đo trên ảnh thật, xem bao-cao.md)
def lop_mau_than(img, v):
    a = np.array(img)[..., :3].astype(int)
    R, G, B = a[..., 0], a[..., 1], a[..., 2]
    da = v & (R > 215) & (G > 120) & (G < 215) & (B > 100) & (B < 200) & (R - B > 45)
    do = v & (R > 90) & (R - G > 60) & (R - B > 45) & (G < 100)
    toc = v & (R > 150) & (B > 130) & (R - B < 45) & (G > 110)
    return da, do, toc


# ============================================================== neo THÂN (từng khung)
def do_neo_than(f):
    """Trả (neo, tin_cay, can_chinh_tay, mat_na_sung). Toạ độ: điểm ảnh, gốc = góc trên-trái khung bao của hình."""
    v = f['mask']
    H, W = v.shape
    da, do, toc = lop_mau_than(f['img'], v)
    neo, tc, can = {}, {}, []
    # mặt: vùng da lớn nhất có tâm ở nửa trên
    lab, n = nd.label(da)
    tot = None
    for i in range(1, n + 1):
        ys, xs = np.where(lab == i)
        if len(ys) < 80 or ys.mean() > 0.5 * H:
            continue
        if tot is None or len(ys) > tot[0]:
            tot = (len(ys), ys, xs)
    if tot is None:
        return {}, {'mat': 0}, ['mat', 'mat_mat', 'sung', 'co'], np.zeros_like(v)
    _, fy, fx = tot
    fx0, fx1, fy0, fy1 = int(fx.min()), int(fx.max()), int(fy.min()), int(fy.max())
    neo['tam_mat'] = [round(float(fx.mean()), 1), round(float(fy.mean()), 1)]
    tc['mat'] = 0.9
    # mắt: điểm ảnh đỏ trong vùng mặt (nới 2–3 điểm ảnh), từ trên mặt 8 điểm ảnh tới 60% chiều cao mặt
    er = do.copy()
    er[:max(0, fy0 - 8)] = 0
    er[int(fy0 + 0.6 * (fy1 - fy0)):] = 0
    er[:, :max(0, fx0 - 2)] = 0
    er[:, fx1 + 3:] = 0
    ey, ex = np.where(er)
    if len(ey) < 20:
        can.append('mat_mat')
        tc['mat_mat'] = 0.2
        e = [fx0, fy0, fx1, fy0 + (fy1 - fy0) // 2]
    else:
        e = [int(ex.min()), int(ey.min()), int(ex.max()), int(ey.max())]
        tc['mat_mat'] = 0.85
    neo['mat_mat'] = e
    # vùng mặt BẢO VỆ: từ trên mắt 4 điểm ảnh (lông mày/tóc mái sát mắt) tới cằm, rộng phủ cả mặt và mắt + 2
    neo['mat'] = [min(e[0], fx0) - 2, e[1] - 4, max(e[2], fx1) + 2, fy1]
    # sừng: vùng đỏ phía trên mắt, > 60 điểm ảnh, CHẠM tóc, không lệch về sau quá 40 điểm ảnh (loại đuôi khăn bay)
    hr = do.copy()
    hr[max(0, e[1] - 2):] = 0
    lab, n = nd.label(hr)
    ds = []
    for i in range(1, n + 1):
        cm = lab == i
        ys, xs = np.where(cm)
        if len(ys) <= 60:
            continue
        cham = int((nd.binary_dilation(cm, iterations=5) & toc).sum())
        if cham < 10 or xs.mean() < fx0 - 40:
            continue
        ds.append((len(ys), i, ys, xs))
    ds = sorted(ds, key=lambda t: -t[0])[:2]
    sung_mask = np.isin(lab, [t[1] for t in ds]) if ds else np.zeros_like(v)
    sung = []
    for _, i, ys, xs in sorted(ds, key=lambda t: t[3].mean()):
        j = int(np.argmin(ys))
        k = int(np.argmax(ys))
        sung.append({'dinh': [int(xs[j]), int(ys[j])], 'chan': [int(xs[k]), int(ys[k])],
                     'khung_bao': [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())], 'diem_anh': int(len(ys))})
    if len(sung) == 2:
        neo['sung_trai'], neo['sung_phai'] = sung
        tc['sung'] = 0.85
    else:
        can.append('sung')
        tc['sung'] = 0.2
        for s, t in zip(sung, ['sung_trai', 'sung_phai']):
            neo[t] = s
    # đỉnh đầu: điểm tóc cao nhất (không tính sừng)
    ty, tx = np.where(toc)
    if len(ty):
        j = int(np.argmin(ty))
        neo['dinh_dau'] = [int(tx[j]), int(ty[j])]
    # cổ: ngay dưới cằm, lệch về sau 10% bề ngang mặt (mặt 3/4 quay phải)
    co = [round(fx0 + 0.4 * (fx1 - fx0), 1), fy1 + 5]
    neo['co'] = co
    tc['co'] = 0.7
    # eo: hàng có nhiều điểm ảnh đỏ nhất (đai đỏ) dưới cổ 12+ điểm ảnh, trong ±35 điểm ảnh quanh cổ
    rr = do.copy()
    rr[:int(co[1]) + 12] = 0
    rr[int(co[1]) + 70:] = 0
    rr[:, :max(0, int(co[0]) - 30)] = 0
    rr[:, int(co[0]) + 40:] = 0
    cnt = rr.sum(1)
    if cnt.max() >= 6:
        wy = int(np.argmax(cnt))
        wx = np.where(rr[wy])[0]
        neo['eo'] = [round((wx.min() + wx.max()) / 2, 1), wy]
        tc['eo'] = 0.7
    else:
        can.append('eo')
        tc['eo'] = 0.0
    if 'eo' in neo:
        neo['nguc'] = [round((co[0] + neo['eo'][0]) / 2, 1), round((co[1] + neo['eo'][1]) / 2, 1)]
    # vai + lưng: hàng 1/4 đoạn cổ→eo, bỏ khăn đỏ và tóc; điểm ngoài cùng hai phía trong ±45 điểm ảnh quanh cổ
    if 'eo' in neo:
        yv = int(co[1] + 0.25 * (neo['eo'][1] - co[1]))
        hang = v[yv] & ~do[yv] & ~toc[yv]
        xs = np.where(hang)[0]
        xs = xs[(xs > co[0] - 45) & (xs < co[0] + 45)]
        if len(xs):
            neo['vai_sau'] = [int(xs.min()), yv]
            neo['vai_truoc'] = [int(xs.max()), yv]
            neo['lung'] = [int(xs.min()) + 3, int(co[1]) + 2]
            tc['vai'] = 0.5
            tc['lung'] = 0.6
    for k in ('vai', 'lung'):
        if k not in tc:
            can.append(k)
            tc[k] = 0.0
    # tay cầm vũ khí: chưa đo tự động được đáng tin (không cần cho 3 món này) → để trống, cần chỉnh tay
    neo['tay_cam'] = None
    can.append('tay_cam')
    tc['tay_cam'] = 0.0
    neo['chan'] = [round(f['chan'][0] - f['khung_bao'][0], 1), f['cao']]
    return neo, tc, can, sung_mask


# ============================================================== neo ĐỒ
def doi_co(img, s):
    """Tỉ lệ 1: giữ nguyên. Khác 1: NEAREST + alpha nhị phân (không sinh màu/alpha trung gian)."""
    if abs(s - 1) < 1e-6:
        return img
    o = img.resize((max(1, round(img.width * s)), max(1, round(img.height * s))), Image.NEAREST)
    a = np.array(o)
    a[..., 3] = np.where(a[..., 3] >= 128, 255, 0)
    return Image.fromarray(a, 'RGBA')


def tach_non(img):
    """Chia ảnh nón (đã đổi cỡ) thành non_truoc / non_sau theo mép dưới vành từng cột.
    Trả (truoc, sau, mau_sung_ve_san, neo)."""
    a = np.array(img)
    v = a[..., 3] > 127
    R, G, B = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    rom = v & (R > 190) & (G > 110) & (B > 50) & (R - B > 25) & (G - B > 10)      # màu lá nón
    rom = nd.binary_closing(rom, iterations=2) & v
    lab, n = nd.label(rom)
    if n:
        dt = nd.sum(rom, lab, range(1, n + 1))
        rom = np.isin(lab, np.where(dt > 50)[0] + 1)
    H, W = v.shape
    day = np.full(W, -1)
    for x in range(W):
        ys = np.where(rom[:, x])[0]
        if len(ys):
            day[x] = ys.max()
    yy = np.arange(H)[:, None]
    truoc = v & (day[None, :] >= 0) & (yy <= day[None, :] + 3)   # +3: viền tối dưới mép vành
    sau = v & ~truoc
    sung_ve = truoc & (((R > 110) & (R - G > 80) & (G < 70)) | ((R > 215) & (G > 200) & (B > 185)))
    xs = np.where(day >= 0)[0]
    ty, tx = np.where(rom)
    neo = {'vanh_trai': [int(xs.min()), int(day[xs.min()])], 'vanh_phai': [int(xs.max()), int(day[xs.max()])],
           'dinh_non': [int(tx[np.argmin(ty)]), int(ty.min())] if len(ty) else None}
    lab, n = nd.label(sung_ve & ((R > 110) & (R - G > 80) & (G < 70)))
    lo = []
    for i in range(1, n + 1):
        ys, xs2 = np.where(lab == i)
        if len(ys) > 40:
            lo.append([round(float(xs2.mean()), 1), round(float(ys.mean()), 1), int(len(ys))])
    neo['lo_sung_ve_san'] = sorted(lo)
    return truoc, sau, sung_ve, neo


def do_neo_giap(f):
    v = f['mask']
    a = np.array(f['img'])[..., :3].astype(int)
    H, W = v.shape
    toi = v & (a.sum(2) / 3 < 45)
    vung = np.zeros_like(v)
    vung[:int(0.35 * H), int(0.3 * W):int(0.85 * W)] = True
    lab, n = nd.label(toi & vung)
    if not n:
        return None
    dt = nd.sum(toi & vung, lab, range(1, n + 1))
    ys, xs = np.where(lab == np.argmax(dt) + 1)
    co = [round(float(xs.mean()), 1), round(float(ys.mean()), 1)]
    vang = v & (a[..., 0] > 200) & (a[..., 1] > 130) & (a[..., 2] < 120)
    y0 = int(co[1] + 0.25 * H)
    cnt = vang[y0:int(0.85 * H), int(0.25 * W):int(0.75 * W)].sum(1)
    dy = y0 + int(np.argmax(cnt)) if len(cnt) and cnt.max() > 0 else None
    out = {'co_giap': co, 'dai': None}
    if dy is not None:
        bx = np.where(vang[dy])[0]
        out['dai'] = [round((bx.min() + bx.max()) / 2, 1), dy]
    return out


def do_neo_ao_choang(f):
    v = f['mask']
    H, W = v.shape
    r = v.copy()
    r[int(0.35 * H):] = False
    r[:, :int(0.7 * W)] = False
    ys, xs = np.where(r)
    if not len(ys):
        return None
    return {'khuy': [round(float(xs.mean()), 1), round(float(ys.mean()), 1)], 'day_ao': int(np.where(v.any(1))[0].max())}


# ============================================================== chỉnh tay
def doc_chinh_tay(path):
    if not path or not os.path.exists(path):
        return {}
    d = json.load(open(path, encoding='utf-8'))
    assert d.get('loai') == 'linh-khi-neo-chinh-tay', 'tệp chỉnh tay phải có "loai": "linh-khi-neo-chinh-tay"'
    return d


def ap_chinh_tay(neo_tu_dong, ct):
    """Trộn: chỉnh tay thắng. ct['than'][hang][khung] = {ten_neo: gia_tri}; ct['lop'][lop][hang][khung] = {'lech': [dx,dy]} hoặc {'dat': [x,y]}."""
    neo = copy.deepcopy(neo_tu_dong)
    for hang, ks in (ct.get('than') or {}).items():
        for kk, d in ks.items():
            k = neo['than']['dong_tac'][hang][int(kk) - 1]
            for ten, gt in d.items():
                k['neo'][ten] = gt
                k['nguon_neo'][ten] = 'chinh-tay'
                if ten in k['can_chinh_tay']:
                    k['can_chinh_tay'].remove(ten)
                if ten.startswith('sung') and 'sung' in k['can_chinh_tay']:
                    k['can_chinh_tay'].remove('sung')
    return neo


# ============================================================== chính
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--ra', default=os.path.join(GOC_REPO, 'docs/review/ke-hoach-cai-thien/zed-asset/ghep-sua/anh'))
    ap.add_argument('--neo', default=os.path.join(DAY, 'neo'))
    ap.add_argument('--lop-ra', default=os.path.join(DAY, 'lop-ghep'), help='nơi ghi lớp CHÍNH THỨC (chỉ khi mọi kiểm bắt buộc ĐẠT)')
    ap.add_argument('--day-non', default='sau', choices=['sau', 'an'], help='sau = dây nón vẽ sau thân (mặc định); an = bỏ dây (bản thử)')
    ap.add_argument('--chi-kiem', action='store_true')
    ap.add_argument('--lech-non', type=int, default=12, help='nón được lệch ngang tối đa bao nhiêu điểm ảnh quanh giữa đầu để khớp lỗ sừng')
    a = ap.parse_args()
    os.makedirs(a.ra, exist_ok=True)
    os.makedirs(a.neo, exist_ok=True)
    bao = {'loai': 'linh-khi-bao-cao-ghep', 'phien_ban': 1, 'nguon': {k: 'docs/anh-goc/zed/' + v for k, v in NGUON.items()},
           'tach': {}, 'loi': [], 'canh_bao': [], 'kiem_tu_dong': {}, 'kiem_bang_mat': None}

    # ---------- 1. tách 4 tấm (chính thức: sai số khung → dừng)
    T = {}
    for k, p in NGUON.items():
        bc = cat.tach_sheet(os.path.join(DAY, p), SO_HANG, SO_COT, TEN_HANG, 'chinh-thuc')
        T[k] = bc
        bao['tach'][k] = {'dat': bc['dat'], 'so_khung': [h['so_khung'] for h in bc['hang']], 'loi': bc['loi'],
                          'canh_bao': bc['canh_bao'], 'manh_bo': bc['manh_bo'], 'tach_nen': bc['tach_nen']}
        if not bc['dat']:
            bao['loi'].append('Tấm %s không tách được đúng %d×%d khung: %s' % (p, SO_COT, SO_HANG, '; '.join(bc['loi'])))
    if bao['loi']:
        json.dump(bao, open(os.path.join(a.ra, 'bao-cao-kiem.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        for x in bao['loi']:
            print('LỖI:', x)
        print('→ DỪNG: không ghép khi số khung chưa đúng (xem cat-diem-anh.py --che-do phuc-hoi để xem thử).')
        raise SystemExit(1)

    # ---------- 2. neo thân + neo đồ (tự động)
    neo = {'loai': 'linh-khi-neo', 'phien_ban': 1, 'nhan_vat': 'zed-v2',
           'he_toa_do': 'nguon-khung: điểm ảnh tấm nguồn, gốc (0,0) = góc trên-trái khung_bao của hình trong tấm; x sang phải, y xuống. '
                        'khung_bao = [x0, y0, x1, y1] trên tấm. Hộp = [x0, y0, x1, y1]. Lớp: "dat" = vị trí góc trên-trái ảnh lớp (đã đổi cỡ) '
                        'trong hệ toạ độ khung THÂN cùng hàng/khung.',
           'ghi_chu': 'TỰ ĐỘNG — đừng sửa tay tệp này (bị ghi đè). Chỉnh trong zed-v2.neo.chinh-tay.json (thắng tệp này).',
           'than': {'anh': 'docs/anh-goc/zed/' + NGUON['than'], 'dong_tac': {}}, 'lop': {}}
    sung_mask = {}
    for r, t in enumerate(TEN_HANG):
        ds = []
        for f in T['than']['hang'][r]['khung']:
            n_, tc, can, sm = do_neo_than(f)
            sung_mask[(r, f['stt'])] = sm
            ds.append({'khung': f['stt'], 'khung_bao': f['khung_bao'], 'neo': n_, 'tin_cay': tc, 'can_chinh_tay': can,
                       'nguon_neo': {k: 'tu-dong' for k in n_}})
        neo['than']['dong_tac'][t] = ds
    ct = doc_chinh_tay(os.path.join(a.neo, 'zed-v2.neo.chinh-tay.json'))
    neo_dung = ap_chinh_tay(neo, ct) if ct else neo
    NT = lambda r, k: neo_dung['than']['dong_tac'][TEN_HANG[r]][k]

    # tỉ lệ giáp: trung vị hàng đứng (cổ→eo thân) / (cổ giáp→đai giáp)
    ti = []
    for k in range(SO_COT):
        nt = NT(0, k)['neo']
        ng = do_neo_giap(T['giap']['hang'][0]['khung'][k])
        if ng and ng['dai'] and 'eo' in nt and ng['dai'][1] > ng['co_giap'][1]:
            ti.append((nt['eo'][1] - nt['co'][1]) / (ng['dai'][1] - ng['co_giap'][1]))
    ti_giap = round(float(np.median(ti)), 3) if ti else None
    # tỉ lệ áo choàng: (khuy→đáy áo) = 75% (cổ→chân) ở hàng đứng
    ti = []
    for k in range(SO_COT):
        nt = NT(0, k)['neo']
        na = do_neo_ao_choang(T['ao_choang']['hang'][0]['khung'][k])
        if na:
            ti.append(0.75 * (nt['chan'][1] - nt['co'][1]) / (na['day_ao'] - na['khuy'][1]))
    ti_ao = round(float(np.median(ti)), 3) if ti else None
    # tỉ lệ đo được trong ±3% quanh 1 → lấy đúng 1 (không đổi cỡ, giữ nguyên điểm ảnh nguồn)
    lam_tron = lambda x: 1.0 if x and abs(x - 1) < 0.03 else x
    ti_le = {'non': 1.0, 'giap': lam_tron(ti_giap), 'ao_choang': lam_tron(ti_ao)}
    bao['ti_le_do_duoc'] = {'giap': ti_giap, 'ao_choang': ti_ao}
    for k, v in (ct.get('ti_le') or {}).items():
        ti_le[k] = v
    if not ti_giap or not ti_ao:
        bao['loi'].append('Không đo được tỉ lệ giáp/áo choàng (ti_le=%s) — đặt "ti_le" trong tệp chỉnh tay' % ti_le)
    bao['ti_le'] = ti_le
    bao['ti_le_ghi_chu'] = ('nón 1,0 (không đổi cỡ: giữ nguyên điểm ảnh nguồn, vành rộng ~1,1–1,3 lần đầu như nón lá thật); '
                            'giáp %s = trung vị hàng đứng (cổ→eo thân)/(cổ→đai giáp); áo choàng %s = đuôi áo tới 75%% đoạn cổ→chân. '
                            'Một tỉ lệ cho cả 3 hàng để giáp/áo không đổi cỡ giữa động tác.' % (ti_giap, ti_ao))

    # ---------- 3. đặt từng lớp từng khung
    lop_neo = {'non_la': {'anh': 'docs/anh-goc/zed/' + NGUON['non'], 'ti_le': ti_le['non'], 'dong_tac': {}},
               'giap': {'anh': 'docs/anh-goc/zed/' + NGUON['giap'], 'ti_le': ti_le['giap'], 'dong_tac': {}},
               'ao_choang': {'anh': 'docs/anh-goc/zed/' + NGUON['ao_choang'], 'ti_le': ti_le['ao_choang'], 'dong_tac': {}}}
    KQ = {}   # (r,k) → dict lớp → (Image RGBA cỡ canvas)
    kiem = []
    for r, t in enumerate(TEN_HANG):
        for nm in lop_neo:
            lop_neo[nm]['dong_tac'][t] = []
        for k in range(SO_COT):
            fb = T['than']['hang'][r]['khung'][k]
            nb = NT(r, k)
            n_ = nb['neo']
            H, W = fb['mask'].shape
            CW, CH = W + 2 * PAD, H + 2 * PAD
            kq = {'than': Image.new('RGBA', (CW, CH), (0, 0, 0, 0))}
            kq['than'].alpha_composite(fb['img'], (PAD, PAD))
            ghi = {'hang': t, 'khung': k + 1, 'loi': [], 'canh_bao': []}
            if 'mat' not in n_:
                ghi['loi'].append('không tìm được mặt → không bảo vệ được mặt; cần chỉnh tay "mat"')
            # --- nón
            fn = T['non']['hang'][r]['khung'][k]
            ni = doi_co(fn['img'], ti_le['non'])
            truoc, sau, sung_ve, nn = tach_non(ni)
            P = np.zeros((H, W), bool)
            if 'mat' in n_:
                x0, y0, x1, y1 = n_['mat']
                P[max(0, y0):y1 + 1, max(0, x0):x1 + 1] = True
            da, do, toc = lop_mau_than(fb['img'], fb['mask'])
            yb = max(0, (n_.get('mat_mat') or [0, 6])[1] - 6)
            xs = np.where((toc | da)[yb])[0]
            giua_dau = (xs.min() + xs.max()) / 2 if len(xs) else W / 2
            hx = np.where(truoc.any(0))[0]
            ox0 = int(round(giua_dau - (hx.min() + hx.max()) / 2))
            SM = sung_mask[(r, k + 1)]
            fy, fx = np.where(truoc)
            sy, sx = np.where(sung_ve)
            tot = None
            chinh_non = ((ct.get('lop') or {}).get('non_la') or {}).get(t, {}).get(str(k + 1), {})
            if 'dat' in chinh_non:
                tot = (None, chinh_non['dat'][0], chinh_non['dat'][1])
            else:
                for oy in range(-ni.height, H // 2):
                    Y = fy + oy
                    for ox in range(ox0 - a.lech_non, ox0 + a.lech_non + 1):
                        X = fx + ox
                        ok = (Y >= 0) & (Y < H) & (X >= 0) & (X < W)
                        if P[Y[ok], X[ok]].any():
                            continue
                        Y2, X2 = sy + oy, sx + ox
                        ok2 = (Y2 >= 0) & (Y2 < H) & (X2 >= 0) & (X2 < W)
                        diem = int(SM[Y2[ok2], X2[ok2]].sum())
                        khoa = (diem, oy, -abs(ox - ox0))
                        if tot is None or khoa > tot[0]:
                            tot = (khoa, ox, oy)
            _, ox, oy = tot
            if 'lech' in chinh_non:
                ox, oy = ox + chinh_non['lech'][0], oy + chinh_non['lech'][1]
            # đục lỗ sừng: điểm ảnh non_truoc trùng sừng thân → trong suốt (sừng thật hiện qua)
            lo = np.zeros(truoc.shape, bool)
            ys, xs2 = np.where(SM)
            Y, X = ys - oy, xs2 - ox
            ok = (Y >= 0) & (Y < truoc.shape[0]) & (X >= 0) & (X < truoc.shape[1])
            lo[Y[ok], X[ok]] = True
            an = np.array(ni)
            at = an.copy()
            at[..., 3] = np.where(truoc & ~lo, 255, 0)
            asau = an.copy()
            asau[..., 3] = np.where(sau if a.day_non == 'sau' else np.zeros_like(sau), 255, 0)
            for ten, arr in (('non_truoc', at), ('non_sau', asau)):
                c = Image.new('RGBA', (CW, CH), (0, 0, 0, 0))
                c.alpha_composite(Image.fromarray(arr, 'RGBA'), (PAD + ox, PAD + oy))
                kq[ten] = c
                if PAD + ox < 0 or PAD + oy < 0 or PAD + ox + ni.width > CW or PAD + oy + ni.height > CH:
                    ghi['loi'].append('%s tràn ra ngoài canvas' % ten)
            vanh_y = max(nn['vanh_trai'][1], nn['vanh_phai'][1]) + oy
            lop_neo['non_la']['dong_tac'][t].append({
                'khung': k + 1, 'khung_bao': fn['khung_bao'], 'neo': nn, 'dat': [int(ox), int(oy)],
                'nguon_dat': 'chinh-tay' if chinh_non else 'tu-dong',
                'diem_khop_lo_sung': None if tot[0] is None else int(tot[0][0]),
                'mau_sung_ve_san_con_lo': int((sung_ve & ~lo).sum()), 'mau_sung_ve_san': int(sung_ve.sum())})
            # --- giáp
            fg = T['giap']['hang'][r]['khung'][k]
            ng = do_neo_giap(fg)
            gi = doi_co(fg['img'], ti_le['giap'])
            chinh = ((ct.get('lop') or {}).get('giap') or {}).get(t, {}).get(str(k + 1), {})
            if ng:
                gx = int(round(n_['co'][0] - ng['co_giap'][0] * ti_le['giap']))
                gy = int(round(n_['co'][1] + 6 - ng['co_giap'][1] * ti_le['giap']))  # tâm lỗ cổ giáp thấp hơn cổ 6 điểm ảnh (cổ áo ôm dưới cằm)
                # giáp không được che mặt: nếu cổ áo giáp chạm vùng mặt bảo vệ thì hạ dần (tối đa 20 điểm ảnh), ghi lại
                gm = np.array(gi)[..., 3] > 0
                gyy, gxx = np.where(gm)
                ha = 0
                while ha <= 20:
                    Y, X = gyy + gy + ha, gxx + gx
                    ok = (Y >= 0) & (Y < H) & (X >= 0) & (X < W)
                    if not P[Y[ok], X[ok]].any():
                        break
                    ha += 1
                if ha > 20:
                    ghi['loi'].append('giáp chạm mặt dù đã hạ 20 điểm ảnh')
                    ha = 0
                elif ha:
                    ghi['canh_bao'].append('giáp hạ %d điểm ảnh để không chạm cằm' % ha)
                gy += ha
                if 'dat' in chinh:
                    gx, gy = chinh['dat']
                if 'lech' in chinh:
                    gx, gy = gx + chinh['lech'][0], gy + chinh['lech'][1]
                c = Image.new('RGBA', (CW, CH), (0, 0, 0, 0))
                c.alpha_composite(gi, (PAD + gx, PAD + gy))
                kq['giap'] = c
                lop_neo['giap']['dong_tac'][t].append({'khung': k + 1, 'khung_bao': fg['khung_bao'], 'neo': ng, 'dat': [gx, gy], 'ha_tranh_mat': ha,
                                                       'nguon_dat': 'chinh-tay' if chinh else 'tu-dong'})
            else:
                ghi['loi'].append('không tìm được cổ giáp')
            # --- áo choàng
            fa = T['ao_choang']['hang'][r]['khung'][k]
            na = do_neo_ao_choang(fa)
            ai = doi_co(fa['img'], ti_le['ao_choang'])
            chinh = ((ct.get('lop') or {}).get('ao_choang') or {}).get(t, {}).get(str(k + 1), {})
            if na and 'lung' in n_:
                ax = int(round(n_['lung'][0] - na['khuy'][0] * ti_le['ao_choang']))
                ay = int(round(n_['lung'][1] - 2 - na['khuy'][1] * ti_le['ao_choang']))
                if 'dat' in chinh:
                    ax, ay = chinh['dat']
                if 'lech' in chinh:
                    ax, ay = ax + chinh['lech'][0], ay + chinh['lech'][1]
                c = Image.new('RGBA', (CW, CH), (0, 0, 0, 0))
                c.alpha_composite(ai, (PAD + ax, PAD + ay))
                kq['ao_choang'] = c
                lop_neo['ao_choang']['dong_tac'][t].append({'khung': k + 1, 'khung_bao': fa['khung_bao'], 'neo': na, 'dat': [ax, ay],
                                                            'nguon_dat': 'chinh-tay' if chinh else 'tu-dong'})
            else:
                ghi['loi'].append('không đặt được áo choàng (thiếu khuy hoặc neo lưng)')
            KQ[(r, k)] = kq
            # ---------- 4. KIỂM TỰ ĐỘNG khung này
            ghi.update(kiem_khung(kq, n_, nb, SM, vanh_y, ghi))
            kiem.append(ghi)
    neo['lop'] = lop_neo
    neo_dung['lop'] = lop_neo

    # ---------- ổn định giữa các khung (nhảy neo)
    for r, t in enumerate(TEN_HANG):
        for nm, key in (('than', 'co'), ('than', 'tam_mat')):
            pts = [NT(r, k)['neo'].get(key) for k in range(SO_COT)]
            # so với trọng tâm điểm ảnh thân (x) và đáy hình (y): chân chạy bước dài nên giữa hai bàn chân không làm mốc được
            tt = []
            for kk in range(SO_COT):
                f = T['than']['hang'][r]['khung'][kk]
                tt.append((float(np.where(f['mask'])[1].mean()), f['cao']))
            rp = [None if p is None else (p[0] - tt[i][0], p[1] - tt[i][1]) for i, p in enumerate(pts)]
            for i in range(SO_COT):
                p, q = rp[i], rp[(i + 1) % SO_COT]
                if p and q and np.hypot(p[0] - q[0], p[1] - q[1]) > 14:
                    kiem_ghi = [x for x in kiem if x['hang'] == t and x['khung'] == i + 1][0]
                    kiem_ghi['canh_bao'].append('neo %s nhảy %.0f điểm ảnh sang khung %d (so với trọng tâm thân)' % (key, np.hypot(p[0] - q[0], p[1] - q[1]), (i + 1) % SO_COT + 1))

    tong_loi = sum(len(x['loi']) for x in kiem)
    bao['kiem_tu_dong'] = {'khung': kiem, 'so_loi': tong_loi, 'so_canh_bao': sum(len(x['canh_bao']) for x in kiem)}
    bao['dat_tu_dong'] = not bao['loi'] and tong_loi == 0
    bao['kiem_bang_mat'] = {
        'trang_thai': 'CHƯA XÁC NHẬN (cần người xem)',
        'xem': ['anh/luoi-dau-*.png (mặt, mắt, sừng, dây nón từng khung, ×3)', 'anh/luoi-*.png (thân + từng lớp, 8 khung × 3 hàng)',
                'anh/gif-*.gif (đứng/đi/chạy)', 'anh/debug-neo-*.png (điểm neo)', 'anh/truoc-sau.png'],
        'cau_hoi': ['Mắt và mặt thấy rõ ở cả 24 khung?', 'Hai sừng hiện đúng hình, nhô qua nón tự nhiên?',
                    'Mẩu sừng/viền lỗ vẽ sẵn của nón còn lộ có khó chịu không?', 'Dây nón (vẽ sau thân) trông hợp lý hay lơ lửng?',
                    'Giáp nằm đúng ngực/vai, không trôi khi chạy?', 'Áo choàng sau lưng, không xuyên người?', 'GIF lặp không giật?']}
    json.dump(neo, open(os.path.join(a.neo, 'zed-v2.neo.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    # ---------- 5. ảnh kiểm
    xuat_anh(a.ra, T, KQ, neo_dung, ti_le, bao)
    loi_ts = xuat_truoc_sau(a.ra, T, KQ)
    if loi_ts:
        bao['canh_bao'].append('Ảnh trước/sau: ' + loi_ts)
    # ---------- 6. lớp chính thức (chỉ khi kiểm bắt buộc đạt)
    if bao['dat_tu_dong'] and not a.chi_kiem and a.day_non == 'sau':
        xuat_lop_chinh_thuc(a.lop_ra, T, KQ, neo_dung, ti_le, bao)
        bao['lop_chinh_thuc'] = rel(a.lop_ra)
    else:
        bao['lop_chinh_thuc'] = None
        bao['ly_do_khong_xuat'] = ('--chi-kiem' if a.chi_kiem else 'bản thử --day-non an' if a.day_non != 'sau' else 'kiểm tự động chưa đạt')
    # neo cho game (toạ độ logic 48×48) + để trang ghép nhúng
    xuat_neo_game(a.neo, neo_dung, T)
    json.dump(bao, open(os.path.join(a.ra, 'bao-cao-kiem.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1,
              default=lambda o: o.item() if hasattr(o, 'item') else str(o))
    for x in kiem:
        for y in x['loi']:
            print('LỖI  %s %d: %s' % (x['hang'], x['khung'], y))
    for x in kiem:
        for y in x['canh_bao']:
            print('CB   %s %d: %s' % (x['hang'], x['khung'], y))
    print('Tỉ lệ:', ti_le)
    print('Kiểm tự động:', 'ĐẠT' if bao['dat_tu_dong'] else 'CHƯA ĐẠT', '| kiểm bằng mắt: CHƯA XÁC NHẬN')
    raise SystemExit(0 if bao['dat_tu_dong'] else 1)


def kiem_khung(kq, n_, nb, SM, vanh_y, ghi):
    """Kiểm tự động một khung. Chỉ đo được điểm ảnh — không thay được mắt người."""
    out = {}
    than = np.array(kq['than'])
    a_than = than[..., 3] > 0
    tren = np.zeros(a_than.shape, bool)    # điểm ảnh của lớp vẽ TRÊN thân
    for ten in ('giap', 'non_truoc'):
        if ten in kq:
            tren |= np.array(kq[ten])[..., 3] > 0
    sau = np.zeros(a_than.shape, bool)
    for ten in ('ao_choang', 'non_sau'):
        if ten in kq:
            sau |= np.array(kq[ten])[..., 3] > 0
    if 'mat' in n_:
        x0, y0, x1, y1 = n_['mat']
        vm = np.zeros(a_than.shape, bool)
        vm[PAD + max(0, y0):PAD + y1 + 1, PAD + max(0, x0):PAD + x1 + 1] = True
        vm &= a_than
        out['mat_bi_che_diem_anh'] = int((vm & tren).sum())
        out['mat_bi_che_theo_lop'] = {t: int((vm & (np.array(kq[t])[..., 3] > 0)).sum()) for t in ('giap', 'non_truoc') if t in kq}
        ex0, ey0, ex1, ey1 = n_['mat_mat']
        ve = np.zeros(a_than.shape, bool)
        ve[PAD + ey0:PAD + ey1 + 1, PAD + ex0:PAD + ex1 + 1] = True
        out['mat_mat_bi_che_diem_anh'] = int((ve & a_than & tren).sum())
        if out['mat_bi_che_diem_anh']:
            ghi['loi'].append('lớp trên thân che %d điểm ảnh vùng mặt bảo vệ' % out['mat_bi_che_diem_anh'])
    s = np.zeros(a_than.shape, bool)
    s[PAD:PAD + SM.shape[0], PAD:PAD + SM.shape[1]] = SM
    tong = int(s.sum())
    lo = int((s & ~tren).sum())
    out['sung_diem_anh'] = tong
    out['sung_hien_ti_le'] = round(lo / tong, 3) if tong else 0
    if 'sung' in nb['can_chinh_tay']:
        ghi['loi'].append('không nhận ra đủ 2 sừng — cần chỉnh tay')
    elif out['sung_hien_ti_le'] < 0.98:
        ghi['loi'].append('sừng bị che %.0f%%' % (100 - 100 * out['sung_hien_ti_le']))
    # nón: vành phải nằm DƯỚI đỉnh đầu (đội trên đầu, không lơ lửng) và TRÊN mắt
    if 'dinh_dau' in n_ and 'mat_mat' in n_:
        out['vanh_non_y'] = int(vanh_y)
        if vanh_y <= n_['dinh_dau'][1] + 10:
            ghi['loi'].append('vành nón cao hơn đỉnh tóc → nón lơ lửng')
        if vanh_y >= n_['mat_mat'][1] + 4:
            ghi['canh_bao'].append('mép vành (hai đầu) thấp hơn đỉnh mắt — xem bằng mắt')
    # dây nón lộ ra ngoài người (vẽ sau thân nên không thể che mặt): đếm để người xem biết
    if 'non_sau' in kq:
        ns = np.array(kq['non_sau'])[..., 3] > 0
        out['day_non_lo_ngoai_nguoi'] = int((ns & ~a_than).sum())
        out['day_non_trong_vung_mat'] = 0  # vẽ sau thân: điểm ảnh mặt luôn đè lên dây
    # giáp: tỉ lệ điểm ảnh giáp nằm trên người (≥ 60%) — thấp = trôi khỏi thân
    if 'giap' in kq:
        g = np.array(kq['giap'])[..., 3] > 0
        tl = float((g & a_than).sum()) / max(1, g.sum())
        out['giap_tren_nguoi_ti_le'] = round(tl, 3)
        if tl < 0.6:
            ghi['loi'].append('giáp chỉ %.0f%% nằm trên người — trôi khỏi thân' % (100 * tl))
        elif tl < 0.75:
            ghi['canh_bao'].append('giáp %.0f%% nằm trên người (vai giáp chìa ra ngoài) — xem bằng mắt' % (100 * tl))
    # áo choàng: điểm ảnh lộ ra phía TRƯỚC người (bên phải cổ + 20) ở tầm thân = nghi xuyên/sai phía
    if 'ao_choang' in kq and 'co' in n_:
        ac = np.array(kq['ao_choang'])[..., 3] > 0
        lo_ac = ac & ~a_than & ~tren
        x_truoc = int(PAD + n_['co'][0] + 20)
        y_a, y_b = int(PAD + n_['co'][1]), int(PAD + n_['chan'][1])
        out['ao_choang_lo_phia_truoc'] = int(lo_ac[y_a:y_b, x_truoc:].sum())
        if out['ao_choang_lo_phia_truoc'] > 150:
            ghi['canh_bao'].append('áo choàng lộ %d điểm ảnh phía trước người — xem bằng mắt' % out['ao_choang_lo_phia_truoc'])
    # alpha nhị phân (không viền mờ)
    lung = 0
    for ten, im in kq.items():
        al = np.array(im)[..., 3]
        lung += int(((al > 0) & (al < 255)).sum())
    out['alpha_trung_gian'] = lung
    if lung:
        ghi['canh_bao'].append('%d điểm ảnh alpha trung gian' % lung)
    # neo trong khung hợp lý
    H = SM.shape[0]
    for k in ('co', 'eo', 'lung'):
        p = n_.get(k)
        if p and not (0 <= p[1] <= H):
            ghi['loi'].append('neo %s ngoài khung' % k)
    return out


# ============================================================== ảnh kiểm
NEN = (40, 44, 52, 255)
BO = [('than', ['than']), ('than-giap', ['than', 'giap']), ('than-non', ['non_sau', 'than', 'non_truoc']),
      ('than-ao-choang', ['ao_choang', 'than']), ('than-tat-ca', ['ao_choang', 'non_sau', 'than', 'giap', 'non_truoc'])]


def ghep(kq, ds, nen=NEN, le=200):
    """Ghép các lớp theo thứ tự LOP_VE trên nền; thêm lề `le` để cắt khung không ra ngoài ảnh (toạ độ dời +le)."""
    W, H = kq['than'].size
    c = Image.new('RGBA', (W + 2 * le, H + 2 * le), nen)
    for t in sorted(ds, key=lambda x: LOP_VE[x]):
        if t in kq:
            c.alpha_composite(kq[t], (le, le))
    return c


def dich(b, le=200):
    return (b[0] + le, b[1] + le, b[2] + le, b[3] + le)


def can_chan(T, r, k):
    """Độ dời để mọi khung trong hàng cùng chân (x giữa chân, y đáy) → GIF/lưới không giật vì cắt."""
    f = T['than']['hang'][r]['khung'][k]
    return f['chan'][0] - f['khung_bao'][0], f['cao']


def khung_chung(T, r, KQ, rong=260, cao=340):
    """Cắt mọi khung hàng r về cùng cỡ, chân ở (rong*0.5, cao-20)."""
    out = []
    for k in range(SO_COT):
        cx, cy = can_chan(T, r, k)
        x0 = int(round(PAD + cx - rong * 0.5))
        y0 = int(PAD + cy + 20 - cao)
        out.append((x0, y0, x0 + rong, y0 + cao))
    return out


def xuat_anh(ra, T, KQ, neo, ti_le, bao):
    rong, cao = 300, 360
    # lưới 8×3 cho từng bộ (1×) + GIF 2×
    for ten, ds in BO:
        L = Image.new('RGBA', (rong * SO_COT, cao * SO_HANG), NEN)
        d = ImageDraw.Draw(L)
        for r in range(SO_HANG):
            hop = khung_chung(T, r, KQ, rong, cao)
            fr = []
            for k in range(SO_COT):
                o = ghep(KQ[(r, k)], ds).crop(dich(hop[k]))
                L.paste(o, (k * rong, r * cao))
                d.text((k * rong + 4, r * cao + 4), '%s %d' % (TEN_HANG[r], k + 1), fill=(200, 200, 200))
                fr.append(o.convert('RGB').resize((rong * 2, cao * 2), Image.NEAREST))
            if ten in ('than-tat-ca', 'than-non', 'than'):
                fr[0].save(os.path.join(ra, 'gif-%s-%d-%s.gif' % (ten, r + 1, TEN_HANG[r])), save_all=True, append_images=fr[1:],
                           duration=round(GIAY[r] * 1000 / SO_COT), loop=0)
        L.convert('RGB').save(os.path.join(ra, 'luoi-%s.png' % ten))
    # lớp riêng nền trong suốt (8 khung × 3 hàng, cùng khung cắt với lưới)
    for ten in ('ao_choang', 'non_sau', 'giap', 'non_truoc'):
        L = Image.new('RGBA', (rong * SO_COT, cao * SO_HANG), (0, 0, 0, 0))
        for r in range(SO_HANG):
            hop = khung_chung(T, r, KQ, rong, cao)
            for k in range(SO_COT):
                L.paste(KQ[(r, k)][ten].crop(hop[k]), (k * rong, r * cao))
        L.save(os.path.join(ra, 'lop-%s.png' % ten.replace('_', '-')))
    # lưới ĐẦU ×3: mặt, mắt, sừng, nón, dây (đủ to để thấy)
    for ten, ds in (('than-non', ['non_sau', 'than', 'non_truoc']), ('than-tat-ca', ['ao_choang', 'non_sau', 'than', 'giap', 'non_truoc'])):
        Z, wr, hr = 3, 220, 200
        L = Image.new('RGB', (wr * Z * 4, hr * Z * 6), NEN[:3])
        d = ImageDraw.Draw(L)
        for r in range(SO_HANG):
            for k in range(SO_COT):
                nt = neo['than']['dong_tac'][TEN_HANG[r]][k]['neo']
                cx = PAD + nt['tam_mat'][0] + 5
                y0 = PAD + nt['mat'][3] + 25 - hr
                o = ghep(KQ[(r, k)], ds).crop(dich((int(cx - wr / 2), int(y0), int(cx + wr / 2), int(y0 + hr)))).convert('RGB')
                i = r * SO_COT + k
                L.paste(o.resize((wr * Z, hr * Z), Image.NEAREST), ((i % 4) * wr * Z, (i // 4) * hr * Z))
                d.text(((i % 4) * wr * Z + 8, (i // 4) * hr * Z + 6), '%s %d' % (TEN_HANG[r], k + 1), fill=(255, 255, 255))
        L.save(os.path.join(ra, 'luoi-dau-%s.png' % ten))
    # debug neo (×2, mỗi hàng một ảnh): hộp mặt (xanh lơ), mắt (xanh lá), sừng (vàng), cổ/eo/lưng/vai/chân, vành nón (cam)
    for r in range(SO_HANG):
        Z = 2
        L = Image.new('RGB', (rong * Z * 4, cao * Z * 2), NEN[:3])
        hop = khung_chung(T, r, KQ, rong, cao)
        for k in range(SO_COT):
            o = ghep(KQ[(r, k)], ['ao_choang', 'non_sau', 'than', 'giap', 'non_truoc']).crop(dich(hop[k])).convert('RGB')
            o = o.resize((rong * Z, cao * Z), Image.NEAREST)
            d = ImageDraw.Draw(o)
            nt = neo['than']['dong_tac'][TEN_HANG[r]][k]
            n_ = nt['neo']
            dx, dy = PAD - hop[k][0], PAD - hop[k][1]
            P = lambda p: ((p[0] + dx) * Z, (p[1] + dy) * Z)
            hp = lambda b, mau: d.rectangle([P(b[:2]), P(b[2:])], outline=mau, width=2)
            def cham(p, mau, chu):
                if p:
                    x, y = P(p)
                    d.ellipse((x - 5, y - 5, x + 5, y + 5), fill=mau, outline=(0, 0, 0))
                    d.text((x + 7, y - 6), chu, fill=mau)
            if 'mat' in n_:
                hp(n_['mat'], (0, 255, 255))
                hp(n_['mat_mat'], (0, 255, 0))
            for s in ('sung_trai', 'sung_phai'):
                if s in n_:
                    hp(n_[s]['khung_bao'], (255, 230, 0))
                    cham(n_[s]['dinh'], (255, 230, 0), 'sung')
            cham(n_.get('dinh_dau'), (255, 255, 255), 'dinh dau')
            cham(n_.get('co'), (255, 80, 80), 'co')
            cham(n_.get('eo'), (255, 160, 0), 'eo')
            cham(n_.get('lung'), (120, 255, 120), 'lung')
            cham(n_.get('vai_truoc'), (180, 120, 255), 'vai')
            cham(n_.get('vai_sau'), (180, 120, 255), 'vai')
            cham(n_.get('chan'), (255, 255, 255), 'chan')
            ln = neo['lop']['non_la']['dong_tac'][TEN_HANG[r]][k]
            ox, oy = ln['dat']
            for p in ('vanh_trai', 'vanh_phai'):
                cham([ln['neo'][p][0] + ox, ln['neo'][p][1] + oy], (255, 140, 0), 'vanh')
            for lo in ln['neo']['lo_sung_ve_san']:
                cham([lo[0] + ox, lo[1] + oy], (255, 0, 255), 'lo non')
            if nt['can_chinh_tay']:
                d.text((6, cao * Z - 18), 'can chinh tay: ' + ','.join(nt['can_chinh_tay']), fill=(255, 120, 120))
            d.text((6, 6), '%s %d' % (TEN_HANG[r], k + 1), fill=(255, 255, 255))
            L.paste(o, ((k % 4) * rong * Z, (k // 4) * cao * Z))
        L.save(os.path.join(ra, 'debug-neo-%d-%s.png' % (r + 1, TEN_HANG[r])))
    # so sánh cách đổi cỡ (giáp, hàng đứng khung 1)
    f = T['giap']['hang'][0]['khung'][0]['img']
    s = ti_le['giap']
    Z = 4
    ds = [('NEAREST + alpha nhi phan (dung)', doi_co(f, s)),
          ('BOX', f.resize((round(f.width * s), round(f.height * s)), Image.BOX)),
          ('LANCZOS (ban cu)', f.resize((round(f.width * s), round(f.height * s)), Image.LANCZOS))]
    w = max(x.width for _, x in ds) * Z + 20
    L = Image.new('RGB', (w * 3, max(x.height for _, x in ds) * Z + 30), NEN[:3])
    d = ImageDraw.Draw(L)
    for i, (chu, x) in enumerate(ds):
        bg = Image.new('RGBA', x.size, NEN)
        bg.alpha_composite(x)
        L.paste(bg.convert('RGB').resize((x.width * Z, x.height * Z), Image.NEAREST), (i * w, 26))
        d.text((i * w + 4, 6), '%s  ti le %.3f' % (chu, s), fill=(255, 255, 255))
    L.save(os.path.join(ra, 'so-sanh-doi-co.png'))


def xuat_truoc_sau(ra, T, KQ):
    """Chạy bản cũ (ghep-thu-cu.py, giữ nguyên thuật toán cũ) vào thư mục tạm rồi đặt cạnh bản mới, cùng tỉ lệ 1:1 điểm ảnh nguồn."""
    import subprocess, tempfile
    tam = tempfile.mkdtemp()
    os.makedirs(os.path.join(tam, 'c'))
    r_ = subprocess.run([sys.executable, os.path.join(DAY, 'ghep-thu-cu.py'), tam], cwd=GOC_REPO, capture_output=True, text=True)
    p = os.path.join(tam, 'c', 'ghep-strip.png')
    if r_.returncode or not os.path.exists(p):
        return 'không chạy được bản cũ: ' + (r_.stderr or '')[-300:]
    cu = Image.open(p).convert('RGB')
    chon = [(0, 0), (0, 4), (1, 0), (1, 4), (2, 0), (2, 4)]
    C = 400
    L = Image.new('RGB', (C * len(chon), 2 * C + 60), NEN[:3])
    d = ImageDraw.Draw(L)
    d.text((6, 4), 'TRUOC (ghep-thu-cu.py: neo theo ti le khung bao, non cat o vanh + LANCZOS, che mat)', fill=(255, 140, 140))
    d.text((6, C + 34), 'SAU (ghep-thu.py: neo tung khung, non tach truoc/sau + duc lo sung, giap/ao theo co/lung)', fill=(140, 255, 140))
    for i, (r, k) in enumerate(chon):
        o = cu.crop((k * 200, r * 200, k * 200 + 200, r * 200 + 200)).resize((C, C), Image.NEAREST)
        L.paste(o, (i * C, 26))
        f = T['than']['hang'][r]['khung'][k]
        H, W = f['mask'].shape
        x0 = PAD + W // 2 - C // 2
        y0 = PAD + H + 40 - C
        n = ghep(KQ[(r, k)], ['ao_choang', 'non_sau', 'than', 'giap', 'non_truoc']).crop(dich((x0, y0, x0 + C, y0 + C))).convert('RGB')
        L.paste(n, (i * C, C + 56))
        d.text((i * C + 6, 30), '%s %d' % (TEN_HANG[r], k + 1), fill=(255, 255, 255))
    L.save(os.path.join(ra, 'truoc-sau.png'))
    return None


def xuat_lop_chinh_thuc(ra, T, KQ, neo, ti_le, bao):
    """Lớp chính thức: mỗi lớp một tấm RGBA cùng cỡ và cùng bố cục với tấm thân nguồn (2048×768),
    điểm ảnh lớp đặt đúng chỗ so với thân → dùng tiếp được với kiem-sheet.py / trang ghép (cùng chia ô với thân)."""
    os.makedirs(ra, exist_ok=True)
    W, H = T['than']['co_anh']
    dd = os.path.join(DAY, 'kiem', 'zed-v2-canonical', 'do-dac.json')
    o = json.load(open(dd, encoding='utf-8')) if os.path.exists(dd) else None
    for ten in ('ao_choang', 'non_sau', 'giap', 'non_truoc'):
        tam = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        tran, lan = [], []
        for r in range(SO_HANG):
            for k in range(SO_COT):
                f = T['than']['hang'][r]['khung'][k]
                x0, y0 = f['khung_bao'][0] - PAD, f['khung_bao'][1] - PAD
                lop = KQ[(r, k)][ten]
                bb = lop.getbbox()
                if bb and (x0 + bb[0] < 0 or y0 + bb[1] < 0 or x0 + bb[2] > W or y0 + bb[3] > H):
                    tran.append('%s %d' % (TEN_HANG[r], k + 1))
                if bb and o:
                    cx0, cx1 = o['chia_cot'][k]
                    cy0, cy1 = o['chia_hang'][r]
                    if x0 + bb[0] < cx0 or x0 + bb[2] > cx1 or y0 + bb[1] < cy0 or y0 + bb[3] > cy1:
                        lan.append('%s %d' % (TEN_HANG[r], k + 1))
                tmp = Image.new('RGBA', (W, H), (0, 0, 0, 0))
                tmp.paste(lop, (x0, y0))
                tam.alpha_composite(tmp)
        tam.save(os.path.join(ra, 'zed-v2-%s.png' % ten.replace('_', '-')))
        if lan:
            bao['canh_bao'].append('Lớp %s LẤN sang ô bên cạnh (chia ô của kiem/zed-v2-canonical) ở %d khung: %s — cắt theo ô sẽ mất phần lấn; '
                                   'cần khung game rộng hơn hoặc lớp kiểu "khung" có ô riêng' % (ten, len(lan), ', '.join(lan)))
        if tran:
            bao['canh_bao'].append('Lớp %s tràn ra ngoài tấm ở khung: %s (phần tràn bị cắt trong tấm chính thức; ảnh kiểm vẫn đủ)' % (ten, ', '.join(tran)))
    json.dump({'loai': 'linh-khi-lop-ghep-nguon', 'phien_ban': 1, 'trang_thai': 'GENERATED',
               'ghi_chu': 'Tấm lớp cùng bố cục với docs/anh-goc/zed/v2/00-than-dung-di-chay.png. Thứ tự vẽ: ' + json.dumps(LOP_VE),
               'ti_le': ti_le, 'neo': 'docs/anh-goc/zed/neo/zed-v2.neo.json', 'kiem': 'docs/review/ke-hoach-cai-thien/zed-asset/ghep-sua/anh/bao-cao-kiem.json'},
              open(os.path.join(ra, 'zed-v2-lop.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


def xuat_neo_game(thu_muc, neo, T):
    """Đổi neo thân sang toạ độ logic khung game 48×48 (goc [24,45]) theo đúng cách kiem-sheet.py làm sheet-game
    của zed-v2-canonical (cùng ảnh với 00-than). Ghi tệp để tools/tach-ghep-lop/dong-goi.py nhúng vào thân của trang ghép."""
    dd = os.path.join(DAY, 'kiem', 'zed-v2-canonical', 'do-dac.json')
    if not os.path.exists(dd):
        return
    d = json.load(open(dd, encoding='utf-8'))
    s, NET, GOCG = d['ti_le_game'], 2, [24, 45]
    out = {'loai': 'linh-khi-neo-game', 'phien_ban': 1, 'than': 'zed-v2-canonical',
           'he_toa_do': 'logic px trong khung 48×48, chân tại goc [24,45] (như linh-khi-lop "neo")',
           'nguon': 'docs/anh-goc/zed/neo/zed-v2.neo.json + kiem/zed-v2-canonical/do-dac.json', 'neo': {}}
    for r, t in enumerate(TEN_HANG):
        o0y = d['chia_hang'][r][0]
        ds = []
        for k, nt in enumerate(neo['than']['dong_tac'][t]):
            o0x = d['chia_cot'][k][0]
            kb = nt['khung_bao']
            def G(p):
                if not p:
                    return None
                xo, yo = p[0] + kb[0] - o0x, p[1] + kb[1] - o0y
                return [round(GOCG[0] + (xo - d['neo_x_px'][r]) * s / NET, 1), round(GOCG[1] + (yo - d['dat_hang_px'][r]) * s / NET, 1)]
            n_ = nt['neo']
            ln = neo['lop']['non_la']['dong_tac'][t][k]
            vg = [ln['dat'][0] + (ln['neo']['vanh_trai'][0] + ln['neo']['vanh_phai'][0]) / 2,
                  ln['dat'][1] + max(ln['neo']['vanh_trai'][1], ln['neo']['vanh_phai'][1])]
            mat = n_.get('mat')
            e = {'dau': (G(vg) or [0, 0]) + [0], 'lung': (G(n_['lung']) + [0]) if n_.get('lung') else None,
                 'co': G(n_.get('co')), 'nguc': G(n_.get('nguc')), 'eo': G(n_.get('eo')),
                 'vai': [G(n_.get('vai_sau')), G(n_.get('vai_truoc'))] if n_.get('vai_sau') else None,
                 'mat': (G(mat[:2]) + G(mat[2:])) if mat else None,
                 'sung': [G(n_[x]['dinh']) for x in ('sung_trai', 'sung_phai') if x in n_],
                 'tay_phai': None, 'tay_trai': None, 'vk': None,
                 'tin_cay': nt['tin_cay'], 'can_chinh_tay': nt['can_chinh_tay'] + ['dau'],
                 'nguon_neo': dict(nt['nguon_neo'], dau='tu-dong (chỗ vành nón ngồi, đo khi ghép nón lá)')}
            ds.append(e)
        out['neo'][t] = ds
    json.dump(out, open(os.path.join(thu_muc, 'zed-v2.neo-game.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
