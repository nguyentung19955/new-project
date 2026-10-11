# Trang trạng thái dự án Linh Khí — cập nhật 11/10/2026 18:25

Một bảng duy nhất, thay cho mọi tổng hợp cũ (`docs/review/TONG-HOP.md` ngày 10/10 đã lỗi thời, chỉ giữ để tra cứu). Bản đang chạy trên https://spiritblade.web.app: **lk-2026.10.11-1817** (web dùng 2 tệp từ Đợt 10). Mọi mục đều có cờ tắt hoặc `git revert` theo báo cáo tương ứng.

Trạng thái: **ĐÃ LÀM + ĐÃ KIỂM** (có báo cáo, ảnh, số đo, workflow xanh) · **ĐANG CHẠY** (phiên đang làm) · **CHỜ ẢNH** (code xong, cần ảnh ChatGPT/Pippit) · **ĐÃ QUYẾT, CHƯA LÀM** · **CHỜ DUYỆT**.

## 0. TỔNG KẾT NGÀY 11/10/2026 (18:25)

**Mọi làn code đã xong.** Đợt 1–11, 8b, D2b và 19 phiên làn A–E đều có báo cáo, workflow xanh; game không có ảnh mới thì y hệt cũ. Không mở phiên mới: A4 (tile Hang biển, Lâu đài) chờ ảnh tile Rừng thật; E3 không làm. Bản trên web: **lk-2026.10.11-1817** (2 tệp: trang chính + ảnh tải sau).

Sửa công cụ chiều nay (theo ảnh thật của chủ dự án): nút sao chép chép đúng prompt lô gộp; báo chọn nhầm lô + nút chuyển lô; prompt mọi trang dặn không lấy lại bố cục ảnh trước, tấm kín dặn không kẻ lưới; lô gộp cắt theo vạch kẻ tối (10/10 tấm thật, 27/27 hàng đúng). Bộ 17 ảnh lưới trống + prompt kèm lưới: `luoi-trong-17-lo.zip` (đã gửi).

### Ảnh còn phải gen (trang công cụ · có gửi kèm ảnh không)
| Lô | Trang | Gửi kèm |
|---|---|---|
| B1 · 3 tấm (Đạn tròn và bom; Gai, hạt độc, tên Độc/Băng; Đạn cầu, bùa, pháo, lửa, tên Lửa) | tach-hieu-ung | lưới trống 01, 02, 03 |
| B2 · Lướt chém + Nện đất; Ra chưởng Độc + Băng (không bắt buộc) | tach-hieu-ung | lưới 07, 06 |
| B3 · Băng vỡ, Đóng băng, Cổng, Cột nước; Trùm nổ cuối (lẻ) | tach-hieu-ung | lưới 10 |
| A1 · 18 đồ vật phòng | tach-phong | — |
| A2 · Cửa gộp 3 vùng; ổ khoá + đầu lâu | tach-phong | lưới 17 |
| A3 · Trang trí 3 vùng (3 tấm) + lửa đuốc | tach-phong | — |
| C1 · 14 nút; C2 · 30 biểu tượng nhỏ | tach-giao-dien | — |
| C3 · Hình lớn; Logo (tự đọc lại chữ LINH KHÍ) | tach-giao-dien | — |
| C4 · Thân nút; Ô vũ khí (nền xanh lá) | tach-giao-dien | — |
| C5 · Khung 9 mảnh | tach-giao-dien | — |
| Bản đồ ải (3 lô) | tach-giao-dien | — |
| D1 · 6 công trình làng | tach-lang | 2 ảnh tham chiếu trên trang |
| D2 · 12 đạo cụ; Khung cửi + Lửa lò (gộp) | tach-lang | ảnh tham chiếu trên trang |
| D3 · Nền làng; Tranh bản đồ vùng | tach-lang | 2 ảnh tham chiếu mỗi tấm (bắt buộc) |
| Tile Rừng già (Đợt 6) | tach-phong | — |
| 7 người làng | tach-anh-hung | — |
| E2 · 6 dáng pha 2, 3 của 3 trùm | tach-quai | ảnh pha 1 (nút trên trang) |
| 11 thân theo bộ trang phục | tach-anh-hung | 2 ảnh trong `bo-trang-phuc/anh-kem/` |

