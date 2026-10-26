"""Mốc đặt tay cho 5 clip của QUÁI CHUÔNG GỖ (đơn vị: ms, px logic, độ). Xem dong_tac.py để biết nghĩa từng
thuộc tính. Quái quay mặt sang TRÁI: phía trước = −x. y âm = lên trên.

Nhịp lấy từ gameplay game/demo.html (60 tick/s):
- đi tuần: tốc độ 0,9 px/tick = 54 px logic/s (updateQuai 'walk').
- đấm: 'wind' 30 tick (500 ms) → 'strike' 16 tick (267 ms; lao tới 3,6 px/tick ở tick 0–5; hitbox bật tick 5–10)
  → 'rec' 26 tick (433 ms). Tổng 1200 ms. Khung chạm = khung có t trong [583,3 ; 683,3] ms.
- trúng đòn: 'hit' 16 tick = 267 ms.
- chết: game bắn mảnh vỡ ngay (killQuai), nằm 2 s rồi mờ 1 s (q.fade – game tự làm). Clip chết 1000 ms, giữ khung cuối.
Hitbox lấy từ gameplay: thân 72×108 (QW, QH), hộp đấm QHB = {dx −90, dy −81, w 66, h 37} so với chân."""

TICK = 1000 / 60
BUOC = 2 * TICK                   # 33,33 ms/khung = 2 tick (30 hình/s)
V_DI = 0.9 * 60 / 1000            # px logic / ms
HITBOX_THAN = {'w': 72, 'h': 108, 'ghi_chu': 'QW×QH, giữa đáy = điểm neo'}
HOP_DAM = {'dx': -90, 'dy': -81, 'w': 66, 'h': 37, 'ghi_chu': 'QHB: so với chân (điểm neo), quái nhìn trái'}


