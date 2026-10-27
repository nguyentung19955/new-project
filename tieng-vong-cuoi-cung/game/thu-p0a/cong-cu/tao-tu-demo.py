#!/usr/bin/env python3
"""Tạo game/thu-p0a/index.html từ game/demo.html (KHÔNG sửa demo.html) – trang thử P0-A (nhịp đánh + Thế).

Mỗi chỗ thay là một cặp (cũ → mới) phải khớp ĐÚNG số lần ghi (mặc định 1) – demo.html đổi khác thì dừng và báo chỗ nào.
Cột `ghep` = True: phần CẦN GHÉP khi đưa P0-A vào game chính sau khi duyệt; False: chỉ cho bản thử (đường dẫn, tiêu đề, phòng thử).
Khối logic ở cong-cu/khoi-p0a.js (chèn trước boot()). Chạy: python3 game/thu-p0a/cong-cu/tao-tu-demo.py"""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.normpath(os.path.join(HERE, '..', '..'))
src = open(os.path.join(GAME, 'demo.html'), encoding='utf-8').read()
KHOI = open(os.path.join(HERE, 'khoi-p0a.js'), encoding='utf-8').read()

R = []
def thay(mo_ta, cu, moi, ghep=True, lan=1):
    R.append((mo_ta, cu, moi, ghep, lan))

# ---- chỉ bản thử: tiêu đề + đường dẫn (thư mục thu-p0a/ sâu hơn 1 cấp)
thay('tiêu đề', '<title>Tiếng Vọng – Demo Làng Chuông</title>', '<title>Tiếng Vọng – Thử P0-A (nhịp đánh + Thế)</title>', False)
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
thay('màn bắt đầu', '<p class="big">Demo Làng Chuông · khoảng 5–8 phút</p>',
     '<p class="big">Thử P0-A · nhịp đánh, hàng chờ 1 nhát, Chuông Gỗ, quái gác có Thế</p>\n    <p id="start-p0" style="color:#7FE0C8"></p>', False)
thay('nút ⚙ đổi nhịp', '<button id="set-dbg" class="alt" type="button">Debug animation: Tắt</button>',
     '<button id="set-p0" class="alt" type="button">Nhịp đánh</button>\n    <button id="set-dbg" class="alt" type="button">Debug animation: Tắt</button>', False)

# ---- phòng thử A–B–C (so-do-phong-thu-v2.png) nối SAU phòng boss; làng cũ giữ nguyên (?vao=lang)
thay('3 phòng P0-A', "RE=room('Chuông Gác Làng',30);",
     "RE=room('Chuông Gác Làng',30), PA=room('Khởi đầu',24), PB=room('Sân hai chuông',34), PC=room('Hành lang gác',32);", False)
thay('bản đồ 3 phòng', "fill(RE,0,0,RE.w-1,1,'S'); fill(RE,0,2,1,8,'S'); fill(RE,29,2,29,13,'S');",
     "fill(RE,0,0,RE.w-1,1,'S'); fill(RE,0,2,1,8,'S'); fill(RE,29,2,29,13,'S');\n"
     "// P0-A: A khởi đầu (tường trái, chuông lưu, hình nộm) · B sân 2 Chuông Gỗ + ván giữa · C hành lang trần 8 ô (hàng 6–13), quái gác, cổng\n"
     "fill(PA,0,0,0,13,'S'); fill(PB,15,10,18,10,'='); fill(PC,0,0,PC.w-1,5,'S'); fill(PC,22,6,22,8,'S'); fill(PC,PC.w-1,6,PC.w-1,13,'S');", False)
thay('boss chỉ ở phòng boss (không còn là phòng cuối)', 'S.room>=ROOMS.length-2', '(S.room===RE.i||S.room===RE.i-1)', False, lan=4)
thay('quái P0-A', "const Q=[ mkQuai(RB,7,FLOOR,2,13,false), mkQuai(RB,18,11*T,14,23,false), mkQuai(RB,30,FLOOR,30,31,true) ];",
     "const Q=[ mkQuai(RB,7,FLOOR,2,13,false), mkQuai(RB,18,11*T,14,23,false), mkQuai(RB,30,FLOOR,30,31,true),\n"
     "  mkQuai(PB,8,FLOOR,4,13,false), mkQuai(PB,23,FLOOR,19,28,false), mkQuai(PC,17,FLOOR,17,18,true), mkQuai(PA,10,FLOOR,10,11,false) ];\n"
     "Q[6].nom=true; Q[4].face=1;   // P0-A: Q[3], Q[4] Chuông Gỗ lệch pha · Q[5] quái gác có Thế · Q[6] hình nộm", False)