### Mặc định đã áp (đổi ý thì báo)
Web dùng 2 tệp (Đợt 10) · không làm E3 · 5 lô gộp lệch dáng vẫn gộp · D2 gộp khung cửi + lửa lò · bản Lửa đi kèm bản Chung ở lô Ra chưởng và Tiến hoá · hình lớn D3 để ở trang chính tới khi build.py báo trang chính > 5 MB · bảng màu lõi dùng từ lô mới · giữ bam/bam_vk · kiếm đi qua mặt 2 khung đầu (2a) · tile giữ vẽ đè · nút Đánh đồng vàng · 8b trùm giữ ô dấu.

### Việc chỉ chủ dự án làm được
Chơi thử trên iPhone bản 1817 (~10 phút): hiệu ứng mới có đẹp và đúng chỗ không, cột lửa có nhỏ quá không, viền hệ quanh thanh máu đủ rõ không, búa giữ nút, sân 300, chữ che quái. Gen các tấm ở bảng trên, gửi zip.

## 1. Kế hoạch cải thiện (Q1–Q6 + phát sinh)

| Đợt | Việc | Trạng thái | Bản | Báo cáo | Quay lui |
|---|---|---|---|---|---|
| 1 | Chơi ngay không bắt đăng nhập; màn hình tải; sửa co Hồ Tinh pha 3 | ĐÃ LÀM + ĐÃ KIỂM (52/52) | 0822 | `dot-1/bao-cao.md` | revert từng commit |
| 1-B | Khách đã qua ải liên kết Google có tiến trình → luôn hỏi chọn bản | ĐÃ LÀM + ĐÃ KIỂM (7/7 ca) | 0835 | `dot-1/bao-cao.md` §9 | revert 050f6efd |
| 2 | Sân phòng thường 208 → 300 px | ĐÃ LÀM + ĐÃ KIỂM (bot 40/40, nhịp +4–9%) | 0854 | `dot-2/bao-cao.md` | `RA.RONG_PHONG` / revert |
| 3 | Áo của bộ chọn thân; đồ lưng/cánh/bùa không nhảy lên đầu (Cu Tí) | ĐÃ LÀM + ĐÃ KIỂM | 0854 | `dot-3/bao-cao.md` | `O.THAN_THEO_AO=false` |
| 4 | Bảng màu lõi 32 + 12; prompt; tuỳ chọn giảm màu theo bảng | ĐÃ LÀM + ĐÃ KIỂM; **chờ duyệt bảng màu** (mặc định: dùng) | 1001 | `dot-4/bao-cao.md` | tuỳ chọn mặc định Tự do |
| 5 | Vũ khí khớp tay thân AI; neo đỉnh đầu 13 mũ; ghép 3 em bé | ĐÃ LÀM + ĐÃ KIỂM (lệch ≤ 0,7 px; nhật ký sát thương trùng) | 1118 | `dot-5/bao-cao.md` | xoá `ghep-*` / revert |
| 6 | Tile sàn/tường Rừng già, cờ `G.TILE_RUNG` | CHỜ ẢNH (máy móc đã kiểm bằng tile mẫu) | 1118 | `dot-6/bao-cao.md` | cờ tắt |
| 7 | Trạng thái độc/cháy/băng trên thân quái; bỏ biểu tượng trạng thái trên đầu | ĐÃ LÀM + ĐÃ KIỂM | 1200 | `dot-7/bao-cao.md` | `G.TRANG_THAI_TREN_THAN=false` |
| 7+ | Bỏ khung khối băng quanh quái đóng băng | ĐÃ LÀM (chưa kiểm riêng) | 5633e605 | — | revert 5633e605 |
| 8 | Độ đọc trận đấu: thứ bậc hình ảnh, đỏ chỉ cho nguy hiểm, số sát thương, vùng thông báo | ĐÃ LÀM + ĐÃ KIỂM | 1354 | `dot-8/bao-cao.md` | `G.DO_DOC_TRAN` |
| 8b | Bỏ ô dấu Linh Khí trên đầu quái → viền hệ quanh thanh máu | ĐÃ LÀM + ĐÃ KIỂM (cờ tắt: 0 điểm ảnh khác; bot ải 1 thắng, nhật ký sát thương trùng) | 0a65ce59 | `dot-8/bao-cao.md` §8b | `G.DAU_LINH_KHI_VIEN=false` / `?dauvien=0` |
| 9 | Trang trạng thái này + đồng bộ TONG-HOP | ĐÃ LÀM | — | tệp này | — |
| 10 | Đo dung lượng, tách ảnh tải sau (Q5): web dùng 2 tệp, tới màn chào ở 1,5 Mbps 37,4 → 9,0 giây; trần còn 9,9 MB / 20 MB | ĐÃ LÀM + ĐÃ KIỂM (6 kịch bản tệp ảnh có/thiếu/hỏng; chưa xem được dòng lưu đệm bằng `curl -I`); **chờ duyệt 5 quyết định, có E3** | 471c6c0d | `dot-10/bao-cao.md` | `HAI_TEP: '0'` trong workflow / revert 471c6c0d |
| 11 | Gộp prompt hình nhỏ (B1/B2/B3/A2/D2) thành ít tấm hơn: 50 → 20 tấm (làn D2b gộp tiếp khung cửi + lửa lò: còn **19**); nhóm "Lô gộp" trên trang Tách Hiệu Ứng, lô gộp cửa trên trang Tách Phòng | ĐÃ LÀM + ĐÃ KIỂM bằng ảnh lưới máy vẽ (32/32 mục; tệp ra giống gen lẻ từng byte). **Chưa thử với ảnh ChatGPT thật.** D2 đã gộp ở làn D2b (mục 9.2 phương án b). Chờ duyệt 3 điểm còn lại | a2557d7 | `dot-11/bao-cao.md` | prompt lẻ cũ vẫn giữ; `git revert a2557d7 a661baf 30eabd9` |

