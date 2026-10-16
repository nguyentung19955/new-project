# Tiếng Vọng Cuối Cùng

Game metroidvania 2D pixel art. Nhân vật chính là một cô bé giữ chuông, có thể ghi lại 3 giây chuyển động của mình thành một "tiếng vọng".

## Thư mục

| Thư mục | Nội dung |
| --- | --- |
| `docs/gdd.md` | Bản thiết kế game: cốt truyện, cơ chế, động tác, item, thế giới, kế hoạch |
| `docs/dac-ta-nhan-vat-sprite.txt` | Đặc tả sprite 24×24 của nhân vật Thợ Săn Chuông |
| `tools/sprite-lab.html` | Công cụ dựng nhân vật 3D, xem animation, xuất sprite sheet. Mở bằng Chrome |
| `art/nhan-vat/` | `tho-san-chuong-chuan.png` là bản chuẩn (chuông vàng đồng). `tho-san-chuong-ban-dau.png` là bản đầu, chỉ để tham khảo |
| `art/ke-dich/` | Quái chuông gỗ (chuông đồng xỉn) |
| `art/item/` | 12 icon item |
| `art/tileset/` | Tileset concept: đất, rêu, ván, thang, dây. Chưa ghép liền mạch |
| `art/nen/lang-chuong/` | Nền Làng Chuông: 3 lớp parallax (xa, giữa, gần) và ảnh toàn cảnh |
| `art/nen/tham-khao/` | Nền phụ và ảnh mẫu bố cục màn chơi |

## Bảng màu chuẩn

| Mã | Dùng cho |
| --- | --- |
| `#0C0F14` | Viền, mảng tối nhất |
| `#212835` | Mũ, áo choàng |
| `#1A212B` | Bóng |
| `#21413A` | Xanh tối |
| `#32804F` | Xanh lá chính |
| `#83CC93` | Viền sáng xanh |
| `#CEF0D6` | Điểm sáng, hiệu ứng tiếng vọng |
| `#4A5A6E` | Xám kim loại |
| `#E1B85A` / `#9C6B30` / `#F3E6C8` | Vàng đồng, bóng vàng, ánh kem (chuông, chắn kiếm) |

## Việc còn mở

- Ảnh từ ChatGPT chưa đúng lưới pixel và còn điểm ảnh bán trong suốt. Cần làm sạch bằng công cụ Pixel Fit.
- Tileset cần bản ghép liền mạch có đủ cạnh và góc.
- Sprite Lab đang được làm lại thêm khung và thêm animation di chuyển, chiến đấu. Bản mới nhất nằm ở artifact, sẽ cập nhật lại vào đây.
