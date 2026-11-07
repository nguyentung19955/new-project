# Kết quả làm lại hình bóng 86 ụ (u-moi) — 07/11

Ảnh gốc: `docs/demo-hop-tuong/thap-art/raw_mod_<id>.png` (93 tấm = 7 ụ mẫu đã duyệt + 86 ụ mới, lưới 2×2 nền magenta). Phân họ + prompt: `PHAN-HO.md`. Link chat ChatGPT từng ụ: `chat-chatgpt.json`.

## 1. Gen ảnh

- Đã gen **86/86** ụ (ChatGPT, 1 lượt mỗi ụ, đính kèm `ref_<id>` = đầu + bệ cũ). Làm lại: **0**. Hỏng: **0**.
- Kiểm từng tấm bằng mắt (`Read`): cả 86 đều đúng 4 ô, nền magenta đặc, nhìn từ trên, đầu chĩa lên, không chữ, không chạm mép ô.
- Thiết bị không nòng: **52/93 = 55%** (≥ 30% theo yêu cầu; mọi ụ hỗ trợ đều là thiết bị).
- Cắt nền: loang từ viền từng ô (không key magenta toàn cục), bỏ đảo điểm ảnh rời < 0,5% diện tích ô, khử viền hồng 1–2 px. Không ô nào chạm mép.
- Đảo rời bị bỏ khi cắt (đều là chi tiết trang trí nhỏ, không phải lỗi nền): `bomhen` {'o1': 2}, `cauvong` {'o4': 1}, `no5` {'o4': 16}, `saochep` {'o4': 5}, `thaukinh` {'o4': 2}, `vungdoc` {'o4': 1}. Riêng `no5` ô 4 (dây cung mảnh) bị vỡ thành 16 mảnh nhỏ → nếu dùng PART_B này cần cắt tay.

## 2. Đo nhận diện (cùng công cụ `tools/thap-nhandien-bang.py`)

Cách làm: ô 1 (ụ lắp sẵn) của 93 tấm, thu về đúng đường kính ụ cũ trên canvas 154 px (iPhone 13, ô 46,5 px CSS), chạy lại script với `meta.json` cũ.

| Đo | Trước (bệ chung) | Sau (93 hình mới) |
|---|---|---|
| Cặp điểm ≥ 0,80 | **1.553** / 4.278 | **95** |
| Cặp điểm ≥ 0,85 | — | **6** |
| Cặp giống nhất | Máy Nhân Mana ↔ Thánh Địa 0,94 | Vua Ghép ↔ Máy Sao Chép 0.88 |

### 10 cặp giống nhất sau khi đổi

| # | Ụ A | Ụ B | Điểm | Bóng | Xám |
|---|---|---|---|---|---|
| 1 | Vua Ghép (`vughep`) | Máy Sao Chép (`saochep`) | 0.88 | 0.91 | 0.85 |
| 2 | Máy Sao Chép (`saochep`) | Hộp Tiến Hoá (`tienhoa`) | 0.87 | 0.94 | 0.82 |
| 3 | Máy Mana (`mana`) | Vua Ghép (`vughep`) | 0.87 | 0.94 | 0.82 |
| 4 | Máy Nhân Mana (`nhanmana`) | Loa Hồi Chiêu (`loa`) | 0.87 | 0.93 | 0.81 |
| 5 | Bão Tuyết (`baotuyet`) | Máy Sao Chép (`saochep`) | 0.86 | 0.93 | 0.81 |
| 6 | Máy Khiên (`khien`) | Hộp Tiến Hoá (`tienhoa`) | 0.86 | 0.87 | 0.85 |
| 7 | Vua Ghép (`vughep`) | Hộp Tiến Hoá (`tienhoa`) | 0.85 | 0.91 | 0.79 |
| 8 | Bão Tuyết (`baotuyet`) | Vua Ghép (`vughep`) | 0.85 | 0.94 | 0.77 |
| 9 | Độc (`doc`) | Máy Sao Chép (`saochep`) | 0.84 | 0.90 | 0.80 |
| 10 | Độc (`doc`) | Hộp Tiến Hoá (`tienhoa`) | 0.84 | 0.87 | 0.82 |

### 25 ụ dễ nhầm nhất trước đây — người giống nhất bây giờ

