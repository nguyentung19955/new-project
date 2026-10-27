#!/usr/bin/env python3
"""Tạo game/thu-re-muc/thu-re-muc.html từ game/demo.html (KHÔNG sửa demo.html) – màn thử RỄ MỤC nối sau Phòng boss.

Mỗi chỗ thay là một cặp (cũ → mới) phải khớp ĐÚNG 1 lần – demo.html đổi khác thì dừng và báo chỗ nào (phiên khác đang sửa demo.html).
Cột `ghep` = True: là phần CẦN GHÉP khi đưa Rễ Mục vào demo.html (xem GHI-CHU.md mục "cách ghép"); False: chỉ cho bản thử (đường dẫn,
tiêu đề, khối THỬ). Khối mã Rễ Mục nằm trong cong-cu/khoi-re-muc.js (chèn trước boot()).

Chạy: python3 game/thu-re-muc/cong-cu/tao-tu-demo.py"""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.normpath(os.path.join(HERE, '..', '..'))
src = open(os.path.join(GAME, 'demo.html'), encoding='utf-8').read()
KHOI = open(os.path.join(HERE, 'khoi-re-muc.js'), encoding='utf-8').read()

R = []
def thay(mo_ta, cu, moi, ghep=True):
    R.append((mo_ta, cu, moi, ghep))

# ---- chỉ bản thử: tiêu đề + đường dẫn (thư mục thu-re-muc/ sâu hơn 1 cấp)
thay('tiêu đề', '<title>Tiếng Vọng – Demo Làng Chuông</title>', '<title>Tiếng Vọng – Thử Rễ Mục (tường mục leo được)</title>', False)
thay('script runtime', '<script src="runtime/quai-boss-runtime.js"></script>', '<script src="../runtime/quai-boss-runtime.js"></script>', False)
thay('script trang trí', '<script src="runtime/trang-tri-dia-hinh.js"></script>', '<script src="../runtime/trang-tri-dia-hinh.js"></script>', False)
for m in ('cong-lang', 'san-chuong'):
    thay('dữ liệu ' + m, '<script src="runtime/trang-tri/%s.js"></script>' % m, '<script src="../runtime/trang-tri/%s.js"></script>' % m, False)
thay('dữ liệu phong-boss + re-muc', '<script src="runtime/trang-tri/phong-boss.js"></script>',
     '<script src="../runtime/trang-tri/phong-boss.js"></script>\n<script src="../runtime/trang-tri/re-muc.js"></script>')
for cu, moi in [("lam:'../art/modular/lam-moi/rig-v4/", "lam:'../../art/modular/lam-moi/rig-v4/"), ("lam:'../art/modular/lam-moi/rig-v3/", "lam:'../../art/modular/lam-moi/rig-v3/"),
                ("nghi:'anim/lam-nghi-v4-2x.png'", "nghi:'../anim/lam-nghi-v4-2x.png'"), ("nghi:'anim/lam-nghi-2x.png'", "nghi:'../anim/lam-nghi-2x.png'"),
                ("hd:   '../art/modular/", "hd:   '../../art/modular/"), ("hu:   '../art/hieu-ung/", "hu:   '../../art/hieu-ung/"),
                ("qbr:  'runtime/quai-boss/'", "qbr:  '../runtime/quai-boss/'"), ("lc:   '../art/the-gioi-moi/lang-chuong/'", "lc:   '../../art/the-gioi-moi/lang-chuong/'"),
                ("giu:  'anim/lang-chuong-giu.json'", "giu:  '../anim/lang-chuong-giu.json'"),
                ("json=await r.json(); src='anim/'+json.image; }", "json=await r.json(); src='../anim/'+json.image; }")]:
    thay('đường dẫn ' + cu.split("'")[1], cu, moi, False)
