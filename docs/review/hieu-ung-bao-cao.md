# Báo cáo phiên "hieu-ung" — hiệu ứng bằng ảnh AI

## Đã làm gì

1. **Game đọc được hiệu ứng vẽ bằng ảnh AI.** Đặt tệp `hu-<tên>.sprite.json` vào `game/art/custom/` thì game dùng ảnh đó thay cho hình vẽ bằng code của hiệu ứng ấy. **Không có tệp nào thì game y hệt như trước.**
   - Tệp mới `game/js/fx_anh.js`: nạp dải khung, phát khung theo thời gian, tự lật khi quay trái, xoay theo hướng bay, kiểu "cộng sáng" cho ánh sáng. Dùng lại một ảnh, không tạo hình mới mỗi khung (mượt trên điện thoại).
   - `sprite_custom.js` chỉ thêm 1 dòng (chuyển tệp hiệu ứng sang `fx_anh.js`). `build.py` nhận tệp hiệu ứng.
2. **Trang công cụ mới:** https://spiritblade.web.app/tach-hieu-ung.html (có trong thanh menu, mục "Hiệu ứng").

## 18 hiệu ứng có thể thay bằng ảnh

| Mã | Hiện ở đâu |
|---|---|
| hu-chem-kiem, hu-chem-bua, hu-dam-giao | Vệt đòn thường của kiếm, búa, giáo |
| hu-trung, hu-trung-nang, hu-chi-mang | Đánh trúng quái: thường, nặng, chí mạng |
| hu-pha-giap | Đánh vỡ khiên quái giáp |
| hu-no-lua, hu-no-doc, hu-no-bang | Mọi vụ nổ lửa / độc / băng (tự to nhỏ theo vụ nổ) |
| hu-chuong-lua, hu-chuong-doc, hu-chuong-bang | Chưởng đang bay |
| hu-dan-ten | Mũi tên của em bé |
| hu-dan-qua-no | Quả nổ của Sóc Ném Quả Nổ |
| hu-dan-bao-tu | Viên bào tử của Hoa Phun Bào Tử |
| hu-quai-chet | Quái thường chết tan |
| hu-len-cap | Quầng sáng sau dòng chữ "lên cấp" ở bảng kết quả |

Giữ đúng quy tắc: các vòng đỏ báo nguy hiểm, chấm đỏ trên đạn quái vẫn vẽ bằng code; hạt văng nhỏ vẫn giữ (bớt đi khi đã có ảnh nổ).

## Cách dùng (trên iPhone được)

1. Mở trang, chọn hiệu ứng, bấm **Sao chép prompt vẽ**, dán vào ChatGPT, lưu ảnh ChatGPT vẽ về máy.
2. Bấm vào ô **"Bấm để chọn ảnh"**, chọn ảnh vừa lưu. Trang tự tách nền, xoá đường kẻ, tìm từng khung.
   - Có khung thừa hoặc sai: **chạm vào khung đó** trên ảnh để bỏ.
   - Tìm sai số khung: đổi "Cách tách" sang **Chia đều theo số cột** và gõ số cột thật trong ảnh.
   - Hiệu ứng ánh sáng (nổ, chớp): để **Mép: Mềm** (giữ quầng sáng). Vệt chém, mũi tên: **Sắc**.
3. Xem hiệu ứng chạy ở bước 3 (có khối người mẫu để so cỡ, đổi nền tối/cỏ/đất/sáng, xem chậm). Thấy **ĐẠT** thì bấm **Tải hu-….sprite.json** và gửi tệp cho Claude để đưa vào `game/art/custom/`.

## Đã kiểm

- Cú pháp mọi tệp JS, trang công cụ; `python3 game/build.py` chạy được; workflow đăng web xanh.
- Thử công cụ bằng ảnh tự dựng (nền xanh, thừa 1 cột, có bảng phụ; và ảnh vệt chém nền hồng không kẻ lưới): tách đúng, trang vừa màn hình điện thoại (không cuộn ngang).
- Đưa tệp mẫu vào game, mở game thử: vệt chém và vụ nổ bằng ảnh hiện đúng chỗ, không lỗi. Đã xoá tệp mẫu trước khi đẩy.

## Hạn chế / việc còn lại

- Chưa có ảnh thật nào từ ChatGPT, nên chưa thử với ảnh thật; có thể phải chỉnh nhẹ khi thử.
- Vệt chém bằng ảnh không uốn theo đúng đường vung của vũ khí như vệt code (chỉ xoay theo hướng nhắm), và thay cho vệt chém của đòn thường; chiêu đặc biệt vẫn vẽ bằng code.
- Hiệu ứng theo chiều ngang được đặt theo từng khung (giữa, hoặc bám mép trái với vệt vũ khí); chuyển động lên xuống giữa các khung được giữ.
- Chưa làm ảnh cho: đạn quái khác (gai, bùa, cầu lửa quái), trùm chết, vệt lửa/mây độc trên sàn, hiệu ứng trạng thái (cháy, độc, băng). Có thể thêm cùng cách.
- Cỡ trong game chỉnh được bằng ô "Cỡ trong game (hệ số)" trong phần "Sửa thông số".
