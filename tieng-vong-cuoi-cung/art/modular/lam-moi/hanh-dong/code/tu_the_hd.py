"""MỐC TƯ THẾ hành động của Lam (đặt tay, không IK) – nguồn chỉnh sửa của mọi khung hành động.
Quy ước tham số: xem chung_hd.tu_the. Hướng lưỡi dao = vt + td (+ góc thân): 0 chĩa trước, −90 chĩa lên, +90 chĩa xuống.
Hộp đòn (HOP) = đúng ATK[n].box trong game/demo.html (px logic so với CHÂN, Lam nhìn phải) – dung_hd kiểm trùng game.
Biên độ mũ/chuông giữ trong tầm clip chạy (mũ ±1,25°, chuông ±3°). CHÓP MŨ ĐÃ BỎ (27/10/2026, rig: chop-mu hien = False) –
tham số chop= còn lại chỉ để bật lại chóp nếu cần, không ảnh hưởng hình."""
from chung_hd import tu_the

# (27/10/2026, chủ dự án duyệt "Sát tầm" + "Sửa"): ATK[1] rộng 147 → 91, ATK[6] 127 → 95 – mép trước hộp = mép mũi dao xa nhất
# đo trên rig lúc hộp bật (đòn 1: 92,2 px; đòn 6: 89,5 px) + 2 px dung sai, làm tròn lên → 95 / 92 px trước chân;
# ATK[3] cao 64 → 59 (đáy hộp đúng mặt đất, trước xuống dưới đất 5 px). Các hộp khác không đổi.
HOP_ATK = {1: [4, -97, 91, 48], 2: [-36, -100, 116, 48], 3: [-13, -59, 99, 59],
           4: [-26, -24, 64, 82], 5: [-9, -140, 97, 60], 6: [-3, -107, 95, 48]}
# vị trí tường khi bám (px logic so với chân): collider rộng 20 → mép = ±10
TUONG_X = 10


def tron(a, b, t):
    """nội suy tuyến tính hai tư thế (dịch + góc từng nút)"""
    out = {}
    for n in set(a) | set(b):
        pa, pb = a.get(n, {}), b.get(n, {})
        d = {}
        da, db = pa.get('dich', [0, 0]), pb.get('dich', [0, 0])
        d['dich'] = [da[0] + (db[0] - da[0]) * t, da[1] + (db[1] - da[1]) * t]
        d['goc'] = pa.get('goc', 0) + (pb.get('goc', 0) - pa.get('goc', 0)) * t
        out[n] = d
    return out


P = {}
P['nghi'] = tu_the()
# ----------------------------------------------------------------- CHÉM 1: ngang tới trước (ngực–đầu)
P['c1-chuanbi'] = tu_the(than=(-15, 18, -5), mu=(2, 0.8), chop=2, chuong=2, vt=40, td=90, vs=(30, 10), ts=-10,
                         ug=(110, 0, -6), ux=(-140, 0, 8))
P['c1-giuong'] = tu_the(than=(-35, 26, -9), mu=(3, 1.2), chop=3.5, chuong=3, vt=80, td=130, vs=(60, 0), vsg=-20, ts=-20,
                        ug=(100, 0, -8), ux=(-160, 0, 12))
P['c1-vung'] = tu_the(than=(25, 12, 6), mu=(-1, -0.8), chop=1, chuong=-1.5, vt=-45, td=20, vs=(-40, 5), ts=10,
                      ug=(170, 14, -14), ux=(-150, 0, 20))
P['c1-trung'] = tu_the(than=(55, 8, 8), mu=(-2, -1.25), chop=-2, chuong=-2.5, vt=-118, td=108, vs=(-110, -5), vsg=15, ts=15,
                       ug=(215, 0, -4), ux=(-150, 0, 26))
P['c1-trung2'] = tu_the(than=(58, 10, 9), mu=(-2, -1.25), chop=-3, chuong=-3, vt=-102, td=108, vs=(-115, -5), vsg=15, ts=15,
                        ug=(215, 0, -4), ux=(-150, 0, 26))
