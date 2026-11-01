# -*- coding: utf-8 -*-
"""dung-phong.py – LUỒNG B dựng 9 phòng Đợt 1 Vùng 1 "Ruột Cây Than Khóc" bằng lệnh khoét (carve).
Chạy:  python3 dung-phong.py   → ghi game/vung-1/phong/P*.json + game/vung-1/ban-do.json
Định dạng theo game/vung-1/DINH-DANG-PHONG.md (luồng A). Quy ước hàng/cột:
  - quái / vật phẩm / chuông lưu / bat_dau: "hang" = ô TRỐNG nhân vật/quái đứng trong (chân ở đáy ô, ô dưới là sàn).
  - Màn Tang (tang): hang = ô ngay dưới trần.
Tầm nhảy đo từ engine (fiz.py): nhảy thường cao ~2.6 ô / xa ~4 ô; nhảy đôi cao ~4.7 ô / xa ~7.5 ô.
Luật tuyến chính: bậc ≤2 ô (nhảy thường) hoặc ≤4 ô (nhảy đôi), không cần bám/bật tường, không cần lướt.
"""
import json, math, os

GOC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')


class Phong:
    def __init__(self, pid, ten, cot, hang, wx, wy):
        self.id, self.ten, self.C, self.R = pid, ten, cot, hang
        self.wx, self.wy = wx, wy          # vị trí trên bản đồ thế giới (ô)
        self.g = [['#'] * cot for _ in range(hang)]
        self.cua, self.quai, self.vp, self.den, self.tt = [], [], [], [], []
        self.chuong_luu = None
        self.tinh_anh = self.trum = False
        self.khoa = None
        self.bat_dau = None
        self.ghi_chu = ''

    # ---- khoét / đắp ----
    def set(self, c, r, ch):
        if 0 <= c < self.C and 0 <= r < self.R:
            self.g[r][c] = ch

    def hop(self, c0, r0, c1, r1, ch='.'):
        for r in range(min(r0, r1), max(r0, r1) + 1):
            for c in range(min(c0, c1), max(c0, c1) + 1):
                self.set(c, r, ch)

    def dac(self, c0, r0, c1, r1):
        self.hop(c0, r0, c1, r1, '#')

    def bau(self, cx, cy, rx, ry, ch='.'):
        """khoang tròn / bầu dục"""
        for r in range(int(cy - ry) - 1, int(cy + ry) + 2):
            for c in range(int(cx - rx) - 1, int(cx + rx) + 2):
                if ((c - cx) / rx) ** 2 + ((r - cy) / ry) ** 2 <= 1.0:
                    self.set(c, r, ch)

    def ham(self, pts, ban_kinh, ch='.'):
        """đường hầm cong: rải đĩa dọc theo đường gấp khúc"""
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            n = int(max(abs(x1 - x0), abs(y1 - y0)) * 3) + 1
            for i in range(n + 1):
                t = i / n
                self.bau(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, ban_kinh, ban_kinh, ch)

    def san(self, c0, c1, r, ch='#'):
        self.hop(c0, r, c1, r, ch)

    def day(self, c, r0, r1):
        for r in range(r0, r1 + 1):
            if self.g[r][c] in '.H':
                self.g[r][c] = 'H'
            else:
                self.g[r][c] = 'H'

    # ---- đối tượng ----
    def them_cua(self, cid, huong, vi_tri, toi, toi_cua, cao=3, sau=4):
        if huong in ('trai', 'phai'):
            c = 0 if huong == 'trai' else self.C - 1
            self.cua.append(dict(id=cid, cot=c, hang=vi_tri, cao=cao, huong=huong, toi=toi, toi_cua=toi_cua))
            cs = range(0, sau) if huong == 'trai' else range(self.C - sau, self.C)
            for cc in cs:
                for r in range(vi_tri, vi_tri + cao):
                    if self.g[r][cc] != 'H':
                        self.g[r][cc] = '.'
                self.g[vi_tri + cao][cc] = '#'
        else:
            r = 0 if huong == 'tren' else self.R - 1
            self.cua.append(dict(id=cid, cot=vi_tri, hang=r, cao=cao, huong=huong, toi=toi, toi_cua=toi_cua))
            rs = range(0, sau) if huong == 'tren' else range(self.R - sau, self.R)
            for rr in rs:
                for c in range(vi_tri, vi_tri + cao):
                    if self.g[rr][c] != 'H':
                        self.g[rr][c] = '.'

    def q(self, loai, c, r, tu=None, den=None, cao=None):
        d = dict(loai=loai, cot=c, hang=r)
        if tu is not None:
            d['tu'], d['den'] = tu, den
        if cao is not None:
            d['cao'] = cao
        self.quai.append(d)

    def v(self, vid, loai, c, r, so=None):
        d = dict(id=vid, loai=loai, cot=c, hang=r)
        if so is not None:
            d['so'] = so
        self.vp.append(d)

    def trang_tri(self, tid, loai, c, r, **k):
        d = dict(id=tid, loai=loai, cot=c, hang=r); d.update(k)
        self.tt.append(d)

    def bit_mep(self):
        """bịt kín mép phòng trừ ô cửa"""
        mo = set()
        for c in self.cua:
            for i in range(c['cao']):
                mo.add((c['cot'], c['hang'] + i) if c['huong'] in ('trai', 'phai') else (c['cot'] + i, c['hang']))
        for r in range(self.R):
            for cc in range(self.C):
                if (r in (0, self.R - 1) or cc in (0, self.C - 1)) and (cc, r) not in mo:
                    self.g[r][cc] = '#'

    def json(self):
        self.bit_mep()
        d = dict(id=self.id, ten=self.ten, luoi=[''.join(r) for r in self.g], cua=self.cua, quai=self.quai,
                 vat_pham=self.vp, chuong_luu=self.chuong_luu, den=self.den, tinh_anh=self.tinh_anh, trum=self.trum)
        if self.khoa:
            d['khoa'] = self.khoa
        if self.bat_dau:
            d['bat_dau'] = self.bat_dau
        if self.tt:
            d['trang_tri'] = self.tt
        if self.ghi_chu:
            d['ghi_chu'] = self.ghi_chu
        return d


