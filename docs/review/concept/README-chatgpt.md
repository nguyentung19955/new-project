# LINH KHÍ — Art Tool Starter Pack

Gói này gom các concept đã tạo trong cuộc trò chuyện và một công cụ CLI nhỏ để chuẩn bị ảnh pixel art. Nó là **bước đầu của pipeline**, chưa phải bản tích hợp hoàn chỉnh vào game.

## Trạng thái quan trọng

- Game được mô tả trong gói handoff là Canvas 2D và phần lớn hình được vẽ bằng code.
- Các ảnh trong `concepts/` là **concept/reference sheets**, không phải sprite sheet production-ready. Chúng có chữ, nhiều panel và bố cục minh họa; không được cắt nguyên tấm rồi đưa vào game.
- Gói hiện tại không bao gồm source code game, nên không thể sửa `sprite_custom.js`, chạy game hoặc xác nhận tích hợp thật.
- Không được suy đoán kích thước frame chỉ vì ảnh concept có ghi 22×33 px. Cần lấy đúng sprite gốc/manifest và xác minh bằng code.

## Công cụ

Yêu cầu Python 3.10+ và Pillow:

```bash
python -m pip install Pillow
python tool/linh_khi_art.py --help
```

### Xem thông tin ảnh

```bash
python tool/linh_khi_art.py inspect concepts/character_concept_v2.png --json output/inspect.json
```

### Phóng pixel art không blur

```bash
python tool/linh_khi_art.py scale input.png --factor 3 --output output/preview_x3.png
```

### Đặt ảnh vào canvas trong suốt

```bash
python tool/linh_khi_art.py fit-frame input.png --width 22 --height 33 --output output/frame.png
```

Lệnh này chỉ giữ tỷ lệ và đặt ảnh giữa canvas; **không tự động biến concept thành sprite đúng game**.

### Cắt sprite sheet theo lưới đã xác minh

```bash
python tool/linh_khi_art.py crop-grid sheet.png --frame-width 22 --frame-height 33 --columns 4 --rows 2 --output-dir output/frames
```

Chỉ chạy lệnh này khi bạn đã xác minh frame width/height, số hàng/cột và gốc crop. Công cụ sẽ từ chối nếu lưới vượt biên ảnh.

## Các bước hoàn thiện đúng

1. Chốt concept nhân vật và palette với ảnh gốc.
2. Yêu cầu tạo **một asset riêng mỗi lần**, nền trong suốt, không chữ, không panel, không contact sheet.
3. Hậu kỳ thủ công/thuật toán có kiểm soát: alpha sạch, giới hạn palette, căn pivot, frame consistency.
4. Tạo `.sprite.json` đúng schema đọc bởi game.
5. Kiểm thử trên source game thật; xác minh hitbox, timing và gameplay không đổi.

Không có tự động xóa nền trong tool này vì xóa nền theo phỏng đoán có thể phá các pixel viền và màu tương tự nền.