P['c1-thu'] = tu_the(than=(45, 18, 10), mu=(-1, -0.6), chop=-3.5, chuong=-2, vt=-40, td=100, vs=(-80, 5), vsg=8, ts=8,
                     ug=(205, 0, -4), ux=(-140, 0, 18))
P['c1-ve'] = tron(P['c1-thu'], P['nghi'], 0.55)
# ----------------------------------------------------------------- CHÉM 2: hất chéo lên (nối từ c1-thu)
P['c2-chuanbi'] = tu_the(than=(40, 30, 14), mu=(2, 1.0), chop=2, chuong=2.5, vt=-10, td=95, vs=(-60, 10), ts=10,
                         ug=(200, 0, -4), ux=(-150, 0, 18))
P['c2-giuong'] = tu_the(than=(45, 40, 18), mu=(3, 1.25), chop=3, chuong=3, vt=20, td=110, vs=(-30, 20), ts=0,
                        ug=(205, 0, -2), ux=(-160, 0, 22))
P['c2-vung'] = tu_the(than=(40, 10, 4), mu=(-1, -0.5), chop=0, chuong=-1, vt=-60, td=30, vs=(0, 0), ts=-10,
                      ug=(200, 0, -4), ux=(-150, 6, 26))
P['c2-trung'] = tu_the(than=(30, 10, -2), mu=(-2, -1.25), chop=-3, chuong=-3, vt=-105, td=75, vs=(40, -10), vsg=-20, ts=-15,
                       ug=(195, 0, -4), ux=(-140, 20, 34))
P['c2-trung2'] = tu_the(than=(30, 10, -2), mu=(-2, -1.25), chop=-3.5, chuong=-3, vt=-120, td=90, vs=(50, -10), vsg=-25, ts=-15,
                        ug=(195, 0, -4), ux=(-140, 20, 34))
P['c2-thu'] = tu_the(than=(20, 0, -4), mu=(-1, -0.6), chop=-2, chuong=-1.5, vt=-150, td=-10, vs=(30, 0), vsg=-10, ts=-5,
                     ug=(180, 0, -4), ux=(-140, 0, 20))
P['c2-ve'] = tron(P['c2-thu'], P['nghi'], 0.5)
# ----------------------------------------------------------------- CHÉM 3: bổ mạnh chéo xuống (nặng, thu tay dài)
P['c3-chuanbi'] = tu_the(than=(0, -10, -6), mu=(1, 0.8), chop=2, chuong=2, vt=-160, td=50, vs=(40, -20), vsg=-30, ts=-20,
                         ug=(150, 0, -6), ux=(-140, 0, 10))
P['c3-giuong'] = tu_the(than=(-20, -28, -12), mu=(2, 1.25), chop=3.5, chuong=3, vt=170, td=70, vs=(60, -30), vsg=-40, ts=-25,
                        ug=(140, 18, -10), ux=(-150, 0, 14))
P['c3-vung'] = tu_the(than=(40, 10, 14), mu=(-1, -0.8), chop=0, chuong=-1.5, vt=-60, td=-10, vs=(-50, 0), ts=10,
                      ug=(220, 20, -16), ux=(-160, 0, 26))
P['c3-trung'] = tu_the(than=(75, 70, 24), mu=(-2, -1.25), chop=-3, chuong=-3, vt=-63, td=84, vs=(-120, 10), vsg=20, ts=20,
                       ug=(250, 0, -2), ux=(-180, 0, 34))
P['c3-trung2'] = tu_the(than=(78, 76, 25), mu=(-2, -1.25), chop=-3.5, chuong=-3, vt=-60, td=80, vs=(-125, 12), vsg=20, ts=20,
                        ug=(250, 0, -2), ux=(-180, 0, 34))
P['c3-thu'] = tu_the(than=(70, 60, 20), mu=(1, 0.6), chop=1, chuong=1.5, vt=-28, td=85, vs=(-100, 12), vsg=15, ts=15,
                     ug=(245, 0, -2), ux=(-175, 0, 30))
