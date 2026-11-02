# -*- coding: utf-8 -*-
"""dung-phong.py – dựng 16 phòng Vùng 2 "Rotting Roots" (R201–R213 + RS201–RS203) theo kế hoạch ChatGPT
docs/vung-2/ke-hoach-chatgpt.txt (mục 2, 3, 6) bằng lệnh khoét – cùng cách làm Vùng 1 (game/vung-1/cong-cu-man/dung-phong.py,
dùng lại lớp Phong của Vùng 1, KHÔNG sửa file Vùng 1).
Chạy:  python3 dung-phong.py   → ghi game/vung-2/phong/*.json + game/vung-2/ban-do.json
Định dạng: game/vung-1/DINH-DANG-PHONG.md + phần thêm của Vùng 2: game/vung-2/DINH-DANG-PHONG-VUNG-2.md
  R = Gỗ Mục thường · Q = Gỗ Mục nhanh · P = Gỗ Mục xung · X = gai rễ · B = ao bào tử
  L = chốt rễ (Neo Rễ giữ mở) · C = cổng rễ đan (lối tắt, mở 1 lần từ 1 phía)
Vị trí phòng trên bản đồ thế giới tự tính theo cửa của tuyến chính (cây khung), lối tắt có thể lệch (hầm rễ dài).
"""
import importlib.util, json, os
from collections import deque

DAY = os.path.dirname(os.path.abspath(__file__))
GOC = os.path.join(DAY, '..')
_spec = importlib.util.spec_from_file_location('dung_phong_v1', os.path.join(DAY, '../../vung-1/cong-cu-man/dung-phong.py'))
V1 = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(V1)


class Phong(V1.Phong):
    def __init__(self, pid, ten, cot, hang):
        super().__init__(pid, ten, cot, hang, 0, 0)
        self.neo, self.cong = [], []
        self.ky_nang = None

    def nen(self, tran, *segs):
        """khoét lòng phòng từ hàng `tran`, rồi đắp sàn: segs = (c0, c1, hàng_sàn)"""
        self.hop(1, tran, self.C - 2, self.R - 2)
        for c0, c1, f in segs:
            self.dac(c0, f, c1, self.R - 1)

    def o(self, ch, *cr):
        for c, r in cr:
            self.set(c, r, ch)

    def doan(self, ch, c0, c1, r):
        for c in range(c0, c1 + 1):
            self.set(c, r, ch)

    def them_neo(self, nid, c, r, cum):
        self.neo.append(dict(id=nid, cot=c, hang=r, cum=[list(x) for x in cum]))

    def them_cong(self, gid, loai, o, mo_tu, ghi=''):
        for c, r in o:
            self.set(c, r, 'C')
        d = dict(id=gid, loai=loai, o=[list(x) for x in o], mo_tu=mo_tu)
        if ghi:
            d['ghi'] = ghi
        self.cong.append(d)

    def json(self):
        d = super().json()
        if self.neo:
            d['neo'] = self.neo
        if self.cong:
            d['cong'] = self.cong
        if self.ky_nang:
            d['ky_nang'] = self.ky_nang
        if getattr(self, 'trum_o', None):
            d['trum_o'] = self.trum_o
        return d


def L(p, *so):
    """đèn: L(p, c1, r1, c2, r2, …)"""
    for c, r in zip(so[::2], so[1::2]):
        p.den.append(dict(cot=c, hang=r))


# ============================================================ R201 Root Descent 48×20 – an toàn, làm quen hình gỗ mục (trang trí, không sập)
def R201():
    p = Phong('R201', 'Root Descent', 48, 20)
    p.nen(3, (0, 13, 17), (14, 18, 15), (19, 29, 17), (30, 34, 16), (35, 47, 17))
    p.dac(1, 3, 6, 8); p.dac(40, 3, 46, 7); p.bau(24, 3, 6, 2, '#')
    p.san(21, 24, 12, '=')                      # gờ phụ (nhảy đôi) → gờ cao có Mảnh Âm
    p.dac(26, 9, 30, 9)
    p.them_cua('R201-dong', 'phai', 14, 'R202', 'R202-tay')
    p.bat_dau = dict(cot=4, hang=16)
    p.v('R201-manh-1', 'manh_am', 28, 8, 10)
    p.trang_tri('R201-vo-muc', 'vo_muc_trang_tri', 16, 14, ghi='vỏ gỗ mục nứt – CHỈ trang trí, không sập (dạy nhìn)')
    p.dau('loi_chinh', 44, 16)
    L(p, 9, 9, 36, 10)
    return p


