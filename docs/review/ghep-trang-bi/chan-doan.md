# Chẩn đoán hệ ghép trang bị (phiên "ghep-loi")

Ngày 10/10/2026. Đọc mã thật trên nhánh `khoi-tao-du-an` (bản sau `c6e299d`). Số dòng là số dòng lúc đọc, trước khi sửa.

## Kết luận nhanh (cho người không rành kỹ thuật)

- Mỗi món đồ AI hiện chỉ có **một số dời** (`lech`) tính từ **một chỗ** trên người (đầu hoặc thân). Không có "điểm neo" nào trên ảnh món đồ, cũng không có số nào riêng cho từng nhân vật.
- Với thân vẽ bằng code: chỗ "đầu", "thân" đi theo khung xương từng khung, nên đồ vẫn theo người khi chạy, nghiêng, lộn. Nhưng chỉ dời + xoay nguyên khối, không khớp vai, cổ, hông.
- Với thân AI: đồ dựng ở **tư thế đứng**, rồi game tự đo xem đầu và thân AI dời bao nhiêu (2 con số), lăn/ngã thì đo góc xoay. Không có điểm vai, tay, chân.
- Vì vậy món nào vẽ lệch cỡ hoặc lệch dáng so với nhân vật thì không có cách nào chỉnh riêng cho nhân vật đó.

## 5 nhận định trong YEU-CAU-CHATGPT.md

| # | Nhận định | Kết luận | Bằng chứng |
|---|---|---|---|
| 1 | Đồ AI nối qua `dinhNghia(sp)`, vị trí lấy từ `trang_phuc.lech`; mũ, mặt nạ theo neo đầu `H`; áo, đồ lưng, đồ tay, cánh theo neo thân `B`; là dời tĩnh | **ĐÚNG, nhưng chưa đủ** | `sprite_custom.js` `dinhNghia` dòng 602–621: `ve(F,…) → veVaoKhung(F, sp, L[0]+dx, L[1]+dy)`, `F` là `cx.H` (mũ dòng 605, mặt nạ dòng 611) hoặc `cx.B` (áo 606, lưng 607, đồ tay 609–610, cánh 616–617). Chỗ "chưa đủ": `H`, `B` là hệ toạ độ **đi theo khung xương từng khung** (`hero_tinhlinh.js` `drawKid` dòng 617–618, có xoay `ps.rot`, đầu lệch `ps.hdx/hdy/ha`), nên với thân code đồ không đứng yên hẳn. Đồ cầm tay đi theo **bàn tay xa** (`prop(cx,P,hx,hy)`, `drawKid` dòng 675), bùa đeo hông lắc theo bước (dòng 610), cánh có hai lá xoay theo nhịp vỗ (dòng 614–618). Tuy vậy vẫn chỉ là một số dời, không khớp hình. |
| 2 | `lopDo()` dựng đồ từ tư thế đứng rồi áp dời/xoay ước lượng; không làm áo ôm thân | **ĐÚNG** | `hero_tinhlinh.js` `lopDo` dòng 1189–1207: luôn `pose(fr.key,'none','idle',0,0)` (dòng 1199), cộng `neo` + `khop.dau/than` (dòng 1194), lăn/ngã thì gán `ps.rot/x/y` từ `khop` (dòng 1201) rồi gọi `kidSprite(..., 'aiSau'/'aiTruoc', ...)`. Không có bước nào đo vai, cổ, hông của thân AI. |
| 3 | `SC.khopEmBe()` ước lượng dời đầu/thân từ mặt nạ điểm ảnh; lăn/ngã tìm góc xoay tổng; không có điểm vai, khuỷu, hông, gối, chân | **ĐÚNG** | `sprite_custom.js` dòng 296–332: `doDoi` dò khớp 2 dải (đầu: hàng `y0-2 … y0+0,44h`; thân: `0,5h … 0,85h`), dời tối đa ±8 điểm ảnh → `{dau, than}`. `ne`/`die`: thử góc mỗi 15° → `{rot, x, y}`. Chỉ 2 cặp số hoặc 1 phép xoay cho cả người. |
| 4 | Cần xác minh `tach-do` lưu cấu hình theo cặp nhân vật–trang bị hay chỉ lưu dời mặc định trong món đồ | **ĐÚNG là chỉ lưu dời mặc định trong món đồ** | `tools/tach-do/index.html` dòng 764–765: `D.lech = … + c.dl` (nút nhích dòng 902), dòng 780 ghi `trang_phuc: { o, look, lech, lop, kieu, tay_ao }` vào chính tệp `tp-*.sprite.json`. Không có chỗ nào lưu theo nhân vật. `tools/tach-anh-hung` lưu `neo` (đầu, thân, tay, theo động tác) vào tệp **em bé** (dòng 944, 1016): theo nhân vật, nhưng chung cho mọi món đồ. Không có cấu hình theo **cặp**. |
| 5 | Không được kết luận mọi món phải biến dạng tự động; áo ôm thân / mũ đặc thù có thể cần biến thể riêng | **ĐÚNG (đồng ý)** | Game chỉ có dời + xoay nguyên ảnh (`veVaoKhung` dòng 570–590), không kéo méo. Áo vẽ cho dáng thân này mặc lên thân khác dáng nhiều sẽ hở/thừa: cần ảnh biến thể (`cap.bien_the`) chứ không kéo ảnh. |

