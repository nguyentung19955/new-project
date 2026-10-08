#!/bin/sh
# Ảnh soi phóng to vài dòng: sh soi.sh sword 2 3  -> ghi ra thư mục tạm (đặt S=thư-mục nếu muốn chỗ khác)
T=$1; shift; S=${S:-/tmp}
for f in "$@"; do
  python3 "$(dirname "$0")/dung.py" soi "bang([{type:'$T',family:$f}],{title:'',scale:4,cellH:${H:-330},be:true})" $S/soi-$T-$f.png >/dev/null && python3 -c "
from PIL import Image
im=Image.open('$S/soi-$T-$f.png'); w,h=im.size; im.crop((0,84,w,h)).save('$S/soi-$T-$f.png')"
done
