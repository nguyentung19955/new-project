# Báo cáo: 3 bạn nhỏ phong cách Zed (Cu Tèo, Cái Bống, Cu Lì) — 14/10

Commit: **`8025db6`** (nhánh `khoi-tao-du-an`, rebase lên `3f48d47`).

Cách kiểm: không chạy game, không Playwright. Chỉ xử lý ảnh, ảnh soát tĩnh, `node --check` toàn bộ `game/js/*.js` và `python3 game/build.py --hai-tep`.

Những thứ không đổi: luật, số, `firebase-config.js`, đăng nhập Google, lưu mây, `?cloud=0`.

## 1. Sprite mới (`cong-cu/dung-ban-nho.py`)
- Nguồn: khung đã cắt `em-<mã>-1-dung-cat` / `em-<mã>-2-ngoi-cat`. Dùng lại `thu()` và `luu_png()` của `dung-npc.py`.
- Thay `em-be-hunter|healer|wrestler.sprite.json` (`phien_ban: 2`):
  - 2 hàng × 6 khung. Hàng 0 **đứng** (`idle`, 1,2 s lặp), hàng 1 **ngồi** (`ngoi`, 1,2 s lặp).
  - Ảnh nét ×2, bảng 96 màu.
  - `move` / `tele` / `atk` / `hit` / `die` / `ne` trỏ về hàng đứng, nên code cũ không vỡ.
  - `khoac_do: false`, `nhun_buoc: false`.
- Ảnh nhìn sang phải, giữ quy ước lật cũ (không ghi `huong`).
- **Cỡ**: cao đứng 31 = Zed mới.
- **Hàng ngồi** co theo tỉ lệ SIFT so với hàng đứng: Tèo 0,888, Bống 1,096, Lì 0,953. Đầu ngồi bằng đầu đứng.

| | Ô khung | Gốc | Cao đứng | Cao ngồi | PNG |
|---|---|---|---|---|---|
| Cu Tèo (hunter) | 30×33 | 13,32 | 31 | 26 | 14,5 KB |
| Cái Bống (healer) | 24×33 | 13,32 | 31 | 24 | 13,3 KB |
| Cu Lì (wrestler) | 30×34 | 15,32 | 31 | 25 | 12,9 KB |

- **Neo**:
  - Đáy chân hoặc mông nằm trên đường đất.
  - Hàng đứng: neo ngang theo giữa dải chân.
  - Hàng ngồi: neo ngang theo giữa phần đầu + mình (55% trên), vì dải đáy lẫn cung, giỏ, chân duỗi.
- Ảnh soát: `xem-ban-nho.png`. Zed và 3 bạn được vẽ cùng tỉ lệ: đứng / ngồi, khung 1, khung 4 và khung lật. Vạch vàng = cao 31.

## 2. Code
- `sprite_custom.js`:
  - Thêm động tác `ngoi` (ANIMS, LOOP) và `sp.caoNgoi`.
  - `SC.caoNgoi(key)` trả 0 nếu chưa có ảnh ngồi.
  - `SC.chonEmBe`: khi có `o.ngoi` thì chọn hàng ngồi.
- `village_scene.js`:
  - Ba bạn ở sân đình (`seats()`) dùng hàng **ngồi**, không còn nhúc nhích chân.
  - Bong bóng tên nằm theo chiều cao ngồi.
  - Chưa có ảnh thì giữ như cũ.
- `truyen.js` (nền `emBe` / `hoi`, lời thoại `ai: hunter|healer|wrestler`):
  - Dùng hàng **đứng**.
  - Không vẽ thêm vũ khí cho 3 bạn ảnh mới, vì các bạn đã tự cầm cung / giỏ lá trong ảnh.
- Các chỗ khác dùng hàng đứng như cũ: bảng Ông Từ "Ba bạn dạy Zed" (`village.js`), truyện.

## 3. Dung lượng (`build.py --hai-tep`)
| | Trước (bao-cao.md) | Sau |
|---|---|---|
| 3 tệp em-be (JSON) | 159 KB | 56 KB |
| Bản một tệp | 21,32 MB | 21,22 MB / 30 |
| Ảnh máy chủ PNG + WebP | 25,82 MB | **25,68 MB** / 26 (còn 0,32 MB) |

Ảnh mới nhỏ hơn ảnh cũ 7 hàng nên tổng dung lượng giảm. Lần này chưa phải nén thêm. Đợt sau thêm ảnh thì có thể hạ trùm vùng xuống 96 màu hoặc cắt viền trống ô khung.

## Cần chủ dự án xem khi chơi
1. **Sân đình**:
   - Ba bạn ngồi ở chỗ cũ (`B.be`). Bạn nào ở bên phải đình thì quay mặt sang trái.
   - Cung của Cu Tèo và giỏ của Cái Bống chìa ra một bên, có thể chạm chỗ bạn bên cạnh (cách nhau 20 điểm).
   - Chưa cứu thì bạn hiện mờ 0,45 như cũ.
2. **Bảng Ông Từ**: ô chân dung 30×30 mà bạn đứng cao 31, nên đỉnh tóc có thể bị cắt 1 điểm.
3. **Cảnh truyện "hội"**: chú thích code ghi "ngồi quanh Cụ Đồ", nhưng theo yêu cầu thì 3 bạn **đứng** và không còn vũ khí vẽ thêm. Zed vẫn cầm kiếm như cũ.
4. **Hoạt ảnh**: hàng đứng / ngồi chạy 6 khung, 1,2 s. Ở sân đình các bạn luôn ngồi, kể cả lúc Zed tới gần.
