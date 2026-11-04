# Quy trình làm hoạt ảnh tướng (người dùng chốt 03/11/2026) — áp dụng MỌI tướng

Đọc trước: TIEU-CHI-NGHIEM-THU-HOAT-ANH.md và BAI-HOC-LOI-SAI.md.

0. **Hồ sơ nhân vật** (ho-so-tuong/<so>-<TEN>.md) — viết TRƯỚC, người dùng duyệt: vai trò/chiêu, hình dáng, màu, DANH SÁCH CHI TIẾT bắt buộc, LOẠI VŨ KHÍ và cách mang (gắn tay / cầm 1 tay / cầm 2 tay / vác vai…, tay nào), bảng vị trí vũ khí 8 hướng, động tác đánh, hiệu ứng. MỌI prompt (ảnh gốc, 8 hướng, sửa, hoạt ảnh) đều dán kèm phần mô tả ngắn của hồ sơ. Không dựa vào nhân vật cũ.
1. **Ảnh gốc** — ChatGPT vẽ model sheet / ảnh hướng S (camera top-down cao như Defense War). Người dùng duyệt.
2. **8 hướng bằng PixelLab** — PixelLab › Create Character › Create from Reference, Camera **High Top-Down**, 8 dir.
   - Đưa ảnh S (bản pixel sạch, ≤256px, ví dụ khung 1 đã cắt pixel) vào ô South; hướng nào đã có bản duyệt thì đưa vào đúng ô của nó.
   - Ảnh bị mờ/không pixel → PixelLab báo "Blurry" → dùng bản pixel đã cắt.
   - Gửi người dùng xem 8 hướng; kiểm bảng tay (BAI-HOC mục 10) trước khi gửi.
3. **Hoạt ảnh từng hướng** — với MỖI hướng: đính kèm ĐÚNG ảnh hướng đó của PixelLab cho ChatGPT làm khung 1, prompt ngắn + các lưu ý trong sổ (thân đứng yên, đủ 2 tay 12 khung, động tác hợp vũ khí, không hiệu ứng, nền trong suốt, 2 hàng × 6). KHÔNG để ChatGPT tự nghĩ ra hướng bằng chữ.
4. **Cắt pixel** — `NORM=1 SACH=vien FH=224 PADB=40 python3 tools/demo-cat-luoi-khung-pixel.py …` rồi `CUNG=1 T=60 python3 tools/demo-khoa-than-dung-yen.py …`.
5. **Tự kiểm hết sổ** — đặt khung 1 cạnh ảnh PixelLab của hướng đó + các hướng đã duyệt; đo đỉnh/đáy; xem GIF như người chơi. Không đạt → vẽ lại, không gửi, không tự bào chữa.
6. **Gửi người dùng** GIF (3× NEAREST) khi đạt hết; gộp các hướng đã duyệt vào 1 GIF.
7. Hiệu ứng (lửa, tia…) vẽ riêng sau cùng; code gắn vào nòng theo hướng.

## Nhân vật PixelLab bản 2 (Skeleton, 04/11/2026)
- SENTINEL: 7adaadc3-d190-4f2f-ad28-a95aedfd37b2
- PULSE: 381466c9-218e-486b-bad5-38c58f34ccce
- ANCHOR: 1d4fe8b4-1ab6-421e-a63f-34ee7c5e60c5
Thứ tự cột trong ảnh kiểm: S, SE, E, NE, N, NW, W, SW.

## Quy trình PixelLab chuẩn cho tướng (chốt 04/11)
1. Chuẩn bị MỘT hình mặt trước (S) đúng tư thế dùng trong game, thấy rõ vũ khí (vũ khí chĩa vào người xem sẽ bị hiểu thành vũ khí ngắn).
2. Gọi `/generate-8-rotations-v3` (2 lượt/lần) với `description` liệt kê chi tiết + tay cầm vũ khí. Chạy 2–3 seed, chọn NGUYÊN một bộ; không ghép hướng giữa các bộ, không lật gương, không vá lẻ.
3. Thứ tự ảnh trả về: S, SE, E, NE, N, NW, W, SW (khi gốc là S). Gốc không phải S thì kết quả lộn xộn — không dùng.
4. Soát trước khi gửi: phụ kiện đúng bên ở mọi hướng, vũ khí đúng tay (hướng lưng có thể che tay), cao thân lệch ≤ ~5px, căn chân y=114 x=64 bằng code.
5. Gọi API từ máy làm việc: `/root/rig/pl.py` (mã ở `/root/.plk`, quyền 600, không in, không commit).

