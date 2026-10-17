#!/usr/bin/env python3
"""Tổng hợp kết quả do-chu-giua.py: số chữ được soát tâm, số lệch > ngưỡng, lệch lớn nhất; tách các chỗ CỐ Ý (bố cục riêng).
  python3 tong-hop.py <thư mục kết quả> [--chi-tiet]"""
import json, os, sys
CO_Y = [  # (điều kiện, lý do) — chỗ chữ cố ý KHÔNG nằm giữa cả khung
    (lambda c, k: 'lang-thanh-duoi' in (c['ma'] or ''), 'nhãn dưới biểu tượng ở dải nút làng (mỗi nhãn giữa biểu tượng của nó, không giữa cả dải)'),
    (lambda c, k: k in ('cu-do', 'cu-do-chuong') and c['khung'] == 'inset', 'ô cây chưởng: tên ở trên + chấm bậc / "cần N" ở dưới (ô 18 điểm không đủ chỗ cho khối giữa)'),
    (lambda c, k: k.startswith('hanh-trang-cay-chuong') and c['s'] == '+' , 'dấu "+" đặt giữa ô nhỏ bên trái chấm bậc, không giữa cả ô'),
    (lambda c, k: k == 'so-yeu-quai' and c['s'] == '?', 'dấu "?" giữa phần hình quái (trên hàng sao), không giữa cả ô'),
    (lambda c, k: k.startswith('chao') and c['khung'] == 'toast', 'dải "Chạm để bắt đầu" phóng to / thu nhỏ nhịp nhàng khi chụp'),
]
def main():
    d = json.load(open(os.path.join(sys.argv[1], 'ket-qua.json')))
    ct = '--chi-tiet' in sys.argv
    print('| Lượt | Chữ soát tâm | Lệch > ngưỡng | Lệch dọc lớn nhất | Lệch ngang lớn nhất | Cố ý (bố cục riêng) | Tràn | Chạm viền |')
    print('|---|---|---|---|---|---|---|---|')
    for key in sorted(d):
        n = loi = coy = tran = cham = 0; mD = mN = 0.0; ds = []
        for canh, v in d[key].items():
            for c in v['chu']:
                if 'tran' in c['loi']: tran += 1
                if 'cham' in c['loi']: cham += 1
                if c.get('lechD') is None and c.get('lechN') is None: continue
                ly = next((r for f, r in CO_Y if f(c, canh)), None)
                if ly: coy += 1; continue
                n += 1
                mD = max(mD, abs(c.get('lechD') or 0)); mN = max(mN, abs(c.get('lechN') or 0))
                if 'lech-doc' in c['loi'] or 'lech-ngang' in c['loi']: loi += 1; ds.append((canh, c))
        print('| %s | %d | %d | %.2f | %.2f | %d | %d | %d |' % (key, n, loi, mD, mN, coy, tran, cham))
        if ct:
            for canh, c in ds: print('    ', canh, repr(c['s'][:30]), c['khung'], c['f'], 'D', c.get('lechD'), 'N', c.get('lechN'))
main()
