#!/usr/bin/env bash
# Gói thư mục site để đăng spiritblade.web.app (phiên F1 — trước đây nằm thẳng trong .github/workflows/linh-khi-hosting.yml).
# Chạy SAU khi đã dựng dist (python3 game/build.py --hai-tep). Dùng chung cho workflow đăng web VÀ cổng kiểm trên máy
# (tools/phat-hanh/cong_kiem.sh), để smoke test chạy đúng bộ tệp sẽ lên web.
#
#   bash tools/phat-hanh/dong_goi_site.sh <thư-mục-ra>
#     → <thư-mục-ra>/site/          (index.html, anh/, linh-khi.html, build-manifest.json, tệp PWA, trang công cụ)
#     → <thư-mục-ra>/firebase.json  (site, header lưu đệm)
# Biến môi trường (giữ nguyên nghĩa như trong workflow): SITE (mặc định spiritblade), HAI_TEP (mặc định 1)
#
# Bản thử (staging): mọi trang game được chèn một đoạn mã rất nhỏ ở đầu <head>: nếu tên miền là kênh xem trước của Firebase
# (có "--", ví dụ spiritblade--staging-ab12cd34.web.app) thì TỰ thêm ?cloud=0 vào địa chỉ trước khi game chạy → không đăng nhập,
# không đọc/ghi lưu mây (kênh xem trước dùng CHUNG Firestore với bản thật). Trên spiritblade.web.app đoạn mã không làm gì.
# Cờ quay lui: LK_CHAN_STAGING=0 → không chèn.
set -euo pipefail
OUT="${1:?cần thư mục ra}"
SITE="${SITE:-spiritblade}"
HAI_TEP="${HAI_TEP:-1}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
D="$ROOT/game/dist"
rm -rf "$OUT/site"; mkdir -p "$OUT/site"
S="$OUT/site"
TOM="${GITHUB_STEP_SUMMARY:-/dev/null}"

if [ "$HAI_TEP" = "1" ] && [ -f "$D/linh-khi-nhe.html" ] && [ -d "$D/anh" ]; then
  # Bản ảnh rời: trang chính + thư mục ảnh anh/ (tên có mã nội dung, lưu đệm lâu ở firebase.json bên dưới)
  cp "$D/linh-khi-nhe.html" "$S/index.html"
  cp -r "$D/anh" "$S/anh"
  cp "$D/linh-khi.html" "$S/linh-khi.html"
  echo "- Bản ảnh rời: index.html $(stat -c %s "$D/linh-khi-nhe.html") byte + anh/ $(ls "$D/anh" | wc -l) tệp ($(du -sb "$D/anh" | cut -f1) byte)" >> "$TOM"
elif [ "$HAI_TEP" = "1" ] && [ -f "$D/linh-khi-nhe.html" ] && ls "$D"/linh-khi-anh.*.json > /dev/null 2>&1; then
  # Bản 2 tệp: trang nhẹ làm trang chính, tệp ảnh tải sau nằm cạnh trang
  cp "$D/linh-khi-nhe.html" "$S/index.html"
  cp "$D"/linh-khi-anh.*.json "$S/"
  # Bản một tệp đủ ảnh vẫn đăng kèm ở /linh-khi.html: các trang công cụ (tach-quai, tach-ghep, tach-do) đọc mọi hình đang có trong game từ đó
  cp "$D/linh-khi.html" "$S/linh-khi.html"
  echo "- Bản 2 tệp: index.html $(stat -c %s "$D/linh-khi-nhe.html") byte + $(basename "$D"/linh-khi-anh.*.json)" >> "$TOM"
else
  cp "$D/linh-khi.html" "$S/index.html"
  echo "- Bản một tệp: index.html $(stat -c %s "$D/linh-khi.html") byte" >> "$TOM"
fi
cp "$ROOT"/game/web/* "$S/"
# Xưởng Sprite và bản game thử nó mở bên trong
cp "$D/xuong-sprite.html" "$D/xuong-sprite-thu.html" "$S/"
# Mọi trang công cụ tools/tach-<tên>/index.html → https://spiritblade.web.app/tach-<tên>.html
for d in "$ROOT"/tools/tach-*/; do n=$(basename "$d"); [ -f "$d/index.html" ] && cp "$d/index.html" "$S/$n.html"; done
# buildId + danh sách tệp (game/build.py ghi dist/build-manifest.json): kiểm web sau khi đăng đọc tệp này
[ -f "$D/build-manifest.json" ] && cp "$D/build-manifest.json" "$S/build-manifest.json"

if [ "${LK_CHAN_STAGING:-1}" != "0" ]; then
  CHAN='<script>/*F1 staging: kênh xem trước (tên miền có "--") luôn chạy ?cloud=0, không đụng lưu mây thật*/(function(){try{if(/--/.test(location.hostname)){var q=new URLSearchParams(location.search);window.LK_STAGING=1;if(q.get("cloud")!=="0"){q.set("cloud","0");history.replaceState(null,"",location.pathname+"?"+q.toString()+location.hash);}}}catch(e){}})();</script>'
  for f in "$S/index.html" "$S/linh-khi.html"; do
    [ -f "$f" ] || continue
    python3 - "$f" "$CHAN" <<'PY'
import sys
p, chan = sys.argv[1], sys.argv[2]
t = open(p, encoding='utf-8').read()
i = t.find('<head>')
if i < 0:
    sys.exit('không thấy <head> trong ' + p)
if 'F1 staging' not in t:
    t = t[:i + 6] + '\n' + chan + t[i + 6:]
open(p, 'w', encoding='utf-8', newline='\n').write(t)
PY
  done
fi

cat > "$OUT/firebase.json" <<EOF
{
  "hosting": {
    "site": "$SITE",
    "public": "site",
    "rewrites": [ { "source": "/game/dist/linh-khi.html", "destination": "/linh-khi.html" } ],
    "headers": [
      { "source": "**", "headers": [ { "key": "Cache-Control", "value": "no-cache" } ] },
      { "source": "/build-manifest.json", "headers": [ { "key": "Cache-Control", "value": "no-cache" } ] },
      { "source": "/linh-khi-anh.*.json", "headers": [ { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" } ] },
      { "source": "/anh/**", "headers": [ { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" } ] }
    ]
  }
}
EOF
echo "Đã gói site: $S ($(du -sh "$S" | cut -f1), $(find "$S" -type f | wc -l) tệp)"
