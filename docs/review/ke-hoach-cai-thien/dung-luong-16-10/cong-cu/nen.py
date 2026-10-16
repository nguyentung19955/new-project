"""Giảm dung lượng ảnh game/art/custom/*.sprite.json (16/10). Không đổi cỡ ảnh, không thu nhỏ, không đổi thông số hình.

  python3 nen.py            # chỉ đo, in bảng (ra/nen.json)
  python3 nen.py --ghi      # ghi lại các tệp sprite.json đã nén (chỉ khi nhỏ hơn)

Mỗi ảnh (trừ tấm cũ <mã>-muotcu: không có trong bản một tệp, người chơi không tải):
  1. KHÔNG MẤT GÌ: điểm trong suốt hẳn (alpha 0) đưa về (0,0,0,0); ảnh <= 256 màu -> PNG bảng màu (thử vài thứ tự bảng),
     chọn bản nhỏ nhất. Điểm ảnh nhìn thấy y hệt (so lại từng điểm).
  2. (TẮT, xem dưới) KHUNG TRÙNG: hàng có "khung" (danh sách cột phát, js/sprite_custom.js G.KHUNG_TRUNG) -> cột bị bỏ (trùng cột kế bên, game không vẽ)
     được thay bằng bản chép y hệt cột phát gần nhất -> nén gần như 0 byte. Chỉ thấy khi bật ?khungtrung=0 (vẫn ra đúng dáng đó).
  3. NÉN BẢNG MÀU (ảnh > 256 màu): 256 màu, cách y như đợt nén 14/10 (npc-ban-do-bao-truoc/cong-cu/nen-anh.py): điểm đục vẫn đục,
     điểm trong suốt vẫn trong suốt, chỉ gộp màu gần nhau. Chỉ nhận khi sai số nhỏ: trung bình <= SAI_TB, phân vị 99 <= SAI_99,
     alpha điểm bán trong lệch <= SAI_ALPHA; không đạt thì giữ ảnh cũ.
"""
import base64
import glob
import io
import json
import os
import struct
import sys
import zlib

import numpy as np
from PIL import Image
from scipy.spatial import cKDTree

DAY = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../..'))
RA = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ra')
GHI = '--ghi' in sys.argv
SAI_TB, SAI_99, SAI_ALPHA = 4.0, 32, 12
W_ALPHA = float(os.environ.get('W_ALPHA', '3'))


def chunk(ty, data):
    return struct.pack('>I', len(data)) + ty + data + struct.pack('>I', zlib.crc32(ty + data) & 0xffffffff)


def p_png(idx, pal):
    """idx HxW (chỉ số), pal Kx4 uint8 -> PNG bảng màu 8 bit (lọc 0, zlib 9). tRNS cắt bớt đuôi đục."""
    H, W = idx.shape
    idx = idx.astype(np.uint8)
    raw = b''.join(b'\0' + idx[y].tobytes() for y in range(H))
    c = zlib.compressobj(9, zlib.DEFLATED, 15, 9, 0)
    z = c.compress(raw) + c.flush()
    al = [int(v) for v in pal[:, 3]]
    while al and al[-1] == 255:
        al.pop()
    out = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', W, H, 8, 3, 0, 0, 0)) + chunk(b'PLTE', bytes(pal[:, :3].astype(np.uint8).ravel().tolist()))
    if al:
        out += chunk(b'tRNS', bytes(al))
    return out + chunk(b'IDAT', z) + chunk(b'IEND', b'')


def rgba(png):
    a = np.array(Image.open(io.BytesIO(png)).convert('RGBA'))
    a[a[..., 3] == 0] = 0
    return a


def khong_mat(a):
    """Các bản mã hoá không mất (RGBA, và bảng màu nếu <= 256 màu)."""
    H, W = a.shape[:2]
    ra = []
    b = io.BytesIO()
    Image.fromarray(a, 'RGBA').save(b, 'PNG', compress_level=9)
    ra.append(b.getvalue())
    u, inv, cnt = np.unique(a.reshape(-1, 4).view(np.uint32).ravel(), return_inverse=True, return_counts=True)
    if len(u) <= 256:
        cols = u.view(np.uint8).reshape(-1, 4)
        lum = cols[:, 0] * 0.3 + cols[:, 1] * 0.59 + cols[:, 2] * 0.11
        for order in (np.lexsort((lum,)), np.argsort(-cnt, kind='stable'), np.arange(len(u))):
            order = np.array(sorted(order.tolist(), key=lambda i: cols[i, 3] == 255), dtype=np.int64)  # bán trong / trong suốt trước: tRNS ngắn
            rank = np.empty(len(u), np.int64)
            rank[order] = np.arange(len(u))
            ra.append(p_png(rank[inv].reshape(H, W), cols[order]))
    return ra, len(u)