def L(p, *cr):
    for c, r in cr:
        p.den.append(dict(cot=c, hang=r))


# =====================================================================================================
# P01 CỬA RỄ – 48×20 – phòng hướng dẫn: đi, nhảy bậc, chui hầm thấp, nhảy qua hố, (tuỳ) nhảy đôi, dây leo.
def P01():
    p = Phong('P01', 'Cửa Rễ', 48, 20, 0, 10)
    p.bau(6, 11, 6, 6)                          # khoang cổng rễ
    p.hop(1, 9, 9, 15)
    p.san(0, 10, 16)                            # sàn xuất phát (đứng hàng 15)
    p.hop(10, 10, 16, 14)                       # bậc gốc rễ: sàn hàng 15 (đứng 14)
    p.ham([(12, 11), (16, 12)], 2.2)
    p.dac(0, 16, 47, 19)
    p.dac(10, 15, 22, 15)
    p.hop(16, 12, 22, 14)                       # hầm thấp 3 ô
    p.dac(16, 0, 22, 11)
    p.hop(22, 13, 26, 17)                       # hố tro (sâu 2, rộng 4) – rơi xuống vẫn leo lên được
    p.dac(22, 18, 26, 19)
    p.bau(34, 9, 9, 6.5)                        # hang có Khuyết Cẩu
    p.hop(26, 9, 42, 14)
    p.dac(27, 15, 47, 15)
    p.san(29, 33, 11, '=')                      # gờ mỏng cao 4 ô – nhảy đôi (tuỳ chọn)
    p.hop(36, 3, 44, 14)                        # giếng có dây leo
    p.bau(40, 5, 5, 3)
    p.dac(36, 6, 38, 7)
    p.san(39, 44, 6)                            # hốc trên: đứng hàng 5
    p.hop(40, 2, 46, 5)
    p.dac(45, 6, 47, 14)
    p.hop(42, 7, 47, 14)
    p.day(41, 6, 14)
    p.dac(41, 6, 41, 6); p.set(41, 6, 'H')
    p.them_cua('P01-dong', 'phai', 12, 'P02', 'P02-tay')
    p.bat_dau = dict(cot=4, hang=15)
    p.q('cau', 34, 14, 28, 40)
    p.v('P01-manh-1', 'manh_am', 31, 10, 15)
    p.v('P01-manh-2', 'manh_am', 44, 5, 20)
    p.v('P01-manh-3', 'manh_am', 24, 17, 5)
    p.trang_tri('P01-cong-re', 'cong_re', 2, 15, ghi='cổng rễ lớn sau lưng nhân vật lúc bắt đầu')
    p.trang_tri('P01-dau-lau-1', 'dau_lau', 8, 15)
    p.trang_tri('P01-bien-nhay', 'goi_y_phim', 11, 13, ghi='gợi ý: Nhảy')
    p.trang_tri('P01-bien-day', 'goi_y_phim', 40, 13, ghi='gợi ý: ↑ bám dây')
    L(p, (5, 8), (19, 12), (34, 4), (43, 3))
    p.ghi_chu = 'Hướng dẫn: đi → nhảy bậc → chui hầm thấp → nhảy hố → Khuyết Cẩu → (tuỳ) nhảy đôi lên gờ, leo dây lên hốc trên.'
    return p


