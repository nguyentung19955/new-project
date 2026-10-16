#!/usr/bin/env python3
"""Dựng bảng soát đầy đủ (bang-soat.md) từ ket-qua.json của do-can-chu.py: mỗi khung có chữ ở mỗi màn, VI và EN, trước (?canchucu=1) → sau.

  python3 bang-soat.py <thư mục ra của do-can-chu.py> <tệp .md đích> [cỡ màn, mặc định 844]
"""
import json, os, sys
from collections import OrderedDict

src, dich = sys.argv[1], sys.argv[2]
co = sys.argv[3] if len(sys.argv) > 3 else '844'
tat = json.load(open(os.path.join(src, 'ket-qua.json')))
TEN_LOI = {'lech-ngang': 'lệch ngang', 'lech-doc': 'lệch dọc', 'tran': 'tràn', 'cham': 'chạm viền', 'cat': 'cắt', 'de-chu': 'chữ đè chữ', 'de-icon': 'chữ đè biểu tượng'}
TEN_KHUNG = {'btn': 'nút', 'sbtn': 'nút nhỏ', 'card': 'thẻ', 'panel': 'bảng', 'dialog': 'hộp thoại', 'dialog-ten': 'thẻ tên hộp thoại', 'toast': 'dải thông báo',
             'plate': 'tấm nhỏ', 'inset': 'ô con', 'theNho': 'thẻ kháng/yếu', 'theSapCo': 'thẻ Sắp có', 'khungCanhBao': 'hộp cảnh báo', 'bossBar': 'khung tên trùm', 'anh': 'ảnh khung'}


def gom(kq):
    """màn -> OrderedDict(khoá khung -> {khung, ma, f, chu: [...]})"""
    out = {}
    for canh, v in kq.items():
        d = OrderedDict()
        for c in v['chu']:
            k = (c['khung'], c['ma'], tuple(round(x) for x in c['f']))
            d.setdefault(k, {'khung': c['khung'], 'ma': c['ma'], 'f': c['f'], 'chu': []})['chu'].append(c)
        out[canh] = d
    return out


def lech(ds, ten):
    vs = [c.get(ten) for c in ds if c.get(ten) is not None]
    if not vs: return None
    return max(vs, key=abs)


def loi(ds):
    s = set()
    for c in ds:
        for l in c.get('loi', []): s.add(l)
    return s


def so(v):
    return '–' if v is None else ('%+.1f' % v).replace('.', ',')


def chu_dai(ds):
    t = ' / '.join(c['s'].strip() for c in ds[:3])
    t = t.replace('|', '¦')
    return (t[:46] + '…') if len(t) > 47 else t


dong = ['# Bảng soát đầy đủ — chữ trong khung (màn %s, cả VI và EN)' % ('844×390' if co == '844' else co), '',
        'Tự dựng bằng `cong-cu/bang-soat.py` từ số đo `cong-cu/do-can-chu.py` (ảnh chụp tự động, không chơi thử). Mỗi dòng: một khung có chữ.',
        '"Lệch N / D": lệch tâm ngang / dọc lớn nhất của chữ trong khung so với tâm LÒNG khung (điểm game, + là lệch phải / xuống); "–": không soát chiều đó',
        '(chữ căn trái / phải, hoặc khung lớn). Trước = `?canchucu=1`, sau = bản mới. Lỗi: tên lỗi còn lại sau khi sửa.', '']
tong = {'dat': 0, 'chua': 0, 'sua': 0}
for lang in ('vi', 'en'):
    cu, moi = gom(tat.get('cu-%s-%s' % (lang, co), {})), gom(tat.get('moi-%s-%s' % (lang, co), {}))
    dong += ['## %s' % ('Tiếng Việt' if lang == 'vi' else 'Tiếng Anh'), '', '| Màn | Khung | Chữ | Lệch N trước → sau | Lệch D trước → sau | Lỗi trước | Lỗi sau | Kết quả |', '|---|---|---|---|---|---|---|---|']
    for canh in moi:
        dm, dc = moi[canh], cu.get(canh, OrderedDict())
        dung = set()
        for k, K in dm.items():
            # ghép khung trước: cùng loại + cùng mã + chỗ gần (±8) hoặc cùng chữ đầu
            ghep = None
            for k2, K2 in dc.items():
                if k2 in dung or k2[0] != k[0] or k2[1] != k[1]: continue
                if all(abs(a - b) <= 8 for a, b in zip(k2[2], k[2])) or K2['chu'][0]['s'] == K['chu'][0]['s']:
                    ghep = k2; break
            if ghep: dung.add(ghep)
            T = dc[ghep]['chu'] if ghep else []
            lt, ls = loi(T), loi(K['chu'])
            n0, n1, d0, d1 = lech(T, 'lechN'), lech(K['chu'], 'lechN'), lech(T, 'lechD'), lech(K['chu'], 'lechD')
            kq = 'đạt' if not ls else 'còn: ' + ', '.join(TEN_LOI[x] for x in sorted(ls))
            if lt and not ls: kq = '**đã sửa**'; tong['sua'] += 1
            tong['dat' if not ls else 'chua'] += 1
            ten = TEN_KHUNG.get(K['khung'], K['khung']) + ('' if K['ma'] == 'code' else ' `%s`' % K['ma'])
            dong.append('| %s | %s %s | %s | %s → %s | %s → %s | %s | %s | %s |' % (
                canh, ten, '%d×%d' % (round(K['f'][2]), round(K['f'][3])), chu_dai(K['chu']), so(n0), so(n1), so(d0), so(d1),
                ', '.join(TEN_LOI[x] for x in sorted(lt)) or '–', ', '.join(TEN_LOI[x] for x in sorted(ls)) or '–', kq))
    dong.append('')
dong.insert(5, '**Tổng: %d khung-lượt (VI + EN) — đạt %d (trong đó %d đã sửa), còn lỗi %d.** Chỗ còn lỗi và lý do: `bao-cao.md` mục "Chưa sửa / cố ý".' % (tong['dat'] + tong['chua'], tong['dat'], tong['sua'], tong['chua']))
dong.insert(6, '')
open(dich, 'w').write('\n'.join(dong) + '\n')
print('đã ghi', dich, tong)