## Thêm 2 điều tìm thấy khi đọc mã

1. `game/build.py` hàm `custom_sprites` (dòng 110–143): tệp nào không phải hiệu ứng, không phải đồ thì **bắt buộc có tấm sprite** (`tam`). Một tệp `ghep-smith.sprite.json` (không có ảnh) sẽ làm **hỏng bản đóng gói** (`sys.exit`). Phải sửa trước khi ai thêm tệp ghép.
2. `SC.add` (dòng 25–69) cũng coi tệp lạ là quái và báo "thiếu tấm sprite". Phải thêm nhánh đọc `doi_tuong: "ghep"`.

## Nguyên nhân gốc

Thiếu hai thứ dữ liệu: (a) **điểm neo trên ảnh món đồ** (cổ, vai, đỉnh đầu, chỗ mọc cánh…), (b) **điểm neo trên từng nhân vật ở từng khung**. Có (a) và (b) thì đặt đồ = cho điểm trùng điểm; thiếu thì chỉ còn một số dời chung, không thể đúng cho mọi nhân vật và mọi động tác.

## Tệp cần sửa (phiên này)

- `game/js/sprite_custom.js`: đọc tệp `ghep-*`; đọc `trang_phuc.diem`, `co_chuan`; tính chỗ đặt theo điểm (quy tắc mục 4 của `DINH-DANG-GHEP.md`); API `diemNhanVat`, `datDo`, `chuaChinh`, `capVuKhi`.
- `game/js/hero_tinhlinh.js`: tính bộ điểm thân code từ khung xương từng khung; truyền điểm + khung đang vẽ vào chỗ vẽ đồ; thứ tự lớp `sau/than/truoc/truoc_tay`; khoá bộ nhớ đệm có điểm/cap; vũ khí dời/xoay theo `cap`.
- `game/build.py`: cho phép tệp `ghep-*` (không ảnh).
- Không cần sửa `outfit.js`, `tailor.js` (chỉ là số liệu, luật may đồ).

## Rủi ro

- Làm đổi hình khi không có dữ liệu mới → giữ nguyên **đường cũ** từng dòng: món không có `diem` và nhân vật không có `cap` thì gọi đúng hàm cũ với đúng số cũ. Kiểm bằng so ảnh khác 0 điểm ảnh.
- Chậm khung hình → mọi phép tính nằm trong lúc dựng khung (đã có bộ nhớ đệm), không tạo canvas mỗi khung.
- Ô đồ (hình món đồ đứng riêng) → giữ như cũ, không áp điểm/cap.
- Không đụng lối chơi, tầm đánh, thời gian, bản lưu: chỉ đổi chỗ vẽ ảnh.

## Phương án tối thiểu

1. `build.py` + `SC.add` nhận tệp `ghep-*` (chỉ dữ liệu).
2. Một hàm điểm thân code (từ `B`, `H`, bàn tay, bàn chân, điểm cầm) dùng chung cho lúc vẽ và cho API.
3. Một hàm "tính chỗ đặt" dùng chung cho game và công cụ: 1 điểm chung → trùng điểm; ≥2 điểm → trung bình + co đều (0,85–1,15) + xoay nhẹ (±20°); không có điểm chung → như cũ; cộng `cap`.
4. Vẽ ảnh qua `veVaoKhung` có thêm co giãn (mặc định 1 = như cũ).
5. Thứ tự lớp theo `cap.lop` bằng hàng đợi trong `drawKid`.