# =====================================================================================================
# P02 NGÃ BA MỐI – 60×34 – khoang tròn lớn nhiều tầng, 3 lối: tây (P01), đông-trên (P03), đáy (lối tắt P06 sau tường nứt).
def P02():
    p = Phong('P02', 'Ngã Ba Mối', 60, 34, 48, 0)
    p.bau(30, 16, 24, 13)                       # khoang mối chính
    p.ham([(2, 23), (10, 22), (14, 20)], 2)     # hầm vào từ tây
    p.dac(0, 25, 59, 33)                        # sàn chính hàng 25 (đứng 24)
    p.hop(1, 22, 44, 24)
    # tầng giữa
    p.san(14, 20, 21)                           # gờ trái thấp (đứng 20)
    p.san(24, 31, 18, '=')                      # sàn mỏng giữa (đứng 17)
    p.san(34, 41, 16)                           # gờ (đứng 15)
    p.san(15, 20, 15, '=')                      # (đứng 14)
    p.san(6, 11, 13)                            # gờ trái cao (đứng 12) – thẻ tên
    p.hop(44, 18, 50, 24)
    p.san(43, 49, 21)                           # gờ (đứng 20)
    # tầng trên + lối đông
    p.ham([(46, 9), (52, 8), (58, 9)], 2)
    p.hop(48, 6, 59, 10)
    p.dac(48, 11, 59, 13)
    p.san(40, 46, 12)                           # gờ trước dây (đứng 11)
    p.hop(50, 14, 52, 24)
    p.day(51, 5, 24)
    p.dac(53, 11, 59, 24)
    p.dac(45, 22, 49, 24); p.hop(45, 22, 49, 24)
    # lối tắt P06: hốc dưới sàn, ngăn bởi tường nứt
    p.hop(3, 27, 21, 29)                        # khoang dưới (đứng 29)
    p.dac(3, 30, 21, 33)
    p.hop(17, 25, 19, 26)                       # lỗ xuống từ sàn chính
    p.day(18, 25, 29)
    p.hop(13, 27, 13, 29, 'N')                  # tường nứt (vỡ được từ hai phía)
    p.hop(8, 30, 10, 33)                        # giếng xuống P06
    p.day(9, 27, 33)
    p.them_cua('P02-tay', 'trai', 22, 'P01', 'P01-dong')
    p.them_cua('P02-dong', 'phai', 7, 'P03', 'P03-tay')
    p.them_cua('P02-day', 'duoi', 8, 'P06', 'P06-tren')
    p.q('cau', 26, 24, 20, 40)
    p.q('cau', 36, 24, 30, 43)
    p.q('bo', 38, 15, 34, 41)
    p.v('P02-the-ten', 'the_ten', 10, 12)
    p.v('P02-manh-1', 'manh_am', 18, 14, 15)
    p.v('P02-manh-2', 'manh_am', 5, 29, 25)
    p.trang_tri('P02-tuong-nut', 'tuong_nut', 13, 27, cao=3, ghi='vết nứt + bụi rơi; sau là giếng dây xuống Hố Vỏ')
    p.trang_tri('P02-to-moi', 'to_moi', 30, 8, ghi='cột tổ mối treo trần')
    p.trang_tri('P02-dau-lau', 'dau_lau', 44, 20)
    L(p, (12, 19), (30, 6), (46, 10), (6, 28))
    p.ghi_chu = 'Ngã ba: tây ← P01, đông-trên → P03 (leo dây cột 51), đáy → P06 (lối tắt, sau tường nứt cột 13).'
    return p


