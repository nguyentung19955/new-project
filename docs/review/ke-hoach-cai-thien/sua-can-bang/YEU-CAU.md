# Sửa cân bằng — 3 mục chủ game chọn (15/10, 19:36)

Nguồn: docs/review/ke-hoach-cai-thien/kiem-can-bang/bao-cao-A.md, bao-cao-B.md, bao-cao-C.md (+ de_xuat_a.js).
CHỈ làm đúng 3 mục dưới; các đề xuất khác chủ game CHƯA chọn → không đụng.

1. **Bớt quái thường ải 2-2, 2-3, 2-4, 2-5, 3-2, 3-4** (bao-cao-A mục 1 và bảng 5.1, số trong de_xuat_a.js):
   giảm máu + sát thương quái trong `G.STAGE_K.mob`, chia lại `G.STAGE_K.boss` để TRÙM GIỮ NGUYÊN.
   KHÔNG làm phần Hồ Tinh (boss[14]) và KHÔNG làm độ khó 2 (chưa chọn).
2. **Giảm Bổ rìu san hô của Ngư Tinh** (bao-cao-C mục 6b): `G.chieuTrum.SO.nguBoRiu.manhSat` 1,4 → 1,0.
3. **Giảm nửa dòng Hút máu** (bao-cao-B đề xuất 2): `G.EP_DO.dong` hutMau `goc` 0,012 → 0,006; `G.EP_DO.hutToiDa` 0,02 → 0,01.
   Chữ mô tả dòng trong bảng ép (nếu ghi số) cập nhật theo.

- Cờ quay lui chung: `?cbcu=1` → cả 3 mục về số cũ.
- Số A đo trên commit 853ebf8e, trước khi Cua Đá được sửa (5ec263f1) và trước sửa mất bậc ép (0ca038df). Bản lưu bot nay giữ bậc ép
  (Sức mạnh 3-5: 455 → 514) nên khuyên dùng / thắng có thể đã khác: ĐO LẠI bằng bot Node (do_ai_chet.py ở mức khuyên dùng,
  các ải 2-2…2-5, 3-2, 3-4; và do_chien_dich.py một lượt) TRƯỚC và SAU, chỉnh số mục 1 nếu cần để đủ khuyên dùng thắng ~65–80%.
  Được chạy bot Node (không mở trình duyệt). Nếu khuyên dùng `G.STAGE_REC` lệch rõ thì ghi đề xuất vào báo cáo, không tự đổi.
- node --check, build.py.
Không đụng master, không force push, không PR, không chép apiKey, không làm hỏng đăng nhập Google / lưu mây / ?cloud=0.
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
Push (bị từ chối thì pull --rebase rồi push lại; giữ thay đổi của phiên khác). Xong viết bao-cao.md (bảng thắng trước/sau từng ải) cùng thư mục, push, tự dừng.