thay('cổng sau quái gác', "const dE=mkDoor(RE,1,()=>true,'none',null);",
     "const dE=mkDoor(RE,1,()=>true,'none',null);\nconst dP=mkDoor(PC,22,()=>qDown(Q[5]),'now',[()=>qDown(Q[5])]);", False)
thay('chuông lưu phòng A', "const BELLS=[A1,RB,RD].map((r,i)=>({x:(r.x0+(i===2?14:2))*T+16, y:FLOOR, on:false, ring:0, cd:0}));",
     "const BELLS=[A1,RB,RD].map((r,i)=>({x:(r.x0+(i===2?14:2))*T+16, y:FLOOR, on:false, ring:0, cd:0}));\n"
     "BELLS.push({x:(PA.x0+2)*T+16, y:FLOOR, on:false, ring:0, cd:0});", False)
thay('ván mới: vào phòng A', "  for(const q of Q) q.H=null; boss.H=null;   // tư thế rig làm lại từ đầu\n}",
     "  for(const q of Q) q.H=null; boss.H=null;   // tư thế rig làm lại từ đầu\n  P0.vanMoi();\n}", False)

# ---- phần GHÉP vào game (nhịp, hàng chờ, D bền, công thức, Thế)
thay('quái: máu / Thế theo LOAI_QUAI', "q.at=0; q.fade=1; q.c2='quai-di'; q.k2=0; }", "q.at=0; q.fade=1; q.c2='quai-di'; q.k2=0; P0.datQuai(q); }")
thay('bảng khung: cắt theo su mới TRƯỚC khi kiểm', "  for(const [ten,d] of Object.entries(meta.don)){ const a=ATK[d.atk];",
     "  P0.catBang(meta);   // P0-A: cắt khung_theo_atkT + vetBatDau = su (KHGP2 3c)\n  for(const [ten,d] of Object.entries(meta.don)){ const a=ATK[d.atk];")
thay('D bền: tạo lúc ra đòn', "pl.atkN=n; pl.atkT=0; pl.atkSw=++swingId; pl.atkBounced=false; pl.atkBuf=0;",
     "pl.atkN=n; pl.atkT=0; pl.atkSw=++swingId; pl.atkBounced=false; pl.atkBuf=0; pl.D=P0.taoDonLam(n);")
thay('xoá chờ: rút dao', "  if(pl.drawT>0){ pl.drawT--; pl.jumpBuf=pl.atkBuf=pl.dashBuf=0; }",
     "  if(pl.drawT>0){ pl.drawT--; P0.xoaCho('rut-dao'); pl.jumpBuf=pl.atkBuf=pl.dashBuf=0; }")
thay('xoá chờ: lướt hủy đòn', "pl.dashCd=P.dashFrames+P.dashCooldown; pl.atkN=0; pl.dashBuf=0;",
     "pl.dashCd=P.dashFrames+P.dashCooldown; pl.atkN=0; pl.dashBuf=0; P0.xoaCho('luot');")
thay('chọn đòn: hàng chờ 1 nhát + ngưỡng 0,7',
     """  const wantDown=!pl.onGround && (downHeld() || (P.autoPogo && pl.vy>-2 && pogoTarget()));
  if(pl.atkBuf>0 && pl.dash<=0 && pl.hurtT<=8){
    if(!pl.atkN || (pl.atkN===4 && pl.atkBounced)){
      const n=wantDown?4:(!pl.onGround?6:(I.u?5:1));
      startAtk(n,dir); pl.pogoBuf=(n===6)?P.pogoBuf:0;
    } else if(pl.onGround && pl.atkN<3){ const a=ATK[pl.atkN]; if(pl.atkT>=a.su+a.ac) startAtk(pl.atkN+1,dir); }
  } else if(pl.pogoBuf>0 && wantDown && pl.dash<=0 && pl.atkN!==4){
    startAtk(4,0); pl.pogoBuf=0;
  }""",
     "  P0.chonDon(dir);   // P0-A: hàng chờ 1 nhát (KHGP2 3b) + ngưỡng hướng 0,7 khi ra đòn; ?p0=0 = đúng code cũ")
thay('xoá chờ: đặt lại vị trí', "pl.jumpBuf=pl.atkBuf=pl.dashBuf=0; pl.airJump=false;", "P0.xoaCho('dat-lai'); pl.jumpBuf=pl.atkBuf=pl.dashBuf=0; pl.airJump=false;")
thay('bản ghi bóng: hộp mang goc/co/maGoc', "  if(hb){ s.hb=true; s.hx=hb.x; s.hy=hb.y; s.hw=hb.w; s.hh=hb.h; } else s.hb=false;",
     "  if(hb){ s.hb=true; s.hx=hb.x; s.hy=hb.y; s.hw=hb.w; s.hh=hb.h; } else s.hb=false;\n  P0.ghiHop(s,hb);")
