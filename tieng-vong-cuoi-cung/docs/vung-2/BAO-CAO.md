# Báo cáo Vùng 2 "Rotting Roots" – lượt 02/11 (lượt 2)

## Tóm tắt dễ hiểu
- Vùng 2 **chưa chơi được** trong game: chưa có ảnh nào (luật: chưa có ảnh thì chưa bật, không vẽ tạm bằng code).
- Lượt này **không có Claude in Chrome** (chạy trên máy chủ đám mây) nên không hỏi thêm ChatGPT được. Mình chỉ làm những phần đã có trong kế hoạch ChatGPT (`docs/vung-2/ke-hoach-chatgpt.txt`, có từ lượt trước) và không cần ảnh:
  1. **38 yêu cầu ảnh** cho phiên gen ảnh (`docs/yeu-cau-anh/vung/001–038`, trạng thái CHỜ) – đúng danh sách ảnh ChatGPT liệt kê (nền, chất liệu đất rễ, 3 loại gỗ mục, nút Neo Rễ, 3 cổng rễ tự nhiên có hoạt cảnh mở – không cửa phẳng, 4 quái, tinh anh, trùm, hiệu ứng, đạo cụ, đèn, biểu tượng).
  2. **16 phòng dựng bằng script** (`game/vung-2/cong-cu-man/dung-phong.py` → `game/vung-2/phong/*.json`, `ban-do.json`): R201–R213 + 3 phòng bí mật RS201–RS203, đúng kích thước, thứ tự, Chuông Lưu S1/S2/S3, lối tắt, bí mật theo ChatGPT.
  3. **Kiểm tra đường đi tự động** (`game/vung-2/cong-cu-man/kiem-tra.py`, dùng lại máy mô phỏng hộp của Vùng 1 – không sửa Vùng 1): **0 lỗi**.
  4. **Logic địa hình Gỗ Mục + kỹ năng Neo Rễ** (`game/vung-2/dat-muc.js`) đúng từng số khung ChatGPT; phép thử `node tools/vung-2/kiem-thu-dat-muc.js`: **33/33 đạt**.
  5. Số liệu quái/tinh anh/trùm: `game/vung-2/quai.json`, `game/vung-2/trum.json` (máu, báo đòn, khung, ms đúng kế hoạch; `"bat": false`).
- **Chưa** đăng ký Vùng 2 vào `game/the-gioi.json` (chỉ ghi vùng đã chơi được).

## Kết quả kiểm tra đường đi (kiem-tra.py)
- Lượt A (chưa có Neo Rễ): đi R201 → Đền Neo Rễ cuối R206 được; KHÔNG qua được R207 (chốt rễ) → kỹ năng là bắt buộc. Lối phụ R205 → R208 chỉ xuống được túi chân giếng, bị chốt rễ chặn.
- Lượt B (có Neo Rễ, lối tắt còn đóng): tới R213; tới được phía mở của cả 3 cổng lối tắt (R205→R203, R209→R206, R211→R208).
- Lượt C (mọi thứ mở): tới đủ 16 phòng; mọi chỗ quay về được R204 (S1) và tới được R213 – không kẹt, không chỗ một chiều.
- Lượt D (gỗ mục sập/mọc lại): rơi qua mọi cầu gỗ mục vẫn ra được trong 3 giây trước khi gỗ mọc lại.
- Khe đứng ≥ 3 ô ở mọi chỗ; cụm gỗ mục thường ≤ 4 ô, nhanh ≤ 3 ô; mọi nút neo có chỗ đứng/dây trong 3 ô.
- Cảnh báo (chấp nhận): 3 phòng bí mật nhỏ hơn 30 cột (đúng cỡ ChatGPT); 4 lối tắt lệch toạ độ bản đồ (hầm rễ dài); Memory Shard ở hốc R210 hộp không tới được vì cần bật tường (thử thách TUỲ CHỌN theo ChatGPT – kiểm bằng tay khi có ảnh).

