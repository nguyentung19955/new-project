#!/usr/bin/env bash
# Báo động bằng GitHub Issue (phiên F1). GitHub tự gửi email cho chủ repo khi có issue mới / bình luận mới.
#   bash tools/phat-hanh/bao_dong.sh mo   "<tiêu đề>" <tệp nội dung>   → mở issue (đã có issue cùng tiêu đề đang mở thì thêm bình luận)
#   bash tools/phat-hanh/bao_dong.sh mo1  "<tiêu đề>" <tệp nội dung>   → như mo, nhưng issue đang mở rồi thì thôi (không gửi thêm email)
#   bash tools/phat-hanh/bao_dong.sh dong "<tiêu đề>" "<lời đóng>"     → đóng issue cùng tiêu đề nếu đang mở
# Cần GH_TOKEN (workflow: GH_TOKEN: ${{ github.token }}, permissions: issues: write) và GITHUB_REPOSITORY. Chỉ dùng REST API.
set -uo pipefail
VIEC="$1"; TIEU_DE="$2"; NOI="${3:-}"
R="${GITHUB_REPOSITORY:?}"
CHAN=$'\n\n---\n_Tự động từ GitHub Actions (phiên F1 phát hành an toàn). Hướng dẫn: docs/review/ke-hoach-cai-thien/on-dinh-f1-phat-hanh/bao-cao.md_'
SO=$(TD="$TIEU_DE" gh api "repos/$R/issues?state=open&per_page=100" --jq 'map(select(.pull_request == null and .title == env.TD)) | .[0].number // empty' 2>/dev/null || true)
if [ "$VIEC" = "mo1" ] && [ -n "$SO" ]; then
  echo "Issue #$SO đang mở, không báo lặp"
elif [ "$VIEC" = "mo" ] || [ "$VIEC" = "mo1" ]; then
  BODY="$(cat "$NOI")$CHAN"
  if [ -n "$SO" ]; then
    gh api -X POST "repos/$R/issues/$SO/comments" -f body="$BODY" > /dev/null && echo "Đã thêm bình luận vào issue #$SO"
  else
    gh api -X POST "repos/$R/issues" -f title="$TIEU_DE" -f body="$BODY" --jq '"Đã mở issue báo động #\(.number): \(.title)"'
  fi
else
  if [ -n "$SO" ]; then
    gh api -X POST "repos/$R/issues/$SO/comments" -f body="$NOI$CHAN" > /dev/null
    gh api -X PATCH "repos/$R/issues/$SO" -f state=closed -f state_reason=completed > /dev/null && echo "Đã đóng issue #$SO"
  else
    echo "Không có issue \"$TIEU_DE\" đang mở"
  fi
fi
