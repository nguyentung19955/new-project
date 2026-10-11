# Luật vẽ chung của Linh Khí ("art bible")

Mọi prompt sinh ra từ 7 trang công cụ (`tools/tach-hieu-ung`, `tach-quai`, `tach-anh-hung`, `tach-do`, `tach-phong`, `tach-giao-dien`, `tach-lang`) đều tự nối câu **LUẬT VẼ CHUNG CỦA GAME** (hằng `CAU_PHONG_CACH`) ngay trước câu bố cục cuối prompt. Tấm nền lớn (nền làng, bản đồ vùng, tile nền phòng, logo một tấm) dùng bản `CAU_PHONG_CACH_NEN`. Sửa luật thì sửa ở cả 7 trang và ở tài liệu này.

## 5 luật

1. **Tỉ lệ theo em bé.** Thước đo của cả game là em bé chibi: thân trơn **16 × 29 điểm ảnh game**. Mọi hình (quái, đồ, hiệu ứng) vẽ to nhỏ, chi tiết và độ bóng ngang em bé, không bóng bẩy hơn. Chi tiết nhỏ hơn 2 điểm ảnh game thì bỏ; ưu tiên khối lớn rõ ràng.
2. **Bảng màu và số màu.** Chỉ dùng màu trong "BẢNG MÀU LINH KHÍ" (khối `BM` trong mỗi trang, mỗi chất liệu tối đa 3 sắc). Mỗi hình tối đa khoảng **16 màu** (không tính nền); tấm nền lớn tối đa khoảng **32 màu**. Không chuyển màu mượt, không nhiễu hạt. Mã màu riêng đã ghi trong prompt (màu hệ, màu nhấn) thì giữ.
3. **Viền.** Viền ngoài **một nét tối `#14182e`** liền mạch, không viền sáng quanh mép, không khử răng cưa. Ô đã ghi mã viền riêng (người làng `#1a1420`, đồ, giao diện) thì giữ mã đó.
4. **Hướng sáng.** Ánh sáng chiếu từ **trên bên trái**: mặt dưới và bên phải tối hơn, mỗi khối chỉ một điểm sáng nhấn nhỏ. Đổ bóng 3 sắc (sáng, vừa, tối).
5. **Nghiệm thu ở cỡ thật.** Xem hình ở đúng cỡ trong game trên màn hình **480 × 270**, cạnh em bé. Nhìn không ra hình, rối chi tiết, hoặc bóng hơn em bé thì gen lại.

## Bảng cỡ chuẩn hiện có (điểm ảnh game, rộng × cao)

| Loại | Cỡ trong game | Nguồn |
|---|---|---|
| Em bé (4 nhân vật chơi) | 16 × 29 (thân trơn) | tach-anh-hung |
| Người làng | 19–29 × 28–40 | tach-anh-hung |
| Quái thường | khoảng 29–63 × 24–49 | tach-quai (`rong`, `cao`) |
| Quái tinh anh, chúa (Heo Nanh Dài, Cua Đá, Hổ Lửa…) | khoảng 59–117 × 42–71 | tach-quai |
| Trùm vùng (Mộc Tinh, Ngư Tinh, Hồ Tinh) | 140–177 × 105–131 | tach-quai |
| Kiếm | 44–48 × 17–28 | tach-do |
| Cung | 19–31 × 32–44 | tach-do |
| Giáo | 57–62 × 11–23 | tach-do |
| Búa | 41–46 × 17–35 | tach-do |
| Mũ, nón | 17–26 × 7–22 | tach-do |
| Áo | 11–15 × 8–16 | tach-do |
| Đồ đeo lưng | 12–20 × 15–28 | tach-do |
| Đồ cầm tay | 5–14 × 5–13 | tach-do |
| Mặt nạ | 4–11 × 4–9 | tach-do |
| Cánh | 13–25 × 11–28 | tach-do |
| Vật phẩm rơi | 6–10 × 6–10 | tach-do |
| Hiệu ứng thường (mỗi khung) | 12–160 × 8–80 | tach-hieu-ung |
| Hiệu ứng TO (mỗi khung) | 72–192 × 64–180 | tach-hieu-ung |
| Cả màn hình | 480 × 270 | — |
