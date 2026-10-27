#!/usr/bin/env python3
"""Tạo game/thu-cong-lang/thu-cong-lang.html từ game/demo.html (KHÔNG sửa demo.html) – bản thử trang trí địa hình Cổng làng.

Mỗi chỗ thay là một cặp (cũ → mới) phải khớp ĐÚNG 1 lần – nếu demo.html đã đổi khác thì dừng và báo chỗ nào.
Cột `ghép` = chỗ cần ghép vào demo.html khi được duyệt (phần còn lại chỉ phục vụ bản thử: đường dẫn, nút, API chụp).
Phần THỬ (tham số ?tt=0, ?vao=cong2, API chụp TVTHU) nằm trong khoi-thu.js, chèn trước boot().

Chạy: python3 game/thu-cong-lang/cong-cu/tao-tu-demo.py"""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.normpath(os.path.join(HERE, '..', '..'))
src = open(os.path.join(GAME, 'demo.html'), encoding='utf-8').read()
THU = open(os.path.join(HERE, 'khoi-thu.js'), encoding='utf-8').read()

R = []  # (mô tả, cũ, mới, ghép-vào-demo?)
def thay(mo_ta, cu, moi, ghep=True):
    R.append((mo_ta, cu, moi, ghep))

thay('tiêu đề', '<title>Tiếng Vọng – Demo Làng Chuông</title>', '<title>Tiếng Vọng – Thử trang trí địa hình Cổng làng</title>', False)
thay('nạp module trang trí + dữ liệu Cổng làng (đường dẫn từ thư mục thu-cong-lang/)',
     '<script src="runtime/quai-boss-runtime.js"></script>',
     '<script src="../runtime/quai-boss-runtime.js"></script>\n<script src="../runtime/trang-tri-dia-hinh.js"></script>\n<script src="../runtime/trang-tri/cong-lang.js"></script>')
# đường dẫn tài nguyên: thư mục thu-cong-lang/ sâu hơn demo.html 1 cấp
for cu, moi in [("lam:'../art/modular/lam-moi/rig-v4/", "lam:'../../art/modular/lam-moi/rig-v4/"), ("lam:'../art/modular/lam-moi/rig-v3/", "lam:'../../art/modular/lam-moi/rig-v3/"),
                ("nghi:'anim/lam-nghi-v4-2x.png'", "nghi:'../anim/lam-nghi-v4-2x.png'"), ("nghi:'anim/lam-nghi-2x.png'", "nghi:'../anim/lam-nghi-2x.png'"),
                ("hd:   '../art/modular/", "hd:   '../../art/modular/"), ("hu:   '../art/hieu-ung/", "hu:   '../../art/hieu-ung/"),
                ("qbr:  'runtime/quai-boss/'", "qbr:  '../runtime/quai-boss/'"), ("lc:   '../art/the-gioi-moi/lang-chuong/'", "lc:   '../../art/the-gioi-moi/lang-chuong/'"),
                ("giu:  'anim/lang-chuong-giu.json'", "giu:  '../anim/lang-chuong-giu.json'"), ("json=await r.json(); src='anim/'+json.image; }", "json=await r.json(); src='../anim/'+json.image; }")]:
    thay('đường dẫn ' + cu.split("'")[1], cu, moi, False)
thay('SRC: thêm JSON atlas trang trí Cổng làng',
     "  giu:  '../anim/lang-chuong-giu.json'           // điểm lưu tắt/sáng + đèn lồng (hình cũ giữ lại)\n};",
     "  giu:  '../anim/lang-chuong-giu.json',          // điểm lưu tắt/sáng + đèn lồng (hình cũ giữ lại)\n"
     "  tt:   '../../art/the-gioi-moi/cong-lang-v3/cong-lang-v3.json'   // TRANG TRÍ ĐỊA HÌNH Cổng làng (atlas 2x cùng thư mục; bản build: TV.NHUNG.tt)\n};")
thay('vẽ gạch: lớp SAU trước gạch, lớp THÂN trước mảng rễ, lớp MẶT sau mảng rễ',
     "  const M=GCH.map, cv=GCH.cv, K=BK; if(!M) return;\n  const tx0=Math.max(0,Math.floor(ox/T))",
     "  const M=GCH.map, cv=GCH.cv, K=BK; if(!M) return;\n  TT.ve('sau',ox,oy);   // trang trí vẽ TRƯỚC gạch (bệ rễ đỡ: chân lún dưới sàn)\n  const tx0=Math.max(0,Math.floor(ox/T))")
thay('vẽ gạch: thân / mặt', "      ctx.drawImage(cv,q[0],q[1],64,64,x0,y0,x1-x0,y1-y0); } }\n  drawRe();\n}",
     "      ctx.drawImage(cv,q[0],q[1],64,64,x0,y0,x1-x0,y1-y0); } }\n  TT.ve('than',ox,oy);   // mảng gỗ lớn phủ thân (cắt theo ô đặc)\n  drawRe();\n  TT.ve('mat',ox,oy);    // mép đất rễ-rêu, chân rễ, cửa nhà – trước Lam / đồ vật\n}")
