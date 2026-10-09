# Hành trang: báo cáo ngắn

## Đã làm
Mọi đồ của em bé giờ xem được ở **một chỗ**: bảng **Hành trang**.

- **Mở ở làng**: nút túi vải "Hành trang" ở góc trên bên phải, dưới dải tài nguyên, bên phải dải khuôn mặt. Nút không che nhà, người làng hay dải lối tắt. Trên máy tính bấm phím B cũng mở được.
- **Mở trong ải**: bấm Dừng, rồi bấm nút "Hành trang (xem)" ở cuối bảng Tạm dừng. Trong ải chỉ xem được: không thay vũ khí, không mặc/tháo trang phục, không học kỹ năng. Chỗ đó có chữ cam "Về làng để thay". Các nút cũ của bảng Tạm dừng (Chơi tiếp, Âm thanh, Bỏ ải, Góp ý) vẫn ở chỗ cũ.
- Bảng có **6 thẻ**. Khi nội dung dài thì kéo ngón lên xuống để cuộn, bên phải có thanh cuộn nhỏ.
  1. **Nhân vật**: hình em bé đang mặc đồ, tên, cấp, thanh kinh nghiệm, **Sức mạnh** (đúng con số ở thẻ ải), máu, mana, các chỉ số, sở trường, nội tại, trang phục đang tăng gì, bộ và tác dụng, vũ khí đang mang. Có nút "Đổi hero: Ông Từ".
  2. **Vũ khí**: vũ khí đang mang, rồi vũ khí trong rương. Mỗi món có hình, bậc, mức mài, sát thương mỗi đòn, dòng phụ, mốc linh khí, đặc trưng đã mở hoặc còn bao nhiêu dấu ấn nữa thì mở. Nút "Xem chi tiết" mở lại màn "Xem vũ khí" có sẵn. Món trong rương có nút "Mang ô 1" và "Mang ô 2" để thay.
  3. **Trang phục**: năm ô đang mặc, kho trang phục (chạm một ô đang mặc để lọc kho theo ô đó), chi tiết món đang chọn, nút Mặc hoặc Tháo ra, bộ và tác dụng đang có.
  4. **Linh khí**: nguồn linh khí lấy thẳng từ số liệu của game (`G.LINHKHI`): hạ tinh anh +5, trùm nhỏ +10, trùm vùng +20, kết liễu quái thường đang dính hệ +1. Mỗi vũ khí có số dấu ấn Lửa, Độc, Băng, một thanh tiến độ và chữ "còn bao nhiêu tới mốc" (30, 120, 300).
  5. **Kỹ năng**: số điểm còn lại, ba nhánh Công, Thủ, Hệ với nút nào đã học (✓) và nút học tiếp theo (›). Ở làng học ngay được bằng nút Học, giống hệt chỗ Cụ Đồ.
  6. **Tài nguyên**: vàng, quặng, đá tôi, gỗ linh, vảy cá, đá lửa, ba loại mảnh trùm. Mỗi loại có biểu tượng, con số và hai dòng ngắn: "Dùng: …" và "Kiếm: …".
- Mua, may, mài, nâng bậc **vẫn ở người trong làng** như cũ. Hành trang chỉ có nút "Đến chỗ …" để sang thẳng Ông Thợ Rèn, Bà Hàng Xén, Cô Thợ May hoặc Cụ Đồ.
- **Không đổi** luật chơi, số cân bằng hay cách lưu. Thay vũ khí, mặc đồ và học kỹ năng ghi vào bản lưu theo đúng cách các bảng cũ đang làm. Bản lưu cũ vẫn mở được.

## Tệp đã sửa
- Mới: `game/js/hanh_trang.js` (toàn bộ bảng), `game/tests/hanh_trang.py` (bài kiểm tra).
- Sửa ít dòng:
  - `game/index.html`: nạp tệp mới.
  - `game/js/village.js`: vẽ nút ở làng, cho dùng lại màn Xem vũ khí.
  - `game/js/stage.js`: thêm nút trong bảng Tạm dừng và chế độ chỉ xem.

## Kiểm tra
`python3 game/tests/hanh_trang.py all` chạm thật trên điện thoại cầm ngang (`phone`) và cầm dọc (`port`, khung game tự xoay), mỗi khung đạt 41/41 mục:
- mở bảng ở làng, đi qua đủ 6 thẻ;
- số trên bảng khớp dữ liệu: sức mạnh, máu, mana, cấp, từng tài nguyên, nguồn linh khí, số dấu ấn;
- xem chi tiết vũ khí rồi quay lại, thay vũ khí (có lưu), kéo để cuộn;
- mặc và tháo mũ (hình em bé đổi theo), học kỹ năng;
- mở từ bảng Tạm dừng trong ải thì không thay, không mặc, không học được, nhưng vẫn xem chi tiết được; Esc và Quay lại về bảng Tạm dừng;
- bản lưu cũ vẫn mở đủ 6 thẻ;
- không chữ nào tràn ra ngoài khung bảng.

Các bài cũ đã chạy lại: xem kết quả cuối ở mục dưới.

## Ảnh
- Ở làng: `lang-1-nhan-vat.png` … `lang-6-tai-nguyen.png`.
- Trong ải: `ai-0-tam-dung.png` (bảng Tạm dừng có nút mới), `ai-1-…` … `ai-6-…`, `ai-7-xem-vu-khi.png`.

## Kết quả chạy lại các bài (trên nhánh này)
| Bài | Kết quả |
|---|---|
| rules | 82/82 đạt |
| bao_truoc | 21/21 đạt |
| tam_huong | 37/37 đạt |
| trang_phuc | 66/66 đạt |
| linhkhi | 36/36 đạt |
| ui_build | đạt (mọi khung) |
| ui_robust | 16/16 đạt |
| ui_input all | đạt cả 4 khung (phone, p169, desk, port) |
| may | 100/100 đạt |
| cay 4 khuyen --nhanh | đạt mục tiêu vùng 1 |
| hanh_trang all | 41/41 đạt mỗi khung |
