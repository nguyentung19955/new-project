"""PHÚC LÀNH GIỮA ẢI (js/phuc_lanh.js) — đo cân bằng bằng bot, chạy luật game trong Node (tests/node_trang.js), không trình duyệt.
Bản lưu: tests/cay_luu.json (bản lưu thật của bot lúc vừa đủ Sức mạnh khuyên dùng từng ải, như tests/balance.py).
Mỗi ải chạy n lượt với hai cách:
  - "không": bot vẫn mở bảng rồi gỡ phúc lành ngay (G.botCfg.phucLanh = 'bo') — cùng số lần gọi G.rnd, trận như khi chưa có phúc lành
  - "có":    bot chọn ngẫu nhiên 1 trong 3 thẻ (G.botCfg.phucLanh = 'ngau') — như người chơi chọn bừa
So: thời gian qua ải trung bình (lượt thắng), tỉ lệ thắng; riêng trùm vùng (ải 5 mỗi vùng): tỉ lệ thắng.
Chạy: python3 tests/phuc_lanh.py [n mỗi ải, mặc định 8] [ải 0..14 cách nhau dấu phẩy | -] [--rieng: đo riêng từng phúc lành (ép)]
       [--tron=8: số lượt trùm vùng (mặc định gấp đôi n)] [--may=2: số tiến trình Node chạy song song]
Ngưỡng (QUYET-DINH-TU-VAN-16-10.md mục 8, việc tư vấn 4):
  - có phúc lành, thời gian qua ải trung bình nhanh hơn không quá 10% (cả 15 ải gộp)
  - trùm vùng: tỉ lệ thắng không vọt — tăng không quá 15 điểm phần trăm
  - không lỗi trang, không số NaN
Thoát mã 1 nếu sai ngưỡng."""
import sys, os, json, time
from multiprocessing import Pool
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import cd_lib

REAL = json.load(open(os.path.join(HERE, 'cay_luu.json')))
JS = r"""
([r, i, sv, c, seed, wt]) => {
  const o = JSON.parse(sv); o.canLai = G.SAVE_CAN_LAI || 1;
  G.save = G.fixSave(o); G.save.sound = false;
  if (wt && wt !== 'bow') G.weaponById(G.save.carry[0]).type = wt; // như tests/balance.py "vukhi"
  G.botCfg.prefer = wt || null;
  G.botCfg.phucLanh = String(c).indexOf('bo') === 0 ? 'bo' : c;
  G.rnd = G.srand(seed); // cùng hạt giống cho mọi cách → so theo cặp (trận y hệt cho tới lúc phúc lành tác động)
  G.startStage(r, i, 0);
  if (wt === 'bow') G.getRun().P.cur = 1;
  const res = G.probeRun(900), S = G.getRun();
  return { win: !!res.win, t: res.t, k: S && S.pl ? S.pl.k : null, opts: S && S.pl ? S.pl.opts : null, bad: res.bad, toiTrum: !!(res.rooms && res.rooms.length && res.rooms[res.rooms.length - 1][0] === 'boss') };
}
"""