## 2. Làn chuyển hình code → ảnh AI (19 phiên)

| Phiên | Việc | Trạng thái | Prompt |
|---|---|---|---|
| A1 | 18 đồ vật phòng; trang Tách Phòng | CHỜ ẢNH | `phong-a1/PROMPT.md` |
| A2 | 18 cửa + ổ khoá + đầu lâu | CHỜ ẢNH | `phong-a2/PROMPT.md` (cách nhanh: **2 tấm** thay 4) |
| A3 | Đồ trang trí 3 vùng | CHỜ ẢNH | `phong-a3/PROMPT.md` |
| A4 | Sàn/tường Hang biển, Lâu đài | ĐÃ QUYẾT: chỉ sau khi Rừng có ảnh thật và duyệt | — |
| B1 | 14 dải đạn/bom/tên | CHỜ ẢNH | `hieu-ung-b1/PROMPT.md` (cách nhanh: **3 tấm** thay 14) |
| B2 | 8 dải đòn/chiêu (+ bản theo hệ) | **ĐÃ NHẬP ẢNH** 18:17: Trảm Nguyệt, Vệt cào, Buông cung, Ra chiêu, Ra chưởng + bản Lửa, Giáo quét. Còn: Lướt chém, Nện đất (lô 6 khung), Ra chưởng Độc + Băng (không bắt buộc) | `hieu-ung-b2/PROMPT.md` |
| B3 | 15 dải nổ/trạng thái/trùm/cổng | **ĐÃ NHẬP ẢNH** 18:17: Em bé trúng đòn, Nổ nhỏ, Vòng phép, Lấp lánh, Hồi máu, Sao choáng, Cột lửa (hơi nhỏ, có thể gen lẻ lại), Nổ khói, Sốc nhiệt, Tiến hoá + 3 bản hệ. Còn: lô hồng tím 6 khung (Băng vỡ, Đóng băng, Cổng, Cột nước), Trùm nổ cuối | `hieu-ung-b3/PROMPT.md` |
| B4 | 7 vũng trên sàn | **ĐÃ NHẬP ẢNH** 18:17 (đủ 7) | `hieu-ung-b4/PROMPT.md` |
| C1 | 14 biểu tượng nút | CHỜ ẢNH | `giao-dien-c1/PROMPT.md` |
| C2 | 30 biểu tượng nhỏ; biểu tượng tinh anh 12×12 | CHỜ ẢNH (phóng to đã lên) | `giao-dien-c2/PROMPT.md` |
| C3 | Hình cố định lớn: nút Nói chuyện, thẻ ải, thẻ ải trùm (mỗi thứ 3 trạng thái), mặt trống đồng, logo LINH KHÍ. 2 tấm ảnh | CHỜ ẢNH (code và công cụ đã kiểm bằng ảnh mẫu; báo cáo `giao-dien-c3/bao-cao.md`) | `giao-dien-c3/PROMPT.md` |
| C4 | Thân nút (6 vòng nút, nút vuông), đế và núm cần điều khiển, khung ô vũ khí 4 bậc. 2 tấm ảnh | CHỜ ẢNH (code và công cụ đã kiểm bằng ảnh mẫu, vị trí và cỡ nút trùng bản cũ; cờ tắt `G.THAN_NUT_ANH`; báo cáo `giao-dien-c4/bao-cao.md`, có 3 điểm chờ duyệt) | `giao-dien-c4/PROMPT.md` |
| C5 | Khung co giãn 9 mảnh: 8 ô đồ (4 bậc, thường và đang chọn), 3 vỏ thanh (máu, mana, kinh nghiệm), 3 khung trùm / tinh anh, 1 thẻ. 1 tấm ảnh | CHỜ ẢNH (code và lô "Khung 9 mảnh" trên trang Tách Giao Diện đã kiểm bằng ảnh mẫu; không có tệp: khác bản cũ 0 điểm ảnh; bốn góc khung giữ nguyên ở mọi cỡ; **chưa thử ảnh ChatGPT thật**; cờ tắt `G.KHUNG_ANH`; quay lui `git revert 674859e 34d2d2d`; chờ duyệt 4 điểm; báo cáo `giao-dien-c5/bao-cao.md`) | `giao-dien-c5/PROMPT.md` |
| D1 | 6 công trình làng; trang Tách Làng | CHỜ ẢNH | `lang-d1/PROMPT.md` |
| D2 | 12 đạo cụ + khung cửi, lửa lò. **2 tấm ảnh** (làn D2b: khung cửi và lửa lò vẽ chung 1 tấm 2 hàng × 3 khung, nền xanh dương; lô gộp nằm cuối danh sách trên trang Tách Làng) | CHỜ ẢNH (lô gộp đã kiểm bằng ảnh mẫu 25/25 mục: 2 tệp ra giống hai lô lẻ từng byte, xem thử trong làng hiện cả hai; **chưa thử ảnh ChatGPT thật**; có 3 điểm chờ duyệt; quay lui `git revert 4d81405`; báo cáo `lang-d2b/bao-cao.md`) | `lang-d2/PROMPT.md` (cách nhanh: **2 tấm** thay 3; hai lô lẻ giữ làm dự phòng) |
| D3 | Nền làng 720×270 (`gd-lang-nen`) + tranh bản đồ vùng 480×270 (`gd-ban-do-vung`, một tranh cho cả 3 vùng). 2 tấm ảnh, mỗi tấm gửi kèm 2 ảnh tham chiếu | CHỜ ẢNH (code và công cụ đã kiểm bằng ảnh mẫu; không có tệp: khác bản cũ 0 điểm ảnh; workflow xanh; **chưa thử ảnh ChatGPT thật**; chờ duyệt 4 điểm, trong đó nét thường hay gấp đôi; quay lui: xoá tệp ảnh hoặc `git revert 5404783 5150b00`; báo cáo `lang-d3/bao-cao.md`) | `lang-d3/PROMPT.md` |
| E1 | 3 đồ lưng vẽ lại + cánh theo cấp | **ĐÃ NHẬP ẢNH** (6 đồ lưng 11:25; 8 cánh cấp 1 và 3 lúc 18:17) | `trang-bi-e1/PROMPT.md` |
| E2 | Trùm đổi hình theo pha | CHỜ ẢNH (6 prompt) | `quai-e2/PROMPT.md` |
| E3 | Tách lại 36 quái nét gấp đôi | KHÔNG LÀM (Đợt 10: vượt trần 20 MB; mặc định đã áp) | — |
| — | Bản đồ ải (tach-giao-dien) | CHỜ ẢNH | `giao-dien/PROMPT.md` |
| — | 7 người làng | CHỜ ẢNH | `nguoi-lang`… |
| — | 12 thân theo bộ trang phục | Cu Tí · Rừng Già **ĐÃ NHẬP** 18:17 (tay khớp thân gốc; đầu lệch 2, thân lệch 1 điểm ảnh, trong mức cho phép). Còn 11 tấm (Cu Tí Hang Biển, Lâu Đài; 9 tấm 3 em bé kia) | `bo-trang-phuc/PROMPT.md` + `anh-kem/` |

