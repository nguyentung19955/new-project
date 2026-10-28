#!/usr/bin/env python3
"""Tạo game/thu-p0a/am-dao.html (trang thử Âm Đao cấp 1–4) từ game/thu-p0a/index.html (bản P0-A, KHÔNG sửa file đó)
+ khối cong-cu/khoi-am-dao.js (chèn SAU khối P0-A, trước boot()) + cong-cu/camera-dead-cells.js (28/10, chèn sau roomAt()). Cùng thư mục với index.html nên mọi đường dẫn tài nguyên giữ nguyên.
Bản P0-A gốc (index.html) để nguyên để so. Mỗi chỗ thay phải khớp đúng số lần – lệch thì dừng.
Chạy: python3 game/thu-p0a/cong-cu/tao-tu-demo.py && python3 game/thu-p0a/cong-cu/tao-am-dao.py"""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
THU = os.path.normpath(os.path.join(HERE, '..'))
src = open(os.path.join(THU, 'index.html'), encoding='utf-8').read()
KHOI = open(os.path.join(HERE, 'khoi-am-dao.js'), encoding='utf-8').read()

R = []
def thay(mo_ta, cu, moi, lan=1):
    R.append((mo_ta, cu, moi, lan))

thay('tiêu đề', '<title>Tiếng Vọng – Thử P0-A (nhịp đánh + Thế)</title>', '<title>Tiếng Vọng – Thử Âm Đao cấp 1–4 (trên P0-A)</title>')
thay('màn bắt đầu', '<p class="big">Thử P0-A · nhịp đánh, hàng chờ 1 nhát, Chuông Gỗ, quái gác có Thế</p>',
     '<p class="big">Thử Âm Đao cấp 1–4 · đánh thường + âm nhận, giữ Chém = Dư Âm (cấp 3+)</p>')
# Âm Đao dựng trên nhịp MỚI của P0-A: không có nhịp cũ ở trang này (so nhịp cũ/mới ở index.html)
thay('luôn nhịp mới', "bat: P0_Q.get('p0') !== '0',", "bat: true,   // trang Âm Đao: luôn nhịp P0-A")
thay('tên đòn 7 (chém vang)', "6: 'trên không'})[n]; }", "6: 'trên không', 7: 'CHÉM VANG'})[n] || ''; }")
thay('log trúng: nguồn vết k', "ghi((bong ? 'bóng ' : 'Lam ') + 'D ' + h.D.ma + (bong ? '' : ' ' + tenDon(h.n))",
     "ghi((bong ? 'bóng ' : h.D.src === 'k' ? 'VẾT ' : 'Lam ') + 'D ' + h.D.ma + (bong || h.D.src === 'k' ? '' : ' ' + tenDon(h.n)) + (h.D.chiMang ? ' CHÍ MẠNG' : '')")
thay('số trúng: chí mạng có "!", vết màu ngà',
     "String(h.m), bong ? '#7FE0C8' : '#FFF4DC'); }",
     "String(h.m) + (h.D.chiMang ? '!' : ''), bong ? '#7FE0C8' : h.D.chiMang ? '#FFD25A' : h.D.src === 'k' ? '#F3D9A8' : '#FFF4DC'); }")
thay('màu log kỹ năng', "r.loai === 'tre' ? '#FFD25A' : '#c9c9c9'",
     "r.loai === 'tre' ? '#FFD25A' : r.loai === 'ky' ? '#FFD9A0' : r.loai === 'vet' ? '#F3C38A' : r.loai === 'giu' ? '#B8A890' : '#c9c9c9'")
# 28/10 (nhận xét iPhone): vệt chém tan MỀM – khung áp chót mờ 1 → 0,65, khung cuối 0,65 → 0 (cũ: chỉ khung cuối, còn 15 % rồi tắt phụt)
thay('vệt chém tan mềm', "const last=fi===f.buoc.length-1, a=f.al*(last?Math.max(0.15,1-(f.t-acc)/f.buoc[fi]):1);",
     "const last=fi===f.buoc.length-1, p_=(f.t-acc)/f.buoc[fi], a=f.al*(f.ten==='vet'?(last?0.65*(1-p_)*(1-p_*0.4):fi===f.buoc.length-2?1-0.35*p_:1):(last?Math.max(0.15,1-p_):1));")
# 28/10 (nhận xét iPhone "nhảy lên rơi xuống hơi cứng, nặng"): đường cong trọng lực MỀM khi bật NHAY.moi (khối Âm Đao) – vùng đỉnh chuyển mượt
# (smoothstep thay đường thẳng) + tốc độ rơi tiến DẦN tới trần (không gãy ở maxFall). ?nhay=cu → đúng công thức cũ.
thay('nhảy mềm: vùng đỉnh smoothstep', "const a=Math.min(1,Math.abs(pl.vy)/P.apexThreshold), top=I.j?P.apexGravMul:0.8;",
     "const a0=Math.min(1,Math.abs(pl.vy)/P.apexThreshold), a=NHAY.moi?a0*a0*(3-2*a0):a0, top=I.j?P.apexGravMul:0.8;")
