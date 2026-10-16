# -*- coding: utf-8 -*-
"""Tự kiểm mượt: góc quay của từng khớp giữa 2 khung liền nhau (và khung cuối -> khung đầu với động tác lặp)."""
import xuong as X
import dong_tac as DT

NGUONG = 45.0


def kiem_dong_tac(d):
    ma, so, lap, vk = d[0], d[3], d[5], d[8]
    poses = d[9]()
    assert len(poses) == so, (ma, len(poses), so)
    Rs = []
    for p in poses:
        q = dict(X.GOC_TU_THE); q.update(p)
        Rs.append(X.quay_cuc_bo(q))
    cap = [(i, i + 1) for i in range(so - 1)] + ([(so - 1, 0)] if lap else [])
    kq = {}
    for j in X.TEN_KHOP_QUAY:
        if j == 'co_tay_p' and not vk:
            continue
        m, o = 0.0, None
        for a, b in cap:
            if j == 'co_tay_p' and ma in DT.VK_KHUNG and not (a in DT.VK_KHUNG[ma] and b in DT.VK_KHUNG[ma]):
                continue
            g = X.goc_quay(Rs[a][j], Rs[b][j])
            if g > m:
                m, o = g, (a + 1, b + 1)
        kq[j] = (round(m, 1), o)
    return kq


def tat_ca():
    return {d[0]: kiem_dong_tac(d) for d in DT.DS}


if __name__ == '__main__':
    for ma, kq in tat_ca().items():
        xau = {j: v for j, v in kq.items() if v[0] > NGUONG}
        mx = max(kq.items(), key=lambda kv: kv[1][0])
        print(ma, 'max', mx[0], mx[1], 'VUOT:' if xau else 'ok', xau if xau else '')