# =====================================================================================================
# P03 XƯỞNG CHUÔNG – 70×30 – xưởng đúc chuông: hành lang trên → sảnh tròn; Chuông Vỡ 1 trên giàn cao; H1 sau tường nứt.
def P03():
    p = Phong('P03', 'Xưởng Chuông', 70, 30, 108, 0)
    p.hop(0, 7, 20, 10)                         # hành lang trên (đứng 10)
    p.dac(0, 11, 20, 13)
    p.ham([(4, 8), (18, 8)], 1.6)
    p.bau(36, 16, 18, 12)                       # sảnh chuông
    p.dac(16, 25, 60, 29)                       # nền sảnh hàng 25 (đứng 24)
    p.hop(20, 11, 24, 24)
    p.san(19, 22, 14)                           # bậc xuống từ hành lang (đứng 13)
    p.san(23, 26, 17)                           # (đứng 16)
    p.san(19, 22, 20)                           # (đứng 19)
    p.san(27, 33, 21, '=')                      # (đứng 20)
    # giàn treo chuông giữa sảnh
    p.dac(34, 13, 38, 13)                       # giàn (đứng 12) – Chuông Vỡ 1
    p.day(42, 9, 24)                            # dây treo chuông
    p.san(43, 47, 10)                           # gờ đỉnh dây (đứng 9)
    p.san(39, 41, 16, '=')
    p.san(46, 51, 18)                           # (đứng 17)
    # H1: hốc sau tường nứt phía tây dưới
    p.ham([(17, 22), (20, 23)], 1.5)
    p.hop(15, 22, 19, 24)
    p.hop(14, 22, 14, 24, 'N')
    p.hop(4, 21, 13, 24)
    p.bau(8, 21, 5, 3)
    p.dac(3, 25, 15, 26)
    # phía đông → giếng xuống P04
    p.ham([(52, 22), (58, 20), (60, 23)], 2)
    p.hop(52, 20, 62, 24)
    p.dac(53, 25, 69, 29)
    p.hop(56, 25, 58, 29)
    p.day(57, 21, 29)
    p.dac(59, 0, 69, 19)
    p.hop(59, 12, 61, 19)                       # ống khói bí mật (nhảy đôi qua 2 mấu / bật tường)
    p.san(60, 61, 21, '=')                      # mấu 1 (đứng 20)
    p.san(59, 60, 17, '=')                      # mấu 2 (đứng 16)
    p.hop(62, 12, 67, 14)                       # hốc Mảnh Âm (đứng 14)
    p.dac(62, 15, 69, 19)
    p.dac(63, 20, 69, 24)
    p.dac(52, 20, 52, 21)
    p.them_cua('P03-tay', 'trai', 7, 'P02', 'P02-dong')
    p.them_cua('P03-day', 'duoi', 56, 'P04', 'P04-tren')
    p.q('phu', 10, 10, 4, 18)
    p.q('bo', 30, 24, 25, 40)
    p.q('bo', 47, 24, 43, 49)
    p.v('P03-chuong', 'chuong_vo', 36, 12)
    p.v('P03-the-ten-H1', 'the_ten', 6, 24)
    p.v('P03-manh-H1', 'manh_am', 9, 24, 40)
    p.v('P03-manh-1', 'manh_am', 45, 9, 15)
    p.v('P03-manh-2', 'manh_am', 66, 14, 30)
    p.trang_tri('P03-tuong-nut-H1', 'tuong_nut', 14, 22, cao=3, ghi='vết nứt rõ, chuông nhỏ lệch nhịp phía sau')
    p.trang_tri('P03-hai-cot-H1', 'hai_cot', 8, 24, ghi='hài cốt dân làng ôm chuông (nhiệm vụ D đợt sau)')
    p.trang_tri('P03-lo-duc', 'lo_duc_chuong', 30, 24, ghi='lò đúc chuông nguội, khuôn vỡ')
    p.trang_tri('P03-gian-chuong', 'gian_treo_chuong', 36, 12, ghi='giàn gỗ treo Chuông Vỡ 1, chuông đồng lớn treo trên dây cột 42')
    p.trang_tri('P03-dau-lau', 'dau_lau', 18, 13)
    L(p, (8, 8), (36, 6), (44, 8), (8, 22), (57, 21))
    p.ghi_chu = 'Hành lang trên → sảnh chuông. Chuông Vỡ 1 trên giàn (36,12): leo dây cột 42 rồi nhảy sang. H1 sau tường nứt cột 14.'
    return p