def kmeans(pts, w, k, it=8):
    k = min(k, len(pts))
    if k <= 0:
        return np.zeros((0, pts.shape[1]))
    img = Image.fromarray(np.clip(pts[:, :3], 0, 255).astype(np.uint8).reshape(1, -1, 3))
    lab = np.array(img.quantize(colors=k, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)).ravel()
    C = np.zeros((k, pts.shape[1]))
    rng = np.random.default_rng(1)
    for j in range(k):
        m = lab == j
        C[j] = (pts[m] * w[m, None]).sum(0) / w[m].sum() if m.any() else pts[rng.integers(len(pts))]
    for _ in range(it):
        _, lab = cKDTree(C).query(pts)
        s = np.zeros_like(C)
        ww = np.bincount(lab, weights=w, minlength=len(C))
        for d in range(pts.shape[1]):
            s[:, d] = np.bincount(lab, weights=pts[:, d] * w, minlength=len(C))
        ok = ww > 0
        C[ok] = s[ok] / ww[ok, None]
    return C


def bang_256(a):
    """Như nen-anh.py (14/10): đục lượng tử RGB (vẫn đục), bán trong lượng tử RGBA nhân trước; 1 ô trong suốt."""
    H, W = a.shape[:2]
    flat = a.reshape(-1, 4)
    al = flat[:, 3]
    opq, semi = al == 255, (al > 0) & (al < 255)
    uo, io_, co = np.unique(flat[opq].view(np.uint32).ravel(), return_inverse=True, return_counts=True)
    us, is_, cs = np.unique(flat[semi].view(np.uint32).ravel(), return_inverse=True, return_counts=True)
    K = 255
    ks = 0 if len(us) == 0 else (K if len(uo) == 0 else max(16, min(K - 16, int(round(K * len(us) / max(1, len(us) + len(uo)))))))
    ko = K - ks
    po = uo.view(np.uint8).reshape(-1, 4).astype(float)
    ps = us.view(np.uint8).reshape(-1, 4).astype(float)
    Co = kmeans(po[:, :3], co.astype(float), ko) if len(uo) else np.zeros((0, 3))
    if len(us):
        pre = np.concatenate([ps[:, :3] * ps[:, 3:4] / 255, ps[:, 3:4] * W_ALPHA], 1)  # alpha nặng hơn: độ trong giữ sát bản gốc
        Cs = kmeans(pre, cs.astype(float), ks)
        Cs[:, 3] = np.clip(np.round(Cs[:, 3] / W_ALPHA), 1, 254)
        Cs[:, :3] = Cs[:, :3] * 255 / Cs[:, 3:4]
    else:
        Cs = np.zeros((0, 4))
    pal = np.concatenate([[[0, 0, 0, 0]], np.concatenate([Co, np.full((len(Co), 1), 255)], 1), Cs], 0)
    pal = np.clip(np.round(pal), 0, 255).astype(np.uint8)
    idx = np.zeros(H * W, np.int64)
    if len(uo):
        _, lo = cKDTree(Co).query(po[:, :3])
        idx[opq] = 1 + lo[io_]
    if len(us):
        pc = pal[1 + len(Co):].astype(float)
        _, ls = cKDTree(np.concatenate([pc[:, :3] * pc[:, 3:4] / 255, pc[:, 3:4] * W_ALPHA], 1)).query(np.concatenate([ps[:, :3] * ps[:, 3:4] / 255, ps[:, 3:4] * W_ALPHA], 1))
        idx[semi] = 1 + len(Co) + ls[is_]
    return p_png(idx.reshape(H, W), pal)


def sai_so(a, b):
    a, b = a.astype(int), b.astype(int)
    vis = a[..., 3] > 0
    assert ((b[..., 3] == 255) == (a[..., 3] == 255)).all() and ((b[..., 3] == 0) == (a[..., 3] == 0)).all()
    e = np.abs(b - a)[vis]
    semi = (a[..., 3] > 0) & (a[..., 3] < 255)
    da = int(np.abs(b[..., 3] - a[..., 3])[semi].max()) if semi.any() else 0
    return float(e.mean()), float(np.percentile(e.max(1), 99)), da