P['c3-ve'] = tron(P['c3-thu'], P['nghi'], 0.5)
# ----------------------------------------------------------------- CHÉM HẤT (5): chém thẳng lên đầu
P['c5-chuanbi'] = tu_the(than=(5, 40, 10), mu=(2, 1.0), chop=2, chuong=2.5, vt=20, td=80, vs=(-20, 15), ts=10,
                         ug=(150, 0, -4), ux=(-150, 0, 10))
P['c5-giuong'] = tu_the(than=(0, 55, 14), mu=(3, 1.25), chop=3, chuong=3, vt=35, td=100, vs=(-10, 25), ts=0,
                        ug=(150, 0, -2), ux=(-150, 0, 12))
P['c5-vung'] = tu_the(than=(10, -10, 0), mu=(-1, -0.6), chop=0, chuong=-1, vt=-80, td=10, vs=(10, -10), vsg=-15, ts=-10,
                      ug=(150, 10, -6), ux=(-140, 24, 30))
P['c5-trung'] = tu_the(than=(15, -45, -6), mu=(-2, -1.25), chop=-3, chuong=-3, vt=-150, td=55, vs=(40, -40), vsg=-40, ts=-25,
                       ug=(140, 18, 10), ux=(-130, 40, 40))
P['c5-trung2'] = tu_the(than=(12, -48, -8), mu=(-2, -1.25), chop=-3.5, chuong=-3, vt=-165, td=60, vs=(45, -40), vsg=-45, ts=-25,
                        ug=(140, 18, 10), ux=(-130, 40, 40))
P['c5-thu'] = tu_the(than=(10, -10, -4), mu=(1, 0.6), chop=1, chuong=1, vt=-165, td=10, vs=(30, -10), vsg=-15, ts=-10,
                     ug=(145, 0, -4), ux=(-140, 0, 14))
P['c5-ve'] = tron(P['c5-thu'], P['nghi'], 0.5)
# ----------------------------------------------------------------- CHÉM TRÊN KHÔNG (6): ngang, chân co
CHAN_KHONG = dict(ug=(90, 70, -12), ux=(-90, 95, 30))
P['c6-giuong'] = tu_the(than=(-25, -10, -8), mu=(3, 1.2), chop=3.5, chuong=3, vt=80, td=130, vs=(60, -10), vsg=-20, ts=-20,
                        **CHAN_KHONG)
P['c6-vung'] = tu_the(than=(20, -10, 6), mu=(-1, -0.8), chop=1, chuong=-1.5, vt=-50, td=20, vs=(-40, 0), ts=10,
                      ug=(120, 60, -18), ux=(-110, 90, 34))
P['c6-trung'] = tu_the(than=(45, -20, 6), mu=(-2, -1.25), chop=-2, chuong=-2.5, vt=-128, td=112, vs=(-110, -10), vsg=15, ts=15,
                       ug=(140, 55, -20), ux=(-130, 85, 40))
P['c6-trung2'] = tu_the(than=(48, -20, 7), mu=(-2, -1.25), chop=-3, chuong=-3, vt=-112, td=112, vs=(-115, -10), vsg=15, ts=15,
                        ug=(140, 55, -20), ux=(-130, 85, 40))
P['c6-thu'] = tu_the(than=(35, -10, 10), mu=(-1, -0.6), chop=-3.5, chuong=-2, vt=-45, td=100, vs=(-80, 0), vsg=8, ts=8,
                     ug=(120, 60, -14), ux=(-110, 85, 30))
# ----------------------------------------------------------------- CHÉM NẢY (4): đâm dao thẳng xuống dưới chân
P['c4-dam'] = tu_the(than=(-5, 90, 2), mu=(-1, -0.8), chop=-2, chuong=-2, vt=10, td=78, vs=(30, -30), vsg=-30, ts=-20,
                     ug=(110, 20, -10), ux=(-120, 45, 20))
