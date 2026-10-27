#!/usr/bin/env python3
"""Tạo game/thu-phong-b/index.html từ game/thu-p0a/index.html HIỆN TẠI (KHÔNG sửa thu-p0a, demo.html, build-demo.py).

Trang thử PHÒNG B hướng mới (tư vấn 3, "THỨ TỰ THỰC HIỆN" bước đầu): vào thẳng phòng B (Sân hai chuông).
Mỗi chỗ thay là một cặp (cũ → mới) phải khớp ĐÚNG số lần ghi – thu-p0a đổi khác thì dừng và báo chỗ nào (phiên Âm Đao đang sửa thu-p0a).
Cột `ghep` = True: chỗ CẦN GHÉP khi đưa sang thu-p0a / demo (xem GHI-CHU.md mục "Cách ghép"); False: chỉ cho bản thử.
Ghép thêm:
  - khối màu HM của game/thu-huong-moi/cong-cu/khoi-huong-moi.js (phần trên dòng "bản đồ bản thử": tô màu đồ cũ, quầng, vignette)
  - cong-cu/khoi-phong-b.js (số đặt phòng B + móc vẽ + API thử)
Chạy: python3 game/thu-phong-b/cong-cu/tao-tu-p0a.py"""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.normpath(os.path.join(HERE, '..', '..'))
src = open(os.path.join(GAME, 'thu-p0a', 'index.html'), encoding='utf-8').read()
HM_FULL = open(os.path.join(GAME, 'thu-huong-moi', 'cong-cu', 'khoi-huong-moi.js'), encoding='utf-8').read()
MOC = '/* ---------- bản đồ bản thử'
if HM_FULL.count(MOC) != 1:
    sys.exit('LỖI – khoi-huong-moi.js đã đổi: không thấy dòng "%s"' % MOC)
HM = HM_FULL[:HM_FULL.index(MOC)]
KHOI = open(os.path.join(HERE, 'khoi-phong-b.js'), encoding='utf-8').read()

R = []
def thay(mo_ta, cu, moi, ghep=True, lan=1):
    R.append((mo_ta, cu, moi, ghep, lan))

# ---- chỉ bản thử
thay('tiêu đề', '<title>Tiếng Vọng – Thử P0-A (nhịp đánh + Thế)</title>', '<title>Tiếng Vọng – Thử phòng B hướng mới</title>', False)
# ---- GHÉP: 2 module mới (đường dẫn từ game/thu-*/; ở demo.html bỏ "../")
thay('script module DHM + GDHM', '<script src="../runtime/lang-hoan-thien.js"></script>',
     '<script src="../runtime/lang-hoan-thien.js"></script>\n<script src="../runtime/dia-hinh-huong-moi.js"></script>\n<script src="../runtime/giao-dien-huong-moi.js"></script>')
# ---- GHÉP: các móc của khối màu HM (giống thu-huong-moi/cong-cu/tao-tu-demo.py)
thay('HM: sương sau nền', "  for(const L of NEN.lop) veLop(L,ox,oy);\n}",
     "  for(const L of NEN.lop) veLop(L,ox,oy);   // ảnh nền đã được HM tô màu SẴN lúc nạp\n  HM.veSauNen(ox,oy);\n}")
thay('HM: đèn lồng', "function drawDen(lop){\n", "function drawDen(lop){ if(HM.veDen(lop)) return;\n")
thay('HM: lớp trước (vignette)', "  drawTienCanh();   // tiền cảnh rễ treo (hệ số 1,05) vẽ SAU Lam, quái, đồ vật; trước hiệu ứng + HUD",
     "  drawTienCanh();   // tiền cảnh rễ treo (hệ số 1,05) vẽ SAU Lam, quái, đồ vật; trước hiệu ứng + HUD\n  HM.veTruoc(ox,oy);")
thay('HM: mỗi bước', "  updateHazards();\n  if(S.won){ S.winT++; }", "  updateHazards(); HM.buoc();\n  if(S.won){ S.winT++; }")
thay('HM + DHM: tô màu đồ cũ, rồi nạp + dựng địa hình mới', "dungGach(); dungDen();\n",
     "dungGach(); dungDen();\n    await HM.chuanBi(lc);   // HM: tô màu SẴN đồ cũ (gạch cũ, ván, đá, đèn, điểm lưu…)\n    await PBK.chuanBi();    // DHM: nạp + dựng nền / đất hướng mới; GDHM: HUD + nút\n")
thay('khối HM + khối phòng B, rồi khởi động', "\nboot();\n</script>", "\n" + HM + "\n" + KHOI + "\nboot();\n</script>")

out = src
loi = []
for mo_ta, cu, moi, ghep, lan in R:
    n = out.count(cu)
    if n != lan:
        loi.append('%s: khớp %d lần (cần %d)' % (mo_ta, n, lan))
        continue
    out = out.replace(cu, moi)
if loi:
    sys.exit('LỖI – thu-p0a/index.html đã đổi, sửa script:\n  ' + '\n  '.join(loi))
dst = os.path.join(GAME, 'thu-phong-b', 'index.html')
open(dst, 'w', encoding='utf-8').write(out)
print('ghi', dst, len(out.encode('utf-8')), 'byte')
print('Phần GHÉP (%d chỗ):' % sum(1 for r in R if r[3]), '; '.join(m for m, _, _, g, _ in R if g))
