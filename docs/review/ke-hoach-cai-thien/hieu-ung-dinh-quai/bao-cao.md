# Hiệu ứng có dính vào quái không — báo cáo

Câu hỏi của chủ game: *"Các hiệu ứng phát ra có dính vào quái không, check toàn bộ nhé."*

## PHẦN A — ĐO (chỉ đọc + bot không màn hình, không sửa game)

### Đo thế nào

- Bot mở bản game `game/dist/linh-khi.html` (không chơi thử bằng tay), tải đủ ảnh 4 vùng rồi dựng **từng cảnh riêng**: một con quái trong phòng trống, nền trong suốt, không có Cu Tí / cửa / đồ vật.
- Mỗi cảnh chụp 2–3 lần vào canvas: **chỉ thân quái** (lấy hộp bao và từng điểm ảnh thật của thân), **chỉ hiệu ứng** (thân không vẽ), và **cả hai** (để xem hiệu ứng nằm trước hay sau thân). Rồi so toạ độ.
- **48 con**: 8 quái thường + 2 tinh anh + trùm nhỏ + trùm vùng của cả 4 vùng (Rừng già, Hang biển, Lâu đài cổ, Sông sâu). Trùm đo cả pha 1–3 cho đòn của trùm.
- Đòn của Cu Tí đánh thật (bot bấm nút): kiếm 3 nhát, thương đâm/quét, búa nện, phi tiêu bay, 4 chiêu Đặc biệt (Trảm Nguyệt, Phi Thương, Địa Chấn, Mưa phi tiêu), 3 cây chưởng, phúc lành (Gươm, Rìu, Than hồng, Gậy tre) và vũ khí có hệ Lửa / Độc / Băng. Mỗi đòn đánh từ **bên trái và bên phải** (quái lật hình), và đánh lại khi quái **đứng sát mép phòng**.
- Trạng thái đặt thẳng lên quái: cháy, độc, băng (làm chậm), đóng băng, choáng, trói chân (dây leo), chậm (Thuỷ triều), lộ điểm yếu (trùm). Mỗi trạng thái thử thêm: quái **bị hất tung** (Địa Chấn nhấc thân 10 điểm), quái **đi** 20 điểm, **hết trạng thái**, **quái chết**.
- Đòn của quái: cho quái đánh Cu Tí (Cu Tí bất tử), ghi chỗ đạn sinh ra, vệt cào / bụi lao, vật ném (bom, bào tử, bầu nước…).
- Đo ở **NET 2** (mặc định) đầy đủ, và **NET 3 / NET 4** (`?netcao=3|4`) bản gọn (một mặt, trạng thái + kiếm + phi tiêu).

Luật chấm một ca (một hiệu ứng × một con × một biến thể):

| Hiệu ứng | "Dính" khi |
|---|---|
| Hình trúng (chớp, tia, nổ) | tâm hình chạm điểm ảnh thân (≤ 3 điểm) và **không nằm ở 1/5 dưới cùng thân** (chân) |
| Số sát thương | đáy chữ cách đỉnh đầu từ −2 đến 12 điểm (không lơ lửng, không đè lên thân) |
| Cháy / độc / băng / đóng băng | ≥ 70 % hình nằm trên thân, cỡ hình từ 45 % đến 160 % thân, đi theo khi quái đi / bị hất, tắt khi hết |
| Sao choáng | ở ngay trên đầu (0–14 điểm), không nhỏ hơn 18 % bề ngang thân |
| Dây leo / vòng chậm | ở chân, không nhỏ hơn 35 % bề ngang thân |
| Biểu tượng trên đầu trùm | đáy biểu tượng cách đỉnh đầu 0–12 điểm |
| Đòn quái | đạn / vật ném sinh ra từ điểm ảnh thân (≤ 3 điểm); bụi lao toả sau lưng sát thân |

### Kết quả tổng (NET 2)

**6 326 ca đo → 4 069 dính, 2 257 lệch.** (112 ca "không có hình riêng" không tính.) Bảng đầy đủ hiệu ứng × quái: [bang-truoc.md](bang-truoc.md). NET 3: [bang-truoc-net3.md](bang-truoc-net3.md) (867 ca, 426 dính), NET 4: [bang-truoc-net4.md](bang-truoc-net4.md) (870 ca, 424 dính) — **cùng các lỗi như NET 2**, NET cao không thêm lỗi mới.

| Nhóm | Ca | Dính | Lệch | Lỗi chính |
|---|---:|---:|---:|---|
| Hình trúng (4 vũ khí, 4 chiêu, chưởng, phúc lành/hệ, sát mép) | 2 421 | 1 841 | 580 | ở chân trùm; Hỏa chưởng nổ sát đất trước mặt quái; vòng Độc chưởng lệch |
| Số sát thương (kể cả sát mép) | 2 955 | 1 974 | 981 | lơ lửng trên quái bay; đè giữa thân trùm |
| Trạng thái trên thân | 634 | 31 | 603 | **không theo khi bị hất tung** (480); quá nhỏ trên trùm |
| Biểu tượng trên đầu trùm | 64 | 4 | 60 | đè lên đầu trùm |
| Hình một lần khi vừa dính | 100 | 74 | 26 | nhỏ so với quái to |
| Tắt khi quái chết | 48 | 48 | 0 | — |
| Đòn quái (đạn, vật ném, bụi lao) | 104 | 97 | 7 | Trai Sông Gai ném ngọc từ mép vỏ (3 điểm), 1 viên lửa Hồ Tinh |