def chep_khung_trung(t, a):
    """Cột bị bỏ trong danh sách "khung" -> chép y hệt cột phát gần nhất cùng hàng. Trả về (ảnh mới, số ô đã chép)."""
    if 'dong_tac' not in t or 'khung_rong' not in t or 'khung_cao' not in t:
        return a, 0
    n = t.get('net', 1)
    fw, fh = t['khung_rong'] * n, t['khung_cao'] * n
    a = a.copy()
    so = 0
    for k, d in t['dong_tac'].items():
        if not isinstance(d, dict) or not isinstance(d.get('khung'), list):
            continue
        phat = sorted(set(int(c) for c in d['khung']))
        r = d['hang']
        for c in range(d['so']):
            if c in phat:
                continue
            g = min(phat, key=lambda x: (abs(x - c), x))
            a[r * fh:(r + 1) * fh, c * fw:(c + 1) * fw] = a[r * fh:(r + 1) * fh, g * fw:(g + 1) * fw]
            so += 1
    return a, so


def main():
    os.makedirs(RA, exist_ok=True)
    rows, t0, t1 = [], 0, 0
    for f in sorted(glob.glob(os.path.join(DAY, 'game/art/custom/*.sprite.json'))):
        with open(f, encoding='utf-8') as fh:
            nguyen = fh.read()
        d = json.loads(nguyen)
        k = 'tam' if isinstance(d.get('tam'), str) else 'anh' if isinstance(d.get('anh'), str) else None
        if not k or not d[k].startswith('data:image/png;base64,') or d.get('muot_cua'):
            continue
        png = base64.b64decode(d[k].split(',', 1)[1])
        a0 = rgba(png)
        # 16/10: KHÔNG dùng bước 2. Ảnh so (anh/so-khung-trung-*.png) cho thấy các cột bị bỏ trong hàng đánh là dáng khác hẳn
        # (vung tay, lấy đà), không phải khung trùng -> giữ nguyên. Bật lại: LK_CHEP_KHUNG=1 (không nên).
        a, so_chep = chep_khung_trung(d, a0) if os.environ.get('LK_CHEP_KHUNG') == '1' else (a0, 0)
        cands, so_mau = khong_mat(a)
        cach = ['không mất'] + (['chép khung trùng %d ô' % so_chep] if so_chep else [])
        moi = min(cands, key=len)
        sai = None
        if so_mau > 256:
            q = bang_256(a)
            em, e99, da = sai_so(a, rgba(q))
            if em <= SAI_TB and e99 <= SAI_99 and da <= SAI_ALPHA and len(q) < len(moi):
                moi, sai = q, [round(em, 2), e99, da]
                cach.append('256 màu (từ %d màu)' % so_mau)
        # kiểm: phần không chép / không lượng tử phải y hệt
        b = rgba(moi)
        if sai is None:
            assert (b == a).all(), d['ma']
        t0 += len(png)
        if len(moi) < len(png):
            t1 += len(moi)
            rows.append({'ma': d['ma'], 'truoc': len(png), 'sau': len(moi), 'cach': ', '.join(cach), 'sai_so': sai,
                         'so_mau': so_mau, 'co': list(a.shape[1::-1])})
            if GHI:
                # chỉ thay chuỗi ảnh, giữ nguyên từng ký tự còn lại của tệp (cách viết, thứ tự khoá, dòng cuối)
                assert nguyen.count(d[k]) == 1, d['ma']
                with open(f, 'w', encoding='utf-8', newline='') as fh:
                    fh.write(nguyen.replace(d[k], 'data:image/png;base64,' + base64.b64encode(moi).decode()))
        else:
            t1 += len(png)
    rows.sort(key=lambda r: r['truoc'] - r['sau'], reverse=True)
    for r in rows[:30]:
        print(r)
    print('PNG tổng (trừ tấm -muotcu): %.3f MB -> %.3f MB, %d tấm đổi' % (t0 / 1048576, t1 / 1048576, len(rows)))
    with open(os.path.join(RA, 'nen.json'), 'w', encoding='utf-8') as fh:
        json.dump({'tong_truoc': t0, 'tong_sau': t1, 'tam': rows}, fh, ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
