import json, os, glob, shutil, sys
DST = '/home/claude/new-project/docs/anh-goc/pixellab-quai-vung-1-2'
chon = json.load(open('chon.json')); st = json.load(open('trangthai.json'))
for mid in (sys.argv[1:] or chon):
    c = chon[mid]; d = os.path.join(DST, mid); kd = os.path.join(d, 'khung')
    shutil.rmtree(kd, ignore_errors=True); os.makedirs(kd)
    for row, src in c['rows'].items():
        sel = None
        if ':' in src:
            src, r = src.split(':'); sel = []
            for p in r.split(','):
                a, _, b = p.partition('-'); sel += list(range(int(a), int(b or a) + 1))
        fs = sorted(glob.glob('anim/%s/%s/[0-9][0-9].png' % (mid, src)))
        if sel: fs = [fs[i] for i in sel]
        for i, f in enumerate(fs): shutil.copy(f, os.path.join(kd, '%s-%02d.png' % (row, i)))
    shutil.copy('goc/%s/%s.png' % (mid, c['goc']), os.path.join(d, 'anh-goc-S.png'))
    for f in glob.glob('xoay/%s/%s-*.png' % (mid, st[mid]['xoay'])):
        shutil.copy(f, os.path.join(d, 'xoay-' + f.split('-', 1)[1].split('-', 1)[1]))
    print(mid, len(os.listdir(kd)))
json.dump(chon, open(os.path.join(DST, 'chon.json'), 'w'), indent=1)
