# 007 – Nhân vật phụ đứng trong cảnh làng (animation đứng/thở)
- **Trạng thái:** XONG một phần (02/11, phiên chính vẽ bằng ChatGPT từ chân dung: vesper.png 512×160, tock.png 384×96, morrow.png 512×128, nhìn TRÁI, chân chạm đáy ô; Kaelith chờ 008)
- **Ưu tiên:** P0 (Vesper, Tock, Morrow) · P1 (Kaelith). Thiếu ảnh của ai thì người đó không hiện, không nói chuyện được.
- **Dùng vào:** game/lang-chuong/ – nhân vật đứng tại chỗ trong cảnh 006, người chơi lại gần bấm Talk thì mở hộp thoại (chân dung đã có ở art/cot-truyen/chan-dung/).
- **Thiết kế:** GIỐNG chân dung đã vẽ (art/cot-truyen/chan-dung/ba-ngan-yen.png, tock-yen.png, morrow-yen.png; Kaelith xem 008) – gửi chân dung làm tham chiếu. Cỡ so với nhân vật chính: Kiếm Khách cao ≈ 120 px trên màn 540.
- **Hướng gốc:** nhìn sang TRÁI. Neo: đáy-giữa (chân chạm đáy ô, cùng vị trí mọi khung). Nền trong suốt, mọi khung cùng khung hình, không nhấp nháy.
| Ai | Khung | ms gợi ý | Ô | Lưu |
|---|---|---|---|---|
| Vesper, the Bellkeeper (bà già giữ chuông, áo choàng, cầm chuông nhỏ) | 4 (thở/đung đưa chuông) | 220 | 128×160 | art/lang-chuong/npc/vesper.png |
| Tock, the Clockwork Owl (cú máy đồng, đậu trên sào) | 4 (nghiêng đầu, chớp mắt kính) | 180 | 96×96 | art/lang-chuong/npc/tock.png |
| Morrow, the Stone Smith (người đá nứt, búa đồng) | 4 (gõ búa xuống đe – đe nằm trong nền 006) | 180 | 128×128 | art/lang-chuong/npc/morrow.png |
| Kaelith (P1, xem 008 để cùng thiết kế) | 4 (đứng, áo choàng bay nhẹ) | 120 | 96×128 | art/lang-chuong/npc/kaelith.png |
- **Định dạng:** mỗi người 1 dải ngang các ô liền nhau (ví dụ vesper.png = 512×160). Kèm ảnh gốc *-nguon-chatgpt.png.
