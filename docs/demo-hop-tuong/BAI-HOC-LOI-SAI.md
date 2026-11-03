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
