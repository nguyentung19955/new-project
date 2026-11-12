# 4 quái mới — số đã chọn + đo bot trước / sau (12/11)

## 1. Kết luận
- **Cân bằng giữ nguyên**: mọi bộ chính lệch không quá 4 wave (trung vị 8 trận), phần lớn lệch 0–1.
- Bộ Vàng tấn công **65 → 64** · Vàng + Lucky Slot **72 → 68** (trung bình 69,2 → 69,2) · Tím **27 → 27** · co-op tài khoản mới **20 → 20** · co-op bộ `cobac…` **80 → 90** (trung bình 85 → 80; bộ này bot hay kẹt, dao động lớn).
- Số quái mỗi wave **không tăng**, mana giết **không đổi** (mỗi quái mới thay một con cùng hệ số mana). Không đụng trùm, ụ, kinh tế.
- Bản đầu (khiên 50% cần 3 đòn; ma trơi tàng hình 35% đường, tốc 52) làm bộ Vàng chết sớm ở wave 54 / 57 → đã **giảm cơ chế** về số dưới đây.
- Chưa xuất bản lên bản chơi thật.

## 2. Số đã chọn
| Quái | Thay cho | Máu · tốc | Cơ chế | Từ wave |
|---|---|---|---|---|
| **Bọ khiên** | Giant | ×2,8 · 24 | Khiên = 40% máu thân, hứng đòn trước; mỗi đòn gỡ tối đa nửa khiên (ít nhất 2 đòn) | Hỗn hợp 11 · Thiết giáp 14 |
| **Nấm hồi máu** | Crawler | ×0,7 · 28 | Mỗi 3 s hồi 5% máu tối đa cho quái thường trong bán kính 70; bị đóng băng / choáng thì ngừng | Tinh anh 15 · Hỗn hợp 16 |
| **Cá nóc nổ** | 2 Swarmling | ×1 · 40 | Chết → 0,5 s sau nổ: mỗi bàn tối đa 2 ụ gần nhất (bán kính 110) choáng 1,5 s | Bầy đàn 22 (và nửa Bầy đàn của Hỗn loạn) |
| **Ma trơi** | Runner | ×0,7 · 46 | Tàng hình (không nhắm được) ở 15–30% và 45–58% đường; 42% đường cuối luôn hiện | Tốc hành 27 (và nửa Tốc hành của Hỗn loạn) |

- Số lượng: Hỗn hợp 1–2 Bọ khiên + tối đa 3 Nấm · Thiết giáp: một nửa số Giant · Tinh anh: 1 Nấm (2 từ wave 35) · Bầy đàn: 2–4 Cá nóc · Tốc hành: 3–4 Ma trơi.
- Choáng: ụ không bắn, không nạp chiêu; vẫn kéo / ghép được; khiên chỉ huy toàn bàn chặn được. Cá nóc lọt cổng thì không nổ.
- Trùm không bị ảnh hưởng: không khiên, không được hồi, không tàng hình.

## 3. Bảng bot trước / sau
8 hạt giống mỗi ca, trần wave 100, thẻ cấp đầu, `tools/thap-bot-tran.js --lo tools/thap-bot-lo-quai-moi.json --hat 1,2,3,4,5,6,7,8`. "Trước" = code `35d3f55` (đã có `b8cac71`: co-op 2 bàn cùng nhận mana). Wave = trung vị (thấp nhất–cao nhất); PVP: ✓n = số trận thắng.