# =====================================================================================================
# P04 HÀNH LANG TRO – 90×18 – hành lang cong dài đầy khói tro, đi về TÂY; nhánh đông cụt có giếng bật tường → Tăng Máu.
def P04():
    p = Phong('P04', 'Hành Lang Tro', 90, 18, 108, 30)
    p.hop(55, 0, 59, 12)                        # giếng rơi từ P03
    p.day(57, 0, 12)
    p.dac(0, 13, 89, 17)                        # nền
    # hành lang uốn lượn về tây
    p.ham([(56, 11), (48, 10), (40, 11), (32, 9), (24, 10), (14, 11), (4, 11)], 1.7)
    p.hop(2, 10, 58, 12)
    p.dac(44, 12, 47, 12)                       # bậc nhỏ
    p.dac(28, 11, 34, 12)                       # gò tro (đứng 10)
    p.hop(36, 13, 39, 14); p.dac(36, 15, 39, 17)  # hố tro nông
    p.hop(19, 7, 25, 9)                         # vòm trần cao
    p.san(20, 23, 8, '=')
    p.hop(19, 5, 25, 7)                         # hốc thẻ tên trên vòm (đứng 7)
    p.dac(18, 4, 26, 4)
    # nhánh đông: hành lang → giếng bật tường
    p.ham([(60, 11), (70, 10), (78, 11)], 1.6)
    p.hop(60, 10, 84, 12)
    p.hop(80, 2, 83, 12)                        # giếng hẹp 4 ô (bật tường)
    p.hop(84, 2, 88, 5)                         # hốc Tăng Máu (đứng 5)
    p.dac(84, 6, 89, 17)
    p.san(80, 81, 9)                            # mấu nhỏ giữa giếng
    p.them_cua('P04-tren', 'tren', 56, 'P03', 'P03-day')
    p.them_cua('P04-tay', 'trai', 10, 'P05', 'P05-dong')
    p.q('phu', 51, 12, 48, 56)
    p.q('cau', 16, 12, 6, 26)
    p.q('phu', 70, 12, 64, 78)
    p.v('P04-the-ten', 'the_ten', 22, 7)
    p.v('P04-tang-mau', 'tang_mau', 86, 5)
    p.v('P04-manh-1', 'manh_am', 38, 14, 10)
    p.v('P04-manh-2', 'manh_am', 31, 10, 10)
    p.trang_tri('P04-khoi', 'khoi_tro', 0, 0, rong=60, ghi='khói tro mờ toàn hành lang cột 0–60 (luồng A làm lớp phủ)')
    p.trang_tri('P04-dau-lau', 'dau_lau', 66, 12)
    p.trang_tri('P04-dau-hieu', 'bui_roi', 82, 2, ghi='bụi rơi gợi ý giếng phía trên có đồ')
    L(p, (57, 6), (40, 9), (22, 6), (8, 10), (75, 9))
    p.ghi_chu = 'Rơi xuống từ P03 ở cột 57, đi TÂY tới P05. Nhánh ĐÔNG cụt: giếng hẹp cột 80–83 cần bật tường/nhảy đôi → Tăng Máu.'
    return p


# =====================================================================================================
# P05 CHUÔNG LƯU – 32×16 – khoang tròn nhỏ yên tĩnh, Chuông Lưu + xác người ngồi.
def P05():
    p = Phong('P05', 'Chuông Lưu', 32, 16, 76, 34)
    p.bau(16, 8, 13, 6.5)
    p.dac(0, 13, 31, 15)
    p.hop(4, 10, 27, 12)
    p.hop(26, 6, 31, 8); p.dac(26, 9, 31, 12)    # bậc vào từ đông (đứng 8)
    p.dac(22, 11, 25, 12)                       # bậc trung gian (đứng 10)
    p.them_cua('P05-dong', 'phai', 6, 'P04', 'P04-tay')
    p.them_cua('P05-tay', 'trai', 10, 'P06', 'P06-dong')
    p.chuong_luu = dict(cot=15, hang=12)
    p.trang_tri('P05-xac', 'xac_nguoi_ngoi', 13, 12, ghi='xác người ngồi tựa cạnh chuông')
    p.trang_tri('P05-chuong-luu', 'chuong_luu', 15, 12, ghi='Chuông Lưu: tắt / sáng')
    L(p, (15, 4), (8, 8), (24, 7))
    p.ghi_chu = 'Checkpoint đầu tiên. Không quái.'
    return p


