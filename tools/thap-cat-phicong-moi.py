#!/usr/bin/env python3
"""TURRET MERGE — 5 chân dung phi công MỚI kiểu SINH VẬT (10/11, người dùng duyệt): chuato (ong bắp cày đỏ đội vương miện),
pandora (thần khói tím mắt sao bay ra từ rương), hydra (rồng rắn 3 đầu), congap (rồng con đội vỏ trứng), thanhdia (tượng cẩm thạch + vầng đá).
Nguồn: docs/demo-hop-tuong/tuvan/phi-cong-moi/<id>.jpg (1254², nền vẽ sẵn — KHÔNG khoá magenta).
Ra (ghi đè ảnh cũ kiểu người):
  thap/assets/pilot_<id>.png      427²  — ô vuông quanh ĐẦU (CAT[id] = trái, trên, cạnh — px ảnh nguồn)
  thap/assets/pn/pilot_<id>.png   256²  — như trên, bản nhỏ
  thap/assets/hero/hero_<id>.jpg  1170×1020 — phần trên ảnh (rộng đủ), trang ụ
và mốc mặt PO_NEO + HERO_NEO (thap/js/chandung.js), FACE_BOX (thap/js/khung.js) theo MAT[id] = (đỉnh đầu y, mắt y, tâm mặt x, cằm y) px ảnh nguồn.
Lô 2 (10/11): thêm 15 id (bang, set, nangluong, laser, khuech, lienket, thaukinh, docton, lophanung, cobac, chimang, baotuyet, xaotron, cuongno, nhanban) — cùng cách cắt.
Lô 3 (11/11): thêm 4 id (vungdoc, drone, khien, overlord) — cùng cách cắt; ảnh nguồn không nhất thiết 1254² (overlord 1058²), tool tính theo cỡ ảnh thật.
Lô 4 (11/11): thêm 10 id (nhieusong, nangsao, luoicheo, railgun, no5, nguyenrua, epxung, orbital, santhuong, sinhdoi) — cùng cách cắt.
LƯU Ý: các id trong CAT KHÔNG còn cắt bằng thap-cat-chandung.py / thap-cat-chandung2.py / thap-cat-thacmana-congap.py / thap-hero.py (ảnh nguồn cũ) — chạy lại các tool đó cho các id này sẽ ghi đè ảnh mới.
Chạy (gốc repo): python3 tools/thap-cat-phicong-moi.py [id ...]     (KHONG_JS=1: chỉ ghi ảnh)
"""
import os, re, sys
from PIL import Image
GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(GOC, 'docs/demo-hop-tuong/tuvan/phi-cong-moi')
A = os.environ.get('OUT', os.path.join(GOC, 'thap/assets'))
JS = os.path.join(GOC, 'thap/js')
# ô vuông cắt (trái, trên, cạnh) — px ảnh nguồn 1254
CAT = {'chuato': (150, 0, 1100), 'pandora': (225, 0, 830), 'hydra': (190, 0, 1000), 'congap': (104, 0, 1150), 'thanhdia': (185, 0, 950),
       'bocap': (250, 0, 900),
       # lô 2 (10/11): 15 phi công sinh vật — xem chú thích MAT
       'bang': (130, 20, 1000), 'set': (230, 0, 1000), 'nangluong': (150, 40, 1050), 'laser': (90, 0, 1100), 'khuech': (150, 0, 1000),
       'lienket': (180, 0, 1080), 'thaukinh': (200, 60, 880), 'docton': (140, 0, 1000), 'lophanung': (0, 0, 1254), 'cobac': (100, 0, 1050),
       'chimang': (70, 40, 1110), 'baotuyet': (150, 0, 1050), 'xaotron': (180, 0, 950), 'cuongno': (200, 0, 1050), 'nhanban': (60, 0, 1100),
       # lô 3 (11/11): 4 ảnh người dùng vẽ lại — xem chú thích MAT (overlord nguồn 1058², 3 ảnh kia 1254²); vungdoc + drone cắt CẢ ảnh: mõm/mỏ dài, ô thẻ dọc mới đủ rộng thấy mắt + cả mõm/mỏ
       'vungdoc': (0, 0, 1254), 'drone': (0, 0, 1254), 'khien': (120, 0, 900), 'overlord': (60, 0, 940),
       # lô 4 (11/11): 10 phi công sinh vật — xem chú thích MAT
       'nhieusong': (150, 0, 950), 'nangsao': (130, 0, 1000), 'luoicheo': (140, 0, 950), 'railgun': (130, 0, 1000), 'no5': (130, 0, 1000),
       'nguyenrua': (170, 0, 1000), 'epxung': (50, 0, 1150), 'orbital': (130, 0, 1050), 'santhuong': (150, 0, 1000), 'sinhdoi': (130, 0, 1000)}
