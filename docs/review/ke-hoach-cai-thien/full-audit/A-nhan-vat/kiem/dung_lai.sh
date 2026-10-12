#!/bin/sh
# Gói lại bản hai tệp và khởi động lại máy chủ thử (srv2.py giữ tệp trong bộ nhớ).
D=$(cd "$(dirname "$0")" && pwd)
cd /home/claude/new-project && LK_HAI_TEP=1 python3 game/build.py --hai-tep > /tmp/claude-0/build.log 2>&1 || { tail -20 /tmp/claude-0/build.log; exit 1; }
[ -f /tmp/claude-0/srv.pid ] && kill $(cat /tmp/claude-0/srv.pid) 2>/dev/null; sleep 0.5
nohup python3 "$D/srv2.py" /home/claude/new-project/game/dist 8790 >/dev/null 2>&1 &
echo $! > /tmp/claude-0/srv.pid; sleep 1; echo dựng xong
