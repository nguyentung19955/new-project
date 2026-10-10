# Giai đoạn 1 (yêu cầu 2) — điểm yếu hình ảnh nhìn thấy (10/10/2026, 14:05)

Yêu cầu gốc: `docs/vfx/YEU-CAU-2.md`. Yêu cầu 1 và những gì ĐÃ LÀM sáng nay: `docs/vfx/YEU-CAU.md`, `docs/vfx/AUDIT.md` (mục "Đã làm" — vệt vũ khí, nhịp đòn, nhún co giãn, phản ứng quái, độc/đạn/vòng phép, báo trước, môi trường động, thanh máu tụt dần, nút nảy). KHÔNG làm lại những thứ đó; chỉ nâng tiếp.
Ảnh hiện trạng: `docs/vfx/hien-trang/` (dang-nhap.png, lang.png, dau-truong.png — 960×540).

## Đấu trường (dau-truong.png)
- Mặt đất một mảng nâu phẳng, rắc nhiều chấm sáng/đốm ngẫu nhiên gây rối mắt; thiếu lớp (đất nền – lối mòn – mảng cỏ – viền tối sát tường).
- Hàng rào/tường lặp đều, không có bóng đổ xuống sàn; góc phòng tối nặng (vignette), phần sàn giữa và mép không phân lớp.
- Em bé và quái nhỏ, cùng tông với nền → khó nhận trên điện thoại; thiếu viền/vành sáng (rim) và độ sáng tách khỏi nền.
- Không có tiền cảnh (cành lá/bụi mép dưới, mờ, che rất ít) và hậu cảnh tách lớp.

## Đăng nhập (dang-nhap.png)
- Chữ LINH KHÍ đè lên vòng trống đồng phía sau, dòng phụ đè lên nhà cửa → khó đọc.
- Hình em bé lửa khổng lồ, pixel to vỡ, chồng lên nút → không cân, nhìn rối.
- Phân cấp yếu: Chạm để bắt đầu, Đăng nhập Google, Bảng vàng, dòng phụ cùng cỡ/độ nổi; "Bản thử · hình vẽ tạm" lạc lõng.
- Nền làng sáng/rối sau chữ; thiếu lớp tối phía sau khối chữ và nút.

## HUD (dau-truong.png, lang.png)
- Thanh máu/năng lượng góc trái nhỏ, chữ nhỏ; nhiều khung chữ nhật rời (thẻ vũ khí, ô hệ, bản đồ) mỗi cái một kiểu viền.
- Dải chữ hướng dẫn trên cùng đè lên khu chơi.
- Nút điều khiển lớn (tốt) nhưng cần kiểm tra vùng an toàn tai thỏ / thanh điều hướng khi chơi ngang.

## Chia việc (3 phiên)
- **dt-dau-truong** (Giai đoạn 2): sàn, tường, rào, cây, bóng đổ, ánh sáng, sương nhẹ, tiền cảnh/hậu cảnh, tương phản nhân vật/quái với nền; hệ màu (mục 7) ghi vào `docs/vfx/BANG-MAU.md`.
- **dt-nhan-vat** (Giai đoạn 3 phần còn lại): silhouette/viền cho sprite nhỏ, animation quái (idle, đi, chết), trọng lượng đòn mạnh, bụi bước chân, các điểm "Còn để ý" trong AUDIT.md (độc/cháy làm quái chớp trắng, thanh máu đầu quái chạm hình), phân biệt vùng sắp nguy hiểm và vùng đang gây sát thương.
- **dt-hud-dang-nhap** (Giai đoạn 4): HUD, khung kỹ năng, thanh trùm, bảng nhân vật/trang bị, chữ, màn đăng nhập, vùng an toàn trên điện thoại.
Mỗi phiên tự làm Giai đoạn 5 cho phần của mình.

