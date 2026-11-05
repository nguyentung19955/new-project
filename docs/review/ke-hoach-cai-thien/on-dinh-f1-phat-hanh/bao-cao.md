# F1 — Phát hành an toàn (05/11/2026)

Phiên F1 trong kế hoạch ổn định (tư vấn ChatGPT `docs/tu-van-toan-cau/chatgpt-05-11/on-dinh-chatgpt.txt`, mục 2, 6.3, 7).
Hai phiên chạy song song: F2 (bản lưu), F3 (ảnh, bộ nhớ, vòng lặp). Phiên này **không đụng** tệp của hai phiên đó.

## Tóm tắt cho chủ game (đọc phần này là đủ)

- **Vẫn như cũ:** mỗi lần push là game **tự lên web** https://spiritblade.web.app để anh xem trên iPhone.
- **Mới:** trước khi lên web, máy GitHub **tự chơi thử** game (không cần người): mở game, vào ải 1-1, đi, đánh, né, đổi vũ khí,
  lưu rồi tải lại, thử tiếng Anh/tiếng Việt. **Hỏng bất kỳ bước nào → không đăng**, web giữ nguyên bản cũ đang chạy tốt.
- **Có lỗi là anh nhận email:** GitHub mở một issue tên **"Đăng web thất bại"** (có giải thích tiếng Việt). Lần đăng sau thành công thì issue tự đóng.
  Ngoài ra cứ **30 phút** máy lại kiểm web một lần; web lỗi 2 lần liền thì có issue **"Web spiritblade.web.app có vấn đề"**.
- **Bản thử riêng (staging):** https://spiritblade--staging-jkvl8mxs.web.app — luôn là bản mới nhất đã qua kiểm. Ở địa chỉ này game
  **tự tắt lưu mây** (không đăng nhập, không đụng tiến trình thật). Tiến trình chơi ở staging chỉ nằm trong trình duyệt, tách khỏi bản thật.
- **Biết web đang chạy bản nào:** Anh Mõ → Cài đặt → góc dưới phải ghi `Phiên bản 2026.11.05-1222-4b9eb3f` (ngày giờ đóng gói + mã commit).
- **Quay lui một chạm** khi bản mới có lỗi: xem mục 5.
- **Chế độ "anh duyệt rồi mới lên bản thật"** đã làm sẵn nhưng đang TẮT; bật khi anh muốn: xem mục 6.

## 1. Đã làm gì

| Việc | Tệp |
| --- | --- |
| Cổng kiểm trước khi đăng (chạy được cả trên máy) | `tools/phat-hanh/cong_kiem.sh` |
| Kiểm ảnh: JSON đọc được, mã ảnh không trùng, ô khung nằm trong ảnh, ảnh trang trỏ tới có thật | `tools/phat-hanh/kiem_anh.py` |
| Kiểm trần dung lượng (một tệp ≤ 30 MB, web tải đầu ≤ 20 MB) | `tools/phat-hanh/kiem_dung_luong.py` |
| Smoke test headless (Playwright) trên đúng thư mục site sẽ lên web | `tools/phat-hanh/smoke_dist.py` |
| Gói site (trước nằm trong workflow) + chèn "staging tự ?cloud=0" | `tools/phat-hanh/dong_goi_site.sh` |
| Kiểm một bản đang chạy trên web (HTTP, buildId, ảnh, headless) | `tools/phat-hanh/kiem_web.py` |
| Mở / đóng issue báo động (REST API) | `tools/phat-hanh/bao_dong.sh` |
| Workflow đăng web: cổng kiểm → staging → bản thật → kiểm sau đăng → báo động | `.github/workflows/linh-khi-hosting.yml` |
| Kiểm web 30 phút/lần | `.github/workflows/kiem-web.yml` |
| Release production (chạy tay, đưa đúng bản staging lên bản thật) | `.github/workflows/release-production.yml` |
| Diễn tập quay lui trên kênh thử riêng | `.github/workflows/thu-quay-lui.yml` |
| buildId + `build-manifest.json` (chỉ phần buildId/manifest/kích thước) | `game/build.py` |
| Hiện buildId ở góc Cài đặt (1 dòng, thiếu buildId thì hiện như cũ) | `game/js/village.js` |
| Luật cho các phiên AI | `AGENTS.md` |

## 2. Cổng kiểm gồm gì, mất bao lâu

`bash tools/phat-hanh/cong_kiem.sh` — workflow chạy đúng tệp này, phiên AI chạy trên máy trước khi push.

