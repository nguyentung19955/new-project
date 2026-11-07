# Kiểm độ rối "15 ụ cùng bắn" — báo cáo ChatGPT V3 mục XXVII (kịch bản A, B)

Công cụ: `tools/thap-kt-15u.js` (iPhone 13, 15 ụ 3★, 24 quái trâu đứng rải đều dọc đường, chạy luật trước 4 s rồi chụp 8 khung, mỗi khung cách 0,5 s).
Chỉ đọc game, không sửa luật hay ảnh. Ảnh: `A.png` (15 Liên Thanh), `B.png` (Tesla + Laser + Hố Đen + Độc + Băng). Số liệu từng khung: `so-lieu.json`.

## Số đo (giá trị lớn nhất trong 30 bước vẽ quanh mỗi khung)

| Kịch bản | Dải nổ đang sống | Hạt | Chữ nổi | Vẽ 1 khung chậm nhất |
|---|---|---|---|---|
| A — 15 Liên Thanh | **90 / 90 (chạm trần)** | **320 / 320** | **48 / 48** | ~14–20 ms |
| B — 5 loại × 3 | **90 / 90** | **320 / 320** | **48 / 48** | ~16–19 ms |

Thời gian vẽ trên máy chủ không đại diện cho điện thoại. Điều đáng chú ý là **cả 3 trần đều bị chạm liên tục**: hệ thống đang cắt hiệu ứng vì hết chỗ, chứ không phải vì đã có thứ bậc ưu tiên.

## Nhìn tận mắt (đối chiếu V3)

1. **Mọi ụ dồn vào cùng 1–2 quái gần lõi** → tia laser, sét và nổ trúng chồng lên một điểm, tạo một đốm trắng lớn ở góc dưới phải.
   Đây đúng là trường hợp V3 XXII mô tả: "gộp hit cùng vị trí, không chồng 10 vụ nổ trùng tâm". **Chưa có cơ chế gộp.**
2. **Số sát thương chồng thành một dải không đọc được** ở đáy bàn (chạm trần 48 chữ nổi). Ứng với V3 XXIII.6–7 và XXII "caps chữ bay".
3. **Kịch bản B: 8–9 vòng nạp xanh lá sáng cùng lúc**, và có khung thêm 3 vòng trắng lớn của Băng → đúng điều V3 XXIII.4 cảnh báo ("không chồng nhiều vòng nạp rực").
   Vòng nạp hiện bật cho mọi ụ có kỹ năng nạp, không phân biệt sắp đầy hay mới bắt đầu.
4. **Trường Hố Đen** (vòng tím lớn) che đoạn đường quái góc trên phải. Theo V3 XXI, trường tồn tại nên nằm DƯỚI quái hoặc làm mờ đi.
5. Phần tốt: đạn Liên Thanh vẫn đọc rõ hướng; sao "3" và hình ụ không bị che; HUD không rung.

## Đề xuất sửa (code game — chờ người dùng chốt, nhánh demo-hop-tuong đang DỪNG)

| # | Sửa | Chỗ | Cỡ |
|---|---|---|---|
| b | Gộp nổ trúng trùng tâm: trong ~80 ms, các vụ nổ cách nhau < 0,3 ô → giữ 1 vụ, chỉ tăng cỡ nhẹ (≤ +25%) | `fx.js` `no()` | ~10 dòng |
| b2 | Gộp chữ sát thương trùng chỗ trong ~150 ms thành 1 số cộng dồn | `fx.js` (chữ nổi) | ~10 dòng |
| c | Vòng nạp: chỉ hiện rõ khi ≥ 70% hoặc khi chạm chọn ụ; dưới mức đó mờ ≤ 25% | nơi vẽ vòng nạp (`render.js` / `growfx.js`) | nhỏ |
| c2 | Hào quang buff (`buffvfx.js`): bùng khi nhận buff, sau đó mờ về ~20% | `buffvfx.js` | nhỏ |
| d | Trường Hố Đen: vẽ dưới lớp quái hoặc alpha ≤ 0,5 | thứ tự lớp vẽ | nhỏ |

Sau mỗi bước sửa, chạy lại `node tools/thap-kt-15u.js` để so ảnh và số liệu trước/sau.
