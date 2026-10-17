from PIL import Image, ImageDraw, ImageFont
import json

# Hệ toạ độ: ô 64×64, gốc góc trên-trái, x sang phải, y xuống dưới. Pivot (32,63). Nhìn ngang, quay mặt sang PHẢI.
# Kiếm ở TAY TRƯỚC (gần camera) như sheet Run ChatGPT đã gen.
P = {}
def f(name, head, neck, hip, fsh, fel, fha, tip, bsh, bel, bha, fkn, fft, bkn, bft, cloak):
    P[name] = dict(head=head, neck=neck, hip=hip, front_shoulder=fsh, front_elbow=fel, front_hand=fha, sword_tip=tip,
                   back_shoulder=bsh, back_elbow=bel, back_hand=bha, front_knee=fkn, front_foot=fft, back_knee=bkn, back_foot=bft, cloak_tail=cloak)

# ĐÒN 1 – chém ngang
f("A1-F0 wind-up",   (30,24),(30,31),(31,47),(30,34),(24,36),(20,38),(8,30),  (31,34),(36,38),(39,41),(36,55),(38,63),(27,55),(25,63),(14,58))
f("A1-F1 swing",     (33,24),(33,31),(32,47),(33,34),(39,36),(44,38),(60,38), (32,34),(27,38),(24,42),(39,55),(42,63),(27,55),(24,63),(16,56))
f("A1-F2 impact",    (35,24),(35,31),(33,47),(35,34),(41,37),(47,40),(63,44), (34,34),(28,38),(24,41),(41,55),(44,63),(26,55),(22,63),(14,54))
f("A1-F3 recover",   (33,24),(33,31),(32,47),(33,34),(38,40),(42,45),(54,56), (32,34),(28,39),(26,43),(39,55),(40,63),(27,55),(25,63),(18,58))
# ĐÒN 2 – chém chéo lên
f("A2-F0 wind-up",   (30,24),(30,31),(31,47),(30,34),(27,42),(24,50),(12,60), (31,34),(36,37),(39,39),(36,55),(37,63),(27,55),(26,63),(16,57))
f("A2-F1 swing",     (33,24),(33,31),(32,47),(33,34),(38,38),(42,44),(56,30), (32,34),(27,37),(23,40),(39,55),(42,63),(27,55),(24,63),(15,56))
f("A2-F2 impact",    (34,23),(34,30),(33,47),(34,33),(39,33),(44,32),(56,16), (33,33),(28,37),(24,40),(40,55),(43,63),(26,55),(23,63),(14,55))
f("A2-F3 recover",   (33,24),(33,31),(32,47),(33,34),(35,30),(38,26),(40,10), (32,34),(28,38),(25,41),(38,55),(40,63),(27,55),(25,63),(18,57))
# ĐÒN 3 – bổ xuống
f("A3-F0 wind-up",   (30,24),(30,31),(31,47),(30,34),(31,28),(28,22),(16,10), (31,34),(36,37),(39,40),(36,55),(37,63),(27,55),(26,63),(17,58))
f("A3-F1 swing",     (33,23),(33,30),(32,47),(33,33),(36,28),(38,22),(42,6),  (32,33),(27,37),(23,40),(39,55),(41,63),(27,55),(25,63),(16,57))
f("A3-F2 impact",    (36,27),(36,33),(33,49),(36,36),(40,40),(46,46),(58,62), (35,36),(29,40),(25,43),(42,57),(46,63),(26,56),(22,63),(13,52))
f("A3-F3 recover",   (34,25),(34,32),(32,48),(34,35),(39,43),(44,50),(60,58), (33,35),(28,39),(25,42),(40,56),(42,63),(27,55),(24,63),(17,57))

S = 4
W = 64 * S
names = list(P)
cols, rows = 4, 3
img = Image.new("RGB", (cols * W + (cols + 1) * 8, rows * (W + 28) + 8), (36, 32, 46))
d = ImageDraw.Draw(img)
try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 13)
except Exception:
    font = ImageFont.load_default()

def pt(c, o): return (o[0] + c[0] * S + S // 2, o[1] + c[1] * S + S // 2)

for i, n in enumerate(names):
    r, c = divmod(i, cols)
    ox, oy = 8 + c * (W + 8), 8 + r * (W + 28)
    d.rectangle([ox, oy, ox + W - 1, oy + W - 1], fill=(44, 40, 56))
    for g in range(0, 64, 8):
        d.line([ox + g * S, oy, ox + g * S, oy + W], fill=(52, 48, 66))
        d.line([ox, oy + g * S, ox + W, oy + g * S], fill=(52, 48, 66))
    d.line([ox, oy + 63 * S + S // 2, ox + W, oy + 63 * S + S // 2], fill=(120, 60, 60), width=2)
    p = P[n]
    # thân
    d.line([pt(p["neck"], (ox, oy)), pt(p["hip"], (ox, oy))], fill=(230, 230, 230), width=5)
    hx, hy = pt(p["head"], (ox, oy)); d.ellipse([hx - 5 * S, hy - 5 * S, hx + 5 * S, hy + 5 * S], outline=(230, 230, 230), width=4)
    # chân sau (tối), chân trước (sáng)
    d.line([pt(p["hip"], (ox, oy)), pt(p["back_knee"], (ox, oy)), pt(p["back_foot"], (ox, oy))], fill=(140, 140, 160), width=4, joint="curve")
    d.line([pt(p["hip"], (ox, oy)), pt(p["front_knee"], (ox, oy)), pt(p["front_foot"], (ox, oy))], fill=(230, 230, 230), width=5, joint="curve")
    # áo choàng
    d.line([pt(p["neck"], (ox, oy)), pt(p["cloak_tail"], (ox, oy))], fill=(70, 150, 90), width=3)
    # tay sau
    d.line([pt(p["back_shoulder"], (ox, oy)), pt(p["back_elbow"], (ox, oy)), pt(p["back_hand"], (ox, oy))], fill=(140, 140, 160), width=4, joint="curve")
    # tay trước + kiếm
    d.line([pt(p["front_shoulder"], (ox, oy)), pt(p["front_elbow"], (ox, oy)), pt(p["front_hand"], (ox, oy))], fill=(230, 230, 230), width=5, joint="curve")
    d.line([pt(p["front_hand"], (ox, oy)), pt(p["sword_tip"], (ox, oy))], fill=(206, 240, 214), width=4)
    tx, ty = pt(p["sword_tip"], (ox, oy)); d.ellipse([tx - 5, ty - 5, tx + 5, ty + 5], fill=(255, 90, 90))
    fx, fy = pt(p["front_hand"], (ox, oy)); d.ellipse([fx - 5, fy - 5, fx + 5, fy + 5], fill=(225, 184, 90))
    px, py = pt((32, 63), (ox, oy)); d.line([px - 8, py, px + 8, py], fill=(255, 60, 60), width=2); d.line([px, py - 8, px, py + 8], fill=(255, 60, 60), width=2)
    d.text((ox + 4, oy + W + 4), f"{n}  tip{p['sword_tip']} hand{p['front_hand']}", fill=(220, 220, 220), font=font)

img.save("/tmp/claude-0/-home-claude/3d4601ea-c0a0-509d-bac3-ac4c31c5f5c0/scratchpad/combo-que.png")
json.dump(P, open("/tmp/claude-0/-home-claude/3d4601ea-c0a0-509d-bac3-ac4c31c5f5c0/scratchpad/combo-que.json", "w"), indent=1)
print("ok", img.size)
