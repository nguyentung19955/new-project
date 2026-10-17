# Lam VẼ TAY – sprite CHUẨN tư thế đứng (P1, vòng 1)

Thư mục này là kết quả bước đầu của **P1 – vẽ pixel art theo mẫu gốc** (quyết định đã chốt): sprite đứng 64×64 vẽ tay từng pixel theo
`art/nhan-vat/lam-48/nguyen-con-v2-mat-sang.png`, không dùng render 3D. Script lặp lại được: `python3 proto-lam/ve-tay/lam-chuan.py`.

| Tệp | Nội dung |
|---|---|
| `lam-chuan.png` | sprite 64×64, nền trong suốt (alpha chỉ 0/255), pivot [32,63] |
| `lam-chuan-x4.png`, `lam-chuan-x8.png` | phóng nearest để xem |
| `lop/*.png` + `lop.json` | 10 lớp bộ phận 64×64 trong suốt, thứ tự vẽ, điểm neo |
| `lop-x4.png` | từng lớp tách rời + ảnh ghép lại |
| `so-sanh.png` | mẫu gốc thu 64 (đa số màu) · sprite · cả hai ×8 cạnh nhau |
| `trong-game-x1.png` / `-x4.png` | 480×270 nền Làng Chuông, Lam đứng trên lối đi (x=380, chân y=241) cạnh Quái Chuông Gỗ |
| `lat-x4.png` | bản lật ngang – kiếm vẫn ở tay xa |
| `tham-chieu-luoi.png` | mẫu gốc thu 46 px phủ lưới 64 có toạ độ (×24) – dùng để vẽ tay tiếp, KHÔNG phải sprite |
| `kiem-tra.json` | số liệu máy đo (màu, alpha, kích thước, pixel lẻ, viền ngoài, ghép lớp) |

## Cách làm (thật)

1. Không scale/xoay tự động, không blur. Mẫu gốc chỉ được thu về 46 px cao và phủ lưới 64 (ảnh `tham-chieu-luoi.png` + `out/danh-gia/goc-64.png`) để
   đọc toạ độ từng chi tiết; sau đó **toàn bộ sprite được gõ tay thành bản đồ ký tự 64×64** trong `lam-chuan.py` (`BAN_DO`: mỗi hàng là
   danh sách (cột bắt đầu, chuỗi); mỗi ký tự = một màu trong bảng 12 màu + bộ phận). Chuông + khoen + dây là lớp phủ riêng (`CHUONG`) đè lên mũ/vai.
