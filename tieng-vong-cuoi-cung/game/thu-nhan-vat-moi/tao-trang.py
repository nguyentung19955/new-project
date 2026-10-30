# Build a self-contained test page for the new character sheet (art/nhan-vat-moi).
import base64,json,os
H=os.path.dirname(os.path.abspath(__file__)); A=os.path.join(H,'..','..','art','nhan-vat-moi')
png=base64.b64encode(open(os.path.join(A,'nhan-vat-moi-sheet.png'),'rb').read()).decode()
meta=json.load(open(os.path.join(A,'nhan-vat-moi-sheet.json'),encoding='utf-8'))
html=open(os.path.join(H,'khung.html'),encoding='utf-8').read().replace('__PNG__',png).replace('__META__',json.dumps(meta,ensure_ascii=False))
open(os.path.join(H,'index.html'),'w',encoding='utf-8').write(html); print('ok',len(html))