thay('nhảy mềm: rơi tiến dần tới trần', "  pl.vy=Math.min(pl.vy+g,P.maxFall);\n  const ws=",
     "  pl.vy=NHAY.moi?NHAY.tran(pl.vy+g):Math.min(pl.vy+g,P.maxFall);\n  const ws=")
# 28/10 (người dùng: "màn hình bị kéo khi sang phòng" → LÀM CAMERA KIỂU DEAD CELLS): camera đi theo Lam LIÊN TỤC qua các phòng nối liền,
# chỉ kẹp ở mép KHU chơi (= mép thế giới: các phòng liền nhau, tách bằng ranh bịt kín cả chiều cao); look-ahead theo tốc độ chạy + trễ quay đầu;
# dọc có vùng chết. Trục nền S.rc cố định trong khu (parallax liên tục). Đánh boss thật → khoá sân boss như cũ. ?cam=phong = camera cũ (so).
thay('camera Dead Cells: hàm + số', "function roomAt(x){ for(const r of ROOMS) if(x>=r.x0*T && x<(r.x0+r.w)*T) return r.i; return x<0?0:ROOMS.length-1; }",
     "function roomAt(x){ for(const r of ROOMS) if(x>=r.x0*T && x<(r.x0+r.w)*T) return r.i; return x<0?0:ROOMS.length-1; }\n" + open(os.path.join(HERE, 'camera-dead-cells.js'), encoding='utf-8').read().rstrip())
thay('camera Dead Cells: đặt camera khi đặt Lam',
     "  S.camx=clamp(pl.x+pl.w/2-W/2,r.x0*T,(r.x0+r.w)*T-W); S.pcx=S.camx; S.rc=r.x0*T+r.w*T/2-W/2; S.prc=S.rc; S.look=48;\n",
     "  if(CAM.phong){ S.camx=clamp(pl.x+pl.w/2-W/2,r.x0*T,(r.x0+r.w)*T-W); S.pcx=S.camx; S.rc=r.x0*T+r.w*T/2-W/2; S.prc=S.rc; S.look=48; }\n  else camDat();   // 28/10: camera kiểu Dead Cells\n")
thay('camera Dead Cells: mỗi bước',
     "  S.look=approach(S.look,pl.face*48,2.4);\n  const tx=clamp(pl.x+pl.w/2-W/2+S.look,r.x0*T,(r.x0+r.w)*T-W);\n  S.camx+=(tx-S.camx)*0.1; if(Math.abs(tx-S.camx)<0.02) S.camx=tx;\n"
     "  S.camy=approach(S.camy,touchMode?28:0,1);   // cảm ứng: đặt nhân vật lệch lên để nút không che\n"
     "  const rcT=r.x0*T+r.w*T/2-W/2; S.rc+=(rcT-S.rc)*0.1; if(Math.abs(rcT-S.rc)<0.02) S.rc=rcT;\n",
     "  if(!CAM.phong) camBuoc();   // 28/10: camera kiểu Dead Cells (đi theo Lam liên tục, kẹp mép thế giới) – ?cam=phong: khoá theo phòng như cũ ↓\n  else {\n"
     "  S.look=approach(S.look,pl.face*48,2.4);\n  const tx=clamp(pl.x+pl.w/2-W/2+S.look,r.x0*T,(r.x0+r.w)*T-W);\n  S.camx+=(tx-S.camx)*0.1; if(Math.abs(tx-S.camx)<0.02) S.camx=tx;\n"
     "  S.camy=approach(S.camy,touchMode?28:0,1);   // cảm ứng: đặt nhân vật lệch lên để nút không che\n"
     "  const rcT=r.x0*T+r.w*T/2-W/2; S.rc+=(rcT-S.rc)*0.1; if(Math.abs(rcT-S.rc)<0.02) S.rc=rcT;\n  }\n")
thay('khối Âm Đao, rồi khởi động', "\nboot();\n</script>", "\n" + KHOI + "\nboot();\n</script>")

out = src; loi = []
for mo_ta, cu, moi, lan in R:
    n = out.count(cu)
    if n != lan:
        loi.append('%s: khớp %d lần (cần %d)' % (mo_ta, n, lan)); continue
    out = out.replace(cu, moi)
if loi:
    sys.exit('LỖI – index.html (P0-A) đã đổi, sửa script:\n  ' + '\n  '.join(loi))
dst = os.path.join(THU, 'am-dao.html')
open(dst, 'w', encoding='utf-8').write(out)
print('ghi', dst, len(out.encode('utf-8')), 'byte')
