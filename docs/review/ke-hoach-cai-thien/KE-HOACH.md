> **TRẠNG THÁI: CHÍNH THỨC** — chủ dự án đã phê duyệt Q1–Q6 ngày 11/10/2026, xem `QUYET-DINH-Q1-Q6.md` cùng thư mục. Thứ tự triển khai chính thức: Q4 (+màn tải) → Q3 → Q1 → Q6 → Q2 → Q5. Mỗi đợt có brief riêng `dot-*.md`.

# LINH KHÍ — Rà soát thiết kế và kế hoạch cải thiện (11/10/2026)

Bản `lk-2026.10.11-0737`, nhánh `khoi-tao-du-an`. Lượt này **chỉ đọc code và viết tài liệu**, không sửa gì. Mọi số đo đều lấy từ code (có ghi tệp và dòng) hoặc từ báo cáo chơi thử ngày 10/10; chỗ nào chỉ là suy đoán có ghi rõ "cần đo".

Cách đọc: **[HIỆN TRẠNG]** = có trong code · **[XÁC NHẬN]** = lỗi đã thấy bằng mắt hoặc đo được · **[CẦN ĐO]** = chưa kiểm · **[ĐỀ XUẤT]** = ý kiến, chưa duyệt · **[QUYẾT]** = bạn phải chọn.

---

## Phần 1 — Đánh giá hiện trạng

### A. Ngoại hình theo trang bị

[HIỆN TRẠNG]
- Đồ đang mặc lưu ở `save.outfit.wear[ô] = mã món` với 5 ô: mũ, áo, lưng, bùa tay, cánh (`outfit.js:8, 135`). Vũ khí lưu riêng. Đổi đồ là `O.look` dựng lại dáng ngay (`outfit.js:222–266`), **không có độ trễ**, không đụng chỉ số hay hitbox (hitbox dùng số cố định trong `hero_tinhlinh.js`, không phụ thuộc hình).
- Khi mặc **≥ 3 món cùng bộ**, game đặt `L.fx.bo = <bộ>` (`outfit.js:244`). Đây chính là móc để chọn **thân mặc sẵn đồ**: `SC.boCua / SC.thanBo / SC.cuaEmBe` (`sprite_custom.js:231–233`) tìm `em-be-<em bé>-<bộ>` (bộ = `rung`, `bien`, `lau`), không có thì lùi về `em-be-<em bé>`, rồi về thân vẽ code. Thân theo bộ tự **ẩn mũ, lưng, bùa** rời (`AN_BO`, :427, :443) vì đã vẽ sẵn trong thân.
- Áo rời **không bao giờ** khoác lên thân AI (`lopDo`, `hero_tinhlinh.js:1269`); chỉ còn viền bậc và dấu ngực. Mũ, lưng, cánh, bùa vẫn là lớp rời ghép bằng điểm neo (định dạng `ghep-<key>` đã chốt 10/10).
- Động tác: thân AI có 8 hàng `idle, move, tele, atk, hit, die, ne, noi`; game ánh xạ 12 trạng thái code sang 8 hàng này (`CHUAN`, :964: run/dash→move, dodge→ne, hurt→hit, hold→tele, spec/cast/sweep→atk). Chỉ có **một hướng** (quay phải, game lật).

[CÒN THIẾU]
- **Chưa có tệp thân theo bộ nào** trong `art/custom/` (chỉ 4 thân gốc). Code đã sẵn, chờ 12 ảnh.
- Mặc 1–2 món của bộ thì thân vẫn là thân gốc → chỉ thấy mũ/lưng đổi, **không thấy áo**. Đây là giới hạn cố ý của phương án "Kết hợp".
- Chưa có bài kiểm chính thức mũ + kiếm + đồ lưng qua đủ 8 hàng động tác trên thân AI (chỉ mới soi bằng mắt lúc sửa lỗi đồ bay).

[CẦN ĐO]
- Hàng `die` và `noi` của 4 thân AI hiện có khớp điểm neo chưa (hàng này ít được nhìn lúc sửa).
- `tele` (mượn cho `hold` = lấy đà búa) có hợp dáng không.

### B. Sàn, tường, cửa, vật thể

