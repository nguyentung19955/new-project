"""Bé Sen (con gái Chú Lái Đò): khung đã cắt docs/anh-goc/npc-moi/em-be-sen-{1-dung,2-ngoi}-cat -> game/art/custom/nl-sen.sprite.json
python3 dung-be-sen.py [--ghi]
Cắt khung: docs/anh-goc/zed/cat-diem-anh.py <tấm> --hang 1 --so 6 (tự động ĐẠT cả 2 tấm, không cần cắt tay).
Dựng giống hệt ba bạn nhỏ (npc-ban-do-bao-truoc/cong-cu/dung-ban-nho.py, Cái Bống):
- 2 hàng x 6: hàng 0 ĐỨNG (idle, 1,2 s lặp), hàng 1 NGỒI (ngoi, 1,2 s lặp). Ảnh nhìn sang PHẢI.
- Cỡ: chiều cao đứng (trung vị khung hàng đứng, gồm tóc) = 31 điểm game = Cái Bống / Zed.
- Hàng ngồi co theo tỉ lệ SIFT so với hàng đứng (đo bằng hàm của sift_ti_le.py: trung vị 36 cặp khung = 1,126; Cái Bống đo lại = 1,096 khớp số cũ).
- Neo: đáy chân / mông = đường đất (trung vị 'chan' của hàng). Ngang: hàng đứng = trung vị dải chân 15% dưới cùng;
  hàng ngồi = trung vị cột của phần thân trên 55% (đầu + mình).
- Bảng 96 màu, net 2.
Khác ba bạn: đối tượng 'nguoi-lang' mã 'nl-sen' (không phải 'em-be': em bé chỉ còn 3 mã hunter/healer/wrestler, build.py và
sprite_custom.js chặn mã khác). Bé không nằm trong ORDER bảy người làng nên không bị vẽ như người làng; js/village_scene.js tự vẽ hàng 'ngoi'.
Tóc ở tấm đứng (búi đôi) hơi khác tấm mẫu: làng dùng tấm NGỒI là chính; hàng đứng để dành cho vùng 4."""
import sys, os, json, glob, base64
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
CC = os.path.abspath(os.path.join(HERE, '../../npc-ban-do-bao-truoc/cong-cu'))
DAY = os.path.abspath(os.path.join(HERE, '../../../../..'))
GOC = os.path.join(DAY, 'docs/anh-goc/npc-moi')
GHI = '--ghi' in sys.argv
RA = os.path.join(HERE, 'ra'); os.makedirs(RA, exist_ok=True)
N = 2; SO_MAU = 96; CAO = 31; SIFT = 1.126

# dùng lại thu(), luu_png() của dung-npc.py và doc_hang() của dung-ban-nho.py (không chạy phần dựng)
ns = {'__file__': os.path.join(CC, 'dung-npc.py')}
exec(compile(open(os.path.join(CC, 'dung-npc.py'), encoding='utf-8').read().split('\nso_do = {}')[0], 'dung-npc.py', 'exec'), ns)
thu, luu_png = ns['thu'], ns['luu_png']
nb = {'__file__': os.path.join(CC, 'dung-ban-nho.py'), '__name__': 'x'}
src = open(os.path.join(CC, 'dung-ban-nho.py'), encoding='utf-8').read()
src = src.split('\n# dùng lại thu()')[0] + '\n' + 'def doc_hang' + src.split('\ndef doc_hang')[1].split('\nso_do = {}')[0]
exec(compile(src, 'dung-ban-nho.py', 'exec'), nb)
doc_hang = nb['doc_hang']

dung = doc_hang('be-sen', '1-dung', False); ngoi = doc_hang('be-sen', '2-ngoi', True)
hc = float(np.median([a.shape[0] - dy for a, x, dy in dung]))
z1 = N * CAO / hc; z2 = z1 / SIFT
hang = [[(thu(a, z1), x * z1, dy * z1) for a, x, dy in dung], [(thu(a, z2), x * z2, dy * z2) for a, x, dy in ngoi]]
trai = max(x for v in hang for a, x, dy in v); phai = max(a.shape[1] - x for v in hang for a, x, dy in v)
tren = max(a.shape[0] - dy for v in hang for a, x, dy in v); duoi = max(max(0.0, dy) for v in hang for a, x, dy in v)
GX = int(np.ceil(trai / N)) + 1; FW = GX + int(np.ceil(phai / N)) + 1
GY = int(np.ceil(tren / N)) + 1; FH = GY + int(np.ceil(duoi / N)) + 1
sh = np.zeros((2 * FH * N, 6 * FW * N, 4), np.uint8)
for R, v in enumerate(hang):
    for C, (a, x, dy) in enumerate(v):
        X = int(round(GX * N - x)); Y = int(round(GY * N + dy - a.shape[0]))
        o = sh[R * FH * N:(R + 1) * FH * N, C * FW * N:(C + 1) * FW * N]
        assert X >= 0 and Y >= 0 and X + a.shape[1] <= FW * N and Y + a.shape[0] <= FH * N
        sub = o[Y:Y + a.shape[0], X:X + a.shape[1]]; sub[:] = np.where(a[..., 3:4] > 0, a, sub)
png, sh = luu_png(sh, SO_MAU)
def bao(R):  # khung đầu của hàng R: (cao, rộng) điểm game
    m = sh[R * FH * N:(R + 1) * FH * N, :FW * N, 3] > 127; ys = np.nonzero(m.any(1))[0]; xs = np.nonzero(m.any(0))[0]
    return int(round((GY * N - ys[0]) / N)), int(round((xs[-1] - xs[0] + 1) / N))
cao, rong = bao(0); cao_ngoi, rong_ngoi = bao(1)
t = {'loai': 'linh-khi-sprite', 'doi_tuong': 'nguoi-lang', 'ma': 'nl-sen', 'ten': 'Bé Sen', 'phien_ban': 1,
     'ghi_chu': 'Con gái Chú Lái Đò (15/10). Hàng 0 đứng (để dành vùng 4), hàng 1 ngồi ở bến đò (js/village_scene.js vẽ hàng ngoi).',
     'tam': 'data:image/png;base64,' + base64.b64encode(png).decode(), 'net': N, 'khung_rong': FW, 'khung_cao': FH, 'goc': [GX, GY],
     'rong': rong_ngoi, 'cao': cao_ngoi,
     'dong_tac': {'idle': {'hang': 0, 'so': 6, 'giay': 1.2, 'lap': True}, 'ngoi': {'hang': 1, 'so': 6, 'giay': 1.2, 'lap': True}}}
Image.fromarray(sh).save(os.path.join(RA, 'nl-sen.png'))
ra = os.path.join(DAY, 'game/art/custom', 'nl-sen.sprite.json') if GHI else os.path.join(RA, 'nl-sen.sprite.json')
json.dump(t, open(ra, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
so_do = {'o': [FW, FH], 'goc': [GX, GY], 'cao_dung': cao, 'rong_dung': rong, 'cao_ngoi': cao_ngoi, 'rong_ngoi': rong_ngoi, 'png': len(png), 'byte': os.path.getsize(ra)}
print(so_do)
json.dump(so_do, open(os.path.join(RA, 'so-do-be-sen.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