# =====================================================================================================
# P06 HỐ VỎ – 50×36 – hố sâu, đấu trường nhỏ dưới đáy (Chuông Vỡ 2), dây leo giữa hố lên lối tắt P02.
def P06():
    p = Phong('P06', 'Hố Vỏ', 50, 36, 26, 34)
    p.bau(25, 22, 22, 13)                       # lòng hố
    p.hop(36, 9, 49, 12)                        # gờ vào từ P05 (đứng 12)
    p.dac(36, 13, 49, 14)
    p.ham([(40, 11), (44, 11)], 1.6)
    p.dac(0, 33, 49, 35)                        # đáy đấu trường hàng 33 (đứng 32)
    p.hop(4, 28, 46, 32)
    # bậc xuống phía đông
    p.san(33, 36, 15)                           # (đứng 14)
    p.san(38, 42, 18)                           # (đứng 17)
    p.san(32, 35, 21, '=')                      # (đứng 20)
    p.san(39, 44, 24)                           # (đứng 23)
    p.san(35, 38, 27, '=')                      # (đứng 26)
    p.san(41, 45, 30)                           # (đứng 29)
    # phía tây: bậc leo + gờ cao
    p.san(5, 10, 29)                            # (đứng 28)
    p.san(8, 13, 25, '=')                       # (đứng 24)
    p.san(4, 8, 21)                             # (đứng 20) – Mảnh Âm
    p.san(13, 19, 22, '=')
    # dây giữa hố lên lối tắt
    p.hop(29, 0, 33, 10)
    p.day(31, 0, 30)
    p.san(26, 29, 12)                           # gờ nghỉ cạnh dây (đứng 11)
    p.san(20, 25, 16, '=')
    # lối ra đông dưới → P09
    p.hop(44, 29, 49, 32)
    p.dac(44, 28, 49, 28)
    p.them_cua('P06-dong', 'phai', 10, 'P05', 'P05-tay')
    p.them_cua('P06-tren', 'tren', 30, 'P02', 'P02-day')
    p.them_cua('P06-dong-duoi', 'phai', 30, 'P09', 'P09-tay')
    p.q('bo', 15, 32, 6, 22)
    p.q('bo', 34, 32, 26, 42)
    p.q('cau', 24, 32, 10, 40)
    p.q('cau', 40, 17, 38, 42)
    p.v('P06-chuong', 'chuong_vo', 25, 32)
    p.v('P06-manh-1', 'manh_am', 6, 20, 25)
    p.v('P06-manh-2', 'manh_am', 27, 11, 10)
    p.trang_tri('P06-be-chuong', 'be_da_chuong', 25, 32, ghi='bệ đá giữa đấu trường, Chuông Vỡ 2 hiện sau khi hạ hết quái (gợi ý cho luồng A)')
    p.trang_tri('P06-vo-bo', 'vo_bo_khong_lo', 8, 32, ghi='vỏ bọ khổng lồ bỏ lại')
    p.trang_tri('P06-dau-lau', 'dau_lau', 42, 32)
    L(p, (25, 12), (10, 24), (40, 22), (31, 3))
    p.ghi_chu = 'Vào từ gờ đông (P05), bậc zig-zag xuống đáy. Đáy: đấu trường 2 Bọ Vỏ + Khuyết Cẩu, Chuông Vỡ 2 giữa. Dây cột 31 lên lối tắt P02. Ra P09 ở đông-dưới.'
    return p