## Đã làm — đấu trường (phiên dt-dau-truong, 10/10/2026)
- **Tệp đổi**: `game/js/room_art.js` (toàn bộ phần hình), `docs/vfx/BANG-MAU.md` (mới, hệ màu mục 7), bài chụp mới `game/tests/dau_truong_shots.py`, `game/tests/dau_truong_nen.py`, ảnh `docs/vfx/anh-dau-truong/`. Không đụng va chạm, vị trí vật cản, luật chơi, mapgen, sprite.
- **Sàn nhiều lớp**: Rừng già = đất nền chia mảng lớn – lối mòn đất nện nối các cửa – mảng rêu dày dần về tường; khóm cỏ, lá rụng, đá nhỏ ít và theo cụm. Hang biển = phiến đá lớn không đều (khe nứt, gờ sáng mép trên, mép dưới tối), đá ướt loang mảng lớn, vũng nước ít mà to. Lâu đài = viên đá có khối, bớt vết nứt. Bỏ chấm sáng/đốm/cỏ rắc đều và chấm sáng tĩnh trên tường rừng; gai rào thưa và trầm hơn; bãi hoa, lá, sò, mảnh tinh thể của các biến thể sàn gom thành cụm và bớt số.
- **Ánh sáng (vẽ một lần vào nền đã nhớ)**: giữa phòng sáng nhẹ theo màu đèn vùng, rìa trầm vừa (không vignette nặng), bóng tường đổ xuống sàn (sau 13, trái 8, phải 4 điểm ảnh), bóng cột/tượng/gốc cây hình bình hành, quầng đuốc/nến/tinh thể/nấm/cột nắng tô xuống sàn. Mọi chuyển sáng tối là lưới chấm Bayer chỉ ở dải hẹp — không blur, không gradient, không glow phủ. Sàn giảm độ đậm màu ×0,84–0,88 để em bé và quái nổi (không đổi sprite).
- **Hậu cảnh trầm**: tường sau/thân cây/vách hang tối dần lên trên và ngả màu khoảng tối; đuốc, nấm, tinh thể, cửa sổ vẽ sau nên vẫn là điểm sáng.
- **Điểm nhấn mỗi phòng** (một món ở một góc trên, hai kiểu mỗi vùng): cột nắng xuyên tán / gốc cổ thụ phủ rêu; tia sáng khe trần rọi vũng nước / mỏ neo cũ; cửa sổ kính màu rọi nắng có ô màu trên sàn / tượng hiệp sĩ vỡ có nến. Cố ý không dùng nấm sáng, tinh thể, lò lửa vì giống vật bấm được (nấm độc, tinh thể băng, lò lửa).
- **Ít đồ trang trí hơn**: 2 món mỗi phòng (trùm 3), không trùng loại, không ở góc điểm nhấn.
- **Tiền cảnh**: hai cụm tối ở hai góc dưới (dương xỉ / đá và măng đá / chân cột gãy và đá vụn), che rất ít; em bé, quái hoặc trùm đi vào sau thì mờ còn 35% trong ~0,25 giây, đi ra thì hiện lại.
- **Lớp động** (theo `G.VFX.moiTruong`, 0 = đứng yên tuyệt đối, đã đo 0 điểm ảnh đổi): sương mỏng trôi dọc rìa phòng Rừng già, hơi khói mỏng chân tường Lâu đài, hạt bụi lấp lánh trôi trong cột sáng. Giữ nguyên các chuyển động cũ (đom đóm, vũng nước gợn, giọt nhũ, đuốc chập chờn).
- **Hiệu năng**: tách "vỏ phòng" (không phụ thuộc cửa) khỏi cửa: dọn xong phòng mở cửa chỉ vẽ lại cửa 1,6 ms (bản cũ dựng lại cả phòng 6 ms). Dựng phòng mới 5–20 ms (bản cũ 2–9 ms), xảy ra lúc màn chuyển phòng đang che. Mỗi khung: `perf.py --so` trung bình 102% bản cũ, chậm nhất 106% (ngưỡng 120%).
- **Đã kiểm tra**: build; `rules.py` 82/82; `env_rooms.py` 108 phòng 0 lỗi; `ui_build.py` đạt (6/6, 163/163); `perf.py --so` như trên; thử tiền cảnh mờ/hiện; `G.VFX.moiTruong = 0`. Ảnh chụp bằng Playwright và đã tự xem: mỗi vùng phòng đánh nhau + phòng bắt đầu, rương, tinh anh + phòng trùm (Mộc Tinh, Ngư Tinh, Hồ Tinh), so với ảnh bản cũ (`so-sanh-*.png`), tấm 15 nền `nen-cac-phong.png`. Không lỗi JS. Chụp lại: `python3 tests/dau_truong_shots.py` và `python3 tests/dau_truong_nen.py` (trong thư mục game).
- **Chưa kiểm tra được**: máy điện thoại thật (chỉ đo trên Chromium máy chủ); `cay.py` không chạy (không đổi số cân bằng).
- **Còn tồn tại**: phòng trùm rộng nên tiền cảnh hai góc dưới nằm dưới cần điều khiển và nút đánh (gần như không thấy); `env_art.js` (nền kiểu cũ, không còn phòng nào dùng) chưa sửa; vùng sáng đỏ của cửa khoá và mũi tên cửa mở giữ như cũ; chưa đổi màu khoảng tối ngoài phòng (phần lớn nằm dưới HUD).
