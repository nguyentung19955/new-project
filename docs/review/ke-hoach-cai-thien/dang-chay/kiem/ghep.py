# Ghi "diem_theo_than" cho thân gốc 4 em bé (hàng chạy 8 khung). Hai bước của vòng chạy (khung i và i+4) dùng CÙNG độ dời (trung bình),
# để đồ bám (mũ, vũ khí, đồ lưng) nhún đối xứng hai bước. Thân theo bộ giữ "diem_theo" cũ.
import json, re
R = '/home/claude/new-project/game/art/custom/'
do = json.load(open('do.json'))
r5 = lambda v: round(v * 2) / 2
num = lambda v: int(v) if v == int(v) else v
DAU = {'dinh_dau', 'tam_dau', 'gay', 'mat'}
def luu(k, g):
    s = json.dumps(g, ensure_ascii=False, indent=1)
    s = re.sub(r'\[\s+(-?[\d.]+),\s+(-?[\d.]+)\s+\]', r'[\1, \2]', s)
    s = re.sub(r'\{\s+"bam": "tay_truoc"\s+\}', '{ "bam": "tay_truoc" }', s)
    s = re.sub(r'\{\s+"bam": "tay_truoc",\s+([^{}]*?)\s+\}', lambda m: '{ "bam": "tay_truoc", ' + re.sub(r'\s+', ' ', m.group(1)) + ' }', s)
    open(R + f'ghep-{k}.sprite.json', 'w', encoding='utf-8').write(s + '\n')
for k in ['smith', 'hunter', 'wrestler']:
    g = json.load(open(R + f'ghep-{k}.sprite.json')); v = do[k]; n = v['so']; assert n == 8
    kh = [q['kh'] for q in v['pts']]
    tt = {}
    for i in range(n):
        j = (i + 4) % 8
        dau = [(kh[i]['dau'][a] + kh[j]['dau'][a]) / 2 for a in (0, 1)]
        than = [(kh[i]['than'][0] + kh[j]['than'][0]) / 2, dau[1]]  # thân nhún cùng đầu (đo thân theo khung dễ nhiễu ±2)
        tt['run:%d' % i] = {nm: [num(r5(p[0] + (dau if nm in DAU else than)[0])), num(r5(p[1] + (dau if nm in DAU else than)[1]))] for nm, p in g['diem'].items()}
    g['diem_theo_than'] = {v['ma']: tt}
    luu(k, g); print(k, json.dumps(tt)[:400])
# Cái Bống: điểm đã đo trên thân mới (diem_theo run:0-7), khung 0-3 hạ 0,5 như ảnh, rồi lấy trung bình hai bước
g = json.load(open(R + 'ghep-healer.sprite.json'))
src = {i: {nm: [p[0], p[1] + (0.5 if i < 4 else 0)] for nm, p in g['diem_theo']['run:%d' % i].items()} for i in range(8)}
tt = {}
for i in range(8):
    j = (i + 4) % 8
    tt['run:%d' % i] = {nm: [num(r5((src[i][nm][a] + src[j][nm][a]) / 2)) for a in (0, 1)] for nm in src[i]}
g['diem_theo_than'] = {'em-be-healer': tt}
luu('healer', g); print('healer', json.dumps(tt)[:400])
