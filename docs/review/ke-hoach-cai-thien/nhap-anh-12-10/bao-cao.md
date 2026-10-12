# Phiên nhập ảnh 12/10 — 6 ảnh ChatGPT vào game

Ảnh gốc: `docs/anh-goc/2026-10-12/`. Kiểm trong game bằng Chromium không màn hình (bản một tệp và bản hai tệp): 0 lỗi trang (pageerror), `G.spriteCustom.loi` rỗng.
Script dùng trong phiên để làm lại được: `kiem/` (đường dẫn trong script trỏ `/home/claude/new-project`, sửa nếu chạy chỗ khác).

| # | Ảnh | Tệp trong game | Số khung | Cần gen lại? |
|---|---|---|---|---|
| 1 | nl-do-cu-do.png | `game/art/custom/nl-do.sprite.json` (thay) | đứng 6, nói 6 | Không |
| 2 | em-be-wrestler-don.png | `game/art/custom/em-be-wrestler-don.sprite.json` (MỚI, tệp đòn đầu tiên trong game) | kiếm, cung, giáo, búa, chưởng: mỗi hàng 6 | Nên gen lại khi rảnh (màu da, quần khác thân gốc, xem dưới) |
| 3 | chay-smith.png | hàng chạy của `em-be-smith.sprite.json` | 8 | Không |
| 4 | chay-hunter.png | hàng chạy của `em-be-hunter.sprite.json` | 7 (bỏ khung 1) | Không |
| 5 | chay-wrestler.png | hàng chạy của `em-be-wrestler.sprite.json` | 7 (bỏ khung 1) | Không |
| 6 | hoTinh-pha1.png | `game/art/custom/hoTinh.sprite.json` (thay) | đứng 6, chạy 6, lấy đà 4, tấn công 6, trúng đòn 4, chết 8 | Không bắt buộc; ảnh to hơn sẽ nét hơn |

## 1. Cụ Đồ (nl-do)
- Cắt bằng chính trang `tools/tach-anh-hung`, mục "Cụ Đồ (nl-do)", tự tìm hình. Trang tự nhận đúng lưới kẻ **7 cột × 2 hàng** (cột 7 trống bị bỏ), không lệch, không cần thêm cột.
- Khung 0 hàng đứng: mắt mở, đứng thẳng, cầm bút lông và cuộn câu đối — đẹp, hợp với người làng đứng yên (G.NL_DONG).
- Cao 28 điểm ảnh game như cũ, khung 56×52, chân (28, 49), nét ×2. Tệp nhẹ hơn bản cũ (49 KB → 39 KB).

## 2. Cu Lì · Đòn theo vũ khí (em-be-wrestler-don)
- Cắt bằng `tools/tach-anh-hung`, mục "Cu Lì (Đô Vật) · Đòn theo vũ khí": lưới kẻ 8 × 5 nhận đúng, 5 hàng × 6 khung, 2 ô cuối mỗi hàng trống được bỏ.
- Xử lý thêm sau khi xuất:
  - xoá đốm nền xanh lọt trong vòng đuôi, cánh tay (183 điểm);
  - viền ám xanh lá tối quanh hình → đổi sang màu viền chuẩn `#14182e`, rồi gọt viền đôi thành 1 điểm;
  - **đổi màu da**: ảnh ChatGPT vẽ da hồng/đào, còn thân gốc Cu Lì trong game da tím hoa cà → đổi các điểm da sang tông tím (giữ sáng tối) để khi đứng đánh không bị "đổi người".
- Trong game (đã kiểm): game ghép tệp đòn vào thân (`donMa = em-be-wrestler-don`, thêm hàng 7–11). Cầm kiếm/cung/giáo/búa đứng đánh chọn đúng `atk_sword/atk_bow/atk_spear/atk_hammer`, ra chưởng chọn `cast`. Tay tự đo (G.DON_VK) đặt vũ khí vào nắm tay ở mọi khung đã xem; mũ, hồ lô, bùa bám thân (khopEmBe). Ảnh: `cu-li-don-va-chay-trong-game.png` (5 hàng đầu).
- **Vấn đề còn lại**: ChatGPT vẽ Cu Lì mặc **quần dài xám** và mắt đỏ, còn thân gốc là **khố da báo nâu, chân trần**, mắt cam. Đã chữa màu da, nhưng quần khác nên lúc đổi từ đứng sang đánh vẫn thấy khác áo quần. Muốn khớp hẳn: gen lại ảnh đòn, gửi kèm ảnh tham chiếu thân (nút "Tải ảnh tham chiếu thân" trên trang) và nhắc "khố da báo nâu, chân trần, da tím hoa cà".

