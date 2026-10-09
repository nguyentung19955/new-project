# Làm mượt vùng báo trước đòn: báo cáo

Chủ dự án hỏi: "các hiệu ứng báo trước như ô hình chữ nhật hay hình quạt có thể làm mượt hơn không". Đợt này làm mượt **mọi** vùng báo trước của quái thường, tinh anh, trùm nhỏ và trùm vùng.

## Đã làm gì

1. **Vẽ ở lớp nét cao.** Trước đây vùng đỏ vẽ ở lớp điểm ảnh 480x270 rồi phóng to, nên mép quạt, mép tròn, mép đường xiên thành bậc thang. Giờ vùng vẽ ở lớp giao diện (độ phân giải thật của màn hình), mép mịn ở mọi cỡ máy. Tệp mới `game/js/bao_truoc.js`; khoá ngang không bị ảnh hưởng (chỉ dùng toạ độ game như các phần giao diện khác).
2. **Vẫn nằm dưới chân nhân vật.** Lớp giao diện nằm trên lớp game, nên chỗ em bé, quái, trùm, đạn, hạt đứng chồng lên vùng được xoá đúng từng điểm ảnh: so ảnh nền chụp ngay trước khi vẽ nhân vật với ảnh đã vẽ xong, chỗ nào khác đi là có thứ đứng trên sàn. Chỉ làm ở phần giao giữa vùng và thân nhân vật. Máy nào không có bộ lọc ảnh cần cho việc này thì tự xoá mềm một hình bầu dục quanh thân (gần đúng).
3. **Kiểu mới:** góc bo tròn nhẹ (chữ nhật, đường thẳng, mép quạt); viền sáng mảnh; lòng đỏ trong suốt; mép mềm (một vệt đỏ mờ rộng bên dưới viền).
4. **Hiện ra mượt:** vùng mờ dần vào và nở từ 85% lên đủ cỡ trong 0,15 giây.
5. **Thanh đếm ngược ngay trong vùng:** phần đỏ đậm lấp dần từ gốc ra và đầy đúng lúc đòn ra: quạt lấp theo bán kính, chữ nhật và đường thẳng lấp theo chiều đòn, tròn lấp từ tâm, vành lấp từ trong ra, tường nước lấp theo chiều chạy. Gần lúc nổ thì viền đập nhanh hơn (đổi độ sáng mượt, không chớp tắt giật cục).
6. **Lúc đòn ra:** chớp sáng một nhịp rồi tan trong 0,22 giây (hiệu ứng nổ, rung màn hình của luật cũ giữ nguyên).
7. **Màu theo hệ:** pha nhẹ xanh (băng), lục (độc), cam (lửa) nhưng vẫn đọc ra là đỏ nguy hiểm.
8. **Đủ mọi loại vùng:** quạt, chữ nhật, đường thẳng (lao húc, đớp), hình tròn, vành có khe (Mộc Tinh, Cua Đá), đường ngắm của quái bắn xa, vòng bom đếm ngược (quả bom vẫn là hình điểm ảnh), vòng báo chỗ quái sắp mọc, vòng dựng gai của quái gai, tường nước lúc chờ của Ngư Tinh (khe an toàn là lối xanh nhạt, hai mép trắng).

**Không đổi:** thời gian báo trước, kích thước vùng va chạm, sát thương, cân bằng, dữ liệu lưu, luật lõi, khoá ngang, giao diện trống đồng, làng, cổng. Mã mới chỉ vẽ; lúc chạy không vẽ (bot, mô phỏng) thì không chạy gì cả.

## Ảnh

