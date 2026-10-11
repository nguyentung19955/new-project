# Đợt 5 — Vũ khí khớp tay thân AI theo từng khung (2b) + điểm neo đỉnh đầu cho 13 mũ (3a) + tệp ghép cho 3 em bé còn lại

Quyết định của chủ dự án (09:47, 11/10): **1a** (giữ sân 300, không làm gì thêm), **2b**, **3a**. Đọc `CHUNG.md`, `QUYET-DINH-Q1-Q6.md` mục Q1 + II + IV, `docs/review/ke-hoach-cai-thien/dot-3/bao-cao.md` (mục 5, 6, 8 — hiện trạng và số đo đã có, script trong `dot-3/kiem/`), `docs/review/ghep-trang-bi/DINH-DANG-GHEP.md` (định dạng `ghep-<key>`: `diem`, `diem_theo`, `cap[mã].theo` — KHÔNG đổi định dạng, chỉ được **thêm** trường tuỳ chọn và ghi vào báo cáo). Dự kiến 2–3 giờ. Tệp được sửa: `game/art/custom/ghep-smith.sprite.json` (đã có), **tạo mới** `ghep-hunter`, `ghep-healer`, `ghep-wrestler` (chỉ số, không ảnh); 13 tệp `game/art/custom/tp-hats-*.sprite.json` **chỉ thêm** `trang_phuc.diem.dinh_dau` (và `gay` nếu đo được) — không đổi ảnh, không đổi trường cũ; `game/js/sprite_custom.js` và `game/js/hero_tinhlinh.js` chỉ nếu cần đọc `cap[vk].theo` cho vũ khí (đọc `DINH-DANG-GHEP.md` mục 2 và 4: `cap` áp cho cả vũ khí qua `theo` theo khung); `tools/tach-ghep/index.html` (chỉnh/soi vũ khí theo khung, đặt điểm neo mũ, xuất tệp). KHÔNG đổi đòn đánh, hitbox, thời gian, `vu_khi.cam/mui/day` của tệp vũ khí.

## 1. Vũ khí khớp tay (2b)
Hiện trạng (dot-3 mục 6.4): thân AI đánh 6 khung kiểu vung tay; kiếm chạy theo 10 khung chém của bộ xương code → lệch ở `tele` (lấy đà: kiếm sau lưng), `atk` khung 0–1 (kiếm trên đầu khi tay đưa trước), `hit` (kiếm lơ lửng cách người 4 px). Đứng/chạy/lăn/ngã ổn.

Làm:
1. Trong `ghep-<key>.sprite.json`, dùng `cap` với khoá là **loại vũ khí** (`vk-sword`, `vk-bow`, `vk-spear`, `vk-hammer` — áp cho mọi dòng và mọi hệ của loại đó; nếu định dạng hiện chỉ nhận mã tệp đầy đủ thì **thêm** quy ước "khoá tiền tố" và ghi vào báo cáo + `DINH-DANG-GHEP.md`), `theo` theo khung: `"tele:3"`, `"atk:0"`, `"atk:1"`, `"hit:0"`… với `dx`, `dy`, `xoay`. Chỉ đổi **vị trí/góc vẽ** của vũ khí; tầm đòn, hitbox, thời điểm gây sát thương giữ nguyên (kiểm bằng so số liệu `kiem.py` của dot-3 và bot ải 1).
2. Đo cho **4 em bé × 4 loại vũ khí** = 16 bộ số. Cách đo: với mỗi em bé, lấy điểm `tay_truoc` của thân AI ở từng khung (đo như dot-3 đã đo đầu/eo), dời điểm cầm vũ khí tới đó, xoay theo hướng cẳng tay nếu đọc được. Soi mắt trên ảnh phóng 4×.
3. Đòn đánh có 3 kiểu chém dùng chung số theo khung (dot-3 mục 8.1b) → chỉnh được phần nào ghi phần đó; khung nào không chỉnh được thì ghi rõ trong báo cáo, không cố.
4. Trang Ghép đồ: thêm chọn vũ khí + chọn khung, kéo để chỉnh `dx/dy/xoay`, nút "Xuất tệp ghép" ra đúng `ghep-<key>.sprite.json`; nạp sẵn số đã có.

## 2. Điểm neo đỉnh đầu cho 13 mũ (3a)
- Với mỗi `tp-hats-*.sprite.json`: thêm `trang_phuc.diem.dinh_dau = [x, y]` (toạ độ trên ảnh mũ, điểm ảnh game, tính từ góc trên-trái ảnh — xem `DINH-DANG-GHEP.md` mục 3) và `co_chuan`. Cách đo: điểm giữa mép dưới vành mũ (chỗ đặt lên đỉnh đầu). Có thể đo tự động (giữa cột có điểm ảnh ở hàng dưới cùng của phần vành) rồi soi mắt từng mũ, ảnh phóng 4× lưu `anh/mu-13.png`.
- Khi mũ có `dinh_dau` và thân có `dinh_dau` (Cu Tí đã có; 3 em bé còn lại làm ở mục 3), game đặt theo quy tắc 2 của `DINH-DANG-GHEP.md` mục 4 (một điểm chung → dời trùng). **Kiểm**: 13 mũ × Cu Tí ở `idle:0` không lệch so với cách đặt cũ quá 1 px (nếu lệch nhiều hơn → cách cũ sai hay số mới sai? soi và ghi), và qua 7 hàng không nhảy.
- Trang Ghép đồ: cho đặt/chỉnh `dinh_dau` của mũ bằng chạm, xuất lại tệp mũ **giữ nguyên mọi trường cũ và ảnh** (so byte phần `anh` trước/sau phải giống hệt).

## 3. Tệp ghép cho Cu Tèo, Cái Bống, Cu Lì
- Làm theo đúng cách dot-3 đã làm cho Cu Tí (`dot-3/kiem/quan.py`, `taoghep.py`): `diem` ở `idle:0`, `diem_theo` cho `lung`, `goc_canh`, `eo`, `dinh_dau`, `tay_truoc` theo khung. Lưới 7 hàng × 3 em bé với 1 mũ + 1 đồ lưng + 1 bùa + 1 cánh + vũ khí quen tay (Cu Tèo cung, Cái Bống giáo, Cu Lì búa) → `anh/ghep-<key>-7-hang.png`.

## Nghiệm thu
- 16 bộ số vũ khí: ở `tele` cuối, `atk:0–1`, `hit` vũ khí nằm trong tay (lệch ≤ 1 px game) cho ít nhất 12/16; phần còn lại ghi rõ.
- Số liệu đòn (tầm, thời điểm sát thương) **không đổi**: so với bản trước bằng script; bot ải 1 vẫn thắng.
- 13 mũ có `dinh_dau`; ảnh và trường cũ trong tệp mũ không đổi (so byte).
- 4 lưới 7 hàng (Cu Tí cập nhật + 3 em bé mới) không có lớp nào nhảy/rụng.
- Không có tệp `ghep-*` → game y hệt cũ (so ảnh = 0 điểm ảnh khác).
- `node --check`, `python3 game/build.py`, workflow xanh. Báo cáo `docs/review/ke-hoach-cai-thien/dot-5/bao-cao.md` theo mục IV; cách quay lui: xoá tệp `ghep-*` mới / `git revert` từng commit.
