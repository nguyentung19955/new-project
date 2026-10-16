# Quái Sông sâu mới + nền Sông sâu + sân Thuồng Luồng + Ngư Tinh xuất hiện (16/10)

Đã chờ báo cáo `../ve-tay-8-gop-tran/bao-cao.md` (bộ nền Sông sâu: tường, cửa, dòng chảy) rồi mới kéo về, gộp (rebase sạch, không xung đột).
**Không chơi thử**: chỉ dựng cảnh bằng lệnh rồi chụp ảnh headless. Không đổi luật, số liệu, vùng trúng, thời gian đòn.
Không đụng đăng nhập Google / lưu mây / `?cloud=0`.

## Cờ quay lui

| Cờ | Về như cũ |
|---|---|
| `?quaisongmoi=0` | 4 quái (Rái Cá, Đỉa Trâu, Ba Ba, Cóc Tía) về hình tạm (ảnh con mượn nhuộm màu) |
| `?nentile=0` | Sàn (và cả bộ tile) Sông sâu vẽ code. `?gop8=0` cũng tắt sàn mới vì đi chung bộ tile của phiên vẽ tay 8 gộp |
| `?santl=0` | Sân trùm Thuồng Luồng vẽ code như cũ |
| `?ngumoman=0` | Ngư Tinh xuất hiện dùng ảnh gần nhất của vẽ tay 9. `?trum9=0` về vẽ code |

## 1. Bốn quái thường Sông sâu

- Cắt: `cong-cu/cat-6-hang.py` → `docs/anh-goc/quai-moi/dong-tac/<mã>-<bước>-cat/` (cùng chỗ các quái cũ). Hàng tách theo dải trống xanh;
  khung tách bằng **đường cắt cong** đi qua chỗ ít điểm ảnh nhất (các khung dính nhau ở Rái Cá hàng đi / nhảy, Đỉa hàng đánh, Ba Ba hàng đánh),
  mẩu sào / đầu của khung bên cạnh bị xén vào thì bỏ.
- Dựng: `../vung-4-quai/cong-cu/dung-song.py --ghi` (chỗ chờ ảnh của phiên 2A) — cùng đường chân, cùng cỡ đầu giữa các hàng (đo SIFT như heoCon / các quái mới).
  Ảnh soát: `anh-soat/tam-<mã>.png` (6 hàng, vạch đỏ = đường chân, khung viền vàng = khung đánh được phát), `anh-soat/gif-<mã>.gif` (chạy lần lượt 6 hàng).
- Hết nhuộm: quái Sông sâu có ảnh thật thì bỏ lớp nhuộm "nước đục" chung của vùng 4 (`vung4.js`), vẽ đúng màu ảnh.

| Mã | Ô khung (điểm game) | Ghi chú |
|---|---|---|
| `raiCa` | 64 × 49 (ảnh 130 × 96 như yêu cầu) | Xem dưới |
| `diaTrau` | 59 × 41 (≈ 116 × 86) | Ảnh mới bò trên đất (bỏ kiểu "bơi" của con mượn Cá Con). Thu nhỏ (cao 28) để bầy 3 con không bè quá hộp va chạm |
| `baBa` | 78 × 36 | Rộng hơn ô 124 × 88 vì cổ phóng dài ở hàng đánh |
| `cocTia` | 75 × 56 | Rộng hơn vì bọt bay ở hàng đánh; cao 37 cho thân ≈ hộp va chạm |

Khung đánh khớp mốc đòn có sẵn (không đổi thời gian đòn):

- **Ba Ba**: đòn trúng lúc bắt đầu hàng đánh → phát khung 3–6 (mở ngay bằng cổ duỗi hết).
- **Cóc Tía**: 3 bọt bay ra lúc bắt đầu hàng đánh → phát khung 2–6 (khung 2 có bọt đầu tiên).
- **Đỉa Trâu**: lao 1–2 lần, mỗi lần phát lại hàng đánh → khung 2–6 (thân vươn dài).
- **Báo trước** mọi con: đúng thời lượng báo trước thật (0,6 / 0,5 / 0,6 / 0,7 giây).

**Rái Cá — ảnh chỉ có 5 hàng**: hàng 3 là "chống sào nhảy" (6 khung: cắm sào, bay 3 khung, đáp đập sào 2 khung), không có hàng báo trước riêng.
- Báo trước (0,6 giây đứng tại chỗ, vòng đỏ) = khung 1 "cắm sào lấy đà" giữ cả 6 cột.
- Đánh = khung 2–6 của hàng nhảy; game phát hàng đánh **lúc đáp** (đúng lúc đòn trúng) → chọn phát khung 4–6: mở ngay bằng cú đập có bụi.
- Lúc bay (0,45 giây) game vẫn phát hàng đi như hình tạm (không sửa mã kỹ năng). Muốn đẹp hơn: gen thêm hàng "báo trước" riêng.

**Rái Cá hàng trúng đòn**: khung 2–4 mất cây sào → đã **ghép lại cây sào từ khung 1** (tìm đoạn thẳng dài nhất màu tre, chép sang, vẽ SAU thân
nên tay / thân vẫn ở trên). Xem hàng 5 của `anh-soat/tam-raiCa.png`.

## 2. Nền Sông sâu (sàn)

