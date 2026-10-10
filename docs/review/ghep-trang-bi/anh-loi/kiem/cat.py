import sys, json, base64, io
from PIL import Image, ImageDraw
N = '../../nguon/'
def cut(f, cols, rows, idx, gw, gh, net=2):
    im = Image.open(N + f).convert('RGB'); W, H = im.size
    cw, ch = W / cols, H / rows; c, r = idx % cols, idx // cols
    cell = im.crop((int(c*cw)+4, int(r*ch)+4, int((c+1)*cw)-4, int((r+1)*ch)-4))
    bg = cell.getpixel((3, 3)); px = cell.load(); w, h = cell.size
    a = Image.new('L', (w, h), 0); ap = a.load()
    for y in range(h):
        for x in range(w):
            p = px[x, y]
            if sum((p[i]-bg[i])**2 for i in range(3)) > 110**2: ap[x, y] = 255
    bb = a.getbbox(); cell = cell.crop(bb); a = a.crop(bb)
    rgba = cell.convert('RGBA'); rgba.putalpha(a)
    out = rgba.resize((gw*net, gh*net), Image.LANCZOS)
    al = out.split()[3].point(lambda v: 255 if v > 110 else 0); out.putalpha(al)
    return out
def data(im):
    b = io.BytesIO(); im.save(b, 'PNG'); return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()
items = []
def add(ma, o, look, im, diem, extra=None, net=2):
    tp = {'o': o, 'look': look, 'lech': extra.get('lech', [0, 0]) if extra else [0, 0], 'lop': (extra or {}).get('lop', 'sau'), 'kieu': (extra or {}).get('kieu', 'bua'), 'tay_ao': False}
    if diem: tp['diem'] = diem
    items.append({'loai': 'linh-khi-sprite', 'ma': ma, 'doi_tuong': 'trang-phuc', 'net': net, 'anh': data(im), 'trang_phuc': tp})
    im.save(ma + '.png')
robe = cut('tp-robes.png', 5, 3, 0, 12, 12)
add('tp-robes-thu', 'robes', 'ao_vai', robe, {'co': [6, 1], 'vai_sau': [2, 3], 'vai_truoc': [10, 3], 'hong': [6, 9]}, {'lech': [-6, -14]})
back = cut('tp-backs.png', 3, 2, 0, 8, 12)
add('tp-backs-thu', 'backs', 'ong_ten', back, {'lung': [4, 4]}, {'lech': [-9, -16]})
mask = cut('tp-masks.png', 5, 1, 0, 8, 5)
add('tp-masks-thu', 'masks', 'lua', mask, {'mat': [4, 2]}, {'lech': [-1, -2]})
hand = cut('tp-hands.png', 5, 2, 0, 5, 7)
add('tp-hands-thu', 'hands', 'bua_lua', hand, {'eo': [2, 0]}, {'lech': [1, -6]})
# mũ tự dựng: nón chóp
hat = Image.new('RGBA', (16*2, 9*2), (0, 0, 0, 0)); d = ImageDraw.Draw(hat)
d.polygon([(16, 0), (31, 15), (0, 15)], fill=(216, 180, 92, 255), outline=(27, 17, 24, 255))
d.rectangle([2, 14, 29, 17], fill=(143, 108, 42, 255))
add('tp-hats-thu', 'hats', 'non_la', hat, {'dinh_dau': [8, 6]}, {'lech': [-7, -14], 'lop': 'truoc'})
wing = cut('tp-wings.png', 2, 2, 0, 16, 16)
add('tp-wings-thu', 'wings', 'la', wing, {'goc_canh': [14, 12]}, {'lech': [-15, -13]})
json.dump(items, open('do-thu.json', 'w'))
print([ (i['ma'], ) for i in items])
