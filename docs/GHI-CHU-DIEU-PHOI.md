# Ghi chú của phiên điều phối (đọc trước khi ghép giao diện và làng)

Chủ dự án vừa yêu cầu thêm, áp dụng cho phiên `claude/giao-dien-va-lang` ở giai đoạn 2:

1. **Tài nguyên hiển thị bằng biểu tượng, không dùng chữ.** Dải tài nguyên trên cùng (vàng, quặng, đá tôi, nguyên liệu ba vùng, mảnh trùm) và mọi chỗ ghi giá/thưởng: vẽ biểu tượng pixel nhỏ kèm con số (đồng tiền vàng, cục quặng, viên đá tôi, khúc gỗ linh, vảy cá, đá lửa, mảnh trùm của từng trùm). Chạm vào biểu tượng thì hiện tên trong chốc lát để người mới biết đó là gì.
2. **Dải bảy khuôn mặt lối tắt không được đè lên công trình** (trong ảnh `lang-trong-game.png` nó đang đè mái lò rèn): thu gọn lại hoặc dời/đẩy cảnh làng xuống, hoặc cho dải mờ đi khi em bé đứng gần mép trên.
3. **Game đã có khoá ngang**: cầm máy dọc thì cả khung game tự xoay 90 độ (xem `applyRot` trong `game/js/engine.js`, biến `G.rot`). Toạ độ chạm đã được đổi sẵn trong `pos()`. Bài kiểm tra dùng `tests/ui_lib.py` (hàm `xy`) đã hiểu phép xoay. Đừng tự đọc `clientX/clientY` hay `getBoundingClientRect` ở nơi khác; dùng `G.pointers`, `G.click`, `G.downs`.
4. **Màn kết quả đã có nút "Ải tiếp theo ▶" / "Sang vùng mới ▶"** (trong `panelResult` của `game/js/stage.js`). Khi đổi sang giao diện trống đồng nhớ giữ ba nút: Về làng, Chơi lại, Ải tiếp theo (nút nổi bật nhất).
5. **Chạy kiểm tra cho nhanh (chủ dự án yêu cầu, 09/10).** Repo có gần 60 bài kiểm tra; chạy hết nhiều lần mất cả tiếng. Từ nay:
   - Trong lúc làm: chỉ chạy bài của phần mình sửa và `tests/rules.py`.
   - `tests/cay.py` (bot chơi 15 ải, rất lâu) CHỈ chạy khi đổi số cân bằng, sát thương, máu, kinh tế, cấp, linh khí. Công cụ ngoài (tools/), giao diện, hình vẽ, tài liệu thì không chạy.
   - Bài giao diện (`ui_input.py`, `ui_robust.py`, `hanh_trang.py`...) chỉ chạy khi sửa giao diện trong game; chạy một cỡ màn hình là đủ nếu bài có lựa chọn.
   - Trước khi đẩy "XONG": gộp `origin/khoi-tao-du-an` MỘT lần, rồi chạy MỘT lượt các bài liên quan + `rules.py` + `ui_build.py`. Không chạy lại toàn bộ sau mỗi lần gộp nếu lần gộp không đụng tệp của mình.
   - Người điều phối sẽ chạy thêm các bài chính khi đưa bản mới lên link chơi.