thay('tiền cảnh rễ-đá (cuộn 1,05) vẽ sau Lam, cùng chỗ với tiền cảnh Làng Chuông',
     "function drawTienCanh(){ if(NEN.tien){ ctx.imageSmoothingEnabled=true; veLop(NEN.tien,ox,oy); } }",
     "function drawTienCanh(){ if(NEN.tien){ ctx.imageSmoothingEnabled=true; veLop(NEN.tien,ox,oy); } TT.veTienCanh(ox,oy); }")
thay('nạp + decode atlas trang trí ở màn nạp (sau Làng Chuông)',
     "lc=await thu(napLC,'Nạp + giải mã Làng Chuông (nền, gạch, cổng, công tắc)',0.75);",
     "lc=await thu(napLC,'Nạp + giải mã Làng Chuông (nền, gạch, cổng, công tắc)',0.75), tt=await thu(()=>TT.nap(SRC.tt,window.TV&&TV.NHUNG&&TV.NHUNG.tt,p=>setLoad(0.77+0.02*p)),'Nạp + giải mã trang trí địa hình Cổng làng',0.77);")
thay('khởi tạo module + xoá hình ô ván đã thay bệ (sau dungGach)',
     "keoMepGach(lc.gach.meta,lc.gach.img); Object.assign(DOV,lc.dv); dungGach(); dungDen();",
     "keoMepGach(lc.gach.meta,lc.gach.img); Object.assign(DOV,lc.dv); dungGach(); dungDen();\n"
     "    TT.khoiTao({ctx, W, H, T, rows:ROWS, tile, solid:solidC}); if(TT.bat){ TT.anO(GCH.map,WW); TT.nuong(); }   // trang trí địa hình: cùng hệ toạ độ camera với gạch; nướng sẵn mảnh cắt theo ô đặc")
thay('TVDEMO: số đo trang trí', "lc:LC_SO, qbr:QBR.so, W, H, T};", "lc:LC_SO, qbr:QBR.so, tt:TT.so, W, H, T};", False)
thay('màn bắt đầu: dòng số đo trang trí',
     "    document.getElementById('start-clip').textContent=",
     "    document.getElementById('start-qb').textContent+=' · Trang trí Cổng làng: '+TT.so.so_anh+' atlas, nạp '+TT.so.ms+' ms, bộ nhớ ảnh ≈ '+TT.so.mb_anh+' MB + nướng '+(TT.so.mb_nuong||0)+' MB'+(TT.bat?'':' (ĐANG TẮT ?tt=0)');\n"
     "    document.getElementById('start-clip').textContent=", False)
thay('overlay hitbox: thêm collider địa hình (ô chặn, bệ một chiều, hộp cổng)',
     "  ctx.save(); ctx.lineWidth=1.5; ctx.font='bold 10px ui-monospace,Menlo,monospace'; ctx.textBaseline='top';\n  const px=lerp(pl.px,pl.x,al), py=lerp(pl.py,pl.y,al), ddx=px-pl.x, ddy=py-pl.y;\n  hbRect(px,py,pl.w,pl.h,'#4fb4ff');",
     "  ctx.save(); ctx.lineWidth=1.5; ctx.font='bold 10px ui-monospace,Menlo,monospace'; ctx.textBaseline='top';\n"
     "  TT.veCollider(ox,oy);   // ô chặn (vàng; đá: xanh), cạnh lộ cam, bệ một chiều: vạch lục ở mép trên\n"
     "  for(const d of DOORS) if(doorSolid(d)){ const b=doorBox(d); hbRect(b.x,b.y,b.w,b.h,'#ffd25a','dash'); }\n"
     "  ctx.lineWidth=1.5;\n  const px=lerp(pl.px,pl.x,al), py=lerp(pl.py,pl.y,al), ddx=px-pl.x, ddy=py-pl.y;\n  hbRect(px,py,pl.w,pl.h,'#4fb4ff');")
thay('chú giải overlay', "hbChu('HITBOX (H)  xanh: thân  lục: vùng ăn đòn Lam  đỏ: đòn ĐANG gây sát thương  cam: sắp bật  tím: nắm tay (hình)',8,H-16,'#fff');",
     "hbChu('COLLIDER (H)  vàng/xanh nhạt: ô chặn (gỗ/đá), cam: cạnh lộ  lục đậm: bệ một chiều  xanh: thân Lam  lục đứt: vùng ăn đòn  vàng đứt: cổng đóng',8,H-16,'#fff');", False)
thay('khối THỬ + khởi động', "\nboot();\n</script>", "\n" + THU + "\nboot();\n</script>", False)

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
dst = os.path.join(GAME, 'thu-cong-lang', 'thu-cong-lang.html')
open(dst, 'w', encoding='utf-8').write(out)
print('ghi', dst, len(out.encode('utf-8')), 'byte')
print('Phần GHÉP vào demo.html:', '; '.join(m for m, _, _, g in R if g))
