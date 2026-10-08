#!/usr/bin/env python3
"""Biến một ảnh tạo hình nhân vật thành bộ sprite pixel đủ động tác cho game Linh Khí.

Ví dụ:
    python tools/sprite/gen_sprite.py art/raw/tho-ren.png --name smith --height 40

Lần chạy đầu, công cụ tự đoán chỗ cắt và ghi file art/raw/tho-ren.rig.json.
Mở ảnh tools/sprite/out/smith/xem-khop.png để xem; nếu cắt lệch thì sửa số trong
file rig.json rồi chạy lại đúng lệnh trên. Xem thêm tools/sprite/HUONG-DAN.md.
"""
import argparse
import base64
import io
import json
import math
import sys
import unicodedata
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, str(Path(__file__).resolve().parent))
import sprite_rig as SR  # noqa: E402
import sprite_anim as SA  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
K = 8  # mỗi điểm ảnh pixel được tính trên 8 x 8 ô khi xoay mảnh
REST_ANGLE = {"sword": 0, "hammer": -42, "spear": -22, "bow": 0}  # cộng thêm vào góc cầm khi không đánh


# ---------- chữ tiếng Việt cho ảnh xem trước ----------
_FONTS = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "DejaVuSans.ttf",
    "C:/Windows/Fonts/segoeui.ttf", "C:/Windows/Fonts/arial.ttf", "C:/Windows/Fonts/tahoma.ttf",
    "/System/Library/Fonts/Supplemental/Arial.ttf", "/Library/Fonts/Arial.ttf", "Arial.ttf",
]
_font_cache = {}


def font(size):
    if size not in _font_cache:
        f = None
        for name in _FONTS:
            try:
                f = ImageFont.truetype(name, size)
                break
            except OSError:
                continue
        _font_cache[size] = f
    return _font_cache[size]


def text(d, xy, s, size=14, fill=(240, 234, 217)):
    f = font(size)
    if f is None:  # không có phông tiếng Việt: bỏ dấu
        s = "".join(c for c in unicodedata.normalize("NFD", s.replace("đ", "d").replace("Đ", "D")) if unicodedata.category(c) != "Mn")
        d.text(xy, s, fill=fill)
    else:
        d.text(xy, s, fill=fill, font=f)


# ---------- vũ khí mẫu cho ảnh xem trước (bắt chước A.weapon trong game) ----------
def _hex(c):
    c = c.lstrip("#")
    return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4))


def _rect(im, x, y, w, h, col):
    H, W = im.shape[:2]
    x0, y0, x1, y1 = max(0, x), max(0, y), min(W, x + w), min(H, y + h)
    if x1 > x0 and y1 > y0:
        im[y0:y1, x0:x1, :3] = _hex(col) if isinstance(col, str) else col
        im[y0:y1, x0:x1, 3] = 255


def _line(im, x0, y0, x1, y1, col, t=1):
    n = max(abs(x1 - x0), abs(y1 - y0), 1)
    for i in range(n + 1):
        _rect(im, int(math.floor(x0 + (x1 - x0) * i / n + 0.5)), int(math.floor(y0 + (y1 - y0) * i / n + 0.5)), t, t, col)


