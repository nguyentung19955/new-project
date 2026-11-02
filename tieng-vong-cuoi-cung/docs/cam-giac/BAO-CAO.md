# BÁO CÁO – CẢM GIÁC CHƠI (02/11)

Người dùng chơi trên iPhone phàn nàn: (1) chạy vẫn giật, (2) nhảy lên cắm kiếm xuống mà tầm đánh xa quá. Phiên này đo bằng số + video (Playwright, màn iPhone ngang 844×390 @3x, đồng hồ khung hình giả giống iPhone), sửa tận gốc, rồi tự chơi thử thêm.

## 1. Vì sao chạy bị giật – đã tìm ra 5 nguyên nhân

| # | Nguyên nhân | Đo trước | Đo sau | Đã sửa |
|---|---|---|---|---|
| a | **Vòng lặp 60 bước/giây lệch nhịp màn hình (nguyên nhân chính).** iPhone/Safari làm tròn thời gian khung hình theo 1 ms (16, 17, 17, 16…), nên game chạy lúc 0 bước, lúc 1, lúc 2 bước mỗi khung → nhân vật và nền "đứng – nhảy – đứng". Màn 120 Hz thì mỗi bước vẽ 2 lần y hệt → đi bậc thang | Làng: ⅓ số khung **đứng yên**, ⅓ nhảy **gấp đôi** (nền trôi 0 / 9 / 20 điểm ảnh xen kẽ, lệch chuẩn 7,9). Vùng 1: tuỳ lúc mở game, cũng 0/1/2 bước (lệch chuẩn 7,4). 120 Hz: 50 % khung đứng yên | 60 Hz: **100 % khung đúng 1 bước**, nền trôi đều 9–10 điểm ảnh/khung (lệch chuẩn 0,3–0,5). 120 Hz: 0 khung đứng yên, trôi đều 4–5 điểm ảnh/khung | Bắt nhịp màn hình + vẽ nội suy vị trí giữa 2 bước (file mới `game/muot-khung.js`, dùng cho Vùng 1, Vùng 2, Làng) |
| b | **Chân trượt**: hình chạy đổi theo thời gian (8 hình × 80 ms = 12,5 hình/giây), không theo quãng đường; 1 vòng chạy = 161 px trong khi chân chỉ lùi ~6 px mỗi hình | 12,5 hình/giây cố định, kể cả lúc mới bắt đầu chạy (chậm) | Hình chạy đổi theo **quãng đường**: 1 vòng = 120 px → chạy hết tốc 16,7 hình/giây, mới nhấc chân thì chậm theo; ít trượt hơn ~25 % | `quang_chu_ky` trong `nhan-vat.json` |
| c | **Nhân vật rung 1 điểm so với nền**: nhân vật và camera làm tròn riêng theo "điểm logic" (= 2,17 điểm ảnh thật của iPhone). Camera giật khi quay đầu | Nhân vật nhích 2,17 điểm ảnh qua lại trên màn; quay đầu: camera đổi tốc độ 9,7 px trong 1 bước (cả màn giật ngược) | Nhân vật đứng yên trên màn khi camera đã bám (rung ≤ 1 điểm ảnh, Làng 0); quay đầu: đổi tốc ≤ 0,64 px/bước | Làm tròn theo điểm ảnh thật; vẽ nhân vật theo camera chưa làm tròn; camera quay đầu êm dần |
| f | **Canvas bị co không nguyên**: canvas vẽ 2880 điểm rồi trình duyệt co về ~2080 điểm của iPhone → điểm ảnh rơi rụng, hình nhích; tốn gấp 2,25 lần công vẽ | 2880×1620 | **2080×1170 = đúng điểm ảnh thật**; thời gian vẽ 1 khung (đo bằng Chromium không card đồ hoạ) giảm còn ~½ | `resize` trong `ve.js` (Vùng 1, 2) |
| e | Tải ảnh lúc vào phòng | Không thấy khựng khi đổi phòng (ảnh phòng nạp trong lúc màn tối chuyển cảnh). Còn ~40 ảnh lớp sức mạnh không có (báo 404, vô hại) – thuộc phiên Sức mạnh | – | Không cần sửa |

Video so sánh trước/sau (Làng, 60 Hz kiểu iPhone): để ngoài repo (gửi kèm thông báo).

## 2. Tầm đánh – đập đất trước/sau
Đập đất trước đây có hộp trúng **rộng 300 điểm ảnh** quanh người (= **191 px mỗi bên** trên màn) trong khi sóng thật chỉ rộng ~109 điểm ảnh. Nay hộp trúng = đúng phần kiếm + sóng nhìn thấy (đo bằng ảnh từng khung trúng, nới 4 điểm ảnh): **70 px mỗi bên**. Kiểm: quái đứng sát (40 px) vẫn trúng cả 2 bên, quái cách 150 px không còn bị trúng.

Các đòn khác (đơn vị: điểm ảnh của hình; "mũi" = px trên màn phía trước):