1. `node --check` mọi tệp JS (`game/js`, `game/tests`) — 112 tệp.
2. Bài kiểm lưu mây có sẵn (`game/tests/cloud_save_regression.test.js`, Firebase giả, không mạng).
3. Kiểm ảnh nguồn: 733 tệp `.sprite.json` — JSON hợp lệ, mã `ma` không trùng, ảnh base64 giải mã được, ô khung (khung_rong × số khung × nét,
   khung_cao × số hàng × nét) và ô nét cao `o_n3/o_n4` nằm trong ảnh.
4. Dựng dist (`python3 game/build.py --hai-tep`, ảnh rời) → ghi `dist/build-manifest.json`.
5. Gói site như lúc đăng.
6. Mọi đường dẫn `anh/...` trong trang có tệp thật; trần dung lượng: `linh-khi.html` 27,0 MB / 30 MB; web tải đầu 19,52 MB / 20 MB.
7. Smoke test headless (Chromium) trên máy chủ tạm, **chặn mọi yêu cầu ra ngoài** (không tới Firebase/Google, chỉ phông chữ):
   mở `?cloud=0` không lỗi JS · màn đầu vẽ được (đếm màu canvas) · có buildId · không ảnh `anh/` nào 404 · đám mây tắt (`G.cloud.why = 'off'`) ·
   vào ải 1-1 · di chuyển · đánh · né · đổi vũ khí · lưu → tải lại giữ đúng số vàng đánh dấu · `?lang=en` và `?lang=vi` mở + vẽ được.
   Bản lưu của bài kiểm là bản mới trong trình duyệt ảo, không phải tài khoản thật.

Thời gian đo thật: **trên máy 24 giây**, **trên GitHub 23 giây cho cổng kiểm**, cả lần đăng (cổng kiểm + staging + bản thật + kiểm sau đăng)
**2 phút 51 giây** (run 41973459387). Lần đầu khi chưa có bộ nhớ đệm WebP thì bước dựng mất ~8 phút (chỉ xảy ra khi đổi rất nhiều ảnh).

**Chứng minh cổng chặn được** (trên máy, bản sao tạm, không đụng repo):
- Thêm `function hong( {` vào cuối `game/js/combat.js` ở bản sao → `CỔNG KIỂM HỎNG ở bước: Lỗi cú pháp JS — game/js/combat.js: SyntaxError: Unexpected end of input`, mã thoát 1.
- Chèn lỗi chạy (`G.khongCo.x=1` ở đầu `G.startStage`) vào trang đã gói ở bản sao → smoke test `HỎNG: Vào ải 1-1`, mã thoát 1.
Trong workflow, cổng hỏng thì các bước đăng không chạy → web giữ bản cũ.

## 3. Báo động — chủ game nhận thế nào

- **Đăng web hỏng** (cổng kiểm, staging, đăng, hoặc kiểm sau khi đăng): job `bao-dong` mở issue **"Đăng web thất bại"** (đã mở rồi thì thêm bình luận),
  nội dung: commit nào, lỗi tóm tắt tiếng Việt, bản web hiện tại có bị đổi không, đường dẫn trang chạy. GitHub gửi **email** cho chủ repo
  (người theo dõi repo; mặc định chủ repo luôn theo dõi). GitHub cũng tự gửi email "Run failed" cho người push.
  Lần đăng sau thành công → issue **tự đóng** kèm bình luận.
- **Kiểm định kỳ 30 phút** (`kiem-web.yml`): HTTP 200 · `build-manifest.json` có buildId và **khớp commit của lần đăng thành công gần nhất** ·
  vài ảnh quan trọng (bìa + ảnh màn chào) tải được · mở headless `?cloud=0` thấy màn đầu vẽ được, không lỗi JS.
  Lỗi → chờ 2 phút kiểm lại → vẫn lỗi (**2 lần liên tiếp**) → issue **"Web spiritblade.web.app có vấn đề"** (chỉ mở một lần, không gửi email lặp mỗi 30 phút).
  Lần kiểm sau đạt → tự đóng.
