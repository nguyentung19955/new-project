"""Mốc đặt tay cho 5 clip của QUÁI NẤM MỐC (đơn vị: ms, px logic, độ). Xem dong_tac.py để biết nghĩa từng thuộc tính.
Quay mặt sang TRÁI: phía trước = −x. y âm = lên trên.

ĐÒN CHỌN: ĐẤM (không phun bào tử). Lý do: dùng lại nguyên máy trạng thái quái chuông gỗ đã có trong game/demo.html
(updateQuai: walk → wind 30 bước → strike 16 bước → rec 26 bước, hit 16, die) → ghép vào game chỉ cần đổi hình và hộp
đấm; phun bào tử để dành cho boss Mẹ Nấm Mốc (khỏi trùng đòn).

Nhịp (60 bước/s) – y như quái chuông gỗ:
- đi tuần 0,9 px/bước = 54 px logic/s; clip đi 600 ms (2 bước chân), chân chịu lực trôi đúng 54 px/s.
- đấm 1200 ms: chuẩn bị 0–500 (30 bước – telegraph: ngả sau, nắm tay kéo về, mũ nấm phồng lên) → vung 500–583 →
  CHẠM 583–683 (bước 5–10 của strike, hộp đấm bật) → thu 767–1200.
- trúng đòn 267 ms (16 bước). Chết 1000 ms, giữ khung cuối (game làm mờ / bắn mảnh vụn như quái cũ).
Hộp đấm ĐỀ XUẤT cho Nấm (gameplay quyết, xem GHI-CHU.md): {dx −92, dy −62, w 60, h 40} so với điểm neo (nhìn trái)
– thấp hơn hộp của quái chuông gỗ vì nắm tay Nấm ở ngang thân (−33 px) chứ không cao như quái chuông."""

TICK = 1000 / 60
BUOC = 2 * TICK
V_DI = 0.9 * 60 / 1000
HITBOX_THAN = {'w': 72, 'h': 100, 'ghi_chu': 'đề xuất: thân + chân, không tính chóp mũ/chuông; giữa đáy = neo'}
HOP_DAM = {'dx': -92, 'dy': -62, 'w': 60, 'h': 40, 'ghi_chu': 'đề xuất, so với neo, nhìn trái'}


