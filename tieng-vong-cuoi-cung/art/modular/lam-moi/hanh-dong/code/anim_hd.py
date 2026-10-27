"""BẢNG TRẠNG THÁI GAMEPLAY → KHUNG HÌNH (đọc từ game/demo.html, KHÔNG đổi gameplay).
Mọi số tick dưới đây lấy từ demo.html và được dung_hd.py KIỂM LẠI bằng cách đọc chính file demo.html (ATK, P) – lệch thì dừng.

Đòn đánh (ATK[n] = su chuẩn bị+vung, ac khung CHẠM (hộp đòn bật), re thu tay; số bước logic 60 Hz):
  game: startAtk đặt atkT = 0 rồi cuối updatePlayer atkT++ → bước đầu tiên VẼ với atkT = 1. Hộp đòn bật khi su ≤ atkT < su+ac.
  Đòn kết thúc khi atkT ≥ su+ac+re (bước đó đã về trạng thái khác) → các atkT được vẽ: 1 … su+ac+re−1.
  ⇒ khung TRÚNG (dao duỗi hết, nằm trong hộp đòn) bắt đầu ĐÚNG atkT = su (riêng chém nảy su = 0 → từ atkT 1).
Combo dưới đất 1 → 2 → 3: bấm chém lại khi atkT ≥ su+ac (đang thu tay) → đòn sau bắt đầu ngay, nên khung đầu của đòn sau
  nối từ tư thế thu tay của đòn trước.
Mỗi đòn: danh sách (tên tư thế, số bước) theo đúng thứ tự atkT = 1, 2, 3 …; tổng = su+ac+re−1."""

ATK = {1: dict(su=11, ac=8, re=8), 2: dict(su=11, ac=8, re=8), 3: dict(su=11, ac=8, re=16),
       4: dict(su=0, ac=11, re=4), 5: dict(su=11, ac=8, re=8), 6: dict(su=9, ac=8, re=4)}
P_GAME = dict(dashFrames=8, dashSpeed=11, dashIFrames=11, wallStick=6, wallSlideMax=1.6, wallJumpLock=9, hurtIFrames=60,
              runSpeed=4.4, gravity=0.64, maxFall=10.4, jumpHeight=112)

DON = {
    # tên anim game: (đòn, [(tư thế, số bước)…])  – 'A~B' = tư thế xen giữa A và B (nội suy 50 %)
    'atk1': (1, [('nghi~c1-chuanbi', 2), ('c1-chuanbi', 3), ('c1-giuong', 3), ('c1-giuong~c1-vung', 1), ('c1-vung', 1),
                 ('c1-trung', 3), ('c1-trung2', 5), ('c1-thu', 3), ('c1-ve', 5)]),
    'atk2': (2, [('c2-chuanbi', 3), ('c2-giuong', 5), ('c2-giuong~c2-vung', 1), ('c2-vung', 1),
                 ('c2-trung', 3), ('c2-trung2', 5), ('c2-thu', 3), ('c2-ve', 5)]),
    'atk3': (3, [('c3-chuanbi', 3), ('c3-giuong', 5), ('c3-giuong~c3-vung', 1), ('c3-vung', 1),
                 ('c3-trung', 3), ('c3-trung2', 5), ('c3-thu', 8), ('c3-ve', 8)]),
    'atk4': (4, [('c4-dam', 1), ('c4-giu', 9), ('c4-thu', 4)]),
    'atk5': (5, [('nghi~c5-chuanbi', 2), ('c5-chuanbi', 3), ('c5-giuong', 3), ('c5-giuong~c5-vung', 1), ('c5-vung', 1),
                 ('c5-trung', 3), ('c5-trung2', 5), ('c5-thu', 3), ('c5-ve', 5)]),
    'atk6': (6, [('c6-giuong', 5), ('c6-giuong~c6-vung', 1), ('c6-vung', 2),
                 ('c6-trung', 3), ('c6-trung2', 5), ('c6-thu', 4)]),
}
# Vệt chém (ảnh gen vet-chem): kiểu, tâm (px logic so với chân, nhìn phải), góc xoay (độ), tỉ lệ, lật dọc,
# thời điểm: khung 0 hiện ở atkT = su−1 (đang vung), khung 1 ĐÚNG atkT = su (hộp đòn bật) … khung 3 mờ dần.
VET = {
    # (27/10) đòn 1, 3, 6: hộp đòn thu về sát tầm dao → vệt chém thu nhỏ + dời về: mép trước vệt ≈ mép trước hộp đòn mới
    'atk1': dict(kieu='ngang', x=58, y=-66, goc=0, k=0.5, lat_doc=False, bat_dau=10, buoc=[1, 3, 3, 4]),
    'atk2': dict(kieu='cheo-len', x=54, y=-86, goc=-10, k=0.5, lat_doc=False, bat_dau=10, buoc=[1, 3, 3, 4]),
    'atk3': dict(kieu='cheo-xuong', x=48, y=-35, goc=0, k=0.52, lat_doc=False, bat_dau=10, buoc=[1, 3, 4, 5]),
    'atk4': dict(kieu='cheo-xuong', x=24, y=22, goc=30, k=0.42, lat_doc=False, bat_dau=1, buoc=[1, 3, 3, 4]),
    'atk5': dict(kieu='cheo-len', x=26, y=-104, goc=-30, k=0.5, lat_doc=False, bat_dau=10, buoc=[1, 3, 3, 4]),
    'atk6': dict(kieu='ngang', x=55, y=-78, goc=0, k=0.5, lat_doc=False, bat_dau=8, buoc=[1, 3, 3, 4]),
}

