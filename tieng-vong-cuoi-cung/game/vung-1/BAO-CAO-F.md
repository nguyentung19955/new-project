# Báo cáo Luồng F – Sửa P0 theo duyệt vòng 2 của ChatGPT

Làm theo phần P0 trong `docs/duyet-2-vung-1-chatgpt.txt`, gồm 4 việc: thân trùm chắn người chơi, báo đòn trùm, kiểm tiến độ, và cho dễ đọc trên điện thoại.

**Kết quả:** phép thử mới `tools/vung-1/kiem-thu-f.js` đạt **65/65**. Các phép thử cũ vẫn đạt hết, gồm:
- `game/tools/kiem-thu-vung-1.js` chạy với `?thu=1`: 27/27;
- `kiem-tra-vung1.js`: đi P01 → P12, không thiếu hình, không lỗi JS;
- `thu-e.js`.

Phòng demo vẫn chạy, không lỗi. Không sửa engine `dong-co-mn.js`.

## 1. Thân trùm chặn người chơi (`trum.js`)
Trùm giờ tách làm **3 vùng riêng**:

| Vùng | Cỡ | Dùng để làm gì |
|---|---|---|
| **Thân chắn** (`V1.thanTrum`) | 100×170 px, ở giữa chân | Chỉ gồm phần chuông/bụng, không gồm tay rễ, dây, gai. Người chơi không đi, lướt hay chạy xuyên qua được. |
| **Vùng nhận đòn** | 176×190 px | Khớp hình (trước là 168×320, cao hơn hình 100 px). Chém trúng chỗ nào trên hình thì tính trúng. |
| **Vùng gây sát thương** | – | Chỉ có các đòn có báo trước: sóng Gõ, vệt Quét, mặt nạ rơi. **Chạm thân không mất máu nữa.** Trước đây chạm thân trừ máu cả lúc trùm gầm hay chuyển pha, tức là bị trúng mà không có báo trước. |

Thân chắn chạy như sau (`V1.buocThanTrum`, gọi mỗi khung sau engine):
- **Chạy hoặc lướt vào:** thân chặn mềm. Người chơi lấn vào tối đa khoảng 7–10 px. Phần lấn thêm bị trả lại (tối đa 14 px mỗi khung, bằng một bước lướt), rồi được đẩy ra từ từ 2,5 px mỗi khung. Không dịch chuyển tức thời, không lướt xuyên.
- **Nhảy lên đầu:** đầu trùm không phải chỗ đứng. Người chơi bị đẩy ngang 5 px mỗi khung về phía gần hơn, nên trượt xuống một bên.
- **Bị kẹp giữa trùm và tường:** game đẩy trùm lùi ra phía có chỗ. Nếu trùm cũng kẹt thì cho người chơi đi xuyên qua cho tới khi hết chồng.
  - Thực tế chuyện này gần như không xảy ra: khi hộp trùm chạm tường, thân chắn vẫn cách tường 38 px, mà người chơi rộng 28 px.
- **Chỉ đẩy ngang**, có tính va chạm với ô gạch, nên không bao giờ đẩy người chơi lọt nền hay lọt tường.
- Lúc trùm gục (mờ dần 2,5 s) thì tắt thân chắn.

Mở `?hitbox=1` để xem các vùng: viền xanh lá là thân chắn, vàng là vùng nhận đòn, xanh dương là nhân vật.

**Ma trận va chạm đã kiểm (đều đạt):**
- chạy vào từ hai bên;
- lướt vào từ hai bên;
- nhảy đôi qua đầu;
- rơi xuống mép trái, mép phải, giữa đầu và lệch 20 px;
- trùm áp tường: chạy vào, rơi vào khe giữa tường và trùm (2 vị trí) rồi thoát ra bằng nhảy đôi;
- người chơi bị kẹp sẵn giữa tường và trùm;
- đánh khi đang chồng thân: trúng trùm, không mất máu;
- chuyển pha khi đang chồng thân: không mất máu, vẫn chặn;
- chết cùng lúc (xem mục 3).

Trong 3 trận với người chơi máy luôn áp sát, độ lấn lớn nhất là 7,5 px.

