#!/usr/bin/env bash
# CỔNG KIỂM TRƯỚC KHI ĐĂNG WEB (phiên F1, docs/review/ke-hoach-cai-thien/on-dinh-f1-phat-hanh/bao-cao.md)
# Workflow .github/workflows/linh-khi-hosting.yml chạy đúng tệp này trước khi đăng; FAIL thì không đăng, bản đang chạy giữ nguyên.
# Chạy trên máy (từ gốc repo):   bash tools/phat-hanh/cong_kiem.sh [thư-mục-ra]      (mặc định: /tmp/lk-cong)
#
# Bỏ bước (chỉ để gỡ rối trên máy, workflow không dùng): LK_BO_DUNG=1 (dùng dist có sẵn, không dựng lại), LK_BO_SMOKE=1.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="${1:-${RUNNER_TEMP:-/tmp}/lk-cong}"
mkdir -p "$OUT"
LOG="$OUT/cong-kiem.txt"; : > "$LOG"
TOM="${GITHUB_STEP_SUMMARY:-/dev/null}"
T0=$(date +%s)
hong() {  # hong "<tên bước>" "<lời giải thích tiếng Việt>"
  echo "::error title=Cổng kiểm: $1::$2"
  echo "CỔNG KIỂM HỎNG ở bước: $1 — $2" | tee -a "$LOG"
  { echo "## ❌ Cổng kiểm HỎNG — KHÔNG đăng web (bản đang chạy giữ nguyên)"; echo "- Bước hỏng: **$1**"; echo "- $2"; } >> "$TOM"
  echo "$1: $2" > "$OUT/loi-tom-tat.txt"
  exit 1
}
buoc() { echo; echo "=== $1 ($(( $(date +%s) - T0 )) giây) ===" | tee -a "$LOG"; }
cd "$ROOT"

buoc "1) Kiểm cú pháp mọi tệp JS (node --check)"
n=0; for f in game/js/*.js game/tests/*.js tools/xuong-sprite/*.js; do
  [ -f "$f" ] || continue
  out=$(node --check "$f" 2>&1) || hong "Lỗi cú pháp JS" "$f: $(echo "$out" | grep -m1 -E 'Error' | cut -c1-300)"
  n=$((n+1))
done
echo "  $n tệp JS: ĐẠT" | tee -a "$LOG"

buoc "2) Bài kiểm lưu mây (Firebase giả, không mạng)"
node game/tests/cloud_save_regression.test.js > "$OUT/luu-may.txt" 2>&1 || hong "Bài kiểm lưu mây" "game/tests/cloud_save_regression.test.js hỏng: $(tail -n 3 "$OUT/luu-may.txt" | tr '\n' ' ' | cut -c1-300)"
echo "  ĐẠT" | tee -a "$LOG"

# F4 (05/11, docs/review/ke-hoach-cai-thien/on-dinh-f4-chia-anh/bao-cao.md): 6 bản lưu mẫu cũ của F2 (game/tests/fixtures-luu/*.json) — nạp / nâng cấp /
# lưu → nạp lại không mất gì, ghi máy an toàn, màn Khôi phục, hai thẻ; lưu mây với Firestore giả (không mạng, không tài khoản thật).
buoc "2b) Bài kiểm bản lưu mẫu F2 (6 fixture, node, không mạng)"
node game/tests/luu_an_toan.test.js > "$OUT/luu-mau.txt" 2>&1 || hong "Bản lưu mẫu (fixture)" "game/tests/luu_an_toan.test.js hỏng: $(grep -m3 -E '✗|LỖI|Error' "$OUT/luu-mau.txt" | tr '\n' ' ' | cut -c1-300)"
tail -n 1 "$OUT/luu-mau.txt" | tee -a "$LOG"
node game/tests/luu_may.test.js > "$OUT/luu-may-mau.txt" 2>&1 || hong "Lưu mây với bản lưu mẫu" "game/tests/luu_may.test.js hỏng: $(grep -m3 -E '✗|LỖI|Error' "$OUT/luu-may-mau.txt" | tr '\n' ' ' | cut -c1-300)"
tail -n 1 "$OUT/luu-may-mau.txt" | tee -a "$LOG"

buoc "3) Kiểm ảnh nguồn (JSON, mã trùng, ô khung)"
python3 tools/phat-hanh/kiem_anh.py > "$OUT/kiem-anh.txt" 2>&1 || hong "Kiểm ảnh" "$(grep -m3 'LỖI' "$OUT/kiem-anh.txt" | tr '\n' ' ' | cut -c1-400)"
tail -n 2 "$OUT/kiem-anh.txt" | tee -a "$LOG"

if [ "${LK_BO_DUNG:-0}" != "1" ]; then
  buoc "4) Dựng dist (python3 game/build.py)"
  if [ "${HAI_TEP:-1}" = "1" ]; then
    LK_ANH_ROI="${ANH_ROI:-1}" python3 game/build.py --hai-tep > "$OUT/dung.txt" 2>&1 || hong "Dựng game" "game/build.py hỏng: $(tail -n 3 "$OUT/dung.txt" | tr '\n' ' ' | cut -c1-400)"
  else
    python3 game/build.py --mot-tep > "$OUT/dung.txt" 2>&1 || hong "Dựng game" "game/build.py hỏng: $(tail -n 3 "$OUT/dung.txt" | tr '\n' ' ' | cut -c1-400)"
  fi
  grep -E 'NGƯỜI CHƠI TẢI|Dung lượng một tệp|build-manifest' "$OUT/dung.txt" | tee -a "$LOG"
fi

buoc "5) Gói site (tools/phat-hanh/dong_goi_site.sh)"
bash tools/phat-hanh/dong_goi_site.sh "$OUT" > "$OUT/goi.txt" 2>&1 || hong "Gói site" "$(tail -n 3 "$OUT/goi.txt" | tr '\n' ' ' | cut -c1-300)"
tail -n 1 "$OUT/goi.txt" | tee -a "$LOG"

buoc "6) Kiểm tham chiếu ảnh trong site + trần dung lượng"
python3 tools/phat-hanh/kiem_anh.py --dist "$OUT/site" > "$OUT/kiem-anh-site.txt" 2>&1 || hong "Tham chiếu ảnh" "$(grep -m3 'LỖI' "$OUT/kiem-anh-site.txt" | tr '\n' ' ' | cut -c1-400)"
python3 tools/phat-hanh/kiem_dung_luong.py "$OUT/site" > "$OUT/dung-luong.txt" 2>&1 || hong "Trần dung lượng" "$(grep -m3 'LỖI' "$OUT/dung-luong.txt" | tr '\n' ' ' | cut -c1-400)"
cat "$OUT/dung-luong.txt" | tee -a "$LOG"

if [ "${LK_BO_SMOKE:-0}" != "1" ]; then
  buoc "7) Smoke test headless trên site vừa gói"
  python3 tools/phat-hanh/smoke_dist.py "$OUT/site" > "$OUT/smoke.txt" 2>&1 || hong "Smoke test" "$(grep -E 'HỎNG' "$OUT/smoke.txt" | head -n 4 | tr '\n' ' ' | cut -c1-500)"
  cat "$OUT/smoke.txt" | tee -a "$LOG"
fi

S=$(( $(date +%s) - T0 ))
echo; echo "CỔNG KIỂM: ĐẠT ($S giây)" | tee -a "$LOG"
{ echo "## ✅ Cổng kiểm ĐẠT ($S giây)"; echo '```'; grep -E 'ĐẠT|HỎNG|MB|buildId' "$LOG" | head -n 40; echo '```'; } >> "$TOM"
