# Bước 2 — Báo cáo Phiên D: cắt ảnh và gắn vào game

Làm 15/10/2026 theo `KE-HOACH.md` (mục 3, mục 4 "Phiên D"), các mục "chỗ còn vẽ tạm" của `bao-cao-phien-A.md` / `-B.md` / `-C.md`, `QUYET-DINH.md`.
Nhánh `khoi-tao-du-an`. Không đụng master, không PR, không đổi đăng nhập Google / lưu mây / `?cloud=0`, không đổi luật / thưởng (cân bằng để Phiên E).
Không chơi thử bằng trình duyệt (chỉ chụp ảnh tĩnh bằng các script soát có sẵn).

## 1. Cắt ảnh — `docs/anh-goc/buoc-2/cat_buoc_2.py`

Theo mẫu `docs/anh-goc/ep-do/cat_ep_do.py` (dùng lại `cat_phi_tieu.py`: xoá nền xanh, bỏ mảnh vụn, cắt theo dải trống, thu nhỏ trung bình vùng × net 2, khử viền xanh).
Chạy: `python3 docs/anh-goc/buoc-2/cat_buoc_2.py` → 61 tệp `game/art/custom/*.sprite.json` + ảnh soát `docs/anh-goc/buoc-2/xem-truoc.png`
(mọi hình phóng to, khung xanh nhạt = đường "vien").

| Ảnh gốc | Mã game | Cỡ (điểm game) | Ghi chú |
|---|---|---|---|
| B1 | `gd-so-trang` | 166×173, `vien` [16, 18, 15, 18] | Ảnh gốc nằm ngang 3:2, trang trong game đứng → **dựng lại ở cỡ gốc** (giữ bề ngang, nối dài hai cạnh bên bằng đoạn hoa văn lặp đúng chu kỳ đo tự động, huy hiệu cạnh bên giữ giữa cạnh, lòng giấy kéo giãn) rồi thu một lần. Không kéo giãn hoa văn. `vien` = độ dày viền tới lòng giấy (trái/phải tính cả phần huy hiệu nhô vào). |
| B2 | `gd-so-bia` | 32×32 | **chưa gắn** (xem mục 4) |
| B3 | `gd-so-o-0/1/2` | 31×31 | ô chưa gặp / đã gặp / thuần thục; ô vàng bỏ lấp lánh rời ngoài khung |
| B4 | `gd-so-dau-fire/poison/ice` | 18×18 | |
| B5 | `gd-so-sao-0..3` | 10×10 | |
| B6 | `gd-bang-viec` | 62×60 | **chưa gắn** |
| B7 | `gd-the-viec`, `gd-the-viec-xong` | 146×34 / 149×34, `vien` [5,20,5,20] / [5,39,5,21] | 9 mảnh giãn ngang tới 304. Thẻ "xong": ô cắt phải lùi qua hết dấu đỏ ✓ để dấu không bị kéo giãn. |
| B8 | `gd-icon-viec-0..11` | 22×22 | đúng thứ tự tấm 4×3 (cột `icon` của `G.VIEC_NGAY.mau`) |
| B9 | `gd-ruong-ngay`, `-mo` | 32×28 | |
| B10 | `gd-o-tuan`, `-dau` | 18×18 | |
| B11 | `gd-huy-khung-dong/bac/vang/khoa` | 28×28 | |
| B12 | `gd-huy-hinh-0..15` | 18×18 | đúng thứ tự tấm 4×4 |
| B13 | `gd-danh-hieu-dong/bac/vang` | 101×16, `vien` [0,20,0,20] | 9 mảnh giãn ngang; đuôi + nếp cuộn ≈ 20% mỗi bên (đo tự động không ổn vì thân băng gợn sóng → đặt theo tỉ lệ, soát bằng mắt) |
| B14 | `gd-the-zed`, `gd-the-so`, `gd-the-thanh-tuu`, `gd-the-viec-ngay` | 16×16 | **chưa gắn** |
| B15 | `hu-nhan-thuong` | 6 khung 31×44 | |
| B16 | `hu-dong-dau` | 5 khung 19×30 | |
| B17 | `hu-huy-hieu` | 6 khung 36×40 | |