| Bộ | Trước | Sau | Trung bình trước → sau |
|---|---|---|---|
| Co-op `cobac,vughep,sinhdoi,saochep,tudo` | 80 (80–100) | 90 (30–90) | 85,0 → 80,0 |
| Co-op bộ Khởi đầu ×2 (tài khoản mới) | 20 (17–27) | 20 (17–27) | 21,4 → 20,9 |
| Co-op Vàng tấn công ×2 | 60 (50–60) | 60 (57–63) | 58,2 → 60,0 |
| Co-op Tím tấn công ×2 | 30 (30–33) | 30 (30–33) | 31,0 → 30,9 |
| Solo bộ Khởi đầu | 15 (8–22) | 15 (8–20) | 14,9 → 14,4 |
| Solo `cobac…` | 80 (38–98) | 76 (28–93) | 69,8 → 68,8 |
| **Solo Vàng tấn công** | **65** (60–68) | **64** (58–68) | 64,2 → 63,8 |
| **Solo 4 Vàng + Lucky Slot** | **72** (54–80) | **68** (60–80) | 69,2 → 69,2 |
| **Solo Tím tấn công** | **27** (23–37) | **27** (23–40) | 27,1 → 28,5 |
| Solo Xanh + Trắng | 24 (20–26) | 24 (20–26) | 23,6 → 23,2 |
| PVP Vàng đấu Vàng | 32 (31–33) ✓3 | 32 (31–32) ✓6 | 32,0 → 31,6 |
| PVP Khởi đầu đấu Khởi đầu | 12 (7–17) ✓3 | 12 (7–17) ✓3 | 12,2 → 12,1 |

- Mana giết tới wave 30 (trung vị): solo Vàng 33 304 → 32 572 · co-op Vàng 130 613 → 130 769 · solo `cobac…` 32 872 → 32 765.
- Bản đầu (4 hạt, số mạnh hơn): solo Vàng 65 → 63 nhưng có trận chết ở wave 54 (Thiết giáp) và 57 (Tốc hành), mất cả 3 tim trong một wave → giảm khiên 50% / 3 đòn → 40% / 2 đòn, máu thân 3,0 → 2,8; ma trơi tốc 52 → 46, máu 0,8 → 0,7, đoạn tàng hình 35% → 28% đường.

## 4. Đã kiểm
- `tools/thap-kt-quai-moi.js`: 23 mục luật + host / khách online ra cùng danh sách wave 1–150 (3 hạt), chạy lại giống hệt.
- Băm trạng thái co-op cảnh E (`tools/thap-kt-hieunang-coop.js E`, 4 quái mới, wave 27): mô phỏng thuần 2 lần giống nhau (`2b1ccd55` / `45408456`); có vẽ `?gl=1` = `?gl=0` (`3cf84935` / `810c7fb7`; trong 30 s có 4 vụ nổ, 16 lượt choáng, 26 nhịp hồi, 2 khiên vỡ, 11 lần tàng hình).
- Ảnh 390×844 (co-op GL, co-op 2D, PVP): `/home/claude/xem/quai-moi/`.

## 5. Chưa kiểm / lưu ý
- Chưa thử trên iPhone thật, chưa chơi online 2 máy thật (chỉ kiểm danh sách wave + băm một máy). Choáng trên bàn đồng đội online do từng máy tự tính, không nằm trong ảnh chụp bàn.
- Bot không biết né: không dời ụ khỏi mép đường, không ưu tiên Nấm. Bộ `cobac…` bot kẹt nhiều nên dao động 28–100.
- Leo Tháp / Đường Đua / Đột Kích dùng chung bảng wave nên cũng gặp quái mới; không đo.
- Bọ khiên lọt cổng chỉ mất 1 tim (Giant mất 2).
- Hình: khiên vàng nằm sẵn trong tranh nên khiên vỡ rồi con bọ vẫn cầm khiên — phân biệt bằng vòng sáng vàng + thanh khiên. Ma trơi chỉ có 1 khung gốc (4 khung là co giãn nhẹ).

## 6. Dữ liệu thô
`quai-moi-truoc.json` · `quai-moi-sau.json` (12 ca × 8 hạt, có số quái sinh / đỉnh / mana từng wave). Gộp bảng: `node tools/thap-bot-bang.js docs/demo-hop-tuong/tocban/quai-moi-truoc.json docs/demo-hop-tuong/tocban/quai-moi-sau.json`.
