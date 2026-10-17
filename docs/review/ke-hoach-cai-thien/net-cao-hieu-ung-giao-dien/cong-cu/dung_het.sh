#!/bin/bash
# Dựng lại nét 3/4 từ mọi tệp bắt đã có (ra/net-cao/bat-*.pkl)
cd "$(dirname "$0")"
: > ra/log-dung-het.txt
for p in ra/net-cao/bat-*.pkl; do echo "=== $p" >> ra/log-dung-het.txt; timeout 1500 python3 dung_net_cao.py $p >> ra/log-dung-het.txt 2>&1; done
echo XONG >> ra/log-dung-het.txt
