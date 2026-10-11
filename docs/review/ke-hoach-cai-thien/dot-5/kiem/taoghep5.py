"""Đợt 5: tạo 4 tệp ghep-<key>.sprite.json (chỉ số). python3 taoghep5.py <so-game.json> <quan5.json> <thư mục ra>
- Cu Tí: giữ nguyên lung, goc_canh, eo của Đợt 3; thêm dinh_dau, tay_truoc và cap vũ khí.
- Ba bé còn lại: điểm khung đứng đầu tiên = chỗ game đang tự ước lượng (để hàng đứng không đổi); theo khung:
  dinh_dau = gốc + độ dời đầu game tự đo; eo = gốc + độ dời eo đo trên Cu Tí (cùng khuôn tư thế; các bé kia không có quần khác màu để đo);
  lung, goc_canh = gốc + 60% dời đầu + 40% dời eo (như Đợt 3); tay_truoc đo trên hình (tay5.py)."""
import json, re, sys, os
from tay5 import tay, HANG
G = json.load(open(sys.argv[1])); Q = json.load(open(sys.argv[2]))['smith']; OUT = sys.argv[3]
REPO = '/home/claude/new-project'
TEN = {'smith': 'Cu Tí', 'hunter': 'Cu Tèo', 'healer': 'Cái Bống', 'wrestler': 'Cu Lì'}
r5 = lambda v: round(v * 2) / 2
num = lambda v: int(v) if v == int(v) else v
P = lambda x, y: [num(r5(x)), num(r5(y))]
# Vũ khí bám tay ở các khung lấy đà, đánh, trúng đòn (hàng ảnh AI). dx, dy, xoay: chỉnh thêm theo loại vũ khí (soi mắt).
KHUNG_VK = ['tele:0', 'tele:1', 'tele:2', 'tele:3'] + ['atk:%d' % i for i in range(6)] + ['hit:%d' % i for i in range(4)]
CHINH = {}  # (key, loại, khung) -> {dx, dy, xoay}
SUA_DIEM = {}  # (key, khung, tên điểm) -> [x, y] sửa tay sau khi soi lưới


def cap(key):
    c = {}
    for vk in ('sword', 'bow', 'spear', 'hammer'):
        theo = {}
        for k in KHUNG_VK:
            e = {'bam': 'tay_truoc'}
            if vk == 'bow' and k.startswith('tele'): e['bam_vk'] = 'day'  # cung lúc lấy đà: bàn tay kéo ra sau là tay kéo dây
            e.update(CHINH.get((key, vk, k), {})); theo[k] = e
        c['vk-' + vk] = {'theo': theo, 'da_chinh': False}
    return c


def lam(key):
    g = G[key]; d0 = g['diem0']; T = tay(key); theo = {}
    if key == 'smith':
        cu = json.load(open(REPO + '/game/art/custom/ghep-smith.sprite.json')) if not os.environ.get('GOC') else json.load(open(os.environ['GOC']))
        diem = {n: cu['diem'][n] for n in ('lung', 'goc_canh', 'eo')}
        cu_theo = cu['diem_theo']
    else:
        diem = {n: P(*d0[n]) for n in ('lung', 'goc_canh', 'eo')}; cu_theo = None
    diem['dinh_dau'] = P(*d0['dinh_dau']); diem['tay_truoc'] = P(*T['idle:0'])
    for ten, n in HANG:
        for i in range(n):
            k = '%s:%d' % (ten, i); kf = k.replace('move', 'run')
            if ten == 'idle': continue  # đứng thở: thân gần như không dời, game tự dời theo đầu (0..1 điểm ảnh)
            dau = g['khop'][k]['dau']; e = {}
            if cu_theo: e.update({n: cu_theo[kf][n] for n in ('lung', 'goc_canh', 'eo') if n in cu_theo.get(kf, {})})
            else:
                w = Q[k]; tr = (0.6 * dau[0] + 0.4 * w[0], 0.6 * dau[1] + 0.4 * w[1])
                e['lung'] = P(d0['lung'][0] + tr[0], d0['lung'][1] + tr[1]); e['goc_canh'] = P(d0['goc_canh'][0] + tr[0], d0['goc_canh'][1] + tr[1])
                e['eo'] = P(d0['eo'][0] + w[0], d0['eo'][1] + w[1])
            e['dinh_dau'] = P(d0['dinh_dau'][0] + dau[0], d0['dinh_dau'][1] + dau[1])
            e['tay_truoc'] = P(*T[k])
            for n in list(e):
                if (key, k, n) in SUA_DIEM: e[n] = SUA_DIEM[(key, k, n)]
            theo[kf] = e
    return {'loai': 'linh-khi-sprite', 'phien_ban': 1, 'doi_tuong': 'ghep', 'ma': 'ghep-' + key, 'nhan_vat': key, 'ten': 'Ghép trang bị · ' + TEN[key],
            'diem': diem, 'diem_theo': theo, 'cap': cap(key)}


def ghi(g):
    s = json.dumps(g, ensure_ascii=False, indent=1)
    s = re.sub(r'\[\s+(-?[\d.]+),\s+(-?[\d.]+)\s+\]', r'[\1, \2]', s)
    s = re.sub(r'\{\s+"bam": "tay_truoc"\s+\}', '{ "bam": "tay_truoc" }', s)
    s = re.sub(r'\{\s+"bam": "tay_truoc",\s+([^{}]*?)\s+\}', lambda m: '{ "bam": "tay_truoc", ' + re.sub(r'\s+', ' ', m.group(1)) + ' }', s)
    return s + '\n'


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True); soi = {}
    for key in TEN:
        g = lam(key); open('%s/ghep-%s.sprite.json' % (OUT, key), 'w', encoding='utf-8').write(ghi(g))
        soi[key] = {'idle:0': g['diem']}
        for k, v in g['diem_theo'].items(): soi[key][k.replace('run', 'move')] = v
        for i in range(1, 6): soi[key]['idle:%d' % i] = g['diem']
    json.dump(soi, open(OUT + '/diem-soi.json', 'w'))