- `truoc-sau.png`: 11 cảnh, trái là trước, phải là sau, cùng khung hình (cùng hạt giống, cùng số khung): quạt, chữ nhật, tròn, hàng đạn và đường ngắm, vòng bom, vòng mọc quái, quái gai, trùm nhỏ Hổ Lửa (quạt rộng), Mộc Tinh (rừng gai), Ngư Tinh (sóng thần), Hồ Tinh (vòng lửa ma). Ảnh phóng to quanh vùng báo để thấy rõ mép.
- `muot.gif` (1,8 MB): trước | sau chạy cạnh nhau, ba đòn từ lúc hiện vùng tới lúc nổ.
- `truoc.png`: ảnh trước khi sửa (đẩy lên sớm để giữ mốc so sánh).

Đã xem bằng mắt: mép mịn, em bé và quái đứng trên vùng không bị nhuộm đỏ, sàn quanh chân vẫn đỏ rõ.

Dựng lại: `python3 game/tests/bao_truoc_shots.py chup <thư mục game> <thư mục ra>` rồi `ghep`, `gif` (xem đầu tệp).

## Kiểm tra

- **Bài mới `tests/bao_truoc.py`** 21/21: đủ năm hình và tường nước đều vẽ ở lớp giao diện, không vẽ gì lên lớp điểm ảnh; thân em bé không bị phủ đỏ còn sàn quanh chân vẫn đỏ; vừa hiện ra thì mờ hơn; gần nổ đậm hơn; thời gian báo trước giữ nguyên và vẫn nổ đúng 0,5 giây; có chớp lúc nổ và tan sau khoảng 0,2 giây; không lỗi vẽ.
- **Bài có sẵn đều qua:** `rules.py` 82/82, `moves.py` 92/92, `doors.py`, `mapgen.py`, `fuzz.py` (0 lỗi), `dps.py`, `ui_build.py` (cả hai bản dist), `anim_smoke.py`, `cong.py` 66/66, `cung.py` 16/16, `env_rooms.py` (108 phòng, 0 lỗi), `fx_check.py`, `ghep.py` 109/109, `ghep2.py` 196/196, `quai.py` 105/105, `ui_robust.py`, `ui_input.py all` (4 cỡ màn hình), `smoke.py`, `shots.py`, `balance.py`, `campaign.py` (0 lần thua).
- **Sửa một bài cho khớp** (không bỏ mục nào): `ghep2.py` mục H đo độ dẹt của vòng tròn và vành khăn bằng cách so điểm ảnh; vùng giờ ở lớp giao diện nên bài ghép cả hai lớp rồi mới so.
- **Cân bằng:** bot chạy không vẽ nên mã mới không chạy trong lúc đo. `balance.py` (mỗi ải 3 lần, có yếu tố ngẫu nhiên): bản cũ thắng 44/45, bản mới 43/45 (khác một lượt ở ải 3-5, trong mức dao động); mất trung bình 74% máu mỗi ải ở cả hai bản.
- **Hiệu năng** (`perf.py --so`, 14 quái đủ tám vai, đo cả bản cũ cùng cảnh): bản cũ 1,99 ms mỗi khung, bản mới 2,62 ms (132%). Khung hình cho phép là 16,7 ms nên vẫn rất mượt. Phần lớn chênh lệch là bước giữ vùng nằm dưới nhân vật (đọc lại lớp game giữa khung hình); trên máy thử không có card đồ hoạ thật bước này bị tính nặng hơn thực tế. Nếu cần nhẹ hơn nữa: đặt `G.baoTruoc.mask = 0` thì chỉ còn khoảng 110-115% (vùng khi đó phủ mờ lên nhân vật thay vì nằm dưới).
- Đóng gói `python3 game/build.py`, mở `dist/linh-khi.html`: không lỗi trang, bộ lọc chạy được.

## Tệp đã đổi

`game/js/bao_truoc.js` (mới), `game/index.html` (nạp tệp mới), `game/js/combat.js` (hai dòng gọi vẽ), `game/js/mobs.js` (vòng gai, đường ngắm, quả bom), `game/js/room_art.js` (vòng mọc quái), `game/tests/bao_truoc.py`, `game/tests/bao_truoc_shots.py` (mới), `game/tests/ghep2_fgh.js`, `game/README.md`, `game/dist/`.