thay('đường dẫn trang trí + thêm SRC.rm / SRC.rmtt (Rễ Mục)',
     "tt:   '../art/the-gioi-moi/cong-lang-v3/cong-lang-v3.json'",
     "tt:   '../../art/the-gioi-moi/cong-lang-v3/cong-lang-v3.json',\n  rm:   '../../art/re-muc/',                              // RỄ MỤC: nen/nen.json, gach/rm-atlas.json, do-vat/do-vat.json\n  rmtt: '../../art/re-muc/trang-tri/re-muc-tt.json'      // trang trí Rễ Mục (gộp với cong-lang-v3 lúc nạp)")

# ---- phần GHÉP: bản đồ
thay('bản đồ cao 36 hàng (Rễ Mục cuộn dọc)', 'const W=960, H=540, T=32, ROWS=17, FLOOR=14*T;', 'const W=960, H=540, T=32, ROWS=36, FLOOR=14*T;   // Rễ Mục: 36 hàng (phòng cũ chỉ dùng 17 hàng trên)')
thay('thêm phòng Rễ Mục', "RE=room('Chuông Gác Làng',30);", "RE=room('Chuông Gác Làng',30), RM=room('Rễ Mục',42); RM.h=36;   // RM: cao 36 hàng → camera dọc; nối sau phòng boss")
thay('phòng cũ: đặc từ sàn xuống đáy bản đồ', "ROOMS.forEach(r=>fill(r,0,14,r.w-1,16,'#'));", "ROOMS.forEach(r=>fill(r,0,14,r.w-1,ROWS-1,'#'));   // phòng cũ: đặc từ sàn (hàng 14) tới đáy")
thay('mở lối xuống Rễ Mục ở tường phải phòng boss + dựng bản đồ Rễ Mục',
     "fill(RE,0,0,RE.w-1,1,'S'); fill(RE,0,2,1,8,'S'); fill(RE,29,2,29,13,'S');",
     "fill(RE,0,0,RE.w-1,1,'S'); fill(RE,0,2,1,8,'S'); fill(RE,29,2,29,13,'S');\nfill(RE,29,8,29,13,'.'); dungBanDoRM();   // lối xuống Rễ Mục: mở chân tường phải phòng boss (hàng 8–13); bản đồ RM trong khối Rễ Mục")
thay('ô Rễ Mục R (rễ mục) + M (tường mục) là ô chặn', "function solidC(c){ return c==='#'||c==='S'||c==='W'; }",
     "function solidC(c){ return c==='#'||c==='S'||c==='W'||c==='R'||c==='M'; }   // R: rễ mục; M: tường mục leo được (gãy → 'r' không chặn)")
thay('điểm lưu Rễ Mục', "const BELLS=[A1,RB,RD].map((r,i)=>({x:(r.x0+(i===2?14:2))*T+16, y:FLOOR, on:false, ring:0, cd:0}));",
     "const BELLS=[A1,RB,RD].map((r,i)=>({x:(r.x0+(i===2?14:2))*T+16, y:FLOOR, on:false, ring:0, cd:0}));\nBELLS.push({x:(RM.x0+5)*T+16, y:FLOOR, on:false, ring:0, cd:0});   // điểm lưu ở sàn vào Rễ Mục")
thay('2 quái chuông gỗ ở hành lang Rễ Mục', "const Q=[ mkQuai(RB,7,FLOOR,2,13,false), mkQuai(RB,18,11*T,14,23,false), mkQuai(RB,30,FLOOR,30,31,true) ];",
     "const Q=[ mkQuai(RB,7,FLOOR,2,13,false), mkQuai(RB,18,11*T,14,23,false), mkQuai(RB,30,FLOOR,30,31,true),\n  mkQuai(RM,18,32*T,15,28,false), mkQuai(RM,36,32*T,33,38,false) ];   // Rễ Mục: 2 quái tuần tra sàn hành lang (y 1024)")
thay('đặt Lam: camera dọc theo phòng', "S.camx=clamp(pl.x+pl.w/2-W/2,r.x0*T,(r.x0+r.w)*T-W); S.pcx=S.camx; S.rc=r.x0*T+r.w*T/2-W/2; S.prc=S.rc; S.look=48;",
     "S.camx=clamp(pl.x+pl.w/2-W/2,r.x0*T,(r.x0+r.w)*T-W); S.pcx=S.camx; S.rc=r.x0*T+r.w*T/2-W/2; S.prc=S.rc; S.look=48; S.camy=camYMucTieu(r); S.pcy=S.camy;")