- `cong-cu/dung-nen.py --ghi`: n1 = 4 ô; mỗi ô tìm **chu kỳ lặp thật** (189–192 điểm ảnh, ảnh AI không chia đúng 1/3), cắt đúng một chu kỳ ở giữa,
  thu về 64 × 64 điểm game, trộn dải mép cho liền, 64 màu.
- Ra `gd-nen-song-san0`, `-san1`, `-san2`, `-san-nhan` (cùng chuẩn bộ nền Rừng / Biển / Lâu). Không phải sửa mã: phiên vẽ tay 8 gộp đã chừa sẵn
  chỗ ("sàn vẫn vẽ code vì ảnh sàn chưa cắt; khi có thì tự dùng").
- Soát liền mép: `anh-soat/lat-3x3-gd-nen-song-san*.png` (không thấy đường nối). Trong phòng: `anh-soat/truoc-sau-song-phong.png`.
- Ghi chú: sàn mới là sàn ván tre kín phòng (đúng ảnh gen), thay cho nền bùn / sỏi / bến ván vẽ code. Dòng chảy, cầu, vũng sâu vẫn vẽ đè lên như cũ.

## 3. Sân trùm Thuồng Luồng

- n2 lặp 3 × 3, chu kỳ 418 điểm ảnh; giữa các ô có vệt nối lộ (chênh mép gấp 4 lần bên trong) → trộn dải mép rộng hơn. Ra `gd-nen-song-san-tl`
  (128 × 128 điểm game cho đỡ lặp trên sân 282 × 186). Soát: `anh-soat/lat-3x3-gd-nen-song-san-tl.png`.
- Nối ở `thuong_luong.js` (`dungSan`): ảnh lát kín sân thay mặt đá vẽ code; dải nước sâu quanh bãi (chỗ không đứng được) vẫn phủ tối lên trên,
  thêm viền bãi, lối đá ở cửa giữ nguyên. **Bãi đứng, chiêu, vùng đỏ không đổi.** Ảnh chưa tải: sân code, tải xong tự dựng lại.
- Ảnh soát: `anh-soat/truoc-sau-song-trum.png`.

## 4. Ngư Tinh xuất hiện

- `cong-cu/dung-ngu-tinh.py --ghi`: 8 khung n3 → `hu-ngu-tinh-mo-man` (căn theo tâm vòng nước, 24 màu, 24 KB).
- Nối ở `monster_art.js` (cử động "Ra mắt" của Ngư Tinh): thay 3 ảnh tạm của vẽ tay 9 (vòng sóng, bọt, cột nước). Mốc giữ như cũ: khung 1–3 vòng + bọt
  (0–25% thời gian ra mắt), khung 4–6 cột nước (25–62%, vẽ trước thân cá như cột nước cũ), khung 7–8 sóng lớn (62–100%, mờ dần cuối).
- Thuồng Luồng (đang mượn thân Ngư Tinh) cũng dùng ảnh này, nhuộm theo màu của nó.
- Ảnh soát: `anh-soat/truoc-sau-ngu-tinh-ra-mat.png`, `truoc-sau-song-trum.png` (cột nước lúc Thuồng Luồng ra).

## Kiểm

- `node --check` mọi `game/js/*.js`: đạt.
- `quai_song.test.js` 69, `vung4.test.js` 38, `song_luat.test.js` 40, `thuong_luong.test.js` 38, `cloud_save_regression.test.js`: PASS.
- Mọi lượt chụp (trước và sau): 0 lỗi trang.
- `python3 game/build.py --hai-tep`: **người chơi tải 17,14 / 20 MB** (sau khi kéo phiên vẽ tay 8 gộp: 16,80; phiên này +0,34 MB). Nhóm "Vùng Sông sâu" 0,41 MB.
- `python3 game/build.py`: bản một tệp **30,26 / 30 MB — vượt trần 0,26 MB**. Bản này chỉ dùng cho trang công cụ (web chạy bản hai tệp), build vẫn ra tệp.
  Nếu cần xuống dưới trần: giảm màu tấm quái (ảnh sẽ kém hơn) hoặc bỏ bớt ảnh cũ `-muotcu` khỏi bản một tệp.

## Tệp

- `game/art/custom/`: `raiCa`, `diaTrau`, `baBa`, `cocTia`, `gd-nen-song-san0/1/2/-nhan`, `gd-nen-song-san-tl`, `hu-ngu-tinh-mo-man` (`.sprite.json`).
- Mã: `sprite_custom.js` (cờ `?quaisongmoi=0`), `vung4.js` (không nhuộm quái có ảnh thật), `thuong_luong.js` (sân ảnh, `?santl=0`),
  `monster_art.js` (Ngư Tinh xuất hiện, `?ngumoman=0`).
- `../vung-4-quai/cong-cu/dung-song.py`: chỉnh cấu hình 4 con (khung đánh, cỡ, Đỉa không "bơi").
- `docs/anh-goc/quai-moi/dong-tac/<mã>-*-cat/`: khung đã cắt (+ `bao-cao.json` mỗi hàng).
- Thư mục này: `cong-cu/` (`cat-6-hang.py`, `dung-nen.py`, `dung-ngu-tinh.py`, `soat.py`), `anh-soat/`.
- `game/dist/*`: dựng lại.