## 2. Gắn vào game

Mỗi hệ đã gọi sẵn `G.spriteCustom.gdSan(mã)`; Phiên D thêm **cờ `?khunganh=0`** (`G.KHUNG_ANH === false` → `gd()` trả null, hiệu ứng ảnh không phát) và
sửa bố cục khi có ảnh để chữ / hình nằm trong lòng khung (trừ viền), đặt bằng `T.chuTrongKhung` theo vùng trong. Không có ảnh hoặc cờ tắt: **bố cục
và toạ độ y như trước Phiên D** (nhánh code cũ giữ nguyên).

- **Sổ yêu quái** (`js/so_yeu_quai.js`)
  - Trang sổ `gd-so-trang`: lòng = `x + vien`; chân dung, tên, sao, mẹo đánh, quà, nút Nhận đều trong lòng giấy. Ảnh trang: chân dung 41 (thay 46) để dòng
    "Quái thường · Nhanh nhẹn" khỏi bị cắt; mẹo đánh được 6 dòng (lòng hẹp hơn nhưng còn chỗ dưới). Trang ★★★: viền vàng 1 điểm sát mép giấy.
  - Chân dung và ô lưới dùng `gd-so-o-*`; hình quái vẽ trong lòng ô (trừ viền đồng ~4 điểm); ô chưa gặp vẫn vẽ chữ "?" (dấu "?" mờ của ảnh bị bóng đen che).
  - Sao `gd-so-sao-*`, dấu `gd-so-dau-*` (trùm vùng vẫn vẽ code: không có ảnh dấu "sao").
  - Hiệu ứng: bấm Nhận nấc ★★ (tìm ra điểm yếu) → `hu-dong-dau` đóng xuống góc chân dung; nấc khác và Nhận thưởng vùng → `hu-nhan-thuong`.
- **Việc hôm nay** (`js/viec_ngay.js`)
  - Thẻ việc `gd-the-viec` / `-xong`: biểu tượng, chữ, thanh, nút nằm giữa hai nắp đồng; **chữ mực tối** (giấy sáng). Thẻ xong: nút Nhận che dấu ✓,
    nhận rồi thì dấu ✓ hiện ra và dòng thưởng đổi thành "Đã nhận" (xanh) — tiêu đề được rộng tới sát dấu.
  - Biểu tượng việc `gd-icon-viec-*`, rương ngày `gd-ruong-ngay(-mo)`, ô tuần `gd-o-tuan(-dau)`; bảng xem trong Tạm dừng cũng dùng biểu tượng ảnh.
  - Hiệu ứng `hu-nhan-thuong` khi Nhận việc, mở rương ngày, mở rương tuần.
- **Thành tựu** (`js/thanh_tuu.js`)
  - Huy hiệu `gd-huy-khung-*` + `gd-huy-hinh-*` (hình thu 0,95 bán kính cho nằm trong lòng tối); khung khoá có ổ khoá trong ảnh → bỏ hình mờ + ổ khoá code.
  - Băng danh hiệu `gd-danh-hieu-*`: vẽ theo tỉ lệ thật (băng thấp hơn 16 thì thu cả hình, đuôi không bị bóp dẹt), chữ trong thân băng trừ đuôi
    (`TT.duoiAnh(cap, h)`); dải trên đầu Cu Tí ở làng rộng thêm cho đủ đuôi.
  - Hiệu ứng `hu-huy-hieu` khi bấm Nhận (thay vòng sáng code).

## 3. Kiểm (đã chạy)