# =====================================================================================================
# P09 MIỆNG KÈN – 44×44 – giếng đứng nhiều tầng: Kèn Câm thổi ngang từng tầng; đáy giếng có Chuông Vỡ 3.
def P09():
    p = Phong('P09', 'Miệng Kèn', 44, 44, 76, 50)
    p.bau(22, 9, 19, 8.5)                       # phần trên: miệng kèn loe
    p.hop(3, 5, 40, 16)
    p.dac(0, 17, 43, 18)                        # sàn tầng vào (đứng 16)
    p.hop(0, 14, 6, 16)
    # các tầng zig-zag (né sóng âm theo tầng) – mỗi bậc lên 2 ô
    p.dac(30, 15, 38, 16)                       # T1 phải (đứng 14) – Kèn Câm thổi trái dọc tầng dưới
    p.san(22, 27, 13, '=')                      # T2 giữa (đứng 12)
    p.san(8, 16, 11)                            # T3 trái (đứng 10) – Kèn Câm thổi phải
    p.san(17, 21, 9, '=')                       # T4 (đứng 8)
    p.san(26, 32, 7)                            # T5 (đứng 6)
    p.san(4, 8, 7)                              # hốc trái cao (đứng 6) – thẻ tên (nhảy đôi từ T3)
    p.hop(28, 1, 43, 4)
    p.dac(34, 5, 43, 6)                         # gờ ra đông (đứng 4) – Kèn Câm thổi trái
    p.dac(39, 7, 43, 16)
    # giếng xuống đáy
    p.hop(17, 17, 21, 18)                       # miệng giếng giữa sàn tầng vào
    p.ham([(19, 19), (16, 24), (22, 29), (18, 34)], 2.2)
    p.bau(22, 38, 14, 4.5)                      # khoang đáy
    p.dac(0, 41, 43, 43)                        # đáy (đứng 40)
    p.day(19, 17, 38)
    p.san(12, 15, 37, '=')
    p.san(29, 33, 37, '=')
    p.them_cua('P09-tay', 'trai', 14, 'P06', 'P06-dong-duoi')
    p.them_cua('P09-dong', 'phai', 2, 'P11', 'P11-tay')
    p.q('ken', 37, 14, 31, 38)
    p.q('ken', 9, 10, 8, 14)
    p.q('phu', 10, 16, 2, 15)
    p.q('ken', 40, 4, 36, 42)
    p.q('phu', 28, 40, 12, 34)
    p.v('P09-chuong', 'chuong_vo', 31, 36)
    p.v('P09-the-ten', 'the_ten', 5, 6)
    p.v('P09-manh-1', 'manh_am', 13, 36, 20)
    p.v('P09-manh-2', 'manh_am', 19, 8, 15)
    p.trang_tri('P09-mieng-ken', 'mieng_ken_da', 22, 1, ghi='miệng kèn đá khổng lồ trên trần, vân sóng âm')
    p.trang_tri('P09-dau-lau', 'dau_lau', 10, 40)
    L(p, (22, 2), (6, 4), (36, 10), (14, 13), (22, 33))
    p.ghi_chu = 'Vào tầng giữa (đứng 16). Xuống giếng dây cột 19 tới đáy lấy Chuông Vỡ 3, leo lại. Leo các tầng zig-zag (Kèn Câm thổi ngang ở T2 phải/T2 trái/gờ ra) → cửa đông trên → P11.'
    return p


# =====================================================================================================
# P11 SẢNH CHUÔNG VỠ – 56×24 – sảnh tinh anh Vọng Tàn; hốc đông có Chuông Lưu cuối + cửa trùm (khoá 3 Chuông Vỡ).
def P11():
    p = Phong('P11', 'Sảnh Chuông Vỡ', 56, 24, 120, 48)
    p.bau(27, 13, 21, 9.5)                      # sảnh
    p.dac(0, 19, 55, 23)                        # nền (đứng 18)
    p.hop(5, 8, 47, 18)
    p.hop(0, 4, 13, 6)                          # gờ vào (đứng 6)
    p.dac(0, 7, 10, 18)
    p.dac(11, 9, 12, 18)                        # bậc rễ xuống (đứng 8, 10, 12, 14)
    p.dac(13, 11, 14, 18)
    p.dac(15, 13, 16, 18)
    p.dac(17, 15, 18, 18)
    p.san(21, 26, 13, '=')                      # sàn mỏng đấu (đứng 12)
    p.san(33, 38, 13, '=')
    p.hop(46, 15, 55, 18)                       # hốc Chuông Lưu + cửa trùm
    p.dac(46, 8, 55, 14)
    p.them_cua('P11-tay', 'trai', 4, 'P09', 'P09-dong')
    p.them_cua('P11-dong', 'phai', 16, 'P12', 'P12-tay')
    p.tinh_anh = True
    p.khoa = dict(cua='P11-dong', can='chuong_vo', so=3)
    p.q('tan', 30, 18, 20, 44)
    p.chuong_luu = dict(cot=50, hang=18)
    p.v('P11-manh-1', 'manh_am', 35, 12, 30)
    p.trang_tri('P11-chuong-vo-lon', 'chuong_vo_lon', 27, 18, ghi='chuông đồng vỡ đôi làm nền đấu trường')
    p.trang_tri('P11-cua-trum', 'cua_trum_3_chuong', 55, 16, cao=3, ghi='cửa rễ có 3 hốc chuông, sáng dần theo số Chuông Vỡ')
    p.trang_tri('P11-chuong-luu', 'chuong_luu', 50, 18)
    L(p, (27, 5), (12, 10), (42, 10), (50, 16))
    p.ghi_chu = 'Tinh anh Vọng Tàn giữa sảnh (khoá cửa khi đánh). Chuông Lưu cuối ở hốc đông. Cửa đông → P12 cần 3 Chuông Vỡ.'
    return p


