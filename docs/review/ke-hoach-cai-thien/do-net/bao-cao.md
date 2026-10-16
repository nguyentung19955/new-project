# Độ nét: Cu Tí và một số quái nhoè (17/10)

Chủ game báo (17/10 02:09): *"nhân vật mờ hơn các con quái rất nhiều, nhất là con heo con rất nét. Sao người nhân vật và một số quái nhoè đi vậy?"*

Đã chờ phiên giảm dung lượng (`dung-luong-16-10/bao-cao.md` có lúc 19:28) rồi mới sửa. **Không chơi thử bằng tay**: mọi ảnh dựng bằng lệnh rồi chụp headless (`cong-cu/do_tran.py`). Không đổi luật, số liệu, vùng trúng, khung đòn, neo vũ khí.

## Tóm tắt

| | Trước | Sau |
|---|---|---|
| Cu Tí (bộ ninja: đứng / chạy / chém kiếm) — chỉ số nhoè* | **18,0 / 17,0 / 17,4** | **8,1 / 9,3 / 8,0** (heoCon = 10,3) |
| Cu Tí: điểm viền mờ (alpha lửng) | 20–22 % điểm ảnh | 0,5 % |
| Cu Tí: hàng/cột điểm ảnh bị nhân đôi do phóng 1,2 lúc vẽ | 16–17 % | **0 %** |
| 3 bộ trang phục khác (đứng) | 19,5–21,6 | 12,3–14,3 |
| 8 quái nhoè nhất (Hải Quỳ, Nhím, Nhím Gai Độc, Cá Con, Cá Chuồn, Cá Nóc, Sứa, Đèn Lồng) | 28–37 | 24–33 (khung khớp ảnh gốc: 28–34 / 34) |
| Bản một tệp | 28,46 MB (trước khi gộp phiên này) | **29,73 MB** (≤ 30 MB) |
| Người chơi tải (bản web) | — | 17,7 MB / trần 20 |
| Soát cầm vũ khí `cam-vk-chuan/soat.py` | 0 lỗi | **0 lỗi** (27 hàng × 4 cấp) |

\* chỉ số nhoè = % điểm ảnh bị pha giữa hai màu + ½ × % điểm viền lửng, đo trên canvas thế giới; thấp = nét. Bảng đầy đủ mọi hình: [bang-chi-so.md](bang-chi-so.md).

**Cờ về cách cũ: `?netcu=1`** (cách vẽ cũ: phóng 1,2 lúc vẽ, vũ khí/trùm thu lúc vẽ; bản web còn nạp lại ảnh cũ `<mã>-netcu`).

## 1. Đo — vì sao nhoè (từng loại hình)

Máy đo `cong-cu/do_tran.py`: dựng từng hình bằng chính hàm vẽ của game trên nền trơn, ghi **mọi lệnh vẽ ảnh** (ảnh nào, phóng bao nhiêu, xoay, làm mượt, toạ độ lẻ), chụp ở 844×390 (dpr 3) và 1280×720. Tấm ảnh gốc đo thêm bằng `cong-cu/do_tam.py`.