2. Màu phẳng, 11/12 màu bảng được dùng (chưa dùng #21413A), không thêm màu. Viền ngoài 1 px #0C0F14 liền; giữa các bộ phận kề nhau có viền trong
   #0C0F14 (mũ|thân, thân|tay xa, tay xa|chắn kiếm, áo choàng|chân, hai ủng tách bằng khe trong suốt 2 px).
3. Script tự kiểm: pixel màu kề ô trong suốt (= hở viền) = **0**; đốm 1 px không có lân cận cùng màu = **1** (tâm xanh của trâm, cố ý);
   12 màu/alpha 0,255; ghép 10 lớp theo `thuTuVe` **trùng từng pixel** `lam-chuan.png` (`ghepLopTrungTungPixel: true`).

## Số liệu

- Kích thước ô 64×64; hộp nhân vật cột 9–56, hàng 18–63 → **cao 46 px, rộng 48 px** (gồm kiếm); 1 117 pixel đặc.
- Pivot [32,63]: hai bàn chân chạm hàng 63 (cột 21–28 và 30–39), tâm thân ở cột ~32 (hông gần cột 24, hông xa cột 34).
- Màu: 11 (#0C0F14 ×335, #1A212B ×128, #212835 ×125, #2C3546 ×173, #4A5A6E ×40, #32804F ×206, #83CC93 ×21, #9C6B30 ×15, #E1B85A ×30,
  #F3E6C8 ×23, #CEF0D6 ×21; #21413A ×0). Alpha chỉ {0, 255}. Không màu ngoài bảng.
- Lớp (pixel): mũ 310 · thân+đai+trâm 160 · áo choàng sau 166 · tay xa+kiếm 137 · áo choàng trước 97 · chân xa 93 · chân gần 84 · chuông 66 · tay gần 47 · mắt 4.

## Bảng tiêu chí duyệt

| Tiêu chí | Đạt? | Lý do / ghi chú |
|---|---|---|
| Nhìn ×1 nhận ra đúng Lam (so với mẫu gốc thu 64 đặt cạnh, `so-sanh.png`, `trong-game-x1.png`) | **Đạt** | mũ trùm tối có mép xanh, chuông vàng bên trái, áo choàng tối lót xanh xoè sau, áo thân xanh, kiếm sáng tay xa, hai ủng – silhouette bám mẫu (sai lệch ≤ 1–2 px ở từng mép) |
| Hai mắt sáng | Đạt | 2 vệt #F3E6C8 cao 2 px tại (cột 33, hàng 30–31) và (cột 35, hàng 31–32), mắt xa thấp hơn 1 px như mẫu |
| Chuông có vành / chỏm sáng / quả lắc, KHOEN tròn vàng, dây | Đạt một phần | chuông 7×5 + vành 8 px #9C6B30 + chỏm/điểm sáng #F3E6C8 bên trái + quả lắc 2 px; khoen 4×4 vàng có lỗ 2×2; "dây" chỉ là 2 px tối nối khoen–chuông (mẫu cũng rất ngắn). Chuông thấp hơn mẫu 1 px (xem mục chưa giữ đúng) |
| Mũ nhọn, gập về sau, có nếp | Đạt một phần | cạnh trên-trái thẳng chéo + mảng tối #212835 phía sau + nếp đen dọc cột 22 (hàng 23–27) và cụm đen ở góc (21–22, 22–24) như mẫu; ở 46 px đỉnh mũ không nhô "nhọn" ra ngoài silhouette – mẫu gốc thu 64 cũng không |
| Mép mũ xanh quanh khoang mặt | Đạt | dải xanh 2 px dọc cạnh trên-phải (19–24) rồi vòng xuống bên trái mặt (25–33) + cằm (34–35); điểm sáng #83CC93 ở góc (24, 36–37) |
| Áo choàng nhiều lớp quấn ra trước + lót xanh | Đạt một phần | dải lót xanh ở cổ (H2: hàng 39–43), mép vạt trước (41–44, 26–29), hai dải lót đuôi áo (xa: 46→53, gần: 48→60), dải mép sáng #2C3546 ở cạnh ngoài trái, hai đuôi nhọn; vạt trước ở ngực chủ yếu bị nắm tay che nên lớp `ao-choang-truoc` nhỏ |
| Trâm, đai chéo ngực | Đạt một phần | trâm vòng 3×3 #F3E6C8 tâm xanh tại (33–35, 38–40); đai chéo chỉ 6 px #1A212B chéo (37,28)→(39,32) – ở ×1 khó thấy |
| Gấu áo thân rách | Đạt | 3 răng (cột 28–29, 31–33, 35) hàng 51–53; mẫu có 4 răng |
| Găng / ống tay xám sáng có cổ tay | Đạt | nắm tay gần #4A5A6E 5×4 + điểm sáng cổ tay 2 px #F3E6C8 (cột 23, hàng 48–49); ống tay #2C3546 |
| Kiếm: CHẮN ngang vàng + chuôi + lưỡi #CEF0D6, ở tay XA | Đạt | chắn dọc 2 px (cột 40–42, hàng 44–52) có điểm sáng + bóng #9C6B30, lưỡi 14 px (cột 43–56) 2 hàng #CEF0D6 + 1 hàng xanh, mũi vát; kiếm nằm bên phải nhân vật (tay xa), lật ngang vẫn tay xa (`lat-x4.png`) |
| Hai ủng cao có vạch xanh + khoá + mũi nhô | Đạt | vạch xanh cổ ủng (56–57), khoá 2 px #4A5A6E, mũi xanh nhô về trước 2/3 px (62, 26–27 và 36–38); chân xa tối hơn chân gần 1 bậc |
| Màu phẳng, viền rõ, không pixel lẻ | Đạt | không dither; 0 pixel màu hở ra nền; 1 đốm 1 px cố ý (tâm trâm) |
| Các bộ phận không dính thành khối tối | Đạt | viền trong giữa mũ/thân/tay/chắn/chân; áo choàng #1A212B tách với mũ #2C3546/#212835; khe 2 px giữa hai chân; vùng đen lớn nhất là khoang mặt (cố ý) |
| Không đổi thiết kế để dễ animation | Đạt | mọi chi tiết vẽ theo mẫu; không lược bỏ/đơn giản hoá vì lý do animation |
| Lớp ghép lại trùng từng pixel | Đạt | script kiểm, `lop.json → ghepTrungTungPixel: true` |

## CHI TIẾT CHƯA GIỮ ĐÚNG MẪU (nói thật)

1. **Chuông thấp hơn mẫu 1 px, khoen to hơn mẫu**: mẫu khoen ≈ 3,5×2,5 ô, chuông hàng 32–38; để lỗ khoen đọc được ở ×1 phải vẽ khoen 4×4 (lỗ 2×2)
   nên chuông dời xuống hàng 34–39. Dây treo không còn chỗ (2 px tối).
2. **Áo thân xanh hẹp hơn mẫu 2 cột** (cột 28–35 thay vì 28–37) và **kiếm dời sang phải 1–2 px** (chắn cột 40–42, lưỡi 43–56): để có viền 1 px liền giữa
   áo thân | tay xa | chắn kiếm | lưỡi thì không đủ chỗ; mẫu để các phần này dính nhau.
3. **Lưỡi kiếm dày 3 px** (2 sáng + 1 xanh) thay vì ≈ 4 px; mũi kiếm vát 2 bậc đơn giản hơn.
4. **Bàn tay xa sáng hơn ống tay** (#2C3546 trên #212835) – mẫu bàn tay xa tối; đổi để bàn tay không chìm vào áo choàng tối.
5. **Đai chéo ngực** chỉ 6 px, không có mép sáng như mẫu; **vùng ngực** chỉ có một dải sáng #4A5A6E chéo thay vì mảng sáng rộng.
6. **Trâm** không có viền đen riêng (3×3 đặt thẳng lên thân) – thêm viền sẽ thành 5×5, to hơn mẫu.
7. **Gấu rách 3 răng** thay vì 4 (thiếu cột). **Khe giữa hai chân 2 px** (mẫu ≈ 2,5).
8. **Vạt áo choàng trước**: phần vạt ở ngực mẫu có thêm nếp/lót thứ ba chạy song song (hàng 42–44, cột 17–24); ở đây gộp vào dải H2 và dải lót đuôi xa
   (bắt đầu hàng 46) – mất một nếp. Hai dải lót đuôi nhập làm một ở hàng 48–49 (mẫu cũng gần như vậy).
9. **Ống tay gần** là khối phẳng #2C3546 (43–45, 21–25), mẫu có bóng; **khoá ủng** là 2 chấm xám thay vì khoá có hình.
10. **Nếp mũ**: mẫu có hai nếp đen (một chéo dưới đỉnh, một dọc phía sau); ở đây gộp thành một nếp dọc + cụm đen góc.
11. **Chưa dùng #21413A** (mẫu có xanh sẫm nhẹ ở cạnh phải áo thân và tâm trâm) – có thể thêm ở vòng sau mà không thêm màu mới.
12. **Lớp tách** cắt từ bản đồ cuối: bộ phận bị che (thân dưới áo choàng/tay, đùi dưới gấu áo, mũ dưới chuông – riêng mũ thì nguyên vẹn vì chuông là lớp phủ)
    **không có pixel ẩn**; viền #0C0F14 dùng chung gán cho mọi lớp kề cạnh, 11 ô viền mồ côi gán lớp gần nhất (BFS). Khi làm animation phải vẽ bù
    phần bị che khi bộ phận trước dịch đi.

## Điểm neo (lop.json → diemNeo, [x, y] pixel trong ô 64)

pivot [32,63] · vai gần [23,43] · vai xa [38,43] · khuỷu gần [21,45] · cổ tay gần [24,47] · cổ tay xa [38,48] · chuôi kiếm [41,47] ·
hông gần [24,53] · hông xa [34,53] · gối gần [24,57] · gối xa [34,57] · cổ chân gần [24,61] · cổ chân xa [34,61] · cổ [31,36] · móc chuông [19,30] · trâm [34,39].
Thứ tự vẽ (sau → trước): ao-choang-sau, tay-xa+kiem, chan-xa+ung, chan-gan+ung, than+dai+tram, ao-choang-truoc, tay-gan, mu-dau, mat, chuong+day+khoen.

## Đề xuất bước tiếp (CHƯA làm)

- Vòng 2 sprite đứng: xử lý mục 1–2, 5, 8 ở trên (thử khoen 3×3 để chuông lên 1 px; thử bỏ viền giữa áo thân và tay xa để áo thân rộng 10 cột; thêm #21413A).
- **Run F0/F1**: giữ nguyên lớp mũ + mắt + thân + chuông (chỉ dịch 0–1 px theo nhún), vẽ lại chân/tay/áo choàng từng khung bằng cùng cách bản đồ ký tự,
  lấy mặt nạ ID 3D (`out/danh-gia/raw/run-F-id.npy`, `out/run/kiem-tra.json`) chỉ để biết chân/tay ở đâu; vẽ bù pixel ẩn ở lớp thân/đùi (mục 12).
- Sau khi Run F0/F1 được duyệt mới làm F2–F7, rồi Jump/Fall/Attack.
