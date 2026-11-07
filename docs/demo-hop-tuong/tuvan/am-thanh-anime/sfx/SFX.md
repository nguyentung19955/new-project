# SFX — bộ âm thanh anime / hào hùng (bản nghe thử, CHƯA gắn vào game)

Mỗi sự kiện có 2–3 phương án (a/b/c). File OGG Vorbis q4, 44.1 kHz. Ký hiệu **mix** = trộn nhiều lớp nguồn; **BY** = có nguồn CC BY 4.0 (Oculus, cần ghi công).

Chuẩn hoá: đo RMS cửa sổ 400 ms lớn nhất (xấp xỉ short-term loudness). Mục tiêu: −16 dBFS (sự kiện lớn, nhạc chốt), −18 dBFS (tiếng bắn/đánh lặp nhiều), −22 dBFS (UI). Đỉnh ≤ −1 dBFS sau khi mã hoá (đã kiểm tra lại bằng giải mã). Tiếng quá nhiều transient không ép limiter quá 4 dB nên có thể nhỏ hơn mục tiêu 1–4 dB (ghi trong bảng).

| Sự kiện | File | Dài (s) | RMS400 (dBFS) | Đỉnh (dBFS) | Kênh | Ghi chú |
|---|---|---|---|---|---|---|
| Triệu hồi | `summon-a.ogg` | 2.2 | -16.1 (mục tiêu -16) | -7.8 | 1 | BY |
| Triệu hồi | `summon-b.ogg` | 1.8 | -16.0 (mục tiêu -16) | -5.0 | 2 |  |
| Triệu hồi | `summon-c.ogg` | 1.12 | -15.9 (mục tiêu -16) | -11.5 | 2 | mix |
| Hợp tướng (thường) | `merge-a.ogg` | 1.45 | -16.0 (mục tiêu -16) | -6.7 | 1 | BY |
| Hợp tướng (thường) | `merge-b.ogg` | 0.61 | -16.0 (mục tiêu -16) | -4.9 | 2 |  |
| Hợp tướng (thường) | `merge-c.ogg` | 0.52 | -15.9 (mục tiêu -16) | -4.1 | 2 | mix |
| Hợp tướng sao cao | `merge-sao-cao-a.ogg` | 1.82 | -16.1 (mục tiêu -16) | -2.9 | 2 | BY |
| Hợp tướng sao cao | `merge-sao-cao-b.ogg` | 1.8 | -16.0 (mục tiêu -16) | -3.9 | 2 | mix |
| Hợp tướng sao cao | `merge-sao-cao-c.ogg` | 0.93 | -16.1 (mục tiêu -16) | -4.3 | 1 | mix |
| Đột phá | `dot-pha-a.ogg` | 3.5 | -15.9 (mục tiêu -16) | -7.2 | 2 | mix BY |
| Đột phá | `dot-pha-b.ogg` | 2.6 | -16.0 (mục tiêu -16) | -2.4 | 2 | BY |
| Đột phá | `dot-pha-c.ogg` | 3.2 | -16.0 (mục tiêu -16) | -3.4 | 2 | mix |
| Jackpot | `jackpot-a.ogg` | 2.65 | -16.0 (mục tiêu -16) | -4.6 | 2 | mix BY |
| Jackpot | `jackpot-b.ogg` | 1.68 | -16.0 (mục tiêu -16) | -3.9 | 2 | mix |
| Jackpot | `jackpot-c.ogg` | 2.82 | -16.1 (mục tiêu -16) | -2.0 | 2 |  |
| Chí mạng | `chi-mang-a.ogg` | 0.7 | -16.0 (mục tiêu -16) | -4.4 | 2 | mix BY |
| Chí mạng | `chi-mang-b.ogg` | 1.2 | -16.0 (mục tiêu -16) | -3.4 | 2 |  |
| Chí mạng | `chi-mang-c.ogg` | 1.0 | -20.4 (mục tiêu -16) | -1.1 | 2 |  |
| Hạ quái | `ha-quai-a.ogg` | 0.55 | -18.1 (mục tiêu -18) | -3.3 | 1 | BY |
| Hạ quái | `ha-quai-b.ogg` | 0.53 | -21.2 (mục tiêu -18) | -1.1 | 2 |  |
| Hạ quái | `ha-quai-c.ogg` | 0.26 | -18.4 (mục tiêu -18) | -1.2 | 1 |  |
| Boss xuất hiện | `boss-xuat-hien-a.ogg` | 3.3 | -16.0 (mục tiêu -16) | -6.3 | 2 |  |
| Boss xuất hiện | `boss-xuat-hien-b.ogg` | 3.0 | -16.0 (mục tiêu -16) | -5.0 | 2 | mix |
| Boss xuất hiện | `boss-xuat-hien-c.ogg` | 3.0 | -16.0 (mục tiêu -16) | -7.6 | 1 | BY |
| Boss tung kỹ năng | `boss-ky-nang-a.ogg` | 2.5 | -16.0 (mục tiêu -16) | -1.8 | 2 |  |
| Boss tung kỹ năng | `boss-ky-nang-b.ogg` | 3.0 | -16.0 (mục tiêu -16) | -3.7 | 1 | BY |
| Boss tung kỹ năng | `boss-ky-nang-c.ogg` | 1.36 | -15.9 (mục tiêu -16) | -6.7 | 2 | mix |
| Boss gục ngã | `boss-guc-nga-a.ogg` | 4.0 | -15.9 (mục tiêu -16) | -5.3 | 2 |  |
| Boss gục ngã | `boss-guc-nga-b.ogg` | 3.0 | -16.6 (mục tiêu -16) | -1.4 | 2 | mix |
| Boss gục ngã | `boss-guc-nga-c.ogg` | 2.64 | -16.0 (mục tiêu -16) | -5.6 | 2 | mix BY |
| Bắt đầu đợt | `bat-dau-dot-a.ogg` | 2.6 | -16.1 (mục tiêu -16) | -4.1 | 2 | BY |
| Bắt đầu đợt | `bat-dau-dot-b.ogg` | 2.15 | -16.0 (mục tiêu -16) | -4.0 | 2 |  |
| Bắt đầu đợt | `bat-dau-dot-c.ogg` | 2.6 | -16.0 (mục tiêu -16) | -4.9 | 2 | mix |
| Xong đợt | `xong-dot-a.ogg` | 0.74 | -16.1 (mục tiêu -16) | -4.7 | 1 |  |
| Xong đợt | `xong-dot-b.ogg` | 1.5 | -15.9 (mục tiêu -16) | -4.9 | 2 |  |
| Xong đợt | `xong-dot-c.ogg` | 2.0 | -16.0 (mục tiêu -16) | -3.5 | 1 | BY |
| UI chạm | `ui-cham-a.ogg` | 0.8 | -22.1 (mục tiêu -22) | -5.3 | 1 | BY |
| UI chạm | `ui-cham-b.ogg` | 0.46 | -22.1 (mục tiêu -22) | -2.6 | 1 | BY |
| UI chạm | `ui-cham-c.ogg` | 0.33 | -22.3 (mục tiêu -22) | -1.2 | 1 | BY |
| UI quay lại | `ui-quay-lai-a.ogg` | 0.9 | -22.1 (mục tiêu -22) | -6.9 | 1 | BY |
| UI quay lại | `ui-quay-lai-b.ogg` | 0.38 | -22.6 (mục tiêu -22) | -1.5 | 1 | BY |
| UI quay lại | `ui-quay-lai-c.ogg` | 0.21 | -30.7 (mục tiêu -22) | -1.2 | 1 | BY |
| Thắng | `thang-a.ogg` | 5.66 | -16.0 (mục tiêu -16) | -3.8 | 2 | BY |
| Thắng | `thang-b.ogg` | 3.64 | -16.0 (mục tiêu -16) | -3.6 | 2 | BY |
| Thắng | `thang-c.ogg` | 2.65 | -16.0 (mục tiêu -16) | -4.9 | 2 | BY |
| Thua | `thua-a.ogg` | 2.81 | -16.0 (mục tiêu -16) | -3.2 | 2 | BY |
| Thua | `thua-b.ogg` | 3.72 | -16.0 (mục tiêu -16) | -3.9 | 2 | BY |
| Thua | `thua-c.ogg` | 5.29 | -16.0 (mục tiêu -16) | -3.7 | 2 | BY |
| Bắn: súng/pháo | `ban-sung-a.ogg` | 0.9 | -18.3 (mục tiêu -18) | -1.6 | 2 |  |
| Bắn: súng/pháo | `ban-sung-b.ogg` | 0.8 | -18.2 (mục tiêu -18) | -1.3 | 2 |  |
| Bắn: súng/pháo | `ban-sung-c.ogg` | 0.7 | -18.1 (mục tiêu -18) | -3.0 | 2 |  |
| Bắn: năng lượng/laser | `ban-nang-luong-a.ogg` | 0.39 | -18.4 (mục tiêu -18) | -2.4 | 2 | mix |
| Bắn: năng lượng/laser | `ban-nang-luong-b.ogg` | 1.0 | -18.0 (mục tiêu -18) | -9.7 | 1 |  |
| Bắn: năng lượng/laser | `ban-nang-luong-c.ogg` | 0.51 | -18.3 (mục tiêu -18) | -1.4 | 2 |  |
| Bắn: băng | `ban-bang-a.ogg` | 0.61 | -18.1 (mục tiêu -18) | -1.8 | 2 | mix |
| Bắn: băng | `ban-bang-b.ogg` | 1.0 | -18.2 (mục tiêu -18) | -2.8 | 2 |  |
| Bắn: băng | `ban-bang-c.ogg` | 0.8 | -18.2 (mục tiêu -18) | -2.1 | 2 |  |
| Bắn: lửa | `ban-lua-a.ogg` | 0.92 | -18.3 (mục tiêu -18) | -1.8 | 2 |  |
| Bắn: lửa | `ban-lua-b.ogg` | 1.2 | -19.1 (mục tiêu -18) | -1.5 | 2 |  |
| Bắn: lửa | `ban-lua-c.ogg` | 0.8 | -18.0 (mục tiêu -18) | -10.6 | 2 |  |
| Bắn: độc | `ban-doc-a.ogg` | 0.57 | -19.6 (mục tiêu -18) | -1.7 | 2 |  |
| Bắn: độc | `ban-doc-b.ogg` | 0.58 | -18.3 (mục tiêu -18) | -1.6 | 2 |  |
| Bắn: độc | `ban-doc-c.ogg` | 0.36 | -20.4 (mục tiêu -18) | -1.1 | 2 | mix |
| Bắn: sét | `ban-set-a.ogg` | 1.2 | -17.9 (mục tiêu -18) | -3.3 | 2 |  |
| Bắn: sét | `ban-set-b.ogg` | 1.0 | -18.3 (mục tiêu -18) | -3.2 | 2 |  |
| Bắn: sét | `ban-set-c.ogg` | 0.8 | -18.0 (mục tiêu -18) | -3.7 | 2 | mix |
| Nổ | `no-a.ogg` | 1.13 | -16.5 (mục tiêu -16) | -1.5 | 2 |  |
| Nổ | `no-b.ogg` | 0.94 | -16.2 (mục tiêu -16) | -1.8 | 2 |  |
| Nổ | `no-c.ogg` | 1.8 | -16.1 (mục tiêu -16) | -2.1 | 2 | mix |
| Hỗ trợ (xung buff) | `ho-tro-a.ogg` | 1.13 | -18.1 (mục tiêu -18) | -5.3 | 1 | BY |
| Hỗ trợ (xung buff) | `ho-tro-b.ogg` | 1.08 | -18.5 (mục tiêu -18) | -1.4 | 2 |  |
| Hỗ trợ (xung buff) | `ho-tro-c.ogg` | 1.2 | -18.2 (mục tiêu -18) | -2.5 | 2 |  |
| Cận chiến/kiếm | `can-chien-a.ogg` | 0.8 | -17.9 (mục tiêu -18) | -2.5 | 2 |  |
| Cận chiến/kiếm | `can-chien-b.ogg` | 0.8 | -18.0 (mục tiêu -18) | -2.2 | 2 |  |
| Cận chiến/kiếm | `can-chien-c.ogg` | 0.49 | -21.1 (mục tiêu -18) | -1.6 | 1 | BY |

Tổng: 75 file. Nguồn chi tiết từng file: xem `LICENSES.md`.

## Nguồn hay hơn nhưng bị chặn mạng — cần tải tay rồi đính kèm

- **Sonniss #GameAudioGDC bundles** (hàng chục GB, thu âm chuyên nghiệp: orchestral hit/braam, magic, whoosh, explosion có đuôi; giấy phép royalty-free, dùng thương mại, không bắt buộc ghi công): https://sonniss.com/gameaudiogdc — phù hợp nhất với "anime/hào hùng"; chỉ cần tải 1–2 phần rồi lọc.
- **Freesound** (lọc giấy phép CC0, cần đăng nhập để tải): https://freesound.org/search/?f=license:%22Creative+Commons+0%22 — từ khoá gợi ý: `braam`, `anime whoosh`, `energy charge`, `magic impact`, `sword slash anime`.
- **OpenGameArt — Fantasy Sound Effects Library** (Little Robot Sound Factory, CC BY 3.0, cần ghi công): https://opengameart.org/content/fantasy-sound-effects-library
- **Kenney** (CC0, bản gốc WAV/OGG): https://kenney.nl/assets/category:Audio