[HIỆN TRẠNG]
- Sàn **không dùng tile**: lâu đài vẽ gạch 16 px lệch hàng, mỗi viên một sắc ngẫu nhiên, 7% có vết nứt (`room_art.js:167–178`); hang là đá Voronoi ô 25 (`:406+`); rừng là nhiễu giá trị nhiều tầng + đường mòn + rêu sát tường, tô bậc màu bằng dither Bayer 4×4 (`:599+`, `:80–95`). Vỏ phòng dựng **một lần theo hạt giống** rồi cache (`buildShell`, `:994`) → không tốn máy mỗi khung.
- Phòng thường: sàn x 136–344, y 56–252 → **208 × 196 px game**, tức 43% bề ngang canvas; trừ lề trong còn 190 px chơi được (~40%). Phòng trùm x 80–380 (`:973–978`).
- Em bé cao 29 px trong ô 48 (≈ 11% chiều cao canvas). Cửa vẽ code tại `:268, :495, :712`.
- Vật thể tương tác (rương, suối, bàn thờ, chậu than…) vẽ code, mỗi thứ một hàm.

[CÒN THIẾU] Chưa có quy chuẩn tile vì chưa từng dùng tile. Chưa có ảnh AI nào cho môi trường.

### C. Bảng màu

[HIỆN TRẠNG] Mỗi lô ảnh AI được giảm màu riêng bằng median-cut trong công cụ (`giamMau`), **không có bảng màu chung**. Quái, em bé, vũ khí vẽ cách nhau nhiều ngày nên lệch tông. Code vẽ sàn/giao diện dùng màu cố định trong `room_art.js`, `btn_art.js` → không ăn khớp với ảnh AI (báo cáo chơi thử: "lẫn phong cách").
Hệ có 3: Lửa, Độc, Băng (không có Nước, Sét, Phong, Đất).

### D. Trùm vùng nhiều pha

[HIỆN TRẠNG] `A.boss` truyền `phase = b.phase + 1` cho máy vẽ (`boss.js:399–414`). Khi có ảnh AI, `sprite_custom.js:187–199` **bỏ qua pha hoàn toàn**: 3 pha cùng một ảnh, động tác `phase2/phase3` chỉ phát hàng `tele` (:124). Riêng Hồ Tinh pha 3 bị co 72% (`boss.js:408`) — với ảnh AI thì co luôn cả thân, [XÁC NHẬN] là lỗi hiển thị.
Hiệu ứng chiêu của trùm (tường sóng, cột băng, gai rễ…) vẫn vẽ code bám tầm đòn → đúng vùng nguy hiểm, không nên chuyển sang ảnh.

### E. Điều khiển trên điện thoại

[HIỆN TRẠNG] (`stage.js:567–615`, đơn vị px game; 1 px game = 2 px màn thật ở 960×540; trên điện thoại 844×390 thì 1 px game ≈ 1,76 px CSS ≈ 0,47 mm)
- Nút Đánh bán kính **28** (đường kính 56 px game ≈ 26 mm trên điện thoại), vùng chạm +6.
- Lăn r18, Chiêu r18, Chưởng r18 (đường kính 36 ≈ 17 mm). Khoảng cách tâm Đánh–Lăn ≈ 56, Đánh–Chiêu ≈ 52.
- Cần điều khiển: mọi chạm **nửa trái** (x < 240, y > 48) không trúng nút đều thành cần; lệch tối đa 24, vùng chết 0,18.
- Phòng trùm có bố cục nút dời ra mép (`BTN_BIG`).
- Chuẩn Apple/Google là ≥ 9–10 mm/mục tiêu → kích thước nút **đã vượt chuẩn**, không phải vấn đề. [CẦN ĐO] bấm nhầm Lăn khi vuốt lên từ Đánh, và ngón cái che góc dưới-phải nơi quái hay dồn.

### F. Hiệu năng, tải, đăng nhập, dung lượng

