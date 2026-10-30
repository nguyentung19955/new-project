# PROJECT RESET — ANIMATION-FIRST PIXEL ART

## 1. RESET TOÀN BỘ ĐỊNH HƯỚNG CŨ

Claude, từ thời điểm này, chúng ta thay đổi hoàn toàn hướng sản xuất nhân vật.

**Hãy bỏ qua toàn bộ thiết kế và quy tắc cũ liên quan đến:**
- AERIN, Lam và mọi hero trước đây.
- Giáp, mũ, tóc, khăn choàng, khuôn mặt phức tạp.
- Character Bible, tỷ lệ cơ thể và palette cũ.
- Quy tắc tay cầm kiếm gần/xa camera.
- Các sprite master, skeleton và animation đã khóa.
- Những giới hạn thiết kế từng khiến chúng ta phải sửa từng pixel để giữ ngoại hình.

Không sử dụng các thiết kế cũ làm reference cho PixelLab nữa.

Đây là một dự án nhân vật mới, bắt đầu từ con số 0. Không cần xóa lịch sử hội thoại; chỉ ngừng áp dụng những quyết định cũ.

## 2. TRIẾT LÝ MỚI: ANIMATION FIRST

Tôi đính kèm một sprite sheet làm reference chính.

Hãy phân tích kỹ hình ảnh này.

Nhân vật chỉ gồm:
- Đầu hình vuông màu trắng, bo góc nhẹ.
- Hai mắt đen đơn giản.
- Cơ thể nhỏ màu đỏ.
- Tay chân ngắn, cực kỳ đơn giản.
- Một thanh kiếm đơn giản.
- Pixel art 2D, silhouette rõ ràng.

**Mục tiêu không phải tạo nhân vật đẹp và phức tạp. Mục tiêu là tạo animation cực kỳ mượt, mạnh, logic, giàu sức sống.**

Ưu tiên theo thứ tự:

1. Chuyển động toàn thân tự nhiên và có lực.
2. Anticipation, action, follow-through và recovery.
3. Squash & stretch.
4. Body rotation, thay đổi silhouette.
5. Smear frames, motion arcs, speed trails.
6. Footwork, momentum, trọng tâm và hướng chuyển động.
7. Tính liên tục giữa các frame.
8. Giữ ngoại hình nhân vật nhất quán.

Ngoại hình phải đủ đơn giản để AI không bị phân tâm bởi các chi tiết.

## 3. PHÂN TÍCH REFERENCE

Sprite sheet đính kèm có:

- Idle
- Walk
- Jump
- Fall
- Attack 1
- Attack 2
- Attack 3
- Attack 4
- Air Attack
- Death

Hãy phân tích từng animation theo:

- Key poses.
- Anticipation.
- Contact / impact.
- Follow-through.
- Recovery.
- Hướng chuyển động của đầu, thân, tay, chân.
- Đường đi của kiếm.
- Sự thay đổi trọng tâm.
- Smear frame và squash/stretch.
- Frame spacing và timing.

Đặc biệt chú ý bốn chuỗi Attack: dù nhân vật cực kỳ đơn giản, động tác vẫn có lực và dễ đọc.

Không chỉ sao chép từng frame. Hãy hiểu logic chuyển động để tạo animation mới có chất lượng tương đương hoặc tốt hơn.

## 4. QUY TRÌNH CLAUDE + CHATGPT + PIXELLAB

Vai trò:

**Claude — Technical Artist / Production Operator**
- Phân tích reference.
- Quản lý quy trình.
- Viết và gửi prompt tới PixelLab.
- Kiểm tra sprite đầu ra.
- Lập frame map, timing và QA.
- Gửi kết quả cho ChatGPT đánh giá.

**ChatGPT — Animation Director**
- Thiết kế choreography.
- Đánh giá chuyển động và tính liên tục.
- Đề xuất key poses.
- Chỉnh prompt.
- Quyết định PASS / FAIL.
- Hướng dẫn sửa frame cụ thể.

**PixelLab — Sprite Generation**
- Tạo nhân vật gốc đơn giản.
- Tạo các animation.
- Sử dụng Skeleton v3 hoặc V3 free-motion tùy animation.
- Không mặc định Skeleton v3 là tốt nhất: cần kiểm tra khả năng tạo body rotation, smear và squash/stretch thực tế.

## 5. KẾ HOẠCH SẢN XUẤT

### Phase 1 — Minimal Character Master

Tạo một nhân vật mới dựa trên ngôn ngữ hình ảnh của reference, không cần giống hệt.

Đề xuất:
- Canvas 64×64.
- Nhân vật cao khoảng 32–40 px.
- Đầu vuông trắng.
- Mắt đen.
- Thân đỏ.
- Tay chân nhỏ.
- Kiếm đơn giản.
- Ít màu, pixel clusters sạch.
- Không có giáp, tóc, khăn hay phụ kiện phức tạp.

Tạo một master pose duy nhất trước. Chưa tạo 8 hướng.

### Phase 2 — Motion Prototype

Chỉ thử ba animation đầu tiên:

1. Idle — 4 frames.
2. Walk / Run — 6–8 frames.
3. Attack 1 — 6–8 frames.

Attack 1 là bài kiểm tra quan trọng nhất.

Nó cần thể hiện rõ:
- Wind-up.
- Toàn thân xoay hoặc nghiêng theo cú đánh.
- Bước chân hoặc lunge.
- Impact mạnh.
- Một smear frame lớn.
- Follow-through.
- Recovery.

Thử Skeleton v3 và V3 free-motion nếu cần, so sánh kết quả thực tế thay vì đoán trước công cụ nào tốt hơn.

### Phase 3 — Full Animation Set

Chỉ bắt đầu sau khi Attack 1 đạt chất lượng:

Idle, Walk, Run, Jump, Fall, Attack 1–4, Air Attack, Hurt, Death.

Các animation cần nối được với nhau trong game.

## 6. QUY TẮC QA

Không đánh giá chỉ bằng sprite sheet tĩnh.

Phải xem animation chạy liên tục ở tốc độ thực, thử khoảng 70 ms/frame rồi điều chỉnh timing theo động tác.

Kiểm tra:
- Silhouette có dễ đọc không?
- Trọng tâm có di chuyển logic không?
- Động tác có đủ anticipation và follow-through không?
- Kiếm có đi theo một quỹ đạo liên tục không?
- Smear có đúng hướng chuyển động không?
- Có frame nào bị giật, mất chi tiết hoặc đổi hình dạng vô lý không?
- Animation có cảm giác mạnh và mượt ở kích thước 1× không?

Không cố giữ tất cả các frame có thời lượng bằng nhau nếu timing khác nhau giúp động tác tốt hơn.

## 7. NHIỆM VỤ ĐẦU TIÊN

**Chưa gửi prompt cho PixelLab ngay.**

Trước tiên, hãy:

1. Xác nhận đã chuyển sang dự án Animation-First mới.
2. Phân tích sprite sheet reference, đặc biệt bốn chuỗi Attack.
3. Đề xuất một Minimal Character Master dễ animate nhất.
4. Đề xuất cách thử nghiệm PixelLab để tối đa hóa chất lượng chuyển động.
5. Viết prompt đầu tiên tạo nhân vật đơn giản.
6. Gửi kế hoạch và prompt cho ChatGPT đánh giá trước khi thực hiện.

Không quay lại thiết kế AERIN.

**Nguyên tắc tối cao: Chúng ta đơn giản hóa nhân vật để đầu tư toàn bộ công sức vào animation, chứ không đơn giản hóa animation.**