# bocap ↑: bocap (10/11): Crimson Sting — sát thủ bọ cạp giáp tím-đen, ô thấy cả đầu + ngòi đuôi hồng ngọc
# (đỉnh đầu y, đường mắt y, tâm mặt x, cằm y) — px ảnh nguồn; hydra = ĐẦU GIỮA; pandora = cụm mắt sao + miệng cười (không lấy rương)
MAT = {'chuato': (5, 445, 700, 690), 'pandora': (20, 340, 640, 470), 'hydra': (0, 212, 690, 385), 'congap': (20, 410, 690, 690), 'thanhdia': (10, 325, 660, 545),
       'bocap': (150, 500, 650, 665),
       # lô 2 (10/11, "tự do sáng tạo" — mỗi phi công một sinh vật): bang cú tuyết pha lê · set lươn điện · nangluong đom đóm pin · laser quái lông xanh MỘT MẮT (mốc mắt = con mắt lớn)
       # · khuech vẹt mào rock (mắt + mỏ + mào) · lienket giáp ma xích tím (mũ giáp lửa tím) · thaukinh bọ ngựa thợ kính · docton quạ kiếm khách (mỏ + mắt tím dưới vành mũ)
       # · lophanung voi ma mút băng (mắt + lõi trán, thấy ngà) · cobac cóc vàng (mặt + 3 quả trên đầu) · chimang dơi tai chảo · baotuyet yeti · xaotron gấu mèo bài
       # · cuongno lợn rừng mào đỏ · nhanban đầu LỌ 2 sinh vật (đầu = cả cái lọ)
       'bang': (130, 465, 660, 610), 'set': (130, 300, 760, 580), 'nangluong': (200, 455, 770, 680), 'laser': (100, 500, 640, 900), 'khuech': (80, 365, 650, 620),
       'lienket': (40, 385, 720, 650), 'thaukinh': (140, 400, 610, 600), 'docton': (60, 380, 640, 590), 'lophanung': (40, 400, 680, 760), 'cobac': (120, 365, 620, 640),
       'chimang': (110, 530, 660, 740), 'baotuyet': (110, 410, 750, 720), 'xaotron': (30, 385, 650, 580), 'cuongno': (60, 410, 740, 820), 'nhanban': (60, 440, 610, 720),
       # lô 3 (11/11): vungdoc cá sấu nhà hoá học nhìn nghiêng (đầu = gai gáy → cằm, tính cả mõm; tâm ngang giữa mắt và mõm để ô thẻ thấy cả mõm + kính một mắt)
       # · drone bồ nông mũ phi công (đầu = mũ → đáy túi mỏ chứa 3 drone; tâm ngang lệch từ mắt về phía mỏ) · khien tatu hiệp sĩ (đầu tính cả 2 tai + mũ giáp)
       # · overlord mặt nạ đá đen mắt trắng rực + sừng pha lê đỏ (đầu = sừng → miệng răng cưa)
       'vungdoc': (65, 270, 780, 720), 'drone': (65, 325, 770, 830), 'khien': (45, 400, 660, 600), 'overlord': (50, 550, 529, 830),
       # lô 4 (11/11): nhieusong sứa tím đội vương miện (đầu = vương miện → mép chuông) · nangsao ngôi sao sống (đầu = cả ngôi sao) · luoicheo dế âm thoa (mũ lá → cằm)
       # · railgun hải mã nhạc trưởng (mũ → dưới miệng, ngà dài hơn) · no5 hoa thép (mũ nụ → cằm) · nguyenrua búp bê bùa (2 mắt cúc; đầu vải bố) · epxung robot nồi hơi (vòm → đáy đồng hồ áp)
       # · orbital cú máy (chảo → dưới mỏ) · santhuong sói đồng cỏ (mặt hơi lệch phải: tâm giữa mắt vàng và miếng tâm ngắm) · sinhdoi đôi cá koi áp má (mốc = điểm giữa hai đầu)
       'nhieusong': (150, 480, 620, 630), 'nangsao': (40, 430, 600, 700), 'luoicheo': (270, 470, 610, 640), 'railgun': (60, 335, 630, 640), 'no5': (20, 500, 630, 650),
       'nguyenrua': (150, 480, 670, 720), 'epxung': (60, 500, 620, 830), 'orbital': (60, 490, 680, 730), 'santhuong': (0, 470, 660, 700), 'sinhdoi': (120, 450, 650, 610)}
