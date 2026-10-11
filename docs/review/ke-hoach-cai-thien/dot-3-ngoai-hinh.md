# Đợt 3 — Ngoại hình theo áo của bộ (Q1) + kiểm chứng ghép lớp rời

Đọc `CHUNG.md`, `QUYET-DINH-Q1-Q6.md` mục Q1, `KE-HOACH.md` Phần 1-A và Phần 2 dòng A, `docs/review/ghep-trang-bi/DINH-DANG-GHEP.md` (định dạng điểm neo — KHÔNG đổi), `docs/review/bo-trang-phuc/bao-cao.md` (12 thân theo bộ `em-be-<key>-<rung|bien|lau>`). Dự kiến 2 giờ. Tệp được sửa: `game/js/outfit.js` (`O.look` :222–266, chỗ đặt `L.fx.bo` :244), `game/js/sprite_custom.js` (`SC.boCua/SC.thanBo/SC.cuaEmBe` :231–233, `AN_BO` :427/:443), `game/js/hero_tinhlinh.js` (`outfitOf` :589–603, `lopDo` :1269) chỉ nếu cần, `tools/tach-ghep/index.html` (hiển thị đúng quy tắc mới trong xem thử). KHÔNG đổi schema `save.outfit.wear`, KHÔNG đổi `.sprite.json`, KHÔNG sửa ảnh trong `game/art/custom`.

## Hiện trạng
- `wear` có 5 ô: hat, robe, back, hand, wing. `L.fx.bo = <bộ>` chỉ khi mặc ≥ 3 món cùng bộ (:244). Thân theo bộ chọn qua `em-be-<key>-<bo>` → lùi `em-be-<key>` → thân code. Thân theo bộ ẩn mũ/lưng/bùa rời (`AN_BO`). Áo rời không vẽ lên thân AI. Chưa có tệp thân theo bộ nào (code sẵn, chờ ảnh).

## Làm
1. **Áo là điều kiện kích hoạt**: bộ của thân = bộ của **áo đang mặc** (`wear.robe` → bộ của món đó). Không còn ngưỡng 3 món. Không mặc áo → thân gốc `em-be-<key>`. Giữ `L.fx.bo` cũ cho hiệu ứng "đủ bộ" (hạt, vầng sáng) nếu nó còn dùng ở chỗ khác — tách thành hai khái niệm: `bo_than` (theo áo) và `du_bo` (≥ 3 món) — không đổi hành vi của `du_bo`.
2. **Ẩn/hiện lớp rời khi dùng thân theo bộ**: chỉ ẩn những lớp **cùng bộ với áo** (vì thân đã vẽ sẵn mũ/lưng cùng bộ); mũ/lưng/bùa/cánh **khác bộ** vẫn vẽ rời bằng điểm neo. Đọc lại `AN_BO` và sửa theo quy tắc này. Cánh luôn vẽ rời (thân bộ không vẽ cánh — xác nhận trong `bo-trang-phuc/bao-cao.md`; nếu khác thì theo tài liệu đó).
3. **Dự phòng**: không có tệp `em-be-<key>-<bo>` → thân gốc + lớp rời như hiện nay (áo không thấy). Ghi rõ trong báo cáo đây là hành vi tạm cho tới khi có 12 ảnh.
4. **Kiểm chứng ghép lớp rời** (Đợt 3 của KE-HOACH): tạo bản lưu THỬ cho Cu Tí (`smith`) mặc 1 mũ AI có `diem.dinh_dau`, 1 đồ lưng AI, cầm 1 kiếm AI; dùng trang `tach-ghep` hoặc Playwright chụp **8 hàng động tác** (`idle, move, tele, atk, hit, die, ne, noi`) từng khung, ghép thành một ảnh lưới `anh/ghep-cu-ti-8-hang.png`. Soi: lệch > 1 px game, rụng, sai thứ tự lớp, lăn (`ne`) phải ẩn mũ/cánh, `die` đồ xoay cùng thân. Lệch thì sửa `diem_theo` trong tệp `ghep-smith.sprite.json` (tạo nếu chưa có — đây là tệp dữ liệu hiệu chỉnh, không phải ảnh đã duyệt) và ghi số đã sửa.
5. **Mô phỏng thân theo bộ** để kiểm luồng 1–3 mà không có ảnh thật: nhân bản tạm `em-be-smith.sprite.json` thành `em-be-smith-rung.sprite.json` **chỉ trong thư mục tạm/khi chạy thử** (không commit), mặc áo bộ Rừng → thân đổi ngay; tháo áo → về thân gốc; mặc thêm mũ khác bộ → mũ hiện; mũ cùng bộ → ẩn. Chụp từng bước.
6. Trang `tach-ghep`: phần xem thử dùng đúng quy tắc mới (áo chọn thân), đổi chữ hướng dẫn nếu có.

## Nghiệm thu (mục Q1 của quyết định)
- Mặc áo bộ → thân đổi ngay (không cần mũ/lưng); tháo áo → đúng trạng thái theo đồ còn lại.
- Mũ, lưng, cánh, bùa không mất, không vẽ trùng (thân bộ + lớp rời cùng bộ), không sai lớp.
- Chỉ số/hitbox/sát thương không đổi: chụp bảng chỉ số trước/sau khi đổi áo, số giống nhau.
- Ảnh lưới 8 hàng của Cu Tí với mũ + kiếm + lưng, không lệch > 1 px.
- `node --check`, `python3 game/build.py`, không có tệp mới → game y hệt cũ (so ảnh = 0 điểm ảnh khác).

Báo cáo: `docs/review/ke-hoach-cai-thien/dot-3/bao-cao.md` + `anh/`.
