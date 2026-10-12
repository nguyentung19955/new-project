"""Đo góc kiếm từng khung hình 60 fps cho 4 em bé × các kịch bản (bản hai tệp như web).
Chạy: python3 do.py <url> <tệp json ra>
  url ví dụ http://127.0.0.1:8811/linh-khi-nhe.html?cloud=0   (thêm &kiemmuot=0 để đo bản cũ)
In bảng tóm tắt: bước góc lớn nhất giữa hai khung liền nhau, số lần đảo chiều quay, số lần đổi lớp trước/sau,
số khung lưỡi đi qua mặt, độ lệch chuôi so với nắm tay."""
import json, os, sys
from playwright.sync_api import sync_playwright

URL, OUT = sys.argv[1], sys.argv[2]
KEYS = ['smith', 'hunter', 'wrestler', 'healer']
KB = ['nhat1', 'nhat2', 'nhat3', 'lien', 'chay', 'chieu', 'giu', 'luot']
DAY = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'do_kiem.js')


def cho(g):
    g.wait_for_function("window.G && G.spriteCustom && G.tinhLinh && ['smith','hunter','wrestler','healer'].every(k => { const s = G.spriteCustom.get('em-be-'+k); return s && s.img && s.donMa; }) && G.spriteCustom.timVuKhi({type:'sword',family:0})", timeout=180000)
    g.wait_for_timeout(1500)


def tom(ds):
    """ds: danh sách số đo một kịch bản. Trả về chỉ số."""
    buoc, dao, lop, qm, lc = 0, 0, 0, 0, 0
    trc = None; s0 = 0
    for a, b in zip(ds, ds[1:]):
        if a.get('ang') is None or b.get('ang') is None: continue
        d = b['ang'] - a['ang']
        buoc = max(buoc, abs(d))
        if d and s0 and (d > 0) != (s0 > 0) and abs(d) >= 5: dao += 1
        if abs(d) >= 5: s0 = d
        if a['truoc'] != b['truoc']: lop += 1
    for r in ds:
        if r.get('quaMat'): qm += 1
        if r.get('lechChuoi') is not None: lc = max(lc, r['lechChuoi'])
    return dict(buocMax=buoc, daoChieu=dao, doiLop=lop, quaMat=qm, lechChuoiMax=lc)


with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium' if os.path.exists('/opt/pw-browsers/chromium') else None)
    g = b.new_page(viewport={'width': 844, 'height': 390})
    loi = []
    g.on('pageerror', lambda e: loi.append(str(e)))
    g.goto(URL)
    cho(g)
    g.add_script_tag(path=DAY)
    kq = {}
    for k in KEYS:
        kq[k] = {}
        for kb in KB:
            for f in (1, -1):
                ds = g.evaluate('([a,b,c]) => DK.chay(a,b,c)', [kb, k, f])
                kq[k][kb + ('' if f > 0 else '_trai')] = ds
    b.close()
json.dump(kq, open(OUT, 'w'), ensure_ascii=False)
print('pageerror:', loi or 'không có')
print('%-9s %-11s %7s %6s %6s %6s %8s' % ('em bé', 'kịch bản', 'bướcMax', 'đảo', 'đổiLớp', 'quaMặt', 'lệchChuôi'))
for k in KEYS:
    for kb, ds in kq[k].items():
        t = tom(ds)
        print('%-9s %-11s %7d %6d %6d %6d %8.2f' % (k, kb, t['buocMax'], t['daoChieu'], t['doiLop'], t['quaMat'], t['lechChuoiMax']))
