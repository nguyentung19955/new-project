# Prompt ảnh còn thiếu cho kỹ năng riêng 24 quái con

Ngày 14/10/2026. Ảnh máy chủ đang 25,67/26 MB nên phiên này **không thêm ảnh mới vào build**: các hình dưới đây đang được vẽ tạm bằng code trong `game/js/ky_nang_quai.js` (hàm `ve` của từng vật). Khi có chỗ, vẽ ảnh theo prompt, tách bằng trang công cụ `tools/tach-hieu-ung` thành tệp `game/art/custom/<mã>.sprite.json`, rồi thay phần vẽ tạm bằng `G.fxAnh.ve(...)` (giữ phần vẽ code làm dự phòng khi thiếu tệp).

Mọi ảnh: pixel art, nền trơn **#00FF00**, dải 6–8 khung xếp NGANG, các khung CÁCH XA NHAU, không bóng đổ, không chữ, không logo. Gửi kèm ảnh mẫu ghi ở mỗi mục để ChatGPT bắt đúng nét.

Các hiệu ứng khác đã dùng lại ảnh có sẵn: `hu-dan-bao-tu` (hạt bào tử), `hu-dan-qua-no` (hạt dẻ), `hu-may-doc` (mây độc Nấm Phồng), `hu-cot-nuoc` (Cá Chuồn đáp), `hu-nut-dat` (Tượng Đá đập đất), `hu-phan-than` (bóng Mèo Đen hiện / tan), `hu-cot-lua` (gai lửa Nhím Thần), `hu-dan-lua` (lửa ma Đèn Lồng), `hu-dan-bot` (tia nước Hải Quỳ), `hu-vung-quai-doc`, `hu-vung-quai-lua` (vũng độc, vệt lửa).

## 1. `hu-cau-dat-lan` — cục đất lăn của Bọ Hung (Rừng già)

Ảnh mẫu cần gửi: `boHung.sprite.json` (khung đứng của Bọ Hung Mai Cứng) và `hu-dan-qua-no.sprite.json`.

```
Vẽ MỘT tấm ảnh pixel art 2D: dải 8 khung xếp NGANG trên một hàng, các khung CÁCH XA NHAU (khoảng trống ít nhất bằng một khung), nền trơn một màu xanh lá #00FF00. Nội dung: một CỤC ĐẤT TRÒN do con bọ hung đẩy đi, đang LĂN sang phải, nhìn hơi chếch từ trên xuống (game nhìn từ trên). Cục đất tròn đường kính khoảng 16 điểm ảnh, nâu đất #7a5a32, mảng sáng #a07a46 ở góc trên trái, vài hòn sỏi và cọng cỏ khô #4e3820 dính trên mặt; 8 khung là một vòng lăn trọn: các hòn sỏi và cọng cỏ xoay dần theo chiều kim đồng hồ, khung 8 nối liền khung 1. Viền ngoài một nét tối #14182e. Không bóng đổ, không bụi, không chữ, không logo, không vẽ con bọ hung. Màu phẳng, đổ bóng 3 sắc.
```

## 2. `hu-vet-nhot` — vệt nhớt làm chậm của Ốc Mượn Hồn (Hang biển)

Ảnh mẫu cần gửi: `oc.sprite.json` và `hu-vung-quai-bang.sprite.json`.

```
Vẽ MỘT tấm ảnh pixel art 2D: dải 6 khung xếp NGANG trên một hàng, các khung CÁCH XA NHAU, nền trơn một màu xanh lá #00FF00. Nội dung: một VŨNG NHỚT ỐC nằm bẹt trên sàn đá, nhìn từ trên xuống, hình bầu dục dẹt (rộng gấp đôi cao, khoảng 24 × 13 điểm ảnh), mép lượn sóng mềm. Màu xanh ngọc trong #78c8be với mảng bóng loáng #dcfffa và vài chấm sáng trắng; lòng vũng hơi đục. 6 khung: vũng lấp lánh nhẹ (chấm sáng dịch chuyển, mép gợn rất ít), khung 6 nối liền khung 1. Viền ngoài mảnh màu #2a6a70. Không bóng đổ, không chữ, không logo, không con ốc.
```

## 3. `hu-vung-dien` — vũng điện của Sứa Bom (Hang biển)

Ảnh mẫu cần gửi: `sua.sprite.json` và `hu-bom-bang.sprite.json`.

```
Vẽ MỘT tấm ảnh pixel art 2D: dải 8 khung xếp NGANG trên một hàng, các khung CÁCH XA NHAU, nền trơn một màu xanh lá #00FF00. Nội dung: một VŨNG NƯỚC NHIỄM ĐIỆN của con sứa nằm trên sàn, nhìn từ trên xuống, hình bầu dục dẹt (khoảng 52 × 28 điểm ảnh). Khung 1 đến 5: vũng xanh thẫm #285096, vài tia điện nhỏ màu #7fd4ff chạy lách tách ở mép, mỗi khung tia điện ở chỗ khác. Khung 6 đến 8: vũng SÁNG RỰC: lòng chuyển xanh trắng #c8f0ff, tia điện trắng #ffffff và vàng nhạt #fff6b0 toả khắp vũng hình zíc zắc (khung 7 sáng nhất). Viền ngoài mảnh #14182e. Không bóng đổ, không chữ, không logo, không con sứa.
```

## 4. `hu-bua-tam-giac` — lá bùa và tam giác bùa của Tiểu Yêu (Lâu đài cổ)

Ảnh mẫu cần gửi: `tieuYeu.sprite.json` và `hu-dan-bua.sprite.json`.

```
Vẽ MỘT tấm ảnh pixel art 2D: dải 6 khung xếp NGANG trên một hàng, các khung CÁCH XA NHAU, nền trơn một màu xanh lá #00FF00. Nội dung: MỘT LÁ BÙA giấy vàng #f4e070 hình chữ nhật đứng (khoảng 6 × 10 điểm ảnh) cắm thẳng đứng xuống sàn, trên có ba nét chữ bùa đỏ #c8372d (chỉ là nét vạch, không phải chữ đọc được), viền tối #14182e. 6 khung: lá bùa rung nhẹ, khung 4 đến 6 quanh chân lá bùa loé một vòng sáng cam đỏ #ff6a30 to dần (lá bùa sắp nổ). Khung 6 nối được về khung 1. Không bóng đổ, không chữ thật, không logo, không vẽ Tiểu Yêu.
```

## 5. `hu-vo-oc` — vỏ ốc trùm lên khi Ốc rút vỏ (Hang biển)

Ảnh mẫu cần gửi: `oc.sprite.json`.

```
Vẽ MỘT tấm ảnh pixel art 2D: dải 6 khung xếp NGANG trên một hàng, các khung CÁCH XA NHAU, nền trơn một màu xanh lá #00FF00. Nội dung: VỎ ỐC XOẮN đã đóng kín (con ốc rút hẳn vào trong), nhìn ngang hơi chếch trên, cao khoảng 16 điểm ảnh, xám xanh #96a0af, đường xoắn tối #5a6474, mảng sáng #dce6f0. Khung 1–2: vỏ đứng yên; khung 3–4: vỏ rung nhẹ sang trái phải; khung 5–6: một chút thân ốc ló ra ở miệng vỏ (sắp bò ra). Viền ngoài một nét tối #14182e. Không bóng đổ, không chữ, không logo.
```
