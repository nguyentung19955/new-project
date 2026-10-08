# Ghi chú của phiên điều phối (đọc trước khi ghép giao diện và làng)

Chủ dự án vừa yêu cầu thêm, áp dụng cho phiên `claude/giao-dien-va-lang` ở giai đoạn 2:

1. **Tài nguyên hiển thị bằng biểu tượng, không dùng chữ.** Dải tài nguyên trên cùng (vàng, quặng, đá tôi, nguyên liệu ba vùng, mảnh trùm) và mọi chỗ ghi giá/thưởng: vẽ biểu tượng pixel nhỏ kèm con số (đồng tiền vàng, cục quặng, viên đá tôi, khúc gỗ linh, vảy cá, đá lửa, mảnh trùm của từng trùm). Chạm vào biểu tượng thì hiện tên trong chốc lát để người mới biết đó là gì.
2. **Dải bảy khuôn mặt lối tắt không được đè lên công trình** (trong ảnh `lang-trong-game.png` nó đang đè mái lò rèn): thu gọn lại hoặc dời/đẩy cảnh làng xuống, hoặc cho dải mờ đi khi em bé đứng gần mép trên.
3. **Game đã có khoá ngang**: cầm máy dọc thì cả khung game tự xoay 90 độ (xem `applyRot` trong `game/js/engine.js`, biến `G.rot`). Toạ độ chạm đã được đổi sẵn trong `pos()`. Bài kiểm tra dùng `tests/ui_lib.py` (hàm `xy`) đã hiểu phép xoay. Đừng tự đọc `clientX/clientY` hay `getBoundingClientRect` ở nơi khác; dùng `G.pointers`, `G.click`, `G.downs`.
4. **Màn kết quả đã có nút "Ải tiếp theo ▶" / "Sang vùng mới ▶"** (trong `panelResult` của `game/js/stage.js`). Khi đổi sang giao diện trống đồng nhớ giữ ba nút: Về làng, Chơi lại, Ải tiếp theo (nút nổi bật nhất).
