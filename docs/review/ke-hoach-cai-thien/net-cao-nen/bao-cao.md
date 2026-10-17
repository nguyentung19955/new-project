# Nét cao — NỀN: sàn, tường, nền ngoài, cửa, đồ trang trí, sân trùm, làng (17/10)

Tiếp theo phiên máy [net-cao/bao-cao.md](../net-cao/bao-cao.md) (cờ `?netcao=3|4`, cài đặt "Rất cao"; ảnh nét cao là trường `tam_n3/tam_n4` trong tệp sprite, chỉ bản web có, tải lười khi bật). Phiên này làm phần **nền** theo đúng cách đó.

**Không chơi thử bằng tay**: mọi ảnh dựng bằng lệnh rồi chụp headless (`cong-cu/chup_nen.py`). Không đổi luật, số liệu, vùng trúng, va chạm, chỗ đặt cửa / đồ / quái. Không đụng đăng nhập Google, lưu mây, `?cloud=0`.

## Tóm tắt (cho chủ game)

| | |
|---|---|
| Mặc định (không bật cờ) | **Y hệt trước**: nền dựng sẵn của 8 phòng mẫu (4 vùng × phòng thường / phòng trùm) so từng điểm ảnh với bản trước phiên: **0 điểm khác**. |
| Bật `?netcao=3` / `?netcao=4` | **Toàn bộ sàn, tường, nền ngoài, thảm của mọi vùng nét hơn hẳn**, kể cả Rừng già (không có ảnh gốc): trước đây ảnh sàn bị **thu về 1 điểm / điểm game** rồi mới phóng lên (nên ở nét 2 sàn vẫn mờ); nay nền phòng dựng thẳng ở cỡ canvas. |
| Ảnh dựng lại từ ảnh gốc ở nét 3 / 4 | **56 ảnh**: Hang biển 9 mảng nền, Lâu đài cổ 9 mảng nền + 16 đồ trang trí + thảm cửa, Sông sâu 10 mảng nền + 6 cửa + 4 đồ + cầu, sân trùm Thuồng Luồng. Mỗi ảnh đã chứng minh **cùng chỗ cắt** với ảnh đang dùng (dựng lại ở nét 2 ra **trùng 100 %** ảnh game). |
| Thiếu ảnh gốc | **Rừng già** (9 mảng nền, 16 đồ, 6 cửa), đồ trang trí + cửa Hang biển, cửa Lâu đài, **17 vật trong phòng** (rương, suối, bàn thờ…), **làng** (nền làng đang chỉ net 1, mọi công trình). Danh sách + prompt gen lại: [thieu-goc.md](thieu-goc.md). |
| Dung lượng | Bản một tệp **29,89 MB** (≤ 30, không chứa ảnh nét cao). Bản web tải đầu **17,76 MB** (≤ 20, không đổi). Ảnh nét cao nền: **≈ 0,5 MB (nét 3), ≈ 0,9 MB (nét 4)**, chỉ tải khi bật. Cả game (cộng Cu Tí): 1,10 / 1,86 MB. |
| Lát tile | Khít mép ở cả nét 2 / 3 / 4: dải trộn mép tính theo điểm game (×N), soát ảnh phóng ×4, không hở, không vạch. |
| Máy | Dựng một phòng: 11–30 ms (nét 2) → 30–39 ms (nét 3) → 55–71 ms (nét 4), chỉ lúc vào phòng. RAM nền phòng: nhớ 2 phòng thay vì 4 khi bật (~33 MB ở nét 4). |

**Ảnh so NET 2 | 3 | 4** (phóng ×4 một vùng, cùng chỗ): [Rừng](anh/x4-rung.png) · [Rừng phòng trùm](anh/x4-rung-trum.png) · [Hang biển](anh/x4-bien.png) · [Hang biển trùm](anh/x4-bien-trum.png) · [Lâu đài](anh/x4-lau.png) · [Lâu đài trùm](anh/x4-lau-trum.png) · [Sông sâu](anh/x4-song.png) · [Sông sâu trùm](anh/x4-song-trum.png) · [Sân Thuồng Luồng](anh/x4-song-thuong-luong.png) · [Làng](anh/x4-lang.png) (làng chưa đổi: thiếu gốc).
Cả màn 844×390 dpr 3 (xếp dọc 2 / 3 / 4, thu nửa): [Rừng](anh/man-844-rung.jpg) · [Hang biển](anh/man-844-bien.jpg) · [Lâu đài](anh/man-844-lau.jpg) · [Sông sâu](anh/man-844-song.jpg) · [Thuồng Luồng](anh/man-844-song-thuong-luong.jpg).

