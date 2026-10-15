#!/usr/bin/env python3
"""Vẽ xem-C.png từ số đo của game/tests/vk_do.py (phiên C kiem-can-bang). Đọc xem-C.json (gom số đo) trong thư mục này.
Chạy: python3 docs/review/ke-hoach-cai-thien/kiem-can-bang/ve_xem_c.py"""
import json, os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, 'xem-C.json')))
VK = ['sword', 'bow', 'spear', 'hammer']
TEN = {'sword': 'Kiếm', 'bow': 'Phi tiêu', 'spear': 'Thương', 'hammer': 'Búa'}
MAU = {'sword': '#2a78d6', 'bow': '#1baa7c', 'spear': '#e0a21b', 'hammer': '#d4483b'}

fig, ax = plt.subplots(2, 2, figsize=(13, 8.6))
fig.suptitle('Phiên C — vũ khí: bot Node, bản lưu vừa đủ Sức mạnh khuyên dùng (game/tests/vk_do.py)', fontsize=12)

# 1. tỉ lệ thắng cả ải theo vùng
a = ax[0][0]
w = 0.2
for j, wt in enumerate(VK):
    ys = D['thang_vung'][wt]
    a.bar([x + (j - 1.5) * w for x in range(4)], ys, w, color=MAU[wt], label=TEN[wt])
a.set_xticks(range(4)); a.set_xticklabels(['Vùng 1', 'Vùng 2', 'Vùng 3', 'Cả 15 ải'])
a.set_ylim(0, 118); a.set_ylabel('% thắng'); a.set_title('Tỉ lệ thắng cả ải (hiện tại, 24 lượt mỗi ải)')
a.axhline(75, color='#888', lw=0.8, ls='--'); a.legend(fontsize=8, ncol=4, loc='upper center')

# 2. st/giây lên trùm (tương đối với trung bình 4 vũ khí) theo ải
a = ax[0][1]
ais = D['btrum_ai']
for wt in VK:
    a.plot(range(len(ais)), D['btrum_rel'][wt], marker='o', color=MAU[wt], label=TEN[wt])
a.set_xticks(range(len(ais))); a.set_xticklabels(ais, fontsize=8)
a.axhline(1, color='#888', lw=0.8)
a.set_ylabel('st/giây ÷ trung bình 4 vũ khí'); a.set_title('Sát thương lên trùm từng ải (không lớp thích nghi)')
a.legend(fontsize=8, ncol=4)

# 3. phần của chiêu Đặc biệt (bỏ chưởng): st/giây có / không chiêu Đặc biệt
a = ax[1][0]
labs = D['dac_lab']
for j, wt in enumerate(VK):
    a.bar([x + (j - 1.5) * w for x in range(len(labs))], D['dac_pct'][wt], w, color=MAU[wt], label=TEN[wt])
a.set_xticks(range(len(labs))); a.set_xticklabels(labs, fontsize=8)
a.set_ylabel('% st/giây do chiêu Đặc biệt'); a.set_title('Chiêu Đặc biệt góp bao nhiêu (đo bỏ chiêu, không chưởng)')
a.set_ylim(-8, 58); a.legend(fontsize=8, ncol=4, loc='upper left')

# 4. đề xuất: tỉ lệ thắng 15 ải trước / sau
a = ax[1][1]
labs = D['de_lab']
for j, wt in enumerate(VK):
    a.bar([x + (j - 1.5) * w for x in range(len(labs))], D['de'][wt], w, color=MAU[wt], label=TEN[wt])
a.set_xticks(range(len(labs))); a.set_xticklabels(labs, fontsize=8)
a.set_ylim(40, 104); a.set_ylabel('% thắng cả 15 ải'); a.set_title('Thử số đề xuất (trong bộ nhớ, không sửa game)')
a.legend(fontsize=8, ncol=4, loc='upper left')

fig.tight_layout(rect=(0, 0, 1, 0.95))
fig.savefig(os.path.join(HERE, 'xem-C.png'), dpi=90)
print('đã ghi xem-C.png')
