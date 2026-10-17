#!/usr/bin/env python3
"""In sẵn Lam 48×48: dựng 26 animation bằng rig 2D (tools/lam48-rig.js + lam48-anim.js, chạy bằng Node,
không cần trình duyệt) → art/sprite/lam48.png + khóa "lam48" trong art/sprite/atlas.json.

- Bộ phận lấy từ tools/lam48_bo_phan.py (tạo lại art/nhan-vat/lam-48/bo-phan-48/ mỗi lần chạy).
- Nếu có art/nhan-vat/lam-48/tu-the-chinh.json (JSON keyframe xuất từ Rig Lab 2D) thì áp lên.
- Dựng lại tools/rig-lab-2d.html (một file tự chứa, từ tools/rig-lab-2d.mau.html).
- Tùy chọn: --xem  → ghi thêm art/nhan-vat/lam-48/xem-truoc.png (lưới ×3) và GIF ×4 idle/run/combo.
Chạy:  python3 -I tools/in-lam48.py [--xem]
"""
import json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..'))
sys.path.insert(0, HERE)
import lam48_bo_phan as BP  # noqa: E402
from PIL import Image, ImageDraw  # noqa: E402

LAM = os.path.join(ROOT, 'art', 'nhan-vat', 'lam-48')
SPRITE = os.path.join(ROOT, 'art', 'sprite')
CELL = 48

NODE = r"""
const path=require('path'), fs=require('fs');
const H=process.argv[1];
const L=require(path.join(H,'lam48-rig.js')), AN=require(path.join(H,'lam48-anim.js'));
const data=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
let sua={}; if(process.argv[3] && fs.existsSync(process.argv[3])) sua=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));
if(sua.anims) sua=sua.anims;
const rig=L.chuanBi(data), out={thuTu:AN.thuTu, fps:AN.fps, combo:AN.combo, anims:{}};
for(const k of AN.thuTu){
  const a=AN.anims[k], fr=L.dungAnim(rig,a,sua[k]);
  out.anims[k]={loop:a.loop,label:a.label,frames:a.frames.map((f,i)=>{
    const r=fr[i].r, idk=r.ids.kiem; let x0=99,y0=99,x1=-1,y1=-1;
    if(f.hit && idk) for(let q=0;q<r.d.length;q++) if(r.own[q]===idk && r.d[q]){const x=q%48,y=(q/48)|0; if(x<x0)x0=x; if(y<y0)y0=y; if(x>x1)x1=x; if(y>y1)y1=y;}
    return {name:f.name,hold:f.hold,hit:f.hit,comboWindow:f.comboWindow,px:Array.from(r.d).map(v=>L.KEYS[v]).join(''),
            kiem:x1>=0?{x:x0,y:y0,w:x1-x0+1,h:y1-y0+1}:null};
  })};
}
process.stdout.write(JSON.stringify(out));
"""


def dung():
    data = BP.xuat(os.path.join(LAM, 'bo-phan-48'))
    jp = os.path.join(LAM, 'bo-phan-48', 'bo-phan.json')
    sua = os.path.join(LAM, 'tu-the-chinh.json')
    r = subprocess.run(['node', '-e', NODE, HERE, jp, sua], capture_output=True, text=True)
    if r.returncode:
        sys.exit('Node lỗi:\n' + r.stderr)
    return data, json.loads(r.stdout)


def rgb_map():
    return {k: tuple(int(v[i:i + 2], 16) for i in (0, 2, 4)) for k, v in BP.PAL.items()}