P['c4-giu'] = tu_the(than=(-10, 150, 0), mu=(-2, -1.25), chop=-3, chuong=-3, vt=15, td=75, vs=(40, -40), vsg=-40, ts=-25,
                     ug=(120, -30, -12), ux=(-130, -10, 22))
P['c4-thu'] = tu_the(than=(0, 10, 2), mu=(1, 0.6), chop=2, chuong=2, vt=-20, td=60, vs=(20, -10), vsg=-15, ts=-10,
                     ug=(110, 60, -8), ux=(-100, 80, 18))
# ----------------------------------------------------------------- BỊ ĐÁNH (game: vx = ±4,8, vy = −6 → bật khỏi đất)
# 'bd' = bị đẩy LÙI (lực ngược hướng nhìn): ngửa ra sau, tay dao văng lên sau; 'bdt' = bị đẩy TỚI (đánh từ sau lưng): chúi tới
P['bd-1'] = tu_the(than=(-55, -5, -20), mu=(3, 1.25), chop=3.5, chuong=3, vt=125, td=-70, vs=(80, -40), vsg=-45, ts=-30,
                   ug=(170, 70, -30), ux=(-70, 40, 10))
P['bd-2'] = tu_the(than=(-40, 5, -14), mu=(2, 1.0), chop=3, chuong=2.5, vt=80, td=-50, vs=(60, -25), vsg=-30, ts=-20,
                   ug=(150, 50, -20), ux=(-90, 30, 10))
P['bd-3'] = tu_the(than=(-15, 15, -5), mu=(1, 0.4), chop=1, chuong=1, vt=25, td=-15, vs=(20, 0), ts=-8,
                   ug=(130, 15, -8), ux=(-120, 8, 8))
P['bdt-1'] = tu_the(than=(45, 10, 24), mu=(-3, -1.25), chop=-3.5, chuong=-3, vt=110, td=-60, vs=(-120, -40), vsg=35, ts=20,
                    ug=(160, 50, -10), ux=(-200, 70, 50))
P['bdt-2'] = tu_the(than=(30, 10, 16), mu=(-2, -1.0), chop=-3, chuong=-2.5, vt=70, td=-40, vs=(-95, -20), vsg=25, ts=15,
                    ug=(150, 35, -8), ux=(-170, 45, 35))
P['bdt-3'] = tu_the(than=(10, 12, 6), mu=(-1, -0.4), chop=-1, chuong=-1, vt=25, td=-12, vs=(-40, 0), ts=8,
                    ug=(130, 12, -6), ux=(-130, 10, 12))
# ----------------------------------------------------------------- NHẢY / ĐỈNH / RƠI / TIẾP ĐẤT (chọn theo vy của game)
P['nhay-bat'] = tu_the(than=(10, -30, 8), mu=(2, 1.0), chop=2, chuong=2, vt=20, td=-15, vs=(-70, 10), ts=12,
                       ug=(110, 60, -20), ux=(-90, 0, 55))
P['nhay-len'] = tu_the(than=(5, -20, 5), mu=(1, 0.8), chop=3, chuong=2.5, vt=-60, td=30, vs=(-100, 10), vsg=15, ts=15,
                       ug=(120, 150, -30), ux=(-100, 45, 50))
P['nhay-dinh'] = tu_the(than=(0, -25, 2), mu=(0, 0), chop=1, chuong=0, vt=-30, td=20, vs=(-50, -20), vsg=-5, ts=0,
                        ug=(95, 150, -12), ux=(-60, 130, 30))
P['roi'] = tu_the(than=(0, -20, -2), mu=(-1, -0.6), chop=-2, chuong=-1.5, vt=-80, td=40, vs=(20, -70), vsg=-35, ts=-15,
                  ug=(80, 55, 12), ux=(-90, 85, 30))
P['roi-nhanh'] = tu_the(than=(0, -30, -4), mu=(-2, -1.25), chop=-3.5, chuong=-3, vt=-135, td=60, vs=(50, -120), vsg=-70, ts=-25,
                        ug=(70, 25, 18), ux=(-80, 50, 30))
