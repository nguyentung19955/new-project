# SỔ TAY KINH NGHIỆM – CÁCH LÀM GAME PIXEL 2D (rút từ "The Last Echo")

> Dùng để giao cho một dự án/phiên làm việc khác (ví dụ game **Linh Khí**) để làm **y hệt cách đã làm** với "The Last Echo / Tiếng Vọng Cuối Cùng"
> (metroidvania 2D pixel, chơi trên iPhone xoay ngang, chạy trên trình duyệt).
> Đọc hết mục 1 trước khi làm bất cứ việc gì. Các con số ở đây đều đã thử thật, không phải ước đoán.

---

## 1. LUẬT LÀM VIỆC (bắt buộc)

### 1.1 Với người dùng
- Người dùng **không rành kỹ thuật**: trả lời **tiếng Việt**, ngắn, dễ hiểu, không dùng tên hàm, tên file hay thuật ngữ khi không cần.
- Người dùng chơi trên **iPhone xoay ngang**: mọi thay đổi phải thử ở cỡ màn iPhone (mục 7).
- **Làm liên tục, không tự dừng** khi chưa xong. Nếu phải chờ gì đó thì nói rõ đang chờ gì.
- **Báo tiến độ**: mỗi đầu việc có % hoàn thành; xong việc nào thì báo việc đó.
- Khi người dùng chỉ ra lỗi, **tìm đúng nguyên nhân gốc** và chứng minh đã hết lỗi bằng số đo hoặc ảnh trước/sau. Không báo "đã sửa" khi chưa tự kiểm.
  (Bài học: lỗi "dây leo không lên không xuống được" bị báo tới **10 lần** vì mỗi lần chỉ vá triệu chứng. Gốc thật là hình vẽ lệch với lưới va chạm.)
- **Không tự ý gạch bỏ hạng mục nào là "không cần làm"**. Lần rà soát đầu bỏ sót bản đồ nhỏ, người dùng phải nhắc lại.
- Hỏi trước khi làm những việc **đổi cảm giác chơi**, như đổi tầm đánh, thêm khung hình, đổi tốc độ hay đổi hitbox.

### 1.2 Về hình ảnh
- **Không có hình nào vẽ bằng code** trong game: không vẽ bằng `fillRect`, `arc`, `lineTo`, `strokeRect`, viền hay khung CSS, emoji ☠ ◆ làm biểu tượng.
  Mọi hình (nhân vật, quái, hiệu ứng, giao diện, khung, nút, bản đồ, biểu tượng) đều do **ChatGPT vẽ**. Hoạt hình nhân vật có thể dùng **PixelLab**.
- Chưa có ảnh thì **tạm tắt tính năng đó**, không vẽ tạm bằng code. Nếu buộc phải có đường dự phòng thì chỉ dùng khi ảnh tải lỗi.
- Được phép giữ bằng code: ánh sáng, độ tối, hạt bụi, độ mờ, rung màn, chữ.
- **Nhân vật chính đã chốt thì giữ nguyên 100%**: không đổi thiết kế, màu hay tỉ lệ.
- Định kỳ **rà soát hình vẽ bằng code**: bọc các hàm vẽ của canvas để đếm lệnh vẽ theo từng dòng mã khi chơi thật (xem 7.3).
  Lập danh sách vào `docs/ra-soat-hinh-code-*.md`, gồm cả HUD, bản đồ, nút HTML/CSS và màn hình menu.

### 1.3 Tư vấn ChatGPT – 100%
- **Mọi kế hoạch và mọi quyết định thiết kế** (cốt truyện, chỉ số, nhịp animation, VFX, giao diện, phông chữ) đều hỏi ChatGPT trước.
- Luôn dặn ChatGPT: *"Viết toàn bộ câu trả lời vào 1 file .txt để tải về VÀ in luôn nội dung trong khung chat."*
- Lưu **nguyên văn** câu trả lời vào `docs/<chu-de>/tu-van-chatgpt.txt`, rồi làm theo.
- Gửi kèm ảnh tham chiếu (nhân vật, ảnh chụp game) khi hỏi về hình.