# bocap ↑: bocap: đầu giáp 4 mắt đỏ + hồng ngọc trán


def cat(i):
    im = Image.open(os.path.join(RAW, i + '.jpg')).convert('RGB'); W, H = im.size
    L, T, S = CAT[i]; top, eye, fx, chin = MAT[i]
    sq = im.crop((L, T, L + S, T + S))
    sq.resize((427, 427), Image.LANCZOS).save(os.path.join(A, 'pilot_%s.png' % i), optimize=True)
    sq.resize((300, 300), Image.LANCZOS).save(os.path.join(A, 'pn', 'pilot_%s.png' % i), optimize=True)
    hh = round(W * 1020 / 1170)
    im.crop((0, 0, W, hh)).resize((1170, 1020), Image.LANCZOS).save(os.path.join(A, 'hero', 'hero_%s.jpg' % i), quality=88, optimize=True, progressive=True)
    p = lambda y: round(max(0, min(100, (y - T) / S * 100)), 1)
    po = [p(top), p(eye), round((fx - L) / S * 100, 1), p(chin)]
    hero = [round(top / hh * 100, 1), round(eye / hh * 100, 1), round(fx / W * 100, 1)]
    fb = [po[2], round((po[0] + po[3]) / 2, 1), round(po[3] - po[0], 1)]
    return po, hero, fb


def ghi_js(cd):
    fmt = lambda v: '[' + ', '.join('%g' % n for n in v) + ']'
    p = os.path.join(JS, 'chandung.js'); t = open(p, encoding='utf-8').read()
    for ten, k in (('PO_NEO', 0), ('HERO_NEO', 1)):
        a = t.index('const ' + ten + ' = {'); b = t.index('};', a); blk = t[a:b]
        for i, v in cd.items():
            pat = re.compile(r'(?<![\w])' + i + r'\s*:\s*\[[^\]]*\]')
            blk = pat.sub(i + ': ' + fmt(v[k]), blk, 1) if pat.search(blk) else blk.rstrip() + ' ' + i + ': ' + fmt(v[k]) + ','
        t = t[:a] + blk + t[b:]
    open(p, 'w', encoding='utf-8').write(t)
    p = os.path.join(JS, 'khung.js'); t = open(p, encoding='utf-8').read()
    a = t.index('const FACE_BOX = {'); b = t.index('};', a); blk = t[a:b]
    for i, v in cd.items():
        nv = i + ':[' + ','.join('%g' % n for n in v[2]) + ']'
        pat = re.compile(r'(?<![\w])' + i + r':\[[^\]]*\]')
        blk = pat.sub(nv, blk, 1) if pat.search(blk) else blk.rstrip().rstrip(',') + ',' + nv
    open(p, 'w', encoding='utf-8').write(t[:a] + blk + t[b:])


if __name__ == '__main__':
    cd = {}
    for i in sys.argv[1:] or sorted(CAT):
        cd[i] = cat(i); print(i, 'PO_NEO', cd[i][0], 'HERO_NEO', cd[i][1], 'FACE_BOX', cd[i][2])
    if os.environ.get('KHONG_JS') != '1': ghi_js(cd)