## 3–5. Hàng chạy 3 em bé (Cu Tí, Cu Tèo, Cu Lì)
Chưa có công cụ nên tự cắt (`kiem/chay.py`):
- Tìm vạch kẻ thật (8 ô), xoá nền xanh lá (kể cả viền lem xanh, giữ nguyên màu lá cây của Cu Tèo), giữ mảng hình chính.
- Co cùng một tỉ lệ cho cả 8 ô sao cho chiều cao bằng khung đứng thở của chính tệp đó (58 điểm ảnh ở nét ×2 = 29 điểm ảnh game). Đường đáy chung của hàng đặt đúng điểm chân (24, 45); **khung bật nhảy giữ độ nhấc lên như ảnh gốc** (hàng chạy tự nhún).
- Canh ngang theo tâm đầu + thân (không theo chân) cho khớp khung đứng → người không trượt qua lại.
- Đổi màu về đúng bảng 48 màu sẵn có của tấm thân (cùng tông, tệp không nặng thêm: Cu Tí 148→138 KB, Cu Tèo 187→186 KB, Cu Lì 177→179 KB).
- Thay hàng `move`: Cu Tí 8 khung / 0,65 s; Cu Tèo và Cu Lì **7 khung / 0,6 s** — khung 1 của hai ảnh này là dáng đứng nhìn thẳng (xem `chay-truoc-sau.gif`, cột đầu), để trong vòng chạy sẽ giật nên bỏ. Khung 1 của Cu Tí là dáng chạy thật nên giữ đủ 8.
- **Nhún code**: hàng chạy mới đã tự nhún ở 2 khung bật nhảy, nên tắt G.NHUN_BUOC riêng cho 3 thân này: tệp ghi `"nhun_buoc": false`, `js/sprite_custom.js` đọc thành `sp.nhunBuoc` và `SC.nhunBuoc()` trả 0 cho thân đó (build.py giữ khoá `nhun_buoc`). Thân Cái Bống và các thân theo bộ trang phục vẫn nhún như cũ.
- Đồ bám: khopEmBe đo lại từng khung chạy mới (đầu nhấc tới −5 điểm ảnh ở khung bật nhảy), mũ, hồ lô, vũ khí đi theo. Ảnh: `cu-li-don-va-chay-trong-game.png` (3 hàng cuối, cầm giáo + nón lá).
- GIF so sánh: `chay-truoc-sau.gif` (trên: hàng cũ 6 khung gần như một dáng; dưới: hàng mới).
- Lưu ý: 9 thân **theo bộ trang phục** (em-be-*-rung/bien/lau) vẫn dùng hàng chạy cũ — chưa có ảnh.

## 6. Hồ Tinh pha 1 (hoTinh)
- Thử trang `tools/tach-quai` (mục "Hồ Tinh (hoTinh)", bỏ khung bằng cách chạm như người dùng): trang vẫn cắt mất mảng hình thành **góc vuông** (tai, chóp đuôi, chân sau bị khuyết). Không nhận bản đó.
- Tự cắt theo vạch kẻ thật (`kiem/hotinh.py`), cùng định dạng tệp cũ: khung 208×128, nét ×2, điểm chân [104, 124], cùng thời lượng, chết có `mo: 0.6`.
  - Chọn khung: chạy 7 → 6 (bỏ khung 7); tấn công 8 → 6 (giữ 1, 2, 4, 5, 6, 8 — bỏ khung 3 lấy đà lại và khung 7, giữ đủ các khung vệt lửa lớn); trúng đòn 5 → 4 (bỏ khung 5).
  - Nền xanh lá xoá sạch; viền ám xanh → màu viền chuẩn; **lấp 1 382 điểm lỗ nhỏ kín** trong thân bằng màu điểm ảnh lân cận.
  - Một phép biến đổi cho mọi khung (giữ nguyên chỗ đứng họa sĩ vẽ trong ô, nên cú vồ vẫn lao tới), đường đáy mỗi hàng đặt đúng điểm chân.
  - 64 màu để lửa giữ được cam vàng. Tệp 1,70 MB → 1,38 MB.
- Đã so với ảnh gốc: đủ 4 chân, móng, 9 đuôi, đèn lồng, mặt nạ; không còn thủng. Ảnh trong game: `ho-tinh-trong-game.png` (vẽ bằng chính hàm vẽ quái của game `SC.veQuai`).
- Ghi chú: ảnh gốc nhỏ (mỗi ô ~181 điểm) nên phải phóng to ~1,6 lần — nét hơi to. Muốn nét hơn: gen lại cỡ ô lớn hơn. Ảnh pha 2, pha 3 đã có trong `docs/anh-goc` nhưng không thuộc phiên này (chưa nhập).

## Kiểm
- `python3 game/build.py` và `LK_HAI_TEP=1 python3 game/build.py --hai-tep` chạy được. Sau khi gộp với các phiên song song (đã có thêm đòn Cu Tí, Cu Tèo): hai tệp 25,07 MB / trần 26 MB; tệp đầu 5,06 MB. Cảnh báo "tệp đầu nên dưới 5 MB" có từ trước phiên này; phần của phiên này làm tệp đầu nhẹ đi ~0,02 MB (đo trước khi gộp: 5,05 → 5,03 MB).
- 0 pageerror ở `linh-khi.html?cloud=0` và `linh-khi-nhe.html?cloud=0`. Không đụng đăng nhập, lưu mây.
