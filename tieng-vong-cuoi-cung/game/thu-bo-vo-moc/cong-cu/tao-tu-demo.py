#!/usr/bin/env python3
"""Tạo game/thu-bo-vo-moc/index.html từ game/demo.html (KHÔNG sửa demo.html) – trang thử quái mới Bọ Vỏ Mộc.

Mỗi chỗ thay là một cặp (cũ → mới) phải khớp ĐÚNG 1 lần – demo.html đổi khác thì dừng và báo chỗ nào.
Cột `ghep` = True: phần CẦN GHÉP khi đưa Bọ Vỏ Mộc vào demo.html; False: chỉ cho bản thử (đường dẫn, tiêu đề, phòng thử).
Gồm 2 khối chèn trước boot():
  1. khối ÁNH SÁNG / MÀU hướng mới (HM) – lấy NGUYÊN phần lõi của game/thu-huong-moi/cong-cu/khoi-huong-moi.js (bỏ phần đào vực,
     quái thử và phần THỬ của trang đó) để thấy Bọ trong cảnh tối của hướng mới. ?hm=0 tắt (= màu demo hiện tại).
  2. cong-cu/khoi-bo.js – Bọ Vỏ Mộc (gameplay + vẽ từ mảnh) + phòng thử + bot/API quay.

Chạy: python3 game/thu-bo-vo-moc/cong-cu/tao-tu-demo.py"""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.normpath(os.path.join(HERE, '..', '..'))
src = open(os.path.join(GAME, 'demo.html'), encoding='utf-8').read()
BO = open(os.path.join(HERE, 'khoi-bo.js'), encoding='utf-8').read()
hm_all = open(os.path.join(GAME, 'thu-huong-moi', 'cong-cu', 'khoi-huong-moi.js'), encoding='utf-8').read()
MOC = '/* ---------- bản đồ bản thử: đào hố'
if hm_all.count(MOC) != 1: sys.exit('LỖI – khoi-huong-moi.js đã đổi (không thấy mốc "%s")' % MOC)
HM = hm_all.split(MOC)[0].rstrip() + '\n'

R = []
def thay(mo_ta, cu, moi, ghep=True):
    R.append((mo_ta, cu, moi, ghep))

# ---- chỉ bản thử: tiêu đề + đường dẫn (thư mục thu-bo-vo-moc/ sâu hơn 1 cấp)
thay('tiêu đề', '<title>Tiếng Vọng – Demo Làng Chuông</title>', '<title>Tiếng Vọng – Thử Bọ Vỏ Mộc</title>', False)
for m in ('quai-boss-runtime', 'trang-tri-dia-hinh', 'lang-hoan-thien'):
    thay('script ' + m, '<script src="runtime/%s.js"></script>' % m, '<script src="../runtime/%s.js"></script>' % m, False)
thay('đường dẫn lht', "lht:  '../art/lang-hoan-thien/", "lht:  '../../art/lang-hoan-thien/", False)
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

# ---- ánh sáng / màu hướng mới (giống thu-huong-moi; không phải phần của Bọ)
thay('HM: sương + tối dưới mặt sàn', "  for(const L of NEN.lop) veLop(L,ox,oy);\n}",
     "  for(const L of NEN.lop) veLop(L,ox,oy);\n  HM.veSauNen(ox,oy);   // HM: sương mỏng + tối dần dưới mặt sàn\n}", False)
thay('HM: đèn lồng quầng vẽ sẵn', "function drawDen(lop){\n", "function drawDen(lop){ if(HM.veDen(lop)) return;\n", False)
thay('HM: lớp sáng sau nhân vật + vignette',
     "  drawTienCanh();   // tiền cảnh rễ treo (hệ số 1,05) vẽ SAU Lam, quái, đồ vật; trước hiệu ứng + HUD",
     "  drawTienCanh();   // tiền cảnh rễ treo (hệ số 1,05) vẽ SAU Lam, quái, đồ vật; trước hiệu ứng + HUD\n  HM.veTruoc(ox,oy);", False)
