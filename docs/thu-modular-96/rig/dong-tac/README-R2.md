# Đo khớp các động tác khác của Cu Tí mới (phiên R2, 16/10)

Thư mục này chỉ có **dữ liệu khớp** cho các động tác ngoài hàng chạy, để phiên R1 (trang `kiem-tra-rig.html`) nạp vào thử gắn giáp. Phiên này **không sửa** `kiem-tra-rig.html`, `rig.json`, `tao-rig.py`, code game hay ảnh nguồn.

## Nói ngắn gọn

| Thư mục | Động tác | Số khung | fps (theo game) | Hàng game dùng | Độ tin cậy | Khớp bị che (tổng) |
|---|---|---|---|---|---|---|
| `chay_thuong/` | chạy cầm thương 2 tay | 12 | 20 | `chay2tay` (hàng 27) | **khá** | 2 (khung 3) |
| `lon/` | lăn | 6 | 22,2 | `lon` (hàng 3) | **thấp** ở khung 2–4, khá ở 1, 5, 6 | 39 |
| `trung/` | trúng đòn | 4 | 20 | `trung` (hàng 4) | **khá** | 0 |
| `phitieu/` | ném phi tiêu | 6 | 15,8 | `phitieu` (hàng 19) | **khá** | 3 |
| `chet/` | chết | 8 | 13,3 | `chet` (hàng 5) | khá ở 1–5, **thấp** ở 6–8 (nằm úp) | 54 |

- **Tự kiểm đạt cả 5 động tác**: mọi khớp không ghi "che" đều nằm trong hoặc sát hình bóng (≤ 2 điểm ảnh) ở ô 96. Hình bóng dựng lại từ ảnh nguồn **trùng 100%** hàng trong game (màu lệch 2–3 đơn vị do nén ảnh game, không ảnh hưởng).
- **"Khá"** = đánh bằng mắt trên ảnh nguồn cao (lưới 10 điểm ảnh nguồn ≈ 1,5–2,6 điểm ảnh ô 96). Sai số ước chừng **1–2 điểm ảnh ô 96**, khuỷu tay và gối dễ lệch hơn vai/hông.
- **"Thấp"** = người cuộn tròn hoặc nằm úp, khớp chỉ là **đoán theo dáng**; các khớp đó đều ghi trong `hidden`.

## Mỗi thư mục có gì

| Tệp | Là gì |
|---|---|
| `sheet.png` | Sprite cả người, N khung × 96, cắt thẳng từ tấm `game/art/custom/zed-moi.sprite.json` (đúng như game vẽ, chân ở 48,90). Không có vũ khí. |
| `khop.json` | `{"action","frameCount","fps","frames":[{"frame","joints"}],"source","hidden":{khung:[khớp bị che]}}`, cùng 23 tên khớp như `data.json`. Toạ độ ô 96, gốc trên-trái. Số khung trong `hidden` đếm từ **1**; `frames[].frame` đếm từ **0** (như `data.json`). Có thêm `gameRow` (hàng, giây, lặp) và `notes`. |
| `khop-tay.json` | **Tệp chỉnh tay**: khớp đánh trên ảnh nguồn cao (tên khớp tiếng Việt như `khop-nguon.json`), danh sách khớp bị che (`an`), ghi chú. Sửa ở đây rồi chạy lại script. |
| `soat.png` | Que chồng lên sprite từng khung ×4. **Đỏ = trước, xanh = sau, vàng = đầu/thân.** Vòng rỗng = khớp bị che. |
| `soat-nguon.png` | Cùng que chồng lên ảnh nguồn cao (dễ soát hơn). |