# =====================================================================================================
# P12 ĐÀN CHUÔNG CÂM – 64×22 – phòng trùm rộng, sàn phẳng, vòm cao, 2 sàn mỏng né.
def P12():
    p = Phong('P12', 'Đàn Chuông Câm', 64, 22, 176, 50)
    p.bau(32, 9, 30, 11)
    p.hop(2, 3, 61, 16)
    p.dac(0, 17, 63, 21)                        # sàn phẳng (đứng 16)
    p.san(12, 17, 12, '=')
    p.san(46, 51, 12, '=')
    p.them_cua('P12-tay', 'trai', 14, 'P11', 'P11-dong')
    p.trum = True
    p.trum_o = dict(cot=40, hang=16)
    p.trang_tri('P12-tuong-me', 'tuong_mau_chuong', 40, 16, ghi='vị trí trùm Mẫu Chuông Rỗng')
    p.trang_tri('P12-ong-chuong', 'ong_chuong_cam', 32, 2, ghi='dàn ống chuông câm treo trần (nền)')
    L(p, (10, 6), (32, 4), (54, 6))
    p.ghi_chu = 'Phòng trùm: sàn phẳng cột 1–62 hàng đứng 16; trùm sinh ở (40,16).'
    return p


TAT_CA = [P01, P02, P03, P04, P05, P06, P09, P11, P12]


def main():
    phong = [f() for f in TAT_CA]
    os.makedirs(os.path.join(GOC, 'phong'), exist_ok=True)
    for p in phong:
        d = p.json()
        if getattr(p, 'trum_o', None):
            d['trum_o'] = p.trum_o
        with open(os.path.join(GOC, 'phong', p.id + '.json'), 'w', encoding='utf-8') as f:
            f.write(json_dep(d))
    ket_noi = []
    for p in phong:
        for c in p.cua:
            k = sorted([c['id'], c['toi_cua']])
            if k not in [x['cua'] for x in ket_noi]:
                ket_noi.append(dict(cua=k, phong=sorted([p.id, c['toi']])))
    bd = dict(phien_ban=1, phong_dau='P01', bat_dau=dict(phong='P01', cot=4, hang=15),
              don_vi='x,y,w,h tính bằng ô phòng (48px) trên bản đồ thế giới; bản đồ nhỏ tự thu nhỏ (vd ÷4)',
              phong=[dict(id=p.id, ten=p.ten, x=p.wx, y=p.wy, w=p.C, h=p.R, rong=p.C, cao_bd=p.R,
                          chuong_luu=bool(p.chuong_luu), trum=p.trum, tinh_anh=p.tinh_anh) for p in phong],
              ket_noi=[dict(a=k['cua'][0], b=k['cua'][1]) for k in ket_noi],
              ghi_chu='Đợt 1. P07/P08/P10 chưa có: tạm nối P06→P09 trực tiếp, P09→P11 trực tiếp.')
    with open(os.path.join(GOC, 'ban-do.json'), 'w', encoding='utf-8') as f:
        f.write(json_dep(bd))
    print('Đã ghi', len(phong), 'phòng.')


def json_dep(d):
    """JSON dễ đọc: lưới mỗi hàng một dòng, đối tượng nhỏ trên một dòng."""
    out = ['{']
    keys = list(d.keys())
    for i, k in enumerate(keys):
        v = d[k]
        end = ',' if i < len(keys) - 1 else ''
        if isinstance(v, list) and v and isinstance(v[0], (str, dict)):
            out.append(' %s: [' % json.dumps(k, ensure_ascii=False))
            for j, x in enumerate(v):
                out.append('  ' + json.dumps(x, ensure_ascii=False) + (',' if j < len(v) - 1 else ''))
            out.append(' ]' + end)
        else:
            out.append(' %s: %s%s' % (json.dumps(k, ensure_ascii=False), json.dumps(v, ensure_ascii=False), end))
    out.append('}')
    return '\n'.join(out) + '\n'


if __name__ == '__main__':
    main()
