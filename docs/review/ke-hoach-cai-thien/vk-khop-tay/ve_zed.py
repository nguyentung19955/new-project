#!/usr/bin/env python3
"""Dựng khung Zed + vũ khí y như game/js/zed_moi.js (không chạy trình duyệt) — để soát tĩnh việc ghép vũ khí vào tay.
Đọc thẳng game/art/custom/zed-<bộ>.sprite.json + zed-vk.sprite.json. Thứ tự lớp như game:
  vũ khí SAU (neo sau=1) → thân → vũ khí TRƯỚC → hàng nắm tay (hang_tay) đè lên cán
  → (biến thể nắm chuôi, vũ khí trước người) LỚP NGÓN zed-vk 'ngon' xoay cùng vũ khí ở tâm nắm tay (+ tay thứ hai nếu nằm trên cán).
16/10 (bao-cao-2.md): anh=True → NẮM TAY TỪ ẢNH (zed-vk 'nam_tay') thay lớp ngón tự vẽ như game (?ngonanh=0 → anh=False):
  thân → lớp SAU (lòng bàn tay) → vũ khí → [hàng nắm tay thân chỉ khi tay thứ hai lệch khỏi cán] → lớp TRƯỚC (ngón + ngón cái).
moi=True: dùng biến thể 'nam' của hàng (nắm chuôi, 15/10) nếu có; False: dữ liệu cũ (như ?namchuoi=0).
Phóng ×Z bằng NEAREST (thân, nắm tay) và lấy mẫu NEAREST khi xoay vũ khí ở độ phân giải ×Z (giống canvas nét cao)."""
import base64, io, json, math, os
import numpy as np
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../..'))
_c = {}


def tai(ma):
    if ma not in _c:
        d = json.load(open(os.path.join(ROOT, 'game/art/custom/%s.sprite.json' % ma), encoding='utf-8'))
        d['_img'] = Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',', 1)[1]))).convert('RGBA')
        _c[ma] = d
    return _c[ma]


def bien_the(da, moi, co=None):
    """Dữ liệu vẽ của hàng: (neo, hang_tay, vk_tl, vk_cam). co: dict cờ {'thuong2tay':..,'phitieuto':..}."""
    co = co or {}
    nm = da.get('nam')
    dung = moi and nm and not (da['vk'] == 'thuong' and co.get('thuong2tay') is False) and not (da['vk'] == 'phitieu' and co.get('phitieuto') is False)
    if dung:
        return nm['neo'], nm['hang_tay'], nm.get('vk_tl', da['vk_tl']), nm.get('vk_cam', da['vk_cam']), True
    return da['neo'], da['hang_tay'], da['vk_tl'], da['vk_cam'], False


def ve_vk(Z, V, loai, cap, n, ang, tl, cam, r=None, doc=0.0):
    """Lớp vũ khí ô (96·Z)² có lề: trả ảnh RGBA cùng hệ toạ độ ô 96 phóng Z, gốc tại (PAD, PAD).
    r: ô ảnh khác trên tấm zed-vk (lớp ngón); doc: dời dọc trục vũ khí (điểm ảnh ô 96) trước khi xoay."""
    r = r or V['vk'][loai][cap]
    a = V['_img'].crop((r[0], r[1], r[0] + r[2], r[1] + r[3]))
    A = np.array(a)
    W = (96 + 2 * PAD) * Z
    out = np.zeros((W, W, 4), np.uint8)
    k = 2 * tl * Z  # điểm ảnh ảnh vũ khí → điểm ảnh ra
    c, s = math.cos(math.radians(ang)), math.sin(math.radians(ang))
    yy, xx = np.mgrid[:W, :W].astype(float)
    X = (xx + 0.5) / Z - PAD - n[0]; Y = (yy + 0.5) / Z - PAD - n[1]  # toạ độ ô 96 quanh điểm cầm
    u = (c * X + s * Y - doc) * Z / k + cam[0]; v = (-s * X + c * Y) * Z / k + cam[1]
    ui, vi = np.floor(u).astype(int), np.floor(v).astype(int)
    ok = (ui >= 0) & (vi >= 0) & (ui < A.shape[1]) & (vi < A.shape[0])
    out[ok] = A[vi[ok], ui[ok]]
    return Image.fromarray(out)


PAD = 80


def goc_gan(a, b):
    return a + (((b - a) % 360) + 540) % 360 - 180


def nam_tay_cua(V, da, n, g, la_nam):
    """Như namTayCua (js/zed_moi.js): (i, d2 | None, het) hoặc None."""
    NT = V.get('nam_tay')
    D = NT and str(NT['co'].get(da['vk']))
    if not NT or D not in NT['sau'] or not la_nam or n[3] or not V.get('ngon') or da['vk'] not in V['ngon']:
        return None
    i = min(range(len(NT['goc'])), key=lambda k: abs(goc_gan(g, NT['goc'][k]) - g))
    d2, het = None, False
    if len(n) > 4 and n[4]:
        c, s = math.cos(math.radians(g)), math.sin(math.radians(g)); dx, dy = (n[4][0] - n[0]) / 2, (n[4][1] - n[1]) / 2
        if abs(-dx * s + dy * c) <= 1.5:
            d2 = dx * c + dy * s
        else:
            het = True
    return i, d2, het, D


