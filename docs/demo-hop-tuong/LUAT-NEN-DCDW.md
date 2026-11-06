# Luật nền DCDW — đã áp vào demo (03/11/2026)

Lấy gameplay Destiny Child: Defense War làm nền (nguồn: `DCDW-WIKI-TOM-TAT.md`, GDD `nguon-chatgpt/v3/TU-VAN-NEN-DCDW.txt` mục 1.2–1.4).
Chỉ sửa luật, **không** đổi hình ảnh/hoạt ảnh, **không** đổi bố cục/đường đi co-op. Áp cho cả PvP và co-op.

## Đã đổi gì

| # | Luật | Trước | Bây giờ |
|---|------|-------|---------|
| 1 | Giá triệu hồi | 10, 16, 22… (+6) | **10, 20, 30…** (lần thứ n = 10n), về 10 khi bắt đầu trận mới. Nút SUMMON vẫn hiện giá lần kế tiếp. Ô rỗng ngẫu nhiên, loại ngẫu nhiên đều trong bộ 5 (đã có sẵn). |
| 2 | Ghép | đã đúng | Giữ nguyên: kéo A vào B cùng loại + cùng sao (<7) → quân mới ở ô B, sao +1, **loại ngẫu nhiên** trong bộ 5. Ngoại lệ tướng vàng (ghép đặc biệt, GLITCH chọn kết quả, BROKER hoàn mana) vẫn giữ. |
| 3 | Nâng cấp theo loại | đã có | 06/11: power-up 100/200/400/700 mana, 4 bước (+1/+2/+3/MAX), **+25%** sát thương gốc mỗi bước, áp mọi bản cùng loại. Thêm **cấp thẻ ngoài trận** (bản sao + vàng) — xem DCDW-TANG-SUC-MANH.md. |
| 4 | Archfiend | giá ×1,6 mỗi lần | **Giá ×2 mỗi lần**: OVERCLOCK 40 → 80 → 160 → 320 → 640 → 1280 (trần 1280); FIREWALL 30 → 60 → 120… Hồi chiêu giữ nguyên (30s / 35s). |
| 5 | Cận chiến (PATCHWORK, ARC) | đánh quái trong 1,6 ô | Thêm điều kiện **ô phải sát đường**: tâm ô cách tâm hành lang ≤ **1,25 cạnh ô** mới ra đòn (quái vẫn phải trong 1,6 ô). PvP: 7 ô đánh được (cột trái + hàng dưới). Co-op (bàn người chơi): 5 ô hàng trên, sát hành lang giữa. |
| 5b | Hiển thị cận chiến | — | Khi kéo/giữ một quân cận chiến: các ô nó đánh được **tô vàng cam viền đứt + biểu tượng kiếm**. Quân cận chiến đứng ô không với tới: **biểu tượng kiếm gạch chéo đỏ** nhấp nháy ở góc ô (đứng được nhưng không đánh). |
| 6 | Hỗ trợ 4 ô kề | chưa có khung chung | **Khung dữ liệu chung** `keBuff: { k, gt }` trong `data.js` (k = `tocDanh` / `chiMang` / `satThuong` / `lamCham`, gt theo sao). Buff ô trên/dưới/trái/phải (không chéo), nhiều nguồn cộng dồn. Trần: tốc đánh **+150%**, sát thương **+200%**, làm chậm **60%**, chí mạng 100% (đòn chí mạng ×2). Vẽ **đường nối đứt mờ** từ tướng hỗ trợ tới ô được buff + mũi tên xanh "đang được buff". Chưa gắn cho tướng nào (chưa tạo tướng mới). |
| 7 | Mục tiêu mặc định "dau" | đã đúng | Kiểm tra: chọn quái có quãng đường đi cao nhất = gần lối ra nhất. Đúng GDD. |
| 8 | Co-op | 10 mạng (trùm lọt −3) | **1 con quái lọt tới cổng là THUA** (như Infinite Defense). Thanh trên hiện CORE 1/1. Bố cục/đường đi co-op không đổi. |

Ghi chú:
- Trần làm chậm 60% là mức tối đa; game hiện vẫn tự giới hạn chậm ở 45% (quái thường) / 30% (trùm) như cũ — vẫn nằm trong trần.
- Trần tốc đánh +150% tính trên tổng mọi buff (Archfiend OVERCLOCK + kỹ năng + ô kề).
- Để thử buff ô kề: thêm vào một tướng trong `data.js`, ví dụ `keBuff: { k: 'tocDanh', gt: { 1: 0.08, 3: 0.16, 5: 0.24, 7: 0.32 } }` (giống ANCHOR trong GDD).

## Đã chơi thử (Playwright, không phải bộ test)
PvP ~10 wave và co-op ~8 wave với bot tự triệu hồi: không lỗi JS; giá triệu hồi 10/20/30/40/50/60 đúng; Archfiend 40/80/160 đúng; ghép ra sao +1 loại ngẫu nhiên; ô cận chiến và buff ô kề hiển thị đúng.

## Việc còn lại (theo GDD P1–P2)
- **Cân bằng mana**: giá triệu hồi giờ tăng nhanh hơn (+10 thay +6) → cần chỉnh thưởng mana khi giết quái (GDD đề xuất +10/quái thường) sau khi chơi thử.
- **Co-op 1 mạng** khó hơn nhiều → cần chơi thử, có thể giảm máu quái co-op hoặc tăng sát thương đồng đội AI.
- **Nâng cấp**: quyết định có chuyển sang bảng GDD (100/200/400/700, 4 cấp, +20%) hay giữ hệ hiện tại.
- **"Đổi chỗ" cho cận chiến** (GDD 1.3: 2 lượt/trận, 40/80 mana) — chưa làm.
- **Nút "Tái biên dịch"** khi bàn đầy không ghép được (GDD 1.2) — chưa làm.
- P1: debug overlay (DPS, quái lọt, tổng sao, mana/giây, ghép/phút); boss CROWN VIRUS; thu 20 trận bot + 20 trận người.
- P2: tướng mới PATCHWORK-style (HEXFORGE, TAXON, MIRRORBYTE), tướng hỗ trợ dùng `keBuff` (ANCHOR…), boss MERGE HARVESTER.
- Bố cục co-op: đang chờ ảnh tham chiếu.