| | Trạng thái | Bằng chứng |
|---|---|---|
| Sân đấu nhỏ | **[XÁC NHẬN]** | sàn 208/480 px; canvas cố định 480×270, không có camera (`engine.js:56`); trên điện thoại 19,5:9 còn thêm lề đen `G.ox` |
| Bắt đăng nhập | **[XÁC NHẬN]** | `titleGate` (`village.js:785–790`): có mây thì phải Google; "Chơi tạm" chỉ hiện khi mây lỗi/quá 10 s/đăng nhập hỏng (:886). Game **đã** đăng nhập ẩn danh Firebase trước (`cloud.js:2`) và Google dùng `linkWithPopup` giữ nguyên tiến trình (:245–253) → kiến trúc **hỗ trợ chơi trước, đăng nhập sau** |
| Không màn hình tải | **[XÁC NHẬN]** | `index.html:53–57` chỉ có canvas + script; `build.py:44–56` gom hết vào 1 `<script>` → trang trắng/đen cho tới khi tải xong 10,4 MB |
| Dung lượng | **[CẦN ĐO]** | 10,4 MB hiện tại; ước 4–6 MB thêm là suy ra từ số hình, chưa đo thật. Cần đo riêng: phần ảnh base64 chiếm bao nhiêu, nén gzip của Firebase Hosting còn bao nhiêu khi truyền |
| FPS | [CẦN ĐO] trên điện thoại thật | máy thử không có GPU |

---

## Phần 2 — Bảng quyết định

| Hạng mục | Phương án khuyến nghị | Lý do | Không chọn | Rủi ro chính |
|---|---|---|---|---|
| **A. Ngoại hình** | **Giữ "Kết hợp"**: áo = thân mặc sẵn theo bộ (12 thân); mũ/lưng/cánh/bùa/vũ khí = lớp rời theo điểm neo. **Thêm**: quy tắc hiển thị khi mặc lẻ (xem Phần 5, Q1) | Code đã xong, chỉ chờ 12 ảnh. Áo rời đã thử và hỏng (che mặt, không ôm thân). 12 thân = 12 × 56 khung, trong tầm vẽ | Áo ghép lớp: cần vẽ áo **theo từng khung** của từng thân (12 áo × 56 khung = 672 khung) mới ôm được, đắt hơn 12 thân mà vẫn dễ lệch. Thân riêng cho mọi tổ hợp: bùng nổ số ảnh | Mặc 1–2 món bộ không thấy áo; người chơi tưởng lỗi |
| **B. Sàn** | **Tile 16 px** (nét gấp đôi = 32 px ảnh) cho sàn và tường, **3 biến thể sàn + 1 viên "điểm nhấn"** mỗi vùng, rải theo hạt giống phòng; cửa/rương/suối/bàn thờ… là **ảnh độc lập kiểu `giao-dien`**, neo giữa đáy | 16 px khớp gạch lâu đài đang có và bội số của 208×196 (13 × 12,25 → cần chỉnh phòng thành 208×192, xem rủi ro). Vẫn dùng hạt giống nên mỗi phòng vẫn khác | Vẽ cả nền phòng một tấm: 1 ảnh/phòng, không tái dụng, 20+ tấm/vùng, nặng. Tile 8 px: quá vụn ở nét gấp đôi | Hoa văn lặp lộ; chiều cao sàn 196 không chia hết 16 (xem Q2) |
| **C. Màu** | **Bảng lõi 32 màu** (da, tóc, gỗ, đá, kim loại, vải cơ bản) + **3 dải hệ** 4 màu mỗi hệ, ghi vào **mọi prompt** và dùng làm **bảng đích khi giảm màu** trong công cụ (thay median-cut tự do) | Thống nhất tông mà không vẽ lại gì: chỉ đổi cách giảm màu khi nhập lô mới | Vẽ lại 36 quái/160 vũ khí theo bảng mới: trái nguyên tắc không đụng asset đã duyệt | Bảng chọn sai thì mọi lô sau lệch với lô cũ; cần duyệt bảng bằng ảnh thử trước |
| **D. Trùm pha** | Quy tắc 3 bậc: (1) pha chỉ **đổi màu/tâm trạng** → một ảnh + nhuộm và hiệu ứng lớp trên; (2) pha **đổi hình dáng** (hoá băng, hoá độc, hoá cuồng) → vẽ **lưới rút gọn 4 hàng** idle/tele/atk/hit, hàng die/move/ne/noi mượn pha 1; (3) chỉ vẽ đủ 8 hàng khi pha thay đổi cả cách di chuyển. Sửa lỗi co 72% Hồ Tinh | Cả 3 trùm vùng hiện là trường hợp (2): 3 × 2 pha × 4 hàng = 24 hàng thay vì 48 | Vẽ đủ 8×6 cho từng pha: gấp đôi công; Chỉ nhuộm màu: không đủ "hoá băng/độc" | Hàng mượn (die) từ pha 1 lệch dáng với pha 3 → cần soi |
| **E. Điều khiển** | **Không đổi cỡ nút**. Làm bài đo trên máy thật trước (Phần 4) | Nút đã lớn hơn chuẩn; vấn đề thật là **sân nhỏ**, không phải nút | Thu nhỏ nút để lộ sân: không giải quyết gốc | — |
| **F1. Sân đấu** | **Mở rộng sàn phòng thường lên ~300 × 196** (từ 208) và kéo tường ra, giữ canvas 480×270, giữ cỡ em bé, giữ bố cục nút | Không cần camera, không đụng quái/ảnh. Sàn to là tăng diện tích chơi 45% | Camera zoom theo em bé: phải sửa toàn bộ toạ độ chạm, hiệu ứng, chữ; rủi ro lớn. Phóng em bé: phải vẽ lại tất cả | Phòng to → mật độ quái thưa, phải chỉnh số quái/tốc độ (gameplay) |
| **F2. Đăng nhập** | **Cho vào chơi ngay** bằng tài khoản ẩn danh có sẵn; nút Google ở màn chào và ở Anh Mõ; nhắc đăng nhập sau ải 1 | Kiến trúc đã có `linkWithPopup`, không mất tiến trình | Giữ bắt đăng nhập: mất người mới | Người đã có tài khoản Google và tiến trình cũ nhưng mở máy mới → đi nhầm vào ẩn danh; cần nút "Tôi đã có tài khoản" rõ |
| **F3. Màn tải** | Thêm **khối HTML tĩnh** (logo chữ + vạch tải) vào `index.html` trước thẻ script, ẩn khi game sẵn sàng; **tách ảnh** ra tệp riêng tải sau khung game | Đơn giản, 1 tệp | Chia nhỏ JS: tốn công hơn, làm sau | Tách ảnh ra tệp riêng đổi cách `build.py` nhúng → cần kiểm "không có tệp thì y hệt cũ" |
| **F4. Dung lượng** | Trần **20 MB** nếu tách ảnh tải sau; **15 MB** nếu vẫn 1 tệp. Đo trước, không giảm nét máy móc | Cỡ truyền thật nhỏ hơn nhờ gzip (base64 nén ~25–30%) | — | Chưa đo |

