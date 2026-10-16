# -*- coding: utf-8 -*-
"""Gom JSON đã dựng -> bảng tự kiểm (bang-kiem.md / .json) + trang xem tự chứa xem.html."""
import json, os
import xuong as X
import dong_tac as DT
import kiem
import lam

KHOP = X.KHOP
DOAN_TEN = ['canh_tay_p', 'cang_tay_p', 'canh_tay_t', 'cang_tay_t', 'dui_p', 'cang_chan_p', 'ban_chan_p',
            'dui_t', 'cang_chan_t', 'ban_chan_t', 'than', 'dau', 'vk']


def doc(goc):
    tat = {}
    for d in DT.DS:
        ma = d[0]
        p = os.path.join(goc, 'khop', ma)
        if not os.path.isdir(p):
            continue
        tat[ma] = {h: json.load(open(os.path.join(p, h + '.json'), encoding='utf-8')) for h in lam.H5}
    return tat


def bang_kiem(goc, tat):
    k3 = kiem.tat_ca()
    rows = []
    for d in DT.DS:
        ma = d[0]
        if ma not in tat:
            continue
        kq = k3[ma]
        j, (g, o) = max(kq.items(), key=lambda kv: kv[1][0])
        vuot = [(jj, v) for jj, v in kq.items() if v[0] > kiem.NGUONG]
        data = {h: tat[ma][h]['khung'] for h in lam.H5}
        k2 = lam.kiem_2d(d, data)
        m2 = max(k2.items(), key=lambda kv: kv[1][0])
        rows.append(dict(ma=ma, ten=d[2], so=d[3], giay=d[4], lap=d[5], cham=(d[7] + 1 if d[7] is not None else None),
                         max_khop=X.TEN_KHOP_QUAY[j], max_goc=g, giua=o, vuot=[(X.TEN_KHOP_QUAY[a], b[0], b[1]) for a, b in vuot],
                         dat=not vuot, max2d=m2[1][0], max2d_huong=m2[0], max2d_cho=m2[1][1]))
    with open(os.path.join(goc, 'bang-kiem.json'), 'w', encoding='utf-8') as f:
        json.dump(rows, f, ensure_ascii=False, indent=1)
    L = ['# Bảng tự kiểm mượt (máy tự đo)', '',
         'Đo góc quay của **từng khớp** (vai, khuỷu, cổ tay/vũ khí, hông, gối, cổ chân, eo, cổ, cả người) giữa 2 khung liền nhau; '
         'động tác lặp đo cả khung cuối → khung đầu. Ngưỡng: **≤ 45°**. Cột "2D" là góc xoay lớn nhất của một đoạn xương '
         'trên màn hình ở 5 hướng (bỏ qua đoạn chĩa thẳng vào camera, bị chiếu ngắn < 50%).', '',
         '| # | Động tác | Khung | Giây | ★ | Khớp đổi nhiều nhất | Góc lớn nhất | Giữa khung | Đạt ≤45° | 2D lớn nhất (hướng) |',
         '|---|---|---|---|---|---|---|---|---|---|']
    for r in rows:
        o = f"{r['giua'][0]}→{r['giua'][1]}" if r['giua'] else '—'
        dat = '✅' if r['dat'] else '⚠️ ' + ', '.join(f'{a} {b}°' for a, b, c in r['vuot'])
        L.append(f"| {r['ma'][:2]} | {r['ten']} | {r['so']} | {r['giay']} | {r['cham'] or '—'} | {r['max_khop']} | {r['max_goc']}° | {o} | {dat} | "
                 f"{r['max2d']}° ({r['max2d_huong'].upper()}) |")
    L += ['', '⚠️ duy nhất: **Lộn né** — "cả người" xoay ~85–95° mỗi khung khi cuộn tròn. Lộn trọn 1 vòng 360° trong 6 khung (0,27 giây) '
          'bắt buộc ~72°/khung trung bình; các khớp tay chân vẫn ≤ 45° (người cuộn tròn như quả bóng nên mắt không thấy giật). '
          'Không thể dưới 45° nếu giữ 6 khung; muốn tuyệt đối thì phải thêm khung (đổi game) — không làm.', '']
    with open(os.path.join(goc, 'bang-kiem.md'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(L))
    return rows


def dung(goc):
    tat = doc(goc)
    rows = bang_kiem(goc, tat)
    moves = []
    for d in DT.DS:
        ma = d[0]
        if ma not in tat:
            continue
        fdir = {}
        for h in lam.H5:
            fl = []
            for k in tat[ma][h]['khung']:
                jj = []
                for n in KHOP:
                    v = k['khop'][n]
                    jj.append([round(v[0], 1), round(v[1], 1)] if v else None)
                ph = k['phu']
                fl.append(dict(j=jj, g=[ph['got_p'], ph['got_t']], t=ph['toc'], m=ph['mat'],
                               o=[DOAN_TEN.index(x) for x in k['thu_tu_ve']], v=k['vn']))
            fdir[h] = fl
        js = tat[ma]['s']
        moves.append(dict(ma=ma, ten=d[2], so=d[3], lap=d[5], cham=js['khung_cham'], dur=js['giay_moi_khung'], vk=d[8], ghi=d[10], f=fdir))
    D = dict(khop=KHOP, doan=DOAN_TEN, moves=moves, kiem=rows, huong_vn=lam.MO_HUONG_VN)
    tpl = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'xem-mau.html'), encoding='utf-8').read()
    html = tpl.replace('/*__DATA__*/null', json.dumps(D, ensure_ascii=False, separators=(',', ':')))
    with open(os.path.join(goc, 'xem.html'), 'w', encoding='utf-8') as f:
        f.write(html)
    print('xem.html', len(html) // 1024, 'KB')
    bao_cao(goc, tat)


TEN_VK_VN = {'kiem': 'kiếm', 'thuong': 'thương', 'bua': 'búa', 'phitieu': 'phi tiêu', None: 'tay không'}


def bao_cao(goc, tat):
    co = [d for d in DT.DS if d[0] in tat]
    so_k = sum(d[3] for d in DT.DS)
    L = ['| Mã | Động tác | Khung | Giây | Thời gian từng khung (ms) | ★ | Vũ khí | Ghi chú |', '|---|---|---|---|---|---|---|---|']
    for d in DT.DS:
        dur = lam.thoi_luong(d)
        dau = '' if d[0] in tat else ' *(chưa dựng)*'
        L.append(f"| {d[0][:2]} | {d[2]}{dau} | {d[3]} | {d[4]} | {' · '.join(str(int(round(x * 1000))) for x in dur)} | "
                 f"{d[7] + 1 if d[7] is not None else '—'} | {TEN_VK_VN[d[8]]} | {d[10] or ''} |")
    bang = open(os.path.join(goc, 'bang-kiem.md'), encoding='utf-8').read().split('\n', 2)[2]
    tien = 'Đủ 27/27 động tác.' if len(co) == 27 else f'Đợt 1: đã dựng {len(co)}/27 động tác ưu tiên ({", ".join(d[2] for d in co)}); phần còn lại đang làm tiếp.'
    t = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'bao-cao-mau.md'), encoding='utf-8').read()
    for k, v in {'TIEN_DO': tien, 'SO_DT': str(len(co)), 'SO_HANG': str(len(DT.DS) * 5), 'SO_KHUNG': str(so_k), 'SO_KHUNG5': str(so_k * 5),
                 'SO_KHUNG4': str(so_k * 4), 'TIET_KIEM': str(so_k * 3), 'BANG': bang, 'DS': '\n'.join(L)}.items():
        t = t.replace('{{' + k + '}}', v)
    with open(os.path.join(goc, 'BAO-CAO.md'), 'w', encoding='utf-8') as f:
        f.write(t)
