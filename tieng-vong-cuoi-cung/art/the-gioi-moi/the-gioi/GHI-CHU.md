# Ghi chú – thế giới mới (gạch, đồ vật, nền)

Viết cho người không rành kỹ thuật. Mở trước: `xem-thu/canh-ghep-1x.png` (cảnh ghép), `xem-thu/canh-ghep-diu-1x.png`
(cùng cảnh, nền dịu), `xem-thu/cuon-thu-1x.png` (thử cuộn), `xem-thu/doan-nen-mau-2x.png` (đoạn nền mẫu).
Mọi số "px logic" theo khung 960×540, ô 32, Lam cao 112; ảnh xuất 2x. **Chưa chạy trên iPhone** – chỉ là ảnh tính ra.
Không gen ảnh mới: mọi thứ cắt/ghép bằng code từ 3 ảnh trong `../nguon/`.

## 1. Đã làm gì

| Phần | Kết quả | Xem |
|---|---|---|
| Gạch nền | 51 ô (đất rễ/rêu 21, đá rêu 20, dốc 2, ván một chiều 3, trang trí 5), atlas + JSON + ô lẻ | `gach/`, `xem-thu/bang-o-gach.png` |
| Đồ vật | 13 vật/trạng thái: công tắc (chưa ấn / đã ấn / đã ấn + tia "!"), cổng (đóng / hé / mở), điểm lưu (thường / sáng), mảnh chuông (không quầng / có quầng), bình máu, thùng gỗ, biển chỉ đường | `do-vat/`, `xem-thu/bang-do-vat.png` |
| Nền | 6 lớp 1920×1080: xa (trời+núi+sương), mặt trời, giữa (làng+tháp chuông), gần-cây, gần-lá, đất (đã bỏ khỏi nền) + bản dịu của từng lớp | `nen/`, `nen/mask-lop.png` |
| Xem thử | cảnh ghép 2x + 1x (thường và dịu), thử cuộn 3 vị trí camera, đoạn nền mẫu (có bản kẻ lưới + tên ô) | `xem-thu/` |
| Kiểm tra | `code/kiem_tra.py`: ĐẠT. Chạy lại từ đầu trên bản chép riêng → ra y hệt từng byte | |

## 2. Cỡ đã chọn

| Thứ | Cỡ (px logic) | So với | Ghi chú |
|---|---|---|---|
| Ô gạch | 32 × 32 (ảnh 64) | | rêu mặt trên thò lên trên ô ~4 px logic, viền/rêu thò ra mép khối ~1,5–4 px – cố ý (giống mép cỏ) |
| Ván một chiều | dày ~11 (viền thò 1,5 lên trên mép ô), giá đỡ 2 đầu xuống ~21 | 1 ô cao | mặt ván ≈ mép trên ô |
| Công tắc | rộng 40, cao 24 (ấn: 16,5) | ~1,25 ô | |
| Cổng gỗ | 147,5 × 128 | cao 4 ô, Lam 112 | rộng ~4,6 ô (chỉ cột giữa là chắn đường) |
| Điểm lưu | ~72 × 88 | ~2,75 ô | |
| Mảnh chuông | tinh thể cao 24 (khung 26,5 × 30 vì tia lấp lánh) | 0,75 ô | |
| Bình máu | 17,5 × 24 | 0,75 ô | |
| Thùng gỗ | 48 × 43 | 1,5 ô | xem câu hỏi 4 |
| Biển chỉ đường | 55 × 72 | 2,25 ô | |
| Nền | 960 × 540 (ảnh 1920 × 1080) | đúng 1 màn | ảnh nguồn 1672×941 phóng ×1,148 |

Độ dày viền đen ở ảnh 2x (ước tính): Lam ~3,5–4 px, gạch ~2,7–4 px, cổng ~4,5 px, biển ~2,7, điểm lưu ~2,1,
thùng ~2, công tắc / mảnh chuông / bình máu ~1,5–1,6 px. Vật nhỏ viền mảnh hơn Lam vì bị thu nhỏ nhiều hơn (xem câu hỏi 3).

## 3. Chỗ đã cắt / cân lại (vì ảnh ChatGPT vẽ không đều)

**Gạch**
- ChatGPT vẽ **mọi ô thành một khối rời có viền đen cả 4 cạnh** → đặt cạnh nhau sẽ thấy vạch đen giữa các ô.
  Cách sửa: theo vai trò ô, cạnh nào giáp ô đặc khác thì **cắt bỏ viền** (lùi vào 13 px nguồn), rồi thay dải sát mép
  (¼ ô) bằng dải của ô tham chiếu, nối qua **đường cắt ít lộ nhất** (đi vòng theo chỗ màu giống nhau, không cắt thẳng).
  Ô thân / mặt-trên-giữa / ván-giữa được làm **lặp liền** (nối đầu–cuối). Kết quả đo trên 89 cặp ghép: chênh màu ngay
  đường nối chỉ bằng 0,89 lần (trung vị), lớn nhất 1,48 lần chênh giữa hai cột kề nhau bên trong ô → mắt không thấy nối
  (`gach/kiem-tra-duong-noi.json`).