---

## Phần 3 — Kế hoạch triển khai (theo đợt)

Mỗi đợt là 1 phiên làm việc riêng, xong là đẩy lên và báo. Số thứ tự là **ưu tiên**, đợt sau không cần chờ đợt trước trừ khi ghi "phụ thuộc".

**Đợt 1 — Ba lỗi trải nghiệm (code, không cần ảnh)** · ~2 giờ
- Mục tiêu: người mới mở link là chơi được và thấy game đang tải.
- Phạm vi: F2 (vào chơi ngay, nút Google), F3 (màn tải tĩnh), sửa co 72% Hồ Tinh (D).
- Phụ thuộc: không.
- Kết quả: mở link → thấy vạch tải → màn chào có "Chơi ngay" và "Đăng nhập Google".
- Nghiệm thu: (1) chơi ẩn danh xong ải 1, đăng nhập Google → tiến trình còn nguyên; (2) tài khoản Google đã có tiến trình đăng nhập trên máy mới → nhận đúng tiến trình mây; (3) `cloud=0` vẫn chơi được; (4) kiểm `cloud_save_regression` qua.

**Đợt 2 — Sân đấu rộng** · ~3 giờ · [cần duyệt Q3]
- Mục tiêu: sàn phòng thường rộng 300 px.
- Phạm vi: `RA.geo`, cửa, vị trí sinh quái, bố cục nút khi `G.cx` nhỏ, chữ chỉ dẫn dời xuống đáy giữa.
- Phụ thuộc: không; **nên làm trước Đợt 5** để tile vẽ theo cỡ phòng mới.
- Nghiệm thu: ảnh chụp 844×390 sàn ≥ 60% bề ngang; bot qua ải 1 không thua; không nút nào đè lên sàn.

