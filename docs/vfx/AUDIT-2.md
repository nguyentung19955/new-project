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

## Đã làm — HUD và đăng nhập (phiên dt-hud-dang-nhap, 10/10/2026)
**File đổi:** `game/js/stage.js` (HUD trong ải), `game/js/ui_theme.js` (T.plate, T.bossBar mới), `game/js/village.js` (màn đăng nhập), `game/js/bang_vang.js`, `game/js/hanh_trang.js`, `game/js/engine.js` + `game/index.html` (vùng an toàn), `docs/vfx/BANG-MAU.md` (mục 5: màu HUD), `game/tests/hud_shots.py` (mới, chụp ảnh).
- **Thanh máu / năng lượng:** máu cao 11, chữ số 7,5 đậm; năng lượng cao 8 có số (biết đủ mana cho chiêu chưa). Phần tụt dần (sáng nay) giữ nguyên.
- **Thanh trùm phân cấp (`T.bossBar`):** trùm vùng — khung gỗ viền vàng, tên chữ to có hoa văn hai bên, thanh cao 11, phần trăm, vạch pha 30%/60%; trùm nhỏ — khung vừa; phòng tinh anh — khung nhỏ ghi "Tinh anh · tên loài" và dấu hiệu (Nhanh, Bọc giáp…), rộng theo chữ. Lớp thích nghi và điểm yếu thành một hàng thẻ nhỏ căn giữa dưới khung; "LỘ ĐIỂM YẾU!" nhấp nháy dưới hàng thẻ. Dòng báo xếp dưới khối này.
- **Một kiểu khung HUD (`T.plate`):** viền mảnh 1 điểm (đồng, mép trên sáng hơn), lòng gỗ sẫm hơi trong, đinh vàng nhạt bốn góc. Bản đồ nhỏ, vạch linh khí, lời chỉ dẫn, tên biểu tượng tài nguyên, nút Hành trang ở làng đều dùng chung nên tự đổi theo.
- **Ô vũ khí:** chữ bậc và độ mài ("Thường" / "+2") nằm phần phải của ô, không còn đè hình vũ khí.
- **Dải hướng dẫn:** mẹo cách đánh của vũ khí và mẹo nút Chưởng (`W.banner.tip`) xuống lề trái dưới lời chỉ dẫn (cùng kiểu khung), không còn đè tường, cửa phía trên; tự mờ khi sắp hết. Dòng báo thường (trùm nổi giận, rơi đồ…) vẫn ở trên tường.
- **Nút cảm ứng:** bình máu và nút dừng cao 24, vùng chạm cao 33 (khoảng 44 điểm trên điện thoại ngang); nút tròn giữ cỡ cũ (nút nhỏ bán kính 18–19, vùng chạm +6). Phản hồi nhấn / hồi chiêu / sẵn sàng dùng lại của `btn_art.js`.
- **Phòng trùm rộng:** chữ "Sức mạnh / khuyên" xuống hai dòng để không tràn vào sàn.
- **Màn đăng nhập:** trống đồng nhỏ làm biểu tượng phía trên (không còn nằm sau chữ), chữ LINH KHÍ có viền + bóng + dải ánh kim mảnh, dòng phụ "S P I R I T B L A D E" giãn chữ có hai gạch đồng; lớp tối hình elip sau khối chữ và nút (cảnh hai bên vẫn thấy); em bé cầm kiếm lửa phóng đúng 2 lần (điểm ảnh vuông, trước là 3 lần vỡ hạt) đứng góc trái dưới, không chạm nút. Phân cấp: nút chính (Đăng nhập Google để vào / Vào game ▶, 200×32) > nút phụ (Đăng nhập Google, Bảng vàng) > dòng thông tin > "Bản thử · phiên bản" nhỏ mờ ở góc. Chữ G bốn màu vẽ điểm ảnh trên nút Google; bấm thì nút lún/nảy rồi đổi thành "Đang mở Google…". Mây hỏng: nút ghi "Chưa kết nối được mây", nút Chơi tạm hiện như cũ. "Chạm để bắt đầu" sáng tối nhẹ thay vì chớp tắt. Chuyển động: cảnh làng sống của village_scene (đèn lồng, khói lò rèn, đom đóm, nước). Bảng vàng mở trên màn chào thì ẩn chữ tiêu đề, khung thấp xuống sát nội dung.
  Giữ nguyên: `G.syncTaps` (ô chạm lấy đúng ô nút đang vẽ, bảng toạ độ `G.titleLayout`), `titleLogin`, luồng không có mây (chạm chỗ trống để vào, chạm hàng nút phụ thì không), nút Chơi tạm sau 10 giây, Enter/Space vào game. Không sửa cloud.js, cloud_ui.js.
- **Bảng vàng:** hàng tiêu đề cột có dải tối và gạch đồng, hạng 1–3 có huy chương vàng/bạc/đồng điểm ảnh; không có mạng thì kỷ lục trên máy hiện thành ba ô số (Sức mạnh, Tổng sao, Xa nhất) và một hàng thời gian hạ trùm.
- **Hành trang:** trong ải, hoa văn tiêu đề dừng trước dòng nhắc "chỉ xem" (trước đây chữ đè hoa văn). Bố cục các thẻ đã gọn sẵn, giữ nguyên.
- **Điện thoại:** lề khung game = max(16px, vùng an toàn `env(safe-area-inset-*)`); cầm dọc (khung xoay 90 độ) thì `engine.js` đổi thứ tự cạnh (tai thỏ ở mép trên màn hình = mép trái khung, thanh điều hướng = mép phải). Máy tính vẫn lề 16px như cũ. Khung game vẫn giữ đúng tỉ lệ 16:9, hình điểm ảnh vẽ `pixelated`.
- **Đã kiểm tra:** build; `rules.py` 82/82; `ui_build.py`, `ui_input.py` (phone, p169, desk, port), `ui_robust.py`, `hanh_trang.py` 41/41 ×2, `ghep2.py` 192/192 đạt; `may.py` 99 mục đạt + 2 lỗi "404 khi tải script" có sẵn từ trước (đã chạy trên bản gốc, cũng 2 lỗi như vậy). Ảnh tự xem bằng Playwright ở 960×540, điện thoại ngang 844×390 (thêm một lượt giả vùng an toàn 44/34/21 px), điện thoại dọc 390×844: `docs/vfx/anh-hud/` (màn đăng nhập không mây / cần Google / lỗi mây / đã vào, ải thường, ải hướng dẫn, phòng tinh anh, phòng trùm, hành trang trong ải và ba thẻ ở làng, bảng vàng không mạng / có mạng giả). Chụp lại: `cd game && python3 tests/hud_shots.py`. Không lỗi JS.
- **Chưa kiểm tra được:** đăng nhập Google thật trên iPhone (cửa sổ bật lên qua `G.syncTaps` — cơ chế không đổi, chỉ đổi toạ độ nút), bảng vàng với mạng thật, tai thỏ thật trên iPhone/Android (chỉ giả bằng biến CSS).
- **Còn tồn tại:** bảng menu (Hành trang, bảng làng) vẫn lòng lam ngọc trống đồng, còn khung HUD trong ải là gỗ sẫm — cố ý (menu khác HUD) nhưng nếu muốn đồng bộ hết sang gỗ thì đổi `C.bg/C.bg2` trong `ui_theme.js`. Dải tài nguyên và dải khuôn mặt ở làng nằm trong `village_scene.js` (phiên khác) nên chưa đổi. Chữ nhỏ nhất của game vẫn 6,5 đơn vị (khoảng 9 điểm trên điện thoại ngang).
