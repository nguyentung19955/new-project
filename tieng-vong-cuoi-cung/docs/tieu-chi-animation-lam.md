# CHUÔNG HUNTER — TIÊU CHÍ DUYỆT ANIMATION LAM

**Quy định chung**

- Giữ nguyên thiết kế Lam đã chốt, kiếm luôn ở tay xa camera, chuông sau vai gần camera.
- Mỗi frame 64×64, pivot `[32,63]`, màu phẳng tối đa 16 màu tính cả trong suốt, viền pixel rõ.
- Không scale, xoay hoặc căn giữa lại toàn bộ sprite theo bounding box.
- Tất cả biên độ bên dưới tính bằng pixel trên sprite 64×64, là mục tiêu ban đầu để kiểm thử, có thể tinh chỉnh nếu silhouette không đạt.
- Phân biệt **pivot logic** (tọa độ chân/điểm neo nhân vật) và **vị trí bàn chân vẽ trong sprite**. Khi nhân vật ở trên không, bàn chân được phép nằm cao hơn pivot.
- Chuyển động phải có anticipation, follow-through và recovery. Không được để kiếm đổi tay hoặc các bộ phận xuyên nhau.

## 1. RUN — 8 frame, 12 FPS, loop

**Tư thế từng frame:**

- F0: Chân gần camera vươn trước, chân xa ra sau, chuẩn bị tiếp đất.
- F1: Chân trước chịu lực, thân hạ thấp.
- F2: Hai chân đi ngang nhau, thân bắt đầu nâng.
- F3: Đạp mạnh về sau, thân cao nhất.
- F4: Chân xa camera vươn trước, chân gần ra sau.
- F5: Chân xa chịu lực, thân hạ thấp.
- F6: Hai chân đi ngang nhau, thân nâng.
- F7: Đạp mạnh, chuẩn bị trở về F0.

**Biên độ và chuyển động:**

- Sải chân: mỗi bàn chân dịch ngang khoảng 4–7 px so với tư thế trung tâm.
- Nhún thân: 1–2 px theo chiều dọc.
- Tay vung đối pha với chân, biên độ bàn tay khoảng 2–4 px.
- Tay cầm kiếm vẫn giữ kiếm, không đổi tay hoặc để kiếm xuyên thân.
- Áo choàng bay ngược hướng chạy, đuôi áo dao động khoảng 2–4 px, trễ pha so với thân.
- Chuông đung đưa nhẹ 1–2 px, không biến dạng.

**Pivot:** `[32,63]` cố định trong mọi frame. Vị trí nhân vật trong thế giới do physics quyết định. Không dùng thay đổi pivot để tạo nhún thân.

**Khép vòng:** F7 → F0 phải liên tục, không giật. Hai nửa chu kỳ F0–F3 và F4–F7 phải cân đối.

**Kiểm định:** Contact sheet 8 frame, GIF chạy tối thiểu 20 vòng, ảnh chồng silhouette, đánh dấu vị trí pivot và quỹ đạo hai bàn chân. Kiểm tra chân không trượt bất thường trong pha chống đất.

## 2. JUMP — 4 frame, 10 FPS, non-loop

**Tư thế từng frame:**

- F0: Lấy đà, gối khuỵu, thân hạ 1–2 px.
- F1: Bật lên, chân duỗi, thân vươn cao.
- F2: Đang bay lên, hai gối bắt đầu co, áo choàng trễ xuống.
- F3: Gần đỉnh, gối co rõ, thân ổn định, chuẩn bị chuyển Fall.

**Biên độ và chuyển động:**

- Gối co tương đương khoảng 2–4 px thay đổi vị trí bàn chân so với hông.
- Tay gần camera nâng 1–3 px để giữ thăng bằng.
- Tay xa vẫn cầm kiếm, kiếm hướng an toàn, không đổi tay.
- Áo choàng trễ chuyển động 1–3 px.
- Chuông dao động nhẹ, không tách khỏi vị trí gắn.

**Pivot:** `[32,63]` không đổi. Khi nhảy, bàn chân trong hình có thể cao hơn pivot khoảng 2–5 px. **Không đưa toàn bộ sprite lên cao để mô phỏng quỹ đạo nhảy**; độ cao thực tế do `player.y` và physics điều khiển.

**Kết thúc:** Non-loop, giữ F3. Khi `vy` đổi từ âm sang dương thì gameplay chuyển sang Fall. Không để animation tự quyết định vận tốc hoặc thời điểm rơi.

**Kiểm định:** Ảnh 4 frame có đường pivot và vị trí bàn chân; GIF chuyển Idle → Jump → Fall. Kiểm tra không bị nhảy vị trí đột ngột tại điểm chuyển trạng thái.

## 3. FALL — 2 frame, 8 FPS, loop

**Tư thế từng frame:**

- F0: Bắt đầu rơi, thân hơi duỗi, hai chân hướng xuống, áo choàng nâng nhẹ.
- F1: Rơi ổn định, gối hơi co để chuẩn bị tiếp đất, tay giữ thăng bằng.

**Biên độ và chuyển động:**

