# Kiểm tra – Luồng A (Vùng 1, Đợt 1)

Ngày 01/11/2026. Chạy tự động bằng Playwright (Chromium) trên phòng THỬ `phong-thu/` (T1 → T2 tinh anh → T3 trùm), vì luồng B chưa đẩy phòng thật.
Kịch bản: `game/tools/kiem-thu-vung-1.js` (chạy máy chủ tĩnh ở thư mục `tieng-vong-cuoi-cung` cổng 8765 rồi `node game/tools/kiem-thu-vung-1.js`).
Một số bước dùng "bất tử" (để kiểm tra luật, không phải độ khó) và dịch chuyển nhân vật tới chỗ cần thử.

## Kết quả: 27/27 ĐẠT, không lỗi JS

```
ĐẠT Nhặt Mảnh Âm – [40,["T1-manh"]]
ĐẠT Nghỉ ở Chuông Lưu (lưu + gửi Mảnh Âm) – ["chuong",{"phong":"T1","cot":6,"hang":10},40]
ĐẠT Rời menu chuông
ĐẠT Chém tường nứt 3 phát → vỡ – [".",".",".",["T1:3:5","T1:3:6","T1:3:4"]]
ĐẠT Vào hốc nhặt Chuông Vỡ 1 – [1,48]
ĐẠT Đứng trên sàn mỏng + ↓+Nhảy rơi xuống – [true,2,306,449]
ĐẠT Nhặt Chuông Vỡ 2 trên sàn mỏng – [true,2,306,449]
ĐẠT Bám + leo dây – [true,312]
ĐẠT Đi qua cửa phải T1 → T2 (màn tối chuyển cảnh) – ["T2",58,450,true]
ĐẠT Vọng Tàn <50%: nhịp giả rồi nhịp thật – giả → thật → giả → thật → giả → thật → giả
ĐẠT Vào phòng tinh anh → khoá cửa – [true,true,2,44,["T2"],[],false]
ĐẠT Vọng Tàn tạo sóng đất – tối đa 2 sóng
ĐẠT Hạ Vọng Tàn → mở cửa – [true,true,2,44,["T2"],[],false]
ĐẠT Nhặt Lõi Vọng Tàn + Mảnh Âm rơi bay về – [1,60]
ĐẠT Cửa trùm bị khoá khi chưa đủ 3 Chuông Vỡ – ["T2","Cửa im lặng – cần 3 Chuông Vỡ (đang có 2)"]
ĐẠT Tường giả G không chặn
ĐẠT Đủ 3 Chuông Vỡ → mở khoá cửa trùm + thưởng – [3,0,true]
ĐẠT Tải lại trang: có bản lưu, nút Tiếp tục bật – [false,true]
ĐẠT Tiếp tục: về Chuông Lưu, giữ vật phẩm/tinh anh/tường vỡ – ["T1",3,1,["T2"],3,"."]
ĐẠT Chết → về Chuông Lưu, mất 30% Mảnh Âm chưa gửi, rơi túi – [70,{"phong":"T1","x":1013,"y":528,"so":30},"T1",6,6]
ĐẠT Nhặt lại túi – [100,null]
ĐẠT Mua Sinh lực +1 tại Chuông Lưu – ["chuong",7,1,"choi"]
ĐẠT Bản đồ nhỏ M bật/tắt – ["ban_do","choi"]
ĐẠT Qua cửa đã mở vào phòng trùm – ["T3",true]
ĐẠT Trùm: Gõ Không Tiếng + Mưa Mặt Nạ + chuyển pha – [true,true,2,{"go":3,"tha":3,"chuyen_pha":1,"song":4,"mat":6},"choi"]
ĐẠT Thắng trùm – [true,true,2,{"go":3,"tha":3,"chuyen_pha":1,"song":4,"mat":6},"choi"]
ĐẠT Màn "Hết Vùng 1" – ["het",true,true]
Lỗi JS: không có
```

## Kiểm tra thêm
- Phòng demo (`game/phong-demo/`) và trang thử (`game/thu-mat-na/`) sau khi sửa engine (và sau khi gộp bản engine mới của phiên chính): nạp xong, đi, nhảy, chém trúng – **không lỗi JS**.
- Điện thoại giả lập (844×390, cảm ứng, đa chạm): giữ cần sang phải **cùng lúc** chạm Nhảy → nhân vật vừa chạy vừa nhảy; nút hiện bán trong suốt ở 2 góc dưới; không lỗi JS.
- Ảnh chụp trong lúc thử: phòng T1/T2, hốc sau tường nứt, bản đồ nhỏ, trận trùm, màn Hết Vùng 1.

## Chưa kiểm được
- 60 FPS trên điện thoại thật (chỉ thử trên máy ảo).
- Phòng thật của luồng B (chưa có) – khi có, mở `index.html`, game tự dùng `ban-do.json` + `phong/`.
