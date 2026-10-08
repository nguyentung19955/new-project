#!/usr/bin/env python3
# ĐO ĐỘ GIỐNG NHAU giữa các tướng pixel (nhánh claude/tuong-pixel-ro) — để người chơi phân biệt tướng trên sân.
# Đọc assets/pixel/tuong/<mã>.png|.json (khung idle 0, căn theo điểm neo chân), tính cho từng cặp:
#   bong  = IoU bóng dáng (mặt nạ alpha)            → cùng dáng
#   mau   = giao biểu đồ màu theo nhóm màu (bỏ viền) → cùng màu chủ đạo
#   nho   = giống nhau khi thu nhỏ 16×16 (RGB)       → nhìn xa trên sân 844×390 (1 điểm sprite ≈ 1 điểm màn hình)
#   diem  = 0.35·bong + 0.45·mau + 0.20·nho  ;  cặp "khó phân biệt" khi diem ≥ NGUONG (mặc định 0.72)
# Chạy:  python3 tools/pixel/do-giong-tuong.py [--out DIR] [--nguong 0.72] [--top 30]
#   → in bảng cặp giống nhất + ghi DIR/bang-tong.png (cỡ thật ×1, ×3 như 1920×934, bóng đen) và DIR/do-giong.txt
import json, os, sys, argparse
from PIL import Image, ImageDraw
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, ROOT)
NHOM = {  # nhóm độ hiếm (js/data.js)
  'thuong': ['lactuong', 'lucsi', 'xathu', 'thosan', 'thaymo', 'thansuong', 'thoren', 'nguphu', 'thogom', 'thaylang',
             'dotnuong', 'denroi', 'chodo', 'haisen', 'dapde', 'chantrau', 'giaodong', 'chuongdong', 'tre', 'ongthoi'],
}

def doc_data():
  src = open(os.path.join(ROOT, 'js', 'data.js'), encoding='utf8').read()
  import re
  leg = {}
  for m in re.finditer(r"\n  (\w+): \{\s*\n\s*legend: '(\w+)'", src):
    leg[m.group(1)] = m.group(2)
  return leg

def palette():
  pal = {}
  for ln in open(os.path.join(ROOT, 'tools', 'pixel', 'palette.txt'), encoding='utf8'):
    p = ln.split('#')[0].split() if not ln.startswith('#') else []
    if not ln.strip() or ln.startswith('#'): continue
    parts = ln.split()
    if len(parts) >= 2 and parts[1].startswith('#'):
      h = parts[1][1:]
      pal[(int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))] = parts[0]
  return pal

# nhóm màu (họ màu) — viền/tối không tính
HO = {
  'sat': ['sat-toi', 'sat', 'sat-sang', 'bac'], 'trang': ['trang-xam', 'trang', 'sang'], 'da': ['da-toi', 'da', 'da-sang'],
  'dat': ['dat-toi', 'dat', 'dat-sang', 'cat'], 'dong': ['dong-toi', 'dong', 'dong-sang', 'vang-nghe', 'vang-sang'],
  'son': ['son-toi', 'son', 'son-sang', 'hong'], 'lua': ['lua', 'lua-sang'], 'la': ['la-toi', 'la', 'la-ma', 'la-sang'],
  'reu': ['reu-toi', 'reu', 'reu-sang'], 'cham': ['cham-toi', 'cham', 'cham-sang'], 'nuoc': ['nuoc', 'nuoc-sang', 'troi'],
  'tim': ['tim-toi', 'tim', 'tim-sang'], 'ngoc': ['ngoc', 'ngoc-sang'],
}
HO_CUA = {c: h for h, cs in HO.items() for c in cs}
BO = {'vien', 'toi', 'khoi'}