- Các ô hàng thân (cạnh trái/phải, đáy, cột) **dựng từ ô thân** rồi chỉ thay dải mép có viền → ghép chữ T / góc trong
  (vd. cột treo dưới khối đá) vẫn liền phần ruột; chỉ đường viền cột bắt đầu đột ngột là đúng ý.
- Ba ô mặt trên trái/giữa/phải của nguồn có **mặt rêu cao thấp khác nhau** (lệch ~4 px 2x) → không lấy khung vuông theo
  hộp bao nữa mà lấy **mép trên thảm rêu** (hàng đầu tiên rêu phủ ≥ 85 % bề rộng) làm mép trên ô. Chỏm lá lơ thơ phía trên
  thành phần thò ra.
- Ô nguồn **không cùng cỡ** (khối thân 213 px, đỉnh cột 167–180 px, ván giữa 232 px…) → mỗi ô bị kéo về đúng 1 ô:
  hệ số nguồn → 2x từ 0,30 đến 0,46, tức có ô bị giãn/co tới ~±20 % (nhiều nhất: đỉnh cột hẹp bị giãn ngang).
- Thân đất 1 ô lặp lại thành hoa văn chéo rất "giấy dán tường" → thêm biến thể: ô thân thứ 2 của bảng, thân lật ngang,
  thân 2 lật ngang, thân xoay 180°; cả 4 biến thể có 4 mép khớp đúng ô thân chính nên xen kẽ tự do. Đá: 2 biến thể.
- 5 ô trên bảng (rễ dựng + rêu nửa ô, gờ rêu mỏng nửa ô, 2 bậc rễ) **không khớp lưới 32** → để làm trang trí `phu-*`.

**Đồ vật**
- Cổng: nguồn chỉ có [cổng đóng] [cột trái + cánh hé] [cánh mở hẳn + cột PHẢI]. Ghép lại cho cùng khung, cùng 2 cột:
  hé = cột trái + cánh hé (nguồn) + cột phải cắt từ cổng đóng (cắt ở x = 980 nguồn); mở = hình "cánh mở + cột phải"
  **lật ngang** (để bản lề vẫn ở cột trái như lúc hé) + cột phải cắt từ cổng đóng. Chỗ cắt cột phải còn dính 2 mẩu bản lề
  sắt – nhìn như chốt cửa.
- Mảnh chuông có quầng vàng nhạt (không phải nền trắng) → tách riêng: bản không quầng (game tự vẽ quầng bằng gradient,
  như đèn lồng) và bản có quầng bán trong suốt.
- Biển chỉ đường / bình máu / thùng: vùng cắt lẹm vào vật bên cạnh → chỉ giữ mảng lớn nhất.
- Mọi vật neo **đáy-giữa** theo phần chân (không tính tia/lửa xanh), nên đổi trạng thái không bị nhảy chỗ.

**Nền**
- Dải đất cỏ phía dưới tranh **đã bỏ khỏi nền** (đất do gạch đảm nhận) – vẫn xuất riêng `nen/dat.png` nếu muốn dùng.
  Mép cỏ trong tranh ở y ≈ 650–750 nguồn, tức ~372–431 px logic trên màn (sàn game ở 448) → giữa làng và sàn gạch có
  dải sương ~20–70 px.
- Tách xa ↔ vật bằng GrabCut (tự gieo hạt: chỗ mịn sáng = trời/sương, chỗ nhiều nét mực = vật), rồi ép thêm "chỗ giống trời"
  (khe giữa cột tháp chuông, quanh mặt trời) về lớp xa. Cây cổ thụ góc trái tách bằng **đa giác vẽ tay** + lọc màu sương;
  đèn lồng và dây leo có đa giác riêng.
- Mặt trời tách thành lớp riêng (nếu để trong lớp xa thì khi lặp lật sẽ thấy 2 mặt trời); chỗ cũ trong lớp xa được lấp màu trời.
- Lớp xa: mọi chỗ bị vật che được **lấp theo hàng ngang** (giữ đúng dải màu trời theo độ cao, sương thành dải) → cuộn không lộ lỗ.
- Lớp giữa: chân mờ dần vào sương; **2 mép trái/phải mờ hẳn** (bên trái: phần làng sau thân cây bị khuyết nên nhà trái chìm
  vào sương; bên phải: cầu gỗ chìm vào sương) → lặp THẲNG được. Lặp LẬT sẽ ra 2 tháp chuông đối xứng nên không khuyên.