## 1. Kiểm kê — vì sao nền mờ

| Thứ | Cách vẽ trước phiên | Ở nét 2 hiện ra | Ở nét 3 / 4 (trước phiên) |
|---|---|---|---|
| Sàn, tường sau / trước / bên, nền ngoài, phủ mép (`gd-nen-*`), thảm Lâu đài | Ảnh net 2 **thu về cỡ game (có làm mịn)** rồi vẽ vào nền phòng dựng sẵn **480×270** | 1 điểm / điểm game, pha màu | phóng ×1,5 / ×2 cái nền 480×270 → vẫn 1 điểm / điểm game |
| Sân trùm Thuồng Luồng | như trên (canvas sân 480×270) | 1 điểm / điểm game | như trên |
| Đồ trang trí (`gd-tt-*`), cửa (`gd-cua-*`), vật (`gd-vat-*`), tiền cảnh | ảnh net 2 vẽ sống mỗi khung | 2 điểm / điểm game | phóng ×1,5 / ×2 |
| Làng: nền `gd-lang-nen` | ảnh **net 1** (720×270) | 1 điểm / điểm game | phóng |
| Làng: công trình, đạo cụ (`gd-lang-*`) | ảnh net 2 vẽ sống | 2 | phóng |
| Hình vẽ code (ánh sáng sàn, bóng tường, lối mòn, dấu sàn, hạt bay…) | vẽ theo ô điểm game | — | — |

Bảng đủ 158 ảnh nhóm nền (mã, cỡ, net, có gốc hay không): `cong-cu/ra/kiem-ke.json` (`cong-cu/kiem_ke.py`).

Ảnh gốc còn lại trong repo và công cụ đã dựng ra ảnh game:

| Ảnh gốc | Công cụ cũ | Ảnh game |
|---|---|---|
| `docs/anh-goc/nen-phong/hang-bien-9-mang.png`, `hang-bien-san-lien.png`, `lau-dai-9-mang.png` | `trum-moi/cong-cu/cat-nen-bien-lau.py` | `gd-nen-bien-*`, `gd-nen-lau-*` (18) |
| `ve-tay-8-gop/n1-nen-song-san.png`, `n2-san-thuong-luong.png` | `quai-song-moi/cong-cu/dung-nen.py` | `gd-nen-song-san0/1/2/nhan`, `gd-nen-song-san-tl` |
| `ve-tay-8-gop/g8-song-tuong-cua.png`, `g6-o-lap.png` | `ve-tay-8-gop-tran/cong-cu/dung-gop.py` | tường / mép / nước ngoài Sông sâu, 6 cửa, cọc, đá bùn, 2 tiền cảnh, cầu |
| `g6-o-lap.png` | `ve-tay-8-gop-giao-dien/cong-cu/cat-gd.py` | `gd-tham-lau` |
| `2026-10-12/trang-tri-lau-dai.png` (**đã xoá khỏi thư mục, lấy lại từ lịch sử git** `e9de4489`) | `tools/tach-phong` lô `tt-lau` | `gd-tt-lau-*` (16) |

## 2. Đã làm

1. **Nền phòng dựng ở cỡ thật khi bật nét cao** (`js/room_art.js`): hệ số `KB` = `G.NET` khi nét ≥ 3, còn lại 1 (mặc định không đổi gì).
   - Nền dựng sẵn (vỏ phòng + cửa) là canvas 480·KB × 270·KB có phép phóng KB → mọi hình code vẽ theo ô điểm game như cũ.
   - Ảnh tile / thảm có thêm bản cỡ thật `.hi` (ảnh nét KB thì chép 1:1; ảnh net 2 thì phóng lấy điểm gần nhất, không nhoè). Hàm `dI` vẽ bản `.hi` thay bản cỡ game.
   - 5 lượt tô từng điểm (`rampFill` sàn code, lối mòn, cột sáng, ánh sáng sàn `lightPass`, bóng tường `backPass`) gom vào `toDiem`: tính **một lần mỗi điểm game, đúng thứ tự cũ**, rồi tô cho mọi điểm thật trong ô → phần code y như cũ, ảnh bên dưới vẫn giữ chi tiết.
   - Bộ nhớ đệm phòng: khoá thêm KB + số ảnh nét cao đã về (ảnh về sau thì dựng lại phòng); khi bật chỉ nhớ 2 phòng thay vì 4.
