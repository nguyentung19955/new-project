# Nhập hàng chém mới 12/10

Ảnh gốc (ChatGPT, vẽ lại theo mục 3 của [bao-cao.md](bao-cao.md)): `docs/anh-goc/2026-10-12/chem-kiem-smith.png` (Cu Tí),
`chem-kiem-hunter.png` (Cu Tèo), `chem-kiem-wrestler.png` (Cu Lì). Mỗi tấm 1 hàng × 8 ô (6 khung + 2 ô trống), nền xanh lá.

## Đã làm

1. **Thay hàng 1 (`atk_sword`, 6 khung)** của `game/art/custom/em-be-smith-don`, `em-be-hunter-don`, `em-be-wrestler-don`.
   Các hàng cung / giáo / búa / chưởng giữ nguyên từng điểm ảnh. Script: [`kiem/nhap-chem/cat_chem.py`](kiem/nhap-chem/cat_chem.py).
   - Cắt theo vạch kẻ tối thật (vạch dọc chung, vạch ngang đo riêng từng ô vì lưới vẽ tay lệch vài điểm).
   - Xoá nền xanh: chỉ xoá điểm xanh lá rực (G cao hơn hẳn R, B); viền lem chỉ xoá khi "xanh gấp đôi" → quần xanh rêu của Cu Tí,
     váy lá của Cu Tèo, tóc trắng/tím của Cu Lì không bị ăn (đã soi phóng to).
   - Co một tỉ lệ cho cả hàng: khung 1 (thủ thế) cao bằng khung đứng của thân gốc `em-be-<key>` (58 điểm ảnh nét ×2 = 29 điểm ảnh game,
     kể cả viền). Kết quả: các khung 56–63 (giơ tay qua đầu cao hơn, ngồi thụp thấp hơn), giống các hàng còn lại của tệp (46–66).
   - Bàn chân trên đường đáy chung, điểm chân [24, 45]; nắm tay thấp hơn bàn chân (Cu Lì khung 6) được thò xuống chứ không nhấc người lên.
   - Canh ngang: một phép dời cho cả hàng, tâm đầu khung 1 trùng tâm đầu khung đứng → không trượt khi đứng → chém, vẫn giữ cú lao người.
   - Viền 1 điểm màu viền chuẩn, đổi về đúng bảng màu sẵn có của tệp (48 màu Cu Tí/Cu Tèo, 33 màu Cu Lì).
     Cu Lì: da hồng → tím hoa cà bằng đúng phép đổi đã dùng cho các hàng khác của tệp (để không "đổi người").
   - Cỡ tệp: Cu Tí 120 → 105 KB, Cu Tèo 144 → 138 KB, Cu Lì 135 → 136 KB.
2. **Bảng nắm tay `SC.TAY_KIEM`** (`game/js/sprite_custom.js`): đo lại 18 khung (Cu Tí, Cu Tèo, Cu Lì) + số điểm ảnh mới.
   Chú ý: số điểm ảnh khung mới của Cu Lì (và Cu Tèo khung 2) **tình cờ lọt sai số 3 %** của bảng cũ → nếu không đo lại, game sẽ dùng
   điểm tay của ảnh cũ cho ảnh mới (kiếm lệch tay). Nay cả 18 khung đọc "bang-do" đúng ảnh mới (`kiem/nhap-chem/do_tay.py`).
   Ảnh điểm tay: [`anh/nhap-chem-diem-tay.png`](anh/nhap-chem-diem-tay.png) (vòng đỏ = điểm nắm tay).
   Cái Bống giữ nguyên. Khung giơ tay qua đầu (Cu Tí, Cu Tèo, Cu Lì khung 5) nay nắm tay ở trên–sau đầu, kiếm chĩa ra sau → `G.KIEM_KHOP`
   vẽ kiếm sau thân / trên đầu, không đi qua mặt; khung 6 nắm tay ở trước–dưới, kiếm bổ xuống đúng hướng.
3. Không đổi code vẽ, tầm đánh, sát thương, thời gian đòn, đứng/chạy.

## Kiểm (bản hai tệp như web, `linh-khi-nhe.html?cloud=0`)

Ảnh trước / sau (trên = hàng chém cũ, dưới = hàng mới; hàng 1–3: ba nhát đứng yên, 7 thời điểm mỗi nhát; hàng 4: vừa chạy vừa chém):

- Cu Tí: [`anh/nhap-chem-smith.png`](anh/nhap-chem-smith.png)
- Cu Tèo: [`anh/nhap-chem-hunter.png`](anh/nhap-chem-hunter.png)
- Cu Lì: [`anh/nhap-chem-wrestler.png`](anh/nhap-chem-wrestler.png)
- Hàng cũ / mới cạnh nhau (điểm ảnh tệp): [`anh/nhap-chem-hang-cu-moi.png`](anh/nhap-chem-hang-cu-moi.png)
- Trong trận thật có vệt chém: [`anh/nhap-chem-tran.png`](anh/nhap-chem-tran.png)

Nghiệm thu:
- **Mặt**: Cu Tí khung 5 và Cu Lì khung 5 hết cảnh tay che mặt (tay giơ qua phía sau đầu); Cu Tèo 3 nhát có động tác rõ
  (đấm ngang, chém chéo xuống, hất lên, giơ qua đầu, lao bổ), không còn "đứng yên".
- **Tay cầm chuôi**: 18/18 khung kiếm mọc từ nắm tay AI; không còn ô bàn tay code (tay thừa).
- **Cỡ**: khung đứng 58, khung thủ thế của hàng chém 58 → không nhảy cỡ khi đứng/chạy → chém; chân không trượt.
- 0 pageerror (cận cảnh, trong trận); `G.spriteCustom.loi` rỗng.

## Còn lại (nhẹ, không bắt buộc vẽ lại)

- **Cu Tèo khung 5**: cánh tay giơ đi sát mép trái mặt (chạm má, mắt vẫn thấy rõ). Nếu muốn đẹp hơn, prompt:
  > Ảnh gửi kèm là hàng chém kiếm 6 khung của bé Cu Tèo (pixel art chibi, nhìn nghiêng sang phải). Chỉ vẽ lại khung 5: bé giơ hai tay
  > qua đầu như sắp bổ kiếm xuống, cánh tay đi hẳn phía SAU mép sau của đầu (bên trái hình), nắm tay ở trên–sau đầu.
  > Mặt (mắt, má, miệng) phải nhìn rõ hoàn toàn, không có tay nào chạm vào mặt. Tay không, không cầm vũ khí.
  > Giữ nguyên nhân vật, màu, viền đen, cỡ người, vị trí chân như các khung còn lại. Nền xanh lá trơn #00ff00, ô 48×48 như ảnh gốc.
- **Cu Lì (cả tệp -don, có từ trước)**: ChatGPT vẽ quần dài xám, mắt đỏ; thân gốc là khố da báo nâu, chân trần, mắt cam — da đã đổi tím
  cho khớp nhưng quần vẫn khác thân đứng/chạy. Muốn khớp hẳn thì gen lại cả tấm đòn kèm ảnh tham chiếu thân (xem `nhap-anh-12-10/bao-cao.md`).

Công cụ trong `kiem/nhap-chem/`: `cat_chem.py` (cắt + nhập), `do_tay.py` (số điểm ảnh + tay + mặt từng khung trong game),
`luoi.py` / `o_to.py` (lưới toạ độ để đo tay). Chụp: `kiem/chup.py`, `kiem/tran.py`.
