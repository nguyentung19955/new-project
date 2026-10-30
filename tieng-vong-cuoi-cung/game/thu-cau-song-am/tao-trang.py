import base64,json,os
h=os.path.dirname(os.path.abspath(__file__)); a=os.path.join(h,'../../art/cau-song-am/')
t=open(os.path.join(h,'khung.html')).read()
t=t.replace('__PNG__',base64.b64encode(open(a+'cau-song-am-sheet.png','rb').read()).decode()).replace('__FX__',base64.b64encode(open(a+'cau-song-am-fx.png','rb').read()).decode()).replace('__META__',open(a+'cau-song-am-sheet.json').read())
open(os.path.join(h,'index.html'),'w').write(t)
