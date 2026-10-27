#!/usr/bin/env python3
"""Tạo game/thu-huong-moi/thu-huong-moi.html từ game/demo.html (KHÔNG sửa demo.html) – cảnh chuẩn hướng "Cổ tích chuông tàn".

Mỗi chỗ thay là một cặp (cũ → mới) phải khớp ĐÚNG 1 lần – demo.html đổi khác thì dừng và báo chỗ nào (phiên khác đang sửa demo.html).
Cột `ghep` = True: phần CẦN GHÉP khi đưa ánh sáng / màu mới vào demo.html; False: chỉ cho bản thử (đường dẫn, tiêu đề, khối THỬ).
Khối mã mới nằm trong cong-cu/khoi-huong-moi.js (chèn trước boot()).

Chạy: python3 game/thu-huong-moi/cong-cu/tao-tu-demo.py"""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.normpath(os.path.join(HERE, '..', '..'))
src = open(os.path.join(GAME, 'demo.html'), encoding='utf-8').read()
KHOI = open(os.path.join(HERE, 'khoi-huong-moi.js'), encoding='utf-8').read()

R = []
def thay(mo_ta, cu, moi, ghep=True):
    R.append((mo_ta, cu, moi, ghep))

# ---- chỉ bản thử: tiêu đề + đường dẫn (thư mục thu-huong-moi/ sâu hơn 1 cấp)
thay('tiêu đề', '<title>Tiếng Vọng – Demo Làng Chuông</title>', '<title>Tiếng Vọng – Thử hướng mới "Cổ tích chuông tàn"</title>', False)
for m in ('quai-boss-runtime', 'trang-tri-dia-hinh'):
    thay('script ' + m, '<script src="runtime/%s.js"></script>' % m, '<script src="../runtime/%s.js"></script>' % m, False)
for m in ('cong-lang', 'san-chuong', 'phong-boss'):
    thay('dữ liệu ' + m, '<script src="runtime/trang-tri/%s.js"></script>' % m, '<script src="../runtime/trang-tri/%s.js"></script>' % m, False)
for cu, moi in [("lam:'../art/modular/lam-moi/rig-v4/", "lam:'../../art/modular/lam-moi/rig-v4/"), ("lam:'../art/modular/lam-moi/rig-v3/", "lam:'../../art/modular/lam-moi/rig-v3/"),
                ("nghi:'anim/lam-nghi-v4-2x.png'", "nghi:'../anim/lam-nghi-v4-2x.png'"), ("nghi:'anim/lam-nghi-2x.png'", "nghi:'../anim/lam-nghi-2x.png'"),
                ("hd:   '../art/modular/", "hd:   '../../art/modular/"), ("hu:   '../art/hieu-ung/", "hu:   '../../art/hieu-ung/"),
                ("qbr:  'runtime/quai-boss/'", "qbr:  '../runtime/quai-boss/'"), ("lc:   '../art/the-gioi-moi/lang-chuong/'", "lc:   '../../art/the-gioi-moi/lang-chuong/'"),
                ("giu:  'anim/lang-chuong-giu.json'", "giu:  '../anim/lang-chuong-giu.json'"),
                ("tt:   '../art/the-gioi-moi/dia-hinh-v4/dia-hinh-v4.json'", "tt:   '../../art/the-gioi-moi/dia-hinh-v4/dia-hinh-v4.json'"),
                ("json=await r.json(); src='anim/'+json.image; }", "json=await r.json(); src='../anim/'+json.image; }")]:
    thay('đường dẫn ' + cu.split("'")[1], cu, moi, False)

# ---- phần GHÉP: các móc gọi vào khối HM (hướng mới). Khi HM.bat=false (?hm=0) mọi móc không làm gì → y như demo.html
thay('nền: sương mỏng + bóng tối dưới mặt sàn (lộ ra ở vực), sau nền trước gạch',
     "  for(const L of NEN.lop) veLop(L,ox,oy);\n}",
     "  for(const L of NEN.lop) veLop(L,ox,oy);   // ảnh nền đã được HM tô màu SẴN lúc nạp (không xử lý pixel mỗi khung)\n  HM.veSauNen(ox,oy);   // HM: sương mỏng + tối dần dưới mặt sàn (gạch che → chỉ thấy ở vực) + ánh cam đỏ đáy vực\n}")
thay('đèn lồng: lọc theo cảnh + quầng vẽ sẵn', "function drawDen(){\n  for(const d of DEN){ const x=d.x-ox, y=d.y-oy; if(x<-60||x>W+60) continue;",
     "function drawDen(){ if(HM.veDen()) return;   // HM: đèn lồng vẽ trong khối HM (quầng vẽ sẵn, không tạo gradient mỗi khung)\n  for(const d of DEN){ const x=d.x-ox, y=d.y-oy; if(x<-60||x>W+60) continue;")
thay('điểm lưu: quầng vẽ sẵn', "function drawSaveBell(b){\n  const X=b.x-ox, Y=b.y-oy+4; if(X<-90||X>W+90) return;",
     "function drawSaveBell(b){ if(HM.veChuong(b)) return;\n  const X=b.x-ox, Y=b.y-oy+4; if(X<-90||X>W+90) return;")
thay('lớp ánh sáng sau nhân vật: quầng + bụi + vignette (trước hiệu ứng / HUD)',
     "  drawTienCanh();   // tiền cảnh rễ treo (hệ số 1,05) vẽ SAU Lam, quái, đồ vật; trước hiệu ứng + HUD",
     "  drawTienCanh();   // tiền cảnh rễ treo (hệ số 1,05) vẽ SAU Lam, quái, đồ vật; trước hiệu ứng + HUD\n  HM.veTruoc(ox,oy);   // HM: bụi sáng trong vùng đèn + vignette vẽ sẵn")
thay('mỗi bước: chuông làng tắt khi Lam đi qua, bụi', "  updateHazards();\n  if(S.won){ S.winT++; }", "  updateHazards(); HM.buoc();   // HM: chuông tắt khi Lam đi qua, hạt bụi\n  if(S.won){ S.winT++; }")
thay('nạp xong: tô màu sẵn mọi ảnh cảnh',
     "dungGach(); dungDen();\n", "dungGach(); dungDen();\n    await HM.chuanBi(lc);   // HM: tô màu (grade) SẴN 1 lần: nền, tiền cảnh, atlas gạch, rong-re, trang trí, đồ vật; vẽ sẵn quầng / vignette / sương\n")
thay('khối HM + THỬ, rồi khởi động', "\nboot();\n</script>", "\n" + KHOI + "\nboot();\n</script>")

out = src
loi = []
for mo_ta, cu, moi, ghep in R:
    n = out.count(cu)
    if n != 1:
        loi.append('%s: khớp %d lần (cần 1)' % (mo_ta, n))
        continue
    out = out.replace(cu, moi)
if loi:
    sys.exit('LỖI – demo.html đã đổi, sửa script:\n  ' + '\n  '.join(loi))
dst = os.path.join(GAME, 'thu-huong-moi', 'thu-huong-moi.html')
open(dst, 'w', encoding='utf-8').write(out)
print('ghi', dst, len(out.encode('utf-8')), 'byte')
print('Phần GHÉP vào demo.html (%d chỗ):' % sum(1 for r in R if r[3]), '; '.join(m for m, _, _, g in R if g))
