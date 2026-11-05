# Bảng mẫu phông: vẽ canvas trong Chromium không màn hình ở cỡ thật (đơn vị game × 1,444 × DPR 3)
# Bảng mẫu phông (Talesworn phiên E). Cần: git clone --depth 1 --filter=blob:none --sparse https://github.com/google/fonts.git /tmp/gfonts
#   rồi git sparse-checkout set ofl/<tên> ...; chạy: python3 bang-mau.py td|than|so <ảnh ra.png>
import json, sys, os, pathlib
from playwright.sync_api import sync_playwright
OFL=os.environ.get('OFL', '/tmp/gfonts/ofl'); BVP=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'fonts', 'be-vietnam-pro')
F={ # khóa: (tên hiển thị, tệp, đủ VI?)
 'jacquard12':('Jacquard 12',OFL+'/jacquard12/Jacquard12-Regular.ttf'),
 'jacquard24':('Jacquard 24',OFL+'/jacquard24/Jacquard24-Regular.ttf'),
 'jacquardabastarda9':('Jacquarda Bastarda 9',OFL+'/jacquardabastarda9/JacquardaBastarda9-Regular.ttf'),
 'grenzegotisch':('Grenze Gotisch',OFL+'/grenzegotisch/GrenzeGotisch[wght].ttf'),
 'texturina':('Texturina',OFL+'/texturina/Texturina[opsz,wght].ttf'),
 'pirataone':('Pirata One',OFL+'/pirataone/PirataOne-Regular.ttf'),
 'cinzeldecorative':('Cinzel Decorative',OFL+'/cinzeldecorative/CinzelDecorative-Bold.ttf'),
 'alegreyasc':('Alegreya SC',OFL+'/alegreyasc/AlegreyaSC-Bold.ttf'),
 'cormorantsc':('Cormorant SC',OFL+'/cormorantsc/CormorantSC-Bold.ttf'),
 'uncialantiqua':('Uncial Antiqua',OFL+'/uncialantiqua/UncialAntiqua-Regular.ttf'),
 'medievalsharp':('MedievalSharp',OFL+'/medievalsharp/MedievalSharp.ttf'),
 'pixelifysans':('Pixelify Sans',OFL+'/pixelifysans/PixelifySans[wght].ttf'),
 'alegreyasans':('Alegreya Sans',OFL+'/alegreyasans/AlegreyaSans-Bold.ttf'),
 'grenze':('Grenze',OFL+'/grenze/Grenze[wght].ttf'),
 'jersey10':('Jersey 10',OFL+'/jersey10/Jersey10-Regular.ttf'),
 'jersey15':('Jersey 15',OFL+'/jersey15/Jersey15-Regular.ttf'),
 'tiny5':('Tiny5',OFL+'/tiny5/Tiny5[BLED,JITT,ROND,wdth,wght].ttf'),
 'vt323':('VT323',OFL+'/vt323/VT323-Regular.ttf'),
 'handjet':('Handjet',OFL+'/handjet/Handjet[ELGR,ELSH,wght].ttf'),
 'silkscreen':('Silkscreen',OFL+'/silkscreen/Silkscreen-Bold.ttf'),
 'bevietnampro':('Be Vietnam Pro (hiện tại)',BVP+'/BeVietnamPro-Bold.ttf'),
}
from fontTools.ttLib import TTFont
VI="ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ"; VI=VI+VI.upper()
cov={k:all(ord(c) in TTFont(v[1]).getBestCmap() for c in VI) for k,v in F.items()}
ROLE={'td':(['jacquard12','jacquard24','jacquardabastarda9','grenzegotisch','texturina','pirataone','cinzeldecorative','alegreyasc','cormorantsc','uncialantiqua','medievalsharp','pixelifysans','bevietnampro'],14),
      'than':(['pixelifysans','alegreyasans','grenze','jersey10','jersey15','tiny5','vt323','handjet','bevietnampro'],8),
      'so':(['silkscreen','pixelifysans','jersey10','tiny5','vt323','handjet','bevietnampro'],13)}
role=sys.argv[1]; out=sys.argv[2]
keys,size=ROLE[role]
K=1.444*3
ff=''.join("@font-face{font-family:'C_%s';src:url('file://%s');}"%(k,F[k][1]) for k in keys)
TXT=['TALESWORN — Chapter I: Thornwood','Rowan · Forge · Toadstool King','Rừng Gai · Lò rèn · Vua Nấm · Luyện lên 5','1234567890']
html="<html><head><style>%s body{margin:0;background:#1a1410}</style></head><body><canvas id=c></canvas></body></html>"%ff
js="""async ([keys,names,cov,size,K,TXT,role])=>{
 for(const k of keys){ await document.fonts.load('700 20px C_'+k); await document.fonts.load('400 20px C_'+k);}
 const W=1500, rowH=size*K*1.5, blockH=46+4*rowH+ (role==='td'?size*K*0.2:0);
 const c=document.getElementById('c'); c.width=W; c.height=keys.length*blockH+10; const g=c.getContext('2d');
 g.fillStyle='#1a1410'; g.fillRect(0,0,W,c.height);
 keys.forEach((k,i)=>{ const y0=i*blockH+6;
   g.fillStyle=i%2?'#241b14':'#2b2017'; g.fillRect(4,y0,W-8,blockH-6);
   g.font='600 22px sans-serif'; g.fillStyle='#ffd27a'; g.fillText((i+1)+'. '+names[i]+(cov[i]?'  — đủ dấu tiếng Việt':'  — THIẾU dấu tiếng Việt (dòng 3 lẫn phông)'),16,y0+28);
   const sz = role==='so'? [size,size,size,size]: [size,size*0.9,size*0.9,size*0.9];
   TXT.forEach((t,j)=>{ const s= role==='so' ? (j===3?size:8): sz[j];
     g.font='700 '+(s*K)+'px "C_'+k+'", sans-serif'; g.fillStyle= j===2&&!cov[i]? '#ff9a8a':'#f7eaca';
     g.fillText(t,20,y0+40+rowH*(j+0.8)); });
 });
 return c.toDataURL('image/png');}"""
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page()
    pth='/tmp/bang-mau-phong.html'; open(pth,'w').write(html); pg.goto('file://'+pth)
    d=pg.evaluate(js,[keys,[F[k][0] for k in keys],[cov[k] for k in keys],size,K,TXT,role])
    import base64; open(out,'wb').write(base64.b64decode(d.split(',')[1])); b.close()
print(out)