# ============================================================ R202 Softwood Passage 56×22 – cầu gỗ mục 2 ô đầu tiên trên hõm 1 ô vô hại
def R202():
    p = Phong('R202', 'Softwood Passage', 56, 22)
    p.nen(4, (0, 23, 15), (24, 25, 17), (26, 40, 15), (41, 45, 16), (46, 55, 18))
    p.doan('R', 24, 25, 15)                     # cầu gỗ mục: sập 2 s, mọc lại 3 s; rơi xuống hõm 1 ô rồi bước lên lại
    p.dac(9, 4, 15, 7); p.dac(30, 4, 36, 6)
    p.them_cua('R202-tay', 'trai', 12, 'R201', 'R201-dong')
    p.them_cua('R202-dong', 'phai', 15, 'R203', 'R203-tay')
    p.v('R202-manh-1', 'manh_am', 33, 14, 10)
    p.dau('loi_chinh', 50, 17)
    L(p, 20, 8, 44, 9)
    return p


# ============================================================ R203 Spore Lantern Grotto 60×26 – hố thật dưới lối gỗ mục 3 ô + đường vòng chắc; RS201 sau tường vỏ nứt
def R203():
    p = Phong('R203', 'Spore Lantern Grotto', 60, 26)
    p.nen(2, (0, 23, 20), (24, 26, 23), (27, 59, 20))
    p.doan('R', 24, 26, 20)                     # lối gỗ mục trên hố
    p.doan('X', 24, 26, 23)                     # đáy hố: gai rễ (mất 1 mặt nạ, về gờ chắc)
    p.dac(19, 18, 22, 19)                       # bậc lên đường vòng
    p.san(22, 28, 16, '=')                      # đường vòng chắc (không gỗ mục)
    # gờ trái cao + tường vỏ nứt 2 ô → giếng dây lên RS201
    p.dac(1, 13, 15, 13)
    p.day(16, 13, 19)
    p.hop(1, 0, 3, 12)
    p.o('N', (4, 10), (5, 10), (4, 11), (5, 11), (4, 12), (5, 12))
    p.dac(4, 2, 5, 9)
    p.day(2, 0, 12)
    p.them_cua('R203-tren', 'tren', 1, 'RS201', 'RS201-day', sau=1)
    # gờ phải cao → lối tắt (cổng rễ đan) về R205, mở từ phía R205
    p.san(44, 47, 17, '='); p.san(48, 51, 14, '=')
    p.dac(52, 11, 59, 11)
    p.them_cua('R203-dong-tren', 'phai', 8, 'R205', 'R205-tay-tren')
    p.them_cua('R203-tay', 'trai', 17, 'R202', 'R202-dong')
    p.them_cua('R203-dong', 'phai', 17, 'R204', 'R204-tay')
    p.q('gnawer', 36, 19, 31, 41)               # Rot Gnawer lần đầu – chỗ không có hố
    p.dau('bi_mat', 4, 11)
    p.dau('loi_chinh', 54, 19)
    L(p, 12, 6, 30, 10, 47, 6)
    return p


def RS201():
    p = Phong('RS201', 'Root Epitaph', 22, 14)
    p.nen(2, (0, 7, 11), (11, 21, 11))
    p.hop(8, 11, 10, 13)
    p.day(9, 8, 13)
    p.them_cua('RS201-day', 'duoi', 8, 'R203', 'R203-tren', sau=1)
    p.v('RS201-manh', 'manh_am', 16, 10, 20)
    p.trang_tri('RS201-bia', 'bia_lore', 4, 10, ghi='bia lore vườn ươm (biểu tượng 038)')
    L(p, 11, 4)
    return p


