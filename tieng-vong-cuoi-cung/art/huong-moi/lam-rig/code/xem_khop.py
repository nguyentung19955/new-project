"""Ảnh kiểm: viền từng mảnh (sau khớp) vẽ chồng lên ảnh chốt → ../kiem/khop-vien.png"""
import os
import sys
import numpy as np
import cv2
from PIL import Image
from chung import SRC_CHOT, MANH, KIEM, doc_json

MAU = {'mu': (255, 0, 0), 'chop': (255, 140, 0), 'than': (0, 200, 0), 'ao-vai': (0, 220, 255), 'vat-truoc': (255, 0, 255),
       'vat-sau': (140, 0, 255), 'chuong': (255, 230, 0), 'gang-gan': (0, 120, 255), 'dao': (255, 255, 255), 'mat': (0, 255, 120),
       'gang-xa': (120, 255, 0), 'ung-gan': (255, 100, 150), 'ung-xa': (150, 100, 255)}


def main(ten_file='khop-vien.png', chi=None):
    os.makedirs(KIEM, exist_ok=True)
    K = doc_json(os.path.join(MANH, 'goc', 'khop.json'))
    base = np.array(Image.open(SRC_CHOT).convert('RGB'))
    base = (base * 0.55 + 255 * 0.45).astype(np.uint8)
    H, W = base.shape[:2]
    for ten, v in K.items():
        if chi and ten not in chi:
            continue
        img = np.array(Image.open(os.path.join(MANH, 'goc', ten + '.png')))
        M = np.array(v['M'], np.float32)
        al = cv2.warpAffine(img[..., 3], M, (W, H))
        cs, _ = cv2.findContours((al > 128).astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        cv2.drawContours(base, cs, -1, MAU[ten], 2)
    Image.fromarray(base).save(os.path.join(KIEM, ten_file))


if __name__ == '__main__':
    main(*(sys.argv[1:2]), chi=sys.argv[2:] or None)
