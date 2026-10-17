#!/usr/bin/env python3
"""Bộ phận Lam 48×48 vẽ tay theo đúng tỉ lệ ảnh nguyên con (art/nhan-vat/lam-48/nguyen-con.png).

Mỗi bộ phận: ô chữ (mỗi chữ = 1 màu trong bảng PAL), góc trên-trái `o` theo tọa độ khung 48×48
ở tư thế chuẩn, điểm khớp `p` (khớp với cha) và các khớp con `j` — tất cả theo tọa độ khung.
Khớp là GÓC điểm ảnh (số nguyên) để xoay 0° ra đúng y nguyên.
Mặt đất y = 46, tâm giữa hai chân x = 24.

Chạy:  python3 -I tools/lam48_bo_phan.py   → ghi art/nhan-vat/lam-48/bo-phan-48/*.png + bo-phan.json
"""
import json, os

PAL = {
    'O': '0C0F14',  # viền
    'k': '1A212B', 'c': '212835', 'm': '2C3546', 'g': '4A5A6E',   # áo choàng / kim loại
    'd': '21413A', 'G': '32804F', 'L': '83CC93', 'W': 'CEF0D6',   # xanh (không neon) + sáng
    'b': '9C6B30', 'y': 'E1B85A', 'w': 'F3E6C8',                   # vàng chuông
}
# tay/chân phía sau: tối hơn 1 bậc
TOI = {'g': 'm', 'm': 'c', 'c': 'k', 'k': 'k', 'L': 'G', 'G': 'd', 'd': 'k', 'W': 'L', 'y': 'b', 'w': 'y', 'b': 'b', 'O': 'O'}

P = {}

def part(name, o, rows, p, j=None, toi=False):
    rows = [r for r in rows]
    w = max(len(r) for r in rows)
    rows = [r.ljust(w, '.') for r in rows]
    if toi:
        rows = [''.join(TOI.get(ch, ch) for ch in r) for r in rows]
    P[name] = {'o': list(o), 'w': w, 'h': len(rows), 'rows': rows, 'p': list(p), 'j': {k: list(v) for k, v in (j or {}).items()}}

# ---------- MŨ TRÙM (đầu) ----------  gốc (12,2), khớp cổ (24,19), móc chuông (13,14)
part('dau', (12, 2), [
    "..........OOOOO.......",
    "........OOmmmmmLO.....",
    "......OOmmmgggmmLO....",
    ".....OmmmmggmmmmmLO...",
    "....OkmmcmmmmmmmmmLO..",
    "....OkmmcmmmmmmmmmmLO.",
    "...OkkmmccmmmmmmmmmmLO",
    "...OkkcmmcmmmmmmmmmLOO",
    "...OkkccmmcmmmmmmmLOOO",
    "...OkkcckmmcmmmmmLOOkO",
    "..OkkkccckmmmmmmLOOOkO",
    ".OkkkkcccckmmmmLOOOOkO",
    ".OkkkkkcccckmmLOOWLOO.",
    ".OkkkkkcccccmLOOOOOkO.",
    "..OkkkkkccccLOOOOOkO..",
    "..OOkkkkcccGLOOOOOmO..",
    "....OOkkkkcGLLLOOmO...",
    "......OOkkcccccOOmO...",
    "........OOOOOOOOOO....",
], p=(24, 19), j={'moc': (13, 14)})

# ---------- CHUÔNG ---------- treo ở móc (13,14)
part('chuong', (10, 13), [
    "..OOO..",
    ".OW.WO.",
    "..OWO..",
    ".OOyOO.",
    ".OwyyO.",
    "OwwyybO",
    "OwyyybO",
    "OyyyybO",
    "ObbbbbO",
    ".OOwOO.",
    "..OOO..",
], p=(13, 14))

# ---------- THÂN + ÁO CHOÀNG VAI + TRÂM ---------- gốc (14,16), khớp hông (24,33)
part('than', (14, 16), [
    "......OOOOOOOO....",
    "....OOmmmmmmmmOO..",
    "...OmmmmmmmmmmmmO.",
    "..OkmmmmmmmmmmmmmO",
    "..OkmmmmmmmmmmmmmO",
    ".OkcmmmmmmOWLOmmmO",
    ".OkccmmmmOLdLOmmmO",
    "OkkccmmmmmOLLOmmLO",
    "OkkcccmmmmLLGOOgO.",
    "OLLcccmmLLGGGGmgO.",
    ".OOLLcLLGGGGGGLmO.",
    "...OOLGGGGGGGGLcO.",
    ".....OdGGGGGGGLcO.",
    ".....OdGGGGGGGGLO.",
    ".....OdGGGGGGGGLO.",
    ".....OddGGGGGGGLO.",
    ".....OdGGGGGGGGLO.",
    ".....OdGGGGGGGGGO.",
], p=(24, 33), j={'co': (24, 19), 'vaiT': (29, 23), 'vaiS': (19, 23), 'aoGoc': (19, 21)})

# ---------- VẠT ÁO TRƯỚC (đung đưa theo hông) ---------- gốc (19,33)
part('vat', (19, 33), [
    "OdGGGGGGGGLO.",
    "OddGGGGGGGLO.",
    "OdOdGGGOGGGLO",
    ".O.OGGO.OGLO.",
    "....OO...OO..",
], p=(24, 33))