# ============================================================ R204 Rootwatch Rest 36×18 – Chuông Lưu S1 + teleport Làng Chuông, không quái
def R204():
    p = Phong('R204', 'Rootwatch Rest', 36, 18)
    p.nen(3, (0, 35, 14))
    p.bau(18, 4, 8, 2, '#')
    p.them_cua('R204-tay', 'trai', 11, 'R203', 'R203-dong')
    p.them_cua('R204-dong', 'phai', 11, 'R205', 'R205-tay')
    p.chuong_luu = dict(cot=18, hang=13)
    p.trang_tri('R204-trai-re', 'trai_re_kho', 12, 13, ghi='trại rễ khô')
    L(p, 18, 6, 9, 8, 27, 8)
    return p


# ============================================================ R205 Weeping Slope 72×30 – dốc: 3 đoạn gỗ mục xen bậc chắc; Spore Bell trên gờ chắc
def R205():
    p = Phong('R205', 'Weeping Slope', 72, 30)
    # bậc dốc: cầu gỗ mục nối 2 bậc; bậc sau thấp hơn cầu 4 ô; hố dưới cầu sâu hơn bậc sau 2 ô → rơi xuống vẫn đi ngang ra được
    p.nen(2, (0, 10, 9), (11, 14, 15), (15, 24, 13), (25, 28, 19), (29, 40, 17), (41, 44, 23), (45, 54, 21), (55, 60, 23), (61, 71, 25))
    p.doan('R', 11, 14, 9)                      # gỗ mục 1
    p.doan('R', 25, 28, 13)                     # gỗ mục 2
    p.doan('R', 41, 44, 17)                     # gỗ mục 3 – có Spore Bell canh
    # gờ trên cửa tây (lối tắt về R203 – cổng rễ đan mở từ phía này)
    p.dac(0, 5, 8, 5)
    p.them_cua('R205-tay-tren', 'trai', 2, 'R203', 'R203-dong-tren')
    p.them_cong('R205-cong-R203', 're_dan', [(2, 2), (2, 3), (2, 4)], 'phai', 'lối tắt về R203 – mở sau khi vượt dốc')
    # giếng xuống R208 (lối phụ – chốt rễ phía R208 cần Neo Rễ)
    p.hop(48, 19, 50, 29)
    p.day(49, 19, 29)
    p.them_cua('R205-day', 'duoi', 48, 'R208', 'R208-tren', sau=1)
    p.them_cua('R205-tay', 'trai', 6, 'R204', 'R204-dong')
    p.them_cua('R205-dong', 'phai', 22, 'R206', 'R206-tay')
    p.q('spore_bell', 37, 16)                   # trên nền chắc, nhìn xuống cầu gỗ mục 3
    p.q('gnawer', 58, 22, 56, 59)
    p.v('R205-manh-1', 'manh_am', 21, 12, 10)
    p.dau('loi_chinh', 66, 24)
    L(p, 6, 3, 20, 5, 35, 8, 52, 12, 64, 16)
    return p


# ============================================================ R206 Hollow Nursery 64×32 – Gỗ Mục xung + Đền Neo Rễ cuối phòng; RS202 sau trần giả; lối tắt xuống R209
def R206():
    p = Phong('R206', 'Hollow Nursery', 64, 32)
    p.nen(2, (0, 14, 27), (15, 17, 29), (18, 63, 27))
    p.doan('P', 15, 17, 27)                     # gỗ mục xung – trình diễn (hõm 1 ô bên dưới vô hại)
    # bậc lên trần giả → RS202
    p.san(22, 25, 23, '='); p.san(26, 30, 19, '=')
    p.dac(18, 2, 40, 12)
    p.hop(27, 0, 29, 15)
    p.doan('G', 27, 29, 15)                     # trần giả (dòng bào tử rơi mảnh làm gợi ý)
    p.day(28, 0, 14)
    p.them_cua('R206-tren', 'tren', 27, 'RS202', 'RS202-day', sau=1)
    # giếng lối tắt xuống R209: cổng rễ đan nằm ngang ở mặt sàn, mở từ phía dưới (R209)
    p.hop(40, 28, 42, 31)
    p.day(41, 28, 31)
    p.them_cua('R206-day', 'duoi', 40, 'R209', 'R209-tren', sau=1)
    p.them_cong('R206-cong-R209', 're_dan', [(40, 27), (41, 27), (42, 27)], 'duoi', 'lối tắt từ R209 – mở từ bên dưới')
    p.them_cua('R206-tay', 'trai', 24, 'R205', 'R205-dong')
    p.them_cua('R206-dong', 'phai', 24, 'R207', 'R207-tay')
    p.trang_tri('R206-den-tho', 'den_tho_neo_re', 54, 26, ghi='Đền Neo Rễ (yêu cầu 034) – chạm để nhận kỹ năng')
    p.ky_nang = dict(id='neo_re', cot=54, hang=26)
    p.dau('bi_mat', 28, 15)
    p.dau('loi_chinh', 58, 26)
    L(p, 10, 20, 47, 18, 54, 22)
    return p


