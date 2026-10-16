# Báo cáo dọn tệp 16/10/2026

## Tóm tắt

- **Chưa xoá được tệp nào.** Bộ an toàn của phiên này chặn lệnh `git rm`. Theo yêu cầu, tôi dừng xoá và không tìm cách khác.
- Đã lập xong danh sách cần xoá: **1 408 tệp, 229 MB**. Danh sách đầy đủ và 3 lệnh xoá nằm ở `xoa-16-10.md`, để phiên điều phối chạy.
- Mọi tệp .md (báo cáo, YEU-CAU, QUYET-DINH) đều **giữ**. Chỉ xoá ảnh, GIF và script soát của các việc đã xong trước 15/10.

## Sẽ xoá (chờ phiên điều phối)

| Nhóm | Tệp | Dung lượng |
|---|---|---|
| 1. Thư mục chủ đề cũ `docs/<tên>` (8–13/10: phac-thao, vfx, xuong-sprite, ghep-2, giao-dien-va-lang, hanh-trang…) | 482 | 77,2 MB |
| 2. `docs/review/<việc cũ>` (10–12/10: anh, ghep-trang-bi, concept, kiem-thu-12-10, trai-nghiem, ngon-ngu…) | 374 | 62,5 MB |
| 3. `docs/review/ke-hoach-cai-thien/<việc cũ>` (11–14/10: dot-1…dot-11, full-audit, zed-chay-danh, zed-asset, trum-moi, dang-chay…) | 552 | 89,6 MB |
| **Tổng** | **1 408** | **229 MB** |

Ví dụ lớn: ảnh soát `docs/phac-thao` 34 MB, `docs/review/ghep-trang-bi` 15 MB, `docs/review/anh` 13 MB, `ke-hoach-cai-thien/trum-moi` (ảnh xem trước) 11 MB, `docs/vfx` 10 MB, `docs/review/concept` 10 MB, `ke-hoach-cai-thien/zed-chay-danh` 8 MB, `ke-hoach-cai-thien/zed-asset` 8 MB (bảng tham khảo kiểu Zed pixel cũ).

## Đã kiểm thế nào

- `game/build.py`, workflow `.github` **không đọc gì trong `docs/`** (chỉ nhắc trong ghi chú).
- Test chỉ đọc 2 tệp trong `docs/`: `kiem-can-bang/luu-A.json` và `kiem-thu-12-10/srv.py`. Cả hai được giữ.
- Mỗi tệp trong danh sách đã grep: đường dẫn và tên tệp không có trong code game, công cụ, test, script đang giữ, `docs/ke-hoach`, `docs/cot-truyen`, báo cáo/QUYET-DINH từ 15/10. Không tệp nào có commit trong 26 giờ qua. Tệp nào còn nghi ngờ thì giữ (127 ảnh/script nhỏ có tên trong script khác).
- **Thử trước trên bản chép không có thư mục `docs/` nào** (chỉ để lại 2 thư mục test cần): `python3 game/build.py` và `--hai-tep` chạy được; `node --check game/js/*.js` không lỗi; `cloud_save_regression` PASS, `vung4` PASS 38, `luyen` PASS 81, `thuong_luong_3c` PASS 34.
- `viec_ngay`, `su_kien`, `so_yeu_quai`, `thanh_tuu` **báo SAI ngay trên nhánh hiện tại** (chưa xoá gì), kết quả y hệt bản chép. Lỗi có sẵn, không do dọn tệp. Có lẽ do thay đổi "mở hệ thống dần" (Tư vấn 1, 16/10). Việc sửa thuộc phiên khác.
- Không chơi thử game.

## Giữ, vì sao

| Phần giữ | Lý do |
|---|---|
| Cả `docs/anh-goc/**` (1,7 GB) | Là ảnh gốc / mẫu / prompt mà các script dựng đang đọc: `zed/trang-phuc`, `zed/moi`, `zed/hieu-ung` do `dung-zed-game.py` và `cat_phi_tieu.py` đọc; `quai-moi`, `trum-moi`, `npc-moi`, `hieu-ung-ky-nang`, `nen-phong` là nguồn của kế hoạch Bước 3. `bia`, `truyen`, `giao-dien`, `mau-tu-the` là nguồn của kế hoạch Không pixel. `buoc-2`, `ep-do`, `bao-truoc`, `soat-muot` đều có script cắt đi kèm. Các thư mục 16/10 (`cu-ti-hang-moi-16-10`, `ve-tay-8-dot-1`, `ve-tay-8-gop`, `zed/moi16`, `zed/gan-vk`, `vung-4`) đang dùng. |
| Mọi thư mục báo cáo từ 15/10 | Theo quy tắc. Gồm `con-ve-tay*`, `gen-gop`, `hang-moi-16-10`, `luyen-vu-khi`, `kiem-can-bang`, `soat-muot`, `vu-khi-*`, `vung-4-*`, `tu-van-*`, `quai-moi-*`… |
| `docs/ke-hoach/**`, `docs/cot-truyen/**`, `docs/khung-que-8-huong` | Theo quy tắc, đang dùng. |
| `tools/*` (3,4 MB) | Tất cả đang dùng: workflow đăng `tach-*` và `xuong-sprite`; `anh-truyen`, `can-bang`, `ngon-ngu` có phiên sửa 15–16/10. |
| `game/tests` | Test đang chạy. |
| Mọi tệp .md trong thư mục cũ | Nhỏ, dùng để tra cứu. Ảnh nhúng trong các tệp đó sẽ không còn hiện sau khi xoá. |
| `art/` ở gốc (28 KB), không có script rời ở gốc repo | Quá nhỏ, workflow có nhắc. |

## Việc cho phiên điều phối

Chạy 3 lệnh `git rm --pathspec-from-file=…nhom{1,2,3}.txt` trong `xoa-16-10.md` (mỗi nhóm một commit). Sau đó chạy lại build + `node --check` + `cloud_save_regression`. Thư mục làm việc giảm khoảng 229 MB. `.git` không nhỏ đi vì lịch sử vẫn giữ tệp.
