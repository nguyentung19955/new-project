#!/bin/bash
# Xuất bản wt-live (nhánh claude/mobile-tower-defense-game-k5oxzo). Dùng: pub.sh "<mô tả>"
MSG="$1"; ST=/home/claude/pubtools/pubq.st; echo RUN > $ST
cd /home/claude/wt-live || exit 1
python3 /home/claude/pubtools/thap-ver.py thap > /home/claude/pubtools/ver.log 2>&1 || { echo VERFAIL > $ST; exit 1; }
pkill -f "http.serve[r] 8799"; (cd thap && python3 -m http.server 8799 >/dev/null 2>&1 &); sleep 1
OUT=$(cd /dev/shm && NODE_PATH=/opt/npm-tools/node_modules timeout 60 node /home/claude/pubtools/tut.js 2>&1); pkill -f "http.serve[r] 8799"
echo "$OUT" > /home/claude/pubtools/smoke.log
echo "$OUT" | grep -q '"dang":true' && echo "$OUT" | grep -q 'errors: \[\]' || { echo SMOKEFAIL > $ST; exit 1; }
git add -A thap && git commit -q -m "thap: xuất bản — $MSG

Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01KQA7LFBkcdkiPiLcwYs7V2" && git push -q origin HEAD:claude/mobile-tower-defense-game-k5oxzo && echo PUSHED > $ST || echo PUSHFAIL > $ST
