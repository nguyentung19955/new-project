from PIL import Image, ImageDraw, ImageFont
import json, math

# Ô 64×64, gốc trên-trái, x phải, y xuống. Pivot (32,63). Quay mặt PHẢI. Kiếm ở tay trước (gần camera).
# Góc kiếm: 0° = chỉ thẳng về trước (phải), +90° = thẳng lên, 180° = về sau, -90° = xuống.
R_HAND, R_ELBOW, R_TIP = 12, 6, 28

def pose(lean, hip_y, ang, elbow_off, back_ang, stance, cloak, knee_bend=0):
    # lean: dịch x của đầu/vai so hông (+ = nghiêng tới)
    hip = (32, hip_y)
    neck = (32 + lean, hip_y - 16)
    head = (32 + lean, hip_y - 23)
    sh = (32 + lean, hip_y - 13)
    a = math.radians(ang)
    hand = (round(sh[0] + R_HAND * math.cos(a)), round(sh[1] - R_HAND * math.sin(a)))
    e = math.radians(ang + elbow_off)
    elbow = (round(sh[0] + R_ELBOW * math.cos(e)), round(sh[1] - R_ELBOW * math.sin(e)))
    tip = (round(sh[0] + R_TIP * math.cos(a)), round(sh[1] - R_TIP * math.sin(a)))
    tip = (max(1, min(62, tip[0])), max(1, min(62, tip[1])))
    b = math.radians(back_ang)
    bsh = (sh[0] - 1, sh[1])
    belbow = (round(bsh[0] + 6 * math.cos(b)), round(bsh[1] - 6 * math.sin(b)))
    bhand = (round(bsh[0] + 11 * math.cos(b)), round(bsh[1] - 11 * math.sin(b)))
    ff, bf = stance  # x bàn chân trước/sau
    fk = (round((hip[0] + ff) / 2 + 1 + knee_bend), round((hip_y + 63) / 2 + 1))
    bk = (round((hip[0] + bf) / 2 - 1), round((hip_y + 63) / 2 + 1))
    return dict(head=head, neck=neck, hip=hip, front_shoulder=sh, front_elbow=elbow, front_hand=hand, sword_tip=tip,
                back_shoulder=bsh, back_elbow=belbow, back_hand=bhand,
                front_knee=fk, front_foot=(ff, 63), back_knee=bk, back_foot=(bf, 63), cloak_tail=cloak)

P = {}
#                         lean hip  ang  elb  back  stance    cloak
# ĐÒN 1 – CHÉM NGANG (kiếm quét từ sau ra trước ở tầm ngực, kết thúc nằm ngang)
P["A1-F0 lay da"]    = pose(-2, 47, 165, -30, -20, (37, 26), (16, 58))
P["A1-F1 lay da sau"] = pose(-3, 47, 185, -35, -10, (36, 25), (15, 59))
P["A1-F2 vung"]      = pose(0, 47, 110, -40, 200, (40, 25), (14, 56))
P["A1-F3 cham"]      = pose(3, 47, 0, 25, 210, (44, 23), (12, 54))
P["A1-F4 theo da"]   = pose(4, 48, -15, 30, 215, (45, 22), (11, 53))
P["A1-F5 thu ve"]    = pose(1, 47, -45, 35, 220, (41, 25), (16, 57))
# ĐÒN 2 – CHÉM CHÉO LÊN (từ thấp sau lưng vung lên cao phía trước, 45°)
P["A2-F0 lay da"]    = pose(-2, 47, -130, 40, 20, (37, 26), (17, 58))
P["A2-F1 lay da sau"] = pose(-3, 48, -150, 40, 30, (36, 25), (16, 59))
P["A2-F2 vung"]      = pose(0, 47, -60, 35, 200, (40, 25), (14, 56))
P["A2-F3 cham"]      = pose(3, 46, 45, -25, 215, (44, 23), (12, 54))
P["A2-F4 theo da"]   = pose(3, 46, 75, -30, 220, (44, 22), (12, 53))
P["A2-F5 thu ve"]    = pose(1, 47, 100, -35, 225, (41, 25), (16, 57))
# ĐÒN 3 – CHÉM CHÉO XUỐNG (từ cao sau đầu bổ xuống trước, 45°, chạm đất)
P["A3-F0 lay da"]    = pose(-2, 47, 130, -35, -20, (37, 26), (17, 58))
P["A3-F1 lay da sau"] = pose(-3, 47, 150, -35, -10, (36, 25), (16, 59))
P["A3-F2 vung"]      = pose(0, 46, 80, -30, 200, (40, 25), (14, 55))
P["A3-F3 cham"]      = pose(4, 49, -45, 25, 215, (46, 22), (12, 52), 2)
P["A3-F4 theo da"]   = pose(4, 50, -65, 30, 220, (46, 22), (11, 51), 2)
P["A3-F5 thu ve"]    = pose(1, 48, -30, 30, 225, (41, 25), (16, 56))