def RS202():
    p = Phong('RS202', 'Forgotten Incubator', 26, 18)
    p.nen(2, (0, 10, 15), (14, 25, 15))
    p.hop(11, 15, 13, 17)
    p.day(12, 11, 17)
    p.them_cua('RS202-day', 'duoi', 11, 'R206', 'R206-tren', sau=1)
    p.v('RS202-manh-mau', 'manh_hoi', 20, 14)
    p.trang_tri('RS202-ken', 'ken_uom_rong', 5, 14, ghi='kén ươm rỗng')
    L(p, 18, 5)
    return p


# ============================================================ R207 Anchored Chasm 64×36 – bài Neo Rễ bắt buộc: cầu gỗ mục 4 ô + chốt rễ, gờ đỡ bên dưới
def R207():
    p = Phong('R207', 'Anchored Chasm', 64, 36)
    p.nen(2, (0, 20, 27), (21, 24, 34), (25, 63, 27))
    p.doan('R', 21, 24, 27)                     # cầu gỗ mục 4 ô (Neo Rễ giữ được cả cụm)
    p.hop(19, 28, 20, 33); p.set(20, 27, '=')   # gờ đỡ dưới vực + dây leo về bờ tây (lên qua sàn mỏng)
    p.day(20, 28, 33)
    p.them_neo('R207-neo-cau', 20, 25, [(21, 27), (22, 27), (23, 27), (24, 27)])
    p.o('L', (34, 24), (34, 25), (34, 26))      # chốt rễ chặn lối – Neo Rễ giữ mở 3 s
    p.them_neo('R207-neo-chot', 32, 25, [(34, 24), (34, 25), (34, 26)])
    p.dac(30, 2, 38, 23)
    p.dac(8, 2, 14, 10); p.dac(48, 2, 56, 12)
    p.them_cua('R207-tay', 'trai', 24, 'R206', 'R206-dong')
    p.them_cua('R207-dong', 'phai', 24, 'R208', 'R208-tay')
    p.q('husk_leaper', 47, 26, 43, 53)          # Husk Leaper lần đầu – sau bài Neo Rễ
    p.dau('loi_chinh', 59, 26)
    L(p, 18, 14, 26, 16, 44, 18)
    return p


# ============================================================ R208 Buried Bell Crossing 76×24 – Gỗ Mục nhanh; lối phụ lên R205 (chốt rễ); lối tắt từ R211 (mở phía R211)
def R208():
    p = Phong('R208', 'Buried Bell Crossing', 76, 24)
    p.nen(2, (0, 15, 19), (16, 18, 22), (19, 43, 19), (44, 46, 22), (47, 75, 19))
    p.doan('Q', 16, 18, 19); p.doan('X', 16, 18, 22)
    p.doan('Q', 44, 46, 19); p.doan('X', 44, 46, 22)
    # gờ trên + giếng dây lên R205, chốt rễ cần Neo Rễ
    p.san(19, 22, 16, '='); p.san(22, 25, 13, '=')
    p.dac(20, 10, 34, 10)
    p.o('L', (29, 7), (29, 8), (29, 9))
    p.them_neo('R208-neo-chot', 27, 8, [(29, 7), (29, 8), (29, 9)])
    p.hop(30, 0, 32, 9)
    p.day(31, 0, 9)
    p.dac(33, 2, 35, 15)                        # vách: túi chân giếng chỉ ra được qua chốt rễ
    p.dac(17, 2, 29, 6)                         # trần thấp trên gờ: không nhảy vòng qua chốt
    p.them_cua('R208-tren', 'tren', 30, 'R205', 'R205-day', sau=1)
    # gờ phải cao → lối tắt R211 (cổng mở từ phía R211)
    p.san(58, 61, 16, '='); p.san(62, 65, 13, '='); p.san(66, 69, 10, '=')
    p.dac(70, 7, 75, 7)
    p.them_cua('R208-dong-tren', 'phai', 4, 'R211', 'R211-tay-tren')
    p.them_cong('R208-cong-R211', 're_dan', [(72, 4), (72, 5), (72, 6)], 'phai', 'lối tắt từ cửa ra đấu trường R211')
    p.them_cua('R208-tay', 'trai', 16, 'R207', 'R207-dong')
    p.them_cua('R208-dong', 'phai', 16, 'R209', 'R209-tay')
    p.trang_tri('R208-bong-warden', 'bong_warden', 38, 18, ghi='bóng Nursery Warden thấp thoáng (báo trước tinh anh)')
    p.trang_tri('R208-chuong-vui', 'chuong_xac', 26, 18)
    p.q('gnawer', 32, 18, 26, 38)
    p.dau('loi_chinh', 71, 18)
    L(p, 10, 8, 40, 6, 55, 8)
    return p