# Trạng thái không phải đòn đánh: các tư thế dùng (game chọn khung theo biến gameplay, xem demo.html lamChon)
KHAC = {
    'hurt':  ['bd-1', 'bd-2', 'bd-3'],            # hurtT 17–13 / 12–7 / 6–1 (bị đẩy lùi)
    'hurtt': ['bdt-1', 'bdt-2', 'bdt-3'],         # như trên, bị đẩy TỚI (đòn từ sau lưng)
    'jump':  ['nhay-bat', 'nhay-len', 'nhay-dinh'],
    'fall':  ['roi', 'roi-nhanh'],
    'land':  ['tiep-dat-1', 'tiep-dat-2'],        # landT 10–8 / 7–5 (chỉ khi rơi vy > 5, đúng như game)
    'walljump': ['nhay-tuong'],                   # wjT 16–11 (6 bước đầu sau khi đạp tường)
    'dash':  ['luot-1', 'luot-2', 'luot-3'],      # bước lướt 1 / 2–6 / 7–8
    'wall':  ['bam-tuong', 'truot-1', 'truot-2'], # bám (wallStickT < 6, vy = 0) / trượt xen kẽ theo quãng trượt – QUAY LƯNG vào tường
    'tho':   ['tho-%d' % i for i in range(8)],
    # CHẾT (27/10): 0 trúng (deadT 0 = 6 bước hitstop, dao còn trong tay) · 1 bay lên (vy < 1) · 2 bay xuống · sau khi chạm đất
    # (t = deadT − bước chạm đất): 3 chạm (t 0–2) · 4 nảy nhẹ (t 3–6) · 5 lắng (t 7–9) · 6 nằm yên (t ≥ 10, tới deadT 104)
    'chet':  ['chet-trung', 'chet-bay-1', 'chet-bay-2', 'chet-cham', 'chet-nay', 'chet-nay~chet-nam', 'chet-nam'],
    'chett': ['chett-trung', 'chett-bay-1', 'chett-bay-2', 'chett-cham', 'chett-nay', 'chett-nay~chett-nam', 'chett-nam'],    # đứng thở (lặp): khung = floor(số bước đứng yên / THO_BUOC) mod 8; khung 0 = dáng nghỉ
}
# Chết: ngưỡng chọn khung (bước logic) + dao văng (chỉ để VẼ, không ảnh hưởng gameplay). Vận tốc dao px logic / bước, Lam nhìn
# phải, lực đẩy về −x ('chet') → game nhân dấu theo hướng ngã. Trọng lực dao 0,7; chạm đất nảy 30 %, quay chậm dần, nằm ngang.
CHET = dict(vy_bay_len=1, cham=3, nay=7, lang=10, mo_tu=56, mo_het=80, hoi_sinh=104,
            dao=dict(vx=-2.4, vy=-4.0, xoay=-22, trong_luc=0.7, nay=0.3, ma_sat=0.6))