def o_anh(px, rgb):
    im = Image.new('RGBA', (CELL, CELL), (0, 0, 0, 0))
    p = im.load()
    for i, ch in enumerate(px):
        if ch != '.':
            p[i % CELL, i // CELL] = rgb[ch] + (255,)
    return im


def kiem_tra(px):
    loi = []
    def co(x, y): return px[y * CELL + x] != '.'
    if any(co(x, 0) for x in range(CELL)): loi.append('sát mép trên')
    if any(co(x, CELL - 1) for x in range(CELL)): loi.append('sát mép dưới')
    if any(co(0, y) for y in range(CELL)): loi.append('sát mép trái')
    if any(co(CELL - 1, y) for y in range(CELL)): loi.append('sát mép phải')
    return loi


def main():
    xem = '--xem' in sys.argv
    data, out = dung()
    rgb = rgb_map()
    names = out['thuTu']
    cols = max(len(out['anims'][k]['frames']) for k in names)
    sheet = Image.new('RGBA', (cols * CELL, len(names) * CELL), (0, 0, 0, 0))
    meta = {'w': CELL, 'h': CELL, 'cols': cols, 'rows': len(names), 'fps': out['fps'],
            'pivot': {'x': 24, 'y': 46}, 'combo': out['combo'], 'anims': {}, 'kiemTra': [], 'anh': 'lam48.png'}
    frames_img = {}
    for r, k in enumerate(names):
        a = out['anims'][k]
        fr = []
        hb = None
        for c, f in enumerate(a['frames']):
            im = o_anh(f['px'], rgb)
            sheet.paste(im, (c * CELL, r * CELL))
            fr.append({'x': c * CELL, 'y': r * CELL, 'hold': f['hold'], 'hit': f['hit'],
                       'comboWindow': f['comboWindow'], 'name': f['name']})
            if f['hit'] and f['kiem'] and hb is None:
                hb = f['kiem']
            loi = kiem_tra(f['px'])
            if loi:
                meta['kiemTra'].append({'anim': k, 'frame': c, 'loi': loi})
            frames_img.setdefault(k, []).append((im, f['hold']))
        meta['anims'][k] = {'row': r, 'loop': a['loop'], 'label': a['label'], 'frames': fr}
        if hb:
            meta['anims'][k]['hitbox'] = hb   # vùng lưỡi kiếm ở khung HIT (tọa độ trong ô)
    os.makedirs(SPRITE, exist_ok=True)
    sheet.save(os.path.join(SPRITE, 'lam48.png'), optimize=True)
    jp = os.path.join(SPRITE, 'atlas.json')
    atlas = json.load(open(jp, encoding='utf-8')) if os.path.isfile(jp) else {}
    atlas['lam48'] = meta
    with open(jp, 'w', encoding='utf-8') as fh:
        json.dump(atlas, fh, ensure_ascii=False, separators=(',', ':'))
    print('Đã ghi art/sprite/lam48.png', sheet.size, '· atlas.json khóa lam48 ·', len(names), 'animation ·',
          sum(len(meta['anims'][k]['frames']) for k in names), 'khung · sát mép:', len(meta['kiemTra']))
    rig_lab(data)
    if xem:
        xem_truoc(names, meta, frames_img)


def data_uri(im, fmt='PNG'):
    import base64, io
    b = io.BytesIO(); im.save(b, fmt, optimize=True)
    return 'data:image/' + fmt.lower() + ';base64,' + base64.b64encode(b.getvalue()).decode()


def rig_lab(data):
    """Ghép Rig Lab 2D thành MỘT file: ảnh bộ phận (data URI) + lõi rig + tư thế + nền + ảnh gốc."""
    mau = open(os.path.join(HERE, 'rig-lab-2d.mau.html'), encoding='utf-8').read()
    meta = json.loads(json.dumps(data))
    png = {}
    for n in meta['parts']:
        png[n] = data_uri(Image.open(os.path.join(LAM, 'bo-phan-48', n + '.png')))
        del meta['parts'][n]['rows']
    # nền Làng Chuông 80×56 cắt từ lớp xa + giữa, mặt đất ở y = 50
    nen_dir = os.path.join(ROOT, 'art', 'nen', 'lang-chuong', 'game')
    nen = Image.new('RGBA', (80, 56), (40, 36, 50, 255))
    try:
        xa = Image.open(os.path.join(nen_dir, 'xa.png')).convert('RGBA')
        nen.alpha_composite(xa.crop((200, 120, 280, 176)))
        gi = Image.open(os.path.join(nen_dir, 'giua.png')).convert('RGBA')
        nen.alpha_composite(gi.crop((300, 196, 380, 252)))
    except OSError:
        pass
    d = ImageDraw.Draw(nen)
    d.rectangle([0, 50, 79, 55], fill=(33, 40, 53, 255)); d.line([0, 50, 79, 50], fill=(74, 90, 110, 255))
    for x in range(0, 80, 8):
        d.point((x + 3, 52), fill=(44, 53, 70, 255))
    goc = Image.open(os.path.join(LAM, 'nguyen-con.png')).convert('RGB').resize((192, 192), Image.LANCZOS)
    lab = {'meta': meta, 'png': png, 'nen': data_uri(nen), 'goc': data_uri(goc, 'JPEG')}
    js = 'window.LAB_DATA=' + json.dumps(lab, ensure_ascii=False, separators=(',', ':')) + ';'
    def doc(f): return open(os.path.join(HERE, f), encoding='utf-8').read().replace('</script', '<\\/script')
    out = mau.replace('/*NHUNG_DATA*/', js).replace('/*NHUNG_RIG*/', doc('lam48-rig.js')).replace('/*NHUNG_ANIM*/', doc('lam48-anim.js'))
    open(os.path.join(HERE, 'rig-lab-2d.html'), 'w', encoding='utf-8').write(out)
    print('Đã ghi tools/rig-lab-2d.html', round(len(out) / 1024), 'KB')


def xem_truoc(names, meta, frames_img):
    S = 3
    C = CELL * S + 4
    cols = meta['cols']
    W0 = 110
    im = Image.new('RGB', (W0 + cols * C, len(names) * C + 4), (24, 26, 30))
    dr = ImageDraw.Draw(im)
    nen = (58, 52, 70)
    for r, k in enumerate(names):
        dr.text((6, r * C + 8), k, fill=(225, 225, 225))
        dr.text((6, r * C + 22), str(len(frames_img[k])) + ' khung', fill=(150, 150, 160))
        for c, (fi, hold) in enumerate(frames_img[k]):
            t = Image.new('RGBA', (CELL, CELL), nen + (255,))
            for x in range(CELL):
                t.putpixel((x, 46), (82, 74, 96, 255))
            t.alpha_composite(fi)
            f = meta['anims'][k]['frames'][c]
            box = (W0 + c * C, r * C + 2)
            im.paste(t.resize((CELL * S, CELL * S), Image.NEAREST).convert('RGB'), box)
            if f['hit']:
                dr.rectangle([box[0] - 1, box[1] - 1, box[0] + CELL * S, box[1] + CELL * S], outline=(225, 184, 90))
            elif f['comboWindow']:
                dr.rectangle([box[0] - 1, box[1] - 1, box[0] + CELL * S, box[1] + CELL * S], outline=(131, 204, 147))
    im.save(os.path.join(LAM, 'xem-truoc.png'), optimize=True)

    def gif(seq, ten, fps=12, S=4):
        imgs, durs = [], []
        for fi, hold in seq:
            t = Image.new('RGBA', (CELL, CELL), nen + (255,))
            for x in range(CELL):
                t.putpixel((x, 46), (82, 74, 96, 255))
            t.alpha_composite(fi)
            imgs.append(t.resize((CELL * S, CELL * S), Image.NEAREST).convert('P', palette=Image.ADAPTIVE, colors=32))
            durs.append(int(1000 / fps * hold))
        imgs[0].save(os.path.join(LAM, ten), save_all=True, append_images=imgs[1:], duration=durs, loop=0, disposal=2)
    gif(frames_img['idle'], 'idle.gif', fps=8)
    gif(frames_img['run'], 'run.gif', fps=12)
    gif(frames_img['attack'] + frames_img['attack2'] + frames_img['attack3'] + frames_img['idle'][:2], 'attack-combo.gif', fps=12)
    print('Đã ghi xem-truoc.png, idle.gif, run.gif, attack-combo.gif trong art/nhan-vat/lam-48/')


if __name__ == '__main__':
    main()