P['tiep-dat-1'] = tu_the(than=(5, 85, 12), mu=(3, 1.25), chop=3.5, chuong=3, vt=30, td=-25, vs=(-30, 30), vsg=10, ts=10,
                         ug=(170, 0, 0), ux=(-170, 0, 4))
P['tiep-dat-2'] = tu_the(than=(3, 40, 6), mu=(1, 0.6), chop=2, chuong=1.5, vt=15, td=-12, vs=(-15, 15), ts=5,
                         ug=(145, 0, -2), ux=(-145, 0, 6))
# nhảy tường: đạp tường (tường ở SAU lưng lúc bật đi), chân sau duỗi về phía tường. (27/10) Dời cả người X = +126 cho
# khớp tư thế trượt tường quay lưng: bước vẽ đầu tiên collider đã rời tường 5,4 px → mép tường ở −15,4 px logic: đế ủng
# xa chạm đúng −15, tay sau áp tường (−14,6) – không còn tay/mũ lấn vào tường như bản cũ.
P['nhay-tuong'] = tu_the(than=(30, -20, 16), mu=(-1, -0.8), chop=-3, chuong=-2.5, vt=-70, td=40, vs=(151.1, -20), vsg=25, ts=12,
                         ug=(130, 110, -25), ux=(-240, 50, 65), X=126.2)
# ----------------------------------------------------------------- LƯỚT (dash) 88 px / 8 bước
P['luot-1'] = tu_the(than=(25, 40, 22), mu=(-1, -0.8), chop=-2, chuong=-2, vt=-10, td=20, vs=(-100, 10), vsg=30, ts=15,
                     ug=(150, 10, -12), ux=(-180, 30, 50))
P['luot-2'] = tu_the(than=(55, 35, 30), mu=(-2, -1.25), chop=-3.5, chuong=-3, vt=-35, td=40, vs=(-150, 10), vsg=45, ts=25,
                     ug=(160, 40, -30), ux=(-260, 60, 70))
P['luot-3'] = tu_the(than=(20, 30, 10), mu=(1, 0.6), chop=2, chuong=2, vt=-5, td=10, vs=(-70, 10), vsg=12, ts=8,
                     ug=(200, 0, -14), ux=(-160, 15, 35))
# ----------------------------------------------------------------- BÁM / TRƯỢT TƯỜNG
# (27/10, chủ dự án duyệt) Lam QUAY LƯNG vào tường, MẶT HƯỚNG RA ngoài (game: pl.face = −wallDir). Tường ở phía SAU (−x),
# mép tường x = −10 px logic (collider 20 px). Không còn chóp → lưng mũ áp sát tường: X tính sao cho mép sau mũ = −10 đúng;
# tay sau áp lên tường, gót ủng xa chạm tường (vs/ux chỉnh cho mép = −9,7). Thân nghiêng tới nhẹ (+3–4°) cho người khỏi dạt ra
# xa: giữa thân cách giữa collider ~+19 px (đầu chibi rộng 68 px, chỉ còn cách này). Hiệu ứng truot-tuong đặt ở chỗ gót ủng
# chạm tường (anim_hd.HIEU_UNG.truot_tuong). Số X/vs/ux đo bằng render (xem GHI-CHU kiem-thu-chem-nhay-v2).
P['bam-tuong'] = tu_the(than=(0, 10, 4), mu=(1, -0.6), chop=0, chuong=1, vt=10, td=-30, vs=(7.2, -25), vsg=-15, ts=-60,
                        ug=(130, 60, -10), ux=(-156.7, 50, -30), X=196.2)
P['truot-1'] = tu_the(than=(0, 18, 3), mu=(-1, -0.9), chop=0, chuong=-1, vt=20, td=-35, vs=(-36.8, -45), vsg=-25, ts=-70,
                      ug=(135, 50, -6), ux=(-152.9, 34, -36), X=201.0)