def chay(viec):
    errs = []
    pg = cd_lib.NodePage(errs)
    out = []
    for (k, c, seed, wt) in viec:
        r, i = divmod(k, 5)
        try:
            x = pg.evaluate(JS, [r, i, REAL[k], c, seed, wt])
        except Exception as e:
            x = {'win': False, 't': 0, 'k': None, 'bad': ['lỗi: ' + str(e)[:200]], 'toiTrum': False}
        x['ai'] = k; x['cach'] = c; x['vk'] = wt; x['seed'] = seed
        out.append(x)
    pg.close()
    return out, errs

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    n = int(args[0]) if args else 8
    only = [int(x) for x in args[1].split(',')] if len(args) > 1 and args[1] != '-' else list(range(15))
    rieng = '--rieng' in sys.argv
    may = next((int(a.split('=')[1]) for a in sys.argv if a.startswith('--may=')), 2)
    tron = next((int(a.split('=')[1]) for a in sys.argv if a.startswith('--tron=')), n * 2)
    cachs = ['bo', 'ngau']
    if rieng:
        cachs = ['bo', 'guom', 'no', 'tre', 'riu', 'trong', 'ngua', 'nui', 'song', 'ca', 'ngan', 'than', 'hoa', 'noc', 'suong']
    # --rieng: mỗi phúc lành vũ khí đo với đúng món của nó làm món chính (Nỏ thần: phi tiêu; Gậy tre: thương; Rìu: búa), so với 'bo' cùng món
    VK = {'no': 'bow', 'tre': 'spear', 'riu': 'hammer'} if rieng else {}
    viec = []
    for k in only:
        for j in range(tron if k % 5 == 4 and not rieng else n):
            seed = 1 + (k * 7919 + j * 104729) % 999983
            for c in cachs:
                viec.append((k, c, seed, VK.get(c)))
                if rieng and c in VK: viec.append((k, 'bo:' + c, seed, VK[c]))
    if rieng: cachs = cachs + ['bo:' + c for c in VK]
    t0 = time.time()
    phan = [viec[j::may] for j in range(may)]
    with Pool(may) as p:
        kq = p.map(chay, phan)
    rs = [x for a, _ in kq for x in a]
    errs = [e for _, b in kq for e in b]
    print(f'== {len(rs)} lượt, {time.time() - t0:.0f} giây')
    bad = 0
    def tk(ds):
        thang = [x for x in ds if x['win']]
        return len(thang), len(ds), (sum(x['t'] for x in thang) / len(thang) if thang else 0)
    tong = {c: [0, 0] for c in cachs}  # thắng, lượt
    nen = lambda c: ('bo:' + c) if ('bo:' + c) in cachs else 'bo'  # cách đối chứng của c (cùng món chính)
    for k in only:
        dong = [f'{k // 5 + 1}-{k % 5 + 1}:']
        for c in cachs:
            w, m, t = tk([x for x in rs if x['ai'] == k and x['cach'] == c])
            tong[c][0] += w; tong[c][1] += m
            t0 = tk([x for x in rs if x['ai'] == k and x['cach'] == nen(c)])[2]
            dong.append(f"{c} {w}/{m} {t:>4.0f}s" + (f" ({(t / t0 - 1) * 100:+.0f}%)" if not c.startswith('bo') and t0 else ''))
        print(' | '.join(dong))
    # gộp theo CẶP: cùng ải + cùng hạt giống, cả hai cách đều thắng → tỉ số thời gian; trung bình các tỉ số (ít nhiễu hơn so trung bình rời)
    theo = {(x['ai'], x['seed'], x['cach']): x for x in rs}
    print('TỔNG (so theo cặp cùng hạt giống, lượt cả hai cách đều thắng):')
    for c in cachs:
        if c.startswith('bo'): continue
        ti = []
        for x in rs:
            if x['cach'] != c or not x['win']: continue
            y = theo.get((x['ai'], x['seed'], nen(c)))
            if y and y['win'] and y['t'] > 0: ti.append(x['t'] / y['t'])
        v = sum(ti) / max(1, len(ti))
        nhanh = (1 - v) * 100
        w0, m0 = tong[nen(c)]
        print(f"  {c:>6}: thắng {tong[c][0]}/{tong[c][1]} ({100 * tong[c][0] / max(1, tong[c][1]):.0f}%; đối chứng {100 * w0 / max(1, m0):.0f}%), nhanh hơn {nhanh:+.1f}% ({len(ti)} cặp)")
        if not rieng and c == 'ngau' and nhanh > 10: print('SAI: có phúc lành nhanh hơn quá 10%'); bad = 1
    trum = [k for k in only if k % 5 == 4]
    if trum and not rieng:
        print('TRÙM VÙNG:')
        for k in trum:
            a = [tk([x for x in rs if x['ai'] == k and x['cach'] == c]) for c in cachs]
            print(f"  vùng {k // 5 + 1}: không {a[0][0]}/{a[0][1]} → có {a[1][0]}/{a[1][1]}")
        w0 = sum(tk([x for x in rs if x['ai'] == k and x['cach'] == 'bo'])[0] for k in trum); m0 = sum(tk([x for x in rs if x['ai'] == k and x['cach'] == 'bo'])[1] for k in trum)
        w1 = sum(tk([x for x in rs if x['ai'] == k and x['cach'] == 'ngau'])[0] for k in trum); m1 = sum(tk([x for x in rs if x['ai'] == k and x['cach'] == 'ngau'])[1] for k in trum)
        d = 100 * (w1 / max(1, m1) - w0 / max(1, m0))
        print(f"  gộp: {100 * w0 / max(1, m0):.0f}% → {100 * w1 / max(1, m1):.0f}% ({d:+.0f} điểm)")
        if d > 15: print('SAI: trùm vùng tỉ lệ thắng tăng quá 15 điểm'); bad = 1
    hong = [x for x in rs if x.get('bad')]
    if hong: print('LỖI SỐ LIỆU:', [(x['ai'], x['cach'], x['bad'][:2]) for x in hong[:5]]); bad = 1
    if errs: print('LỖI TRANG:', errs[:3]); bad = 1
    sys.exit(bad)

if __name__ == '__main__':
    main()
