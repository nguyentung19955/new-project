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

## Đã làm — nhân vật và hiệu ứng (phiên dt-nhan-vat, 10/10/2026)
Không đổi hitbox, sát thương, thời gian ra đòn, AI, cooldown, thiết kế hay cỡ hình. Mọi thứ mới chỉ đổi lúc vẽ và có nút tắt trong `G.VFX`.

**File đổi**: `game/js/monster_art.js`, `hero_tinhlinh.js`, `fx.js`, `fx_he.js`, `mobs.js`, `boss.js`, `vfx_cfg.js`; bài mới `game/tests/nhan_vat.py`, `game/tests/nhan_vat_shots.py`; ảnh `docs/vfx/anh-nhan-vat/`.

**Cải thiện**
- **Viền và vành sáng** (mục 3): cả 36 quái/trùm đã có viền tối 1 điểm ảnh đều (mọi khung đều tô viền lại sau khi xoay bộ phận — đã kiểm cả 36 con). Thêm vành sáng ở mép trên (ánh sáng từ trên, lật trái/phải vẫn đúng) và hai sườn nhẹ hơn; em bé sáng thêm ở mép phải (phía nguồn sáng, như bóng sẵn có) và mép trên. Làm lúc dựng khung (khung được nhớ) nên không tốn gì lúc vẽ. `G.VFX.vien` (0 = như cũ).
- **Animation quái** (mục 3): cử động lấy đà (`tele`) trải đúng theo thời gian lấy đà thật nên tư thế co người đạt đỉnh và rung/chớp đúng lúc sắp ra đòn (trước đây đòn ngắn bị cắt giữa chừng, đòn dài đứng im ở khung cuối). Đòn nặng (tinh anh, quái giáp): giữ khung vừa đánh ra thêm 0,08 giây rồi thu chậm. 6 quái chưa có cử động đứng riêng (Cá Chuồn, Cá Nóc, Sứa Bom, Nhím Biển, Cua Tướng, Cá Nóc Chúa) lắc lư nhẹ khi đứng. Quái nổ/vỡ khi chết: mảnh 2 điểm thay vì từng điểm ảnh, thưa dần, bay gần hơn — bớt đám bụi điểm ảnh phủ sân khi nhiều quái chết cùng lúc; chớp trắng lúc vỡ ngắn lại.
- **Bụi** (mục 3): bụi bước chân của quái theo quãng đường đi (quái to bụi to hơn, quái bay/lặn không có), bụi toé hai bên khi em bé lộn né xong chạm đất và khi quái ngã. `G.VFX.bui`.
- **"Còn để ý" trong AUDIT.md** (mục 4 yêu cầu phiên): nhịp sát thương độc/cháy (`src: 'dot'`) không còn chớp trắng cả người — nhuộm nhẹ màu hệ 0,22 giây (đòn thật trúng cùng lúc vẫn chớp trắng); quái và trùm chỉ chớp trắng hẳn khung đầu tiên của khựng hình, các khung khựng sau và 0,07 giây ngay sau đó nhạt còn 0,3 (`fx.chop`); thanh máu mảnh, biểu tượng trên đầu, số sát thương đặt theo chiều cao hình thật (`G.monsterArt.cao`: chiều cao hình + độ bay + 2 điểm thở) nên không chạm hình quái to/quái bay — chỉ đổi `e.h` (chỉ dùng để vẽ), vùng va chạm `e.r`, `e.hr` giữ nguyên, không phải sửa `stage.js`; vệt Trảm Nguyệt nhỏ hơn (0,62→0,85 thay vì 0,75→1) và bóng mờ nhạt hơn, vệt vũ khí của chiêu đặc biệt hẹp hơn và tắt nhanh hơn.
- **Vùng nguy hiểm** (mục 4): vùng BÁO TRƯỚC giữ nguyên (đỏ trong mờ, đầy dần, vẽ mịn ở `bao_truoc.js`). Vùng ĐANG GÂY SÁT THƯƠNG của địch (vũng lửa, vũng độc...) có viền nóng LIỀN NÉT đỏ cam + viền tối ngoài (đọc được trên nền sáng lẫn tối), ba pha rõ: xuất hiện (vòng sáng co về mép vũng), duy trì (mỗi nhịp gây sát thương 0,5 giây viền dày, sáng lên và một vòng mảnh toả ra — đúng nhịp `z.tick`), biến mất (viền thưa điểm ảnh, tối dần). Tường nước của Ngư Tinh và sóng tràn khi đang chạy có chấm đỏ cam chạy ở mép trước (khác vệt báo trước nhấp nháy). Màu theo `BANG-MAU.md` mục 4.
- **Kỹ năng và rung** (mục 5): rung màn hình đã có trần (±4/±3 + giật ≤4) và `G.VFX.rung` (đã kiểm); thêm: chớp cả màn hình (trùm chết, chưởng tích lực...) cũng theo `G.VFX.rung` (0 = tắt). Nhờ khựng hình không còn trắng cả người, các chiêu đánh trúng nhiều quái (Địa Chấn, Nổ lan) không còn biến cả đám thành khối trắng che sân.
- **Hạt** (mục 6): mọi hạt mới dùng chung kho 400 hạt (trần cũ), vũng tự tắt, không có hiệu ứng tồn tại vô hạn.

**Đã kiểm tra** (sau khi gộp `origin/khoi-tao-du-an`): build; `rules.py` 82/82; `nhan_vat.py` (mới) 21/21; `fx_check.py` 0 lỗi; `moves.py` 93/93; `anim_smoke.py` không lỗi; `vfx_ky_nang.py` 27/27; `bao_truoc.py` 21/21; `quai.py` 105/105; `ui_build.py` đạt; `perf.py --so`: trung bình 100% bản cũ, chậm nhất 114% (dưới 120%). Luật không đổi: cùng hạt giống, chạy có vẽ và không vẽ cho máu, vị trí quái giống hệt (tắt khựng hình); so thêm bằng tay bản trước và bản này cùng có vẽ: giống hệt. Ảnh tự xem (Playwright, đã mở từng ảnh): `docs/vfx/anh-nhan-vat/` — viền/vành sáng ba vùng, em bé + quái ba vùng, lấy đà, chết, nhịp độc/cháy, khựng hình, vùng nguy hiểm, tường nước, Trảm Nguyệt, thanh máu quái to, trùm ba vùng. Chụp lại: `python3 tests/nhan_vat_shots.py` (trong thư mục game); chụp bản cũ để so: thêm thư mục ra và thư mục game cũ. Không lỗi JS. Không chạy `tests/cay.py` (không đổi số cân bằng).

**Chưa kiểm tra được**: trên điện thoại thật (độ rõ của vành sáng ở màn nhỏ, độ dễ đọc của nhuộm màu nhịp độc); hình tự vẽ của chủ dự án (`sprite_custom.js`) không có vành sáng vì không đi qua bộ dựng khung bằng code.

**Còn tồn tại**: vành sáng cố ý nhẹ (giữ thiết kế) — nếu nền sân của phiên dt-dau-truong vẫn làm quái tối khó thấy thì tăng `G.VFX.vien` (tối đa 1,5) rồi gọi `G.monsterArt.xoaNho()`; khung đầu tiên khi đánh trúng vẫn chớp trắng cả người (đúng chủ ý: một khung); Địa Chấn và chưởng tích lực vẫn khá nhiều lớp (vòng sóng, lửa, số) khi trúng cả đám — chưa giảm thêm để không đổi ngôn ngữ hình của phiên kỹ năng; trùm nhỏ dùng chung đường vẽ quái thường nên đã có đủ các sửa trên.
