# Bàn giao cho session điều phối mới (2026-10-08)

Nhánh chính: `claude/mobile-tower-defense-game-k5oxzo` — phiên bản 208. Mọi session con đã DỪNG.

## Lỗi gấp cần làm trước
- **Không triệu hồi (mua thẻ Chợ) được sau 6–7 màn** (người dùng báo trên v207). Chưa ai điều tra. Nghi do chợ 6 thẻ/tự ghép khi mua (v202), MARKET_CAP/bảo hiểm làm pool rỗng, overlay chặn chạm. Mở 1 session `claude/sua-trieu-hoi`.

## Nhánh đã xong, CHƯA gộp (commit cuối) — cần tester trước khi gộp
| Nhánh | Commit | Tình trạng |
|---|---|---|
| duong-di-moi | 7d1446b | sửa đủ 4 lỗi tester1, chờ test lại |
| vo-tan-su-kien | 16d68a4 | sửa lỗi banner bị bảng Bộ quái mới che, chờ test lại |
| pixel-tuong-thuong | b53c77d | v207 đã gộp bản trước; bản này chỉnh màu hệ + mặt nạ — chờ test |
| pixel-nen-tang | ff6f012 | banner pixel to/sáng hơn — nhỏ, chờ test |
| pixel-tuong-tim | b8b3cab | 18 tướng Tím, chờ test |
| pixel-tuong-vang | 8fc552b | 20 tướng Vàng + linh thú, chờ test |
| pixel-quai-boss | 40b123c | 41 quái/boss; được yêu cầu vẽ lại yeutinh (ma cây con), chantinh (gò đất rêu) — kiểm xem đã làm chưa |
| vfx-pixel-2 | 29677cb | hiệu ứng pixel lô 1+2; tester báo 2 lỗi (vòng choáng cắt mặt, lửa bỏng quá to) — chưa sửa |

## Nhánh dở dang (dừng giữa chừng)
sua-loi-giao-dien 41df718, can-bang-phan-thuong 95b0d90, sao3-re-nhanh 93ed7ac (★★★ rẻ+nhanh để Tím ra đợt 12–16), pixel-ky-nang-2 5c7302b, pixel-anphu-thankhi 7b047da. Chưa có commit: sua-test-cho (ổn định test cho-tuong/mo-ta-ky-nang/tu-cu-dong/icon-nho khi chạy song song), pixel-nen-canh, pixel-icon-nut, pixel-ky-nang-1, pixel-do, pixel-giao-dien.

## Hướng pixel
Đang tạm dừng vì quá tốn token. Đề xuất: viết tool lắp ghép pixel chạy trên máy (thư viện bộ phận + khung động tác + mô tả 1 dòng → sprite, có trang HTML xem trước) trước khi vẽ tiếp. Tài liệu: docs/pixel/QUY-CHUAN.md, docs/pixel/DANH-SACH.md. Pixel bật bằng `?pixel=1`; ảnh AI mới tắt (bật `?anhmoi=1`).

## Quy tắc tiết kiệm (đã ghi vào CLAUDE.md)
Session điều phối không chạy toàn bộ test, 1 tester, tối đa 4 session song song, báo cáo ngắn.

## Việc chờ (ghi 08/10, sau v220)
- **Thêm dạng bản đồ** (mở session khi `duong-di-moi` đã gộp): ngã ba sông, cầu phao/cầu đá nhiều chỗ cắt, vòng quanh núi, hai đường song song, đèo dốc, bến đò, cổng 3 phía, ruộng bậc thang. **Người dùng chốt: chỉ CỬA/MÀN ĐẦU là đường thẳng, mọi màn khác phải là dạng đường khác.** Nền pixel do tool sinh: ô sát đường đồng nhất, ô xa chỉ trang trí.
- Nhỏ: nhãn "Đã mua" → "Đã mở" khi mở kỹ năng miễn phí (★★★); thanh máu quái pixel/ảnh vẽ tay lệch (enemyBox); vòng choáng Thuồng Luồng bị HUD che ở 844×390.
