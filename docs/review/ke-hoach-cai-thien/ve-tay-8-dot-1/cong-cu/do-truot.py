"""Đo TRƯỢT CHÂN từ so-lieu.json của quay.py (mỗi nhịp 1/60 giây: x thật của Cu Tí, các bàn chân chạm đất đo trên hình vẽ riêng).
    python3 do-truot.py <thư mục quay trước> <thư mục quay sau> [động tác,...]
Mỗi cặp nhịp liền nhau: Cu Tí đi được dx (điểm game). Bàn chân TRỤ = đoạn chân chạm đất ở nhịp sau khớp với một đoạn ở nhịp trước sao cho
chỗ của nó TRÊN NỀN (x thật + vị trí đoạn, lật theo mặt) xê dịch ít nhất. Trượt = Σ |xê dịch của bàn trụ trên nền| / Σ |dx| (0 % = bàn
trụ đứng im trên nền như chân thật, 100 % = bàn chân dính theo người như trượt băng). Bỏ 20 nhịp đầu (vào bước), chỉ nhịp đang di chuyển.
Ghi do-truot.json cạnh tệp này."""
import json, os, sys
A, B = sys.argv[1], sys.argv[2]
CHI = sys.argv[3].split(',') if len(sys.argv) > 3 else None


def truot(sl):
    """Theo từng lần CHẠM ĐẤT của một bàn chân: từ lúc chạm tới lúc nhấc (bàn đó còn khớp, xê dịch trên nền ≤ 6 điểm mỗi nhịp),
    trượt = |chỗ bàn chân trên nền lúc nhấc − lúc chạm| so với quãng Cu Tí đi trong lúc đó (trôi RÒNG, như cu-ti-to-muot)."""
    tong_q = tong_tr = 0.0; n = 0; cur = None  # cur = [chỗ trên nền lúc chạm, chỗ hiện tại, x lúc chạm, x hiện tại, số nhịp]
    def dong():
        nonlocal tong_q, tong_tr, n
        if cur and cur[4] >= 3 and abs(cur[3] - cur[2]) > 0.5:
            tong_q += abs(cur[3] - cur[2]); tong_tr += abs(cur[1] - cur[0]); n += 1
    for k in range(20, len(sl)):
        r = sl[k]
        if not r.get('do'): dong(); cur = None; continue
        c = [r['x'] + (s[0] + s[1]) / 2 for s in r['do']['chan']]  # đoạn chân đã theo hướng màn (hình vẽ riêng đã lật theo mặt)
        if cur:
            m = min(c, key=lambda v: abs(v - cur[1])) if c else None
            if m is not None and abs(m - cur[1]) <= 6: cur[1] = m; cur[3] = r['x']; cur[4] += 1; continue
            dong(); cur = None
        if c:  # bàn chạm mới: bàn ở sau cùng (bàn trụ vừa đặt xuống là bàn trước, nhưng chọn bàn nào cũng theo dõi tới khi nhấc)
            cur = [min(c, key=lambda v: abs(v - r['x'])), None, r['x'], r['x'], 1]; cur[1] = cur[0]
    dong()
    return (round(100 * tong_tr / tong_q, 1) if tong_q else None), n


ra = {}
sa, sb = json.load(open(os.path.join(A, 'so-lieu.json'))), json.load(open(os.path.join(B, 'so-lieu.json')))
for ten in (CHI or sorted(set(sa) & set(sb))):
    if ten not in sa or ten not in sb: continue
    (pa, na), (pb, nb) = truot(sa[ten]), truot(sb[ten])
    ra[ten] = {'truoc_%': pa, 'sau_%': pb, 'nhip_do': [na, nb], 'hang_sau': sorted(set(r['ten'] for r in sb[ten] if r['ten']))}
    print('%-16s trước %5s %%   sau %5s %%   (số lần chạm %d / %d)  hàng sau: %s' % (ten, pa, pb, na, nb, ra[ten]['hang_sau']))
json.dump(ra, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'do-truot.json'), 'w'), ensure_ascii=False, indent=1)
