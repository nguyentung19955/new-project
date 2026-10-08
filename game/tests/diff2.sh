#!/bin/sh
# Chạy thử vài ải ở độ khó thứ hai với bản lưu mạnh, có vết sẹo. Dùng: sh tests/diff2.sh [sword|bow]
cd "$(dirname "$0")/.."
P=${1:-sword}
for ri in "0 0" "0 4" "1 2" "1 4" "2 1" "2 4"; do
  set -- $ri
  echo "== độ khó 2, ải $(($1+1))-$(($2+1)), $P"
  python3 tests/probe.py "{\"save\":{\"hero\":\"smith\",\"lvl\":28,\"tier\":2,\"sharpen\":9,\"armor\":\"a_ho\",\"helm\":\"h_ho\",\"branch\":\"poison\",\"marks\":300},\"r\":$1,\"i\":$2,\"diff\":1,\"n\":1,\"bot\":{\"prefer\":\"$P\",\"explore\":true},\"pre\":\"G.save.scars={moc:'fire',ngu:'poison',ho:'ice'}\"}"
done
