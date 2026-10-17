#!/bin/bash
# Chạy lại mọi công cụ dựng cũ (bắt ảnh to) rồi dựng nét 3/4. Nhật ký: ra/log-<công cụ>.txt
cd "$(dirname "$0")"
R=../../../../..
for t in \
 docs/anh-goc/zed/hieu-ung/cat_dot_3.py docs/anh-goc/zed/hieu-ung/cat_phi_tieu.py docs/anh-goc/zed/hieu-ung/cat_tu_luc.py \
 docs/review/ke-hoach-cai-thien/ve-tay-8-gop-tran/cong-cu/dung-gop.py:--ghi+--ham+gan \
 docs/review/ke-hoach-cai-thien/con-ve-tay-6/cong-cu/dung-dot6.py:--ghi \
 docs/review/ke-hoach-cai-thien/con-ve-tay/cong-cu/dung-dot3.py:--ghi \
 docs/review/ke-hoach-cai-thien/con-ve-tay/cong-cu/dung-dot2.py:--ghi \
 docs/review/ke-hoach-cai-thien/trum-moi/cong-cu/dung-hieu-ung-trum.py:--ghi \
 docs/review/ke-hoach-cai-thien/trum-moi/cong-cu/dung-hieu-ung-them.py:--ghi \
 docs/review/ke-hoach-cai-thien/trum-moi/cong-cu/dung-khung-giao-dien.py:--ghi \
 docs/review/ke-hoach-cai-thien/hieu-ung-ky-nang/cong-cu/dung-hieu-ung.py:--ghi \
 docs/anh-goc/vung-4/mau/xuat-mau.py \
 docs/review/ke-hoach-cai-thien/ve-tay-8-gop-giao-dien/cong-cu/cat-gd.py \
 docs/review/ke-hoach-cai-thien/buoc-1-lam-chac/cong-cu/dung-bt-dong.py:--ghi \
 docs/review/ke-hoach-cai-thien/npc-ban-do-bao-truoc/cong-cu/dung-bao-truoc.py:--ghi \
 docs/review/ke-hoach-cai-thien/npc-ban-do-bao-truoc/cong-cu/dung-ban-do.py:--ghi \
 docs/anh-goc/buoc-2/cat_buoc_2.py docs/anh-goc/ep-do/cat_ep_do.py \
 docs/review/ke-hoach-cai-thien/ve-tay-8-dot-1/cong-cu/dung-hud.py:--ghi+--ham+gan \
 docs/review/ke-hoach-cai-thien/vu-khi-cu-con-sot/dung-nut-vk.py ; do
  f=${t%%:*}; a=""; [[ $t == *:* ]] && a=${t#*:}; a=${a//+/ }
  b=$(basename $f .py)
  echo "=== $b" >> ra/log-het.txt
  timeout 1500 python3 chay_lai.py $R/$f $a > ra/log-$b.txt 2>&1 && \
  timeout 1500 python3 dung_net_cao.py ra/net-cao/bat-$b.pkl >> ra/log-$b.txt 2>&1
  tail -3 ra/log-$b.txt >> ra/log-het.txt
done
echo XONG >> ra/log-het.txt