| Hình | Ảnh gốc thu nhỏ bằng | Phóng lúc vẽ | Làm mượt | Xoay | Toạ độ lẻ | Nhoè do |
|---|---|---|---|---|---|---|
| **Cu Tí** (4 bộ, mọi hàng, cả hàng nắm tay) | **BOX = lấy trung bình** từ ảnh AI cao ~490 điểm xuống 62 (×0,13) | dựng ở canvas phụ 1:1 rồi **×1,2 lúc vẽ** (lấy điểm gần nhất) | tắt ở mọi canvas (canvas phụ, lớp nhuộm, ghép eo) | không (chỉ nghiêng thân ≤ 12° khi nhắm) | không (làm tròn nửa điểm game = điểm thật) | **(1) trung bình màu → pha màu + 22 % điểm viền lửng; (2) ×1,2 → cứ 5 điểm lặp 1** |
| Vũ khí Cu Tí | BOX, lưu to gấp ~2,2 cỡ vẽ | **thu lúc vẽ** ×0,45 (kiếm), ×0,63 (thương), ×0,38 (búa), ×0,12 (phi tiêu) + xoay | tắt → trình duyệt bỏ điểm | có (theo neo) | có (theo neo) | rơi điểm, cạnh lởm chởm, nhấp nháy khi xoay; 11 % viền lửng |
| Quái thường, tinh anh (cùng tấm) | **LANCZOS** + cắt alpha + 32/48 màu | 1:1 | tắt | không | không | pha màu trong thân (20–37 % so với heoCon 10 %); không viền lửng |
| heoCon (chuẩn) | như trên, nhưng ảnh gốc ít mảng chuyển màu | 1:1 | tắt | không | không | — |
| Trùm | như quái | 1:1; **Hồ Tinh pha 3 ×0,72** | tắt | không | có (×0,72) | Hồ Tinh pha 3 rơi 28 % điểm |
| Người làng (NPC) | như quái | 1:1 (chỉ ở làng) | tắt | không | không | nhẹ (12–22) |
| Nén màu phiên dung lượng | — | — | — | — | — | **không làm nhoè**: ảnh Tí/quái đổi sang bảng màu KHÔNG mất (đã so) |
| Màn hình (CSS) | — | 844×390: ×2,17; 1280×720: ×1,33 | `pixelated` | — | — | như nhau cho mọi con — không phải lý do Tí nhoè hơn |

→ Nguyên nhân chính của Cu Tí: **ảnh bị thu nhỏ bằng cách lấy trung bình** (nghi vấn "lanczos/bilinear" đúng) **cộng phóng 1,2 lúc vẽ** (nghi vấn "×1,2" đúng). Canvas tạm / lớp ghép eo / xoay vũ khí đều đã tắt làm mượt; toạ độ không lẻ (nghi vấn này không đúng). Ảnh trước/sau ở cột "TRƯỚC màn …" có viền hồng: đó chính là các điểm viền lửng hoà với nền thử.

## 2. Đã sửa

1. **Thu nhỏ lại ảnh gốc Cu Tí kiểu điểm ảnh** (`cong-cu/thu_net.py`): mỗi điểm mới đục hẳn hoặc trong hẳn (phủ ≥ ½), màu = **một màu có thật** trong ô gốc, gần màu trung bình nhất (không pha), rồi giảm chung 64 màu. Ảnh AI có lưới ~4 điểm/ô, Tí cần ~2 ô gốc / điểm game nên lấy theo ô vẫn giữ mặt, mắt, đai. Chạy lại đúng `docs/anh-goc/zed/dung-zed-game.py` (`cong-cu/dung_zed_net.py`): cùng khung nguồn, cùng tỉ lệ, cùng chỗ đặt (đã chứng minh: dựng bằng BOX ra **trùng 100 %** mặt nạ ảnh đang dùng) — **chỉ thay ảnh, mọi số trong tệp giữ nguyên từng ký tự** (neo, eo, nắm tay, cầm chuẩn). Không tô viền tối cho Tí (thử thì ngón tay thành vệt đen).
2. **Nướng sẵn cỡ ×1,2** ("bản to", mục `tam_to` + `to`): dựng thẳng từ ảnh gốc ở cỡ 1,2 (không phóng ảnh đã co). Trong trận Tí dựng vào canvas phụ ở nét 2,4 từ bản to rồi chép **1:1** ra màn → **không còn phép phóng không nguyên**. Mỗi ô 96 của tấm thường ↔ một ô 116 của bản to (`veT` trong `js/zed_moi.js`), nên ghép eo / nghiêng / lật / nắm tay chạy y như cũ. Bản to tải lười (lần vẽ Tí đầu tiên, ở làng). Bỏ ô nắm tay kiểu cũ khỏi bản to (`goi_to.py`; chỉ dùng khi tắt cờ nắm chuôi, lúc đó tự vẽ từ tấm thường).
3. **Vũ khí, phi tiêu bay, trùm vẽ nhỏ hơn ảnh** (Hồ Tinh pha 3): thu sẵn đúng cỡ vẽ bằng cùng cách lấy màu có thật (`SC.nhoAnh` trong `js/sprite_custom.js`, nhớ lại theo cỡ, tối đa 240 cỡ/ảnh), không để trình duyệt bỏ điểm.
4. **8 quái nhoè nhất**: công cụ dựng cũ không chạy lại được (tấm `-cu` đã xoá 15/10) nên `cong-cu/dung_quai_net.py` làm ngược: mỗi khung tìm ảnh gốc + tỉ lệ + chỗ dán cho ra đúng khung đó (so mặt nạ ≥ 97 %), khớp thì dựng lại từ ảnh gốc bằng cách mới (có viền tối 1 điểm như heoCon). Khung không khớp (hàng đánh của Nhím / Nhím Gai Độc đã thay ảnh ở phiên soát mượt…) giữ nguyên. Đã thử cả 35 quái (`cong-cu/ra/quai-net.json`), chỉ ghi 8 con nhoè nhất để giữ dung lượng.
5. Soát cầm vũ khí: ở khung 2 "Phi thương" mảng da cổ áo tách khỏi cằm làm máy đo báo nhầm "tay thứ hai"; `noi_da.py` nối lại đúng 1 điểm ảnh → **0 lỗi**.