def tao(C):
    tt = C.nghi('tay-truoc')
    ts = C.nghi('tay-sau')
    clips = {}

    # ------------------------------------------------------------------ đứng: thở + mũ nấm phập phồng, lặp 1,6 s
    clips['dung'] = {
        'ms': 1600, 'buoc_ms': 4 * TICK, 'lap': True,
        'pha': [('hit-vao', 0, 800), ('tho-ra', 800, 1600)],
        'ghi_chu': 'thân co giãn nhẹ quanh đáy; mũ nấm phồng/xẹp (rộng ra 4 %, dẹt 4 %) lệch pha thân; chuông nghiêng '
                   '±3°; hai nắm tay nổi lệch pha. Mọi kênh qua đúng dáng nghỉ ở t = 0.',
        'kenh': {
            'than': {'sy': [(0, 1.0), (800, 0.982)], 'sx': [(0, 1.0), (800, 1.01)]},
            'mu': {'sx': [(0, 1.0), (400, 1.04), (800, 1.0), (1200, 0.985)],
                   'sy': [(0, 1.0), (400, 0.96), (800, 1.0), (1200, 1.02)]},
            'chuong': {'goc': [(400, -3.0), (1200, 3.0)]},
            'tay-truoc': {'X': [(400, tt[0] - 0.8), (1200, tt[0] + 0.8)], 'Y': [(400, tt[1] - 1.5), (1200, tt[1] + 1.5)]},
            'tay-sau': {'X': [(400, ts[0] + 0.8), (1200, ts[0] - 0.8)], 'Y': [(1200, ts[1] - 1.5), (400, ts[1] + 1.5)]},
        }}

    # ------------------------------------------------------------------ đi tuần, lặp 0,6 s (2 bước)
    T, duty, d = 600.0, 0.55, 40.0
    Ts = T * duty
    S = V_DI * Ts
    xa0 = C.khe('chan-xa')

    def chan(pha, khe0):
        def tm(t):
            return (t + pha) % T
        return {
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
        'ghi_chu': f'2 bước/0,6 s; mỗi chân chịu lực {Ts:.0f} ms, sải {S:.2f} px logic; chân chịu lực trôi đúng 54 px '
                   'logic/s (game dời 0,9 px/bước → chân đứng yên trên đất). Thân nhún 2 lần/chu kỳ, chúi trước; mũ nấm '
                   'lắc trễ nhịp thân (±2,5°) và nảy dẹt khi thân chạm xuống; chuông lắc ±6°; tay đánh ngược nhịp.',
        'kenh': {
            'chan-gan': chan(0.0, 0.0),
            'chan-xa': chan(T / 2, xa0),
            'than': {'y': [(0, 0.0), (150, -1.8), (300, 0.0), (450, -1.8)],
                     'goc': [(0, -2.0), (300, -4.0)],
                     'sy': [(0, 0.985), (150, 1.01), (300, 0.985), (450, 1.01)]},
            'mu': {'goc': [(75, 2.5), (375, -2.5)],
                   'sy': [(30, 0.97), (180, 1.01), (330, 0.97), (480, 1.01)],
                   'sx': [(30, 1.02), (180, 0.995), (330, 1.02), (480, 0.995)]},
            'chuong': {'goc': [(120, 6.0), (420, -6.0)]},
            'tay-truoc': {'X': [(150, tt[0] - 4.0), (450, tt[0] + 3.5)],
                          'Y': [(0, tt[1] + 1.0), (150, tt[1] - 1.5), (300, tt[1] + 1.0), (450, tt[1] - 1.5)]},
            'tay-sau': {'X': [(150, ts[0] + 3.0), (450, ts[0] - 3.5)],
                        'Y': [(0, ts[1] + 1.0), (150, ts[1] - 1.5), (300, ts[1] + 1.0), (450, ts[1] - 1.5)]},
        }}

    # ------------------------------------------------------------------ đấm, 1200 ms
    xa0 = C.khe('chan-xa')
    hx, hy = HOP_DAM['dx'] + HOP_DAM['w'] / 2, HOP_DAM['dy'] + HOP_DAM['h'] / 2      # tâm hộp đấm
    clips['dam'] = {
        'ms': 1200, 'buoc_ms': BUOC, 'lap': False,
        'pha': [('chuan-bi', 0, 500), ('vung', 500, 500 + 5 * TICK), ('cham', 500 + 5 * TICK, 500 + 11 * TICK),
                ('thu', 500 + 11 * TICK, 1200)],
        'cham': (500 + 5 * TICK, 500 + 11 * TICK),
        'hop_don': HOP_DAM,
        'ghi_chu': 'chuẩn bị (30 bước – telegraph rõ): ngả ra sau 10°, nắm tay trước kéo về sát thân và lên cao, mũ nấm '
                   'phồng to dần (rộng 1,08×) và chuông rung; vung: thân chúi tới, nắm tay phóng thẳng ra trước, giãn '
                   'ngang 1,2×; chạm: nắm tay nằm giữa hộp đấm (khung 18–20), mũ xẹp nảy; hai chân nhón khi lao tới; thu.',
        'kenh': {
            'tay-truoc': {
                'X': [(0, tt[0]), (300, -14.0), (500, -10.0), (567, hx - 2), (600, hx - 3), (700, hx - 2),
                      (900, -46.0), (1200, tt[0])],
                'Y': [(0, tt[1]), (300, -52.0), (500, -55.0), (567, hy), (700, hy), (900, -38.0), (1200, tt[1])],
                'sx': [(0, 1.0), (500, 0.95), (567, 1.2), (633, 1.06), (767, 1.0)],
                'sy': [(0, 1.0), (500, 1.04), (567, 0.86), (633, 0.96), (767, 1.0)],
                'goc': [(0, 0.0), (300, -15.0), (500, -20.0), (567, 4.0), (700, 0.0)]},
            'tay-sau': {'X': [(0, ts[0]), (450, 46.0), (600, 50.0), (1200, ts[0])],
                        'Y': [(0, ts[1]), (450, -50.0), (600, -40.0), (1200, ts[1])],
                        'goc': [(0, 0.0), (450, -10.0), (600, 8.0), (1200, 0.0)]},
            'than': {'goc': [(0, 0.0), (450, 9.0), (500, 10.0), (567, -10.0), (700, -8.0), (1000, -1.0), (1200, 0.0)],
                     'x': [(0, 0.0), (500, 2.0), (567, -3.0), (700, -3.0), (1200, 0.0)],
                     'sy': [(0, 1.0), (450, 1.03), (567, 0.95), (650, 1.0)],
                     'sx': [(0, 1.0), (450, 0.98), (567, 1.04), (650, 1.0)]},
            'mu': {'sx': [(0, 1.0), (450, 1.08), (500, 1.08), (567, 0.95), (650, 1.03), (800, 1.0)],
                   'sy': [(0, 1.0), (450, 0.95), (500, 0.95), (567, 1.05), (650, 0.98), (800, 1.0)],
                   'goc': [(0, 0.0), (500, 3.0), (567, -5.0), (733, 2.0), (933, 0.0)]},
            'chuong': {'goc': [(0, 0.0), (200, -4.0), (300, 4.0), (400, -5.0), (500, 5.0), (567, -12.0), (733, 6.0),
                               (933, -2.0), (1200, 0.0)]},
            'chan-gan': {'nhac': [(0, 0.0), (500, 0.0), (533, 3.0), (583, 0.0), (1200, 0.0)],
                         'goc': [(0, 0.0), (500, 0.0), (533, 6.0), (583, 0.0)]},
            'chan-xa': {'nhac': [(0, xa0), (500, xa0), (533, xa0 + 3.0), (583, xa0), (1200, xa0)],
                        'goc': [(0, 0.0), (500, 0.0), (533, 6.0), (583, 0.0)]},
        }}

    # ------------------------------------------------------------------ trúng đòn, 267 ms
    clips['trung'] = {
        'ms': 16 * TICK, 'buoc_ms': BUOC, 'lap': False,
        'pha': [('giat', 0, 67), ('hoi', 67, 16 * TICK)],
        'ghi_chu': 'giật lùi (thân ra sau 5 px, ngả 12°), mũ nấm dẹt rồi nảy, chuông lắc mạnh, tay văng ra sau. '
                   'KHÔNG nướng nháy trắng – game tự nháy.',
        'kenh': {
            'than': {'x': [(0, 0.0), (67, 5.0), (16 * TICK, 0.0)], 'goc': [(0, 0.0), (67, 12.0), (167, 4.0), (16 * TICK, 0.0)],
                     'sy': [(0, 1.0), (67, 0.95), (167, 1.01), (16 * TICK, 1.0)]},
            'mu': {'sy': [(0, 1.0), (67, 0.9), (150, 1.04), (16 * TICK, 1.0)],
                   'sx': [(0, 1.0), (67, 1.06), (150, 0.98), (16 * TICK, 1.0)]},
            'chuong': {'goc': [(0, 0.0), (67, 15.0), (167, -8.0), (16 * TICK, 0.0)]},
            'tay-truoc': {'X': [(0, tt[0]), (67, tt[0] + 7.5), (16 * TICK, tt[0])],
                          'Y': [(0, tt[1]), (67, tt[1] - 6.0), (16 * TICK, tt[1])],
                          'goc': [(0, 0.0), (67, 20.0), (16 * TICK, 0.0)]},
            'tay-sau': {'X': [(0, ts[0]), (67, ts[0] + 7.0), (16 * TICK, ts[0])],
                        'Y': [(0, ts[1]), (67, ts[1] - 6.0), (16 * TICK, ts[1])],
                        'goc': [(0, 0.0), (67, 15.0), (16 * TICK, 0.0)]},
        }}

    # ------------------------------------------------------------------ chết: mũ rơi, bào tử bay, 1000 ms (giữ khung cuối)
    gmu = C.goc_nam('mu', +1, lo=20, hi=110)
    kmu = C.khe('mu')
    ktt, kts = C.khe('tay-truoc'), C.khe('tay-sau')

    def roi(t0, t1, k0):
        return (t1, 0.0, (-2 * k0 / (t1 - t0), 0.0))
    bt = {}
    # 6 bào tử: (thời điểm hiện, X cuối, Y cuối, cỡ cuối) – bay lên từ dưới mũ, toả ra, mờ dần
    BT = [(150, -34, -96, 0.9), (170, -12, -112, 0.7), (190, 14, -104, 1.0), (210, 34, -88, 0.6), (230, -24, -76, 0.55),
          (250, 22, -70, 0.8)]
    x0, y0 = C.nghi('bao-tu-1')
    for i, (t0, X, Y, s) in enumerate(BT):
        bt[f'bao-tu-{i + 1}'] = {
            'hien': [(0, 0), (t0, 1)],
            'X': [(t0, x0 + X * 0.15), (t0 + 450, x0 + X * 0.8), (1000, x0 + X)],
            'Y': [(t0, -45.0), (t0 + 450, Y * 0.85), (1000, Y)],
            'sx': [(t0, 0.35), (t0 + 250, s), (1000, s * 1.1)], 'sy': [(t0, 0.35), (t0 + 250, s), (1000, s * 1.1)],
            'mo': [(t0, 1.0), (t0 + 350, 0.95), (1000, 0.0)]}
    clips['chet'] = {
        'ms': 1000, 'buoc_ms': BUOC, 'lap': False, 'giu_cuoi': True,
        'pha': [('giat', 0, 133), ('mu-roi', 133, 500), ('do', 500, 800), ('nam', 800, 1000)],
        'ghi_chu': 'giật ngửa; khung 4 (133 ms) mũ nấm (kèm chuông) bật khỏi thân, lật ra sau rồi rơi chạm đất (như '
                   'trọng lực), nảy nhẹ, nằm nghiêng đúng mặt đất; 6 bào tử phụt ra từ chỗ mũ, bay lên toả ra, to dần, '
                   'mờ hết ở 1000 ms; thân ngả sau 14° và lún dẹt; nắm tay rơi nảy; chân đứng yên; tối dần 30 %. '
                   'Mảnh vụn/mờ cả xác: game tự làm (như quái chuông gỗ).',
        'kenh': dict({
            '*': {'toi': [(0, 0.0), (400, 0.0), (1000, 0.3)]},
            'than': {'x': [(0, 0.0), (100, 4.0), (300, 2.0), (700, 1.0)], 'goc': [(0, 0.0), (100, 10.0), (300, 6.0),
                                                                                  (700, 14.0)],
                     'sy': [(0, 1.0), (300, 0.97), (700, 0.9)], 'sx': [(0, 1.0), (700, 1.05)]},
            'mu': {'nhac': [(133, kmu), (230, kmu + 12.0), roi(230, 520, kmu + 12.0), (580, 2.0), (640, 0.0), (1000, 0.0)],
                   'goc': [(133, 0.0), (300, 30.0), (520, gmu), (600, gmu - 8.0), (680, gmu)],
                   'x': [(133, 0.0), (520, 34.0), (700, 40.0)]},
            'chuong': {'goc': [(133, 0.0), (300, -20.0), (520, 10.0), (620, -15.0), (720, 0.0)]},
            'tay-truoc': {'nhac': [(100, ktt), roi(100, 400, ktt), (460, 2.5), (520, 0.0), (1000, 0.0)],
                          'goc': [(100, 0.0), (400, -40.0), (520, -50.0)],
                          'X': [(100, tt[0]), (520, tt[0] - 8.0)]},
            'tay-sau': {'nhac': [(100, kts), roi(100, 420, kts), (480, 2.0), (540, 0.0), (1000, 0.0)],
                        'goc': [(100, 0.0), (420, 35.0), (540, 45.0)],
                        'X': [(100, ts[0]), (540, ts[0] + 8.0)]},
        }, **bt)}
    return clips
