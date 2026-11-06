# BẢN NHÁP — đề xuất ụ VÀNG mới theo tướng DCDW còn thiếu (06/11/2026)

**Chưa làm code, chưa xin hình** (theo `DUNG-LAI.md`: người dùng duyệt kế hoạch trước). Danh sách đầy đủ + bảng so: `DCDW-LEGEND.md`.
Luật chung nếu duyệt: bậc `vang`, cấp thẻ đầu 9 (tự theo `THE.lvDau`), % hiệu ứng nhân theo cấp thẻ như Hỗ trợ (`1 + 0.5·(hsThe − 1)`), tất định online (chỉ dùng `Math.random` đã gieo hạt hoặc trạng thái), ngoài bộ RANDOM cho tới khi có hình.

Thứ tự ưu tiên (giống DCDW nhất + hay nhất trước):

| # | DCDW | id đề xuất / tên | Vai | Kỹ năng đề xuất (mượn cơ chế DCDW, sang ụ súng) | Sao | Dạng lớn lên |
|---|---|---|---|---|---|---|
| 1 | Kalaratri | `ngonlua` **Ember Core** | Tấn công | Giữ **LỬA** (tối đa 6 + 2×sao). Mỗi lửa: +8% sát thương, +2% chí mạng. Khi GHÉP 2 Ember Core: mỗi Ember Core ở 4 ô chữ thập quanh ô ghép nhận +sao lửa và +30% tốc 5 s. | 5★: lửa không giảm khi bị đóng băng / đá · 7★: đủ lửa → mỗi phát đốt quái 3 s | KINDLING → BLAZE → INFERNO theo số lửa |
| 2 | Rusalka | `nguthuy` **Tide Siren** | Tấn công | Ghép 2 Tide Siren: mọi Tide Siren +sao **giọt nước** (tối đa 10; tự hồi 1 giọt / 6 s). Phát bắn tốn 1 giọt → sóng làm chậm 30% 2 s. Đánh quái đang chậm: +80% sát thương, +15% chí mạng. | 5★: sóng lan 40 px · 7★: +150% vào quái chậm | — |
| 3 | Lupin | `bienmau` **Prism Thief** | Tấn công | Đổi màu Đỏ (đốt) → Vàng (chí mạng) → Xanh (làm chậm) mỗi 3 s theo nhịp riêng. Ghép 2 Prism Thief **đang cùng màu** → COMBO +1 (tối đa 10): mọi Prism Thief +6% sát thương, +4% tốc mỗi combo. Khác màu = ghép thường. | 5★: combo tối đa 15 · 7★: mỗi phát mang cả 3 màu | RED / GOLD / BLUE theo màu đang có |
| 4 | Bari | `thanhdia` **Sanctum** | Hỗ trợ | Khi xuất hiện (triệu hồi / ghép ra): tẩy băng / đá / cháy / kẹp cho 4 ô kề + cho khiên 1 lần. Thường trực: ụ Tấn công kề +sát thương; khiên nạp lại mỗi 14 s. | 5★: tẩy cả 8 ô xung quanh · 7★: ô kề miễn khống chế hẳn khi Sanctum còn đứng | — |
| 5 | Dana | `hopxuong` **Star Choir** | Hỗ trợ | Buff **MỌI** ụ Tấn công trên bàn CÙNG SAO với nó (không cần kề): +sát thương (trần chung Hỗ trợ). Khác Sync Cannon (chỉ ô kề). | 5★: thêm +tốc bắn · 7★: lệch 1★ vẫn tính | — |
| 6 | Semele / Gumiho | để sau | Đặc biệt | Semele: kéo lên ụ bất kỳ → đổi chỗ, tốn 1★ của Semele. Gumiho: ghép với ụ BẤT KỲ (không cần cùng sao), ra sao = trung bình + 1. | — | — |

**Để sau:** Saturn (chưa rõ kỹ năng), Semele, Gumiho, Laura (chỉ huy Ma vương), Frey / Bathory / Cain (chỉ huy).

Hình cần (khi được duyệt): mỗi ụ 1 đầu `raw_u3_<id>.png` (nhìn từ trên, quay phải, thân tròn, viền vàng, nền #FF00FF, mẫu `thap/assets/vughep_nong.png`) + 1 chân dung `raw_pt_<id>.png` + dải FX 4×4 nếu cần (Ember Core lửa, Tide Siren sóng, Prism Thief 3 màu).
