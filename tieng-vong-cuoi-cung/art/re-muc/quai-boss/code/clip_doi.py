"""Mốc đặt tay cho clip của DƠI CHUÔNG – quái BAY (đơn vị: ms, px logic, độ). Quay TRÁI; y âm = lên.
Điểm neo = đáy quả lắc giữa trục chuông (= giữa đáy hitbox). Game dời con dơi (bay, bổ nhào, rơi) – animation KHÔNG tự
dời điểm neo, chỉ thể hiện dáng (vỗ cánh, chúi, cụp cánh…). Cánh trước (trái màn hình) góc + = mũi cánh lên; cánh
sau ngược dấu.

Game CHƯA có Dơi Chuông → nhịp dưới đây là ĐỀ XUẤT (xem GHI-CHU.md mục số gameplay), 60 bước/s:
- bay: vỗ cánh lặp 400 ms (2,5 lần/s), thân nhấp nhô ±2 px ngược nhịp cánh.
- lao (bổ nhào) 1400 ms: chuẩn bị 0–450 (27 bước – telegraph: bốc lên, ngửa ra sau, giơ cao cánh, rung) →
  LAO 450–950 (30 bước: chúi mũi 35°, cụp cánh; game dời dơi theo đường chéo xuống, hộp lao bật 500–900) →
  hồi 950–1400 (ngóc lên, xoè cánh vỗ một nhịp).
- trúng đòn 267 ms (16 bước). Chết = 2 clip: 'chet-roi' (lặp 300 ms, lộn nhào khi game cho rơi) → khi game báo chạm đất:
  'chet-vo' (900 ms, giữ khung cuối: chuông nứt đôi, quả lắc lăn, cánh rũ xuống đất)."""

TICK = 1000 / 60
BUOC = 2 * TICK
HITBOX_THAN = {'w': 44, 'h': 44, 'ghi_chu': 'đề xuất: chuông + quả lắc (không tính cánh); giữa đáy = neo'}
HOP_LAO = {'dung_hitbox_than': True, 'ghi_chu': 'đề xuất: lúc lao dùng chính hitbox thân 44×44 gây sát thương'}