## Chỗ mình phải tự chọn (cần hỏi ChatGPT duyệt ở lượt có Chrome)
1. ChatGPT ghi "R210 bắt buộc Neo Rễ + bật tường"; máy kiểm tra (như Vùng 1) không mô phỏng bật tường nên tuyến chính R210 dùng nhảy đôi + cầu gỗ mục + chốt rễ; bật tường chỉ ở hốc Memory Shard tuỳ chọn.
2. "Neo Rễ bắt buộc" ở R207/R208/R210 làm bằng **chốt rễ** (ChatGPT: Neo Rễ giữ chốt rễ sống mở 180 khung) đặt sau cầu gỗ mục.
3. Cổng lối tắt R206↔R209 nằm ngang ở mặt sàn R206 (giếng dây xuống R209).

## Lượt 3 (02/11 chiều)
- Xoá `docs/yeu-cau-anh/vung/HET.md` (phiên chính có ChatGPT sẽ vẽ); ghi rõ 6 đợt ảnh theo "Suggested batch order" trong `TRANG-THAI.md`.
- Thêm tên tiếng Anh Vùng 2 vào `docs/tieng-anh/BANG-DOI-CHIEU.md` (tên phòng/quái/trùm trong dữ liệu đã là tiếng Anh).
- `tools/vung-2/ve-phong.py`: nướng ảnh phòng Vùng 2 bằng chính bộ nướng Vùng 1 (chỉ đọc, không sửa), thay chất liệu bằng ảnh ChatGPT Vùng 2 (yêu cầu 007, 013), màu mặt đất theo bảng màu ChatGPT; ô động (gỗ mục, gai, ao, chốt, cổng) không nướng – game vẽ bằng ảnh riêng. Chưa có ảnh 007 thì báo và DỪNG (không nướng tạm). Đã thử đường chạy bằng chất liệu Vùng 1 tạm (không lưu).
  Lưu ý: bộ nướng Vùng 1 tự treo đồ trang trí Vùng 1 (đèn lồng, mặt nạ, vải) – khi có ảnh đạo cụ 035/036 cần đổi sang đồ Vùng 2.

- Đợt ảnh 1 về (phiên chính, ChatGPT: chất liệu đất rễ 007, nền xa 001, nền giữa 003, nền trùm 005) → đã nướng ảnh 16 phòng `art/vung-2/<ID>-canh.png / -truoc.png / -manh.png / -canh.json`; ghép thử với nền xa + nền giữa: đúng phong cách tím-nâu ẩm, đọc rõ mặt sàn. Đã bỏ đồ treo đặc trưng Vùng 1 (mặt nạ, vải chuông); đèn lồng + sàn mỏng tạm dùng hình ChatGPT Vùng 1 tới khi có 013/035/037.

- Đợt ảnh 2 về một phần (gỗ mục 008–010, gờ rễ mỏng + thang rễ 013) → nướng lại 16 phòng: gờ mỏng ghép từ go-trai/giua/phai đúng cỡ điểm ảnh ChatGPT, thang rễ thay dây leo Vùng 1. Gỗ mục KHÔNG nướng (game vẽ theo trạng thái từ dat-muc.js).
  Cần xem lại khi lắp vào game: gờ mỏng 8 điểm ảnh khá mảnh trên nền giữa sáng – nền phải tối bớt (ChatGPT: nền không sáng hơn tiền cảnh).

## Còn lại để bật Vùng 2 (khi phiên gen ảnh báo XONG)
1. Nướng lại `python3 tools/vung-2/ve-phong.py` khi có 035–037 (đạo cụ, tiền cảnh, đèn).
2. `game/vung-2/index.html` (bắt đầu khi có thêm 012 gai/ao, 014 nút neo, 016 cổng – để địa hình đủ ảnh) + nối `dat-muc.js` vào engine (ô R/Q/P/L/C, nút kỹ năng Neo Rễ 44×44 pt), quái/tinh anh/trùm theo `quai.json`/`trum.json`.
3. Chụp Playwright đi hết vùng, đánh trùm; đăng ký `game/the-gioi.json`.
4. Vùng 3–9: chưa có kế hoạch ChatGPT (cần Chrome) – kế hoạch tổng 9 vùng đã có ở mục 1 file kế hoạch.

## Lượt 4 (02/11 tối) – BẬT Vùng 2 trong game (đủ 38/38 ảnh ChatGPT)
**Chơi thử:** `game/vung-2/index.html` (đã ghi vào `game/the-gioi.json` cho teleport). Bàn phím như Vùng 1 + **Q = Neo Rễ**; cảm ứng có thêm nút ⚓ (hiện sau khi học kỹ năng, mờ khi không có nút neo trong tầm).