def tao(C):
    tt = C.nghi('tay-truoc')
    ts = C.nghi('tay-sau')
    clips = {}

    # ------------------------------------------------------------------ đứng (thở nhẹ), lặp 1,6 s
    clips['dung'] = {
        'ms': 1600, 'buoc_ms': 4 * TICK, 'lap': True,
        'pha': [('hit-vao', 0, 800), ('tho-ra', 800, 1600)],
        'ghi_chu': 'thân co giãn nhẹ quanh đáy (đáy đứng yên, chân không động); hai nắm tay nổi lên xuống lệch pha; '
                   'quả lắc đưa nhẹ. 66,7 ms/khung (thở chậm, đủ mượt, sheet nhẹ hơn).',
        'kenh': {
            'than': {'sy': [(0, 1.0), (800, 0.982)], 'sx': [(0, 1.0), (800, 1.008)]},
            # mọi kênh qua đúng dáng nghỉ ở t = 0 (và 800) → chuyển sang clip khác từ khung 0 không giật
            'tay-truoc': {'X': [(400, tt[0] - 0.8), (1200, tt[0] + 0.8)], 'Y': [(400, tt[1] - 1.5), (1200, tt[1] + 1.5)]},
            'tay-sau': {'X': [(400, ts[0] + 0.8), (1200, ts[0] - 0.8)], 'Y': [(1200, ts[1] - 1.5), (400, ts[1] + 1.5)]},
            'qua-lac': {'lac': [(400, 3.0), (1200, -3.0)]},
        }}

    # ------------------------------------------------------------------ đi tuần, lặp 0,6 s (2 bước)
    T, duty, d = 600.0, 0.55, 40.0
    Ts = T * duty
    S = V_DI * Ts                                  # sải: điểm chạm trôi đúng tốc độ đất khi chịu lực
    xa0 = C.khe('chan-xa')                         # chân xa đứng cao hơn 1,3 px (chiều sâu 3/4) – giữ khi chạm đất

    def chan(pha, khe0):
        def tm(t):
            return (t + pha) % T
        return {
            # chịu lực: x tăng tuyến tính đúng V_DI (quái đi sang trái → đất trôi sang PHẢI trong khung sprite)
            'x': [(tm(0), -S / 2, V_DI), (tm(Ts), S / 2, V_DI),
                  (tm(Ts + d), S / 2 + V_DI * d / 2), (tm(T - d), -S / 2 - V_DI * d / 2)],
            'nhac': [(tm(0), khe0), (tm(Ts), khe0), (tm(Ts + 0.45 * (T - Ts)), khe0 + 5.0)],
            'goc': [(tm(0), 0.0), (tm(Ts), 0.0), (tm(Ts + 60), -14.0), (tm(Ts + 160), 1.0), (tm(T - 30), 7.0)],
        }
    clips['di'] = {
        'ms': T, 'buoc_ms': BUOC, 'lap': True,
        'toc_do_dat_px_logic_moi_s': V_DI * 1000,
        'pha': [('chan-gan-cham-dat', 0, Ts), ('chan-xa-cham-dat', T / 2, T / 2 + Ts)],
        'chiu_luc': {'chan-gan': [0, Ts], 'chan-xa': [T / 2, (T / 2 + Ts) % T]},
        'ghi_chu': f'2 bước/0,6 s; mỗi chân chịu lực {Ts:.0f} ms (55 %), sải {S:.2f} px logic; khi chịu lực đế phẳng '
                   'và giữa đế trôi sang phải đúng 54 px logic/s → game dời quái sang trái 0,9 px/tick thì chân '
                   'đứng yên trên đất. Thân nhún 2 lần/chu kỳ, chúi trước ~3°, lắc ±1°; tay đánh ngược nhịp.',
        'kenh': {
            'chan-gan': chan(0.0, 0.0),
            'chan-xa': chan(T / 2, xa0),
            'than': {'y': [(0, 0.0), (150, -1.8), (300, 0.0), (450, -1.8)],
                     'goc': [(0, -2.0), (300, -4.0)],
                     'sy': [(0, 0.985), (150, 1.01), (300, 0.985), (450, 1.01)]},
            'tay-truoc': {'X': [(150, tt[0] - 4.0), (450, tt[0] + 3.5)],
                          'Y': [(0, tt[1] + 1.0), (150, tt[1] - 1.5), (300, tt[1] + 1.0), (450, tt[1] - 1.5)]},
            'tay-sau': {'X': [(150, ts[0] + 3.0), (450, ts[0] - 3.5)],
                        'Y': [(0, ts[1] + 1.0), (150, ts[1] - 1.5), (300, ts[1] + 1.0), (450, ts[1] - 1.5)]},
            'qua-lac': {'lac': [(75, 8.0), (375, -8.0)]},
        }}

    # ------------------------------------------------------------------ đấm, 1200 ms
    xa0 = C.khe('chan-xa')
    clips['dam'] = {
        'ms': 1200, 'buoc_ms': BUOC, 'lap': False,
        'pha': [('chuan-bi', 0, 500), ('vung', 500, 500 + 5 * TICK), ('cham', 500 + 5 * TICK, 500 + 11 * TICK),
                ('thu', 500 + 11 * TICK, 1200)],
        'cham': (500 + 5 * TICK, 500 + 11 * TICK),
        'hop_don': HOP_DAM,
        'ghi_chu': 'lấy đà: ngả ra sau, nắm tay trước kéo về sát thân và lên cao; vung: thân chúi tới, nắm tay phóng '
                   'thẳng ra trước, giãn ngang 1,2× (khung 17), chạm: duỗi hết + nén nhẹ (khung 18–20), hai chân nhón '
                   'nhảy nhỏ 3 px khi lao tới (game dời quái 18 px ở tick 0–5); thu về dáng nghỉ.',
        'kenh': {
            'tay-truoc': {
                'X': [(0, tt[0]), (300, -37.0), (500, -33.0), (567, -64.0), (600, -66.0), (700, -65.0), (900, -54.0),
                      (1200, tt[0])],
                'Y': [(0, tt[1]), (300, -59.0), (500, -62.0), (567, -62.0), (700, -62.0), (900, -55.0), (1200, tt[1])],
                'sx': [(0, 1.0), (500, 0.95), (567, 1.2), (633, 1.06), (767, 1.0)],
                'sy': [(0, 1.0), (500, 1.04), (567, 0.86), (633, 0.96), (767, 1.0)],
                'goc': [(0, 0.0), (300, -15.0), (500, -20.0), (567, 4.0), (700, 0.0)]},
            'tay-sau': {'X': [(0, ts[0]), (450, 40.0), (600, 53.0), (1200, ts[0])],
                        'Y': [(0, ts[1]), (450, -52.0), (600, -40.0), (1200, ts[1])],
                        'goc': [(0, 0.0), (450, -10.0), (600, 8.0), (1200, 0.0)]},
            'than': {'goc': [(0, 0.0), (450, 9.0), (500, 9.0), (567, -10.0), (700, -8.0), (1000, -1.0), (1200, 0.0)],
                     'x': [(0, 0.0), (500, 2.0), (567, -3.0), (700, -3.0), (1200, 0.0)],
                     'sy': [(0, 1.0), (450, 1.03), (567, 0.95), (650, 1.0)],
                     'sx': [(0, 1.0), (450, 0.98), (567, 1.04), (650, 1.0)]},
            'qua-lac': {'lac': [(0, 0.0), (450, 6.0), (567, -18.0), (733, 10.0), (933, -4.0), (1200, 0.0)]},
            'chan-gan': {'nhac': [(0, 0.0), (500, 0.0), (533, 3.0), (583, 0.0), (1200, 0.0)],
                         'goc': [(0, 0.0), (500, 0.0), (533, 6.0), (583, 0.0)]},
            'chan-xa': {'nhac': [(0, xa0), (500, xa0), (533, xa0 + 3.0), (583, xa0), (1200, xa0)],
                        'goc': [(0, 0.0), (500, 0.0), (533, 6.0), (583, 0.0)]},
        }}

    # ------------------------------------------------------------------ trúng đòn, 267 ms
    clips['trung'] = {
        'ms': 16 * TICK, 'buoc_ms': BUOC, 'lap': False,
        'pha': [('giat', 0, 67), ('hoi', 67, 16 * TICK)],
        'ghi_chu': 'giật lùi (thân ra sau 5 px, ngả 12°), tay văng ra sau, quả lắc lắc mạnh; nháy trắng ở khung 0–1 '
                   'và 4–5 (đã nướng vào sheet; game vẫn có thể nháy thêm bằng q.flash). Chân đứng yên.',
        'kenh': {
            '*': {'trang': [(0, 0.85), (60, 0.0), (130, 0.6), (190, 0.0)]},
            'than': {'x': [(0, 0.0), (67, 5.0), (16 * TICK, 0.0)], 'goc': [(0, 0.0), (67, 12.0), (167, 4.0), (16 * TICK, 0.0)],
                     'sy': [(0, 1.0), (67, 0.95), (167, 1.01), (16 * TICK, 1.0)]},
            'tay-truoc': {'X': [(0, tt[0]), (67, tt[0] + 7.5), (16 * TICK, tt[0])],
                          'Y': [(0, tt[1]), (67, tt[1] - 6.0), (16 * TICK, tt[1])],
                          'goc': [(0, 0.0), (67, 20.0), (16 * TICK, 0.0)]},
            'tay-sau': {'X': [(0, ts[0]), (67, ts[0] + 7.0), (16 * TICK, ts[0])],
                        'Y': [(0, ts[1]), (67, ts[1] - 6.0), (16 * TICK, ts[1])],
                        'goc': [(0, 0.0), (67, 15.0), (16 * TICK, 0.0)]},
            'qua-lac': {'lac': [(0, 0.0), (67, 22.0), (167, -10.0), (16 * TICK, 0.0)]},
        }}

    # ------------------------------------------------------------------ chết: vỡ đôi + đổ, 1000 ms (giữ khung cuối)
    kt, kp = C.khe('than-trai'), C.khe('than-phai')
    kq = C.khe('qua-lac')
    gt, gp = C.goc_nam('than-trai', -1), C.goc_nam('than-phai', +1)
    gcx, gcg = C.goc_nam('chan-xa', -1, lo=80, hi=120), C.goc_nam('chan-gan', +1, lo=80, hi=120)
    gq = C.goc_nam('qua-lac', +1, lo=40)
    ktt, kts = C.khe('tay-truoc'), C.khe('tay-sau')

    def roi(t0, t1, k0):
        """rơi từ khe k0 ở t0 xuống chạm đất ở t1: vận tốc lúc chạm = 2× trung bình (như trọng lực), sau chạm = 0"""
        return (t1, 0.0, (-2 * k0 / (t1 - t0), 0.0))
    clips['chet'] = {
        'ms': 1000, 'buoc_ms': BUOC, 'lap': False, 'giu_cuoi': True,
        'pha': [('giat', 0, 133), ('vo-roi', 133, 400), ('do', 400, 800), ('nam', 800, 1000)],
        'ghi_chu': 'giật + nháy; khung 4 (133 ms) thân vỡ đôi theo vết nứt (than → than-trai + than-phai); hai nửa '
                   'rơi xuống đất (như trọng lực) rồi đổ nghiêng sang hai bên, nảy nhẹ, nằm yên; quả lắc rơi lăn ra; '
                   'nắm tay rơi xuống nảy; hai chân ngã sang hai bên; tối dần 30 %. Mọi mảnh nằm ĐÚNG mặt đất '
                   '(giải từ hình mảnh). Mảnh vụn/mờ dần: game tự làm (shatter, q.fade).',
        'kenh': {
            '*': {'trang': [(0, 0.85), (60, 0.0), (95, 0.7), (130, 0.0)], 'toi': [(0, 0.0), (400, 0.0), (1000, 0.3)]},
            'than': {'x': [(0, 0.0), (100, 4.0), (300, 0.0)], 'goc': [(0, 0.0), (100, 14.0), (300, 0.0)],
                     'hien': [(0, 1), (133, 0)]},
            'than-trai': {'hien': [(0, 0), (133, 1)],
                          'nhac': [(133, kt), roi(133, 380, kt), (430, 1.5), (480, 0.0), (1000, 0.0)],
                          'goc': [(133, 0.0), (380, -6.0), (720, gt, (-0.35, 0.0)), (790, gt + 7.0), (860, gt)],
                          'x': [(133, -0.5), (400, -1.5), (860, -4.0)]},
            'than-phai': {'hien': [(0, 0), (133, 1)],
                          'nhac': [(133, kp), roi(133, 380, kp), (440, 1.2), (490, 0.0), (1000, 0.0)],
                          'goc': [(133, 0.0), (380, 5.0), (760, gp, (0.32, 0.0)), (830, gp - 6.0), (900, gp)],
                          'x': [(133, 0.5), (400, 1.5), (900, 4.0)]},
            'qua-lac': {'nhac': [(133, kq), roi(133, 380, kq), (430, 1.2), (480, 0.0), (1000, 0.0)],
                        'goc': [(133, 0.0), (380, 25.0), (700, gq), (1000, gq)],
                        'x': [(133, 0.0), (700, 8.0)]},
            'tay-truoc': {'nhac': [(100, ktt), roi(100, 400, ktt), (460, 2.5), (520, 0.0), (1000, 0.0)],
                          'goc': [(100, 0.0), (400, -40.0), (520, -50.0)],
                          'X': [(100, tt[0]), (520, tt[0] - 8.0)]},
            'tay-sau': {'nhac': [(100, kts), roi(100, 420, kts), (480, 2.0), (540, 0.0), (1000, 0.0)],
                        'goc': [(100, 0.0), (420, 35.0), (540, 45.0)],
                        'X': [(100, ts[0]), (540, ts[0] + 8.0)]},
            'chan-xa': {'nhac': [(133, C.khe('chan-xa')), (400, 0.0), (1000, 0.0)],
                        'goc': [(133, 0.0), (420, gcx, (-0.6, 0.0)), (480, gcx + 8), (540, gcx)],
                        'x': [(133, 0.0), (540, -6.0)]},
            'chan-gan': {'nhac': [(133, 0.0), (1000, 0.0)],
                         'goc': [(133, 0.0), (440, gcg, (0.55, 0.0)), (500, gcg - 8), (560, gcg)],
                         'x': [(133, 0.0), (560, 6.0)]},
        }}
    return clips
