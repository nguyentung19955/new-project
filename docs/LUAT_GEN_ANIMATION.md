# Luật gen khung hình chuyển động (animation) cho Thần Thoại Việt

Mục tiêu: mỗi động tác có 4 khung giống hệt nhân vật, chỉ khác tư thế → game ghép lại thành chuyển động mượt.

## 1. Mỗi ảnh = 1 nhân vật × 1 động tác × 4 khung
- **Một ảnh chỉ một nhân vật, một động tác.** Không gộp nhiều nhân vật hay nhiều động tác vào một tấm.
- **4 ô vuông nằm ngang một hàng**, ảnh 1024×256 (mỗi ô 256×256). Không dùng 6–8 ô: càng nhiều ô càng dễ sai.
- Số ảnh cần cho mỗi nhân vật:

| Loại | Ảnh 1 | Ảnh 2 | Ảnh 3 |
|---|---|---|---|
| Tướng | Đứng thở (idle) | Đánh (attack) | Tung chiêu (cast) |
| Quái | Đi (walk) | Đánh (attack) | — |
| Boss | Đi (walk) | Đánh (attack) | Chiêu (skill) |

## 2. Giữ nhân vật giống nhau ở cả 4 khung
- **Luôn đính kèm ảnh nhân vật đã có trong game** (ví dụ `assets/packs/lactuong/idle.png`) làm mẫu.
- Ghi trong prompt: *same character, same size, same proportions, same colors and costume in every cell*.
- Nhân vật **cao khoảng 70% ô**, **chân chạm cùng một đường đáy** ở cả 4 ô (cách đáy ô khoảng 8%).
- **Lề ít nhất 10%** mỗi phía; vũ khí, cánh, đuôi, hiệu ứng không được vượt ra ngoài ô.
- Quay mặt **sang phải**, góc nhìn nghiêng 3/4 giống ảnh mẫu.

## 3. Mô tả rõ từng khung (không chỉ ghi "animation")
- **Đi:** (1) chân trái bước tới · (2) hai chân chụm, người nhô cao nhất · (3) chân phải bước tới · (4) hai chân chụm.
- **Đứng thở:** (1) bình thường · (2) ngực phồng, vai nhích lên · (3) bình thường · (4) hơi hạ người.
- **Đánh:** (1) chuẩn bị · (2) lấy đà, vũ khí kéo ra sau · (3) ra đòn, vũ khí ra trước, một vệt chém ngắn · (4) thu về.
- **Chiêu:** (1) tụ lực, tay đưa lên · (2) hiệu ứng nhỏ quanh tay · (3) phóng chiêu, hiệu ứng lớn nhất (vẫn nằm trong ô) · (4) hạ tay.
- **Bay:** (1) cánh giơ cao nhất · (2) cánh ngang · (3) cánh hạ thấp nhất · (4) cánh ngang.

## 4. Nền và những thứ cấm
- Nền **một màu hồng tím phẳng #FF00FF** ở mọi ô và giữa các ô.
- **Không** chữ, số, nhãn "[1]…", vạch kẻ ô, khung viền, bóng đổ dưới đất, nền caro giả trong suốt, dấu bản quyền.
- **Không** dùng màu hồng tím trên người nhân vật.
- Màu phẳng, khoảng 20–30 màu, viền nâu đậm như ảnh mẫu (file nhẹ, tách nền sạch).

## 5. Kiểm tra trước khi gửi
- Đủ 4 ô, đúng thứ tự, cùng một nhân vật, cùng kích thước.
- Nền đều một màu hồng tím đậm; không có ô nào nền nhạt hay trắng.
- Không có phần nào lấn sang ô bên.
- Đặt tên file theo mã nhân vật + động tác, ví dụ `lactuong-attack.png`, `tom-walk.png`.
- Sai một trong các điều trên thì gen lại, gõ thêm: *"Regenerate: exactly 4 equal square cells in one row, one pose per cell, same character, flat #FF00FF background, no text."*

## 6. Mẫu prompt (thay phần trong ngoặc nhọn)
```
Use the attached image as the exact character reference (same costume, colors, proportions, weapon).
Create a 4-frame sprite strip of {TÊN NHÂN VẬT} performing {ĐỘNG TÁC} for a mobile tower-defense game.
LAYOUT: one image 1024x256, exactly 4 equal square cells in a single row, one frame per cell, left to right.
Frame 1: {mô tả khung 1}. Frame 2: {mô tả khung 2}. Frame 3: {mô tả khung 3}. Frame 4: {mô tả khung 4}.
Same character, same size and same proportions in every cell; character about 70% of the cell height, facing right (3/4 view),
feet on the same baseline 8% above the bottom of each cell, at least 10% empty margin on every side; nothing crosses into another cell.
STYLE: cute chibi, thick dark-brown outline, flat cel shading, limited palette of about 20-30 colors, no gradients, no texture.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no shadows, no watermark. No magenta on the character.
```

## 7. Công cụ gen ảnh miễn phí khác (hạn mức có thể thay đổi)
- **Fooocus** (chạy trên máy tính có card đồ hoạ, hoàn toàn miễn phí, không giới hạn; bạn đã dùng trước đây). Hợp nhất để gen nhiều và thử lại nhiều lần.
- **ChatGPT** (bản miễn phí có tạo ảnh, giới hạn vài ảnh mỗi ngày): giữ đúng bố cục ô khá tốt.
- **Microsoft Designer / Bing Image Creator**: miễn phí, cần tài khoản Microsoft.
- **Leonardo.ai, Ideogram, Adobe Firefly**: miễn phí theo lượt mỗi ngày / tháng.

Với mọi công cụ: đính kèm ảnh mẫu được thì đính kèm, và áp dụng đúng các luật ở trên.
