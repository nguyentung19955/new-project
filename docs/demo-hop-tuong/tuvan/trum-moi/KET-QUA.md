# Trùm mới — vật thể không tay chân (07/11)

Người dùng chốt 08:20: trùm (và cả quái nhỏ, quái tinh anh) là vật thể không có tay chân, di chuyển bằng cách nảy, lăn, trượt hoặc bay.
24 sprite sheet ChatGPT (12 trùm × đi + chiêu, lưới 4×2 = 8 khung): `docs/demo-hop-tuong/thap-art/raw_trum2_<id>_{di,chieu}.png`. Prompt: `PROMPT.md`.

GIF (nền xám, 180 px, 110 ms/khung; chiêu giữ khung cuối 450 ms): `gif/<id>_di.gif`, `gif/<id>_chieu.gif`, tổng hợp `gif/TONG-DI.gif`, `gif/TONG-CHIEU.gif`.
Độ rung (`gif/do-rung.json`, đơn vị % cỡ khung): lệch ngang ≤ 1,1% ở cả 24 sheet, nên không có sheet nào trượt ngang. Độ chênh chiều cao là nảy / co giãn có chủ đích (Mad Crown 13%, Twin Core 15%).

| Trùm | Ý tưởng | Đi | Chiêu |
|---|---|---|---|
| Mad Crown | slime hồng đội vương miện | nảy co giãn rõ ✓ | xúc xắc + xoáy hồng ✓ |
| Freezer | khối băng có mắt | nhảy trượt ✓ | nổ băng mạnh ✓✓ |
| Janus Cube | hộp đá nhiều mặt | lật mặt ✓ | tia đá xám ✓ |
| Joker King | hộp hề vương miện | nhảy, nắp rung ✓ | bật rương mimic ✓✓ |
| Nightmare | cầu đen mắt đỏ có sừng | bay lắc nhẹ (ít động) | tia ngắm đỏ ✓ |
| Octopus Eyes | hoa hồng lửa trong chậu | lắc nhẹ (ít động) | phun cầu lửa ✓ |
| Hive Mother | cầu tổ ong | lăn ✓ | bung drone ✓ |
| Static Jammer | bánh xe gai ăng-ten | lăn nhẹ | vòng nhiễu tím ✓ |
| Prism Warden | lăng kính bay | xoay ✓ | khiên lăng kính ✓✓ |
| Twin Core | 2 cầu đỏ nối vòng | nảy so le ✓ | tách đôi ✓ |
| Patch Titan | bánh răng xanh + cờ lê | lăn ✓ | tia sửa xanh ✓✓ |
| Star Leech | sên vàng | trườn ✓ | ngoạm sao ✓ |

Chưa gắn vào game (chờ người dùng duyệt). Khi gắn: cắt 8 khung → `trum_<id>_8.png` (đi) + `trum_<id>_atk_16.png`/sheet chiêu, cập nhật TRUM_ANH/TRUM_ATK trong `thap/js/trum.js`; hướng nghiêng/lưng có thể dùng chính sheet đi (vật thể đối xứng) hoặc gen thêm.
