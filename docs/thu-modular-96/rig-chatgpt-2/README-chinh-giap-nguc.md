# Sửa lỗi giáp ngực Gen ở hàng chạy

## Các thay đổi

- `khop-chinh/chay.json`: kiểm tra alpha 12 khung; sửa `neck` khung 2 thành `[49.2, 53.2]` và khung 7 thành `[49.2, 52.9]`. `hipCenter` đã là trung điểm `hipFront`/`hipBack`; các khớp vai/hông khác nằm trong 2 px so với alpha lớp tương ứng nên giữ nguyên. Không sửa `data.json`.
- `tao-rig.py`: khai báo mảnh `nguc` dùng `torsoMount: smoothedNeckHip`, đo phần ngoài theo hợp alpha `rearArm + body + torsoOutfit + frontArm`, ngưỡng đỏ 25%.
- `kiem-tra-rig.tmpl.html`: `torsoAngles()` làm mượt góc cổ→hông theo chu kỳ bằng trọng số 50/25/25; `place()` dùng góc này cho giáp ngực và vẫn giữ `boneFrac=0.6`, lượng co giãn hiện hữu, lượng tử 8 hướng. `drawChestClipped()` clip pixel giáp ra ngoài silhouette khi hiển thị. `selfCheck()` đo giáp thô trước clip trong cả hai chế độ và `renderReport()` đánh dấu đỏ nếu vượt ngưỡng.
- `soat-giap-nguc.py`: tái tạo phép đặt và đo nearest-neighbor độc lập, ghi bảng máy đọc được ra `bao-giap-nguc.json`.

## Chạy

```bash
python3 rig/tao-rig.py
python3 rig/soat-giap-nguc.py
```

`tao-rig.py --khong-kiem` chỉ dựng `kiem-tra-rig.html`, bỏ bước mở Chromium. Để chạy `selfCheck()` tự động từ script cần cài Playwright Python và Chromium. Mở HTML trực tiếp cũng chạy kiểm tra trên trang.

## Ghi chú phép đo

Bảng đo pixel giáp thô ngoài silhouette trước bước clip. Do đó các khung có cảnh báo đỏ vẫn hiển thị giáp đã bị clip, không lồi khỏi alpha thân. Bảng phân biệt xoay liên tục và làm tròn 8 hướng; không xoay ảnh nhân vật.
