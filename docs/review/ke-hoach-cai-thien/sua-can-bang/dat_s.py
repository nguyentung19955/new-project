# dat_s.py <data.js> '{"6":0.89,...}' — ghi cột mob/boss mới (trùm giữ nguyên) + dòng ?cbcu=1 khôi phục số cũ
import json, re, sys
p = sys.argv[1]; S = {int(k): v for k, v in json.loads(sys.argv[2]).items()}
M0 = [[1.12, 1.29], [1.2, 1.5], [1.24, 1.57], [1.23, 1.655], [1.27, 1.76], [1.45, 2.03], [1.58, 2.14], [1.63, 2.27], [1.44, 2.43], [1.4, 2.61], [1.64, 3.11], [1.74, 3.25], [1.8, 3.28], [1.62, 2.98], [1.29, 3.0]]
B0 = [[1.12, 1.29], [1.2, 1.5], [1.24, 1.76], [1.23, 1.67], [1.27, 1.86], [1.32, 2.54], [1.44, 2.54], [1.48, 2.61], [1.31, 2.62], [0.96, 1.98], [1.44, 2.22], [1.31, 2.13], [1.17, 2.11], [1.18, 2.33], [1.29, 2.71]]
M = [list(x) for x in M0]; B = [list(x) for x in B0]
for k, s in S.items():
    M[k] = [round(M0[k][0] * s, 2), round(M0[k][1] * s, 2)]
    B[k] = [round(B0[k][0] * M0[k][0] / M[k][0], 3), round(B0[k][1] * M0[k][1] / M[k][1], 3)]
f = lambda a: '[' + ', '.join('[' + ', '.join(repr(v) for v in x) + ']' for x in a) + ']'
src = open(p, encoding='utf-8').read()
src, n1 = re.subn(r'(\n    mob: )\[\[.*?\]\],\n', lambda m: m.group(1) + f(M) + ',\n', src, count=1)
src, n2 = re.subn(r'(\n    boss: )\[\[.*?\]\],\n', lambda m: m.group(1) + f(B) + ',\n', src, count=1)
cu = ('  // sua-can-bang: số cũ của các ải đã bớt quái. Độ khó 2 luôn dùng số cũ (chưa chọn đổi); ?cbcu=1 thì độ khó 1 cũng về số cũ.\n'
      '  G.STAGE_K_CU = { ' + ', '.join(f'{k}: [{M0[k]}, {B0[k]}]' for k in sorted(S)) + ' };\n'
      '  G.STAGE_K_K2 = { mob: G.STAGE_K.mob.map((x) => x.slice()), boss: G.STAGE_K.boss.map((x) => x.slice()) };\n'
      '  for (const k in G.STAGE_K_CU) {\n'
      '    const [m, b] = G.STAGE_K_CU[k];\n'
      '    G.STAGE_K_K2.mob[k] = m.slice(); G.STAGE_K_K2.boss[k] = b.slice();\n'
      '    if (G.CB_CU) { G.STAGE_K.mob[k] = m.slice(); G.STAGE_K.boss[k] = b.slice(); }\n'
      '  }\n')
src, n3 = re.subn(r'  // sua-can-bang: số cũ của các ải đã bớt quái\..*?\n  \}\n', lambda m: cu, src, count=1, flags=re.S)
if not n3:
    src, n3 = re.subn(r'  if \(G\.CB_CU\) \{ // \?cbcu=1: quái / trùm số cũ\n(?:    .*\n)*?  \}\n', lambda m: cu, src, count=1)
if not n3:
    src, n3 = re.subn(r'(\n  \};\n)(  // Độ khó thứ hai)', lambda m: m.group(1) + cu + m.group(2), src, count=1)
assert n1 == n2 == n3 == 1, (n1, n2, n3)
open(p, 'w', encoding='utf-8').write(src)
for k in sorted(S):
    print(k, M0[k], '->', M[k], '|', B0[k], '->', B[k], '| trùm máu ×%.4f st ×%.4f' % (M[k][0] * B[k][0] / (M0[k][0] * B0[k][0]), M[k][1] * B[k][1] / (M0[k][1] * B0[k][1])))
