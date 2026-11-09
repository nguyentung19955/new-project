# Tư vấn live-ops & thu phí (ChatGPT, 09/11/2026)

Đầu vào: THIET-KE-TIEN-TRINH.md + KINH-TE.md. Tóm tắt (diễn đạt lại, không chép nguyên văn).

## Kết luận
- F2P, thu chủ yếu bằng **cosmetic + Season Pass**. Chưa bán Ngọc để quay, **không** bán thẻ Đỏ/Vàng hay tăng tỉ lệ Đỏ bằng tiền.
- Giữ Ngọc là tài nguyên kiếm bằng chơi; nếu cần tiền trả phí → loại riêng chỉ mua cosmetic.
- Không giảm thưởng F2P để ép nạp.

## Phản biện tiến trình
- Giữ mở bậc theo cấp TK; cho **xem/thử** ụ chưa mở (Draft chuẩn hoá) trước khi mở khoá.
- Hành trình 7 ngày: ngày 5 (2 ụ 5★) và ngày 6 (Cấp 9) dễ nghẽn → thêm mục tiêu thay thế cùng độ khó, cho hoàn thành bù.
- Không năng lượng: giữ. Săn Trùm hết vé vẫn cho chơi luyện tập (không thưởng).
- Mốc Đỏ 3.600: giữ đợt 1; dài hạn chuyển thưởng Đỏ sang thành tích khó thay vì số trận.
- MAX Đỏ ~19 tháng (thường)/~8 tháng (giỏi): giữ khó nhưng phải có tiến bộ cảm nhận được ở LV12–14; đo riêng thời gian có Đỏ đầu tiên / nâng Đỏ lần đầu.
- D1 rủi ro: trận Solo ~11 phút, Leo Tháp mở cấp 5 → thêm thử thách ngắn 3–5 phút ngay sau hướng dẫn.
- Mô phỏng thêm nhóm 1–2 trận/ngày.
- PVP dùng cấp thẻ thật sẽ pay-to-win nếu bán sức mạnh → cần xếp hạng chuẩn hoá / ghép theo sức mạnh.
- Mục tiêu soft-launch: D1 ≥30%, D7 ≥10%, D30 ≥5%.

## Mô hình thu phí (giá thử nghiệm)
| Hình thức | Giá | Quyết định |
|---|---|---|
| Season Pass 28 ngày, 30 cấp (Free + Premium cosmetic) | 89–149k | Ưu tiên cao nhất |
| Skin ụ (không đổi silhouette, không che VFX ở ~46px) | 39–99k | Nên |
| Khung/banner/hiệu ứng ghép | 19–79k | Nên |
| Gói khởi đầu (cosmetic) | 19–49k | Nên |
| Quảng cáo thưởng tự chọn, 1–2 lần/ngày, không giữa trận | — | Thử |
| VIP/tháng | 59–99k | Để sau |
| Bán Ngọc quay gacha | — | Chưa nên |
| Bán Đỏ / tăng tỉ lệ Đỏ | — | Không |

## Hệ thống cần chuẩn bị
- P0: UID ổn định + liên kết TK + cloud save/khôi phục; ví nhiều loại tiền, giao dịch có ID, sổ cái server; server xác thực thưởng/rương/nâng cấp/kết quả trận (không tin localStorage); analytics (tutorial_complete, battle_end, mission_claim, card_upgrade, chest_open, purchase_complete).
- Lưu ý: gộp TK kiểu "lấy max/OR cờ" hiện tại **không an toàn** khi có tiền thật → cần giao dịch nguyên tử, chống xử lý trùng.
- P1: bảng tỉ lệ gacha theo phiên bản + pity trên server + công khai tỉ lệ; cấu hình live-ops từ server có rollback; IAP Apple/Google xác minh server-side.
- Pháp lý: công bố xác suất vật phẩm ngẫu nhiên (Apple/Google), thanh toán qua cửa hàng, chính sách riêng tư + xoá TK; tại VN kiểm tra Nghị định 147/2024/NĐ-CP.

## Lộ trình
1. Nền F2P: đợt 1 tiến trình + analytics + ledger server.
2. Soft-launch: thử thách ngắn, Leo Tháp, Săn Trùm, thử thách tuần chuẩn hoá; đo retention.
3. Thương mại hoá thử: 1 Season Pass cosmetic, 3–5 skin ụ dùng nhiều nhất, starter pack, IAP, pháp lý.