Đã làm:
1. **Nướng lại 16 phòng** với đạo cụ / rễ treo / tiền cảnh ChatGPT Vùng 2 (thay đèn lồng, mặt nạ, chuông của Vùng 1) – `tools/vung-2/ve-phong.py` (bảng DOI_DO).
2. **Trang chơi Vùng 2** chép khung Vùng 1 (không sửa file nào của Vùng 1 hay engine dùng chung): `index.html, nap.js, dau-vao.js, the-gioi.js, ve.js` + mới `dia-hinh.js, quai-v2.js, trum.js`. Bản lưu riêng `tvcc-vung2`.
3. **Địa hình** (`dia-hinh.js` nối `dat-muc.js` vào engine): gỗ mục thường/nhanh/xung vẽ 4 mức nứt, rơi, bụi, mọc lại bằng ảnh ChatGPT; gai rễ + ao bào tử (mất 1 mặt nạ, về gờ chắc); chốt rễ và 3 cổng lối tắt có hoạt cảnh mở (rễ tháo xoắn), lưu vĩnh viễn; cổng niêm trùm (rễ quấn kín cửa khi đánh, tháo khi thắng); nền xa/giữa/sương theo phòng.
4. **Neo Rễ**: nhận ở Đền Neo Rễ cuối R206 (đền ChatGPT có hoạt cảnh), nút neo + gợi ý khi trong tầm, dải rễ đồng giữ cụm gỗ, đếm giây trên HUD, Bùa Neo giảm 10% hồi chiêu.
5. **Quái**: 4 quái thường bằng ảnh ChatGPT, báo đòn đúng số khung kế hoạch: Rot Gnawer (cắn + lao), Spore Bell (3 đạn bào tử), Husk Leaper (nhảy cung + chém khi đáp), Root Siphon (gân rễ báo 42 khung → rễ trồi 1 mặt nạ → giữ chân 24 khung, lướt ra trước được).
6. **Tinh anh The Nursery Warden** (R211): Root Cleave / Bell Stomp (sóng 2 phía) / Rot Command (làm 1 cụm gỗ cánh thành loại nhanh), pha 2 ≤ 50% máu, choáng sau 4 đòn liền; hạ xong hiện Warden Knot.
7. **Trùm Mold Mother** (R213): 3 pha, 6 đòn đúng kế hoạch (Sweep, Spore Rain 3 làn, Bell Wail, Rot Bloom kích hoạt 3 cụm gỗ giữa, Tendril Grab vòng đích bám rồi khoá, Heartbreak Slam 2 sóng – 6 ô sát mép an toàn), hiệu ứng ChatGPT; thắng → Verdant Ruin Core, cổng sau trùm mở, màn "Region 2 Complete".
8. Kiểm bằng Playwright (ảnh chụp ngoài repo): đi phòng, gỗ sập + gai + về gờ, học Neo Rễ ở R206, neo cầu R207, Chuông Lưu R204 + chết hồi sinh, đánh Warden tới pha 2 + choáng, trùm đủ 3 pha và đủ đòn. `node tools/vung-2/kiem-thu-dat-muc.js`: 33/33. Không sửa Vùng 1 / engine chung nên không cần chạy lại phép thử Vùng 1.

Chỗ còn đơn giản / mình tự chọn (không hỏi được ChatGPT vì lượt này không có Chrome):
- Ảnh nút neo ChatGPT là ô đất vuông có vòng đồng; bản 32×32 bị mất vòng → cắt lại 48×48 từ ảnh gốc. Nút treo giữa khoảng trống trông như tấm đất vuông – nên nhờ ChatGPT vẽ bản nút trong suốt nền.
- Trùm đứng cố định ở giữa đấu trường (mọc từ rễ), thân không chắn người chơi; chưa dùng lớp xúc tu/lõi chuông tách riêng (art/trum-vung-2/lop).
- Warden Rot Command chưa làm nhiễu nút neo 60 khung; Husk Leaper nhảy cung chỉ là lệch hình (hộp va chạm vẫn trên sàn).
- Báo đòn chung dùng dấu "!" hổ phách của Vùng 1 (ảnh ChatGPT) như Vùng 1.
- Chưa có màn chuyển sang Vùng 3 (người dùng dặn dừng sau Vùng 2).