- Lưu ý kỹ thuật: GitHub chỉ chạy `schedule` cho workflow nằm trên nhánh mặc định `master` (phiên này không đụng master). Nên `kiem-web.yml` chạy một
  **vòng ~5 giờ 30** (11 lần kiểm cách 30 phút) rồi **tự gọi lần chạy kế** (workflow_dispatch); mỗi lần đăng web cũng khởi động lại vòng. Repo công khai
  nên phút chạy GitHub Actions miễn phí. Nếu sau này đưa tệp lên master thì dòng `schedule` tự có hiệu lực. Tắt: Actions → workflow → ⋯ → Disable workflow.

## 4. buildId, manifest, lưu đệm

- `game/build.py`: `G.BUILD_ID = "<ngày-giờ đóng gói>-<7 ký tự commit>"` (commit = `GITHUB_SHA` trên GitHub). `G.VERSION` giữ nguyên
  (lưu mây vẫn ghi `ver` như cũ, không đổi cấu trúc dữ liệu). Cờ tắt: biến môi trường `LK_BUILD_ID=0`.
- `dist/build-manifest.json` (không commit, `.gitignore`), lên web ở `/build-manifest.json`: buildId, commit, cỡ + mã băm từng trang,
  số đo dung lượng, số ảnh, danh sách ảnh quan trọng.
- Header lưu đệm (`firebase.json` sinh trong `dong_goi_site.sh`, chỉ bổ sung): mọi tệp `no-cache` như cũ (HTML, `sw.js`), thêm dòng riêng
  `build-manifest.json` = `no-cache`; ảnh `/anh/**` (tên đều có mã băm nội dung) và `linh-khi-anh.*.json` = `public, max-age=31536000, immutable` như cũ.

## 5. Quay lui (rollback) — một chạm

**Trên điện thoại hoặc máy tính:**
1. Mở https://console.firebase.google.com → dự án **sontinhthuytinh** → menu **Hosting**.
2. Chọn site **spiritblade** (nếu có nhiều site, bấm vào spiritblade).
3. Kéo xuống bảng **Release history** (lịch sử phát hành).
4. Ở dòng bản **trước** bản đang lỗi, bấm dấu **⋮** → **Roll back** → xác nhận.
5. Vài chục giây sau mở lại https://spiritblade.web.app, xem góc Cài đặt: `Phiên bản …` phải là mã của bản cũ.

Lưu ý: push lần sau sẽ lại tự đăng bản mới (khi cờ tự đăng đang bật) — báo phiên AI sửa lỗi trước khi push tiếp.

**Để Roll back luôn có bản để quay về:** bước "Dọn bản cũ" nay **không bao giờ xoá** 2 bản thật gần nhất và bản đang ở kênh staging;
site spiritblade giữ 4 bản mới nhất (mỗi lần đăng tạo 2 bản: staging + bản thật), `maxVersions` của spiritblade đặt 8. Hai site
sontinhthuytinh, thanthoaiviet giữ 2 như cũ.

**Đã diễn tập quay lui** (workflow `thu-quay-lui.yml`, run 41973459579, ĐẠT, 48 giây) trên kênh thử riêng `thu-quay-lui` (không đụng bản thật,
không đụng staging): đăng bản A (`versions/7d01480059a4cb4f`) → đăng bản B (`versions/d6da707e0fadcc56`) → quay lui bằng đúng cách
Roll back làm (tạo release mới trỏ vào bản A) → trang trả lại nội dung bản A → xoá kênh thử. Chạy lại bất cứ lúc nào: Actions → "Thử quay lui" → Run workflow.

## 6. Chế độ "chủ game duyệt rồi mới lên bản thật" (đang TẮT)

Cách bật (một dòng, nhờ phiên AI làm hoặc sửa trên GitHub):
- `.github/workflows/linh-khi-hosting.yml`: đổi `TU_DONG_LEN_BAN_THAT: '1'` thành `TU_DONG_LEN_BAN_THAT: '0'`.

Từ đó: mỗi push chỉ lên **staging**. Anh mở staging trên iPhone, chơi thử 5–10 phút. Ưng thì:
GitHub → tab **Actions** → **Release production** → **Run workflow** → ô xác nhận gõ `LEN` → **Run workflow**.
Workflow kiểm lại staging, đưa **đúng bản staging đó** lên spiritblade.web.app (Firebase `hosting:clone`, không dựng lại), rồi kiểm bản thật
(buildId phải khớp). Hỏng → issue "Đăng web thất bại".
Quay về tự đăng: đổi lại `'1'`.

Ngay cả ở chế độ tự đăng hiện nay, bản thật cũng được đưa lên bằng cách **chép bản staging vừa kiểm** (clone); clone lỗi thì tự đăng thẳng như trước.

