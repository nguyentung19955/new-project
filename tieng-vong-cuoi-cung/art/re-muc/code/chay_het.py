"""Chạy lại toàn bộ asset Rễ Mục: nền → gạch → đồ vật → trang trí (≈ 25 giây; cần Pillow, numpy, scipy).
python3 -B chay_het.py  (trong art/re-muc/code)"""
import nen_rm
import gach_rm
import do_vat_rm
import trang_tri_rm

nen_rm.chay()
gach_rm.chay()
do_vat_rm.chay()
trang_tri_rm.chay()
print('xong – ảnh duyệt cảnh thật: game/thu-re-muc/xem-thu/ (python3 -B game/thu-re-muc/cong-cu/chup.py)')