Ảnh cạnh nhau TRƯỚC | SAU | heoCon (×4 canvas, màn 844×390, màn 1280×720): thư mục [anh/](anh/) — `ti-ninja-dung`, `ti-ninja-chay`, `ti-ninja-kiem`, `ti-rung-dung`, `ti-ninja-spear-chem`, `quai-heoCon`, `quai-haiQuy`, `quai-nhim`, `quai-nhimDoc`, `quai-caCon`, `quai-caChuon`, `quai-sua`, `trum-hoTinh-p3`.

## 3. Còn lại (chưa làm, để không vượt dung lượng / không vỡ dáng)

- 3 bộ trang phục Rừng / Biển / Lâu đài: đã nét (12–16) nhưng ảnh gốc nhiều mảng chuyển màu nên chưa bằng bộ ninja.
- Nắm tay ôm cán (ảnh nhỏ 6–9 điểm) và hàng **thương nâng tay trái** (phiên khác, dựng canvas riêng từ tấm thường) vẫn phóng 1,2 lúc vẽ — vài điểm ảnh.
- 27 quái còn lại khớp ảnh gốc 26–34/34 khung, dựng lại được ngay (`dung_quai_net.py <mã> --ghi-ra`), mỗi con +3–20 KB; bản một tệp còn 0,27 MB tới trần 30 MB nên chưa ghi. Trùm vùng (ảnh lớn) chưa đụng.
- Chỉ số nhoè của Hồ Tinh pha 3 tăng nhẹ (22 → 24) vì giữ đủ màu thay vì bỏ điểm; nhìn ảnh thì mịn hơn, hết đốm rơi.

## 4. Kiểm

| Bài | Kết quả |
|---|---|
| `node --check` mọi `game/js/*.js` | Đạt |
| `python3 game/build.py` / `--hai-tep` | Đạt — một tệp 29,73 MB; người chơi tải 17,7 MB / 20 |
| `tests/smoke.py` | 0 lỗi |
| `tests/*.test.js` (lưu mây, cảm giác đánh, cầm vũ khí…) | đều đạt (`may_luat` bỏ qua như trước: thiếu thư viện) |
| `cam-vk-chuan/soat.py` | 0 lỗi mọi hàng × cấp |
| `?netcu=1` | vẽ lại đúng cách cũ (đo: thân ×1,2, vũ khí ×0,45, Hồ Tinh ×0,72) |

Không đụng đăng nhập Google, lưu mây, `?cloud=0`. Dựng lại: `python3 cong-cu/dung_zed_net.py --ghi` → `goi_to.py` → `noi_da.py zed-moi,zed-rung,zed-bien,zed-lau db_thuong`; đo: `cong-cu/do_tran.py <ra> [cờ]`, so: `cong-cu/so_sanh.py`.
