#!/usr/bin/env python3
"""Tạo game/thu-phong-b/index.html từ game/thu-p0a/index.html HIỆN TẠI (KHÔNG sửa thu-p0a, demo.html, build-demo.py).

Trang thử PHÒNG B hướng mới (tư vấn 3, "THỨ TỰ THỰC HIỆN" bước đầu): vào thẳng phòng B (Sân hai chuông).
Mỗi chỗ thay là một cặp (cũ → mới) phải khớp ĐÚNG số lần ghi – thu-p0a đổi khác thì dừng và báo chỗ nào (phiên Âm Đao đang sửa thu-p0a).
Cột `ghep` = True: chỗ CẦN GHÉP khi đưa sang thu-p0a / demo (xem GHI-CHU.md mục "Cách ghép"); False: chỉ cho bản thử.
Ghép thêm:
  - khối màu HM của game/thu-huong-moi/cong-cu/khoi-huong-moi.js (phần trên dòng "bản đồ bản thử": tô màu đồ cũ, quầng, vignette)
  - cong-cu/khoi-phong-b.js (số đặt phòng B + móc vẽ + API thử)
Bước 3 (29/10): thêm phòng D (2 Bọ Vỏ Mộc), E (sân tinh anh trống), F (lò rèn: chuông lưu + đe rèn) sau hành lang C.
  - khối Bọ: game/thu-bo-vo-moc/cong-cu/khoi-bo.js CHỈ ĐỌC, chỉnh trên BẢN CHÉP (như game/thu-p0b/cong-cu/tao-p0b.py):
    phòng thử RD → phòng D mới, bỏ phần bot / quay của trang Bọ, datLai không đặt Lam / chuông. LOAI_QUAI.bo (thang ×10) + rig Bọ giữ nguyên.
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
BO = open(os.path.join(GAME, 'thu-bo-vo-moc', 'cong-cu', 'khoi-bo.js'), encoding='utf-8').read()
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


# ---- BƯỚC 3: phòng D / E / F (chỉ bản thử; khi ghép game chính sẽ theo sơ đồ chung) ----
thay('thêm phòng D, E, F sau hành lang C', "PC=room('Hành lang gác',32);",
     "PC=room('Hành lang gác',32), PD=room('Bọ Vỏ Mộc',30), PE=room('Đấu trường tinh anh',30), PF=room('Lò rèn',16);", False)
thay('mở tường phải C; ván D; tường cuối F', "fill(PC,PC.w-1,6,PC.w-1,13,'S');",
     "fill(PD,9,9,12,9,'='); fill(PF,PF.w-1,0,PF.w-1,13,'S');   // bước 3: tường phải C bỏ → sang D (sàn thoáng, ván 4 ô) → E (trống) → F (tường cuối)", False)
thay('chuông lưu phòng F', "BELLS.push({x:(PA.x0+2)*T+16, y:FLOOR, on:false, ring:0, cd:0});",
     "BELLS.push({x:(PA.x0+2)*T+16, y:FLOOR, on:false, ring:0, cd:0});\nBELLS.push({x:(PF.x0+2)*T+16, y:FLOOR, on:false, ring:0, cd:0});   // bước 3: chuông lưu phòng F (BELLS[4])", False)
thay('nạp gói mảnh Bọ', "    const hdL=await thu(napHD,",
     "    await thu(()=>BO.nap(p=>setLoad(0.795+0.004*p)),'Nạp + giải mã mảnh Bọ Vỏ Mộc',0.795);\n"
     "    if(loi.length){ baoLoi('Không nạp được hình. Bấm \"Thử lại\"; nếu vẫn lỗi, tải lại trang.',loi); return; }\n    const hdL=await thu(napHD,", False)
thay('ván mới: đặt lại Bọ', "  for(const q of Q) q.H=null; boss.H=null;   // tư thế rig làm lại từ đầu\n",
     "  for(const q of Q) q.H=null; boss.H=null;   // tư thế rig làm lại từ đầu\n  BO.datLai();\n", False)
thay('lưu vị trí Bọ (nội suy)', "  boss.px=boss.x; boss.py=boss.y;\n", "  boss.px=boss.x; boss.py=boss.y;\n  BO.luuTruoc();\n", False)
thay('cập nhật Bọ', "  for(const q of Q) updateQuai(q);\n", "  for(const q of Q) updateQuai(q);\n  BO.capNhat();\n", False)
thay('vẽ Bọ (xác trước, sống + dấu báo sau)', "  for(const q of Q) drawQuai(q,al);\n", "  BO.veXac(al);\n  for(const q of Q) drawQuai(q,al);\n  BO.ve(al);\n", False)
thay('hitbox Bọ', "  for(const w of WAVES) if(w.on) hbRect(", "  BO.veHitbox(al);\n  for(const w of WAVES) if(w.on) hbRect(", False)
thay('chém nảy trên Bọ', "  if(boss.hittable && !boss.dead && overlap(PR,boss)) return true;", "  if(boss.hittable && !boss.dead && overlap(PR,boss)) return true;\n  if(BO.pogo(PR)) return true;", False)
thay('đòn P0 trúng Bọ (mai / bụng; D bền: sw = D.ma)', "    return co;\n  }\n  function tenQ(q)",
     "    if (typeof BO !== 'undefined' && BO.N && BO.trung(hb, D.src, D.ma, face, n)) co = true;   // bước 3: Bọ phòng D\n    return co;\n  }\n  function tenQ(q)", False)
thay('đòn nhịp cũ (?p0=0) trúng Bọ', "  if(boss.hittable && !boss.dead && overlap(hb,boss)) if(strike(boss,src,sw,face,n,hb)) hit=true;\n  return hit;",
     "  if(boss.hittable && !boss.dead && overlap(hb,boss)) if(strike(boss,src,sw,face,n,hb)) hit=true;\n  if(BO.trung(hb,src,sw,face,n)) hit=true;\n  return hit;", False)

# khối Bọ: chép rồi chỉnh (KHÔNG ghi lại file gốc) – giống tao-p0b.py
def doi(text, ds, ten):
    for mo_ta, cu, moi, lan in ds:
        n = text.count(cu)
        if n != lan: loi_bo.append('%s – %s: khớp %d lần (cần %d)' % (ten, mo_ta, n, lan)); continue
        text = text.replace(cu, moi)
    return text
loi_bo = []
MOC_THU = '/* ======================= THỬ (không ghép vào demo.html): bot + API quay / chụp'
if BO.count(MOC_THU) != 1: loi_bo.append('khoi-bo.js: không thấy mốc phần THỬ')
BO = BO.split(MOC_THU)[0]
BO = doi(BO, [
    ('chú thích phòng thử', '/* ---------- PHÒNG THỬ: phòng "Điểm lưu" (RD, 30 ô = đúng 1 màn) làm phẳng, chặn hai đầu ---------- */',
     '/* ---------- PHÒNG D (trang thu-phong-b bước 3): 2 Bọ ở phòng D mới sau hành lang gác ---------- */', 1),
    ('phòng thử RD → phòng D',
     "RD.name = 'Phòng thử Bọ Vỏ Mộc';\nfill(RD, 0, 0, RD.w - 1, 13, '.');                 // bỏ 2 bệ một chiều\n"
     "fill(RD, 0, 0, 0, 13, 'S'); fill(RD, RD.w - 1, 0, RD.w - 1, 13, 'S');   // tường hai đầu (không sang phòng câu đố / boss)\n"
     "BELLS[2].x = (RD.x0 + 3) * T + 16;                  // chuông lưu dời về đầu phòng (hồi sinh ở đây)\n",
     "// phòng D (PD, 30 ô) tạo trong tao-tu-p0a.py – sàn thoáng, ván 4 ô (cột 9–12, hàng 9), không trần\n", 1),
    ('datLai: không đặt Lam / chuông',
     "    S.cp = BELLS[2]; BELLS[0].on = false; BELLS[2].on = true;\n    placePlayer((RD.x0 + 3) * T + 6, FLOOR - pl.h); pl.drawT = 0; pl.face = 1;\n", "", 1),
    ('vị trí Bọ theo phòng D', '(RD.x0 + ', '(PD.x0 + ', 3),
    ('gợi ý phòng D', 'ROOMS[S.room] === RD', 'ROOMS[S.room] === PD', 1),
], 'khoi-bo.js')
import re
if re.search(r'\bRD\b', BO): loi_bo.append('khoi-bo.js: còn chỗ RD')
if loi_bo: sys.exit('LỖI – khoi-bo.js đã đổi, sửa script:\n  ' + '\n  '.join(loi_bo))

out = src
loi = []
for mo_ta, cu, moi, ghep, lan in R:
    n = out.count(cu)
    if n != lan:
        loi.append('%s: khớp %d lần (cần %d)' % (mo_ta, n, lan))
        continue
    out = out.replace(cu, moi)
TAIL = "\nboot();\n</script>"
if out.count(TAIL) != 1: loi.append('khởi động: khớp %d lần (cần 1)' % out.count(TAIL))
else: out = out.replace(TAIL, "\n" + HM + "\n" + BO + "\n" + KHOI + TAIL)   # khối HM + Bọ (bản chép) + khối phòng, rồi khởi động
if loi:
    sys.exit('LỖI – thu-p0a/index.html đã đổi, sửa script:\n  ' + '\n  '.join(loi))
dst = os.path.join(GAME, 'thu-phong-b', 'index.html')
open(dst, 'w', encoding='utf-8').write(out)
print('ghi', dst, len(out.encode('utf-8')), 'byte')
print('Phần GHÉP (%d chỗ):' % sum(1 for r in R if r[3]), '; '.join(m for m, _, _, g, _ in R if g))