# ---------- ÁO CHOÀNG SAU: 2 đoạn ----------
CAPE = [  # x từ 3
    "............OOOOO.",
    "..........OOmmmmmO",
    ".........OmmmmmmcO",
    "........OmmmmmmckO",
    ".......OmmmmmmckkO",
    "......OmmmmmmckdO.",
    "......OmmmmmckdLO.",
    ".....OLmmmmckdLGO.",
    ".....OGmmmckkdLO..",
    "....OLGmmckkdLGO..",
    "....OGdmmckdLGO...",
    "...OLGdmckkdLGO...",
    "...OGdkmckdLGO....",
    "..OLGdkcckdLGO....",
    "..OGdkkcckdLO.....",
    ".OLGdkOcckdLO.....",
    ".OGdOkOckdLGO.....",
    "OLGdOkOOkdLO......",
    "OGdO.OO.OdGO......",
    "OGO.....OLO.......",
    "OLO......O........",
    "OO................",
]
part('ao1', (3, 20), CAPE[:12], p=(19, 21), j={'aoGiua': (12, 31)})
part('ao2', (3, 30), CAPE[10:], p=(12, 31))

# ---------- TAY TRƯỚC ----------
TAY_TREN = [".OOO.", "OcmgO", "OcmgO", "OcmgO", "OcmgO", "OkcmO", ".OOO."]
CANG_TAY = ["OcmgO.", "OcmgO.", "OGLLO.", "OmgggO", "OmgWgO", ".OOOO."]
part('tayTrenT', (27, 22), TAY_TREN, p=(29, 23), j={'khuyuT': (29, 28)})
part('cangTayT', (27, 28), CANG_TAY, p=(29, 28), j={'namT': (30, 32)})
# ---------- TAY SAU (tối hơn) ----------
part('tayTrenS', (17, 22), TAY_TREN, p=(19, 23), j={'khuyuS': (19, 28)}, toi=True)
part('cangTayS', (17, 28), CANG_TAY, p=(19, 28), j={'namS': (20, 32)}, toi=True)

# ---------- CHÂN ----------
DUI = [".OOOOO.", "OcmmmgO", "OcmmmmO", "OcmmmmO", "OcmmmmO", "OkcmmmO", ".OOOOO."]
ONG = ["OGGLLLO", "OcmmmgO", "OcmmmmO", "OkcmmmO", ".OOOOO."]
GIAY = ["OdGGLLO..", "OcmmmmgO.", "OkcmmmmmO", "OOOOOOOOO"]
part('duiT', (24, 33), DUI, p=(27, 34), j={'goiT': (27, 39)})
part('ongT', (24, 39), ONG, p=(27, 39), j={'coChanT': (27, 43)})
part('giayT', (24, 42), GIAY, p=(27, 43))
part('duiS', (16, 33), DUI, p=(19, 34), j={'goiS': (19, 39)}, toi=True)
part('ongS', (16, 39), ONG, p=(19, 39), j={'coChanS': (19, 43)}, toi=True)
part('giayS', (16, 42), GIAY, p=(19, 43), toi=True)

# ---------- KIẾM (vẽ nằm ngang, góc nghỉ đặt trong tư thế) ---------- chuôi ở (30,32)
part('kiem', (28, 28), [
    "....O.............",
    "...OyO............",
    "OO.OyOOOOOOOOOOO..",
    "OwbbyWWWWWWWWWWWOO",
    "OybbyGGGGGGGGGLLWO",
    "OO.OyOdddddGGGOOO.",
    "...OyO.OOOOOOO....",
    "....O.............",
], p=(30, 32))

# thứ tự lớp: tay sau, chân sau, áo choàng sau, thân, chân trước, vạt, đầu, chuông, tay trước, kiếm
LOP = ['tayTrenS', 'cangTayS', 'duiS', 'ongS', 'giayS', 'ao2', 'ao1', 'than', 'duiT', 'ongT', 'giayT', 'vat', 'dau', 'chuong', 'tayTrenT', 'cangTayT', 'kiem']
# cây xương: con -> (cha, tên khớp ở cha)
CAY = {
    'than': (None, None),
    'dau': ('than', 'co'), 'chuong': ('dau', 'moc'),
    'tayTrenT': ('than', 'vaiT'), 'cangTayT': ('tayTrenT', 'khuyuT'), 'kiem': ('cangTayT', 'namT'),
    'tayTrenS': ('than', 'vaiS'), 'cangTayS': ('tayTrenS', 'khuyuS'),
    'ao1': ('than', 'aoGoc'), 'ao2': ('ao1', 'aoGiua'),
    'vat': (None, None), 'duiT': (None, None), 'ongT': ('duiT', 'goiT'), 'giayT': ('ongT', 'coChanT'),
    'duiS': (None, None), 'ongS': ('duiS', 'goiS'), 'giayS': ('ongS', 'coChanS'),
}

def xuat(out_dir):
    from PIL import Image
    os.makedirs(out_dir, exist_ok=True)
    rgb = {k: tuple(int(v[i:i + 2], 16) for i in (0, 2, 4)) for k, v in PAL.items()}
    for n, q in P.items():
        im = Image.new('RGBA', (q['w'], q['h']), (0, 0, 0, 0))
        for y, r in enumerate(q['rows']):
            for x, ch in enumerate(r):
                if ch != '.':
                    im.putpixel((x, y), rgb[ch] + (255,))
        im.save(os.path.join(out_dir, n + '.png'))
    js = {'pal': PAL, 'lop': LOP, 'cay': CAY, 'parts': P, 'dat': 46, 'tam': 24}
    with open(os.path.join(out_dir, 'bo-phan.json'), 'w', encoding='utf-8') as f:
        json.dump(js, f, ensure_ascii=False, separators=(',', ':'))
    return js

if __name__ == '__main__':
    here = os.path.dirname(os.path.abspath(__file__))
    d = os.path.join(here, '..', 'art', 'nhan-vat', 'lam-48', 'bo-phan-48')
    xuat(os.path.normpath(d))
    print('Đã ghi', len(P), 'bộ phận vào', os.path.normpath(d))