- Bàn chân dao động khoảng 1–2 px.
- Tay gần camera dịch 1–2 px.
- Áo choàng và chuông trễ theo chuyển động rơi, biên độ khoảng 1–2 px.
- Không nhún toàn thân quá mạnh khiến Lam trông như đang bay hoặc chạy tại chỗ.

**Pivot:** `[32,63]` cố định. Bàn chân có thể cao hơn pivot khoảng 2–4 px. Không cộng thêm độ rơi vào offset sprite.

**Khép vòng:** F1 → F0 phải rất nhẹ, gần như không nhận thấy. Hai frame có thể khác chủ yếu ở áo, tay và gối.

**Kiểm định:** GIF tối thiểu 20 vòng; contact sheet so sánh F0/F1; thử chuyển Jump → Fall → Idle trên nền gameplay. Không được có cảm giác teleport hoặc rung nhân vật.

## 4. ATTACK — 6 frame, 14 FPS, non-loop

**Kiểu đánh:** Chém ngang bằng một tay, kiếm luôn ở tay xa camera. Không đổi tay, không xoay toàn bộ sprite để giả lập cú chém.

**Tư thế từng frame:**

- F0 — **Anticipation:** Hạ trọng tâm, kéo kiếm về sau, vai và thân xoay nhẹ chuẩn bị chém.
- F1 — **Wind-up:** Kiếm đưa ra sau tối đa, khuỷu tay co, áo choàng trễ.
- F2 — **Impact đầu:** Kiếm quét ngang phía trước, tốc độ thị giác lớn nhất, thân xoay theo. `hitFrames` bắt đầu.
- F3 — **Impact cuối:** Kiếm tiếp tục đi qua vùng mục tiêu, duy trì pha gây sát thương. `hitFrames` kết thúc.
- F4 — **Follow-through:** Kiếm vượt qua mục tiêu, thân nghiêng theo đà, áo choàng và chuông chuyển động trễ.
- F5 — **Recovery:** Thu kiếm về tư thế gần Idle, ổn định trọng tâm.

**Biên độ và chuyển động:**

- Tay cầm kiếm dịch khoảng 4–8 px tùy tư thế.
- Đầu kiếm di chuyển theo cung chém rõ ràng, không nhảy vị trí vô lý giữa các frame.
- Vai và thân xoay nhẹ; không thay đổi kích thước đầu hoặc chiều dài tay.
- Chân trước có thể bước hoặc trụ 1–3 px; chân sau giữ trọng tâm.
- Thân nghiêng khoảng 1–3 px.
- Áo choàng văng theo đà 2–4 px, chuông trễ 1–2 px.
- Giữ kiếm và bàn tay kết nối liên tục trong toàn bộ 6 frame.

**Pivot:** `[32,63]` cố định. Không để Lam trượt ngang do thay đổi vị trí sprite. Nếu gameplay có lao tới khi đánh, việc dịch chuyển do physics điều khiển.

**Hit frames:** `[2,3]` (đánh số từ 0), tương ứng pha kiếm đi qua vùng va chạm. Chỉ là metadata; **không thay đổi hitbox, damage hoặc thời điểm gây sát thương hiện tại**.

**Kết thúc:** Non-loop, giữ F5. Gameplay quyết định thời điểm chuyển về Idle/Run; không để animation tự reset hoặc phát lặp.

**Kiểm định:** Contact sheet 6 frame, GIF ở 14 FPS và bản phát chậm, ảnh chồng quỹ đạo đầu kiếm, đánh dấu F2/F3. Kiểm tra kiếm không đổi tay, không xuyên thân, không mất kết nối với bàn tay. Thử chuyển Idle → Attack → Idle và Run → Attack → Run.

## 5. Điều kiện nghiệm thu chung

- Xuất PNG riêng từng frame, sheet 512×320, JSON và GIF.
- Kiểm tra alpha, palette, kích thước, pivot bằng script.
- Có contact sheet đánh số frame và ảnh phóng đại nearest-neighbor.
- Có bản thử trên nền gameplay ở kích thước hiển thị thật.
- Kiểm tra cả hướng gốc và hướng lật ngang.
- Không có frame bị thiếu kiếm, chuông, mắt hoặc bộ phận cơ thể.
- Các animation loop phải không giật ở điểm nối.
- Các animation non-loop phải giữ frame cuối.
- Chạy thử chuỗi Idle → Run → Jump → Fall → Idle → Attack → Idle.
- Nếu không đạt chất lượng, báo rõ lỗi và sửa animation đó; không tự ý thay đổi thiết kế Lam.

**Quy trình:** Chỉ bắt đầu sau khi Idle được duyệt. Sản xuất và duyệt lần lượt Run → Jump → Fall → Attack. Không tích hợp vào demo.html trước khi các animation đạt kiểm định.
## 6. Lưu ý kỹ thuật về hitFrames (bổ sung 17/10 12:40)

Với Attack 6 frame ở 14 FPS, mỗi frame kéo dài khoảng 71,4 ms. Hai `hitFrames` `[2,3]` tương ứng khoảng 143 ms của pha chém. Đây là cửa sổ hiển thị animation, không mặc định là thời gian hitbox thực tế. Khi tích hợp gameplay, giữ nguyên logic gây sát thương hiện tại cho đến khi kiểm tra riêng sự đồng bộ.