### 1.4 Chia việc
- Việc lớn thì chia ra cho **các phiên chạy song song**, mỗi phiên một mảng (cốt truyện, sức mạnh, đồ, bí mật, lưu đám mây…). Báo người dùng khi từng phiên xong.
- Phiên đám mây **không có trình duyệt Chrome** nên không mở được ChatGPT. Vì vậy:
  - phiên song song ghi yêu cầu ảnh vào `docs/yeu-cau-anh/<mang>/NNN-*.md`;
  - **phiên chính** (có Chrome) vẽ bằng ChatGPT, cắt ảnh và đánh dấu XONG.
- Mỗi commit kết thúc bằng dòng ghi công (Co-Authored-By và Claude-Session). Giữ repo sạch: ảnh chụp thử để ở thư mục nháp, không để trong repo.

---

## 2. QUY TRÌNH VẼ ẢNH BẰNG CHATGPT (đã chạy trơn tru)

1. **Mỗi ảnh một cuộc trò chuyện mới**: mở tab mới tới chatgpt.com, xong thì đóng tab.
2. Prompt chuẩn:
   - "Draw ONE image: …";
   - nền **magenta phẳng #FF00FF**;
   - các món tách xa nhau, chừa nhiều khoảng magenta;
   - "Crisp pixel art, no blur, no text, nothing cut off, no shadow on the magenta";
   - nêu rõ phong cách (ví dụ: dark-fantasy, đồng cổ, gỗ vỏ cây tối, rễ, chuông nhỏ).
3. Với **khung giao diện** cần co giãn, dặn thêm:
   - "straight plain edges in the middle of each side so it can be 9-slice stretched";
   - "decoration only at the corners, OUTSIDE the plate, never covering the interior";
   - "EMPTY interior".

   Bài học: lần đầu khung HUD có dây leo và chuông **đè vào trong**, che mất ô máu. Phải xin lại khung có trang trí nằm ngoài.
4. Nhập chữ vào ô chat:
   ```js
   document.querySelector('[contenteditable="true"]').focus(); document.execCommand("insertText", false, `...`)
   ```
   Sau đó nhấn **Return**. Bấm nút gửi đôi khi không ăn.
5. Biết khi nào xong: có `img` với `naturalWidth >= 1000` và **không còn** nút `[data-testid="stop-button"]`.
6. **Lấy ảnh gốc đúng từng điểm ảnh**:
   - vẽ một phần ảnh lên canvas cố định có kích thước CSS đúng bằng phần cắt (≤ 887 px mỗi chiều);
   - chụp phóng vùng `[0,0,w,h]`;
   - ảnh lớn thì chia ô (ví dụ 1672×941 → 4 ô 836×471; 1536×1024 → 4 ô 768×512);
   - ghép lại bằng Python (lấy các ảnh chụp từ nhật ký phiên, bỏ ảnh trùng liên tiếp, **kiểm thứ tự ô** trước khi ghép);
   - xong thì xoá canvas phủ.
7. **Tách nền magenta** (đã chỉnh để sạch viền hồng):
   ```python
   d  = sqrt((r-255)^2 + g^2 + (b-255)^2)
   al = clip((d-45)/105, 0, 1)
   p  = clip((b-g-20)/150, 0, 1) * (r > 110)    # mức "ám hồng" ở viền
   b  = where(p > 0.05, min(b, g*0.7+10), b)     # khử hồng
   al *= 1 - p*0.75
   ```
8. **Cắt từng món**:
   - tìm cụm điểm ảnh (giãn 6 px rồi đánh nhãn);
   - cắt sát theo alpha;
   - điểm có alpha < 20 thì đặt về 0.
9. **Giảm dung lượng**:
   - thu nhỏ theo "điểm ảnh thật" của tranh (ChatGPT thường vẽ mỗi điểm pixel to 2–4 px → thu ½ hoặc ¼, dùng NEAREST);
   - **lượng tử 256 màu** (PIL `quantize(256, FASTOCTREE, dither NONE)`), giảm 5–10 lần (544 KB → 96 KB).
