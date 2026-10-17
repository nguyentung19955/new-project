"""GHI ảnh nét 3 / nét 4 vào game/art/custom/<mã>.sprite.json (mục "tam_n3", "tam_n4" cho hiệu ứng; "anh_n3", "anh_n4" + "net_cao_cua" cho giao diện; mọi mục cũ giữ nguyên từng ký tự).
build.py: bản một tệp và bản JSON hai tệp BỎ hai mục này (NET_CAO_KEYS); bản web ảnh rời tách thành tệp riêng, game chỉ tải khi bật nét cao.
  python3 ghi_tep.py [--thu]      --thu: chỉ in, không ghi
Nhận mã khi ≥ ½ số khung dựng được từ ảnh gốc (khung còn lại: phóng điểm gần nhất từ khung cũ — đúng như game tự phóng khi không có ảnh).
Giảm màu: tấm > 256 màu → 256 màu (alpha 2 nấc: median cut trên điểm đục; alpha nhiều nấc: octree RGBA), không chấm nhiễu, PNG bảng màu
(như phiên dung-luong-16-10). Riêng gd-ban-do-vung (tranh bản đồ cả màu) giữ đủ màu."""
import base64, glob, io, json, os, re, sys
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from chung import CUS, RA, pham_vi
sys.path.insert(0, os.path.join(HERE, '..', '..', 'do-net', 'cong-cu'))
import thu_net

GIU_MAU = {'gd-ban-do-vung'}
# soát bằng mắt / máy đo hở mặt nạ: bản dựng lại hụt mép (vien-man-do: dải dưới trống) hoặc dáng khác ảnh đang dùng (icon-linh-khi) → không ghi
LOAI = {'gd-vien-man-do', 'gd-icon-linh-khi'}
THU = '--thu' in sys.argv


def nen(a, ma):
    u = np.unique(a.reshape(-1, 4).view(np.uint32))
    if ma in GIU_MAU or len(u) <= 256:
        if len(u) <= 256:
            return thu_net.png_bang_mau(a)
        b = io.BytesIO(); Image.fromarray(a).save(b, 'PNG', optimize=True); return b.getvalue()
    al = np.unique(a[..., 3])
    if set(al.tolist()) <= {0, 255}:
        q = thu_net.giam_mau(a, 255)
    else:
        q = np.array(Image.fromarray(a).quantize(colors=255, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).convert('RGBA'))
        q[q[..., 3] == 0] = 0
    return thu_net.png_bang_mau(q)


def main():
    tong = {3: 0, 4: 0}; so = 0; bo = []; lech = []
    for ma in pham_vi():
        p = os.path.join(RA, 'net-cao', ma + '.json')
        if not os.path.exists(p):
            continue
        r = json.load(open(p))
        g = [k for k in r['khung'] if k['n'] == 4]
        goc = sum(1 for k in g if k['cach'] == 'goc')
        if ma in LOAI:
            lech.append(ma); continue
        if not g or goc * 2 < len(g):
            bo.append(ma); continue
        if ma.startswith('gd-') and r.get('nguon_bat') != 'tim-goc' and any(k['cach'] == 'goc' and (k.get('tuong_quan', 1) < 0.85 or k.get('lech_mau_cong_cu', 0) > 20) for k in g):
            # ảnh giao diện: công cụ cũ dựng nhiều mục cùng dáng (khung tròn / vuông), ảnh đang dùng đã được sửa tay sau đó (thêm khoá, đổi màu bậc…)
            # → tương quan độ sáng / lệch màu với ảnh công cụ thu ra cho thấy KHÔNG còn là cùng hình: giữ ảnh cũ (soát bằng mắt: anh/nghi-gd*.png)
            lech.append(ma); continue
        f = os.path.join(CUS, ma + '.sprite.json')
        raw = open(f, encoding='utf-8').read()
        d = json.loads(raw)
        # thêm bằng cách nối chữ trước dấu } cuối: mọi ký tự cũ giữ nguyên (chạy lại thì bỏ mục cũ của chính phiên này trước)
        goc_txt = re.sub(r',"(tam|anh)_n[34]":"data:image/png;base64,[A-Za-z0-9+/=]*"', '', raw)
        goc_txt = re.sub(r',"net_cao_cua":"[0-9a-f]*"', '', goc_txt)
        # hiệu ứng: "tam_n3/4" (như vệt kiếm nặng của phiên máy); giao diện: "anh_n3/4" + "net_cao_cua" (cách của phiên nền: build.py bỏ bản
        # nét cao nếu ảnh thường đổi sau này mà chưa dựng lại)
        khoa = 'anh_n' if ma.startswith('gd-') else 'tam_n'
        than = goc_txt.rstrip()
        assert than.endswith('}'), ma
        them = ''
        for n in (3, 4):
            p_ = os.path.join(RA, 'net-cao', '%s.n%d.png' % (ma, n))
            if not os.path.exists(p_):
                continue  # ảnh cũ đã nét 3 (phúc lành): chỉ có nét 4
            a = np.array(Image.open(p_).convert('RGBA'))
            a[a[..., 3] == 0] = 0
            b = nen(a, ma)
            them += ',"%s%d":"data:image/png;base64,%s"' % (khoa, n, base64.b64encode(b).decode())
            tong[n] += len(b)
        if khoa == 'anh_n':
            import hashlib
            them += ',"net_cao_cua":"%s"' % hashlib.sha256(d['anh'].encode()).hexdigest()[:12]
        moi = than[:-1] + them + '}' + goc_txt[len(than):]
        d2 = json.loads(moi)
        bo_k = lambda x: {k: v for k, v in x.items() if not (k.startswith('tam_n') or k.startswith('anh_n') or k == 'net_cao_cua')}
        assert bo_k(d2) == bo_k(d), ma
        so += 1
        if not THU:
            with open(f, 'w', encoding='utf-8') as fh:
                fh.write(moi)
    print('ghi %d mã; nét 3 %.2f MB, nét 4 %.2f MB (PNG); bỏ (ít khung gốc): %s' % (so, tong[3] / 1048576, tong[4] / 1048576, ','.join(bo)))
    print('bỏ (giao diện đã sửa tay sau công cụ cũ): %s' % ','.join(lech))
    json.dump({'ghi': so, 'n3': tong[3], 'n4': tong[4], 'bo_it_khung': bo, 'bo_sua_tay': lech}, open(os.path.join(RA, 'ghi-tep.json'), 'w'), ensure_ascii=False, indent=0)


if __name__ == '__main__':
    main()