def draw_weapon(im, kind, x0, y0, ang, pull=0):
    """Vẽ vũ khí mẫu từ bàn tay (x0, y0) theo góc ang."""
    r = math.radians(ang)
    cs, sn = math.cos(r), math.sin(r)
    pt = lambda k: (int(math.floor(x0 + cs * k + 0.5)), int(math.floor(y0 + sn * k + 0.5)))
    col, col2 = "#b9c0c9", "#ffffff"
    if kind == "sword":
        L = 16
        a, b, e = pt(-2), pt(3), pt(L)
        _line(im, *a, *b, "#5a4030", 2)
        _line(im, *b, *e, col, 2)
        _line(im, *b, *e, col2, 1)
        g1 = (int(round(b[0] - sn * 3)), int(round(b[1] + cs * 3)))
        g2 = (int(round(b[0] + sn * 3)), int(round(b[1] - cs * 3)))
        _line(im, *g1, *g2, "#caa15a", 2)
    elif kind == "hammer":
        a, e = pt(-2), pt(13)
        _line(im, *a, *e, "#7a5a3a", 2)
        s = 8
        _rect(im, e[0] - s // 2 - 1, e[1] - s // 2 - 1, s + 3, s + 2, "#2a2422")
        _rect(im, e[0] - s // 2, e[1] - s // 2, s + 1, s, col)
        _rect(im, e[0] - s // 2, e[1] - s // 2, s + 1, 1, col2)
        _rect(im, e[0] - s // 2, e[1] - s // 2, 1, s, col2)
    elif kind == "spear":
        a, b, e, k = pt(-10), pt(18), pt(24), pt(16)
        _line(im, *a, *b, "#8a6a44", 1)
        _line(im, *k, *b, "#c8372d", 2)
        _line(im, *b, *e, col, 2)
        _rect(im, e[0], e[1], 1, 1, col2)
    else:  # cung
        x0, y0 = int(round(x0)), int(round(y0))
        top, bot, mid = (x0 + 1, y0 - 9), (x0 + 1, y0 + 9), (x0 + 5, y0)
        bc = "#9a7448"
        _line(im, *top, mid[0], mid[1] - 4, bc, 1)
        _line(im, mid[0], mid[1] - 4, mid[0], mid[1] + 4, bc, 2)
        _line(im, mid[0], mid[1] + 4, *bot, bc, 1)
        sx = x0 + 1 - int(pull)
        _line(im, *top, sx, y0, "#e8e2d0", 1)
        _line(im, sx, y0, *bot, "#e8e2d0", 1)
        if pull:
            _line(im, sx, y0, x0 + 8, y0, "#e8e2d0", 1)
            _rect(im, x0 + 8, y0 - 1, 2, 3, col)


def over(dst, src):
    m = src[:, :, 3] > 0
    dst[m] = src[m]


def with_weapon(fr, kind, rest):
    """Khung hình có gắn vũ khí mẫu (để xem trước)."""
    out = np.zeros_like(fr["rgba"])
    wp = np.zeros_like(out)
    if not fr["an"]:
        hx, hy = fr["hand"]
        ang = fr["goc"] + (REST_ANGLE[kind] if rest else 0)
        draw_weapon(wp, kind, SA.OX + hx, SA.OY + hy, ang, fr["keo"])
    if fr["lop"] == "sau":
        over(out, wp)
        over(out, fr["rgba"])
    else:
        over(out, fr["rgba"])
        over(out, wp)
    return out


# ---------- ảnh xem khớp ----------
PART_COLORS = {
    "dau": (255, 210, 80), "than": (120, 220, 255), "tay_truoc": (255, 120, 120), "tay_sau": (200, 120, 255),
    "chan_truoc": (120, 255, 140), "chan_sau": (60, 190, 160),
}
PART_NAMES = {
    "dau": "đầu", "than": "thân", "tay_truoc": "tay trước", "tay_sau": "tay sau",
    "chan_truoc": "chân trước", "chan_sau": "chân sau",
}
JOINT_NAMES = {
    "co": "cổ", "vai_truoc": "vai trước", "khuyu_truoc": "khuỷu trước", "ban_tay_truoc": "bàn tay trước",
    "vai_sau": "vai sau", "khuyu_sau": "khuỷu sau", "ban_tay_sau": "bàn tay sau",
    "hong_truoc": "hông trước", "goi_truoc": "gối trước", "ban_chan_truoc": "bàn chân trước",
    "hong_sau": "hông sau", "goi_sau": "gối sau", "ban_chan_sau": "bàn chân sau",
}


def idx_to_rgba(low, pal):
    out = np.zeros(low.shape + (4,), np.uint8)
    m = low != SR.EMPTY
    out[m, :3] = pal[low[m]].astype(np.uint8)
    out[m, 3] = 255
    return out


def save_rig_preview(path, idx, palette, rig, rigk, sk, notes):
    Z = 12
    low = SR.downscale_mode(idx, K)
    h, w = low.shape
    mx, my = 60, 50
    pw = w * Z + mx * 2 + 200
    # phần dưới: từng mảnh sau khi cắt
    names = [n for n in rigk["order"] if rigk["parts"][n]["img"].max() != SR.EMPTY or (rigk["parts"][n]["img"] != SR.EMPTY).any()]
    PZ = 5
    cols = 6
    cell_w, cell_h = (w + 4) * PZ + 12, (h + 4) * PZ + 26
    rows = (len(names) + cols - 1) // cols
    W = max(pw, cols * cell_w + 20)
    H = h * Z + my * 2 + 40 + rows * cell_h + 30 + 18 * max(1, len(notes))
    im = Image.new("RGB", (W, H), (38, 34, 44))
    d = ImageDraw.Draw(im)
    text(d, (10, 8), "XEM KHỚP: các hộp và điểm khớp mà công cụ dùng để cắt. Số trên thước là toạ độ ghi trong rig.json.", 15)
    spr = Image.fromarray(idx_to_rgba(low, palette)).resize((w * Z, h * Z), Image.Resampling.NEAREST)
    d.rectangle([mx - 1, my - 1, mx + w * Z, my + h * Z], fill=(58, 54, 66))
    im.paste(spr, (mx, my), spr)
    for x in range(0, w + 1):
        big = x % 5 == 0
        d.line([mx + x * Z, my - (8 if big else 4), mx + x * Z, my], fill=(200, 200, 200))
        if big:
            text(d, (mx + x * Z - 6, my - 24), str(x), 12)
            d.line([mx + x * Z, my, mx + x * Z, my + h * Z], fill=(90, 86, 100))
    for y in range(0, h + 1):
        big = y % 5 == 0
        d.line([mx - (8 if big else 4), my + y * Z, mx, my + y * Z], fill=(200, 200, 200))
        if big:
            text(d, (mx - 30, my + y * Z - 8), str(y), 12)
            d.line([mx, my + y * Z, mx + w * Z, my + y * Z], fill=(90, 86, 100))
    im.paste(spr, (mx, my), spr)
    S = lambda p: (mx + p[0] * Z, my + p[1] * Z)
    lx, ly = mx + w * Z + 24, my
    for name, part in rig["manh"].items():
        col = PART_COLORS.get(name, (255, 255, 255))
        label_ = PART_NAMES.get(name, name)
        if part.get("hop"):
            x0, y0, x1, y1 = part["hop"]
            d.rectangle([*S((x0, y0)), *S((x1, y1))], outline=col, width=2)
        else:
            label_ += " (sao chép %s)" % PART_NAMES.get(part.get("sao_chep"), "?")
        d.rectangle([lx, ly + 3, lx + 12, ly + 15], fill=col)
        text(d, (lx + 18, ly), label_, 14)
        ly += 20
    for e in rig.get("phu", []):
        x0, y0, x1, y1 = e["hop"]
        d.rectangle([*S((x0, y0)), *S((x1, y1))], outline=(255, 255, 255), width=2)
        px, py = S(e["khop"])
        d.ellipse([px - 5, py - 5, px + 5, py + 5], fill=(255, 255, 255), outline=(0, 0, 0))
        d.rectangle([lx, ly + 3, lx + 12, ly + 15], fill=(255, 255, 255))
        text(d, (lx + 18, ly), "phụ: " + e["ten"], 14)
        ly += 20
    # xương và khớp
    J = {k: v / K for k, v in rigk["J"].items()}
    for a, b, c in (("vai_truoc", "khuyu_truoc", "ban_tay_truoc"), ("vai_sau", "khuyu_sau", "ban_tay_sau"),
                    ("hong_truoc", "goi_truoc", "ban_chan_truoc"), ("hong_sau", "goi_sau", "ban_chan_sau")):
        if a in J and c in J:
            col = PART_COLORS[{"vai": "tay", "hon": "chan"}[a[:3]] + a[a.index("_"):]]
            d.line([*S(J[a]), *S(J.get(b, J[a])), *S(J[c])], fill=col, width=3)
    ly += 10
    text(d, (lx, ly), "Điểm khớp:", 14)
    ly += 20
    for i, (k, v) in enumerate(J.items(), 1):
        px, py = S(v)
        d.ellipse([px - 6, py - 6, px + 6, py + 6], fill=(255, 255, 255), outline=(0, 0, 0), width=2)
        text(d, (px - (4 if i < 10 else 7), py - 7), str(i), 11, fill=(0, 0, 0))
        text(d, (lx, ly), "%d. %s [%.1f, %.1f]" % (i, JOINT_NAMES.get(k, k), v[0], v[1]), 13)
        ly += 17
    # các mảnh sau khi cắt
    y0 = my + h * Z + my
    text(d, (10, y0 - 22), "Các mảnh sau khi cắt (mảnh nào thiếu hoặc dính phần lạ thì sửa hộp của mảnh đó):", 15)
    lab = {"_1": " (trên)", "_2": " (dưới)"}
    for i, n in enumerate(names):
        cx, cy = 10 + (i % cols) * cell_w, y0 + (i // cols) * cell_h
        lowp = SR.downscale_mode(rigk["parts"][n]["img"], K, 0.35)
        rgba = idx_to_rgba(np.where(lowp == SR.EMPTY, SR.EMPTY, lowp).astype(np.uint8), sk.pal)
        pim = Image.fromarray(rgba).resize((w * PZ, h * PZ), Image.Resampling.NEAREST)
        d.rectangle([cx, cy, cx + cell_w - 8, cy + cell_h - 6], fill=(58, 54, 66))
        im.paste(pim, (cx + 6, cy + 22), pim)
        base = n[:-2] if n[-2:] in lab else n
        text(d, (cx + 4, cy + 2), PART_NAMES.get(base, base.replace("phu_", "phụ: ")) + lab.get(n[-2:], ""), 13)
    yy = y0 + rows * cell_h + 6
    for s in notes or ["Công cụ không có ghi chú gì thêm."]:
        text(d, (10, yy), "• " + s, 13, fill=(255, 210, 122))
        yy += 18
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path)


# ---------- chạy ----------
def crop_box(rgba):
    ys, xs = np.where(rgba[:, :, 3] > 0)
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def main():
    ap = argparse.ArgumentParser(description="Biến ảnh tạo hình thành bộ sprite pixel đủ động tác.")
    ap.add_argument("input", type=Path, help="ảnh tạo hình (PNG hoặc JPG), nhân vật quay mặt sang phải, nền trơn")
    ap.add_argument("--name", required=True, help="tên hero trong game (smith, hunter, healer, wrestler) hoặc tên thử")
    ap.add_argument("--height", type=int, default=40, help="chiều cao nhân vật tính bằng điểm ảnh, kể cả viền (mặc định 40)")
    ap.add_argument("--colors", type=int, default=14, help="số màu tối đa (mặc định 14)")
    ap.add_argument("--tol", type=float, default=90, help="độ rộng khi nhận màu nền (mặc định 90)")
    ap.add_argument("--rig", type=Path, help="file khai báo chỗ cắt (mặc định: <tên ảnh>.rig.json nằm cạnh ảnh)")
    ap.add_argument("--doan-lai", action="store_true", help="bỏ file rig.json cũ, để công cụ tự đoán lại từ đầu")
    ap.add_argument("--chi-xem-khop", action="store_true", help="chỉ tách mảnh và xuất ảnh xem-khop.png rồi dừng")
    ap.add_argument("--giu-net", action="store_true", help="giữ nét viền mảnh của ảnh gốc (mặc định bỏ đi cho hình sạch)")
    ap.add_argument("--no-inner", action="store_true", help="không tô nét tối chỗ tay đè lên thân")
    ap.add_argument("--game-dir", type=Path, default=ROOT / "game" / "assets" / "hero", help="thư mục sprite của game")
    ap.add_argument("--out-dir", type=Path, default=ROOT / "tools" / "sprite" / "out", help="thư mục ảnh xem trước")
    args = ap.parse_args()

    out = args.out_dir / args.name
    out.mkdir(parents=True, exist_ok=True)
    print("1/5 Tách nền và chuyển sang pixel...")
    idx, palette = SR.prepare(args.input, args.height, args.colors, args.tol, K, clean_lines=not args.giu_net)
    rig_path = args.rig or args.input.with_suffix(".rig.json")
    rig, notes, fresh = SR.load_or_make_rig(rig_path, idx, K, args.doan_lai)
    print("2/5 %s %s" % ("Tự đoán chỗ cắt, đã ghi" if fresh else "Dùng chỗ cắt trong", rig_path))
    for s in notes:
        print("     Lưu ý:", s)
    rigk = SR.split_parts(idx, rig, K, len(palette))
    sk = SA.Skeleton(rigk, palette, inner_lines=not args.no_inner)
    save_rig_preview(out / "xem-khop.png", idx, palette, rig, rigk, sk, notes)
    print("     Ảnh kiểm tra chỗ cắt:", out / "xem-khop.png")
    if args.chi_xem_khop:
        return

    print("3/5 Dựng khung hình cho các động tác...")
    anims = SA.build_anims(sk)
    for a in anims:
        a["out"] = []
        for ms, pose in a["frames"]:
            rgba, hand = sk.render(pose)
            a["out"].append(dict(rgba=rgba, hand=hand, ms=ms, goc=float(pose.get("wa", 0)) + float(pose.get("rot", 0)),
                                 lop=pose.get("wl", "truoc"), keo=int(round(pose.get("keo", 0))), an=bool(pose.get("an"))))

    print("4/5 Ghép tấm sprite cho game...")
    rows, sheet_w, y = [], 1, 0
    for a in anims:
        x, row_h = 0, 0
        for fr in a["out"]:
            x0, y0, x1, y1 = crop_box(fr["rgba"])
            fr["crop"] = (x0, y0, x1, y1)
            fr["at"] = (x, y)
            x += x1 - x0 + 1
            row_h = max(row_h, y1 - y0)
        sheet_w = max(sheet_w, x)
        y += row_h + 1
    sheet = np.zeros((y, sheet_w, 4), np.uint8)
    meta = {"ten": args.name, "phien_ban": 1, "cao": args.height, "bong": max(6, int(round(sk.width * 0.42))),
            "goc_nghi": REST_ANGLE, "ghi_chu": "o = [x, y, rong, cao] trong sheet.png; chan va tay tinh tu goc tren trai cua o; "
            "goc = goc vu khi (do, 0 chia ra truoc, am la chia len); lop = vu khi ve truoc hay sau than; keo = do keo day cung; an = giau vu khi.",
            "dong_tac": {}}
    for a in anims:
        fl = []
        for fr in a["out"]:
            x0, y0, x1, y1 = fr["crop"]
            ax, ay = fr["at"]
            sheet[ay:ay + y1 - y0, ax:ax + x1 - x0] = fr["rgba"][y0:y1, x0:x1]
            hx, hy = fr["hand"]
            fl.append({"o": [ax, ay, x1 - x0, y1 - y0], "chan": [SA.OX - x0, SA.OY - y0],
                       "tay": [int(round(SA.OX + hx)) - x0, int(round(SA.OY + hy)) - y0],
                       "goc": round(fr["goc"], 1), "lop": fr["lop"], "keo": fr["keo"], "an": fr["an"], "ms": fr["ms"]})
        meta["dong_tac"][a["id"]] = {"ten": a["ten"], "lap": a["loop"], "nghi": a["rest"], "khung_trung": a["hit"], "khung": fl}
    gdir = args.game_dir / args.name
    gdir.mkdir(parents=True, exist_ok=True)
    Image.fromarray(sheet).save(gdir / "sheet.png", optimize=True)
    js = json.dumps(meta, ensure_ascii=False, separators=(",", ":"))
    (gdir / "sheet.json").write_text(js + "\n", encoding="utf-8")
    buf = io.BytesIO()
    Image.fromarray(sheet).save(buf, "PNG", optimize=True)
    uri = "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("ascii")
    (gdir / "sheet.js").write_text(
        "// File do tools/sprite/gen_sprite.py tạo ra, đừng sửa tay. Gồm sheet.json và sheet.png gói lại để nhúng thẳng vào game.\n"
        "(function(){var G=window.G=window.G||{};(G.heroSheets=G.heroSheets||{})[%s]={json:%s,png:%s};})();\n"
        % (json.dumps(args.name), js, json.dumps(uri)), encoding="utf-8")

    print("5/5 Xuất ảnh xem trước và GIF...")
    Z = 6
    bgc, gnd = (52, 60, 56), (84, 96, 84)
    # bảng tất cả khung
    cells = []
    for a in anims:
        frs = [with_weapon(fr, a["weapon"], a["rest"]) for fr in a["out"]]
        bx = [crop_box(f) for f in frs]
        box = (min(b[0] for b in bx) - 2, min(b[1] for b in bx) - 2, max(b[2] for b in bx) + 2, max(max(b[3] for b in bx), SA.OY) + 3)
        cells.append((a, frs, box))
    tw = max(sum(1 for _ in a["out"]) * ((box[2] - box[0]) * Z + 8) for a, _, box in cells) + 20
    th = sum((box[3] - box[1]) * Z + 52 for _, _, box in cells) + 40
    big = Image.new("RGB", (max(tw, 760), th), (38, 34, 44))
    d = ImageDraw.Draw(big)
    text(d, (10, 8), "XEM TRƯỚC \"%s\": tất cả khung hình, phóng to %d lần, có gắn vũ khí mẫu (trong game sẽ thay bằng vũ khí thật)." % (args.name, Z), 15)
    yy = 36
    for a, frs, box in cells:
        cw, chh = (box[2] - box[0]) * Z, (box[3] - box[1]) * Z
        text(d, (10, yy), "%s  (%s, %d khung%s)" % (a["ten"], a["id"], len(frs), ", lặp" if a["loop"] else ""), 15, fill=(255, 210, 122))
        yy += 24
        gif = []
        for i, f in enumerate(frs):
            cell = Image.new("RGB", (cw, chh), bgc)
            cd = ImageDraw.Draw(cell)
            cd.rectangle([0, (SA.OY - box[1]) * Z, cw, chh], fill=gnd)
            sp = Image.fromarray(f[box[1]:box[3], box[0]:box[2]]).resize((cw, chh), Image.Resampling.NEAREST)
            cell.paste(sp, (0, 0), sp)
            gif.append(cell)
            big.paste(cell, (10 + i * (cw + 8), yy))
            lab = "%d · %dms%s" % (i + 1, a["out"][i]["ms"], " · TRÚNG" if a["hit"] == i else "")
            text(d, (12 + i * (cw + 8), yy + chh + 2), lab, 12, fill=(255, 150, 130) if a["hit"] == i else (200, 196, 184))
        yy += chh + 28
        durs = [fr["ms"] for fr in a["out"]]
        if not a["loop"]:
            durs[-1] += 500  # dừng một nhịp ở khung cuối cho dễ nhìn
        gif[0].save(out / (a["id"] + ".gif"), save_all=True, append_images=gif[1:], duration=durs, loop=0, disposal=2)
    big.crop((0, 0, big.width, yy + 6)).save(out / "xem-truoc.png")
    n = sum(len(a["out"]) for a in anims)
    print("XONG. %d động tác, %d khung hình." % (len(anims), n))
    print("  Cho game:   %s (sheet.png, sheet.json, sheet.js)" % gdir)
    print("  Để xem:     %s (xem-khop.png, xem-truoc.png, mỗi động tác một file GIF)" % out)


if __name__ == "__main__":
    main()