10. Lưu kèm **ảnh nguồn** `*-nguon-chatgpt.png` cạnh ảnh đã cắt.
11. Bản chơi gói một file phải **dưới 16 MB**. Theo dõi cỡ file, ảnh to thì thu nhỏ hoặc lượng tử.

---

## 3. ANIMATION – NGUYÊN TẮC

### 3.1 Điểm neo, căn khung
- Mỗi nhân vật có **pivot cố định** (giữa đế chân) cho mọi khung. **Vị trí thật do vật lý quyết định**:
  - không dùng sprite để giả độ cao nhảy;
  - không dịch sprite để giả lao tới;
  - không cộng `dy` giả.
- **Căn ngang theo tâm thân**, cùng một mốc cho mọi animation. Không khoá theo mắt, không khoá theo gót. Khoá gót làm đòn đánh giật lùi 20 px; khoá mắt làm thân nhảy 16 px khi quay đầu.
- Dưới đất: đế thấp nhất chạm pivot. Trên không: tâm thân ở độ cao cố định so với pivot, đế không thấp hơn pivot.
- **Khoá chân trụ** trong pha chống đất, vì trượt chân là lỗi dễ thấy nhất.
- Quái treo trần thì khoá điểm treo. Quái bay thì không khoá chân.
- Lật trái/phải quanh pivot.
- Làm tròn **chỉ khi vẽ**, theo **điểm ảnh thật** của màn (`Math.round(v*dpr)/dpr`). Áp dụng cho camera, nhân vật và quái như nhau.

### 3.2 Nhịp (tốc độ)
- Vòng lặp logic **cố định 60 bước/giây**, vẽ nội suy. Khung animation tăng theo bước logic, không theo số lần vẽ, nên chạy đúng ở cả 60 Hz và 120 Hz.
- **Mỗi khung có số ms riêng** (mảng `ms`), không chia đều. Đổi sang bước: `buoc = ms × 0.06`. Chọn khung theo tổng bước đã trôi.
  - Clip chạy theo **tỉ lệ** (lướt, trúng đòn, nhảy…) cũng phải dùng ms từng khung.
  - Sự kiện (cộng máu, bật hitbox) gắn với **mốc khung**, tính từ tổng ms các khung trước đó.
- ms nên là bội của **16,67** (một khung 60 fps).
- Bộ ms đã chốt cho nhân vật chính (ChatGPT duyệt):

  | Clip | ms từng khung |
  |---|---|
  | nhảy | 50, 67, 83, 83 |
  | nhảy đôi | 4 × 67 |
  | tiếp đất | 33, 50, 83 |
  | lướt | 33, 33, 50, 50, 50, 67 |
  | trúng đòn | 33, 33, 50, 50, 67, 67 |
  | hồi máu | 150, 200, 250, 150 |
  | chết | 50, 67, 83, 83, 100, 117, 200 (giữ khung cuối) |
  | đập đất | 55, 55, 45, 45, 45, 45, 50, 55 … 70, 80 |
  | đòn 1 | 65, 60, 45, 65, 45, 45, 55, 65 |
  | đòn 4 (đòn kết) | 60, 65, 50, 40, 35, 65, 55, 60, 80 |
  | chém trên không | 50, 50, 45, 50, 50, 65, 70 |

- Quy luật chung:
  - lấy đà chậm → **ra đòn nhanh (35–50 ms)** → giữ dáng lực 50–100 ms → hồi chậm;
  - trúng đòn bắt đầu rất nhanh (33 ms);
  - chết thì chậm dần và **giữ khung cuối, không lặp**;
  - vật nặng: thân đi trước, phần treo (chuông, vải) theo sau; đập nhanh, hồi chậm.
