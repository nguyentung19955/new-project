"""NÉT CAO — NỀN (17/10): đóng gói ảnh nét 3 / 4 đã dựng (ra/net3-net, ra/net4-net) vào tệp game/art/custom/<mã>.sprite.json:
  "anh_n3", "anh_n4"   PNG bảng màu (data:), đúng cỡ rong×3 × cao×3 / rong×4 × cao×4
  "net_cao_cua"        12 ký tự đầu sha256 của chuỗi "anh" hiện tại → build.py bỏ bản nét cao nếu ảnh thường bị đổi sau này
Mọi trường cũ giữ nguyên (đã so sau khi ghi). Chỉ bản web ảnh rời mang các ảnh này (tải lười khi bật ?netcao=3|4).

Dựng lại toàn bộ (từ gốc repo):
  cd docs/review/ke-hoach-cai-thien/net-cao-nen/cong-cu
  for n in 2 3 4; do python3 dung_bien_lau.py --net $n --cach net; python3 dung_song_nen.py --net $n --cach net; \
     python3 dung_song_gop.py --net $n; python3 dung_tham_lau.py --net $n; done      # net 2 chạy trước (dung_song_gop lấy đoạn lặp)
  for n in 3 4; do python3 tach_phong_net.py tt-lau git:e9de4489:docs/anh-goc/2026-10-12/trang-tri-lau-dai.png --net $n --cach net; done
  python3 dung_net.py --ghi
Không --ghi: chỉ in danh sách + dung lượng."""
import base64, hashlib, json, os, sys, io
import numpy as np
from PIL import Image
from chung import CUS, RA
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'do-net', 'cong-cu'))
import thu_net  # noqa: E402

GHI = '--ghi' in sys.argv
BO = {'gd-cot-nang-bien', 'gd-cot-nang-lau'}  # ánh sáng mờ nhiều nấc trong suốt: nét cao không thấy khác → không mang


def png(path):
    a = np.array(Image.open(path).convert('RGBA'))
    a[a[..., 3] == 0] = 0
    if len(np.unique(a.reshape(-1, 4).view(np.uint32))) <= 256:
        return thu_net.png_bang_mau(a)
    b = io.BytesIO(); Image.fromarray(a).save(b, 'PNG', optimize=True); return b.getvalue()


def main():
    ds = sorted(os.path.basename(f)[:-4] for f in os.listdir(os.path.join(RA, 'net3-net')) if f.startswith('gd-') and f.endswith('.png'))
    tong = {3: 0, 4: 0}; so = 0
    for ma in ds:
        if ma in BO:
            continue
        p = os.path.join(CUS, ma + '.sprite.json')
        if not os.path.exists(p):
            continue
        raw = open(p, encoding='utf-8').read()
        d = json.loads(raw)
        moi = dict(d)
        for n in (3, 4):
            f = os.path.join(RA, 'net%d-net' % n, ma + '.png')
            im = Image.open(f)
            assert im.size == (d['rong'] * n, d['cao'] * n), (ma, n, im.size)
            b = png(f)
            moi['anh_n%d' % n] = 'data:image/png;base64,' + base64.b64encode(b).decode()
            tong[n] += len(b)
        moi['net_cao_cua'] = hashlib.sha256(d['anh'].encode()).hexdigest()[:12]
        for k, v in d.items():
            assert moi[k] == v or k in ('anh_n3', 'anh_n4', 'net_cao_cua'), (ma, k)
        so += 1
        if GHI:
            with open(p, 'w', encoding='utf-8') as fo:
                if '\n' in raw.strip():
                    json.dump(moi, fo, ensure_ascii=False, indent=1)
                else:
                    json.dump(moi, fo, ensure_ascii=False, separators=(',', ':'))
    print('%d ảnh; nét 3: %.2f MB, nét 4: %.2f MB (PNG)%s' % (so, tong[3] / 1048576, tong[4] / 1048576, '' if GHI else '  (chưa ghi: thêm --ghi)'))


if __name__ == '__main__':
    main()
