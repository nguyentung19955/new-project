# 002 – Hiệu ứng "phát hiện bí mật"
- **Trạng thái:** CHỜ (nên làm sau 001)
- **Dùng vào:** game/an/ – bật lên đúng chỗ bí mật khi người chơi tìm ra (vỡ tường nứt, đi xuyên tường giả, nhặt vật phẩm ẩn). Chưa có ảnh → chỉ hiện chữ thông báo (đã có sẵn), không vẽ gì thêm.
- **Mô tả:** luồng tiếng vọng xanh nhạt (#CEF0D6) xoáy lên thành vòng sóng âm hình chuông nhỏ rồi tan thành bụi sáng; điểm nhấn vàng đồng (#E1B85A) rất ít. Phong cách pixel art giống art/hieu-ung/chieu-moi/ và art/vung-1/dao-cu/.
- **Số khung:** 8 khung, ~70 ms/khung (không lặp). Khung cuối gần như trong suốt.
- **Cỡ ô:** 192×192 mỗi khung (vẽ trong ~160 px, chừa lề, KHÔNG chạm mép). Xuất thành 8 PNG trong suốt cùng cỡ.
- **Hướng / neo:** không có hướng; neo **đáy-giữa** (đặt ở chân chỗ bí mật).
- **Lưu:** art/an/phat-hien/f0.png … f7.png + art/an/phat-hien/nguon-chatgpt.png
- **Prompt gợi ý:** "use the image generation tool and DRAW a pixel-art VFX sprite sheet, 8 frames in one row with wide gaps: a pale mint (#CEF0D6) echo wisp spirals up into a small bell-shaped sound ring, then dissolves into glittering dust; dark fantasy, solid #FF00FF background, no text, nothing touching the edges."