- **Dừng hình (hitstop)** khi trúng đòn: khoảng 3 bước; khi người chơi bị đánh: 5 bước. Riêng trùm chỉ 1 bước, để không kéo dài nhịp báo đòn.
- Bất tử sau khi bị đánh 70 bước, nháy mờ. Lướt cũng có khung bất tử nhưng **không được nháy HUD** (lỗi đã gặp: thanh máu nháy mỗi lần lướt). Tách cờ "vừa trúng đòn" khỏi cờ "đang bất tử".

### 3.3 Duyệt animation (làm theo nhóm, ChatGPT phán)
1. Tự đo bằng script cho từng clip:
   - IoU giữa 2 khung liền nhau (dưới 0,3 là nghi "dịch chuyển tức thời");
   - % đổi chiều cao;
   - % trượt chân trong pha chạm đất;
   - tâm nhảy %;
   - khung trùng nhau;
   - chạm mép ô (hình bị cắt).
2. Gửi bảng số và ảnh khung (contact sheet) cho ChatGPT **theo nhóm** (nhân vật di chuyển / đòn đánh / trúng-hồi-chết / từng quái / VFX).
3. ChatGPT trả về kết luận, cách sửa, ms đề xuất và mức ưu tiên:
   - **P0** = sửa ngay;
   - **P1** = nên sửa;
   - **P2** = giữ.
4. Sửa theo 2 mức:
   - **Mức 1** (không đụng hình): áp ms mới, căn lại, khoá chân, giữ khung cuối, sửa code chọn khung. Làm ngay.
   - **Mức 2** (cần vẽ thêm khung chuyển tiếp): **hỏi người dùng trước**, rồi nhờ ChatGPT hoặc PixelLab vẽ.
5. Lỗi hay gặp: chết "rơi từ trên xuống nằm bẹp trong 1 khung" (cần thêm khung đang rơi), đòn "xoay nhảy ảnh", vòng lặp F cuối → F0 giật, ảnh chết là bản sao ảnh đánh. Nhớ kiểm cả trùng file.
6. Lưu ý đo đạc: khung trùng **không mặc nhiên là lỗi** (giữ dáng tạo lực); IoU thấp ở VFX hay vải bay không mặc nhiên là giật; khung cuối gần trống là kết thúc hợp lệ của VFX.

### 3.4 Gen chuyển động mới
- Mô tả theo **góc nhìn cố định, bên gần/xa máy quay, từng khung**. Gọi là "tay gần / tay xa / chân gần / chân xa". "Trước" = bên phải ảnh.
- Muốn chính xác thì làm **chuỗi rig tham chiếu** trước (cam = chi gần, xanh dương = chi xa), duyệt chuyển động, rồi dùng rig làm tham chiếu khi vẽ sprite.
- Quy định khung: cùng cỡ ô, cùng đường mặt đất, không lặp khung 1 ở cuối, nền trong suốt hoặc magenta, không cắt người.

---

## 4. HIỆU ỨNG (VFX)
- **Thứ tự lớp** vệt chém: vệt SAU → kiếm/tay xa → thân → kiếm/tay gần → vệt TRƯỚC → tia trúng.
  - Vệt sau tối hơn 25–35% và không có lõi trắng.
  - Lõi trắng chỉ ở **đỉnh lực**.
  - Đầu vệt đi trước mũi kiếm 2–5 px.
  - Không hiện vệt trước khi kiếm chuyển động.
- VFX **neo vào điểm tác động**: đỉnh hiệu ứng trùng khung va chạm, tàn ở 1–2 khung sau rồi tắt hẳn. Không để hiệu ứng bùng như một phép riêng tách khỏi đòn.
- Đạn: **khoá tâm quả đạn** trong ảnh, chỉ cho đuôi và quầng đổi. Engine dịch đạn; nếu ảnh cũng dịch thì đạn chuyển động kép. Tách 3 phần: sinh → bay lặp → nổ.
- **Chừa đệm** quanh hiệu ứng theo hướng lan, đừng để chạm mép ô.
- Hồi máu: VFX riêng 8 khung (4 khung theo dáng hồi trước mốc cộng máu, 4 khung sau). Màu ấm (hổ phách), hạt tụ vào ngực, vòng sóng, loé ở khung kích hoạt.
- Mờ dần bằng engine (alpha) thay vì tắt đột ngột.
- Trúng đòn: 4 kiểu (ngang / cung / chéo / nổ), mỗi kiểu 6 khung 35–60 ms. Kèm loé trắng ngắn và rung màn nhẹ.

