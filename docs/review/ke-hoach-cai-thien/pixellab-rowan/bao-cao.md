# Rowan cầm vũ khí do PixelLab vẽ — phiên 05/11/2026 (DỪNG: chưa nhận được khoá PixelLab)

## Tóm tắt cho chủ game

- **Phiên này chưa vẽ được gì bằng PixelLab** vì **khoá API PixelLab không tới**. Lời giao nói "khoá gửi trong tin nhắn tiếp theo", nhưng phiên chạy theo lịch chỉ nhận được tin giao việc, không có tin thứ hai, cũng không có tệp khoá nào đính kèm.
- **Không tốn lượt PixelLab nào** (0 / 2000). Không đụng game: **không sửa `game/**`**, không đẩy bản web mới, bản lưu / đăng nhập Google / lưu mây / `?cloud=0` giữ nguyên.
- Phiên đã làm phần chuẩn bị không cần khoá: đọc cách game vẽ Rowan, liệt kê đủ các động tác cần, ước chi phí. Lần chạy sau chỉ cần có khoá là làm tiếp ngay.

## Cần chủ game làm

Gửi khoá API PixelLab cho phiên (tệp `.txt` đính kèm, như các lần trước), ví dụ chạy lại việc này và đính kèm khoá ngay trong tin giao việc. Phiên sẽ ghi khoá vào máy làm việc (không ghi vào repo, không in ra).

## Đã đọc được gì (để làm tiếp)

**Hướng nhìn:** game nhìn từ trên xuống, Rowan chỉ có **một hướng nghiêng (quay phải)**; quay trái thì mã **lật gương**. Đòn đánh xoay theo hướng nhắm bằng mã (`zed-8-huong`).
→ Đề xuất dùng **2 hướng PixelLab: Đông (E) và Tây (W)**, không lật gương — vì lật gương sẽ đưa vũ khí sang tay trái, trái với yêu cầu "vũ khí đúng tay" và luật của kỹ năng PixelLab. Khi nhập nhân vật vẫn đưa đủ 8 hướng (bắt buộc), nhưng chỉ tạo động tác cho E và W.

**Các hàng động tác hiện có** (`game/art/custom/zed-rowan.sprite.json`, số khung / thời lượng):

| Nhóm | Hàng |
|---|---|
| Chung | đứng 8/1,0s · đi 8/0,8s · chạy 12/0,6s · lộn né 6/0,27s · trúng đòn 4/0,2s · chết 8/0,6s · chưởng (bắn xa) 6/0,3s · đấm/uống 5/0,3s · đứng ở làng |
| Kiếm | chém 1 (5/0,3s) · chém 2 (5/0,3s) · chém 3 (6/0,46s) · kiếm nặng · đặc biệt `db_kiem` 6/0,35s |
| Thương | đâm 1/2/3 (6/0,34–0,38s) · quét 6/0,52s · giữ 3/0,45s · xốc 4/0,16s · chạy 2 tay · đặc biệt 6/0,35s |
| Búa | nện 8/0,8s · giữ 4/0,5s · nện đất 6/0,7s · chạy 2 tay · đặc biệt 6/0,35s |
| Phi tiêu | ném 6/0,38s · ngắm 3/0,45s · ném chùm 6/0,5s · đặc biệt 6/0,35s |

Mỗi nhân vật (một loại vũ khí) cần khoảng **13–15 hàng**.

## Ước chi phí (lượt PixelLab)

| Việc | Ước |
|---|---|
| Ảnh gốc Rowan (4 vũ khí × 3–4 seed) | ~16 |
| 8 hướng (4 × 2–3 seed × 2 lượt) | ~24 |
| Nhập nhân vật (4 × 0,25) | 1 |
| Động tác: 4 nhân vật × ~14 hàng × 2 hướng × ~3 lượt | ~340 |
| Chạy lại hướng hỏng (dự phòng +50 %) | ~170 |
| **Cộng 4 nhân vật gốc** | **~550** |
| Hình thái (Mầm / Thành hình / Thức tỉnh) làm nhân vật riêng: 12 nhân vật nữa | ~1 650 → vượt trần 2000 khi cộng phần gốc |
| Hiệu ứng hào quang / mực theo hình thái × hệ (ảnh PixelLab vẽ đè lên người) | ~60–120 |

**Chọn:** làm xong 4 nhân vật gốc trước (~550), rồi thể hiện hình thái/hệ bằng **lớp hiệu ứng hào quang do PixelLab vẽ** (~100). Tổng ~650, dư nhiều so với trần 2000 (còn chỗ chạy lại). Làm hình thái thành nhân vật riêng thì không đủ trần.

**Dung lượng:** web tải đầu đang ~19,4 / 20 MB. Tấm mới phải thay (không cộng thêm) tấm `zed-rowan` + các tấm vũ khí trên tay; cần đo khi có ảnh thật, giữ chia trang ≤2048 của F4.

## Kiểm đã chạy

Không chạy `cong_kiem.sh` / chụp headless / GIF vì không có thay đổi game nào. Chỉ thêm tệp báo cáo này (không đụng `game/**` nên không kích hoạt đăng web).

## Quay lui

Chỉ có tệp báo cáo: revert commit này là xong. Cờ `?rowancu=1` chưa thêm (sẽ thêm cùng lúc gắn tấm PixelLab).