# ============================================================ R209 Fungus Reservoir 64×38 – Chuông Lưu S2 trên đảo chắc giữa; Root Siphon; RS203 sau màn nấm; lối tắt lên R206
def R209():
    p = Phong('R209', 'Fungus Reservoir', 64, 38)
    p.nen(2, (0, 14, 13), (15, 22, 20), (23, 23, 34), (24, 37, 28), (38, 48, 34), (49, 63, 28))
    p.doan('B', 23, 23, 34); p.doan('B', 38, 48, 34)   # ao bào tử
    p.day(15, 13, 19)                           # dây từ bậc giữa lên gờ tây
    p.day(23, 20, 27)                           # dây từ đảo lên bậc giữa
    p.san(41, 45, 26, '=')                      # gờ nối đảo ↔ bờ phải
    p.dac(30, 2, 52, 9)
    # giếng lên R206 (cổng rễ đan phía R206, mở từ đây)
    p.hop(4, 0, 6, 12)
    p.day(5, 0, 12)
    p.them_cua('R209-tren', 'tren', 4, 'R206', 'R206-day', sau=1)
    # gờ phải + màn nấm (tường giả) → giếng dây lên RS203
    p.day(51, 15, 27)
    p.dac(52, 15, 63, 15)
    p.o('G', (58, 12), (58, 13), (58, 14), (59, 12), (59, 13), (59, 14))
    p.hop(60, 0, 62, 14)
    p.day(61, 0, 14)
    p.them_cua('R209-tren-phai', 'tren', 60, 'RS203', 'RS203-day', sau=1)
    p.them_cua('R209-tay', 'trai', 10, 'R208', 'R208-dong')
    p.them_cua('R209-dong', 'phai', 24, 'R210', 'R210-tay')
    p.chuong_luu = dict(cot=31, hang=27)
    p.q('root_siphon', 55, 27, 52, 56)
    p.dau('bi_mat', 58, 13)
    p.dau('loi_chinh', 60, 27)
    L(p, 31, 22, 18, 15, 46, 20, 58, 18)
    return p


def RS203():
    p = Phong('RS203', 'Amber Husk', 24, 16)
    p.nen(3, (0, 19, 12), (23, 23, 12))
    p.hop(20, 12, 22, 15)
    p.day(21, 9, 15)
    p.them_cua('RS203-day', 'duoi', 20, 'R209', 'R209-tren-phai', sau=1)
    p.v('RS203-bua', 'bua_neo_re', 5, 11)
    p.trang_tri('RS203-vo', 'vo_ho_phach', 11, 11, ghi='vỏ hổ phách')
    L(p, 12, 5)
    return p


