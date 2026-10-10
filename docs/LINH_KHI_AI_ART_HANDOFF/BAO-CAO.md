# BÁO CÁO — Gói bàn giao ảnh AI cho Linh Khí

**Tóm tắt:** game **không có file ảnh**. Mọi hình đều được **vẽ bằng code**. Gói này **không sửa code game** và **không đưa ảnh nào vào game**. Gói chỉ chuẩn bị đủ tài liệu, số đo và ảnh tham chiếu để người dùng công cụ AI tạo ảnh có thể bắt đầu ngay.

## 1. Đã xuất những file nào

Tất cả nằm trong thư mục `docs/LINH_KHI_AI_ART_HANDOFF/`, kèm bản nén `docs/LINH_KHI_AI_ART_HANDOFF.zip`.

| File | Nội dung |
|---|---|
| `README.md` | Hướng dẫn đọc theo thứ tự |
| `GAME_ASSET_MANIFEST.json` | 96 asset với đủ các trường được yêu cầu (gồm 4 em bé, 33 quái thường / tinh anh / trùm nhỏ, 3 trùm, 40 vũ khí, 11 hiệu ứng, 4 môi trường, 1 giao diện) |
| `ART_STYLE_GUIDE.md` | Phong cách hiện tại (✅) và phong cách đề xuất (💡) |
| `IMAGE_GENERATION_BRIEFS.md` | 10 brief (B1–B10), có prompt tiếng Anh, negative prompt và các bước hậu kỳ |
| `ASSET_REFERENCE_INDEX.md` | Mục lục ảnh, độ tin cậy, danh sách ảnh còn thiếu |
| `INTEGRATION_AND_QA.md` | Đường nạp `.sprite.json` hiện có, 12 tiêu chí đạt / không đạt, phần nào cần viết thêm code |
| `anh/` | 70 ảnh PNG. Gồm sprite nền trong suốt ở cỡ 1× và bản phóng ×2 / ×3 / ×4, 12 cảnh 480×270, 13 contact sheet có nhãn, và `do_dac.json` (số đo) |
| `cong_cu/` | Script chụp ảnh, ghép contact sheet, tạo manifest, tự kiểm. Có thể chạy lại khi code thay đổi |

## 2. Nên tạo asset nào trước (theo thứ tự để ít phải làm lại)

1. **B1: bóng dáng 4 em bé (P0), chỉ làm concept.** Mọi thứ khác đều phải hợp với em bé, nên chốt bóng dáng trước.
2. **B3: bảng màu và tương phản Lâu đài cổ (P0), concept.** Chốt màu sàn trước khi vẽ quái, để quái nổi trên sàn.
3. **B2: 4 bậc trúng đòn và quy tắc cảnh đông (P0), mockup.** Giao ngay cho nhánh gd5-c, vì phần này vẫn phải vẽ bằng code.
4. **B5: quái thường, mỗi vùng 1 tấm concept (P1).** Nên làm theo thứ tự Lâu đài → Rừng → Biển (Lâu đài kém tương phản nhất).
5. **B6: tinh anh và trùm nhỏ (P1).** Làm sau B5 vì chúng dựa trên loài gốc.
6. **B7: 3 trùm (P1).** Chỉ concept, vì đường nạp chưa hỗ trợ đổi hình theo pha.
7. **B4: sprite sheet em bé (P1).** Để sau, vì khó tích hợp nhất (tay phải khớp với vũ khí do code vẽ).
8. **B8: vũ khí (P2), rồi B9: hiệu ứng, đạn (P2), rồi B10: nền Rừng và Biển (P3).**

Nếu chỉ chọn **một** nhóm để thử đưa ảnh thật vào game: chọn **1 quái thường** (ví dụ Heo Rừng Con hoặc Lính Ma Giáp Gỉ). Đây là đường nạp đơn giản nhất: thay trọn thân, hiệu ứng vẫn do code vẽ.

## 3. Số liệu: đã xác minh và chỉ là đề xuất

**Đã xác minh** (đọc code, vẽ bằng hàm thật và đo điểm ảnh):
- cỡ lớp thế giới 480×270;
- cỡ đứng yên của 4 em bé;
- hộp bao của 11 động tác em bé;
- số khung và thời lượng động tác của em bé;
- lưới, hộp bao và thời lượng của 36 quái và trùm;
- cỡ, độ dài mũi và tên của 40 vũ khí;
- bảng màu ở `fx.js`, `data.js`, `room_art.js`;
- vị trí sàn phòng;
- định dạng `.sprite.json` (đọc code).

**Chỉ là đề xuất** (💡, chưa có trong game):
- toàn bộ bảng màu "đề xuất" (lấy từ `THIET-KE-HINH-ANH-GPT.md`);
- khung sheet em bé 56×56 với gốc (36,46);
- số khung sheet quái (6/6/4/6/3/8);
- ngưỡng tương phản ≥ 80;
- ngân sách 90–120 hạt;
- trần màu 16 / 32.

**Chưa xác minh:**
- Đường nạp `.sprite.json` **chưa được chạy thử** với ảnh thật. Thư mục `game/art/custom/` đang trống và gói này không được phép tích hợp.
- Lớp tô trắng khi trúng đòn của em bé không thấy trong sheet, vì nó chỉ bật khi có trạng thái người chơi thật.
- Ảnh cảnh đông dùng bot ngẫu nhiên.
- Tên tiếng Anh của quái trong prompt là bản tự dịch.

## 4. Ảnh và thông tin cần bổ sung
- Ảnh làng, người làng, các bảng giao diện (Hành trang, Rèn, Thợ may).
- Ảnh tách riêng từng hiệu ứng: vệt 4 hệ, trúng đòn từng bậc, 10 kiểu đạn, rune, chưởng.
- Em bé mặc các bộ trang phục khác; vũ khí ở đủ nhánh và mốc cho cả 40 dòng.
- Chiêu c4, c5 và cảnh chuyển pha của trùm.
- Chủ dự án cần quyết định: có muốn đưa ảnh thật vào game không, hay chỉ dùng ảnh AI làm tham chiếu để vẽ lại bằng code? Nếu muốn đưa vào, cần thêm code cho hiệu ứng, nền, giao diện, trùm theo pha và đòn đánh theo từng vũ khí (xem `INTEGRATION_AND_QA.md` mục 3).

## 5. Tự kiểm
- `cong_cu/tu_kiem.py`: mọi đường dẫn ảnh trong manifest và trong các file `.md`, mọi tệp và dòng code trích dẫn → **567 đúng, 0 sai**.

**Mức đầy đủ của từng brief** (chi tiết ở cuối `IMAGE_GENERATION_BRIEFS.md`):

| Mức | Brief |
|---|---|
| Đủ | B1, B3, B5, B6, B8 |
| Đủ, có điểm đề xuất | B4 (khung 56×56 là đề xuất) |
| Đủ cho concept / mockup | B2, B7, B9, B10 |

**Asset khó tích hợp nhất:**
1. 3 trùm (theo pha);
2. em bé (tay phải khớp vũ khí của code);
3. hiệu ứng, nền, giao diện (chưa có đường nạp).

## 6. Không đụng tới
- `game/js` và mọi code game: **không** sửa.
- Các nhánh gd5-a / gd5-b / gd5-c, nhánh `master`, nhánh `claude/mobile-tower-defense-game-k5oxzo`: **không** đụng.
- Bộ test gameplay: **không** chạy. Chỉ chạy script chụp ảnh mới, và script này dùng `tests/quai_lib.py`.