S = 4; W = 64 * S
names = list(P); cols, rows = 6, 3
font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 12)

def draw_frame(p, S, label=None):
    W = 64 * S
    im = Image.new("RGB", (W, W), (36, 32, 46)); d = ImageDraw.Draw(im)
    pt = lambda c: (c[0] * S + S // 2, c[1] * S + S // 2)
    for g in range(0, 64, 8):
        d.line([g * S, 0, g * S, W], fill=(50, 46, 62)); d.line([0, g * S, W, g * S], fill=(50, 46, 62))
    d.line([0, 63 * S + S // 2, W, 63 * S + S // 2], fill=(120, 60, 60), width=2)
    d.line([pt(p["neck"]), pt(p["cloak_tail"])], fill=(70, 150, 90), width=4)
    d.line([pt(p["hip"]), pt(p["back_knee"]), pt(p["back_foot"])], fill=(140, 140, 160), width=4, joint="curve")
    d.line([pt(p["back_shoulder"]), pt(p["back_elbow"]), pt(p["back_hand"])], fill=(140, 140, 160), width=4, joint="curve")
    d.line([pt(p["neck"]), pt(p["hip"])], fill=(235, 235, 235), width=5)
    hx, hy = pt(p["head"]); d.ellipse([hx - 5 * S, hy - 5 * S, hx + 5 * S, hy + 5 * S], outline=(235, 235, 235), width=4)
    d.line([pt(p["hip"]), pt(p["front_knee"]), pt(p["front_foot"])], fill=(235, 235, 235), width=5, joint="curve")
    d.line([pt(p["front_shoulder"]), pt(p["front_elbow"]), pt(p["front_hand"])], fill=(235, 235, 235), width=5, joint="curve")
    d.line([pt(p["front_hand"]), pt(p["sword_tip"])], fill=(206, 240, 214), width=4)
    tx, ty = pt(p["sword_tip"]); d.ellipse([tx - 5, ty - 5, tx + 5, ty + 5], fill=(255, 90, 90))
    fx, fy = pt(p["front_hand"]); d.ellipse([fx - 5, fy - 5, fx + 5, fy + 5], fill=(225, 184, 90))
    px, py = pt((32, 63)); d.line([px - 8, py, px + 8, py], fill=(255, 60, 60), width=2); d.line([px, py - 8, px, py + 8], fill=(255, 60, 60), width=2)
    if label: d.text((4, 4), label, fill=(220, 220, 220), font=font)
    return im

sheet = Image.new("RGB", (cols * W + (cols + 1) * 6, rows * (W + 22) + 6), (28, 26, 36))
d = ImageDraw.Draw(sheet)
for i, n in enumerate(names):
    r, c = divmod(i, cols)
    ox, oy = 6 + c * (W + 6), 6 + r * (W + 22)
    sheet.paste(draw_frame(P[n], S), (ox, oy))
    p = P[n]
    d.text((ox + 2, oy + W + 3), f"{n}  tip{p['sword_tip']} hand{p['front_hand']}", fill=(220, 220, 220), font=font)
sheet.save("combo-que2.png")

frames = [draw_frame(P[n], 5, n) for n in names]
dur = [90, 80, 50, 90, 70, 120] * 3
frames[0].save("combo-que2.gif", save_all=True, append_images=frames[1:], duration=dur, loop=0)
json.dump(P, open("combo-que2.json", "w"), indent=1)

# in dòng toạ độ cho prompt
for n in names:
    p = P[n]
    print(f"{n}: head {p['head']} neck {p['neck']} hip {p['hip']}; front arm shoulder {p['front_shoulder']} elbow {p['front_elbow']} hand {p['front_hand']}, sword tip {p['sword_tip']}; back arm {p['back_shoulder']}->{p['back_elbow']}->{p['back_hand']}; front leg knee {p['front_knee']} foot {p['front_foot']}; back leg knee {p['back_knee']} foot {p['back_foot']}; cloak tail {p['cloak_tail']}.")
