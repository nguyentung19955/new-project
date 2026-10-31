# Bộ quái đầu tiên (cùng phong cách Mặt Nạ Trắng)

PixelLab vẽ (custom, Pro Flash, sidescroller, quay mặt sang trái). ChatGPT vẽ hiệu ứng đòn, Claude tách. Bảng màu theo tư vấn ChatGPT (`docs/tu-van-bang-mau-quai-chatgpt.txt`): vân trên thân quái đổi từ xanh sang đồng cũ–hổ phách (#77614B/#B39161/#E6B65C), tinh anh Người Gác Câm đỏ gạch (#88616A/#C46B54/#FFD28A), đòn quái vàng hổ phách (#FFF2C5…#694236). Nhân vật chính giữ riêng xanh lơ.

| Thư mục | Quái | PixelLab id | Khung |
|---|---|---|---|
| phu | Phu Đèn Lạc – cận chiến vung đèn | 89bff65c-63a0-4085-aad1-8bc7067f48d8 | 88x88 |
| bo | Bọ Vỏ Mộc – bọ hung 6 chân, sừng húc (bản mới) | 984246e0-ca03-44ee-8b8f-502fe0ddc80a | 80x80 |
| doi | Dơi Rễ – bám trần, lao | 2a9fbccb-9b27-42ef-ad3c-25424b42d7c2 | 76x76 |
| nam | Nấm Thở – phun bào tử | 4198a391-9630-4517-b403-b4fc9c2eb786 | 84x84 |
| gac | Người Gác Câm – tinh anh | 72b4bfd6-d654-4740-af8b-db7a8424cb85 | 108x108 |

Mỗi con: dung / di / danh / trung / chet (fNN.png). `fx-danh/`: xNN = hiệu ứng, cNN = ghép (phu: nhân vật ở (70,30); doi (50,25); nam (150,25)).

Ghi chú:
- Bọ Vỏ Mộc: tạo lại thành bọ hung thật (bản cũ giống rùa). PixelLab không cho lật ngửa nên `chet` là lật ngửa làm bằng code. fx-danh: bụi + tia húc sừng (bọ ở (50,30), khung 200x120).
- Người Gác Câm: đã lật gương cho quay trái. PixelLab 3 lần đều vẽ cú đập sai (ra sau lưng / quay mặt trước), nên `danh` dùng tư thế giơ găng ra trước + ChatGPT vẽ luồng sóng đấm (fx-danh, nhân vật ở (130,20), khung 250x140).
- Dơi Rễ `di`: bỏ 2 khung chớp sáng do PixelLab tự thêm.
