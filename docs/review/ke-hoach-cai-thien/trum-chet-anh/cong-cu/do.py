from chung import *
for ma, f in VIEC:
    im = Image.open(os.path.join(NGUON, f + '-chet.png')).convert('RGBA')
    cuts = cat8(im); print(ma, 'cắt', cuts)
    d, sh = doc(ma); n = d['net']; fw, fh = d['khung_rong'], d['khung_cao']
    a = np.array(sh)[:, :, 3]
    H = []; Wd = []; bot = []
    for i in range(d['dong_tac']['idle']['so']):
        s = a[0:fh * n, i * fw * n:(i + 1) * fw * n] > 100; m = than_lon(s); x0, y0, x1, y1 = hop(m); H.append(y1 - y0); Wd.append(x1 - x0)
        bot.append(hop(s)[3])
    print('  idle thân cao', H, 'rộng', Wd, 'đáy', bot, 'goc', d['goc'], 'fw,fh', fw, fh)
    A = np.array(im)[:, :, 3]; xs = [0] + [c[0] for c in cuts] + [A.shape[1]]
    for i in range(8):
        s = A[:, xs[i]:xs[i + 1]] >= NGUONG; m = than_lon(s); x0, y0, x1, y1 = hop(m)
        print('   die', i, 'thân', x1 - x0, 'x', y1 - y0, 'đáy', y1, 'đáy-mọi', hop(s)[3])
