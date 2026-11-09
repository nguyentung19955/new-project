# Hướng hình ảnh anime — tư vấn ChatGPT (09/11/2026)

Đầu vào: 4 ảnh chụp hiện tại (HOME, 2 ảnh trận wave 30, trang ụ). Tóm tắt, diễn đạt lại.

Ảnh: `so-sanh-huong.jpg` (hiện tại | mockup A sáng | mockup B đêm), `mockup-A-sang.jpg`, `mockup-B-dem.jpg` (ChatGPT vẽ, chỉ là ý tưởng, không phải asset dùng thẳng).

## Đánh giá hiện tại
- Nhân vật ~8/10, đồng bộ hình ảnh ~5/10, độ dễ đọc trận ~5/10.
- Lỗi lớn: (A) hai ngôn ngữ hình ảnh — nhân vật anime fantasy vs UI nhà máy (thép xước, đinh tán, sọc vàng đen); (B) quá nhiều chi tiết cạnh tranh gameplay — bàn và nền cùng tông xám, viền ô dày, khay thẻ nhiều thông tin, số nhỏ; (C) hiệu ứng chưa có thứ bậc — boss/tia tím trùng màu nhiều ụ, vòng buff xanh, khó phân biệt sát thương vs trạng thái.
- Banner trùm quá dày, lặp tên trùm, mô tả bị cắt "...".
- Giữ: logo, chân dung anime, thiết kế từng ụ, bàn 5×3, nút Summon giữa, màu bậc.

## 3 hướng
| Hướng | Màu/chất liệu | Bàn/icon/font | Tham khảo |
|---|---|---|---|
| **A. Anime Fantasy-Tech (khuyên)** | indigo đậm, cyan, vàng phép; khung ceramic tối, kính ma thuật, viền sáng mỏng | bàn đá công nghệ khắc rune; icon anime-vector; Sora + Oxanium | Blue Archive, Arknights: Endfield |
| B. Arcane Fantasy | tím than, vàng cổ, xanh ngọc; obsidian, thuỷ tinh | bàn pháp trận, đường lát đá; icon rune; Cinzel + Inter | Reverse: 1999, AFK Journey |
| C. Anime Neon Sci-Fi | navy gần đen, cyan điện, hồng neon; hologram | lưới năng lượng; icon hình học; Oxanium + Inter | Punishing: Gray Raven |

Thế giới gợi ý cho A: "Astral Arsenal" — các chủng tộc anime điều khiển cỗ máy chạy bằng phép thuật (ụ vẫn cơ khí, UI sạch kiểu gacha).
Bảng màu A: nền #111827 · panel #24324B · tương tác #35D6E8 · CTA #FFD36A · mana #A779FF · chữ #F5F7FF · nguy hiểm #FF6278 · đường quái #394763. Tỉ lệ 70% bề mặt tối đơn giản / 20% màu nhân vật-ụ / 10% sáng nhấn. Bỏ bánh răng/đinh tán/sọc cảnh báo trên UI (giữ trên ụ cơ khí). Số chiến đấu dùng Oxanium Bold, chữ nhỏ Sora/Inter.

## HUD trận (390×844)
| Vùng | Cỡ | Thay đổi |
|---|---|---|
| HUD trên | cao 48–54 px | wave trái, trùm giữa, tim phải; HP + đếm ngược một cụm |
| Bàn | ô 56–60 px | tách sáng rõ khỏi nền, viền ô mỏng hơn |
| Cảnh báo trùm | cao 28–36 px | chỉ báo kỹ năng, không lặp tên trùm/wave |
| Mana/Summon | Summon Ø64–74 | mana số lớn, giá nằm trong nút |
| Khay 5 thẻ | mỗi thẻ 48–52 px | chân dung rõ, nâng cấp là dải nhỏ |
| Chỉ huy | 58–64 px | hồi chiêu/sẵn sàng nổi bật |
| Vùng chạm | ≥ 44×44 | |

VFX: đạn thường nhỏ, không vệt dài; buff vòng mỏng 1–2 px/huy hiệu; giữ viền quái + thanh máu trên lớp hiệu ứng; nổ loé ~0,1 s rồi tắt nhanh; aura alpha 25–40%; số sát thương ngắn, gộp. Cần hệ màu chung cho damage/buff/debuff/mana/báo chiêu trùm.
Khung bậc: Trắng không glow · Xanh viền mảnh · Tím có rune · Vàng góc vàng · Đỏ hoạ tiết riêng + hiệu ứng khi mở/nâng. Trong trận glow bậc rất nhẹ hoặc tắt; nhận bậc bằng dáng viền + màu.

## HOME + màn phụ
HOME (P1): giữ nhân vật lớn, bỏ nút bánh răng, chọn chế độ gọn, 1 nút PLAY rõ (deck chưa đủ → nút thành BUILD DECK). DECK (P1), TRANG Ụ (P1: ghi chính xác luật/phạm vi/cộng dồn/công thức — cung cấp luật không phải chỉ cách tối ưu), COLLECTION/SHOP/QUEST/EVENT (P2, dùng chung component).

## Lộ trình
P0: chốt bảng màu, font, 5 màu bậc, 6–8 component chung → làm sáng/tách bàn + đường quái, giảm VFX che quái → thay HUD trên/dưới, khay thẻ, cảnh báo trùm. P1: HOME, DECK, TRANG Ụ. P2: Shop/Quest/Event/Collection, animation bậc.
Làm 1 bản thử ở wave 30 bàn đầy + trùm tung chiêu trước; đọc được quái/sao/buff/tài nguyên ở 390×844 thì mới triển khai rộng.

## Prompt asset (tiền tố chung)
MASTER STYLE: "Premium 2D anime fantasy-tech mobile game UI, dark indigo ceramic surfaces, subtle magical cyan energy, thin champagne-gold accents, elegant clean geometry, polished anime gacha aesthetic, crisp readable silhouettes, consistent top-left lighting, restrained bloom, no heavy industrial machinery, no hazard stripes, no text, no watermark."
- Khung HUD/nút: panel ngang rỗng, đối xứng, hợp 9-slice, viền trong cyan mảnh, lõi kính indigo mờ, góc vàng, nền #FF00FF, 3:1.
- Nền bàn: sàn đấu nhìn thẳng từ trên, gạch đá-ceramic xanh khử bão hoà, mạch phép khắc mờ, tương phản thấp, liền mạch.
- Icon HOME: sheet 4×2 (nhiệm vụ, cửa hàng, sự kiện, vòng quay, bộ bài, bộ sưu tập, trùm, cài đặt), cùng trọng lượng, ≤3 màu chính, không nền bánh răng, nền #FF00FF.
Không để AI vẽ chữ UI hay 9-slice cuối; kiểm icon ở 32–48 px.
