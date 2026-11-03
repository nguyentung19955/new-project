# Sổ lỗi đã mắc — đọc trước khi làm hoạt ảnh / gameplay tướng

Mỗi lỗi: chuyện gì sai → vì sao → cách tránh (bắt buộc làm theo).

## Hoạt ảnh (ChatGPT vẽ → code cắt pixel)
1. **Cắt mất hình** (búa bị xén) — cắt ô đều nhau. → Cắt theo khối liền (connected components), không cắt ô cố định.
2. **Giật lùi / thân trôi** — không căn thân giữa các khung. → Căn bằng so khớp thân (template), chân cố định.
3. **Lật ngang tướng không đối xứng** (PATCHWORK hướng E lộ nửa đỏ thay vì xanh) — lật W thành E. → Tướng không đối xứng phải vẽ đủ 8 hướng; mỗi hướng ghi rõ thấy nửa nào.
4. **Đường kẻ dọc trong GIF** — để đường căn trong ảnh xem. → Không vẽ đường căn vào ảnh/GIF giao người dùng.
5. **Nền trắng mờ không trong suốt** (ChatGPT trả nền alpha 30–180). → Luôn đo alpha nền; lọc nền trước khi cắt.
6. **Lửa vẽ chung với nhân vật** → lửa bị cắt mất lõi trắng, đáy lửa bị phẳng, lửa che chân làm căn sai. → Hiệu ứng (lửa/tia/khói) vẽ RIÊNG, nhân vật vẽ không hiệu ứng.
7. **Điểm ảnh thừa ở viền** — quầng nền còn sót. → Cắt với SACH=vien (gọt viền + bỏ điểm lẻ), KHÔNG đổi màu/nét bên trong (người dùng thích bản gốc).
8. **Nhún / dịch ô** — ChatGPT vẽ khom người và mỗi khung to nhỏ lệch nhau. → Prompt ghi "body upright and completely still, same size every frame"; cắt với NORM=1; đo đỉnh/đáy từng khung phải bằng nhau trước khi gửi.
9. **Động tác sai với vũ khí** — súng phun lửa lại giật lùi. → Hỏi: vũ khí này thật sự chuyển động thế nào? Phun lửa/tia: đứng yên, tay kia đỡ súng; chỉ súng nổ/pháo mới giật.
10. **SAI TAY** (SCORCH hướng W và SE: súng sang tay trái) — prompt mô tả sai bên. → Quy tắc: mặt đối diện người xem (S) tay phải nhân vật ở BÊN TRÁI người xem. Bảng cho vũ khí tay phải:
    - S: bên trái người xem · N: bên phải người xem
    - E (quay phải): thấy nửa PHẢI, vũ khí phía GẦN · W (quay trái): thấy nửa TRÁI, vũ khí phía XA (khuất sau thân)
    - SE: bên trái người xem, phía trước · SW: bên trái người xem, phía sau
    - NE: bên phải người xem, phía gần · NW: bên phải người xem, phía xa
    Mỗi prompt hướng phải ghi rõ vũ khí ở bên nào của người xem; xem lại ảnh so với bảng trước khi gửi GIF.
11. **Duyệt hàng loạt rồi mới phát hiện sai** — làm tiếp 3–4 hướng trên một lỗi. → Hướng đầu tiên phải được người dùng duyệt kiểu dáng; mỗi hướng tự kiểm bảng tay + đo khung trước khi làm hướng sau.

## Gameplay / bố cục
12. **Co-op tự đoán bố cục** (làm hành lang ⊢ hai bàn riêng) — người dùng muốn y hệt Defense War "hai bên cùng 1 bàn". → Không đoán bố cục game tham chiếu; xin ảnh chụp thật trước khi giao phiên code.
13. **Tầm cận chiến tự đặt số** trước khi kiểm tra game gốc. → Tra wiki/nguồn trước (Warwolf, Vesta: cận chiến phải đứng sát đường).