**Đợt 3 — Kiểm chứng ghép đồ (A)** · ~1 giờ
- Mục tiêu: xác nhận hệ lớp rời đúng trên thân AI.
- Phạm vi: Cu Tí + 1 mũ + 1 kiếm + 1 đồ lưng, chụp 8 hàng × từng khung, soi lệch; sửa `diem_theo` nếu lệch.
- Nghiệm thu: không khung nào lệch > 1 px game; lăn ẩn mũ đúng; `die` đồ xoay cùng thân.

**Đợt 4 — Bảng màu lõi (C)** · ~1,5 giờ · [cần duyệt bảng]
- Mục tiêu: chốt 32 + 12 màu, ghi vào prompt mọi công cụ, công cụ giảm màu theo bảng (tuỳ chọn, mặc định tắt để lô cũ không đổi).
- Phụ thuộc: ảnh tham chiếu đã duyệt (4 em bé, 3 trùm vùng).
- Nghiệm thu: một lô thử (2 vật thể phòng) nhập bằng bảng mới đặt cạnh quái cũ, bạn duyệt bằng mắt.

**Đợt 5 — Tile sàn/tường vùng Rừng (B, lô thử)** · ~3 giờ · [cần duyệt Q2]
- Mục tiêu: 1 vùng chạy tile thật, đo cảm giác lặp.
- Phạm vi: định dạng `gd-san-<vùng>-<n>`, bộ rải theo hạt giống, cửa ảnh; **có cờ tắt** để quay về sàn code.
- Phụ thuộc: Đợt 2 (cỡ phòng), Đợt 4 (màu), ảnh từ ChatGPT.
- Nghiệm thu: 5 phòng liên tiếp không thấy hai phòng giống nhau; không hở mép tile ở 960×540 và ở tỉ lệ lẻ; FPS không giảm.

**Đợt 6 — Vật thể phòng và cửa** · theo lô (đang chạy làn A)
**Đợt 7 — Trùm pha (D)**: móc `phase` trong `sprite_custom.js:187`, lưới rút gọn 4 hàng · ~2 giờ + ảnh
**Đợt 8 — 12 thân theo bộ**: nhập ảnh, kiểm 8 hàng × 12 · theo ảnh về
**Đợt 9 — Đo điện thoại thật (E, F)**: checklist Phần 4, kết quả quyết có đổi gì không.
**Đợt 10 — Dung lượng**: đo, tách ảnh tải sau nếu cần.

---

## Phần 4 — Checklist kiểm thử (dùng cho mọi đợt)

**Tiến trình và mây**
- [ ] Không có tệp ảnh mới → game y hệt bản trước (so ảnh chụp 3 phòng).
- [ ] Lưu cục bộ `linhkhi_save_v1` đọc được từ bản cũ.
- [ ] Ẩn danh → Google (link) giữ tiến trình; Google có sẵn tiến trình → không ghi đè nhầm; `?cloud=0` chơi được.
- [ ] `tests/cloud_save_regression` qua.

**Hình và ghép**
- [ ] Mỗi em bé × 8 hàng động tác: mũ, lưng, cánh, vũ khí không lệch, không rụng, đúng thứ tự lớp; lăn ẩn mũ/cánh.
- [ ] Đổi/tháo từng món: hình đổi ngay, chỉ số không đổi (so bảng chỉ số trước/sau).
- [ ] Trùm 3 pha: đúng ảnh pha, không co sai cỡ, vùng báo đòn vẫn đúng vị trí.
- [ ] Tile: không hở mép ở tỉ lệ 16:9, 19,5:9, 4:3; không khung nào tụt FPS < 50 trên điện thoại tầm trung.

**Điều khiển (máy thật, 2 điện thoại cỡ khác nhau)**
- [ ] 20 lần vuốt Đánh→Lăn: số lần bấm nhầm.
- [ ] Phòng đông (≥ 6 quái): ngón cái che bao nhiêu % sàn; có mất dấu quái góc dưới-phải không.
- [ ] Độ trễ chạm → đòn ra (quay màn hình 60 fps, đếm khung).
- [ ] Búa: giữ Đánh có hiểu là lấy đà không (lỗi lời dạy ải 1).

