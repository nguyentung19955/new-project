"""Đợt 5 (3a): thêm điểm neo dinh_dau + co_chuan cho 13 tệp mũ tp-hats-*. CHỈ chèn thêm chữ vào cuối mục trang_phuc, mọi byte cũ giữ nguyên.
dinh_dau tính từ chính cách đặt đã duyệt (lech): là điểm của ảnh mũ mà cách đặt cũ đang để trùng đỉnh đầu của khung xương
(đỉnh đầu = điểm (0,5; -6) trong hệ đầu) → dinh_dau = [0,5 - lech_x, -6 - lech_y]. Nhờ vậy chỗ đặt mũ ở khung đứng không đổi một điểm ảnh nào.
python3 mu5.py <thư mục tệp mũ> [--ghi]   (không có --ghi: chỉ in)"""
import glob, json, os, sys
D = sys.argv[1]; GHI = '--ghi' in sys.argv
num = lambda v: int(v) if v == int(v) else v
for f in sorted(glob.glob(D + '/tp-hats-*.sprite.json')):
    s = open(f, encoding='utf-8').read(); t = json.loads(s); tp = t['trang_phuc']
    if 'diem' in tp: print(os.path.basename(f), 'đã có diem, bỏ qua'); continue
    assert s.endswith('}}') and tp['o'] == 'hats'
    lx, ly = tp['lech']; dd = [num(0.5 - lx), num(-6 - ly)]
    assert 0 <= dd[0] <= t['rong'] and -3 <= dd[1] <= t['cao'], (f, dd)  # vòng lá: đỉnh đầu nằm trên mép ảnh 1 điểm ảnh (vòng ôm quanh đầu)
    them = ',"diem":{"dinh_dau":[%s,%s]},"co_chuan":[%d,%d]' % (dd[0], dd[1], t['rong'], t['cao'])
    s2 = s[:-2] + them + '}}'; t2 = json.loads(s2)
    assert t2['anh'] == t['anh'] and all(t2[k] == t[k] for k in t if k != 'trang_phuc') and all(t2['trang_phuc'][k] == v for k, v in tp.items())
    assert s2.replace(them, '') == s
    print(os.path.basename(f), 'ảnh %d×%d' % (t['rong'], t['cao']), 'lech', tp['lech'], '→ dinh_dau', dd)
    if GHI: open(f, 'w', encoding='utf-8', newline='').write(s2)