THO_BUOC = 14                                     # 8 khung × 14 bước = 112 bước = 1,87 s mỗi nhịp thở
# Rút dao: 52 bước đầu ải (game RUT_T = 52, dung_hd kiểm). Mục i = RUT_T − drawT (0 … 51) → tư thế.
RUT_T = 52
_RD = [('rd-giau', 8), ('rd-giau~rd-hit', 3), ('rd-hit', 5), ('rd-hit~rd-lay-da', 2), ('rd-lay-da', 6),
       ('rd-lay-da~rd-hat', 2), ('rd-hat', 2), ('rd-hat~rd-gio', 1), ('rd-gio', 5), ('rd-gio~rd-chao', 2), ('rd-chao', 4),
       ('rd-chao2', 5), ('rd-chao2~rd-ha', 2), ('rd-ha', 2), ('rd-ha~nghi', 2), ('nghi', 1)]
KHAC['rutdao'] = [p for p, b in _RD for _ in range(b)]
assert len(KHAC['rutdao']) == RUT_T

# Hiệu ứng ẢNH GEN (art/hieu-ung/sprite/*-2x.*): chỉ đặt vị trí / hướng / thời điểm / mờ dần. Toạ độ px logic so với CHÂN,
# Lam nhìn phải (quay trái → lật x). buoc = số bước logic mỗi khung ảnh; k = tỉ lệ so với cỡ trong sheet hiệu ứng.
HIEU_UNG = {
    'bui_nhay':      dict(anh='bui', anim='nho', x=0, y=0, k=0.9, buoc=[2, 3, 3, 3, 4]),        # bật nhảy
    'bui_tiep_dat':  dict(anh='bui', anim='nho', x=0, y=0, k=1.0, buoc=[2, 3, 3, 3, 4]),        # tiếp đất thường
    'bui_roi_cao':   dict(anh='bui', anim='to', x=0, y=0, k=0.9, buoc=[2, 3, 4, 4, 5],
                          roi_cao_px=150),                                                     # rơi ≥ 150 px logic
    'bui_buoc':      dict(anh='bui', anim='nho', x=-14, y=0, k=0.55, buoc=[2, 2, 3, 3, 3]),     # bước tới khi chém / chân chạy
    'bui_luot':      dict(anh='bui', anim='nho', x=-18, y=0, k=0.85, buoc=[2, 2, 3, 3, 3]),     # bắt đầu lướt (sau lưng)
    'bui_tuong':     dict(anh='bui', anim='nho', x=0, y=-24, k=0.75, goc=-90, buoc=[2, 2, 3, 3, 3]),  # đạp tường (xoay vào tường)
    'dash':          dict(anh='dash', anim='dash', x=-46, y=-46, k=0.85, buoc=[2, 2, 2, 2, 3], bam_nguoi=8),  # bám người 8 bước lướt
    'truot_tuong':   dict(anh='truot-tuong', anim='truot-tuong', x=9, y=-14, k=0.8, buoc=[3, 3, 3, 3, 3],
                          moi_px_truot=14, troi=0.5, toi_da=3),   # theo QUÃNG trượt; (27/10) chỗ gót ủng chạm tường (x = phía tường)
    'lam_bi_danh':   dict(anh='lam-bi-danh', anim='lam-bi-danh', x=4, y=-56, k=0.85, buoc=[2, 3, 3, 4]),
    'trung_don':     dict(anh='trung-don', anim='trung-don', k=0.85, buoc=[2, 2, 3, 3, 4]),     # tại điểm chạm (giữa phần giao)
    # (27/10) 3 ảnh gen mới: Vọng (bấm ghi / bóng bắt đầu phát, quanh chuông), Cộng hưởng (tâm mục tiêu), keng (vỏ cứng)
    'vong':          dict(anh='vong', anim='vong', x=12, y=-46, k=0.9, buoc=[3, 3, 4, 4, 6], bam_nguoi=20),
    'vong_bong':     dict(anh='vong', anim='vong', x=12, y=-46, k=0.75, buoc=[3, 3, 4, 4, 6], bam_nguoi=20, al=0.85),
    'cong_huong':    dict(anh='cong-huong', anim='cong-huong', k=1.0, buoc=[2, 3, 4, 5, 6]),   # lần đầu k 1,3
    'keng':          dict(anh='keng', anim='keng', k=1.0, buoc=[2, 3, 3, 4]),                  # tại điểm chạm
    'bong_mo':       dict(moi_buoc=2, song=12, alpha=0.5),                                     # bóng mờ lướt = chính sprite Lam
    'gioi_han_dong_thoi': 16,
}