Chạy lại: `python3 docs/thu-modular-96/rig/dong-tac/do-khop.py [tên ...]` (lỗi tự kiểm → mã thoát 1).
- `dat_khung.py` lấy lại đúng phép co/dời từng khung của `docs/anh-goc/zed/dung-zed-game.py` (co theo cỡ đầu từng hàng, dời theo chân hoặc tâm đầu, dời vào ô nếu tràn).
- Công thức quy đổi giống `tach_lop.doi_diem`: X96 = dx + (x + 0,5)·sx − 0,5.
- Tự động: `head` = tâm mảng da mặt (trừ khi ghi tay `dau`), `hipCenter` = giữa 2 hông, `beltTop`/`waist` như `tao-bo.khop_va_neo`. Riêng khi thân nằm hoặc nghiêng (lăn 1–5, chết 4–8), mép đai và eo được ghi thẳng thành điểm.

## Quy ước trước / sau

- **Tay TRƯỚC** = tay lộ bắp tay trần, vẽ đè lên thân, nằm bên trái hình khi đứng (giống `khop-nguon.json` của hàng chạy). **Tay SAU** = tay kia, thường duỗi về phía trước (bên phải).
- **Chân**: chỉ phân theo hình vẽ, vì ảnh gen không giữ đúng một chân.
  - Khi đứng dạng chân (trúng đòn, phi tiêu, chết 1–3), hai chân không chồng nhau. Khi đó chân bên trái hình (cùng phía tay trước) = **trước**.
  - Chạy: chân vẽ đè / chân trụ / chân bước tới = **trước**.
  - Lăn: chân duỗi ra sau ở khung 1 = **sau**, giữ theo vị trí bàn chân qua các khung.

## Chỗ khó (nên xem trước khi tin số)

- **chay_thuong**
  - Game không vẽ hàng `chay` khi cầm thương. `zed_moi.js` đổi sang hàng `chay2tay` (ảnh `03-chay-2tay`, hai nắm tay ôm cán trước ngực), nên đo trên hàng đó.
  - Ảnh gen lặp dáng: khung 1 = 6 = 7 = 12, 2 ≈ 8, 4 ≈ 9 ≈ 10, 5 ≈ 11. Chân trước/sau đổi theo hình, không theo một chân thật.
  - Khung 3: chân sau khuất sau chân trước (che cổ chân + mũi chân sau).
- **lon (lăn)**
  - Khung 3 lộn ngược: bàn chân ở trên, tóc bên trái, đai bên phải. Khung 4 cuộn tròn: đai trên-trái, không thấy mặt.
  - Ở 2 khung này chỉ chắc **2 nắm tay, 1 bàn chân và đai**. Đầu, cổ, vai, khuỷu, hông, gối đều bị che: khung 3 che 17 khớp, khung 4 che 15.
  - Khung 2: chúi đầu, che cổ và tay sau. Khung 1: che vai + khuỷu tay sau.
  - **Không nên dùng giáp xoay theo khớp cho khung 2–4**: hướng xương ở đó là đoán.
- **trung**: khung 1–2 đầu bật ngửa nên đỉnh đầu lệch hẳn sang trái. Khung 4: tâm mặt ghi tay (máy dò mảng da lấy nhầm tai).
- **phitieu**
  - Ảnh gen **đổi tay ném**: khung 2 tay trước giơ ra sau đầu lấy đà, nhưng khung 3–4 tay duỗi ra ném lại là tay sau. Khớp ghi đúng như hình.
  - Khung 3 che vai + khuỷu tay trước; khung 4 che khuỷu tay trước.
- **chet**
  - Khung 6–8 nằm úp: chỉ thấy tóc, 1 tay duỗi, đai và 2 bàn chân chồng nhau. Mỗi khung che 13 khớp: đầu, cằm, cổ, cả tay sau, hông, gối + cổ chân sau.
  - Khi nằm, đỉnh đầu (`headTop`) nằm bên phải đầu.
  - Khung 4–5: tay sau khuất sau thân.

## Gợi ý cho R1

- Khung có nhiều khớp `hidden` (lăn 2–4, chết 6–8): nên **ẩn giáp tay/chân sau** hoặc giữ góc cố định, không xoay theo khớp đoán.
- `fps` lấy theo game (số khung ÷ giây một lượt). Lăn, trúng đòn, phi tiêu, chết là **không lặp** (`gameRow.lap = false`).