2. **Sân trùm Thuồng Luồng** (`js/thuong_luong.js`): cùng cách (canvas sân ở cỡ thật khi nét ≥ 3).
3. **Ảnh nét cao cho ảnh giao diện `gd-*`** (`js/sprite_custom.js`, `build.py`): tệp có thêm `anh_n3` / `anh_n4` (giống `tam_n3/tam_n4` của phiên máy). `SC.gdSan` trả bản nét N (cùng mã, cùng cỡ game; tải lần đầu cần, chưa về thì ảnh thường) **chỉ khi canvas đang ở nét N ≥ 3**. Vì đi qua `gdSan` nên mọi nơi vẽ (đồ trang trí, cửa, vật, làng, tile) tự dùng, không phải sửa từng chỗ. `build.py`: `anh_n3/anh_n4` vào `NET_CAO_KEYS` (bản một tệp bỏ, bản web thành ảnh rời riêng, không tính tải đầu); thêm khoá an toàn `net_cao_cua` (mã băm ảnh thường): ai đó đổi ảnh thường mà chưa dựng lại → build tự bỏ bản nét cao và in **CHÚ Ý**.
   - Đây là phần dùng chung nhỏ (thêm, không đổi hành vi cũ). Phiên giao diện / hiệu ứng có thể dùng luôn: chỉ cần ghi `anh_n3/anh_n4` + `net_cao_cua` vào tệp `gd-*`.
4. **Dựng 56 ảnh nét 3 / 4 từ ảnh gốc** (`cong-cu/`): chép nguyên công cụ cũ, thêm `--net N`; mọi cỡ đích nhân N/2, dải trộn mép (lặp liền) tính theo điểm game; đoạn lặp của tường Sông sâu lấy theo lần chạy nét 2. Thu nhỏ bằng `thu_net` (mỗi điểm một màu có thật) hoặc NEAREST giữa ô / "Sắc nét" của trang tách (như công cụ cũ đã dùng), rồi giảm màu như cũ.
   - **Chứng minh cùng khung / chỗ đặt**: chạy lại ở nét 2 bằng đúng cách cũ → **55/56 trùng 100 % từng điểm**, `gd-tham-lau` mặt nạ trùng 100 %, màu lệch TB 1,95/255 (tấm game đã qua nén bảng màu). Cỡ ảnh nét 3/4 = rong×N × cao×N: 116/116 đúng.
   - Cột sáng `gd-cot-nang-bien/lau` dựng được nhưng không mang (ánh sáng mờ nhiều nấc trong suốt, nét cao không thấy khác).

## 3. Kiểm

| Bài | Kết quả |
|---|---|
| `node --check` mọi `game/js/*.js` | Đạt |
| `python3 game/build.py` / `--hai-tep` | Đạt — một tệp 29,89 MB; người chơi tải 17,76 MB / 20; ảnh nét cao in riêng 1,10 / 1,86 MB |
| `dist/linh-khi.html?cloud=0` headless: mặc định / `?netcao=3` / `?netcao=4` (9 cảnh + làng) | **0 lỗi JS** |
| Bản web `linh-khi-nhe.html` mặc định / 3 / 4 (ảnh nét cao tải lười thật) | **0 lỗi JS** |
| **Mặc định giống hệt**: nền dựng sẵn 8 phòng so bản trước phiên | **0 điểm khác** (ảnh cả màn có hạt bay / lửa chạy theo giờ thật nên mỗi lần chụp khác vài điểm kể cả cùng một bản — không dùng để so) |
| `tests/smoke.py` | 0 lỗi |
| `tests/*.test.js` | đều đạt (`may_luat` bỏ qua như trước) |
| Lát tile khít | ảnh phóng ×4 các vùng ở nét 3 / 4: không hở, không vạch; số đo vệt nối ngang mức nét 2 |

## 4. Còn lại / đề xuất

- **Gen lại ảnh gốc** theo [thieu-goc.md](thieu-goc.md), ưu tiên **nền làng** (đang net 1 — mờ nhất game) và **Rừng già 9 mảng** (vùng chơi nhiều nhất). Có ảnh gốc là dựng được ngay bằng `cong-cu/` (thêm lô vào `dung_net.py`).
- Sàn Sông sâu và sân Thuồng Luồng: ảnh gốc chỉ có ~3 điểm / điểm game → nét 4 không hơn nét 3 nhiều.
- Nét 3 phóng ảnh net 2 (Rừng, vật, làng) ×1,5 → ô hơi không đều; **nét 4 đều hơn** (giống khuyên của phiên máy).
- Dựng lại khi đổi ảnh: chạy lệnh trong `cong-cu/dung_net.py` (đầu tệp), rồi build.
