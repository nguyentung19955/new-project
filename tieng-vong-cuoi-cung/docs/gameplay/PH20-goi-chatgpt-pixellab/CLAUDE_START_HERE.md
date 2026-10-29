# HANDOFF CHO CLAUDE — PixelLab AI + HTML/JavaScript 2D Fast Combat

## Yêu cầu của người dùng
Người dùng đang làm game **2D đi cảnh ngang** bằng **HTML + JavaScript (HTML5 Canvas 2D)**, dùng **PixelLab Creator trên website** để tạo **pixel art chi tiết, dark fantasy**. Tham khảo độ chi tiết hình ảnh của Blasphemous, nhưng muốn **combat nhanh kiểu Dead Cells**: di chuyển nhanh, dash, combo 3 hit, hitstop ngắn, phản hồi tức thì. Người dùng muốn hướng dẫn xuất sprite sheet từ PixelLab, tích hợp vào game JavaScript và phát triển tiếp. Đây là tài liệu bàn giao tổng hợp toàn bộ trao đổi trước đó. Không có sprite thực tế do người dùng xuất từ PixelLab trong gói này.

## Nội dung ZIP
- `CLAUDE_START_HERE.md`: bối cảnh, hướng dẫn, thông số và yêu cầu tiếp tục.
- `fast_combat/`: demo HTML/JS mới nhất, có placeholder nếu thiếu PNG; nên phát triển trên bản này.
- `basic_platformer/`: demo cơ bản trước đó để tham khảo.
- `PROMPTS_PIXELLAB.md`: prompt tạo animation.
- `SPRITE_EXPORT_AND_INTEGRATION.md`: hướng dẫn xuất, cấu trúc file, logic animation và checklist.

## Quyết định thiết kế đã thống nhất
- Game side-scroller, sprite nhìn ngang, mặc định hướng phải; flip theo hướng trái ở Canvas.
- Sprite sheet PNG nền trong suốt, các frame xếp **một hàng ngang**, mỗi frame **128×128 px** (quy ước của demo, không phải bắt buộc từ PixelLab).
- Dùng cùng một **master sprite** cho mọi animation để giữ mũ/giáp/vũ khí/tỷ lệ/palette đồng nhất. Dựng key pose cho animation phức tạp; chỉnh frame lỗi trong Pixelorama hoặc pixel editor.
- Dùng nearest-neighbor (`ctx.imageSmoothingEnabled=false`), căn chân/pivot thống nhất, tách slash VFX khỏi sprite và để JavaScript quản lý hitbox/hit timing.
- Bộ animation mục tiêu (frame / FPS): idle 6/8, run 8/14, jump 3/12, fall 2/8, attack1 5/18, attack2 6/20, attack3 7/18, dash 4/20, hurt 3/12, death 8/12. FPS là tốc độ phát gợi ý, không phải giới hạn PixelLab.
- Điều khiển trong demo mới: A/D hoặc ←/→ di chuyển, Space/W/↑ nhảy, J tấn công (nhấn tiếp khi đang tấn công để queue combo), K/Shift dash, R reset dummy.
- Tuning mặc định: run 295 px/s, dash 670 px/s, hitstop 45 ms; tùy chọn cân bằng 245/560/60; cực nhanh 350/800/30.

## Trạng thái code thực tế
Xem `fast_combat/game.js`, `fast_combat/index.html`, `fast_combat/README.txt`. Demo đã có di chuyển, nhảy, combo 3 hit, dash, hitbox, enemy dummy HP, hitstop, camera shake đơn giản và sprite fallback. **Không được xem là production-ready**: chưa có animation cancel nâng cao, coyote time, jump input buffer, tilemap collision, camera follow, VFX chuyên dụng, nhiều kẻ địch, hệ thống asset pipeline, điều khiển cảm ứng. Hitbox và thời gian active là mẫu cần playtest. Có thể chạy bằng mở `index.html`; nếu gặp hạn chế local asset, dùng local HTTP server (`python -m http.server 8000`).

## Việc nên nhờ Claude làm tiếp
1. Đọc code thực tế trong `fast_combat/` và kiểm tra/khắc phục lỗi trước khi thêm tính năng.
2. Tổ chức code thành module animation controller, player state machine, combat, collision và asset loader; vẫn chạy được trong trình duyệt.
3. Cho phép import sprite sheet xuất từ PixelLab, tự động cấu hình số frame/FPS/pivot bằng JSON, hỗ trợ nhiều hàng hoặc atlas nếu cần.
4. Thêm input buffering, coyote time, dash cancel/attack cancel có kiểm soát, hitstop đúng thời gian, hitbox theo từng frame, knockback, combo windows, VFX chém kiếm tách riêng.
5. Giữ pixel-perfect rendering, hướng trái/phải, căn chân ổn định và không để gameplay phụ thuộc vào độ dài frame AI.
6. Nếu người dùng gửi sprite PNG thật, kiểm tra kích thước, frame count, alpha, pivot và sửa cấu hình tương ứng thay vì giả định luôn là 128×128.

## Cảnh báo tính chính xác
Tên công cụ và UI của PixelLab Creator có thể thay đổi; những lời khuyên về nút Export, Animate with Text/Skeleton, giới hạn frame cần xác minh lại với giao diện/tài liệu hiện tại. Các prompt và thông số trong gói là đề xuất, không bảo đảm AI tạo đúng số frame hoặc animation loop hoàn hảo. Không có sprite PNG thật trong gói.

## Prompt mở đầu gợi ý gửi Claude
"Hãy đọc toàn bộ file trong ZIP, đặc biệt CLAUDE_START_HERE.md và fast_combat/game.js. Tôi làm game side-scroller pixel art chi tiết, dùng PixelLab Creator để xuất sprite sheet, HTML5 Canvas + JavaScript, muốn combat nhanh kiểu Dead Cells. Hãy audit code demo, sửa bug, sau đó nâng cấp animation state machine, combo/dash cancel, input buffering và hệ thống import sprite PNG + config JSON. Giải thích cách chạy và những file đã thay đổi. Đừng giả định đã có sprite PNG thật."