## Hoạt ảnh chuẩn bằng PixelLab (chốt 04/11, SENTINEL đạt)
1. Bộ 8 hướng đã duyệt (từ `/generate-8-rotations-v3`) → nhập thành nhân vật: `/create-character-v3` với `reference_image`=S + `direction_images` đủ 7 hướng còn lại, `view='high top-down'`, `template_id='mannequin'` (0,25 lượt, PixelLab không vẽ lại, tự dựng bộ xương 3D).
2. Tạo động tác: `/characters/animations` `mode='skeleton-v3'`, KHÔNG có `template_animation_id`, `action_description` = mô tả THUẦN ĐỘNG TÁC (không chữ "bắn/súng/giật súng/fire" → tránh lửa khói), thêm "nothing else appears"; `frame_count` 4; đủ 8 `directions` trong MỘT lệnh → 1 chuyển động 3D chung cho cả 8 hướng (~3 lượt/hướng, 3–5 phút).
3. Soát: không hiệu ứng, chi tiết như hình đã duyệt, không mất vũ khí.
4. Hướng hỏng: `DELETE /characters/{id}/animations/{group}/directions/{dir}` rồi tạo lại hướng đó với `animation_group_id` của bộ (giữ đúng chuyển động chung), đổi seed. KHÔNG sửa pixel, KHÔNG ghép hướng từ bộ khác.
5. Giới hạn: tối đa 8 job chạy cùng lúc → chạy từng bộ một.

### Ghi chú bắt buộc khi gửi PixelLab (chốt 04/11, sau SENTINEL B)
- **Vị trí nhân vật giữa các hướng/khung:** PixelLab có thể trả mỗi hướng một khung (canvas) khác cỡ (vd. N 112px, còn lại 128px) và đặt nhân vật lệch → khi phát nhân vật bị dịch chỗ. Sau khi tải về PHẢI căn bằng code: đưa giữa 2 bàn chân về x=64, đáy chân về y=114 trên khung 128×128, cho cả ảnh đứng lẫn mọi khung tấn công (cùng một độ dịch cho cả bộ khung của 1 hướng). Kiểm lại bằng số: mọi hướng, mọi khung chân = (64,114).
- **Mô tả động tác:** không dùng chữ gợi bắn (fire, shoot, recoil, kick, muzzle) → PixelLab tự thêm lửa/khói/tia. Dùng chữ thuần động tác: "both arms snap up a little and the head and upper body jerk back once". Luôn thêm: "the pistol stays in the right hand and stays fully visible; no extra hands or arms; feet stay planted; nothing else appears".
- **Khung 0** của động tác là tư thế đứng do PixelLab dựng lại, hay nhoè → trong game và GIF dùng ảnh đứng thay khung 0.
- **Soát trước khi gửi người dùng** (không gửi bản còn lỗi): tự động (vạch xanh súng không tụt dưới 70% trung vị, không mảnh rời >15px, không màu lửa) + nhìn phóng to từng khung từng hướng (tay thừa, súng mờ, vệt nhoè). Hướng nào hỏng: xoá hướng đó và tạo lại trong cùng nhóm động tác, lặp tới khi đạt.

## Chốt 04/11 chiều — bộ v6 "chỉ dùng cái PixelLab làm tốt"
- Bỏ vũ khí (súng nhỏ trong tay luôn sinh nhoè/khói/tay thừa). Sửa ảnh gốc bằng `/edit-image-pixen` ("remove the X, empty hands").
- Đứng: mẫu `breathing-idle`, mode `skeleton-v3` (di chuyển nhân vật, không vẽ lại) → sạch 8 hướng.
- Tấn công: SENTINEL = mẫu `lead-jab`; PULSE = skeleton-v3 tự mô tả "hai tay giơ lên đầu rồi vung ra trước, tay trống" (6 khung). ANCHOR hỗ trợ: chỉ đứng.
- Mẫu bị loại: fireball (tự vẽ lửa), throw-object (nhoè đầu, vẽ vật), pushing (cúi rạp), cross-punch (nhoè khung cuối).
- File: `nguon-tuong/v6/` + GIF xem trước. Hiệu ứng (tia, cầu nổ, sóng buff) game vẽ riêng.
