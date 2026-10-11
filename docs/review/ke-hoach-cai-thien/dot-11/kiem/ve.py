# Dựng ảnh thử cho Đợt 11: MỘT tấm lưới (M hàng × C cột) và M dải lẻ có CÙNG hình (mỗi dải = đúng một hàng của tấm lưới).
import sys, math, random
from PIL import Image, ImageDraw
def hinh(g, kieu, x0, y0, w, h, f, C):
    cx, cy = x0 + w / 2, y0 + h / 2; t = f / max(1, C - 1); r = min(w, h) * (0.20 + 0.12 * math.sin(t * math.pi))
    if kieu == 0:   # bọt tròn: vòng xanh nhạt, đốm sáng xoay
        g.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(120, 200, 255), outline=(20, 24, 46), width=4)
        a = t * 2 * math.pi; g.ellipse([cx + r * .45 * math.cos(a) - r * .2, cy + r * .45 * math.sin(a) - r * .2, cx + r * .45 * math.cos(a) + r * .2, cy + r * .45 * math.sin(a) + r * .2], fill=(240, 250, 255))
    elif kieu == 1: # bi sắt: tròn xám, vệt sáng
        g.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(92, 91, 115), outline=(20, 24, 46), width=4)
        g.rectangle([cx - r * .5, cy - r * .6 + t * r * .4, cx - r * .1, cy - r * .3 + t * r * .4], fill=(206, 205, 218))
    elif kieu == 2: # bom băng: thoi xanh, ngòi nhấp nháy
        g.polygon([(cx, cy - r * 1.2), (cx + r, cy), (cx, cy + r * 1.2), (cx - r, cy)], fill=(50, 176, 233), outline=(20, 24, 46))
        g.rectangle([cx - 5, cy - r * 1.2 - 14 - 6 * (f % 2), cx + 5, cy - r * 1.2], fill=(255, 201, 14))
    elif kieu == 3: # bom to: vuông tối, đốm vàng to dần
        g.rectangle([cx - r, cy - r * 1.1, cx + r, cy + r * 1.1], fill=(60, 50, 60), outline=(20, 24, 46), width=4)
        k = r * (0.2 + 0.5 * t); g.ellipse([cx - k, cy - k, cx + k, cy + k], fill=(254, 236, 134))
    else:           # dải ngang (mũi tên): thân dài, đầu nhọn
        L = w * 0.33; g.rectangle([cx - L, cy - 8, cx + L * .6, cy + 8], fill=(200, 249, 11), outline=(20, 24, 46), width=3)
        g.polygon([(cx + L * .6, cy - 20), (cx + L, cy), (cx + L * .6, cy + 20)], fill=(90, 202, 2), outline=(20, 24, 46))
        g.rectangle([cx - L - 20 * t, cy - 3, cx - L, cy + 3], fill=(251, 254, 208))
def ve(W, H, C, M, kieu, nen, vach, ra, nhieu=0, vien=True):
    im = Image.new('RGB', (W, H), nen); g = ImageDraw.Draw(im)
    cw, ch = W / C, H / M
    for r in range(M):
        for c in range(C): hinh(g, kieu[r], c * cw, r * ch, cw, ch, c, C)
    for c in range(0 if vien else 1, C + 1 if vien else C): x = round(c * cw); g.rectangle([x - vach // 2, 0, x + (vach - 1) // 2, H], fill=(20, 16, 24))
    for r in range(0 if vien else 1, M + 1 if vien else M): y = round(r * ch); g.rectangle([0, y - vach // 2, W, y + (vach - 1) // 2], fill=(20, 16, 24))
    if nhieu:
        rnd = random.Random(7); px = im.load()
        for y in range(H):
            for x in range(W):
                p = px[x, y]; d = rnd.randint(-nhieu, nhieu); px[x, y] = tuple(max(0, min(255, v + d)) for v in p)
    im.save(ra); return im
if __name__ == '__main__':
    D = sys.argv[1]
    HONG, DUONG = (255, 0, 255), (0, 0, 255)
    # lô b1-tron-hong: 4 hàng × 4 cột, ảnh vuông 1024, vạch 6 điểm
    im = ve(1024, 1024, 4, 4, [0, 1, 2, 3], HONG, 6, D + '/lo-4x4.png')
    for r in range(4): im.crop((0, r * 256 + 6, 1024, (r + 1) * 256 - 6)).save(D + f'/dai-{r + 1}.png')   # dải lẻ = đúng hàng đó, bỏ vạch ngang
    # cùng lô, vạch dày 14 điểm + nhiễu nhẹ như ảnh ChatGPT
    ve(1024, 1024, 4, 4, [0, 1, 2, 3], HONG, 14, D + '/lo-4x4-day.png', nhieu=3)
    # cùng lô, KHÔNG kẻ vạch (chia theo khoảng trống)
    im = Image.new('RGB', (1024, 1024), HONG); g = ImageDraw.Draw(im)
    for r in range(4):
        for c in range(4): hinh(g, [0, 1, 2, 3][r], c * 256, r * 256, 256, 256, c, 4)
    im.save(D + '/lo-4x4-khong-vach.png')
    # lô có lề: lưới nằm giữa ảnh ngang 1536×1024, trên dưới có lề nền trơn (ChatGPT không phủ kín)
    luoi = ve(1024, 768, 4, 4, [0, 1, 2, 3], HONG, 6, D + '/tam.png')
    im = Image.new('RGB', (1536, 1024), HONG); im.paste(luoi, (256, 128)); im.save(D + '/lo-4x4-co-le.png')
    # lô có 1 hàng hỏng (hàng 3 để trống)
    im = ve(1024, 1024, 4, 4, [0, 1, 2, 3], HONG, 6, D + '/tam.png'); ImageDraw.Draw(im).rectangle([4, 2 * 256 + 4, 1020, 3 * 256 - 4], fill=HONG)
    g = ImageDraw.Draw(im)
    for c in range(1, 4): g.rectangle([c * 256 - 3, 2 * 256, c * 256 + 2, 3 * 256], fill=(20, 16, 24))
    im.save(D + '/lo-4x4-hang-3-trong.png')
    # lô b1-dai-hong: 5 hàng × 4 cột, ảnh ngang 1536×1024
    im = ve(1536, 1024, 4, 5, [4, 4, 4, 4, 4], HONG, 6, D + '/lo-4x5.png')
    for r in range(5): im.crop((0, round(r * 204.8) + 6, 1536, round((r + 1) * 204.8) - 6)).save(D + f'/dai5-{r + 1}.png')
    # lô 8 cột × 2 hàng nền xanh dương (b23-8-khung)
    ve(1536, 1024, 8, 2, [4, 0], DUONG, 8, D + '/lo-8x2.png', nhieu=2)
