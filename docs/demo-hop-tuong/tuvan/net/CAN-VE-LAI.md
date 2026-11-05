# Ảnh CẦN VẼ LẠI (tấm ChatGPT gốc quá nhỏ cho cỡ hiển thị lớn nhất) — 05/11/2026

Đo bằng `tools/thap-kt-net.js` (360/390/430 px, DPR 3). Các ảnh dưới đây đã được cắt lại tối đa độ nét raw (hoặc không cắt lại được)
nhưng vẫn bị phóng > 1.05× → phải gen tấm mới to hơn. Danh sách máy đọc: `tools/thap-kt-net-bo.json` (công cụ đo đánh dấu "đã liệt kê").
Prompt: tiếng Anh, ngắn, đính kèm ảnh hiện tại của đúng vật đó làm mẫu, nền **#FF00FF đặc**, không chữ. Gen xong: đặt vào
`docs/demo-hop-tuong/thap-art/raw_net_<nhóm>.png` rồi cắt bằng `tools/thap-net-cat.py` (thêm tên vào MUC) hoặc công cụ gốc của nhóm.

| # | ảnh | đang có → cần (điểm ảnh, ở 430 px DPR 3) | chỗ thấy | ưu tiên |
|---|---|---|---|---|
| 1 | `pilot_<id>` (85 chân dung) | 344–427 → ~1000–1320 | hero trang ụ (còn thẻ bộ sưu tập 1.2–1.6×) | **cao** — **phiên hero detail (trig_01Dhqw9SxjVxcVj5WHtpdiYf) đang làm** (raw_pilot_*_v3 990 px, `tools/thap-pilot-net.py`) — phiên này KHÔNG làm trùng |
| 2 | `<id>_nong` (85 đầu súng) | 256 (raw chỉ ~320) → ~650 | ụ to ở trang ụ (`.dau`) | cao |
| 3 | `af_hero`, `af_dahlia`, `af_eve` | 725 → ~1420 | ảnh chỉ huy lớn ở NHÀ / sảnh | cao |
| 4 | `tier_ring_<bậc>` (5) | 256 → ~540 | vòng độ hiếm dưới ụ ở trang ụ | trung bình |
| 5 | `chon_vong` (4 khung) | khung ~255 → ~430 | vòng sáng thẻ đang chọn (bộ bài) | trung bình |
| 6 | `nhan_kn` | 376 (raw tối đa) → ~1350 | tấm tên kỹ năng nổi trên bàn | trung bình |
| 7 | UI nhỏ: `ngoc_<bậc>` 32→48, `ic_pvp` 96→144, `ui_thuong` 256→360, `tai_day`, `ht_tim`, `h2_tam_mong`, `bang_cutin_nen`, `bang_trum_nen`, `h2_rail`, `khung_chon`, `h2_ngoc`, `h2_den_doi`, `o_trong`, `chon_de_xanh`, `h2_vong_xam`, `duong_mui`, `h2_glint`, `hat_tuyet`, `vong_nap_*` | 1.1–1.7× | bảng lọc, chế độ, kết quả, thanh tải, HUD | thấp |
| 8 | hiệu ứng: `fx_<ụ>_trung/_no/_dan/_hieu` còn lại, `fx_vong_mong`, `fx_nhatthuc_hieu`, `fx_bingo`, `fx_summon`, `fx_laser_trung`, `sig_*`, `cf_*`, `khoi_*`, `fxb_*` | 1.1–3.9× (chỉ hiện chốc lát) | trận | thấp |
| 9 | trùm/quái to `trum_*_8`, `quai_khong_lo_8` | 1.1–1.7× | trận | thấp |
| 10 | nền `nen_home`, `nen_deck`, `nen_menu` (.jpg), `san_tran` | 1024×1536 → 1720×2580 | nền mờ dịu | rất thấp — ChatGPT tối đa 1024×1536, không gen to hơn được |

(Không cần gen: `fx_cham_trang`, `fx_bui` — đốm sáng mềm không có chi tiết.)

## Prompt

**#2 đầu súng (2 cái / tấm, 1536×1024):**
"Two top-down turret heads side by side, barrels pointing right, exactly the same designs and colors as the two attached, each about 700 px wide, centered in its half, crisp clean lines, solid #FF00FF background, no base, no text."

**#3 chỉ huy (1 / tấm, 1024×1536):**
"Same character as attached, same outfit and colors, waist-up portrait, face in the upper third, large and centered, crisp anime game art, solid #FF00FF background, no text."

**#4 vòng độ hiếm (1536×1024, lưới 3×2, 5 ô dùng):**
"Five round metal rarity rings in a 3×2 grid (white, blue, purple, gold, red), same style as attached, each ring about 480 px, top-down, crisp, solid #FF00FF background, no text."

**#5 vòng chọn thẻ (1536×1024, 4×1):**
"Four animation frames of the same glowing card selection frame as attached, in a 4×1 row, each frame about 370×480 px, same colors, crisp, solid #FF00FF background, no text."

**#6 tấm tên kỹ năng (1536×1024, 1 hình):**
"One wide steel pill-shaped label plate, same style as attached, about 1400×600 px, centered, crisp edges, empty middle, solid #FF00FF background, no text."

**#7 UI nhỏ (1536×1024, lưới 4×3):**
"Same game UI pieces as attached (rarity gems white/blue/purple/gold/red, PVP mode icon, victory crown, heart, thin steel plate), one per cell in a 4×3 grid, each 2–3× larger than attached, same style and colors, crisp, solid #FF00FF background, no text."

**#8 hiệu ứng (1536×1024, lưới 4×2 — ô 384 px):**
"Same effect frames as attached, one per cell in a 4×2 grid, each about 360 px, same colors and glow, crisp, solid #FF00FF background, no text."
