"""So số đo trước/sau (tệp json của do.py). Chạy: python3 phan_tich.py truoc.json sau.json [bảng.md]
Mỗi kịch bản, gộp 4 em bé × 2 hướng mặt:
  nhảy ngoài cú chém : bước góc lớn nhất giữa hai khung 60 fps liền nhau, KHÔNG tính khung đổi từ dồn đà sang chém (u 0,4 -> 0,5,
                       lúc thân AI cũng đổi khung: đó là cú vung, cố ý nhanh; chiêu: tiến độ 0,1 -> 0,22)
  khung giữ rồi nhảy : số lần góc đứng yên >= 2 khung rồi nhảy >= 30 độ (kiểu "giật cục")
  đảo chiều / nhát   : số lần chiều quay của kiếm đổi (bỏ qua bước < 3 độ), chia cho số nhát
  đổi lớp / nhát     : số lần kiếm đổi trước <-> sau thân, chia cho số nhát
  qua mặt            : số khung lưỡi kiếm vẽ TRƯỚC thân mà đi ngang vùng mặt
  lệch chuôi         : khoảng cách lớn nhất (điểm ảnh game) từ chỗ nắm trên chuôi tới bàn tay của khung AI
  góc lúc chạm       : góc kiếm ở khung đầu tiên có u >= 0,45 (đòn gây sát thương) — phải chĩa về trước (vùng trúng)"""
import json, sys

A, B = json.load(open(sys.argv[1])), json.load(open(sys.argv[2]))
OUT = sys.argv[3] if len(sys.argv) > 3 else None
KB = [('nhat1', 'Nhát 1 đứng yên'), ('nhat2', 'Nhát 2 đứng yên'), ('nhat3', 'Nhát 3 đứng yên'), ('lien', 'Chém liên tục 3 nhát'),
      ('chay', 'Vừa chạy vừa chém'), ('chieu', 'Chiêu Trảm Nguyệt'), ('luot', 'Né rồi lướt chém'), ('giu', 'Giữ lấy đà (*)')]


def chi_so(ds):
    nhay, giat, dao, lop, qm, lc, so_nhat = 0, 0, 0, 0, 0, 0.0, 0
    goc_cham = []
    s0 = 0; dung = 0; pha0 = None
    for i, r in enumerate(ds):
        if r.get('lechChuoi') is not None: lc = max(lc, r['lechChuoi'])
        if r.get('quaMat'): qm += 1
        if r['pha'] and r['pha'].startswith('nhat') and r['pha'] != pha0: so_nhat += 1
        if r['pha'] and r['pha'].startswith('nhat') and r['u'] is not None and r['u'] >= 0.45 and (i == 0 or ds[i - 1]['pha'] != r['pha'] or ds[i - 1]['u'] < 0.45):
            goc_cham.append((r['ang'], r.get('mui')))
        if r['pha'] in ('chieu',) and pha0 != 'chieu': so_nhat += 1
        pha0 = r['pha']
        if i == 0: continue
        a, b = ds[i - 1], r
        if a.get('ang') is None or b.get('ang') is None: continue
        d = b['ang'] - a['ang']
        vung = b['pha'] == a['pha'] and ((b['pha'].startswith('nhat') and a['u'] < 0.5 and b['u'] > 0.38) or (b['pha'] == 'chieu' and a['u'] < 0.22 and b['u'] > 0.08))
        if not vung: nhay = max(nhay, abs(d))
        if abs(d) < 1: dung += 1
        else:
            if dung >= 2 and abs(d) >= 30 and not vung: giat += 1
            dung = 0
        if abs(d) >= 3:
            if s0 and (d > 0) != (s0 > 0): dao += 1
            s0 = d
        if a.get('truoc') != b.get('truoc'): lop += 1
    return dict(nhay=nhay, giat=giat, dao=dao, lop=lop, qm=qm, lc=lc, n=max(1, so_nhat), cham=goc_cham)


def gop(D, kb):
    t = dict(nhay=0, giat=0, dao=0, lop=0, qm=0, lc=0.0, n=0, cham=[])
    for k in D:
        for ten in (kb, kb + '_trai'):
            if ten not in D[k]: continue
            c = chi_so(D[k][ten])
            t['nhay'] = max(t['nhay'], c['nhay']); t['lc'] = max(t['lc'], c['lc'])
            for x in ('giat', 'dao', 'lop', 'qm', 'n'): t[x] += c[x]
            t['cham'] += c['cham']
    return t


dong = ['| Kịch bản | Nhảy góc lớn nhất ngoài cú vung (độ/khung) | Giật cục | Đảo chiều mỗi nhát | Đổi lớp mỗi nhát | Lưỡi qua mặt (khung) | Lệch chuôi (điểm ảnh) | Góc lúc chạm 0,45 |',
        '|---|---|---|---|---|---|---|---|']
for kb, ten in KB:
    a, b = gop(A, kb), gop(B, kb)
    def g(t):
        if not t['cham']: return '—'
        ang = [x[0] for x in t['cham']]
        return '%d..%d' % (min(ang), max(ang))
    dong.append('| %s | %d → **%d** | %d → **%d** | %.1f → **%.1f** | %.1f → **%.1f** | %d → **%d** | %.2f → **%.2f** | %s → **%s** |' % (
        ten, a['nhay'], b['nhay'], a['giat'], b['giat'], a['dao'] / a['n'], b['dao'] / b['n'], a['lop'] / a['n'], b['lop'] / b['n'], a['qm'], b['qm'], a['lc'], b['lc'], g(a), g(b)))
s = '\n'.join(dong)
print(s)
if OUT: open(OUT, 'w').write(s + '\n')