## Công cụ
14. eval bị CSP chặn trên ChatGPT → lưu ảnh bằng fetch(img.src) rồi đưa vào IndexedDB.
15. Đếm số ảnh trên trang ChatGPT không tin được (trang ẩn bớt ảnh cũ) → so kích thước file với bản trước.
16. **Mất chi tiết thiết kế** (SCORCH: chỉ còn 1 bình nhiên liệu, mất ống dẫn, súng mất các vạch cam, góc nhìn ngang thay vì top-down cao) — prompt "no glow" làm ChatGPT bỏ luôn vạch sơn cam; chỉ dặn "same design" chung chung. → Trước khi vẽ: lập DANH SÁCH CHI TIẾT từ model sheet (góc nhìn, bình, ống, vạch màu, kính, tóc, khuyên tai, logo…) và ghi đủ trong prompt; sau khi cắt: đặt cạnh model sheet so từng chi tiết trước khi gửi.
17. **Rung rung (bản không pixel)** — ChatGPT vẽ lại từng khung nên tóc/mặt lệch nét nhỏ mỗi khung → nhấp nháy. → Sau khi cắt chạy `tools/demo-khoa-than-dung-yen.py`: vùng gần như giống khung 1 lấy đúng khung 1 (khoá thân đứng yên), chỉ vùng thay đổi lớn (tay/súng) lấy của từng khung. Đo: sai khác vùng đầu giảm từ ~5–10 xuống ~0–1.
18. **Mất tay giữa chừng + quay về góc ngang** (SCORCH E bản đủ chi tiết: tay cầm súng biến mất ở vài khung, chỉ còn 1 bình, camera ngang) — chỉ mô tả bằng chữ, ChatGPT tự vẽ lại tư thế mỗi lần. → Mỗi hướng phải lấy ĐÚNG tư thế của model sheet làm khung gốc (hướng thiếu thì lật hướng đối xứng của model sheet), ghi "cánh tay cầm vũ khí vẽ đủ ở cả 12 khung"; kiểm từng khung có đủ 2 tay trước khi cắt.
19. **Góc camera lệch giữa các hướng** (SCORCH E vẽ lại: đủ tay, đủ bình nhưng camera thấp kiểu 3/4 ngang, trong khi S và model sheet là top-down cao — đầu to nhìn từ trên, thân bị rút ngắn). → Sau khi cắt, đặt khung 1 hướng mới CẠNH khung 1 hướng đã duyệt (S) và cạnh model sheet: góc camera, độ to đầu, độ rút ngắn thân phải giống nhau; lệch là vẽ lại, không gửi.

## Quy tắc gửi (người dùng yêu cầu 03/11)
20. **Chỉ gửi người dùng khi đã đạt HẾT sổ.** Mỗi lần ChatGPT vẽ xong: tự kiểm đủ TIEU-CHI-NGHIEM-THU-HOAT-ANH.md (1–9) + từng mục lỗi trong sổ này (bảng tay, danh sách chi tiết, đủ tay 12 khung, camera giống hướng đã duyệt, đo đỉnh/đáy, không rung). Còn một mục chưa đạt → tự sửa/vẽ lại, KHÔNG gửi bản dở để hỏi. Chỉ gửi GIF khi mọi mục đạt, kèm dòng "đã kiểm: …".
21. **Tự bào chữa để cho qua** (SCORCH N: tay trái biến mất ở các khung giữa, GIF nhìn như tay chớp tắt; thiếu dây kính sau đầu; ống dẫn gần như không thấy — mình lại kết luận "bị che tự nhiên" rồi gửi). → Mục nào trong sổ không đạt thì là KHÔNG ĐẠT, không được tự tìm lý do cho qua. Nhìn GIF như người chơi: thấy bộ phận chớp tắt/biến mất là lỗi. Hướng lưng (N/NE/NW): tay tự do phải đặt ở chỗ người xem THẤY được (vòng ra cạnh thân đỡ súng), ghi rõ trong prompt.