# ============================================================ R210 Sporespine Ascent 52×44 – leo dọc khó nhất: bậc mỏng, gỗ mục, chốt rễ; hốc thử thách tuỳ chọn (Memory Shard)
def R210():
    p = Phong('R210', 'Sporespine Ascent', 52, 44)
    p.nen(2, (0, 51, 41))
    # bậc zíc-zắc: mỗi tầng cao 3 ô (cần nhảy đôi), cách nhau ≤ 2 ô ngang
    tang = [(37, 18, 24, '='), (34, 27, 33, '='), (31, 36, 42, '='), (28, 27, 33, '='), (25, 18, 24, '='),
            (22, 9, 15, '='), (19, 18, 24, '='), (16, 27, 33, '='), (13, 36, 42, '='), (10, 43, 50, '#')]
    for f, c0, c1, ch in tang:
        p.doan(ch, c0, c1, f)
    p.doan('R', 37, 40, 31); p.doan('R', 19, 22, 19)   # 2 tầng có cầu gỗ mục 4 ô
    p.them_neo('R210-neo-cau', 35, 29, [(37, 31), (38, 31), (39, 31), (40, 31)])
    p.o('L', (44, 7), (44, 8), (44, 9))         # chốt rễ trước cửa ra
    p.them_neo('R210-neo-chot', 42, 8, [(44, 7), (44, 8), (44, 9)])
    # hốc tuỳ chọn trên-trái: 3 bệ mục 2 ô + giếng bật tường → Memory Shard (không bắt buộc)
    p.dac(1, 2, 8, 4); p.dac(1, 9, 6, 9)
    p.doan('R', 9, 10, 12); p.doan('R', 4, 5, 15); p.doan('R', 1, 2, 18)
    p.v('R210-manh-ky-uc', 'manh_ky_uc', 3, 8)
    p.them_cua('R210-tay', 'trai', 38, 'R209', 'R209-dong')
    p.them_cua('R210-dong', 'phai', 7, 'R211', 'R211-tay')
    p.dau('loi_chinh', 48, 9)
    L(p, 25, 30, 12, 20, 33, 12, 46, 4)
    return p


# ============================================================ R211 Guardian's Cradle 56×24 – tinh anh Nursery Warden; giữa chắc 24 ô, 2 dải mục 3 ô ở cánh, 2 gờ cao
def R211():
    p = Phong('R211', "Guardian's Cradle", 56, 24)
    p.nen(2, (0, 12, 18), (13, 15, 19), (16, 39, 18), (40, 42, 19), (43, 55, 18))
    p.doan('R', 13, 15, 18); p.doan('R', 40, 42, 18)
    p.dac(8, 14, 12, 14); p.dac(43, 14, 47, 14)   # 2 gờ cao chắc (nhảy đôi)
    p.san(8, 10, 10, '=')
    p.dac(0, 7, 6, 7)
    p.them_cua('R211-tay-tren', 'trai', 4, 'R208', 'R208-dong-tren')
    p.them_cua('R211-tay', 'trai', 15, 'R210', 'R210-dong')
    p.them_cua('R211-dong', 'phai', 15, 'R212', 'R212-tay')
    p.tinh_anh = True
    p.q('warden', 28, 17, 18, 37)
    p.v('R211-nut-warden', 'nut_warden', 30, 17)
    L(p, 10, 6, 28, 5, 46, 6)
    return p


# ============================================================ R212 Last Dry Root 34×18 – Chuông Lưu S3 trước trùm, không quái
def R212():
    p = Phong('R212', 'Last Dry Root', 34, 18)
    p.nen(3, (0, 33, 14))
    p.them_cua('R212-tay', 'trai', 11, 'R211', 'R211-dong')
    p.them_cua('R212-dong', 'phai', 11, 'R213', 'R213-tay')
    p.chuong_luu = dict(cot=16, hang=13)
    p.trang_tri('R212-moc', 'coc_re_khac', 24, 13, ghi='cọc rễ khắc dấu – lời dặn trước trùm')
    L(p, 16, 6, 8, 8)
    return p


# ============================================================ R213 Moldheart Chamber 72×26 – trùm Mold Mother; 2 đảo chắc 6 ô, 3 cụm mục 3 ô, 2 gờ cao, 2 nút neo; hầm rễ sau trùm
def R213():
    p = Phong('R213', 'Moldheart Chamber', 72, 26)
    p.nen(2, (0, 28, 21), (29, 31, 23), (32, 33, 21), (34, 36, 23), (37, 38, 21), (39, 41, 23), (42, 71, 21))
    for c0 in (29, 34, 39):
        p.doan('R', c0, c0 + 2, 21)
    p.them_neo('R213-neo-1', 32, 19, [(29, 21), (30, 21), (31, 21)])
    p.them_neo('R213-neo-2', 42, 19, [(39, 21), (40, 21), (41, 21)])
    p.san(30, 33, 17, '='); p.san(37, 40, 17, '=')   # 2 gờ cao (nhảy đôi)
    p.dac(51, 2, 71, 16)
    p.them_cong('R213-ham-sau-trum', 're_dan', [(50, 18), (50, 19), (50, 20)], 'trum', 'hầm rễ sau trùm – mở khi hạ Mold Mother')
    p.trang_tri('R213-cong-ve-lang', 'cong_ve_lang', 66, 20, ghi='hầm rễ về Làng Chuông + lối sang Vùng 3 (mở sau trùm)')
    p.them_cua('R213-tay', 'trai', 18, 'R212', 'R212-dong')
    p.trum = True
    p.trum_o = dict(cot=36, hang=12)
    L(p, 24, 8, 47, 8)
    return p