---

## 5. GIAO DIỆN, CHỮ, BẢN ĐỒ
- **Phông chữ** (ChatGPT chọn): thân chữ **Alegreya Sans** (đậm, rõ), tiêu đề **Cormorant Garamond** (huyền bí). Nạp trước khi vẽ canvas (`document.fonts.load`, tối đa 2,5 s).
- **Hướng dẫn dài** (trên ~22 ký tự) đặt trong **khung bảng ChatGPT vẽ** (co giãn 9 mảnh và mặt nạ trang trí giữa cạnh trên), tự xuống dòng. Hướng dẫn ngắn thì để chữ trơn có viền tối.
- **Co giãn 9 mảnh** cho mọi khung: đo lề (L/R/T/B) theo điểm ảnh gốc của ảnh, vẽ 4 góc giữ nguyên tỉ lệ k, cạnh và giữa thì kéo giãn. Một hàm dùng chung cho HUD, thanh máu trùm, ô phòng bản đồ, nền bản đồ.
- **HUD**:
  - khung gỗ có lề đồng mảnh, trang trí thò ra ngoài;
  - 4 hàng rõ ràng: máu (mặt nạ) / bình hồi + số / tiền + số / vật phẩm chính "n/3";
  - vạch ngăn là ảnh;
  - thanh máu trùm đặt **giữa, trên cùng**, xa nút cảm ứng.
- **Bản đồ**:
  - nền giấy da trên gỗ (9 mảnh);
  - 3 kiểu ô phòng: đã vào / đang ở (sáng hổ phách) / chưa vào (nét đứt mờ, chỉ hiện khi kề phòng đã vào);
  - dây rễ nối phòng xoay theo hướng nối;
  - biểu tượng: chuông lưu, đầu lâu trùm, chuông khoá, túi rơi khi chết, mặt nạ = vị trí người chơi (nhấp nháy).
- **Nút cảm ứng** là ảnh, vùng bấm **≥ 44 px cao, ≥ 70 px rộng**, nằm trong vùng an toàn (tai thỏ khoảng 47 px mỗi bên), cách HUD và thanh trùm ≥ 40 px.
- Hộp thoại có chân dung: chân dung là dải khung (khung 0 đứng yên, các khung sau nói, đổi mỗi 160 ms khi chữ đang chạy).
- Đổi toàn bộ chữ sang tiếng Anh thì giữ một **bảng đối chiếu** Việt ↔ Anh. Tên nhân vật theo phong cách huyền bí.

---

## 6. LỖI ĐÃ GẶP VÀ CÁCH SỬA

| Triệu chứng | Nguyên nhân gốc | Cách sửa |
|---|---|---|
| Dây leo không lên/xuống được ở chỗ có bệ | Hình dây vẽ xuyên qua bệ `=` nhưng lưới va chạm không có ô dây ở đó | Kéo ô dây xuyên qua `.`/`=` lên tới trần `#`; ô dây rộng 1 kẹp giữa bệ thì thành cầu. Viết script quét **mọi** chỗ như vậy |
| Thanh máu nháy khi lướt | HUD nháy theo "bất tử" mà lướt cũng bất tử | Chỉ nháy theo cờ "vừa trúng đòn" |
| Đòn đánh giật lùi 20 px | Căn khung theo gót sau | Căn theo tâm thân |
| Quay đầu thân nhảy 16 px, chen 1 khung đứng | Căn theo mắt; vận tốc đi qua vùng gần 0 | Tâm thân + giữ "chạy" khi \|vx\| > 0,05 |
| Chân lơ lửng khi nhảy/đòn 3 | Cộng `dy` giả | Bỏ `dy` giả, để vật lý quyết |
| Màn rung bậc thang trên iPhone | Làm tròn camera theo px logic (≈2,17 px thật) | Làm tròn theo pixel thật |
| Clip tỉ lệ chạy đều dù đã có ms | Code chia đều theo số khung | Chọn khung theo tổng bước tích luỹ |
| Bản gói > 16 MB | Ảnh PNG lớn | Thu nhỏ theo điểm ảnh thật, lượng tử 256 màu |
| Kiểm thử báo lỗi vì phông Google không tải khi offline | Lỗi mạng `net::ERR_` bị tính là lỗi JS | Lọc `net::ERR_` |
| Ảnh chụp lấy về bị thu nhỏ (591 px) | Canvas phủ khác cỡ vùng chụp | Cỡ CSS canvas = cỡ phần cắt, chụp đúng `[0,0,w,h]` |
| Câu trả lời ChatGPT bị cụt | Đọc khi còn đang viết | Chờ nút dừng biến mất, tải lại cuộc chat rồi đọc |