- `node --check` 3 tệp JS; `python3 game/build.py` và `python3 game/build.py --hai-tep` không lỗi.
- Bài Node: `so_yeu_quai.test.js` 41 ✓, `viec_ngay.test.js` 36 ✓, `thanh_tuu.test.js` 35 ✓, `su_kien.test.js` 83 ✓, `cloud_save_regression.test.js` PASS.
- Ảnh soát chụp lại: `xem-so.png`, `xem-viec.png`, `xem-thanh-tuu.png` (VI + EN).
  - `game/tests/so_yeu_quai_shots.py` và `game/tests/viec_ngay_shots.py` trước mở `game/index.html` (mã nguồn **không có ảnh**) → nay **mặc định mở
    `game/dist/linh-khi.html`** (có ảnh nhúng; nhớ `python3 game/build.py` trước), `--nguon` để về mã nguồn, `--q khunganh=0` để thử cờ.
  - Đếm chữ: sổ 36 trang × VI/EN cắt "…" 0 / thấp 0 / hẹp 0 (có ảnh và `?khunganh=0`); Việc hôm nay mọi mẫu × VI/EN cắt 0 (có ảnh và `?khunganh=0`);
    Thành tựu cắt 0, "thấp hơn khung" 1 (VI) là nút "Nâng cấp bộ" có sẵn của Hành trang — như báo cáo Phiên C, không thuộc phiên này.
- Không có lỗi trang / console trong các lần chụp.

## 4. Ảnh chưa gắn / chưa ổn — cần gen lại?

- **Chưa gắn** (đã cắt sẵn, game chưa dùng): B2 `gd-so-bia`, B14 `gd-the-*` (biểu tượng thẻ) — hàng thẻ của Ông Từ / Anh Mõ nằm trong `village.js`
  (`khungThe`) đang có phiên khác sửa, nên chưa thêm biểu tượng vào thẻ cho khỏi đụng nhau; B6 `gd-bang-viec` — bảng Việc hôm nay đã kín chỗ.
  Phiên sau muốn dùng thì gọi `G.spriteCustom.gdSan('gd-the-so')`… (đã có trong bản đóng gói, ~vài KB mỗi hình).
- **Không cần gen lại.** Vài điểm nhỏ để chủ game xem:
  - B1: ảnh gốc nằm ngang nên trang phải dựng lại (nối hoa văn cạnh bên); gần huy hiệu cạnh bên có vệt sáng nhỏ của nẹp đồng gốc. Nếu muốn đẹp hẳn:
    gen lại B1 **khung đứng ~1:1**, không có huy hiệu giữa hai cạnh bên.
  - B3 ô "chưa gặp" có dấu "?" quá mờ, bị bóng đen của quái che → game vẫn vẽ chữ "?". Không cần gen lại.
  - B16 `hu-dong-dau` khung đầu con dấu nằm lệch trái-trên (rơi chéo) — nhìn vẫn được ở cỡ nhỏ.
  - B13: thân băng gợn sóng, chữ dài ở băng hẹp (Hành trang) thu về cỡ 6.

## 5. Dung lượng

| | Trước Phiên D (sau vùng 4 phiên 1) | Sau Phiên D |
|---|---|---|
| **Người chơi tải** (WebP, thước đo chính, trần 20 MB) | 15,80 MB | **16,18 MB** (+0,38 MB) |
| Không có WebP | ~18,0 MB | 18,57 MB |
| Lõi tải trước vùng đầu | 5,08 MB | 5,47 MB (58 hình `gd-*` là ảnh lõi theo luật `bat_buoc`; 3 `hu-*` tải sau) |
| Bản một tệp (trần 30 MB) | 27,38 MB | 28,10 MB |

## 6. Cờ quay lui

- `?khunganh=0` (`G.KHUNG_ANH = false`): Sổ / Việc hôm nay / Thành tựu bỏ ảnh Bước 2 và hiệu ứng ảnh, vẽ code y như trước Phiên D (cờ này tắt luôn
  các khung 9 mảnh khác như trước).
- Các cờ cũ giữ nguyên: `?sukien=0`, `?soyq=0`, `?viecngay=0`, `?thanhtuu=0`. `?humo=0` (`G.HU_MO = false`) cũng tắt hiệu ứng ảnh mới.

## 7. Commit

- Cắt ảnh: script + 61 tệp sprite + `xem-truoc.png`.
- Gắn ảnh: `so_yeu_quai.js`, `viec_ngay.js`, `thanh_tuu.js`, 2 script soát, 3 ảnh soát.
- Dựng lại `game/dist/*` + báo cáo này.