TAT_CA = [R201, R202, R203, R204, R205, R206, R207, R208, R209, R210, R211, R212, R213, RS201, RS202, RS203]


CAY_KHUNG = ['R201-dong', 'R202-dong', 'R203-dong', 'R204-dong', 'R205-dong', 'R206-dong', 'R207-dong', 'R208-dong',
             'R209-dong', 'R210-dong', 'R211-dong', 'R212-dong', 'R203-tren', 'R206-tren', 'R209-tren-phai']


def dat_vi_tri(phong):
    """tính x_o, y_o theo cửa tuyến chính + phòng bí mật (cây khung); lối tắt là hầm rễ dài, có thể lệch"""
    by = {p.id: p for p in phong}
    pos = {'R201': (0, 0)}
    for cid in CAY_KHUNG:
        a = by[cid.split('-')[0]]
        c = next(x for x in a.cua if x['id'] == cid)
        ax, ay = pos[a.id]
        b = by[c['toi']]
        x = next(x for x in b.cua if x['id'] == c['toi_cua'])
        if c['huong'] in ('trai', 'phai'):
            pos[b.id] = (ax + c['cot'] + (1 if c['huong'] == 'phai' else -1) - x['cot'], ay + c['hang'] - x['hang'])
        else:
            pos[b.id] = (ax + c['cot'] - x['cot'], ay + c['hang'] + (1 if c['huong'] == 'duoi' else -1) - x['hang'])
    mx = min(x for x, y in pos.values()); my = min(y for x, y in pos.values())
    for p in phong:
        p.wx, p.wy = pos[p.id][0] - mx, pos[p.id][1] - my


def main():
    phong = [f() for f in TAT_CA]
    dat_vi_tri(phong)
    os.makedirs(os.path.join(GOC, 'phong'), exist_ok=True)
    for p in phong:
        with open(os.path.join(GOC, 'phong', p.id + '.json'), 'w', encoding='utf-8') as f:
            f.write(V1.json_dep(p.json()))
    ket_noi = []
    for p in phong:
        for c in p.cua:
            k = sorted([c['id'], c['toi_cua']])
            if k not in ket_noi:
                ket_noi.append(k)
    bd = dict(phien_ban=1, vung='vung-2', ten='Rotting Roots', phong_dau='R201', bat_dau=dict(phong='R201', cot=4, hang=16),
              don_vi='x,y,rong,cao_bd: đơn vị bản đồ nhỏ = 10 ô phòng; x_o,y_o,w,h: vị trí/cỡ thật trên bản đồ thế giới tính bằng ô phòng (48px)',
              phong=[dict(id=p.id, ten=p.ten, x=p.wx / 10, y=p.wy / 10, rong=p.C / 10, cao_bd=p.R / 10, x_o=p.wx, y_o=p.wy, w=p.C, h=p.R,
                          chuong_luu=bool(p.chuong_luu), trum=p.trum, tinh_anh=p.tinh_anh) for p in phong],
              ket_noi=[dict(a=k[0], b=k[1]) for k in ket_noi],
              ghi_chu='Kế hoạch ChatGPT docs/vung-2/ke-hoach-chatgpt.txt. Lối tắt (R203↔R205, R206↔R209, R208↔R211, R205↔R208) là hầm rễ dài – có thể lệch toạ độ.')
    with open(os.path.join(GOC, 'ban-do.json'), 'w', encoding='utf-8') as f:
        f.write(V1.json_dep(bd))
    print('Đã ghi', len(phong), 'phòng Vùng 2.')


if __name__ == '__main__':
    main()