thay('boss chỉ thức khi Lam ở trong phòng boss và boss chưa bị hạ (không thức khi Lam đã xuống Rễ Mục)', "case 'sleep': if(!pl.dead && pl.x>(RE.x0+8)*T) bossStart(); break;",
     "case 'sleep': if(!pl.dead && pl.x>(RE.x0+8)*T && S.room===RE.i && !boss.dead) bossStart(); break;")
thay('bám tường → đồng hồ tường mục', "sliding=true; pl.face=-pl.wallDir; pl.wjT=0;", "sliding=true; pl.face=-pl.wallDir; pl.wjT=0; MUC.bam();   // tường mục: đếm bước bám")
thay('mỗi bước: tường mục, đồ vật, chuyển nền', "  updateHazards();\n  if(S.won){ S.winT++; }", "  updateHazards(); RMV.buoc();   // Rễ Mục: tường mục gãy / mọc, bào tử, giọt nước, chuyển nền\n  if(S.won){ S.winT++; }")
thay('camera dọc', "S.camy=approach(S.camy,touchMode?28:0,1);   // cảm ứng: đặt nhân vật lệch lên để nút không che",
     "S.camy=camYRM(r);   // phòng có r.h (Rễ Mục): theo Lam, kẹp trong phòng; phòng cũ: như trước (cảm ứng lệch 28)")
thay('lưu camera y cho nội suy', "pl.px=pl.x; pl.py=pl.y; S.pcx=S.camx; S.prc=S.rc;", "pl.px=pl.x; pl.py=pl.y; S.pcx=S.camx; S.pcy=S.camy; S.prc=S.rc;")
thay('nội suy camera y', "ox=snap(camx+S.shx*sm); oy=snap(S.camy+S.shy*sm);", "ox=snap(camx+S.shx*sm); oy=snap(lerp(S.pcy,S.camy,al)+S.shy*sm);")
thay('hướng dẫn 1 dòng Rễ Mục', "  if(r===RE){\n    if(boss.st==='sleep'", "  if(r===RM) return 'remuc';\n  if(r===RE){\n    if(boss.st==='sleep'")
thay('gạch: chất liệu rm- cho ô R / M', "const mat=c==='S'?'da':'go';", "const mat=c==='S'?'da':(c==='R'||c==='M')?'rm':'go';")
thay('gạch: ván mục trong phòng Rễ Mục', "M[ty*WW+tx]=id('go-'+(l&&r?'van-giua':!l?'van-trai'+v:'van-phai'+v)); continue; }",
     "M[ty*WW+tx]=id((tx>=RM.x0?'rm-':'go-')+(l&&r?'van-giua':!l?'van-trai'+v:'van-phai'+v)); continue; }")
thay('gạch: 8 ô thân gen cho cả rm-', "else if(mat==='go'){ const i=Math.floor(h*8); ten=i?'than-'+(i+1):'than'; }", "else if(mat!=='da'){ const i=Math.floor(h*8); ten=i?'than-'+(i+1):'than'; }")
thay('gạch: biến thể tường / trần cho cả rm-', "else if(mat==='go' && (ten==='canh-trai'||ten==='canh-phai'||ten==='day-giua') && h>=0.4)",
     "else if(mat!=='da' && (ten==='canh-trai'||ten==='canh-phai'||ten==='day-giua') && h>=0.4)")
thay('vẽ gạch: ô tường mục vẽ theo trạng thái',
     """    for(let tx=tx0;tx<=tx1;tx++){ const v=M[ty*WW+tx]; if(v<0) continue; const q=GCH.k[v];
      const x0=Math.round((tx*T-ox)*K)/K, x1=Math.round(((tx+1)*T-ox)*K)/K;
      ctx.drawImage(cv,q[0],q[1],64,64,x0,y0,x1-x0,y1-y0); } }""",
     """    for(let tx=tx0;tx<=tx1;tx++){ const v=M[ty*WW+tx]; if(v<0) continue; const q=GCH.k[v];
      const x0=Math.round((tx*T-ox)*K)/K, x1=Math.round(((tx+1)*T-ox)*K)/K;
      if(MUC.ve(tx,ty,x0,y0,x1,y1)) continue;   // tường mục: lành / nứt / gãy (trống) / mọc lại
      ctx.drawImage(cv,q[0],q[1],64,64,x0,y0,x1-x0,y1-y0); } }""")