thay('HM: mỗi bước', "  updateHazards();\n  if(S.won){ S.winT++; }", "  updateHazards(); HM.buoc();\n  if(S.won){ S.winT++; }", False)
thay('HM: tô màu sẵn lúc nạp', "dungGach(); dungDen();\n", "dungGach(); dungDen();\n    await HM.chuanBi(lc);   // HM: tô màu SẴN 1 lần (nền, gạch, trang trí, đồ vật) + vẽ sẵn quầng / vignette / sương\n", False)

# ---- phần GHÉP Bọ Vỏ Mộc vào game (mỗi móc gọi vào khối BO)
thay('nạp gói mảnh Bọ (QBR.napThem) sau quái/boss cũ', "    const hdL=await thu(napHD,",
     "    await thu(()=>BO.nap(p=>setLoad(0.795+0.004*p)),'Nạp + giải mã mảnh Bọ Vỏ Mộc',0.795);   // gói rig Bọ: 7 PNG mảnh + JSON\n"
     "    if(loi.length){ baoLoi('Không nạp được hình. Bấm \"Thử lại\"; nếu vẫn lỗi, tải lại trang.',loi); return; }\n"
     "    const hdL=await thu(napHD,")
thay('ván mới: đặt lại Bọ', "  for(const q of Q) q.H=null; boss.H=null;   // tư thế rig làm lại từ đầu\n}",
     "  for(const q of Q) q.H=null; boss.H=null;   // tư thế rig làm lại từ đầu\n  BO.datLai();   // Bọ Vỏ Mộc (bản thử: đặt Lam vào phòng thử)\n}")
thay('lưu vị trí trước (nội suy)', "  boss.px=boss.x; boss.py=boss.y;\n", "  boss.px=boss.x; boss.py=boss.y;\n  BO.luuTruoc();\n")
thay('mỗi bước: cập nhật Bọ', "  for(const q of Q) updateQuai(q);\n", "  for(const q of Q) updateQuai(q);\n  BO.capNhat();   // Bọ Vỏ Mộc: AI + trạng thái → clip rig\n")
thay('vẽ Bọ (sau quái)', "  for(const q of Q) drawQuai(q,al);\n", "  for(const q of Q) drawQuai(q,al);\n  BO.ve(al);\n")
thay('đòn trúng Bọ (mai / bụng)', "  if(boss.hittable && !boss.dead && overlap(hb,boss)) if(strike(boss,src,sw,face,n,hb)) hit=true;\n  return hit;",
     "  if(boss.hittable && !boss.dead && overlap(hb,boss)) if(strike(boss,src,sw,face,n,hb)) hit=true;\n  if(BO.trung(hb,src,sw,face,n)) hit=true;   // Bọ: mai dội / bụng mất máu\n  return hit;")
thay('chém nảy trên Bọ', "  if(boss.hittable && !boss.dead && overlap(PR,boss)) return true;",
     "  if(boss.hittable && !boss.dead && overlap(PR,boss)) return true;\n  if(BO.pogo(PR)) return true;")
thay('hitbox Bọ (nút ▣ / phím H)', "  for(const w of WAVES) if(w.on) hbRect(", "  BO.veHitbox(al);\n  for(const w of WAVES) if(w.on) hbRect(")
thay('khối HM + BO, rồi khởi động', "\nboot();\n</script>", "\n" + HM + "\n" + BO + "\nboot();\n</script>")

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
dst = os.path.join(GAME, 'thu-bo-vo-moc', 'index.html')
open(dst, 'w', encoding='utf-8').write(out)
print('ghi', dst, len(out.encode('utf-8')), 'byte')
print('Phần GHÉP vào demo.html (%d chỗ):' % sum(1 for r in R if r[3]), '; '.join(m for m, _, _, g in R if g))
