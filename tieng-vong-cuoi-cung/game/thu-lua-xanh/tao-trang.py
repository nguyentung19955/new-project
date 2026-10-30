import base64,json,os
h=os.path.dirname(os.path.abspath(__file__)); a=os.path.join(h,'../../art/lua-xanh/')
t=open(os.path.join(h,'khung.html')).read()
t=t.replace('__PNG__',base64.b64encode(open(a+'lua-xanh-sheet.png','rb').read()).decode()).replace('__META__',open(a+'lua-xanh-sheet.json').read())
open(os.path.join(h,'index.html'),'w').write(t)
