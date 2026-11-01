# Báo cáo Luồng E – Đưa hình ChatGPT vào Vùng 1 (Chuông Lưu, cửa khoá 3 Chuông Vỡ, trùm Mẫu Chuông Rỗng)

Hình ChatGPT vẽ (PNG đã tách nền) nay thay cho hình vẽ tạm. Nếu ảnh không nạp được, game vẫn tự quay về hình vẽ tạm như cũ, không hỏng trang.

## Cách đưa hình vào cho hợp kiểu pixel
Hình ChatGPT có độ phân giải cao (một điểm ảnh rất nhỏ). Lúc nạp, game thu nhỏ hình về đúng lưới điểm ảnh của game rồi phóng lại cho nét:
- đạo cụ khớp với ảnh phòng: 1 điểm = 3 px;
- trùm khớp với quái: 1 điểm = 2 px.

Viền mờ của hình được làm cứng lại, nên mép hình gọn, không bị quầng. Phần này nằm trong `ve.js`, hai hàm `anhLuoi` và `veAnh`.

## 1. Chuông Lưu (P05, P11)
- Hai hình: `chuong-luu-tat.png` khi chưa nghỉ ở phòng đó, `chuong-luu-sang.png` khi đã nghỉ ở đây. Ánh đồng ấm vẫn giữ, sáng và rộng hơn khi chuông sáng.
- Chân bệ đá đặt trên mặt sàn tại ô `chuong_luu`. Hình cao khoảng 2,9 ô và lún 6 px vào mép sàn, vì mặt đá vẽ hơi méo, để không bị lơ lửng. Muốn đổi cỡ thì sửa `CHUONG` trong `ve.js`.
- `tools/vung-1/ve-phong.py`: đã bỏ đoạn vẽ chuông đồng úp vào ảnh phòng, nhưng vẫn giữ trống vùng quanh chuông để đồ trang trí không đè lên. Đã nướng lại P05 và P11. So với ảnh cũ, chỉ đúng vùng chuông thay đổi.
- Dòng chữ "↑ Nghỉ ở Chuông Lưu" được đặt cao theo hình mới.

## 2. Cửa khoá 3 Chuông Vỡ (P11, cửa đông)
- Khi còn khoá dùng `cua-khoa-dong.png`. Khi đủ 3 Chuông Vỡ dùng `cua-khoa-mo.png`, có 3 ổ chuông sáng kèm ánh hổ phách nhẹ trên vòm.
- Cửa cao khoảng 3,6 ô, chân trên sàn ngay dưới lỗ cửa. Vì cửa nằm sát mép phòng, hình được đẩy vào trong cho cả khung cửa lọt trong phòng. Có thêm một đốm sáng nhỏ để nhìn rõ trong bóng tối.
- Với loại cửa này, game không vẽ song dây leo nữa. Khi đánh tinh anh hoặc trùm, rễ vẫn khép các cửa còn lại như cũ.
- Thay đổi nhỏ về va chạm (`the-gioi.js`, hàm `odKhoa`): khi cửa còn khoá, game bịt thêm 1 cột ô trống ngay phía trong cửa. Nhờ vậy người chơi dừng trước song rễ (cột 54), không đứng lọt vào trong hình. Tầm hiện lời nhắc "Cửa im lặng – cần 3 Chuông Vỡ" cũng nới ra cho khớp. Khi mở khoá, cột này mở lại.

## 3. Trùm Mẫu Chuông Rỗng (P12)
Ba hình, gốc quay TRÁI, tự lật khi trùm quay phải:

| Lúc | Hình |
|---|---|
| Đứng nghỉ, pha 1 | `nghi.png` |
| Gầm khi thức giấc, báo trước mọi đòn ở pha 1 (Gõ Không Tiếng, Mưa Mặt Nạ, Quét Chuông), lúc quét | `gio-chuong.png` |
| Pha 2 (sau chuyển pha), kể cả lúc báo đòn | `vo-mat-na.png` (lúc báo đòn hơi vươn lên) |
| Chuyển pha | rung lắc. Nửa đầu dùng `nghi`, chớp trắng rồi sang `vo-mat-na` |
| Chết | rung rồi mờ dần (2,5 s) |

- Khi báo đòn, chuông rực ánh hổ phách nhấp nháy (vẫn có dấu "!" như cũ). Lúc đập chuông có nhịp co giãn quanh chân.
- Cỡ hình: cao khoảng 216 px, gần 2,8 lần nhân vật (78 px). Muốn đổi thì sửa `TRUM_TL` trong `ve.js`.
- Điểm chân của mỗi hình được đo riêng nên đổi hình không bị giật ngang.
- Trúng đòn: nhấp trắng.
- Hitbox: từ 45×120 đổi thành 84×160 cho khớp thân rễ và xương to hơn (trong `trum.js` và `trum.json`).
- Hình vẽ tạm bằng canvas vẫn giữ làm dự phòng.
- **Chiêu mới (dễ nên làm luôn): Quét Chuông Ngang**, theo tư vấn chơi thử.
  - Khi người chơi đứng gần (≤ 4,5 ô), có 60% khả năng trùm chọn chiêu này, không dùng 2 lần liền.
  - Trùm quay về phía người chơi, giơ chuông báo trước 0,6 s, rồi quét một dải sát sàn cao 80 px ra phía trước: dài 190 px ở pha 1, 230 px ở pha 2.
  - Né bằng cách nhảy qua hoặc lùi ra xa. Vệt quét có màu đồng và xám, mờ dần.

## 4. Kiểm tra (Playwright)
- `node tools/vung-1/chup-e.js` chụp ảnh vào `tools/vung-1/xem/e/`: `p05-tat`, `p05-sang`, `p11-khoa`, `p11-mo`, `trum-nghi`, `trum-bao`, `trum-pha2`, `trum-phai`, `trum-trung`, `trum-quet`, `trum-chet`.
- Đã tự xem ảnh:
  - Chuông và cửa đứng trên sàn, không lơ lửng.
  - Trùm đứng trên sàn và lật đúng hướng.
  - Nhấp trắng và mờ dần đều chạy.
  - Cú quét trúng người chơi đứng sát.
- `node tools/vung-1/thu-e.js`:
  - Chưa đủ chuông: người chơi dừng ở cột 54 và hiện lời nhắc.
  - Đủ 3 chuông: đi qua sang P12.
  - Đánh trùm qua đủ các trạng thái gầm, đứng, gõ, thả, chuyển pha, chết. Trùm hạ xong được ghi nhận (`trumHa`).
- `node tools/vung-1/kiem-tra-vung1.js`: đi được P01 → P12, không thiếu hình, không lỗi JS.

## Còn lại / gợi ý
- Mỗi trạng thái trùm mới chỉ có 1 hình tĩnh, chưa có khung chuyển động. Đã thêm rung, co giãn và ánh sáng cho đỡ cứng. Khi có hình động thì điền vào `trum.json`, game sẽ ưu tiên dùng.
- Pha 2 chưa có hình "giơ chuông" riêng có mặt nạ vỡ, nên lúc báo đòn ở pha 2 vẫn dùng `vo-mat-na` vươn lên kèm ánh sáng. Nếu muốn, có thể nhờ ChatGPT vẽ thêm hình `gio-chuong-vo.png`.
