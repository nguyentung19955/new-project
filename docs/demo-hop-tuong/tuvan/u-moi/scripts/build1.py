import json, re, os
exec(open('/tmp/um/phanho.py').read())
r = json.load(open('/tmp/roster.json')); by = {o['id']: o for o in r}
kq = open('/home/claude/new-project/docs/demo-hop-tuong/tuvan/nhandien/KET-QUA.md', encoding='utf-8').read()
sec = kq.split('người giống nhất')[1]
top = re.findall(r'\(`(\w+)`\) \|', sec)[:25]
RK = ['trang', 'xanh', 'tim', 'vang', 'do']
order = [i for i in top if i in D] + sorted([i for i in D if i not in top], key=lambda i: (RK.index(by[i]['bac']), [o['id'] for o in r].index(i)))
COMMON = ("Make an image. Same art style, palette, outline weight and lighting as the attached turret image. Mobile tower defense unit, "
"STRICT TOP-DOWN view (camera straight down, no side faces, no 3/4 perspective), must stay readable at 46 px. "
"Make a 2x2 grid of equal square cells on a solid flat magenta #FF00FF background. Each part centered in its cell, complete, not touching the cell edges, "
"SAME SCALE in every cell, same light direction (top-left). Cell 1 (top-left): the assembled unit. Cell 2 (top-right): BASE only (static mount). "
"Cell 3 (bottom-left): HEAD only (main moving module, pointing straight UP in the image). Cell 4 (bottom-right): PART_B only (secondary moving part). Clean edges, no stray marks or specks. "
"No text, no letters, no grid lines, no glow spilling onto the magenta, no drop shadow on the background, no human limbs, no characters. "
"The new silhouette must be clearly different from the attached old one (keep only the colour theme).")
prompts = {}
for i in order:
    prompts[i] = COMMON + "\n\n" + D[i][5] + " " + STYLE[by[i]['bac']]
json.dump({'order': order, 'prompts': prompts}, open('/tmp/um/prompts.json', 'w'), ensure_ascii=False, indent=0)
HO = {'BAL': 'BALLISTIC', 'ENE': 'ENERGY', 'MEC': 'MECHANICAL', 'FLD': 'FIELD-CONTROL', 'DEP': 'DEPLOYER-FACTORY', 'ORG': 'ORGANIC-ARCANE'}
VAI = {'tc': 'tấn công', 'ht': 'hỗ trợ', 'db': 'đặc biệt'}
L = ['# Phân họ hình dáng 93 ụ — làm lại silhouette (u-moi)\n\n',
     'Nguồn: `tuvan/nhandien/DE-XUAT.md` (nhánh `claude/kiem-nhan-dien`) · roster `thap/js/meta.js` · vai `thap/js/skills*.js`.\n',
     '6 họ: BALLISTIC · ENERGY · MECHANICAL ACTUATOR · FIELD-CONTROL · DEPLOYER-FACTORY · ORGANIC-ARCANE. ',
     '**Thiết bị** = không có nòng súng (pha lê, cổng, vệ tinh, lò rèn, đồng hồ, lõi, đĩa, rương…). Mọi ụ hỗ trợ đều là thiết bị.\n\n',
     'Độ hiếm phản ánh qua độ cầu kỳ: trắng đơn giản → xanh thêm 1 điểm nhấn → tím nhiều chi tiết → vàng viền vàng trang trí → đỏ nhiều lớp, phát sáng đỏ.\n\n']
dev = sum(D[i][1] for i in D) + sum(v[1] for v in DONE.values())
L.append(f'- Thiết bị (không nòng): **{dev}/93 = {dev*100//93}%** · thứ tự gen: 25 ụ dễ nhầm nhất trước, rồi theo bậc trắng → đỏ.\n')
L.append('- 7 ụ đã duyệt (`raw_mod_*.png`): ' + ', '.join(f'`{k}`' for k in DONE) + ' — giữ nguyên, không gen lại.\n\n')
L.append('| # | id | Tên | Bậc | Vai | Họ | Loại | Hình bóng (ý tưởng) | Bệ | Bộ phận động |\n|---|---|---|---|---|---|---|---|---|---|\n')
for k, i in enumerate(order):
    f, d, s, b, m, _ = D[i]; o = by[i]
    L.append(f"| {k+1} | `{i}` | {o['vi']} | {o['bac']} | {VAI.get(o['vai'],o['vai'])} | {HO[f]} | {'thiết bị' if d else 'có nòng/vũ khí'} | {s} | {b} | {m} |\n")
for i, v in DONE.items():
    o = by[i]
    L.append(f"| ✓ | `{i}` | {o['vi']} | {o['bac']} | {VAI.get(o['vai'],o['vai'])} | {HO[v[0]]} | {'thiết bị' if v[1] else 'có nòng/vũ khí'} | {v[2]} (đã duyệt) | — | — |\n")
L.append('\n## Prompt (dán vào ChatGPT, đính kèm `ref/ref_<id>.png`)\n\nPhần chung (đặt trước mọi dòng UNIT):\n\n```\n' + COMMON + '\n```\n\n')
for i in order:
    L.append(f"**`{i}`** — {by[i]['vi']}\n```\n{D[i][5]} {STYLE[by[i]['bac']]}\n```\n")
os.makedirs('/home/claude/wt-demo/docs/demo-hop-tuong/tuvan/u-moi', exist_ok=True)
open('/home/claude/wt-demo/docs/demo-hop-tuong/tuvan/u-moi/PHAN-HO.md', 'w', encoding='utf-8').write(''.join(L))
print(len(order), order[:25])