thay('vẽ đồ vật Rễ Mục sau trang trí mặt', "  TT.ve('mat',ox,oy);    // mép đất rễ-rêu, chân rễ – trước Lam / quái / đồ vật\n}",
     "  TT.ve('mat',ox,oy);    // mép đất rễ-rêu, chân rễ – trước Lam / quái / đồ vật\n  RMV.ve(ox,oy);         // Rễ Mục: nấm, kén, bào tử, giọt nước, chuông vỡ + mảnh tường mục rơi\n}")
thay('nền: Rễ Mục cuộn 2 chiều + chuyển mờ', "  for(const L of NEN.lop) veLop(L,ox,oy);\n}", "  veNenRM(ox,oy);   // Làng Chuông như cũ; ở Rễ Mục: 3 lớp cuộn ngang + dọc, chuyển mờ 0,5 s khi đổi phòng\n}")
thay('tiền cảnh: không vẽ rễ treo Làng Chuông ở Rễ Mục', "function drawTienCanh(){ if(NEN.tien){", "function drawTienCanh(){ if(RMV.tienCanh()) return; if(NEN.tien){")
thay('nạp Rễ Mục + gộp trang trí', "let ttLoi=''; setLoad(0.77,'Nạp + giải mã trang trí địa hình'); try{ await TT.nap(SRC.tt,window.TV&&TV.NHUNG&&TV.NHUNG.tt,p=>setLoad(0.77+0.02*p)); }",
     "await thu(napRM,'Nạp + giải mã Rễ Mục (nền, gạch, đồ vật)',0.76);\n    let ttLoi=''; setLoad(0.77,'Nạp + giải mã trang trí địa hình'); try{ await napTTGop(p=>setLoad(0.77+0.02*p)); }")
thay('gộp atlas gạch Làng Chuông + Rễ Mục', "keoMepGach(lc.gach.meta,lc.gach.img);", "gopGach(lc); keoMepGach(RM_NAP.gachMeta,RM_NAP.gachImg);")
thay('trang trí: ô R là ô gỗ (mảng rễ cắt theo); dựng đoạn tường mục + đồ vật',
     "TT.khoiTao({ctx, W, H, T, rows:ROWS, tile, solid:solidC, go:c=>c==='#'||c==='W'}); if(TT.bat){ TT.anO(GCH.map,WW); TT.nuong(); }",
     "TT.khoiTao({ctx, W, H, T, rows:ROWS, tile, solid:solidC, go:c=>c==='#'||c==='W'||c==='R'}); if(TT.bat){ TT.anO(GCH.map,WW); TT.nuong(); } MUC.dung(); RMV.dungDoVat();")
thay('overlay collider: đoạn tường mục', "  TT.veCollider(ox,oy);   // ô chặn (vàng; đá: xanh), cạnh lộ cam, bệ một chiều: vạch lục ở mép trên",
     "  TT.veCollider(ox,oy); MUC.veCollider(ox,oy);   // ô chặn (vàng; đá: xanh), cạnh lộ cam, bệ một chiều: vạch lục; tường mục: khung xanh ngọc + đồng hồ bám")
thay('khối Rễ Mục + THỬ, rồi khởi động', "\nboot();\n</script>", "\n" + KHOI + "\nboot();\n</script>")

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
dst = os.path.join(GAME, 'thu-re-muc', 'thu-re-muc.html')
open(dst, 'w', encoding='utf-8').write(out)
print('ghi', dst, len(out.encode('utf-8')), 'byte')
print('Phần GHÉP vào demo.html (%d chỗ):' % sum(1 for r in R if r[3]), '; '.join(m for m, _, _, g in R if g))