def tao(C):
    clips = {}
    kq = C.khe('qua-lac')

    # ------------------------------------------------------------------ bay: vỗ cánh lặp 400 ms
    clips['bay'] = {
        'ms': 400, 'buoc_ms': BUOC, 'lap': True,
        'pha': [('canh-len', 0, 100), ('dap-xuong', 100, 250), ('nang-len', 250, 400)],
        'ghi_chu': 'cánh trước: dáng nghỉ → giơ lên 18° → đập xuống −42° (co ngắn 0,8× như cánh quay về phía người '
                   'xem) → về; cánh sau ngược dấu, trễ 20 ms; thân nhô lên khi cánh đập xuống; quả lắc lắc trễ nhịp ±7°. '
                   'Qua đúng dáng nghỉ ở t = 0.',
        'kenh': {
            'canh-truoc': {'goc': [(0, 0.0), (100, 18.0), (250, -42.0)], 'sx': [(0, 1.0), (100, 1.0), (250, 0.8)]},
            'canh-sau': {'goc': [(20, 0.0), (120, -18.0), (270, 42.0)], 'sx': [(20, 1.0), (120, 1.0), (270, 0.82)]},
            'than': {'y': [(0, 0.0), (130, 1.6), (290, -2.2)], 'goc': [(0, 0.0), (130, 2.0), (290, -2.0)]},
            'qua-lac': {'lac': [(0, 0.0), (180, 7.0), (360, -5.0)]},
        }}

    # ------------------------------------------------------------------ lao xuống (bổ nhào), 1400 ms
    clips['lao'] = {
        'ms': 1400, 'buoc_ms': BUOC, 'lap': False,
        'pha': [('chuan-bi', 0, 450), ('lao', 450, 950), ('hoi', 950, 1400)],
        'cham': (500, 900),
        'hop_don': HOP_LAO,
        'ghi_chu': 'chuẩn bị (27 bước): bốc lên 6 px, ngửa 22°, hai cánh giơ cao và rung, quả lắc văng ra sau → lao: chúi '
                   'mũi −35°, cụp cánh (giơ thẳng ra sau, co 0,7×), quả lắc kéo ngược lên sau; hộp lao bật 500–900 ms '
                   '(game dời dơi chéo xuống) → hồi: ngóc lên 15°, xoè cánh đập một nhịp, về dáng bay.',
        'kenh': {
            'than': {'y': [(0, 0.0), (350, -6.0), (450, -6.0), (520, 0.0), (950, 0.0), (1100, -3.0), (1400, 0.0)],
                     'goc': [(0, 0.0), (300, 22.0), (450, 24.0), (530, -35.0), (900, -35.0), (1050, 15.0), (1250, -3.0),
                             (1400, 0.0)],
                     'x': [(0, 0.0), (300, 3.0), (450, 3.0), (530, 0.0)]},
            'canh-truoc': {'goc': [(0, 0.0), (250, 35.0), (300, 28.0), (350, 38.0), (400, 30.0), (450, 40.0),
                                   (530, 70.0), (900, 72.0), (1000, 20.0), (1120, -40.0), (1250, 10.0), (1400, 0.0)],
                           'sx': [(0, 1.0), (450, 1.0), (530, 0.7), (900, 0.7), (1000, 1.0), (1120, 0.82), (1250, 1.0)]},
            'canh-sau': {'goc': [(0, 0.0), (250, -35.0), (300, -28.0), (350, -38.0), (400, -30.0), (450, -40.0),
                                 (530, -70.0), (900, -72.0), (1000, -20.0), (1140, 40.0), (1270, -10.0), (1400, 0.0)],
                         'sx': [(0, 1.0), (450, 1.0), (530, 0.72), (900, 0.72), (1000, 1.0), (1140, 0.84), (1270, 1.0)]},
            'qua-lac': {'lac': [(0, 0.0), (300, 25.0), (450, 18.0), (530, 50.0), (900, 45.0), (1050, -20.0), (1200, 8.0),
                                (1400, 0.0)]},
        }}

    # ------------------------------------------------------------------ trúng đòn, 267 ms
    clips['trung'] = {
        'ms': 16 * TICK, 'buoc_ms': BUOC, 'lap': False,
        'pha': [('giat', 0, 67), ('hoi', 67, 16 * TICK)],
        'ghi_chu': 'giật lùi 3 px, ngửa 18°, hai cánh xoè bật lên, quả lắc văng; không nháy trắng (game tự nháy).',
        'kenh': {
            'than': {'x': [(0, 0.0), (67, 3.0), (16 * TICK, 0.0)], 'goc': [(0, 0.0), (67, 18.0), (167, 5.0), (16 * TICK, 0.0)]},
            'canh-truoc': {'goc': [(0, 0.0), (67, 28.0), (16 * TICK, 0.0)]},
            'canh-sau': {'goc': [(0, 0.0), (67, -28.0), (16 * TICK, 0.0)]},
            'qua-lac': {'lac': [(0, 0.0), (67, 30.0), (167, -12.0), (16 * TICK, 0.0)]},
        }}

    # ------------------------------------------------------------------ chết – rơi (lặp 300 ms, game cho rơi)
    clips['chet-roi'] = {
        'ms': 300, 'buoc_ms': BUOC, 'lap': True,
        'pha': [('lon-nhao', 0, 300)],
        'ghi_chu': 'lộn nhào khi rơi: thân lắc 20°↔45°, cánh rũ xuống đập yếu, quả lắc văng ngược. Game dời dơi rơi tới '
                   'đất rồi chuyển sang chet-vo.',
        'kenh': {
            'than': {'goc': [(0, 20.0), (150, 45.0)], 'y': [(0, 0.0), (150, -2.0)]},
            'canh-truoc': {'goc': [(0, -45.0), (150, -25.0)], 'sx': [(0, 0.85), (150, 0.95)]},
            'canh-sau': {'goc': [(40, 50.0), (190, 30.0)], 'sx': [(40, 0.85), (190, 0.95)]},
            'qua-lac': {'lac': [(0, -30.0), (150, 20.0)]},
        }}

    # ------------------------------------------------------------------ chết – chạm đất, chuông vỡ (900 ms, giữ cuối)
    gq = C.goc_nam('qua-lac', +1, lo=40, hi=120)
    p0 = {'than': {'goc': 30.0}}
    kq = C.khe('qua-lac', {'than': {'goc': 30.0, 'ty': [1.12, 0.85]}})
    kt, kp = C.khe('than-trai', p0), C.khe('than-phai', p0)
    kct, kcs = C.khe('canh-truoc', {'than': {'goc': 30.0, 'ty': [1.12, 0.85]}, 'canh-truoc': {'goc': -40.0}}), \
        C.khe('canh-sau', {'than': {'goc': 30.0, 'ty': [1.12, 0.85]}, 'canh-sau': {'goc': 45.0}})

    kct, kcs = max(kct, 0.0), max(kcs, 0.0)

    def roi(t0, t1, k0):
        return (t1, 0.0, (-2 * k0 / (t1 - t0), 0.0))
    clips['chet-vo'] = {
        'ms': 900, 'buoc_ms': BUOC, 'lap': False, 'giu_cuoi': True,
        'pha': [('cham-dat', 0, 100), ('vo', 100, 500), ('nam', 500, 900)],
        'ghi_chu': 'nảy dẹt khi chạm đất; khung 3 (100 ms) chuông nứt đôi theo vết nứt (thân → hai nửa, bật/tắt mảnh đổi '
                   'bậc, không nội suy), hai nửa toác ra (thân đang nghiêng 30° → nửa trước đổ úp, nửa sau dựng lại) và nằm đúng mặt đất; quả lắc tuột ra lăn tới '
                   'trước; hai cánh rũ nằm xuống đất; tối dần 30 %.',
        'kenh': {
            '*': {'toi': [(0, 0.0), (300, 0.0), (900, 0.3)]},
            'than': {'goc': [(0, 30.0), (100, 30.0)], 'sy': [(0, 0.85), (100, 1.0)], 'sx': [(0, 1.12), (100, 1.0)],
                     'hien': [(0, 1), (100, 0)], 'y': [(0, 0.0), (100, 0.0)]},
            'than-trai': {'hien': [(0, 0), (100, 1)], 'nhac': [(100, kt), roi(100, 300, kt), (900, 0.0)],
                          'goc': [(100, 0.0), (380, -58.0), (440, -50.0), (500, -55.0)],
                          'x': [(100, 0.0), (500, -6.0)]},
            'than-phai': {'hien': [(0, 0), (100, 1)], 'nhac': [(100, kp), roi(100, 320, kp), (900, 0.0)],
                          'goc': [(100, 0.0), (400, -10.0), (460, -16.0), (520, -12.0)],
                          'x': [(100, 0.0), (520, 7.0)]},
            'qua-lac': {'nhac': [(0, kq), (100, 0.0), (900, 0.0)],
                        'lac': [(0, 0.0), (100, 0.0), (600, gq)], 'x': [(100, 0.0), (600, -14.0)]},
            'canh-truoc': {'goc': [(0, -40.0), (250, -40.0)], 'nhac': [(0, kct), roi(0, 250, kct), (900, 0.0)],
                           'x': [(0, 0.0), (250, -4.0)]},
            'canh-sau': {'goc': [(0, 45.0), (250, 45.0)], 'nhac': [(0, kcs), roi(0, 270, kcs), (900, 0.0)],
                         'x': [(0, 0.0), (270, 4.0)]},
        }}
    return clips