## 3. Công cụ

| Việc | Trạng thái |
|---|---|
| Nhận vạch kẻ dày (7 trang) | ĐÃ LÀM + ĐÃ KIỂM (sáng 11/10) |
| Không lấy nhầm vạch dày/viền làm nền (6 trang) | ĐÃ LÀM + ĐÃ KIỂM |
| Tự nhận ô có nền lệch màu (7 trang) | ĐÃ LÀM + ĐÃ KIỂM (`cong-cu-nen-o/bao-cao.md`) |
| Ô Bản màu chỉ hiện ở 8 mục B2 | ĐÃ LÀM |
| Prompt bộ trang phục đòi 2 ảnh kèm | ĐÃ LÀM |

## 4. Quyết định đang chờ chủ dự án

1. Bảng màu lõi dùng từ lô mới (Đợt 4) — mặc định: có.
2. Giữ 2 trường `bam`/`bam_vk` (Đợt 5) — mặc định: giữ.
3. Kiếm đi qua mặt ở 2 khung đầu đòn (Đợt 5) — mặc định: giữ (2a).
4. Tile: giữ vẽ đè vòng đá/bãi hoa lên tile; màu sàn theo đặc tả (Đợt 6) — mặc định: có.
5. Mở rộng tile sang 2 vùng kia — chỉ sau khi Rừng có ảnh thật.
6. 8b bỏ ô dấu Linh Khí — ĐÃ LÀM (cờ riêng `G.DAU_LINH_KHI_VIEN`). Còn chờ duyệt 2 lựa chọn: thanh máu hiện suốt khi quái mang dấu (mặc định: có); trùm vẫn giữ ô dấu vì không có thanh máu nhỏ (mặc định: giữ). Xem `dot-8/bao-cao.md` §8b.
7. Màu nút Đánh mới (Đợt 8) — sẽ hỏi kèm ảnh.
8. Hồ lô (19×28) và trống đồng (15×25) khá to so với em bé — xem trong game rồi quyết.
9. Đợt 11 gộp prompt (`dot-11/bao-cao.md` mục 9): (a) nhận 5 lô xếp chung hình lệch dáng quá ±25 % — mặc định: nhận, gen thử lô B3 trước; (b) D2 khung cửi + lửa lò có gộp không — **ĐÃ LÀM ở làn D2b** (gộp 1 tấm, hai lô lẻ vẫn giữ; còn 3 điểm nhỏ chờ duyệt ở `lang-d2b/bao-cao.md`); (c) tấm chung B2 + B3 — mặc định: giữ; (d) bản Lửa đi kèm bản Chung ở Ra chưởng và Tiến hoá — mặc định: giữ.

## 5. Việc chỉ chủ dự án làm được

- Chơi thử trên iPhone thật ~10 phút bản mới nhất: búa giữ nút có kẹt không; sân 300 đủ rộng chưa; chỗ nào chữ/số che quái.
- Gen ảnh theo các prompt "CHỜ ẢNH" ở mục 2 (thứ tự gợi ý: 12 thân bộ → 8 đòn/chiêu bản Chung → 18 đồ vật + 18 cửa → 14 nút → 30 biểu tượng nhỏ → làng → tile Rừng).
