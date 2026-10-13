# Báo cáo: đưa Ngư Tinh MỚI (mực khổng lồ) vào game — 13/10

Commit ảnh + gói game: **`4e768f74`** (nhánh `khoi-tao-du-an`). Không chạy game, không Playwright: chỉ xử lý ảnh, ảnh soát tĩnh, `node --check`, `python3 game/build.py`.

## Đã làm
- Thay `game/art/custom/nguTinh.sprite.json`, `nguTinh-p2.sprite.json`, `nguTinh-p3.sprite.json` bằng mực khổng lồ cầm đôi rìu san hô, dựng từ khung đã cắt trong `docs/anh-goc/trum-moi/ngu-tinh/*-cat`.
  - Pha 1: 6 hàng idle 6 · move 6 · tele 8 · atk 4 · hit 4 · die 6 (`mo` 0,6 như cũ).
  - Pha 2, 3: 4 hàng idle 6 · tele 8 · atk 4 · hit 4. Không có move/die thì mượn pha 1 theo `PHA_HANG`, như trước.
  - Ô khung 142×146 điểm game, nét ×2, gốc [59, 141]. Mỗi pha một bảng 128 màu, lưu PNG bảng màu. Cỡ tệp: 787 / 706 / 693 KB (cá cũ: 565 / 155 / 163 KB). Cả nhà Hồ Tinh hiện nặng 2,16 MB.
  - Giữ `rong` 152, `cao` 105 như cũ, nên bóng và các chỗ khác đọc hai số này không đổi. Hộp va chạm (`BODY` trong boss.js) không đụng.
- **Co cỡ**: cả hàng dùng một hệ số, không co riêng từng khung, nên động tác không bị phập phồng.
  - Trong một pha: hệ số đo bằng khớp đặc trưng SIFT với mọi khung đứng của pha đó, lấy trung vị. Hàng có ít điểm khớp thì đo tay khoảng chóp mũ vây → mắt để kiểm.
  - Giữa các pha (màu khác nhau, SIFT không khớp được): đo tay ở khung đứng, ra pha 2 = 1,12 và pha 3 = 1,235.
  - Hệ số so với hàng đứng pha 1:

  | | đứng | trườn | báo đòn | đánh | trúng đòn | chết |
  |---|---|---|---|---|---|---|
  | Pha 1 | 1,00 | 1,18 | 1,41 | 1,12 | 1,75 | 1,22 |
  | Pha 2 | 1,12 | – | 1,28 | 1,02 | 1,50 | – |
  | Pha 3 | 1,24 | – | 1,29 | 1,15 | 1,55 | – |

  - Đường đất: đáy xúc tu theo trung vị chân của từng hàng.
  - Neo ngang: trong một hàng, mép trái đám xúc tu đứng yên. Cả hàng được dời để giữa đám xúc tu (đã bỏ nước/băng) nằm ở gốc.
  - Mực pha 1 khi đứng cao khoảng 111 điểm game, bằng cá cũ (111).
- **Hướng**: ảnh nhìn sang phải, không ghi `huong`, nên dùng quy ước lật cũ.
- **Nhịp đòn (mục 4)**: code có mốc gây sát thương.
  - Chiêu cX của trùm vùng: `u < 0,4` vẽ tele, sau đó vẽ atk. Vùng đỏ nổ ở `moc[0]` (0,38–0,45 tuỳ chiêu), tức ngay đầu hàng atk.
  - Vì vậy hàng **atk bắt đầu đúng khung rìu chạm đất**: pha 1 từ khung 3; pha 2 từ khung 3, nên khung 3–4 rơi vào lúc nổ; pha 3 từ khung 3, và khung 5 (nhát thứ hai) nằm ở cuối hàng.
  - Hai khung vung rìu trước đó (khung 1–2) được nối vào cuối hàng tele. Hàng tele gồm 6 khung báo đòn + 2 khung vung, tổng 8 khung.
  - Không sửa code, không dùng `khung`/`cham` (xếp thẳng vào tấm).
- Không đổi máu, sát thương, kỹ năng. Không đụng Hồ Tinh, Mộc Tinh, đăng nhập, lưu mây, `?cloud=0`, `firebase-config.js`.

## Tệp
- `xem-ngu-tinh.png`: mọi hàng × 3 pha, cùng tỉ lệ (2 điểm ảnh = 1 điểm game). Trên cùng là cá cũ để so cỡ. Đường đỏ là đất/gốc, đường vàng là đỉnh mũ vây ở khung đứng pha 1.
- `cong-cu/dung-ngu-tinh.py`: dựng 3 tệp (`--ghi` để ghi vào game). Đi kèm `cong-cu/neo.py` (đo neo) và `cong-cu/xem-ngu-tinh.py` (vẽ ảnh soát).

## Cần xem khi chạy thử (phiên này không chạy game)
- Tên tệp pha 3 đổi thành "Ngư Tinh · pha 3 (cuồng nộ)".
- Hàng tele có 8 khung cũng dùng cho cảnh chuyển pha. Nửa sau cảnh chuyển pha sẽ thấy mực vung rìu, cần xem có hợp không.
- Ô khung cao hơn cá cũ (146 so với 116) vì cột nước/băng ở hàng báo đòn pha 3. Thân mực vẫn cùng cỡ cá cũ.