---

## 7. KIỂM THỬ
1. **Chạy thử không giao diện** (Playwright, Chromium):
   - cỡ iPhone ngang **844×390** và **932×430** @3x, kèm 960×540;
   - giả đồng hồ 60 Hz và 120 Hz.
2. Bộ kiểm thử tự động kiểm:
   - không lỗi JS;
   - HUD và thanh trùm nằm trong vùng an toàn;
   - ô máu ≥ 17 px thật;
   - nút ≥ 44 px và không đè HUD;
   - mọi phòng vào/ra được;
   - dây leo đi được;
   - trùm đánh được.
   Phải **đạt 100%** trước khi commit (ví dụ 66/66).
3. **Rà hình vẽ bằng code khi chạy thật**: bọc `fillRect / strokeRect / arc / ellipse / lineTo / fill / stroke`, ghi dòng mã gọi tới, cho người chơi tự chạy qua mọi phòng, mở bản đồ và đánh trùm. Mọi dòng còn vẽ hình (trừ ánh sáng, hạt) đều phải thay bằng ảnh.
4. **Debug animation** (`?debug=anim`): hiện khung sprite, pivot, tâm thân, hitbox, hộp đòn, tên clip, khung, ms, FPS. Có dừng, chạy từng bước, chạy chậm ×½ / ×¼ / ×⅒, bấm được trên iPhone.
5. Mỗi lần sửa hình: chụp **ảnh trước/sau**, tự xem bằng mắt rồi mới báo.

---

## 8. XUẤT BẢN
- **Chỉ dùng link web thật** (Firebase Hosting, vd https://tieng-vong-cuoi-cun.web.app/). Mỗi lần đẩy lên nhánh, GitHub Actions tự kiểm thử và đưa bản mới lên. Không làm bản gói một file trên claude.ai nữa (bản đó giới hạn 16 MB, dễ buộc phải thu nhỏ ảnh).
- **Không thu nhỏ ảnh gốc** chỉ để vừa giới hạn nào đó. Game tải từng ảnh riêng; gói Firebase miễn phí chỉ giới hạn ~360 MB tải/ngày, và service worker giữ lại ảnh đã tải.
- Thứ tự mỗi đợt việc: sửa → kiểm thử → commit + đẩy lên nhánh làm việc (web tự cập nhật) → đóng tab ChatGPT → báo người dùng bằng tiếng Việt (đã làm gì, % từng việc, còn lại gì).

---

## 9. CÁCH BÁO CÁO CHO NGƯỜI DÙNG (mẫu)
> **Xong: Bản đồ dùng hình ChatGPT** (100%). Nền giấy da, ô phòng, dây rễ nối, biểu tượng chuông/đầu lâu/mặt nạ đều là ảnh; khung HUD và nút Bản đồ cũng đã đổi. Kiểm thử 66/66.
> **Đang làm:** ảnh cho phiên Sức mạnh (40%).
> **Chờ bạn quyết:** thêm khung chuyển cho đòn 4 / chết (cần vẽ thêm, đổi cảm giác chơi).