def ve_nam_tay(Z, V, da, cap, n, g, nt, lop):
    """Như veNamTay: lớp 'sau' | 'truoc' ở tay cầm (+ tay thứ hai trên cán). Ảnh RGBA cùng hệ với ve_vk."""
    NT = V['nam_tay']; i, d2, het, D = nt; r = NT[lop][D][i]
    A = np.array(V['_img'].crop((r[0], r[1], r[0] + r[2], r[1] + r[3])))
    lech = V['ngon'][da['vk']][cap][4]; gA = math.radians(goc_gan(g, NT['goc'][i]))
    W = (96 + 2 * PAD) * Z
    out = np.zeros((W, W, 4), np.uint8)
    yy, xx = np.mgrid[:W, :W].astype(float)
    X = (xx + 0.5) / Z - PAD - n[0]; Y = (yy + 0.5) / Z - PAD - n[1]
    c, s = math.cos(math.radians(g)), math.sin(math.radians(g))
    lx, ly = c * X + s * Y, -s * X + c * Y          # hệ trục cán (ô 96)
    for d in [0.0] + ([d2] if d2 is not None else []):
        ax, ay = lx - 2 * d, ly - 2 * lech
        u = math.cos(gA) * ax - math.sin(gA) * ay + r[4]; v = math.sin(gA) * ax + math.cos(gA) * ay + r[5]
        ui, vi = np.floor(u).astype(int), np.floor(v).astype(int)
        ok = (ui >= 0) & (vi >= 0) & (ui < A.shape[1]) & (vi < A.shape[0])
        lp = np.zeros_like(out); lp[ok] = A[vi[ok], ui[ok]]
        o = Image.fromarray(out); o.alpha_composite(Image.fromarray(lp)); out = np.array(o)
    return Image.fromarray(out)


def khung(ten, i, cap=0, bo='zed-moi', moi=True, Z=3, co=None, ang=None, anh=True):
    """Ảnh RGBA ((96+2·PAD)·Z)² của khung i hàng ten (vd. 'dung_kiem', 'kiem_1')."""
    T, V = tai(bo), tai('zed-vk')
    da = T['dong_tac'][ten]
    W = (96 + 2 * PAD) * Z
    nen = Image.new('RGBA', (W, W), (0, 0, 0, 0))
    than = T['_img'].crop((i * 96, da['hang'] * 96, i * 96 + 96, da['hang'] * 96 + 96)).resize((96 * Z, 96 * Z), Image.NEAREST)
    if 'vk' not in da:
        nen.alpha_composite(than, (PAD * Z, PAD * Z)); return nen
    neo, ht, tl, cam, la_nam = bien_the(da, moi, co)
    n = neo[i]
    if not n:
        nen.alpha_composite(than, (PAD * Z, PAD * Z)); return nen
    g = n[2] if ang is None else ang
    vk = ve_vk(Z, V, da['vk'], cap, n, g, tl, cam[cap])
    nt = nam_tay_cua(V, da, n, g, la_nam) if anh else None
    if n[3]:
        nen.alpha_composite(vk)
    nen.alpha_composite(than, (PAD * Z, PAD * Z))
    if nt:
        nen.alpha_composite(ve_nam_tay(Z, V, da, cap, n, g, nt, 'sau'))
    if not n[3]:
        nen.alpha_composite(vk)
    if not nt or nt[2]:
        tay = T['_img'].crop((i * 96, ht * 96, i * 96 + 96, ht * 96 + 96)).resize((96 * Z, 96 * Z), Image.NEAREST)
        nen.alpha_composite(tay, (PAD * Z, PAD * Z))
    if nt:
        nen.alpha_composite(ve_nam_tay(Z, V, da, cap, n, g, nt, 'truoc'))
    elif la_nam and not n[3] and V.get('ngon'):
        for doc in ngon_doc(n, g):
            rn = V['ngon'][da['vk']][cap]
            nen.alpha_composite(ve_vk(Z, V, da['vk'], cap, n, g, 0.5, [rn[2] / 2, rn[3] / 2 - rn[4] * 2], r=rn[:4], doc=doc))
    return nen


def ngon_doc(n, g):
    """Vị trí (dọc trục, điểm ảnh ô 96 tính từ điểm cầm) các lớp ngón: tay cầm + tay thứ hai nếu còn nằm trên cán (lệch ≤ 3)."""
    ra = [0.0]
    if len(n) > 4 and n[4]:
        dx, dy = n[4][0] - n[0], n[4][1] - n[1]
        c, s = math.cos(math.radians(g)), math.sin(math.radians(g))
        if abs(-dx * s + dy * c) <= 3:
            ra.append(dx * c + dy * s)
    return ra
