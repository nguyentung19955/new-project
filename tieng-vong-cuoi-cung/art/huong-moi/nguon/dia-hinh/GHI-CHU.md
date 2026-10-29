# Ảnh nguồn địa hình + đồ phòng thử (hướng "Cổ tích chuông tàn")

Theo art/huong-moi/TU-VAN-CHUYEN-GIA-3-MOI-TRUONG-PHONG-A-F.md (prompt A–D). Nền trắng, cần tách nền + chuẩn hoá cỡ.

| File | Là gì | Ghi chú |
|---|---|---|
| bo-dat-3x3.png | Bộ đất 3×3: hàng trên (mép trên trái / giữa / phải), hàng giữa (cạnh trái / thân / cạnh phải), hàng dưới (mép đáy trái / giữa / phải) | Rễ lớn, đúng quy mô 128–256 px logic. Kiểm liền mép trước khi dùng |
| canh-day-re.png | Prompt A: cạnh đứng trái (đầu/giữa/cuối), cạnh đứng phải (đầu/giữa/cuối), mép đáy trái/giữa/phải | Bổ sung cho bộ 3×3 (cột, hành lang C, đáy bệ) |
| van-mot-chieu.png | Prompt B: 2 bộ ván một chiều, mỗi bộ đầu trái / giữa / đầu phải | Mặt đứng phẳng; giá đỡ chỉ chĩa xuống |
| diem-luu-moi.png | Prompt C: vòm rễ treo chuông, 2 trạng thái (tắt / đã lưu – dấu ngà) | Rêu hơi dày + xanh hơn hướng: giảm bão hoà rêu bằng code, không gen lại |
| hinh-nom.png | Prompt D: hình nộm cột gỗ quấn vải, đĩa đồng, gốc rễ | Cao 96–112 px logic |
| goc-lom.png | 4 góc lõm (28/10): trên trái = sàn lõm trái, trên phải = sàn lõm phải, dưới trái = trần lõm trái, dưới phải = trần lõm phải | Khấc ~½ ô; khớp khuôn goc-lom-*.png |
| mat-san-bien-the.png | 2 biến thể mặt trên giữa (28/10): trên = mắt gỗ lớn, dưới = rễ ngang | Phải nối liền với mặt trên giữa gốc của bo-dat-3x3 |
| be-re-mong.png | Bệ rễ mỏng ít rêu (28/10): đầu trái / giữa / đầu phải | Theo góp ý chuyên gia PH8 (bệ mỏng bớt giống bụi cây) |

## Đất mới 28/10 – đã dùng 3 ảnh góc lõm / biến thể sàn / bệ rễ mỏng

Xử lý bằng `art/huong-moi/dia-hinh/code/tao-dat-bo-sung.py` (nạp nguyên các hàm tách nền / ép mép / đoạn khớp của `tao-bo-moi.py`, không sửa bộ cũ)
→ `dia-hinh/dat-bo-sung.png` + khoá `bo_sung` trong `dia-hinh.json`. Ảnh kiểm: `dia-hinh/xem-thu/bs-*.png`. **Cả 3 ảnh dùng được – không cần gen lại.**

| Ảnh | Kết quả | Lưu ý khi dùng |
|---|---|---|
| goc-lom.png | Dùng được. Mặt tường thẳng tuyệt đối (x 484 / 1051 mọi hàng), khấc đúng ½ | **Tên theo hình, không theo nhãn**: khuôn `goc-lom-*` đặt tên theo phía có TƯỜNG → ô trên-trái (tường bên phải) = `goc-lom-san-phai`, trên-phải = `goc-lom-san-trai`, dưới-trái = `goc-lom-tran-phai`, dưới-phải = `goc-lom-tran-trai`. **Tỉ lệ**: AI vẽ cùng cỡ rễ với bo-dat-3x3 (mảnh 440 px ≈ 211 logic), KHÔNG phải ô 64 logic – nén cả mảnh thì cuộn rễ nhỏ đi 3 lần. Nên cắt **cửa sổ 64×64 logic quanh điểm góc** ở cùng tỉ lệ 0,48 (đúng khuôn: điểm góc ở giữa), mép mờ 8 logic. Rêu trên sàn dày 8 logic → ép còn ≤ 3; giọt rêu trần ép còn ≤ 4; nền trắng kẹt giữa giọt rêu đã bỏ |
| mat-san-bien-the.png | Dùng được, nối liền mặt trên gốc cả 2 phía (chênh màu ở chỗ nối 5,5–6,2 so với 3,6 giữa 2 cột kề trong đoạn; nối gốc–gốc là 4,0: mắt thường không thấy) | Vẽ to hơn bo-dat ~1,35 lần (dải sáng mặt trên 55 px so với 40) → tỉ lệ 0,36. Mắt gỗ nằm sâu (~250 px dưới mặt) → phần dưới dải sáng nén dọc 0,75 để mắt gỗ lên khỏi vùng mờ đáy dải |
| be-re-mong.png | Dùng được – đúng ý "bệ rễ mỏng, bụng ít rêu" | Tỉ lệ 0,36 (thân dày 90 px ≈ 32 logic = đúng 1 ô). Đầu rễ thõng tối đa 20 logic dưới ô (như giá đỡ ván). Khe giữa rễ thông ra nền trắng trong vùng collider đã lấp màu kề (thân kín đúng ô) |

Nếu muốn gen lại để đỡ phải cắt / nén (không bắt buộc), prompt ngắn:
> Same art style as the attached tiles. White background. One 2D side-view inner-corner tile set, 4 pieces, each EXACTLY 256×256 px with the corner point at the exact center (128,128): floor meeting a taller wall on its right / on its left, ceiling meeting a wall hanging down on its right / on its left. Thin moss only (max 12 px above the floor line), straight wall faces, roots the same size as the attached tiles, no frame, no shadow outside the shape.

- `man-re-ru-manh.png` (29/10 khuya, PH15 mục 4): bộ mảnh MÀN RỄ RỦ – hàng trên 1 búi rễ trần, giữa 7 dải rễ (đầu trên phẳng), dưới 4 đầu rễ cong. Dựng bằng
  `art/huong-moi/dia-hinh/code/tao-man-re.py` → `art/the-gioi-moi/dia-hinh-v4/man-re-3x.png` + `man-re.json`; chuyển động trong `game/runtime/trang-tri-dia-hinh.js` (`veManRe`). Thay cổng dọc ở mọi trang.