| Ụ | Trước | Sau |
|---|---|---|
| Máy Nhân Mana (`nhanmana`) | Thánh Địa 0.94 | Loa Hồi Chiêu 0.87 |
| Thánh Địa (`thanhdia`) | Máy Nhân Mana 0.94 | Máy Sao Chép 0.83 |
| Pháo Ngôi Sao (`ngoisao`) | Máy Cầu Vồng 0.94 | < 0,73 (ngoài top 200) |
| Máy Cầu Vồng (`cauvong`) | Pháo Ngôi Sao 0.94 | Máy Sao Chép 0.84 |
| Bộ Khuếch Đại (`khuech`) | Hộp Tiến Hoá 0.93 | Railgun 0.79 |
| Hộp Tiến Hoá (`tienhoa`) | Bộ Khuếch Đại 0.93 | Máy Sao Chép 0.87 |
| Máy Sinh Đôi (`sinhdoi`) | Súng Hạ Sao 0.93 | Máy Sao Chép 0.84 |
| Súng Hạ Sao (`hasao`) | Máy Sinh Đôi 0.93 | Hộp Tiến Hoá 0.83 |
| Bộ Trộn (`tron`) | Máy Nhân Bản 0.93 | Cửu Vĩ 0.81 |
| Máy Nhân Bản (`nhanban`) | Bộ Trộn 0.93 | Máy Sao Chép 0.82 |
| Laser (`laser`) | Súng Bão 0.92 | < 0,73 (ngoài top 200) |
| Bão Tuyết (`baotuyet`) | Bộ Ép Xung 0.92 | Máy Sao Chép 0.86 |
| Bộ Ép Xung (`epxung`) | Bão Tuyết 0.92 | Pháo Đồng Bộ 0.78 |
| Súng Bão (`bao`) | Laser 0.92 | Hộp Tiến Hoá 0.81 |
| Máy Xáo Trộn (`xaotron`) | Bộ Ép Xung 0.92 | Kho Lưu Hợp Nhất 0.78 |
| Bệ Nâng Sao (`nangsao`) | Súng Bão 0.92 | Bom Vũng Độc 0.81 |
| Kho Lưu Hợp Nhất (`luutru`) | Thánh Địa 0.92 | Hợp Xướng Lượng Tử 0.84 |
| Vua Ghép (`vughep`) | Máy Sinh Đôi 0.91 | Máy Sao Chép 0.88 |
| Máy Sao Chép (`saochep`) | Hợp Xướng Lượng Tử 0.91 | Vua Ghép 0.88 |
| Hợp Xướng Lượng Tử (`hopca`) | Máy Sao Chép 0.91 | Kho Lưu Hợp Nhất 0.84 |
| Hộp Pandora (`pandora`) | Thánh Địa 0.91 | Hộp Tiến Hoá 0.80 |
| Nỏ Năm Nhịp (`no5`) | Súng Bão 0.91 | < 0,73 (ngoài top 200) |
| Băng (`bang`) | Kiếm Băng 0.91 | Máy Khiên 0.82 |
| Kiếm Băng (`kiembang`) | Băng 0.91 | Pháo May Rủi 0.82 |
| Súng Lục (`sungluc`) | Độc 0.91 | Hộp Tiến Hoá 0.83 |

## 3. Nhận xét

- Số cặp dễ nhầm (≥ 0,80) giảm từ 1.553 xuống 95 (−94%). Vẫn còn 6 cặp ≥ 0,85 nên **chưa đạt hẳn mục tiêu "không cặp nào ≥ 0,85"**.
- Các cặp còn sát đều là **thiết bị bậc vàng hình tròn có viền vàng trang trí** (Vua Ghép, Máy Sao Chép, Hộp Tiến Hoá, Máy Mana, Bão Tuyết, Máy Khiên): bệ tròn + viền vàng + vật thể ở giữa → xám và bóng gần như nhau. Đề xuất gen lại 5 ụ này với bệ không tròn (vuông / tam giác / ngũ giác) và vật thể lòi ra ngoài viền: `saochep`, `vughep`, `tienhoa`, `mana`, `loa` (đôi với `nhanmana`).
- Lưu ý cách đo: điểm "bóng" lấy phần khác trung vị 93 ụ. Khi cả 93 ụ đều là hình mới, trung vị không còn là bệ chung, nên IoU bóng gần bằng IoU cả hình. Điểm vẫn dùng được để xếp ưu tiên, nhưng cần bài test 1 giây với người thật.

## 4. File

- `BANG-MOI.png` (93 ụ màu, 140 px, tên + họ + TB = thiết bị), `BANG-XAM.png` (xám)
- `gif/HO-<họ>.gif`: bệ đứng yên + đầu (ô 3) quét ±35° có giật lùi; thiết bị thì quay chậm. Ô 200 px, nền (38,40,46), 1 bảng màu MEDIANCUT, không dither
- `CAP-DE-NHAM.png`, `cap.json`: 30/200 cặp giống nhất sau khi đổi
- `scripts/`: `cat.py` (cắt ô), `xem.py` (bảng, GIF, chuẩn bị đo), `phanho.py` (dữ liệu phân họ)
- Ảnh tham chiếu: `docs/demo-hop-tuong/tuvan/u-moi/ref/` trên nhánh `claude/kiem-nhan-dien`