**Tải**
- [ ] Mạng 4G giả lập (1,5 Mbps): thấy vạch tải trong 1 s; thời gian tới màn chào.
- [ ] Dung lượng `dist/linh-khi.html` và cỡ truyền gzip.

---

## Phần 5 — Quyết định cần bạn phê duyệt

**Q1. Mặc lẻ 1–2 món của bộ thì thân hiện gì?**
- (a) Thân gốc + mũ/lưng rời, áo không thấy (hiện tại, không làm gì thêm).
- (b) Thân gốc nhưng **nhuộm vải** theo màu bộ (code, ~1 giờ, dễ).
- (c) Hiện thân bộ ngay khi mặc **áo** của bộ (bỏ ngưỡng 3 món) — đơn giản, hợp trực giác "mặc áo thì thấy áo", nhưng mũ/lưng cùng bộ sẽ bị ẩn rời và dùng bản vẽ sẵn trong thân.
→ Khuyên **(c)**.

**Q2. Tile sàn:** chuyển sàn/tường sang tile 16 px (3 biến thể/vùng) **hay** giữ sàn tự sinh bằng code và chỉ vẽ ảnh cho cửa + vật thể? Chuyển thì cần chỉnh chiều cao sàn 196 → 192 (bội số 16).
→ Khuyên **chuyển, thử 1 vùng Rừng trước, có cờ tắt**.

**Q3. Sân đấu:** mở rộng sàn 208 → 300 px (phòng chơi to hơn, quái thưa hơn, cần chỉnh số quái) **hay** giữ cỡ phòng?
→ Khuyên **mở rộng**, đây là lỗi lớn nhất của chơi thử.

**Q4. Đăng nhập:** cho chơi ẩn danh ngay, nhắc Google sau ải 1? (Hiện bắt đăng nhập.)
→ Khuyên **cho chơi ngay**.

**Q5. Trần dung lượng:** 15 MB (một tệp) hay 20 MB (tách ảnh tải sau)?

**Q6. Bảng màu lõi:** đồng ý lập bảng 32 + 12 màu và dùng từ lô mới trở đi (không đụng lô cũ)?

Những việc **đã thống nhất, không hỏi lại**: phương án Kết hợp (12 thân), bỏ mặt nạ, tên 4 em bé, nét gấp đôi, định dạng điểm neo, giữ code cho chữ/thanh máu/vùng báo đòn/bóng/dây cung.

---

## Phần 6 — Việc làm tiếp theo (xếp theo tác động ÷ chi phí)

| # | Việc | Tác động | Rủi ro | Chi phí | Cần duyệt |
|---|---|---|---|---|---|
| 1 | Chơi ngay không bắt đăng nhập (F2) | rất cao | thấp (kiến trúc có sẵn) | 1 giờ | Q4 |
| 2 | Màn hình tải tĩnh (F3) | cao | rất thấp | 30 phút | — |
| 3 | Sửa co 72% Hồ Tinh pha 3 (D) | vừa | rất thấp | 15 phút | — |
| 4 | Mở rộng sàn phòng thường (F1) | rất cao | vừa (gameplay) | 3 giờ | Q3 |
| 5 | Kiểm chứng ghép mũ+kiếm+lưng 8 hàng (A) | vừa | thấp | 1 giờ | — |
| 6 | Bảng màu lõi + công cụ giảm màu theo bảng (C) | cao về lâu dài | thấp (tuỳ chọn) | 1,5 giờ | Q6 |
| 7 | Móc pha trùm cho ảnh AI + lưới 4 hàng (D) | vừa | thấp | 2 giờ + ảnh | — |
| 8 | Tile sàn thử vùng Rừng (B) | cao | vừa | 3 giờ + ảnh | Q2 |
| 9 | Nhập 12 thân theo bộ + quy tắc mặc lẻ (A) | cao | thấp | theo ảnh | Q1 |
| 10 | Đo điện thoại thật (E) | quyết định các bước sau | — | 1 giờ, cần bạn cầm máy | — |
| 11 | Đo dung lượng, tách ảnh tải sau (F4) | vừa | vừa (đổi build) | 2 giờ | Q5 |

Việc 1–3 có thể gom thành **một phiên ~2 giờ** chạy ngay sau khi 3 làn sáng nay xong (~09:30), nếu bạn duyệt Q4.