| Đòn | Hộp cũ (Cấp 1 → Cấp 3) | Hộp mới (mọi cấp) | Mũi trước: cũ → mới | Hộp cũ vượt hình |
|---|---|---|---|---|
| Đập đất | [-150,-110,300,110] | [-54,-50,109,53] | 191 → 70 (mỗi bên) | 96 |
| Đòn 1 | [0,-70,75,40] → [0,-91,98,52] | [-36,-63,92,55] | 96–125 → 71 | 19–42 |
| Đòn 2 / Chéo lên | [-5,-100,75,80] → [-5,-130,98,104] | [-38,-79,74,70] | 89–119 → 46 | 34–57 |
| Đòn 3 / Chéo xuống | [0,-85,80,85] → [0,-110,104,110] | [-40,-79,76,66] | 102–133 → 46 | 60–84 |
| Đòn 4 (nhát kết) | [-50,-95,120,90] → [-50,-124,156,117] | [-29,-97,81,97] | 89–135 → 66 | 18–54 |
| Chém trên không | [-55,-110,110,110] → [-72,-143,143,143] | [-37,-75,76,76] | 70–92 → 50 | 35–68 |
| Chém khi leo dây | [0,-80,70,60] | [-19,-61,72,42] | 89 → 68 | 17 |
| Chém khi bám tường | [0,-78,82,58] | [-11,-75,78,46] | 105 → 85 | 15 |

- Mọi Cấp dùng cùng hình nên nay cùng hộp; Cấp cao vẫn mạnh hơn ở **sát thương** (10 / 13 / 16). Muốn Cấp cao đánh xa hơn thì cần ảnh hiệu ứng to hơn cho từng cấp.
- **Đòn 3 / Chéo xuống**: hình vẽ vệt chém vòng ra SAU lưng (mũi phía trước chỉ ~20 điểm ảnh) – nếu bám đúng hình thì nhát 3 của combo hay trượt quái trước mặt. Để công bằng, mũi trước giữ tối thiểu 36 điểm ảnh (= mũi Đòn 2). Nếu muốn đúng hình 100 % thì cần vẽ lại đòn 3 chém ra phía trước.
- Công cụ: `tools/cam-giac-hop-trung.py` (in bảng / `--ghi` / `--kiem`).

## 3. Tự chơi thử (bot Playwright: 28.800 bước ≈ 8 phút ở Vùng 1 P01–P04; Làng: chạy qua lại 6 lần × 3 giây khi đo độ mượt)
Bot chạy, nhảy, nhảy đôi, lướt, đập đất, leo dây, đánh quái, bắt lỗi từng bước:
- Không kẹt trong tường, không rơi xuyên sàn, không dịch chuyển bất thường, quái không lọt vào khối, không lỗi JS.
- **Đã sửa:** 2 nhát chém trên không (hoặc khi bám tường) liền nhau chen **1 khung "rơi"** ở giữa – gặp 49 lần → 0. Chạy vấp gờ ô hoặc quay đầu (tốc độ qua 0) chen **1 khung đứng** → nay giữ dáng chạy thêm 2 bước (kiểm chạy qua lại 8 lần: 0 khung đứng chen giữa).
- **Còn lại (nhỏ, chưa sửa):** chụp dây leo khi đang rơi đôi khi bật ra 1 khung (gặp 1 lần/8 phút); trên Chromium không card đồ hoạ, phần vẽ đèn/bóng tối (gradient toàn màn) là phần tốn nhất – trên iPhone chưa đo được, nếu còn khựng nên xem lại phần này.

## 4. Chạy nhiều khung hơn – chờ bạn duyệt
Phiên chính đang cùng bạn vẽ chu kỳ chạy mới (`art/kiem-khach/chay-moi/`). Phiên này đã kiểm (đáy chân, thân không nhảy, giữ thiết kế) – ghi ở `docs/yeu-cau-anh/cam-giac/001-chay.md`. **Xem thử trên iPhone:** mở `https://tieng-vong-cuoi-cun.web.app/game/lang-chuong/?chay=moi` một lần (máy nhớ; `?chay=cu` để về bản cũ). Khi bạn DUYỆT: ép về bảng màu 20 màu gốc rồi thay clip chạy (các bước ghi trong file yêu cầu).

## 5. Kiểm thử
- Mới: `node tools/cam-giac/kiem-thu.js` – 26/26 đạt (60 Hz 2 pha + 120 Hz ở Vùng 1 và Làng: 1 bước/khung, nền trôi đều, nhân vật không rung so với camera; hộp trúng ≤ hình; đập đất trúng gần/không trúng xa).
- `kiem-thu-f.js` 66/66 · `kiem-thu-g.js` hỏng 0 · `kiem-thu-h.js` hỏng 0 · `kiem-tra-vung1.js` P01→P12 · `khoi-dau/kiem-thu-luong.js` 38/38 · `vung-2/kiem-thu-dat-muc.js` 33/33 · `suc-manh/kiem-thu-lop.js` tất cả đạt.