## 2. Báo đòn trùm (`trum.js` + `ve.js`)
Phần báo đòn được vẽ **sau lớp bóng tối** nên luôn nhìn rõ.
- **Gầm:** vỏ rung kèm vết **nứt đỏ** phát sáng trên chuông. Không gây sát thương.
- **Quét Chuông:** trùm **kéo ngược 0,45 s** (lùi khoảng 19 px, chuông ngả ra sau). Trong lúc đó:
  - **vùng nguy hiểm màu đỏ** hiện sẵn, đúng bằng tầm quét (190 px ở pha 1, 230 px ở pha 2);
  - có mép đỏ sát sàn, 3 mũi tên chỉ hướng quét, và thanh thời gian đầy dần; đầy là trùm quét.
- **Gõ Không Tiếng:** giơ chuông 0,5 s, có vạch đỏ và mũi tên ở hai bên chân. Ở pha 2, nhịp gõ thứ hai cũng được báo lại 0,4 s (trước đây không báo).
- **Mưa Mặt Nạ:** ở mỗi chỗ mặt nạ sẽ rơi có cột sáng mờ, vòng đỏ và dấu "!", hiện trước ít nhất 0,5 s.
- **Chuyển pha:** rung kèm nứt đỏ, không gây sát thương. Ở pha 2 vết nứt còn âm ỉ.
- **Lỗi Mưa Mặt Nạ có lúc không ra – đã sửa 2 nguyên nhân:**
  1. Cách chọn chiêu cũ có thể không bao giờ chọn Mưa Mặt Nạ khi người chơi đứng gần (Quét và Gõ chiếm hết). Nay trùm không lặp lại chiêu vừa dùng, và **chắc chắn có Mưa Mặt Nạ ít nhất 1 lần trong mỗi 3 chiêu**.
  2. Mặt nạ có thể bị thả vào cột tường dày ở mép phòng. Nay chỉ thả ở cột có khoảng trống thật.
- **Kiểm (trận thật, người chơi máy, 3 trận P12 và 3 trận phòng thử T3):** E.hurt được bọc lại để đếm mọi cú trúng.
  - 100% cú trúng đến từ đòn có báo trước. Trúng do chạm thân, lúc gầm hay lúc chuyển pha: 0 lần.
  - Thời gian báo trước ngắn nhất: sóng 24 khung (0,4 s), quét 27–29 khung, mặt nạ 30 khung.
  - Trận nào cũng có Mưa Mặt Nạ (10–14 mặt nạ) và chuyển pha đúng 1 lần.

## 3. Kiểm tiến độ
- **Chết cùng khung với trùm:** nay trùm được ghi "đã hạ" vào bản lưu **ngay khi hết máu** (trước đây phải đợi hết 2,5 s mờ dần).
  - Nếu người chơi ngã cùng lúc: hồi sinh ở Chuông Lưu, vẫn hiện màn "Hết Vùng 1", trùm không sống lại.
  - Lúc trùm đang gục, người chơi không bị mất máu.
- **Tải lại giữa trận:** về Chuông Lưu P11, giữ 3 Chuông Vỡ và Mảnh Âm đã gửi. Vào lại P12 thì trùm đủ máu, ở pha 1, đang ngủ.
- **Tải lại lúc trùm đang gục:** vẫn tính thắng và hiện màn thắng **1 lần**. Tải thêm lần nữa thì không hiện lại.
  - Có cờ mới `hetXem` trong bản lưu. Bản lưu cũ đã thắng trùm được tự coi là đã xem màn thắng.
- **Túi Mảnh Âm:** ngã ở P12 thì mất 30% (15/50) vào túi nằm trên sàn P12. Quay lại nhặt thì đủ 50.
- **Cửa trùm:** khi có 2 Chuông Vỡ, đã thử 12 cách (chạy, lướt liên tục, nhảy đôi kèm lướt, đập đất kèm chém, từ 3 vị trí). Không lần nào qua được; người chơi luôn dừng ở cột 54. Đủ 3 chuông thì qua được.