- Gần chia 2: `gan-cay` (cây cổ thụ, vẽ đậm) và `gan-la` (bụi lá đen 2 góc dưới, vẽ mờ ~50 % vì đè lên sàn/nhân vật).
- **Bản dịu** (`*-diu.png`): lớp xa bão hoà 78 %, tương phản 80 %, mờ 1,6 px, phủ sương 14 %; lớp giữa 82 % / 86 % /
  mờ 0,7 px / sương 10 %; lớp gần nhẹ hơn. So 2 ảnh `canh-ghep-1x` và `canh-ghep-diu-1x`.

## 4. Còn chưa đẹp
- **Nền khác phong cách**: tranh nền vẽ kiểu tranh minh hoạ (nhiều chuyển màu, sương, chi tiết nhỏ), còn gạch/đồ vật/Lam
  là màu phẳng viền đen dày. Bản dịu giúp nhân vật nổi lên nhưng không làm hai thứ cùng một phong cách.
- Thân đất vẫn thấy nhịp lặp 1 ô (rễ chéo) khi nhìn cả mảng lớn; đá lặp rõ hơn (hòn đá to, chỉ 3 biến thể).
  Đường cắt ghép đôi khi cắt ngang một rễ/hòn đá – phải phóng to ảnh 2x mới thấy.
- Viền đen không đều giữa các vật (công tắc ~1,6 px vs cổng ~4,5 px ở 2x).
- Lớp xa: vùng lấp sau làng/tháp/cây là màu nhoè dạng dải – chỉ hé ra khi các lớp trượt lệch nhau, nhưng nhìn kỹ thì thấy.
- Lá tối ở giữa đáy tranh bị cắt mềm ở y 800 nguồn (dưới đó là bóng vách cùng tông màu, không tách được bằng màu).
  Đa giác cây vẽ tay → chỗ rễ/đá bên phải gốc cây có mép mờ, cành cây có 1 đoạn mép hơi thẳng.
- Ô dốc chỉ có 1 cỡ 45° (1×1 ô); chưa có dốc thoải 2 ô. Ô trang trí `phu-*` chưa khớp lưới.
- Cổng mở dùng hình lật nên vòng sắt và bóng đổ ngược phía so với cổng đóng.
- Chưa thử trong game, chưa đo trên iPhone; ảnh 1x chỉ là thu nhỏ để xem.

## 5. Câu hỏi cần chủ dự án quyết
1. **Nền có cần gen lại cho đồng phong cách không?** (màu phẳng, viền đen, ít sương, tách sẵn từng lớp trên nền trắng/xanh
   lá để cắt sạch) – hay dùng tranh hiện tại?
2. Nếu dùng tranh hiện tại: chọn **bản thường hay bản dịu**? (Tôi nghiêng về bản dịu vì Lam và gạch nổi hơn.)
3. Viền vật nhỏ mảnh hơn Lam: chấp nhận, hay phóng vật nhỏ to hơn (công tắc ~1,5 ô, bình máu/mảnh chuông ~1 ô),
   hay gen lại bảng đồ vật với viền dày hơn so với cỡ vật?
4. Thùng gỗ 1,5 ô (48 px) cho dễ thấy, hay đúng 1 ô (32 px) để khớp lưới nếu thùng là khối đứng lên được?
5. Cổng 4 ô (128 px) rộng ~4,6 ô – giữ, hay hạ còn 3,5 ô (112 px, bằng Lam) cho gọn và viền mảnh lại?
6. Cổng mở dùng hình lật (bản lề bên trái) có được không, hay muốn gen lại 3 trạng thái cổng cùng một bản lề?
7. Lớp giữa (làng + tháp chuông) lặp thẳng thì tháp xuất hiện lại mỗi ~2,2 màn – được, hay chỉ vẽ 1 lần mỗi phòng?
8. Có nên gen lại bảng gạch theo kiểu **ô liền mép** (không viền 4 cạnh, có sẵn đủ góc/cạnh) để khỏi cắt ghép, và thêm
   biến thể thân cho đỡ lặp?
9. Mảnh chuông: dùng quầng vẽ sẵn (`manh-chuong-quang`) hay để game vẽ quầng bằng gradient?
10. Mép cỏ của tranh nền cao hơn sàn game ~20–70 px logic (có dải sương ở giữa): giữ (trông như làng ở xa phía sau),
    hay dời lớp giữa xuống cho chân làng sát sàn?