P['truot-2'] = tu_the(than=(0, 22, 3), mu=(-1, -1.2), chop=0, chuong=-2, vt=24, td=-38, vs=(-58.7, -55), vsg=-30, ts=-72,
                      ug=(138, 44, -4), ux=(-149.0, 26, -38), X=201.0)

# ----------------------------------------------------------------- ĐỨNG THỞ (lặp) + RÚT DAO (52 bước đầu ải) – 27/10/2026
# Thở: 8 khung, khung 0 = ĐÚNG dáng nghỉ (vào đứng từ chạy không lóe); thân nhô lên/xuống 12 px thế giới (~1,25 px logic),
# mũ nhích theo + gật rất nhẹ, chuông đung đưa trễ pha, tay dao nhấc 2°. Ủng đứng yên (không trượt).
import math
THO_SO_KHUNG = 8
for i in range(THO_SO_KHUNG):
    ph = 2 * math.pi * i / THO_SO_KHUNG
    hit = (1 - math.cos(ph)) / 2                    # 0 → 1 → 0 (hít vào ở giữa chu kỳ)
    tre = (1 - math.cos(ph - 0.9)) / 2 - (1 - math.cos(-0.9)) / 2   # chuông trễ pha, khung 0 = 0
    P['tho-%d' % i] = tu_the(than=(0, -12 * hit, -0.6 * hit), mu=(-3 * hit, -0.5 * hit), chuong=1.5 * tre,
                             vt=-2.5 * hit, td=1.0 * hit, vs=(0, -4 * hit), ts=-2 * hit)
# Rút dao: lúc vào ải dao cầm NGƯỢC trước ngực (lưỡi chĩa xuống) → hít vào, hạ tay → khuỵu lấy đà, tay xuống thấp trước
# bụng → hất tay lên trước, lưỡi lật một vòng qua phía trước lên thẳng đứng → giơ cao → hạ dao chào (lưỡi dựng trước mặt)
# → hạ về thế thủ = dáng nghỉ (khung cuối = đúng dáng nghỉ → sang đứng thở không lóe). Tay dao luôn ở phía TRƯỚC người
# (tay trước vẽ trên cùng nên không cho vòng ra sau lưng – vắt qua mặt). Chân giữ đúng chỗ dáng nghỉ (không trượt đế).
P['rd-giau'] = tu_the(than=(-5, 14, -3), mu=(3, 1.0), chuong=1, vt=55, td=45, vs=(20, 0), ts=-6)
P['rd-hit'] = tu_the(than=(-6, 2, -4), mu=(1, 0.6), chuong=2, vt=30, td=60, vs=(25, -10), vsg=-8, ts=-8)
P['rd-lay-da'] = tu_the(than=(10, 22, 6), mu=(3, 1.2), chuong=2.5, vt=-10, td=100, vs=(-20, 10), vsg=8, ts=6)
P['rd-hat'] = tu_the(than=(4, -12, 1), mu=(-1, -0.5), chuong=-1, vt=-70, td=10, vs=(-30, -15), vsg=10, ts=8)
P['rd-gio'] = tu_the(than=(0, -16, -1), mu=(-2, -1.0), chuong=-2.5, vt=-120, td=30, vs=(-20, -25), vsg=-5, ts=-6)
P['rd-chao'] = tu_the(than=(6, 0, 2), mu=(-1, -0.6), chuong=-2, vt=-42, td=-50, vs=(-20, 0), vsg=5, ts=5)
P['rd-chao2'] = tu_the(than=(5, -4, 1.5), mu=(-1, -0.5), chuong=1.5, vt=-40, td=-52, vs=(-18, -2), vsg=5, ts=5)
P['rd-ha'] = tu_the(than=(2, 4, 1), mu=(0.5, 0.2), chuong=1, vt=-15, td=-20, vs=(-6, 0), ts=2)

POSE = P
HOP = {}
for k in P:
    if k[0] == 'c' and k[1].isdigit():
        HOP[k] = HOP_ATK[int(k[1])]
