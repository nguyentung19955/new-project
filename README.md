# Linh Khí (tên tạm)

Game phiêu lưu hành động pixel art cho điện thoại, màn hình ngang, lấy bối cảnh truyền thuyết Việt Nam.
Hai luật cốt lõi: vũ khí tiến hóa theo cách bạn dùng, và boss thích nghi để khắc chế thói quen của bạn.

## Trạng thái

- Thiết kế game: xong bản 4, xem [docs/thiet-ke-game.md](docs/thiet-ke-game.md).
- Hình ảnh: đang làm. Bắt đầu từ hero Thợ Rèn để chốt phong cách.
- Mã game: chưa bắt đầu.

## Cấu trúc thư mục

| Thư mục | Nội dung |
|---|---|
| `docs/` | Bản thiết kế game (Markdown và PDF) |
| `art/prompts/` | Prompt tạo hình nhân vật và boss trên Pippit |
| `art/raw/` | Ảnh gốc tải về từ Pippit, nền hồng cánh sen |
| `art/parts/` | Các mảnh rời của nhân vật sau khi tách (đầu, thân, tay, chân, vũ khí) |
| `art/pixel/` | Hình pixel hoàn chỉnh, dùng trong game |
| `tools/` | Công cụ Python chuyển ảnh sang pixel |
| `game/` | Mã nguồn game (chưa có) |

## Quy trình làm hình

1. Tạo ảnh nhân vật trên Pippit theo prompt trong [art/prompts/pippit.md](art/prompts/pippit.md), lưu vào `art/raw/`.
2. Chạy công cụ để chuyển sang pixel. Cách dùng ở [tools/README.md](tools/README.md).
3. Xem ảnh xem trước (file có đuôi `_x8`), chưa đạt thì chỉnh thông số hoặc tạo lại ảnh gốc.

## Kích thước chuẩn

| Loại | Chiều cao | Số màu tối đa |
|---|---|---|
| Hero và quái thường | 32 điểm ảnh | 8 |
| Boss | 96 đến 128 điểm ảnh | 12 |
