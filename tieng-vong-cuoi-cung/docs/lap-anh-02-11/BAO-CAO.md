# Lắp ảnh mới vào game – 02/11 (tối)

Ảnh ChatGPT vẽ chiều 02/11 đã được lắp vào game. **Không ảnh nào phải vẽ lại**, không vẽ gì bằng code.

## Đã bật / đã hiện đúng
| Phần | Kết quả |
|---|---|
| **Làng Chuông** | Tự mở vì đã đủ ảnh: 5 màn nối liền + tiền cảnh, mặt đất đúng y 468; Morrow, Vesper, Tock, Kaelith đứng thở, nói chuyện có chân dung; bia tưởng niệm (Examine); chuông teleport 10 khung → **khung chọn vùng riêng** (ảnh 009); tranh mở đầu 7 tấm có nút Skip, xem lại được ở chuông. |
| **Echo Journal (nhật ký bí mật)** | Làm lại bằng ảnh: khung 760×320 (phóng đều vừa màn 844×390), 4 tab (Whispers / Name Tags / Remembered / Achievements), dòng thường/chọn/xong + biểu tượng 32 + dấu trạng thái, ô chi tiết, ô Thẻ Tên trống/có, nút đóng tròn 44×44, tay nắm cuộn kéo được. |
| **Thông báo bí mật** | Khung "Secret Found" 270×58 và khung thành tựu 300×66 ở góc trên phải, có biểu tượng; nhiệm vụ mới lộ có hiệu ứng 6 khung (64×64). Hiện lần lượt, không đè dòng chữ của Vùng 1. |
| **Bí mật thứ 5 – Ashen Lullaby** | Đã có ảnh dấu hiệu nên tự bật: vạch sóng trên chuông vùi tro ở P04, đứng yên → vòng tiến độ 3 giây, xong → khe nứt sáng. Vùng 1 giờ có **5** bí mật. |
| **Bóng tiếng vọng ở P01** | Sau khi hạ trùm quay về Cửa Rễ: bóng đứng thở rồi tan (8 khung). |
| **Bảng Resonance Lattice / Charms** | Khung chính, tooltip, tab, nút + nút khoá, nút kỹ năng 3 trạng thái, ô cắm trống/đầy, biểu tượng độ hiếm và tiền tệ. Charm rơi được, chọn Charm đầu hiện trong ô Charm 72×72; Frostline Slash và Resonance Halo phát được. |
| **Lớp sức mạnh trên Kiếm Khách** | Đã bật sẵn (`co_anh: true`, neo khăn [26,10], chuông [12,1]) – đã thử cấp 0–3 và `?trangbi=` ở phòng demo, hiện đúng. |
| **Nút đăng nhập** | Lề cắt 22 46 22 46 đã đúng. |

## Đã sửa mã cho khớp ảnh thật
- Khung chọn teleport: vùng chữ đổi thành [0.12, 0.25, 0.76, 0.6]; tiêu đề in giữa để không đè 2 chuông treo.
- Ô Charm: biểu tượng đặt vào lòng ô lề 8 px (trước là 12%).
- Bảng Lattice/Charms: bỏ khung cũ của Chuông Lưu vẽ chồng lên khung mới; lề trong tránh 4 mặt nạ góc; tooltip cắt 9 mảnh để góc không méo.
- Hiệu ứng lộ nhiệm vụ dùng khung 64×64 (không phải 64×32).

## Vẫn tắt – KHÔNG phải do thiếu ảnh
- Hệ thống đồ (`?hethong=1`) và Vật phẩm ẩn (`?an=1`) vẫn **tắt mặc định** như thiết kế cũ: chờ ChatGPT duyệt số và chơi thử đo cấp. Bật thử bằng 2 tham số trên.
- Three Notes for the Lost, Iria, The Unanswered Bell: chờ tính năng. Fifth Toll: ảnh đang HOÃN.
- Chưa dùng: dấu "unknown" và nút đóng "disabled" (ChatGPT dặn không hiện "???"; nút đóng không bao giờ bị khoá), biểu tượng Ancient Bronze (Vùng 1 chưa có tiền này), chuông neo vùng 011 (dành cho vùng mới).

## Ghi chú ảnh (không cần vẽ lại)
- Ô Thẻ Tên 180×58: thẻ chỉ chiếm giữa ảnh (~85 px) nên game ghi tên **bên cạnh** thẻ. Nếu muốn ghi tên lên mặt thẻ, có thể nhờ ChatGPT: *"Redraw the filled Name Tag slot so the bronze tag fills about 150×40 px of the 180×58 cell, blank face, same style, #FF00FF background."*

## Kết quả kiểm
- Đạt hết: kiem-thu-f 66/66, kiem-thu-g, kiem-thu-h, kiem-tra-vung1 (đi đủ P01→P12, không thiếu hình), suc-manh (6 lớp ĐẠT), firebase 36/36 · 28/28 · 24/24, cot-truyen 48/48 + làng + trình duyệt, he-thong logic + Vùng 1 23/23, an logic + lối tắt + Vùng 1.
- Phép thử cũ khẳng định "chưa có ảnh nên tắt" đã đổi thành "đã có ảnh → bật" (làng, Charm, 2 hiệu ứng, bí mật thứ 5). Không nới điều kiện khác.
- Lưu ý: kiem-thu-f có 1 lần trượt ngẫu nhiên ở trận 2 trùm P12, chạy lại đạt 66/66. Lỗi "ERR_TUNNEL" khi kiểm là do máy kiểm không tải được font Google, không phải lỗi game.
- Đã chụp và tự xem ở 844×390: 5 màn làng, 4 NPC nói chuyện, menu teleport, tranh mở đầu, nhật ký (3 tab), thông báo, Ashen Lullaby, bóng P01, Lattice, Charms, chọn Charm đầu, Halo/Frostline, Kiếm Khách cấp 0–3.