## 4. Đọc được trên điện thoại
- **Mép mặt sàn** (`tools/vung-1/ve-phong.py`, đã nướng lại 9 phòng):
  - Dải mặt sàn đi được sáng thêm ×1,2 (`MD_SANG`), **chỉ ở dải đó**. Đá và nền giữ nguyên: phần còn lại của ảnh thay đổi 0,0–0,1%.
  - Dải mặt đất nay chạy sát tới mép vực (trước đây thu nhỏ dần nên chỗ hụt chân bị tối). Góc mép vực có viền sáng chạy xuống 3 điểm.
  - **Số đo** (`python3 tools/vung-1/do-sang-mep.py`): mặt sàn sáng hơn trước +14 đến +20%, mép vực +15 đến +26%.
  - So với mặt đứng (vách bên) thì mặt sàn sáng hơn +147 đến +196%. Lưu ý: ngay cả bản cũ đã sáng hơn mặt đứng khoảng +95–125%, tức là vượt xa mức 15–25% ghi trong bản duyệt. Nên tôi hiểu yêu cầu là "làm mép sàn nổi hơn 15–25%", và chỉ tăng sáng, không làm tối mặt sàn đi để ép đúng tỉ lệ.
- **HUD mới** (`ve.js` → `veHUD`): nền tối riêng, chia 4 hàng rõ ràng:
  1. Máu: ô mặt nạ 24×28, khoảng 17–19 px thật trên iPhone, cỡ gấp đôi trước.
  2. Lượt hồi: bình xanh kèm số "2/2".
  3. Mảnh Âm: số to.
  4. 3 Chuông Vỡ kèm **"n/3"**.
- **Thanh máu trùm:** chuyển lên **giữa phía trên** (trước nằm sát đáy, gần nút bấm). Có tên trùm và vạch 50% (chỗ chuyển pha) có mũi tên.
- **Nút Bản đồ:** 44×105 px, có biểu tượng, chữ 15 px.
- **Vùng an toàn:** dùng biến CSS `--sal`, `--sar`, `--sat`, `--sab` (lấy từ `env(safe-area-inset-*)`). Khung game tự né tai thỏ.
  - Trên iPhone (màn nét cao), khung game phóng đầy chiều cao màn thay vì phóng theo số nguyên. Trước đây ở 932×430 khung chỉ rộng 640 px, nay rộng 764 px.
  - Để thử trên máy tính, thêm `?safe=47,0,47,21` vào địa chỉ để giả lập tai thỏ.
- **Kiểm Playwright ở 844×390 và 932×430** (tai thỏ giả lập 47 px mỗi bên):
  - khung game, HUD và nút Bản đồ nằm trong vùng an toàn;
  - HUD và thanh máu trùm cách các nút cảm ứng ít nhất 119 px.

## Ảnh đã chụp và tự xem (`tools/vung-1/xem/f/`)
| Nhóm | Ảnh |
|---|---|
| Va chạm | `va-cham-chay-trai`, `va-cham-roi-giua-dau`, `va-cham-ap-tuong` |
| Báo đòn | `bao-gam`, `bao-quet-keo-nguoc`, `bao-go`, `bao-mua-mat-na`, `bao-chuyen-pha` |
| Điện thoại | `dien-thoai-844x390-*`, `dien-thoai-932x430-*` |
| Tiến độ | `tien-do-chet-cung-luc` |

Kết quả từng mục kiểm nằm trong `ket-qua.txt`.

## Cách chạy kiểm thử
```
cd tieng-vong-cuoi-cung && python3 -m http.server 8765
node tools/vung-1/kiem-thu-f.js              # 65 mục của luồng F
node game/tools/kiem-thu-vung-1.js           # phép thử cũ – nay mặc định thêm &thu=1 (đặt TV_Q='' để bỏ)
```

## Còn lại / gợi ý
- Thân chắn đang là hộp cố định 100×170, không đổi theo hình (giơ chuông, vỡ mặt nạ). Nếu sau này có hình động thì có thể đổi cỡ theo từng khung.
- Đổi ý: bỏ sát thương khi chạm thân làm trùm "hiền" hơn khi đứng sát. Bù lại, trùm hay dùng Quét khi người chơi ở gần. Nếu muốn khó hơn, nên thêm 1 chiêu cận chiến có báo trước (P2: "Rễ Móc Mộ"), thay vì bật lại sát thương chạm thân.
- Phần P1/P2 của bản duyệt (phân vai phòng, dẫn hướng, cân thời gian hạ trùm, chiêu pha 2) chưa làm.