def nap(code, pal, W=40, H=36):
  d = os.path.join(ROOT, 'assets', 'pixel', 'tuong')
  js = json.load(open(os.path.join(d, code + '.json')))
  sheet = Image.open(os.path.join(d, code + '.png')).convert('RGBA')
  w, h = js['w'], js['h']
  f = sheet.crop((0, 0, w, h))
  # căn điểm neo về (W/2, H-3)
  can = Image.new('RGBA', (W, H), (0, 0, 0, 0))
  ox, oy = W // 2 - js['ax'], H - 3 - js['ay']
  can.paste(f, (ox, oy))
  a = np.array(can)
  mask = a[:, :, 3] > 0
  hist = {}
  for y, x in zip(*np.nonzero(mask)):
    n = pal.get(tuple(int(v) for v in a[y, x, :3]))
    if n in BO or n is None: continue
    ho = HO_CUA.get(n, n)
    hist[ho] = hist.get(ho, 0) + 1
  tot = sum(hist.values()) or 1
  hist = {k: v / tot for k, v in hist.items()}
  sm = can.resize((W // 2, H // 2), Image.BOX)
  sa = np.array(sm).astype(float)
  rgb = sa[:, :, :3] * (sa[:, :, 3:4] / 255.0) + 60 * (1 - sa[:, :, 3:4] / 255.0)   # nền sân tối
  return {'code': code, 'name': js.get('name', code), 'img': f, 'can': can, 'mask': mask, 'hist': hist, 'small': rgb}

def so(a, b):
  inter = np.logical_and(a['mask'], b['mask']).sum(); uni = np.logical_or(a['mask'], b['mask']).sum()
  bong = inter / max(1, uni)
  mau = sum(min(a['hist'].get(k, 0), b['hist'].get(k, 0)) for k in set(a['hist']) | set(b['hist']))
  nho = 1 - np.abs(a['small'] - b['small']).mean() / 80.0
  nho = max(0.0, min(1.0, nho))
  return bong, mau, nho, 0.35 * bong + 0.45 * mau + 0.20 * nho

def chu_dao(h):
  return ', '.join(f'{k} {int(v*100)}%' for k, v in sorted(h.items(), key=lambda kv: -kv[1])[:3])

def main():
  ap = argparse.ArgumentParser()
  ap.add_argument('--out', default=os.path.join(ROOT, 'tools', 'pixel', 'mau', 'phan-biet'))
  ap.add_argument('--nguong', type=float, default=0.72)
  ap.add_argument('--top', type=int, default=30)
  ap.add_argument('--ten', default='')
  ap.add_argument('--khong-anh', action='store_true')
  o = ap.parse_args()
  pal = palette(); leg = doc_data()
  d = os.path.join(ROOT, 'assets', 'pixel', 'tuong')
  codes = sorted(f[:-5] for f in os.listdir(d) if f.endswith('.json'))
  hang = lambda c: 'thuong' if c in NHOM['thuong'] else ('tim' if leg.get(c) == 'epic' else ('vang' if leg.get(c) == 'legendary' else 'khac'))
  T = {c: nap(c, pal) for c in codes}
  cap = []
  for i, a in enumerate(codes):
    for b in codes[i + 1:]:
      cap.append((a, b) + so(T[a], T[b]))
  cap.sort(key=lambda r: -r[5])
  os.makedirs(o.out, exist_ok=True)
  lines = [f'# Độ giống nhau tướng pixel ({len(codes)} mã, {len(cap)} cặp) — ngưỡng {o.nguong}', '# diem  bong  mau   nho   cặp  (hạng)']
  vuot = [r for r in cap if r[5] >= o.nguong]
  for r in cap[:max(o.top, len(vuot))]:
    lines.append(f'{r[5]:.3f} {r[2]:.2f}  {r[3]:.2f}  {r[4]:.2f}  {r[0]}({hang(r[0])}) ~ {r[1]}({hang(r[1])})' + ('   <<< VƯỢT' if r[5] >= o.nguong else ''))
  lines.append(f'# vượt ngưỡng: {len(vuot)} cặp')
  lines.append('# màu chủ đạo từng mã:')
  for c in codes: lines.append(f'{c:12s} {hang(c):6s} {chu_dao(T[c]["hist"])}')
  txt = '\n'.join(lines)
  open(os.path.join(o.out, f'do-giong{o.ten}.txt'), 'w', encoding='utf8').write(txt + '\n')
  print('\n'.join(lines[:max(o.top, len(vuot)) + 3]))
  if o.khong_anh: return
  # bảng tổng: mỗi hàng một hạng; mỗi ô: ×1 trên nền sân · ×3 · bóng đen ×2
  groups = [('thuong', 'THUONG'), ('tim', 'TIM'), ('vang', 'VANG')]
  CW, CH = 40 * 3 + 8, 36 * 3 + 52
  per = 10
  rows = []
  for g, _ in groups:
    cs = [c for c in codes if hang(c) == g]
    for k in range(0, len(cs), per): rows.append((g, cs[k:k + per]))
  sheet = Image.new('RGB', (per * CW + 10, len(rows) * CH + 10), (46, 52, 40))
  dr = ImageDraw.Draw(sheet)
  col = {'thuong': (200, 200, 200), 'tim': (190, 120, 230), 'vang': (240, 200, 80)}
  for ri, (g, cs) in enumerate(rows):
    for ci, c in enumerate(cs):
      x0, y0 = 5 + ci * CW, 5 + ri * CH
      t = T[c]
      big = t['can'].resize((120, 108), Image.NEAREST)
      sheet.paste(big, (x0, y0), big)
      sheet.paste(t['can'], (x0 + 2, y0 + 110), t['can'])
      sil = Image.new('RGBA', t['can'].size, (0, 0, 0, 0)); sil.putalpha(Image.fromarray((t['mask'] * 255).astype('uint8')))
      blk = Image.new('RGBA', t['can'].size, (10, 10, 10, 255)); blk.putalpha(Image.fromarray((t['mask'] * 255).astype('uint8')))
      b2 = blk.resize((80, 72), Image.NEAREST)
      sheet.paste(Image.new('RGB', (80, 40), (225, 225, 215)), (x0 + 44, y0 + 110))
      b1 = blk.resize((40, 36), Image.NEAREST)
      sheet.paste(b1, (x0 + 44, y0 + 110), b1)
      dr.text((x0 + 2, y0 + 148), c, fill=col[g])
  sheet.save(os.path.join(o.out, f'bang-tong{o.ten}.png'))
  # ảnh các cặp vượt ngưỡng: cạnh nhau ×1 và ×4
  if vuot:
    n = min(len(vuot), 24)
    pi = Image.new('RGB', (2 * 4 * 40 + 120, n * (36 * 4 + 6)), (46, 52, 40)); dp = ImageDraw.Draw(pi)
    for k, r in enumerate(vuot[:n]):
      y0 = k * (36 * 4 + 6)
      for j, c in enumerate(r[:2]):
        im = T[c]['can'].resize((160, 144), Image.NEAREST); pi.paste(im, (j * 160, y0), im)
        pi.paste(T[c]['can'], (330 + j * 42, y0 + 4), T[c]['can'])
      dp.text((330, y0 + 50), f'{r[0]}~{r[1]}', fill=(255, 255, 255)); dp.text((330, y0 + 64), f'{r[5]:.2f}', fill=(255, 220, 120))
    pi.save(os.path.join(o.out, f'cap-giong{o.ten}.png'))

if __name__ == '__main__':
  main()