thay('lần phát bóng mới: bảng maGoc→maReplay mới', "echo.px=REC[0].x; echo.py=REC[0].y; echo.warn=false;",
     "echo.px=REC[0].x; echo.py=REC[0].y; echo.warn=false; P0.phatMoi();")
thay('xoá chờ: bị đánh', "  pl.hp--; pl.iframes=P.hurtIFrames;", "  P0.xoaCho('bi-danh'); pl.hp--; pl.iframes=P.hurtIFrames;")
thay('quái gác không gây sát thương chạm', "if(q.st!=='die' && q.st!=='sleep' && q.st!=='awake' && !pl.dead && overlap(pl,q)) hurt(",
     "if(!q.guard && q.st!=='die' && q.st!=='sleep' && q.st!=='awake' && !pl.dead && overlap(pl,q)) hurt(")
thay('nhận lần bấm khi tạm dừng (log)', "  readInput();\n  if(S.paused) return;", "  readInput();\n  if(S.paused){ P0.bamKhiDung(); return; }")
thay('nhận lần bấm Chém', "  if(pressed('a')) pl.atkBuf=8;", "  if(pressed('a')) P0.bam();")
thay('trúng: gom theo tick, D bền cho Lam + bóng',
     """  if(hb){
    const n=pl.atkN, hit=applyHits(hb,'p',pl.atkSw,pl.face,n);
    if(n===4 && !pl.atkBounced && hit) pogoBounce(hb);
  }
  if(rec){ recordFrame(hb); if(rec.n>=P.echoFrames) stopRec(); }
  updateEcho();
  if(echo && !echo.done && echo.cur.hb){ const c=echo.cur; EHB.x=c.hx; EHB.y=c.hy; EHB.w=c.hw; EHB.h=c.hh; applyHits(EHB,'e',c.sw,c.f,c.n); }""",
     """  if(hb){
    const n=pl.atkN, hit=P0.thuThap(pl.D,hb,pl.face,n);   // P0-A: D tạo lúc ra đòn, sống suốt các tick hộp bật
    if(n===4 && !pl.atkBounced && hit) pogoBounce(hb);
  }
  if(rec){ recordFrame(hb); if(rec.n>=P.echoFrames) stopRec(); }
  updateEcho();
  if(echo && !echo.done && echo.cur.hb) P0.thuThapBong(echo.cur);   // D bóng tra theo maGoc của lần phát này
  P0.giaiQuyet();   // gom mọi lần trúng của tick: không phụ thuộc thứ tự duyệt""")
thay('đổi phòng: xoá chờ', "  S.room=roomAt(pl.x+pl.w/2);\n  const r=ROOMS[S.room];", "  S.room=roomAt(pl.x+pl.w/2); P0.doiPhong();\n  const r=ROOMS[S.room];")
thay('cuối bước (log nhịp cũ, bảng tick)', "  if(pl.jumpBuf>0) pl.jumpBuf--; if(pl.atkBuf>0) pl.atkBuf--; if(pl.dashBuf>0) pl.dashBuf--;\n}",
     "  if(pl.jumpBuf>0) pl.jumpBuf--; if(pl.atkBuf>0) pl.atkBuf--; if(pl.dashBuf>0) pl.dashBuf--;\n  P0.cuoiBuoc();\n}")
thay('hitbox hình nộm', "  for(const w of WAVES) if(w.on) hbRect(", "  P0.veHitbox(al);\n  for(const w of WAVES) if(w.on) hbRect(")
thay('lớp debug input', "  if(HBO.on) drawHitbox(al);\n", "  if(HBO.on) drawHitbox(al);\n  P0.veDebug(al);\n")
thay('khối P0-A, rồi khởi động', "\nboot();\n</script>", "\n" + KHOI + "\nboot();\n</script>")

out = src
loi = []
for mo_ta, cu, moi, ghep, lan in R:
    n = out.count(cu)
    if n != lan:
        loi.append('%s: khớp %d lần (cần %d)' % (mo_ta, n, lan))
        continue
    out = out.replace(cu, moi)
if loi:
    sys.exit('LỖI – demo.html đã đổi, sửa script:\n  ' + '\n  '.join(loi))
dst = os.path.join(GAME, 'thu-p0a', 'index.html')
open(dst, 'w', encoding='utf-8').write(out)
print('ghi', dst, len(out.encode('utf-8')), 'byte')
print('Phần GHÉP vào demo.html (%d chỗ):' % sum(1 for r in R if r[3]), '; '.join(m for m, _, _, g, _ in R if g))
