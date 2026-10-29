# Phản hồi 18 – Lam đơn giản hoá (học từ Tiny Swords)

Bối cảnh: người dùng gửi bộ Tiny Swords (Pixel Frog, chibi nhìn từ trên). Claude nhận định "đơn giản hoá thì gần hết giật nhưng phải đổi tinh thần, vẽ lại cảnh" → chuyên gia sửa lại như dưới.

## Đánh giá các nhận định
| Nhận định | Đánh giá |
|---|---|
| Ít chi tiết giúp giảm "sôi" giữa khung | Đúng, nhất là với ảnh gen |
| Đơn giản hoá thì giật gần như biến mất | Chưa đúng – sai tỉ lệ, neo, nhịp vẫn gây giật |
| Nhân vật đơn giản phải dễ thương, tươi | Không bắt buộc – hình khối đơn giản vẫn trầm, bí ẩn, nguy hiểm |
| Phải vẽ lại nền, tranh đầu/kết | Chưa cần – giữ nhận dạng, màu, chất liệu chính của Lam thì vẫn hoà cảnh hiện tại |
| Ép ảnh gen vào lưới pixel là thành pixel art tốt | Không – chỉ chuẩn hoá điểm ảnh, không sửa tạo dáng/chuyển động sai |

Điều đáng học ở Tiny Swords: cách kiểm soát hình, không phải độ chibi. Chém Warrior: tư thế chuẩn bị ổn định; tới nhát đánh thân đổi dáng rõ, cung chém lớn giải thích chuyển động nhanh – không phải khung nào cũng tả vị trí trung gian.

## Hướng chọn: "đơn giản hoá nét vẽ, giữ thiết kế u buồn"
- Giữ mũ nhọn, mặt đen, một mắt hổ phách nhỏ, chuông đồng, Âm Đao.
- Giữ tỉ lệ hiện tại; không làm đầu to, người tròn.
- Áo còn 3–4 mảng lớn, 2–3 nếp chính.
- Gấu còn vài chỗ rách lớn; bỏ tua nhỏ, lỗ li ti.
- Bỏ texture loang, vết xước vải; một màu nền + hai mức bóng.
- Viền than rõ vừa đủ ở 112 px, không quay lại viền đen dày kiểu Lam cũ.
- Giữ màu trầm; chưa chuyển sang pixel art; chưa đổi nền.

## Quy trình
1. KHÔNG gen ngay cả sheet chạy (đổi thiết kế + animation cùng lúc thì không biết cái gì cải thiện).
2. Gen MỘT dáng đứng đơn giản hoá, đặt cạnh Lam hiện tại trong cùng cảnh ở 112 px.
3. Nếu vẫn ra "Cổ tích chuông tàn" mới làm chạy.
4. Bản chạy khoá đầu hiện tại giữ làm đối chứng; không mặc định thêm khung là mượt.

## Prompt thử thiết kế (đính kèm Lam chốt)
Simplify the attached approved Lam for consistent 2D game animation, without redesigning the character. Preserve the exact proportions, pointed hood silhouette, narrow hood opening, small amber eye, brass bell and tuning-fork blade. Replace fabric texture and tiny folds with broad flat painted shapes: one base color and two shadow tones. Long cloak with only three large folds and a few large ragged hem notches. Muted slate navy and grey-green, restrained charcoal outline. Quiet, solemn and mysterious. Full side view facing right, calm low guard, tiny boot tips. Pure white background, no effects or text.

## Gửi Claude
Anh muốn thử Lam đơn giản hoá nhưng giữ tỉ lệ, màu và tinh thần hiện tại; chưa chuyển sang pixel art, chưa đổi nền. Trước mắt gen một dáng đứng, giảm texture/nếp nhỏ/gấu vụn, giữ mũ–mặt–mắt–chuông–Âm Đao. Đặt cạnh Lam hiện tại trong cùng cảnh, cùng cỡ 112 px. Duyệt thiết kế xong mới làm chạy; chưa gen đồng thời cả sheet. Bản chạy khoá đầu hiện tại vẫn giữ làm đối chứng.
