# Yêu cầu đợt 6: hệ thống ÉP ĐỒ (bậc vũ khí) + ẢI THEO NGÀY (chủ dự án 13/10 15:55)

Nguyên văn: "Thêm hệ thống ép đồ, diệt trùm sẽ cho đá nâng bậc, sẽ có các bậc là trắng khởi điểm, xanh lam, xanh lục, tím, vàng, đỏ, rực lửa. Tương ứng các màu khác tăng chỉ số thì từ tím trở lên sẽ có thêm dòng hiệu ứng để tăng 1 thứ gì đó, sẽ có ải riêng để kiếm đá nâng bậc vào thứ 7 chủ nhật thứ 2 thứ 4, ải riêng để kiếm đá mài vào t3 t6 và t7 chủ nhật, ải riêng kiếm vàng vào t6 và t5 và t7 chủ nhật."

Làm SAU đợt 5 (`bao-cao-5.md`, bot cân bằng) — git pull, đọc báo cáo 1–5 trước.

## A. Ép đồ (bậc màu) cho 4 vũ khí cố định
- 7 bậc: **Trắng** (khởi điểm) → **Xanh lam** → **Xanh lục** → **Tím** → **Vàng** → **Đỏ** → **Rực lửa**. Độc lập với cấp hệ (Trắng/Mầm/Thành hình/Thức tỉnh): hai trục cùng tồn tại. Đặt tên trục là "Bậc" (ép đồ) để không lẫn với "Cấp" hệ; chỗ nào trùng chữ "Trắng" thì ghi rõ "Bậc Trắng".
- Mỗi bậc tăng chỉ số (đề xuất, ghi vào bảng hằng số một chỗ `G.EP_DO`): sát thương ×1,00 / 1,08 / 1,17 / 1,28 / 1,40 / 1,55 / 1,75; mỗi bậc thêm chút tốc đánh hoặc máu theo loại (kiếm tốc đánh, thương tầm, búa choáng, phi tiêu xuyên) — cân sao cho Rực lửa ≈ ×1,75 tổng sức mạnh vũ khí.
- **Từ Tím trở lên mỗi bậc mở thêm 1 dòng hiệu ứng** (Tím 1 dòng, Vàng 2, Đỏ 3, Rực lửa 4). Dòng ngẫu nhiên khi vừa lên bậc, từ bảng dòng (đề xuất): +chí mạng, +sát thương chí mạng, +sát thương lên trùm/tinh anh, hút máu, +tốc đánh, giảm hồi chiêu đặc biệt, +linh khí nhận, +sát thương hệ, giảm sát thương nhận. Giá trị dòng tăng theo bậc. Cho **đổi dòng** (tẩy luyện) bằng đá nâng bậc ít hơn giá lên bậc.
- **Đá nâng bậc**: rơi từ trùm (trùm nhỏ ít, trùm vùng nhiều, lần đầu nhiều hơn) và ải ngày. Giá lên bậc tăng dần (đề xuất 3 / 6 / 10 / 16 / 25 / 40 đá + vàng); bậc cao có thể cần thêm mảnh trùm. Có thể thất bại? KHÔNG — luôn thành công (đơn giản cho người chơi).
- Màu khung ô vũ khí, tên vũ khí, viền icon theo bậc (đã có `gd-o-vk-0..3` 4 màu — mở rộng 7 màu bằng nhuộm code; Rực lửa có viền lửa chạy). Liệt kê ảnh nên gen thêm (khung ô 7 bậc, icon đá nâng bậc, đá mài, cổng ải ngày) kèm prompt ngắn trong báo cáo.
- Chỗ ép: Ông Thợ Rèn (thẻ "Ép đồ") và Hành trang › Vũ khí.

## B. Ải theo ngày (tính theo giờ máy người chơi; đổi ngày lúc 00:00)
| Ải | Rơi chính | Ngày mở |
|---|---|---|
| Ải Đá Bậc | đá nâng bậc | Thứ 7, Chủ nhật, Thứ 2, Thứ 4 |
| Ải Đá Mài | đá mài (= quặng dùng để mài; nếu "đá mài" nên là vật phẩm riêng thì ghi đề xuất trong báo cáo, mặc định dùng quặng) | Thứ 3, Thứ 6, Thứ 7, Chủ nhật |
| Ải Vàng | vàng | Thứ 5, Thứ 6, Thứ 7, Chủ nhật |
- Mở từ sau khi hạ trùm vùng 1. Mỗi ải 3 lượt/ngày (lượt hồi lúc 00:00), 3 mức khó theo vùng đã mở (dễ/vừa/khó, thưởng tăng). Lối chơi: ải ngắn 1 phòng nhiều đợt quái + 1 tinh anh cuối, dùng lại quái/cảnh các vùng.
- Cổng vào ở làng (ví dụ cạnh Lão Lái đò hoặc bảng mới "Ải ngày"), hiện ngày nào mở ải gì, lượt còn lại, đồng hồ tới ngày mới. Chống chỉnh giờ máy đơn giản: lưu ngày lần chơi cuối, ngày lùi thì không hồi lượt.
- Lưu trong save (máy + mây), chuyển save cũ an toàn.

## C. Cân bằng
- Ghi bảng: số đá kiếm được mỗi tuần (trùm + ải ngày), số tuần để lên Tím / Rực lửa một món; vàng/đá mài ải ngày so với thu nhập ải thường (ải ngày ≈ 1,5–2× một lượt ải thường cùng vùng, không phá cân bằng đợt 4–5).
- Thêm vào mô hình `tools/can-bang/tinh.js`.

## Luật
- **KHÔNG TEST** (không Playwright, không chạy game) — chỉ `node --check`, `python3 game/build.py`, script tính số liệu.
- Không chép apiKey; không làm hỏng đăng nhập Google, lưu mây, `?cloud=0`, đường đọc save cũ. Cờ `?epdo=0` tắt ép đồ, `?aingay=0` tắt ải ngày.
- Thêm chữ tiếng Anh như các lần trước.
- Chỉ push nhánh `khoi-tao-du-an`; KHÔNG master, KHÔNG force push, KHÔNG PR. Bị từ chối thì `git pull --rebase` (xung đột `game/dist` thì lấy bản trên nhánh rồi chạy lại build.py).
- Commit kết thúc bằng:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g

## Khi xong
`bao-cao-6.md` (tiếng Việt dễ hiểu: cách ép đồ, bảng bậc/dòng/giá, ải ngày, bảng cân bằng, ảnh cần gen + prompt, mã commit), push, tự dừng.