### Những chỗ lệch thấy rõ

1. **Bị hất tung (Địa Chấn): hình trạng thái ở lại dưới đất.** Thân quái nhấc lên 10 điểm nhưng lửa, bọt độc, băng, sao choáng, dây leo vẫn ở chỗ cũ — cả 40 quái thường / tinh anh, cả hai mặt. Ảnh: `anh/truoc/7-bi-hat-tung.png`, GIF `anh/truoc/gif-1-chay-bi-hat.gif`.
2. **Hình trúng ở chân trùm.** Chớp trúng luôn đặt ở 16 điểm trên chân (dù quái cao 35 hay 135 điểm). Quái thường thì đúng giữa thân; trùm vùng (Mộc Tinh, Ngư Tinh, Hồ Tinh, Thuồng Luồng) và trùm nhỏ (Nấm Chúa, Cá Trê) thì chớp nằm ở rễ / xúc tu dưới cùng — mọi vũ khí, mọi chiêu. Ảnh: `1-hinh-trung-kiem.png`, `3-trum-phi-tieu-phi-thuong.png`, GIF `gif-4-kiem-trum.gif`.
3. **Số sát thương** đặt theo chiều cao hình vẽ cũ, không theo ảnh thật:
   - quái bay / ảnh thấp hơn hình cũ: số **lơ lửng** — Ong Vò Vẽ 28 điểm trên đầu, Cá Chuồn 18–22, Đèn Lồng 16, Bầy Đỉa 16–18, Ếch Phình, Cá Nóc 14–16;
   - trùm: số bị chặn ở 60 điểm nên **đè giữa thân** — Mộc Tinh 64 điểm dưới đỉnh đầu, Hồ Tinh 53, Ngư Tinh / Thuồng Luồng 46, Nấm Chúa 33. Ảnh `4-so-sat-thuong.png`.
4. **Hỏa chưởng / Độc chưởng**: quả nổ đặt ở chỗ viên chưởng chạm đất, trước mặt quái và sát chân (92/92 ca Hỏa chưởng). Vòng độc của Độc chưởng lệch lên trên / ra ngoài với quái bay. Ảnh `2-chuong-no.png`.
5. **Trạng thái trên trùm quá nhỏ**: lửa / bọt độc / băng chỉ to bằng thân quái thường (~25 điểm) trên thân trùm 90–110 điểm, nằm ở chân. Ảnh `5-trang-thai-tren-trum.png`, GIF `gif-3-chay-trum.gif`.
6. **Sao choáng**: trên quái bay thì lơ lửng (Ong Vò Vẽ 30 điểm trên đầu, Cá Chuồn, Đèn Lồng, Ếch Phình); trên tinh anh / trùm nhỏ sao nhỏ xíu. Ảnh `6-sao-choang.png`, GIF `gif-2-choang-ong.gif`.
7. **Biểu tượng trạng thái trên đầu trùm** đè lên đầu (Nấm Chúa 17 điểm, Mộc Tinh 10, Thuồng Luồng 8, Hồ Tinh 6) hoặc lơ lửng (Ngư Tinh 16).
8. Quái nhỏ: hình trạng thái **không** trùm lấp thân (đo cỡ đạt) — ảnh `8-quai-nho.png`.
9. Đúng sẵn: tắt khi quái chết (48/48), đi theo khi quái đi (mọi ca), hình đóng băng một lần (48/48), đạn quái sinh từ thân (59/60), quái đứng sát mép phòng không làm hình lệch thêm, mặt trái / phải như nhau.

Ảnh lưới (×3, khung xanh = thân, khung chấm = vùng đúng, dấu đỏ = tâm hình): `anh/truoc/1…8-*.png`; GIF: `anh/truoc/gif-*.gif`.

### Công cụ

`cong-cu/do_a.py` (đo, ghi `so-lieu/<nhãn>.json`), `cong-cu/dq_lib.js` (dựng cảnh, chụp lớp), `cong-cu/phan_tich.py` (chấm từng ca), `cong-cu/bang.py` (bảng), `cong-cu/anh_a.py` (ảnh lưới + GIF). Chạy từ gốc repo, ví dụ:
`python3 docs/review/ke-hoach-cai-thien/hieu-ung-dinh-quai/cong-cu/do_a.py truoc` rồi `python3 .../cong-cu/bang.py truoc`.

## PHẦN B — SỬA

(đang chờ hai phiên "Nét cao: quái…" và "Nét cao: hiệu ứng + giao diện" xong rồi mới sửa)
