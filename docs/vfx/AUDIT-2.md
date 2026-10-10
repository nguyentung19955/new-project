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