## 7. Bản thử staging không đụng dữ liệu thật

Kênh xem trước dùng chung Firestore với bản thật, nên `dong_goi_site.sh` chèn một đoạn mã nhỏ vào đầu `<head>` của `index.html` và `linh-khi.html`:
tên miền có `--` (kênh xem trước) → tự thêm `?cloud=0` vào địa chỉ **trước khi game chạy** (kể cả khi mở với `?cloud=1`), đặt `window.LK_STAGING = 1`.
Trên spiritblade.web.app đoạn mã không làm gì. Đã kiểm: trên máy (giả lập tên miền `spiritblade--staging-abc.web.app` → `?cloud=0`, `why=off`;
`spiritblade.web.app` → không đổi) và trên web thật (bước "Kiểm bản thử" mở staging KHÔNG kèm `?cloud=0`, đòi `G.cloud.why = 'off'`: ĐẠT).
Cờ tắt: `LK_CHAN_STAGING=0` khi gói.

Kênh staging giữ 30 ngày, mỗi lần đăng gia hạn lại; địa chỉ giữ nguyên: **https://spiritblade--staging-jkvl8mxs.web.app**. Nếu 30 ngày không đăng gì, kênh hết hạn và lần đăng sau tạo địa chỉ mới (ghi ở đầu trang chạy workflow, dòng "Bản thử staging").

## 8. Cách quay lui từng thay đổi của phiên này

- Cả phiên: `git revert <commit>` (xem mục 10) — workflow cũ trở lại nguyên vẹn.
- Chỉ bỏ smoke test: chạy `cong_kiem.sh` với `LK_BO_SMOKE=1` (thêm vào `env` của bước cổng kiểm).
- Không đăng staging nữa: xoá 2 bước "Đăng bản thử", "Kiểm bản thử" (bản thật tự đăng thẳng khi không có staging).
- Bỏ buildId: `LK_BUILD_ID=0`. Bỏ đoạn mã staging: `LK_CHAN_STAGING=0`. Tắt kiểm 30 phút: Disable workflow.
- Cờ cũ giữ nguyên: `HAI_TEP`, `ANH_ROI`, `?cloud=0`, `?authcu=1`…

## 9. Việc chưa làm / đề xuất

- **Staging dùng Firebase project riêng** (tư vấn đề nghị `talesworn-staging`): cần chủ game tạo project + khoá; hiện thay bằng staging tự `?cloud=0`,
  nên staging **không thử được đăng nhập Google / lưu mây**. Thử Google thật vẫn phải trên bản thật hoặc project riêng sau này.
- Chưa có ESLint / `tsc --checkJs` (tư vấn 6, P0 S–M) — nên thêm sau, chỉ áp cho tệp mới/sửa để không chặn oan.
- Bài kiểm bản lưu cũ (≥ 5 fixture) là việc của **F2**; khi F2 có lệnh chạy, thêm một dòng vào `tools/phat-hanh/cong_kiem.sh` (đề xuất cho F2/F1 sau).
- Smoke test giả lập 404 / mạng chậm / decode treo của bộ tải ảnh là việc của **F3** (`sprite_custom.js`); có bài thì gắn vào cổng tương tự.
- Smoke test chạy Chromium, **không thay iPhone Safari thật**; chưa thử Playwright WebKit.
- Chưa cố tình làm hỏng một lần đăng trên GitHub để thấy issue mở thật (tránh gửi email báo động giả cho chủ game); đường đóng issue đã chạy thật
  (job `bao-dong` thành công), đường mở dùng cùng lệnh REST.
- Giữ `G.GRIT` như cũ: còn mã đó thì bước bản thật không đăng (khi đó kiểm 30 phút sẽ báo lệch commit — hiện mã không còn `G.GRIT`).

## 10. Commit

- `4b9eb3f` — F1 phát hành an toàn (workflow, công cụ `tools/phat-hanh/`, buildId/manifest, AGENTS.md, dựng lại dist). GitHub Actions: đăng web ĐẠT
  (run 41973459387, 2 phút 51 giây, staging + bản thật buildId `2026.11.05-1222-4b9eb3f`), diễn tập quay lui ĐẠT (run 41973459579).
- Commit thứ hai (báo cáo này + checkout gọn cho 2 workflow + ghi rõ đường đăng clone/đăng thẳng trong log): xem mục 11.

## 11. Lần chạy sau commit thứ hai

(điền sau khi chạy)
