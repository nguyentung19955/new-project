# Bước 1 — làm chắc nền (14/10 19:56, chủ dự án duyệt "Ok bước 1")

Làm đủ 7 mục, mỗi mục một commit riêng (dễ quay lui), báo cáo chung `bao-cao.md`.

## 1. Dung lượng ảnh (làm TRƯỚC — các đợt quái mới cần chỗ)
Hiện `build.py` (`TRAN_ANH_ROI` dòng ~240) tính trần 26 MB trên TỔNG PNG + WebP (25,67 MB), nhưng mỗi người chơi chỉ tải MỘT trong hai bản → đang chặn oan.
- Đổi thước đo chính thành **"người chơi tải"** = tổng theo từng ảnh của bản thực sự được phát (WebP nếu trình duyệt hỗ trợ, PNG dự phòng) — báo cả hai con số; trần người chơi tải **20 MB** (theo quyết định Q5 ~20 MB), tổng máy chủ chỉ để thông tin (cảnh báo khi > 60 MB).
- **Tải theo vùng**: ảnh chỉ dùng ở một vùng (quái, trùm, nền, vật trang trí của Rừng/Biển/Lâu đài) không tải ở màn chào; tải khi người chơi chọn vùng (hiện thanh "Đang tải…" ở thẻ ải nếu chưa xong), có tải trước vùng kế tiếp khi rảnh. Ảnh lõi (Zed, giao diện, làng, hiệu ứng chung) vẫn tải trước như cũ. Ảnh chưa về thì KHÔNG vẽ hình cũ/hình code (luật `vu-khi-cu-con-sot`), chờ ảnh.
- Ghi bảng: dung lượng lõi / từng vùng / tổng người chơi tải, trước và sau.

## 2. Lực chiến tính skill bộ đồ
`G.power` / `luc_chien.js` chưa tính skill bộ (`bo_skill.js`, `G.SKILL_BO`). Cộng giá trị tương đương theo cấp bộ, ghi cách quy đổi trong báo cáo; khuyên dùng `G.STAGE_REC` không đổi (chỉ thêm phần bộ vào Sức mạnh người chơi).

## 3. Skill bộ đồ tác dụng lên trùm
- Thuỷ triều: `boss.js` đọc thời gian chậm → trùm vùng/trùm nhỏ chậm (yếu hơn quái thường, ví dụ 50% hiệu lực, ghi số).
- Phân thân: trùm nhỏ và trùm vùng cũng có lúc nhắm bóng (ví dụ 30% lần chọn mục tiêu khi có bóng), không phá chiêu đang ra.
- Kiểm lại các skill bộ khác xem chỗ nào trùm bị bỏ qua mà không có lý do; ghi bảng.

## 4. Chỗ tiêu vàng: Bà Hàng Xén bán quặng
Thêm mục bán quặng/nguyên liệu (giá theo `G.DOI_NL` hiện có hoặc cao hơn một chút, giới hạn mỗi ngày để không phá cày). Giao diện cùng kiểu bảng Bà Hàng Xén hiện tại, có bản tiếng Anh.

## 5. Cân bằng chưa đo
- Dạy bot (`tests/`) biết ép đồ (`ep_do.js`) và ải ngày; đo lại `G.STAGE_REC` (độ khó 1) và **đo độ khó 2** (`G.DIFF2`); chạy chiến dịch có Thương và Búa. Được chạy bot cân bằng vì đây là MÔ HÌNH tính số, KHÔNG phải test game (không Playwright, không mở game). Chỉnh số chỉ khi lệch rõ (> 15%), ghi cũ → mới.
- Cập nhật `tests/balance.py`, `tests/cay_luu.json`, `tools/can-bang/tinh.js` theo luật mới.

## 6. Chữ cũ
`G.HINTS` (data.js), trang Cụ Đồ, thẻ Tài nguyên, README: bỏ mọi câu về bậc màu, dấu ấn, rơi đồ, nhiều vũ khí của luật cũ; viết theo hệ mới (4 vũ khí, Trắng→Thức tỉnh, ép đồ 7 bậc, bộ đồ vùng). Bản tiếng Anh sửa cả `ngon_ngu_en.js` và `tools/ngon-ngu/tu-dien`.

## 7. Báo trước bằng hoạt ảnh
Ảnh đã có: `docs/anh-goc/bao-truoc/{tron,vanh-khuyen,hinh-quat,dai-thang-doc}.png` (dải 8 khung). Cắt (theo hình, không theo ô vuông), nhập thành sprite (`gd-bt-*-dong` hoặc thay `gd-bt-*`), vẽ trên lớp sàn: 8 khung **kéo giãn đúng bằng thời gian báo trước** của đòn (khung cuối trùng lúc đòn nổ), co giãn/xoay theo vùng thật (tròn, vành khuyên, quạt, dải thẳng), màu theo hệ. Bỏ phần vẽ vòng báo trước bằng code khi có ảnh (cờ `?btcu=1` xem lại cũ). Phải căn tâm đúng/đối xứng (dùng cách căn của `trum-chet-pha3`). Ảnh soát tĩnh `xem-bao-truoc.png`: 4 hình × 8 khung + 1 ví dụ chồng lên vùng thật.

Chung: KHÔNG TEST game (không Playwright, không mở game) — chỉ xử lý ảnh, ảnh soát tĩnh, bot cân bằng (mục 5), node --check, build.py. KHÔNG đụng master, KHÔNG force push, KHÔNG PR, không chép apiKey, không làm hỏng đăng nhập Google/lưu mây/?cloud=0. Phiên khác có thể đang sửa boss.js/mobs.js/fx.js (kỹ năng quái vùng, chiêu trùm riêng): rebase giữ thay đổi của cả hai; game/dist lấy bản trên nhánh rồi build lại.
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
